// FEEDBACK VISUAL compartido: proyeccion y helpers de efecto que varios sistemas disparan.
//
// Todo esto lo usan el vuelo, las colisiones, el momentum Y el render. Vive aca (y no dentro de
// un sistema) porque solo toca stores + paleta + las medidas del mundo: no necesita el closure
// de game.js. Sacarlo del monolito es lo que permite que systems/collision.js sea un archivo.

import { cam } from './state.js';
import { run } from './run.js';
import { parts, popups, obstacles } from './world.js';
import { P } from '../data/palette.js';
import { W, HOR, F } from '../render/ctx.js';
import { boom, duck } from '../systems/audio.js';

/** Proyeccion pseudo-3D: mundo (x,y,z) → pantalla. Devuelve tambien `k` (escala en esa z).
 *  Es la primitiva mas usada del juego (~40 sitios): la lee todo el render y las colisiones. */
export function proj(x, y, z) {
  const k = F / z;
  return { x: W / 2 + (x - cam.x) * k, y: HOR + (cam.y - y) * k, k };
}

/** Texto flotante de feedback (puntaje, aviso) en coordenadas de mundo. */
export function popup(x, y, txt, c, big) {
  popups.push({ x, y, txt, c: c || P.accent, life: 1.1, big: !!big });
}

/** Explosion: reventon de particulas en (x,y,z) + sacudon de camara. `big` la agranda y agacha
 *  la musica un instante (ducking). */
export function explodeAt(x, y, z, big, noBall) {
  const s = proj(x, y, z);
  for (let i = 0, n = big ? 24 : 12; i < n; i++) {
    const a = Math.random() * 6.283, v = (14 + Math.random() * 55) * Math.min(1.6, s.k / 3 + 0.4);
    parts.push({
      x: s.x, y: s.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 15, life: 0.4 + Math.random() * 0.5,
      c: Math.random() < 0.6 ? P.accent : (Math.random() < 0.5 ? P.warn : P.dim), r: Math.max(1, s.k * 0.35)
    });
  }
  // BOLA DE FUEGO de frente. Se empuja como 'airboom' (el mismo tipo que usa la bomba reventada
  // en el aire) para reutilizar su reloj y su poda: ya se avanza en collision.js y en game.js.
  // `done: true` la deja fuera de toda colision — es puro dibujo.
  // `noBall`: el que llama pone su propia bola (el derribo usa una version PIXEL mas chica que
  // no tape los pedazos del avion) — aca quedan las chispas, el sacudon y el ducking.
  if (!noBall) obstacles.push({ type: 'airboom', x, y, z, boomT: 0, scale: big ? 0.85 : 0.42, done: true });
  run.shake = Math.min(6, run.shake + (big ? 4.5 : 2)); boom(big ? 0.16 : 0.08);
  if (big) duck(0.55);                      // explosion grande → ducking de la musica
}

/** Salpicadura de sangre + tierra al eliminar un soldado. */
export function bloodBurst(sx, sy, n) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * 6.283, sp = 22 + Math.random() * 55, blood = Math.random() < 0.55;
    parts.push({
      x: sx + (Math.random() - 0.5) * 3, y: sy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 24, life: 0.35 + Math.random() * 0.45,
      c: blood ? (Math.random() < 0.5 ? '#a81b1b' : '#7a1212') : (Math.random() < 0.5 ? '#6b5a3a' : '#463a26'), r: 1 + Math.random() * 1.6
    });
  }
}
