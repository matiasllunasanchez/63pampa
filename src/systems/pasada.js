// FASE PASADA: el climax resuelto con la doctrina real de 1982 — llegar a ras del agua, saltar lo
// justo, soltar la ristra y salir. Analisis funcional completo en docs/sistemas/SPEC_MODO_PASADA.md;
// el porque de cada decision, en docs/sistemas/PROPUESTAS_PASADA.md §8b.
//
// ESTA ES LA FASE P0 DEL SPEC: el esqueleto. Entra, comparte la zona 3D con el ARENA, pone el buque
// en el centro y se VUELA. Todavia no hay corrida con eje (P1), ni suelta (P2), ni defensa (P3), ni
// reglamento (P4). Cada bloque de abajo dice a que fase pertenece lo que falta.
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

export const active = () => A;
export const zonesOf = () => zones || [];
export const view = () => viewMode;
export const available = () => world3D.available();
export const ZONE_R = PS.ZONE_R;

export function setShip(name) { shipCls = SHIP_CLASS[name] || 't42'; zones = null; }

export function resetPasada() { A = null; zones = null; corridas = 0; lowT = 0; world3D.resetZones(); }

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
  // EJE DE ATAQUE. En P0 es uno solo y fijo; en P1 pasa a ser la decision de la corrida (elegir el
  // eje que alinea dos zonas es TODO el apuntado de la ristra, RF-06).
  const yaw = 0.55;
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
    bombs: PS.BOMBS_N,             // la ristra que queda de ESTA corrida
    ripple: 0, rippleT: 0, msl: 0, // bombas por soltar de la salva / reloj entre una y otra / flanco de [Z]
    sapitos: 0, duds: 0,           // sonda: cuantas entraron picando y cuantas llegaron dormidas
    heat: 0,                       // P4: calor de la defensa por re-encare (HEAT_RATE)
    outT: 0, auto: 0,              // fuera de la zona / piloto automatico
    hitFx: 0, flashL: 0, flashR: 0,
    doneT: 0, boomT: 0, fx: [],
  };
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

/** FASE de la corrida. En P0 se DERIVA de la geometria (donde estas y si vas o venis); en P1 pasa a
 *  ser estado real, con el eje de ataque y el re-encare. Alcanza para que la sonda diga en que
 *  parte de la corrida esta el avion, que es lo que el fixture necesita leer. */
function faseDe(rad) {
  const acercando = (A.pos.x * A.vel.x + A.pos.z * A.vel.z) < 0;
  if (!acercando) return rad < PS.POPUP_DIST_M ? 'egreso' : 're-encare';
  return (rad < PS.POPUP_DIST_M && A.pos.y > PS.RADAR_CEIL_M) ? 'salto' : 'ingreso';
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
 *  La cuenta se repone en cada corrida nueva: el costo de insistir no son las bombas, es la nafta
 *  (RF-10) y una defensa cada vez mas caliente (RF-09). */
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
    if (!A.inRun) { A.inRun = 1; A.corrida++; corridas++; }
  } else if (radNow > OUT_R) {
    // SALISTE de la ventana: se cierra la corrida y el avion se REARMA para la proxima. Que las
    // bombas no sean el recurso escaso es deliberado — el que manda es el reloj de nafta.
    if (A.inRun && A.bombs < PS.BOMBS_N && !A.ripple) {
      A.bombs = PS.BOMBS_N;
      popup(W / 2, 46, T('pasada_rearm'), P.accent);
      beep(1500, 0.09, 'square', 0.04, 1900);
    }
    A.inRun = 0;
  }

  // ---------- LA SUELTA: [Z] por FLANCO, y la ristra sale escalonada ----------
  if (inp.msl && !A.msl) release();
  A.msl = inp.msl ? 1 : 0;
  if (A.ripple > 0) {
    A.rippleT -= dt;
    if (A.rippleT <= 0) { dropOne(io.boost); A.ripple--; A.rippleT = PS.RIPPLE_S; }
  }

  engineFly(A.spd, run.boost, run.boost ? 0.030 : 0.017);   // mismos valores que el pasillo
  if (run.boost) run.shake = Math.max(run.shake, 0.8);
  // NAFTA: P4 la vuelve EL RELOJ de la zona (FUEL_MIN). Hoy drena como en el pasillo, y solo si
  // esta encendida en OPCIONES — que una opcion se comporte distinto por fase seria una trampa.
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
    stepFx(dt);
    if (A.doneT <= 0) { A = null; return 'objective'; }
    return;
  }

  // P2: la suelta ([Z], ristra, sapito) · P3: columnas, Sea Dart, Sea Cat, fusileria ·
  // P4: nafta como reloj, ralenti de la ventana, los dos re-encares · P7: la oleada.
  A.fase = faseDe(radNow);
  A.banda = bandaDe(A.pos.y);
  stepFx(dt);
  return null;
}

/** Avanza los efectos del mundo: las bombas en vuelo, sus columnas de agua y el hundimiento.
 *  (P3 suma acá la defensa del buque.) */
function stepFx(dt) {
  for (const f of A.fx) {
    f.life -= dt;
    f.T += dt;                    // reloj propio del efecto: de el salen el crecimiento y el humo
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
}

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
// __pkill: vacia todas las zonas vivas — prueba el FIN de la pasada y lo que encadena despues.
if (typeof window !== 'undefined') window.__pkill = () => {
  if (!A || !zones) return 'no pasada';
  for (const z of zones) if (z.hp > 0) { z.hp = 1; hitZone(z.id, 1); }
  return 'ok';
};
if (typeof window !== 'undefined') window.__pdbg = () => A && JSON.stringify({
  corrida: A.corrida, fase: A.fase || 'ingreso',
  x: A.pos.x | 0, y: A.pos.y | 0, z: A.pos.z | 0, r: Math.hypot(A.pos.x, A.pos.z) | 0,
  alt: +A.pos.y.toFixed(1), banda: A.banda || bandaDe(A.pos.y),
  bajoTecho: A.pos.y < PS.RADAR_CEIL_M,
  yaw: +A.yaw.toFixed(2), pitch: +A.pitch.toFixed(2), roll: +A.roll.toFixed(2),
  spd: A.spd | 0, vy: +A.vy.toFixed(1), drift: A.drift,
  bombas: A.bombs, ristra: A.ripple, vuelo: A.fx.filter(f => f.k === 'bomb').length,
  sapitos: A.sapitos, duds: A.duds,
  impacto: (() => { const p = impactPoint(); return p ? +p.d.toFixed(0) : null; })(),
  nafta: run.fuel | 0, calor: +A.heat.toFixed(2),
  zonas: zones.filter(z => z.hp > 0).length,
  hp: zones.reduce((s, z) => s + Math.max(0, z.hp), 0) | 0,
  oleada: [],                                     // P7: quien de los Fieles esta corriendo
  out: +A.outT.toFixed(1), auto: A.auto, vista: viewMode,
  vidas: run.lives, corridas, lowT: +lowT.toFixed(1),
});
