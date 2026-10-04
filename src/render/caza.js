// EL DIBUJO DE LA COLA: los Harriers del duelo, su humo y su estela. El Sidewinder que te tiran
// NO se dibuja aca: vive con los demas misiles y lo pinta render/aim9.js (30/9/2026 — antes aca se
// dibujaban las trazadoras que erraban, que se fueron con el pedido del misil).
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

/** EL RESPLANDOR DE LAS TOBERAS (pedido del autor 4/10: "quiza conviene quitar el fuego de atras y
 *  hacer el resplandor como tiene mi avion"). Las dos toberas calientes ya vienen dibujadas en la hoja,
 *  a los costados de la cintura; esto es solo la LUZ que derraman: un degrade sin borde, como
 *  `tobera()` de render/plane.js, que late y se apaga al cabecear (si no ves la boca, no brilla). La
 *  estrella horneada del centro se fue: el Harrier no tiene tobera de cola, y se leia como un
 *  incendio pegado en la espalda. */
function resplandor(sx, sy, k, H) {
  const cara = 1 - Math.min(1, Math.abs(H.pitch || 0) / 0.45);
  if (cara <= 0.02) return;
  const a = (H.bank || 0) * Math.PI / 3;                 // el alabeo de la pose (±60°): las bocas rotan con el avion
  const p = 0.86 + 0.10 * Math.sin(H.t * 30) + Math.random() * 0.04;
  const R = Math.max(2, 0.55 * k * p);
  for (const sg of [-1, 1]) {
    const dx = sg * 0.62 * k, dy = 0.24 * k;
    const x = sx + dx * Math.cos(a) + dy * Math.sin(a), y = sy - dx * Math.sin(a) + dy * Math.cos(a);
    const g = ctx.createRadialGradient(x, y, 0, x, y, R);
    g.addColorStop(0, `rgba(255,170,90,${0.40 * cara})`);
    g.addColorStop(0.45, `rgba(224,110,36,${0.24 * cara})`);
    g.addColorStop(1, 'rgba(180,70,22,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.ellipse(x, y, R, R * 0.72, 0, 0, 6.2832); ctx.fill();
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
  } else if (trasero && enemyArt.ready('harrier_cola')) {
    // DE COLA, CON LA MOVILIDAD DE TU AVION (pedido del autor 4/10): la hoja `harrier_cola` esta
    // horneada como la del jugador — 9 alabeos de -60 a +60 y los cabeceos en filas (0 trepa, 1
    // nivelado, 2 pica). La pose sale del movimiento real (bank, pitch). Las filas de las piruetas
    // (3 y 4, ±32°) estan horneadas pero NO se usan: el Harrier no hace piruetas, y con ellas se lo
    // veia de arriba ("muy vertical").
    const col = Math.max(0, Math.min(8, Math.round((H.bank * 0.5 + 0.5) * 8)));
    const p = H.pitch || 0;
    const fila = p > 0.45 ? 0 : p < -0.45 ? 2 : 1;
    enemyArt.drawFrame(ctx, 'harrier_cola', col, fila, s.x, { centerY: s.y }, k, false, false, 0);
    resplandor(s.x, s.y, k, H);
    return;
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
      if (f.k === 'humo') drawHumo(f);
      else drawEstela(f);
    }
    // `enCola` lo decide el sistema: ya te paso y esta detras tuyo, asi que no hay nada que
    // dibujar — la estela y el humo si siguen, porque esos quedaron en el aire delante tuyo.
    if (!H.enCola && (H.z > corte) === !!lejos && H.z > 1.5) drawCazaSprite(H);
  }
}
