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
    // LAS CAJAS, MEDIDAS. `SHEETS` de src/render/enemies.js lleva el bbox del CONTENIDO dentro
    // del frame, y de ahi sale donde se ancla cada bicho: al suelo los de tierra, al centro los
    // del aire. Hasta ahora se median a mano sobre el alfa, una por una — un numero mal copiado
    // deja al enemigo flotando o enterrado, y no hay prueba que lo agarre. Se mide aca, sobre la
    // hoja recien horneada, y se imprime listo para pegar.
    const cajas = await win.webContents.executeJavaScript(`(async () => {
      const out = {};
      for (const key in window.__SHEETS_META) {
        const m = window.__SHEETS_META[key];
        const im = new Image(); im.src = window.__SHEETS_DATA[key]; await im.decode();
        const c = document.createElement('canvas');
        c.width = im.naturalWidth; c.height = im.naturalHeight;
        const g = c.getContext('2d'); g.drawImage(im, 0, 0);
        const d = g.getImageData(0, 0, c.width, c.height).data;
        let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
        // la UNION de todos los frames, en coordenadas LOCALES al frame: la caja tiene que
        // contener al bicho en cualquiera de sus poses
        for (let y = 0; y < c.height; y++) {
          for (let x = 0; x < c.width; x++) {
            if (d[(y * c.width + x) * 4 + 3] < 8) continue;
            const lx = x % m.fw, ly = y % m.fh;
            if (lx < x0) x0 = lx; if (lx > x1) x1 = lx;
            if (ly < y0) y0 = ly; if (ly > y1) y1 = ly;
          }
        }
        out[key] = { fw: m.fw, fh: m.fh, cols: m.cols, box: { x0, y0, x1, y1 } };
      }
      return JSON.stringify(out);
    })()`);
    console.log('\nCAJAS MEDIDAS (pegar en SHEETS de src/render/enemies.js):');
    const cs = JSON.parse(cajas);
    for (const k of Object.keys(cs).sort()) {
      const c = cs[k];
      console.log(`  ${k}: fw ${c.fw}, fh ${c.fh}, cols ${c.cols}, ` +
        `box { x0: ${c.box.x0}, y0: ${c.box.y0}, x1: ${c.box.x1}, y1: ${c.box.y1} }`);
    }
    console.log('\nHorneado completo.');
  } catch (e) {
    console.error('ERROR al hornear:', e.message);
    process.exitCode = 1;
  }
  app.quit();
});
