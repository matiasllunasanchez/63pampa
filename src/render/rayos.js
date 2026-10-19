// LOS RAYOS DE LA TORMENTA (systems/tormenta.js tiene el estado; game.js se lo pasa). Se dibujan con el FONDO —despues del cielo y
// las nubes, ANTES de las sierras del horizonte—, asi lo que esta delante los tapa. Como la tormenta es de
// noche, cada rayo abre su propio hueco en la oscuridad (`luz`, render/brillo.js): el trazo queda nitido y lo
// que tiene cerca se ilumina un poco.
import { ctx } from './ctx.js';
import { luz } from './brillo.js';

function trazo(pts, a, ancho) {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.globalAlpha = a * 0.45; ctx.strokeStyle = '#9fb4ff'; ctx.lineWidth = ancho + 2; ctx.stroke();
  ctx.globalAlpha = a; ctx.strokeStyle = '#f4f6ff'; ctx.lineWidth = ancho; ctx.stroke();
}

/** `rs` = los rayos vivos (systems/tormenta.js `rayosVivos`, se los pasa game.js: el render no importa systems). */
export function drawRayos(rs) {
  if (!rs.length) return;
  ctx.save();
  ctx.lineJoin = 'miter'; ctx.lineCap = 'butt';
  for (const r of rs) {
    if (r.a <= 0.03) continue;
    trazo(r.tronco, r.a, 1.2);
    for (const rama of r.ramas) trazo(rama, r.a * 0.7, 0.8);
    // el hueco en la noche, a lo largo del tronco (cada tantos puntos, para no pagar uno por quiebre)
    for (let i = 0; i < r.tronco.length; i += 2) luz(ctx, r.tronco[i][0], r.tronco[i][1], 10 + 8 * r.k, [190, 205, 255], 0.55 * r.a);
  }
  ctx.restore();
  ctx.globalAlpha = 1; ctx.beginPath();
}
