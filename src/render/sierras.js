// LAS SIERRAS DEL HORIZONTE (22/11/2026, el autor: "mejoremos las montañas del fondo con la misma tecnica que
// usaste para las nubes"). Antes vivian en game.js: un poligono de seis vertices en dos tonos planos — carton
// pintado al lado de las nubes nuevas (render/nubes_cielo.js).
//
// AHORA, LA MISMA RECETA QUE LAS NUBES: cada sierra es un DIBUJO horneado una vez (un canvas chico, pixel art con
// trama Bayer) y por cuadro es un solo drawImage. Lo que la hace montaña:
//   · la CRESTA QUEBRADA: picos de distinto alto (ruido en dos escalas) y no una linea recta entre vertices;
//   · las LADERAS: la que mira al SOL se enciende y la otra queda en sombra — el lado sale de donde esta el astro
//     en pantalla (se hornean las dos versiones y se elige por cuadro);
//   · la ROCA: vetas y canaletas que bajan por la ladera (ruido estirado en vertical) y NIEVE en las cumbres altas;
//   · la BRUMA al pie: el color del horizonte sube desde la base (perspectiva aerea), y el filo de la cresta toma
//     la luz del sol cuando esta cerca.
// Y vienen en DOS CAPAS: una cordillera LEJANA, palida y lenta, y las sierras de siempre adelante (mismo lugar,
// mismo tamaño y mismo parallax que antes: `isles` de game.js).
//
// Se hornea de nuevo solo cuando cambia el cielo (los tonos salen de theme.sky). Por cuadro no se aloca nada.
import { ctx, W, HOR } from './ctx.js';
import { theme } from './theme.js';
import { cam } from '../core/state.js';
import { ruido } from '../core/tierra.js';
import { P } from '../data/palette.js';

const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const bay = (x, y) => BAYER[(y & 3) * 4 + (x & 3)] / 16 - 0.5;
const hex = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
const mezcla = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));

// LA CORDILLERA LEJANA: anchas, bajas, palidas; se corren poco con la camara
const LEJOS = { n: 4, par: 1.6, bruma: 0.62 };
const ISLA_PAR = 2.2, ISLA_GIRO = 0.7;   // las islas de adelante: cuanto se corren con la camara y con el rumbo
const lejanas = Array.from({ length: LEJOS.n }, (_, i) => ({
  x: (i + Math.random() * 0.6) / LEJOS.n, w: 110 + Math.random() * 90, h: 7 + Math.random() * 7,
  seed: (Math.random() * 9973) | 0,
}));
const SIERRA_BRUMA = 0.18;   // las de adelante: apenas fundidas con el horizonte
const NIEVE_DESDE = 11;      // px de alto a partir de los cuales la cumbre lleva nieve
const SOL_R = 120;           // a que distancia del sol (px) la cresta empieza a tomar su luz

/** Seis tonos de la sierra (sombra honda … ladera al sol, y la nieve), del cielo de ahora, fundidos `bruma` con
 *  el horizonte. La base son los dos colores de las sierras viejas (P.island y la ladera '#2a3844'). */
function tonosDe(bruma) {
  const sk = theme.sky, hz = hex(sk.horizon || '#a0a8b0');
  const sombra = hex(P.island), luz = mezcla(hex('#2a3844'), hex(sk.sun || '#ffe0a0'), 0.12);
  const t = [mezcla(sombra, [0, 0, 0], 0.25), sombra, mezcla(sombra, luz, 0.5), luz, mezcla(luz, hz, 0.3),
    mezcla([226, 232, 238], hz, 0.25)];
  return t.map(c => mezcla(c, hz, bruma));
}

/** La cresta: alto de la sierra en la columna x. Un macizo (seno ancho) con picos encima, en dos escalas. */
function cresta(x, w, h, sem) {
  const u = (x + 0.5) / w;
  // (el seno se topea en 0: en las columnas de borde, x = -1 y x = w, daba negativo y la potencia NaN → la ladera sin color)
  const macizo = Math.pow(Math.max(0, Math.sin(Math.PI * u)), 0.8);
  const picos = 0.55 * ruido(x / 11, 0.7, sem) + 0.3 * ruido(x / 4.2, 2.1, sem + 3) + 0.15 * ruido(x / 1.8, 4.4, sem + 7);
  return Math.max(0, h * macizo * (0.35 + 0.9 * picos));
}

/** Hornea la sierra `s` con la luz de un lado (`izq`: el sol a la izquierda). Devuelve { cv, rim }. */
function hornear(s, tonos, izq, nieve) {
  const w = Math.max(2, Math.round(s.w)), h = Math.ceil(s.h * 1.25) + 3, sem = s.seed;
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  const rim = document.createElement('canvas'); rim.width = w; rim.height = h;
  const img = cv.getContext('2d').createImageData(w, h), ir = rim.getContext('2d').createImageData(w, h);
  const T = new Float32Array(w + 2);
  for (let x = -1; x <= w; x++) T[x + 1] = cresta(x, w, s.h, sem);
  const alto = x => T[Math.max(0, Math.min(w + 1, x + 1))];
  const sol = theme.sky.sun ? mezcla(hex(theme.sky.sun), [255, 246, 222], 0.4) : [255, 246, 222];
  for (let x = 0; x < w; x++) {
    const t = alto(x);
    // la PENDIENTE: lo que sube hacia el sol se ilumina
    const pend = (alto(x + 1) - alto(x - 1)) * (izq ? -1 : 1);
    for (let y = 0; y < h; y++) {
      const yy = h - 1 - y;                                   // alto sobre el horizonte
      // el filo de la cresta, con un poco de trama (nunca una linea limpia)
      if (yy > t + bay(x, y) * 0.9) continue;
      const i = (y * w + x) * 4;
      const v = yy / Math.max(1, t);                          // 0 al pie, 1 en la cresta
      // las VETAS: canaletas que bajan por la ladera (ruido estirado en vertical, movido con la pendiente)
      const veta = ruido(x / 1.6 + yy * 0.18 * (pend > 0 ? -1 : 1), yy / 7, sem + 11) - 0.5;
      let lum = 1.35 + Math.max(-1.3, Math.min(1.4, pend * 1.1)) + veta * 1.2 + v * 0.5;
      if (yy < 1.5) lum -= 0.3;                               // el pie, mas oscuro antes de la bruma
      let k = Math.max(0, Math.min(4, Math.floor(lum + bay(x, y) * 0.9)));
      // la NIEVE: en lo alto de las cumbres grandes, mas abajo en las laderas al sol que en las de sombra
      if (nieve && t > NIEVE_DESDE && yy > t - 2.2 - ruido(x / 3, 1.1, sem + 5) * 2.4 + (pend > 0 ? -0.6 : 0.4)) k = pend > -0.15 ? 5 : 4;
      // la BRUMA AL PIE: los ultimos dos px se funden con el horizonte, en trama
      if (yy < 2.5 && bay(x, y) + 0.5 > yy / 2.5) k = 4;
      const c = tonos[k];
      img.data[i] = c[0]; img.data[i + 1] = c[1]; img.data[i + 2] = c[2]; img.data[i + 3] = 255;
      // EL FILO para el sol: la fila de arriba de la cresta del lado que mira al astro
      if (yy > t - 1.2 && pend > -0.3) { ir.data[i] = sol[0]; ir.data[i + 1] = sol[1]; ir.data[i + 2] = sol[2]; ir.data[i + 3] = 255; }
    }
  }
  cv.getContext('2d').putImageData(img, 0, 0);
  rim.getContext('2d').putImageData(ir, 0, 0);
  return { cv, rim };
}

let horneadoDe = '';
const horno = new Map();   // sierra → { L: {cv, rim}, R: {cv, rim} }
function hornearSiCambio(isles) {
  const sk = theme.sky, clave = sk.horizon + sk.skyMid + sk.skyTop + sk.sun + P.island + isles.length;
  if (clave === horneadoDe) return;
  horneadoDe = clave;
  horno.clear();
  const tl = tonosDe(LEJOS.bruma), tc = tonosDe(SIERRA_BRUMA);
  for (const s of lejanas) horno.set(s, { L: hornear(s, tl, true, false), R: hornear(s, tl, false, false) });
  for (const s of isles) horno.set(s, { L: hornear(s, tc, true, true), R: hornear(s, tc, false, true) });
}

function una(s, cx, sol) {
  const h = horno.get(s);
  if (!h) return;
  const lado = sol ? (sol.x < cx + s.w / 2 ? h.L : h.R) : h.L;
  const x0 = Math.round(cx * 2) / 2, y0 = HOR + 1 - lado.cv.height;
  ctx.drawImage(lado.cv, x0, y0);
  if (sol) {
    const dx = cx + s.w / 2 - sol.x, dy = HOR - sol.y;
    const d = Math.sqrt(dx * dx + dy * dy) - s.w / 2;
    if (d < SOL_R) {
      const a0 = ctx.globalAlpha;
      ctx.globalAlpha = a0 * 0.55 * Math.min(1, 1 - d / SOL_R);
      ctx.drawImage(lado.rim, x0, y0);
      ctx.globalAlpha = a0;
    }
  }
}

/** LAS SIERRAS DEL HORIZONTE: la cordillera lejana y, adelante, las de `isles` (game.js: { x, w, h, seed }) con su
 *  mismo parallax de siempre. `zfx` es el giro del fondo por el rumbo; `sol` el astro en pantalla ({ x, y } o null). */
export function drawSierras(isles, zfx, sol) {
  hornearSiCambio(isles);
  const prevSm = ctx.imageSmoothingEnabled;
  ctx.imageSmoothingEnabled = false;
  const perL = W + 260;
  for (const s of lejanas) {
    const cx = ((s.x * perL - cam.x * LEJOS.par - zfx * 0.5) % perL + perL) % perL - 130;
    if (cx + s.w < -70 || cx > W + 70) continue;
    una(s, cx, sol);
  }
  for (const s of isles) {
    // (la cuenta vieja de game.js; EL PARALLAX MAS SUAVE — 22/11, el autor: "la isla que esta mas cerca, menos violenta
    // al moverse": era cam.x * 3.5 y el giro entero; sigue por encima de la cordillera (1,6) para que se lea mas cerca)
    const ix = ((s.x - cam.x * ISLA_PAR - zfx * ISLA_GIRO) % (W + 160) + W + 160) % (W + 160) - 80;
    una(s, ix, sol);
  }
  ctx.imageSmoothingEnabled = prevSm;
}
