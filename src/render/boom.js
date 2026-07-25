// HONGO de la explosion, desde hoja de sprites (assets/world/explosions/bomb.png).
//
// La hoja trae el CICLO COMPLETO en una grilla de 6x3, leida por filas:
//   fila 0  destello -> columna que sube -> hongo naranja formandose y creciendo
//   fila 1  el hongo se enfria a humo blanco
//   fila 2  se apaga a gris oscuro y se disipa
// 18 frames que cuentan la vida entera de la explosion. El dibujo procedural anterior tenia que
// fingir ese arco con dos rectangulos y un lerp de color.
//
// Las cajas se midieron sobre el alfa (bandas vacias entre filas y columnas), no a ojo.

const SRC = '../assets/world/explosions/bomb.png';
export const sheet = new Image();
sheet.src = SRC;
export const isReady = () => sheet.complete && sheet.naturalWidth > 0;

const F = (x, y, w, h) => ({ x, y, w, h });
export const FRAMES = [
  F(21, 0, 110, 166), F(188, 0, 110, 166), F(360, 0, 120, 166), F(529, 0, 132, 166), F(685, 0, 163, 166), F(858, 0, 166, 166),
  F(7, 188, 141, 170), F(173, 188, 142, 170), F(349, 188, 142, 170), F(522, 188, 143, 170), F(685, 188, 162, 170), F(858, 188, 166, 170),
  F(7, 382, 141, 168), F(173, 382, 142, 168), F(348, 382, 143, 168), F(522, 382, 143, 168), F(682, 382, 166, 168), F(861, 382, 163, 168),
];

// DURACION del ciclo, en segundos. Tiene que coincidir con la ventana en la que el hongo hace
// daño (ver collision.js: boomT < 4.5) y con la poda de obstaculos (boomT > 6): si el sprite
// terminara antes, quedaria una zona de daño invisible.
export const DUR = 6;
// ALTO del hongo en unidades de MUNDO cuando esta desplegado. El sprite se ancla al SUELO y se
// escala a esto; el alto de la zona de daño (collision.js) se calcula aparte y sigue el mismo arco.
export const H_WORLD = 40;

/** Dibuja el hongo de `o` a la escala `k`, anclado al piso. */
export function drawBoom(ctx, px, proj, o, k) {
  const t = Math.max(0, Math.min(0.999, o.boomT / DUR));
  const f = FRAMES[(t * FRAMES.length) | 0];
  const base = proj(o.x, 0, o.z);
  // los primeros frames son el destello y la columna: ocupan menos alto que el hongo desplegado,
  // asi que la escala crece con el ciclo en vez de ser fija (si no, el destello saldria gigante)
  const grow = Math.min(1, 0.35 + o.boomT / 1.2);
  const h = H_WORLD * grow * k, w = h * f.w / f.h;
  ctx.save();
  ctx.imageSmoothingEnabled = true;      // reduccion grande: nearest deja el humo con escalones
  ctx.globalAlpha = o.boomT > DUR - 1.2 ? Math.max(0, (DUR - o.boomT) / 1.2) : 1;   // se disipa
  ctx.drawImage(sheet, f.x, f.y, f.w, f.h, Math.round(base.x - w / 2), Math.round(base.y - h), Math.round(w), Math.round(h));
  ctx.restore();
}
