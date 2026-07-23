// AUDIO: musica, efectos con samples y sonidos procedurales (beep/boom).
//
// Este modulo es DUEÑO de: el AudioContext, el oscilador del motor, el mute, el ducking y las
// pistas de musica. Nada de eso se toca desde afuera — se manipula por las funciones exportadas.
//
// Lo que necesita saber del juego (estado, config, avion...) NO lo lee de variables globales:
// entra por parametro. Asi el modulo no depende del closure de game.js y se puede probar solo.
import { SFXB, SFX_DEF } from '../data/sfx.js';

let lastState = 'modeselect';   // ultimo estado conocido, para las llamadas que no lo reciben

let AC = null, eng = null;

// música (streaming vía <audio>, aparte del SFX WebAudio). Embebida como data URI (artifact autocontenido).
// A futuro: cambiar soundtracks por nivel/momento/secuencia (una pista por contexto).
// Audio ORIGINAL (mp3) para la app de escritorio. El build web re-embebe versiones
// comprimidas (assets/audio/web/*.m4a) para entrar en el límite de 16 MB del Artifact;
// ver tools/build_web.py (mapea cada mp3 a su m4a, o descarta las que no entran).
const MUSIC_LOBBY = '../assets/audio/lobby.mp3';   // the_weight_of_honor — lobby en loop
const MUSIC_GAME = '../assets/audio/game.mp3';    // weight_of_honor_v2 — fondo del juego, volumen bajo
const musLobby = new Audio(MUSIC_LOBBY); musLobby.loop = true; musLobby.volume = 0.55;
const musGame = new Audio(MUSIC_GAME); musGame.loop = true; musGame.volume = 0.30;
const MUSIC_STORY = '../assets/audio/story.mp3';   // epic_himno — pantallas de HISTORIA
const musStory = new Audio(MUSIC_STORY); musStory.loop = true; musStory.volume = 0.5;
// pool ADRENALINA (supervivencia y ciclo de muerte): 11 pistas pmetal; al empezar cada run
// suena UNA al azar. En el build web SOLO se re-embeben las 3 primeras (tienen m4a comprimida).
const MUSIC_ADR = [
  '../assets/audio/pmetal_himno.mp3',            // web: comprimida
  '../assets/audio/pmetal_sanmartin.mp3',        // web: comprimida
  '../assets/audio/pmetal_soy_hincha.mp3',       // web: comprimida
  '../assets/audio/pmetal_acero_blanco.mp3',
  '../assets/audio/pmetal_aundepie.mp3',
  '../assets/audio/pmetal_aurora.mp3',
  '../assets/audio/pmetal_malvinas.mp3',
  '../assets/audio/pmetal_malvinas_2triumph.mp3',
  '../assets/audio/pmetal_revolucion_mayo.mp3',
  '../assets/audio/pmetal_sangre_albiceleste.mp3',
  '../assets/audio/pmetal_soldado.mp3',
];
const musAdr = MUSIC_ADR.filter(Boolean)
  .map(src => { const a = new Audio(src); a.loop = true; a.volume = 0.30; return a; });

// PLAYLIST del REPRODUCTOR: la base del juego + el pool adrenalina, presentadas como TRACK 1..N.
// Es la lista que se puede cambiar en vuelo (modos que NO son historia) y de la que la campaña
// saca una pista por nivel. El lobby (musLobby) y las pantallas de historia (musStory) quedan
// aparte: no entran en el reproductor.
const PLAYLIST = [musGame, ...musAdr];
// pista inicial ALEATORIA (cada carga arranca con otra). Dentro de la sesion NO se re-sortea al
// reiniciar nivel — la continuidad la maneja setRunMusic; el jugador la cambia con ◄ ►, teclas
// 1..N o el joystick (R3).
let trackIdx = (Math.random() * PLAYLIST.length) | 0;
let scriptedIdx = null;  // campaña: la pista la fija el NIVEL (no el jugador); null en los demas modos

/** La pista que suena en juego: en campaña la fija el nivel; en el resto, la que eligio el jugador. */
function gameTrack() { return PLAYLIST[scriptedIdx != null ? scriptedIdx : trackIdx] || musGame; }
let muted = false, musicStarted = false;
let duckT = 0;   // ducking: las explosiones grandes agachan la musica un instante
try { muted = localStorage.getItem('rasante_muted') === '1'; } catch (e) { }

const SFX_MASTER = 0.3;   // volumen maestro de TODOS los samples (no tapan la musica de fondo)
const SFX_LOOP_KEYS = Object.keys(SFX_DEF).filter(k => SFX_DEF[k].loop);
const sfxPool = {}, sfxLoopA = {}, sfxTgt = {};
export function sfxSrc(key) { if (!SFXB) return null; const d = SFX_DEF[key]; return d && d.f.length ? d : null; }
// one-shot: elige una variante al azar; pool de 3 por archivo para que se solapen sin cortarse
export function sfxOne(key, vol) {
  const d = sfxSrc(key); if (!d || muted) return false;
  const rel = d.f[(Math.random() * d.f.length) | 0];
  const pool = sfxPool[rel] || (sfxPool[rel] = { i: 0, a: [] });
  let a = pool.a[pool.i % 3];
  if (!a) a = pool.a[pool.i % 3] = new Audio(SFXB + rel);
  pool.i++;
  a.volume = Math.min(1, (vol !== undefined ? vol : d.v) * SFX_MASTER);
  try { a.currentTime = 0; } catch (e) { }
  a.play().catch(() => { });
  return true;
}
function sfxLoop(key) {
  if (key in sfxLoopA) return sfxLoopA[key];
  const d = sfxSrc(key); if (!d) return (sfxLoopA[key] = null);
  const a = new Audio(SFXB + d.f[0]); a.loop = true; a.volume = 0;
  return (sfxLoopA[key] = a);
}
let engAltT = 0;   // temporizador del crossfade normal↔normal2
// `w` es un snapshot de solo lectura del mundo. Antes esto leia 7 variables del closure de
// game.js; pasarlas explicitas deja el modulo probable por si solo y sin dependencias ocultas.
export function updateSfx(dt, w) {
  for (const k of SFX_LOOP_KEYS) sfxTgt[k] = 0;
  const flying = w.state === 'play' || w.state === 'takeoff';
  if (!muted) {
    if (flying && w.plane) {
      // motor: crossfade lento entre las dos tomas de crucero
      engAltT += dt;
      const mixB = 0.5 + 0.5 * Math.sin(engAltT / 14 * Math.PI * 2);
      sfxTgt.engN = SFX_DEF.engN.v * (1 - mixB * 0.85);
      sfxTgt.engN2 = SFX_DEF.engN2.v * (0.15 + mixB * 0.85);
      if (w.boost) sfxTgt.turbo = SFX_DEF.turbo.v;                        // turbo en loop con fade
      if (w.state === 'play' && w.plane.y <= 4.5) sfxTgt.waterNear = SFX_DEF.waterNear.v;  // rasante
      if (w.state === 'play' && w.firing && !w.overheat) sfxTgt.gun = SFX_DEF.gun.v;       // metralla
      // ambiente por contexto del mapa
      if (w.cfg.sky === 'storm') {
        if (w.cfg.terrain === 'sea') sfxTgt.ambStorm = SFX_DEF.ambStorm.v;
        else sfxTgt.ambRain = SFX_DEF.ambRain.v;
      } else if (w.cfg.terrain === 'land') {
        const near = w.soldiers && w.soldiers.some(sd => !sd.dead && sd.z > 3 && sd.z < 90);
        if (near) sfxTgt.ambWarNear = SFX_DEF.ambWarNear.v;
        else if (w.cfg.obstacles > 0) sfxTgt.ambWarFar = SFX_DEF.ambWarFar.v;
        else sfxTgt.ambWind = SFX_DEF.ambWind.v;
      }
    }
    if (w.state === 'momentum') sfxTgt.alarm = SFX_DEF.alarm.v;           // alarma durante el momentum
  }
  for (const k of SFX_LOOP_KEYS) {
    const a = sfxLoop(k); if (!a) continue;
    const tgt = (sfxTgt[k] || 0) * SFX_MASTER;
    a.volume += (tgt - a.volume) * Math.min(1, dt * 3.5);
    if (tgt > 0 && a.paused && musicStarted) a.play().catch(() => { });
    else if (tgt === 0 && !a.paused && a.volume < 0.012) { a.pause(); a.volume = 0; }
  }
}
// la música del lobby suena SOLO en las pantallas previas a arrancar (selección de modo + menú);
// desde que empieza la partida (takeoff/play) y en sus pantallas de fin (derribado, nivel, victoria,
// objetivo) suena la del juego — nunca la del lobby.
function inLobby(state) { return state === 'modeselect' || state === 'menu'; }
export function updateMusic(state) {
  lastState = state;
  if (muted) { if (eng) eng.g.gain.value = 0; return; }
  // pistas: HISTORIA (himno epico) / lobby / juego (la pista del reproductor o la del nivel)
  const gm = gameTrack();
  const want = state === 'story' ? musStory : inLobby(state) ? musLobby : gm;
  for (const m of [musLobby, musStory, ...PLAYLIST]) if (m !== want && !m.paused) m.pause();
  if (musicStarted && want.paused && (want !== musStory || MUSIC_STORY)) want.play().catch(() => { });
  // mezcla dinamica: en MOMENTUM la musica se AHOGA (camara lenta, como bajo el agua) y
  // las explosiones grandes la agachan un instante (ducking). Lerp por frame → suave.
  const tv = (state === 'momentum' ? 0.10 : 0.30) * (duckT > 0 ? 0.45 : 1);
  gm.volume += (tv - gm.volume) * 0.08;
}
function startMusicOnce(state) { if (musicStarted || muted) return; musicStarted = true; updateMusic(state || 'modeselect'); }
export function setMuted(v) {
  muted = v;
  try { localStorage.setItem('rasante_muted', muted ? '1' : '0'); } catch (e) { }
  const b = document.getElementById('snd'); if (b) b.classList.toggle('muted', muted);
  if (muted) { musLobby.pause(); musStory.pause(); PLAYLIST.forEach(m => m.pause()); if (eng) eng.g.gain.value = 0; }
  else { startMusicOnce(); updateMusic(lastState); }
}
(() => {
  const b = document.getElementById('snd'); if (!b) return;   // botón de sonido (esquina sup. der.)
  b.classList.toggle('muted', muted);
  b.addEventListener('click', () => { audio(); setMuted(!muted); });
})();

export function audio() {
  if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { } }
  if (AC && AC.state === 'suspended') AC.resume();
  if (AC && !eng) {
    try {
      const o = AC.createOscillator(), g = AC.createGain(), f = AC.createBiquadFilter();
      o.type = 'sawtooth'; o.frequency.value = 70;
      f.type = 'lowpass'; f.frequency.value = 320;
      g.gain.value = 0;
      o.connect(f); f.connect(g); g.connect(AC.destination); o.start();
      eng = { o, g };
    } catch (e) { }
  }
  startMusicOnce();   // la música arranca en la primera interacción (autoplay policy)
}
export function beep(f, dur, type, vol, slide) {
  if (!AC || muted) return;
  try {
    const o = AC.createOscillator(), g = AC.createGain();
    o.type = type || 'square'; o.frequency.value = f;
    if (slide) o.frequency.linearRampToValueAtTime(slide, AC.currentTime + dur);
    g.gain.value = vol || 0.04;
    g.gain.exponentialRampToValueAtTime(0.0001, AC.currentTime + dur);
    o.connect(g); g.connect(AC.destination); o.start(); o.stop(AC.currentTime + dur);
  } catch (e) { }
}
export function boom(vol, hi) {
  if (!AC || muted) return;
  try {
    const n = AC.sampleRate * 0.22, buf = AC.createBuffer(1, n, AC.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const s = AC.createBufferSource(), g = AC.createGain(), fl = AC.createBiquadFilter();
    fl.type = hi ? 'highpass' : 'lowpass'; fl.frequency.value = hi ? 1800 : 900;
    g.gain.value = vol || 0.12;
    s.buffer = buf; s.connect(fl); fl.connect(g); g.connect(AC.destination); s.start();
  } catch (e) { }
}

// ---------- interfaz para el resto del juego ----------
// El motor (oscilador grave) y el ducking los maneja este modulo; game.js solo pide efectos.

/** Silencia el motor (al entrar en momentum, al morir, al cambiar de pantalla). */
export function engineOff() { if (eng) eng.g.gain.value = 0; }

/** Rumble grave del motor en camara lenta (MOMENTUM): pulso tipo latido. */
export function engineRumble(momT) {
  if (!eng || muted) return;
  eng.o.frequency.value = 30 + Math.sin(momT * 1.5) * 3;
  eng.g.gain.value = 0.014 + 0.009 * Math.max(0, Math.sin(momT * 2.6));
}

/** Tono del motor en vuelo: sube con la velocidad. Si hay samples de motor (engN) el
 *  oscilador calla y deja sonar la grabacion; sin samples (build web) hace de motor. */
export function engineFly(spd, boost, gain) {
  if (!eng) return;
  eng.o.frequency.value = 46 + spd * 0.55 + (boost ? 28 : 0);
  eng.g.gain.value = sfxSrc('engN') ? 0 : gain;
}

/** ¿Esta silenciado? Lo consultan el tipeo del guion y el rumble. */
export function isMuted() { return muted; }

/** Una explosion grande agacha la musica un instante (ducking). */
export function duck(v) { duckT = Math.max(duckT, v); }

/** Recuperacion del ducking; se llama una vez por frame desde update(). */
export function tickDuck(dt) { duckT = Math.max(0, duckT - dt); }

/** Fija la musica del run segun el modo.
 *  - CAMPAÑA (historia): cada nivel tiene su pista (playlist[nivel]); el jugador no la elige.
 *  - CICLO / POR LA PATRIA: usa la pista elegida en el reproductor y NO la re-sortea — asi al
 *    reiniciar un nivel la musica CONTINUA en vez de arrancar otra. */
export function setRunMusic(isCampaign, level) {
  scriptedIdx = isCampaign ? (level % PLAYLIST.length) : null;
  syncPlayerBtn();
}

// ---------- REPRODUCTOR (cambiar de pista en vuelo, modos que no son historia) ----------
export function trackCount() { return PLAYLIST.length; }
export function currentTrackName() { return 'TRACK ' + (trackIdx + 1); }

/** Cambia a la pista `i` (envuelve). Si hay una pista de juego sonando, el cambio es EN VIVO. */
export function setTrack(i) {
  const n = PLAYLIST.length;
  trackIdx = ((i % n) + n) % n;
  syncPlayerBtn();
  updateMusic(lastState);   // si estamos en juego (no lobby/historia), suena la nueva ya
}
export function nextTrack() { setTrack(trackIdx + 1); }
export function prevTrack() { setTrack(trackIdx - 1); }

// refleja el nombre de la pista actual en el reproductor de la UI
function syncPlayerBtn() {
  const el = document.getElementById('ptrack');
  if (el) el.textContent = currentTrackName();
}
(() => {
  const prev = document.getElementById('pprev'), next = document.getElementById('pnext');
  if (!prev || !next) return;
  syncPlayerBtn();
  prev.addEventListener('click', e => { e.preventDefault(); audio(); prevTrack(); });
  next.addEventListener('click', e => { e.preventDefault(); audio(); nextTrack(); });
})();
