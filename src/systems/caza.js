// LA COLA: los Harriers que te toman la cola durante el PASILLO.
//
// Plan y porque: docs/sistemas/PLAN_HARRIERS_PERSECUCION.md, PLAN A (§3). El §1 es el analisis de
// la dinamica de After Burner — de ahi sale cada regla de abajo — y el §2 la verdad historica que
// la sostiene. El §6 dice lo que NO se hace, y conviene tenerlo a mano al tocar esto.
//
// EL HARRIER NO TE PUEDE PEGAR. Esa es la regla, y no es la misma que "no dispara".
//
// DISPARA Y ERRA. Desde la cola, en mala posicion y apurado, sus rafagas cruzan LEJOS — a trece o
// veinticinco unidades de tu ala, cuando el avion mide cuatro de envergadura util. No hay codigo
// de impacto para esas balas: no te pueden tocar ni por accidente. Son el TELL, y errar es el
// contenido del tell — te dice que lo tenes ahi atras y que todavia no te encontro.
//
// Lo que NO vuelve es el fuego que hacia daño. Cuando lo tuvo, te mataba desde lejos en el
// acercamiento —tres rafagas de 34% de integridad cada una— y el jugador se moria sin haber
// llegado a ver el avion del que se trataba todo. El duelo es una COREOGRAFIA que tenes que poder
// MIRAR. Si algun dia vuelve a tener dientes, que sea de frente y a distancia de ver.
//
// No hay lock-on, no hay tono, no hay recuadro de fijado (§6.1): los A-4 no tenian nada. Los ojos
// y la radio, y a veces ni la radio.
//
// EL CICLO, que es todo el sistema:
//
//     aviso ──> presion ──> sobrepaso ──> ventana ──> recola ──> presion (INFINITO hasta eliminarlo)
//                                                          └──> cayendo (si lo bajaste)
//
//   aviso      LA ENTRADA. Es EL AVION el que avisa: aparece chiquito en el horizonte, viene de
//              frente creciendo y te cruza. Termina cuando te paso — no cuando suena un reloj.
//   presion    LOS TRES AMAGUES. Ya esta en tu cola. Asoma despacio por un costado, se esconde,
//              vuelve (y a partir del segundo te tira y erra), se esconde, y a la TERCERA se
//              compromete. Es el corazon del ritmo y la razon de que exista: ver mas abajo.
//   sobrepaso  el que estaba atras NO se queda atras — te pasa ENORME por un costado y queda
//              adelante. Es la moneda del juego (§1: "el cruce cercano ES el juego").
//   ventana    unos segundos ADELANTE TUYO Y DE COLA, esquivandose: es tu turno de tirarle (H3).
//   recola     desperdiciada la ventana, se hace chiquito hasta el horizonte y vuelve a empezar.
//   cayendo    lo bajaste y todavia no toco el suelo (ver "COMO CAEN").
//
// POR QUE TRES AMAGUES, que es la decision de diseño de todo esto:
//
// Un avion que se te pega y te pasa sin previo aviso no se puede CONTESTAR. No hay nada que
// hacer con el, solo esperar a que ocurra. Tres asomadas legibles convierten la cola en algo que
// el jugador MIRA y ANTICIPA: sabe que hay una tercera, y sabe cuando viene.
//
// Y es el gancho del que va a colgar la maniobra que todavia no existe — la combinacion que te
// deja sacarte de encima al que tenes atras de un golpe. Ese movimiento necesita un BLANCO y un
// MOMENTO, y los amagues son las dos cosas. Por eso `asoma` sale en el snapshot y hay un
// `asomando()` exportado: el dia que la maniobra se escriba, no hay que tocar este archivo.
//
// DE QUE LADO SE LO VE. Una sola regla, y de ella sale el sprite (`deFrente` en el snapshot):
// se lo ve DE FRENTE mientras viene hacia vos (aviso y presion) y DE COLA desde el instante en que
// te pasa hasta que se pierde en el horizonte (sobrepaso, ventana, recola, salida). Nunca al reves.
//
// MULTIPLES HARRIERS SIMULTANEOS. El director sigue sumando Harriers hasta CAZA_DIR_MAX. Cada uno
// cicla independientemente hasta que lo ahuyentes o lo derriben — si no los eliminas, se acumulan
// como moscas. Es la presion dramatica de la cola: el pasillo se llena si no te defendes.

import { plane, stats } from '../core/state.js';
import { run } from '../core/run.js';
import { bullets } from '../core/world.js';
import { popup, proj, chispazo, explodeAt } from '../core/fx.js';
import { T } from '../core/i18n.js';
import { P } from '../data/palette.js';
import { W, PZ } from '../render/ctx.js';
import {
  CAZA_SOL_T, CAZA_PASSES, CAZA_CAP_T, CAZA_WINDOW, CAZA_RAS_ALT, CAZA_HP, CAZA_KILLABLE,
  CAZA_PRES_T, CAZA_AVISO_T, CAZA_OVER_T, CAZA_RECOLA_T, CAZA_SALIDA_T,
  CAZA_Z_COLA, CAZA_Z_FRENTE, CAZA_Z_LEJOS, CAZA_X_COLA,
  CAZA_V_MERGE, CAZA_V_FUGA, CAZA_V_FUGA_MIN,
  CAZA_AMAGUES, CAZA_AMAGUE_T, CAZA_AMAGUE_GAP, CAZA_AMAGUE_TIRA,
  CAZA_Z_ASOMA, CAZA_X_ASOMA, CAZA_X_ESCONDE,
  CAZA_TRAC_V, CAZA_TRAC_N, CAZA_TRAC_GAP, CAZA_MISS,
  CAZA_FINALES, CAZA_CAIDA_G, CAZA_CAIDA_MAX,
  CAZA_SOL_AVISO, CAZA_SOL_POST,
  CAZA_HIT_RX, CAZA_HIT_RY, CAZA_PTS, CAZA_MV_FUERZA,
  CAZA_DIR_D0, CAZA_DIR_FIN, CAZA_DIR_INIT, CAZA_DIR_GAP, CAZA_DIR_MAX, CAZA_DIR_JETS, CAZA_MUDO_P,
} from '../data/tuning.js';
import { beep, boom, duck, sfxOne } from './audio.js';
import { pilotName } from './squad.js';
import { pilotIdx } from '../core/squad.js';

// ---- estado privado ----
// FLOTA DE HARRIERS. Cada elemento es un Harrier independiente que cicla hasta eliminarse.
// `C` es un cursor que apunta al Harrier en proceso durante cazaSystem — las funciones de paso
// (stepSolucion, stepPos, etc.) leen y escriben el cursor sin saber que hay una lista detras.
let fleet = [];
let C = null;

/** Sorteo en un rango [lo, hi]. Se llama al ENTRAR a una fase, nunca por cuadro. */
const entre = ([lo, hi]) => lo + Math.random() * (hi - lo);

// MEDIA ENVERGADURA del Harrier, en unidades de mundo — de donde salen los dos hilos de estela.
// Sale de medir la hoja `jet_rear` (10,5 unidades de ancho util) y descontar lo que el extremo del
// ala se mete para adentro del borde del frame. Vive ACA y no se importa del render: un sistema no
// mira el dibujo (convencion 2). Si algun dia se rehornea el sprite con otra envergadura, este
// numero se toca a mano y a proposito.
const CAZA_SEMI = 4.6;

const miIndicativo = () => pilotName(pilotIdx(run.squad, run.lives));

/** ¿Hay al menos un Harrier corriendo? */
export function active() { return fleet.length > 0; }

/** ARMA UN HARRIER. Lo agrega a la flota — pueden haber varios simultaneos.
 *  `opts.mudo` entra sin aviso por radio. `opts.manso` quedo INERTE desde que el Harrier no
 *  dispara — se conserva porque las sondas y `?caza=manso` lo siguen pasando. */
export function start(opts = {}) {
  const h = {
    fase: 'aviso',
    t: 0,
    dur: CAZA_AVISO_T,
    capT: 0,
    pase: 0,
    mudo: !!opts.mudo,
    manso: !!opts.manso,
    sol: 0,
    px: plane.x, py: plane.y,
    grito: false,
    mvPrev: null,
    hp: 0,
    humo: 0,
    // ENTRA POR EL HORIZONTE, de frente. No aparece pegado a la cola de la nada: el primer ciclo
    // se ve igual que todos los demas (ver "DE QUE LADO SE LO VE" arriba).
    //
    // DOS POSICIONES, no una. `bx`/`by` son la TRAYECTORIA (lo que la fase manda) y `x`/`y` son
    // donde el avion esta DE VERDAD este cuadro: trayectoria + bandeo. Mezclarlas hacia que el
    // bandeo se lerpeara contra si mismo y quedaba un temblor sucio en vez de un avion volando.
    bx: plane.x, by: plane.y,
    x: plane.x, y: plane.y, z: CAZA_Z_LEJOS,
    lado: Math.random() < 0.5 ? -1 : 1,
    seed: Math.random() * 6.283,   // desfase propio: dos Harriers de la flota no bandean igual
    bank: 0, xPrev: plane.x,
    fx: [],
    humoT: 0, estT: 0, tracT: 0,
    // LOS AMAGUES. `amague` cuenta las asomadas hechas, `asoma` dice si esta afuera AHORA y
    // `asomaK` es cuanto (0..1, suavizado) — de ese numero salen la posicion y la visibilidad.
    amague: 0, asoma: false, asomaK: 0, amT: entre(CAZA_AMAGUE_GAP),
    // COMO VA A CAER, sorteado ACA y no al morir: asi el final es del avion y no del momento, y
    // una sonda puede fijarlo antes de matarlo para fotografiar los tres.
    final: CAZA_FINALES[(Math.random() * CAZA_FINALES.length) | 0],
    vyC: 0, vzC: 0,   // velocidad de la caida (ver stepCaida)
    muerto: false,
  };
  fleet.push(h);
  if (!h.mudo) popup(W / 2, 46, T('caza_warn', { c: miIndicativo() }), P.warn);
  return true;
}

/** Corta TODO y olvida lo que el director llevaba contado. */
export function resetCaza() { fleet.length = 0; C = null; D = null; }

// ---------------- H4: EL REGLAMENTO (cuando aparece) ----------------
let D = null;

export function cazaDirector(dt, o) {
  if (!D) D = { hechos: 0, prox: entre(CAZA_DIR_INIT) };
  const int = Math.max(0, Math.min(2, o.intensidad | 0));
  if (!int) return;
  if (D.prox > 0) D.prox -= dt * (0.5 + int * 0.75);
  if (fleet.length >= CAZA_DIR_MAX || D.prox > 0) return;
  if (o.dist < CAZA_DIR_D0) return;
  if (o.jets < CAZA_DIR_JETS) return;
  if (o.meta && o.meta - o.dist < CAZA_DIR_FIN) return;
  if (o.ciego) return;
  if (o.meta && D.hechos >= int) return;
  D.hechos++;
  D.prox = entre(CAZA_DIR_GAP);
  start({ mudo: Math.random() < CAZA_MUDO_P[int] });
}

/** Pasa a la fase `f` con su duracion. */
function ir(f, dur) { C.fase = f; C.t = 0; C.dur = dur; }

function stepSolucion(dt) {
  const quiebre = Math.abs(plane.x - C.px) + Math.abs(plane.y - C.py) * 0.7;
  C.px = plane.x; C.py = plane.y;
  const q = quiebre / Math.max(dt, 1e-4);
  if (q > 9) {
    C.sol = Math.max(0, C.sol - dt * Math.min(6, q / 9) / (CAZA_SOL_T * 0.5));
    if (C.sol < CAZA_SOL_AVISO) C.grito = false;
    return;
  }
  const ras = plane.y <= CAZA_RAS_ALT ? 0.12 : 1;
  C.sol = Math.min(1, C.sol + (dt / CAZA_SOL_T) * ras);

  if (C.fase !== 'presion' && C.fase !== 'aviso') return;
  if (C.sol >= CAZA_SOL_AVISO && !C.grito) {
    C.grito = true;
    if (!C.mudo) popup(W / 2, 46, T('caza_break', { c: miIndicativo() }), P.warn, true);
  }
  if (C.sol >= 1) { C.sol = CAZA_SOL_POST; C.grito = false; }
}

/** UNA RAFAGA QUE ERRA. Sale desde atras tuyo y cruza hacia adelante, a CAZA_MISS unidades de tu
 *  ala — o sea a tres o seis envergaduras. NO HAY CODIGO DE IMPACTO para estas balas y no lo va a
 *  haber: no es que sea dificil que te peguen, es que no pueden. Ver el encabezado del archivo.
 *
 *  Se dispara solo mientras esta ASOMADO, que es lo que la ata al tell: el fuego aparece cuando
 *  aparece el avion, asi que la rafaga no es ruido de fondo — es EL, ahi, ahora. */
function rafaga() {
  const n = Math.round(entre(CAZA_TRAC_N));
  const miss = C.lado * entre(CAZA_MISS);
  for (let i = 0; i < n; i++) {
    C.fx.push({
      k: 'trac',
      x: plane.x + miss + (Math.random() - 0.5) * 4,
      y: plane.y + (Math.random() - 0.5) * 5,
      z: 2,
      wait: i * 0.05,
      vz: CAZA_TRAC_V * (0.94 + Math.random() * 0.12),
      life: 1.6 + i * 0.05,
    });
  }
  beep(1500 + Math.random() * 500, 0.05, 'square', 0.03, 700);
}

// EL FX DEL HARRIER: trazadoras, humo y estela. Las trazadoras son las UNICAS que tienen velocidad
// propia (cruzan hacia adelante); el resto queda en el aire y se lo lleva el mundo a `run.spd`.
function stepFx(dt) {
  for (const f of C.fx) {
    if (f.k === 'trac') {
      if (f.wait > 0) { f.wait -= dt; continue; }
      f.z += f.vz * dt; f.life -= dt;
      continue;
    }
    f.life -= dt; f.z -= run.spd * dt;
  }
  let n = 0;
  for (let i = 0; i < C.fx.length; i++) {
    const f = C.fx[i];
    if (f.life > 0 && f.z < CAZA_Z_LEJOS + 30 && f.z > 1) C.fx[n++] = f;
  }
  C.fx.length = n;
  // LA ESTELA SALE DE LAS PUNTAS DE ALA. Son DOS hilos, no uno: el vortice del extremo del ala es
  // lo que de verdad deja una linea blanca detras de un avion, y sale de ahi y de ningun otro
  // lado. La tobera tiene su llama y se queda en la tobera (render/caza.js).
  //
  // Que sean dos es la mitad del valor: con el alabeo una punta sube y la otra baja, asi que los
  // hilos se cruzan y se abren solos. Un hilo unico al centro no dice nada de como esta virando.
  //
  // Y SE QUEDAN EN EL MUNDO — por eso se les resta `run.spd` como a cualquier cosa del pasillo, y
  // por eso despues los atravesas.
  C.estT -= dt;
  if (C.estT <= 0) {
    C.estT = 0.045;
    const ang = C.bank * 0.95;
    const ca = Math.cos(ang) * CAZA_SEMI, sa = Math.sin(ang) * CAZA_SEMI;
    for (const s of [-1, 1]) C.fx.push({
      k: 'estela', x: C.x + s * ca, y: C.y - s * sa, z: C.z,
      vida0: 0.8, life: 0.8, r: 0.2 + Math.random() * 0.12,
    });
  }
  if (C.humo) {
    C.humoT -= dt;
    if (C.humoT <= 0) {
      C.humoT = 0.05;
      C.fx.push({ k: 'humo', x: C.x + (Math.random() - 0.5) * 1.2, y: C.y + (Math.random() - 0.5) * 1.2,
        z: C.z, life: 1.4 + Math.random() * 0.8, r: 0.8 + Math.random() * 1.2 });
    }
  }
}

/** LOS TRES AMAGUES — el ritmo de la cola, y la razon de que exista (ver el encabezado).
 *
 *  Alterna escondido / asomado, y a la tercera asomada completa deja de amagar: `avanzar` ve el
 *  contador lleno y lo manda al sobrepaso. `asomaK` es el estado suavizado — entrar y salir de
 *  cuadro tardan medio segundo cada uno, y eso es lo que hace que la asomada se LEA como una
 *  maniobra en vez de un parpadeo. LENTO es el pedido: hay que poder verlo llegar.
 *
 *  Desde el segundo amague ademas tira, y ERRA (ver `rafaga`). El fuego arranca 0,25 s despues de
 *  asomar y no en el mismo cuadro: primero se lo ve, despues dispara. Al reves seria una emboscada
 *  con luces. */
function stepAmague(dt) {
  const meta = C.asoma ? 1 : 0;
  C.asomaK += (meta - C.asomaK) * Math.min(1, dt * 3.2);
  if (C.asoma && C.amague + 1 >= CAZA_AMAGUE_TIRA && !C.humo) {
    C.tracT -= dt;
    if (C.tracT <= 0) { C.tracT = entre(CAZA_TRAC_GAP); rafaga(); }
  }
  C.amT -= dt;
  if (C.amT > 0) return;
  if (C.asoma) { C.asoma = false; C.amague++; C.amT = entre(CAZA_AMAGUE_GAP); }
  else { C.asoma = true; C.amT = entre(CAZA_AMAGUE_T); C.tracT = 0.25; }
}

/** Entra a PRESION y rearma el ciclo de amagues. Se llama desde la entrada, desde la recola y
 *  desde la sonda de fases: tres lugares que si no comparten esto se desincronizan. */
function irPresion() {
  ir('presion', 0);   // dur 0 = `avanzar` opina todos los cuadros; el corte lo dan los amagues
  C.amague = 0; C.asoma = false; C.asomaK = 0;
  C.amT = entre(CAZA_AMAGUE_GAP);
  C.presMax = entre(CAZA_PRES_T) * 1.8;   // techo de seguridad, por si un amague queda trabado
}

function golpeDelPase() {
  beep(760, 0.55, 'sawtooth', 0.1, 190);
  boom(0.1, true);
  duck(0.35);
  run.shake = Math.min(8, run.shake + 5);
  for (let i = 0; i < 14; i++) C.fx.push({
    k: 'estela',
    x: plane.x + C.lado * (4 + i * 1.1), y: plane.y + 2.5 + (Math.random() - 0.5) * 1.5,
    z: CAZA_Z_COLA + i * 3.5, life: 0.8 + Math.random() * 0.5, r: 0.5 + Math.random(),
  });
}

// ---------------- H3: EL CONTRAATAQUE ----------------

function stepTiro() {
  if (C.fase === 'cayendo') return;   // ya esta muerto: no se le cobra dos veces el derribo
  if (C.z <= PZ + 6) return;
  for (const b of bullets) {
    if (b.z >= 999) continue;
    if (Math.abs(b.z - C.z) > 6) continue;
    if (Math.abs(b.x - C.x) > CAZA_HIT_RX || Math.abs(b.y - C.y) > CAZA_HIT_RY) continue;
    b.z = 999; C.hp++; stats.hits++;
    chispazo(C.x, C.y, C.z, 'metal');
    beep(300, 0.05, 'triangle', 0.05);
    if (CAZA_KILLABLE && C.hp >= CAZA_HP.derribo) { derribar(); return; }
    if (C.hp >= CAZA_HP.ahuyenta && !C.humo) { ahuyentar(); return; }
  }
}

function ahuyentar() {
  C.humo = 1;
  ir('salida', CAZA_SALIDA_T * 1.6);
  run.score += CAZA_PTS.ahuyenta;
  const s = proj(C.x, C.y, C.z);
  popup(s.x, s.y - 10, '+' + CAZA_PTS.ahuyenta, P.foam);
  popup(W / 2, 46, T('caza_hit'), P.foam);
  sfxOne('exSmall');
}

/** LO BAJASTE. El premio se cobra ACA y no cuando toca el suelo: el jugador tiene que saber que
 *  lo bajo en el instante en que lo baja. Lo que cambia entre un Harrier y otro es lo que se VE
 *  despues, y ese sorteo ya venia hecho desde `start` (ver CAZA_FINALES).
 *
 *  Que no siempre termine igual es el punto. Un desenlace unico se vuelve una animacion que el
 *  jugador deja de mirar a la tercera vez; tres hacen que derribar uno siga siendo un evento —
 *  la primera vez que uno se va girando hasta el agua en vez de reventar, se cuenta. */
function derribar() {
  run.score += CAZA_PTS.derribo;
  const s = proj(C.x, C.y, C.z);
  popup(s.x, s.y - 10, '+' + CAZA_PTS.derribo, P.warn, true);
  popup(W / 2, 46, T('caza_kill'), P.warn);
  stats.air++;
  if (C.final === 'bola') {
    // REVIENTA EN EL AIRE, ahi mismo. No queda nada que seguir: se termina en este cuadro.
    explodeAt(C.x, C.y, C.z, true);
    sfxOne('exHeavy');
    C.muerto = true;
    return;
  }
  // LOS OTROS DOS SE VAN CAYENDO. `pedazos` se ABRE en el aire (reventon grande pero sin bola de
  // fuego: lo que sale es chatarra) y baja rapido y sucio; `caida` solo se apaga — un chispazo, se
  // le va el morro y baja girando entero. Por eso arranca con vyC positivo: todavia trepa un
  // instante por inercia antes de que la gravedad gane, que es lo que lo hace ver PESADO.
  const roto = C.final === 'pedazos';
  explodeAt(C.x, C.y, C.z, roto, true);
  sfxOne(roto ? 'exHeavy' : 'exSmall');
  C.humo = 1;
  C.vyC = roto ? -5 : 3;
  C.vzC = roto ? 40 : 95;
  ir('cayendo', CAZA_CAIDA_MAX);
}

// EL BANDEO: lo que lo hace parecer un avion y no una calcomania que cambia de tamaño.
//
// Se suma A LA TRAYECTORIA, en metros de mundo, y la amplitud CRECE CON LA DISTANCIA. Esto ultimo
// no es un capricho: el tamaño en pantalla va con 1/z, asi que un bandeo de amplitud fija se
// achica junto con el avion y a 300 m no se ve mover un pixel — que es exactamente por lo que la
// entrada parecia una foto alejandose. Escalando con z, lo que queda parejo es el movimiento
// ANGULAR, que es lo que el ojo lee como "ese avion esta volando".
//
// El 0.35 de piso es la otra mitad de la cuenta. El desplazamiento EN PANTALLA es amplitud x k, y
// k va con 1/z: con `esc = 1 + z/120` el bandeo terminaba siendo dieciseis veces mas grande pegado
// a la cola (z 6) que en el horizonte (z 320) — un avion quieto lejos y epileptico cerca. Con
// 0.35 + z/110 la relacion baja a dos, que es lo que corresponde: de cerca se mueve algo mas,
// como pasa de verdad, pero es el mismo avion volando igual.
function bandeo() {
  const s = C.seed, esc = 0.35 + C.z / 110;
  return {
    x: (Math.sin(run.t * 1.7 + s) * 2.2 + Math.sin(run.t * 2.9 + s * 0.5) * 0.8) * esc,
    y: (Math.sin(run.t * 1.15 + s * 2.3) * 1.3 + Math.sin(run.t * 0.63 + s * 1.7) * 0.9) * esc,
  };
}

// LA FUGA, cuando se va ADELANTE tuyo. Aca la velocidad se RESTA y no se suma: vuela en tu mismo
// sentido, asi que lo que se aleja es la diferencia. La consecuencia es la que el jugador espera —
// si lo perseguis con el turbo puesto se aleja mas despacio y le podes tirar mas tiempo— y el piso
// esta para que a fondo no se congele: sin el, con turbo pleno la diferencia daba cero y el
// Harrier se quedaba flotando adelante para siempre.
const fuga = () => Math.max(CAZA_V_FUGA_MIN, CAZA_V_FUGA - run.spd);

/** LA CAIDA. El avion ya esta muerto: aca no se le tira, no se le mide y no decide nada — baja.
 *
 *  Baja con gravedad Y PIERDE VELOCIDAD, asi que ademas de hundirse se va quedando atras: lo pasas
 *  de largo mientras cae. Eso es lo que lo vuelve tuyo y no una animacion en un rincon.
 *
 *  El tumbo sale de sacudir `bank`, no de rotar el sprite. La hoja tiene cinco poses de alabeo y
 *  alternarlas rapido se lee como un avion sin control; rotar un raster chico unos grados a esta
 *  resolucion le ensucia los bordes (la misma leccion que ya esta escrita en render/plane.js). */
function stepCaida(dt) {
  C.vyC -= CAZA_CAIDA_G * dt;
  C.by += C.vyC * dt;
  C.vzC = Math.max(0, C.vzC - 55 * dt);
  C.z += (C.vzC - run.spd) * dt;
  C.bx += C.lado * 5 * dt;                       // se va abriendo: nadie cae en linea recta
  const roto = C.final === 'pedazos';
  C.bank = Math.sin(C.t * (roto ? 13 : 7) + C.seed) * (roto ? 1 : 0.8);
  C.x = C.bx; C.y = C.by;
  if (C.by <= 0.4) {
    // TOCO. Revienta DONDE TOCO y no en el aire — es la mitad del valor de haberlo dejado caer.
    explodeAt(C.bx, 0.6, C.z, true);
    sfxOne('exHeavy');
    run.shake = Math.min(9, run.shake + 4);
    C.muerto = true;
    return;
  }
  // se fue del cuadro por atras, o se acabo el tope: el pasillo se lo traga sin ceremonia
  if (C.z < 1.5 || C.t > CAZA_CAIDA_MAX) C.muerto = true;
}

function stepPos(dt) {
  const f = C.dur > 0 ? Math.min(1, C.t / C.dur) : 1;
  const lerp = (a, b, k) => a + (b - a) * Math.min(1, k * dt);
  if (C.fase === 'cayendo') { stepCaida(dt); return; }
  if (C.fase === 'presion') {
    // EN LA COLA, ASOMANDO. `asomaK` mueve el carril: escondido esta fuera de cuadro (X_ESCONDE,
    // ~413 px del centro) y afuera entra por el borde (X_ASOMA, ~193 px), asi que la asomada es
    // literalmente un avion metiendose en el cuadro por un costado. La z acompaña — asomar es
    // tambien acercarse un poco, y eso hace que crezca mientras entra.
    const k = C.asomaK;
    C.bx = lerp(C.bx, plane.x + C.lado * (CAZA_X_ESCONDE + (CAZA_X_ASOMA - CAZA_X_ESCONDE) * k), 2.6);
    C.by = lerp(C.by, plane.y + 1.2 + k * 0.9, 1.8);
    C.z = lerp(C.z, CAZA_Z_COLA + (CAZA_Z_ASOMA - CAZA_Z_COLA) * k, 2.2);
  } else if (C.fase === 'aviso') {
    C.bx = lerp(C.bx, plane.x + C.lado * CAZA_X_COLA * (1 - C.sol), 1.6);
    C.by = lerp(C.by, plane.y + 1.5, 1.4);
    // VIENE HACIA VOS: cierra a la suma de las dos velocidades, como cualquier cosa del pasillo
    // (collision.js hace `run.spd + 45` con los jets de frente). Antes era un lerp exponencial a
    // tasa fija, y eso tenia dos vicios: el turbo no lo hacia pasar antes —volabas mas rapido y el
    // merge duraba lo mismo, que es imposible— y sobre todo el lerp FRENA cuando llega, asi que
    // los ultimos metros, justo donde el Harrier ocupa media pantalla, los hacia al ralenti y
    // quedaba colgado ahi adelante. Con velocidad constante el tamaño crece como 1/z: chico casi
    // todo el acercamiento y un fogonazo al final, que es como pasa un avion de verdad.
    C.z = Math.max(CAZA_Z_COLA, C.z - (run.spd + CAZA_V_MERGE) * dt);
  } else if (C.fase === 'sobrepaso') {
    const e = Math.pow(f, 2.2);
    C.z = CAZA_Z_COLA + (CAZA_Z_FRENTE - CAZA_Z_COLA) * e;
    C.bx = plane.x + C.lado * (4 + CAZA_X_COLA * 0.20 * (1 - e));
    C.by = plane.y + 1.5 + 3 * e;
  } else if (C.fase === 'ventana') {
    const jink = Math.sin(run.t * 2.3 + C.lado * 3) * 0.7 + Math.sin(run.t * 3.7 + C.lado) * 0.3;
    C.z = lerp(C.z, CAZA_Z_FRENTE + Math.sin(run.t * 1.1 + C.lado) * 14, 1.2);
    C.bx = lerp(C.bx, plane.x + jink * 12, 1.4);
    C.by = lerp(C.by, plane.y + 6 + Math.sin(run.t * 1.8 + C.lado) * 4, 1.3);
  } else if (C.fase === 'recola') {
    // SE VA EN CURVA, no en linea recta hacia el punto de fuga. Antes la x no se tocaba y el
    // Harrier se achicaba clavado en el centro: la lectura era "zoom out", no "se aleja volando".
    C.z += fuga() * dt;
    C.bx = lerp(C.bx, plane.x + C.lado * 34, 0.7);
    C.by = lerp(C.by, plane.y + 4, 0.8);
  } else if (C.fase === 'salida') {
    C.z += fuga() * dt;
    C.by = lerp(C.by, plane.y + 30, 1.2);
    C.bx = lerp(C.bx, plane.x + C.lado * 40, 1.2);
  }
  const b = bandeo();
  C.x = C.bx + b.x;
  C.y = C.by + b.y;
  // ALABEO LEIDO DEL MOVIMIENTO, no sorteado. El sprite tiene cinco poses de alabeo y hasta ahora
  // se elegia con `lado`, que es fijo por pasada: el avion volaba de costado todo el ciclo. Ahora
  // la pose sale de para donde se esta yendo de verdad, asi que el bandeo se VE en el dibujo.
  const vx = (C.x - C.xPrev) / Math.max(dt, 1e-4);
  C.xPrev = C.x;
  C.bank += (Math.max(-1, Math.min(1, vx / 26)) - C.bank) * Math.min(1, dt * 6);
}

/** EL CICLO — infinito hasta que lo elimines. */
function avanzar() {
  if (C.t < C.dur) return false;
  switch (C.fase) {
    case 'aviso':
      // LA ENTRADA TERMINA CUANDO TE PASO, no cuando suena un reloj: con la velocidad de cierre
      // relativa, cuanto tarda depende de a cuanto vayas vos (ver stepPos). CAZA_AVISO_T quedo
      // como MINIMO —el tell no puede durar menos que eso— y el gate de z es el que manda.
      if (C.z > CAZA_Z_COLA + 0.5) return false;
      irPresion();
      return false;
    case 'presion':
      // SE COMPROMETE A LA TERCERA, no a los N segundos: el corte lo da el contador de amagues.
      // El techo de tiempo esta solo por si un amague queda trabado — no es el reloj de la fase.
      if (C.amague < CAZA_AMAGUES && C.t < C.presMax) return false;
      C.pase++;
      ir('sobrepaso', CAZA_OVER_T);
      golpeDelPase();
      return false;
    case 'cayendo':
      return false;   // la caida se termina sola (stepCaida marca `muerto`)
    case 'sobrepaso':
      ir('ventana', CAZA_WINDOW);
      return false;
    case 'ventana':
      C.lado = Math.random() < 0.5 ? -1 : 1;
      ir('recola', CAZA_RECOLA_T);
      return false;
    case 'recola':
      // NO SE REENCOLA HASTA HABERSE IDO DE VERDAD. Cumplido el reloj todavia se le exige estar
      // lejos, porque con la fuga relativa la fase ya no dura siempre lo mismo: si lo perseguis,
      // se aleja mas despacio y te ganaste mas ventana de tiro. Cerrar por reloj lo teletransportaria
      // al horizonte en la cara del que lo estaba alcanzando.
      if (C.z < CAZA_Z_LEJOS * 0.7) return false;
      irPresion();
      return false;
    case 'salida':
      return true;
  }
  return false;
}

function comboFuerza() {
  const mv = run.mv;
  const nueva = mv && mv !== C.mvPrev;
  C.mvPrev = mv;
  if (!nueva || C.fase !== 'presion') return false;
  if (!CAZA_MV_FUERZA.includes(mv)) return false;
  C.sol = 0; C.grito = false;
  return true;
}

/** UN CUADRO de toda la flota. NO devuelve muerte: el Harrier no te mata (ver la nota del encabezado).
 *  La firma sigue siendo la de un sistema que podria devolver una señal, porque `game.js` la lee
 *  igual que las demas y porque el dia que el duelo vuelva a tener dientes entra por aca. */
export function cazaSystem(dt) {
  for (let i = fleet.length - 1; i >= 0; i--) {
    C = fleet[i];
    C.t += dt; C.capT += dt;
    // EL QUE CAE YA NO JUEGA. Ni solucion de tiro, ni combos, ni caja de impacto: esta muerto y
    // lo unico que le queda es llegar al suelo. Sin este corte se le podia seguir pegando a un
    // avion en llamas y volver a cobrar el derribo.
    if (C.fase === 'cayendo') {
      stepPos(dt); stepFx(dt);
      if (C.muerto) fleet.splice(i, 1);
      continue;
    }
    stepSolucion(dt);
    if (comboFuerza()) { C.pase++; ir('sobrepaso', CAZA_OVER_T); golpeDelPase(); }
    if (C.fase === 'presion') stepAmague(dt);
    stepPos(dt);
    stepFx(dt);
    stepTiro();
    if (C.muerto || avanzar()) fleet.splice(i, 1);
  }
  C = null;
  return;
}

/** ¿Se lo esta viendo de frente? Solo mientras VIENE hacia vos. Desde el sobrepaso hasta que se
 *  pierde en el horizonte se le ve la cola, sin excepcion. El render no decide esto. */
const deFrente = h => h.fase === 'aviso';

/** ¿YA TE PASO Y ESTA EN TU COLA? Entonces NO SE DIBUJA, porque tu cola no esta en la pantalla.
 *
 *  En la PRESION esto lo decide el amague: escondido no se dibuja, asomado si. Antes se dibujaba
 *  siempre y quedaba clavado en CAZA_Z_COLA los cinco a ocho segundos de la fase — a esa z la
 *  escala es F/6 = 22,5, o sea 236 px de ancho sobre una pantalla de 480, plantado en el cuadro.
 *  En la ENTRADA el corte es geometrico y exacto: por debajo de tu z ya te paso. */
const enCola = h => (h.fase === 'aviso' && h.z <= PZ) || (h.fase === 'presion' && h.asomaK < 0.05);

/** LO QUE VE EL RENDER — la flota entera. */
export function snapshot() {
  return fleet.map(h => ({
    fase: h.fase, t: h.t, dur: h.dur, pase: h.pase, sol: h.sol,
    x: h.x, y: h.y, z: h.z, lado: h.lado, humo: h.humo, fx: h.fx,
    deFrente: deFrente(h), enCola: enCola(h), bank: h.bank,
    asoma: h.asomaK, amague: h.amague, final: h.final,
  }));
}

// ---------- SONDA (QUITAR al cerrar el plan) ----------

export function dbg() {
  const h = fleet[0];
  if (!h) return JSON.stringify(null);
  return JSON.stringify({
    fase: h.fase, t: +h.t.toFixed(2), dur: +h.dur.toFixed(2),
    pase: h.pase, capT: +h.capT.toFixed(2), sol: +h.sol.toFixed(3),
    hp: h.hp, humo: +h.humo.toFixed(2), mudo: h.mudo, manso: h.manso,
    x: +h.x.toFixed(1), y: +h.y.toFixed(1), z: +h.z.toFixed(1), lado: h.lado,
    alto: +plane.y.toFixed(1), pz: PZ,
    frente: deFrente(h), cola: enCola(h),
    // DONDE CAE EN LA PANTALLA. Sin esto, "¿se ve el amague?" solo se puede contestar
    // mirando una captura, y una captura vacia no distingue entre "no asomo" y "asomo
    // fuera del cuadro" — que es exactamente el rato que se perdio la primera vez.
    sx: +proj(h.x, h.y, h.z).x.toFixed(1), sy: +proj(h.x, h.y, h.z).y.toFixed(1),
    semi: +(CAZA_SEMI * proj(h.x, h.y, h.z).k).toFixed(1), w: W,
    amague: h.amague, asoma: +h.asomaK.toFixed(2), final: h.final,
    n: fleet.length,
  });
}

/** ¿HAY UNO ASOMADO EN TU COLA AHORA MISMO? Devuelve su indice en la flota, o -1.
 *
 *  Este es el seam del que habla el encabezado. La maniobra que todavia no existe —la combinacion
 *  que te saca de encima al de atras de un golpe— necesita dos cosas, un BLANCO y un MOMENTO, y
 *  las dos estan aca: si esto devuelve algo distinto de -1, hay a quien pegarle y es ahora.
 *
 *  Se exporta antes de tener usuario a proposito. El estado ya existe; esconderlo obligaria a
 *  reabrir este archivo el dia que la maniobra se escriba, y el `0.5` —que es "esta afuera de
 *  verdad, no entrando ni saliendo"— se volveria a elegir a ojo en otro lado. */
export function asomando() {
  for (let i = 0; i < fleet.length; i++) {
    if (fleet[i].fase === 'presion' && fleet[i].asomaK > 0.5) return i;
  }
  return -1;
}

export function setSol(v) { if (fleet[0]) fleet[0].sol = v; }

/** SONDA: fija el final del primer Harrier. El sorteo de `start` es lo correcto para jugar y
 *  lo peor posible para medir — sin esto, probar los tres desenlaces es tirar la moneda hasta
 *  que salgan las tres caras. */
export function setFinal(f) { if (!fleet[0]) return null; fleet[0].final = f; return f; }

export function pegar(n) {
  if (!fleet[0]) return -1;
  C = fleet[0];
  for (let i = 0; i < n; i++) bullets.push({ x: C.x, y: C.y, z: C.z, life: 1 });
  for (let i = 0; i < n + 2 && C && !C.muerto; i++) stepTiro();
  const hp = C ? C.hp : -1;
  if (C && C.muerto) fleet.splice(0, 1);
  C = null;
  return hp;
}

export function dirPaso(o, s) { cazaDirector(s, o); return active(); }

export function dirN(o, n) {
  resetCaza();
  let k = 0;
  for (let i = 0; i < n; i++) {
    const before = fleet.length;
    cazaDirector(400, o);
    if (fleet.length > before) { k++; fleet.length = 0; }
  }
  return k;
}

export function forceFase(f) {
  if (!fleet[0]) return false;
  C = fleet[0];
  if (f === 'presion') { irPresion(); C = null; return true; }
  const dur = { aviso: CAZA_AVISO_T, sobrepaso: CAZA_OVER_T,
    ventana: CAZA_WINDOW, recola: CAZA_RECOLA_T, salida: CAZA_SALIDA_T }[f];
  if (dur === undefined) { C = null; return false; }
  ir(f, dur);
  C = null;
  return true;
}
