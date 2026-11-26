// LA CAPA DE NUBES VISTA DESDE ARRIBA (14/11/2026, el autor, con una foto de cabina sobre un mar de nubes:
// "que se puedan ver las nubes desde arriba asi, pasando lentamente, pero cuando se va MUUUUY arriba").
//
// Es un PLANO a ALTO.NUBES metros (data/tuning.js), raster por filas como el mar (render/world.js drawSea):
// cada fila de pantalla debajo del horizonte cae a una distancia `z = (cam.y - NUBES) · F / dy`, y esa fila
// se pinta con una tira de una textura de nubes tileable, escalada a esa distancia (un patron con su
// transformacion: una sola fillRect por fila). Pasa lenta sola — esta lejos — y la textura tiene HUECOS
// por donde se ve el mar (y lo que haya en el), que se dibujo antes.
//
//   · DEBAJO de la capa no se dibuja: desde abajo es un techo, y el cielo pintado ya hace de cielo.
//   · AL ATRAVESARLA, el blanco (`ESPESOR`): un velo que tapa el mundo y se abre al salir.
//   · ARRIBA, entra de a poco en los primeros 120 m, con la bruma del horizonte encima.
// Las sierras del fondo (game.js, sobre el horizonte) quedan asomando por encima: los picos sobre las nubes.
import { ctx, W, H, HOR, F } from './ctx.js';
import { theme } from './theme.js';
import { cam } from '../core/state.js';
import { run } from '../core/run.js';
import { ALTO } from '../data/tuning.js';

const N = 256;   // lado de la textura (tileable)

/** Ruido de valor periodico (periodo `p` celdas), suave, 0..1. */
function ruidoP(x, y, p, sem) {
  const h = (i, j) => {
    i = ((i % p) + p) % p; j = ((j % p) + p) % p;
    const v = Math.sin(i * 127.1 + j * 311.7 + sem * 74.7) * 43758.5453;
    return v - Math.floor(v);
  };
  const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi;
  const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
  const a = h(xi, yi), b = h(xi + 1, yi), c = h(xi, yi + 1), d = h(xi + 1, yi + 1);
  return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
}
/** fbm tileable en N×N: 4 octavas, la primera de 8 celdas por lado (cumulos de ~200 m). */
function densidad(x, y) {
  let s = 0, amp = 0.5, tot = 0;
  for (let o = 0, p = 8; o < 4; o++, p *= 2, amp *= 0.5) {
    s += ruidoP(x / N * p, y / N * p, p, o) * amp; tot += amp;
  }
  return s / tot;
}
const hex = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
const mezcla = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));

// LA TEXTURA, una por color de horizonte (el cielo tiñe las nubes: atardecer, noche, tormenta)
let tex = null, texDe = '', patron = null;
function textura() {
  const hz = theme.sky.horizon;
  if (tex && texDe === hz) return patron;
  texDe = hz;
  if (!tex) { tex = document.createElement('canvas'); tex.width = tex.height = N; }
  const g = tex.getContext('2d'), img = g.createImageData(N, N), D = new Float32Array(N * N);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) D[y * N + x] = densidad(x, y);
  // CINCO TONOS, pixel art con trama (Bayer 4×4) entre uno y otro: valle en sombra, cuerpo, luz, cresta. El
  // sol viene de arriba a la izquierda: la luz es cuanto mas densa es la nube aca que un poco mas alla abajo
  // a la derecha (la cara que mira al sol), y lo mas denso es lo mas alto (las cupulas, mas blancas).
  const H0 = hex(hz);
  const tonos = [mezcla([126, 138, 160], H0, 0.36), mezcla([164, 176, 194], H0, 0.3), mezcla([192, 202, 216], H0, 0.26),
    mezcla([226, 232, 240], H0, 0.2), mezcla([252, 252, 254], H0, 0.12)];
  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  const UMBRAL = 0.35;     // debajo: hueco (se ve el mar). Mas alto = mas huecos
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const d = D[y * N + x];
    const i = (y * N + x) * 4;
    if (d < UMBRAL) { img.data[i + 3] = 0; continue; }
    // MAS CUERPO (16/11, el autor: "un poco mas de cuerpo a las nubes"): la cara al sol contra la de atras
    // con mas contraste, y la SOMBRA PROPIA — si la cupula de al lado, del lado del sol, es mas alta que esta,
    // esto queda a su sombra
    const d2 = D[((y + 6) % N) * N + (x + 5) % N];
    const dSol = D[((y - 7 + N) % N) * N + (x - 6 + N) % N];
    const alto = Math.min(1, (d - UMBRAL) / 0.2);            // 0 en el filo del hueco … 1 en la cupula
    const sombra = dSol - d > 0.06 ? Math.min(0.3, (dSol - d) * 2.4) : 0;
    const luz = 0.22 + alto * 0.6 + (d - d2) * 8 - sombra;
    const tr = (BAYER[(y & 3) * 4 + (x & 3)] / 16 - 0.5) * 0.22;
    const t = Math.max(0, Math.min(4, Math.floor((luz + tr) * 4.2)));
    const c = tonos[t];
    img.data[i] = c[0]; img.data[i + 1] = c[1]; img.data[i + 2] = c[2]; img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  patron = ctx.createPattern(tex, 'repeat');
  return patron;
}

/** Cuanto se ve la alfombra (0..1) y cuanto blanco hay (0..1), segun la camara. Puro. */
export function nubesAltas(camY = cam.y) {
  const sobre = camY - ALTO.NUBES;
  const capa = Math.max(0, Math.min(1, (sobre - ALTO.ESPESOR * 0.3) / (ALTO.ENTRA_YA || 120)));
  const blanco = Math.max(0, 1 - Math.abs(sobre) / ALTO.ESPESOR);
  return { capa, blanco };
}

/** La capa (desde arriba) o el blanco (adentro). Va despues del mundo de abajo y antes de lo que vuela
 *  cerca (misiles, cazas, el avion): game.js. */
export function drawNubesAltas() {
  const { capa, blanco } = nubesAltas();
  if (capa <= 0 && blanco <= 0) return;
  if (capa > 0) {
    const p = textura(), h = cam.y - ALTO.NUBES, S = ALTO.TEXEL;
    const v0 = run.dist / S;                               // lo recorrido, en texeles
    ctx.save();
    ctx.globalAlpha = capa;
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = p;
    // (de H + 60 para que el mundo girado —alabeo, horizonte giratorio— no muestre el borde)
    for (let y = HOR + 1; y < H + 60; y++) {
      const dy = y - HOR, z = h * F / dy, k = F / z;     // k: pixeles por metro en esta fila
      // pantalla x = W/2 + (u·S − cam.x)·k ;  la fila y muestra la tira v = (dist + z) / S
      const v = v0 + z / S;
      p.setTransform(new DOMMatrix([S * k, 0, 0, 1, W / 2 - cam.x * k, y - (v % N)]));
      ctx.fillRect(-80, y, W + 160, 1);
    }
    // LA BRUMA: lejos, las nubes se funden con el horizonte (y tapa el centelleo de la textura achicada). Del
    // mismo color que el mar de nubes lejano de arriba, para que no haya costura
    const bruma = mezclaCss(theme.sky.horizon, '#c4ccd6', 0.2);
    const g = ctx.createLinearGradient(0, HOR, 0, HOR + 70);
    g.addColorStop(0, bruma); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalAlpha = capa;
    ctx.fillStyle = g;
    ctx.fillRect(-80, HOR, W + 160, 70);
    // LAS SIERRAS SE HUNDEN (16/11, el autor: "si se esta tan alto las montañas y demas no deberian verse
    // mas"): el mar de nubes lejano sube sobre el horizonte pintado y las tapa — a mas altura, mas alto
    // sube; a ~1000 m ya no asoma nada. Abajo macizo, arriba se funde con el cielo.
    const lejos = Math.max(0, Math.min(1, (cam.y - ALTO.NUBES) / 500)), alto = 70 * lejos;
    if (alto > 1) {
      // (16/11: "el horizonte se ve raro" — sin franja maciza: un degrade que sube del filo y se apaga)
      const g2 = ctx.createLinearGradient(0, HOR - alto, 0, HOR + 1);
      g2.addColorStop(0, 'rgba(0,0,0,0)'); g2.addColorStop(0.55, bruma); g2.addColorStop(1, bruma);
      ctx.fillStyle = g2;
      ctx.fillRect(-80, HOR - alto, W + 160, alto + 1);
    }
    ctx.restore();
  }
  if (blanco > 0) {
    ctx.save();
    ctx.globalAlpha = Math.min(0.92, blanco * 1.1);
    ctx.fillStyle = mezclaCss('#e6eaef', theme.sky.horizon, 0.3);
    ctx.fillRect(-80, -150, W + 160, H + 300);
    ctx.restore();
  }
}
const mezclaCss = (a, b, t) => { const c = mezcla(hex(a), hex(b), t); return `rgb(${c[0]},${c[1]},${c[2]})`; };
