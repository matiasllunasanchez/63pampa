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
import { formationSlots, detras, RELEVO_WRECK, RELEVO_DUR, puestoFormacion } from '../core/squad.js';
import { pilotName, planeName, rosterActive, fallenPos } from '../systems/squad.js';
import { skinOf } from '../data/skins.js';
import { iconoEn } from './iconos.js';
import { SENAS } from '../data/blanco.js';
import { SALIDA, GESTO_T } from '../data/senales.js';
import { pose } from '../core/senales.js';

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
  // los puestos son los que SIGUEN EN LA FILA (core/squad.js): con cambio de piloto no tienen por
  // que ser los numerales de al lado del que vuela
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
    const hoja = hojaDe(pl, detras(run, 1 + i));
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
  // el que se va es EL QUE CAYO, que el relevo anota (con cambio de piloto no tiene por que ser el
  // numeral anterior al que vuela ahora)
  const hoja = hojaDe(pl, rv.fallen);
  if (hoja) {
    // TAMBALEA: el alabeo oscila alrededor del banqueo de salida y el sprite tirita 1 px —
    // el avion esta ROTO y tiene que verse (playtest 4/8: "mostrar que esta roto")
    // …SALVO EN UN CAMBIO DE PILOTO (rv.cambio): ahi el avion esta sano, y va NIVELADO con un banqueo
    // quieto hacia donde se abre — sin tambaleo ni temblor. Es la diferencia entre "se cae" y "cede
    // el puesto", y es justo lo que el autor no queria ver en cada cambio.
    const mid = (SHEET_NF - 1) / 2;
    const wob = rv.cambio ? 0 : Math.round(Math.sin(rv.t * 10) * Math.min(1.9, 0.6 + rv.t));
    // en el CAMBIO va NIVELADO: frena y queda atras, no vira (un banqueo se leia como un viraje)
    const col = rv.cambio ? mid : Math.max(0, Math.min(SHEET_NF - 1, mid - rv.side * 2 + wob));
    const jx = rv.cambio ? 0 : Math.sin(rv.t * 31) * f * 0.7, jy = rv.cambio ? 0 : Math.cos(rv.t * 27) * f * 0.6;
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
  // en un CAMBIO no hay alarma: el titular va quieto y en acento, no titilando en rojo
  ctx.fillStyle = rv.cambio ? P.accent : Math.sin(rv.t * 12) > 0 ? P.warn : '#7d2f1e';
  // campaña (roster): nadie muere — el avion queda AVERIADO y vuelve a la base (norma 3/8)
  // TRES titulares, no dos: derribado (arcade), averiado (campaña) y — desde RF-15 — SALE DE LA
  // CORRIDA, que es lo que pasa cuando gastaste tu pasada sin que nadie te tocara.
  // TRAS ERRAR LA SUELTA (`solo`) el tuyo ya no esta en escena: el titular es del que toma la pasada
  // EN CAMPAÑA EL CARTEL NOMBRA AL AVION, NO AL PILOTO (pedido del autor 27/9): arriba, chico, el
  // que sale ("GAMBETA PASA ATRAS"); el que ENTRA no va aca abajo sino como ROTULO que cruza la
  // pantalla en letras de fuego, igual que RASANTE (lo dibuja game.js en coordenadas de mundo).
  // Sin comillas (autor: "sacale los piquitos"). Fuera de campaña no hay chapa con nombre y
  // queda el indicativo de siempre, abajo, como antes.
  const nom = i => planeName(i) || pilotName(i);
  if (rv.solo) ctx.fillText(T('pasada_turn', { c: pilotName(rv.next) }), DW / 2, 10);
  else ctx.fillText(T(rv.cambio ? 'sq_atras' : rv.spent === 'seco' ? 'sq_seco' : rv.spent ? 'sq_spent' : rosterActive() ? 'sq_dmg' : 'sq_down', { c: nom(rv.fallen) }), DW / 2, 10);
  // LA CAUSA NO SE DICE ACA (12/9). Estaba en rv.cause y se imprimia debajo del titular, pero
  // sobre el juego en marcha es una linea de texto mas que leer mientras el companero entra: el
  // jugador acaba de VER como se cayo. La pantalla de derribado sigue nombrandola (drawDead).
  if (rv.t > RELEVO_WRECK && !rv.solo) {
    ctx.font = '7px monospace'; ctx.fillStyle = P.accent;
    if (!planeName(rv.next)) ctx.fillText(T('sq_take', { c: pilotName(rv.next) }), DW / 2, DH - 10);
    // cuenta hasta devolver el control: la barra se VACIA — mismo lenguaje que el conteo del
    // despegue (algo termina), no que una carga (algo se acumula)
    const rem = Math.max(0, 1 - (rv.t - RELEVO_WRECK) / (RELEVO_DUR - RELEVO_WRECK));
    px(DW / 2 - 24, DH - 6, Math.round(48 * rem), 2, P.accent);
  }
  // el tablero del escuadron, con el caido recien tachado: el costo se ve en el momento
  drawSquadPips(3, 3);
}

/** UN COMPAÑERO TE HACE SEÑAS. Nacio con "MIRAME LA PANZA" (PLAN_VUELTA_REAL V4) y ahora es la
 *  pieza de todas las señas de compañero (data/senales.js SENAS_COMP). `sn` es la foto que arma
 *  game.js: { t, idx, items: [{ icono, texto, gesto, alerta }], sale, lado }.
 *  Dibuja EN EL MUNDO (va con drawPlane). Entra desde abajo y atras a su puesto, a tu `lado`; por
 *  cada item hace su GESTO y muestra su globo; y se va segun `sale` (SALIDA). */
export function drawSenas(sn, selPlane) {
  if (!sn || sn.t < 0) return;
  const total = SENAS.ENTRA + SENAS.CADA * sn.items.length + SENAS.SALE;
  if (sn.t > total) return;
  const entra = Math.min(1, sn.t / SENAS.ENTRA), sale = Math.max(0, (sn.t - (total - SENAS.SALE)) / SENAS.SALE);
  const e = 1 - (1 - entra) * (1 - entra), e2 = sale * sale;
  const lado = sn.lado || 1, sal = SALIDA[sn.sale] || SALIDA.abajo;
  // la posicion: arranca abajo y atras (fuera de cuadro), se acomoda en su puesto, y se va
  const x = plane.x + lado * (SENAS.DX * (0.4 + 0.6 * e) + sal.x * e2);
  const y = plane.y + SENAS.DY - (1 - e) * 6 + sal.y * e2;
  const z = PZ + SENAS.DZ - (1 - e) * 6 + sal.z * e2;
  if (z < 4) return;   // ya te paso: esta detras de la camara
  const s = proj(x, y, z), f = s.k / proj(0, 0, PZ).k;
  // LA POSE: el gesto del item en curso, y al irse la de la salida (se inclina hacia el costado,
  // pica hacia abajo, o se abre apenas al quedarse atras)
  const dentro = sn.t - SENAS.ENTRA;
  const i = Math.max(0, Math.min(sn.items.length - 1, Math.floor(dentro / SENAS.CADA)));
  const it = sn.items[i];
  let p = { bank: 0, pitch: 0, rot: 0 };
  if (sale > 0) {
    const m = Math.min(1, sale * 3);
    if (sn.sale === 'costado') p.bank = lado * 0.8 * m;
    else if (sn.sale === 'atras') p.bank = lado * 0.4 * m;
    else p.pitch = -m;
  } else if (dentro >= 0 && it.gesto && GESTO_T[it.gesto]) {
    const u = (dentro - i * SENAS.CADA) / GESTO_T[it.gesto];
    if (u < 1) p = pose(it.gesto, u, lado);
  }
  const pl = PLANES[selPlane], hoja = hojaDe(pl, sn.idx);
  const smooth = ctx.imageSmoothingEnabled;
  ctx.imageSmoothingEnabled = false;
  if (hoja) {
    const col = Math.round((1 - Math.max(-1, Math.min(1, p.bank))) / 2 * (SHEET_NF - 1));
    const row = p.pitch > 0.33 ? 0 : p.pitch < -0.33 ? 2 : 1;
    const w = SHEET_FW * PLANE_SCALE * f, h = SHEET_FH * PLANE_SCALE * f;
    ctx.save(); ctx.translate(s.x, s.y); if (p.rot) ctx.rotate(p.rot);
    ctx.drawImage(hoja, col * SHEET_FW, row * SHEET_FH, SHEET_FW, SHEET_FH, -w / 2, -h / 2, w, h);
    ctx.restore();
  }
  ctx.imageSmoothingEnabled = smooth;
  // LA SEÑA: un globo al costado de su cabina con el pictograma y, abajo, lo que quiere decir
  if (dentro < 0 || sale > 0) return;
  const bx = Math.round(s.x + 22 * f), by = Math.round(s.y - 20 * f);
  const pop = Math.max(0, 1 - (dentro - i * SENAS.CADA) / 0.15);   // un golpecito al cambiar de seña
  globo(bx, by, it.icono, T(it.texto), !!it.alerta, pop);
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
