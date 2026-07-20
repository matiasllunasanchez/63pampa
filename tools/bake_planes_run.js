// Runner headless del horneado de aviones:
//   npx electron tools/bake_planes_run.js
// Abre tools/bake_planes.html en una ventana oculta, ejecuta __bake() y escribe los
// sprite sheets en assets/img/plane_<key>_sheet.png (9 frames de 56x32, alabeo -60..+60).
const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

const ROOT = path.join(__dirname, '..');

app.whenReady().then(async () => {
  const win = new BrowserWindow({ width: 800, height: 600, show: false });
  await win.loadFile(path.join(__dirname, 'bake_planes.html'));
  try {
    const sheets = await win.webContents.executeJavaScript('__bake()');
    for (const key in sheets) {
      const b64 = sheets[key].split('base64,')[1];
      const out = path.join(ROOT, 'assets', 'img', `plane_${key}_sheet.png`);
      fs.writeFileSync(out, Buffer.from(b64, 'base64'));
      console.log(`OK plane_${key}_sheet.png (${(b64.length * 3 / 4 / 1024).toFixed(1)} KB)`);
    }
    console.log('Horneado completo.');
  } catch (e) {
    console.error('ERROR al hornear:', e.message);
    process.exitCode = 1;
  }
  app.quit();
});
