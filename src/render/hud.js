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
import { P } from '../data/palette.js';
import { MSL_MAX, RADAR_ALT } from '../data/tuning.js';
import { pilotIdx } from '../core/squad.js';
import { pilotName } from '../systems/squad.js';
import { active as tempoActive, meterVal as tempoMeter } from '../systems/tempo.js';
import { meterVal as chMeter, gastada as chGastada, snapshot as chSnap } from '../systems/chancha.js';
import { attitude } from '../core/horizon.js';
import { inBank, bankLeft, fogTop } from '../systems/fog.js';

// largo del banco tal como se vio al entrar: la barra necesita un TOTAL contra el que vaciarse, y
// el sistema solo sabe cuanto FALTA (el largo se sortea por banco).
let fogSeen = 0;

// barra de mision: puerto (izq) → barcaza objetivo (der). Assets configurables como data URI;
// mientras `src` este vacio se dibuja un fallback.
const OBJ_ASSETS = {
  port: { src: '', img: new Image(), ready: false },   // icono del PUERTO (extremo izquierdo)
  barge: { src: '', img: new Image(), ready: false },   // icono del OBJETIVO / barcaza (extremo derecho)
  plane: { src: '', img: new Image(), ready: false },   // AVIÓN que avanza por la línea
};
for (const k in OBJ_ASSETS) { const a = OBJ_ASSETS[k]; a.img.onload = () => { a.ready = true; }; if (a.src) a.img.src = a.src; }

// LOS DOS EXTREMOS DE LA RUTA, cada uno sobre SU PROPIA PLACA. Antes eran dos siluetas sueltas de
// 8-9 px pintadas directo sobre el cielo: contra un amanecer naranja el buque (que va en `warn`,
// tambien naranja) desaparecia, y agrandarlo para que se viera lo unico que lograba era que
// compitiera con el blanco de verdad, que esta en el mundo unos pixeles mas abajo.
//
// Con placa se puede al reves: la silueta se achica a lo minimo que sigue siendo reconocible —un
// casco y un mastil, un muelle y una grua— y el fondo oscuro hace el trabajo de separarla. Es el
// mismo recurso que ya usa todo instrumento del HUD, asi que ademas empieza a hablar su idioma.
const RUTA_R = 5;   // medio lado de la placa: 11x11, la mitad de lo que ocupaba el icono suelto

function drawHudAsset(a, x, y, kind, hpx, sinPlaca) {
  if (a.ready && a.img.naturalWidth) {
    const h = hpx, w = Math.max(1, Math.round(h * a.img.naturalWidth / a.img.naturalHeight));
    ctx.drawImage(a.img, Math.round(x - w / 2), Math.round(y - h / 2), w, h);
    return;
  }
  if (kind === 'plane') {   // el marcador que avanza: sin placa, es el que se MUEVE por la ruta
    // el tamaño sale de `hpx` como el de los assets: la ruta se achico a una fila de 11 px y un
    // triangulo clavado en 6 de alto se comia el renglon entero
    const r2 = hpx / 2;
    ctx.fillStyle = P.ink;
    ctx.beginPath(); ctx.moveTo(x + r2, y); ctx.lineTo(x - r2, y - r2 + 0.5); ctx.lineTo(x - r2, y + r2 - 0.5); ctx.closePath(); ctx.fill();
    return;
  }
  if (!sinPlaca) plate(x - RUTA_R, y - RUTA_R, RUTA_R * 2 + 1, RUTA_R * 2 + 1);
  if (kind === 'port') {                       // MUELLE: la linea del cantil y la grua
    px(x - 3, y + 1, 6, 1, P.foam);
    px(x - 1, y - 2, 1, 3, P.dim);
    px(x - 1, y - 2, 3, 1, P.dim);
  } else {                                     // BUQUE: casco y mastil, y nada mas
    px(x - 3, y, 7, 2, P.warn);
    px(x, y - 3, 1, 3, P.warn);
  }
}

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
  const linW = conLinea ? CINTA_LINEA + 5 + 3 : 0;
  const ancho = 4 + rotW + linW + aW + (o.b ? 3 + bW : 0) + uniW + 4;
  const bx0 = Math.round(W / 2 - ancho / 2);
  const py = MARGEN, y = py + 5;                     // la fila, al medio de una placa de 11
  plate(bx0, py, ancho, 11);
  if (o.rot) {
    ctx.textAlign = 'left'; ctx.fillStyle = P.dim;   // apagado: es contexto, no un valor
    ctx.fillText(o.rot, bx0 + 4, y + 2);
  }
  let kx = bx0 + 4 + rotW;
  if (conLinea) {
    const x0 = kx, x1 = x0 + CINTA_LINEA;
    // via PUNTEADA (pendiente) que se va rellenando continua (recorrido): lee como ruta de mapa
    for (let dx3 = 0; dx3 < CINTA_LINEA; dx3 += 4) px(x0 + dx3, y, 2, 1, '#2e3c45');
    px(x0, y, Math.round(CINTA_LINEA * o.prog), 1, P.accent);
    if (o.meta === 'buque') {
      drawHudAsset(OBJ_ASSETS.port, x0, y, 'port', 7, true);
      drawHudAsset(OBJ_ASSETS.barge, x1, y, 'barge', 7, true);
    } else {
      // EL CERO y LA MARCA A BATIR. La marca es una BANDERA de meta y no una estrella: probada con
      // asterisco, a cuerpo 5 un asterisco es una cruz roja y no se lee como «hasta aca». Una
      // bandera es la misma silueta minima que el muelle y el buque del otro lado — un mastil y
      // algo colgando— asi que ademas habla el mismo idioma.
      px(x0, y - 2, 1, 5, P.dim);
      const mc = o.metaCol || P.warn;
      px(x1, y - 3, 1, 7, mc);                       // el mastil
      px(x1 + 1, y - 3, 3, 1, mc);                   // el paño
      px(x1 + 1, y - 2, 2, 1, mc);
      px(x1 + 1, y - 1, 1, 1, mc);
    }
    // el marcador que avanza (+ estelas de turbo)
    const pm = x0 + CINTA_LINEA * o.prog;
    if (o.boost) {
      ctx.strokeStyle = P.foam; ctx.globalAlpha = 0.7;
      for (let i = 1; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(pm - 2 - i * 3, y); ctx.lineTo(pm - i * 3, y); ctx.stroke(); }
      ctx.globalAlpha = 1;
    }
    drawHudAsset(OBJ_ASSETS.plane, pm, y, 'plane', 6);
    kx = x1 + 6;
  }
  ctx.textAlign = 'left'; ctx.font = F_VAL;
  ctx.fillStyle = P.accent; ctx.fillText(o.a, kx, y + 2);
  kx += aW + 3;
  if (o.b) { ctx.fillStyle = o.metaCol || P.warn; ctx.fillText(o.b, kx, y + 2); kx += bW + 2; }
  if (o.uni) { ctx.font = F_ROT; ctx.fillStyle = P.dim; ctx.fillText(o.uni, kx, y + 2); }
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
  cinta({
    rot: kind !== 'distance' ? objectiveShip : null,
    prog: Math.max(0, Math.min(1, run.dist / objectiveDist)),
    meta: 'buque',
    a: km.toFixed(1), b: '/ ' + (objectiveDist / 1000).toFixed(1),
    uni: 'KM',                                       // el simbolo es el mismo en los dos idiomas
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
    rot: km.toFixed(1) + ' KM',
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

// ESTADO DEL AVION, en un numero. Fue una SILUETA con cada parte coloreada por un dato (alas =
// canon, motor = combustible, panza = roce) y el playtest la mando a barra de porcentaje: la
// silueta ocupaba una placa de 28x26 para decir tres cosas que ya estaban dichas en barras a diez
// pixeles, y la unica suya —el margen de roce— se leia como un color, no como un dato.
//
// EL NUMERO ES EL PEOR DE LOS TRES, que es lo que significa "como viene el avion": un avion con el
// tanque lleno y el canon fundido no esta al 80%, esta fundido. Los tres siguen siendo datos que
// YA EXISTEN — esto no agrega vida ni sistemas nuevos, sigue siendo lectura de un vistazo.
//
//   alas  → calor del canon      (run.heat / run.overheat)
//   motor → combustible          (run.fuel)
//   panza → margen de roce       (run.scrapeT contra su limite) — el unico que no esta en otro lado
function estadoVal() {
  const hWing = run.overheat ? 0 : 1 - run.heat;
  const hEngine = run.fuel / 100;
  const lim = scrapeLimit(run.spd, run.boost);
  const hBelly = lim > 0 ? 1 - Math.max(0, Math.min(1, run.scrapeT / lim)) : 1;
  return Math.max(0, Math.min(1, Math.min(hWing, hEngine, hBelly)));
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
const R1 = H - 8, R2 = R1 - FILA, R3 = R2 - FILA;

/** LO MAS ALTO QUE PINTA EL TABLERO DE VUELO: el canto de las placas de la fila 3 (`bar()` dibuja
 *  su placa nueve pixeles arriba de la barra).
 *
 *  Se EXPORTA para que la banda de la voz (render/screens.js) no tenga que copiar el numero. Lo
 *  copiaba, y la copia se pudrio: decia 110 porque la escribio la epoca en que RASANTE y MOMENTUM
 *  eran la cuarta y la quinta barra de la pila de la izquierda. Desde entonces se mudaron dos
 *  veces y el toast siguio esquivando un instrumento que ya no estaba ahi. Con esto, el dia que
 *  las filas se muevan otra vez, la banda se mueve con ellas. */
export const HUD_TECHO = R3 - 9;

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
const ADI = { cx: MARGEN + 14, cy: 147, r: 10 };
const ADI_SKY = '#3c6c8e', ADI_GND = '#6b4a2a', ADI_LINE = '#f2f7fb';

function drawADI() {
  const { cx, cy, r } = ADI;
  plate(cx - 14, cy - 13, 28, 26);
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

// TABLERO DEL ESCUADRON: un avioncito por vida — los caidos quedan TACHADOS, no desaparecen.
// Que el pip siga ahi, oscuro y cruzado, es lo que hace que una vida menos sea un companero
// menos y no un numero menos. Al lado, el indicativo del piloto al mando (PATRIA n).
// Lo comparte el HUD de vuelo y la sobreimpresion del relevo (render/squad.js).
export const SQUAD_H = 17;   // alto de la placa: dos renglones (ver abajo)

export function drawSquadPips(x, y) {
  const fallen = pilotIdx(run.squad, run.lives);
  const nombre = pilotName(fallen);
  // DOS RENGLONES y no uno: el rotulo arriba y la formacion abajo. En una sola linea el nombre del
  // piloto quedaba pegado al ultimo pip y se leia como un pip mas con letras. Ademas esto le da al
  // bloque el ancho de una placa de instrumento y no el de una tira, que es lo que pasa a ser
  // desde que vive en la esquina de arriba a la izquierda (playtest 29/8).
  ctx.textAlign = 'left';
  ctx.font = F_ROT;
  const wRot = ctx.measureText(T('hud_squad')).width;
  ctx.font = F_VAL;
  const wFila = run.squad * 8 + 2 + ctx.measureText(nombre).width;
  plate(x, y, Math.round(Math.max(wRot, wFila)) + 8, SQUAD_H);
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

export function drawHUD(h) {
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
  if (pide(run.fuel < 60))
    bar(6, R1, 60, run.fuel / 100, run.fuel < 25 ? (Math.sin(run.t * 10) > 0 ? P.warn : P.dim) : P.foam, T('bar_fuel'));
  // INTEGRIDAD DEL AVION: solo cuando el modelo de vida la usa (en ESCUADRON no existe — la
  // barra de vida es el escuadron y una barra siempre llena seria una mentira ocupando lugar).
  if (dmgShown() && pide(run.integ < 100)) {
    const iv = run.integ / 100;
    bar(ADI.cx + 14 + AIRE + 2, R2, 44, iv, iv <= 0.25 ? (Math.sin(run.t * 10) > 0 ? '#ff5340' : P.warn) : iv <= 0.5 ? P.warn : P.foam, T('dmg_bar'));
  }

  // ---- COLUMNA DERECHA: EL ARMA, apilada -------------------------------------------------------
  // ESTADO arriba (como viene el avion), CAÑON en el medio y MISILES abajo, DEBAJO del canon y no
  // al lado de la nafta: los misiles son armamento, no consumo de vuelo, y tenerlos en la esquina
  // opuesta a su barra obligaba a cruzar la pantalla para leer "con que puedo tirar".
  const ev = estadoVal();
  // el umbral de ESTADO no esta en 1 sino en 0,97, y es el mismo motivo que el 0,05 del cañon: el
  // margen de roce sube y baja solo mientras se vuela rasante, y en 1 el instrumento parpadearia
  // con cada ola. Tres puntos de zona muerta alcanzan para que aparezca cuando algo paso de verdad.
  if (pide(ev < 0.97)) {
    bar(254, R3, 60, ev, ev <= 0.25 ? (Math.sin(run.t * 10) > 0 ? P.warn : '#7d2f1e') : ev <= 0.5 ? P.accent : P.foam, T('hud_status'));
    // …y su NUMERO, al final del rotulo. Una barra dice "poco"; el porcentaje dice cuanto, que es
    // lo que hace falta para decidir si volves o seguis.
    ctx.textAlign = 'right'; ctx.font = F_ROT;
    ctx.fillStyle = ev <= 0.25 ? P.warn : P.dim;
    ctx.fillText(Math.round(ev * 100) + '%', 314, R3 - 4);
  }
  if (pide(run.heat > 0.05 || run.overheat))
    bar(254, R2, 60, run.heat, run.overheat ? P.warn : P.accent, run.overheat ? T('bar_overheat') : T('bar_cannon'));

  // ---- LOS BORDES: LOS PODERES DE RACHA ---------------------------------------------------------
  // RASANTE y MOMENTUM dejan de ser barras con rotulo y pasan a ser dos RIELES en los bordes
  // laterales: izquierda rasante, derecha momentum, siempre. Los dos se GANAN volando —no se
  // gastan como la nafta— asi que nunca fueron del bloque del avion; y ninguno de los dos se lee
  // de verdad: se vigilan de reojo mientras se mira el centro, que es un trabajo distinto y que un
  // rotulo de 5 px no hace. En el borde el recorrido pasa de 44 px a 180 (ver `riel`).
  //
  // ACTIVO MUESTRA LO QUE QUEDA, igual que cuando eran barras: mientras dura, el unico dato es
  // cuanto falta para que se apague. Vacio vuelve a ser "cuanto falta para tenerlo".
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

  // LA CHANCHA (tecla 5): la barra del hermano caro, JUSTO ENCIMA del MOMENTUM. Mismo lenguaje
  // visual y otro color a proposito — son dos poderes de la misma familia y hay que poder
  // distinguirlos de un vistazo sin leer el rotulo.
  //
  // Con COMBUSTIBLE: NO el poder no existe, y entonces la barra tampoco: una barra que nunca se
  // va a poder usar es ruido ocupando el unico lugar libre del HUD.
  const chSnapshot = chSnap();
  if (cfg.fuelOn && pide(chMeter() >= 1 || chGastada() || !!chSnapshot)) {
    const cv2 = chMeter();
    const ch = chSnapshot;
    bar(ADI.cx + 14 + AIRE + 2, R3, 44, chGastada() ? 0 : cv2,
      chGastada() ? P.dim : cv2 >= 1 ? (Math.sin(run.t * 7) > 0 ? P.foam : P.crest) : P.crest, T('bar_chancha'));
    // EL ESTADO DE LA CITA, en el mismo renglon: la cuenta regresiva mientras viene, y el reloj
    // de la ventana cuando esta arriba (parpadea enganchado). Sin esto, la ventana se vence sin
    // que el jugador sepa nunca que habia una.
    if (ch) {
      ctx.textAlign = 'left'; ctx.font = F_ROT;
      ctx.fillStyle = ch.conn ? P.accent : ch.fase === 'cita' && ch.win < 8 ? P.warn : P.foam;
      ctx.fillText(ch.fase === 'eta' ? T('ch_eta', { s: Math.ceil(ch.eta) })
        : ch.conn ? '>>> ' + Math.round(run.fuel) + '%'
          : Math.ceil(Math.max(0, ch.win)) + 's', 86, R3 + 3);
    }
  }

  // municion de misiles: cada pip es el MISIL en miniatura (cuerpo blanco, ojiva gris, llama),
  // el mismo que se ve volar — no un rectangulo generico. Vacio = solo el contorno.
  // MISIL usa la MISMA convencion que bar(): placa en y-9, rotulo en y-4 y el contenido en y. Es
  // lo que lo deja caer exactamente en la fila R1, alineado con el combustible del otro lado.
  if (pide(run.msl < MSL_MAX)) {
    plate(252, R1 - 9, 64, INSTR);
    ctx.textAlign = 'left'; ctx.font = F_ROT; ctx.fillStyle = P.dim;
    ctx.fillText('MISIL', 254, R1 - 4);
    for (let i = 0; i < MSL_MAX; i++) {
      const on = i < run.msl, bx = 254 + i * 9, by = R1;
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

