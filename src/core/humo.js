// EL HUMO DEL AVION ROTO, por FOCOS (pedido del autor 2/10: "agregarle mas humo desde otro lado,
// desde las turbinas quiza, y variar cantidad y lugares"). La tobera, las dos tomas de aire y las
// dos alas (AVERIA_FOCO en data/tuning.js). Cada avion sortea UNA VEZ el orden de sus focos y los
// prende de a uno segun cuanto este roto, asi que dos aviones rotos no humean igual pero ninguno
// parpadea.
//
// Vive en core/ porque lo usan dos sistemas: el avion que volas (systems/damage.js, cuando entra en
// averia) y el averiado que se va en el relevo (systems/squad.js). Cada uno guarda su estado
// (`nuevoHumo()`) y le pasa el MARCO del avion en pantalla: el centro, la semi-ala (ux, uy) y su
// escala `k`. Lo que escribe son particulas (core/world.js), igual que cualquier otro efecto.
import { parts } from './world.js';
import { AVERIA_HUMO_DT, AVERIA_FOCOS, AVERIA_FOCO } from '../data/tuning.js';

const COLOR = { negro: [0x6a, 0x40], gris: [0x88, 0x30], blanco: [0xc8, 0x28] };   // [gris al empezar, cuanto oscurece al final]

/** El estado del humo de UN avion: el orden de sus focos (null = todavia no se rompio) y sus relojes. */
export const nuevoHumo = () => ({ orden: null, t: {} });

/** Vuelve el estado a "sano": el proximo que se rompa sortea sus focos de nuevo. */
export function apagarHumo(st) { st.orden = null; }

function sortear(st) {
  const todos = Object.keys(AVERIA_FOCO);
  for (let i = todos.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [todos[i], todos[j]] = [todos[j], todos[i]]; }
  st.orden = todos;
  for (const k of todos) st.t[k] = Math.random() * AVERIA_HUMO_DT * 3;   // que no arranquen todos juntos
}

/** Un cuadro de humo. `a` es cuan roto esta (0..1: prende 1, 2 o 3 focos segun AVERIA_FOCOS, mas
 *  seguido y mas oscuro cuanto mas alto). `m` = { cx, cy, ux, uy, k } el marco en pantalla, y
 *  `viento` = { vx, vy } hacia donde se lleva las bocanadas (px/s). */
export function humoFocos(st, dt, a, m, viento) {
  if (!(a > 0)) return;
  if (!st.orden) sortear(st);
  const n = a > AVERIA_FOCOS[1] ? 3 : a > AVERIA_FOCOS[0] ? 2 : 1;
  const wv = viento || { vx: 0, vy: 9 };
  for (let i = 0; i < n; i++) {
    const k = st.orden[i], F = AVERIA_FOCO[k];
    st.t[k] -= dt;
    if (st.t[k] > 0) continue;
    st.t[k] = AVERIA_HUMO_DT * (3 - 2 * a) * F.cada * (0.75 + Math.random() * 0.5);
    // a lo largo del ala (u) y hacia la panza (la perpendicular, girada 90° hacia abajo)
    const x0 = m.cx + m.ux * F.f - m.uy * F.p, y0 = m.cy + m.uy * F.f + m.ux * F.p;
    const [g0, dg] = COLOR[F.col];
    const g = Math.round(g0 - dg * a), c = '#' + [g, g, g - 4].map(v => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join('');
    // cantidad tambien variable: de una a tres bocanadas, mas cuanto peor
    const nb = 1 + Math.floor(Math.random() * (1 + 2 * a));
    for (let b = 0; b < nb; b++) parts.push({ x: x0 + (Math.random() - 0.5) * m.k * 0.3, y: y0,
      vx: wv.vx + (Math.random() - 0.5) * 26 + F.f * 10, vy: wv.vy + (Math.random() - 0.5) * 10,
      life: (0.5 + 0.6 * a) * (F.col === 'blanco' ? 0.7 : 1), c,
      r: Math.max(1.2, m.k * (0.22 + 0.25 * a) * F.tam * (0.7 + Math.random() * 0.6)) });
    if (F.chispa && Math.random() < F.chispa * a) parts.push({ x: x0, y: y0, vx: (Math.random() - 0.5) * 40, vy: -10 + Math.random() * 20,
      life: 0.25 + Math.random() * 0.2, c: Math.random() < 0.5 ? '#ffb43c' : '#f06a2a', r: Math.max(1, m.k * 0.12) });
  }
}
