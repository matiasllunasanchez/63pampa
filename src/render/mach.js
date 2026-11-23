// LO TRANSONICO — el vapor de ala y el cono (docs/sistemas/PLAN_TRANSONICO.md).
//
// Se dibuja DENTRO del contexto del avion (ya trasladado al centro, rotado por el alabeo y escalado
// a unidades de diseño por el ctx.scale(U,U) de drawPlane), asi que todo lo de aca es relativo al
// origen y en las mismas unidades que `spW`/`spH`. Por eso el vapor acompaña solo el bob, la
// vibracion del roce y el alabeo: no hay que recalcular nada, ya viene en la matriz.
//
// EL ORDEN DE CAPAS ES LA REGLA 4 DEL PLAN: el cono va DETRAS del sprite y el vapor delante pero
// translucido. Si hay que elegir entre el efecto y ver el avion, gana el avion.
//
// NADA DE Math.random() POR CUADRO (trampa §1.3 del repo): el vapor parpadearia como nieve. Los
// patrones salen de senos con fase fija por indice — deterministas, como drawSeaDots.
import { ctx, px } from './ctx.js';
import { P } from '../data/palette.js';
import { cfg } from '../core/state.js';
import { conoAmt, vaporAmt, parpadeoAmt } from '../core/mach.js';
import { CONO_HZ, PARPADEO_HZ, PARPADEO_APAGA } from '../data/tuning.js';

/** LA RESPIRACION del cono. El regimen transonico es INESTABLE: la nube se forma, se aprieta,
 *  revienta y se rehace. Sin esto el cono es una calcomania pegada al avion — que es exactamente
 *  lo que el plan §5.3 prohibe.
 *
 *  Dos senos desfasados y no uno: con uno solo el latido es un metronomo, y se nota. */
const respira = t => 0.78 + 0.16 * Math.sin(t * CONO_HZ * 6.283) + 0.06 * Math.sin(t * CONO_HZ * 2.7);

/** EL CONO (V2): la nube de Prandtl-Glauert envolviendo el fuselaje.
 *
 *  No es un cono en perspectiva sino una CAMPANA vista de atras — que es lo que se ve desde donde
 *  esta la camara de este juego. Se pinta como una cascara: transparente en el centro (ahi esta el
 *  avion) y densa en el borde, que es como se ve de verdad la condensacion.
 *
 *  @param spW,spH  medidas del sprite en unidades de diseño (de drawPlane)
 *  @param spd      run.spd — de aca sale el regimen
 *  @param t        run.t
 */
export function drawCono(spW, spH, spd, t) {
  if (cfg.mach !== 'todo') return;   // 'vapor' deja solo lo veridico; 'off' apaga todo
  const k = conoAmt(spd);
  if (k <= 0.01) return;
  const r = respira(t);
  // (23/11, el autor: "parece brillo de mala calidad"): era un degradé radial liso — un resplandor. Ahora es VAPOR: una
  // cascara de pixeles que hierve, densa en la pared de la campana y abierta en el centro (ahi esta el avion)
  const rx = spW * (0.34 + k * 0.18) * r;
  nube(rx, rx * 0.52, 0.9, 0.07, 0.32 * k * r, t, 6, 0.5);
}

/** VAPOR EN PIXELES: una cascara eliptica de radios (rx, ry) hecha de puntitos. `pared` (0..1 del radio) es donde la
 *  condensacion es mas densa y `ancho` cuanto se reparte; `a` la opacidad tope; hierve a `hz` cuadros por segundo con
 *  un hash determinista por celda (nada de Math.random por cuadro: seria nieve). */
function nube(rx, ry, pared, ancho, a, t, hz, paso = 0.75) {
  if (a <= 0.01 || rx < 1) return;
  const fr = Math.floor(t * hz);
  ctx.save();
  for (let y = -ry * 1.1; y <= ry * 1.1; y += paso) {
    for (let x = -rx * 1.1; x <= rx * 1.1; x += paso) {
      const d = Math.hypot(x / rx, y / ry);
      const den = Math.exp(-((d - pared) * (d - pared)) / (2 * ancho * ancho));
      if (den < 0.08) continue;
      const i = Math.round(x / paso), j = Math.round(y / paso);
      const h = hashP(i * 31.7 + j * 57.3 + fr * 0.913);
      if (h > den) continue;
      ctx.globalAlpha = a * (0.45 + 0.55 * den) * (0.6 + 0.4 * hashP(i * 3.1 + j * 7.7));
      ctx.fillStyle = h < den * 0.35 ? '#ffffff' : '#dcebe8';
      ctx.fillRect(x, y, paso, paso);
    }
  }
  ctx.restore();
}

/** EL PARPADEO DE MACH 1 (autor, 5/10 — el video del F-14 cruzando la barrera). Pasando Mach 0,98 el
 *  avion queda envuelto en un HALO de vapor que se arma y se desarma a saltos: no respira como el
 *  cono, TITILA. Va detras del sprite (regla 4 del plan: gana el avion) y en la misma matriz que el
 *  cono, asi que sigue el alabeo y el bob.
 *
 *  Los saltos salen de un hash del reloj partido en PARPADEO_HZ — NADA de Math.random() por cuadro
 *  (trampa §1.3): asi cada salto dura lo mismo y el patron no hierve. En PARPADEO_APAGA de los saltos
 *  el halo se corta del todo; en los demas prende con fuerza distinta. Los JIRONES sueltos alrededor
 *  de las alas tienen su propio salto, desfasado, para que no prenda todo junto como una lampara. */
const hashP = n => { const h = Math.sin(n * 12.9898 + 4.1) * 43758.5453; return h - Math.floor(h); };
export function drawParpadeo(spW, spH, spd, t) {
  if (cfg.mach !== 'todo') return;
  const k = parpadeoAmt(spd);
  if (k <= 0.01) return;
  const salto = Math.floor(t * PARPADEO_HZ);
  const h = hashP(salto);
  ctx.save();
  if (h >= PARPADEO_APAGA) {
    const fuerza = k * (0.45 + 0.75 * (h - PARPADEO_APAGA) / (1 - PARPADEO_APAGA));
    const rx = spW * (0.62 + 0.14 * hashP(salto + 101));
    nube(rx, rx * 0.6, 0.86, 0.1, 0.3 * fuerza, t, PARPADEO_HZ, 0.5);   // (23/11: vapor en pixeles, no un resplandor)
  }
  // LOS JIRONES: vapor suelto sobre las alas y detras de la cabina, cada uno con su salto propio
  const N = 7;
  for (let i = 0; i < N; i++) {
    const s2 = Math.floor(t * PARPADEO_HZ * 0.8 + i * 0.37);
    const q = hashP(s2 * 7 + i * 13);
    if (q < 0.45) continue;
    const lado = i % 2 ? 1 : -1, f = (i + 1) / N;
    const x = lado * spW * (0.08 + f * 0.36), y = spH * (0.02 - 0.06 * hashP(i + 3));
    const w = spW * (0.12 + 0.1 * q), hh = Math.max(1, spH * (0.03 + 0.03 * q));
    // en PIXELES, como el vapor de ala: una lente de tres filas (la del medio mas ancha), no un ovalo liso
    ctx.globalAlpha = k * (q - 0.45) * 1.3;
    px(x - w / 2, y - hh / 2, w, hh, '#eef8f6');
    ctx.globalAlpha *= 0.6;
    px(x - w * 0.32, y - hh * 1.5, w * 0.64, hh, P.foam);
    px(x - w * 0.32, y + hh / 2, w * 0.64, hh, P.foam);
  }
  ctx.restore();
  ctx.globalAlpha = 1;
}

/** EL VAPOR DE ALA (V1): las mechas que se levantan del extrados al cargar G.
 *
 *  Este es el efecto VERIDICO — un A-4 virando fuerte en aire humedo del Atlantico lo hacia. Nace
 *  y muere con el viraje: en vuelo recto no hay nada por rapido que vayas.
 *
 *  Las mechas nacen en la RAIZ del ala y crecen hacia la punta, que es el orden en que se forma:
 *  la carga es mayor donde el ala se junta con el fuselaje.
 */
export function drawVaporAla(spW, spH, spd, g, t) {
  if (cfg.mach === 'off') return;
  const k = vaporAmt(spd, g);
  if (k <= 0.02) return;
  const N = 5;
  const y0 = spH * 0.02;                       // la linea del ala, apenas arriba del centro del frame
  ctx.save();
  for (let s = -1; s <= 1; s += 2) {           // las dos alas
    for (let i = 0; i < N; i++) {
      const f = (i + 1) / N;                   // 0..1 de la raiz hacia la punta
      // cada mecha tiene su propia fase: ondulan sueltas, no como un peine
      const ph = i * 1.7 + (s > 0 ? 0.9 : 0);
      const on = 0.55 + 0.45 * Math.sin(t * 9 + ph);
      // las de la punta necesitan MAS carga para aparecer: el vapor se corre hacia afuera cuando
      // apretas mas, y eso hace que el efecto crezca con la G en vez de prenderse entero de golpe
      const need = 0.25 + f * 0.6;
      if (k < need) continue;
      const x = s * spW * (0.11 + f * 0.23);
      // ESTIRADAS Y MAS ANCHAS que el primer intento (0.05 / 0.020): a ese tamaño eran motas y a
      // 480x270 no se leian. El vapor del extrados es una MECHA que corre con el flujo.
      const w = spW * 0.11 * (1 - f * 0.35) * on;
      const h = Math.max(0.7, spH * 0.032 * on);
      ctx.globalAlpha = Math.min(0.85, (k - need) * 2.6) * on;
      px(x - w / 2, y0 - h / 2, w, h, i < 2 ? P.foam : P.crest);
    }
  }
  ctx.restore();
  ctx.globalAlpha = 1;
}

// ---------------- EL CRUCE (V3) ----------------
// El instante en que la nube se forma. Es un EVENTO y no un nivel: `conoAmt` dice cuanto cono hay,
// pero "acabas de entrar en regimen" no se puede leer de un numero que ya esta alto — por eso lo
// dispara `cruzo()` desde game.js y aca solo vive el reloj.
//
// Es el pago de la etapa: lo que convierte "hay una nube" en "PASO algo".
let cruceT = -1;
export function cruce() { cruceT = 0; }
export function resetCruce() { cruceT = -1; }
const CRUCE_T = 1.1;

/** EL CRUCE DE LA BARRERA (23/11, el autor: "no se entiende, parece brillo de mala calidad; que realmente parezca que
 *  rompe la barrera del sonido"). Tres cosas, en coordenadas de MUNDO y sin el alabeo:
 *   · LA ONDA DE CHOQUE: un anillo que sale disparado y DEFORMA lo que hay detras — la imagen ya dibujada se copia
 *     ampliada adentro de una banda eliptica, como el aire comprimido que dobla la luz —, con el frente claro y la
 *     sombra atras. Un segundo anillo pegado (el doble estampido de la onda N).
 *   · EL ESTALLIDO DE VAPOR: la campana de condensacion aparece de golpe, densa, y se abre y se deshace en jirones.
 *   · LAS RAYAS, cortas y pocas: la velocidad, no fuegos artificiales.
 *  @param dt segundos reales del cuadro (el reloj es propio, no el del mundo dilatado) */
export function drawCruce(cx, cy, dt) {
  if (cruceT < 0) return;
  cruceT += dt;
  if (cruceT > CRUCE_T) { cruceT = -1; return; }
  onda(cx, cy, cruceT, 1);
  if (cruceT > 0.09) onda(cx, cy, cruceT - 0.09, 0.55);
  // EL ESTALLIDO: la campana revienta en los primeros 0,45 s — se abre, se afina y se va
  const v = cruceT / 0.45;
  if (v < 1) {
    ctx.save(); ctx.translate(cx, cy);
    const rx = 16 + v * 34;
    nube(rx, rx * 0.55, 0.82 + v * 0.1, 0.16 - v * 0.08, (1 - v) * (1 - v) * 0.95, cruceT, 18, 1);
    ctx.restore();
  }
  // LAS RAYAS
  const f = cruceT / CRUCE_T, fade = (1 - f) * (1 - f);
  ctx.save();
  for (let i = 0; i < 10; i++) {
    const a = i * 2.399, r0 = 30 + f * 150, r1 = r0 + 10 + f * 30;
    const ca = Math.cos(a), sa = Math.sin(a) * 0.55;
    ctx.globalAlpha = fade * (i % 3 ? 0.18 : 0.32); ctx.strokeStyle = '#eaf6f3'; ctx.lineWidth = 0.75;
    ctx.beginPath(); ctx.moveTo(cx + ca * r0, cy + sa * r0); ctx.lineTo(cx + ca * r1, cy + sa * r1); ctx.stroke();
  }
  ctx.restore();
  ctx.globalAlpha = 1; ctx.lineWidth = 1;
}

/** UNA ONDA DE CHOQUE a `tt` segundos de nacer, con fuerza `k`: la banda que refracta y sus dos filos. */
function onda(cx, cy, tt, k) {
  const u = Math.min(1, tt / 0.85);
  if (u >= 1) return;
  const R = 18 + 260 * (1 - (1 - u) * (1 - u));          // sale rapido y frena
  const banda = 5 + 7 * (1 - u), fuerza = (1 - u) * k;   // (lineal: que se vea toda la carrera, no solo el arranque)
  const ry = 0.5;
  ctx.save();
  // LA REFRACCION: lo de adentro de la banda, copiado del lienzo y ampliado desde el centro
  const cv = ctx.canvas, m = ctx.getTransform();
  ctx.beginPath();
  ctx.ellipse(cx, cy, R + banda, (R + banda) * ry, 0, 0, 6.2832);
  ctx.ellipse(cx, cy, Math.max(1, R - banda), Math.max(1, R - banda) * ry, 0, 0, 6.2832);
  ctx.clip('evenodd');
  const zoom = 1 + 0.16 * fuerza;
  const x0 = cx - (R + banda), y0 = cy - (R + banda) * ry, w = 2 * (R + banda), h = 2 * (R + banda) * ry;
  const sx = m.a * x0 + m.e, sy = m.d * y0 + m.f, sw = m.a * w, sh = m.d * h;
  if (sw > 2 && sh > 2) {
    ctx.globalAlpha = Math.min(1, 0.4 + fuerza);
    ctx.drawImage(cv, sx, sy, sw, sh, cx - (cx - x0) * zoom, cy - (cy - y0) * zoom, w * zoom, h * zoom);
  }
  ctx.restore();
  // LOS FILOS: el frente comprimido (claro, fino) y la rarefaccion de atras (oscura)
  ctx.save();
  ctx.lineWidth = 1.6; ctx.globalAlpha = Math.min(0.9, 0.95 * fuerza + 0.1); ctx.strokeStyle = '#f6fcfb';
  ctx.beginPath(); ctx.ellipse(cx, cy, R + banda * 0.6, (R + banda * 0.6) * ry, 0, 0, 6.2832); ctx.stroke();
  ctx.lineWidth = 2.2; ctx.globalAlpha = 0.35 * fuerza; ctx.strokeStyle = '#0d1a1f';
  ctx.beginPath(); ctx.ellipse(cx, cy, Math.max(1, R - banda * 0.7), Math.max(1, R - banda * 0.7) * ry, 0, 0, 6.2832); ctx.stroke();
  ctx.restore();
}
