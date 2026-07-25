// Proceso principal de Electron: crea la ventana y carga el juego (src/index.html).
// El juego es una app canvas autocontenida; Electron solo la envuelve en una ventana nativa.
const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,          // 16:9, el aspecto nativo del juego
    minWidth: 640,
    minHeight: 360,
    backgroundColor: '#0d1216',   // igual al --bg del juego: sin flash blanco al abrir
    title: 'RASANTE',
    show: false,          // se muestra recién cuando el contenido está listo (evita parpadeo)
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
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

  // F11 alterna pantalla completa; Escape sale de fullscreen
  win.webContents.on('before-input-event', (event, input) => {
    if (input.type !== 'keyDown') return;
    if (input.key === 'F11') { win.setFullScreen(!win.isFullScreen()); event.preventDefault(); }
    else if (input.key === 'Escape' && win.isFullScreen()) { win.setFullScreen(false); event.preventDefault(); }
  });
}

app.whenReady().then(() => {
  createWindow();
  // macOS: reabrir ventana al clickear el dock si no hay ninguna
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

// salir al cerrar todas las ventanas (menos en macOS, convención de la plataforma)
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
