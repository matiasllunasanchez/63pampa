// NUCLEO DE DIBUJO: el canvas, su contexto, las medidas del mundo y las primitivas basicas.
//
// Todo el render del juego pasa por aca. Se separa para que cada modulo de pantalla pueda
// dibujar sin recibir el contexto por parametro en cada llamada.
//
// El juego se dibuja SIEMPRE en coordenadas 320x180 (W x H). El canvas real es 2x (SC) para que
// el texto y el arte queden nitidos; el escalado lo aplica el propio contexto, asi que el resto
// del codigo puede razonar en la grilla chica y olvidarse del buffer.

export const W = 320, H = 180;
export const HOR = 64;   // fila del horizonte, en coordenadas de mundo
export const F = 90;     // distancia focal de la proyeccion (ver proj())
export const PZ = 14;    // profundidad a la que vuela el avion
export const SC = 2;     // buffer 2x

export const cv = document.getElementById('g');
export const ctx = cv.getContext('2d');
cv.width = W * SC;
cv.height = H * SC;

/** Rectangulo de pixeles alineado a la grilla. Es la primitiva mas usada del juego (~160 sitios):
 *  redondea para que el arte quede pegado al pixel y nunca dibuja menos de 1x1. */
export function px(x, y, w, h, c) {
  ctx.fillStyle = c;
  ctx.fillRect(Math.round(x), Math.round(y), Math.max(1, Math.round(w)), Math.max(1, Math.round(h)));
}

/** Velo semitransparente sobre todo el mundo: la base de las pantallas de menu y de fin. */
export function panel() { ctx.fillStyle = '#0d1216cc'; ctx.fillRect(0, 0, W, H); }

/** Escribe texto ajustado a un ancho maximo, cortando entre palabras y bajando `lh` por linea.
 *  A diferencia de wrapChars (que mide en caracteres), este mide en PIXELES con la tipografia
 *  activa del contexto — por eso vive aca y no en core/util.js. */
export function wrapText(txt, x, y, maxW, lh) {
  const words = txt.split(' '); let line = '', yy = y;
  for (const w of words) {
    if (ctx.measureText(line + w).width > maxW && line) { ctx.fillText(line, x, yy); line = w + ' '; yy += lh; }
    else line += w + ' ';
  }
  ctx.fillText(line.trim(), x, yy);
}
