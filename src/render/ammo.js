// TRAZADORAS del cañón del avión.
//
// Antes eran un cuadrado claro mas una linea de ctx.stroke(): la linea sale ANTIALIASADA, y una
// diagonal difuminada al lado de un mundo hecho de pixeles enteros canta muchisimo. Ademas el
// cuadrado era del mismo color a 3 px del avion que a 200 m, asi que las rafagas se leian como
// una fila de puntos flotando, sin direccion ni profundidad.
//
// COMO SE DIBUJA AHORA. La estela se MUESTREA hacia atras en z y se proyecta punto por punto, en
// vez de trazar una linea entre dos extremos. De ahi salen las dos cosas que la hacen leer:
//   · la PERSPECTIVA sale sola — la cola queda gruesa cerca del avion y se afina hacia el
//     horizonte, que es como se ve una trazadora alejandose (al reves que un cometa: lo que esta
//     mas cerca de la camara es lo mas grande, aunque sea lo mas viejo);
//   · el COLOR enfria hacia atras — la cabeza es el proyectil encendido, y lo que queda detras se
//     apaga con la edad. Blanco → ambar → naranja → rojo sucio.
// Todo con px() (rects enteros): nada de strokes, nada de degrades.

import { ctx, px, PZ } from './ctx.js';
import { proj } from '../core/fx.js';

// del nucleo encendido al rescoldo. El indice 0 es la cabeza; de ahi para atras, enfriando.
const HOT = ['#fffdf2', '#ffeeb4', '#ffcf62', '#f59a2e', '#cf6418', '#8d3d10'];
const TAIL_Z = 6;    // cuanto mundo hacia atras cubre la estela
const TAIL_N = 5;    // en cuantos pedazos se parte

/** Donde estaba la bala cuando iba por `z`. Con puntería libre (`path`) la trayectoria es la recta
 *  que va del avion al punto apuntado, asi que la estela ACOMPAÑA el desvio en vez de salir recta
 *  hacia atras — se nota al disparar bien al costado. Sin path, la bala va derecho. */
function at(b, z) {
  if (!b.path) return { x: b.x, y: b.y };
  const f = (z - b.z0) / (110 - b.z0);   // mismo reparto que usa la colision (systems/collision.js)
  return { x: b.x0 + (b.tx - b.x0) * f, y: Math.max(0, b.y0 + (b.ty - b.y0) * f) };
}

/** Dibuja una trazadora del jugador. `b` es un elemento de core/world.js `bullets`. */
export function drawBullet(b) {
  // ESTELA, de atras hacia adelante para que lo caliente quede encima de lo frio
  for (let i = TAIL_N; i >= 1; i--) {
    const z = b.z - (i / TAIL_N) * TAIL_Z;
    if (z <= PZ + 1) continue;                       // ese tramo todavia no salio del cañon
    const q = at(b, z), p = proj(q.x, q.y, z);
    const w = Math.max(1, Math.round(p.k * 0.3));
    ctx.globalAlpha = 0.7 * (1 - i / (TAIL_N + 1));
    px(p.x - w / 2, p.y - w / 2, w, w, HOT[Math.min(HOT.length - 1, i)]);
  }
  ctx.globalAlpha = 1;

  // CABEZA: el proyectil encendido. Halo tibio + nucleo blanco. El halo va a alpha bajo y un
  // pixel mas grande: sin el, la bala lejana es un pixel suelto que se pierde contra el cielo.
  const s = proj(b.x, b.y, b.z);
  const w = Math.max(1, Math.round(s.k * 0.38));
  ctx.globalAlpha = 0.4;
  px(s.x - w / 2 - 1, s.y - w / 2 - 1, w + 2, w + 2, HOT[2]);
  ctx.globalAlpha = 1;
  px(s.x - w / 2, s.y - w / 2, w, w, HOT[0]);
  // DESTELLO en cruz, solo de cerca: a k grande la cabeza es un bloque de 3 px y sin esto parece
  // un ladrillo blanco. De lejos no se dibuja — serian pixeles sueltos alrededor de un punto.
  if (s.k > 2.2) {
    ctx.globalAlpha = 0.55;
    px(s.x - w / 2 - 1, s.y, 1, 1, HOT[1]);
    px(s.x + w / 2, s.y, 1, 1, HOT[1]);
    px(s.x, s.y - w / 2 - 1, 1, 1, HOT[1]);
    ctx.globalAlpha = 1;
  }
}
