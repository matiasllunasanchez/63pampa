// FIXTURE DE ACEPTACION de LA COLA (PLAN_HARRIERS_PERSECUCION, PLAN A), corrido en el juego real.
//   npm run caza                    · CAZA_SHOTS=/tmp/x npm run caza   (deja capturas)
//
// No esta dentro de `npm run check` por la misma razon que los otros fixtures del repo: son
// segundos de VUELO de verdad, y lo que prueba no es una formula sino que el duelo entero funcione
// adentro del juego.
//
// ESTADO: H0 (el cimiento) y H1 (el pase fantasma, SIN daño) cubiertos. Lo que H1 promete es una
// MIRADA MUDA — que el ciclo se entienda sin leer un cartel — asi que la mitad de este fixture son
// CAPTURAS: hay cosas que ninguna asercion puede juzgar y este proyecto ya se llevo esa leccion
// puesta (la pantalla de relevo mentia y solo se vio mirandola).
const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const ROOT = path.join(__dirname, '..');
const OUT = process.env.CAZA_SHOTS || '';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const errors = [];
let win, fails = 0;
const bad = m => { console.error('   ✗ ' + m); fails++; };
const ok = m => console.log('   ✓ ' + m);
const js = s => win.webContents.executeJavaScript(s);
async function tap(keyCode) {
  win.webContents.sendInputEvent({ type: 'keyDown', keyCode });
  await sleep(90);
  win.webContents.sendInputEvent({ type: 'keyUp', keyCode });
  await sleep(160);
}
const C = async () => JSON.parse(await js('String(window.__czdbg && window.__czdbg())') || 'null');
async function shot(n) {
  if (!OUT) return;
  fs.writeFileSync(path.join(OUT, n + '.png'), (await win.webContents.capturePage()).toPNG());
}

// CUANTOS PIXELES DEL CUADRO CAMBIARON respecto de una referencia. Es como se mide "algo grande te
// paso al lado" sin mirar: el sobrepaso tiene que mover MUCHO mas pantalla que el vuelo normal.
//
// CORRE ADENTRO DE LA PAGINA, en el rAF del juego, y no desde el proceso principal. La primera
// version muestreaba cada 90 ms desde afuera y cada ida y vuelta costaba mas que eso: el pico
// medido saltaba de z 12 a z 51 entre corridas segun donde cayeran las muestras. O sea que el
// numero era del scheduler, no del juego. Desde el rAF se ven TODOS los cuadros y solo viaja un
// numero por cuadro. Es la misma leccion que ya traia el SAMPLER de tools/fixture_pasada.js.
const SAMPLER = `(() => {
  const c = document.getElementById('g');
  const s = document.createElement('canvas'); s.width = 48; s.height = 27;
  const x = s.getContext('2d', { willReadFrequently: true });
  const grab = () => { x.drawImage(c, 0, 0, 48, 27); return x.getImageData(0, 0, 48, 27).data; };
  window.__czref = grab();
  window.__czcap = [];
  const loop = () => {
    const d = grab(), r = window.__czref;
    let n = 0, tot = 0;
    for (let i = 0; i < d.length; i += 4) {
      tot++;
      if (Math.abs(d[i]-r[i]) + Math.abs(d[i+1]-r[i+1]) + Math.abs(d[i+2]-r[i+2]) > 40) n++;
    }
    const s2 = window.__czdbg && JSON.parse(String(window.__czdbg()) || 'null');
    window.__czcap.push([Math.round(n / tot * 100), s2 ? s2.z : -1, s2 ? s2.fase : '']);
    if (window.__czcap.length < 2000) requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
  return 'ok';
})()`;

app.whenReady().then(async () => {
  console.log('\nFIXTURE — LA COLA (H0-H1)\n');
  win = new BrowserWindow({ width: 1280, height: 760, show: false, webPreferences: { backgroundThrottling: false } });
  win.webContents.on('console-message', (e, l, m) => { if (l >= 3 && !m.includes('Security Warning')) errors.push(m.slice(0, 300)); });
  win.webContents.on('render-process-gone', (e, d) => errors.push('EL RENDERER MURIO: ' + JSON.stringify(d)));

  // ---------- 1. H0 — SE ENTRA AL DUELO POR SONDA ----------
  // POR LA PATRIA es el modo correcto para esto: solo PASILLO, infinito, sin climax y sin barco al
  // final. El duelo es una mecanica del PASILLO (§6.6) y aca no hay nada mas que pasillo.
  console.log('1. H0 — el cimiento: se entra al duelo por sonda:');
  await win.loadURL('file://' + path.join(ROOT, 'src', 'index.html') + '?qa&caza');
  await sleep(2500);
  // portada → JUEGO RAPIDO → POR LA PATRIA → avion → a volar (el mismo camino que tools/smoke.js)
  await tap('Return'); await tap('Down'); await tap('Return');
  await tap('Down'); await tap('Return'); await tap('Return');
  await sleep(1200);
  // gas sostenido: sin piloto el avion cae al mar en segundos y no hay duelo que mirar
  const gas = setInterval(() => win.webContents.sendInputEvent({ type: 'keyDown', keyCode: 'w' }), 40);
  await sleep(4000);
  await js('__czcalma(1)');   // el pasillo, vacio: esta seccion mide el duelo, no el pasillo
  let d = await C();
  if (!d) { console.error('   ✗ ?caza no armo el duelo'); app.exit(1); return; }
  ok(`el duelo esta armado · fase ${d.fase} · pasada ${d.pase} · CAP ${d.capT} s`);
  if (d.z >= d.pz) bad(`arranca ADELANTE tuyo (z ${d.z} contra tu ${d.pz}): tiene que tomarte la COLA`);
  else ok(`esta en tu COLA: z ${d.z} contra tu z ${d.pz}`);
  await shot('h1_a_presion');

  // ---------- 2. H1 — LAS TRAZADORAS LLEGAN ANTES QUE EL AVION ----------
  console.log('\n2. H1 — el aviso llega ANTES que el avion (§1, el tell canonico):');
  // se fuerza la presion y se deja correr: lo que tiene que haber en pantalla son trazadoras
  await js(`__czfase('presion')`);
  await sleep(2500);
  d = await C();
  ok(`presionando desde la cola: fase ${d.fase}, z ${d.z}`);
  await shot('h1_b_trazadoras');

  // ---------- 3. LA SOLUCION DE TIRO MADURA CON EL RUMBO PREDECIBLE ----------
  // H1 no cobra nada todavia (los dientes son H2), pero el numero YA se mide: es lo que va a
  // decidir si la regla del ras enseña algo. Sin medirlo desde ahora, H2 arranca a ciegas.
  console.log('\n3. la solucion de tiro ya se MIDE (todavia no cobra — eso es H2):');
  await js(`__czfase('presion')`);
  const sol0 = (await C()).sol;
  await sleep(2000);
  const solRecto = (await C()).sol;
  if (solRecto > sol0) ok(`volando derecho la solucion MADURA: ${sol0} → ${solRecto}`);
  else bad(`volando derecho la solucion no progresa (${sol0} → ${solRecto})`);

  // ---------- 4. EL SOBREPASO: EL CRUCE CERCANO ----------
  console.log('\n4. H1 — el sobrepaso: el que estaba atras queda ADELANTE:');
  // la REFERENCIA se toma con el caza atras y fuera de cuadro: lo que cambie despues es el pase
  await js(`__czfase('presion')`);
  await sleep(400);
  await js(SAMPLER);
  await js(`__czfase('sobrepaso')`);
  await sleep(1700);
  const cap = await js('window.__czcap');
  let mov = 0, zPico = 0;
  for (const [pc, z] of cap) if (pc > mov) { mov = pc; zPico = z; }
  ok(`sobrepasando: el pico fue a z ${zPico} (venia de la cola en ~6, vos volas en 14)`);
  // 20% del cuadro es MUCHO: el sprite del caza a z 12 mide ~120x70 px de los 480x270 del mundo,
  // o sea que un pase que llega a esa marca esta efectivamente tapandote un pedazo de juego.
  if (mov < 20) bad(`el cruce cercano no mueve pantalla (${mov}% de pixeles): tiene que ser un GOLPE`);
  else ok(`el cruce cercano LLENA la pantalla: ${mov}% de los pixeles cambiaron en el pico`);
  // y la foto del pase, tomada aparte a la altura del pico
  await js(`__czfase('sobrepaso')`);
  await sleep(200);
  await shot('h1_c_sobrepaso');
  await sleep(1400);

  // el sobrepaso TERMINA adelante tuyo: es lo que lo convierte en tu turno
  await sleep(1100);
  d = await C();
  if (!d) bad('el duelo se termino en el sobrepaso');
  else if (d.z <= d.pz) bad(`tras el sobrepaso sigue atras (z ${d.z}): el ciclo no cerro`);
  else ok(`quedo ADELANTE tuyo: z ${d.z} contra tu z ${d.pz} — fase ${d.fase}`);

  // ---------- 5. LA VENTANA FRONTAL ----------
  console.log('\n5. H1 — la ventana frontal (2,5-4 s de frente, esquivandose):');
  await js(`__czfase('ventana')`);
  await sleep(1200);
  d = await C();
  ok(`de frente y lejos: fase ${d.fase}, z ${d.z}`);
  await shot('h1_d_ventana');

  // ---------- 6. LA SALIDA ----------
  console.log('\n6. H1 — la salida: se va, y se VE irse:');
  await js(`__czfase('salida')`);
  // la foto va TEMPRANO: a los 900 ms el caza ya estaba en z 284 y la captura salia vacia — que es
  // verdad ("se fue") pero no muestra nada. Lo que hay que ver es el momento de irse, no el despues.
  await sleep(380);
  d = await C();
  if (d) { ok(`alejandose: z ${d.z}`); await shot('h1_e_salida'); }
  await sleep(2400);
  d = await C();
  if (d) bad('la salida no termino el duelo');
  else ok('el duelo TERMINO: no queda nada corriendo');

  // ---------- 7. EL CICLO COMPLETO, SIN AYUDA ----------
  // Lo anterior salta de fase para poder fotografiar; esto lo deja correr SOLO y anota por donde
  // pasa. Es la unica prueba de que el ciclo del §3 se encadena de verdad.
  console.log('\n7. el ciclo del §3 corre SOLO y se encadena:');
  await js('__czstart({})');
  const visto = [];
  for (let i = 0; i < 120; i++) {
    const s = await C();
    if (s && visto[visto.length - 1] !== s.fase) visto.push(s.fase);
    if (!s && visto.length) break;
    await sleep(250);
  }
  console.log('      recorrido: ' + visto.join(' → '));
  for (const f of ['aviso', 'presion', 'sobrepaso', 'ventana']) {
    if (visto.includes(f)) ok(`paso por la fase ${f}`);
    else bad(`nunca llego a la fase ${f}`);
  }

  // ---------- 8. EL §6: LO QUE NO TIENE QUE PASAR ----------
  console.log('\n8. §6 — lo que el duelo NO hace:');
  const dos = await js('__czstart({})');
  if (dos === true) bad('se armo un SEGUNDO Harrier: el §6.2 dice UNO por vez');
  else ok('UN solo Harrier: un segundo start() no arma nada (§6.2)');

  clearInterval(gas);
  console.log('\nconsola: ' + (errors.length ? errors.length + ' error(es)\n  ' + errors.join('\n  ') : 'sin errores'));
  if (errors.length) fails += errors.length;
  console.log('\nFIXTURE COLA: ' + (fails ? `FALLA (${fails})` : 'OK') + '\n');
  app.exit(fails ? 1 : 0);
});
