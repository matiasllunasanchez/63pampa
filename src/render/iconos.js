// EL DIBUJO DE UN ICONO DEL TABLERO. La tabla de que hay y que letra lo reemplaza mientras tanto
// vive en data/iconos.js; aca solo se dibuja.
import { ctx } from './ctx.js';
import { ICONOS } from '../data/iconos.js';

const IMGS = new Map();

function img(png) {
  let e = IMGS.get(png);
  if (!e) {
    e = { img: new Image(), ok: false };
    e.img.onload = () => { e.ok = true; };
    e.img.src = '../assets/hud/' + png;
    IMGS.set(png, e);
  }
  return e.ok ? e.img : null;
}

/** Dibuja el icono `nombre` CENTRADO en (cx, cy) y a su tamaño natural: el PNG si lo hay, si no su
 *  dibujo en pixeles (`pix`), y si no la letra. `col` pinta los '#' y `col2` los '+'. */
export function iconoEn(cx, cy, nombre, col, col2) {
  const d = ICONOS[nombre];
  if (!d) return;
  const w = d.pix ? d.pix[0].length : 7, h = d.pix ? d.pix.length : 7;
  const x0 = Math.round(cx - (w - 1) / 2), y0 = Math.round(cy - (h - 1) / 2);
  const im = d.png ? img(d.png) : null;
  if (im) { ctx.drawImage(im, x0, y0, w, h); return; }
  if (!d.pix) { icono(x0, y0, 7, nombre, col); return; }
  for (let j = 0; j < h; j++) {
    for (let i = 0; i < w; i++) {
      const c = d.pix[j][i];
      if (c !== '#' && c !== '+') continue;
      ctx.fillStyle = c === '+' ? (col2 || d.col2 || col) : col;
      ctx.fillRect(x0 + i, y0 + j, 1, 1);
    }
  }
}

/** Dibuja el icono `nombre` en un cuadrado de `lado`. Sin PNG todavia, dibuja su letra. */
export function icono(x, y, lado, nombre, col, col2) {
  const d = ICONOS[nombre];
  if (!d) return;
  if (d.pix && !d.png) { iconoEn(x + (lado - 1) / 2, y + (lado - 1) / 2, nombre, col, col2); return; }
  const im = d.png ? img(d.png) : null;
  if (im) { ctx.drawImage(im, Math.round(x), Math.round(y), lado, lado); return; }
  ctx.font = 'bold 5px monospace'; ctx.textAlign = 'center';
  ctx.fillStyle = col;
  ctx.fillText(d.letra, Math.round(x + lado / 2), Math.round(y + lado - 1));
  ctx.textAlign = 'left';
}
