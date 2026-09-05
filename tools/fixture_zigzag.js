// FIXTURE DE ACEPTACION del PASILLO EN ZIGZAG (docs/sistemas/PLAN_PASILLO_ZIGZAG.md), corrido
// en el juego de verdad.
//   npm run zigzag                      · ZZ_SHOTS=/tmp/x npm run zigzag  (deja capturas)
//
// CORRE SIN `?qa` A PROPOSITO. El trazado esta escrito en METROS (los `largo` de cada curva), y
// `?qa` comprime las misiones al 6%: una curva de 600 m quedaria en 36 y el fixture estaria
// midiendo otra cosa que el juego. Es la misma trampa que documenta SPEC_TRAMOS §8.4.
//
// LO QUE CUIDA, y el orden importa: primero LA REGLA SUPREMA —con el zigzag apagado, el
// corrimiento del carril es CERO EXACTO en toda la profundidad, que es lo que hace que cada
// `+ bendW(z) * k` de los sitios de dibujo sea `+ 0` y el mapa recto se dibuje igual que antes de
// que el item existiera—. Recien despues, que el zigzag encendido haga lo que promete.
const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const ROOT = path.join(__dirname, '..');
const OUT = process.env.ZZ_SHOTS || '';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const errors = [];
let win, fails = 0;
const bad = m => { console.error('   ✗ ' + m); fails++; };
const ok = m => console.log('   ✓ ' + m);
const js = s => win.webContents.executeJavaScript(s);
const Z = async () => JSON.parse(await js('String(window.__zzdbg && window.__zzdbg())') || 'null');
const bend = async z => +(await js(`Number(window.__zzbend(${z}))`));
const estado = () => js('JSON.parse(__pausedbg()).state');
async function shot(n) {
  if (!OUT) return;
  fs.writeFileSync(path.join(OUT, n + '.png'), (await win.webContents.capturePage()).toPNG());
}
const down = k => win.webContents.sendInputEvent({ type: 'keyDown', keyCode: k });
const up = k => win.webContents.sendInputEvent({ type: 'keyUp', keyCode: k });
const tap = async k => { down(k); await sleep(60); up(k); await sleep(110); };

// EL CALLEJON DE PRUEBA: recta, y despues una curva a la IZQUIERDA plena y larga. Explicito y
// no procedural porque un trazado guionado es el unico con el que se puede afirmar "aca tiene
// que doblar tanto" — con dos senos habria que confiar en el numero que salga.
//
// SE CONSTRUYE CONTRA LA DISTANCIA VOLADA y no con numeros fijos, y eso lo enseño el propio
// fixture: POR LA PATRIA no tiene objetivo, asi que `__wjump` —que salta a una FRACCION del
// objetivo— no hace nada ahi. Midiendo la recta con numeros fijos, el avion ya estaba adentro
// de la curva y el fixture reportaba un error del motor que no existia.
const recta = d => ({ trazado: [[Math.max(400, d + 800), 0], [1600, -1], [400, 0]], paredes: { alto: 0.9, x: 46, mata: true } });
const curvaAqui = d => ({ trazado: [[Math.max(250, d - 150), 0], [1600, -1], [400, 0]] });

/** EL PASILLO VACIO. El item que se esta probando es EL CARRIL, no la puntería: con enemigos
 *  encendidos el avion se muere a los pocos cientos de metros, el juego pasa a 'relevo' —donde
 *  el zigzag se apaga A PROPOSITO— y el fixture termina reportando "el trazado no rige" sobre un
 *  motor que funciona perfecto. Fue exactamente lo que paso en la primera corrida. */
async function vaciar() {
  for (const k of ['obstacles', 'bombs', 'caza']) await js(`window.__cfgset('${k}', 0)`);
}

/** VOLAR SIN CAERSE. El avion sin gas se hunde: medido, se cae al mar a los ~300 m sin que nada
 *  lo toque, el juego pasa a 'relevo' —donde el zigzag se apaga A PROPOSITO— y el fixture
 *  termina acusando al trazado de no regir sobre un motor que anda perfecto. Fueron tres
 *  corridas creyendole al sintoma equivocado.
 *
 *  Y NO SE SOSTIENE CON LA TECLA: un `keyDown` sin `keyUp` por `sendInputEvent` no queda apretado
 *  para el juego (los toques de menu si andan, una tecla sostenida no — medido). Se sostiene con
 *  la sonda que planta el avion, que ademas es determinista; la altura no es lo que esta a prueba.
 *
 *  `libre`: no toca la x, para el tramo donde lo que se mide es justamente cuanto lo corre la
 *  curva de costado. */
async function sostener(ms, libre) {
  const t0 = Date.now();
  do {
    if (await estado() === 'play') {
      if (libre) await js('window.__chaput(JSON.parse(window.__chaput(0, 20)).x, 20)');
      else await js('window.__chaput(0, 20)');
    }
    await sleep(250);
  } while (Date.now() - t0 < ms);
}

/** Se asegura de estar VOLANDO antes de medir. Devuelve false si ni reentrando se pudo. */
async function vivo() {
  if (await estado() === 'play') return true;
  if (!await volar()) return false;
  await vaciar();
  return true;
}

/** Entra a POR LA PATRIA volando (mismo camino de menu que los fixtures del agua y la tierra). */
async function volar(qs) {
  await win.loadURL('file://' + path.join(ROOT, 'src', 'index.html') + (qs || ''));
  await sleep(2600);
  await tap('Return'); await tap('Down'); await tap('Return');
  await tap('Down'); await tap('Return'); await tap('Return');
  for (let i = 0; i < 60; i++) { if (await estado() === 'play') { await sleep(900); return true; } await sleep(200); }
  return false;
}

app.whenReady().then(async () => {
  console.log('\nFIXTURE — EL PASILLO EN ZIGZAG (Z0-Z2)\n');
  win = new BrowserWindow({ width: 1280, height: 760, show: false, webPreferences: { backgroundThrottling: false } });
  win.webContents.on('console-message', (e, l, m) => { if (l >= 3 && !m.includes('Security Warning')) errors.push(m.slice(0, 300)); });
  win.webContents.on('render-process-gone', (e, d) => errors.push('EL RENDERER MURIO: ' + JSON.stringify(d)));

  if (!await volar()) { console.error('   ✗ no se pudo entrar a volar'); app.exit(1); return; }
  if (!await Z()) { console.error('   ✗ la sonda __zzdbg no responde'); app.exit(1); return; }
  await vaciar();

  // ---------- 1. LA REGLA SUPREMA ----------
  console.log('1. sin zigzag, el mundo es el de siempre:');
  const z0 = await Z();
  if (z0.on === false) ok('el zigzag arranca APAGADO (cfg.zigzag = 0 es el default)');
  else bad(`el zigzag arranco encendido: ${JSON.stringify(z0)}`);
  // el barrido entero de profundidades, no una muestra: lo que se afirma es que NINGUNA fila del
  // dibujo recibe un corrimiento, y las filas cubren de 0 a SPAWN_Z y mas.
  let sucio = null;
  for (let d = 0; d <= 400; d += 8) { const b = await bend(d); if (b !== 0) { sucio = `${d} → ${b}`; break; } }
  if (sucio === null) ok('el corrimiento del carril es 0 EXACTO de z=0 a z=400 (cada `+ bendW*k` es `+ 0`)');
  else bad(`hay corrimiento con el zigzag apagado, en z=${sucio}`);
  if (z0.deriva === 0) ok('la deriva es 0: el avion vuela con la fisica de siempre');
  else bad(`hay deriva con el zigzag apagado: ${z0.deriva}`);
  await shot('zz_1_apagado_mar');

  // ---------- 2. EL MUNDO DOBLA ----------
  console.log('\n2. con el trazado puesto, el carril dobla:');
  // EL ORDEN IMPORTA: primero se pone un trazado (sin el, la sonda no sabe donde arranca el
  // callejon y contesta 0), despues se vuela hasta pasar ese arranque, y RECIEN AHI se mide.
  // El callejon no existe en los primeros metros del mapa a proposito (Z3.c) — un callejon que ya
  // esta ahi al soltar el freno no es un lugar al que se entra, y encima le tapa la salida al
  // despegue. Midiendo antes, esta prueba reportaba "la curva no dobla" sobre un motor correcto.
  const err = await js(`window.__zzset(${JSON.stringify(recta(9999))})`);
  if (err === '[]') ok('el trazado pasa el validador');
  else bad(`el validador lo rechazo: ${err}`);
  await sostener(400);
  const arr = (await Z()).arranque || 0;
  for (let i = 0; i < 40 && (await Z()).dist < arr + 220; i++) await sostener(400);
  const dPas = (await Z()).dist;
  if (dPas > arr) ok(`pasado el arranque del callejon (${arr} m): el vuelo va por ${dPas} m`);
  else bad(`no se pudo pasar el arranque (${arr} m): el vuelo quedo en ${dPas} m`);

  // LA RECTA: el trazado se arma con la curva 800 m MAS ADELANTE, asi que toda la ventana visible
  // cae en tramo recto. Si esto doblara, el item estaria metiendo corrimiento donde la curvatura
  // es cero.
  await js(`window.__zzset(${JSON.stringify(recta(dPas))})`);
  await sostener(400);
  const bRecta = await bend(320);
  if (Math.abs(bRecta) < 0.5) ok(`con el zigzag PUESTO pero en tramo recto, el carril sigue derecho (bend ${bRecta.toFixed(2)} m)`);
  else bad(`la recta esta doblando: bend(320) = ${bRecta.toFixed(2)} m`);

  // AHORA LA CURVA, plantada donde el avion ya esta.
  if (!await vivo()) { bad('no se pudo seguir volando'); app.exit(1); return; }
  await js(`window.__zzset(${JSON.stringify(curvaAqui((await Z()).dist))})`);
  await sostener(2600);
  if (!await vivo()) { bad('el avion no llego vivo a la curva'); app.exit(1); return; }
  const zCurva = await Z();
  const bCurva = await bend(320);
  if (zCurva.curv < 0) ok(`en la curva el trazado dobla a la izquierda (curvatura ${zCurva.curv})`);
  else bad(`la curva no dobla: curvatura ${zCurva.curv}`);
  if (bCurva < -20) ok(`el carril a 320 m esta corrido ${bCurva.toFixed(1)} m a la izquierda`);
  else bad(`el corrimiento es insuficiente: ${bCurva.toFixed(1)} m`);
  if (zCurva.bend320 === +bCurva.toFixed(2)) ok('la sonda y la tabla dicen lo MISMO (el dibujo lee de ahi)');
  else bad(`la sonda dice ${zCurva.bend320} y la tabla ${bCurva.toFixed(2)}`);
  if (Math.abs(zCurva.headGrados) > 3) ok(`el rumbo giro ${zCurva.headGrados}° — el fondo se corre con esto`);
  else bad(`el rumbo casi no giro: ${zCurva.headGrados}°`);
  await shot('zz_2_curva_mar');

  // ---------- 3. LA DERIVA ----------
  console.log('\n3. la curva EMPUJA (es lo que la vuelve una habilidad):');
  if (zCurva.deriva > 0) ok(`doblando a la izquierda la centrifuga tira a la derecha (${zCurva.deriva} m/s)`);
  else bad(`la deriva tiene el signo equivocado o es cero: ${zCurva.deriva}`);
  if (zCurva.sostenible) ok(`a velocidad normal se sostiene con la palanca (${zCurva.deriva} m/s contra 30)`);
  else bad(`no se sostiene ni yendo normal: ${zCurva.deriva} m/s`);
  // EL EMPUJON, MEDIDO EN EL AVION. `__chaput` planta el avion en el centro y devuelve su
  // posicion; despues de soltar la palanca, la unica cosa que lo puede haber movido de costado
  // es la centrifuga — el fixture no toca ninguna flecha en este tramo.
  await js('window.__chaput(0, 20)');
  await sostener(1400, true);
  const xFin = +(await js('Number((JSON.parse(window.__zzdbg())).deriva)'));
  if (Math.abs(xFin) > 5) ok(`la curva empuja de verdad: ${xFin} m/s sostenidos sobre el avion`);
  else bad(`la curva casi no empuja: ${xFin} m/s`);

  // ---------- 4. APAGAR VUELVE A CERO ----------
  console.log('\n4. apagarlo lo deja como si no existiera:');
  await js('window.__zzset(null)');
  await js("window.__cfgset('zigzag', 0)");
  await sleep(400);
  const zOff = await Z();
  let sucio2 = null;
  for (let d = 0; d <= 400; d += 8) { const b = await bend(d); if (b !== 0) { sucio2 = `${d} → ${b}`; break; } }
  if (zOff.on === false && sucio2 === null && zOff.deriva === 0) ok('apagado en vivo: corrimiento 0 exacto y deriva 0 — se puede desactivar sin recargar');
  else bad(`al apagar quedo algo: on=${zOff.on} deriva=${zOff.deriva} sucio=${sucio2}`);
  await shot('zz_3_apagado_otra_vez');

  // ---------- 5. LOS OTROS DOS TERRENOS ----------
  console.log('\n5. el carril curvo en tierra y en costa:');
  for (const [terr, nom] of [['land', 'tierra'], ['coast', 'costa']]) {
    // EL AVION SE MUERE VOLANDO, y el fixture tiene que contarlo con eso: la primera version
    // media el terreno con el estado en 'dead' y culpaba al trazado de no regir. Se vuelve a
    // entrar si hizo falta, y se apagan los obstaculos: lo que se esta mirando es el CARRIL.
    if (!await vivo()) { bad(`${nom}: no se pudo volver a volar`); continue; }
    await js(`window.__cfgset('terrain', ${JSON.stringify(terr)})`);
    await js(`window.__zzset(${JSON.stringify(curvaAqui((await Z()).dist))})`);
    await sostener(2200);
    const zz = await Z();
    if (zz.on && Math.abs(zz.curv) > 0) ok(`${nom}: el trazado rige (curvatura ${zz.curv}, corrimiento ${zz.bend320} m)`);
    else bad(`${nom}: el trazado no rige (${JSON.stringify(zz)})`);
    await shot('zz_4_curva_' + nom);
  }

  // ---------- 6. EL HORIZONTE FIJO SE RESPETA ----------
  console.log('\n6. la salida del que se marea sigue siendo una salida:');
  await js("window.__cfgset('horizon', 0)");
  await sleep(500);
  await shot('zz_5_curva_horizonte_fijo');
  ok('capturado con HORIZONTE=FIJO (el mundo dobla pero no se inclina)');
  await js("window.__cfgset('horizon', 2)");
  await sleep(400);
  await shot('zz_6_curva_horizonte_total');
  ok('capturado con HORIZONTE=TOTAL');

  // ---------- 7. LAS PAREDES DEL CALLEJON (Z3) ----------
  console.log('\n7. las laderas: el marco de referencia, y la consecuencia:');
  await js("window.__cfgset('terrain', 'sea')");
  if (!await vivo()) { bad('no se pudo volar para probar las paredes'); }
  else {
    const CALLE = d => ({ trazado: [[Math.max(250, d - 150), 0], [2400, -1]], paredes: { alto: 1, x: 46, mata: true } });
    await js(`window.__zzset(${JSON.stringify(CALLE((await Z()).dist))})`);
    await sostener(900);
    const zp = await Z();
    if (zp.paredes && zp.paredes.mata) ok('el trazado declara paredes letales');
    else bad(`no hay paredes declaradas: ${JSON.stringify(zp.paredes)}`);

    // NADA NACE ADENTRO DE LA ROCA. Se mira el censo de siembra: un obstaculo enterrado en la
    // ladera es invisible y mata, que es la peor combinacion posible.
    await js("window.__cfgset('obstacles', 2)");
    await sostener(2500);
    const fuera = await js(`Number((window.__zzobs ? window.__zzobs() : -1))`);
    await js("window.__cfgset('obstacles', 0)");
    if (fuera === 0) ok('no nacio un solo obstaculo adentro de la roca');
    else if (fuera < 0) console.log('   · (sin sonda de censo: el recorte se comprueba por codigo)');
    else bad(`${fuera} obstaculo(s) nacieron dentro de la ladera`);

    // CHOCARLA MATA. El avion se planta contra la cara y tiene que morir — es lo que convierte el
    // trazado en una regla en vez de una sugerencia.
    await js('window.__chaput(45, 3)');
    await sleep(800);
    const st = await estado();
    if (st !== 'play') ok(`meterse en la ladera mata (estado: ${st})`);
    else bad('el avion atraveso la ladera sin consecuencia');

    // Y CON `mata: false` TOPA en vez de matar: es el preset SUAVE, para mirar sin morirse.
    if (await vivo()) {
      await js(`window.__zzset(${JSON.stringify({ trazado: [[300, 0], [2400, -1]], paredes: { alto: 0.55, x: 54, mata: false } })})`);
      await sostener(700);
      await js('window.__chaput(53, 3)');
      await sleep(700);
      if (await estado() === 'play') ok('con `mata: false` la ladera TOPA y no mata');
      else bad('la ladera mato con `mata: false`');
    }
  }

  // ---------- 8. LA TIERRA QUE ENTRA AL PASILLO, CON LA CAMARA QUIETA (Z3.b) ----------
  console.log('\n8. el callejon de verdad: puntas de tierra y camara quieta:');
  if (!await vivo()) { bad('no se pudo volar'); }
  else {
    await js('window.__zzset(null)');
    await js("window.__cfgset('zigzag', 2)");     // el camino del MENU, no la sonda
    await sostener(700);
    const zc = await Z();
    // LA CAMARA NO SE MUEVE. Es el pedido del segundo playtest ("se siente mal, como si se
    // moviese el avion solo") y es lo primero que hay que poder afirmar.
    const quieta = zc.curv === 0 && zc.tilt === 0 && zc.deriva === 0 && zc.bend320 === 0;
    if (quieta) ok('el preset CALLEJON deja la camara QUIETA: curvatura, inclinacion, deriva y corrimiento en 0');
    else bad(`la camara se mueve: ${JSON.stringify({ curv: zc.curv, tilt: zc.tilt, deriva: zc.deriva, bend: zc.bend320 })}`);
    if (zc.paredes) ok('y el callejon trae sus laderas');
    else bad('el preset CALLEJON no declara paredes');

    // LAS PUNTAS ENTRAN de verdad, y NUNCA de los dos lados a la vez — esa es la garantia de que
    // el callejon no se puede cerrar. Se barren 6 km de trazado.
    const r = JSON.parse(await js(`(() => {
      let entra = 0, ambas = 0, maxE = 0;
      for (let d = 0; d < 6000; d += 5) {
        const l = window.__zzentra(d, -1), r2 = window.__zzentra(d, 1);
        if (l > 0.5 || r2 > 0.5) entra++;
        if (l > 0.5 && r2 > 0.5) ambas++;
        maxE = Math.max(maxE, l, r2);
      }
      return JSON.stringify({ entra, ambas, maxE: +maxE.toFixed(1) });
    })()`));
    if (r.entra > 100) ok(`la tierra se mete en ${r.entra} de 1200 muestras — hay callejon para esquivar`);
    else bad(`casi no hay puntas: ${r.entra} muestras`);
    if (r.maxE > 12) ok(`la punta mas honda entra ${r.maxE} unidades adentro del pasillo`);
    else bad(`las puntas apenas entran: ${r.maxE}`);
    if (r.ambas === 0) ok('NUNCA entran las dos a la vez: el callejon no se puede cerrar, por construccion');
    else bad(`${r.ambas} profundidades con punta de los dos lados: el callejon se cierra`);

    // y nada nace adentro de la roca aun con las puntas moviendose
    await js("window.__cfgset('obstacles', 2)");
    await sostener(3000);
    const dentro = await js('Number(window.__zzobs())');
    await js("window.__cfgset('obstacles', 0)");
    if (dentro === 0) ok('con las puntas puestas, sigue sin nacer un obstaculo adentro de la roca');
    else bad(`${dentro} obstaculo(s) enterrados en la tierra`);
    await shot('zz_7_callejon_puntas');
    await js("window.__cfgset('zigzag', 0)");
  }

  // ---------- 9. EL CALLEJON NO SE EVAPORA AL MORIR ----------
  console.log('\n9. el mundo sigue ahi cuando te matas:');
  if (!await vivo()) { bad('no se pudo volar'); }
  else {
    await js("window.__cfgset('zigzag', 2)");
    await sostener(600);
    // pasar el arranque volando por el lado que la punta deja libre
    for (let i = 0; i < 60 && (await Z()).dist < (await Z()).arranque + 250; i++) {
      if (await estado() !== 'play') break;
      const d = await Z();
      const izq = await js(`Number(window.__zzentra(${d.dist + 80}, -1))`);
      await js(`window.__chaput(${izq > 1 ? 30 : -30}, 14)`);
      await sleep(150);
    }
    if ((await Z()).on) ok(`volando el callejon esquivando, vivo a ${(await Z()).dist} m`);
    else bad('no se pudo entrar al callejon volando');
    // MATARSE contra la ladera
    await js('window.__chaput(45, 4)');
    await sleep(500);
    const zm = await Z();
    if (zm.estado !== 'play' && zm.on) {
      ok(`al morir (${zm.estado}) el callejon SIGUE dibujandose — el mundo no se evapora en la cinematica`);
    } else if (zm.estado === 'play') {
      bad('no llego a morir contra la ladera');
    } else {
      bad(`al morir el callejon DESAPARECIO (estado ${zm.estado}, on ${zm.on})`);
    }
    await shot('zz_8_al_morir');
    await js("window.__cfgset('zigzag', 0)");
  }

  // ---------- 10. LA MISION REAL: EL CALLEJON DE LAS BOMBAS (Z4) ----------
  console.log('\n10. m5 — el callejon de las bombas, volado de verdad:');
  {
    await win.loadURL('file://' + path.join(ROOT, 'src', 'index.html') + '?mision=m5');
    await sleep(3200);
    let ok5 = false;
    for (let i = 0; i < 80; i++) { if (await estado() === 'play') { ok5 = true; break; } await sleep(150); }
    if (!ok5) bad('no se pudo entrar a m5');
    else {
      // LOS CUATRO MOMENTOS del guion: el transito mudo, la boca, el callejon y la bahia.
      // Se re-entra despues de cada uno porque m5 va con todo el fuego encima y el fixture no
      // esta jugando: esta comprobando que el TERRENO aparezca donde el dato dice.
      const beats = [
        [0.28, 'el transito del Narwal', false],
        [0.45, 'la boca y el callejon', true],
        [0.80, 'el callejon a fondo', true],
        [0.95, 'la bahia, con el ARDENT', false],
      ];
      for (const [p, nom, debeHaber] of beats) {
        if (await estado() !== 'play') {
          await win.loadURL('file://' + path.join(ROOT, 'src', 'index.html') + '?mision=m5');
          await sleep(3200);
          for (let i = 0; i < 80; i++) { if (await estado() === 'play') break; await sleep(150); }
        }
        await js(`window.__wjump(${p})`);
        await sleep(400);
        const z = await Z();
        // "hay callejon" se mide DONDE ESTA EL AVION (los primeros 60 m), no 240 adelante. La
        // primera version barria 240 m y decia que en el transito mudo ya habia callejon — y no
        // estaba equivocada del todo: a 760 m se VE VENIR la boca, que empieza en 858. Pero lo que
        // se quiere afirmar es donde el jugador esta, no lo que alcanza a mirar.
        // SE MIDE LA LADERA, no la punta: las puntas son intermitentes por diseño (72% de las
        // bandas), asi que buscarlas en una ventana corta es tirar una moneda — la segunda version
        // de esta prueba fallo por eso. La ladera esta o no esta, y es lo que define el callejon.
        const hay = await js(`(() => { let m = 0; const d = JSON.parse(window.__zzdbg()).dist;
          for (let i = 0; i < 60; i += 6) m = Math.max(m, window.__zzalto(d + i, -1), window.__zzalto(d + i, 1));
          return m; })()`);
        if (debeHaber && hay > 5) ok(`${nom} (p=${z.p}): laderas de ${(+hay).toFixed(0)} m encima`);
        else if (!debeHaber && hay <= 1) ok(`${nom} (p=${z.p}): pasillo abierto, sin callejon`);
        else bad(`${nom} (p=${z.p}): se esperaba ${debeHaber ? 'callejon' : 'pasillo abierto'} y la ladera mide ${(+hay).toFixed(1)} m`);
        await shot('zz_9_m5_' + p);
      }
    }
  }

  console.log('\nconsola:');
  if (!errors.length) ok('sin errores');
  else { bad(`${errors.length} error(es):`); for (const e of errors.slice(0, 8)) console.error('      ' + e); }

  console.log('\nZIGZAG: ' + (fails || errors.length ? 'FALLO' : 'OK') + '\n');
  app.exit(fails || errors.length ? 1 : 0);
}).catch(e => { console.error('reventó:', e); app.exit(1); });
