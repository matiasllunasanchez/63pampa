// QUE LETRAS TIENE CADA FUENTE. Lee el `cmap` de los .ttf/.otf de assets/fonts/ y avisa cual no
// puede escribir en castellano.
//
//   node tools/glifos.js                 · todas las del banco
//   node tools/glifos.js ruta/a/una.ttf  · una suelta
//
// EXISTE POR UN AGUJERO REAL. El canvas no falla cuando le falta un glifo: pide el caracter a
// OTRA fuente y sigue como si nada. Asi que una manuscrita sin tildes no se ve rota — se ve como
// una manuscrita con la "i" de "frío" en monospace, y eso se descubre mirando la pantalla de
// cerca, no corriendo el juego. Cochocib, la primera candidata para el cuaderno de Mateo, no
// tiene NI UN acento NI la eñe; en un texto que dice "frío", "país", "podés", "mamá" y "jujeño"
// eso es medio parrafo prestado a otra tipografia.
//
// No esta en `npm run check`: se corre cuando entra una fuente nueva al banco, que es cuando la
// pregunta se hace. Ver FONTS en render/ctx.js.
const fs = require('fs'), path = require('path');
const u16 = (b, o) => b.readUInt16BE(o), u32 = (b, o) => b.readUInt32BE(o);

/** Mapa caracter → numero de glifo, leido del `cmap`. null si no se pudo leer.
 *
 *  DEVUELVE EL NUMERO DE GLIFO Y NO UN SET, y esa es la mitad util de este archivo: hay fuentes
 *  que declaran la "á" y la mandan al MISMO glifo que la "a". El caracter existe, el canvas no se
 *  queja, y el acento simplemente no aparece. Con un Set eso pasa por "acentos ok". */
function glifos(file) {
  const b = fs.readFileSync(file);
  const base = b.toString('ascii', 0, 4) === 'ttcf' ? u32(b, 12) : 0;
  let cmap = null;
  for (let i = 0, n = u16(b, base + 4); i < n; i++) {
    const r = base + 12 + i * 16;
    if (b.toString('ascii', r, r + 4) === 'cmap') cmap = u32(b, r + 8);
  }
  if (cmap == null) return null;
  let sub = null;                                   // subtabla Unicode: (3,1) (3,10) o plataforma 0
  for (let i = 0, n = u16(b, cmap + 2); i < n; i++) {
    const r = cmap + 4 + i * 8, p = u16(b, r), e = u16(b, r + 2);
    if ((p === 3 && (e === 1 || e === 10)) || p === 0) sub = cmap + u32(b, r + 4);
  }
  if (sub == null) return null;
  const set = new Map(), fmt = u16(b, sub);
  if (fmt === 4) {                                  // el formato de siempre: rangos de 16 bits
    const segX2 = u16(b, sub + 6);
    for (let s = 0; s < segX2 / 2; s++) {
      const fin = u16(b, sub + 14 + s * 2), ini = u16(b, sub + 16 + segX2 + s * 2);
      const delta = b.readInt16BE(sub + 16 + segX2 * 2 + s * 2);
      const roOff = sub + 16 + segX2 * 3 + s * 2, ro = u16(b, roOff);
      for (let c = ini; c <= fin && c !== 0xFFFF; c++) {
        let g;
        if (ro === 0) g = (c + delta) & 0xFFFF;
        else { const gi = roOff + ro + (c - ini) * 2; if (gi + 1 >= b.length) continue; g = u16(b, gi); if (g) g = (g + delta) & 0xFFFF; }
        if (g) set.set(c, g);
      }
    }
  } else if (fmt === 12) {                          // rangos de 32 bits
    for (let i = 0, n = u32(b, sub + 12); i < n; i++) {
      const r = sub + 16 + i * 12;
      for (let c = u32(b, r), e = u32(b, r + 4), g = u32(b, r + 8); c <= e; c++) set.set(c, g + (c - u32(b, r)));
    }
  } else return null;
  return set;
}

// LO QUE HAY QUE PODER ESCRIBIR. Los acentos y la eñe son obligatorios — sin ellos no se escribe
// castellano. Los signos de apertura y la raya de dialogo van aparte: se pueden esquivar
// reescribiendo una linea, los acentos no.
// Cada acentuada va con SU LETRA PELADA al lado: si las dos caen en el mismo glifo, la fuente
// dice que tiene el acento y dibuja la letra sin acento.
const OBLIGA = [['Á', 'A'], ['É', 'E'], ['Í', 'I'], ['Ó', 'O'], ['Ú', 'U'], ['Ü', 'U'], ['Ñ', 'N'],
                ['á', 'a'], ['é', 'e'], ['í', 'i'], ['ó', 'o'], ['ú', 'u'], ['ü', 'u'], ['ñ', 'n']];
const DESEA = '¿¡«»—…';

function informar(file) {
  const g = glifos(file);
  const n = path.basename(file).padEnd(32);
  if (!g) { console.log(n, '· no se pudo leer el cmap'); return true; }
  const id = c => g.get(c.codePointAt(0));
  const falta = OBLIGA.filter(([a]) => !id(a)).map(([a]) => a).join('');
  const mentira = OBLIGA.filter(([a, b]) => id(a) && id(a) === id(b)).map(([a]) => a).join('');
  const tibio = [...DESEA].filter(c => !id(c)).join('');
  const veredicto = falta ? '✗ FALTAN ' + falta
    : mentira ? '✗ SIN ACENTO (mismo glifo que la letra pelada): ' + mentira : 'ok';
  console.log(`${n} ${String(g.size).padStart(5)} glifos · acentos ${veredicto}${tibio ? ' · sin ' + tibio : ''}`);
  return !falta && !mentira;
}

const args = process.argv.slice(2);
let lista = args;
if (!lista.length) {
  const raiz = path.join(__dirname, '..', 'assets', 'fonts');
  const rec = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e =>
    e.isDirectory() ? rec(path.join(d, e.name)) : /\.(ttf|otf)$/i.test(e.name) ? [path.join(d, e.name)] : []);
  lista = rec(raiz).sort();
}
let ok = true;
for (const f of lista) ok = informar(f) && ok;
console.log(ok ? '\nGLIFOS: todas escriben castellano' : '\nGLIFOS: hay fuentes sin acentos — no sirven para texto en castellano');
