// Runner headless del horneado de MUNICION:
//   npx electron tools/bake_ammo_run.js   (o `npm run ammo`)
// Abre tools/bake_ammo.html en una ventana oculta, ejecuta __bake() y escribe la hoja en
// assets/ammo/municion.png (6 vistas x 2 municiones, frames de 16x16).
const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const ROOT = path.join(__dirname, '..');

app.whenReady().then(async () => {
  const win = new BrowserWindow({ width: 800, height: 600, show: false });
  await win.loadFile(path.join(__dirname, 'bake_ammo.html'));
  try {
    const sheets = await win.webContents.executeJavaScript('__bake()');
    const dir = path.join(ROOT, 'assets', 'ammo');
    fs.mkdirSync(dir, { recursive: true });
    for (const key in sheets) {
      const b64 = sheets[key].split('base64,')[1];
      fs.writeFileSync(path.join(dir, key + '.png'), Buffer.from(b64, 'base64'));
      console.log(`OK ammo/${key}.png (${(b64.length * 3 / 4 / 1024).toFixed(1)} KB)`);
    }
    console.log('Horneado completo.');
  } catch (e) {
    console.error('FALLO el horneado:', e && e.message);
    app.exit(1); return;
  }
  app.quit();
});
