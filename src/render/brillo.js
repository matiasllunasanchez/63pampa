// EL RESPLANDOR — la luz que se derrama (bloom), EMITIDA por cada fuente.
//
// QUE ES. Lo que es una FUENTE DE LUZ —una explosion, la llama de la poscombustion, un fogonazo—
// derrama un halo calido sobre lo que tiene alrededor, como pasa en un ojo o en una lente. Es lo
// que separa a los juegos de pixel art que se ven "con luz" (REPLACED, Dead Cells) de los que se
// ven planos: sin esto, una explosion es una mancha de color; con esto, ILUMINA.
//
// POR QUE LA LUZ LA EMITE CADA FUENTE Y NO SE ADIVINA DE LA IMAGEN. Se probo primero lo otro —el
// bloom de manual: tomar el cuadro terminado, quedarse con lo que pasa un umbral de brillo,
// desenfocarlo y sumarlo— y se midio, sobre la misma foto, prendido contra apagado:
//   · por canal y en GPU: gratis (0,04 ms) e INVISIBLE (1,2 niveles de media sobre 255). Una bola
//     de fuego naranja solo pasa el umbral en el rojo.
//   · peor: en las misiones nubladas el CIELO GRIS es tan brillante como el fuego. Cualquier umbral
//     que hace brillar el fuego hace brillar el cielo, y la escena se lava de blanco.
//   · con la mascara bien hecha (brillo x saturacion, pixel a pixel en JS): 3 a 6 ms POR CUADRO
//     —leer el canvas de vuelta de la GPU— y aun asi apenas se notaba.
// Los motores lo resuelven con HDR: el fuego "vale mas que 1" y el cielo no. Este juego no tiene
// HDR, y la respuesta equivalente es que la luz sea un DATO de la fuente: el cielo nublado nunca
// brilla porque nunca emite, y el fuego siempre. Es tambien como lo hace el resto de la casa: la
// aureola del sol y el resplandor de la tobera ya eran luz pintada a mano por su dueño.
//
// COMO. Una CAPA DE LUZ a 1/ESCALA de la resolucion. Cada fuente llama `luz(...)` mientras se
// dibuja, con SU posicion, SU tamaño y SU intensidad; aca se suman todas, se desenfocan una sola
// vez y se pegan arriba del mundo en modo 'screen' (aclara y nunca oscurece). El costo es un
// gradiente por fuente activa y un desenfoque de 240x135 — y si nada emitio, nada.
//
// DONDE VA (`drawBrillo`). Despues del mundo y del desenfoque del turbo, ANTES de la aureola, los
// tintes y el HUD: es un efecto de LENTE, pero el tablero no es parte de lo que la lente mira.
import { cv, ctx } from './ctx.js';
import { cfg } from '../core/state.js';
import { BRILLO_RADIO, BRILLO_FUERZA, BRILLO_ESCALA } from '../data/tuning.js';

let L = null, B = null, gl = null, gb = null;
let emitio = false;

function lienzos() {
  const w = Math.max(1, Math.round(cv.width / BRILLO_ESCALA));
  const h = Math.max(1, Math.round(cv.height / BRILLO_ESCALA));
  if (L && L.width === w && L.height === h) return;
  L = document.createElement('canvas'); L.width = w; L.height = h; gl = L.getContext('2d');
  B = document.createElement('canvas'); B.width = w; B.height = h; gb = B.getContext('2d');
}

/** Arranque de cuadro: la capa de luz empieza VACIA. La llama el orquestador al principio de
 *  `draw()`, y no `drawBrillo` al final, porque hay estados donde el resplandor no se pega (menus,
 *  pantallas): si la capa se limpiara solo al pegarla, la luz de esos cuadros se iria ACUMULANDO
 *  y el primer cuadro de juego arrancaria con una mancha de todo lo anterior. */
export function inicioLuz() {
  if (!emitio || !gl) return;
  gl.setTransform(1, 0, 0, 1, 0, 0);
  gl.clearRect(0, 0, L.width, L.height);
  emitio = false;
}

/** UNA FUENTE DE LUZ. Coordenadas de MUNDO, las mismas con las que la fuente se esta dibujando:
 *  se copia la transformacion VIVA del contexto (la escala del buffer, el giro del horizonte, el
 *  zoom, el sacudon) y se la lleva a la capa de luz, que mide 1/ESCALA. Sin esto el halo quedaria
 *  donde iria la explosion SIN rolar, y al rolar se despegarian.
 *    r      radio del halo, en unidades de mundo
 *    rgb    color, [r, g, b] 0..255
 *    a      intensidad 0..1 (se recorta: varias fuentes juntas suman, y lo que sobra es blanco) */
export function luz(c, x, y, r, rgb, a) {
  if (cfg.brillo === 'off' || !(a > 0) || !(r > 0)) return;
  lienzos();
  const m = c.getTransform(), q = 1 / BRILLO_ESCALA;
  gl.setTransform(m.a * q, m.b * q, m.c * q, m.d * q, m.e * q, m.f * q);
  const k = Math.min(1, a), [R, G, Bl] = rgb;
  const g = gl.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${R},${G},${Bl},${k})`);
  g.addColorStop(0.35, `rgba(${R},${G},${Bl},${k * 0.4})`);
  g.addColorStop(1, `rgba(${R},${G},${Bl},0)`);
  gl.globalCompositeOperation = 'lighter';
  gl.fillStyle = g;
  gl.fillRect(x - r, y - r, r * 2, r * 2);
  emitio = true;
}

/** Pega la luz del cuadro arriba del mundo. */
export function drawBrillo() {
  if (!emitio || cfg.brillo === 'off' || BRILLO_FUERZA <= 0) return;
  gb.setTransform(1, 0, 0, 1, 0, 0);
  gb.globalCompositeOperation = 'copy';
  gb.filter = `blur(${BRILLO_RADIO}px)`;
  gb.drawImage(L, 0, 0);
  gb.filter = 'none';
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = 'screen';
  ctx.globalAlpha = BRILLO_FUERZA;
  ctx.imageSmoothingEnabled = true;   // el halo es luz, no pixel art: estirarlo suave es lo correcto
  ctx.drawImage(B, 0, 0, cv.width, cv.height);
  ctx.restore();
}
