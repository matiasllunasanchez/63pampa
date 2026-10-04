// EL FUEGO Y EL HUMO HORNEADOS (4/10/2026). Pedido del autor: "el fuego detras de los Harrier y el fuego
// en los buques es demasiado cuadrado, ¿podemos usar Blender para hacer fuego? ¿y el humo tambien?".
// Hasta hoy se dibujaban por codigo con rectangulos apilados (render/caza.js, render/blanco.js,
// render/pulso.js); ahora salen de dos hojas que hornea Blender (tools/blender/modelos_fuego.py):
//
//   fuego.png   la LLAMA de pie: 8 cuadros de parpadeo x 2 variantes (filas), 32x48, la base al pie
//   humo.png    BOCANADAS con luz en bandas: 8 formas x 2 tonos (fila 0 negro de incendio, 1 gris), 32x32
//
// Cada funcion devuelve false si la hoja no esta (o si se juega con el horno viejo, `?horno=three`): el
// que llama cae a su dibujo de siempre. Ninguna pieza depende de que un PNG exista.
import { ctx } from './ctx.js';
import { HORNO_VIEJO } from '../data/horno.js';

// Rutas como LITERALES SUELTOS: tools/build_web.py re-embebe buscando el literal exacto.
const LLAMA = { src: '../assets/world/explosions/fuego.png', img: new Image(), fw: 32, fh: 48 };
const HUMO = { src: '../assets/world/explosions/humo.png', img: new Image(), fw: 32, fh: 32 };
if (!HORNO_VIEJO) for (const h of [LLAMA, HUMO]) h.img.src = h.src;

const lista = h => !HORNO_VIEJO && h.img.complete && h.img.naturalWidth > 0;
const CUADROS = 8;
// la base de la llama esta a 2,5 px del pie del cuadro de 48 (la camara del horno la deja asi)
const PIE_LLAMA = 45.5 / 48;

/** UNA LLAMA de pie con la base en (x, baseY). `alto` = el alto del CUADRO en pantalla (la llama ocupa
 *  unos tres cuartos). `t` = reloj (el parpadeo); `semilla` desfasa las llamas vecinas y elige la
 *  variante, asi dos focos juntos no laten igual. */
export function llama(x, baseY, alto, t, semilla = 0) {
  if (!lista(LLAMA)) return false;
  const c = (Math.floor(t * 14 + semilla * 3) % CUADROS + CUADROS) % CUADROS;
  const fila = Math.abs(semilla) % 2;
  const w = alto * LLAMA.fw / LLAMA.fh;
  ctx.drawImage(LLAMA.img, c * LLAMA.fw, fila * LLAMA.fh, LLAMA.fw, LLAMA.fh, x - w / 2, baseY - alto * PIE_LLAMA, w, alto);
  return true;
}

/** UNA BOCANADA de humo centrada en (x, y), de `d` en pantalla. `forma` elige cual de las ocho (fija
 *  por bocanada: no parpadea, sube); `tono` 'negro' (incendio) o 'gris'. El alfa lo pone el que llama. */
export function humo(x, y, d, forma = 0, tono = 'negro') {
  if (!lista(HUMO)) return false;
  const c = (Math.floor(forma) % CUADROS + CUADROS) % CUADROS;
  ctx.drawImage(HUMO.img, c * HUMO.fw, tono === 'gris' ? HUMO.fh : 0, HUMO.fw, HUMO.fh, x - d / 2, y - d / 2, d, d);
  return true;
}
