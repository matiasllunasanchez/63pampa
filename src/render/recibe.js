// EL RECIBIMIENTO — las trazadoras del buque y sus fogonazos (systems/recibe.js). Decoracion pura.
//
// La trazadora es la misma raya del escape (render/escape.js): nucleo claro y borde naranja, y la
// cola proporcional a lo que recorrio, asi de lejos sigue midiendo algo. El fogonazo es una cruz
// chica de luz blanca-amarilla sobre la eslora, con su brillo en la capa de luz (render/brillo.js).
import { ctx } from './ctx.js';
import { proj } from '../core/fx.js';
import { recibe } from '../core/recibe.js';
import { blanco } from '../core/blanco.js';
import { luz } from './brillo.js';

const COLA = 0.18;   // fraccion del recorrido que mide la cola

export function drawRecibe() {
  if (!recibe.tiros.length && !recibe.destellos.length) return;
  // LOS FOGONAZOS, sobre el buque: siguen al casco (la z es la del buque de este cuadro)
  for (const f of recibe.destellos) {
    const s = proj(f.x, f.y, blanco.z), k = Math.max(1, Math.min(3, s.k * 0.6));
    const parpa = Math.sin(f.t * 90) > -0.3 ? 1 : 0.35;   // titila como un tiro de verdad
    ctx.globalAlpha = parpa;
    ctx.fillStyle = '#ffe9a8';
    ctx.fillRect(s.x - k * 1.5, s.y - k * 0.5, k * 3, k);
    ctx.fillRect(s.x - k * 0.5, s.y - k * 1.5, k, k * 3);
    ctx.fillStyle = '#fffbe8';
    ctx.fillRect(s.x - k * 0.5, s.y - k * 0.5, k, k);
    ctx.globalAlpha = 1;
    luz(ctx, s.x, s.y, 4 + k * 2, '255,220,140', 0.8 * parpa);
  }
  // LAS TRAZADORAS
  ctx.lineCap = 'round';
  for (const tr of recibe.tiros) {
    if (tr.t < 0) continue;
    const f = Math.min(1, tr.t / tr.T), f0 = Math.max(0, f - COLA);
    const at = g => proj(tr.ox + (tr.dx - tr.ox) * g, tr.oy + (tr.dy - tr.oy) * g, tr.oz + (tr.dz - tr.oz) * g);
    const a = at(f), b = at(f0);
    const w = Math.max(0.8, Math.min(2.5, a.k * 0.3));
    ctx.strokeStyle = 'rgba(232,132,42,0.7)'; ctx.lineWidth = w * 2;
    ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(a.x, a.y); ctx.stroke();
    ctx.strokeStyle = '#fff3cf'; ctx.lineWidth = w;
    ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(a.x, a.y); ctx.stroke();
    luz(ctx, a.x, a.y, 3 + w * 2, '255,170,80', 0.5);
  }
  ctx.lineCap = 'butt';
}
