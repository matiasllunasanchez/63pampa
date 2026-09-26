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

// EL TEÑIDO, UNA VEZ POR COLOR. Era uno solo (el acento) hasta que la SUELTA pidio la misma mira
// en verde encima del buque (26/9/2026): ahora la hoja cruda se guarda y cada color se hornea la
// primera vez que se pide, no en cada cuadro. Son dos o tres canvas de 626 px en toda la partida.
const SHEET = { img: new Image(), ready: false, crudo: null, tintes: {} };
SHEET.img.onload = () => {
  const c = document.createElement('canvas');
  c.width = SHEET.img.naturalWidth; c.height = SHEET.img.naturalHeight;
  c.getContext('2d').drawImage(SHEET.img, 0, 0);
  SHEET.crudo = c; SHEET.ready = true;
};
SHEET.img.src = '../assets/ui/miras.webp';

/** La hoja teñida de `col`, horneada la primera vez. `source-in` conserva el alfa del dibujo y le
 *  cambia el color, asi que el verde del asset no manda. */
function hoja(col) {
  if (SHEET.tintes[col]) return SHEET.tintes[col];
  const o = SHEET.crudo, c = document.createElement('canvas');
  c.width = o.width; c.height = o.height;
  const x = c.getContext('2d');
  x.drawImage(o, 0, 0);
  x.globalCompositeOperation = 'source-in';
  x.fillStyle = col; x.fillRect(0, 0, c.width, c.height);
  SHEET.tintes[col] = c;
  return c;
}

/** Dibuja la mira `id` (1..9) centrada en (cx, cy) con `size` de lado. `col` la tiñe de otro color
 *  (por defecto, el acento del juego). Devuelve false si la hoja todavia no cargo, para que quien
 *  llama pueda pintar su propio fallback. */
export function drawMira(id, cx, cy, size, alpha, col) {
  if (!SHEET.ready || !SHEET.crudo) return false;
  const tint = hoja(col || P.accent);
  const b = BOX[Math.max(0, Math.min(BOX.length - 1, (id | 0) - 1))];
  const h = size * b.sh / b.sw;
  const sm = ctx.imageSmoothingEnabled;
  ctx.globalAlpha = alpha == null ? 1 : alpha;
  ctx.imageSmoothingEnabled = true;   // se baja de ~150px a ~17: el suavizado lee mucho mejor
  ctx.drawImage(tint, b.sx, b.sy, b.sw, b.sh, cx - size / 2, cy - h / 2, size, h);
  ctx.globalAlpha = 1;
  ctx.imageSmoothingEnabled = sm;
  return true;
}
