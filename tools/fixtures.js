// TODOS LOS FIXTURES, EN SERIE — y el que toma el BASELINE (PLAN_REFACTOR RF0).
//
//   npm run fixtures              corre los 12 y devuelve 1 si alguno falla
//   npm run fixtures -- --baseline   ademas escribe tools/baseline/*.txt
//   npm run fixtures -- pasada agua  corre solo esos
//
// POR QUE EN SERIE Y NO EN PARALELO: cada fixture levanta su propio Electron con GPU. En paralelo
// se pelean por el contexto de WebGL y empiezan a fallar por eso, no por el juego — una prueba que
// falla por el corredor enseña a ignorar las pruebas, que es lo contrario de lo que estas son.
//
// EL BASELINE, Y POR QUE ESTA NORMALIZADO. `feel` es determinista y se guarda TAL CUAL: es el juez
// de "cero cambio de comportamiento" y cualquier diferencia importa. Los fixtures NO son
// deterministas —vuelan de verdad, con azar en la siembra— asi que guardar su texto crudo daria un
// baseline que "falla" en cada corrida y no protegeria nada. De ellos se guarda la FORMA: las
// mismas comprobaciones, en el mismo orden, con el mismo veredicto, con los numeros enmascarados.
// Eso es lo que tiene que sobrevivir a un refactor; los numeros exactos los juzga cada fixture.
//
// OJO CON EL RUIDO DE NODE: el warning MODULE_TYPELESS_PACKAGE_JSON trae el PID, que cambia cada
// corrida. Sin filtrarlo, el baseline de `feel` nunca es identico a si mismo — pasa de ser un juez
// a ser ruido. Ya paso al medir RF-A.
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DIR = path.join(__dirname, 'baseline');

// los 12 de §1.4 del plan. El ARENA no tiene fixture propio: lo cubre el smoke (ver tools/smoke.js).
const FIXTURES = ['story', 'pasada', 'pulso', 'cine', 'caza', 'persec',
                  'romper', 'agua', 'tierra', 'chancha', 'misiones', 'tramos'];

const args = process.argv.slice(2);
const escribir = args.includes('--baseline');
const pedidos = args.filter(a => !a.startsWith('--'));
const lista = pedidos.length ? pedidos : FIXTURES;

/** Saca el ruido que cambia entre corridas sin que cambie el juego. */
const sinRuido = t => t.split('\n')
  .filter(l => !/^\(node:\d+\)/.test(l))
  // el encabezado de npm ("> rasante@0.1.0 feel") aparece o no segun se corra con --silent. Si se
  // colara, el baseline solo seria comparable contra si mismo cuando lo invocan igual — o sea que
  // dejaria de ser un juez y pasaria a ser un archivo lindo. Ya paso al cerrar RF0.
  .filter(l => !/^> [a-z@/.\d-]+ [a-z:]+$|^> node |^> electron /.test(l))
  .filter(l => !/^Reparsing as ES module|^To eliminate this warning|^\(Use `node/.test(l))
  .filter(l => !/Electron Security Warning/.test(l))
  .join('\n').replace(/^\s+/, '').replace(/\s+$/, '') + '\n';   // los renglones en blanco que deja el encabezado tampoco cuentan

/** La FORMA de una corrida: mismo texto, numeros enmascarados. */
const forma = t => sinRuido(t).replace(/-?\d+([.,]\d+)?/g, '#');

function corre(nombre) {
  const t0 = Date.now();
  let salida = '', ok = true;
  try {
    salida = execSync(`npm run ${nombre} --silent`, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 64 * 1024 * 1024 });
  } catch (e) {
    salida = (e.stdout || '') + (e.stderr || '');
    ok = false;
  }
  const seg = ((Date.now() - t0) / 1000).toFixed(0);
  const fallas = (salida.match(/✗/g) || []).length;
  const pasan = (salida.match(/✓/g) || []).length;
  if (fallas) ok = false;
  console.log(`${ok ? '✓' : '✗'} ${nombre.padEnd(10)} ${String(pasan).padStart(3)} ok · ${String(fallas).padStart(2)} ✗ · ${seg}s`);
  if (!ok) salida.split('\n').filter(l => l.includes('✗')).slice(0, 6).forEach(l => console.log('     ' + l.trim()));
  return { ok, salida };
}

if (escribir) fs.mkdirSync(DIR, { recursive: true });

// FEEL primero: es rapido, puro node y es el juez del refactor.
//
// Y SE GUARDA DISTINTO SIEMPRE, se lo pida por nombre o no. La primera version ataba el trato
// especial a "no me pidieron nada en particular", asi que `--baseline feel` caia en el lazo
// generico y guardaba el feel CON LOS NUMEROS ENMASCARADOS — un juez que no puede distinguir 0.50
// de 0.87 no es un juez. Se detecto comparando el baseline contra si mismo, que es exactamente
// para lo que sirve hacerlo.
const esFeel = f => f === 'feel';
const guardar = (f, salida) =>
  fs.writeFileSync(path.join(DIR, f + '.txt'), esFeel(f) ? sinRuido(salida) : forma(salida));

let fallaron = [];
const conFeel = pedidos.length ? lista : ['feel', ...lista];

for (const f of conFeel) {
  const r = corre(f);
  if (!r.ok) fallaron.push(f);
  if (escribir) guardar(f, r.salida);
}

if (escribir) console.log(`\nbaseline escrito en tools/baseline/ (${conFeel.length} archivos)`);
console.log(fallaron.length ? `\nFIXTURES: FALLARON ${fallaron.join(', ')}\n` : '\nFIXTURES: OK\n');
process.exit(fallaron.length ? 1 : 0);
