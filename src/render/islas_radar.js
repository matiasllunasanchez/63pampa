// LAS ISLAS REALES — LA RED DEL RADAR EN LAS VISTAS DEL PASILLO (20/11). Los tramos vienen ya proyectados de
// systems/islas/islas.js `redRadar` (via game.js): [x0, y0, x1, y1, alfa, onda, …]. El de ellos en verde, como la
// red del pasillo (render/world.js `drawRadarNet`); el nuestro, celeste. La onda que sale del centro, mas brillante.
import { ctx, W, H } from './ctx.js';

const COL = { gb: [96, 255, 120], arg: [140, 210, 255] };

export function drawRedIslas(R) {
  if (!R || !R.tramos.length) return;
  const c = COL[R.bando] || COL.gb, T = R.tramos, k = R.bando === 'gb' && R.visto ? 1 : 0.7;
  ctx.lineWidth = 1;
  for (let i = 0; i < T.length; i += 6) {
    const a = T[i + 4] * k, o = T[i + 5];
    const m = Math.min(255, 1 + o * 0.6);
    ctx.strokeStyle = `rgba(${Math.min(255, c[0] * m) | 0},${Math.min(255, c[1] * m) | 0},${Math.min(255, c[2] * m) | 0},${a.toFixed(3)})`;
    ctx.beginPath(); ctx.moveTo(T[i], T[i + 1]); ctx.lineTo(T[i + 2], T[i + 3]); ctx.stroke();
  }
  ctx.lineWidth = 1;
}

// LOS HARRIERS QUE TE PERSIGUEN (systems/islas/islas.js `amenazas`): adelante y en cuadro, un recuadro rojo con la
// distancia; atras o fuera de cuadro, una flecha roja en el borde, del lado por donde vienen, con ATRAS y los metros.
const ROJO = '#ff4a36', PISO_Y = H - 78;   // (el tablero ocupa la franja de abajo)
const MISIL_URGE = 1.5;   // s: el misil que llega antes que esto late rapido y en blanco (21/11)
export function drawAmenazas(L, t) {
  if (!L || !L.length) return;
  ctx.font = '5px monospace'; ctx.textAlign = 'center';
  const late = 0.65 + 0.35 * Math.sin(t * 10);
  for (const a of L) {
    const km = a.misil ? a.n + ' ' + a.seg.toFixed(1) + ' s' : a.dist >= 1000 ? (a.dist / 1000).toFixed(1) + ' km' : Math.round(a.dist) + ' m';
    // EL MISIL QUE TE VIENE (21/11, el autor: "no queda claro adonde tiran"; islas.js `misilesQueVienen`): en cuadro, un
    // ROMBO que late mas rapido cuanto menos le falta, la RAYA punteada hasta tu avion (adonde va) y su nombre con los
    // segundos; fuera de cuadro, la flecha del borde de abajo, con el mismo rotulo
    if (a.misil && a.x > 8 && a.x < W - 8 && a.y > 8 && a.y < PISO_Y) {
      const urge = a.seg < MISIL_URGE, lt = 0.6 + 0.4 * Math.sin(t * (urge ? 26 : 12)), r = urge ? 7 : 5;
      ctx.globalAlpha = 0.55 * lt; ctx.strokeStyle = ROJO; ctx.lineWidth = 1; ctx.setLineDash([2, 3]);
      ctx.beginPath(); ctx.moveTo(Math.round(a.x) + 0.5, Math.round(a.y) + 0.5); ctx.lineTo(Math.round(a.yo.x) + 0.5, Math.round(a.yo.y) + 0.5); ctx.stroke();
      ctx.setLineDash([]); ctx.globalAlpha = lt;
      ctx.beginPath(); ctx.moveTo(a.x, a.y - r); ctx.lineTo(a.x + r, a.y); ctx.lineTo(a.x, a.y + r); ctx.lineTo(a.x - r, a.y); ctx.closePath();
      ctx.strokeStyle = '#1c0804'; ctx.lineWidth = 3; ctx.stroke(); ctx.strokeStyle = urge ? '#ffffff' : ROJO; ctx.lineWidth = 1; ctx.stroke();
      ctx.fillStyle = ROJO; ctx.fillText(km, Math.round(a.x), Math.round(a.y - r - 3));
      ctx.globalAlpha = 1;
      continue;
    }
    if (a.adelante && !a.misil && a.x > 8 && a.x < W - 8 && a.y > 8 && a.y < PISO_Y) {
      const r = 6;
      ctx.strokeStyle = ROJO; ctx.lineWidth = 1; ctx.globalAlpha = late;
      ctx.strokeRect(Math.round(a.x - r) + 0.5, Math.round(a.y - r) + 0.5, r * 2, r * 2);
      ctx.fillStyle = ROJO; ctx.fillText(km, Math.round(a.x), Math.round(a.y + r + 7));
      ctx.globalAlpha = 1;
      continue;
    }
    // la DIRECCION desde el centro: adelante, la del punto en pantalla; atras, el lado y la altura (y abajo)
    let dx, dy;
    if (a.adelante) { dx = a.x - W / 2; dy = a.y - H / 2; }
    else { dx = a.x; dy = Math.max(30, Math.abs(a.y) * 0.5 + 30) * (a.y > 0 ? 1 : 1); }
    const n = Math.hypot(dx, dy) || 1, ux = dx / n, uy = dy / n;
    // el punto del borde (el rectangulo util, arriba del tablero)
    const mx = W / 2 - 14, my = (PISO_Y - 14) / 2, cyc = (PISO_Y) / 2;
    const k = Math.min(Math.abs(ux) > 1e-3 ? mx / Math.abs(ux) : 1e9, Math.abs(uy) > 1e-3 ? my / Math.abs(uy) : 1e9);
    const px = W / 2 + ux * k, py = cyc + uy * k;
    ctx.save(); ctx.translate(px, py); ctx.rotate(Math.atan2(uy, ux));
    ctx.globalAlpha = late; ctx.fillStyle = ROJO; ctx.strokeStyle = '#1c0804';
    ctx.beginPath(); ctx.moveTo(7, 0); ctx.lineTo(-4, -5); ctx.lineTo(-1, 0); ctx.lineTo(-4, 5); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore(); ctx.globalAlpha = 1;
    ctx.fillStyle = ROJO;
    ctx.fillText((a.adelante ? '' : 'ATRÁS ') + km, Math.round(px - ux * 14), Math.round(py - uy * 12 + 2));
  }
  ctx.textAlign = 'left';
}
