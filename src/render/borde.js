// LA LUZ DE BORDE (rim light) del avion del jugador.
//
// QUE ES. El sol esta ADELANTE —en el horizonte, hacia donde volas— y la camara va detras del
// avion: el avion esta a CONTRALUZ. Asi se ve de verdad un objeto a contraluz: la cara que te mira
// queda en sombra, y el FILO de la silueta del lado del sol se enciende. Es lo que separa al
// protagonista del fondo — sin esto, una silueta oscura sobre un mar oscuro se pierde.
//
// POR QUE EN VIVO Y NO HORNEADO. Lo natural en un sprite horneado seria iluminarlo en el horno,
// pero el horneado del avion se esta rehaciendo (Blender, otra sesion, 3/10/2026). Este borde se
// calcula EN EL MOMENTO a partir de la TRANSPARENCIA del cuadro que se esta dibujando, asi que
// funciona igual con la hoja de hoy, con la de mañana y con cualquier avion nuevo: no tiene
// anclas, no tiene tabla, no sabe nada de la hoja.
//
// COMO. En un lienzo del tamaño del CUADRO de la hoja (84x84, no de la pantalla):
//   1. el cuadro, tal cual
//   2. 'source-in' con el color del sol → la silueta entera de ese color
//   3. 'destination-out' con el MISMO cuadro corrido BORDE_ANCHO pixeles en direccion contraria a
//      la luz → se borra todo pixel que tiene silueta "del lado del sol". Sobrevive el filo.
// y eso se suma ('lighter') con los MISMOS argumentos de destino que el sprite, bajo la misma
// transformacion: calza solo, gira y escala con el avion.
//
// LA LUZ VIENE DE ARRIBA EN PANTALLA (el sol esta sobre el horizonte, adelante). Pero el sprite se
// dibuja girado cuando el avion se inclina, asi que la direccion se lleva al espacio del SPRITE
// des-girandola con el angulo de la transformacion: el filo encendido es siempre el que mira al
// cielo, no el que miraba al cielo con el avion derecho.
import { theme } from './theme.js';
import { cfg } from '../core/state.js';
import { BORDE_ANCHO, BORDE_FUERZA, BORDE_CIELO, BORDE_CIELO_DEF, BORDE_DESTELLO, BORDE_LUZ, BORDE_NIEBLA, BORDE_VIDRIO } from '../data/tuning.js';
import { luz } from './brillo.js';

// EL BRILLO DEPENDE DEL CLIMA (autor, 4/10: "el brillo no se refleja si hay niebla, hay que bajarle la
// opacidad; si es noche, cambiar el color; si hay luna llena; y si es noche tormenta casi no tiene").
//   · CUANTO: BORDE_CIELO por cielo (sol directo o no), por BORDE_NIEBLA cuando hay banco de niebla.
//   · DE QUE COLOR: BORDE_LUZ por cielo — el filo y los destellos. Con sol, el sol del cielo y
//     destellos amarillos; con luna, plata fria; de noche sin luna, un azul tenue.
// La NIEBLA la dice game.js cada cuadro (`setNiebla`): vive en systems/fog.js y render no puede
// importar sistemas (`npm run lint:layers`).
let niebla = 0;
/** Cuanta niebla hay AHORA (0..1, la rampa del banco: systems/fog.js `fogFade`). */
export function setNiebla(f) { niebla = Math.max(0, Math.min(1, +f || 0)); }

/** El brillo de ESTE cielo y ESTE momento: cuanto ({fuerza}) y de que color (filo y destellos). */
function atmosfera() {
  const c = BORDE_CIELO[cfg.sky];
  const fuerza = BORDE_FUERZA * (c === undefined ? BORDE_CIELO_DEF : c) * (1 - BORDE_NIEBLA * niebla);
  const L = BORDE_LUZ[cfg.sky] || BORDE_LUZ.sol;
  const filo = L.filo || (theme.sky && theme.sky.sun);
  return { fuerza, filo, nucleo: L.nucleo, halo: L.halo };
}

let O = null, o = null;

/** El borde de UN cuadro de la hoja. Recibe exactamente los argumentos con los que se dibujo el
 *  sprite (`drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh)`) y el contexto con su transformacion
 *  viva. Va DESPUES del sprite. Lo usan el avion, el escuadron, el lider de la persecucion y los
 *  enemigos que vuelan (render/enemies.js, `BRILLAN`). */
export function drawBorde(ctx, img, sx, sy, sw, sh, dx, dy, dw, dh) {
  if (cfg.borde === 'off' || BORDE_FUERZA <= 0 || !img) return;
  const A = atmosfera();
  if (!A.filo || A.fuerza < 0.02) return;
  if (!O || O.width !== sw || O.height !== sh) {
    O = document.createElement('canvas'); O.width = sw; O.height = sh; o = O.getContext('2d', { willReadFrequently: true });
  }
  // LA LUZ VIENE DE ARRIBA EN PANTALLA: se lleva al espacio del sprite con la INVERSA de la
  // transformacion viva. Antes se des-giraba con el angulo (atan2), que alcanza para el avion pero
  // no para un sprite ESPEJADO —los enemigos se dibujan con scale(-1, 1)—: el angulo daba 180° y la
  // luz salia de abajo. La inversa contempla giro, espejo y escala: (0,-1) por M⁻¹ = (c, -a)/det.
  const m = ctx.getTransform(), det = m.a * m.d - m.b * m.c || 1;
  let lx = m.c / det, ly = -m.a / det;
  const n = Math.hypot(lx, ly) || 1; lx /= n; ly /= n;
  // LAS MEDIDAS SON DE UNA HOJA DE 84 (la del avion). Una hoja de otro tamaño —los enemigos van en
  // 128, los misiles en 16 y 32— las escala, si no a un misil de 16 px un filo de 2 le comia medio cuerpo
  const esc = sw / 84;
  const ancho = Math.max(1, Math.round(BORDE_ANCHO * esc));
  const ox = -lx * ancho, oy = -ly * ancho;
  o.imageSmoothingEnabled = false;
  o.globalCompositeOperation = 'copy';
  o.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
  const vid = vidrio(img, sx, sy, sw, sh);   // la cabina, leida del cuadro limpio (antes de pintarlo)
  o.globalCompositeOperation = 'source-in';
  o.fillStyle = A.filo;
  o.fillRect(0, 0, sw, sh);
  o.globalCompositeOperation = 'destination-out';
  o.drawImage(img, sx, sy, sw, sh, ox, oy, sw, sh);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = Math.min(1, A.fuerza);
  ctx.drawImage(O, 0, 0, sw, sh, dx, dy, dw, dh);
  ctx.globalAlpha = 1;
  destellos(ctx, img, sx, sy, sw, sh, dx, dy, dw, dh, A, lx, ly, esc);
  if (vid) destelloCabina(ctx, img, sx, sw, vid, dx, dy, dw, dh, A, esc);
  ctx.restore();
}

// EL DESTELLO DE LA CABINA (autor, 4/10). Cuando el avion se inclina, el sol pega en el vidrio y
// salta UN destello fuerte — el clasico del avion que pasa. Funciona en todo lo que tenga cabina
// en su hoja: el tuyo, el escuadron, el lider, los Harriers.
//
// EL VIDRIO SE ENCUENTRA POR COLOR, como el horno encuentra la tobera por su naranja: es el celeste
// de la cupula (medido en las hojas: ~146,208,218 y ~106,162,191 — verde y azul muy por encima del
// rojo). El azul gris de la panza (~123,147,179) no pasa: le falta verde. Se guarda el centroide por
// cuadro. Si un cuadro no muestra vidrio (de cola pura, por ejemplo) no hay destello.
//
// CUANTO BRILLA sale de la COLUMNA del cuadro, que en todas las hojas es el alabeo (o el giro):
// nivelado casi nada, inclinado a mitad de camino el pico, y en el extremo vuelve a bajar — el
// vidrio ya mira para otro lado. Late apenas, como un reflejo que tiembla.
const vidrios = new WeakMap();   // img -> Map('sx,sy' -> [x, y, n] | null)
function vidrio(img, sx, sy, sw, sh) {
  if (!(BORDE_VIDRIO.alfa > 0)) return null;
  let porImg = vidrios.get(img);
  if (!porImg) { porImg = new Map(); vidrios.set(img, porImg); }
  const clave = sx + ',' + sy;
  if (porImg.has(clave)) return porImg.get(clave);
  const d = o.getImageData(0, 0, sw, sh).data;
  let n = 0, mx = 0, my = 0;
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i], g = d[i + 1], b = d[i + 2];
    if (d[i + 3] < 200 || b < 150 || b - r < 45 || g - r < 40) continue;
    const p = i >> 2; mx += p % sw; my += (p / sw) | 0; n++;
  }
  const v = n >= 2 ? [mx / n, my / n, n] : null;
  porImg.set(clave, v);
  return v;
}
function destelloCabina(ctx, img, sx, sw, vid, dx, dy, dw, dh, A, esc) {
  const V = BORDE_VIDRIO;
  const cols = Math.max(1, Math.round(img.width / sw)), mid = (cols - 1) / 2;
  const u = mid > 0 ? Math.abs(Math.round(sx / sw) - mid) / mid : 0;   // 0 nivelado .. 1 extremo
  const pico = Math.max(0, 1 - Math.abs(u - V.pico) / V.ancho);
  const f = (V.base + (1 - V.base) * pico) * Math.min(1, A.fuerza * 1.4);
  if (f < 0.03) return;
  const t = performance.now() / 1000;
  const a = V.alfa * f * (0.85 + 0.15 * Math.sin(t * 9));
  const ex = dw / sw, ey = dh / sh;
  const cx = dx + (vid[0] + 0.5) * ex, cy = dy + (vid[1] + 0.5) * ey;
  const r = V.radio * esc * Math.abs(ex) * (0.6 + 0.4 * f);
  const [n0, n1, n2] = A.nucleo;
  // el nucleo, redondo y sin borde…
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 0.5);
  g.addColorStop(0, `rgba(255,255,255,${a})`);
  g.addColorStop(0.5, `rgba(${n0},${n1},${n2},${a * 0.6})`);
  g.addColorStop(1, `rgba(${n0},${n1},${n2},0)`);
  ctx.fillStyle = g;
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  // …y la ESTRELLA de cuatro puntas: dos rayas finas que se afinan, la firma del destello
  const raya = (w, h) => {
    const gr = ctx.createLinearGradient(cx - w, cy - h, cx + w, cy + h);
    gr.addColorStop(0, `rgba(${n0},${n1},${n2},0)`);
    gr.addColorStop(0.5, `rgba(255,255,255,${a * 0.9})`);
    gr.addColorStop(1, `rgba(${n0},${n1},${n2},0)`);
    ctx.fillStyle = gr;
    if (w > h) ctx.fillRect(cx - w, cy - Math.max(0.5, h), w * 2, Math.max(1, h * 2));
    else ctx.fillRect(cx - Math.max(0.5, w), cy - h, Math.max(1, w * 2), h * 2);
  };
  raya(r, r * 0.06);
  raya(r * 0.06, r * 0.7);
  luz(ctx, cx, cy, r * 1.6, A.nucleo, a * 0.6);
}

// LOS DESTELLOS DEL FILO (autor, 4/10). El mismo resplandor que late en la boca de la tobera con el
// turbo (plane.js, `tobera`), mas chico, repetido a lo largo del filo encendido. Se leen los pixeles
// del filo que quedo en el lienzo y se elige UNO por celda de BORDE_DESTELLO.celda, asi quedan
// repartidos por todo el contorno y no amontonados donde el filo es mas largo. Cada uno late con su
// propia fase. Van en 'lighter' y con la transformacion del sprite: giran y escalan con el. Ademas
// derraman su luz (render/brillo.js), como la tobera.
//
// LOS PUNTOS SE GUARDAN por cuadro y direccion de luz (redondeada): con varios enemigos en pantalla,
// leer los pixeles de cada uno en cada cuadro era el costo; el filo de un cuadro con la misma luz es
// siempre el mismo.
const puntosDe = new WeakMap();   // img -> Map(clave -> [[x, y, k]...])
function puntos(img, sx, sy, sw, sh, lx, ly, esc) {
  let porImg = puntosDe.get(img);
  if (!porImg) { porImg = new Map(); puntosDe.set(img, porImg); }
  const clave = sx + ',' + sy + ',' + Math.round(lx * 8) + ',' + Math.round(ly * 8);
  let lista = porImg.get(clave);
  if (lista) return lista;
  const D = BORDE_DESTELLO, px = o.getImageData(0, 0, sw, sh).data, celdas = new Map();
  const celda = Math.max(3, D.celda * esc);
  for (let y = 0; y < sh; y++) {
    for (let x = 0; x < sw; x++) {
      if (px[(y * sw + x) * 4 + 3] < 90) continue;
      const k = ((y / celda) | 0) * 1000 + ((x / celda) | 0);
      if (!celdas.has(k)) celdas.set(k, [x, y, k]);
    }
  }
  lista = [...celdas.values()];
  if (porImg.size > 400) porImg.clear();
  porImg.set(clave, lista);
  return lista;
}
function destellos(ctx, img, sx, sy, sw, sh, dx, dy, dw, dh, A, lx, ly, esc) {
  const D = BORDE_DESTELLO;
  if (!(D.alfa > 0)) return;
  const t = performance.now() / 1000, ex = dw / sw, ey = dh / sh;
  const [n0, n1, n2] = A.nucleo, [h0, h1, h2] = A.halo;
  for (const [x, y, k] of puntos(img, sx, sy, sw, sh, lx, ly, esc)) {
    // el latido de la tobera (parejo y rapido, un resto de azar), desfasado por celda
    const p = 0.7 + 0.3 * Math.sin(t * D.pulso + k * 1.7) + Math.random() * 0.06;
    const cx = dx + (x + 0.5) * ex, cy = dy + (y + 0.5) * ey, r = D.radio * Math.max(0.4, esc) * Math.abs(ex) * p;
    const a = D.alfa * Math.min(1, A.fuerza * 1.4) * p;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, `rgba(${n0},${n1},${n2},${a})`);
    g.addColorStop(0.45, `rgba(${h0},${h1},${h2},${a * 0.5})`);
    g.addColorStop(1, `rgba(${h0},${h1},${h2},0)`);
    ctx.fillStyle = g;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    luz(ctx, cx, cy, r * 2.2, A.halo, a * 0.5);
  }
}
