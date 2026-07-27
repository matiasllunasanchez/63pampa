// FASE ARENA: el climax como COMBATE AEREO en un espacio 3D abierto y acotado. Vocabulario
// completo (PASILLO/ARENA, y por que "MOMENTUM" NO es el nombre de esto) en docs/ARQUITECTURA.md.
//
// El avion VUELA de verdad — posicion y orientacion propias en un mundo 3D (systems/three-arena.js),
// no una camara sobre rieles. La version anterior rotaba el BUQUE con la camara clavada y el
// resultado era la misma galeria de tiro con otro disfraz; ver docs/PROMPT_ARENA_VUELO_LIBRE.md.
//
// LA FISICA ES LA DEL PASILLO, en 3D:
//   · el avion AVANZA SOLO, siempre hacia donde apunta el MORRO (no hay "adelante" del mundo);
//   · el GAS pelea contra la GRAVEDAD — soltarlo baja el morro y te hunde (la regla del rasante);
//   · ←/→ VIRAN (alabeo + guiñada coordinados), no desplazan de costado;
//   · picar gana velocidad y trepar la sangra (la energia de core/physics.js, misma idea).
// El mouse (o el pad) mueve la MIRA y el morro la persigue: "vas a donde apuntas".
//
// RING: al cruzar el borde el juego te deja salir, avisa, y a los RING_GRACE segundos toma el
// control y te reencara al centro. No es un muro ni una muerte: es una correa.
//
// MISMA REGLA DEL LIMITE que el resto: update() devuelve señal ('objective' | { death }) y
// game.js decide (relevo del escuadron o derribo). Este modulo no llama hacia arriba.
//
// ESCALA: 1 unidad = 1 METRO (ver three-arena.js). Las constantes de abajo estan en m y m/s.

import { setState, stats } from '../core/state.js';
import { run } from '../core/run.js';
import { parts, popups, prune, clearWorld } from '../core/world.js';
import { popup } from '../core/fx.js';
import { T } from '../core/i18n.js';
import { P } from '../data/palette.js';
import { MOM_LAYOUTS, SHIP_CLASS } from '../data/ships.js';
import { MSL_MAX } from '../data/tuning.js';
import { W, H, HOR } from '../render/ctx.js';
import { boom, beep, sfxOne, duck, engineFly } from './audio.js';
import * as world3D from './three-arena.js';

// ---- perillas de vuelo (metros, segundos) ----
const SPD_MIN = 95, SPD_CRUISE = 125, SPD_TURBO = 190;
const SPD_ACC = 26;                     // cuanto empuja el motor hacia la velocidad objetivo
const ENERGY = 46;                      // altura ↔ velocidad: picar acelera, trepar frena
const TURN = 1.15;                      // rad/s de viraje a fondo (~66°/s → radio ~110 m)
// CABECEO POR ANGULO OBJETIVO, no por tasa. Con tasa, sostener el gas cabreaba el morro sin
// tope y el avion se clavaba en el techo a los pocos segundos (medido: 620 m fijos). Con
// objetivo, el gas te sostiene TREPANDO SUAVE y soltarlo te pone en picada — que es la regla
// del juego base ("soltas y caes") sin volverse un ascensor.
const PITCH_GAS = 0.22;                 // ~13° de trepada sostenida con gas
const PITCH_FALL = -0.34;               // ~20° de caida al soltar (la gravedad gana)
const PITCH_DIVE = -0.62;               // ~36° picando a proposito
const PITCH_MAX = 1.05;                 // tope con mira libre (mouse): ~60°
const PITCH_LERP = 1.5;                 // el morro LLEGA al angulo pedido, no salta (feel)
// TECHO blando. El buque mide 125 m: desde 300 m de altura el blanco cae fuera del campo de
// vision volando derecho; a 200 m entra sin tener que picar. El PISO ya no es blando: el mar
// MATA (SEA_KILL) — la regla del juego entero, que el arena no puede suspender.
const ALT_MAX = 200;
const SEA_KILL = 3.5;                   // altura de impacto contra el agua (la cresta de la ola)

// ---- el buque se defiende ----
const FLAK_FUSE = 1.15;                 // aviso → detonacion: la ventana para quebrar el rumbo
const FLAK_HIT = 26, FLAK_NEAR = 75;    // radios de impacto y de "te paso cerca" (metros)
const RING_GRACE = 1.5;                 // aviso antes de que el piloto automatico tome el mando
const AUTO_OFF = 0.86;                  // vuelve el control al entrar a este % del radio

// ---- combate ----
const SHOT_CD = 0.12, SHOT_DMG = 7;
const MSL_DMG = 85;
const GUN_RANGE = 900;
const OUTRO_T = 3.2;

// ---- estado privado ----
let A = null;           // la instancia del asalto (null fuera)
let zones = null;       // PERSISTEN entre relevos: el daño hecho cuenta
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

/** vector unitario del MORRO a partir de guiñada y cabeceo. yaw=0 mira a -z. */
function forward(yaw, pitch) {
  const cp = Math.cos(pitch);
  return { x: Math.sin(yaw) * cp, y: Math.sin(pitch), z: -Math.cos(yaw) * cp };
}

export function enter() {
  setState('arena');
  clearWorld({ keepFx: true });
  if (!zones) {
    // TODAS las zonas vivas a la vez: las 3 "pasadas" del layout clasico se aplanan en una
    // sola lista y el orden lo decide el jugador. La data sigue siendo MOM_LAYOUTS.
    zones = [];
    for (const ph of MOM_LAYOUTS[shipCls]) for (const z of ph.zones)
      zones.push({ id: z.id, label: z.label, hp: z.maxHp, maxHp: z.maxHp, pts: z.pts });
  }
  // entrada: encarando el buque desde ~480 m, a media altura del ring
  const yaw = 0.55;
  const d = 480;
  A = {
    t: 0, yaw, pitch: 0, roll: 0,
    pos: { x: 0, y: 110, z: 0 },
    spd: SPD_CRUISE, fwd: forward(yaw, 0), up: { x: 0, y: 1, z: 0 },
    aimX: 0, aimY: 0,                    // desvio de la mira (-1..1) — el morro la persigue
    outT: 0, auto: 0,                    // fuera del ring / piloto automatico
    shotCd: 0, hitFx: 0, flashL: 0, flashR: 0, gunSide: 1,
    flakT: 2.6,                          // primer flak: le da al jugador unos segundos de aire
    doneT: 0, boomT: 0, fx: [],
  };
  A.pos.x = -Math.sin(yaw) * d; A.pos.z = Math.cos(yaw) * d;   // atras del rumbo: encara al buque
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

function hitZone(id, dmg) {
  const z = zones.find(q => q.id === id && q.hp > 0);
  if (!z) return;
  z.hp -= dmg; A.hitFx = 1; stats.hits++;
  if (z.hp <= 0) zoneKilled(z);
}

/** punto del mundo al que apunta el morro (donde va a pegar el cañon) */
function aimPoint() {
  const h = world3D.shootRay(A.pos, A.fwd, GUN_RANGE);
  const d = h ? h.dist : 420;
  return { x: A.pos.x + A.fwd.x * d, y: A.pos.y + A.fwd.y * d, z: A.pos.z + A.fwd.z * d };
}

export function launchMissile() {
  if (!A || A.doneT > 0 || A.auto > 0 || run.msl <= 0 || run.mslCd > 0) return;
  run.msl--; run.mslCd = 0.6;
  const hit = world3D.shootRay(A.pos, A.fwd, 2000);
  A.gunSide = -A.gunSide;
  A.fx.push({ k: 'ms', zone: hit && hit.zone, ship: !!hit, T: 0, dur: hit ? Math.max(0.35, hit.dist / 420) : 1.2, life: 1, side: A.gunSide, aim: aimPoint() });
  if (A.gunSide < 0) A.flashL = 0.22; else A.flashR = 0.22;
  if (!sfxOne('msl')) beep(180, 0.25, 'sawtooth', 0.06, 60);
}

export function update(dt, inp, mouse) {
  A.t += dt;
  popups.forEach(p => { p.y -= 14 * dt; p.life -= dt; });
  prune(popups, p => p.life > 0);
  A.hitFx = Math.max(0, A.hitFx - dt * 5);
  A.flashL = Math.max(0, A.flashL - dt);
  A.flashR = Math.max(0, A.flashR - dt);
  run.mslCd = Math.max(0, run.mslCd - dt);
  if (run.msl < MSL_MAX) { run.mslRegen += dt; if (run.mslRegen >= 7) { run.mslRegen = 0; run.msl++; } }

  // ---------- MANDO ----------
  // la MIRA dirige: con mouse es su desvio respecto del centro; sin mouse, las teclas.
  // El morro la persigue — "el avion avanza hacia donde apunta".
  if (mouse.on) {
    A.aimX = Math.max(-1, Math.min(1, (mouse.x - W / 2) / (W * 0.42)));
    A.aimY = Math.max(-1, Math.min(1, (mouse.y - HOR) / (H * 0.40)));
  } else {
    A.aimX += ((inp.r - inp.l) - A.aimX) * Math.min(1, dt * 6);
    A.aimY += ((inp.d ? 1 : 0) - (inp.u ? 0.55 : 0) - A.aimY) * Math.min(1, dt * 5);
  }
  const gas = inp.u && run.fuel > 0;

  let turn = A.aimX * TURN;
  // angulo de cabeceo PEDIDO: con mouse manda la mira (y la gravedad le resta si no hay gas);
  // con teclado, los tres estados del juego base — gas / soltar / picar.
  let pitchWant = mouse.on
    ? Math.max(-PITCH_MAX, Math.min(PITCH_MAX, -A.aimY * PITCH_MAX + (gas ? 0.12 : -0.28)))
    : (inp.d ? PITCH_DIVE : gas ? PITCH_GAS : PITCH_FALL);

  // ---------- RING: la correa ----------
  const rad = Math.hypot(A.pos.x, A.pos.z);
  if (rad > RING) A.outT += dt; else A.outT = 0;
  if (A.outT > RING_GRACE) A.auto = 1;
  if (A.auto) {
    // PILOTO AUTOMATICO: te deja salir, pero te trae. Vira por el lado corto hacia el centro
    // y nivela el cabeceo; el jugador no manda (y no puede disparar) hasta reencarar.
    const want = Math.atan2(-A.pos.x, A.pos.z);        // rumbo hacia (0,0)
    let dyaw = want - A.yaw;
    while (dyaw > Math.PI) dyaw -= Math.PI * 2;
    while (dyaw < -Math.PI) dyaw += Math.PI * 2;
    turn = Math.max(-1, Math.min(1, dyaw * 1.6)) * TURN;
    pitchWant = 0.05;                                  // nivelado mientras vuelve
    if (rad < RING * AUTO_OFF && Math.abs(dyaw) < 0.5) { A.auto = 0; A.outT = 0; }
  }

  // ---------- ACTITUD ----------
  A.yaw += turn * dt;
  if (A.yaw > Math.PI) A.yaw -= Math.PI * 2; else if (A.yaw < -Math.PI) A.yaw += Math.PI * 2;
  A.pitch += (pitchWant - A.pitch) * Math.min(1, dt * PITCH_LERP);
  // alabeo VISUAL, coordinado con el viraje (es lo que vende que estas virando, no derrapando)
  A.roll += (turn / TURN * 0.95 - A.roll) * Math.min(1, dt * 3.4);
  A.fwd = forward(A.yaw, A.pitch);
  A.up = { x: 0, y: 1, z: 0 };

  // ---------- VELOCIDAD ----------
  // el gas empuja hacia crucero/turbo; picar REGALA velocidad y trepar la COBRA (energia)
  const tgt = gas ? (inp.turbo ? SPD_TURBO : SPD_CRUISE) : SPD_MIN;
  A.spd += ((tgt - A.spd) * 0.9 - Math.sin(A.pitch) * ENERGY) * dt * (SPD_ACC / 26);
  A.spd = Math.max(60, Math.min(SPD_TURBO * 1.15, A.spd));

  // ---------- POSICION ----------
  A.pos.x += A.fwd.x * A.spd * dt;
  A.pos.y += A.fwd.y * A.spd * dt;
  A.pos.z += A.fwd.z * A.spd * dt;
  // techo blando (arriba no hay nada que ver); ABAJO no hay clamp: el mar mata, como en todo
  // el juego. La regla del rasante — soltas el gas y te hundis — recien existe si hundirse duele.
  if (A.pos.y > ALT_MAX) { A.pos.y = ALT_MAX; if (A.pitch > 0) A.pitch *= 0.4; }
  if (A.doneT <= 0) {
    if (A.pos.y < SEA_KILL) { A = null; return { death: 'death_sea' }; }
    if (world3D.hitsShip(A.pos.x, A.pos.y, A.pos.z)) { A = null; return { death: 'death_mast' }; }
  }

  engineFly(A.spd, inp.turbo && gas, inp.turbo ? 0.026 : 0.018);
  if (gas && run.fuel > 0) run.fuel = Math.max(0, run.fuel - dt * 0.55);

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

  // ---------- cañon: rayo desde el MORRO ----------
  A.shotCd = Math.max(0, A.shotCd - dt);
  if (inp.fire && A.shotCd <= 0 && !A.auto) {
    A.shotCd = SHOT_CD;
    A.gunSide = -A.gunSide;
    const hit = world3D.shootRay(A.pos, A.fwd, GUN_RANGE);
    A.fx.push({
      k: 'sh', zone: hit && hit.zone, ship: !!hit, side: A.gunSide,
      T: 0, dur: hit ? Math.max(0.1, hit.dist / 1400) : 0.5, life: 1, aim: aimPoint(),
    });
    if (A.gunSide < 0) A.flashL = 0.07; else A.flashR = 0.07;
    if (!sfxOne('momGun')) beep(150, 0.05, 'square', 0.05, 70);
  }
  if (inp.msl) launchMissile();

  // ---------- el buque se DEFIENDE: trazadoras (presion visible) + FLAK que mata ----------
  const aa = aliveAA();
  if (aa.length) {
    // rafagas trazadoras: nacen en una AA viva y te buscan con dispersion — casi nunca pegan
    // (son la presion que se VE); el que mata es el flak, que se telegrafia
    if (Math.random() < dt * 1.5 * aa.length) {
      const mp = world3D.zoneWorldPos(aa[(Math.random() * aa.length) | 0].id);
      if (mp) {
        let dx = A.pos.x - mp.x + (Math.random() - 0.5) * 90;
        let dy = A.pos.y - mp.y + (Math.random() - 0.5) * 60;
        let dz = A.pos.z - mp.z + (Math.random() - 0.5) * 90;
        const dl = Math.hypot(dx, dy, dz) || 1;
        A.fx.push({ k: 'tr3', x: mp.x, y: mp.y, z: mp.z, vx: dx / dl * 260, vy: dy / dl * 260, vz: dz / dl * 260, life: 2.6, T: 0 });
      }
    }
    A.flakT -= dt;
    if (A.flakT <= 0) {
      // FLAK con PREDICCION: el punto de detonacion se fija AL DISPARAR. Con el radar vivo
      // apuntan a donde vas a estar siguiendo tu rumbo — sostenerlo es impacto seguro y hay
      // que quebrar; con el radar muerto apuntan a donde estabas y volar derecho alcanza.
      // Matar el radar compra la calma: por eso es el blanco prioritario.
      A.flakT = Math.max(1.0, (2.8 + Math.random() * 1.2) / aa.length);
      const lead = radarAlive() ? A.spd * FLAK_FUSE * 0.92 : 0;
      // OJO: life > fuse por obligacion — el filtro del final mata todo fx con life <= 0, y un
      // fw3 sin life moria EN EL MISMO FRAME en que nacia (el flak nunca disparaba y no habia
      // ningun error que lo dijera). La detonacion pone life = 0 a mano.
      A.fx.push({
        k: 'fw3', T: 0, fuse: FLAK_FUSE, life: FLAK_FUSE + 1,
        px: A.pos.x + A.fwd.x * lead + (Math.random() - 0.5) * 24,
        py: Math.max(8, A.pos.y + A.fwd.y * lead + (Math.random() - 0.5) * 16),
        pz: A.pos.z + A.fwd.z * lead + (Math.random() - 0.5) * 24,
      });
      beep(980, 0.09, 'square', 0.045); beep(980, 0.09, 'square', 0.045, 980);   // bip doble de aviso
    }
  }

  return updateFx(dt);
}

/** avanza los proyectiles y sus impactos; devuelve { death } si el flak te agarro */
function updateFx(dt) {
  let death = null;
  for (const f of A.fx) {
    f.T += dt;
    if (f.k === 'sh' || f.k === 'ms') {
      if (f.T >= f.dur && f.life > 0.5) {
        f.life = 0.4;
        if (f.zone) hitZone(f.zone, f.k === 'ms' ? MSL_DMG : SHOT_DMG);
        if (f.zone && f.k === 'ms') boom(0.18);
      }
      if (f.T >= f.dur) f.life -= dt * 4;
    } else if (f.k === 'tr3') {
      // trazadora enemiga: un punto volando por el MUNDO (el render la proyecta)
      f.life -= dt;
      f.x += f.vx * dt; f.y += f.vy * dt; f.z += f.vz * dt;
      if (f.y < 1) f.life = 0;                            // toca el agua y muere
    } else if (f.k === 'fw3') {
      // flak: detonacion en el punto FIJADO al disparar. La distancia REAL en el mundo decide
      // — el esquive es fisico (quebrar el rumbo te saca de la esfera), no un chequeo abstracto.
      f.fuse -= dt;
      if (f.fuse <= 0) {
        f.life = 0;
        const d = Math.hypot(A.pos.x - f.px, A.pos.y - f.py, A.pos.z - f.pz);
        A.fx.push({ k: 'fk3', px: f.px, py: f.py, pz: f.pz, vr: 30, life: 0.9, T: 0 });
        if (d < FLAK_HIT && A.doneT <= 0) death = { death: 'death_aa' };
        else if (d < FLAK_NEAR) { boom(0.10); run.shake = Math.min(6, run.shake + 1.6); }
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
if (typeof window !== 'undefined') window.__aset = (d, alt, off) => {
  if (!A) return 'no arena';
  const a = (off || 0);
  // forward(yaw) = (sin yaw, ·, -cos yaw). Para encarar el origen desde (sin a·d, cos a·d) hace
  // falta forward ∝ (-sin a, -cos a) → yaw = -a (con a+PI el eje z queda invertido: el buque
  // aparecia de costado en vez de al frente).
  A.pos.x = Math.sin(a) * d; A.pos.z = Math.cos(a) * d; A.pos.y = alt;
  A.yaw = -a; A.pitch = -Math.atan2(alt - 20, d); A.roll = 0;
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
  spd: A.spd | 0, out: +A.outT.toFixed(1), auto: A.auto, zonas: zones.filter(z => z.hp > 0).length,
  vidas: run.lives, flak: A.fx.filter(f => f.k === 'fw3').length,
});
