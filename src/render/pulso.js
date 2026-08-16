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
// La autopista de compases va EN EL CIELO, arriba del buque. Probado a media altura (74) se leia
// bien pero quedaba ESCRITA ENCIMA del blanco: la secuencia y el buque son las dos cosas que hay
// que mirar, y no pueden pelearse el mismo pixel. El cielo esta vacio y es lo que sobra.
const LANE_Y = 34;
// el buque arranca alrededor de y=56 en el mundo: todo lo de la prueba vive por encima de eso
const SKY_BOT = 60;

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

  // EL FLAK, CONGELADO. Cada fallo lo trae un grado mas cerca — y en tiempo casi detenido el
  // peligro no se mueve: se QUEDA ahi colgado. Estar quieto en el medio del fuego es la imagen del
  // modo. No mata (nada colisiona en la prueba): es la cuenta del fallo hecha visible.
  //
  // Va ANTES de la cabina a proposito: los estallidos estan AFUERA del vidrio, asi que el canopy
  // los tapa. Dibujados encima parecian mugre en la pantalla.
  if (Q.flak > 0) {
    for (let i = 0; i < Q.flak * 7; i++) {
      const a = i * 2.399;                                     // reparto sin azar: mismo cuadro siempre
      const r = 120 - Q.flak * 22 + (i % 3) * 11;
      const fx = W / 2 + Math.cos(a) * r * 1.6, fy = 54 + Math.sin(a) * r * 0.34;
      ctx.globalAlpha = 0.3 + (i % 3) * 0.08;
      px(fx - 4, fy - 3, 9, 7, '#4a4038');
      px(fx - 2, fy - 5, 5, 11, '#4a4038');
      px(fx - 1, fy - 1, 3, 3, '#c8a06a');
      ctx.globalAlpha = 1;
    }
  }

  // LA CABINA. Se reusa tal cual la del climax 2D (con su `yOff`, igual que el ARENA): es el mismo
  // avion y el mismo vidrio — no hay una cabina distinta por modo.
  momRender.drawCockpit({ mom: { t: run.t }, t, yOff: COCKPIT_Y });

  if (Q.fase === 'prueba' && Q.zi < 0) {
    // ELEGIR BLANCO (plan §3): las zonas del buque, cada una con SU secuencia. No hay cursor de
    // menu — elegir ES empezar a teclear, asi que las tres estan vivas a la vez y el primer toque
    // decide. La brava pide una secuencia mas larga y paga el doble.
    ctx.textAlign = 'left';
    ctx.font = '7px monospace'; ctx.fillStyle = P.dim;
    ctx.fillText(T('pulso_elegi'), 26, 12);
    for (let i = 0; i < Q.carriles.length; i++) {
      const c = Q.carriles[i], ly = 24 + i * 13;
      ctx.textAlign = 'left';
      ctx.font = 'bold 7px monospace'; ctx.fillStyle = P.ink;
      ctx.fillText(T(c.zona.str), 26, ly + 3);
      ctx.font = '6px monospace'; ctx.fillStyle = P.dim;
      ctx.fillText(c.zona.pts + '', 84, ly + 3);
      // la secuencia de la zona, sin cursor: todavia no se esta tecleando ninguna. La PRIMERA
      // tecla va en acento — es la que elige este carril, y es lo unico que hay que decidir.
      ctx.textAlign = 'center';
      let gx = 118, first = true;
      for (const b of c.bars) {
        for (const k of b.toks) {
          ctx.font = first ? 'bold 10px monospace' : '9px monospace';
          ctx.fillStyle = first ? P.accent : P.ink;
          ctx.fillText(TOK_GLIFO[k] || k, gx, ly + 3);
          gx += 12; first = false;
        }
        gx += 6;
      }
    }
    // el margen tambien corre mientras se elige: dudar cuesta
    const fr = Math.max(0, 1 - Q.beatT / Q.beatMax);
    px(26, SKY_BOT, 120, 2, '#22303a');
    px(26, SKY_BOT, 120 * fr, 2, fr < 0.3 ? P.warn : P.accent);
  } else if (Q.fase === 'prueba') {
    // LA AUTOPISTA (regla 3): la secuencia ENTERA visible, el cursor avanzando sobre ella.
    ctx.textAlign = 'left';
    ctx.font = '7px monospace'; ctx.fillStyle = P.dim;
    ctx.fillText(T(Q.carriles[Q.zi].zona.str), 26, 12);
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
      // pegada a la autopista y no al borde del cielo: con un solo carril hay lugar, y asi no se
      // le monta al nombre del buque
      px(W / 2 - bw / 2, LANE_Y + 14, bw, 2, '#22303a');
      px(W / 2 - bw / 2, LANE_Y + 14, bw * fr, 2, fr < 0.3 ? P.warn : P.accent);
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
  // EL PERDON de los primeros niveles: un punto que se gasta con el primer error. Se dibuja solo
  // cuando existe — que no aparezca es la señal de que ya no hay margen para la mano.
  for (let i = 0; i < Q.perdon; i++)
    px(W - 14 - i * 7, H - 12, 5, 5, i < Q.perdon - Q.errs ? P.foam : '#2e3c45');
  ctx.textAlign = 'center';
}
