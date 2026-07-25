// MIRAS: la hoja assets/miras.webp — 9 miras en grilla 3x3, verdes sobre transparente.
//
// Vive suelto (y no dentro de render/plane.js) porque lo usan DOS lados: el avion, que dibuja la
// mira en vuelo, y el menu de configuracion, que muestra una vista previa de la elegida.
//
// Se TIÑE una sola vez al cargar (source-in: conserva el alfa del dibujo y le cambia el color), asi
// que el verde del asset no manda — la mira sale en el acento del juego y no desentona con el HUD.

import { ctx } from './ctx.js';
import { P } from '../data/palette.js';

// Recuadros MEDIDOS al pixel sobre el contenido real de cada celda. No son tercios exactos: cada
// celda de la hoja tiene distinto aire alrededor, y cortar a 626/3 las dejaba descentradas.
const BOX = [
  { sx: 35, sy: 27, sw: 156, sh: 156 }, { sx: 236, sy: 28, sw: 154, sh: 154 }, { sx: 455, sy: 42, sw: 127, sh: 127 },
  { sx: 49, sy: 240, sw: 128, sh: 127 }, { sx: 237, sy: 228, sw: 152, sh: 152 }, { sx: 441, sy: 226, sw: 155, sh: 156 },
  { sx: 49, sy: 441, sw: 128, sh: 127 }, { sx: 237, sy: 429, sw: 152, sh: 152 }, { sx: 456, sy: 439, sw: 126, sh: 132 },
];

export const MIRA_COUNT = BOX.length;
export const MIRA_IDS = BOX.map((_, i) => i + 1);   // 1..9 — lo que se guarda en cfg.mira

const SHEET = { img: new Image(), ready: false, tint: null };
SHEET.img.onload = () => {
  const c = document.createElement('canvas');
  c.width = SHEET.img.naturalWidth; c.height = SHEET.img.naturalHeight;
  const x = c.getContext('2d');
  x.drawImage(SHEET.img, 0, 0);
  x.globalCompositeOperation = 'source-in';
  x.fillStyle = P.accent; x.fillRect(0, 0, c.width, c.height);
  SHEET.tint = c; SHEET.ready = true;
};
SHEET.img.src = '../assets/ui/miras.webp';

/** Dibuja la mira `id` (1..9) centrada en (cx, cy) con `size` de lado. Devuelve false si la hoja
 *  todavia no cargo, para que quien llama pueda pintar su propio fallback. */
export function drawMira(id, cx, cy, size, alpha) {
  if (!SHEET.ready || !SHEET.tint) return false;
  const b = BOX[Math.max(0, Math.min(BOX.length - 1, (id | 0) - 1))];
  const h = size * b.sh / b.sw;
  const sm = ctx.imageSmoothingEnabled;
  ctx.globalAlpha = alpha == null ? 1 : alpha;
  ctx.imageSmoothingEnabled = true;   // se baja de ~150px a ~17: el suavizado lee mucho mejor
  ctx.drawImage(SHEET.tint, b.sx, b.sy, b.sw, b.sh, cx - size / 2, cy - h / 2, size, h);
  ctx.globalAlpha = 1;
  ctx.imageSmoothingEnabled = sm;
  return true;
}
