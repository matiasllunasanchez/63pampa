// FIXTURE DEL SELECTOR DE MISIONES (docs/proyecto/PLAN_MISIONES_FASES.md §1, fase S3).
//   npm run misiones
//
// QUE ES: la red de regresion de la campaña entera, y sale gratis. Recorre TODAS las misiones de
// data/missions.js por la MISMA sonda que aprieta el selector (`__mision`) y de cada una exige
// cuatro cosas:
//
//   1. CARGA        · la mision que se pidio es la que se armo (id, roster, buque, distancia)
//   2. DESPEGA      · el estado llega a 'play' volando de verdad, no se queda en la pista
//   3. SE DIBUJA    · el canvas tiene contenido Y se mueve (el loop no se congelo)
//   4. TERMINA DONDE DICE · llega al CLIMAX QUE DECLARA (`climax` en data/missions.js), y las de
//                     distancia, que no tienen, cierran en el recuento
//
// …y al final, dos cosas del selector como herramienta: que la mision NO ENCADENE la siguiente
// (vuelve al catalogo: S0) y que la corrida no haya dejado rastro en localStorage (S2).
//
// POR QUE ASI: es una interfaz sobre la capa de sondas, como manda la regla de oro de
// COMO_PROBAR §4. El fixture no sabe volar — pide la mision por la puerta del selector y usa
// `__wjump` para saltar al ultimo tramo del pasillo. Si la sonda se rompe, se rompen el selector
// y el fixture a la vez, y este lo grita. El detalle de COMO vuela (y por que no con ?qa ni con
// el gas sostenido) esta arriba de `volar()`.
//
// Corre APARTE de `npm run check` (como caza / chancha / agua): es un minuto largo de juego real.
const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const ROOT = path.join(__dirname, '..');
const OUT = process.env.MISIONES_SHOTS || '';
const sleep = ms => new Promise(r => setTimeout(r, ms));

const errors = [];
let win, fails = 0;
const bad = m => { console.error('   ✗ ' + m); fails++; };
const ok = m => console.log('   ✓ ' + m);
const js = s => win.webContents.executeJavaScript(s);
const estado = async () => JSON.parse(await js('__pausedbg()'));

// el mismo muestreo de canvas del smoke: un hash para ver que SE MUEVE y la cuenta de colores
// para ver que hay algo dibujado. Se copia la idea y no el archivo porque el smoke no exporta.
const PROBE = `(() => {
  const c = document.getElementById('g');
  if (!c) return { error: 'no existe el canvas #g' };
  const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
  let h = 0; const colors = new Set();
  for (let i = 0; i < d.length; i += 4 * 53) {
    const k = (d[i] << 16) | (d[i + 1] << 8) | d[i + 2];
    colors.add(k); h = (Math.imul(h, 31) + k) | 0;
  }
  return { hash: h, colors: colors.size };
})()`;
const canvas = () => js(PROBE);
const foto = () => js('JSON.stringify(Object.fromEntries(Object.keys(localStorage).sort().map(k => [k, localStorage.getItem(k)])))');
async function shot(n) {
  if (!OUT) return;
  fs.writeFileSync(path.join(OUT, 'mis_' + n + '.png'), (await win.webContents.capturePage()).toPNG());
}
const tap = async (k, ms) => {
  win.webContents.sendInputEvent({ type: 'keyDown', keyCode: k });
  await sleep(60);
  win.webContents.sendInputEvent({ type: 'keyUp', keyCode: k });
  await sleep(ms === undefined ? 200 : ms);
};

/** Espera hasta `ms` a que el estado del juego sea uno de `quiere`. Devuelve el estado final. */
async function esperar(quiere, ms) {
  const t0 = Date.now();
  let s = '';
  while (Date.now() - t0 < ms) {
    s = (await estado()).state;
    if (quiere.includes(s)) return s;
    await sleep(150);
  }
  return s;
}

// COMO VUELA EL FIXTURE, que es la parte que hubo que corregir con la primera corrida en rojo:
//
//  · SIN `?qa`. El plan pedia ?qa, pero acorta las misiones al 6% y las dos mas cortas (m1: 2200 m
//    → 132 m) quedan MAS CORTAS QUE LA CARRERA DE DESPEGUE: el objetivo se cumple antes de que el
//    avion termine de levantar, y la mision se cierra sin haber volado. Se usa `__wjump`, que
//    acorta lo mismo pero DESPUES de haber medido el vuelo.
//  · EL GAS SE SUELTA apenas se llega a 'play' y el vuelo se sostiene con sondas (`__czalto` clava
//    la altura y el rumbo, `__czspd` la velocidad). No es comodidad: una tecla sostenida es
//    `anyPress` treinta veces por segundo, y `anyPress` es lo que ADELANTA el recuento y el
//    epilogo — con el gas puesto, la primera corrida atraveso las dos pantallas y termino en el
//    menu antes de que el fixture pudiera mirar. Volando con sondas, las pantallas esperan.
/** UNA mision, de punta a punta. Devuelve true si paso las cuatro exigencias. */
async function volar(m, i) {
  const esperado = m.climax;                     // null = mision de distancia: la cierra el PASILLO
  console.log(`\n${i + 1}. ${m.id}  ${m.name}   (${esperado || 'solo pasillo'})`);
  let bien = true;

  // 1. CARGA — por la misma puerta que el selector
  await js(`__avion(${(i % 4) + 1})`);            // ensuciar: cualquiera MENOS el Skyhawk (indice 0)
  const ficha = JSON.parse(await js(`__mision('${m.id}')`) || 'null');
  if (!ficha) { bad('la sonda __mision no armo la mision'); return false; }
  if (ficha.id !== m.id) { bad(`se pidio ${m.id} y se cargo ${ficha.id}`); bien = false; }
  else if (ficha.climax !== esperado) { bad(`declara climax ${esperado} y la sonda dice ${ficha.climax}`); bien = false; }
  else if (!ficha.roster || !ficha.vidas) { bad('la mision suelta se armo SIN escuadron'); bien = false; }
  else ok(`carga: ${ficha.buque} · ${ficha.obj} m · escuadron de ${ficha.vidas}`);

  // 1b. EL AVION — la mision de campaña se vuela en A-4B venga por la puerta que venga. La sonda
  // ensucia la eleccion ANTES de abrirla: sin eso esto saldria verde por el default del carrusel
  // y no probaria que el selector la pisa, que es justo lo que se vino a arreglar.
  if (ficha.avion !== 'sky') { bad(`se armo con ${ficha.avion} y la campaña vuela SKYHAWK`); bien = false; }
  else ok('vuela el A-4B aunque venga elegido otro avion');

  // 2. DESPEGA — el gas, solo hasta estar en el aire
  const gas = setInterval(() => win.webContents.sendInputEvent({ type: 'keyDown', keyCode: 'w' }), 40);
  const enVuelo = await esperar(['play'], 15000);
  clearInterval(gas);
  win.webContents.sendInputEvent({ type: 'keyUp', keyCode: 'w' });
  if (enVuelo !== 'play') { bad(`no llego a volar (quedo en '${enVuelo}')`); return false; }
  await js('__czalto(9); __czspd(74)');            // vuelo nivelado sin tocar una tecla
  ok('despega y vuela');

  // 3. SE DIBUJA — con contenido y en movimiento, con la mision entera en pantalla
  const a = await canvas();
  await sleep(600);
  const b = await canvas();
  if (a.error) { bad(a.error); bien = false; }
  else if (a.colors < 8) { bad(`canvas casi plano (${a.colors} colores)`); bien = false; }
  else if (a.hash === b.hash) { bad('el canvas NO cambia entre cuadros: el render se congelo'); bien = false; }
  else ok(`se dibuja y se mueve (${a.colors} colores)`);
  await shot(m.id);

  // 4. TERMINA DONDE DICE — el salto al ultimo tramo y a ver por que puerta sale.
  // Se despeja el pasillo antes de saltar: lo que esta red cuida es que la mision CARGUE, VUELE,
  // SE DIBUJE y DESEMBOQUE donde dice — no que se sobreviva. Una fragata en el carril la pondria
  // en rojo por una razon que no tiene nada que ver con lo que guarda.
  await js('__chacalma()');
  await js('__wjump(0.97)');
  const fin = await esperar(esperado ? [esperado, 'results', 'dead'] : ['results', 'dead'], 25000);
  if (esperado && fin === esperado) ok(`llega al climax que declara: ${esperado.toUpperCase()}`);
  else if (!esperado && fin === 'results') ok('cierra en el recuento (no tiene climax que jugar)');
  else { bad(`termino en '${fin}' y esperaba '${esperado || 'results'}'`); bien = false; }
  if (fin === esperado) await shot(m.id + '_climax');
  await js('__czalto(null); __czspd(null)');       // las sondas pegajosas no se llevan a la que sigue
  return bien;
}

app.whenReady().then(async () => {
  console.log('\nFIXTURE — EL SELECTOR DE MISIONES (S3): la campaña entera, mision por mision\n');
  win = new BrowserWindow({ width: 1000, height: 640, show: false, webPreferences: { backgroundThrottling: false } });
  win.webContents.on('console-message', (e, l, m) => { if (l >= 3 && !m.includes('Security Warning')) errors.push(m.slice(0, 300)); });
  win.webContents.on('render-process-gone', (e, d) => errors.push('EL RENDERER MURIO: ' + JSON.stringify(d)));

  await win.loadURL('file://' + path.join(ROOT, 'src', 'index.html'));
  await sleep(2600);
  if (!await js('typeof window.__mision === "function"')) {
    console.error('   ✗ la sonda __mision no existe: sin ella no hay selector que probar');
    app.exit(1); return;
  }
  // el perfil ANTES de tocar nada: la higiene de S2 se mide contra esta foto
  const antes = await foto();

  // LA LISTA sale del juego, no de una copia: agregar una mision la mete en el fixture sola, que
  // es lo que hace que esta red aguante el remapeo 12→14 sin que nadie se acuerde de actualizarla.
  const MIS = JSON.parse(await js(`JSON.stringify(window.__misiones ? JSON.parse(window.__misiones()) : [])`));
  if (!MIS.length) { console.error('   ✗ la sonda __misiones no devolvio la campaña'); app.exit(1); return; }
  console.log(`la campaña son ${MIS.length} misiones\n`);

  const malas = [];
  for (let i = 0; i < MIS.length; i++) if (!await volar(MIS[i], i)) malas.push(MIS[i].id);

  // ---------- EL SELECTOR COMO HERRAMIENTA (S0 y S2) ----------
  console.log('\nel selector, como herramienta:');
  // NO ENCADENA (S0) — y se entra POR LA PANTALLA (S1), no por la sonda: es el unico tramo donde
  // el fixture aprieta lo que aprieta una persona (bajar hasta la fila MISIONES, ENTER, elegir la
  // primera mision), y por eso es el que puede afirmar que la fila existe y que la salida de la
  // mision vuelve AL SELECTOR — no al menu principal, que es a donde vuelve la sonda por URL.
  // se vuelve a cargar el juego: la ultima mision quedo adentro de su climax, y este tramo tiene
  // que empezar donde empieza una persona — en la portada.
  await win.reload(); await sleep(2600);
  await tap('Return', 400);                                     // portada → menu
  let fila = '';
  for (let i = 0; i < 8; i++) { fila = (await estado()).modo; if (fila === 'misiones') break; await tap('Down'); }
  if (fila !== 'misiones') bad('no hay fila MISIONES en el menu principal');
  await tap('Return', 400);
  if ((await estado()).state !== 'misiones') bad('ENTER en la fila no abre el selector');
  else ok('la fila MISIONES abre el selector');
  await tap('Return', 600);                                     // la primera mision de la lista
  const gas = setInterval(() => win.webContents.sendInputEvent({ type: 'keyDown', keyCode: 'w' }), 40);
  await esperar(['play'], 15000);
  clearInterval(gas);
  win.webContents.sendInputEvent({ type: 'keyUp', keyCode: 'w' });
  await js('__czalto(9); __czspd(74); __chacalma()');
  await js('__wjump(0.999)');
  await esperar(['results', 'dead'], 20000);
  await js('__czalto(null); __czspd(null)');
  let salida = '';
  for (let i = 0; i < 30; i++) {
    salida = (await estado()).state;
    if (salida === 'misiones' || salida === 'modeselect' || salida === 'brief' || salida === 'menu') break;
    await tap('Return', 320);
  }
  if (salida === 'misiones') ok('al terminar vuelve AL SELECTOR (no encadena la siguiente)');
  else if (salida === 'brief' || salida === 'menu') bad(`al terminar encadeno la mision siguiente (estado '${salida}')`);
  else bad(`al terminar no volvio al selector: quedo en '${salida}'`);

  const despues = await foto();
  if (despues === antes) ok('no dejo rastro: localStorage identico a como estaba');
  else bad('la corrida ESCRIBIO en localStorage:\n     antes:   ' + antes + '\n     despues: ' + despues);

  // ---------- CONSOLA ----------
  console.log('\nconsola:');
  if (errors.length) { bad(`${errors.length} error(es):`); errors.slice(0, 8).forEach(e => console.error('     ' + e)); }
  else ok('sin errores en toda la campaña');

  if (malas.length) console.error(`\nMISIONES CON FALLAS: ${malas.join(', ')}`);
  console.log(fails ? `\nMISIONES: ${fails} FALLA(S)\n` : '\nMISIONES: OK\n');
  app.exit(fails ? 1 : 0);
});
