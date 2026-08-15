// HUD: la capa de instrumentos y avisos sobre el vuelo, mas la cuenta regresiva del despegue.
//
// Puntaje, best, progreso de campaña, barra de objetivo, velocidad, radar, viento, multiplicador,
// combustible, calor del canon, misiles y la palanca de gas. Va SIN el zoom de camara (el
// orquestador lo restaura antes de llamar aca).
//
// Lee el estado de vuelo de los stores (run, plane). Lo que es de MISION/menu (best, gameMode,
// curLevel, objectiveDist, objectiveShip) vive en game.js y entra por parametro, igual que las
// otras pantallas (render/screens.js, render/menus.js).

import { ctx, px, DW as W, DH as H, PZ, U } from './ctx.js';
import { plane } from '../core/state.js';
import { run } from '../core/run.js';
import { shown as dmgShown } from '../systems/damage.js';
import { proj } from '../core/fx.js';
import { scrapeLimit } from '../core/physics.js';
import { T } from '../core/i18n.js';
import { P } from '../data/palette.js';
import { MISSIONS } from '../data/missions.js';
import { MSL_MAX, RADAR_ALT } from '../data/tuning.js';
import { pilotIdx } from '../core/squad.js';
import { pilotName } from '../systems/squad.js';
import { active as tempoActive, meterVal as tempoMeter } from '../systems/tempo.js';
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

function drawHudAsset(a, x, y, kind, hpx) {
  if (a.ready && a.img.naturalWidth) {
    const h = hpx, w = Math.max(1, Math.round(h * a.img.naturalWidth / a.img.naturalHeight));
    ctx.drawImage(a.img, Math.round(x - w / 2), Math.round(y - h / 2), w, h);
    return;
  }
  if (kind === 'port') { px(x - 2, y - 3, 4, 6, P.foam); px(x - 1, y - 5, 2, 2, P.dim); }
  else if (kind === 'barge') { px(x - 3, y - 2, 7, 4, P.warn); px(x - 1, y - 4, 2, 2, P.warn); }
  else { ctx.fillStyle = P.ink; ctx.beginPath(); ctx.moveTo(x + 3, y); ctx.lineTo(x - 3, y - 2.5); ctx.lineTo(x - 3, y + 2.5); ctx.closePath(); ctx.fill(); }
}

export function drawObjectiveBar(objectiveDist, objectiveShip) {
  const cx = W / 2, half = Math.round(W * 0.15);          // 30% del ancho (máx), centrada
  const x0 = cx - half, x1 = cx + half, y = 26;
  const prog = Math.max(0, Math.min(1, run.dist / objectiveDist));
  // nombre de la barcaza objetivo, centrado arriba
  ctx.font = '6px monospace'; ctx.textAlign = 'center'; ctx.fillStyle = P.warn;
  ctx.fillText(objectiveShip, cx, y - 7);
  // via PUNTEADA (pendiente) que se va rellenando continua (recorrido): lee como ruta de mapa
  for (let dx3 = 0; dx3 < x1 - x0; dx3 += 4) px(x0 + dx3, y, 2, 1, '#2e3c45');
  px(x0, y, Math.round((x1 - x0) * prog), 1, P.accent);
  // extremos: puerto (izq) y barcaza (der) — assets configurables o fallback
  drawHudAsset(OBJ_ASSETS.port, x0, y, 'port', 8);
  drawHudAsset(OBJ_ASSETS.barge, x1, y, 'barge', 9);
  // marcador del avión avanzando por la línea (+ líneas de boost)
  const pm = x0 + (x1 - x0) * prog;
  if (run.boost) {
    ctx.strokeStyle = P.foam; ctx.globalAlpha = 0.7;
    for (let i = 1; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(pm - 2 - i * 3, y); ctx.lineTo(pm - i * 3, y); ctx.stroke(); }
    ctx.globalAlpha = 1;
  }
  drawHudAsset(OBJ_ASSETS.plane, pm, y, 'plane', 7);
}

// colores de la bandera argentina, para el conteo del despegue
const CELESTE = '#75aadb', BLANCO = '#f2f7fb';

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

// PANEL DE ESTADO (v1 del panel de daños — roadmap #22): silueta del avion DE ESPALDAS (la misma
// vista que el sprite en vuelo, asi no hay que traducir mentalmente que parte es cual) con cada
// parte coloreada por un dato que YA EXISTE. No agrega vida ni sistemas nuevos: es lectura de un
// vistazo de como viene el avion.
//   alas  → calor del canon      (run.heat / run.overheat)
//   motor → combustible          (run.fuel)
//   panza → margen de roce       (run.scrapeT contra su limite)
// El margen de roce es el UNICO de los tres que hoy no se ve en ningun lado: al salir del roce
// `scrapeT` se descuenta lento (SCRAPE_RECOVER), asi que la panza queda "castigada" y se recupera.
function partCol(h) {
  if (h > 0.6) return P.foam;                                  // sana
  if (h > 0.3) return P.accent;                                // castigada
  return Math.sin(run.t * 10) > 0 ? P.warn : '#7d2f1e';        // critica: parpadea
}

function drawStatusPanel(x, y) {
  const cx = x + 11;
  const hWing = run.overheat ? 0 : 1 - run.heat;
  const hEngine = run.fuel / 100;
  const lim = scrapeLimit(run.spd, run.boost);
  const hBelly = lim > 0 ? 1 - Math.max(0, Math.min(1, run.scrapeT / lim)) : 1;
  plate(x - 3, y - 8, 28, 26);
  ctx.fillStyle = P.dim; ctx.font = '6px monospace'; ctx.textAlign = 'left';
  ctx.fillText(T('hud_status'), x - 1, y - 2);
  px(cx - 1, y, 2, 5, P.bodyDark);              // deriva (cola) — sin dato asociado
  px(cx - 11, y + 7, 22, 3, partCol(hWing));    // ALAS  = canon (los caños van en las alas)
  px(cx - 3, y + 5, 6, 8, partCol(hEngine));    // MOTOR = combustible
  px(cx - 4, y + 13, 8, 2, partCol(hBelly));    // PANZA = roce (lo que toca el agua)
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

/** Barra con marco, bisel y muescas cada 25%. El relleno pierde el ultimo pixel del marco. */
function bar(x, y, w, val, c, label) {
  plate(x - 2, y - 2, w + 4, 7);
  const fw = Math.round(w * Math.max(0, Math.min(1, val)));
  px(x, y, fw, 3, c);
  if (fw > 1) { ctx.globalAlpha = 0.4; px(x, y, fw, 1, '#f2f7fb'); ctx.globalAlpha = 1; }   // bisel
  ctx.fillStyle = '#0a0e11';                                  // muescas de escala
  for (let i = 1; i < 4; i++) ctx.fillRect(x + Math.round(w * i / 4), y, 1, 3);
  ctx.fillStyle = P.dim; ctx.font = '6px monospace'; ctx.textAlign = 'left';
  ctx.fillText(label, x, y - 4);
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
const ADI = { cx: 20, cy: 145, r: 10 };
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
export function drawSquadPips(x, y) {
  const fallen = pilotIdx(run.squad, run.lives);
  plate(x, y, run.squad * 8 + 6 + 38, 9);
  for (let i = 0; i < run.squad; i++) {
    const bx = x + 3 + i * 8, by = y + 3;
    const down = i < fallen;
    const c = down ? '#3a4750' : i === fallen ? P.accent : P.foam;   // el actual, en acento
    px(bx, by + 1, 7, 1, c);                                         // alas
    px(bx + 3, by, 1, 3, c);                                         // fuselaje
    if (down) { px(bx + 1, by, 1, 1, P.warn); px(bx + 3, by + 1, 1, 1, P.warn); px(bx + 5, by + 2, 1, 1, P.warn); }
  }
  ctx.fillStyle = P.dim; ctx.font = '6px monospace'; ctx.textAlign = 'left';
  ctx.fillText(pilotName(fallen), x + 6 + run.squad * 8, y + 7);
}

export function drawHUD(h) {
      const { best, gameMode, curLevel, objectiveDist, objectiveShip } = h;
  // PUNTAJE: placa de contador con los ceros a la izquierda apagados — lee como marcador arcade
  plate(3, 3, 44, 12);
  ctx.font = '8px monospace'; ctx.textAlign = 'left';
  const digits = String(Math.floor(run.score)).padStart(6, '0');
  const lead = digits.search(/[1-9]/);                        // hasta aca son ceros de relleno
  for (let i = 0; i < digits.length; i++) {
    ctx.fillStyle = (lead === -1 || i < lead) ? '#3a4750' : P.ink;
    ctx.fillText(digits[i], 6 + i * 6, 12);
  }
  ctx.textAlign = 'right'; ctx.fillStyle = P.dim; ctx.font = '7px monospace';
  ctx.fillText(T('hud_best', { n: best }), W - 16, 12);   // corrido a la izq para no chocar el ícono de sonido

  // vidas del escuadron, bajo el puntaje. Con 1 avion no se dibuja: seria un tablero de nada
  if (run.squad > 1) drawSquadPips(3, 17);

  // modo campaña: PROGRESO de la campaña arriba al centro. No repite el nombre del blanco —
  // de eso ya se ocupa la barra de objetivo, justo abajo.
  if (gameMode === 'campaign') {
    ctx.textAlign = 'center'; ctx.font = 'bold 8px monospace'; ctx.fillStyle = P.accent;
    ctx.fillText(T('hud_mission', { n: curLevel + 1, m: MISSIONS.length }), W / 2, 12);
  }

  // barra de misión puerto→barcaza (modos con objetivo: ciclo de muerte y campaña)
  if (objectiveDist > 0) drawObjectiveBar(objectiveDist, objectiveShip);

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
  const seen = plane.y > RADAR_ALT || scraping;
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
  const topBase = objectiveDist > 0 ? 38 : 20;

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

  // panel de estado del avion — abajo a la derecha, en la misma columna que el gas y el canon:
  // queda debajo de la palanca (termina en y=119) y arriba del rotulo del canon (y=169)
  drawStatusPanel(287, 140);
  // horizonte artificial, en la esquina de enfrente y a la misma altura que el panel de estado
  drawADI();

  bar(6, H - 8, 60, run.fuel / 100, run.fuel < 25 ? (Math.sin(run.t * 10) > 0 ? P.warn : P.dim) : P.foam, T('bar_fuel'));
  // INTEGRIDAD DEL AVION: solo cuando el modelo de vida la usa (en ESCUADRON no existe — la
  // barra de vida es el escuadron y una barra siempre llena seria una mentira ocupando lugar).
  if (dmgShown()) {
    const iv = run.integ / 100;
    bar(6, H - 22, 60, iv, iv <= 0.25 ? (Math.sin(run.t * 10) > 0 ? '#ff5340' : P.warn) : iv <= 0.5 ? P.warn : P.foam, T('dmg_bar'));
  }
  bar(W - 66, H - 8, 60, run.heat, run.overheat ? P.warn : P.accent, run.overheat ? T('bar_overheat') : T('bar_cannon'));
  // MOMENTUM (tecla 4): la barra del especial, a la derecha del ADI. Se carga con puntos;
  // LLENA parpadea despacio (esta lista para lanzar) y LANZADA parpadea rapido (se gasta).
  const tv = tempoMeter();
  bar(38, H - 22, 44, tv, tempoActive() ? (Math.sin(run.t * 14) > 0 ? P.accent : P.foam)
    : tv >= 1 ? (Math.sin(run.t * 7) > 0 ? P.accent : P.crest) : P.crest, T('bar_tempo'));

  // municion de misiles: cada pip es el MISIL en miniatura (cuerpo blanco, ojiva gris, llama),
  // el mismo que se ve volar — no un rectangulo generico. Vacio = solo el contorno.
  ctx.textAlign = 'left'; ctx.font = '6px monospace'; ctx.fillStyle = P.dim;
  ctx.fillText('MISIL', 72, H - 11);
  for (let i = 0; i < MSL_MAX; i++) {
    const on = i < run.msl, bx = 72 + i * 9, by = H - 8;
    if (on) {
      px(bx + 1, by, 5, 2, '#e9edf0');                        // cuerpo blanco
      px(bx + 6, by, 1, 2, '#9aa3ab');                        // ojiva gris
      px(bx + 1, by, 5, 1, '#ffffff');                        // brillo del canto
      px(bx, by + 2, 2, 1, '#c9d0d6');                        // aleta
      px(bx - 1, by, 1, 2, P.accent);                         // llama
    } else {
      ctx.fillStyle = '#2e3c45';
      ctx.fillRect(bx, by, 7, 1); ctx.fillRect(bx, by + 1, 1, 1); ctx.fillRect(bx + 6, by + 1, 1, 1);
    }
  }

  // palanca de gas (throttle) — vertical, borde derecho
  const tx = W - 9, tyTop = 46, tyBot = 118, tH = tyBot - tyTop;
  plate(tx - 3, tyTop - 3, 10, tH + 6);
  ctx.fillStyle = P.dim;                                     // marcas de la corredera
  for (let i = 0; i <= 4; i++) ctx.fillRect(tx - 2, Math.round(tyBot - tH * (i / 4)), 2, 1);
  const fillH = Math.round(tH * Math.max(0, Math.min(1, run.throttle)));
  const tcol = run.fuel <= 0 ? (Math.sin(run.t * 10) > 0 ? P.warn : P.dim)
    : run.throttle > 0.66 ? P.foam : run.throttle > 0.15 ? P.accent : P.bodyDark;
  px(tx, tyBot - fillH, 4, fillH, tcol);                     // relleno desde abajo
  if (fillH > 1) { ctx.globalAlpha = 0.35; px(tx, tyBot - fillH, 1, fillH, '#f2f7fb'); ctx.globalAlpha = 1; }
  px(tx - 2, tyBot - fillH - 1, 8, 2, P.ink);                // perilla de la palanca
  px(tx - 2, tyBot - fillH - 1, 8, 1, '#f2f7fb');            // canto superior de la perilla
  ctx.fillStyle = P.dim; ctx.font = '6px monospace'; ctx.textAlign = 'right';
  ctx.fillText(run.fuel <= 0 ? T('thr_dead') : T('thr'), W - 4, tyTop - 4);
}

