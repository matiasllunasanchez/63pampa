// FIXTURE — EL TUTORIAL (data/tutorial.js + systems/tutorial.js), por la puerta del jugador.
//
//   1. El menu de modos tiene TUTORIAL arriba de HISTORIA; adentro, las tres etapas y ATRAS.
//   2. La ETAPA 1 se vuela ENTERA con teclas: un piloto automatico acepta cada linea congelada y cumple
//      cada consigna como lo haria un jugador (gas para subir, picada, rasante con gas a toques,
//      esquivar, rolar, poscombustion) y DESPEGA con el gas. Ninguna sonda adelanta un paso.
//   3. La ETAPA 2 igual: se alinea con cada globo de practica y le tira; traba el cañon y lo deja enfriar;
//      derriba al Harrier de practica.
//   4. La ETAPA 3: el tonel, la bomba en verde sobre el casco (las pasadas que hagan falta), la pausa guiada
//      de las piruetas y el aterrizaje con el tren abajo.
//   5. Al terminar cada una vuelve al menu del tutorial con la etapa HECHA y el cursor en la siguiente.
//
// Uso: npm run tutorial          (TUT_SHOTS=<carpeta> guarda capturas de cada paso; TUT_DESDE=2 vuela solo la 3)
const { app, BrowserWindow } = require('electron');
app.commandLine.appendSwitch('mute-audio');   // las herramientas corren SIN SONIDO (autor, 19/11)
const path = require('path');
const fs = require('fs');
const ROOT = path.join(__dirname, '..');
const OUT = process.env.TUT_SHOTS || '';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const errors = [];
let win, fails = 0;
const bad = m => { console.error('   ✗ ' + m); fails++; };
const ok = m => console.log('   ✓ ' + m);
const js = s => win.webContents.executeJavaScript(s);
const key = (k, down) => win.webContents.sendInputEvent({ type: down ? 'keyDown' : 'keyUp', keyCode: k });
const tap = async (k, ms = 170) => { key(k, true); await sleep(70); key(k, false); await sleep(ms); };
const TD = async () => JSON.parse(await js('String(window.__tutdbg())'));
const LB = async () => JSON.parse(await js('String(window.__librodbg())'));
const shot = async nombre => {
  if (!OUT) return;
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, nombre + '.png'), (await win.webContents.capturePage()).toPNG());
};

app.whenReady().then(async () => {
  console.log('\nFIXTURE — EL TUTORIAL\n');
  win = new BrowserWindow({ width: 1280, height: 760, show: false, webPreferences: { backgroundThrottling: false, partition: 'tut' + Date.now() } });
  win.webContents.on('console-message', (e, l, m) => { if (l >= 3 && !m.includes('Security Warning')) errors.push(m.slice(0, 600)); });
  await win.loadURL('file://' + path.join(ROOT, 'src', 'index.html') + '?qa');
  await sleep(2600);
  await tap('Return');                                      // portada → modos

  console.log('1. el menu:');
  for (let i = 0; i < 8 && JSON.parse(await js('__pausedbg()')).modo !== 'tutorial'; i++) await tap('Up');
  if (JSON.parse(await js('__pausedbg()')).modo === 'tutorial') ok('TUTORIAL esta en el menu de modos'); else { bad('no hay fila TUTORIAL'); return fin(); }
  await tap('Return');
  let d = await LB();
  if (JSON.stringify(d.filas) === JSON.stringify(['tut0', 'tut1', 'tut2', 'tut3', 'back'])) ok('adentro: las cuatro etapas (en DEV abiertas) y ATRAS');
  else bad('filas del tutorial: ' + JSON.stringify(d.filas));
  if (d.fila.id === 'tut' && d.fila.k === 0) ok('el cursor arranca en la etapa 1'); else bad('el cursor arranca en ' + JSON.stringify(d.fila));

  // LAS ETAPAS, con teclas: el piloto automatico (ver `volar`) — cada una con los pasos que tiene que ver
  const ETAPAS = [{ k: 0, pasos: 15, nombre: 'la etapa 1 (despegar y volar)' }, { k: 1, pasos: 12, nombre: 'la etapa 2 (pelear)' },
    { k: 2, pasos: 9, nombre: 'la etapa 3 (la pasada y la vuelta)' }];
  // TUT_DESDE=<k>: vuela solo desde esa etapa (para iterar sobre una; en DEV estan todas abiertas)
  const DESDE = +process.env.TUT_DESDE || 0;
  for (const et of ETAPAS.filter(e => e.k >= DESDE)) {
    console.log(`\n${et.k + 2}. ${et.nombre}, con teclas:`);
    for (let i = 0; i < 6; i++) { d = await LB(); if (d.fila.id === 'tut' && d.fila.k === et.k) break; await tap('Down'); }
    await tap('Return');
    const r = await volar(et.k);
    console.log('   pasos: ' + r.vistos.join(' → '));
    if (r.terminada) ok(`se termino en ${r.seg} s (consignas cumplidas: ${r.consignas})`);
    else bad(`no termino en ${r.seg} s (quedo en ${JSON.stringify(await TD())})`);
    if (r.felicito) ok('al final, la pantalla de ganaste'); else bad('no aparecio la pantalla de ganaste');
    if (r.vistos.length === et.pasos) ok(`pasaron los ${et.pasos} pasos`); else bad('pasos vistos: ' + r.vistos.length);
    if (et.k < 2) { if (!r.jetsVistos) ok('ningun caza enemigo en la etapa (solo los de practica)'); else bad('aparecieron ' + r.jetsVistos + ' cazas enemigos'); }
    if (et.k === 0) { if (r.fallasPista === 0) ok('despego a la primera, con el gas a fondo'); else bad('se quedo sin pista ' + r.fallasPista + ' veces'); }
    if (et.k === 1) { if (r.rotos >= 6) ok(`rompio ${r.rotos} blancos de practica (globos y el Harrier)`); else bad('blancos rotos: ' + r.rotos); }
    d = null;
    for (let i = 0; i < 40; i++) { d = await LB(); if (d.state === 'campmenu') break; await sleep(250); }
    const sig = Math.min(3, et.k + 1);   // (la etapa 4, LAS ISLAS, no la vuela el fixture: ver tools/ o la sonda)
    if (d && d.state === 'campmenu' && d.fila.id === 'tut' && d.fila.k === sig) ok(`vuelve al tutorial, sobre la etapa ${sig + 1}`);
    else bad('no volvio al tutorial: ' + JSON.stringify(d && { st: d.state, fila: d.fila }));
  }
  const hecha = await js('String(localStorage.getItem("rasante_tutorial"))');
  if (DESDE) ok('(desde la etapa ' + (DESDE + 1) + ': sin chequeo del guardado entero)');
  else if (/0/.test(hecha) && /1/.test(hecha) && /2/.test(hecha)) ok('las tres etapas quedaron guardadas como hechas'); else bad('guardado: ' + hecha);
  fin();
});

/** EL PILOTO AUTOMATICO de una etapa: acepta cada linea congelada y cumple cada consigna como un jugador. */
async function volar(k) {
  const t0 = Date.now(), vistos = [], consignas = new Set(), fotos = new Set();
  const abajo = {};                                          // las teclas sostenidas, por eje
  const sostener = async (eje, k2) => { if (abajo[eje] === k2) return; if (abajo[eje]) key(abajo[eje], false); abajo[eje] = k2; if (k2) key(k2, true); };
  const soltarTodo = async () => { for (const e of Object.keys(abajo)) await sostener(e, null); };
  let ultimoPaso = -1, terminada = false, fallasPista = 0, s = null, jetsVistos = 0, felicito = false;
  while (Date.now() - t0 < 300000) {
    s = await TD();
    if (s.st === 'campmenu') break;
    fallasPista = s.fallas;
    jetsVistos = Math.max(jetsVistos, s.jets || 0);
    // TUT_LOG=1: una linea por segundo con lo que importa de la pasada (para depurar la etapa 3)
    if (process.env.TUT_LOG && Date.now() - (volar.logT || 0) > 1000) {
      volar.logT = Date.now();
      const su = JSON.parse(await js('String(window.__suelta ? window.__suelta() : "{}")'));
      console.log('   · ' + JSON.stringify({ t: Math.round((Date.now() - t0) / 1000), st: s.st, paso: s.id, fase: s.fase, sub: s.sub, alt: s.alt, bl: s.bl, res: su.res, d: su.d, hund: su.hundido, esc: su.esc }));
    }
    if (s.finT >= 0) { terminada = true; await soltarTodo(); await sleep(300); continue; }
    // LA PANTALLA DE GANASTE (18/11): felicita, y ENTER sigue al menu del tutorial
    if (s.st === 'results') {
      terminada = true; felicito = true; await soltarTodo();
      if (OUT && !fotos.has('fin')) { fotos.add('fin'); await sleep(2500); await shot('e' + (k + 1) + '_fin'); }
      await tap('Return', 700); continue;
    }
    if (s.paso !== ultimoPaso && s.id) { ultimoPaso = s.paso; vistos.push(s.id); }
    const pre = 'e' + (k + 1) + '_' + String(s.paso).padStart(2, '0');
    if (OUT && s.dlg && !fotos.has('d' + s.paso)) { fotos.add('d' + s.paso); await sleep(900); await shot(pre + 'a_' + s.id); }
    if (OUT && s.consigna && !fotos.has('c' + s.paso + s.sub)) { fotos.add('c' + s.paso + s.sub); await sleep(500); await shot(pre + 'b_' + s.consigna.clave); }
    if (s.dlg) { await soltarTodo(); await tap('Return', 120); await tap('Return', 380); continue; }
    // LA PAUSA GUIADA: se mira y se cierra (ESC vuelve de CONTROLES al menu, y del menu al vuelo)
    if (s.paused) { await soltarTodo(); await sleep(600); await tap('Escape', 400); continue; }
    if (s.st !== 'play' && s.st !== 'takeoff' && s.st !== 'landing') { await sleep(150); continue; }
    const c = s.consigna && s.consigna.hecho ? null : s.consigna;
    if (c) consignas.add(c.clave);
    const clave = c ? c.clave : null;
    const b = s.blanco;
    if (s.landing) {
      // LA APROXIMACION: el tren abajo enseguida y un poco de gas para no llegar picado
      await sostener('lado', null); await sostener('fuego', null);
      if (!s.tren) await tap('T', 200);
      await sostener('alt', s.alt < 4 && !s.tren ? null : (Date.now() % 900) < 350 ? 'W' : null);
      await sleep(60); continue;
    }
    if (clave === 'tutC_suelta' || clave === 'tutC_hunde') {
      // LA SUELTA: a la altura de la banda verde (la flecha del blanco dice si subir o bajar), en la linea
      // del buque, y la bomba cuando esta en verde
      const bl = s.bl;
      if (bl) {
        const dx = bl.x - s.x;
        await sostener('lado', dx < -1 ? 'A' : dx > 1 ? 'D' : null);
        // la altura a la banda verde, sin pasarse: la flecha del blanco corre el objetivo, y el gas se da a toques
        // (sostenido sube de golpe y se pasa — medido, oscilaba entre 2 y 21 m)
        volar.objAlt = bl.alt > 0 ? s.alt + 2 : bl.alt < 0 ? s.alt - 2 : (volar.objAlt || 11);
        await sostener('alt', s.alt < volar.objAlt - 0.5 && (Date.now() % 300) < 170 ? 'W' : null);
        if (bl.listo) {
          await tap('Z', 150);
          if (process.env.TUT_LOG) { const a0 = JSON.parse(await js('String(window.__suelta())')); await sleep(3500); const a1 = JSON.parse(await js('String(window.__suelta())'));
            console.log(`   Z en verde a ${Math.round(a0.d)} m, alt ${a0.alt.toFixed(1)} → res '${a1.res}' hundido ${a1.hundido} dano ${a1.dano}`); }
        }
      } else { if (s.alt < 9) await sostener('alt', 'W'); else if (s.alt > 14) await sostener('alt', null); }
      await sleep(60); continue;
    }
    // EL RASANTE (19/11): PERFECTO a 3–5 m; en el estado, un toque de gas cuando la aguja cruza el medio del azul;
    // y soltarlo picando
    if (clave === 'tutC_perfecto') {
      await sostener('lado', null); await sostener('fuego', null);
      if (process.env.TUT_AGU && Date.now() - (volar.aguT || 0) > 400) { volar.aguT = Date.now(); console.log('   perf ' + await js('String(window.__agudbg())') + ' alt ' + s.alt); }
      await sostener('alt', s.alt < 3.6 && (Date.now() % 260) < 110 ? 'W' : null); await sleep(30); continue;
    }
    if (clave === 'tutC_aciertos') {
      await sostener('lado', null); await sostener('fuego', null);
      const g = JSON.parse(await js('String(window.__agudbg())'));
      if (process.env.TUT_AGU && Date.now() - (volar.aguT || 0) > 250) { volar.aguT = Date.now(); console.log('   agu ' + JSON.stringify(g) + ' alt ' + s.alt + ' st ' + s.st); }
      if (!g.on) { await sostener('alt', s.alt < 3.6 && (Date.now() % 260) < 110 ? 'W' : null); await sleep(30); continue; }
      await sostener('alt', null);
      if (g.armado && g.pos > g.sec + g.w * 0.2 && g.pos < g.sec + g.w * 0.8) { key('W', true); await sleep(35); key('W', false); await sleep(60); }
      else await sleep(8);
      continue;
    }
    if (clave === 'tutC_esquiva') {
      // al costado de los globos (vienen en tu linea): lejos de la x del mas cercano
      await sostener('fuego', null);
      const g = s.blanco; const dx = g ? g.x - s.x : 0;
      await sostener('lado', g && Math.abs(dx) < 4 ? (dx > 0 ? 'A' : 'D') : null);
      await sostener('alt', s.alt < 2.5 ? 'W' : null); await sleep(40); continue;
    }
    if (clave === 'tutC_soltaRas') { await sostener('alt', null); await tap('S', 400); await sleep(100); continue; }
    if (clave === 'tutC_secTanque') await tap('1', 300);
    if (clave === 'tutC_secBomba') await tap('2', 300);
    if (clave === 'tutC_momentum') await tap('4', 400);
    if (clave === 'tutC_chancha') await tap('J', 400);
    if (clave === 'tutC_tonel') { await sostener('lado', null); await tap('Left', 70); await tap('Left', 70); await tap('Left', 600); }
    if (clave === 'tutC_sal' || clave === 'tutC_hielo') await sostener('alt', s.alt < 485 ? 'W' : null);   // adentro de la nube (ALTO.NUBES 480)
    else if (clave === 'tutC_subi' || clave === 'tutC_radarSube') await sostener('alt', 'W');
    else if (clave === 'tutC_baja' || clave === 'tutC_radarBaja') await sostener('alt', 'S');
    else if (b && clave) {
      // A UN BLANCO: a su costado y a su altura, y fuego cuando esta en la linea
      const dx = b.x - s.x, dy = b.y - s.alt;
      await sostener('lado', dx < -0.8 ? 'A' : dx > 0.8 ? 'D' : null);
      if (dy > 0.6) await sostener('alt', 'W'); else if (dy < -0.8) await sostener('alt', null);
      await sostener('fuego', Math.abs(dx) < 2.5 && Math.abs(dy) < 2 && b.z < 260 ? 'X' : null);
    } else {
      await sostener('lado', null);
      // EL RASANTE A MANO: gas a toques entre 9 y 14 m (el techo del radar es 20)
      if (s.alt < 9) await sostener('alt', 'W'); else if (s.alt > 14) await sostener('alt', null);
      if (clave === 'tutC_calienta') await sostener('fuego', s.over ? null : 'X');
      else await sostener('fuego', null);
      if (clave === 'tutC_esquivar') { await tap('A', 250); await tap('D', 250); }
      else if (clave === 'tutC_rolar') { key('Left', true); await sleep(600); key('Left', false); await sleep(200); key('Right', true); await sleep(600); key('Right', false); await sleep(200); }   // (21/11: rolar pide SOSTENER 0,4 s)
      else if (clave === 'tutC_turbo') { key('Shift', true); await sleep(400); key('Shift', false); }
    }
    await sleep(60);
  }
  await soltarTodo();
  return { felicito, jetsVistos, vistos, terminada, fallasPista, seg: Math.round((Date.now() - t0) / 1000), consignas: consignas.size, rotos: s ? s.rotos : 0 };
}

function fin() {
  console.log('\nconsola:');
  if (errors.length) errors.slice(0, 5).forEach(e => bad(e)); else ok('sin errores');
  console.log(fails ? `\nFIXTURE TUTORIAL: FALLO (${fails})\n` : '\nFIXTURE TUTORIAL: OK\n');
  app.exit(fails ? 1 : 0);
}
