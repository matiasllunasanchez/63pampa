// FASE PASADA: el climax resuelto con la doctrina real de 1982 — llegar a ras del agua, saltar lo
// justo, soltar la ristra y salir. Analisis funcional completo en docs/sistemas/SPEC_MODO_PASADA.md;
// el porque de cada decision, en docs/sistemas/PROPUESTAS_PASADA.md §8b.
//
// LAS OCHO FASES ESTAN HECHAS: P0 (esqueleto y zona 3D) · P1 (eje de ataque y re-encare) · P2 (la
// suelta: balistica, bandas, ristra, sapito) · P3 (defensa por capas) · P4 (reglamento: RF-15 un
// avion una suelta, la nafta, el ralenti) · P5 (contador de suelta, escalera, el ras que se
// escucha) · P6 (el climax es dato de la mision) · P7 (la oleada de los Fieles).
//
// LO QUE HACE A ESTE MODO DISTINTO DE LOS OTROS DOS, en una linea: en el PASILLO y en el ARENA
// volas solo y podes insistir; aca te turnas con la escuadrilla y tenes UNA suelta.
//
// PRINCIPIO P1 DEL SPEC — "la PASADA es el PASILLO con consecuencias": mismas teclas, misma fisica,
// ningun control nuevo. Por eso el vuelo es el modelo E1/E2 de core/aero.js con los numeros de
// data/arena.js, LOS MISMOS que usa systems/arena.js. Lo que cambia es el reglamento (data/pasada.js).
//
// MISMA REGLA DEL LIMITE que todos los sistemas: update() devuelve señal ('objective' | { death }) y
// game.js decide. Este modulo no llama hacia arriba.
//
// ESCALA: 1 unidad = 1 METRO (systems/three-arena.js).

import { setState, cfg, plane } from '../core/state.js';
import { run } from '../core/run.js';
import { parts, popups, prune, clearWorld } from '../core/world.js';
import { popup } from '../core/fx.js';
import { T } from '../core/i18n.js';
import { P } from '../data/palette.js';
import { MOM_LAYOUTS, SHIP_CLASS } from '../data/ships.js';
import { W, HOR } from '../render/ctx.js';
import { boom, beep, sfxOne, duck, engineFly } from './audio.js';
import * as world3D from './three-arena.js';
import { forward, stepFlight, drifting, stepVel } from '../core/aero.js';
import { AR } from '../data/arena.js';
import { PS, ENTRY_D, ENTRY_ALT, BOMB } from '../data/pasada.js';
// AVERIAS: el escalon de daño entra por el mismo `io` que el resto de las palancas. El modelo de
// vuelo no sabe de daño — solo de palancas (core/damage.js).
import * as dmg from './damage.js';
// LA RADIO DEL SEA CAT la grita un compañero, asi que hace falta su nombre. No es import circular:
// squad.js no sabe de la pasada — el que sabe de los dos es game.js, como manda la arquitectura.
import { pilotName } from './squad.js';
import { pilotIdx } from '../core/squad.js';

// El mar MATA: es la regla del juego entero y la pasada, que se juega A RAS, es donde mas pesa.
// Los tres numeros son LOS DEL ARENA a proposito (systems/arena.js): es el mismo mar y el mismo
// avion, y que la altura se sienta distinta entre dos fases seria la peor de las sorpresas.
const SEA_KILL = 3.5;      // altura de impacto contra el agua (la cresta de la ola)
const LOW_WARN = 16;       // debajo de esto y cayendo, el HUD grita ANTES de morir
const ZONE_GRACE = 1.5;    // segundos fuera de la zona antes de que el piloto automatico tome el mando
const AUTO_OFF = 0.86;     // vuelve el control al entrar a este % del radio
const OUTRO_T = 3.2;       // el hundimiento del buque, antes de cerrar la fase
// FUERA DE LA CORRIDA: a mitad del tramo limpio pasada la ventana. Es el punto donde la corrida se
// da por terminada — se cuenta una nueva al volver a entrar y el avion se rearma. Va a la MITAD de
// ENTRY_CLEAR y no al final porque el borde de la zona esta en 1600: pedir 1500 para rearmarse
// dejaba el rearme pegado a la correa del piloto automatico.
const OUT_R = PS.POPUP_DIST_M + PS.ENTRY_CLEAR_M / 2;

// ---- estado privado ----
let A = null;              // la instancia de la pasada (null fuera)
let zones = null;          // PERSISTEN entre relevos: el daño hecho al buque cuenta
let shipCls = 't42';
let viewMode = 1;          // 1a persona por default, igual que el arena ([V] la cambia)
// SONDA: corridas voladas y segundos por debajo del techo de radar. Son los dos numeros que dicen
// si el modo esta haciendo lo que promete — si nadie vuela bajo, la capa Sea Dart no enseña nada.
let corridas = 0, lowT = 0;
// LLAVE DE LA DEFENSA (P3), solo para sondas — en el juego siempre esta prendida. La zona pasa a
// ser letal con P3, y las secciones del fixture que miden el VUELO, la SUELTA o el reglamento no
// tienen por que sobrevivir mientras miden: medir el alcance de la ristra no puede depender de
// esquivar una salva. La defensa se prueba en su propia seccion, con esto prendido.
let defOn = true;
// INVULNERABLE, tambien solo para sondas. Medir DONDE cae la metralla —que es lo que dice si el
// calor aprieta— no puede depender de sobrevivirla: sin esto, la medicion se corta en el primer
// impacto y el numero sale de dos columnas en vez de doce.
let invul = false;

export const active = () => A;
export const zonesOf = () => zones || [];
/** Casco vivo del buque, sumado. El daño PERSISTE entre relevos (RF-15.3: los cuatro aviones
 *  pican el mismo casco), asi que esto sube solo al empezar una batalla nueva. */
const hpTotal = () => (zones || []).reduce((s, z) => s + Math.max(0, z.hp), 0);
export const view = () => viewMode;
export const available = () => world3D.available();
export const ZONE_R = PS.ZONE_R;

export function setShip(name) { shipCls = SHIP_CLASS[name] || 't42'; zones = null; }

export function resetPasada() { A = null; zones = null; corridas = 0; lowT = 0; defOn = true; invul = false; world3D.resetZones(); }

/** Un solo gatillo, igual que el arena: el 100% de la distancia de la mision. */
export function readyToEnter(dist, objectiveDist) {
  return objectiveDist > 0 && dist >= objectiveDist;
}

/** RF-01: los spawns de enemigos se cortan ENTRY_CLEAR_M antes del buque. Lo pregunta el pasillo
 *  ANTES de sembrar: el ultimo tramo se vacia y lo unico que queda adelante es el blanco. */
export function spawnsCut(dist, objectiveDist) {
  return objectiveDist > 0 && dist >= objectiveDist - PS.ENTRY_CLEAR_M;
}

export function toggleView() {
  viewMode = viewMode === 1 ? 3 : 1;
  popup(W / 2, 58, viewMode === 1 ? T('arena_v1') : T('arena_v3'), P.accent);
  beep(700, 0.05, 'square', 0.04);
}

/** Entra a la PASADA. `desdePasillo` = venis volando y el mundo se abre debajo tuyo (RF-01).
 *
 *  LA TRANSICION SIN CORTE ES ESTE BLOQUE. No hay fade, no hay pantalla y no hay cambio de manejo
 *  porque el avion CONSERVA lo que traia: su altura (plane.y del pasillo, que ya esta en la misma
 *  escala de metros) y su velocidad (run.spd, que vive en las mismas unidades que el modelo del
 *  arena). Teletransportar a una entrada fija —lo que hace el arena— seria el corte. */
export function enter(desdePasillo) {
  setState('pasada');
  clearWorld({ keepFx: true });
  if (!zones) {
    // el buque define sus objetivos = las zonas de su clase, como el arena. La data sigue siendo
    // MOM_LAYOUTS: las tres "pasadas" del layout clasico se aplanan en una sola lista.
    // Va ACA y no incondicionalmente: el relevo del escuadron re-entra por enter() y un reset a
    // secas le devolveria al buque el daño que ya le habias hecho.
    corridas = 0; lowT = 0;
    zones = [];
    for (const ph of MOM_LAYOUTS[shipCls]) for (const z of ph.zones)
      zones.push({ id: z.id, label: z.label, hp: z.maxHp, maxHp: z.maxHp, pts: z.pts });
  }
  // EJE DE ATAQUE (P1). Se entra SOBRE LA ESLORA del buque —yaw = PI/2 es rumbo +X, y el casco
  // esta sobre X— y no en diagonal como en P0. No es cosmetica: por el eje la ventana de suelta
  // dura 1,2 s y cruzando la manga 0,3 s, asi que la entrada de P0 (0,55 rad, casi de costado)
  // le entregaba al jugador la PEOR corrida posible y despues le pedia que entendiera el nivel.
  // Vale igual para el relevo, que tambien entra por aca: el que asume llega briefeado.
  const yaw = Math.PI / 2;
  // lo que se HEREDA del pasillo: altura y velocidad. plane.y vive en unidades de mundo del
  // pasillo (techo FLY_TOP = 68) y se lee 1:1 como metros — la coincidencia no es casual, es la
  // escala que hace que el techo de radar (35 m) caiga justo en el medio de la banda de vuelo.
  const alt = desdePasillo ? Math.max(SEA_KILL * 2, plane.y) : ENTRY_ALT;
  const spd = run.spd > AR.SPD_MIN ? run.spd : AR.SPD_CRUISE;
  A = {
    t: 0, yaw, pitch: 0, roll: 0,
    pos: { x: -Math.sin(yaw) * ENTRY_D, y: alt, z: Math.cos(yaw) * ENTRY_D },
    spd, fwd: forward(yaw, 0), up: { x: 0, y: 1, z: 0 },
    vx: 0, vy: 0, lowT: 0,
    vel: forward(yaw, 0),          // TRAYECTORIA: unitario propio, se despega del morro derrapando
    drift: 0,
    corrida: 0, inRun: 0,          // corrida en curso / ya entramos a la ventana de esta vuelta
    fase: 'ingreso', gate: null,   // P1: fase real de la corrida y puerta del re-encare
    reHigh: 0,                     // RF-09: ¿la vuelta la estas haciendo POR ARRIBA? (chandelle)
    gateOk: 0,                     // ya se felicito el cruce de esta puerta (una vez por vuelta)
    bombs: PS.BOMBS_N,             // la ristra que queda de ESTA corrida
    ripple: 0, rippleT: 0, msl: 0, // bombas por soltar de la salva / reloj entre una y otra / flanco de [Z]
    sapitos: 0, duds: 0,           // sonda: cuantas entraron picando y cuantas llegaron dormidas
    heat: 0,                       // P3/RF-09: calor de la defensa, sube por re-encare
    // la primera salva NO sale de entrada: entrar a la zona y morir sin haber visto nada caer no
    // es dificultad, es una emboscada. El primer aviso llega con tiempo de leerse.
    gunT: PS.GUN_EVERY_S * 1.6, salvas: 0,   // reloj del cañon de 4,5" y cuantas salvas te tiro
    aimN: 0, aimYaw: yaw, lastJit: null,   // correccion del cañon, su rumbo, y la dispersion real
    dartUsed: 0, catUsed: 0, cat: null, // uno de cada por corrida (RF-03 / RF-08)
    fusT: 0, sprayT: 0,                 // fusileria sobre la cubierta / salpicado del ras
    colSum: 0, colN: 0,                 // sonda del CALOR: que tan cerca te cae la metralla
    wave: [], waveT: 1.2, waveN: 0,     // P7: el primero entra casi enseguida (ver stepOleada)
    outT: 0, auto: 0,              // fuera de la zona / piloto automatico
    hitFx: 0, flashL: 0, flashR: 0,
    cue: null, cueT: 0, rad: ENTRY_D,   // contador de suelta / reloj del tic-tac / distancia al buque
    spent: null, spentT: 0,             // RF-15: como termino esta pasada, y el compas para verlo
    hp0: hpTotal(),                     // casco al empezar TU corrida: dice si tocaste o fallaste
    doneT: 0, boomT: 0, fx: [],
  };
  // RF-10/RF-15: EL TANQUE ES POR AVION. El que releva es otra maquina, y llega con su nafta —
  // por eso se repone aca (en enter(), que corre tanto al llegar del pasillo como al relevar) y
  // no en systems/squad.js, que a proposito NO repone nada (ahi morir seria la forma barata de
  // repostar). Lo que compra el tanque no es tiempo de batalla: es cuanto podes DUDAR en tu unica
  // corrida antes de tener que tirar como venga.
  if (cfg.fuelOn) run.fuel = PS.PASS_TANK;
  popup(W / 2, 62, T('pasada_title'), P.warn);
  popup(W / 2, 76, T('pasada_hint'), P.dim);
  // SIN FANFARRIA cuando venis volando: el pitido de entrada del arena es, el mismo, un corte —
  // te avisa que empezo otra cosa. Entrando por sonda si suena, porque ahi no hubo continuidad.
  if (!desdePasillo) beep(320, 0.5, 'sine', 0.07, 640);
}

function zoneKilled(z) {
  z.hp = 0;
  world3D.charZone(z.id);
  const r = world3D.zoneRect3D(z.id);
  const zx = r ? r.x + r.w / 2 : W / 2, zy = r ? r.y + r.h / 2 : HOR;
  run.score += z.pts;
  popup(zx, zy - 8, '+' + z.pts, P.accent, true);
  popup(zx, zy - 20, T(z.label), P.warn);
  for (let i = 0; i < 16; i++) parts.push({
    x: zx + (Math.random() - 0.5) * 26, y: zy + (Math.random() - 0.5) * 16,
    vx: (Math.random() - 0.5) * 90, vy: -(20 + Math.random() * 70), life: 0.6,
    c: Math.random() < 0.5 ? P.warn : P.accent, r: 1.6,
  });
  boom(0.22); duck(0.55);
  if (!sfxOne('exHeavy')) beep(70, 0.3, 'sawtooth', 0.07, 38);
  run.shake = Math.min(6, run.shake + 2);
  if (zones.every(q => q.hp <= 0)) {
    A.doneT = OUTRO_T;
    run.score += 1200;
    popup(W / 2, 54, T('arena_sunk'), P.warn, true);
  }
}

/** Daño a una zona. En P0 el unico que la llama es la sonda; en P2 la llaman las bombas. */
export function hitZone(id, d) {
  const z = zones && zones.find(q => q.id === id && q.hp > 0);
  if (!z || !A) return;
  z.hp -= d;
  A.hitFx = 1;
  if (z.hp <= 0) zoneKilled(z);
}

/** ALINEACION CON EL EJE DEL CASCO (P1). 1 = venis clavado por la eslora · 0 = cruzando la manga.
 *
 *  El buque tiene la eslora sobre X, asi que esto es el coseno de tu rumbo contra ese eje. Va en
 *  VALOR ABSOLUTO porque las dos puntas sirven igual: proa y popa dan la misma corrida.
 *
 *  Es el numero mas importante del modo despues del contador de suelta, y por la misma razon: la
 *  huella del buque son 133 x 30 metros, asi que por el eje la ventana dura 1,2 s y cruzando la
 *  manga 0,3 s. Cuatro veces. Sin decirlo, entrar de costado no se siente dificil: se siente roto. */
export function axisAlign() {
  if (!A) return 0;
  const hl = Math.hypot(A.vel.x, A.vel.z);
  return hl < 0.01 ? 0 : Math.abs(A.vel.x / hl);
}

/** FASE de la corrida y PUERTA de re-encare (P1). Ya no se deriva de la geometria en cada consulta:
 *  es estado, porque la puerta necesita memoria.
 *
 *  El racetrack: si sobrevolaste sin soltar, salis, das la vuelta y volves a entrar POR EL EJE. La
 *  puerta marca donde girar. Se fija UNA sola vez al empezar el re-encare y no se recalcula cuadro
 *  a cuadro a proposito — una marca que salta de una punta del buque a la otra cuando cruzas el
 *  medio no es una guia, es un parpadeo. */
function stepFase(rad) {
  const acercando = (A.pos.x * A.vel.x + A.pos.z * A.vel.z) < 0;
  if (rad < PS.POPUP_DIST_M) {
    A.fase = acercando ? 'salto' : 'egreso';
    A.gate = null; A.gateOk = 0;              // entraste a la ventana: la puerta ya cumplio
    return;
  }
  if (!acercando) {
    A.fase = rad < OUT_R ? 'egreso' : 'reencare';
    // LA PUERTA VA ADELANTE, no donde caiga. Puesta en RACE_D_M a secas quedaba DETRAS del avion
    // cuando el egreso ya lo habia llevado mas lejos que eso —se ve en captura: fase re-encare y
    // ninguna marca en pantalla—, y una guia que apunta a tu espalda no guia. Se coloca sobre el
    // eje, del lado al que VAS, y siempre un tramo por delante; el tope la deja adentro de la zona
    // para no pelearse con la correa del piloto automatico.
    if (rad >= OUT_R && !A.gate) {
      const dir = A.vel.x >= 0 ? 1 : -1;
      const gx = Math.min(PS.ZONE_R * 0.85, Math.max(PS.RACE_D_M, Math.abs(A.pos.x) + 350));
      A.gate = { x: dir * gx, z: 0 };
    }
    return;
  }
  // volviendo: mientras haya puerta seguis en el re-encare, aunque ya estes encarando. Es lo que
  // hace que la vuelta sea UNA maniobra con principio y fin, y no "estar lejos".
  A.fase = A.gate ? 'reencare' : 'ingreso';
}

/** BANDA DE ARMADO (RF-06). Es una funcion de la ALTURA y nada mas: la banda existe antes que el
 *  arma, y ese es el punto — el juego se decide ANTES de apretar. */
export function bandaDe(alt) {
  if (alt < PS.BAND_ARM_MIN) return 'dormida';
  return alt > PS.BAND_SWEET_MAX ? 'alta' : 'dulce';
}

/** PUNTO DE IMPACTO previsto, en el mundo: donde toca el agua una bomba soltada AHORA.
 *
 *  Es "la mira" — la unica de las mentiras permitidas que la suelta necesita (PROPUESTAS §3.4).
 *  Sin esto, con la bomba heredando 100 m/s y cayendo con gravedad real, la suelta es a ciegas: a
 *  35 m de altura el adelanto son casi 270 metros, o sea que el buque ya te paso cuando pega. El
 *  A-4 real tenia un visor rudimentario; esto es eso. */
export function impactPoint() {
  if (!A) return null;
  const vy = A.vel.y * A.spd, y0 = A.pos.y;
  // caida libre: t = (vy + sqrt(vy² + 2·g·y0)) / g   (raiz positiva: el instante en que cruza y=0)
  const disc = vy * vy + 2 * BOMB.G * y0;
  if (disc < 0) return null;
  const t = (vy + Math.sqrt(disc)) / BOMB.G;
  const ix = A.pos.x + A.vel.x * A.spd * t, iz = A.pos.z + A.vel.z * A.spd * t;
  // `d` es el error CON SIGNO sobre el eje buque→avion: + cae CORTA (antes del buque), − se pasa
  // de LARGO. Sin signo no se puede corregir una suelta — que es justo lo que hay que aprender.
  const pl = Math.hypot(A.pos.x, A.pos.z) || 1;
  return { x: ix, y: 0, z: iz, t, d: (ix * A.pos.x + iz * A.pos.z) / pl };
}

/** EL CONTADOR DE SUELTA: cuantos METROS faltan volar para que la bomba caiga ENCIMA del buque.
 *
 *  Es la respuesta a "no se cuando tirar", y es un numero honesto, no una ayuda: la marca de
 *  impacto viaja con el avion, asi que se MARCHA desde ella por el rumbo actual y se busca el
 *  primer paso que cae dentro de la huella del buque. Lo que devuelve:
 *
 *    0     la bomba ya pega si soltas AHORA (la ventana esta abierta)
 *    > 0   metros que faltan volar antes de soltar
 *    null  el rumbo NO cruza el buque: por mas que vueles derecho, la bomba cae al agua
 *
 *  Ese `null` es la mitad del valor del indicador. Une las dos preguntas —¿cuando suelto? y
 *  ¿estoy encarado?— en un solo dato: si no hay numero, no estas apuntando a nada. Es tambien
 *  por que se marcha en vez de despejar una formula: la huella del buque son 133 x 30 metros, asi
 *  que la ventana dura mucho mas entrando por la proa que cruzando la manga, y eso el jugador lo
 *  tiene que SENTIR sin que nadie se lo explique. */
const CUE_STEP = 4, CUE_MAX = 1200;
function releaseCue() {
  const ip = impactPoint();
  if (!ip) return null;
  const hl = Math.hypot(A.vel.x, A.vel.z);
  if (hl < 0.01) return null;                      // cayendo a plomo: no hay rumbo que marchar
  if (world3D.hitsShip(ip.x, 0, ip.z)) return 0;
  const ux = A.vel.x / hl, uz = A.vel.z / hl;
  for (let s = CUE_STEP; s <= CUE_MAX; s += CUE_STEP)
    if (world3D.hitsShip(ip.x + ux * s, 0, ip.z + uz * s)) return s;
  return null;
}

/** La zona VIVA mas cercana a un punto del mundo. Una bomba que entra por el casco no cae en el
 *  vacio: revienta adentro y se lleva lo que tiene encima. */
function nearestZone(x, y, z) {
  let best = null, bd = 1e9;
  for (const q of zones) {
    if (q.hp <= 0) continue;
    const wp = world3D.zoneWorldPos(q.id);
    if (!wp) continue;
    const d = Math.hypot(wp.x - x, wp.y - y, wp.z - z);
    if (d < bd) { bd = d; best = q.id; }
  }
  return best;
}

/** LA SUELTA ([Z]). Sale la RISTRA entera de la corrida: no hay segunda mira (RF-06). Las bombas
 *  salen ESCALONADAS cada RIPPLE_S, cada una desde donde este el avion en ese instante — por eso
 *  caen sobre la LINEA DE VUELO y pegarle a dos zonas es haber elegido un eje que las alinea.
 *
 *  Y ES LA DECISION DEL MODO (RF-15): apretar esto CIERRA tu pasada. Pegues o no, despues de la
 *  ristra entra el siguiente del roster. Por eso la pregunta en cada corrida no es "¿pego?" sino
 *  "¿tiro ya, o me la juego a dar otra vuelta?" — y la vuelta la cobra la nafta (RF-10). */
export function release() {
  if (!A || A.doneT > 0 || A.auto) return;
  if (A.bombs <= 0 || A.ripple > 0) { beep(140, 0.09, 'square', 0.04); return; }
  A.ripple = A.bombs; A.rippleT = 0;
}

/** Suelta UNA bomba desde donde esta el avion ahora. */
function dropOne(turbo) {
  const alt = A.pos.y;
  const banda = bandaDe(alt);
  // EL SAPITO (RF-07): al ras y a fondo. Es a ojo y sin asistencia — el premio del que juega como
  // los que sabian. La bomba pica una vez en el agua y entra al casco por la linea de flotacion.
  const sapito = alt < PS.SAPITO_ALT_M && !!turbo;
  A.bombs--;
  A.fx.push({
    k: 'bomb', banda, sapito, skipped: 0, life: 14, T: 0,
    x: A.pos.x, y: A.pos.y, z: A.pos.z,
    vx: A.vel.x * A.spd, vy: A.vel.y * A.spd, vz: A.vel.z * A.spd,
  });
  if (!sfxOne('mslFar')) beep(260, 0.10, 'sawtooth', 0.05, 120);
}

/** Impacto de una bomba. `hit` = lo que devolvio el rayo contra el buque; null = cayo al agua.
 *
 *  OJO CON EL CASCO: el rayo puede pegarle a una pieza SIN zona (la chapa) y eso NO es agua — es
 *  un impacto. Confundirlos hacia que una bomba bien puesta en el medio del buque contara como
 *  fallada. Adentro del casco, la que cobra es la zona mas cercana. */
function bombHit(f, hit) {
  f.life = 0;
  const enAgua = !hit;
  const zoneId = hit ? (hit.zone || nearestZone(f.x, f.y, f.z)) : null;
  A.fx.push({ k: 'splash', x: f.x, y: Math.max(0, f.y), z: f.z, vr: enAgua ? 22 : 34, life: enAgua ? 0.9 : 1.1, T: 0 });
  if (enAgua) { boom(0.08); if (!sfxOne('exSmall')) beep(120, 0.16, 'sawtooth', 0.05, 60); return; }
  if (!zoneId) {   // le pego al casco y no queda zona viva a la que cobrarle
    boom(0.2); run.shake = Math.min(6, run.shake + 1.5);
    if (!sfxOne('exMedium')) beep(80, 0.24, 'sawtooth', 0.06, 40);
    return;
  }
  if (f.sapito) {
    // ENTRO PICANDO: daño pleno y bonus de estilo. Es la piedra de Esteban del prologo, vuelta arma.
    hitZone(zoneId, BOMB.DMG);
    run.score += PS.SAPITO_PTS; A.sapitos++;
    popup(W / 2, 50, T('pasada_sapito'), P.accent, true);
    popup(W / 2, 62, '+' + PS.SAPITO_PTS, P.accent);
    boom(0.26); run.shake = Math.min(6, run.shake + 2.4);
    if (!sfxOne('exHeavy')) beep(70, 0.3, 'sawtooth', 0.07, 38);
    return;
  }
  if (f.banda === 'dormida') {
    // NO DESPERTO: la espoleta no llego a armarse. Golpea, no estalla. Es historico y es el
    // corazon de la ventana — soltar mas bajo NO es siempre mejor.
    hitZone(zoneId, BOMB.DMG * BOMB.DUD); A.duds++;
    popup(W / 2, 50, T('pasada_dud'), P.warn, true);
    run.shake = Math.min(6, run.shake + 0.8);
    if (!sfxOne('exXsmall')) beep(90, 0.12, 'square', 0.05, 50);
    return;
  }
  hitZone(zoneId, BOMB.DMG);
  boom(0.24); run.shake = Math.min(6, run.shake + 2);
  if (!sfxOne('exHeavy')) beep(70, 0.3, 'sawtooth', 0.07, 38);
}

// ============================ P3 — LA DEFENSA POR CAPAS ============================
// La dificultad de la PASADA es GEOGRAFIA, no numeros: cada capa castiga una manera distinta de
// volar, y las tres juntas dibujan el unico camino que funciona — bajo, derecho pero no recto, y
// una sola pasada. Ninguna avisa con un icono: el aviso es el mundo (columnas, estelas) o la radio
// del escuadron. Es el principio P3 del spec, "el aviso es humano o no es".
//
//   RF-04  el cañon de 4,5"  castiga volar DERECHO       → columnas que caminan sobre tu rumbo
//   RF-03  el Sea Dart       castiga volar ALTO de lejos → el techo de radar
//   RF-08  Sea Cat y fusileria castigan DEMORARSE encima → el precio del sobrevuelo

/** Daño de la defensa. Un solo camino para las tres capas: asi la llave de invulnerabilidad de las
 *  sondas no se puede olvidar en uno de los cuatro lugares que pegan. */
const golpe = cause => !invul && dmg.takeHit(cause);

/** LA SALVA DEL CAÑON (RF-04). No te apunta a vos: apunta a donde vas a ESTAR, y las columnas
 *  caminan sobre tu rumbo. La primera cae corta y la ultima donde estarias dentro de metro y
 *  medio de segundo, asi que volar recto es meterse en la ultima y virar es que pasen al lado.
 *
 *  El CALOR (RF-09) no la hace mas rapida ni mas fuerte: la hace mas CERRADA. Insistir con una
 *  segunda y una tercera corrida es legal —la doctrina real era una sola— y lo que cuesta es que
 *  el tirador ya te tomo el tiempo. */
function fireGuns() {
  const hl = Math.hypot(A.vel.x, A.vel.z) || 1;
  const ux = A.vel.x / hl, uz = A.vel.z / hl;
  // la dispersion se cierra con el calor: en la corrida 1 el tirador tantea, en la 3 ya sabe
  // LA CORRECCION SE GANA TIRANDO: la salva 1 tantea, la 2 corrige, la 3 te tiene. Volar derecho
  // es dejarlo terminar la cuenta.
  const aim = Math.min(1, A.aimN / PS.GUN_AIM_SALVOS);
  A.aimN++;
  const jit = PS.COL_JIT_M * (1 - PS.GUN_AIM_MAX * aim) / (1 + A.heat);
  A.lastJit = jit;                   // sonda: la dispersion con la que salio ESTA salva
  const jx = (Math.random() - 0.5) * jit, jz = (Math.random() - 0.5) * jit;
  for (let i = 0; i < PS.COL_N; i++) {
    const s = PS.COL_STEP_M * (i + 1);
    // `life` incluye la espera: asi el reloj comun del efecto (f.T) alcanza para las dos cosas —
    // cuando revienta y cuanto dura— sin un contador aparte que se pueda desfasar.
    A.fx.push({
      k: 'col', T: 0, life: i * PS.COL_GAP_S + PS.COL_LIFE, wait: i * PS.COL_GAP_S,
      x: A.pos.x + ux * s + jx, y: 0, z: A.pos.z + uz * s + jz, hit: 0,
    });
  }
  A.salvas++;
  // EL CAÑONAZO SE OYE ANTES DE VER EL AGUA. Es el aviso que convierte la salva en algo que se
  // puede esquivar por reflejo y no solo por haber virado hace un segundo — y es gratis: el sonido
  // ya viaja mas rapido que el proyectil.
  boom(0.07, true);
  if (!sfxOne('exXsmall')) beep(90, 0.12, 'sawtooth', 0.045, 55);
}

/** SEA DART (RF-03). Sale UNO por corrida, y solo si cruzaste el techo de radar LEJOS del buque:
 *  encima del blanco no hay lanzamiento — el misil de area no se tira sobre la propia cubierta, y
 *  ademas es lo que hace que la doctrina (llegar a ras) sea una ventaja y no una pose. */
function fireDart() {
  A.dartUsed = 1;
  const wp = { x: 0, y: 22, z: 0 };
  const d = { x: A.pos.x - wp.x, y: A.pos.y - wp.y, z: A.pos.z - wp.z };
  const dl = Math.hypot(d.x, d.y, d.z) || 1;
  A.fx.push({
    k: 'dart', T: 0, life: PS.DART_LIFE,
    x: wp.x, y: wp.y, z: wp.z, vx: d.x / dl, vy: d.y / dl, vz: d.z / dl,
  });
  popup(W / 2, 44, T('pasada_dart'), P.warn, true);
  if (!sfxOne('mslFar')) beep(200, 0.5, 'sawtooth', 0.06, 700);
}

/** SEA CAT (RF-08). No es geometria como el Dart: es un CHEQUEO, y a proposito. El Sea Cat real
 *  era subsonico y lo guiaba un tipo con un joystick mirando por un visor, asi que un quiebre
 *  franco lo dejaba atras — modelarlo como perseguidor perfecto seria mas "realista" en el codigo
 *  y menos fiel a lo que pasaba. Se anota el rumbo al lanzar y se compara al llegar.
 *
 *  EL AVISO ES LA RADIO, y por eso puede FALTAR: con pocos Fieles vivos no hay quien te lo grite.
 *  Es la regla del juego dicha en una linea — sin radar propio, los ojos son el escuadron. */
function fireCat() {
  A.catUsed = 1;
  A.cat = { t: 0, yaw0: Math.atan2(A.vel.x, -A.vel.z), dodged: 0 };
  // el aviso lo da un COMPAÑERO, asi que si no queda escuadron no hay aviso. No es una omision:
  // es la regla del modo — sin radar propio, los ojos son los otros.
  if (run.lives > 1) {
    popup(W / 2, 44, T('pasada_break', { c: pilotName(pilotIdx(run.squad, run.lives)) }), P.warn, true);
    if (!sfxOne('waveFly')) beep(900, 0.16, 'square', 0.06, 500);
  }
}

// ============================ P7 — LA OLEADA ============================
// Los Fieles vivos hacen SUS corridas mientras vos das la vuelta. No es IA ni decorado: es
// coreografia con dos consecuencias de juego reales.
//
//   1. MIENTRAS UNO CORRE, EL BUQUE LE TIRA A EL. El cañon tiene un blanco por vez (RF-04), asi
//      que la corrida de un compañero te compra segundos limpios para encarar. El escuadron te
//      cubre con su propio pellejo, que es lo que hacia un escuadron.
//   2. SUS BOMBAS HACEN DAÑO DE VERDAD. No siempre —WING_HIT_P— pero cuentan: el casco que baja
//      mientras vos volvias lo bajo otro, y eso es lo que distingue este modo de los otros dos.
//
// NINGUN FIEL MUERE ACA. Puede quedar averiado y decirlo por radio; los muertos los decide el
// guion (Vasco m7, Pichon m9). Un compañero perdido al azar arruinaria la historia que el juego
// esta contando.

/** ¿Hay un compañero EN SU CORRIDA ahora? Es la pregunta que le hace la defensa. */
const amigoCorriendo = () => !!(A && A.wave.some(w => w.t > PS.WAVE_T * 0.25 && w.t < PS.WAVE_T * 0.75));

/** Posicion de un Fiel en su corrida. Una linea sobre el eje del casco con un lomo suave en el
 *  medio: entra a ras, salta lo justo sobre el buque y baja del otro lado. La misma corrida que
 *  se le pide al jugador — verla volada por otro es media leccion del modo. */
function wavePos(w) {
  const u = Math.max(0, Math.min(1, w.t / PS.WAVE_T));
  const x = w.side * PS.WAVE_D_M * (1 - 2 * u);
  const y = PS.WAVE_ALT_M + Math.sin(u * Math.PI) * 16;
  return { x, y, z: w.lane };
}

function stepOleada(dt) {
  // CUANDO. Esto se movio despues de medirlo, y el porque importa: la oleada estaba puesta "entre
  // tus corridas", pero bajo RF-15 vos no das vueltas — soltas y te relevan. O sea que el hueco
  // entre tus corridas es la cinematica del relevo, no tiempo de vuelo, y la oleada casi no
  // aparecia.
  //
  // Donde SI tiene lugar, y donde ademas es la doctrina real: DELANTE TUYO EN LA ENTRADA. Un
  // compañero entra unos segundos antes, se lleva el cañon, y vos entras atras por el hueco que
  // dejo. Eso es un ataque de escuadrilla, y es la unica imagen que ninguno de los otros dos modos
  // del juego puede dar.
  const hueco = A.rad > PS.POPUP_DIST_M * 0.7;
  A.waveT -= dt;
  // UNO POR VEZ, y el reloj del siguiente arranca cuando el anterior SALE. Con dos simultaneos la
  // cobertura era casi permanente —medido: el cañon paso de 3 salvas a 1 en 15 s— y un escudo
  // constante no es una mecanica, es apagar una capa. Asi queda un RITMO: unos segundos cubierto,
  // unos segundos solo. Aprender a entrar en el hueco del compañero es el juego.
  if (hueco && A.waveT <= 0 && !A.wave.length && run.lives > 1 && A.doneT <= 0 && !A.spent) {
    A.waveT = PS.WAVE_GAP_S;
    // se alternan los lados y los carriles: dos corridas iguales seguidas se leen como una sola
    A.waveN = (A.waveN + 1) % 2;
    const idx = 1 + (A.waveN % Math.max(1, run.lives - 1));
    A.wave.push({
      t: 0, side: A.waveN ? 1 : -1, lane: (A.waveN ? 1 : -1) * 34,
      pilot: pilotName(idx), dropped: 0, hurt: 0,
    });
    popup(W / 2, 70, T('pasada_wave_in', { c: pilotName(idx) }), P.foam);
    if (!sfxOne('waveFly')) beep(520, 0.12, 'square', 0.04, 700);
  }
  for (const w of A.wave) {
    w.t += dt;
    // LA SUELTA DEL COMPAÑERO, a mitad de camino: donde estaria tu ventana.
    if (!w.dropped && w.t >= PS.WAVE_T * 0.5) {
      w.dropped = 1;
      const p = wavePos(w);
      A.fx.push({ k: 'splash', x: p.x, y: 0, z: p.z, vr: 26, life: 0.9, T: 0 });
      const viva = zones.filter(z => z.hp > 0);
      if (Math.random() < PS.WING_HIT_P && viva.length) {
        // ABLANDAN, NO REMATAN. Si queda UNA sola zona viva, la bomba del compañero la deja en
        // pie: el ultimo golpe es tuyo. Sin esta regla la oleada te puede hundir el buque mientras
        // volvias, y el modo entero se convierte en mirar trabajar a otros.
        const z = viva[(Math.random() * viva.length) | 0];
        if (viva.length === 1) {
          z.hp = Math.max(1, z.hp - BOMB.DMG);
          A.hitFx = 1;
          popup(W / 2, 62, T('pasada_wave_hit', { c: w.pilot }), P.accent, true);
        } else {
          hitZone(z.id, BOMB.DMG);
          popup(W / 2, 62, T('pasada_wave_hit', { c: w.pilot }), P.accent, true);
        }
      } else popup(W / 2, 62, T('pasada_wave_miss', { c: w.pilot }), P.dim);
      boom(0.12);
    }
    // LA DEFENSA LE COBRA A EL. Nunca lo mata: vuelve averiado y lo dice por radio.
    if (!w.hurt && w.t >= PS.WAVE_T * 0.62) {
      w.hurt = 1;
      if (Math.random() < PS.WAVE_HURT_P) {
        popup(W / 2, 78, T('pasada_wave_hurt', { c: w.pilot }), P.warn);
        if (!sfxOne('exSmall')) boom(0.10);
      }
    }
  }
  const antes = A.wave.length;
  A.wave = A.wave.filter(w => w.t < PS.WAVE_T);
  if (antes && !A.wave.length) A.waveT = PS.WAVE_GAP_S;   // el hueco empieza cuando el sale
}

/** Un cuadro de las tres capas. Devuelve { death } si alguna te agarro; null si no. */
function stepDefensa(dt, rad) {
  if (!defOn || A.doneT > 0 || A.spent) return null;

  // ---- capa 1: EL CAÑON (RF-04) ----
  // UN BLANCO POR VEZ, Y SOLO EL CAÑON. Si un Fiel esta en SU corrida, las columnas son para el —
  // y esos segundos limpios son lo que la oleada te REGALA: la unica ayuda del modo que no sale de
  // un HUD sino de que haya alguien mas volando.
  //
  // OJO CON EL ALCANCE DE ESTA REGLA. Al principio tapaba TAMBIEN al Sea Dart, y estaba mal: el
  // cañon apunta a UN avion, pero un misil de AREA no te deja de ver porque otro este corriendo
  // del otro lado, y el techo de radar es sobre TU altura. Confundirlos hacia de la oleada un
  // escudo que apagaba media fase — y rompio la prueba del Dart, que es como se encontro.
  if (amigoCorriendo()) A.gunT = Math.max(A.gunT, PS.GUN_EVERY_S * 0.4);
  else stepCanon(dt, rad);

  // ---- capa 2: EL TECHO DE RADAR (RF-03) ----
  // Cruzarlo LEJOS te compra un Sea Dart, corra quien corra. Volar abajo no es que "esquiva
  // mejor": es que el misil no existe. Esa es la diferencia entre una estadistica y una regla.
  if (!A.dartUsed && A.pos.y > PS.RADAR_CEIL_M && rad > PS.POPUP_DIST_M) fireDart();

  return catYFusileria(dt, rad);
}

/** EL CAÑON DE 4,5" (RF-04): la punteria que se hace y la salva que camina. */
function stepCanon(dt, rad) {
  // LA PUNTERIA SE HACE. Mientras mantengas el rumbo, el tirador corrige y la proxima salva cae
  // mas cerca; un quiebre suave le borra la correccion y vuelve a tantear. De ahi sale sola la
  // regla del spec —6 s derecho te alcanzan, zigzag suave pasas— sin tirar un solo dado.
  const yawV = Math.atan2(A.vel.x, -A.vel.z);
  let dy = yawV - A.aimYaw;
  while (dy > Math.PI) dy -= Math.PI * 2;
  while (dy < -Math.PI) dy += Math.PI * 2;
  if (Math.abs(dy) > PS.GUN_RESET_RAD) { A.aimN = 0; A.aimYaw = yawV; }
  if (rad < PS.GUN_RANGE_M) {
    A.gunT -= dt * (1 + A.heat);
    if (A.gunT <= 0) { A.gunT = PS.GUN_EVERY_S; fireGuns(); }
  } else A.gunT = Math.min(A.gunT, PS.GUN_EVERY_S * 0.5);
}

/** Las capas CORTAS (RF-08). Separadas del cañon porque siguen valiendo aunque el cañon este
 *  ocupado con un compañero: el Sea Cat y la fusileria son del buque que tenes encima, y ese no
 *  deja de ser tuyo porque otro este corriendo del otro lado. */
function catYFusileria(dt, rad) {
  // ---- capa 3: SEA CAT Y FUSILERIA (RF-08) ----
  // El Sea Cat sale UNA vez por corrida cuando ya estas encima: en el egreso, o en el salto si te
  // demoraste arriba. Las dos son la misma falta — quedarse.
  if (!A.catUsed && rad < PS.POPUP_DIST_M && (A.fase === 'egreso' || A.pos.y > PS.BAND_SWEET_MAX)) fireCat();
  if (A.cat) {
    A.cat.t += dt;
    const yaw = Math.atan2(A.vel.x, -A.vel.z);
    let d = yaw - A.cat.yaw0;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    if (A.cat.t <= PS.SEACAT_DODGE_S && Math.abs(d) >= PS.CAT_BREAK) A.cat.dodged = 1;
    if (A.cat.t >= PS.CAT_T) {
      const esquivado = A.cat.dodged;
      A.cat = null;
      if (esquivado) { popup(W / 2, 52, T('pasada_break_ok'), P.accent); beep(660, 0.12, 'square', 0.05, 980); }
      else if (golpe('death_missile')) return { death: 'death_missile' };
    }
  }
  // FUSILERIA: sin proyectiles y sin esquive, y acotada a la HUELLA DEL CASCO. Es el precio de
  // QUEDARSE encima, no de pasar por encima: cruzar la eslora a 110 m/s son 1,2 s y no llega a
  // morder. El que se queda dando vueltas sobre la cubierta, si.
  if (Math.abs(A.pos.x) < PS.FUS_X && Math.abs(A.pos.z) < PS.FUS_Z && A.pos.y < PS.FUS_ALT) {
    A.fusT += dt;
    run.shake = Math.max(run.shake, 0.7);
    if (A.fusT >= PS.FUS_BITE_S) {
      A.fusT = 0;
      if (!sfxOne('exXsmall')) beep(110, 0.07, 'square', 0.04);
      if (golpe('death_gunfire')) return { death: 'death_gunfire' };
    }
  } else A.fusT = Math.max(0, A.fusT - dt * 0.6);   // se enfria al salir: no es una cuenta eterna
  return null;
}

export function update(dt, inp) {
  A.t += dt;
  popups.forEach(p => { p.y -= 14 * dt; p.life -= dt; });
  prune(popups, p => p.life > 0);
  A.hitFx = Math.max(0, A.hitFx - dt * 5);

  // ---------- MANDO: identico al arena (modelo E1/E2, angulos comandados) ----------
  // W/S piden CABECEO (la fila INVERTIR EJE Y de OPCIONES da vuelta el gesto), Q/E y el stick
  // derecho piden BANQUEO —y banquear ES virar—, A/D derrapan fino, [F]/L2 frena.
  // NO hay reparto de energia (S1) ni media vuelta (E3): son sistemas del ARENA, y el spec pide
  // "ningun control nuevo" en la pasada, no "todos los controles del arena".
  const io = {
    pitch: (cfg.arenaInv ? -1 : 1) * (inp.u - inp.d),
    roll: (inp.rollR || 0) - (inp.rollL || 0) + (inp.rollAx || 0),
    slip: inp.r - inp.l,
    brake: !!(inp.sink || inp.brake),
    boost: !!(inp.turbo && run.fuel > 0),
  };
  const av = dmg.fx();
  io.turboMul = av.spd;
  io.accMul = av.agil;
  if (!av.turbo) io.boost = false;
  run.boost = io.boost;

  // ---------- LA CORREA: la zona es acotada y te trae (misma idea que el ring del arena) ----------
  const rad = Math.hypot(A.pos.x, A.pos.z);
  if (rad > PS.ZONE_R) A.outT += dt; else A.outT = 0;
  if (A.outT > ZONE_GRACE) A.auto = 1;
  if (A.auto) {
    const want = Math.atan2(-A.pos.x, A.pos.z);
    let dyaw = want - A.yaw;
    while (dyaw > Math.PI) dyaw -= Math.PI * 2;
    while (dyaw < -Math.PI) dyaw += Math.PI * 2;
    io.roll = Math.max(-1, Math.min(1, dyaw * 1.6));
    io.pitch = 0; io.slip = 0; io.brake = false; io.boost = false;
    if (rad < PS.ZONE_R * AUTO_OFF && Math.abs(dyaw) < 0.5) { A.auto = 0; A.outT = 0; }
  }

  // ---------- VUELO: un paso del modelo (aero.js muta yaw/pitch/roll/spd/vx) ----------
  A.drift = drifting(A, io.brake) ? 1 : 0;
  stepFlight(A, io, dt);
  A.fwd = forward(A.yaw, A.pitch);
  stepVel(A.vel, A.fwd, A.drift, dt);
  A.vy = A.vel.y * A.spd;             // la vy es CONSECUENCIA de por donde VIAJA el avion
  A.up = { x: 0, y: 1, z: 0 };

  // ---------- POSICION ----------
  const rx = Math.cos(A.yaw), rz = Math.sin(A.yaw);
  A.pos.x += (A.vel.x * A.spd + rx * A.vx) * dt;
  A.pos.z += (A.vel.z * A.spd + rz * A.vx) * dt;
  A.pos.y += A.vy * dt;
  if (A.pos.y > AR.ALT_MAX) { A.pos.y = AR.ALT_MAX; if (A.pitch > 0) A.pitch = 0; }
  A.lowT = (A.pos.y < LOW_WARN && A.vy < 0) ? (A.lowT || 0) + dt : 0;
  if (A.pos.y < PS.RADAR_CEIL_M) lowT += dt;      // sonda: cuanto se vuela DEBAJO del techo
  if (A.doneT <= 0) {
    if (A.pos.y < SEA_KILL) { A = null; return { death: 'death_sea' }; }
    if (world3D.hitsShip(A.pos.x, A.pos.y, A.pos.z)) { A = null; return { death: 'death_mast' }; }
  }

  // ---------- LA CORRIDA: entrar a la ventana cuenta una ----------
  // Se mide con la distancia YA integrada de este cuadro (`rad` de arriba es la del anterior: la
  // usa la correa, que decide sobre donde estabas). La histeresis —entra a POPUP_DIST, se re-arma
  // pasando POPUP + ENTRY_CLEAR— es lo que hace que una vuelta completa sea UNA corrida y no un
  // contador que tiembla en el borde.
  const radNow = Math.hypot(A.pos.x, A.pos.z);
  if (radNow < PS.POPUP_DIST_M) {
    if (!A.inRun) {
      A.inRun = 1; A.corrida++; corridas++;
      // CADA CORRIDA TRAE SU DART Y SU SEA CAT (RF-03/RF-08): son uno por pasada, no uno por
      // batalla. Y desde la segunda sube el CALOR (RF-09): insistir es legal —la doctrina real era
      // una sola pasada— y lo que cuesta es que el tirador ya te tomo el tiempo.
      A.dartUsed = 0; A.catUsed = 0;
      if (A.corrida > 1) {
        A.heat += PS.HEAT_RATE;
        // RF-09 — LAS DOS MANERAS DE VOLVER, y no hay menu: es COMO volaste la vuelta.
        //   por abajo  (viraje lateral)  rapido y barato, pero te cruzas de frente con la oleada
        //   por arriba (chandelle)       mas nafta, y el lomo de la subida te asoma al Sea Dart
        // El precio de la chandelle ya se cobro solo mientras volvias (la nafta extra de abajo y,
        // si cruzaste el techo, un lanzamiento). Esto solo lo NOMBRA — sin nombre, el jugador que
        // volvio por arriba y la paso mal no tiene como saber que habia otra manera.
        popup(W / 2, 70, T(A.reHigh ? 'pasada_re_chan' : 'pasada_re_lat'), P.dim);
      }
      A.reHigh = 0;
    }
  } else if (radNow > OUT_R) A.inRun = 0;
  // NO HAY REARME (RF-15). Antes, salir de la ventana reponia la ristra: el modelo era un piloto
  // con pasadas ilimitadas, y el recurso escaso eran la nafta y el calor. Ahora el recurso es la
  // FORMACION — soltar cierra tu corrida y entra el siguiente— asi que el rearme quedo sin caso
  // posible: si soltaste no vas a volver a pasar, y si no soltaste tenes la ristra entera.

  // ---------- EL CONTADOR DE SUELTA, Y SU TIC-TAC ----------
  // El numero lo dibuja el HUD; acá vive el SONIDO, porque el tic-tac es la mitad del indicador:
  // en la corrida la vista esta en el buque y en el mar, no en un renglon. El periodo sale del
  // TIEMPO que falta (metros / velocidad en el plano), no de los metros: a 100 m/s y a 60 m/s los
  // mismos 300 metros son dos corridas distintas, y lo que el oido tiene que aprender es el ritmo
  // que precede a la ventana. Se acelera y sube de tono al acercarse; con la ventana abierta es un
  // trino agudo y parejo que dice SOLTA. Calla si no hay bombas o si no estas encarado.
  A.rad = radNow;
  A.cue = A.doneT > 0 ? null : releaseCue();
  A.cueT -= dt;
  if (A.cue !== null && A.bombs > 0 && !A.ripple && A.doneT <= 0) {
    const vg = Math.max(1, Math.hypot(A.vel.x, A.vel.z) * A.spd);
    const tRel = A.cue / vg;
    if (A.cueT <= 0) {
      const abierta = A.cue === 0;
      const per = abierta ? 0.13 : Math.max(0.13, Math.min(0.75, tRel * 0.42));
      // el tono sube de 520 a 1250 Hz en los ultimos 3 segundos: es la cuenta regresiva
      const k = abierta ? 1 : Math.max(0, Math.min(1, 1 - tRel / 3));
      beep(520 + k * 730, abierta ? 0.05 : 0.04, 'square', abierta ? 0.045 : 0.03);
      A.cueT = per;
    }
  } else A.cueT = 0;

  // ---------- LA SUELTA: [Z] por FLANCO, y la ristra sale escalonada ----------
  if (inp.msl && !A.msl) release();
  A.msl = inp.msl ? 1 : 0;
  if (A.ripple > 0) {
    A.rippleT -= dt;
    if (A.rippleT <= 0) { dropOne(io.boost); A.ripple--; A.rippleT = PS.RIPPLE_S; }
  }

  // EL RAS SE ESCUCHA (RF-03 / P5). La recompensa de volar pegado al agua no puede ser solamente
  // que no salga un misil: eso es una AUSENCIA, y una ausencia no se siente. Abajo del techo de
  // radar el motor y el mar CRECEN — el avion suena pesado, cercano, y la altura deja de ser un
  // numero del HUD para ser algo que se oye. Es la unica manera honesta de premiar volar bajo sin
  // poner un indicador que diga "estas volando bajo".
  const ras = Math.max(0, Math.min(1, 1 - A.pos.y / PS.RADAR_CEIL_M));
  engineFly(A.spd, run.boost, (run.boost ? 0.030 : 0.017) * (1 + ras * 0.85));
  A.sprayT -= dt;
  if (A.pos.y < PS.SAPITO_ALT_M * 1.6 && A.sprayT <= 0 && A.doneT <= 0) {
    A.sprayT = 0.5 + Math.random() * 0.5;                  // salpicado: el mar te esta rozando
    if (!sfxOne('waterNear', 0.5 + ras * 0.5)) beep(240, 0.09, 'sine', 0.03, 420);
  }
  if (run.boost) run.shake = Math.max(run.shake, 0.8);
  // NAFTA (RF-10): es EL RELOJ de tu corrida. Drena al mismo ritmo que el pasillo y solo si esta
  // encendida en OPCIONES —que una opcion se comporte distinto por fase seria una trampa— y con
  // el tanque de PASS_TANK que repone enter() da ~31 s por avion. Secarlo lo cobra finDePasada().
  // La CHANDELLE cuesta: volver por arriba quema mas. Es el precio de RF-09 hecho combustible, y
  // se paga mientras se vuela, no en un cartel al final.
  if (A.fase === 'reencare' && A.pos.y > PS.RADAR_CEIL_M) A.reHigh = 1;
  const gastoExtra = A.reHigh && A.fase === 'reencare' ? 1.7 : 0;
  if (cfg.fuelOn && !io.brake) run.fuel = Math.max(0, run.fuel - dt * (3.2 + gastoExtra));

  // ---------- hundimiento (outro) ----------
  if (A.doneT > 0) {
    A.doneT -= dt;
    A.boomT -= dt;
    if (A.boomT <= 0) {
      A.boomT = 0.3 + Math.random() * 0.22;
      const z = zones[(Math.random() * zones.length) | 0];
      const r = world3D.zoneRect3D(z.id);
      if (r) {
        const bx = r.x + Math.random() * r.w, by = r.y + Math.random() * r.h;
        for (let i = 0; i < 10; i++) parts.push({
          x: bx, y: by, vx: (Math.random() - 0.5) * 110, vy: -(30 + Math.random() * 80),
          life: 0.55, c: Math.random() < 0.6 ? P.warn : '#7c838a', r: 1.7,
        });
        A.fx.push({ k: 'fk', x: bx, y: by, vr: 14 + Math.random() * 10, life: 1.2, T: 0 });
      }
      boom(0.16); run.shake = Math.min(6, run.shake + 1.5);
    }
    stepFx(dt);
    if (A.doneT <= 0) { A = null; return 'objective'; }
    return;
  }

  // P3: columnas, Sea Dart, Sea Cat, fusileria · P4 pendiente: los dos re-encares con su calor
  // (necesitan el eje de ataque de P1 y el cañon de P3) · P7: la oleada.
  // ---------- P3: LA DEFENSA POR CAPAS ----------
  // Va DESPUES del vuelo y de la posicion (las columnas apuntan a donde vas, y eso se sabe recien
  // con la velocidad de este cuadro) y ANTES del fin de pasada, para que un impacto de esta capa
  // gane a la corrida gastada: si te bajaron, te bajaron.
  const muerte = stepDefensa(dt, radNow);
  if (muerte) { A = null; return muerte; }
  stepOleada(dt);        // P7: los Fieles hacen las suyas mientras vos das la vuelta

  stepFase(radNow);
  // CRUZAR LA PUERTA ENCARADO SE FESTEJA, una sola vez por vuelta. Es el instante en que el
  // jugador entiende que el eje era el punto — y entenderlo por un acierto propio vale mucho mas
  // que leerlo en un cartel de tutorial, que es lo unico que este juego no se puede permitir.
  if (A.gate && !A.gateOk && axisAlign() >= PS.AXIS_OK
    && Math.hypot(A.pos.x - A.gate.x, A.pos.z - A.gate.z) < PS.RACE_GATE_R) {
    A.gateOk = 1;
    // A 66 y no a 44: los popups SUBEN, y desde 44 este entraba justo en el renglon del contador
    // de suelta (medido en captura, tachandolo). Debajo del centro sube por cielo despejado.
    popup(W / 2, 66, T('pasada_axis'), P.accent);
    beep(880, 0.09, 'square', 0.05, 1250);
  }
  A.banda = bandaDe(A.pos.y);
  const fxMuerte = stepFx(dt);
  if (fxMuerte) { A = null; return fxMuerte; }
  return finDePasada(dt);
}

/** RF-15 — EL FIN DE TU PASADA: un avion, una suelta.
 *
 *  La regla entera del clímax está acá. Soltaste: pegues o no, tu corrida termino y entra el
 *  siguiente del roster. No soltaste: seguis vos, y lo pagas en nafta — que es exactamente la
 *  decision que el modo ofrece, ¿tiro ya o me la juego a dar otra vuelta?
 *
 *  Dos detalles que NO son adorno:
 *  · Se espera a que no quede NINGUNA bomba en el aire. Cortar cuando la ristra sale del avion
 *    dejaria al jugador sin ver donde cayo lo que tiro, o sea sin la unica leccion de la corrida.
 *  · Con el buque hundiendose (doneT) no hay fin de pasada: ganaste, y el relevo seria absurdo.
 *
 *  Devuelve `{ spent, dmg }` — y game.js decide, como siempre: queda formacion → releva; era el
 *  ultimo avion → mision perdida. Este modulo no llama hacia arriba. */
function finDePasada(dt) {
  if (A.doneT > 0) return null;
  if (!A.spent) {
    const enVuelo = A.fx.some(f => f.k === 'bomb');
    if (!A.bombs && !A.ripple && !enVuelo) A.spent = 'ristra';
    // TANQUE SECO (RF-10): tambien cierra la corrida, y es el PEOR de los dos finales — perdiste
    // el avion sin haber tirado. Es lo que le pone precio a dudar.
    else if (cfg.fuelOn && run.fuel <= 0) A.spent = 'seca';
    if (A.spent) {
      A.spentT = PS.PASS_END_T;
      const hecho = A.hp0 - hpTotal();
      const clave = A.spent === 'seca' ? 'pasada_dry' : (hecho > 0 ? 'pasada_hit' : 'pasada_miss');
      popup(W / 2, 48, T(clave), hecho > 0 ? P.accent : P.warn, true);
      beep(hecho > 0 ? 420 : 200, 0.4, 'sawtooth', 0.05, hecho > 0 ? 300 : 110);
    }
  }
  if (A.spent) {
    A.spentT -= dt;
    if (A.spentT <= 0) {
      const sig = { spent: A.spent, dmg: A.hp0 - hpTotal() };
      A = null;
      return sig;
    }
  }
  return null;
}

/** RF-12 — EL RALENTI DE LA VENTANA. Multiplicador de tiempo del mundo mientras corres los
 *  ultimos metros: el juego respira hondo justo donde hay que decidir. Lo aplica game.js sobre el
 *  dt del cuadro (como el MOMENTUM, con el que se MULTIPLICA), nunca un reloj de pared.
 *
 *  Corre solo cuando la decision existe: dentro de POPUP_DIST_M, con bombas y sin haber soltado.
 *  Pasada la suelta el mundo vuelve a 1x — el ralenti es para elegir, no para mirar. */
export function slow() {
  if (!A || !cfg.pasadaSlow || A.doneT > 0 || A.spent) return 1;
  if (A.bombs <= 0 || A.ripple > 0) return 1;
  return A.rad < PS.POPUP_DIST_M ? PS.SLOW_FACTOR : 1;
}

/** Avanza los efectos del mundo: las bombas en vuelo, las columnas del cañon, el Sea Dart y el
 *  hundimiento. Devuelve { death } si algo de eso te agarro — como siempre, decide game.js. */
function stepFx(dt) {
  let death = null;
  for (const f of A.fx) {
    f.life -= dt;
    f.T += dt;                    // reloj propio del efecto: de el salen el crecimiento y el humo

    // ---- COLUMNA DE AGUA (RF-04): el pepinazo del cañon de 4,5" ----
    // Es un LUGAR, no un proyectil: la salva ya eligio donde caer y camina hacia donde ibas. Por
    // eso se esquiva cambiando de rumbo y no reaccionando — cuando la ves subir, la decision que
    // te salva ya la tomaste hace un segundo.
    if (f.k === 'col') {
      if (f.T < f.wait) continue;                       // todavia viene bajando el proyectil
      const dt0 = f.T - f.wait;
      if (dt0 <= dt) {                                  // el cuadro en que revienta
        A.fx.push({ k: 'splash', x: f.x, y: 0, z: f.z, vr: 30, life: 1.0, T: 0 });
        if (!sfxOne('exSmall')) boom(0.09);
        const dh = Math.hypot(A.pos.x - f.x, A.pos.z - f.z);
        A.colSum += dh; A.colN++;                       // sonda del calor: la media de la metralla
        if (dh < PS.COL_R * 3) run.shake = Math.min(6, run.shake + 1.4);
      }
      // LETAL MIENTRAS SUBE, no para siempre: la columna es agua y cae sola.
      if (!f.hit && dt0 > 0 && dt0 < 0.55 && A.doneT <= 0 && !A.spent) {
        const dh = Math.hypot(A.pos.x - f.x, A.pos.z - f.z);
        if (dh < PS.COL_R && A.pos.y < 70) {
          f.hit = 1;
          if (golpe('death_aa')) death = { death: 'death_aa' };
        }
      }
      continue;
    }

    // ---- SEA DART (RF-03): el misil de area del techo de radar ----
    // Persigue con RITMO DE VIRAJE LIMITADO — menos que el avion. Ahi vive el esquive: no hay
    // dado ni ventana, hay geometria, y un quiebre sostenido lo deja pasar de largo.
    if (f.k === 'dart') {
      const dx = A.pos.x - f.x, dy = A.pos.y - f.y, dz = A.pos.z - f.z;
      const dl = Math.hypot(dx, dy, dz) || 1;
      const k = Math.min(1, PS.DART_TURN * dt);
      f.vx += (dx / dl - f.vx) * k; f.vy += (dy / dl - f.vy) * k; f.vz += (dz / dl - f.vz) * k;
      const vl = Math.hypot(f.vx, f.vy, f.vz) || 1;
      f.vx /= vl; f.vy /= vl; f.vz /= vl;
      f.x += f.vx * PS.DART_V * dt; f.y += f.vy * PS.DART_V * dt; f.z += f.vz * PS.DART_V * dt;
      if (f.y < 1) f.life = 0;
      if (dl < PS.DART_HIT && A.doneT <= 0 && !A.spent) {
        f.life = 0;
        A.fx.push({ k: 'splash', x: f.x, y: f.y, z: f.z, vr: 34, life: 0.9, T: 0 });
        if (golpe('death_missile')) death = { death: 'death_missile' };
      }
      continue;
    }

    if (f.k === 'bomb') {
      // BALISTICA: hereda la velocidad del avion y cae con gravedad REAL. El impacto se resuelve
      // por el SEGMENTO recorrido en este cuadro y no por el punto — a 100 m/s son 1.7 m por
      // cuadro, pero picando fuerte el paso crece y el casco se puede saltear entre dos cuadros.
      f.vy -= BOMB.G * dt;
      const dx = f.vx * dt, dy = f.vy * dt, dz = f.vz * dt;
      const len = Math.hypot(dx, dy, dz) || 1;
      const hit = world3D.shootRay({ x: f.x, y: f.y, z: f.z }, { x: dx / len, y: dy / len, z: dz / len }, len + BOMB.R);
      if (hit) {
        f.x += (dx / len) * hit.dist; f.y += (dy / len) * hit.dist; f.z += (dz / len) * hit.dist;
        bombHit(f, hit);
        continue;
      }
      f.x += dx; f.y += dy; f.z += dz;
      if (f.y <= 0) {
        // EL SAPITO pica UNA vez: si el rebote la deja entrar al casco, entro. Corta se hunde;
        // larga, el pique la manda POR SOBRE la cubierta y sigue de largo, a la vista.
        if (f.sapito && !f.skipped) {
          f.skipped = 1; f.y = 0.5; f.vy = Math.abs(f.vy) * BOMB.SKIP_V;
          A.fx.push({ k: 'splash', x: f.x, y: 0, z: f.z, vr: 12, life: 0.5, T: 0 });
          if (!sfxOne('waterNear')) beep(300, 0.08, 'sine', 0.04, 500);
          continue;
        }
        f.y = 0;
        bombHit(f, null);
      }
      continue;
    }
    if (f.vx !== undefined && f.k !== 'splash') { f.x += f.vx * dt; f.y += f.vy * dt; }
  }
  A.fx = A.fx.filter(f => f.life > 0);
  return death;
}

/** Las corridas amigas, con su posicion ya resuelta — el render no repite la coreografia. */
export function oleada() { return A ? A.wave.map(w => ({ ...wavePos(w), u: w.t / PS.WAVE_T, pilot: w.pilot })) : []; }

/** El snapshot que el render 3D necesita del avion (solo lectura). */
export function camState() { return A; }

// SONDAS de desarrollo (SPEC §7) — QUITAR al cerrar la pasada.
// __pset coloca el avion a `dist` metros del buque, a `alt` de altura, con `off` radianes de
// desvio del eje: es lo que permite medir bandas, ristras y sapitos sin volar a ciegas.
if (typeof window !== 'undefined') window.__pset = (dist, alt, off) => {
  if (!A) return 'no pasada';
  const a = off || 0;
  A.pos.x = Math.sin(a) * dist; A.pos.z = Math.cos(a) * dist; A.pos.y = alt;
  A.yaw = -a; A.pitch = -Math.atan2(alt - 20, dist); A.roll = 0;
  A.drift = 0;
  A.fwd = forward(A.yaw, A.pitch); A.vel = { ...A.fwd };
  return 'ok';
};
// __pdrop: suelta la ristra SIN pasar por la tecla. Existe por una razon de medicion: cruzando la
// manga del buque la ventana de suelta dura 0,3 s a 110 m/s, y un ida y vuelta de sondeo (poner el
// avion, leer, mandar la tecla) ya la deja atras. Con esto, colocar y soltar es UNA sola llamada.
if (typeof window !== 'undefined') window.__pdrop = () => { if (!A) return 'no pasada'; release(); return 'ok'; };
// __pflip: da vuelta el rumbo 180 grados sin mover el avion. Es como se prueba el EGRESO —el tramo
// en que te alejas del buque, que es el que arma la puerta de re-encare— sin volar los diez
// segundos de un sobrevuelo real, y sin depender de que el avion sobreviva al paso por encima.
if (typeof window !== 'undefined') window.__pflip = () => {
  if (!A) return 'no pasada';
  A.yaw += Math.PI;
  A.fwd = forward(A.yaw, A.pitch); A.vel = { ...A.fwd };
  return 'ok';
};
// __pdef: prende o apaga la defensa por capas. Ver el comentario de `defOn`.
if (typeof window !== 'undefined') window.__pdef = v => { defOn = !!(+v); return defOn; };
// __pinv: invulnerable a la defensa (no al mar ni al buque). Ver el comentario de `invul`.
if (typeof window !== 'undefined') window.__pinv = v => { invul = !!(+v); return invul; };
// __pheat: fija el CALOR de la defensa y reinicia la sonda de la metralla. El calor sube una vez
// por re-encare (RF-09) y su efecto se mide en la MEDIA de que tan cerca te cae la salva, asi que
// probarlo por las buenas serian tres corridas completas por cada medicion.
if (typeof window !== 'undefined') window.__pheat = v => {
  if (!A) return 'no pasada';
  A.heat = Math.max(0, +v || 0); A.colSum = 0; A.colN = 0;
  return A.heat;
};
// __plives: fija los aviones que quedan. RF-15 hizo del escuadron el recurso del clímax, y su caso
// borde —el ULTIMO avion, donde gastar la pasada ya no releva sino que PIERDE la mision— tardaria
// cuatro corridas enteras en llegar por las buenas.
if (typeof window !== 'undefined') window.__plives = n => { run.lives = Math.max(1, n | 0); return run.lives; };
// __pseca: seca el tanque. Es el otro final de una corrida (RF-10) y por las buenas son 31 segundos
// de vuelo; ademas prende el combustible, que viene apagado por default en OPCIONES.
if (typeof window !== 'undefined') window.__pseca = () => { cfg.fuelOn = true; run.fuel = 0; return 'ok'; };
// __pkill: vacia todas las zonas vivas — prueba el FIN de la pasada y lo que encadena despues.
if (typeof window !== 'undefined') window.__pkill = () => {
  if (!A || !zones) return 'no pasada';
  for (const z of zones) if (z.hp > 0) { z.hp = 1; hitZone(z.id, 1); }
  return 'ok';
};
if (typeof window !== 'undefined') window.__pdbg = () => A && JSON.stringify({
  corrida: A.corrida, fase: A.fase || 'ingreso',
  eje: +axisAlign().toFixed(2), encarado: axisAlign() >= PS.AXIS_OK,   // P1: alineacion con la eslora
  puerta: A.gate ? (A.gate.x | 0) : null, chandelle: A.reHigh,
  x: A.pos.x | 0, y: A.pos.y | 0, z: A.pos.z | 0, r: Math.hypot(A.pos.x, A.pos.z) | 0,
  alt: +A.pos.y.toFixed(1), banda: A.banda || bandaDe(A.pos.y),
  bajoTecho: A.pos.y < PS.RADAR_CEIL_M,
  yaw: +A.yaw.toFixed(2), pitch: +A.pitch.toFixed(2), roll: +A.roll.toFixed(2),
  spd: A.spd | 0, vy: +A.vy.toFixed(1), drift: A.drift,
  bombas: A.bombs, ristra: A.ripple, vuelo: A.fx.filter(f => f.k === 'bomb').length,
  sapitos: A.sapitos, duds: A.duds,
  impacto: (() => { const p = impactPoint(); return p ? +p.d.toFixed(0) : null; })(),
  cue: A.cue,                                     // metros hasta la ventana (0 = ahora, null = no encara)
  nafta: run.fuel | 0, calor: +A.heat.toFixed(2),
  gastada: A.spent, lenta: +slow().toFixed(2),     // RF-15: como termino la corrida · RF-12: ralenti
  salvas: A.salvas, dart: A.dartUsed, cat: A.cat ? +A.cat.t.toFixed(1) : null,   // P3: las capas
  punteria: +Math.min(1, A.aimN / PS.GUN_AIM_SALVOS).toFixed(2),   // cuanto te tiene tomado (RF-04)
  disp: A.lastJit === null ? null : +A.lastJit.toFixed(0),        // dispersion de la ultima salva
  colDist: A.colN ? +(A.colSum / A.colN).toFixed(0) : null,   // distancia media de la metralla
  colN: A.colN,
  fus: +A.fusT.toFixed(1),
  zonas: zones.filter(z => z.hp > 0).length,
  hp: zones.reduce((s, z) => s + Math.max(0, z.hp), 0) | 0,
  oleada: A.wave.map(w => ({ p: w.pilot, t: +w.t.toFixed(1) })),   // P7: quien esta corriendo
  cubierto: amigoCorriendo(),                     // ¿el cañon esta ocupado con un compañero?
  out: +A.outT.toFixed(1), auto: A.auto, vista: viewMode,
  vidas: run.lives, corridas, lowT: +lowT.toFixed(1),
});
