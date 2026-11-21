// LA CABINA EN PRIMERA PERSONA (docs/sistemas/PLAN_PRIMERA_PERSONA.md, F2 — 14/10/2026).
//
// La imagen la hornea Blender desde el ojo del piloto con LA MISMA proyeccion del juego (tools/blender/
// hornear_cabina.py): se dibuja tal cual, a pantalla completa y clavada — la cabina es el avion; lo que
// rola y cabecea es el mundo de atras. Al doble (960x540): el buffer del juego.
//
// Las ANCLAS (data/cabina_anclas.js) dicen donde cae cada reloj del tablero y el colimador. F3 dibuja
// ahi los relojes vivos de render/hud.js; hoy el HUD de siempre sigue encima.
//
// Sin la imagen (todavia no cargo) no se dibuja cabina: se ve el mundo y el HUD, nada se rompe.
import { ctx, W, H } from './ctx.js';
import { inp } from '../core/input.js';
import { run } from '../core/run.js';
import { CABINA_CAPAS, CABINA_ANCLAS } from '../data/cabina_anclas.js';

const IMG = new Image();
IMG.src = '../assets/planes/cabina.png';
const lista = () => IMG.complete && IMG.naturalWidth > 0;

// LAS MANOS SE MUEVEN CON EL MANDO (el autor, 15/10): la palanca con la mano derecha (3x3 poses: fila =
// picar / centro / trepar, columna = izquierda / centro / derecha) y el acelerador con la izquierda
// (freno / normal / turbo), horneados aparte (tools/blender/armar_cabina.py). Se elige la pose de lo que
// el jugador APRIETA, no del avion: es su mano.
const CAPA = {};
// (rutas literales: tools/build_web.py las ve y las saca del build web, como la base)
for (const [n, src] of [['palanca', '../assets/planes/cabina_palanca.png'], ['acelerador', '../assets/planes/cabina_acelerador.png']]) {
  CAPA[n] = new Image(); CAPA[n].src = src;
}
function drawCapa(n, fila, col) {
  const im = CAPA[n], c = CABINA_CAPAS[n];
  if (!(im.complete && im.naturalWidth && c)) return;
  ctx.drawImage(im, col * c.fw, fila * c.fh, c.fw, c.fh, c.x, c.y, c.w, c.h);
}
const signo = v => v > 0.3 ? 1 : v < -0.3 ? -1 : 0;

// LOS RELOJES DE RELLENO ANDAN (20/11, el autor: "las agujas que no tienen indicador y son solo relleno hay que
// ponerlas que se muevan, tiemblen y cada tanto bajen o suban, alguna mas fija y mas lenta y otra mas rapida"): el
// horno los deja sin aguja (hornear_cabina.py `DECO`) y aca cada uno tiene su caracter —donde descansa, cuanto tiembla,
// cada cuanto se va a otro valor y que tan rapido llega—. El 3ro es el hueco del reloj de TEMPERATURA (render/hud.js
// ANCLA_TEMP): ese no lleva aguja de relleno.
const AGUJA_C = '#d9d8cc';
const CARACTER = [
  { base: 0.20, tiembla: 0.020, cada: [3, 6], salto: 0.18, vel: 3.0 },     // el chico de la izquierda: nervioso
  { base: 0.70, tiembla: 0.015, cada: [4, 8], salto: 0.12, vel: 2.2 },
  null,                                                                     // (el de la temperatura)
  { base: 0.55, tiembla: 0.004, cada: [12, 20], salto: 0.06, vel: 0.4 },    // casi fijo y lento (la presion)
  { base: 0.35, tiembla: 0.010, cada: [6, 11], salto: 0.10, vel: 1.0 },
  { base: 0.82, tiembla: 0.030, cada: [2, 4], salto: 0.22, vel: 4.5 },      // el rapido (las RPM)
  { base: 0.12, tiembla: 0.006, cada: [9, 15], salto: 0.08, vel: 0.7 },
  { base: 0.62, tiembla: 0.012, cada: [5, 9], salto: 0.15, vel: 1.6 },
  { base: 0.40, tiembla: 0.003, cada: [15, 25], salto: 0.05, vel: 0.3 },    // el mas quieto
];
const AGUJAS = CARACTER.map(c => (c ? { v: c.base, meta: c.base, prox: c.cada[0] * Math.random() } : null));
let agujasT = null;
function drawAgujas() {
  const D = CABINA_ANCLAS.deco || [];
  const ahora = performance.now() / 1000, dt = agujasT === null ? 0 : Math.min(0.1, ahora - agujasT);
  agujasT = ahora;
  for (let i = 0; i < D.length; i++) {
    const c = CARACTER[i % CARACTER.length], a = AGUJAS[i % AGUJAS.length];
    if (!c || !a) continue;
    a.prox -= dt;
    if (a.prox <= 0) {   // cada tanto se va a otro valor (sube o baja) y despues vuelve cerca de su lugar
      a.prox = c.cada[0] + Math.random() * (c.cada[1] - c.cada[0]);
      a.meta = Math.max(0.03, Math.min(0.97, c.base + (Math.random() * 2 - 1) * c.salto));
    }
    a.v += (a.meta - a.v) * Math.min(1, dt * c.vel);
    const f = a.v + (Math.sin(ahora * 23 + i * 7) * 0.6 + Math.sin(ahora * 37 + i * 3) * 0.4) * c.tiembla;
    // la escala va de abajo a la izquierda (0) a abajo a la derecha (1), por arriba, como un reloj de verdad
    const ang = Math.PI * 0.75 + f * Math.PI * 1.5;
    const [x, y, r] = D[i], L = r * 0.78;
    ctx.strokeStyle = AGUJA_C; ctx.lineWidth = Math.max(0.8, r * 0.1); ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x - Math.cos(ang) * r * 0.18, y - Math.sin(ang) * r * 0.18); ctx.lineTo(x + Math.cos(ang) * L, y + Math.sin(ang) * L); ctx.stroke();
    ctx.fillStyle = '#2b3033'; ctx.beginPath(); ctx.arc(x, y, Math.max(0.8, r * 0.14), 0, Math.PI * 2); ctx.fill();
  }
  ctx.lineCap = 'butt';
}

export function drawCabina() {
  if (!lista()) return;
  const s = ctx.imageSmoothingEnabled;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(IMG, 0, 0, W, H);
  drawAgujas();
  drawManos();
  ctx.imageSmoothingEnabled = s;
}

/** LAS MANOS, otra vez ENCIMA de los relojes vivos (21/11, el autor: "el indicador deberia estar por detras de la
 *  mano"): render/hud.js dibuja los relojes del tablero despues de la cabina y la palanca quedaba tapada por el de
 *  abajo al medio. El HUD llama a esto al terminar el tablero. */
export function drawManos() {
  if (!lista()) return;
  const s = ctx.imageSmoothingEnabled;
  ctx.imageSmoothingEnabled = false;
  const lado = signo((inp.r - inp.l) + (inp.rollAx || 0));
  const cabeceo = signo(inp.u - inp.d);                       // + trepar = palanca atras
  drawCapa('acelerador', 0, inp.brake ? 0 : (inp.turbo || run.boost) ? 2 : 1);
  drawCapa('palanca', cabeceo + 1, lado + 1);
  ctx.imageSmoothingEnabled = s;
}
