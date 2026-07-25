// Runner headless del horneado de enemigos:
//   npx electron tools/bake_enemies_run.js
// Abre tools/bake_enemies.html en una ventana oculta, ejecuta __bake() y escribe los
// sprite sheets en assets/world/enemies/<nombre>.png
const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'assets', 'world', 'enemies');

app.whenReady().then(async () => {
  const win = new BrowserWindow({ width: 800, height: 600, show: false });
  await win.loadFile(path.join(__dirname, 'bake_enemies.html'));
  try {
    const sheets = await win.webContents.executeJavaScript('__bake()');
    fs.mkdirSync(OUT, { recursive: true });
    for (const key in sheets) {
      const b64 = sheets[key].split('base64,')[1];
      fs.writeFileSync(path.join(OUT, key + '.png'), Buffer.from(b64, 'base64'));
      console.log(`OK enemies/${key}.png (${(b64.length * 3 / 4 / 1024).toFixed(1)} KB)`);
    }
    console.log('Horneado completo.');
  } catch (e) {
    console.error('ERROR al hornear:', e.message);
    process.exitCode = 1;
  }
  app.quit();
});
