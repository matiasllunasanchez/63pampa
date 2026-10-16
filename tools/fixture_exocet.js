// FIXTURE — EL EXOCET (autor, 16/10): la diferencia con la bomba, en una salida real (EL SHEFFIELD).
//
//   1. Lejos del blanco la tecla no lanza nada: avisa FUERA DE ALCANCE y se sigue volando.
//   2. Adentro de las 30 millas (EXOCET_ALCANCE_KM) la tecla LANZA: se entra al PULSO en el acto.
//   3. Fallado el PULSO, el misil se va para otro lado (pulso_fallo_exocet) y la mision se pierde con
//      su propia derrota (death_exocet_errado), que vuelve al libro.
//   4. Ganado, el premio corre y la mision se cumple: nunca hay re-encare ni "te pasaste".
//
// Uso: npm run exocet
const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const OUT = process.env.EXO_SHOTS || '';
const shot = async n => { if (!OUT) return; fs.mkdirSync(OUT, { recursive: true }); fs.writeFileSync(path.join(OUT, n + '.png'), (await win.webContents.capturePage()).toPNG()); };
const ROOT = path.join(__dirname, '..');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const errors = [];
let win, fails = 0;
const bad = m => { console.error('   ✗ ' + m); fails++; };
const ok = m => console.log('   ✓ ' + m);
const js = s => win.webContents.executeJavaScript(s);
const L = async () => JSON.parse(await js('String(window.__librodbg())'));
const st = async () => JSON.parse(await js('window.__estado()')).st;
const tap = async (k, ms = 170) => {
  win.webContents.sendInputEvent({ type: 'keyDown', keyCode: k });
  await sleep(60);
  win.webContents.sendInputEvent({ type: 'keyUp', keyCode: k });
  await sleep(ms);
};
async function hasta(f, k, seg = 12) {
  for (let t0 = Date.now(); Date.now() - t0 < seg * 1000;) {
    const s = await st();
    if (f(s)) return s;
    if (k) await tap(k, 120); else await sleep(150);
  }
  return null;
}
/** Desde el menu HISTORIA hasta volar EL SHEFFIELD, con el avion nivelado y sin nafta que se acabe. */
async function despegar() {
  await hasta(s => s === 'campmenu', 'Escape', 10);
  for (let i = 0; i < 12; i++) { const d = await L(); if (d.fila.id === 'libro' && d.fila.k === 0) break; await tap('Up'); }
  await tap('Return');
  if (!await hasta(s => s === 'play', 'Return', 30)) return false;
  await js("window.__cfgset('fuelOn', false); window.__vidas && window.__vidas(2)");
  return true;
}
/** El primer metro del pasillo en que el Exocet queda a tiro (busqueda binaria sobre la sonda). */
async function metroATiro() {
  let lo = 0, hi = 0;
  const p = JSON.parse(await js('window.__dist(0)')); hi = p.obj;
  for (let i = 0; i < 22; i++) {
    const m = (lo + hi) / 2;
    if (JSON.parse(await js(`window.__dist(${m})`)).atiro) hi = m; else lo = m;
  }
  return hi;
}
/** Mantiene el avion a media altura (que no se estrelle mientras se prueba). */
const nivelar = () => js('window.__czalto ? window.__czalto(12) : null');

app.whenReady().then(async () => {
  console.log('\nFIXTURE — EL EXOCET\n');
  win = new BrowserWindow({ width: 1280, height: 760, show: false, webPreferences: { backgroundThrottling: false } });
  win.webContents.on('console-message', (e, l, m) => { if (l >= 3 && !m.includes('Security Warning')) errors.push(m.slice(0, 600)); });
  await win.loadURL('file://' + path.join(ROOT, 'src', 'index.html') + '?qa');
  await sleep(2600);
  await tap('Return');
  for (let i = 0; i < 8 && JSON.parse(await js('__pausedbg()')).modo !== 'campaign'; i++) await tap('Down');
  await tap('Return');

  console.log('1. fuera de alcance:');
  if (!await despegar()) { bad('no se llego a volar EL SHEFFIELD'); return fin(); }
  await nivelar();
  let p = JSON.parse(await js('window.__dist(200)'));
  if (p.lanzable && !p.atiro) ok(`a ${p.km} km el Exocet no esta a tiro`); else bad('lejos: ' + JSON.stringify(p));
  await tap('KeyZ', 400);
  if (await st() === 'play') ok('la tecla no lanza: se sigue volando'); else bad('lejos la tecla cambio el estado a ' + await st());

  console.log('\n2. a tiro → PULSO:');
  const m = await metroATiro();
  p = JSON.parse(await js(`window.__dist(${m + 5})`));
  if (p.km <= 55.6 && p.atiro) ok(`a tiro desde ${p.km} km (30 millas = 55,6)`); else bad('a tiro: ' + JSON.stringify(p));
  await nivelar();
  // LA MIRA: mantener [F] dibuja la recta del Exocet (no la caida de la bomba)
  win.webContents.sendInputEvent({ type: 'keyDown', keyCode: 'F' }); await sleep(500); await shot('1_mira_recta');
  win.webContents.sendInputEvent({ type: 'keyUp', keyCode: 'F' }); await sleep(100);
  await tap('KeyZ', 300);
  if (await hasta(s => s === 'pulso', null, 3)) ok('lanzarlo entra al PULSO en el acto'); else bad('no entro al PULSO: ' + await st());

  console.log('\n3. PULSO fallado:');
  await sleep(600); await shot('2_pulso');
  await js('window.__qfalla()');
  await sleep(1400); await shot('3_errado');
  if (process.env.EXO_DBG) console.log('   buque:', await js('window.__buque()'));
  if (await hasta(s => s === 'dead', null, 12)) ok('el misil se va para otro lado y la mision se pierde');
  else bad('el fallo no termino en derrota: ' + await st());
  const causa = await js('window.__deathdbg()');
  if (causa === 'death_exocet_errado') ok('derrota propia: ' + causa); else bad('causa: ' + causa);
  if (await hasta(s => s === 'campmenu', 'Return', 15)) ok('la tecla vuelve al libro'); else bad('no volvio al libro: ' + await st());

  console.log('\n4. PULSO ganado:');
  if (!await despegar()) { bad('no se llego a volar EL SHEFFIELD de nuevo'); return fin(); }
  await js(`window.__dist(${m + 5})`); await nivelar();
  await tap('KeyZ', 300);
  if (!await hasta(s => s === 'pulso', null, 3)) { bad('no entro al PULSO'); return fin(); }
  await js('window.__qgana()');
  await sleep(1500); await shot('4_premio_estela'); await sleep(1000); await shot('5_premio_impacto'); await sleep(900); await shot('6_premio_fuego');
  const s = await hasta(x => x === 'results' || x === 'epilogue' || x === 'dead', null, 20);
  if (s === 'results' || s === 'epilogue') ok('el Exocet pega y la mision se cumple (' + s + ')'); else bad('ganado termino en ' + s);
  fin();
});

async function fin() {
  console.log('\nconsola:');
  if (errors.length) { errors.slice(0, 5).forEach(e => bad(e)); } else ok('sin errores');
  console.log(fails ? `\nFIXTURE EXOCET: FALLO (${fails})\n` : '\nFIXTURE EXOCET: OK\n');
  app.exit(fails ? 1 : 0);
}
