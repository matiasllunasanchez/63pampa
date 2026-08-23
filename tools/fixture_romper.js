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
const romper = (t, imp, d) => js(`String(window.__romper(${JSON.stringify(t)}, ${JSON.stringify(imp || null)}, ${d || 0}))`).then(JSON.parse);
const W = () => js('String(window.__wjump())').then(JSON.parse);
const chunks = () => js('String(window.__chdbg())').then(JSON.parse);
async function shot(n, espera) {
  if (!OUT) return;
  // ventana oculta: el compositor devuelve el ultimo cuadro que pinto, asi que hay que darle aire.
  // Para lo que dura decimas (la onda expansiva) se acorta la espera a proposito: mas vale un
  // cuadro de hace 100 ms con el anillo abierto que uno fresco con el anillo ya apagado.
  await sleep(espera === undefined ? 400 : espera);
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
  //
  // LA MEDICION SE HACE A RAS Y LEJOS, y hay una razon de mundo detras de cada mitad:
  //   · A RAS porque el escombro tiene que TOCAR. La sonda planta el destrozo a la altura a la que
  //     vas volando, y desde 30 m un pedazo tarda mas de un segundo en llegar al piso — llegaba
  //     tarde y el test decia "esto es una particula" mirando pedazos que todavia caian.
  //   · LEJOS porque el mundo SIGUE AVANZANDO. Los restos quedan atras a 100 m/s y se podan al
  //     salir del cuadro (z < 2), que es lo correcto: quedarse no significa acompañarte. Plantado
  //     a 42 m, el pedazo mas viejo posible dura 0,4 s y el test pedia 0,7.
  await js('__seaput(2)');
  await romper('depot', { vz: 0 }, 150);
  await sleep(1100);   // lo suficiente para que suban, caigan y toquen: el escombro CAE, no se apaga
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

  // ---------- 3b. LA ONDA Y EL GOLPE (D3) ----------
  // El criterio de cierre, literal: la explosion de un deposito al lado tuyo se SIENTE distinta a
  // una a 300 m. "Sentir" aca tiene dos numeros: cuanto sacude la camara y cuanto encandila.
  console.log('\n3b. la onda y el golpe (D3):');
  await win.loadURL('file://' + path.join(ROOT, 'src', 'index.html') + '?pasada=1&pasillo');
  await sleep(2200);
  for (let i = 0; i < 40; i++) { if ((await W()).state === 'play') break; await sleep(200); }
  const pegado = await romper('depot', { vz: 0 }, 12);
  await sleep(400);
  const lejos = await romper('depot', { vz: 0 }, 300);
  console.log(`   · a ${pegado.d} m: sacudon ${pegado.shake} · fogonazo ${pegado.flash}`);
  console.log(`   · a ${lejos.d} m: sacudon ${lejos.shake} · fogonazo ${lejos.flash}`);
  if (pegado.shake > lejos.shake * 3 && pegado.flash > 0.3)
    ok('la misma explosion se SIENTE distinta segun donde reviente');
  else bad(`la distancia no cambia el golpe (cerca ${pegado.shake}/${pegado.flash}, lejos ${lejos.shake}/${lejos.flash})`);
  if (lejos.shake < 0.5 && lejos.flash < 0.05) ok('a 300 m se ve pero no se siente: ni sacudon ni fogonazo');
  else bad(`a 300 m todavia te sacude (${lejos.shake}) o te encandila (${lejos.flash})`);
  if (pegado.onda === 1) ok('la explosion grande manda su onda expansiva');
  else bad(`la onda no salio (${pegado.onda})`);
  // y la onda EMPUJA lo que agarra adentro
  {
    await romper('bldg', { vz: 0 }, 14);      // escombro sembrado alrededor
    const antes = JSON.parse(await js('String(window.__chdbg())'));
    await romper('depot', { vz: 0 }, 14);     // y encima, la detonacion grande
    const post = JSON.parse(await js('String(window.__chdbg())'));
    if (post.vmax > antes.vmax) ok(`la onda EMPUJA el escombro cercano: velocidad maxima ${antes.vmax} → ${post.vmax}`);
    else bad(`la onda no empujo nada (${antes.vmax} → ${post.vmax})`);
  }
  // la onda dura medio segundo: la foto va PEGADA a la explosion o no queda nada que ver
  await romper('depot', { vz: 0 }, 30);
  await shot('d3_onda', 120);

  // ---------- 3c. EL ENCADENAMIENTO (D4) ----------
  // El criterio: deposito entre dos carpas → cadena de 3, con retardos legibles, y NUNCA cascadas
  // infinitas.
  console.log('\n3c. el encadenamiento (D4):');
  await win.loadURL('file://' + path.join(ROOT, 'src', 'index.html') + '?pasada=1&pasillo');
  await sleep(2200);
  for (let i = 0; i < 40; i++) { if ((await W()).state === 'play') break; await sleep(200); }
  // gas sostenido: sin el, la captura de la cadena sale sobre la pantalla de derribado
  const gas4 = setInterval(() => win.webContents.sendInputEvent({ type: 'keyDown', keyCode: 'w' }), 260);
  await js('String(window.__cadena(10))');
  await sleep(560);            // el instante en que la 2ª carpa ya prendio y la 1ª todavia arde
  await shot('d4_cadena', 150);
  await sleep(1100);
  const cad = JSON.parse(await js('String(window.__muertes())'));
  console.log('   · ' + cad.map(m => `${m.tipo}@${m.t}s(salto ${m.depth})`).join(' → '));
  if (cad.length === 3) ok(`cadena de ${cad.length}: el deposito prendio las dos carpas`);
  else bad(`la cadena dio ${cad.length} muertes (se esperaban 3)`);
  if (cad.length >= 2) {
    // dos medidas distintas: cuanto tarda cada victima DESDE el disparador (el retardo del plan) y
    // cuanto se separan entre si (que es lo que hace que se lean como tres golpes y no como uno)
    const desde = cad.slice(1).map(m => +(m.t - cad[0].t).toFixed(2));
    const entre = cad.slice(1).map((m, i) => +(m.t - cad[i].t).toFixed(2)).slice(1);
    if (desde.every(d => d >= 0.2 && d <= 1.4))
      ok(`los retardos se leen: ${desde.map(d => d + 's').join(' y ')} despues del disparador`);
    else bad(`retardos ilegibles: ${desde.join(', ')} (tienen que estar entre 0.2 y 1.4 s)`);
    if (entre.every(d => d >= 0.12))
      ok(`las victimas caen escalonadas: ${entre.map(d => d + 's').join(', ')} entre una y otra`);
    else bad(`dos victimas caen juntas (${entre.join(', ')}): la cadena suena a una sola explosion`);
    if (Math.max(...cad.map(m => m.depth)) <= 2) ok(`la profundidad esta acotada: ${Math.max(...cad.map(m => m.depth))} saltos`);
    else bad('la cadena paso los 2 saltos');
  }
  // FUERA DE RADIO: lo que esta lejos no se prende. Es la otra mitad del criterio — una cadena que
  // agarra todo no es una cadena, es un incendio.
  await js('String(window.__cadena(40))');
  await sleep(1600);
  clearInterval(gas4);
  win.webContents.sendInputEvent({ type: 'keyUp', keyCode: 'w' });
  const lejos2 = JSON.parse(await js('String(window.__muertes())'));
  if (lejos2.length === 1) ok('a 40 m las carpas NO se prenden: el radio manda');
  else bad(`la cadena alcanzo a ${lejos2.length - 1} vecinos fuera de radio`);

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

  // ---------- 5. EL PRESUPUESTO (D5) ----------
  // El criterio: 60 fps sostenidos en la mision mas densa con 3 muertes encadenadas en pantalla.
  // Se mide con el rAF de la propia pagina (ve TODOS los cuadros); desde afuera, muestreando, se
  // perderia justo el pico que interesa.
  console.log('\n5. el presupuesto (D5) — mision 9, la mas densa:');
  await win.loadURL('file://' + path.join(ROOT, 'src', 'index.html') + '?pasada=9&pasillo');
  await sleep(2500);
  for (let i = 0; i < 40; i++) { if ((await W()).state === 'play') break; await sleep(200); }
  const FPS = `(() => { window.__fps = []; let last = performance.now();
    const loop = () => { const n = performance.now(); window.__fps.push(n - last); last = n;
      if (window.__fps.length < 400) requestAnimationFrame(loop); };
    requestAnimationFrame(loop); return 'ok'; })()`;
  await js(FPS);
  await sleep(300);
  const gas5 = setInterval(() => win.webContents.sendInputEvent({ type: 'keyDown', keyCode: 'w' }), 260);
  // el PICO se muestrea mientras las cadenas estan vivas: medirlo al final da cero, porque el
  // mundo ya se llevo el destrozo por detras del avion
  let budget = { parts: 0, chunks: 0, sec: 0, humo: 0 };
  for (let k = 0; k < 3; k++) {
    await js('String(window.__cadena(10))');
    for (let m = 0; m < 4; m++) {
      await sleep(170);
      const b = JSON.parse(await js('String(window.__pdbg2())'));
      for (const key of Object.keys(budget)) budget[key] = Math.max(budget[key], b[key]);
    }
  }
  clearInterval(gas5);
  win.webContents.sendInputEvent({ type: 'keyUp', keyCode: 'w' });
  const ch5 = { n: budget.chunks, max: (await chunks()).max };
  const dts = JSON.parse(await js('JSON.stringify(window.__fps.slice(20))'));
  dts.sort((a, b) => a - b);
  const med = dts[dts.length >> 1];
  const p95 = dts[Math.floor(dts.length * 0.95)];
  const lentos = dts.filter(d => d > 20).length;
  console.log(`   · ${dts.length} cuadros · mediana ${med.toFixed(1)} ms (${(1000 / med) | 0} fps) · p95 ${p95.toFixed(1)} ms · ${lentos} por encima de 20 ms`);
  console.log(`   · PICO de poblacion: ${budget.parts} particulas · ${budget.chunks} pedazos · ${budget.sec} secundarias · ${budget.humo} columnas`);
  if (med <= 18) ok(`60 fps sostenidos con tres cadenas encima (mediana ${med.toFixed(1)} ms)`);
  else bad(`se cae de 60 fps: mediana ${med.toFixed(1)} ms`);
  if (lentos / dts.length < 0.05) ok(`sin tirones: ${lentos} de ${dts.length} cuadros por encima de 20 ms`);
  else bad(`${lentos} cuadros lentos de ${dts.length}: hay tirones`);
  if (budget.parts <= 300 && ch5.n <= ch5.max) ok(`el presupuesto aguanta: ${budget.parts} particulas y ${ch5.n}/${ch5.max} pedazos`);
  else bad(`presupuesto excedido: ${budget.parts} particulas, ${ch5.n}/${ch5.max} pedazos`);
  await shot('d5_denso');

  // ---------- 6. LAS VARIANTES DEL AIRE (v2 · V1) ----------
  // EL CRITERIO ES EL §1 DEL PLAN: una variante se distingue por la SILUETA y por el TIEMPO, nunca
  // solo por el color. Lo que se mide, entonces, es lo unico que sobrevive a una captura en blanco
  // y negro: CUANTOS PEDAZOS GRANDES quedan y QUE HACEN. El color no entra en ninguna afirmacion
  // de esta seccion, a proposito.
  console.log('\n6. las cuatro muertes del aire (v2 V1):');
  // la MISMA puerta que el resto del fixture (`?pasada=1&pasillo`): `?patria` cae en el menu de
  // modos, y ahi las muertes ocurren en un mundo que nadie esta dibujando. Los numeros salian
  // bien igual —la sonda mide lo que se creo, no lo que se ve— pero medir en una pantalla que no
  // es la del juego es exactamente como se cuela una afirmacion que no vale.
  await win.loadURL('file://' + path.join(ROOT, 'src', 'index.html') + '?pasada=1&pasillo');
  await sleep(2500);
  for (let i = 0; i < 40; i++) { if ((await W()).state === 'play') break; await sleep(200); }
  const gas6 = setInterval(() => win.webContents.sendInputEvent({ type: 'keyDown', keyCode: 'w' }), 60);
  await sleep(1600); clearInterval(gas6);
  win.webContents.sendInputEvent({ type: 'keyUp', keyCode: 'w' });

  const V = {};
  for (const id of ['desintegracion', 'ala', 'moribundo', 'partido']) {
    V[id] = JSON.parse(await js(`String(window.__romper('jet', null, 60, ${JSON.stringify(id)}))`));
    await sleep(260);
  }
  for (const [id, r] of Object.entries(V)) {
    console.log(`   · ${id.padEnd(15)} ${String(r.n).padStart(2)} pedazos · ${r.grandes} grande(s) · mayor ${r.mayor} · espiral ${r.espiral} · morib ${r.moribundo} · bola ${r.bola}`);
  }
  // LA FIRMA de cada una, en pedazos grandes: 0 / 1+tirabuzon / 1 entero que se va / 2 que se separan
  const silueta = r => [r.grandes, r.espiral, r.moribundo].join('-');
  const firmasV = Object.fromEntries(Object.entries(V).map(([k, r]) => [k, silueta(r)]));
  const distintas = new Set(Object.values(firmasV)).size;
  if (distintas === 4) ok(`las cuatro tienen firma de silueta distinta: ${Object.entries(firmasV).map(([k, f]) => k + '=' + f).join(' · ')}`);
  else bad(`dos variantes comparten silueta (${distintas} firmas para 4 muertes): ${JSON.stringify(firmasV)}`);
  if (V.desintegracion.grandes === 0 && V.desintegracion.n >= 10)
    ok(`desintegracion no deja NADA grande: ${V.desintegracion.n} pedacitos, mayor ${V.desintegracion.mayor}`);
  else bad(`desintegracion dejo ${V.desintegracion.grandes} pedazo(s) grande(s)`);
  if (V.moribundo.moribundo === 1 && V.moribundo.bola === 0)
    ok('moribundo es el unico que NO revienta donde lo tocaste (sin bola, y se va de largo)');
  else bad(`moribundo: morib=${V.moribundo.moribundo} bola=${V.moribundo.bola}`);
  if (V.ala.espiral === 1 && V.ala.mayor >= 2) ok(`ala: una pieza grande (${V.ala.mayor}) y el resto en tirabuzon`);
  else bad(`ala: mayor=${V.ala.mayor} espiral=${V.ala.espiral}`);
  if (V.partido.grandes === 2 && V.partido.espiral === 0) ok('partido: DOS mitades y ninguna en tirabuzon');
  else bad(`partido: grandes=${V.partido.grandes} espiral=${V.partido.espiral}`);

  // EL TOPE DE LA MUERTE LARGA (§6.2). Es la unica variante que sobrevive a su propio despiece,
  // asi que es la unica que puede acumularse: sin cap, ametrallar una formacion deja el cielo
  // lleno de aviones que se van muriendo para siempre.
  for (let i = 0; i < 6; i++) { await js(`String(window.__romper('jet', null, ${70 + i * 9}, 'moribundo'))`); await sleep(90); }
  const vivosM = JSON.parse(await js(`String(window.__moribundos())`));
  if (vivosM.n <= 2) ok(`el cap del moribundo se cumple: ${vivosM.n} vivos tras pedir 6 (tope 2)`);
  else bad(`cap del moribundo excedido: ${vivosM.n} vivos (tope 2)`);

  // EL SELECTOR: cada arma tiene que tirar para SU lado. Es lo que hace que la variante signifique
  // algo — si el dado mandara solo, el arma dejaria de contar la historia de como moriste.
  const porArma = {};
  for (const k of ['canon', 'misil', 'cadena']) {
    const vs = [];
    for (let i = 0; i < 6; i++) {
      const r = JSON.parse(await js(`String(window.__romper('jet', null, ${210 + i * 7}, null, ${JSON.stringify(k)}))`));
      vs.push(r.variante); await sleep(70);
    }
    porArma[k] = vs;
    console.log(`   · ${k.padEnd(7)} → ${vs.join(' ')}`);
  }
  const soloDe = (arma, ids) => porArma[arma].every(v => ids.includes(v));
  if (soloDe('canon', ['ala', 'moribundo'])) ok('el cañon arranca alas o deja moribundos — nunca desintegra');
  else bad(`el cañon saco variantes que no le corresponden: ${porArma.canon.join(' ')}`);
  if (soloDe('misil', ['desintegracion', 'partido'])) ok('el misil desintegra o parte — nunca deja un ala girando');
  else bad(`el misil saco variantes que no le corresponden: ${porArma.misil.join(' ')}`);
  await shot('v1_variantes');

  // ---------- 4. LOS RESTOS (PLAN_HORNEADO B1) ----------
  // El criterio de cierre de B1 es que "el pasillo detras tuyo es la historia de tu corrida" se
  // VEA. Aca se verifica la mitad que se puede medir: que cada tipo que declara resto lo deje de
  // verdad, que sea el suyo, que no colisione, y que sobreviva a la columna de humo — que es lo
  // que hasta B1 era todo lo que quedaba, y se apagaba a los pocos segundos.
  console.log('\n4. los restos (B1):');
  const antesR = (await chunks()).n;
  // EN TIERRA (m11), no sobre el mar: nueve de los diez restos son cosas que quedan APOYADAS, y
  // sobre agua la foto no dice nada. La barcaza encallada tampoco: encalla en la playa.
  await js(`window.__mision('m11', { aire: true })`);
  await sleep(2200);
  for (let i = 0; i < 30; i++) { if ((await W()).state === 'play') break; await sleep(200); }
  // Y EL AVION CLAVADO A 14 m. Sin esto la prueba termina con "chocaste el terreno": el avion cae
  // solo si nadie le da gas, y lo que hay que ver tarda cuatro segundos en aparecer — los restos
  // salen de abajo de su propia bola de fuego recien cuando el escombro se apaga.
  await js('window.__nivel(14)');
  // Y EL PASILLO AL PASO. Para FOTOGRAFIAR los restos hay que esperar a que el escombro se apague
  // (CHUNK_LIFE son 4 s) — y en 4 s a 90 u/s el mundo se corre 380 unidades, mas que el pasillo
  // entero. Con la velocidad clavada abajo el mundo casi no avanza y las diez carcasas siguen
  // donde se plantaron cuando el humo se va. Se suelta enseguida: lo que se mide despues se mide
  // a velocidad de verdad.
  await js('window.__mset(6)');
  const T = JSON.parse(await js('String(window.__restosTodos(58))'));
  console.log(`   · ${T.n} restos plantados: ` + T.puestos.map(p => p.tipo + '→' + (p.resto || 'NADA')).join(' '));
  console.log(`   · sin resto (y esta bien): ${T.sinResto.join(' ')}`);
  const faltan = T.puestos.filter(p => !p.resto);
  if (!faltan.length) ok(`los ${T.n} tipos con carcasa la dejaron`);
  else bad(`quedaron sin resto: ${faltan.map(p => p.tipo).join(' ')}`);
  // CADA UNO EL SUYO. Un solo resto generico para todo seria mas facil y seria el mismo error que
  // D2 vino a arreglar: si el camion volcado y el deposito quemado son el mismo sprite, el pasillo
  // no cuenta nada.
  const hojas = new Set(T.puestos.map(p => p.resto));
  if (hojas.size === T.n) ok(`${hojas.size} carcasas DISTINTAS: ninguna se repite`);
  else bad(`solo ${hojas.size} carcasas distintas para ${T.n} tipos`);
  if (T.sinResto.length) ok(`y ${T.sinResto.length} tipos NO dejan nada (la ausencia tambien dice algo)`);
  else bad('todos los tipos dejan resto: la ausencia dejo de significar');
  // LA FOTO SE TOMA TARDE A PROPOSITO. Recien plantados, los diez restos estan tapados por su
  // propia bola de fuego y la captura no muestra nada: lo que hay que ver es el pasillo DESPUES,
  // que es justo el momento que B1 inventa.
  await sleep(4600);
  await shot('b1_restos', 260);
  await js('window.__mset(0)');
  // NO ESTORBAN. Un resto es memoria, no obstaculo: si colisionara, romper cosas te iria cerrando
  // el pasillo — el castigo exactamente al reves de lo que corresponde.
  const R0 = JSON.parse(await js('String(window.__restos())'));
  if (!R0.conHp) ok('ninguna carcasa tiene vida ni colisiona: es memoria, no obstaculo');
  else bad(`${R0.conHp} restos con hp: van a chocar contra el avion`);

  // LA CARCASA NO TIENE RELOJ, Y ESA ES LA DIFERENCIA QUE TRAE B1.
  //
  // Ojo con como se enuncia esto, porque la primera version de la prueba estaba mal: decia "el
  // resto dura MAS SEGUNDOS que el humo" y fallaba, con razon. A 79 u/s el pasillo se come 570
  // unidades en 7 s y SPAWN_Z es 320: NADA sobrevive tanto tiempo delante tuyo, ni deberia. Lo
  // que se afirma no es una duracion, es una CAUSA DE MUERTE — la columna se apaga sola aunque
  // la estes mirando; la carcasa solo se va cuando el pasillo la deja atras.
  //
  // Asi que se planta una fila NUEVA bien lejos y se deja correr lo justo para que las columnas
  // cortas (radar 2 s, aa 2,5 s) se apaguen EN CUADRO. Al final tienen que quedar las diez
  // carcasas y menos columnas de las que nacieron.
  // La fila nueva va lo mas lejos que el pasillo admite (SPAWN_Z es 320 y el avion vuela en 14),
  // y se espera lo justo: 2,6 s a ~79 u/s son 205 unidades, asi que las diez siguen en cuadro
  // mientras las columnas cortas —radar 2 s, aa 2,5 s— ya se apagaron.
  const T2 = JSON.parse(await js('String(window.__restosTodos(290))'));
  const H0 = JSON.parse(await js('String(window.__restos())'));
  await sleep(2600);
  const R = JSON.parse(await js('String(window.__restos())'));
  if (R.restos >= T2.n) ok(`las ${T2.n} carcasas siguen enteras 2,6 s despues: no tienen reloj`);
  else bad(`se perdieron carcasas sin que el pasillo las pasara: ${R.restos} de ${T2.n}`);
  if (R.humos < H0.humos) ok(`y ${H0.humos - R.humos} columnas se apagaron solas en el mismo rato (${H0.humos} → ${R.humos})`);
  else bad(`ninguna columna se apago: ${H0.humos} → ${R.humos}`);
  await js('window.__nivel(null)');
  void antesR;

  console.log('\nconsola: ' + (errors.length ? errors.length + ' error(es)' : 'sin errores'));
  for (const e of errors.slice(0, 8)) console.error('   ' + e);
  console.log(fails || errors.length ? `\nFIXTURE ROMPER: FALLA (${fails})\n` : '\nFIXTURE ROMPER: OK\n');
  app.exit(fails || errors.length ? 1 : 0);
}).catch(e => { console.error('reventó:', e); app.exit(1); });
process.on('unhandledRejection', e => { console.error('REJECTION:', e && e.message); app.exit(1); });
