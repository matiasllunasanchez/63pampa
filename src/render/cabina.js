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

const IMG = new Image();
IMG.src = '../assets/planes/cabina.png';
const lista = () => IMG.complete && IMG.naturalWidth > 0;

export function drawCabina() {
  if (!lista()) return;
  const s = ctx.imageSmoothingEnabled;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(IMG, 0, 0, W, H);
  ctx.imageSmoothingEnabled = s;
}
