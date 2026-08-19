// FIXTURE DE ACEPTACION de los TRAMOS (docs/sistemas/SPEC_TRAMOS.md §5), corrido en el juego
// de verdad.
//   npm run tramos
//
// LO QUE CUIDA, en el orden del §5:
//   1. SIN TRAMOS, NADA CAMBIA (RF-04) — la regla suprema del spec: `__trdbg` reporta idx null
//      y el sembrador lee el cfg por el camino de siempre.
//   2. LA DENSIDAD ES DEL TRAMO (RF-02) — spawns por kilometro medidos tramo por tramo.
//   3. BIDONES Y FAVOR (RF-02) — que `bidones: false` no deje nacer uno solo, y que `favor`
//      duplique la proporcion del tipo favorecido contra el mismo tramo sin favor.
//   4. LA RADIO, UNA VEZ Y EN ORDEN (RF-03) — y que un salto de sonda no produzca un coro.
//   5. EL VEIL SIGUE MANDANDO (RF-05) — pasado el corte no siembra nadie, diga lo que diga el
//      ultimo tramo.
//   6. CERO ERRORES DE CONSOLA.
//   7. LA MISION PILOTO (T4) — el transito del Narwal en m3, volado de verdad: cero spawns en el
//      tramo mudo, la conversacion en orden, y el mar abierto llegando con densidad plena.
//
// COMO MIDE: entra a una mision por la sonda del selector (`__mision`), le inyecta tramos con
// `__trset` y VUELA — el avion se sostiene con `__czalto`/`__czspd` en vez de con el gas (una
// tecla sostenida es `anyPress` treinta veces por segundo, y eso adelanta las pantallas de fin;
// lo aprendio el fixture del selector). La densidad se mide contando lo que NACE en ventanas de
// la misma duracion y a la misma velocidad: el sembrador cuenta metros volados, asi que a
// velocidad clavada los spawns por ventana son proporcionales a la densidad del tramo.
//
// CORRE SIN `?qa`, y el spec pedia lo contrario (§5). La razon es medida, no de gusto: con `?qa`
// una mision de 2600 m queda en 156, y eso es MENOS que la carrera de despegue y menos que el
// primer intervalo de siembra (`run.nextSpawn` arranca en 320 m). O sea que con el parametro
// puesto una mision de distancia se cumple sola durante el despegue, no llega a haber pasillo, y
// no nace un solo obstaculo ni antes ni despues del corte del VEIL. Todo lo que este fixture
// mide —densidades, bidones, mezcla, radios— seria cero contra cero. Que las FRACCIONES
// sobreviven a la compresion se prueba donde si se puede, en `npm run unit`. Ver la divergencia
// 4 del §8 del spec.
//
// Corre APARTE de `npm run check`, como caza / chancha / agua.
const { app, BrowserWindow } = require('electron');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const sleep = ms => new Promise(r => setTimeout(r, ms));

// UNA PROMESA QUE REVIENTA NO PUEDE COLGAR LA PRUEBA. Sin esto, un `executeJavaScript` que
// falla (por ejemplo, tocando una variable que no es global de la pagina) deja el proceso vivo
// para siempre y la corrida se lee como "tarda mucho" en vez de como "se rompio".
process.on('unhandledRejection', e => { console.error('   ✗ REVENTO: ' + (e && e.message)); app.exit(1); });

const errors = [];
let win, fails = 0;
const bad = m => { console.error('   ✗ ' + m); fails++; };
const ok = m => console.log('   ✓ ' + m);
const js = s => win.webContents.executeJavaScript(s);
const TR = async () => JSON.parse(await js('String(window.__trdbg && window.__trdbg())') || 'null');
const estado = async () => JSON.parse(await js('__pausedbg()'));

/** Entra a una mision por la puerta del selector y la deja volando, nivelada y sin teclas. */
async function volar(id) {
  await js(`__mision('${id}')`);
  const gas = setInterval(() => win.webContents.sendInputEvent({ type: 'keyDown', keyCode: 'w' }), 40);
  let s = '';
  for (let i = 0; i < 90; i++) { s = (await estado()).state; if (s === 'play') break; await sleep(150); }
  clearInterval(gas);
  win.webContents.sendInputEvent({ type: 'keyUp', keyCode: 'w' });
  if (s !== 'play') return false;
  await js('__czalto(9); __czspd(74)');
  return true;
}

const tecla = async k => {
  win.webContents.sendInputEvent({ type: 'keyDown', keyCode: k });
  await sleep(60);
  win.webContents.sendInputEvent({ type: 'keyUp', keyCode: k });
  await sleep(200);
};

/** Se para en la fraccion `p` del pasillo y cuenta QUE NACE durante `ms` de vuelo.
 *
 *  Se cuenta lo que ENTRA al mundo y no lo que hay en pantalla: el mundo tambien se vacia por
 *  detras, asi que la poblacion visible es la resta de dos caudales y el tramo gobierna uno solo.
 *  Devuelve el censo entero — `{ n, tipos }` — para poder mirar el total y un tipo puntual con
 *  la misma medicion. */
async function contar(p, ms, asentar) {
  await js(`__wjump(${p})`);
  // ASENTAR ANTES DE MEDIR. `run.nextSpawn` se descuenta con los metros volados y NO se reinicia
  // al cambiar de tramo: al entrar a uno flojo viniendo de uno denso, el primer spawn ya estaba
  // pago y sale igual. Es correcto en el juego —el mundo no se entera de las fracciones— pero en
  // una ventana chica ese sobrante solo, arrastra la razon. Se le da tiempo a que caiga.
  await sleep(asentar === undefined ? 150 : asentar);
  await js(`__wjump(${p}); __trclear()`);
  // SE VUELVE A SALTAR AL MISMO PUNTO cada pocos decimos: la ventana tiene que quedarse ADENTRO
  // del tramo. Un tramo de 0 a 0.3 en una mision de 2600 m son 780 m, o sea diez segundos de
  // vuelo — una ventana mas larga que eso se pasa al tramo siguiente y termina midiendo los dos
  // mezclados (paso: la medicion del tramo flojo se comio 200 m del denso y la razon se cayo de
  // 6× a 1,9×). El salto no altera lo que se mide: el sembrador cuenta METROS VOLADOS, y volar
  // se sigue volando — lo unico que se congela es en que parte del mapa esta el avion.
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    await sleep(400);
    await js(`__wjump(${p})`);
  }
  return JSON.parse(await js('__trcount()'));
}

app.whenReady().then(async () => {
  console.log('\nFIXTURE — LOS TRAMOS: el guion de spawn por mision (SPEC_TRAMOS)\n');
  win = new BrowserWindow({ width: 1000, height: 640, show: false, webPreferences: { backgroundThrottling: false } });
  win.webContents.on('console-message', (e, l, m) => { if (l >= 3 && !m.includes('Security Warning')) errors.push(m.slice(0, 300)); });
  win.webContents.on('render-process-gone', (e, d) => errors.push('EL RENDERER MURIO: ' + JSON.stringify(d)));
  const cargar = async qs => { await win.loadURL('file://' + path.join(ROOT, 'src', 'index.html') + qs); await sleep(2600); };

  // ================= PRIMERA MITAD: distancias de verdad (pasos 1, 2, 3 y 5) =================
  await cargar('');
  if (!await js('typeof window.__trdbg === "function"')) {
    console.error('   ✗ la sonda __trdbg no existe'); app.exit(1); return;
  }

  // ---------- 1. SIN TRAMOS NO PASA NADA (RF-04, la regla suprema del spec) ----------
  console.log('1. una mision SIN tramos:');
  if (!await volar('m2')) { console.error('   ✗ no se pudo entrar a volar'); app.exit(1); return; }
  const sin = await TR();
  if (sin && sin.idx === null && sin.n === 0) ok('no hay tramo vigente: manda el cfg plano (idx null)');
  else bad(`una mision sin tramos reporta ${JSON.stringify(sin)}`);
  // …y lo que el sembrador va a leer es, literalmente, el cfg de la mision
  const c = (sin && sin.cfg) || {};
  if (sin && sin.obstacles === c.obstacles && sin.bombs === c.bombs && sin.caza === c.caza)
    ok(`los valores resueltos SON los del cfg (obst ${c.obstacles} · bombs ${c.bombs} · caza ${c.caza})`);
  else bad(`sin tramos los valores resueltos no son los del cfg: ${JSON.stringify(sin)}`);

  // ---------- 2. LA DENSIDAD ES DEL TRAMO (RF-02) ----------
  console.log('\n2. la densidad la manda el tramo:');
  const errs = JSON.parse(await js(`__trset(${JSON.stringify([
    { hasta: 0.3, obstacles: 0.3 }, { hasta: 1, obstacles: 1.8 },
  ])})`));
  if (errs.length) bad('el validador rechazo los tramos de prueba: ' + errs.join(' · '));
  // EL DENSO PRIMERO Y EL FLOJO DESPUES, a proposito: el intervalo de siembra se acorta con
  // `run.t`, asi que la segunda ventana esta favorecida. Midiendo en este orden el sesgo juega
  // EN CONTRA de la afirmacion — si igual da 3×, es que da 3×.
  const denso = (await contar(0.35, 10000, 2500)).n;
  const flojo = (await contar(0.02, 10000, 2500)).n;
  const raz = flojo ? +(denso / flojo).toFixed(2) : Infinity;
  console.log(`   tramo denso (1.8): ${denso} spawns · tramo flojo (0.3): ${flojo} · razon ${raz}×`);
  if (denso >= flojo * 3) ok('el tramo denso siembra al menos 3× lo que el flojo (CA del RF-02)');
  else bad(`la razon entre tramos es ${raz}× y el CA pide ≥3×`);
  await js('__wjump(0.1)');
  const enFlojo = await TR();
  if (enFlojo.idx === 0 && enFlojo.obstacles === 0.3) ok('la sonda ve el tramo 0 con su densidad resuelta');
  else bad(`en el primer tramo la sonda reporta ${JSON.stringify({ idx: enFlojo.idx, obstacles: enFlojo.obstacles })}`);

  // ---------- 3. BIDONES Y FAVOR (RF-02) ----------
  console.log('\n3. los bidones cortados:');
  await js('__chafuel(1)');                       // el combustible prendido, por la sonda que ya existe
  await js(`__trset(${JSON.stringify([{ hasta: 0.5, obstacles: 2.5, bidones: false }, { hasta: 1, obstacles: 2.5 }])})`);
  const cortado = await contar(0.02, 7000);
  const libre = await contar(0.5, 7000);
  console.log(`   con bidones:false nacieron ${cortado.tipos.fuel || 0} bidones de ${cortado.n} · sin la llave, ${libre.tipos.fuel || 0} de ${libre.n}`);
  if (!cortado.tipos.fuel) ok('con `bidones: false` no nace un solo bidon en el tramo');
  else bad(`nacieron ${cortado.tipos.fuel} bidones en un tramo que los tiene cortados`);
  if (libre.tipos.fuel > 0) ok('y en el tramo de al lado siguen naciendo: la llave es del TRAMO, no del mapa');
  else bad('no nacio ningun bidon en NINGUN tramo: la medicion no prueba nada');

  // FAVOR: el mismo tramo medido dos veces, con y sin la lista. Densidad alta a proposito — lo
  // que se mide es una PROPORCION y con veinte spawns por ventana el ruido se come la señal.
  console.log('\n   la mezcla inclinada (favor):');
  await js(`__trset(${JSON.stringify([{ hasta: 1, obstacles: 6 }])})`);
  const nf = await contar(0.05, 10000);
  await js(`__trset(${JSON.stringify([{ hasta: 1, obstacles: 6, favor: ['jet'] }])})`);
  const cf = await contar(0.05, 10000);
  const pSin = nf.n ? (nf.tipos.jet || 0) / nf.n : 0;
  const pCon = cf.n ? (cf.tipos.jet || 0) / cf.n : 0;
  // EL TECHO DEL RE-SORTEO ES CONOCIDO: con dos sorteos un tipo de probabilidad p pasa a
  // p·(2−p), o sea que la ganancia NO puede pasar de (2−p) por mucho que se insista. Se afirma
  // contra esa teoria y no contra un numero redondo — ver la divergencia 3 del §8 del spec.
  const techo = +(2 - pSin).toFixed(2);
  console.log(`   cazas sin favor: ${(pSin * 100).toFixed(1)}% de ${nf.n} · con favor: ${(pCon * 100).toFixed(1)}% de ${cf.n} · ganancia ${pSin ? (pCon / pSin).toFixed(2) : '—'}× (techo teorico ${techo}×)`);
  if (pSin > 0 && pCon / pSin >= 1.5) ok(`\`favor\` inclina la mezcla cerca de su techo (${(pCon / pSin).toFixed(2)}× de ${techo}× posible)`);
  else bad(`la proporcion paso de ${(pSin * 100).toFixed(1)}% a ${(pCon * 100).toFixed(1)}%: el re-sorteo no esta inclinando nada`);

  // ---------- 5. EL VEIL SIGUE MANDANDO (RF-05) ----------
  console.log('\n5. el cordon final (con distancias de verdad):');
  await js(`__trset(${JSON.stringify([{ hasta: 1, obstacles: 2.5 }])})`);
  const antes = (await contar(0.3, 4000)).n;
  const dentro = (await contar(0.8, 4000)).n;
  console.log(`   antes del corte: ${antes} spawns · pasado el corte: ${dentro}`);
  if (dentro === 0 && antes > 0) ok('pasado el corte no siembra nadie, diga lo que diga el ultimo tramo');
  else bad(`el VEIL no manda: ${antes} spawns antes y ${dentro} despues del corte`);

  // ---------- 4. LA RADIO: UNA VEZ, EN ORDEN, SIN CORO (RF-03) ----------
  // Se camina el pasillo A SALTOS, un tramo por vez, en vez de volarlo entero: son 2600 m a 74
  // m/s, medio minuto de espera para mirar cuatro popups. Y el salto no es una trampa — es el
  // MISMO mecanismo que el RF-03 tiene que aguantar (entrar a un tramo y que suene su linea, una
  // sola vez), solo que sin el relleno.
  console.log('\n4. la radio del tramo:');
  if (!await volar('m2')) { console.error('   ✗ no se pudo entrar a volar'); app.exit(1); return; }
  const RADIOS = ['m4_radio1', 'm4_radio2', 'm4_radio3', 'm4_radio4'];
  await js(`__trset(${JSON.stringify([
    { hasta: 0.25, radio: RADIOS[0] }, { hasta: 0.5, radio: RADIOS[1] },
    { hasta: 0.7, radio: RADIOS[2] }, { hasta: 1, obstacles: 1 },
  ])})`);
  await js('__seapop()');
  let vistas = [];
  for (const p of [0.05, 0.3, 0.55, 0.8]) {
    await js(`__wjump(${p})`);
    await sleep(350);
    const t = JSON.parse(await js('__seapop()'));
    if (t) vistas.push(t);
  }
  const orden = (await TR()).dichas;
  console.log(`   sonaron: ${orden.join(' → ') || '(nada)'}`);
  console.log(`   en pantalla: ${vistas.join('  ·  ') || '(nada)'}`);
  if (orden.length === 3 && orden.every((k, i) => k === RADIOS[i]))
    ok('una radio por tramo que la declara, en orden, y ninguna del tramo que no trae');
  else bad(`las radios sonaron mal: ${JSON.stringify(orden)}`);
  if (orden.length === new Set(orden).size) ok('ninguna sono dos veces');
  else bad('alguna radio sono mas de una vez');
  // …y que la linea llegue A LA PANTALLA, no solo a la lista interna: el bug clasico de este
  // repo es probar el mecanismo sin mirar nunca lo que ve el jugador.
  if (vistas.length === 3 && vistas.every(v => v && v.length > 10)) ok('las tres llegaron al popup, con texto de verdad');
  else bad(`en pantalla se vieron ${vistas.length} lineas: ${JSON.stringify(vistas)}`);

  // EL SALTO NO PRODUCE UN CORO: de golpe al 90%, suena SOLO la del tramo vigente.
  await volar('m2');
  await js(`__trset(${JSON.stringify([
    { hasta: 0.25, radio: RADIOS[0] }, { hasta: 0.5, radio: RADIOS[1] },
    { hasta: 0.75, radio: RADIOS[2] }, { hasta: 1, radio: RADIOS[3] },
  ])})`);
  await js('__seapop()');
  await js('__wjump(0.9)');
  await sleep(500);
  const tras = (await TR()).dichas;
  if (tras.length === 1 && tras[0] === RADIOS[3]) ok('un __wjump(0.9) dispara SOLO la del tramo vigente, no la cola entera');
  else bad(`tras el salto sonaron ${JSON.stringify(tras)} y tenia que sonar solo la ultima`);

  // …Y NO SUENA FUERA DEL VUELO (RF-03): en pausa, el cambio de tramo espera. Se comprueba
  // pausando, saltando de tramo, y mirando que no haya sonado hasta despausar.
  await volar('m2');
  await js(`__trset(${JSON.stringify([{ hasta: 0.5, obstacles: 1 }, { hasta: 1, radio: RADIOS[0] }])})`);
  await tecla('Escape');                               // pausa
  await js('__wjump(0.8)');
  await sleep(400);
  const enPausa = (await TR()).dichas.length;
  await tecla('Escape');                               // y de vuelta al vuelo
  await sleep(400);
  const trasPausa = (await TR()).dichas;
  if (enPausa === 0 && trasPausa.length === 1) ok('el cambio de tramo en PAUSA no habla: la linea espera al vuelo');
  else bad(`en pausa sonaron ${enPausa} lineas y al volver ${trasPausa.length} (tenia que ser 0 y 1)`);

  // ---------- 7. LA MISION PILOTO: EL TRANSITO DEL NARWAL (T4) ----------
  // Esta no inyecta nada: vuela m3 con LOS TRAMOS QUE TRAE LA MISION. Es la unica parte del
  // fixture que prueba el DATO y no el motor, y es la que contesta la pregunta del guion —
  // "sin un solo enemigo en pantalla" — con un numero.
  console.log('\n7. la mision piloto — el transito del Narwal (m3):');
  if (!await volar('m3')) { console.error('   ✗ no se pudo entrar a volar m3'); app.exit(1); return; }
  const t0 = await TR();
  if (t0.n === 5 && t0.idx === 0) ok(`m3 trae ${t0.n} tramos y arranca en el primero`);
  else bad(`m3 reporta ${t0.n} tramos, vigente ${t0.idx}`);
  // EL TRANSITO, tramo por tramo: en cada uno se mide lo que nace y se escucha lo que se dice.
  // LAS VENTANAS NO PUEDEN PASARSE DE 0.35: 2,5 s a 74 m/s son 185 m, o sea un 7% de la mision,
  // asi que la ultima arranca en 0.26 y no en 0.31 — con 0.31 la medicion se comia el principio
  // del mar abierto y le cargaba al tramo mudo dos spawns que no eran suyos (paso, y el numero
  // acusaba al inocente).
  // Y LA PRIMERA LINEA YA SONO: se dispara en el primer cuadro de 'play', antes de que este
  // bloque empiece. Se lee ANTES de vaciar nada — vaciar la ventana primero fue lo que hizo que
  // la conversacion apareciera con tres lineas de cuatro.
  const dichoEnVuelo = [];
  const primera = JSON.parse(await js('__seapop()'));
  if (primera) dichoEnVuelo.push(primera);
  // La linea se LEE ENSEGUIDA de entrar al tramo y el sembrado se mide DESPUES: un popup vive 1,1
  // s, asi que preguntar por la pantalla recien al final de una ventana de dos segundos y medio
  // es preguntar cuando ya no hay nada — que es como se perdieron tres de las cuatro lineas en la
  // corrida anterior.
  let sembradoTransito = 0;
  for (const p of [0.10, 0.18, 0.26]) {
    await js(`__wjump(${p})`);
    await sleep(400);
    const t = JSON.parse(await js('__seapop()'));
    if (t) dichoEnVuelo.push(t);
    await js('__trclear()');
    await sleep(2200);
    sembradoTransito += JSON.parse(await js('__trcount()')).n;
  }
  console.log(`   en el transito nacieron ${sembradoTransito} obstaculos`);
  dichoEnVuelo.forEach((l, i) => console.log(`   ${i + 1}. ${l}`));
  if (sembradoTransito === 0) ok('CERO spawns en el transito: "sin un solo enemigo en pantalla"');
  else bad(`nacieron ${sembradoTransito} obstaculos en un tramo que tiene que estar mudo`);
  const dichas4 = (await TR()).dichas;
  if (dichas4.length === 4 && dichas4.every((k, i) => k === `m4_radio${i + 1}`))
    ok('las cuatro lineas de la conversacion, en el orden del guion');
  else bad(`la conversacion sono ${JSON.stringify(dichas4)}`);
  if (dichoEnVuelo.length === 4) ok('y las cuatro llegaron a la pantalla mientras se volaba');
  else bad(`en pantalla se vieron ${dichoEnVuelo.length} de 4 lineas`);
  // …Y EL MAR ABIERTO LLEGA CON TODO. El contraste ES el nivel: sin este numero, "el transito
  // esta mudo" podria significar nada mas que la mision entera esta rota.
  const mar = await contar(0.45, 6000);
  const trMar = await TR();
  console.log(`   pasado el transito nacieron ${mar.n} obstaculos (densidad resuelta ${trMar.obstacles}, caza ${trMar.caza})`);
  if (mar.n > 0 && trMar.obstacles === 1.2 && trMar.caza === 1) ok('el mar abierto llega con densidad plena y LA COLA habilitada');
  else bad(`el mar abierto reporta ${mar.n} spawns con densidad ${trMar.obstacles} y caza ${trMar.caza}`);

  // ---------- 6. CONSOLA ----------
  console.log('\n6. consola:');
  if (errors.length) { bad(`${errors.length} error(es):`); errors.slice(0, 8).forEach(e => console.error('     ' + e)); }
  else ok('sin errores');

  console.log(fails ? `\nTRAMOS: ${fails} FALLA(S)\n` : '\nTRAMOS: OK\n');
  app.exit(fails ? 1 : 0);
});
