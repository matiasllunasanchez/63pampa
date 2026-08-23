// EL DIBUJO DE LA COLA: los Harriers del duelo, sus trazadoras, su humo y su estela. Las
// trazadoras ERRAN siempre y no tienen codigo de impacto — el porque, y por que se dibujan frias,
// esta en el encabezado de systems/caza.js.
//
// Plan: docs/sistemas/PLAN_HARRIERS_PERSECUCION.md, PLAN A. La logica vive en systems/caza.js;
// aca solo se LEE su snapshot y se pinta (convencion 4 de ARQUITECTURA).
//
// MULTIPLES HARRIERS: snapshot() devuelve un ARRAY de Harriers. Cada uno trae `deFrente` ya
// resuelto por el sistema: false => `harrier_rear` (le ves la cola), true => `harrier` (te
// encara). Y trae `enCola`, que dice que esta detras tuyo y NO hay que dibujarlo — escondido entre
// amague y amague, o ya pasado de largo en la entrada.
//
// EL AVION ES SUYO DESDE PLAN_HORNEADO B3. Hasta entonces el perseguidor se dibujaba con `jet` y
// `jet_rear` — el mismo caza generico del pasillo, con dos poses mas. Ahora hay un Sea Harrier
// FRS.1 modelado aparte (tools/models/harrier.js) y el caza del pasillo volvio a ser un caza de
// linea: los dos pueden aparecer en el mismo cuadro y se distinguen sin leyenda.

import { ctx, px, PZ } from './ctx.js';
import { proj } from '../core/fx.js';
import { P } from '../data/palette.js';
import * as enemyArt from './enemies.js';
import { snapshot } from '../systems/caza.js';

const PH_DARK = 0.5, PH_SQUASH = 0.74;

// LAS TRAZADORAS QUE ERRAN. Vuelven a existir, y se dibujan FRIAS a proposito: blanco azulado,
// nada de naranja. El naranja es el color de lo que te va a lastimar en este juego (la llama, las
// explosiones, el fuego letal que el Harrier ya no tiene), y estas balas no pueden tocarte. Que se
// lean distinto no es decoracion — es la diferencia entre un aviso y una amenaza.
const HOT = ['#fdfefe', '#d8ecff', '#9ec8f0', '#5f8fc0'];
const TRAC_N = 7, TRAC_Z = 5.5;

function drawTrac(f) {
  // la COLA de la trazadora: siete muestras hacia atras de su propio recorrido, cada una mas
  // tenue. Es lo que hace que se lea como algo que CRUZA y no como un punto que aparece.
  for (let i = TRAC_N; i >= 1; i--) {
    const z = f.z - i * TRAC_Z;
    if (z <= 1.5) continue;
    const p = proj(f.x, f.y, z);
    const w = Math.max(1, Math.round(p.k * 0.1));
    ctx.globalAlpha = 0.75 * (1 - i / (TRAC_N + 2));
    px(p.x - w / 2, p.y - w / 2, w, w, HOT[Math.min(HOT.length - 1, i >> 1)]);
  }
  ctx.globalAlpha = 1;
  const s = proj(f.x, f.y, f.z);
  const w = Math.max(2, Math.round(s.k * 0.17));
  ctx.globalAlpha = 0.5;
  px(s.x - w / 2 - 1, s.y - w / 2 - 1, w + 2, w + 2, HOT[2]);
  ctx.globalAlpha = 1;
  px(s.x - w / 2, s.y - w / 2, w, w, HOT[0]);
}

function drawHumo(f) {
  const s = proj(f.x, f.y, f.z);
  const edad = 1 - Math.min(1, f.life / 2.2);
  const w = Math.max(1, s.k * f.r * (0.5 + edad * 1.6));
  ctx.globalAlpha = Math.min(0.55, f.life * 0.4);
  px(s.x - w / 2, s.y - w / 2, w, w, edad < 0.4 ? '#20262a' : P.dim);
  ctx.globalAlpha = 1;
}

// LA ESTELA DE PUNTA DE ALA. No es humo de motor: es vapor, asi que nace BLANCO y cerrado y se
// abre y se apaga hacia el gris del aire. El gradiente va por EDAD y no por distancia — asi el
// hilo se lee igual pegado a la cola que a 300 m, que es donde el Harrier necesitaba dejar de
// parecer una figurita.
const EST = [P.foam, P.crest, '#8d8f92'];

function drawEstela(f) {
  const s = proj(f.x, f.y, f.z);
  const edad = 1 - Math.min(1, f.life / (f.vida0 || 1.3));
  const w = Math.max(1, s.k * f.r * (0.5 + edad * 1.7));
  ctx.globalAlpha = Math.min(0.5, f.life * 0.6) * (1 - edad * 0.6);
  px(s.x - w / 2, s.y - w / 2, w, w, edad < 0.25 ? EST[0] : edad < 0.55 ? EST[1] : EST[2]);
  ctx.globalAlpha = 1;
}

/** LA TOBERA ENCENDIDA. Es la misma llama que el turbo tuyo (render/plane.js) pero vista DE PUNTA:
 *  un cono que te apunta no se alarga, late — asi que en vez de filas que se afinan hacia la punta
 *  son anillos que se afinan hacia el centro, del rojo apagado de afuera al blanco del nucleo. */
const FL = ['#cf4d16', '#f07c22', '#ffb43c', '#ffe08a', '#fff6d8'];

function drawTobera(sx, sy, k, t) {
  const fl = 0.74 + Math.sin(t * 31) * 0.16 + Math.random() * 0.1;   // late cuadro a cuadro
  const w = Math.max(1, 1.05 * k * fl);
  ctx.globalAlpha = 0.26;                                            // resplandor sobre el fuselaje
  px(sx - w, sy - w * 0.5, w * 2, Math.max(1, w), FL[2]);
  ctx.globalAlpha = 1;
  for (let i = 0; i < FL.length; i++) {
    const ww = Math.max(1, w * (1 - i * 0.18));
    px(sx - ww / 2, sy - ww * 0.28, ww, Math.max(1, ww * 0.56), FL[i]);
  }
}

function drawCazaSprite(H) {
  const s = proj(H.x, H.y, H.z);
  const k = s.k;
  // QUIEN DECIDE ESTO ES EL SISTEMA (convencion 4): `deFrente` sale del snapshot. Aca no se
  // adivina por fase ni por z — asi no vuelve a darse vuelta el sprite justo antes del horizonte.
  const trasero = !H.deFrente;
  // LA POSE DE ALABEO sale del BANDEO, no del lado sorteado. `lado` es fijo por pasada: con el
  // avion volaba de costado el ciclo entero, siempre en el mismo frame extremo de la hoja. `bank`
  // lo calcula el sistema mirando para donde se esta yendo de verdad, asi que el dibujo ahora
  // acompaña al movimiento — que es la mitad de por que parecia estatico.
  const pose = cols => Math.max(0, Math.min(cols - 1, Math.round((H.bank * 0.5 + 0.5) * (cols - 1))));

  // LA RECOLA SE DIBUJA GIRANDO (PLAN_HORNEADO B3). La hoja `harrier_turn` —cinco yaws de cola
  // (0°) a frente (180°), con el alabeo de la virada— existia horneada desde antes y NINGUN
  // archivo del juego la nombraba: se horneaba en cada pasada y no se dibujaba nunca. La recola es
  // literalmente la vuelta en U —el Harrier deja de irse y vuelve a encararte— y hasta B3 eso era
  // un CAMBIO DE SPRITE de un cuadro al otro: se iba de cola y de golpe venia de frente.
  //
  // La columna sale del avance de la fase, no del reloj: la ultima (180° = de frente) es la misma
  // pose con la que arranca `presion`, asi que el pase al sprite de frente no tiene salto.
  if (H.fase === 'recola' && H.dur > 0 && enemyArt.ready('harrier_turn')) {
    const sh = enemyArt.SHEETS.harrier_turn;
    const g = Math.max(0, Math.min(1, H.t / H.dur));
    enemyArt.drawFrame(ctx, 'harrier_turn', Math.min(sh.cols - 1, Math.round(g * (sh.cols - 1))), 0,
      s.x, { centerY: s.y }, k, false, false, 0);
  } else if (trasero && enemyArt.ready('harrier_rear')) {
    enemyArt.drawFrame(ctx, 'harrier_rear', pose(enemyArt.SHEETS.harrier_rear.cols), 0, s.x,
      { centerY: s.y }, k, false, false, 0);
  } else if (enemyArt.ready('harrier')) {
    const col = pose(enemyArt.SHEETS.harrier.cols);
    if (trasero) {
      ctx.save();
      ctx.translate(s.x, 0);
      ctx.scale(PH_SQUASH, 1);
      enemyArt.drawFrame(ctx, 'harrier', col, 0, 0, { centerY: s.y }, k, false, false, PH_DARK);
      ctx.restore();
    } else enemyArt.drawFrame(ctx, 'harrier', col, 0, s.x, { centerY: s.y }, k, false, false, 0);
  } else {
    const c = trasero ? '#1b2228' : P.bodyDark;
    px(s.x - 4.2 * k, s.y - 0.4 * k, 8.4 * k, 0.8 * k, c);
    px(s.x - 1 * k, s.y - 1.4 * k, 2 * k, 2.8 * k, c);
    px(s.x - 0.35 * k, s.y - 2.8 * k, 0.7 * k, 1.5 * k, c);
    if (!trasero) px(s.x - 0.6 * k, s.y - 0.9 * k, 1.2 * k, 0.8 * k, P.canopy);
  }
  // La tobera SOLO se ve de cola: de frente la tapa el propio avion.
  if (trasero) drawTobera(s.x, s.y, k, H.t);
}

/** UN CUADRO de la flota. `lejos` = la pasada que va CON el mundo (todo lo que esta mas lejos que
 *  el avion); `!lejos` = la que va DESPUES del avion. */
export function drawCaza(lejos) {
  const fleet = snapshot();
  const corte = PZ;
  for (const H of fleet) {
    for (const f of H.fx) {
      if ((f.z > corte) !== !!lejos) continue;
      if (f.k === 'trac') { if (!(f.wait > 0)) drawTrac(f); }
      else if (f.k === 'humo') drawHumo(f);
      else drawEstela(f);
    }
    // `enCola` lo decide el sistema: ya te paso y esta detras tuyo, asi que no hay nada que
    // dibujar — la estela y el humo si siguen, porque esos quedaron en el aire delante tuyo.
    if (!H.enCola && (H.z > corte) === !!lejos && H.z > 1.5) drawCazaSprite(H);
  }
}
