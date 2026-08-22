// Runner headless del horneado de PARTES DEL DESPIECE:
//   npx electron tools/bake_partes_run.js
// Abre tools/bake_partes.html en una ventana oculta, ejecuta __bake() y escribe la hoja en
// assets/world/explosions/partes.png (una fila por pieza, una columna por giro).
//
// El orden de las filas lo IMPRIME al terminar: tiene que coincidir con `PARTES` de
// src/render/partes.js. Si alguien agrega una pieza en el medio, el escombro pasa a ser otro y
// esta salida es lo unico que lo delata antes de verlo en el juego.
const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

const ROOT = path.join(__dirname, '..');
const DEST = path.join(ROOT, 'assets', 'world', 'explosions', 'partes.png');

app.whenReady().then(async () => {
  const win = new BrowserWindow({ width: 800, height: 600, show: false });
  await win.loadFile(path.join(__dirname, 'bake_partes.html'));
  try {
    const r = await win.webContents.executeJavaScript('__bake()');
    const b64 = r.sheet.split('base64,')[1];
    fs.mkdirSync(path.dirname(DEST), { recursive: true });
    fs.writeFileSync(DEST, Buffer.from(b64, 'base64'));
    console.log(`OK partes.png (${(b64.length * 3 / 4 / 1024).toFixed(1)} KB) — ` +
      `${r.piezas.length} piezas x ${r.yaws} giros, frames de ${r.fw}x${r.fh}`);
    console.log('filas, en orden: ' + r.piezas.join(' · '));
    console.log('OJO: este orden tiene que coincidir con PARTES de src/render/partes.js');
  } catch (e) {
    console.error('ERROR al hornear:', e.message);
    process.exitCode = 1;
  }
  app.quit();
});
