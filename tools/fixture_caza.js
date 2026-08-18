// FIXTURE DE ACEPTACION de LA COLA (PLAN_HARRIERS_PERSECUCION, PLAN A), corrido en el juego real.
//   npm run caza                    · CAZA_SHOTS=/tmp/x npm run caza   (deja capturas)
//
// No esta dentro de `npm run check` por la misma razon que los otros fixtures del repo: son
// segundos de VUELO de verdad, y lo que prueba no es una formula sino que el duelo entero funcione
// adentro del juego.
//
// ESTADO: H0-H4 cubiertos (cimiento, pase fantasma, dientes, contraataque y reglamento).
//
// LAS SECCIONES 1-8 CORREN EL DUELO EN MODO **MANSO** (sin las rafagas que matan) y no es una
// trampa: es el criterio de siempre del repo — la seccion que mide una cosa apaga lo que no esta
// midiendo. Lo que miden es la COREOGRAFIA, y no se puede juzgar un sobrepaso desde la pantalla de
// derribado. Los dientes tienen sus propias secciones (9 en adelante) y ahi el duelo va entero.
//
// Lo que H1 promete es una
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
  console.log('\nFIXTURE — LA COLA (H0-H5)\n');
  win = new BrowserWindow({ width: 1280, height: 760, show: false, webPreferences: { backgroundThrottling: false } });
  win.webContents.on('console-message', (e, l, m) => { if (l >= 3 && !m.includes('Security Warning')) errors.push(m.slice(0, 300)); });
  win.webContents.on('render-process-gone', (e, d) => errors.push('EL RENDERER MURIO: ' + JSON.stringify(d)));

  // ---------- 1. H0 — SE ENTRA AL DUELO POR SONDA ----------
  // POR LA PATRIA es el modo correcto para esto: solo PASILLO, infinito, sin climax y sin barco al
  // final. El duelo es una mecanica del PASILLO (§6.6) y aca no hay nada mas que pasillo.
  console.log('1. H0 — el cimiento: se entra al duelo por sonda:');
  await win.loadURL('file://' + path.join(ROOT, 'src', 'index.html') + '?qa&caza=manso');
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
  // ENTRA DE FRENTE desde el horizonte, te cruza y RECIEN AHI te toma la cola. Lo que se mide es
  // donde TERMINA el acercamiento, que es lo que le da los dientes: z por debajo de la tuya.
  await js(`__czfase('presion')`);
  await sleep(4500);
  d = await C();
  if (d.z >= d.pz) bad(`no llego a tomarte la COLA (z ${d.z} contra tu ${d.pz})`);
  else ok(`te cruzo y quedo en tu COLA: z ${d.z} contra tu z ${d.pz}`);
  await shot('h1_a_presion');

  // ---------- 2. H1 — EL TELL AHORA ES EL AVION MISMO ----------
  // Ya no hay trazadoras de aviso: el tell es que lo VES entrar de frente y crecer. Se mide que en
  // el arranque este LEJOS y encarandote — que es lo que lo hace un aviso y no una emboscada.
  console.log('\n2. H1 — el aviso ES el avion: entra de frente por el horizonte:');
  await js('__czfin()');
  await js('__czstart({ mudo: 1, manso: 1 })');
  await sleep(200);
  d = await C();
  if (!d) bad('no se armo el duelo');
  else if (!(d.z > 200 && d.frente)) bad(`no entra de frente y lejos (z ${d.z}, frente ${d.frente})`);
  else ok(`ENTRA POR EL HORIZONTE y encarandote: z ${d.z}, de frente`);
  await shot('h1_b_entrada');

  // ---------- 3. LA SOLUCION DE TIRO MADURA CON EL RUMBO PREDECIBLE ----------
  // H1 no cobra nada todavia (los dientes son H2), pero el numero YA se mide: es lo que va a
  // decidir si la regla del ras enseña algo. Sin medirlo desde ahora, H2 arranca a ciegas.
  console.log('\n3. la solucion de tiro ya se MIDE (todavia no cobra — eso es H2):');
  await js(`__czfase('presion')`);
  // DESDE CERO. La solucion se resetea sola al llegar a 1 (ahi es cuando dispara), asi que una
  // medicion tomada en cualquier punto puede caer justo encima de ese salto y leer que "bajo".
  await js('__czsol(0)');
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
  // EL UMBRAL ES 15 Y NO 20, y el motivo esta medido: el pase entra por un costado SORTEADO
  // (C.lado), asi que segun de que lado venga y donde este el avion en su carril, el mismo pase
  // tapa entre 19% y 24% del cuadro. Es la varianza del juego, no del test. Lo que si es firme es
  // la escala: el vuelo normal de este pasillo no pasa del 8%, o sea que 15 sigue siendo el DOBLE
  // de cualquier cosa que ocurra sin un avion encima.
  if (mov < 15) bad(`el cruce cercano no mueve pantalla (${mov}% de pixeles): tiene que ser un GOLPE`);
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
  // pasa. Ahora el ciclo es INFINITO (no se va solo), asi que se lo deja 30 s y se mira que fases
  // toco — tiene que llegar a recola (la vuelta) ademas de las cuatro de siempre.
  console.log('\n7. el ciclo del §3 corre SOLO y se encadena:');
  await js('__czfin()');
  await js('__czstart({ manso: 1 })');
  const visto = [];
  for (let i = 0; i < 120; i++) {
    const s = await C();
    if (s && visto[visto.length - 1] !== s.fase) visto.push(s.fase);
    // el ciclo ya no termina solo: cortamos cuando vimos todas las fases
    if (visto.includes('recola') && visto.length >= 5) break;
    await sleep(250);
  }
  console.log('      recorrido: ' + visto.join(' → '));
  for (const f of ['aviso', 'presion', 'sobrepaso', 'ventana']) {
    if (visto.includes(f)) ok(`paso por la fase ${f}`);
    else bad(`nunca llego a la fase ${f}`);
  }

  // ---------- 8. MULTIPLES HARRIERS SE ACUMULAN ----------
  console.log('\n8. la flota se acumula:');
  await js('__czfin()');
  await js('__czstart({ manso: 1 })');
  await js('__czstart({ manso: 1 })');
  const n8 = await js('JSON.parse(__czdbg()).n');
  if (n8 >= 2) ok(`se armaron ${n8} Harriers simultaneos: la flota se acumula`);
  else bad(`solo hay ${n8} Harrier: start() deberia poder apilar varios`);

  // ---------- 9. H2 — LA SOLUCION DE TIRO, LAS TRES REGLAS ----------
  // Es el criterio de cierre textual de H2: "recto te alcanza; quebrando sobrevivis; a ras casi no
  // progresa". Las tres se miden con el MISMO numero (sol) y por eso se pueden comparar entre si.
  console.log('\n9. H2 — la solucion de tiro: las tres reglas del §2 hechas numero:');
  // (a) RECTO Y ALTO: madura. La sonda pone el avion arriba de la banda del ras y lo deja quieto.
  // MANSO: esta seccion mide el MODELO de la solucion, no lo que cobra. Si tirara de verdad, la
  // medicion de "recto y alto madura" terminaria en la pantalla de derribado — que es justamente
  // lo que la seccion 10 va a probar aparte, y con el modelo de averias puesto.
  await js('__czfin()');
  await js('__czstart({ mudo: 1, manso: 1 })');
  await js(`__czfase('presion')`);
  await js('__czalto(30)');
  await js('__czsol(0)');
  await sleep(120);
  const a0 = (await C()).sol;
  await sleep(1500);
  const a1 = (await C()).sol;
  const recto = a1 - a0;
  if (recto <= 0.05) bad(`recto y alto la solucion no madura (${a0} → ${a1}): asi nunca te alcanza`);
  else ok(`RECTO Y ALTO madura: ${a0} → ${a1} (+${recto.toFixed(2)} en 1,5 s)`);

  // (b) A RAS: el mismo vuelo, misma duracion, abajo de CAZA_RAS_ALT. Tiene que costarle MUCHO mas.
  await js(`__czfase('presion')`);
  await js('__czalto(2)');
  await js('__czsol(0)');
  await sleep(120);
  const r0 = (await C()).sol;
  await sleep(1500);
  const r1 = (await C()).sol;
  const ras = r1 - r0;
  // el factor del sistema es 0,12; se pide < 0,4 del progreso alto para tolerar el jitter del reloj
  if (!(ras < recto * 0.4)) bad(`a ras progresa casi igual que alto (${ras.toFixed(2)} vs ${recto.toFixed(2)}): la tesis del juego no se cumple`);
  else ok(`A RAS casi no progresa: +${ras.toFixed(2)} contra +${recto.toFixed(2)} arriba — la banda del x10 te tapa`);

  // (c) QUEBRANDO: un quiebre le BORRA lo que llevaba. Se sacude el avion desde la sonda.
  await js(`__czfase('presion')`);
  await js('__czalto(30)');
  await js('__czsol(0)');
  await sleep(1600);
  const q0 = (await C()).sol;
  await js('__czquiebre()');
  await sleep(430);   // el quiebre dura 350 ms: hay que dejarlo terminar antes de leer
  const q1 = (await C()).sol;
  if (!(q1 < q0)) bad(`quebrando la solucion no baja (${q0} → ${q1}): la maniobra no salva`);
  else ok(`QUEBRANDO se la borras: ${q0} → ${q1}`);

  // ---------- 10. EL HARRIER NO TE DISPARA ----------
  // La regla dura del sistema, y la razon de que exista este test: el Harrier NO ataca, en ninguna
  // fase. Antes te mataba desde lejos en el acercamiento y te morias sin haber llegado a verlo.
  // Se lo deja correr un ciclo ENTERO (entrada de frente, cruce, sobrepaso, ventana, recola) con la
  // altura y el rumbo clavados, y la integridad no se tiene que mover un punto.
  //
  // SI ALGUN DIA VUELVE A TENER DIENTES, este es el test que hay que reescribir a mano — a
  // proposito. No es un detalle de tuneo: es la decision de diseño, y tiene que doler cambiarla.
  console.log('\n10. el Harrier NO te dispara: un ciclo entero sin tocarte:');
  await js('__czfin()');
  await js(`__czmodo('integ')`);
  await js('__czalto(30)');
  await js('__czstart({ mudo: 1 })');
  const n0 = await js('__czinteg()');
  const ciclo = [];
  for (let i = 0; i < 60; i++) {
    const s = await C();
    if (s && ciclo[ciclo.length - 1] !== s.fase) ciclo.push(s.fase);
    if (ciclo.includes('recola')) break;
    await sleep(400);
  }
  const n1 = await js('__czinteg()');
  await js('__czfin()');
  console.log('      recorrido: ' + ciclo.join(' → '));
  if (!ciclo.includes('recola')) bad(`el ciclo no llego a recola (${ciclo.join(' → ')}): no se midio nada`);
  else if (n1 < n0) bad(`te saco integridad durante el ciclo (${n0} → ${n1}): el Harrier NO tiene que disparar`);
  else ok(`CICLO ENTERO SIN UN RASGUÑO: integridad ${n0} → ${n1}`);
  await shot('h2_a_sin_fuego');
  await js(`__czmodo('squad')`);
  await js('__czalto(null)');

  // ---------- 10a. LA VELOCIDAD DE CIERRE ES RELATIVA ----------
  // La regla del pasillo: nada se mueve a una velocidad de animacion, todo se mueve CONTRA la
  // tuya (collision.js ya la respetaba con los jets de frente, `run.spd + 45`). El Harrier era el
  // unico que entraba con un lerp a tasa fija — apretabas el turbo y el merge duraba lo mismo.
  //
  // Se mide con el mismo Harrier a dos velocidades clavadas: el que vuela mas rapido tiene que
  // haberlo tenido MAS CERCA al mismo segundo. Si los dos numeros dan parecido, la velocidad de
  // cierre volvio a ser absoluta y este item se perdio.
  console.log('\n10a. la velocidad de cierre es RELATIVA a la tuya:');
  await js('__czfin()');
  await js('__czalto(34)');
  await js('__czspd(60)');
  await js('__czstart({ mudo: 1 })');
  await sleep(1000);
  const zLento = (await C()).z;
  await js('__czfin()');
  await js('__czspd(180)');
  await js('__czstart({ mudo: 1 })');
  await sleep(1000);
  const zRapido = (await C()).z;
  await js('__czfin()');
  await js('__czspd(null)');
  await js('__czalto(null)');
  if (!(zRapido < zLento - 60)) {
    bad(`a 180 no cierra mas rapido que a 60 (z ${zLento} contra ${zRapido}): el merge no mira tu velocidad`);
  } else {
    ok(`A MAS GAS, ANTES TE LO SACAS: al segundo, a 60 esta en z ${zLento} y a 180 en z ${zRapido}`);
  }

  // ---------- 10b. DE QUE LADO SE LO VE ----------
  // La regla del sprite en una linea: de frente mientras VIENE, de cola desde el sobrepaso hasta
  // el horizonte. Es lo que se veia mal — el caza se daba vuelta justo antes de desaparecer.
  console.log('\n10b. de que lado se lo ve, fase por fase:');
  await js('__czfin()');
  await js('__czstart({ mudo: 1, manso: 1 })');
  for (const [f, esperado] of [['aviso', true], ['presion', true],
    ['sobrepaso', false], ['ventana', false], ['recola', false], ['salida', false]]) {
    await js(`__czfase('${f}')`);
    await sleep(120);
    const s = await C();
    const vis = esperado ? 'DE FRENTE' : 'DE COLA';
    if (!s) bad(`${f}: el duelo se corto`);
    else if (s.frente !== esperado) bad(`${f}: se lo ve ${s.frente ? 'DE FRENTE' : 'DE COLA'} y tenia que ser ${vis}`);
    else ok(`${f}: ${vis}`);
    await shot('lado_' + f);
  }
  await js('__czfin()');

  // ---------- 11. H3 — EL CONTRAATAQUE ----------
  // La ventana frontal es tu turno: se le tira desde la sonda y tiene que acumular impactos,
  // AHUYENTARSE a los 6 y recien a los 18 caer. Que las dos cifras esten tan separadas ES el §2.
  console.log('\n11. H3 — el contraataque: ahuyentar es lo normal, derribar es la hazaña:');
  await js('__czfin()');
  await js('__czstart({ mudo: 1 })');
  await js(`__czfase('ventana')`);
  // el duelo solo AVANZA en el estado 'play': si la seccion anterior dejo la partida en un relevo,
  // el caza se queda clavado en z 6 y no hay ventana frontal a la que tirarle. Se le da aire.
  await sleep(700);
  const hp0 = (await C()).hp;
  await js('__czpegar(4)');
  await sleep(200);
  let d11 = await C();
  if (!d11 || d11.hp !== hp0 + 4) bad(`4 impactos no se contaron (hp ${hp0} → ${d11 && d11.hp})`);
  else ok(`le pegas y se cuenta: hp ${hp0} → ${d11.hp} (todavia entero: ahuyenta a 6)`);
  await js('__czpegar(2)');
  await sleep(250);
  d11 = await C();
  if (!d11 || !d11.humo) bad('a 6 impactos no se ahuyento');
  else ok(`a ${d11.hp} impactos ROMPE EL ATAQUE: humo ${d11.humo} · fase ${d11.fase} (se va, no muere)`);
  await shot('h3_a_ahuyentado');
  // y ahora la hazaña: se le sigue pegando MIENTRAS huye, hasta los 18
  await js('__czpegar(12)');
  await sleep(300);
  d11 = await C();
  if (d11) bad(`a 18 impactos sigue vivo (hp ${d11.hp}): el derribo no cierra el duelo`);
  else ok('a 18 impactos LO BAJASTE: el duelo termina en una bola de fuego, no en una salida');

  // ---------- 12. H3 — LAS PIRUETAS DE ESQUIVE FUERZAN EL SOBREPASO ----------
  console.log('\n12. H3 — el combo corta la presion (§3 paso 3):');
  for (const mv of ['breakt', 'jink', 'sturn']) {
    await js('__czfin()');
    await js('__czstart({ mudo: 1, manso: 1 })');
    await js(`__czfase('presion')`);
    await sleep(200);
    await js(`__czmv('${mv}')`);
    await sleep(200);
    const s12 = await C();
    if (!s12 || s12.fase !== 'sobrepaso') bad(`${mv} no forzo el sobrepaso (quedo en ${s12 && s12.fase})`);
    else ok(`${mv} lo obliga a pasarse de largo: fase ${s12.fase}`);
    await js('__czfin()');
  }
  // y una que NO es de esquive no lo fuerza: el efecto es de las tres, no de "hacer algo"
  await js('__czfin()');
  await js('__czstart({ mudo: 1, manso: 1 })');
  await js(`__czfase('presion')`);
  await sleep(200);
  await js(`__czmv('loyo')`);
  await sleep(200);
  const s12b = await C();
  if (s12b && s12b.fase === 'sobrepaso') bad('cualquier pirueta fuerza el sobrepaso: tienen que ser solo las de esquive');
  else ok(`una pirueta que no es de esquive (LOW YO-YO) no lo fuerza: sigue en ${s12b && s12b.fase}`);
  await js('__czfin()');

  // ---------- 13. H4 — EL REGLAMENTO: DONDE NO APARECE ----------
  // Las puertas del director. Se prueban PURAS (sin volar): la funcion recibe su contexto y la
  // respuesta correcta a cada una es "no armes nada".
  console.log('\n13. H4 — el reglamento: las puertas del director:');
  const puertas = [
    ['intensidad 0 (m1: el tutorial no se pelea)', '{ intensidad: 0, dist: 9000, meta: 0, ciego: false, jets: 99 }'],
    ['los primeros metros (nadie te embosca en el despegue)', '{ intensidad: 2, dist: 50, meta: 0, ciego: false, jets: 99 }'],
    ['el tramo final antes del objetivo (es del climax)', '{ intensidad: 2, dist: 2900, meta: 3000, ciego: false, jets: 99 }'],
    ['adentro del banco de niebla (a ciegas no es dificil, es una moneda)', '{ intensidad: 2, dist: 9000, meta: 0, ciego: true, jets: 99 }'],
  ];
  for (const [nombre, ctx] of puertas) {
    await js('__czfin()');
    const armo = await js(`__czdir(${ctx}, 400)`);
    if (armo) bad(`el duelo aparecio con ${nombre}`);
    else ok(`NO aparece con ${nombre}`);
  }
  // y con todo en verde, SI aparece — si no, las puertas de arriba no probarian nada
  await js('__czfin()');
  const armoOk = await js(`__czdir({ intensidad: 1, dist: 9000, meta: 0, ciego: false, jets: 99 }, 400)`);
  if (!armoOk) bad('con todas las condiciones dadas el director NO arma ningun duelo: las puertas de arriba no prueban nada');
  else ok('con el pasillo abierto y la mision en intensidad 1, SI aparece');
  // Y QUE APAREZCA TEMPRANO, que es el motivo de haber abierto las puertas: con las viejas (420 m
  // de vuelo y 3 jets vistos) el duelo casi nunca llegaba a armarse — te morias antes y el Harrier
  // era contenido que nadie veia. Este contexto es el de un pasillo real al minuto de vuelo.
  await js('__czfin()');
  const temprano = await js(`__czdir({ intensidad: 1, dist: 250, meta: 12000, ciego: false, jets: 1 }, 400)`);
  if (!temprano) bad('con 250 m y UN jet visto todavia no arranca: el duelo sigue llegando tarde');
  else ok('con 250 m recorridos y UN jet visto YA aparece: el duelo llega a jugarse');
  // el techo por mision: en campaña (meta finita) la intensidad ES cuantos duelos hay
  await js('__czfin()');
  const techo = await js(`__czdirN({ intensidad: 1, dist: 9000, meta: 12000, ciego: false, jets: 99 }, 6)`);
  if (techo !== 1) bad(`en campaña con intensidad 1 se armaron ${techo} duelos: el techo por mision es la intensidad`);
  else ok('en campaña el techo de duelos ES la intensidad: intensidad 1 → un solo duelo por mision');
  await js('__czfin()');

  clearInterval(gas);
  console.log('\nconsola: ' + (errors.length ? errors.length + ' error(es)\n  ' + errors.join('\n  ') : 'sin errores'));
  if (errors.length) fails += errors.length;
  console.log('\nFIXTURE COLA: ' + (fails ? `FALLA (${fails})` : 'OK') + '\n');
  app.exit(fails ? 1 : 0);
});
