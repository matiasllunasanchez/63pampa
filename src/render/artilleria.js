// LA ARTILLERIA DEL BUQUE — el dibujo (la logica es systems/artilleria.js; PLAN_DEFENSAS_BUQUE F3).
//
// Las COLUMNAS del 4,5": una pared de agua blanca que sube de golpe, se sostiene y se derrumba — lo
// que se ve venir es el aviso. Y el FOGONAZO en la torre del buque: la salva tiene autor, y dice
// para donde mirar. Las trazadoras de los 20/40 mm son misiles `tracer` y las dibuja game.js.
// El render no importa sistemas: todo llega por parametro (`a` es `artilleria.snapshot()`).
import { ctx, px, PZ } from './ctx.js';
import { proj } from '../core/fx.js';
import { run } from '../core/run.js';
import { blanco, zVista } from '../core/blanco.js';
import { BL } from '../data/blanco.js';
import { luzNoche } from './noche.js';

export function drawArtilleria(a) {
  if (!a) return;
  for (const c of a.cols) {
    if (c.z <= PZ * 0.6) continue;
    const z = zVista(c.z);
    const b = proj(c.x, 1, z), k = b.k;
    const fin = Math.max(0, Math.min(1, (c.vida - c.t) / 0.45));   // se derrumba al final
    const h = a.alto * c.u * k * (0.55 + 0.45 * fin), w = Math.max(2, 2.6 * k);
    ctx.globalAlpha = 0.85 * fin;
    px(b.x - w / 2, b.y - h, w, h, '#dde8e6');
    ctx.globalAlpha = 0.6 * fin;
    px(b.x - w * 0.8, b.y - h * 0.35, w * 1.6, h * 0.35, '#9fbcb8');            // la falda de espuma
    // la corona: gotas que se abren arriba
    for (let j = 0; j < 4; j++) {
      const dx = Math.sin(j * 2.1 + c.x) * w * (0.5 + c.u), r = Math.max(1, w * 0.35);
      ctx.globalAlpha = 0.7 * fin;
      px(b.x + dx - r / 2, b.y - h - r * (1 + j % 2), r, r, '#f2f7f5');
    }
  }
  if (blanco.on && a.fog.length) {
    const z = zVista(blanco.z);
    for (const f of a.fog) {
      const s = proj(f.x, blanco.base + BL.LEN * 0.11, z), r = Math.max(2, 3 * s.k) * (1 - f.u * 0.5);
      ctx.globalAlpha = 1 - f.u;
      px(s.x - r / 2, s.y - r / 2, r, r, '#fff1b0');
      luzNoche(ctx, s.x, s.y, 6 + s.k * 4, [255, 210, 120], 0.6 * (1 - f.u));
    }
  }
  ctx.globalAlpha = 1;
  void run;
}
