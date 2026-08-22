// RENDER DEL ESCUADRON: la formacion del despegue (y su salida de plano) y la sobreimpresion
// de la cinematica del relevo. La logica vive en systems/squad.js; los puestos de la formacion
// y los tiempos, en core/squad.js.
//
// OJO con los dos espacios de coordenadas (ver render/ctx.js): drawFormation dibuja EN EL MUNDO
// (480x270, la llaman junto a drawPlane) y drawRelevo en la GRILLA DE DISEÑO (320x180, la llaman
// dentro del ctx.scale(U) de las pantallas). Por eso los alias DW/DH de abajo.

import { ctx, px, DW, DH, PZ, U } from './ctx.js';
import { plane } from '../core/state.js';
import { run } from '../core/run.js';
import { proj } from '../core/fx.js';
import { T } from '../core/i18n.js';
import { P } from '../data/palette.js';
import { PLANES, SHEET_FW, SHEET_FH, SHEET_NF } from '../data/planes.js';
import { PLANE_SCALE, drawGear, drawShadow } from './plane.js';
import { drawSquadPips } from './hud.js';
import { formationSlots, pilotIdx, RELEVO_WRECK, RELEVO_DUR } from '../core/squad.js';
import { pilotName, rosterActive, fallenPos } from '../systems/squad.js';
import { skinOf } from '../data/skins.js';

/** La formacion detras del lider. `exit` = null durante el despegue; 0..1 durante la salida de
 *  plano (al CONTROL LIBRE: aceleran, crecen y pasan al costado de la camara — "te siguen ahi
 *  atras aunque no los veas"). Fuera de esos dos momentos NO se dibuja nunca: en vuelo seria
 *  un costo de render que no aporta y taparia el juego. */
/** La hoja de sprite que le toca al numeral `idx`: la VARIANTE de ese Fiel si existe, o la hoja
 *  generica del avion elegido. Devolver la generica no es un caso de error — fuera de campaña no
 *  hay roster, y el build web puede descartar las variantes por el limite de tamaño. */
function hojaDe(pl, idx) {
  const sk = rosterActive() ? skinOf(pilotName(idx)) : null;
  if (sk) return sk.sheetImg;
  return pl.sheetOk ? pl.sheetImg : null;
}

export function drawFormation({ selPlane, exit }) {
  const pl = PLANES[selPlane];
  const slots = formationSlots(run.squad);
  const lider = pilotIdx(run.squad, run.lives);   // los puestos son los numerales que siguen
  const kRef = proj(0, 0, PZ).k;
  const smooth = ctx.imageSmoothingEnabled;
  ctx.imageSmoothingEnabled = false;
  // los puestos vienen ordenados de mas lejano (rank 1, z mayor) a mas cercano: pintor correcto
  for (let i = 0; i < slots.length; i++) {
    const sl = slots[i], rank = Math.ceil((i + 1) / 2);
    let z = PZ + sl.dz;
    let x = plane.x + sl.dx;
    // siguen al lider con RETRASO: los de atras rotan mas tarde — la escalera de ascenso que
    // se ve en cualquier despegue en formacion. El seno es el bob de "vuelo vivo" de cada uno.
    let y = Math.max(0.8, plane.y - rank * 1.7) + Math.sin(run.t * 2.6 + i * 1.9) * 0.25;
    if (exit !== null && exit !== undefined) {
      z -= exit * exit * 11;               // se vienen encima (crecen): pasan el plano de camara
      y += exit * 2.4;                     // levantan un poco al pasar
      x += Math.sign(sl.dx || 1) * exit * 5;   // se abren: nadie atraviesa al jugador
      if (z < 3.8) continue;               // ya quedo detras de la camara
    }
    const s = proj(x, y, z);
    const f = s.k / kRef;
    // LA SOMBRA, LA MISMA QUE LA TUYA. Es el dibujo de render/plane.js llamado con la escala de
    // ESTE companero, por el mismo motivo que el tren de abajo. Antes era una sombra propia —una
    // sola barra, alfa fijo y APAGADA por encima de y=6— asi que los companeros la perdian justo
    // al levantar mientras el lider seguia con la suya: cinco aviones despegando y uno solo
    // atado al suelo.
    drawShadow(x, y, z, f);
    // EL TREN, EL MISMO QUE EL TUYO. Despegan con vos: si vos tenes las ruedas afuera, ellos
    // tambien, y se recogen a la par. Es el dibujo de render/plane.js llamado con la escala de
    // ESTE companero (U * f, porque aca se dibuja en pixeles de mundo y cada uno esta a otra
    // distancia), no una copia — dos rutinas de rueda serian un escuadron con dos aviones
    // distintos, y la que no se mira se pudre.
    //
    // Va ANTES del sprite por la misma razon que en el lider: la pata nace adentro del ala y
    // solo tiene que verse lo que asoma por debajo.
    ctx.save();
    ctx.translate(s.x, s.y);
    drawGear(run.gear, U * f);
    ctx.restore();
    const hoja = hojaDe(pl, lider + 1 + i);
    if (hoja) {
      const col = (SHEET_NF - 1) / 2;                    // nivelados: la formacion no banquea
      const row = plane.pitch > 0.33 ? 0 : 1;            // pero acompañan el cabeceo del lider
      const w = SHEET_FW * PLANE_SCALE * f, h = SHEET_FH * PLANE_SCALE * f;
      ctx.drawImage(hoja, col * SHEET_FW, row * SHEET_FH, SHEET_FW, SHEET_FH,
        s.x - w / 2, s.y - h / 2, w, h);
    } else if (pl.ready) {
      const w = 76 * PLANE_SCALE * f, h = w * pl.h / pl.w;
      ctx.drawImage(pl.img, s.x - w / 2, s.y - h / 2, w, h);
    }
  }
  ctx.imageSmoothingEnabled = smooth;
}

/** El AVERIADO yendose (campaña, capa de MUNDO): banqueado, cada vez mas chico, rumbo al
 *  horizonte. Verse ir es la mitad de la norma "nadie muere" — sin esto el avion desaparecia
 *  de golpe y el relevo se seguia leyendo como una destruccion (playtest 4/8). */
export function drawFallen({ selPlane, rv }) {
  const pl = PLANES[selPlane];
  const p0 = fallenPos(rv);
  if (p0.z < 3.8) return;   // ya paso el plano de camara: quedo atras, sobrepasado
  const s = proj(p0.x, p0.y, p0.z);
  const f = s.k / proj(0, 0, PZ).k;
  const smooth = ctx.imageSmoothingEnabled;
  ctx.imageSmoothingEnabled = false;
  // el que se va es el numeral ANTERIOR al lider actual: a este ya lo relevaron
  const hoja = hojaDe(pl, Math.max(0, pilotIdx(run.squad, run.lives) - 1));
  if (hoja) {
    // TAMBALEA: el alabeo oscila alrededor del banqueo de salida y el sprite tirita 1 px —
    // el avion esta ROTO y tiene que verse (playtest 4/8: "mostrar que esta roto")
    const mid = (SHEET_NF - 1) / 2;
    const wob = Math.round(Math.sin(rv.t * 10) * Math.min(1.9, 0.6 + rv.t));
    const col = Math.max(0, Math.min(SHEET_NF - 1, mid - rv.side * 2 + wob));
    const jx = Math.sin(rv.t * 31) * f * 0.7, jy = Math.cos(rv.t * 27) * f * 0.6;
    const w = SHEET_FW * PLANE_SCALE * f, h = SHEET_FH * PLANE_SCALE * f;
    ctx.drawImage(hoja, col * SHEET_FW, SHEET_FH, SHEET_FW, SHEET_FH, s.x - w / 2 + jx, s.y - h / 2 + jy, w, h);
  } else if (pl.ready) {
    const w = 76 * PLANE_SCALE * f, h = w * pl.h / pl.w;
    ctx.drawImage(pl.img, s.x - w / 2, s.y - h / 2, w, h);
  }
  ctx.imageSmoothingEnabled = smooth;
}

/** Sobreimpresion de la cinematica del relevo (grilla de diseño). El texto vive ACA y no en
 *  popups: es informacion de escena, fija mientras dura — un popup se iria flotando. */
export function drawRelevo(rv) {
  // LETTERBOX: dos barras — el lenguaje universal de "esto es cinematica, no perdiste el
  // control por un bug". Finas a proposito: el mundo (los restos, el companero) ES la escena.
  ctx.fillStyle = '#05070add';
  ctx.fillRect(0, 0, DW, 16); ctx.fillRect(0, DH - 16, DW, 16);
  ctx.textAlign = 'center';
  ctx.font = 'bold 8px monospace';
  ctx.fillStyle = Math.sin(rv.t * 12) > 0 ? P.warn : '#7d2f1e';
  // campaña (roster): nadie muere — el avion queda AVERIADO y vuelve a la base (norma 3/8)
  // TRES titulares, no dos: derribado (arcade), averiado (campaña) y — desde RF-15 — SALE DE LA
  // CORRIDA, que es lo que pasa cuando gastaste tu pasada sin que nadie te tocara.
  ctx.fillText(T(rv.spent ? 'sq_spent' : rosterActive() ? 'sq_dmg' : 'sq_down', { c: pilotName(rv.fallen) }), DW / 2, 10);
  // LA CAUSA. Siempre estuvo en rv.cause y nunca se mostraba: el jugador moria sin saber por
  // que (playtest 2/8). Es la unica pantalla que puede contestarle en el momento.
  ctx.font = '7px monospace'; ctx.fillStyle = P.foam;
  ctx.fillText(T(rv.cause), DW / 2, 26);
  if (rv.t > RELEVO_WRECK) {
    ctx.font = '7px monospace'; ctx.fillStyle = P.accent;
    ctx.fillText(T('sq_take', { c: pilotName(rv.next) }), DW / 2, DH - 10);
    // cuenta hasta devolver el control: la barra se VACIA — mismo lenguaje que el conteo del
    // despegue (algo termina), no que una carga (algo se acumula)
    const rem = Math.max(0, 1 - (rv.t - RELEVO_WRECK) / (RELEVO_DUR - RELEVO_WRECK));
    px(DW / 2 - 24, DH - 6, Math.round(48 * rem), 2, P.accent);
  }
  // el tablero del escuadron, con el caido recien tachado: el costo se ve en el momento
  drawSquadPips(3, 3);
}
