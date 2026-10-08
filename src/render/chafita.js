// EL TUBO DE CHAFITAS HORNEADO (8/10/2026, el autor: "en Blender tienen que estar horneados tambien,
// son cilindros de 16 cm"). La hoja la hace tools/blender (hojas.py `chafita`, modelos_partes.py
// `municion_chafita`): 6 vistas de 16x16, de punta (0) a de costado (5), el tubo PARADO en el cuadro y
// ocupando la mitad de su alto.
//
// Quien dibuja (game.js, drawChapitas) pone el resto: el GIRO en el plano —el tubo da vueltas en el
// aire— y el destello. Encima va el FILO DE LUZ de los aviones (render/borde.js): brillan como ellos.
//
// SIEMPRE HAY PLAN B, como la municion: sin la hoja `dibujar` devuelve false y quien llama cae a su
// raya de siempre.
import { ctx } from './ctx.js';
import { drawBorde } from './borde.js';

const HOJA = { src: '../assets/ammo/chafita.png', img: new Image(), ready: false };
HOJA.img.onload = () => { HOJA.ready = true; };
HOJA.img.src = HOJA.src;

const FW = 16, FH = 16, VISTAS = 6;

export const lista = () => HOJA.ready && HOJA.img.naturalWidth > 0;

/** Dibuja un tubo centrado en (x, y).
 *  @param v      0..1 — cuanto se lo ve DE COSTADO (0 de punta, 1 de perfil): al tumbarse cambia
 *  @param ang    el giro en el plano de la pantalla (radianes; 0 = parado)
 *  @param largo  el largo del tubo en pixeles de pantalla (el cuadro mide el doble) */
export function dibujar(v, ang, x, y, largo) {
  if (!lista()) return false;
  const col = Math.max(0, Math.min(VISTAS - 1, Math.round(v * (VISTAS - 1))));
  const s = Math.max(2, Math.round(largo * 2));
  const sm = ctx.imageSmoothingEnabled;
  ctx.imageSmoothingEnabled = false;
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y)); ctx.rotate(ang);
  ctx.drawImage(HOJA.img, col * FW, 0, FW, FH, -s / 2, -s / 2, s, s);
  drawBorde(ctx, HOJA.img, col * FW, 0, FW, FH, -s / 2, -s / 2, s, s);
  ctx.restore();
  ctx.imageSmoothingEnabled = sm;
  return true;
}
