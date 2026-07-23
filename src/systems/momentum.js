// MOMENTUM: el climax en primera persona. Bullet-time sobre el asalto a la barcaza.
//
// Es un SUBSISTEMA con estado propio (`mom`, la pasada actual; `momPhase`, cuantas pasadas van;
// `momDrift`, el avance visual; `MOM_PHASES`, el layout de zonas del buque). Nada de eso se
// comparte por el store global: es privado del modulo y se lee desde afuera por accesores.
//
// El agregado de fases/buques es DATA: MOM_PHASES sale de data/ships.js (MOM_LAYOUTS por clase).
// Esta logica es generica sobre esas fases — para un buque nuevo no se toca este archivo.
//
// REGLA DEL LIMITE: el modulo no llama "hacia arriba". Cuando la pasada termina la mision o mata
// al avion, update() DEVUELVE UNA SEÑAL ('objective' | { death }) y el orquestador (game.js)
// decide el flujo (recuento / muerte). Asi momentum no depende del sistema de misiones ni del
// de muerte, que son de otro lado.
//
// El render vive en render/momentum.js; la geometria compartida (shipGeom/cam/zoneRect) se
// exporta desde aca para que el dibujo no reciba callbacks del motor.

import { S, setState, cfg, stats } from '../core/state.js';
import { run } from '../core/run.js';
import { parts, popups, prune, clearWorld } from '../core/world.js';
import { popup } from '../core/fx.js';
import { T } from '../core/i18n.js';
import { P } from '../data/palette.js';
import { MOM_LAYOUTS, SHIP_CLASS } from '../data/ships.js';
import { MOM_AX, MOM_AY, REATTACK_DUR, REATTACK_FUEL, REATTACK_MAX } from '../data/tuning.js';
import { W, H, HOR } from '../render/ctx.js';
import { boom, beep, sfxOne, duck, engineOff, engineRumble } from '../systems/audio.js';

// fraccion de la velocidad de vuelo que conserva el avion durante el MOMENTUM.
// Subir = mas sensacion de seguir entrando; bajar = mas quieto/ceremonioso.
const MOM_ADVANCE = 0.5;

// --- estado privado del subsistema ---
let mom = null;                    // la pasada actual (null fuera del momentum)
let momPhase = 0;                  // cuantas pasadas completas van sobre el buque
let momDrift = 0;                  // avance SOLO visual: el mar/tierra nunca dejan de correr
let MOM_PHASES = MOM_LAYOUTS.t42;  // layout de zonas del buque del run (lo fija setLayout)

// --- accesores para el render y el resto del juego (solo lectura) ---
export const active = () => mom;
export const phase = () => momPhase;
export const drift = () => momDrift;
export const phases = () => MOM_PHASES;

/** Fija el layout de zonas segun la clase del buque (al armar el run). */
export function setLayout(shipClass) { MOM_PHASES = MOM_LAYOUTS[SHIP_CLASS[shipClass]] || MOM_LAYOUTS.t42; }

/** Reinicia el subsistema entre runs (lo llama reset() del juego). */
export function resetMomentum() { mom = null; momPhase = 0; momDrift = 0; }

/** true si el avion llego al punto de la proxima pasada y hay que entrar al climax. */
export function readyToEnter(dist, objectiveDist) {
  return momPhase < MOM_PHASES.length && dist >= objectiveDist * MOM_PHASES[momPhase].at;
}

// nombres publicos (el interior conserva los nombres historicos para no tocar las llamadas):
export {
  enterMomentum as enter,
  updateMomentum as update,
  momLaunchMissile as launchMissile,
  momShipGeom as shipGeom,
  momCam as cam,
  momZoneRect as zoneRect,
};

function momShipGeom() {
  const ph = MOM_PHASES[momPhase];
  const prog = mom.t / ph.time;
  // cierra 0.82×→1.06× durante la pasada y SIGUE cerrando (mas lento) si se pasa del tiempo
  // nominal — p.ej. durante el outro. Antes se clampeaba en 1 y el barco quedaba clavado:
  // el avion parecia frenar en seco justo al final.
  const extra = Math.min(0.5, Math.max(0, prog - 1));
  let f = 0.82 + 0.24 * Math.min(1, prog) + 0.10 * extra;
  // VIRAJE 180: te alejas y reencaras, asi que el barco vuelve suave al standoff de entrada
  // (0.82×). Al terminar el viraje mom.t se resetea a 0 → sigue justo desde ahi, sin salto.
  if (mom.turn > 0) f += (0.82 - f) * Math.min(1, (1 - mom.turn / REATTACK_DUR) * 1.3);
  const sc = ph.scale * f;
  // barco FIJO/ANCLADO (sin balanceo ni cabeceo): el movimiento del duelo lo pone el ALABEO
  // del avion (el mundo entero gira con mom.roll), no el barco
  return { cx: W / 2, len: W * 0.82 * sc, deckY: HOR + 36 * sc, uh: 9 * sc, sc };
}

// camara del momentum: la MIRA queda CLAVADA al visor del cockpit (MOM_AX, MOM_AY) y para
// apuntar se mueve EL MUNDO (giras la trompa del avion, no un cursor). mom.cx/cy es el punto
// apuntado en coords de mundo; el mundo se dibuja corrido para que ese punto caiga en el visor.
function momCam() {
  if (S.state !== 'momentum' || !mom) return { x: 0, y: 0 };
  return { x: mom.cx - MOM_AX, y: mom.cy - MOM_AY };
}
// pantalla → mundo en momentum: el mundo se dibuja rotado -mom.roll alrededor del centro
// (alabeo), asi que para apuntar/spawnear hay que DESHACER esa rotacion y sumar la camara
function momScrToWorld(sx2, sy2) {
  const cmw2 = momCam(), ca = Math.cos(mom.roll || 0), sa = Math.sin(mom.roll || 0);
  const dx = sx2 - W / 2, dy = sy2 - H / 2;
  return { x: W / 2 + dx * ca - dy * sa + cmw2.x, y: H / 2 + dx * sa + dy * ca + cmw2.y };
}

function momZoneRect(z) {
  const g = momShipGeom();
  const w = g.len * z.w, h = g.uh * z.h;
  return { x: g.cx + g.len / 2 * z.u - w / 2, y: g.deckY - g.uh * z.v - h, w, h };
}
function momBoom(sx, sy, big) {
  for (let i = 0, n = big ? 28 : 14; i < n; i++)
    parts.push({
      x: sx + (Math.random() - 0.5) * 6, y: sy + (Math.random() - 0.5) * 4, vx: (Math.random() - 0.5) * 85,
      vy: -(10 + Math.random() * 70), life: 0.45 + Math.random() * 0.55,
      c: [P.warn, P.accent, '#f2b544', '#3a3f43'][i % 4], r: 1 + Math.random() * 2
    });
  run.shake = Math.min(6, run.shake + (big ? 4 : 2)); boom(big ? 0.16 : 0.08);
  if (big) duck(0.55);                      // la explosion agacha la musica un instante
}
// zona critica destruida (comparten cañon y misil): explosion, puntos y cierre de pasada
function momZoneKilled(z) {
  const r = momZoneRect(z), cmw = momCam();
  z.hp = 0;
  momBoom(r.x + r.w / 2, r.y + r.h / 2, true);
  // explosion real: la primera pasada suena LEJANA (heavy_dist), las siguientes de cerca
  sfxOne(momPhase === 0 ? 'exHeavyDist' : 'exHeavy');
  run.score += z.pts; stats.zones++;
  popup(r.x + r.w / 2, r.y - 6, '+' + z.pts, P.accent);
  popup(MOM_AX + cmw.x, 50 + cmw.y, T('mom_destroyed', { z: T(z.label) }), P.warn);
  if (mom.zones.every(zz => zz.hp <= 0)) {
    run.score += 500 * (momPhase + 1);
    const last = momPhase + 1 >= MOM_PHASES.length;
    if (last) sfxOne('exXheavy');   // el barco entero se va: la explosion GRANDE del nivel
    mom.doneT = last ? 1.6 : 1.0;
    popup(MOM_AX + cmw.x, 62 + cmw.y, last ? T('bargeDown') : T('mom_clear'), P.accent);
    beep(880, 0.2, 'square', 0.06, 1200);
  }
}
// impacto de MISIL en momentum: 55 de daño a toda zona cercana al punto de explosion
function momMissileBoom(mx, my2) {
  momBoom(mx, my2, true);
  for (const z of mom.zones) {
    if (z.hp <= 0) continue;
    const r = momZoneRect(z);
    if (mx > r.x - 9 && mx < r.x + r.w + 9 && my2 > r.y - 9 && my2 < r.y + r.h + 9) {
      z.hp -= 80;
      if (z.hp <= 0) momZoneKilled(z);
      else popup(r.x + r.w / 2, r.y - 6, '-80', P.warn);
    }
  }
}
// misil en primera persona: sale del ala (fuera del vidrio, alternando lado), vuela LENTO
// con guiado hacia el punto apuntado al momento del disparo, y explota con daño en area.
// Usa la MISMA municion `msl` que el vuelo normal (la recarga queda pausada en camara lenta).
function momLaunchMissile(mouse) {
  if (!mom || mom.doneT > 0 || run.msl <= 0 || run.mslCd > 0) return;
  run.msl--; run.mslCd = 0.6;
  mom.mslSide = -(mom.mslSide || 1);
  const mo = momScrToWorld(MOM_AX + mom.mslSide * 95, H - 30);       // pilon del ala (rola con vos)
  const mt = momScrToWorld(mouse.on ? mouse.x : MOM_AX, mouse.on ? mouse.y : MOM_AY);
  mom.fx.push({
    k: 'ms', x: mo.x, y: mo.y,
    tx: mt.x, ty: mt.y,
    vx: mom.mslSide * -30, vy: -52, life: 3.5, T: 0
  });
  // resplandor de lanzamiento (mas largo que el del canon)
  if (mom.mslSide < 0) mom.flashL = 0.22; else mom.flashR = 0.22;
  sfxOne('msl');   // lanzamiento real (misil.mp3 / misil2.wav al azar)
  beep(200, 0.2, 'sawtooth', 0.05, 80); boom(0.05, true);
}
function enterMomentum() {
  const ph = MOM_PHASES[momPhase];
  setState('momentum');
  clearWorld({ keepFx: true });   // se limpia el campo para la cinematica; las explosiones en curso siguen
  mom = {
    t: 0, timer: ph.time, doneT: 0, turn: 0, pass: 1, cx: W / 2, cy: 80, hitFx: 0, fx: [],
    roll: 0, rollV: 0,   // ALABEO: el avion rola sobre su eje longitudinal (←/→); el mundo gira, la cabina no
    zones: ph.zones.map(z => Object.assign({}, z, { hp: z.maxHp }))
  };
  mom.cy = momShipGeom().deckY - 8;            // arranca apuntando a la cubierta (coords de MUNDO)
  const cm0 = momCam();
  popup(MOM_AX + cm0.x, 46 + cm0.y, T('mom_title'), P.warn);               // popups viven en espacio-mundo
  popup(MOM_AX + cm0.x, 56 + cm0.y, T('mom_pass', { n: momPhase + 1, m: MOM_PHASES.length }), P.dim);
  beep(620, 0.7, 'sine', 0.07, 65);   // sting de entrada: el tiempo se ESTIRA (pitch cayendo)
  boom(0.10);
  engineOff();
}
// VIRAJE 180 y nueva pasada sobre el mismo blanco. Las zonas conservan su hp: lo que ya
// rompiste cuenta, asi que insistir avanza en vez de reiniciar. Cuesta combustible.
function startReattack() {
  // FIN DE MISION si no lo destruiste: sin nafta para otra vuelta, o agotados los intentos.
  // Sin esto el bucle de re-ataque no termina nunca (fuel se clampea en 0 y seguis virando).
  const noFuel = cfg.fuelOn && run.fuel < REATTACK_FUEL;
  if (noFuel || mom.pass >= REATTACK_MAX) return { death: noFuel ? 'death_fuel' : 'death_aa' };
  mom.turn = REATTACK_DUR;
  mom.pass = (mom.pass || 1) + 1;
  stats.reattacks++;
  if (cfg.fuelOn) run.fuel = Math.max(0, run.fuel - REATTACK_FUEL);
  const cm = momCam();
  popup(MOM_AX + cm.x, 50 + cm.y, T('mom_turn'), P.warn);
  sfxOne('waveFly');                                  // rafaga del viraje
  beep(300, 0.5, 'sine', 0.05, 700);                  // sting ascendente: reencarás
  run.shake = Math.min(6, run.shake + 2);
}

function updateMomentum(dt, inp, mouse, objectiveDist) {
  run.t -= dt * 0.70;                       // camara lenta: el mundo de fondo corre al 30%
  mom.t += dt;
  // El avion SIGUE AVANZANDO en camara lenta. Al 25% el flujo era tan tenue que, sumado al
  // tiempo ralentizado, se leia como si el avion estuviera clavado en el aire; al 50% se nota
  // que seguis entrando sin romper la sensacion de bullet-time.
  // dist se topa 2% antes del gatillo de la proxima pasada (para no encadenar momentums al
  // volver al vuelo), pero el sobrante va a momDrift — avance SOLO visual, sin tope: el mar
  // y el terreno nunca dejan de correr hacia vos.
  {
    const nextAt = (momPhase + 1 < MOM_PHASES.length) ? MOM_PHASES[momPhase + 1].at : 99;
    const adv = run.spd * MOM_ADVANCE * dt;
    const take = Math.min(adv, Math.max(0, objectiveDist * (nextAt - 0.02) - run.dist));
    run.dist += take; momDrift += adv - take;
  }
  // AUDIO de camara lenta: el motor pasa a ser un rumble GRAVE y ahogado con un pulso
  // lento tipo latido (el lowpass de 320Hz del motor hace el resto del efecto "bajo el agua")
  engineRumble(mom.t);
  popups.forEach(p => { p.y -= 14 * dt; p.life -= dt; });
  prune(popups, p => p.life > 0);

  // ---- FX de CAMARA LENTA (viven en coords de mundo; corren tambien durante el outro) ----
  // trazadoras AA de la barcaza, bocanadas de flak y rocio/escombros derivando por los costados.
  // Todo con velocidades LENTAS a proposito: vende el bullet-time. Son visuales, no danian.
  {
    const gfx = momShipGeom(), cmf = momCam();
    mom.flashL = Math.max(0, (mom.flashL || 0) - dt);   // resplandor de disparo: decae siempre
    mom.flashR = Math.max(0, (mom.flashR || 0) - dt);
    if (mom.fx.length < 70) {
      if (Math.random() < dt * 2.6) {                               // trazadora AA: nace en el barco y pasa de largo
        const x0 = gfx.cx + (Math.random() - 0.5) * gfx.len * 0.85;
        const y0 = gfx.deckY - gfx.uh * (0.6 + Math.random() * 1.6);
        const e = Math.random(); let tx, ty;                     // punto de fuga fuera de pantalla
        if (e < 0.38) { tx = cmf.x - 24; ty = cmf.y + Math.random() * H; }
        else if (e < 0.76) { tx = cmf.x + W + 24; ty = cmf.y + Math.random() * H; }
        else { tx = cmf.x + Math.random() * W; ty = cmf.y + H + 24; }
        const dx = tx - x0, dy = ty - y0, dl = Math.hypot(dx, dy) || 1;
        const sp = 26 + Math.random() * 30;
        mom.fx.push({ k: 'tr', x: x0, y: y0, vx: dx / dl * sp, vy: dy / dl * sp, life: 3.4, T: 0 });
      }
      if (Math.random() < dt * 3.6) {                               // rocio/escombro pasando por los costados
        // nace DENTRO del vidrio visible (los parantes tapan x<52 y x>268; el panel tapa y>62)
        // y deriva hacia afuera: cruza el vidrio y desaparece tras el marco
        const side = Math.random() < 0.5 ? -1 : 1;
        mom.fx.push({
          k: 'st', x: side < 0 ? cmf.x + 56 + Math.random() * 60 : cmf.x + W - 56 - Math.random() * 60,
          y: cmf.y + 15 + Math.random() * 55,
          vx: side * (10 + Math.random() * 16), vy: 4 + Math.random() * 8,
          len: 3 + Math.random() * 5, life: 2.2 + Math.random() * 1.4, T: 0
        });
      }
      if (Math.random() < dt * 1.1) {                               // flak: bocanada que se expande despacio
        mom.fx.push({
          k: 'fk', x: gfx.cx + (Math.random() - 0.5) * gfx.len * 1.4,
          y: gfx.deckY - gfx.uh * (2.5 + Math.random() * 4.5),
          vr: 4 + Math.random() * 4, life: 1.6, T: 0
        });
      }
    }
    for (const f of mom.fx) {
      f.T += dt; f.life -= dt;
      if (f.k === 'sh') {                                   // rafaga de canon: BALISTICA (sin tracking)
        const dx = f.tx - f.x, dy = f.ty - f.y, d = Math.hypot(dx, dy) || 1;
        const sp = 150;                                     // lenta (antes era hitscan instantaneo)
        f.vx = dx / d * sp; f.vy = dy / d * sp;
        if (d < 6 || f.life <= 0.05) {                      // IMPACTO donde APUNTASTE: chispas + dano fuerte
          for (let i = 0; i < 7; i++) parts.push({
            x: f.tx + (Math.random() - 0.5) * 5, y: f.ty + (Math.random() - 0.5) * 4,
            vx: (Math.random() - 0.5) * 60, vy: -(15 + Math.random() * 45), life: 0.35,
            c: Math.random() < 0.5 ? P.warn : P.accent, r: 1.3
          });
          // pega en la zona que CONTENGA el punto de impacto (margen ±1): 45 de daño
          for (const z of mom.zones) {
            if (z.hp <= 0) continue;
            const r = momZoneRect(z);
            if (f.tx >= r.x - 1 && f.tx <= r.x + r.w + 1 && f.ty >= r.y - 1 && f.ty <= r.y + r.h + 1) {
              z.hp -= 45; mom.hitFx = 1; stats.hits++;
              boom(0.06); beep(88, 0.11, 'triangle', 0.05, 44);   // THUMP de impacto con cuerpo
              if (z.hp <= 0) momZoneKilled(z);
              break;
            }
          }
          f.life = 0; continue;
        }
      }
      if (f.k === 'ms') {                                   // misil del jugador: guiado lento hacia el blanco
        const dx = f.tx - f.x, dy = f.ty - f.y, d = Math.hypot(dx, dy) || 1;
        const sp = 70;                                       // lento a proposito: bullet-time
        f.vx += (dx / d * sp - f.vx) * Math.min(1, dt * 3.2);
        f.vy += (dy / d * sp - f.vy) * Math.min(1, dt * 3.2);
        if (Math.random() < 0.7) parts.push({                // estela de humo
          x: f.x, y: f.y, vx: (Math.random() - 0.5) * 12, vy: (Math.random() - 0.5) * 12,
          life: 0.7, c: '#7c838a', r: 1.2
        });
        if (d < 5 || f.life <= 0.05) { momMissileBoom(f.x, f.y); f.life = 0; continue; }
      }
      if (f.vx !== undefined) { f.x += f.vx * dt; f.y += f.vy * dt; }
    }
    mom.fx = mom.fx.filter(f => f.life > 0);
  }
  if (mom.doneT > 0) {                 // salida: pasada completa o barcaza destruida
    mom.doneT -= dt;
    if (mom.doneT <= 0) {
      if (momPhase + 1 >= MOM_PHASES.length) { mom = null; return 'objective'; }
      momPhase++; mom = null; setState('play');
      popup(W / 2, 58, T('mom_next'), P.accent);
      beep(110, 0.4, 'sine', 0.06, 640);   // sting de salida: el tiempo VUELVE (pitch subiendo)
    }
    return;
  }
  // VIRAJE 180: el mundo rola como en un wingover y volvés a encarar el blanco. No corre el
  // reloj ni se puede disparar; el mar SI sigue corriendo (el bloque de avance ya paso arriba).
  if (mom.turn > 0) {
    mom.turn -= dt;
    const tp = 1 - Math.max(0, mom.turn) / REATTACK_DUR;   // 0..1
    mom.roll = Math.sin(tp * Math.PI) * Math.PI;           // rola 180° y sale derecho
    mom.rollV = 0;
    if (mom.turn <= 0) {                                   // reencarado: nueva pasada
      const ph2 = MOM_PHASES[momPhase];
      mom.turn = 0; mom.roll = 0; mom.t = 0; mom.timer = ph2.time;
      mom.cy = momShipGeom().deckY - 8;                    // la mira vuelve a la cubierta
      const cm2 = momCam();
      popup(MOM_AX + cm2.x, 56 + cm2.y, T('mom_pass_n', { n: mom.pass }), P.accent);
      beep(620, 0.5, 'sine', 0.06, 90);
    }
    return;
  }
  mom.timer -= dt;
  // misiles: misma municion que el vuelo normal; Z (o boton tactil) lanza
  run.mslCd = Math.max(0, run.mslCd - dt);
  if (inp.msl) momLaunchMissile(mouse);
  // ALABEO (roll): ←/→ hacen ROLAR el avion sobre su eje longitudinal (el que apunta a la
  // barcaza). El MUNDO ENTERO (horizonte + barco) gira alrededor del centro; la cabina queda
  // fija (sos vos el que rola). El barco esta ANCLADO (sin balanceo). ↑/↓ mueven la cabina.
  const CS = 98;
  mom.rollV += ((inp.r - inp.l) * 1.6 - mom.rollV) * Math.min(1, dt * 2.8);   // entra/sale con peso
  mom.roll += mom.rollV * dt;
  if (!inp.l && !inp.r) {
    // auto-nivelado suave hacia la vuelta completa mas cercana (permite toneles enteros)
    const lvl = Math.round(mom.roll / (Math.PI * 2)) * Math.PI * 2;
    mom.roll += (lvl - mom.roll) * Math.min(1, dt * 1.1);
  }
  mom.cy = Math.max(44, Math.min(122, mom.cy + (inp.d - inp.u) * CS * dt));
  // CANON en camara lenta: rafagas DISCRETAS — menos balas, mas lentas, mas dano por bala
  // (dps similar al hitscan anterior: 22 cada 0.36s ≈ 61). Cada bala nace en el ala, viaja
  // LENTA hasta el punto apuntado al disparar y, si habia una zona bajo la mira, la trackea
  // (lock) mientras el barco se balancea. El impacto es puntual y fuerte → efecto bullet-time.
  const cmw = momCam();
  // punto APUNTADO en coords de mundo (deshaciendo el roll): con MOUSE la mira es libre
  // sobre el vidrio (PC); sin mouse (tactil/legacy) apunta el visor fijo del centro
  const aimP = momScrToWorld(mouse.on ? mouse.x : MOM_AX, mouse.on ? mouse.y : MOM_AY);
  const aimX = aimP.x, aimY = aimP.y;
  mom.hitFx = Math.max(0, (mom.hitFx || 0) - dt * 5);   // flash breve al impactar (decae)
  mom.shotCd = Math.max(0, (mom.shotCd || 0) - dt);
  if (inp.fire && mom.shotCd <= 0) {
    mom.shotCd = 0.5;                                    // cadencia mas lenta: menos tiros, mas dañinos
    mom.gunSide = -(mom.gunSide || 1);                   // alterna ala izq/der
    // BALISTICA PURA: la bala vuela al punto APUNTADO al disparar (sin tracking) con
    // DISPERSION — mas abierta si estas rolando. Acertar es mas dificil, pero pega el doble.
    const spread = 3.5 + Math.abs(mom.rollV) * 5;
    const tx = aimX + (Math.random() - 0.5) * spread * 2;
    const ty = aimY + (Math.random() - 0.5) * spread * 2;
    // la bala nace en el ALA (posicion de pantalla, fuera del vidrio) convertida a mundo
    // con el roll aplicado: al rolar, tus alas rotan con vos
    const wing = momScrToWorld(mom.gunSide < 0 ? -40 : W + 40, 66);
    mom.fx.push({
      k: 'sh', x: wing.x, y: wing.y,
      tx, ty, life: 2.2, T: 0, vx: 0, vy: 0
    });
    // RESPLANDOR de fogonazo en el borde del lado que disparo (feedback instantaneo)
    if (mom.gunSide < 0) mom.flashL = 0.14; else mom.flashR = 0.14;
    // disparo real: xsmall_explosion / xsmall_explosion2 al azar. Sin samples (build web)
    // cae al beep grave y gordo de antes.
    if (!sfxOne('momGun')) beep(140, 0.12, 'square', 0.07, 55);
    boom(0.05);
  }
  // Se acabo la ventana de tiro: pasaste por encima y perdiste el angulo. NO es muerte —
  // virás 180° y volvés a entrar sobre el mismo blanco (ver startReattack).
  if (mom.timer <= 0) return startReattack();
}
