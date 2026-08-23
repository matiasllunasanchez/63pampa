// SIMETRIZA EL FRAME CENTRAL de las hojas de skin (assets/planes/<avion>/skin_*.png).
//
// EL PROBLEMA: en el frame del medio —el avion visto de frente, sin alabeo— el ala izquierda y la
// derecha no coinciden. Son una o dos filas de pixeles de diferencia en el borde, pero a 480x270
// el avion ocupa 50 px y esa fila se ve: parece que el avion esta torcido.
//
// LA SOLUCION es exacta y no interpretativa: se ESPEJA LA MITAD DERECHA SOBRE LA IZQUIERDA. El eje
// no se adivina — se midio y esta en x = FW/2 = 42, o sea que la caja del avion ya esta centrada
// en el marco (medido: caja x15-68, centro 42.0). Espejar por ahi no MUEVE el avion, solo copia.
//
// POR QUE ES SEGURO: se verifico que el frame central no tiene marcas asimetricas a proposito
// (numerales, insignias en un ala sola). Las unicas diferencias eran de silueta, en una banda de
// una o dos filas al borde del ala. Si algun dia una skin lleva una marca en UN ala, esto la
// duplicaria — por eso el script IMPRIME cuantos pixeles cambio en cada archivo: un numero alto
// es la señal de que hay que mirar antes de aceptar.
//
//   node/electron tools/simetriza_skins.js            (dry-run: mide y no escribe)
//   APLICAR=1 electron tools/simetriza_skins.js       (escribe las hojas)
const { app, BrowserWindow } = require('electron');
const path = require('path'), fs = require('fs');
const ROOT = path.join(__dirname, '..');
const FW = 84, FH = 84, NF = 9, ROWS = 3;
const COL = (NF - 1) / 2;              // la columna del medio: sin alabeo
const APLICAR = !!process.env.APLICAR;
let win; const js = s => win.webContents.executeJavaScript(s);

app.whenReady().then(async () => {
  win = new BrowserWindow({ width: 400, height: 300, show: false });
  await win.loadURL('data:text/html,<canvas id=c></canvas>');
  const dirs = fs.readdirSync(path.join(ROOT, 'assets/planes'))
    .filter(d => fs.statSync(path.join(ROOT, 'assets/planes', d)).isDirectory());
  let total = 0;
  for (const d of dirs) {
    const dir = path.join(ROOT, 'assets/planes', d);
    for (const f of fs.readdirSync(dir).filter(x => /^skin_.*\.png$/.test(x))) {
      const p = path.join(dir, f);
      const b64 = fs.readFileSync(p).toString('base64');
      const out = await js(`(async () => {
        const img = new Image();
        await new Promise(r => { img.onload = r; img.src = 'data:image/png;base64,${b64}'; });
        const c = document.getElementById('c'); c.width = img.width; c.height = img.height;
        const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
        x.drawImage(img, 0, 0);
        let cambiados = 0;
        for (let row = 0; row < ${ROWS}; row++) {
          const fx = ${COL} * ${FW}, fy = row * ${FH};
          if (fy + ${FH} > c.height) break;
          const im = x.getImageData(fx, fy, ${FW}, ${FH});
          const d = im.data;
          for (let py = 0; py < ${FH}; py++) {
            for (let px = 0; px < ${FW} / 2; px++) {
              const sp = ${FW} - 1 - px;                 // su espejo en la mitad DERECHA
              const i = (py * ${FW} + px) * 4, j = (py * ${FW} + sp) * 4;
              if (d[i] !== d[j] || d[i+1] !== d[j+1] || d[i+2] !== d[j+2] || d[i+3] !== d[j+3]) cambiados++;
              d[i] = d[j]; d[i+1] = d[j+1]; d[i+2] = d[j+2]; d[i+3] = d[j+3];
            }
          }
          x.putImageData(im, fx, fy);
        }
        return JSON.stringify({ cambiados, url: c.toDataURL('image/png') });
      })()`);
      const r = JSON.parse(out);
      total += r.cambiados;
      console.log(`   ${(d + '/' + f).padEnd(34)} ${String(r.cambiados).padStart(4)} px espejados`);
      if (APLICAR) fs.writeFileSync(p, Buffer.from(r.url.split(',')[1], 'base64'));
    }
  }
  console.log(APLICAR ? `\nESCRITO · ${total} px en total` : `\nDRY-RUN · ${total} px cambiarian (corre con APLICAR=1)`);
  app.exit(0);
}).catch(e => { console.error('reventó:', e && e.message); app.exit(1); });
