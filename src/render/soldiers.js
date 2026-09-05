// LOS SOLDADOS — la hoja horneada de la infanteria de tierra (PLAN_HORNEADO B7).
//
// DE DONDE VIENE. Hasta esta etapa los soldados eran el UNICO habitante del juego generado por IA
// (`englishsoldatv2.png`, una lamina de ~128 px por fila con las animaciones rotuladas en verde), y
// por lo tanto el unico iluminado por otro sol que el resto del mundo. Ahora sale del horno
// (`tools/bake_soldiers.html` + `tools/models/soldiers.js`, `npm run soldados`) con los mismos tres
// focos que los enemigos, los aviones y la municion.
//
// ============================ EL ANCLAJE ES LA CELDA ============================
// Esto es lo que mas cambio, y no es un detalle de implementacion. La lamina vieja traia cada pose
// en un rectangulo distinto —seis frames de carrera de 55 a 68 px de ancho y un cuerpo a tierra de
// 113x92—, asi que este archivo guardaba TRECE numeros medidos a mano sobre el alfa, con la nota
// "si se cambia la hoja hay que volver a medirlas". Trece numeros que ninguna prueba custodiaba y
// que dependian de que alguien se acordara.
//
// La hoja horneada no los necesita: todas las poses salen de la MISMA camara, asi que la celda es
// una ventana fija al mundo —`WU` unidades de lado— con el suelo siempre en la misma fila. Dibujar
// es una sola cuenta: la celda entera, escalada por `k`, apoyada por su linea de suelo. El soldado
// corriendo y el tendido comparten el piso por construccion, no porque dos cajas coincidan.
//
// LOS DOS NUMEROS DE ABAJO SON EL CONTRATO con tools/bake_soldiers.html, que los declara igual.
// Hay una prueba en `npm run unit` que los compara: si el horneador cambia el encuadre y esto no,
// el soldado flota o se entierra y no hay error de runtime que lo delate.
const SRC = '../assets/world/soldats/soldados.png';

export const sheet = new Image();
sheet.src = SRC;
/** ¿La hoja esta lista? Se PREGUNTA a la imagen en vez de guardar un flag en un `export let`:
 *  un flag depende de que nadie pise `onload` y de que el bundler propague la referencia viva.
 *  Las dos cosas ya fallaron una vez. `complete && naturalWidth` no depende de ninguna. */
export const isReady = () => sheet.complete && sheet.naturalWidth > 0;

export const FW = 24, FH = 24;      // lado de la celda, en pixeles de la hoja
export const WU = 2.9;              // lo que mide esa celda en unidades de MUNDO
export const SUELO = 20;            // fila del piso dentro de la celda
export const PASOS = 6;             // columnas del ciclo de carrera; la 6 es el cuerpo a tierra
export const COL_TIERRA = PASOS;
/** Filas: 0 = guarnicion (mochila chica) · 1 = desembarco (bergen). La UNICA diferencia entre las
 *  dos es la silueta de la espalda, y alcanza: a 12 px no se lee otra cosa. */
export const FILA_BERGEN = 1;

// SUAVIZADO al achicar. La celda viene a 24 px y en juego el soldado mide 8-20: es una reduccion
// de 1.2x-3x. Con nearest-neighbour se caen filas enteras y el soldado TITILA al cambiar de frame
// (cada frame pierde pixeles distintos). Con suavizado la silueta queda estable, que a este tamaño
// importa mas que la nitidez — no hay detalle que preservar.
export const SMOOTH = true;

// Los frames se hornean mirando a la IZQUIERDA, que es hacia donde huyen SIEMPRE (`dir: -1` en
// systems/spawn.js: con direccion al azar algunos corrian hacia la camara y se leia como si
// cargaran contra el avion). Asi que el caso normal NO espeja nada — al reves de la lamina vieja,
// que venia mirando a la derecha y se espejaba en todos los cuadros de todas las partidas.
const flipIf = (ctx, x, dir) => { if (dir > 0) { ctx.translate(x, 0); ctx.scale(-1, 1); ctx.translate(-x, 0); } };

/** LA CUENTA UNICA: pinta la celda (col, fila) apoyada por su linea de suelo en (x, y). */
function celda(ctx, col, fila, x, y, k, dir) {
  const s = Math.max(5, k * WU);
  ctx.save();
  ctx.imageSmoothingEnabled = SMOOTH;
  flipIf(ctx, x, dir);
  ctx.drawImage(sheet, col * FW, fila * FH, FW, FH,
    Math.round(x - s / 2), Math.round(y - s * (SUELO + 1) / FH), Math.round(s), Math.round(s));
  ctx.restore();
}

/** Soldado corriendo, de perfil hacia donde indica `dir`. `ph` es la fase del ciclo. */
export function drawRunBack(ctx, x, y, k, ph, dir, bergen) {
  const col = ((ph | 0) % PASOS + PASOS) % PASOS;
  celda(ctx, col, bergen ? FILA_BERGEN : 0, x, y, k, dir);
}

/** Soldado cuerpo a tierra. */
export function drawProne(ctx, x, y, k, dir, bergen) {
  celda(ctx, COL_TIERRA, bergen ? FILA_BERGEN : 0, x, y, k, dir);
}
