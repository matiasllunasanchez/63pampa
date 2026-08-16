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
import { TOK_GLIFO, PULSO_CINE, PULSO_TEATRO } from '../data/pulso.js';
import { bargeGeom } from './world.js';
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

/** DONDE PEGO, en pantalla. Sale de la geometria que publico el que dibujo el buque
 *  (render/world.js) y no de una copia de la cuenta: si el buque escora o se hunde, el fuego
 *  escora y se hunde con el. Devuelve null si el buque no esta dibujado (no deberia pasar). */
function puntoImpacto(z) {
  const g = bargeGeom(); if (!g) return null;
  const x = g.bx + (g.len / 2) * (z.hitU || 0);
  const y = g.by + g.uh * (z.hitV || 0);
  // el punto viaja con la ESCORA: misma rotacion que aplico world.js, alrededor de la flotacion
  const c = Math.cos(g.tilt || 0), s = Math.sin(g.tilt || 0);
  const dx = x - g.bx, dy = y - g.waterY;
  return { x: g.bx + dx * c - dy * s, y: g.waterY + dx * s + dy * c, uh: g.uh, g };
}

/** Un estallido: nucleo claro, bola caliente y esquirlas. Crece y se apaga con `p` (0..1).
 *
 *  LA BOLA VA POR FILAS de ancho variable — un circulo DENTADO, como todo lo redondo del juego.
 *  El primer intento la dibujaba con dos rectangulos grandes y a esta escala (el buque crece 2.4×)
 *  se veia literalmente un cuadrado naranja tapando media pantalla. */
function estallido(x, y, r0, p) {
  const r = Math.max(2, r0 * (0.3 + p * 1.15));
  const a = Math.max(0, 1 - p);
  const rows = 9;
  for (let i = 0; i < rows; i++) {
    const f = (i / (rows - 1)) * 2 - 1;                       // -1..1 de arriba a abajo
    const w = Math.sqrt(Math.max(0, 1 - f * f)) * r;
    ctx.globalAlpha = a * (0.5 + 0.5 * (1 - Math.abs(f)));
    px(x - w, y + f * r * 0.85, w * 2, Math.max(1, r * 0.26), i % 2 ? '#e8842a' : '#c85a1e');
  }
  const cr = r * 0.42 * (1 - p * 0.5);                        // nucleo: lo ultimo en apagarse
  ctx.globalAlpha = a;
  px(x - cr, y - cr * 0.8, cr * 2, cr * 1.6, '#ffd479');
  if (p < 0.35) px(x - cr * 0.5, y - cr * 0.4, cr, cr * 0.8, '#fff6e0');
  ctx.globalAlpha = Math.max(0, 0.75 - p);
  for (let i = 0; i < 11; i++) {         // esquirlas: reparto fijo, sin azar (mismo cuadro siempre)
    const an = i * 2.399, d = r * (1.05 + (i % 3) * 0.45) * (0.4 + p);
    const s = Math.max(1, r * 0.09);
    px(x + Math.cos(an) * d, y + Math.sin(an) * d * 0.7, s, s, i % 2 ? '#ffd479' : '#c8a06a');
  }
  ctx.globalAlpha = 1;
}

/** LO QUE PASA AFUERA DEL VIDRIO durante el premio: la ristra, el estallido y el buque ardiendo.
 *  Se dibuja ANTES de la cabina — es mundo, y el canopy tiene que poder taparlo. */
function drawCineMundo(Q, c, t) {
  const z = Q.premio.zona;
  const im = puntoImpacto(z); if (!im) return;
  const uh = Math.max(2, im.uh);

  // ---- LA RISTRA (plan §3: el arma son las bombas, no un misil). Salen de abajo del cuadro —de
  // la panza del avion, que esta detras de la cabina— y se ALEJAN hacia el buque: encogen. Es el
  // unico tramo del modo en que el jugador no hace nada, y es a proposito: es el silencio.
  if (c.beat === 'suelta') {
    for (let i = 0; i < PULSO_CINE.BOMBAS; i++) {
      const p = Math.max(0, Math.min(1, (c.t / PULSO_CINE.SUELTA) * 1.35 - i * 0.11));
      if (p <= 0) continue;
      const x0 = W / 2 + (i - (PULSO_CINE.BOMBAS - 1) / 2) * 5;
      const bx2 = x0 + (im.x - x0) * p;
      // parabola: la bomba sube un pelo al salir y despues cae sobre el blanco
      const by2 = (H + 8) + (im.y - (H + 8)) * (p * p * 0.65 + p * 0.35);
      const s = Math.max(1, 4 * (1 - p * 0.8));
      px(bx2 - s / 2, by2 - s, s, s * 2, '#2b3238');
      px(bx2 - s / 2, by2 - s, s, Math.max(1, s * 0.4), '#5a656d');
    }
  }

  // ---- EL IMPACTO y lo que sigue: el fuego no se apaga cuando termina el compas del estallido,
  // se queda ardiendo toda la muerte.
  if (c.beat === 'impacto' || c.beat === 'muerte') {
    const pi = c.beat === 'impacto' ? c.t / PULSO_CINE.IMPACTO : 1;
    if (pi < 1) estallido(im.x, im.y, uh * 0.95 * z.blast * Q.clase.blast, pi);
    // FOGONAZO a pantalla completa en los primeros cuadros: la pantalla se lava, como en la
    // cabina de verdad. Dura poquisimo — es un golpe, no un fundido.
    if (c.beat === 'impacto' && c.t < 0.13) {
      ctx.globalAlpha = 0.75 * (1 - c.t / 0.13);
      ctx.fillStyle = '#fff6e0'; ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
    }
  }
  if (c.beat === 'muerte') {
    const humo = z.humo * Q.clase.humo;
    // EL SEGUNDO ESTALLIDO (solo el polvorin): mas grande que el primero y desde la flotacion
    if (c.sec) {
      const ps = Math.min(1, (c.t - z.sec) / 0.9);
      if (ps < 1) {
        // RECORTADO EN LA FLOTACION, igual que el casco: sin esto la bola se pintaba mar adentro
        // y a esta escala quedaba una plancha naranja abajo del agua.
        ctx.save();
        ctx.beginPath(); ctx.rect(0, 0, W, im.g.waterY + uh * 0.7); ctx.clip();
        estallido(im.x, im.g.waterY - uh * 0.5, uh * 1.55 * z.blast, ps);
        ctx.restore();
      }
    }
    // FUEGO: lengua que titila en el punto de impacto (y en la flotacion si volo la carga)
    const fw = uh * (0.7 + humo * 0.5);
    for (let i = 0; i < 7; i++) {
      const fl = Math.abs(Math.sin(t * (7 + i) + i * 1.7));
      ctx.globalAlpha = 0.5 + fl * 0.4;
      px(im.x - fw / 2 + (i / 7) * fw, im.y - uh * 0.8 * fl - 1,
        Math.max(1, fw / 6), Math.max(1, uh * (0.5 + fl * 0.9)), i % 2 ? '#e8842a' : '#ffd479');
    }
    ctx.globalAlpha = 1;
    // COLUMNA DE HUMO: sube y deriva. Es lo que se ve de un buque tocado a kilometros, y lo que
    // hace que la muerte del logistico (humo 1.7) no se confunda con la del radar (0.55).
    //
    // VA NEGRA Y OPACA. El primer intento fue gris al 34% y sobre el cielo encapotado del
    // Atlantico no se veia NADA: el humo de un buque ardiendo es lo mas oscuro del cuadro, no una
    // veladura. La transparencia se guarda para la punta de la columna, que es donde se deshace.
    const n = Math.round(11 * humo);
    for (let i = 0; i < n; i++) {
      const f = i / Math.max(1, n - 1);
      const sube = Math.min(1, c.t * (0.9 + humo * 0.5)) * f;
      const sw = uh * (0.8 + f * 3.2) * humo;
      ctx.globalAlpha = 0.92 - f * 0.62;
      px(im.x - sw / 2 + Math.sin(t * 0.7 + i * 1.3) * uh * 1.1 + sube * uh * 3.4,
        im.y - sube * uh * 13 - uh, sw, Math.max(2, sw * 0.85), i % 3 ? '#171b1f' : '#2b3238');
    }
    ctx.globalAlpha = 1;
  }
}

/** El PREMIO escrito: que se le pego, como se muere, y lo que se cobra. Va sobre la cabina — es
 *  recuento, no mundo. Cada cosa tiene SU renglon fijo: probado con popups, los tres textos caian
 *  en la misma `y` y se leian encimados. */
function drawCinePremio(Q, c) {
  const pr = Q.premio;
  ctx.textAlign = 'center';
  // LA ZONA que se eligio, desde el estallido: es la respuesta a la unica decision del modo
  if (c.beat === 'impacto' || c.beat === 'muerte') {
    ctx.globalAlpha = Math.min(1, (c.beat === 'impacto' ? c.t : 1) / 0.2);
    ctx.font = 'bold 9px monospace'; ctx.fillStyle = P.warn;
    ctx.fillText(T(pr.zona.str), W / 2, 11);
  }
  if (c.beat !== 'muerte') { ctx.globalAlpha = 1; return; }
  // LA LINEA DE LA CLASE: lo unico de la cinematica que el jugador va a recordar textualmente
  ctx.globalAlpha = Math.min(1, c.t / 0.5);
  ctx.font = '8px monospace'; ctx.fillStyle = P.foam;
  ctx.fillText(T(Q.clase.str), W / 2, 22);

  const ap = Math.min(1, Math.max(0, c.t - 0.5) / 0.4);
  ctx.globalAlpha = ap;
  ctx.textAlign = 'left';
  const sellos = [
    [pr.sellos.limpio, 'pulso_s_limpio'],
    [pr.sellos.rapido, 'pulso_s_rapido'],
    [pr.sellos.bravo, 'pulso_s_bravo'],
  ];
  let y = 38;   // debajo de los dos renglones de arriba: la cuenta se lee al final, no compite
  for (const [on, k] of sellos) {
    if (!on) continue;                       // los que no se ganaron no se nombran: no es un checklist
    px(20, y - 5, 4, 4, P.foam);
    ctx.font = '7px monospace'; ctx.fillStyle = P.ink;
    ctx.fillText(T(k), 28, y);
    y += 10;
  }
  ctx.font = 'bold 12px monospace'; ctx.fillStyle = P.accent;
  ctx.fillText('+' + pr.pts, 20, y + 6);
  ctx.globalAlpha = 1;
  ctx.textAlign = 'center';
}

/** SAL SECA EN EL VIDRIO (Q5). Volaste dos mil metros a ras del Atlantico: el canopy tiene el mar
 *  encima. Va DESPUES de la cabina —esta del lado de adentro del vidrio, entre el ojo y el mundo—
 *  y con posiciones FIJAS: si titilara seria nieve, y la sal esta seca y quieta.
 *
 *  Es teatro puro: no informa nada. Justamente por eso es de Q5 (§5: «tension sin leer nada»). */
function drawSal(cy) {
  for (let i = 0; i < PULSO_TEATRO.SAL; i++) {
    // reparto determinista (dos primos y el modulo): la misma sal toda la prueba, y la misma en
    // cada partida — es una marca del avion, no un efecto que se re-sortea
    const fx = ((i * 97) % 101) / 101, fy = ((i * 37) % 53) / 53;
    const y = 6 + Math.pow(fy, 1.6) * Math.max(0, cy - 14);   // se acumula ARRIBA, donde seca el viento
    const x = 14 + fx * (W - 28);
    ctx.globalAlpha = 0.09 + (i % 3) * 0.045;
    px(x, y, 1 + (i % 2), 1, '#dfe8ee');
  }
  ctx.globalAlpha = 1;
}

/** `w` = snapshot: { Q, t } — Q es la foto de solo lectura del sistema (systems/pulso.js). */
export function drawPulso(w) {
  const Q = w.Q; if (!Q) return;
  const t = w.t;
  const cine = Q.fase === 'cine' ? Q.cine : null;

  // VIÑETA: el tunel de vision del que esta concentrado. Ademas apaga los bordes para que la
  // secuencia y el buque sean lo unico que compite por la mirada.
  // EN EL PREMIO SE ABRE: la concentracion se suelta junto con el tiempo (ver timeScale) — el
  // tunel era el esfuerzo, y el esfuerzo ya paso.
  const vg = 0.72 * (cine ? Math.max(0.25, 1 - cine.tot / 1.1) : 1);
  const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.32, W / 2, H / 2, H * 0.95);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${vg.toFixed(3)})`);
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

  // EL PREMIO, lo que pasa AFUERA: la ristra, el estallido, el buque ardiendo. Antes de la cabina
  // por la misma razon que el flak — el canopy tiene que poder taparlo.
  if (cine) drawCineMundo(Q, cine, t);

  // LA CABINA. Se reusa tal cual la del climax 2D (con su `yOff`, igual que el ARENA): es el mismo
  // avion y el mismo vidrio — no hay una cabina distinta por modo.
  // …y en el premio BAJA: se abre cielo para el buque justo cuando la autopista ya no esta y no
  // hay nada mas que leer. Es la misma cabina corrida, no otra cabina.
  const cy = COCKPIT_Y + (cine ? PULSO_CINE.CABINA * Math.min(1, cine.tot / 1.2) : 0);
  momRender.drawCockpit({ mom: { t: run.t }, t, yOff: cy });
  drawSal(cy);

  // EL LATIDO, VISTO. El mismo golpe que se escucha oscurece los bordes un instante: es lo que
  // hace que la viñeta deje de ser un filtro y pase a ser el tunel de vision de alguien que tiene
  // el corazon en la garganta. Solo aparece cuando el corazon ya esta acelerado — si latiera
  // siempre igual, no diria nada.
  if (!cine && Q.hbT > 0.25) {
    const golpe = Math.max(0, 1 - Q.hb / 0.2);
    if (golpe > 0) {
      const hg = ctx.createRadialGradient(W / 2, H / 2, H * 0.28, W / 2, H / 2, H * 0.8);
      hg.addColorStop(0, 'rgba(0,0,0,0)');
      hg.addColorStop(1, `rgba(12,4,4,${(golpe * 0.22 * Q.hbT).toFixed(3)})`);
      ctx.fillStyle = hg; ctx.fillRect(0, 0, W, H);
    }
  }

  if (cine) {
    drawCinePremio(Q, cine);
    return;   // en el premio no hay autopista ni intentos que mostrar: no queda nada que decidir
  }

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
