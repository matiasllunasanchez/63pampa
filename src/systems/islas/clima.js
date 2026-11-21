// LAS ISLAS REALES — EL CLIMA (20/11, data/islas_clima.js). Sortea uno al entrar y lo va cambiando solo cada pocos
// minutos, mezclando de uno al otro en CLIMA_PASA s (los numeros se interpolan: la lluvia se cierra de a poco, el mar
// crece). Lo leen: el terreno (terreno3d.js: olas, bruma, nubes, luz, nieve), game.js (la lluvia y la tormenta del
// pasillo, y su sonido) e islas.js (el viento empuja y sacude al avion).
import { CLIMAS, CLIMA_CADA, CLIMA_PASA, VIENTO_DESDE } from '../../data/islas_clima.js';

const NUM = ['lluvia', 'viento', 'rafagas', 'olas', 'bruma', 'nubes', 'oscuro', 'nieveH', 'temp'];
const C = { de: null, a: null, k: 1, t: 0, prox: 0, v: null, giro: 0, avisar: null };
const rnd = (a, b) => a + Math.random() * (b - a);
const val = (c, n) => (n === 'nieveH' ? (c.nieve ? c.nieveH : 390) : c[n] || 0);

function sortear(sin) {
  const L = CLIMAS.filter(c => c.id !== sin);
  let r = Math.random() * L.reduce((s, c) => s + c.peso, 0);
  for (const c of L) { r -= c.peso; if (r <= 0) return c; }
  return L[0];
}

/** Al entrar a las islas (o con la sonda): un clima nuevo, de una (sin mezcla). `id` lo fuerza. */
export function arrancar(id) {
  C.a = C.de = CLIMAS.find(c => c.id === id) || sortear();
  C.k = 1; C.t = 0; C.prox = rnd(CLIMA_CADA[0], CLIMA_CADA[1]); C.giro = rnd(-25, 25);
  C.avisar = C.a; calcular();
}
/** Cambia al clima `id` (o a uno al azar) mezclando. */
export function cambiar(id) {
  C.de = mezcla(); C.a = CLIMAS.find(c => c.id === id) || sortear(C.a && C.a.id);
  C.k = 0; C.t = 0; C.prox = rnd(CLIMA_CADA[0], CLIMA_CADA[1]); C.giro = rnd(-25, 25);
  C.avisar = C.a;
}
// el clima de ESTE instante como si fuera uno de la lista (para mezclar desde el medio de una mezcla)
function mezcla() { const m = { id: 'mezcla', ...C.a }; for (const n of NUM) m[n] = C.v ? C.v[n] : val(C.a, n); m.nieve = C.v ? C.v.nieve > 0.5 : !!C.a.nieve; m.nieveH = m.nieveH || 390; return m; }

function calcular() {
  const e = C.k * C.k * (3 - 2 * C.k), v = {};
  for (const n of NUM) v[n] = val(C.de, n) + (val(C.a, n) - val(C.de, n)) * e;
  v.nieve = (C.de.nieve ? 1 - e : 0) + (C.a.nieve ? e : 0);
  v.tormenta = (C.de.tormenta ? 1 - e : 0) + (C.a.tormenta ? e : 0);
  const dir = (VIENTO_DESDE + 180 + C.giro) * Math.PI / 180;   // hacia donde va (0 = norte, como el rumbo)
  v.vx = Math.sin(dir) * v.viento; v.vz = -Math.cos(dir) * v.viento;
  v.id = C.a.id; v.n = C.a.n; v.en = C.a.en;
  C.v = v;
}

export function paso(dt) {
  if (!C.a) arrancar();
  C.t += dt;
  if (C.k < 1) C.k = Math.min(1, C.k + dt / CLIMA_PASA);
  if (C.t > C.prox) cambiar();
  calcular();
}
/** Los numeros de ahora (ver data/islas_clima.js), o null si todavia no hay clima. */
export const ahora = () => C.v;
/** El clima nuevo que hay que anunciar (una vez), o null. */
export function tomarAviso() { const a = C.avisar; C.avisar = null; return a; }
export function reiniciar() { C.a = C.de = null; C.v = null; C.avisar = null; }

// SONDA: __clima() dice cual; __clima('temporal') lo pone de una; __clima('+') pasa al siguiente mezclando
if (typeof window !== 'undefined') window.__clima = id => {
  if (id === '+') cambiar(); else if (id) arrancar(id);
  return JSON.stringify(C.v ? { id: C.v.id, k: +C.k.toFixed(2), lluvia: +C.v.lluvia.toFixed(2), nieve: +C.v.nieve.toFixed(2), viento: +C.v.viento.toFixed(1), olas: +C.v.olas.toFixed(2), bruma: +C.v.bruma.toFixed(2), prox: Math.round(C.prox - C.t) } : null);
};
