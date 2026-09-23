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
      // 3.png = LA HOJA DEL PODER RASANTE (otro punto de vista, frame al doble) — ver bake_planes.html
      // LAS CAPAS DE CARGA (tanques y bombas), una por pieza y por vista: <capa>.png, <capa>2.png,
      // <capa>3.png — el mismo sufijo que las hojas del avion a las que calzan. Ver bake_planes.html.
      const capas = [];
      for (const nom in (sheets[key].capas || {})) {
        const c = sheets[key].capas[nom];
        capas.push([nom + '.png', c.s1], [nom + '2.png', c.s2], [nom + '3.png', c.s3]);
      }
      for (const [name, data] of [[base + '.png', sheets[key].sheet], [base + '2.png', sheets[key].sheet2],
                                  [base + '3.png', sheets[key].sheet3], ...capas]) {
        const b64 = data.split('base64,')[1];
        fs.writeFileSync(path.join(ROOT, 'assets', 'planes', dir, name), Buffer.from(b64, 'base64'));
        console.log(`OK ${dir}/${name} (${(b64.length * 3 / 4 / 1024).toFixed(1)} KB)`);
      }
    }
    // LAS ANCLAS, medidas sobre las hojas recien horneadas (ver bake_planes.html). Se escriben
    // como modulo ES porque es lo que el juego puede importar — mismo criterio que src/data/cajas.js
    // con las hojas de enemigos. Se mide sobre el A-4 (`sky`), que es de donde salio la tabla a mano
    // que esto reemplaza: TODO el roster comparte una sola tabla, y esa aproximacion ya estaba
    // tomada — lo que cambia es quien la mide.
    const anclas = await win.webContents.executeJavaScript('__anclas()');
    const A = anclas.sky;
    const fila = t => '[' + t.map(c => '[' + c.join(',') + ']').join(', ') + ']';
    const tabla = t => '[\n' + t.map(f => '  ' + fila(f)).join(',\n') + ',\n]';
    const tobT = t => '[\n' + t.map(f => '  [' + f.map(c => c ? '[' + c.join(',') + ']' : 'null').join(', ') + ']').join(',\n') + ',\n]';
    const ANCLAS_JS = `// ANCLAS DE LAS HOJAS DE AVIONES — GENERADO, NO EDITAR A MANO.
// Para retocar un valor a mano NO se toca este archivo: se pone el ajuste en src/data/anclas.js,
// que es el que el juego importa y el unico que sobrevive a la proxima horneada.
// Lo escribe \`npx electron tools/bake_planes_run.js\` midiendo el alfa de las hojas recien
// horneadas. Reemplaza a la tabla TIPS y a la constante TOBERA_F que vivian a mano en
// render/plane.js con la nota "si se re-hornea la hoja con otra geometria de ala, hay que volver a
// medir esta tabla". Con UNA hoja eso se sostenia; con dos puntos de vista distintos, no.
//
// SE MIDE CON EL MISMO METODO con el que se midieron a mano: el pixel opaco mas a la izquierda y
// el mas a la derecha de cada frame, y la Y media de esa columna. La prueba de que es el mismo
// criterio y no uno nuevo esta en que las 27 celdas de \`tips\` de la hoja BASE salen identicas a
// las que estaban escritas a mano, y \`tob\` de la pose nivelada da 0.083 — que es el 7/84 que
// estaba puesto como TOBERA_F.
//
//   tips[fila][columna] = [ix, iy, dx, dy]   las dos puntas de ala, en fraccion del frame y desde
//                                            su centro. Las consumen la estela y los parches.
//                                            SALEN DE LA GEOMETRIA (el vertice de |x| maximo del
//                                            modelo, proyectado), no del alfa: mirando de costado
//                                            lo mas ancho del dibujo es el fuselaje, no el ala.
//   perfil[13]          = [arriba, abajo]    la silueta opaca de la pose nivelada en 13 franjas a
//                                            lo ancho. Es el tope real de los parches — la caja
//                                            sola no alcanza, porque adentro de un rectangulo
//                                            todavia hay cielo.
//   tob[fila][columna]  = [x, y] | null      el centroide del naranja del escape: donde nace la
//                                            llama del turbo. \`null\` = en esta pose no se ve.
//   box[fila][columna]  = [arriba, abajo]    hasta donde llega el avion en vertical en esa pose.
//                                            Es el TOPE de los parches: una chapa no puede quedar
//                                            flotando en el cielo.
//   alto                                     cuanto ocupa el avion en vertical dentro del frame
//                                            nivelado. Lo usan los parches para reescalar sus
//                                            alturas de una hoja a la otra.
export const HORNO = {
  base: { tips: ${tabla(A.base.tips)}, tob: ${tobT(A.base.tob)}, box: ${tabla(A.base.box)}, perfil: ${fila(A.base.perfil.map(p => p || [0, 0]))}, alto: ${A.base.alto} },
  ras:  { tips: ${tabla(A.ras.tips)}, tob: ${tobT(A.ras.tob)}, box: ${tabla(A.ras.box)}, perfil: ${fila(A.ras.perfil.map(p => p || [0, 0]))}, alto: ${A.ras.alto} },
};
`;
    fs.writeFileSync(path.join(ROOT, 'src', 'data', 'anclas_horno.js'), ANCLAS_JS);
    console.log(`\nANCLAS MEDIDAS -> src/data/anclas_horno.js  (base alto ${A.base.alto} · ras alto ${A.ras.alto})`);
    console.log('Horneado completo.');
  } catch (e) {
    console.error('ERROR al hornear:', e.message);
    process.exitCode = 1;
  }
  app.quit();
});
