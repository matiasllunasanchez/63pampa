// EL WEBP EN LUGAR DEL PNG (27/11/2026, ver tools/webp.js). Todo el juego sigue pidiendo `../assets/…/x.png` —las
// rutas que arma cada modulo, las `_hd`, las skins, las variantes— y aca, en UN solo lugar, la imagen pide
// `../assets/webp/…/x.webp` si ese png tiene su webp sin perdida (la lista la genera tools/webp.js).
//
// `img.src` sigue DEVOLVIENDO la ruta del png: hay codigo que la lee para armar otra (hojaHd: `_hd.png` al
// lado de la base) y tiene que seguir viendo lo que pidio.
//
// Solo en Electron (`RASANTE_APP`, el preload): el build web embebe sus imagenes y no lleva assets/webp/.
// Va PRIMERO en game.js: tiene que estar puesto antes de que cualquier modulo cree una imagen al cargarse.
import { WEBP } from '../data/webp_lista.js';

const ACTIVO = typeof window !== 'undefined' && window.RASANTE_APP === true && typeof HTMLImageElement !== 'undefined'
  && WEBP.length > 0 && !/[?&]png\b/.test(location.search);   // (`?png`: con los PNG de siempre, para comparar)

if (ACTIVO) {
  const HAY = new Set(WEBP);
  const nativo = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
  const pedido = new WeakMap();
  const RE = /(^|\/)assets\/([^?#]+\.png)([?#].*)?$/;
  Object.defineProperty(HTMLImageElement.prototype, 'src', {
    configurable: true, enumerable: nativo.enumerable,
    get() { return pedido.get(this) ?? nativo.get.call(this); },
    set(v) {
      const s = String(v), m = RE.exec(s);
      if (m && HAY.has(m[2])) {
        pedido.set(this, new URL(s, document.baseURI).href);
        nativo.set.call(this, s.slice(0, m.index + m[1].length) + 'assets/webp/' + m[2].slice(0, -4) + '.webp' + (m[3] || ''));
      } else {
        pedido.delete(this);
        nativo.set.call(this, s);
      }
    },
  });
}

export const webpActivo = ACTIVO;
