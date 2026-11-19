// LA SAL EN EL PARABRISAS, DIBUJADA (17/11/2026, el autor; el estado en systems/salitre.js, las perillas en
// SALITRE de data/tuning.js). Una costra blanca y aspera —salitre cristalizado— con manchas marrones y verdosas
// (el plancton y las algas quemados contra el vidrio) que avanza DE LOS BORDES AL CENTRO a medida que sube
// `run.sal`. Va sobre el mundo y debajo del HUD; en primera persona, sobre el vidrio y debajo de la cabina.
//
// COMO SE ARMA: cada pixel tiene su UMBRAL (cuanta sal hace falta para taparlo): bajo en los bordes, alto en el
// centro, con ruido para que el frente no sea un ovalo. La capa se recalcula entera solo cuando la sal cambia de
// escalon (NIV escalones: la sal sube en minutos, no en cuadros), asi que cada cuadro es un drawImage.
import { ctx, W, H } from './ctx.js';
import { SALITRE } from '../data/tuning.js';

const NIV = 64;
let lienzo = null, g = null, img = null, umbral = null, base = null, grano = null, nivelHecho = -1;

// ruido de valor, determinista (la costra es siempre la misma: es ESE vidrio)
const hash = (x, y) => { let h = (x * 374761393 + y * 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
function ruido(x, y, esc, sem) {
  const fx = x / esc, fy = y / esc, x0 = Math.floor(fx), y0 = Math.floor(fy), tx = fx - x0, ty = fy - y0;
  const sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty);
  const a = hash(x0 + sem, y0), b = hash(x0 + 1 + sem, y0), c = hash(x0 + sem, y0 + 1), d = hash(x0 + 1 + sem, y0 + 1);
  return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
}

function armar() {
  lienzo = document.createElement('canvas'); lienzo.width = W; lienzo.height = H;
  g = lienzo.getContext('2d'); img = g.createImageData(W, H);
  umbral = new Float32Array(W * H); base = new Uint8ClampedArray(W * H * 3); grano = new Float32Array(W * H);
  const cy = H * 0.46;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x;
    const nx = (x - W / 2) / (W / 2), ny = (y - cy) / (y < cy ? cy : H - cy);
    const r = Math.min(1.2, Math.sqrt(nx * nx * 0.8 + ny * ny) / 1.18);     // 0 al centro … ~1 en las esquinas
    const n1 = ruido(x, y, 46, 11) * 0.65 + ruido(x, y, 17, 23) * 0.35, n2 = ruido(x, y, 5, 37);
    umbral[i] = (1 - r) + (n1 - 0.5) * 2 * SALITRE.RUIDO + (n2 - 0.5) * 0.05;
    // el COLOR: sal blanca con grano, manchas marrones o verdosas donde el ruido grande lo dice, y cristales
    const gr = ruido(x, y, 2, 51), mancha = ruido(x, y, 28, 67), tono = ruido(x, y, 60, 79), h = hash(x * 7 + 3, y * 13 + 5);
    let R = 206 + gr * 30, G = 202 + gr * 28, B = 188 + gr * 24;
    if (mancha > 0.58) {
      const k = Math.min(1, (mancha - 0.58) * 3.2) * 0.55;
      const [mr, mg, mb] = tono > 0.5 ? [132, 116, 82] : [112, 124, 88];   // marron (plancton) o verdoso (algas)
      R += (mr - R) * k; G += (mg - G) * k; B += (mb - B) * k;
    }
    if (h < 0.035) { R = 246; G = 246; B = 240; }                            // un cristal que agarra la luz
    base[i * 3] = R; base[i * 3 + 1] = G; base[i * 3 + 2] = B;
    grano[i] = 0.78 + 0.22 * gr;
  }
}

function pintar(nivel) {
  const sal = nivel / NIV, S = SALITRE;
  // la sal llena tapa hasta el centro (algun hueco del ruido puede quedar: el ultimo pedacito de vista)
  const s = sal * 1.18 - 0.06, op = S.OPACO[0] + (S.OPACO[1] - S.OPACO[0]) * sal, d = img.data;
  for (let i = 0; i < W * H; i++) {
    const a = Math.max(0, Math.min(1, (s - umbral[i]) / S.BORDE));
    d[i * 4] = base[i * 3]; d[i * 4 + 1] = base[i * 3 + 1]; d[i * 4 + 2] = base[i * 3 + 2];
    // en el frente que avanza la sal va en cristales sueltos, no en un degradado
    const frente = a < 1 && a > 0 ? (grano[i] > 0.9 ? 1 : 0.45) : 1;
    d[i * 4 + 3] = 255 * a * op * grano[i] * frente;
  }
  g.putImageData(img, 0, 0);
  nivelHecho = nivel;
}

/** La costra, con `sal` 0..1 (run.sal). */
export function drawSalitre(sal) {
  if (!(sal > 0.004)) return;
  if (!lienzo) armar();
  const nivel = Math.max(1, Math.round(sal * NIV));
  if (nivel !== nivelHecho) pintar(nivel);
  const sm = ctx.imageSmoothingEnabled;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(lienzo, 0, 0, W, H);
  ctx.imageSmoothingEnabled = sm;
}
