// NUCLEO DE DIBUJO: el canvas, su contexto, las medidas del mundo y las primitivas basicas.
//
// Todo el render del juego pasa por aca. Se separa para que cada modulo de pantalla pueda
// dibujar sin recibir el contexto por parametro en cada llamada.
//
// El juego se dibuja SIEMPRE en coordenadas 480x270 (W x H). El canvas real es 2x (SC) para que
// el texto y el arte queden nitidos; el escalado lo aplica el propio contexto, asi que el resto
// del codigo puede razonar en la grilla chica y olvidarse del buffer.
//
// RESOLUCION: la grilla era 320x180 y se subio a 480x270 (exactamente 1.5x) para que cada cosa
// tenga mas pixeles y admita mas detalle. HOR y F escalaron con ella: como proj() usa W/2, HOR y F
// juntos, TODO lo que se dibuja en coordenadas de MUNDO (mar, tierra, obstaculos, avion) se adapta
// solo y conserva su tamaño relativo. Lo que hubo que reescalar a mano fue lo que estaba en
// coordenadas ABSOLUTAS de pantalla: HUD, pantallas, menus y el visor del momentum.
// Las constantes de MUNDO (FLY_X, PZ, alturas de obstaculos...) NO se tocan.

export const W = 480, H = 270;
export const HOR = 96;   // fila del horizonte, en coordenadas de mundo
export const F = 135;    // distancia focal de la proyeccion (ver proj())
export const PZ = 14;    // profundidad a la que vuela el avion
export const SC = 2;     // buffer 2x

// GRILLA DE DISEÑO del HUD, las pantallas y los menus. Esas capas son texto y cajas en
// coordenadas ABSOLUTAS: subir la resolucion no les agrega detalle (el texto ya se rasteriza a la
// resolucion final del dispositivo), solo les correria todo de lugar. Por eso siguen razonando en
// 320x180 y el orquestador las dibuja con ctx.scale(U).
//
// No hay borroneo: U (1.5) x SC (2) = 3 EXACTO, asi que cada unidad de diseño cae en 3 pixeles
// enteros del buffer. De hecho el texto queda MAS nitido que antes (se rasteriza a 3x en vez de 2x).
export const DW = 320, DH = 180;
export const U = W / DW;   // 1.5 — factor de la grilla de diseño a la de mundo

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
