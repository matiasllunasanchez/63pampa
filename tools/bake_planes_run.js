// Runner headless del horneado de aviones:
//   npx electron tools/bake_planes_run.js
// Abre tools/bake_planes.html en una ventana oculta, ejecuta __bake() y escribe los
// sprite sheets en assets/planes/<slug>/sheet.png (9 frames, alabeo -60..+60).
const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

// carpeta de cada avion en assets/planes/ (misma tabla que data/planes.js y build_web.py)
// key del modelo -> donde va su hoja. Un string es "la hoja base de ese avion"
// (sheet.png / sheet2.png); {dir, base} es una VARIANTE, que convive en la misma carpeta con
// otro nombre — asi las skins de los Fieles no pisan la hoja generica del A-4.
const SLUG = {
  sky: 'a4-skyhawk', dagger: 'iai-dagger', supere: 'super-etendard',
  a4q: 'a4q', pampa: 'pampa-63', mirage: 'mirage-5p',
  skin_tero:   { dir: 'a4-skyhawk', base: 'skin_tero' },
  skin_puma:   { dir: 'a4-skyhawk', base: 'skin_puma' },
  skin_gitano: { dir: 'a4-skyhawk', base: 'skin_gitano' },
  skin_vasco:  { dir: 'a4-skyhawk', base: 'skin_vasco' },
  skin_pichon: { dir: 'a4-skyhawk', base: 'skin_pichon' },
};
const ROOT = path.join(__dirname, '..');

app.whenReady().then(async () => {
  const win = new BrowserWindow({ width: 800, height: 600, show: false });
  await win.loadFile(path.join(__dirname, 'bake_planes.html'));
  try {
    const sheets = await win.webContents.executeJavaScript('__bake()');
    for (const key in sheets) {
      const slug = SLUG[key];
      const dir = typeof slug === 'string' ? slug : slug.dir;
      const base = typeof slug === 'string' ? 'sheet' : slug.base;
      for (const [name, data] of [[base + '.png', sheets[key].sheet], [base + '2.png', sheets[key].sheet2]]) {
        const b64 = data.split('base64,')[1];
        fs.writeFileSync(path.join(ROOT, 'assets', 'planes', dir, name), Buffer.from(b64, 'base64'));
        console.log(`OK ${dir}/${name} (${(b64.length * 3 / 4 / 1024).toFixed(1)} KB)`);
      }
    }
    console.log('Horneado completo.');
  } catch (e) {
    console.error('ERROR al hornear:', e.message);
    process.exitCode = 1;
  }
  app.quit();
});
