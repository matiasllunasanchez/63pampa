// LA VEGETACION HORNEADA (4/10/2026). Pedido del autor: "hace la vegetacion" — con fotos del campo de
// las islas: matas de pasto blanco y tussac, manchones de murtilla, tojo en flor, cortadera y las
// piedras blancas de cuarcita que afloran en las lomas. "No hay arboles" y "variar los colores de los
// arbustos entre verdes y amarillos o marrones claros segun el dia y la luz".
//
// La hoja la hornea Blender (tools/blender/modelos_vegetacion.py): assets/world/elements/matas.png,
// 6 variantes x 6 filas de 32x32, el suelo a 2,4 px del pie de cada celda:
//   0 pasto blanco / tussac   1 murtilla   2 tojo   — EN GRIS: se tiñen aca
//   3 las FLORES del tojo solas, en su amarillo (se dibujan encima, sin teñir)
//   4 cortadera (en gris)     5 piedras de cuarcita (en su color)
//
// EL TINTE: el gris se multiplica por el color de la mata (como las partes del despiece, render/
// partes.js), y ese color sale del TEMA — el verde del pasto del clima — corrido hacia el AMARILLO
// PAJA o el MARRON CLARO segun la mata. Como el tema cambia con el cielo, el campo cambia con el dia.
// Si la hoja no esta (o se juega con `?horno=three`), quien llama cae a sus rectangulos de siempre.
import { ctx } from './ctx.js';
import { HORNO_VIEJO } from '../data/horno.js';

const HOJA = { src: '../assets/world/elements/matas.png', img: new Image() };
if (!HORNO_VIEJO) HOJA.img.src = HOJA.src;
const FW = 32, FH = 32, VARIANTES = 6;
const PIE = 29.6 / 32;                     // donde cae el suelo en la celda (la camara del horno)
export const lista = () => !HORNO_VIEJO && HOJA.img.complete && HOJA.img.naturalWidth > 0;

export const FILA = { pasto: 0, murtilla: 1, tojo: 2, flores: 3, cortadera: 4, piedra: 5 };

const PAJA = [0xc9, 0xb2, 0x66], MARRON = [0xa8, 0x86, 0x58];
const rgb = c => {
  if (c[0] === '#') { const n = parseInt(c.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  const m = c.match(/\d+/g); return m ? m.slice(0, 3).map(Number) : [128, 128, 128];
};
const mezcla = (a, b, t) => 'rgb(' + a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(',') + ')';

/** EL COLOR DE UNA MATA: el verde del pasto del clima (`base`, el `tuft` del tema), corrido hacia la
 *  paja o el marron claro segun `h` (0..1, el hash de la mata). Tres familias y no un continuo: el
 *  cache de hojas teñidas queda chico, y el campo se lee manchado, no ruidoso. */
export function tono(base, h) {
  const b = rgb(base);
  return h < 0.45 ? mezcla(b, b, 0) : h < 0.78 ? mezcla(b, PAJA, 0.55) : mezcla(b, MARRON, 0.5);
}

const cache = new Map();
function teñida(c) {
  let cv = cache.get(c);
  if (cv) return cv;
  if (cache.size > 48) cache.clear();      // los temas cambian: que no crezca sin tope
  cv = document.createElement('canvas');
  cv.width = HOJA.img.naturalWidth; cv.height = HOJA.img.naturalHeight;
  const g = cv.getContext('2d');
  g.drawImage(HOJA.img, 0, 0);
  g.globalCompositeOperation = 'multiply';
  g.fillStyle = c; g.fillRect(0, 0, cv.width, cv.height);
  g.globalCompositeOperation = 'destination-in';     // el multiply pinta tambien lo transparente
  g.drawImage(HOJA.img, 0, 0);
  cache.set(c, cv);
  return cv;
}

function celda(img, fila, v, x, sueloY, alto) {
  const w = alto * FW / FH;
  ctx.drawImage(img, (v % VARIANTES) * FW, fila * FH, FW, FH, x - w / 2, sueloY - alto * PIE, w, alto);
}

/** UNA MATA con la base en (x, sueloY). `alto` = el alto de la CELDA en pantalla (la mata ocupa entre
 *  un tercio y la mitad). `h` (0..1, el hash de la mata) elige la especie, la variante, el tono y si
 *  el tojo esta en flor. `base` = el verde del pasto del clima. Devuelve false si la hoja no esta. */
export function mata(x, sueloY, alto, h, base) {
  if (!lista()) return false;
  const v = Math.floor(h * 997) % VARIANTES;
  const especie = h < 0.50 ? 'pasto' : h < 0.70 ? 'murtilla' : h < 0.90 ? 'tojo' : 'cortadera';
  const c = tono(base, (h * 7.31) % 1);
  celda(teñida(c), FILA[especie], v, x, sueloY, alto);
  if (especie === 'tojo' && (h * 13.7) % 1 < 0.65) celda(HOJA.img, FILA.flores, v, x, sueloY, alto);
  return true;
}

/** UN AFLORAMIENTO DE PIEDRAS BLANCAS (donde antes el juego ponia un arbol: en las islas no hay). */
export function piedras(x, sueloY, alto, h) {
  if (!lista()) return false;
  celda(HOJA.img, FILA.piedra, Math.floor(h * 991) % VARIANTES, x, sueloY, alto);
  return true;
}

// ============================ EL PASTO DEL SUELO ============================
// assets/world/elements/pasto.png (tools/blender/modelos_vegetacion.py, `brizna`): 8 matojos x 3 estados
// de viento (fila 0 parado, 1 doblado, 2 acostado), 24x24 en gris, el suelo a 2,15 px del pie. Los tiñe
// el color de pasto que render/world.js ya elige para cada matojo (los seis tonos del clima).
const PASTO = { src: '../assets/world/elements/pasto.png', img: new Image() };
if (!HORNO_VIEJO) PASTO.img.src = PASTO.src;
const PFW = 24, PIE_PASTO = 21.85 / 24, ACOSTADO = 0.68;
const cachePasto = new Map();

/** UN MATOJO con la base en (x, sueloY): `alto` el alto de la CELDA en pantalla (el matojo ocupa la
 *  mitad), `h` (0..1) elige cual de los ocho, `lean` es el `pastoLean` de render/world.js (0 parado ..
 *  0,68 acostado) y elige la fila de viento, `color` el tono de pasto. false si la hoja no esta. */
export function matojo(x, sueloY, alto, h, lean, color) {
  if (HORNO_VIEJO || !PASTO.img.complete || !PASTO.img.naturalWidth) return false;
  let cv = cachePasto.get(color);
  if (!cv) {
    if (cachePasto.size > 32) cachePasto.clear();
    cv = document.createElement('canvas');
    cv.width = PASTO.img.naturalWidth; cv.height = PASTO.img.naturalHeight;
    const g = cv.getContext('2d');
    g.drawImage(PASTO.img, 0, 0);
    g.globalCompositeOperation = 'multiply'; g.fillStyle = color; g.fillRect(0, 0, cv.width, cv.height);
    g.globalCompositeOperation = 'destination-in'; g.drawImage(PASTO.img, 0, 0);
    cachePasto.set(color, cv);
  }
  const fila = lean < ACOSTADO * 0.25 ? 0 : lean < ACOSTADO * 0.75 ? 1 : 2;
  const c = Math.floor(h * 977) % 8;
  ctx.drawImage(cv, c * PFW, fila * PFW, PFW, PFW, x - alto / 2, sueloY - alto * PIE_PASTO, alto, alto);
  return true;
}
