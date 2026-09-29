// EL SEA WOLF — el dibujo (la logica es systems/seawolf.js; las perillas, data/tuning.js SW_*).
//
// Tres piezas, las tres en CELESTE HIELO (SEAWOLF_COL) para que no se confundan con el verde del
// radar, que es el Sea Dart:
//   · LA ZONA: una cupula sobre el buque, con el mismo lenguaje que la red del radar (arcos, un
//     barrido que late). Se ve venir de lejos y se enciende al entrar.
//   · EL ENGANCHE: mientras el buque te fija, una linea del buque a tu avion que titila. Es el
//     segundo de aviso: cuando deja de titilar, salen los misiles.
//   · EL MISIL: blanco y fino, con escape celeste y una estela recta y larga — el Sea Dart es
//     oscuro, con escape naranja y humo gris.
// El render no importa sistemas: todo llega por parametro (`sw` es `seawolf.snapshot()`).
import { ctx, px } from './ctx.js';
import { proj } from '../core/fx.js';
import { run } from '../core/run.js';
import { zVista } from '../core/blanco.js';
import { BL } from '../data/blanco.js';
import { colDefensa } from '../data/palette.js';
import { SW_ALTO } from '../data/tuning.js';

const RX = 62, H = 46;            // la cupula: medio ancho y alto (unidades de mundo)
const ARCO_STEP = 70;             // separacion entre arcos
const SWEEP = 1.8;                // segundos que tarda el barrido en ir del buque al borde
const CERCA = 30;                 // lo que esta a menos de esto de la camara no se dibuja

/** LA ZONA. `pz` = profundidad del avion. Se ve desde 1,6 veces su alcance y se enciende adentro. */
export function drawZonaSW(sw, pz) {
  if (!sw || !sw.on) return;
  const SW_ALCANCE = sw.alcance, SEAWOLF_COL = colDefensa(sw.tipo);
  const dist = sw.bz - pz;
  if (dist <= 0 || dist > SW_ALCANCE * 1.6) return;
  const vis = Math.min(1, (SW_ALCANCE * 1.6 - dist) / (SW_ALCANCE * 0.5));
  const dentro = sw.dentro;
  const pulso = dentro ? 0.6 + 0.4 * Math.abs(Math.sin(run.t * 5)) : 0.7;
  const col = dentro ? SEAWOLF_COL.punta : SEAWOLF_COL.cerca;
  const P3 = (x, y, z) => proj(x, y, zVista(z));
  ctx.save();
  ctx.lineWidth = 1; ctx.strokeStyle = col;
  // el BORDE sobre el agua: la mitad de adelante de la elipse — "de aca en adelante, te tiran"
  ctx.globalAlpha = 0.75 * vis * pulso;
  ctx.setLineDash([5, 3]);
  // (lo que queda pegado a la camara no se dibuja: a esa escala el borde es un trazo enorme que
  // cruza la pantalla y se lee como un recuadro, no como el limite de algo que esta alla adelante)
  ctx.beginPath();
  let va = false;
  for (let k = 0; k <= 32; k++) {
    const a = -Math.PI / 2 + Math.PI * k / 32;
    const z = sw.bz - SW_ALCANCE * Math.cos(a);
    if (z <= pz + CERCA) { va = false; continue; }
    const s = P3(BL.X + RX * Math.sin(a), 0.5, z);
    va ? ctx.lineTo(s.x, s.y) : ctx.moveTo(s.x, s.y); va = true;
  }
  ctx.stroke(); ctx.setLineDash([]);
  // LOS ARCOS: cortes de la cupula a profundidad constante, anclados al buque (se mueven con el)
  const barrido = sw.bz - ((run.t / SWEEP) % 1) * SW_ALCANCE;
  for (let d = ARCO_STEP; d < SW_ALCANCE; d += ARCO_STEP) arco(SW_ALCANCE, sw.bz - d, sw.bz, pz, P3, (0.22 + 0.1 * (1 - d / SW_ALCANCE)) * vis * pulso);
  // EL BARRIDO: un arco que sale del buque hacia el borde, mas brillante — el radar de seguimiento
  arco(SW_ALCANCE, barrido, sw.bz, pz, P3, 0.65 * vis * pulso);
  // la COSTURA de arriba: el lomo de la cupula, del borde al buque
  ctx.globalAlpha = 0.35 * vis * pulso;
  ctx.beginPath();
  let ini = false;
  for (let k = 0; k <= 20; k++) {
    const z = sw.bz - SW_ALCANCE * (1 - k / 20);
    if (z <= pz + CERCA) continue;
    const f = Math.sqrt(Math.max(0, 1 - ((sw.bz - z) / SW_ALCANCE) ** 2));
    const s = P3(BL.X, H * f, z);
    ini ? ctx.lineTo(s.x, s.y) : ctx.moveTo(s.x, s.y); ini = true;
  }
  ctx.stroke();
  ctx.restore();
}

/** Un arco de la cupula a la profundidad `z` (semi-elipse, del agua al agua). */
function arco(SW_ALCANCE, z, bz, pz, P3, alpha) {
  if (z <= pz + CERCA || z >= bz) return;
  const f = Math.sqrt(Math.max(0, 1 - ((bz - z) / SW_ALCANCE) ** 2));
  if (f < 0.05) return;
  ctx.globalAlpha = Math.max(0, alpha);
  ctx.beginPath();
  for (let k = 0; k <= 16; k++) {
    const a = Math.PI * k / 16;
    const s = P3(BL.X + RX * f * Math.cos(a), H * f * Math.sin(a), z);
    k ? ctx.lineTo(s.x, s.y) : ctx.moveTo(s.x, s.y);
  }
  ctx.stroke();
}

/** EL ENGANCHE: del buque a tu avion, mientras te fija (titila) y durante la salva (fija). */
export function drawEngancheSW(sw, plane, pz) {
  if (!sw || !sw.dentro || (sw.fase !== 'fija' && sw.fase !== 'salva')) return;
  if (sw.fase === 'fija' && Math.sin(run.t * 22) < 0) return;
  const a = proj(BL.X, SW_ALTO, zVista(sw.bz)), b = proj(plane.x, plane.y, pz);
  ctx.save();
  ctx.strokeStyle = colDefensa(sw.tipo).punta; ctx.lineWidth = 1;
  ctx.globalAlpha = sw.fase === 'salva' ? 0.9 : 0.55;
  ctx.setLineDash(sw.fase === 'salva' ? [] : [4, 3]);
  ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
  ctx.restore();
}

/** EL MISIL Sea Wolf, de frente: fino y blanco, escape celeste, y SU ESTELA ENTERA — la raya del
 *  camino que hizo desde el buque (m.tr, que junta systems/collision.js). Es lo que deja leerlo
 *  venir y elegir el momento del quiebre. Se dibuja a la profundidad COMPRIMIDA del buque (zVista):
 *  si no, a lo lejos no salia del casco sino de un punto mas cerca. */
export function drawMisilSW(m) {
  // EL SEA CAT es mas gordo y lento, con estela de HUMO naranja oscuro; el Sea Wolf, fino y blanco
  const cat = m.def === 'cat', SEAWOLF_COL = colDefensa(m.def);
  const P3 = (x, y, z) => proj(x, y, zVista(z));
  const s = P3(m.x, m.y, m.z), k = s.k;
  ctx.save();
  const tr = (m.tr || []).filter(p => p.z > 3);
  if (tr.length) {
    ctx.lineCap = 'round';
    for (const [col, w, al] of cat ? [['#2a1a10', 4, 0.3], ['#d8b89a', 2, 0.6]] : [['#0d1216', 3, 0.35], ['#e9f6fb', 1.2, 0.75]]) {
      ctx.strokeStyle = col; ctx.lineWidth = w; ctx.globalAlpha = al;
      ctx.beginPath();
      tr.forEach((p, i) => { const q = P3(p.x, p.y, p.z); i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y); });
      ctx.lineTo(s.x, s.y); ctx.stroke();
    }
  }
  // CON TAMAÑO MINIMO: de lejos es un punto sobre el mar y se perdia; tiene que verse venir desde
  // que sale del buque, porque el quiebre se juega mirandolo
  const fl = 0.75 + Math.sin(run.t * 34 + m.z) * 0.25;
  const c = Math.max(4, 1.6 * k) * fl * (cat ? 1.2 : 1), b = Math.max(2, 0.9 * k) * (cat ? 1.3 : 1), e = Math.max(1, 0.45 * k);
  ctx.globalAlpha = 0.6;
  px(s.x - c / 2, s.y - c / 2, c, c, SEAWOLF_COL.escape);        // corona celeste
  ctx.globalAlpha = 1;
  px(s.x - b / 2, s.y - b / 2, b, b, '#dfe6ea');                 // cuerpo blanco
  px(s.x - e / 2, s.y - e / 2, e, e, '#ffffff');                 // escape
  ctx.restore();
}

/** EL HUMO DE CADA DISPARO (28/9): una bocanada blanca en la cubierta, del lado por donde salio el
 *  misil, que sube, se abre y se apaga. Con tiro continuo el buque queda envuelto en su propio humo,
 *  que es como se veia una fragata defendiendose. Va con el buque, a su profundidad comprimida. */
export function drawHumoSW(sw) {
  if (!sw || !sw.humos || !sw.humos.length || !(sw.bz > 3)) return;
  const z = zVista(sw.bz);
  ctx.save();
  for (const h of sw.humos) {
    const u = Math.max(0, Math.min(1, h.u));
    // A LA ESCALA DEL BUQUE, no del mundo: de lejos el casco mide pocas decenas de pixeles, y una
    // bocanada de tamaño real ahi era una mota. El humo se mide en largos de buque en pantalla.
    const base = proj(BL.X, SW_ALTO, z), L = Math.max(24, BL.LEN * base.k);
    for (let j = 0; j < 5; j++) {
      // cinco copos por bocanada, cada uno con su deriva: el viento la tira hacia un costado
      const dx = (h.dx / 4) * L * 0.12 + Math.sin(h.s * 3.1 + j * 1.7) * L * (0.02 + u * 0.08) + u * L * 0.1;
      const dy = -(u * L * 0.32 + j * L * 0.015);
      const r = Math.max(3, L * (0.06 + u * 0.16) * (1 - j * 0.1));
      const s = { x: base.x + dx, y: base.y + dy };
      ctx.globalAlpha = (1 - u) * (u < 0.08 ? u / 0.08 : 1) * 0.6;
      px(s.x - r / 2, s.y - r / 2, r, r, j === 0 && u < 0.25 ? '#fff6e0' : j % 2 ? '#c9ced1' : '#e4e8ea');
    }
  }
  ctx.restore();
}
