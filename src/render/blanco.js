// LA SUELTA SOBRE EL BUQUE — el dibujo (docs en data/blanco.js).
//
// Dos piezas: el BUQUE, que es mundo (va en el pase del mundo, con la proyeccion de todo lo demas
// y la MISMA hoja horneada que el buque de la aproximacion), y el HUD de la suelta, que es cabina
// (va nivelado, sobre el avion). Ninguna de las dos decide nada: el HUD recibe su foto ya
// calculada por systems/blanco.js (convencion 4 — el render no importa sistemas).
import { ctx, px, W, PZ, uiFont } from './ctx.js';
import { proj } from '../core/fx.js';
import { run } from '../core/run.js';
import { blanco, altoEn, AGUA, zVista } from '../core/blanco.js';
import { BL } from '../data/blanco.js';
import { P } from '../data/palette.js';
import { T } from '../core/i18n.js';
import { drawCascoDelBuque } from './world.js';
import * as enemyArt from './enemies.js';

/** El buque, en el mundo. Va ANTES de los obstaculos del pasillo: casi siempre es lo mas lejano. */
export function drawBlanco() {
  if (!blanco.on) return;
  if (blanco.z > BL.VISIBLE_Z || blanco.z < PZ * 0.5) return;
  const z = zVista(blanco.z);   // se DIBUJA a la profundidad comprimida (ver zVista)
  const s = proj(BL.X, AGUA, z), k = s.k;
  const len = BL.LEN * k;
  const uh = Math.max(0.5, BL.LEN * 0.03 * k), hullH = uh * 1.5;
  // NO SE HUNDE EN CUADRO (pedido del autor, 23/9: "no tiene que verse hundirse, tiene que empezar a
  // prenderse fuego nomas"). El negro llega antes; lo que se ve es el buque herido, a flote.
  // LA BRUMA de lejos, con el mismo mecanismo que la aproximacion: oscurece conservando la forma.
  const haze = Math.max(0, Math.min(0.35, (blanco.z - 600) / BL.VISIBLE_Z));
  ctx.save();
  ctx.beginPath(); ctx.rect(-80, -200, W + 160, s.y + 1 + 200); ctx.clip();
  drawCascoDelBuque(blanco.nombre, s.x, len, s.y - hullH, uh, hullH, haze, { hoja: true });
  // LA PERSPECTIVA AEREA: de lejos un buque se ve MAS CLARO, tirado al color del cielo — no mas
  // oscuro. La hoja es gris acero y el mar del pasillo es casi negro, asi que a 1 km el casco era
  // una mancha oscura sobre oscuro y solo se leia la espuma de proa. La misma silueta en blanco,
  // encima y con un alfa que se apaga al acercarse, es lo que lo separa del agua.
  const claro = Math.max(0, Math.min(0.55, (blanco.z - 350) / 1600));
  const hoja = 'buque_' + blanco.clase;
  if (claro > 0.01 && enemyArt.ready(hoja)) {
    ctx.globalAlpha = claro;
    enemyArt.drawFrame(ctx, hoja, 0, 0, s.x, { bottomY: s.y }, len, false, true);
    ctx.globalAlpha = 1;
  }
  ctx.restore();

  // EL FUEGO donde pegaron, y QUE SE PROPAGA: cada impacto arranca con un foco y con los segundos
  // (de mundo: en la camara lenta, despacio) se le suman llamas a los costados sobre la cubierta.
  // Nucleo que titila y humo negro que sube. Dibujado, no particulas: el render no escribe en los
  // stores del mundo.
  const u = Math.max(1.5, Math.min(6, k * 2));   // tope: encima del buque el humo era una mancha que tapaba el cuadro
  for (let i = 0; i < blanco.marcas.length; i++) {
    const m = blanco.marcas[i], tt = Math.max(0, run.t - m.t);
    const focos = 1 + Math.min(FUEGO_MAX, Math.floor(tt / FUEGO_CADA));
    for (let j = 0; j < focos; j++) {
      // alternan a un lado y al otro del impacto, cada uno un poco mas lejos; montados en la cubierta
      const lado = j === 0 ? 0 : (j % 2 ? 1 : -1) * Math.ceil(j / 2);
      const fxw = m.x + lado * BL.LEN * 0.045;
      const h = altoEn(fxw);
      if (h < 0) continue;
      const fy = j === 0 ? m.y : AGUA + Math.min(h, BL.LEN * 0.09);
      llama(proj(fxw, fy, z), u * (j === 0 ? 1 : 0.8), i * 7 + j);
    }
  }
  // LOS MARINEROS: puntitos que corren por la cubierta, lejos del fuego, desde el primer impacto.
  // Solo cuando el buque ya esta cerca — de lejos serian ruido.
  if (blanco.marcas.length && k > 0.5) {
    const t0 = blanco.marcas[0].t, huye = blanco.marcas[0].x < BL.X ? 1 : -1;
    for (let i = 0; i < MARINEROS; i++) {
      const base = ((i * 0.618) % 1) - 0.5;                       // repartidos por la eslora
      const corre = (run.t - t0) * (0.05 + (i % 3) * 0.02) * huye;
      const xw = BL.X + Math.max(-0.47, Math.min(0.47, base + corre)) * BL.LEN;
      const h = altoEn(xw);
      if (h < 0) continue;
      const pie = proj(xw, AGUA + Math.min(h, BL.LEN * 0.07), z);
      const alto = Math.max(2, k * 1.8), ancho = Math.max(1, k * 0.6);
      const paso = Math.sin(run.t * 18 + i) > 0 ? 1 : 0;           // el trote: sube y baja un pixel
      px(pie.x - ancho / 2, pie.y - alto - paso, ancho, alto, '#1c2226');
      px(pie.x - ancho / 2, pie.y - alto - paso, ancho, Math.max(1, ancho), '#c9a27a');   // la cara
    }
  }
}

const FUEGO_CADA = 0.35;   // segundos de mundo entre un foco nuevo y el siguiente
const FUEGO_MAX = 6;       // focos extra por impacto
const MARINEROS = 9;

/** Una llama con su columna de humo, en el punto de pantalla `f`. */
function llama(f, u, semilla) {
  const fl = 0.6 + 0.4 * Math.sin(run.t * 23 + semilla * 5);
  for (let j = 0; j < 5; j++) {
    const sube = ((run.t * 0.9 + j / 5 + semilla * 0.13) % 1);
    ctx.globalAlpha = (1 - sube) * 0.55;
    const r = u * (1.2 + sube * 3);
    px(f.x - r / 2 + Math.sin(run.t * 2 + j + semilla) * u, f.y - u * 2 - sube * u * 14, r, r, '#1b1a18');
  }
  ctx.globalAlpha = 1;
  px(f.x - u * 1.4, f.y - u * 1.6 * fl, u * 2.8, u * 1.6 * fl, '#e8842a');
  px(f.x - u * 0.6, f.y - u * fl, u * 1.2, u * fl, '#ffd479');
}

/** EL BLANCO MARCADO: dos corchetes sobre la zona de maquinas — el "objetivo claro" del pedido.
 *
 *  VA EN LA CAPA DE CABINA, ENCIMA DEL AVION, y no en el mundo con el casco. Para embocarla hay que
 *  estar ALINEADO con el buque, y alineado quiere decir que el buque queda exactamente detras de tu
 *  propio avion en pantalla: medido en la primera prueba, a la distancia de suelta el sprite tapaba
 *  el casco entero. Es una mira de bombardeo, no un pedazo del buque: se pinta arriba de todo. */
const CORCHETES_Z = 700;

function corchetes() {
  if (blanco.z > BL.VISIBLE_Z || blanco.z < PZ) return;
  const z = zVista(blanco.z);
  const s = proj(BL.X, AGUA, z), k = s.k;
  // CON TAMAÑO MINIMO: a la distancia de suelta la zona real mide 14 x 4 px y los corchetes se
  // confundian con las marcas de la mira. Nunca mas chicos que 20 x 8: de lejos dicen "ahi", de
  // cerca abrazan la zona exacta.
  const cx = s.x, mw = Math.max(10, (proj(BL.X + BL.LEN * BL.CENTRO, AGUA, z).x - cx));
  const xl = cx - mw, xr = cx + mw;
  const bot = s.y + 1, top = Math.min(bot - 8, proj(BL.X, AGUA + altoEn(BL.X) * 0.55, z).y);
  const t = Math.max(1, Math.round(k * 0.35)), a = Math.max(3, (xr - xl) * 0.2);
  ctx.globalAlpha = 0.55 + 0.45 * Math.abs(Math.sin(run.t * 4));
  // DE LEJOS, SOLO LA FLECHA: el buque es una mota en el horizonte, justo donde cae la mira, y los
  // corchetes encima lo tapaban entero (playtest 23/9: "aparece cuando ya estas demasiado cerca").
  // Los corchetes entran cuando ya hay casco que abrazar.
  if (blanco.z < CORCHETES_Z) for (const [x, d] of [[xl, 1], [xr, -1]]) {
    px(x - (d < 0 ? t : 0), top, t, bot - top, P.warn);
    px(d > 0 ? x : x - a, top, a, t, P.warn);
    px(d > 0 ? x : x - a, bot - t, a, t, P.warn);
  }
  // …y la flecha con el rotulo, arriba: lo que dice que esos corchetes son EL blanco y no la mira.
  const fy = (blanco.z < CORCHETES_Z ? top : proj(BL.X, AGUA + BL.LEN * 0.4, z).y) - 4;
  px(cx - 3, fy - 3, 7, 1, P.warn); px(cx - 2, fy - 2, 5, 1, P.warn); px(cx - 1, fy - 1, 3, 1, P.warn); px(cx, fy, 1, 1, P.warn);
  ctx.font = uiFont(null, 7); ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'; ctx.fillStyle = P.warn;
  ctx.fillText(T('bl_blanco'), cx, fy - 4);
  ctx.globalAlpha = 1;
}

/** EL HUD DE LA SUELTA. `h` es la foto de systems/blanco.js `hud()`, o null. Coordenadas de mundo
 *  (480x270), sin el giro del horizonte.
 *
 *  QUEDO SOLO LA MARCA DEL BLANCO (playtest 23/9: "el texto de arriba, con metros y pasada y que se
 *  yo, quitalo"). La distancia, las bombas y la luz de SOLTA se fueron: el momento de soltar lo
 *  dicen Puma por radio y el tablero titilando en verde (render/hud.js), y la altura el altimetro. */
export function drawBlancoHud(h) {
  if (h && h.enAtaque) corchetes();
}
