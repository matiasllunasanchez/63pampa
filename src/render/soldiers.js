const SRC = '../assets/world/soldats/englishsoldatv2.png';

export const sheet = new Image();
sheet.src = SRC;
/** ¿La hoja esta lista? Se PREGUNTA a la imagen en vez de guardar un flag en un `export let`:
 *  un flag depende de que nadie pise `onload` y de que el bundler propague la referencia viva.
 *  Las dos cosas ya fallaron una vez. `complete && naturalWidth` no depende de ninguna. */
export const isReady = () => sheet.complete && sheet.naturalWidth > 0;

// La hoja v2 es una GRILLA de ~128 px por fila, con las animaciones rotuladas en verde y en
// PERFIL MIRANDO A LA IZQUIERDA — que es justo hacia donde huyen del avion. La v1 era una vista
// de espaldas: se veia el ciclo de carrera pero no el rumbo.
//
// Las cajas NO estan puestas a ojo: se midieron sobre el alfa (bandas vacias entre filas,
// columnas vacias entre frames). Si se cambia la hoja hay que volver a medirlas.

// "Running" — fila y=128, mitad derecha. 6 frames corriendo hacia la IZQUIERDA.
// El alto se fija en 96 desde y=160 para TODOS: el frame 0 trae encima la etiqueta verde de la
// animacion, y su caja natural (y=144, h=112) la incluiria.
export const RUN_LEFT = [
  { x: 474, y: 160, w: 59, h: 96 },
  { x: 558, y: 162, w: 58, h: 94 },
  { x: 623, y: 160, w: 67, h: 96 },
  { x: 701, y: 160, w: 62, h: 96 },
  { x: 776, y: 160, w: 68, h: 96 },
  { x: 857, y: 160, w: 55, h: 96 },
];
// "Going prone" — fila y=512, mitad derecha, primer frame: el cuerpo ya tendido.
export const PRONE = { x: 465, y: 568, w: 113, h: 92 };

// SUAVIZADO al achicar. La hoja viene a ~96 px de alto y en juego el soldado mide 8-20: es una
// reduccion de 5x-10x. Con nearest-neighbour se caen filas enteras y el soldado TITILA al cambiar
// de frame (cada frame pierde pixeles distintos). Con suavizado la silueta queda estable, que a
// este tamaño importa mas que la nitidez — no hay detalle que preservar.
export const SMOOTH = true;

// Los frames de la hoja miran a la DERECHA, asi que se espejan cuando el soldado va hacia la
// izquierda — que es siempre, porque huyen del avion. (Se deja la condicion y no un espejo fijo:
// si algun dia un soldado corre hacia la derecha, sale bien solo.)
const flipIf = (ctx, x, dir) => { if (dir < 0) { ctx.translate(x, 0); ctx.scale(-1, 1); ctx.translate(-x, 0); } };

/** Soldado corriendo, de perfil hacia donde indica `dir`. `ph` es la fase del ciclo. */
export function drawRunBack(ctx, x, y, k, ph, dir) {
  const f = RUN_LEFT[((ph | 0) % RUN_LEFT.length + RUN_LEFT.length) % RUN_LEFT.length];
  const h = Math.max(4, k * 2.05), w = h * f.w / f.h;
  ctx.save();
  ctx.imageSmoothingEnabled = SMOOTH;
  flipIf(ctx, x, dir);
  ctx.drawImage(sheet, f.x, f.y, f.w, f.h, Math.round(x - w / 2), Math.round(y - h), Math.round(w), Math.round(h));
  ctx.restore();
}

/** Soldado cuerpo a tierra. */
export function drawProne(ctx, x, y, k, dir) {
  const f = PRONE;
  const h = Math.max(2, k * 0.95), w = h * f.w / f.h;
  ctx.save();
  ctx.imageSmoothingEnabled = SMOOTH;
  flipIf(ctx, x, dir);
  ctx.drawImage(sheet, f.x, f.y, f.w, f.h, Math.round(x - w / 2), Math.round(y - h), Math.round(w), Math.round(h));
  ctx.restore();
}
