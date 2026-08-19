// FIXTURE DE ACEPTACION del poder LA CHANCHA (SPEC_PODER_CHANCHA §6), corrido en el juego de
// verdad.
//   npm run chancha                     · CHANCHA_SHOTS=/tmp/x npm run chancha  (deja capturas)
//
// Hermano de `npm run agua` y `npm run tierra`, y fuera de `check` por lo mismo: son segundos de
// vuelo REAL, y lo que prueba no es una formula sino que la mecanica entera funcione adentro del
// juego.
//
// LO QUE CUIDA: que el poder sea CARO y JUSTO. Que los gates contesten (y no consuman la barra),
// que la nafta suba SOLO enganchado, que salirse corte, que la ventana venza — y que morir en
// plena cita no rompa nada ni devuelva el poder.
const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const ROOT = path.join(__dirname, '..');
const OUT = process.env.CHANCHA_SHOTS || '';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const errors = [];
let win, fails = 0;
const bad = m => { console.error('   ✗ ' + m); fails++; };
const ok = m => console.log('   ✓ ' + m);
const js = s => win.webContents.executeJavaScript(s);
const CH = async () => JSON.parse(await js('String(window.__chadbg && window.__chadbg())') || 'null');
const estado = () => js('JSON.parse(__pausedbg()).state');
// LO QUE DIJO LA RADIO desde la ultima consulta. `__seapop` devuelve las lineas EN PANTALLA
// unidas por ' | ' y se vacia al leer, asi que cada paso mira su propia ventana — que es
// exactamente lo que hace falta para no confundir la respuesta de un pedido con la del anterior.
const radio = async () => JSON.parse(await js('__seapop()'));
async function shot(n) {
  if (!OUT) return;
  fs.writeFileSync(path.join(OUT, n + '.png'), (await win.webContents.capturePage()).toPNG());
}
const down = k => win.webContents.sendInputEvent({ type: 'keyDown', keyCode: k });
const up = k => win.webContents.sendInputEvent({ type: 'keyUp', keyCode: k });
const tap = async k => { down(k); await sleep(60); up(k); await sleep(110); };

/** Entra a POR LA PATRIA volando (mismo camino de menu que los otros dos fixtures) y deja el mar
 *  despejado: lo que se mide es la cita, no si te comes una fragata mientras subis. */
async function volar() {
  await win.loadURL('file://' + path.join(ROOT, 'src', 'index.html') + '?qa');
  await sleep(2600);
  await tap('Return'); await tap('Down'); await tap('Return');
  await tap('Down'); await tap('Return'); await tap('Return');
  for (let i = 0; i < 60; i++) {
    if (await estado() === 'play') { await js("__tierraset('sea'); __chafuel(1)"); await sleep(700); return true; }
    await sleep(200);
  }
  return false;
}
/** Sostiene el avion en un punto (la gravedad no perdona) y devuelve el estado de la cita. */
async function sostener(x, y, ms) {
  const t0 = Date.now();
  let last = null;
  while (Date.now() - t0 < ms) {
    await js(`__seaclear(); __chacalma(); __chaput(${x}, ${y})`);
    await sleep(90);
    last = await CH();
  }
  return last;
}
/** Pide la Chancha con todos los gates puestos y espera a que aparezca. */
async function citar() {
  await js(`__seaclear(); __chaset(9999, 300); __chaput(0, ${30})`);
  await js('__chacall()');
  for (let i = 0; i < 120; i++) {
    await js(`__seaclear(); __chacalma(); __chaput(0, 30)`);
    await sleep(150);
    const c = await CH();
    if (c && c.fase === 'cita') return c;
  }
  return null;
}

app.whenReady().then(async () => {
  console.log('\nFIXTURE — EL PODER LA CHANCHA (H0-H5)\n');
  win = new BrowserWindow({ width: 1280, height: 760, show: false, webPreferences: { backgroundThrottling: false } });
  win.webContents.on('console-message', (e, l, m) => { if (l >= 3 && !m.includes('Security Warning')) errors.push(m.slice(0, 300)); });
  win.webContents.on('render-process-gone', (e, d) => errors.push('EL RENDERER MURIO: ' + JSON.stringify(d)));

  if (!await volar()) { console.error('   ✗ no se pudo entrar a volar'); app.exit(1); return; }
  if (!await CH()) { console.error('   ✗ la sonda __chadbg no responde'); app.exit(1); return; }

  // ---------- 1. LOS GATES CONTESTAN, Y NO COBRAN ----------
  console.log('1. pedirla antes de tiempo (paso 1 del §6):');
  await js('__chaset(9999, 10)');                      // barra llena, pero recien empieza la mision
  const antes = await CH();
  await js('__chacall()');
  await sleep(200);
  const tras = await CH();
  if ((await radio()).includes('TODAVIA NO')) ok('con la mision recien empezada, la radio contesta que aguantes');
  else bad('pedirla antes de CH_MIN_T no contesto ch_early');
  if (tras.meter >= antes.meter && !tras.usada && tras.fase === 'idle')
    ok(`y NO cobra la barra: sigue llena (${tras.meter}) y sin usar`);
  else bad(`un gate fallado igual gasto el poder (meter ${antes.meter} → ${tras.meter}, usada ${tras.usada})`);

  // ---------- 2. LA CITA ----------
  console.log('\n2. la cita: viene, aparece y carga SOLO en la canasta (paso 2):');
  await js('__chaset(9999, 300)');
  await js('__chacall()');
  await sleep(300);
  const eta = await CH();
  if (eta.fase === 'eta' && eta.eta > 0) ok(`pedida: viene en ${eta.eta} s (y la barra se consumio: ${eta.meter})`);
  else bad(`el pedido con gates validos no arranco el ETA (${JSON.stringify(eta)})`);
  if (eta.usada && eta.meter === 0) ok('la barra se cobra AL CONFIRMAR, no al conectar: el pedido es irreversible');
  else bad('la barra no se consumio en el pedido');

  let cita = null;
  for (let i = 0; i < 200; i++) {
    await js('__seaclear(); __chacalma(); __chaput(0, 30)');
    await sleep(150);
    cita = await CH();
    if (cita.fase === 'cita') break;
  }
  if (cita && cita.fase === 'cita') ok(`la Chancha llego: canasta en x ${cita.bx}, y ${cita.by} (caja ±${cita.caja})`);
  else bad('la Chancha nunca aparecio');
  await shot('ch_cita');

  // LEJOS DE LA CANASTA NO PASA NADA. Es la mitad que hace que la cita sea pilotaje: si cargara
  // por estar cerca, el poder seria "apretar 5 y esperar".
  await js('__seaclear(); __chacalma(); __seaput(6)');   // bien abajo, a ras
  const f0 = await js('__chanafta()');
  await sostener(0, 6, 1500);
  const f1 = await js('__chanafta()');
  if (f1 <= f0) ok(`a ras del mar la nafta NO sube (${f0.toFixed(1)} → ${f1.toFixed(1)}): hay que ir a buscarla`);
  else bad(`la nafta subio sin estar en la canasta (${f0.toFixed(1)} → ${f1.toFixed(1)})`);

  // Y EN LA CANASTA SI. Se vuela a la caja (la canasta deriva, asi que se relee cada vez).
  let c2 = await CH();
  const fa = await js('__chanafta()');
  for (let i = 0; i < 14; i++) {
    c2 = await CH();
    await js(`__seaclear(); __chacalma(); __chaput(${c2.bx}, ${c2.by})`);
    await sleep(110);
  }
  const fb = await js('__chanafta()');
  const conn = (await CH()).conn;
  if (conn) ok('metido en la caja, engancha');
  else bad('estando en la caja no engancho');
  if (fb > fa + 2) ok(`y la nafta sube enganchado: ${fa.toFixed(1)} → ${fb.toFixed(1)}%`);
  else bad(`enganchado la nafta no subio (${fa.toFixed(1)} → ${fb.toFixed(1)})`);
  await shot('ch_enganchado');

  // ---------- 3. SALIRSE CORTA, VOLVER RETOMA ----------
  console.log('\n3. el eslabon debil sos vos (paso 3):');
  const cSal = await CH();
  await sostener(cSal.bx + 30, cSal.by, 700);
  const fuera = await CH();
  if (!fuera.conn) ok('un drift sostenido corta la transferencia');
  else bad('salirse de la caja no desengancho');
  const fc = await js('__chanafta()');
  for (let i = 0; i < 10; i++) { const c3 = await CH(); await js(`__seaclear(); __chacalma(); __chaput(${c3.bx}, ${c3.by})`); await sleep(110); }
  const fd = await js('__chanafta()');
  if ((await CH()).conn && fd > fc) ok(`y volver RETOMA: ${fc.toFixed(1)} → ${fd.toFixed(1)}%`);
  else bad(`reconectar no retomo la carga (${fc.toFixed(1)} → ${fd.toFixed(1)})`);
  // UN GOLPE tambien corta: la manguera no aguanta un avion sacudido
  await js('__chagolpe()');
  await sleep(200);
  if (!(await CH()).conn) ok('y un golpe la arranca: la manguera no aguanta un avion sacudido');
  else bad('un golpe no desengancho');

  // ---------- 4. LA VENTANA VENCE ----------
  console.log('\n4. la ventana vence y ella vira a casa (paso 4):');
  const win0 = (await CH()).win;
  let venc = null;
  for (let i = 0; i < 260; i++) {
    await js('__seaclear(); __chacalma(); __chaput(0, 30)');
    await sleep(150);
    venc = await CH();
    if (venc.fase !== 'cita') break;
  }
  if (venc && venc.fase !== 'cita') ok(`la ventana se agoto (quedaban ${win0} s) y la Chancha se fue: lo no cargado, se perdio`);
  else bad('la ventana nunca vencio');

  // ---------- 5. UNA SOLA VEZ POR CORRIDA ----------
  console.log('\n5. una sola vez por corrida (paso 5):');
  await js('__chaset(9999, 300)');
  await js('__chacall()');
  await sleep(250);
  const dos = await CH();
  if ((await radio()).includes('YA TE CARGUE')) ok('el segundo pedido contesta que ya no hay mas');
  else bad('el segundo pedido no contesto ch_used');
  // se mira que NO haya cita nueva, no que la fase sea 'idle': la primera Chancha puede estar
  // todavia yendose por arriba (la salida dura CH_SALIDA), y eso no es un segundo pedido.
  if (dos.fase !== 'eta' && dos.fase !== 'cita') ok('y no viene: se gasto, se gasto');
  else bad(`el segundo pedido armo otra cita (${dos.fase})`);

  // ---------- 6. SIN COMBUSTIBLE EL PODER NO EXISTE ----------
  console.log('\n6. con COMBUSTIBLE: NO el poder ni se muestra (paso 6):');
  if (!await volar()) bad('no se pudo re-entrar (combustible)');
  else {
    await js('__chafuel(0); __chaset(9999, 300); __seapop()');
    await js('__chacall()');
    await sleep(250);
    const sinN = await CH();
    const dijo = (await radio()).length;
    if (sinN.fase === 'idle' && !sinN.usada) ok('la tecla es muda: no arma cita ni gasta nada');
    else bad(`con el combustible apagado igual paso algo (${JSON.stringify(sinN)})`);
    if (!dijo) ok('y no dice nada: el poder no existe, no es que "no se puede ahora"');
    else bad('con el combustible apagado igual contesto por radio');
    await js('__chafuel(1)');
  }

  // ---------- 6b. LOS MODOS DE CLIMAX SUELTO ----------
  // RF-07: en ARENA, PASADA y MINUTOS SAGRADOS, jamas — ahi la nafta ES el reloj del climax.
  // MINUTOS SAGRADOS entra derecho al estado 'arena' y por eso nunca tuvo el agujero; PASADAS
  // MORTALES arranca con setState('play') —es una aproximacion corta, no una zona— y ahi el poder
  // quedaba disponible. Se prueba ese, que es el que se escapaba.
  console.log('\n6b. en los modos de climax suelto no entra (RF-07):');
  await js("__chamodo('pasadas'); __chaset(9999, 300); __seapop()");
  await js('__chacall()');
  await sleep(250);
  const suelto = await CH();
  if ((await radio()).includes('ACA NO ENTRA NADIE')) ok('en PASADAS MORTALES la radio contesta que aca no entra nadie');
  else bad('en PASADAS MORTALES no contesto ch_nozone');
  if (suelto.fase === 'idle' && !suelto.usada) ok('y no arma cita: el poder queda intacto para el pasillo');
  else bad(`en PASADAS MORTALES igual armo la cita (${suelto.fase})`);
  await js("__chamodo('survival')");

  // ---------- 7. LA ROTURA DEL GUION ----------
  console.log('\n7. despues de la rotura, la Chancha no baja al sur (paso 7):');
  const mis = JSON.parse(await js('__chamis(5)'));   // m6: la primera posterior al epilogo de m5
  await js('__chaset(9999, 300); __seapop()');
  await js('__chacall()');
  await sleep(250);
  const rota = await CH();
  if (mis.rota) ok(`${mis.id} viene con la Chancha rota (missions.js: chancha:false)`);
  else bad(`${mis.id} no esta marcada como posterior a la rotura`);
  if ((await radio()).includes('NO BAJA MAS AL SUR')) ok('y la radio contesta la negativa del guion');
  else bad('en mision rota no contesto ch_broken');
  if (rota.fase === 'idle' && !rota.usada) ok('no viene, y el poder queda intacto para otra mision');
  else bad('la mision rota igual armo la cita');

  // ---------- 8. MORIR EN PLENA CITA ----------
  console.log('\n8. morir durante la cita no rompe nada (paso 8):');
  if (!await volar()) bad('no se pudo re-entrar (muerte)');
  else {
    await js('__sealives(4)');
    const c4 = await citar();
    if (!c4) bad('no se pudo armar la cita para la prueba de muerte');
    else {
      // a ras del mar y sin sacarlo: el roce se come el margen y el avion se pierde
      for (let i = 0; i < 40; i++) {
        await js('__seaput(0.2)');
        await sleep(120);
        if (await estado() !== 'play') break;
      }
      const st = await estado();
      // se le da un respiro antes de mirar: la despedida ocurre en el cuadro siguiente al que
      // saca al jugador del pasillo, y preguntar en el mismo milisegundo es una carrera perdida
      await sleep(500);
      const fin = await CH();
      if (st !== 'play') ok(`el avion se perdio en plena cita (estado ${st}) y el juego siguio`);
      else bad('no se logro morir durante la cita');
      if (fin.fase === 'idle') ok('la Chancha se despide sola: no queda una cita colgada sin avion');
      else bad(`la cita quedo viva sin avion (${fin.fase})`);
      if (fin.usada) ok('y el poder queda GASTADO: se pidio, vino, y el que no estaba fuiste vos');
      else bad('morir devolvio el poder');
    }
  }

  // ---------- 9. EL PRECIO (RF-05) ----------
  // La cita se paga volando alto: el radar te ve y el multiplicador se cae. NO se usa __chacalma
  // aca a proposito — es justo lo que este paso viene a medir, y apagarlo seria medir un mundo
  // que el jugador nunca juega.
  console.log('\n9. la cita se paga arriba (RF-05):');
  if (!await volar()) bad('no se pudo re-entrar (precio)');
  else {
    await js('__seaclear(); __seaput(4, 0)');
    await sleep(1200);
    const abajo = JSON.parse(await js('__charadar()'));
    for (let i = 0; i < 22; i++) { await js('__seaclear(); __chaput(0, 44)'); await sleep(120); }
    const arriba = JSON.parse(await js('__charadar()'));
    if (arriba.seen && !abajo.seen) ok(`a la altura de la cita el radar te VE (deteccion ${abajo.det} → ${arriba.det}); a ras, no`);
    else bad(`la altura de la cita no cambia la deteccion (abajo ${JSON.stringify(abajo)} / arriba ${JSON.stringify(arriba)})`);
    if (arriba.mult <= abajo.mult) ok(`y el multiplicador se cae solo: x${abajo.mult} a ras, x${arriba.mult} arriba`);
    else bad(`arriba el multiplicador era mayor (x${abajo.mult} → x${arriba.mult})`);
  }

  console.log('\nconsola: ' + (errors.length ? errors.length + ' error(es)' : 'sin errores'));
  for (const e of errors.slice(0, 8)) console.error('   ' + e);
  console.log(fails || errors.length ? `\nFIXTURE CHANCHA: FALLA (${fails})\n` : '\nFIXTURE CHANCHA: OK\n');
  app.exit(fails || errors.length ? 1 : 0);
}).catch(e => { console.error('reventó:', e); app.exit(1); });
process.on('unhandledRejection', e => { console.error('REJECTION:', e && e.message); app.exit(1); });
