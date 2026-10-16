// FIXTURE — EL LIBRO DE VUELO (data/libro_vuelo.js): el menu HISTORIA de la demo y una salida real
// de punta a punta, por la puerta del jugador (teclas), no por sondas.
//
//   1. HISTORIA tiene dos secciones: CAMPAÑAS con la de Mateo BLOQUEADA, y el LIBRO DE VUELO con las
//      cuatro salidas en orden de fecha. CONTINUAR no aparece.
//   2. Confirmar sobre la campaña bloqueada no hace nada.
//   3. Cada salida: el contexto se lee → ELEGI TU AVION → se despega con ESA escuadrilla (tantos
//      aviones como volaron, todos PILOTO, la chapa elegida al mando), con su avion y su carga, sin
//      sello de PRUEBA (S.test apagado).
//   4. Al terminar —bien o mal— se cuenta LO QUE PASÓ y se vuelve al libro, sobre la misma fila.
//
// Uso: npm run libro          (LIBRO_SHOTS=<carpeta> guarda capturas de los menus)
const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const ROOT = path.join(__dirname, '..');
const OUT = process.env.LIBRO_SHOTS || '';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const errors = [];
let win, fails = 0, paso = '';
const bad = m => { console.error('   ✗ ' + m); fails++; };
const ok = m => console.log('   ✓ ' + m);
const js = s => win.webContents.executeJavaScript(s);
const L = async () => JSON.parse(await js('String(window.__librodbg())'));
const tap = async (k, ms = 170) => {
  win.webContents.sendInputEvent({ type: 'keyDown', keyCode: k });
  await sleep(60);
  win.webContents.sendInputEvent({ type: 'keyUp', keyCode: k });
  await sleep(ms);
};
const shot = async nombre => {
  if (!OUT) return;
  fs.mkdirSync(OUT, { recursive: true });
  const img = await win.webContents.capturePage();
  fs.writeFileSync(path.join(OUT, nombre + '.png'), img.toPNG());
};
/** Espera a que el estado sea `st` (o se cumpla `f`), tocando `k` cada tanto si se pasa. */
async function hasta(f, k, seg = 12) {
  for (let t0 = Date.now(); Date.now() - t0 < seg * 1000;) {
    const d = await L();
    if (f(d)) return d;
    if (k) await tap(k, 120); else await sleep(150);
  }
  return null;
}

app.whenReady().then(async () => {
  console.log('\nFIXTURE — EL LIBRO DE VUELO\n');
  win = new BrowserWindow({ width: 1280, height: 760, show: false, webPreferences: { backgroundThrottling: false } });
  win.webContents.on('console-message', (e, l, m) => { if (l >= 3 && !m.includes('Security Warning')) errors.push((paso ? '[' + paso + '] ' : '') + m.slice(0, 600)); });
  await win.loadURL('file://' + path.join(ROOT, 'src', 'index.html') + '?qa');
  await sleep(2600);
  await tap('Return');                                      // portada → modos
  // HISTORIA es la primera fila del menu de modos
  for (let i = 0; i < 8 && JSON.parse(await js('__pausedbg()')).modo !== 'campaign'; i++) await tap('Down');
  await tap('Return');

  console.log('1. el menu HISTORIA:');
  let d = await hasta(x => x.state === 'campmenu');
  if (!d) { bad('no se llego al menu HISTORIA'); return fin(); }
  const esperado = ['campSecCampanas', 'c1-', 'campSecLibro', 'libro0', 'libro1', 'libro2', 'libro3', 'libro4', 'back'];
  if (JSON.stringify(d.filas) === JSON.stringify(esperado)) ok('CAMPAÑAS (Mateo bloqueada) + LIBRO DE VUELO con cinco salidas, sin CONTINUAR');
  else bad('filas: ' + JSON.stringify(d.filas));
  if (d.fila.id === 'libro' && d.fila.k === 0) ok('el cursor arranca en la primera salida, no en la campaña bloqueada');
  else bad('el cursor arranca en ' + JSON.stringify(d.fila));
  await shot('1_historia');
  await tap('Up');                                          // a la campaña bloqueada
  d = await L();
  await tap('Return');
  const d2 = await L();
  if (d.fila.id === 'c1' && d2.state === 'campmenu') ok('confirmar la campaña bloqueada no hace nada');
  else bad(`la campaña bloqueada: fila ${JSON.stringify(d.fila)} → estado ${d2.state}`);
  await tap('Down');

  for (let k = 0; k < 5; k++) {
    console.log(`\n${k + 2}. salida ${k + 1}:`);
    paso = 'salida ' + (k + 1);
    d = await hasta(x => x.state === 'campmenu' && x.fila.id === 'libro' && x.fila.k === k, 'Down');
    if (!d) { bad('no se pudo marcar la salida ' + k); continue; }
    await tap('Return');
    d = await hasta(x => x.state === 'story');
    if (!d || !d.libro || d.libro.k !== k) { bad('no abrio el contexto: ' + JSON.stringify(d)); continue; }
    ok(`contexto: ${d.escena} (${d.mision}, ${d.modo}, test=${d.test})`);
    if (k === 0) await shot('2_contexto');
    // DOS PUERTAS (autor, 13/10): ELEGI TU AVION solo aparece si la salida trae mas de un par avion +
    // carga distinto; si son todos iguales, el contexto despega derecho con el primero.
    d = await hasta(x => x.state === 'libroavion' || x.state === 'takeoff' || x.state === 'play', 'Return', 20);
    if (!d) { bad('el contexto no termino ni en ELEGI TU AVION ni en el despegue'); continue; }
    if (d.state === 'libroavion') {
      ok('ELEGI TU AVION');
      // se elige el SEGUNDO avion: asi se ve que la elegida va al mando y no la primera
      await tap('Down');
      if (k === 1) await shot('3_avion');
      await tap('Return');
      d = await hasta(x => x.state === 'takeoff' || x.state === 'play', null, 8);
      if (!d) { bad('no despego'); continue; }
    } else ok('aviones iguales: despega derecho, sin elegir');
    const m = await js(`String(JSON.stringify((() => { const r = __librodbg(); return r; })()))`);
    ok(`despega: ${d.plane} · ${d.carga} · escuadron ${d.squad} · climax ${d.climax} · chancha ${d.chancha} · test=${d.test}`);
    if (d.test) bad('la salida real corre con el sello de PRUEBA');
    if (!d.pilotos.every(p => p === 'PILOTO')) bad('pilotos: ' + d.pilotos.join(','));
    else ok('pilotos: ' + d.pilotos.length + ' × PILOTO · chapas: ' + d.chapas.join(', '));
    if (k === 2) { await sleep(2500); await shot('4_vuelo'); for (let i = 0; i < 40; i++) { win.webContents.sendInputEvent({ type: 'keyDown', keyCode: 'w' }); await sleep(100); } await shot('5_hud'); }
    // FIN: por la misma puerta del juego (el recuento → lo que pasó)
    await js('window.__finMision()');
    d = await hasta(x => x.state === 'epilogue');
    if (!d) { bad('al terminar no se conto lo que pasó'); continue; }
    ok('lo que pasó: ' + d.escena);
    d = await hasta(x => x.state === 'campmenu', 'Return', 20);
    if (d && d.fila.id === 'libro' && d.fila.k === k && d.libro === null) ok('vuelve al libro, sobre la misma salida');
    else bad('no volvio al libro: ' + JSON.stringify(d && { st: d.state, fila: d.fila, libro: d.libro }));
  }

  // UN DERRIBO NO SE REINTENTA NI CUENTA LO QUE PASÓ: vuelve al libro
  console.log('\n7. derribado:');
  paso = 'derribado';
  d = await hasta(x => x.state === 'campmenu' && x.fila.id === 'libro' && x.fila.k === 4, 'Up');
  await tap('Return');
  d = await hasta(x => x.state === 'libroavion' || x.state === 'takeoff' || x.state === 'play', 'Return', 20);
  if (d && d.state === 'libroavion') await tap('Return');
  await hasta(x => x.state === 'play', null, 12);
  await js('window.__sealives && window.__sealives(1)');
  await js('window.__crash ? window.__crash() : null');
  d = await L();
  if (d.state === 'play') {
    // sin sonda de choque: el avion sin gas se cae solo al mar
    await hasta(x => x.state === 'dead', null, 25);
  }
  // (16/10, el autor: LO QUE PASÓ es solo si ganaste; perdida, la pantalla de derribo —con la explicacion
  // y la nota historica— y la tecla vuelve al libro, sobre la misma salida)
  d = await hasta(x => x.state === 'dead' || x.state === 'campmenu', null, 25);
  d = await hasta(x => x.state === 'campmenu', 'Return', 20);
  if (d && d.fila.id === 'libro' && d.fila.k === 4) ok('derribado → vuelve al libro, sin lo que pasó');
  else bad('el derribo no volvio al libro: ' + (await L()).state);

  fin();
});

async function fin() {
  const pilas = await js('JSON.stringify((window.__errores || []).slice(0, 1))').catch(() => '[]');
  if (pilas !== '[]') console.log('   pila del primer error:\n' + JSON.parse(pilas)[0].pila);
  console.log('\nconsola:');
  if (errors.length) errors.slice(0, 5).forEach(e => bad(e)); else ok('sin errores');
  console.log(fails ? `\nFIXTURE LIBRO: FALLO (${fails})\n` : '\nFIXTURE LIBRO: OK\n');
  app.exit(fails ? 1 : 0);
}
