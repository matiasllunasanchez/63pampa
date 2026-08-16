// FIXTURE DE ACEPTACION de EL PULSO (docs/sistemas/PLAN_EL_PULSO.md §5), corrido en el juego.
//   npm run pulso                    ·  PULSO_SHOTS=/tmp/x npm run pulso   (deja capturas)
//
// El criterio de cierre de Q2, literal: «perfecta gana; 1 error en facil perdona; 3 fallos =
// derrota de siempre». Eso es lo que se mide aca, mas la escalada y la eleccion de blanco.
//
// POR QUE NO ES UN UNIT TEST: las cuentas puras (margen, largo, pool) SI estan en `npm run unit`
// (core/pulso.js). Lo que esto prueba es otra cosa — que la prueba entera FUNCIONA adentro del
// juego: que el toque entra, que el reloj corre en tiempo de pared con el mundo casi detenido, y
// que los tres fallos desembocan donde tienen que desembocar.
//
// SE TECLEA POR SONDA (__qtap) y no con teclas reales a proposito: el fixture no puede depender
// del foco del teclado, y los margenes son de decimas — un evento perdido seria un falso fallo.
const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const ROOT = path.join(__dirname, '..');
const OUT = process.env.PULSO_SHOTS || '';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const errors = [];
let win, fails = 0;
const bad = m => { console.error('   ✗ ' + m); fails++; };
const ok = m => console.log('   ✓ ' + m);
const js = s => win.webContents.executeJavaScript(s);
const Q = async () => JSON.parse(await js('String(window.__qdbg && window.__qdbg())') || 'null');
async function shot(n) {
  if (!OUT) return;
  fs.writeFileSync(path.join(OUT, n + '.png'), (await win.webContents.capturePage()).toPNG());
}

/** Re-entra a la prueba con una configuracion dada (nivel, campaña, libreta). */
const cfg = o => js(`String(window.__qcfg(${JSON.stringify(o)}))`).then(s => JSON.parse(s));
const tap = t => js(`window.__qtap(${JSON.stringify(t)})`);

/** Teclea la secuencia ENTERA leyendo lo esperado de la sonda. `zona` elige carril al empezar.
 *  `err` inyecta UN token equivocado antes del primer acierto (para probar el perdon). */
async function tocar({ zona, err } = {}) {
  let d = await Q();
  if (d && d.zi < 0 && zona) {
    // elegir carril = teclear su primer token. Se busca cual de los carriles es la zona pedida.
    const i = d.carriles.findIndex(c => c.startsWith(zona + ':'));
    if (i >= 0) { if (err) { await tap('R'); err = false; } await tap(d.esperado[i]); }
  }
  for (let k = 0; k < 30; k++) {
    d = await Q();
    if (!d || d.fase !== 'prueba') return d;
    if (err) { await tap('R'); err = false; continue; }   // 'R' (rolar der) no arranca ninguna
    const e = d.zi < 0 ? d.esperado[0] : d.esperado;
    if (!e) return d;
    await tap(e);
  }
  return await Q();
}

app.whenReady().then(async () => {
  console.log('\nFIXTURE — EL PULSO (Q0-Q2)\n');
  win = new BrowserWindow({ width: 1280, height: 760, show: false, webPreferences: { backgroundThrottling: false } });
  win.webContents.on('console-message', (e, l, m) => { if (l >= 3 && !m.includes('Security Warning')) errors.push(m.slice(0, 300)); });
  win.webContents.on('render-process-gone', (e, d) => errors.push('EL RENDERER MURIO: ' + JSON.stringify(d)));

  // ---------- 1. ENTRADA Y ELECCION DE BLANCO ----------
  console.log('1. entrada por sonda y eleccion de blanco:');
  await win.loadURL('file://' + path.join(ROOT, 'src', 'index.html') + '?pulso=3');
  await sleep(2500);
  let d = await Q();
  if (!d || !d.on) { console.error('   ✗ no entro a la prueba con ?pulso=3'); app.exit(1); return; }
  d = await cfg({});   // reloj de cero: los segundos del arranque ya se habrian comido el margen
  ok(`entro a la prueba · fase ${d.fase} · nivel t01=${d.t01} · margen ${d.beatMax}s`);
  if (d.zi >= 0) bad('la prueba tendria que arrancar SIN carril elegido (elegir es parte de la prueba)');
  else ok(`tres blancos ofrecidos: ${d.carriles.join(' | ')}`);
  if (new Set(d.esperado.split('')).size !== d.esperado.length)
    bad(`dos blancos arrancan con la misma tecla (${d.esperado}): la eleccion seria ambigua`);
  else ok(`cada blanco arranca con una tecla distinta: ${d.esperado}`);
  // LAS CAPTURAS, en dos pasos: primero se CUELGA el margen (sacar la foto tarda mas que la
  // ventana de la prueba) y despues se espera medio segundo — en una ventana oculta el compositor
  // devuelve el ultimo cuadro que pinto, y sin esa espera la foto sale con el cuadro anterior.
  await js('__qhold()'); await sleep(500); await shot('q2_blancos');

  // la zona brava pide MAS compases y paga MAS que la facil
  const largo = s => s.split(':')[1].split('-').length;
  const radar = d.carriles.find(c => c.startsWith('radar:'));
  const polv = d.carriles.find(c => c.startsWith('deposit:'));
  if (radar && polv && largo(polv) > largo(radar))
    ok(`elegir cuesta: radar ${largo(radar)} compases · polvorin ${largo(polv)}`);
  else bad(`las zonas no se diferencian en largo (${radar} vs ${polv})`);

  // ---------- 2. LA PERFECTA GANA ----------
  console.log('\n2. la secuencia perfecta gana la mision:');
  // se RE-ENTRA antes de teclear: el margen del compas corre desde que la prueba arranca, y los
  // segundos que tardo la seccion 1 en leer las sondas ya se lo habrian comido (que es, dicho sea
  // de paso, la prueba de que el reloj corre en tiempo de pared aunque el mundo este detenido)
  await cfg({});
  // se elige el POLVORIN a mano (la zona brava: la secuencia mas larga) y se saca la foto con la
  // autopista ya elegida y el cursor a medio camino — que es la imagen del modo
  {
    const dd = await Q();
    const i = dd.carriles.findIndex(c => c.startsWith('deposit:'));
    await tap(dd.esperado[i]); await js('__qhold()'); await sleep(500); await shot('q2_autopista');
  }
  d = await tocar({});
  if (!d || d.fase !== 'exito') { bad(`tecleando limpio la fase quedo en ${d && d.fase}`); }
  else ok(`secuencia limpia → fase ${d.fase} · zona ${d.zona} · ${d.pts} puntos · sin errores (${d.errs})`);
  await shot('q2_exito');
  for (let k = 0; k < 40 && (await Q()); k++) await sleep(150);
  const st = await js('String(window.__qdbg())');
  if (JSON.parse(st).state !== 'results') bad(`tras el exito el juego quedo en ${JSON.parse(st).state}, no en results`);
  else ok('el exito cierra la mision por el embudo de siempre (results)');

  // ---------- 3. EL PERDON ESCALA POR NIVEL ----------
  console.log('\n3. el perdon de los primeros niveles:');
  await win.loadURL('file://' + path.join(ROOT, 'src', 'index.html') + '?pulso=3');
  await sleep(2500);
  d = await cfg({ t01: 0 });
  if (d.perdon !== 1) bad(`en el primer nivel tendria que perdonarse un error (perdon=${d.perdon})`);
  else ok(`nivel 1: se perdona ${d.perdon} error · margen ${d.beatMax}s`);
  d = await tocar({ zona: 'bridge', err: true });
  await shot('q2_perdon');
  if (d && d.fase === 'exito') ok('un error en el primer nivel NO tumba la pasada: se perdona y se gana');
  else bad(`con un error perdonado la fase quedo en ${d && d.fase} (tries ${d && d.tries})`);

  await win.loadURL('file://' + path.join(ROOT, 'src', 'index.html') + '?pulso=3');
  await sleep(2500);
  d = await cfg({ t01: 1 });
  if (d.perdon !== 0) bad(`en la ultima mision no tendria que perdonarse nada (perdon=${d.perdon})`);
  else ok(`ultima mision: ${d.perdon} perdones · margen ${d.beatMax}s · ${d.carriles[1].split(':')[1]}`);
  d = await tocar({ zona: 'bridge', err: true });
  if (d && d.fase === 'fallo') ok('el mismo error al final de la campaña SI tumba la pasada');
  else bad(`sin perdon, un error dejo la fase en ${d && d.fase}`);

  // ---------- 4. LA ESCALADA ----------
  console.log('\n4. la escalada de la prueba:');
  await win.loadURL('file://' + path.join(ROOT, 'src', 'index.html') + '?pulso=3');
  await sleep(2500);
  const bajo = await cfg({ t01: 0 });
  const alto = await cfg({ t01: 1 });
  const nb = largo(bajo.carriles[1]), na = largo(alto.carriles[1]);
  if (alto.beatMax < bajo.beatMax && na > nb)
    ok(`de la primera a la ultima: ${nb}→${na} compases y ${bajo.beatMax}→${alto.beatMax}s de margen`);
  else bad(`la prueba no escala (${nb}→${na} compases, ${bajo.beatMax}→${alto.beatMax}s)`);

  // ---------- 5. LOS TRES FALLOS Y SUS COSTOS ----------
  // El plan §3: 1º te pasas de largo y el flak se acerca · 2º cuesta un avion · 3º se pierde.
  console.log('\n5. los tres fallos y lo que cuesta cada uno:');
  await win.loadURL('file://' + path.join(ROOT, 'src', 'index.html') + '?pulso=3');
  await sleep(2500);
  await js('window.__qlives(3)');            // escuadron, para poder ver el costo del 2º fallo
  await cfg({ t01: 1 });                     // sin perdones: el fallo es limpio de medir
  // 1er fallo: no tocar nada y dejar que se agote el margen
  for (let k = 0; k < 40; k++) { d = await Q(); if (d && d.fase === 'fallo') break; await sleep(150); }
  if (!d || d.fase !== 'fallo') bad('el margen no se agota solo: el reloj de la prueba no corre');
  else ok(`1er fallo por tiempo (${d.motivo || 'timeout'}) · intentos gastados ${d.tries}`);
  await shot('q2_fallo');
  // el re-encare devuelve a la prueba, con el flak un grado mas cerca y OTRA secuencia
  const antes = d.carriles.join('|');
  for (let k = 0; k < 60; k++) { d = await Q(); if (d && d.fase === 'prueba') break; await sleep(150); }
  if (!d || d.fase !== 'prueba') bad('el re-encare no devuelve a la prueba');
  else {
    ok(`re-encare → fase ${d.fase} · flak grado ${d.flak} · margen ${d.beatMax}s (se achico)`);
    if (d.carriles.join('|') === antes) bad('el re-encare trae la MISMA secuencia: seria memorizar, no volar');
    else ok('el re-encare sortea una secuencia nueva');
  }
  await shot('q2_reencare');
  // 2º fallo: tiene que costar un avion del escuadron (relevo)
  const lv0 = 3;
  for (let k = 0; k < 40; k++) { d = await Q(); if (d && d.fase === 'fallo') break; await sleep(150); }
  for (let k = 0; k < 60; k++) { const s = JSON.parse(await js('String(window.__qdbg())')); if (s.state === 'relevo') { d = s; break; } await sleep(150); }
  const enRelevo = JSON.parse(await js('String(window.__qdbg())')).state === 'relevo';
  if (enRelevo) ok(`2º fallo: cuesta un avion del escuadron (entro en relevo, de ${lv0} aviones)`);
  else bad('el 2º fallo no cobro el avion del escuadron');
  // vuelve a la prueba con la cuenta INTACTA (perder un avion no limpia la pizarra)
  for (let k = 0; k < 90; k++) { d = await Q(); if (d && d.fase === 'prueba') break; await sleep(200); }
  if (d && d.tries === 2) ok(`el companero vuelve A LA PRUEBA con los intentos gastados (${d.tries}) y el flak encima (${d.flak})`);
  else bad(`tras el relevo la prueba quedo en tries=${d && d.tries} (tendria que ser 2)`);
  // 3er fallo: la mision se pierde por el embudo de siempre
  for (let k = 0; k < 60; k++) { d = await Q(); if (d && d.fase === 'fallo') break; await sleep(150); }
  let fin = null;
  for (let k = 0; k < 60; k++) { fin = JSON.parse(await js('String(window.__qdbg())')).state; if (fin !== 'pulso') break; await sleep(200); }
  // los intentos son de la MISION, no del avion: el 3er fallo la pierde aunque queden aviones
  if (fin !== 'dead') bad(`el 3er fallo dejo el juego en ${fin}, no en la derrota de siempre`);
  else ok('3er fallo → la mision se pierde por el embudo de siempre (dead), con aviones de sobra');

  console.log('\nconsola: ' + (errors.length ? errors.length + ' error(es)' : 'sin errores'));
  for (const e of errors.slice(0, 8)) console.error('   ' + e);
  console.log(fails || errors.length ? `\nFIXTURE PULSO: FALLA (${fails})\n` : '\nFIXTURE PULSO: OK\n');
  app.exit(fails || errors.length ? 1 : 0);
}).catch(e => { console.error('reventó:', e); app.exit(1); });
process.on('unhandledRejection', e => { console.error('REJECTION:', e && e.message); app.exit(1); });
