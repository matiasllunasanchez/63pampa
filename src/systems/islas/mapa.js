// LAS ISLAS REALES — EL MAPA DE DESARROLLO (autor, 19/11: "para modo desarrollador, agregar un mapa de malvinas…
// arriba, no dentro de opciones, y que me diga exactamente donde estoy, y marque el objetivo si hay. Me
// gustaria recorrerla"). Se abre desde la PAUSA (fila MAPA, arriba de OPCIONES, solo en las islas) y lo dibuja
// render/islas_mapa.js con lo que arma este modulo: la IMAGEN del relieve (una vez, del mismo DEM que vuela) y
// los DATOS de cada cuadro — el avion, el objetivo, los lugares, las coordenadas y el lugar mas cercano.
// El CURSOR (flechas) y ENTER llevan al avion a ese punto: asi se la recorre.
import * as mundo from './mundo.js';
import { ISLAS_DEM } from '../../data/islas_dem.js';

const ANCHO = 360;                        // px de la imagen (el alto sale de la proporcion del mapa)
let IMG = null;

/** La imagen del relieve: mar por profundidad, tierra por altura, la costa marcada. */
export function imagen() {
  if (IMG || !mundo.listo()) return IMG;
  const w = ANCHO, h = Math.round(ANCHO * mundo.MAP_D / mundo.MAP_W);
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  const c = cv.getContext('2d'), im = c.createImageData(w, h), d = im.data;
  const alto = (i, j) => mundo.mapH((i + 0.5) / w * mundo.MAP_W, (j + 0.5) / h * mundo.MAP_D);
  const H = new Float32Array(w * h);
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) H[j * w + i] = alto(i, j);
  const mezcla = (a, b, t) => a.map((v, k) => v + (b[k] - v) * Math.max(0, Math.min(1, t)));
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const v = H[j * w + i];
    let col;
    if (v <= 0) col = mezcla([46, 70, 82], [16, 26, 36], -v / 120);
    else {
      // sombreado de ladera (luz del noroeste) para que se lea el relieve
      const dx = (H[j * w + Math.min(w - 1, i + 1)] - H[j * w + Math.max(0, i - 1)]);
      const dz = (H[Math.min(h - 1, j + 1) * w + i] - H[Math.max(0, j - 1) * w + i]);
      const luz = Math.max(0.55, Math.min(1.25, 1 - (dx + dz) * 0.004));
      col = v < 120 ? mezcla([96, 112, 74], [128, 122, 84], v / 120) : mezcla([128, 122, 84], [176, 170, 156], (v - 120) / 500);
      col = col.map(x => x * luz);
      // la costa
      if (H[j * w + Math.max(0, i - 1)] <= 0 || H[j * w + Math.min(w - 1, i + 1)] <= 0 ||
          H[Math.max(0, j - 1) * w + i] <= 0 || H[Math.min(h - 1, j + 1) * w + i] <= 0) col = [196, 186, 150];
    }
    const k = (j * w + i) * 4;
    d[k] = col[0]; d[k + 1] = col[1]; d[k + 2] = col[2]; d[k + 3] = 255;
  }
  c.putImageData(im, 0, 0);
  IMG = cv;
  return IMG;
}

/** metros absolutos → lon/lat (la cuenta de mundo.lonLatAbs, al reves). */
export function lonLat(ax, az) {
  const R = 6371000, D = ISLAS_DEM, DEG = Math.PI / 180;
  const lat = D.lat0 - (az + D.pz0) / (R * DEG);
  const lon = D.lon0 + (ax + D.px0) / (R * DEG * Math.cos(lat * DEG));
  return [lon, lat];
}
/** Grados decimales → 51°41,4'S (la manera de leer una carta). */
export function gm(v, pos, neg) {
  const a = Math.abs(v), g = Math.floor(a), m = (a - g) * 60;
  return g + '°' + m.toFixed(1).replace('.', ',') + "'" + (v >= 0 ? pos : neg);
}
/** absoluto → fraccion del mapa (0..1). */
export const aUV = (ax, az) => ({ u: ax / mundo.MAP_W, v: az / mundo.MAP_D });
/** fraccion del mapa → absoluto. */
export const deUV = (u, v) => [u * mundo.MAP_W, v * mundo.MAP_D];
