// STEAM (24/11, el autor: "ir preparando todo para subir el build a Steam"). Habla con el cliente de
// Steam por steamworks.js. Solo se prende en el build de Steam (`npm run steam:build` mete el App ID en
// el package.json empaquetado como `rasanteSteam`) o probando a mano con `--steam` (toma el App ID de
// steam/config.json). En cualquier otro caso —npm start, full-demo, los builds de amigos— no hace NADA.
// Si Steam no esta abierto o algo falla, el juego sigue igual: Steam nunca puede trabar el arranque.
const path = require('path');
const fs = require('fs');

function appIdPedido(app) {
  try { const id = require('../package.json').rasanteSteam; if (id) return Number(id); } catch (e) { }
  if (!app.isPackaged && process.argv.includes('--steam')) {
    try {
      const cfg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'steam', 'config.json'), 'utf8'));
      return Number(cfg.appId) || 480;   // 480 = Spacewar, la app de prueba de Valve, mientras no haya App ID
    } catch (e) { return 480; }
  }
  return 0;
}

let cliente = null;

// Va ANTES de app.whenReady (el overlay necesita prender sus banderas de Chromium antes de arrancar).
// Devuelve false si hay que cerrar: el juego se abrio por fuera de Steam y Steam lo va a relanzar.
function arrancarSteam(app) {
  const appId = appIdPedido(app);
  if (!appId) return true;
  let sw;
  try { sw = require('steamworks.js'); } catch (e) { console.warn('steam: no esta steamworks.js', e.message); return true; }
  // abierto con doble click en vez de desde Steam: Steam lo relanza como corresponde (solo empaquetado)
  try { if (app.isPackaged && sw.restartAppIfNecessary(appId)) return false; } catch (e) { }
  // SIN OVERLAY (24/11, el autor: "veo unos pequeños bajones de FPS" en el Playtest; apagando el
  // overlay de Steam mejoro). Steam lo mete en el juego con DYLD_INSERT_LIBRARIES (Mac); sacandolo
  // del entorno ACA, antes de que Electron abra sus procesos de GPU y de la pagina, no llega a
  // ellos. En Windows tampoco se prende (electronEnableSteamOverlay fuerza la GPU dentro del proceso
  // y repinta a 60 por segundo: peor para los FPS). Shift+Tab no abre nada; no hace falta.
  if (process.platform === 'darwin') delete process.env.DYLD_INSERT_LIBRARIES;
  try {
    cliente = sw.init(appId);
  } catch (e) {
    console.warn('steam: no se pudo iniciar (Steam cerrado?)', e.message);
    cliente = null;
  }
  return true;
}

// LOS LOGROS: el id es el "API name" que se carga en Steamworks. Sin Steam no hace nada.
function logro(id) {
  if (!cliente || !id) return false;
  try { return cliente.achievement.activate(String(id)); } catch (e) { return false; }
}

const estado = () => cliente ? { activo: true, nombre: cliente.localplayer.getName() } : { activo: false };

module.exports = { arrancarSteam, logro, estado };
