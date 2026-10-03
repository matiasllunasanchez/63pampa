// LA LUZ DE BORDE (rim light) del avion del jugador.
//
// QUE ES. El sol esta ADELANTE —en el horizonte, hacia donde volas— y la camara va detras del
// avion: el avion esta a CONTRALUZ. Asi se ve de verdad un objeto a contraluz: la cara que te mira
// queda en sombra, y el FILO de la silueta del lado del sol se enciende. Es lo que separa al
// protagonista del fondo — sin esto, una silueta oscura sobre un mar oscuro se pierde.
//
// POR QUE EN VIVO Y NO HORNEADO. Lo natural en un sprite horneado seria iluminarlo en el horno,
// pero el horneado del avion se esta rehaciendo (Blender, otra sesion, 3/10/2026). Este borde se
// calcula EN EL MOMENTO a partir de la TRANSPARENCIA del cuadro que se esta dibujando, asi que
// funciona igual con la hoja de hoy, con la de mañana y con cualquier avion nuevo: no tiene
// anclas, no tiene tabla, no sabe nada de la hoja.
//
// COMO. En un lienzo del tamaño del CUADRO de la hoja (84x84, no de la pantalla):
//   1. el cuadro, tal cual
//   2. 'source-in' con el color del sol → la silueta entera de ese color
//   3. 'destination-out' con el MISMO cuadro corrido BORDE_ANCHO pixeles en direccion contraria a
//      la luz → se borra todo pixel que tiene silueta "del lado del sol". Sobrevive el filo.
// y eso se suma ('lighter') con los MISMOS argumentos de destino que el sprite, bajo la misma
// transformacion: calza solo, gira y escala con el avion.
//
// LA LUZ VIENE DE ARRIBA EN PANTALLA (el sol esta sobre el horizonte, adelante). Pero el sprite se
// dibuja girado cuando el avion se inclina, asi que la direccion se lleva al espacio del SPRITE
// des-girandola con el angulo de la transformacion: el filo encendido es siempre el que mira al
// cielo, no el que miraba al cielo con el avion derecho.
import { theme } from './theme.js';
import { cfg } from '../core/state.js';
import { BORDE_ANCHO, BORDE_FUERZA, BORDE_CIELO, BORDE_CIELO_DEF } from '../data/tuning.js';

let O = null, o = null;

/** El borde de UN cuadro de la hoja. Recibe exactamente los argumentos con los que se dibujo el
 *  sprite (`drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh)`) y el contexto con su transformacion
 *  viva. Va DESPUES del sprite. */
export function drawBorde(ctx, img, sx, sy, sw, sh, dx, dy, dw, dh) {
  if (cfg.borde === 'off' || BORDE_FUERZA <= 0 || !img) return;
  const sol = theme.sky && theme.sky.sun;
  if (!sol) return;
  // cuanto contraluz da ESTE cielo: es un dato (ver BORDE_CIELO), no el brillo del color del sol
  const c = BORDE_CIELO[cfg.sky];
  const fuerza = BORDE_FUERZA * (c === undefined ? BORDE_CIELO_DEF : c);
  if (fuerza < 0.02) return;
  if (!O || O.width !== sw || O.height !== sh) {
    O = document.createElement('canvas'); O.width = sw; O.height = sh; o = O.getContext('2d');
  }
  // la luz viene de ARRIBA en pantalla: llevada al espacio del sprite, des-girando la transformacion
  const m = ctx.getTransform();
  const ang = Math.atan2(m.b, m.a);
  const lx = Math.sin(ang), ly = -Math.cos(ang);     // (0,-1) girado por -ang
  const ox = -lx * BORDE_ANCHO, oy = -ly * BORDE_ANCHO;
  o.imageSmoothingEnabled = false;
  o.globalCompositeOperation = 'copy';
  o.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
  o.globalCompositeOperation = 'source-in';
  o.fillStyle = sol;
  o.fillRect(0, 0, sw, sh);
  o.globalCompositeOperation = 'destination-out';
  o.drawImage(img, sx, sy, sw, sh, ox, oy, sw, sh);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = Math.min(1, fuerza);
  ctx.drawImage(O, 0, 0, sw, sh, dx, dy, dw, dh);
  ctx.restore();
}
