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
import { pmissiles, missiles } from '../core/world.js';
import { popup, explodeAt, columnaBomba, proj } from '../core/fx.js';
import { T } from '../core/i18n.js';
import { P } from '../data/palette.js';
import { BL } from '../data/blanco.js';
import { BOMBA_PANZA, BOMBA_DERIVA } from '../data/tuning.js';
import { blanco, resetBlanco, altoEn, zonaEn, predecir, AGUA } from '../core/blanco.js';
import { SHIP_CLASS } from '../data/ships.js';
import { cargaDe } from '../data/cargas.js';
import { buqueTanque } from '../core/nafta.js';
import { beep, boom } from './audio.js';

let objetivo = 0;   // objectiveDist de la corrida: el buque pasa por el avion cuando dist llega ahi
let mslAntes = 0;   // para notar la suelta: la bomba que falta desde el cuadro anterior
// LA GEOMETRIA DE LA CAMARA (la profundidad del avion y el ancho del mundo). Llega por parametro
// porque vive en render/ctx.js y un sistema nuevo no puede importar render (`npm run lint:layers`).
let PZ = 14, W = 480;

/** Prepara (o apaga) el buque para esta corrida. Lo llama game.js donde se define el objetivo. */
export function preparar(on, nombre, objectiveDist, geo, carga, opts) {
  resetBlanco(on, nombre, SHIP_CLASS[nombre]);
  const o = opts || {};
  blanco.pasadas = o.pasadas > 0 ? o.pasadas : BL.PASADAS;
  blanco.conVuelta = !!o.vuelta;
  if (geo) { PZ = geo.PZ; W = geo.W; }
  objetivo = objectiveDist;
  cargaId = carga;
  if (on) armar();
}

let cargaId = null;
/** Cuelga la carga entera: la del centro (siempre, es la del buque) y la del ala. `run.msl` sigue
 *  siendo el total, que es lo que el resto del juego sabe leer. */
function armar() {
  const c = cargaDe(cargaId);
  blanco.ala = c.ala; blanco.alaN = c.ala === 'bomba' ? 2 : 0; blanco.centroN = 1;
  run.msl = mslAntes = blanco.alaN + blanco.centroN;
}

/** El buque esta a tiro: a la vista, entero o no, y el ataque todavia no termino. Es lo que
 *  DESBLOQUEA la bomba del centro. */
const aTiro = () => blanco.on && blanco.z > PZ && blanco.z < BL.VISIBLE_Z && blanco.negroT < 0 && !blanco.hundido;

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
  if (!blanco.on || blanco.hundido) return false;
  // EL CRUCE se mide contra el buque de cada cuadro: la bomba venia MAS CERCA que el casco y
  // termino MAS LEJOS. Con la bomba a ~420/s de cierre y una manga de 8, medir "esta adentro"
  // se la saltaria entera en un cuadro.
  if (!(z0 < blanco.zPrev && pm.z >= blanco.z)) return false;
  const h = altoEn(pm.x);
  if (h < 0) return false;                                   // cruzo por fuera de la eslora
  if (pm.y > AGUA + h) {                                     // por encima: se la lleva el mar de atras
    if (!pm.larga) { pm.larga = true; veredicto('larga', pm.x, pm.y, blanco.z, P.dim); }
    return false;
  }
  const zn = zonaEn(pm.x);
  // UN TANQUE SOLTADO (PLAN_NAFTA_ALCANCE N6) no tiene espoleta que despertar: pega por lo que pesa y
  // por lo que lleva. Lleno vale una bomba y revienta; vacio vale media y no enciende nada — el PAR
  // vacio al centro es lo que lo hunde.
  const f = pm.tanque ? buqueTanque(pm.tanque) : 1;
  if (!pm.tanque && (pm.t || 0) < BL.ARMA_T) {
    // LA BOMBA QUE NO DESPERTO: pega, rebota en la chapa y no pasa nada. Chispas y un golpe seco —
    // el sonido de haber hecho todo bien menos la altura.
    veredicto('dormida', pm.x, pm.y, blanco.z, P.warn);
    explodeAt(pm.x, pm.y, blanco.z, false, true, true);
    beep(1400, 0.05, 'square', 0.05, -600);
    return true;
  }
  if (pm.tanque === 'vacio') explodeAt(pm.x, pm.y, blanco.z, false, true, true);   // chapa contra chapa
  else { explodeAt(pm.x, pm.y, blanco.z, true); columnaBomba(pm.x, AGUA, blanco.z, true); }
  blanco.lento = true;   // MOMENTUM OBLIGADO: de aca al cruce, el mundo a BL.LENTO
  blanco.marcas.push({ x: pm.x, y: Math.max(AGUA + 1, pm.y), t: run.t });
  blanco.dano += (zn === 'centro' ? BL.DANO_CENTRO : BL.DANO_EXTREMO) * f;
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

/** La bomba `pm` toco el agua. Si fue ANTES del buque, se lo dice: "corta" es la mitad de la
 *  lectura — sin esto errar por corto y errar por largo se ven igual. */
export function corta(pm) {
  if (!blanco.on || blanco.hundido || pm.larga || pm.z >= blanco.z) return;
  if (Math.abs(pm.x - BL.X) > BL.LEN / 2 + 12) return;
  veredicto('corta', pm.x, AGUA, pm.z, P.dim);
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
  // EL NEGRO ES TREGUA: lo que no se ve no puede matarte. Saltar el buque puede dejarte arriba del
  // techo del radar, y un misil lanzado ahi pegaba en pleno negro (medido: derribo sin ver nada).
  // Mientras dura el negro —y su apertura— no hay misiles en vuelo y el radar no carga.
  if (blanco.negroT >= 0 || blanco.salidaT >= 0) { missiles.length = 0; run.detection = 0; }
  // EN EL NEGRO, UN PISO: sin ver nada nadie maneja, y sin piso el avion se iba solo al agua en pleno
  // negro (medido). Va ANTES del negro sostenido, que sale temprano. Fuera del negro no hay piso: el
  // salto es del jugador.
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
    const escape = blanco.hundido && blanco.conVuelta;
    if (escape) blanco.escapando = true;
    else {
      blanco.negroT = 0;
      if (blanco.hundido) blanco.pendiente = 'hundido';
      else {
        blanco.pasada++;
        // EN UNA MISION (una pasada por avion): errar no decide aca —decide game.js si queda un
        // avion en la fila (`enFila`) o si es la derrota. Con varias pasadas (la prueba t16), la de
        // siempre: el re-encare, hasta que se acaben.
        blanco.pendiente = blanco.pasadas === 1 ? 'errado'
          : blanco.pasada >= blanco.pasadas ? { fallo: 'death_suelta' } : 'reencare';
      }
    }
    // EL SALTO (lo hace el jugador, 23/9): por debajo de la silueta del buque te llevas los palos.
    // No mata en el acto —es el roce de las antenas, no chocar el casco—: es un golpe de chapa, y
    // game.js decide si el avion aguanta o se cae. Por encima, o por la proa o la popa, limpio.
    const h = altoEn(plane.x), roce = h >= 0 && plane.y < AGUA + h
    // …y el piso del negro: donde quedaste, y si rozaste, del otro lado de los palos (en el escape
    // no hay negro ni piso: el avion es tuyo desde el primer cuadro)
    if (!escape) blanco.altPiso = Math.max(plane.y, 6, roce ? AGUA + h + 1 : 0);
    else if (roce) plane.y = Math.max(plane.y, AGUA + h + 1);
    if (roce) { seña('roce'); return { roce: 'death_palos', escape }; }
    return escape ? 'escape' : null;
  }
  // LA PREDICCION, una vez por cuadro: la leen las señas de Puma y el HUD (lo que titila en verde).
  blanco.pred = aTiro() && !blanco.lento && run.msl > 0
    ? predecir(plane.x, plane.y - BOMBA_PANZA, plane.vy, plane.vx * BOMBA_DERIVA, run.spd, blanco.z) : null;
  blanco.listo = blanco.pred === 'centro' || blanco.pred === 'extremo';
  if (!blanco.hundido && !blanco.lento) señas();
  return null;
}

/** EL SIGUIENTE EN LA FILA toma la pasada: el buque queda a `BL.FILA_M` —el de atras venia a
 *  segundos— y el avion trae su carga entera. El relevo (game.js) cuenta el cambio de mando. */
export function enFila() {
  run.dist = objetivo - BL.FILA_M;
  blanco.z = blanco.zPrev = PZ + BL.FILA_M;
  armar();
  pmissiles.length = 0;
  for (const k in blanco.dicho) delete blanco.dicho[k];
  blanco.dicho.asoma = 1;   // el buque ya esta encima: no hay "ahi esta"
  blanco.res = '';
}

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
  if (blanco.negroT >= 0) return 1;
  if (blanco.salidaT >= 0) return 1 - blanco.salidaT / BL.SALIDA_T;
  const d = blanco.z - PZ;
  if (d <= 0) return 0;
  return Math.max(0, Math.min(1, 1 - d / (run.spd * BL.FUNDIDO_T)));
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
  if (d < 900) {
    if (plane.y < BL.ALT_IDEAL[0]) seña('sube');
    else if (plane.y > BL.ALT_IDEAL[1]) seña('baja');
  }
  if (d < 700) {
    if (blanco.listo) seña('solta');
    else if (blanco.pred === 'corta' && plane.y >= BL.ALT_IDEAL[0]) seña('espera');
  }
}

/** El estado crudo, para la sonda `__suelta` (solo lectura). */
export const estado = () => blanco;

/** Lo que el HUD necesita, ya calculado (el render no puede llamar a este modulo): si es el momento
 *  de soltar (todo lo que titila en verde) y el ESTANTE — que hay en cada pilon. */
export function hud() {
  if (!blanco.on) return null;
  const vivo = !blanco.hundido && !blanco.lento && blanco.negroT < 0;
  return {
    listo: vivo && blanco.listo,
    enAtaque: vivo && aTiro(),
    rack: { ala: blanco.ala, alaN: blanco.alaN, centroN: blanco.centroN, bloqueada: !aTiro() },
    // LA ALTURA DEL SALTO: desde que soltaste hasta el cruce, cuanto mide el buque justo debajo de
    // tu linea — por encima de eso pasas limpio. La marca amarilla del altimetro.
    salto: blanco.negroT < 0 && blanco.z > PZ && (blanco.dicho.sali || blanco.lento)
      ? AGUA + Math.max(0, altoEn(plane.x)) : null,
  };
}
