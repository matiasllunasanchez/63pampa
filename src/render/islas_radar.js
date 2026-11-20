// LAS ISLAS REALES — LA RED DEL RADAR EN LAS VISTAS DEL PASILLO (20/11). Los tramos vienen ya proyectados de
// systems/islas/islas.js `redRadar` (via game.js): [x0, y0, x1, y1, alfa, onda, …]. El de ellos en verde, como la
// red del pasillo (render/world.js `drawRadarNet`); el nuestro, celeste. La onda que sale del centro, mas brillante.
import { ctx } from './ctx.js';

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
