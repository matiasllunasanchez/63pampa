// FIXTURE DE ACEPTACION de la PERSECUCION (PLAN_HARRIERS_PERSECUCION, PLAN B), corrido en el
// juego real.
//   npm run persec                    · PURS_SHOTS=/tmp/x npm run persec   (deja capturas)
//
// Fuera de `npm run check` por lo de siempre: son segundos de VUELO de verdad, y lo que prueba no
// es una formula sino que el modo entero funcione adentro del juego.
//
// ESTADO: N0 (el lider), N1 (la cinta y la banda), N2 (el modo infinito) y N3 (el dato de
// mision) cubiertos. N4 queda anotado en el plan y sin construir, como pide el §4.
//
// LOS DOS CRITERIOS DE CIERRE DEL §4, y estan en las secciones 2 y 5:
//   N0 — "el lider vuela solo un nivel entero, esquivando, creible". Se lo deja volar con el
//        pasillo SEMBRANDO de verdad y se cuenta cuantas veces estuvo a punto de comerse algo.
//   N1 — "mantenerse en banda es un minijuego de gas, tenso y justo". Eso no lo puede afirmar una
//        asercion, asi que lo que se prueba es que las tres consecuencias existan y sean JUSTAS:
//        que la banda pague, que la gracia avise antes de cobrar, y que el choque sea un choque.
//        Lo de "tenso" se mira en la captura, como siempre en este repo.
const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const ROOT = path.join(__dirname, '..');
const OUT = process.env.PURS_SHOTS || '';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const errors = [];
let win, fails = 0;
const bad = m => { console.error('   ✗ ' + m); fails++; };
const ok = m => console.log('   ✓ ' + m);
// TODA LLAMADA A LA PAGINA CON TIMEOUT. Un fixture que se cuelga es peor que uno que falla: no
// dice nada y hay que matarlo a mano. Si la pagina no contesta en 4 s, se devuelve null y la
// seccion falla con un mensaje — que es informacion, a diferencia de un proceso colgado.
const js = s => Promise.race([
  win.webContents.executeJavaScript(s),
  new Promise(r => setTimeout(() => r(null), 4000)),
]);
async function tap(keyCode) {
  win.webContents.sendInputEvent({ type: 'keyDown', keyCode });
  await sleep(90);
  win.webContents.sendInputEvent({ type: 'keyUp', keyCode });
  await sleep(160);
}
const L = async () => JSON.parse(await js('String(window.__psdbg && window.__psdbg())') || 'null');
/** El lider, REARMANDOLO si no esta. Las secciones de N1 prueban justamente las formas de perderlo,
 *  asi que la siguiente arranca sin lider y sin esto cada seccion mediria el hueco que dejo la
 *  anterior. Espera a que la partida vuelva a 'play' (el relevo dura unos segundos). */
async function Lsure() {
  for (let i = 0; i < 30; i++) {
    if (!(await L())) await js('__psstart()');
    // NO ALCANZA CON QUE EL LIDER EXISTA: hay que esperar a que el MUNDO CORRA. `startPersec` crea
    // el objeto en cualquier estado, pero durante un relevo (los tres segundos que siguen a
    // perderlo o chocarlo, que es justo lo que prueban las secciones de arriba) `persecSystem` no
    // se llama — y entonces la seccion siguiente mide un lider congelado y falla por una razon que
    // no tiene nada que ver con lo que quiso probar. Esto ya pasó una vez: la banda "no se
    // apretaba" y el sistema estaba bien; lo que no corria era el juego.
    const a = await L();
    await sleep(350);
    const b = await L();
    if (a && b && b.t > a.t) return b;
  }
  return await L();
}
async function shot(n) {
  if (!OUT) return;
  fs.writeFileSync(path.join(OUT, n + '.png'), (await win.webContents.capturePage()).toPNG());
}

// EL VIGILANTE DEL LIDER. Corre adentro del rAF del juego (misma leccion que el SAMPLER de LA
// COLA: muestrear desde el proceso principal mide al scheduler, no al juego) y anota, cuadro a
// cuadro, la distancia MINIMA del lider a cualquier obstaculo solido. Es como se prueba "el lider
// nunca choca" sin tener que mirar veinte minutos de vuelo.
const VIGIA = `(() => {
  window.__pscerca = 999;
  window.__psroces = 0;
  const loop = () => {
    const l = window.__psdbg && JSON.parse(String(window.__psdbg()) || 'null');
    const obs = window.__psobs && window.__psobs();
    if (l && obs) {
      for (const o of obs) {
        if (Math.abs(o.z - l.z) > 5) continue;
        const d = Math.hypot(o.x - l.x, (o.y === null ? l.y : o.y) - l.y);
        if (d < window.__pscerca) window.__pscerca = d;
        if (d < 4) window.__psroces++;
      }
    }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
  return 'ok';
})()`;

app.whenReady().then(async () => {
  console.log('\nFIXTURE — PERSECUCION (N0-N3)\n');
  win = new BrowserWindow({ width: 1280, height: 760, show: false, webPreferences: { backgroundThrottling: false } });
  win.webContents.on('console-message', (e, l, m) => { if (l >= 3 && !m.includes('Security Warning')) errors.push(m.slice(0, 300)); });
  win.webContents.on('render-process-gone', (e, d) => errors.push('EL RENDERER MURIO: ' + JSON.stringify(d)));

  // ---------- 1. N0 — EL LIDER EXISTE Y VUELA ADELANTE ----------
  console.log('1. N0 — el lider: esta ADELANTE tuyo y a la distancia de arranque:');
  await win.loadURL('file://' + path.join(ROOT, 'src', 'index.html') + '?qa&persec');
  await sleep(2500);
  await tap('Return'); await tap('Down'); await tap('Return');
  await tap('Down'); await tap('Return'); await tap('Return');
  await sleep(1200);
  // VUELO NIVELADO por sonda en vez de tecla sostenida. La unica tecla que evita caerse al mar es
  // W, que es CABECEO: el avion trepa, trepar cuesta velocidad, y el lider se le escapa por un
  // motivo que no tiene nada que ver con lo que se esta midiendo. Medido: con W sostenida el lider
  // quedaba a 238 unidades a los 14 s, o sea mas alla del horizonte de siembra.
  await js('__psnivel(8)');
  await sleep(2500);
  let d = await L();
  if (!d) { console.error('   ✗ ?persec no arranco la persecucion'); app.exit(1); return; }
  ok(`el lider ${d.nombre} vuela adelante: z ${d.z} contra tu z 14 · distancia ${d.d}`);
  if (d.d < d.lo || d.d > d.hi) bad(`arranca FUERA de banda (${d.d} contra [${d.lo}, ${d.hi}])`);
  else ok(`arranca EN BANDA: ${d.d} dentro de [${d.lo}, ${d.hi}] — la primera decision es tuya`);
  await shot('n0_a_lider');

  // ---------- 2. N0 — EL CRITERIO: VUELA UN TRAMO ENTERO SIN CHOCAR ----------
  // Con el pasillo sembrando de verdad. Es el criterio literal del §4 y no se puede probar de otra
  // forma que dejandolo volar: cualquier atajo estaria probando el atajo.
  console.log('\n2. N0 — el criterio del §4: vuela un tramo entero SIN chocar (sembrando de verdad):');
  await js(VIGIA);
  await sleep(14000);
  const cerca = await js('window.__pscerca');
  const roces = await js('window.__psroces');
  if (cerca === null || roces === null) bad('la pagina no contesto: el vigilante se colgo o el renderer murio');
  d = await L();
  if (!d) bad('el lider desaparecio en el camino');
  else ok(`sigue volando tras 14 s de pasillo sembrado · distancia ${d.d} · carril ${d.x}`);
  if (roces > 0) bad(`el lider paso a menos de 4 unidades de un obstaculo ${roces} veces: TIENE que esquivar`);
  else ok(`nunca se acerco a menos de 4 unidades de nada (lo mas cerca: ${cerca.toFixed(1)})`);
  await shot('n0_b_esquivando');

  // ---------- 3. N0 — EL SEMBRADOR CONOCE SU LINEA ----------
  // La otra mitad de la garantia. Se prueba PURO: se le pide al sembrador mil carriles con el lider
  // puesto en el medio del pasillo y ninguno puede caer adentro de su corredor.
  console.log('\n3. N0 — el sembrador CONOCE su linea (§4: nada de lo que siembra la cruza):');
  const inv = await js('__pscarril(200)');
  if (inv > 0) bad(`${inv} de 200 carriles cayeron adentro del corredor reservado del lider`);
  else ok('200 carriles sorteados y ninguno cae adentro del corredor del lider');

  // ---------- 4. N1 — LA BANDA PAGA ----------
  console.log('\n4. N1 — estar en banda PAGA (tiempo en banda x multiplicador de altura):');
  let l4 = await Lsure();
  if (!l4) bad('no hay lider para medir el puntaje');
  else {
    await js(`__psdist(${l4.lo + 20})`);
    await sleep(200);
    const p0 = await js('__psscore()');
    await sleep(1500);
    const p1 = await js('__psscore()');
    // se vuelve a leer el lider: si murio en el medio, el puntaje se reinicio y la medicion no vale
    const l4b = await L();
    if (!l4b) bad('el lider se perdio durante la medicion de puntaje');
    else if (!(p1 > p0)) bad(`en banda no suma puntaje (${p0} → ${p1})`);
    else ok(`en banda suma: ${p0} → ${p1} en 1,5 s · segundos en banda ${l4b.segs}`);
  }

  // ---------- 5. N1 — LA GRACIA AVISA ANTES DE COBRAR ----------
  // Es la mitad de "justo": salir de banda no te mata, te AVISA. Se lo saca de banda de golpe y se
  // mira que el reloj de gracia corra y que el aviso salga por radio.
  console.log('\n5. N1 — la gracia: fuera de banda AVISA, y recien despues cobra:');
  const l5 = await Lsure();
  if (!l5) { bad('no hay lider para probar la gracia'); }
  await js(`__psdist(${(l5 || { hi: 140 }).hi + 60})`);
  await sleep(1200);
  d = await L();
  if (d && d.dentro) bad('se lo puso lejos y sigue leyendose en banda');
  else if (!d) bad('salir de banda mato al toque: la gracia no existe');
  else ok(`fuera de banda y VIVO: gracia gastada ${d.fuera} de ${d.gracia} s`);
  await shot('n1_a_fuera');
  // …y al volver, se recupera (mas lento de lo que se gasta, pero se recupera)
  const lf = await L();
  const f0 = lf ? lf.fuera : 0;
  await js(`__psdist(${(lf || { lo: 60 }).lo + 20})`);
  await sleep(1200);
  d = await L();
  if (!d || !(d.fuera < f0)) bad(`volver a banda no recupera la gracia (${f0} → ${d && d.fuera})`);
  else ok(`volver a banda la recupera: ${f0} → ${d.fuera} s gastados`);

  // ---------- 6. N1 — SE LO PUEDE PERDER ----------
  console.log('\n6. N1 — y si no volves, lo perdes:');
  const l6 = await Lsure();
  await js(`__psdist(${(l6 || { hi: 140 }).hi + 90})`);
  await sleep(6000);
  d = await L();
  if (d) bad(`tras 6 s fuera de banda (gracia ${d.gracia} s) el lider sigue ahi: la gracia no cobra`);
  else ok('se acabo la gracia y lo perdiste: el modo tiene derrota, y avisada');

  // ---------- 7. N1 — Y SI TE LE VAS ENCIMA, LO CHOCAS ----------
  console.log('\n7. N1 — es un avion, no un aura:');
  await Lsure();                // el relevo de la seccion 6 devuelve el control y se rearma
  await js('__psdist(3)');
  await sleep(500);
  d = await L();
  if (d) bad(`se le paso por encima (d 3) y no paso nada: chocar al lider tiene que matar`);
  else ok('pasarle por encima al lider es un choque como cualquier otro del juego');

  // ---------- 8. N2 — EL MODO INFINITO: LA BANDA SE APRIETA Y EL LIDER SE RELEVA ----------
  // Los dos se prueban PUROS: se le mueve la distancia recorrida y se mira que los escalones caigan
  // donde tienen que caer. Volar 900 m de verdad por cada escalon son minutos por asercion.
  console.log('\n8. N2 — el modo infinito: la banda se APRIETA con la distancia:');
  await Lsure();
  await js('__psinf(1)');
  const b0 = await L();
  ok(`banda de arranque: [${b0.lo}, ${b0.hi}]`);
  await js('__psdist(' + (b0.lo + 20) + ')');
  await js('__psrec(3000)');           // tres escalones y medio de PURS_TIGHT_D
  await sleep(300);
  const b1 = await L();
  if (!b1) bad('el lider se perdio al apretar la banda');
  else if (!(b1.hi < b0.hi && b1.lo < b0.lo)) bad(`la banda no se apreto (${b0.lo}-${b0.hi} → ${b1.lo}-${b1.hi})`);
  else ok(`tras 3000 m la banda se cerro: [${b0.lo}, ${b0.hi}] → [${b1.lo}, ${b1.hi}]`);
  // …pero tiene PISO: apretar sin fondo deja de ser un minijuego de gas y pasa a ser cuerda floja
  await js('__psrec(60000)');
  await sleep(300);
  const b2 = await L();
  if (!b2) bad('el lider se perdio al llegar al piso de la banda');
  else if (b2.lo < 45 - 0.01 || b2.hi < 90 - 0.01) bad(`la banda perforo el piso: [${b2.lo}, ${b2.hi}]`);
  else ok(`el apretado tiene PISO: a 60000 m queda en [${b2.lo}, ${b2.hi}] y no baja mas`);
  await shot('n2_a_apretada');

  console.log('\n9. N2 — y el lider se RELEVA (en un modo infinito, la radio es lo unico que marca que paso algo):');
  const n0 = (await L()).nombre;
  await js('__psrec(70000)');
  await sleep(300);
  const n1 = (await L()).nombre;
  if (n1 === n0) bad(`el lider nunca se relevo (sigue siendo ${n0})`);
  else ok(`el lider cambio: ${n0} → ${n1}`);

  // ---------- 10. N3 — LA CAMPAÑA: ES DATO DE MISION, Y NO APRIETA ----------
  console.log('\n10. N3 — en campaña es DATO de mision y la banda NO se aprieta:');
  await js('__psfin()');
  await js('__psstart({})');           // sin `infinito`: asi lo arma la campaña
  await sleep(200);
  const c0 = await L();
  await js('__psrec(9000)');
  await sleep(300);
  const c1 = await L();
  if (!c0 || !c1) bad('no hay lider para probar el modo campaña');
  else if (c1.hi !== c0.hi || c1.lo !== c0.lo) bad(`en campaña la banda se apreto sola: [${c0.lo}, ${c0.hi}] → [${c1.lo}, ${c1.hi}]`);
  else ok(`en campaña la banda queda fija en [${c1.lo}, ${c1.hi}] tras 9000 m — el tramo tiene largo escrito`);
  if (c1 && c1.nombre !== c0.nombre) bad('en campaña el lider se relevo solo: el guion decide quien vuela adelante');
  else ok(`y el lider no rota solo: sigue siendo ${c1 && c1.nombre}`);

  console.log('\nconsola: ' + (errors.length ? errors.length + ' error(es)\n  ' + errors.join('\n  ') : 'sin errores'));
  if (errors.length) fails += errors.length;
  console.log('\nFIXTURE PERSECUCION: ' + (fails ? `FALLA (${fails})` : 'OK') + '\n');
  app.exit(fails ? 1 : 0);
});
