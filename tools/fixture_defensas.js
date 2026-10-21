// FIXTURE — LAS DEFENSAS DEL BUQUE (docs/sistemas/PLAN_DEFENSAS_BUQUE.md, F6): el cableado punta a punta,
// en el juego de verdad. Las METRICAS (cuanto cuesta, cuanto rinde cañonear) no se miden aca: se miden
// en Node contra el integrador real (tools/balance_defensas.js). Esto solo afirma que las piezas estan
// conectadas.
//
//   1. el buque trae su armamento real (la Ardent: 4,5", dos 20 mm, director y lanzador Sea Cat)
//   2. el cañon, sostenido sobre el lanzador, lo pasa por DAÑADO y lo deja FUERA — y la radio lo canta
//   3. con el lanzador FUERA, la Ardent ya no tira Sea Cat
//   4. errar la pasada: el re-encare encuentra el lanzador TODAVIA FUERA (los sistemas persisten)
//   5. el 4,5" a cañonazos no pasa de DAÑADO (D2: FUERA solo con bomba)
//   6. las salidas del libro arrancan como la historia: r2 con la Brilliant de escolta, r3 con el Sea
//      Cat ya fuera, r4 (la Plymouth) con el cañon doble Mk 6
//   7. CICLO DE MUERTE juega LA SUELTA (no el Pulso) con el armamento real del blanco — por la puerta
//      del jugador: menu → JUEGO RAPIDO → CICLO (autor, 21/10)
//
// Uso: npm run defensas
const { app, BrowserWindow } = require('electron');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const errors = [];
let win, fails = 0;
const bad = m => { console.error('   ✗ ' + m); fails++; };
const ok = m => console.log('   ✓ ' + m);
const js = s => win.webContents.executeJavaScript(s);
const J = async s => JSON.parse(await js(s));
const key = (k, d) => win.webContents.sendInputEvent({ type: d ? 'keyDown' : 'keyUp', keyCode: k });
process.on('unhandledRejection', e => { console.error('REJECTION: ' + (e && e.message)); app.exit(1); });

/** Abre la mision `id` en el aire, con el buque a `z` de la camara y `vidas` aviones. */
async function abrir(id, z, vidas = 5) {
  await win.loadURL('file://' + path.join(ROOT, 'src', 'index.html') + '?no3d');
  await sleep(2300);
  const m = await J(`__mision('${id}', { aire: true })`);
  for (let i = 0; i < 40; i++) { if ((await J('__wjump()')).state === 'play') break; await sleep(250); }
  if (z !== undefined) await js(`__dist(${m.obj} + 14 - ${z})`);
  await js(`__vidas(${vidas})`);
  await sleep(150);   // el buque toma la distancia nueva en el cuadro siguiente (systems/blanco.js step)
  return m;
}
const pieza = (s, n) => s.sis.find(x => x.n === n);

/** Cañonea la pieza `i` (el avion enfrente, gatillo apretado) hasta `hasta(estado)` o `seg` segundos.
 *  Devuelve los estados que fue pasando. */
async function cañonear(i, hasta, seg = 4) {
  const vistos = [];
  key('X', true);
  for (let t = 0; t < seg * 1000; t += 120) {
    await sleep(120);
    const s = await J(`__sis(${i})`);
    const e = s.sis[i].e;
    if (vistos[vistos.length - 1] !== e) vistos.push(e);
    if (hasta(e)) break;
  }
  key('X', false);
  return vistos;
}

app.whenReady().then(async () => {
  console.log('\nFIXTURE — LAS DEFENSAS DEL BUQUE\n');
  win = new BrowserWindow({ width: 1280, height: 760, show: false, webPreferences: { backgroundThrottling: false } });
  win.webContents.on('console-message', (e, l, m) => { if (l >= 3 && !m.includes('Security Warning')) errors.push(m.slice(0, 400)); });

  console.log('1. el armamento real:');
  await abrir('t16', 560);
  let s = await J('__sis()');
  const nombres = s.sis.map(x => x.n).join(',');
  if (nombres === '4.5 MK8,20 MM,20 MM,DIRECTOR,SEA CAT,CUBIERTA') ok('la Ardent trae 4,5" Mk 8, dos 20 mm, director y lanzador Sea Cat');
  else bad('armamento de la Ardent: ' + nombres);
  if (s.atiro) ok('a 560 el buque esta al alcance del cañon'); else bad('a 560 el buque no esta a tiro');

  console.log('2. cañonear el lanzador:');
  const v = await cañonear(4, e => e === 'fuera');
  if (v.includes('danado') && v[v.length - 1] === 'fuera') ok('el lanzador Sea Cat pasa por DAÑADO y queda FUERA (' + v.join(' → ') + ')');
  else bad('estados del lanzador: ' + v.join(' → '));
  await sleep(300);
  const r = await J('__radiodbg()');
  if (/SEA CAT FUERA/.test(r.txt)) ok('la radio lo canta: ' + r.personaje + ' «' + r.txt + '»'); else bad('la radio dice: ' + r.txt);

  console.log('3. sin lanzador no hay Sea Cat:');
  await abrir('t16', 760, 9);
  await js('__sisset(4, "fuera")');
  const ids = new Set();
  for (let t = 0; t < 3500; t += 100) { await sleep(100); await js('__nivel(9)'); for (const m of (await J('__seawolf()')).misiles) ids.add(m.id); }
  if (ids.size === 0) ok('con el lanzador FUERA, en 3,5 s dentro de la zona no salio ningun Sea Cat'); else bad(ids.size + ' Sea Cat con el lanzador fuera');

  console.log('4. errar y volver: los sistemas persisten:');
  await abrir('t16', 560);
  await cañonear(4, e => e === 'fuera');
  await js('__nivel(30)');                                   // por arriba: no se suelta, se pasa de largo
  let reencara = false;
  for (let t = 0; t < 16000; t += 200) {
    await sleep(200);
    s = await J('__sis()');
    if (s.z > 1500) { reencara = true; break; }
  }
  if (!reencara) bad('no hubo re-encare tras pasar de largo');
  else if (pieza(s, 'SEA CAT').e === 'fuera') ok('el re-encare (z ' + s.z + ') encuentra el lanzador todavia FUERA');
  else bad('tras el re-encare el lanzador esta ' + pieza(s, 'SEA CAT').e);

  console.log('5. el 4,5" no sale a cañonazos (D2):');
  await abrir('t16', 640, 9);
  const v45 = await cañonear(0, () => false, 4.5);
  if (v45[v45.length - 1] === 'danado' && !v45.includes('fuera')) ok('el 4,5" a cañonazos queda DAÑADO y no pasa de ahi (' + v45.join(' → ') + ')');
  else bad('estados del 4,5": ' + v45.join(' → '));

  console.log('6. las salidas del libro, como la historia:');
  await abrir('r2');
  s = await J('__sis()');
  if (s.escolta === 'HMS BRILLIANT') ok('r2 GLASGOW: la Brilliant de escolta'); else bad('r2 escolta: ' + s.escolta);
  if (pieza(s, 'SEA DART') && pieza(s, '909')) ok('r2 GLASGOW: Sea Dart y su 909'); else bad('r2 sin Sea Dart/909');
  await abrir('r3');
  s = await J('__sis()');
  if (pieza(s, 'SEA CAT').e === 'fuera') ok('r3 ARDENT: llega con el Sea Cat FUERA'); else bad('r3 Sea Cat: ' + pieza(s, 'SEA CAT').e);
  await abrir('r4');
  s = await J('__sis()');
  if (pieza(s, '4.5 MK6')) ok('r4 PLYMOUTH: el cañon doble Mk 6'); else bad('r4 armamento: ' + s.sis.map(x => x.n).join(','));

  console.log('7. CICLO DE MUERTE juega LA SUELTA:');
  await win.loadURL('file://' + path.join(ROOT, 'src', 'index.html') + '?no3d');
  await sleep(2600);
  const tap = async (k, ms = 200) => { key(k, true); await sleep(60); key(k, false); await sleep(ms); };
  await tap('Return');
  for (let i = 0; i < 10 && (await J('__pausedbg()')).modo !== 'quick'; i++) await tap('Down');
  await tap('Return', 500);
  for (let i = 0; i < 10 && (await J('__pausedbg()')).quick !== 'cycle'; i++) await tap('Down');
  await tap('Return', 600);
  for (let i = 0; i < 30; i++) { const e = await J('__wjump()'); if (e.state === 'play' || e.state === 'takeoff') break; await tap('Return', 400); }
  for (let i = 0; i < 60; i++) { if ((await J('__wjump()')).state === 'play') break; await sleep(300); }
  const w = await J('__wjump()');
  await js(`__dist(${w.obj} + 14 - 560)`); await sleep(300);
  const su = await J('__suelta()');
  if (su.rack && su.rack.centroN === 1 && su.z > 0) ok('el blanco del ciclo es LA SUELTA (bomba ' + su.rack.bomba + ' al centro, buque a ' + su.z + ')');
  else bad('el ciclo no armo la suelta: ' + JSON.stringify(su).slice(0, 160));
  s = await J('__sis()');
  if (s.sis.length && s.atiro) ok('con su armamento real: ' + s.sis.map(x => x.n).join(', '));
  else bad('el blanco del ciclo sin sistemas');

  console.log('\nconsola:');
  if (errors.length) { for (const e of errors.slice(0, 5)) bad('error de consola: ' + e); } else ok('sin errores');
  console.log(fails ? `\nFIXTURE DEFENSAS: ${fails} FALLA(S)` : '\nFIXTURE DEFENSAS: OK');
  app.exit(fails ? 1 : 0);
});
