// FIXTURE DE ACEPTACION del modo historia: el locker de m7 (SPEC_MODO_HISTORIA §6), corrido en el
// juego de verdad.
//   npm run story                      · STORY_SHOTS=/tmp/x npm run story  (captura cada linea)
//
// El spec pide correrlo DESPUES DE CADA FASE. No esta en `npm run check` porque son 13 segundos de
// silencios REALES (los holds del guion) y la exactitud al frame ya la cubre `npm run unit`, que
// corre siempre; esto prueba lo otro: que la escena entera funciona dentro del juego, sin assets.
// Lo que se verifica, que es distinto de lo que prueba `npm run unit`:
//   1. arranca con CERO assets y no tira un solo error (P2)
//   2. los holds se respetan EN EL JUEGO (reloj de frames real, no simulado)
//   3. una tecla completa el tipeo y NO saltea la linea (RF-02)
//   4. capturas de cada linea para mirarlo mudo
//
// La medicion se hace contra el reloj DEL JUEGO (holdLeft), no contra el de este proceso: entre
// que se manda la tecla y que vuelve la respuesta hay un ida y vuelta de IPC de ~20 ms, y con eso
// solo se puede afirmar "el silencio duro lo que tenia que durar" con esa granularidad.
const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const ROOT = path.join(__dirname, '..');
const OUT = process.env.STORY_SHOTS || '';        // STORY_SHOTS=<dir> guarda una captura por linea
const sleep = ms => new Promise(r => setTimeout(r, ms));
const errors = [];
let win, fails = 0;
const js = s => win.webContents.executeJavaScript(s);
async function shot(n) {
  if (!OUT) return;
  fs.writeFileSync(path.join(OUT, n + '.png'), (await win.webContents.capturePage()).toPNG());
}
const dbg = async () => JSON.parse(await js('String(window.__sdbg())'));
const tap = async k => {
  win.webContents.sendInputEvent({ type: 'keyDown', keyCode: k });
  await sleep(50);
  win.webContents.sendInputEvent({ type: 'keyUp', keyCode: k });
  await sleep(70);
};
const bad = m => { console.error('   ✗ ' + m); fails++; };

app.whenReady().then(async () => {
  win = new BrowserWindow({ width: 960, height: 540, show: false, webPreferences: { backgroundThrottling: false } });
  win.webContents.on('console-message', (e, l, m) => { if (l >= 3 && !m.includes('Security Warning')) errors.push(m.slice(0, 300)); });
  await win.loadURL('file://' + path.join(ROOT, 'src', 'index.html') + '?scene=M07_LOCKER');
  // entrar APENAS el motor existe: si se espera de mas, la primera linea ya se tipeo sola y su
  // silencio ya paso — no se podria medir nada de la linea 0
  for (let i = 0; i < 200; i++) {
    if (await js('String(typeof window.__sdbg)') === 'function') break;
    await sleep(50);
  }
  // la gracia de 0.4 s del arranque de secuencia (la tecla que confirmo el menu no saltea la
  // primera linea) tambien se come los primeros toques de ESTE proceso: esperarla.
  while ((await dbg()).seqT < 0.45) await sleep(50);
  let d = await dbg();
  console.log('estado al arrancar:', d.state, '· escena', d.scene, '· linea', d.line);
  if (d.state !== 'story') { console.error('NO entro a la escena'); app.exit(1); return; }

  // Lo que PIDE el guion, y el TECHO que el motor le aplica en pantalla (core/dialogue.js
  // HOLD_MAX, decision del autor del 19/8/2026: los silencios largos se sentian muertos al
  // jugarlos). Se comparan los dos a proposito: que el dato siga pidiendo 4 s es la mitad de la
  // decision — la intencion del director queda escrita y subir el techo la devuelve entera.
  const holds = [2.0, 1.0, 2.5, 1.5, 4.0, 2.0];
  const TECHO = 1.0;
  const esperado = holds.map(h => Math.min(h, TECHO));
  const medidos = [];
  for (let i = 0; i < 6; i++) {
    d = await dbg();
    console.log(`\nlinea ${i} · ${d.id} · ${d.personaje || '(acotacion)'} · hold ${d.hold} · cara ${d.cara || '—'}`);
    console.log(`   "${d.txt}"`);
    if (d.line !== i) bad(`esperaba la linea ${i} y estoy en la ${d.line}`);
    // 1. UNA tecla completa el tipeo — y no pasa a la siguiente linea (RF-02: completa, no saltea)
    if (d.done) bad('llegue tarde: la linea ya estaba tipeada, no puedo probar el completado');
    await tap('Space');
    d = await dbg();
    if (!d.done) bad('la tecla no completo el tipeo');
    if (d.typed !== d.len) bad(`quedo texto sin mostrar (${d.typed}/${d.len})`);
    if (d.line !== i) bad('la tecla SALTEO la linea en vez de completarla');
    console.log(`   un toque la completa: ${d.typed}/${d.len} · sigue en la linea ${d.line}`);
    await shot(`locker_${i}`);

    // 2. EL SILENCIO: el reloj del juego dice cuanto falta; se tapea sin parar y no tiene que
    //    pasar nada hasta que ese reloj llegue a cero.
    // el silencio TOTAL que pide el motor = lo consumido + lo que falta. Se lee asi y no como
    // holdLeft a secas porque entre el toque y la respuesta de la sonda pasan ~0.12 s.
    const h0 = +(d.holdLeft + d.sinceDone).toFixed(3);
    if (d.canAdvance) bad('se puede avanzar apenas termina de tipearse: el hold no arranco');
    const t0 = Date.now();
    let n = 0, saltoEnSilencio = false;
    for (;;) {
      const a = await dbg();
      if (a.line !== i || a.state !== 'story') break;
      if (a.holdLeft > 0 && a.canAdvance) bad('canAdvance mientras corre el hold');
      await tap('Space');
      const b = await dbg();
      n++;
      if (b.line !== i || b.state !== 'story') {          // avanzo: ¿estaba permitido?
        // `a` se leyo ~0.1 s antes del toque: si quedaba menos que eso, el hold pudo vencer en el
        // medio y el avance es legitimo. Solo cuenta como salteo lo INEQUIVOCO. El limite exacto
        // (al frame) lo prueba `npm run unit`, que no tiene esta ambiguedad.
        if (a.holdLeft > 0.3) saltoEnSilencio = true;
        break;
      }
      if (Date.now() - t0 > 9000) { bad('el hold no termina nunca'); break; }
    }
    const s = (Date.now() - t0) / 1000;
    medidos.push({ s, h0 });
    if (saltoEnSilencio) bad('UN TOQUE SALTEO EL SILENCIO (RF-07)');
    console.log(`   silencio: el juego pedia ${h0.toFixed(2)}s · pasaron ${s.toFixed(2)}s · ${n - 1} toques ignorados`);
  }

  const dFin = await dbg();
  console.log('\nestado al terminar la escena:', dFin.state);
  if (dFin.state !== 'modeselect') bad('la escena suelta tendria que volver al menu');
  await shot('locker_fin');

  console.log('\nHOLDS   lo que pide el guion / el techo / lo que pidio el motor / lo que tardo');
  holds.forEach((h, i) => {
    const { s, h0 } = medidos[i];
    // h0 vs h: el motor tiene que pedir EXACTO lo que dice el guion (margen: un frame).
    // s vs h: fin a fin. El margen es la granularidad del tapeo (~0.12 s), no del motor —
    // la exactitud al frame la prueba `npm run unit` con reloj determinista.
    const okPide = Math.abs(h0 - esperado[i]) <= 0.02;
    const okDura = Math.abs(s - esperado[i]) <= 0.2;
    if (!okPide || !okDura) fails++;
    const cap = h > TECHO ? ` (recortado de ${h.toFixed(1)})` : '';
    console.log(`  ${i}: guion ${h.toFixed(1)}s → techo ${esperado[i].toFixed(1)}s${cap} → pidio ${h0.toFixed(3)}s ${okPide ? '✓' : '✗'} → tardo ${s.toFixed(2)}s ${okDura ? '✓' : '✗'}`);
  });

  console.log('\nerrores de consola:', errors.length);
  for (const e of errors.slice(0, 8)) console.error('  ' + e);
  console.log(fails || errors.length ? `\nFIXTURE: FALLA (${fails})` : '\nFIXTURE: OK');
  app.exit(fails || errors.length ? 1 : 0);
}).catch(e => { console.error('reventó:', e); app.exit(1); });
