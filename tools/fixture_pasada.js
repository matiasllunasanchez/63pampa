// FIXTURE DE ACEPTACION de la fase PASADA (SPEC_MODO_PASADA §7), corrido en el juego de verdad.
//   npm run pasada                     · PASADA_SHOTS=/tmp/x npm run pasada  (deja capturas)
//
// El spec pide correrlo DESPUES DE CADA FASE (§0.2), junto con `npm run check`. No esta dentro de
// `check` por la misma razon que el fixture de historia: son segundos de vuelo REAL, y lo que
// prueba no es una formula sino que la fase entera funcione adentro del juego.
//
// ESTADO: fase P0. Los pasos del §7 que dependen de sistemas que todavia no existen (bomba,
// defensa, nafta) se IMPRIMEN COMO PENDIENTES con la fase que los trae — un fixture que calla lo
// que no cubre se lee como si cubriera todo.
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
    window.__cap.push([Math.round(lum / (24 * 14 * 3)), sig, (window.__pdbg && window.__pdbg()) ? 1 : 0]);
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
  console.log('\nFIXTURE — FASE PASADA (P0)\n');
  win = new BrowserWindow({ width: 960, height: 540, show: false, webPreferences: { backgroundThrottling: false } });
  win.webContents.on('console-message', (e, l, m) => { if (l >= 3 && !m.includes('Security Warning')) errors.push(m.slice(0, 300)); });
  win.webContents.on('render-process-gone', (e, d) => errors.push('EL RENDERER MURIO: ' + JSON.stringify(d)));

  // ---------- 1. ENTRA POR SONDA Y SE VUELA ----------
  console.log('1. entrada por sonda y vuelo libre:');
  await win.loadURL('file://' + path.join(ROOT, 'src', 'index.html') + '?pasada=3');
  await sleep(3000);
  let d = await P();
  if (!d) { console.error('   ✗ no entro a la pasada con ?pasada=3'); app.exit(1); return; }
  ok(`entro a la pasada · corrida ${d.corrida} · fase ${d.fase} · ${d.zonas} zonas vivas · ${d.r} m del buque`);
  if (d.alt > 35) bad(`la entrada tendria que ser A RAS (bajo el techo de radar); entro a ${d.alt} m`);
  else ok(`entra a ras: ${d.alt} m, bajo el techo de radar (35 m)`);
  await shot('p0_entrada');

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
  const lum = [];
  for (const p of [0.60, 0.85, 0.98]) { await js(`__wjump(${p})`); await sleep(280); lum.push(await js(LUM)); }
  const caida = Math.min(...lum) / lum[0];
  if (caida < 0.85) bad(`el cuadro se apaga acercandose al buque (${(caida * 100) | 0}% del brillo del 60%): eso es un telon`);
  else ok(`sin telon en la aproximacion: brillo ${lum.join(' → ')} entre el 60% y el 98% del camino`);

  await js(SAMPLER);
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
      // FRAME NEGRO: un fundido deja el cuadro casi en cero. El umbral es relativo al pasillo
      // porque el juego ES oscuro — comparar contra un absoluto seria comparar contra nada.
      if (min < base * 0.35) bad(`hay un cuadro apagado en la transicion (brillo ${min} vs ${base} del pasillo): eso es un fade`);
      else ok(`sin cuadro negro: el brillo no baja de ${min} con ${base} de referencia`);
      // EL CANVAS SIGUE CAMBIANDO: dos cuadros seguidos identicos = render congelado
      let quietos = 0;
      for (let i = 1; i < banda.length; i++) if (banda[i][1] === banda[i - 1][1]) quietos++;
      if (quietos) bad(`${quietos} par(es) de cuadros identicos en la transicion: el render se congela`);
      else ok(`el canvas cambia en los ${banda.length} cuadros de la transicion`);
      // SIN PANTALLA EN EL MEDIO: se pasa de volar a volar, sin estado intermedio
      const st = await js('JSON.parse(__pausedbg()).state');
      if (st !== 'pasada') bad(`estado inesperado tras la transicion: ${st}`);
      else ok('de volar a volar: no hay pantalla intermedia (estado pasada)');
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

  // ---------- LA SUELTA: pasos 2 a 5 del §7 ----------
  // Cada suelta se hace desde la distancia donde el impacto PREVISTO cae sobre el buque: el error
  // viene con signo (+ corta, − larga), asi que se corrige en dos o tres pasos. Sin eso, "la bomba
  // no hizo daño" no distingue entre una mecanica rota y una suelta mal apuntada.
  console.log('\n4. la suelta: las tres bandas, el sapito y la ristra (pasos 2-5):');
  await win.loadURL('file://' + path.join(ROOT, 'src', 'index.html') + '?pasada=1');
  await sleep(3000);
  if (!await P()) { bad('no se pudo entrar a la pasada para probar la suelta'); }
  else {
    /** Suelta desde `alt` (con turbo si `turbo`) sobre el eje `off`, y devuelve que paso. */
    async function tirar(alt, turbo, off) {
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
      await sleep(3000);
      const desp = await P();
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
    const eje = await tirar(35, false, Math.PI / 2);          // a lo largo del casco
    await win.loadURL('file://' + path.join(ROOT, 'src', 'index.html') + '?pasada=1');
    await sleep(3000);
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
  if (await P()) {
    await js('window.__pkill()');
    await sleep(4200);
    const st = await js('JSON.parse(__pausedbg()).state');
    if (st === 'results') ok('todas las zonas muertas → results, sin pantallas intermedias');
    else bad(`todas las zonas muertas y el estado quedo en ${st} (esperaba results)`);
    await shot('p0_fin');
  } else bad('no hay pasada activa para probar el fin');

  // ---------- lo que todavia no existe ----------
  console.log('\npasos del §7 que dependen de fases posteriores:');
  pend(6, 'P3 — Sea Cat: con quiebre no pega, recto pega');
  pend(7, 'P3 — calor: la corrida 3 tira mas cerrado que la 1');
  pend(8, 'P4 — la nafta como reloj de la zona');

  console.log('\nconsola: ' + (errors.length ? errors.length + ' error(es)' : 'sin errores'));
  for (const e of errors.slice(0, 8)) console.error('   ' + e);
  console.log(fails || errors.length ? `\nFIXTURE PASADA: FALLA (${fails})\n` : '\nFIXTURE PASADA: OK\n');
  app.exit(fails || errors.length ? 1 : 0);
}).catch(e => { console.error('reventó:', e); app.exit(1); });
process.on('unhandledRejection', e => { console.error('REJECTION:', e && e.message); app.exit(1); });
