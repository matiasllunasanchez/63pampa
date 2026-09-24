// EL ESCAPE — las trazadoras de popa (PLAN_VUELTA_REAL V2). Vienen DESDE ATRAS: nacen entre la
// camara y el avion y se van hacia el horizonte, asi que se ven entrar por abajo de la pantalla y
// pasar al lado tuyo. Cada una es una raya corta de nucleo claro y borde naranja.
import { ctx } from './ctx.js';
import { proj } from '../core/fx.js';
import { escape, tiroEn } from '../core/escape.js';
import { ESC, CAP } from '../data/blanco.js';
import * as enemyArt from './enemies.js';
import { plane } from '../core/state.js';

export function drawTirosPopa(pz) {
  if (!escape.on || !escape.tiros.length) return;
  ctx.lineCap = 'round';
  for (const tr of escape.tiros) {
    if (tr.z < ESC.Z0) continue;
    // LA COLA ES PROPORCIONAL A LA PROFUNDIDAD: con un largo fijo en z, de lejos la raya media
    // cero pixeles y la trazadora solo se veia el decimo de segundo en que pasaba al lado (medido).
    const zc = tr.z, zt = Math.max(ESC.Z0, tr.z * 0.55);
    const a = proj(...xy(tiroEn(tr, zc, ESC.DIST, pz, ESC.G)), zc), b = proj(...xy(tiroEn(tr, zt, ESC.DIST, pz, ESC.G)), zt);
    const w = Math.max(1.5, Math.min(4, a.k * 0.5));
    ctx.strokeStyle = 'rgba(232,132,42,0.85)'; ctx.lineWidth = w * 2;
    ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(a.x, a.y); ctx.stroke();
    ctx.strokeStyle = '#fff3cf'; ctx.lineWidth = w;
    ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(a.x, a.y); ctx.stroke();
  }
  ctx.lineCap = 'butt';
}
const xy = p => [p.x, p.y];

/** LA CAP (V5): dos Sea Harrier cruzando el pasillo de lado a lado, lejos y adelante. Chicos a
 *  proposito: es una patrulla que pasa, no un duelo — el duelo es LA COLA, si te ven. */
export function drawCap(c) {
  const f = c.t / CAP.T;
  for (let i = 0; i < 2; i++) {
    const x = -c.lado * CAP.ANCHO * (1 - 2 * f) + plane.x - c.lado * i * 6;
    const s = proj(x, CAP.Y + i * 1.5, CAP.Z + i * 8);
    if (enemyArt.ready('harrier')) enemyArt.drawFrame(ctx, 'harrier', 0, 0, s.x, { centerY: s.y }, s.k, c.lado > 0, false, 0.25);
    else { ctx.fillStyle = '#2b2f33'; ctx.fillRect(s.x - 2, s.y - 1, 4, 2); }
  }
}
