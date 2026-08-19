// FIXTURE DE ACEPTACION de la fase PASADA (SPEC_MODO_PASADA §7), corrido en el juego de verdad.
//   npm run pasada                     · PASADA_SHOTS=/tmp/x npm run pasada  (deja capturas)
//
// El spec pide correrlo DESPUES DE CADA FASE (§0.2), junto con `npm run check`. No esta dentro de
// `check` por la misma razon que el fixture de historia: son segundos de vuelo REAL, y lo que
// prueba no es una formula sino que la fase entera funcione adentro del juego.
//
// ESTADO: las OCHO fases del §8 estan hechas y cubiertas — P0 a P7.
//
// OJO CON LA DEFENSA (P3): la zona es LETAL. Las secciones que miden el vuelo, la suelta o el
// reglamento apagan la defensa con __pdef(0) apenas entran, porque medir el alcance de la ristra no
// puede depender de esquivar una salva. La defensa se prueba en la seccion 9, con __pdef(1).
const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const ROOT = path.join(__dirname, '..');
const OUT = process.env.PASADA_SHOTS || '';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const errors = [];
let win, fails = 0;
const bad = m => { console.error('   ✗ ' + m); fails++; };
const ok = m => console.log('   ✓ ' + m);
const pend = (n, f) => console.log(`   · paso ${n}: PENDIENTE (llega en ${f})`);
const js = s => win.webContents.executeJavaScript(s);
const P = async () => JSON.parse(await js('String(window.__pdbg && window.__pdbg())') || 'null');
async function shot(n) {
  if (!OUT) return;
  fs.writeFileSync(path.join(OUT, n + '.png'), (await win.webContents.capturePage()).toPNG());
}
const down = k => win.webContents.sendInputEvent({ type: 'keyDown', keyCode: k });
const up = k => win.webContents.sendInputEvent({ type: 'keyUp', keyCode: k });

// MUESTREADOR DE CUADROS, inyectado en la pagina. Corre en el rAF del juego, asi que ve TODOS los
// cuadros — desde el proceso principal, muestreando cada 30 ms, un unico frame negro se escapa, y
// "no hay frame negro" es literalmente el criterio de aceptacion de RF-01.
// Baja el canvas a 24x14 con drawImage (lo hace la GPU) y de ahi saca brillo medio y una firma.
const SAMPLER = `(() => {
  window.__cap = [];
  const c = document.getElementById('g');
  const s = document.createElement('canvas'); s.width = 24; s.height = 14;
  const sx = s.getContext('2d', { willReadFrequently: true });
  const loop = () => {
    sx.drawImage(c, 0, 0, 24, 14);
    const d = sx.getImageData(0, 0, 24, 14).data;
    let lum = 0, sig = 0;
    for (let i = 0; i < d.length; i += 4) { const v = d[i] + d[i+1] + d[i+2]; lum += v; sig = (Math.imul(sig, 31) + v) | 0; }
    // los dos ultimos son R3: la silueta del buque en el PASILLO (__pbarge) y la misma silueta ya
    // en la PASADA (__pship). Van en el muestreo por cuadro y no en un poll aparte porque lo que
    // hay que comparar es EL CUADRO ANTES y EL CUADRO DESPUES del corte — y para cuando un poll
    // se entera de que cambio el estado, el ultimo cuadro del pasillo ya no existe.
    window.__cap.push([Math.round(lum / (24 * 14 * 3)), sig, (window.__pdbg && window.__pdbg()) ? 1 : 0,
      (window.__pbarge && window.__pbarge()) || null, (window.__pship && window.__pship()) || null,
      (window.__fade && window.__fade()) || 0]);
    if (window.__cap.length < 3000) requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
  return 'ok';
})()`;

// brillo medio del cuadro (0..255), bajando el canvas a 32x18. Es como se mide un fade sin mirarlo.
const LUM = `(() => {
  const c = document.getElementById('g');
  const s = document.createElement('canvas'); s.width = 32; s.height = 18;
  const x = s.getContext('2d', { willReadFrequently: true });
  x.drawImage(c, 0, 0, 32, 18);
  const d = x.getImageData(0, 0, 32, 18).data;
  let l = 0; for (let i = 0; i < d.length; i += 4) l += d[i] + d[i+1] + d[i+2];
  return Math.round(l / (32 * 18 * 3));
})()`;

app.whenReady().then(async () => {
  console.log('\nFIXTURE — MODO PASADA (P0-P7)\n');
  // 1280x760 Y NO 960x540: la pagina tiene encabezado y pie alrededor del canvas, asi que con la
  // ventana justa el canvas queda ANCLADO ABAJO y se pierden los 33 px de ARRIBA — medido, el
  // getBoundingClientRect daba y=-63. Las capturas salian sin el titulo de la fase y sin el
  // contador de suelta, y no era el HUD: era el encuadre. La ventana real del juego
  // (electron/main.js) es 1280x720 y ahi entra entero.
  // Ninguna medicion cambia con esto: el brillo se saca del CANVAS con drawImage, no de la ventana.
  win = new BrowserWindow({ width: 1280, height: 760, show: false, webPreferences: { backgroundThrottling: false } });
  win.webContents.on('console-message', (e, l, m) => { if (l >= 3 && !m.includes('Security Warning')) errors.push(m.slice(0, 300)); });
  win.webContents.on('render-process-gone', (e, d) => errors.push('EL RENDERER MURIO: ' + JSON.stringify(d)));

  // ---------- 1. ENTRA POR SONDA Y SE VUELA ----------
  console.log('1. entrada por sonda y vuelo libre:');
  await win.loadURL('file://' + path.join(ROOT, 'src', 'index.html') + '?pasada=3');
  await sleep(3000);
  await js('__pdef(0)');   // P3: la zona es letal; estas secciones miden otra cosa
  let d = await P();
  if (!d) { console.error('   ✗ no entro a la pasada con ?pasada=3'); app.exit(1); return; }
  ok(`entro a la pasada · corrida ${d.corrida} · fase ${d.fase} · ${d.zonas} zonas vivas · ${d.r} m del buque`);
  if (d.alt > 35) bad(`la entrada tendria que ser A RAS (bajo el techo de radar); entro a ${d.alt} m`);
  else ok(`entra a ras: ${d.alt} m, bajo el techo de radar (10 m)`);
  await shot('p0_entrada');

  // SE APARTA EL AVION ANTES DE VOLAR LIBRE. Desde R2 se entra a 700 m del buque —el ingreso corto
  // y denso es el diseño— y eso son 6,4 s de vuelo hasta el casco: los tres chequeos que siguen
  // (avanza, [W], [Q]) no entran, y el avion terminaba estrellado antes del ultimo. Lo que esta
  // seccion mide es que el avion VUELE, no cuanta pista tiene, asi que se le da pista.
  await js('__pset(1300, 10, 0)'); await sleep(150);

  // vuela: la posicion cambia sola, y el morro responde a la tecla
  const a0 = await P();
  await sleep(1200);
  const a1 = await P();
  const avanzo = Math.hypot(a1.x - a0.x, a1.z - a0.z);
  if (avanzo < 40) bad(`el avion no avanza (${avanzo | 0} m en 1.2 s)`);
  else ok(`vuela solo: ${avanzo | 0} m en 1.2 s a ${a1.spd} m/s`);
  down('w'); await sleep(1000); up('w');
  const a2 = await P();
  if (a2.pitch <= a1.pitch) bad(`[W] no levanta el morro (${a1.pitch} → ${a2.pitch})`);
  else ok(`[W] levanta el morro (${a1.pitch} → ${a2.pitch} rad) y la altura pasa a ${a2.alt} m`);
  down('q'); await sleep(900); up('q');
  const a3 = await P();
  if (Math.abs(a3.roll) < 0.3) bad(`[Q] no banquea (roll ${a3.roll})`);
  else ok(`[Q] banquea y vira: roll ${a3.roll} rad`);
  await shot('p0_vuelo');

  // la banda de armado ya se lee, aunque la bomba llegue en P2: es funcion de la altura
  await js('window.__pset(600, 10, 0)'); await sleep(120);
  const bDorm = (await P()).banda;
  await js('window.__pset(600, 35, 0)'); await sleep(120);
  const bDulce = (await P()).banda;
  await js('window.__pset(600, 90, 0)'); await sleep(120);
  const bAlta = (await P()).banda;
  if (bDorm === 'dormida' && bDulce === 'dulce' && bAlta === 'alta')
    ok(`las tres bandas se leen por altura: 10 m ${bDorm} · 35 m ${bDulce} · 90 m ${bAlta}`);
  else bad(`bandas mal: 10 m → ${bDorm}, 35 m → ${bDulce}, 90 m → ${bAlta}`);

  // ---------- 2. LA TRANSICION SIN CORTE (RF-01) ----------
  // El criterio de aceptacion del spec, literal: "no hay frame negro ni salto de camara; el smoke
  // de 'el canvas cambia entre cuadros' pasa durante toda la transicion".
  console.log('\n2. transicion sin corte (RF-01), volando el pasillo:');
  await win.loadURL('file://' + path.join(ROOT, 'src', 'index.html') + '?pasada=1&pasillo');
  await sleep(2500);
  const gas = setInterval(() => down('Up'), 40);          // gas sostenido: no caerse antes de llegar
  for (let i = 0; i < 60; i++) { if (JSON.parse(await js('__wjump()')).state === 'play') break; await sleep(200); }

  // EL TELON: el cordon de bruma del arena cierra a pared sobre el buque — mirado de frente, un
  // fade. Se mide como brillo medio del cuadro, normalizado contra el brillo de ESTE MISMO run al
  // 60% del camino, asi el clima de la mision no ensucia la cuenta. Con el arena baja a ~40%; con
  // la pasada tiene que quedarse donde estaba.
  // LAS DEFENSAS SE APAGAN ANTES DE TODO. Esta seccion mide el TELON y la TRANSICION, no la
  // supervivencia: con los Sea Dart encendidos, los saltos de este bloque dejan al avion en medio
  // de la zona defendida y se pierde ahi. Y entonces el climax se entra por el camino del
  // RELEVO, que es otro codigo — la prueba terminaba midiendo un cruce que el piloto vivo nunca
  // hace, y por eso decia que no habia fundido.
  await js('__pdef(0)');
  const lum = [];
  for (const p of [0.60, 0.85, 0.98]) { await js(`__wjump(${p})`); await sleep(280); lum.push(await js(LUM)); }
  const caida = Math.min(...lum) / lum[0];
  if (caida < 0.85) bad(`el cuadro se apaga acercandose al buque (${(caida * 100) | 0}% del brillo del 60%): eso es un telon`);
  else ok(`sin telon en la aproximacion: brillo ${lum.join(' → ')} entre el 60% y el 98% del camino`);

  // CORRERSE DEL EJE antes del corte (R3). Centrado, la prueba del desvio heredado no prueba nada:
  // heredar cero es lo mismo que no heredar. Se entra al climax DESDE UN COSTADO del carril, que
  // es como se entra de verdad — nadie llega al buque perfectamente centrado.
  //
  // SE VUELVE ATRAS ANTES DE MEDIR, y esto es lo que tenia rota la seccion: el bloque del telon
  // deja al avion en el 98% del camino, y el corte a la PASADA es en el 100% (`readyToEnter`:
  // dist >= objectiveDist). Ese 2% son ~50 m, o sea medio segundo: para cuando arrancaba el
  // muestreo, la transicion YA habia pasado y no quedaba un solo cuadro de pasillo con que
  // comparar — el fixture se quejaba de eso ("no hay suficientes cuadros") sin decir por que.
  // Con el 88% quedan ~300 m, unos 3 s: cientos de cuadros de los dos lados del corte.
  await js('__wjump(0.88)');
  await js(SAMPLER);
  await sleep(300);
  // el desvio se hace ADENTRO de la aproximacion, no antes: es el desvio con el que se cruza el
  // corte lo que R3 mide, y a tres segundos del buque el avion ya no vuelve solo al eje.
  const der = setInterval(() => down('Right'), 40);
  await sleep(900);
  clearInterval(der); up('Right');
  for (let i = 0; i < 90; i++) { if (await P()) break; await sleep(200); }
  clearInterval(gas); up('Up');
  d = await P();
  if (!d) { bad('el pasillo nunca desemboco en la pasada'); }
  else {
    ok(`el pasillo desemboco en la pasada · ${d.alt} m de altura · ${d.spd} m/s`);
    await shot('p0_transicion');
    const cap = await js('JSON.stringify(window.__cap)').then(JSON.parse);
    const i0 = cap.findIndex(f => f[2] === 1);            // primer cuadro YA en la pasada
    if (i0 < 12) bad('no hay suficientes cuadros de pasillo antes de la transicion para comparar');
    else {
      const antes = cap.slice(i0 - 12, i0).map(f => f[0]);
      const banda = cap.slice(i0 - 6, i0 + 7);
      const base = antes.slice().sort((a, b) => a - b)[antes.length >> 1];   // brillo tipico del pasillo
      const min = Math.min(...banda.map(f => f[0]));
      // EL CRITERIO SE DIO VUELTA (playtest 16/8). RF-01 pedia CERO fundido y esto probaba que no
      // lo hubiera; jugandolo, el autor pidio lo contrario: "si cambias de camara MINIMAMENTE
      // fade in - out". Y tiene razon — la camara SI cambia, y un cambio de camara sin ningun
      // parpadeo se lee como un error, no como continuidad.
      //
      // Asi que ahora se prueba que el fundido EXISTA y sea CORTO. Las dos mitades importan: sin
      // fundido no se avisa que cambio el mundo; con un fundido largo se corta la accion, que es
      // exactamente lo que RF-01 vino a evitar y sigue valiendo.
      // SE MIRA EL RELOJ DEL FUNDIDO, no cuantos pixeles se oscurecieron. Contar pixeles mide el
      // fundido Y las dos escenas a la vez: si el climax es mas brillante que el pasillo —y lo es,
      // medido 64 → 83— el cuadro fundido sigue siendo mas claro que el pasillo y el test decia
      // "no hay ningun fundido" con el fundido pintado. Lo que hay que probar es que el fundido
      // EXISTA y sea CORTO; que no llegue a negro se sigue mirando en pixeles, que es donde eso
      // si se ve.
      const fades = cap.slice(i0, i0 + 90).map(f => f[5] || 0);
      const fMax = Math.max(...fades);
      const dur = fades.filter(v => v > 0).length / 60;      // segundos aproximados a 60 fps
      if (fMax <= 0) bad(`la transicion no tiene NINGUN fundido (brillo ${min} contra ${base} del pasillo)`);
      else if (dur > 1.2) bad(`el fundido dura ${dur.toFixed(2)} s: eso corta la accion, que es lo que RF-01 vino a evitar`);
      else if (min < base * 0.12) bad(`el fundido llega a negro (brillo ${min} vs ${base}): tiene que ser un parpadeo, no un corte`);
      else ok(`fundido corto al cruzar al climax: arranca en ${fMax} y dura ~${dur.toFixed(2)} s (brillo ${base} → ${min})`);
      // EL CANVAS SIGUE CAMBIANDO: dos cuadros seguidos identicos = render congelado
      let quietos = 0;
      for (let i = 1; i < banda.length; i++) if (banda[i][1] === banda[i - 1][1]) quietos++;
      if (quietos) bad(`${quietos} par(es) de cuadros identicos en la transicion: el render se congela`);
      else ok(`el canvas cambia en los ${banda.length} cuadros de la transicion`);
      // SIN PANTALLA EN EL MEDIO: se pasa de volar a volar, sin estado intermedio
      const st = await js('JSON.parse(__pausedbg()).state');
      if (st !== 'pasada') bad(`estado inesperado tras la transicion: ${st}`);
      else ok('de volar a volar: no hay pantalla intermedia (estado pasada)');

      // ---------- R3 — EL HANDOFF, MEDIDO A LOS DOS LADOS DEL CORTE ----------
      // El criterio del plan es "un espectador NO señala el frame del corte". Eso no se mide con
      // una asercion, asi que se mide lo que LO CAUSA: si el buque salta de tamaño o de columna en
      // un cuadro, el ojo lo caza. Las dos sondas miden la MISMA silueta (el casco entero) con la
      // MISMA camara — la del climax—, una dibujada por el pasillo y otra por three.
      console.log('\nR3 — la continuidad:');
      const bow = cap.slice(0, i0).map(f => f[3]).filter(Boolean).pop();
      const ship = cap.slice(i0).map(f => f[4]).filter(Boolean).shift();
      const b = bow && JSON.parse(bow), s3 = ship && JSON.parse(ship);
      if (!b) bad('el pasillo no dibujo el buque DE PROA (sonda __pbarge vacia): siguio con el casco lateral');
      else if (!s3) bad('no se pudo leer la silueta del buque ya en la pasada (__pship vacia)');
      else {
        // EL MUNDO VIEJO, como constante historica y no como asercion (R0.3 / R2.9, tercera vez):
        // el casco lateral llegaba a 177 px de eslora, o sea un buque a 150 m, y la PASADA abria
        // con el mismo buque a 700. Ese 25x era el teleport.
        const salto = Math.abs(b.bw - s3.w) / s3.w;
        if (salto > 0.25) bad(`el buque CAMBIA DE TAMAÑO en el corte: ${b.bw} px de manga en el pasillo contra ${s3.w} en la pasada (${(salto * 100) | 0}%)`);
        else ok(`el buque MIDE LO MISMO de los dos lados del corte: ${b.bw} px de manga contra ${s3.w} (${(salto * 100) | 0}% · el mundo viejo saltaba de 177 px a 7)`);
        const corr = Math.abs(b.bx - s3.cx);
        if (corr > 14) bad(`el buque SALTA DE COLUMNA en el corte: x ${b.bx} en el pasillo contra ${s3.cx} en la pasada (${corr | 0} px)`);
        else ok(`y esta en la MISMA COLUMNA: x ${b.bx} contra ${s3.cx} (${corr.toFixed(1)} px de diferencia)`);
        const lat = await js('__plat()');
        ok(`el desvio del carril se HEREDA: se entro ${Math.abs(lat) | 0} m ${lat >= 0 ? 'a la derecha' : 'a la izquierda'} del eje del buque, y el pasillo lo mostraba a ${Math.abs(b.bx - 240) | 0} px del centro`);
        if (b.d > 900) bad(`el pasillo corta con el buque a ${b.d} m, y la pasada entra a 700: sigue habiendo salto de distancia`);
        else ok(`el ultimo cuadro del pasillo muestra al buque a ${b.d} m — la distancia a la que la PASADA lo pone`);
      }
    }
  }

  // ---------- 3. EL JOYSTICK ----------
  // Se puede jugar el juego entero con mando, asi que la pasada tambien. Se prueba con un pad
  // FALSO: `navigator.getGamepads` devuelve un objeto que este script mueve a mano, y el poll de
  // core/input.js lo lee como a cualquier otro. Es el camino real entero — poll, flancos, setPad.
  //
  // Existe por una cicatriz: la lista `inGame` de input.js no incluia 'pasada', asi que al entrar
  // al climax el mando SOLTABA todos los ejes y el avion se quedaba sin piloto. Cada climax nuevo
  // tiene que entrar en esa lista, y esto es lo que lo va a avisar.
  console.log('\n3. el joystick en la pasada:');
  await win.loadURL('file://' + path.join(ROOT, 'src', 'index.html') + '?pasada=1');
  await sleep(3000);
  await js('__pdef(0)');   // P3: la zona es letal; estas secciones miden otra cosa
  if (!await P()) { bad('no se pudo entrar a la pasada para probar el mando'); }
  else {
    await js(`(() => {
      window.__pad = { connected: true, index: 0, mapping: 'standard',
        axes: [0, 0, 0, 0], buttons: Array.from({ length: 17 }, () => ({ pressed: false, value: 0 })) };
      navigator.getGamepads = () => [window.__pad];
      window.__btn = (i, v) => { window.__pad.buttons[i].pressed = v; window.__pad.buttons[i].value = v ? 1 : 0; };
      window.__ax = (i, v) => { window.__pad.axes[i] = v; };
    })()`);
    await sleep(200);

    // STICK IZQUIERDO ARRIBA = gas: tiene que levantar el morro igual que la [W]
    await js('__pset(900, 60, 0)'); await sleep(150);
    const p0 = await P();
    await js('__ax(1, -1)'); await sleep(900); await js('__ax(1, 0)');
    const p1 = await P();
    // el umbral es de 0.2 rad y no "subio algo": con el pad muerto el morro igual DERIVA unas
    // centesimas por su cuenta, y esa deriva daba el chequeo por bueno con el mando sin conectar
    if (p1.pitch - p0.pitch < 0.2) bad(`el stick izquierdo no levanta el morro en la pasada (${p0.pitch} → ${p1.pitch}): el mando no vuela`);
    else ok(`stick izq arriba = gas: el morro sube (${p0.pitch} → ${p1.pitch} rad)`);

    // STICK DERECHO EN X = banquear (analogico, igual que [Q]/[E])
    await js('__ax(2, -1)'); await sleep(800); await js('__ax(2, 0)');
    const p2 = await P();
    if (Math.abs(p2.roll) < 0.3) bad(`el stick derecho no banquea (roll ${p2.roll})`);
    else ok(`stick der = banqueo: roll ${p2.roll} rad`);

    // L1 (4) = SOLTAR LA RISTRA. Mismo boton que el misil del pasillo, por flanco.
    await js('__pset(420, 35, 0)'); await sleep(150);
    const b0 = (await P()).bombas;
    await js('__btn(4, true)'); await sleep(200); await js('__btn(4, false)');
    await sleep(700);
    const b1 = await P();
    if (b1.bombas >= b0) bad(`L1 no suelta las bombas (quedaron ${b1.bombas} de ${b0})`);
    else ok(`L1 suelta la ristra: ${b0} → ${b1.bombas} bombas, ${b1.vuelo} en el aire`);

    // CRUCETA ABAJO (13) = camara cabina ↔ tercera persona (lo que en teclado es [V])
    const v0 = (await P()).vista;
    await js('__btn(13, true)'); await sleep(200); await js('__btn(13, false)'); await sleep(200);
    const v1 = (await P()).vista;
    if (v1 === v0) bad(`la cruceta abajo no cambia la camara (vista ${v0})`);
    else ok(`cruceta abajo = camara: vista ${v0} → ${v1}`);
    await shot('p2_mando');
  }

  // ---------- EL CONTADOR DE SUELTA ----------
  // Pedido del autor: "al volar no se cuando disparar". El contador dice cuantos metros faltan
  // volar para que la bomba caiga encima del buque. Lo que se prueba no es que exista el numero:
  // es que el numero SEA CIERTO — que soltar cuando el HUD canta AHORA de verdad pegue.
  console.log('\nel contador de suelta (cuando tirar):');
  await win.loadURL('file://' + path.join(ROOT, 'src', 'index.html') + '?pasada=1');
  await sleep(3000);
  await js('__pdef(0)');   // P3: la zona es letal; estas secciones miden otra cosa
  if (!await P()) { bad('no se pudo entrar a la pasada para probar el contador'); }
  else {
    await js('__pset(900, 35, 0)'); await sleep(150);
    const c9 = (await P()).cue;
    await js('__pset(500, 35, 0)'); await sleep(150);
    const c5 = (await P()).cue;
    // se coloca el avion LEJOS antes de la foto para que el contador tenga un numero grande y se
    // lea. (Y ojo con el nombre del archivo: dos shot() con el mismo nombre y gana el ultimo —
    // paso, y la captura del contador salia con el avion ya encima del buque.)
    await js('__pset(1100, 35, 0)');
    await shot('p5_contador');
    if (typeof c9 === 'number' && typeof c5 === 'number' && c5 < c9)
      ok(`encarado, el contador baja al acercarse: ${c9} m a 900 · ${c5} m a 500`);
    else bad(`el contador no cuenta hacia abajo (900 m → ${c9}, 500 m → ${c5})`);

    // DE COSTADO NO HAY NUMERO: el rumbo no cruza el buque y soltar seria tirarle al mar
    down('q'); await sleep(1400); up('q'); await sleep(200);
    const cOff = (await P()).cue;
    if (cOff === null) ok('virando fuera del eje el contador dice SIN LINEA (null): no estas encarado');
    else bad(`fuera del eje el contador sigue dando ${cOff} m: estaria mintiendo`);

    // LA PRUEBA QUE IMPORTA: buscar la distancia donde el contador canta AHORA (0) y soltar ahi.
    // Si el numero es honesto, la bomba pega. Si no, es un adorno.
    await js('__pkill()'); await sleep(300);        // (re-arma el buque desde cero abajo)
    await win.loadURL('file://' + path.join(ROOT, 'src', 'index.html') + '?pasada=1');
    await sleep(3000);
  await js('__pdef(0)');   // P3: la zona es letal; estas secciones miden otra cosa
    let dAhora = null;
    for (let d = 460; d >= 120; d -= 10) {
      await js(`__pset(${d}, 35, 0)`); await sleep(70);
      if ((await P()).cue === 0) { dAhora = d; break; }
    }
    if (dAhora === null) bad('el contador nunca llego a AHORA acercandose por el eje');
    else {
      // colocar y soltar en UNA llamada: cruzando la manga la ventana dura 0,3 s a 110 m/s, y un
      // ida y vuelta de mas ya la deja atras (por eso existe __pdrop)
      // (sin captura del cartel AHORA: cruzando la manga la ventana dura 0,3 s a 110 m/s, y entre
      // pedir la foto y que salga el avion ya paso. Lo que prueba que el cartel no miente es el daño)
      const hp0 = (await P()).hp;
      await js(`__pset(${dAhora}, 35, 0); __pdrop()`);
      // 2,6 s y no 1,8: desde 35 m la bomba tarda 2,1 s en tocar el agua, mas el escalon de la
      // ristra. Midiendo antes, el daño todavia no existe y la prueba acusa al contador de mentir
      await sleep(2600);
      const a = await P();
      if (a.hp < hp0) ok(`soltando cuando canta AHORA (a ${dAhora} m) la bomba PEGA: ${hp0} → ${a.hp} de casco`);
      else bad(`el contador canto AHORA a ${dAhora} m y la suelta no hizo daño (${hp0} → ${a.hp})`);
      await shot('p5_pegada');
    }
  }

  // ---------- LA SUELTA: pasos 2 a 5 del §7 ----------
  // Cada suelta se hace desde la distancia donde el impacto PREVISTO cae sobre el buque: el error
  // viene con signo (+ corta, − larga), asi que se corrige en dos o tres pasos. Sin eso, "la bomba
  // no hizo daño" no distingue entre una mecanica rota y una suelta mal apuntada.
  console.log('\n4. la suelta: las tres bandas, el sapito y la ristra (pasos 2-5):');
  await win.loadURL('file://' + path.join(ROOT, 'src', 'index.html') + '?pasada=1');
  await sleep(3000);
  await js('__pdef(0)');   // P3: la zona es letal; estas secciones miden otra cosa
  if (!await P()) { bad('no se pudo entrar a la pasada para probar la suelta'); }
  else {
    /** Espera a que haya una pasada VIVA. Desde RF-15 hace falta entre una suelta y la siguiente:
     *  soltar cierra tu corrida y el escuadron tarda ~5 s en devolver el mando (fin de pasada +
     *  cinematica del relevo). Sin esto, el __pset de la proxima medicion cae en el vacio. */
    async function esperarPasada() {
      for (let k = 0; k < 60; k++) { if (await P()) return true; await sleep(200); }
      return false;
    }

    /** Suelta desde `alt` (con turbo si `turbo`) sobre el eje `off`, y devuelve que paso. */
    async function tirar(alt, turbo, off) {
      if (!await esperarPasada()) return null;
      // esta seccion mide LA SUELTA, no la economia del escuadron: se repone el roster para que
      // medir cuatro bandas no se coma la formacion y la quinta medicion caiga en mision perdida.
      // Lo que RF-15 cobra se prueba aparte, en la seccion 6.
      await js('__plives(9)');
      let dd = 420;
      for (let k = 0; k < 16; k++) {
        await js(`__pset(${dd}, ${alt}, ${off})`); await sleep(80);
        const a = await P();
        if (!a || a.impacto === null || Math.abs(a.impacto) < 12) break;
        dd = Math.max(60, Math.min(1400, dd - a.impacto));
      }
      await js(`__pset(${dd}, ${alt}, ${off})`); await sleep(120);
      const antes = await P();
      if (turbo) down('c');
      down('z'); await sleep(90); up('z');
      await sleep(500);                       // que salga la ristra entera
      if (turbo) up('c');
      await js('__pset(1560, 300, 1.4)');     // apartarse: la bomba ya vuela sola
      // RF-15: soltar CIERRA la pasada, asi que un sleep fijo puede despertar DESPUES del relevo,
      // cuando ya no hay instancia que leer (__pdbg da null) — y la medicion se perderia. Se
      // muestrea hasta que el modulo se apaga y se guarda la ULTIMA lectura viva, que es la que
      // tiene el daño ya resuelto: el fin de pasada solo llega con todas las bombas en el agua.
      let desp = null;
      for (let k = 0; k < 22; k++) {
        await sleep(180);
        const s = await P();
        if (!s) break;
        desp = s;
      }
      if (!antes || !desp) return null;
      return { dmg: antes.hp - desp.hp, zonas: antes.zonas - desp.zonas, banda: antes.banda,
               duds: desp.duds - antes.duds, sapitos: desp.sapitos - antes.sapitos, d: dd | 0 };
    }

    const dulce = await tirar(35, false, 0);
    if (dulce && dulce.banda === 'dulce' && dulce.dmg > 0 && !dulce.duds)
      ok(`banda DULCE: suelta a 35 m desde ${dulce.d} m → ${dulce.dmg} de daño, ${dulce.zonas} zona(s) fuera`);
    else bad(`la banda dulce no dañó: ${JSON.stringify(dulce)}`);
    await shot('p2_dulce');

    const dorm = await tirar(10, false, 0);
    if (dorm && dorm.banda === 'dormida' && dorm.duds > 0 && dorm.dmg < 40)
      ok(`banda DORMIDA: ${dorm.duds} bomba(s) golpearon sin estallar — ${dorm.dmg} de daño contra los ${dulce ? dulce.dmg : '?'} de la dulce`);
    else bad(`la banda dormida no se comporta como dormida: ${JSON.stringify(dorm)}`);

    const sap = await tirar(8, true, 0);
    if (sap && sap.sapitos > 0)
      ok(`EL SAPITO: ${sap.sapitos} bomba(s) picaron en el agua y entraron al casco (${sap.dmg} de daño)`);
    else bad(`el sapito no entró: ${JSON.stringify(sap)}`);
    await shot('p2_sapito');

    // LA RISTRA (RF-06): el mismo par de bombas contra el MISMO buque, por dos ejes distintos.
    // A lo largo del casco las zonas se alinean y la salva alcanza a dos; cruzando la manga, el
    // buque mide 20 m de ancho y la segunda cae al agua. Es apuntado por GEOMETRIA, no por clicks.
    await js('__pkill()');                    // buque limpio para las dos mediciones
    await sleep(4500);
    await win.loadURL('file://' + path.join(ROOT, 'src', 'index.html') + '?pasada=1');
    await sleep(3000);
  await js('__pdef(0)');   // P3: la zona es letal; estas secciones miden otra cosa
    const eje = await tirar(35, false, Math.PI / 2);          // a lo largo del casco
    await win.loadURL('file://' + path.join(ROOT, 'src', 'index.html') + '?pasada=1');
    await sleep(3000);
  await js('__pdef(0)');   // P3: la zona es letal; estas secciones miden otra cosa
    const cruz = await tirar(35, false, 0);                   // cruzando la manga
    // se mide en ZONAS ALCANZADAS, no en daño: una bomba que entra en una zona de 45 y otra en una
    // de 55 suman 100, y una sola que revienta el puente suma 130 — el numero mas grande seria la
    // pasada PEOR. Lo que la ristra promete es alcanzar DOS cosas de una.
    if (eje && cruz && eje.zonas > cruz.zonas)
      ok(`la RISTRA depende del eje: a lo largo del casco ${eje.zonas} zonas de una (${eje.dmg} de daño) · cruzando la manga ${cruz.zonas} (${cruz.dmg})`);
    else bad(`el eje no cambia el alcance de la ristra (a lo largo ${eje && eje.zonas} zonas, cruzando ${cruz && cruz.zonas})`);
  }

  // ---------- 9. FIN DE LA PASADA ----------
  console.log('\n5. fin de la pasada (paso 9 del §7):');
  // desde RF-15 hay que ESPERAR: la ultima medicion de la ristra gasto esa pasada, y el escuadron
  // tarda ~5 s en devolver el mando. Antes se podia leer de una porque soltar no cerraba nada.
  for (let k = 0; k < 40 && !await P(); k++) await sleep(200);
  if (await P()) {
    await js('window.__pkill()');
    await sleep(4200);
    const st = await js('JSON.parse(__pausedbg()).state');
    if (st === 'results') ok('todas las zonas muertas → results, sin pantallas intermedias');
    else bad(`todas las zonas muertas y el estado quedo en ${st} (esperaba results)`);
    await shot('p0_fin');
  } else bad('no hay pasada activa para probar el fin');

  // ---------- 6. RF-15: UN AVION, UNA SUELTA ----------
  // La regla que define el clímax. Lo que se prueba no es que exista un contador de vidas —eso ya
  // andaba— sino las cuatro consecuencias que la hacen un juego: soltar TERMINA tu corrida aunque
  // falles, NO soltar no cuesta nada, el daño al buque sobrevive al cambio de piloto, y el ultimo
  // avion pierde la mision en vez de relevar.
  //
  // La coreografia de cada prueba es la misma y el porque importa: se suelta desde 900 m —donde el
  // impacto previsto cae unos 600 m corto, o sea fallo GARANTIZADO— y 600 ms despues se aparta el
  // avion a 1500 m y 300 m de altura. Ese apartarse no es prolijidad: a 35 m y encarado, el avion
  // llega al buque en 8 s y se lo lleva puesto, y esa muerte tambien descuenta un avion. Sin
  // apartarlo, la prueba pasaria por el motivo equivocado. Los 600 ms son para que salgan LAS DOS
  // bombas de la ristra (la segunda va escalonada 0,35 s) antes de mover el avion.
  console.log('\n6. RF-15 — el escuadron son los intentos:');
  const gastarPasada = async () => {
    await js('__pset(900, 35, 0); __pdrop()');
    await sleep(600);
    await js('__pset(1500, 300, 1.4)');
  };
  await win.loadURL('file://' + path.join(ROOT, 'src', 'index.html') + '?pasada=1');
  await sleep(3000);
  await js('__pdef(0)');   // P3: la zona es letal; estas secciones miden otra cosa
  if (!await P()) bad('no se pudo entrar a la pasada para probar RF-15');
  else {
    // 1) NO SOLTAR NO CUESTA. Es la mitad del diseño: sobrevolar sin conseguir la linea es
    // informacion, no un error del jugador, y cobrarlo haria del modo una loteria de encare.
    const v0 = (await P()).vidas;
    await js('__pset(1200, 60, 0)');
    await sleep(2500);
    const vSinTirar = (await P()).vidas;
    if (vSinTirar === v0) ok(`volar sin soltar NO gasta avion: siguen ${vSinTirar}`);
    else bad(`volar sin soltar bajo los aviones de ${v0} a ${vSinTirar}`);

    // 2) SOLTAR Y ERRAR CIERRA LA PASADA, y entra el siguiente por el relevo de siempre.
    await gastarPasada();
    await sleep(4200);
    const medio = await js('JSON.parse(__pausedbg()).state');
    await shot('p4_relevo');                  // LA captura: el TURNO DE ... en pantalla, no despues
    await sleep(4000);
    const a = await P();
    if (a && a.vidas === v0 - 1)
      ok(`soltar y errar CIERRA tu pasada: ${v0} → ${a.vidas} aviones, y se vuelve a la pasada`);
    else bad(`tras soltar y errar los aviones quedaron en ${a && a.vidas} (esperaba ${v0 - 1})`);
    if (medio === 'relevo') ok('entre una pasada y la otra corre el relevo del escuadron (TURNO DE ...)');
    else bad(`tras gastar la pasada el estado fue ${medio}, esperaba relevo`);

    // 3) EL DAÑO AL BUQUE SOBREVIVE AL PILOTO (RF-15.3). Es lo que hace que cuatro aviones sean un
    // presupuesto y no cuatro intentos sueltos: el segundo termina lo que el primero abrio.
    //
    // El daño tiene que ser PARCIAL, asi que se pega de verdad en vez de usar __pkill() —que vacia
    // el buque ENTERO y lo hunde, o sea que probaria la victoria y no la persistencia. Se entra por
    // el eje del casco (off = PI/2) y no cruzando la manga: por ahi la ventana dura 1,2 s en vez de
    // 0,3 y el barrido la encuentra sin depender del azar del cuadro.
    if (a) {
      let dPega = null;
      for (let d = 460; d >= 120; d -= 10) {
        await js(`__pset(${d}, 35, ${Math.PI / 2})`); await sleep(70);
        if ((await P()).cue === 0) { dPega = d; break; }
      }
      if (dPega === null) bad('no se encontro una suelta que pegue para probar la persistencia del daño');
      else {
        await js(`__pset(${dPega}, 35, ${Math.PI / 2}); __pdrop()`);
        await sleep(600);
        await js('__pset(1500, 300, 1.4)');       // apartarse, igual que en gastarPasada()
        await sleep(8200);                        // la pegada + el fin de esa pasada + el relevo
        const conDaño = await P();
        const hpAntes = conDaño && conDaño.hp;
        if (!conDaño || hpAntes >= a.hp) bad(`la suelta a ${dPega} m no dejo daño para medir (${a.hp} → ${hpAntes})`);
        else {
          await gastarPasada();                   // ahora una pasada FALLADA: no toca el casco
          await sleep(8200);
          const b = await P();
          // NO SE PIDE IGUALDAD, se pide que NO SE RESTAURE. La asercion estaba sobre-escrita: desde
          // P7 un Fiel puede pegarle al buque mientras vos volvias, asi que el casco puede BAJAR
          // entre las dos lecturas — y eso no contradice la persistencia, la confirma. Pedir
          // igualdad hacia la prueba dependiente del azar de la oleada.
          if (b && b.hp <= hpAntes && b.vidas === conDaño.vidas - 1)
            ok(`el daño PERSISTE entre pilotos: ${a.hp} → ${hpAntes} de casco, y sigue en ${b.hp} con el siguiente`);
          else bad(`el casco se restauro al cambiar de piloto: ${hpAntes} → ${b && b.hp}`);
        }
      }
    }

    // 4) EL ULTIMO AVION PIERDE LA MISION. No releva: el buque siguio navegando. Se recarga la
    // pagina para que el buque este entero — si no, la prueba podria terminar por hundimiento y
    // decir "dead" por el motivo contrario al que se quiere medir.
    await win.loadURL('file://' + path.join(ROOT, 'src', 'index.html') + '?pasada=1');
    await sleep(3000);
  await js('__pdef(0)');   // P3: la zona es letal; estas secciones miden otra cosa
    await js('__plives(1)');
    await gastarPasada();
    await sleep(5600);
    const fin = await js('JSON.parse(__pausedbg()).state');
    if (fin === 'dead') ok('gastar la pasada con el ULTIMO avion pierde la mision (no releva)');
    else bad(`con el ultimo avion el estado quedo en ${fin}, esperaba dead`);
    await sleep(2600);                        // que la pantalla de fin termine de subir antes de la foto
    await shot('p4_derrota');
  }

  // ---------- 7. RF-10 y RF-12: los dos relojes ----------
  console.log('\n7. RF-10 y RF-12 — la nafta y el ralenti:');
  await win.loadURL('file://' + path.join(ROOT, 'src', 'index.html') + '?pasada=1');
  await sleep(3000);
  await js('__pdef(0)');   // P3: la zona es letal; estas secciones miden otra cosa
  if (!await P()) bad('no se pudo entrar a la pasada para probar los relojes');
  else {
    // RF-12: el mundo se afloja SOLO donde hay algo que decidir — dentro de POPUP_DIST_M, con
    // bombas y sin haber soltado. Lejos corre 1x, o seria un modo pastoso y no una ayuda.
    await js('__pset(1200, 40, 0)'); await sleep(150);
    const lejos = (await P()).lenta;
    await js('__pset(500, 40, 0)'); await sleep(150);
    const cerca = (await P()).lenta;
    if (lejos === 1 && cerca < 1) ok(`el ralenti corre solo en la ventana: ${lejos}x a 1200 m · ${cerca}x a 500 m`);
    else bad(`el ralenti no distingue la ventana (1200 m → ${lejos}x, 500 m → ${cerca}x)`);

    // RF-10: el tanque seco tambien cierra la corrida, y es el PEOR final — perdiste el avion sin
    // haber tirado. Es lo que le pone precio a dar otra vuelta buscando la linea.
    const v0 = (await P()).vidas;
    await js('__pset(1200, 60, 0); __pseca()');
    await sleep(5600);
    const c = await P();
    if (c && c.vidas === v0 - 1) ok(`el tanque seco gasta la pasada sin haber tirado: ${v0} → ${c.vidas} aviones`);
    else bad(`con el tanque seco los aviones quedaron en ${c && c.vidas} (esperaba ${v0 - 1})`);
  }

  // ---------- 8. P1: EL EJE DE ATAQUE Y EL RE-ENCARE ----------
  // Lo que P1 promete no es una ayuda visual: es que la GEOMETRIA de la corrida sea legible. Se
  // prueban las tres cosas que la hacen existir — que se entre por la eslora y no de costado, que
  // el juego sepa distinguir un rumbo del otro, y que sobrevolar sin soltar deje una puerta.
  console.log('\n8. P1 — el eje de ataque y el re-encare:');
  await win.loadURL('file://' + path.join(ROOT, 'src', 'index.html') + '?pasada=1');
  await sleep(3000);
  await js('__pdef(0)');   // P3: la zona es letal; estas secciones miden otra cosa
  if (!await P()) bad('no se pudo entrar a la pasada para probar P1');
  else {
    // 1) LA ENTRADA ES POR EL EJE. En P0 se entraba a 0,55 rad —casi cruzando la manga—, o sea que
    // el juego le regalaba al jugador la peor corrida posible y despues le pedia que la entendiera.
    const e0 = await P();
    if (e0.encarado) ok(`se ENTRA por el eje del casco: alineacion ${e0.eje} (umbral ${0.82})`);
    else bad(`la entrada no viene por el eje: alineacion ${e0.eje}`);

    // 2) EL JUEGO DISTINGUE LOS DOS RUMBOS. __pset con off = PI/2 coloca a lo largo del casco y
    // con off = 0, cruzando la manga: son las dos corridas cuya ventana difiere 4 veces.
    await js(`__pset(700, 35, ${Math.PI / 2})`); await sleep(150);
    const eLargo = await P();
    await js('__pset(700, 35, 0)'); await sleep(150);
    const eManga = await P();
    if (eLargo.encarado && !eManga.encarado)
      ok(`distingue los dos ejes: por la eslora ${eLargo.eje} (encarado) · cruzando la manga ${eManga.eje} (no)`);
    else bad(`no distingue los ejes: eslora ${eLargo.eje}/${eLargo.encarado} · manga ${eManga.eje}/${eManga.encarado}`);

    // 3) SOBREVOLAR SIN SOLTAR DEJA UNA PUERTA. Es el racetrack: la vuelta pasa de "deambular
    // hasta que el buque vuelva a estar adelante" a una maniobra con principio y fin. Se coloca el
    // avion PASADO el buque y alejandose, que es exactamente el egreso de una corrida sin suelta.
    // a 1160 m y no a 1300: OUT_R son 1150, asi que esto es el instante EXACTO en que una corrida
    // sin suelta se da por terminada. Colocado mas afuera, la puerta queda pegada al borde de la
    // zona y la prueba mediria una geometria que en el juego no se da nunca.
    await js(`__pset(1160, 40, ${Math.PI / 2})`); await sleep(150);
    await js('__pflip()'); await sleep(400);       // dar vuelta el rumbo: ahora se aleja
    const g = await P();
    if (g && g.fase === 'reencare' && g.puerta !== null)
      ok(`alejandose sin soltar aparece la PUERTA de re-encare: fase ${g.fase}, puerta en x=${g.puerta} m`);
    else bad(`alejandose no se armo el re-encare: fase ${g && g.fase}, puerta ${g && g.puerta}`);
    await shot('p1_reencare');

    // y la puerta se APAGA al entrar a la ventana: ya cumplio, y dejarla puesta seria ruido justo
    // donde el jugador tiene que estar mirando el buque
    await js(`__pset(400, 35, ${Math.PI / 2})`); await sleep(300);
    const g2 = await P();
    if (g2 && g2.puerta === null) ok('entrando a la ventana la puerta se apaga: ya cumplio');
    else bad(`la puerta sigue puesta dentro de la ventana (${g2 && g2.puerta})`);
    await shot('p1_eje');
  }

  // ---------- 9. P3: LA DEFENSA POR CAPAS ----------
  // Lo que se prueba de cada capa no es que haga daño: es que castigue LA FALTA QUE LE TOCA y
  // ninguna otra. El cañon cobra volar derecho, el Sea Dart cobra volar alto lejos, y la fusileria
  // cobra quedarse encima. Si alguna cobrara algo distinto, el nivel dejaria de enseñar a volarlo.
  console.log('\n9. P3 — la defensa por capas:');
  await win.loadURL('file://' + path.join(ROOT, 'src', 'index.html') + '?pasada=1');
  await sleep(3000);
  if (!await P()) bad('no se pudo entrar a la pasada para probar la defensa');
  else {
    // 1) EL TECHO DE RADAR (RF-03). Las dos mitades de la regla, y la de abajo importa mas: no es
    // que a ras "esquivas mejor", es que el misil NO EXISTE. Eso es lo que convierte la doctrina
    // real —llegar pegado al agua— en una ventaja de juego y no en una pose.
    // INVULNERABLE: lo que se mide es DONDE cae la defensa y CUANDO sale, no si te mata. Sin esto
    // la medicion se corta en el primer impacto — y con el modelo de vida por defecto, eso es el
    // primero que te roza.
    // A 6 m Y NO A 17: el techo bajo de 35 a 10 m por pedido del autor —"el misil lo tiran
    // unicamente si el avion se pasa de los 10 metros"— asi que 17 m ya es ALTO. La prueba tenia
    // que bajar con la regla, o estaria midiendo el techo viejo.
    await js('__pdef(1); __pinv(1); __pset(1300, 6, 0)'); await sleep(1500);
    const bajo = await P();
    if (bajo && !bajo.dart) ok(`a ras (${bajo.alt} m, bajo el techo de 10) el Sea Dart NO existe`);
    else bad(`entrando a ras igual salio el Sea Dart (alt ${bajo && bajo.alt})`);

    await js('__pset(1300, 70, 0)'); await sleep(1200);      // 2x el techo, y lejos del buque
    const alto = await P();
    if (alto && alto.dart) ok(`cruzando el techo a ${alto.alt} m y ${alto.r} m del buque: LANZAMIENTO`);
    else bad(`cruzando el techo a 70 m y 1300 m no salio el Sea Dart`);
    await shot('p3_dart');

    // 2) EL CAÑON (RF-04). La primera salva es un AVISO — punteria 0 — y la correccion se gana
    // tirando. Si la primera ya matara, la capa no se podria aprender: seria una emboscada.
    await js('__pdef(0)'); await sleep(100);
    await win.loadURL('file://' + path.join(ROOT, 'src', 'index.html') + '?pasada=1');
    await sleep(3000);
    await js('__pdef(1); __pinv(1); __pset(1200, 20, 0)');
    for (let k = 0; k < 40; k++) { await sleep(200); const a = await P(); if (a && a.salvas >= 1) break; }
    const s1 = await P();
    // se mide la DISPERSION con la que salio la salva, no la punteria que queda despues: el
    // contador avanza AL DISPARAR, asi que leerlo despues de la primera ya da 0.5 aunque esa
    // primera haya salido a tantear. Lo que importa es con cuanto error salio.
    if (s1 && s1.salvas >= 1 && s1.disp >= 54)
      ok(`la PRIMERA salva es de tanteo: ${s1.disp} m de dispersion (COL_JIT_M son 60) — el cañon avisa antes de acertar`);
    else bad(`la primera salva no fue de tanteo (salvas ${s1 && s1.salvas}, dispersion ${s1 && s1.disp})`);

    // y virar le BORRA la correccion: es el zigzag suave del criterio de RF-04
    //
    // SE SUBE A 90 m Y SE ESPERA MAS. Con R2 el cañon abre a los 1,5 s, o sea que su primera salva
    // ya salio ANTES de que la sonda coloque el avion — y el teletransporte le borra la correccion,
    // asi que la cuenta de dos salvas arranca de cero desde ahi y son ~6 s. A 20 m de altura el
    // morro se hunde solo y el avion tocaba el agua a mitad de la cuenta: la prueba pasaba a medir
    // gravedad. La altura no le cambia nada al cañon; solo le da tiempo a la medicion.
    await js('__pset(1200, 90, 0)'); await sleep(150);
    for (let k = 0; k < 50; k++) { await sleep(200); const a = await P(); if (!a || a.punteria >= 1) break; }
    const tomado = await P();
    if (!tomado || tomado.punteria < 1) bad(`volando derecho el cañon no llego a tenerte tomado (${tomado && tomado.punteria})`);
    else {
      down('q'); await sleep(700); up('q'); await sleep(300);
      const roto = await P();
      if (roto && roto.punteria < 1) ok(`derecho te toma (${tomado.punteria}) y un quiebre suave le BORRA la correccion (${roto.punteria})`);
      else bad(`virando el cañon mantuvo la correccion (${roto && roto.punteria})`);
    }

    // 3) EL CALOR (RF-09). Insistir es legal y cuesta: la salva cae mas CERRADA. Se mide en la
    // distancia media de la metralla, que es lo unico que el jugador siente de verdad.
    await win.loadURL('file://' + path.join(ROOT, 'src', 'index.html') + '?pasada=1');
    await sleep(3000);
    // EL ORDEN IMPORTA y costo una medicion: primero se coloca el avion, DESPUES se drenan las
    // columnas que ya venian en el aire, y recien ahi se reinicia el contador. Al reves, las
    // columnas de la medicion anterior reventaban a 1300 m del avion recien teletransportado y
    // metian una media de 259 m que no era la del cañon, era la del teletransporte.
    // Y se mide desde 1000 m y no desde 1300: a 110 m/s eso deja ~9 s adentro del alcance, tiempo
    // para tres salvas sin que el avion se vaya de la zona a mitad de la cuenta.
    // SE MIDE LA DISPERSION, NO LA MEDIA DE DONDE CAYERON. La media de la metralla es el numero
    // que el jugador SIENTE, pero con dos o tres salvas la domina el azar de un par de tiradas:
    // medido, dio 55 contra 43 en una corrida y 35 contra 42 en la siguiente — o sea que a veces
    // "prueba" lo contrario. La dispersion con la que sale la salva es el estado real del tirador
    // y es lo que el CA de RF-09 pide leer por sonda. La media va igual, como contexto.
    const medirSalvas = async h => {
      // A 90 m DE ALTURA: a 20 el avion entraba en el casco antes de juntar las diez columnas y la
      // medicion se quedaba en null — no por el cañon, por haberse estrellado. `__pinv` cubre la
      // defensa, NO el buque, y esta bien que sea asi.
      await js('__pset(1000, 90, 0)');
      await sleep(1800);                       // que caigan las columnas que ya venian volando
      await js(`__pheat(${h})`);               // fija el calor Y reinicia la sonda de la metralla
      for (let k = 0; k < 45; k++) { await sleep(200); const a = await P(); if (!a || a.colN >= 10) break; }
      const a = await P();
      return a ? { disp: a.disp, dist: a.colDist } : null;
    };
    // __plives(1) NO es para sobrevivir: es para que NO HAYA OLEADA. Con compañeros vivos, uno
    // esta corriendo casi siempre y el cañon se ocupa de el — la medicion se quedaba sin salvas
    // que medir (colDist null). Sin escuadron no hay quien te cubra, y el cañon es todo tuyo.
    await js('__pdef(1); __pinv(1); __plives(1)');
    const frio = await medirSalvas(0);
    const caliente = await medirSalvas(1.2);
    if (frio && caliente && caliente.disp < frio.disp)
      ok(`el CALOR cierra la salva: ${frio.disp} m de dispersion en frio · ${caliente.disp} m caliente `
        + `(la metralla cayo a ${frio.dist} m y ${caliente.dist} m de media)`);
    else bad(`el calor no cerro la salva (frio ${frio && frio.disp}, caliente ${caliente && caliente.disp})`);
    await shot('p3_columnas');

    // 4) LA FUSILERIA (RF-08) cobra QUEDARSE, no pasar. Es la diferencia que sostiene el modo: con
    // el modelo de vida por defecto cualquier toque baja el avion, asi que si cobrara el sobrevuelo
    // TODA pasada terminaria en relevo — incluido el sapito, que se tira pegado a la cubierta.
    await win.loadURL('file://' + path.join(ROOT, 'src', 'index.html') + '?pasada=1');
    await sleep(3000);
    // A 60 m DE ALTURA, no a 30: a 30 el avion entra en el casco antes de terminar de cruzar la
    // cubierta y la prueba media una colision, no la fusileria. Y se entra desde 200 m tomando el
    // MAXIMO de la cuenta mientras cruza: la huella son 180 m de largo, o sea ~1,6 s a 110 m/s, y
    // un unico muestreo puede caer justo despues de salir.
    await js('__pdef(1); __pinv(1); __pset(200, 60, 0)');
    let maxFus = 0;
    for (let k = 0; k < 20; k++) { await sleep(150); const a = await P(); if (a) maxFus = Math.max(maxFus, a.fus); }
    if (maxFus > 0) ok(`sobre la cubierta corre el reloj de la fusileria: ${maxFus.toFixed(1)} s cruzando`);
    else bad('sobre la cubierta no corre la fusileria');
    await js('__pset(900, 60, 0)'); await sleep(1500);
    const lejos = await P();
    if (lejos && lejos.fus < maxFus) ok(`saliendo de la cubierta el reloj se enfria: ${lejos.fus} s`);
    else bad(`el reloj de la fusileria no se enfria al salir (${lejos && lejos.fus} contra ${maxFus})`);
  }

  // ---------- 10. P7: LA OLEADA ----------
  // Es lo que separa a este modo de los otros dos del juego. En el PASILLO y en el ARENA volas
  // solo; aca te turnas con la escuadrilla. Lo que se prueba no es que se vean aviones amigos —
  // eso seria decorado— sino las dos consecuencias de juego: que TE CUBREN (el cañon tiene un
  // blanco por vez) y que su daño CUENTA, pero sin robarte el ultimo golpe.
  console.log('\n10. P7 — la oleada de los Fieles:');
  await win.loadURL('file://' + path.join(ROOT, 'src', 'index.html') + '?pasada=1');
  await sleep(3000);
  if (!await P()) bad('no se pudo entrar a la pasada para probar la oleada');
  else {
    await js('__pdef(1); __pinv(1); __pset(1300, 40, 1.4)');
    let corridas = 0, cubierto = 0, muestras = 0, foto = 0;
    for (let k = 0; k < 34; k++) {
      await sleep(500);
      const a = await P();
      if (!a) break;
      muestras++;
      if (a.oleada.length) corridas = Math.max(corridas, a.oleada.length);
      if (a.cubierto) cubierto++;
      // LA FOTO SE SACA CON ALGUIEN EN EL AIRE. Al final del muestreo caia en un hueco de la
      // oleada y la captura no probaba nada: la primera salio sin un solo avion amigo.
      if (!foto && a.oleada.length && a.oleada[0].t > 3) { foto = 1; await shot('p7_oleada'); }
    }
    if (corridas >= 1) ok(`entre tus corridas ENTRAN los Fieles: hasta ${corridas} corrida(s) amiga(s) a la vez`);
    else bad('no entro ninguna corrida amiga');
    // NI ESCUDO NI ADORNO: la cobertura tiene que ser un RITMO. Todo el tiempo cubierto es apagar
    // una capa; nunca cubierto es que la oleada no hace nada.
    const pc = muestras ? cubierto / muestras : 0;
    if (pc > 0.12 && pc < 0.6)
      ok(`la cobertura es un RITMO, no un escudo: ${(pc * 100) | 0}% del tiempo con el cañon ocupado en un compañero`);
    else bad(`la cobertura quedo mal dosificada: ${(pc * 100) | 0}% del tiempo cubierto`);
    if (!foto) bad('no se pudo capturar la oleada en vuelo');

    // SIN ESCUADRON NO HAY OLEADA NI RADIO. Es la misma regla que el aviso del Sea Cat: los ojos
    // y las voces del modo son los compañeros, y con un solo avion no hay ninguno.
    await js('__plives(1)'); await sleep(1200);
    let solo = 0;
    for (let k = 0; k < 12; k++) { await sleep(400); const a = await P(); if (a && a.oleada.length) solo++; }
    if (!solo) ok('con UN solo avion no entra nadie: sin escuadron no hay oleada ni radio');
    else bad(`con un solo avion igual entraron ${solo} corridas amigas`);
  }

  // ---------- R0: LA VARA (PASADA_ADRENALINA) ----------
  // Esta seccion NO aprueba el modo: lo MIDE. El plan de rescate arranca de un playtest que dice
  // "no genera adrenalina", y sin numeros eso no se puede ni demostrar ni refutar. Lo que se
  // comprueba aca es que la VARA funcione y que reproduzca los numeros del §1 del analisis —
  // numeros MALOS, que es justamente el punto de partida del rescate.
  console.log('\nR0 — la vara: el baseline del §1, medido en vuelo:');
  await win.loadURL('file://' + path.join(ROOT, 'src', 'index.html') + '?pasada=1');
  await sleep(3000);
  if (!await P()) bad('no se pudo entrar a la pasada para medir el baseline');
  else {
    // 1) EL TIEMPO MUERTO (§1.3). Una corrida entera desde la entrada, sin tocar nada mas que el
    // gas: cuantos segundos seguidos el mar esta VACIO. El analisis dice 11,6 s de ingreso; lo que
    // importa no es ese numero sino el HUECO — cuanto tiempo no pasa nada delante del morro.
    await js('__pdef(1); __pinv(1); __plives(1); __pvara()');
    // se guarda la ULTIMA lectura viva: la corrida termina estrellandose contra el buque (es una
    // corrida de ingreso sin virar, a proposito) y leer despues del final da null.
    const linea = [];
    let base = null;
    for (let k = 0; k < 30; k++) {
      await sleep(400);
      const a = await P();
      if (!a) break;
      base = a;
      linea.push(`${a.vidaT}s r=${a.r} amen=${a.amen}`);
    }
    if (!base) bad('la corrida se corto antes de poder medir el baseline');
    else {
      // OTRA VEZ LA LECCION R0.3, y por eso queda escrita dos veces. La primera version de esto
      // afirmaba "el hueco tiene que ser mayor a 4 s" para probar que el §1.3 se reproducia — y
      // eso es congelar el mundo viejo en una prueba, o sea garantizar que el rescate la rompa. El
      // baseline es un numero HISTORICO (medido el 16/8, antes de R2) y vive anotado en el §6 del
      // plan; la vara sirve para comparar contra el. Lo que ASEGURA que R2 funciono se prueba en
      // su propia seccion, mas abajo, y no aca.
      const GAP_BASE = 6.1, AMEN_BASE = 0.34;
      ok(`la vara mide: peor hueco ${base.gapMax} s sin NADA visible · `
        + `media de ${base.amenMed} amenazas en pantalla · corrida de ${base.vidaT} s`);
      console.log(`      baseline pre-R2 (§6 del plan): hueco ${GAP_BASE} s · ${AMEN_BASE} amenazas de media`);
      console.log('      linea de tiempo: ' + linea.slice(0, 8).join(' · '));
    }

    // 2) EL MISIL ASESINO (§1.1). Se cruza el techo lejos y se deja que el Dart haga lo suyo SIN
    // esquivar: lo que se mide es cuanto vive el jugador desde que sale el misil. El analisis lo
    // calcula en ~3 s de papel; esto es en vuelo.
    await win.loadURL('file://' + path.join(ROOT, 'src', 'index.html') + '?pasada=1');
    await sleep(3000);
    // 1500 m Y NO 1200: desde R1 el misil NO SALE si fuera a impactar antes de DART_TTI_MIN, y a
    // 1200 m no llega a dar esos 4,5 s. Que la prueba tuviera que alejarse es, en si misma, la
    // regla de R1 funcionando.
    await js('__pdef(1); __pinv(0); __plives(9); __pset(1500, 40, 0)');
    // se lee por __pdart y no por __pdbg: el impacto que se mide DESTRUYE la instancia, asi que
    // el numero tiene que vivir fuera de ella (ver `lastDartTTI` en el sistema).
    let tti = null, ttip = null;
    for (let k = 0; k < 40; k++) {
      await sleep(200);
      const dd = JSON.parse(await js('__pdart()'));
      if (dd.pred > 0) ttip = dd.pred;
      if (dd.tti > 0) { tti = dd.tti; break; }
    }
    if (tti === null && ttip === null) bad('el Sea Dart no llego a salir: no se pudo medir el TTI');
    else if (tti === null) ok(`BASELINE del Dart: predicho ${ttip} s de vida (no toco en esta corrida)`);
    else {
      // EL BASELINE ES UN NUMERO HISTORICO, no una asercion viva. Se midio ANTES de R1 y quedo
      // anotado en el §6 del plan; la vara sirve para comparar contra el, no para congelar el
      // mundo viejo. Fijar aca "tiene que ser malo" habria hecho que la prueba se rompiera
      // justamente cuando el rescate empezara a funcionar — que es lo que paso.
      const TTI_BASE = 3.27;
      ok(`el Dart da ${tti} s de vida (predicho ${ttip} s) · baseline pre-R1: ${TTI_BASE} s`);
      if (tti > TTI_BASE) ok(`R1 mejoro la lectura del misil: ${TTI_BASE} → ${tti} s de tiempo para entender`);
      else bad(`el Dart no mejoro contra el baseline (${TTI_BASE} s): ahora da ${tti} s`);
    }
  }

  // ---------- R1: EL MISIL JUSTO ----------
  // Los tres criterios de cierre del plan, textuales: quieto te morís HABIENDO VISTO Y OIDO el
  // misil; quebrando sobrevivís SIEMPRE; y la soga del esquive se ve pasar de largo.
  console.log('\nR1 — el misil justo:');
  await win.loadURL('file://' + path.join(ROOT, 'src', 'index.html') + '?pasada=1');
  await sleep(3000);
  if (!await P()) bad('no se pudo entrar a la pasada para probar R1');
  else {
    // 1) QUIETO: te mata, pero te da tiempo. El baseline de R0 daba 3,27 s; R1 exige >= 3,5 y la
    // regla de lanzamiento (DART_TTI_MIN 4,5) impide que salga uno mas corto que eso.
    await js('__pdef(1); __pinv(0); __plives(9); __pset(1500, 40, 0)');
    let tti = null;
    for (let k = 0; k < 50; k++) {
      await sleep(200);
      const dd = JSON.parse(await js('__pdart()'));
      if (dd.tti > 0) { tti = dd.tti; break; }
    }
    if (tti === null) bad('quieto, el Sea Dart no llego a tocar: no se puede medir el tiempo de lectura');
    else if (tti >= 3.5) ok(`QUIETO te mata, pero con lectura: ${tti} s desde el lanzamiento (baseline R0: 3.27 s)`);
    else bad(`quieto el misil sigue matando sin tiempo de leerlo: ${tti} s (R1 exige 3.5)`);

    // 2) QUEBRANDO SE SOBREVIVE SIEMPRE. Tres intentos, y "siempre" es literal: un esquive que
    // funciona a veces no enseña nada, porque el jugador no puede saber si hizo lo correcto.
    let vivos = 0, intentos = 0;
    for (let t = 0; t < 3; t++) {
      await win.loadURL('file://' + path.join(ROOT, 'src', 'index.html') + '?pasada=1');
      await sleep(3000);
      await js('__pdef(1); __pinv(0); __plives(9); __pset(1500, 40, 0)');
      // esperar a que SALGA el misil, y recien ahi quebrar sostenido
      let salio = false;
      for (let k = 0; k < 30; k++) { await sleep(150); const a = await P(); if (a && a.dart) { salio = true; break; } if (!a) break; }
      if (!salio) continue;
      intentos++;
      // LA FOTO VA EN MEDIO DEL QUIEBRE, no despues. La soga dura DART_SMOKE_LIFE (2 s): sacada
      // al final del intento —4,7 s despues de empezar a quebrar— el misil ya paso y el humo ya se
      // disipo, y la captura mostraba un mar vacio. El instante que hay que ver es el misil
      // pasando de largo CON su soga todavia en el aire.
      down('q');
      // LA FOTO DEL ESQUIVE VA EN TERCERA PERSONA. Desde la cabina, quebrando, el misil te pasa por
      // el costado y por atras: no verlo es CORRECTO —no hay ojos en la nuca— pero entonces la
      // captura no puede probar nada. En tercera (la tecla V, que el jugador tiene) se ve el avion
      // virando y la soga pasando de largo, que es la imagen que el criterio pide.
      if (t === 0) { down('v'); up('v'); }
      await sleep(1800);
      if (t === 0) { await shot('r1_soga'); down('v'); up('v'); }
      await sleep(400); up('q');                    // quiebre SOSTENIDO, mas que la ventana de 1,2 s
      await sleep(2500);                            // que el misil termine de pasar
      const a = await P();
      if (a) vivos++;
    }
    if (!intentos) bad('el misil no salio en ninguno de los tres intentos de esquive');
    else if (vivos === intentos) ok(`QUEBRANDO se sobrevive SIEMPRE: ${vivos}/${intentos} esquives`);
    else bad(`el quiebre no salva siempre: ${vivos}/${intentos} (R1 exige todos)`);
  }

  // ---------- R2: LA DENSIDAD ----------
  // El criterio del plan, textual: "durante la corrida nunca pasan >4 s sin una amenaza VISIBLE en
  // pantalla; el near-miss suma y se siente". Lo que R2 arregla no es la dificultad —el conteo
  // letal es el mismo— sino el VACIO: 6,1 s de mar sin nada, medidos por la vara de R0.
  console.log('\nR2 — la densidad:');
  await win.loadURL('file://' + path.join(ROOT, 'src', 'index.html') + '?pasada=1');
  await sleep(3000);
  if (!await P()) bad('no se pudo entrar a la pasada para medir la densidad');
  else {
    // 1) EL HUECO. La misma corrida de ingreso que midio el baseline, con la misma vara: se entra,
    // se vuela derecho y se cuenta cuantos segundos seguidos no hay NADA delante del morro.
    // Invulnerable a proposito — lo que se mide es lo que se VE, no lo que se sobrevive.
    await js('__pdef(1); __pinv(1); __plives(1); __pvara()');
    let den = null, roces = 0, mangMax = 0, foto = 0;
    for (let k = 0; k < 24; k++) {
      await sleep(400);
      const a = await P();
      if (!a) break;
      den = a; roces = a.roces; mangMax = Math.max(mangMax, a.mangueras);
      // LA FOTO SE SACA EN VUELO Y CON EL CHORRO ENCIMA. Sacada al final del muestreo caia en la
      // pantalla de relevo —la corrida termina estrellandose contra el casco, a proposito— y la
      // captura mostraba un cartel en vez de la unica imagen que R2 tiene para dar. Misma cicatriz
      // que la foto de la oleada (P7) y que la de la soga (R1): el instante hay que elegirlo.
      if (!foto && a.mangueras >= 1 && a.r < 520) { foto = 1; await shot('r2_mangueras'); }
    }
    if (!den) bad('la corrida se corto antes de poder medir la densidad');
    else {
      const GAP_BASE = 6.1, AMEN_BASE = 0.34;
      if (den.gapMax <= 4)
        ok(`el mar YA NO SE VACIA: peor hueco ${den.gapMax} s (baseline ${GAP_BASE} s · el criterio son 4)`);
      else bad(`sigue habiendo huecos de ${den.gapMax} s sin nada visible (el criterio son 4, baseline ${GAP_BASE})`);
      if (den.amenMed > AMEN_BASE * 2)
        ok(`la corrida se lleno: ${den.amenMed} amenazas de media en pantalla (baseline ${AMEN_BASE})`);
      else bad(`la densidad casi no subio: ${den.amenMed} de media contra ${AMEN_BASE} del baseline`);
      if (mangMax >= 1) ok(`las MANGUERAS barren el cielo: hasta ${mangMax} chorro(s) a la vez (HOSE_N son 2)`);
      else bad('no salio ninguna manguera de trazadoras');
      if (!foto) bad('no se pudo capturar el chorro de trazadoras en vuelo');
    }

    // 2) EL ROCE SUMA. Es el unico premio del modo que no pasa por la bomba, y sin el lo optimo es
    // volar por donde no pasa nada — que es la definicion de aburrido. Volando derecho por el eje,
    // entre las horquillas y los chorros, algo tiene que rozar.
    if (roces > 0) ok(`el ROCE se cobra: ${roces} pasada(s) cerca premiada(s) en una sola corrida`);
    else bad('nunca se cobro un roce: el near-miss no llega a pasar (NEARMISS_R o las capas)');
  }

  // 3) EL CAÑON ABRE TEMPRANO (GUN_FIRST_S). Era 4,6 s: la mitad del ingreso en silencio.
  await win.loadURL('file://' + path.join(ROOT, 'src', 'index.html') + '?pasada=1');
  let abrio = null;
  for (let k = 0; k < 90; k++) {
    await sleep(100);
    const a = await P();
    if (a && a.salvas >= 1) { abrio = a.t; break; }
  }
  if (abrio === null) bad('el cañon no abrio fuego en toda la corrida');
  else if (abrio <= 2.5) ok(`el cañon ABRE a los ${abrio} s de entrar (GUN_FIRST_S son 1.5; antes eran 4.6)`);
  else bad(`el cañon tardo ${abrio} s en abrir: el ingreso sigue empezando en silencio`);

  // 4) Y NO ES UNA EMBOSCADA: LA HORQUILLA. Abrir a los 1,5 s solo vale si las primeras
  // GUN_BRACKET salvas ENCUADRAN en vez de matar — caen corridas a un costado y al otro, cada vez
  // mas cerca, hasta que la tercera cae sobre la linea. Se mide la GEOMETRIA y no la supervivencia
  // a proposito: volando derecho el avion tambien se hunde, se come un Sea Cat o llega al casco, y
  // una prueba de supervivencia terminaria hablando de gravedad. Que la tercera SI mate esta
  // probado en la seccion 9 ("derecho te toma"); las dos juntas son la regla entera.
  await win.loadURL('file://' + path.join(ROOT, 'src', 'index.html') + '?pasada=1');
  await sleep(3000);
  if (!await P()) bad('no se pudo entrar a la pasada para probar la horquilla');
  else {
    // CON EL CALOR AL MAXIMO, y no por dificultad: el calor solo acelera la CADENCIA (`gunT` corre
    // a 1+heat), asi que las tres salvas entran en ~3 s en vez de ~9. Sin esto la medicion se
    // quedaba en dos: a los 9 segundos el morro ya se hundio hasta el agua y no hay tercera salva
    // que leer — otra vez la gravedad metiendose en una prueba que no es de ella. El calor no toca
    // el CORRIMIENTO, que es lo unico que esta prueba mira.
    await js('__pdef(1); __pinv(1); __plives(1); __pset(1400, 90, 0)'); await sleep(150);
    await js('__pheat(2)');
    // se junta el corrimiento MAXIMO visto por salva a lo largo de tres salvas: las columnas viven
    // ~2 s, asi que hay que mirar seguido para no perderse ninguna
    const porSalva = {};
    for (let k = 0; k < 60; k++) {
      await sleep(200);
      if (!await P()) break;
      for (const c of JSON.parse(await js('__pcols()')))
        porSalva[c.salva] = Math.max(porSalva[c.salva] || 0, Math.abs(c.off));
      if (porSalva[2] !== undefined) break;
    }
    const h0 = porSalva[0], h1 = porSalva[1], h2 = porSalva[2];
    if (h0 === undefined || h1 === undefined || h2 === undefined)
      bad(`no salieron las tres salvas para medir la horquilla (${JSON.stringify(porSalva)})`);
    else if (h0 > h1 && h1 >= 24 && h2 === 0)
      ok(`la HORQUILLA te ENCUADRA y se cierra: la salva 1 cae a ${h0} m del rumbo · la 2 a ${h1} · la 3 SOBRE la linea (0)`);
    else bad(`la horquilla no se cierra como debe: salva 1 a ${h0} m, salva 2 a ${h1}, salva 3 a ${h2}`);
  }

  // ---------- lo que todavia no existe ----------
  console.log('\nTODAS las fases del §8 estan cubiertas: P0 a P7.');

  console.log('\nconsola: ' + (errors.length ? errors.length + ' error(es)' : 'sin errores'));
  for (const e of errors.slice(0, 8)) console.error('   ' + e);
  console.log(fails || errors.length ? `\nFIXTURE PASADA: FALLA (${fails})\n` : '\nFIXTURE PASADA: OK\n');
  app.exit(fails || errors.length ? 1 : 0);
}).catch(e => { console.error('reventó:', e); app.exit(1); });
process.on('unhandledRejection', e => { console.error('REJECTION:', e && e.message); app.exit(1); });
