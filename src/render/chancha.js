// EL DIBUJO DE LA CHANCHA (SPEC_PODER_CHANCHA RF-03/RF-08). El estado vive en
// systems/chancha.js; aca solo se LEE su snapshot y se pinta (convencion 4 de ARQUITECTURA).
//
// SILUETA PROCEDURAL, cero assets (RNF-01): cuatro turbohelices, ala alta, cola en T y la
// manguera con la canasta colgando del ala derecha. Cuando llegue la hoja horneada se enchufa
// como en render/enemies.js —si cargo, sprite; si no, esto— y no hay que tocar nada mas.

import { ctx, px, W, H, HOR, F } from './ctx.js';
import { proj } from '../core/fx.js';
import { P } from '../data/palette.js';
import { run } from '../core/run.js';
import { CH_BOX } from '../data/tuning.js';
import { snapshot } from '../systems/chancha.js';

/** El Hercules, la manguera y la canasta. Se llama desde draw() en 'play', despues del mundo. */
export function drawChancha() {
  const c = snapshot();
  if (!c || c.fase === 'eta') return;                       // en el ETA todavia no esta a la vista
  const s = proj(c.x, c.y, c.z);
  const k = F / c.z;
  const w = 26 * k, h = 3.4 * k;                            // el KC-130 es GRANDE: se lee de lejos
  const bodyY = s.y - h / 2;

  // ALA ALTA de punta a punta (el Hercules es un ala arriba del fuselaje, y esa es su silueta)
  px(s.x - w / 2, bodyY - h * 0.35, w, Math.max(1, h * 0.34), '#5a6a63');
  // los cuatro motores, dos por lado, colgando del ala
  for (const f of [-0.34, -0.19, 0.19, 0.34]) {
    px(s.x + w * f - Math.max(1, w * 0.022), bodyY - h * 0.35, Math.max(1, w * 0.045), Math.max(1, h * 0.7), '#41504a');
    // la helice: un borron claro que gira (no se dibujan palas, se dibuja el disco)
    ctx.globalAlpha = 0.35 + 0.25 * Math.sin(run.t * 30 + f * 9);
    px(s.x + w * f - Math.max(1, w * 0.03), bodyY - h * 0.62, Math.max(1, w * 0.06), Math.max(1, h * 0.28), P.dim);
    ctx.globalAlpha = 1;
  }
  // fuselaje, morro y la cola en T
  px(s.x - w * 0.16, bodyY, Math.max(2, w * 0.32), Math.max(1, h * 0.6), '#6b7a72');
  px(s.x - w * 0.2, bodyY + h * 0.12, Math.max(1, w * 0.05), Math.max(1, h * 0.36), '#8a9992');
  px(s.x + w * 0.14, bodyY - h * 0.95, Math.max(1, w * 0.035), Math.max(1, h * 1.0), '#5a6a63');
  px(s.x + w * 0.06, bodyY - h * 1.05, Math.max(1, w * 0.17), Math.max(1, h * 0.22), '#5a6a63');

  // LA MANGUERA: sale del ala derecha, cuelga y termina en la canasta. Se dibuja como una
  // cadena de puntos con panza —no una recta— porque una manguera tensa se lee como un palo.
  const b = proj(c.bx, c.by, c.bz);
  const cuelga = Math.abs(b.y - s.y) * 0.25;
  for (let i = 0; i <= 12; i++) {
    const u = i / 12;
    const hx = s.x + (b.x - s.x) * u, hy = s.y + (b.y - s.y) * u + Math.sin(u * Math.PI) * cuelga;
    px(hx, hy, Math.max(1, k * 0.16), Math.max(1, k * 0.16), '#2c332f');
  }
  // LA CANASTA: el aro. Es lo que hay que ir a buscar, asi que se dibuja MAS claro que el resto
  // del avion — es el unico punto de toda la pantalla que importa mientras dura la cita.
  const bw = Math.max(2, k * 1.5);
  px(b.x - bw / 2, b.y - bw / 2, bw, Math.max(1, bw * 0.25), c.conn ? P.accent : P.foam);
  px(b.x - bw / 2, b.y + bw / 4, bw, Math.max(1, bw * 0.25), c.conn ? P.accent : P.foam);
  px(b.x - bw / 2, b.y - bw / 2, Math.max(1, bw * 0.22), bw, c.conn ? P.accent : P.foam);
  px(b.x + bw / 2, b.y - bw / 2, Math.max(1, bw * 0.22), bw, c.conn ? P.accent : P.foam);

  // LA CAJA, dibujada solo mientras NO estas conectado: es la ayuda de punteria, y una vez
  // adentro estorba. Se ve donde hay que meterse, que es la mitad de poder meterse.
  if (!c.conn && c.fase === 'cita') {
    const c0 = proj(c.bx - CH_BOX, c.by + CH_BOX, c.bz), c1 = proj(c.bx + CH_BOX, c.by - CH_BOX, c.bz);
    ctx.globalAlpha = 0.35 + 0.2 * Math.sin(run.t * 5);
    const bw2 = c1.x - c0.x, bh2 = c1.y - c0.y, esq = Math.max(2, bw2 * 0.22);
    for (const [ex, ey] of [[c0.x, c0.y], [c1.x - esq, c0.y], [c0.x, c1.y - 1], [c1.x - esq, c1.y - 1]]) {
      px(ex, ey, esq, 1, P.crest);
    }
    for (const [ex, ey] of [[c0.x, c0.y], [c1.x - 1, c0.y], [c0.x, c1.y - esq], [c1.x - 1, c1.y - esq]]) {
      px(ex, ey, 1, esq, P.crest);
    }
    ctx.globalAlpha = 1;
  }

  // EL RUMBO: mientras la cita este en el aire y el avion no la tenga a tiro, una flecha en el
  // borde de la pantalla dice para donde esta. Sin esto, la Chancha esta arriba y el jugador
  // mirando el suelo — y la ventana se vence sin que nadie sepa que empezo.
  // (RF-03: mientras este EN EL AIRE. Antes pedia ademas estar 14 m por debajo, y esa condicion
  // apagaba la flecha justo en el tramo en que mas sirve — cuando ya subiste y la estas buscando
  // de costado. Se apaga sola al enganchar, que es cuando estorba.)
  if (c.fase === 'cita' && !c.conn) {
    const mx = Math.max(12, Math.min(W - 12, s.x));
    ctx.globalAlpha = 0.5 + 0.5 * Math.sin(run.t * 6);
    for (let i = 0; i < 4; i++) px(mx - (3 - i), HOR + 12 + i * 2, 2 * (i + 1) - 1, 2, P.accent);
    ctx.globalAlpha = 1;
  }
}
