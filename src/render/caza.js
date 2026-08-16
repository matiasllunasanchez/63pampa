// EL DIBUJO DE LA COLA: el Harrier del duelo y las trazadoras que te pasan de largo.
//
// Plan: docs/sistemas/PLAN_HARRIERS_PERSECUCION.md, PLAN A · fase H1 (el pase fantasma). La logica
// vive en systems/caza.js; aca solo se LEE su snapshot y se pinta (convencion 4 de ARQUITECTURA).
//
// EL CRITERIO DE H1 ES UNA MIRADA MUDA: se tiene que entender el ciclo sin leer un solo cartel.
// Las tres cosas que lo cuentan, y ninguna es texto:
//   1. las TRAZADORAS cruzan de atras hacia adelante y se pierden en el horizonte — algo te esta
//      tirando desde donde no mirás;
//   2. el SOBREPASO llega enorme por un costado y se va achicando adelante — el que estaba atras
//      ahora esta adelante, y eso es tu turno;
//   3. la SALIDA se aleja hasta ser un punto — se fue, y se ve irse.
//
// ORDEN DEL PINTOR: el caza cruza de z 6 (detras tuyo, mas cerca de la camara que el propio avion)
// a z 118 (lejos, adelante). No hay una sola capa correcta, asi que se dibuja en DOS pasadas y
// game.js decide: `drawCaza(true)` va con el mundo, antes del avion; `drawCaza(false)` va despues,
// para lo que quedo mas cerca que el avion. Ver el llamado en draw().
//
// ARTE: PLACEHOLDER. El Harrier visto DESDE ATRAS es una hoja que todavia no existe (la pide H5,
// esta listada en PENDIENTES). Mientras tanto es el `jet` de frente OSCURECIDO y angostado, que es
// lo que el §3 autoriza explicitamente — y la regla P2 de siempre: funciona sin assets, el arte
// cae despues. Si la hoja no cargo, mas abajo hay una silueta dibujada a mano.

import { ctx, px, PZ } from './ctx.js';
import { proj } from '../core/fx.js';
import { P } from '../data/palette.js';
import * as enemyArt from './enemies.js';
import { snapshot } from '../systems/caza.js';

// del nucleo encendido al rescoldo, como las trazadoras del jugador (render/ammo.js) pero mas
// frias: son ajenas, y el ojo tiene que poder distinguir de un vistazo cual chorro es tuyo
const HOT = ['#fdfefe', '#d8ecff', '#9ec8f0', '#5f8fc0'];
// LAS QUE VIENEN A DARTE SON DE OTRO COLOR (H2), y es la unica señal que las distingue. El §6.1
// prohibe el recuadro de fijado y el tono de lock-on, asi que el aviso de "esta le apunto a vos"
// tiene que estar en la cosa misma: las de aviso son frias y ajenas, estas son ROJAS y crecen. Es
// el mismo idioma que el juego ya habla con la soga de humo de los misiles — se lee el rastro, no
// el proyectil.
const LET = ['#fff2d8', '#ffcf62', '#f2662a', '#a8331a'];

// PLACEHOLDER: cuanto se oscurece y cuanto se angosta el jet de frente para hacer de cola. Un
// avion visto desde atras es mas angosto (no se le ve la envergadura entera) y esta a contraluz.
// Los dos numeros se van con la hoja real en H5.
const PH_DARK = 0.5, PH_SQUASH = 0.74;

/** Una trazadora ajena: cabeza encendida y cola corta muestreada hacia atras en z. Misma tecnica
 *  que render/ammo.js — la perspectiva y el enfriado salen solos y todo es px() entero. */
// LA COLA ES LARGA A PROPOSITO. La primera version muestreaba 3 tramos de 3 unidades y a media
// distancia cada trazadora quedaba en un pixel suelto: se leia como caspa sobre el mar, no como
// algo que cruza. Un proyectil que va a 340 unidades por segundo recorre 5,7 por CUADRO — la
// estela tiene que abarcar varios cuadros de vuelo o no hay linea que ver. Con 7 tramos de 5,5 la
// traza mide 38 unidades de mundo y se lee como un rayo aunque este a 150 de distancia.
const TRAC_N = 7, TRAC_Z = 5.5;

function drawTrac(f) {
  const C = f.letal ? LET : HOT;
  // la letal es mas GORDA ademas de mas roja: viene mas lenta y mas cerca, y si se leyera igual
  // que las de aviso el jugador no tendria como saber cual de los dos chorros lo va a matar
  const gordo = f.letal ? 1.7 : 1;
  for (let i = TRAC_N; i >= 1; i--) {
    const z = f.z - i * TRAC_Z * (f.letal ? 0.6 : 1);   // la letal va mas lenta: su traza es mas corta
    if (z <= 1.5) continue;
    const p = proj(f.x, f.y, z);
    const w = Math.max(1, Math.round(p.k * 0.1 * gordo));
    ctx.globalAlpha = 0.75 * (1 - i / (TRAC_N + 2));
    px(p.x - w / 2, p.y - w / 2, w, w, C[Math.min(C.length - 1, i >> 1)]);
  }
  ctx.globalAlpha = 1;
  const s = proj(f.x, f.y, f.z);
  // la CABEZA nunca baja de 2 px: es el punto que dice donde esta el proyectil ahora, y si se
  // hace de 1 px se pierde contra las motas del mar (que son de 1 px)
  const w = Math.max(2, Math.round(s.k * 0.17 * gordo));
  ctx.globalAlpha = 0.5;
  px(s.x - w / 2 - 1, s.y - w / 2 - 1, w + 2, w + 2, C[2]);   // halo: sin el, lejos no existe
  ctx.globalAlpha = 1;
  px(s.x - w / 2, s.y - w / 2, w, w, C[0]);
}

/** LA COLUMNA DE HUMO del Harrier averiado (H3). Es el premio visible del contraataque: se lee de
 *  lejos, no dice nada y no se puede confundir con otra cosa. Se pinta oscuro sobre el mar claro y
 *  se va abriendo con la edad, como el humo de verdad. */
function drawHumo(f) {
  const s = proj(f.x, f.y, f.z);
  const edad = 1 - Math.min(1, f.life / 2.2);
  const w = Math.max(1, s.k * f.r * (0.5 + edad * 1.6));
  ctx.globalAlpha = Math.min(0.55, f.life * 0.4);
  px(s.x - w / 2, s.y - w / 2, w, w, edad < 0.4 ? '#20262a' : P.dim);
  ctx.globalAlpha = 1;
}

/** El aire sucio que queda donde te cruzo. No es humo: es la marca de que ahi paso algo, y su
 *  trabajo es que el sobrepaso siga contando un segundo despues de que el caza ya no esta. */
function drawEstela(f) {
  const s = proj(f.x, f.y, f.z);
  const w = Math.max(1, s.k * f.r * 0.5);
  ctx.globalAlpha = Math.min(0.4, f.life * 0.4);
  px(s.x - w / 2, s.y - w / 2, w, w, P.crest);
  ctx.globalAlpha = 1;
}

/** El caza. `cola` = lo estamos viendo desde atras (placeholder oscurecido y angostado); si no,
 *  esta adelante y de frente, que es el `jet` de siempre sin retocar. */
function drawCazaSprite(C) {
  const s = proj(C.x, C.y, C.z);
  const k = s.k;
  const cola = C.z < PZ + 8;                     // todavia detras tuyo o cruzandote
  if (enemyArt.ready('jet')) {
    // la columna de alabeo sale del lado por el que ataca: banquea hacia donde va
    const cols = enemyArt.SHEETS.jet.cols;
    const col = Math.max(0, Math.min(cols - 1, Math.round((C.lado * 0.5 + 0.5) * (cols - 1))));
    if (cola) {
      // el angostado se aplica con un scale anclado en el centro del sprite: translate al centro,
      // escalar, y dibujar con cx = 0 (drawFrame vuelve a trasladar por su cuenta)
      ctx.save();
      ctx.translate(s.x, 0);
      ctx.scale(PH_SQUASH, 1);
      enemyArt.drawFrame(ctx, 'jet', col, 0, 0, { centerY: s.y }, k, false, false, PH_DARK);
      ctx.restore();
    } else enemyArt.drawFrame(ctx, 'jet', col, 0, s.x, { centerY: s.y }, k, false, false, 0);
  } else {
    // RESPALDO SIN ASSETS (regla P2): silueta a mano. Alas, fuselaje y deriva — lo justo para que
    // la coreografia se lea igual con la hoja vacia.
    const c = cola ? '#1b2228' : P.bodyDark;
    px(s.x - 4.2 * k, s.y - 0.4 * k, 8.4 * k, 0.8 * k, c);          // ala
    px(s.x - 1 * k, s.y - 1.4 * k, 2 * k, 2.8 * k, c);              // fuselaje
    px(s.x - 0.35 * k, s.y - 2.8 * k, 0.7 * k, 1.5 * k, c);         // deriva
    if (!cola) px(s.x - 0.6 * k, s.y - 0.9 * k, 1.2 * k, 0.8 * k, P.canopy);
  }
  // LLAMA DE LA TOBERA, solo de cola: es lo unico que se ve de verdad de un avion que se te viene
  // encima desde atras de noche o a contraluz, y ademas da la unica pista de distancia que hay.
  if (cola) {
    const fl = 0.7 + Math.sin(C.t * 34) * 0.3;
    ctx.globalAlpha = 0.65;
    px(s.x - 0.5 * k * fl, s.y - 0.2 * k, k * fl, Math.max(1, 0.55 * k), '#f0954a');
    ctx.globalAlpha = 1;
    px(s.x - 0.22 * k * fl, s.y - 0.05 * k, Math.max(1, 0.45 * k * fl), Math.max(1, 0.3 * k), '#fff2cf');
  }
}

/** UN CUADRO del duelo. `lejos` = la pasada que va CON el mundo (todo lo que esta mas lejos que el
 *  avion); `!lejos` = la que va DESPUES del avion, para lo que quedo mas cerca que el. Las
 *  trazadoras se reparten por el mismo criterio, asi que una que te pasa por al lado se dibuja
 *  encima del ala y no debajo. */
export function drawCaza(lejos) {
  const C = snapshot();
  if (!C) return;
  const corte = PZ;
  for (const f of C.fx) {
    if ((f.z > corte) !== !!lejos) continue;
    if (f.k === 'trac') { if (!(f.wait > 0)) drawTrac(f); }
    else if (f.k === 'humo') drawHumo(f);
    else drawEstela(f);
  }
  if ((C.z > corte) === !!lejos && C.z > 1.5) drawCazaSprite(C);
}
