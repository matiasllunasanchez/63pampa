// LAS HOJAS DE CERCA (23/11/2026, el autor: "como hago para que los aviones en el despegue que estan cerca se vean
// mejor? … y con fade se intercambien entre un sprite y otro"). La vista BASE horneada al DOBLE (tools/blender/
// hornear_hd.py: `sheet_hd.png`, `skin_<x>_hd.png`, `tren_hd.png`), mismo cuadro y mismo encuadre que la de 84.
// Cuando el sprite se dibuja grande (cada pixel de la hoja ocupa mas de ~1,4 pixeles de pantalla) la de cerca se
// FUNDE encima de la de siempre; al achicarse se apaga. No se agranda nada: el cuadro destino es el mismo.
//
// Se busca POR LA IMAGEN BASE: cualquier hoja del A-4 que tenga su `_hd` al lado la encuentra sola, sin tocar
// data/planes.js ni data/skins.js. Si no cargo (build web, horno viejo) devuelve null y se dibuja como siempre.
import { ctx } from './ctx.js';
import { SHEET_FW } from '../data/planes.js';

const CON_HD = /a4-skyhawk\/(sheet|skin_[a-z]+|tren)\.png(\?.*)?$/;
const HD = new Map();
export const HD_DESDE = 1.4, HD_HASTA = 2.0;   // pixeles de pantalla por pixel de la hoja base

export function hojaHd(img) {
  if (!img || !img.src || globalThis.__sinHd) return null;   // (__sinHd: para comparar antes/despues en una captura)
  let h = HD.get(img);
  if (h === undefined) {
    h = null;
    if (CON_HD.test(img.src) && !/\/three\//.test(img.src)) { h = new Image(); h.src = img.src.replace(/\.png(\?.*)?$/, '_hd.png$1'); }
    HD.set(img, h);
  }
  return h && h.complete && h.naturalWidth ? h : null;
}

/** Cuanto de la hoja de cerca va (0..1) para un sprite de `dW` de ancho, con la transformacion actual del ctx. */
export function mezclaHd(dW, px) {
  const m = ctx.getTransform();
  const k = dW / (SHEET_FW * (px || 1)) * Math.hypot(m.a, m.b);
  const t = Math.max(0, Math.min(1, (k - HD_DESDE) / (HD_HASTA - HD_DESDE)));
  return t * t * (3 - 2 * t);
}

/** Dibuja ENCIMA el mismo cuadro de la hoja de cerca, fundido. `sx..sh` es el recorte en la hoja base. */
export function encimaHd(img, sx, sy, sw, sh, x, y, w, h, a) {
  const hd = a > 0.01 ? hojaHd(img) : null;
  if (!hd) return;
  const r = hd.naturalWidth / img.naturalWidth;
  const a0 = ctx.globalAlpha;
  ctx.globalAlpha = a0 * a;
  ctx.drawImage(hd, sx * r, sy * r, sw * r, sh * r, x, y, w, h);
  ctx.globalAlpha = a0;
}
