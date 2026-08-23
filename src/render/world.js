// RENDER DEL MUNDO: mar, tierra, cielo bajo (la turba y la pista), la malla de puntos del oleaje,
// la estela, los obstaculos y la barcaza objetivo acercandose en el horizonte.
//
// Todo se dibuja en coordenadas de mundo proyectadas (proj); el orquestador (draw en game.js) ya
// dejo aplicados los transforms de camara/roll/zoom antes de llamar aca. El cielo alto (degradado,
// sol, nubes, islas) y los loops de entidades del jugador siguen inline en el orquestador.

import { ctx, px, W, H, HOR, F, PZ } from './ctx.js';
import { theme, applyTheme } from './theme.js';
import { cam, cfg, S, plane } from '../core/state.js';
import { run } from '../core/run.js';
import { wake, obstacles, soldiers } from '../core/world.js';
import { proj } from '../core/fx.js';
import { hzWorld, tiltFade } from '../core/horizon.js';
// EL MAR VIVE EN core/sea.js — puro, sin canvas ni stores — porque la colision de las olas tiene
// que evaluar la MISMA superficie que se dibuja, y un sistema no puede importar del render.
import { seaH as seaBase, olaBump, climaDe, resaca } from '../core/sea.js';
// EL RELIEVE (T3): hermano de core/sea.js. Lo que levanta el pasto y las estructuras aca es lo
// mismo que decide el choque contra el suelo en systems/flight.js.
import { tierraH, tierraPend, hayRelieve, pedreroAt, turbalAt } from '../core/tierra.js';
import { P, LAND, CLAND, SKY_ASTRO } from '../data/palette.js';
import { CHUNK_LIFE, ONDA_T, ONDA_R } from '../data/despiece.js';
import { drawParte, yawDe, colorDe } from './partes.js';
import { SHIP_UH, SHIP_DECK, SHORE_X, shoreAt, SAND_W, portJut, PORT_AMP, PORT_FOAM, FLY_X, FLY_TOP, RADAR_ALT, SHIP_H, SPAWN_Z, VEIL_MAX, OLA_WZ, RESACA_MAX, SEA_FOAM_TH, SUN_GLINT_HALF, TIERRA_LUZ, TIERRA_AMP, KELP_W, KELP_A,
  ALAMBRE_CADA, ALAMBRE_POSTE, ALAMBRE_H, MOJADO_A, CHARCO_P, CHARCO_H, PASTO_LEAN, PASTO_ONDA, PASTO_V, PASTO_KX, PASTO_KZ, PASTO_ACOSTAR, RACHA_N, RACHA_T, RACHA_A } from '../data/tuning.js';
import { RUNWAYS, PORT_H } from '../data/runways.js';
import { SHIP_CLASS } from '../data/ships.js';
import { hitbox, planeBox, hullReach, HULL_Y, SOLDIER } from '../core/hitbox.js';
import { inBank, fogVis, fogTop, fogFade } from '../systems/fog.js';
import { mvTight } from '../data/moves.js';
import * as boomArt from './boom.js';
import * as blastArt from './blast.js';
import * as enemyArt from './enemies.js';
import * as momentum from '../legacy/momentum.js';
import * as momRender from '../legacy/momentum_render.js';
// R3 — EL HANDOFF. La escala aparente sale de la camara del CLIMAX (una sola definicion, ver
// three-arena) y la distancia del corte, de la data de la PASADA. El pasillo no inventa ningun
// tamaño: dibuja el buque a la distancia a la que el jugador REALMENTE esta.
import { pxPerM, shipBeamM, shipTopM, SHIP_LEN } from '../systems/three-arena.js';
import { ENTRY_D, LANE_PARALLAX } from '../data/pasada.js';

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
/** El campo de altura del mar, ya en `core/sea.js` — acá queda el ENVOLTORIO que le pone el reloj.
 *
 *  Se mudó porque la colisión de las olas tiene que evaluar la MISMA superficie que el render, y
 *  un sistema no puede importar del render. Este envoltorio existe (en vez de exportar la de core
 *  directamente) porque `world.seaH` se pasa POR REFERENCIA a los mundos 3D —
 *  `world3D.frame({ seaH: world.seaH })` — y allá se la llama con dos argumentos: cambiarle la
 *  firma en el lugar equivocado los dejaba con `t` undefined y el mar 3D plano. Ver SPEC §9.1. */
export const seaH = (wx, wz) => seaBase(wx, wz, run.t, climaDe(cfg));

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
      ctx.globalAlpha = 0.4; px(x0, y, x1 - x0, 1, theme.land.furrow); ctx.globalAlpha = 1;
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
const FOG_RGB = hex2rgb(FOG_C), FOG_MID_RGB = hex2rgb(FOG_MID), FOG_DEEP_RGB = hex2rgb(FOG_DEEP);
const FOG_BLEND = 3.5;   // unidades de mundo para pasar de "adentro" a "arriba del techo"
// EL FILO DEL TECHO. Estas dos son la diferencia entre niebla y una losa gris: la cubierta vista
// desde arriba terminaba en una RECTA de lado a lado con una banda clara encima, y eso no se lee
// como bruma sino como un rectangulo pintado. `FOG_EDGE` son las filas en las que el techo pasa de
// nada a lleno; `FOG_ONDA` es cuanto se despeina ese filo, que es lo que le saca la regla.
const FOG_EDGE = 24, FOG_ONDA = 7;
// ANCHO DE LA COLUMNA del filo. Con 20 px los escalones entre columna y columna se ven: el techo
// pasaba de recta a SIERRA, que tampoco es niebla. Con 10 el diente cae por debajo de lo que el
// ojo separa a esta escala y el filo se lee como un borde deshilachado.
const FOG_SEG = 10;

/** Cuanto estas METIDO en la niebla: 1 bien adentro, 0 en el techo o arriba. */
function fogInside() {
  return Math.max(0, Math.min(1, (fogTop() - plane.y) / FOG_BLEND));
}

/** El gris de la cubierta a profundidad `f` (0 = horizonte, 1 = a tus pies), INTERPOLADO.
 *
 *  Antes eran tres tonos elegidos con dos `if` y se veian los dos escalones — tres franjas planas
 *  con corte duro, que es la otra mitad de por que la niebla parecia un bloque. Mismo criterio que
 *  `groundCol` para el suelo: la niebla no tiene bandas, tiene profundidad. */
function fogCol(f) {
  const [a, b, t] = f < 0.5 ? [FOG_RGB, FOG_MID_RGB, f / 0.5] : [FOG_MID_RGB, FOG_DEEP_RGB, (f - 0.5) / 0.5];
  return 'rgb(' + (a[0] + (b[0] - a[0]) * t | 0) + ',' + (a[1] + (b[1] - a[1]) * t | 0) + ',' + (a[2] + (b[2] - a[2]) * t | 0) + ')';
}

export function drawFog() {
  // LA RAMPA MANDA. Todo lo que sigue se multiplica por ella, asi que el banco entra y sale
  // difuminado en vez de encenderse en un metro (ver fogFade en systems/fog.js).
  const fade = fogFade();
  if (fade <= 0.002) return;
  const inside = fogInside();
  const yEnd = rowEnd();
  const vis = fogVis();
  // ---- CUBIERTA: la niebla vista desde arriba tapa el agua y lo que este bajo ----
  // Son las MISMAS filas del mar (un plano horizontal se proyecta igual), asi que no hay geometria
  // nueva: se pintan de gris. Cuanto mas alto vas, mas cerrada se ve la cubierta.
  const deck = (1 - inside) * fade;
  if (deck > 0.01) {
    // EL FILO, pintado POR COLUMNAS — el unico tramo del render de la niebla que no va por filas.
    // Cada columna tiene su propia altura de arranque (dos senos, deterministas y lentos: el
    // banco respira al avanzar) y adentro de ella el gris sube de 0 a lleno. Sin esto el techo es
    // una recta de lado a lado, y una recta no es niebla.
    const yFill = HOR + 1 + FOG_EDGE + FOG_ONDA * 2;
    for (let sx = -70; sx < W + 70; sx += FOG_SEG) {
      // tres senos incoformables: uno largo (la panza del banco), uno medio y uno corto (el grano
      // del borde). Deterministas y lentos — el banco respira al avanzar, no titila.
      const on = Math.sin(sx * 0.021 + run.dist * 0.02) * FOG_ONDA
        + Math.sin(sx * 0.062 - run.dist * 0.013) * FOG_ONDA * 0.55
        + Math.sin(sx * 0.147 + run.dist * 0.031) * FOG_ONDA * 0.28;
      const y0 = HOR + 1 + on;
      const alto = yFill - y0;
      for (let y = Math.max(HOR - FOG_ONDA * 2, y0); y < yFill; y++) {
        const f = Math.max(0, Math.min(1, (y - HOR) / (H - HOR)));
        ctx.globalAlpha = deck * (0.95 - f * 0.72) * Math.max(0, Math.min(1, (y - y0) / alto));
        px(sx, y, FOG_SEG, rowH, fogCol(f));
      }
    }
    // y de ahi para abajo, la cubierta llena. El color se INTERPOLA con la profundidad (fogCol):
    // mirando casi en vertical se ve HACIA ADENTRO del banco, donde no entra luz — eso da volumen
    // y ademas deja legible el HUD, que se dibuja sobre esta franja.
    for (let y = yFill; y < yEnd; y++) {
      const f = Math.min(1, (y - HOR) / (H - HOR));
      // LA LEY DE LA NIEBLA: tapa LEJOS y deja ver CERCA. Contra el horizonte se mira a lo largo
      // del banco —kilometros de bruma— y no se ve nada; justo debajo tuyo se lo mira casi en
      // vertical, o sea a traves de unos pocos metros, y el agua se ve. Antes iba de 0.88 a 0.58:
      // un vidrio esmerilado parejo, que tapaba tanto lo que tenias encima como lo que venia.
      ctx.globalAlpha = deck * (0.95 - f * 0.72);
      px(-70, y, W + 140, rowH, fogCol(f));
    }
  }
  // ---- VELO: adentro, el gris crece con la profundidad ----
  if (inside > 0.01) {
    const velo = inside * fade;
    for (let y = HOR + 1; y < yEnd; y++) {
      const z = cam.y * F / (y - HOR);
      // niebla exponencial: la de siempre. A z = vis queda en 63%, a 2*vis en 86%.
      ctx.globalAlpha = velo * Math.min(0.96, 1 - Math.exp(-z / vis));
      px(-70, y, W + 140, rowH, FOG_C);
    }
    // EL CIELO tambien, pero DEGRADADO y no de un plumazo: adentro del banco lo que se ve arriba
    // es mas claro —es por donde se sale, y el juego entero empuja para alla— asi que la bruma se
    // cierra contra el horizonte y se abre hacia el cenit. De un solo rect plano salia otra losa.
    for (let y = -140; y <= HOR + 1; y++) {
      const u = Math.max(0, Math.min(1, (y + 140) / (HOR + 141)));   // 0 arriba del todo, 1 al horizonte
      // el minimo NO baja de 0.55: adentro del banco el cielo sigue lechoso. La regla del tramo es
      // "abajo ciego, arriba se ve" — arriba se VE, pero a traves de bruma.
      ctx.globalAlpha = velo * (0.55 + 0.4 * u * u);
      px(-70, y, W + 140, 1, FOG_C);
    }
  }
  ctx.globalAlpha = 1;
}

export function drawSea() {
  refreshGround();   // el suelo es TEMA: si cambio el cielo, cambian sus tablas
  rowH = hzWorld() ? 2 : 1;   // ver rowH: con el mundo derecho no cambia NADA del dibujo de siempre
  const landMode = cfg.terrain === 'land';
  const relieveOn = hayRelieve(cfg);
  const mojado = MOJADO_A[cfg.rain | 0] || 0;   // T6: cuanto oscurece la lluvia el suelo
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
      // VOLUMEN DE LA LOMA (T3). La cara que SUBE alejandose es la que nos da el frente: se
      // aclara; el lomo de atras se oscurece. Es lo unico que hace visible una loma ANTES de
      // estar encima — y una loma que no se ve venir no es terreno, es una trampa.
      if (relieveOn) {
        const sh = tierraPend(cam.x, wz) * TIERRA_LUZ * 34;
        if (sh > 0.012 || sh < -0.012) {
          ctx.globalAlpha = Math.min(0.3, Math.abs(sh));
          px(-70, y, W + 140, rowH, sh > 0 ? '#f6f0dc' : '#0b0f09');
          ctx.globalAlpha = 1;
        }
      }
      if (Math.sin(wz * 0.13) + Math.sin(wz * 0.05) < -0.95) {           // surco SUAVE (antes corte duro)
        ctx.globalAlpha = 0.4; px(-70, y, W + 140, 1, theme.land.furrow); ctx.globalAlpha = 1;
      }
      turbalRow(y, wz, k);                                               // T5: los cortes de turba
      // LA LLUVIA MOJA EL SUELO (T6). Es un VELO sobre el color resuelto, no una paleta nueva:
      // la turba mojada es la misma turba mas oscura y mas fria, y hacerlo asi la deja funcionar
      // con los cinco climas de T1 en vez de pelearse con ellos.
      if (mojado > 0) { ctx.globalAlpha = mojado; px(-70, y, W + 140, rowH, '#0c1418'); ctx.globalAlpha = 1; }
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
        ctx.globalAlpha = 0.4; px(-70, y, Math.max(0, sandSx + 70), 1, theme.cland.furrow); ctx.globalAlpha = 1;
      }
      groundMottle(y, wz, k, sandSx);
      // playa: arena mojada cerca del agua, seca contra la tierra
      const sandW2 = Math.max(1, shoreSx - sandSx);
      px(sandSx, y, sandW2, 1, f < 0.4 ? '#7d7154' : '#8f8163');
      // LA RESACA (T4). El agua SUBE por la arena y se retira: la lengua de esta fila sale de
      // `resaca()`, que tiene fase por posicion a lo largo de la orilla — asi la playa no rompe
      // toda junta y se ve la lengua correr por la costa.
      const swash = resaca(wz, run.t);
      const swashSx = shoreSx - sandW2 * swash;
      // ARENA MOJADA: la franja que la lengua ya destapo, entre la marca de la subida mas alta y
      // el agua de ahora. Va del lado de TIERRA del filo —es lo que el agua dejo atras— y es la
      // mitad que hace legible el movimiento: sin ella sube y baja una raya blanca sola.
      const maxSx = shoreSx - sandW2 * RESACA_MAX;
      px(maxSx, y, Math.max(0, swashSx - maxSx), 1, f < 0.4 ? '#5d5546' : '#6a6254');
      px(swashSx, y, Math.max(0, W + 70 - swashSx), 1, f < 0.22 ? theme.water.base0 : f < 0.5 ? theme.water.base1 : theme.water.base2);
      // KELP (T4.3): el alga del bajo. Malvinas es kelp puro, y ademas le da textura al agua
      // somera, que sin esto es una banda lisa de color.
      kelpRow(y, wz, k, shoreW);
      // LA LENGUA: la espuma va en el BORDE del agua, que ahora se mueve. Mas brillante cuanto
      // mas alto llego (la lengua que mas sube es la que mas rompe).
      ctx.globalAlpha = 0.3 + 0.6 * (swash / RESACA_MAX);
      px(swashSx - 1, y, 2.5, 1, P.foam);
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

// GRADIENTES Y PASTO DEL SUELO ACTIVO. Antes eran dos `const` calculadas una vez al importar, y
// eso era exactamente lo que clavaba la turba en un solo verde: la paleta del suelo ahora es TEMA
// (theme.land / theme.cland, PLAN_TIERRA_COSTA T1) y cambia con el cielo.
//
// Se recalculan SOLO cuando cambia la paleta, no por fila ni por cuadro: se compara la referencia
// del objeto, que es barato y exacto porque `applyTheme` asigna el estilo entero.
let LAND_ST, CLAND_ST, TUFTS, TUFT_TIP, TUFTS_DRY, TUFT_TIP_DRY;
let palLand = null, palCland = null;

// VARIANTES DE PASTO a partir de UN color. El campo no puede ser de un solo verde —seis tonos son
// los que le dan grano— pero tampoco puede haber seis listas escritas a mano por clima: seria
// garantizar que un dia una quede desfasada. Se derivan del `tuft` del estilo multiplicando el
// brillo; la punta va mas clara, que es lo que le da volumen al matojo.
const TUFT_F = [1.0, 1.13, 0.84, 1.26, 0.75, 1.34];
const mul = (hex, f) => {
  const [r, g, b] = hex2rgb(hex);
  const c = v => Math.max(0, Math.min(255, Math.round(v * f)));
  return 'rgb(' + c(r) + ',' + c(g) + ',' + c(b) + ')';
};
const tuftSet = (hex, tip) => TUFT_F.map(f => mul(hex, f * (tip ? 1.3 : 1)));

/** Refresca las tablas del suelo si cambio el tema. La llama drawSea antes de pintar una fila. */
function refreshGround() {
  if (theme.land !== palLand) {
    palLand = theme.land;
    LAND_ST = mkStops(palLand);
    TUFTS = tuftSet(palLand.tuft, false);
    TUFT_TIP = tuftSet(palLand.tuft, true);
  }
  if (theme.cland !== palCland) {
    palCland = theme.cland;
    CLAND_ST = mkStops(palCland);
    // el pasto SECO de la costa sale del mismo tono de la arena, aclarado: es el pasto que crece
    // sobre la duna, no el de la turba
    TUFTS_DRY = tuftSet(palCland.near, false);
    TUFT_TIP_DRY = tuftSet(palCland.near, true);
  }
}
refreshGround();

// paleta de matojos: varios verdes + un par secos/amarillentos, para que el pasto no sea monocromo.
// TUFT_TIP es la punta iluminada de cada uno (mismo índice) → le da volumen en vez de ser un rect plano.


// matas/rocas dispersas sobre la tierra (parallax de movimiento a ras del suelo). La posición y el
// color salen de un hash por celda: distribución aleatoria de verdad (sin patrón) y colores variados.
// pasto seco de la costa (arenoso, casi sin verde) — mismo indice que TUFTS


/** LA INCLINACION DEL PASTO en un punto del mundo (T2). Vive afuera del loop —y exportada— por
 *  la misma razon que `seaH` vive en core/sea.js: lo que se mide desde afuera tiene que ser lo
 *  MISMO que dobla los matojos en pantalla, no una copia parecida.
 *
 *  Devuelve fraccion de la altura del matojo: 0 = parado, 0.68 = tumbado por la tormenta. */
export function pastoLean(wx, wz, t, clima) {
  const amp = PASTO_LEAN[clima] || 0;
  if (amp === 0) return 0;
  // parte CONSTANTE (el viento que sopla siempre) + parte ONDA (la racha que cruza). Solo onda
  // seria un pasto que se para del todo entre racha y racha, que no es lo que hace el viento.
  return amp * ((1 - PASTO_ONDA) + PASTO_ONDA * (0.5 + 0.5 * Math.sin(wx * PASTO_KX + wz * PASTO_KZ - t * PASTO_V)));
}

/** TURBAL (T5): el tablero de turba cortada, fila por fila. Se pinta en el raster —y no como
 *  prop— porque es EL SUELO lo que esta cortado: un rectangulo oscuro con la cara del corte
 *  levantada. Es lo que hace que el campo se lea trabajado y no salvaje. */
function turbalRow(y, wz, k) {
  const t = turbalAt(wz);
  if (!t) return;
  const sx0 = W / 2 + (t.x0 - cam.x) * k, sx1 = W / 2 + (t.x1 - cam.x) * k;
  if (sx1 < -70 || sx0 > W + 70) return;
  const x0 = Math.max(-70, sx0), w = Math.min(W + 70, sx1) - x0;
  if (w <= 0) return;
  ctx.globalAlpha = t.cara ? 0.75 : 0.45;
  px(x0, y, w, 1, t.cara ? '#6b5f3f' : theme.land.furrow);   // la cara del corte va CLARA: es turba fresca
  ctx.globalAlpha = 1;
}

/** KELP (T4.3): manchas oscuras de alga en el bajo, mar adentro de la orilla. Deterministas por
 *  banda de mundo —como el moteado del suelo— asi el alga esta SIEMPRE en el mismo lugar del mar
 *  y no titila; el kelp de verdad tampoco se muda. */
function kelpRow(y, wz, k, shoreW) {
  const band = Math.floor(wz / 5);
  for (let i = 0; i < 3; i++) {
    const h1 = hash2(band, i * 977 + 31);
    if (h1 < 0.55) continue;
    const off = 2 + hash2(band, i * 977 + 53) * KELP_W;
    const sx = W / 2 + (shoreW + off - cam.x) * k, w = (3 + h1 * 7) * k;
    if (sx + w < -70 || sx > W + 70) continue;
    ctx.globalAlpha = KELP_A * (0.6 + h1 * 0.4);
    px(sx, y, w, 1, '#0f1a14');
    ctx.globalAlpha = 1;
  }
}

// CHARCOS PINTADOS en el ultimo cuadro (T6). La sonda tiene que poder mirar lo que SE DIBUJO —
// no la perilla— o estaria probando que una constante vale lo que vale.
let charcosN = 0, charcosUlt = 0;

function drawLand(coastMode) {
  // pasos DIVIDIDOS por U al subir la resolucion: sin esto se dibujaria la misma cantidad de
  // matas pero 1.5x mas grandes (misma imagen agrandada). Bajarlos es lo que convierte los
  // pixeles nuevos en densidad real.
  const SPX = 2.8, SPZ = 2.8, farZ = 190;
  const dv = run.dist + momentum.drift();
  // EL VIENTO (T2). Se resuelve UNA vez por cuadro, no por matojo: adentro del loop daria siempre
  // lo mismo y se pagaria miles de veces (la regla §1.5 del plan, la misma del mar).
  const climaP = climaDe(cfg);
  const quieto = (PASTO_LEAN[climaP] || 0) === 0;
  const relieve = hayRelieve(cfg);
  const mojado = MOJADO_A[cfg.rain | 0] || 0;
  charcosN = 0;
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
      // EL PEDRERO (T5) se consulta ANTES de la densidad: adentro del rio de piedra el suelo esta
      // lleno, y el sorteo disperso del pasto lo dejaria ralo — un pedrero con claros no es un
      // pedrero, es pasto gris.
      const ped = coastMode ? 0 : pedreroAt(wx, wz);
      if (h1 < 0.5 && ped < 0.3) continue;                               // densidad dispersa
      const h2 = hash2(ix + 1013, iz - 271), h3 = hash2(ix - 577, iz + 977);
      // JITTER: se corre la mata dentro de su celda → rompe la grilla (esto mata el look de patrón)
      const jx = wx + (h2 - 0.5) * SPX * 1.7, jz = wz + (h3 - 0.5) * SPZ * 1.7;
      const camZ = jz - dv;
      if (camZ < 2) continue;
      const k = F / camZ;
      const fade = Math.min(1, (camZ - 3) / 9) * (1 - (camZ / farZ) * 0.8);
      if (fade <= 0.03) continue;
      // EL PASTO SE LEVANTA CON LA LOMA (T3). Es la mitad visible de la fase: el raster de color
      // no se mueve (ver divergencia 10 del plan), asi que lo que dibuja el terreno es esto.
      const gyT = relieve ? tierraH(jx, jz) : 0;
      const s = proj(jx, gyT, camZ);
      if (s.x < -4 || s.x > W + 4 || s.y < HOR) continue;
      ctx.globalAlpha = fade * 0.85;
      // CHARCO (T6): el agua se junta en los BAJOS, que es donde se junta de verdad. Por eso esta
      // fase depende de T3 — sin relieve no hay bajo, y los charcos quedarian salpicados al azar
      // por una loma que no existe, que es la clase de detalle que se nota que es falso.
      if (mojado > 0 && relieve && gyT < TIERRA_AMP * CHARCO_H && h2 < CHARCO_P) {
        charcosN++;
        const pw = Math.max(1, k * (1.1 + h3 * 1.4)), phh = Math.max(1, k * 0.3);
        ctx.globalAlpha = fade * (0.4 + mojado * 1.6);
        px(s.x - pw / 2, s.y - phh, pw, phh, theme.sky.skyMid);          // el charco REFLEJA el cielo
        px(s.x - pw / 2, s.y - phh, pw, Math.max(1, phh * 0.35), theme.sky.horizon);
        // TORMENTA: el agua ya no se queda quieta, corre. El reguero sale del charco ladera abajo.
        if ((cfg.rain | 0) >= 3) px(s.x - pw * 0.12, s.y - phh - k * 0.9, Math.max(1, pw * 0.22), k * 0.9, theme.sky.skyMid);
        ctx.globalAlpha = 1;
        continue;
      }
      // PIEDRA DEL PEDRERO (T5): adentro del rio casi todo es piedra; en el borde se mezcla con
      // el pasto, que es como termina un pedrero de verdad — no con un filo.
      if (ped > 0.2 && h3 < 0.2 + ped * 0.72) {
        const w = Math.max(1, k * (0.5 + h2 * 0.7)), hh = Math.max(1, k * (0.3 + h2 * 0.35));
        const rx = s.x - w / 2, ry = s.y - hh;
        px(rx, ry, w, hh, '#736f63');                                    // la piedra del pedrero es GRIS, no marron
        px(rx, ry, w, Math.max(1, hh * 0.45), '#9a968a');                // cara al sol
        px(rx, s.y - Math.max(1, hh * 0.3), w, Math.max(1, hh * 0.3), '#3c3a34');
        ctx.globalAlpha = 1;
        continue;
      }
      if (h1 > 0.93) {                                                   // roca ocasional (con volumen)
        const w = Math.max(1, k * 0.75), hh = Math.max(1, k * 0.55), rx = s.x - w / 2, ry = s.y - hh;
        px(rx, ry, w, hh, theme.land.rock);
        px(rx, ry, w, Math.max(1, hh * 0.4), '#6b6552');                 // cara iluminada (arriba)
        px(rx, s.y - Math.max(1, hh * 0.28), w, Math.max(1, hh * 0.28), '#3a3529');   // sombra (base)
      } else {                                                          // matojo de pasto
        const TF = coastMode ? TUFTS_DRY : TUFTS, TT = coastMode ? TUFT_TIP_DRY : TUFT_TIP;
        const ci = (h3 * TF.length) | 0;
        const w = Math.max(1, k * 0.55);
        // LA ONDA: fase determinista por posicion de MUNDO — el matojo no guarda estado, y dos
        // matojos vecinos se doblan casi igual, que es lo que hace que se vea una racha cruzando
        // y no cada mata por su cuenta. `ond` va en [0,1]: 0 es quieto, 1 es el pico de la racha.
        const lean = quieto ? 0 : pastoLean(jx, jz, run.t, climaP);
        // con la racha encima el matojo ademas se ACUESTA: sin esto se corre la punta pero el
        // matojo mide lo mismo, y el pasto doblado es mas bajo que el pasto parado.
        const hh = Math.max(1, k * (0.65 + h2 * 0.6) * (1 - PASTO_ACOSTAR * lean));
        const bx = s.x - w / 2, by = s.y - hh;
        const dx = lean * hh;                                            // corrimiento de la punta, en px
        // se pinta en DOS tramos: la base queda clavada al suelo y el tramo de arriba ya va
        // corrido. Un solo rect inclinado despegaria el matojo de la tierra.
        const hB = hh * 0.5;
        px(bx, s.y - hB, w, hB, TF[ci]);                                 // base clavada
        px(bx + dx * 0.5, by, w, hh - hB + 1, TF[ci]);                   // tramo doblado (+1: sin costura)
        px(bx + dx, by, w, Math.max(1, hh * 0.4), TT[ci]);               // punta iluminada
        if (k > 3) {                                                    // cerca: briznas que se abren
          px(bx - Math.max(1, w * 0.4) + dx * 0.7, s.y - hh * 0.7, Math.max(1, w * 0.34), hh * 0.7, TF[ci]);
          px(bx + w + dx * 0.85, s.y - hh * 0.85, Math.max(1, w * 0.34), hh * 0.85, TT[ci]);
        }
      }
    }
  }
  ctx.globalAlpha = 1;
  charcosUlt = charcosN;   // T6: lo que se PINTO este cuadro, para que la sonda no mida una constante
  drawAlambre(dv, relieve);
  if (climaP === 'storm') drawRachas(dv, coastMode);
}

/** ALAMBRADOS (T5): postes con hilo CRUZANDO el pasillo, cada tantos cientos de metros.
 *
 *  Son la unica cosa de TAMAÑO CONOCIDO del paisaje. Sin algo asi la turba no tiene escala —
 *  podria medir cualquier cosa— y ademas, al cruzarlos, marcan la velocidad, que es lo que un
 *  campo vacio se come. Van a la altura del terreno, como todo lo que se apoya (T3). */
function drawAlambre(dv, relieve) {
  const primera = Math.ceil((dv + 3) / ALAMBRE_CADA);
  for (let n = primera; n < (dv + 170) / ALAMBRE_CADA; n++) {
    const wz = n * ALAMBRE_CADA, camZ = wz - dv;
    if (camZ < 3) continue;
    const k = F / camZ;
    const fade = Math.min(1, (camZ - 3) / 10) * (1 - Math.min(1, camZ / 170) * 0.75);
    if (fade <= 0.04) continue;
    ctx.globalAlpha = fade * 0.9;
    let prev = null;
    for (let wx = -72; wx <= 72; wx += ALAMBRE_POSTE) {
      const gy = relieve ? tierraH(wx, wz) : 0;
      const b = proj(wx, gy, camZ), t = proj(wx, gy + ALAMBRE_H, camZ);
      if (b.x < -30 || b.x > W + 30) { prev = null; continue; }
      px(b.x, t.y, Math.max(1, k * 0.12), Math.max(1, b.y - t.y), '#3b3529');   // el poste
      // EL HILO: dos hebras entre poste y poste. Se dibujan a mano con rects porque el hilo casi
      // nunca es horizontal —el terreno sube y baja entre un poste y el otro— y una sola raya
      // recta delataria que el suelo es plano justo donde T3 dice que no lo es.
      if (prev) for (const f of [0.92, 0.55]) {
        const y0 = prev.b.y - (prev.b.y - prev.t.y) * f, y1 = b.y - (b.y - t.y) * f;
        const pasos = Math.max(2, Math.min(10, (b.x - prev.b.x) | 0));
        for (let i = 0; i < pasos; i++) {
          const u = i / pasos;
          px(prev.b.x + (b.x - prev.b.x) * u, y0 + (y1 - y0) * u, Math.max(1, (b.x - prev.b.x) / pasos), 1, '#6b6455');
        }
      }
      prev = { b, t };
    }
    ctx.globalAlpha = 1;
  }
}

/** RACHAS DE POLVO (T2). Solo con tormenta. Son POCAS y GRANDES a proposito: muchas y chicas se
 *  leen como ruido de pantalla, no como viento. Cada racha nace, cruza y muere; su numero de
 *  turno (`n`) sale del reloj, y de ahi por hash su profundidad y su punto de partida — sin
 *  estado y sin allocations, como todo el resto del suelo. */
function drawRachas(dv, coastMode) {
  const col = coastMode ? mul(theme.cland.near, 1.45) : mul(theme.land.near, 1.5);
  for (let i = 0; i < RACHA_N; i++) {
    const u = run.t / RACHA_T + i * 0.37;
    const n = Math.floor(u), ph = u - n;                  // que racha es, y cuanto lleva vivida
    const wz = dv + 14 + hash2(n, i * 57) * 95;
    const camZ = wz - dv;
    const k = F / camZ;
    const dir = hash2(n, i * 131) > 0.5 ? 1 : -1;
    const wx = cam.x + (hash2(n, i * 91) * 2 - 1) * 40 - dir * 55 + dir * ph * 110;
    const s = proj(wx, 0, camZ);
    if (s.x < -60 || s.x > W + 60) continue;
    // entra y sale con la misma curva: una racha que aparece de golpe se lee como un parpadeo
    ctx.globalAlpha = Math.sin(ph * Math.PI) * RACHA_A;
    const w = Math.max(2, k * 9), h = Math.max(1, k * 0.5);
    px(s.x - w / 2, s.y - h * 2, w, h, col);
    px(s.x - w / 2 + dir * w * 0.2, s.y - h * 4, w * 0.7, h, col);   // segunda veta, mas alta y corrida
  }
  ctx.globalAlpha = 1;
}

// malla de puntos que forma la onda del mar en perspectiva (estilo boostivity)
// LAS OLAS VIVAS DEL CUADRO. Se arma UNA vez por frame y se pasa entera al muestreo de puntos:
// filtrar `obstacles` adentro del loop seria hacerlo miles de veces por cuadro (SPEC_AGUA_OLAS
// §6.5). Se reusa el mismo array siempre — cero allocations por cuadro, que es la otra mitad de
// la misma regla.
// HASTA DONDE LLEGA EL MAR DIBUJADO. Era un literal adentro de drawSeaDots; ahora es una constante
// con nombre porque la ventana de las olas TIENE que coincidir con el (ver juntarOlas).
export const SEA_FAR_Z = 190;
const olasVivas = [];
function juntarOlas(dv) {
  olasVivas.length = 0;
  for (const o of obstacles) {
    // VENTANA EN Z: la gaussiana no aporta un pixel mas alla de 3 sigmas, y evaluarla igual seria
    // pagar un exp() por punto por cada ola del mundo.
    //
    // OJO CON ESTE NUMERO, que es de JUSTICIA y no de rendimiento: si la ventana es mas corta que
    // el campo de puntos, la ola aparece DE GOLPE a esa distancia — medido, con 158 se materializaba
    // encima y el jugador tenia 1,4 s. Tiene que cubrir todo el mar que se dibuja (SEA_FAR_Z) mas
    // la cola de la gaussiana. Mas lejos no se puede: la ola ES el campo de altura, y donde no hay
    // puntos no hay nada que levantar.
    if (o.type === 'ola' && o.z < SEA_FAR_Z + OLA_WZ * 3 && o.z > -OLA_WZ * 3) olasVivas.push(o);
  }
  return olasVivas;
}

function drawSeaDots(landVisible, coastMode) {
  const SPX = 0.93, SPZ = 1.0, farZ = SEA_FAR_Z;  // densidad x4, y ademas /U al subir la resolucion
  const dv = run.dist + momentum.drift();
  const olas = juntarOlas(dv);
  const clima = climaDe(cfg);   // UNA vez por cuadro, no por punto (SPEC_AGUA_OLAS §6.5)
  // ESPUMA (F2): el umbral de cresta sale del clima, y la compuerta de la mota es una funcion
  // del punto. En tormenta la compuerta baja adentro de las VETAS del viento (spindrift) y sube
  // afuera: la misma cantidad de espuma, pero en tiras. Se arman aca —no por punto— por §6.5.
  const foamTh = SEA_FOAM_TH[clima];
  const foamGate = clima === 'storm'
    ? (wx, wz) => 0.35 - Math.sin(wx * 0.21 + wz * 0.135) * 0.95
    : () => 0.45;
  // EL CAMINO DEL SOL (F6): la columna de luz sobre el agua, solo con astro a la vista. Es un
  // CONO y no una franja — se angosta hacia vos y se abre hacia el horizonte, que es como se ve
  // un reflejo de verdad: el punto de fuga del camino es el ojo que lo mira.
  const astro = !!SKY_ASTRO[cfg.sky];
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
      // LA OLA NO ES UN SPRITE: los puntos del mar SE LEVANTAN solos donde pasa el bulto, con la
      // misma funcion contra la que resuelve la colision. Sin olas vivas esto es el mar de siempre.
      const hBase = seaBase(wx, wz, run.t, clima);
      let hOla = 0, olaDom = null, aporteDom = 0;
      for (let i = 0; i < olas.length; i++) {
        const o = olas[i];
        const a = olaBump(o, wx - o.x, dv + o.z - wz);
        hOla += a;
        // se guarda la ola que MAS aporta en este punto: los umbrales de cresta y de cara son
        // relativos a SU altura, no a una constante — desde que las olas varian de altura, un
        // umbral fijo pintaba de espuma casi toda una ola chica y casi nada de una grande
        if (a > aporteDom) { aporteDom = a; olaDom = o; }
      }
      const h = hBase + hOla;
      const s = proj(wx, h, camZ);
      if (s.x < -4 || s.x > W + 4 || s.y < HOR - 2) continue;
      let hn = (h + 1.4) / 4.8;                              // altura normalizada ~0..1
      hn = hn < 0 ? 0 : hn > 1 ? 1 : hn;
      // bandas de luz que viajan por la superficie (movimiento visible aun en la distancia)
      const shimmer = Math.sin(wz * 0.06 - run.t * 2.6 + wx * 0.045);
      if (shimmer > 0.6) hn = Math.min(1, hn + 0.24);
      let col = hn > 0.72 ? theme.water.crest : hn > 0.42 ? theme.water.mid : theme.water.deep;
      // LA OLA SE TIENE QUE LEER COMO UNA PARED QUE VIENE, no como textura mas brillante. Dos
      // cosas la separan del mar: la CRESTA se pinta con el color de cresta pase lo que pase con
      // la altura normalizada, y la CARA —el lado que mira a la camara— se oscurece. Ese contraste
      // es lo que la hace visible desde SPAWN_Z, que es el requisito de justicia del plan.
      let olaAqui = 0;
      if (olaDom && aporteDom > 0.12) {
        const cara = (dv + olaDom.z - wz) < 0;                 // el frente, del lado de la camara
        olaAqui = aporteDom / olaDom.h;                        // 0..1 sobre SU propia altura
        if (olaAqui > 0.6) { col = theme.water.crest; hn = 1; }
        else if (cara) col = theme.water.deep;
      }
      // OPACIDAD por cuadrado = SEA_ALPHA2D (perilla global, 0.5) x fade (entrada 3..12u y
      // caida por lejania) x altura de ola: 0.25 de piso en el valle + hasta 0.6 por la
      // cresta (hn 0..1) + 0.15 si lo cruza una banda de luz → rango 12%..50%
      ctx.globalAlpha = SEA_ALPHA2D * fade * (0.25 + hn * 0.6 + (shimmer > 0.6 ? 0.15 : 0));
      px(s.x - dotW / 2, s.y, dotW, dotW, col);
      // ESPUMA DE LA OLA: motas extra sobre el lomo. Determinista por celda (trampa §1.3 — con
      // Math.random() por cuadro esto seria un hervidero que titila), y sin depender de `k`: la
      // ola tiene que verse de LEJOS, que es justamente donde el destello normal no se dibuja.
      if (olaAqui > 0.42 && Math.sin(wx * 5.3 + wz * 3.1) > -0.15) {
        ctx.globalAlpha = SEA_ALPHA2D * fade * 1.35;
        // LA CRESTA SE ENRULA (F4.2). Cuando la rompiente rompe, su espuma deja de estar sobre
        // el lomo y CAE HACIA ADELANTE: la mota se corre hacia la camara (abajo en pantalla) y
        // se agranda con el tiempo desde que rompio. Es la diferencia entre una pared de agua
        // que avanza y una que se te viene encima.
        let cy = s.y - 1, cw = dotW + 2;
        if (olaDom.breakT) {
          const rot = Math.min(1.6, run.t - olaDom.breakT);
          cy += rot * 3.2 * Math.min(3, k);        // cae hacia adelante, mas al estar cerca
          cw += rot * 1.6;
        }
        px(s.x - dotW / 2 - 1, cy, cw, Math.max(1, dotW * 0.8), theme.water.spark);
      }
      // ESPUMA DEL MAR (F2). Distinta del destello de abajo en las dos cosas que importan:
      // NO titila (no lleva `run.t`, asi que la mota se queda pegada a la cresta mientras la
      // cresta exista) y NO pide cercania (`k`), asi que el mar picado se lee tambien de lejos.
      // El umbral es del CLIMA: en calma casi no hay, con viento salpica, en tormenta hierve.
      //
      // LAS VETAS son lo que hace que la tormenta no sea "lo mismo pero mas": en `storm` la
      // probabilidad se modula con una banda diagonal alineada al viento, asi que la espuma sale
      // en TIRAS —spindrift, la espuma que el viento arrastra de cresta en cresta— en vez de
      // repartida pareja. Es el mismo seno que peina la superficie en core/sea.js.
      if (hn > foamTh && Math.sin(wx * 3.7 + wz * 2.9) > foamGate(wx, wz)) {
        ctx.globalAlpha = SEA_ALPHA2D * fade * (clima === 'storm' ? 1.15 : 0.85);
        px(s.x - dotW / 2, s.y - 1, Math.max(1, dotW), Math.max(1, dotW * 0.7), theme.water.spark);
      }
      // destello en las crestas cercanas (titileo determinista, sin flicker feo)
      //
      // DENTRO DEL CAMINO DEL SOL (F6) el mismo destello se dispara mucho mas seguido y mas
      // fuerte: no es un efecto nuevo, es el de siempre MODULADO. Ahi ademas se le saca el corte
      // por cercania (`k > 1.6`), porque la columna de luz es justamente un fenomeno de
      // DISTANCIA — tiene que llegar hasta el horizonte o no es un camino, es un charco.
      //
      // El umbral -0.5 en vez de 0.7 es la "x4 de probabilidad" que pide el spec, traducida: la
      // fraccion de fases que pasan un umbral u es acos(u)/pi, o sea 25% con 0.7 y 67% con -0.5.
      const enSol = astro && Math.abs(wx - cam.x) < SUN_GLINT_HALF * (camZ / F);
      if (hn > 0.78 && (enSol || k > 1.6)
          && Math.sin(wx * 12.9 + wz * 7.3 + run.t * 6) > (enSol ? -0.5 : 0.7)) {
        ctx.globalAlpha = Math.min(1, SEA_ALPHA2D * fade * (enSol ? 1.6 : 0.55));
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
  // CON TURBO LA ESTELA ES OTRA (F3.4): mas ancha y mas blanca. El turbo ya se oye y ya quema
  // nafta; esto es lo que lo hace VERSE desde afuera del avion — el agua atras tuyo cambia.
  // Es un multiplicador y no un dibujo aparte a proposito: la estela sigue siendo una sola.
  const tur = run.boost ? 1 : 0;
  const wAnch = 1 + tur * 0.45, wAlfa = 1 + tur * 0.3;
  for (const wp of wake) {
    const trail = PZ - wp.z;                       // metros que quedaron atrás
    const s = proj(wp.x, 0, wp.z);
    const spread = (0.6 + trail * 0.34) * s.k * wAnch;   // apertura de la V (se abre con el turbo)
    const age = Math.min(1, trail / 11);           // 0 = recien batida · 1 = por disolverse
    const a = Math.min(0.95, wp.i * (0.3 + trail * 0.055) * wAlfa) * (1 - age * 0.45);
    if (a <= 0.02) continue;
    // CENTRO batido: solo mientras es fresco — lengua de espuma con cresta blanca encima
    if (age < 0.35) {
      ctx.globalAlpha = a;
      px(s.x - s.k * 0.8 * wAnch, s.y, s.k * 1.6 * wAnch, Math.max(1, s.k * 0.25), P.foam);
      ctx.globalAlpha = a * 0.7;
      px(s.x - s.k * 0.45 * wAnch, s.y - 1, Math.max(1, s.k * 0.9 * wAnch), 1, '#f2f7fb');
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
    const base = proj(o.x, o.gy || 0, o.z);
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
    const base = proj(o.x, o.gy || 0, o.z);
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
    const base = proj(o.x, o.gy || 0, o.z);
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
  } else if (o.type === 'resto') {
    // EL RESTO (PLAN_HORNEADO B1): lo que quedo de algo que rompiste. No tiene estado, no colisiona
    // y no puntua — es memoria. La regla del pasillo dice que lo que queda atras tuyo es la historia
    // de tu corrida, y hasta B1 esa historia la contaba una columna de humo que duraba 6 segundos.
    //
    // NO HAY RESPALDO POR CODIGO, y es deliberado: sin la hoja no se dibuja NADA. Todo lo demas de
    // este archivo cae a rectangulos si el sprite no cargo, porque son cosas que el juego necesita
    // que veas —te matan, te bloquean, valen puntos—. Un resto no hace nada de eso. Un rectangulo
    // gris en el lugar de un naufragio no cuenta la historia: la ensucia.
    if (!enemyArt.ready(o.hoja)) return;
    const base = proj(o.x, o.gy || 0, o.z);
    const sh = enemyArt.SHEETS[o.hoja];
    const col = Math.min(sh.cols - 1, (o.pose * sh.cols) | 0);   // la pose, sorteada al morir
    // los que escalaban por altura en vida siguen escalando por la MISMA altura muertos: un
    // edificio grande deja un derrumbe grande
    const kk = sh.href && o.h ? k * o.h / sh.href : k;
    ctx.globalAlpha = 0.3;
    px(base.x - sh.wu * 0.4 * k, base.y - 0.3 * k, sh.wu * 0.8 * k, Math.max(1, 0.5 * k), '#161d10');
    ctx.globalAlpha = 1;
    enemyArt.drawFrame(ctx, o.hoja, col, 0, base.x, { bottomY: base.y }, kk, o.flip);
  } else if (o.type === 'tent') {
    // CARPA britanica: lona olivo a dos aguas, entrada oscura. Arrasable a ras (no mata).
    const base = proj(o.x, o.gy || 0, o.z);
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
    const base = proj(o.x, o.gy || 0, o.z);
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
    const base = proj(o.x, o.gy || 0, o.z), bh = o.h * k;
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
    const base = proj(o.x, o.gy || 0, o.z);
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
    const base = proj(o.x, o.gy || 0, o.z), th = o.h * k;
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
    const base = proj(o.x, o.gy || 0, o.z), th = o.h * k, sp = 6 * k;
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
    const base = proj(o.x, o.gy || 0, o.z), th = o.h * k;
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
    const base = proj(o.x, o.gy || 0, o.z), dh = o.h * k;
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
    const base = proj(o.x, o.gy || 0, o.z);
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
    const base = proj(o.x, o.gy || 0, o.z);
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
    const sh2 = proj(o.x, o.gy || 0, o.z);
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
      const base = proj(o.x, o.gy || 0, o.z);
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
  } else if (o.type === 'onda') {
    // LA ONDA EXPANSIVA (PLAN_DESTRUCCION D3): el anillo que se abre. Dos anillos, no uno:
    //   · el de AIRE, a la altura del reventón, que es el frente de presión;
    //   · el de SUELO, aplastado contra el piso — polvo en tierra, corona de espuma en el mar.
    // El de abajo es el que da la escala: sin él la explosión flota, con él está APOYADA en algo.
    const f = Math.min(1, o.ondaT / ONDA_T);
    const s = proj(o.x, o.y, o.z);
    const g = proj(o.x, o.gy || 0, o.z);
    const R = ONDA_R * f * s.k;
    const fade = (1 - f) * (1 - f);                 // se abre rápido y se apaga rápido
    ctx.save();
    ctx.globalAlpha = fade * 0.7;
    ctx.strokeStyle = '#ffe6ac';
    // el grosor se acota: cerca, el trazo escalado por perspectiva se volvia una burbuja de jabon
    ctx.lineWidth = Math.max(1, Math.min(5, (1 - f) * 2.5 * s.k));
    ctx.beginPath(); ctx.arc(s.x, s.y, R, 0, 6.2832); ctx.stroke();
    // el anillo de abajo: elipse chata (se ve en perspectiva) del color del suelo que pisa
    ctx.globalAlpha = fade * 0.55;
    ctx.strokeStyle = cfg.terrain === 'sea' ? P.foam : '#8a8272';
    ctx.lineWidth = Math.max(1, Math.min(6, (1 - f) * 3 * g.k));
    ctx.beginPath(); ctx.ellipse(g.x, g.y, R * 1.15, R * 0.3, 0, 0, 6.2832); ctx.stroke();
    ctx.restore();
    ctx.globalAlpha = 1; ctx.lineWidth = 1;
  } else if (o.type === 'chunk') {
    // PEDAZO DEL AVION derribado (ver die en game.js): fragmento que sigue de largo con la
    // inercia, girando. Un rect rotado con canto iluminado — a esta escala, el TUMBO (rotacion
    // continua) es lo que lo hace leer como escombro y no como particula.
    // Desde D0 (PLAN_DESTRUCCION) el pedazo TRAE SU COLOR: la receta de data/despiece.js dice de
    // qué está hecho cada cosa — chapa oxidada el depósito, lona la carpa, mampostería el edificio.
    // Los valores de antes quedan de respaldo para cualquier chunk que nazca sin receta.
    const s = proj(o.x, o.y, o.z);
    // TOPE DE TAMAÑO: un pedazo a cinco metros de la cámara se proyecta gigante y tapa la pantalla
    // entera por un cuadro. Pasa seguido — le volás por adentro al destrozo que acabás de hacer.
    // El recorte no miente sobre la distancia (sigue creciendo hasta acá): evita el manchón.
    const r = Math.min(26, Math.max(1.2, o.size * 2 * k));
    // SE DISUELVE, no desaparece: el último medio segundo se va en transparencia. Es lo que hace
    // que el cap global (los más viejos se van antes) no se lea como un parpadeo. Y lo MUY cercano
    // se desvanece también: te pasó por el ala, no es algo que estés mirando.
    const fade = Math.min(1, Math.max(0, ((o.vida || CHUNK_LIFE) - o.chunkT) / 0.5), Math.max(0, (o.z - 3) / 11));
    ctx.save();
    if (fade < 1) ctx.globalAlpha = fade;
    ctx.translate(s.x, s.y); ctx.rotate(o.spin);
    // LA PIEZA HORNEADA primero: si el pedazo tiene una y la hoja cargo, se dibuja el ala (o el
    // morro, o el tren) de verdad. Todo lo de abajo queda como respaldo — a esta resolucion un
    // rectangulo rotado nunca fue escombro de avion, era un cuadrado.
    if (o.parte && drawParte(ctx, o.parte, yawDe(o), r, colorDe(o))) {
      // dibujada
    } else if (o.paraca) {
      // EL PARACAIDAS (v2 §3): cupula, cuerdas y el asiento colgando. NO gira — el `spin` va en 0
      // a proposito. Lo que se lee es que algo baja DESPACIO mientras todo lo demas cae, y esa
      // lectura la da la cupula quieta; un paracaidas tumbando seria un pedazo mas de escombro.
      const R = Math.max(2, r * 1.5);
      ctx.beginPath();
      ctx.ellipse(0, -R * 0.45, R, R * 0.6, 0, Math.PI, 6.2832);
      ctx.fillStyle = o.c || '#d8d2c4'; ctx.fill();
      px(-Math.max(1, R * 0.05), -R * 0.45, Math.max(1, R * 0.1), R * 0.7, o.c2 || '#8f959b');
      px(-Math.max(1, R * 0.2), R * 0.22, Math.max(2, R * 0.4), Math.max(2, R * 0.34), o.c2 || '#8f959b');
    } else if (o.pieza) {
      // LA PIEZA RECONOCIBLE (D2): no es un fragmento mas, es LA parte — y por eso tiene silueta
      // propia. Es lo que hace que a 200 m se sepa que lo que cae era un helicoptero: no se lee el
      // escombro, se lee el rotor dando vueltas solo.
      if (o.pieza === 'rotor' || o.pieza === 'ala' || o.pieza === 'cable' || o.pieza === 'canon') {
        px(-r * 1.5, -Math.max(1, r * 0.12), r * 3, Math.max(1, r * 0.24), o.c || '#3a4038');   // barra larga
        px(-Math.max(1, r * 0.2), -Math.max(1, r * 0.2), Math.max(2, r * 0.4), Math.max(2, r * 0.4), o.c2 || '#5c6358');
      } else if (o.pieza === 'plato') {
        ctx.beginPath(); ctx.ellipse(0, 0, r * 1.1, r * 0.42, 0, 0, 6.2832);
        ctx.fillStyle = o.c || '#3a4038'; ctx.fill();
        px(-Math.max(1, r * 0.1), -r * 0.42, Math.max(1, r * 0.2), r * 0.84, o.c2 || '#5c6358');
      } else {
        px(-r * 0.7, -r * 0.55, r * 1.4, r * 1.1, o.c || '#3a4038');   // el bulto: tanque, cabina, rampa
        px(-r * 0.7, -r * 0.55, r * 1.4, Math.max(1, r * 0.2), o.c2 || '#5c6358');
      }
    } else {
      px(-r / 2, -r / 4, r, r / 2, o.c || '#3a4038');                 // el fragmento
      px(-r / 2, -r / 4, r, Math.max(1, r * 0.16), o.c2 || '#5c6358'); // canto al sol
    }
    // RESCOLDO: parpadea al girar. Sobre una PIEZA horneada va mas chico y pegado al centro —
    // dimensionado para el rectangulo, en un ala de 40 px quedaba un cuadrado naranja del tamaño
    // de una ventanilla, y volvia a meter en escena justo la forma que estas piezas vinieron a
    // sacar. Es lo primero que se ve al mirar la captura de cerca.
    if (o.hot && Math.sin(o.spin * 3) > 0) {
      const b = o.parte ? Math.max(1, r * 0.1) : Math.max(1, r * 0.2);
      px(o.parte ? r * 0.06 : r * 0.2, -b / 2, b, b, '#e07030');
    }
    ctx.restore();
    ctx.globalAlpha = 1;
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
    const base = proj(o.x, o.gy || 0, o.z);
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

// ---- BANCO DE NUBES del objetivo (playtest 7/8, arte 8/8) ----
// La "niebla" que esconde al buque es FISICA: nubes bajas asentadas SOBRE el mar, en el
// horizonte — el banco principal le tapa la mitad de abajo al barco y alrededor flotan nubes
// menores. Son CLARAS a proposito: el buque es silueta oscura detras, y los enemigos (olivas y
// grises, dibujados despues) pasan POR DELANTE y contrastan contra el blanco.
//
// El ARTE es una hoja pintada a mano (assets/world/elements/fog1.png): 6 nubes con alfa en una
// grilla de 2x3. Al cargar se RECORTA sola — se escanea el alfa de cada celda y se guarda la
// caja justa, asi la hoja se puede redibujar o reacomodar sin tocar numeros aca. Mientras no
// cargo (o si fallo), dibujan las nubes procedurales de abajo: mismo patron que la cabina.
const CLOUDS = { img: new Image(), frames: [], tinted: new Map(), ready: false };
CLOUDS.img.onload = () => {
  try {
    const iw = CLOUDS.img.naturalWidth, ih = CLOUDS.img.naturalHeight;
    const c = document.createElement('canvas'); c.width = iw; c.height = ih;
    const g = c.getContext('2d', { willReadFrequently: true });
    g.drawImage(CLOUDS.img, 0, 0);
    const A = g.getImageData(0, 0, iw, ih).data;
    const cw = Math.floor(iw / 2), chh = Math.floor(ih / 3);
    for (let cy = 0; cy < 3; cy++) for (let cx = 0; cx < 2; cx++) {
      let x0 = iw, y0 = ih, x1 = -1, y1 = -1;
      for (let y = cy * chh; y < (cy + 1) * chh; y++) for (let x = cx * cw; x < (cx + 1) * cw; x++) {
        if (A[(y * iw + x) * 4 + 3] > 16) {
          if (x < x0) x0 = x; if (x > x1) x1 = x;
          if (y < y0) y0 = y; if (y > y1) y1 = y;
        }
      }
      if (x1 > x0) CLOUDS.frames.push({ x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 });
    }
    CLOUDS.ready = CLOUDS.frames.length > 0;
  } catch (e) { }   // sin canvas/DOM raro: quedan las procedurales
};
CLOUDS.img.src = '../assets/world/elements/fog1.png';

/** La hoja TEÑIDA con el horizonte del clima (cache por color). Blanco puro pegado sobre una
 *  noche azul o una tormenta gris cantaba; un lavado suave (source-atop al 36%) la mete en la
 *  luz de cada mapa sin matarle el sombreado propio del arte. */
function cloudSheet(sky) {
  let t = CLOUDS.tinted.get(sky);
  if (!t) {
    t = document.createElement('canvas');
    t.width = CLOUDS.img.naturalWidth; t.height = CLOUDS.img.naturalHeight;
    const g = t.getContext('2d');
    g.drawImage(CLOUDS.img, 0, 0);
    g.globalCompositeOperation = 'source-atop';
    g.globalAlpha = 0.36;
    g.fillStyle = sky;
    g.fillRect(0, 0, t.width, t.height);
    CLOUDS.tinted.set(sky, t);
  }
  return t;
}

// PUESTOS del banco: offset (en esloras), altura (en hb), frame de la hoja, espejado y alfa.
// Es una TABLA fija y no un sorteo: cada puesto conserva SU nube entre frames — el banco respira
// (bob y deriva abajo) pero no "cambia de nubes" mientras lo miras. Del centro a las puntas los
// tamaños caen; las dos ultimas de cada lado son las satelites sueltas.
// Un NUCLEO denso sobre el casco y un ANILLO suelto que se abre hacia los costados (25
// puestos): el banco tiene que leerse como un FRENTE de niebla, no como tres nubes de utileria.
const CLOUD_BANK = [
  // nucleo sobre el casco
  { dx: 0,     hh: 1.2,  fr: 2, fl: false, a: 1 },
  { dx: -0.12, hh: 1.05, fr: 4, fl: true,  a: 1 },
  { dx: 0.13,  hh: 1.1,  fr: 3, fl: true,  a: 1 },
  { dx: -0.24, hh: 1.0,  fr: 0, fl: false, a: 1 },
  { dx: 0.24,  hh: 0.95, fr: 1, fl: true,  a: 1 },
  { dx: -0.36, hh: 0.9,  fr: 5, fl: true,  a: 1 },
  { dx: 0.37,  hh: 0.92, fr: 2, fl: false, a: 1 },
  { dx: -0.48, hh: 0.85, fr: 3, fl: false, a: 1 },
  { dx: 0.48,  hh: 0.8,  fr: 0, fl: true,  a: 1 },
  { dx: -0.63, hh: 0.72, fr: 1, fl: false, a: 0.95 },
  { dx: 0.64,  hh: 0.7,  fr: 4, fl: false, a: 0.95 },
  { dx: -0.78, hh: 0.6,  fr: 5, fl: false, a: 0.95 },
  { dx: 0.78,  hh: 0.62, fr: 1, fl: false, a: 0.95 },
  // anillo suelto alrededor
  { dx: -1.0,  hh: 0.55, fr: 2, fl: true,  a: 0.9 },
  { dx: 1.05,  hh: 0.5,  fr: 3, fl: false, a: 0.9 },
  { dx: -1.3,  hh: 0.5,  fr: 0, fl: true,  a: 0.85 },
  { dx: 1.35,  hh: 0.52, fr: 5, fl: true,  a: 0.85 },
  { dx: -1.55, hh: 0.5,  fr: 5, fl: true,  a: 0.85 },
  { dx: 1.6,   hh: 0.55, fr: 4, fl: false, a: 0.85 },
  { dx: -2.1,  hh: 0.45, fr: 1, fl: true,  a: 0.75 },
  { dx: 2.2,   hh: 0.48, fr: 0, fl: false, a: 0.75 },
  { dx: -2.8,  hh: 0.42, fr: 4, fl: true,  a: 0.7 },
  { dx: 2.9,   hh: 0.45, fr: 5, fl: false, a: 0.7 },
  { dx: -3.6,  hh: 0.38, fr: 3, fl: true,  a: 0.65 },
  { dx: 3.7,   hh: 0.4,  fr: 2, fl: false, a: 0.65 },
];

// OPACIDAD del banco (pedido 10/8): 0.8 de lejos — el buque ESCONDIDO — y baja en escalera con
// el avance (0.7, 0.6, 0.5...) hasta 0.1 con el buque practicamente al lado. Nunca llega a 0:
// la niebla acompaña hasta el final — el que termina de tapar la pantalla es el VELO NEGRO
// (drawVeil), que se va cerrando en paralelo a esta disipacion.
const CLOUD_FAR = 0.8, CLOUD_NEAR = 0.1;
// TAMAÑO (pedido 10/8: "mas grandes"): multiplica todas las nubes del banco.
const CLOUD_SIZE = 1.45;

/** El banco del buque + las nubes satelite, con la hoja de arte. Crece con el barco (len/hb).
 *  `dis` 0..1 = cuanto se disipo ya (0 lejos: banco cerrado · 1 encima: apenas se insinua). */
function drawShipClouds(bx, waterY, len, uh, hullH, dis) {
  const va = CLOUD_FAR - (CLOUD_FAR - CLOUD_NEAR) * dis;
  if (va <= 0.01) return;
  const hb = Math.max(2, hullH + uh * 1.6);                    // hasta media superestructura
  if (!CLOUDS.ready) { drawShipCloudsFallback(bx, waterY, len, hb, va); return; }
  const sheet = cloudSheet(theme.sky.horizon);
  const smooth = ctx.imageSmoothingEnabled;
  ctx.imageSmoothingEnabled = false;                           // pixel art: vecino mas cercano
  for (let i = 0; i < CLOUD_BANK.length; i++) {
    const b = CLOUD_BANK[i], fr = CLOUDS.frames[b.fr % CLOUDS.frames.length];
    const h = Math.max(2, hb * b.hh * CLOUD_SIZE);
    const w = h * fr.w / fr.h;
    const x = bx + b.dx * len + Math.sin(run.t * 0.3 + i * 1.9) * 1.5;
    const y = waterY + 1 - h + Math.sin(run.t * 0.5 + i * 1.3) * Math.max(0.4, h * 0.03);
    ctx.globalAlpha = b.a * va;
    if (b.fl) {
      ctx.save(); ctx.translate(x, 0); ctx.scale(-1, 1);
      ctx.drawImage(sheet, fr.x, fr.y, fr.w, fr.h, -w / 2, y, w, h);
      ctx.restore();
    } else {
      ctx.drawImage(sheet, fr.x, fr.y, fr.w, fr.h, x - w / 2, y, w, h);
    }
  }
  ctx.globalAlpha = 1;
  ctx.imageSmoothingEnabled = smooth;
}

/** FALLBACK procedural (hasta que carga la hoja): silueta abollonada por columnas. */
function cloudMass(cx, baseY, wd, hh, seed, aBase, C) {
  const step = 3;
  const n = Math.max(3, Math.ceil(wd / step));
  ctx.globalAlpha = aBase;
  for (let i = 0; i <= n; i++) {
    const fx = i / n - 0.5;
    const env = Math.cos(fx * Math.PI);                        // alta al centro, muere en las puntas
    const nz = 0.62 + 0.38 * Math.sin(seed * 7.3 + i * 1.31 + run.t * 0.4)
                    * Math.sin(seed * 3.1 - i * 0.57 + run.t * 0.26);
    const h = hh * env * nz;
    if (h < 0.6) continue;
    const x = cx - wd / 2 + i * step;
    px(x, baseY - h, step, h, C.mid);
    px(x, baseY - h, step, Math.max(1, h * 0.34), C.lit);      // tope al sol
  }
  px(cx - wd / 2 + wd * 0.08, baseY - Math.max(1, hh * 0.18), wd * 0.84, Math.max(1, hh * 0.18), C.shad);
  ctx.globalAlpha = 1;
}
function drawShipCloudsFallback(bx, waterY, len, hb0, va) {
  const hb = hb0 * CLOUD_SIZE;
  const C = {
    lit: mixHex('#e6ebea', theme.sky.horizon, 0.32),
    mid: mixHex('#b8c2c4', theme.sky.horizon, 0.42),
    shad: mixHex('#828e92', theme.sky.horizon, 0.5),
  };
  cloudMass(bx, waterY + 1, Math.max(12, len * 1.8), hb, 11, 0.95 * va, C);
  cloudMass(bx - len * 1.45, waterY + 1, Math.max(8, len * 0.85), hb * 0.6, 23, 0.85 * va, C);
  cloudMass(bx + len * 1.55, waterY + 1, Math.max(8, len * 0.9), hb * 0.55, 37, 0.85 * va, C);
  cloudMass(bx - len * 2.7, waterY + 1, Math.max(6, len * 0.7), hb * 0.45, 51, 0.72 * va, C);
  cloudMass(bx + len * 2.9, waterY + 1, Math.max(6, len * 0.6), hb * 0.5, 67, 0.72 * va, C);
}

// la barcaza objetivo VISIBLE en el PASILLO: aparece en el horizonte desde BARGE_T0 del recorrido
// y crece hasta empalmar con la escala de la fase ARENA que viene (es el final del mapa).
// EMERGE "hull-down" desde atras del BANCO DE NUBES asentado en el horizonte (drawShipClouds):
// primero asoma la superestructura sobre las nubes y el casco se descubre al acercarse.
// EXPORTADA: el modo PASADAS MORTALES arranca la corrida EXACTAMENTE en este punto del camino,
// para que lo primero que se vea sea el buque asomando en el horizonte. Si se mueve el valor, ese
// modo se mueve con el — que es justo lo que se quiere.
export const BARGE_T0 = 0.45;        // fraccion del recorrido en la que el buque asoma
// COLUMNA del buque en pantalla. La DERIVA lateral (aparecer corrido y cerrar hacia el rumbo)
// se probo y se DESCARTO (pedido 11/8): en su lugar el buque aparece clavado en su rumbo y se
// MATERIALIZA — su opacidad sube a la inversa de la niebla (ver shipA en drawApproachBarge).
// BARGE_DRIFT queda como perilla por si algun dia se quiere recuperar la deriva (0 = centrado).
const BARGE_DRIFT = 0;
// DONDE EMPIEZA A COMPRIMIR el tope del encuadre, como fraccion del tope. Por debajo de esto el
// buque crece tal cual; por encima se va aplastando contra el tope sin llegar. Ver el bloque en
// drawApproachBarge — lo que compra es que el acercamiento NUNCA tenga derivada cero.
const ENC_RODILLA = 0.75;
function bargeCol(f) { return W / 2 - cam.x * LANE_PARALLAX + (1 - f * f * f) * W * BARGE_DRIFT; }
/** Avance 0..1 de la primera aproximacion (la unica que ve el marcador de objetivo). */
function approachF(p) {
  const at = momentum.phases()[0].at;
  return Math.max(0, Math.min(1, (p - BARGE_T0) / (at - BARGE_T0)));
}
// GEOMETRIA DEL BUQUE tal como quedo dibujado este cuadro. La necesita EL PULSO para poner el
// impacto, el fuego y la ristra de bombas EN el buque — y tiene que salir de aca y no recalcularse
// alla, porque la escala y el cabeceo son una cuenta larga y dos copias se desincronizan solas.
let LAST_BARGE = null;
export const bargeGeom = () => LAST_BARGE;
// SONDA (QUITAR antes de publicar). El TAMAÑO Y LA POSICION del buque tal como quedaron dibujados
// este cuadro. Sin esto, "el buque no se sigue acercando" solo se puede discutir mirando: el
// multiplicador del PULSO (`fx.grow`) puede estar creciendo y el buque igual no crecer en pantalla
// —lo tapa el recorte del mar, o el `drop` ya lo saco del cuadro— y son cosas distintas.
if (typeof window !== 'undefined') window.__buque = () => JSON.stringify(LAST_BARGE ? {
  sc: +LAST_BARGE.sc.toFixed(4), largo: +LAST_BARGE.len.toFixed(1),
  alto: +LAST_BARGE.hullH.toFixed(1), cubierta: +LAST_BARGE.by.toFixed(1),
  agua: +LAST_BARGE.waterY.toFixed(1), tilt: +LAST_BARGE.tilt.toFixed(3),
  // cuanto del buque queda ARRIBA de la linea de agua, que es lo unico que el recorte deja ver
  visible: +(LAST_BARGE.waterY - LAST_BARGE.by).toFixed(1),
} : null);

// DISTANCIA REAL del buque en el ultimo tramo del pasillo, cuando el climax es la PASADA (R3).
// De `BARGE_D0` metros a `ENTRY_D`: al cortar, el jugador esta EXACTAMENTE donde la PASADA lo
// pone, asi que el buque mide los mismos pixeles de un lado y del otro del corte. La interpolacion
// va sobre 1/d y no sobre d porque el TAMAÑO APARENTE es el que tiene que crecer parejo — sobre la
// distancia, el buque se queda invisible medio pasillo y despues salta.
const BARGE_D0 = 6000;
const BARGE_GROW = 1.5;   // >1 = el crecimiento se guarda para el final, que es como se acerca algo
/** Distancia en metros al buque para un avance 0..1 del ultimo tramo. */
function bargeDist(f) {
  const a = 1 / BARGE_D0, b = 1 / ENTRY_D;
  return 1 / (a + (b - a) * Math.pow(f, BARGE_GROW));
}
// SILUETA DE PROA tal como quedo este cuadro (cx, manga y alto en px, y la distancia que
// representa). La lee la sonda del handoff: es la mitad del pasillo de la comparacion que R3 pide.
let LAST_BOW = null;
export const bowGeom = () => LAST_BOW;
// SONDA DEL HANDOFF (R3): el ultimo cuadro del pasillo, para comparar contra el primero de la
// PASADA (__pship). Puro mirar — no cambia una regla, como toda la vara del rescate.
// SONDAS DEL SUELO (PLAN_TIERRA_COSTA). `__tierra` devuelve la paleta ACTIVA del suelo —que es
// justo lo que T1 vino a arreglar: antes era una constante y no habia nada que sondear—;
// `__tierraset` cambia mapa y cielo pasando por applyTheme, como el menu, en vez de escribir el
// tema a mano; y `__pasto` mide la inclinacion con la MISMA funcion que dobla los matojos.
if (typeof window !== 'undefined') {
  window.__tierra = () => JSON.stringify({
    terrain: cfg.terrain, sky: cfg.sky, clima: climaDe(cfg),
    land: { far: theme.land.far, mid: theme.land.mid, near: theme.land.near, tuft: theme.land.tuft },
    cland: theme.cland.near,
  });
  window.__tierraset = (terrain, sky) => {
    if (terrain) cfg.terrain = terrain;
    if (sky) cfg.sky = sky;
    applyTheme(cfg);
    return cfg.terrain + '/' + cfg.sky;
  };
  window.__pasto = (wx, wz) => +pastoLean(+wx || 0, +wz || 0, run.t, climaDe(cfg)).toFixed(4);
  // EL RELIEVE (T3). `__loma` es la altura del suelo en un punto —la MISMA funcion que usa el
  // vuelo—; `__suelo` es la foto de lo que decide el roce ahora mismo (donde esta el piso, donde
  // esta el avion y cuanto margen lleva gastado); `__plantado` dice a que altura quedo clavado
  // cada obstaculo, que es lo unico que prueba que la caja y el dibujo miran la misma loma.
  window.__loma = (x, dz) => +tierraH(x === undefined ? plane.x : +x, run.dist + (dz === undefined ? PZ : +dz)).toFixed(3);
  window.__suelo = () => JSON.stringify({
    relieve: hayRelieve(cfg), h: +tierraH(plane.x, run.dist + PZ).toFixed(3),
    y: +plane.y.toFixed(2), sc: +run.scrapeT.toFixed(2), dist: run.dist | 0,
  });
  // T4/T5: la resaca, el pedrero y el turbal, medidos con LAS MISMAS funciones que se dibujan.
  // __lluvia: la perilla de LLUVIA sin pasar por el menu. Escribe la CAUSA (cfg.rain), que es lo
  // que leen el suelo mojado, los charcos y climaDe — no un resultado ya cocinado.
  window.__charcos = () => charcosUlt;
  window.__lluvia = n => { cfg.rain = +n || 0; return cfg.rain; };
  window.__resaca = (wz, t) => +resaca(+wz || 0, t === undefined ? run.t : +t).toFixed(4);
  window.__pedrero = (wx, wz) => +pedreroAt(+wx || 0, +wz || 0).toFixed(3);
  window.__turbal = wz => JSON.stringify(turbalAt(+wz || 0));
  window.__plantado = () => JSON.stringify(obstacles
    .filter(o => o.z > 0 && o.z < 400)
    .map(o => ({ t: o.type, gy: +(o.gy || 0).toFixed(2) })));
}
if (typeof window !== 'undefined') window.__pbarge = () => JSON.stringify(LAST_BOW && {
  bx: +LAST_BOW.bx.toFixed(1), bw: +LAST_BOW.bw.toFixed(2),
  hTop: +LAST_BOW.hTop.toFixed(2), d: Math.round(LAST_BOW.d),
});

/** LA APROXIMACION DE PROA (R3). `g` = 0..1 desde que asoma hasta el corte.
 *
 *  El buque no tiene "escala": tiene DISTANCIA. Todo sale de ahi — manga, alto y hasta si vale la
 *  pena dibujar el radar. Al llegar a g = 1 la distancia ES `ENTRY_D`, que es donde la PASADA
 *  coloca al avion, y por eso los dos lados del corte miden lo mismo sin que nadie ajuste nada. */
function drawBowApproach(g, objectiveShip) {
  // `d` es a la MITAD del buque; lo que se ve de proa es la PROA, media eslora mas cerca. La
  // diferencia es el 10% del tamaño en pantalla al cortar — chica, pero es justo la que la sonda
  // compara, y medir contra una referencia distinta de la que usa el 3D es empezar a mentir.
  const d = bargeDist(g), k = pxPerM(Math.max(60, d - SHIP_LEN / 2));
  const bw = shipBeamM() * 2 * k, hTop = shipTopM() * k;
  // el balanceo del buque va en METROS y no en pixeles: a 6 km no se tiene que mover, a 700 m si.
  // Y va CHICO: 5 m de guiñada son 1,7 px al cortar. La primera version usaba 26 m —la amplitud
  // del casco lateral, que a su escala eran 4 px— y de proa se convertia en un buque bailando 17 px
  // de lado a lado. Ademas de feo, ensuciaba la sonda de la columna: el salto que R3 mide es de
  // pocos pixeles, y un balanceo mas grande que el salto tapa justo lo que se vino a medir.
  const bx = bargeCol(g) + Math.sin(run.t * 0.8) * 5 * k;
  const waterY = HOR + Math.sin(run.t * 1.3) * 2 * k;
  LAST_BOW = { bx, waterY, bw, hTop, d };
  // MATERIALIZACION: el mismo fundido cruzado con el banco de nubes que tenia el casco lateral —
  // entra fantasma y se hace real a medida que la niebla se abre. Es lo unico de la aproximacion
  // vieja que se conserva tal cual, porque no habla de tamaño sino de aire.
  const dis = Math.max(0, Math.min(1, g / 0.94));
  const haze = 0.34 * (1 - g) * (1 - g);
  ctx.save();
  ctx.beginPath(); ctx.rect(-80, -80, W + 160, waterY + 2 + 80); ctx.clip();
  ctx.globalAlpha = 0.15 + 0.85 * dis;
  // PISO DE LEGIBILIDAD: de proa un destructor mide 7 px de manga al cortar y menos de 1 a 6 km,
  // asi que a distancia real la silueta desaparece. Lo que NO desaparece en el mar es el HUMO —
  // se ve un buque por su columna mucho antes que por su casco— y por eso el dibujo recibe un
  // alto minimo: la columna sigue siendo un hilo en el horizonte todo el tramo. La MANGA no se
  // toca: si se inflara, el corte volveria a mentir, que es exactamente lo que R3 vino a arreglar.
  momRender.drawBargeBow(bx, bw, waterY, Math.max(3, hTop), run.t, haze, theme.sky.horizon);
  ctx.globalAlpha = 1;
  ctx.restore();
  drawShipClouds(bx, waterY, Math.max(14, bw * 6), Math.max(1, hTop * 0.3), Math.max(2, hTop * 0.45), dis);
  // el nombre entra cuando el buque ya es una silueta y no una mota, y va sobre la perilla del
  // palo (de proa no hay eslora sobre la que apoyarlo)
  if (bw > 2.2) {
    ctx.font = '9px monospace'; ctx.textAlign = 'center'; ctx.fillStyle = P.warn; ctx.globalAlpha = 0.85;
    ctx.fillText(objectiveShip, bx, waterY - Math.max(3, hTop) - 6);
    ctx.globalAlpha = 1;
  }
}

/** `fx` (o null): lo que EL PULSO le esta haciendo al buque durante la cinematica del premio —
 *  `grow` cuanto crece (la caida encima), `tilt` cuanto escora, `sink` cuanto se hunde. Llega por
 *  parametro desde game.js: el sistema no llama al render ni el render mira al sistema.
 *
 *  `deProa` (R3): el climax de este run es la PASADA, asi que el pasillo muestra al buque DE PROA
 *  y a la distancia de verdad. Con el casco lateral, el ultimo cuadro del pasillo mostraba un
 *  buque de 177 px —o sea, a 150 m— y la PASADA abria con el mismo buque a 700: el jugador salia
 *  disparado para atras y giraba 90 grados en un cuadro. Eso era "el teleport" del §1.2. */
// LO QUE MIDE EL BUQUE DIBUJADO, en unidades de `uh`: casco (1.5) + mastil sobre la cubierta
// (4.6). Sale de drawBargeHull — si algun dia le crece la antena, este numero se entera.
const ALTO_BUQUE = 6.1;

// ============================ EL CASCO, POR CLASE (PLAN_HORNEADO B2) ============================
// Hasta B2 los tres buques del juego se dibujaban con EL MISMO casco: `drawBargeHull` pinta un
// perfil de destructor generico y lo usaban el SHEFFIELD, el ARDENT y el SIR GALAHAD por igual —
// un destructor, una fragata y un buque de carga, identicos, y lo unico que los distinguia era el
// nombre escrito arriba. `data/ships.js` ya sabia de que clase era cada uno (`SHIP_CLASS`) y le
// daba a cada clase sus zonas criticas propias; faltaba que se parecieran a lo que son.
//
// EL DIBUJO A MANO NO SE VA, Y NO ES POR PRUDENCIA. Es el patron del repo (si la hoja no cargo,
// se cae al dibujo de siempre) pero ademas es MEJOR en un tramo concreto: de lejos el buque mide
// tres pixeles, y ahi `drawBargeHull` tiene un modo propio de tres trazos con perfil de barco
// mientras que un sprite de 216 px reducido a 3 es una mancha. Asi que la hoja entra cuando el
// buque ya es grande y el dibujo a mano se queda con la distancia. El umbral es donde el sprite
// deja de perder informacion: por debajo de ~40 px de eslora se reduce mas de 5×.
const CASCO_MIN = 40;

/** La hoja que le toca a un buque, o null si no hay ninguna cargada.
 *  `n` = 0 navegando · 1 hundiendose de proa · 2 de popa. */
function hojaBuque(nombre, n) {
  const cl = SHIP_CLASS[nombre] || 't42';       // un buque sin clase declarada navega de destructor
  const k = (n ? 'hundido_' : 'buque_') + cl;
  return enemyArt.ready(k) ? k : null;
}

/** El casco del buque del pasillo. `len` es la ESLORA EN PIXELES y `waterline` la flotacion: los
 *  dos salen de la cuenta larga de `drawApproachBarge`, que es quien sabe a que distancia esta.
 *
 *  La hoja se dibuja con `wu: 1`, asi que pasarle `len` como escala hace que el contenido mida
 *  exactamente `len` pixeles de ancho — y como no se hornea nada bajo la flotacion (`clipY` del
 *  horno), anclar por el borde de abajo del contenido lo planta justo en la linea de agua. Los dos
 *  numeros que el 2D calculaba a ojo salen gratis.
 *
 *  EL AGUA SIGUE SIENDO CODIGO. El bigote de proa y la flotacion picoteada NO se hornean (regla
 *  §4 del plan: la materia en movimiento es codigo) — se pintan encima del sprite, que ademas es
 *  lo que hace que el buque se vea NAVEGANDO y no fondeado. */
function drawCascoDelBuque(nombre, cx, len, deckY, uh, hullH, haze, fx) {
  const hundiendo = fx && fx.sink > 0.12 ? (fx.tilt >= 0 ? 1 : 2) : 0;
  const hoja = len >= CASCO_MIN ? hojaBuque(nombre, hundiendo) : null;
  if (!hoja) {
    momRender.drawBargeHull(cx, len, deckY, uh, run.t, haze, theme.sky.horizon);
    return;
  }
  const waterY = deckY + hullH;
  const sh = enemyArt.SHEETS[hoja];
  // CABECEO: tres poses cicladas con un seno lento — el mismo recurso que la barcaza y el globo.
  // Un buque quieto en pantalla se lee como una foto pegada. El hundido no cabecea: tiene dos
  // poses y son los dos FINALES (de proa / de popa), no un ciclo.
  const col = hundiendo ? hundiendo - 1
    : Math.min(sh.cols - 1, Math.round((Math.sin(run.t * 0.55) * 0.5 + 0.5) * (sh.cols - 1)));
  // LA BRUMA, con el mecanismo que ya tiene el sprite: `dark` oscurece conservando la forma. No es
  // lo mismo que el `mixHex` del 2D —aquel mezcla hacia el color del horizonte y este hacia la
  // sombra— pero hace el trabajo que importa, que es que el buque lejano no compita en contraste
  // con los obstaculos del pasillo. Anotado en PLAN_HORNEADO §5.
  enemyArt.drawFrame(ctx, hoja, col, 0, cx, { bottomY: waterY }, len, false, false, haze * 0.8);
  if (hundiendo) return;                      // el que se hunde ya no hace bigote de proa
  // EL AGUA (materia = codigo): bigote de proa y la flotacion picoteada, lo mas claro del buque.
  const u = Math.max(1, uh);
  ctx.globalAlpha = 0.5;
  for (let i = 0; i < 7; i++) {
    px(cx - len / 2 + u + (i / 7) * len * 0.95 + Math.sin(run.t * 2.4 + i * 1.7) * u * 0.35,
      waterY - 1, u * 0.9, 1, P.foam);
  }
  ctx.globalAlpha = 0.75;
  px(cx - len / 2 + u * 0.95, waterY - Math.max(1, u * 0.3), u * 1.7, Math.max(1, u * 0.3), P.foam);
  ctx.globalAlpha = 1;
}

export function drawApproachBarge(objectiveDist, objectiveShip, fx, deProa) {
  const ph = momentum.phase(), PH = momentum.phases();
  if (objectiveDist <= 0 || ph >= PH.length) return;
  // EL PULSO dibuja el MISMO buque que venia creciendo en el pasillo: la prueba pasa delante de
  // el, sin cambiar de escena. Si este estado no estuviera, el climax se quedaria sin blanco.
  if (S.state !== 'play' && S.state !== 'takeoff' && S.state !== 'pulso') return;
  const p = run.dist / objectiveDist;
  // EL BUQUE DE PROA se lleva el tramo entero, de BARGE_T0 hasta el corte (p = 1) — y no hasta
  // PH[0].at (0.78) como el casco lateral, que llegaba a su tamaño final y se quedaba clavado el
  // ultimo quinto del pasillo. Aca la aproximacion no termina antes que el vuelo: el buque sigue
  // creciendo hasta el cuadro en que se corta, porque hasta ese cuadro te seguis acercando.
  if (deProa && ph === 0) {
    if (p >= BARGE_T0) drawBowApproach(Math.min(1, (p - BARGE_T0) / (1 - BARGE_T0)), objectiveShip);
    else LAST_BOW = null;
    return;
  }
  const next = PH[ph];
  const t0 = ph === 0 ? BARGE_T0 : PH[ph - 1].at;
  if (p < t0) return;
  const f = Math.max(0, Math.min(1, (p - t0) / (next.at - t0)));
  const sc0 = ph === 0 ? 0.04 : PH[ph - 1].scale * 1.06;  // continua donde quedo la pasada anterior
  const scE = next.scale * 0.82;
  // el `grow` del PULSO se multiplica ACA, antes de derivar uh/hullH/eslora: asi el buque crece
  // ENTERO y clavado en su linea de flotacion, en vez de estirarse.
  let sc = sc0 + (scE - sc0) * f;
  // ENCUADRE CONTRA LA VENTANA DEL PARABRISAS (EL PULSO). El `grow` de arriba dice como se acerca;
  // esto dice contra QUE se mide que el buque sea grande. Desde que la cabina va a ancho pleno la
  // pantalla dejo de servir de vara: tiene 270 px pero la ventana 136, y un buque dimensionado
  // contra la pantalla se dibuja con medio casco abajo del tablero — que es exactamente lo que
  // pasaba con la muerte del premio.
  //
  // ALTO_BUQUE 6.1 = casco (1.5·uh) + mastil (4.6·uh) sobre la cubierta: lo que el buque MIDE
  // dibujado, no lo que mide su casco. Sale de drawBargeHull, que es quien lo pinta.
  //
  // Y SOLO AGRANDA, nunca achica: la aproximacion del pasillo manda mientras el buque sea mas
  // chico que el encuadre. El premio lo trae encima; no lo empuja para atras.
  // EL ENCUADRE REEMPLAZA AL ZOOM, no se le suma: `grow` solo manda cuando no hay ventana contra
  // que medir. Aplicados los dos, el buque terminaba al doble del tamaño buscado — tres planchas
  // grises llenando el parabrisas, imposible de leer como buque.
  if (fx && fx.grow) sc *= fx.grow;
  // …Y EL TOPE DEL ENCUADRE. El acercamiento sigue siendo del `grow` —esa curva es de quien dirige
  // la cinematica— pero deja de crecer cuando el buque ya no entra en el cuadro: el casco se
  // dibuja con eslora W*0.82*sc, asi que la escala que lo hace medir `largo` pantallas es esta.
  // Sin el tope, con la cabina a ancho pleno el buque llegaba a 550 px de eslora sobre 480 de
  // pantalla y lo que se veia era el medio de un casco, sin proa ni popa: gris sin lectura.
  const encOn = !!(fx && fx.ventana > 0 && fx.largo > 0);
  // …Y EL TOPE ES BLANDO. Estuvo escrito `Math.min(sc, tope)` y eso convierte "se paso de grande"
  // en "dejo de crecer": medido, el buque quedaba clavado en 456 px los ultimos DOS SEGUNDOS
  // mientras el acercamiento seguia subiendo de 2.8× a 4.0×. En una camara que mira para adelante
  // el tamaño del blanco es lo unico que dice a que velocidad vas, asi que una derivada CERO no se
  // lee como "ya esta bien de grande": se lee como que el avion freno. Es literal el playtest —
  // «el avion SIGUE FRENANDO luego de tirar los misiles, no se si frena o el barco no se mueve».
  //
  // La compresion deja pasar entero lo que todavia entra comodo (hasta la rodilla) y aplasta el
  // resto CONTRA el tope sin alcanzarlo nunca: el buque crece cada cuadro, cada vez menos, y no se
  // pasa. Es continua y con la misma pendiente en la rodilla, asi que no hay codo visible.
  if (encOn) {
    const tope = fx.largo / 0.82, rod = tope * ENC_RODILLA;
    if (sc > rod) sc = tope - (tope - rod) * Math.exp(-(sc - rod) / (tope - rod));
  }
  const uh = SHIP_UH * sc, hullH = uh * 1.5;
  const bx = bargeCol(ph === 0 ? f : 1) + Math.sin(run.t * 0.8) * 9 * sc;
  // FLOTACION CLAVADA EN EL HORIZONTE (playtest 7/8: "el barco aparece por debajo del
  // horizonte"). Un buque lejano vive EN la linea del horizonte, siempre — la bajada con f² lo
  // dejaba flotando en mitad del mar a mitad de la aproximacion. Ya no baja NUNCA durante la
  // primera aproximacion. (Esta rama es la del climax 2D / EL PULSO, donde el pase SI es un corte
  // de camara tapado por el banco de nubes. La frase que estaba aca —"no hay continuidad de
  // posicion que preservar"— se escribio cuando el climax era el ARENA y ya no vale para todos:
  // cuando el climax es la PASADA hay continuidad y se preserva, arriba, en drawBowApproach.)
  // Entre pasadas del climax 2D (ph > 0) sigue la formula vieja, que alli si empalma.
  const wOff = ph === 0
    ? 0
    : SHIP_DECK * sc0 + hullH + (SHIP_DECK * scE - SHIP_DECK * sc0) * f * f;
  // y EMERGE de atras del banco: sube desde el horizonte durante el primer tramo — para cuando
  // el casco esta entero afuera, las nubes ya le estan tapando la mitad de abajo.
  const reveal = ph === 0 ? Math.min(1, f / 0.45) : 1;
  const sink = (1 - reveal) * (hullH + uh * 3.2);                  // cuanto sigue detras del horizonte
  // linea de flotacion en pantalla. El `drop` de EL PULSO la baja durante el premio: el buque se
  // despega del horizonte y se viene encima, que es lo que hace la camara cuando le caes arriba.
  // …y la FLOTACION se apoya en el filo de la visera cuando hay encuadre: es lo que hace que el
  // buque se sienta CERCA y no lejos-pero-grande. Nunca por encima del horizonte —un buque no
  // flota en el cielo— asi que el encuadre solo puede bajarla.
  const wBase = HOR + wOff + ((fx && fx.drop) || 0) + Math.sin(run.t * 1.3) * 1.8 * sc;
  // …y con encuadre, la FLOTACION se va apoyando en el filo de la visera: el buque deja de estar
  // clavado en el horizonte y se viene encima. Interpolado con el avance del acercamiento para que
  // no salte, y nunca POR ARRIBA del horizonte — un buque no flota en el cielo.
  const wEnc = Math.max(HOR, fx && fx.ventana ? fx.ventana * (fx.agua || 0.93) : HOR);
  // …y DESPUES de encuadrar, LA SALIDA. `baja` es lo que el buque se corre mientras le pasas por
  // encima, y va SUMADO afuera de la mezcla a proposito: el encuadre dice donde se PLANTA el buque
  // para que se lea, y el sobrevuelo dice como se te VA del cuadro despues. Metido adentro de
  // `wBase` —que es donde estaba— la mezcla se lo comia entero justo cuando el encuadre llega a
  // pleno, y el buque se quedaba plantado en el filo de la visera hasta el ultimo cuadro.
  const waterY = (encOn
    ? wBase + (wEnc - wBase) * Math.max(0, Math.min(1, fx.g || 0))
    : wBase) + ((fx && fx.baja) || 0);
  const by = waterY - hullH + sink;                                // cubierta, hundida mientras este lejos
  // DISIPACION/MATERIALIZACION: un solo reloj para los dos fundidos cruzados (corre con p, el
  // viaje entero, no con la ventana f de crecimiento del casco). Las nubes van de 0.8 a 0.1 y
  // el buque, a la INVERSA (pedido 11/8): entra FANTASMA (0.15) y se materializa hasta 1 —
  // aparecer es literalmente que el buque se vaya haciendo real a medida que la niebla se abre.
  // …pero EN EL PREMIO ya esta materializado del todo (`fx` solo llega durante la cinematica del
  // PULSO). Materializarse es un dispositivo de LA APROXIMACION: el buque se hace real a medida que
  // la niebla se abre. Encima del blanco no queda nada que revelar — y como este reloj corre con el
  // avance del PASILLO, cualquier cinematica que no venga de volarlo entero (el menu CINEMATICAS,
  // un fixture) dibujaba el buque a un 20 % de opacidad: un fantasma gris justo en el cuadro donde
  // tiene que ser una pared de acero.
  const dis = ph === 0 && !fx ? Math.max(0, Math.min(1, (p - t0) / (0.97 - t0))) : 1;
  ctx.save();
  ctx.beginPath(); ctx.rect(-80, -80, W + 160, waterY + 2 + 80); ctx.clip();   // el mar tapa lo hundido
  // MUERTE (EL PULSO): escora y se hunde. El giro va DESPUES del recorte y no antes — el recorte
  // es la superficie del mar, que no se inclina: lo que se hunde es el buque, no el oceano.
  if (fx && (fx.tilt || fx.sink)) {
    ctx.translate(bx, waterY); ctx.rotate(fx.tilt); ctx.translate(-bx, -waterY);
  }
  const byF = by + (fx ? fx.sink * hullH : 0);
  // la cubierta que se publica es la HUNDIDA y con la escora: el fuego y el impacto de EL PULSO se
  // pegan al buque que se ve, no al que estaria si no se estuviera yendo a pique
  LAST_BARGE = { bx, by: byF, uh, hullH, waterY, len: W * 0.82 * sc, sc, tilt: (fx && fx.tilt) || 0 };
  // SILUETA a contraluz (playtest 6/8): el buque va casi negro con luz de canto — cualquier
  // obstaculo (olivas y grises claros) se lee ENCIMA. La bruma de color queda solo para los
  // primeros metros; el alfa de arriba es el que manda la aparicion.
  const haze = ph === 0 ? 0.34 * (1 - f) * (1 - f) : 0;
  ctx.globalAlpha = 0.15 + 0.85 * dis;
  drawCascoDelBuque(objectiveShip, bx, W * 0.82 * sc, byF, uh, hullH, haze, fx);
  ctx.globalAlpha = 1;
  ctx.restore();
  // el banco de nubes va DESPUES del casco (lo tapa por la mitad) y ANTES de los enemigos, que
  // se dibujan mas tarde en el orquestador: oscuro sobre claro, cada cosa en su plano.
  // mismo reloj `dis` que la materializacion del casco: banco cerrado de lejos (0.8) que se
  // disipa en escalera hasta 0.1 — nunca a cero; lo que termina de tapar es el velo negro.
  // …pero NO EN EL PREMIO (`fx` solo llega durante la cinematica del PULSO). El banco existe para
  // que el buque APAREZCA de la bruma mientras te acercas; encima del blanco es niebla entre vos y
  // algo que tenes a doscientos metros. Y como escala con el buque, al sobrevolarlo (grow > 4) se
  // convertia en una pared gris que se comia la escena entera — el buque ardiendo, el mar y el
  // cielo, todo lavado del mismo gris.
  if (ph === 0 && !fx) drawShipClouds(bx, waterY, W * 0.82 * sc, uh, hullH, dis);
  // EL NOMBRE SE CALLA EN EL PULSO. Escrito sobre el buque cae justo donde la prueba pone la
  // eleccion de blanco (se vio volando el pasillo entero hasta la prueba, Q4): "HMS ARDENT"
  // encima del renglon del POLVORIN. El buque ya se presento en el briefing y en el pasillo; en
  // la prueba lo que hay que leer son las zonas.
  if (sc > 0.28 && S.state !== 'pulso') {   // ya cerca: nombre sobre el barco
    ctx.font = '9px monospace'; ctx.textAlign = 'center'; ctx.fillStyle = P.warn; ctx.globalAlpha = 0.85;
    ctx.fillText(objectiveShip, bx, by - uh * 4.6);
    ctx.globalAlpha = 1;
  }
}

/** Mezcla dos hex (0 = a, 1 = b). Lo usa el telon para lavar el color del horizonte. */
function mixHex(c, to, k) {
  const A = parseInt(c.slice(1), 16), B = parseInt(to.slice(1), 16);
  const ch = sh => Math.round(((A >> sh) & 255) + (((B >> sh) & 255) - ((A >> sh) & 255)) * k);
  return '#' + (((1 << 24) | (ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16)).slice(1);
}

// CORDON DE BRUMA del final del pasillo (ver VEIL_* en data/tuning.js). `d` es la densidad 0..1.
//
// No es la niebla de systems/fog.js (esa es un TRAMO jugable, con techo y rendija): esto es un
// TELON de guion. Tapa TODO —buque, obstaculos, horizonte— y del otro lado ya estas en el ARENA.
// Existe porque el ultimo tramo contra el buque era ilegible: el objetivo plantado adelante y los
// enemigos cruzandosele por delante (playtest 6/8). Se resuelve sacando la escena de la vista en
// vez de pelear el contraste — y de paso el corte al climax deja de ser un salto seco.
//
// Es lo UNICO del juego dibujado con gradientes y no con pixeles: no es un objeto, es aire.
export function drawVeil(d) {
  if (d <= 0) return;
  const a = Math.min(1, d) * VEIL_MAX;
  // COLOR: NEGRO (pedido 10/8, antes era el blanco del banco). El velo ya no es "entrar en la
  // nube": es la oscuridad tragandose el pasillo mientras la niebla se disipa — cierra en
  // paralelo a la escalera de opacidad de drawShipClouds y remata cubriendo la pantalla.
  const col = '#06090d';
  const hexA = (c, k) => c + Math.round(Math.max(0, Math.min(1, k)) * 255).toString(16).padStart(2, '0');
  // PARED: mas cerrada contra el horizonte y apenas mas liviana arriba y abajo — pero CUBRE la
  // pantalla entera al llegar al tope: el remate del cruce es un fundido a negro de verdad.
  const g = ctx.createLinearGradient(0, HOR - 70, 0, H + 50);
  g.addColorStop(0, hexA(col, a * 0.8));
  g.addColorStop(0.34, hexA(col, a));
  g.addColorStop(0.6, hexA(col, a));
  g.addColorStop(1, hexA(col, a * 0.72));
  ctx.fillStyle = g;
  ctx.fillRect(-80, -80, W + 160, H + 200);
  // JIRONES: bandas de bordes difusos que derivan con el avance y el paneo. Son las que lo hacen
  // leer como bruma VIVA y no como un fundido a color — sin esto parece un bug de opacidad.
  const drift = run.dist * 0.35 + cam.x * 6;
  for (let i = 0; i < 5; i++) {
    const y = HOR - 30 + i * 13 + Math.sin(run.t * 0.35 + i * 2.1) * 5;
    const wsp = W * (0.5 + (i % 3) * 0.22);
    const x = ((drift * (0.5 + i * 0.17) + i * 260) % (W + 2 * wsp)) - wsp;
    const gw = ctx.createLinearGradient(x, 0, x + wsp, 0);
    gw.addColorStop(0, hexA(col, 0));
    gw.addColorStop(0.5, hexA(col, a * 0.5));
    gw.addColorStop(1, hexA(col, 0));
    ctx.fillStyle = gw;
    ctx.fillRect(x, y, wsp, 14 + (i % 2) * 11);
  }
}

// MARCADOR de objetivo: una cuña roja sobre el horizonte que apunta a la columna del buque, para
// saber "hacia donde vamos" desde el arranque (mucho antes de que la barcaza asome). Si el objetivo
// quedo fuera de pantalla por el paneo, se pega al borde apuntando hacia el lado correcto.
export function drawObjectiveMarker(objectiveDist) {
  if (objectiveDist <= 0) return;
  // EL PULSO dibuja el MISMO buque que venia creciendo en el pasillo: la prueba pasa delante de
  // el, sin cambiar de escena. Si este estado no estuviera, el climax se quedaria sin blanco.
  if (S.state !== 'play' && S.state !== 'takeoff' && S.state !== 'pulso') return;
  const p = run.dist / objectiveDist;
  // se desvanece apenas la barcaza empieza a ser clara (~0.55): a partir de ahi el propio barco
  // es la referencia y el marcador solo taparia el puente.
  const fade = p < 0.55 ? 1 : Math.max(0, 1 - (p - 0.55) / 0.12);
  if (fade <= 0) return;
  const tx = bargeCol(approachF(p));                    // misma columna que la barcaza objetivo
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
    if (o.type === 'airboom' || o.type === 'chunk' || o.type === 'sec' || o.type === 'humo'
      || o.type === 'resto') continue;   // FX puros: no colisionan
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
    const sgy = sd.gy || 0;
    hbBox(sd.x, sgy + SOLDIER.top / 2, sd.z, SOLDIER.hw + swp, SOLDIER.top / 2, HB, 0.08);
    hbBox(sd.x, sgy + SOLDIER.top / 2, sd.z, SOLDIER.hw, SOLDIER.top / 2, HB, 0.3);
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
  // EL PULSO dibuja el MISMO buque que venia creciendo en el pasillo: la prueba pasa delante de
  // el, sin cambiar de escena. Si este estado no estuviera, el climax se quedaria sin blanco.
  if (S.state !== 'play' && S.state !== 'takeoff' && S.state !== 'pulso') return;
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
