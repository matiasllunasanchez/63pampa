// EL DIBUJO DE LA COLA: los Harriers del duelo, su humo y su estela. Proyectiles NO — el Harrier
// no dispara (el porque esta en el encabezado de systems/caza.js).
//
// Plan: docs/sistemas/PLAN_HARRIERS_PERSECUCION.md, PLAN A. La logica vive en systems/caza.js;
// aca solo se LEE su snapshot y se pinta (convencion 4 de ARQUITECTURA).
//
// MULTIPLES HARRIERS: snapshot() devuelve un ARRAY de Harriers. Cada uno trae `deFrente` ya
// resuelto por el sistema: false => jet_rear (le ves la cola), true => jet (te encara).

import { ctx, px, PZ } from './ctx.js';
import { proj } from '../core/fx.js';
import { P } from '../data/palette.js';
import * as enemyArt from './enemies.js';
import { snapshot } from '../systems/caza.js';

const PH_DARK = 0.5, PH_SQUASH = 0.74;

// NO HAY TRAZADORAS. El Harrier no dispara (ver el encabezado de systems/caza.js), asi que el
// dibujo de proyectiles se fue con ellas: en `fx` solo quedan humo y estela.

function drawHumo(f) {
  const s = proj(f.x, f.y, f.z);
  const edad = 1 - Math.min(1, f.life / 2.2);
  const w = Math.max(1, s.k * f.r * (0.5 + edad * 1.6));
  ctx.globalAlpha = Math.min(0.55, f.life * 0.4);
  px(s.x - w / 2, s.y - w / 2, w, w, edad < 0.4 ? '#20262a' : P.dim);
  ctx.globalAlpha = 1;
}

function drawEstela(f) {
  const s = proj(f.x, f.y, f.z);
  const w = Math.max(1, s.k * f.r * 0.5);
  ctx.globalAlpha = Math.min(0.4, f.life * 0.4);
  px(s.x - w / 2, s.y - w / 2, w, w, P.crest);
  ctx.globalAlpha = 1;
}

function drawCazaSprite(H) {
  const s = proj(H.x, H.y, H.z);
  const k = s.k;
  // QUIEN DECIDE ESTO ES EL SISTEMA (convencion 4): `deFrente` sale del snapshot. Aca no se
  // adivina por fase ni por z — asi no vuelve a darse vuelta el sprite justo antes del horizonte.
  const trasero = !H.deFrente;

  if (trasero && enemyArt.ready('jet_rear')) {
    const cols = enemyArt.SHEETS.jet_rear.cols;
    const col = Math.max(0, Math.min(cols - 1, Math.round((H.lado * 0.5 + 0.5) * (cols - 1))));
    enemyArt.drawFrame(ctx, 'jet_rear', col, 0, s.x, { centerY: s.y }, k, false, false, 0);
  } else if (enemyArt.ready('jet')) {
    const cols = enemyArt.SHEETS.jet.cols;
    const col = Math.max(0, Math.min(cols - 1, Math.round((H.lado * 0.5 + 0.5) * (cols - 1))));
    if (trasero) {
      ctx.save();
      ctx.translate(s.x, 0);
      ctx.scale(PH_SQUASH, 1);
      enemyArt.drawFrame(ctx, 'jet', col, 0, 0, { centerY: s.y }, k, false, false, PH_DARK);
      ctx.restore();
    } else enemyArt.drawFrame(ctx, 'jet', col, 0, s.x, { centerY: s.y }, k, false, false, 0);
  } else {
    const c = trasero ? '#1b2228' : P.bodyDark;
    px(s.x - 4.2 * k, s.y - 0.4 * k, 8.4 * k, 0.8 * k, c);
    px(s.x - 1 * k, s.y - 1.4 * k, 2 * k, 2.8 * k, c);
    px(s.x - 0.35 * k, s.y - 2.8 * k, 0.7 * k, 1.5 * k, c);
    if (!trasero) px(s.x - 0.6 * k, s.y - 0.9 * k, 1.2 * k, 0.8 * k, P.canopy);
  }
  if (trasero) {
    const fl = 0.7 + Math.sin(H.t * 34) * 0.3;
    ctx.globalAlpha = 0.65;
    px(s.x - 0.5 * k * fl, s.y - 0.2 * k, k * fl, Math.max(1, 0.55 * k), '#f0954a');
    ctx.globalAlpha = 1;
    px(s.x - 0.22 * k * fl, s.y - 0.05 * k, Math.max(1, 0.45 * k * fl), Math.max(1, 0.3 * k), '#fff2cf');
  }
}

/** UN CUADRO de la flota. `lejos` = la pasada que va CON el mundo (todo lo que esta mas lejos que
 *  el avion); `!lejos` = la que va DESPUES del avion. */
export function drawCaza(lejos) {
  const fleet = snapshot();
  const corte = PZ;
  for (const H of fleet) {
    for (const f of H.fx) {
      if ((f.z > corte) !== !!lejos) continue;
      if (f.k === 'humo') drawHumo(f);
      else drawEstela(f);
    }
    if ((H.z > corte) === !!lejos && H.z > 1.5) drawCazaSprite(H);
  }
}
