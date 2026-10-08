// Proceso principal de Electron: crea la ventana y carga el juego (src/index.html).
// El juego es una app canvas autocontenida; Electron solo la envuelve en una ventana nativa.
const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');

// EL MODO DEV (8/10): `yarn start` -> dev (sin el arranque del fichin, audio en mute, con el MODO DEV
// en el menu); `yarn start --prod` -> el juego de verdad. Empaquetado es siempre el de verdad.
const DEV = !app.isPackaged && !process.argv.includes('--prod');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,          // 16:9, el aspecto nativo del juego
    minWidth: 640,
    minHeight: 360,
    backgroundColor: '#0d1216',   // igual al --bg del juego: sin flash blanco al abrir
    title: 'RASANTE',
    show: false,          // se muestra recién cuando el contenido está listo (evita parpadeo)
    // A PANTALLA COMPLETA DE ENTRADA (autor, 4/10). Si el jugador eligio VENTANA en OPCIONES, la pagina
    // lo pide apenas carga (ver `pantalla-completa` abajo y la fila PANTALLA en src/game.js).
    fullscreen: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      additionalArguments: DEV ? ['--rasante-dev'] : [],   // lo lee el preload (window.RASANTE_DEV)
      contextIsolation: true,     // seguridad estándar
      nodeIntegration: false,     // el renderer NO tiene acceso a Node
      // El juego arranca la música al cargar, sin esperar un gesto. Electron YA permite autoplay
      // por defecto, así que esto es redundante hoy: se deja explícito porque el arranque
      // inmediato pasó a ser una dependencia y un cambio de default lo rompería en silencio.
      autoplayPolicy: 'no-user-gesture-required',
    },
  });

  Menu.setApplicationMenu(null);          // sin menú nativo (es un juego)
  win.loadFile(path.join(__dirname, '..', 'src', 'index.html'));

  win.once('ready-to-show', () => win.show());

  // LE AVISA A LA PAGINA cuando esta a pantalla completa, para que se saque el encabezado y el pie
  // y el juego pueda crecer un escalon entero mas (ver `ajustarEscala` en src/render/ctx.js).
  // Va por clase en el body y no por IPC: es una sola linea de presentacion, no un canal.
  const pleno = on => win.webContents.executeJavaScript(
    `document.body.classList.${on ? 'add' : 'remove'}('pantalla-completa'); window.dispatchEvent(new Event('resize'));`).catch(() => {});
  win.on('enter-full-screen', () => pleno(true));
  win.on('leave-full-screen', () => pleno(false));
  // abrir YA a pantalla completa no dispara 'enter-full-screen': la clase se pone al cargar
  win.webContents.on('did-finish-load', () => pleno(win.isFullScreen()));

  // F11 alterna pantalla completa. ESCAPE YA NO SACA DE PANTALLA COMPLETA (autor, 4/10): es la tecla
  // de pausa y de volver en los menus, y se la comia la ventana. Para salir: OPCIONES -> PANTALLA, o F11.
  win.webContents.on('before-input-event', (event, input) => {
    if (input.type !== 'keyDown') return;
    if (input.key === 'F11') { win.setFullScreen(!win.isFullScreen()); event.preventDefault(); }
  });
}

// OPCIONES -> PANTALLA: la pagina pide completa (true) o ventana (false) — ver electron/preload.js
ipcMain.on('pantalla-completa', (e, v) => {
  const w = BrowserWindow.fromWebContents(e.sender);
  if (w && w.isFullScreen() !== !!v) w.setFullScreen(!!v);
});

app.whenReady().then(() => {
  createWindow();
  // macOS: reabrir ventana al clickear el dock si no hay ninguna
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

// salir al cerrar todas las ventanas (menos en macOS, convención de la plataforma)
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
