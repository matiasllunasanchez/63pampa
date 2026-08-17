// FASE ARENA: el climax como COMBATE AEREO en un espacio 3D abierto y acotado. Vocabulario
// completo (PASILLO/ARENA, y por que "MOMENTUM" NO es el nombre de esto) en docs/ARQUITECTURA.md.
//
// El avion VUELA de verdad — posicion y orientacion propias en un mundo 3D (systems/three-arena.js),
// no una camara sobre rieles. La version anterior rotaba el BUQUE con la camara clavada y el
// resultado era la misma galeria de tiro con otro disfraz; ver docs/PROMPT_ARENA_VUELO_LIBRE.md.
//
// EL VUELO ES EL MODELO E1/E2 DEL PLAN (core/aero.js, PLAN_MINUTOS_SAGRADOS): el jugador
// comanda ANGULOS — W/S cabeceo hasta ±51°, Q/E + stick derecho banqueo, y BANQUEAR ES VIRAR.
// La gravedad pelea contra la velocidad (trepar sangra, picar regala) y hay FRENO ([F] / L2)
// ademas de turbo. El modelo anterior (heredado del pasillo, vy comandada con cabeceo emergente
// topeado en 8°) esta medido y documentado en el plan §2; sus numeros viven en el historial de
// tools/feeltest.js. A/D quedan como derrape fino de punteria.
// El cañon dispara por el MORRO (la mira marca adonde va el tiro, no al reves).
//
// RING: al cruzar el borde el juego te deja salir, avisa, y a los RING_GRACE segundos toma el
// control y te reencara al centro. No es un muro ni una muerte: es una correa.
//
// MISMA REGLA DEL LIMITE que el resto: update() devuelve señal ('objective' | { death }) y
// game.js decide (relevo del escuadron o derribo). Este modulo no llama hacia arriba.
//
// ESCALA: 1 unidad = 1 METRO (ver three-arena.js). Las constantes de abajo estan en m y m/s.

import { setState, stats, cfg } from '../core/state.js';
import { run } from '../core/run.js';
import { parts, popups, prune, clearWorld } from '../core/world.js';
import { popup } from '../core/fx.js';
import { T } from '../core/i18n.js';
import { P } from '../data/palette.js';
import { MOM_LAYOUTS, SHIP_CLASS } from '../data/ships.js';
import { MSL_MAX, GUN_HEAT_SHOT, GUN_COOL_FIRE, GUN_COOL_IDLE, GUN_RESET } from '../data/tuning.js';
import { W, H, HOR } from '../render/ctx.js';
import { boom, beep, sfxOne, duck, engineFly } from './audio.js';
import * as world3D from './three-arena.js';

// ---- VUELO: MODELO E1/E2, formulas en core/aero.js (puras, medibles por feeltest) ----
// Aca queda solo el estado y el mundo. La cadena corta del pasillo (input → estado en UNA
// integracion) se conserva; el sobre de vuelo ya no: el techo de cabeceo de 8° que impedia
// picar sobre el buque era la herencia del scroll lateral (plan §2.2 y §3).
import {
  forward, stepFlight, vyOf, slipAngle,
  startUturn, stepUturn, drifting, stepVel, driftAngle,
} from '../core/aero.js';
import { AR } from '../data/arena.js';
// AVERIAS: quien decide si un impacto MATA o solo lastima es systems/damage.js, segun el modelo
// de vida elegido en OPCIONES. Antes cualquier toque era muerte y punto.
import * as dmg from './damage.js';
// El PISO no es blando: el mar MATA (SEA_KILL) — la regla del juego entero, que el arena no
// puede suspender. El techo vive en AR.ALT_MAX (600: el 200 anterior era el parche del cabeceo).
const SEA_KILL = 3.5;                   // altura de impacto contra el agua (la cresta de la ola)
const LOW_WARN = 16;                    // debajo de esto y cayendo, el HUD grita ANTES de morir

// ---- el buque se defiende ----
// El flak que se materializaba al lado del avion con una espoleta murio en el rediseño del 16/8
// (playtest: "no hay disparo que ver"). Lo que queda de aquella idea es el RADIO DE ROCE: un
// antiaereo que detona cerca sin matarte igual te sacude y te ensucia la pasada.
const NEAR_R = 75;                      // "te paso cerca" (metros)
const RING_GRACE = 1.5;                 // aviso antes de que el piloto automatico tome el mando
const AUTO_OFF = 0.86;                  // vuelve el control al entrar a este % del radio

// ---- combate ----
// El alcance, la caida de daño, la velocidad de bala y el misil viven en data/arena.js (E5):
// son las perillas del plan, y sueltas aca no se podian ajustar sin abrir el sistema.
// SHOT_DMG 7 → 9 (playtest 15/8: "dura mas la batalla"). E5 le recorto al cañon el alcance de
// 900 a 380 y le sumo caida de daño; el buque no cambio de vida, asi que la pelea se estiro. La
// compensacion va en el DAÑO y no en el alcance: acercarse tiene que seguir siendo la unica
// forma de pegar, pero pegar de cerca tiene que rendir.
const SHOT_CD = 0.12, SHOT_DMG = 9;
const OUTRO_T = 3.2;

// ---- estado privado ----
let A = null;           // la instancia del asalto (null fuera)
let zones = null;       // PERSISTEN entre relevos: el daño hecho cuenta
// SONDA E0 (PLAN_MINUTOS_SAGRADOS §5): la pelea REAL, medida mientras se juega. Dos arrays por
// batalla — la distancia al buque de cada gatillazo y los segundos que el buque pasa fuera de la
// mira entre pasada y pasada. Sin esto, "el cañon se usa de lejos" y "volver cuesta 7 s" son
// opiniones; con esto son un histograma en __ahist().
let shotLog = [];       // distancia al buque (m) de cada disparo de cañon o misil
let passGaps = [];      // segundos con el buque fuera del cono de mira (~15°)
let offT = -1;          // instante en que salio de la mira; -1 = lo tenes encuadrado
// E3/S2 se miden igual que todo lo demas: un sistema que nadie usa es peso muerto y se saca
// (SQUADRONS_UPDATE §7). `uturns` cuenta medias vueltas y `driftT` acumula segundos derrapando.
let uturns = 0, driftT = 0, pipSwaps = 0;
// E6: aperturas conseguidas, segundos dentro de la burbuja y amenazas letales presentadas ahi.
// El criterio de salida del plan (">= 20 esquives/min adentro") se mide con `threats / bubbleT`:
// una sonda no esquiva, asi que lo que se puede medir sin una persona es cuanto te TIRAN.
let staggers = 0, bubbleT = 0, threats = 0, homings = 0;
// REPARTO DE ENERGIA (S1). Vive a nivel de MODULO y no en `A` porque es una decision del PILOTO,
// no del avion: sobrevive al relevo del escuadron igual que las zonas dañadas. Se vuelve a
// EQUILIBRADO al empezar batalla nueva.
let pip = 0;
const pipCfg = () => AR.PIP[AR.PIP_ORDER[pip]];
// CICLO DE PUNTERIA del buque. Vive a nivel de MODULO por la misma razon que el reparto de
// energia: es del BUQUE, no del avion. Estaba en `A` y se reiniciaba en cada relevo — medido, la
// tanda fina aparecia el 3% del tiempo en vez del 20%, porque nunca llegaba a cumplirse.
let aimT = 8, aimGood = 0;
let shipCls = 't42';
// PRIMERA PERSONA por defecto (decision del autor, 26/7): la cabina ya es un asset terminado y
// esquiva el problema del sprite en 3a — que a esta resolucion se ve tosco girando. La 3a queda
// en [V] para quien la prefiera.
let viewMode = 1;

export const active = () => A;
export const zonesOf = () => zones || [];
export const view = () => viewMode;
export const available = () => world3D.available();
export const RING = world3D.RING_R;

export function setShip(name) { shipCls = SHIP_CLASS[name] || 't42'; zones = null; }

export function resetArena() { A = null; zones = null; world3D.resetZones(); }

/** Un solo gatillo: el 100% de la distancia. Sin fases. */
export function readyToEnter(dist, objectiveDist) {
  return objectiveDist > 0 && dist >= objectiveDist;
}

export function toggleView() {
  viewMode = viewMode === 1 ? 3 : 1;
  popup(W / 2, 58, viewMode === 1 ? T('arena_v1') : T('arena_v3'), P.accent);
  beep(700, 0.05, 'square', 0.04);
}

export function enter() {
  setState('arena');
  clearWorld({ keepFx: true });
  if (!zones) {
    // TODAS las zonas vivas a la vez: las 3 "pasadas" del layout clasico se aplanan en una
    // sola lista y el orden lo decide el jugador. La data sigue siendo MOM_LAYOUTS.
    // La sonda se limpia ACA y no incondicionalmente: el relevo del escuadron re-entra por
    // enter() y un reset a secas borraria el histograma a mitad de batalla.
    shotLog = []; passGaps = []; uturns = 0; driftT = 0; pipSwaps = 0; pip = 0;
    staggers = 0; bubbleT = 0; threats = 0; homings = 0;
    aimT = 8; aimGood = 0;
    // BATALLA NUEVA: el asalto arranca con la santabarbara llena. Va ACA y no en enter() a
    // proposito — enter() tambien corre en el relevo del escuadron, y recargar ahi seria premiar
    // el derribo justo despues de sacarle al misil la regeneracion automatica (E5).
    run.msl = MSL_MAX; run.mslCd = 0; run.heat = 0; run.overheat = false;
    zones = [];
    for (const ph of MOM_LAYOUTS[shipCls]) for (const z of ph.zones)
      // `st` = barra de stagger (0..1) y `open` = segundos de ventana abierta (E6). Viajan CON la
      // zona, asi que persisten entre relevos igual que el daño — volver de un derribo no le
      // devuelve al buque la guardia que ya le habias roto.
      zones.push({ id: z.id, label: z.label, hp: z.maxHp, maxHp: z.maxHp, pts: z.pts, st: 0, open: 0 });
  }
  // entrada: encarando el buque desde ~480 m, a media altura del ring
  const yaw = 0.55;
  const d = 480;
  A = {
    t: 0, yaw, pitch: 0, roll: 0,
    pos: { x: 0, y: 110, z: 0 },
    spd: AR.SPD_CRUISE, fwd: forward(yaw, 0), up: { x: 0, y: 1, z: 0 },
    vx: 0, vy: 0, lowT: 0,               // estado de vuelo E1/E2 (yaw/pitch/roll son COMANDADOS)
    vel: forward(yaw, 0),                // TRAYECTORIA (S2): unitario propio, se despega del morro derrapando
    drift: 0, mv: null, mvCd: 0,         // drift activo / maniobra guionada en curso / reenganche
    bubble: 0,                           // dentro de la defensa cercana
    mgT: 1.6, aaT: 3.2, hmT: 6,          // relojes de metralleta / antiaereo / misil guiado
    outT: 0, auto: 0,                    // fuera del ring / piloto automatico
    paint: [], paintZ: null, paintT: 0, painting: 0,   // pintado de misiles (E5)
    passIn: 0, passClean: 0,             // pasada en curso / todavia limpia (recarga de misiles)
    shotCd: 0, hitFx: 0, flashL: 0, flashR: 0, gunSide: 1,
    doneT: 0, boomT: 0, fx: [],
  };
  A.pos.x = -Math.sin(yaw) * d; A.pos.z = Math.cos(yaw) * d;   // atras del rumbo: encara al buque
  // el reloj de mira arranca fresco SIEMPRE: A.t nace en 0 con cada avion, y un offT del avion
  // anterior producia gaps negativos (medido con la sonda: gap medio -0.7 s)
  offT = -1;
  popup(W / 2, 62, T('mom_title'), P.warn);
  popup(W / 2, 76, T('arena_hint'), P.dim);
  beep(320, 0.5, 'sine', 0.07, 640);
  boom(0.10);
}

const aliveAA = () => zones.filter(z => z.hp > 0 && z.id.startsWith('aa'));
const radarAlive = () => zones.some(z => z.hp > 0 && z.id === 'radar');

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

/** STAGGER (E6): el daño llena la barra; llena, la zona SE ABRE y cobra STAG_MULT por STAG_OPEN
 *  segundos. La barra DECAE sola, asi que la apertura la gana el que se queda encima — que es
 *  exactamente la decision que la burbuja hace peligrosa. Este es el latido de la pelea. */
function hitZone(id, dmg) {
  const z = zones.find(q => q.id === id && q.hp > 0);
  if (!z) return;
  const abierta = z.open > 0;
  z.hp -= dmg * (abierta ? AR.STAG_MULT : 1);
  A.hitFx = 1; stats.hits++;
  // mientras esta ABIERTA no se recarga: la ventana es una recompensa, no un bucle que se
  // realimenta solo (sin esto, una zona abierta se re-abria antes de cerrarse y no cerraba nunca)
  if (!abierta) {
    z.st += Math.min(AR.STAG_CAP, dmg / (z.maxHp * AR.STAG_HP));
    if (z.st >= 1) {
      z.st = 0; z.open = AR.STAG_OPEN; staggers++;
      const r = world3D.zoneRect3D(z.id);
      popup(r ? r.x + r.w / 2 : W / 2, r ? r.y - 12 : HOR, T('arena_open'), P.foam, true);
      beep(1650, 0.10, 'square', 0.05, 2400); beep(2100, 0.14, 'square', 0.04, 1500);
      run.shake = Math.min(6, run.shake + 1.2);
    }
  }
  if (z.hp <= 0) zoneKilled(z);
}

/** Daño del cañon segun la distancia recorrida por la bala (E5): entero hasta GUN_FALL y cayendo
 *  hasta GUN_FALL_MIN en el limite. Es la mitad de "que acercarse importe" — la otra mitad es que
 *  mas alla de GUN_RANGE la bala simplemente no llega. */
function gunDamage(dist) {
  if (dist <= AR.GUN_FALL) return SHOT_DMG;
  const k = (dist - AR.GUN_FALL) / (AR.GUN_RANGE - AR.GUN_FALL);
  return SHOT_DMG * (1 - k * (1 - AR.GUN_FALL_MIN));
}

/** Lanza UN misil contra una zona ya PINTADA. No se apunta: el pintado ya eligio el blanco. */
function fireMissile(zoneId) {
  if (run.msl <= 0) return;
  const wp = world3D.zoneWorldPos(zoneId);
  if (!wp) return;
  run.msl--; run.mslCd = 0.4;
  const d = Math.hypot(A.pos.x - wp.x, A.pos.y - wp.y, A.pos.z - wp.z);
  shotLog.push(Math.hypot(A.pos.x, A.pos.z));   // sonda: los misiles tambien cuentan
  A.gunSide = -A.gunSide;
  A.fx.push({ k: 'ms', zone: zoneId, ship: true, T: 0, dur: Math.max(0.35, d / 420), life: 1, side: A.gunSide, aim: wp });
  if (A.gunSide < 0) A.flashL = 0.22; else A.flashR = 0.22;
  if (!sfxOne('msl')) beep(180, 0.25, 'sawtooth', 0.06, 60);
}

/** REPARTO DE ENERGIA (S1): cicla EQUILIBRADO → MOTOR → ARMAS, [G] o cruceta arriba.
 *
 *  UNA TECLA QUE CICLA, no un menu radial (SQUADRONS_UPDATE §5: prohibido por diseño). La gracia
 *  es que se pueda cambiar SIN dejar de volar, en el medio de una pasada. */
export function cyclePip() {
  if (!A || A.doneT > 0) return;
  pip = (pip + 1) % AR.PIP_ORDER.length;
  pipSwaps++;
  popup(W / 2, 54, T('arena_pip_' + AR.PIP_ORDER[pip]), P.accent);
  beep(560 + pip * 220, 0.07, 'square', 0.045);
}
export const pipId = () => AR.PIP_ORDER[pip];

/** VIRAJE DE COMBATE (E3): media vuelta guionada, [R] o ◯. El plan lo pide porque el gap medio
 *  entre pasadas medido era ~7 s y el buque muere con 5 s de fuego: casi toda la pelea era viajar.
 *
 *  EL LADO LO DECIDE EL BANQUEO, y nivelado va HACIA EL BUQUE. No es una pirueta de exhibicion:
 *  es la herramienta de "volver a tenerlo en la mira", y pedirle al jugador que ademas elija el
 *  lado con el avion de culata al blanco era pedirle la parte que justamente no sabe. */
export function combatTurn() {
  if (!A || A.mv || A.mvCd > 0 || A.auto || A.doneT > 0) return;
  // averiado CRITICO no hay media vuelta: el avion queda en "lo basico" (core/damage.js)
  if (!dmg.fx().moves) { beep(160, 0.12, 'sawtooth', 0.04); return; }
  let dir = A.roll > 0.12 ? 1 : A.roll < -0.12 ? -1 : 0;
  if (!dir) {
    let d = Math.atan2(-A.pos.x, A.pos.z) - A.yaw;     // rumbo al buque menos el actual
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    dir = d >= 0 ? 1 : -1;
  }
  A.mv = startUturn(dir);
  uturns++;
  popup(W / 2, 46, T('arena_uturn'), P.accent);
  if (!sfxOne('waveFly')) beep(420, 0.18, 'sawtooth', 0.05, 900);   // el silbido del tiron
  run.shake = Math.min(6, run.shake + 1.2);
}

// ---------- PUNTERIA DEL BUQUE: adelanto con ERROR ----------
// El corazon del rediseño. Todo lo que dispara el buque sale de aca: se calcula donde VA A ESTAR
// el avion cuando el proyectil llegue, y despues se desvia ese rumbo a proposito.
//
// El error es el diseño, no una concesion: con adelanto perfecto la unica defensa seria no estar
// ahi, y con dispersion al azar sin adelanto el buque nunca acertaria. Adelanto + error = la
// estela pasa CERCA, se ve pasar, y de vez en cuando engancha.

/** rango aleatorio */
const rng = a => a[0] + Math.random() * (a[1] - a[0]);

/** Unitario de `mp` a `to`, inclinado `err` radianes en una direccion perpendicular CUALQUIERA.
 *  Separado de `aimAt` porque lo usan los dos casos: con radar (adelantando) y sin (a donde
 *  estuviste). El error se aplica igual en los dos — es la firma del tirador, no del sensor. */
function dirTo(mp, to, err, t) {
  let dx = to.x - mp.x, dy = to.y - mp.y, dz = to.z - mp.z;
  const dl = Math.hypot(dx, dy, dz) || 1;
  dx /= dl; dy /= dl; dz /= dl;
  const hl = Math.hypot(dx, dz) || 1;
  const rx = -dz / hl, rz = dx / hl;                            // perpendicular horizontal
  const ux = -dy * rx, uy = hl, uz = -dy * rz;                  // perpendicular "vertical"
  const ang = Math.random() * Math.PI * 2;
  const ex = Math.cos(ang) * err, ey = Math.sin(ang) * err;
  dx += rx * ex + ux * ey; dy += uy * ey; dz += rz * ex + uz * ey;
  const nl = Math.hypot(dx, dy, dz) || 1;
  return { x: dx / nl, y: dy / nl, z: dz / nl, t: t !== undefined ? t : dl };
}

/** Direccion de tiro desde `mp` para interceptar al avion con un proyectil de velocidad `v`,
 *  desviada por `err` radianes. `t` es el tiempo de vuelo estimado (lo usa la espoleta del AA). */
function aimAt(mp, v, err) {
  // EL RADAR SIGUE MANDANDO (la mejor regla que ya tenia el modo): muerto, el buque pierde el
  // adelanto y tira a donde ESTUVISTE. Ahora ademas se VE — la estela te queda atras.
  const d0 = Math.hypot(A.pos.x - mp.x, A.pos.y - mp.y, A.pos.z - mp.z);
  if (!radarAlive()) return dirTo(mp, A.pos, err, d0 / v);
  // adelanto: dos pasadas alcanzan de sobra (la primera estima el tiempo, la segunda lo corrige)
  let t = d0 / v;
  for (let i = 0; i < 2; i++) {
    const qx = A.pos.x + A.vel.x * A.spd * t;
    const qy = A.pos.y + A.vel.y * A.spd * t;
    const qz = A.pos.z + A.vel.z * A.spd * t;
    t = Math.hypot(qx - mp.x, qy - mp.y, qz - mp.z) / v;
  }
  const to = {
    x: A.pos.x + A.vel.x * A.spd * t,
    y: A.pos.y + A.vel.y * A.spd * t,
    z: A.pos.z + A.vel.z * A.spd * t,
  };
  return dirTo(mp, to, err, t);
}

/** El error angular de ESTE disparo. Normalmente malo; en la tanda buena, fino. De cerca, mejor. */
function aimErr() {
  const base = aimGood > 0 ? rng(AR.AIM_GOOD) : rng(AR.AIM_BAD);
  return base * (A.bubble ? AR.BUBBLE_AIM : 1);
}

/** METRALLETA: una rafaga de rondas escalonadas. Es la ESTELA que sale del buque y se ve venir. */
function fireMG(z) {
  const mp = world3D.zoneWorldPos(z.id);
  if (!mp) return;
  const n = Math.round(rng(AR.MG_BURST));
  // el error se sortea UNA vez por rafaga y las rondas salen casi juntas: asi la rafaga es una
  // LINEA que pasa por un lado, no una nube. Una nube no se puede leer ni esquivar.
  const err = aimErr();
  for (let i = 0; i < n; i++) {
    const d = aimAt(mp, AR.MG_V, err * (0.85 + Math.random() * 0.3));
    A.fx.push({
      k: 'mg', x: mp.x, y: mp.y, z: mp.z, T: 0, life: AR.MG_LIFE, wait: i * AR.MG_GAP,
      vx: d.x * AR.MG_V, vy: d.y * AR.MG_V, vz: d.z * AR.MG_V,
    });
  }
  threats++;
  if (!sfxOne('exXsmall')) beep(190, 0.07, 'sawtooth', 0.04, 130);
}

/** ANTIAEREO: uno o varios pepinazos lentos con espoleta de proximidad. UN tiro por pieza, y
 *  suena como lo que es — una explosion grande saliendo del buque. */
function fireAA(z) {
  const mp = world3D.zoneWorldPos(z.id);
  if (!mp) return;
  const n = Math.round(rng(AR.AA_SALVO));
  for (let i = 0; i < n; i++) {
    const d = aimAt(mp, AR.AA_V, aimErr());
    A.fx.push({
      k: 'aa', x: mp.x, y: mp.y, z: mp.z, T: 0, life: AR.AA_LIFE, wait: i * 0.14,
      vx: d.x * AR.AA_V, vy: d.y * AR.AA_V, vz: d.z * AR.AA_V,
      fuse: d.t + (Math.random() - 0.5) * 0.3,       // detona al llegar (o antes por proximidad)
      d: 9999,
    });
  }
  threats++;
  // EL DISPARO SUENA COMO UNA EXPLOSION GRANDE, y es UNO (pedido del autor): antes eran dos bips
  if (!sfxOne('exHeavyDist')) beep(90, 0.28, 'sawtooth', 0.07, 45);
  run.shake = Math.min(6, run.shake + 0.5);
}

/** MISIL GUIADO del buque (pedido del autor, 15/8).
 *
 *  LA AMENAZA QUE SE VE VENIR. La metralleta y el antiaereo pasan; este te sigue. Va a la
 *  velocidad del avion a proposito: no se le escapa con turbo, se lo GIRA. */
function fireHoming(z) {
  const mp = world3D.zoneWorldPos(z.id);
  if (!mp) return;
  let dx = A.pos.x - mp.x, dy = A.pos.y - mp.y, dz = A.pos.z - mp.z;
  const dl = Math.hypot(dx, dy, dz) || 1;
  A.fx.push({
    k: 'hm3', x: mp.x, y: mp.y, z: mp.z, T: 0, life: AR.HM_LIFE,
    dx: dx / dl, dy: dy / dl, dz: dz / dl, d: dl,
  });
  homings++;
  popup(W / 2, 46, T('arena_msl'), '#ff5340', true);
  if (!sfxOne('msl')) beep(200, 0.30, 'sawtooth', 0.07, 90);
  run.shake = Math.min(6, run.shake + 0.8);
}

export function update(dt, inp) {
  A.t += dt;
  popups.forEach(p => { p.y -= 14 * dt; p.life -= dt; });
  prune(popups, p => p.life > 0);
  A.hitFx = Math.max(0, A.hitFx - dt * 5);
  A.flashL = Math.max(0, A.flashL - dt);
  A.flashR = Math.max(0, A.flashR - dt);
  run.mslCd = Math.max(0, run.mslCd - dt);
  // (la regeneracion automatica de misiles se saco en E5: ahora se gana con la PASADA LIMPIA)

  // ---------- MANDO (modelo E1/E2: angulos comandados) ----------
  // W/S piden CABECEO, Q/E y el stick derecho piden BANQUEO — y banquear ES virar. A/D derrapan
  // fino. [F]/L2 frenan. Nada de suavizar el input antes de usarlo: la cadena corta es la ley.
  // EL EJE Y NO SE INVIERTE ACA. `inp.u` ya viene con el eje que el jugador eligio (core/input.js,
  // cfg.invY), igual que en el pasillo: si el arena se lo diera vuelta por su cuenta, la misma
  // partida tendria dos ejes distintos segun la fase — que es el bug que esto vino a matar.
  const io = {
    pitch: inp.u - inp.d,
    roll: (inp.rollR || 0) - (inp.rollL || 0) + (inp.rollAx || 0),
    slip: inp.r - inp.l,
    brake: !!(inp.sink || inp.brake),
    boost: !!(inp.turbo && run.fuel > 0),
    // el reparto de energia (S1) entra por aca: MOTOR compra punta y aceleracion, ARMAS las
    // regala (turbo 1.0 = no hay turbo) y se las cobra al cañon en la otra punta del update
    turboMul: pipCfg().turbo, accMul: pipCfg().acc,
  };
  // AVERIAS: el escalon multiplica punta y respuesta, y puede sacar el turbo. Entra por el mismo
  // `io` que los pips — el modelo de vuelo no sabe de daño, solo de palancas.
  const av = dmg.fx();
  io.turboMul *= av.spd;
  io.accMul *= av.agil;
  if (!av.turbo) io.boost = false;
  run.boost = io.boost;

  // ---------- RING: la correa ----------
  const rad = Math.hypot(A.pos.x, A.pos.z);
  if (rad > RING) A.outT += dt; else A.outT = 0;
  if (A.outT > RING_GRACE) A.auto = 1;
  if (A.auto) {
    // PILOTO AUTOMATICO: te deja salir, pero te trae. BANQUEA por el lado corto hacia el
    // centro y nivela el morro — pide los mismos `io` que las teclas, asi el avion vuelve
    // volando como vuela siempre, sin un modo de movimiento aparte.
    const want = Math.atan2(-A.pos.x, A.pos.z);        // rumbo hacia (0,0)
    let dyaw = want - A.yaw;
    while (dyaw > Math.PI) dyaw -= Math.PI * 2;
    while (dyaw < -Math.PI) dyaw += Math.PI * 2;
    io.roll = Math.max(-1, Math.min(1, dyaw * 1.6));
    io.pitch = 0; io.slip = 0; io.brake = false; io.boost = false;
    if (rad < RING * AUTO_OFF && Math.abs(dyaw) < 0.5) { A.auto = 0; A.outT = 0; }
  }

  // ---------- VUELO: un paso del modelo (aero.js muta yaw/pitch/roll/spd/vx) ----------
  // VIRAJE DE COMBATE (E3): mientras corre, la maniobra escribe el `io` y el jugador no maneja —
  // misma regla que las piruetas del pasillo. Sigue siendo UNA integracion: el ejecutor no mueve
  // el avion por su cuenta, le dicta las palancas.
  A.mvCd = Math.max(0, A.mvCd - dt);
  if (A.auto && A.mv) A.mv = null;       // el piloto automatico del ring manda: la maniobra se corta
  if (A.mv) {
    A.drift = 0;
    if (stepUturn(A, A.mv, dt)) { A.mv = null; A.mvCd = AR.UTURN_CD; }
  } else {
    A.drift = drifting(A, io.brake) ? 1 : 0;
    stepFlight(A, io, dt);
  }
  if (A.drift) driftT += dt;
  A.fwd = forward(A.yaw, A.pitch);
  // TRAYECTORIA (S2): fuera del drift persigue al morro en ~0.08 s, asi que sigue valiendo que el
  // rayo del cañon, la mira y el vector de vuelo son el mismo. Derrapando queda atras: el morro
  // apunta al buque mientras el avion todavia viaja para donde venia.
  stepVel(A.vel, A.fwd, A.drift, dt);
  A.vy = A.vel.y * A.spd;                // la vy es CONSECUENCIA de por donde VIAJA (la leen flak y sonda)
  A.up = { x: 0, y: 1, z: 0 };

  // sonda: ¿el buque esta encuadrado? (cono de ~15° al centro del casco). Las transiciones
  // fuera→dentro son las "pasadas" — el gap entre ellas es EL numero que E3 tiene que bajar.
  {
    const dx = -A.pos.x, dy = 15 - A.pos.y, dz = -A.pos.z;
    const dl = Math.hypot(dx, dy, dz) || 1;
    const on = (dx * A.fwd.x + dy * A.fwd.y + dz * A.fwd.z) / dl > 0.966;
    if (!on && offT < 0) offT = A.t;
    else if (on && offT >= 0) { passGaps.push(A.t - offT); offT = -1; }
  }

  // ---------- POSICION ----------
  // avance por el morro + DESLIZAMIENTO fino (A/D) + altura emergente del cabeceo
  const rx = Math.cos(A.yaw), rz = Math.sin(A.yaw);   // vector derecha del avion
  A.pos.x += (A.vel.x * A.spd + rx * A.vx) * dt;
  A.pos.z += (A.vel.z * A.spd + rz * A.vx) * dt;
  A.pos.y += A.vy * dt;
  // techo blando (arriba no hay nada que ver); ABAJO no hay clamp: el mar mata, como en todo
  // el juego. La regla del rasante recien existe si hundirse duele.
  if (A.pos.y > AR.ALT_MAX) { A.pos.y = AR.ALT_MAX; if (A.pitch > 0) A.pitch = 0; }
  // AVISO DE MAR (playtest 2/8: "muere y no se por que"): bajo y con el morro cayendo, el HUD
  // grita ANTES del golpe — la muerte contra el agua tiene que ser una noticia, no un misterio.
  A.lowT = (A.pos.y < LOW_WARN && A.vy < 0) ? (A.lowT || 0) + dt : 0;
  if (A.doneT <= 0) {
    if (A.pos.y < SEA_KILL) { A = null; return { death: 'death_sea' }; }
    if (world3D.hitsShip(A.pos.x, A.pos.y, A.pos.z)) { A = null; return { death: 'death_mast' }; }
  }

  engineFly(A.spd, run.boost, run.boost ? 0.030 : 0.017);   // mismos valores que el pasillo
  if (run.boost) run.shake = Math.max(run.shake, 0.8);
  // el combustible SOLO baja si esta encendido en el menu [M] — igual que el pasillo. Antes
  // drenaba siempre: con COMBUSTIBLE: NO (el default) el tanque igual se vaciaba y en una
  // batalla larga te quedabas sin gas, cayendo al mar sin explicacion.
  if (cfg.fuelOn && !io.brake) run.fuel = Math.max(0, run.fuel - dt * 3.2);

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
    updateFx(dt);
    if (A.doneT <= 0) { A = null; return 'objective'; }
    return;
  }

  // ---------- cañon BALISTICO: la bala es un objeto del MUNDO (E5) ----------
  // Era hitscan (`shootRay` resolvia en el instante del disparo y el fx era solo animacion): sin
  // tiempo de vuelo no hay adelanto, ni peso, ni destreza adentro. Ahora vuela a BULLET_V y el
  // impacto lo decide el segmento que recorre — 0.45 s a 380 m, ~4 balas vivas a la vez.
  // Y CALIENTA, con las mismas constantes del pasillo: el cañon dejo de ser un boton sostenido.
  A.shotCd = Math.max(0, A.shotCd - dt);
  run.heat = Math.max(0, run.heat - dt * (inp.fire ? GUN_COOL_FIRE : GUN_COOL_IDLE) * pipCfg().cool);
  if (run.overheat && run.heat < GUN_RESET) run.overheat = false;
  if (inp.fire && !run.overheat && A.shotCd <= 0 && !A.auto && A.doneT <= 0) {
    A.shotCd = SHOT_CD;
    A.gunSide = -A.gunSide;
    shotLog.push(rad);                     // sonda: desde donde se dispara DE VERDAD
    stats.shots++;                         // denominador de la PRECISION (hitZone ya sumaba hits)
    A.fx.push({
      k: 'bl', side: A.gunSide, T: 0, life: AR.GUN_RANGE / AR.BULLET_V, travel: 0,
      px: A.pos.x, py: A.pos.y, pz: A.pos.z,
      dx: A.fwd.x, dy: A.fwd.y, dz: A.fwd.z,
    });
    if (A.gunSide < 0) A.flashL = 0.07; else A.flashR = 0.07;
    run.heat += GUN_HEAT_SHOT * pipCfg().heat;
    if (run.heat >= 1) { run.overheat = true; beep(140, 0.3, 'sawtooth', 0.05); }
    else if (!sfxOne('momGun')) beep(150, 0.05, 'square', 0.05, 70);
  }

  // ---------- MISIL POR PINTADO: mantener marca, soltar dispara la salva (E5) ----------
  // El boton SOSTENIDO pinta las zonas que el reticulo barre durante la pasada; al soltar sale
  // una salva contra cada una. Por eso el misil ya no entra por el flanco de tecla de game.js:
  // un flanco no puede expresar "cuanto tiempo te quedaste encima".
  if (inp.msl && !A.auto && A.doneT <= 0) {
    A.painting = 1;
    const cupo = Math.min(AR.PAINT_MAX, run.msl);
    const hit = world3D.shootRay(A.pos, A.fwd, AR.MSL_RANGE);
    const z = hit && hit.zone;
    const libre = z && !A.paint.includes(z) && A.paint.length < cupo && zones.some(q => q.id === z && q.hp > 0);
    if (libre) {
      if (A.paintZ === z) A.paintT += dt; else { A.paintZ = z; A.paintT = 0; }
      if (A.paintT >= AR.PAINT_T * pipCfg().paint) {
        A.paint.push(z); A.paintZ = null; A.paintT = 0;
        beep(1200 + A.paint.length * 200, 0.06, 'square', 0.04);
      }
    } else { A.paintZ = null; A.paintT = 0; }
  } else if (A.painting) {
    A.painting = 0;
    for (const z of A.paint) fireMissile(z);
    A.paint = []; A.paintZ = null; A.paintT = 0;
  }

  // ---------- PASADA LIMPIA: la unica forma de recuperar un misil (E5) ----------
  // Se termino la regeneracion sola cada 7 s. Entrar a PASS_IN, y salir de PASS_OUT sin que un
  // flak te haya rozado, devuelve UN misil: el recurso paga la jugada que el modo quiere.
  if (rad < AR.PASS_IN) { if (!A.passIn) { A.passIn = 1; A.passClean = 1; } }
  else if (rad > AR.PASS_OUT && A.passIn) {
    A.passIn = 0;
    if (A.passClean && run.msl < MSL_MAX) {
      run.msl++;
      popup(W / 2, 46, T('arena_reload'), P.accent);
      beep(1500, 0.09, 'square', 0.04, 1900);
    }
  }

  // ---------- STAGGER: la barra decae y la ventana se cierra sola (E6) ----------
  for (const z of zones) {
    if (z.hp <= 0) continue;
    if (z.open > 0) z.open = Math.max(0, z.open - dt);
    else if (z.st > 0) z.st = Math.max(0, z.st - AR.STAG_DECAY * dt);
  }

  // ---------- el buque se DEFIENDE: METRALLETA + ANTIAEREO, los dos VIAJANDO ----------
  const aa = aliveAA();
  // BURBUJA: adentro tiran mas seguido y afinan la punteria. Es lo que impide orbitar picoteando.
  A.bubble = rad < AR.BUBBLE_R ? 1 : 0;
  if (A.bubble) bubbleT += dt;
  const rate = A.bubble ? AR.BUBBLE_RATE : 1;

  // TANDA BUENA: cada tanto la punteria se afina unos segundos. Simula que del otro lado hay
  // gente corrigiendo el tiro — y es lo que impide que la amenaza sea siempre la misma cosa.
  aimGood = Math.max(0, aimGood - dt);
  aimT -= dt;
  if (aimT <= 0) { aimT = rng(AR.AIM_GOOD_EVERY); aimGood = AR.AIM_GOOD_DUR; }

  if (aa.length && A.doneT <= 0) {
    // el RADAR sigue mandando: muerto, el buque pierde el adelanto y tira a donde ESTUVISTE.
    // Es la mejor regla que ya tenia el modo y sobrevive al rediseño — solo que ahora se ve.
    A.mgT -= dt;
    if (A.mgT <= 0) {
      A.mgT = rng(AR.MG_EVERY) * rate / Math.max(1, aa.length * 0.6);
      fireMG(aa[(Math.random() * aa.length) | 0]);
    }
    A.aaT -= dt;
    if (A.aaT <= 0) {
      A.aaT = rng(AR.AA_EVERY) * rate;
      fireAA(aa[(Math.random() * aa.length) | 0]);
    }
    // MISIL GUIADO: en una FRANJA de distancia (ni encima ni lejisimos). Es la amenaza de media
    // distancia, la que te obliga a maniobrar cuando ibas tranquilo.
    if (rad > AR.HM_BAND[0] && rad < AR.HM_BAND[1]) {
      A.hmT -= dt;
      if (A.hmT <= 0) { A.hmT = rng(AR.HM_EVERY); fireHoming(aa[(Math.random() * aa.length) | 0]); }
    }
  }

  return updateFx(dt);
}

/** avanza los proyectiles y sus impactos; devuelve { death } si el flak te agarro */
function updateFx(dt) {
  let death = null;
  for (const f of A.fx) {
    f.T += dt;
    if (f.k === 'ms') {
      if (f.T >= f.dur && f.life > 0.5) {
        f.life = 0.4;
        if (f.zone) { hitZone(f.zone, AR.MSL_DMG); boom(0.18); }
      }
      if (f.T >= f.dur) f.life -= dt * 4;
    } else if (f.k === 'bl') {
      // BALA: el impacto se resuelve por el SEGMENTO recorrido en este cuadro. A 850 m/s un
      // chequeo por punto se saltea el casco entero entre dos cuadros (14 m por frame a 60 fps).
      const step = AR.BULLET_V * dt;
      const hit = world3D.shootRay({ x: f.px, y: f.py, z: f.pz }, { x: f.dx, y: f.dy, z: f.dz }, step);
      if (hit) {
        f.life = 0;
        if (hit.zone) hitZone(hit.zone, gunDamage(f.travel + hit.dist));
        A.fx.push({ k: 'fk3', px: f.px + f.dx * hit.dist, py: f.py + f.dy * hit.dist, pz: f.pz + f.dz * hit.dist, vr: 7, life: 0.22, T: 0 });
      } else {
        f.px += f.dx * step; f.py += f.dy * step; f.pz += f.dz * step;
        f.travel += step;
        f.life -= dt;
        if (f.py < 1) f.life = 0;                         // toca el agua y muere
      }
    } else if (f.k === 'hm3') {
      // MISIL GUIADO: persigue girando a HM_TURN, que es menos de la mitad de lo que gira el
      // avion. Se lo saca quebrando fuerte y sostenido — si lo intentas con correcciones chicas,
      // te alcanza. Al quedarse sin combustible se apaga solo, sin explotar encima tuyo.
      f.life -= dt;
      let wx = A.pos.x - f.x, wy = A.pos.y - f.y, wz = A.pos.z - f.z;
      const wl = Math.hypot(wx, wy, wz) || 1;
      wx /= wl; wy /= wl; wz /= wl;
      // giro limitado: el rumbo persigue al deseado a HM_TURN rad/s, nada de apuntar de un frame
      const k = Math.min(1, AR.HM_TURN * dt);
      f.dx += (wx - f.dx) * k; f.dy += (wy - f.dy) * k; f.dz += (wz - f.dz) * k;
      const nl = Math.hypot(f.dx, f.dy, f.dz) || 1;
      f.dx /= nl; f.dy /= nl; f.dz /= nl;
      f.x += f.dx * AR.HM_V * dt; f.y += f.dy * AR.HM_V * dt; f.z += f.dz * AR.HM_V * dt;
      f.d = wl;                                          // distancia: la lee el HUD y el tono
      // TONO DE APROXIMACION: sube de frecuencia cuanto mas cerca esta. Es lo que convierte al
      // misil en tension en vez de en un sprite — y lo que te avisa cuando viene de atras.
      f.beepT = (f.beepT || 0) - dt;
      if (f.beepT <= 0) {
        f.beepT = Math.max(0.14, wl / 900);
        beep(620 + Math.max(0, 500 - wl) * 1.8, 0.05, 'square', 0.035);
      }
      if (f.y < 1) f.life = 0;
      if (f.life <= 0 && wl >= AR.HM_HIT) {              // se quedo sin combustible: se apaga
        A.fx.push({ k: 'fk3', px: f.x, py: f.y, pz: f.z, vr: 16, life: 0.6, T: 0 });
        if (!sfxOne('exXsmall')) boom(0.06);
      }
      if (wl < AR.HM_HIT && A.doneT <= 0) {
        f.life = 0;
        A.fx.push({ k: 'fk3', px: f.x, py: f.y, pz: f.z, vr: 26, life: 0.8, T: 0 });
        if (!sfxOne('exMedium')) boom(0.2);
        if (dmg.takeHit('death_missile')) death = { death: 'death_missile' };
      }
    } else if (f.k === 'mg') {
      // METRALLETA: viaja de verdad desde el buque. El radio es chico (5 m) porque lo que mata
      // no es la ronda suelta sino la RAFAGA bien puesta — y porque una ronda que mata de lejos
      // volveria a ser la muerte invisible que este rediseño vino a sacar.
      if (f.wait > 0) { f.wait -= dt; continue; }
      f.life -= dt;
      f.x += f.vx * dt; f.y += f.vy * dt; f.z += f.vz * dt;
      if (f.y < 1) { f.life = 0; continue; }
      const d = Math.hypot(A.pos.x - f.x, A.pos.y - f.y, A.pos.z - f.z);
      if (d < AR.MG_HIT && A.doneT <= 0) { f.life = 0; if (dmg.takeHit('death_gunfire')) death = { death: 'death_gunfire' }; }
    } else if (f.k === 'aa') {
      // ANTIAEREO: pepinazo lento con espoleta de PROXIMIDAD. Detona al llegar al punto adonde
      // apunto (fuse) o antes si te pasa cerca. Las dos formas son visibles: sale del buque, se
      // lo ve venir, y revienta donde revienta.
      if (f.wait > 0) { f.wait -= dt; continue; }
      f.life -= dt; f.fuse -= dt;
      f.x += f.vx * dt; f.y += f.vy * dt; f.z += f.vz * dt;
      f.d = Math.hypot(A.pos.x - f.x, A.pos.y - f.y, A.pos.z - f.z);
      if (f.y < 1) f.life = 0;
      if (f.fuse <= 0 || f.d < AR.AA_HIT || f.life <= 0) {
        f.life = 0;
        A.fx.push({ k: 'fk3', px: f.x, py: f.y, pz: f.z, vr: 30, life: 0.9, T: 0 });
        if (f.d < AR.AA_HIT && A.doneT <= 0) { if (dmg.takeHit('death_aa')) death = { death: 'death_aa' }; }
        else if (f.d < NEAR_R) {
          if (!sfxOne('exSmall')) boom(0.10);
          run.shake = Math.min(6, run.shake + 1.6);
          A.passClean = 0;      // te rozo: esta pasada ya no recarga (E5)
        } else if (f.d < NEAR_R * 2.6) { if (!sfxOne('exXsmall')) boom(0.05); }
      }
    } else {                                              // 'fk' (pantalla) / 'fk3' (mundo)
      f.life -= dt;
      if (f.vx !== undefined) { f.x += f.vx * dt; f.y += f.vy * dt; }
    }
  }
  A.fx = A.fx.filter(f => f.life > 0);
  if (death) { A = null; return death; }
  return null;
}

/** El snapshot que el render 3D necesita del avion (solo lectura). */
export function camState() { return A; }

// PROBE de desarrollo (etapa B) — QUITAR al cerrar el arena.
// __aset coloca el avion a `d` metros del buque, a `alt` de altura, encarandolo con un desvio
// de `off` radianes: es lo que permite fotografiar los cuatro rumbos sin volar a ciegas.
// `turn` gira ADEMAS el morro sobre su eje (turn = PI deja el buque A LA ESPALDA): sin eso no hay
// forma de medir el criterio de salida de E3 —cuanto tarda el buque en volver a la mira— desde
// dos veces la MISMA situacion.
if (typeof window !== 'undefined') window.__aset = (d, alt, off, turn) => {
  if (!A) return 'no arena';
  const a = (off || 0);
  // forward(yaw) = (sin yaw, ·, -cos yaw). Para encarar el origen desde (sin a·d, cos a·d) hace
  // falta forward ∝ (-sin a, -cos a) → yaw = -a (con a+PI el eje z queda invertido: el buque
  // aparecia de costado en vez de al frente).
  A.pos.x = Math.sin(a) * d; A.pos.z = Math.cos(a) * d; A.pos.y = alt;
  A.yaw = -a + (turn || 0); A.pitch = -Math.atan2(alt - 20, d); A.roll = 0;
  // el estado de maniobra y la trayectoria arrancan LIMPIOS o la medicion arrastra la anterior
  A.mv = null; A.mvCd = 0; A.drift = 0;
  A.fwd = forward(A.yaw, A.pitch); A.vel = { ...A.fwd };
  return 'ok';
};
// __akill: vacia todas las zonas vivas — sirve para probar el FIN de batalla y lo que encadena
// despues sin tener que acertarle a mano a cada blanco.
if (typeof window !== 'undefined') window.__akill = () => {
  if (!A || !zones) return 'no arena';
  for (const z of zones) if (z.hp > 0) { z.hp = 1; hitZone(z.id, 1); }
  return 'ok';
};
if (typeof window !== 'undefined') window.__adbg = () => A && JSON.stringify({
  x: A.pos.x | 0, y: A.pos.y | 0, z: A.pos.z | 0, r: Math.hypot(A.pos.x, A.pos.z) | 0,
  yaw: +A.yaw.toFixed(2), pitch: +A.pitch.toFixed(2), roll: +A.roll.toFixed(2),
  spd: A.spd | 0, vx: +A.vx.toFixed(1), vy: +A.vy.toFixed(1),
  slip: +(slipAngle(A.vx, A.spd) * 180 / Math.PI).toFixed(1),
  mv: A.mv && A.mv.id, drift: A.drift, pip: AR.PIP_ORDER[pip],
  burb: A.bubble, abiertas: zones.filter(z => z.open > 0).length,
  stag: +Math.max(...zones.map(z => z.st || 0)).toFixed(2),
  mg: A.fx.filter(f => f.k === 'mg').length, aaf: A.fx.filter(f => f.k === 'aa').length,
  aim: aimGood > 0 ? 'fina' : 'mala',
  hm: A.fx.filter(f => f.k === 'hm3').map(f => f.d | 0),   // misiles guiados vivos y a que distancia
  dAng: +(driftAngle(A.vel, A.fwd) * 180 / Math.PI).toFixed(1),   // morro vs trayectoria (S2)
  out: +A.outT.toFixed(1), auto: A.auto, zonas: zones.filter(z => z.hp > 0).length,
  hp: zones.reduce((s, z) => s + Math.max(0, z.hp), 0) | 0,       // integridad del buque (E5/E7)
  msl: run.msl, heat: +run.heat.toFixed(2), oh: run.overheat, paint: A.paint.length,
  integ: run.integ, avr: dmg.tier().id,
  balas: A.fx.filter(f => f.k === 'bl').length,
  vidas: run.lives,
});
// __ahist: la batalla medida. Histograma de distancias de disparo (baldes de 100 m) y los gaps
// entre pasadas — los dos numeros que el plan usa como criterio de salida de E3 y E5.
if (typeof window !== 'undefined') window.__ahist = () => {
  const h = {};
  for (const d of shotLog) { const b = ((d / 100) | 0) * 100; h[b] = (h[b] || 0) + 1; }
  const avg = a => a.length ? a.reduce((s, v) => s + v, 0) / a.length : 0;
  return JSON.stringify({
    tiros: shotLog.length, distMedia: avg(shotLog) | 0, hist: h,
    pasadas: passGaps.length, gapMedio: +avg(passGaps).toFixed(1),
    gapMax: +(passGaps.length ? Math.max(...passGaps) : 0).toFixed(1),
    // E3/S2: si estos dos quedan en cero, la media vuelta y el drift no se usan y sobran
    uturns, driftT: +driftT.toFixed(1), pipSwaps,
    staggers, bubbleT: +bubbleT.toFixed(1), threats, homings,
    // el criterio de E6 traducido a lo que una sonda PUEDE medir: amenazas por minuto adentro
    amenMin: bubbleT > 0 ? +(threats * 60 / bubbleT).toFixed(1) : 0,
  });
};
