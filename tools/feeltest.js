// TESTS DE SENSACION — simulan la matematica del vuelo fuera del navegador.
//   npm run feel
//
// No dibujan ni abren Electron: corren las ecuaciones REALES del juego y reportan los tiempos y
// velocidades que va a sentir el jugador. Sirven de dos maneras:
//   - al ajustar la sensacion, dan el numero exacto en vez de "probemos a ver"
//   - al refactorizar, detectan si algo se movio sin querer
//
// IMPORTANTE: importa src/core/physics.js — NO reimplementa las formulas. Antes las tenia
// copiadas, asi que podia dar verde mientras el juego hacia otra cosa.
import {
  pitchTarget, applyEnergy, scrapeLimit, speedTarget,
  PITCH_LERP, PITCH_ROW, SCRAPE_LIFT, SCRAPE_RECOVER,
} from '../src/core/physics.js';
import * as aero from '../src/core/aero.js';
import { AR } from '../src/data/arena.js';
import * as tempo from '../src/systems/tempo.js';
import { TEMPO_SCALE, TEMPO_DUR, TEMPO_CHARGE } from '../src/data/tuning.js';

const G = 22, TH = 55, DIVE = 30;   // gravedad, empuje y picada (game.js)
const DT = 1 / 60;

let bad = 0;
const check = (label, got, want, tol) => {
  const ok = Math.abs(got - want) <= tol;
  if (!ok) bad++;
  console.log(`  ${ok ? '✓' : '✗'} ${label.padEnd(42)} ${got.toFixed(2)}  (esperado ${want} ±${tol})`);
};

// ---------- CABECEO: cuanto tarda en aparecer el sprite de trepada/picada ----------
function pitchTime(vin, vy0 = 0) {
  let vy = vy0, pitch = 0, hold = 0, t = 0;
  for (let i = 0; i < 6 / DT; i++) {
    t += DT;
    vy += (vin > 0 ? TH - G : -G - DIVE) * DT;
    hold += DT;
    pitch += (pitchTarget(vin, hold, vy) - pitch) * Math.min(1, DT * PITCH_LERP);
    if (vin > 0 ? pitch > PITCH_ROW : pitch < -PITCH_ROW) return t;
  }
  return 99;
}

// ---------- ENERGIA: picar da velocidad, trepar la gasta ----------
function energy(input, secs = 4, spd0 = 120, t0 = 30) {
  let y = 24, vy = 0, spd = spd0, t = t0;
  for (let i = 0; i < secs / DT; i++) {
    t += DT;
    vy += ((input === 'climb' ? TH : 0) - G - (input === 'dive' ? DIVE : 0)) * DT;
    y = Math.max(0.9, Math.min(46, y + vy * DT));
    if (y <= 0.9 || y >= 46) vy = 0;
    const tgt = speedTarget({ t, rasLevel: 0, mult: 1, windF: 1, boost: false, afterTier: 0 });
    spd = applyEnergy(spd, tgt, vy, DT);
  }
  return spd;
}

// ---------- ROCE: que se pueda ESCAPAR dando gas ----------
function scrapeEscape() {
  const groundY = 0.9, scrapeY = groundY + SCRAPE_LIFT;
  let y = groundY - 0.05, vy = 0, spd = 150, scrapeT = 0.001, t = 0;
  for (let i = 0; i < 4 / DT; i++) {
    t += DT;
    vy += (TH - G) * DT;                       // el jugador da gas para salir
    y += vy * DT;
    if (y <= (scrapeT > 0 ? scrapeY + 0.2 : groundY)) {
      scrapeT += DT;
      if (scrapeT >= scrapeLimit(spd, false)) return { r: 'MURIO', t };
      if (y < scrapeY) y = scrapeY;            // PISO, no altura fija (si se clava, no se puede salir)
      if (vy < 0) vy = 0;
      spd = Math.max(34, spd - spd * 1.1 * DT);
    } else {
      scrapeT = Math.max(0, scrapeT - DT * SCRAPE_RECOVER);
      if (scrapeT <= 0) return { r: 'ESCAPO', t };
    }
  }
  return { r: 'ATRAPADO', t: 4 };
}

console.log('\nTESTS DE SENSACION (usan las formulas reales de src/core/physics.js)\n');

console.log('cabeceo — aparicion del sprite:');
check('mantener ARRIBA desde vuelo nivelado', pitchTime(1), 0.50, 0.08);
check('mantener ABAJO desde vuelo nivelado', pitchTime(-1), 0.50, 0.08);

// La magnitud depende del tramo simulado y no vale como umbral fijo (una tolerancia ancha solo
// aparenta verificar). Lo que importa es la INVARIANTE: picar tiene que dar mas que trepar.
console.log('\nenergia — la altura se cambia por velocidad:');
const climb = energy('climb'), dive = energy('dive');
console.log(`    tras 4s: trepando ${climb.toFixed(0)}  ·  picando ${dive.toFixed(0)}  (dif +${(dive - climb).toFixed(0)})`);
if (dive > climb) console.log(`  ✓ ${'picar da mas velocidad que trepar'.padEnd(42)}`);
else { bad++; console.log('  ✗ picar NO da mas velocidad que trepar — el intercambio de energia esta roto'); }

console.log('\nroce — margen antes de morir:');
check('a baja velocidad (spd=90), sin turbo', scrapeLimit(90, false), 0.85, 0.05);
check('a fondo (spd=280), con turbo', scrapeLimit(280, true), 0.10, 0.03);

console.log('\nroce — se puede salir dando gas:');
const esc = scrapeEscape();
if (esc.r === 'ESCAPO') console.log(`  ✓ ${'escapa del roce con gas'.padEnd(42)} ${esc.t.toFixed(2)} s`);
else { bad++; console.log(`  ✗ NO se puede salir del roce (${esc.r}) — el avion queda clavado`); }

// ---------- ARENA: el sobre de vuelo del climax (src/core/aero.js, modelo E1/E2) ----------
// PLAN_MINUTOS_SAGRADOS: el jugador comanda ANGULOS (cabeceo/alabeo) y las velocidades son la
// consecuencia. Los checks son los CRITERIOS DE SALIDA de E1 y E2 del plan. Referencia del
// modelo anterior (heredado del pasillo, medido en el plan §2.2): cabeceo max 8.2°, derrape
// sostenido 13.5°, radio de giro 139 m, vuelta 7.0 s.
const DEG = 180 / Math.PI;

// corre el modelo entero N segundos con un input fijo (o una funcion de estado → input)
function fly(io, secs, st0) {
  const st = Object.assign({ yaw: 0, pitch: 0, roll: 0, spd: AR.SPD_CRUISE, vx: 0, y: 150, turns: 0, _py: 0 }, st0);
  for (let i = 0; i < secs / DT; i++) {
    const prev = st.yaw;
    aero.stepFlight(st, typeof io === 'function' ? io(st) : io, DT);
    let dy = st.yaw - prev;
    if (dy > Math.PI) dy -= Math.PI * 2; else if (dy < -Math.PI) dy += Math.PI * 2;
    st.turns += dy;                                   // guinada ACUMULADA (sin el wrap)
    st.y += aero.vyOf(st) * DT;
    if (st.y < st._minY || st._minY === undefined) st._minY = st.y;
  }
  return st;
}

console.log('\narena — cabeceo comandado (E1):');
const up2 = fly({ pitch: 1 }, 2);
check('cabeceo alcanzable (grados, criterio ≥40)', up2.pitch * DEG, AR.PITCH_MAX * DEG, 0.8);
{ // tiempo a morro pleno
  let st = { yaw: 0, pitch: 0, roll: 0, spd: AR.SPD_CRUISE, vx: 0 }, t = 0;
  while (st.pitch < AR.PITCH_MAX * 0.98 && t < 3) { aero.stepFlight(st, { pitch: 1 }, DT); t += DT; }
  check('morro pleno (s)', t, 0.66, 0.06);
}
{ // picada de ataque: caer desde 300 m, tirar a los 60 m, salir sin tocar el agua
  let st = { yaw: 0, pitch: 0, roll: 0, spd: AR.SPD_CRUISE, vx: 0 }, y = 300, minY = 300;
  for (let i = 0; i < 20 / DT; i++) {
    aero.stepFlight(st, { pitch: y > 60 ? -1 : 1 }, DT);
    y += aero.vyOf(st) * DT; if (y < minY) minY = y;
    if (st.pitch >= 0 && y < 200 && i * DT > 2) break;                // salio de la picada
  }
  if (minY > 3.5) console.log(`  ✓ ${'picar desde 300 m y salir a los 60'.padEnd(42)} minimo ${minY.toFixed(1)} m`);
  else { bad++; console.log(`  ✗ la picada de ataque NO se puede sacar (minimo ${minY.toFixed(1)} m)`); }
}
{ // auto-nivelado: soltar el stick devuelve el horizonte
  let st = fly({ pitch: 1 }, 1.5);
  st = fly({ pitch: 0 }, 3, st);
  check('morro tras soltar 3 s (grados → 0)', Math.abs(st.pitch) * DEG, 0, 6);
}

console.log('\narena — el alabeo produce el viraje (E2):');
const bank3 = fly({ roll: 1 }, 3);
check('derrape en viraje sostenido (grados, antes 13.5)', Math.abs(aero.slipAngle(bank3.vx, bank3.spd)) * DEG, 0, 0.5);
check('derrape maximo COMANDADO (grados)', Math.atan2(AR.VX_MAX, AR.SPD_CRUISE) * DEG, 4.2, 0.2);
{ // vuelta completa banqueando (criterio ≤5.5) y apretando (tirar banqueado)
  let st = { yaw: 0, pitch: 0, roll: 0, spd: AR.SPD_CRUISE, vx: 0, turns: 0 }, t = 0;
  st = { ...st }; let acc = 0, prev = 0;
  while (acc < Math.PI * 2 && t < 9) {
    prev = st.yaw; aero.stepFlight(st, { roll: 1 }, DT); t += DT;
    let dy = st.yaw - prev; if (dy > Math.PI) dy -= Math.PI * 2; else if (dy < -Math.PI) dy += Math.PI * 2;
    acc += dy;
  }
  check('vuelta completa banqueando (s, criterio ≤5.5)', t, 5.4, 0.35);
  let st2 = { yaw: 0, pitch: 0, roll: 0, spd: AR.SPD_CRUISE, vx: 0 }, t2 = 0, acc2 = 0;
  while (acc2 < Math.PI * 2 && t2 < 9) {
    const p = st2.yaw; aero.stepFlight(st2, { roll: 1, pitch: 1 }, DT); t2 += DT;
    let dy = st2.yaw - p; if (dy > Math.PI) dy -= Math.PI * 2; else if (dy < -Math.PI) dy += Math.PI * 2;
    acc2 += dy;
  }
  console.log(`    apretando (banqueo + tirar): ${t2.toFixed(1)} s — el viraje de combate sale del modelo`);
  check('radio de giro banqueado (m, criterio ≤110)', aero.turnRadius(AR.SPD_CRUISE), 89, 4);
}

console.log('\narena — energia (E1: la gravedad pelea contra la VELOCIDAD):');
const clim4 = fly({ pitch: 1 }, 4);
check('costo de trepar 4 s (m/s, criterio ≥30)', AR.SPD_CRUISE - clim4.spd, 33, 4);
const dive4 = fly({ pitch: -1 }, 4, { y: 3000 });
if (dive4.spd > AR.SPD_CRUISE + 20) console.log(`  ✓ ${'picar regala velocidad'.padEnd(42)} ${dive4.spd.toFixed(0)} m/s`);
else { bad++; console.log(`  ✗ picar no acelera (${dive4.spd.toFixed(0)})`); }
const brk = fly({ brake: true }, 6);
check('freno sostenido (m/s)', brk.spd, AR.SPD_CRUISE * AR.SPD_BRAKE, 3);
{ // hundimiento blando: trepar frenado agota la energia y el morro cae SOLO
  const mush = fly({ pitch: 1, brake: true }, 8);
  if (mush.pitch < AR.PITCH_MAX * 0.7) console.log(`  ✓ ${'sin energia el morro se hunde solo'.padEnd(42)} pitch ${(mush.pitch * DEG).toFixed(0)}°`);
  else { bad++; console.log(`  ✗ el hundimiento blando no rige (pitch ${(mush.pitch * DEG).toFixed(0)}°)`); }
}

// ---------- MOMENTUM: el especial de camara lenta del pasillo (src/systems/tempo.js) ----------
// El modulo es un singleton con estado (on/meter/lastScore): se resetea como entre partidas.
console.log('\nmomentum — el especial del pasillo (tecla 4, se carga con puntos):');
{
  tempo.resetTempo();
  if (tempo.toggle() === 'empty' && tempo.scale() === 1)
    console.log(`  ✓ ${'arranca vacio: sin puntos no hay poder'.padEnd(42)}`);
  else { bad++; console.log('  ✗ se lanzo con la barra vacia'); }
  // carga por DELTA de score: TEMPO_CHARGE puntos llenan la barra y avisan 'ready' UNA vez
  let readies = 0, score = 0;
  for (let i = 0; i < 10; i++) {
    score += TEMPO_CHARGE / 8;
    if (tempo.tick(DT, true, score) === 'ready') readies++;
  }
  check(`barra llena con ${TEMPO_CHARGE} pts (meter)`, tempo.meterVal(), 1, 0.001);
  check(`aviso 'ready' UNA sola vez`, readies, 1, 0);
  if (tempo.toggle() === 'on' && tempo.scale() === TEMPO_SCALE)
    console.log(`  ✓ ${'llena se LANZA'.padEnd(42)} escala ${TEMPO_SCALE}`);
  else { bad++; console.log('  ✗ la barra llena no lanza'); }
  // el lanzamiento dura TEMPO_DUR segundos REALES y se corta solo; los puntos ganados
  // durante el poder NO recargan la barra que se esta gastando
  let t = 0;
  while (tempo.active() && t < 10) { score += 30; tempo.tick(DT, true, score); t += DT; }
  check('el lanzamiento dura (s reales)', t, TEMPO_DUR, 0.05);
  if (tempo.scale() === 1 && tempo.meterVal() === 0)
    console.log(`  ✓ ${'agotado: mundo a 1× y barra a cero'.padEnd(42)}`);
  else { bad++; console.log(`  ✗ agotado quedo raro (escala ${tempo.scale()}, barra ${tempo.meterVal()})`); }
  // sin puntos no hay recarga pasiva
  for (let i = 0; i < 300; i++) tempo.tick(DT, true, score);
  check('sin puntos NO recarga (5 s quieto)', tempo.meterVal(), 0, 0.001);
  // salir del pasillo (muerte, relevo, climax, devcam) corta lo lanzado, pero la CARGA
  // de una barra no lanzada sobrevive al relevo (es de la corrida, como el score)
  score += TEMPO_CHARGE; tempo.tick(DT, true, score);
  tempo.tick(DT, false, score);
  if (!tempo.active() && tempo.meterVal() >= 1)
    console.log(`  ✓ ${'la carga sobrevive al relevo'.padEnd(42)}`);
  else { bad++; console.log(`  ✗ el relevo borro la carga (barra ${tempo.meterVal()})`); }
  tempo.toggle(); tempo.tick(DT, false, score);
  if (!tempo.active() && tempo.meterVal() === 0)
    console.log(`  ✓ ${'morir con el poder lanzado lo pierde'.padEnd(42)}`);
  else { bad++; console.log('  ✗ el poder lanzado sobrevivio a la muerte'); }
  tempo.resetTempo();
}

console.log(bad ? `\nFEEL: ${bad} fallo(s)\n` : '\nFEEL: OK\n');
process.exit(bad ? 1 : 0);
