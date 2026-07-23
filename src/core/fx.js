// FEEDBACK VISUAL compartido: helpers de efecto que varios sistemas disparan.
//
// `popup` lo usan el vuelo, las colisiones y el momentum. Vive aca (y no dentro de un sistema)
// porque escribe en el store de `popups` y lo llama todo el mundo — igual que los stores, es
// una pieza compartida, no la propiedad de un modulo.
//
// A futuro migran aca los otros helpers "limpios" (proj, explodeAt, bloodBurst): solo tocan
// stores + paleta, asi que no necesitan el closure de game.js.

import { popups } from './world.js';
import { P } from '../data/palette.js';

/** Texto flotante de feedback (puntaje, aviso) en coordenadas de mundo. */
export function popup(x, y, txt, c) {
  popups.push({ x, y, txt, c: c || P.accent, life: 1.1 });
}
