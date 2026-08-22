// LA VARA DEL PESO — el fixture del DIRECTOR (docs/sistemas/PLAN_CINE_PESO.md, fase P0).
//   npm run cine                 · traza TODAS las cinematicas de data/cines.js
//   npm run cine -- pulso_premio · traza una sola
//   CINE_SHOTS=/tmp/x npm run cine   · deja capturas
//
// QUE MIDE, Y POR QUE. «Muy dura» es una sensacion, y una sensacion no cierra una fase. Esto la
// convierte en numeros trazando la cinematica CUADRO A CUADRO por sonda (`__cdbg`) y midiendo dos
// familias de cosas:
//
//   1. QUE SE MUEVE — cuanto cambian altura, carril, distancia recorrida y camara de punta a
//      punta. Un avion que no cambia de altura ni de posicion en toda una cinematica no esta
//      volando: esta girando en el lugar sobre una foto. Es EL diagnostico del plan (§0).
//   2. CUANTO SALTA — el maximo de |Δ| de alabeo, cabeceo, rolido y camara entre dos lecturas
//      seguidas. Es la definicion operativa de DURO: lo que pega un tiron es lo que cambia mucho
//      de golpe. OJO CON LA UNIDAD: se mide POR LECTURA (~60 ms, no por cuadro) — la sonda se
//      consulta por IPC y pedirla a 60 Hz mediria el IPC, no la cinematica. Sirve para COMPARAR
//      dos versiones con la misma vara, no como angulo por cuadro absoluto.
//
// QUE HACE FALLAR (P5). Lo ESTRUCTURAL: que la cinematica cargue, corra, termine, no ensucie la
// consola y —desde que existe la cama de vuelo— que el avion se MUEVA, el mundo AVANCE y la camara
// no quede clavada. Una timeline nueva que se olvide del verbo `vuelo` cae aca, que es el punto:
// el catalogo es red de regresion DEL PESO, no solo de "carga sin errores".
//
// Los SALTOS quedan como informacion con un techo generoso (`TECHO`): sirven para comparar dos
// versiones, no como norma — el cabeceo salta 1,0 por las poses de moves.js y eso es el juego, no
// un defecto de la cinematica (PLAN_CINE_PESO §7, divergencia 11).
const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const ROOT = path.join(__dirname, '..');
const OUT = process.env.CINE_SHOTS || '';
const SOLO = process.argv.slice(2).filter(a => !a.startsWith('-'))[0] || '';
// Techos de salto: no son "lo bueno", son lo PATOLOGICO — un giro de mas de dos radianes entre dos
// lecturas o una camara que se corre tres unidades de golpe es un teletransporte, no un movimiento.
const TECHO = { roll: 2.0, bank: 1.2, pitch: 1.2, camy: 3.0 };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const errors = [];
let win, fails = 0;
const bad = m => { console.error('   ✗ ' + m); fails++; };
const ok = m => console.log('   ✓ ' + m);
const inf = m => console.log('     ' + m);
const js = s => win.webContents.executeJavaScript(s);
const C = async () => JSON.parse(await js('String(window.__cdbg && window.__cdbg())') || 'null');

/** Reproduce una cinematica por la MISMA puerta que aprieta el jugador (el menu CINEMATICAS) y la
 *  TRAZA hasta que termina. Devuelve la traza cruda y el resumen medido. */
async function trazar(id) {
  await win.loadURL('file://' + path.join(ROOT, 'src', 'index.html'));
  await sleep(2200);
  const r = JSON.parse(await js(`String(window.__cine(${JSON.stringify(id)}))`) || 'null');
  if (!r) { bad(`${id}: no se pudo reproducir (¿declara \`ver\`?)`); return null; }
  const tr = [];
  for (let k = 0; k < 200; k++) {
    const c = await C();
    if (!c || c.on === false) break;              // la cinematica termino y cerro
    if (c.id) tr.push(c);
    if (c.fin) break;
    await sleep(60);
  }
  if (tr.length < 4) { bad(`${id}: la traza salio vacia (${tr.length} lecturas)`); return null; }
  // ---- 1. QUE SE MUEVE (recorridos de punta a punta)
  const rango = k => { const v = tr.map(x => x[k]).filter(x => typeof x === 'number'); return Math.max(...v) - Math.min(...v); };
  const mov = { alt: rango('alt'), x: rango('x'), dist: rango('dist'), camy: rango('camy'), camx: rango('camx') };
  // ---- 2. CUANTO SALTA (el maximo |Δ| entre dos cuadros seguidos)
  // LOS ANGULOS SE MIDEN DANDO LA VUELTA. Un SPLIT-S termina su rolido en 2π y `moves.js` lo
  // devuelve a 0 al soltar el avion: crudo, eso es un salto de 6,24 rad — y en pantalla no se ve
  // NADA, porque 2π es el mismo angulo que 0. Medir sin envolver convertia la maniobra mas comun
  // del premio en la mas dura de todas, que es justo al reves de lo que hay que detectar.
  const env = d => { const p2 = Math.PI * 2; let x = (d + Math.PI) % p2; if (x < 0) x += p2; return Math.abs(x - Math.PI); };
  const salto = (k, ang) => {
    let m = 0;
    for (let i = 1; i < tr.length; i++) {
      const a = tr[i - 1][k], b = tr[i][k];
      if (typeof a === 'number' && typeof b === 'number') m = Math.max(m, ang ? env(b - a) : Math.abs(b - a));
    }
    return m;
  };
  const sal = { bank: salto('bank'), pitch: salto('pitch'), roll: salto('roll', true), camy: salto('camy') };
  return { id, tr, mov, sal, partes: [...new Set(tr.map(x => x.parte).filter(Boolean))] };
}

app.whenReady().then(async () => {
  console.log('\nFIXTURE — EL DIRECTOR: la vara del peso (PLAN_CINE_PESO P0)\n');
  win = new BrowserWindow({ width: 1280, height: 760, show: false, webPreferences: { backgroundThrottling: false } });
  win.webContents.on('console-message', (e, l, m) => { if (l >= 3 && !m.includes('Security Warning')) errors.push(m.slice(0, 300)); });
  win.webContents.on('render-process-gone', (e, d) => errors.push('EL RENDERER MURIO: ' + JSON.stringify(d)));

  await win.loadURL('file://' + path.join(ROOT, 'src', 'index.html'));
  await sleep(2200);
  const ids = JSON.parse(await js('String(window.__cine())') || '[]').filter(i => !SOLO || i === SOLO);
  if (!ids.length) { console.error('   ✗ no hay cinematicas que trazar'); app.exit(1); return; }
  console.log(`catalogo: ${ids.length} cinematica(s) — ${ids.join(', ')}\n`);

  for (const id of ids) {
    console.log(`${id}:`);
    const R = await trazar(id);
    if (!R) continue;
    const last = R.tr[R.tr.length - 1];
    ok(`corre y termina · ${last.t}s · ${R.tr.length} lecturas · partes: ${R.partes.join(' → ')}`);
    // LO QUE SE MUEVE. Todavia no es una falla (el peso llega en P2/P3): es LA MEDICION que hay
    // que poder comparar antes y despues, y el renglon que hace evidente el diagnostico del §0.
    inf(`se mueve  · altura ${R.mov.alt.toFixed(2)} m · carril ${R.mov.x.toFixed(2)} · avance ${R.mov.dist} m · camara ${R.mov.camy.toFixed(2)}`);
    inf(`salta max (por lectura ~60 ms) · alabeo ${R.sal.bank.toFixed(3)} · cabeceo ${R.sal.pitch.toFixed(3)} · rolido ${R.sal.roll.toFixed(3)} · camara ${R.sal.camy.toFixed(3)}`);
    // ---- LA RED (P5). Tres cosas estructurales; las tres son "te olvidaste del verbo `vuelo`".
    if (R.mov.alt < 0.05 && R.mov.x < 0.05)
      bad(`${id}: el avion NO SE MOVIO de lugar en toda la cinematica — falta el verbo \`vuelo\` (PLAN_CINE_PESO §0, causa 1)`);
    else ok(`el avion vuela: ${R.mov.alt.toFixed(1)} m de altura y ${R.mov.x.toFixed(1)} de carril`);
    if (R.mov.dist < 1)
      bad(`${id}: el mundo NO AVANZO — sin mar corriendo no hay sensacion de vuelo (causa 3)`);
    else ok(`el mundo corre debajo: ${R.mov.dist} m`);
    if (R.mov.camy < 0.01)
      bad(`${id}: la camara quedo CLAVADA — su retardo ES el peso del PASILLO (causa 4)`);
    else ok(`la camara persigue: ${R.mov.camy.toFixed(1)} de recorrido`);
    for (const k in TECHO) {
      if (R.sal[k] > TECHO[k]) bad(`${id}: ${k} salta ${R.sal[k].toFixed(2)} entre dos lecturas (techo ${TECHO[k]}): eso es un teletransporte`);
    }
    // …y la TRAZA, para poder mirarla al lado de la de la fase anterior
    if (process.env.CINE_TRAZA) for (const c of R.tr)
      inf(`${String(c.t).padStart(5)}s ${String(c.parte).padEnd(8)} alt=${c.alt} x=${c.x} bank=${c.bank} roll=${c.roll} mv=${c.mv} cam=${c.camy}`);
    if (OUT) {
      const half = R.tr[Math.floor(R.tr.length / 2)];
      fs.writeFileSync(path.join(OUT, 'cine_' + id + '.png'), (await win.webContents.capturePage()).toPNG());
      inf(`captura al final (${half.parte} a la mitad)`);
    }
    console.log('');
  }

  console.log('consola: ' + (errors.length ? errors.length + ' error(es)' : 'sin errores'));
  for (const e of errors.slice(0, 8)) console.error('   ' + e);
  console.log(fails || errors.length ? `\nFIXTURE CINE: FALLA (${fails})\n` : '\nFIXTURE CINE: OK\n');
  app.exit(fails || errors.length ? 1 : 0);
}).catch(e => { console.error('reventó:', e); app.exit(1); });
process.on('unhandledRejection', e => { console.error('REJECTION:', e && e.message); app.exit(1); });
