// RENDER DEL ESCUADRON: la formacion del despegue (y su salida de plano) y la sobreimpresion
// de la cinematica del relevo. La logica vive en systems/squad.js; los puestos de la formacion
// y los tiempos, en core/squad.js.
//
// OJO con los dos espacios de coordenadas (ver render/ctx.js): drawFormation dibuja EN EL MUNDO
// (480x270, la llaman junto a drawPlane) y drawRelevo en la GRILLA DE DISEÑO (320x180, la llaman
// dentro del ctx.scale(U) de las pantallas). Por eso los alias DW/DH de abajo.

import { ctx, px, DW, DH, PZ } from './ctx.js';
import { plane } from '../core/state.js';
import { run } from '../core/run.js';
import { proj } from '../core/fx.js';
import { T } from '../core/i18n.js';
import { P } from '../data/palette.js';
import { PLANES, SHEET_FW, SHEET_FH, SHEET_NF } from '../data/planes.js';
import { PLANE_SCALE } from './plane.js';
import { drawSquadPips } from './hud.js';
import { formationSlots, RELEVO_WRECK, RELEVO_DUR } from '../core/squad.js';

/** La formacion detras del lider. `exit` = null durante el despegue; 0..1 durante la salida de
 *  plano (al CONTROL LIBRE: aceleran, crecen y pasan al costado de la camara — "te siguen ahi
 *  atras aunque no los veas"). Fuera de esos dos momentos NO se dibuja nunca: en vuelo seria
 *  un costo de render que no aporta y taparia el juego. */
export function drawFormation({ selPlane, exit }) {
  const pl = PLANES[selPlane];
  const slots = formationSlots(run.squad);
  const kRef = proj(0, 0, PZ).k;
  const smooth = ctx.imageSmoothingEnabled;
  ctx.imageSmoothingEnabled = false;
  // los puestos vienen ordenados de mas lejano (rank 1, z mayor) a mas cercano: pintor correcto
  for (let i = 0; i < slots.length; i++) {
    const sl = slots[i], rank = Math.ceil((i + 1) / 2);
    let z = PZ + sl.dz;
    let x = plane.x + sl.dx;
    // siguen al lider con RETRASO: los de atras rotan mas tarde — la escalera de ascenso que
    // se ve en cualquier despegue en formacion. El seno es el bob de "vuelo vivo" de cada uno.
    let y = Math.max(0.8, plane.y - rank * 1.7) + Math.sin(run.t * 2.6 + i * 1.9) * 0.25;
    if (exit !== null && exit !== undefined) {
      z -= exit * exit * 11;               // se vienen encima (crecen): pasan el plano de camara
      y += exit * 2.4;                     // levantan un poco al pasar
      x += Math.sign(sl.dx || 1) * exit * 5;   // se abren: nadie atraviesa al jugador
      if (z < 3.8) continue;               // ya quedo detras de la camara
    }
    const s = proj(x, y, z);
    const f = s.k / kRef;
    // sombra corta: ata cada avion a la pista durante el carreteo (en el aire casi no se ve)
    if (y < 6) {
      const sh = proj(x, 0, z);
      ctx.globalAlpha = 0.18;
      px(sh.x - 7 * f, sh.y, 14 * f, 1, '#101c1e');
      ctx.globalAlpha = 1;
    }
    if (pl.sheetOk) {
      const col = (SHEET_NF - 1) / 2;                    // nivelados: la formacion no banquea
      const row = plane.pitch > 0.33 ? 0 : 1;            // pero acompañan el cabeceo del lider
      const w = SHEET_FW * PLANE_SCALE * f, h = SHEET_FH * PLANE_SCALE * f;
      ctx.drawImage(pl.sheetImg, col * SHEET_FW, row * SHEET_FH, SHEET_FW, SHEET_FH,
        s.x - w / 2, s.y - h / 2, w, h);
    } else if (pl.ready) {
      const w = 76 * PLANE_SCALE * f, h = w * pl.h / pl.w;
      ctx.drawImage(pl.img, s.x - w / 2, s.y - h / 2, w, h);
    }
  }
  ctx.imageSmoothingEnabled = smooth;
}

/** Sobreimpresion de la cinematica del relevo (grilla de diseño). El texto vive ACA y no en
 *  popups: es informacion de escena, fija mientras dura — un popup se iria flotando. */
export function drawRelevo(rv) {
  // LETTERBOX: dos barras — el lenguaje universal de "esto es cinematica, no perdiste el
  // control por un bug". Finas a proposito: el mundo (los restos, el companero) ES la escena.
  ctx.fillStyle = '#05070add';
  ctx.fillRect(0, 0, DW, 16); ctx.fillRect(0, DH - 16, DW, 16);
  ctx.textAlign = 'center';
  ctx.font = 'bold 8px monospace';
  ctx.fillStyle = Math.sin(rv.t * 12) > 0 ? P.warn : '#7d2f1e';
  ctx.fillText(T('sq_down', { n: rv.fallen + 1 }), DW / 2, 10);
  // LA CAUSA. Siempre estuvo en rv.cause y nunca se mostraba: el jugador moria sin saber por
  // que (playtest 2/8). Es la unica pantalla que puede contestarle en el momento.
  ctx.font = '7px monospace'; ctx.fillStyle = P.foam;
  ctx.fillText(T(rv.cause), DW / 2, 26);
  if (rv.t > RELEVO_WRECK) {
    ctx.font = '7px monospace'; ctx.fillStyle = P.accent;
    ctx.fillText(T('sq_take', { n: rv.next + 1 }), DW / 2, DH - 10);
    // cuenta hasta devolver el control: la barra se VACIA — mismo lenguaje que el conteo del
    // despegue (algo termina), no que una carga (algo se acumula)
    const rem = Math.max(0, 1 - (rv.t - RELEVO_WRECK) / (RELEVO_DUR - RELEVO_WRECK));
    px(DW / 2 - 24, DH - 6, Math.round(48 * rem), 2, P.accent);
  }
  // el tablero del escuadron, con el caido recien tachado: el costo se ve en el momento
  drawSquadPips(3, 3);
}
