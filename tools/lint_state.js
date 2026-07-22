// GUARDIA DEL STORE — protege las dos invariantes de src/core/state.js.
//   npm run lint:state
//
// El store solo sirve si sus reglas se cumplen SIEMPRE. Las dos que importan:
//
//   1. `S.state` se escribe unicamente con setState(). Una asignacion suelta no rompe nada
//      visible, pero devuelve la maquina de estados a lo que era antes: 22 escrituras dispersas
//      sin forma de rastrear quien salto a que pantalla.
//
//   2. cfg / cam / plane / stats NUNCA se reasignan, solo se mutan. Este es el peligroso:
//      reasignar deja a los otros modulos apuntando al objeto viejo y el juego SIGUE ANDANDO,
//      dibujando un avion que ya no es el que vuela. Ningun smoke test detecta eso.
//
// Es un chequeo textual, no un parser: se limita a patrones inequivocos para no dar falsos
// positivos (ya se intento escribir un analizador con regex en este proyecto y se descarto).
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const SRC = join(ROOT, 'src');

// Los objetos y arrays compartidos por referencia. Reasignar cualquiera de estos deja a los
// otros modulos mirando el valor viejo, sin error ni sintoma visible.
const STABLE = [
  'cfg', 'cam', 'plane', 'stats',                                        // core/state.js
  'run',                                                                 // core/run.js
  'obstacles', 'soldiers', 'bullets', 'missiles', 'pmissiles',           // core/world.js
  'parts', 'popups', 'streaks', 'wake', 'gusts',
];
const STORES = /core\/(state|world|run)\.js/;

function sources(dir, out = []) {
  for (const e of readdirSync(dir)) {
    if (e === 'vendor' || e === 'game.bundle.js') continue;   // codigo de terceros / generado
    const p = join(dir, e);
    if (statSync(p).isDirectory()) sources(p, out);
    else if (e.endsWith('.js')) out.push(p);
  }
  return out;
}

const problems = [];
const isStore = f => STORES.test(f.replace(/\\/g, '/'));

for (const file of sources(SRC)) {
  if (isStore(file)) continue;                    // el dueño del store puede escribirlo
  const rel = relative(ROOT, file);
  const text = readFileSync(file, 'utf8');
  const lines = text.split('\n');

  // Solo interesan los nombres que este archivo IMPORTA del store. Sin esto, un `const cam` local
  // (la camara de three.js, por ejemplo) se marcaria como si fuera el `cam` compartido.
  const imported = new Set();
  for (const imp of text.matchAll(/import\s*\{([^}]*)\}\s*from\s*['"][^'"]*core\/(?:state|world|run)\.js['"]/g))
    for (const n of imp[1].split(',')) imported.add(n.trim().split(/\s+as\s+/).pop());
  if (!imported.size) continue;

  lines.forEach((line, i) => {
    const code = line.replace(/\/\/.*$/, '');       // ignorar comentarios de linea
    const at = `${rel}:${i + 1}`;

    // 1. asignacion a S.state ( `=` que no sea `==`, `===`, `+=` … )
    if (imported.has('S') && /\bS\.state\s*=(?![=>])/.test(code))
      problems.push(`${at}\n      S.state se asigna directo — usar setState()\n      ${line.trim()}`);

    // 2. reasignacion de un objeto estable: la variable SOLA a la izquierda de un `=`
    //    (`plane.y = 1` es mutacion y esta bien; `plane = {...}` no)
    for (const v of STABLE) {
      if (!imported.has(v)) continue;
      const re = new RegExp(`(?:^|[;{}])\\s*${v}\\s*=(?![=>])`);
      if (re.test(code))
        problems.push(`${at}\n      \`${v}\` se reasigna — el store se comparte por referencia, hay que MUTARLO\n      ${line.trim()}`);
    }
  });
}

if (problems.length) {
  console.error(`\nLINT STATE: ${problems.length} violacion(es)\n`);
  for (const p of problems) console.error('  ✗ ' + p + '\n');
  process.exit(1);
}
console.log('\nLINT STATE: OK\n');
