// RENDER DEL MUNDO: mar, tierra, cielo bajo (la turba y la pista), la malla de puntos del oleaje,
// la estela, los obstaculos y la barcaza objetivo acercandose en el horizonte.
//
// Todo se dibuja en coordenadas de mundo proyectadas (proj); el orquestador (draw en game.js) ya
// dejo aplicados los transforms de camara/roll/zoom antes de llamar aca. El cielo alto (degradado,
// sol, nubes, islas) y los loops de entidades del jugador siguen inline en el orquestador.

import { ctx, px, W, H, HOR, F, PZ } from './ctx.js';
import { theme } from './theme.js';
import { cam, cfg, S, plane } from '../core/state.js';
import { run } from '../core/run.js';
import { wake, obstacles, soldiers } from '../core/world.js';
import { proj } from '../core/fx.js';
import { hzWorld, tiltFade } from '../core/horizon.js';
import { P, LAND, CLAND } from '../data/palette.js';
import { SHIP_UH, SHIP_DECK, SHORE_X, shoreAt, SAND_W, portJut, PORT_AMP, PORT_FOAM, FLY_X, FLY_TOP, RADAR_ALT, SHIP_H, SPAWN_Z } from '../data/tuning.js';
import { RUNWAYS, PORT_H } from '../data/runways.js';
import { hitbox, planeBox, hullReach, HULL_Y, SOLDIER } from '../core/hitbox.js';
import { inBank, fogVis, fogTop } from '../systems/fog.js';
import { mvTight } from '../data/moves.js';
import * as boomArt from './boom.js';
import * as blastArt from './blast.js';
import * as enemyArt from './enemies.js';
import * as momentum from '../systems/momentum.js';
import * as momRender from './momentum.js';

// ---- SUELO CON GRADIENTE (tierra/costa) ----
// Antes el piso eran TRES bandas planas con cortes duros (f<0.28/0.6) y se veia artificial.
// Ahora el color se INTERPOLA por fila entre lejos/medio/cerca → un degradado continuo, y encima
// van el moteado (manchas ancladas al mundo) y la bruma de distancia.
const hex2rgb = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
function mkStops(pal) { return { far: hex2rgb(pal.far), mid: hex2rgb(pal.mid), near: hex2rgb(pal.near) }; }
/** color del suelo a profundidad f (0=horizonte, 1=primer plano), como string css */
function groundCol(st, f) {
  const [a, b, t] = f < 0.5 ? [st.far, st.mid, f / 0.5] : [st.mid, st.near, (f - 0.5) / 0.5];
  return 'rgb(' + (a[0] + (b[0] - a[0]) * t | 0) + ',' + (a[1] + (b[1] - a[1]) * t | 0) + ',' + (a[2] + (b[2] - a[2]) * t | 0) + ')';
}
/** MOTEADO: manchas claras/oscuras ancladas al MUNDO (banda de 6 unidades en wz + posicion x por
 *  hash) → parches irregulares que scrollean con el terreno, no ruido que titila. */
function groundMottle(y, wz, k, xEnd) {
  const band = Math.floor(wz / 6);
  for (let i = 0; i < 5; i++) {
    const h1 = hash2(band, i * 131);
    if (h1 < 0.45) continue;
    const wxP = (hash2(band, i * 131 + 7) * 2 - 1) * 330;
    const sxP = W / 2 + (wxP - cam.x) * k, wP = (6 + h1 * 14) * k;
    if (sxP + wP < -70 || sxP > xEnd) continue;
    ctx.globalAlpha = 0.10 + h1 * 0.06;
    px(sxP, y, Math.min(wP, xEnd - sxP), 1, h1 > 0.72 ? '#0a0c08' : '#f4eede');
  }
  ctx.globalAlpha = 1;
}
/** BRUMA de distancia: las filas pegadas al horizonte se lavan hacia el tono del cielo. */
function groundHaze(y, f, w2) {
  if (f > 0.45) return;
  ctx.globalAlpha = (0.45 - f) * 0.75;
  px(-70, y, w2, 1, theme.sky.horizon);
  ctx.globalAlpha = 1;
}

// ALTURA DE FILA del raster de suelo y mar. El mundo se dibuja en filas horizontales de 1 px, y
// con el HORIZONTE GIRATORIO el canvas rota: cada fila pasa a ser un rectangulo INCLINADO, y el
// antialias de sus bordes deja una COSTURA de medio pixel entre fila y fila. Por esas costuras se
// ve lo que hay debajo del mar, que es la IMAGEN DE FONDO del clima — y como la de atardecer es un
// desierto, el agua se llenaba de una rejilla naranja al doblar.
//
// (Es la misma familia de problema que CAM_ZOOMS en game.js, donde escalar el raster partia el mar
// en tiras. Rotar lo parte en diagonal.)
//
// La solucion es que las filas SE PISEN 1 px. Solo vale para las filas OPACAS de base: las
// translucidas —surcos, bruma— no pueden solaparse, porque el solape se pintaria dos veces y la
// costura volveria, ahora en oscuro.
let rowH = 1;

// FILAS DE MAS, POR DEBAJO DEL BORDE DE LA PANTALLA. Con el mundo girado, la esquina de abajo deja
// de estar tapada por el borde: el raster se acaba en H y aparece el CORTE del terreno, un borde
// recto con el vacio del otro lado. Antes eso se tapaba con un rectangulo de UN color plano, y ahi
// estaba el problema: en TIERRA pintaba tierra y en el resto agua, asi que en COSTA —donde la fila
// es mitad arena y mitad mar— siempre quedaba mal de un lado, y el corte se veia igual.
//
// La solucion no es tapar sino SEGUIR DIBUJANDO: son las mismas filas, con la misma geometria, un
// poco mas abajo. Suelo que en realidad esta ahi (mas cerca de la camara), solo que fuera de cuadro
// con el mundo derecho. Cada modo —mar, tierra, costa, puerto— se continua solo, sin casos nuevos.
//
// 150 sale de la geometria del giro: rotando alrededor del centro, la esquina mas lejana queda a
// hypot(W/2, H/2) = 275 px, o sea 140 px por debajo de H. Con 150 sobran 10.
const UNDER = 150;
/** Hasta que fila hay que dibujar. Solo se estira con el mundo girado: derecho no cambia nada. */
const rowEnd = () => hzWorld() ? H + UNDER : H;

// opacidad de los cuadrados del mar 2D (perilla global). Vivia en el bloque de three.js por
// vecindad historica, pero es del render 2D.
const SEA_ALPHA2D = 0.6;

// campo de altura de la superficie para la malla de puntos (ondas superpuestas). Es del RENDER
// del mar; el vuelo tiene su propio nivel de ola para el roce (waveNow, en systems/flight.js).
// campo de altura de la superficie para la malla de puntos (ondas superpuestas)
export function seaH(wx, wz) {
  return 1.0
    + Math.sin(wz * 0.035 - run.t * 1.1) * 0.9           // marejada larga que rueda hacia la cámara
    + Math.sin(wz * 0.22 + run.t * 2.2) * 0.65
    + Math.sin(wz * 0.09 - run.t * 1.5 + wx * 0.15) * 0.5
    + Math.sin(wx * 0.30 + wz * 0.05 + run.t * 1.9) * 0.35;
}

// paso en pixeles con el que se recorre la fila en la franja de orilla del puerto. 3px basta:
// la orilla es una curva suave y a menos de eso solo se gastan evaluaciones de seno.
const PORT_STEP = 3;

/** Un TRAMO horizontal de la base de despegue: suelo + pista con sus marcas. Recibe el tramo
 *  [x0,x1) porque en la franja de orilla la fila sale cortada en pedazos.
 *  El ESTILO sale de data/runways.js (cfg.runway): cambia el suelo, la superficie y las marcas.
 *  `f` es la profundidad normalizada de la fila (0 horizonte, 1 primer plano) — la usa el suelo
 *  de PASTO, que es el mismo degradado del mapa de TIERRA. */
function portRow(y, wz, k, x0, x1, f) {
  if (x1 <= x0) return;
  const R = RUNWAYS[cfg.runway] || RUNWAYS[0];
  // --- SUELO ---
  if (R.ground === 'land') {          // PASTO: el mismo campo del mapa de TIERRA, sin base
    px(x0, y, x1 - x0, rowH, groundCol(LAND_ST, f));
    if (Math.sin(wz * 0.13) + Math.sin(wz * 0.05) < -0.95) {
      ctx.globalAlpha = 0.4; px(x0, y, x1 - x0, 1, LAND.furrow); ctx.globalAlpha = 1;
    }
    groundMottle(y, wz, k, x1);
    return;                           // no hay franja de pista: se despega del campo
  }
  if (R.ground === 'asphalt') {       // ASFALTO de lado a lado: plataforma, sin banquina
    px(x0, y, x1 - x0, rowH, R.surf);
    ctx.globalAlpha = 0.16;           // juntas de las losas, cada 12 unidades
    if (Math.floor(wz / 12) % 4 === 0) px(x0, y, x1 - x0, 1, '#0a0d10');
    ctx.globalAlpha = 1;
    return;
  }
  const vl = Math.sin(wz * 0.22) + Math.sin(wz * 0.07);              // turba malvinense
  px(x0, y, x1 - x0, rowH, vl > 0.8 ? '#39402f' : vl < -0.8 ? '#2b3226' : '#323a2b');
  // --- PISTA --- solo se pinta la parte del tramo que le toca (recorte contra [x0,x1))
  const a = W / 2 + (-R.hw - cam.x) * k, b = W / 2 + (R.hw - cam.x) * k;
  const ra = Math.max(a, x0), rb = Math.min(b, x1);
  const bw = Math.max(1, 0.5 * k);
  if (rb > ra) {
    px(ra, y, rb - ra, 1, R.surf);
    if (R.center && Math.floor(wz / 9) % 2 === 0) {                  // eje discontinuo
      const ex = W / 2 + (0 - cam.x) * k - bw / 2;
      if (ex >= x0 && ex + bw <= x1) px(ex, y, bw, 1, '#9aa39b');
    }
    // FRENADAS: dos pares de manchas oscuras a los lados del eje, la marca de las ruedas al tocar.
    // Cada 24 unidades y de 3.5 de largo — se leen como huellas repetidas, no como rayado parejo.
    if (R.skid && (wz % 24) < 3.5) {
      ctx.globalAlpha = 0.3;
      for (const off of [-3.4, -2.2, 2.2, 3.4]) {
        const sxk = W / 2 + (off - cam.x) * k, wk = Math.max(1, 0.7 * k);
        if (sxk >= x0 && sxk + wk <= x1) px(sxk, y, wk, 1, '#14181a');
      }
      ctx.globalAlpha = 1;
    }
  }
  if (R.edge && Math.floor(wz / 14) % 2 === 0) {                     // balizas del borde de pista
    if (a - bw >= x0 && a <= x1) px(a - bw, y, bw, 1, P.accent);
    if (b >= x0 && b + bw <= x1) px(b, y, bw, 1, P.accent);
  }
}

/** Pared del ACANTILADO: la roca entre el borde de la meseta y el agua. Solo se dibuja cuando la
 *  base esta elevada (cfg.cliff); `f` oscurece hacia el fondo, que es lo que le da profundidad. */
function cliffFace(y, k, x0, x1, f) {
  if (x1 <= x0) return;
  const t = f < 0.35 ? 0 : f < 0.7 ? 1 : 2;
  px(x0, y, x1 - x0, rowH, ['#4a453a', '#3b382f', '#2e2c26'][t]);
  ctx.globalAlpha = 0.35;                                            // vetas verticales de la roca
  for (let sx = Math.ceil(x0 / 9) * 9; sx < x1; sx += 9) px(sx, y, Math.max(1, 0.3 * k), 1, '#22201b');
  ctx.globalAlpha = 1;
}

// ---------- NIEBLA ----------
// Se dibuja DESPUES del mundo y de los obstaculos, adentro del giro del horizonte: por eso tapa lo
// que hay que tapar sin que cada cosa tenga que saber de la niebla.
//
// DOS PIEZAS QUE SE CRUZAN, y cual manda lo decide TU ALTURA:
//
//   VELO      volando DENTRO del banco. Se pone gris con la profundidad, asi que lo que viene de
//             lejos aparece tarde. Es la pieza que ciega.
//   CUBIERTA  volando POR ENCIMA del techo. La niebla se ve como una SUPERFICIE que tapa el agua
//             y todo lo que esta bajo: volar sobre un mar de niebla. Es la pieza que te deja ver.
//
// El cruce es continuo (FOG_BLEND): no hay un salto al cruzar el techo, la niebla se abre.
//
// ⚠ QUE ARRIBA SE VEA ES UNA REGLA DE JUEGO, NO FISICA. Con una capa de 17 m y visibilidad de
// ~180, la fisica diria que trepar casi no cambia nada: la linea de vision a un mastil lejano viaja
// igual casi toda por adentro de la bruma. Se elige que trepar ABRA la vista porque es lo que hace
// del banco una DECISION —subir al radar o volar a ciegas— en vez de un filtro gris. Lo que se
// pierde es rigor; lo que se gana es que el tramo se juegue.
// El gris NO es libre: la cubierta ocupa media pantalla y el HUD se dibuja encima. Con un gris
// claro (#a3b3bb probado) los rotulos del HUD —que son tenues a proposito sobre el mar oscuro—
// se perdian. Este es lo bastante frio y oscuro para que el HUD siga leyendose, y lo bastante
// claro para que la cubierta se lea como niebla y no como una nube de humo.
const FOG_C = '#7d8d96';
const FOG_MID = '#6b7a83';
const FOG_DEEP = '#586771';
const FOG_BLEND = 3.5;   // unidades de mundo para pasar de "adentro" a "arriba del techo"

/** Cuanto estas METIDO en la niebla: 1 bien adentro, 0 en el techo o arriba. */
function fogInside() {
  if (!inBank()) return 0;
  return Math.max(0, Math.min(1, (fogTop() - plane.y) / FOG_BLEND));
}

export function drawFog() {
  const inside = fogInside();
  if (!inBank()) return;
  const yEnd = rowEnd();
  const vis = fogVis();
  // ---- CUBIERTA: la niebla vista desde arriba tapa el agua y lo que este bajo ----
  // Son las MISMAS filas del mar (un plano horizontal se proyecta igual), asi que no hay geometria
  // nueva: se pintan de gris. Cuanto mas alto vas, mas cerrada se ve la cubierta.
  const deck = 1 - inside;
  if (deck > 0.01) {
    for (let y = HOR + 1; y < yEnd; y++) {
      const f = Math.min(1, (y - HOR) / (H - HOR));
      // la cubierta se abre un poco justo abajo tuyo (mirar casi en vertical atraviesa menos bruma)
      ctx.globalAlpha = deck * (0.88 - f * 0.3);
      // y se OSCURECE hacia abajo: mirando casi en vertical se ve HACIA ADENTRO del banco, donde no
      // entra luz. Ademas de dar volumen, resuelve un problema concreto de lectura — el HUD se
      // dibuja sobre esta franja y sus rotulos, que son tenues a proposito contra el mar oscuro,
      // se perdian contra un gris parejo y claro.
      px(-70, y, W + 140, rowH, f < 0.45 ? FOG_C : f < 0.75 ? FOG_MID : FOG_DEEP);
    }
    ctx.globalAlpha = deck * 0.5;                 // el borde del techo, iluminado: lee como superficie
    px(-70, HOR + 1, W + 140, 2, '#cfdae0');
  }
  // ---- VELO: adentro, el gris crece con la profundidad ----
  if (inside > 0.01) {
    for (let y = HOR + 1; y < yEnd; y++) {
      const z = cam.y * F / (y - HOR);
      // niebla exponencial: la de siempre. A z = vis queda en 63%, a 2*vis en 86%.
      ctx.globalAlpha = inside * Math.min(0.96, 1 - Math.exp(-z / vis));
      px(-70, y, W + 140, rowH, FOG_C);
    }
    // el cielo tambien: adentro de un banco no se ve el horizonte, se ve gris
    ctx.globalAlpha = inside * 0.9;
    px(-70, -140, W + 140, HOR + 142, FOG_C);
  }
  ctx.globalAlpha = 1;
}

export function drawSea() {
  rowH = hzWorld() ? 2 : 1;   // ver rowH: con el mundo derecho no cambia NADA del dibujo de siempre
  const landMode = cfg.terrain === 'land';
  const coastMode = cfg.terrain === 'coast';
  const dv = run.dist + momentum.drift();   // distancia VISUAL (drift del momentum incluido)
  // sin base de despegue (misiones de REGRESO) no hay tierra al principio del mapa
  const landVisible = cfg.start !== 'air' && dv < cfg.coast + 80;
  // ACANTILADO: la base esta sobre una MESETA a PORT_H. Para el raster eso es simplemente otra
  // altura de suelo: la camara la ve desde (cam.y - PORT_H) en vez de cam.y, asi que a una misma
  // fila de pantalla la meseta cae MAS CERCA en z que el mar. La pared del acantilado son las
  // filas donde ya pasaste el borde de la meseta pero el mar de esa fila todavia esta detras.
  // Sin acantilado camH === cam.y, zP === z, y esas filas no existen: el caso degenera al de antes.
  const camH = cfg.cliff ? cam.y - PORT_H : cam.y;
  const yEnd = rowEnd();
  for (let y = HOR + 1; y < yEnd; y++) {
    const dy = y - HOR;
    const z = cam.y * F / dy;
    const wz = z + dv;
    const wzP = camH > 0.3 ? camH * F / dy + dv : 1e9;   // meseta (o el mismo suelo si no hay acantilado)
    // La profundidad normalizada se CLAVA en 1 pasando el borde: es la que elige el color del
    // degradado, y extrapolarla mas alla del primer plano da colores fuera de la rampa.
    const fRow = Math.min(1, dy / (H - HOR));
    if (landVisible && wzP < cfg.coast - PORT_AMP) {   // fila ENTERA de meseta: sin recorrer columnas
      portRow(y, wzP, F / (wzP - dv), -70, W + 70, fRow);
      continue;
    }
    if (landVisible && wz < cfg.coast + PORT_AMP + PORT_FOAM) {
      // FRANJA DE ORILLA: la salida del puerto no es una linea recta — a esta profundidad hay
      // columnas que todavia son tierra y otras que ya son agua. Se recorre la fila en pasos de
      // PORT_STEP px y se pintan TRAMOS, en vez de partir la fila en un punto (que es lo que se
      // puede hacer en COSTA, donde el corte es uno solo por fila).
      const k = F / z, kP = F / (wzP - dv);
      const f = fRow;   // ya viene clampeado en 1 (ver fRow)
      px(-70, y, W + 140, rowH, f < 0.22 ? theme.water.base0 : f < 0.5 ? theme.water.base1 : theme.water.base2);
      let land0 = null, rock0 = null, foam0 = null;
      const flush = (sx) => {
        if (land0 !== null) { portRow(y, wzP, kP, land0, sx, f); land0 = null; }
        if (rock0 !== null) { cliffFace(y, k, rock0, sx, f); rock0 = null; }
        if (foam0 !== null) { px(foam0, y, sx - foam0, 1, P.foam); foam0 = null; }
      };
      for (let sx = -70; sx <= W + PORT_STEP; sx += PORT_STEP) {
        // la orilla se evalua en la x de MUNDO de cada plano: la meseta con su propia escala
        const edgeP = cfg.coast + portJut((sx - W / 2) / kP + cam.x);
        const edge = cfg.coast + portJut((sx - W / 2) / k + cam.x);
        const cls = wzP < edgeP ? 1                       // meseta / pista
          : wz < edge ? 3                                 // pared del acantilado
            : wz < edge + PORT_FOAM ? 2                   // rompiente
              : 0;                                        // mar
        if (cls === 1) { if (land0 === null) { flush(sx); land0 = sx; } }
        else if (cls === 3) { if (rock0 === null) { flush(sx); rock0 = sx; } }
        else if (cls === 2) { if (foam0 === null) { flush(sx); foam0 = sx; } }
        else flush(sx);
      }
      flush(W + 70);
      continue;
    }
    if (landMode) {                                                      // TIERRA: gradiente continuo
      const f = fRow;   // ya viene clampeado en 1 (ver fRow)
      const k = F / z;
      px(-70, y, W + 140, rowH, groundCol(LAND_ST, f));
      if (Math.sin(wz * 0.13) + Math.sin(wz * 0.05) < -0.95) {           // surco SUAVE (antes corte duro)
        ctx.globalAlpha = 0.4; px(-70, y, W + 140, 1, LAND.furrow); ctx.globalAlpha = 1;
      }
      groundMottle(y, wz, k, W + 70);
      groundHaze(y, f, W + 140);
      continue;
    }
    if (coastMode) {
      // COSTA: cada fila se parte en la LINEA DE COSTA — que SERPENTEA (shoreAt(wz), senos en
      // coordenadas de mundo): tierra arenosa a la izquierda, playa ancha, rompiente, y mar.
      const k = F / z;
      const shoreW = shoreAt(wz);
      const sandSx = W / 2 + (shoreW - SAND_W - cam.x) * k;
      const shoreSx = W / 2 + (shoreW - cam.x) * k;
      const f = fRow;   // ya viene clampeado en 1 (ver fRow)
      px(-70, y, Math.max(0, sandSx + 70), rowH, groundCol(CLAND_ST, f));
      if (Math.sin(wz * 0.13) + Math.sin(wz * 0.05) < -0.95) {
        ctx.globalAlpha = 0.4; px(-70, y, Math.max(0, sandSx + 70), 1, CLAND.furrow); ctx.globalAlpha = 1;
      }
      groundMottle(y, wz, k, sandSx);
      // playa: arena mojada cerca del agua, seca contra la tierra
      const sandW2 = Math.max(1, shoreSx - sandSx);
      px(sandSx, y, sandW2, 1, f < 0.4 ? '#7d7154' : '#8f8163');
      px(sandSx + sandW2 * 0.62, y, sandW2 * 0.38, 1, f < 0.4 ? '#6d6350' : '#7c7260');   // franja humeda
      px(shoreSx, y, Math.max(0, W + 70 - shoreSx), 1, f < 0.22 ? theme.water.base0 : f < 0.5 ? theme.water.base1 : theme.water.base2);
      // rompiente: espuma que respira contra la arena
      ctx.globalAlpha = 0.35 + 0.35 * Math.max(0, Math.sin(wz * 0.35 - run.t * 2.6));
      px(shoreSx - 1, y, 2.5, 1, P.foam);
      ctx.globalAlpha = 1;
      groundHaze(y, f, W + 140);   // la bruma cruza tierra, playa y agua: unifica la escena
      continue;
    }
    // base oscura del mar (degradado por profundidad) para que los puntos resalten
    const f = fRow;   // ya viene clampeado en 1 (ver fRow)
    px(-70, y, W + 140, rowH, f < 0.22 ? theme.water.base0 : f < 0.5 ? theme.water.base1 : theme.water.base2);
  }
  if (landMode) drawLand();
  else if (coastMode) {
    drawLand(true);                    // matas SECAS, solo del lado de tierra (limite por fila)
    drawSeaDots(landVisible, true);    // oleaje solo del lado del agua (limite por fila)
    drawFleet();                       // la flota de desembarco en el horizonte
  } else drawSeaDots(landVisible);
}

// FLOTA BRITANICA en el horizonte (decorado del mapa COSTA): siluetas fondeadas mar adentro,
// del lado del agua. Parallax suave — son el telon del desembarco, las barcazas salen de aca.
function drawFleet() {
  ctx.globalAlpha = 0.85;
  for (let i = 0; i < 3; i++) {
    const bx = W * 0.66 + i * 62 - cam.x * 1.6 + Math.sin(i * 3.7) * 14;
    if (bx < W * 0.58) continue;                       // nunca sobre la tierra (la orilla serpentea)
    const bw = 30 - i * 5;
    px(bx, HOR - 2.5, bw, 2.5, '#39424a');                          // casco
    px(bx + bw * 0.32, HOR - 5, bw * 0.2, 2.5, '#465059');          // superestructura
    px(bx + bw * 0.6, HOR - 4, Math.max(1, bw * 0.05), 1.5, '#465059');   // mastil
  }
  ctx.globalAlpha = 1;
}

// hash entero → [0,1). Bien distribuido (a diferencia de sin(combinación lineal), que hace bandas
// diagonales/moiré). Estable por celda del mundo: los matojos no titilan ni se mueven al volar.
function hash2(a, b) {
  let h = Math.imul(a | 0, 374761393) ^ Math.imul(b | 0, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

const LAND_ST = mkStops(LAND), CLAND_ST = mkStops(CLAND);   // gradientes precalculados del suelo

// paleta de matojos: varios verdes + un par secos/amarillentos, para que el pasto no sea monocromo.
// TUFT_TIP es la punta iluminada de cada uno (mismo índice) → le da volumen en vez de ser un rect plano.
const TUFTS = ['#6d7748', '#7c8a4e', '#5a6a3c', '#8a8c52', '#4f6034', '#94925a'];
const TUFT_TIP = ['#899366', '#98a66a', '#748558', '#a6a870', '#6a7c50', '#b0ae78'];

// matas/rocas dispersas sobre la tierra (parallax de movimiento a ras del suelo). La posición y el
// color salen de un hash por celda: distribución aleatoria de verdad (sin patrón) y colores variados.
// pasto seco de la costa (arenoso, casi sin verde) — mismo indice que TUFTS
const TUFTS_DRY = ['#948a5e', '#a2966a', '#867a52', '#b0a276', '#7c7150', '#a89a66'];
const TUFT_TIP_DRY = ['#b1a67a', '#c0b386', '#a2966c', '#cdbf92', '#988c68', '#c4b682'];

function drawLand(coastMode) {
  // pasos DIVIDIDOS por U al subir la resolucion: sin esto se dibujaria la misma cantidad de
  // matas pero 1.5x mas grandes (misma imagen agrandada). Bajarlos es lo que convierte los
  // pixeles nuevos en densidad real.
  const SPX = 2.8, SPZ = 2.8, farZ = 190;
  const dv = run.dist + momentum.drift();
  const startZ = Math.max(cfg.coast + 2, Math.ceil((dv + 4) / SPZ) * SPZ);
  for (let wz = startZ; wz < dv + farZ; wz += SPZ) {
    const iz = Math.round(wz / SPZ);
    // ANCHO por profundidad: en coordenadas de mundo, cuánto hay que barrer para tapar TODO el
    // ancho de pantalla a esta fila (antes era fijo ±74 → dejaba huecos en los bordes lejanos).
    // +20px de margen; tope de 340 para no iterar de más en la banda del horizonte.
    const halfW = Math.min(340, (W / 2 + 20) * (wz - dv) / F);
    // costa: el limite es LA ORILLA de esta fila (serpentea) menos el ancho de playa
    const wxEnd = coastMode ? Math.min(cam.x + halfW, shoreAt(wz) - SAND_W - 0.5) : cam.x + halfW;
    for (let wx = Math.ceil((cam.x - halfW) / SPX) * SPX; wx < wxEnd; wx += SPX) {
      const ix = Math.round(wx / SPX);
      const h1 = hash2(ix, iz);
      if (h1 < 0.5) continue;                                            // densidad dispersa
      const h2 = hash2(ix + 1013, iz - 271), h3 = hash2(ix - 577, iz + 977);
      // JITTER: se corre la mata dentro de su celda → rompe la grilla (esto mata el look de patrón)
      const jx = wx + (h2 - 0.5) * SPX * 1.7, jz = wz + (h3 - 0.5) * SPZ * 1.7;
      const camZ = jz - dv;
      if (camZ < 2) continue;
      const k = F / camZ;
      const fade = Math.min(1, (camZ - 3) / 9) * (1 - (camZ / farZ) * 0.8);
      if (fade <= 0.03) continue;
      const s = proj(jx, 0, camZ);
      if (s.x < -4 || s.x > W + 4 || s.y < HOR) continue;
      ctx.globalAlpha = fade * 0.85;
      if (h1 > 0.93) {                                                   // roca ocasional (con volumen)
        const w = Math.max(1, k * 0.75), hh = Math.max(1, k * 0.55), rx = s.x - w / 2, ry = s.y - hh;
        px(rx, ry, w, hh, LAND.rock);
        px(rx, ry, w, Math.max(1, hh * 0.4), '#6b6552');                 // cara iluminada (arriba)
        px(rx, s.y - Math.max(1, hh * 0.28), w, Math.max(1, hh * 0.28), '#3a3529');   // sombra (base)
      } else {                                                          // matojo de pasto
        const TF = coastMode ? TUFTS_DRY : TUFTS, TT = coastMode ? TUFT_TIP_DRY : TUFT_TIP;
        const ci = (h3 * TF.length) | 0;
        const w = Math.max(1, k * 0.55), hh = Math.max(1, k * (0.65 + h2 * 0.6));
        const bx = s.x - w / 2, by = s.y - hh;
        px(bx, by, w, hh, TF[ci]);                                       // cuerpo
        px(bx, by, w, Math.max(1, hh * 0.4), TT[ci]);                    // punta iluminada
        if (k > 3) {                                                    // cerca: briznas que se abren
          px(bx - Math.max(1, w * 0.4), s.y - hh * 0.7, Math.max(1, w * 0.34), hh * 0.7, TF[ci]);
          px(bx + w, s.y - hh * 0.85, Math.max(1, w * 0.34), hh * 0.85, TT[ci]);
        }
      }
    }
  }
  ctx.globalAlpha = 1;
}

// malla de puntos que forma la onda del mar en perspectiva (estilo boostivity)
function drawSeaDots(landVisible, coastMode) {
  const SPX = 0.93, SPZ = 1.0, farZ = 190;  // densidad x4, y ademas /U al subir la resolucion
  const dv = run.dist + momentum.drift();
  const startZ = Math.ceil((dv + 4) / SPZ) * SPZ;
  // paso ADAPTATIVO: cerca muestrea a SPZ/SPX plenos; lejos el paso crece para mantener
  // ~1px de separacion en pantalla (los puntos subpixel no se ven y este loop corre
  // TODO el vuelo — el mar es 2D siempre fuera del momentum)
  let wz = startZ;
  while (wz < dv + farZ) {
    const camZ = wz - dv;
    wz += Math.max(SPZ, camZ * camZ * 0.0019);
    // sin puntos sobre tierra ni rompiente. La orilla del puerto SERPENTEA (portJut), asi que a
    // esta profundidad puede haber columnas de agua y columnas de tierra: solo se descarta la fila
    // entera cuando esta toda del lado de tierra; el resto se decide adentro, por columna.
    if (landVisible && wz < cfg.coast - PORT_AMP) continue;
    const k = F / camZ;
    const fade = Math.min(1, (camZ - 3) / 9) * (1 - (camZ / farZ) * 0.8);
    if (fade <= 0.03) continue;
    const dotW = Math.max(1, k * 0.12);   // 1/4 del tamaño clasico (0.48)
    // franja acorde al FRUSTUM: el ancho visible crece con la distancia (antes era ±74 fijo
    // y el mar quedaba "cortito" a lo lejos, p.ej. detras de la pista durante el despegue)
    const half = Math.min(320, (W / 2 + 10) * camZ / F + 6);
    const xL = coastMode ? Math.max(cam.x - half, shoreAt(wz) + 1) : cam.x - half, xR = cam.x + half;   // costa: solo lado agua
    const sx3 = Math.max(SPX, camZ * 0.011);                   // paso x adaptativo (~1px)
    const x0 = Math.ceil(xL / sx3) * sx3;
    const portRow2 = landVisible && wz < cfg.coast + PORT_AMP + PORT_FOAM;
    for (let wx = x0; wx < xR; wx += sx3) {
      if (portRow2 && wz < cfg.coast + portJut(wx) + PORT_FOAM) continue;
      const h = seaH(wx, wz);
      const s = proj(wx, h, camZ);
      if (s.x < -4 || s.x > W + 4 || s.y < HOR - 2) continue;
      let hn = (h + 1.4) / 4.8;                              // altura normalizada ~0..1
      hn = hn < 0 ? 0 : hn > 1 ? 1 : hn;
      // bandas de luz que viajan por la superficie (movimiento visible aun en la distancia)
      const shimmer = Math.sin(wz * 0.06 - run.t * 2.6 + wx * 0.045);
      if (shimmer > 0.6) hn = Math.min(1, hn + 0.24);
      const col = hn > 0.72 ? theme.water.crest : hn > 0.42 ? theme.water.mid : theme.water.deep;
      // OPACIDAD por cuadrado = SEA_ALPHA2D (perilla global, 0.5) x fade (entrada 3..12u y
      // caida por lejania) x altura de ola: 0.25 de piso en el valle + hasta 0.6 por la
      // cresta (hn 0..1) + 0.15 si lo cruza una banda de luz → rango 12%..50%
      ctx.globalAlpha = SEA_ALPHA2D * fade * (0.25 + hn * 0.6 + (shimmer > 0.6 ? 0.15 : 0));
      px(s.x - dotW / 2, s.y, dotW, dotW, col);
      // destello en las crestas cercanas (titileo determinista, sin flicker feo)
      if (hn > 0.78 && k > 1.6 && Math.sin(wx * 12.9 + wz * 7.3 + run.t * 6) > 0.7) {
        ctx.globalAlpha = SEA_ALPHA2D * fade * 0.55;   // destello de cresta, tambien bajo la perilla
        px(s.x - dotW / 2 - 1, s.y - 1, dotW + 2, Math.max(1, dotW * 0.6), theme.water.spark);
      }
    }
  }
  ctx.globalAlpha = 1;
}

// ESTELA del avion sobre el agua. Antes cada punto eran tres barras planas identicas y la
// estela se leia como tres rieles paralelos. El agua batida tiene CICLO DE VIDA: el centro
// recien batido es una lengua blanca con cresta; los brazos de la V se acortan y se apagan a
// medida que envejecen; y lo viejo se disuelve en MOTAS de espuma sueltas (con posicion fija
// por punto — wp.seed — para que no titilen cuadro a cuadro).
export function drawWake() {
  for (const wp of wake) {
    const trail = PZ - wp.z;                       // metros que quedaron atrás
    const s = proj(wp.x, 0, wp.z);
    const spread = (0.6 + trail * 0.34) * s.k;     // apertura de la V
    const age = Math.min(1, trail / 11);           // 0 = recien batida · 1 = por disolverse
    const a = Math.min(0.85, wp.i * (0.3 + trail * 0.055)) * (1 - age * 0.45);
    if (a <= 0.02) continue;
    // CENTRO batido: solo mientras es fresco — lengua de espuma con cresta blanca encima
    if (age < 0.35) {
      ctx.globalAlpha = a;
      px(s.x - s.k * 0.8, s.y, s.k * 1.6, Math.max(1, s.k * 0.25), P.foam);
      ctx.globalAlpha = a * 0.7;
      px(s.x - s.k * 0.45, s.y - 1, Math.max(1, s.k * 0.9), 1, '#f2f7fb');
    }
    // BRAZOS de la V: cresta clara con espuma corrida un pixel abajo y afuera (le da relieve);
    // el dash se acorta al envejecer — la V se deshilacha en vez de seguir siendo un riel
    const alen = Math.max(1, s.k * (1.5 - age * 0.8));
    for (const sg of [-1, 1]) {
      const ax = s.x + sg * spread;
      ctx.globalAlpha = a;
      px(ax - alen / 2, s.y, alen, 1, P.crest);
      ctx.globalAlpha = a * 0.5;
      px(ax - alen / 2 + sg, s.y + 1, Math.max(1, alen * 0.7), 1, P.foam);
    }
    // MOTAS: espuma suelta entre los brazos cuando la estela ya envejecio. Posicion por hash del
    // seed — estable entre cuadros, distinta entre puntos.
    if (age > 0.3) {
      const sd = wp.seed || 0;
      for (let i = 0; i < 2; i++) {
        const h = Math.sin(sd * 12.9898 + i * 78.233) * 43758.5453;
        const fx = (h - Math.floor(h)) * 2 - 1;
        ctx.globalAlpha = a * (0.9 - i * 0.3);
        px(s.x + fx * spread * 0.85, s.y + (i % 2), 1, 1, i ? P.foam : P.crest);
      }
    }
  }
  ctx.globalAlpha = 1;
}

// BARRA DE VIDA de los enemigos que aguantan mas de un tiro. Los de un solo tiro (globo) no la
// llevan: seria ruido. Aparece cuando ya estan lo bastante cerca como para tirarles, y se queda
// visible (y opaca) apenas los tocaste, para que se lea el progreso de la rafaga.
function drawHpBar(sx, sy, k, o) {
  if (!o.hpMax || o.hpMax <= 1) return;
  const hurt = o.hp < o.hpMax;
  if (!hurt && o.z > 170) return;              // intacto y lejos: todavia no molesta
  const w = 7 * k, h = Math.max(1, 0.5 * k), f = Math.max(0, o.hp / o.hpMax);
  ctx.globalAlpha = hurt ? 1 : 0.5;            // intacto: tenue, no grita
  px(sx - w / 2, sy, w, h, '#0a0e11cc');
  px(sx - w / 2, sy, w * f, h, P.warn);        // SIEMPRE roja: la barra es "enemigo", no un semaforo
  ctx.globalAlpha = 1;
}

// ---- PERILLAS de las aeronaves enemigas (puro render: no tocan hitboxes ni puntaje) ----
// EFECTO DE CERCANIA: ademas del escorzo de la perspectiva (k), las aeronaves llevan un zoom
// EXTRA que arranca chico en el horizonte y crece al acercarse, con ease-in para que el salto se
// sienta sobre el final ("se me viene encima"). Es arcade, no realista.
// El efecto arranca en la PROFUNDIDAD DE APARICION: asi el crecimiento cubre todo el viaje del
// bicho en vez de quedar clavado en el minimo durante el primer tercio (con FAR=200 y spawn a
// 320, los primeros 120 de acercamiento no cambiaban de tamaño y se leian como un sprite fijo).
const APPROACH_FAR = SPAWN_Z, APPROACH_NEAR = 40;   // z donde arranca y donde llega al maximo
// MIN pasó de 0.6 a 0.85. El 0.6 le comia el 40% del tamaño justo cuando mas falta hacia verlo:
// medido, un helicoptero entraba en pantalla con 3.7 px de ancho pegado a la linea del horizonte.
// Sigue habiendo swell de cercania (0.85 → 1.12, un 32%), que es lo que daba el "se me viene
// encima" — lo que se saco es el castigo a la lectura lejana, no el efecto.
const APPROACH_MIN = 0.85, APPROACH_MAX = 1.12;   // multiplicador de escala lejos / encima
// VIRAJE DEL HELICOPTERO: lejos viene DE FRENTE y al acercarse se pone DE COSTADO.
const HELO_TURN_FAR = 150, HELO_TURN_NEAR = 55;  // z donde empieza y donde termina el viraje

const clamp01 = v => Math.max(0, Math.min(1, v));

/** Zoom extra por cercania. Es SOLO visual: la colision y la punteria siguen usando el mundo
 *  (o.x/o.y/o.z), asi que agrandar o achicar el dibujo no cambia la dificultad real. */
function approachZoom(z) {
  const c = clamp01((APPROACH_FAR - z) / (APPROACH_FAR - APPROACH_NEAR));
  return APPROACH_MIN + (APPROACH_MAX - APPROACH_MIN) * c * c;
}

// FOGONAZO al recibir un impacto que NO mata. Sin esto, subirle la vida a los enemigos los vuelve
// esponjas: tiras, pegas y no pasa nada visible. Se resuelve con la marca de tiempo que deja la
// colision (o.hitT) contra el reloj del run — no necesita reloj ni decaimiento propio.
function hitFlash(sx, sy, k, o, w, h) {
  if (!o.hitT || run.t - o.hitT > 0.09) return;
  ctx.globalAlpha = 0.5;
  px(sx - w / 2 * k, sy - h / 2 * k, w * k, h * k, P.ink);
  ctx.globalAlpha = 1;
}

export function drawObstacle(o) {
  const k = F / o.z;
  if (o.type === 'mast') {
    // SIN PALO. Durante mucho tiempo esto fue un mastil de 11 a 28 metros con su verga cruzada y
    // la luz en la punta, y el casco horneado dibujado al pie. El palo era el obstaculo real del
    // mar abierto — pero tambien era lo que hacia que las fragatas se leyeran como postes
    // clavados en el agua en vez de como buques. Ahora se dibuja el BUQUE, y lo unico que queda
    // de aquel palo es la luz roja de tope, arriba de la superestructura.
    const base = proj(o.x, 0, o.z);
    if (enemyArt.ready('fragata')) {
      enemyArt.drawFrame(ctx, 'fragata', 0, 0, base.x, { bottomY: base.y }, k, o.vx < 0);
      // ESTELA de proa: la fragata NAVEGA (cfg.enemyMove) — sin espuma parece fondeada
      if (o.vx) {
        ctx.globalAlpha = 0.45;
        px(base.x - 5.6 * k, base.y - 0.3 * k, 11.2 * k, Math.max(1, 0.4 * k), P.foam);
        ctx.globalAlpha = 1;
      }
    } else {
      // RESPALDO (hoja sin cargar / build web): silueta de fragata a mano. Llega justo a SHIP_H,
      // igual que la hoja horneada — el dibujo y la caja de colision no pueden discutir.
      px(base.x - 5.5 * k, base.y - 2.4 * k, 11 * k, 2.4 * k, P.bodyDark);                    // casco
      px(base.x - 5.5 * k, base.y - 2.4 * k, 11 * k, Math.max(1, 0.6 * k), '#5c6e73');        // cubierta
      px(base.x - 2 * k, base.y - SHIP_H * k, 4 * k, (SHIP_H - 2.4) * k, P.bodyDark);         // castillo
    }
    // LUZ ROJA DE TOPE, en el techo de la superestructura. Hereda el trabajo que hacia el palo:
    // a z=250 la fragata entra en pantalla como un puñado de pixeles, y este punto es lo que te
    // avisa que ahi adelante hay un barco. LATE, y cada una en su fase (o.ph), porque una luz fija
    // de 1 px se pierde contra el moteado del oleaje.
    const lit = 0.5 + 0.5 * Math.sin(run.t * 2.4 + o.ph);
    const ly = base.y - SHIP_H * k;
    ctx.globalAlpha = 0.3 * lit;
    px(base.x - 1.1 * k, ly - 1.1 * k, 2.2 * k, 2.2 * k, P.warn);                             // halo
    ctx.globalAlpha = 1;
    px(base.x - 0.35 * k, ly - 0.35 * k, Math.max(1, 0.7 * k), Math.max(1, 0.7 * k), lit > 0.7 ? '#ffd3c4' : P.warn);
  } else if (o.type === 'balloon') {
    const oy = o.y + Math.sin(run.t * 1.3 + o.ph) * 0.6;
    // el cable queda ANCLADO en xa mientras el globo se pasea (cfg.enemyMove): el globo se
    // INCLINA sobre su cable — el paseo se lee como viento, no como un globo que flota suelto
    const s = proj(o.x, oy, o.z), base = proj(o.xa !== undefined ? o.xa : o.x, 0, o.z);
    ctx.strokeStyle = P.bodyDark; ctx.beginPath();
    ctx.moveTo(s.x, s.y + 1.6 * k); ctx.lineTo(base.x, base.y); ctx.stroke();
    if (enemyArt.ready('balloon')) {
      // TAMBALEO: 3 poses de rolido, cicladas despacio y desfasadas por globo (o.ph)
      const wob = Math.sin(run.t * 1.2 + o.ph * 3);
      enemyArt.drawFrame(ctx, 'balloon', wob > 0.4 ? 2 : wob < -0.4 ? 0 : 1, 0, s.x, { centerY: s.y }, k, false);
    } else {
      px(s.x - 2.6 * k, s.y - 1.6 * k, 5.2 * k, 3.2 * k, P.dim);
      px(s.x - 2.6 * k, s.y - 1.6 * k, 5.2 * k, Math.max(1, 1.1 * k), P.body);
      px(s.x + 1.8 * k, s.y - 0.4 * k, 1.8 * k, Math.max(1, 1.1 * k), P.bodyDark);
    }
  } else if (o.type === 'helo') {
    const oy = o.y + Math.sin(run.t * 2 + o.ph) * 0.8;
    const s = proj(o.x, oy, o.z);
    const kk = k * approachZoom(o.z);
    // VIRAJE: yaw 0 = viene de frente (cuerpo angosto, cola escondida detras) · yaw 1 = de costado
    // (cuerpo entero y cola extendida). No son dos dibujos: es UNO que se estira por escorzo.
    const yaw = clamp01((HELO_TURN_FAR - o.z) / (HELO_TURN_FAR - HELO_TURN_NEAR));
    const dir = o.ph > 3 ? 1 : -1;                     // hacia que lado se abre (fijo por bicho)
    if (enemyArt.ready('helo')) {
      // HOJA HORNEADA: columna por yaw (0 = de frente → 7 = de perfil), fila por fase del rotor
      // (dos poses alternando = el rotor BATE). La hoja tiene la cola hacia la IZQUIERDA a yaw
      // pleno, asi que se espeja cuando este helo abre hacia la derecha.
      const col = Math.round(yaw * (enemyArt.SHEETS.helo.cols - 1));
      const row = ((run.t * 16) | 0) % 2;
      const fl = !!(o.hitT && run.t - o.hitT < 0.09);   // impacto: el sprite entero destella
      enemyArt.drawFrame(ctx, 'helo', col, row, s.x, { centerY: s.y }, kk, dir > 0, fl);
      drawHpBar(s.x, s.y - 3.8 * kk, kk, o);
      return;
    }
    const bodyW = (2.6 + 3.4 * yaw) * kk;              // 2.6 de frente → 6.0 de costado
    const bodyH = 2 * kk;
    // cabina/cuerpo
    px(s.x - bodyW / 2, s.y - bodyH * 0.45, bodyW, bodyH, P.bodyDark);
    px(s.x - bodyW / 2, s.y - bodyH * 0.45, bodyW, Math.max(1, 0.5 * kk), P.body);   // brillo superior
    // COLA: crece desde atras del cuerpo a medida que se pone de costado
    const tail = 3.2 * kk * yaw;
    if (tail > 0.6) {
      const tx0 = s.x + dir * bodyW / 2;
      px(Math.min(tx0, tx0 + dir * tail), s.y - 0.25 * kk, tail, Math.max(1, 0.7 * kk), P.bodyDark);
      if (yaw > 0.45) px(tx0 + dir * tail - (dir < 0 ? 0.9 * kk : 0), s.y - 1.4 * kk, Math.max(1, 0.9 * kk), 1.8 * kk, P.bodyDark);  // deriva de cola
    }
    // canopy: centrado de frente (mirandote) → corrido al morro cuando esta de costado
    const cw = (1.7 - 0.3 * yaw) * kk;
    px(s.x - dir * (bodyW * 0.5 - cw * 0.7) * yaw - cw / 2, s.y - bodyH * 0.35, cw, Math.max(1, 0.8 * kk), P.canopy);
    // patines
    px(s.x - bodyW * 0.42, s.y + bodyH * 0.6, bodyW * 0.84, Math.max(1, 0.35 * kk), '#2b3338');
    // rotor: disco visto de canto — barrido rapido, siempre ancho
    const r = Math.sin(run.t * 40) * 4;
    px(s.x - (4.6 + r * 0.2) * kk, s.y - 2.1 * kk, (9.2 + r * 0.4) * kk, Math.max(1, 0.4 * kk), P.body);
    px(s.x - 0.35 * kk, s.y - 2.3 * kk, Math.max(1, 0.7 * kk), 0.9 * kk, '#2b3338');   // mastil
    hitFlash(s.x, s.y - 0.4 * kk, kk, o, 8, 3.4);
    drawHpBar(s.x, s.y - 3.8 * kk, kk, o);      // sobre el rotor
  } else if (o.type === 'jet') {
    // avion enemigo de frente: alas anchas, fuselaje central, canopy, deriva y leve alabeo
    const oy = o.y + Math.sin(run.t * 1.6 + o.ph) * 0.5;
    const s = proj(o.x, oy, o.z);
    const kk = k * approachZoom(o.z);   // arranca chiquito en el horizonte y se agranda encima
    if (enemyArt.ready('jet')) {
      // HOJA HORNEADA: 5 columnas de alabeo. Si el caza TEJE (cfg.enemyMove), el alabeo sale de
      // su velocidad lateral real — banquea hacia donde va, como un avion. Quieto, respira con
      // el seno de siempre.
      const roll = o.mvA ? Math.cos(run.t * o.mvW + o.ph) : Math.sin(run.t * 1.1 + o.ph);
      const col = Math.round((roll * 0.5 + 0.5) * (enemyArt.SHEETS.jet.cols - 1));
      const fl = !!(o.hitT && run.t - o.hitT < 0.09);   // impacto: el sprite entero destella
      enemyArt.drawFrame(ctx, 'jet', col, 0, s.x, { centerY: s.y }, kk, false, fl);
      if (o.fireT && run.t - o.fireT < 0.1) {         // fogonazos en las raices del ala
        for (const sg of [-1, 1]) {
          px(s.x + sg * 1.9 * kk - 0.5 * kk, s.y - 0.2 * kk, kk, Math.max(1, 0.8 * kk), P.accent);
          px(s.x + sg * 1.9 * kk - 0.25 * kk, s.y - 0.05 * kk, Math.max(1, 0.5 * kk), Math.max(1, 0.4 * kk), '#fff2c8');
        }
      }
      drawHpBar(s.x, s.y - 4.4 * kk, kk, o);
      return;
    }
    const bank = Math.sin(run.t * 1.1 + o.ph) * 0.7;          // metros de alabeo en las puntas
    px(s.x - 5 * kk, s.y - bank * kk - 0.45 * kk, 5 * kk, 0.9 * kk, P.body);   // ala izquierda
    px(s.x, s.y + bank * kk - 0.45 * kk, 5 * kk, 0.9 * kk, P.body);   // ala derecha
    px(s.x - 5 * kk, s.y - bank * kk + 0.45 * kk, 5 * kk, 0.5 * kk, P.bodyDark);
    px(s.x, s.y + bank * kk + 0.45 * kk, 5 * kk, 0.5 * kk, P.bodyDark);
    px(s.x - 5 * kk, s.y - bank * kk - 0.45 * kk, 1 * kk, 0.9 * kk, P.dim);    // puntas de ala
    px(s.x + 4 * kk, s.y + bank * kk - 0.45 * kk, 1 * kk, 0.9 * kk, P.dim);
    px(s.x - 1.1 * kk, s.y - 1.5 * kk, 2.2 * kk, 3 * kk, P.bodyDark);          // fuselaje
    px(s.x - 0.9 * kk, s.y - 1.2 * kk, 1.8 * kk, 2.4 * kk, P.body);
    px(s.x - 0.7 * kk, s.y - 1.1 * kk, 1.4 * kk, 1 * kk, P.canopy);            // canopy
    px(s.x - 0.35 * kk, s.y - 3 * kk, 0.8 * kk, 1.6 * kk, P.bodyDark);         // deriva
    px(s.x - 0.4 * kk, s.y - 1.5 * kk, 0.8 * kk, 0.8 * kk, P.warn);            // nariz
    hitFlash(s.x, s.y - 0.6 * kk, kk, o, 10, 4.2);
    drawHpBar(s.x, s.y - 4.4 * kk, kk, o);                                     // sobre la deriva
  } else if (o.type === 'cliff') {
    // ACANTILADO: masa de roca que sale del terreno. NO se destruye (no lleva hp: las balas lo
    // ignoran) — es puro relieve para esquivar. La silueta se arma con LAJAS de distinto alto
    // sorteadas del `seed` del objeto: la cresta queda quebrada y estable (no titila), y ningun
    // acantilado se parece al de al lado. En COSTA la roca es arenisca; en tierra, basalto.
    const arenisca = cfg.terrain === 'coast';
    const base = proj(o.x, 0, o.z);
    const hw = Math.max(1.5, o.hw * k), th = Math.max(2, o.h * k);
    // el sol pega desde la IZQUIERDA: la roca se apaga de laja en laja hacia la derecha (lerp,
    // no dos bloques planos — con el corte duro cada laja se leia como un edificio aparte)
    // roca CALIDA (piedra, no hormigon): con el gris azulado leia a edificio contra el pasto
    const LIT = arenisca ? [158, 138, 100] : [131, 118, 92];
    const SHD = arenisca ? [74, 62, 42] : [60, 54, 42];
    const DARK = arenisca ? '#3a3222' : '#312c22';   // vetas, grietas y pedregal
    const CAP = arenisca ? '#a08e69' : '#4d5c33';    // corona: arena seca / turba
    const rock = f => 'rgb(' + (LIT[0] + (SHD[0] - LIT[0]) * f | 0) + ',' + (LIT[1] + (SHD[1] - LIT[1]) * f | 0) + ',' + (LIT[2] + (SHD[2] - LIT[2]) * f | 0) + ')';
    ctx.globalAlpha = 0.3;                                                       // sombra al pie
    px(base.x - hw * 1.2, base.y - Math.max(1, 0.4 * k), hw * 2.4, Math.max(1, 0.9 * k), '#141a12');
    ctx.globalAlpha = 1;
    // PERFIL: la cresta llega a su punto alto en `peak` y cae hacia los costados — asimetrico, con
    // una cara mas escarpada que la otra. Sin esta envolvente las lajas quedaban todas de la misma
    // altura y el acantilado se leia como una fila de edificios.
    const N = 6, peak = 0.25 + hash2(o.seed, 5) * 0.5;
    const ws = [];
    let sum = 0;
    for (let i = 0; i < N; i++) { const w = 0.6 + hash2(o.seed, i * 53) * 0.8; ws.push(w); sum += w; }
    let sx = base.x - hw;
    for (let i = 0; i < N; i++) {
      const u = (i + 0.5) / N;
      const fall = u < peak ? peak + 0.2 : 1.2 - peak;           // ladera corta de un lado, larga del otro
      const env = Math.pow(Math.max(0.14, 1 - Math.abs(u - peak) / fall), 0.6);
      const hgt = Math.max(2, th * env * (0.8 + hash2(o.seed, i * 37) * 0.3));
      const w = (hw * 2) * ws[i] / sum;                          // lajas de ancho desparejo
      const top = base.y - hgt;
      px(sx, top, w + 1, hgt, rock(i / (N - 1)));                // +1: sin costuras entre lajas
      // VETAS a alturas DESPAREJAS y de largo parcial. Con bandas parejas de lado a lado el
      // acantilado se leia como las losas de un edificio.
      for (let b = 0; b < 2; b++) {
        const vy = top + hgt * (0.25 + hash2(o.seed, i * 37 + b * 11) * 0.6);
        const vx = sx + w * hash2(o.seed, i * 37 + b * 11 + 3) * 0.4;
        ctx.globalAlpha = 0.4;
        px(vx, vy, w * (0.45 + hash2(o.seed, i * 71 + b) * 0.55), Math.max(1, 0.4 * k), DARK);
        ctx.globalAlpha = 1;
      }
      px(sx, top, w + 1, Math.max(1, 0.6 * k), CAP);             // corona vegetal / arenosa
      ctx.globalAlpha = 0.25;                                    // filo iluminado bajo la corona
      px(sx, top + Math.max(1, 0.6 * k), w + 1, Math.max(1, 0.35 * k), '#e8e2cf');
      ctx.globalAlpha = 1;
      // GRIETA: no en el borde de la laja (ahi marcaba la grilla), corrida hacia adentro
      if (i > 0) {
        ctx.globalAlpha = 0.45;
        px(sx + w * hash2(o.seed, i * 97) * 0.35, top + hgt * 0.12, Math.max(1, 0.3 * k), hgt * 0.88, DARK);
        ctx.globalAlpha = 1;
      }
      sx += w;
    }
    // PEDREGAL: los bloques desprendidos se amontonan al pie y desbordan el ancho del farallon,
    // asi la roca se apoya en el terreno en vez de estar clavada como un cartel
    px(base.x - hw * 1.15, base.y - Math.max(1, 1.0 * k), hw * 2.3, Math.max(1, 1.0 * k), DARK);
    px(base.x - hw * 0.9, base.y - Math.max(1, 1.6 * k), hw * 0.55, Math.max(1, 0.6 * k), rock(0.15));
    px(base.x + hw * 0.45, base.y - Math.max(1, 1.4 * k), hw * 0.5, Math.max(1, 0.5 * k), rock(0.8));
  } else if (o.type === 'tree') {
    const base = proj(o.x, 0, o.z);
    const th = o.h * k;                                     // altura total en pantalla
    const sway = Math.sin(run.t * 1.3 + o.ph) * 0.5 * k;    // la copa se mece con el viento
    // sombra proyectada en el piso (le da peso al árbol)
    ctx.globalAlpha = 0.28;
    px(base.x - Math.max(2, 2.2 * k), base.y - Math.max(1, 0.5 * k), Math.max(3, 4.4 * k), Math.max(1, 0.7 * k), '#161d10');
    ctx.globalAlpha = 1;
    // tronco (de la base hacia arriba, ~45% de la altura) con lado iluminado y lado en sombra
    const trunkH = th * 0.45, tw = Math.max(1, 0.8 * k);
    px(base.x - tw / 2, base.y - trunkH, tw, trunkH, '#3d2f1e');
    px(base.x - tw / 2, base.y - trunkH, Math.max(1, tw * 0.45), trunkH, '#5c4a30');  // luz del tronco (izq)
    // copa: bloques verdes superpuestos, irregular, con textura (gaps oscuros + brillos)
    const cx = base.x + sway, top = base.y - th, cw = Math.max(2, 3.6 * k);
    px(cx - cw * 0.5, base.y - th * 0.64, cw, th * 0.36, '#2c3a1a');                  // base de la copa (sombra)
    px(cx - cw * 0.52, base.y - th * 0.5, cw * 0.4, th * 0.24, '#33431f');            // bulto lateral izq
    px(cx + cw * 0.12, base.y - th * 0.55, cw * 0.4, th * 0.26, '#33431f');           // bulto lateral der
    px(cx - cw * 0.42, top + th * 0.1, cw * 0.84, th * 0.34, '#475a2a');              // cuerpo
    px(cx - cw * 0.28, top, cw * 0.56, th * 0.26, '#5c7536');                         // corona
    px(cx - cw * 0.18, top + th * 0.02, cw * 0.32, Math.max(1, th * 0.12), '#7a9648'); // brillo (sol)
    if (k > 2.5) {                                          // cerca: textura de follaje (motas)
      px(cx + cw * 0.08, top + th * 0.14, Math.max(1, cw * 0.14), Math.max(1, th * 0.08), '#2c3a1a'); // gap oscuro
      px(cx - cw * 0.34, top + th * 0.2, Math.max(1, cw * 0.12), Math.max(1, th * 0.07), '#6f8a44');  // mota clara
    }
  } else if (o.type === 'tent') {
    // CARPA britanica: lona olivo a dos aguas, entrada oscura. Arrasable a ras (no mata).
    const base = proj(o.x, 0, o.z);
    ctx.globalAlpha = 0.25;
    px(base.x - 3 * k, base.y - 0.3 * k, 6 * k, Math.max(1, 0.5 * k), '#161d10');   // sombra
    ctx.globalAlpha = 1;
    if (enemyArt.ready('tent')) {
      enemyArt.drawFrame(ctx, 'tent', 0, 0, base.x, { bottomY: base.y }, k, false);
    } else {
      px(base.x - 2.5 * k, base.y - 1.7 * k, 5 * k, 1.7 * k, '#66684a');            // cuerpo de lona
      px(base.x - 1.7 * k, base.y - 2.6 * k, 3.4 * k, 1.0 * k, '#585a40');          // techo
      px(base.x - 1.0 * k, base.y - 3.1 * k, 2.0 * k, Math.max(1, 0.6 * k), '#74765a');  // cumbrera con luz
      px(base.x - 0.5 * k, base.y - 1.4 * k, 1.0 * k, 1.4 * k, '#20241c');          // entrada
      px(base.x - 2.5 * k, base.y - 0.4 * k, 5 * k, Math.max(1, 0.4 * k), '#4e5038'); // faldon sucio
    }
  } else if (o.type === 'aa') {
    // ANTIAEREO: nido de bolsas de arena + pedestal + caños gemelos apuntando alto. Dispara
    // misiles (o.fireT marca el fogonazo). Destruible — es el blanco prioritario del mapa.
    const base = proj(o.x, 0, o.z);
    if (enemyArt.ready('aa')) {
      // 2 poses de apunte: los caños CORRIGEN cada tanto — la pieza esta servida, no abandonada
      const col = ((run.t * 0.7 + o.ph) | 0) % 2;
      const fl = !!(o.hitT && run.t - o.hitT < 0.09);
      enemyArt.drawFrame(ctx, 'aa', col, 0, base.x, { bottomY: base.y }, k, false, fl);
    } else {
      px(base.x - 2.4 * k, base.y - 0.9 * k, 4.8 * k, 0.9 * k, '#7c6f4f');          // bolsas de arena
      px(base.x - 2.4 * k, base.y - 0.9 * k, 4.8 * k, Math.max(1, 0.3 * k), '#948562');
      px(base.x - 0.5 * k, base.y - 2.0 * k, 1.0 * k, 1.2 * k, '#3d423b');          // pedestal
      for (let i = 0; i < 3; i++) {                                                 // caños gemelos (diagonal)
        px(base.x + (0.2 + i * 0.5) * k, base.y - (2.2 + i * 0.55) * k, Math.max(1, 0.7 * k), Math.max(1, 0.3 * k), '#2b3338');
        px(base.x + (0.2 + i * 0.5) * k, base.y - (1.85 + i * 0.55) * k, Math.max(1, 0.7 * k), Math.max(1, 0.3 * k), '#2b3338');
      }
    }
    if (o.fireT && run.t - o.fireT < 0.12) {                                        // fogonazo
      px(base.x + 1.8 * k, base.y - 4.1 * k, 1.4 * k, 1.2 * k, P.accent);
      px(base.x + 2.1 * k, base.y - 3.9 * k, 0.8 * k, 0.7 * k, '#fff2c8');
    }
    drawHpBar(base.x, base.y - 5.4 * k, k, o);
  } else if (o.type === 'bldg') {
    // PUESTO britanico: paredes chapa, techo, puerta y ventanas. Los armados tienen un soldado
    // asomado que tira rafagas (fogonazo en la ventana con o.fireT).
    const base = proj(o.x, 0, o.z), bh = o.h * k;
    if (enemyArt.ready('bldg')) {
      // la hoja se escala por ALTURA (o.h varia 7.5-11.5 por spawn): k por el factor contra href
      const fl = !!(o.hitT && run.t - o.hitT < 0.09);
      enemyArt.drawFrame(ctx, 'bldg', 0, 0, base.x, { bottomY: base.y }, k * o.h / enemyArt.SHEETS.bldg.href, false, fl);
    } else {
      px(base.x - 3 * k, base.y - bh, 6 * k, bh, '#6e6656');                        // paredes
      px(base.x - 3 * k, base.y - bh, 6 * k, Math.max(1, 0.16 * bh), '#7d7563');    // luz superior
      px(base.x - 3.3 * k, base.y - bh - 0.6 * k, 6.6 * k, Math.max(1, 0.7 * k), '#463f31');   // techo
      ctx.globalAlpha = 0.25;                                                        // chapas
      for (let i = 1; i < 4; i++) px(base.x - 3 * k + i * 1.5 * k, base.y - bh, 1, bh, '#3a352a');
      ctx.globalAlpha = 1;
      px(base.x - 0.6 * k, base.y - 1.9 * k, 1.2 * k, 1.9 * k, '#2a2d24');          // puerta
      px(base.x - 2.2 * k, base.y - bh * 0.62, 1.2 * k, Math.max(1, 0.9 * k), '#23271f');   // ventanas
      px(base.x + 1.0 * k, base.y - bh * 0.62, 1.2 * k, Math.max(1, 0.9 * k), '#23271f');
    }
    const wy = base.y - bh * 0.62;
    if (o.armed) {                                                                  // soldado asomado
      px(base.x + 1.25 * k, wy + 0.15 * k, 0.7 * k, Math.max(1, 0.6 * k), '#8a7f5e');
      if (o.fireT && run.t - o.fireT < 0.12) px(base.x + 2.1 * k, wy + 0.1 * k, 1.1 * k, Math.max(1, 0.5 * k), P.accent);
    }
    drawHpBar(base.x, base.y - bh - 1.6 * k, k, o);
  } else if (o.type === 'lcu') {
    // BARCAZA DE DESEMBARCO: casco chato en el agua, rampa hacia la playa (izquierda), timonera
    // atras y cascos de soldados asomando. Entra por el lado del mar.
    const base = proj(o.x, 0, o.z);
    ctx.globalAlpha = 0.5;                                                           // estela
    px(base.x - 4.6 * k, base.y, 9.2 * k, Math.max(1, 0.4 * k), P.foam);
    ctx.globalAlpha = 1;
    if (enemyArt.ready('lcu')) {
      // hoja en 3/4 con la rampa hacia la IZQUIERDA (la playa). La estela de arriba se queda.
      // TAMBALEO: 3 poses de rolido cicladas por un seno lento + bob vertical — la marejada la
      // hamaca aunque este quieta. Encallada (beached) el rolido para pero el bob sigue, apenas.
      const sw2 = Math.sin(run.t * (o.sailing ? 1.3 : 0.7) + o.ph * 2);
      const col = o.beached ? 1 : sw2 > 0.4 ? 2 : sw2 < -0.4 ? 0 : 1;
      const bob = Math.sin(run.t * 1.1 + o.ph) * (o.beached ? 0.12 : 0.3) * k;
      const fl = !!(o.hitT && run.t - o.hitT < 0.09);   // impacto: el sprite entero destella
      enemyArt.drawFrame(ctx, 'lcu', col, 0, base.x, { bottomY: base.y + bob }, k, false, fl);
      drawHpBar(base.x, base.y - 3.6 * k, k, o);
      return;
    }
    px(base.x - 3.8 * k, base.y - 1.6 * k, 7.6 * k, 1.6 * k, '#5b6558');            // casco
    px(base.x - 3.8 * k, base.y - 1.6 * k, 7.6 * k, Math.max(1, 0.3 * k), '#6d7767');
    px(base.x - 4.5 * k, base.y - 2.3 * k, Math.max(1, 0.8 * k), 2.3 * k, '#77816f');   // rampa (proa, hacia la playa)
    px(base.x + 2.6 * k, base.y - 2.5 * k, 1.1 * k, Math.max(1, 0.9 * k), '#4a5348');   // timonera
    for (let i = 0; i < 3; i++)                                                      // cascos asomando
      px(base.x + (-2.2 + i * 1.3) * k, base.y - 2.0 * k, Math.max(1, 0.7 * k), Math.max(1, 0.4 * k), '#7d7455');
    drawHpBar(base.x, base.y - 3.6 * k, k, o);
  } else if (o.type === 'tower') {
    // TORRE DE COMUNICACIONES: celosia que se angosta, travesaños en X, antenas y baliza roja.
    const base = proj(o.x, 0, o.z), th = o.h * k;
    const wB = 1.7 * k, wT = 0.5 * k;
    for (let i = 0; i < 7; i++) {                                   // montantes (van cerrando)
      const t0 = i / 7, t1 = (i + 1) / 7;
      const w0 = wB + (wT - wB) * t0, w1 = wB + (wT - wB) * t1;
      const y0 = base.y - th * t0, y1 = base.y - th * t1;
      px(base.x - w0, y1, Math.max(1, 0.45 * k), y0 - y1, '#5e6660');
      px(base.x + w0 - 0.45 * k, y1, Math.max(1, 0.45 * k), y0 - y1, '#4a524d');
      px(base.x - w1, y1, w1 * 2, Math.max(1, 0.35 * k), '#535b56');  // travesaño
    }
    px(base.x - 1.6 * k, base.y - th - 0.4 * k, 3.2 * k, Math.max(1, 0.35 * k), '#6a726c');  // antena horizontal
    px(base.x - 0.2 * k, base.y - th - 2.2 * k, Math.max(1, 0.4 * k), 2.2 * k, '#6a726c');   // latiguillo
    if (Math.sin(run.t * 3 + o.ph) > 0)                             // baliza roja intermitente
      px(base.x - 0.45 * k, base.y - th - 2.9 * k, 0.9 * k, Math.max(1, 0.8 * k), '#e0483a');
    drawHpBar(base.x, base.y - th - 4 * k, k, o);
  } else if (o.type === 'poles') {
    // POSTES CON CABLES: dos palos y el tendido colgando en catenaria. Lo que engancha es el CABLE.
    const base = proj(o.x, 0, o.z), th = o.h * k, sp = 6 * k;
    for (const sx2 of [base.x - sp, base.x + sp]) {
      px(sx2 - 0.35 * k, base.y - th, Math.max(1, 0.7 * k), th, '#54463a');                  // poste
      px(sx2 - 1.1 * k, base.y - th + 0.5 * k, 2.2 * k, Math.max(1, 0.35 * k), '#4a3e33');   // cruceta
    }
    ctx.strokeStyle = '#2b2f2c'; ctx.lineWidth = Math.max(1, 0.28 * k);
    for (const dy2 of [0.5, 1.5]) {                                 // dos cables con panza
      ctx.beginPath();
      ctx.moveTo(base.x - sp, base.y - th + dy2 * k);
      ctx.quadraticCurveTo(base.x, base.y - th + (dy2 + 2.2) * k, base.x + sp, base.y - th + dy2 * k);
      ctx.stroke();
    }
    ctx.lineWidth = 1;
  } else if (o.type === 'flag') {
    // MASTIL con bandera britanica FLAMEANDO: la Union Jack se dibuja por franjas onduladas.
    const base = proj(o.x, 0, o.z), th = o.h * k;
    px(base.x - 0.3 * k, base.y - th, Math.max(1, 0.6 * k), th, '#9aa2a6');                  // mastil
    px(base.x - 0.5 * k, base.y - th - 0.5 * k, k, Math.max(1, 0.5 * k), '#c8ced1');         // perilla
    const fw = 5.5 * k, fh = 3.2 * k, fy = base.y - th + 0.4 * k;
    for (let i = 0; i < 7; i++) {                                   // franjas verticales onduladas
      const t0 = i / 7, xw = fw / 7;
      const wav = Math.sin(run.t * 4 + o.ph + t0 * 5) * 0.55 * k * t0;   // mas ondulacion en la punta
      const fx = base.x + 0.3 * k + t0 * fw;
      px(fx, fy + wav, xw + 1, fh, '#1e3a6e');                                        // azul
      px(fx, fy + wav + fh * 0.42, xw + 1, Math.max(1, fh * 0.16), '#e8ecef');        // banda blanca
      px(fx, fy + wav + fh * 0.46, xw + 1, Math.max(1, fh * 0.09), '#c8202e');        // cruz roja
    }
    const cx2 = base.x + 0.3 * k + fw * 0.42;                                          // cruz vertical
    px(cx2, fy + Math.sin(run.t * 4 + o.ph + 2.1) * 0.3 * k, Math.max(1, fw * 0.1), fh, '#e8ecef');
    px(cx2 + fw * 0.025, fy + Math.sin(run.t * 4 + o.ph + 2.1) * 0.3 * k, Math.max(1, fw * 0.05), fh, '#c8202e');
    drawHpBar(base.x, base.y - th - 2 * k, k, o);
  } else if (o.type === 'depot') {
    // DEPOSITO: galpon abovedado con tambores y cajones apilados al lado.
    const base = proj(o.x, 0, o.z), dh = o.h * k;
    if (enemyArt.ready('depot')) {
      const fl = !!(o.hitT && run.t - o.hitT < 0.09);
      enemyArt.drawFrame(ctx, 'depot', 0, 0, base.x, { bottomY: base.y }, k * o.h / enemyArt.SHEETS.depot.href, false, fl);
      drawHpBar(base.x, base.y - dh - 1.8 * k, k, o);
      return;
    }
    px(base.x - 3.4 * k, base.y - dh, 6.8 * k, dh, '#6a6352');                        // galpon
    px(base.x - 3.4 * k, base.y - dh, 6.8 * k, Math.max(1, 0.2 * dh), '#7a7360');
    px(base.x - 3.7 * k, base.y - dh - 0.5 * k, 7.4 * k, Math.max(1, 0.6 * k), '#464033');  // techo
    ctx.globalAlpha = 0.22;                                                            // chapas
    for (let i = 1; i < 5; i++) px(base.x - 3.4 * k + i * 1.36 * k, base.y - dh, 1, dh, '#332e24');
    ctx.globalAlpha = 1;
    px(base.x - 0.9 * k, base.y - 1.8 * k, 1.8 * k, 1.8 * k, '#2a2d24');              // porton
    for (let i = 0; i < 3; i++) {                                                      // tambores
      px(base.x + (2.0 + i * 0.9) * k, base.y - 1.2 * k, 0.8 * k, 1.2 * k, '#6d7a4a');
      px(base.x + (2.0 + i * 0.9) * k, base.y - 0.8 * k, 0.8 * k, Math.max(1, 0.2 * k), '#8a9a5e');
    }
    px(base.x - 5.0 * k, base.y - 1.4 * k, 1.5 * k, 1.4 * k, '#7a6b4e');              // cajones
    px(base.x - 5.0 * k, base.y - 2.6 * k, 1.1 * k, 1.2 * k, '#8a7a5a');
    drawHpBar(base.x, base.y - dh - 1.8 * k, k, o);
  } else if (o.type === 'radar') {
    // RADAR MOVIL: camion con plato giratorio (reemplaza a los arboles en la costa)
    const base = proj(o.x, 0, o.z);
    if (enemyArt.ready('radar')) {
      // 4 poses del plato: rota de a 45° a paso constante. Si el camion RUEDA (vx), se espeja
      // para mirar hacia donde va.
      const col = ((run.t * 3 + o.ph) | 0) % 4;
      const fl = !!(o.hitT && run.t - o.hitT < 0.09);   // impacto: el sprite entero destella
      enemyArt.drawFrame(ctx, 'radar', col, 0, base.x, { bottomY: base.y }, k, o.vx < 0, fl);
      drawHpBar(base.x, base.y - 6.2 * k, k, o);
      return;
    }
    px(base.x - 2.4 * k, base.y - 1.5 * k, 4.8 * k, 1.5 * k, '#5d6152');            // caja del camion
    px(base.x - 2.4 * k, base.y - 1.5 * k, 4.8 * k, Math.max(1, 0.3 * k), '#6f7362');
    px(base.x - 2.4 * k, base.y - 0.4 * k, 1.2 * k, Math.max(1, 0.4 * k), '#20241c'); // ruedas
    px(base.x + 1.2 * k, base.y - 0.4 * k, 1.2 * k, Math.max(1, 0.4 * k), '#20241c');
    px(base.x + 1.6 * k, base.y - 2.3 * k, 1.2 * k, Math.max(1, 0.8 * k), '#4a4e42'); // cabina
    // plato: gira (el ancho oscila por el escorzo del giro)
    const spin = Math.abs(Math.sin(run.t * 1.6 + o.ph));
    px(base.x - 0.4 * k, base.y - 3.4 * k, Math.max(1, 0.8 * k), 1.9 * k, '#3a3e34');  // mastil
    px(base.x - (0.6 + spin * 1.6) * k, base.y - 4.6 * k, Math.max(2, (1.2 + spin * 3.2) * k), Math.max(1, 1.0 * k), '#8a9299');
    px(base.x - 0.3 * k, base.y - 4.9 * k, Math.max(1, 0.6 * k), Math.max(1, 0.5 * k), '#aab2b8');
    drawHpBar(base.x, base.y - 6.2 * k, k, o);
  } else if (o.type === 'aatruck') {
    // CAMION ANTIAEREO: vehiculo con los caños del AA montados atras — dispara como el nido
    const base = proj(o.x, 0, o.z);
    if (enemyArt.ready('aatruck')) {
      // la torreta BARRE el cielo en ping-pong (0-1-2-1): busca al avion aunque no dispare
      const col = [0, 1, 2, 1][((run.t * 1.6 + o.ph) | 0) % 4];
      const fl = !!(o.hitT && run.t - o.hitT < 0.09);   // impacto: el sprite entero destella
      enemyArt.drawFrame(ctx, 'aatruck', col, 0, base.x, { bottomY: base.y }, k, o.vx < 0, fl);
      if (o.fireT && run.t - o.fireT < 0.12) {          // el fogonazo del disparo queda por codigo
        px(base.x + 0.6 * k, base.y - 4.6 * k, 1.3 * k, 1.1 * k, P.accent);
        px(base.x + 0.9 * k, base.y - 4.4 * k, 0.7 * k, 0.6 * k, '#fff2c8');
      }
      drawHpBar(base.x, base.y - 5.6 * k, k, o);
      return;
    }
    px(base.x - 2.6 * k, base.y - 1.4 * k, 5.2 * k, 1.4 * k, '#575b48');            // chasis
    px(base.x - 2.6 * k, base.y - 1.4 * k, 5.2 * k, Math.max(1, 0.3 * k), '#696d58');
    px(base.x - 2.5 * k, base.y - 0.4 * k, 1.1 * k, Math.max(1, 0.4 * k), '#20241c'); // ruedas
    px(base.x + 0.2 * k, base.y - 0.4 * k, 1.1 * k, Math.max(1, 0.4 * k), '#20241c');
    px(base.x - 2.6 * k, base.y - 2.2 * k, 1.3 * k, Math.max(1, 0.9 * k), '#43473a'); // cabina
    for (let i = 0; i < 3; i++) {                                                    // caños al cielo
      px(base.x + (0.1 + i * 0.45) * k, base.y - (2.4 + i * 0.5) * k, Math.max(1, 0.6 * k), Math.max(1, 0.3 * k), '#2b3338');
      px(base.x + (0.7 + i * 0.45) * k, base.y - (2.0 + i * 0.5) * k, Math.max(1, 0.6 * k), Math.max(1, 0.3 * k), '#2b3338');
    }
    if (o.fireT && run.t - o.fireT < 0.12) {
      px(base.x + 1.6 * k, base.y - 4.2 * k, 1.3 * k, 1.1 * k, P.accent);
      px(base.x + 1.9 * k, base.y - 4.0 * k, 0.7 * k, 0.6 * k, '#fff2c8');
    }
    drawHpBar(base.x, base.y - 5.6 * k, k, o);
  } else if (o.type === 'bomb') {
    // BOMBA cayendo: sombra que crece en el suelo (aviso) + cuerpo con aletas oscilando
    const sh2 = proj(o.x, 0, o.z);
    const closeness = Math.max(0, 1 - o.y / 70);
    ctx.globalAlpha = 0.15 + closeness * 0.3;
    px(sh2.x - (1.4 + closeness * 1.2) * k, sh2.y - 0.3 * k, (2.8 + closeness * 2.4) * k, Math.max(1, 0.5 * k), '#0d100a');
    ctx.globalAlpha = 1;
    const s = proj(o.x, o.y, o.z), sway = Math.sin(run.t * 6 + o.ph) * 0.25 * k;
    px(s.x - 0.5 * k + sway, s.y - 1.2 * k, k, 2.4 * k, '#3a4038');                 // cuerpo
    px(s.x - 0.5 * k + sway, s.y - 1.2 * k, k, Math.max(1, 0.5 * k), '#4c534a');    // lomo
    px(s.x - 0.9 * k + sway, s.y - 1.6 * k, 1.8 * k, Math.max(1, 0.5 * k), '#2b3028');  // aletas
    px(s.x - 0.25 * k + sway, s.y + 1.2 * k, Math.max(1, 0.5 * k), Math.max(1, 0.4 * k), '#565c50');  // ojiva abajo
  } else if (o.type === 'boom') {
    // HONGO de la explosion. Con la hoja de sprites (assets/world/explosions/bomb.png) sale el
    // ciclo entero — destello, columna, hongo naranja, enfriado a humo, disipacion. El dibujo a
    // mano de abajo queda como respaldo mientras la hoja no cargo o si falla.
    if (boomArt.isReady()) { boomArt.drawBoom(ctx, px, proj, o, k); }
    else {
      const base = proj(o.x, 0, o.z);
      const ct = Math.min(1, o.boomT / 1.1);
      const fade = o.boomT > 4.5 ? Math.max(0, 1 - (o.boomT - 4.5) / 1.5) : 1;
      const hot = o.boomT < 0.6;
      ctx.globalAlpha = fade;
      const stemH = (7.5 + ct * 21) * k, stemW = (3.3 + ct * 2.1) * k;
      px(base.x - stemW / 2, base.y - stemH, stemW, stemH, hot ? '#b06a35' : '#7a756a');
      px(base.x - stemW * 0.9, base.y - stemH * 0.12, stemW * 1.8, stemH * 0.12, '#8a8578');
      const capW = (10.8 + ct * 10.2) * k, capH = (4.5 + ct * 3.3) * k, capY = base.y - stemH - capH * 0.5;
      px(base.x - capW / 2, capY, capW, capH, hot ? '#d98a4a' : '#8f8a7d');
      px(base.x - capW * 0.34, capY - capH * 0.4, capW * 0.68, capH * 0.55, hot ? '#e8b06a' : '#9c978a');
      ctx.globalAlpha = 1;
    }
  } else if (o.type === 'airboom') {
    // AIRBURST: la bomba reventada EN EL AIRE, y tambien el fogonazo de cada blanco que revienta.
    // Es la explosion DE FRENTE (hoja explosions_front.png); el hongo de perfil es otra cosa y
    // vive en render/boom.js. Debajo queda el dibujo a mano como respaldo si la hoja no cargo.
    //
    // `pix` (el DERRIBO del avion): version en PIXEL ART por codigo, mas chica y con HUECOS —
    // la hoja frontal a escala grande tapaba los pedazos del avion rompiendose, que es
    // exactamente lo que ese momento tiene que dejar ver.
    if (o.pix) {
      const s = proj(o.x, o.y, o.z);
      const p = o.boomT / 1.25;
      if (p < 1) {
        const R = (1.5 + p * 7.5) * k * (o.scale || 1);
        // corona de BLOQUES sueltos: crecen, se enfrian (amarillo→naranja→marron) y se apagan.
        // Radios y angulos desparejos por bloque (determinados por o.ph): reventon, no anillo.
        for (let i = 0; i < 10; i++) {
          const a = i * 0.628 + o.ph + ((i * 7919) % 13) * 0.13;
          const rr = R * (0.5 + ((i * 37) % 7) / 7 * 0.5);
          const sz = Math.max(1, R * (0.36 - p * 0.22));
          ctx.globalAlpha = Math.max(0, 1 - p * 1.15);
          px(s.x + Math.cos(a) * rr - sz / 2, s.y + Math.sin(a) * rr * 0.8 - sz / 2, sz, sz,
            p < 0.3 ? '#ffd98a' : p < 0.6 ? '#f07c22' : '#8d5a3a');
        }
        if (p < 0.28) {                                   // nucleo blanco del primer instante
          ctx.globalAlpha = 1 - p / 0.28;
          const cz = Math.max(1, R * 0.55);
          px(s.x - cz / 2, s.y - cz / 2, cz, cz, '#fff6d8');
        }
        if (p > 0.35) {                                   // el humo que queda, subiendo
          ctx.globalAlpha = Math.max(0, 0.45 - (p - 0.35) * 0.7);
          for (let i = 0; i < 4; i++) {
            const sz = Math.max(1, R * 0.24);
            px(s.x + Math.cos(i * 1.7 + o.ph) * R * 0.45 - sz / 2,
              s.y - R * 0.25 - (p - 0.35) * 9 * k * (o.scale || 1) - i * sz * 0.4, sz, sz, '#55554d');
          }
        }
        ctx.globalAlpha = 1;
      }
    } else if (blastArt.isReady()) { blastArt.drawBlast(ctx, proj, o, k); }
    else {
      const s = proj(o.x, o.y, o.z);
      const gr = Math.min(1, o.boomT / 0.45);
      const fade = Math.max(0, 1 - o.boomT / 1.9);
      const R = (2 + gr * 9) * k * (o.scale || 1);
      ctx.globalAlpha = fade;
      ctx.beginPath(); ctx.arc(s.x, s.y, R, 0, 6.2832);
      ctx.fillStyle = o.boomT < 0.5 ? '#d98a4a' : '#8a8578'; ctx.fill();
      ctx.beginPath(); ctx.arc(s.x, s.y, R * 0.6, 0, 6.2832);
      ctx.fillStyle = o.boomT < 0.35 ? '#ffe6ac' : '#c07a42'; ctx.fill();
      ctx.globalAlpha = fade * 0.45;
      ctx.strokeStyle = '#ffd98a'; ctx.lineWidth = Math.max(1, 0.6 * k);
      ctx.beginPath(); ctx.arc(s.x, s.y, R * (1 + gr * 0.8), 0, 6.2832); ctx.stroke();
      ctx.lineWidth = 1; ctx.globalAlpha = 1;
    }
  } else if (o.type === 'chunk') {
    // PEDAZO DEL AVION derribado (ver die en game.js): fragmento que sigue de largo con la
    // inercia, girando. Un rect rotado con canto iluminado — a esta escala, el TUMBO (rotacion
    // continua) es lo que lo hace leer como escombro y no como particula.
    const s = proj(o.x, o.y, o.z);
    const r = Math.max(1.2, o.size * 2 * k);
    ctx.save();
    ctx.translate(s.x, s.y); ctx.rotate(o.spin);
    px(-r / 2, -r / 4, r, r / 2, '#3a4038');                 // el fragmento
    px(-r / 2, -r / 4, r, Math.max(1, r * 0.16), '#5c6358'); // canto al sol
    if (o.hot && Math.sin(o.spin * 3) > 0)                   // rescoldo: parpadea al girar
      px(r * 0.2, -r / 8, Math.max(1, r * 0.2), Math.max(1, r * 0.2), '#e07030');
    ctx.restore();
  } else if (o.type === 'birds') {
    // BANDADA: aves aleteando (daña al atravesarla, no derriba). Silueta simple en "V".
    // DOS ESPECIES, sorteadas en el spawn (o.white): gaviotas BLANCAS con punta de ala oscura —
    // las del Atlantico Sur, que resaltan sobre el mar y la tierra — y aves NEGRAS, que resaltan
    // contra el cielo. Entre las dos la bandada se ve venir sobre cualquier fondo.
    //
    // ALETEO EN TRES POSES (arriba/planeo/abajo), no en dos: con dos posiciones el ala teletransporta
    // y parece un glitch; con la pose intermedia se lee la BATIDA. Cada ave lleva su fase y su
    // tamaño (las de atras mas chicas: profundidad dentro de la bandada), y un bob vertical lento
    // desfasado — una bandada respira, no vuela clavada en una grilla.
    const s = proj(o.x, o.y, o.z);
    const cuerpo = o.white ? '#eef2f0' : '#1e2422';
    const punta = o.white ? '#6d7b7d' : '#0d1110';
    const panza = o.white ? '#c9d4d2' : '#333b38';
    for (let i = 0; i < 6; i++) {
      const back = i > 2;                                       // fila de atras: mas lejos
      const sc = (back ? 0.72 : 1) * (0.85 + ((i * 37) % 5) * 0.06);
      const bx2 = s.x + (((i % 3) - 1) * 2.2 + (back ? 1.1 : 0)) * k;
      const by2 = s.y + ((back ? 1.4 : 0) - (i % 3 === 1 ? 0.9 : 0) + Math.sin(run.t * 1.7 + i * 2.1) * 0.3) * k;
      const w = Math.sin(run.t * 11 + o.ph + i * 1.3);          // fase del aleteo de ESTA ave
      const pose = w > 0.4 ? 1 : w < -0.4 ? -1 : 0;             // 1 = alas arriba · 0 = planeo · -1 = abajo
      const wl = 0.75 * k * sc, hh2 = Math.max(1, 0.22 * k * sc);
      const lift = pose * 0.38 * k * sc;
      // cuerpo: un punto con panza — el pivote del que salen las alas
      px(bx2 - 0.28 * k * sc, by2 - 0.14 * k * sc, Math.max(1, 0.56 * k * sc), Math.max(1, 0.34 * k * sc), cuerpo);
      px(bx2 - 0.28 * k * sc, by2 + 0.06 * k * sc, Math.max(1, 0.56 * k * sc), Math.max(1, 0.14 * k * sc), panza);
      // alas: suben y bajan JUNTAS alrededor del cuerpo (antes alternaban una arriba y una
      // abajo, que es como aletea un murcielago de historieta, no una gaviota)
      for (const sg of [-1, 1]) {
        const x0 = sg < 0 ? bx2 - wl - 0.2 * k * sc : bx2 + 0.2 * k * sc;
        px(x0, by2 - lift - hh2 / 2, wl, hh2, cuerpo);
        // la MITAD exterior del ala acompaña mas el gesto: quiebre del ala en la batida
        const x1 = sg < 0 ? x0 : x0 + wl * 0.55;
        px(x1, by2 - lift * 1.7 - hh2 / 2, wl * 0.45, hh2, cuerpo);
        px(sg < 0 ? x1 : x1 + wl * 0.45 - Math.max(1, wl * 0.2), by2 - lift * 1.7 - hh2 / 2, Math.max(1, wl * 0.2), hh2, punta);
      }
    }
  } else if (o.type === 'trench') {
    // TRINCHERA ARGENTINA (decorado, margen izquierdo): bolsas, 3 soldados propios tirando —
    // sus fogonazos y trazas cuentan la batalla del otro lado. No colisiona.
    const base = proj(o.x, 0, o.z);
    px(base.x - 3.4 * k, base.y - 1.0 * k, 6.8 * k, 1.0 * k, '#6b5f45');            // parapeto
    px(base.x - 3.4 * k, base.y - 1.0 * k, 6.8 * k, Math.max(1, 0.3 * k), '#7d7052');
    for (let i = 0; i < 3; i++) {                                                    // soldados propios (verde oliva)
      const sx2 = base.x + (-2 + i * 2) * k;
      px(sx2 - 0.35 * k, base.y - 1.9 * k, 0.7 * k, 0.9 * k, '#4c5a40');            // torso asomado
      px(sx2 - 0.3 * k, base.y - 2.35 * k, 0.6 * k, Math.max(1, 0.45 * k), '#39442f');   // casco
      px(sx2 + 0.3 * k, base.y - 1.75 * k, 0.9 * k, Math.max(1, 0.2 * k), '#191c15');    // fusil (apunta a la derecha)
    }
    if (o.fireT && run.t - o.fireT < 0.1) {
      px(base.x + 1.2 * k, base.y - 1.95 * k, 0.9 * k, Math.max(1, 0.4 * k), P.accent);   // fogonazo
      if (o.shot) {                                                                 // trazo hasta el abatido
        const v = proj(o.shot.x, 0.6, o.shot.z);
        ctx.strokeStyle = P.accent; ctx.globalAlpha = 0.5;
        ctx.beginPath(); ctx.moveTo(base.x + 1.6 * k, base.y - 1.9 * k); ctx.lineTo(v.x, v.y); ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }
  } else if (o.type === 'fuel') {
    // BIDON de combustible: tambor con aros, canto iluminado, tapon y brillo — antes era un
    // rectangulo naranja con una franja blanca. El halo pulsante dice "esto se AGARRA" y lo
    // separa de los enemigos (nada peligroso late con luz calida).
    const oy = o.y + Math.sin(run.t * 2) * 0.5;
    const s = proj(o.x, oy, o.z);
    const w = 2.6 * k, h = 3.4 * k;
    ctx.globalAlpha = 0.14 + (0.5 + 0.5 * Math.sin(run.t * 4)) * 0.12;
    px(s.x - w * 0.8, s.y - h * 0.66, w * 1.6, h * 1.32, P.accent);
    ctx.globalAlpha = 1;
    px(s.x - w / 2, s.y - h / 2, w, h, '#c9721e');                                    // tambor
    px(s.x - w / 2, s.y - h / 2, Math.max(1, w * 0.3), h, '#e8963c');                 // canto al sol
    px(s.x - w / 2, s.y - h * 0.12, w, Math.max(1, h * 0.16), '#8d4d12');             // aro central
    px(s.x - w / 2, s.y + h * 0.28, w, Math.max(1, h * 0.12), '#8d4d12');             // aro inferior
    px(s.x - w / 2, s.y - h / 2, w, Math.max(1, h * 0.12), '#f2b05e');                // borde superior
    px(s.x - w * 0.16, s.y - h / 2 - Math.max(1, h * 0.14), w * 0.32, Math.max(1, h * 0.14), '#5a5f57');  // tapon
    if (k > 2) px(s.x + w * 0.08, s.y - h * 0.3, Math.max(1, w * 0.14), h * 0.46, '#f2b05e');  // brillo vertical
  }
}

// SOLDADO de infantería en tierra: figura corriendo (piernas alternadas), casco y fusil. Se dibuja
// con el juego a 320x180, así que todo escala con `k` (tamaño según la distancia). `gait` (−1..1)
// anima el paso. Vive acá (render) y no en el orquestador: el loop de game.js solo proyecta y llama.
// PALETA DEL SOLDADO BRITANICO. Uniforme DPM oscuro (verde oliva sucio), que es el real y
// ademas asienta mejor sobre la turba que el khaki claro que habia antes.
// El problema de oscurecer es que el soldado se funde con el suelo. Se resuelve con DOS bordes:
// una silueta oscura que lo despega del terreno claro, y un FILO ILUMINADO en el lado de la luz
// (arriba-izquierda, como el resto del juego) que lo despega del terreno oscuro. Con los dos, se
// lee sobre cualquier banda del piso sin necesidad de un uniforme mas claro de lo que deberia.
// OJO CON OSCURECER DE MAS: la primera version bajo tanto el uniforme que el soldado se leia como
// una silueta negra — el equipo oscuro tapaba el torso y no quedaba uniforme visible. Estos tonos
// son ~30% mas oscuros que el khaki anterior, pero el uniforme sigue siendo lo mas claro de la
// figura; lo oscuro son solo el casco, el correaje y los borceguies.
const SOL = {
  U: '#6d6f48',        // uniforme DPM, tono medio
  UL: '#8d8f60',       // cara iluminada (hombros, brazo del sol)
  UD: '#4b4d31',       // sombra del uniforme / pantalon
  GEAR: '#3c3e29',     // correaje y equipo
  BOOT: '#2a2c1f',     // borceguies
  HELM: '#5b5e3e',     // casco
  HELML: '#7f8256',    // brillo del casco
  SKIN: '#b08a5e',     // piel (bajada de saturacion: no debe competir con el casco)
  GUN: '#191c12',
  RIM: '#12150c',      // silueta contra terreno CLARO
  LIT: '#a8aa78',      // filo contra terreno OSCURO
};

/** SOLDADO CUERPO A TIERRA: el que ve venir el avion y se tira. Se dibuja aparte y no como una
 *  variante del de pie — tumbado casi no tiene altura, asi que lo que lo hace legible es la
 *  silueta HORIZONTAL (cuerpo largo y bajo, casco a un extremo, fusil al costado). */
export function drawSoldierProne(x, y, k, dir) {
  const bw = Math.max(3.4, k * 2.0), bh = Math.max(1.6, k * 0.66);
  const d = dir < 0 ? -1 : 1;
  const e = Math.max(1, bh * 0.16);
  ctx.globalAlpha = 0.32;                                                          // sombra pegada
  px(x - bw * 0.6, y - 1, bw * 1.2, Math.max(1, bh * 0.3), '#0d100a');
  ctx.globalAlpha = 1;
  px(x - bw * 0.5, y - bh, bw, bh * 0.78, SOL.U);                                  // cuerpo tendido
  px(x - bw * 0.5, y - bh, bw, Math.max(1, bh * 0.34), SOL.UL);                    // espalda al sol
  px(x - bw * 0.14, y - bh * 0.94, Math.max(1, bw * 0.26), bh * 0.6, SOL.GEAR);    // mochila
  px(x - d * bw * 0.42, y - bh * 0.42, Math.max(1, bw * 0.3), Math.max(1, bh * 0.34), SOL.BOOT); // botas
  px(x + d * bw * 0.34, y - bh * 1.16, Math.max(1, bw * 0.32), Math.max(1, bh * 0.5), SOL.HELM); // casco
  px(x + d * bw * 0.34, y - bh * 1.16, Math.max(1, bw * 0.32), Math.max(1, bh * 0.2), SOL.HELML);
  px(x - d * bw * 0.1, y - bh * 0.34, Math.max(1, bw * 0.5), Math.max(1, bh * 0.2), SOL.GUN);    // fusil
  // mismos contornos de 1 px que el de pie: oscuro abajo, claro arriba
  px(x - bw * 0.5, y - Math.max(1, bh * 0.16), bw, Math.max(1, bh * 0.16), SOL.RIM);
  px(x - bw * 0.5, y - bh, bw * 0.9, Math.max(1, e * 0.55), SOL.LIT);
}

export function drawSoldier(x, y, k, gait) {
  // SOLDADO BRITANICO de infanteria, de espaldas. A este tamaño (8-20 px de alto) el detalle no
  // se dibuja: se SUGIERE con bloques de un pixel bien puestos.
  //
  // OJO CON EL CONTORNO: antes la silueta era un BLOQUE RELLENO del tamaño del cuerpo, dibujado
  // debajo de todo. Con el uniforme khaki claro de entonces funcionaba (solo asomaba por los
  // bordes), pero al oscurecer el uniforme el bloque y el cuerpo se fundian en una mancha negra.
  // Ahora el contorno se dibuja DESPUES y es de 1 px: oscuro en el lado de la sombra (derecha y
  // abajo) y CLARO en el lado de la luz (izquierda y arriba). Asi el soldado se despega tanto del
  // terreno claro como del oscuro sin tener que aclarar el uniforme.
  const bh = Math.max(3.5, k * 1.9), bw = Math.max(1.7, k * 0.78);
  const step = gait * bw * 0.5;
  const p1 = Math.max(1, bw * 0.22), p2 = Math.max(1, bh * 0.06);
  const edge = Math.max(1, bw * 0.14);

  // sombra proyectada en el piso
  ctx.globalAlpha = 0.3; px(x - bw * 0.7, y - 1, bw * 1.4, Math.max(1, bh * 0.08), '#0d100a'); ctx.globalAlpha = 1;

  // PIERNAS: alternan con el paso, con borceguies mas oscuros que el pantalon
  px(x - step - bw * 0.34, y - bh * 0.42, Math.max(1, bw * 0.34), bh * 0.42, SOL.UD);
  px(x + step, y - bh * 0.42, Math.max(1, bw * 0.34), bh * 0.42, SOL.UD);
  px(x - step - bw * 0.34, y - bh * 0.12, Math.max(1, bw * 0.34), Math.max(1, bh * 0.12), SOL.BOOT);
  px(x + step, y - bh * 0.12, Math.max(1, bw * 0.34), Math.max(1, bh * 0.12), SOL.BOOT);

  // TORSO: base media, mitad izquierda al sol
  px(x - bw * 0.46, y - bh * 0.8, bw * 0.92, bh * 0.5, SOL.U);
  px(x - bw * 0.46, y - bh * 0.8, bw * 0.46, bh * 0.5, SOL.UL);
  // MOCHILA: el bulto de la espalda — es lo que dice "de espaldas" de un vistazo
  px(x - bw * 0.2, y - bh * 0.72, bw * 0.4, bh * 0.26, SOL.GEAR);
  px(x - bw * 0.2, y - bh * 0.72, bw * 0.4, p2, '#565939');                        // tapa de la mochila
  // CORREAJE en cruz + cinturon
  px(x - bw * 0.46, y - bh * 0.62, bw * 0.92, p2, SOL.GEAR);
  px(x - bw * 0.5, y - bh * 0.42, bw, Math.max(1, bh * 0.08), SOL.GEAR);
  // BRAZOS: se mecen al contrario que las piernas
  px(x - bw * 0.54, y - bh * 0.76 + step * 0.3, p1, bh * 0.32, SOL.UL);
  px(x + bw * 0.54 - p1, y - bh * 0.76 - step * 0.3, p1, bh * 0.32, SOL.UD);
  // FUSIL cruzado al frente, asomando por el costado
  px(x + bw * 0.22, y - bh * 0.68, Math.max(1, bw * 0.58), Math.max(1, bh * 0.1), SOL.GUN);

  // CABEZA + CASCO britanico (ala ancha)
  px(x - bw * 0.26, y - bh * 0.94, bw * 0.52, bh * 0.18, SOL.SKIN);
  px(x - bw * 0.42, y - bh * 1.04, bw * 0.84, Math.max(1, bh * 0.16), SOL.HELM);
  px(x - bw * 0.42, y - bh * 1.04, bw * 0.42, Math.max(1, bh * 0.16), SOL.HELML);  // media luz del casco
  px(x - bw * 0.5, y - bh * 0.9, bw, p2, SOL.UD);                                  // ala ancha

  // CONTORNOS de 1 px (van al final, encima de todo)
  px(x + bw * 0.46 - edge, y - bh * 0.8, edge, bh * 0.5, SOL.RIM);                 // sombra: torso der
  px(x + bw * 0.42 - edge, y - bh * 1.04, edge, bh * 0.16, SOL.RIM);               // sombra: casco der
  px(x - bw * 0.5, y - Math.max(1, bh * 0.06), bw, Math.max(1, bh * 0.06), SOL.RIM); // sombra: al pie
  px(x - bw * 0.46, y - bh * 0.8, edge, bh * 0.5, SOL.LIT);                        // luz: torso izq
  px(x - bw * 0.42, y - bh * 1.04, bw * 0.84, Math.max(1, p2 * 0.9), SOL.LIT);     // luz: tope del casco
}

// la barcaza objetivo VISIBLE en el PASILLO: aparece en el horizonte desde el 45% del recorrido
// y crece hasta empalmar con la escala de la fase ARENA que viene (es el final del mapa).
// EMERGE "hull-down": de lejos el horizonte tapa el casco y solo asoma la superestructura; a
// medida que nos acercamos el corte baja y el barco se revela entero.
export function drawApproachBarge(objectiveDist, objectiveShip) {
  const ph = momentum.phase(), PH = momentum.phases();
  if (objectiveDist <= 0 || ph >= PH.length) return;
  if (S.state !== 'play' && S.state !== 'takeoff') return;
  const p = run.dist / objectiveDist;
  const next = PH[ph];
  const t0 = ph === 0 ? 0.45 : PH[ph - 1].at;
  if (p < t0) return;
  const f = Math.max(0, Math.min(1, (p - t0) / (next.at - t0)));
  const sc0 = ph === 0 ? 0.04 : PH[ph - 1].scale * 1.06;  // continua donde quedo la pasada anterior
  const scE = next.scale * 0.82;
  const sc = sc0 + (scE - sc0) * f;
  const uh = SHIP_UH * sc, hullH = uh * 1.5;
  // POSICION: anclamos por la LINEA DE FLOTACION, no por la cubierta. De lejos (f=0) la flotacion
  // cae justo en el horizonte (el barco asoma hacia arriba, en el cielo); al acercarse la flotacion
  // baja hacia el primer plano con ease-in cuadratico. En f=1 la cubierta queda en HOR+36*scE, que
  // es donde la toma la primera pasada del momentum (empalme intacto).
  const bx = W / 2 - cam.x * 1.2 + Math.sin(run.t * 0.8) * 9 * sc;
  const wOff = ph === 0
    ? (SHIP_DECK * scE + hullH) * f * f                            // flotacion: horizonte → primer plano
    : SHIP_DECK * sc0 + hullH + (SHIP_DECK * scE - SHIP_DECK * sc0) * f * f;   // pasadas siguientes: como antes
  const waterY = HOR + wOff + Math.sin(run.t * 1.3) * 1.8 * sc;    // linea de flotacion en pantalla
  const by = waterY - hullH;                                       // cubierta = flotacion - alto del casco
  // CORTE por el horizonte: de lejos el corte esta sobre la cubierta (solo superestructura); se
  // baja hasta pasar la flotacion cuando ya estamos cerca. Solo en la primera aparicion (ph 0).
  const reveal = ph === 0 ? Math.max(0, Math.min(1, f / 0.6)) : 1;
  const clipY = by + (waterY + 3 - by) * reveal;
  ctx.save();
  ctx.beginPath(); ctx.rect(-80, -80, W + 160, clipY + 80); ctx.clip();   // dibuja solo por encima del corte
  // bruma atmosferica: de lejos es una silueta tenue → los obstaculos (solidos) resaltan encima
  ctx.globalAlpha = ph === 0 ? 0.35 + 0.65 * f : 1;
  momRender.drawBargeHull(bx, W * 0.82 * sc, by, uh, run.t);
  ctx.globalAlpha = 1;
  ctx.restore();
  if (sc > 0.28) {   // ya cerca: nombre sobre el barco
    ctx.font = '9px monospace'; ctx.textAlign = 'center'; ctx.fillStyle = P.warn; ctx.globalAlpha = 0.85;
    ctx.fillText(objectiveShip, bx, by - uh * 4.6);
    ctx.globalAlpha = 1;
  }
}

// MARCADOR de objetivo: una cuña roja sobre el horizonte que apunta a la columna del buque, para
// saber "hacia donde vamos" desde el arranque (mucho antes de que la barcaza asome). Si el objetivo
// quedo fuera de pantalla por el paneo, se pega al borde apuntando hacia el lado correcto.
export function drawObjectiveMarker(objectiveDist) {
  if (objectiveDist <= 0) return;
  if (S.state !== 'play' && S.state !== 'takeoff') return;
  const p = run.dist / objectiveDist;
  // se desvanece apenas la barcaza empieza a ser clara (~0.55): a partir de ahi el propio barco
  // es la referencia y el marcador solo taparia el puente.
  const fade = p < 0.55 ? 1 : Math.max(0, 1 - (p - 0.55) / 0.12);
  if (fade <= 0) return;
  const tx = W / 2 - cam.x * 1.2;                       // misma columna que la barcaza objetivo
  const mx = Math.max(9, Math.min(W - 9, tx));          // pegado al borde si quedo afuera
  const off = tx < 9 ? -1 : tx > W - 9 ? 1 : 0;         // -1 izquierda, 1 derecha, 0 en pantalla
  const pulse = 0.62 + 0.38 * (0.5 + 0.5 * Math.sin(run.t * 4));
  ctx.save();
  ctx.globalAlpha = fade * pulse;
  ctx.fillStyle = P.warn;
  if (off === 0) {
    const bob = Math.sin(run.t * 2) * 1.2, ty = HOR - 14 + bob;
    ctx.beginPath();                                    // cuña apuntando hacia abajo, al horizonte
    ctx.moveTo(mx, ty + 10); ctx.lineTo(mx - 5, ty); ctx.lineTo(mx + 5, ty); ctx.closePath(); ctx.fill();
    ctx.globalAlpha = fade * pulse * 0.5;               // tallo tenue hasta la linea del horizonte
    ctx.fillRect(Math.round(mx) - 0.5, ty + 10, 1.5, HOR - (ty + 10));
  } else {                                              // flecha lateral pegada al borde
    const ay = HOR - 9, dir = off;
    ctx.beginPath();
    ctx.moveTo(mx + dir * 6, ay); ctx.lineTo(mx - dir * 3, ay - 6); ctx.lineTo(mx - dir * 3, ay + 6); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}



// ---------- OVERLAY DE HITBOXES (cfg.hitboxes, menu [M]) ----------
// Pinta en VERDE FLUOR la zona que realmente colisiona. Las medidas NO se copian: salen de
// core/hitbox.js, el mismo modulo que usa systems/collision.js para decidir el choque — por eso
// lo que se ve es exactamente lo que golpea.
const HB = '#39ff14';                 // verde fluor: no existe en la paleta del juego, no se confunde
const HB_PLANE = '#ff2fd0';           // el perfil del AVION va en magenta para distinguirlo
const HB_SOFT = '#14e0ff';            // zonas de daño NO letal (bandada, hongo) en celeste

/** Caja de mundo (centro x,y a profundidad z, semi-ejes hw/hh) pintada sobre la pantalla. */
function hbBox(x, y, z, hw, hh, col, alpha) {
  const s = proj(x, y, z);
  if (s.k <= 0) return;
  const w = hw * 2 * s.k, h = hh * 2 * s.k;
  ctx.globalAlpha = alpha === undefined ? 0.28 : alpha;
  px(s.x - w / 2, s.y - h / 2, w, h, col);
  ctx.globalAlpha = 1;
  ctx.strokeStyle = col; ctx.lineWidth = 1;                 // contorno: deja ver el borde exacto
  ctx.strokeRect(Math.round(s.x - w / 2) + 0.5, Math.round(s.y - h / 2) + 0.5, Math.round(w), Math.round(h));
}

export function drawHitboxes() {
  for (const o of obstacles) {
    // hasta la profundidad de aparicion: si el overlay cortara antes (estaba en 200, de cuando el
    // spawn tambien era mas cerca) los bichos recien nacidos se dibujarian SIN caja, que es
    // exactamente la lectura que esta herramienta existe para desmentir
    if (o.z <= 1 || o.z > SPAWN_Z) continue;
    if (o.type === 'trench') continue;                       // decorado: no colisiona
    if (o.type === 'birds') { hbBox(o.x, o.y, o.z, 4.5, 2.6, HB_SOFT); continue; }
    if (o.type === 'boom') {                                 // hongo: daña por altura creciente
      const top = 9 + Math.min(1, o.boomT / 1.1) * 27;
      hbBox(o.x, top / 2, o.z, 10, top / 2, HB_SOFT); continue;
    }
    if (o.type === 'bomb') { hbBox(o.x, o.y, o.z, 2.2, 2.4, HB); continue; }
    if (o.type === 'airboom' || o.type === 'chunk') continue;   // FX puros: no colisionan
    const { hw, hh, oy } = hitbox(o);
    hbBox(o.x, oy, o.z, hw, hh, HB);
    // BARRIDO DEL CASCO: a ras del suelo lo vertical engancha aunque el centro no coincida.
    // Es la parte que mas sorprende al jugador, asi que se marca aparte y mas tenue.
    const reach = hullReach(o, hw);
    if (reach > 0) hbBox(o.x, HULL_Y / 2, o.z, reach, HULL_Y / 2, HB, 0.12);
  }
  // SOLDADOS: la caja llena es el CUERPO; el contorno tenue es el alcance real del atropello
  // (cuerpo + semi-envergadura del avion), que es lo que de verdad decide el impacto.
  const swp = planeBox(run.rollT > 0 || mvTight(run.mv)).pw;
  for (const sd of soldiers) {
    if (sd.dead || sd.z <= 1 || sd.z > 60) continue;
    hbBox(sd.x, SOLDIER.top / 2, sd.z, SOLDIER.hw + swp, SOLDIER.top / 2, HB, 0.08);
    hbBox(sd.x, SOLDIER.top / 2, sd.z, SOLDIER.hw, SOLDIER.top / 2, HB, 0.3);
  }
  // PERFIL DEL AVION: la otra mitad de cada choque. Sin esto el overlay solo cuenta la mitad.
  const { pw, ph } = planeBox(run.rollT > 0 || mvTight(run.mv));
  hbBox(plane.x, plane.y, PZ, pw, ph, HB_PLANE, 0.3);
}


// ---------- CARRIL DEL AVION (MODO CAMARA, cfg.devcam) ----------
// Marca en VERDE FLUOR la zona por la que viaja el avion, para ubicarlo desde una camara libre:
//   - los BORDES del corredor (x = ±FLY_X) sobre el piso, corriendo hacia el horizonte
//   - travesaños de profundidad cada 25 unidades, para leer distancias
//   - el MARCO a la profundidad del avion (z = PZ): la ventana real por la que pasa, del piso a
//     FLY_TOP — el techo de vuelo
//   - un tick sobre el marco a la altura ACTUAL del avion
// Todo se proyecta con proj(), asi que acompaña a la camara este donde este.
export function drawFlightLane() {
  const G = '#39ff14';
  ctx.strokeStyle = G; ctx.lineWidth = 1;
  // bordes del corredor sobre el piso
  ctx.globalAlpha = 0.75;
  for (const sgn of [-1, 1]) {
    const a = proj(sgn * FLY_X, 0, 5), b = proj(sgn * FLY_X, 0, 235);
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
  }
  // travesaños de profundidad
  ctx.globalAlpha = 0.2;
  for (let z = 25; z <= 225; z += 25) {
    const l = proj(-FLY_X, 0, z), r = proj(FLY_X, 0, z);
    ctx.beginPath(); ctx.moveTo(l.x, l.y); ctx.lineTo(r.x, r.y); ctx.stroke();
  }
  // marco a la profundidad del avion
  const bl = proj(-FLY_X, 0, PZ), br = proj(FLY_X, 0, PZ);
  const tl = proj(-FLY_X, FLY_TOP, PZ), tr = proj(FLY_X, FLY_TOP, PZ);
  ctx.globalAlpha = 0.9;
  ctx.beginPath();
  ctx.moveTo(bl.x, bl.y); ctx.lineTo(br.x, br.y); ctx.lineTo(tr.x, tr.y); ctx.lineTo(tl.x, tl.y);
  ctx.closePath(); ctx.stroke();
  // tick a la altura actual del avion, sobre los dos lados del marco
  const pl2 = proj(-FLY_X, plane.y, PZ), pr2 = proj(FLY_X, plane.y, PZ);
  px(pl2.x - 3, pl2.y, 6, 1, G); px(pr2.x - 3, pr2.y, 6, 1, G);
  ctx.globalAlpha = 1;
  // ayuda de teclas (arriba, fuera del paso del HUD)
  ctx.font = '8px monospace'; ctx.textAlign = 'center'; ctx.fillStyle = G;
  ctx.globalAlpha = 0.8;
  ctx.fillText('CAM LIBRE   ↑↓ avanzar · ←→ lateral · R/F altura · SHIFT x4', W / 2, 14);
  ctx.globalAlpha = 1;
}


// ---------- RED DE RADAR (cfg.radarNet) ----------
// Hace VISIBLE el techo del corredor seguro: por encima de RADAR_ALT el radar te carga y empiezan
// las oleadas de misiles. Hasta ahora esa frontera era invisible — se aprendia muriendo.
//
// Se dibuja como una MALLA en perspectiva a la altura exacta de deteccion, con un BARRIDO que
// viaja desde el horizonte hacia la camara, como el haz que gira en una pantalla de radar. Es un
// plano horizontal, asi que en esta proyeccion se ve como un techo de rejilla sobre el avion.
//
// ANCLADA AL MUNDO: las lineas de profundidad se calculan contra run.dist, asi que la malla
// SCROLLEA con el terreno en vez de quedar pegada a la camara. Sin eso se leeria como una
// calcomania del HUD y no como algo que esta ahi afuera.
const NET_STEP = 24;        // separacion entre travesaños, en unidades de mundo
const NET_Z0 = 18, NET_Z1 = 232;
const NET_CYAN = '#2fe0d0', NET_WARN = '#ff5a3c';
const SWEEP_DUR = 2.6;      // segundos que tarda el barrido en recorrer la malla

// visibilidad animada de la red (modo AL ENTRAR): 0 = invisible, 1 = plena. Se interpola para que
// cruzar el techo la haga APARECER, no aparecer de golpe — un pop de una malla a pantalla completa
// se lee como un glitch.
let netVis = 0, netLastT = 0;

export function drawRadarNet() {
  if (S.state !== 'play' && S.state !== 'takeoff') return;
  const A = RADAR_ALT;
  // DENTRO de la zona: la malla vira a rojo y late. Es el mismo dato que la barra del HUD, pero
  // puesto donde el jugador esta mirando (el avion), no en un rincon.
  const inside = plane.y > A;
  // MODO 1 (AL ENTRAR, default): solo se ve estando dentro. MODO 2: siempre.
  const want = cfg.radarNet === 2 || inside ? 1 : 0;
  // dt propio a partir del reloj del run: draw() no recibe dt, y usar un paso fijo ataria el
  // fundido a los fps. Se acota por si el run se reinicio (run.t vuelve a 0).
  const dt = Math.max(0, Math.min(0.05, run.t - netLastT)); netLastT = run.t;
  netVis += (want - netVis) * Math.min(1, dt * 7);
  if (netVis < 0.02) return;
  // APAGADO POR INCLINACION. Esta malla se lee como TECHO porque es un plano horizontal visto
  // desde abajo: los largueros fugan al horizonte y los dos bordes marcados son las paredes del
  // corredor. Con el mundo rolado esa lectura se cae — la rejilla pasa a ser una pared de lineas
  // naranjas cruzando el mar, y sus bordes, que derecho eran informacion, se leen como el
  // contorno de una chapa flotando. Deja de informar y pasa a ser ruido, asi que se funde.
  // No se pierde nada: el aviso RADAR, la barra de carga y la altura en rojo estan en el HUD,
  // que NO gira. Ver tiltFade en core/horizon.js — se mide la inclinacion que se VE, venga del
  // tonel, del giro libre o del banqueo.
  const lean = tiltFade(hzWorld());
  if (lean < 0.02) return;
  const col = inside ? NET_WARN : NET_CYAN;
  const pulse = (inside ? 0.55 + 0.45 * Math.abs(Math.sin(run.t * 6)) : 1) * netVis * lean;
  // el BARRIDO recorre la profundidad en bucle; `sweepZ` es donde esta ahora
  const sweepZ = NET_Z1 - ((run.t / SWEEP_DUR) % 1) * (NET_Z1 - NET_Z0);

  // SUPERFICIE: el techo se rellena tenue para que se lea como un PLANO y no como un puñado de
  // lineas sueltas. Es lo que hace visible "la zona": por encima de esta chapa te detectan.
  const nl = proj(-FLY_X, A, NET_Z0), nr = proj(FLY_X, A, NET_Z0);
  const fl = proj(-FLY_X, A, NET_Z1), fr = proj(FLY_X, A, NET_Z1);
  ctx.fillStyle = col;
  ctx.globalAlpha = (inside ? 0.13 : 0.07) * pulse;
  ctx.beginPath();
  ctx.moveTo(nl.x, nl.y); ctx.lineTo(nr.x, nr.y); ctx.lineTo(fr.x, fr.y); ctx.lineTo(fl.x, fl.y);
  ctx.closePath(); ctx.fill();

  ctx.strokeStyle = col; ctx.lineWidth = 1;
  // TRAVESAÑOS (lineas de z constante). Se anclan al mundo con run.dist: el primero no esta a una
  // distancia fija de la camara sino en el proximo multiplo de NET_STEP del terreno.
  const off = run.dist % NET_STEP;
  for (let z = NET_Z0 - off; z <= NET_Z1; z += NET_STEP) {
    if (z < NET_Z0) continue;
    const l = proj(-FLY_X, A, z), r = proj(FLY_X, A, z);
    // el travesaño mas cercano al barrido se enciende: es el frente de onda del radar
    const d = Math.abs(z - sweepZ);
    const hot = Math.max(0, 1 - d / 34);
    ctx.globalAlpha = (0.32 + hot * 0.6) * pulse;
    ctx.beginPath(); ctx.moveTo(l.x, l.y); ctx.lineTo(r.x, r.y); ctx.stroke();
  }
  // LARGUEROS (lineas de x constante) fugando al horizonte
  ctx.globalAlpha = 0.34 * pulse;
  for (let x = -FLY_X; x <= FLY_X; x += 9.5) {
    const a = proj(x, A, NET_Z0), b = proj(x, A, NET_Z1);
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
  }
  // BORDES del techo: los dos largueros extremos, bien marcados — son "la linea que no hay que cruzar"
  ctx.globalAlpha = 0.8 * pulse;
  for (const sgn of [-1, 1]) {
    const a = proj(sgn * FLY_X, A, NET_Z0), b = proj(sgn * FLY_X, A, NET_Z1);
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
  }
  // FRENTE DE BARRIDO: la linea viva, mas gruesa, con estela hacia atras (como el haz del radar)
  for (let i = 0; i < 5; i++) {
    const z = sweepZ + i * 7;
    if (z > NET_Z1) break;
    const l = proj(-FLY_X, A, z), r = proj(FLY_X, A, z);
    ctx.globalAlpha = (0.55 - i * 0.11) * pulse;
    ctx.beginPath(); ctx.moveTo(l.x, l.y); ctx.lineTo(r.x, r.y); ctx.stroke();
  }
  // LINEA DE UMBRAL a la profundidad del AVION: "por encima de esto, te ven". Es la lectura que
  // convierte la malla en informacion util y no en decoracion. Solo entra en pantalla cuando el
  // avion se acerca al techo — a PZ la escala es enorme (9.6 px por unidad) y lejos del umbral la
  // linea queda fuera del cuadro, que es justo cuando no hace falta.
  const t0 = proj(-FLY_X, A, PZ), t1 = proj(FLY_X, A, PZ);
  if (t0.y > -4 && t0.y < H + 4) {
    ctx.globalAlpha = pulse;
    ctx.setLineDash([6, 4]);
    ctx.beginPath(); ctx.moveTo(t0.x, t0.y); ctx.lineTo(t1.x, t1.y); ctx.stroke();
    ctx.setLineDash([]);
  }
  ctx.globalAlpha = 1;
}
