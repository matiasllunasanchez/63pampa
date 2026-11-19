// LAS ISLAS REALES — LA CABINA Y EL HUD DE DUSK PATROL CON LOS INDICADORES DE RASANTE (prototipo I0).
//
// Autor, 19/11: "la cabina que tiene el otro juego esta mejor, usemos esa y adaptemosla para que tenga
// nuestros indicadores". Es el overlay de Dusk Patrol (ui/raster.js, instruments.js, cockpit.js, radar.js,
// hud.js, sleet.js) portado casi textual: dibuja pixel a pixel en un buffer propio de la grilla del juego
// (480x270) y se pega encima del mundo con un solo drawImage.
//
// LO QUE SE ADAPTO:
//   · unidades de RASANTE: velocidad en km/h, altura en metros, ascenso en m/s;
//   · los rotulos en castellano (la fuente 3x5 suma la Ñ);
//   · el tablero de abajo lleva NUESTROS indicadores: nafta, calor del cañon, misiles (Z), reparto de
//     energia, escuadron, turbo; y las lamparas avisan ARRIBA (terreno adelante) y BAJO, porque en las islas
//     el terreno mata;
//   · el radar ambar nombra el lugar mas cercano (lo resuelve systems/islas/islas.js).
//
// Lee todo de un SNAPSHOT (`w.islas`, que arma systems/islas/islas.js en A.islas) mas `run`/`cfg`: el render
// no importa sistemas (tools/lint_layers.js). La proyeccion al mundo llega por parametro.
import { ctx } from './ctx.js';
import { run } from '../core/run.js';
import { cfg } from '../core/state.js';
import { MSL_MAX } from '../data/tuning.js';

const W = 480, H = 270, DEG = Math.PI / 180, TAU = Math.PI * 2;
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const BAY = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(v => (v + 0.5) / 16);
const bay = (x, y) => BAY[(y & 3) * 4 + (x & 3)];

let cv = null, cx2 = null, img = null, obuf = null, hmask = null;
function buffers() {
  if (cv) return;
  cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  cx2 = cv.getContext('2d'); img = cx2.createImageData(W, H);
  obuf = new Uint32Array(img.data.buffer); hmask = new Uint8Array(W * H);
}

// ------------------------------------------------------------------ raster (ui/raster.js)
const C = h => { const n = parseInt(h.slice(1), 16); return (0xff000000 | ((n & 255) << 16) | (n & 0xff00) | (n >> 16)) >>> 0; };
const COL = {
  panel: C('#2a2236'), panelL: C('#332a42'), panelD: C('#1a1424'), coam: C('#140f1c'), bez: C('#54406a'), bezL: C('#8c7aa0'), bezD: C('#241a33'),
  face: C('#120c1c'), tick: C('#cbbfd2'), dim: C('#6f5a84'), needle: C('#fff3cf'), amber: C('#f0a640'), amberD: C('#6b3a10'),
  red: C('#d63a3a'), redD: C('#4a1a22'), green: C('#9be38a'), greenD: C('#1e3326'), sky: C('#5a5aa6'), skyL: C('#7a72b8'),
  gnd: C('#8a5a48'), gndD: C('#6e4436'), white: C('#fff8ec'), hud: C('#b4f5a0'), hudSh: C('#0d2412'), strut: C('#1d1626'), strutL: C('#4a3c5e'),
  rad: [C('#1a0f08'), C('#4a2410'), C('#8a4a14'), C('#d07c1c'), C('#ffb347')], ink: C('#f6d8b8'), black: C('#0a0710'),
};
let clipR = [0, 0, W, H], hudMode = false;
function setClip(x0, y0, x1, y1) { clipR = [Math.max(0, x0 | 0), Math.max(0, y0 | 0), Math.min(W, x1 | 0), Math.min(H, y1 | 0)]; }
function resetClip() { clipR = [0, 0, W, H]; }
function P(x, y, c) {
  x = Math.floor(x); y = Math.floor(y);
  if (x < clipR[0] || y < clipR[1] || x >= clipR[2] || y >= clipR[3]) return;
  if (hudMode) hmask[y * W + x] = 1; else obuf[y * W + x] = c;
}
function line(x0, y0, x1, y1, c, dash = 0) {
  x0 = Math.floor(x0); y0 = Math.floor(y0); x1 = Math.floor(x1); y1 = Math.floor(y1);
  const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  let err = dx + dy, k = 0, guard = 0;
  for (;;) {
    if (!dash || (k % dash) < dash / 2) P(x0, y0, c);
    k++;
    if ((x0 === x1 && y0 === y1) || ++guard > 4000) break;
    const e2 = 2 * err;
    if (e2 >= dy) { err += dy; x0 += sx; }
    if (e2 <= dx) { err += dx; y0 += sy; }
  }
}
function rectF(x, y, w, h, c) { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) P(x + i, y + j, c); }
function rectO(x, y, w, h, c) { line(x, y, x + w - 1, y, c); line(x, y + h - 1, x + w - 1, y + h - 1, c); line(x, y, x, y + h - 1, c); line(x + w - 1, y, x + w - 1, y + h - 1, c); }
function circ(cx, cy, r, c, dash = 0) {
  let x = r, y = 0, e = 1 - r, k = 0;
  while (x >= y) {
    if (!dash || (k++ % dash) < dash / 2) { P(cx + x, cy + y, c); P(cx + y, cy + x, c); P(cx - y, cy + x, c); P(cx - x, cy + y, c); P(cx - x, cy - y, c); P(cx - y, cy - x, c); P(cx + y, cy - x, c); P(cx + x, cy - y, c); }
    y++; if (e < 0) e += 2 * y + 1; else { x--; e += 2 * (y - x) + 1; }
  }
}
function disc(cx, cy, r, c) { for (let dy = -r; dy <= r; dy++) { const dx = Math.floor(Math.sqrt(r * r - dy * dy) + 0.5); for (let x = -dx; x <= dx; x++) P(cx + x, cy + dy, c); } }
const GLYPHS = {
  '0': '111101101101111', '1': '010110010010111', '2': '111001111100111', '3': '111001111001111', '4': '101101111001001',
  '5': '111100111001111', '6': '111100111101111', '7': '111001001010010', '8': '111101111101111', '9': '111101111001111',
  'A': '010101111101101', 'B': '110101110101110', 'C': '011100100100011', 'D': '110101101101110', 'E': '111100110100111',
  'F': '111100110100100', 'G': '011100101101011', 'H': '101101111101101', 'I': '111010010010111', 'J': '001001001101010',
  'K': '101101110101101', 'L': '100100100100111', 'M': '101111111101101', 'N': '110101101101101', 'O': '010101101101010',
  'P': '110101110100100', 'Q': '010101101110011', 'R': '110101110101101', 'S': '011100010001110', 'T': '111010010010010',
  'U': '101101101101111', 'V': '101101101101010', 'W': '101101111111101', 'X': '101101010101101', 'Y': '101101010010010',
  'Z': '111001010100111', '-': '000000111000000', '.': '000000000000010', ':': '000010000010000', '/': '001001010100100',
  '+': '000010111010000', '%': '101001010100101', '>': '100010001010100', '<': '001010100010001', '^': '010101000000000', ',': '000000000010100', ' ': '000000000000000',
  // la Ñ, que Dusk Patrol no necesitaba: la virgulilla arriba y una N de tres renglones
  'Ñ': '111000110101101',
};
const SIN_TILDE = { 'Á': 'A', 'É': 'E', 'Í': 'I', 'Ó': 'O', 'Ú': 'U' };
function text(s, x, y, c) {
  s = String(s).toUpperCase(); x = Math.floor(x); y = Math.floor(y);
  for (let k = 0; k < s.length; k++) {
    const g = GLYPHS[SIN_TILDE[s[k]] || s[k]] || GLYPHS[' '];
    for (let j = 0; j < 5; j++) for (let i = 0; i < 3; i++) if (g.charCodeAt(j * 3 + i) === 49) P(x + k * 4 + i, y + j, c);
  }
}
const textW = s => String(s).length * 4 - 1;
const textC = (s, cx, y, c) => text(s, cx - Math.floor(textW(s) / 2), y, c);
const pad = (n, w) => { const neg = n < 0; let s = String(Math.abs(Math.round(n))); while (s.length < w) s = '0' + s; return (neg ? '-' : '') + s; };
const easeOut = t => 1 - Math.pow(1 - clamp(t, 0, 1), 3);

// el avion de este cuadro (lo llena drawIslas desde el snapshot)
let J = null, tiempo = 0;

// ------------------------------------------------------------------ instrumentos (ui/instruments.js)
function bezel(cx, cy, r) {
  const R2 = r + 3;
  for (let dy = -R2; dy <= R2; dy++) for (let dx = -R2; dx <= R2; dx++) {
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d <= r) P(cx + dx, cy + dy, COL.face);
    else if (d <= r + 1.6) P(cx + dx, cy + dy, (dx + dy) < -r * 0.3 ? COL.bezL : (dx + dy) > r * 0.5 ? COL.bezD : COL.bez);
    else if (d <= R2 + 0.3) P(cx + dx, cy + dy, COL.bezD);
  }
  const k = Math.round((r + 3) * 0.78);
  for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) P(cx + sx * k, cy + sy * k, COL.dim);
}
function ticks(cx, cy, r, a0, a1, n, major, c, lenMaj = 3, lenMin = 1) {
  for (let i = 0; i <= n; i++) {
    const a = a0 + (a1 - a0) * i / n, L = i % major === 0 ? lenMaj : lenMin;
    const s = Math.sin(a), co = Math.cos(a);
    line(cx + s * (r - 1), cy - co * (r - 1), cx + s * (r - 1 - L), cy - co * (r - 1 - L), c);
  }
}
function needle(cx, cy, r, a, c, tail = 3) {
  const s = Math.sin(a), co = Math.cos(a);
  line(cx - s * tail, cy + co * tail, cx + s * r, cy - co * r, c);
  P(cx, cy, COL.white); P(cx + 1, cy, COL.dim); P(cx, cy + 1, COL.dim);
}
function label(cx, cy, r, a, s, c) { textC(s, cx + Math.sin(a) * r, cy - Math.cos(a) * r - 2, c); }

// VELOCIDAD EN KM/H (Dusk Patrol: nudos). Escala 0–1000, numeros en cientos.
function gASI(cx, cy, r) {
  bezel(cx, cy, r);
  const kmh = J.speed * 3.6, a0 = -150 * DEG, a1 = 150 * DEG;
  ticks(cx, cy, r, a0, a1, 40, 4, COL.tick, 3, 1);
  if (r >= 18) for (let v = 0; v <= 1000; v += 250) label(cx, cy, r - 8, lerp(a0, a1, v / 1000), String(v / 100 | 0), COL.tick);
  textC('KMH', cx, cy - Math.round(r * 0.45), COL.dim);
  rectF(cx - 8, cy + Math.round(r * 0.35), 16, 7, COL.black); rectO(cx - 8, cy + Math.round(r * 0.35), 16, 7, COL.bez);
  text(pad(kmh, 3), cx - 6, cy + Math.round(r * 0.35) + 1, J.sweet ? COL.amber : COL.needle);
  needle(cx, cy, r - 3, lerp(a0, a1, clamp(kmh / 1000, 0, 1)), COL.needle);
}
function gADI(cx, cy, r) {
  bezel(cx, cy, r);
  const roll = J.bank, pitch = J.pitch / DEG, ppd = r / 32;
  const cr = Math.cos(roll), sr = Math.sin(roll);
  for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
    if (dx * dx + dy * dy > (r - 1) * (r - 1)) continue;
    const yr = -dx * sr + dy * cr;
    const hy = yr - pitch * ppd;
    let c;
    if (Math.abs(hy) < 0.6) c = COL.white;
    else if (hy < 0) c = (hy > -r * 0.35) ? COL.skyL : COL.sky;
    else c = (hy < r * 0.35) ? COL.gnd : COL.gndD;
    P(cx + dx, cy + dy, c);
  }
  for (let pd = -30; pd <= 30; pd += 10) {
    if (!pd) continue;
    const off = (pitch - pd) * ppd, hw = Math.abs(pd) % 20 === 0 ? r * 0.32 : r * 0.18;
    const ax = cx - hw * cr - off * sr, ay = cy - hw * sr + off * cr, bx = cx + hw * cr - off * sr, by = cy + hw * sr + off * cr;
    if ((ax - cx) ** 2 + (ay - cy) ** 2 < (r - 3) ** 2 && (bx - cx) ** 2 + (by - cy) ** 2 < (r - 3) ** 2) line(ax, ay, bx, by, COL.tick);
  }
  for (const d of [-60, -45, -30, -20, -10, 0, 10, 20, 30, 45, 60]) {
    const a = d * DEG, L = d % 30 === 0 ? 3 : 2;
    line(cx + Math.sin(a) * (r - 1), cy - Math.cos(a) * (r - 1), cx + Math.sin(a) * (r - 1 - L), cy - Math.cos(a) * (r - 1 - L), COL.white);
  }
  const ra = -roll, px = cx + Math.sin(ra) * (r - 5), py = cy - Math.cos(ra) * (r - 5);
  P(px, py, COL.amber); P(px - 1, py + 1, COL.amber); P(px + 1, py + 1, COL.amber);
  const w = Math.round(r * 0.45);
  line(cx - w, cy, cx - 4, cy, COL.amber); line(cx + 4, cy, cx + w, cy, COL.amber);
  line(cx - 4, cy, cx - 2, cy + 2, COL.amber); line(cx + 4, cy, cx + 2, cy + 2, COL.amber); line(cx - 2, cy + 2, cx + 2, cy + 2, COL.amber);
  P(cx, cy, COL.amber);
}
// ALTIMETRO EN METROS (Dusk Patrol: pies). Aguja larga: cientos; corta: miles.
function gALT(cx, cy, r) {
  bezel(cx, cy, r);
  const m = Math.max(0, J.p[1]);
  ticks(cx, cy, r, 0, TAU, 50, 5, COL.tick, 3, 1);
  if (r >= 18) for (let i = 0; i < 10; i++) label(cx, cy, r - 8, i / 10 * TAU, String(i), COL.tick);
  const bx = cx - 11, by = cy + Math.round(r * 0.3);
  rectF(bx, by, 23, 7, COL.black); rectO(bx, by, 23, 7, COL.bez);
  text(pad(m, 4) + 'M', bx + 2, by + 1, COL.needle);
  textC('ALT', cx, cy - Math.round(r * 0.48), COL.dim);
  needle(cx, cy, Math.round(r * 0.55), (m % 10000) / 10000 * TAU, COL.tick, 2);
  needle(cx, cy, r - 3, (m % 1000) / 1000 * TAU, COL.needle);
}
function gHSI(cx, cy, r) {
  bezel(cx, cy, r);
  const hdg = ((J.yaw / DEG) % 360 + 360) % 360;
  for (let d = 0; d < 360; d += 5) {
    const a = (d - hdg) * DEG, L = d % 30 === 0 ? 3 : d % 10 === 0 ? 2 : 1, s = Math.sin(a), co = Math.cos(a);
    line(cx + s * (r - 1), cy - co * (r - 1), cx + s * (r - 1 - L), cy - co * (r - 1 - L), COL.tick);
    if (d % 30 === 0 && r >= 16) {
      const lbl = d === 0 ? 'N' : d === 90 ? 'E' : d === 180 ? 'S' : d === 270 ? 'O' : String(d / 10);
      label(cx, cy, r - 8, a, lbl, d % 90 === 0 ? COL.amber : COL.tick);
    }
  }
  line(cx, cy - r + 1, cx, cy - r + 4, COL.amber);
  line(cx - 4, cy, cx + 4, cy, COL.white); line(cx, cy - 4, cx, cy + 4, COL.white); line(cx - 2, cy + 3, cx + 2, cy + 3, COL.white);
  const bx = cx - 7, by = cy + Math.round(r * 0.38);
  if (r >= 16) { rectF(bx, by, 15, 7, COL.black); rectO(bx, by, 15, 7, COL.bez); text(pad(hdg, 3), bx + 2, by + 1, COL.needle); }
}
// VARIOMETRO EN M/S (Dusk Patrol: pies por minuto). ±30 m/s.
function gVSI(cx, cy, r) {
  bezel(cx, cy, r);
  const ang = v => -90 * DEG + Math.sign(v) * Math.sqrt(Math.min(Math.abs(v), 30) / 30) * 165 * DEG;
  for (const v of [-30, -20, -10, -5, -2, 0, 2, 5, 10, 20, 30]) {
    const a = ang(v), L = (Math.abs(v) % 10 === 0) ? 3 : 2;
    line(cx + Math.sin(a) * (r - 1), cy - Math.cos(a) * (r - 1), cx + Math.sin(a) * (r - 1 - L), cy - Math.cos(a) * (r - 1 - L), COL.tick);
    if (r >= 18 && (v === 0 || Math.abs(v) === 10 || Math.abs(v) === 30)) label(cx, cy, r - 8, a, String(Math.abs(v)), COL.tick);
  }
  text('SUB', cx + 2, cy - Math.round(r * 0.5), COL.dim); text('BAJ', cx + 2, cy + Math.round(r * 0.5) - 4, COL.dim);
  needle(cx, cy, r - 3, ang(J.vs), COL.needle);
}
function gTURN(cx, cy, r) {
  bezel(cx, cy, r);
  const rate = J.yawRate / DEG;
  const tilt = clamp(rate / 3 * 15, -40, 40) * DEG;
  for (const a of [-15, 15]) { const aa = (90 + a) * DEG, bb = (-90 + a) * DEG; line(cx + Math.sin(aa) * (r - 1), cy - Math.cos(aa) * (r - 1), cx + Math.sin(aa) * (r - 4), cy - Math.cos(aa) * (r - 4), COL.white); line(cx + Math.sin(bb) * (r - 1), cy - Math.cos(bb) * (r - 1), cx + Math.sin(bb) * (r - 4), cy - Math.cos(bb) * (r - 4), COL.white); }
  line(cx - r + 1, cy, cx - r + 4, cy, COL.tick); line(cx + r - 4, cy, cx + r - 1, cy, COL.tick);
  if (r >= 16) { text('I', cx - r + 4, cy + 4, COL.tick); text('D', cx + r - 7, cy + 4, COL.tick); textC('VIRAJE', cx, cy - Math.round(r * 0.55), COL.dim); }
  const w = Math.round(r * 0.62), c = Math.cos(tilt), s = Math.sin(tilt);
  line(cx - w * c, cy - w * s, cx + w * c, cy + w * s, COL.white);
  line(cx - s * 3, cy + c * 3 - 3, cx, cy, COL.white); disc(cx, cy, 1, COL.white);
  const by = cy + Math.round(r * 0.5), tw = Math.round(r * 0.55);
  for (let x = -tw; x <= tw; x++) { const yy = by + Math.round((x * x) / (tw * 3)); P(cx + x, yy - 2, COL.dim); P(cx + x, yy + 2, COL.dim); }
  line(cx - 3, by - 2, cx - 3, by + 2, COL.tick); line(cx + 3, by - 2, cx + 3, by + 2, COL.tick);
  const slip = clamp((J.bank - Math.atan(J.yawRate * J.speed / 9.81)) * 6, -tw + 2, tw - 2);
  const bxp = Math.round(cx + slip); disc(bxp, by + Math.round((slip * slip) / (tw * 3)), 1, COL.black);
}
function gSmall(cx, cy, r, val, lbl, txt, roja = 0.9, colAguja = COL.needle) {
  bezel(cx, cy, r);
  const a0 = -135 * DEG, a1 = 135 * DEG;
  ticks(cx, cy, r, a0, a1, 10, 5, COL.tick, 2, 1);
  const ra = lerp(a0, a1, roja); line(cx + Math.sin(ra) * (r - 1), cy - Math.cos(ra) * (r - 1), cx + Math.sin(ra) * (r - 3), cy - Math.cos(ra) * (r - 3), COL.red);
  textC(lbl, cx, cy + Math.round(r * 0.3), COL.dim);
  needle(cx, cy, r - 2, lerp(a0, a1, clamp(val, 0, 1)), colAguja, 1);
  if (txt) textC(txt, cx, cy + r + 4, COL.tick);
}
function gClock(cx, cy, r) {
  bezel(cx, cy, r);
  const d = new Date(), h = d.getHours(), mi = d.getMinutes(), s = d.getSeconds() + d.getMilliseconds() / 1000;
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; line(cx + Math.sin(a) * (r - 1), cy - Math.cos(a) * (r - 1), cx + Math.sin(a) * (r - (i % 3 ? 2 : 3)), cy - Math.cos(a) * (r - (i % 3 ? 2 : 3)), COL.tick); }
  needle(cx, cy, Math.round(r * 0.5), ((h % 12) + mi / 60) / 12 * TAU, COL.tick, 1);
  needle(cx, cy, r - 3, (mi + s / 60) / 60 * TAU, COL.needle, 1);
  const sa = Math.floor(s) / 60 * TAU; line(cx, cy, cx + Math.sin(sa) * (r - 2), cy - Math.cos(sa) * (r - 2), COL.red);
  textC(pad(h, 2) + ':' + pad(mi, 2), cx, cy + r + 4, COL.tick);
}
/** Barras verticales (EGT/NOZ en Dusk Patrol). `cols` opcional: un color por barra. */
function gBars(x, y, h, vals, lbl, txt, cols) {
  for (let k = 0; k < vals.length; k++) {
    const bx = x + k * 6;
    rectF(bx, y, 4, h, COL.face); rectO(bx - 1, y - 1, 6, h + 2, COL.bez);
    const f = Math.round(clamp(vals[k], 0, 1) * (h - 2));
    for (let j = 0; j < f; j++) {
      const c = cols ? cols[k] : j > (h - 2) * 0.85 ? COL.red : j > (h - 2) * 0.6 ? COL.amber : COL.green;
      P(bx + 1, y + h - 2 - j, c); P(bx + 2, y + h - 2 - j, c);
    }
  }
  const w = vals.length * 6 - 2;
  textC(lbl, x + Math.floor(w / 2), y - 7, COL.dim);
  if (txt) textC(txt, x + Math.floor(w / 2), y + h + 2, COL.tick);
}
function lamp(x, y, w, s, on, c, cd) {
  rectF(x, y, w, 9, on ? c : cd); rectO(x - 1, y - 1, w + 2, 11, COL.bezD);
  textC(s, x + Math.floor(w / 2), y + 2, on ? COL.black : COL.dim);
  if (on) P(x, y, COL.white);
}
/** LAS LAMPARAS, con lo que avisa RASANTE. */
function lamps(x, y, w) {
  const blink = Math.floor(tiempo * 4) % 2 === 0;
  const L = [
    ['ARRIBA', J.tirar && blink, COL.red, COL.redD],                       // el terreno de adelante te mata
    ['BAJO', J.ra < 30, COL.amber, COL.amberD],
    ['TURBO', J.abAmt > 0.5, COL.amber, COL.amberD],
    ['RECALENTADO', run.overheat && blink, COL.red, COL.redD],
    ['Z ' + run.msl, run.msl > 0, COL.green, COL.greenD],
    ['ESC ' + Math.max(0, run.lives) + '/' + Math.max(1, run.squad), run.lives > 0, COL.green, COL.greenD],
  ];
  const lw = Math.floor((w - 8) / 3);
  L.forEach((l, i) => lamp(x + (i % 3) * (lw + 4), y + Math.floor(i / 3) * 13, lw, l[0], l[1], l[2], l[3]));
}
/** LA PALANCA: sigue al gas y al turbo de RASANTE (Dusk Patrol: la postcombustion). */
function throttle(x, y0, y1) {
  const hgt = y1 - y0;
  rectF(x, y0, 5, hgt, COL.coam); rectO(x - 1, y0 - 1, 7, hgt + 2, COL.bez);
  const yMil = y0 + Math.round(hgt * 0.3), yIdle = y1 - 3;
  line(x - 3, yMil, x + 7, yMil, COL.amber);
  text('TUR', x + 9, y0, COL.amber); text('GAS', x + 9, yMil - 2, COL.tick); text('RAL', x + 9, yIdle - 3, COL.dim);
  const t = J.thr;
  const pos = t <= 0.8 ? lerp(yIdle, yMil, t / 0.8) : lerp(yMil, y0 + 2, (t - 0.8) / 0.2);
  const hy = Math.round(pos);
  rectF(x - 4, hy - 3, 13, 6, COL.bez); rectF(x - 3, hy - 2, 11, 2, COL.bezL); rectF(x - 3, hy + 1, 11, 1, COL.bezD);
  P(x + 6, hy - 1, J.abAmt > 0.5 ? COL.red : COL.dim);
}

// ------------------------------------------------------------------ radar (ui/radar.js)
const radar = { w: 0, h: 0, buf: null, a: -60 * DEG, dir: 1, RANGE: 10000 };
function radarUpdate(dt, rw, rh) {
  if (radar.w !== rw || radar.h !== rh || !radar.buf) { radar.w = rw; radar.h = rh; radar.buf = new Float32Array(rw * rh); }
  const buf = radar.buf, dec = Math.exp(-dt * 0.42);
  for (let i = 0; i < buf.length; i++) buf[i] *= dec;
  const prev = radar.a;
  let a = prev + radar.dir * dt * (120 / 1.25) * DEG;
  if (a > 60 * DEG) { a = 60 * DEG; radar.dir = -1; } else if (a < -60 * DEG) { a = -60 * DEG; radar.dir = 1; }
  radar.a = a;
  const ax = rw / 2, ay = rh - 2, R = rh - 4;
  const steps = Math.max(1, Math.ceil(Math.abs(a - prev) / (0.6 * DEG)));
  const hd = [Math.sin(J.yaw), -Math.cos(J.yaw)], rh2 = [Math.cos(J.yaw), Math.sin(J.yaw)];
  const sH = (x, z) => Math.max(J.suelo(x, z), 0);
  for (let s = 1; s <= steps; s++) {
    const ang = lerp(prev, a, s / steps), sa = Math.sin(ang), ca = Math.cos(ang);
    const wd = [hd[0] * ca + rh2[0] * sa, hd[1] * ca + rh2[1] * sa];
    let maxEl = -1e9, prevH = sH(J.p[0], J.p[2]);
    for (let r = 1; r <= R; r++) {
      const dist = r / R * radar.RANGE;
      const x = J.p[0] + wd[0] * dist, z = J.p[2] + wd[1] * dist;
      const h = J.suelo(x, z), hh = Math.max(h, 0);
      const el = (hh - J.p[1]) / dist;
      let v;
      if (h < 0) v = 0.03;
      else if (el < maxEl) v = 0.05;
      else v = clamp(0.28 + (hh - prevH) / (radar.RANGE / R) * 2.2 + hh / 1100, 0.12, 1);
      if (el > maxEl) maxEl = el;
      prevH = hh;
      const px = Math.round(ax + sa * r), py = Math.round(ay - ca * r);
      if (px >= 0 && px < rw && py >= 0 && py < rh) buf[py * rw + px] = Math.max(buf[py * rw + px], v);
    }
  }
}
function drawRadar(x, y, rw, rh) {
  rectF(x - 2, y - 2, rw + 4, rh + 4, COL.bezD); rectO(x - 3, y - 3, rw + 6, rh + 6, COL.bez); rectO(x - 2, y - 2, rw + 4, rh + 4, COL.bezL);
  const buf = radar.buf, ax = rw / 2, ay = rh - 2, R = rh - 4;
  for (let j = 0; j < rh; j++) for (let i = 0; i < rw; i++) {
    const dx = i - ax, dy = ay - j;
    const inCone = dy > 0 && Math.atan2(Math.abs(dx), dy) <= 60.5 * DEG && dx * dx + dy * dy <= R * R;
    if (!inCone) { P(x + i, y + j, COL.rad[0]); continue; }
    const v = buf[j * rw + i] * 4;
    const lvl = Math.min(4, Math.floor(v + bay(i, j) - 0.5) + 1);
    P(x + i, y + j, COL.rad[Math.max(0, Math.min(4, v < 0.15 ? 0 : lvl))]);
  }
  for (const f of [1 / 3, 2 / 3, 1]) {
    const rr = R * f;
    for (let a = -60; a <= 60; a += 3) { const an = a * DEG; P(x + ax + Math.sin(an) * rr, y + ay - Math.cos(an) * rr, COL.amberD); }
  }
  for (const a of [-60, -30, 0, 30, 60]) { const an = a * DEG; line(x + ax, y + ay, x + ax + Math.sin(an) * R, y + ay - Math.cos(an) * R, COL.amberD, a ? 4 : 0); }
  const sa = radar.a; line(x + ax, y + ay, x + ax + Math.sin(sa) * R, y + ay - Math.cos(sa) * R, COL.rad[4]);
  P(x + ax, y + ay, COL.white); P(x + ax - 1, y + ay + 1, COL.white); P(x + ax + 1, y + ay + 1, COL.white);
  text(J.lugar || 'MALVINAS', x + 2, y + 2, COL.amber); text('10', x + rw - 9, y + 2, COL.amber);
  text(pad(((J.yaw / DEG) % 360 + 360) % 360, 3), x + 2, y + rh - 7, COL.amber);
}

// ------------------------------------------------------------------ la cabina (ui/cockpit.js)
function drawCockpit(cw, dt) {
  const ph = Math.round(H * 0.40);
  const slide = Math.round((1 - easeOut(cw)) * (ph + 22));
  const top = H - ph + slide;
  if (top >= H + 10) return H;
  if (cw > 0.4) {
    const sw = Math.max(4, Math.round(W * 0.012));
    for (const sgn of [-1, 1]) {
      const xb = sgn < 0 ? 0 : W - 1, xt = sgn < 0 ? Math.round(W * 0.1) : W - 1 - Math.round(W * 0.1);
      for (let k = 0; k < sw; k++) line(xb - sgn * k + sgn * sw, top - 6, xt - sgn * k, -1 - Math.round((1 - cw) * H), k === 0 || k === sw - 1 ? COL.strutL : COL.strut);
    }
  }
  for (let x = 0; x < W; x++) {
    const u = (x - W / 2) / (W * 0.5), yc = top - Math.round(10 * Math.max(0, 1 - u * u));
    for (let y = yc; y < top + 4; y++) P(x, y, COL.coam);
    P(x, yc, COL.bez);
  }
  for (let y = top + 4; y < H; y++) for (let x = 0; x < W; x++) P(x, y, bay(x, y) < 0.08 ? COL.panelL : bay(x, y) > 0.94 ? COL.panelD : COL.panel);
  line(0, top + 4, W - 1, top + 4, COL.panelL);
  const R = Math.max(10, Math.min(30, Math.floor(Math.min(ph * 0.2, W * 0.044))));
  const y1 = top + Math.round(ph * 0.37), y2 = top + Math.round(ph * 0.8);
  const X = f => Math.round(W * f);
  throttle(X(0.018), top + 14, H - 10);
  gASI(X(0.115), y1, R); gADI(X(0.228), y1, R + 3); gALT(X(0.342), y1, R);
  const rw = X(0.18), rh = Math.round(ph * 0.66);
  radarUpdate(dt, rw, rh); drawRadar(X(0.5) - Math.round(rw / 2), top + 12, rw, rh);
  gHSI(X(0.658), y1, R); gVSI(X(0.772), y1, R); gTURN(X(0.886), y1, R);
  lamps(X(0.07), y2 - 12, X(0.31));
  // NUESTROS RELOJES CHICOS: nafta y calor del cañon (Dusk Patrol: las RPM de los dos motores)
  const rs = Math.max(7, Math.round(R * 0.45));
  const nafta = cfg.fuelOn ? clamp(run.fuel / 100, 0, 1) : 1;
  gSmall(X(0.632), y2, rs, nafta, 'NAF', cfg.fuelOn ? pad(run.fuel, 2) : 'LL', 0.1);
  gSmall(X(0.696), y2, rs, run.heat, 'CAÑ', pad(run.heat * 100, 2), 0.85, run.overheat ? COL.red : COL.needle);
  // …y en las barras, los misiles (Z) y el reparto de energia (Dusk Patrol: EGT y tobera)
  const zs = []; for (let i = 0; i < MSL_MAX; i++) zs.push(i < run.msl ? 1 : 0);
  gBars(X(0.744), y2 - rs + 4, rs * 2 - 4, zs, 'Z', String(run.msl), zs.map(() => COL.green));
  const pip = J.pip | 0, en = [0, 1, 2].map(i => (i === pip ? 1 : 0.25));
  gBars(X(0.81), y2 - rs + 4, rs * 2 - 4, en, 'ENE', ['EQ', 'MOT', 'ARM'][pip] || '', [COL.amber, COL.amber, COL.amber]);
  gClock(X(0.886), y2, rs + 2);
  text(J.nombre || 'A-4B', X(0.5) - Math.floor(textW(J.nombre || 'A-4B') / 2), H - 7, COL.dim);
  return top - 10;
}

// ------------------------------------------------------------------ el HUD (ui/hud.js)
function drawHUD(bottom, proj, camP) {
  const madd = (a, d, k) => [a[0] + d[0] * k, a[1] + d[1] * k, a[2] + d[2] * k];
  const nose = proj(madd(camP, J.f, 3000));
  if (!nose) return;
  const bx = Math.round(nose[0]), by = Math.round(nose[1]);
  const hw = Math.min(Math.round(W * 0.3), 170);
  setClip(bx - hw, 6, bx + hw, bottom);
  hudMode = true;
  const yaw = J.yaw, hd = [Math.sin(yaw), 0, -Math.cos(yaw)], rh = [Math.cos(yaw), 0, Math.sin(yaw)];
  const horizon = proj(madd(camP, hd, 6000));
  for (let deg = -85; deg <= 85; deg += 5) {
    const th = deg * DEG, D = [hd[0] * Math.cos(th), Math.sin(th), hd[2] * Math.cos(th)];
    const c = proj(madd(camP, D, 6000)); if (!c) continue;
    const e = proj(madd(madd(camP, D, 6000), rh, 400)); if (!e) continue;
    let dx = e[0] - c[0], dy = e[1] - c[1]; const dl = Math.hypot(dx, dy) || 1; dx /= dl; dy /= dl;
    if (Math.abs(c[1] - by) > bottom && Math.abs(c[0] - bx) > hw * 2) continue;
    const half = deg === 0 ? hw * 0.9 : 26, gap = deg === 0 ? 14 : 9;
    for (const sg of [-1, 1]) {
      const x0 = c[0] + dx * gap * sg, y0 = c[1] + dy * gap * sg, x1 = c[0] + dx * half * sg, y1 = c[1] + dy * half * sg;
      line(x0, y0, x1, y1, 0, deg < 0 ? 4 : 0);
      if (deg !== 0) {
        let nx = -dy, ny = dx;
        if (horizon && ((horizon[0] - c[0]) * nx + (horizon[1] - c[1]) * ny) < 0) { nx = -nx; ny = -ny; }
        line(x1, y1, x1 + nx * 3, y1 + ny * 3, 0);
        if (deg % 10 === 0) text(String(Math.abs(deg)), x1 + dx * sg * 3 + (sg < 0 ? -8 : 1), y1 + dy * sg * 3 - 2, 0);
      }
    }
  }
  line(bx - 6, by, bx - 2, by, 0); line(bx + 2, by, bx + 6, by, 0); line(bx - 2, by, bx, by + 2, 0); line(bx + 2, by, bx, by + 2, 0);
  const fpm = proj(madd(camP, J.v, 3000));
  if (fpm) { circ(Math.round(fpm[0]), Math.round(fpm[1]), 3, 0); line(fpm[0] - 8, fpm[1], fpm[0] - 4, fpm[1], 0); line(fpm[0] + 4, fpm[1], fpm[0] + 8, fpm[1], 0); line(fpm[0], fpm[1] - 4, fpm[0], fpm[1] - 6, 0); }
  const ty = 12, hdg = yaw / DEG;
  for (let d = Math.floor((hdg - 30) / 5) * 5; d <= hdg + 30; d += 5) {
    const x = bx + Math.round((d - hdg) * 2.2);
    const dd = ((d % 360) + 360) % 360;
    line(x, ty + 8, x, ty + (dd % 10 === 0 ? 4 : 6), 0);
    if (dd % 10 === 0) textC(pad(dd / 10, 2), x, ty - 2, 0);
  }
  line(bx, ty + 10, bx - 2, ty + 12, 0); line(bx, ty + 10, bx + 2, ty + 12, 0);
  const lx = bx - hw + 4, rx = bx + hw - 30, my = by - 3;
  rectO(lx, my - 2, 18, 9, 0); text(pad(J.speed * 3.6, 3), lx + 3, my, 0);
  text('KMH', lx + 3, my + 10, 0);
  rectO(rx, my - 2, 26, 9, 0); text(pad(J.p[1], 4), rx + 3, my, 0);
  text('R' + pad(J.ra, 4), rx + 1, my + 10, 0);
  text('G' + J.G.toFixed(1), lx, my + 22, 0);
  text('Z ' + run.msl, rx + 1, my + 22, 0);
  if (J.abAmt > 0.5) text('TURBO', rx + 1, my + 30, 0);
  if (J.tirar && Math.floor(tiempo * 4) % 2 === 0) textC('ARRIBA', bx, by + 18, 0);
  else if (J.ra < 30) textC('BAJO', bx, by + 18, 0);
  hudMode = false;
  const [x0, y0, x1, y1] = clipR;
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
    const i = y * W + x;
    if (hmask[i] && x + 1 < W && y + 1 < H && !hmask[i + W + 1]) obuf[i + W + 1] = COL.hudSh;
  }
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) { const i = y * W + x; if (hmask[i]) { obuf[i] = COL.hud; hmask[i] = 0; } }
  resetClip();
}

// ------------------------------------------------------------------ el aguanieve (ui/sleet.js)
const sleet = [];
const SLEET_COL = [C('#e3e5e6'), C('#aeb3b7')];
const rnd = (a, b) => a + Math.random() * (b - a);
function flake(anywhere) { const s = anywhere ? 0.5 : 0.18; return { x: W / 2 + rnd(-s, s) * W, y: H * 0.45 + rnd(-s, s) * H, z: Math.random() }; }
function drawSleet(dt) {
  while (sleet.length < 80) sleet.push(flake(true));
  const cx = W / 2, cy = H * 0.45, sp = J.speed / 235;
  for (let i = 0; i < sleet.length; i++) {
    const f = sleet[i], px = f.x, py = f.y;
    const k = (1.2 + f.z * 2.6) * sp * dt;
    f.x += (f.x - cx) * k + 14 * dt * (0.5 + f.z);
    f.y += (f.y - cy) * k + 26 * dt * (0.5 + f.z);
    if (f.x < -4 || f.x > W + 4 || f.y < -4 || f.y > H + 4) { sleet[i] = flake(false); continue; }
    if (dt > 0) line(Math.round(px), Math.round(py), Math.round(f.x), Math.round(f.y), SLEET_COL[f.z > 0.6 ? 0 : 1]);
  }
}

let ultimoT = -1;
/** Dibuja el overlay de las islas encima del mundo. `w.islas` = el snapshot (A.islas); `project(x,y,z)` =
 *  la proyeccion de la camara 3D ({x, y, vis}). */
export function drawIslas(w, project) {
  const I = w.arena && w.arena.islas;
  if (!I) return;
  buffers();
  const dt = ultimoT < 0 ? 0 : clamp(w.t - ultimoT, 0, 0.05); ultimoT = w.t;
  J = I; tiempo = w.t;
  obuf.fill(0);
  if (!(I.vista === 0 && I.mezclaLista)) drawSleet(dt);
  let fondo = H;
  if (I.cw > 0.01) fondo = drawCockpit(I.cw, dt || 1 / 60);
  const proj = p => { const q = project(p[0], p[1], p[2]); return q.vis ? [q.x, q.y] : null; };
  if (I.cw > 0.92 && I.vista === 2) drawHUD(fondo, proj, I.camP);
  cx2.putImageData(img, 0, 0);
  const sm = ctx.imageSmoothingEnabled; ctx.imageSmoothingEnabled = false;
  ctx.drawImage(cv, 0, 0, W, H);
  ctx.imageSmoothingEnabled = sm;
}
