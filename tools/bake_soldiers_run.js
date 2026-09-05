// Runner headless del horneado de los SOLDADOS:
//   npx electron tools/bake_soldiers_run.js   (o `npm run soldados`)
// Abre tools/bake_soldiers.html en una ventana oculta, ejecuta __bake() y escribe la hoja en
// assets/world/soldats/soldados.png (7 columnas x 2 filas, frames de 24x24).
//
// NO ESCRIBE NINGUN ARCHIVO DE CAJAS, y es a proposito: esta hoja se ancla por la CELDA (todas las
// poses comparten cámara y línea de suelo), así que no hay medidas que copiar al juego. Lo que sí
// hace es MEDIR para verificar el encuadre — que el contenido entre con los 2 px de aire de la
// regla 5 del plan y que los pies caigan donde el render los va a apoyar.
const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const ROOT = path.join(__dirname, '..');

app.whenReady().then(async () => {
  const win = new BrowserWindow({ width: 800, height: 600, show: false });
  await win.loadFile(path.join(__dirname, 'bake_soldiers.html'));
  try {
    const sheets = await win.webContents.executeJavaScript('__bake()');
    const dir = path.join(ROOT, 'assets', 'world', 'soldats');
    fs.mkdirSync(dir, { recursive: true });
    for (const key in sheets) {
      const b64 = sheets[key].split('base64,')[1];
      fs.writeFileSync(path.join(dir, key + '.png'), Buffer.from(b64, 'base64'));
      console.log(`OK soldats/${key}.png (${(b64.length * 3 / 4 / 1024).toFixed(1)} KB)`);
    }
    const m = await win.webContents.executeJavaScript('__medida()');
    console.log(`\nENCUADRE · celda ${m.fw}x${m.fh} (${m.wu} u de mundo) · suelo en la fila ${m.suelo}`);
    console.log(`  contenido: x ${m.box.x0}–${m.box.x1} · y ${m.box.y0}–${m.box.y1} · margen ${m.margen} px`);
    if (m.margen < 2) console.log(`  ⚠ MARGEN ${m.margen} px (el plan pide 2): el contenido se corta al escalar.`);
    // el contenido puede llegar UNA fila mas abajo del suelo: esa es la sombra de contacto que
    // deja el filo oscuro del contorno, y es justo donde el render apoya la celda. Dos filas ya no.
    if (m.box.y1 > m.suelo + 1) console.log(`  ⚠ el contenido baja hasta la fila ${m.box.y1}, por DEBAJO del suelo (${m.suelo}).`);
    console.log('\nHorneado completo.');
  } catch (e) {
    console.error('FALLO el horneado:', e && e.message);
    app.exit(1); return;
  }
  app.quit();
});
