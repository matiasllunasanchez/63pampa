// SMOKE TEST — la red de seguridad del refactor.
//   npm run smoke
//
// Abre el juego en Electron y FALLA (exit 1) si:
//   1. hay errores de consola o excepciones sin atrapar
//   2. el canvas queda en blanco (un solo color: no se dibujo nada)
//   3. el canvas NO cambia entre cuadros (el loop de render esta muerto)
//   4. no se puede entrar a jugar desde los menus
//
// Por que existe: al partir game.js en modulos, lo que se rompe no siempre tira un error —
// muchas veces el juego "arranca" pero deja de dibujar. Un test que solo mire la consola no
// lo detecta. Por eso se comparan pixeles del canvas.
//
// Nota: backgroundThrottling:false es OBLIGATORIO. Con la ventana oculta, Chromium estrangula
// requestAnimationFrame y el juego corre a una fraccion de la velocidad real; sin esto el test
// da falsos negativos por timeout.
const { app, BrowserWindow } = require('electron');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const sleep = ms => new Promise(r => setTimeout(r, ms));

const errors = [];
let failed = false;
const fail = (msg) => { failed = true; console.error('  ✗ ' + msg); };
const pass = (msg) => console.log('  ✓ ' + msg);

// Muestrea el canvas: devuelve un hash del contenido y cuantos colores distintos hay.
// El hash sirve para detectar movimiento; la cantidad de colores, para detectar pantalla plana.
const PROBE = `(() => {
  const c = document.getElementById('g');
  if (!c) return { error: 'no existe el canvas #g' };
  const x = c.getContext('2d');
  const d = x.getImageData(0, 0, c.width, c.height).data;
  let h = 0; const colors = new Set();
  for (let i = 0; i < d.length; i += 4 * 53) {          // muestreo disperso: rapido y suficiente
    const k = (d[i] << 16) | (d[i + 1] << 8) | d[i + 2];
    colors.add(k);
    h = (Math.imul(h, 31) + k) | 0;
  }
  return { hash: h, colors: colors.size };
})()`;

async function probe(win) { return win.webContents.executeJavaScript(PROBE); }

async function tap(win, keyCode) {
  win.webContents.sendInputEvent({ type: 'keyDown', keyCode });
  await sleep(60);
  win.webContents.sendInputEvent({ type: 'keyUp', keyCode });
  await sleep(240);
}

// Comprueba que el canvas tenga contenido real y que ADEMAS se mueva.
async function checkAlive(win, label) {
  const a = await probe(win);
  if (a.error) { fail(label + ': ' + a.error); return; }
  await sleep(700);
  const b = await probe(win);

  if (a.colors < 8) fail(`${label}: canvas casi plano (${a.colors} colores) — parece que no se dibuja`);
  else pass(`${label}: canvas con contenido (${a.colors} colores)`);

  if (a.hash === b.hash) fail(`${label}: el canvas NO cambia entre cuadros — el loop de render esta frenado`);
  else pass(`${label}: el render esta vivo (el contenido cambia)`);
}

app.whenReady().then(async () => {
  console.log('\nSMOKE TEST — RASANTE\n');
  const win = new BrowserWindow({
    width: 1000, height: 640, show: false,
    webPreferences: { backgroundThrottling: false },
  });

  win.webContents.on('console-message', (e, level, message) => {
    // level 3 = error. Se ignora el aviso de CSP de Electron, que es esperable en file://
    if (level >= 3 && !message.includes('Electron Security Warning')) errors.push(message.slice(0, 200));
  });
  win.webContents.on('render-process-gone', (e, d) => { errors.push('EL RENDERER MURIO: ' + JSON.stringify(d)); });
  win.webContents.on('preload-error', (e, f, err) => { errors.push('preload: ' + err.message); });

  // SMOKE_SRC permite apuntar a otra copia (se usa para verificar que el test SI detecta roturas)
  await win.loadFile(process.env.SMOKE_SRC || path.join(ROOT, 'src', 'index.html'));
  await sleep(2500);

  console.log('arranque:');
  await checkAlive(win, 'menu inicial');

  // entrar a jugar: CAMPAÑA y saltear el guion a los teclazos
  console.log('\nentrando a jugar:');
  for (let i = 0; i < 20; i++) await tap(win, 'Return');
  await sleep(1500);
  // gas sostenido para no caer al agua mientras se mide
  const hold = setInterval(() => win.webContents.sendInputEvent({ type: 'keyDown', keyCode: 'Up' }), 40);
  await sleep(2500);
  await checkAlive(win, 'en vuelo');
  clearInterval(hold);

  // PANTALLA DE FIN: al soltar el gas el avion cae y se estrella. Cubre el camino de
  // panel()/T()/L() que comparten derribado, recuento, victoria y briefing — que si no,
  // no los tocaria ninguna prueba.
  console.log('\npantalla de fin:');
  await sleep(6000);
  await checkAlive(win, 'derribado');

  // AUDIO: isCurrentlyAudible() mira la salida real del renderer. Es la unica forma de saber que
  // el juego suena — los chequeos de canvas y de consola son ciegos a un subsistema de audio roto.
  console.log('\naudio:');
  if (win.webContents.isCurrentlyAudible()) pass('el juego esta emitiendo sonido');
  else fail('silencio total — musica y efectos no estan sonando');

  console.log('\nconsola:');
  if (errors.length) {
    fail(`${errors.length} error(es) de consola:`);
    for (const e of errors.slice(0, 8)) console.error('      ' + e);
  } else pass('sin errores');

  console.log(failed ? '\nSMOKE: FALLO\n' : '\nSMOKE: OK\n');
  app.exit(failed ? 1 : 0);
}).catch(e => { console.error('smoke reventó:', e); app.exit(1); });
