// LA MUSICA EN CAPAS — el reproductor (docs/produccion/MUSICA_CAPAS.md; datos en data/musica_capas.js).
//
// Las capas (stems) de una pista suenan JUNTAS y en sincronia: se decodifican enteras y se arrancan en
// el MISMO instante del reloj de WebAudio, en loop. Con <audio> no se puede — cada elemento arranca
// cuando quiere y en un minuto se desfasan decenas de milisegundos, y una bateria corrida del bajo se
// oye en el acto.
//
// Cada cuadro el orquestador pasa la INTENSIDAD (core/intensidad.js) y cada capa va a su nivel de la
// tabla — pero el cambio no cae cuando llega: SUBIR entra en el proximo TIEMPO (la musica responde
// rapido a lo que pasa) y BAJAR en el proximo COMPAS (la calma no corta una frase a la mitad). Encima,
// un pasabajos en el master que en calma "aleja" la musica y con tension la abre entera.
//
// El AudioContext y el volumen general son de systems/audio.js (dueño del sonido): de alla salen
// `contextoAudio()` y `volumenMusicaJuego()`, que ya traen el mute, el bloqueo, OPCIONES, el ducking,
// el silencio de RASANTE y la pausa. Aca no se decide nada de eso.
import { contextoAudio, volumenMusicaJuego, capasSonando } from './audio.js';
import { PISTAS_CAPAS, CAPAS_BASE } from '../data/musica_capas.js';
import { nivelCapa, proximoCompas } from '../core/intensidad.js';

const buffers = {};             // 'balas/bajo.m4a' → AudioBuffer (se decodifica una vez)
let P = null, pid = null;       // la pista en curso
let t0 = 0;                     // instante del AudioContext en que arranco (para saber por donde va)
let master = null, filtro = null, nodos = {};   // capa → { src, g, objetivo }
let sonando = false, cargando = false;
let ult = { v: 0, fc: 0 };      // lo ultimo aplicado (para la sonda y el medidor)

async function cargarBuffer(AC, rel) {
  if (buffers[rel]) return buffers[rel];
  const r = await fetch(CAPAS_BASE + rel);
  const ab = await r.arrayBuffer();
  buffers[rel] = await AC.decodeAudioData(ab);
  return buffers[rel];
}

/** Arranca la pista `id` del catalogo (async: la primera vez decodifica los stems). */
export async function arrancar(id) {
  const AC = contextoAudio();
  if (!AC || !PISTAS_CAPAS[id] || cargando) return false;
  if (sonando && pid === id) return true;
  parar();
  cargando = true;
  try {
    const p = PISTAS_CAPAS[id];
    const nombres = Object.keys(p.capas);
    await Promise.all(nombres.map(n => cargarBuffer(AC, p.capas[n].archivo)));
    P = p; pid = id;
    master = AC.createGain(); master.gain.value = 0;
    filtro = AC.createBiquadFilter(); filtro.type = 'lowpass'; filtro.frequency.value = p.filtro.cerrado; filtro.Q.value = 0.5;
    master.connect(filtro); filtro.connect(AC.destination);
    t0 = AC.currentTime + 0.12;                // un poco adelante: todas arrancan EXACTO juntas
    nodos = {};
    for (const n of nombres) {
      const src = AC.createBufferSource(), g = AC.createGain();
      src.buffer = buffers[p.capas[n].archivo]; src.loop = true;
      // EL LOOP CIERRA EN COMPAS: la intro (antes del primer tiempo) suena una vez, y despues se repite del
      // primer tiempo fuerte al ultimo compas COMPLETO — la cola de la pista (un acorde que queda sonando,
      // un fade) no entra, y el empalme cae en el tiempo justo
      src.loopStart = p.offset; src.loopEnd = finLoop(p);
      const v0 = nivelCapa(p.capas[n], 0);
      g.gain.value = v0;
      src.connect(g); g.connect(master);
      src.start(t0);
      nodos[n] = { src, g, objetivo: v0 };
    }
    sonando = true;
    capasSonando(true);
  } catch (e) { console.warn('CAPAS: no se pudo arrancar ' + id, e && e.message); parar(); }
  cargando = false;
  return sonando;
}

export function parar() {
  for (const n in nodos) { try { nodos[n].src.stop(); } catch (e) { } try { nodos[n].g.disconnect(); } catch (e) { } }
  nodos = {};
  if (filtro) { try { filtro.disconnect(); } catch (e) { } }
  if (master) { try { master.disconnect(); } catch (e) { } }
  master = filtro = null; sonando = false; P = null; pid = null;
  capasSonando(false);
}

/** Donde termina el loop: el ultimo compas completo (o `fin` si la pista lo declara). */
const finLoop = p => p.fin || p.offset + Math.floor((p.dur - p.offset) / (60 / p.bpm * p.compas)) * (60 / p.bpm * p.compas);

/** Por donde va la pista, en segundos: la intro una vez, despues el loop entre offset y el ultimo compas. */
function posicion(AC) {
  const e = Math.max(0, AC.currentTime - t0), fin = finLoop(P);
  return e < fin ? e : P.offset + (e - P.offset) % (fin - P.offset);
}

/** Un cuadro: la intensidad `v` (ya suavizada) lleva cada capa a su nivel, en el proximo tiempo (si
 *  sube) o compas (si baja). Solo se re-agenda cuando el objetivo cambia de verdad (> 0.06). */
export function actualizar(v) {
  if (!sonando) return;
  const AC = contextoAudio();
  const now = AC.currentTime, pos = posicion(AC), beat = 60 / P.bpm;
  for (const n in nodos) {
    const nd = nodos[n], meta = nivelCapa(P.capas[n], v);
    if (Math.abs(meta - nd.objetivo) < 0.06) continue;
    const sube = meta > nd.objetivo;
    // el proximo borde: un tiempo (compas 1) para subir, un compas para bajar
    // (la grilla del loop cierra en compas: el borde despues del ultimo es la vuelta, y cae en tiempo)
    const tb = proximoCompas(pos, P.bpm, P.offset, sube ? 1 : P.compas);
    const cuando = now + (tb - pos);
    const g = nd.g.gain;
    g.cancelScheduledValues(now);
    g.setValueAtTime(g.value, now);
    g.setValueAtTime(g.value, cuando);
    g.linearRampToValueAtTime(meta, cuando + beat * (sube ? 0.5 : 2));   // entra en medio tiempo, sale en dos
    nd.objetivo = meta;
  }
  // EL PASABAJOS: de `cerrado` Hz en calma a abierto (18 kHz) desde `abre` — en escala exponencial,
  // que es como oye el oido
  const k = Math.min(1, v / Math.max(0.01, P.filtro.abre));
  const fc = P.filtro.cerrado * Math.pow(18000 / P.filtro.cerrado, k);
  filtro.frequency.setTargetAtTime(fc, now, 0.25);
  // EL VOLUMEN GENERAL lo dice audio.js (mute, OPCIONES, ducking, RASANTE, pausa)
  master.gain.setTargetAtTime(volumenMusicaJuego(), now, 0.08);
  ult = { v, fc };
}

/** La foto para la sonda y el medidor en pantalla. */
export function snapshot() {
  if (!sonando) return { sonando: false, cargando, id: pid };
  const AC = contextoAudio(), pos = posicion(AC);
  const capas = {};
  for (const n in nodos) capas[n] = +nodos[n].g.gain.value.toFixed(2);
  const compas = Math.floor((pos - P.offset) / (60 / P.bpm * P.compas)) + 1;
  return { sonando, id: pid, nombre: P.nombre, v: +ult.v.toFixed(2), fc: Math.round(ult.fc), capas, pos: +pos.toFixed(1), compas,
    master: +master.gain.value.toFixed(3) };
}
