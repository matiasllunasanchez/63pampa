// LOS RETRATOS, con UN solo cache para todo el render.
//
// Vivian adentro de render/screens.js (el `lazyImg` de las cajas de dialogo) y el HUD no los podia
// usar: hud.js no puede importar screens.js, porque screens ya importa de hud (el techo del
// tablero, la caja de la cinta) y el ciclo dejaria a `HUD_TECHO` sin inicializar al arrancar.
// Sacarlos aca es lo que deja que el CUADRO DEL PILOTO (hud.js) y las cajas de dialogo
// (screens.js) lean la misma imagen del mismo cache — una cara, una carga.
//
// La cascada es la de siempre: si el asset falta o todavia no cargo, `retrato()` devuelve null y
// el que dibuja pone la SILUETA. Nada revienta por un retrato que no esta.
import { ctx } from './ctx.js';

const IMGS = new Map();

/** La imagen de `assets/portraits/<name>.png`, o null si falta o todavia no cargo. */
export function retrato(name) {
  if (!name) return null;
  let e = IMGS.get(name);
  if (!e) {
    e = { img: new Image(), ok: false };
    e.img.onload = () => { e.ok = true; };
    e.img.src = '../assets/portraits/' + name + '.png';
    IMGS.set(name, e);
  }
  return e.ok ? e.img : null;
}

/** El busto de respaldo: la misma silueta que usan las cajas de dialogo. */
export function silueta(x, y, ps) {
  const u = ps / 36;
  ctx.fillStyle = '#22303b';
  ctx.fillRect(x + 13 * u, y + 6 * u, 10 * u, 11 * u);
  ctx.fillRect(x + 6 * u, y + 20 * u, 24 * u, 16 * u);
}
