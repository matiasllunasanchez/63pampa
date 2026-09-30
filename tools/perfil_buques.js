// MIDE EL PERFIL DEL CASCO de las hojas horneadas y escupe el bloque de data/blanco.js.
//
//   npx electron tools/perfil_buques.js            imprime los perfiles
//   npx electron tools/perfil_buques.js --check    ademas COMPARA con lo que dice data/blanco.js
//
// POR QUE EXISTE. `PERFIL` es lo que hace que la bomba pegue DONDE SE VE casco: si el numero no
// coincide con el dibujo, el jugador ve que le pega y el juego dice que paso larga. data/blanco.js
// pedia re-medirlo A MANO cada vez que se re-hornea un buque ("alfa > 40 por columna, del borde de
// abajo al pixel mas alto, en el frame 0"). Un procedimiento a mano que hay que acordarse de hacer
// es un procedimiento que no se hace.
//
// EL `--check` ES EL QUE IMPORTA: corrido sobre las clases que ya estaban tiene que devolver
// EXACTAMENTE los numeros commiteados. Si los reproduce, la medicion de una clase nueva es
// confiable; si no, el que esta mal es el medidor y no el buque.
const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const ROOT = path.join(__dirname, '..');
const CLASES = ['t21', 't42', 'log', 'cv'];
const BANDAS = 20, ALFA = 40, POSES = 3;

app.whenReady().then(async () => {
  const win = new BrowserWindow({ width: 400, height: 300, show: false });
  await win.loadURL('file://' + path.join(ROOT, 'src', 'index.html'));
  const out = {};
  for (const c of CLASES) {
    const f = path.join(ROOT, 'assets', 'world', 'enemies', 'buque_' + c + '.png');
    if (!fs.existsSync(f)) { console.log('(no existe ' + c + ')'); continue; }
    const url = 'file://' + f;
    out[c] = await win.webContents.executeJavaScript(
      '(async () => {' +
      '  const im = new Image(); im.src = ' + JSON.stringify(url) + '; await im.decode();' +
      '  const cv = document.createElement("canvas"); cv.width = im.naturalWidth; cv.height = im.naturalHeight;' +
      '  const g = cv.getContext("2d"); g.drawImage(im, 0, 0);' +
      '  const W = cv.width, H = cv.height, d = g.getImageData(0,0,W,H).data;' +
      '  const fw = Math.round(W / ' + POSES + ');' +          // el frame 0 es el primero de la fila
      '  const op = (x,y) => d[(y*W+x)*4+3] > ' + ALFA + ';' +
      '  let x0=1e9, x1=-1, y1=-1;' +
      '  for (let x=0;x<fw;x++) for (let y=0;y<H;y++) if (op(x,y)) { if(x<x0)x0=x; if(x>x1)x1=x; if(y>y1)y1=y; }' +
      '  const esl = x1 - x0 + 1; const perf = [];' +
      '  for (let i=0;i<' + BANDAS + ';i++) {' +
      '    const a = x0 + Math.floor(esl*i/' + BANDAS + '), b = x0 + Math.floor(esl*(i+1)/' + BANDAS + ');' +
      '    let top = y1;' +
      '    for (let x=a;x<b;x++) for (let y=0;y<=y1;y++) if (op(x,y)) { if (y<top) top=y; break; }' +
      '    perf.push(+(((y1-top+1)/esl).toFixed(3)));' +
      '  }' +
      '  return perf;' +
      '})()');
  }
  console.log('');
  for (const c of CLASES) if (out[c]) console.log('  ' + c + ': [' + out[c].join(', ') + '],');
  console.log('');

  let malas = 0;
  if (process.argv.includes('--check')) {
    const src = fs.readFileSync(path.join(ROOT, 'src', 'data', 'blanco.js'), 'utf8');
    for (const c of CLASES) {
      if (!out[c]) continue;
      const re = new RegExp('^  ' + c + ': \\[([^\\]]*)\\]', 'm');
      const m = src.match(re);
      if (!m) { console.log('   · ' + c + ': todavia no esta en data/blanco.js'); continue; }
      const viejo = m[1].split(',').map(v => +v.trim());
      const dif = viejo.map((v, i) => Math.abs(v - out[c][i])).filter(x => x > 0.0005).length;
      if (dif) { console.error('   ✗ ' + c + ': ' + dif + '/20 bandas NO coinciden'); malas++; }
      else console.log('   ✓ ' + c + ': reproduce exacto lo commiteado');
    }
  }
  app.exit(malas ? 1 : 0);
});
