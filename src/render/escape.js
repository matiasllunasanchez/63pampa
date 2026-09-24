// EL ESCAPE — las trazadoras de popa (PLAN_VUELTA_REAL V2). Vienen DESDE ATRAS: nacen entre la
// camara y el avion y se van hacia el horizonte, asi que se ven entrar por abajo de la pantalla y
// pasar al lado tuyo. Cada una es una raya corta de nucleo claro y borde naranja.
import { ctx } from './ctx.js';
import { proj } from '../core/fx.js';
import { escape, tiroEn } from '../core/escape.js';
import { ESC } from '../data/blanco.js';

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
