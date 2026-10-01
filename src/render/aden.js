// LA RAFAGA DEL HARRIER — el dibujo (la regla es ADEN en data/tuning.js; el que la tira es
// systems/caza.js y el que la mueve y decide si pego, systems/collision.js).
//
// Dos piezas, y las dos tienen que leerse en el medio segundo que dura el aviso:
//   · EL ARO: cuatro esquinas rojas sobre el punto FIJADO, que se cierran durante el aviso. Es lo
//     que dice "ahi va a pegar" — y como el punto no se mueve con vos, en cuanto te corres el aro
//     se queda atras y se ve que zafaste.
//   · LAS TRAZADORAS: rayas calientes que salen desde la camara (el Harrier esta en tu cola) hacia
//     el punto, y siguen de largo hacia el horizonte si no pegaron.
//
// El render no manda: lee los tiros y los avisos como los dejo el sistema (convencion 4).
import { ctx, px, PZ } from './ctx.js';
import { proj } from '../core/fx.js';
import { run } from '../core/run.js';
import { ADEN } from '../data/tuning.js';

/** UN TIRO: la raya entre donde esta y donde estaba hace un instante, sobre la misma recta. */
export function drawAden(m) {
  const pos = u => ({ x: m.x0 + (m.tx - m.x0) * u, y: m.y0 + (m.ty - m.y0) * u, z: m.z0 + (PZ - m.z0) * u });
  const u = m.t / ADEN.T, u0 = Math.max(0, (m.t - 0.07) / ADEN.T);
  const a = pos(u), b = pos(u0);
  if (a.z < 1 || b.z < 1) return;
  const sa = proj(a.x, a.y, a.z), sb = proj(b.x, b.y, b.z);
  ctx.save();
  ctx.lineCap = 'round';
  ctx.strokeStyle = 'rgba(255,170,60,0.55)'; ctx.lineWidth = Math.max(2, sa.k * 0.32);
  ctx.beginPath(); ctx.moveTo(sb.x, sb.y); ctx.lineTo(sa.x, sa.y); ctx.stroke();
  ctx.strokeStyle = '#fff2c8'; ctx.lineWidth = Math.max(1, sa.k * 0.12);
  ctx.beginPath(); ctx.moveTo(sb.x, sb.y); ctx.lineTo(sa.x, sa.y); ctx.stroke();
  ctx.restore();
}

/** EL ARO del punto fijado: cuatro esquinas que se cierran de 1,7 a 1 durante el aviso, y titilan. */
export function drawAvisoAden(a) {
  const s = proj(a.x, a.y, PZ);
  const f = 1.7 - 0.7 * a.u;
  const rx = ADEN.R_X * s.k * f, ry = ADEN.R_Y * s.k * f, l = Math.max(3, rx * 0.35), g = Math.max(1, s.k * 0.12);
  const c = Math.sin(run.t * 30) > -0.2 ? '#ff4a2e' : '#ffd0a0';
  for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    const x = s.x + sx * rx, y = s.y + sy * ry;
    px(sx < 0 ? x : x - l, y - g / 2, l, g, c);
    px(x - g / 2, sy < 0 ? y : y - l, g, l, c);
  }
}
