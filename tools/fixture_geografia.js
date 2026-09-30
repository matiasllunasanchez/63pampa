// FIXTURE DE ACEPTACION de LA GEOGRAFIA DEL PASILLO (docs/sistemas/PLAN_GEOGRAFIA.md §6), corrido
// en el juego de verdad.
//   npm run geografia                      · GEO_SHOTS=/tmp/x npm run geografia  (deja capturas)
//
// Vuela IDA Y VUELTA SMALL (t17) — la mision para la que se hizo esto — con la geografia `demo`
// encima (`?geo=demo`, data/geografias.js). No esta en `check` por la misma razon que agua y
// tierra: son segundos de vuelo real.
//
// LO QUE CUIDA, en orden de importancia:
//   · G0: SIN geografia la mision es la de siempre (todo mar, ninguna fila de tierra).
//   · G1: la tierra SE VE VENIR (con el avion sobre el mar, el cuadro ya tiene filas de tierra),
//         el vuelo LEE el suelo del tramo (sobre tierra se roza tierra y la loma cuenta), sobre
//         tierra NO NACE NADA, y la costa puede estar de cualquiera de los dos lados.
//   · G2: el banco de niebla PUESTO existe en su tramo, entra y sale con fundido.
//   · G3: los acantilados POR TRAMO — contra la pared de un lado se muere y por el otro se pasa, y
//         la barrera PUESTA se pasa por donde deja (un puente por abajo) y mata por donde no.
//   · G5: la geografia escrita EN KILOMETROS (ida y vuelta por separado) cae donde dice.
//   · EL BLANCO ESTRUCTURA (t18): la base en su explanada, soltar en la ventana la destruye.
//   · G4: la ISLA se ve venir (la cumbre asoma sobre el horizonte desde donde nace lo que viene),
//         por encima se pasa, la parcial deja pasar por el canal, y a ras contra ella se choca.
//
// El avion se sostiene con sondas (`__seaput`) y se lo mueve por el camino con `__wjump`: lo que se
// mide es el terreno, no el pilotaje.
const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const ROOT = path.join(__dirname, '..');
const OUT = process.env.GEO_SHOTS || '';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const errors = [];
let win, fails = 0;
const bad = m => { console.error('   ✗ ' + m); fails++; };
const ok = m => console.log('   ✓ ' + m);
const js = s => win.webContents.executeJavaScript(s);
const J = async s => JSON.parse(await js(s));
const G = () => J('__geo()');
const estado = () => js('JSON.parse(__pausedbg()).state');
async function shot(n) {
  if (!OUT) return;
  await sleep(250);
  fs.writeFileSync(path.join(OUT, n + '.png'), (await win.webContents.capturePage()).toPNG());
}
const down = k => win.webContents.sendInputEvent({ type: 'keyDown', keyCode: k });
const up = k => win.webContents.sendInputEvent({ type: 'keyUp', keyCode: k });
const tap = async k => { down(k); await sleep(60); up(k); await sleep(110); };

/** Entra a t17 por URL y espera a estar volando. La primera fase congela el juego con una linea
 *  de radio (`pausa: true`): se la despeja con Enter hasta que el odometro camine. */
async function volar(extra, mision) {
  await win.loadURL('file://' + path.join(ROOT, 'src', 'index.html') + '?mision=' + (mision || 't17') + (extra || ''));
  for (let i = 0; i < 80; i++) { if (await estado() === 'play') break; await tap('Return'); await sleep(250); }
  if (await estado() !== 'play') return false;
  for (let i = 0; i < 12; i++) {
    const d0 = JSON.parse(await js('__wjump()')).dist;
    await sleep(300);
    if (JSON.parse(await js('__wjump()')).dist > d0) return true;
    await tap('Return');
  }
  return false;
}
/** Lleva el avion a la fraccion `p` del camino, a `y` metros y `x` del eje, y lo SOSTIENE ahi un
 *  rato (sin gas el avion cae: la sonda lo repone cada decima). Limpia el cielo para no morir de
 *  otra cosa que no sea lo que se mide. */
async function en(p, y, x, ms) {
  await js(`__wjump(${p})`);
  const t0 = Date.now();
  do { await js(`__seaclear(); __seaput(${y}, ${x || 0})`); await sleep(90); } while (Date.now() - t0 < (ms || 400));
}

app.whenReady().then(async () => {
  console.log('\nFIXTURE — LA GEOGRAFIA DEL PASILLO (G0-G5)\n');
  win = new BrowserWindow({ width: 1280, height: 760, show: false, webPreferences: { backgroundThrottling: false } });
  win.webContents.on('console-message', (e, l, m) => { if (l >= 3 && !m.includes('Security Warning')) errors.push(m.slice(0, 300)); });
  win.webContents.on('render-process-gone', (e, d) => errors.push('EL RENDERER MURIO: ' + JSON.stringify(d)));

  // ---------- G0. SIN GEOGRAFIA, LA MISION DE SIEMPRE ----------
  console.log('G0. sin geografia, la mision es la de siempre:');
  if (!await volar()) { console.error('   ✗ no se pudo entrar a volar t17'); app.exit(1); return; }
  const g0 = await G();
  if (!g0.activa) ok(`t17 no declara geografia: la corrida no la activa (${g0.obj} m de ida)`);
  else bad('t17 sin ?geo igual activo una geografia');
  await en(0.41, 9, 0, 500);
  const f0 = await J('__geofilas()');
  if (!f0.tierra && !f0.costa && !f0.playa && f0.mar > 0) ok(`en el mismo punto donde la demo pone tierra, sin ella es todo mar (${f0.mar} filas)`);
  else bad(`sin geografia aparecio suelo: ${JSON.stringify(f0)}`);
  await en(0.12, 9, 0, 300);
  const n0 = await J('__fog()');
  if (!n0.dentro && !n0.dens) ok('y donde la demo pone niebla, sin ella no hay ningun banco');
  else bad(`sin geografia aparecio niebla (${JSON.stringify(n0)})`);

  // ---------- G1. LA DEMO ----------
  console.log('\nG1. el suelo por tramos (?geo=demo):');
  if (!await volar('&geo=demo')) { console.error('   ✗ no se pudo entrar a volar t17 con la demo'); app.exit(1); return; }
  const g1 = await G();
  if (g1.activa && g1.tramos && g1.tramos.length === 23) ok(`la demo esta cargada: ${g1.tramos.length} tramos sobre ${g1.obj} m de ida`);
  else { bad(`la demo no se cargo (${JSON.stringify(g1).slice(0, 120)})`); app.exit(1); return; }
  const OBJ = g1.obj;
  let peorMar = 0;
  const vigilar = async () => { const g = await G(); peorMar = Math.max(peorMar, g.marSobreTierra); return g; };

  // ---------- G2. LA NIEBLA PUESTA (0.08 → 0.16) ----------
  // Se entra, se cruza y se sale del banco que la demo PUSO, y se mira el sistema de niebla por su
  // sonda: donde esta, cuanto fundido hay, de donde sale (la data, no el sorteo). Los tiempos son
  // cortos a proposito: a ~130 m/s, cada decima que se sostiene el avion son trece metros.
  const nLejos = (await en(0.08 - 400 / OBJ, 9, 0, 100), await J('__fog()'));
  if (!nLejos.dentro && nLejos.fade === 0) ok('lejos del banco puesto no hay bruma');
  else bad(`lejos del banco ya hay niebla (${JSON.stringify(nLejos)})`);
  const nViene = (await en(0.08 - 110 / OBJ, 9, 0, 60), await J('__fog()'));
  if (!nViene.dentro && nViene.fade > 0 && nViene.fade < 1) ok(`la niebla SE VE VENIR: a unos 100 m del banco ya hay ${Math.round(nViene.fade * 100)}% de bruma`);
  else bad(`al acercarse al banco no hay fundido (${JSON.stringify(nViene)})`);
  const nDentro = (await en(0.12, 9, 0, 300), await J('__fog()'));
  if (nDentro.dentro && nDentro.fade === 1 && nDentro.origen === 'geo' && nDentro.dens === 1 && nDentro.vis)
    ok(`adentro, el banco es el de la DATA: densidad ${nDentro.dens}, la vista se corta a ${nDentro.vis} m`);
  else bad(`adentro del tramo con niebla el banco no es el de la data (${JSON.stringify(nDentro)})`);
  await shot('geo_7_niebla_dentro');
  const nSale = (await en(0.16 + 60 / OBJ, 9, 0, 60), await J('__fog()'));
  if (!nSale.dentro && nSale.fade > 0 && nSale.fade < 1) ok(`al salir se va con fundido (${Math.round(nSale.fade * 100)}% de bruma quedando)`);
  else bad(`al salir del banco la niebla no se desvanece (${JSON.stringify(nSale)})`);
  const nDespues = (await en(0.25, 9, 0, 200), await J('__fog()'));
  if (!nDespues.dentro && nDespues.fade === 0) ok('y pasado el banco no aparece ninguno mas: el sorteo no suma bancos a la data');
  else bad(`despues del banco puesto aparecio otra niebla (${JSON.stringify(nDespues)})`);

  // LA TIERRA SE VE VENIR: la playa de 0.36 a 150 m adelante, el avion todavia sobre el mar.
  await en(0.36 - 150 / OBJ, 9, 0, 600);
  const gv = await vigilar(), fv = await J('__geofilas()');
  if (gv.bajo === 'sea' && (fv.tierra + fv.playa) > 0 && fv.mar > 0)
    ok(`la tierra SE VE VENIR: con el avion sobre el mar, el cuadro ya pinta ${fv.tierra} filas de tierra y ${fv.playa} de playa`);
  else bad(`la tierra no se ve desde el mar (bajo ${gv.bajo}, filas ${JSON.stringify(fv)})`);
  await shot('geo_1_viene');

  // LA PLAYA PASA POR ABAJO y el suelo cambia
  await en(0.36 + 60 / OBJ, 9, 0, 500);
  const gt = await vigilar();
  if (gt.bajo === 'land' && gt.tierraBajo) ok('pasada la playa, abajo hay TIERRA — y el vuelo lo sabe');
  else bad(`pasada la playa el vuelo no ve tierra (bajo ${gt.bajo}, tierraBajo ${gt.tierraBajo})`);
  await shot('geo_2_tierra');

  // EL VUELO LEE LA LOMA: se busca una loma alta y se vuela apenas encima — tiene que rozar.
  let alto = 0;
  for (let i = 0; i < 40 && alto < 1.2; i++) {
    await en(0.38 + i * 0.0018, 9, 0, 90);
    alto = (await vigilar()).altura;
  }
  if (alto >= 1.2) {
    await js(`__seaput(${(alto + 0.2).toFixed(2)}, 0)`);
    await sleep(220);
    const sc = JSON.parse(await js('__seadbg()')).scrapeT;
    if (sc > 0.02) ok(`sobre una loma de ${alto} m, volando a ${(alto + 0.2).toFixed(1)} el avion ROZA: el vuelo lee el relieve del tramo`);
    else bad(`sobre una loma de ${alto} m, a ${(alto + 0.2).toFixed(1)} m no rozo (scrapeT ${sc})`);
    for (let i = 0; i < 7; i++) { await js(`__seaclear(); __seaput(${(alto + 4).toFixed(2)}, 0)`); await sleep(100); }
  } else bad(`no se encontro una loma de mas de 1,2 m en el tramo de tierra (max ${alto})`);

  // SOBRE TIERRA NO NACE NADA: se cruza el tramo entero sosteniendo el avion, y el sembrador tiene
  // que haber salteado sorteos (los que caian sobre tierra) sin dejar nada del mar en la turba.
  const s0 = (await G()).sinSiembra;
  for (let p = 0.37; p < 0.46; p += 0.004) { await en(p, 9, 0, 140); await vigilar(); }
  const s1 = (await G()).sinSiembra;
  if (s1 > s0) ok(`sobre tierra el sembrador no siembra: ${s1 - s0} sorteos salteados en el tramo`);
  else bad('cruzando tierra el sembrador no salteo ningun sorteo');
  if (peorMar === 0) ok('y nunca hubo nada del mar parado sobre tierra (ni una ola en la turba)');
  else bad(`quedaron ${peorMar} cosas del mar sobre tierra`);

  // LA COSTA, DE LOS DOS LADOS
  await en(0.25, 9, -30, 400);
  const ci = await G();
  await en(0.25, 9, 30, 400);
  const cd = await G();
  if (ci.tierraBajo && !cd.tierraBajo) ok('costa IZQUIERDA: a 30 m a la izquierda hay tierra, a la derecha agua');
  else bad(`la costa izquierda no se lee (izq ${ci.tierraBajo}, der ${cd.tierraBajo})`);
  await shot('geo_3_costa_izq');
  await en(0.60, 9, 30, 400);
  const di = await G();
  await en(0.60, 9, -30, 400);
  const dd = await G();
  if (di.tierraBajo && !dd.tierraBajo) ok('costa DERECHA: el espejo — tierra a la derecha, agua a la izquierda');
  else bad(`la costa derecha no se lee (der ${di.tierraBajo}, izq ${dd.tierraBajo})`);
  await en(0.60, 9, 0, 300);
  await shot('geo_4_costa_der');

  // LA ORILLA ENTRA Y SALE: pegado al principio de la costa todavia es todo agua
  const orilla = await J('__geoen(0.2005, -30)');
  if (!orilla.tierra) ok(`la costa no aparece de golpe: al entrar la orilla esta afuera (${orilla.orilla} m), todo agua`);
  else bad(`al entrar a la costa ya hay tierra a 30 m (orilla ${orilla.orilla})`);

  // DOS CAPTURAS DE LA PLAYA QUE CRUZA, al final a proposito: la entrada al radar de t17 cae justo
  // antes de la tierra de la demo y su barrido tiñe el cuadro de verde — la primera captura de
  // arriba no deja juzgar el terreno. Aca el barrido ya paso.
  //
  // Y SE SACAN RAPIDO: el avion va a ~130 m/s, asi que entre el salto y la foto (sostenerlo + los
  // 250 ms de `shot`) recorre mas de cien metros. Sostenerlo 700 ms dejaba la playa DEBAJO del
  // avion en vez de adelante — la foto mentia sobre lo que se estaba probando.
  if (OUT) {
    await en(0.46 - 170 / OBJ, 9, 0, 120);   // la tierra de la demo termina en 0.46 (0.54 es donde entra la costa der)
    await shot('geo_5_playa_sale');
    await en(0.36 - 170 / OBJ, 9, 0, 120);
    await shot('geo_6_playa_entra');
  }

  // ---------- G4. LA ISLA (vuelta: 1.50-1.58 entera, 1.64-1.70 parcial, 1.76-1.80 farallon) ----------
  console.log('\nG4. la isla:');
  const isl = await J('__islas()');
  if (isl.n === 3) ok(`tres islas cargadas: ${isl.islas.map(i => `${i.borde} ${i.alto} m (${i.m === 'todo' ? 'de lado a lado' : 'parcial'})`).join(' · ')}`);
  else bad(`se esperaban 3 islas y hay ${isl.n}`);
  // SE VE VENIR: con la isla naciendo a SPAWN_Z (320 m) la cumbre ya esta arriba del horizonte, y a
  // un kilometro ya se dibuja
  await en(1.50 - 1000 / OBJ, 3, 0, 150);
  const lejos = await J('__islas()');
  if (lejos.rebanadas > 0) ok(`a un kilometro la isla ya se dibuja (${lejos.rebanadas} rebanadas, la mas lejana a ${lejos.lejos} m)`);
  else bad('a un kilometro la isla no se dibuja');
  await en(1.50 - 330 / OBJ, 3, 0, 100);
  const viene = await J('__islas()');
  // (el criterio del plan: que se PROYECTE por encima. Son pocos pixeles y es la escala del juego —
  // 14 m a 500 m con el ojo a 5,6 m y F = 135 dan 2 px—, la misma de las barreras de roca)
  if (viene.cumbreY !== null && viene.cumbreY < viene.hor) ok(`desde SPAWN_Z la cumbre ASOMA sobre el horizonte (${viene.hor - viene.cumbreY} px por encima): no es una trampa`);
  else bad(`desde SPAWN_Z la cumbre no asoma (cumbreY ${viene.cumbreY}, horizonte ${viene.hor})`);
  if (OUT) await shot('geo_11_isla_viene');
  // POR ENCIMA SE PASA
  const cima = +(await J('__geoen(1.54, 0)')).altura;
  await en(1.535, cima + 5, 0, 900);
  const ge = await G(), eE = await estado();
  if (eE === 'play' && ge.tierraBajo && ge.altura > 6) ok(`por encima se pasa: abajo hay isla (${ge.altura} m de tierra) y el avion sigue volando`);
  else bad(`sobre la isla: estado ${eE}, tierra ${ge.tierraBajo}, altura ${ge.altura}`);
  if (OUT) { await en(1.52, cima + 4, 0, 120); await shot('geo_12_isla_encima'); }
  // LA PARCIAL: por el canal de la derecha se pasa a ras, sin subir
  await en(1.662, 2.4, 26, 1000);
  const gc = await G(), eC = await estado();
  if (eC === 'play' && !gc.tierraBajo) ok('la parcial: por el canal de la derecha, a ras (2,4 m), se pasa sin subir');
  else bad(`por el canal: estado ${eC}, tierra abajo ${gc.tierraBajo}`);
  const gi = await J('__geoen(1.67, -25)');
  if (gi.tierra && gi.altura > 6) ok(`...y a la izquierda del canal esta la isla (${gi.altura} m)`);
  else bad(`la parcial no tapa la izquierda (${JSON.stringify(gi)})`);
  if (OUT) { await en(1.64 - 150 / OBJ, 3, 20, 120); await shot('geo_13_isla_canal'); await en(1.76 - 220 / OBJ, 4, 0, 120); await shot('geo_14_farallon'); }

  // ---------- G3. ACANTILADOS Y BARRERAS POR TRAMO (0.70 → 0.90, y 1.10 → 1.44) ----------
  // Va AL FINAL porque termina en una muerte a proposito (contra la roca), y despues de morir la
  // corrida ya no es la misma.
  console.log('\nG3. acantilados y barreras por tramo:');
  const PZ = 14;
  const W = f => f * OBJ;
  const zzAlto = async (wz, lado) => +(await js(`__zzalto(${wz}, ${lado})`));
  await en(0.73, 9, 0, 200);
  const zd = await J('__zzdbg()');
  if (zd.on && zd.fuente === 'geografia' && zd.ventanas && zd.ventanas.length === 5)
    ok(`el zigzag lo pone la geografia: ${zd.ventanas.length} ventanas (${zd.ventanas.map(v => v.lado).join(', ')}), carril recto (curv ${zd.curv})`);
  else bad(`el zigzag no tomo la geografia (${JSON.stringify(zd).slice(0, 160)})`);
  const lados = async f => [await zzAlto(W(f), -1) > 0, await zzAlto(W(f), 1) > 0];
  const [i1, d1] = await lados(0.73), [i2, d2] = await lados(0.80), [i3, d3] = await lados(0.87), [i4, d4] = await lados(0.60);
  if (i1 && !d1) ok('0.73: roca a la izquierda, mar abierto a la derecha'); else bad(`0.73: izq ${i1} der ${d1}`);
  if (i2 && d2) ok('0.80: el estrecho, roca de los dos lados'); else bad(`0.80: izq ${i2} der ${d2}`);
  if (!i3 && d3) ok('0.87: la izquierda se abrio, roca a la derecha'); else bad(`0.87: izq ${i3} der ${d3}`);
  if (!i4 && !d4) ok('0.60 (costa, sin paredes): nada'); else bad(`0.60: izq ${i4} der ${d4}`);
  // LA JUNTURA izq -> ambos no hunde la pared izquierda: se barre de a 6 m alrededor del 0.76
  let hundida = 99;
  for (let wz = W(0.76) - 60; wz <= W(0.76) + 60; wz += 6) hundida = Math.min(hundida, await zzAlto(wz, -1));
  if (hundida > 6) ok(`la pared izquierda sigue de largo en la juntura (minimo ${hundida.toFixed(1)} m)`);
  else bad(`la pared izquierda se hunde en la juntura: ${hundida.toFixed(1)} m`);
  if (OUT) { await en(0.72, 9, 0, 120); await shot('geo_8_acantilado_izq'); }

  // EL PUENTE: donde esta, y se pasa por abajo
  let pz = null;
  for (let wz = W(0.76); wz < W(0.84); wz += 4) if (await js(`__zzbarrAt(${wz})`)) { pz = wz; break; }
  const pb = pz ? JSON.parse(await js(`__zzbarrAt(${pz})`)) : null;
  if (pb && pb.tipo === 'puente') ok(`el puente esta PUESTO a ${((pz - W(0.76)) | 0)} m de la entrada al estrecho (panza a ${pb.y0} m)`);
  else bad(`no hay puente en el estrecho (${JSON.stringify(pb)})`);
  if (pb) {
    if (OUT) { await en((pz - 160 - PZ) / OBJ, 4, 0, 100); await shot('geo_9_puente'); }
    await en((pz - 90 - PZ) / OBJ, Math.max(3, pb.y0 - 5), 0, 1300);
    const e1 = await estado();
    if (e1 === 'play') ok(`por debajo del puente (a ${Math.max(3, pb.y0 - 5).toFixed(1)} m) se pasa`);
    else bad(`pasando por abajo del puente el estado quedo en '${e1}'`);
  }
  if (OUT) { await en(1.14, 9, 0, 120); await shot('geo_10_acantilado_tierra'); }

  // DEL LADO ABIERTO SE PASA, PEGADO AL BORDE: 0.73 con el avion a +37 (FLY_X 38) y a ras
  await en(0.72, 2, 37, 900);
  const e2 = await estado();
  if (e2 === 'play') ok('0.72, a ras contra el borde derecho (el lado abierto): se pasa');
  else bad(`del lado abierto el estado quedo en '${e2}'`);

  // Y CONTRA LA PARED SE MUERE. Se busca una punta que se meta hasta donde llega el avion (la cara a
  // 1,5 m, adentro de x = -34) y se lo planta ahi, a ras. Es la ultima prueba: despues de esto la
  // corrida ya perdio un avion.
  let punta = null;
  for (let wz = W(0.71); wz < W(0.755); wz += 5) {
    if (+(await js(`__zzcara(${wz}, -1, 1.5)`)) < 30) { punta = wz; break; }
  }
  if (punta === null) bad('no hay ninguna punta en el acantilado izquierdo que llegue al carril del avion');
  else {
    await js(`__wjump(${(punta - PZ - 30) / OBJ})`);
    let murio = false;
    for (let i = 0; i < 25 && !murio; i++) {
      await js(`__seaclear(); __seaput(1.5, -36)`);
      await sleep(40);
      murio = (await estado()) !== 'play';
    }
    // y de QUE se murio: la ladera, no el agua ni otra cosa (la sonda de las causas de derrota)
    const causa = murio ? JSON.parse(await js('__seawolf()')).causa : null;
    if (murio && causa === 'death_pared') ok(`contra la roca de la izquierda (punta a ${((punta - W(0.70)) | 0)} m del tramo) se muere: ${causa}`);
    else bad(`contra la punta de la izquierda: murio ${murio}, causa ${causa}`);
  }

  // G4 · A RAS CONTRA EL FARALLON SE CHOCA. Despues de la muerte de G3 viene el siguiente de la fila
  // (IDA Y VUELTA vuela en escuadron); se espera a volver a volar y se lo planta a ras frente a la cara.
  console.log('\nG4. contra la isla:');
  let vuelve = false;
  for (let i = 0; i < 60 && !vuelve; i++) { vuelve = (await estado()) === 'play'; if (!vuelve) { await tap('Return'); await sleep(200); } }
  if (!vuelve) bad('despues de la muerte de G3 no volvio a volar el siguiente de la fila');
  else {
    await js(`__wjump(${(W(1.76) - PZ - 40) / OBJ})`);
    let choco = false;
    for (let i = 0; i < 30 && !choco; i++) {
      await js('__seaclear(); __seaput(2.4, 0)');
      await sleep(40);
      choco = (await estado()) !== 'play';
    }
    const causa = choco ? JSON.parse(await js('__seawolf()')).causa : null;
    if (choco && causa === 'death_land') ok(`a ras contra el farallon se choca: ${causa}`);
    else bad(`contra el farallon: choco ${choco}, causa ${causa}`);
  }

  // ---------- G5. EN KILOMETROS (?geo=km, data/geografias.js) ----------
  // Se recarga t17 con la geografia escrita en km y se pregunta al terreno en los km que dice la
  // data: la isla de la ida va de 2,4 a 2,9 km; la tierra de la vuelta, de 0,6 a 1,4 km pasado el
  // buque. Y `?geo=ninguna` apaga la geografia de la mision.
  console.log('\nG5. la geografia en kilometros:');
  if (!await volar('&geo=km')) bad('no se pudo volar t17 con ?geo=km');
  else {
    const gk = await G();
    const KM = gk.obj / 1000;
    const frac = km => km / KM;
    const isla = await J(`__geoen(${frac(2.65)}, 0)`), antes = await J(`__geoen(${frac(2.3)}, 0)`);
    const tierra = await J(`__geoen(${1 + frac(1.0)}, 0)`), mar = await J(`__geoen(${1 + frac(0.3)}, 0)`);
    if (gk.activa && gk.tramos.length === 12) ok(`cargada: ${gk.tramos.length} tramos (7 de ida y 5 de vuelta) sobre ${KM} km`);
    else bad(`la geografia en km no cargo bien (${JSON.stringify(gk).slice(0, 140)})`);
    if (isla.tierra && isla.altura > 3 && !antes.tierra) ok(`la isla de la ida esta a los 2,65 km (${isla.altura} m) y a los 2,3 todavia es mar`);
    else bad(`la isla de la ida no esta donde dice (2,65: ${JSON.stringify(isla)} · 2,3: ${JSON.stringify(antes)})`);
    if (tierra.suelo === 'land' && mar.suelo === 'sea') ok('en la vuelta, a 1 km del buque hay tierra y a 0,3 km mar: los km se cuentan desde el blanco');
    else bad(`la vuelta no cae donde dice (1 km: ${tierra.suelo} · 0,3 km: ${mar.suelo})`);
  }
  if (!await volar('&geo=ninguna')) bad('no se pudo volar t17 con ?geo=ninguna');
  else {
    const gn = await G();
    if (!gn.activa) ok('?geo=ninguna: la mision sin geografia');
    else bad('?geo=ninguna dejo una geografia cargada');
  }

  // ---------- EL BLANCO ESTRUCTURA (t18 · IDA Y VUELTA SMALL 2) ----------
  // La BASE COSTERA en su explanada de tierra, con la misma suelta que el buque. Se encara a 12 m y
  // se suelta ADENTRO de la ventana (no en su primer cuadro: ahi el envion que hace falta es todo el
  // presupuesto, y el avion sostenido a mano por la sonda cae un poco mientras la tecla esta apretada).
  console.log('\nEL BLANCO ESTRUCTURA (t18):');
  if (!await volar('', 't18')) bad('no se pudo volar t18');
  else {
    const OBJ18 = (await G()).obj;
    const bajo = await J('__geoen(1, 0)');
    await en(1 - 1500 / OBJ18, 12, 0, 200);
    let s = await J('__suelta()');
    if (bajo.tierra && s.enAtaque && s.altIdeal && s.altIdeal[0] > 8)
      ok(`la base esta en tierra (explanada a ${bajo.altura} m) y la banda de soltar se corre con el piso (${s.altIdeal.map(v => v.toFixed(1)).join('–')} m)`);
    else bad(`el blanco estructura no se armo (${JSON.stringify({ bajo, enAtaque: s.enAtaque, alt: s.altIdeal })})`);
    // a 700 m: de 1500 al alcance de la ventana son ~18 s de vuelo, mas que lo que dura el lazo
    await en(1 - 700 / OBJ18, 12, 0, 120);
    let solto = false, res = '';
    for (let i = 0; i < 600; i++) {
      await js('__seaclear(); __seaput(12, 0)');
      s = await J('__suelta()');
      if (!solto && s.listo && s.extra < 110) { down('Z'); await js('__seaput(12, 0)'); await sleep(30); up('Z'); solto = true; }
      if (s.res === 'hundido' || s.hundido) { res = 'hundido'; break; }
      if (s.st !== 'play' || s.d < 10) { res = s.res; break; }
      await sleep(25);
    }
    if (OUT) await shot('geo_15_base_destruida');
    if (solto && res === 'hundido') ok('soltando en la ventana, la bomba le pega a la base y la destruye');
    else bad(`la suelta contra la base: solto ${solto}, resultado '${res}'`);
  }

  console.log('\nconsola: ' + (errors.length ? errors.length + ' error(es)' : 'sin errores'));
  for (const e of errors.slice(0, 8)) console.error('   ' + e);
  console.log(fails || errors.length ? `\nFIXTURE GEOGRAFIA: FALLA (${fails})\n` : '\nFIXTURE GEOGRAFIA: OK\n');
  app.exit(fails || errors.length ? 1 : 0);
}).catch(e => { console.error('reventó:', e); app.exit(1); });
process.on('unhandledRejection', e => { console.error('REJECTION:', e && e.message); app.exit(1); });
