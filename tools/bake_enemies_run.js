// Runner headless del horneado de enemigos:
//   npx electron tools/bake_enemies_run.js
// Abre tools/bake_enemies.html en una ventana oculta, ejecuta __bake() y escribe los
// sprite sheets en assets/world/enemies/<nombre>.png
//
// Y ADEMAS MIDE LAS CAJAS (PLAN_HORNEADO B0, regla 3). `box` es el bbox del CONTENIDO adentro del
// frame, y de ahi sale donde se ancla cada bicho — al suelo los de tierra, al centro los del
// aire. Antes se contaban a ojo sobre el alfa y se pegaban a mano en src/render/enemies.js: un
// numero mal copiado dejaba al enemigo flotando o enterrado, y no habia prueba que lo agarrara.
// Ahora se miden donde se hornean y se escriben en DOS lugares, en el mismo instante:
//   · assets/world/enemies/cajas.json  — el artefacto, al lado de las hojas, para mirarlo
//   · src/data/cajas.js                — el mismo dato como modulo ES, que es lo que el juego
//                                        puede importar (con `file://` y el build de una sola
//                                        pagina no hay fetch de JSON que sobreviva)
// Los dos salen de la misma medicion, asi que no pueden divergir; `npm run unit` igual lo revisa.
const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'assets', 'world', 'enemies');
const CAJAS_JSON = path.join(OUT, 'cajas.json');
const CAJAS_JS = path.join(ROOT, 'src', 'data', 'cajas.js');

const CABECERA = `// CAJAS DE LAS HOJAS DE SPRITES — GENERADO, NO EDITAR A MANO.
// Lo escribe \`npx electron tools/bake_enemies_run.js\` midiendo el alfa de cada hoja recien
// horneada (PLAN_HORNEADO B0, regla 3: "las cajas se miden solas"). La copia legible vive al
// lado de las hojas, en assets/world/enemies/cajas.json.
//
// \`box\` es el rectangulo de CONTENIDO adentro del frame, en la UNION de todas las poses: el
// frame tiene aire alrededor para que el helo pueda girar el rotor sin cortarse, y anclar por el
// borde del FRAME dejaria a los vehiculos flotando. \`margen\` es el aire mas chico que queda
// hasta el borde de la celda — la regla 5 del plan pide 2 px.
//
// Lo que NO esta aca es deliberado: \`wu\` (cuantas unidades de mundo mide el bicho) y \`href\`
// son PERILLAS DE ARTE, no medidas, y viven en src/render/enemies.js. El horno mide hechos; el
// tamaño en pantalla lo decide un humano.
`;

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

    const cajas = await win.webContents.executeJavaScript('__cajas()');
    fs.writeFileSync(CAJAS_JSON, JSON.stringify(cajas, null, 2) + '\n');
    const cuerpo = Object.keys(cajas).sort().map(k => {
      const c = cajas[k];
      return `  ${k}: { fw: ${c.fw}, fh: ${c.fh}, cols: ${c.cols}, rows: ${c.rows}, ` +
        `box: { x0: ${c.box.x0}, y0: ${c.box.y0}, x1: ${c.box.x1}, y1: ${c.box.y1} }, margen: ${c.margen} },`;
    }).join('\n');
    fs.writeFileSync(CAJAS_JS, `${CABECERA}export const CAJAS = {\n${cuerpo}\n};\n`);

    console.log('\nCAJAS MEDIDAS → assets/world/enemies/cajas.json + src/data/cajas.js');
    let flacas = 0;
    for (const k of Object.keys(cajas).sort()) {
      const c = cajas[k];
      const aviso = c.margen < 2 ? `  ⚠ MARGEN ${c.margen} px (el plan pide 2)` : '';
      if (c.margen < 2) flacas++;
      console.log(`  ${k}: ${c.fw}x${c.fh} x${c.cols} · ` +
        `box ${c.box.x0},${c.box.y0}–${c.box.x1},${c.box.y1} · margen ${c.margen}${aviso}`);
    }
    if (flacas) console.log(`\n⚠ ${flacas} hoja(s) con menos de 2 px de aire: el contenido se corta al escalar.`);
    console.log('\nHorneado completo.');
  } catch (e) {
    console.error('ERROR al hornear:', e.message);
    process.exitCode = 1;
  }
  app.quit();
});
