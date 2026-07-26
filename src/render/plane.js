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
import { P } from '../data/palette.js';
import { drawMira } from './miras.js';
import { PLANES, SHEET_NF, SHEET_FW, SHEET_FH, SHEET_BODY_H } from '../data/planes.js';
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

/** LLAMA DEL POSTQUEMADOR. Antes era UN rectangulo pálido de 4 px de ancho saliendo de la cola:
 *  a esta resolucion se leia como una barra blanca pegada al avion. Una llama en pixel art se
 *  arma por FILAS que se afinan y se enfrian hacia la punta — del blanco del nucleo al rojo
 *  apagado del final — con el largo parpadeando cuadro a cuadro. */
function flame(x, y0) {
  const COL = ['#fff6d8', '#ffe08a', '#ffb43c', '#f07c22', '#cf4d16', '#93300f'];
  const n = 4 + (Math.random() * 3 | 0);            // largo variable: la llama respira
  ctx.globalAlpha = 0.28;                           // resplandor alrededor de la tobera
  px(x - 3, y0 - 1, 6, 3, '#ffb43c');
  ctx.globalAlpha = 1;
  for (let i = 0; i < n; i++) {
    const w = Math.max(1, 4 - Math.round(i * 3 / n));   // se afina hacia la punta
    px(x - w / 2, y0 + i, w, 1, COL[Math.min(COL.length - 1, i)]);
  }
  // diamante de choque: el punto azulado de la garganta, lo que delata que es un reactor
  if (Math.random() < 0.6) px(x, y0, 1, 1, '#dff3ff');
  if (Math.random() < 0.35) px(x + (Math.random() < 0.5 ? -1 : 1), y0 + n + 1, 1, 1, '#e0761f');
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
function gear(g) {
  if (g <= 0) return;
  const TIRE = '#14181a', RIM = '#6d7679';
  // el ultimo tramo se apaga: a esa altura la rueda ya esta casi toda tapada por el ala y lo poco
  // que asoma no tiene recorrido para irse solo
  ctx.globalAlpha = Math.min(1, g * 5);
  // PATA DE PROA: una rueda mas chica todavia, que apenas asoma por debajo de la panza
  const ny = 3.4 + 3.1 * g;
  if (ny > 5.4) px(-0.5, 5.2, 1, ny - 5.2, TIRE);
  px(-1, ny, 2, 1, TIRE);
  // PRINCIPALES
  for (const sgn of [-1, 1]) {
    const gx = sgn * 4, gy = 2.6 + 3.4 * g;
    if (gy > 4.2) px(gx - 0.5, 4, 1, gy - 4, TIRE);   // pata, colgando de la raiz del ala
    px(gx - 1, gy, 2, 2, TIRE);                       // rueda
    px(gx - 1, gy, 2, 1, RIM);                        // brillo del cubo: si no, es un cuadrado negro
  }
  ctx.globalAlpha = 1;
}

// `camScale` (opcional): empujon de camara del ESCUADRON al CONTROL LIBRE — agranda SOLO el
// sprite del avion. Acercarse escalando el raster ya dibujado esta prohibido en este juego
// (parte el mar en rayas, ver CAM_ZOOMS en game.js); esta es la version que el plano puede pagar.
export function drawPlane(selPlane, viewMouse, camScale) {
  const s = proj(plane.x, plane.y, PZ);
  // SOMBRA sobre el agua (referencia de altura). Tres barras que se angostan en vez de un
  // rectangulo: a esta resolucion eso ya lee como una elipse.
  const sh = proj(plane.x, 0, PZ);
  ctx.globalAlpha = Math.max(0.08, 0.4 - plane.y * 0.009);
  px(sh.x - 9, sh.y - 1, 18, 1, '#101c1e');
  px(sh.x - 13, sh.y, 27, 1, '#101c1e');
  px(sh.x - 9, sh.y + 1, 18, 1, '#101c1e');
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
  if (rolling) {
    // PIRUETA: tonel completo — el sprite (vista trasera) rota 360° en el plano de pantalla
    const pr = 1 - run.rollT / ROLL_DUR;                   // 0→1 durante el tonel
    ctx.rotate(run.rollDir * pr * Math.PI * 2);
    ctx.scale(0.94 + 0.06 * Math.cos(pr * Math.PI * 2), 1);   // leve pulso: vende el giro
  } else if (run.mvRoll) {
    // MANIOBRA con rotacion propia: el medio tonel del split-s (queda invertido y pica asi)
    // o el sobre-banqueo del break turn. Encima, el frame de alabeo/cabeceo sigue normal.
    ctx.rotate(run.mvRoll);
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
    let img = pl.sheetImg;
    if (run.mvSteep && pl.sheet2Ok) { img = pl.sheet2Img; row = run.mvSteep > 0 ? 0 : 1; }
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
    gear(run.gear);   // DEBAJO del sprite: la pata nace dentro del ala y solo se ve lo que asoma
    ctx.drawImage(img, sx4, sy4, SHEET_FW, SHEET_FH, -spW / 2, -spH / 2, spW, spH);
    if (run.boost) flame(0, bodyH2 - 6);
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
    gear(run.gear);
    ctx.drawImage(pl.img, -PW / 2, -PH / 2, PW, PH);
    if (run.boost) flame(0, PH / 2 - 4);
  } else {
    // fallback: sprite de rects (por si la imagen no cargó)
    px(-2, -7, 4, 5, P.bodyDark); px(-1, -8, 2, 2, P.warn);
    px(-20, -1, 40, 3, P.body); px(-20, 0, 6, 2, P.bodyDark); px(14, 0, 6, 2, P.bodyDark);
    px(-3, -3, 6, 6, P.body); px(-2, -4, 4, 2, P.canopy); px(-12, 1, 3, 2, P.accent);
    const fl = run.boost ? 5 + Math.random() * 4 : (run.fuel > 0 ? 2 + Math.random() * 2 : 0);
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

  // mira: en el MOUSE (PC, punteria libre) o adelante del avion (tactil/legacy)
  if (S.state === 'play') {
    const vm = viewMouse();   // en camara CERCA la mira se dibuja en coords des-zoomeadas: queda bajo el cursor fisico
    // MIRA FIJA: acompaña al CABECEO — si la trompa sube, el punto de mira sube; si pica, baja.
    // Se corre el punto en coordenadas de MUNDO (no en pantalla) para que la perspectiva lo
    // escale sola. Con la mira LIBRE (mouse/stick) no se toca: ahi manda el jugador.
    const c = vm.on ? vm : proj(plane.x, plane.y + plane.pitch * AIM_PITCH, 70);
    // MIRA elegible desde el menu [M] (cfg.mira, 1..9). Si la hoja no cargo aun, reticulo vectorial.
    if (!drawMira(cfg.mira, c.x, c.y, MIRA_SIZE, vm.on ? 0.9 : 0.7)) {
      ctx.globalAlpha = 0.7;
      px(c.x - 5, c.y, 3, 1.5, P.accent); px(c.x + 3, c.y, 3, 1.5, P.accent);
      px(c.x, c.y - 5, 1.5, 3, P.accent); px(c.x, c.y + 3, 1.5, 3, P.accent);
      ctx.globalAlpha = 1;
    }
  }
}
