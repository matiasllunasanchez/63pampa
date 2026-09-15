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

/** UN TOKEN GARANTIZADO DISTINTO del que la prueba espera. Antes se usaba 'R' fijo, apostando a
 *  que nunca fuera el esperado — y 'R' SI aparece en la secuencia (el tirabuzon, `dRR`), asi que
 *  el "error" podia ser un acierto y la seccion medir cualquier cosa. */
const otroQue = e => ['l', 'r', 'u', 'd', 'Z'].find(k => k !== e);

/** Teclea la secuencia ENTERA leyendo lo esperado de la sonda. `zona` elige carril al empezar.
 *  `err` inyecta UN token equivocado DESPUES de elegir blanco.
 *
 *  DESPUES Y NO ANTES (14/9): mientras se elige, una tecla que no corresponde a ninguna zona se
 *  IGNORA — no es un error, porque la prueba todavia no empezo. Inyectandolo antes, como hacia
 *  este harness, el error se perdia y la secuencia salia limpia. */
async function tocar({ zona, err } = {}) {
  let d = await Q();
  if (d && d.zi < 0 && zona) {
    // elegir carril = teclear su primer token. Se busca cual de los carriles es la zona pedida.
    const i = d.carriles.findIndex(c => c.startsWith(zona + ':'));
    if (i >= 0) await tap(d.esperado[i]);
  }
  for (let k = 0; k < 30; k++) {
    d = await Q();
    if (!d || d.fase !== 'prueba') return d;
    const e = d.zi < 0 ? d.esperado[0] : d.esperado;
    if (!e) return d;
    if (err && d.zi >= 0) { await tap(otroQue(e)); err = false; continue; }
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
  // SIN ELECCION DE BLANCO (14/9): la combinacion arranca sola. Antes esta seccion medía que las
  // tres zonas se ofrecieran y que cada una arrancara con una tecla distinta; esa pantalla ya no
  // existe — «es matarlo o no matarlo».
  if (d.zi < 0) bad('la prueba tendria que arrancar con la secuencia ya corriendo, sin elegir blanco');
  else ok(`arranca directo en la secuencia · zona ${d.zona} · ${d.carriles[d.zi]}`);
  if (typeof d.esperado === 'string' && d.esperado.length === 1)
    ok(`y pide UNA tecla, la del centro de la cinta: ${d.esperado} (${d.glifo})`);
  else bad(`lo esperado no es una sola tecla: ${d.esperado}`);
  // LAS CAPTURAS, en dos pasos: primero se CUELGA el margen (sacar la foto tarda mas que la
  // ventana de la prueba) y despues se espera medio segundo — en una ventana oculta el compositor
  // devuelve el ultimo cuadro que pinto, y sin esa espera la foto sale con el cuadro anterior.
  await js('__qhold()'); await sleep(500); await shot('q2_blancos');

  // LA EQUIVALENCIA DE LA FLECHA (14/9). Con la mira en su modo normal las flechas del teclado son
  // el stick DERECHO, asi que ↑ manda 'U' donde la secuencia pide 'u'. Antes eso era un error —y
  // con UN_ERROR_PIERDE, la mision. Es EL bug que hizo que el modo no se pudiera probar.
  {
    const esp = d.esperado, otro = { u: 'U', d: 'D', l: 'L', r: 'R' }[esp];
    if (!otro) ok(`(la primera tecla es ${esp}: no tiene equivalente de flecha que probar)`);
    else {
      await tap(otro);
      const dd = await Q();
      if (dd.fase === 'prueba' && dd.ti !== d.ti) ok(`la flecha vale por la tecla: se pidio "${esp}" y "${otro}" la tomo`);
      else bad(`la flecha "${otro}" no vale por "${esp}": la fase quedo en ${dd.fase}`);
    }
  }

  // ---------- 2. LA PERFECTA GANA ----------
  console.log('\n2. la secuencia perfecta gana la mision:');
  // se RE-ENTRA antes de teclear: el margen del compas corre desde que la prueba arranca, y los
  // segundos que tardo la seccion 1 en leer las sondas ya se lo habrian comido (que es, dicho sea
  // de paso, la prueba de que el reloj corre en tiempo de pared aunque el mundo este detenido)
  await cfg({});
  // se elige el POLVORIN a mano (la zona brava: la secuencia mas larga) y se saca la foto con la
  // autopista ya elegida y el cursor a medio camino — que es la imagen del modo
  // la foto de LA CINTA, con una tecla ya acertada y el cursor a medio camino: es la imagen del modo
  {
    const dd = await Q();
    await tap(dd.esperado); await js('__qhold()'); await sleep(500); await shot('q2_cinta');
  }
  d = await tocar({});
  // la prueba salida desemboca DIRECTO en la cinematica del premio (Q3): no hay pantalla de
  // "bien hecho" en el medio — se gana volando la pirueta que se tecleo
  if (!d || d.fase !== 'cine') { bad(`tecleando limpio la fase quedo en ${d && d.fase}`); }
  else ok(`secuencia limpia → premio · zona ${d.premio.zona} · ${d.premio.pts} puntos · sin errores (${d.errs})`);
  await shot('q2_exito');
  // la espera es GENEROSA: el premio corre en camara lenta (`ritmo`), asi que sus ~6 s de pelicula
  // son ~9 de reloj de pared. Con el margen justo, bajar el ritmo tumbaba esta seccion sola.
  for (let k = 0; k < 110 && (await Q()); k++) await sleep(150);
  const st = await js('String(window.__qdbg())');
  if (JSON.parse(st).state !== 'results') bad(`tras el exito el juego quedo en ${JSON.parse(st).state}, no en results`);
  else ok('el exito cierra la mision por el embudo de siempre (results)');

  // ---------- 3. UN ERROR Y SE ACABO (pedido del 14/9/2026) ----------
  // Reemplaza a la vieja seccion del PERDON. Desde `PULSO.UN_ERROR_PIERDE` la prueba no perdona
  // nada en ningun nivel: la tecla errada se pone ROJA, la secuencia termina ahi y la mision se
  // pierde. El perdon por nivel y los tres intentos siguen escritos detras de la perilla.
  console.log('\n3. un error y se acabo:');
  await win.loadURL('file://' + path.join(ROOT, 'src', 'index.html') + '?pulso=3');
  await sleep(2500);
  d = await cfg({ t01: 0 });
  d = await tocar({ zona: 'bridge', err: true });
  await shot('q2_error');
  if (d && d.fase === 'rojo') ok('un error deja la tecla en ROJO y corta la secuencia, hasta en el primer nivel');
  else bad(`tras errar una tecla la fase quedo en ${d && d.fase}`);
  // …y de ahi se cae a la derrota, sin re-encare
  let fin3 = null;
  for (let k = 0; k < 60; k++) { fin3 = JSON.parse(await js('String(window.__qdbg())')).state; if (fin3 !== 'pulso') break; await sleep(150); }
  if (fin3 === 'dead') ok('y la mision se pierde por el embudo de siempre (dead), sin re-encare');
  else bad(`tras el rojo el juego quedo en ${fin3}, no en la derrota`);

  // cuantos compases tiene la secuencia de un carril, leyendo la sonda ('bridge:lrl-dll-Z' → 3)
  const largo = c => c.split(':')[1].split('-').length;

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

  // ---------- 5. EL MARGEN, Y QUE SE AGOTE TAMBIEN PIERDE ----------
  // Antes esta seccion medía los TRES fallos y sus costos (re-encare con flak, un avion del
  // escuadron, derrota). Esa economia esta apagada por `UN_ERROR_PIERDE` y su codigo sigue
  // entero detras de la perilla; lo que rige hoy es mas corto y es lo que se mide: el margen es
  // POR TECLA, y agotarlo pierde igual que apretar la equivocada.
  console.log('\n5. el margen por tecla:');
  await win.loadURL('file://' + path.join(ROOT, 'src', 'index.html') + '?pulso=3');
  await sleep(2500);
  await cfg({ t01: 1 });
  // se elige blanco y se acierta UNA tecla: el margen tiene que volver a llenarse con el acierto
  {
    const dd = await Q();
    const i = dd.carriles.findIndex(c => c.startsWith('bridge:'));
    await tap(dd.esperado[i]);
    const d1 = await Q();
    await tap(d1.esperado);
    const d2 = await Q();
    if (d2.beatLeft > d1.beatLeft * 0.9) ok(`el margen se renueva con cada tecla (quedaban ${d1.beatLeft}s, tras acertar ${d2.beatLeft}s)`);
    else bad(`el margen no se renovo al acertar (${d1.beatLeft}s → ${d2.beatLeft}s)`);
  }
  // y si no se toca nada, se agota y se pierde
  for (let k = 0; k < 60; k++) { d = await Q(); if (d && d.fase !== 'prueba') break; await sleep(150); }
  if (d && d.fase === 'rojo') ok('agotar el margen de una tecla la pone en rojo igual que errarla');
  else bad(`el margen no se agota solo: la fase quedo en ${d && d.fase}`);

  // ---------- 6. EL PREMIO: DOS ZONAS, DOS CINEMATICAS (Q3) ----------
  // El criterio de cierre de Q3, literal: «dos zonas distintas producen dos cinematicas distintas».
  console.log('\n6. el premio: la cinematica que se compone (Q3):');
  await win.loadURL('file://' + path.join(ROOT, 'src', 'index.html') + '?pulso=3');
  await sleep(2500);

  /** Juega una zona limpia y FILMA la cinematica: devuelve el premio y el rastro de compases. */
  async function filmar(zona, nombre) {
    await cfg({ t01: 0.5 });
    // LA ZONA SE FIJA POR SONDA: desde el 14/9 no se elige jugando («es matarlo o no matarlo»),
    // pero cada zona sigue teniendo SU cinematica y eso es lo que esta seccion mide.
    await js(`String(window.__qzona(${JSON.stringify(zona)}))`);
    let d = await tocar({});
    if (!d || d.fase !== 'cine') { bad(`${zona}: la secuencia limpia no llego al premio (${d && d.fase})`); return null; }
    const beats = [], fx = [];
    let pico = 0, mvVisto = null, secVisto = false, capt = false, dir = null;
    // el tamaño del buque EN EL PRIMER CUADRO DE LA AGONIA: contra el se mide que el acercamiento
    // no se detenga mientras se muere (ver la asercion, mas abajo)
    let growM0 = null, altM0 = null, altUlt = 0, ras = 0, aguaMax = 0, largoM0 = null, largoUlt = 0, quieto = 0, quietoMax = 0;
    for (let k = 0; k < 160; k++) {
      const s = JSON.parse(await js('String(window.__qdbg())'));
      if (!s.on) break;                                     // la cinematica termino: cerro la mision
      // …y quien la esta corriendo: EL DIRECTOR, leyendo la timeline de data/cines.js
      if (!dir) { const d = JSON.parse(await js('String(window.__cdbg())')); if (d && d.id) dir = d; }
      if (s.beat && beats[beats.length - 1] !== s.beat) beats.push(s.beat);
      if (s.mv) mvVisto = s.mv;
      if (s.sec) secVisto = true;
      if (s.fx) { fx.push(s.fx); pico = Math.max(pico, s.tScale); }
      // EL LARGO DIBUJADO, no el multiplicador pedido: son cosas distintas y esa diferencia fue
      // exactamente el bug del 22/8 — el `grow` subia de 2.8 a 4.0 mientras el buque quedaba clavado
      // en 456 px, topeado por el encuadre. Medir la causa daba verde con la pantalla congelada.
      const B = JSON.parse(await js('String(window.__buque())') || 'null');
      // …y CUANTAS LECTURAS SEGUIDAS quedo del mismo tamaño. Es la vara fina: el total puede subir
      // y aun asi haber un tramo clavado en el medio, que es lo que el jugador reporta como "frena".
      if (B) {
        if (s.beat === 'muerte' && B.largo === largoUlt) { quieto++; quietoMax = Math.max(quietoMax, quieto); }
        else quieto = 0;
        largoUlt = B.largo;
      }
      if (s.beat === 'muerte' && growM0 === null) { growM0 = s.fx ? s.fx.grow : 0; altM0 = s.alt; largoM0 = B && B.largo; }
      if (s.alt !== undefined) altUlt = s.alt;
      // EL RASANTE: cuanto de la cinematica se vuela pegado al agua, y si el agua LLEGA AL VIDRIO.
      // Lo segundo se cuenta y no se mira: el efecto ya se murio dos veces sin dar error.
      if (s.alt !== undefined && s.alt <= 3) { ras++; aguaMax = Math.max(aguaMax, +(await js('String(window.__vidrio())')) || 0); }
      // la foto va TARDE en la muerte: los sellos y los puntos entran medio segundo despues
      if (s.beat === 'muerte' && !capt) { capt = true; await sleep(1100); await shot('q3_' + nombre); }
      await sleep(90);
    }
    const ult = fx[fx.length - 1] || { grow: 0, tilt: 0, sink: 0 };
    return { premio: d.premio, clase: d.clase, beats, mv: mvVisto, sec: secVisto, pico, ult, dir,
             growM0, altM0, altUlt, ras, aguaMax, largoM0, largoUlt, quietoMax };
  }

  const A = await filmar('radar', 'radar');
  await win.loadURL('file://' + path.join(ROOT, 'src', 'index.html') + '?pulso=3');
  await sleep(2500);
  const B = await filmar('deposit', 'polvorin');

  if (A && B) {
    // LA CINEMATICA NO ESTA EN CODIGO (PLAN_DIRECTOR_CINEMATICAS C0): la corre el director leyendo
    // una timeline de data/cines.js. Es el criterio de cierre de C0 y por eso se mide primero.
    if (A.dir && A.dir.id === 'pulso_premio' && A.dir.beats > 0)
      ok(`la corre EL DIRECTOR desde data: timeline "${A.dir.id}" · ${A.dir.beats} beats · ${A.dir.dur}s`);
    else bad(`el premio no lo esta corriendo el director (${JSON.stringify(A.dir)})`);
    // los compases de la cinematica, en orden — es la cinematica COMPUESTA del plan §3
    const esperado = ['pirueta', 'suelta', 'impacto', 'muerte'];
    if (A.beats.join('>') !== esperado.join('>')) bad(`la cinematica no compone en orden: ${A.beats.join('>')}`);
    else ok(`compone: ${A.beats.join(' → ')}`);
    if (A.mv) ok(`vuela LA pirueta que se tecleo (maniobra "${A.mv}", la corre systems/moves.js)`);
    else bad('la cinematica no lanzo ninguna maniobra: el premio no es la pirueta tecleada');
    if (A.pico > 0.9) ok(`el mundo DESHIELA en el premio (el tiempo vuelve a correr: ${A.pico}×)`);
    else bad(`el mundo quedo dilatado durante el premio (tope ${A.pico}×)`);
    // NO SE DETIENE: el playtest 8/2026 fue literal — «el barco NUNCA SE SIGUE ACERCANDO DURANTE SU
    // DESTRUCCION» y «el avion se queda quieto al lanzar». Eran la MISMA cosa vista dos veces: en
    // una camara que mira para adelante, el tamaño del blanco es lo unico que dice a que velocidad
    // vas, asi que un zoom que se satura ES un avion que frena. Las dos mitades se miden aca.
    // EL RASANTE (playtest 22/8: «la cinematica debe ser MAS rasante» + «el efecto del agua falta»).
    if (A.ras >= 4) ok(`entra RASANTE: ${A.ras} lecturas pegadas al agua (≤3 m) antes del salto`);
    else bad(`el tramo rasante casi no existe (${A.ras} lecturas a ≤3 m): el juego se llama asi`);
    if (A.aguaMax > 8) ok(`y el mar LLEGA AL VIDRIO: ${A.aguaMax} gotas en el cuadro a ras`);
    else bad(`no hay agua en el vidrio volando a ras (${A.aguaMax} gotas): el efecto se murio otra vez`);
    // …y se mide EN PIXELES DIBUJADOS. El multiplicador es la intencion; lo que el jugador ve es
    // la eslora en pantalla, y entre las dos hay un tope de encuadre que ya las desacoplo una vez.
    if (A.largoM0 && A.largoUlt > A.largoM0 * 1.1 && A.quietoMax === 0)
      ok(`el buque SIGUE ACERCANDOSE mientras se muere, sin un solo cuadro clavado (${A.largoM0} → ${A.largoUlt} px de eslora)`);
    else bad(`el acercamiento se frena en la agonia (${A.largoM0} → ${A.largoUlt} px, ${A.quietoMax} lecturas clavadas): un buque que deja de crecer se lee como un avion que freno`);
    if (A.altM0 != null && A.altUlt > A.altM0 + 20)
      ok(`y el avion SALE trepando hasta el ultimo cuadro (${A.altM0} m → ${A.altUlt} m)`);
    else bad(`el avion se queda quieto durante la muerte del buque (${A.altM0} m → ${A.altUlt} m)`);
    if (A.ult.grow > 1.5) ok(`el buque DOMINA el cuadro en el premio (crece ${A.ult.grow}×)`);
    else bad(`el buque no crecio en el premio (${A.ult.grow}×)`);
    // …y las dos zonas no pueden dar la misma pelicula
    if (B.sec && !A.sec) ok('solo el polvorin vuela por segunda vez (la santabarbara)');
    else bad(`el segundo estallido no distingue las zonas (radar ${A.sec} · polvorin ${B.sec})`);
    // EL BUQUE YA NO SE HUNDE (pedido de Matias, 8/2026): muere reventando por dentro. Esta prueba
    // exigia lo contrario —que cada zona lo hundiera distinto— y por eso se puso en rojo al apagar
    // `PULSO_CINE.HUNDIMIENTO`. No se borra: se DA VUELTA, y ahora guarda las dos mitades del
    // pedido, que son las que se pueden romper sin querer.
    //
    // 1. que HOY no se hunda ni escore, en ninguna zona.
    if (A.ult.sink === 0 && A.ult.tilt === 0 && B.ult.sink === 0 && B.ult.tilt === 0)
      ok('el buque NO se hunde ni escora: muere reventando por dentro (escora/hundimiento en 0)');
    else bad(`quedo hundimiento vivo: radar ${A.ult.tilt}/${A.ult.sink} · polvorin ${B.ult.tilt}/${B.ult.sink}`);
    // 2. …y que la animacion SIGA ENTERA detras de la perilla. Es la mitad que se pierde sola: el
    // dia que alguien limpie "codigo muerto", esto se va sin que nada falle — y era una opcion de
    // destruccion que se pidio conservar, no borrar.
    const H = JSON.parse(await js('String(window.__qhund())'));
    if (H.on === false && H.curvaSink > 0 && H.curvaTilt > 0)
      ok(`y la animacion sigue ENTERA detras de la perilla (apagada, pero la curva da ${H.curvaTilt} / ${H.curvaSink})`);
    else bad(`el hundimiento quedo mal: perilla=${H.on}, curva ${H.curvaTilt}/${H.curvaSink}`);
    if (B.premio.pts > A.premio.pts * 2) ok(`y paga distinto: radar ${A.premio.pts} · polvorin ${B.premio.pts} puntos`);
    else bad(`la zona brava no paga lo que cuesta (${A.premio.pts} vs ${B.premio.pts})`);
    if (B.premio.sellos.bravo && !A.premio.sellos.bravo) ok('el sello de ZONA BRAVA solo lo da la zona brava');
    else bad('el sello de zona brava no distingue la zona');
    ok(`la clase del buque pone la linea de la muerte: ${A.clase}`);
  }
  // y el premio cierra la mision por el embudo de siempre, con su fila en el recuento
  for (let k = 0; k < 60; k++) { const s = JSON.parse(await js('String(window.__qdbg())')); if (s.state !== 'pulso') break; await sleep(200); }
  const rec = await js('String(JSON.stringify((window.__lastRun && window.__lastRun()) || null))');
  const R = JSON.parse(rec || 'null');
  if (R && R.rows.some(r => r.k === 'res_pulso'))
    ok(`el premio entra al recuento de la mision: ${R.rows.find(r => r.k === 'res_pulso').v} puntos de ${R.total}`);
  else bad('el premio del climax no aparece en el recuento de la mision');

  // ---------- 7. INTEGRACION: EL PASILLO DESEMBOCA EN LA PRUEBA (Q4) ----------
  // El criterio de cierre de Q4 es que el climax sea DATO. La parte pura (climaxOf) esta en
  // `npm run unit`; lo que se mide aca es la otra mitad: que volando el nivel de verdad, la
  // prueba llegue SOLA al final del pasillo — sin corte, sin cambio de escena y contra el mismo
  // buque que venia creciendo en el horizonte.
  console.log('\n7. el pasillo desemboca en la prueba (Q4):');
  // `&qa` ACORTA el objetivo al 6% (el mismo flag que usa tools/smoke.js). Hace falta porque el
  // fixture no pilotea: sin nadie esquivando, el pasillo entero de una mision de verdad termina
  // con el avion contra un obstaculo antes de llegar al buque. Lo que se mide es el EMPALME —
  // que el final del pasillo entrega la prueba— y ese es igual de largo el camino que sea.
  await win.loadURL('file://' + path.join(ROOT, 'src', 'index.html') + '?pulso=3&pasillo&qa');
  await sleep(2000);
  let entro = null, prevDist = -1, creciendo = false;
  for (let k = 0; k < 220; k++) {
    const s = JSON.parse(await js('String(window.__qdbg())'));
    if (s.dist !== undefined) { if (s.dist > prevDist) creciendo = true; prevDist = s.dist; }
    if (s.on) { entro = s; break; }
    await sleep(200);
  }
  if (!entro) bad('volando el pasillo, la prueba nunca arranco al llegar al buque');
  else {
    ok(`el pasillo entrega la prueba solo (llego a ${prevDist} m y entro en fase ${entro.fase})`);
    if (creciendo) ok('y llego VOLANDO: la distancia crecio durante el viaje, no se teletransporto');
    await js('__qhold()'); await sleep(500); await shot('q4_desemboca');
  }

  // ---------- 8. EL TEATRO: EL LATIDO QUE ACELERA (Q5) ----------
  // El criterio de cierre es «mirada muda: tension sin leer nada». Lo que se puede MEDIR de eso es
  // el reloj del corazon: tiene que acelerar solo con el margen yendose, y no volver a la calma
  // entre pasadas — despues de un fallo el corazon arranca mas apurado que la primera vez.
  console.log('\n8. el teatro: el corazon (Q5):');
  await win.loadURL('file://' + path.join(ROOT, 'src', 'index.html') + '?pulso=3');
  await sleep(2500);
  await cfg({ t01: 0 });
  const hb0 = (await Q()).hbPer;
  await sleep(1600);                       // sin tocar nada: el margen se va consumiendo
  const hb1 = (await Q()).hbPer;
  if (hb1 < hb0) ok(`el corazon acelera con el margen que se va (${hb0}s → ${hb1}s entre latidos)`);
  else bad(`el latido no acelera (${hb0}s → ${hb1}s)`);
  // …y tras el fallo, el re-encare no devuelve la calma
  // (la parte de "no se calma entre pasadas" se fue con los tres intentos: sin re-encare no hay
  // pasada siguiente en la que el corazon pudiera arrancar acelerado. El codigo del acelerado por
  // intentos sigue en `urgencia()`, detras de la misma perilla.)
  await js('__qhold()'); await sleep(500); await shot('q5_teatro');

  console.log('\nconsola: ' + (errors.length ? errors.length + ' error(es)' : 'sin errores'));
  for (const e of errors.slice(0, 8)) console.error('   ' + e);
  console.log(fails || errors.length ? `\nFIXTURE PULSO: FALLA (${fails})\n` : '\nFIXTURE PULSO: OK\n');
  app.exit(fails || errors.length ? 1 : 0);
}).catch(e => { console.error('reventó:', e); app.exit(1); });
process.on('unhandledRejection', e => { console.error('REJECTION:', e && e.message); app.exit(1); });
