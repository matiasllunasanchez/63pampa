// LAS IMAGENES EN WEBP SIN PERDIDA (27/11/2026, el autor: "vamos con esa idea" — y "siempre que te pida una
// imagen nueva pasala por esto tambien"). Los PNG siguen siendo la FUENTE (los escribe el horno de Blender y los
// leen las pruebas); esto saca de cada uno un webp SIN PERDIDA —el mismo pixel, ~80% menos de peso— en
// assets/webp/<misma ruta>.webp, y la lista de los que tienen su webp en src/data/webp_lista.js. Las dos cosas
// son artefactos (.gitignore): las rehace `npm run build:game`, y solo convierte lo que cambio desde la vez pasada.
//
// Al jugar, src/core/webp.js pide el webp en lugar del png (solo en Electron). El paquete de Steam lleva los
// webp y no esos PNG (package.json `build.files`). Lo que webp no puede guardar (mas de 16383 px de lado: las
// `sheet3_hd`) sigue en PNG.
//
// Uso: node tools/webp.js            (incremental)
//      node tools/webp.js --todo     (rehace todos)
//      node tools/webp.js --exigir   (falla si no hay cwebp: lo usa el build de Steam, que no lleva esos PNG)
const fs = require('fs');
const path = require('path');
const { spawn, spawnSync } = require('child_process');
const os = require('os');

const RAIZ = path.join(__dirname, '..');
const ASSETS = path.join(RAIZ, 'assets');
const SALIDA = path.join(ASSETS, 'webp');
const LISTA = path.join(RAIZ, 'src', 'data', 'webp_lista.js');
// las carpetas de imagenes que van en el juego (package.json `build.files`)
const CARPETAS = ['planes', 'ui', 'world', 'photos', 'portraits', 'ammo'];
const MAX_LADO = 16383;   // el tope de webp

const todo = process.argv.includes('--todo'), exigir = process.argv.includes('--exigir');

function escribirLista(rutas) {
  const txt = '// GENERADO por tools/webp.js — no editar (y no va al repo: lo rehace `npm run build:game`).\n'
    + '// Los PNG de assets/ que tienen su webp sin perdida en assets/webp/ (ver src/core/webp.js).\n'
    + 'export const WEBP = ' + JSON.stringify(rutas.sort(), null, 0).replace(/","/g, '",\n  "') + ';\n';
  if (!fs.existsSync(LISTA) || fs.readFileSync(LISTA, 'utf8') !== txt) fs.writeFileSync(LISTA, txt);
}

/** Ancho y alto de un PNG, del encabezado (IHDR). */
function lados(f) {
  const fd = fs.openSync(f, 'r'), b = Buffer.alloc(24);
  fs.readSync(fd, b, 0, 24, 0); fs.closeSync(fd);
  return [b.readUInt32BE(16), b.readUInt32BE(20)];
}

function pngs(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) pngs(p, out);
    else if (e.name.endsWith('.png')) out.push(p);
  }
  return out;
}

const hayCwebp = spawnSync('cwebp', ['-version']).status === 0;
if (!hayCwebp) {
  if (exigir) { console.error('webp: falta cwebp (brew install webp) — el build de Steam no lleva los PNG que tienen webp'); process.exit(1); }
  console.log('webp: no hay cwebp — el juego sigue con los PNG');
  escribirLista([]);
  process.exit(0);
}

const tareas = [], lista = [], grandes = [];
for (const c of CARPETAS) for (const f of pngs(path.join(ASSETS, c))) {
  const rel = path.relative(ASSETS, f).split(path.sep).join('/');
  const [w, h] = lados(f);
  if (w > MAX_LADO || h > MAX_LADO) { grandes.push(rel); continue; }
  const dst = path.join(SALIDA, rel.replace(/\.png$/, '.webp'));
  lista.push(rel);
  if (!todo && fs.existsSync(dst) && fs.statSync(dst).mtimeMs >= fs.statSync(f).mtimeMs) continue;
  tareas.push([f, dst]);
}

// LOS QUE SIGUEN EN PNG TIENEN QUE IR EN EL PAQUETE: package.json los nombra uno por uno (el resto de esos PNG
// no va). Si el horno saca otra hoja gigante, el build de Steam frena aca en vez de salir sin ella.
if (exigir) {
  const files = JSON.parse(fs.readFileSync(path.join(RAIZ, 'package.json'), 'utf8')).build.files.join('\n');
  const faltan = grandes.filter(r => !(r === 'ui/icono.png' || files.includes(r.split('/').slice(-2, -1)[0]) && files.includes(path.basename(r))));
  if (faltan.length) { console.error('webp: estos PNG no tienen webp y no estan en package.json build.files: ' + faltan.join(', ')); process.exit(1); }
}

// los webp de PNG que ya no estan
let borrados = 0;
const vivos = new Set(lista.map(r => r.replace(/\.png$/, '.webp')));
(function barrer(dir) {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) barrer(p);
    else if (e.name.endsWith('.webp') && !vivos.has(path.relative(SALIDA, p).split(path.sep).join('/'))) { fs.unlinkSync(p); borrados++; }
  }
})(SALIDA);

function convertir([src, dst]) {
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  const tmp = dst + '.tmp';
  return new Promise((ok, mal) => {
    const p = spawn('cwebp', ['-quiet', '-lossless', '-exact', '-z', '6', '-metadata', 'icc', src, '-o', tmp]);
    p.on('close', code => {
      if (code !== 0) return mal(new Error('cwebp fallo con ' + src));
      fs.renameSync(tmp, dst); ok();
    });
  });
}

(async () => {
  const N = Math.max(2, os.cpus().length);
  let i = 0;
  const t0 = Date.now();
  await Promise.all(Array.from({ length: N }, async () => { while (i < tareas.length) await convertir(tareas[i++]); }));
  escribirLista(lista);
  if (tareas.length || borrados || todo)
    console.log(`webp: ${tareas.length} convertidos, ${borrados} borrados, ${lista.length} en la lista, ${grandes.length} siguen en PNG (mas de ${MAX_LADO} px) — ${((Date.now() - t0) / 1000).toFixed(1)} s`);
})().catch(e => { console.error('webp: ' + e.message); process.exit(1); });
