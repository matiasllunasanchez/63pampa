// FIXTURE DE ACEPTACION de LAS CHARLAS EN VUELO (docs/sistemas/SPEC_CHARLAS_VUELO.md §4),
// corrido en el juego de verdad.
//   npm run charlas
//
// LO QUE CUIDA, y crece con las fases:
//   C0 — 1. UNA MISION SIN CHARLAS NO CAMBIA EN NADA. Es el assert mas importante del spec y
//           hereda la regla suprema de los TRAMOS: en 'idle' el sistema contesta que si a todo y
//           no toca un solo numero. Se miden los GATES RESUELTOS, no el estado interno.
//        2. SE ARMA Y ARRANCA (RF-01) — con el corredor ya limpio, el dialogo empieza enseguida.
//        3. EL MOTOR ES EL DE SIEMPRE Y AVANZA SOLO (RF-04): sin tocar una tecla, la linea cambia.
//        4. TERMINA SOLA Y VUELVE EL MUNDO: la burbuja no deja el pasillo apagado.
//        5. EL DRENAJE, con el corredor LLENO (RF-01): el sembrador se apaga en el cuadro del
//           armado y lo ya sembrado pasa de largo. Nada se borra.
//        6. LA MUERTE LA CORTA Y EL REINTENTO LA REPONE (RF-06).
//        7. EL TOPE DURO (CHV_MAX_S) llega al sistema. Que ninguna escena del guion lo roce lo
//           prueba `npm run unit`, que es el unico que ve el texto.
//        8. CERO ERRORES DE CONSOLA.
//
// COMO MIDE: entra por `?charla=<ID>`, que arranca POR LA PATRIA en el aire y arma la charla a los
// 300 m. POR LA PATRIA y no una mision con tramos a proposito: en un modo infinito no hay objetivo
// que se cumpla ni climax que interrumpa, asi que la burbuja se puede mirar entera. El avion se
// sostiene con `__czalto`/`__czspd` en vez de con el gas — una tecla sostenida es `anyPress`
// treinta veces por segundo y eso adelanta las pantallas, lo aprendio el fixture del selector.
//
// EL DRENAJE SE MIDE APARTE, y no en el arranque de la sonda: a los 300 m de POR LA PATRIA el
// corredor todavia esta VACIO (el primer sembrado cae recien pasados los 600 m), asi que ahi el
// drenaje dura cero y no prueba nada. Para medirlo hay que armar la charla CON el corredor lleno,
// que es para lo que existe `__cvarm`.
//
// Corre APARTE de `npm run check`, como caza / chancha / tramos.
const { app, BrowserWindow } = require('electron');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const sleep = ms => new Promise(r => setTimeout(r, ms));

// UNA PROMESA QUE REVIENTA NO PUEDE COLGAR LA PRUEBA (el patron de los otros doce fixtures).
process.on('unhandledRejection', e => { console.error('   ✗ REVENTO: ' + (e && e.message)); app.exit(1); });

const errors = [];
let win, fails = 0;
const bad = m => { console.error('   ✗ ' + m); fails++; };
const ok = m => console.log('   ✓ ' + m);
const js = s => win.webContents.executeJavaScript(s);
const CV = async () => JSON.parse(await js('String(window.__cvdbg && window.__cvdbg())') || 'null');
const TR = async () => JSON.parse(await js('String(window.__trdbg && window.__trdbg())') || 'null');
const estado = async () => JSON.parse(await js('__pausedbg()'));

/** Espera a que el juego esté volando y deja el avión nivelado y sin teclas. */
async function volando() {
  let s = '';
  for (let i = 0; i < 90; i++) { s = (await estado()).state; if (s === 'play') break; await sleep(150); }
  if (s !== 'play') return false;
  await js('__czalto(9); __czspd(74)');
  return true;
}

/** Espera hasta `ms` a que `pred(foto)` sea cierto. Devuelve la foto que la cumplio, o la ultima
 *  que vio. `paso` corto a proposito: la fase 'armada' puede durar decimas. */
async function hasta(pred, ms, paso) {
  const t0 = Date.now();
  let c = await CV();
  while (Date.now() - t0 < ms) {
    if (c && pred(c)) return c;
    await sleep(paso === undefined ? 100 : paso);
    c = await CV();
  }
  return c;
}

app.whenReady().then(async () => {
  console.log('\nFIXTURE — LAS CHARLAS EN VUELO: dialogo sin pausar el mundo (SPEC_CHARLAS_VUELO)\n');
  win = new BrowserWindow({ width: 1000, height: 640, show: false, webPreferences: { backgroundThrottling: false } });
  win.webContents.on('console-message', (e, l, m) => { if (l >= 3 && !m.includes('Security Warning')) errors.push(m.slice(0, 300)); });
  win.webContents.on('render-process-gone', (e, d) => errors.push('EL RENDERER MURIO: ' + JSON.stringify(d)));
  const cargar = async qs => { await win.loadURL('file://' + path.join(ROOT, 'src', 'index.html') + qs); await sleep(2600); };

  // ================= 1. UNA MISION SIN CHARLAS (el assert mas importante del spec) =================
  // Se vuela una mision REAL de la campaña —m4, la que mas tramos tiene de todas— sin una sola
  // `charla:` en ninguno de ellos. Si el item cambiara algo, es la mision donde mas se notaria.
  console.log('1. una mision SIN charlas se comporta igual que hoy:');
  await cargar('');
  if (!await js('typeof window.__cvdbg === "function"')) {
    console.error('   ✗ la sonda __cvdbg no existe'); app.exit(1); return;
  }
  await js(`__mision('m4')`);
  if (!await volando()) { console.error('   ✗ no se pudo entrar a volar'); app.exit(1); return; }
  const limpio = await CV();
  if (limpio && limpio.fase === 'idle' && limpio.escena === null)
    ok('la charla arranca y se queda en idle: no hay nada armado');
  else bad(`una mision sin charlas reporta ${JSON.stringify(limpio)}`);
  // LOS TRES GATES RESUELTOS, que es lo que de verdad leen los otros modulos. Medir la fase sola
  // no alcanzaria: la fase podria estar bien y el gate mal cableado, y eso es exactamente el bug
  // que se llevaria puesto el pasillo entero sin dar un error.
  if (limpio && limpio.sembrar === true && limpio.avance === 1 && limpio.hablando === false)
    ok('los tres gates en su valor neutro: siembra sí, avance ×1, nadie hablando');
  else bad(`los gates en idle son ${JSON.stringify(limpio && { s: limpio.sembrar, a: limpio.avance, h: limpio.hablando })}`);
  // …y el mundo se comporta: pasado el tramo mudo del Narwal el pasillo siembra como siempre.
  // Se espera de verdad — `run.nextSpawn` se descuenta con METROS VOLADOS y no se reinicia con el
  // salto, asi que el primer obstaculo despues de un `__wjump` tarda lo que tenia pago.
  await js('__wjump(0.45)');
  const pobl = await hasta(c => c.obst > 0, 12000, 400);
  if (pobl && pobl.obst > 0) ok(`el pasillo sigue vivo: ${pobl.obst} obstaculo(s) en el corredor`);
  else bad('con la charla en idle el pasillo quedo vacio — el gate esta cortando lo que no debe');
  // y los tramos, intactos: la clave nueva no rompio la resolucion de las viejas
  const tr = await TR();
  if (tr && tr.charla === null && tr.idx !== null) ok(`los tramos siguen resolviendo (idx ${tr.idx}) y ninguno pide charla`);
  else bad(`los tramos reportan ${JSON.stringify(tr && { idx: tr.idx, charla: tr.charla })}`);

  // ================= 2. SE ARMA Y ARRANCA (RF-01) =================
  console.log('\n2. la charla se arma sola y arranca con el corredor limpio:');
  await cargar('?charla=M01_RITUAL');
  if (!await volando()) { console.error('   ✗ no se pudo entrar a volar'); app.exit(1); return; }
  const antes = await CV();
  if (antes && antes.fase === 'idle') ok(`antes de los 300 m no hay charla (dist ${antes.dist})`);
  else bad(`la charla arranco antes de tiempo: ${JSON.stringify(antes && antes.fase)}`);
  const arranco = await hasta(c => c.fase !== 'idle', 15000, 80);
  if (arranco && arranco.escena === 'M01_RITUAL')
    ok(`se armo a los ${arranco.dist} m con la escena que pidio la sonda (M01_RITUAL)`);
  else bad(`no llego a armarse: ${JSON.stringify(arranco)}`);
  // EL SEMBRADOR SE APAGA EN EL MISMO CUADRO DEL ARMADO. Es lo que hace posible el drenaje: si
  // siguiera sembrando, el corredor no se vaciaria nunca.
  if (arranco && arranco.sembrar === false) ok('el sembrador quedo apagado desde el armado');
  else bad('la charla esta armada y el sembrador sigue sembrando');
  const activa = await hasta(c => c.fase === 'activa', 12000, 80);
  if (activa && activa.fase === 'activa') ok(`arranco el dialogo (drenaje ${activa.dren.toFixed(2)} s: el corredor ya estaba limpio)`);
  else bad(`la charla no llego a activarse: ${JSON.stringify(activa)}`);
  if (activa && activa.obst === 0 && activa.sold === 0 && activa.msl === 0)
    ok('cero enemigos en pantalla al empezar a hablar (RF-01)');
  else bad(`arranco con ${activa && activa.obst} obstaculos, ${activa && activa.sold} soldados y ${activa && activa.msl} misiles vivos`);

  // ================= 3. EL MOTOR ES EL DE SIEMPRE Y AVANZA SOLO (RF-04) =================
  console.log('\n3. el motor de siempre, con el auto-avance puesto:');
  if (activa && activa.auto === true) ok('`dlg.auto` prendido: en vuelo las manos estan ocupadas (§6.2)');
  else bad('la charla corre con el auto-avance apagado — el jugador tendria que apretar volando');
  const li0 = activa ? activa.li : -1;
  console.log(`   linea ${li0}: "${activa && activa.txt}"`);
  // SIN TOCAR UNA SOLA TECLA la linea tiene que cambiar. Es la prueba entera del RF-04: si
  // avanzara por input, aca no pasaria nada nunca.
  const t0 = Date.now();
  const sig = await hasta(c => c.li > li0, 18000, 200);
  if (sig && sig.li > li0) {
    ok(`avanzo sola de la linea ${li0} a la ${sig.li} en ${((Date.now() - t0) / 1000).toFixed(1)} s, sin tocar una tecla`);
    console.log(`   linea ${sig.li}: "${sig.txt}"`);
  } else bad('la linea no avanzo sola en 18 s: el auto-avance no esta corriendo');

  // ================= 4. TERMINA SOLA Y EL MUNDO VUELVE =================
  console.log('\n4. termina sola y el pasillo vuelve:');
  const fin = await hasta(c => c.fase === 'idle', 45000, 250);
  if (fin && fin.fase === 'idle') ok('la charla se cerro sola y volvio a idle');
  else bad(`la charla no cerro: ${JSON.stringify(fin)}`);
  if (fin && fin.sembrar === true && fin.avance === 1) ok('los gates volvieron a su valor neutro: el pasillo esta prendido otra vez');
  else bad(`al terminar los gates quedaron en ${JSON.stringify(fin && { s: fin.sembrar, a: fin.avance })}`);
  if (fin && fin.auto === false) ok('y el auto-avance quedo devuelto (el guion de tierra no se avanza solo)');
  else bad('la charla dejo `dlg.auto` prendido: el proximo guion se va a avanzar solo');
  if (fin && fin.cortada === false) ok('cerro por las buenas: no figura como cortada');
  else bad('la charla figura como cortada y nadie la corto');

  // ================= 5. EL DRENAJE, CON EL CORREDOR LLENO (RF-01) =================
  // Recien acá el drenaje mide algo: se arma con el corredor POBLADO. Es la unica forma de ver
  // que lo sembrado PASA DE LARGO en vez de desaparecer — que la charla borrara el corredor
  // seria ver una fragata evaporarse delante de los ojos.
  //
  // SE MIDE CON SOLDADOS Y NO CON OBSTACULOS, y no es capricho: el avion esta clavado por sonda
  // (`__czalto`) para poder medir, o sea que no esquiva, y a los pocos segundos se come lo
  // primero que le pase por el carril — se midio: la seccion moria antes de terminar de drenar y
  // acusaba al drenaje. Los soldados pueblan el corredor igual (cuentan para `limpia` igual que
  // un obstaculo), nacen cada 26-60 m en COSTA, y no matan. Asi la seccion mide el drenaje y
  // nada mas. `__trset` con `obstacles: 0` apaga lo que si mata, sin tocar la mision.
  console.log('\n5. el drenaje, con el corredor lleno:');
  await js(`__mision('m3')`);   // patrulla COSTERA: la unica con soldados en el guion
  if (!await volando()) { console.error('   ✗ no se pudo entrar a volar'); app.exit(1); return; }
  const errT = JSON.parse(await js('__trset([{"hasta":1,"obstacles":0,"bombs":0,"caza":0}])'));
  if (errT.length) bad(`el validador rechazo los tramos de prueba: ${errT.join(' · ')}`);
  const lleno = await hasta(c => c.sold >= 3, 25000, 300);
  if (!lleno || lleno.sold < 3) bad(`el corredor no se poblo (${lleno && lleno.sold} soldados): no se puede medir el drenaje`);
  else {
    console.log(`   se arma con ${lleno.sold} soldados y ${lleno.obst} obstaculos vivos en el corredor`);
    await js('__cvarm("M01_RITUAL")');
    const arm = await CV();
    if (arm && arm.fase === 'armada' && arm.sembrar === false)
      ok(`quedo en 'armada' y el sembrador se apago en el mismo cuadro (${arm.sold} soldados todavia vivos)`);
    else bad(`tras armar con el corredor lleno quedo en ${JSON.stringify(arm && { f: arm.fase, s: arm.sembrar })}`);
    // EL CORREDOR SE VACIA SOLO: se muestrea la poblacion mientras drena. Lo que importa no es un
    // numero final sino que BAJE — nadie borro nada, pasaron de largo.
    const serie = [];
    const tD = Date.now();
    let c = arm, alHablar = null;
    while (Date.now() - tD < 9000) {
      serie.push(c ? c.sold : -1);
      // LA FOTO DEL INSTANTE EN QUE EMPIEZA A HABLAR, y no la de despues: el residuo hay que
      // medirlo AHI. Preguntarlo al final del muestreo daria siempre cero —para entonces el
      // corredor ya termino de drenar solo— y el numero que el §7 necesita quedaria escondido.
      if (c && c.fase !== 'armada' && !alHablar) alHablar = c;
      if (c && c.sold === 0 && alHablar) { serie.push(0); break; }
      await sleep(250);
      c = await CV();
    }
    console.log(`   soldados en el corredor durante el drenaje: ${serie.join(' → ')}`);
    if (serie.length > 2 && serie[serie.length - 1] < serie[0]) ok('el corredor se vacia solo: lo sembrado pasa de largo, no se borra');
    else bad(`la poblacion no bajo durante el drenaje: ${serie.join(' → ')}`);
    // …Y CUANTO QUEDABA AL EMPEZAR A HABLAR. Es la medicion que el spec no tenia: `CHV_DRAIN_S`
    // es un TOPE ("lo que llegue primero", RF-01) y a velocidad de crucero un corredor de
    // SPAWN_Z = 320 m tarda ~4,3 s en vaciarse — mas que los 2,5 del default. Ver la divergencia
    // 1 del §7 del spec: el numero es del autor, este renglon nada mas lo hace visible.
    const hab = alHablar || await hasta(x => x.fase !== 'armada', 8000, 120);
    if (hab && hab.fase === 'activa') {
      ok(`arranco a hablar con ${hab.sold} soldado(s) todavia en pantalla (drenaje ${hab.dren.toFixed(2)} s de un tope de ${hab.drenMax})`);
      if (hab.sold > 0) console.log('   ↑ OJO: el RF-01 pide CERO enemigos en pantalla. Ver §7 divergencia 1.');
    } else bad(`no llego a hablar: ${JSON.stringify(hab && hab.fase)}`);
    await js('__cvcut()');
  }

  // ================= 6. LA MUERTE LA CORTA, EL REINTENTO LA REPONE (RF-06) =================
  console.log('\n6. cortarla la corta, y se puede volver a disparar:');
  await js('__cvarm("M01_RITUAL")');
  const arm2 = await hasta(c => c.fase === 'activa', 14000, 120);
  if (arm2 && arm2.fase === 'activa') ok('otra charla, corriendo');
  else bad(`no se pudo armar otra charla: ${JSON.stringify(arm2 && arm2.fase)}`);
  // se la corta por el MISMO camino que la muerte: la sonda llama al mismo `cortar()` que usa el
  // orquestador al salir del pasillo, no a un atajo propio
  const cut = JSON.parse(await js('__cvcut()'));
  await sleep(250);
  const trasCut = await CV();
  if (cut.cortada && trasCut && trasCut.fase === 'idle' && trasCut.cortada === true)
    ok('se corto limpio: idle, sin fundido y marcada como cortada (RF-06)');
  else bad(`tras cortarla queda ${JSON.stringify(trasCut && { f: trasCut.fase, c: trasCut.cortada })}`);
  if (trasCut && trasCut.sembrar === true && trasCut.auto === false)
    ok('y no dejo nada colgado: el pasillo prendido y el auto-avance devuelto');
  else bad(`cortada la charla quedan ${JSON.stringify(trasCut && { s: trasCut.sembrar, a: trasCut.auto })}`);
  // …y se puede volver a disparar. Es la otra mitad del RF-06: al reintentar la mision el tramo
  // se vuelve a entrar, y la charla no puede estar "ya usada".
  await js('__cvarm("M01_RITUAL")');
  await sleep(300);
  const rearm = await CV();
  if (rearm && rearm.fase !== 'idle') ok(`se re-dispara sin problema (fase ${rearm.fase}): el momento vuelve al reintentar`);
  else bad('la charla no se pudo volver a armar');
  await js('__cvcut()');

  // ================= 7. EL TOPE DURO =================
  console.log('\n7. el tope duro por charla:');
  const topes = await CV();
  if (topes && topes.max > 0 && topes.drenMax > 0)
    ok(`declarados: tope ${topes.max} s por charla, drenaje maximo ${topes.drenMax} s`);
  else bad(`las perillas no llegan al sistema: ${JSON.stringify(topes && { max: topes.max, dren: topes.drenMax })}`);
  console.log('   (que ninguna escena del guion lo roce lo prueba `npm run unit`, que ve el texto)');

  // ================= 8. CONSOLA =================
  console.log('\n8. consola:');
  if (errors.length) { bad(`${errors.length} error(es):`); errors.slice(0, 8).forEach(e => console.error('     ' + e)); }
  else ok('sin errores');

  console.log(fails ? `\nCHARLAS: ${fails} FALLA(S)\n` : '\nCHARLAS: OK\n');
  app.exit(fails ? 1 : 0);
});
