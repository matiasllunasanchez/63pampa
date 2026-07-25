// Runner headless del horneado de aviones:
//   npx electron tools/bake_planes_run.js
// Abre tools/bake_planes.html en una ventana oculta, ejecuta __bake() y escribe los
// sprite sheets en assets/planes/<slug>/sheet.png (9 frames, alabeo -60..+60).
const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

// carpeta de cada avion en assets/planes/ (misma tabla que data/planes.js y build_web.py)
const SLUG = { sky: 'a4-skyhawk', dagger: 'iai-dagger', supere: 'super-etendard', a4q: 'a4q', pampa: 'pampa-63', mirage: 'mirage-iiiea' };
const ROOT = path.join(__dirname, '..');

app.whenReady().then(async () => {
  const win = new BrowserWindow({ width: 800, height: 600, show: false });
  await win.loadFile(path.join(__dirname, 'bake_planes.html'));
  try {
    const sheets = await win.webContents.executeJavaScript('__bake()');
    for (const key in sheets) {
      const b64 = sheets[key].split('base64,')[1];
      const out = path.join(ROOT, 'assets', 'planes', SLUG[key], 'sheet.png');
      fs.writeFileSync(out, Buffer.from(b64, 'base64'));
      console.log(`OK ${SLUG[key]}/sheet.png (${(b64.length * 3 / 4 / 1024).toFixed(1)} KB)`);
    }
    console.log('Horneado completo.');
  } catch (e) {
    console.error('ERROR al hornear:', e.message);
    process.exitCode = 1;
  }
  app.quit();
});
