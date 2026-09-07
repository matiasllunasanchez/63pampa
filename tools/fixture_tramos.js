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
//   7. LA MISION PILOTO (T4) — el transito del Narwal en m4, volado de verdad: cero spawns en el
//      tramo mudo, la conversacion en orden, y el mar abierto llegando con densidad plena.
//
// OJO CON LOS CODIGOS DE MISION. Este fixture se escribio cuando la campaña tenia doce misiones y
// el transito del Narwal era "M4 (codigo m3)"; hoy son catorce y el codigo COINCIDE con el numero
// — el transito es `m4` y la unica mision sin tramos es `m14`. Los comentarios del §8 del spec que
// dicen "M4 (codigo m3)" son de aquella numeracion. Ver la divergencia 13.
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
async function contar(p, ms, asentar, limpiar) {
  await js(`__wjump(${p})`);
  // ASENTAR ANTES DE MEDIR. `run.nextSpawn` se descuenta con los metros volados y NO se reinicia
  // al cambiar de tramo: al entrar a uno flojo viniendo de uno denso, el primer spawn ya estaba
  // pago y sale igual. Es correcto en el juego —el mundo no se entera de las fracciones— pero en
  // una ventana chica ese sobrante solo, arrastra la razon. Se le da tiempo a que caiga.
  await sleep(asentar === undefined ? 150 : asentar);
  await js(`__wjump(${p}); __trclear()`);
  // SE VUELVE A SALTAR AL MISMO PUNTO cada pocos decimos: la ventana tiene que quedarse ADENTRO
  // del tramo. Un tramo de 0 a 0.3 en una mision de 3400 m son 1020 m, o sea catorce segundos de
  // vuelo — una ventana mas larga que eso se pasa al tramo siguiente y termina midiendo los dos
  // mezclados (paso: la medicion del tramo flojo se comio 200 m del denso y la razon se cayo de
  // 6× a 1,9×). El salto no altera lo que se mide: el sembrador cuenta METROS VOLADOS, y volar
  // se sigue volando — lo unico que se congela es en que parte del mapa esta el avion.
  const t0 = Date.now();
  // SE VIGILA EL VUELO DURANTE LA VENTANA, no al cerrarla, y no cuesta una sola llamada de mas:
  // `__wjump` ya devuelve `state` y `vidas`, asi que el mismo salto que mantiene la ventana adentro
  // del tramo contesta si se sigue volando. Mirar solo el final NO alcanza — un relevo que empieza
  // y termina dentro de la ventana no deja rastro (para cuando se pregunta, el avion ya volvia a
  // volar) y lo unico que queda es un censo bajo, que se lee como si el tramo sembrara poco. Paso:
  // 16 spawns donde el mismo tramo da 23, y la razon de la CA se cayo a 2,67×.
  let mal = null, vidas = null;
  while (Date.now() - t0 < ms) {
    await sleep(400);
    // `limpiar` VACIA EL CORREDOR en el mismo pulso del salto, y el censo NO se entera: cuenta lo
    // que NACE (se incrementa en el momento de sembrar), no lo que sigue vivo. Hace falta donde la
    // mezcla es letal para un avion clavado: con `favor: ['jet']` el re-sorteo llena el pasillo de
    // cazas, y el caza BUSCA TU CARRIL (`home` en spawn.js), asi que la ventana se muere entera.
    // Es la misma trampa que el fixture ya se comio de callado: la corrida vieja media "16.9% de
    // 65" contra "9.6% de 146" y esa segunda ventana era media ventana con un relevo adentro.
    //
    // Lo unico que se distorsiona es la OLA, que es lo unico con tope de poblacion (`olaOk`: dos
    // vivas) — vaciando nacen mas. Por eso la proporcion de abajo se mide sobre la mezcla SIN olas
    // ni bidones, que ademas es lo correcto: los dos estan EXENTOS del re-sorteo (§8 divergencia 5).
    const w = JSON.parse(await js(limpiar ? `__pasilloLimpio(); __wjump(${p})` : `__wjump(${p})`));
    if (w.state !== 'play' && !mal) mal = w.state;
    if (vidas !== null && w.vidas < vidas && !mal) mal = 'relevo';
    vidas = w.vidas;
  }
  // EL ESTADO VIAJA CON EL CENSO. Un avion caido no siembra: sin este dato, una ventana que cae
  // fuera del vuelo devuelve cero y el cero se hace pasar por una afirmacion sobre el tramo. Es
  // como se leyeron durante meses "la razon entre tramos es 0×" y "el VEIL no manda: 0 y 0".
  const censo = JSON.parse(await js('__trcount()'));
  censo.state = mal || (await estado()).state;
  return censo;
}

/** El estado de las ventanas que se acaban de medir, si alguna cayo fuera del vuelo. */
const fuera = (...c) => c.filter(x => x.state !== 'play').map(x => x.state).join('/');

/** MIDE, Y SI LA VENTANA CAYO FUERA DEL VUELO VUELVE A MEDIR.
 *
 *  El avion va clavado por sonda para poder medir (`__czalto`), o sea que NO ESQUIVA: a densidad
 *  alta y con ventanas de diez segundos, comerse algo y entrar en relevo es cuestion de tiempo. La
 *  ventana en la que pasa se pierde entera —durante el relevo no siembra nadie— y el numero que
 *  devuelve no habla del tramo sino del choque. Reintentar es lo unico honesto que se puede hacer:
 *  se descarta la medicion rota y se dice por consola que se descarto. Lo que NO se hace es
 *  dejarla pasar: para eso esta el `state` que viaja con el censo. */
async function medir(p, ms, asentar, limpiar) {
  for (let i = 0; i < 4; i++) {
    for (let k = 0; k < 60 && (await estado()).state !== 'play'; k++) await sleep(250);
    const c = await contar(p, ms, asentar, limpiar);
    if (c.state === 'play') return c;
    console.log(`   (la ventana en ${p} cayo en '${c.state}': se descarta y se vuelve a medir)`);
  }
  return await contar(p, ms, asentar, limpiar);
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
  // SE VUELA m14, Y HOY ES LA UNICA QUE SIRVE: las otras trece declaran al menos el tramo del
  // objetivo por radio (G-08), asi que `m14` es la unica mision de la campaña SIN `tramos:`.
  // Este fixture decia 'm2' —lo era cuando se escribio— y entrar hoy a m2 no solo reporta `n: 2`:
  // su primer tramo trae una CHARLA EN VUELO, que apaga el sembrador y congela el odometro, y por
  // eso los pasos 2, 3 y 5 —que siguen volando esta misma corrida— median cero contra cero. Los
  // dos sintomas del enunciado ("razon 0×" y "0 spawns antes y 0 despues") salian de aca.
  // Ver la divergencia 13 del §8 del spec.
  const LIMPIA = 'm14';
  console.log(`1. una mision SIN tramos (${LIMPIA}):`);
  if (!await volar(LIMPIA)) { console.error('   ✗ no se pudo entrar a volar'); app.exit(1); return; }
  // ESCUADRON DE SOBRA. m14 vuela con tres vidas y los pasos 2 y 3 son casi un minuto de ventanas
  // a densidad alta con el avion clavado y sin esquivar: con tres, la corrida se puede quedar sin
  // aviones a mitad de la medicion y lo que sigue mide una pantalla de resultados. No cambia nada
  // de lo que se afirma —el censo cuenta lo que NACE, no lo que sobrevive— y es la misma sonda que
  // usa el fixture del mar.
  await js('__sealives(9)');
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
  // `caza: 0` y `bombs: 0` EN LOS TRAMOS INYECTADOS, que es el criterio de siempre de este repo:
  // la seccion que mide una cosa apaga lo que no esta midiendo (igual que `cazaCalma` en LA COLA).
  // Lo que se mide aca es el sorteo de OBSTACULOS; LA COLA y el bombardeo no entran en el censo y
  // lo unico que aportan es tumbar el avion a mitad de la ventana — y m14, que es la mision limpia
  // que hay que volar, trae las dos al maximo y tres vidas nada mas.
  const errs = JSON.parse(await js(`__trset(${JSON.stringify([
    { hasta: 0.3, obstacles: 0.3, caza: 0, bombs: 0 }, { hasta: 1, obstacles: 1.8, caza: 0, bombs: 0 },
  ])})`));
  if (errs.length) bad('el validador rechazo los tramos de prueba: ' + errs.join(' · '));
  // EL DENSO PRIMERO Y EL FLOJO DESPUES, a proposito: el intervalo de siembra se acorta con
  // `run.t`, asi que la segunda ventana esta favorecida. Midiendo en este orden el sesgo juega
  // EN CONTRA de la afirmacion — si igual da 3×, es que da 3×.
  const cD = await medir(0.35, 10000, 2500);
  const cF = await medir(0.02, 10000, 2500);
  const denso = cD.n, flojo = cF.n;
  const raz = flojo ? +(denso / flojo).toFixed(2) : Infinity;
  console.log(`   tramo denso (1.8): ${denso} spawns · tramo flojo (0.3): ${flojo} · razon ${raz}×`);
  if (fuera(cD, cF)) bad(`la medicion no vale: una ventana cayo fuera del vuelo (${fuera(cD, cF)})`);
  else if (denso >= flojo * 3) ok('el tramo denso siembra al menos 3× lo que el flojo (CA del RF-02)');
  else bad(`la razon entre tramos es ${raz}× y el CA pide ≥3×`);
  await js('__wjump(0.1)');
  const enFlojo = await TR();
  if (enFlojo.idx === 0 && enFlojo.obstacles === 0.3) ok('la sonda ve el tramo 0 con su densidad resuelta');
  else bad(`en el primer tramo la sonda reporta ${JSON.stringify({ idx: enFlojo.idx, obstacles: enFlojo.obstacles })}`);

  // ---------- 3. BIDONES Y FAVOR (RF-02) ----------
  console.log('\n3. los bidones cortados:');
  await js('__chafuel(1)');                       // el combustible prendido, por la sonda que ya existe
  await js(`__trset(${JSON.stringify([
    { hasta: 0.5, obstacles: 2.5, bidones: false, caza: 0, bombs: 0 },
    { hasta: 1, obstacles: 2.5, caza: 0, bombs: 0 },
  ])})`);
  const cortado = await medir(0.02, 7000, undefined, true);
  const libre = await medir(0.5, 7000, undefined, true);
  console.log(`   con bidones:false nacieron ${cortado.tipos.fuel || 0} bidones de ${cortado.n} · sin la llave, ${libre.tipos.fuel || 0} de ${libre.n}`);
  if (fuera(cortado, libre)) bad(`la medicion de los bidones no vale: una ventana cayo fuera del vuelo (${fuera(cortado, libre)})`);
  else if (cortado.tipos.fuel) bad(`nacieron ${cortado.tipos.fuel} bidones en un tramo que los tiene cortados`);
  else ok('con `bidones: false` no nace un solo bidon en el tramo');
  if (libre.tipos.fuel > 0) ok('y en el tramo de al lado siguen naciendo: la llave es del TRAMO, no del mapa');
  else bad('no nacio ningun bidon en NINGUN tramo: la medicion no prueba nada');
  // EL COMBUSTIBLE SE VUELVE A APAGAR: lo prendio la sub-seccion de los bidones y ya cumplio. De
  // aca en adelante lo unico que aporta es un tanque bajando durante mediciones largas en las que
  // el avion esta clavado por sonda y no puede ir a buscar un bidon.
  await js('__chafuel(0)');

  // FAVOR: el mismo tramo medido dos veces, con y sin la lista. Densidad alta a proposito — lo
  // que se mide es una PROPORCION y con veinte spawns por ventana el ruido se come la señal.
  //
  // Y SE VUELA A 300 m/s PARA MEDIRLA, que es lo unico que hace la afirmacion estable. El ruido de
  // esta seccion es de conteo: con p ≈ 0,11 y N spawns por ventana, la desviacion RELATIVA de la
  // razon es √(1/(p·N) + 1/(p'·N)) ≈ √(13,9/N). A velocidad de crucero entran ~135 por ventana de
  // diez segundos, o sea ±30% sobre una razon cuyo techo teorico es 1,89 — el umbral de 1,5 cae
  // adentro del ruido y la seccion falla una de cada cuatro corridas por puro dado (medido: 1,49 ·
  // 2,46 · 1,58 en tres corridas seguidas del MISMO codigo). Volando a 300 con ventanas de 30 s la
  // muestra pasa a ~1600 y la desviacion baja a ±9%, que deja el umbral a mas de dos sigmas.
  //
  // La velocidad NO toca la mezcla, y por eso se puede: el sorteo de `spawn()` es un `Math.random`
  // contra umbrales por terreno, y el intervalo de siembra se cuenta en METROS. Correr mas rapido
  // saca mas muestras del mismo dado — no lo carga.
  console.log('\n   la mezcla inclinada (favor):');
  await js('__czspd(300)');
  await js(`__trset(${JSON.stringify([{ hasta: 1, obstacles: 6, caza: 0, bombs: 0 }])})`);
  const nf = await medir(0.05, 30000, undefined, true);
  await js(`__trset(${JSON.stringify([{ hasta: 1, obstacles: 6, favor: ['jet'], caza: 0, bombs: 0 }])})`);
  const cf = await medir(0.05, 30000, undefined, true);
  await js('__czspd(74)');
  // LA MEZCLA ES LO QUE EL RE-SORTEO PUEDE TOCAR, y eso deja afuera a la ola y al bidon: los dos
  // estan EXENTOS de `favor` (§8 divergencia 5 — el bidon tiene su propia llave y resetea
  // `run.fuelDist`, la ola sale del clima y trae su reglamento de separacion). Contarlos en el
  // denominador seria meter en la cuenta a los que la llave no puede inclinar, y ademas es lo que
  // hace que el numero no dependa de cuantas olas dejo pasar el tope de poblacion.
  const mezcla = c => c.n - (c.tipos.ola || 0) - (c.tipos.fuel || 0);
  const pSin = mezcla(nf) ? (nf.tipos.jet || 0) / mezcla(nf) : 0;
  const pCon = mezcla(cf) ? (cf.tipos.jet || 0) / mezcla(cf) : 0;
  // EL TECHO DEL RE-SORTEO ES CONOCIDO: con dos sorteos un tipo de probabilidad p pasa a
  // p·(2−p), o sea que la ganancia NO puede pasar de (2−p) por mucho que se insista. Se afirma
  // contra esa teoria y no contra un numero redondo — ver la divergencia 3 del §8 del spec.
  const techo = +(2 - pSin).toFixed(2);
  console.log(`   cazas sin favor: ${(pSin * 100).toFixed(1)}% de ${mezcla(nf)} · con favor: ${(pCon * 100).toFixed(1)}% de ${mezcla(cf)} · ganancia ${pSin ? (pCon / pSin).toFixed(2) : '—'}× (techo teorico ${techo}×)`);
  if (fuera(nf, cf)) bad(`la medicion de la mezcla no vale: una ventana cayo fuera del vuelo (${fuera(nf, cf)})`);
  else if (pSin > 0 && pCon / pSin >= 1.5) ok(`\`favor\` inclina la mezcla cerca de su techo (${(pCon / pSin).toFixed(2)}× de ${techo}× posible)`);
  else bad(`la proporcion paso de ${(pSin * 100).toFixed(1)}% a ${(pCon * 100).toFixed(1)}%: el re-sorteo no esta inclinando nada`);

  // ---------- 5. EL VEIL SIGUE MANDANDO (RF-05) ----------
  // SE VUELVE A ENTRAR A LA MISION ANTES DE MEDIR, y no es higiene: los pasos 2 y 3 son casi un
  // minuto de vuelo a densidad 6 con el avion clavado por sonda, o sea sin esquivar. Llegar aca
  // con la corrida rota es perfectamente posible — y un avion caido no siembra NADA, ni antes ni
  // despues del corte. Ese es el "0 spawns antes y 0 despues" que parecia una falla del VEIL y era
  // la ventana de medicion cayendo fuera del vuelo. La entrada limpia es la mitad del arreglo; la
  // otra mitad es que el ESTADO viaja con el censo (ver `contar`), asi ningun cero puede volver a
  // hacerse pasar por una afirmacion sobre el tramo.
  console.log('\n5. el cordon final (con distancias de verdad):');
  await volar(LIMPIA);
  await js('__sealives(9)');
  await js('__chafuel(0)');
  await js(`__trset(${JSON.stringify([{ hasta: 1, obstacles: 2.5, caza: 0, bombs: 0 }])})`);
  // Y SE DEJA ASENTAR `run.nextSpawn` ANTES DE CONTAR (§8 divergencia 7): en una mision recien
  // empezada el contador nace en 320 m, y una ventana de 4 s a 74 m/s son 296 m — MENOS que el
  // primer intervalo. O sea que la ventana se cerraba antes de que le tocara nacer al primero y
  // el cero no decia nada del VEIL. Los 6 s de asentado son 444 m: pagan ese primer intervalo y
  // dejan el avion en 1464 m, todavia del lado de aca del corte (0.74 de 3400 = 2516 m).
  const cA = await medir(0.3, 5000, 6000);
  const cD2 = await medir(0.8, 4000);
  const antes = cA.n, dentro = cD2.n;
  console.log(`   antes del corte: ${antes} spawns · pasado el corte: ${dentro} (estado ${cA.state}/${cD2.state})`);
  if (fuera(cA, cD2)) bad(`la medicion no vale: el avion quedo en '${fuera(cA, cD2)}' y un avion caido no siembra de los dos lados`);
  else if (dentro === 0 && antes > 0) ok('pasado el corte no siembra nadie, diga lo que diga el ultimo tramo');
  else bad(`el VEIL no manda: ${antes} spawns antes y ${dentro} despues del corte`);

  // ---------- 4. LA RADIO: UNA VEZ, EN ORDEN, SIN CORO (RF-03) ----------
  // Se camina el pasillo A SALTOS, un tramo por vez, en vez de volarlo entero: son 2600 m a 74
  // m/s, medio minuto de espera para mirar cuatro popups. Y el salto no es una trampa — es el
  // MISMO mecanismo que el RF-03 tiene que aguantar (entrar a un tramo y que suene su linea, una
  // sola vez), solo que sin el relleno.
  //
  // SE VUELA LA MISION SIN TRAMOS y no una cualquiera: `__trset` reemplaza la lista entera, pero
  // el primer tramo de la mision ya entro en el primer cuadro de 'play' — o sea que en cualquier
  // otra mision de la campaña este paso arrancaria con una charla armada encima.
  //
  // LAS CLAVES `m4_radio*` SIGUEN SIENDO LAS DE PRUEBA aunque m4 ya no las use: son lineas reales
  // de data/strings.js, con hablante adelante, que es todo lo que este paso necesita — lo que
  // mide es el MOTOR (una linea por tramo, en orden, sin coro), no el dato de una mision.
  console.log('\n4. la radio del tramo:');
  if (!await volar(LIMPIA)) { console.error('   ✗ no se pudo entrar a volar'); app.exit(1); return; }
  const RADIOS = ['m4_radio1', 'm4_radio2', 'm4_radio3', 'm4_radio4'];
  await js(`__trset(${JSON.stringify([
    { hasta: 0.25, radio: RADIOS[0] }, { hasta: 0.5, radio: RADIOS[1] },
    { hasta: 0.7, radio: RADIOS[2] }, { hasta: 1, obstacles: 1 },
  ])})`);
  // LO QUE VE EL JUGADOR SE MIRA POR `__radiodbg` Y NO POR `__seapop`. La radio del tramo dejo de
  // ser un `popup` centrado de spawn.js y pasa por LA CAJA de core/radioVN.js (una linea abajo,
  // con retrato y barrita): `__seapop` sigue existiendo, sigue contestando, y contesta VACIO —
  // esta mirando la lista equivocada. Por eso este paso decia "en pantalla se vieron 0 lineas"
  // con las tres radios sonando bien tres renglones mas arriba.
  //
  // Y SE DESCARTA LO REPETIDO: la caja NO se vacia al leerla (el popup si), y una linea dura 2,6 s
  // como minimo — asi que en el cuarto punto, el tramo que NO trae radio, sigue en pantalla la
  // tercera. Contarla seria contar cuatro lineas donde el guion puso tres.
  let vistas = [];
  for (const p of [0.05, 0.3, 0.55, 0.8]) {
    await js(`__wjump(${p})`);
    await sleep(350);
    const r = JSON.parse(await js('__radiodbg()'));
    const txt = r.visible && r.txt ? `${r.personaje || '—'}: ${r.txt}` : '';
    if (txt && vistas[vistas.length - 1] !== txt) vistas.push(txt);
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
  await volar(LIMPIA);
  // LOS TRAMOS Y EL SALTO VAN EN LA MISMA LLAMADA, y eso es la prueba y no una comodidad: entre
  // dos `executeJavaScript` corre por lo menos un cuadro, y en ese cuadro el tramo 0 ya seria
  // vigente y su linea habria sonado con todo derecho. Lo que este renglon afirma es que un salto
  // DE GOLPE al 90% no arrastra la cola de tramos que se llevo por delante; medirlo con una linea
  // legitima adelante mezcla dos cosas distintas (paso: sonaban `m4_radio1` y `m4_radio4`).
  await js(`__trset(${JSON.stringify([
    { hasta: 0.25, radio: RADIOS[0] }, { hasta: 0.5, radio: RADIOS[1] },
    { hasta: 0.75, radio: RADIOS[2] }, { hasta: 1, radio: RADIOS[3] },
  ])}); __wjump(0.9)`);
  await sleep(500);
  const tras = (await TR()).dichas;
  if (tras.length === 1 && tras[0] === RADIOS[3]) ok('un __wjump(0.9) dispara SOLO la del tramo vigente, no la cola entera');
  else bad(`tras el salto sonaron ${JSON.stringify(tras)} y tenia que sonar solo la ultima`);

  // …Y NO SUENA FUERA DEL VUELO (RF-03): en pausa, el cambio de tramo espera. Se comprueba
  // pausando, saltando de tramo, y mirando que no haya sonado hasta despausar.
  await volar(LIMPIA);
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
  // Esta no inyecta nada: vuela m4 con LOS TRAMOS QUE TRAE LA MISION. Es la unica parte del
  // fixture que prueba el DATO y no el motor, y es la que contesta la pregunta del guion —
  // "sin un solo enemigo en pantalla" — con un numero.
  //
  // EL TRANSITO YA NO SON CUATRO RADIOS SINO SEIS CHARLAS EN VUELO (`M04_OBJETIVO` y
  // `M04_NARWAL_A..E`), y eso cambia DONDE se mira. Una radio es una linea suelta y queda anotada
  // en `dichas`; una charla es una escena entera de data/story.js, NO pasa por `dichas` —ese
  // registro es de radios y de nada mas— y se mira por `__cvdbg()`. Preguntarle a `dichas` por la
  // conversacion del Narwal devuelve `[]` para siempre. Ver la divergencia 13 del §8 del spec.
  //
  // SE CAMINA TRAMO POR TRAMO, igual que el paso 4 y por la misma razon que ahi: lo que este
  // fixture tiene que poder afirmar es la regla de los TRAMOS —entrar a un tramo dispara lo que
  // trae, una vez— y el salto es el mismo mecanismo sin el relleno.
  //
  // Y ADEMAS ES LO UNICO QUE ALCANZA LAS SEIS. Volando de corrido encadenan cinco: el odometro se
  // congela mientras se habla (arreglado el 6/9/2026 — ver la divergencia 15 del §8; hasta ese dia
  // la primera escena se comia los seis tramos y se escuchaba UNA), asi que `M04_NARWAL_A..E` salen
  // solas una detras de otra. La que falta es `M04_OBJETIVO`: su tramo termina a los 104 m y la
  // carrera de despegue consume ~155, o sea que volando nunca llega a ser vigente. Es un problema
  // de datos, no del item, y esta anotado como divergencia 14.
  console.log('\n7. la mision piloto — el transito del Narwal (m4):');
  if (!await volar('m4')) { console.error('   ✗ no se pudo entrar a volar m4'); app.exit(1); return; }
  const t0 = await TR();
  if (t0.n === 7) ok(`m4 trae ${t0.n} tramos: los seis del transito y el mar abierto`);
  else bad(`m4 reporta ${t0.n} tramos`);
  if (t0.idx !== 0)
    console.log(`   ↑ OJO: al llegar a 'play' el odometro ya marca ${t0.dist} m y rige el tramo ${t0.idx}. El primer tramo del transito termina a los ${Math.round(0.04 * t0.obj)} m, o sea ADENTRO de la carrera de despegue: volando, 'M04_OBJETIVO' no llega a ser vigente. Ver §8 divergencia 14.`);
  const ESCENAS = ['M04_OBJETIVO', 'M04_NARWAL_A', 'M04_NARWAL_B',
    'M04_NARWAL_C', 'M04_NARWAL_D', 'M04_NARWAL_E'];
  // un punto ADENTRO de cada tramo del transito (0.04 · 0.07 · 0.14 · 0.21 · 0.28 · 0.351)
  const PUNTOS = [0.02, 0.055, 0.10, 0.17, 0.24, 0.32];
  // SE CORTA LA QUE VENIA CORRIENDO antes de empezar: al llegar a 'play' el tramo 1 ya armo su
  // escena, y con una charla abierta el primer salto no armaria nada — `armar()` se ignora.
  await js('__cvcut()');
  await js('__trclear()');
  const dichoEnVuelo = [];        // las escenas que pasaron, en orden
  const conTexto = new Set();     // …y cuales llegaron a poner una linea EN PANTALLA
  const sucios = [];              // tramos del transito que resolvieron algo distinto de cero
  for (const p of PUNTOS) {
    await js(`__wjump(${p})`);
    let esc = null, txt = '';
    const lim = Date.now() + 40000;
    while (Date.now() < lim) {
      const cv = JSON.parse(await js('__cvdbg()'));
      if (cv.escena) {
        esc = cv.escena;
        // 'activa' y no cualquier fase: en el drenaje el motor todavia tiene cargada la ultima
        // linea de la escena anterior, y contarla seria acreditarle a una escena el texto de otra.
        if (cv.fase === 'activa' && cv.txt && cv.txt.length > 3) txt = cv.txt;
      } else if (esc) break;                    // hablo y ya volvio a idle: al tramo siguiente
      // SE VUELVE A SALTAR AL MISMO PUNTO mientras habla, por lo mismo que en `contar`: el avion
      // sigue volando y sin esto la escena terminaria dos tramos mas adelante.
      await js(`__wjump(${p})`);
      await sleep(150);
    }
    if (esc) dichoEnVuelo.push(esc);
    if (esc && txt) conTexto.add(esc);
    const tr = await TR();
    if (tr.obstacles || tr.caza || tr.bombs)
      sucios.push(`tramo ${tr.idx}: obst ${tr.obstacles} · caza ${tr.caza} · bombs ${tr.bombs}`);
  }
  const sembradoTransito = JSON.parse(await js('__trcount()')).n;
  console.log(`   en el transito nacieron ${sembradoTransito} obstaculos`);
  dichoEnVuelo.forEach((l, i) => console.log(`   ${i + 1}. ${l}`));
  if (sembradoTransito === 0) ok('CERO spawns en el transito: "sin un solo enemigo en pantalla"');
  else bad(`nacieron ${sembradoTransito} obstaculos en un tramo que tiene que estar mudo`);
  if (!sucios.length) ok('y los seis tramos del transito resuelven obstacles, caza y bombs en 0');
  else bad(`un tramo del transito no esta en cero — ${[...new Set(sucios)].slice(0, 3).join(' · ')}`);
  if (dichoEnVuelo.length === ESCENAS.length && dichoEnVuelo.every((k, i) => k === ESCENAS[i]))
    ok('las seis escenas de la conversacion, una por tramo y en el orden del guion');
  else bad(`la conversacion sono ${JSON.stringify(dichoEnVuelo)}`);
  if (conTexto.size === ESCENAS.length) ok('y las seis llegaron a la pantalla con texto de verdad');
  else bad(`en pantalla se leyeron ${conTexto.size} de ${ESCENAS.length} escenas`);
  // …Y EL MAR ABIERTO LLEGA CON TODO. El contraste ES el nivel: sin este numero, "el transito
  // esta mudo" podria significar nada mas que la mision entera esta rota.
  //
  // SE ESPERA A QUE LA ULTIMA ESCENA CIERRE: durante una charla el sembrador esta apagado, asi
  // que medir con el fundido de salida todavia puesto es medir el gate de las charlas y no la
  // densidad del tramo (paso: 0 spawns con densidad 1.2 resuelta, que acusaba al inocente).
  for (let i = 0; i < 40 && JSON.parse(await js('__cvdbg()')).fase !== 'idle'; i++) await sleep(150);
  const mar = await medir(0.45, 6000);
  const trMar = await TR();
  console.log(`   pasado el transito nacieron ${mar.n} obstaculos (densidad resuelta ${trMar.obstacles}, caza ${trMar.caza})`);
  if (fuera(mar)) bad(`la medicion del mar abierto no vale: la ventana cayo en '${fuera(mar)}'`);
  else if (mar.n > 0 && trMar.obstacles === 1.2 && trMar.caza === 1) ok('el mar abierto llega con densidad plena y LA COLA habilitada');
  else bad(`el mar abierto reporta ${mar.n} spawns con densidad ${trMar.obstacles} y caza ${trMar.caza}`);

  // ---------- 6. CONSOLA ----------
  console.log('\n6. consola:');
  if (errors.length) { bad(`${errors.length} error(es):`); errors.slice(0, 8).forEach(e => console.error('     ' + e)); }
  else ok('sin errores');

  console.log(fails ? `\nTRAMOS: ${fails} FALLA(S)\n` : '\nTRAMOS: OK\n');
  app.exit(fails ? 1 : 0);
});
