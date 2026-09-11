// HUD: la capa de instrumentos y avisos sobre el vuelo, mas la cuenta regresiva del despegue.
//
// Escuadron, ruta del objetivo (con su kilometraje adentro), velocidad, altura, radar, viento,
// multiplicador, combustible, calor del canon, misiles, la palanca de gas y los dos rieles de
// racha. Va SIN el zoom de camara (el orquestador lo restaura antes de llamar aca).
//
// Lee el estado de vuelo de los stores (run, plane). Lo que es de MISION/menu (best, gameMode,
// objectiveDist, objectiveShip, goalKind) vive en game.js y entra por parametro, igual que las
// otras pantallas (render/screens.js, render/menus.js).

import { ctx, px, DW as W, DH as H, PZ, U } from './ctx.js';
import { plane, cfg } from '../core/state.js';
import { run } from '../core/run.js';
import { shown as dmgShown } from '../systems/damage.js';
import { proj } from '../core/fx.js';
import { scrapeLimit } from '../core/physics.js';
import { T } from '../core/i18n.js';
import { P, RADAR_VERDE, RADAR_OPACO } from '../data/palette.js';
import { MSL_MAX, RADAR_ALT, EST_MAX, VOZ_COLS } from '../data/tuning.js';
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

// EL MARGEN DE ROCE — la parte TEMPORAL de la SALUD (ver drawVida).
//
// Tocar el agua no mata al instante: hay un reloj de gracia (`scrapeLimit`: 0,85 s lento, 0,18 s a
// fondo, y con turbo poco mas de la mitad). Rozando se llena; afuera se vacia despacio, a un tercio
// de la velocidad — rozar dos veces seguidas es peor que una. Esto devuelve lo que QUEDA de ese
// reloj: 1 entero, 0 te estrellas.
//
// Era una de las tres partes de ESTADO (el peor de cañon, nafta y roce), el unico de los tres que no
// estaba en otro instrumento. ESTADO se fue (playtest 10/9): el cañon y la nafta tienen sus barras,
// y el roce paso a ser la barra temporal de SALUD.
function margenRoce() {
  const lim = scrapeLimit(run.spd, run.boost);
  return lim > 0 ? 1 - Math.max(0, Math.min(1, run.scrapeT / lim)) : 1;
}

/** LA SALUD DEL AVION: DOS BARRAS en un instrumento (playtest 10/9, idea de Matias).
 *
 *  Hay dos relojes que te bajan, y uno vuelve y el otro no:
 *    TOTAL     los GOLPES (la integridad). No se recupera. Sus muescas en 25/50/75 son los ESCALONES
 *              de averia (core/damage.js): bajo la del medio te quedas sin turbo, bajo la primera
 *              sin piruetas. El % es de esta, que es "cuanto le queda a mi avion".
 *    TEMPORAL  el ROCE (`margenRoce`). Se vacia rozando y se RECUPERA sola al salir.
 *
 *  Reemplaza a ESTADO y a AVION, que decian casi lo mismo desde dos lados: ESTADO mezclaba cañon,
 *  nafta y roce en un solo numero y no se sabia cual de los tres era; AVION contaba golpes en otro
 *  rincon. La nafta y el cañon NO entran: tienen sus barras, y la nafta dejaba la vida naranja el
 *  resto de la mision.
 *
 *  EN ESCUADRON NO HAY TOTAL: un golpe te baja (la vida es el escuadron, arriba a la izquierda). Ahi
 *  SALUD lleva solo la temporal, en el renglon grueso — un total siempre lleno seria una mentira. */
function drawVida(x0, y, w0) {
  const x = x0, w = w0;   // la cruz va en el renglon del rotulo: no le quita ancho a las barras
  const total = dmgShown() ? Math.max(0, Math.min(1, run.integ / 100)) : null;
  const temp = margenRoce();
  plate(x - 2, y - 9, w + 4, INSTR);
  // LA CRUZ en vez de la palabra: es salud, y una cruz lo dice en cualquier idioma y en menos lugar.
  // BLANCA Y NO ROJA: la cruz roja sobre fondo claro es un emblema protegido (Convenios de Ginebra)
  // y a mas de un juego le pidieron sacarla. Una cruz clara dice «salud» igual.
  icono(x, y - 9, 7, 'vida', P.foam);
  const rozando = run.scrapeVib > 0.6;
  if (total !== null) {
    const col = total <= 0.25 ? (Math.sin(run.t * 10) > 0 ? '#ff5340' : P.warn) : total <= 0.5 ? P.warn : P.foam;
    px(x, y - 2, w, 3, '#2e3c45');
    const fw = Math.round(w * total);
    if (fw > 0) px(x, y - 2, fw, 3, col);
    if (fw > 1) { ctx.globalAlpha = 0.4; px(x, y - 2, fw, 1, '#f2f7fb'); ctx.globalAlpha = 1; }   // bisel
    ctx.fillStyle = '#0a0e11';                                  // las muescas: los escalones
    for (let i = 1; i < 4; i++) ctx.fillRect(x + Math.round(w * i / 4), y - 2, 1, 3);
    ctx.textAlign = 'right'; ctx.fillStyle = total <= 0.25 ? P.warn : P.dim;
    ctx.fillText(Math.round(total * 100) + '%', x + w, y - 4);
  }
  // la temporal: calma (cresta) llena, ambar gastandose, roja y parpadeando cuando queda poco o
  // mientras se esta rozando — ahi es cuando el jugador tiene que mirarla
  const ty = total !== null ? y + 2 : y - 2, th = total !== null ? 2 : 3;
  const tcol = temp < 0.35 || rozando ? (Math.sin(run.t * 16) > 0 ? P.warn : '#7d2f1e') : temp < 1 ? P.accent : P.crest;
  px(x, ty, w, th, '#2e3c45');
  const tw = Math.round(w * Math.max(0, Math.min(1, temp)));
  if (tw > 0) px(x, ty, tw, th, tcol);
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
// otro va AIRE. Los 17 resultantes son el UNICO paso con que se apila cualquier cosa del HUD.
//
// Estuvo en 14 —o sea sin aire— porque 14 era justo lo que teselaba, y teselar era exactamente el
// problema: las placas se TOCABAN y cada columna se leia como un bloque oscuro partido en franjas
// en vez de como tres instrumentos separados (playtest 29/8, «estado y cañón están muy cerca»).
// Tres pixeles alcanzan: a esta escala un pixel es un pixel, y la placa ya trae su propio borde.
const AIRE = 3, INSTR = 14, FILA = INSTR + AIRE;
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
// index.html), debajo va el reloj del rasante cuando esta encendido, y despues el gas.
//
// El gas arrancaba en 64 porque tenia dos barras encima. Ya no las tiene —se fueron a los bordes—
// asi que sube y la corredera pasa de 54 px de recorrido a 76. Es el unico instrumento del HUD que
// se OPERA en vez de leerse, y una palanca con mas recorrido se apunta mejor.
const RELOJ_Y = 15;                  // la placa del reloj del rasante: 15..25
const GAS_TOP = 42, GAS_BOT = 118;   // la corredera del gas

// LAS TRES FILAS del tablero de abajo, medidas desde el borde y con el mismo paso en las dos
// columnas: lo que hace que el HUD se lea como un tablero y no como cosas puestas donde entraban.
const R1 = H - 8, R2 = R1 - FILA;
// LOS CUATRO CUADRADOS DE ABAJO (playtest 10/9): horizonte, piloto, nafta y chancha, todos del
// MISMO lado y apoyados en el margen de abajo, como una fila de instrumentos de tablero de verdad.
// A la derecha, el quinto: el cañon. La barra de COMB y los puntitos de la chancha se fueron adentro
// de sus relojes — un instrumento por cosa, y todos con la misma forma.
const CUADRO = 26, CUADROS_Y = H - MARGEN - CUADRO;

/** LO MAS ALTO QUE PINTA EL TABLERO DE VUELO: el canto de las placas de la fila 3 (`bar()` dibuja
 *  su placa nueve pixeles arriba de la barra).
 *
 *  Se EXPORTA para que la banda de la voz (render/screens.js) no tenga que copiar el numero. Lo
 *  copiaba, y la copia se pudrio: decia 110 porque la escribio la epoca en que RASANTE y MOMENTUM
 *  eran la cuarta y la quinta barra de la pila de la izquierda. Desde entonces se mudaron dos
 *  veces y el toast siguio esquivando un instrumento que ya no estaba ahi. Con esto, el dia que
 *  las filas se muevan otra vez, la banda se mueve con ellas. */
export const HUD_TECHO = Math.min(CUADROS_Y, R2 - 9);

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
// Va abajo a la IZQUIERDA, en espejo del panel de estado: las dos esquinas de abajo quedan siendo
// instrumentos y el centro de la pantalla, que es donde se juega, sigue limpio.
// …y CUADRADO CON EL RESTO: su placa (28x26 centrada en cx,cy) apoya a la izquierda en MARGEN y
// deja AIRE contra la barra de combustible, que es la fila R1. No es simetria por simetria — un
// tablero donde cada instrumento arranca en una columna distinta se lee como cosas apiladas.
const ADI = { cx: MARGEN + 13, cy: CUADROS_Y + 13, r: 10 };
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

/** `o` = { val 0..1, col, ico, icoCol, zona: [desde, hasta] en rojo, fin: icono al final de la
 *  escala (o null), txt: el numero al pie, txtCol } */
function reloj(x, y, o) {
  plate(x, y, CUADRO, CUADRO);
  const cx = x + 13, cy = y + 16, r = 10;
  const ang = f => Math.PI + Math.PI * Math.max(0, Math.min(1, f));
  // LA ESCALA: trece marcas. Las de la zona van en rojo — el peligro es parte del dial, no un aviso
  for (let i = 0; i <= 12; i++) {
    const f = i / 12, a = ang(f);
    const enZona = o.zona && f >= o.zona[0] && f <= o.zona[1];
    px(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 1, 1, enZona ? P.warn : '#55676f');
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
let golpeT = 0, ultInteg = 100;
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
  if (golpeT > 0 || run.scrapeVib > 0.6 || run.detection > 0.3 || margenRoce() < 0.5
      || (cfg.fuelOn && run.fuel < 25)) return 'preocupado';
  if (sonrisaT > 0) return 'sonrisa';
  if (run.boost || run.overheat || run.heat > 0.5 || run.rasLevel > 0) return 'ceno';
  return 'neutro';
}

/** Dibuja la cara y devuelve el x donde sigue el tablero (sin cara: el mismo x, no queda hueco). */
function drawPiloto() {
  const x = ADI.cx + 14 + AIRE, y = ADI.cy - 13;
  const nombre = pilotName(pilotIdx(run.squad, run.lives));
  const base = CARA_PILOTO[sinTilde(nombre)];
  if (!base) return x;
  // el reloj del cuadro sale de `run.t`: el HUD no recibe dt, y una corrida nueva (run.t que
  // vuelve para atras) arranca la cara de cero en vez de heredar la sonrisa de la anterior
  const nueva = ultT < 0 || run.t < ultT;
  const dt = nueva ? 0 : Math.min(0.1, run.t - ultT);
  if (nueva) { gesto = 'neutro'; gestoT = 0; sonrisaT = 0; ultPts = run.score; golpeT = 0; ultInteg = run.integ; }
  // un golpe es la chapa que BAJA; que suba (avion nuevo del relevo, o una sonda) no es golpe
  if (run.integ < ultInteg) golpeT = GOLPE_T;
  ultInteg = run.integ;
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


// TABLERO DEL ESCUADRON: un avioncito por vida — los caidos quedan TACHADOS, no desaparecen.
// Que el pip siga ahi, oscuro y cruzado, es lo que hace que una vida menos sea un companero
// menos y no un numero menos. Al lado, el indicativo del piloto al mando (PATRIA n).
// Lo comparte el HUD de vuelo y la sobreimpresion del relevo (render/squad.js).
export const SQUAD_H = 17;   // alto de la placa: dos renglones (ver abajo)

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
  ctx.font = F_ROT;
  const wRot = ctx.measureText(T('hud_squad')).width;
  ctx.font = F_VAL;
  const wFila = Math.max(2, run.squad) * 8 + 2 + ctx.measureText(nombre).width;
  return Math.max(ALERTA_MIN_W, Math.round(Math.max(wRot, wFila)) + 8);
}

export function drawSquadPips(x, y) {
  const fallen = pilotIdx(run.squad, run.lives);
  const nombre = pilotName(fallen);
  // DOS RENGLONES y no uno: el rotulo arriba y la formacion abajo. En una sola linea el nombre del
  // piloto quedaba pegado al ultimo pip y se leia como un pip mas con letras. Ademas esto le da al
  // bloque el ancho de una placa de instrumento y no el de una tira, que es lo que pasa a ser
  // desde que vive en la esquina de arriba a la izquierda (playtest 29/8).
  ctx.textAlign = 'left';
  plate(x, y, anchoSquad(), SQUAD_H);
  ctx.fillStyle = P.dim; ctx.font = F_ROT;
  ctx.fillText(T('hud_squad'), x + 4, y + 7);
  for (let i = 0; i < run.squad; i++) {
    const bx = x + 4 + i * 8, by = y + 10;
    const down = i < fallen;
    const c = down ? '#3a4750' : i === fallen ? P.accent : P.foam;   // el actual, en acento
    px(bx, by + 1, 7, 1, c);                                         // alas
    px(bx + 3, by, 1, 3, c);                                         // fuselaje
    if (down) { px(bx + 1, by, 1, 1, P.warn); px(bx + 3, by + 1, 1, 1, P.warn); px(bx + 5, by + 2, 1, 1, P.warn); }
  }
  // EL NOMBRE DEL QUE VUELA, EN ACENTO. Estaba en `dim` —el gris de los rotulos— y ahi el piloto
  // era una etiqueta mas. Es la unica persona que hay en el HUD: va del color del que manda.
  ctx.fillStyle = P.accent; ctx.font = F_VAL;
  ctx.fillText(nombre, x + 6 + run.squad * 8, y + 15);
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
 *    · las que no tenes estan APAGADAS pero a la vista: se ve cuantas pueden venir todavia;
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

function vigilaAlerta(n) {
  if (run.t < alertaT) alertaT = -9;                    // corrida nueva: el reloj del vuelo volvio a 0
  if (n > alertaN) { alertaDe = alertaN; alertaT = run.t; }
  alertaN = n;
}

export function drawAlerta(x, y, w, n, prog) {
  plate(x, y, w, ALERTA_H);
  // EL RELOJ EN CERO ES QUE TE VEN: el escondite solo corre bajo el techo, y asomarse mas que la
  // gracia lo vuelve a cero. Es el mismo dato que ya llegaba; no hizo falta pedirle otro al sistema.
  // DURANTE LA GRACIA (hasta EST_GRACIA_S asomado) el panel sigue diciendo "te buscan" aunque el
  // aviso de radar ya este cargando, y es a proposito: un bob no te delata, y el panel cuenta el
  // mismo reloj que decide eso. Lo que te esta viendo AHORA lo dice la barra del radar, abajo.
  const visto = !(prog > 0);
  radarAlerta(x + 3, y + 3, visto, n > 0);
  // las cuatro, repartidas en lo que deja el radar y centradas ahi: la placa mide lo que mide el
  // escuadron, que depende del nombre del piloto, asi que el paso se acomoda y no la placa
  const x0 = x + 15, libre = x + w - 3 - x0;
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
    const bw = w - 2, by = y + ALERTA_H - 2;
    px(x + 1, by, bw, 1, BAL_APAGADA);
    // CUANDO QUEDA POCO, PARPADEA (el `titila` de arriba, el mismo de las balizas): el ultimo cuarto
    // es cuando aguantar un poco mas paga, y un parpadeo se ve de reojo, sin mirar la esquina.
    // Parpadea apagandose, no cambiando de rojo: lo que titila es lo que le queda a la alarma.
    if (!titila) px(x + 1, by, Math.max(1, Math.round(bw * resta)), 1, P.warn);
  }
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
  // …Y JUSTO DEBAJO, EL NIVEL DE ALERTA. A NIVEL CERO TAMBIEN, por pedido del autor (11/9): las
  // cuatro apagadas y el radar girando en verde opaco. Que el instrumento este ahi antes de que
  // pase nada es lo que le enseña al jugador que existe —y que se puede encender—; aparecer recien
  // con la primera baliza era enterarse del sistema en el mismo instante en que ya te castiga.
  // PERO SOLO DONDE PUEDE SUBIR (`h.busqueda`, ver game.js). En una mision sin el sistema seria un
  // tablero de nada, y el HUD de este juego no muestra instrumentos que nunca van a contar algo
  // (misma regla que la Chancha sin combustible).
  vigilaAlerta(h.estrellas | 0);
  if (h.estrellas > 0 || h.busqueda) { drawAlerta(MARGEN, ty, anchoSquad(), h.estrellas | 0, h.escondite); ty += ALERTA_H + AIRE; }
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
  // PRIORIDAD: el roce gana. Estar rozando es muerte en segundos; el radar es una amenaza que
  // tarda. Con los dos activos se muestra el urgente.
  const scraping = run.scrapeVib > 0.6;
  const painted = run.detection > 0.3;
  // Apilado de la esquina inferior, de abajo hacia arriba: velocidad+altura (H-4), barra del
  // radar (H-19..H-15) y el aviso (H-21). Los 7 px de la linea de velocidad suben hasta H-11,
  // asi que la barra tiene que terminar arriba de eso — con warnY = H-13 la barra caia justo
  // encima del "KM/H".
  const warnY = H - 21;
  if (scraping || painted) {
    ctx.textAlign = 'center'; ctx.font = 'bold 8px monospace';
    // parpadeo mas rapido para el roce: la urgencia se lee en el ritmo, no solo en el texto
    ctx.fillStyle = Math.sin(run.t * (scraping ? 30 : 14)) > 0 ? P.warn : '#7d2f1e';
    ctx.fillText(scraping ? T('scrape') : T('radar'), W / 2, warnY);
  }
  // BARRA de carga del radar, bajo el aviso. Sin numero de oleada: el dato que importa es cuanto
  // falta para la proxima tanda, y eso ya lo dice la barra llenandose.
  if (painted && !scraping) {
    plate(W / 2 - 22, warnY + 2, 44, 4);
    px(W / 2 - 20, warnY + 3, Math.round(40 * run.detection), 2, P.warn);
    // marca del residual: donde rearranca la barra tras la proxima oleada (cada vez mas llena),
    // asi se ve que el ciclo se acorta sin poner un contador
    if (run.radarWave > 0) px(W / 2 - 20 + Math.round(40 * Math.min(0.55, 0.35 + run.radarWave * 0.03)), warnY + 2, 1, 4, P.accent);
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

  // VELOCIDAD y ALTURA, uno al lado del otro abajo al centro. Van juntos a proposito: son los dos
  // numeros que deciden todo el vuelo (rapido = menos margen; alto = te ve el radar), y tenerlos
  // en la misma linea evita barrer la pantalla para cruzarlos.
  //
  // Se dibujan por separado porque cada uno tiene SU color: la velocidad avisa de turbo/racha/
  // viento, y la altura avisa del RADAR. Para que el conjunto quede centrado sin importar cuantos
  // digitos tenga cada uno, se miden los dos anchos y se reparte a mano.
  ctx.font = '7px monospace'; ctx.textAlign = 'left';
  const sTxt = Math.round(run.spd * 4.2) + T('kmh')
    + (run.afterTier > 0 ? ' »' + run.afterTier : run.boost ? T('turboTag') : run.windF < 0.97 ? ' ▼' : '');
  // DENTRO DEL RADAR: la altura se pone ROJA y parpadea. Es el mismo dato que la barra de arriba
  // y que la RED, pero en el lugar donde el jugador ya esta mirando el numero que lo causa.
  // la altura se pone ROJA por CUALQUIERA de los dos peligros de altura: te ven arriba, o te
  // estas comiendo el agua abajo. Es el mismo numero el que te metio en las dos.
  // EL TECHO ES EL DE LA FASE, no la constante: con EL FILO puesto el numero tiene que ponerse
  // rojo a 6 y no a 20. Llega en `h` por la misma razon que a la malla — render no ve los sistemas.
  const seen = plane.y > (h.radarAlt === undefined ? RADAR_ALT : h.radarAlt) || scraping;
  const aTxt = Math.round(plane.y) + T('alt');
  const gap = 6;
  const wS = ctx.measureText(sTxt).width, wA = ctx.measureText(aTxt).width;
  let cx3 = W / 2 - (wS + gap + wA) / 2;
  ctx.fillStyle = run.afterTier > 0 ? P.warn : run.boost || run.rasLevel > 0 ? P.accent : run.windF < 0.97 ? P.crest : P.dim;
  ctx.fillText(sTxt, cx3, H - 4);
  cx3 += wS + gap;
  ctx.fillStyle = seen ? (Math.sin(run.t * (scraping ? 30 : 14)) > 0 ? P.warn : '#7d2f1e')   // peligro: parpadea
    : plane.y <= 4.5 ? P.accent : P.dim;                                   // a ras: acento (zona x10)
  ctx.fillText(aTxt, cx3, H - 4);
  // marca de que la altura esta EN ZONA DE RADAR: un subrayado rojo bajo el numero, para que se
  // distinga del acento naranja del rasante aunque el parpadeo este en su fase apagada
  if (seen) px(cx3, H - 2, wA, 1, P.warn);
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

  // horizonte artificial, en la esquina de abajo a la izquierda
  drawADI();

  // LAS TRES FILAS del tablero de abajo (ver R1/R2/R3 arriba, junto al techo que salen de ellas).

  // ---- COLUMNA IZQUIERDA: EL AVION (lo que se gasta volando) -----------------------------------
  // LA CARA DEL PILOTO al lado del horizonte, y al lado de la cara la CHANCHA en puntitos (ver
  // drawPiloto / drawPuntos). Los golpes del avion estan en la barra TOTAL de SALUD.
  drawPiloto();
  // NAFTA y CHANCHA, los dos relojes de la fila. La chancha solo con COMBUSTIBLE: SI — un reloj que
  // nunca se va a poder usar es ruido ocupando un cuadrado.
  const xNafta = ADI.cx + 13 + (CUADRO + AIRE), xCha = xNafta + CUADRO + AIRE;
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

  // ---- COLUMNA DERECHA: EL ARMA, apilada -------------------------------------------------------
  // SALUD arriba (como viene el avion), CAÑON en el medio y MISILES abajo, DEBAJO del canon y no
  // al lado de la nafta: los misiles son armamento, no consumo de vuelo, y tenerlos en la esquina
  // opuesta a su barra obligaba a cruzar la pantalla para leer "con que puedo tirar".
  // SALUD (ver drawVida): la total si no esta entera, o la temporal si bajo. El umbral de la temporal
  // es 0,97 y no 1 por el mismo motivo que el 0,05 del cañon: sube y baja sola volando rasante.
  if (pide((dmgShown() && run.integ < 100) || margenRoce() < 0.97)) drawVida(225, R2, 60);
  if (pide(run.heat > 0.05 || run.overheat))
    // EL CAÑON, en la esquina de la derecha: el espejo del horizonte. No tiene municion que contar
    // —dispara hasta recalentarse y se traba hasta enfriar—, asi que el reloj marca TEMPERATURA, con
    // la zona roja donde se traba.
    reloj(W - MARGEN - CUADRO, CUADROS_Y, {
      val: run.heat, ico: 'canon', zona: [0.75, 1],
      col: run.overheat ? (Math.sin(run.t * 12) > 0 ? P.warn : '#7d2f1e') : run.heat > 0.75 ? P.warn : P.accent,
      txt: Math.round(run.heat * 100) + '%', txtCol: run.overheat ? P.warn : P.dim });

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
  // MISIL usa la MISMA convencion que bar(): placa en y-9, rotulo en y-4 y el contenido en y. Es
  // lo que lo deja caer exactamente en la fila R1, alineado con el combustible del otro lado.
  if (pide(run.msl < MSL_MAX)) {
    plate(223, R1 - 9, 64, INSTR);
    ctx.textAlign = 'left'; ctx.font = F_ROT; ctx.fillStyle = P.dim;
    ctx.fillText('MISIL', 225, R1 - 4);
    for (let i = 0; i < MSL_MAX; i++) {
      const on = i < run.msl, bx = 225 + i * 9, by = R1;
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

  // palanca de gas (throttle) — vertical, borde derecho
  const gx = W - MARGEN - 7, tyTop = GAS_TOP, tyBot = GAS_BOT, tH = tyBot - tyTop;
  plate(gx - 3, tyTop - 3, 10, tH + 6);
  ctx.fillStyle = P.dim;                                     // marcas de la corredera
  for (let i = 0; i <= 4; i++) ctx.fillRect(gx - 2, Math.round(tyBot - tH * (i / 4)), 2, 1);
  const fillH = Math.round(tH * Math.max(0, Math.min(1, run.throttle)));
  const tcol = run.fuel <= 0 ? (Math.sin(run.t * 10) > 0 ? P.warn : P.dim)
    : run.throttle > 0.66 ? P.foam : run.throttle > 0.15 ? P.accent : P.bodyDark;
  px(gx, tyBot - fillH, 4, fillH, tcol);                     // relleno desde abajo
  if (fillH > 1) { ctx.globalAlpha = 0.35; px(gx, tyBot - fillH, 1, fillH, '#f2f7fb'); ctx.globalAlpha = 1; }
  px(gx - 2, tyBot - fillH - 1, 8, 2, P.ink);                // perilla de la palanca
  px(gx - 2, tyBot - fillH - 1, 8, 1, '#f2f7fb');            // canto superior de la perilla
  // EL ROTULO DEL GAS, sobre placa (vive contra el cielo) y CON EL BORDE DERECHO DE LA PALANCA. La
  // placa del rotulo es mas ancha que la corredera —la palabra mide mas que 10 px— asi que si no
  // comparten un borde se leen como dos cosas puestas ahi cerca. Compartiendo el derecho, que es el
  // mismo de ESTADO / CAÑON / MISIL, la columna entera queda a plomo.
  ctx.font = F_ROT; ctx.textAlign = 'right';
  const thrTxt = run.fuel <= 0 ? T('thr_dead') : T('thr');
  const thrW = Math.round(ctx.measureText(thrTxt).width) + 6;
  plate(W - MARGEN - thrW, tyTop - 11, thrW, 9);
  ctx.fillStyle = run.fuel <= 0 ? P.warn : P.dim;
  ctx.fillText(thrTxt, W - MARGEN - 3, tyTop - 4);
}

