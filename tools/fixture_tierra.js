// FIXTURE DE ACEPTACION de LA TIERRA Y LA COSTA (docs/sistemas/PLAN_TIERRA_COSTA), corrido en el
// juego de verdad.
//   npm run tierra                      · TIERRA_SHOTS=/tmp/x npm run tierra  (deja capturas)
//
// Hermano de `npm run agua` y por lo mismo: no esta adentro de `check` porque no prueba una
// formula sino que el suelo entero funcione adentro del juego, y eso son segundos de vuelo REAL.
//
// LO QUE CUIDA: que el suelo sea TEMA y no una constante (T1) y que el viento lo toque de verdad
// (T2). Las dos reglas tienen una mitad negativa que es la que de veras protege: el ATARDECER
// —el cielo por defecto, el que define como se ve RASANTE— tiene que quedar identico, y con
// VIENTO=NO el campo tiene que quedar QUIETO.
//
// ESTADO: las seis fases (T1-T6) estan hechas.
const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const ROOT = path.join(__dirname, '..');
const OUT = process.env.TIERRA_SHOTS || '';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const errors = [];
let win, fails = 0;
const bad = m => { console.error('   ✗ ' + m); fails++; };
const ok = m => console.log('   ✓ ' + m);
const js = s => win.webContents.executeJavaScript(s);
const T = async () => JSON.parse(await js('String(window.__tierra && window.__tierra())') || 'null');
const estado = () => js('JSON.parse(__pausedbg()).state');
async function shot(n) {
  if (!OUT) return;
  fs.writeFileSync(path.join(OUT, n + '.png'), (await win.webContents.capturePage()).toPNG());
}
const down = k => win.webContents.sendInputEvent({ type: 'keyDown', keyCode: k });
const up = k => win.webContents.sendInputEvent({ type: 'keyUp', keyCode: k });
const tap = async k => { down(k); await sleep(60); up(k); await sleep(110); };

// EL ATARDECER DE SIEMPRE. Esta escrito aca a mano —y no leido de la paleta— a proposito: si se
// leyera de `LAND` la prueba diria "el suelo es igual a si mismo" y pasaria aunque alguien cambie
// el default. El numero es el contrato con el aspecto del juego (SPEC_AGUA_OLAS §24).
const TURBA_ATARDECER = '#4a5138';

/** Entra a POR LA PATRIA volando (mismo camino de menu que el fixture del agua) y pasa a TIERRA. */
async function volar() {
  await win.loadURL('file://' + path.join(ROOT, 'src', 'index.html') + '?qa');
  await sleep(2600);
  await tap('Return'); await tap('Down'); await tap('Return');
  await tap('Down'); await tap('Return'); await tap('Return');
  for (let i = 0; i < 60; i++) { if (await estado() === 'play') { await sleep(900); return true; } await sleep(200); }
  return false;
}

app.whenReady().then(async () => {
  console.log('\nFIXTURE — LA TIERRA Y LA COSTA (T1-T6)\n');
  win = new BrowserWindow({ width: 1280, height: 760, show: false, webPreferences: { backgroundThrottling: false } });
  win.webContents.on('console-message', (e, l, m) => { if (l >= 3 && !m.includes('Security Warning')) errors.push(m.slice(0, 300)); });
  win.webContents.on('render-process-gone', (e, d) => errors.push('EL RENDERER MURIO: ' + JSON.stringify(d)));

  if (!await volar()) { console.error('   ✗ no se pudo entrar a volar'); app.exit(1); return; }
  if (!await T()) { console.error('   ✗ la sonda __tierra no responde'); app.exit(1); return; }

  // ---------- T1. EL SUELO ES TEMA ----------
  console.log('1. la turba tiene clima (T1):');
  await js("__tierraset('land','dusk')");
  await sleep(500);
  const t0 = await T();
  if (t0.land.near === TURBA_ATARDECER) ok(`el ATARDECER queda intacto: la turba sigue siendo ${TURBA_ATARDECER}`);
  else bad(`el atardecer CAMBIO de color: ${t0.land.near} en vez de ${TURBA_ATARDECER}`);
  await shot('t1_dusk');

  // los cuatro climas tienen que dar cuatro suelos DISTINTOS: si dos coinciden, alguno no llego
  const suelos = { dusk: t0.land.near }, arenas = { dusk: t0.cland };
  for (const sky of ['storm', 'night', 'sun', 'dawn']) {
    await js(`__tierraset('land','${sky}')`);
    await sleep(320);
    const t = await T();
    suelos[sky] = t.land.near; arenas[sky] = t.cland;
    await shot('t1_' + sky);
  }
  const nSuelos = new Set(Object.values(suelos)).size;
  if (nSuelos === 5) ok(`cinco cielos, cinco turbas: ${Object.entries(suelos).map(([k, v]) => k + '=' + v).join(' ')}`);
  else bad(`hay cielos que comparten suelo (${nSuelos} colores para 5 cielos): ${JSON.stringify(suelos)}`);
  // LA COSTA cambia MENOS que la turba (la arena mojada se oscurece pero no cambia de color), pero
  // tiene que cambiar: si la arena fuera fija, media pantalla del mapa COSTA seguiria sin clima.
  const nArenas = new Set(Object.values(arenas)).size;
  if (nArenas === 5) ok('y la arena de la COSTA tambien acompaña al cielo');
  else bad(`la arena de la costa no cambia con el cielo (${nArenas} colores para 5 cielos)`);

  // ---------- T2. EL VIENTO PEINA EL PASTO ----------
  console.log('\n2. el viento peina el pasto (T2):');
  await js("__tierraset('land','dusk')");

  // LA MITAD NEGATIVA PRIMERO, que es la que protege: sin viento el campo esta QUIETO. Se mide a
  // lo largo del tiempo y en varios puntos — un cero en un solo punto podria ser el nodo de la onda.
  await js("__seaclima('calm')");
  await sleep(300);
  let movio = 0;
  for (let i = 0; i < 12; i++) {
    const v = await js(`__pasto(${i * 13}, ${i * 29})`);
    if (v !== 0) movio++;
    await sleep(90);
  }
  if (!movio) ok('con VIENTO=NO el pasto esta QUIETO: 12 muestras, todas en cero');
  else bad(`con viento apagado el pasto igual se doblaba (${movio}/12 muestras distintas de cero)`);
  await shot('t2_calma');

  // CON BRISA: se dobla, y la onda VIAJA. Se mira el mismo punto a lo largo del tiempo — si la
  // inclinacion fuera constante seria "el pasto esta doblado", no "el viento lo peina".
  await js("__seaclima('breeze')");
  await sleep(300);
  const serie = [];
  for (let i = 0; i < 34; i++) { serie.push(await js('__pasto(0,0)')); await sleep(100); }
  const mn = Math.min(...serie), mx = Math.max(...serie);
  if (mn > 0) ok(`con brisa el pasto esta doblado siempre (minimo ${mn.toFixed(3)}): el viento sopla, no golpea`);
  else bad('con brisa hubo instantes con el pasto perfectamente parado');
  if (mx - mn > 0.12) ok(`y la onda CRUZA: la inclinacion va de ${mn.toFixed(3)} a ${mx.toFixed(3)} en el mismo punto`);
  else bad(`la inclinacion casi no varia en el tiempo (${mn.toFixed(3)}-${mx.toFixed(3)}): la onda no viaja`);

  // LA ONDA TIENE RUMBO: dos puntos separados media longitud de onda estan en fases opuestas. Sin
  // esto, todo el campo se doblaria a la vez —que es una pulsacion, no una racha cruzando.
  const a = await js('__pasto(0,0)'), b = await js('__pasto(37,0)');
  if (Math.abs(a - b) > 0.1) ok(`la racha tiene rumbo: a 37 m de distancia el pasto va al reves (${a.toFixed(3)} vs ${b.toFixed(3)})`);
  else bad(`todo el campo se dobla a la vez (${a.toFixed(3)} vs ${b.toFixed(3)}): eso es una pulsacion, no viento`);
  await shot('t2_brisa');

  // TORMENTA: el mismo campo, mas acostado. Se compara EN EL MISMO PUNTO y casi en el mismo
  // instante, asi la unica diferencia posible es la amplitud del clima.
  const bri = await js('__pasto(11,7)');
  await js("__seaclima('storm')");
  await sleep(160);
  const tor = await js('__pasto(11,7)');
  if (tor > bri * 1.4) ok(`en TORMENTA el pasto se acuesta: ${bri.toFixed(3)} → ${tor.toFixed(3)} en el mismo punto`);
  else bad(`la tormenta no acuesta mas el pasto que la brisa (${bri.toFixed(3)} → ${tor.toFixed(3)})`);
  await sleep(900);
  await shot('t2_tormenta');

  // ---------- T3. LA TURBA DEJA DE SER UNA MESA ----------
  console.log('\n3. el suelo tiene relieve (T3):');
  await js("__tierraset('land','dusk')");
  await js("__seaclima('breeze')");
  await sleep(400);
  const s3 = JSON.parse(await js('__suelo()'));
  if (s3.relieve) ok('el mapa TIERRA tiene relieve');
  else bad('el mapa TIERRA sigue plano (hayRelieve dio falso)');

  // LA LOMA EXISTE Y ES SUAVE: se muestrea medio kilometro por delante. Tiene que subir y bajar
  // (si no, es una mesa con otro nombre) y no puede bajar del cero del mundo (si no, habria que
  // hundir tambien el raster y la orilla).
  const hs = JSON.parse(await js(`(() => { const r = []; for (let dz = 0; dz < 500; dz += 10) r.push(__loma(0, dz)); return JSON.stringify(r); })()`));
  const hmin = Math.min(...hs), hmax = Math.max(...hs);
  if (hmax - hmin > 1) ok(`el terreno sube y baja: de ${hmin.toFixed(2)} a ${hmax.toFixed(2)} m en 500 m`);
  else bad(`el terreno es casi plano (${hmin.toFixed(2)}-${hmax.toFixed(2)} m en 500 m)`);
  if (hmin >= 0) ok('y nunca baja del cero del mundo: no hay pozos que el raster no sabria dibujar');
  else bad(`el terreno se hunde por debajo del cero (${hmin.toFixed(2)})`);
  // PENDIENTE SEGUIBLE: la subida mas brusca en 10 m tiene que poder acompañarse con el gas. Es
  // el numero que separa "terreno" de "pared invisible", y va medido, no a ojo.
  let dmax = 0;
  for (let i = 1; i < hs.length; i++) dmax = Math.max(dmax, Math.abs(hs[i] - hs[i - 1]));
  if (dmax / 10 < 0.09) ok(`la pendiente maxima es del ${(dmax / 10 * 100).toFixed(1)}%: se sigue con el gas`);
  else bad(`hay pendientes del ${(dmax / 10 * 100).toFixed(1)}%: eso no se vuela, se choca`);

  // LA LOMA TIENE LADOS: cruzarla por un carril no es lo mismo que por el otro. Sin el termino en
  // X el relieve seria un tubo y elegir carril no significaria nada.
  const izq = await js('__loma(-30, 60)'), der = await js('__loma(30, 60)');
  if (Math.abs(izq - der) > 0.15) ok(`la loma tiene lados: a la misma distancia, ${izq.toFixed(2)} m por izquierda y ${der.toFixed(2)} por derecha`);
  else bad(`el relieve es un tubo (${izq.toFixed(2)} vs ${der.toFixed(2)}): el carril no cambia nada`);

  // EL PISO SE MUEVE, Y ES LO QUE HACE LA MECANICA: volando SIEMPRE a la misma altura, el suelo a
  // veces alcanza y a veces no. Con el suelo plano de antes, una altura fija daba siempre el mismo
  // resultado — es exactamente la diferencia entre volar rasante y sostener un numero.
  const alcanza = hs.filter(h => h + 0.5 > 1.5).length;
  if (alcanza > 3 && alcanza < hs.length - 3)
    ok(`a 1.5 m fijos el suelo alcanza en ${alcanza} de ${hs.length} tramos: hay que SEGUIR el terreno`);
  else bad(`a 1.5 m fijos el resultado es siempre el mismo (${alcanza} de ${hs.length} tramos): el piso no se mueve`);

  // Y EL VUELO LEE ESE MISMO PISO. Las dos mitades: apenas por encima de la loma se ROZA (el
  // margen se gasta) y tres metros mas arriba no. Sin esto, todo lo anterior probaria una formula
  // bonita que el juego podria estar ignorando — que es como se escapo el bug de F1 en el agua.
  let hLoma = 0;
  for (let i = 0; i < 60; i++) {
    hLoma = await js('__loma()');
    if (hLoma > 1.2) break;
    await sleep(130);
  }
  if (hLoma <= 1.2) bad('no se llego a ninguna loma alta en el tiempo de la prueba');
  else {
    await js(`__seaput(${(hLoma + 0.25).toFixed(2)}, 0)`);
    await sleep(200);
    const dentro = JSON.parse(await js('__suelo()')).sc;
    // se sale ARRIBA de la loma y se le da tiempo a que el margen se descuente. Se lo SOSTIENE
    // arriba: sin gas el avion cae, y en 700 ms vuelve a meterse en la banda de roce — el margen
    // seguiria subiendo y la prueba acusaria al inocente.
    for (let i = 0; i < 7; i++) { await js(`__seaput(${(hLoma + 3.5).toFixed(2)}, 0)`); await sleep(100); }
    const fuera = JSON.parse(await js('__suelo()')).sc;
    if (dentro > 0.02) ok(`a ${(hLoma + 0.25).toFixed(2)} m, con la loma en ${hLoma.toFixed(2)}, el avion ROZA: el vuelo lee el relieve`);
    else bad(`a ${(hLoma + 0.25).toFixed(2)} m sobre una loma de ${hLoma.toFixed(2)} m no rozo nada: el vuelo sigue con el suelo plano`);
    if (fuera < dentro) ok(`y tres metros mas arriba el margen se recupera (${dentro.toFixed(2)} → ${fuera.toFixed(2)}): la loma se esquiva subiendo`);
    else bad(`arriba de la loma el roce no se corta (${dentro.toFixed(2)} → ${fuera.toFixed(2)})`);
  }
  await shot('t3_relieve');

  // LO QUE VES ES LO QUE TE MATA: las estructuras quedan PLANTADAS en su loma (`gy`), y esa misma
  // altura es la que usa la caja de colision. Si `gy` fuera solo del dibujo, la torre se veria
  // trepada a la loma y se chocaria al nivel del mar.
  if (await estado() !== 'play') await volar();
  await js("__tierraset('land','dusk')");
  let plantados = [], intentos = 0;
  while (intentos++ < 25) {
    await sleep(500);
    const lista = JSON.parse(await js('__plantado()')).filter(o => o.gy > 0);
    if (lista.length) { plantados = lista; break; }
  }
  if (plantados.length) ok(`lo que se apoya en el suelo queda plantado en su loma: ${plantados.slice(0, 4).map(o => o.t + '@' + o.gy).join(' ')}`);
  else bad('ningun obstaculo de tierra quedo plantado en la loma (gy = 0 en todos)');

  // ---------- T4. LA COSTA ROMPE DE VERDAD ----------
  console.log('\n4. la costa rompe (T4):');
  if (await estado() !== 'play') await volar();
  await js("__tierraset('coast','cloudy')");
  await sleep(600);

  // LA RESACA SUBE Y BAJA (T4.1). Se mira el mismo punto de la orilla a lo largo del tiempo: si
  // el agua estuviera siempre a la misma altura de la playa, seria la banda fija de antes.
  const res = [];
  for (let i = 0; i < 30; i++) { res.push(await js('__resaca(100)')); await sleep(110); }
  const rmn = Math.min(...res), rmx = Math.max(...res);
  if (rmx - rmn > 0.25) ok(`el agua sube y se retira: la lengua va de ${rmn.toFixed(2)} a ${rmx.toFixed(2)} de la playa`);
  else bad(`la resaca casi no se mueve (${rmn.toFixed(2)}-${rmx.toFixed(2)}): sigue siendo una banda fija`);
  // Y NO ROMPE TODA LA PLAYA A LA VEZ: dos puntos de la orilla separados media onda estan en
  // fases opuestas. Sin esto seria una pileta subiendo y bajando, no un mar.
  //
  // SE BARRE EL TIEMPO, no se toma UNA foto: los dos puntos estan en fases opuestas, y dos senos
  // en contrafase se CRUZAN — hay instantes en que valen lo mismo, y ahi la foto decia "toda la
  // playa rompe a la vez" con la playa perfecta. Medido: 0.20 vs 0.19 en el cruce. Como `resaca`
  // toma el tiempo por parametro, el barrido es exacto y no depende de cuando corra el fixture.
  const par = JSON.parse(await js(`(() => {
    let m = 0, A = 0, B = 0;
    for (let k = 0; k < 30; k++) {
      const tt = k * 0.15, a = __resaca(0, tt), b = __resaca(63, tt);
      if (Math.abs(a - b) > m) { m = Math.abs(a - b); A = a; B = b; }
    }
    return JSON.stringify({ m, A, B });
  })()`));
  if (par.m > 0.3) ok(`la lengua CORRE por la orilla: en el mismo instante, ${par.A.toFixed(2)} en un punto y ${par.B.toFixed(2)} 63 m mas alla`);
  else bad(`toda la playa rompe a la vez (la mayor diferencia en 4,5 s fue ${par.m.toFixed(2)})`);
  // SE RETIRA MAS DESPACIO DE LO QUE SUBE: el sesgo es lo que separa una lengua de agua de un
  // seno pintado. Se mide como pasa el tiempo debajo de la mitad de su carrera.
  const bajo = res.filter(v => v < (rmn + rmx) / 2).length;
  if (bajo > res.length * 0.5) ok(`y pasa mas tiempo retirada que encima (${bajo} de ${res.length} muestras): sube de golpe, vuelve despacio`);
  else bad(`la resaca es simetrica (${bajo} de ${res.length} muestras abajo): sube y baja igual`);
  await shot('t4_costa');

  // LA ROMPIENTE DE LA COSTA (T4.2): nace pegada a la orilla, mar adentro, y es PARCIAL — o sea
  // que deja lado libre. Una ola de ancho completo contra la playa no dejaria por donde pasar.
  const rc = JSON.parse(await js('__olacosta()'));
  if (rc.kind === 'rompiente' && rc.hw > 0) ok(`la costa siembra ROMPIENTE (parcial, hw ${rc.hw}): se esquiva de costado`);
  else bad(`la ola de la costa no es una rompiente parcial (${JSON.stringify(rc)})`);
  if (rc.x > rc.orilla && rc.x - rc.orilla < 20) ok(`y rompe SOBRE el bajo: orilla en ${rc.orilla}, ola en ${rc.x}`);
  else bad(`la ola de la costa no rompe cerca de la orilla (orilla ${rc.orilla}, ola ${rc.x})`);

  // ---------- T5. LO QUE HAY EN EL SUELO ----------
  console.log('\n5. el suelo tiene accidentes (T5):');
  await js("__tierraset('land','dusk')");
  await sleep(400);

  // PEDREROS: existen, NO estan en todos lados (un accidente que esta siempre es textura, no
  // accidente) y son angostos — un rio de piedra, no una alfombra.
  //
  // EL BARRIDO CORRE ADENTRO DE LA PAGINA, en una sola llamada. Punto por punto son 6500 idas y
  // vueltas por el puente de Electron: cinco minutos de fixture para medir dos senos. Lo que
  // importa es que mida LAS MISMAS funciones, no desde donde se las llama.
  const ped = JSON.parse(await js(`(() => {
    const r = [];
    for (let wz = 0; wz < 4000; wz += 25) {
      let ancho = 0;
      for (let wx = -60; wx <= 60; wx += 3) if (__pedrero(wx, wz) > 0) ancho += 3;
      r.push(ancho);
    }
    return JSON.stringify(r);
  })()`));
  const conPiedra = ped.filter(a => a > 0).length, sinPiedra = ped.length - conPiedra;
  const anchoMax = Math.max(...ped);
  if (conPiedra > 5 && sinPiedra > 5) ok(`los pedreros van y vienen: ${conPiedra} tramos con piedra y ${sinPiedra} sin, en 4 km`);
  else bad(`los pedreros no alternan (${conPiedra} con piedra / ${sinPiedra} sin): o no hay ninguno o esta todo empedrado`);
  if (anchoMax > 6 && anchoMax < 45) ok(`y son una LINEA, no una alfombra: el mas ancho mide ${anchoMax} m`);
  else bad(`el ancho del pedrero no sirve de referencia (${anchoMax} m)`);

  // TURBALES: tableros rectangulares, con su cara de corte.
  const tur = JSON.parse(await js(`(() => {
    let n = 0, cara = 0;
    for (let wz = 0; wz < 4000; wz += 4) { const t = JSON.parse(__turbal(wz) || 'null'); if (t) { n++; if (t.cara) cara++; } }
    return JSON.stringify({ n, cara });
  })()`));
  if (tur.n > 4) ok(`hay turbales cortados: ${tur.n} tramos de tablero en 4 km`);
  else bad(`no aparecen turbales (${tur.n} tramos en 4 km)`);
  if (tur.cara > 0) ok('y cada tablero tiene su CARA de corte: se lee como un pozo, no como una mancha');
  else bad('ningun turbal tiene cara de corte');
  await shot('t5_suelo');

  // ---------- T6. LA LLUVIA MOJA EL SUELO ----------
  console.log('\n6. la lluvia moja el suelo (T6):');
  // SE MIRA LO QUE SE PINTO, no la perilla. `__charcos()` devuelve cuantos charcos dibujo el
  // ULTIMO cuadro: si la fase estuviera desconectada —la constante puesta y el render sin
  // enterarse— este numero seria cero con lluvia y el test lo diria.
  //
  // NO se mide el brillo del suelo, y quedo probado por que no: el mundo scrollea, asi que dos
  // capturas con lluvia distinta muestran tramos distintos, y el promedio termina midiendo
  // cuantos matojos claros y cuantas rayas de lluvia cayeron en el recorte en vez del velo.
  // Medido: 71 / 86 / 49 / 62 de mediana para lluvias 0/1/3/0 — ruido puro. El OSCURECIMIENTO se
  // cierra con las dos capturas (t6_seco / t6_tormenta), como las demas fases visuales.
  await js('__lluvia(0); __seaclear(); __seaput(6, 0)');
  await sleep(700);
  const chSeco = await js('__charcos()');
  await shot('t6_seco');
  await js('__lluvia(3); __seaclear(); __seaput(6, 0)');
  await sleep(700);
  const chLluvia = await js('__charcos()');
  await shot('t6_tormenta');
  if (chSeco === 0) ok('en seco no se junta agua en ningun lado: el suelo mojado es de la LLUVIA, no del mapa');
  else bad(`sin lluvia igual habia ${chSeco} charcos dibujados`);
  if (chLluvia > 10) ok(`con tormenta el agua se junta en los bajos: ${chLluvia} charcos en el cuadro`);
  else bad(`con tormenta no aparecieron charcos (${chLluvia} en el cuadro)`);
  await js('__lluvia(0)');

  console.log('\nconsola: ' + (errors.length ? errors.length + ' error(es)' : 'sin errores'));
  for (const e of errors.slice(0, 8)) console.error('   ' + e);
  console.log(fails || errors.length ? `\nFIXTURE TIERRA: FALLA (${fails})\n` : '\nFIXTURE TIERRA: OK\n');
  app.exit(fails || errors.length ? 1 : 0);
}).catch(e => { console.error('reventó:', e); app.exit(1); });
process.on('unhandledRejection', e => { console.error('REJECTION:', e && e.message); app.exit(1); });
