// LA MUNICION HORNEADA — la hoja de sprites de bombas y misiles.
//
// Misma cadena que los aviones: modelo low-poly en three.js (tools/bake_ammo.html) → hoja de
// sprites (`npm run ammo`) → esto, que la lee. El juego NO tiene el modelo: tiene el PNG.
//
// FORMATO (ver el encabezado de bake_ammo.html): 6 columnas x 2 filas de 16x16.
//   filas    BOMBA / MISIL
//   columnas ANGULO DE VISTA: 0 = de cola pura (se aleja de frente) … 5 = casi de costado.
//
// POR QUE LA GRILLA ES ESA, y no la de alabeo x cabeceo de los aviones: un proyectil NO ROLA. Sale
// de cola y, a medida que cae o se desvia, se lo empieza a ver de costado. Eso es lo unico que
// cambia, asi que es lo unico que se hornea.
//
// SIEMPRE HAY PLAN B. Si la hoja no cargo —build web sin el asset, primer cuadro antes del
// onload— `lista()` da false y quien dibuja cae a su receta de rectangulos. Es la misma regla que
// la cabina y las hojas de aviones: un asset que falta nunca deja un agujero en la pantalla.
import { ctx } from './ctx.js';

const HOJA = { src: '../assets/ammo/municion.png', img: new Image(), ready: false };
HOJA.img.onload = () => { HOJA.ready = true; };
HOJA.img.src = HOJA.src;

const FW = 16, FH = 16, VISTAS = 6;
export const BOMBA = 0, MISIL = 1;

export const lista = () => HOJA.ready && HOJA.img.naturalWidth > 0;

/** Dibuja una municion centrada en (x, y).
 *
 *  @param fila  BOMBA o MISIL
 *  @param v     0..1 — cuanto se la ve DE COSTADO. 0 es de cola pura (alejandose derecho); 1 es
 *               casi de perfil. Quien llama lo saca de su trayectoria: una bomba que cae se va
 *               tumbando, un misil que se aleja derecho se queda en 0.
 *  @param caja  alto del frame en pixeles de pantalla. El proyectil ocupa como dos tercios de eso.
 */
export function dibujar(fila, v, x, y, caja) {
  if (!lista()) return false;
  const col = Math.max(0, Math.min(VISTAS - 1, Math.round(v * (VISTAS - 1))));
  // ENTERO Y SIN SUAVIZADO: media escala de pixel art es un borrón. Se redondea el tamaño Y la
  // posicion — un sprite en x.5 se dibuja interpolado aunque el suavizado este apagado.
  const s = Math.max(2, Math.round(caja));
  const sm = ctx.imageSmoothingEnabled;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(HOJA.img, col * FW, fila * FH, FW, FH,
    Math.round(x - s / 2), Math.round(y - s / 2), s, s);
  ctx.imageSmoothingEnabled = sm;
  return true;
}
