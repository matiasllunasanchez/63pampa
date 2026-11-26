// Proceso principal de Electron: crea la ventana y carga el juego (src/index.html).
// El juego es una app canvas autocontenida; Electron solo la envuelve en una ventana nativa.
const { app, BrowserWindow, Menu, ipcMain, screen } = require('electron');
const path = require('path');
const fs = require('fs');
const steam = require('./steam');

// EL MODO DEV (8/10): `yarn start` -> dev (sin el arranque del fichin, audio en mute, con el MODO DEV
// en el menu); `yarn start --prod` -> el juego de verdad. Empaquetado es siempre el de verdad.
const DEV = !app.isPackaged && !process.argv.includes('--prod');
// LA VERSION FULL (sin PROXIMAMENTE): `--full` al correrlo, o FIJA en el empaquetado con `rasanteFull` en el package.json
// que mete electron-builder (`npm run dist:amigos`: los builds de acceso anticipado para amigos, 23/11)
let FULL = process.argv.includes('--full');
try { if (require('../package.json').rasanteFull) FULL = true; } catch (e) { }
// TODO ABIERTO (25/11, el autor: "una version produccion pero que tenga todo abierto… estampitas, niveles, todo… pero
// que sea solo lanzable desde npm"): `npm run todo`. Es la FULL mas la campaña, el libro entero y el album lleno. Solo
// por argumento y nunca empaquetado: ningun build lo trae.
const TODO = !app.isPackaged && process.argv.includes('--todo');
if (TODO) FULL = true;

// EL ICONO DEL JUEGO (12/10, el autor: "quitar el icono de Electron"). El empaquetado lo toma de build/
// (electron-builder: icon.icns / icon.ico / icon.png); esto es el de EJECUCION — la ventana en Windows y
// Linux, y el Dock en macOS, que con `npm start` mostraba el atomo de Electron. Vive en assets/ui/ porque
// esa carpeta va en el empaquetado y build/ no. Sale de assets/source/steam/rasante2.png.
const ICONO = path.join(__dirname, '..', 'assets', 'ui', 'icono.png');

// EN QUE MONITOR SE ABRE (16/10, el autor: "como hago para que el juego se abra en el otro monitor"). Se
// abre en el MISMO MONITOR EN EL QUE SE CERRO la ultima vez (se guarda en <userData>/monitor.json). Para
// elegirlo a mano: `npm start -- --monitor=2` (1 = el principal, 2 = el siguiente, en el orden del sistema).
// Si ese monitor ya no esta conectado, el principal.
const MONITOR_JSON = () => path.join(app.getPath('userData'), 'monitor.json');
function monitorElegido() {
  const todos = screen.getAllDisplays();
  const arg = process.argv.find(a => a.startsWith('--monitor='));
  if (arg) {
    const n = parseInt(arg.split('=')[1], 10);
    const orden = [screen.getPrimaryDisplay()].concat(todos.filter(d => d.id !== screen.getPrimaryDisplay().id));
    if (n >= 1 && n <= orden.length) return orden[n - 1];
  }
  try {
    const { id } = JSON.parse(fs.readFileSync(MONITOR_JSON(), 'utf8'));
    const d = todos.find(x => x.id === id);
    if (d) return d;
  } catch (e) { /* sin guardado: el principal */ }
  return screen.getPrimaryDisplay();
}

// EN MAC, LA PANTALLA COMPLETA "SIMPLE" (25/11, el autor: "cuando hace full screen se traba, hace primero un zoom
// hacia la maquina y luego hacia pantalla total"): la nativa de macOS abre la ventana en 1280x720 y despues la lleva
// con una animacion a un Space nuevo, con el juego ya corriendo — de ahi el zoom y el bajon de cuadros. La simple
// (la de antes de Lion) tapa la pantalla al instante, sin animacion ni Space: se pone ANTES de mostrar la ventana,
// asi el jugador la ve nacer ya completa. En Windows y Linux la de siempre (no anima).
const MAC = process.platform === 'darwin';
const esCompleta = w => (MAC ? w.isSimpleFullScreen() : w.isFullScreen());

function createWindow() {
  const mon = monitorElegido().workArea;
  const win = new BrowserWindow({
    width: 1280,
    height: 720,          // 16:9, el aspecto nativo del juego
    // centrada en el monitor elegido: la pantalla completa se hace en el monitor donde esta la ventana
    x: Math.round(mon.x + (mon.width - Math.min(1280, mon.width)) / 2),
    y: Math.round(mon.y + (mon.height - Math.min(720, mon.height)) / 2),
    minWidth: 640,
    minHeight: 360,
    backgroundColor: '#0d1216',   // igual al --bg del juego: sin flash blanco al abrir
    title: 'RASANTE',
    icon: ICONO,
    show: false,          // se muestra recién cuando el contenido está listo (evita parpadeo)
    // A PANTALLA COMPLETA DE ENTRADA (autor, 4/10). Si el jugador eligio VENTANA en OPCIONES, la pagina
    // lo pide apenas carga (ver `pantalla-completa` abajo y la fila PANTALLA en src/game.js).
    fullscreen: !MAC,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      // lo lee el preload (window.RASANTE_DEV / RASANTE_FULL: `--full`, la version sin PROXIMAMENTE)
      additionalArguments: [...(DEV ? ['--rasante-dev'] : []), ...(FULL ? ['--rasante-full'] : []), ...(TODO ? ['--rasante-todo'] : [])],
      contextIsolation: true,     // seguridad estándar
      nodeIntegration: false,     // el renderer NO tiene acceso a Node
      // El juego arranca la música al cargar, sin esperar un gesto. Electron YA permite autoplay
      // por defecto, así que esto es redundante hoy: se deja explícito porque el arranque
      // inmediato pasó a ser una dependencia y un cambio de default lo rompería en silencio.
      autoplayPolicy: 'no-user-gesture-required',
    },
  });

  Menu.setApplicationMenu(null);          // sin menú nativo (es un juego)
  if (MAC) win.setSimpleFullScreen(true);
  win.loadFile(path.join(__dirname, '..', 'src', 'index.html'));

  win.once('ready-to-show', () => win.show());
  // al cerrar, se anota en que monitor estaba (ver `monitorElegido`)
  win.on('close', () => {
    try { fs.writeFileSync(MONITOR_JSON(), JSON.stringify({ id: screen.getDisplayMatching(win.getBounds()).id })); } catch (e) { }
  });

  // EL LOG DE ERRORES (9/10: el juego "se termina tildando" y no habia forma de saber por que). Los
  // errores y avisos de la pagina —incluido el del loop que sobrevive a un cuadro roto, src/game.js
  // `frame`— se escriben en <userData>/rasante.log (en macOS, ~/Library/Application Support/<app>/).
  // Se recorta solo: pasando 1 MB arranca de nuevo.
  const logPath = path.join(app.getPath('userData'), 'rasante.log');
  const anotar = linea => {
    try {
      if (fs.existsSync(logPath) && fs.statSync(logPath).size > 1e6) fs.writeFileSync(logPath, '');
      fs.appendFileSync(logPath, new Date().toISOString() + ' ' + linea + '\n');
    } catch (e) { /* sin log no se rompe nada */ }
  };
  win.webContents.on('console-message', (e, nivel, msg, linea, fuente) => {
    if (nivel >= 2) anotar((nivel >= 3 ? 'ERROR ' : 'AVISO ') + msg + (fuente ? ' (' + fuente + ':' + linea + ')' : ''));
  });
  win.webContents.on('render-process-gone', (e, d) => anotar('EL RENDERER MURIO ' + JSON.stringify(d)));
  win.webContents.on('unresponsive', () => anotar('LA PAGINA NO RESPONDE'));

  // LE AVISA A LA PAGINA cuando esta a pantalla completa, para que se saque el encabezado y el pie
  // y el juego pueda crecer un escalon entero mas (ver `ajustarEscala` en src/render/ctx.js).
  // Va por clase en el body y no por IPC: es una sola linea de presentacion, no un canal.
  const pleno = on => win.webContents.executeJavaScript(
    `document.body.classList.${on ? 'add' : 'remove'}('pantalla-completa'); window.dispatchEvent(new Event('resize'));`).catch(() => {});
  win.on('enter-full-screen', () => pleno(true));
  win.on('leave-full-screen', () => pleno(false));
  // abrir YA a pantalla completa no dispara 'enter-full-screen': la clase se pone al cargar
  win.webContents.on('did-finish-load', () => pleno(esCompleta(win)));
  // poner o sacar la completa (F11 y OPCIONES -> PANTALLA). La simple de Mac no dispara los eventos: avisa aca
  win.__completa = v => {
    if (esCompleta(win) === !!v) return;
    if (MAC) { win.setSimpleFullScreen(!!v); pleno(!!v); } else win.setFullScreen(!!v);
  };

  // F11 alterna pantalla completa. ESCAPE YA NO SACA DE PANTALLA COMPLETA (autor, 4/10): es la tecla
  // de pausa y de volver en los menus, y se la comia la ventana. Para salir: OPCIONES -> PANTALLA, o F11.
  win.webContents.on('before-input-event', (event, input) => {
    if (input.type !== 'keyDown') return;
    if (input.key === 'F11') { win.__completa(!esCompleta(win)); event.preventDefault(); }
  });
}

// LA MUSICA DE music/original, LEIDA DE LA CARPETA (17/10, el autor: POR LA PATRIA y CICLO DE MUERTE
// "deben reproducir de forma aleatoria la carpeta de music original"): lo que haya ahi es lo que suena —
// agregar o sacar un tema es soltar o borrar el archivo. La pagina lo pide al arrancar (preload.js).
// (26/11, el autor: "aleatorio con soundtrack y original"): tambien music/soundtrack, con la misma regla (sin subcarpetas:
// soundtrack/opcionales no entra)
const temasDe = carpeta => {
  const dir = path.join(__dirname, '..', 'assets', 'music', carpeta);
  try { return fs.readdirSync(dir).filter(f => /\.(mp3|m4a|ogg|opus|wav)$/i.test(f)).sort(); }
  catch (err) { return []; }
};
ipcMain.on('musica-original', e => { e.returnValue = temasDe('original'); });
ipcMain.on('musica-soundtrack', e => { e.returnValue = temasDe('soundtrack'); });

// OPCIONES -> PANTALLA: la pagina pide completa (true) o ventana (false) — ver electron/preload.js
ipcMain.on('pantalla-completa', (e, v) => {
  const w = BrowserWindow.fromWebContents(e.sender);
  if (w && w.__completa) w.__completa(!!v);
});

// STEAM (electron/steam.js): antes de arrancar, por el overlay. Si Steam lo va a relanzar, se cierra aca.
const SIGUE = steam.arrancarSteam(app);
if (!SIGUE) app.quit();
ipcMain.on('steam-logro', (e, id) => { e.returnValue = steam.logro(id); });
ipcMain.on('steam-estado', e => { e.returnValue = steam.estado(); });

if (SIGUE) app.whenReady().then(() => {
  // el Dock de macOS sin empaquetar: el .icns de build/ recien entra al empaquetar
  if (process.platform === 'darwin' && app.dock) app.dock.setIcon(ICONO);
  createWindow();
  // macOS: reabrir ventana al clickear el dock si no hay ninguna
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

// SALIR CIERRA DE VERDAD (25/11, feedback de un amigo: "cuando apretas SALIR no cierra finalmente"). Es un
// juego: cerrar la ventana cierra la app tambien en macOS (la convencion de quedar vivo en el Dock es de las apps
// de documentos), y si algo la deja colgada —el hilo de Steam, un proceso hijo— a los 2 s se la corta igual.
// La pagina pide `salir` desde el menu (src/game.js quitGame); la X de la ventana pasa por aca mismo.
function salir() {
  app.quit();
  setTimeout(() => app.exit(0), 2000).unref();
}
ipcMain.on('salir', () => salir());
app.on('window-all-closed', () => salir());
