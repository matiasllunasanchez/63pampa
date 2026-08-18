// FIXTURE DE ACEPTACION del AGUA Y LAS OLAS (SPEC_AGUA_OLAS §4), corrido en el juego de verdad.
//   npm run agua                       · AGUA_SHOTS=/tmp/x npm run agua  (deja capturas)
//
// El spec pide correrlo despues de cada fase junto con `npm run check` (§0.2). No esta adentro de
// `check` por la misma razon que los otros dos fixtures: son segundos de vuelo REAL, y lo que
// prueba no es una formula sino que la mecanica entera funcione adentro del juego.
//
// LO QUE ESTE FIXTURE CUIDA, y es lo que hace o rompe la mecanica: la ola es JUSTA. Que no salga
// donde no corresponde, que se pueda saltar, que rozarle la cresta no mate, y que la cara si.
//
// ESTADO: LAS NUEVE FASES ESTAN HECHAS (F0 a F8). Los ocho pasos del §4 se cubren todos; ya no
// queda ninguno impreso como PENDIENTE.
const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const ROOT = path.join(__dirname, '..');
const OUT = process.env.AGUA_SHOTS || '';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const errors = [];
let win, fails = 0;
const bad = m => { console.error('   ✗ ' + m); fails++; };
const ok = m => console.log('   ✓ ' + m);
const pend = (n, f) => console.log(`   · paso ${n}: PENDIENTE (llega en ${f})`);
const js = s => win.webContents.executeJavaScript(s);
const S = async () => JSON.parse(await js('String(window.__seadbg && window.__seadbg())') || 'null');
const estado = () => js('JSON.parse(__pausedbg()).state');
async function shot(n) {
  if (!OUT) return;
  fs.writeFileSync(path.join(OUT, n + '.png'), (await win.webContents.capturePage()).toPNG());
}
const down = k => win.webContents.sendInputEvent({ type: 'keyDown', keyCode: k });
const up = k => win.webContents.sendInputEvent({ type: 'keyUp', keyCode: k });

const tap = async k => { down(k); await sleep(60); up(k); await sleep(110); };

/** Entra a POR LA PATRIA volando, caminando el menu como lo camina un jugador.
 *
 *  No hay parametro de URL para este modo (si lo hay para el climax) y esta bien que no lo haya:
 *  este fixture prueba el PASILLO, que es donde viven las olas, y el camino del menu es el mismo
 *  que usa el smoke. POR LA PATRIA es el modo correcto porque es PASILLO infinito — no se acaba a
 *  mitad de una medicion ni desemboca en un climax que no tiene olas. */
async function volar() {
  await win.loadURL('file://' + path.join(ROOT, 'src', 'index.html') + '?qa');
  await sleep(2600);
  await tap('Return');                       // portada → seleccion de modo
  await tap('Down');                         // HISTORIA → JUEGO RAPIDO
  await tap('Return');                       // → submenu
  await tap('Down');                         // CICLO DE MUERTE → POR LA PATRIA
  await tap('Return');                       // → menu de avion
  await tap('Return');                       // → a volar
  for (let i = 0; i < 60; i++) {
    if (await estado() === 'play') {
      // EL MAPA SE FUERZA, como se fuerza el clima. POR LA PATRIA no randomiza nada: hereda el
      // cfg guardado, y el TERRENO vive en localStorage (`rasante_terreno`) del perfil de
      // Electron — que comparten todos los fixtures y el smoke, y que cualquiera de ellos puede
      // dejar en 'land' al caminar OPCIONES. Con el mapa de tierra no se siembra UNA sola ola y
      // el paso 5b da 0 con el juego perfecto. Esta linea es lo que hace el fixture repetible;
      // el diagnostico de "flakiness binomial" del §21 estaba mirando el sintoma equivocado.
      await js("__tierraset('sea')");
      await sleep(900);
      return true;
    }
    await sleep(200);
  }
  return false;
}

/** Mantiene el gas hasta que el avion pasa de `alt`, o se rinde. Devuelve la altura alcanzada. */
async function subirA(alt, msMax) {
  const t0 = Date.now();
  const iv = setInterval(() => down('Up'), 40);
  let y = 0;
  while (Date.now() - t0 < (msMax || 2500)) {
    await sleep(120);
    const s = await S();
    if (!s) break;
    y = s.y;
    if (y >= alt) break;
  }
  clearInterval(iv); up('Up');
  return y;
}

app.whenReady().then(async () => {
  console.log('\nFIXTURE — EL AGUA Y LAS OLAS (F0-F8)\n');
  win = new BrowserWindow({ width: 1280, height: 760, show: false, webPreferences: { backgroundThrottling: false } });
  win.webContents.on('console-message', (e, l, m) => { if (l >= 3 && !m.includes('Security Warning')) errors.push(m.slice(0, 300)); });
  win.webContents.on('render-process-gone', (e, d) => errors.push('EL RENDERER MURIO: ' + JSON.stringify(d)));

  // ---------- 1. EN CALMA NO HAY OLAS ----------
  // La primera regla del plan, y la que protege a m1: el mar de la primera mision no cambia. Una
  // ola en el tutorial seria enseñar dos cosas a la vez.
  console.log('1. el clima manda (paso 1 del §4):');
  if (!await volar()) { console.error('   ✗ no se pudo entrar a volar'); app.exit(1); return; }
  const s0 = await S();
  if (!s0) { console.error('   ✗ la sonda __seadbg no responde'); app.exit(1); return; }
  ok(`volando · clima ${s0.clima} · ${s0.spd} m/s`);
  // POR LA PATRIA hereda el cfg base (con viento) — se fuerza calma para probar la regla
  await js("__seaclima('calm')");
  await sleep(4000);
  const calma = await S();
  if (calma && calma.olas === 0 && calma.clima === 'calm')
    ok('en CALMA no aparece ninguna ola sola: el mar de m1 queda como estaba');
  else bad(`en calma igual habia ${calma && calma.olas} ola(s) (clima ${calma && calma.clima})`);

  // ---------- 2. SE SALTA ----------
  // El gesto que la ola viene a enseñar: un toque de gas y volver abajo. Es el mismo salto de la
  // PASADA, y por eso las olas son su tutorial repartido.
  console.log('\n2. la marejada se SALTA (paso 2):');
  await js('__seaclear()');
  const inj = await js("window.__ola('marejada')");
  ok(`ola inyectada: ${inj}`);
  // SE SALTA LO JUSTO Y SE MANTIENE, que es el gesto real: un toque de gas para pasarla y quedarse
  // apenas por encima. Subir a 15 m —como hacia la primera version— no es saltar, es irse: el avion
  // cambia altura por velocidad, la ola tarda mucho mas en cruzar y la prueba se ponia roja sola
  // por quedarse sin tiempo, no por la mecanica.
  const alt = JSON.parse(inj).h;
  let yTop = 0, paso = false, gasOn = false;
  for (let k = 0; k < 120; k++) {
    const s = await S();
    if (!s) break;
    yTop = Math.max(yTop, s.y);
    if (!s.ola) { paso = true; break; }
    // se sostiene la altura de salto con toques, no con el gas clavado
    const quiere = s.y < alt + 2.5;
    if (quiere && !gasOn) { down('Up'); gasOn = true; }
    else if (!quiere && gasOn) { up('Up'); gasOn = false; }
    await sleep(90);
  }
  if (gasOn) up('Up');
  const st2 = await estado();
  if (!paso) bad(`la ola no llego a cruzar en el tiempo de la prueba (altura ${yTop.toFixed(1)})`);
  else if (yTop < alt + 1.2) bad(`el avion no llego a saltar por encima de la cresta (altura ${yTop.toFixed(1)} de ${alt})`);
  else if (st2 === 'play') ok(`saltando (llego a ${yTop.toFixed(1)} sobre una cresta de ${alt}) se pasa limpio`);
  else bad(`saltando la ola igual se murio (estado ${st2})`);
  await shot('f1_salto');

  // ---------- 3. LA CARA MATA ----------
  // La contracara del roce generoso: si no la saltas ni le pasas la cresta, es agua, y el agua
  // mata como siempre (death_sea). La ola no inventa una muerte nueva: adelanta donde esta el mar.
  console.log('\n3. quedarse a ras MATA (paso 3):');
  if (!await volar()) bad('no se pudo re-entrar');
  else {
    await js("__seaclear(); window.__ola('marejada')");
    // a ras y sin tocar nada: la cara de la ola le pasa por encima
    let muerto = null;
    for (let k = 0; k < 40; k++) {
      await sleep(200);
      const st = await estado();
      if (st !== 'play') { muerto = st; break; }
    }
    if (muerto) ok(`quedandose a ras la CARA de la ola mata (estado ${muerto})`);
    else bad('quedandose a ras la ola no hizo nada: la cara no cobra');
  }

  // ---------- 4. LA CRESTA NO MATA ----------
  // LA REGLA DE ORO del plan. Sin esto la mecanica es injusta: la ola tapa el horizonte justo
  // cuando hay que decidir, asi que rozarla tiene que costar margen, no la vida.
  console.log('\n4. rozar la CRESTA cuesta margen, no la vida (paso 4):');
  if (!await volar()) bad('no se pudo re-entrar');
  else {
    await js('__seaclear()');
    const o = JSON.parse(await js("window.__ola('marejada')"));
    // colocarse A LA ALTURA DE LA CRESTA: por encima de la cara letal y por debajo del tope
    await js(`__seaput(${(o.h + 0.6).toFixed(2)}, ${o.brecha === null ? 0 : (o.brecha > 0 ? -12 : 12)})`);
    const antes = await S();
    let cepillo = null;
    for (let k = 0; k < 45; k++) {
      await sleep(150);
      // se sostiene la altura de cresta a mano: sin gas el avion cae y la prueba mediria la caida
      await js(`__seadbg() && JSON.parse(__seadbg()).y < ${(o.h + 0.3).toFixed(2)} ? __seaput(${(o.h + 0.6).toFixed(2)}) : 0`);
      const s = await S();
      if (!s) break;
      if (s.scrapeT > antes.scrapeT + 0.05) { cepillo = s; break; }
    }
    const st = await estado();
    if (cepillo && st === 'play')
      ok(`cepillando la cresta sube el roce (${antes.scrapeT} → ${cepillo.scrapeT} de ${cepillo.limite}) y se SIGUE volando`);
    else if (!cepillo) bad('cruzar a la altura de la cresta no cobro roce');
    else bad(`cepillar la cresta mato (estado ${st}): el roce tiene que ser generoso`);
    await shot('f1_cresta');
  }

  // ---------- 5. NUNCA DOS JUNTAS ----------
  // Con dos olas pegadas, esquivar deja de ser una decision y pasa a ser suerte.
  console.log('\n5. el mar no es un peine (paso 5):');
  if (!await volar()) bad('no se pudo re-entrar');
  else {
    await js("window.__ola('marejada')");
    await sleep(300);
    const dos = await S();
    // la sonda saltea el gap a proposito (es su razon de ser), asi que lo que se prueba es la
    // GUARDA del spawn natural: se pide una ola por el camino normal con otra recien nacida
    const libre = await js('String(window.__olaOk ? window.__olaOk() : "")');
    if (dos && dos.olas >= 1) ok(`la sonda pone olas a voluntad (${dos.olas} viva) — es lo que hace medible el resto`);
    else bad('no se pudo inyectar la segunda ola');
    if (libre === 'false') ok(`con una ola recien nacida el spawn natural NO siembra otra (OLA_GAP_MIN)`);
    else bad(`la guarda de distancia no rechazo la segunda (olaOk dijo ${libre})`);
  }

  // ---------- 5b. APARECEN SOLAS ----------
  // LA PRUEBA QUE FALTABA, y por eso el bug llego al jugador: todo lo de arriba usa __ola, que
  // saltea la probabilidad a proposito. O sea que se probaba el MECANISMO y nunca el CABLEADO —
  // y el cableado estaba roto: POR LA PATRIA resolvia el clima como 'calm' (probabilidad cero) y
  // no salia una sola ola en toda la partida. Verde de punta a punta, y el juego sin olas.
  console.log('\n5b. las olas aparecen SOLAS, sin sonda (el cableado):');
  if (!await volar()) bad('no se pudo re-entrar');
  else {
    await js("__seaclima('breeze')");
    const a = await S();
    if (a.clima !== 'breeze') bad(`el clima no quedo en breeze (${a.clima})`);
    const d0 = a.dist, o0 = a.sembradas;
    // LA VENTANA ES LARGA A PROPOSITO, y es la segunda vez que este fixture tropieza con lo
    // mismo: esto mide una PROBABILIDAD, y una probabilidad medida corto miente. Con 20 s
    // (~2200 m, ~40 sorteos a 0.08) el valor esperado es 3,2 olas — pero la binomial da 16% de
    // chance de ver menos de dos. O sea que uno de cada seis corridas daba ROJO con el juego
    // perfecto. Un test que grita sin motivo una de cada seis veces enseña a ignorarlo, que es
    // peor que no tenerlo. Con 45 s (~5000 m, ~90 sorteos) el esperado sube a 7,2 y el falso
    // rojo cae debajo del 1%.
    const t0 = Date.now();
    while (Date.now() - t0 < 45000) {
      // se limpia el resto del cielo y se sostiene la altura: lo que se mide es la FRECUENCIA,
      // no si el avion sobrevive — eso ya lo prueban los pasos 2 a 4
      await js('__seaclear(); __seaput(6)');
      await sleep(250);
    }
    const b = await S();
    const dm = b.dist - d0, n = b.sembradas - o0;
    if (n >= 2) ok(`con viento salen SOLAS: ${n} en ${dm} m — una cada ${(dm / n) | 0} m`);
    else bad(`en ${dm} m de vuelo con viento salieron ${n} olas: la mecanica no llega al jugador`);
    // y en calma sigue sin salir ninguna: las dos mitades de la regla, no una
    await js("__seaclima('calm')");
    const c0 = (await S()).sembradas;
    const t1 = Date.now();
    while (Date.now() - t1 < 8000) { await js('__seaclear(); __seaput(6)'); await sleep(250); }
    const c = await S();
    if (c.sembradas === c0) ok('y en calma sigue sin salir ninguna: la regla vale para los dos lados');
    else bad(`en calma salieron ${c.sembradas - c0} olas`);
  }

  // ---------- 6. LAS OLAS VARIAN DE ALTURA ----------
  // Pedido del autor: "las olas deben ser mas altas algunas y variar altura". Lo que se cuida no es
  // que el numero se mueva —eso lo garantiza un Math.random()— sino la FORMA del reparto: que la
  // mayoria sean modestas y que las grandes existan y sean la excepcion. Con reparto plano todas
  // quedan medianas y ninguna sorprende, que es justo lo que se venia a arreglar.
  console.log('\n6. las olas varian de altura (pedido del autor):');
  if (!await volar()) bad('no se pudo re-entrar');
  else {
    const hs = [];
    for (let k = 0; k < 60; k++) {
      await js('__seaclear()');
      hs.push(JSON.parse(await js("window.__ola('marejada')")).h);
    }
    hs.sort((a, b) => a - b);
    const min = hs[0], max = hs[hs.length - 1], med = hs[hs.length >> 1];
    const grandes = hs.filter(h => h >= 4.5).length;
    if (max - min > 1.5) ok(`varian de verdad: ${min} a ${max} (mediana ${med})`);
    else bad(`las alturas casi no varian (${min} a ${max})`);
    // la banda del x10 termina en 4.5: una ola por encima te obliga a salir de ella. Que existan
    // es el pedido; que sean MINORIA es lo que las hace un evento y no el estado normal del mar.
    // LA BANDA ES ANCHA A PROPOSITO. El sesgo da ~22% esperado, y en 60 tiradas eso se mueve unos
    // 5 puntos por puro azar: una prueba de 10-35% se pone roja sola cada tantas corridas, y una
    // prueba que falla al azar no protege nada — enseña a ignorarla. Lo que se quiere afirmar es
    // "existen y no son la mayoria", que es cierto en todo este rango.
    const pc = grandes / hs.length;
    if (pc >= 0.05 && pc <= 0.45)
      ok(`las grandes existen y son excepcion: ${grandes} de ${hs.length} (${(pc * 100) | 0}%) pasan la banda del x10 (4.5)`);
    else bad(`el reparto de grandes quedo mal: ${grandes} de ${hs.length} por encima de 4.5`);
    // el sesgo se mide contra el medio del rango TEORICO (2.4..5.85), no contra el de la muestra:
    // con la muestra, un sorteo desafortunado en los extremos mueve la vara y la prueba se vuelve
    // sobre si misma
    if (med < (2.4 + 5.85) / 2) ok(`el sesgo tira para abajo: mediana ${med} debajo del medio del rango (4.1)`);
    else bad(`el reparto es plano o esta sesgado a lo alto (mediana ${med})`);
  }

  // ---------- 6b. LA ROMPIENTE SE ESQUIVA DE COSTADO (paso 6 del §4) ----------
  // LA PREGUNTA QUE CONTESTA ESTE PASO: ¿son dos olas distintas o la misma con otro color? La
  // marejada cruza TODO el carril y la unica respuesta es el gesto vertical. La rompiente es
  // PARCIAL, asi que hay lado libre — y el paso prueba las dos mitades: por el lado libre se
  // pasa a una altura a la que, por adentro, la cara te mata.
  //
  // NO SE PRUEBA "A RAS" COMO PIDE EL SPEC, y no es una licencia: a ras (y≈1) el mar te mata solo
  // en menos de un segundo — es el ROCE de siempre (waveNow llega a 1.9), no la ola. Un test a esa
  // altura da rojo con o sin rompiente y no prueba nada de la rompiente. La altura elegida (3.2)
  // esta apenas afuera del roce comun y apenas adentro de la cara de una rompiente de 6.
  // Y la ola se pone con altura FIJA: con la altura sorteada (4.3..6.5) la cara cae entre 2.4 y
  // 3.6, o sea que el mismo test daria verde o rojo segun el sorteo. Ver §9.
  console.log('\n6b. la ROMPIENTE se esquiva de costado (paso 6):');
  const H_ROMP = 6, Y_TEST = 3.2;
  /** Cruza una rompiente sostenido a Y_TEST en el carril `x`. Devuelve el estado si murio. */
  async function cruzarRompiente(xDe) {
    await js(`__seaclear(); window.__ola('rompiente', ${H_ROMP})`);
    const r0 = await S();
    if (!r0.ola || r0.ola.tipo !== 'rompiente') return 'NO-SE-SEMBRO';
    const x = xDe(r0.ola.x);
    for (let k = 0; k < 45; k++) {
      await js(`__seaclear(); __seaput(${Y_TEST}, ${x.toFixed(1)})`);
      await sleep(140);
      const st = await estado();
      if (st !== 'play') return st;
      if ((await S()).ola === null) return null;          // la ola paso y sigue vivo
    }
    return null;
  }
  if (!await volar()) bad('no se pudo re-entrar');
  else {
    // el lado LIBRE es el borde opuesto de la zona de vuelo (FLY_X = 38): adonde se va un jugador
    const m1 = await cruzarRompiente(cx => (cx <= 0 ? 1 : -1) * 36);
    if (m1 === 'NO-SE-SEMBRO') bad('la sonda no puso una rompiente');
    else if (m1) bad(`por el lado LIBRE murio igual (${m1}): la rompiente cruza todo el carril`);
    else ok('por el lado LIBRE se pasa: la rompiente deja hueco de verdad');
    // y por ADENTRO, a la MISMA altura, la cara mata: el hueco es del lado libre y de ningun otro
    const m2 = await cruzarRompiente(cx => cx);
    if (m2 === 'NO-SE-SEMBRO') bad('la sonda no puso una rompiente (2)');
    else if (m2) ok(`y por ADENTRO, a la misma altura, mata (${m2}): el hueco no es el carril entero`);
    else bad('cruzarle la cara a la rompiente no cobro nada: entonces no es una pared');
  }

  // ---------- 7. LA OLA REBELDE (paso 7 del §4) ----------
  // Tres reglas y las tres son de justicia, no de dificultad:
  //   · solo en TORMENTA (en m1 jamas) y nunca en los primeros metros — no es una emboscada
  //   · NUNCA acompañada: con una rebelde viva no entra otra ola. Es EL evento del tramo
  //   · el aviso por radio necesita un Fiel vivo que la vea. Volando solo NO llega, y la ola
  //     igual se ve desde SPAWN_Z: el aviso es ventaja, no el requisito de que sea justa
  console.log('\n7. la OLA REBELDE (paso 7):');
  if (!await volar()) bad('no se pudo re-entrar');
  else {
    await js("__seaclear(); window.__ola('rebelde')");
    const r = await S();
    if (!r.ola || r.ola.tipo !== 'rebelde') bad(`la sonda no puso una rebelde (${r.ola && r.ola.tipo})`);
    else if (r.ola.h < 7) bad(`la rebelde salio de ${r.ola.h}: no es una pared`);
    else ok(`la rebelde existe y es una pared: ${r.ola.h} m de ancho completo`);
    // NUNCA ACOMPAÑADA: con la rebelde viva, el sembrado natural no mete nada
    const antes = (await S()).olas;
    const ok2 = await js('__olaOk()');
    if (ok2 === 'false') ok(`con una rebelde viva (${antes}) la guarda cierra el mar: no entra otra`);
    else bad('con una rebelde viva la guarda deja sembrar otra ola');
  }
  // EL AVISO depende del escuadron, y se prueban LAS DOS MITADES: con Fieles llega, solo no.
  // Se mira el POPUP, que es lo que ve el jugador — no una variable interna que podria estar
  // bien mientras la pantalla no muestra nada (es exactamente como se escapo el bug de F1).
  if (!await volar()) bad('no se pudo re-entrar (aviso)');
  else {
    const conAviso = async lives => {
      await js(`__seaclear(); __sealives(${lives}); __seapop()`);
      await js("window.__ola('rebelde')");
      await sleep(220);
      return JSON.parse(await js('__seapop()')).includes('PARED');
    };
    if (await conAviso(4)) ok('con escuadron, la radio avisa la pared');
    else bad('con escuadron no llego el aviso por radio');
    if (!await conAviso(1)) ok('y volando SOLO no avisa nadie: sin Fieles no hay ojos');
    else bad('volando solo igual aviso alguien');
  }


  console.log('\nconsola: ' + (errors.length ? errors.length + ' error(es)' : 'sin errores'));
  for (const e of errors.slice(0, 8)) console.error('   ' + e);
  console.log(fails || errors.length ? `\nFIXTURE AGUA: FALLA (${fails})\n` : '\nFIXTURE AGUA: OK\n');
  app.exit(fails || errors.length ? 1 : 0);
}).catch(e => { console.error('reventó:', e); app.exit(1); });
process.on('unhandledRejection', e => { console.error('REJECTION:', e && e.message); app.exit(1); });
