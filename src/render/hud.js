// HUD: la capa de instrumentos y avisos sobre el vuelo, mas la cuenta regresiva del despegue.
//
// Escuadron, ruta del objetivo (con su kilometraje adentro), velocidad, altura, radar, viento,
// multiplicador, combustible, calor del canon, misiles, la palanca de gas y los dos rieles de
// racha. Va SIN el zoom de camara (el orquestador lo restaura antes de llamar aca).
//
// Lee el estado de vuelo de los stores (run, plane). Lo que es de MISION/menu (best, gameMode,
// objectiveDist, objectiveShip, goalKind) vive en game.js y entra por parametro, igual que las
// otras pantallas (render/screens.js, render/menus.js).

import { ctx, px, DW as W, DH as H, PZ, U, SC, avisoFont, uiFont, labelFont, filaFont } from './ctx.js';
import { enCabina } from '../core/cabina.js';
import { CABINA_ANCLAS } from '../data/cabina_anclas.js';
import { drawManos } from './cabina.js';
import * as glifos from './glifos.js';
const GLIFO_H = 9;
const FILA_H = 17;   // (22/11, el autor: "agrandemos la zona negra para que la flecha del stick se vea": la flecha sale 2 px por arriba y abajo de la perilla)   // el alto de un cartel con mando: una sola fila (mando · texto · cuenta)   // el alto de la fila de mandos dibujados de un cartel (render/glifos.js)
const GLIFO_CUENTA = '4px monospace';   // la cuenta (1 / 2, 3 / 8 SEGS) al lado de los mandos
import { cartelesAhora } from '../core/cartel.js';
import { plane, cfg } from '../core/state.js';
import { cargaDe } from '../data/cargas.js';
import { run } from '../core/run.js';
import { apellidoDe, resortearApellidos } from '../data/apellidos.js';
import { estadoAvion, BASE_T } from '../data/fallas.js';
import { shown as dmgShown } from '../systems/damage.js';
import { proj } from '../core/fx.js';
import { scrapeLimit, speedTarget } from '../core/physics.js';
import { effects } from '../core/damage.js';
import { T } from '../core/i18n.js';
import { AGU, ancho as anchoSector, pos as posInd, ventana as ventanaAgu,
  concentracion as concSeg } from '../core/aguante.js';
import { P, RADAR_VERDE, RADAR_OPACO, RADAR_GRIS, colDefensa } from '../data/palette.js';
import { ALTO, FALLA_ALERTA } from '../data/tuning.js';
import { MSL_MAX, RADAR_ALT, EST_MAX, VOZ_COLS, KMH_U, A_MAR, M_CONO, FLY_TOP, BANDA_ALT, PERF_ALT, ZONAS_GASTO, METRALLAS } from '../data/tuning.js';
import { machNow } from '../core/mach.js';
import { alMando, filaOk, filaDeVidas } from '../core/squad.js';
import { pilotName, planeName } from '../systems/squad.js';
import { active as tempoActive, meterVal as tempoMeter } from '../systems/tempo.js';
import { meterVal as chMeter, gastada as chGastada, snapshot as chSnap } from '../systems/chancha.js';
import { attitude } from '../core/horizon.js';
import { retrato, silueta } from './retratos.js';
import { icono, iconoEn, tonos } from './iconos.js';
import { ICONO_BUQUE, ICONO_BUQUE_NOMBRE, CANON_METAL } from '../data/iconos.js';
import { SHIP_CLASS } from '../data/ships.js';
import { carasGeneral } from '../data/pilotos_generales.js';
import { CARA_PILOTO, GESTOS, GESTO_SOSTEN, SONRISA_PTS, SONRISA_T } from '../data/gestos.js';
import { radio, visible as radioVisible } from '../core/radioVN.js';
import { radarP } from '../core/radarPropio.js';

// LAS SILUETAS DE LA RUTA (puerto, buque, avion, bandera) viven en la tabla de iconos
// (data/iconos.js), dibujadas en pixeles; un PNG las reemplaza igual que a cualquier otro icono.
// Antes tenian un sistema de assets propio aca, con rectangulos sueltos de respaldo.

// LA CINTA DE LA CORRIDA — la fila de arriba al centro, y el mismo verbo para todos los modos.
//
// ESE LUGAR DE LA PANTALLA SIGNIFICA UNA COSA SOLA: como va esta corrida. Lo que cambia entre
// modos es CONTRA QUE va, no la pregunta:
//
//   con objetivo   contra el buque   ·  `HMS SHEFFIELD  ▸——⊥  0.2 / 2.6 KM`
//   POR LA PATRIA  contra tu record  ·  `0.3 KM         ▸——★  1244 / 48200`
//
// Son la MISMA informacion —donde estas de lo que te propusiste— asi que son el mismo instrumento
// y no dos. Escribirlo dos veces era garantizar que se separaran a la primera correccion: uno se
// achica, el otro no, y de golpe el HUD tiene dos idiomas en el mismo renglon.
//
// LA ANATOMIA, en 11 px de alto: ROTULO (contexto, cuerpo 5, apagado — no cambia o cambia despacio)
// · LINEA con las dos puntas y el marcador · FRACCION (cuerpo 6: lo hecho en acento, la meta en el
// color de la meta, que es lo que la ata al icono de al lado).
//
// EL ANCHO SALE DEL CONTENIDO y la placa se centra como un bloque: con el rotulo a la izquierda y
// el numero a la derecha, centrar la LINEA dejaba el instrumento visiblemente corrido.
const CINTA_LINEA = 44;   // el recorrido, adentro de la placa

/** `o` = { rot, prog, meta, a, b, uni, boost }
 *    rot    texto de contexto a la izquierda (o null)
 *    prog   0..1 — donde esta el marcador
 *    meta   'buque' | 'record' — que se dibuja en la punta derecha
 *    metaCol color de la meta y de `b` (default: el naranja de aviso)
 *    a, b   los dos lados de la fraccion (`b` null = no hay meta: solo el numero, sin linea)
 *    uni    unidad al final (o null)
 *    boost  estelas atras del marcador
 *    icono  un icono antes del valor, cuando no hay linea (POR LA PATRIA: el avioncito con los puntos) */
function cinta(o) {
  const conLinea = o.b != null;
  ctx.font = F_VAL;
  const aW = Math.round(ctx.measureText(o.a).width);
  const bW = o.b ? Math.round(ctx.measureText(o.b).width) : 0;
  ctx.font = F_ROT;
  const uniW = o.uni ? Math.round(ctx.measureText(o.uni).width) + 2 : 0;
  const rotW = o.rot ? Math.round(ctx.measureText(o.rot).width) + 5 : 0;
  const iconoW = o.icono && !conLinea ? 13 : 0;
  // EL NOMBRE DEL BLANCO, en SU cuadro y en rojo, pegado a los kilometros (playtest 11/9). Estaba a la
  // izquierda de la ruta, en gris: lejos del numero con el que se asocia. Pegado al total, y del color
  // del total, el cuadro se lee de un tiron — «2.6 km hasta el HMS SHEFFIELD».
  // (MEDIDO Y DIBUJADO CON LA MISMA LETRA, F_VAL — 13/11, el autor: "el texto OBJETIVO se ve cortado": se
  // medía con la del rotulo y se dibujaba con la que dejara puesta la placa del escuadron, mas grande)
  ctx.font = F_VAL;
  const nomW = o.nombre ? Math.round(ctx.measureText(o.nombre).width) + 8 : 0;
  ctx.font = F_ROT;
  let linea = CINTA_LINEA;
  let ancho = 4 + rotW + iconoW + (conLinea ? linea + 5 + 5 : 0) + aW + (o.b ? 3 + bW : 0) + uniW + 4;
  const conNombre = () => ancho + (nomW ? nomW - 1 : 0);   // el instrumento entero: cinta + cuadro
  // EL MINIMO: el ancho que la radio necesita para colgar debajo con el MISMO ancho (ver VOZ). Lo
  // que falta se lo lleva la LINEA de la ruta, que gana resolucion en vez de ganar alto. Sin linea
  // (POR LA PATRIA sin record) no se estira nada: el toast se defiende solo con el mismo minimo.
  const min = vozMin();
  if (conLinea && conNombre() < min) { const falta = min - conNombre(); linea += falta; ancho += falta; }
  let total = conNombre();
  // …SIN PISAR LA PLACA DEL ESCUADRON (18/10, el autor: "la placa de los aviones pisa la barra"): con
  // ocho aviones la placa de arriba a la izquierda llega hasta el centro. Si se tocan, la cinta arranca
  // despues de la placa, y si entonces no entra hasta el margen derecho, lo que sobra lo pierde la LINEA.
  const minX = run.squad > 1 ? MARGEN + anchoSquad() + 3 : 0;
  const bx0 = Math.max(minX, Math.round(W / 2 - total / 2));
  if (conLinea) {
    const sobra = bx0 + total - (W - MARGEN);
    if (sobra > 0) { const q = Math.min(sobra, linea - 16); linea -= q; ancho -= q; total -= q; }
  }
  // …Y SE ESTIRA HASTA EL BORDE DERECHO (4/10, el autor: "usar el resto de barra que tiene a la
  // derecha"). Arranca donde arrancaba —centrada con su ancho justo— y lo que sobra hasta el margen se
  // lo lleva la LINEA: mas recorrido, mas resolucion para leer donde estas y donde empieza el radar.
  if (conLinea) {
    const libre = Math.max(0, W - MARGEN - (bx0 + total));
    linea += libre; ancho += libre; total += libre;
  }
  // EN CABINA, SOBRE LA VISERA (20/11, el autor: "dentro de la cabina los indicadores deben aparecer debajo, dentro de
  // la cabina, para no obstruir la vision, y el coso de arriba tambien"): la cinta baja del cielo a la chapa negra
  // que corona el tablero
  const py = enCabina() ? CINTA_CABINA_Y : MARGEN, y = py + 5;   // la fila, al medio de una placa de 11
  plate(bx0, py, ancho, 11);
  // LA SUELTA: es el momento de soltar → el borde de la cinta titila en verde (y el avion, abajo)
  const verde = !!o.solta && titilaSuelta();
  if (verde) bordePlaca(bx0, py, ancho, 11, SUELTA_COL);
  if (o.nombre) {
    // comparte el canto con la cinta: se lee como una pestaña del mismo instrumento, no como otro
    plate(bx0 + ancho - 1, py, nomW, 11);
    ctx.font = F_VAL; ctx.textAlign = 'left'; ctx.fillStyle = P.warn;
    ctx.fillText(o.nombre, bx0 + ancho + 3, py + 7);
  }
  if (o.rot) {
    ctx.textAlign = 'left'; ctx.fillStyle = P.dim;   // apagado: es contexto, no un valor
    ctx.fillText(o.rot, bx0 + 4, y + 2);
  }
  let kx = bx0 + 4 + rotW;
  if (iconoW) { iconoEn(kx + 5, y, o.icono, P.ink); kx += iconoW; }
  if (conLinea) {
    const x0 = kx, x1 = x0 + linea;
    // via PUNTEADA (pendiente) que se va rellenando continua (recorrido): lee como ruta de mapa
    // DESDE LA MARCA DEL RADAR, EN VERDE (4/10, el autor): el tramo bajo radar se lee de un vistazo —
    // la via pendiente en verde apagado y lo recorrido en el verde de la marca.
    const rFr = o.radar != null && o.radar > 0 && o.radar < 1 ? o.radar : null;
    const xr = rFr === null ? Infinity : Math.round(x0 + linea * rFr);
    for (let dx3 = 0; dx3 < linea; dx3 += 4) px(x0 + dx3, y, 2, 1, x0 + dx3 >= xr ? '#2f5a35' : '#2e3c45');
    const hecho = Math.round(linea * o.prog);
    px(x0, y, Math.min(hecho, xr - x0), 1, P.accent);
    if (x0 + hecho > xr) px(xr, y, x0 + hecho - xr, 1, SUELTA_COL);
    // DONDE EMPIEZA EL RADAR (4/10, el autor): una marca verde sobre la ruta. Solo existe con `ruta`
    // y `radarKm` — sin eso el radar esta desde el despegue y no hay linea que marcar.
    if (rFr !== null) px(xr, y - 2, 1, 5, SUELTA_COL);
    // LAS PUNTAS. Con buque: el muelle y la silueta de SU clase. Por distancia: el muelle y una
    // BANDERA — antes terminaba en un destructor aunque no hubiera barco. En POR LA PATRIA: el cero
    // y la bandera de la marca a batir (ver drawCorridaBar).
    if (o.meta === 'record') px(x0, y - 2, 1, 5, P.dim);
    else iconoEn(x0, y, 'puerto', P.foam, P.dim);
    if (o.meta === 'buque') iconoEn(x1, y, o.buque || 'buque_t42', P.warn);
    else iconoEn(x1 + 1.5, y, 'bandera', o.metaCol || P.warn);   // +1,5: el mastil cae justo en x1
    // el marcador que avanza (+ estelas de turbo)
    const pm = x0 + linea * o.prog;
    if (o.boost) {
      ctx.strokeStyle = P.foam; ctx.globalAlpha = 0.7;
      for (let i = 1; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(pm - 2 - i * 3, y); ctx.lineTo(pm - i * 3, y); ctx.stroke(); }
      ctx.globalAlpha = 1;
    }
    // LA MEDIA VUELTA (pedido del autor, 17/9): la ruta es LA MISMA —el puerto de donde saliste
    // sigue a la izquierda y el punto donde diste la vuelta a la derecha—, y lo unico que cambia es
    // que ahora la caminas al reves. Asi que gira el AVION y nada mas, sobre su propio eje.
    // `o.flip` va de 0 a 1 mientras dura el giro; el piso de 0.02 existe porque una matriz con
    // escala exactamente 0 no se puede invertir y el canvas descarta el dibujo.
    if (o.flip > 0) {
      const sx = 1 - 2 * o.flip;
      ctx.save();
      ctx.translate(pm, 0); ctx.scale(Math.abs(sx) < 0.02 ? 0.02 : sx, 1); ctx.translate(-pm, 0);
      iconoEn(pm, y, 'avion', P.ink);
      ctx.restore();
    } else iconoEn(pm, y, 'avion', verde ? SUELTA_COL : P.ink);
    kx = x1 + 8;   // el buque mide 11: medio casco a la derecha del final de la linea
  }
  ctx.textAlign = 'left'; ctx.font = F_VAL;
  ctx.fillStyle = P.accent; ctx.fillText(o.a, kx, y + 2);
  if (o.icono === 'avion') ptsEn(kx, y + 2, aW);   // (el puntaje de POR LA PATRIA: los que suman y restan, ahi)
  kx += aW + 3;
  if (o.b) { ctx.fillStyle = o.metaCol || P.warn; ctx.fillText(o.b, kx, y + 2); kx += bW + 2; }
  if (o.uni) { ctx.font = F_ROT; ctx.fillStyle = o.uniCol || P.dim; ctx.fillText(o.uni, kx, y + 2); }
  cajaCinta = { x: bx0, w: total, y2: py + 11 };   // la voz cuelga del instrumento ENTERO   // de aca cuelga la radio (ver cintaCaja)
}

/** CON OBJETIVO: contra el buque. El kilometraje va ACA DENTRO y no en su propia placa — «0.1 / 2.6»
 *  es cuanto llevas DE ESTA RUTA, o sea parte del objetivo. Reemplazo a la cuenta regresiva en
 *  metros que estaba en este mismo renglon: las dos decian el mismo hecho (2.6 - 0.1 es lo que
 *  falta) y ponerlas juntas era decirlo dos veces en dos unidades. Gano la fraccion porque ademas
 *  dice contra que, que la cuenta sola no dice.
 *
 *  EL NOMBRE, SOLO SI ES UN NOMBRE: un objetivo de DISTANCIA se rotulaba «2400 m», que es el mismo
 *  dato que ya dice el total tres pixeles a la derecha. Con un buque el rotulo si aporta — es lo
 *  unico en pantalla que dice CONTRA QUE estas volando. */
// EL GIRO DE LA RUTA, animado. `volK` es 0 en la ida y 1 en la vuelta, y tarda `VOL_GIRO` segundos
// en pasar de uno a otro. Vive aca —y no en el store— porque es presentacion pura: si la partida se
// carga a mitad de la vuelta, la barra nace ya dada vuelta y no gira sola en la cara del jugador.
const VOL_GIRO = 0.7;
let volK = 0, volT = -1;
function giroVuelta(vuelve) {
  const dt = volT < 0 || run.t < volT ? 0 : Math.min(0.1, run.t - volT);
  volT = run.t;
  volK = vuelve ? Math.min(1, volK + dt / VOL_GIRO) : Math.max(0, volK - dt / VOL_GIRO);
  return volK;
}

// LOS KM DE LA RUTA (PLAN_NAFTA_ALCANCE N1). Con `ruta` la barra dice km REALES —«520 / 700»— y
// sin decimales: a esa escala el decimal es ruido. Sin ruta, los metros del pasillo de siempre.
const kmTxt = km => (km >= 100 ? Math.round(km).toString() : km.toFixed(1));

export function drawObjectiveBar(objectiveDist, objectiveShip, kind, vuelta, solta, ruta) {
  const flip = giroVuelta(!!vuelta);
  // LA VUELTA CUENTA LO SUYO: cuanto llevas hecho del regreso contra cuanto mide. Pasada la meta, el
  // odometro de la ida ya no es una ruta — «2.8 / 2.2 km» es un numero que se paso, no un lugar.
  if (vuelta) {
    // EL MARCADOR VUELVE SOBRE SUS PASOS: arranca en la bandera (donde diste la vuelta) y camina
    // hacia el puerto. Y el numero es LO QUE FALTA para casa, que es la pregunta del regreso.
    const falta = Math.max(0, vuelta.total - vuelta.hecho);
    // con ruta, lo que falta para casa en km reales: la base esta a blanco km del buque
    const fR = ruta ? Math.max(0, 2 * ruta.blanco - ruta.pos) : 0;
    cinta({
      rot: T('hud_home'), prog: Math.max(0, Math.min(1, ruta ? fR / ruta.blanco : falta / vuelta.total)),
      meta: 'distancia', flip,
      a: ruta ? kmTxt(fR) : (falta / 1000).toFixed(1), b: '/ ' + (ruta ? kmTxt(ruta.blanco) : (vuelta.total / 1000).toFixed(1)),
      uni: 'km', uniCol: P.warn, boost: run.boost, radar: radarFr(ruta),
    });
    return;
  }
  const km = Math.max(0, run.dist) / 1000;
  const esBuque = kind !== 'distance';
  cinta({
    nombre: esBuque ? objectiveShip : null,
    prog: Math.max(0, Math.min(1, ruta ? ruta.pos / ruta.blanco : run.dist / objectiveDist)),
    meta: esBuque ? 'buque' : 'distancia',
    buque: esBuque ? (ICONO_BUQUE_NOMBRE[objectiveShip] || ICONO_BUQUE[SHIP_CLASS[objectiveShip]] || 'buque_t42') : null,
    a: ruta ? kmTxt(Math.min(ruta.pos, ruta.blanco)) : km.toFixed(1),
    b: '/ ' + (ruta ? kmTxt(ruta.blanco) : (objectiveDist / 1000).toFixed(1)), flip,
    // 'km' en MINUSCULA y del color del total: mas chica sin bajar de cuerpo, y es ademas el simbolo
    // correcto del kilometro (el SI no lo escribe en mayuscula)
    uni: 'km', uniCol: P.warn,
    boost: run.boost, solta, radar: radarFr(ruta),
  });
}
/** La linea del radar en fraccion de la cinta: `radarKm` antes del blanco. En la vuelta la cinta
 *  cuenta lo que falta para casa y el radar se termina a `radarKm` del blanco: cae en el mismo punto. */
const radarFr = ruta => (ruta && ruta.radarKm && ruta.blanco > 0 ? (ruta.blanco - ruta.radarKm) / ruta.blanco : null);

/** POR LA PATRIA: LOS PUNTOS, Y NADA MAS (16/10, el autor: "por la patria no tiene final, cambiar esta
 *  barrita objetivo, quitarla y mostrar puntos acumulados con icono de avioncito"). Era una RUTA contra
 *  tu record —kilometraje, linea y «299 / 33309»—, y una ruta dice que hay un final: en un camino
 *  infinito no lo hay. Quedan los km recorridos y el avioncito con el puntaje, en el mismo lugar de la
 *  cinta (de ahi cuelga la radio). El record se ve donde termina la corrida. */
export function drawCorridaBar() {
  // …con los KILOMETROS recorridos adelante (16/10, el autor: "poner kilometros recorridos y puntaje")
  cinta({ rot: (Math.max(0, run.dist) / 1000).toFixed(1) + ' km', icono: 'avion', a: String(Math.floor(run.score)),
    uni: T('hud_pts'), uniCol: P.dim, boost: run.boost });
}

// colores de la bandera argentina, para el conteo del despegue
const CELESTE = '#75aadb', BLANCO = '#f2f7fb';

/** LA CORTA FINAL (PLAN_MISION_CINCO_FASES §4): las cuatro medidas, en pantalla.
 *
 *  SIN ESTO EL ATERRIZAJE NO SE PUEDE JUGAR, y no es una figura: velocidad, regimen de descenso y
 *  tren son tres numeros que el jugador no tiene de donde sacar mirando el mundo — el avion se ve
 *  igual bajando a 4 que a 12. La barra de altura si es leible sola (es la distancia al piso), y
 *  por eso no esta: lo que se dibuja es lo que NO se puede ver.
 *
 *  Cada medida se pinta VERDE cuando esta en su ventana y AMBAR cuando no, que es la unica forma
 *  de ensenar las ventanas sin un tutorial: se aprenden mirandolas cambiar de color mientras
 *  corregis. */
export function drawLanding(d) {
  ctx.textAlign = 'center';
  ctx.fillStyle = '#0a0e11aa'; ctx.fillRect(0, 17, W, 15);
  ctx.fillStyle = P.ink; ctx.font = '7px monospace';
  ctx.fillText(T('land_call'), W / 2, 27);

  // las tres cifras, en una fila. Se usa `tabular` a mano (monospace) para que no bailen.
  const fila = [
    { r: T('land_hud_spd'), v: Math.round(d.spd), ok: d.spdOk },
    { r: T('land_hud_vy'), v: d.vy.toFixed(1), ok: d.vyOk },
    { r: T('land_hud_gear'), v: d.gear >= 0.999 ? T('land_hud_si') : d.gear > 0 ? '· ·' : T('land_hud_no'), ok: d.gearOk },
  ];
  const x0 = W / 2 - 54;
  fila.forEach((f, i) => {
    const x = x0 + i * 54;
    ctx.fillStyle = '#0a0e11aa'; ctx.fillRect(x - 24, H - 34, 48, 18);
    ctx.font = '5px monospace'; ctx.fillStyle = P.dim;
    ctx.fillText(f.r, x, H - 27);
    ctx.font = 'bold 8px monospace'; ctx.fillStyle = f.ok ? P.foam : P.warn;
    ctx.fillText(String(f.v), x, H - 19);
  });

  // EL AVISO DEL TREN, y no es un adorno: [T] es una tecla que no se usa en NINGUN otro momento
  // del juego, asi que sin decirlo aca la tercera de las cuatro medidas seria indescubrible — el
  // jugador perderia chapa por no saber que existe un boton. Se muestra solo mientras el tren esta
  // arriba, y parpadea si ya estas bajo: a esa altura ya es tarde y tiene que picar.
  if (d.gear < 0.999) {
    const tarde = d.alt < 6;
    ctx.font = '6px monospace';
    ctx.fillStyle = tarde ? (Math.sin(run.t * 9) > 0 ? P.warn : P.dim) : P.dim;
    ctx.fillText(T('land_gear_hint'), W / 2, H - 40);
  }

  // LA ALTURA, como barra vertical al costado: es la unica de las cuatro que es una CUENTA
  // REGRESIVA — las otras tres son estados, esta se acaba.
  const hh = 40, hx = W - 14, hy = H - 62;
  ctx.fillStyle = '#0a0e11aa'; ctx.fillRect(hx - 3, hy, 8, hh);
  const f01 = Math.max(0, Math.min(1, d.alt / 16));
  ctx.fillStyle = P.crest; ctx.fillRect(hx - 2, hy + hh - f01 * hh, 6, Math.max(1, f01 * hh));
}

/** `dsp` = el `despegue` de la mision ({ desde, rumbo }), o null fuera de una mision — ahi queda el
 *  cartel generico de siempre. Un rumbo vacio no se escribe: la placa se achica a un renglon. */
const DSP_DURA = 4, DSP_FUNDE = 0.8;   // el renglon del despegue jugable: cuanto se lee y cuanto tarda en irse
let dspT0 = 0, dspUlt = -9;
/** EL ROTULO DEL DESPEGUE DEL LIBRO DE VUELO (21/11, el autor: "poner ubicacion y hora y dia en alguna zona clara de
 *  la pantalla para ubicar al jugador en tiempo y espacio. Efecto de tipeo. Todo esto mientras despega"). Arriba a la
 *  izquierda, donde no hay tablero todavia: cada renglon se TIPEA despues del anterior, con su cursor, y al tomar el
 *  control se va (`sale` 0→1). `rot` = { lineas: [lugar, zona, fecha, hora], t: segundos desde que empezo }. */
export const ROTULO_CPS = 26, ROTULO_PAUSA = 0.25;
/** Los renglones del rotulo (21/11, el autor: "arriba a la izquierda: FECHA, HORA, LUGAR — sin fondo, letra amarilla"). */
export function lineasRotulo(fecha, hora, lugar) {
  // (21/11, el autor: "literalmente el lugar, sin el texto LUGAR"): los datos solos, sin rotulos
  return [fecha && String(fecha).toUpperCase(), hora && hora + ' HS', lugar && String(lugar).toUpperCase()].filter(Boolean);
}
export function drawRotuloDespegue(rot, sale = 0) {
  if (!rot || sale >= 1) return;
  ctx.save();
  ctx.globalAlpha = 1 - sale;
  ctx.textAlign = 'left';
  // (23/11, el autor: "con sombra negra y mucho mas chico, 3 veces mas chico"): todo a un tercio desde la esquina
  // (23/11, despues: "letra un poco mas grande, y sin sombra, que haga contraste con el fondo… fondo negro con
  // opacidad al 80%"): un poco mas grande, sin sombra y con su placa negra al 80% por renglon
  const ROT_K = 0.44;
  ctx.translate(10, 8 + (globalThis.__rotDy || 0)); ctx.scale(ROT_K, ROT_K);   // (__rotDy: solo las capturas de prueba, cuya ventana corta arriba)
  let t = rot.t, y = 10;
  const x = 0, a0 = ctx.globalAlpha;
  // LA LETRA DE LAS DESCRIPCIONES DEL MENU PRINCIPAL (23/11, el autor: "la parte que explica donde estoy, con hora y
  // demas, con la misma fuente y efecto que los textos debajo de cada opcion del menu"): FONTS.fila en cuerpo 10, un pixel
  // de aire entre letras y el cursor en bloque del acento (render/menus.js drawModeSelect); en amarillo
  ctx.font = filaFont(10); ctx.letterSpacing = '1px';
  for (let i = 0; i < rot.lineas.length; i++) {
    const txt = rot.lineas[i];
    const n = Math.max(0, Math.min(txt.length, Math.floor(t * ROTULO_CPS)));
    t -= txt.length / ROTULO_CPS + ROTULO_PAUSA;
    if (n <= 0) break;
    const vis = txt.slice(0, n), w = ctx.measureText(vis).width;
    // el amarillo de RASANTE sobre su placa negra al 80% (sin sombra: la placa da el contraste)
    ctx.globalAlpha = a0; ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(x - 4, y - 10, w + (n < txt.length ? 10 : 8), 13);
    ctx.fillStyle = '#f2cf4a';
    ctx.fillText(vis, x, y);
    // el cursor: en el renglon que se esta escribiendo, y titilando en el ultimo cuando ya termino
    const escribiendo = n < txt.length, ultimo = i === rot.lineas.length - 1;
    if (escribiendo ? Math.sin(performance.now() / 70) > -0.3 : ultimo && Math.sin(rot.t * 8) > 0) { ctx.globalAlpha = a0 * 0.8; px(x + w + 1, y - 7, 4, 8, P.accent); }
    y += 14;
    if (escribiendo) break;
  }
  ctx.letterSpacing = '0px';
  ctx.restore();
}
export function drawTakeoff(toT, dsp, auto = 0, suelto = false, sinCuenta, rot = null, saleCarrera = null) {
  // EL LIBRO DE VUELO no tiene cuenta ni cabecera: despega solo y se tipea el rotulo (drawRotuloDespegue)
  if (rot) { drawRotuloDespegue(rot); return; }
  ctx.textAlign = 'center';
  // los modos sueltos no salen de una base real ni van a un blanco dicho (18/10, el autor: "eso es mentira,
  // quitarlo"): un rumbo generico y nada mas
  const enAuto = auto && toT >= 3;
  // TODO DESPEGUE, ARRIBA A LA IZQUIERDA (21/11, el autor: "la parte de despegue, en el lateral izquierdo superior:
  // FECHA, HORA, LUGAR — sin fondo, letra amarilla"): el mismo rotulo tipeado del libro de vuelo, con lo que la
  // mision sepa (la campaña trae fecha; el tutorial y el modo de siempre, solo el lugar). Ya no hay franja al medio.
  if (!enAuto) {
    const ahora = performance.now() / 1000;
    if (ahora - dspUlt > 0.5) dspT0 = ahora;   // un despegue nuevo (no se dibujo hace rato): arranca de cero
    dspUlt = ahora;
    const t = ahora - dspT0;
    // en el DESPEGUE JUGABLE se lee unos segundos y se va (19/11, "que no quede siempre")
    // (21/11: en la carrera jugable lo decide game.js —se va al cerrarse la primera pausa de dialogo—)
    const sale = saleCarrera != null ? saleCarrera : sinCuenta ? Math.max(0, Math.min(1, (t - DSP_DURA) / DSP_FUNDE)) : 0;
    const lugar = dsp ? dsp.desde : T('takeoffTitle').replace(/^[^·]*·\s*/, '');
    const lineas = suelto ? [T('takeoffSuelto')] : lineasRotulo(dsp && dsp.fecha, dsp && dsp.hora, lugar);
    drawRotuloDespegue({ t, lineas }, sale);
  }
  // EL PILOTO AUTOMATICO de los modos sueltos (`auto` segundos despues de la carrera, game.js): la misma
  // cuenta con la bandera, pero ahora dice cuando el avion pasa a ser tuyo. Arriba de todo, chico y
  // titilando, PILOTO AUTOMATICO; el rumbo se va (18/10, el autor: "tomas el control mas arriba")
  if (enAuto) {
    const u = (toT - 3) * 3 / auto, cn = 3 - Math.floor(u);
    if (Math.sin(toT * 9) > -0.2) {
      ctx.fillStyle = '#0a0e11aa'; ctx.fillRect(W / 2 - 34, 3, 68, 9);
      ctx.fillStyle = '#9fd8a8'; ctx.font = '6px monospace';
      ctx.fillText(T('takeoffAuto'), W / 2, 9);
    }
    ctx.fillStyle = '#0a0e11aa'; ctx.fillRect(0, 17, W, 13);
    ctx.fillStyle = P.ink; ctx.font = 'bold 7px monospace';
    ctx.fillText(T('takeoffControl'), W / 2, 26);
    if (cn >= 1) cuentaBandera(String(cn), u % 1, 62);
    return;
  }
  if (sinCuenta) return;   // (el DESPEGUE JUGABLE no tiene cuenta: despegas cuando das gas, 18/11)
  const cn = 3 - Math.floor(toT);
  if (cn >= 1) cuentaBandera(String(cn), toT % 1, 68);
}
/** El numero de la cuenta, con la bandera argentina adentro (celeste / blanco / celeste) y sombra: cae sobre
 *  el sol del amanecer y sin esto no se lee. `frac` lo achica a lo largo del segundo; `y` = la base. */
function cuentaBandera(num, frac, y) {
  const fs = Math.round(30 - frac * 10);
  ctx.font = 'bold ' + fs + 'px monospace';
  ctx.fillStyle = '#0a0e11aa';
  ctx.fillText(num, W / 2 + 1, y + 1);
  const top = y - fs * 0.75, hgt = fs * 0.78;
  const bands = [[0, 1 / 3, CELESTE], [1 / 3, 2 / 3, BLANCO], [2 / 3, 1, CELESTE]];
  for (const [a, b, col] of bands) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, top + hgt * a, W, hgt * (b - a) + 0.5);   // +0.5: sin costura entre franjas
    ctx.clip();
    ctx.fillStyle = col;
    ctx.fillText(num, W / 2, y);
    ctx.restore();
  }
}

// EL MARGEN DE ROCE — la escala de abajo de la SALUD, el agua (ver relojSalud).
//
// Tocar el agua no mata al instante: hay un reloj de gracia (`scrapeLimit`: 0,85 s lento, 0,18 s a
// fondo, y con turbo poco mas de la mitad). Rozando se llena; afuera se vacia despacio, a un tercio
// de la velocidad — rozar dos veces seguidas es peor que una. Esto devuelve lo que QUEDA de ese
// reloj: 1 entero, 0 te estrellas.
//
// Era una de las tres partes de ESTADO (el peor de cañon, nafta y roce), el unico de los tres que no
// estaba en otro instrumento. ESTADO se fue (playtest 10/9): el cañon y la nafta tienen sus barras,
// y el roce paso a ser la barra temporal de SALUD, y despues su aguja amarilla (11/9).
function margenRoce() {
  const lim = scrapeLimit(run.spd, run.boost);
  return lim > 0 ? 1 - Math.max(0, Math.min(1, run.scrapeT / lim)) : 1;
}

/** LA AGUJA AMARILLA de SALUD: el ESCUDO con chapa, el margen de roce sin ella (ver relojSalud). */
const amarilla = () => dmgShown() ? Math.max(0, Math.min(1, run.escudo)) : margenRoce();

/** EL RELOJ DE LA SALUD: un reloj de DOS agujas, como uno de horas y minutos (playtest 11/9, idea de
 *  Matias). Es el cuadrado hermano del cañon, a su izquierda, y reemplaza a las dos barras.
 *
 *  Hay dos cosas que te bajan del cielo, y una vuelve y la otra no:
 *    ARRIBA, LA CHAPA (aguja BLANCA, corta y gruesa: la de las horas). Los GOLPES que te dan: la
 *              integridad. Baja de a saltos y NO VUELVE. Las marcas largas en 25/50/75 son los
 *              ESCALONES de averia (core/damage.js): bajo la del medio te quedas sin turbo, bajo la
 *              primera —donde empieza lo rojo— sin piruetas.
 *    ABAJO, EL ESCUDO (aguja AMARILLA, larga y fina: el minutero). El escudo recuperable
 *              (core/damage.js, ESCUDO): TODO el daño —balas y roce— le pega primero, y lo que no
 *              para pasa a la chapa. Se va rapido y VUELVE solo. En ESCUADRON, sin chapa detras, es
 *              el margen de roce de siempre (`margenRoce`): vacio, te estrellas.
 *
 *  LAS DOS ESCALAS VAN AL REVES UNA DE LA OTRA pero con la misma regla que todos los relojes: vacia a
 *  la izquierda, llena a la derecha. Asi, con el avion sano, las dos agujas se juntan en las tres —
 *  una sola raya— y lo que se abre es la tijera: la blanca sube cuando te pegan, la amarilla baja
 *  cuando rozas. Cada escala lleva su icono en su esquina: la cruz arriba, y abajo el escudo — o la
 *  ola en ESCUADRON, donde la amarilla es solo el agua.
 *
 *  SIN NUMERO, a diferencia de sus hermanos: las dos escalas se comen el cuadrado entero y no queda
 *  esquina donde quepa un «100%» sin pisar una marca. La chapa se lee por escalon (las marcas
 *  largas), que es lo que decide; el porcentaje exacto no cambia nada que hacer.
 *
 *  EN ESCUADRON NO HAY CHAPA: un golpe te baja (la vida es el escuadron, arriba a la izquierda). Ahi
 *  el reloj lleva solo la escala de abajo — una aguja de chapa siempre entera seria una mentira. */
function relojSalud(x, y) { return alTablero(x, y, () => relojSaludFila(x, y), 13); }
function relojSaludFila(x, y) {
  plate(x, y, CUADRO, CUADRO);
  const cx = x + 13, cy = y + 13, r = 10;
  const total = dmgShown() ? Math.max(0, Math.min(1, run.integ / 100)) : null;
  const temp = amarilla();
  const rozando = run.scrapeVib > 0.6;
  const arriba = f => Math.PI + Math.PI * f;              // 180 → 360, por arriba
  const abajo = f => Math.PI - Math.PI * f;               // 180 → 0, por abajo
  // LAS DOS ESQUINAS DE LA IZQUIERDA SON DE LOS ICONOS: ni la escala ni sus bloques entran ahi, con
  // un pixel de aire. Sin esto la cruz se pegaba al segundo bloque y el escudo a las marcas rojas.
  const libre = (qx, qy) => !(qx - x <= 7 && (qy - y <= 7 || qy - y >= 19));
  // una marca RADIAL fina (ver `marcaFina`), si su centro cae fuera de las esquinas de los iconos
  const marca = (a, r0, r1, grosor, col) => {
    const rm = (r0 + r1) / 2;
    if (libre(Math.round(cx + Math.cos(a) * rm), Math.round(cy + Math.sin(a) * rm))) marcaFina(cx, cy, a, r0, r1, grosor, col);
  };
  // LA CHAPA SE MARCA EN HORAS Y EL ESCUDO EN SEGUNDOS (playtest 11/9). Arriba, CUATRO BLOQUES
  // gruesos, uno por escalon de averia, PRENDIDOS hasta donde llega la chapa: "cuantos tramos me
  // quedan" se lee sin buscar la aguja, que queda para el detalle. El primero es rojo —ahi ya no hay
  // piruetas— y el hueco entre bloques es el escalon. Abajo, una escala FINA y apretada, como la de
  // los segundos: es la que se mueve rapido y va y vuelve. La diferencia de trazo es lo que separa
  // las dos escalas de un vistazo, antes que el color.
  // (9/10: los bloques son una banda continua en pixeles reales, y las dos agujas tienen punta — el
  // mismo trazo que el resto de los relojes, ver `reloj`)
  if (total !== null) {
    for (let k = 0; k <= 120; k++) {
      const f = k / 120;
      if (Math.abs(f - 0.25) < 0.03 || Math.abs(f - 0.5) < 0.03 || Math.abs(f - 0.75) < 0.03) continue;
      marca(arriba(f), r - 1.4, r + 0.4, 2, f > total + 1e-6 ? '#2e3c45' : f < 0.25 ? P.warn : P.foam);
    }
  }
  // el rojo del escudo es el mismo umbral en que la aguja empieza a parpadear; largas cada cuarto
  for (let i = 0; i <= 24; i++) {
    const larga = i % 6 === 0;
    marca(abajo(i / 24), larga ? r - 1.4 : r - 0.6, r + 0.5, larga ? 2 : 1, i / 24 <= 0.35 ? P.warn : larga ? ESCALA_LARGA : ESCALA_COL);
  }
  // EL MINUTERO: amarillo siempre —es su nombre—, rojo y parpadeando cuando queda poco o mientras se
  // esta rozando, que es cuando hay que mirarlo
  agujaSimple(cx, cy, abajo(temp), r - 2,
    temp < 0.35 || rozando ? (Math.sin(run.t * 16) > 0 ? P.warn : '#7d2f1e') : P.accent);
  // LA DE LAS HORAS, encima: con el avion sano tapa la base del minutero y le deja la punta afuera.
  // Corta y GORDA: es la que se lee de lejos.
  if (total !== null) {
    const col = total <= 0.25 ? (Math.sin(run.t * 10) > 0 ? '#ff5340' : P.warn) : P.foam;
    aguja(cx, cy, arriba(total), r - 4, { o: AGUJA_BORDE, h: col, g: col, x: P.ink }, 1.3);
  }
  // LA CRUZ en vez de la palabra: es salud, y una cruz lo dice en cualquier idioma y en menos lugar.
  // BLANCA Y NO ROJA: la cruz roja sobre fondo claro es un emblema protegido (Convenios de Ginebra)
  // y a mas de un juego le pidieron sacarla. Una cruz clara dice «salud» igual.
  // Van en las dos esquinas de la izquierda, que las escalas les dejan libres (ver `libre`).
  iconoEn(x + 3.5, y + 3.5, 'vida', total !== null ? P.foam : P.dim);
  if (total !== null) iconoEn(x + 3, y + 22, 'escudo', P.accent);
  else iconoEn(x + 3.5, y + 22.5, 'ola', P.accent);
  // CRITICO: la chapa en el ultimo escalon, el escudo en su rojo, o rozando ahora mismo
  if ((total !== null && total <= 0.25) || temp < 0.35 || rozando) bordeCritico(x, y, CUADRO, CUADRO);
  escarcha('salud', x, y, run.hielo || 0);
}

// ---------- KIT DE PIXEL ART DEL HUD ----------
// Todo instrumento comparte el mismo lenguaje: PLACA oscura con borde de 1px y esquinas
// marcadas, relleno con BISEL (fila superior mas clara) y muescas de escala. Antes cada barra
// era un rectangulo translucido distinto — se leia como debug, no como instrumento.

/** Placa de instrumento: fondo oscuro + borde fino + esquinas remarcadas. */
// LAS PLACAS DE ESTE CUADRO: cada instrumento que se dibuja anota su caja. Las usa EL TABLERO DE NOCHE
// (render/noche.js) para teñir de ambar EXACTAMENTE los instrumentos — antes eran tres rectangulos
// grandes (la banda de los relojes, la de arriba y la cara) que oscurecian tambien el mundo entre reloj y
// reloj: "un velo desprolijo arriba" (el autor, 4/10). Se vacia al empezar cada drawHUD.
const placas = [];
/** Las cajas de los instrumentos del ultimo drawHUD (y la de la cara), en la grilla de DISEÑO. */
export function placasHud() {
  return cajaPiloto ? placas.concat([{ x: cajaPiloto.x, y: cajaPiloto.y, w: cajaPiloto.lado, h: cajaPiloto.alto }]) : placas;
}
function plate(x, y, w, h) {
  if (enTablero) return;            // en el tablero de la cabina el reloj va hundido, sin chapa (ver alTablero)
  placas.push({ x, y, w, h });
  ctx.fillStyle = '#0a0e11bb'; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#2e3c45';
  ctx.fillRect(x, y, w, 1); ctx.fillRect(x, y + h - 1, w, 1);
  ctx.fillRect(x, y, 1, h); ctx.fillRect(x + w - 1, y, 1, h);
  ctx.fillStyle = '#55676f';                                  // esquinas: el detalle que la hace "panel"
  for (const [cx2, cy2, dx, dy] of [[x, y, 1, 1], [x + w - 1, y, -1, 1], [x, y + h - 1, 1, -1], [x + w - 1, y + h - 1, -1, -1]]) {
    ctx.fillRect(cx2, cy2, dx * 2, 1); ctx.fillRect(cx2, cy2, 1, dy * 2);
  }
}

// EL CUENTAKILOMETROS SUELTO. Queda para el unico modo que no tiene NI objetivo NI record contra
// que medirse (PERSECUCION): ahi no hay cinta posible y el kilometraje vuelve a ser lo que era, un
// contador abierto arriba a la izquierda. Con objetivo o en POR LA PATRIA el numero vive adentro de
// la cinta (ver `cinta`), que es donde significa algo.
//
// Lo que lo hace instrumento y no marcador: el entero grande en ambar, la DECIMA chica y apagada
// adentro de su ventanita —el tambor de decimas de un odometro, que es la parte que se ve girar—
// y la unidad al costado. A 100 m/s la decima cambia una vez por segundo: es el unico numero del
// HUD que se mueve solo y sin que hagas nada, y de ahi le viene el peso.
const ODO_DEC = '#a2762f';   // el ambar del acento, apagado: misma familia, otro plano

/** EL PUNTAJE, en una placa como la del odometro (CICLO DE MUERTE: la cinta de arriba es del blanco). */
// LOS PUNTOS QUE SUMAN Y RESTAN, AL LADO DEL NUMERO (23/11, el autor: "que aparezcan desde abajo y se sumen hacia arriba
// en verde cuando suman, y se resten desde ahi partiendo desde el numero hacia abajo con el - y desaparezcan"). Cada salto
// del puntaje de mas de PTS_MIN (lo que va sumando el vuelo solo es de a poco: no cuenta) sale como un numerito: el que
// SUMA nace abajo y sube hasta el numero, verde, y se funde en el; el que RESTA sale del numero hacia abajo, rojo, y se
// apaga. Lo dibuja quien dibuja el puntaje (`ptsEn`: la placa de puntos o la cinta de POR LA PATRIA).
const PTS_MIN = 40, PTS_DUR = 1100, PTS_BAJA = 14;
const ptsFlot = [];
let ptsAntes = null;
function ptsEn(x, y, w) {
  const ahora = performance.now(), d = run.score - (ptsAntes ?? run.score);
  ptsAntes = run.score;
  if (Math.abs(d) >= PTS_MIN) ptsFlot.push({ n: Math.round(d), t0: ahora });
  ctx.save(); ctx.textAlign = 'center'; ctx.font = 'bold 7px monospace';
  for (let i = ptsFlot.length - 1; i >= 0; i--) {
    const f = ptsFlot[i], e = (ahora - f.t0) / PTS_DUR;
    if (e >= 1) { ptsFlot.splice(i, 1); continue; }
    const suma = f.n > 0, k = 1 - (1 - e) * (1 - e);   // (frena al llegar)
    const yy = suma ? y + PTS_BAJA - k * PTS_BAJA : y + k * PTS_BAJA;
    ctx.globalAlpha = suma ? (e < 0.75 ? 1 : (1 - e) / 0.25) : 1 - e;
    const txt = (suma ? '+' : '-') + Math.abs(f.n).toLocaleString('es-AR');
    ctx.fillStyle = '#0a0e11'; ctx.fillText(txt, x + w / 2 + 1, yy + 1);
    ctx.fillStyle = suma ? '#7fe07a' : P.warn; ctx.fillText(txt, x + w / 2, yy);
  }
  ctx.restore();
}
function drawPuntos(x, y) {
  const pts = String(Math.floor(run.score));
  ctx.font = 'bold 9px monospace';
  const w = Math.max(46, ctx.measureText(pts).width + 24);
  plate(x, y, w, 12);
  ctx.textAlign = 'left'; ctx.fillStyle = P.accent; ctx.fillText(pts, x + 4, y + 9);
  ptsEn(x + 4, y + 9, ctx.measureText(pts).width);
  ctx.font = F_ROT; ctx.fillStyle = P.dim; ctx.textAlign = 'right';
  ctx.fillText(T('hud_pts'), x + w - 3, y + 9);
}
/** LA AMENAZA (modos sueltos, 18/10): rotulo, el numero en su color —verde al arrancar, ambar, rojo al final—
 *  y una barrita de cinco que se llena hasta el siguiente nivel; en el tope dice MAX. `xd` = el borde DERECHO. */
const OLEADA_COL = ['#7fc8a0', '#c9c25a', P.accent, '#e0703c', P.warn];
function drawOleada(xd, y, o) {
  // (el autor, 18/10: "AMENAZA NV. 1, asi")
  const col = OLEADA_COL[Math.min(4, Math.floor(o.nivel * 5))], num = T('hud_oleadaNv') + ' ' + (o.max ? T('hud_oleadaMax') : String(o.n));
  ctx.font = F_ROT; const rw = ctx.measureText(T('hud_oleada')).width;
  ctx.font = 'bold 7px monospace'; const nw = ctx.measureText(num).width;
  const w = Math.ceil(3 + rw + 3 + nw + 3 + 14 + 3), x = xd - w;
  plate(x, y, w, 9);
  ctx.textAlign = 'left'; ctx.font = F_ROT; ctx.fillStyle = P.dim;
  ctx.fillText(T('hud_oleada'), x + 3, y + 6.5);
  ctx.font = 'bold 7px monospace'; ctx.fillStyle = col;
  ctx.fillText(num, x + 6 + rw, y + 7);
  for (let i = 0; i < 5; i++) px(x + w - 17 + i * 3, y + 3, 2, 3, o.max || o.frac * 5 > i ? col : '#2a3238');
}
function drawAtajoTaller(x, y, n) {
  const txt = n > 1 ? T('hud_reparar', { n }) : T('hud_reparar1');
  ctx.font = F_ROT; const w = Math.ceil(ctx.measureText(txt).width) + 8;
  plate(x, y, w, 9);
  ctx.textAlign = 'left'; ctx.fillStyle = Math.sin(run.t * 3) > -0.5 ? '#e8b04a' : P.dim;
  ctx.fillText(txt, x + 4, y + 6.5);
}
function drawOdo(x, y) {
  const km = Math.max(0, run.dist) / 1000;
  const ent = String(Math.floor(km)), dec = Math.floor((km - Math.floor(km)) * 10);
  plate(x, y, 46, 12);
  const ly = y + 9;
  ctx.textAlign = 'left';
  ctx.font = 'bold 9px monospace'; ctx.fillStyle = P.accent;
  ctx.fillText(ent, x + 4, ly);
  const wEnt = ctx.measureText(ent).width;
  // la ventanita del tambor: un recuadro apenas mas oscuro que la placa, del alto del digito
  px(x + 3 + wEnt, y + 2, 10, 8, '#141b20');
  ctx.font = '7px monospace'; ctx.fillStyle = ODO_DEC;
  ctx.fillText('.' + dec, x + 4 + wEnt, ly);
  ctx.font = F_ROT; ctx.fillStyle = P.dim; ctx.textAlign = 'right';
  ctx.fillText('KM', x + 43, ly);   // simbolo de unidad: es el mismo en los dos idiomas
}

// EL RITMO DEL TABLERO. Un instrumento mide INSTR de alto (rotulo + barra, ver bar()) y entre uno y
// otro va AIRE. Fueron el paso de las FILAS de placas de abajo hasta que las barras pasaron a
// relojes (10 y 11/9); AIRE sigue siendo el hueco entre cuadrados.
//
// Estuvo en 14 —o sea sin aire— porque 14 era justo lo que teselaba, y teselar era exactamente el
// problema: las placas se TOCABAN y cada columna se leia como un bloque oscuro partido en franjas
// en vez de como tres instrumentos separados (playtest 29/8, «estado y cañón están muy cerca»).
// Tres pixeles alcanzan: a esta escala un pixel es un pixel, y la placa ya trae su propio borde.
const AIRE = 3, INSTR = 14;
// …y el MARGEN contra el borde del cuadro, que es el mismo para las cuatro esquinas. Estaba en 3
// arriba a la izquierda, 4 abajo, 6 arriba a la derecha y 2 en el gas: cuatro numeros distintos
// para la misma decision. Como `bar()` dibuja su placa en x-2, una barra que empieza en
// MARGEN + 2 apoya su placa exactamente en el margen.
const MARGEN = 4;
// LA TIPOGRAFIA DEL TABLERO, en dos tamaños y no en uno. El ROTULO dice como se llama el
// instrumento —se lee una vez y despues ya lo sabes de memoria— y el VALOR es lo que se mira todo
// el tiempo. Estaban los dos en 6 px y el resultado era un tablero que gritaba los nombres tan
// fuerte como los numeros (playtest 29/8: «mas chicos los textos»). Con el rotulo en 5 el ojo va
// solo a lo que cambia. En la grilla de diseño 5 px caen en 15 reales (U 1.5 x SC 2 = 3 exacto),
// asi que no hay medio pixel: el tipo sigue siendo duro.
const F_ROT = '5px monospace', F_VAL = '6px monospace';
// LOS COLORES DE LAS ZONAS DE GASTO (PLAN_NAFTA_ALCANCE §3.6): ambar el que mas quema —el acento del
// juego, abajo, donde vive el rasante—, gris el medio, y frio el crucero alto, que es el barato.
// `rasante` es el AHORRO RASANTE (systems/nafta.js zona): no tenia color y la aguja salia sin uno
const GASTO_COL = { mayor: '#e8a33d', medio: '#8a9ba1', menor: '#6fabd8', rasante: '#7fe07a' };

/** LA ZONA DE GASTO EN EL CUADRADO DE LA NAFTA (27/9): dos flechas rojas para arriba si gasta de
 *  mas, un guion si gasta normal, dos verdes para abajo si ahorra (gasto menor o el ahorro del
 *  rasante). CHIQUITAS (27/9: "mucho mas chico"): cada flecha es 3 x 2 pixeles y las dos, con un
 *  pixel de aire, ocupan 3 x 5. `x, y` es la esquina de arriba a la izquierda. */
function flechasGasto(x, y, zona) {
  if (zona === 'medio') { px(x, y + 2, 3, 1, '#8a9ba1'); return; }   // el guion, a media altura
  const sube = zona === 'mayor', col = sube ? '#e2493a' : '#7fe07a';
  for (const dy of [0, 3]) {   // un pixel de aire entre las dos: pegadas se leian como una X
    // la punta (1 pixel) y la base (los dos costados): ^ para arriba, v para abajo
    px(x + 1, y + dy + (sube ? 0 : 1), 1, 1, col);
    px(x, y + dy + (sube ? 1 : 0), 1, 1, col); px(x + 2, y + dy + (sube ? 1 : 0), 1, 1, col);
  }
}

// LA VOZ CUELGA DE LA CINTA (playtest 10/9). El toast de radio y el panel ya no viven abajo, sobre
// el tablero: van DEBAJO DEL OBJETIVO y con SU MISMO ANCHO, porque lo que dice la radio es casi
// siempre sobre esa ruta —el buque, la costa, el que viene— y leerlo pegado al instrumento que lo
// explica es leerlo una vez sola.
//
// Para que "el mismo ancho" sea verdad en TODA mision, la cinta tiene un ANCHO MINIMO: el que
// necesita un renglon de radio (`VOZ_COLS` caracteres en cuerpo 5) mas el marco del toast. Con un
// buque de nombre largo la cinta ya es mas ancha y no pasa nada; con un objetivo de DISTANCIA (sin
// nombre, ~100 px) estira la linea de la ruta hasta ese minimo.
//
// El marco vive ACA y no en screens.js porque es parte de la cuenta del ancho de la cinta, y la
// cinta es de este archivo: si el toast engordara su busto sin que la cinta lo supiera, el
// renglon dejaria de entrar sin que nadie tocara el texto.
export const VOZ = { pad: 4, cara: 16, gap: 4, fila: 6, aire: AIRE, margen: MARGEN };
export function vozMin() {
  ctx.font = F_ROT;
  return Math.ceil(ctx.measureText('0'.repeat(VOZ_COLS)).width) + VOZ.pad * 2 + VOZ.cara + VOZ.gap;
}
// la caja que la cinta ocupo ESTE cuadro. Se borra al empezar cada HUD: una caja vieja, de un
// cuadro que ya paso, colgaria la radio de una cinta que no esta.
let cajaCinta = null;
let cajaZona = null;   // el ultimo lugar donde se dibujo ZONA RADAR / FUERA DE RADAR (zonaHud 'radar')
export const cintaCaja = () => cajaCinta;
// LA COLUMNA DERECHA, de arriba abajo, y las dos medidas juntas porque son la misma decision: los
// primeros 12 px de esa esquina NO son del canvas (ahi vive el boton de sonido, que es HTML — ver
// index.html), y debajo va el reloj del rasante cuando esta encendido. El gas vivio abajo de el,
// como corredera vertical, hasta el 11/9: ahora es un reloj de la fila de abajo.
const RELOJ_Y = 15;                  // la placa del reloj del rasante: 15..25

// LOS CUADRADOS DE ABAJO, ORDENADOS COMO LA CABINA DEL A-4 (playtest 11/9). Tres grupos, como en
// un tablero de verdad, con mas aire entre grupos que adentro de cada uno. Y el criterio no es por
// tema sino POR CUANTO SE MUEVE CADA AGUJA (pedido del autor), que es lo que decide cada cuanto hay
// que mirarlo:
//   IZQUIERDA  EL AVION Y EL QUE LO VUELA: SALUD, NAFTA y MACH, debajo de la cara del piloto. Son
//              los que casi no se mueven —se miran cada tanto, o cuando su borde titila— y SALUD va
//              en la esquina, pegada a la cara: ese rincon entero dice "yo y mi avion".
//   CENTRO     LO QUE VARIA RAPIDO: VELOCIDAD, el horizonte, ALTITUD y GAS. Es lo que se vigila
//              todo el tiempo, y por eso va adelante, en la "T" de toda cabina.
//   DERECHA    LO QUE SE CARGA: la CHANCHA, el CAÑON y el estante de MISILES. Se gastan y se
//              recuperan solos — se miran cuando los vas a usar.
// LA CARA DEL PILOTO no es un instrumento y ya no esta en la fila: va arriba de la esquina izquierda
// y de ahi sale su voz (ver drawPiloto y, en render/screens.js, drawVozPropia).
const CUADRO = 26, CUADROS_Y = H - MARGEN - CUADRO;
/** El x del cuadrado `i` de la fila, contando desde el margen izquierdo. Los cuatro de la izquierda
 *  salian de cuentas sueltas y el piloto y la nafta quedaron pisandose un pixel. */
// (19/11, el autor: "correr todos los cuadrados y dejar al piloto al mismo nivel inferior que el resto"): LA CARA
// BAJO A LA FILA, en la esquina, y los cuadrados empiezan despues de ella. Arriba de cada caja queda el lugar
// para los carteles que salen de atras (drawAvisosCaja). PIL_W = PILOTO.lado (que se declara mas abajo).
const PIL_W = 26;
const COL = i => MARGEN + PIL_W + AIRE + i * (CUADRO + AIRE);
// LOS RELOJES DEL VUELO (ver drawHUD): hasta donde llega cada escala, y el ancho del estante de
// misiles que les hizo lugar.
const SALTO_COL = '#ffd479';        // LA SUELTA: la altura que hay que saltar para pasar el buque
const SUELTA_COL = '#7fe07a';        // LA SUELTA: el verde de "es el momento de soltar"
// LA CARGA DE LA CHANCHA en el reloj de nafta (ver drawHUD): desde cuanto, hasta cuanto, cuando se solto
let cargaDesde = null, cargaHasta = 0, cargaFinT = 0;
const CARGA_FUNDE = 1.6;   // s: lo que tarda en apagarse el verde al desconectarse
const hexRgb = c => { const n = parseInt(c.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const alfaCol = (c, a) => 'rgba(' + hexRgb(c).join(',') + ',' + a.toFixed(3) + ')';
const mezclaCol = (a, b, t) => {
  if (a[0] !== '#' || b[0] !== '#') return t > 0.5 ? b : a;
  const A = hexRgb(a), B = hexRgb(b);
  return 'rgb(' + A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(',') + ')';
};
/** El titileo de "SOLTA AHORA": todo lo que se prende en verde lo hace con este mismo reloj, asi
 *  la cinta, el altimetro y el estante laten juntos y se leen como UNA señal. */
const titilaSuelta = () => Math.floor(performance.now() / 160) % 2 === 0;   // reloj de pared: late igual en camara lenta
const VEL_TOPE = 1400;              // km/h: pasa Mach 1 (1200) con aire; la postcombustion la clava
// El Mach arranca en 0,2 y no en 0,4: el crucero anda por 0,26 a 0,5, y con la escala en 0,4 la
// aguja pasaba media mision clavada en cero, que en un tablero se lee como un instrumento roto.
const MACH_DE = 0.2, MACH_A = 1.4;
// EL ESTANTE (8/10, el autor: "los dos tanques en un mismo slot con un 2, luego el misil, y debajo
// el espacio para las chapitas"): tres filas —el par de ala, el centro, las chapitas— y en cada una
// el icono con CUANTOS lleva al costado. 1 de aire, el icono de 10, 1, el numero de 3, 1 de aire.
const RACK_W = 16;
const BOMBA_W = 10;          // la bomba del estante: 10x5, al lado su numero
// LOS DOS MAXIMOS DEL AVION, en km/h: sin turbo y con turbo, con la racha y el tiempo de vuelo al
// tope y sin viento en contra. Son las dos marcas de la escala de velocidad (ver drawHUD). Salen de
// `speedTarget`, la misma cuenta con la que vuela: si algun dia cambia la fisica, las marcas la
// siguen solas. La postcombustion pasa el segundo tope — por eso la escala llega mas lejos que el.
const TOPE = [false, true].map(b => speedTarget({ t: 1e5, rasLevel: 4, mult: 10, windF: 1, boost: b, afterTier: 0 }) * KMH_U);
// DONDE VA CADA UNO (ver el orden de los grupos arriba). El grupo del vuelo se centra en el hueco
// entre los otros dos: aire igual a los dos lados, que se ve mejor que el horizonte clavado en el
// medio exacto de la pantalla (queda a siete pixeles).
const X_SALUD = COL(0), X_NAFTA = COL(1), X_MACH = COL(2);      // el grupo lento, bajo la cara
const X_CARGA = W - MARGEN - (2 * CUADRO + RACK_W + 2 * AIRE);  // el grupo que se carga, al borde
let tempX = 0;   // donde quedo el termometro en el ultimo cuadro (lo lee el foco de las lecciones)
const X_CHANCHA = X_CARGA, X_CANON = X_CARGA + (CUADRO + AIRE), X_RACK = X_CANON + (CUADRO + AIRE);
// (corrido 6 a la izquierda, 15/10, el autor: "corre un poco los elementos del medio a la izquierda" — para que
// el radar propio entre en el hueco de la derecha, entre el vuelo y lo que se carga)
// (19/11: centrado en el hueco, sin el corrimiento del radar propio — el radar subio arriba del grupo de la derecha)
// (23/11, el autor: "la idea era que ese sector —pegado a la altura— sea el RADAR, no por encima de los indicadores"):
// VELOCIDAD, horizonte, ALTITUD con el RADAR pegado a su costado (una barra angosta: un reloj entero no entra en
// los 320 de la fila) y GAS
// (la barra vertical del radar pegada a la ALTITUD se fue el 23/11 —el autor: "la barra vertical de radar no tiene
// sentido"—: el radar se lee en el altimetro, en la escala verde del techo para arriba)
const X_VUELO = Math.round((COL(2) + CUADRO + X_CARGA - (4 * CUADRO + 3 * AIRE)) / 2);
const FIN_VUELO = X_VUELO + 4 * CUADRO + 3 * AIRE;
const xVuelo = i => X_VUELO + i * (CUADRO + AIRE);   // VELOCIDAD, horizonte, ALTITUD, GAS

/** LO MAS ALTO QUE PINTA EL TABLERO DE VUELO: el canto de los cuadrados. Fue el de la fila de placas
 *  de SALUD, cuatro pixeles mas arriba, hasta que SALUD paso a ser un cuadrado.
 *
 *  Se EXPORTA para que la banda de la voz (render/screens.js) no tenga que copiar el numero. Lo
 *  copiaba, y la copia se pudrio: decia 110 porque la escribio la epoca en que RASANTE y MOMENTUM
 *  eran la cuarta y la quinta barra de la pila de la izquierda. Desde entonces se mudaron dos
 *  veces y el toast siguio esquivando un instrumento que ya no estaba ahi. Con esto, el dia que
 *  las filas se muevan otra vez, la banda se mueve con ellas. */
export const HUD_TECHO = CUADROS_Y;

/** LAS ZONAS DEL HUD, POR NOMBRE, en la grilla de DISEÑO. Es lo que el FOCO de las lecciones deja
 *  sin velo (M1_CAMBIOS 8), y sale de las MISMAS constantes con que se dibuja cada instrumento: si
 *  un reloj se muda, su foco se muda con el. `ruta` depende del cuadro (el ancho de la cinta sale
 *  de su contenido), asi que vale la del ultimo `drawHUD`. Devuelve null si el nombre no existe. */
const Z_RELOJ = { salud: X_SALUD, nafta: X_NAFTA, mach: X_MACH, vel: xVuelo(0), horizonte: xVuelo(1),
  alt: xVuelo(2), gas: xVuelo(3), chancha: X_CHANCHA, canon: X_CANON };
// EN CABINA cada reloj vive en su hueco del tablero (alTablero): su zona es ESE hueco, no el cuadro de la fila —si
// no, los bordes rojos de los avisos y sus lengüetas caian en cualquier lado del tablero (20/11, el autor: "dentro
// de la cabina algunas cosas se superponen, los bordes rojos a veces se superponen")
const ANCLA_DE = { salud: 'salud', nafta: 'nafta', mach: 'mach', vel: 'velocidad', horizonte: 'adi', alt: 'altitud', gas: 'gas',
  chancha: 'chancha', canon: 'canon', rack: 'rack' };
// LA CHANCHA ES UN ICONO (21/11): su zona es el circulo de arriba de la nafta; la fila es de la temperatura
const CHANCHA_ICONO = true;
export function zonaHud(id) {
  if (CHANCHA_ICONO && id === 'chancha' && !enCabina()) return { x: X_NAFTA + CUADRO - 11, y: CUADROS_Y - 1, w: 12, h: 12, redondo: true };
  if (id === 'temp' && !enCabina()) return { x: tempX, y: CUADROS_Y, w: CUADRO, h: CUADRO };
  const an = enCabina() && ANCLA_DE[id] ? CABINA_ANCLAS[ANCLA_DE[id]] : null;
  if (an) return an.length === 4 ? { x: an[0] / U, y: an[1] / U, w: (an[2] - an[0]) / U, h: (an[3] - an[1]) / U }
    : { x: (an[0] - an[2]) / U, y: (an[1] - an[2]) / U, w: 2 * an[2] / U, h: 2 * an[2] / U, redondo: true };
  if (id in Z_RELOJ) return { x: Z_RELOJ[id], y: CUADROS_Y, w: CUADRO, h: CUADRO };
  if (id === 'temp') return { x: X_MACH, y: CUADROS_Y - CUADRO - 4, w: CUADRO, h: CUADRO };   // el termometro (drawTemperatura)
  if (id === 'rack') return { x: X_RACK, y: CUADROS_Y, w: RACK_W, h: CUADRO };
  if (id === 'ruta') return cajaCinta ? { x: cajaCinta.x, y: MARGEN, w: cajaCinta.w, h: 11 } : null;
  if (id === 'radar') return cajaZona;   // (21/11, el autor: "no se explican que el indicador es la zona de radar")
  return null;
}

/** Barra con marco, bisel y muescas cada 25%. El relleno pierde el ultimo pixel del marco.
 *
 *  LA PLACA INCLUYE EL ROTULO. Antes cubria solo la barra y el nombre quedaba escrito directo
 *  sobre el mundo: en las esquinas de abajo eso funciona —el mar y la tierra son oscuros— pero
 *  RASANTE y MOMENTUM se mudaron arriba a la derecha, contra el cielo del amanecer, y ahi el gris
 *  del rotulo desaparecia. Un instrumento que solo se lee sobre fondo oscuro no es un instrumento.
 *  Los 14 px de alto ademas TESELAN con el paso de 14 con que se apilan las barras: se tocan y no
 *  se pisan. */
function bar(x, y, w, val, c, label) {
  plate(x - 2, y - 9, w + 4, INSTR);
  const fw = Math.round(w * Math.max(0, Math.min(1, val)));
  px(x, y, fw, 3, c);
  if (fw > 1) { ctx.globalAlpha = 0.4; px(x, y, fw, 1, '#f2f7fb'); ctx.globalAlpha = 1; }   // bisel
  ctx.fillStyle = '#0a0e11';                                  // muescas de escala
  for (let i = 1; i < 4; i++) ctx.fillRect(x + Math.round(w * i / 4), y, 1, 3);
  ctx.fillStyle = P.dim; ctx.font = F_ROT; ctx.textAlign = 'left';
  ctx.fillText(label, x, y - 4);
}

/** ¿SE DIBUJA ESTE INSTRUMENTO? `algo` es si el instrumento tiene algo que decir AHORA MISMO.
 *
 *  Con el TABLERO COMPLETO (el default) contesta que si a todo y el HUD es el de siempre: esta
 *  funcion no hace nada, ni siquiera lee el argumento en la practica.
 *
 *  Con el TABLERO POR DEMANDA (PLAN_UI D) un instrumento SANO no se dibuja. La idea es que la
 *  aparicion pase a ser el dato: si algo esta en pantalla, es porque hay algo que hacer. En reposo
 *  quedan las cuatro cosas que se miran igual —velocidad y altura, el gas, la ruta y el escuadron—
 *  mas los dos rieles, que ocupan dos pixeles y no le sacan lugar a nadie.
 *
 *  LO QUE NO SE OCULTA NUNCA, y no es olvido: el ADI (la pregunta "¿donde esta el suelo?" es
 *  accionable siempre, sobre todo rolado), la velocidad y la altura (los dos numeros que deciden
 *  todo el vuelo), el gas (es lo unico que se OPERA y no se lee) y la ruta.
 *
 *  Y NO HAY HISTERESIS a proposito, porque no hace falta: la nafta, la integridad y los misiles
 *  solo bajan, y el medidor de la chancha solo sube, asi que cada umbral se cruza UNA vez. El unico
 *  que va y viene es el calor del cañon, y por eso su umbral esta en 0,05 y no en 0 — abajo de ahi
 *  la barra ya no muestra nada y el instrumento se apaga una sola vez, al final del enfriado. */
function pide(algo, id) { return cfg.hudAuto !== 'auto' || algo || (!!id && focoIds.includes(id)); }
// LO QUE UNA LECCION ESTA ENFOCANDO (llega por snapshot en `h.foco`). Un reloj que el HUD automatico
// esconde —el cañon frio, la nafta llena— se dibuja igual si lo estan explicando: enfocar un hueco
// vacio seria mostrarle al jugador donde NO hay nada.
let focoIds = [];

/** UN RIEL: la barra de un poder de racha, pegada a un borde y creciendo de abajo hacia arriba.
 *
 *  Sin rotulo, sin placa y sin numero, a proposito. Un riel no se LEE: se vigila de reojo, que es
 *  un trabajo distinto — a la periferia le llegan el movimiento y el contraste, no el texto. El
 *  rotulo de 5 px que tenian estas dos barras arriba a la derecha era tinta gastada en algo que
 *  nadie miraba de frente, y el numero tampoco se leia nunca.
 *
 *  A cambio, el recorrido pasa de 44 px a la ALTURA ENTERA de la pantalla. La misma cantidad de
 *  informacion, ocho veces mas larga y en el unico lugar donde no compite con nada: el margen del
 *  HUD es 4, asi que de x 0 a 3 (y de 316 a 319) no se dibuja nada mas en todo el juego. */
// LOS DOS PODERES, ARRIBA DE LA CARA (playtest 12/9). RASANTE y MOMENTUM son las dos cosas que el
// JUGADOR puede hacer —no del avion: del que lo vuela—, asi que viven pegados a su cara y no en los
// bordes de la pantalla, que es donde estuvieron desde el 10/9 y donde hubo que preguntar dos veces
// que eran. Cada uno tiene SU COLOR y con eso alcanza: NARANJA el momentum, CELESTE DE MAR el
// rasante (pedido del autor), que es de lo que trata cada poder.
//
// Lo que dice la barra cambia con el estado, como cuando eran rieles: apagada es CUANTO FALTA para
// tenerlo, encendida es CUANTO QUEDA. Llena parpadea LENTO ("ya lo podes usar", el mismo idioma que
// la Chancha verde) y encendida parpadea RAPIDO (se esta gastando).
// Cada poder va con DOS TONOS SUYOS, y el parpadeo alterna entre ellos. Con blanco los dos
// terminaban blancos cuando estaban llenos, que es justo cuando mas importa saber CUAL se lleno.
// Cada poder con TRES tonos suyos: el de la barra, el claro de la ola y el OSCURO del borde cuando
// esta llena (12/9). El borde propio es lo que hace que "cargado" se vea de reojo sin mirar adentro.
const RAS_COL = '#57b6e0', RAS_CLARO = '#bfe8fb', RAS_OSCURO = '#2d6f8f';   // celeste de mar
// …Y EL CUARTO ROTULO DE LA NAFTA, que no es una zona sino un premio: volar bajo SOSTENIENDO el
// rasante te cobra el vuelo normal (RAS_GASTO_F). Va en el AZUL del rasante —un color por idea:
// azul es el rasante (pedido del autor, 15/9)— porque lo que se lee es "esto te lo esta dando el
// rasante". Se asigna ACA y no con los otros tres de GASTO_COL, mas arriba: RAS_COL es un const
// que todavia no existe en esa linea, y leerlo ahi tira el modulo entero al cargar.
GASTO_COL.rasante = RAS_COL;
// EL MOMENTUM ES AMARILLO (15/9). Era el naranja del acento, y el acento se usa en todo el
// tablero para cosas que NO son poderes —el reloj de la ventana, el del escondite, la nafta, los
// avisos—. Con los dos poderes teniendo color propio (el rasante azul, este amarillo), el naranja
// queda libre para significar una sola cosa: tiempo y avisos. Un color por idea.
const MOM_COL = '#e8cf3d', MOM_CLARO = '#fff0a0', MOM_OSCURO = '#8a7a1f';
// EL NOMBRE VA ADENTRO (pedido del autor, 12/9): la barra mide 7 de alto para que entre el rotulo de
// 5, y el rotulo se dibuja DOS VECES con recorte — oscuro sobre lo lleno y claro sobre lo vacio—,
// que es como se lee una barra con texto adentro sin que el texto pelee con el relleno.
// La barra vive ADENTRO DE UNA PLACA, la misma de todo el tablero (`plate`): mismo borde y mismas
// esquinas que el cuadro del piloto, que es con quien comparte la esquina (pedido del autor, 12/9).
const PODER_H = 7, PODER_W = CUADRO - 2;   // el relleno, adentro de la placa de 26
// LISTO ES UNA OLA, NO UN PARPADEO (pedido del autor, 12/9): una cresta clara que cruza la barra de
// izquierda a derecha y va PRENDIENDO LAS LETRAS a su paso. Un parpadeo apaga y prende todo a la
// vez —y encima es el idioma de la alarma—; la ola dice "cargado y en marcha" sin gritar, y de paso
// lee para donde va: hacia adelante.
const ONDA_W = 8, ONDA_S = 1.5;      // ancho de la cresta y segundos que tarda en cruzar
const GLIFO = 3;                     // lo que mide una letra del rotulo (5 px monospace)
const RACHA_W = 24;                  // los px utiles de la barra de racha: lo que mide PERFECTO
// EL TITILEO DEL TOQUE ERRADO: cuanto dura y a que ritmo. 0,4 s a ~9,5 Hz son unos cuatro
// parpadeos —se ve sin dudas— y termina antes del cruce siguiente, que a la velocidad de la meseta
// llega a los 0,24 s… asi que a veces se pisan: es a proposito, el que erro tiene que ver que la
// aguja sigue viniendo mientras todavia le parpadea el error.
const AGU_ERR_T = 0.4, AGU_ERR_HZ = 60;
// EL CARTELITO DE «LISTO» (12/9). Cuando un poder termina de cargarse, la palabra sale de ATRAS
// de su barra hacia la derecha, se queda 3 segundos y se vuelve a meter por donde salio. Antes era
// un popup en el centro de la pantalla —«! MOMENTUM LISTO — [4] !»—: avisaba lejos de la cosa de la
// que hablaba, y tapaba el mar justo arriba del avion. Es la misma entrada que la palabra RADAR.
//
// El reloj sale de `run.t` (el HUD no recibe dt) y cada poder lleva el suyo, porque los dos
// cartelitos se dibujan en el mismo cuadro y un reloj compartido le daria dt 0 al segundo.
const LISTO_S = 3, LISTO_ENTRA = 0.22;
// EL AVISO usa la MISMA lengueta que LISTO, con otra palabra y otro color. Es deliberado: el
// jugador ya aprendio que de atras de esa barra sale lo que esa barra tiene para decir, y un
// cartel nuevo en otro lado seria una segunda cosa que aprender para el mismo poder.
const AVISO_S = 1.6;
const listos = [{ k: 0, q: 0, lleno: false, t: -1 }, { k: 0, q: 0, lleno: false, t: -1 }];
/** `aviso` (opcional) = { t0, txt, col }: mientras dura, PISA al LISTO — misma entrada, otra
 *  palabra, otro color. `t0` es un instante de `run.t`; negativo = nunca paso. */
function tabListo(i, y, h, lleno, col, aviso) {
  const L = listos[i];
  const dt = L.t < 0 || run.t < L.t ? 0 : Math.min(0.1, run.t - L.t);
  L.t = run.t;
  // EL AVISO MANDA mientras esta vivo, y por eso se resuelve ANTES que el flanco de `lleno`: si
  // no, la rama de abajo le apagaria la cola justo cuando el poder se gasta.
  const resta = aviso && aviso.t0 >= 0 ? AVISO_S - (run.t - aviso.t0) : -1;
  const avisando = resta > 0;
  if (avisando) L.q = Math.max(L.q, resta);
  else {
    if (lleno && !L.lleno) L.q = LISTO_S;    // EL FLANCO: se acaba de llenar, y solo entonces
    if (!lleno) L.q = 0;                     // se gasto: el cartel se va con el poder
  }
  L.lleno = lleno;
  L.q = Math.max(0, L.q - dt);
  L.k = L.q > 0 ? Math.min(1, L.k + dt / LISTO_ENTRA) : Math.max(0, L.k - dt / LISTO_ENTRA);
  if (L.k <= 0) return;
  const txt = avisando ? aviso.txt : T('poder_listo');
  ctx.font = 'bold 5px monospace'; ctx.textAlign = 'left';
  // EL ANCHO SALE DEL TEXTO y no de una constante: el aviso es mas largo que LISTO, y con el ancho
  // fijo la palabra salia cortada por el propio recorte de la lengueta.
  const tw = Math.round(ctx.measureText(txt).width) + 4;
  const e = 1 - Math.pow(1 - L.k, 3);        // sale rapido y frena al llegar, como el radar
  // (en cabina la barra esta contra el borde DERECHO: la lengueta sale para la izquierda)
  const der = enCabina();
  const dx = Math.round((der ? 1 : -1) * (1 - e) * tw);
  const xt = der ? PIL_X() : MARGEN + CUADRO;   // el borde de la barra: de ahi sale
  // el recorte empieza EN el borde de la barra, asi que la placa del cartel entra sin su columna
  // izquierda: se lee como una lengueta de la barra y no como una caja aparte.
  ctx.save(); ctx.beginPath(); ctx.rect(der ? xt - tw - 2 : xt, y - 2, tw + 2, h + 4); ctx.clip();
  const x0 = der ? xt - tw + dx : xt - 1 + dx;
  plate(x0, y, tw + 1, h);
  ctx.font = 'bold 5px monospace'; ctx.textAlign = 'left';
  ctx.fillStyle = avisando ? aviso.col : col;
  ctx.fillText(txt, x0 + 3, y + h - 3);
  ctx.restore();
}

/** LA PUNTA QUE SE QUEMA. Unas chispas en el borde del relleno, mientras el poder se GASTA: es lo
 *  que convierte una barra que baja en algo que se consume. Dos colores —uno blanco y el del poder—
 *  porque con uno solo se lee como un borde mal dibujado y no como fuego.
 *
 *  SIN ESTADO A PROPOSITO. La posicion de cada chispa sale de `run.t` y de un hash de su indice, no
 *  de una lista que haya que crear, avanzar y limpiar. A esta escala —cinco pixeles que viven un
 *  tercio de segundo— un sistema de particulas de verdad seria toda la maquinaria para nada, y
 *  ademas habria que acordarse de vaciarlo en cada reset. */
function chispas(x, y, h, c1, c2) {
  for (let i = 0; i < 5; i++) {
    const s = run.t * 3.4 + i * 0.41;
    const vida = s - Math.floor(s);                       // 0..1: nace en el borde y se apaga
    const n = Math.sin((i * 12.9898 + Math.floor(s) * 78.233) * 437.585);
    const r = n - Math.floor(n);
    ctx.globalAlpha = Math.max(0, 1 - vida) * 0.9;
    px(Math.round(x + vida * 3 - 1), Math.round(y + r * h - vida * 2), 1, 1, i % 2 ? c1 : c2);
  }
  ctx.globalAlpha = 1;
}

/** LA BARRA DE CONCENTRACION, al lado del avion. Es `barraPoder` en chico: el rotulo va ADENTRO y
 *  se dibuja en DOS PASADAS con recorte —oscuro sobre lo lleno, apagado sobre lo vacio— asi las
 *  letras se van prendiendo a medida que el relleno las alcanza. Eso es lo que hace que una barra
 *  con una palabra adentro se lea sin leerla: lo que importa es hasta donde llego el color.
 *
 *  Sin placa ni borde: pegada al avion, una placa seria una mancha (la misma razon por la que la
 *  palabra PERFECTO perdio su recuadro). */
function barraConc(x0, y0, w, h, frac, col, rot) {
  px(x0, y0, w, h, '#2e3c45');
  const fw = Math.round(w * Math.max(0, Math.min(1, frac)));
  if (fw > 0) px(x0, y0, fw, h, col);
  if (fw > 1) { ctx.globalAlpha = 0.4; px(x0, y0, fw, 1, '#f2f7fb'); ctx.globalAlpha = 1; }
  // EN NEGRITA, igual que la palabra suelta: pegada al avion y a 5 px, la normal se deshilacha
  // sobre el mar. Las de `barraPoder` siguen finas — esas viven sobre una placa que las sostiene.
  // El monospace no cambia de avance al engrosar, asi que el paso y el centrado no se mueven.
  ctx.font = 'bold ' + F_ROT; ctx.textAlign = 'left';
  const ty = y0 + h - 1, n = rot.length;
  const paso = Math.max(3, Math.min(4, Math.floor((w - 2 - GLIFO) / Math.max(1, n - 1))));
  const rx = x0 + Math.floor((w - (GLIFO + paso * (n - 1))) / 2);
  const pasada = (cx, cw, color) => {
    if (cw <= 0) return;
    ctx.save(); ctx.beginPath(); ctx.rect(cx, y0, cw, h); ctx.clip();
    ctx.fillStyle = color;
    for (let i = 0; i < n; i++) ctx.fillText(rot[i], rx + i * paso, ty);
    ctx.restore();
  };
  pasada(x0, fw, '#0a1015');
  pasada(x0 + fw, w - fw, '#8a9ba1');
}

// ---- LO QUE CUESTA USAR (modos sueltos): el -N sube y se apaga arriba de lo que se uso, en su color ----
const COSTO_DE = { momentum: { col: '#e8cf3d' }, chancha: { col: '#e8a34a' }, radar: { col: '#5ab4ff' }, chapitas: { col: '#c8d4dc' } };
const COSTO_DUR = 1600;   // ms
const donde = { momentum: null, chancha: null, radar: null, chapitas: null };   // el centro de cada uno, lo anota el que lo dibuja
function drawCostos() {
  const l = run.costos;
  if (!l || !l.length) return;
  const ahora = performance.now();
  for (let i = l.length - 1; i >= 0; i--) {
    const c = l[i], e = (ahora - c.t0) / COSTO_DUR;
    if (e >= 1) { l.splice(i, 1); continue; }
    const p = donde[c.accion] || [W / 2, CUADROS_Y];
    ctx.globalAlpha = e < 0.7 ? 1 : (1 - e) / 0.3;
    ctx.font = 'bold 7px monospace'; ctx.textAlign = 'center';
    ctx.fillStyle = '#0a0e11'; ctx.fillText('-' + c.n, p[0] + 1, p[1] - 3 - e * 10 + 1);
    ctx.fillStyle = (COSTO_DE[c.accion] || {}).col || P.warn; ctx.fillText('-' + c.n, p[0], p[1] - 3 - e * 10);
    ctx.globalAlpha = 1; ctx.textAlign = 'left';
  }
}
function barraPoder(px0, py0, val, col, claro, oscuro, on, lista, rot) {
  const c = on ? (Math.sin(run.t * 14) > 0 ? claro : col) : col;
  plate(px0, py0, CUADRO, PODER_H + 2);
  const x = px0 + 1, y = py0 + 1;
  px(x, y, PODER_W, PODER_H, '#2e3c45');
  const fw = Math.round(PODER_W * Math.max(0, Math.min(1, val)));
  if (fw > 0) px(x, y, fw, PODER_H, c);
  if (fw > 1) { ctx.globalAlpha = 0.4; px(x, y, fw, 1, '#f2f7fb'); ctx.globalAlpha = 1; }   // bisel
  // LA PUNTA SE QUEMA MIENTRAS SE GASTA, igual que la del rasante y por el mismo motivo: una barra
  // que baja sola se lee como que se descarga, una que se quema se lee como que la estas usando.
  if (on && fw > 0) chispas(x + fw, y, PODER_H, '#ffffff', MOM_COL);
  // LA OLA, solo cuando esta lista y todavia no se uso: cruza el relleno de punta a punta
  const onda = lista && !on ? x - ONDA_W + ((run.t % ONDA_S) / ONDA_S) * (PODER_W + ONDA_W * 2) : null;
  if (onda !== null) {
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, fw, PODER_H); ctx.clip();
    px(onda, y, ONDA_W, PODER_H, claro);
    ctx.restore();
  }
  // EL ROTULO, en tres pasadas con recorte: oscuro sobre lo lleno, claro sobre lo vacio, y BLANCO
  // adentro de la ola — que es lo que hace que las letras se prendan cuando la cresta les pasa.
  // LAS LETRAS, UNA POR UNA Y CON PASO ENTERO (pedido del autor): el espacio entre letras es
  // SIEMPRE EL MISMO. Repartirlas en celdas de ancho fraccionario daba huecos de 1 px desparejos
  // —el redondeo de cada letra caia distinto—, que es justo lo que se ve feo a esta escala. El paso
  // es el mas grande que entra en la barra, y el bloque va centrado.
  ctx.font = F_ROT; ctx.textAlign = 'left';
  const ty = y + PODER_H - 2, n = rot.length;
  const paso = Math.max(3, Math.min(4, Math.floor((PODER_W - 2 - GLIFO) / Math.max(1, n - 1))));
  const anchoRot = GLIFO + paso * (n - 1), rx = x + Math.floor((PODER_W - anchoRot) / 2);
  const pasada = (x0, w0, col2) => {
    if (w0 <= 0) return;
    ctx.save(); ctx.beginPath(); ctx.rect(x0, y, w0, PODER_H); ctx.clip();
    ctx.fillStyle = col2;
    for (let i = 0; i < n; i++) ctx.fillText(rot[i], rx + i * paso, ty);
    ctx.restore();
  };
  pasada(x, fw, '#0a1015');
  pasada(x + fw, PODER_W - fw, '#8a9ba1');
  if (onda !== null) pasada(Math.max(x, onda), Math.min(x + fw, onda + ONDA_W) - Math.max(x, onda), '#ffffff');
  // LLENA: el borde de la placa se pone del color del poder, oscurecido
  if (lista) bordePlaca(px0, py0, CUADRO, PODER_H + 2, oscuro);
}

// ---------- HORIZONTE ARTIFICIAL (ADI) ----------
// El instrumento que contesta las dos preguntas que un avion rolado deja abiertas: DONDE ESTA EL
// SUELO y PARA DONDE QUEDA ARRIBA. Funciona como el de verdad: el simbolito del avion esta CLAVADO
// en el centro (arriba del avion es siempre el tope del instrumento) y lo que gira es la BOLA.
//
// Se dibuja SIEMPRE, no solo con el horizonte giratorio prendido: con HORIZONTE FIJO el mundo no
// se inclina nunca, asi que esto pasa a ser el unico lugar donde mirar como venis. El angulo sale
// de attitude() (core/horizon.js) — el alabeo REAL del avion, el mismo numero con el que gira el
// mundo durante una pirueta.
//
// VA EN EL CENTRO DE LA "T" (11/9): en toda cabina el horizonte esta adelante del piloto, con la
// velocidad a su izquierda y la altitud a su derecha. Fue la esquina de abajo a la izquierda desde
// que existe, cuando los instrumentos se juntaban en las esquinas para dejar limpio el centro; desde
// que el tablero es una fila entera, el centro de la fila es el lugar del instrumento principal.
// CUADRADO CON EL RESTO: su placa es la misma de 26 de todos los relojes.
const ADI = { cx: xVuelo(1) + 13, cy: CUADROS_Y + 13, r: 10 };
// LA BOLA EN PIXELES REALES (9/10, el autor: "los indicadores estan perfectos, falta mejorar este"): se
// pinta como los relojes y las balas — un tercio del pixel de diseño, sin antialias —, asi el borde es
// redondo y no un serrucho. Cielo y tierra van en TRES BANDAS cada uno (mas claros contra el horizonte,
// como la bola de verdad que refleja la luz de la cabina), con la ESCALERA de cabeceo, la escala de
// ALABEO fija arriba con el indice que gira con la bola, y el avioncito con borde, como la aguja.
const ADI_SKY = ['#5b93b8', '#3c6c8e', '#2d5574'], ADI_GND = ['#86603a', '#6b4a2a', '#53391f'];
const ADI_LINE = '#f2f7fb', ADI_ARO = '#0a0e11', ADI_ESCALA = '#8c9ca4';
const ADI_ALABEO = [-60, -30, -20, -10, 10, 20, 30, 60].map(g => g * Math.PI / 180);   // las marcas de arriba

function drawADI() {
  const { cx, cy, r } = ADI;
  plate(cx - 13, cy - 13, CUADRO, CUADRO);
  const a = -attitude();                    // la bola gira al REVES que el avion, como la de verdad
  const sa = Math.sin(a), ca = Math.cos(a);
  // CABECEO: trepar baja el horizonte (el avion queda por encima), picar lo sube. 5 px = medio
  // radio a cabeceo pleno — suficiente para leerlo sin que el suelo se vaya de la bola.
  const po = Math.max(-1, Math.min(1, plane.pitch)) * 5;
  // el centro de la bola cae en el centro del pixel (cx, cy), como la bola de pixeles de antes
  const ox = cx + 0.5, oy = cy + 0.5, R = r + 0.5;
  const i0 = Math.floor((ox - R) / FINO), i1 = Math.ceil((ox + R) / FINO);
  const j0 = Math.floor((oy - R) / FINO), j1 = Math.ceil((oy + R) / FINO);
  for (let j = j0; j < j1; j++) {
    let tramo = null, desde = i0;
    for (let i = i0; i <= i1; i++) {
      let col = null;
      if (i < i1) {
        const dx = (i + 0.5) * FINO - ox, dy = (j + 0.5) * FINO - oy, rr = Math.hypot(dx, dy);
        if (rr <= R) {
          const d = -dx * sa + dy * ca - po;      // distancia con signo al horizonte (+ = tierra)
          const t = dx * ca + dy * sa;            // a lo largo del horizonte
          if (rr > R - FINO) col = ADI_ARO;       // el canto de la bola
          else if (Math.abs(d) < 0.45) col = ADI_LINE;
          // LA ESCALERA: a 2,5 y 5 del horizonte, de los dos lados; las largas a 5
          else if ((Math.abs(Math.abs(d) - 2.5) < FINO * 0.55 && Math.abs(t) < 1.8)
            || (Math.abs(Math.abs(d) - 5) < FINO * 0.55 && Math.abs(t) < 3.2)) col = d < 0 ? '#c9dceb' : '#d8c3a5';
          else {
            const k = Math.abs(d) < 2 ? 0 : Math.abs(d) < 6 ? 1 : 2;   // tres bandas: claro contra el horizonte
            col = d > 0 ? ADI_GND[k] : ADI_SKY[k];
          }
          // EL INDICE DE ALABEO: un triangulito blanco en el "arriba" de la bola, que gira con ella
          const ua = dx * sa - dy * ca, ub = dx * ca + dy * sa;   // ua: hacia el cielo de la bola
          if (ua > R - 3.2 && ua < R - 1.2 && Math.abs(ub) < (ua - (R - 3.2)) * 0.55) col = ADI_LINE;
        }
      }
      if (col !== tramo) {
        if (tramo) { ctx.fillStyle = tramo; ctx.fillRect(desde * FINO, j * FINO, (i - desde) * FINO, FINO); }
        tramo = col; desde = i;
      }
    }
  }
  // LA ESCALA DE ALABEO, fija sobre el canto: 10, 20, 30 y 60 a cada lado, finas (las de 30 y 60 mas
  // largas); el cero es la muesca naranja, que no llega al borde de la placa
  for (const g of ADI_ALABEO) {
    const larga = Math.abs(g) > 0.5;
    marcaFina(ox, oy, -Math.PI / 2 + g, R + 0.3, R + (larga ? 1.6 : 1), 1, ADI_ESCALA);
  }
  marcaFina(ox, oy, -Math.PI / 2, R + 0.3, R + 1.6, 3, P.accent);   // la muesca de las 12: donde queda ARRIBA
  // EL AVIONCITO, fijo: las dos alas y el punto del centro, en naranja con borde — como la aguja —.
  // Es la referencia contra la que se lee la bola: si esta sobre el marron, venis con la trompa abajo.
  avioncitoAdi(ox, oy);
}
/** El simbolo del avion del horizonte: alas con su caida a los costados y el centro, con borde. */
function avioncitoAdi(ox, oy) {
  const dentro = (dx, dy) => {
    const ax = Math.abs(dx);
    if (ax >= 2.6 && ax <= 7.4 && Math.abs(dy) <= 0.5) return true;                  // las alas
    if (ax >= 2.6 && ax <= 3.3 && dy > 0 && dy <= 1.6) return true;                  // su caida hacia adentro
    return Math.hypot(dx, dy) <= 0.9;                                                // el centro
  };
  const R = 8.2;
  const i0 = Math.floor((ox - R) / FINO), i1 = Math.ceil((ox + R) / FINO);
  const j0 = Math.floor((oy - 2) / FINO), j1 = Math.ceil((oy + 3) / FINO);
  const borde = (dx, dy) => dentro(dx + FINO, dy) || dentro(dx - FINO, dy) || dentro(dx, dy + FINO) || dentro(dx, dy - FINO);
  for (let j = j0; j < j1; j++) for (let i = i0; i < i1; i++) {
    const dx = (i + 0.5) * FINO - ox, dy = (j + 0.5) * FINO - oy;
    const col = dentro(dx, dy) ? (dy < -0.15 ? '#ffd08a' : P.accent) : borde(dx, dy) ? AGUJA_BORDE : null;
    if (col) { ctx.fillStyle = col; ctx.fillRect(i * FINO, j * FINO, FINO, FINO); }
  }
}

// ---------- EL RELOJ: un cuadrado con aguja, hermano del horizonte ----------
// La misma caja de 26 y el mismo lenguaje: arco de escala arriba, aguja desde el eje, icono abajo a
// la izquierda y el numero abajo a la derecha. Analogico para leer de un vistazo (donde apunta) y
// con numero para decidir (cuanto exactamente).
//
// El arco barre media vuelta, de 180 a 360 grados: vacio a la izquierda, lleno a la derecha, y el
// medio arriba. La mitad de abajo queda libre a proposito — ahi viven el icono y el numero.
// EL BORDE QUE TITILA (playtest 11/9): cuando la aguja de un reloj entra en su valor CRITICO —el
// mismo que ya marcaba su zona roja—, el borde de la placa se prende en rojo y titila. La aguja ya
// se ponia roja, pero una aguja de ocho pixeles se ve si la estas mirando; un borde entero que
// parpadea se ve DE REOJO, que es como se mira un tablero mientras se vuela. Todos titilan EN FASE
// (el mismo reloj): dos alarmas a la vez se leen como una alarma, no como un arbolito.
const CRIT_HZ = 3;
// EL VERDE DE "LISTA" (playtest 12/9): cuando la Chancha llega al 100% deja el ambar y se pone
// VERDE —aguja, numero, icono y borde—, y en vez de TITILAR (que es el idioma del peligro, ver
// bordeCritico) PARPADEA LENTO: dos tonos del mismo verde, ciclo de casi tres segundos, que es lo
// que hace una luz de "listo" en un tablero de verdad.
const LISTO_HZ = 2.2, LISTO = ['#7fe08d', '#3b7d47'];
const verdeListo = () => LISTO[Math.sin(run.t * LISTO_HZ) > 0 ? 0 : 1];

// EL VIDRIO ROTO (playtest 11/9): un reloj que ya no puede decir lo que decia se dibuja RAJADO. Hoy
// lo usa la velocidad cuando la averia le saco el turbo para siempre — la marca naranja del tope con
// turbo desaparece, y el vidrio partido dice por que.
//
// ES UN IMPACTO, NO UNA RAYA. La primera version eran lineas largas y derechas que cruzaban el
// centro, y a 26 px se leian como OTRA AGUJA. Ahora hay un punto de impacto arriba a la izquierda
// —arriba a la izquierda, lejos del eje y del numero, y sin llegar al recorrido de la aguja— con
// astillas cortas y quebradas alrededor, mas dos esquirlas que las cierran en triangulo, que es como
// se rompe un vidrio de verdad. Van en un gris APAGADO: mas claras competian con la aguja. Son
// SIEMPRE LAS MISMAS (un vidrio roto no titila) y llevan su sombra, para leerse sobre la escala.
const IMPACTO = [7, 7];
// LAS PUNTAS SALTADAS (pedido del autor): con el vidrio roto la placa deja de ser un cuadrado. No
// alcanza con comerle pixeles al borde —la silueta seguia siendo un rectangulo perfecto—, asi que
// el reloj roto se dibuja con OTRA placa: la de arriba a la izquierda (la del impacto) y la de
// abajo a la derecha entran en diagonal, como dos esquirlas que se cayeron.
// Los escalones van DESPAREJOS a proposito: en diagonal perfecta la punta se lee como un bisel de
// fabrica y no como algo que se rompio.
const PUNTA_IZQ = [5, 3, 3, 1, 1];      // filas de arriba: cuanto se come desde la izquierda
const PUNTA_DER = [1, 2, 2, 4, 5];      // filas de abajo: cuanto se come desde la derecha
function plateRota(x, y, w, h) {
  if (enTablero) return;
  placas.push({ x, y, w, h });
  const izq = j => (j < PUNTA_IZQ.length ? PUNTA_IZQ[j] : 0);
  const der = j => (j >= h - PUNTA_DER.length ? w - 1 - PUNTA_DER[j - (h - PUNTA_DER.length)] : w - 1);
  ctx.fillStyle = '#0a0e11bb';
  for (let j = 0; j < h; j++) ctx.fillRect(x + izq(j), y + j, der(j) - izq(j) + 1, 1);
  ctx.fillStyle = '#2e3c45';
  for (let j = 0; j < h; j++) {
    ctx.fillRect(x + izq(j), y + j, 1, 1);
    ctx.fillRect(x + der(j), y + j, 1, 1);
    // el escalon de cada diagonal, para que el contorno no quede con agujeros
    if (j > 0 && izq(j) !== izq(j - 1)) ctx.fillRect(x + izq(j), y + j, izq(j - 1) - izq(j) + 1, 1);
    if (j > 0 && der(j) !== der(j - 1)) ctx.fillRect(x + der(j), y + j, der(j - 1) - der(j) + 1, 1);
  }
  ctx.fillRect(x + izq(0), y, der(0) - izq(0) + 1, 1);
  ctx.fillRect(x + izq(h - 1), y + h - 1, der(h - 1) - izq(h - 1) + 1, 1);
  ctx.fillStyle = '#55676f';                                  // las dos esquinas que quedaron sanas
  ctx.fillRect(x + w - 2, y, 2, 1); ctx.fillRect(x + w - 1, y, 1, 2);
  ctx.fillRect(x, y + h - 2, 1, 2); ctx.fillRect(x, y + h - 1, 2, 1);
}
const MELLAS = [[7, 0, 3, 1], [0, 8, 1, 4], [13, 0, 2, 1], [0, 15, 1, 2]];
const RAJAS = [
  [[7, 7], [6, 4], [8, 2]],
  [[7, 7], [4, 8], [2, 7]],
  [[7, 7], [7, 10], [9, 12]],
  [[7, 7], [11, 6], [15, 7]],
  [[11, 6], [10, 10], [7, 10]],
  [[6, 4], [10, 4], [11, 6]],
];
function vidrioRoto(x, y) {
  for (const raja of RAJAS) {
    for (let i = 1; i < raja.length; i++) {
      const [ax, ay] = raja[i - 1], [bx, by] = raja[i];
      // EN PIXELES REALES (18/11, el autor: "el reloj roto se ve feo, tiene otra resolucion"): las rajas iban en la
      // grilla de diseño —un pixel = tres reales— al lado de agujas y marcas en pixeles reales. Ahora son la misma
      // tinta fina: la sombra un pixel real abajo, el filo claro encima.
      lineaFina(x + ax, y + ay + FINO * 2, x + bx, y + by + FINO * 2, '#0a0e11', 2);
      lineaFina(x + ax, y + ay, x + bx, y + by, '#6f838c', 1);
    }
  }
  // el agujero del impacto, tambien fino: el hueco oscuro y un brillo de vidrio en el borde
  const ix = x + IMPACTO[0], iy = y + IMPACTO[1];
  ctx.fillStyle = '#0a0e11'; ctx.fillRect(ix - 4 * FINO, iy - 4 * FINO, 7 * FINO, 7 * FINO);
  ctx.fillStyle = '#8fa3ac'; ctx.fillRect(ix - 2 * FINO, iy - 4 * FINO, 3 * FINO, FINO); ctx.fillRect(ix - 4 * FINO, iy - 2 * FINO, FINO, 3 * FINO);
  // …Y EL MARCO SE ROMPE CON EL (pedido del autor): del lado del impacto le faltan pedazos y la
  // esquina esta saltada. Un vidrio partido adentro de un marco intacto se lee como una calcomania;
  // asi el que se rompio es el instrumento. Las mellas se pintan del oscuro de la placa, o sea que
  // no tapan nada: se COMEN el borde.
  for (const [dx, dy, w, h] of MELLAS) px(x + dx, y + dy, w, h, '#0a0e11');
}
/** EL CARTEL DEL PASILLO (core/cartel.js, 28/9): los avisos —ENTRANDO EN RADAR, TANQUES FUERA…— en
 *  una caja con el estilo de la cinta del objetivo, centrada debajo de ella. Baja desde ATRAS de la
 *  cinta (se dibuja antes, asi que la cinta la tapa mientras entra y sale), se queda y vuelve. El
 *  borde va en el color del aviso: rojo es peligro, ambar es informacion. */
const CARTEL_Y = 13;   // cuanto baja: justo debajo de la cinta (11 de alto) con aire
// LA PLACA DEL RADAR, arriba a la izquierda (la anota drawAlerta cada cuadro). 16/11, el autor: "se pisan
// los UI" — un cartel ancho (ARRANCASTE CON N CON FALLAS + su linea) le comia el borde: si no entra al lado,
// baja hasta debajo de ella.
const cajaIzq = { der: 0, abajo: 0 };
// EN CABINA LOS CARTELES VAN ABAJO, sobre la consola (20/11: el parabrisas ya esta bastante tapado): la pila se
// apoya en el borde de abajo y crece hacia arriba
const CINTA_CABINA_Y = 79;
let islasHud = false;   // LAS ISLAS: sin cinta; los carteles arrancan arriba, bajan al entrar y se van por la derecha
// EN CABINA, LA RADIO VA DEBAJO DE TODO (21/11): la caja de la voz del otro (render/screens.js) anota aca cuanto alto
// ocupa abajo, y la pila de carteles se apoya ARRIBA de ella (un cuadro de atraso: la radio se dibuja despues)
export const pisoCabina = { alto: 0 };
/** UN ENGRANAJE chico (radio ~4), centrado en (cx, cy): seis dientes, la rueda y el agujero. Para los carteles de fallas. */
function engranaje(cx, cy, col) {
  ctx.save();
  ctx.translate(cx + 0.5, cy + 0.5); ctx.rotate(performance.now() / 1400);
  ctx.fillStyle = col;
  for (let i = 0; i < 6; i++) { ctx.save(); ctx.rotate(i * Math.PI / 3); ctx.fillRect(-0.9, -4.3, 1.8, 2); ctx.restore(); }
  ctx.beginPath(); ctx.arc(0, 0, 3, 0, Math.PI * 2); ctx.fill();
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath(); ctx.arc(0, 0, 1.2, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
function drawCartel() {
  // LA PILA (8/10): el primero va arriba, debajo de la cinta, y cada uno se apoya debajo del anterior.
  // La altura de cada lugar se SUAVIZA (c.y): cuando entra uno nuevo, los demas bajan, no saltan.
  let techo = islasHud ? MARGEN : MARGEN + CARTEL_Y;
  // A LA ALTURA DE FUERA DE RADAR (22/11, el autor: "los mensajes del estilo ARRANCASTE CON FALLAS mas arriba, a esta
  // misma altura de fuera de radar y con ese mismo ancho y alto"): el primero arranca donde esta esa placa
  if (enPlacaRadar()) techo = cajaZona.y;
  const lista = cartelesAhora(performance.now() / 1000);
  if (enCabina()) {
    let alto = 0;
    for (const a of lista) if (a.k > 0) alto += ((a.c.glifos && a.c.glifos.length) || a.c.okF != null ? FILA_H + 2 : (a.c.sub ? 12 + (a.c.alerta ? 8 : 4) + 2 : 12) + 2) * a.k;
    techo = H - 3 - pisoCabina.alto - alto;
  }
  for (const a of lista) {
    if (a.k <= 0) continue;
    const h = drawUnCartel(a, techo);   // (devuelve lo que ocupo, contando si tuvo que bajar)
    techo += (h + 2) * a.k;
  }
}
/** Los carteles toman la medida de la placa del radar: en el pasillo, fuera de la cabina, con la placa ya dibujada. */
const enPlacaRadar = () => !islasHud && !enCabina() && !!cajaZona;
function drawUnCartel(a, techo) {
  // la letra de los avisos no tiene raya (—): quedaba un hueco en «EN RADAR — AL AGUA»
  // …y SIN SIGNOS (28/9, el autor): la caja ya dice que es un aviso — los "! … !" y "¡…!" y los
  // "~ … ~" de cuando eran textos sueltos sobraban adentro.
  // …y SIN TILDES (8/10): la letra de los avisos no tiene las vocales acentuadas y "ESCAPÁ" salia
  // "ESCAP". Se sacan los acentos y se deja la virgulilla (U+0303) para que la Ñ siga siendo Ñ.
  const limpio = t => t && String(t).normalize('NFD').replace(/[\u0300-\u0302\u0304-\u036f]/g, '').normalize('NFC')
    .replace(/[!¡~]/g, '').replace(/\s*—\s*/g, ' - ').replace(/\s+/g, ' ').trim();
  // (el de ALERTA conserva los signos de la segunda linea — 8/10, el autor: "exclamaciones en ESCAPA YA")
  const conSignos = t => t && limpio(String(t).replace(/¡/g, '\u0001').replace(/!/g, '\u0002')).replace(/\u0001/g, '¡').replace(/\u0002/g, '!');
  const { k } = a, c = { ...a.c, txt: a.c.alerta ? conSignos(a.c.txt) : limpio(a.c.txt), sub: a.c.alerta ? conSignos(a.c.sub) : limpio(a.c.sub) }, col = c.col || P.ink;
  ctx.font = avisoFont(8);
  const w1 = ctx.measureText(c.txt).width;
  // LA LINEA BLANCA VA CHICA (4/10, el autor): en 6 px competia con el titulo. 4 px la deja de nota.
  // (el de ALERTA lleva la segunda linea en la letra de los avisos, como el titulo: es una orden)
  const SUB_PX = c.alerta ? 8 : 4, fSub = c.alerta ? avisoFont(7) : `${SUB_PX}px monospace`;
  ctx.font = fSub;
  const w2 = c.sub ? ctx.measureText(c.sub).width : 0;
  // LOS MANDOS DIBUJADOS (21/11, el tutorial: render/glifos.js) en una fila propia, abajo
  // …Y COMPACTO (21/11, "ahorremos espacio, las veces mas chicas"): con mandos, la segunda linea es UNA fila — el
  // mando y, a su derecha, la cuenta en chiquito
  // …Y EN UNA SOLA FILA, A LA IZQUIERDA DEL TEXTO (21/11, el autor: "el icono o el stick va del lado izquierdo del texto
  // que me indica que tengo que hacer, se pone VERDE y despues es un CHECK cuando cumplo"): [mando] TEXTO cuenta
  const gl = a.c.glifos && a.c.glifos.length ? a.c.glifos : null;
  const fila = !!gl || c.okF != null;
  const wIco = gl ? glifos.medir(gl, GLIFO_H) : c.okF != null ? 8 : 0;
  const wCuenta = fila && c.sub ? (ctx.font = GLIFO_CUENTA, ctx.measureText(c.sub).width + 4) : 0;
  const w3 = fila ? wIco + 5 + w1 + wCuenta : 0;
  const wIcoC = !fila && a.c.ico ? 11 : 0;   // el icono a la izquierda del titulo (`o.ico`)
  let w = Math.round(Math.max(fila ? 0 : w1 + wIcoC, fila ? 0 : w2, w3) + (c.alerta ? 20 : 12)), h = fila ? FILA_H : c.sub ? 12 + SUB_PX + 2 : 12;
  // (la medida de FUERA DE RADAR: al menos su ancho y su alto; el texto se centra adentro con `bajaTxt`)
  let bajaTxt = 0;
  if (enPlacaRadar()) { const h0 = h; w = Math.max(w, cajaZona.w); h = Math.max(h, cajaZona.h); bajaTxt = Math.round((h - h0) / 2); }
  // el lugar en la pila, suavizado (lo guarda el propio cartel del store: es estado de dibujo, nada mas)
  // (LAS ISLAS, fuera de la cabina — 21/11, el autor: "que aparezcan como aparece radar pero de derecha a izquierda,
  // que se puedan stackear… que queden 3 segs y se vayan hacia la derecha": entra CORRIENDO desde la derecha y se va
  // por la derecha; la pila los pone uno debajo del otro, sin pisarse)
  const corre = islasHud && !enCabina(), dx = corre ? Math.round((1 - k) * (W / 2 + w)) : 0;
  let x = Math.round(W / 2 - w / 2) + dx;
  const techo0 = techo;
  // al lado de la placa del radar, a su altura: si centrado la pisaria, se corre a su derecha
  if (enPlacaRadar() && x < cajaIzq.der + 4) x = cajaIzq.der + 4;
  else if (!enCabina() && x < cajaIzq.der + 3 && techo < cajaIzq.abajo + 3) techo = cajaIzq.abajo + 3;
  const cx = x + w / 2;   // el centro del texto (antes, siempre la mitad de la pantalla)
  if (a.c.y == null) a.c.y = techo;
  a.c.y += (techo - a.c.y) * 0.25;
  // ENTRA Y SALE FUNDIDO, en su lugar (16/11): antes subia por detras de la placa de km y puntos y la pisaba
  const y = Math.round(a.c.y);
  ctx.save();
  ctx.globalAlpha = corre ? 1 : Math.max(0, Math.min(1, k));
  plate(x, y, w, h);
  // LA ALERTA (8/10): la caja late en su color, el borde va doble, y dos flechas a los costados
  // apuntan a la caja titilando — lo que antes hacia el rotulo grande, adentro del cuadrado de arriba
  const late = c.alerta ? 0.5 + 0.5 * Math.sin(performance.now() / 70) : 0;
  if (c.alerta) {
    ctx.globalAlpha = 0.14 + 0.16 * late; ctx.fillStyle = col; ctx.fillRect(x + 1, y + 1, w - 2, h - 2); ctx.globalAlpha = Math.max(0, Math.min(1, k));
    bordePlaca(x - 1, y - 1, w + 2, h + 2, col);
    if (late > 0.35) {
      const my = Math.round(y + h / 2);
      for (let i = 0; i < 4; i++) {
        ctx.fillStyle = col;
        ctx.fillRect(x - 4 - i, my - i, 1, 2 * i + 1);          // ▶ a la izquierda, apuntando a la caja
        ctx.fillRect(x + w + 3 + i, my - i, 1, 2 * i + 1);      // ◀ a la derecha
      }
    }
  }
  bordePlaca(x, y, w, h, col);
  ctx.textAlign = 'center';
  ctx.font = avisoFont(8); ctx.fillStyle = col;
  if (!fila) {
    conApertura(c.txt, cx + wIcoC / 2, y + 9 + bajaTxt, 8);
    if (a.c.ico === 'engranaje') engranaje(Math.round(cx + wIcoC / 2 - w1 / 2 - 6.5), y + 6 + bajaTxt, '#ff4a32');   // (23/11: en rojo)
  }
  if (c.sub && !fila) {
    ctx.font = fSub; ctx.fillStyle = c.subCol || P.foam;
    conApertura(c.sub, cx, y + 11 + bajaTxt + SUB_PX - (c.alerta ? 1 : 0), SUB_PX);
  }
  if (fila) {
    const gx = Math.round(cx - w3 / 2), gy = y + Math.round((h - GLIFO_H) / 2);
    // CUMPLIDA, EN TRES TIEMPOS Y FUNDIDOS (`okF` 1→0): el mando se tiñe de verde, despues se achica y se apaga
    // mientras el CHECK crece en su lugar. Sin cortes: cada tramo arranca donde termino el anterior
    const ok = c.okF, ss = v => { v = Math.max(0, Math.min(1, v)); return v * v * (3 - 2 * v); };
    const verdeK = ok == null ? 0 : ss((1 - ok) / 0.3);          // 0→1 en el primer 30 %
    const checkK = ok == null ? 0 : ss((0.62 - ok) / 0.3);       // 0→1 entre el 38 % y el 68 %
    const a0 = ctx.globalAlpha, gw0 = gl ? wIco : 8, gcx = gx + gw0 / 2, gcy = gy + GLIFO_H / 2;
    if (gl && checkK < 1) {
      const esc = 1 - 0.35 * checkK;
      ctx.save(); ctx.translate(gcx, gcy); ctx.scale(esc, esc); ctx.translate(-gcx, -gcy);
      ctx.globalAlpha = a0 * (1 - checkK) * (1 - verdeK);
      glifos.dibujar(gl, gx, gy, GLIFO_H, performance.now() / 1000);
      if (verdeK > 0) {
        ctx.globalAlpha = a0 * (1 - checkK) * verdeK;
        ctx.filter = 'brightness(0.9) sepia(1) hue-rotate(50deg) saturate(5)';
        glifos.dibujar(gl, gx, gy, GLIFO_H, performance.now() / 1000);
        ctx.filter = 'none';
      }
      ctx.restore();
    }
    if (checkK > 0 || !gl) {
      // EL CHECK, dibujado a mano (el palito corto y el largo), creciendo desde el centro del mando
      const k = gl ? checkK : 1, esc = 0.5 + 0.5 * k;
      ctx.save(); ctx.globalAlpha = a0 * k;
      ctx.translate(gcx, gcy); ctx.scale(esc, esc);
      ctx.strokeStyle = col; ctx.lineWidth = 1.6; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(-3.2, 0.2); ctx.lineTo(-1, 2.5); ctx.lineTo(3.3, -2.3); ctx.stroke();
      ctx.restore();
    }
    const tx = gx + wIco + 5;
    ctx.textAlign = 'center'; ctx.font = avisoFont(8); ctx.fillStyle = col;
    conApertura(c.txt, tx + w1 / 2, y + Math.round(h / 2) + 3, 8);
    ctx.textAlign = 'left';
    if (c.sub) { ctx.font = GLIFO_CUENTA; ctx.fillStyle = c.subCol || P.dim; ctx.fillText(c.sub, tx + w1 + 4, y + Math.round(h / 2) + 2); }
  }
  ctx.textAlign = 'left';
  ctx.restore();
  return h + (techo - techo0);
}

/** Escribe `t` centrado en `cx`. LA LETRA DE LOS AVISOS NO TRAE "¡" (8/10): si el texto la lleva,
 *  se escribe el resto y la apertura se dibuja como un "!" dado vuelta, girado alrededor del centro
 *  de las mayusculas para que quede a su altura. Usa la fuente y el color ya puestos. */
function conApertura(t, cx, y, px0) {
  if (t[0] !== '¡') { ctx.fillText(t, cx, y); return; }
  const resto = t.slice(1), wr = ctx.measureText(resto).width, wb = ctx.measureText('!').width;
  ctx.fillText(resto, cx + wb / 2, y);
  const capH = ctx.measureText('E').actualBoundingBoxAscent || px0 * 0.7;
  ctx.save(); ctx.translate(cx - wr / 2 + wb / 2 - 0.5, y - capH / 2); ctx.rotate(Math.PI);
  ctx.textAlign = 'center'; ctx.fillText('!', 0, capH / 2); ctx.restore();
}

function bordePlaca(x, y, w, h, col) {
  // en el tablero de la cabina el reloj es REDONDO: el aviso es un aro, no un cuadro
  if (enTablero) {
    ctx.strokeStyle = col; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(x + w / 2, y + tableroCy, 12, 0, Math.PI * 2); ctx.stroke(); ctx.lineWidth = 1;
    return;
  }
  ctx.fillStyle = col;
  ctx.fillRect(x, y, w, 1); ctx.fillRect(x, y + h - 1, w, 1);
  ctx.fillRect(x, y, 1, h); ctx.fillRect(x + w - 1, y, 1, h);
}
function bordeCritico(x, y, w, h) {
  if (Math.floor(run.t * CRIT_HZ * 2) % 2) return;
  bordePlaca(x, y, w, h, P.warn);
}

/** Una linea en PIXELES REALES (FINO) de `grosor` pixeles: la tinta de las rajas del vidrio roto, la misma
 *  resolucion que las agujas y las marcas de la escala. */
function lineaFina(x0, y0, x1, y1, col, grosor) {
  const g = grosor || 1, n = Math.max(1, Math.round(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) / FINO));
  ctx.fillStyle = col;
  for (let i = 0; i <= n; i++) {
    const fx = Math.round((x0 + (x1 - x0) * i / n) / FINO) * FINO, fy = Math.round((y0 + (y1 - y0) * i / n) / FINO) * FINO;
    ctx.fillRect(fx, fy, g * FINO, g * FINO);
  }
}
function pxLinea(x0, y0, x1, y1, col) {
  const n = Math.max(1, Math.round(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0))));
  for (let i = 0; i <= n; i++) px(x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n, 1, 1, col);
}

// ---------- LOS RELOJES: MARCAS FINAS Y AGUJA CON PUNTA (9/10) ----------
// El autor, con el reloj del cañon atornillado: "mejoremos TODOS los indicadores visualmente como
// mejoraste la metralleta, solo que simples, para que puedan tener mejoras similares en un futuro".
// Asi que hay UN reloj con dos terminaciones:
//   SIMPLE (todos)   la escala en marcas RADIALES —largas cada cuarto, cortas entre medio— en vez de
//                    puntitos, y la aguja con PUNTA: ancha al pie, afinada al final, con borde oscuro
//                    para despegarse de la escala y el eje encima. En el color de siempre de cada uno.
//   METAL (`metal`)  la mejora: marco de dos pixeles con bisel, OCHO TUERCAS, y escala y aguja en
//                    'plata' u 'oro' (paletas en data/iconos.js, CANON_METAL). Hoy la usa el cañon
//                    segun su metralla; cualquier reloj puede llevarla pasandole `metal`.
// Lo fino va en PIXELES REALES (FINO, un tercio del de diseño): redondeadas al pixel de diseño, las
// trece marcas de un arco de radio 10 salian con escalones de uno y de dos — "los puntitos estan
// medio chuecos" (el autor, 9/10). Todo gira sobre el MISMO centro exacto, escala y aguja.

/** Un pixel REAL en la grilla de diseño (un tercio). */
const FINO = 1 / (U * SC);
const ESCALA_COL = '#55676f', ESCALA_LARGA = '#8c9ca4';   // las marcas del reloj simple: cortas y largas
const AGUJA_BORDE = '#0a0e11';                            // el borde de la aguja simple: el fondo de la placa

/** Pinta un dibujo de CANON_METAL con su esquina en (x, y), que tiene que caer en la grilla real.
 *  Junta los pixeles seguidos del mismo color en un solo rectangulo: son pocos por fila. */
function pintaFino(x, y, filas, pal) {
  for (let j = 0; j < filas.length; j++) {
    const f = filas[j];
    for (let i = 0; i < f.length;) {
      const c = f[i]; let k = i + 1;
      while (k < f.length && f[k] === c) k++;
      if (c !== '.') { ctx.fillStyle = pal[c]; ctx.fillRect(x + i * FINO, y + j * FINO, (k - i) * FINO, FINO); }
      i = k;
    }
  }
}
/** Un trazo RADIAL de `grosor` pixeles reales, de r0 a r1 del centro: las marcas de la escala. */
function marcaFina(cx, cy, a, r0, r1, grosor, col) {
  const c = Math.cos(a), sn = Math.sin(a);
  ctx.fillStyle = col;
  for (let d = r0; d <= r1 + 1e-6; d += FINO) {
    const fx = Math.round((cx + c * d) / FINO - grosor / 2) * FINO, fy = Math.round((cy + sn * d) / FINO - grosor / 2) * FINO;
    ctx.fillRect(fx, fy, grosor * FINO, grosor * FINO);
  }
}
/** LA AGUJA CON PUNTA: ancha al pie (`gordo` de medio ancho) y afinada hasta `largo`, con una cola
 *  corta atras, borde y el eje encima. `pal` = { o: borde, h: la cara con luz, g: la otra cara,
 *  x: el perno }; la simple pasa el mismo color en las dos caras. Se rasteriza en pixeles reales,
 *  fila por fila, juntando los tramos del mismo color. */
function aguja(cx, cy, a, largo, pal, gordo) {
  const { o: O, h: L, g: G, x: X } = pal;
  const c = Math.cos(a), sn = Math.sin(a), COLA = largo * 0.3, EJE = gordo + 0.05;
  const ancho = t => t < 0 ? gordo * 0.7 : gordo * Math.pow(Math.max(0, 1 - t / largo), 0.75);
  const R = largo + 1;
  const i0 = Math.floor((cx - R) / FINO), i1 = Math.ceil((cx + R) / FINO);
  const j0 = Math.floor((cy - R) / FINO), j1 = Math.ceil((cy + R) / FINO);
  for (let j = j0; j < j1; j++) {
    let tramo = null, desde = i0;
    for (let i = i0; i <= i1; i++) {
      let col = null;
      if (i < i1) {
        const dx = (i + 0.5) * FINO - cx, dy = (j + 0.5) * FINO - cy;
        const t = dx * c + dy * sn, d = -dx * sn + dy * c, rr = Math.hypot(dx, dy);
        if (rr <= 0.45) col = X;                                   // el perno del eje
        else if (rr <= EJE) col = dx + dy < 0 ? L : G;
        else if (rr <= EJE + FINO) col = O;
        else if (t >= -COLA && t <= largo + FINO) {
          const w = ancho(t) * (run.aguAncho || 1);
          if (Math.abs(d) <= w && t <= largo) col = d < 0 ? L : G;
          else if (Math.abs(d) <= w + FINO) col = O;
        }
      }
      if (col !== tramo) {
        if (tramo) { ctx.fillStyle = tramo; ctx.fillRect(desde * FINO, j * FINO, (i - desde) * FINO, FINO); }
        tramo = col; desde = i;
      }
    }
  }
}
/** La aguja SIMPLE de un color (con su borde oscuro y el eje), sobre el centro (cx, cy). */
const agujaSimple = (cx, cy, a, largo, col) => aguja(cx, cy, a, largo, { o: AGUJA_BORDE, h: col, g: col, x: P.ink }, 0.8);

/** LA LETRA DE LOS NUMEROS de los relojes (12/10). Se muta, no se reasigna: la sonda __fuenteNum
 *  (game.js) la cambia en vivo para comparar las candidatas (FONT_PANEL en render/ctx.js). */
export const NUMEROS = { fam: 'CCSuperHuman' };   // elegida por el autor el 12/10 entre la tanda del panel

/** `o` = { val 0..1, col, ico, icoCol, zona: [desde, hasta] en rojo, zonas: [[desde, hasta, col]]
 *  (varias y de cualquier color; manda sobre `zona`), marcas: [[f, col]] marcas LARGAS, fin: icono
 *  al final de la escala (o null), txt: el numero al pie, txtCol, uni: la unidad, chica y apagada,
 *  en el renglon de ARRIBA del numero, critico: el borde titila en rojo
 *  (ver bordeCritico), borde: color del borde de la placa, fijo y sin titilar (hoy: el turbo),
 *  roto: el vidrio va rajado (ver vidrioRoto), metal: 'plata' | 'oro' la terminacion de metal (ver
 *  arriba), tiembla: radianes que se le suman a la aguja este cuadro, aguja: false no la dibuja }
 *  `ico` puede ser una FUNCION (x, y, pal) que dibuja su propio icono — la de las balas del cañon. */
// LOS RELOJES AL TABLERO (PRIMERA PERSONA, F3 — docs/sistemas/PLAN_PRIMERA_PERSONA.md). En cabina
// cada reloj de la fila de abajo se dibuja con su MISMO codigo y sus mismos valores, pero llevado a su
// lugar del tablero horneado (data/cabina_anclas.js): un traslado y una escala, nada mas. El que no
// tiene lugar en el tablero (la Chancha, el rack) se queda en la fila. `cy` es donde cae el centro de
// la esfera dentro del cuadro de 26 (16 en los relojes, 13 en el horizonte).
let idDeX = null, enTablero = false, tableroCy = 16;
const RACK_ACHICA = 0.74;
function alTablero(x, y, fn, cy = 16) {
  if (!idDeX) idDeX = { [X_SALUD]: 'salud', [X_NAFTA]: 'nafta', [X_MACH]: 'mach', [xVuelo(0)]: 'velocidad',
    [xVuelo(1)]: 'adi', [xVuelo(2)]: 'altitud', [xVuelo(3)]: 'gas', [X_CANON]: 'canon',
    [X_CHANCHA]: 'chancha', [X_RACK]: 'rack' };
  // (ya adentro de un reloj llevado al tablero —el del cañon llama a `reloj`— no se lleva dos veces)
  const a = !enTablero && enCabina() && y === CUADROS_Y ? CABINA_ANCLAS[idDeX[x]] : null;
  if (!a) return fn();
  ctx.save();
  if (a.length === 4) {                          // EL ESTANTE: en su recuadro hundido, SIN deformar
    // (21/11, el autor: "mas chico, que entre en el espacio negro"): la flechita de la elegida y los numeros se
    // salian del recuadro hundido; con RACK_ACHICA entra todo con un poco de aire
    const k = Math.min((a[2] - a[0]) / U / RACK_W, (a[3] - a[1]) / U / CUADRO) * RACK_ACHICA;
    ctx.translate((a[0] + a[2]) / 2 / U, (a[1] + a[3]) / 2 / U);
    ctx.scale(k, k);
    ctx.translate(-(x + RACK_W / 2), -(y + CUADRO / 2));
  } else {
    ctx.translate(a[0] / U, a[1] / U);
    const k = (a[2] / U) / 12.5;                 // la esfera (r 10 + el aro) adentro del hueco del bisel
    ctx.scale(k, k);
    ctx.translate(-(x + 13), -(y + cy));
  }
  enTablero = true; tableroCy = cy;
  const r = fn();
  enTablero = false;
  ctx.restore();
  return r;
}

function reloj(x, y, o) { return alTablero(x, y, () => relojFila(x, y, o)); }
// ---- LAS FALLAS EN LOS RELOJES (PLAN_FALLAS, modos sueltos; data/fallas.js) ----
/** El grado de la falla `id` del avion que vuela (0 sano). Solo hay fallas en los modos sueltos. */
let altLag = 0;   // el altimetro que ATRASA (falla media): la altura que muestra
const falHud = id => (run.fallasFlota ? ((run.fallasFlota[alMando(run)] || {})[id] || 0) : 0);
/** Lo que la falla le hace a las OPCIONES de un reloj: LEVE la aguja tiembla, MEDIA ademas el vidrio
 *  partido y saltos, TOTAL la aguja caida y sin numero. */
function conFalla(o, g) {
  if (!g) return o;
  const t = run.t;
  if (g === 1) return { ...o, tiembla: (o.tiembla || 0) + Math.sin(t * 41) * 0.08 + Math.sin(t * 17) * 0.05 };
  if (g === 2) return { ...o, roto: true, tiembla: (o.tiembla || 0) + (Math.sin(t * 2.3) > 0.5 ? Math.sin(t * 53) * 0.3 : 0.06) };
  return { ...o, val: -0.04, col: '#4e5a62', txt: '', roto: true, borde: null, critico: false, franjas: undefined, zonas: undefined, marcas: undefined, icoCol: '#4e5a62' };
}
/** Y ENCIMA DEL RELOJ: el bisel ambar que late (LEVE/MEDIA) o el velo con NO FUNCIONA (TOTAL). */
function marcaFalla(x, y, g) {
  if (!g) return;
  alTablero(x, y, () => {
    if (g >= 3) {
      ctx.globalAlpha = 0.55; px(x + 1, y + 1, CUADRO - 2, CUADRO - 2, '#0b0f12'); ctx.globalAlpha = 1;
      ctx.font = 'bold 4px monospace'; ctx.textAlign = 'center'; ctx.fillStyle = '#e0503a';
      ctx.fillText('NO', x + CUADRO / 2, y + CUADRO - 9); ctx.fillText('FUNCIONA', x + CUADRO / 2, y + CUADRO - 4);
      ctx.textAlign = 'left';
      bordePlaca(x, y, CUADRO, CUADRO, '#8a2a1e');
    } else bordePlaca(x, y, CUADRO, CUADRO, Math.sin(run.t * 6) > 0 ? '#d08a2e' : '#7a5120');
  });
}
function relojFila(x, y, o) {
  if (o.roto) plateRota(x, y, CUADRO, CUADRO); else plate(x, y, CUADRO, CUADRO);
  const cx = x + 13, cy = y + 16, r = 10;
  const ang = f => Math.PI + Math.PI * Math.max(0, Math.min(1, f));
  const met = o.metal ? CANON_METAL.pal[o.metal] : null;
  // EL MARCO DE METAL: dos pixeles, el de afuera oscuro y el de adentro con bisel (luz arriba e
  // izquierda, sombra abajo y derecha), asi se lee como chapa y no como una linea doble
  if (met) {
    bordePlaca(x, y, CUADRO, CUADRO, met.o);
    px(x + 1, y + 1, CUADRO - 2, 1, met.g); px(x + 1, y + 1, 1, CUADRO - 2, met.g);
    px(x + 1, y + CUADRO - 2, CUADRO - 2, 1, met.s); px(x + CUADRO - 2, y + 1, 1, CUADRO - 2, met.s);
  }
  // LA ESCALA: trece marcas radiales, largas cada cuarto. Las de la zona van en su color — el peligro
  // es parte del dial, no un aviso
  const zonas = o.zonas || (o.zona ? [[o.zona[0], o.zona[1], P.warn]] : []);
  // LA ZONA DEL RADAR, EN LA MISMA ESCALA (23/11, el autor: "quiero meter eso verde… en el mismo espacio que la de
  // abajo… algo asi" — con el arco de la nafta): era un arco punteado por fuera del dial; ahora es una BANDA verde
  // continua sobre el aro de la escala, del techo del radar para arriba, como la de la nafta. Se levanta con el escaneo
  // (`crece`) y, adentro del radar (`on`), titila. Va antes que las rayitas: la escala se sigue leyendo encima
  const R0 = o.radar || null;
  if (R0) {
    const hasta = R0.desde + (1 - R0.desde) * Math.max(0, Math.min(1, R0.crece));
    if (hasta > R0.desde) {
      // RADIOACTIVA (23/11, el autor: "hacela mas radioactiva"): verde NEON que brilla —un halo ancho y suave por debajo
      // que respira—, el nucleo con un parpadeo nervioso de tubo, y chispitas claras que corren por la banda hacia
      // arriba. Adentro del radar todo late mas rapido y mas fuerte.
      const a0 = ang(R0.desde), a1 = ang(hasta), t = run.t, on = R0.on;
      const resp = 0.5 + 0.5 * Math.sin(t * (on ? 9 : 3.2));
      const tubo = Math.sin(t * 37) * Math.sin(t * 23) > 0.82 ? 0.55 : 1;   // el titileo cortito, de vez en cuando
      ctx.save(); ctx.lineCap = 'butt';
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = RADAR_NEON_HALO;
      ctx.globalAlpha = (on ? 0.32 : 0.18) + resp * (on ? 0.3 : 0.14);
      ctx.lineWidth = 4.2; ctx.beginPath(); ctx.arc(cx, cy, r - 0.1, a0, a1); ctx.stroke();
      ctx.globalAlpha = (on ? 0.5 : 0.3) * tubo;
      ctx.lineWidth = 2.8; ctx.beginPath(); ctx.arc(cx, cy, r - 0.1, a0, a1); ctx.stroke();
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = tubo;
      ctx.strokeStyle = on && Math.sin(t * 14) > 0 ? RADAR_NEON_CLARO : RADAR_NEON;
      ctx.lineWidth = 1.8; ctx.beginPath(); ctx.arc(cx, cy, r - 0.1, a0, a1); ctx.stroke();
      // las chispitas que corren hacia arriba por la banda
      ctx.globalAlpha = 1; ctx.strokeStyle = RADAR_NEON_CLARO; ctx.lineWidth = 1.8;
      const n = 3, v = on ? 0.9 : 0.35;
      for (let k = 0; k < n; k++) {
        const u = ((t * v + k / n) % 1 + 1) % 1, f = R0.desde + (hasta - R0.desde) * u, a = ang(f);
        ctx.beginPath(); ctx.arc(cx, cy, r - 0.1, a, Math.min(a1, a + 0.07)); ctx.stroke();
      }
      ctx.restore();
    }
  }
  for (let i = 0; i <= 12; i++) {
    const f = i / 12, larga = i % 3 === 0;
    const z = zonas.find(([d, h]) => f >= d && f <= h);
    const col = z ? z[2] : larga ? (met ? met.h : ESCALA_LARGA) : (met ? met.s : ESCALA_COL);
    marcaFina(cx, cy, ang(f), larga ? r - 1.6 : r - 0.7, r + 0.6, larga ? 2 : 1, col);
  }
  // LAS MARCAS LARGAS: un punto de la escala que importa por si solo (Mach 1, el techo del radar).
  // Cruzan el aro para afuera y para adentro: se ven aunque caigan entre dos marcas comunes.
  for (const [f, col] of o.marcas || []) marcaFina(cx, cy, ang(f), r - 2.6, r + 1.2, 2, col);
  // (la franja del radar ya no va por fuera: es el color de la escala, arriba)
  // LAS FRANJAS: un arco POR DENTRO de la escala, para zonas que no son peligro sino regimen (las
  // tres zonas de gasto del altimetro). Van adentro para no pisar las marcas de la escala, que en el
  // altimetro ya dicen agua y banda del x10.
  // ERAN 37 PUNTITOS DE UN PIXEL y no se leian (26/9, el autor: "no se si ya se marca, pero deberia
  // quedar claro"). Es una banda CONTINUA, y la zona en la que estas va prendida y las otras a media
  // luz (el 4to elemento, `on`: false la apaga; sin el, prendida): lo que el ojo tiene que encontrar
  // de reojo es DONDE ESTOY, no el mapa entero.
  for (let k = 0; k <= 96; k++) {
    const f = k / 96, z = (o.franjas || []).find(([d, h]) => f >= d && f <= h);
    if (!z) continue;
    ctx.globalAlpha = z[3] === false ? 0.35 : typeof z[3] === 'number' ? z[3] : 1;   // (un numero: su alfa)
    marcaFina(cx, cy, ang(f), r - 4.3, r - 2.9, 2, z[2]);
  }
  ctx.globalAlpha = 1;
  // LO IMPRESO EN LA CARA va ANTES que la aguja, asi la aguja le pasa por encima: la unidad, el icono
  // del final de la escala, el del instrumento y el numero.
  // LA UNIDAD VA PEGADA AL NUMERO (18/11, el autor: "que sea parte del 25"): chica, en la misma linea de
  // base, a la derecha de los digitos — se dibuja junto con el numero, mas abajo. Antes iba suelta arriba,
  // impresa en la cara, y se leia como otra cosa.
  if (o.fin) icono(x + CUADRO - 8, y + 9, 6, o.fin, o.finCol || P.warn);   // su '+' es calado (data/iconos.js)
  if (typeof o.ico === 'function') o.ico(x, y, met);
  else if (o.ico) icono(x + 2, y + CUADRO - 9, 7, o.ico, o.icoCol || P.dim);
  if (o.txt) {
    // EL NUMERO EN NUMEROS.fam (CC SuperHuman, autor 12/10; antes Kirana); monospace hasta que carga.
    // Kirana era ANCHA: "100%" a 7 px pisaba el icono; va a 5,5 y se achica hasta entrar a la derecha del icono
    // con un pixel de aire ("mas chicos los numeros, se pisan", 12/10).
    let fs = 5.5, uniW = 0;
    if (o.uni) { ctx.font = '3px monospace'; uniW = ctx.measureText(o.uni).width + 0.5; }
    ctx.font = uiFont(NUMEROS.fam, fs, '');
    const ancho = ctx.measureText(o.txt).width, LUGAR = CUADRO - (typeof o.ico === 'function' ? 16 : o.uni ? 13 : 14) - uniW;   // las balas son mas largas
    if (ancho > LUGAR) { fs = Math.max(3.5, fs * LUGAR / ancho); ctx.font = uiFont(NUMEROS.fam, fs, ''); }
    ctx.textAlign = 'right'; ctx.fillStyle = o.txtCol || P.dim;
    ctx.fillText(o.txt, x + CUADRO - 3 - uniW, y + CUADRO - 4);
    if (o.uni) {
      ctx.font = '3px monospace'; ctx.fillStyle = '#6d8088';
      ctx.fillText(o.uni, x + CUADRO - 3, y + CUADRO - 4);
    }
    ctx.textAlign = 'left';
  }
  if (o.aguja !== false) {
    const a = ang(o.val) + (o.tiembla || 0);
    if (met) aguja(cx, cy, a, 8.5, met, 1.15); else agujaSimple(cx, cy, a, 8, o.col);
  }
  if (o.roto) vidrioRoto(x, y);
  if (o.borde) bordePlaca(x, y, CUADRO, CUADRO, o.borde);   // el fijo primero: el critico manda
  if (o.critico) bordeCritico(x, y, CUADRO, CUADRO);
  // LAS OCHO TUERCAS del metal, encima de todo (tambien del borde que titila): las cuatro esquinas y
  // el medio de cada lado, centradas sobre el marco
  if (met) {
    const lejos = CUADRO - 2, medio = CUADRO / 2 - 1;
    for (const [tx, ty] of [[0, 0], [medio, 0], [lejos, 0], [0, medio], [lejos, medio], [0, lejos], [medio, lejos], [lejos, lejos]])
      pintaFino(x + tx, y + ty, CANON_METAL.tuerca, met);
  }
}

// ---------- LA BRUJULA (las islas) ----------
// LA TEMPERATURA EXTERIOR (20/11, el autor: "otro indicador de temperatura exterior, perilla, grados centigrados, y
// un icono que indique frio, templado y calor… prevencion de engelamiento"). LAS ISLAS: arriba de la brujula; en la
// CABINA, en el relojito de arriba del panelito izquierdo (hornear_cabina.py `tablero_izq`, (-0,352; -0,262) r 0,030
// sobre el tablero), proyectado con la camara del juego como las anclas (F 135, HOR 96): ANCLA_TEMP.
// La escala va de -20 a +30 °C; la franja celeste es la del HIELO (+1 para abajo: con humedad, se junta). El icono:
// un termometro azul con un copo (frio, hasta +2), verde (templado, hasta +15) o rojo con sol (calor). Con hielo
// juntandose el borde va celeste, y critico cuando ya hay mucho.
const ANCLA_TEMP = [143.53, 167.82, 8.22], T_MIN = -20, T_MAX = 30;
// LA ESCARCHA (21/11, el autor: "congelamos el indicador de hielo cuando las alas estan congeladas, y el borde de la
// vida tambien; y cuando se derriten se convierten en agua y se van"): cristales que crecen desde el borde de la caja
// hacia adentro a medida que se junta hielo (`nivel` 0..1, run.hielo), y un velo celeste encima. Cada cristal tiene su
// umbral: al bajar el hielo, el que se apaga suelta una GOTA que resbala por la caja y se va.
const ESC_N = 26, ESC_CRIS = [], escPrev = {}, escGotas = {};
{ let sem = 7; const rnd = () => (sem = (sem * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < ESC_N; i++) {
    // un punto del perimetro (0..4 = arriba, derecha, abajo, izquierda), su umbral y su largo
    const lado = i % 4, u = 0.08 + rnd() * 0.84;
    ESC_CRIS.push({ lado, u, umbral: 0.12 + rnd() * 0.8, largo: 1 + Math.floor(rnd() * 3), rama: rnd() < 0.5 ? -1 : 1 });
  }
}
function escarcha(id, x, y, nivel) {
  const W0 = CUADRO, ahora = performance.now() / 1000;
  const prev = escPrev[id] ?? nivel; escPrev[id] = nivel;
  const gotas = escGotas[id] || (escGotas[id] = []);
  const pos = c => c.lado === 0 ? [x + 1 + c.u * (W0 - 3), y + 1, 0, 1] : c.lado === 1 ? [x + W0 - 2, y + 1 + c.u * (W0 - 3), -1, 0]
    : c.lado === 2 ? [x + 1 + c.u * (W0 - 3), y + W0 - 2, 0, -1] : [x + 1, y + 1 + c.u * (W0 - 3), 1, 0];
  // SE DERRITE: cada cristal que cruzo su umbral para abajo larga una gota
  if (nivel < prev) for (const c of ESC_CRIS) if (prev >= c.umbral && nivel < c.umbral) {
    const [cx, cy] = pos(c);
    gotas.push({ x: Math.round(cx), y: cy, t0: ahora, v: 6 + (c.u * 10) % 6 });
  }
  ctx.save();
  if (nivel > 0.02) {
    // el vidrio empañado de frio — (23/11, el autor: "los indicadores congelados hacerlos mucho mejor, no se entiende que
    // estan congelados"): mas blanco, escarcha que crece desde las esquinas, borde de hielo doble y el COPO
    // (…y "que me permita ver el valor": el velo apenas, y la escarcha solo en las esquinas — la aguja y el numero se leen)
    ctx.globalAlpha = Math.min(0.18, nivel * 0.25); ctx.fillStyle = '#cfeeff'; ctx.fillRect(x + 1, y + 1, W0 - 2, W0 - 2);
    ctx.globalAlpha = 1;
    esquinasHielo(x + 1, y + 1, W0 - 2, nivel * 0.55);
    for (const c of ESC_CRIS) {
      if (nivel < c.umbral) continue;
      const [cx, cy, dx, dy] = pos(c), crece = Math.min(1, (nivel - c.umbral) / 0.15), L = Math.max(1, Math.round(c.largo * crece + 0.4));
      ctx.fillStyle = '#e8f8ff';
      for (let k = 0; k < L; k++) ctx.fillRect(Math.round(cx + dx * k), Math.round(cy + dy * k), 1, 1);
      // la ramita de costado, en la punta
      if (L > 1) { ctx.fillStyle = '#a8dcff'; ctx.fillRect(Math.round(cx + dx * (L - 1) + dy * c.rama), Math.round(cy + dy * (L - 1) + dx * c.rama), 1, 1); }
    }
    // el borde de la caja, escarchado
    ctx.globalAlpha = Math.min(1, nivel * 1.4); ctx.strokeStyle = '#bfe8ff'; ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, y + 0.5, W0 - 1, W0 - 1);
    ctx.globalAlpha = Math.min(1, nivel * 1.1); ctx.strokeStyle = '#ffffff'; ctx.strokeRect(x + 1.5, y + 1.5, W0 - 3, W0 - 3);
    ctx.globalAlpha = 1;
    // (el copo del medio se saco el mismo 23/11; va el ICONO, chico, arriba a la derecha)
    if (nivel > 0.15) iconoHielo(x + W0 - 10, y + 1);
  }
  // LAS GOTAS: resbalan para abajo, se estiran, y al llegar al borde de abajo se van
  for (let i = gotas.length - 1; i >= 0; i--) {
    const g = gotas[i], dt = ahora - g.t0, gy = g.y + g.v * dt + 9 * dt * dt;
    if (gy > y + W0 - 1 || dt > 2.5) { gotas.splice(i, 1); continue; }
    const a = Math.min(1, (y + W0 - 1 - gy) / 4);
    ctx.globalAlpha = 0.85 * a; ctx.fillStyle = '#7fc8ff';
    ctx.fillRect(g.x, Math.round(gy) - 1, 1, 2);                       // la gota
    ctx.globalAlpha = 0.35 * a; ctx.fillRect(g.x, Math.round(g.y), 1, Math.max(0, Math.round(gy - g.y) - 1));   // el rastro mojado
  }
  ctx.restore();
}
// (21/11, el autor: "los valores no hacen falta tal como los pusiste: una escala logica de hielo, con el 0 en el
// medio"): de -20 a +20, el 0 arriba de todo (marca larga y su numero, el unico), la franja del hielo en amarillo
const TA_MIN = -20, TA_MAX = 20;
// EL ARCO DE LOS RELOJES ANCHOS (temperatura y gas): el eje, alto, para que el numero caiga en la linea de los demas
const ARCO_CY = CUADRO - 8;
// EL GAS EN ARCO (23/11, el autor: "converti al gas en esto, similar al hielo… y en la barra de relleno de abajo, en vez de
// gris como el de temperatura, pone la barra ahi adentro"): el mismo arco ancho que la temperatura. La aguja es la palanca;
// en GAS MODO SUAVE la franja de adentro del arco es el SOSTEN —se llena con el gas a fondo y se vacia sola—, en el acento
// y titilando en rojo cuando queda poco. Sin SUAVE, la franja es solo el surco
const SOSTEN_COL = '#f2d04a';
/** SIN SOSTEN, BAJANDO (23/11, el autor: "si llega hasta el fin ahi empieza a bajar, se indica el indicador de altura"):
 *  una flechita amarilla que titila arriba a la derecha del altimetro, mientras el avion se asienta solo. */
function flechaBaja(x, y) {
  if (Math.sin(run.t * 9) < -0.3) return;
  const cx = x + CUADRO - 6, cy = y + 6;
  ctx.fillStyle = SOSTEN_COL;
  ctx.fillRect(cx - 0.5, cy - 3, 1.5, 3.5);
  ctx.beginPath(); ctx.moveTo(cx - 2.5, cy); ctx.lineTo(cx + 3, cy); ctx.lineTo(cx + 0.25, cy + 3); ctx.closePath(); ctx.fill();
}
// el verde de la banda del radar en el altimetro, el mismo de la nafta (23/11: "algo asi")
const RADAR_NEON = '#6dff3c', RADAR_NEON_CLARO = '#e4ffb8', RADAR_NEON_HALO = '#39ff14';
const NAFTA_COL = '#5fc46a', NAFTA_ALFA = 0.5;
/** LA NAFTA EN ARCO (23/11): la franja de adentro es la nafta que queda (verde; con poca, roja titilando), la aguja la
 *  marca a la misma altura, la carga de la Chancha en el verde claro de la suelta y el BINGO como marca. */
function naftaArco(x, y, o) {
  plate(x, y, CUADRO, CUADRO);
  const cx = x + CUADRO / 2, cy = y + ARCO_CY, R = 10.8;
  const A0 = Math.PI * 1.13, A1 = Math.PI * 1.87;
  const ang = v => A0 + (A1 - A0) * Math.max(0, Math.min(1, v));
  const v = Math.max(0, Math.min(1, o.val));
  ctx.save();
  ctx.lineWidth = 1.8; ctx.lineCap = 'butt';
  ctx.strokeStyle = '#1e2a31'; ctx.beginPath(); ctx.arc(cx, cy, R - 1.7, A0, A1); ctx.stroke();
  if (v > 0) {
    // (23/11, el autor: "sacale opacidad a la gasolina"): el verde a media luz; el aviso de reserva, entero
    const avisa = o.bajo && !o.cargando;
    ctx.globalAlpha = avisa ? 1 : NAFTA_ALFA;
    ctx.strokeStyle = avisa ? (Math.sin(run.t * 10) > 0 ? P.warn : '#7d2f1e') : NAFTA_COL;
    ctx.beginPath(); ctx.arc(cx, cy, R - 1.7, A0, ang(v)); ctx.stroke();
    ctx.globalAlpha = 1;
  }
  // lo que entro de la Chancha, encima y mas claro
  if (o.carga && o.carga[1] > o.carga[0]) {
    ctx.globalAlpha = o.carga[2]; ctx.strokeStyle = SUELTA_COL;
    ctx.beginPath(); ctx.arc(cx, cy, R - 1.7, ang(o.carga[0]), ang(o.carga[1])); ctx.stroke(); ctx.globalAlpha = 1;
  }
  // las marcas cada cuarto (el cuarto de abajo en rojo: la reserva), y el BINGO con ruta
  for (let k = 0; k <= 4; k++) {
    const a = ang(k / 4), r0 = k === 4 ? R - 3.2 : R - 1.2;
    ctx.strokeStyle = k === 1 ? P.warn : k === 4 ? '#e8eef0' : '#6d7d85'; ctx.lineWidth = k === 4 ? 0.8 : 0.5;
    ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0); ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); ctx.stroke();
  }
  if (o.bingo != null) {
    const a = ang(o.bingo); ctx.strokeStyle = P.warn; ctx.lineWidth = 0.9;
    ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * (R - 3.6), cy + Math.sin(a) * (R - 3.6)); ctx.lineTo(cx + Math.cos(a) * (R + 0.5), cy + Math.sin(a) * (R + 0.5)); ctx.stroke();
  }
  ctx.restore();
  icono(x + 2, y + CUADRO - 9, 7, 'nafta', P.dim);
  // el numero, CHICO (23/11: "el 100 % mas chico para quitarle tanto ruido")
  ctx.textAlign = 'right'; ctx.font = uiFont(NUMEROS.fam, 3.8, '');
  ctx.fillStyle = o.bajo ? P.warn : P.dim;
  ctx.fillText(o.txt, x + CUADRO - 3, y + CUADRO - 4);
  ctx.textAlign = 'left';
  // la aguja: LA NAFTA, a la altura de la franja
  ctx.save();
  const a = ang(v);
  ctx.strokeStyle = o.colAguja; ctx.lineWidth = 0.9; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * (R - 0.8), cy + Math.sin(a) * (R - 0.8)); ctx.stroke();
  ctx.fillStyle = '#5d6a71'; ctx.beginPath(); ctx.arc(cx, cy, 1.1, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  if (o.cargando) bordePlaca(x, y, CUADRO, CUADRO, SUELTA_COL);
  else if (o.bajo) bordeCritico(x, y, CUADRO, CUADRO);
}
function gasArco(x, y, gas, sosten, suave, sinNafta) {
  plate(x, y, CUADRO, CUADRO);
  const cx = x + CUADRO / 2, cy = y + ARCO_CY, R = 10.8;
  const A0 = Math.PI * 1.13, A1 = Math.PI * 1.87;
  const ang = v => A0 + (A1 - A0) * Math.max(0, Math.min(1, v));
  ctx.save();
  // la franja: el surco, y encima lo que queda de sostén
  ctx.lineWidth = 1.8; ctx.lineCap = 'butt';
  ctx.strokeStyle = '#1e2a31'; ctx.beginPath(); ctx.arc(cx, cy, R - 1.7, A0, A1); ctx.stroke();
  if (suave && sosten > 0) {
    const poco = sosten < 0.25;
    // (23/11: en AMARILLO mientras se descarga; lo ultimo titila en rojo)
    ctx.strokeStyle = poco ? (Math.sin(run.t * 14) > 0 ? P.warn : '#7d2f1e') : SOSTEN_COL;
    ctx.beginPath(); ctx.arc(cx, cy, R - 1.7, A0, ang(sosten)); ctx.stroke();
  }
  // las marcas cada cuarto; el 100 largo
  for (let k = 0; k <= 4; k++) {
    const a = ang(k / 4), r0 = k === 4 ? R - 3.2 : R - 1.2;
    ctx.strokeStyle = k === 4 ? '#e8eef0' : '#6d7d85'; ctx.lineWidth = k === 4 ? 0.8 : 0.5;
    ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0); ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); ctx.stroke();
  }
  ctx.restore();
  // el icono abajo a la izquierda y el porcentaje en la linea de los demas
  icono(x + 2, y + CUADRO - 9, 7, 'gas', P.dim);
  ctx.textAlign = 'right'; ctx.font = uiFont(NUMEROS.fam, 5.5, '');
  ctx.fillStyle = sinNafta ? P.warn : P.dim;
  ctx.fillText(Math.round(Math.max(0, Math.min(1, gas)) * 100) + '%', x + CUADRO - 3, y + CUADRO - 4);
  ctx.textAlign = 'left';
  // la aguja: la palanca, blanca; a fondo, en el acento; sin nafta titila
  ctx.save();
  const a = ang(gas);
  ctx.strokeStyle = sinNafta ? (Math.sin(run.t * 10) > 0 ? P.warn : P.dim) : gas >= 0.95 ? P.accent : '#e8eef0';
  ctx.lineWidth = 0.9; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * (R - 0.8), cy + Math.sin(a) * (R - 0.8)); ctx.stroke();
  ctx.fillStyle = '#5d6a71'; ctx.beginPath(); ctx.arc(cx, cy, 1.1, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
function termoArco(x, y, t, f0, col) {
  const f = c => (c - TA_MIN) / (TA_MAX - TA_MIN);
  plate(x, y, CUADRO, CUADRO);
  // (23/11, el autor: "dale altura, que el renglon de abajo quede a la misma linea que el resto de los indicadores"):
  // el eje sube (ARCO_CY) y el numero va en la base de los demas relojes (y + CUADRO - 4)
  const cx = x + CUADRO / 2, cy = y + ARCO_CY, R = 10.8;
  const A0 = Math.PI * 1.13, A1 = Math.PI * 1.87;                  // de abajo-izquierda a abajo-derecha, por arriba
  const ang = v => A0 + (A1 - A0) * Math.max(0, Math.min(1, v));
  ctx.save();
  // la franja amarilla del HIELO: de -12 a +2 °C (pegada al 0, del lado frio)
  ctx.strokeStyle = '#e8c23d'; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.arc(cx, cy, R - 1.6, ang(f(-12)), ang(f(2))); ctx.stroke();
  // las marcas cada 5 °C; el 0 largo y con su numero; frio en celeste, calor en naranja
  for (let c = TA_MIN; c <= TA_MAX; c += 5) {
    const a = ang(f(c)), cero = c === 0, r0 = cero ? R - 3.2 : c % 10 === 0 ? R - 2 : R - 1.2;
    ctx.strokeStyle = cero ? '#e8eef0' : c < 0 ? '#7fc8ff' : '#ff9a6a'; ctx.lineWidth = cero ? 0.8 : 0.5;
    ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0); ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); ctx.stroke();
  }
  ctx.font = '3px monospace'; ctx.textAlign = 'center'; ctx.fillStyle = '#e8eef0';
  ctx.fillText('0', cx, cy - R - 1.2);
  // °C abajo a la izquierda, y el valor en su color abajo a la derecha
  ctx.fillStyle = '#9fb0b6'; ctx.textAlign = 'left'; ctx.fillText('°C', x + 2.5, y + CUADRO - 4);
  ctx.textAlign = 'right'; ctx.font = uiFont(NUMEROS.fam, 5.5, ''); ctx.fillStyle = col;
  ctx.fillText(Math.round(t.c) + '°', x + CUADRO - 3, y + CUADRO - 4);
  // la aguja: blanca, desde el eje de abajo; en la franja del hielo, celeste
  const a = ang(f(t.c)), hielo = t.c <= 2;
  ctx.strokeStyle = hielo ? '#9fdcff' : '#e8eef0'; ctx.lineWidth = 0.9; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * (R - 0.8), cy + Math.sin(a) * (R - 0.8)); ctx.stroke();
  ctx.fillStyle = '#5d6a71'; ctx.beginPath(); ctx.arc(cx, cy, 1.1, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  // el borde celeste con hielo juntandose, critico cuando ya hay mucho (como antes)
  if (t.hielo > 0.25) bordePlaca(x, y, CUADRO, CUADRO, '#9fdcff');
  if (t.hielo > 0.6) bordeCritico(x, y, CUADRO, CUADRO);
}
function drawTemperatura(x, y, t) {
  const f = c => (c - T_MIN) / (T_MAX - T_MIN), estado = t.c <= 2 ? 'frio' : t.c <= 15 ? 'templado' : 'calor';
  const col = { frio: '#7fc8ff', templado: '#9fd27a', calor: '#ff7a4a' }[estado];
  const ico = (ix, iy) => {
    const bx = ix + 4, by = iy + CUADRO - 9;
    // el termometro: el tubo y la bola, con el mercurio del color del estado
    px(bx, by, 2, 6, '#2b3a42'); px(bx - 1, by + 5, 4, 3, '#2b3a42');
    px(bx + 0.5, by + 2.5 - (estado === 'calor' ? 2 : estado === 'templado' ? 1 : 0), 1, 3.5 + (estado === 'calor' ? 2 : estado === 'templado' ? 1 : 0), col);
    px(bx - 0.5, by + 5.5, 3, 2, col);
    if (estado === 'frio') { ctx.strokeStyle = col; ctx.lineWidth = 0.6; for (let k = 0; k < 3; k++) { const a = k * Math.PI / 3; ctx.beginPath(); ctx.moveTo(bx + 6 - Math.cos(a) * 2, by + 2 - Math.sin(a) * 2); ctx.lineTo(bx + 6 + Math.cos(a) * 2, by + 2 + Math.sin(a) * 2); ctx.stroke(); } }
    else if (estado === 'calor') { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(bx + 6, by + 2, 1.3, 0, Math.PI * 2); ctx.fill(); }
  };
  // OTRO ESTILO DE RELOJ (21/11, el autor, con la foto de un "CARB. TEMP": "la temperatura puede ser de este estilo,
  // asi variamos indicadores"): un arco ANCHO Y BAJO de lado a lado, la aguja desde abajo al medio, la franja del
  // HIELO en amarillo (como "keep needle out of yellow arc"), las marcas -20 … 30 y °C debajo del arco
  void ico;
  const fn = () => { termoArco(x, y, t, f, col); escarcha('temp', x, y, t.hielo || 0); };
  if (!enCabina() || enTablero) return fn();
  // EN CABINA, a su relojito (el mismo traslado y escala que `alTablero`)
  ctx.save();
  ctx.translate(ANCLA_TEMP[0] / U, ANCLA_TEMP[1] / U);
  const k = (ANCLA_TEMP[2] / U) / 12.5; ctx.scale(k, k);
  ctx.translate(-(x + 13), -(y + 16));
  enTablero = true; fn(); enTablero = false;
  ctx.restore();
}

function drawBrujula(x, y, b) {
  alTablero(x, y, () => {
    plate(x, y, CUADRO, CUADRO);
    const cx = x + 13, cy = y + 12, r = 9;
    const angDe = rumbo => -Math.PI / 2 + rumbo - b.rumbo;   // arriba = el morro
    for (let i = 0; i < 12; i++) {
      const larga = i % 3 === 0;
      marcaFina(cx, cy, angDe(i * Math.PI / 6), larga ? r - 1.6 : r - 0.7, r + 0.6, larga ? 2 : 1, larga ? ESCALA_LARGA : ESCALA_COL);
    }
    ctx.font = 'bold 4px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    [['N', 0], ['E', Math.PI / 2], ['S', Math.PI], ['O', Math.PI * 1.5]].forEach(([l, a]) => {
      const t = angDe(a);
      ctx.fillStyle = l === 'N' ? P.accent : P.dim;
      ctx.fillText(l, cx + Math.cos(t) * (r - 4.2), cy + Math.sin(t) * (r - 4.2));
    });
    // la rayita fija del morro
    px(cx, y + 1, 1, 3, P.foam);
    if (b.obj !== null) {
      const t = angDe(b.obj), tx = cx + Math.cos(t) * (r + 0.5), ty = cy + Math.sin(t) * (r + 0.5);
      ctx.fillStyle = P.accent; ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(tx - Math.cos(t - 0.5) * 4, ty - Math.sin(t - 0.5) * 4);
      ctx.lineTo(tx - Math.cos(t + 0.5) * 4, ty - Math.sin(t + 0.5) * 4);
      ctx.closePath(); ctx.fill();
      ctx.font = uiFont(NUMEROS.fam, 4.5, ''); ctx.fillStyle = P.accent;
      ctx.fillText((b.dist / 1000).toFixed(1) + 'km', cx, y + CUADRO - 3);
    }
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    if (b.titila && Math.sin(performance.now() / 90) > 0) bordePlaca(x, y, CUADRO, CUADRO, P.accent);
  });
}

// ---------- EL CAÑON (9/10) ----------
// Uno por METRALLA (data/upgrades.js): la COMUN es el reloj simple; la de PLATA y la de ORO llevan la
// terminacion de metal. Las tres llevan, en vez del icono, tres balas finas y largas con borde ("las
// balas mas finas y largas, dorado, borde dorado"; y despues, "las balas y los iconos mejoralos en los
// indicadores base"): en la comun van en el gris apagado de los iconos, con su luz y su sombra.
/** Las tres balas, donde va el icono de los otros relojes: en el metal del reloj o, sin metal, en gris. */
function balas(x, y, met) {
  const pal = met || tonos(P.dim);       // sin metal: los tonos del gris de los iconos (render/iconos.js)
  for (let k = 0; k < 3; k++) pintaFino(x + 3, y + 17 + k * 7 * FINO, CANON_METAL.bala, pal);
}
function relojCanon(x, y, metralla) { return alTablero(x, y, () => relojCanonFila(x, y, metralla)); }
function relojCanonFila(x, y, metralla) {
  const met = METRALLAS[metralla] || METRALLAS[1];
  // MIENTRAS CALIENTA (autor, 9/10: "que la aguja tiemble"): el segundo en que los caños de la de ORO
  // giran sin tirar todavia (`calienta` en METRALLAS, run.giro), la aguja salta contra el tope —cada vez
  // mas, a medida que el giro sube—, como un instrumento sobre una maquina que arranca
  const calentando = met.calienta > 0 && run.giro > 0 && run.giro < met.calienta;
  reloj(x, y, {
    val: run.heat, zona: [0.75, 1], critico: run.overheat || run.heat > 0.75,
    metal: metralla >= 3 ? 'oro' : metralla >= 2 ? 'plata' : null,
    ico: balas,
    tiembla: calentando ? 0.13 * (0.35 + 0.65 * run.giro / met.calienta) * Math.random() : 0,
    // la aguja de la COMUN es BLANCA (autor, 9/10), y roja en la zona donde se traba
    col: run.overheat ? (Math.sin(run.t * 12) > 0 ? P.warn : '#7d2f1e') : run.heat > 0.75 ? P.warn : P.foam,
    txt: Math.round(run.heat * 100) + '%', txtCol: run.overheat ? P.warn : P.dim });
}

// ---------- EL CUADRO DEL PILOTO (playtest 10/9) ----------
// La cara del que vuela, al lado del horizonte y del mismo alto que su placa. Es INMERSION: no
// dice nada que el tablero no diga, pero lo dice con la cara de alguien — y un instante antes de
// que el jugador lo lea en un numero. Los gestos y sus umbrales viven en data/gestos.js.
//
// Y ES DE DONDE SALE LA VOZ DE MI AVION. Si la linea de radio la dice el piloto que vuela, el
// toast no baja de la cinta: sube de esta cara (ver drawRadioVN). Arriba habla la radio de los
// otros; aca abajo, pegado a mis instrumentos, hablo yo.
// `alto` (27/9, autor): la caja crece hacia abajo para llevar el NOMBRE DEL PILOTO bajo la cara —
// arriba, en la placa del escuadron, va el nombre pintado del avion—. El ancho sigue siendo `lado`.
const PILOTO = { lado: 26, cara: 22, alto: 35 };   // (23/11: +3 para la barrita del MOMENTUM entre la cara y el nombre)
/** El canto de arriba de la cara: apoyada en el piso de la fila, como los cuadrados (19/11). */
const PIL_Y = () => CUADROS_Y + CUADRO - PILOTO.alto;
// EN CABINA, LA CARA Y LOS PODERES VAN A LA DERECHA (21/11, el autor: "mover esto a la derecha y por encima de toda
// la cabina"): a la izquierda los tapaba el brazo del acelerador. A la derecha esta la consola, sin manos.
const PIL_X = () => (enCabina() ? W - MARGEN - PILOTO.lado : MARGEN);
let gesto = 'neutro', gestoT = 0, ultPts = 0, sonrisaT = 0, ultT = -1, precargada = null;
// EL GOLPE, con reloj PROPIO. `run.hurtT` parecia servir ("fogonazo rojo en el HUD") pero nada en el
// juego lo baja ni lo lee: damage.js lo pone en 0,6 y queda ahi para siempre. Apoyarse en el dejaba
// la cara roja y preocupada el resto de la mision despues del primer impacto (se vio en captura).
// El golpe se detecta aca, cuando la chapa BAJA de un cuadro al otro.
const GOLPE_T = 0.6;
let golpeT = 0, ultInteg = 100, ultEscudo = 1;
let cajaPiloto = null;
/** El cuadro del piloto ESTE cuadro (o null si no hay cara que mostrar). Lo lee el toast. */
export const pilotoCaja = () => cajaPiloto;
/** El mismo criterio de nombre en todos lados: sin tildes y en mayusculas (PICHÓN = PICHON). */
export const sinTilde = s => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();

/** Que cara le toca AHORA, por lo mismo que lo dice el tablero. De mas a menos urgente. */
function gestoDeseado() {
  if (dmgShown() && run.integ <= 30) return 'roto';
  // LA PANZA bajo 50 %: volar a un metro con el margen de roce casi agotado dejaba la cara neutra
  // hasta el cuadro en que el avion ya tocaba el agua (se vio en la captura a 1,2 m).
  //
  // Es la panza y NO ESTADO entero, a proposito. ESTADO es el minimo de cañon, nafta y panza, y con
  // la nafta por debajo de la mitad queda naranja el resto de la mision: mirando ESTADO, la cara se
  // quedaba preocupada para siempre (la sonda lo mostro: seguia preocupada 2,5 s despues de soltar el
  // turbo). La nafta ya tiene su propio umbral, abajo, en 25 %.
  if (golpeT > 0 || run.scrapeVib > 0.6 || run.detection > 0.3 || amarilla() < 0.5
      || (cfg.fuelOn && run.fuel < 25)) return 'preocupado';
  if (sonrisaT > 0) return 'sonrisa';
  if (run.boost || run.overheat || run.heat > 0.5 || run.rasLevel > 0) return 'ceno';
  return 'neutro';
}

/** Las caras de un piloto, gesto por gesto: las del elenco salen de su nombre (CARA_PILOTO, base +
 *  '_' + gesto); en los modos sueltos, del avion (data/pilotos_avion.js), que game.js manda resuelto
 *  en `delAvion`. null = sin cara. */
function carasDe(nombre, delAvion) {
  if (delAvion) return delAvion.caras;
  const gen = carasGeneral(nombre);   // los pilotos generales del libro de vuelo (data/pilotos_generales.js)
  if (gen) return gen;
  const base = CARA_PILOTO[sinTilde(nombre)];
  return base ? Object.fromEntries(GESTOS.map(g => [g, base + '_' + g])) : null;
}

/** Dibuja la cara y devuelve el x donde sigue el tablero (sin cara: el mismo x, no queda hueco). */
// LOS CARTELES DE CAJA (19/11, el autor: "los cuadraditos tienen que largar un texto que aparezca desde atras, con
// el mismo mensaje que muestra arriba — BAJA ALTURA en rojo, con la aguja titilando y los bordes de la caja tambien";
// "cuando recalienta, desde abajo de la cosa del cañon aparece SOBRECALENTADO"; "la VIDA puede informar igual:
// ONDA EXPANSIVA me daño, los pajaros"). Una lengueta con el texto que SUBE desde atras del canto de la caja, se
// queda y vuelve a bajar. Los sostenidos (calor, altura) viven mientras dure la causa; los de un golpe, AVISO_T.
const AVISO_T = 1.8, AVISO_SUBE = 0.18;
const avisos = {};          // id de caja → { txt, col, t (s de vida), hasta (s; Infinity = sostenido), on }
const avisoReloj = () => performance.now() / 1000;
/** Un cartel de un golpe sobre la caja `id` (zonaHud). Pisa al anterior de esa caja. */
export function avisoCaja(id, txt, col = P.warn, dur = AVISO_T) {
  avisos[id] = { txt, col, t0: avisoReloj(), hasta: dur, sost: false };
}
// LA PILA DE SALUD (19/11, el autor: "que salgan de ultima 2, una arriba de la otra"): un golpe nuevo con el
// anterior todavia arriba lo EMPUJA un piso (queda en `id~1`, encima) y el nuevo sale de atras de la caja.
// El tercero pisa al de arriba: se ven siempre los dos ultimos.
function avisoApilado(id, txt, col = P.warn, dur = AVISO_T) {
  const a = avisos[id];
  if (a && avisoVivo(id)) avisos[id + '~1'] = { ...a, base: id, nivel: 1 };
  avisoCaja(id, txt, col, dur);
}
/** Un cartel SOSTENIDO: aparece mientras `on`, y baja al apagarse. Se llama cada cuadro. */
function avisoSostenido(id, on, txt, col = P.warn) {
  const a = avisos[id];
  if (on) { if (!a || !a.sost || a.txt !== txt) avisos[id] = { txt, col, t0: avisoReloj(), hasta: Infinity, sost: true }; }
  else if (a && a.sost) { a.sost = false; a.hasta = avisoReloj() - a.t0; }
}
/** ¿Esta caja tiene un cartel ARRIBA ahora? (para titilar su borde) */
const avisoVivo = id => { const a = avisos[id]; return !!a && avisoReloj() - a.t0 < a.hasta; };
// LA CAUSA DEL GOLPE, en corto (la ultima `run.golpeCausa`; ver systems/damage.js takeHit)
let golpeVisto = 0;
function causaCorta(c) {
  const k = 'golpe_' + String(c || '').replace(/^death_/, '');
  const t = T(k);
  return t && t !== k ? t : T('golpe_generico');
}
function drawAvisosCaja() {
  // los que mira el tablero solo: el CAÑON trabado, el ROCE del agua (el mismo ¡PELIGRO! BAJA ALTURA de arriba)
  avisoSostenido('canon', !!run.overheat && !run.sinCanon, T('bar_overheat'));
  avisoSostenido('alt', run.scrapeVib > 0.6, T('scrapeSub'));
  if ((run.golpeN | 0) !== golpeVisto) { golpeVisto = run.golpeN | 0; if (golpeVisto) avisoApilado('salud', causaCorta(run.golpeCausa)); }
  const ahora = avisoReloj();
  for (const id in avisos) {
    const a = avisos[id], z = zonaHud(a.base || id);
    const vida = ahora - a.t0, resto = a.hasta - vida;
    if (resto < -AVISO_SUBE || !z) { delete avisos[id]; continue; }
    // sube en AVISO_SUBE, se queda, y baja en AVISO_SUBE al final
    const u = Math.max(0, Math.min(1, Math.min(vida, resto + AVISO_SUBE) / AVISO_SUBE));
    const e = 1 - Math.pow(1 - u, 3);
    // (19/11, el autor: "tiene que entrar en el ancho total del cuadrado"): la lengueta mide lo que la caja, y el
    // texto se achica hasta entrar
    // texto en DOS RENGLONES si no entra en uno ("BAJA" / "ALTURA"), y la letra se achica si aun asi no entra
    const w = z.w;
    // (19/11, el autor: "mas chico, como el texto de ALTURA en el tutorial, igual"): la misma letra que los rotulos
    let fs = 3.5; ctx.font = 'bold ' + labelFont(fs);
    let filas = [a.txt];
    if (ctx.measureText(a.txt).width > w - 3 && a.txt.includes(' ')) {
      const p = a.txt.split(' '), m = Math.ceil(p.length / 2);
      filas = [p.slice(0, m).join(' '), p.slice(m).join(' ')];
    }
    const ancho = () => Math.max(...filas.map(f => ctx.measureText(f).width));
    while (fs > 2.5 && ancho() > w - 3) { fs -= 0.25; ctx.font = 'bold ' + labelFont(fs); }
    const LH = 4.5, hh = filas.length * LH + 1, x = z.x;
    a.hh = e * (hh + 1);   // lo que asoma ahora (el de arriba sube con el)
    // el de ARRIBA de la pila sale de atras del de abajo (su alto, si sigue vivo)
    const abajo = a.nivel ? avisos[a.base] : null;
    const y0 = z.y - (abajo && abajo.hh ? abajo.hh : 0);
    const y = Math.round(y0 - e * (hh + 1));
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 0, W, y0); ctx.clip();           // sale DE ATRAS del canto de la caja
    ctx.fillStyle = '#0a0e11ee'; ctx.fillRect(x, y, w, hh + 2);
    // (sin borde: 19/11, el autor: "quitemosle borde, dejemos la letra en rojo")
    ctx.fillStyle = a.col; ctx.textAlign = 'center';
    // MAS NEGRITA (21/11, el autor: "los textos chicos como BAJA ALTURA deben ser mas negrita"): la letra de los rotulos
    // no trae un peso bold de verdad, asi que se le pasa un trazo fino del mismo color por encima
    ctx.strokeStyle = a.col; ctx.lineWidth = 0.32; ctx.lineJoin = 'round';
    filas.forEach((f, i) => { ctx.fillText(f, x + w / 2, y + 5 + i * LH, w - 2); ctx.strokeText(f, x + w / 2, y + 5 + i * LH, w - 2); });
    ctx.restore();
  }
}
/** EL BORDE QUE TITILA de una caja con cartel (despues de la fila: va encima del marco). */
function bordesAvisos() {
  if (Math.floor(performance.now() / 140) % 2) return;
  for (const id in avisos) {
    if (!avisoVivo(id) || avisos[id].nivel) continue;
    const z = zonaHud(id); if (!z) continue;
    ctx.strokeStyle = avisos[id].col; ctx.lineWidth = 1;
    // (en el tablero de la cabina el reloj es redondo: el borde es un aro)
    if (z.redondo) { ctx.beginPath(); ctx.arc(z.x + z.w / 2, z.y + z.h / 2, z.w / 2, 0, Math.PI * 2); ctx.stroke(); }
    else ctx.strokeRect(z.x + 0.5, z.y + 0.5, z.w - 1, z.h - 1);
  }
}

/** LA BARRITA DEL MOMENTUM (23/11): 2 px de alto, sin texto, del ancho de la cara, entre la cara y el nombre. Vacia en
 *  gris; cargando en amarillo; LLENA late en claro; GASTANDOSE titila y le saltan chispas a la punta. */
function barritaMomentum(x, y, w) {
  if (cfg.poderes === false) { donde.momentum = null; return; }
  const v = Math.max(0, Math.min(1, tempoMeter())), on = tempoActive(), llena = v >= 1 && !on;
  px(x, y, w, 2, '#2e3c45');
  const fw = Math.round(w * v);
  const col = on ? (Math.sin(run.t * 14) > 0 ? MOM_CLARO : MOM_COL) : llena ? (Math.sin(run.t * 5) > 0 ? MOM_CLARO : MOM_COL) : MOM_COL;
  if (fw > 0) px(x, y, fw, 2, col);
  if (on && fw > 0) chispas(x + fw, y, 2, '#ffffff', MOM_COL);
  donde.momentum = [x + w / 2, y];
}
/** EL ICONO DEL HIELO (23/11, el autor: "en los 3 indicadores, pero BIEN HECHO el icono de hielo y arriba a la derecha"):
 *  un copo de 7 x 7 en pixel art — el centro blanco, los seis brazos celestes con sus puntas, sobre una placa oscura
 *  de 9 x 9. (x, y) es la esquina de arriba a la izquierda de la placa. */
const COPO_PIX = ['x..x..x', '.x.x.x.', '..xxx..', 'xxxoxxx', '..xxx..', '.x.x.x.', 'x..x..x'];
function iconoHielo(x, y) {
  x = Math.round(x); y = Math.round(y);
  ctx.save();
  ctx.globalAlpha = 0.8; ctx.fillStyle = '#0b1620'; ctx.fillRect(x, y, 9, 9);
  ctx.globalAlpha = 1; ctx.fillStyle = '#5fa8d8'; ctx.fillRect(x, y, 9, 1); ctx.fillRect(x, y + 8, 9, 1); ctx.fillRect(x, y, 1, 9); ctx.fillRect(x + 8, y, 1, 9);
  for (let j = 0; j < 7; j++) for (let i = 0; i < 7; i++) {
    const c = COPO_PIX[j][i];
    if (c === '.') continue;
    const punta = (i === 0 || i === 6 || j === 0 || j === 6);
    ctx.fillStyle = c === 'o' ? '#ffffff' : punta ? '#8fd0ff' : '#d6f1ff';
    ctx.fillRect(x + 1 + i, y + 1 + j, 1, 1);
  }
  ctx.restore();
}
/** EL COPO: tres rayas cruzadas con puntitas, radio `r`, centrado en (cx, cy). */
function copo(cx, cy, r, col) {
  ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 1; ctx.lineCap = 'round';
  for (let i = 0; i < 3; i++) {
    const a = i * Math.PI / 3, dx = Math.cos(a) * r, dy = Math.sin(a) * r;
    ctx.beginPath(); ctx.moveTo(cx - dx, cy - dy); ctx.lineTo(cx + dx, cy + dy); ctx.stroke();
  }
  ctx.restore();
}
/** La cara del piloto con el hielo del avion: velo, escarcha en las esquinas, borde de hielo y el copo. */
function pilotoHelado(x, y, lado, nivel) {
  if (nivel <= 0.02) return;
  ctx.save();
  ctx.globalAlpha = Math.min(0.22, nivel * 0.3); ctx.fillStyle = '#cfeeff'; ctx.fillRect(x, y, lado, lado);
  ctx.globalAlpha = 1;
  esquinasHielo(x, y, lado, nivel * 0.6);
  ctx.globalAlpha = Math.min(1, nivel * 1.6); ctx.strokeStyle = '#bfe8ff'; ctx.lineWidth = 1; ctx.strokeRect(x - 0.5, y - 0.5, lado + 1, lado + 1);
  ctx.globalAlpha = 1;
  // el copo BIEN chiquito, en la esquina (23/11: "el del piloto hacerlo bien chiquito a un costado")
  if (nivel > 0.15) iconoHielo(x + lado - 9, y);
  ctx.restore();
}
/** Manchas de escarcha que CRECEN desde las cuatro esquinas (triangulos tramados), del tamaño que dice `nivel`. */
function esquinasHielo(x, y, lado, nivel) {
  const L = Math.round(Math.min(lado * 0.45, 2 + nivel * lado * 0.5));
  for (let i = 0; i < L; i++) for (let j = 0; j < L - i; j++) {
    if (((i * 7 + j * 3) % 5) === 0 && i + j > L * 0.55) continue;   // el filo, deshilachado
    ctx.fillStyle = (i + j) % 3 === 0 ? '#ffffff' : '#d6f1ff';
    ctx.globalAlpha = Math.min(0.95, 0.35 + nivel) * (1 - (i + j) / (L + 1) * 0.6);
    ctx.fillRect(x + i, y + j, 1, 1); ctx.fillRect(x + lado - 1 - i, y + j, 1, 1);
    ctx.fillRect(x + i, y + lado - 1 - j, 1, 1); ctx.fillRect(x + lado - 1 - i, y + lado - 1 - j, 1, 1);
  }
  ctx.globalAlpha = 1;
}
/** EYECCION PREPARADA (23/11, el autor: "que aparezca EYECCION PREPARADA desde el recuadro del piloto"): la cruceta ◄
 *  la arma (game.js `eyeccionPad`) y hasta que se vence el marco del piloto titila en rojo y al costado sale la placa,
 *  con una barrita que se gasta: lo que queda para el segundo toque. */
function eyeccionPreparada(x, y) {
  const u = run.eyecArma || 0;
  if (u <= 0) return;
  const on = Math.floor(run.t * 6) % 2 === 0;
  ctx.save();
  ctx.strokeStyle = on ? '#ff3a24' : '#8a1d12'; ctx.lineWidth = 1;
  ctx.strokeRect(x + 0.5, y + 0.5, PILOTO.lado - 1, PILOTO.alto - 1);
  ctx.strokeRect(x - 0.5, y - 0.5, PILOTO.lado + 1, PILOTO.alto + 1);
  ctx.font = F_ROT;
  const t1 = T('islasEyecArma'), t2 = T('islasEyecArmaSub');
  const w = Math.max(ctx.measureText(t1).width, ctx.measureText(t2).width) + 6, bx = x + PILOTO.lado + 2, by = y + 4;
  ctx.fillStyle = 'rgba(20,4,2,0.88)'; ctx.fillRect(bx, by, w, 17);
  ctx.fillStyle = on ? '#ff3a24' : '#c42a18'; ctx.fillRect(bx, by, 1, 17);
  ctx.textAlign = 'left';
  ctx.fillStyle = '#ff5a40'; ctx.fillText(t1, bx + 4, by + 6);
  ctx.fillStyle = P.foam; ctx.fillText(t2, bx + 4, by + 12);
  ctx.fillStyle = '#ff3a24'; ctx.fillRect(bx + 4, by + 14.5, (w - 8) * u, 1);
  ctx.restore();
}
// EL APELLIDO DEL NUMERAL (23/11, el autor: "ponerle arriba del piloto un apellido random argentino"): los genericos
// (PATRIA 1, PILOTO) sortean uno de data/apellidos.js por corrida, distinto para cada numeral; los que tienen nombre
// propio (TERO, ESTEBAN…) llevan el suyo
function drawPiloto(charlaVoz, delAvion, avionNombre) {
  // APARTE DEL TABLERO (11/9): arriba de la esquina izquierda, y no en la fila. La cara no es un
  // instrumento, y a su derecha tiene que quedar lugar para lo que dice (drawVozPropia, en screens).
  const x = PIL_X(), y = PIL_Y();
  const nombre = pilotName(alMando(run));
  const caras = carasDe(nombre, delAvion);
  if (!caras) return x;
  // el reloj del cuadro sale de `run.t`: el HUD no recibe dt, y una corrida nueva (run.t que
  // vuelve para atras) arranca la cara de cero en vez de heredar la sonrisa de la anterior
  const nueva = ultT < 0 || run.t < ultT;
  const dt = nueva ? 0 : Math.min(0.1, run.t - ultT);
  if (nueva) { gesto = 'neutro'; gestoT = 0; sonrisaT = 0; ultPts = run.score; golpeT = 0; ultInteg = run.integ; ultEscudo = run.escudo; resortearApellidos(); }
  // un golpe es la chapa que BAJA; que suba (avion nuevo del relevo, o una sonda) no es golpe
  // …o cuando el ESCUDO pega un salto: una bala que para entera no toca la chapa, pero es un golpe.
  // El roce lo gasta de a poco (a fondo y con turbo, ~0,17 por cuadro) y no cuenta como golpe.
  if (run.integ < ultInteg || run.escudo < ultEscudo - 0.3) golpeT = GOLPE_T;
  ultInteg = run.integ; ultEscudo = run.escudo;
  golpeT = Math.max(0, golpeT - dt);
  ultT = run.t;
  if (run.score - ultPts >= SONRISA_PTS) sonrisaT = SONRISA_T;
  ultPts = run.score;
  sonrisaT = Math.max(0, sonrisaT - dt);
  const quiere = gestoDeseado();
  if (quiere !== gesto && (GESTOS.indexOf(quiere) < GESTOS.indexOf(gesto) || gestoT >= GESTO_SOSTEN)) { gesto = quiere; gestoT = 0; }
  gestoT += dt;
  // las cinco caras del que vuela se piden juntas la primera vez: si no, el primer gesto de cada
  // una tardaria un cuadro en cargar y se veria la neutra en el momento justo del susto
  if (precargada !== caras.neutro) { precargada = caras.neutro; for (const g of GESTOS) retrato(caras[g]); }

  plate(x, y, PILOTO.lado, PILOTO.alto);
  // el sacudon tambien lo sufre el piloto: un pixel, nada mas
  const j = run.shake > 2 ? Math.round((Math.random() - 0.5) * 2) : 0;
  const cara = retrato(caras[gesto]) ? caras[gesto] : caras.neutro;
  const im = retrato(cara);
  if (im) ctx.drawImage(im, x + 2 + j, y + 2, PILOTO.cara, PILOTO.cara);
  else silueta(x + 2, y + 2, PILOTO.cara);
  // el impacto: el mismo fogonazo rojo que ya usa el HUD, sobre la cara
  if (golpeT > 0) { ctx.globalAlpha = Math.min(0.45, golpeT * 0.75); px(x + 2, y + 2, PILOTO.cara, PILOTO.cara, '#ff3a24'); ctx.globalAlpha = 1; }
  // EL AVION CONGELADO SE VE EN EL PILOTO (23/11, el autor: "el estado del avion podemos marcarlo en el piloto"): la cara
  // se escarcha con el hielo de las alas y lleva el copo en la esquina
  pilotoHelado(x + 2, y + 2, PILOTO.cara, run.hielo || 0);
  barritaMomentum(x + 2, y + 2 + PILOTO.cara + 1, PILOTO.cara);
  eyeccionPreparada(x, y);
  // CUANDO HABLA, el marco se prende: la linea sale de aca y el ojo tiene que saber de donde
  // …POR CUALQUIERA DE LAS DOS VOCES: la radio y la charla. Antes miraba solo la radio, asi que en
  // mis lineas de charla la cara quedaba apagada mientras mi propia caja hablaba al lado (11/9).
  const habla = (radioVisible() && radio.personaje && sinTilde(radio.personaje) === sinTilde(nombre))
    || (charlaVoz && sinTilde(charlaVoz) === sinTilde(nombre));
  // ARRIBA, EL AVION (23/11, el autor: "inverti: pone el nombre donde esta el avion y donde esta hoy el nombre el avion,
  // y un iconito de avion a la izquierda"): en su placa chica, con el avioncito del tablero del escuadron; ABAJO, en la
  // caja, el APELLIDO del que vuela. Si no entran en el ancho, se aprietan (no se cortan)
  const ape = apellidoDe(nombre), avion = avionNombre || '';
  ctx.font = '3.6px monospace'; ctx.textAlign = 'left';
  if (avion) {
    // (23/11, despues: "quitemos el icono ese de avion"): solo el nombre del avion
    const wT = Math.min(PILOTO.lado + 8, ctx.measureText(avion).width), wA = wT + 4, xA = Math.round(x + PILOTO.lado / 2 - wA / 2);
    plate(xA, y - 8, Math.round(wA), 7);
    ctx.fillStyle = P.dim; ctx.fillText(avion, xA + 2, y - 3, PILOTO.lado + 8);
  }
  ctx.font = F_ROT; ctx.textAlign = 'center'; ctx.fillStyle = P.foam;
  ctx.fillText(ape, x + PILOTO.lado / 2, y + PILOTO.alto - 2, PILOTO.lado - 2);
  ctx.textAlign = 'left';
  if (habla) { ctx.strokeStyle = P.accent; ctx.strokeRect(x + 0.5, y + 0.5, PILOTO.lado - 1, PILOTO.alto - 1); }
  // `cara` es la que se esta viendo AHORA (con su gesto): si mi linea tiene que ir arriba porque
  // abajo hay una charla, el toast usa ESTA y no el retrato de radio — ver drawRadioVN
  cajaPiloto = { x, y, lado: PILOTO.lado, alto: PILOTO.alto, nombre, cara, gesto };
  return x + PILOTO.lado + AIRE;
}


/** LA TARJETA DE UN PILOTO con su esquina de arriba a la izquierda en (x, y): la misma caja que la del
 *  que vuela (drawPiloto) — su cara y su nombre —, pero de CUALQUIER piloto y sin gestos. La usa el
 *  relevo (game.js): la tarjeta del que entra llega desde la izquierda a SU LUGAR DEL HUD y se queda
 *  ahi, asi que cuando vuelve el HUD la de drawPiloto la reemplaza sin salto (pedido del autor, 4/10).
 *  Devuelve false si ese piloto no tiene retrato. */
export function tarjetaPiloto(nombre, x, y, delAvion) {
  const caras = carasDe(nombre, delAvion);
  if (!caras) return false;
  x = Math.round(x);
  plate(x, y, PILOTO.lado, PILOTO.alto);
  const im = retrato(caras.neutro);
  if (im) ctx.drawImage(im, x + 2, y + 2, PILOTO.cara, PILOTO.cara);
  else silueta(x + 2, y + 2, PILOTO.cara);
  ctx.font = F_ROT; ctx.textAlign = 'center'; ctx.fillStyle = P.foam;
  ctx.fillText(nombre, x + PILOTO.lado / 2, y + PILOTO.alto - 2, PILOTO.lado - 2);
  ctx.textAlign = 'left';
  return true;
}
export const TARJETA_LADO = PILOTO.lado;
/** Donde va la tarjeta del piloto en el HUD (la misma cuenta que drawPiloto). */
export const tarjetaLugar = () => ({ x: PIL_X(), y: PIL_Y() });

// TABLERO DEL ESCUADRON: un avion por vida — los caidos quedan TACHADOS, no desaparecen.
// Que el avion siga ahi, oscuro y cruzado, es lo que hace que una vida menos sea un companero
// menos y no un numero menos. Al lado, el indicativo del piloto al mando.
// Lo comparte el HUD de vuelo y la sobreimpresion del relevo (render/squad.js).
//
// UN RENGLON Y SIN ROTULO (playtest 11/9). Los aviones son el MISMO dibujo que avanza por la ruta
// de la cinta, uno detras del otro con la nariz hacia el blanco: una formacion en fila, que se
// cuenta de un vistazo. El rotulo ESCUADRON se fue — seis aviones en fila ya dicen que son un
// escuadron — y con el, el segundo renglon: la placa baja de 17 a 11, la misma altura que la cinta.
// El nombre va despues de un hueco del doble del que hay entre aviones, para que no se lea como un
// avion mas con letras (que era el motivo de los dos renglones, playtest 29/8).
export const SQUAD_H = 11;
const SQ_PASO = 9;           // el avion mide 7, y entre uno y otro van 2
// UNA SOLA VIDA, AUNQUE DESPEGUE EL ESCUADRON ENTERO (pedido del autor, 18/9). En una mision donde no
// se puede morir (`sinMuerte`, hoy el tutorial) los otros cuatro vuelan, pero no son vidas: no hay
// relevo que los ponga a los mandos. El tablero muestra a Tero solo. Llega por snapshot (`h.unaVida`).
let soloTero = false;
const avionesEnPlaca = () => (soloTero ? 1 : run.squad);

/** EL ANCHO DE LA PLACA DEL ESCUADRON. Sale aparte porque el panel de NIVEL DE ALERTA se dibuja
 *  justo debajo y tiene que medir LO MISMO — y dos copias de esta cuenta es el bug que este repo
 *  ya se comio dos veces. El ancho depende del texto, asi que hay que medirlo, no adivinarlo.
 *
 *  Vale aunque no haya placa (`run.squad <= 1`): el panel de alerta igual necesita un ancho, y que
 *  sea el que la placa TENDRIA es lo que mantiene la columna alineada cuando el escuadron aparece.
 *
 *  Y ES EL ANCHO DE LA COLUMNA, no solo del escuadron: nunca menos de lo que necesitan el radar y
 *  las cuatro balizas. Con dos aviones y un indicativo corto ("PUMA") la placa sola mide 40, y las
 *  balizas se salian por el costado. Crece la columna entera, y las dos placas siguen iguales. */
/** LO QUE DICE LA PLACA DEL ESCUADRON (autor, 27/9): el NOMBRE PINTADO del avion que vuela
 *  (GAMBETA, ESPOLA…); el piloto va en su caja, bajo la cara. Fuera de campaña no hay chapa con
 *  nombre y queda el indicativo de siempre. */
const nombrePlaca = i => planeName(i) || apellidoDe(pilotName(i));

export function anchoSquad() {
  const nombre = nombrePlaca(alMando(run));
  ctx.font = F_VAL;
  const wFila = Math.max(2, avionesEnPlaca()) * SQ_PASO + 3 + ctx.measureText(nombre).width;
  return Math.max(ALERTA_MIN_W, Math.round(wFila) + 6);
}

// EL RELOJ DEL TALLER (16/11, el autor: "avion gris atras, tuerca completamente naranja sin opacidad, circulo
// con opacidad al 50%"): encima del avion, un circulo naranja a media luz que se llena en sentido horario de 0
// a `f` (1 = listo), y el engranaje naranja macizo al medio.
/** LA CHANCHA EN LAS ISLAS: su silueta con un aro que se llena (como el relojito del taller), el aro en `col`, y lo
 *  que falta al costado. Arriba de la nafta; en cabina, en el relojito de la Chancha del tablero. */
// FUERA DE LA CABINA, UNA GOTITA ADENTRO DE LA NAFTA (21/11, el autor: "achicarlo mas… ponerlo dentro del contador
// de combustible arriba a la derecha como un circulo con gotita gris que pasa a verde cuando se puede pedir")
const CH_NAFTA = { x: X_NAFTA + CUADRO - 5, y: CUADROS_Y + 5, r: 3.5 };
function chanchaGota(f, col, lista) {
  const { x: cx, y: cy, r: R } = CH_NAFTA;
  ctx.save();
  ctx.globalAlpha = 0.8; ctx.fillStyle = '#0a0e11'; ctx.beginPath(); ctx.arc(cx, cy, R + 1, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 0.4; ctx.lineWidth = 0.75; ctx.strokeStyle = col;
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
  ctx.globalAlpha = lista ? 0.65 + 0.35 * Math.sin(run.t * 6) : 1;
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.max(0, Math.min(1, f))); ctx.stroke();
  // la gotita: punta arriba y panza abajo
  ctx.fillStyle = col; ctx.beginPath();
  ctx.moveTo(cx, cy - 2.2);
  ctx.quadraticCurveTo(cx + 1.6, cy - 0.1, cx + 1.3, cy + 0.8);
  ctx.arc(cx, cy + 0.6, 1.3, 0.15, Math.PI - 0.15);
  ctx.quadraticCurveTo(cx - 1.6, cy - 0.1, cx, cy - 2.2);
  ctx.fill();
  ctx.restore();
}
function chanchaIcono(f, col, txt, lista) {
  const an = enCabina() ? CABINA_ANCLAS.chancha : null;
  if (!an) { chanchaGota(f, col, lista); return; }
  const cx = an[0] / U, cy = an[1] / U, R = an[2] / U;
  ctx.save();
  if (!an) { ctx.globalAlpha = 0.75; ctx.fillStyle = '#0a0e11'; ctx.beginPath(); ctx.arc(cx, cy, R + 1.5, 0, Math.PI * 2); ctx.fill(); }
  ctx.globalAlpha = 0.45; ctx.lineWidth = 1; ctx.strokeStyle = col;
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
  ctx.globalAlpha = lista ? 0.65 + 0.35 * Math.sin(run.t * 6) : 1;
  ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.max(0, Math.min(1, f))); ctx.stroke();
  ctx.globalAlpha = 1;
  iconoEn(cx, cy, 'chancha', col);
  if (txt) { ctx.font = uiFont(NUMEROS.fam, 4.5, ''); ctx.textAlign = 'left'; ctx.fillStyle = col; ctx.fillText(txt, cx + R + 2.5, cy + 2); }
  ctx.restore();
}

function relojTaller(cx, cy, f) {
  const R = 4, NAR = P.accent;
  ctx.save();
  ctx.globalAlpha = 0.5;
  ctx.beginPath(); ctx.arc(cx, cy, R - 0.25, 0, Math.PI * 2); ctx.lineWidth = 0.5; ctx.strokeStyle = NAR; ctx.stroke();
  if (f > 0) {
    // (16/11, el autor: "a medida que se va llenando el naranja es mas fuerte, pero sigue siendo transparente")
    ctx.globalAlpha = 0.2 + 0.45 * Math.min(1, f);
    ctx.beginPath(); ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, f));
    ctx.closePath(); ctx.fillStyle = NAR; ctx.fill();
    ctx.globalAlpha = 0.5;
  }
  // COMO UN RELOJITO (16/11, el autor): las cuatro horas marcadas y la aguja donde va el llenado
  for (let q = 0; q < 4; q++) { const a = q * Math.PI / 2; ctx.beginPath(); ctx.moveTo(cx + Math.sin(a) * (R - 1.1), cy - Math.cos(a) * (R - 1.1)); ctx.lineTo(cx + Math.sin(a) * R, cy - Math.cos(a) * R); ctx.lineWidth = 0.5; ctx.strokeStyle = NAR; ctx.stroke(); }
  ctx.globalAlpha = 1;
  const ag = Math.PI * 2 * Math.min(1, f);
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.sin(ag) * (R - 0.4), cy - Math.cos(ag) * (R - 0.4));
  ctx.lineWidth = 0.6; ctx.strokeStyle = NAR; ctx.stroke();
  ctx.beginPath();
  // EL ENGRANAJE (16/11, el autor: "cambiemos la tuerca por un engranaje"): ocho dientes
  for (let i = 0; i < 32; i++) { const a = i * Math.PI / 16, r = (i >> 1) % 2 ? 1.25 : 1.95; ctx[i ? 'lineTo' : 'moveTo'](cx + Math.cos(a) * r, cy + Math.sin(a) * r); }
  ctx.closePath(); ctx.fillStyle = NAR; ctx.fill();
  ctx.beginPath(); ctx.arc(cx, cy, 0.6, 0, Math.PI * 2); ctx.fillStyle = '#0d1318'; ctx.fill();
  ctx.restore();
}

/** EL GOLPE DE LA FALLA sobre el avion `n` de la placa (centro cx, cy) — 23/11, la ESCUADRILLA CON FALLAS: game.js
 *  arma `run.fallasAlerta` ({ n, t }) y suena la chapa; aca solo el dibujo, de un solo momento (FALLA_ALERTA.DURA): un
 *  destello rojo que tapa el avion y se apaga, el avion sacudido, chispas que saltan y un anillo que se abre. */
function golpeFalla(n, cx, cy) {
  const a = (run.fallasAlerta || []).find(q => q.n === n);
  if (!a) return;
  const u = (run.t - a.t) / FALLA_ALERTA.DURA;
  if (u < 0 || u > 1) return;
  const ROJO = '#ff4a32';
  ctx.save();
  // el anillo que se abre
  ctx.globalAlpha = (1 - u) * 0.9; ctx.strokeStyle = ROJO; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(cx + 0.5, cy + 0.5, 3 + u * 9, 0, Math.PI * 2); ctx.stroke();
  // el avion en rojo, sacudido los primeros instantes
  const sac = u < 0.35 ? Math.round(Math.sin(u * 90) * 1.5) : 0;
  ctx.globalAlpha = 1;
  iconoEn(cx + sac, cy, 'avion', u < 0.5 || Math.sin(u * 40) > 0 ? ROJO : '#7a2c22');
  // el destello del golpe: blanco al principio, enseguida rojo
  if (u < 0.25) {
    ctx.globalAlpha = 1 - u / 0.25; ctx.fillStyle = u < 0.08 ? '#ffffff' : ROJO;
    ctx.fillRect(cx - 3.5 + sac, cy - 3.5, 8, 8);
  }
  // las chispas: seis rayitas que saltan y caen
  ctx.globalAlpha = Math.max(0, 1 - u * 1.4); ctx.fillStyle = u < 0.3 ? '#ffd27a' : ROJO;
  for (let k = 0; k < 6; k++) {
    const ang = k * 1.047 + n * 0.7, d = 2 + u * 10;
    ctx.fillRect(Math.round(cx + 0.5 + Math.cos(ang) * d), Math.round(cy + 0.5 + Math.sin(ang) * d * 0.8 + u * u * 4), 1, 1);
  }
  ctx.restore();
}

export function drawSquadPips(x, y) {
  // QUIEN VUELA Y QUIEN CAYO SALEN DE LA FILA (core/squad.js), no de la cuenta de vidas: con el
  // CAMBIO DE PILOTO puede volar PATRIA 3 con PATRIA 2 vivo esperando atras. Caido es el que ya no
  // esta en la fila. Con la mecanica apagada da lo mismo que antes — los caidos son los de abajo.
  const manda = alMando(run);
  const nombre = nombrePlaca(manda);
  const vivos = filaOk(run) ? run.orden : filaDeVidas(run.squad, run.lives);
  ctx.textAlign = 'left';
  plate(x, y, anchoSquad(), SQUAD_H);
  // LA ESCUADRILLA CON FALLAS TAMBIEN LATE (23/11, el autor: "cuando se muestran los aviones rotos, que la seccion de
  // aviones tambien titile y parpadee igual, el borde"): mientras dura el aviso (run.fallasAlerta), la placa late en rojo
  // y su borde doble titila al mismo ritmo que el cartel de alerta (drawUnCartel `late`)
  if ((run.fallasAlerta || []).some(a => run.t >= a.t - FALLA_ALERTA.ANTES && run.t <= a.t + FALLA_ALERTA.DURA)) {
    const late = 0.5 + 0.5 * Math.sin(performance.now() / 70), w = anchoSquad();
    ctx.save();
    ctx.globalAlpha = 0.14 + 0.16 * late; ctx.fillStyle = P.warn; ctx.fillRect(x + 1, y + 1, w - 2, SQUAD_H - 2);
    ctx.restore();
    if (late > 0.35) bordePlaca(x - 1, y - 1, w + 2, SQUAD_H + 2, P.warn);
  }
  for (let i = 0; i < avionesEnPlaca(); i++) {
    const ax = x + 3 + i * SQ_PASO, down = !vivos.includes(i);
    // el que vuela, en acento; los que esperan, claros; los caidos, SOLO en gris oscuro. El tachado
    // rojo encima se comia el avion y gritaba mas que el escuadron entero (pedido del autor, 12/9):
    // que la silueta siga ahi, apagada, ya dice que ese no vuelve — y es lo que se pidio desde el
    // principio (un compañero menos, no un numero menos), sin el subrayado.
    // LAS FALLAS (PLAN_FALLAS §3, modos sueltos): el que espera, en su color — verde bien, ambar con fallas,
    // rojo con una TOTAL o con dos (y titila); el que esta en la BASE, gris azulado con lo que le falta
    const base = (run.enBase || []).find(b => b.n === i);
    const est = !down && run.fallasFlota ? estadoAvion(run.fallasFlota[i]) : 'bien';
    const colFalla = est === 'fallas' ? '#e0a83a' : est === 'muchas' ? (Math.sin(run.t * 8) > -0.2 ? '#e0503a' : '#7a2c22') : null;
    // EL QUE VUELA SE MARCA CON UNA FLECHA, no con el color de sus fallas (18/10, el autor: "el avion
    // seleccionado esta en rojo y titila, deberia ser una flecha; rojo parece atacado o dañado"): va en
    // acento, quieto, con la flechita debajo. Sus fallas ya las dicen los relojes; las de los que
    // esperan, su color.
    iconoEn(ax + 3, y + 5, 'avion', base ? '#5d7686' : down ? '#3a4750' : i === manda ? P.accent : (colFalla || P.foam));
    if (i === manda) { px(ax + 3, y + SQUAD_H - 2, 1, 1, P.accent); px(ax + 2, y + SQUAD_H - 1, 3, 1, P.accent); }   // la flechita, sobre el borde de la placa
    // …Y EL RELOJ DEL TALLER ENCIMA (16/11, antes una llave inglesa y una rayita de progreso abajo): el gris
    // solo se confundia con un caido; el circulo dice "en el taller" y cuanto le falta
    if (base) relojTaller(ax + 3, y + 5, Math.max(0, Math.min(1, 1 - base.t / BASE_T)));
    golpeFalla(i, ax + 3, y + 5);
  }
  // EL NOMBRE DEL QUE VUELA, EN ACENTO. Estaba en `dim` —el gris de los rotulos— y ahi el piloto
  // era una etiqueta mas. Es la unica persona que hay en el HUD: va del color del que manda.
  ctx.fillStyle = P.accent; ctx.font = F_VAL;
  ctx.fillText(nombre, x + 5 + avionesEnPlaca() * SQ_PASO, y + 8);
}

/** NIVEL DE ALERTA — cuantos te estan buscando (PLAN_ESTRELLAS_BUSQUEDA §7).
 *
 *  VIVE DEBAJO DEL ESCUADRON Y CON SU MISMO ANCHO, por pedido del autor, y la ubicacion dice algo:
 *  la esquina de arriba a la izquierda es QUIEN VUELA — cuantos quedan y quien manda. Cuantos te
 *  buscan es la otra mitad de la misma pregunta, y leerlas juntas es leer la corrida.
 *
 *  SIN UNA PALABRA (playtest 11/9): un RADAR y cuatro BALIZAS. Los numeros de antes pedian leer un
 *  rotulo para saber que contaban; una baliza encendida dice "alarma" antes de que el ojo llegue a
 *  pensarlo. Y se portan como las estrellas de GTA, que es la analogia de la que nacio el item:
 *    · las que no tenes estan APAGADAS pero a la vista: se ve cuantas pueden venir todavia (con
 *      alguna encendida; con todas apagadas se esconden detras del radar, ver drawAlerta);
 *    · la que acabas de ganar DESTELLA un rato, con rayos: el flanco se ve, no solo se oye;
 *    · mientras estas ESCONDIDO parpadea la de arriba —la que el reloj esta descontando y se va a
 *      apagar—, cada vez mas rapido al final; las de abajo quedan quietas, siguen ganadas;
 *    · todas quietas quiere decir que te estan viendo.
 *  El radar dice lo mismo desde el otro lado: con tu contacto parpadeando rapido y encendido, te
 *  tienen; con el eco lento y apagado, te buscan donde estabas.
 *
 *  Y DEBAJO CORRE EL RELOJ DEL ESCONDITE, que es lo que vuelve la mecanica jugable: si sostener el
 *  rasante veinte segundos baja un nivel, el jugador tiene que VER esos veinte segundos correr. El
 *  parpadeo dice QUE esta pasando; el reloj, CUANTO falta. Sin el, esconderse es fe. */
export const ALERTA_H = 15;

// EL RADAR: una pantalla redonda de 9x9 con su barrido. El aro va por tramos de fila,
// [fila, desde, hasta], porque a este tamaño un circulo calculado sale chanfleado y se lee cuadrado.
const RADAR_ARO = [[0, 3, 5], [1, 1, 2], [1, 6, 7], [2, 1, 1], [2, 7, 7], [3, 0, 0], [3, 8, 8],
  [4, 0, 0], [4, 8, 8], [5, 0, 0], [5, 8, 8], [6, 1, 1], [6, 7, 7], [7, 1, 2], [7, 6, 7], [8, 3, 5]];
const RADAR_GIRO = 4.2;   // rad/s del barrido: una vuelta cada segundo y medio
// EL BARRIDO ES EL ESTADO, NO UN ADORNO (pedido del autor, 25/9/2026). Antes giraba SIEMPRE, y una
// antena dando vueltas donde no hay antena no significa nada. Ahora el icono dice de una sola
// mirada si hay sistema o no, y lo dice de las dos maneras a la vez —color y movimiento—:
//   FUERA del horizonte     gris (RADAR_GRIS) y QUIETO: no hay radar. Una pantalla apagada.
//   DENTRO de la zona       verde apagado (OPACO) y GIRANDO: esta activo, buscando — todavia no a vos.
//   TE ESTAN BUSCANDO       verde vivo (VERDE) y girando, con tu contacto encendido.
// Los tonos viven en data/palette.js, compartidos con la red de radar en el aire (render/world.js).
// LAS ONDITAS: el pulso que sale del centro, en tres radios, por tramos de fila como el aro. El
// cuarto paso del ciclo no dibuja nada — la onda llega al aro y se pierde en el. Se van con el
// barrido cuando el radar no existe: son la misma idea contada dos veces.
const RADAR_ONDAS = [
  [[3, 3, 5], [4, 3, 3], [4, 5, 5], [5, 3, 5]],
  [[2, 3, 5], [3, 2, 2], [3, 6, 6], [4, 2, 2], [4, 6, 6], [5, 2, 2], [5, 6, 6], [6, 3, 5]],
  [[1, 3, 5], [2, 2, 2], [2, 6, 6], [3, 1, 1], [3, 7, 7], [4, 1, 1], [4, 7, 7], [5, 1, 1], [5, 7, 7], [6, 2, 2], [6, 6, 6], [7, 3, 5]],
];

function radarAlerta(x, y, visto, activo, fuera, fuerte, azul) {
  // `fuerte` es el medio latido encendido del anuncio de entrada (ver drawAlerta): la pantalla
  // pega el mismo salto a verde vivo que el rotulo, en fase con el. Se pasa el BOOLEANO y no el
  // reloj para que el latido sea UNO solo — dos senos calculados por separado se despegan.
  const V = azul ? RADAR_AZUL : fuera ? RADAR_GRIS : activo || fuerte ? RADAR_VERDE : RADAR_OPACO;
  const cx = x + 4, cy = y + 4;
  for (const [f, a, b] of RADAR_ARO) px(x + a, y + f, b - a + 1, 1, V.aro);
  if (fuera) {
    // LA PANTALLA APAGADA: una cruz quieta en lugar del barrido. Sin esto el aro solo se lee como
    // un circulito, y lo que tiene que leerse es "esto es un radar, y no esta prendido".
    px(x + 1, cy, 7, 1, V.lejos); px(cx, y + 1, 1, 7, V.lejos);
  } else {
    const onda = RADAR_ONDAS[Math.floor(run.t * 3.2) % (RADAR_ONDAS.length + 1)];
    if (onda) for (const [f, a, b] of onda) px(x + a, y + f, b - a + 1, 1, V.onda);
    const ang = run.t * RADAR_GIRO;
    const rayo = (d, r0, col) => {
      for (let r = r0; r <= 3; r++) px(cx + Math.round(Math.cos(ang + d) * r), cy + Math.round(Math.sin(ang + d) * r), 1, 1, col);
    };
    // la estela primero y la punta despues: donde caen en el mismo pixel, gana la punta
    rayo(-0.9, 2, V.lejos); rayo(-0.45, 2, V.cerca); rayo(0, 1, V.punta);
  }
  px(cx, cy, 1, 1, V.eje);
  // EL CONTACTO SOS VOS, y es ROJO (pedido del autor, 26/9/2026): "cuando tiene alarma meter un
  // puntito rojo parpadeante dentro del radar mientras el radar se mantiene en verde girando". Era
  // verde blanquecino, o sea del color de la pantalla, y se leia como parte del barrido en vez de
  // como lo que es — una cosa ajena adentro del radar. Rojo sobre verde es la unica combinacion de
  // este HUD que no se puede confundir con nada, y es el mismo rojo de la barra de abajo.
  //
  // PARPADEA SIEMPRE, pero no igual. Mientras te ven, rapido y encendido: te tienen. Escondido,
  // lento y apagado: es el eco viejo de donde te vieron por ultima vez. A nivel cero no hay
  // contacto — nadie te busca, no hay eco que marcar— y la pantalla queda verde girando sola.
  const on = visto ? Math.floor(run.t * 8) % 2 === 0 : Math.floor(run.t * 2.5) % 2 === 0;
  // CON LAS CHAPITAS EN EL AIRE el contacto no esta: se lo comio la mancha (ver chapitasRadar)
  if (activo && on && !(run.chapitasOnda > 0)) px(x + 6, y + 2, 1, 1, visto ? P.warn : '#7d2f1e');
}

// EL RADAR PROPIO EN EL TABLERO (15/10): la MISMA pantallita del radar de arriba a la izquierda —el
// mismo aro, el mismo barrido—, en AZUL y con TU AVION en el medio, porque este radar es tuyo y no
// el que te busca. APAGADO: gris, quieto, sin barrido (el efecto de pantalla apagada). PRENDIDO: titila
// y el barrido gira POR ENCIMA de la silueta, como gira el verde. Se prende a mano, con [Y].
// Con el blanco marcado, su eco titila arriba (hacia adelante). La carga es la rayita de abajo.
const RADAR_AZUL = { aro: '#3a7fc4', onda: '#24548a', lejos: '#1d4470', cerca: '#3f8fe0', punta: '#a8d8ff', eje: '#6fb6ff' };
const RADAR_AZUL_BAJO = { aro: '#2c6299', onda: '#1c406a', lejos: '#173658', cerca: '#2f6cab', punta: '#7fb6e6', eje: '#4f8fcc' };
function radarPropio(x, y) {
  plate(x, y, RADAR_W, ALERTA_H);
  const on = radarP.on, late = Math.floor(performance.now() / 250) % 2 === 0;
  const V = !on ? RADAR_GRIS : late ? RADAR_AZUL : RADAR_AZUL_BAJO;
  const ox = x + 3, oy = y + 3, cx = ox + 4, cy = oy + 4;
  for (const [f, a, b] of RADAR_ARO) px(ox + a, oy + f, b - a + 1, 1, V.aro);
  // TU AVION, visto desde arriba y apuntando hacia adelante: la nariz, las alas y la cola
  const av = !on ? '#46545e' : late ? '#d8ecff' : '#9cc4ea';
  px(cx, cy - 2, 1, 1, av); px(cx, cy - 1, 1, 3, av); px(cx - 2, cy, 5, 1, av); px(cx - 1, cy + 2, 3, 1, av);
  if (on) {
    // EL BARRIDO, ENCIMA del avion
    const ang = performance.now() / 1000 * RADAR_GIRO * 1.6;
    const rayo = (d, r0, col) => {
      for (let r = r0; r <= 3; r++) px(cx + Math.round(Math.cos(ang + d) * r), cy + Math.round(Math.sin(ang + d) * r), 1, 1, col);
    };
    rayo(-0.9, 1, V.lejos); rayo(-0.45, 1, V.cerca); rayo(0, 1, V.punta);
  }
  // EL ECO del blanco: arriba, titilando mientras dure la marca
  if (radarP.marcaT > 0 && Math.floor(performance.now() / 180) % 2 === 0) px(cx + 1, oy + 1, 1, 1, '#ffffff');
  // LA CARGA: una rayita en el canto de abajo de la placa
  const bw = RADAR_W - 4;
  px(x + 2, y + ALERTA_H - 2, bw, 1, '#1b2329');
  px(x + 2, y + ALERTA_H - 2, Math.round(bw * radarP.carga), 1, radarP.carga < 0.15 ? P.warn : on ? '#6fb6ff' : '#46545e');
  // prendido, el borde titila con la pantalla (y en rojo si se esta quedando sin carga)
  if (on && late) bordePlaca(x, y, RADAR_W, ALERTA_H, radarP.carga < 0.25 ? P.warn : '#5ab4ff');
}

/** EL RADAR PROPIO COMO RELOJ DE LA FILA (23/11): la pantalla redonda del radar —tres anillos, la cruz, el barrido que
 *  gira con su estela— en AZUL, con el avioncito de la placa del piloto en el medio; apagado, gris y quieto. El eco del
 *  blanco titila arriba, la carga es la rayita de abajo, y prendido el borde late (rojo si se queda sin carga). */
function radarReloj(x, y) {
  alTablero(x, y, () => {
    plate(x, y, CUADRO, CUADRO);
    const on = radarP.on, late = Math.floor(performance.now() / 250) % 2 === 0;
    const V = !on ? RADAR_GRIS : late ? RADAR_AZUL : RADAR_AZUL_BAJO;
    const cx = x + CUADRO / 2, cy = y + 12, R = 9;
    ctx.save();
    ctx.fillStyle = on ? 'rgba(10, 26, 46, 0.9)' : 'rgba(14, 18, 22, 0.9)';
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = V.aro; ctx.lineWidth = 0.7;
    for (const k of [1, 0.66, 0.33]) { ctx.globalAlpha = k === 1 ? 1 : 0.55; ctx.beginPath(); ctx.arc(cx, cy, R * k, 0, Math.PI * 2); ctx.stroke(); }
    ctx.globalAlpha = 0.45; ctx.beginPath(); ctx.moveTo(cx - R, cy); ctx.lineTo(cx + R, cy); ctx.moveTo(cx, cy - R); ctx.lineTo(cx, cy + R); ctx.stroke();
    ctx.globalAlpha = 1;
    if (on) {
      const ang = performance.now() / 1000 * RADAR_GIRO * 1.6;
      for (let i = 0; i < 10; i++) {
        ctx.fillStyle = V.cerca; ctx.globalAlpha = 0.35 * (1 - i / 10);
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, R - 0.5, ang - (i + 1) * 0.08, ang - i * 0.08); ctx.closePath(); ctx.fill();
      }
      ctx.globalAlpha = 1; ctx.strokeStyle = V.punta; ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(ang) * (R - 0.5), cy + Math.sin(ang) * (R - 0.5)); ctx.stroke();
    }
    ctx.restore();
    // el avioncito: el mismo icono que la placa del avion, arriba del piloto
    iconoEn(cx, cy, 'avion', !on ? '#5d6a70' : late ? '#d8ecff' : '#9cc4ea');
    // el eco del blanco, arriba, titilando mientras dure la marca
    if (radarP.marcaT > 0 && Math.floor(performance.now() / 180) % 2 === 0) { ctx.fillStyle = '#ffffff'; ctx.fillRect(cx + 1.5, cy - R + 2.5, 1.5, 1.5); }
    // LA CARGA, EN UN ANILLO VERDE QUE SE LLENA alrededor de la pantalla (23/11, el autor: "que se haga efecto de carga
    // con verde, tipo el de la trayectoria de la bomba que lleva el circulo, lo mismo pero en verde"): el aro oscuro de
    // fondo, los gajos llenos desde arriba en sentido horario y la punta mas clara; sin carga, en rojo
    const SEG = 24, lleno = radarP.carga * SEG, Ra = R + 2.2;
    ctx.save(); ctx.lineWidth = 1.6; ctx.lineCap = 'butt';
    for (let k = 0; k < SEG; k++) {
      const a0 = -Math.PI / 2 + k / SEG * Math.PI * 2 + 0.04, a1 = -Math.PI / 2 + (k + 1) / SEG * Math.PI * 2 - 0.04;
      const f = Math.max(0, Math.min(1, lleno - k));
      ctx.strokeStyle = '#1b2a22'; ctx.beginPath(); ctx.arc(cx, cy, Ra, a0, a1); ctx.stroke();
      if (f <= 0) continue;
      const punta = k === Math.floor(lleno - 0.001);
      ctx.strokeStyle = radarP.carga < 0.15 ? P.warn : punta ? RADAR_VERDE.punta : RADAR_VERDE.cerca;
      ctx.beginPath(); ctx.arc(cx, cy, Ra, a0, a0 + (a1 - a0) * f); ctx.stroke();
    }
    ctx.restore();
    if (on && late) bordePlaca(x, y, CUADRO, CUADRO, radarP.carga < 0.25 ? P.warn : '#5ab4ff');
  });
}

// LA MANCHA DE LAS CHAPITAS EN EL RADAR (el autor, 8/10: "en el radar se genera una onda grande
// alrededor del avion, lo que confunde y pareciera que exploto, cuando en realidad esta debajo").
// Desde el contacto —donde estabas— sale un estallido de eco: un destello blanco que llena la
// pantalla, y anillos que crecen MAS ALLA del aro del radar y se apagan. Es lo que veia el operador:
// un blanco que de golpe se vuelve una nube enorme y despues nada. `run.chapitasOnda` va de 1 (recien
// soltadas) a 0 (CHAPITAS.VIDA despues); la escribe systems/chapitas.js.
function chapitasRadar(x, y) {
  const o = run.chapitasOnda || 0;
  if (!(o > 0)) return;
  const cx = x + 6.5, cy = y + 2.5, u = 1 - o;
  ctx.save();
  // el destello: los primeros instantes la pantalla entera se lava
  if (u < 0.12) { ctx.globalAlpha = (0.12 - u) / 0.12 * 0.8; ctx.fillStyle = '#eaf6ff'; ctx.fillRect(x, y, 9, 9); }
  ctx.lineWidth = 1;
  for (let i = 0; i < 3; i++) {
    const r = 1 + (u * 3 + i * 0.33) % 1 * 14;          // tres anillos en tanda, de 1 a 15 px
    ctx.globalAlpha = o * (1 - r / 15) * 0.9;
    ctx.strokeStyle = Math.floor(run.t * 14 + i) % 2 ? '#d8eefc' : RADAR_VERDE.punta;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, 6.283); ctx.stroke();
  }
  // la nube misma: granos de eco que titilan alrededor de donde estabas
  ctx.globalAlpha = o;
  for (let i = 0; i < 10; i++) {
    const a = i * 2.4 + run.t * 0.7, d = 1 + (i * 7 % 5) * (0.6 + u * 1.6);
    if ((Math.floor(run.t * 18) + i) % 3) px(Math.round(cx + Math.cos(a) * d), Math.round(cy + Math.sin(a) * d), 1, 1, '#f4fbff');
  }
  ctx.restore();
}


// LA BALIZA: 7x7, una cupula de cinco filas sobre su pie de dos. Tan alta como ancha a proposito:
// con cuatro filas salia un bombin, y lo que la hace BALIZA es la cupula parada. El brillo que la
// cruza es lo que la vuelve GIRATORIA y no un foco: una luz fija es una luz, una que gira es alarma.
const BAL_W = 7;
// EL GRIS DE LO APAGADO: la cupula de una baliza que no tenes y el surco de la barra del
// escondite. Es UNO a proposito (pedido del autor, 11/9): lo que se desconto y lo que no hay
// son la misma cosa — alarma que no suena — y tienen que verse igual.
const BAL_APAGADA = '#3a4750';
const ALERTA_NUEVA_S = 1.6;   // cuanto destella la baliza que se acaba de ganar
const BARRA_POCO = 0.25;      // desde cuanto le queda a la barra del escondite empieza a parpadear
const TITILA_HZ = [4, 12];    // ese parpadeo: al empezar el ultimo cuarto, y justo al apagarse
const CUARTO_S = 5;           // lo que dura ese cuarto con EST_PERDER_S = 20 (ver drawAlerta)
// lo minimo que entra: margen, radar, aire, las cuatro con un pixel entre cada una, margen
const ALERTA_MIN_W = 3 + 9 + 3 + BAL_W + (EST_MAX - 1) * (BAL_W + 1) + 3;
const RADAR_W = 3 + 9 + 3;   // la placa del radar solo: margen, radar, margen

function baliza(x, y, modo) {
  const off = modo === 'off';
  const flash = modo === 'nueva' && Math.floor(run.t * 12) % 2 === 0;
  const cup = off ? BAL_APAGADA : flash ? '#fff1e8' : modo === 'baja' ? '#7d2f1e' : P.warn;
  px(x + 2, y, 3, 1, cup);
  px(x + 1, y + 1, 5, 4, cup);
  px(x, y + 5, BAL_W, 1, off ? '#2e3c45' : P.dim);
  px(x + 1, y + 6, 5, 1, off ? '#232e35' : '#55676f');
  if (modo === 'on' || modo === 'nueva') {
    const g = Math.floor(run.t * 10) % 4;               // 3 pasos de brillo y uno escondido detras
    if (g < 3 && !flash) px(x + 2 + g, y + 1, 1, 3, '#ff9a7a');
  }
  if (flash) {                                          // los rayos: la alarma que se acaba de encender
    const r = '#ff8a66';
    px(x + 3, y - 2, 1, 1, r); px(x, y - 1, 1, 1, r); px(x + 6, y - 1, 1, 1, r);
    px(x - 1, y + 2, 1, 1, r); px(x + BAL_W, y + 2, 1, 1, r);
  }
}

// EL FLANCO DE SUBIDA, para el destello. Se mira en el dibujo y no en el sistema porque es un efecto
// de pantalla, no un dato del vuelo — y se mira CADA cuadro, no solo cuando el panel se dibuja: con
// el nivel en cero el panel no esta, y si el flanco se mirara adentro, el 0→1 no se veria nunca.
let alertaN = 0, alertaDe = 0, alertaT = -9;
let alertaK = 0, alertaKT = -1;   // la entrada de las balizas (0 escondidas .. 1 afuera) y su reloj

function vigilaAlerta(n) {
  if (run.t < alertaT) alertaT = -9;                    // corrida nueva: el reloj del vuelo volvio a 0
  if (n > alertaN) { alertaDe = alertaN; alertaT = run.t; }
  alertaN = n;
}

/** Una bandera de 8x5: la argentina celeste-blanca-celeste con el sol; la de ellos, la de INGLATERRA (21/11, el autor:
 *  "la bandera es INGLATERRA, no esa" — la cruz roja de San Jorge sobre blanco, no la Union Jack). */
function banderita(x, y, b) {
  if (b === 'arg') {
    px(x, y, 8, 5, '#74acdf'); px(x, y + 2, 8, 1, '#ffffff'); px(x + 3, y + 1.5, 2, 2, '#ffffff'); px(x + 3.5, y + 2, 1, 1, '#f6b40e');
  } else {
    px(x, y, 8, 5, '#ffffff');
    px(x, y + 2, 8, 1, '#ce1124'); px(x + 3.5, y, 1, 5, '#ce1124');
  }
  ctx.strokeStyle = '#000000aa'; ctx.lineWidth = 0.5; ctx.strokeRect(x - 0.25, y - 0.25, 8.5, 5.5);
}
export function drawAlerta(x, y, w, n, prog, fuera, propio, bandera) {
  // EN LA ZONA DE NUESTRO RADAR (islas, 21/11): no es FUERA DE RADAR sino ZONA RADAR en azul, el radar girando
  if (propio && fuera) fuera = false; else propio = false;
  // LAS ALARMAS ENTRAN Y SALEN (pedido del autor, 11/9 a la noche), como la placa del RADAR: a
  // nivel cero queda SOLO EL RADAR, gris, y las balizas salen de atras de el con la primera alarma
  // y se vuelven a esconder cuando se apagan todas. Cuatro balizas apagadas eran un tablero de nada
  // ocupando la columna; el radar solo alcanza para decir que el sistema esta ahi.
  const dt = alertaKT < 0 || run.t < alertaKT ? 0 : Math.min(0.1, run.t - alertaKT);
  alertaKT = run.t;
  alertaK = n > 0 ? Math.min(1, alertaK + dt / RADAR_ENTRA) : Math.max(0, alertaK - dt / RADAR_ENTRA);
  // EL RELOJ EN CERO ES QUE TE VEN: el escondite solo corre bajo el techo, y asomarse mas que la
  // gracia lo vuelve a cero. Es el mismo dato que ya llegaba; no hizo falta pedirle otro al sistema.
  // DURANTE LA GRACIA (hasta EST_GRACIA_S asomado) el panel sigue diciendo "te buscan" aunque el
  // aviso de radar ya este cargando, y es a proposito: un bob no te delata, y el panel cuenta el
  // mismo reloj que decide eso. Lo que te esta viendo AHORA lo dice la barra del radar, abajo.
  const visto = !(prog > 0);
  // DETECTANDO NO ES UN RELOJ, ES UN ESTADO (pedido del autor, 26/9/2026). Primero lo puse como un
  // anuncio de 3,5 s al cruzar el horizonte, y estaba mal: un cartel con temporizador dice "paso
  // algo hace un rato" y lo que hace falta es que diga QUE ESTA PASANDO AHORA. Ahora sale mientras
  // el radar TIENE CARGA SOBRE VOS — o sea, desde que asomas la nariz arriba del techo y hasta que
  // la carga se drena sola al volver abajo—, que es exactamente lo que mide la barra de abajo.
  // Leen el MISMO numero (`run.detection`), asi que el cartel y la barra no se pueden contradecir.
  //
  // Y SE ACABA SOLO CON LA PRIMERA ALARMA, sin una linea que lo diga: cuando la barra se llena
  // salta la oleada, se enciende una baliza, y las balizas entran por arriba del rotulo (`alertaK`).
  // De ahi en mas el panel cuenta la alarma, que es la noticia mas grande.
  const detectando = !fuera && !propio && run.detection > 0.001;
  const latido = Math.sin(run.t * 14) > 0;
  // DONDE ESTAS PARADO, AL LADO DEL ICONO (pedido del autor, 25/9/2026): "el cartel de fuera de
  // radar debe estar dentro del box del radar". Antes era una placa propia un renglon mas abajo, y
  // se leia como otro instrumento; es la MISMA noticia que el color del icono, asi que va en el
  // mismo renglon y se lee de una sola pasada: icono gris + FUERA DE RADAR, icono verde apagado +
  // ZONA RADAR.
  //
  // Y COMPARTE LUGAR CON LAS BALIZAS a proposito. Es el espacio que las alarmas usan cuando hay
  // alarma: una vez que te estan buscando, en que parte del mapa esta el horizonte de radar dejo
  // de ser la pregunta. Por eso se va con la misma cortina con la que ellas entran (`alertaK`) y
  // no hay un cuadro en que se pisen.
  // LA PLACA SE ESTIRA HASTA QUE ENTRE EL TEXTO (15/10, el autor: "este texto se ve chico" — no entraba:
  // tomaba el ancho del indicativo, y FUERA DE RADAR le comia la letra de cada punta). El borde verde de
  // la zona usa este MISMO ancho (`wTot`), o la placa asomaba por fuera del marco.
  ctx.font = avisoFont(9);
  const wz = Math.max(w - RADAR_W + 1, ...['hud_detectando', 'hud_fuera_radar', 'hud_zona_radar']
    .map(k => Math.ceil(ctx.measureText(T(k)).width) + 10 + (bandera ? 9 : 0)));
  const wTot = RADAR_W - 1 + wz;
  cajaIzq.der = x + wTot; cajaIzq.abajo = y + ALERTA_H;   // (los carteles no la pisan: drawCartel)
  cajaZona = { x, y, w: wTot, h: ALERTA_H };   // (la zona del foco 'radar' del tutorial, 21/11)
  filaAlerta = { y, der: x + (alertaK > 0 ? ANCHO_ALARMAS : wTot) };   // (lo que queda libre a la derecha: drawRadar)
  if (alertaK < 1) {
    plate(x + RADAR_W - 1, y, wz, ALERTA_H);
    // TRES COSAS QUE PUEDE DECIR, y las tres son el mismo dato en tres momentos:
    //   FUERA DE RADAR   gris tranquilo: no hay sistema. Es informacion, no alarma.
    //   DETECTANDO...    asomado sobre el techo, con la barra cargando: verde fuerte y
    //                    parpadeando, icono incluido. Te estan barriendo AHORA.
    //   ZONA RADAR       blanco, quieto: el estado de fondo. EL VERDE OPACO ES DEL ICONO, NO DE LA
    //                    LETRA (pedido del autor, 25/9) — escrito en #26502e no se leia sobre la
    //                    placa. El instrumento pinta, el rotulo se lee.
    ctx.save();
    ctx.globalAlpha = 1 - alertaK;
    ctx.font = avisoFont(9); ctx.textAlign = 'center';
    // el parpadeo es de BRILLO y no de apagado: un rotulo que desaparece medio cuadro se lee como
    // un error de dibujo. Es el mismo latido de la palabra RADAR de la barra de abajo — y EL
    // MISMO que el del icono, que late con el (pedido del autor, 26/9): el cartel y la pantalla
    // son una sola noticia, y contarla en dos tiempos la parte en dos.
    // ZONA RADAR EN VERDE BRILLANTE, el del radar (pedido del autor, 26/9). Era blanco para que se
    // leyera; ahora se lee Y dice de que instrumento es. Fijo, sin latir: el que late es DETECTANDO.
    // (la de NUESTRA zona tambien en verde: 21/11, el autor: "la palabra zona radar dejamos verde" — el azul queda en el icono)
    // LA BANDERA DE LA ZONA (islas, 21/11, el autor: "la zona radar en isla puede mostrar la bandera de cada bando
    // ademas de los colores"): chiquita, a la izquierda del rotulo — y el rotulo se corre para dejarle lugar
    // (ANTES del color del rotulo: la bandera deja puesto el suyo y el texto salia dorado o rojo)
    const bw = bandera && !fuera && !detectando ? 9 : 0;
    if (bw) banderita(x + RADAR_W + 3, y + 5, bandera);
    ctx.fillStyle = detectando ? (latido ? RADAR_VERDE.punta : RADAR_VERDE.cerca)
      : fuera ? P.foam : RADAR_VERDE.eje;
    ctx.fillText(T(detectando ? 'hud_detectando' : fuera ? 'hud_fuera_radar' : 'hud_zona_radar'),
      x + RADAR_W - 1 + Math.round((wz + bw) / 2), y + 11);
    ctx.restore();
    ctx.textAlign = 'left';
  }
  if (alertaK > 0) {
    // (8/10, el autor: "achica el ancho de las alarmas, que tengan el espacio suficiente")
    // (y SIEMPRE ese ancho, 15/10: con `min(w, …)` un indicativo corto —ESPOLA— la achicaba y cortaba la cuarta)
    const wa = ANCHO_ALARMAS;
    // entra rapido y frena al llegar, recortada al canto del radar: sale DE ATRAS de el
    const e = 1 - Math.pow(1 - alertaK, 3), dx = Math.round(-(1 - e) * (wa - RADAR_W + 1));
    ctx.save(); ctx.beginPath(); ctx.rect(x + RADAR_W - 1, y - 3, W, ALERTA_H + 6); ctx.clip();
    // EL CUADRO DE LA OLEADA, DETRAS: sale de izquierda a derecha de atras de las alarmas cuando la tanda
    // crece (x2, x3…), titila un par de segundos y vuelve a entrar. Del mismo tamaño que el del radar.
    olaCuadro(x + w - 1, y);   // (al FINAL del renglon, 22/11: al lado de las alarmas ahora va enganchada la barra del radar)
    balizasAlerta(x, y, wa, n, prog, dx, visto);
    ctx.restore();
  }
  // EL RADAR, ENCIMA y quieto: es lo unico que queda cuando no suena nada
  plate(x, y, RADAR_W, ALERTA_H);
  radarAlerta(x + 3, y + 3, visto, n > 0, fuera, detectando && latido, propio);
  chapitasRadar(x + 3, y + 3);
  // …Y EL BORDE DE LA CAJA EN VERDE mientras estas en la zona (pedido del autor, 26/9: "y los bordes
  // de la caja"), el mismo verde del rotulo: la caja entera dice "aca el radar existe". Se va con
  // el rotulo cuando entran las balizas —con alarma, el marco verde alrededor del rojo se leeria
  // como "todo en orden".
  // Y PARPADEA CON DETECTANDO (26/9), al MISMO latido que el rotulo: prendido en el brillo alto,
  // apagado en el bajo. En la zona a secas queda fijo — lo que parpadea es lo que esta pasando.
  if (!fuera && alertaK < 1 && (!detectando || latido)) {
    ctx.save(); ctx.globalAlpha = 1 - alertaK;
    bordePlaca(x, y, wTot, ALERTA_H, propio ? RADAR_AZUL.eje : detectando ? RADAR_VERDE.punta : RADAR_VERDE.eje);
    ctx.restore();
  }
}

/** Lo que miden las alarmas: el radar, las cuatro balizas a paso fijo y aire a los costados. */
const ANCHO_ALARMAS = 15 + (EST_MAX - 1) * (BAL_W + 3) + BAL_W + 5;
/** EL CUADRO DE LA OLEADA (8/10): `x` es el canto derecho de las alarmas. Cuando el tamaño de la tanda
 *  sube (systems/flight.js: un misil mas cada tres oleadas) asoma por atras, se queda OLA_VER s
 *  titilando con el xN adentro, y vuelve. Va dibujado ANTES que las alarmas: lo que no asomo, lo tapan. */
const OLA_VER = 2.4, OLA_SALE = 0.22;
let olaPrev = 0, olaT = -9;
function olaCuadro(x, y) {
  const ola = run.radarWave > 0 ? 1 + Math.floor((run.radarWave - 1) / 3) : 0;
  if (ola < olaPrev) olaPrev = ola;                 // corrida nueva
  if (ola > olaPrev) { olaPrev = ola; if (ola > 1) olaT = run.t; }
  const t = run.t - olaT;
  if (t < 0 || t > OLA_VER + OLA_SALE || olaPrev < 2) return;
  const k = t < OLA_SALE ? t / OLA_SALE : t > OLA_VER ? 1 - (t - OLA_VER) / OLA_SALE : 1;
  const e = 1 - Math.pow(1 - Math.max(0, Math.min(1, k)), 3);
  const sx = Math.round(x - RADAR_W + e * RADAR_W);
  plate(sx, y, RADAR_W, ALERTA_H);
  const on = Math.floor(t * 6) % 2 === 0;
  bordePlaca(sx, y, RADAR_W, ALERTA_H, on ? P.warn : '#5a2418');
  ctx.font = 'bold 6px monospace'; ctx.textAlign = 'center';
  ctx.fillStyle = on ? P.warn : '#8a3a26'; ctx.fillText('x' + olaPrev, sx + RADAR_W / 2, y + 10);
  ctx.textAlign = 'left';
}

/** La seccion de las BALIZAS del panel, corrida `dx` por la entrada (ver drawAlerta). */
function balizasAlerta(x, y, w, n, prog, dx, visto) {
  plate(x + RADAR_W - 1 + dx, y, w - RADAR_W + 1, ALERTA_H);
  // las cuatro, repartidas en lo que deja el radar y centradas ahi: la placa mide lo que mide el
  // escuadron, que depende del nombre del piloto, asi que el paso se acomoda y no la placa
  const x0 = x + 15 + dx, libre = w - 18;
  const paso = BAL_W + 3;   // (8/10: angostas — el panel mide lo que necesitan, ver ANCHO_ALARMAS)
  // (8/10: corridas a la IZQUIERDA, para dejar a la derecha el cuadrado rojo de la oleada)
  const bx0 = x0;
  // EL PARPADEO DEL FINAL, UNO SOLO PARA LA BARRA Y LAS BALIZAS. En el ultimo cuarto del reloj del
  // escondite —cinco segundos de veinte— la barra titila, y ACELERA HASTA APAGARSE (pedido del autor,
  // 11/9): de TITILA_HZ[0] a TITILA_HZ[1]. La fase se INTEGRA sobre lo que va del cuarto (u, de 0 a
  // 1) en vez de hacer floor(t * f): con una frecuencia que cambia, eso salta de fase cada cuadro y
  // el parpadeo tartamudea. Y como avanza con la barra y no con el reloj de pared, si la gracia
  // congela la barra, el parpadeo se congela con ella: el reloj esta en pausa y se ve en pausa.
  const resta = 1 - prog;
  const u = Math.max(0, Math.min(1, (BARRA_POCO - resta) / BARRA_POCO));
  const ciclos = CUARTO_S * (TITILA_HZ[0] * u + (TITILA_HZ[1] - TITILA_HZ[0]) * u * u / 2);
  const titila = resta <= BARRA_POCO && ciclos % 1 >= 0.5;
  // ESCONDIDO PARPADEA SOLO LA ULTIMA (pedido del autor, 11/9): la de arriba, que es la que el reloj
  // esta descontando y la que se va a apagar. Las de abajo quedan quietas —siguen ganadas— y asi el
  // ojo va a la unica que esta en juego. A 2 Hz mientras hay tiempo; en el ultimo cuarto, AL RITMO
  // DE LA BARRA y en fase con ella: cuando la barra se apaga, se apaga ella. Leen del mismo
  // `titila`, asi que no se pueden desincronizar.
  const parpadeo = resta <= BARRA_POCO ? titila : Math.floor(run.t * 4) % 2 === 1;
  for (let i = 1; i <= EST_MAX; i++) {
    const modo = i > n ? 'off'
      : i > alertaDe && run.t - alertaT < ALERTA_NUEVA_S ? 'nueva'
        : i === n && !visto && parpadeo ? 'baja' : 'on';
    baliza(bx0 + (i - 1) * paso, y + 5, modo);
  }
  // EL RELOJ DEL ESCONDITE, ROJO Y DESCONTANDO (pedido del autor, 11/9): arranca LLENO apenas se
  // enciende una baliza y baja mientras estas escondido; cuando se vacia, se apaga una y el
  // siguiente arranca lleno otra vez. Asomarse mas que la gracia lo vuelve a llenar. Lleno que se
  // vacia se lee como "lo que le queda a la alarma"; la version anterior, una raya que crecia, se
  // leia como algo cargandose — o sea, como si te estuvieran encontrando, que es al reves.
  // El surco detras es lo que ya se desconto, en el gris de la baliza apagada: sin el, una raya
  // corta no dice de cuanto.
  if (n > 0) {
    const bw = w - RADAR_W - 1, by = y + ALERTA_H - 2;   // debajo de las balizas: es de ellas
    px(x + RADAR_W + dx, by, bw, 1, BAL_APAGADA);
    // CUANDO QUEDA POCO, PARPADEA (el `titila` de arriba, el mismo de las balizas): el ultimo cuarto
    // es cuando aguantar un poco mas paga, y un parpadeo se ve de reojo, sin mirar la esquina.
    // Parpadea apagandose, no cambiando de rojo: lo que titila es lo que le queda a la alarma.
    if (!titila) px(x + RADAR_W + dx, by, Math.max(1, Math.round(bw * resta)), 1, P.warn);
  }
}

/** LA CARGA DEL RADAR (`run.detection`, playtest 11/9). Cuanto le falta al radar enemigo para
 *  fijarte: se llena en 1,4 s volando arriba del techo de radar y se vacia en 0,9 s abajo. Llena,
 *  sale una tanda de misiles (y con fases, una baliza); despues rearranca desde la MARCA DE ACENTO,
 *  que se corre con cada tanda — por eso las tandas se van acercando.
 *
 *  Era un "! RADAR !" parpadeando en el centro, con esta barra abajo. Ahora es una PLACA QUE ENTRA
 *  DESDE LA IZQUIERDA cuando el radar te empieza a cargar y se vuelve a ir cuando la barra se vacia,
 *  pegada al panel de alerta: todo lo que dice quien te busca vive en esa columna. La palabra va en
 *  la letra de los avisos (`avisoFont`), roja y titilando mientras te estan viendo, apagada mientras
 *  la barra baja. Devuelve el `y` donde sigue la columna. */
const RADAR_H = 12, RADAR_ENTRA = 0.22;
let radarK = 0, radarT = -1;
// EN EL RENGLON DE LAS ALARMAS (22/11, el autor: "el misil puede ocupar el espacio libre entre las alarmas y el lado
// derecho del total de aviones; o al menos al mismo ancho de las alarmas"): drawAlerta anota donde termina lo suyo
// (las balizas y el lugar del cuadro de oleada, o la placa FUERA DE RADAR / DETECTANDO) y la barra usa el resto.
let filaAlerta = null;
const RADAR_MIN_W = 56;   // menos que esto no se lee: va abajo, al ancho de las alarmas
function drawRadar(x, y, w, visto) {
  // el reloj de la entrada sale de `run.t`, como el de la cara: el HUD no recibe dt
  const dt = radarT < 0 || run.t < radarT ? 0 : Math.min(0.1, run.t - radarT);
  radarT = run.t;
  radarK = run.detection > 0.001 ? Math.min(1, radarK + dt / RADAR_ENTRA) : Math.max(0, radarK - dt / RADAR_ENTRA);
  if (radarK <= 0) return y;
  const e = 1 - Math.pow(1 - radarK, 3);                  // entra rapido y frena al llegar
  // ENGANCHADA a la caja de las alarmas (22/11, el autor: "enganchado en el mismo cosito, porque es parte del radar"):
  // arranca en su borde derecho (el pixel del borde lo comparten) y tiene su mismo alto
  const libre = filaAlerta ? x + w - filaAlerta.der + 1 : 0;
  const alLado = libre >= RADAR_MIN_W;
  const sigue = alLado ? y : y + RADAR_H + AIRE;          // al lado no ocupa renglon propio
  let yP = y, hP = RADAR_H;
  if (alLado) { x = filaAlerta.der - 1; w = libre; yP = filaAlerta.y; hP = ALERTA_H; y = yP + Math.round((ALERTA_H - RADAR_H) / 2); }
  else w = Math.min(w, ANCHO_ALARMAS);
  // entra desde la izquierda de SU lugar, recortada a el (al lado de las alarmas no les pasa por encima)
  ctx.save(); ctx.beginPath(); ctx.rect(x, yP - 1, w + 2, hP + 2); ctx.clip();
  const x0 = Math.round(x - (w + 2) * (1 - e));
  const fin = () => { ctx.restore(); return sigue; };
  plate(x0, yP, w, hP);
  ctx.font = avisoFont(9); ctx.textAlign = 'left';
  ctx.fillStyle = visto ? (Math.sin(run.t * 14) > 0 ? P.warn : '#7d2f1e') : P.dim;
  // …Y CUANDO DISPARA, DICE QUE (28/9): el misil del radar es el SEA DART. Mientras el misil del
  // final de la escala esta prendido, la placa lo nombra en vez de decir RADAR.
  const dispara = salioMisil();
  const lbl = dispara ? 'SEA DART' : 'RADAR';             // las mismas palabras en los dos idiomas
  ctx.fillText(lbl, x0 + 3, y + 9);
  // EL MISIL AL FINAL DE LA BARRA (12/9). La barra decia cuanto le falta al radar para fijarte,
  // pero no QUE pasa cuando llega: ahora el final de la escala lo dice con el dibujo de la cosa
  // que sale. Es el mismo criterio que la marca de emergencia al final del reloj de la Chancha —
  // el fondo de la escala es un hecho, no un numero— y el mismo misil en miniatura del estante,
  // pero con la ojiva a la IZQUIERDA: este viene hacia vos.
  const mx = x0 + w - 3 - MSL_ICO_W;
  // el piso de 10 es por la placa angosta: con un solo avion en el escuadron la columna mide el
  // minimo, y ahi la palabra y el misil se comen casi todo el renglon. Antes que una barra de 1 px,
  // que el misil se le monte un poco encima: sigue siendo el final de la escala.
  const bx = x0 + 3 + Math.ceil(ctx.measureText(lbl).width) + 4, bw = Math.max(10, mx - 2 - bx);
  px(bx, y + 4, bw, 3, BAL_APAGADA);
  px(bx, y + 4, Math.round(bw * Math.max(0, Math.min(1, run.detection))), 3, P.warn);
  if (run.radarWave > 0) px(bx + Math.round(bw * Math.min(0.55, 0.35 + run.radarWave * 0.03)), y + 3, 1, 5, P.accent);
  misilChico(mx, y + 5, dispara);   // centrado en la fila de la barra
  // LAS CHAPITAS EN ESTA BARRA (8/10): la del radar es la que se ve siempre que te detectan, haya o no
  // panel de alarmas. La carga se deshace en eco: granos plateados que titilan por toda la barra y
  // se van apagando con la nube — el operador perdio tu blanco adentro de la mancha.
  const o = run.chapitasOnda || 0;
  if (o > 0) {
    ctx.save(); ctx.globalAlpha = Math.min(1, o * 1.4);
    for (let i = 0; i < bw; i += 2) if ((i * 7 + Math.floor(run.t * 24)) % 5 < 2)
      px(bx + i, y + 3 + ((i * 3 + Math.floor(run.t * 18)) % 5), 1, 1, i % 4 ? '#c9d6dd' : '#ffffff');
    ctx.restore();
  }
  return fin();
}

/** LA PLACA DEL SEA WOLF (28/9), debajo de la del radar y con su mismo lenguaje, pero celeste: entra
 *  cuando el avion esta adentro de la zona del buque y se va al salir. La barra es su CICLO —se llena
 *  mientras te engancha (titilando: ya viene) y se vacia en la recarga (la ventana para entrar)— y el
 *  misil del final se prende con la salva. `sw` es la foto de systems/seawolf.js, por el snapshot. */
let swK = 0, swT = -1;
function drawSeaWolf(x, y, w, sw) {
  const dt = swT < 0 || run.t < swT ? 0 : Math.min(0.1, run.t - swT);
  swT = run.t;
  swK = sw && sw.dentro ? Math.min(1, swK + dt / RADAR_ENTRA) : Math.max(0, swK - dt / RADAR_ENTRA);
  if (swK <= 0) return y;
  const e = 1 - Math.pow(1 - swK, 3);
  const x0 = Math.round(x - (x + w + 2) * (1 - e));
  plate(x0, y, w, RADAR_H);
  const fase = sw ? sw.fase : 'fuera', fija = fase === 'fija', salva = fase === 'salva';
  // el nombre y el color de ESTA defensa (Sea Cat naranja, Sea Wolf celeste)
  const SEAWOLF_COL = colDefensa(sw && sw.tipo), nombre = (sw && sw.nombre) || 'SEA WOLF';
  ctx.font = avisoFont(9); ctx.textAlign = 'left';
  ctx.fillStyle = fija || salva ? (Math.sin(run.t * 18) > 0 ? SEAWOLF_COL.punta : SEAWOLF_COL.lejos) : SEAWOLF_COL.cerca;
  ctx.fillText(nombre, x0 + 3, y + 9);
  const mx = x0 + w - 3 - MSL_ICO_W;
  const bx = x0 + 3 + Math.ceil(ctx.measureText(nombre).width) + 4, bw = Math.max(10, mx - 2 - bx);
  const lleno = fija ? sw.u : salva ? 1 : fase === 'recarga' ? 1 - sw.u : 0;
  px(bx, y + 4, bw, 3, BAL_APAGADA);
  px(bx, y + 4, Math.round(bw * lleno), 3, fija || salva ? SEAWOLF_COL.punta : SEAWOLF_COL.lejos);
  const vivo = salva && Math.sin(run.t * 14) > 0;
  iconoEn(mx + (MSL_ICO_W - 1) / 2, y + 5, 'misil', vivo ? '#ffffff' : '#2e3c45', vivo ? SEAWOLF_COL.escape : '#2e3c45');
  return y + RADAR_H + AIRE;
}

/** ¿ACABA DE SALIR UNA OLEADA? La barra NUNCA se ve llena: `run.detection >= 1` dispara la tanda y
 *  en el mismo cuadro la baja al residual (systems/flight.js), asi que preguntarle a la barra si
 *  llego al final no sirve — el cuadro que se dibuja ya la tiene abajo. Lo que si queda es la
 *  CUENTA de oleadas: cuando cambia, el radar acaba de llegar al final. El HUD se acuerda del
 *  numero anterior y prende el misil 1,2 s, igual que la lengueta LISTO lleva su propio reloj. */
const MSL_ON_S = 1.2;
let mslOn = 0, mslWave = -1, mslT = -1;
function salioMisil() {
  const dt = mslT < 0 || run.t < mslT ? 0 : Math.min(0.1, run.t - mslT);
  mslT = run.t;
  if (mslWave < 0) mslWave = run.radarWave;               // primer cuadro: adoptar, no anunciar
  if (run.radarWave !== mslWave) { mslWave = run.radarWave; if (run.radarWave > 0) mslOn = MSL_ON_S; }
  mslOn = Math.max(0, mslOn - dt);
  return mslOn > 0;
}

/** EL MISIL QUE VIENE, 10x5, de la tabla de iconos (`misil`): ojiva a la izquierda, o sea hacia
 *  vos. Apagado es la misma silueta en el gris de la placa —el pip vacio de siempre— y encendido
 *  titila en blanco con la llama en acento, porque encendido significa que ya salio.
 *
 *  TITILA ENTRE LLENO Y APAGADO, no entre lleno y nada: borrandolo del todo dejaba un agujero en
 *  el final de la escala la mitad de los cuadros, y el hueco se lee como que la marca no esta. */
const MSL_ICO_W = 10;
function misilChico(x, y, on) {
  const vivo = on && Math.sin(run.t * 14) > 0;
  iconoEn(x + (MSL_ICO_W - 1) / 2, y, 'misil', vivo ? '#e9edf0' : '#2e3c45', vivo ? P.accent : '#2e3c45');
}

// LOS NUMEROS DEL ESTANTE: de pixel, porque la fuente de 5 px no se lee a este tamaño. Del 0 al 4: lo
// mas que cuelga de un pilon, o las chapitas al tope (CHAPITAS.CARGAS_MAX). FINOS desde el 9/10, como
// los iconos que acompañan: trazo de dos pixeles reales y esquinas redondeadas, 7x15 reales (5 de alto,
// como antes). Los de 3x5 de diseño quedaban gordos al lado de la bomba y el tanque nuevos.
const DIG = {
  0: ['.#####.', '#######', '##...##', '##...##', '##...##', '##...##', '##...##', '##...##', '##...##', '##...##', '##...##', '##...##', '##...##', '#######', '.#####.'],
  1: ['..###..', '.####..', '##.##..', '...##..', '...##..', '...##..', '...##..', '...##..', '...##..', '...##..', '...##..', '...##..', '...##..', '#######', '#######'],
  2: ['.#####.', '#######', '##...##', '.....##', '.....##', '....###', '...###.', '..###..', '.###...', '###....', '##.....', '##.....', '##.....', '#######', '#######'],
  3: ['######.', '#######', '.....##', '.....##', '.....##', '.....##', '.######', '.######', '.....##', '.....##', '.....##', '.....##', '.....##', '#######', '######.'],
  4: ['##...##', '##...##', '##...##', '##...##', '##...##', '##...##', '#######', '#######', '.....##', '.....##', '.....##', '.....##', '.....##', '.....##', '.....##'],
};
function digito(x, y, n, col) {
  // MAS DE 4 (la bodega del Hercules bombardero, 16/10: hasta 12): la tabla de pixeles llega a 4, asi
  // que el numero va en la letra chica del estante
  if ((n | 0) > 4) {
    ctx.font = 'bold 5px monospace'; ctx.textAlign = 'left'; ctx.fillStyle = col;
    ctx.fillText(String(n | 0), x, y + 5);
    return;
  }
  const d = DIG[Math.max(0, Math.min(4, n | 0))];
  ctx.fillStyle = col;
  const x0 = x + FINO;                                   // 7 de 9: centrado en la celda de 3
  for (let j = 0; j < d.length; j++) {
    const f = d[j];
    for (let i = 0; i < f.length;) {
      let k = i + 1;
      while (k < f.length && f[k] === f[i]) k++;
      if (f[i] === '#') ctx.fillRect(x0 + i * FINO, y + j * FINO, (k - i) * FINO, FINO);
      i = k;
    }
  }
}

/** EL ESTANTE: LO QUE CUELGA DEL AVION, tres filas (8/10).
 *    arriba   EL PAR DE ALA: tanques o bombas, con su 2 (las bombas de ala salen de a una: 2, 1).
 *             Soltados, la silueta queda en gris: el hueco dice que falta ESO.
 *    medio    EL CENTRO: en LA SUELTA la bomba del buque (enmarcada en rojo, apagada lejos del buque,
 *             la cruz si se trabo); en las demas, las bombas de la tecla de bomba, con cuantas quedan.
 *    abajo    LAS CHAPITAS, con su 2. Un avion sin chapitas deja la fila VACIA.
 *  Cuando es el momento de soltar (la suelta), lo que se puede soltar titila en verde. */
function drawEstante(h) {
  const r = h.rack, verde = !!(r && h.sueltaYa && titilaSuelta());
  const c = cargaDe(cfg.carga);
  const hayAla = !!(r ? r.ala : c.ala);
  if (!r && !hayAla && !(run.chapitasMax > 0) && (run.sinBombas || !pide(run.msl < (run.mslMax || MSL_MAX)))) return;   // (sin armas, sin estante: 17/10)
  plate(X_RACK, CUADROS_Y, RACK_W, CUADRO);
  const cx = X_RACK + 1 + (BOMBA_W - 1) / 2, xd = X_RACK + 1 + BOMBA_W + 1;
  const VACIO = '#2e3c45';
  // EL SECUNDARIO ELEGIDO (9/10, [Z] suelta lo elegido; 1/2/3 o la ruedita lo cambian): su fila lleva
  // una flechita naranja afuera, a la izquierda, y su numero en naranja. Fila por fila es el mismo orden
  // que las teclas: arriba los tanques (1), al medio la bomba (2), abajo las chafitas (3).
  // (las chafitas no se eligen: son APOYO — la flecha solo señala tanques o bomba, 18/11)
  const yElegida = { tanque: CUADROS_Y + 5, bomba: CUADROS_Y + 13 }[run.secundaria];
  const fila = (yy, ico, n, col, mono, colDig) => {
    iconoEn(cx, yy, ico, col, undefined, mono);
    const elegida = yy === yElegida;
    if (n !== null) digito(xd, yy - 2, n, elegida && n > 0 ? P.accent : colDig || (n > 0 ? P.foam : VACIO));
  };
  if (yElegida !== undefined) {
    px(X_RACK - 3, yElegida - 2, 1, 5, P.accent); px(X_RACK - 2, yElegida - 1, 1, 3, P.accent); px(X_RACK - 1, yElegida, 1, 1, P.accent);
  }
  // ARRIBA: el par de ala
  const ya = CUADROS_Y + 5, ala = r ? r.ala : c.ala;
  if (ala === 'tanque') {
    const cuelga = !run.tanque || (run.tanque.pilones || []).includes('ala');
    // LA INDIA del Dagger (12/10): en la suelta el medio son las del buque, asi que el tanque del centro
    // se cuenta aca arriba con los del ala — los tres tanques en una fila
    const n = r && c.ext && c.centro === 'tanque' ? (run.tanque ? (run.tanque.pilones || []).length : 3) : cuelga ? 2 : 0;
    fila(ya, 'tanque', n, n > 0 ? '#8d9a78' : VACIO);
  } else if (ala === 'bomba') {
    const n = r ? r.alaN : 2;
    fila(ya, 'bomba', n, n > 0 ? (verde ? SUELTA_COL : null) : VACIO, !(n > 0) || verde);
  }
  // EL MEDIO: el centro
  const yc = CUADROS_Y + 13;
  if (r) {
    const on = r.centroN > 0;
    bordePlaca(X_RACK, yc - 4, RACK_W, 9, on && !r.bloqueada && verde ? SUELTA_COL : P.warn);
    fila(yc, 'bomba', r.centroN, !on ? VACIO : verde ? SUELTA_COL : r.bloqueada ? '#6b7680' : null,
      !on || verde || r.bloqueada);
    // TRABADA (autor, 8/10): la del buque no salio — una cruz roja encima, que titila, y queda
    if (on && r.trabada && Math.sin(Date.now() / 90) > -0.4) {
      ctx.fillStyle = '#e8321e';
      for (let i = -3; i <= 3; i++) { ctx.fillRect(cx + i, yc + i, 1, 1); ctx.fillRect(cx + i, yc - i, 1, 1); }
    }
    // QUE BOMBA ES (data/bombas.js): el nombre corto encima del estante — MK-17 o BRP
    if (r.bomba) {
      ctx.font = 'bold 5px monospace'; ctx.textAlign = 'center'; ctx.fillStyle = P.dim;
      ctx.fillText(r.bomba === 'mk17' ? 'MK17' : r.bomba === 'snakeye' ? 'MK82' : 'BRP', X_RACK + RACK_W / 2, CUADROS_Y - 2);
      ctx.textAlign = 'left';
    }
  } else if (c.centro === 'tanque') {
    const cuelga = !run.tanque || (run.tanque.pilones || []).includes('centro');
    fila(yc, 'tanque', cuelga ? 1 : 0, cuelga ? '#8d9a78' : VACIO);
  } else {
    // las bombas de la tecla de bomba (MSL_MAX, se recargan): cargada blanca con la punta amarilla,
    // sin ninguna la misma silueta en el gris de la placa
    if (!run.sinBombas) fila(yc, 'bomba', run.msl, run.msl > 0 ? null : VACIO, !(run.msl > 0));
  }
  // ABAJO: las chapitas (vacio si el avion no trae)
  // …SEPARADAS: son el ELEMENTO DE APOYO, no un secundario (18/11). Una raya punteada las aparta del estante y van
  // en celeste, con el digito en celeste tambien: se leen como otra cosa, que sale con su propia tecla.
  const yb = CUADROS_Y + 21;
  if (run.chapitasMax > 0) {
    const n = run.chapitas, APOYO = '#7fc6d8';
    for (let i = 1; i < RACK_W - 1; i += 2) px(X_RACK + i, yb - 5, 1, 1, '#3d5560');
    fila(yb, 'chapitas', n, n > 0 ? APOYO : VACIO, !(n > 0) || Math.floor(run.t * 3) % 4 !== 0, n > 0 ? APOYO : VACIO);
  }
}

export function drawHUD(h) {
  focoIds = h.foco || [];
  soloTero = !!h.unaVida;
  cajaCinta = null;   // ver cintaCaja: una caja de otro cuadro no cuenta
  filaAlerta = null;  // idem: la fila de las alarmas de ESTE cuadro
  placas.length = 0;  // ver placasHud: las de este cuadro
  cajaPiloto = null;  // idem: la cara de la que sale mi voz es la de ESTE cuadro
      const { gameMode, objectiveDist, objectiveShip } = h;
  // EL PODER RASANTE llega POR SNAPSHOT y no por import, a diferencia de sus dos hermanos: el
  // lint de capas prohibe que `render` importe de `systems`, y las dos violaciones que ya existen
  // (tempo y chancha) estan en la lista de trinquete, que solo puede achicarse. La convencion 4
  // dice justamente esto — el dibujo LEE lo que el orquestador le pasa, no va a buscarlo.
  const ras = h.ras || { on: false, meter: 0, resta: 0, dur: 12 };
  // ---- LA ESQUINA DE LA CORRIDA (arriba a la izquierda) ----------------------------------------
  // QUIEN VUELA, Y NADA MAS. Todo lo que decia COMO VA LA CORRIDA se fue de esta esquina a la
  // cinta de arriba al centro, que es el renglon que significa exactamente eso (ver `cinta`).
  //
  // EL PUNTAJE ya no vive suelto aca. En los modos con objetivo directamente no esta: un contador
  // de arcade corriendo arriba a la izquierda no cambia nada de lo que haces en los proximos diez
  // segundos, y los puntos se cobran cuando la corrida termina, con una pantalla entera para
  // decirse. En POR LA PATRIA si esta —ahi el puntaje ES el juego— pero adentro de la cinta, junto
  // al kilometraje y al record, porque los tres contestan la misma pregunta.
  // ARRANCA EN EL MISMO MARGEN QUE LA CINTA Y LA PLACA DEL BLANCO (8/10, el autor: "esto tiene que estar
  // alineado"): en 3 la placa del escuadron quedaba un pixel mas arriba que el resto de la fila.
  let ty = MARGEN;
  // vidas del escuadron. Con 1 avion no se dibuja: seria un tablero de nada
  if (run.squad > 1) { drawSquadPips(MARGEN, ty); ty += SQUAD_H + AIRE; }
  // …Y JUSTO DEBAJO, EL NIVEL DE ALERTA. A NIVEL CERO TAMBIEN, por pedido del autor (11/9): que el
  // instrumento este ahi antes de que pase nada es lo que le enseña al jugador que existe —y que se
  // puede encender—. Primero eran las cuatro balizas apagadas y el radar; desde la noche del 11/9
  // es SOLO EL RADAR, gris, y las balizas entran con la primera alarma (ver drawAlerta).
  // PERO SOLO DONDE PUEDE SUBIR (`h.busqueda`, ver game.js). En una mision sin el sistema seria un
  // tablero de nada, y el HUD de este juego no muestra instrumentos que nunca van a contar algo
  // (misma regla que la Chancha sin combustible).
  vigilaAlerta(h.estrellas | 0);
  // …O SI ESTAS FUERA DEL HORIZONTE DE RADAR (PLAN_NAFTA_ALCANCE N2): el panel es el que lo dice
  // desde el 25/9, asi que en una mision con ruta tiene que estar aunque no haya sistema de busqueda.
  if (h.estrellas > 0 || h.busqueda || h.fueraRadar) {
    drawAlerta(MARGEN, ty, anchoSquad(), h.estrellas | 0, h.escondite, !!h.fueraRadar, !!h.radarPropio, h.radarBandera || null);
    ty += ALERTA_H + AIRE;
  }
  // …Y DEBAJO, LA CARGA DEL RADAR con su arma (el Sea Dart), que entra y sale sola (ver drawRadar). (23/11, el autor:
  // "el indicador de radar con el arma dejarlo como estaba antes… estaba perfecto": vuelve aca, en todas las vistas)
  ty = drawRadar(MARGEN, ty, anchoSquad(), !h.sinRadar && plane.y > (h.radarAlt === undefined ? RADAR_ALT : h.radarAlt));
  // …Y LA DEL SEA WOLF, cuando estas adentro de la zona del buque
  ty = drawSeaWolf(MARGEN, ty, anchoSquad(), h.seawolf);
  // PERSECUCION no tiene objetivo NI record: la cinta no tiene contra que medir, asi que el
  // kilometraje se queda aca como contador abierto — la forma que le toca cuando no hay meta.
  if (objectiveDist <= 0 && gameMode !== 'survival') { drawOdo(MARGEN, ty); ty += 12 + AIRE; }
  // EL PUNTAJE EN EL CICLO (16/10: "los puntos en ambos modos siempre se muestran"). En POR LA PATRIA
  // ya esta en la cinta de arriba; en el ciclo la cinta es del blanco, asi que va su placa aca.
  // (y en LAS ISLAS, que no tienen cinta: el sobrevuelo junta puntos — 23/11)
  if ((gameMode === 'cycle' && h.suelto) || h.brujula) { drawPuntos(MARGEN, ty); ty += 12 + AIRE; }
  // EL ATAJO DEL TALLER (18/10): con aviones con fallas, la tecla que los manda a todos a reparar
  if (h.suelto && h.fallados > 0) { drawAtajoTaller(MARGEN, ty, h.fallados); ty += 9 + AIRE; }
  // LA CINTA: contra el buque si hay objetivo, contra tu record si es POR LA PATRIA.
  //
  // EL RECORD ES DE POR LA PATRIA Y DE NINGUN OTRO MODO. `rasante_frontal_best` es UN numero
  // global: mientras lo escribia cualquier modo, una corrida de CICLO o del ARENA podia inflar el
  // maximo que se veia en otro lado. Y en los modos con objetivo la corrida ni siquiera es
  // comparable — termina cuando llegas al buque, no cuando te matan, o sea que el puntaje lo decide
  // la distancia y no como volaste. POR LA PATRIA es el unico donde una corrida es una corrida:
  // infinita, sin objetivo, y se acaba cuando te caes.
  // EL CARTEL (core/cartel.js) va ANTES de la cinta: baja desde atras de ella y vuelve a esconderse ahi
  // LAS ISLAS (21/11, el autor: "en ISLA o ARENA este indicador pierde sentido: quitarlo y usar ese espacio para los
  // toasts de mensajes, apareciendo desde arriba hacia abajo y luego se van por la derecha"): sin la cinta de km
  islasHud = !!h.brujula;
  drawCartel();
  // (21/11, el autor: "dentro de la cabina la barra de arriba molesta; en el tutorial, una vez que la explica, que
  // desaparezca"): `sinCinta` la saca (game.js: en cabina, y en el tutorial fuera de su explicacion)
  if (islasHud || h.sinCinta) { /* sin cinta */ }
  else if (objectiveDist > 0) drawObjectiveBar(objectiveDist, objectiveShip, h.goalKind, h.vuelta, h.sueltaYa, h.ruta);
  else if (gameMode === 'survival') drawCorridaBar();
  // LA AMENAZA de los modos sueltos (cuanto aprieta el mundo ahora, data/modos_sueltos.js OLEADA): chica,
  // arriba a la derecha — en el CICLO, debajo del filo derecho de la cinta, que ahi llega hasta el borde
  if (h.suelto && h.oleada) drawOleada(W - MARGEN, objectiveDist > 0 ? MARGEN + 13 : MARGEN, h.oleada);

  // EL CONTADOR DE MISION SE FUE (playtest 29/8). «MISION 3/14» arriba del todo era lo unico del
  // HUD que hablaba del MENU y no del vuelo: en que numero de la campaña estas no cambia nada de lo
  // que haces en los proximos diez segundos, y lo dice el briefing antes de despegar. Encima ocupaba
  // el renglon mas visible de la pantalla, que ahora se lo queda la ruta.


  // AVISO DE ROCE "! SUBI !" — es un ESTADO persistente (estás rozando la superficie), no un
  // evento, asi que vive en el HUD fijo arriba del velocimetro y parpadea como el resto de los
  // ---------- AVISOS DE ALTURA, pegados al altimetro ----------
  // El aviso de RADAR estaba arriba de todo y el de ROCE flotaba suelto, pero los dos hablan de
  // LO MISMO que el altimetro: estas demasiado alto (te ven) o demasiado bajo (te matas). Estar
  // lejos del numero que los causa obligaba a barrer la pantalla. Ahora comparten una sola fila,
  // justo encima de la velocidad y la altura.
  //
  // EL RADAR YA NO AVISA ACA (11/9): su carga es una placa que entra desde la izquierda, pegada al
  // panel de alerta (ver drawRadar). En el centro queda solo el roce, que es muerte en segundos.
  const scraping = run.scrapeVib > 0.6;
  // LOS AVISOS SE APOYAN ARRIBA DE LOS RELOJES (11/9), o arriba de la caja de charla si hay una
  // (`h.charlaTecho`, lo mide game.js): desde que velocidad y altura pasaron a relojes, el centro de
  // la fila de abajo esta ocupado, y un "¡SUBI!" tapado por la charla es un aviso que no existe.
  // De abajo hacia arriba: el aviso de roce (piso-8) y la niebla.
  const piso = h.charlaTecho == null ? CUADROS_Y : h.charlaTecho;
  const warnY = piso - 8;
  // (el PELIGRO del roce ya no va aca: es un cartel SOSTENIDO arriba, que parpadea — 8/10, game.js)
  void scraping; void warnY;

  // (NIEBLA: aca iba una barra que se vaciaba — cuanto faltaba para salir del banco. Se fue el
  // 29/9 por pedido del autor: no hace falta mostrar cuanto tarda en irse, el jugador se da cuenta
  // cuando se va. Del banco avisa el cartel BANCO DE NIEBLA al entrar, y la vista que se corta.)

  // (VELOCIDAD y ALTURA eran texto aca, abajo al centro, hasta el 11/9: ahora son relojes — ver
  // EL CENTRO, mas abajo. Sus colores de aviso se fueron con ellos, a las agujas.)
  ctx.textAlign = 'center';

  // --- aviso de la banda superior ---
  // Arranca DEBAJO de la barra de objetivo cuando esta existe (ocupa y=14..30); si no hay mision,
  // sube y queda compacto. Antes esta banda tenia dos filas (radar y viento); el radar se mudo
  // abajo junto al altimetro, asi que el viento sube a la fila que quedo libre — si no, quedaba
  // un hueco flotando en el medio de la pantalla.
  // …y la cinta cierra en y=15, no en 31: el aviso sube con ella en vez de dejar un hueco.
  const topBase = (objectiveDist > 0 || gameMode === 'survival') ? 24 : 20;

  if (run.windF < 0.97) {
    ctx.textAlign = 'center'; ctx.font = 'bold 7px monospace';
    ctx.fillStyle = Math.sin(run.t * 8) > 0 ? P.crest : P.dim;
    ctx.fillText(T('windWarn'), W / 2, topBase);
  }

  // LA RACHA junto al avión, en DOS TIEMPOS (12/9). Ya no se escriben multiplicadores: el x5 /
  // x10 / x25 que crecia de tamaño al lado del avion era un numero que nadie leia volando a ras
  // del agua, y competia con el avion justo cuando hay que mirarlo. Queda una PALABRA y una
  // BARRA, del mismo ancho, que se leen como un solo cartelito, y que dicen dos cosas distintas
  // segun en cual de los dos tiempos estes (ver core/aguante.js):
  //
  //   PERFECTO, en naranja  — la altura es la buena y la barra CARGA. Cuatro segundos.
  //   RASANTE, en azul      — el estado ya esta puesto y la barra es el PULSO: sector azul,
  //                           indicador que va y viene, y un toque de gas adentro por pasada.
  //
  // El puntaje sigue multiplicando en flight.js (`run.multShow`): lo que se fue es el numero.
  // SALE DONDE PERFECTO CARGA (PERF_ALT), y no donde paga el x10: desde que los dos techos se
  // separaron, `run.mult === 10` dejaba a la franja de 4,5 a 6 cargando en secreto.
  if (cfg.poderes !== false && (run.aguante || plane.y <= PERF_ALT || ras.on)) {   // sin poderes, ni el cartel
    // proj() devuelve coordenadas de MUNDO (grilla 480x270) y el HUD razona en la de DISEÑO
    // (320x180): hay que dividir por U. Es el unico punto del HUD anclado al mundo.
    const pw = proj(plane.x, plane.y, PZ);
    // (EN CABINA no va pegado al avion —el avion es la camara y caia en el parabrisas—: abajo a la derecha, en la
    // consola, al lado de los carteles — 20/11)
    const s = enCabina() ? { x: W / 2 + 58, y: H - 4 } : { x: pw.x / U, y: pw.y / U };
    // TRES RENGLONES, de arriba a abajo: la palabra, la barra del pulso y —solo en RASANTE— el
    // temporizador de la ventana. Todo el cartelito subio 2 px para hacerle lugar al tercero.
    const bx = s.x + 25, by = s.y - 7;
    const enEstado = run.aguante === 1;
    // EL DESTELLO DEL ACIERTO: la palabra y el sector se van al claro por un pestañeo. Es el
    // unico "si" que da el estado, y tiene que caber en el tiempo que queda hasta el proximo.
    const golpe = enEstado && run.t - run.aguGolpe < 0.12;
    // EL TOQUE ERRADO TITILA EL INDICADOR EN NARANJA. Va en el INDICADOR y no en el sector porque
    // el error fue donde estaba LA AGUJA, no donde estaba el azul: el cartel tiene que aparecer
    // en la cosa que el jugador miro mal. Y naranja y no rojo porque lo que se quemo es el reloj
    // de abajo, que es naranja — el color dice QUE se perdio, no solo que algo salio mal.
    // Titila (no se queda prendido) por la misma razon que el destello del acierto es un
    // pestaneo: el proximo cruce llega en ~0,33 s y un aviso sostenido taparia el siguiente.
    const errado = enEstado && run.t - run.aguErr < AGU_ERR_T && Math.sin(run.t * AGU_ERR_HZ) > 0;
    // LETRA POR LETRA sobre el ancho de la barra, con PASO ENTERO y el bloque centrado — el mismo
    // criterio que los rotulos de barraPoder, y por la misma razon: con paso fraccionario el
    // redondeo de cada letra cae distinto y RASANTE (7 letras en 24 px) salia "R AS AN TE".
    // Se pierde medio pixel de ancho a cada lado y se gana que el espaciado sea siempre igual.
    // EL RENGLON DE ARRIBA CUENTA (13/9). Antes decia siempre RASANTE; ahora, apenas empezas a
    // acertar, pasa a ser el contador — x1, x2, x3… — porque el nombre del estado ya lo dijo el
    // cuadro en que entraste y lo que importa desde ahi es cuanto llevas. La palabra RASANTE se
    // mudo ABAJO, donde es el tanque de concentracion.
    // TRES MODOS, Y SE EXCLUYEN (15/9):
    //   · cargando PERFECTO  → la palabra suelta y su barrita de carga
    //   · en la racha        → hasta el 4to acierto la palabra suelta; del 4to en adelante se
    //                          convierte en BARRA y empieza a llenarse, vacia, igual que la que
    //                          estaba abajo de MOMENTUM
    //   · en el flow         → la misma barra, vaciandose
    // Lo que NO puede pasar es lo que se veia antes: decir PERFECTO con el poder puesto, y dibujar
    // la barrita naranja de carga encima. Son estados distintos y ahora el `else if` lo garantiza.
    const enFlow = ras.on;
    // LA BARRA SE MUDO ARRIBA DE MOMENTUM (pedido del autor, 23/9: "que deje de estar al lado del
    // avion"). Aca quedan la PALABRA y el PULSO; lo que se llena y se gasta —la concentracion y el
    // flow— va en su barra del tablero, con la forma que tenia antes del 13/9 (ver barraPoder mas
    // abajo). En el flow el cartelito de aca no dibuja nada.
    if (enFlow) { /* la barra esta arriba de MOMENTUM */
    } else {
      const pal = T(enEstado ? 'mult_rasante' : 'mult_perfect');
      const paso = Math.max(3, Math.floor((RACHA_W - GLIFO) / Math.max(1, pal.length - 1)));
      const rx = bx + Math.floor((RACHA_W - (GLIFO + paso * (pal.length - 1))) / 2);
      // SIN FONDO: el recuadro oscuro detras de la palabra era una mancha pegada al avion. La
      // palabra va en NEGRITA, que es lo que la sostiene sobre el mar a 5 px.
      ctx.textAlign = 'left'; ctx.font = 'bold 5px monospace';
      ctx.fillStyle = enEstado ? (golpe ? '#ffffff' : RAS_COL) : P.accent;
      for (let i = 0; i < pal.length; i++) ctx.fillText(pal[i], rx + i * paso, s.y - 9);
    }
    if (enFlow) {
      // EN EL FLOW NO HAY NADA MAS QUE LA BARRA: ni pulso, ni ventana, ni carga. La racha se
      // termino —o es barra o es poder— y el cartel se simplifica igual que se te simplifica la
      // cabeza. Ese vaciarse del cartelito ES el aviso de en que estado estas.
    } else if (!enEstado) {
      // LA CARGA: sin carril, solo lo cargado — 4 s de PERFECTO y se abre el estado.
      px(bx, by + 1, Math.round(RACHA_W * Math.min(1, run.streak / AGU.CARGA)), 1, P.accent);
    } else {
      // EL PULSO. Barra BLANCA con un solo sector AZUL, y un indicador de 1 px que va de punta a
      // punta. Hay que darle un toque de gas mientras pasa por el azul; el sector se corre en
      // cada acierto y se va cerrando, y el indicador acelera. La barra dice las tres cosas que
      // el jugador necesita —donde, cuando y cuanto margen— sin un solo numero.
      const w = anchoSector(run.aguN);
      // SURCO OSCURO Y SECTOR AZUL. El carril era BLANCO y el sector azul encima, y con la barra de
      // concentracion —tambien azul— justo arriba, el cartelito se leia al reves: lo encendido
      // parecia ser el carril y lo apagado el sector. Ahora el azul es SIEMPRE el poder y lo que
      // hay que acertar, el gris es lo vacio, y lo unico que se sale de esa regla es el reloj de
      // abajo, que es naranja porque mide TIEMPO y no poder.
      px(bx, by, RACHA_W, 3, '#2e3c45');
      px(bx + Math.round(RACHA_W * run.aguSec), by, Math.max(1, Math.round(RACHA_W * w)), 3,
        golpe ? '#ffffff' : RAS_COL);
      // el indicador pasa a CLARO: sobre el surco oscuro, el negro de antes desaparecia. Sobresale
      // 1 px arriba y abajo para leerse como una aguja que cruza y no como un pedazo de la barra.
      px(bx + Math.min(RACHA_W - 1, Math.round(posInd(run.aguF) * (RACHA_W - 1))), by - 1, 1, 5,
        errado ? P.accent : '#e9edf0');
      // EL TEMPORIZADOR DE LA VENTANA, debajo del pulso. Es lo que el estado se sostiene SOLO —el
      // avion va clavado como un crucero mientras le quede— y acertar el azul lo vuelve a llenar.
      // Se VACIA en vez de crecer, que es el mismo idioma que el reloj del escondite: lo que se
      // vacia se lee como "lo que te queda", y lo que crece se leeria como algo cargandose.
      // El surco detras es lo gastado: sin el, una raya corta no dice de cuanto era.
      // VA EN NARANJA Y DE 1 PX: naranja porque es un RELOJ y en este tablero los relojes son del
      // acento (la carga de PERFECTO, la Chancha, el cañon), y azul ya lo dice todo lo que es el
      // rasante — con las dos barras azules el ojo las leia como una sola cosa partida. Fina para
      // que sea el renglon MAS liviano de los tres: el pulso es lo que hay que mirar.
      // EL RELOJ VA ABAJO DE TODO. Lo tuve arriba media hora por un malentendido mio y se leia
      // mal: la ventana es lo que se te ESTA ACABANDO, y lo que se acaba se mira al pie.
      const vy = by + 5, fr = Math.max(0, Math.min(1, run.aguVen / ventanaAgu(run.aguN)));
      px(bx, vy, RACHA_W, 1, '#2e3c45');
      // CUANDO QUEDA POCO, PARPADEA APAGANDOSE (el mismo criterio que las balizas): un cambio de
      // color seria un dato nuevo que aprender; el titileo se ve de reojo, sin mirar el cartel.
      if (fr > 0.28 || Math.sin(run.t * 9) > 0) px(bx, vy, Math.max(1, Math.round(RACHA_W * fr)), 1, P.accent);
    }
  }
  // borde encendido según la racha
  if (run.rasLevel > 0) {
    ctx.globalAlpha = 0.05 * run.rasLevel + Math.max(0, Math.sin(run.t * 6)) * 0.04 * run.rasLevel;
    px(0, 0, W, 3, P.accent); px(0, H - 3, W, 3, P.accent);
    px(0, 0, 3, H, P.accent); px(W - 3, 0, 3, H, P.accent);
    ctx.globalAlpha = 1;
  }

  // horizonte artificial, en el centro del grupo del vuelo (ver ADI)
  alTablero(xVuelo(1), CUADROS_Y, drawADI, 13);

  // LA FILA de cuadrados de abajo, en los tres grupos de la cabina (ver CUADRO / X_* arriba).

  // LOS CARTELES QUE SALEN DE ATRAS DE CADA CAJA (antes de la fila: quedan detras y asoman por arriba)
  drawAvisosCaja();
  // LA CARA DEL PILOTO, en la esquina de la fila (ver drawPiloto).
  drawPiloto(h.charlaVoz, h.pilotoAvion, h.avionNombre);

  // ---- LA NAFTA (izquierda, al lado de SALUD) y LA CHANCHA (derecha, con lo que se carga) ------
  // La chancha solo con COMBUSTIBLE: SI — un reloj que nunca se va a poder usar es ruido ocupando
  // un cuadrado. La nafta queda al lado de SALUD: son los dos que dicen si volves o no.
  const xNafta = X_NAFTA, xCha = X_CHANCHA;
  // CON RUTA (PLAN_NAFTA_ALCANCE N3) el reloj cuenta KM y no %, la aguja toma el color de la zona de
  // gasto en la que volas, y la marca larga es el BINGO: cuando la aguja la cruza hacia abajo, lo que
  // queda ya no alcanza para terminar la mision ni volando perfecto. Ese es el critico, no el 25%.
  const nf = h.nafta;
  const bajo = nf ? nf.km < nf.bingo : run.fuel < 25;
  // …Y MIENTRAS LA CHANCHA PASA NAFTA (pedido del autor 24/9): borde y aguja en verde. Es el mismo
  // verde de la caja de conexion, asi que los dos lugares dicen lo mismo a la vez.
  const chS = chSnap(), cargando = !!chS && !!chS.cargando;
  // LO QUE ENTRO (15/10, el autor: "marcar la diferencia entre lo que estaba y lo que llenaste, y una vez
  // desconectado ese verde se desvanece"): al empezar a cargar se anota la nafta que habia; mientras
  // carga, una FRANJA verde va de esa marca a la de ahora. Al soltarse, el verde (borde, aguja y franja)
  // se apaga en CARGA_FUNDE segundos y el reloj vuelve a ser el de siempre.
  const ahoraC = performance.now() / 1000;
  if (cargando) { if (cargaDesde === null) cargaDesde = run.fuel; cargaHasta = run.fuel; cargaFinT = ahoraC; }
  const verdeC = cargaDesde === null ? 0 : cargando ? 1 : Math.max(0, 1 - (ahoraC - cargaFinT) / CARGA_FUNDE);
  if (!cargando && cargaDesde !== null && verdeC <= 0) cargaDesde = null;
  // LA ZONA DE GASTO va ADENTRO del cuadrado, como flechas (27/9, el autor): dos rojas para arriba
  // = mayor gasto, un guion = normal, dos verdes para abajo = ahorro. Antes era el NOMBRE de la zona
  // escrito arriba del reloj ("GASTO MEDIO"): una palabra mas que leer en el tablero.
  if (pide(run.fuel < 60 || (nf && nf.km < nf.bingo * 1.3) || verdeC > 0, 'nafta')) {
    const colAguja = bajo ? (Math.sin(run.t * 10) > 0 ? P.warn : P.dim) : nf && h.zonaGasto ? GASTO_COL[h.zonaGasto] : P.foam;
    // (23/11, el autor: "la nafta: una barra verde que indique la nafta, tal como hicimos con el gas, y que la aguja
    // represente eso literal; el 100 % mas chico para quitarle ruido"): el mismo arco ancho que el gas (naftaArco)
    alTablero(xNafta, CUADROS_Y, () => naftaArco(xNafta, CUADROS_Y, {
      val: run.fuel / 100, bajo, cargando,
      bingo: nf ? Math.min(1, nf.bingo / nf.cap) : null,
      carga: verdeC > 0 ? [cargaDesde / 100, Math.max(cargaDesde, cargaHasta) / 100, verdeC] : null,
      colAguja: verdeC > 0 ? mezclaCol(colAguja, SUELTA_COL, verdeC) : colAguja,
      txt: nf ? Math.round(nf.km) + 'km' : Math.round(run.fuel) + '%' }));
    if (nf && h.zonaGasto) flechasGasto(xNafta + CUADRO - 6, CUADROS_Y + 3, h.zonaGasto);
  }
  // NAFTA BAJA (19/11, el autor): la caja de la nafta larga su cartel mientras estes bajo el critico (25%, o el
  // BINGO con ruta) y la Chancha no este cargando. Se dibuja con los demas en drawAvisosCaja (al cuadro siguiente).
  avisoSostenido('nafta', bajo && !cargando, T('bar_fuelLow'));
  // LAS ISLAS (19/11, el autor: "donde esta mi indicador de chancha para poder llamarla?"): ahi no hay barra
  // que llenar —se pide cada tanto, gratis—, asi que el reloj mide la ESPERA: `h.chIslas` (0..1, 1 = se puede)
  const ch = chSnap(), cv = h.chIslas != null ? h.chIslas : chMeter(), gastada = h.chIslas != null ? false : chGastada();
  // …y solo si la mision la TIENE (`h.chanchaViva`, por snapshot): una mision con `chancha: false`
  // no puede pedirla, y un reloj lleno y en verde ahi es un boton que miente.
  const gCh = falHud('reabast');
  if (cfg.fuelOn && (h.chanchaViva !== false || gCh >= 3) && pide(cv >= 1 || gastada || !!ch || !!h.chIdaLista || gCh > 0 || h.chIslas != null)) {
    // EL FINAL DE LA ESCALA ES LA EMERGENCIA: cuando la aguja llega al icono, la Chancha se puede
    // pedir. Con una cita en curso el numero cuenta lo que importa — cuanto falta para que llegue,
    // cuanto dura la ventana, o cuanto tanque va entrando.
    const enCita = !!ch && (ch.fase === 'eta' || ch.conn || ch.win > 0);
    // LISTA: cargada al tope, sin gastar y sin cita en curso. Todo el reloj se pone verde (ver
    // verdeListo): es la unica luz del tablero que dice "esto ya lo podes usar".
    const lista = (cv >= 1 || !!h.chIdaLista) && !gastada && !enCita, verde = verdeListo();
    // ENGANCHADO, EL RELOJ ES DE ELLA (pedido del autor 24/9): la aguja y el numero pasan a ser su
    // RESERVA, que baja mientras te pasa nafta. Antes mostraba TU tanque, y un numero de la Chancha
    // que subia no se entendia.
    const suReserva = !!ch && ch.conn;
    // LAS ISLAS (20/11, el autor: "la Chancha no hace falta que sea un indicador asi, puede ser solo un icono que va
    // cargando como cuando esta en reparacion el avion, y en otro lado"): la silueta con su aro que se llena, arriba de
    // la nafta (en cabina, en su relojito del tablero)
    // (21/11: EN TODOS LADOS — el lugar de la fila es de la TEMPERATURA)
    if (CHANCHA_ICONO) {
      const f = suReserva ? ch.reserva : enCita ? 1 : gastada ? 0 : h.chIdaLista ? 1 : cv;
      const txt = enCita ? (ch.fase === 'eta' ? (ch.espera ? '' : Math.ceil(ch.eta) + 's') : ch.conn ? Math.round(ch.reserva * 100) + '%' : '')
        : lista ? '' : h.chIslas != null ? h.chIslasS + 's' : Math.round(cv * 100) + '%';
      chanchaIcono(f, lista ? verde : enCita ? P.accent : P.dim, txt, lista);
      donde.chancha = enCabina() ? [X_NAFTA + CUADRO / 2, CUADROS_Y - 11] : [CH_NAFTA.x, CH_NAFTA.y];
    } else
    reloj(xCha, CUADROS_Y, conFalla({
      // la de la IDA planificada no depende de la barra: aguja al tope y LISTA, aunque la barra este baja
      val: suReserva ? ch.reserva : gastada ? 0 : h.chIdaLista ? 1 : cv, ico: 'chancha', fin: 'emergencia',
      critico: !!ch && ch.fase === 'cita' && ch.win < 8,     // la ventana de la cita se esta cerrando
      icoCol: lista ? verde : P.dim,
      borde: lista ? verde : null,
      finCol: lista ? verde : P.warn,
      // LA AGUJA SE QUEDA BLANCA (pedido del autor, 12/9): el verde lo dicen el borde, el icono y el
      // numero. Teñirla tambien era pintar de verde el unico trazo que se lee como MEDIDA.
      col: gastada ? P.dim : lista ? P.foam : P.crest,
      txt: enCita ? (ch.fase === 'eta' ? (ch.espera ? '--' : Math.ceil(ch.eta) + 's')
        : ch.conn ? Math.round(ch.reserva * 100) + '%' : ch.espera ? '--' : Math.ceil(Math.max(0, ch.win)) + 's')
        : h.chIdaLista || (h.chIslas != null && cv >= 1) ? T('ch_lista') : h.chIslas != null ? h.chIslasS + 's' : Math.round(cv * 100) + '%',
      txtCol: lista ? verde : ch && ch.conn ? P.accent : ch && ch.fase === 'cita' && ch.win < 8 ? P.warn : P.dim }, gCh));
    if (!CHANCHA_ICONO) marcaFalla(xCha, CUADROS_Y, gCh);
  }

  // ---- EL RADAR PROPIO (15/10, data/radar_propio.js): solo en los aviones que lo llevan ------------
  // (el autor: "no es un cuadrado asi: un cuadrado como el radar de arriba a la izquierda, pero azul y con
  // la silueta del avion en el medio, arriba de las armas a la derecha")
  // (…y despues: "o ponelo entre medio de los elementos de abajo, en esos espacios": en el hueco entre el
  // grupo del vuelo y el de lo que se carga, centrado en la fila)
  // (19/11: arriba del grupo de la derecha — el hueco de la fila se lo llevo la cara del piloto)
  // (23/11, el autor: "el poder de radar debe estar como item, esta demasiado colgado en el aire, y que tenga formita
  // de radar"): EN LA FILA, en el hueco que dejo la Chancha (ahora icono arriba de la nafta), como un reloj mas —
  // redondo, con su barrido y el avioncito de la placa del piloto—. Si ese hueco esta tomado (el termometro en la
  // cabina o con la brujula), vuelve arriba del grupo de la derecha, como antes.
  const radarEnFila = !enCabina() && !h.brujula && !h.brujulaPasillo;
  if (radarP.tiene) { if (radarEnFila) radarReloj(X_CHANCHA, CUADROS_Y); else radarPropio(X_CARGA, CUADROS_Y - AIRE - ALERTA_H); }
  donde.radar = radarEnFila ? [X_CHANCHA + CUADRO / 2, CUADROS_Y] : [X_CARGA + Math.round(RADAR_W / 2), CUADROS_Y - AIRE - ALERTA_H];
  donde.chancha = [X_CHANCHA + CUADRO / 2, CUADROS_Y];
  donde.chapitas = [X_RACK + RACK_W / 2, CUADROS_Y];

  // ---- SALUD (izquierda, bajo la cara) y el CAÑON (derecha, con lo que se carga) ----------------
  // SALUD en la esquina, pegada a la cara del piloto (pedido del autor). El cañon no se gasta: se
  // RECARGA solo enfriandose, asi que es de los que se cargan.
  // SALUD (ver relojSalud): se pide si la chapa no esta entera o si la amarilla bajo. El umbral es
  // 0,97 y no 1 por el mismo motivo que el 0,05 del cañon: sube y baja sola volando rasante.
  const xSalud = X_SALUD;
  if (pide((dmgShown() && run.integ < 100) || amarilla() < 0.97, 'salud')) relojSalud(xSalud, CUADROS_Y);
  const gCa = falHud('canon');
  if (!run.sinCanon && pide(run.heat > 0.05 || run.overheat || gCa > 0, 'canon')) {   // (sin cañon no hay reloj: 17/10)
    // EL CAÑON no tiene municion que contar —dispara hasta recalentarse y se traba hasta enfriar—,
    // asi que el reloj marca TEMPERATURA, con la zona roja donde se traba. Uno por METRALLA: el
    // simple de siempre, o el atornillado de plata o de oro (ver relojCanon).
    relojCanon(X_CANON, CUADROS_Y, run.metralla);
    if (gCa >= 2) alTablero(X_CANON, CUADROS_Y, () => vidrioRoto(X_CANON, CUADROS_Y));
    marcaFalla(X_CANON, CUADROS_Y, gCa);
  }

  // ---- EL CENTRO: LOS CUATRO DEL VUELO (playtest 11/9) -----------------------------------------
  // VELOCIDAD, MACH, ALTITUD y GAS, en relojes como los del resto de la fila. Pedido del autor con
  // fotos de la cabina del A-4 Skyhawk, que era toda analogica: la idea es que el jugador mire abajo
  // y sienta lo mismo que nuestros pilotos — un tablero lleno de agujas. El numero sigue al pie de
  // cada uno: la aguja dice "mas o menos cuanto" de reojo, y el numero "cuanto" cuando hay tiempo.
  //
  // Arman la "T" con el horizonte (ver ADI y xVuelo): VELOCIDAD, horizonte, ALTITUD y GAS — las
  // cuatro agujas que no paran de moverse. El MACH se fue a la derecha: sale de la misma velocidad y
  // cambia despacio, asi que no necesita estar adelante.
  const xRack = X_RACK;
  // VELOCIDAD, en km/h. La aguja toma el color de lo que la esta empujando —turbo o racha en acento,
  // postcombustion en rojo, viento en contra en cresta—, que eran las etiquetas del numero de antes.
  //
  // DOS TOPES EN LA ESCALA (11/9): EL MAXIMO DEL AVION sin turbo (marca BLANCA) y con turbo (marca
  // NARANJA, bastante mas a la derecha). No son "hasta donde llego ahora" —eso ya lo dice la aguja—
  // sino hasta donde puede llegar: son dos numeros fijos (ver TOPE), la misma cuenta con la que vuela
  // el avion llevada al limite. Lo unico que los mueve es la AVERIA, que baja los dos a la vez.
  // La marca de Mach 1 se fue de aca: el Mach tiene su propio reloj, con la suya.
  //
  // Y CON TURBO CAMBIAN LA AGUJA Y EL ICONO, los dos juntos: la aguja es BLANCA y se pone naranja
  // solo con turbo (antes tambien se teñia con la racha y con el viento, y entonces el naranja no
  // queria decir nada), y el icono pasa de dos flechas finas en gris a las mismas dos GRUESAS en
  // acento. Y EL BORDE DE LA PLACA se prende en acento, FIJO: sin titilar, porque el turbo no es una
  // alarma — el titileo es el idioma del peligro (ver bordeCritico) y prestarselo lo gastaria.
  const kmh = run.spd * KMH_U, mach = machNow(run.spd);
  const colVel = run.boost ? P.accent : P.foam;
  const ef = effects(run.integ, cfg.dmgMode);
  const tope = b => TOPE[b ? 1 : 0] * ef.spd / VEL_TOPE;
  const marcasVel = [[tope(false), P.foam]];
  if (ef.turbo) marcasVel.push([tope(true), P.accent]);
  // …Y LA FRANJA DE ENTREMEDIO EN ACENTO, como la del cono en el Machmetro: ese tramo de la escala
  // es el que SOLO se alcanza con turbo. La zona dice "esto te lo da el turbo" sin una palabra.
  const zonasVel = ef.turbo ? [[tope(false), tope(true), P.accent]] : [];
  // SIN TURBO PARA SIEMPRE (la averia paso el escalon del medio): el vidrio se raja y la marca
  // naranja no esta. El avion no vuelve a llegar ahi en toda la corrida.
  reloj(xVuelo(0), CUADROS_Y, { val: kmh / VEL_TOPE, ico: run.boost ? 'turbo' : 'vel',
    icoCol: run.boost ? P.accent : P.dim, col: colVel, marcas: marcasVel, zonas: zonasVel,
    roto: dmgShown() && !ef.turbo, borde: run.boost ? P.accent : null,
    txt: String(Math.round(kmh)), uni: 'km/h', txtCol: run.boost ? P.accent : P.dim });
  // MACH, aparte, como en el A-4. Lo que esta en acento es el regimen del cono (core/mach.js) y la
  // marca larga, otra vez, Mach 1.
  const fM = m => (m - MACH_DE) / (MACH_A - MACH_DE);
  // (21/11, el autor: "el reloj de mach en la cabina, pero en tercera persona un reloj mucho mas chico DENTRO de la
  // velocidad, en un extremo de arriba, que indique los mach mas a nivel general: 0 1 2 3 4"): afuera de la cabina
  // el machimetro grande se va y queda el chiquito, en la esquina de arriba a la derecha del velocimetro
  // (23/11, el autor: "la aguja extra en velocidad esta al pedo"): sin el mach chico en tercera persona
  const bru = h.brujula || h.brujulaPasillo;   // (la de las islas, o la de relleno de POR LA PATRIA)
  if (enCabina() && !bru) reloj(X_MACH, CUADROS_Y, { val: fM(mach), ico: 'mach', col: mach >= M_CONO ? P.accent : P.foam,
    zonas: [[fM(M_CONO), 1, P.accent]], marcas: [[fM(1), P.foam]],
    txt: mach.toFixed(2), txtCol: mach >= M_CONO ? P.accent : P.dim });
  // ALTITUD, en metros y con la escala ESTIRADA ABAJO (raiz cuadrada): el juego entero pasa en los
  // primeros veinte metros, y con una escala lineal el rasante eran dos marcas. Rojo el agua, acento
  // la franja del rasante (x10), y la marca larga roja es el techo del radar DE LA FASE (llega en `h`).
  // La aguja se pone roja y parpadea con cualquiera de los dos peligros de altura: te ven, o rozas.
  // …Y HASTA ARRIBA DE TODO (16/11, el autor: "que el altimetro tambien marque hasta arriba"): el carril
  // (hasta FLY_TOP) se queda con las tres cuartas partes del dial, con su raiz de siempre, y LO ALTO
  // (ALTO.TECHO) entra en el ultimo cuarto. La marca blanca es la capa de nubes.
  const fA = a => a <= FLY_TOP ? 0.75 * Math.sqrt(Math.max(0, a / FLY_TOP))
    : 0.75 + 0.25 * Math.sqrt(Math.min(1, (a - FLY_TOP) / (ALTO.TECHO - FLY_TOP)));
  const techo = h.radarAlt === undefined ? RADAR_ALT : h.radarAlt;
  // (sin radar, arriba del techo no te ve nadie: la aguja no se pone roja por altura, solo por rozar)
  const rozando = run.scrapeVib > 0.6;
  // LA ZONA DEL RADAR (23/11, el autor: "que el indicador de altura tenga una barra por encima de los indicadores, que
  // arranca en el valor de altura que representa al radar… verde radar, mas oscuro con lineas mas claras pasando por
  // adentro; la aguja cuando pasa por esa zona se pone verde parpadeante, como el borde y toda la barra… una onda
  // radioactiva"). Con radar: la franja del techo para arriba, que se levanta con la barra del escaneo; adentro (te
  // ven), aguja, borde, numero y franja en verde titilando. Rozar sigue siendo rojo: es otro peligro.
  const radarOn = !h.sinRadar && !h.fueraRadar, enRadar = radarOn && plane.y > techo && !rozando;
  const latido = Math.sin(run.t * 14) > 0;
  // …Y EN LA SUELTA (data/blanco.js), LA ALTURA DE SOLTAR en verde: la franja del dial, la marca
  // larga donde la bomba empieza a armarse, y la aguja verde mientras estes adentro. Era una regla
  // aparte a la derecha de la pantalla y no se entendia (playtest 23/9): la altura ya tiene reloj.
  const sa = h.sueltaAlt, enSuelta = !!sa && plane.y >= sa[0] && plane.y <= sa[1];
  // LAS TRES ZONAS DE GASTO (PLAN_NAFTA_ALCANCE §3.6, solo con ruta): la franja interior del dial,
  // en su color. Mayor gasto abajo, menor arriba de todo. En el reloj de nafta la zona son flechas
  // (flechasGasto), sin texto.
  const zg = h.zonaGasto;
  // la zona por ALTURA, no la de la nafta: con el rasante la nafta ahorra (flechas verdes), pero la
  // franja que se prende es la de donde estas parado
  const zAqui = ZONAS_GASTO.find(z => plane.y >= z.desde).id;
  const franjas = zg ? ZONAS_GASTO.map((z, i) =>
    [fA(Math.max(0, z.desde)), i ? fA(ZONAS_GASTO[i - 1].desde) : 1, GASTO_COL[z.id], z.id === zAqui]) : null;
  // LOS DIVISORES DE LA NAFTA (26/9, el autor: "quiza con el divisor verde de pegarle al barco se
  // entiende"). La marca larga es lo que el ojo ya aprendio a leer como "aca empieza algo": la usan
  // el techo del radar y la altura de soltar. Dos, en los dos bordes que cambian la plata:
  //   · donde EMPIEZA EL AHORRO (gasto menor, la cita con la Chancha), en su azul
  //   · donde TERMINA EL GASTO MAYOR, en su naranja
  // Van ANTES que la del radar en la lista: si coinciden (el borde de abajo es RADAR_ALT a
  // proposito) manda el rojo del radar, que es el que te mata.
  const divNafta = zg ? [[fA(ZONAS_GASTO[0].desde), GASTO_COL.menor], [fA(ZONAS_GASTO[1].desde), GASTO_COL.mayor]] : [];
  // EL ALTIMETRO FALLADO (PLAN_FALLAS): leve tiembla, media ATRASA (la aguja sigue a la altura con medio
  // segundo de retraso), TOTAL muerto — se vuela a ojo, sin la banda de soltar
  const gAl = falHud('altimetro');
  altLag += (plane.y - altLag) * Math.min(1, (gAl === 2 ? 2 : 60) / 60);
  const altVista = gAl === 2 ? altLag : plane.y;
  reloj(xVuelo(2), CUADROS_Y, conFalla({ val: fA(altVista), ico: 'alt', critico: rozando, franjas,
    radar: radarOn ? { desde: fA(techo), crece: h.radarScan == null ? 1 : h.radarScan, on: enRadar } : null,
    col: rozando ? (Math.sin(run.t * 30) > 0 ? P.warn : '#7d2f1e') : enRadar ? (latido ? RADAR_VERDE.punta : RADAR_VERDE.onda) : enSuelta ? SUELTA_COL : plane.y <= BANDA_ALT ? P.accent : P.foam,
    zonas: [[0, fA(1.2), P.warn], [fA(1.2) + 0.01, fA(BANDA_ALT), P.accent]].concat(sa ? [[fA(sa[0]), fA(sa[1]), SUELTA_COL]] : []),
    // sin marca de techo FUERA DE RADAR: no hay techo (PLAN_NAFTA_ALCANCE N2)
    marcas: divNafta.concat(h.fueraRadar || h.sinRadar ? [] : [[fA(techo), RADAR_VERDE.eje]]).concat(sa ? [[fA(sa[0]), SUELTA_COL]] : [])
      // EL SALTO: la altura del buque debajo de tu linea, en amarillo, desde que soltas hasta el cruce
      .concat(h.saltoAlt != null ? [[fA(h.saltoAlt), SALTO_COL]] : []).concat([[fA(ALTO.NUBES), P.foam]])
      // EL TECHO DE PERFECTO (21/11, el autor: "marcar el limite final de perfecto"): con los poderes, la marca larga
      // en el acento donde PERFECTO deja de cargar — abajo de esa raya se carga el RASANTE
      .concat(cfg.poderes !== false ? [[fA(PERF_ALT), P.accent]] : []),
    // …y EL BORDE DE LA PLACA en verde, FIJO mientras estes en altura de soltar (se lee de reojo sin
    // buscar la aguja, como el borde del turbo en el velocimetro) y TITILANDO cuando ademas es el
    // momento de soltar: el mismo latido que la cinta y el estante.
    borde: h.sueltaYa ? (titilaSuelta() ? SUELTA_COL : null) : enRadar ? (latido ? RADAR_VERDE.punta : RADAR_VERDE.lejos) : enSuelta ? SUELTA_COL : null,
    txt: Math.round(altVista) + 'm', txtCol: rozando ? P.warn : enRadar ? RADAR_VERDE.punta : P.dim }, gAl));
  // LA ALTURA TRABADA (LAS ISLAS desde arriba, autor 19/11: "marcar locked o un candado en el marcador de
  // altura"): desde la vista cenital la altura queda clavada, y el reloj lo dice con un CANDADO en la punta
  // de arriba a la derecha y el borde fijo en el color del candado
  if (h.altFija) alTablero(xVuelo(2), CUADROS_Y, () => {
    const x = xVuelo(2) + CUADRO - 8, y = CUADROS_Y + 2, c = P.accent;
    px(x + 1, y, 3, 1, c); px(x + 1, y + 1, 1, 2, c); px(x + 3, y + 1, 1, 2, c);   // el arco
    px(x, y + 3, 5, 3, c); px(x + 2, y + 4, 1, 1, '#0b0f12');                    // el cuerpo y el ojo de la llave
    bordePlaca(xVuelo(2), CUADROS_Y, CUADRO, CUADRO, c);
  });
  // LA BRUJULA (LAS ISLAS, autor 19/11: "poner la brujula como control adicional, que en pasillo practicamente no
  // se usa, es relleno, pero aca si"): solo cuando viene `h.brujula` (islas.js `brujula`), en el hueco entre el
  // vuelo y lo que se carga (no: en el del MACH, ver abajo). La rosa GIRA (arriba es hacia donde va el morro, la rayita fija), N en acento, y el
  // OBJETIVO es un triangulo naranja en el borde con su distancia abajo.
  // (VA EN EL LUGAR DEL MACH: el hueco de al lado del gas es el de la Chancha, que en las islas tambien va)
  // …Y EN POR LA PATRIA TAMBIEN (23/11, el autor: "aunque no sirva tanto, para rellenar y que el usuario se acostumbre a
  // todos los controles, exactamente en el mismo lugar que isla"): `h.brujulaPasillo`, sin objetivo
  if (bru) drawBrujula(X_MACH, CUADROS_Y, bru);
  // (21/11, el autor: "no pongas arriba el coso, metelo todo en horizontal"): en la fila, en el lugar que era el
  // reloj de la Chancha (que paso a ser el icono de arriba de la nafta)
  // (21/11, el autor: "el indicador de temperatura del lado izquierdo: nafta, temperatura, velocidad, nivel"): en
  // tercera persona va donde estaba el machimetro grande (el mach chico vive en el velocimetro); con la brujula de las
  // islas en ese lugar, y en la cabina, se queda donde estaba
  tempX = !enCabina() && !bru ? X_MACH : X_CHANCHA;
  if (h.temp) drawTemperatura(tempX, CUADROS_Y, h.temp);
  marcaFalla(xVuelo(2), CUADROS_Y, gAl);
  if ((cfg.vert === 'planeo' || cfg.vert === 'planeo_m') && (run.sosten ?? 1) <= 0 && plane.vy < -0.3) flechaBaja(xVuelo(2), CUADROS_Y);
  // GAS: la palanca, leida como las RPM de un tablero de verdad. Era la corredera vertical del borde
  // derecho; sin nafta, la aguja parpadea (el reloj de nafta, a la izquierda, dice por que).
  // (SIN BORDE CRITICO, por pedido del autor: el gas se opera, no avisa. Sin nafta avisa la nafta.)
  const suaveG = cfg.vert === 'planeo' || cfg.vert === 'planeo_m';
  alTablero(xVuelo(3), CUADROS_Y, () => gasArco(xVuelo(3), CUADROS_Y, run.throttle, run.sosten ?? 1, suaveG, run.fuel <= 0));

  // ---- EL PODER DEL JUGADOR, arriba de su cara (ver barraPoder) ---------------------------------
  // QUEDO UNO SOLO (13/9). La barra del RASANTE se fue entera, y con ella su lengueta LISTO y su
  // reloj de la esquina. No es orden: es que no tenian nada que mostrar. El poder dejo de cargarse
  // con tiempo en la banda —afuera de la racha marcaria cero siempre— y sus segundos ahora los
  // cuenta la PALABRA que sale al lado del avion, que se llena con los aciertos y se vacia al
  // usarse. El reloj de la esquina decia lo mismo, pero lejos de donde estas mirando.
  //
  // LO QUE SE PIERDE, y es a proposito: la barra tambien hacia de propaganda. Estaba siempre en
  // pantalla y le enseñaba al que volaba alto que abajo habia algo esperandolo. Ahora eso solo se
  // descubre bajando — que es el juego.
  const tv = tempoMeter();
  const altoPod = PODER_H + 2;                                   // la placa de la barra
  const yPod = PIL_Y() - AIRE - altoPod;   // pegada a la cara, con el mismo aire
  // …y en una mision SIN PODERES no esta: una barra que no se puede usar es un boton que miente
  if (cfg.poderes !== false) {
    // (23/11, el autor: "la barra de momentum: quitarle el texto, hacerla mas chica y ponerla entre el nombre y la cara
    // del piloto para ahorrar espacio"): la dibuja drawPiloto (barritaMomentum); aca queda solo la del RASANTE, que
    // toma el lugar que era de la placa del MOMENTUM
    void tv;
    // …Y ARRIBA, LA DEL RASANTE (volvio, 23/9). La MISMA forma que tenia antes del 13/9 —la placa,
    // el nombre adentro, el celeste de mar— y la FUNCION de ahora: aparece recien cuando la racha
    // empieza a juntar concentracion (4to acierto) y se llena; con el flow puesto se va GASTANDO; y
    // cuando se termina, DESAPARECE. No hay lengueta LISTO: el flow no se lanza, te agarra.
    const llenando = run.aguante === 1 && run.aguN >= AGU.CONC_GATE;
    if (ras.on || llenando) {
      const fr = ras.on
        ? (ras.dur > 0 ? ras.resta / ras.dur : 0)
        : Math.max(0, Math.min(1, (concSeg(run.aguN) - AGU.CONC_GATE) / (AGU.CONC_TOPE - AGU.CONC_GATE)));
      barraPoder(PIL_X(), yPod, fr, RAS_COL, RAS_CLARO, RAS_OSCURO, ras.on, false, T('bar_rasante'));
    }
  }

  // municion de misiles: cada pip es el MISIL en miniatura (cuerpo blanco, ojiva gris, llama),
  // el mismo que se ve volar — no un rectangulo generico. Vacio = solo el contorno.
  // LOS MISILES, EN UN ESTANTE ANGOSTO (playtest 11/9): del alto de los cuadrados, al lado de SALUD,
  // uno arriba del otro y sin rotulo —cada pip ES un misil—. La placa de 64 que tenian estaba casi
  // vacia, y los cuatro relojes del vuelo necesitaban ese lugar.
  // LA SUELTA: el estante muestra LA CARGA, pilon por pilon (arriba y abajo el par de ala, al medio
  // el centro). La del centro es LA DEL BUQUE: va enmarcada en rojo —el color del blanco— y, lejos
  // del buque, apagada (bloqueada). Las de ala pueden ser bombas o tanques. Cuando es el momento de
  // soltar, lo que se puede soltar titila en verde con el mismo latido que la cinta y el altimetro.
  alTablero(X_RACK, CUADROS_Y, () => drawEstante(h));
  drawCostos();   // los -N de lo que se uso, arriba de cada uno
  // el LANZADOR fallado: el bisel del estante (ambar que late) o, TOTAL, en rojo y con la cruz
  { const gB = falHud('bombas');
    if (gB) alTablero(X_RACK, CUADROS_Y, () => {
      bordePlaca(X_RACK, CUADROS_Y, RACK_W, CUADRO, gB >= 3 ? '#8a2a1e' : Math.sin(run.t * 6) > 0 ? '#d08a2e' : '#7a5120');
      if (gB >= 3) { ctx.fillStyle = '#e0503a'; const cx = X_RACK + RACK_W / 2, cy = CUADROS_Y + 13;
        for (let i = -4; i <= 4; i++) { ctx.fillRect(cx + i, cy + i, 1, 1); ctx.fillRect(cx + i, cy - i, 1, 1); } }
    }); }

  // (LA PALANCA DE GAS del borde derecho se fue al reloj de GAS, en el centro de la fila: 11/9.)
  bordesAvisos();   // el borde de la caja con cartel titila (19/11)
  // EN CABINA, LAS MANOS VAN DELANTE DE LOS RELOJES (21/11): la palanca tapaba el reloj de abajo al medio al reves
  // (el HUD va escalado a su grilla de diseño: las manos se dibujan en la del mundo, como la cabina)
  if (enCabina()) { ctx.save(); ctx.scale(1 / U, 1 / U); ctx.globalAlpha = 1; drawManos(); ctx.restore(); }
}

