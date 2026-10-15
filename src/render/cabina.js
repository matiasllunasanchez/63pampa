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
import { CABINA_CAPAS } from '../data/cabina_anclas.js';

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

export function drawCabina() {
  if (!lista()) return;
  const s = ctx.imageSmoothingEnabled;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(IMG, 0, 0, W, H);
  const lado = signo((inp.r - inp.l) + (inp.rollAx || 0));
  const cabeceo = signo(inp.u - inp.d);                       // + trepar = palanca atras
  drawCapa('acelerador', 0, inp.brake ? 0 : (inp.turbo || run.boost) ? 2 : 1);
  drawCapa('palanca', cabeceo + 1, lado + 1);
  ctx.imageSmoothingEnabled = s;
}
