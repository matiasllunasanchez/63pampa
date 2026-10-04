// EXPERIMENTO BLENDER: vuelca a JSON los modelos de three.js de los aviones.
//   npx electron tools/blender/exportar_run.js [clave...]      (por defecto: sky)
// Escribe tools/blender/out/<clave>.json, que es lo que lee tools/blender/hornear.py.
//
// Cualquier otro modelo del horno (fase 2, los enemigos) con `familia:nombre[:arg]`:
//   npx electron tools/blender/exportar_run.js helos:seaKing:0 helos:seaKing:1
// escribe tools/blender/out/puente/<nombre>[_<arg>].json (lo lee tools/blender/hornear_hoja.py).
const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

const claves = process.argv.slice(2).filter(a => !a.startsWith('-') && !a.endsWith('.js'));
const OUT = path.join(__dirname, 'out');

app.whenReady().then(async () => { try {
  const win = new BrowserWindow({ width: 400, height: 300, show: false });
  await win.loadFile(path.join(__dirname, 'exportar.html'));
  fs.mkdirSync(OUT, { recursive: true });
  for (const k of claves.length ? claves : ['sky']) {
    if (k.includes(':')) {
      const [fam, nombre, ...args] = k.split(':');
      const json = await win.webContents.executeJavaScript(
        `__exportarModelo(${JSON.stringify(fam)}, ${JSON.stringify(nombre)}, ${JSON.stringify(args.map(a => isNaN(+a) ? a : +a))})`);
      fs.mkdirSync(path.join(OUT, 'puente'), { recursive: true });
      // las partes van con prefijo: sus nombres (`cola`, `motor`...) chocarian con otros modelos
      fs.writeFileSync(path.join(OUT, 'puente', (fam === 'partes' ? 'parte-' : '') + [nombre, ...args].join('_') + '.json'), json);
      console.log('OK', k, (json.length / 1024).toFixed(0) + ' KB');
      continue;
    }
    const json = await win.webContents.executeJavaScript(`__exportar(${JSON.stringify(k)})`);
    fs.writeFileSync(path.join(OUT, k + '.json'), json);
    console.log('OK', k, (json.length / 1024).toFixed(0) + ' KB');
  }
  app.exit(0);
  } catch (e) {
    // sin esto un modelo que falla (un catalogo sin cargar en exportar.html) deja a Electron colgado
    console.error('ERROR al exportar:', e.message);
    app.exit(1);
  }
});
