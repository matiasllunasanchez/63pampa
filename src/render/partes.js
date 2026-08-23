// PARTES DEL DESPIECE: la hoja de piezas 3D horneadas (assets/world/explosions/partes.png).
//
// POR QUE EXISTE: el escombro eran RECTANGULOS ROTADOS, y a ocho pixeles un rectangulo es un
// rectangulo — el avion se rompia en cuadrados. Estas piezas salen del MISMO pipeline que los
// aviones (tools/bake_partes.html reusa las primitivas y las luces de bake_planes.html), asi que
// un ala arrancada es el ala del avion y no un icono aparte.
//
// FORMATO: una FILA por pieza, una COLUMNA por giro. El juego le suma ADEMAS su rotacion en el
// plano (`o.spin`), asi que entre las dos la pieza tumba de verdad: la hoja cambia desde que lado
// la ves y el `spin` la hace dar vueltas.
//
// FALLBACK: si la hoja no cargo, `isReady()` da false y render/world.js dibuja el rectangulo de
// siempre. Es la regla de la casa — ninguna pieza depende de que un PNG exista.

import { P } from '../data/palette.js';

const SRC = '../assets/world/explosions/partes.png';
export const sheet = new Image();
sheet.src = SRC;
export const isReady = () => sheet.complete && sheet.naturalWidth > 0;

export const FW = 48, FH = 48;
export const YAWS = 8;

// EL ORDEN ES EL DE LA HOJA y vive en `data/despiece.js` (PLAN_HORNEADO B5): lo leen este archivo
// y `core/fx.js`, asi que una copia local seria la tercera y se desincronizaria sola. El runner lo
// imprime al hornear y `npm run unit` lo compara contra el modelo — antes de B5 la unica custodia
// era acordarse de mirar esa salida.
import { PARTES_HOJA as PARTES } from '../data/despiece.js';
export { PARTES };
const FILA = Object.fromEntries(PARTES.map((p, i) => [p, i]));

// ---------- TINTE ----------
// La hoja se hornea en GRIS: el color lo pone la receta (data/despiece.js), que es la que sabe de
// que esta hecha cada cosa. Se tiñe la HOJA ENTERA una vez por color y se cachea — teñir frame por
// frame haria un canvas nuevo por pedazo y por cuadro, que con 60 pedazos vivos es el tipo de
// costo que el presupuesto de D5 no perdona.
//
// `multiply` y no `source-atop`: la hoja se hornea en gris CLARO justamente para esto — multiply
// sobre un gris claro da el color de la receta con el modelado intacto, que es la operacion
// correcta para teñir. Con `source-atop` a media alfa las piezas salian casi blancas y se leian
// como papel: se vio en la primera captura.
const cache = new Map();
function hojaTintada(c) {
  if (!c) return sheet;
  let cv = cache.get(c);
  if (cv) return cv;
  cv = document.createElement('canvas');
  cv.width = sheet.naturalWidth; cv.height = sheet.naturalHeight;
  const g = cv.getContext('2d');
  g.drawImage(sheet, 0, 0);
  g.globalCompositeOperation = 'multiply';
  g.fillStyle = c;
  g.fillRect(0, 0, cv.width, cv.height);
  // el multiply pinta tambien lo TRANSPARENTE del frame: hay que recortar contra el alfa original
  // o la pieza sale dentro de un cuadrado de color, que es exactamente el bug que vino a arreglar
  g.globalCompositeOperation = 'destination-in';
  g.drawImage(sheet, 0, 0);
  cache.set(c, cv);
  return cv;
}

/** Dibuja una pieza CENTRADA en el origen del contexto (el llamador ya trasladó y rotó).
 *
 *  @param ctx  el contexto, ya con translate + rotate(spin) puestos
 *  @param nom  nombre de la pieza (una de PARTES)
 *  @param yaw  indice de giro 0..7 — de que lado se la ve
 *  @param r    semi-tamaño en pixeles de pantalla (el mismo `r` del rectangulo que reemplaza)
 *  @param c    color de la receta; sin el, la pieza sale en su gris horneado
 *  @return true si la dibujo; false si la hoja no esta y hay que caer al rectangulo */
export function drawParte(ctx, nom, yaw, r, c) {
  if (!isReady()) return false;
  const fila = FILA[nom];
  if (fila === undefined) return false;
  const img = hojaTintada(c);
  // EL FRAME es cuadrado y la pieza vive adentro con aire alrededor. El rectangulo al que
  // reemplaza medía `r` de ancho, y el contenido ocupa ~2/3 del frame: 1.6·r deja la PIEZA del
  // tamaño que tenia el rectangulo. Con 2.6 (el primer intento) el escombro salia al doble y una
  // sola ala tapaba media pantalla.
  const d = r * 1.6;
  ctx.drawImage(img, (yaw % YAWS) * FW, fila * FH, FW, FH, -d / 2, -d / 2, d, d);
  return true;
}

/** El giro que le toca a un pedazo en este instante. El tumbo en 3D acompaña al tumbo en el
 *  plano: la pieza no se queda mostrando siempre la misma cara mientras gira. */
export const yawDe = o => (Math.floor(o.spin * 0.6 + (o.ph || 0) * 2) % YAWS + YAWS) % YAWS;

/** El VIDRIO de la cabina no toma el color del fuselaje: es lo unico transparente del avion y
 *  teñirlo de camo lo convertiria en otra chapa. */
export const colorDe = (o) => o.parte === 'cabina' ? P.canopy : o.c;
