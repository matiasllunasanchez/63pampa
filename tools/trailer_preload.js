// EL PRELOAD DEL TRAILER — el juego de verdad, pero con el reloj en la mano.
//
// Hace DOS cosas, y la segunda es toda la gracia:
//
//   1. SE HACE PASAR POR electron/preload.js. El look de prod no es un flag: sale de
//      `window.RASANTE_APP` (core/dev.js: sin eso, DEV = true y el menu muestra MODO DEV) y de
//      `RASANTE_DEV = false` (sin eso, audio.js se automutea y arranque.js no corre). Tambien
//      expone `rasanteMusica`, que systems/audio.js pide al cargar.
//
//   2. VIRTUALIZA EL TIEMPO. Es LA respuesta a los tirones: una grabacion en tiempo real sale
//      con los bajones del render porque el cuadro grabado dura lo que tardo en dibujarse. Aca
//      no hay tiempo real: `performance.now()`, `Date.now()`, `requestAnimationFrame` y los
//      `setTimeout` / `setInterval` cuelgan de un reloj que SOLO avanza cuando el que filma lo
//      manda avanzar, y siempre el mismo paso (1/fps). El cuadro puede tardar 5 ms o 500 en
//      dibujarse: en el video dura exactamente 16,67 ms. Sale parejo por construccion, no por
//      suerte, y de paso es REPRODUCIBLE — dos corridas dan el mismo video.
//
//      Por que alcanza con esto: el juego no tiene reloj propio. game.js toma el `now` del rAF,
//      saca su `dt` y TODO (mundo, particulas, lluvia, menus, carteles) cuelga de ahi; lo poco
//      que usa reloj de pared lo pide a `performance.now()`. Cambiando esas dos fuentes se
//      cambia el tiempo del juego entero sin tocar una linea del juego.
//
// LOS setTimeout DE MENOS DE 1 ms NO SE TOCAN: ahi nadie esta midiendo tiempo, es el idiom de
// "en el proximo tick" (audio.js lo usa asi). Mandarlos al reloj virtual los dejaria esperando
// un cuadro que todavia no se pidio, y eso es un cuelgue durante la carga.
const { ipcRenderer } = require('electron');

// ---------- 1. el juego de verdad ----------
window.RASANTE_APP = true;
window.RASANTE_DEV = false;
window.rasanteVentana = { pantallaCompleta: () => { } };   // la filmacion no cambia la ventana
window.rasanteMusica = { original: () => { try { return ipcRenderer.sendSync('musica-original'); } catch (e) { return []; } } };

// ---------- 3. EL SONIDO, cuadro a cuadro (TR_AUDIO=1; 21/11, el autor: "grabar con sonido de bombas y demas") ----------
// El audio del juego no se puede grabar en tiempo real por lo mismo que el video: su reloj es de pared. Asi que
// tambien se RENDERIZA, por sus dos caminos:
//   · los SAMPLES (<audio>: bombas, misiles, explosiones, la radio) — `Audio` se cambia por uno que no suena y que
//     ANOTA, cuadro por cuadro, que archivo suena, desde que segundo y a que volumen. tools/trailer.js arma la
//     pista con eso, exacta al cuadro. La MUSICA (assets/music) no se anota: la del trailer la pone el montaje.
//   · el WEB AUDIO (el motor, los pitidos, el ruido) — el AudioContext es un OfflineAudioContext que avanza
//     cuadro a cuadro con el reloj virtual (suspend en cada cuadro). Las capas de musica no cargan.
const TR_AUDIO = typeof process !== 'undefined' && process.env && process.env.TR_AUDIO === '1';
const TRA = { on: TR_AUDIO, voces: new Set(), log: [], srcs: [], srcIdx: new Map(), cuadros: [], grabando: false,
  oac: null, t0: 0, sr: 24000, max: +((typeof process !== 'undefined' && process.env.TR_AUDIO_MAX) || 600), fin: null, resumeOrig: null };
if (TR_AUDIO) {
  const durCache = new Map();
  const dur = url => {
    if (!url) return NaN;
    if (durCache.has(url)) return durCache.get(url);
    let d = NaN; try { d = +ipcRenderer.sendSync('tr-dur', url); } catch (e) { }
    durCache.set(url, d); return d;
  };
  let vid = 0;
  class FakeAudio {
    constructor(src) {
      this._id = ++vid; this.volume = 1; this.loop = false; this.paused = true; this._pos = 0; this.playbackRate = 1;
      this.muted = false; this.preservesPitch = true; this.preload = 'auto'; this.autoplay = false; this._l = {}; this._src = ''; this._dur = NaN; this._ended = false;
      if (src) this.src = src;
      TRA.voces.add(this);
    }
    set src(v) { this._src = v ? new URL(v, location.href).href : ''; this._pos = 0; this._ended = false; this._dur = /^data:/.test(this._src) ? 600 : dur(this._src); }
    get src() { return this._src; }
    get currentSrc() { return this._src; }
    get duration() { return this._dur; }
    get currentTime() { return this._pos; }
    set currentTime(v) { this._pos = Math.max(0, +v || 0); this._ended = false; }
    get ended() { return this._ended; }
    get readyState() { return 4; }
    play() { this.paused = false; this._ended = false; return Promise.resolve(); }
    pause() { this.paused = true; }
    load() { }
    canPlayType() { return 'probably'; }
    addEventListener(t, f) { (this._l[t] = this._l[t] || []).push(f); }
    removeEventListener(t, f) { if (this._l[t]) this._l[t] = this._l[t].filter(x => x !== f); }
    _emit(t) { for (const f of this._l[t] || []) { try { f.call(this, { type: t, target: this }); } catch (e) { } } if (typeof this['on' + t] === 'function') try { this['on' + t]({ type: t, target: this }); } catch (e) { } }
    cloneNode() { const a = new FakeAudio(this._src); a.volume = this.volume; a.loop = this.loop; return a; }
  }
  window.Audio = FakeAudio;
  // el AudioContext: uno solo, offline, que avanza con el reloj virtual
  const OAC = window.OfflineAudioContext;
  TRA.resumeOrig = OAC.prototype.resume;
  window.AudioContext = window.webkitAudioContext = function () {
    if (TRA.oac) return TRA.oac;
    const c = new OAC(2, Math.round(TRA.sr * TRA.max), TRA.sr);
    c.resume = () => Promise.resolve();          // (el juego no lo mueve: lo mueve el reloj)
    c.suspend(128 / TRA.sr);
    TRA.fin = c.startRendering();
    TRA.oac = c; TRA.t0 = performance.now();      // (el reloj virtual ya esta parcheado cuando el juego lo pide)
    return c;
  };
  // las capas de musica (systems/capas.js) no se cargan: la musica la pone el montaje
  const f0 = window.fetch.bind(window);
  window.fetch = (u, o) => (/\/music\//.test(String(u)) ? Promise.reject(new Error('sin musica en el trailer')) : f0(u, o));
}

// ---------- 2. el reloj en la mano ----------
(() => {
  const real = {
    now: performance.now.bind(performance),
    dateNow: Date.now.bind(Date),
    raf: window.requestAnimationFrame.bind(window),
    st: window.setTimeout.bind(window),
    ct: window.clearTimeout.bind(window),
    si: window.setInterval.bind(window),
    ci: window.clearInterval.bind(window),
  };
  const T0 = real.dateNow();
  let VT = 0;                 // el reloj virtual, en ms
  let rafQ = [], rafSeq = 1;
  const timers = new Map();   // id -> { due, fn, args, every }
  let tSeq = 1e7;             // ids altos: nunca se cruzan con los de los timers reales

  performance.now = () => VT;
  Date.now = () => T0 + VT;
  window.requestAnimationFrame = cb => { const id = rafSeq++; rafQ.push({ id, cb }); return id; };
  window.cancelAnimationFrame = id => { rafQ = rafQ.filter(x => x.id !== id); };
  window.setTimeout = (fn, ms, ...a) => {
    if (!(+ms >= 1)) return real.st(fn, ms, ...a);           // ver la nota de arriba
    const id = tSeq++; timers.set(id, { due: VT + +ms, fn, args: a, every: 0 }); return id;
  };
  window.clearTimeout = id => { if (timers.has(id)) timers.delete(id); else real.ct(id); };
  window.setInterval = (fn, ms, ...a) => {
    const p = Math.max(1, +ms || 0), id = tSeq++;
    timers.set(id, { due: VT + p, fn, args: a, every: p }); return id;
  };
  window.clearInterval = id => { if (timers.has(id)) timers.delete(id); else real.ci(id); };

  // LAS TECLAS SE SOSTIENEN A MANO, un evento por cuadro. El juego suelta la entrada sola cuando
  // vuelve de una cinematica o de la radio, asi que "mantener el gas" no es apretar una vez: es
  // apretar en cada cuadro. Van con `repeat: true` desde el segundo, que es lo que el juego
  // espera de una tecla sostenida — todo lo que mira `!e.repeat` (abrir menus, saltear pantallas,
  // alimentar el detector de combos) tiene que dispararse UNA vez y no sesenta por segundo.
  const held = new Map();   // code -> cuantos cuadros lleva apretada
  const ev = (tipo, code, repeat) => window.dispatchEvent(new KeyboardEvent(tipo, {
    code, key: KEY[code] || code, bubbles: true, cancelable: true, repeat: !!repeat,
  }));
  // el `key` de las que el juego mira por `code` igual: no se usa para decidir nada, pero un
  // evento sin `key` es un evento mentiroso y alguna libreria podria mirarlo
  const KEY = {
    Space: ' ', Enter: 'Enter', Escape: 'Escape', ShiftLeft: 'Shift', Tab: 'Tab', Backspace: 'Backspace',
    KeyW: 'w', KeyA: 'a', KeyS: 's', KeyD: 'd', KeyX: 'x', KeyZ: 'z', KeyV: 'v',
  };

  function soltarTodo() { for (const c of held.keys()) ev('keyup', c, false); held.clear(); }

  // EL SONIDO AVANZA CON EL RELOJ: los samples corren su posicion (loop / fin) y el offline renderiza hasta VT
  function avanzarSamples(ms) {
    for (const v of TRA.voces) {
      if (v.paused) continue;
      v._pos += ms / 1000 * (v.playbackRate || 1);
      if (v._dur > 0 && v._pos >= v._dur) {
        if (v.loop) v._pos %= v._dur;
        else { v._pos = v._dur; v.paused = true; v._ended = true; v._emit('ended'); }
      }
    }
  }
  async function avanzarOffline() {
    const c = TRA.oac;
    if (!c) return;
    const q = 128 / TRA.sr, t = Math.floor(((VT - TRA.t0) / 1000) / q) * q;
    if (t <= c.currentTime + 1e-9 || t >= TRA.max - q) return;
    try { const p = c.suspend(t); TRA.resumeOrig.call(c); await p; } catch (e) { }
  }
  function anotarSamples(ms) {
    const voces = [];
    for (const v of TRA.voces) {
      if (v.paused || v.muted || !(v.volume > 0.001) || !v._src || /\/music\/|^data:/.test(v._src)) continue;
      let i = TRA.srcIdx.get(v._src);
      if (i === undefined) { i = TRA.srcs.length; TRA.srcs.push(v._src); TRA.srcIdx.set(v._src, i); }
      voces.push([v._id, i, +v._pos.toFixed(4), +v.volume.toFixed(4), v.playbackRate || 1]);
    }
    TRA.log.push(voces);
    TRA.cuadros.push([(VT - TRA.t0) / 1000, ms / 1000]);
  }

  async function paso(ms) {
    VT += ms;
    if (TRA.on) { avanzarSamples(ms); await avanzarOffline(); }
    // los timers vencidos, en orden de vencimiento. El tope evita que un intervalo de 1 ms que se
    // reencola solo cuelgue el cuadro: con 256 por cuadro ya hay de sobra para cualquier cosa real.
    for (let g = 0; g < 256; g++) {
      let best = null, bid = 0;
      for (const [id, t] of timers) if (t.due <= VT && (!best || t.due < best.due)) { best = t; bid = id; }
      if (!best) break;
      if (best.every) best.due = VT + best.every; else timers.delete(bid);
      try { best.fn.apply(null, best.args); } catch (e) { console.error('timer virtual: ' + (e && e.message)); }
    }
    const q = rafQ; rafQ = [];
    for (const r of q) { try { r.cb(VT); } catch (e) { console.error('rAF virtual: ' + (e && e.message)); } }
  }

  // EL PILOTO. Un trailer no se puede filmar pidiendole a un robot que JUEGUE BIEN noventa segundos
  // seguidos: alcanza con que vuele derecho y a la altura que el plano pide, y que las cosas
  // vistosas (las piruetas, el canion, el blanco) las pida el guion a mano por sonda.
  //
  // Mira `window.__suelta()`, que es la sonda que ya dice altura y carril del avion, y sostiene
  // las mismas teclas que sostendria una mano. Con HISTERESIS a proposito: las teclas de volar
  // tambien alimentan el detector de combos (core/input.js, dirTap), asi que un piloto que
  // corrige a cada cuadro terminaria tirando piruetas sin querer.
  //
  // VUELA CON W/A/S/D Y NO CON LAS FLECHAS. Las flechas tienen DOS VIDAS segun la mira (core/input.js:
  // con la MIRA FIJA, que es la de arranque, rolan y panean la camara — no vuelan). W/A/S/D es la mano
  // que vuela SIEMPRE, pase lo que pase con la configuracion. Primera version de esto volaba con
  // flechas y el avion se caia al mar cada tres segundos con el gas "apretado".
  let piloto = null, pT = 0;
  function pilotar() {
    let s; try { s = JSON.parse(window.__suelta()); } catch (e) { return; }
    if (!s || s.st !== 'play') return;   // en el relevo o en la muerte el piloto no toca nada
    pT += 1 / 60;
    const alt = s.alt, obj = piloto.alt;
    // el gas sube y la picada baja; en la banda del medio, las dos sueltas (el avion planea)
    if (alt < obj - 2) { ap('KeyW'); sl('KeyS'); }
    else if (alt > obj + 2) { sl('KeyW'); if (alt > obj + 7) ap('KeyS'); }
    else { sl('KeyS'); if (alt < obj) ap('KeyW'); else sl('KeyW'); }
    // el carril: `vagar` lo hace ir y venir, que es lo que separa un vuelo vivo de un riel
    const tx = (piloto.x || 0) + (piloto.vagar ? Math.sin(pT * (piloto.ritmo || 0.5)) * piloto.vagar : 0);
    if (s.x < tx - 4) { ap('KeyD'); sl('KeyA'); }
    else if (s.x > tx + 4) { ap('KeyA'); sl('KeyD'); }
    else if (Math.abs(s.x - tx) < 1.5) { sl('KeyA'); sl('KeyD'); }
  }
  // EL PULSO SE JUEGA BIEN. El climax es un QTE de decimas de segundo: filmarlo sin tocar nada es
  // filmar como se pierde, y ganarlo de un saque con `__qgana()` es filmar el premio sin la prueba.
  // Esto lo JUEGA: lee que glifo pide el compas (`__qdbg().esperado`) y lo teclea por la misma
  // sonda que usa el fixture, cada `qte` cuadros — el ritmo de una mano que acierta.
  let qte = 0, qteT = 0;
  function jugarPulso() {
    let q; try { q = JSON.parse(window.__qdbg()); } catch (e) { return; }
    if (!q || !q.on || q.fase !== 'prueba' || !q.esperado) return;
    if (++qteT >= qte) { qteT = 0; try { window.__qtap(q.esperado); } catch (e) { } }
  }

  const ap = c => { if (!held.has(c)) held.set(c, 0); };
  const sl = c => { if (held.has(c)) { held.delete(c); ev('keyup', c, false); } };

  window.__tr = {
    vt: () => VT,
    piloto(p) { piloto = p || null; pT = 0; if (!p) soltarTodo(); return !!p; },
    // cada cuantos cuadros acierta una tecla del PULSO (0 = no lo juega)
    pulso(n) { qte = +n || 0; qteT = 0; return qte; },
    // UN CUADRO: sostiene las teclas, avanza el reloj y devuelve el canvas del juego en PNG.
    // Todo junto en una sola llamada porque cada ida y vuelta al proceso principal cuesta, y a
    // 60 cuadros por segundo de video eso se multiplica por miles.
    async cuadro(ms, conPng) {
      if (piloto) pilotar();
      if (qte) jugarPulso();
      for (const [c, n] of held) { held.set(c, n + 1); ev('keydown', c, n > 0); }
      await paso(ms);
      if (TRA.on && TRA.grabando && conPng) anotarSamples(ms);
      if (!conPng) return '';
      const cv = document.getElementById('g');
      return cv.toDataURL('image/png').slice(22);   // sin el "data:image/png;base64,"
    },
    // teclas: un toque (apretar y soltar en el mismo cuadro no sirve — el juego lee estado, asi
    // que el toque apreta y el que filma lo suelta uno o dos cuadros despues)
    apretar(code) { if (!held.has(code)) { held.set(code, 0); } },
    soltar(code) { if (held.has(code)) { held.delete(code); ev('keyup', code, false); } },
    soltarTodo,
    toque(code) { ev('keydown', code, false); ev('keyup', code, false); },
    apretadas: () => [...held.keys()],
    // EL SONIDO: grabar (solo los cuadros que van al video) y, al final, lo anotado y lo renderizado
    grabandoAudio(on) { TRA.grabando = !!on; return TRA.on; },
    audioLog: () => JSON.stringify({ srcs: TRA.srcs, log: TRA.log }),
    async audioOffline() {
      // termina de renderizar (lo que falta hasta el final, rapido) y devuelve los tramos grabados en PCM 16 bit
      const c = TRA.oac;
      if (!c) return '';
      try { TRA.resumeOrig.call(c); } catch (e) { }
      const buf = await TRA.fin, sr = TRA.sr, L = buf.getChannelData(0), R = buf.getChannelData(1);
      const n = TRA.cuadros.reduce((a, [, d]) => a + Math.round(d * sr), 0), out = new Int16Array(n * 2);
      let k = 0;
      for (const [t, d] of TRA.cuadros) {
        const i0 = Math.round(t * sr), m = Math.round(d * sr);
        for (let i = 0; i < m; i++) {
          const a = L[i0 + i] || 0, b = R[i0 + i] || 0;
          out[k++] = Math.max(-32768, Math.min(32767, a * 32767)); out[k++] = Math.max(-32768, Math.min(32767, b * 32767));
        }
      }
      // base64 de a pedazos (un String.fromCharCode de 20 MB revienta la pila)
      const u8 = new Uint8Array(out.buffer); let s = '';
      for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
      return btoa(s);
    },
  };
})();
