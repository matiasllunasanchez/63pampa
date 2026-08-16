// FIXTURE DE ACEPTACION de LA DESTRUCCION (docs/sistemas/PLAN_DESTRUCCION.md), en el juego real.
//   npm run romper                   ·  ROMPER_SHOTS=/tmp/x npm run romper   (deja capturas)
//
// Cubre D0 (el despiece generalizado) y D1 (la destruccion MUTUA).
//
// LO QUE MIDE Y POR QUE: el criterio de cierre de D0 es "cada tipo se despieza distinto", y eso a
// ojo no se puede afirmar — habria que encontrar un deposito y un helo en la misma corrida,
// matarlos igual y acordarse de como se vio el primero. La sonda __romper() devuelve la foto del
// escombro (cuantos, tamaños, colores, pieza) y aca se comparan los tipos entre si.
//
// El de D1 es distinto: no alcanza con que el objeto explote — los dos destrozos tienen que
// COMPARTIR la escena. Por eso se cuenta el escombro ANTES y DESPUES del choque, y se verifica
// que los pedazos del objeto y los del avion esten vivos AL MISMO TIEMPO.
const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const ROOT = path.join(__dirname, '..');
const OUT = process.env.ROMPER_SHOTS || '';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const errors = [];
let win, fails = 0;
const bad = m => { console.error('   ✗ ' + m); fails++; };
const ok = m => console.log('   ✓ ' + m);
const js = s => win.webContents.executeJavaScript(s);
const romper = (t, imp) => js(`String(window.__romper(${JSON.stringify(t)}, ${JSON.stringify(imp || null)}))`).then(JSON.parse);
const W = () => js('String(window.__wjump())').then(JSON.parse);
const chunks = () => js('String(window.__chdbg())').then(JSON.parse);
async function shot(n) {
  if (!OUT) return;
  await sleep(400);   // ventana oculta: el compositor devuelve el ultimo cuadro que pinto
  fs.writeFileSync(path.join(OUT, n + '.png'), (await win.webContents.capturePage()).toPNG());
}

app.whenReady().then(async () => {
  console.log('\nFIXTURE — LA DESTRUCCION (D0-D1)\n');
  win = new BrowserWindow({ width: 1280, height: 760, show: false, webPreferences: { backgroundThrottling: false } });
  win.webContents.on('console-message', (e, l, m) => { if (l >= 3 && !m.includes('Security Warning')) errors.push(m.slice(0, 300)); });
  win.webContents.on('render-process-gone', (e, d) => errors.push('EL RENDERER MURIO: ' + JSON.stringify(d)));

  // ---------- 1. CADA TIPO SE DESPIEZA DISTINTO (D0) ----------
  console.log('1. el despiece por tipo (D0):');
  await win.loadURL('file://' + path.join(ROOT, 'src', 'index.html') + '?pasada=1&pasillo');
  await sleep(2500);
  for (let i = 0; i < 40; i++) { if ((await W()).state === 'play') break; await sleep(200); }
  if ((await W()).state !== 'play') { console.error('   ✗ no llego a volar el pasillo'); app.exit(1); return; }

  const TIPOS = ['depot', 'tent', 'helo', 'radar', 'bldg', 'jet'];
  const fotos = {};
  for (const t of TIPOS) {
    fotos[t] = await romper(t);
    const f = fotos[t];
    console.log(`   · ${t.padEnd(7)} ${f.n} pedazos ${f.size[0]}-${f.size[1]} · ${f.colores.join(' ')} · ${f.hot} al rojo`
      + `${f.pieza ? ' · pieza ' + f.pieza : ''}${f.bola ? ' · bola ' + f.bola : ' · SIN bola'}`
      + `${f.sec ? ' · ' + f.sec + ' secundarias' : ''}${f.humo ? ' · humo ' + f.humo + 's' : ''}${f.espiral ? ' · cae en espiral' : ''}`);
    await sleep(120);
  }
  // la firma de un tipo: cuantos pedazos, de que colores y cuantos arden. Dos tipos que coincidan
  // en las tres cosas mueren igual, y eso es exactamente lo que el plan §4.2 prohibe.
  // la firma de la MUERTE, no solo del escombro: cuantos pedazos, de que, si arde, si hay bola de
  // fuego, si hay secundarias y si deja columna. Es lo que el criterio de D2 pide que se distinga.
  const firma = f => [f.n, f.colores.join(','), f.hot > 0, f.bola, f.sec, f.humo > 0, f.espiral].join('|');
  const firmas = TIPOS.map(t => firma(fotos[t]));
  const repes = firmas.filter((f, i) => firmas.indexOf(f) !== i);
  if (repes.length) bad(`hay tipos que mueren IGUAL (${repes.length}): la receta se volvio generica`);
  else ok(`los ${TIPOS.length} tipos se despiezan distinto: ${new Set(firmas).size} firmas distintas`);
  // el escombro tiene que ser de lo que estaba hecho: la carpa es lona, no chapa
  if (fotos.tent.colores.some(c => fotos.depot.colores.includes(c)))
    bad('la carpa y el deposito comparten escombro: la lona no puede ser chapa oxidada');
  else ok(`la carpa deja lona (${fotos.tent.colores[0]}) y el deposito chapa quemada (${fotos.depot.colores[0]})`);
  if (fotos.radar.pieza === 'plato' && fotos.helo.pieza === 'rotor')
    ok('las piezas reconocibles salen marcadas: el plato del radar y el rotor del helo');
  else bad(`las piezas especiales no salen (radar ${fotos.radar.pieza}, helo ${fotos.helo.pieza})`);

  // ---------- 1b. EL CARACTER DE CADA MUERTE (D2) ----------
  console.log('\n1b. el caracter de cada muerte (D2):');
  if (fotos.tent.bola) bad('la carpa revienta con bola de fuego: es lona, no combustible');
  else ok('la carpa muere SIN bola de fuego (jirones y polvo)');
  if (fotos.depot.sec >= 3 && fotos.depot.sec <= 5) ok(`el deposito tira ${fotos.depot.sec} secundarias retardadas (pop-pop-pop)`);
  else bad(`las secundarias del deposito son ${fotos.depot.sec} (el plan pide 3-5)`);
  if (fotos.depot.humo && !fotos.jet.humo) ok(`el deposito deja columna de humo ${fotos.depot.humo}s y el jet no deja ninguna`);
  else bad(`la columna no distingue: deposito ${fotos.depot.humo}s, jet ${fotos.jet.humo}s`);
  if (fotos.helo.espiral) ok('el helo cae en DOS ACTOS: el resto se va en espiral y revienta al tocar');
  else bad('el helo no tiene caida en espiral');
  if (fotos.depot.bola > fotos.radar.bola) ok(`la bola escala con lo que muere: deposito ${fotos.depot.bola} vs radar ${fotos.radar.bola}`);
  else bad(`la bola no escala (deposito ${fotos.depot.bola}, radar ${fotos.radar.bola})`);
  await shot('d0_tipos');

  // ---------- 2. LOS RESTOS QUEDAN, Y EL CAP MANDA (D0) ----------
  console.log('\n2. los restos quedan y el cap manda:');
  // "quedan" se mide en el tiempo, no en el instante: se revienta UNA cosa y se mira si sus
  // pedazos siguen ahi un segundo despues, y si llegaron a TOCAR el suelo (que es lo que los
  // separa de una particula — la particula se apaga en el aire, el escombro cae y rebota).
  await romper('depot', { vz: 0 });
  await sleep(1600);   // lo suficiente para que suban, caigan y toquen: el escombro CAE, no se apaga
  let c = await chunks();
  if (c.viejo < 0.7) bad(`el escombro no dura: el pedazo mas viejo tiene ${c.viejo}s`);
  else ok(`el escombro dura: ${c.n} pedazos vivos, el mas viejo de ${c.viejo}s, ${c.suelo} ya en el suelo`);
  if (!c.suelo) bad('ningun pedazo llego al suelo: eso es una particula, no escombro');

  // reventar de mas no puede pasarse del presupuesto
  for (let i = 0; i < 14; i++) await romper('depot');
  c = await chunks();
  if (c.n > c.max) bad(`el cap se rompio: ${c.n} pedazos vivos con tope ${c.max}`);
  else ok(`14 despieces seguidos y el cap aguanta: ${c.n} vivos de ${c.max}`);
  await shot('d0_cap');

  // ---------- 3. LA DESTRUCCION MUTUA (D1) ----------
  // El pedido central: hasta ahora, chocar contra un deposito te mataba a vos y el objeto quedaba
  // INTACTO mirando tus pedazos pasar.
  console.log('\n3. la destruccion MUTUA (D1):');
  // los colores del escombro delatan de QUE hay restos: el fuselaje del avion (AVION) y la chapa
  // o la lona del objeto. Que convivan es, literalmente, el pedido central del plan.
  const AVION = ['#93a7ab', '#4c5b60', '#cfe8f2'];
  // `letal` = lo que el juego decide HOY, y D1 no lo toca (§4.1): el deposito y el antiaereo alto
  // derriban; la carpa es lona y se atraviesa. Las tres se tienen que ROMPER igual.
  for (const [tipo, letal] of [['depot', true], ['aa', true], ['tent', false]]) {
    await win.loadURL('file://' + path.join(ROOT, 'src', 'index.html') + '?pasada=1&pasillo');
    await sleep(2200);
    for (let i = 0; i < 40; i++) { if ((await W()).state === 'play') break; await sleep(200); }
    await js(`String(window.__chocar(${JSON.stringify(tipo)}))`);
    // el choque se resuelve solo, en la colision de siempre: solo hay que esperarlo. La ventana es
    // CORTA y fija a proposito — el objeto esta a 8 m y cierra en centesimas, asi que esperar mas
    // no agrega informacion y sí ensucia: seguir volando termina chocando algo REAL del pasillo, y
    // esa muerte ajena se leia como si la carpa hubiera empezado a matar.
    await sleep(450);
    const muerto = (await W()).state !== 'play';
    const cc = await chunks();
    const delAvion = cc.colores.filter(x => AVION.includes(x)).length;
    const delObj = cc.colores.filter(x => !AVION.includes(x)).length;
    if (muerto !== letal) bad(`la letalidad del ${tipo} cambio (murio=${muerto}, tiene que ser ${letal}) — D1 es visual (§4.1)`);
    else ok(`${tipo}: la letalidad no cambio (${letal ? 'derriba' : 'se atraviesa'})`);
    if (!delObj) bad(`  el ${tipo} no dejo escombro: quedo intacto`);
    else if (letal && !delAvion) bad('  falta el escombro del avion: los dos destrozos tienen que convivir');
    else ok(`  ${cc.n} pedazos vivos — ${delObj} colores del objeto${letal ? ` + ${delAvion} del avion, entremezclados` : ''}`);
    if (tipo === 'depot') await shot('d1_choque_depot');
    if (tipo === 'tent') await shot('d1_choque_tent');
  }

  // ---------- 4. LAS SEIS MUERTES, EN IMAGEN (D2) ----------
  // El criterio de cierre de D2 es que se distingan SIN leyenda, y eso no lo puede afirmar un
  // numero: quedan las seis capturas, una por tipo, para mirarlas.
  if (OUT) {
    console.log('\n4. capturas de las seis muertes:');
    await win.loadURL('file://' + path.join(ROOT, 'src', 'index.html') + '?pasada=1&pasillo');
    await sleep(2200);
    for (let i = 0; i < 40; i++) { if ((await W()).state === 'play') break; await sleep(200); }
    // GAS SOSTENIDO: sin acelerador el avion se hunde solo, y las capturas salian sobre la pantalla
    // de derribado — con el destrozo del AVION mezclado en cuadro, que es justo lo que aca no se
    // quiere ver: esta seccion tiene que mostrar como muere CADA COSA, no como muere el jugador.
    // la tecla es 'w' (el gas del juego); con la flecha ARRIBA solo se mira hacia arriba y el
    // avion se hundia igual — de ahi las capturas sobre la pantalla de derribado
    const gas = setInterval(() => win.webContents.sendInputEvent({ type: 'keyDown', keyCode: 'w' }), 40);
    for (const t of TIPOS) {
      // si murio en el tramo anterior, se vuelve a empezar: una captura sobre la pantalla de
      // derribado no muestra como muere el objeto, muestra como muere el jugador
      if ((await W()).state !== 'play') {
        await win.loadURL('file://' + path.join(ROOT, 'src', 'index.html') + '?pasada=1&pasillo');
        await sleep(2200);
        for (let i = 0; i < 40; i++) { if ((await W()).state === 'play') break; await sleep(200); }
      }
      // sin impulso hacia adelante y a 42 m: el encuadre donde la muerte entera entra en cuadro.
      // Mas cerca o mas tarde y el avion se le mete adentro — el destrozo tapa la pantalla y deja
      // de poder compararse con los otros, que es para lo que existen estas capturas.
      await romper(t, { vz: 0 });
      await sleep(130);                  // el instante en que la muerte ya se lee y todavia esta ENTERA en cuadro
      await shot('d2_' + t);
      await sleep(1400);                // que el destrozo anterior salga de cuadro antes del proximo
    }
    clearInterval(gas);
    win.webContents.sendInputEvent({ type: 'keyUp', keyCode: 'w' });
    console.log('   · seis capturas en ' + OUT + (((await W()).state === 'play') ? ' — el avion llego vivo al final' : ' — OJO: el avion murio en el medio'));
  }

  console.log('\nconsola: ' + (errors.length ? errors.length + ' error(es)' : 'sin errores'));
  for (const e of errors.slice(0, 8)) console.error('   ' + e);
  console.log(fails || errors.length ? `\nFIXTURE ROMPER: FALLA (${fails})\n` : '\nFIXTURE ROMPER: OK\n');
  app.exit(fails || errors.length ? 1 : 0);
}).catch(e => { console.error('reventó:', e); app.exit(1); });
process.on('unhandledRejection', e => { console.error('REJECTION:', e && e.message); app.exit(1); });
