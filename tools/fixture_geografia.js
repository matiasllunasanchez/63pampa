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
async function volar(extra) {
  await win.loadURL('file://' + path.join(ROOT, 'src', 'index.html') + '?mision=t17' + (extra || ''));
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
  console.log('\nFIXTURE — LA GEOGRAFIA DEL PASILLO (G0-G2)\n');
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
  if (g1.activa && g1.tramos && g1.tramos.length === 11) ok(`la demo esta cargada: ${g1.tramos.length} tramos sobre ${g1.obj} m de ida`);
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

  console.log('\nconsola: ' + (errors.length ? errors.length + ' error(es)' : 'sin errores'));
  for (const e of errors.slice(0, 8)) console.error('   ' + e);
  console.log(fails || errors.length ? `\nFIXTURE GEOGRAFIA: FALLA (${fails})\n` : '\nFIXTURE GEOGRAFIA: OK\n');
  app.exit(fails || errors.length ? 1 : 0);
}).catch(e => { console.error('reventó:', e); app.exit(1); });
process.on('unhandledRejection', e => { console.error('REJECTION:', e && e.message); app.exit(1); });
