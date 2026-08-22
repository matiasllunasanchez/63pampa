// LINT DE CAPAS — el custodio del grafo de imports (PLAN_REFACTOR RF0, §3).
//
//   npm run lint:layers            reporta y FALLA si aparecio una violacion nueva
//   npm run lint:layers -- --write crea/rehace la lista (solo al abrir la fase)
//   npm run lint:layers -- --prune saca de la lista las que ya se arreglaron
//
// COMO FUNCIONA, Y POR QUE ASI. Hoy el repo tiene violaciones de capa REALES y arreglarlas es el
// trabajo de RF1..RF8, no de este lint. Si empezara en ERROR, `check` estaria rojo desde el
// minuto cero y el equipo aprenderia a ignorarlo — que es como muere un custodio. Entonces
// arranca en modo REPORTE con TRINQUETE: la lista de hoy es el techo.
//
//   · una violacion que NO esta en la lista  → ERROR. El grafo no puede empeorar.
//   · una de la lista que ya no existe       → se avisa para achicar la lista (`--prune`).
//
// La lista SOLO PUEDE ACHICARSE. Cuando llegue a cero, este archivo pasa a ERROR puro y se le
// borra el trinquete (es la metrica "violaciones de capas: 34 → 0" de §7).
//
// LAS REGLAS salen de §3 "Arquitectura objetivo":
//   data     no importa nada fuera de data
//   core     puro: solo core y data (ni canvas ni audio ni sistemas)
//   systems  comportamiento: nunca importa render
//   render   dibujo: lee STORES, no las tripas de un sistema  → nunca importa systems
//   legacy   congelado: puede importar lo que sea, pero NADIE NUEVO puede importarlo a el
//   app      game.js, el ensamblador: puede con todo
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const LISTA = path.join(__dirname, 'baseline', 'layers_whitelist.json');

const CAPA_DE = rel => {
  if (rel === 'game.js') return 'app';
  const dir = rel.split('/')[0];
  return ['data', 'core', 'systems', 'render', 'legacy', 'dev'].includes(dir) ? dir : 'otro';
};

// que puede importar cada capa. `legacy` aparte: lo maneja la regla de "nadie nuevo lo importa".
const PERMITE = {
  data: ['data'],
  core: ['core', 'data'],
  systems: ['systems', 'core', 'data'],
  render: ['render', 'core', 'data'],
  dev: ['dev', 'render', 'systems', 'core', 'data', 'legacy', 'app'],
  legacy: ['legacy', 'render', 'systems', 'core', 'data'],
  app: ['app', 'dev', 'render', 'systems', 'core', 'data', 'legacy'],
  otro: ['data', 'core', 'systems', 'render', 'legacy', 'app', 'dev', 'otro'],
};

function archivos(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (e.name !== 'vendor') archivos(p, acc); }
    else if (e.name.endsWith('.js') && e.name !== 'game.bundle.js') acc.push(p);
  }
  return acc;
}

const violaciones = [];
for (const abs of archivos(SRC)) {
  const rel = path.relative(SRC, abs).split(path.sep).join('/');
  const capa = CAPA_DE(rel);
  const texto = fs.readFileSync(abs, 'utf8');
  const re = /^\s*import\s+(?:[\s\S]*?\sfrom\s+)?['"]([^'"]+)['"]/gm;
  let m;
  while ((m = re.exec(texto))) {
    const spec = m[1];
    if (!spec.startsWith('.')) continue;                       // paquete externo: no es capa nuestra
    const destAbs = path.resolve(path.dirname(abs), spec);
    const destRel = path.relative(SRC, destAbs).split(path.sep).join('/');
    const destCapa = CAPA_DE(destRel);
    let motivo = null;
    if (destCapa === 'legacy' && capa !== 'legacy' && capa !== 'app') motivo = 'depende de legacy';
    else if (!PERMITE[capa].includes(destCapa)) motivo = `${capa} no puede importar ${destCapa}`;
    if (motivo) violaciones.push({ id: `${rel} -> ${destRel}`, motivo });
  }
}
// DEDUPLICAR: un archivo puede importar al mismo modulo en dos renglones (o dos veces el mismo
// simbolo). Eso es UNA violacion de capa, no dos — si no, el techo y la cuenta no coinciden y el
// numero deja de ser comparable entre fases, que es justo para lo que existe.
const vistas = new Set();
const unicas = violaciones.filter(v => (vistas.has(v.id) ? false : vistas.add(v.id)));
violaciones.length = 0;
violaciones.push(...unicas);
violaciones.sort((a, b) => a.id.localeCompare(b.id));

const escribir = process.argv.includes('--write');
const podar = process.argv.includes('--prune');

if (escribir) {
  fs.mkdirSync(path.dirname(LISTA), { recursive: true });
  fs.writeFileSync(LISTA, JSON.stringify({
    nota: 'TECHO del grafo de imports (PLAN_REFACTOR RF0). SOLO PUEDE ACHICARSE: agregar una entrada a mano es admitir que el grafo empeoro, y eso no se hace — se arregla el import.',
    tomado: '18/8/2026',
    permitidas: violaciones.map(v => v.id),
  }, null, 2) + '\n');
  console.log(`lista escrita: ${violaciones.length} violaciones de capa`);
  process.exit(0);
}

if (!fs.existsSync(LISTA)) {
  console.error('✗ no existe tools/baseline/layers_whitelist.json — corré: npm run lint:layers -- --write');
  process.exit(1);
}
const lista = JSON.parse(fs.readFileSync(LISTA, 'utf8'));
const permitidas = new Set(lista.permitidas);
const hoy = new Set(violaciones.map(v => v.id));

const nuevas = violaciones.filter(v => !permitidas.has(v.id));
const arregladas = [...permitidas].filter(id => !hoy.has(id));

if (podar) {
  lista.permitidas = lista.permitidas.filter(id => hoy.has(id));
  fs.writeFileSync(LISTA, JSON.stringify(lista, null, 2) + '\n');
  console.log(`lista achicada: ${arregladas.length} fuera, quedan ${lista.permitidas.length}`);
  process.exit(0);
}

// resumen por tipo: es lo que hace legible el avance entre fases
const porMotivo = {};
for (const v of violaciones) porMotivo[v.motivo] = (porMotivo[v.motivo] || 0) + 1;
console.log(`capas: ${violaciones.length} violaciones (techo ${permitidas.size})`);
for (const [k, n] of Object.entries(porMotivo).sort((a, b) => b[1] - a[1])) console.log(`   ${String(n).padStart(3)}  ${k}`);

if (arregladas.length) {
  console.log(`\n   ↓ ${arregladas.length} ya no existe(n) — achicá el techo con: npm run lint:layers -- --prune`);
  arregladas.slice(0, 10).forEach(id => console.log('     ' + id));
}
if (nuevas.length) {
  console.error(`\n✗ ${nuevas.length} VIOLACION(ES) NUEVA(S) — el grafo empeoro:`);
  nuevas.forEach(v => console.error(`     ${v.id}   (${v.motivo})`));
  console.error('\n  No agregues la entrada a la lista: arreglá el import. La lista solo se achica.');
  process.exit(1);
}
console.log('\nLINT CAPAS: OK (nada nuevo)');
