// FIXTURE DE ACEPTACION DEL CUADERNO DE MATEO — el registro TIERRA, corrido en el juego de verdad.
//   npm run cuaderno                          · las quince cartas, una por una
//   CUAD_SHOTS=/tmp/x npm run cuaderno        · ademas guarda una captura de cada una
//
// LO QUE PRUEBA, que es lo que un fixture puede probar de una pantalla y `npm run unit` no:
//
//   1. LAS QUINCE CARTAS ENTRAN EN LA HOJA. Es EL riesgo del cuaderno y no se ve solo: una carta
//      que se pasa de largo no se dibuja rota, se dibuja con el final abajo del borde de la
//      pagina, y eso se descubre leyendo justo esa carta. drawCuaderno lo avisa por consola
//      cuando ni achicando la letra entra (ver CUAD.minEsc en render/screens.js) y este fixture
//      levanta ese aviso y lo convierte en una falla.
//   2. LA CARTA SE ESCRIBE ENTERA: el ultimo caracter que el motor dice haber tipeado es el
//      ultimo del texto. El cuaderno parte los renglones POR SU CUENTA, midiendo en pixeles, y un
//      wrap propio es exactamente el lugar donde se pierde el ultimo pedazo de una frase.
//   3. QUE NO TIRE UN SOLO ERROR con cero assets de por medio (RF-01): las laminas de las cartas
//      pueden no estar y la hoja se pinta a mano igual.
//
// No esta en `npm run check`: son quince escenas con sus tiempos reales. Se corre cuando se toca
// el cuaderno o cuando se escribe una carta nueva — que es cuando la pregunta "¿entra?" se hace.
const { app, BrowserWindow } = require('electron');
const path = require('path'), fs = require('fs');
const ROOT = path.join(__dirname, '..');
const OUT = process.env.CUAD_SHOTS || '';
const sleep = ms => new Promise(r => setTimeout(r, ms));

// LAS QUINCE CARTAS, en el orden en que las lee el jugador. La lista va a mano y no sale de
// story.js a proposito: si mañana entra una carta nueva y nadie la agrega acá, el fixture sigue
// diciendo OK sobre catorce — pero el numero que imprime abajo no coincide con el del guion, y
// esa diferencia es la que se ve. Un `for (const k in SCENES)` no dejaria ver nada.
const CARTAS = ['P4_1', 'M1_9', 'M2_8', 'M03_CUADERNO', 'M3_8', 'M4_CARTA', 'M5_CARTA', 'M6_CARTA',
  'M7_CARTA', 'M8_CARTA', 'M9_CARTA', 'M10_CUADERNO', 'M10_CARTA', 'M11_CARTA', 'M11_CARTA2'];

let win, fallas = 0;
const mal = m => { console.error('   ✗ ' + m); fallas++; };
const js = s => win.webContents.executeJavaScript(s);
const dbg = async () => JSON.parse(await js('String(window.__sdbg())'));
const tap = async () => {
  win.webContents.sendInputEvent({ type: 'keyDown', keyCode: 'Space' });
  await sleep(40);
  win.webContents.sendInputEvent({ type: 'keyUp', keyCode: 'Space' });
  await sleep(90);
};

app.whenReady().then(async () => {
  win = new BrowserWindow({ width: 960, height: 540, show: false, webPreferences: { backgroundThrottling: false } });
  if (OUT) fs.mkdirSync(OUT, { recursive: true });
  let renglones = 0, caracteres = 0;
  for (const id of CARTAS) {
    const ruido = [];
    win.webContents.removeAllListeners('console-message');
    win.webContents.on('console-message', (e, l, m) => {
      if (l >= 2 && !m.includes('Security Warning')) ruido.push(m.slice(0, 220));
    });
    await win.loadURL('file://' + path.join(ROOT, 'src', 'index.html') + '?scene=' + id);
    for (let i = 0; i < 200; i++) {
      if (await js('String(typeof window.__sdbg)') === 'function') break;
      await sleep(50);
    }
    while ((await dbg()).seqT < 0.45) await sleep(50);   // la gracia anti-salteo del arranque
    let d = await dbg(), n = 0, escritas = 0;
    const titulo = d.titulo;
    for (; n < 40; n++) {
      const linea = d.line;
      await tap();                                       // completar el tipeo de golpe
      d = await dbg();
      if (d.line === linea) {
        // sigue en la misma linea: se completo. LA CARTA SE ESCRIBIO ENTERA (punto 2).
        if (d.typed !== d.len) mal(`${id} · ${d.id}: quedaron ${d.len - d.typed} caracteres sin escribir`);
        if (d.tipo === 'TIERRA') { escritas++; caracteres += d.len; }
        while (d.holdLeft > 0) { await sleep(80); d = await dbg(); }
        if (OUT && escritas === 1) {
          const url = await js("document.getElementById('g').toDataURL('image/png')");
          fs.writeFileSync(path.join(OUT, id + '.png'), Buffer.from(url.split(',')[1], 'base64'));
        }
        await tap();                                     // y pasar a la siguiente
        d = await dbg();
      }
      if (d.state !== 'story') break;                    // se acabo la secuencia
    }
    renglones += escritas;
    const derrame = ruido.filter(m => m.includes('cuaderno:'));
    for (const m of derrame) mal(m);
    for (const m of ruido.filter(m => !m.includes('cuaderno:'))) mal(`${id} · la consola escupio: ${m}`);
    console.log(`${id.padEnd(13)} «${(titulo || '—')}» · ${escritas} carillas escritas${derrame.length ? ' · SE DERRAMA' : ''}`);
  }
  console.log(`\n${CARTAS.length} cartas · ${renglones} carillas · ${caracteres} caracteres de puño y letra`);
  console.log(fallas ? `FIXTURE CUADERNO: ${fallas} FALLAS` : 'FIXTURE CUADERNO: OK');
  app.exit(fallas ? 1 : 0);
});
