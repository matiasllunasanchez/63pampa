// EL PULSO — el overlay de la prueba de destreza (docs/sistemas/PLAN_EL_PULSO.md).
//
// Se dibuja ENCIMA del mundo 2D congelado: el mar, el horizonte y el buque creciendo son los del
// pasillo (drawApproachBarge) — este modulo NO los pinta. Lo que agrega es la cabina y la
// autopista de la secuencia.
//
// LA REGLA 3 DEL PLAN mandando en el layout: lo que viene SE VE VENIR. La secuencia entera esta
// en pantalla desde el primer cuadro y el cursor avanza sobre ella; nunca aparece un simbolo
// sorpresa de a uno. El jugador lee adelante, igual que lee el pasillo.
//
// Espacio de coordenadas: MUNDO (480×270, W/H de ctx.js) — es la capa donde vive la cabina.
import { ctx, W, H, px } from './ctx.js';
import { P } from '../data/palette.js';
import { T } from '../core/i18n.js';
import { run } from '../core/run.js';
import { TOK_GLIFO } from '../data/pulso.js';
import * as momRender from './momentum.js';

// La cabina baja lo mismo que en el ARENA: el visor pintado del PNG cae sobre el centro util.
const COCKPIT_Y = 104;
// La autopista de compases va ARRIBA del visor: abajo esta el morro del avion (la cabina tapa) y
// el centro tiene que quedar limpio para VER el buque — que es la mitad de la escena.
const LANE_Y = 74;

/** Un compas: su rotulo diegetico (regla 2) y sus tokens como glifos. `st` 0=hecho 1=activo 2=por venir */
function drawCompas(cx, y, bar, st, ti, t) {
  const on = st === 1;
  ctx.textAlign = 'center';
  // ROTULO: el nombre de la maniobra. Es lo que convierte "abajo-izquierda-izquierda" en volar.
  ctx.font = on ? 'bold 8px monospace' : '7px monospace';
  ctx.fillStyle = st === 0 ? '#4a5b61' : on ? P.accent : P.dim;
  ctx.fillText(bar.label, cx, y - 10);
  // TOKENS
  const gs = bar.toks.map(k => TOK_GLIFO[k] || k);
  const step = 15;
  const x0 = cx - (gs.length - 1) * step / 2;
  for (let i = 0; i < gs.length; i++) {
    const hecho = st === 0 || (on && i < ti);
    const activo = on && i === ti;
    const gx = x0 + i * step;
    if (activo) {   // el cursor: caja que late — donde estan los ojos
      const pulse = 0.5 + Math.sin(t * 9) * 0.5;
      ctx.globalAlpha = 0.25 + pulse * 0.35;
      px(gx - 7, y - 8, 14, 14, P.accent);
      ctx.globalAlpha = 1;
    }
    ctx.font = activo ? 'bold 11px monospace' : '10px monospace';
    ctx.fillStyle = hecho ? '#5f7a72' : activo ? '#0a0e11' : st === 2 ? P.dim : P.ink;
    ctx.fillText(gs[i], gx, y + 4);
  }
}

/** `w` = snapshot: { Q, t } — Q es la foto de solo lectura del sistema (systems/pulso.js). */
export function drawPulso(w) {
  const Q = w.Q; if (!Q) return;
  const t = w.t;

  // VIÑETA: el tunel de vision del que esta concentrado. Ademas apaga los bordes para que la
  // secuencia y el buque sean lo unico que compite por la mirada.
  const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.32, W / 2, H / 2, H * 0.95);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.72)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

  // LA CABINA. Se reusa tal cual la del climax 2D (con su `yOff`, igual que el ARENA): es el mismo
  // avion y el mismo vidrio — no hay una cabina distinta por modo.
  momRender.drawCockpit({ mom: { t: run.t }, t, yOff: COCKPIT_Y });

  if (Q.fase === 'prueba') {
    // LA AUTOPISTA (regla 3): la secuencia ENTERA visible, el cursor avanzando sobre ella.
    const n = Q.bars.length;
    const cw = Math.min(150, (W - 60) / n);
    const x0 = W / 2 - (n - 1) * cw / 2;
    for (let i = 0; i < n; i++)
      drawCompas(x0 + i * cw, LANE_Y, Q.bars[i], i < Q.bi ? 0 : i === Q.bi ? 1 : 2, Q.ti, t);

    // EL MARGEN del compas: barra fina que se consume. No lleva numeros — es presion, no un dato.
    const b = Q.bars[Q.bi];
    if (b) {
      const fr = Math.max(0, 1 - Q.beatT / Q.beatMax);
      const bw = 120;
      px(W / 2 - bw / 2, LANE_Y + 18, bw, 2, '#22303a');
      px(W / 2 - bw / 2, LANE_Y + 18, bw * fr, 2, fr < 0.3 ? P.warn : P.accent);
    }
  } else if (Q.fase === 'exito') {
    ctx.textAlign = 'center';
    ctx.font = 'bold 14px monospace'; ctx.fillStyle = P.accent;
    ctx.fillText(T('pulso_ok'), W / 2, H / 2 - 18);
  } else {
    // FALLO: se dice QUE paso y que se vuelve — el fallo es drama, no una pantalla de derrota
    ctx.textAlign = 'center';
    ctx.font = 'bold 12px monospace'; ctx.fillStyle = P.warn;
    ctx.fillText(T(Q.motivo || 'pulso_pasaste'), W / 2, H / 2 - 18);
    if (Q.tries < 3 && Math.sin(t * 5) > -0.4) {
      ctx.font = '8px monospace'; ctx.fillStyle = P.ink;
      ctx.fillText(T('pulso_otra'), W / 2, H / 2 - 4);
    }
  }

  // INTENTOS: pips en la esquina — cuantas vueltas te quedan (plan §3: el fallo CUESTA)
  for (let i = 0; i < 3; i++)
    px(10 + i * 7, H - 12, 5, 5, i < 3 - Q.tries ? P.accent : '#2e3c45');
  ctx.textAlign = 'left';
  ctx.font = '6px monospace'; ctx.fillStyle = P.dim;
  ctx.fillText(T('pulso_pasadas'), 10, H - 15);
  ctx.textAlign = 'center';
}
