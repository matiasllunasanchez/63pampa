// LAS NUBES DEL CIELO DE FONDO (21/11/2026, el autor despues de jugar el tutorial: "hoy parecen globos —formas
// redondas—. Que parezcan nubes; poner nubes tambien a la altura del sol; variar alturas y cercanias al
// horizonte"). Antes vivian en game.js: seis racimos de CIRCULOS (28/9), y un circulo entero —con la panza
// redonda— es un globo, no una nube.
//
// AHORA. Cada nube es un DIBUJO horneado una vez (un canvas chico, pixel art con trama Bayer como la capa de
// nubes de arriba, render/nubes_altas.js) y por cuadro es un solo drawImage. Lo que la hace nube y no globo:
//   · la BASE CHATA (el piso de condensacion: todas las nubes de una capa terminan abajo en una linea), y el
//     COPETE irregular arriba, mas ancho que alto;
//   · el FILO DESHILACHADO (ruido + trama en el borde, nunca un arco limpio);
//   · la LUZ de arriba y la panza en sombra, con el relieve de los copos dentro del cuerpo.
// Y vienen en CAPAS de distancia (data/cielo.js NUBES_CAPAS): lejos, franjas chatas y palidas pegadas al
// horizonte que casi no se corren; cerca, cumulos grandes arriba que pasan rapido; en el medio, una capa a la
// altura del SOL (cuando el telon trae uno, se centra en el), que lo tapa al pasar y le toma la luz en el filo.
// Cirros finos arriba de todo.
//
// Se hornea de nuevo solo cuando cambia el cielo (los tonos salen de theme.sky). Por cuadro no se aloca nada.
import { ctx, W, HOR } from './ctx.js';
import { theme } from './theme.js';
import { cam, cfg } from '../core/state.js';
import { run } from '../core/run.js';
import { ruido } from '../core/tierra.js';
import { NUBES_CAPAS, NUBES_POR_CIELO, NUBES_SOL } from '../data/cielo.js';
import { pasoVida, drawVidaDia } from './cielo_vida.js';

const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const bay = (x, y) => BAYER[(y & 3) * 4 + (x & 3)] / 16 - 0.5;
const hex = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
const mezcla = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
const rnd = (a, b) => a + Math.random() * (b - a);

// LAS NUBES: un pool fijo por capa (hasta `max`), sorteado UNA vez. Cada una conserva su forma, su lugar y su
// semilla; el cielo decide cuantas de cada capa se ven.
const capas = NUBES_CAPAS.map(C => ({
  C,
  nubes: Array.from({ length: C.max }, () => ({
    x: Math.random(),                         // fraccion del periodo de la capa
    yR: Math.random(),                        // fraccion de su banda de altura
    w: Math.round(rnd(C.w[0], C.w[1])), h: Math.round(rnd(C.h[0], C.h[1])),
    alfa: rnd(C.alfa[0], C.alfa[1]), sem: (Math.random() * 9973) | 0,
    cv: null, rim: null,
  })),
}));

/** Cinco tonos de la nube (sombra de la base … cresta al sol), del cielo de ahora, fundidos `bruma` con el
 *  horizonte. Son los mismos dos colores de las nubes viejas (sombra y luz), estirados a una rampa. */
function tonosDe(bruma) {
  const sk = theme.sky, hz = hex(sk.horizon || '#a0a8b0');
  const sombra = mezcla(hex(sk.skyMid || '#8090a0'), [184, 188, 192], 0.45);
  const luz = mezcla(hz, [255, 255, 255], 0.55);
  const t = [mezcla(sombra, hex(sk.skyTop || '#405060'), 0.28), sombra, mezcla(sombra, luz, 0.5), luz, mezcla(luz, [255, 255, 255], 0.55)];
  return t.map(c => mezcla(c, hz, bruma));
}

/** La forma: alto del cuerpo en la columna x (px desde la base). Depende del tipo. */
function perfil(tipo, x, w, h, sem, domos) {
  const u = (x + 0.5) / w;
  if (tipo === 'estrato') {
    // franja chata y larga: alto parejo con lomitos, afinada en las puntas
    const punta = Math.min(1, u * 5, (1 - u) * 5);
    return h * (0.35 + 0.65 * ruido(x / 9, 3.7, sem)) * Math.pow(Math.max(0, punta), 0.6);
  }
  // CUMULO: una loma ancha (no un semicirculo: el seno a la 0,7 tiene los costados mas tendidos) y encima los
  // COPOS, cupulas de distinto ancho; el filo de arriba se despeina con ruido
  let top = Math.pow(Math.sin(Math.PI * u), 0.7) * 0.55;
  for (let i = 0; i < domos.length; i += 3) {
    const d = (u - domos[i]) / domos[i + 1];
    if (d > -1 && d < 1) top = Math.max(top, Math.sqrt(1 - d * d) * domos[i + 2]);
  }
  return h * top * (0.86 + 0.28 * ruido(x / 3.5, 1.3, sem));
}

const BLANCO_SOL = [255, 246, 222];
/** Hornea la nube `c` con los tonos `tonos`: el cuerpo en `c.cv` y el FILO (lo de arriba del cuerpo, para la
 *  luz del sol que la toca) en `c.rim`. */
function hornear(c, tipo, tonos) {
  const w = c.w, h = c.h + 2, sem = c.sem;
  if (!c.cv || c.cv.width !== w || c.cv.height !== h) {
    c.cv = document.createElement('canvas'); c.cv.width = w; c.cv.height = h;
    c.rim = document.createElement('canvas'); c.rim.width = w; c.rim.height = h;
  }
  const g = c.cv.getContext('2d'), gr = c.rim.getContext('2d');
  const img = g.createImageData(w, h), ir = gr.createImageData(w, h);
  // los copos del cumulo: 2 a 5 cupulas, la mas alta cerca del medio
  const domos = [];
  if (tipo === 'cumulo') {
    const n = 2 + ((ruido(sem, 0.5, 11) * 4) | 0);
    for (let i = 0; i < n; i++) {
      const cU = 0.2 + 0.6 * ruido(sem + i * 3.1, 7.7, 13);
      domos.push(cU, 0.12 + 0.2 * ruido(sem, i * 2.3, 17), (0.55 + 0.45 * ruido(i * 5.7, sem, 19)) * (1 - Math.abs(cU - 0.5) * 0.9));
    }
  }
  const T = new Float32Array(w);
  for (let x = 0; x < w; x++) T[x] = perfil(tipo, x, w, c.h, sem, domos);
  const dentro = (x, y) => {
    if (x < 0 || x >= w || y < 0 || y >= h) return false;
    const yy = h - 1 - y;                                    // alto sobre la base
    if (tipo === 'cirro') {
      // VELO: vetas finas y corridas en diagonal (el viento de altura las peina)
      const u = (x + 0.5) / w, punta = Math.min(1, u * 4, (1 - u) * 4);
      const env = 1 - Math.abs(yy / Math.max(1, c.h) * 2 - 1);
      return ruido(x / 18 + yy * 0.35, yy / 1.4, sem) * punta * (0.4 + env) + bay(x, y) * 0.22 > 0.52;
    }
    const t = T[x];
    // la base CHATA, apenas levantada en las puntas de la nube (no es una lente: es un piso)
    const u = (x + 0.5) / w, base = tipo === 'cumulo' ? Math.max(0, 1.6 - Math.min(u, 1 - u) * 14) : 0;
    if (yy < base) return false;
    // el filo de arriba DESHILACHADO: ruido chico + trama; en el estrato, ademas, rasgaduras
    const s = t - yy + (ruido(x / 2.2, y / 2.2, sem + 5) - 0.5) * 2.2 + bay(x, y) * 1.4;
    if (s <= 0) return false;
    if (tipo === 'estrato' && ruido(x / 7, y / 2.5, sem + 9) < 0.24) return false;
    return true;
  };
  const sol = theme.sky.sun ? mezcla(hex(theme.sky.sun), BLANCO_SOL, 0.4) : BLANCO_SOL;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (!dentro(x, y)) continue;
    const i = (y * w + x) * 4, yy = h - 1 - y;
    let lum;
    if (tipo === 'cirro') lum = 0.72 + ruido(x / 6, y, sem) * 0.4;
    else {
      // la LUZ: de abajo (sombra) a arriba (al sol), y el RELIEVE de los copos — el ruido grande comparado con
      // el de un poco mas alla, del lado de la luz (arriba a la izquierda): la cara que mira al sol se enciende
      const v = yy / Math.max(1, T[x]);
      const n1 = ruido(x / 6, y / 4.5, sem + 21), n2 = ruido((x + 2) / 6, (y + 2) / 4.5, sem + 21);
      lum = (tipo === 'estrato' ? 0.3 + 0.45 * v : 0.12 + 0.8 * Math.pow(Math.min(1, v), 0.75)) + (n1 - n2) * 1.6;
      if (yy < 1) lum -= 0.35;                                 // la panza: la fila de abajo, en sombra
      if (!dentro(x, y - 1)) lum += 0.25;                      // el filo de arriba siempre toma luz
    }
    const k = Math.max(0, Math.min(4, Math.floor((lum + bay(x, y) * 0.2) * 4.6)));
    const col = tonos[k];
    img.data[i] = col[0]; img.data[i + 1] = col[1]; img.data[i + 2] = col[2]; img.data[i + 3] = 255;
    // EL FILO para el sol: lo que tiene aire arriba o al costado (y la fila de abajo, de contraluz)
    if (!dentro(x, y - 1) || !dentro(x - 1, y) || !dentro(x + 1, y) || !dentro(x, y - 2)) {
      ir.data[i] = sol[0]; ir.data[i + 1] = sol[1]; ir.data[i + 2] = sol[2]; ir.data[i + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  gr.putImageData(ir, 0, 0);
}

/** UNA NUBE SUELTA con esta misma receta, para otros dibujos (23/11: la pared y el techo del FRENTE DE TORMENTA,
 *  render/frente.js — el autor: "las nubes se ven re bien, por que no usamos ESAS nubes para la tormenta"). `tonos`:
 *  cinco [r, g, b] de la sombra a la cresta. Devuelve el canvas. */
export function nubeSuelta(w, h, sem, tonos, tipo = 'cumulo') {
  const c = { w, h, sem, cv: null, rim: null };
  hornear(c, tipo, tonos);
  return c.cv;
}

let horneadoDe = '';
function hornearSiCambio() {
  const sk = theme.sky, clave = sk.horizon + sk.skyMid + sk.skyTop + sk.sun;
  if (clave === horneadoDe) return;
  horneadoDe = clave;
  for (const L of capas) {
    const tonos = tonosDe(L.C.bruma);
    for (const c of L.nubes) hornear(c, L.C.tipo, tonos);
  }
}

/** EL CIELO DE FONDO: las nubes por capa, y entre capa y capa la vida (render/cielo_vida.js: pajaros, el
 *  avion lejano). Va despues del telon y antes de las sierras (game.js). `zfx` es el giro del fondo por el
 *  rumbo; `sol` el astro en pantalla ({ x, y } o null). */
export function drawNubesCielo(zfx, sol) {
  hornearSiCambio();
  pasoVida();
  const mult = NUBES_POR_CIELO[cfg.sky] ?? 1;
  const prevSm = ctx.imageSmoothingEnabled;
  ctx.imageSmoothingEnabled = false;
  for (let li = 0; li < capas.length; li++) {
    const { C, nubes } = capas[li];
    const cuantas = Math.min(C.max, Math.round(C.n * mult));
    const periodo = W + 140 + C.w[1];
    for (let i = 0; i < cuantas; i++) {
      const c = nubes[i];
      if (!c.cv) continue;
      const cx = ((c.x * periodo - cam.x * C.par - run.t * C.deriva - zfx * C.par / 2.2) % periodo + periodo) % periodo - 70 - C.w[1] / 2;
      if (cx + c.w / 2 < -70 || cx - c.w / 2 > W + 70) continue;
      // la altura: la capa del SOL se centra en el astro (si el telon tiene uno a la vista)
      const subeY = C.ySol && sol ? Math.max(4, HOR - sol.y - C.ySol + c.yR * C.ySol * 2) : C.y[0] + c.yR * (C.y[1] - C.y[0]);
      // (al medio pixel: el buffer es 2x, y de a pixel entero lo lejano avanzaba a los saltos)
      const x0 = Math.round((cx - c.w / 2) * 2) / 2, y0 = Math.round(HOR - subeY - c.cv.height);
      ctx.globalAlpha = c.alfa;
      ctx.drawImage(c.cv, x0, y0);
      // EL FILO ENCENDIDO: cerca del sol la nube toma su luz en el borde
      if (sol && C.tipo !== 'estrato') {
        const dx = cx - sol.x, dy = y0 + c.cv.height / 2 - sol.y;
        const d = Math.sqrt(dx * dx + dy * dy) - c.w / 2;
        if (d < NUBES_SOL.R) {
          ctx.globalAlpha = c.alfa * NUBES_SOL.A * Math.min(1, 1 - d / NUBES_SOL.R);
          ctx.drawImage(c.rim, x0, y0);
        }
      }
    }
    // la vida del fondo, entre las capas: lo lejano detras de las nubes de adelante
    ctx.globalAlpha = 1;
    drawVidaDia(C.nombre);
  }
  ctx.globalAlpha = 1;
  ctx.imageSmoothingEnabled = prevSm;
}
