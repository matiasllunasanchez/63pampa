// HUD: la capa de instrumentos y avisos sobre el vuelo, mas la cuenta regresiva del despegue.
//
// Puntaje, best, progreso de campaña, barra de objetivo, velocidad, radar, viento, multiplicador,
// combustible, calor del canon, misiles y la palanca de gas. Va SIN el zoom de camara (el
// orquestador lo restaura antes de llamar aca).
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
    ctx.fillStyle = P.ink;
    ctx.beginPath(); ctx.moveTo(x + 3, y); ctx.lineTo(x - 3, y - 2.5); ctx.lineTo(x - 3, y + 2.5); ctx.closePath(); ctx.fill();
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

export function drawObjectiveBar(objectiveDist, objectiveShip, kind) {
  const cx = W / 2, half = Math.round(W * 0.15);          // 30% del ancho (máx), centrada
  const x0 = cx - half, x1 = cx + half;
  const prog = Math.max(0, Math.min(1, run.dist / objectiveDist));
  // EL NOMBRE, SOLO SI ES UN NOMBRE. Un objetivo de DISTANCIA se rotulaba «2400 m» aca arriba, y
  // eso es el mismo dato que ahora dicen la cuenta regresiva de al lado del buque y el total del
  // odometro: tres veces. Con un buque (HMS SHEFFIELD) el rotulo si aporta — es quien es el blanco.
  const conNombre = kind !== 'distance';
  // …Y TODO EL INSTRUMENTO SOBRE UNA SOLA PLACA. La ruta era lo unico del HUD dibujado directo
  // sobre el cielo: los dos iconos tenian su placa y la linea entre ellos no, asi que se leia como
  // dos botones sueltos unidos por nada. Con una placa pasa a ser un instrumento — y adentro los
  // iconos ya no necesitan la suya.
  // LA PLACA APOYA EN EL MARGEN, como todo lo demas del HUD. Estaba mas abajo para dejarle sitio al
  // contador de mision, que ya no existe: una placa que flota a media banda porque ahi arriba habia
  // otra cosa es una posicion heredada, no una decision.
  const py = MARGEN;
  const y = py + (conNombre ? 13 : 8);   // la ruta, adentro: con nombre baja lo que ocupa el nombre
  plate(x0 - 9, py, (x1 - x0) + 18, y + 14 - py);
  if (conNombre) {
    ctx.font = '6px monospace'; ctx.textAlign = 'center'; ctx.fillStyle = P.warn;
    ctx.fillText(objectiveShip, cx, y - 6);
  }
  // via PUNTEADA (pendiente) que se va rellenando continua (recorrido): lee como ruta de mapa
  for (let dx3 = 0; dx3 < x1 - x0; dx3 += 4) px(x0 + dx3, y, 2, 1, '#2e3c45');
  px(x0, y, Math.round((x1 - x0) * prog), 1, P.accent);
  // extremos: puerto (izq) y barcaza (der) — assets configurables o fallback
  drawHudAsset(OBJ_ASSETS.port, x0, y, 'port', 9, true);
  drawHudAsset(OBJ_ASSETS.barge, x1, y, 'barge', 9, true);
  // LO QUE FALTA, pegado al buque y en el color del buque. Va abajo y chico a proposito: no es un
  // titulo, es una cuenta regresiva — y puesta AHI, contra el icono, el numero se lee como «el
  // blanco esta a tantos metros» y no como el nombre de algo. Restar en vez de sumar es la mitad
  // del asunto: lo que importa no es cuanto llevas, es cuanto falta.
  const falta = Math.max(0, Math.round(objectiveDist - run.dist));
  ctx.font = '6px monospace'; ctx.textAlign = 'right';
  ctx.fillStyle = falta <= 0 ? P.accent : P.warn;
  ctx.fillText(falta + T('obj_m'), x1 + 7, y + 11);
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

// EL CUENTAKILOMETROS. Va PEGADO al puntaje porque son los dos numeros que resumen la corrida,
// pero se dibuja a proposito con OTRO idioma: el puntaje es un contador de arcade (digitos parejos
// del mismo alto, ceros de relleno apagados, tinta blanca) y esto es un INSTRUMENTO DEL AVION.
// Dos numeros con la misma pinta a cuatro pixeles uno del otro se leen como uno solo partido al
// medio, y el jugador termina sin mirar ninguno.
//
// Lo que lo hace instrumento y no marcador: el entero grande en ambar, la DECIMA chica y apagada
// adentro de su ventanita —el tambor de decimas de un odometro, que es la parte que se ve girar—
// y la unidad al costado. A 100 m/s la decima cambia una vez por segundo: es el unico numero del
// HUD que se mueve solo y sin que hagas nada, y de ahi le viene el peso.
const ODO_DEC = '#a2762f';   // el ambar del acento, apagado: misma familia, otro plano

function drawOdo(x, y, totalM) {
  const km = Math.max(0, run.dist) / 1000;
  const ent = String(Math.floor(km)), dec = Math.floor((km - Math.floor(km)) * 10);
  // …Y CONTRA QUE. Si la corrida tiene objetivo, el odometro deja de ser un contador abierto y pasa
  // a ser una fraccion: `0.3 / 2.4 KM`, con el total en el color del blanco. En campaña la corrida
  // nunca pasa de ese numero, asi que un contador que sube sin techo estaba midiendo contra nada —
  // y de paso el kilometraje y el objetivo dejan de ser dos instrumentos que dicen lo mismo.
  const tot = totalM > 0 ? (totalM / 1000).toFixed(1) : null;
  plate(x, y, tot ? 62 : 46, 12);
  // la linea de base sale de `y` y ya no esta clavada en 12: desde que el bloque de arriba a la
  // izquierda se apila (escuadron primero, ver drawHUD) el odometro no siempre esta en la fila 1.
  const ly = y + 9;
  ctx.textAlign = 'left';
  ctx.font = 'bold 9px monospace'; ctx.fillStyle = P.accent;
  ctx.fillText(ent, x + 4, ly);
  const wEnt = ctx.measureText(ent).width;
  // la ventanita del tambor: un recuadro apenas mas oscuro que la placa, del alto del digito
  px(x + 3 + wEnt, y + 2, 10, 8, '#141b20');
  ctx.font = '7px monospace'; ctx.fillStyle = ODO_DEC;
  ctx.fillText('.' + dec, x + 4 + wEnt, ly);
  if (tot) {
    ctx.font = '7px monospace'; ctx.fillStyle = P.warn;
    ctx.fillText('/ ' + tot, x + 18 + wEnt, ly);
  }
  ctx.font = F_ROT; ctx.fillStyle = P.dim; ctx.textAlign = 'right';
  ctx.fillText('KM', x + (tot ? 59 : 43), ly);   // simbolo de unidad: es el mismo en los dos idiomas
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
  // ---- LA ESQUINA DE LA CORRIDA (arriba a la izquierda), apilada de arriba abajo ----------------
  // QUIEN VUELA MANDA. El escuadron pasa a encabezar el bloque y el puntaje se va: en CAMPAÑA los
  // puntos se cobran en el recuento, asi que un contador de arcade corriendo en pantalla no decide
  // nada — y estaba ocupando la esquina donde uno mira primero (playtest 29/8). Los kilometros se
  // quedan: son lo unico que dice cuanto llevas cuando la mision no tiene barra de objetivo.
  const campana = gameMode === 'campaign';
  let ty = 3;
  // vidas del escuadron. Con 1 avion no se dibuja: seria un tablero de nada
  if (run.squad > 1) { drawSquadPips(MARGEN, ty); ty += SQUAD_H + AIRE; }
  let tx = MARGEN;
  if (!campana) {
    // PUNTAJE: placa de contador con los ceros a la izquierda apagados — lee como marcador arcade.
    // Sobrevive en JUEGO RAPIDO, que es el modo donde el puntaje ES el juego.
    plate(tx, ty, 44, 12);
    ctx.font = '8px monospace'; ctx.textAlign = 'left';
    const digits = String(Math.floor(run.score)).padStart(6, '0');
    const lead = digits.search(/[1-9]/);                      // hasta aca son ceros de relleno
    for (let i = 0; i < digits.length; i++) {
      ctx.fillStyle = (lead === -1 || i < lead) ? '#3a4750' : P.ink;
      ctx.fillText(digits[i], tx + 3 + i * 6, ty + 9);
    }
    tx += 48;
  }
  drawOdo(tx, ty, objectiveDist);   // los kilometros, al lado del puntaje y con otra voz (ver drawOdo)
  if (!campana) {
    // EL RECORD, en el mismo bloque que el puntaje contra el que se compara — y NO en campaña, donde
    // un maximo historico global no significa nada (cada mision tiene su recuento). De paso deja de
    // pelearse la esquina derecha con el boton de sonido y el reproductor, que son HTML.
    // …y en SU RENGLON: al lado del odometro caia sobre la ruta del objetivo, que arranca en x=112.
    ctx.textAlign = 'left'; ctx.font = '7px monospace';
    const bTxt = T('hud_best', { n: best });
    plate(MARGEN, ty + 12 + AIRE, Math.round(ctx.measureText(bTxt).width) + 6, 11);
    ctx.fillStyle = P.dim;
    ctx.fillText(bTxt, MARGEN + 3, ty + 23);
  }

  // EL CONTADOR DE MISION SE FUE (playtest 29/8). «MISION 3/14» arriba del todo era lo unico del
  // HUD que hablaba del MENU y no del vuelo: en que numero de la campaña estas no cambia nada de lo
  // que haces en los proximos diez segundos, y lo dice el briefing antes de despegar. Encima ocupaba
  // el renglon mas visible de la pantalla, que ahora se lo queda la ruta.

  // barra de misión puerto→barcaza (modos con objetivo: ciclo de muerte y campaña)
  if (objectiveDist > 0) drawObjectiveBar(objectiveDist, objectiveShip, h.goalKind);

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

  // horizonte artificial, en la esquina de abajo a la izquierda
  drawADI();

  // LAS TRES FILAS del tablero de abajo, medidas desde el borde y con el mismo paso en las dos
  // columnas: lo que hace que el HUD se lea como un tablero y no como cosas puestas donde entraban.
  const R1 = H - 8, R2 = R1 - FILA, R3 = R2 - FILA;

  // ---- COLUMNA IZQUIERDA: EL AVION (lo que se gasta volando) -----------------------------------
  bar(6, R1, 60, run.fuel / 100, run.fuel < 25 ? (Math.sin(run.t * 10) > 0 ? P.warn : P.dim) : P.foam, T('bar_fuel'));
  // INTEGRIDAD DEL AVION: solo cuando el modelo de vida la usa (en ESCUADRON no existe — la
  // barra de vida es el escuadron y una barra siempre llena seria una mentira ocupando lugar).
  if (dmgShown()) {
    const iv = run.integ / 100;
    bar(ADI.cx + 14 + AIRE + 2, R2, 44, iv, iv <= 0.25 ? (Math.sin(run.t * 10) > 0 ? '#ff5340' : P.warn) : iv <= 0.5 ? P.warn : P.foam, T('dmg_bar'));
  }

  // ---- COLUMNA DERECHA: EL ARMA, apilada -------------------------------------------------------
  // ESTADO arriba (como viene el avion), CAÑON en el medio y MISILES abajo, DEBAJO del canon y no
  // al lado de la nafta: los misiles son armamento, no consumo de vuelo, y tenerlos en la esquina
  // opuesta a su barra obligaba a cruzar la pantalla para leer "con que puedo tirar".
  const ev = estadoVal();
  bar(254, R3, 60, ev, ev <= 0.25 ? (Math.sin(run.t * 10) > 0 ? P.warn : '#7d2f1e') : ev <= 0.5 ? P.accent : P.foam, T('hud_status'));
  // …y su NUMERO, al final del rotulo. Una barra dice "poco"; el porcentaje dice cuanto, que es lo
  // que hace falta para decidir si volves o seguis.
  ctx.textAlign = 'right'; ctx.font = F_ROT;
  ctx.fillStyle = ev <= 0.25 ? P.warn : P.dim;
  ctx.fillText(Math.round(ev * 100) + '%', 314, R3 - 4);
  bar(254, R2, 60, run.heat, run.overheat ? P.warn : P.accent, run.overheat ? T('bar_overheat') : T('bar_cannon'));

  // ---- ARRIBA A LA DERECHA: LOS PODERES DE RACHA ------------------------------------------------
  // RASANTE y MOMENTUM se mudan a la esquina que quedo libre al sacar MEJOR. Los dos se GANAN
  // volando —no se gastan como la nafta— asi que no son del bloque del avion: son del bloque de la
  // corrida, y estando arriba se leen de reojo sin bajar la vista del horizonte.
  // Arrancan en y=22 y no mas arriba porque los primeros 12 px de esa esquina son del boton de
  // sonido, que es HTML y esta encima del canvas (ver index.html).
  //
  // ACTIVA MUESTRA EL RELOJ, no la barra: mientras dura, lo unico que importa saber es cuanto
  // queda. La barra vuelve a ser barra recien cuando el poder se apaga y empieza a ganarse otra
  // vez — que es cuando de nuevo importa cuanto falta.
  const P1 = 24, P2 = P1 + FILA;
  bar(W - MARGEN - 46, P1, 44, ras.on ? ras.resta / ras.dur : ras.meter,
    ras.on ? (Math.sin(run.t * 10) > 0 ? P.accent : P.canopy)
      : ras.meter >= 1 ? (Math.sin(run.t * 7) > 0 ? P.accent : P.canopy) : P.canopy, T('bar_rasante'));
  if (ras.on) {
    ctx.textAlign = 'right'; ctx.font = F_ROT;
    ctx.fillStyle = P.accent;
    ctx.fillText(Math.ceil(ras.resta) + 's', W - MARGEN - 50, P1 + 5);
  }
  // MOMENTUM (tecla 4): se carga con puntos; LLENA parpadea despacio (esta lista para lanzar) y
  // LANZADA parpadea rapido (se gasta).
  const tv = tempoMeter();
  bar(W - MARGEN - 46, P2, 44, tv, tempoActive() ? (Math.sin(run.t * 14) > 0 ? P.accent : P.foam)
    : tv >= 1 ? (Math.sin(run.t * 7) > 0 ? P.accent : P.crest) : P.crest, T('bar_tempo'));

  // LA CHANCHA (tecla 5): la barra del hermano caro, JUSTO ENCIMA del MOMENTUM. Mismo lenguaje
  // visual y otro color a proposito — son dos poderes de la misma familia y hay que poder
  // distinguirlos de un vistazo sin leer el rotulo.
  //
  // Con COMBUSTIBLE: NO el poder no existe, y entonces la barra tampoco: una barra que nunca se
  // va a poder usar es ruido ocupando el unico lugar libre del HUD.
  if (cfg.fuelOn) {
    const cv2 = chMeter();
    const ch = chSnap();
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
  plate(252, R1 - 9, 64, INSTR);
  ctx.textAlign = 'left'; ctx.font = F_ROT; ctx.fillStyle = P.dim;
  ctx.fillText('MISIL', 254, R1 - 4);
  for (let i = 0; i < MSL_MAX; i++) {
    const on = i < run.msl, bx = 254 + i * 9, by = R1;
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
  const gx = W - MARGEN - 7, tyTop = P2 + 9 + AIRE + 11, tyBot = 118, tH = tyBot - tyTop;
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

