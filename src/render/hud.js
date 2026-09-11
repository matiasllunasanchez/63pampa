// HUD: la capa de instrumentos y avisos sobre el vuelo, mas la cuenta regresiva del despegue.
//
// Escuadron, ruta del objetivo (con su kilometraje adentro), velocidad, altura, radar, viento,
// multiplicador, combustible, calor del canon, misiles, la palanca de gas y los dos rieles de
// racha. Va SIN el zoom de camara (el orquestador lo restaura antes de llamar aca).
//
// Lee el estado de vuelo de los stores (run, plane). Lo que es de MISION/menu (best, gameMode,
// objectiveDist, objectiveShip, goalKind) vive en game.js y entra por parametro, igual que las
// otras pantallas (render/screens.js, render/menus.js).

import { ctx, px, DW as W, DH as H, PZ, U, avisoFont } from './ctx.js';
import { plane, cfg } from '../core/state.js';
import { run } from '../core/run.js';
import { shown as dmgShown } from '../systems/damage.js';
import { proj } from '../core/fx.js';
import { scrapeLimit } from '../core/physics.js';
import { T } from '../core/i18n.js';
import { P, RADAR_VERDE, RADAR_OPACO } from '../data/palette.js';
import { MSL_MAX, RADAR_ALT, EST_MAX, VOZ_COLS, KMH_U, A_MAR, M_CONO, FLY_TOP } from '../data/tuning.js';
import { machNow } from '../core/mach.js';
import { pilotIdx } from '../core/squad.js';
import { pilotName } from '../systems/squad.js';
import { active as tempoActive, meterVal as tempoMeter } from '../systems/tempo.js';
import { meterVal as chMeter, gastada as chGastada, snapshot as chSnap } from '../systems/chancha.js';
import { attitude } from '../core/horizon.js';
import { retrato, silueta } from './retratos.js';
import { icono, iconoEn } from './iconos.js';
import { ICONO_BUQUE, ICONO_BUQUE_NOMBRE } from '../data/iconos.js';
import { SHIP_CLASS } from '../data/ships.js';
import { CARA_PILOTO, GESTOS, GESTO_SOSTEN, SONRISA_PTS, SONRISA_T } from '../data/gestos.js';
import { radio, visible as radioVisible } from '../core/radioVN.js';
import { inBank, bankLeft, fogTop } from '../systems/fog.js';

// largo del banco tal como se vio al entrar: la barra necesita un TOTAL contra el que vaciarse, y
// el sistema solo sabe cuanto FALTA (el largo se sortea por banco).
let fogSeen = 0;

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
 *    boost  estelas atras del marcador */
function cinta(o) {
  const conLinea = o.b != null;
  ctx.font = F_VAL;
  const aW = Math.round(ctx.measureText(o.a).width);
  const bW = o.b ? Math.round(ctx.measureText(o.b).width) : 0;
  ctx.font = F_ROT;
  const uniW = o.uni ? Math.round(ctx.measureText(o.uni).width) + 2 : 0;
  const rotW = o.rot ? Math.round(ctx.measureText(o.rot).width) + 5 : 0;
  // EL NOMBRE DEL BLANCO, en SU cuadro y en rojo, pegado a los kilometros (playtest 11/9). Estaba a la
  // izquierda de la ruta, en gris: lejos del numero con el que se asocia. Pegado al total, y del color
  // del total, el cuadro se lee de un tiron — «2.6 km hasta el HMS SHEFFIELD».
  const nomW = o.nombre ? Math.round(ctx.measureText(o.nombre).width) + 8 : 0;
  let linea = CINTA_LINEA;
  let ancho = 4 + rotW + (conLinea ? linea + 5 + 5 : 0) + aW + (o.b ? 3 + bW : 0) + uniW + 4;
  const conNombre = () => ancho + (nomW ? nomW - 1 : 0);   // el instrumento entero: cinta + cuadro
  // EL MINIMO: el ancho que la radio necesita para colgar debajo con el MISMO ancho (ver VOZ). Lo
  // que falta se lo lleva la LINEA de la ruta, que gana resolucion en vez de ganar alto. Sin linea
  // (POR LA PATRIA sin record) no se estira nada: el toast se defiende solo con el mismo minimo.
  const min = vozMin();
  if (conLinea && conNombre() < min) { const falta = min - conNombre(); linea += falta; ancho += falta; }
  const total = conNombre();
  const bx0 = Math.round(W / 2 - total / 2);
  const py = MARGEN, y = py + 5;                     // la fila, al medio de una placa de 11
  plate(bx0, py, ancho, 11);
  if (o.nombre) {
    // comparte el canto con la cinta: se lee como una pestaña del mismo instrumento, no como otro
    plate(bx0 + ancho - 1, py, nomW, 11);
    ctx.textAlign = 'left'; ctx.fillStyle = P.warn;
    ctx.fillText(o.nombre, bx0 + ancho + 3, py + 7);
  }
  if (o.rot) {
    ctx.textAlign = 'left'; ctx.fillStyle = P.dim;   // apagado: es contexto, no un valor
    ctx.fillText(o.rot, bx0 + 4, y + 2);
  }
  let kx = bx0 + 4 + rotW;
  if (conLinea) {
    const x0 = kx, x1 = x0 + linea;
    // via PUNTEADA (pendiente) que se va rellenando continua (recorrido): lee como ruta de mapa
    for (let dx3 = 0; dx3 < linea; dx3 += 4) px(x0 + dx3, y, 2, 1, '#2e3c45');
    px(x0, y, Math.round(linea * o.prog), 1, P.accent);
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
    iconoEn(pm, y, 'avion', P.ink);
    kx = x1 + 8;   // el buque mide 11: medio casco a la derecha del final de la linea
  }
  ctx.textAlign = 'left'; ctx.font = F_VAL;
  ctx.fillStyle = P.accent; ctx.fillText(o.a, kx, y + 2);
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
export function drawObjectiveBar(objectiveDist, objectiveShip, kind) {
  const km = Math.max(0, run.dist) / 1000;
  const esBuque = kind !== 'distance';
  cinta({
    nombre: esBuque ? objectiveShip : null,
    prog: Math.max(0, Math.min(1, run.dist / objectiveDist)),
    meta: esBuque ? 'buque' : 'distancia',
    buque: esBuque ? (ICONO_BUQUE_NOMBRE[objectiveShip] || ICONO_BUQUE[SHIP_CLASS[objectiveShip]] || 'buque_t42') : null,
    a: km.toFixed(1), b: '/ ' + (objectiveDist / 1000).toFixed(1),
    // 'km' en MINUSCULA y del color del total: mas chica sin bajar de cuerpo, y es ademas el simbolo
    // correcto del kilometro (el SI no lo escribe en mayuscula)
    uni: 'km', uniCol: P.warn,
    boost: run.boost,
  });
}

/** POR LA PATRIA: contra tu record. Sin objetivo no hay ruta, pero la pregunta del renglon es la
 *  misma —¿como va esta corrida?— y las tres cosas que la contestan son la misma info: el
 *  kilometraje dice cuanto aguantaste, el puntaje cuanto sacaste y el record contra que se compara.
 *  Estaban en tres placas sueltas apiladas en la esquina; son un instrumento.
 *
 *  SIN RECORD TODAVIA no se dibuja la linea: una barra que avanza hacia cero no avanza hacia nada.
 *  Queda el kilometraje y el puntaje, que es exactamente lo que hay para decir. */
export function drawCorridaBar(best) {
  const km = Math.max(0, run.dist) / 1000;
  const pts = Math.floor(run.score);
  cinta({
    rot: km.toFixed(1) + ' km',   // en minuscula, como en la cinta con objetivo
    prog: best > 0 ? Math.max(0, Math.min(1, pts / best)) : 0,
    meta: 'record',
    a: String(pts), b: best > 0 ? '/ ' + best : null,
    // PASASTE TU MARCA: la bandera y el numero se prenden en acento. Es el unico aviso que hace
    // falta —la linea ya esta llena y el marcador clavado en la punta— y evita el cartel, que en
    // POR LA PATRIA taparia mundo justo cuando el jugador esta arriesgando mas.
    metaCol: best > 0 && pts >= best ? P.accent : P.warn,
    uni: null, boost: run.boost,
  });
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

export function drawTakeoff(toT) {
  ctx.textAlign = 'center';
  // placa oscura detras del encabezado: cae sobre el amanecer y sin esto no se lee
  ctx.fillStyle = '#0a0e11aa'; ctx.fillRect(0, 17, W, 23);
  ctx.fillStyle = P.ink; ctx.font = '7px monospace';
  ctx.fillText(T('takeoffTitle'), W / 2, 26);
  // el rumbo va pegado al titulo: antes estaba en y=80, encima del avion en la pista
  ctx.fillStyle = '#8a9ba1'; ctx.font = '6px monospace';
  ctx.fillText(T('takeoffHeading'), W / 2, 36);

  const cn = 3 - Math.floor(toT);
  if (cn >= 1) {
    const frac = toT % 1;
    const fs = Math.round(30 - frac * 10);
    const num = String(cn);
    ctx.font = 'bold ' + fs + 'px monospace';
    // sombra: el conteo cae sobre el sol del amanecer y sin esto no se lee
    ctx.fillStyle = '#0a0e11aa';
    ctx.fillText(num, W / 2 + 1, 69);
    // bandera argentina: tres franjas horizontales (celeste / blanco / celeste)
    const top = 68 - fs * 0.75, hgt = fs * 0.78;
    const bands = [[0, 1 / 3, CELESTE], [1 / 3, 2 / 3, BLANCO], [2 / 3, 1, CELESTE]];
    for (const [a, b, col] of bands) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, top + hgt * a, W, hgt * (b - a) + 0.5);   // +0.5: sin costura entre franjas
      ctx.clip();
      ctx.fillStyle = col;
      ctx.fillText(num, W / 2, 68);
      ctx.restore();
    }
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
function relojSalud(x, y) {
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
  const marca = (a, rr, col) => {
    const qx = Math.round(cx + Math.cos(a) * rr), qy = Math.round(cy + Math.sin(a) * rr);
    if (libre(qx, qy)) px(qx, qy, 1, 1, col);
  };
  // LA CHAPA SE MARCA EN HORAS Y EL ESCUDO EN SEGUNDOS (playtest 11/9). Arriba, CUATRO BLOQUES
  // gruesos, uno por escalon de averia, PRENDIDOS hasta donde llega la chapa: "cuantos tramos me
  // quedan" se lee sin buscar la aguja, que queda para el detalle. El primero es rojo —ahi ya no hay
  // piruetas— y el hueco entre bloques es el escalon. Abajo, una escala FINA y apretada, como la de
  // los segundos: es la que se mueve rapido y va y vuelve. La diferencia de trazo es lo que separa
  // las dos escalas de un vistazo, antes que el color.
  if (total !== null) {
    const hechos = new Set();
    for (let k = 0; k <= 120; k++) {
      const f = k / 120;
      if (Math.abs(f - 0.25) < 0.03 || Math.abs(f - 0.5) < 0.03 || Math.abs(f - 0.75) < 0.03) continue;
      const col = f > total + 1e-6 ? '#2e3c45' : f < 0.25 ? P.warn : P.foam;
      for (const rr of [r, r - 1]) {
        const qx = Math.round(cx + Math.cos(arriba(f)) * rr), qy = Math.round(cy + Math.sin(arriba(f)) * rr);
        if (!libre(qx, qy) || hechos.has(qx * 1000 + qy)) continue;   // el primero que llega lo pinta
        hechos.add(qx * 1000 + qy);
        px(qx, qy, 1, 1, col);
      }
    }
  }
  // el rojo del escudo es el mismo umbral en que la aguja empieza a parpadear
  for (let i = 0; i <= 24; i++) marca(abajo(i / 24), r, i / 24 <= 0.35 ? P.warn : '#55676f');
  // EL MINUTERO: amarillo siempre —es su nombre—, rojo y parpadeando cuando queda poco o mientras se
  // esta rozando, que es cuando hay que mirarlo
  const aT = abajo(temp);
  pxLinea(cx, cy, cx + Math.cos(aT) * (r - 2), cy + Math.sin(aT) * (r - 2),
    temp < 0.35 || rozando ? (Math.sin(run.t * 16) > 0 ? P.warn : '#7d2f1e') : P.accent);
  // LA DE LAS HORAS, encima: con el avion sano tapa la base del minutero y le deja la punta afuera.
  // Gruesa con una segunda raya al costado de afuera de su mitad.
  if (total !== null) {
    const aC = arriba(total), l = r - 4;
    const col = total <= 0.25 ? (Math.sin(run.t * 10) > 0 ? '#ff5340' : P.warn) : P.foam;
    const ox = Math.round(Math.sin(aC)), oy = Math.round(-Math.cos(aC));
    pxLinea(cx + ox, cy + oy, cx + ox + Math.cos(aC) * l, cy + oy + Math.sin(aC) * l, col);
    pxLinea(cx, cy, cx + Math.cos(aC) * l, cy + Math.sin(aC) * l, col);
  }
  px(cx - 1, cy - 1, 2, 2, P.ink);                        // el eje
  // LA CRUZ en vez de la palabra: es salud, y una cruz lo dice en cualquier idioma y en menos lugar.
  // BLANCA Y NO ROJA: la cruz roja sobre fondo claro es un emblema protegido (Convenios de Ginebra)
  // y a mas de un juego le pidieron sacarla. Una cruz clara dice «salud» igual.
  // Van en las dos esquinas de la izquierda, que las escalas les dejan libres (ver `libre`).
  iconoEn(x + 3.5, y + 3.5, 'vida', total !== null ? P.foam : P.dim);
  if (total !== null) iconoEn(x + 3, y + 22, 'escudo', P.accent);
  else iconoEn(x + 3.5, y + 22.5, 'ola', P.accent);
}

// ---------- KIT DE PIXEL ART DEL HUD ----------
// Todo instrumento comparte el mismo lenguaje: PLACA oscura con borde de 1px y esquinas
// marcadas, relleno con BISEL (fila superior mas clara) y muescas de escala. Antes cada barra
// era un rectangulo translucido distinto — se leia como debug, no como instrumento.

/** Placa de instrumento: fondo oscuro + borde fino + esquinas remarcadas. */
function plate(x, y, w, h) {
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
export const cintaCaja = () => cajaCinta;
// LA COLUMNA DERECHA, de arriba abajo, y las dos medidas juntas porque son la misma decision: los
// primeros 12 px de esa esquina NO son del canvas (ahi vive el boton de sonido, que es HTML — ver
// index.html), y debajo va el reloj del rasante cuando esta encendido. El gas vivio abajo de el,
// como corredera vertical, hasta el 11/9: ahora es un reloj de la fila de abajo.
const RELOJ_Y = 15;                  // la placa del reloj del rasante: 15..25

// LOS CUADRADOS DE ABAJO, ORDENADOS COMO LA CABINA DEL A-4 (playtest 11/9). Tres grupos, como en
// un tablero de verdad, con mas aire entre grupos que adentro de cada uno:
//   IZQUIERDA  el combate: SALUD, CAÑON y el estante de MISILES
//   CENTRO     el vuelo, en la "T" de toda cabina: el horizonte en el medio, la velocidad a su
//              izquierda (y el Mach al lado, como en el reloj KNOTS/MACH del A-4) y la altitud a su
//              derecha
//   DERECHA    el motor: GAS (las RPM), NAFTA y la CHANCHA
// LA CARA DEL PILOTO no es un instrumento y ya no esta en la fila: va arriba de la esquina izquierda
// y de ahi sale su voz (ver drawPiloto y, en render/screens.js, drawVozPropia).
const CUADRO = 26, CUADROS_Y = H - MARGEN - CUADRO;
/** El x del cuadrado `i` de la fila, contando desde el margen izquierdo. Los cuatro de la izquierda
 *  salian de cuentas sueltas y el piloto y la nafta quedaron pisandose un pixel. */
const COL = i => MARGEN + i * (CUADRO + AIRE);
// LOS RELOJES DEL VUELO (ver drawHUD): hasta donde llega cada escala, y el ancho del estante de
// misiles que les hizo lugar.
const VEL_TOPE = 1400;              // km/h: pasa Mach 1 (1200) con aire; la postcombustion la clava
// El Mach arranca en 0,2 y no en 0,4: el crucero anda por 0,26 a 0,5, y con la escala en 0,4 la
// aguja pasaba media mision clavada en cero, que en un tablero se lee como un instrumento roto.
const MACH_DE = 0.2, MACH_A = 1.4;
const RACK_W = 12;
// DONDE VA CADA UNO (ver el orden de los grupos arriba). El grupo del vuelo se centra en el hueco
// entre los otros dos: aire igual a los dos lados, que se ve mejor que el horizonte clavado en el
// medio exacto de la pantalla (queda a siete pixeles).
const X_SALUD = COL(0), X_CANON = COL(1), X_RACK = COL(2);
const X_MOTOR = W - MARGEN - 3 * CUADRO - 2 * AIRE;            // GAS, NAFTA y CHANCHA, contra el borde
const X_VUELO = Math.round((X_RACK + RACK_W + X_MOTOR - (4 * CUADRO + 3 * AIRE)) / 2);
const xVuelo = i => X_VUELO + i * (CUADRO + AIRE);              // MACH, VELOCIDAD, horizonte, ALTITUD

/** LO MAS ALTO QUE PINTA EL TABLERO DE VUELO: el canto de los cuadrados. Fue el de la fila de placas
 *  de SALUD, cuatro pixeles mas arriba, hasta que SALUD paso a ser un cuadrado.
 *
 *  Se EXPORTA para que la banda de la voz (render/screens.js) no tenga que copiar el numero. Lo
 *  copiaba, y la copia se pudrio: decia 110 porque la escribio la epoca en que RASANTE y MOMENTUM
 *  eran la cuarta y la quinta barra de la pila de la izquierda. Desde entonces se mudaron dos
 *  veces y el toast siguio esquivando un instrumento que ya no estaba ahi. Con esto, el dia que
 *  las filas se muevan otra vez, la banda se mueve con ellas. */
export const HUD_TECHO = CUADROS_Y;

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
function pide(algo) { return cfg.hudAuto !== 'auto' || algo; }

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
function riel(x, val, col) {
  px(x, 0, 2, H, '#0a0e11aa');                                // la corredera, apenas insinuada
  const fh = Math.round(H * Math.max(0, Math.min(1, val)));
  px(x, H - fh, 2, fh, col);
  if (fh > 1) { ctx.globalAlpha = 0.45; px(x, H - fh, 2, 1, '#f2f7fb'); ctx.globalAlpha = 1; }   // el canto de arriba
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
const ADI = { cx: xVuelo(2) + 13, cy: CUADROS_Y + 13, r: 10 };
const ADI_SKY = '#3c6c8e', ADI_GND = '#6b4a2a', ADI_LINE = '#f2f7fb';

function drawADI() {
  const { cx, cy, r } = ADI;
  plate(cx - 13, cy - 13, CUADRO, CUADRO);
  // la bola girada, fila por fila y pixel por pixel. Son ~340 pruebas por cuadro (nada) y evita
  // arc()+clip, que entra con ANTIALIAS: en un HUD de pixel art duro un borde borroneado se lee
  // como suciedad, no como instrumento.
  const a = -attitude();                    // la bola gira al REVES que el avion, como la de verdad
  const sa = Math.sin(a), ca = Math.cos(a);
  // CABECEO: trepar baja el horizonte (el avion queda por encima), picar lo sube. 5 px = medio
  // radio a cabeceo pleno — suficiente para leerlo sin que el suelo se vaya de la bola.
  const po = Math.max(-1, Math.min(1, plane.pitch)) * 5;
  for (let dy = -r; dy <= r; dy++) {
    const hw = Math.floor(Math.sqrt(r * r - dy * dy));
    for (let dx = -hw; dx <= hw; dx++) {
      const d = -dx * sa + dy * ca - po;    // distancia con signo a la linea del horizonte
      px(cx + dx, cy + dy, 1, 1, Math.abs(d) < 0.8 ? ADI_LINE : d > 0 ? ADI_GND : ADI_SKY);
    }
  }
  // SIMBOLO DEL AVION, fijo: dos alas y el techo de la cabina. Es la referencia contra la que se
  // lee la bola — si esta sobre el marron, venis con la trompa en el suelo.
  px(cx - 7, cy, 4, 1, P.accent);
  px(cx + 4, cy, 4, 1, P.accent);
  px(cx - 1, cy - 1, 3, 1, P.accent);
  px(cx, cy, 1, 1, P.accent);
  // muesca de las 12: marca donde queda ARRIBA para el avion, siempre en el mismo lugar
  px(cx, cy - r, 1, 2, P.accent);
}

// ---------- EL RELOJ: un cuadrado con aguja, hermano del horizonte ----------
// La misma caja de 26 y el mismo lenguaje: arco de escala arriba, aguja desde el eje, icono abajo a
// la izquierda y el numero abajo a la derecha. Analogico para leer de un vistazo (donde apunta) y
// con numero para decidir (cuanto exactamente).
//
// El arco barre media vuelta, de 180 a 360 grados: vacio a la izquierda, lleno a la derecha, y el
// medio arriba. La mitad de abajo queda libre a proposito — ahi viven el icono y el numero.
function pxLinea(x0, y0, x1, y1, col) {
  const n = Math.max(1, Math.round(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0))));
  for (let i = 0; i <= n; i++) px(x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n, 1, 1, col);
}

/** `o` = { val 0..1, col, ico, icoCol, zona: [desde, hasta] en rojo, zonas: [[desde, hasta, col]]
 *  (varias y de cualquier color; manda sobre `zona`), marcas: [[f, col]] marcas LARGAS, fin: icono
 *  al final de la escala (o null), txt: el numero al pie, txtCol } */
function reloj(x, y, o) {
  plate(x, y, CUADRO, CUADRO);
  const cx = x + 13, cy = y + 16, r = 10;
  const ang = f => Math.PI + Math.PI * Math.max(0, Math.min(1, f));
  // LA ESCALA: trece marcas. Las de la zona van en rojo — el peligro es parte del dial, no un aviso
  const zonas = o.zonas || (o.zona ? [[o.zona[0], o.zona[1], P.warn]] : []);
  for (let i = 0; i <= 12; i++) {
    const f = i / 12, a = ang(f);
    const z = zonas.find(([d, h]) => f >= d && f <= h);
    px(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 1, 1, z ? z[2] : '#55676f');
  }
  // LAS MARCAS LARGAS: un punto de la escala que importa por si solo (Mach 1, el techo del radar).
  // Cruzan el aro para afuera y para adentro: se ven aunque caigan entre dos marcas comunes.
  for (const [f, col] of o.marcas || []) {
    const a = ang(f), c = Math.cos(a), s = Math.sin(a);
    pxLinea(cx + c * (r - 2), cy + s * (r - 2), cx + c * (r + 1), cy + s * (r + 1), col);
  }
  const a = ang(o.val);
  pxLinea(cx, cy, cx + Math.cos(a) * (r - 2), cy + Math.sin(a) * (r - 2), o.col);
  px(cx - 1, cy - 1, 2, 2, P.ink);                       // el eje
  if (o.fin) icono(x + CUADRO - 8, y + 9, 6, o.fin, o.finCol || P.warn);   // su '+' es calado (data/iconos.js)
  icono(x + 2, y + CUADRO - 9, 7, o.ico, o.icoCol || P.dim);
  if (o.txt) {
    ctx.font = F_ROT; ctx.textAlign = 'right'; ctx.fillStyle = o.txtCol || P.dim;
    ctx.fillText(o.txt, x + CUADRO - 3, y + CUADRO - 4);
    ctx.textAlign = 'left';
  }
}

// ---------- EL CUADRO DEL PILOTO (playtest 10/9) ----------
// La cara del que vuela, al lado del horizonte y del mismo alto que su placa. Es INMERSION: no
// dice nada que el tablero no diga, pero lo dice con la cara de alguien — y un instante antes de
// que el jugador lo lea en un numero. Los gestos y sus umbrales viven en data/gestos.js.
//
// Y ES DE DONDE SALE LA VOZ DE MI AVION. Si la linea de radio la dice el piloto que vuela, el
// toast no baja de la cinta: sube de esta cara (ver drawRadioVN). Arriba habla la radio de los
// otros; aca abajo, pegado a mis instrumentos, hablo yo.
const PILOTO = { lado: 26, cara: 22 };
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

/** Dibuja la cara y devuelve el x donde sigue el tablero (sin cara: el mismo x, no queda hueco). */
function drawPiloto() {
  // APARTE DEL TABLERO (11/9): arriba de la esquina izquierda, y no en la fila. La cara no es un
  // instrumento, y a su derecha tiene que quedar lugar para lo que dice (drawVozPropia, en screens).
  const x = MARGEN, y = CUADROS_Y - AIRE - PILOTO.lado;
  const nombre = pilotName(pilotIdx(run.squad, run.lives));
  const base = CARA_PILOTO[sinTilde(nombre)];
  if (!base) return x;
  // el reloj del cuadro sale de `run.t`: el HUD no recibe dt, y una corrida nueva (run.t que
  // vuelve para atras) arranca la cara de cero en vez de heredar la sonrisa de la anterior
  const nueva = ultT < 0 || run.t < ultT;
  const dt = nueva ? 0 : Math.min(0.1, run.t - ultT);
  if (nueva) { gesto = 'neutro'; gestoT = 0; sonrisaT = 0; ultPts = run.score; golpeT = 0; ultInteg = run.integ; ultEscudo = run.escudo; }
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
  if (precargada !== base) { precargada = base; for (const g of GESTOS) retrato(base + '_' + g); }

  plate(x, y, PILOTO.lado, PILOTO.lado);
  // el sacudon tambien lo sufre el piloto: un pixel, nada mas
  const j = run.shake > 2 ? Math.round((Math.random() - 0.5) * 2) : 0;
  const cara = retrato(base + '_' + gesto) ? base + '_' + gesto : base + '_neutro';
  const im = retrato(cara);
  if (im) ctx.drawImage(im, x + 2 + j, y + 2, PILOTO.cara, PILOTO.cara);
  else silueta(x + 2, y + 2, PILOTO.cara);
  // el impacto: el mismo fogonazo rojo que ya usa el HUD, sobre la cara
  if (golpeT > 0) { ctx.globalAlpha = Math.min(0.45, golpeT * 0.75); px(x + 2, y + 2, PILOTO.cara, PILOTO.cara, '#ff3a24'); ctx.globalAlpha = 1; }
  // CUANDO HABLA, el marco se prende: la linea sale de aca y el ojo tiene que saber de donde
  const habla = radioVisible() && radio.personaje && sinTilde(radio.personaje) === sinTilde(nombre);
  if (habla) { ctx.strokeStyle = P.accent; ctx.strokeRect(x + 0.5, y + 0.5, PILOTO.lado - 1, PILOTO.lado - 1); }
  // `cara` es la que se esta viendo AHORA (con su gesto): si mi linea tiene que ir arriba porque
  // abajo hay una charla, el toast usa ESTA y no el retrato de radio — ver drawRadioVN
  cajaPiloto = { x, y, lado: PILOTO.lado, nombre, cara, gesto };
  return x + PILOTO.lado + AIRE;
}


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
export function anchoSquad() {
  const nombre = pilotName(pilotIdx(run.squad, run.lives));
  ctx.font = F_VAL;
  const wFila = Math.max(2, run.squad) * SQ_PASO + 3 + ctx.measureText(nombre).width;
  return Math.max(ALERTA_MIN_W, Math.round(wFila) + 6);
}

export function drawSquadPips(x, y) {
  const fallen = pilotIdx(run.squad, run.lives);
  const nombre = pilotName(fallen);
  ctx.textAlign = 'left';
  plate(x, y, anchoSquad(), SQUAD_H);
  for (let i = 0; i < run.squad; i++) {
    const ax = x + 3 + i * SQ_PASO, down = i < fallen;
    // el que vuela, en acento; los que esperan, claros; los caidos, oscuros y tachados en rojo
    iconoEn(ax + 3, y + 5, 'avion', down ? '#3a4750' : i === fallen ? P.accent : P.foam);
    if (down) pxLinea(ax, y + 7, ax + 6, y + 3, P.warn);
  }
  // EL NOMBRE DEL QUE VUELA, EN ACENTO. Estaba en `dim` —el gris de los rotulos— y ahi el piloto
  // era una etiqueta mas. Es la unica persona que hay en el HUD: va del color del que manda.
  ctx.fillStyle = P.accent; ctx.font = F_VAL;
  ctx.fillText(nombre, x + 5 + run.squad * SQ_PASO, y + 8);
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
// TODO VERDE, por pedido del autor (11/9): RADAR_VERDE cuando te buscan y RADAR_OPACO a nivel
// cero —gira igual, pero sin contacto y sin la punta encendida: encenderse es la noticia—. Los
// tonos viven en data/palette.js, compartidos con la red de radar en el aire (render/world.js).
// LAS ONDITAS: el pulso que sale del centro, en tres radios, por tramos de fila como el aro. El
// cuarto paso del ciclo no dibuja nada — la onda llega al aro y se pierde en el.
const RADAR_ONDAS = [
  [[3, 3, 5], [4, 3, 3], [4, 5, 5], [5, 3, 5]],
  [[2, 3, 5], [3, 2, 2], [3, 6, 6], [4, 2, 2], [4, 6, 6], [5, 2, 2], [5, 6, 6], [6, 3, 5]],
  [[1, 3, 5], [2, 2, 2], [2, 6, 6], [3, 1, 1], [3, 7, 7], [4, 1, 1], [4, 7, 7], [5, 1, 1], [5, 7, 7], [6, 2, 2], [6, 6, 6], [7, 3, 5]],
];

function radarAlerta(x, y, visto, activo) {
  const V = activo ? RADAR_VERDE : RADAR_OPACO;
  for (const [f, a, b] of RADAR_ARO) px(x + a, y + f, b - a + 1, 1, V.aro);
  const onda = RADAR_ONDAS[Math.floor(run.t * 3.2) % (RADAR_ONDAS.length + 1)];
  if (onda) for (const [f, a, b] of onda) px(x + a, y + f, b - a + 1, 1, V.onda);
  const cx = x + 4, cy = y + 4, ang = run.t * RADAR_GIRO;
  const rayo = (d, r0, col) => {
    for (let r = r0; r <= 3; r++) px(cx + Math.round(Math.cos(ang + d) * r), cy + Math.round(Math.sin(ang + d) * r), 1, 1, col);
  };
  // la estela primero y la punta despues: donde caen en el mismo pixel, gana la punta
  rayo(-0.9, 2, V.lejos); rayo(-0.45, 2, V.cerca); rayo(0, 1, V.punta);
  px(cx, cy, 1, 1, V.eje);
  // EL CONTACTO SOS VOS, y parpadea siempre — pero no igual. Mientras te ven, rapido y encendido:
  // te tienen. Escondido, lento y apagado: es el eco viejo de donde te vieron por ultima vez.
  // A nivel cero no hay contacto: nadie te busca, no hay eco que marcar.
  const on = visto ? Math.floor(run.t * 8) % 2 === 0 : Math.floor(run.t * 2.5) % 2 === 0;
  if (activo && on) px(x + 6, y + 2, 1, 1, visto ? '#d8ffdc' : V.cerca);
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

export function drawAlerta(x, y, w, n, prog) {
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
  if (alertaK > 0) {
    // entra rapido y frena al llegar, recortada al canto del radar: sale DE ATRAS de el
    const e = 1 - Math.pow(1 - alertaK, 3), dx = Math.round(-(1 - e) * (w - RADAR_W + 1));
    ctx.save(); ctx.beginPath(); ctx.rect(x + RADAR_W - 1, y - 3, W, ALERTA_H + 6); ctx.clip();
    balizasAlerta(x, y, w, n, prog, dx, visto);
    ctx.restore();
  }
  // EL RADAR, ENCIMA y quieto: es lo unico que queda cuando no suena nada
  plate(x, y, RADAR_W, ALERTA_H);
  radarAlerta(x + 3, y + 3, visto, n > 0);
}

/** La seccion de las BALIZAS del panel, corrida `dx` por la entrada (ver drawAlerta). */
function balizasAlerta(x, y, w, n, prog, dx, visto) {
  plate(x + RADAR_W - 1 + dx, y, w - RADAR_W + 1, ALERTA_H);
  // las cuatro, repartidas en lo que deja el radar y centradas ahi: la placa mide lo que mide el
  // escuadron, que depende del nombre del piloto, asi que el paso se acomoda y no la placa
  const x0 = x + 15 + dx, libre = w - 18;
  const paso = Math.max(BAL_W + 1, Math.min(BAL_W + 4, Math.floor((libre - BAL_W) / (EST_MAX - 1))));
  const bx0 = x0 + Math.max(0, Math.floor((libre - BAL_W - paso * (EST_MAX - 1)) / 2));
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
function drawRadar(x, y, w, visto) {
  // el reloj de la entrada sale de `run.t`, como el de la cara: el HUD no recibe dt
  const dt = radarT < 0 || run.t < radarT ? 0 : Math.min(0.1, run.t - radarT);
  radarT = run.t;
  radarK = run.detection > 0.001 ? Math.min(1, radarK + dt / RADAR_ENTRA) : Math.max(0, radarK - dt / RADAR_ENTRA);
  if (radarK <= 0) return y;
  const e = 1 - Math.pow(1 - radarK, 3);                  // entra rapido y frena al llegar
  const x0 = Math.round(x - (x + w + 2) * (1 - e));
  plate(x0, y, w, RADAR_H);
  ctx.font = avisoFont(9); ctx.textAlign = 'left';
  ctx.fillStyle = visto ? (Math.sin(run.t * 14) > 0 ? P.warn : '#7d2f1e') : P.dim;
  ctx.fillText('RADAR', x0 + 3, y + 9);                   // la misma palabra en los dos idiomas
  const bx = x0 + 3 + Math.ceil(ctx.measureText('RADAR').width) + 4, bw = x0 + w - 3 - bx;
  px(bx, y + 4, bw, 3, BAL_APAGADA);
  px(bx, y + 4, Math.round(bw * Math.max(0, Math.min(1, run.detection))), 3, P.warn);
  if (run.radarWave > 0) px(bx + Math.round(bw * Math.min(0.55, 0.35 + run.radarWave * 0.03)), y + 3, 1, 5, P.accent);
  return y + RADAR_H + AIRE;
}

export function drawHUD(h) {
  cajaCinta = null;   // ver cintaCaja: una caja de otro cuadro no cuenta
  cajaPiloto = null;  // idem: la cara de la que sale mi voz es la de ESTE cuadro
      const { best, gameMode, objectiveDist, objectiveShip } = h;
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
  let ty = 3;
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
  if (h.estrellas > 0 || h.busqueda) { drawAlerta(MARGEN, ty, anchoSquad(), h.estrellas | 0, h.escondite); ty += ALERTA_H + AIRE; }
  // …Y DEBAJO, LA CARGA DEL RADAR, que entra y sale sola (ver drawRadar).
  ty = drawRadar(MARGEN, ty, anchoSquad(), plane.y > (h.radarAlt === undefined ? RADAR_ALT : h.radarAlt));
  // PERSECUCION no tiene objetivo NI record: la cinta no tiene contra que medir, asi que el
  // kilometraje se queda aca como contador abierto — la forma que le toca cuando no hay meta.
  if (objectiveDist <= 0 && gameMode !== 'survival') { drawOdo(MARGEN, ty); ty += 12 + AIRE; }
  // LA CINTA: contra el buque si hay objetivo, contra tu record si es POR LA PATRIA.
  //
  // EL RECORD ES DE POR LA PATRIA Y DE NINGUN OTRO MODO. `rasante_frontal_best` es UN numero
  // global: mientras lo escribia cualquier modo, una corrida de CICLO o del ARENA podia inflar el
  // maximo que se veia en otro lado. Y en los modos con objetivo la corrida ni siquiera es
  // comparable — termina cuando llegas al buque, no cuando te matan, o sea que el puntaje lo decide
  // la distancia y no como volaste. POR LA PATRIA es el unico donde una corrida es una corrida:
  // infinita, sin objetivo, y se acaba cuando te caes.
  if (objectiveDist > 0) drawObjectiveBar(objectiveDist, objectiveShip, h.goalKind);
  else if (gameMode === 'survival') drawCorridaBar(best);

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
  if (scraping) {
    ctx.textAlign = 'center'; ctx.font = 'bold 8px monospace';
    // parpadeo rapido: la urgencia se lee en el ritmo, no solo en el texto
    ctx.fillStyle = Math.sin(run.t * 30) > 0 ? P.warn : '#7d2f1e';
    ctx.fillText(T('scrape'), W / 2, warnY);
  }

  // NIEBLA: CUANTO FALTA PARA SALIR. Sin esto el banco no es tension sino aguantar a ciegas sin
  // saber hasta cuando, y el jugador se rinde en vez de apretar los dientes. La barra se VACIA:
  // se lee de un vistazo que esto se termina.
  //
  // El HUD SI atraviesa la niebla y el mundo no. Es la regla: el HUD es instrumento, no vista —
  // un altimetro no deja de andar porque haya bruma.
  if (inBank()) {
    const left = bankLeft(), tot = Math.max(left, fogSeen = Math.max(fogSeen, left));
    ctx.textAlign = 'center'; ctx.font = 'bold 7px monospace';
    ctx.fillStyle = plane.y >= fogTop() ? P.foam : P.warn;
    ctx.fillText(T('fogHud'), W / 2, warnY - 9);
    plate(W / 2 - 22, warnY - 7, 44, 3);
    px(W / 2 - 20, warnY - 6.5, Math.max(1, Math.round(40 * left / tot)), 2, plane.y >= fogTop() ? P.foam : P.warn);
  } else fogSeen = 0;

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

  // multiplicador junto al avión — crece con la racha rasante
  if (run.multShow > 1) {
    // proj() devuelve coordenadas de MUNDO (grilla 480x270) y el HUD razona en la de DISEÑO
    // (320x180): hay que dividir por U. Es el unico punto del HUD anclado al mundo.
    const pw = proj(plane.x, plane.y, PZ);
    const s = { x: pw.x / U, y: pw.y / U, k: pw.k / U };
    ctx.textAlign = 'left';
    const size = run.multShow >= 15 ? 12 + run.rasLevel : run.multShow >= 10 ? 11 : run.multShow >= 5 ? 10 : 9;
    ctx.font = 'bold ' + size + 'px monospace';
    ctx.fillStyle = run.multShow >= 25 ? (Math.sin(run.t * 16) > 0 ? P.warn : P.accent)
      : run.multShow >= 15 ? P.accent
        : run.multShow >= 10 ? P.accent
          : run.multShow >= 5 ? '#d9b06a' : P.dim;
    const jx = run.rasLevel > 0 ? (Math.random() - 0.5) * run.rasLevel : 0;
    const jy = run.rasLevel > 0 ? (Math.random() - 0.5) * run.rasLevel : 0;
    if (run.multShow < 10 || Math.sin(run.t * 10) > -0.6)
      ctx.fillText('x' + run.multShow + (run.boost ? ' x2' : ''), s.x + 24 + jx, s.y - 6 + jy);
    // barra de progreso hacia el próximo nivel de racha
    if (run.mult === 10 && run.rasLevel < 4) {
      const prog = (run.streak % 2) / 2;
      ctx.fillStyle = '#0a0e11bb'; ctx.fillRect(s.x + 24, s.y - 3, 26, 3);
      px(s.x + 25, s.y - 2, Math.round(24 * prog), 1, P.accent);
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
  drawADI();

  // LA FILA de cuadrados de abajo, en los tres grupos de la cabina (ver CUADRO / X_* arriba).

  // LA CARA DEL PILOTO, aparte: arriba de la esquina izquierda (ver drawPiloto).
  drawPiloto();

  // ---- DERECHA: EL MOTOR -----------------------------------------------------------------------
  // GAS (mas abajo, con los del vuelo), NAFTA y CHANCHA. La chancha solo con COMBUSTIBLE: SI — un
  // reloj que nunca se va a poder usar es ruido ocupando un cuadrado.
  const xNafta = X_MOTOR + (CUADRO + AIRE), xCha = X_MOTOR + 2 * (CUADRO + AIRE);
  if (pide(run.fuel < 60)) reloj(xNafta, CUADROS_Y, {
    val: run.fuel / 100, ico: 'nafta', zona: [0, 0.25],
    col: run.fuel < 25 ? (Math.sin(run.t * 10) > 0 ? P.warn : P.dim) : P.foam,
    txt: Math.round(run.fuel) + '%', txtCol: run.fuel < 25 ? P.warn : P.dim });
  const ch = chSnap(), cv = chMeter(), gastada = chGastada();
  if (cfg.fuelOn && pide(cv >= 1 || gastada || !!ch)) {
    // EL FINAL DE LA ESCALA ES LA EMERGENCIA: cuando la aguja llega al icono, la Chancha se puede
    // pedir. Con una cita en curso el numero cuenta lo que importa — cuanto falta para que llegue,
    // cuanto dura la ventana, o cuanto tanque va entrando.
    const enCita = !!ch && (ch.fase === 'eta' || ch.conn || ch.win > 0);
    reloj(xCha, CUADROS_Y, {
      val: gastada ? 0 : cv, ico: 'chancha', fin: 'emergencia',
      finCol: cv >= 1 && !gastada ? (Math.sin(run.t * 7) > 0 ? P.accent : P.foam) : P.warn,
      col: gastada ? P.dim : cv >= 1 ? (Math.sin(run.t * 7) > 0 ? P.foam : P.crest) : P.crest,
      txt: enCita ? (ch.fase === 'eta' ? Math.ceil(ch.eta) + 's'
        : ch.conn ? Math.round(run.fuel) + '%' : Math.ceil(Math.max(0, ch.win)) + 's')
        : Math.round(cv * 100) + '%',
      txtCol: ch && ch.conn ? P.accent : ch && ch.fase === 'cita' && ch.win < 8 ? P.warn : P.dim });
  }

  // ---- IZQUIERDA: EL COMBATE -------------------------------------------------------------------
  // SALUD en la esquina, el CAÑON a su lado y el estante de MISILES despues: todo lo que dice "con
  // que puedo pelear, y cuanto aguanto", junto.
  // SALUD (ver relojSalud): se pide si la chapa no esta entera o si la amarilla bajo. El umbral es
  // 0,97 y no 1 por el mismo motivo que el 0,05 del cañon: sube y baja sola volando rasante.
  const xSalud = X_SALUD;
  if (pide((dmgShown() && run.integ < 100) || amarilla() < 0.97)) relojSalud(xSalud, CUADROS_Y);
  if (pide(run.heat > 0.05 || run.overheat))
    // EL CAÑON no tiene municion que contar —dispara hasta recalentarse y se traba hasta enfriar—,
    // asi que el reloj marca TEMPERATURA, con la zona roja donde se traba.
    reloj(X_CANON, CUADROS_Y, {
      val: run.heat, ico: 'canon', zona: [0.75, 1],
      col: run.overheat ? (Math.sin(run.t * 12) > 0 ? P.warn : '#7d2f1e') : run.heat > 0.75 ? P.warn : P.accent,
      txt: Math.round(run.heat * 100) + '%', txtCol: run.overheat ? P.warn : P.dim });

  // ---- EL CENTRO: LOS CUATRO DEL VUELO (playtest 11/9) -----------------------------------------
  // VELOCIDAD, MACH, ALTITUD y GAS, en relojes como los del resto de la fila. Pedido del autor con
  // fotos de la cabina del A-4 Skyhawk, que era toda analogica: la idea es que el jugador mire abajo
  // y sienta lo mismo que nuestros pilotos — un tablero lleno de agujas. El numero sigue al pie de
  // cada uno: la aguja dice "mas o menos cuanto" de reojo, y el numero "cuanto" cuando hay tiempo.
  //
  // Arman la "T" con el horizonte (ver ADI y xVuelo): MACH, VELOCIDAD, horizonte y ALTITUD. El GAS
  // es del motor y abre el grupo de la derecha.
  const xRack = X_RACK;
  // VELOCIDAD, en km/h. La aguja toma el color de lo que la esta empujando —turbo o racha en acento,
  // postcombustion en rojo, viento en contra en cresta—, que eran las etiquetas del numero de antes.
  // La marca larga es Mach 1.
  const kmh = run.spd * KMH_U, mach = machNow(run.spd);
  const colVel = run.afterTier > 0 ? P.warn : run.boost || run.rasLevel > 0 ? P.accent : run.windF < 0.97 ? P.crest : P.foam;
  reloj(xVuelo(1), CUADROS_Y, { val: kmh / VEL_TOPE, ico: 'vel', col: colVel, marcas: [[A_MAR / VEL_TOPE, P.foam]],
    txt: String(Math.round(kmh)), txtCol: colVel === P.foam ? P.dim : colVel });
  // MACH, aparte, como en el A-4. Lo que esta en acento es el regimen del cono (core/mach.js) y la
  // marca larga, otra vez, Mach 1.
  const fM = m => (m - MACH_DE) / (MACH_A - MACH_DE);
  reloj(xVuelo(0), CUADROS_Y, { val: fM(mach), ico: 'mach', col: mach >= M_CONO ? P.accent : P.foam,
    zonas: [[fM(M_CONO), 1, P.accent]], marcas: [[fM(1), P.foam]],
    txt: mach.toFixed(2), txtCol: mach >= M_CONO ? P.accent : P.dim });
  // ALTITUD, en metros y con la escala ESTIRADA ABAJO (raiz cuadrada): el juego entero pasa en los
  // primeros veinte metros, y con una escala lineal el rasante eran dos marcas. Rojo el agua, acento
  // la franja del rasante (x10), y la marca larga roja es el techo del radar DE LA FASE (llega en `h`).
  // La aguja se pone roja y parpadea con cualquiera de los dos peligros de altura: te ven, o rozas.
  const fA = a => Math.sqrt(Math.max(0, Math.min(1, a / FLY_TOP)));
  const techo = h.radarAlt === undefined ? RADAR_ALT : h.radarAlt;
  const rozando = run.scrapeVib > 0.6, visto = plane.y > techo || rozando;
  reloj(xVuelo(3), CUADROS_Y, { val: fA(plane.y), ico: 'alt',
    col: visto ? (Math.sin(run.t * (rozando ? 30 : 14)) > 0 ? P.warn : '#7d2f1e') : plane.y <= 4.5 ? P.accent : P.foam,
    zonas: [[0, fA(1.2), P.warn], [fA(1.2) + 0.01, fA(4.5), P.accent]], marcas: [[fA(techo), P.warn]],
    txt: Math.round(plane.y) + 'm', txtCol: visto ? P.warn : P.dim });
  // GAS: la palanca, leida como las RPM de un tablero de verdad. Era la corredera vertical del borde
  // derecho; sin nafta, la aguja parpadea (el reloj de nafta, a la izquierda, dice por que).
  reloj(X_MOTOR, CUADROS_Y, { val: run.throttle, ico: 'gas',
    col: run.fuel <= 0 ? (Math.sin(run.t * 10) > 0 ? P.warn : P.dim)
      : run.throttle > 0.66 ? P.foam : run.throttle > 0.15 ? P.accent : P.bodyDark,
    txt: Math.round(Math.max(0, Math.min(1, run.throttle)) * 100) + '%', txtCol: run.fuel <= 0 ? P.warn : P.dim });

  // ---- LOS BORDES: LOS PODERES DE RACHA ---------------------------------------------------------
  // RASANTE y MOMENTUM dejan de ser barras con rotulo y pasan a ser dos RIELES en los bordes
  // laterales: izquierda rasante, derecha momentum, siempre. Los dos se GANAN volando —no se
  // gastan como la nafta— asi que nunca fueron del bloque del avion; y ninguno de los dos se lee
  // de verdad: se vigilan de reojo mientras se mira el centro, que es un trabajo distinto y que un
  // rotulo de 5 px no hace. En el borde el recorrido pasa de 44 px a 180 (ver `riel`).
  //
  // ACTIVO MUESTRA LO QUE QUEDA, igual que cuando eran barras: mientras dura, el unico dato es
  // cuanto falta para que se apague. Vacio vuelve a ser "cuanto falta para tenerlo".
  // …Y CON SU LETRA. En el playtest del 10/9 hubo que preguntar dos veces que eran estos dos rieles:
  // sin marca, un riel solo funciona si ya sabes que es. La marca va a media altura, que es el unico
  // tramo del borde donde no hay nada mas.
  icono(0, H / 2 - 3, 6, 'rasante', P.canopy);
  icono(W - 6, H / 2 - 3, 6, 'momentum', P.crest);
  riel(1, ras.on ? ras.resta / ras.dur : ras.meter,
    ras.on ? (Math.sin(run.t * 10) > 0 ? P.accent : P.canopy)
      : ras.meter >= 1 ? (Math.sin(run.t * 7) > 0 ? P.accent : P.canopy) : P.canopy);
  // MOMENTUM (tecla 4): se carga con puntos; LLENO parpadea despacio (esta listo para lanzar) y
  // LANZADO parpadea rapido (se gasta).
  const tv = tempoMeter();
  riel(W - 3, tv, tempoActive() ? (Math.sin(run.t * 14) > 0 ? P.accent : P.foam)
    : tv >= 1 ? (Math.sin(run.t * 7) > 0 ? P.accent : P.crest) : P.crest);
  // EL RELOJ DEL RASANTE, y SOLO mientras esta encendido. Es el unico numero que los rieles no
  // pueden dar —cuantos segundos quedan, no que fraccion— y es el unico momento en que hace falta:
  // con el poder apagado la pregunta es otra ("¿cuanto falta para tenerlo?") y esa la contesta el
  // largo del riel. Vive en la esquina que las barras dejaron libre, asi que no ocupa lugar nuevo.
  if (ras.on) {
    ctx.font = F_ROT; ctx.textAlign = 'right';
    const rTxt = T('bar_rasante') + ' ' + Math.ceil(ras.resta) + 's';
    const rW = Math.round(ctx.measureText(rTxt).width) + 6;
    plate(W - MARGEN - rW, RELOJ_Y, rW, 11);
    ctx.fillStyle = P.accent;
    ctx.fillText(rTxt, W - MARGEN - 3, RELOJ_Y + 7);
  }

  // municion de misiles: cada pip es el MISIL en miniatura (cuerpo blanco, ojiva gris, llama),
  // el mismo que se ve volar — no un rectangulo generico. Vacio = solo el contorno.
  // LOS MISILES, EN UN ESTANTE ANGOSTO (playtest 11/9): del alto de los cuadrados, al lado de SALUD,
  // uno arriba del otro y sin rotulo —cada pip ES un misil—. La placa de 64 que tenian estaba casi
  // vacia, y los cuatro relojes del vuelo necesitaban ese lugar.
  if (pide(run.msl < MSL_MAX)) {
    plate(xRack, CUADROS_Y, RACK_W, CUADRO);
    for (let i = 0; i < MSL_MAX; i++) {
      const on = i < run.msl, bx = xRack + 3, by = CUADROS_Y + 5 + i * 7;
      if (on) {
        px(bx + 1, by, 5, 2, '#e9edf0');                      // cuerpo blanco
        px(bx + 6, by, 1, 2, '#9aa3ab');                      // ojiva gris
        px(bx + 1, by, 5, 1, '#ffffff');                      // brillo del canto
        px(bx, by + 2, 2, 1, '#c9d0d6');                      // aleta
        px(bx - 1, by, 1, 2, P.accent);                       // llama
      } else {
        ctx.fillStyle = '#2e3c45';
        ctx.fillRect(bx, by, 7, 1); ctx.fillRect(bx, by + 1, 1, 1); ctx.fillRect(bx + 6, by + 1, 1, 1);
      }
    }
  }

  // (LA PALANCA DE GAS del borde derecho se fue al reloj de GAS, en el centro de la fila: 11/9.)
}

