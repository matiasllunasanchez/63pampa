// BOLA DE FUEGO DE FRENTE, desde hoja de sprites (assets/world/explosions/explosions_front.png).
//
// Es la explosion vista de cara: la que corresponde cuando el avion se estrella contra algo o
// cuando revienta un blanco — a diferencia del HONGO (render/boom.js), que se ve de perfil y
// crece desde el suelo.
//
// GRILLA UNIFORME de 12x3 = 36 frames. Se usa la CELDA calculada y no la caja ajustada de cada
// frame: con cajas ajustadas el centro de la bola se corre de un frame al otro y la explosion
// SALTA de posicion al animarse. La celda mantiene el centro quieto, que es lo que importa.
const SRC = '../assets/world/explosions/explosions_front.png';
export const sheet = new Image();
sheet.src = SRC;
export const isReady = () => sheet.complete && sheet.naturalWidth > 0;

// LAS CAJAS SE MIDIERON UNA POR UNA, no por grilla. Aunque la hoja PARECE una grilla de 12x3
// celdas de 85x85, el contenido se DERRAMA de una celda a la vecina: 31 de las 36 celdas teoricas
// tienen pixeles pegados al borde. Recortando por celda se veian los cortes rectangulares a los
// costados de cada bola — mitad de la explosion de al lado entraba en el frame.
// Cada caja es [x, y, w, h] del alfa real, y se dibuja CENTRADA: la bola es casi simetrica, asi
// que centrar la caja mantiene el foco quieto mientras la llamarada cambia de tamaño.
const F = (x, y, w, h) => ({ x, y, w, h });
export const FRAMES = [
  F(14, 23, 36, 39), F(57, 16, 49, 54), F(118, 8, 65, 69), F(189, 4, 71, 74),
  F(267, 4, 72, 76), F(346, 6, 76, 76), F(434, 8, 73, 72), F(530, 2, 74, 80),
  F(626, 2, 82, 82), F(732, 7, 78, 75), F(835, 9, 78, 73), F(940, 10, 76, 72),
  F(21, 92, 67, 79), F(113, 86, 77, 80), F(223, 93, 65, 71), F(327, 91, 63, 69),
  F(438, 99, 50, 55), F(528, 85, 80, 85), F(626, 86, 84, 85), F(731, 90, 81, 81),
  F(834, 92, 80, 78), F(937, 94, 79, 76),
  F(15, 171, 77, 83), F(115, 172, 81, 84), F(215, 174, 82, 78), F(321, 177, 79, 77),
  F(424, 178, 78, 76), F(530, 182, 76, 72), F(632, 171, 76, 83), F(735, 171, 77, 83),
  F(837, 182, 76, 72),
];
export const NF = FRAMES.length;
/** Duracion del ciclo en segundos. Corta a proposito: es un fogonazo, no una nube. */
export const DUR = 1.15;
/** Diametro de la bola en unidades de MUNDO, para escala 1 (bomba reventada en el aire). */
export const SIZE = 26;
// alto de referencia: contra este se escalan los frames, asi los chicos del principio salen
// chicos de verdad en vez de estirarse al tamaño de la bola desplegada
const H_REF = 85;

/** Dibuja la bola de fuego de `o` (usa o.boomT y o.scale) a la escala de pantalla `k`. */
export function drawBlast(ctx, proj, o, k) {
  const t = o.boomT / DUR;
  if (t >= 1) return;                                  // ya termino: no dibuja nada
  const f = FRAMES[Math.min(NF - 1, (t * NF) | 0)];
  const s = proj(o.x, o.y, o.z);
  const esc = SIZE * (o.scale || 1) * k / H_REF;       // px de mundo por px de la hoja
  const w = f.w * esc, h = f.h * esc;
  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(sheet, f.x, f.y, f.w, f.h, Math.round(s.x - w / 2), Math.round(s.y - h / 2), Math.round(w), Math.round(h));
  ctx.restore();
}
