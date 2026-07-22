// Lee constantes de ajuste directamente del codigo fuente.
//
// Por que: los tests de sensacion (cabeceo, energia, roce) tenian los numeros COPIADOS. Cuando
// cambie los valores en el juego, los tests siguieron reportando los viejos y me dieron por bueno
// algo que ya no era cierto. Leyendolos del fuente no pueden mentir.
//
// Busca en TODO src/**/*.js (no en un archivo fijo) para que sigan funcionando cuando el codigo
// se parta en modulos y las constantes cambien de archivo.
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', '..', 'src');

function sources() {
  const out = [];
  (function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) { if (e.name !== 'vendor') walk(p); }        // vendor = three bundleado
      else if (e.name.endsWith('.js') && !e.name.endsWith('.bundle.js')) out.push(p);
    }
  })(SRC);
  return out;
}

const cache = sources().map(f => fs.readFileSync(f, 'utf8')).join('\n');

/** Devuelve el valor numerico de una constante, o revienta si no la encuentra. */
function num(name) {
  const m = cache.match(new RegExp(name + '\\s*=\\s*(-?[\\d.]+)'));
  if (!m) throw new Error(`no encontre la constante "${name}" en src/ — ¿la renombraron?`);
  return +m[1];
}

/** Igual que num() pero con una expresion regular propia (para casos que no son "NOMBRE = valor"). */
function rx(re, label) {
  const m = cache.match(re);
  if (!m) throw new Error(`no encontre ${label || re} en src/`);
  return +m[1];
}

module.exports = { num, rx };
