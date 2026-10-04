// LA SUELTA SOBRE EL BUQUE — el sistema (docs en data/blanco.js).
//
// Corre DENTRO del estado 'play': no hay `enter()`, no hay fundido, no hay escena. El buque
// aparece en el horizonte del mismo pasillo que venias volando y se viene encima como cualquier
// obstaculo. Lo unico que cambia es que al final del pasillo hay algo que embocar.
//
// MISMA REGLA DEL LIMITE que todos los sistemas: `step()` devuelve señal —'hundido', 'reencare' o
// { fallo }— y game.js decide. `golpe()` y `corta()` los llama collision.js, que es quien ya mueve
// las bombas: aca solo se juzga lo que la bomba hizo.
import { plane } from '../core/state.js';
import { run } from '../core/run.js';
import { pmissiles, missiles, obstacles } from '../core/world.js';
import { popup, explodeAt, columnaBomba, proj, onda, estallido } from '../core/fx.js';
import { T } from '../core/i18n.js';
import { P } from '../data/palette.js';
import { BL } from '../data/blanco.js';
import { BOMBA_PANZA, BOMBA_DERIVA } from '../data/tuning.js';
import { blanco, resetBlanco, altoEn, zonaEn, predecir, holgura, AGUA, TIERRA } from '../core/blanco.js';
import { SHIP_CLASS } from '../data/ships.js';
import { estructura } from '../data/estructuras.js';
import { cargaDe } from '../data/cargas.js';
import { bombaInfo, chanceDetona } from '../data/bombas.js';
import { buqueTanque } from '../core/nafta.js';
import { beep, boom } from './audio.js';

let objetivo = 0;   // objectiveDist de la corrida: el buque pasa por el avion cuando dist llega ahi
let mslAntes = 0;   // para notar la suelta: la bomba que falta desde el cuadro anterior
// LA GEOMETRIA DE LA CAMARA (la profundidad del avion y el ancho del mundo). Llega por parametro
// porque vive en render/ctx.js y un sistema nuevo no puede importar render (`npm run lint:layers`).
let PZ = 14, W = 480;

/** Prepara (o apaga) el buque para esta corrida. Lo llama game.js donde se define el objetivo.
 *  `opts.piso` es la altura del suelo debajo del blanco (`alturaBlanco()` de la geografia): solo la
 *  usa una ESTRUCTURA (data/estructuras.js) — un buque flota, y su piso es siempre el agua. */
export function preparar(on, nombre, objectiveDist, geo, carga, opts) {
  const o = opts || {};
  const est = estructura(nombre);
  if (est) resetBlanco(on, nombre, est.clase, 'estructura', (o.piso || 0) + TIERRA);
  else resetBlanco(on, nombre, SHIP_CLASS[nombre]);
  blanco.pasadas = o.pasadas > 0 ? o.pasadas : BL.PASADAS;
  // LA DIFICULTAD LA PONE LA MISION, no el jugador (decision del autor, 26/9): el campo
  // `dificultad:` de su renglon en data/missions.js. Una mision sabe si es la primera del juego o
  // la ultima, y el aviso de la suelta es parte de como esta escrita — no una preferencia que se
  // elige en OPCIONES. Sin campo, NORMAL.
  holguraMax = BL.HOLGURA[o.dificultad] === undefined ? BL.HOLGURA.normal : BL.HOLGURA[o.dificultad];
  // LA BOMBA DE LA MISION (data/bombas.js): su espoleta y su parte de la holgura. La MK-17 achica la
  // ventana (se emboca de milagro); la BRP la agranda y arma antes.
  const bi = bombaInfo(o.bomba);
  blanco.bomba = o.bomba && bombaInfo(o.bomba) === bi ? o.bomba : 'brp';
  blanco.armaT = bi.armaT;
  fallidas = 0;   // corrida nueva: la racha arranca de cero
  holguraMax *= bi.holgura;
  spdPrev = -1; spdRate = 0;   // corrida nueva: el acelerador de la anterior no cuenta
  blanco.conVuelta = !!o.vuelta;
  if (geo) { PZ = geo.PZ; W = geo.W; }
  objetivo = objectiveDist;
  cargaId = carga;
  if (on) armar();
}

let cargaId = null;
// EL PRESUPUESTO DE ENVION de esta mision (ver BL.HOLGURA). Se resuelve UNA vez al preparar y no
// cada cuadro: el nombre de la dificultad no cambia a mitad de un vuelo.
let holguraMax = BL.HOLGURA.normal;
// A QUE RITMO VIENE CAMBIANDO LA VELOCIDAD (unidades/s²), suavizado. Lo lee la prediccion: sin
// esto la luz verde suponia velocidad constante y mentia cuando el jugador venia acelerando (ver
// la nota de la aceleracion en core/blanco.js). Suavizado porque `run.spd` se mueve a saltos de un
// cuadro y una derivada cruda haria parpadear la ventana sin que pase nada.
let spdPrev = -1, spdRate = 0;
const SPD_SUAVE = 0.12;   // segundos de la media movil: corto, para que meter turbo se note ya
/** Cuelga la carga entera: la del centro (siempre, es la del buque) y la del ala. `run.msl` sigue
 *  siendo el total, que es lo que el resto del juego sabe leer. */
function armar() {
  const c = cargaDe(cargaId);
  blanco.ala = c.ala; blanco.alaN = c.ala === 'bomba' ? 2 : 0; blanco.centroN = 1;
  blanco.tuvoVentana = false;   // pasada nueva: la ventana de la anterior no cuenta
  blanco.perdidaT = -1;
  run.msl = mslAntes = blanco.alaN + blanco.centroN;
}

/** El buque esta a tiro: a la vista, entero o no, y el ataque todavia no termino. Es lo que
 *  DESBLOQUEA la bomba del centro. */
// (HUNDIDO TAMBIEN, 29/9: si el que lo hundio se estrello en el cruce, el siguiente de la fila
// vuelve a encarar el mismo buque —ardiendo— y cada bomba que le pega suma puntos)
const aTiro = () => blanco.on && blanco.z > PZ && blanco.z < BL.VISIBLE_Z && blanco.negroT < 0
  && blanco.perdidaT < 0 && !blanco.escapando;

/** LA SUELTA pide una bomba (tecla de soltar). Con el buque a tiro sale la del CENTRO primero —la
 *  del buque—; si no, una del ala. La del centro NUNCA sale lejos del buque: esta bloqueada para
 *  eso y nada mas. Devuelve false si no hay nada que soltar (vacio o solo queda la bloqueada). */
export function tomarBomba() {
  if (aTiro() && blanco.centroN > 0) blanco.centroN--;
  else if (blanco.alaN > 0) blanco.alaN--;
  else return false;
  run.msl = blanco.alaN + blanco.centroN;
  return true;
}
/** Solo queda la bomba del buque, y el buque no esta a tiro. */
export const bloqueada = () => blanco.on && blanco.alaN === 0 && blanco.centroN > 0 && !aTiro();

/** RF-01 de la PASADA, reusado: el ultimo tramo se vacia y lo unico adelante es el blanco. */
export const spawnsCut = dist => blanco.on && !blanco.escapando && dist >= objetivo - BL.VISIBLE_Z * 0.6;
// (…y NO en el escape: ahi lo que siembran las estrellas es justamente lo que hay que esquivar)

/** Una seña para Puma, una sola vez por pasada. */
const seña = c => { if (!blanco.dicho[c]) { blanco.dicho[c] = 1; blanco.cues.push(c); } };

/** Las señas pendientes, y se vacian (game.js las pasa a la radio). */
export const cues = () => blanco.cues.splice(0);

const veredicto = (clave, x, y, z, col) => {
  blanco.res = clave; blanco.resT = run.t;
  seña(clave);
  // ¡HUNDIDO! NO SE ESCRIBE (pedido del autor, 23/9: "el texto hundido quitalo"): lo cuentan la
  // explosion, la camara lenta y Puma. Los demas veredictos si, porque dicen para donde corregir.
  if (clave === 'hundido') return;
  const s = proj(x, y, z);
  popup(Math.max(40, Math.min(W - 40, s.x)), s.y - 14, T('bl_' + clave), col);
};

/** La bomba `pm` se movio este cuadro desde `z0`. Si cruzo el casco, la juzga y devuelve true
 *  (collision.js la da por terminada). */
export function golpe(pm, z0) {
  if (!blanco.on || blanco.escapando) return false;
  // EL CRUCE se mide contra el buque de cada cuadro: la bomba venia MAS CERCA que el casco y
  // termino MAS LEJOS. Con la bomba a ~420/s de cierre y una manga de 8, medir "esta adentro"
  // se la saltaria entera en un cuadro.
  if (!(z0 < blanco.zPrev && pm.z >= blanco.z)) return false;
  const h = altoEn(pm.x);
  if (h < 0) return false;                                   // cruzo por fuera de la eslora
  if (pm.y > blanco.base + h) {                              // por encima: se la lleva el mar de atras
    if (!pm.larga) { pm.larga = true; veredicto('larga', pm.x, pm.y, blanco.z, P.dim); }
    return false;
  }
  const zn = zonaEn(pm.x);
  // UN TANQUE SOLTADO (PLAN_NAFTA_ALCANCE N6) no tiene espoleta que despertar: pega por lo que pesa y
  // por lo que lleva. Lleno vale una bomba y revienta; vacio vale media y no enciende nada — el PAR
  // vacio al centro es lo que lo hunde.
  const f = pm.tanque ? buqueTanque(pm.tanque) : 1;
  if (!pm.tanque && (pm.t || 0) < blanco.armaT) {
    // LA BOMBA QUE NO DESPERTO: pega, rebota en la chapa y no pasa nada. Chispas y un golpe seco —
    // el sonido de haber hecho todo bien menos la altura.
    veredicto('dormida', pm.x, pm.y, blanco.z, P.warn);
    explodeAt(pm.x, pm.y, blanco.z, false, true, true);
    beep(1400, 0.05, 'square', 0.05, -600);
    return true;
  }
  const bi = bombaInfo(blanco.bomba);
  // LA MK-17 ARMADA TAMPOCO ES SEGURA — detona segun lo que cayo (30/9, `pDet`; 29/9: "generalmente no explotan, y las que
  // embocaban no detonaban o detonaban luego"). Se sortea al pegar: estalla, estalla DESPUES, o se
  // queda adentro del casco sin detonar. Las dos ultimas CUENTAN como ataque cumplido — el piloto
  // hizo todo bien; fallo la bomba, como en la guerra — y no hunden en el acto.
  if (!pm.tanque && !blanco.hundido) {
    const r = sorteo(pm.t || 0);
    if (r !== 'explota') {
      explodeAt(pm.x, pm.y, blanco.z, false, true, true);   // chispas contra la chapa, nada mas
      beep(900, 0.06, 'square', 0.05, -500);
      blanco.lento = true; blanco.cumplido = true;
      run.score += BL.PTS_AVERIA;
      if (r === 'tarde') {
        const [a, b] = bi.tardeT;
        blanco.tardeT = a + Math.random() * (b - a);
        blanco.tardeX = pm.x; blanco.tardeY = Math.max(blanco.base + 1, pm.y);
      }
      // DOS FALLAS DISTINTAS para Puma: si cayo lo que tenia que caer, "fue la bomba" (la
      // frustracion, sin consejo que dar); si cayo poco, que la suelte mas alto y mas temprano.
      const bien = (pm.t || 0) >= bi.pDet[2];
      veredicto(bien ? 'falla' : 'fallacaida', pm.x, pm.y, blanco.z, P.warn);
      return true;
    }
  }
  if (pm.tanque === 'vacio') explodeAt(pm.x, pm.y, blanco.z, false, true, true);   // chapa contra chapa
  else estalla(pm.x, pm.y, !pm.tanque && bi.grande);
  blanco.lento = true;   // MOMENTUM OBLIGADO: de aca al cruce, el mundo a BL.LENTO
  blanco.cumplido = true;
  blanco.marcas.push({ x: pm.x, y: Math.max(blanco.base + 1, pm.y), t: run.t });
  // YA HUNDIDO (lo pego otro de la fila antes): el impacto suma puntos y fuego, nada mas
  if (blanco.hundido) {
    run.score += BL.PTS_AVERIA;
    boom(0.12); run.shake = Math.min(8, run.shake + 2);
    return true;
  }
  const dano = pm.tanque ? (zn === 'centro' ? BL.DANO_CENTRO : BL.DANO_EXTREMO) : bi.dano[zn];
  blanco.dano += dano * f;
  if (blanco.dano >= 100) {
    blanco.hundido = true; blanco.sinkT = 0;
    run.score += BL.PTS_HUNDIDO;
    veredicto('hundido', pm.x, pm.y, blanco.z, P.accent);
    boom(0.2); run.shake = Math.min(8, run.shake + 3);
  } else {
    run.score += BL.PTS_AVERIA;
    veredicto('averiado', pm.x, pm.y, blanco.z, P.accent);
  }
  return true;
}

/** QUE HACE LA ESPOLETA de una bomba que pego armada tras caer `t` segundos: 'explota', 'tarde' o
 *  'falla'. La sonda `?espoleta=explota|tarde|falla` lo fija (para probar cada caso sin sortear).
 *
 *  UN DADO DE VERDAD (30/9, el autor: "la idea es transmitir la frustracion — aunque hagas todo
 *  bien, la bomba no detonaba"): la chance sale de lo que cayo (`chanceDetona`) y las rachas malas
 *  son parte del diseño. El unico tope es `racha` (data/bombas.js): tantas armadas seguidas sin
 *  detonar, y la siguiente detona. Un segundo dado dice cual de las que detonan lo hace TARDE. */
function sorteo(t) {
  let q = null; try { q = new URLSearchParams(location.search).get('espoleta'); } catch (e) { }
  if (q === 'explota' || q === 'tarde' || q === 'falla') return q;
  const bi = bombaInfo(blanco.bomba);
  const topo = bi.racha > 0 && fallidas >= bi.racha;
  if (!topo && Math.random() >= chanceDetona(blanco.bomba, t)) { fallidas++; return 'falla'; }
  fallidas = 0;
  return Math.random() < bi.tarde ? 'tarde' : 'explota';
}
let fallidas = 0;   // armadas seguidas que no detonaron (ver `racha` en data/bombas.js)

/** LA BOMBA QUE REVIENTA EN EL CASCO. `grande` es la de la BRP (pedido del autor 29/9: "EXPLOSION
 *  VISIBLE en el barco, con sonido explosivo y todo"): la bola, la onda y una cadena de secundarias
 *  que viajan con el buque — las mismas del derribo (core/fx.js), que ya saben ir con el mundo. */
function estalla(x, y, grande) {
  // (la columna es de AGUA contra un buque y de TIERRA contra una estructura: el ultimo parametro)
  const B = blanco.base, agua = blanco.tipo !== 'estructura';
  explodeAt(x, y, blanco.z, true); columnaBomba(x, B, blanco.z, agua);
  // LA ZONA Y EL BOQUETE (pedido del autor 30/9): lo que revento se puede atravesar — pero no recien
  // reventado (la zona, ESTALLIDO en data/tuning.js) — y esa franja del casco deja de ser palos
  const bi = bombaInfo(blanco.bomba);
  estallido(x, Math.max(B + 1, y), blanco.z, bi.onda);
  blanco.boquetes.push({ x, r: bi.boquete });
  if (!grande) return;
  onda(x, Math.max(B + 1, y), blanco.z);
  // LA BOLA GRANDE, bien por encima de la de siempre: a 130 de distancia la comun es un punto
  obstacles.push({ type: 'airboom', x, y: Math.max(B + 3, y + 4), z: blanco.z, boomT: 0, scale: 2.4, done: true });
  // …y las secundarias corriendo por la eslora, cada vez mas lejos del impacto
  for (let i = 0; i < 7; i++) obstacles.push({
    type: 'sec', done: true,
    x: x + (i % 2 ? 1 : -1) * (4 + i * 4 + Math.random() * 4), y: B + 2 + Math.random() * 10, z: blanco.z,
    t: 0.1 + i * 0.13 + Math.random() * 0.08, grande: i < 4,
  });
  obstacles.push({ type: 'humo', done: true, x, y: B - AGUA, z: blanco.z, humoT: 0, humoMax: 8 });
  boom(0.28); run.shake = Math.min(9, run.shake + 5);
}

/** LA MK-17 QUE DETONA DESPUES: corre su reloj y, al cumplirse, revienta donde pego y lo hunde —
 *  este o no el buque todavia a la vista. */
function tarde(dt) {
  if (blanco.tardeT < 0) return;
  blanco.tardeT -= dt;
  if (blanco.tardeT > 0) return;
  blanco.tardeT = -1;
  if (blanco.hundido) return;
  if (blanco.z > PZ) { estalla(blanco.tardeX, blanco.tardeY, false); blanco.marcas.push({ x: blanco.tardeX, y: blanco.tardeY, t: run.t }); }
  blanco.dano = Math.max(blanco.dano, 100);
  blanco.hundido = true; blanco.sinkT = 0;
  run.score += BL.PTS_HUNDIDO - BL.PTS_AVERIA;   // la averia ya la habia cobrado al pegar
  // a la vista, el cartelito sobre el buque; ya cruzado, solo lo canta Puma
  if (blanco.z > PZ) veredicto('tarde', blanco.tardeX, blanco.tardeY, blanco.z, P.accent);
  else { blanco.res = 'tarde'; blanco.resT = run.t; seña('tarde'); }
  boom(0.2); run.shake = Math.min(8, run.shake + 3);
}

/** `x` cae en una franja del casco que una explosion ya volo (ver `estalla`). */
const enBoquete = x => blanco.boquetes.some(b => Math.abs(x - b.x) <= b.r);

/** La bomba `pm` toco el agua. Si fue ANTES del buque, se lo dice: "corta" es la mitad de la
 *  lectura — sin esto errar por corto y errar por largo se ven igual. */
export function corta(pm) {
  if (!blanco.on || blanco.escapando || pm.larga || pm.z >= blanco.z) return;
  if (Math.abs(pm.x - BL.X) > BL.LEN / 2 + 12) return;
  veredicto('corta', pm.x, blanco.base, pm.z, P.dim);
}

/** Un cuadro. Devuelve 'hundido' (el ataque termino y lo hundiste), 'reencare' (termino sin
 *  hundirlo y arranca otra pasada) o { fallo } (se acabaron las pasadas). Las tres llegan DESPUES
 *  del negro sostenido: el cruce no resuelve nada en el acto, primero se deja leer a Puma. */
export function step(dt) {
  if (!blanco.on) return null;
  // DONDE DEBERIA ESTAR segun el odometro. El buque se mueve como el mundo (a `run.spd`), pero si
  // el odometro SALTA —una sonda, un relevo— se resincroniza: sin esto, un salto al final de la
  // mision dejaba el buque a veintinueve kilometros.
  const segunOdo = PZ + objetivo - run.dist;
  if ((blanco.z === 0 && blanco.zPrev === 0) || Math.abs(blanco.z - segunOdo) > 60) blanco.z = blanco.zPrev = segunOdo;
  blanco.zPrev = blanco.z;
  blanco.z -= run.spd * dt;
  if (blanco.hundido) blanco.sinkT += dt;
  tarde(dt);
  // EL NEGRO ES TREGUA: lo que no se ve no puede matarte. Saltar el buque puede dejarte arriba del
  // techo del radar, y un misil lanzado ahi pegaba en pleno negro (medido: derribo sin ver nada).
  // Mientras dura el negro —y su apertura— no hay misiles en vuelo y el radar no carga.
  if (blanco.negroT >= 0 || blanco.salidaT >= 0 || blanco.perdidaT >= 0) { missiles.length = 0; run.detection = 0; }
  // EN EL NEGRO, UN PISO: sin ver nada nadie maneja, y sin piso el avion se iba solo al agua en pleno
  // negro (medido). Va ANTES del negro sostenido, que sale temprano. Fuera del negro no hay piso: el
  // salto es del jugador.
  // EL MOMENTO PERDIDO: fundido a negro con el avion en piloto automatico, subiendo solo. El
  // piloto automatico ES el piso de siempre, que en vez de quedarse quieto sube: el avion no puede
  // estar por debajo, asi que se lo lleva para arriba sin tocar flight.js. Y no se evalua nada mas
  // —ni cruce, ni prediccion, ni señas—: la pasada ya se decidio, esto es solo su salida.
  if (blanco.perdidaT >= 0) {
    blanco.perdidaT += dt;
    blanco.altPiso = Math.max(blanco.altPiso, plane.y) + BL.PERDIDA_SUBE * dt;
    plane.y = Math.max(plane.y, blanco.altPiso);
    plane.vy = Math.max(plane.vy, BL.PERDIDA_SUBE);   // que el sprite cabecee para arriba, no solo que suba
    // …y cuando el fundido llega a negro, sigue el negro sostenido de siempre, con su `pendiente`
    // ya armado: game.js decide el relevo o la derrota como con cualquier pasada errada.
    if (blanco.perdidaT >= BL.PERDIDA_T) { blanco.perdidaT = -1; blanco.negroT = 0; }
    return null;
  }
  if (blanco.altPiso >= 0) plane.y = Math.max(plane.y, blanco.altPiso);
  // EL FUNDIDO DE SALIDA de una pasada nueva: corre solo, el juego ya sigue.
  if (blanco.salidaT >= 0) { blanco.salidaT += dt; if (blanco.salidaT >= BL.SALIDA_T) blanco.salidaT = -1; }
  // EL NEGRO SOSTENIDO: el cruce ya paso; se espera NEGRO_T con Puma encima y recien ahi se resuelve.
  if (blanco.negroT >= 0) {
    blanco.negroT += dt;
    if (blanco.negroT < BL.NEGRO_T) return null;
    blanco.negroT = -1;
    const r = blanco.pendiente; blanco.pendiente = null;
    blanco.altPiso = -1;   // vuelve el control: la pasada nueva arranca con el negro abriendose
    if (r === 'reencare') otraPasada();
    return r;
  }
  // EL CRUCE: el buque llega a tu profundidad y el ataque TERMINA. Se pasa A TRAVES del casco —no
  // hay choque— porque en Malvinas se le pasaba por encima, rozando los palos (ver "¿SE LE PASABA
  // POR ENCIMA AL BUQUE?" en docs/historia/PREGUNTAS_HISTORICAS.md). El negro tapa el cruce.
  if (blanco.zPrev >= PZ && blanco.z < PZ) {
    blanco.lento = false;
    // …SALVO QUE LO HAYAS HUNDIDO EN UNA MISION CON VUELTA (PLAN_VUELTA_REAL V0): ahi no hay negro.
    // Pasaste a traves y el pasillo sigue: arranca EL ESCAPE. game.js te pone en todas las
    // estrellas y el viraje llega cuando las pierdas. El salto se sigue cobrando igual (abajo).
    // (CUMPLIDO y no HUNDIDO: una MK-17 que pego y no detono tambien cuenta — el ataque se hizo)
    const escape = blanco.cumplido && blanco.conVuelta;
    // HUNDIDO = SIN NEGRO (pedido del autor, 4/10: "si le erre hace fade out, pero si no le erre que
    // no pase nada y me deje seguir"). El negro es para cuando la pasada se perdio; si le pegaste, se
    // resuelve en el acto y la vuelta arranca de corrido. Va despues del salto (abajo): `acierto`.
    let acierto = false;
    if (escape) blanco.escapando = true;
    else if (blanco.cumplido) acierto = true;
    else {
      blanco.negroT = 0;
      {
        blanco.pasada++;
        // EN UNA MISION (una pasada por avion): errar no decide aca —decide game.js si queda un
        // avion en la fila (`enFila`) o si es la derrota. Con varias pasadas (la prueba t16), la de
        // siempre: el re-encare, hasta que se acaben.
        blanco.pendiente = blanco.pasadas === 1 ? 'errado'
          : blanco.pasada >= blanco.pasadas ? { fallo: 'death_suelta' } : 'reencare';
      }
    }
    // EL SALTO (lo hace el jugador, 23/9): por debajo de la silueta del buque chocas con el buque.
    // DESDE EL 29/9 MATA (el autor: "si me choco, que explote el avion"): se pasa A TRAVES del humo y
    // del fuego, pero no de las COSAS FISICAS — la silueta medida de la hoja (`altoEn`), de proa a
    // popa: por encima de lo que hay en esa franja, o por la proa o la popa, limpio. game.js lo
    // resuelve (explota; el siguiente de la fila vuelve a encarar, o se pierde).
    // (…salvo por un BOQUETE: donde revento una bomba se pasa entre el humo y el fuego)
    const h = altoEn(plane.x), roce = h >= 0 && plane.y < blanco.base + h && !enBoquete(plane.x)
    // …y el piso del negro: donde quedaste, y si rozaste, del otro lado de los palos (en el escape
    // no hay negro ni piso: el avion es tuyo desde el primer cuadro)
    // (…y si le pegaste pero te comiste los palos, vuelve el camino de siempre: negro y 'hundido'
    // pendiente, que es lo que el relevo de game.js espera para cerrar del otro lado)
    if (acierto && roce) { blanco.negroT = 0; blanco.pendiente = 'hundido'; }
    const conNegro = !escape && (!acierto || roce);
    if (conNegro) blanco.altPiso = Math.max(plane.y, 6 + blanco.base - AGUA, roce ? blanco.base + h + 1 : 0);
    else if (roce) plane.y = Math.max(plane.y, blanco.base + h + 1);
    if (roce) { seña('roce'); return { roce: 'death_palos', escape }; }
    return escape ? 'escape' : acierto ? 'hundido' : null;
  }
  // LA PREDICCION, una vez por cuadro: la leen las señas de Puma y el HUD (lo que titila en verde).
  // el ritmo del acelerador, antes de cualquier prediccion de este cuadro
  if (spdPrev < 0 || dt <= 0) { spdPrev = run.spd; spdRate = 0; }
  else {
    const k = Math.min(1, dt / SPD_SUAVE);
    spdRate += ((run.spd - spdPrev) / dt - spdRate) * k;
    spdPrev = run.spd;
  }
  const puede = aTiro() && !blanco.lento && run.msl > 0;
  const hit = r => r === 'centro' || r === 'extremo';
  const vxB = plane.vx * BOMBA_DERIVA;
  // LA VENTANA ES DE DISTANCIA, NO DE TU ALTURA (26/9/2026). La primera version la definia con la
  // prediccion REAL —tu altura y tu trepada de este cuadro—, y el autor la jugo asi: "volando sin
  // turbo aparecio UN SEGUNDO la mira y al toque me tiro pantallazo negro". Entraste medio fuera
  // de altura, la ventana abrio un instante, cerro, y eso ya contaba como "se te paso".
  //
  // Ahora se pregunta con una REFERENCIA ESTABLE: tu altura llevada a la banda ideal, y sin
  // trepada. Asi la ventana depende de DONDE ESTA EL BUQUE y de tu velocidad — lo que el autor
  // llama "la ventana de distancia ideal"— y no parpadea por un tiron del morro. Tu altura queda
  // para lo suyo: decidir si esa ventana esta VERDE o sigue ROJA con la flecha.
  const [a0, a1] = altIdeal();
  const yRef = Math.max(a0, Math.min(a1, plane.y)) - BOMBA_PANZA;
  const pRef = puede ? predecir(plane.x, yRef, 0, vxB, run.spd, blanco.z, spdRate) : null;
  blanco.enDist = puede && (hit(pRef) || holgura(plane.x, yRef, 0, vxB, run.spd, blanco.z, holguraMax, spdRate) !== null);
  blanco.buenaAlt = plane.y >= a0 && plane.y <= a1;
  // LO REAL, con tu altura y tu trepada: es lo que decide el envion que se le cuelga a la bomba, y
  // lo que leen las señas de Puma. Verde exige que TAMBIEN esto pegue — si no, la mira prometeria
  // una bomba que despues se queda corta.
  blanco.pred = puede
    ? predecir(plane.x, plane.y - BOMBA_PANZA, plane.vy, vxB, run.spd, blanco.z, spdRate) : null;
  blanco.extra = puede && !hit(blanco.pred)
    ? holgura(plane.x, plane.y - BOMBA_PANZA, plane.vy, vxB, run.spd, blanco.z, holguraMax, spdRate)
    : 0;
  // VERDE = en la ventana de distancia, a buena altura, y una suelta ahora pega de verdad
  blanco.listo = blanco.enDist && blanco.buenaAlt && blanco.extra !== null;
  if (blanco.enDist) blanco.tuvoVentana = true;
  // TE ACERCASTE DEMASIADO (pedido del autor, 26/9): "si la ventana verde se pierde porque me
  // acerque demasiado, se mete FADE, se quita la UI y queda solo el avion volando". Es la unica
  // forma de perder la pasada sin soltar, y se mide con la MISMA referencia estable: la ventana de
  // distancia se cerro, y del lado CERCANO — soltar ahi a la altura ideal ya pasaria por arriba del
  // casco ('larga') o llegaria sin armar ('dormida'). Del lado lejano (todavia 'corta') no pasa nada:
  // eso es que la ventana no llego, no que se fue.
  //
  // Y la bomba del centro SIGUE COLGADA: si la soltaste, el desenlace lo decide ella, aunque
  // termine en el agua.
  const cerca = puede && !blanco.enDist && (pRef === 'larga' || pRef === 'dormida');
  // (con el buque ya hundido no hay pasada que perder: la mision ya esta cumplida, y este avion solo
  // suma si le pega)
  if (blanco.tuvoVentana && cerca && blanco.centroN > 0 && !blanco.cumplido) {
    blanco.perdidaT = 0;
    blanco.altPiso = plane.y;
    blanco.pasada++;
    // EL MISMO `pendiente` que el cruce: game.js no se entera de que el desenlace llego antes
    blanco.pendiente = blanco.pasadas === 1 ? 'errado'
      : blanco.pasada >= blanco.pasadas ? { fallo: 'death_suelta' } : 'reencare';
    return null;
  }
  if (!blanco.lento) señas();
  return null;
}

/** EL ENVION que le corresponde a una bomba soltada en ESTE cuadro (ver `holgura`). game.js se lo
 *  suma al `vz` de la bomba al descolgarla, y de ahi en mas no la toca nadie: es una correccion en
 *  el gancho, no un guiado en el aire. 0 cuando la balistica pura ya pegaba o cuando no hay suelta. */
// SOLO CON VERDE: en rojo la bomba sale como siempre, balistica pura. Si no, una suelta en rojo
// podia pegar gracias a la holgura, y el color del corchete dejaria de significar algo.
export const envion = () => (blanco.on && blanco.listo && blanco.extra > 0 ? blanco.extra : 0);

/** El MOMENTO PERDIDO esta corriendo: fundido y piloto automatico (game.js apaga el HUD entero). */
export const perdida = () => blanco.on && blanco.perdidaT >= 0;

/** EL SIGUIENTE EN LA FILA toma la pasada: el buque queda a `BL.FILA_M` —el de atras venia a
 *  segundos— y el avion trae su carga entera. El relevo (game.js) cuenta el cambio de mando. */
export function enFila() {
  // (tambien despues de un choque en el cruce: el escape y el negro que ese cruce habia armado se
  // desarman — el que viene encara de nuevo)
  blanco.escapando = false; blanco.lento = false; blanco.negroT = -1; blanco.salidaT = -1;
  blanco.pendiente = null; blanco.altPiso = -1;
  run.dist = objetivo - BL.FILA_M;
  blanco.z = blanco.zPrev = PZ + BL.FILA_M;
  armar();
  pmissiles.length = 0;
  for (const k in blanco.dicho) delete blanco.dicho[k];
  blanco.dicho.asoma = 1;   // el buque ya esta encima: no hay "ahi esta"
  blanco.res = '';
}

/** El buque, donde el odometro dice (lo usa el REBOBINADO del relevo, que mueve `run.dist` a mano). */
export function alOdometro() { blanco.z = blanco.zPrev = PZ + objetivo - run.dist; }

/** OTRA PASADA, armada detras del negro: el buque vuelve al horizonte con su daño encima. */
function otraPasada() {
  run.dist = objetivo - BL.REENCARE_M;
  blanco.z = blanco.zPrev = PZ + BL.REENCARE_M;
  armar();   // el avion siguiente del escuadron, con su carga entera
  pmissiles.length = 0;
  for (const k in blanco.dicho) delete blanco.dicho[k];
  blanco.dicho.asoma = 1;   // "sigue a flote, otra pasada" ya lo dice: no pisarla con "ahi esta"
  blanco.cues.push('reencare');
  blanco.salidaT = 0;
}

/** Estamos en EL ESCAPE (PLAN_VUELTA_REAL V0): el buque quedo atras hundido, y el pasillo sigue
 *  hasta que pierdas las estrellas. */
export const escapando = () => blanco.on && blanco.escapando;

/** EL VIRAJE: se termino el escape. El buque sale de escena del todo —ni dibujo, ni alarma, ni
 *  HUD—: lo que sigue es la vuelta. */
export function terminarEscape() { blanco.escapando = false; blanco.on = false; }

/** El factor del reloj del mundo: BL.LENTO desde el impacto armado hasta el cruce, 1 si no. */
export const slow = () => blanco.on && blanco.lento ? BL.LENTO : 1;
/** LA ALARMA DEL BUQUE: suena desde el primer impacto armado (el loop `alarm` de data/sfx.js, el
 *  que usaba el MOMENTUM viejo). Se calla sola cuando el vuelo termina. */
export const alarma = () => blanco.on && blanco.dano > 0;

/** Hay camara lenta obligada ahora (para el marco del MOMENTUM, que se dibuja igual). */
export const lento = () => blanco.on && blanco.lento;

/** Cuanto negro va encima del mundo y del HUD (0..1), DEBAJO de la radio: se funde al acercarse
 *  el cruce, se sostiene despues, y se abre al volver a una pasada nueva. */
export function negro() {
  if (!blanco.on) return 0;
  // el momento perdido se FUNDE, no se corta: fue la queja ("pantallazo negro")
  if (blanco.perdidaT >= 0) return Math.min(1, blanco.perdidaT / BL.PERDIDA_T);
  // EL NEGRO DEL CRUCE ENTRA DESPUES DE PASAR (29/9, el autor: "la pantalla negra aparece mucho
  // antes de llegar al limite del barco; deberia dejarme pasar por encima y despues meter el negro").
  // Antes se fundia a negro ANTES del cruce —y con la camara lenta, bastante antes—, asi que el salto
  // sobre el buque se jugaba a ciegas. Ahora el cruce se ve entero y el fundido arranca del otro lado.
  if (blanco.negroT >= 0) return Math.min(1, blanco.negroT / BL.FUNDIDO_T);
  if (blanco.salidaT >= 0) return 1 - blanco.salidaT / BL.SALIDA_T;
  return 0;
}

/** LO QUE CANTA PUMA (pedido del autor, 23/9: "que lo cante Puma por radio"). Cada seña sale UNA
 *  vez por pasada y en el orden en que la aproximacion las pide: asoma el buque, alinearse, subir a
 *  la altura de soltar, esperar, ¡soltar!, y salir. Las lineas estan en data/story.js (AV_T16_*) y
 *  la mision las enchufa por `avisos` — sin ese campo, el sistema señala y nadie habla. */
function señas() {
  const d = blanco.z - PZ;
  const solto = run.msl < mslAntes;
  mslAntes = run.msl;
  // "¡por encima de los palos!" solo si la que salio fue CONTRA EL BUQUE: una de ala soltada a cuatro
  // kilometros no tiene palos que pasar (se vio: Puma lo gritaba al principio de la mision).
  if (solto && d < 900) seña('sali');
  if (blanco.dicho.sali) return;
  if (d < BL.VISIBLE_Z * 0.85) seña('asoma');
  if (d < 1500 && Math.abs(plane.x - BL.X) > BL.LEN * BL.CENTRO) seña('alinea');
  const [a0, a1] = altIdeal();
  if (d < 900) {
    if (plane.y < a0) seña('sube');
    else if (plane.y > a1) seña('baja');
  }
  if (d < 700) {
    if (blanco.listo) seña('solta');
    else if (blanco.pred === 'corta' && plane.y >= a0) seña('espera');
  }
}

/** El estado crudo, para la sonda `__suelta` (solo lectura). */
export const estado = () => blanco;

// SONDA `__bombas()`: las bombas en vuelo —donde estan respecto del blanco y del suelo—. Sin esto,
// "solte en verde y no paso nada" no se puede seguir: la bomba se va de cuadro y no deja rastro.
if (typeof window !== 'undefined') window.__bombas = () => JSON.stringify(pmissiles.map(p => ({
  x: +p.x.toFixed(1), y: +p.y.toFixed(1), z: Math.round(p.z), t: +(p.t || 0).toFixed(2),
  alBlanco: Math.round(blanco.z - p.z), larga: !!p.larga,
})));

/** Lo que el HUD necesita, ya calculado (el render no puede llamar a este modulo): si es el momento
 *  de soltar (todo lo que titila en verde) y el ESTANTE — que hay en cada pilon. */
export function hud() {
  if (!blanco.on) return null;
  const vivo = !blanco.cumplido && !blanco.lento && blanco.negroT < 0 && blanco.perdidaT < 0;
  return {
    listo: vivo && blanco.listo,
    // QUE CORREGIR DE LA ALTURA: -1 hay que BAJAR, 1 hay que SUBIR, 0 estas en la banda.
    // La flecha del buque cambio de oficio (pedido del autor, 26/9): era un "ahi esta" que no
    // decia nada que el buque no dijera solo, y ahora es la unica pista de COMO llegar a poder
    // soltar. Sale de BL.ALT_IDEAL, que es la banda que el altimetro ya pinta de verde: por
    // debajo la bomba no alcanza a armarse (la espoleta), por encima el radar te ve.
    alt: vivo && aTiro()
      ? (plane.y > altIdeal()[1] ? -1 : plane.y < altIdeal()[0] ? 1 : 0) : 0,
    enAtaque: vivo && aTiro(),
    rack: { ala: blanco.ala, alaN: blanco.alaN, centroN: blanco.centroN, bloqueada: !aTiro(), bomba: blanco.bomba },
    // LA ALTURA DEL SALTO: desde que soltaste hasta el cruce, cuanto mide el buque justo debajo de
    // tu linea — por encima de eso pasas limpio. La marca amarilla del altimetro.
    salto: blanco.negroT < 0 && blanco.z > PZ && (blanco.dicho.sali || blanco.lento)
      ? blanco.base + Math.max(0, altoEn(plane.x)) : null,
    // la banda de soltar, en ALTURA DE AVION (el altimetro la pinta de verde): contra una estructura
    // en alto se corre con el piso
    altIdeal: altIdeal(),
  };
}

/** LA BANDA DE SOLTAR contra ESTE blanco. BL.ALT_IDEAL esta medida sobre el agua; una estructura
 *  en una explanada a cuatro metros la corre cuatro metros para arriba — lo que importa es cuanto
 *  cae la bomba hasta el blanco (la espoleta), no la altura sobre el mar. */
export const altIdeal = () => [BL.ALT_IDEAL[0] + blanco.base - AGUA, BL.ALT_IDEAL[1] + blanco.base - AGUA];
