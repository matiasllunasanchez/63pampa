// EL DIRECTOR, la parte que se ve: las BANDAS NEGRAS y el FUNDIDO
// (docs/sistemas/PLAN_DIRECTOR_CINEMATICAS.md §4, verbos `letterbox` y `fade`).
//
// Es lo unico que el director dibuja por su cuenta. Todo lo demas de una cinematica lo dibuja el
// dueño de la escena — el buque muriendo lo pinta quien es dueño del buque, la cabina la pinta el
// modo. Esto son las dos cosas que no son de nadie: el marco y la oscuridad.
//
// Espacio de coordenadas: MUNDO (480×270, W/H de ctx.js) — cubre la pantalla entera.
import { ctx, W, H } from './ctx.js';

/** `s` = la foto del director (systems/cine.js `state()`), o null si no hay cinematica. */
export function drawCine(s) {
  if (!s) return;
  // LETTERBOX: dos bandas que entran desde arriba y abajo. No es un adorno de epoca — es la señal
  // de "esto no lo estas jugando" (o lo estas jugando a medias, ver `control`), y por eso tiene
  // que estar ADENTRO del cuadro y no ser un cambio de resolucion.
  if (s.letterbox > 0) {
    const h = Math.round(H * 0.11 * Math.min(1, s.letterbox));
    if (h > 0) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, h); ctx.fillRect(0, H - h, W, h); }
  }
  // FUNDIDO A NEGRO: lo ultimo de todo, encima de la cabina y del HUD. Un fundido que deja ver los
  // instrumentos no es un corte, es un filtro.
  if (s.fade > 0) {
    ctx.globalAlpha = Math.min(1, s.fade);
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;
  }
}
