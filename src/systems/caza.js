// LA COLA: los Harriers que te toman la cola durante el PASILLO.
//
// Plan y porque: docs/sistemas/PLAN_HARRIERS_PERSECUCION.md, PLAN A (§3). El §1 es el analisis de
// la dinamica de After Burner — de ahi sale cada regla de abajo — y el §2 la verdad historica que
// la sostiene. El §6 dice lo que NO se hace, y conviene tenerlo a mano al tocar esto.
//
// EL HARRIER NO TE DISPARA. NUNCA, EN NINGUNA FASE. Es la regla mas importante de este archivo y
// es una decision de diseño, no una que falte implementar: el duelo es una COREOGRAFIA que tenes
// que poder MIRAR. Cuando tiraba, te mataba desde lejos en el acercamiento — tres rafagas de 34%
// de integridad cada una — y el jugador se moria sin haber llegado a ver el avion del que se
// trataba todo. Un enemigo que te mata antes de aparecer no es dificultad, es contenido perdido.
// Lo que el Harrier SI hace es taparte la pantalla en el sobrepaso y obligarte a apuntarle en la
// ventana. Si en algun momento vuelve a tener dientes, que sea de frente y a distancia de ver.
//
// No hay lock-on, no hay tono, no hay recuadro de fijado (§6.1): los A-4 no tenian nada. Los ojos
// y la radio, y a veces ni la radio.
//
// EL CICLO, que es todo el sistema:
//
//     aviso ──> presion ──> sobrepaso ──> ventana ──> recola ──> presion (INFINITO hasta eliminarlo)
//
//   aviso      el tell. Ya no son trazadoras: es EL AVION, entrando chiquito por el horizonte y
//              creciendo de frente. El aviso sigue llegando antes que el peligro, pero ahora se ve.
//   presion    termina de entrar de frente, te cruza, y queda atras — asomando en los bordes — con
//              su solucion de tiro madurando mientras tu rumbo sea predecible. La solucion ya no
//              cobra en balas: cobra en que se te pega al carril y la radio te grita QUEBRA.
//   sobrepaso  el que estaba atras NO se queda atras — te pasa ENORME por un costado y queda
//              adelante. Es la moneda del juego (§1: "el cruce cercano ES el juego").
//   ventana    unos segundos ADELANTE TUYO Y DE COLA, esquivandose: es tu turno de tirarle (H3).
//   recola     desperdiciada la ventana, se hace chiquito hasta el horizonte y vuelve a empezar.
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
    humoT: 0, estT: 0,
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

// EL FX DEL HARRIER ES SOLO HUMO Y ESTELA. No hay proyectiles: aca se borraron `rafaga` (las
// trazadoras que te cruzaban de atras) y `rafagaFrontal` (la unica rafaga que hacia daño). Las dos
// eran "el Harrier atacandote", y el Harrier no ataca. Ver la nota de arriba del archivo.
function stepFx(dt) {
  for (const f of C.fx) { f.life -= dt; f.z -= run.spd * dt; }
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

function derribar() {
  run.score += CAZA_PTS.derribo;
  const s = proj(C.x, C.y, C.z);
  popup(s.x, s.y - 10, '+' + CAZA_PTS.derribo, P.warn, true);
  popup(W / 2, 46, T('caza_kill'), P.warn);
  explodeAt(C.x, C.y, C.z, true);
  sfxOne('exHeavy');
  stats.air++;
  C.muerto = true;
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

function stepPos(dt) {
  const f = C.dur > 0 ? Math.min(1, C.t / C.dur) : 1;
  const lerp = (a, b, k) => a + (b - a) * Math.min(1, k * dt);
  if (C.fase === 'aviso' || C.fase === 'presion') {
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
      ir('presion', entre(CAZA_PRES_T));
      return false;
    case 'presion':
      C.pase++;
      ir('sobrepaso', CAZA_OVER_T);
      golpeDelPase();
      return false;
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
      ir('presion', entre(CAZA_PRES_T));
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
    stepSolucion(dt);
    if (comboFuerza()) { C.pase++; ir('sobrepaso', CAZA_OVER_T); golpeDelPase(); }
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
const deFrente = h => h.fase === 'aviso' || h.fase === 'presion';

/** ¿YA TE PASO Y ESTA EN TU COLA? Entonces NO SE DIBUJA, porque tu cola no esta en la pantalla.
 *
 *  Terminada la entrada, el Harrier queda clavado en CAZA_Z_COLA los cinco a ocho segundos de la
 *  presion. A esa z la escala de la proyeccion es F/6 = 22,5, o sea que el sprite mide 236 px de
 *  ancho sobre una pantalla de 480 — y su carril se cierra sobre el tuyo a medida que la solucion
 *  de tiro madura, asi que cada tanto se plantaba ENORME en el centro del cuadro. Eso no era
 *  "asomar por el borde": era medio juego tapado por un avion que ademas esta detras tuyo. */
const enCola = h => (h.fase === 'aviso' || h.fase === 'presion') && h.z <= PZ;

/** LO QUE VE EL RENDER — la flota entera. */
export function snapshot() {
  return fleet.map(h => ({
    fase: h.fase, t: h.t, dur: h.dur, pase: h.pase, sol: h.sol,
    x: h.x, y: h.y, z: h.z, lado: h.lado, humo: h.humo, fx: h.fx,
    deFrente: deFrente(h), enCola: enCola(h), bank: h.bank,
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
    n: fleet.length,
  });
}

export function setSol(v) { if (fleet[0]) fleet[0].sol = v; }

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
  const dur = { aviso: CAZA_AVISO_T, presion: entre(CAZA_PRES_T), sobrepaso: CAZA_OVER_T,
    ventana: CAZA_WINDOW, recola: CAZA_RECOLA_T, salida: CAZA_SALIDA_T }[f];
  if (dur === undefined) { C = null; return false; }
  ir(f, dur);
  C = null;
  return true;
}
