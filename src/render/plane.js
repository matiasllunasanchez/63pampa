// RENDER DEL AVION: el sprite del jugador y su mira.
//
// Dibuja sombra, espuma, el sprite (hoja horneada con alabeo/cabeceo reales, o ilustracion, o
// fallback de rects), la vibracion del roce, los fantasmas de la pirueta, el postquemador y la
// sangre del atropello. Al final, la mira (libre con mouse, o adelante del avion en tactil).
//
// Recibe `selPlane` (que avion eligio el jugador — estado de menu, vive en game.js) y `viewMouse`
// (resuelve la mira segun la camara — la camara sigue en game.js). El resto lo lee de los stores.

import { ctx, px, PZ, U } from './ctx.js';
import { plane, cfg, S } from '../core/state.js';
import { run } from '../core/run.js';
import { inp } from '../core/input.js';
import { proj } from '../core/fx.js';
import { hzSprite } from '../core/horizon.js';
import { P } from '../data/palette.js';
import { drawMira } from './miras.js';
import { anchorSpray, drawSpray } from './rain.js';
import { PLANES, SHEET_NF, SHEET_FW, SHEET_FH, SHEET_BODY_H } from '../data/planes.js';
import { skinOf } from '../data/skins.js';
import { pilotIdx } from '../core/squad.js';
import { pilotName, rosterActive } from '../systems/squad.js';
import { ROLL_DUR } from '../data/tuning.js';

const MIRA_SIZE = 17;   // lado de la mira en pixeles de mundo (480x270)
const AIM_PITCH = 5;    // cuanto sube/baja la mira FIJA con el cabeceo (unidades de mundo)

// PERILLAS del "vuelo vivo": el avion nunca queda congelado en el aire. Son sutiles a proposito
// (el juego corre a 320x180, 1px se nota). Subilas para que flote/cabecee mas, bajalas para calmarlo.
// TAMAÑO del avion en pantalla, como factor. 1 = el horneado tal cual (84 px de ancho de frame).
// Es la perilla para equilibrarlo contra el resto del mundo (mastiles, barcos, obstaculos): si el
// avion se come la pantalla, bajarla; no hay que rehornear nada.
export const PLANE_SCALE = 0.85;
let boostSc = 1;   // factor animado del achique por turbo

const BOB_Y  = 1.5;    // amplitud del bob vertical (px)
const BOB_X  = 0.75;    // amplitud de la deriva horizontal (px) — desfasada del bob → flota en "8"
const WOBBLE = 0.026;  // amplitud de la micro-oscilacion de alabeo (rad, ~1.5°)

/** LA LLAMA DE LA TURBINA. Una sola llama, con INTENSIDAD — no dos efectos distintos.
 *
 *  Antes solo existia con el turbo puesto: el resto del tiempo el avion volaba con la turbina
 *  apagada, que es lo que hacia que se leyera planeando. Ahora hay siempre una llamita mientras
 *  quede combustible, y el turbo es ESA MISMA llama mas larga, mas ancha y con mas resplandor.
 *  Que sea la misma y no otra es el punto: el turbo se lee como "mas de lo mismo", que es lo que
 *  un postquemador es de verdad.
 *
 *  `f` es la intensidad, 0..1. El color se reparte PROPORCIONALMENTE a lo largo: con el indice
 *  crudo (como estaba antes) una llama larga se comia toda la paleta en los primeros pixeles y
 *  terminaba en un rojo plano — justo con el turbo, que es cuando mas se mira.
 *
 *  En pixel art una llama se arma por FILAS que se afinan y se enfrian hacia la punta, con el
 *  largo parpadeando cuadro a cuadro: eso es lo que la hace respirar en vez de ser una barra. */
const FCOL = ['#fff6d8', '#ffe08a', '#ffb43c', '#f07c22', '#cf4d16', '#93300f'];
function flame(x, y0, f) {
  if (f <= 0.01) return;
  const largo = 2 + f * 5;
  const n = Math.max(2, Math.round(largo + Math.random() * (0.8 + f * 2.2)));
  const w0 = 2 + f * 2.6;                           // ancho del nucleo, en la boca
  // RESPLANDOR alrededor de la tobera: crece con la intensidad y es lo que hace que el turbo
  // "ilumine" en vez de solo alargarse
  ctx.globalAlpha = 0.12 + f * 0.2;
  px(x - (2 + f * 2), y0 - 1, 4 + f * 4, 3, '#ffb43c');
  ctx.globalAlpha = 1;
  for (let i = 0; i < n; i++) {
    const w = Math.max(1, Math.round(w0 - i * (w0 - 1) / n));   // se afina hacia la punta
    px(x - w / 2, y0 + i, w, 1, FCOL[Math.min(FCOL.length - 1, Math.floor(i * FCOL.length / n))]);
  }
  // diamante de choque: el punto azulado de la garganta, lo que delata que es un reactor.
  // Al ralenti aparece menos seguido — el diamante es cosa de estar empujando.
  if (Math.random() < 0.25 + f * 0.45) px(x, y0, 1, 1, '#dff3ff');
  if (Math.random() < 0.15 + f * 0.3) px(x + (Math.random() < 0.5 ? -1 : 1), y0 + n + 1, 1, 1, '#e0761f');
}

/** La intensidad de ESTE cuadro, suavizada. Sin la rampa, apretar turbo hacia SALTAR la llama de
 *  3 a 9 px en un cuadro y se leia como un parpadeo, no como una aceleracion. */
let flameF = 0;
function stepFlame() {
  const quiere = run.fuel > 0 ? (run.boost ? 1 : 0.3) : 0;
  flameF += (quiere - flameF) * 0.18;
  return flameF;
}

// VORTICES DE PUNTA DE ALA, y SOLO con el turbo puesto. No es humo de motor —eso ya lo hace la
// llama de la tobera— sino el hilo que se condensa en el extremo del ala cuando el avion esta
// cargado. Por eso sale de las PUNTAS y de ningun otro lado, y por eso aparece justo cuando
// apretas turbo: es el instrumento que te dice que estas exprimiendo el avion.
//
// ES UNA HISTORIA DE POSICIONES, una por cuadro, y no un sistema de particulas. La diferencia
// importa: asi el hilo sigue EXACTAMENTE lo que hiciste —el bob, la vibracion del roce, el
// alabeo, el tiron de un esquive— en vez de aproximarlo con velocidades. Y como el avion vive
// clavado en el mismo punto de la pantalla, cada muestra ademas se ABRE hacia afuera y BAJA con
// la edad: sin eso las diecisiete muestras caerian una encima de otra y el hilo seria un punto.
//
// Al soltar el turbo no se agregan muestras y la cola se va comiendo el hilo de atras para
// adelante, que es como se disipa de verdad — no un corte.
// CORTINAS DE PUNTA DE ALA (F3.1): donde estan las puntas respecto de la sombra, y hasta que
// altura hay agua que arrancar. RAS_ALT es el techo de la banda del x10 — una sola banda, y
// ahora tambien un solo efecto que la anuncia.
const TIP_X = 15, RAS_ALT = 4.5;

const TIP_N = 17;
const tips = [];

function tipTrail(cx, cy, half, bank, on) {
  const cb = Math.cos(bank * 0.9), sb = Math.sin(bank * 0.9) * 0.5;   // el alabeo sube una punta y baja la otra
  const rx = cx + half * cb, ry = cy + half * sb;
  // UN SALTO NO ES UN VUELO. Si el avion aparecio en otro lado —un relevo, volver de un menu, el
  // corte a otra fase— el hilo viejo no es estela: es basura de la vida anterior colgada en el
  // aire. Se tira entera y se empieza de nuevo, en vez de dibujar una raya del punto muerto al
  // punto vivo.
  const ult = tips[tips.length - 1];
  if (ult && Math.abs(ult.rx - rx) + Math.abs(ult.ry - ry) > 40) tips.length = 0;
  if (on) tips.push({ lx: cx - half * cb, ly: cy - half * sb, rx, ry });
  else if (tips.length) tips.shift();
  while (tips.length > TIP_N) tips.shift();
  const n = tips.length;
  for (let i = 0; i < n; i++) {
    const p = tips[i];
    const viejo = n > 1 ? 1 - i / (n - 1) : 0;      // 1 = la muestra mas vieja, la punta del hilo
    // La V se abre POCO y se hunde MUCHO. Con 10/5.5 los hilos salian disparados a los costados y
    // quedaban flotando a la altura del fuselaje, como dos rayas sueltas al lado del avion en vez
    // de algo que sale de el. Visto desde atras y desde arriba, lo que hace un vortice es caer:
    // casi todo el recorrido es hacia abajo y apenas se abre.
    const dx = viejo * 3.4, dy = viejo * 9;
    const w = 1 + viejo * 2.4;
    ctx.globalAlpha = (1 - viejo * 0.85) * 0.5;
    const c = viejo < 0.45 ? P.foam : P.crest;
    px(p.lx - dx - w / 2, p.ly + dy - w / 2, w, w, c);
    px(p.rx + dx - w / 2, p.ry + dy - w / 2, w, w, c);
  }
  ctx.globalAlpha = 1;
}

/** Los DOS fogonazos, colocados en la RAIZ DEL ALA. Al alabear tienen que acompañar al ala y no
 *  quedarse horizontales: la POSICION gira siempre con el alabeo, y la INCLINACION del fogonazo
 *  entra recien pasada la mitad del giro — antes no se notaria y solo ensuciaria el pixel art
 *  (rotar rectangulos chicos unos pocos grados los deja con los bordes sucios). */
function muzzles(bank) {
  const a = bank * 1.05;                       // ~60° a fondo: el mismo giro que traen los frames
  const ca = Math.cos(a), sa = Math.sin(a);
  const ab = Math.abs(bank);
  const tilt = ab > 0.5 ? a * (ab - 0.5) / 0.5 : 0;
  for (const gx of [-5, 5]) {
    const gy = -1;
    ctx.save();
    ctx.translate(gx * ca - gy * sa, gx * sa + gy * ca);
    if (tilt) ctx.rotate(tilt);
    muzzle(0, 0);
    ctx.restore();
  }
}

/** FOGONAZO del canon. Antes eran dos rectangulos blancos de 3x2 que a esta resolucion se leian
 *  como dos ladrillos. Ahora es un fogonazo de verdad: nucleo caliente, petalos en cruz que
 *  cambian por disparo, y un halo tenue. Todo en pixeles enteros — nada de degrade. */
function muzzle(x, y) {
  const big = Math.random() < 0.45;                 // no todos los disparos son iguales
  ctx.globalAlpha = 0.35;                           // halo: da calor sin ensuciar el sprite
  px(x - 2, y - 1, 4, 3, '#e8a33d');
  ctx.globalAlpha = 1;
  px(x - 1, y, 2, 1, '#fff6d8');                    // nucleo blanco caliente
  px(x, y - 1, 1, 3, '#ffe9a8');                    // eje vertical
  px(x - 2, y, 1, 1, '#ffcc66'); px(x + 2, y, 1, 1, '#ffcc66');   // petalos laterales
  if (big) {                                        // fogonazo largo: se estira hacia atras
    px(x, y + 2, 1, 2, '#f0a63a');
    px(x - 3, y, 1, 1, '#d97a26'); px(x + 3, y, 1, 1, '#d97a26');
  }
  if (Math.random() < 0.5) px(x + (Math.random() < 0.5 ? -2 : 2), y + 2, 1, 1, '#c9631f');   // chispa
}

/** TREN DE ATERRIZAJE (`g`: 1 bajado en la pista → 0 recogido). Vista trasera: las dos patas
 *  principales bajo la raiz del ala y, asomando entre medio, la de proa.
 *
 *  SE RECOGE DERECHO PARA ARRIBA, sin plegado. El tren se dibuja DEBAJO del sprite, asi que al
 *  subir las ruedas se meten solas detras del ala y desaparecen — alcanza para leer el gesto. Una
 *  version anterior las juntaba ademas hacia el fuselaje: a este tamaño el pliegue no se leia como
 *  pliegue, las tres ruedas se fusionaban en un ladrillo negro.
 *
 *  TAMAÑO: la rueda es de 2x2 px de diseño. Parece poquisimo escrito, pero el avion entero mide
 *  ~30 px de punta a punta de ala: cualquier cosa mas grande le cuelga como un tren de carga.
 *
 *  Las medidas verticales salen de medir las hojas horneadas: el frame es de 84 px con el avion
 *  centrado, el ala apoya en y=47..49 y la panza termina en y=52 — que en esta escala (0.567 px
 *  de diseño por px de hoja) son el 3.4 y el 5 de abajo. Si se rehornean los aviones, remedir. */
/** EL TREN, dibujado en el ORIGEN del contexto actual.
 *
 *  `u` dice cuantos pixeles vale una unidad de la grilla de diseño en ese contexto: el jugador lo
 *  llama con 1, porque ya esta adentro de su `ctx.scale(U, U)`; la FORMACION del escuadron lo
 *  llama con `U * f`, porque dibuja en pixeles de mundo y cada companero esta a otra distancia.
 *
 *  Que el escuadron use ESTE dibujo y no una copia es el punto: despegan con vos, con el mismo
 *  tren que vos. Dos rutinas de rueda serian un escuadron con dos aviones distintos, y la que no
 *  se mira se pudre. */
export function drawGear(g, u) {
  if (g <= 0) return;
  const TIRE = '#14181a', RIM = '#6d7679';
  // el ultimo tramo se apaga: a esa altura la rueda ya esta casi toda tapada por el ala y lo poco
  // que asoma no tiene recorrido para irse solo
  ctx.globalAlpha = Math.min(1, g * 5);
  // PATA DE PROA: una rueda mas chica todavia, que apenas asoma por debajo de la panza
  const ny = 3.4 + 3.1 * g;
  if (ny > 5.4) px(-0.5 * u, 5.2 * u, u, (ny - 5.2) * u, TIRE);
  px(-u, ny * u, 2 * u, u, TIRE);
  // PRINCIPALES
  for (const sgn of [-1, 1]) {
    const gx = sgn * 4, gy = 2.6 + 3.4 * g;
    if (gy > 4.2) px((gx - 0.5) * u, 4 * u, u, (gy - 4) * u, TIRE);   // pata, de la raiz del ala
    px((gx - 1) * u, gy * u, 2 * u, 2 * u, TIRE);                     // rueda
    px((gx - 1) * u, gy * u, 2 * u, u, RIM);                          // brillo del cubo: si no, es un cuadrado negro
  }
  ctx.globalAlpha = 1;
}

// `camScale` (opcional): empujon de camara del ESCUADRON al CONTROL LIBRE — agranda SOLO el
// sprite del avion. Acercarse escalando el raster ya dibujado esta prohibido en este juego
// (parte el mar en rayas, ver CAM_ZOOMS en game.js); esta es la version que el plano puede pagar.
/** LA SOMBRA, y la MISMA para el lider y para el escuadron.
 *
 *  Tres barras que se angostan en vez de un rectangulo: a esta resolucion eso ya lee como una
 *  elipse. El alfa cae con la altura porque la sombra es la REFERENCIA DE ALTURA del juego — es
 *  como se ve que estas bajando— y no se apaga nunca del todo (piso 0.08): un avion sin sombra
 *  no se lee como alto, se lee como despegado del mundo.
 *
 *  `f` es la escala del que la proyecta (1 = el lider, que vive clavado en PZ). Esta exportada
 *  por el mismo motivo que `drawGear`: el escuadron dibujaba SU PROPIA sombra —una sola barra,
 *  alfa fijo y apagandose por encima de y=6— asi que en cuanto despegaban se quedaban sin ella
 *  mientras el lider conservaba la suya. Dos rutinas para la misma cosa es un escuadron con dos
 *  aviones distintos, y la que no se mira se pudre. */
export function drawShadow(wx, wy, z, f) {
  f = f || 1;
  const sh = proj(wx, 0, z);
  const r = Math.max(0.7, f);                       // el grosor acompaña, pero no se colapsa
  ctx.globalAlpha = Math.max(0.08, 0.4 - wy * 0.009);
  px(sh.x - 9 * f, sh.y - r, 18 * f, 1, '#101c1e');
  px(sh.x - 13 * f, sh.y, 27 * f, 1, '#101c1e');
  px(sh.x - 9 * f, sh.y + r, 18 * f, 1, '#101c1e');
  ctx.globalAlpha = 1;
}

export function drawPlane(selPlane, viewMouse, camScale) {
  const s = proj(plane.x, plane.y, PZ);
  drawShadow(plane.x, plane.y, PZ, 1);
  const sh = proj(plane.x, 0, PZ);   // la rociada y las cortinas se miden contra la misma sombra
  // ROCIADA: el avion levanta agua al pasar rasante. Antes eran DOS BARRAS planas cruzando la
  // pantalla; ahora es una lengua de agua bajo el fuselaje, dos brazos en V que se abren hacia
  // atras y gotas sueltas — que es como se lee el agua batida en pixel art.
  const churn = Math.max(0, 1 - plane.y / 7);
  if (churn > 0 && S.state === 'play' && cfg.terrain !== 'land') {
    const pulse = 0.8 + 0.2 * Math.sin(run.t * 22);           // el chorro late, no es una calca
    // LENGUA central: el agua que el avion levanta justo debajo, con cresta blanca arriba
    ctx.globalAlpha = churn * 0.9;
    px(sh.x - 5, sh.y - 2, 10, 1, P.crest);
    px(sh.x - 4, sh.y - 1, 8, 2, P.foam);
    // BRAZOS en V: se abren y se apagan hacia atras, con el borde de arriba mas claro
    for (let i = 1; i <= 5; i++) {
      const w = (2 + i) * pulse, o = 4 + i * 4, yy = sh.y + i * 1.3;
      ctx.globalAlpha = churn * (0.6 - i * 0.09);
      px(sh.x - o - w, yy, w, 1, P.foam);
      px(sh.x + o, yy, w, 1, P.foam);
      if (i <= 2) {                                           // cresta iluminada del brazo
        ctx.globalAlpha = churn * 0.5;
        px(sh.x - o - w, yy - 1, w * 0.6, 1, P.crest);
        px(sh.x + o + w * 0.4, yy - 1, w * 0.6, 1, P.crest);
      }
    }
    // GOTAS: dos tamaños y dos tonos — sin esto la rociada se lee como una mancha uniforme
    for (let i = 0; i < 7; i++) {
      const dx = (Math.random() - 0.5) * 46, dy = Math.random() * 8 - 2;
      ctx.globalAlpha = churn * (0.5 + Math.random() * 0.5);
      px(sh.x + dx, sh.y + dy, Math.random() < 0.3 ? 2 : 1, 1, Math.random() < 0.45 ? P.crest : P.foam);
    }
    // CORTINAS DE PUNTA DE ALA (SPEC_AGUA_OLAS F3.1). El agua que las puntas arrancan de la
    // superficie cuando vas DE VERDAD a ras. Empieza en RAS_ALT y no en el 7 de la rociada, y
    // ese numero no es decorativo: 4.5 es el techo de la banda del x10 (el mismo de `rasNow` en
    // systems/flight.js). O sea que las cortinas son el INSTRUMENTO de la banda — cuando las
    // ves, estas cobrando; cuando se apagan, saliste. El HUD te lo dice con un numero; esto te
    // lo dice sin que despegues la vista del pasillo.
    //
    // NO SON LOS VORTICES DE PUNTA DE ALA de `tipTrail`, que el autor dejo apagados a proposito
    // (commit e8ccbd1). Aquellos son condensacion con turbo, a cualquier altura y en cualquier
    // terreno; estos son AGUA, solo sobre agua y solo a ras. Si tampoco convencen, se apagan
    // igual: es este bloque y nada mas.
    const ras = Math.max(0, 1 - plane.y / RAS_ALT);
    if (ras > 0) {
      const gordo = run.boost ? 1.7 : 1;                    // con turbo arranca mas agua
      for (const sg of [-1, 1]) {
        const bx = sh.x + sg * TIP_X;
        for (let i = 0; i < 4; i++) {
          // la cortina se abre HACIA AFUERA y HACIA ATRAS, y se apaga con la edad: es una
          // cortina, no un chorro — el agua se despega de la punta y queda atras
          const f = i / 3;
          ctx.globalAlpha = ras * gordo * (0.55 - f * 0.32);
          const w = (2 + f * 5) * gordo;
          px(bx + sg * f * 5, sh.y - 2 + f * 4, w, 1, f < 0.4 ? P.crest : P.foam);
        }
        // gotas sueltas arrancadas de la punta
        if (Math.random() < 0.6 * gordo) {
          ctx.globalAlpha = ras * 0.7;
          px(bx + sg * (2 + Math.random() * 9), sh.y - 3 + Math.random() * 7, 1, 1, P.crest);
        }
      }
    }
    // ERUPCION DE ROCE (F3.2): mientras el avion RASPA la superficie —el reloj de gracia
    // corriendo— el agua no se levanta, EXPLOTA. Es el unico feedback visual que dice "esto se
    // esta consumiendo" sin mirar un instrumento, y va aca y no en el HUD por eso mismo.
    if (run.scrapeT > 0 && run.scrapeVib > 0) {
      const er = Math.min(1, run.scrapeVib);
      for (let i = 0; i < 9; i++) {
        const dx = (Math.random() - 0.5) * 30, dy = -Math.random() * 9;
        ctx.globalAlpha = er * (0.35 + Math.random() * 0.55);
        px(sh.x + dx, sh.y + dy, Math.random() < 0.35 ? 2 : 1, Math.random() < 0.3 ? 2 : 1,
           Math.random() < 0.6 ? '#f4fbff' : P.crest);
      }
      ctx.globalAlpha = er * 0.85;                          // el cuello del chorro, pegado al avion
      px(sh.x - 7, sh.y - 4, 14, 2, P.foam);
    }
  }
  ctx.globalAlpha = 1;

  ctx.save();
  // VUELO VIVO (nunca queda congelado): bob vertical de dos frecuencias + deriva horizontal
  // desfasada (flota en "8") + micro-oscilacion de alabeo de dos armonicos (respira, no es un
  // metronomo). Todo se apaga fuera de 'play'. Perillas: BOB_Y / BOB_X / WOBBLE (arriba).
  const alive = S.state === 'play';
  const bobY = alive ? Math.sin(run.t * 3.1) * BOB_Y * 0.6 + Math.sin(run.t * 1.7) * BOB_Y * 0.4 : 0;
  const bobX = alive ? Math.sin(run.t * 2.3 + 1.1) * BOB_X : 0;
  const wob  = alive ? (Math.sin(run.t * 2.3) * 0.7 + Math.sin(run.t * 3.7) * 0.3) * WOBBLE : 0;
  // VIBRACION al rozar la superficie: temblor rapido del fuselaje (el avion, no la camara)
  const vx2 = run.scrapeVib ? (Math.random() - 0.5) * 4.8 * run.scrapeVib : 0;
  const vy2 = run.scrapeVib ? (Math.random() - 0.5) * 3.6 * run.scrapeVib : 0;
  ctx.translate(s.x + vx2 + bobX, s.y - bobY + vy2);
  // cabeceo: el morro sube al trepar / baja al caer (desplazamiento vertical del sprite)
  ctx.translate(0, -plane.pitch * 1.8);
  // alabeo: rotación 2D + micro-wobble; el foreshortening en X finge la inclinación 3D del ala
  const bank = Math.max(-1, Math.min(1, plane.bank));
  const pl = PLANES[selPlane];
  const useSheet = pl.sheetOk;   // sprite HORNEADO: el alabeo lo traen los frames
  let rolling = run.rollT > 0;
  // HORIZONTE GIRATORIO: con cfg.horizon prendido, el giro de la pirueta ya se lo comio el MUNDO
  // (game.js rota el fondo entero) y el avion tiene que quedar DERECHO, como visto desde una
  // camara que rola con el. hz vale justo lo que hay que restar. Con FIJO vale 0 y todo esto se
  // comporta igual que siempre. Ver core/horizon.js.
  const hz = hzSprite();
  if (rolling) {
    // PIRUETA: tonel completo — el sprite (vista trasera) rota 360° en el plano de pantalla
    const pr = 1 - run.rollT / ROLL_DUR;                   // 0→1 durante el tonel
    ctx.rotate(run.rollDir * pr * Math.PI * 2 + hz);
    ctx.scale(0.94 + 0.06 * Math.cos(pr * Math.PI * 2), 1);   // leve pulso: vende el giro
  } else if (run.mvRoll) {
    // MANIOBRA con rotacion propia: el medio tonel del split-s (queda invertido y pica asi)
    // o el sobre-banqueo del break turn. Encima, el frame de alabeo/cabeceo sigue normal.
    ctx.rotate(run.mvRoll + hz);
    ctx.rotate(wob);
  } else if (useSheet) {
    // con frames de alabeo Y cabeceo REALES no hay rotacion ni squash fingidos: solo micro-wobble
    ctx.rotate(wob);
  } else {
    ctx.rotate(bank * 0.42 + wob);
    ctx.scale(1 - Math.abs(bank) * 0.26, 1 - plane.pitch * 0.05);
  }
  // Todo este bloque esta authorado para la grilla de 320x180 (fogonazos, fallback de rects,
  // sangre), asi que se escala por U. Las HOJAS ya vienen horneadas a 1.5x, por eso se dibujan
  // a SHEET_FW/U: ocupan lo mismo en pantalla pero con 1.5x mas pixeles de fuente.
  ctx.scale(U, U);
  // con TURBO el avion se ACHICA un poco: acompaña a la camara que sube (ver flight.js) y remata
  // la sensacion de que el avion se despega de vos. Interpolado para que no sea un salto.
  boostSc += ((run.boost ? 0.92 : 1) - boostSc) * 0.08;
  const ff = stepFlame();   // una sola vez por cuadro: las tres ramas de dibujo la comparten
  const sc = PLANE_SCALE * boostSc * (camScale || 1);
  const spW = SHEET_FW / U * sc, spH = SHEET_FH / U * sc;
  // media altura del CUERPO del avion (sin el aire del frame): a esto se pega la llama del turbo
  const bodyH2 = SHEET_BODY_H / U * sc / 2;
  if (useSheet) {
    ctx.imageSmoothingEnabled = false;   // pixel art nítido (el save/restore de afuera lo repone)
    // COLUMNA por alabeo. bank>0 = va a la DERECHA → tiene que banquear a la derecha, pero
    // los frames del modelo 3D giran en sentido opuesto al canvas, asi que se INVIERTE el
    // signo (esto corrige el "giraba para el lado contrario"). Nivelado = columna central.
    const col = rolling ? (SHEET_NF - 1) / 2 : Math.round((1 - bank) / 2 * (SHEET_NF - 1));
    // FILA por cabeceo. pitch>0 = trepa (morro arriba) → fila 0; nivel → 1; picada → 2
    const pc = Math.max(-1, Math.min(1, plane.pitch));
    let row = pc > 0.33 ? 0 : pc < -0.33 ? 2 : 1;
    // POSE EMPINADA de pirueta (run.mvSteep): usa la HOJA 2 (±32° de cabeceo) si cargo; sin
    // ella (build web) cae a la fila normal de trepada/picada — la maniobra se juega igual.
    // LA SKIN DEL PILOTO QUE VA HOY EN ESTE AVION. En campaña arrancas siendo TERO, y cada
    // relevo te sube al avion del que sigue: el numeral avanza y la marca del ala CAMBIA sola.
    // Es la unica señal en pantalla de que ya no estas volando tu avion. Fuera de campaña no
    // hay roster y `sk` es null, asi que se usa la hoja generica de siempre.
    const sk = rosterActive() ? skinOf(pilotName(pilotIdx(run.squad, run.lives))) : null;
    let img = sk ? sk.sheetImg : pl.sheetImg;
    const hoja2 = sk ? sk.sheet2Img : (pl.sheet2Ok ? pl.sheet2Img : null);
    if (run.mvSteep && hoja2) { img = hoja2; row = run.mvSteep > 0 ? 0 : 1; }
    else if (run.mvSteep) row = run.mvSteep > 0 ? 0 : 2;
    const sx4 = col * SHEET_FW, sy4 = row * SHEET_FH;
    // fantasmas de la pirueta: 2 copias retrasadas en el giro, translucidas
    if (rolling) for (let gi = 2; gi >= 1; gi--) {
      ctx.save();
      ctx.rotate(-run.rollDir * gi * 0.55);
      ctx.globalAlpha = 0.14;
      ctx.drawImage(img, sx4, sy4, SHEET_FW, SHEET_FH, -spW / 2, -spH / 2, spW, spH);
      ctx.restore();
    }
    // POSTQUEMADOR pegado a la TOBERA. Antes salia de spH/2 (el borde del frame) y al pasar el
    // frame a cuadrado la llama quedo flotando 12 px detras del avion.
    // ORDEN DE CAPAS. Los FOGONAZOS van DEBAJO del avion: la boca del canon esta en la raiz del
    // ala, del otro lado del fuselaje, asi que el fuego tiene que asomar por detras y no taparlo.
    // La LLAMA del turbo va ENCIMA: sale de la tobera, que apunta a la camara.
    if (inp.fire && !run.overheat && run.fireT > 0.06) muzzles(bank);
    drawGear(run.gear, 1);   // DEBAJO del sprite: la pata nace dentro del ala y solo se ve lo que asoma
    ctx.drawImage(img, sx4, sy4, SHEET_FW, SHEET_FH, -spW / 2, -spH / 2, spW, spH);
    flame(0, bodyH2 - 6, ff);
  } else if (pl.ready) {
    const PW = 54, PH = Math.round(PW * pl.h / pl.w);
    // fantasmas de la pirueta: 2 copias retrasadas en el giro, translucidas (estela cinematica)
    if (rolling) for (let gi = 2; gi >= 1; gi--) {
      ctx.save();
      ctx.rotate(-run.rollDir * gi * 0.55);
      ctx.globalAlpha = 0.14;
      ctx.drawImage(pl.img, -PW / 2, -PH / 2, PW, PH);
      ctx.restore();
    }
    // mismo orden que arriba: fogonazos detras, llama del turbo adelante
    if (inp.fire && !run.overheat && run.fireT > 0.06) muzzles(bank);
    drawGear(run.gear, 1);
    ctx.drawImage(pl.img, -PW / 2, -PH / 2, PW, PH);
    flame(0, PH / 2 - 4, ff);
  } else {
    // fallback: sprite de rects (por si la imagen no cargó)
    px(-2, -7, 4, 5, P.bodyDark); px(-1, -8, 2, 2, P.warn);
    px(-20, -1, 40, 3, P.body); px(-20, 0, 6, 2, P.bodyDark); px(14, 0, 6, 2, P.bodyDark);
    px(-3, -3, 6, 6, P.body); px(-2, -4, 4, 2, P.canopy); px(-12, 1, 3, 2, P.accent);
    const fl = ff > 0.01 ? 2 + ff * 5 + Math.random() * (1 + ff * 2) : 0;
    if (fl > 0) { px(-2, 3, 4, fl, run.boost ? P.foam : P.accent); px(-1, 3, 2, fl * 0.6, P.accent); }
    if (inp.fire && !run.overheat && run.fireT > 0.06) { px(-16, -2, 3, 2, P.ink); px(13, -2, 3, 2, P.ink); }
  }
  // mancha de sangre sobre el morro/cabina al atropellar (temporal; hacé un sprite ensangrentado si querés)
  if (run.bloodSplat > 0.02) {
    ctx.globalAlpha = Math.min(0.9, run.bloodSplat);
    px(-4, -2, 2, 1, '#7a1010'); px(-1, -3, 1, 1, '#9a1818'); px(2, -2, 2, 1, '#8a1414');
    px(-2, 1, 1, 1, '#7a1010'); px(4, -1, 1, 1, '#9a1818'); px(0, 0, 1, 1, '#8a1414'); px(-5, 0, 1, 1, '#6a0e0e');
    ctx.globalAlpha = 1;
  }
  ctx.restore();

  // LLUVIA CONTRA EL AVION: el salpicado va DESPUES del sprite —el agua rebota sobre el avion, no
  // debajo— y en coordenadas de pantalla, con el avion como centro. La silueta se aproxima con una
  // elipse ANCHA Y CHATA: visto desde atras, el avion es sobre todo ala.
  // El centro incluye bob, vibracion y cabeceo, o sea que el salpicado tiembla con el fuselaje.
  {
    const cx = s.x + vx2 + bobX, cy = s.y - bobY + vy2 - plane.pitch * 1.8;
    // Los factores salen de MEDIR el sprite contra su frame: el frame es de 84 px con aire
    // alrededor, y las puntas de ala caen en ~0.34 de su ancho y la panza en ~0.09 de su alto.
    // Con 0.40/0.13 el agua rebotaba AL LADO del avion, no sobre el.
    // anchorSpray / drawSpray desactivados: el rebote no convencia visualmente
    //
    // DE DONDE SALEN. El 0.34 es el BORDE del ala; el hilo no nace ahi sino un poco adentro (0.24),
    // porque el vortice se enrolla sobre el extremo y no en la punta exacta — y sobre todo porque a
    // 0.34 los dos hilos nacian tan afuera que se leian despegados del avion. Y nacen ABAJO, en la
    // linea de la panza (el mismo 0.09 con el que se anclaba el rebote de lluvia): el ala esta por
    // debajo del centro del frame, y saliendo del centro los hilos flotaban sobre el fuselaje.
    // APAGADO POR AHORA. `tipTrail` queda entera y medida — se prende con esta sola linea. Es el
    // mismo criterio que el rebote de lluvia de arriba: el efecto funciona, todavia no convence.
    // tipTrail(cx, cy + spH * U * 0.09, spW * U * 0.24, bank, !!run.boost && S.state === 'play');
  }

  // mira: en el MOUSE (PC, punteria libre) o adelante del avion (tactil/legacy)
  if (S.state === 'play') {
    const vm = viewMouse();
    // MIRA FIJA: acompaña al CABECEO — si la trompa sube, el punto de mira sube; si pica, baja.
    // Se corre el punto en coordenadas de MUNDO (no en pantalla) para que la perspectiva lo
    // escale sola. Con la mira LIBRE (mouse/stick) no se toca: ahi manda el jugador.
    //
    // SE DIBUJA CON sx/sy, NO CON x/y (ver viewMouse en game.js): x/y son "a que le apuntas" —
    // llevan deshecho el giro del horizonte para desproyectar al mundo—, y usarlas para dibujar
    // despegaba el reticulo del cursor apenas el mundo se inclinaba.
    const c = vm.on ? { x: vm.sx, y: vm.sy } : proj(plane.x, plane.y + plane.pitch * AIM_PITCH, 70);
    // MIRA elegible desde el menu [M] (cfg.mira, 1..9). Si la hoja no cargo aun, reticulo vectorial.
    if (!drawMira(cfg.mira, c.x, c.y, MIRA_SIZE, vm.on ? 0.9 : 0.7)) {
      ctx.globalAlpha = 0.7;
      px(c.x - 5, c.y, 3, 1.5, P.accent); px(c.x + 3, c.y, 3, 1.5, P.accent);
      px(c.x, c.y - 5, 1.5, 3, P.accent); px(c.x, c.y + 3, 1.5, 3, P.accent);
      ctx.globalAlpha = 1;
    }
  }
}
