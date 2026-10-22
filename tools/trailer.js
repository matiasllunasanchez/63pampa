// EL TRAILER — filma el juego de verdad, cuadro por cuadro, sin un solo tiron.
//
//   npm run trailer                      el guion entero -> trailer/rasante_trailer.mp4
//   npm run trailer -- --probar          una foto de cada plano (iterar el guion sin renderizar)
//   npm run trailer -- --solo piruetas   un plano suelto, para verlo
//   npm run trailer -- --fps 30 --escala 1   mas rapido, para probar
//
// POR QUE NO SE GRABA Y LISTO. Grabar con MediaRecorder mientras el juego corre guarda el cuadro
// CUANDO SALIO: si uno tardo 40 ms, en el video dura 40 ms, y eso es exactamente el tiron que se
// ve. Y no hay forma de ganarle apretando la maquina, porque los bajones no son parejos — caen
// justo donde hay mas cosas en pantalla, que es justo lo que un trailer quiere mostrar.
//
// Asi que aca no se graba: se RENDERIZA. El reloj del juego lo maneja este programa
// (tools/trailer_preload.js): avanza 1/fps exacto, se pide el canvas, se avanza otro 1/fps. El
// juego no sabe que esta siendo filmado y cada cuadro del video dura lo mismo que todos los
// demas, tarde lo que tarde en dibujarse. Sale parejo por construccion. Se paga en tiempo de
// pared —filmar 60 s lleva unos minutos— y es el precio correcto: es render, no captura.
//
// EL JUEGO ES EL DE PROD. Mismo preload que electron/main.js en `--prod` (arranque del fichin,
// sin marca de MODO DEV, audio sin mutear), mismos datos, mismo todo. Lo unico que no es de
// verdad es quien aprieta las teclas.
//
// EL SONIDO NO SE CAPTURA: el video sale mudo y ffmpeg le pega una pista de la banda sonora.
// Grabar el audio del juego cuadro a cuadro no tiene sentido (el reloj del audio es de pared y no
// se puede virtualizar), y para un trailer la musica es una decision de montaje, no una captura.
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn, spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const GUION = require('./trailer_guion.js');

// ---------- argumentos ----------
const argv = process.argv.slice(2);
const flag = (n, def) => { const a = argv.find(x => x.startsWith('--' + n + '=')); if (a) return a.split('=').slice(1).join('='); const i = argv.indexOf('--' + n); return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : def; };
const tiene = n => argv.includes('--' + n);
const FPS = +flag('fps', 60);
const ESCALA = +flag('escala', 2);                       // 2 -> 1920x1080 por vecino mas cercano
const SOLO = (flag('solo', '') || '').split(',').filter(Boolean);
const PROBAR = tiene('probar');
const SALIDA = flag('out', path.join(ROOT, 'trailer', 'rasante_trailer.mp4'));
const FOTOS = flag('fotos', path.join(ROOT, 'trailer', 'fotos'));
const MUSICA = flag('musica', '');
const MUSICA_DESDE = +flag('desde', 0);                  // segundo de la pista donde entra
const CALENTAR = +flag('calentar', 0.5);                 // segundos sin grabar antes de cada plano

const W = 960, H = 540;                                  // el canvas del juego (render/ctx.js: 480x270 x2)
let win = null, ff = null, errores = [], nCuadros = 0, t0 = 0;

const sleep = ms => new Promise(r => setTimeout(r, ms));
const js = s => win.webContents.executeJavaScript(s, true);
const estado = async () => { try { return JSON.parse(await js('String(window.__estado && window.__estado())') || 'null'); } catch (e) { return null; } };

// ---------- la ventana: el juego de prod, con el reloj prestado ----------
async function abrir() {
  // la musica de music/original, igual que electron/main.js (systems/audio.js la pide al cargar)
  ipcMain.on('musica-original', e => {
    const dir = path.join(ROOT, 'assets', 'music', 'original');
    try { e.returnValue = fs.readdirSync(dir).filter(f => /\.(mp3|m4a|ogg|opus|wav)$/i.test(f)).sort(); }
    catch (err) { e.returnValue = []; }
  });
  ipcMain.on('pantalla-completa', () => { });

  win = new BrowserWindow({
    width: 1280, height: 720, show: !tiene('oculto'),
    backgroundColor: '#0d1216', title: 'RASANTE — filmando',
    webPreferences: {
      preload: path.join(__dirname, 'trailer_preload.js'),
      // EL RELOJ SE PARCHEA EN EL MUNDO DE LA PAGINA, asi que el preload tiene que vivir ahi:
      // con contextIsolation el preload corre en otro mundo y no puede tocar el
      // `requestAnimationFrame` que usa el juego. Es la unica diferencia con prod y la pagina no
      // puede notarla (solo lee window.RASANTE_APP y window.rasanteMusica).
      contextIsolation: false, sandbox: false, nodeIntegration: false,
      backgroundThrottling: false, autoplayPolicy: 'no-user-gesture-required',
      offscreen: false,
    },
  });
  win.webContents.on('console-message', (e, nivel, msg) => { if (nivel >= 3) errores.push(msg); });
  win.webContents.on('render-process-gone', (e, d) => { errores.push('EL RENDERER MURIO ' + JSON.stringify(d)); });
  await win.loadFile(path.join(ROOT, 'src', 'index.html'));
  // el juego tiene que haber corrido su carga: `__estado` es lo ultimo que publica game.js
  for (let i = 0; i < 200 && !(await js('String(!!(window.__tr && window.__estado))')).includes('true'); i++) await sleep(100);
}

/** Avanza `n` cuadros SIN grabar (el guion los pide en SEGUNDOS: ver `preparar`). Es la unica
 *  forma de dejar que el juego cargue texturas y se acomode: las imagenes cargan en tiempo real
 *  (el `await` de cada cuadro les da aire) y una textura que entra a mitad de plano se ve como un
 *  parpadeo.
 *
 *  Y VA TOCANDO UNA TECLA. Una mision arranca con su radio, y la radio PARA EL MUNDO hasta que
 *  alguien acepta (game.js: `dlgPausa` y `charla.hablando()` saltean update() entero). Sin esto,
 *  los momentos del catalogo que abren una mision se filmaban con el mundo congelado detras de
 *  una caja de dialogo — se vio en EL CALLEJON y en LA CHANCHA, que salieron quietos. */
async function calentar(n, teclear = true) {
  const ms = (1000 / FPS).toFixed(4);
  for (let i = 0; i < n; i++) {
    await js(`window.__tr.cuadro(${ms}, false)`);
    // SOLO VOLANDO. La tecla es para destrabar la radio, y en un MENU la misma tecla elige la fila
    // marcada: con el toque a ciegas, el plano de la portada terminaba tres pantallas mas adentro
    // (paso, y el trailer entero abria en el menu de HISTORIA). Preguntar el estado cuesta una ida
    // y vuelta cada doce cuadros y ahorra tener que acordarse de apagarlo plano por plano.
    if (teclear && i % 12 === 11 && /play|takeoff|landing|pulso/.test((await estado() || {}).st || '')) {
      await js(`window.__tr.toque('Enter')`);
    }
  }
}

/** El arranque del fichin: corre con el reloj virtual como todo lo demas, asi que hay que
 *  bombearlo y darle la ficha. No se graba — el BIOS y el INSERTE FICHA son DOM y el canvas
 *  #bios, no el canvas del juego, asi que en el video no saldrian igual. */
async function hastaLaPortada() {
  // EL ARRANQUE SE TERMINA CUANDO SE SACA SU CLASE, no cuando el juego dice 'title': el juego YA
  // esta en la portada debajo del BIOS desde el primer cuadro, y mientras el arranque corre se
  // come TODO el teclado (core/input.js consulta `arranqueActivo`). Volver antes es la trampa
  // perfecta: el guion aprieta Enter, nadie lo escucha y los planos del lobby salen quietos.
  const corriendo = () => js(`String(document.body.classList.contains('arranque-bios'))`);
  for (let i = 0; i < 60 * 60; i++) {
    await js(`window.__tr.cuadro(${(1000 / FPS).toFixed(4)}, false)`);
    if (i % 15 === 14) {
      if ((await corriendo()) === 'false') {
        // las ultimas fichas pueden haberse colado al juego (el arranque suelta su escucha 0,3 s
        // antes de sacarse la clase): se vuelve a la portada, que es de donde arranca el guion
        await js(`window.__pantalla('title')`); await calentar(20, false);
        return (await estado() || {}).st || 'title';
      }
      await js(`window.__tr.toque('Enter')`);   // la ficha: el aviso espera cualquier tecla
    }
  }
  return null;
}

// ---------- ffmpeg ----------
function arrancarFfmpeg(destino) {
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  const vf = ESCALA === 1 ? [] : ['-vf', `scale=${W * ESCALA}:${H * ESCALA}:flags=neighbor`];
  // VECINO MAS CERCANO para agrandar: el juego es raster y pixel entero (render/ctx.js explica
  // por que la escala tiene que ser entera). Cualquier interpolacion lo convierte en una papilla.
  const a = ['-y', '-f', 'image2pipe', '-vcodec', 'png', '-framerate', String(FPS), '-i', '-',
    ...vf, '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p',
    '-r', String(FPS), '-movflags', '+faststart', destino];
  const p = spawn('ffmpeg', a, { stdio: ['pipe', 'ignore', 'pipe'] });
  let err = '';
  p.stderr.on('data', d => { err += d; if (err.length > 20000) err = err.slice(-10000); });
  p.on('exit', c => { if (c) console.error('\nffmpeg salio ' + c + ':\n' + err.slice(-3000)); });
  return p;
}

function escribir(p, buf) {
  if (p.stdin.write(buf)) return Promise.resolve();
  return new Promise(r => p.stdin.once('drain', r));
}

/** Graba `n` cuadros, corriendo las marcas del plano en su cuadro. */
async function grabar(plano, n) {
  const ms = (1000 / FPS).toFixed(4);
  const marcas = (plano.marcas || []).map(m => ({ ...m, c: Math.round((m.t || 0) * FPS) }));
  for (let i = 0; i < n; i++) {
    for (const m of marcas) if (m.c === i) await aplicar(m);
    const b64 = await js(`window.__tr.cuadro(${ms}, true)`);
    nCuadros++;
    if (ff) await escribir(ff, Buffer.from(b64, 'base64'));
    if (nCuadros % (FPS * 2) === 0) {
      const seg = (nCuadros / FPS).toFixed(1), real = ((Date.now() - t0) / 1000).toFixed(0);
      process.stdout.write(`\r   ${seg}s de video · ${real}s de pared · ${plano.id}            `);
    }
  }
}

/** Una marca del guion: ejecuta js, aprieta, suelta o toca teclas. */
async function aplicar(m) {
  // el `js` de una marca puede ser una expresion o varias sentencias seguidas (ver VOLANDO en el
  // guion): va envuelto en un cuerpo de funcion, no en un String(...), que solo acepta expresiones
  if (m.js) { const r = await js(`(() => { try { ${m.js}; return 'ok'; } catch (e) { return 'ERROR ' + e.message; } })()`); if (/^ERROR/.test(r)) errores.push(m.js.slice(0, 90) + ' -> ' + r); }
  for (const k of [].concat(m.apretar || [])) await js(`window.__tr.apretar(${JSON.stringify(k)})`);
  for (const k of [].concat(m.soltar || [])) await js(`window.__tr.soltar(${JSON.stringify(k)})`);
  for (const k of [].concat(m.toque || [])) await js(`window.__tr.toque(${JSON.stringify(k)})`);
  if (m.soltarTodo) await js('window.__tr.soltarTodo()');
}

/** Deja el juego como el plano lo necesita y lo deja respirar unos cuadros. */
async function preparar(plano) {
  // el piloto se apaga SIEMPRE antes de empezar: si no, el de un plano sigue volando en el
  // siguiente y lo corrige contra una altura que ya no es la que ese plano pide
  await js('window.__tr.piloto(null); window.__tr.pulso(0); window.__tr.soltarTodo()');
  if (plano.prep) await aplicar({ js: plano.prep });
  for (const m of plano.antes || []) await aplicar(m);
  await calentar(Math.round((plano.calentar === undefined ? CALENTAR : plano.calentar) * FPS), plano.teclear !== false);
}

// ---------- modo foto: tres estampas de cada plano ----------
// Para iterar el guion sin renderizar. Corre el plano ENTERO (las marcas tienen que pasar: si no,
// se mira una foto de un plano que no es el que se va a filmar) y guarda tres cuadros —arranque,
// medio y final— porque un plano se juzga por como EVOLUCIONA, no por un instante.
async function probar(planos) {
  fs.mkdirSync(FOTOS, { recursive: true });
  const ms = (1000 / FPS).toFixed(4);
  for (const [i, p] of planos.entries()) {
    await preparar(p);
    const n = Math.round(p.dur * FPS);
    const hitos = (p.fotos || [0.2, 0.55, 0.92]).map(f => Math.max(0, Math.round(f * n) - 1));
    const marcas = (p.marcas || []).map(m => ({ ...m, c: Math.round((m.t || 0) * FPS) }));
    const sacadas = [];
    for (let k = 0; k < n; k++) {
      for (const m of marcas) if (m.c === k) await aplicar(m);
      const foto = hitos.indexOf(k);
      const b64 = await js(`window.__tr.cuadro(${ms}, ${foto >= 0})`);
      if (foto >= 0) {
        const f = path.join(FOTOS, String(i + 1).padStart(2, '0') + '_' + p.id + '_' + (foto + 1) + '.png');
        fs.writeFileSync(f, Buffer.from(b64, 'base64')); sacadas.push(path.basename(f));
      }
    }
    const st = await estado();
    console.log(`   ${String(i + 1).padStart(2)} ${p.id.padEnd(16)} ${String(p.dur).padStart(5)}s  estado=${st && st.st}`);
  }
  console.log('\n   fotos en ' + FOTOS);
}

// ---------- musica ----------
function pegarMusica(video, destino) {
  const dur = +(spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', video]).stdout || '0');
  const fin = Math.max(0.1, dur - 2);
  const a = ['-y', '-i', video, '-ss', String(MUSICA_DESDE), '-i', MUSICA,
    '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest',
    '-af', `afade=t=in:st=0:d=1.2,afade=t=out:st=${fin.toFixed(2)}:d=2`, destino];
  const r = spawnSync('ffmpeg', a, { encoding: 'utf8' });
  if (r.status) console.error(r.stderr.slice(-2000));
  return !r.status;
}

// ---------- main ----------
(async () => {
  await app.whenReady();
  await abrir();
  const planos = SOLO.length ? GUION.filter(p => SOLO.includes(p.id)) : GUION;
  if (!planos.length) { console.error('no hay planos: ' + SOLO.join(',')); app.exit(1); return; }

  console.log('RASANTE — filmando el trailer');
  console.log(`   ${planos.length} planos · ${FPS} fps · ${W * ESCALA}x${H * ESCALA}`);
  const st = await hastaLaPortada();
  if (!st) { console.error('el juego no llego a la portada'); app.exit(1); return; }
  console.log('   el juego arranco (' + st + ')\n');

  t0 = Date.now();
  if (PROBAR) {
    await probar(planos);
  } else {
    const crudo = path.join(path.dirname(SALIDA), '.' + path.basename(SALIDA, '.mp4') + '_mudo.mp4');
    ff = arrancarFfmpeg(crudo);
    for (const p of planos) { await preparar(p); await grabar(p, Math.round(p.dur * FPS)); }
    ff.stdin.end();
    await new Promise(r => ff.on('exit', r));
    const seg = (nCuadros / FPS).toFixed(1);
    console.log(`\n   ${nCuadros} cuadros · ${seg}s de video en ${((Date.now() - t0) / 1000).toFixed(0)}s de pared`);
    if (MUSICA && fs.existsSync(MUSICA) && pegarMusica(crudo, SALIDA)) { fs.unlinkSync(crudo); }
    else { fs.renameSync(crudo, SALIDA); if (MUSICA) console.log('   (sin musica)'); }
    console.log('   ' + SALIDA);
  }
  if (errores.length) { console.error('\n   ERRORES DE LA PAGINA:'); for (const e of [...new Set(errores)].slice(0, 20)) console.error('     ' + e); }
  app.exit(errores.length ? 1 : 0);
})().catch(e => { console.error(e); app.exit(1); });
