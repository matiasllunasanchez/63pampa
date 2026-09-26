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
import { formationSlots, pilotIdx, RELEVO_WRECK, RELEVO_DUR, puestoFormacion } from '../core/squad.js';
import { pilotName, rosterActive, fallenPos } from '../systems/squad.js';
import { skinOf } from '../data/skins.js';
import { iconoEn } from './iconos.js';
import { SENAS } from '../data/blanco.js';

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
    // el puesto sale de core/squad.js: el polvo del carreteo (game.js) usa el MISMO, o el dibujo
    // y lo que levanta se separan el dia que alguien mueva la formacion.
    const pu = puestoFormacion(slots, i, plane.x, plane.y, run.t);
    let z = PZ + pu.dz;
    let x = pu.x;
    let y = pu.y;
    if (exit !== null && exit !== undefined) {
      z -= exit * exit * 11;               // se vienen encima (crecen): pasan el plano de camara
      y += exit * 2.4;                     // levantan un poco al pasar
      x += Math.sign(slots[i].dx || 1) * exit * 5;   // se abren: nadie atraviesa al jugador
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
  ctx.fillText(T(rv.spent === 'seco' ? 'sq_seco' : rv.spent ? 'sq_spent' : rosterActive() ? 'sq_dmg' : 'sq_down', { c: pilotName(rv.fallen) }), DW / 2, 10);
  // LA CAUSA NO SE DICE ACA (12/9). Estaba en rv.cause y se imprimia debajo del titular, pero
  // sobre el juego en marcha es una linea de texto mas que leer mientras el companero entra: el
  // jugador acaba de VER como se cayo. La pantalla de derribado sigue nombrandola (drawDead).
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

/** "MIRAME LA PANZA" (PLAN_VUELTA_REAL V4): un compañero se pone a tu costado y abajo y te hace dos
 *  señas —que tenes y a donde—. `sn` es la foto que arma game.js: { t, idx, senas: [id, id] }.
 *  Dibuja EN EL MUNDO (va con drawPlane). Entra desde abajo a la derecha, se queda, y se va. */
export function drawSenas(sn, selPlane) {
  if (!sn || sn.t < 0) return;
  const total = SENAS.ENTRA + SENAS.CADA * sn.senas.length + SENAS.SALE;
  if (sn.t > total) return;
  const entra = Math.min(1, sn.t / SENAS.ENTRA), sale = Math.max(0, (sn.t - (total - SENAS.SALE)) / SENAS.SALE);
  const e = 1 - (1 - entra) * (1 - entra);
  // la posicion: arranca abajo y atras (fuera de cuadro), se acomoda en su puesto, y se va abajo
  const x = plane.x + SENAS.DX * (0.4 + 0.6 * e) + sale * 6;
  const y = plane.y + SENAS.DY - (1 - e) * 6 - sale * 4;
  const z = PZ + SENAS.DZ - (1 - e) * 6 + sale * 3;
  const s = proj(x, y, z), f = s.k / proj(0, 0, PZ).k;
  const pl = PLANES[selPlane], hoja = hojaDe(pl, sn.idx);
  const smooth = ctx.imageSmoothingEnabled;
  ctx.imageSmoothingEnabled = false;
  if (hoja) {
    const col = (SHEET_NF - 1) / 2, w = SHEET_FW * PLANE_SCALE * f, h = SHEET_FH * PLANE_SCALE * f;
    ctx.drawImage(hoja, col * SHEET_FW, SHEET_FH, SHEET_FW, SHEET_FH, s.x - w / 2, s.y - h / 2, w, h);
  }
  ctx.imageSmoothingEnabled = smooth;
  // LA SEÑA: un globo al costado de su cabina con el pictograma y, abajo, lo que quiere decir
  const dentro = sn.t - SENAS.ENTRA;
  if (dentro < 0 || sale > 0) return;
  const i = Math.min(sn.senas.length - 1, Math.floor(dentro / SENAS.CADA));
  const id = sn.senas[i], bx = Math.round(s.x + 22 * f), by = Math.round(s.y - 20 * f);
  const pop = Math.max(0, 1 - (dentro - i * SENAS.CADA) / 0.15);   // un golpecito al cambiar de seña
  globo(bx, by, id, T(id), id === 'sena_fuga' || id === 'sena_dano' || id === 'sena_chancha', pop);
}

/** EL GLOBO DE UNA SEÑA: cuadro con el pictograma, la colita hacia el avion y, abajo, lo que
 *  quiere decir. `pop` (0..1) lo agranda un poco: el golpecito de cuando aparece o cambia. Lo usan
 *  las señas de los compañeros y las tuyas. */
function globo(bx, by, icono, texto, alerta, pop) {
  const L = Math.round(15 + (pop || 0) * 3);
  ctx.fillStyle = '#0d1216d8'; ctx.fillRect(bx - L / 2, by - L / 2, L, L);
  ctx.fillStyle = '#e9edf0';
  ctx.fillRect(bx - L / 2, by - L / 2, L, 1); ctx.fillRect(bx - L / 2, by + L / 2 - 1, L, 1);
  ctx.fillRect(bx - L / 2, by - L / 2, 1, L); ctx.fillRect(bx + L / 2 - 1, by - L / 2, 1, L);
  // la colita del globo, hacia el avion
  px(bx - L / 2 - 2, by + 2, 2, 1, '#e9edf0'); px(bx - L / 2 - 4, by + 3, 2, 1, '#e9edf0');
  const col = alerta ? '#ffd479' : '#7fe07a';
  iconoEn(bx, by, icono, col);
  ctx.font = 'bold 6px monospace'; ctx.textAlign = 'center'; ctx.fillStyle = col;
  ctx.fillText(texto, bx, by + L / 2 + 7);
  ctx.textAlign = 'left';
}

/** TU SEÑA (data/senales.js): el globo sobre TU avion, con el pictograma y lo que dijiste. `g` es
 *  { sn, t, dir } — la seña, los segundos desde la tecla y el lado del gesto. */
export function drawSenalPropia(g) {
  if (!g) return;
  const s = proj(plane.x, plane.y, PZ);
  const bx = Math.round(s.x + 22), by = Math.round(s.y - 20);
  const icono = g.sn.icono === 'senal_rompo' ? (g.dir < 0 ? 'senal_rompo_i' : 'senal_rompo_d') : g.sn.icono;
  globo(bx, by, icono, T('senal_' + g.sn.id), !!g.sn.alerta, Math.max(0, 1 - g.t / 0.15));
}
