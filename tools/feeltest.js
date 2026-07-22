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

console.log(bad ? `\nFEEL: ${bad} fallo(s)\n` : '\nFEEL: OK\n');
process.exit(bad ? 1 : 0);
