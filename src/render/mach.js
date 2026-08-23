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
import { conoAmt, vaporAmt } from '../core/mach.js';
import { CONO_HZ } from '../data/tuning.js';

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
  // el radio crece con el regimen Y respira. Arranca apenas mas ancho que el ala para que se lea
  // "envuelve al avion" y no "hay una burbuja al lado"
  // MAS CHICO Y MAS CHATO que el primer intento (0.52+0.30 / 0.34+0.22): asi salia una burbuja
  // gris del ancho de media pantalla, que se leia como un halo y no como aire condensado pegado al
  // avion. La nube de verdad abraza el fuselaje.
  const rx = spW * (0.34 + k * 0.18) * r;
  const ry = rx * 0.52;
  ctx.save();
  // LA CASCARA: gradiente radial con el centro VACIO. El 0.62 es donde empieza la pared — mas
  // adentro y la nube tapa el fuselaje, mas afuera y se despega en un aro suelto.
  // LA PARED ES FINA. La primera version repartia la densidad entre el 62% y el 100% del radio y
  // el resultado era niebla: mucha superficie con poco brillo. Concentrada entre el 72% y el 96%
  // se lee como una CASCARA — que es lo que es.
  const g = ctx.createRadialGradient(0, 0, Math.max(1, rx * 0.62), 0, 0, rx);
  g.addColorStop(0, 'rgba(207,227,223,0)');
  g.addColorStop(0.72, `rgba(207,227,223,${0.10 * k})`);
  g.addColorStop(0.88, `rgba(240,250,248,${0.72 * k * r})`);
  g.addColorStop(0.96, `rgba(233,244,241,${0.34 * k})`);
  g.addColorStop(1, 'rgba(207,227,223,0)');
  ctx.fillStyle = g;
  ctx.save();
  ctx.scale(1, ry / rx);                      // elipse: el cono es mas ancho que alto visto de atras
  ctx.beginPath(); ctx.arc(0, 0, rx, 0, 6.2832); ctx.fill();
  ctx.restore();
  // EL LABIO: el borde neto de la campana, que es lo que la hace leer como una superficie y no como
  // una mancha. Se apaga cuando la respiracion la afloja — la nube "revienta" y vuelve.
  const labio = Math.max(0, r - 0.82) * 5;
  if (labio > 0.02) {
    ctx.globalAlpha = Math.min(0.75, labio * k * 0.8);
    ctx.strokeStyle = '#f4fbf9';
    ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.ellipse(0, 0, rx * 0.97, ry * 0.97, 0, 0, 6.2832); ctx.stroke();
  }
  ctx.restore();
  ctx.globalAlpha = 1; ctx.lineWidth = 1;
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
const CRUCE_T = 0.5;

/** Las LINEAS DE VELOCIDAD del cruce, en coordenadas de MUNDO (480x270) y centradas en el avion.
 *  Se dibujan sin la rotacion del alabeo: rayan la pantalla, no el avion.
 *  @param dt segundos reales del cuadro (el reloj es propio, no el del mundo dilatado) */
export function drawCruce(cx, cy, dt) {
  if (cruceT < 0) return;
  cruceT += dt;
  if (cruceT > CRUCE_T) { cruceT = -1; return; }
  const f = cruceT / CRUCE_T;
  const fade = (1 - f) * (1 - f);
  ctx.save();
  // EL ANILLO que sale disparado hacia atras — el frente de presion pasandote
  ctx.globalAlpha = fade * 0.8;
  ctx.strokeStyle = '#f4fbf9';
  ctx.lineWidth = Math.max(1, (1 - f) * 3);
  ctx.beginPath(); ctx.ellipse(cx, cy, 22 + f * 150, (22 + f * 150) * 0.5, 0, 0, 6.2832); ctx.stroke();
  // LAS RAYAS: nacen fuera del avion y se estiran hacia el borde. Los angulos son fijos (reparto
  // por primos) — sorteados por cuadro serian ruido blanco, la trampa §1.3 del repo.
  const N = 16;
  for (let i = 0; i < N; i++) {
    const a = i * 2.399;
    const r0 = 26 + f * 120, r1 = r0 + 16 + f * 46;
    const ca = Math.cos(a), sa = Math.sin(a) * 0.55;   // achatadas: el mundo es ancho
    ctx.globalAlpha = fade * (0.35 + (i % 3) * 0.12);
    ctx.strokeStyle = i % 4 ? '#eaf6f3' : P.crest;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx + ca * r0, cy + sa * r0);
    ctx.lineTo(cx + ca * r1, cy + sa * r1);
    ctx.stroke();
  }
  ctx.restore();
  ctx.globalAlpha = 1; ctx.lineWidth = 1;
}
