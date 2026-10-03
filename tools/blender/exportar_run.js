// EXPERIMENTO BLENDER: vuelca a JSON los modelos de three.js de los aviones.
//   npx electron tools/blender/exportar_run.js [clave...]      (por defecto: sky)
// Escribe tools/blender/out/<clave>.json, que es lo que lee tools/blender/hornear.py.
const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

const claves = process.argv.slice(2).filter(a => !a.startsWith('-') && !a.endsWith('.js'));
const OUT = path.join(__dirname, 'out');

app.whenReady().then(async () => {
  const win = new BrowserWindow({ width: 400, height: 300, show: false });
  await win.loadFile(path.join(__dirname, 'exportar.html'));
  fs.mkdirSync(OUT, { recursive: true });
  for (const k of claves.length ? claves : ['sky']) {
    const json = await win.webContents.executeJavaScript(`__exportar(${JSON.stringify(k)})`);
    fs.writeFileSync(path.join(OUT, k + '.json'), json);
    console.log('OK', k, (json.length / 1024).toFixed(0) + ' KB');
  }
  app.exit(0);
});
