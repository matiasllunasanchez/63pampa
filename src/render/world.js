// RENDER DEL MUNDO: mar, tierra, cielo bajo (la turba y la pista), la malla de puntos del oleaje,
// la estela, los obstaculos y la barcaza objetivo acercandose en el horizonte.
//
// Todo se dibuja en coordenadas de mundo proyectadas (proj); el orquestador (draw en game.js) ya
// dejo aplicados los transforms de camara/roll/zoom antes de llamar aca. El cielo alto (degradado,
// sol, nubes, islas) y los loops de entidades del jugador siguen inline en el orquestador.

import { ctx, px, W, H, HOR, F, PZ } from './ctx.js';
import { theme } from './theme.js';
import { cam, cfg, S } from '../core/state.js';
import { run } from '../core/run.js';
import { wake } from '../core/world.js';
import { proj } from '../core/fx.js';
import { P, LAND } from '../data/palette.js';
import * as momentum from '../systems/momentum.js';
import * as momRender from './momentum.js';

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

export function drawSea() {
  const landMode = cfg.terrain === 'land';
  const dv = run.dist + momentum.drift();   // distancia VISUAL (drift del momentum incluido)
  const landVisible = dv < cfg.coast + 80;
  for (let y = HOR + 1; y < H; y++) {
    const dy = y - HOR;
    const z = cam.y * F / dy;
    const wz = z + dv;
    if (landVisible && wz < cfg.coast) {
      // turba malvinense con la pista de la BAM
      const vl = Math.sin(wz * 0.22) + Math.sin(wz * 0.07);
      px(-70, y, W + 140, 1, vl > 0.8 ? '#39402f' : vl < -0.8 ? '#2b3226' : '#323a2b');
      const k = F / z;
      const x1 = W / 2 + (-7 - cam.x) * k, x2 = W / 2 + (7 - cam.x) * k;
      px(x1, y, x2 - x1, 1, '#41474b');                                   // asfalto
      if (Math.floor(wz / 9) % 2 === 0)
        px(W / 2 + (0 - cam.x) * k - Math.max(1, 0.5 * k) / 2, y, Math.max(1, 0.5 * k), 1, '#9aa39b'); // eje
      if (Math.floor(wz / 14) % 2 === 0) {                                  // balizas
        px(x1 - Math.max(1, 0.5 * k), y, Math.max(1, 0.5 * k), 1, P.accent);
        px(x2, y, Math.max(1, 0.5 * k), 1, P.accent);
      }
      continue;
    }
    if (landMode) {                                                      // TIERRA: bandas de suelo por profundidad
      const f = dy / (H - HOR);
      px(-70, y, W + 140, 1, f < 0.28 ? LAND.far : f < 0.6 ? LAND.mid : LAND.near);
      if (Math.sin(wz * 0.13) + Math.sin(wz * 0.05) < -0.95) px(-70, y, W + 140, 1, LAND.furrow);  // surcos
      continue;
    }
    if (landVisible && wz < cfg.coast + 7) { px(-70, y, W + 140, 1, P.foam); continue; }  // rompiente
    // base oscura del mar (degradado por profundidad) para que los puntos resalten
    const f = dy / (H - HOR);
    px(-70, y, W + 140, 1, f < 0.22 ? theme.water.base0 : f < 0.5 ? theme.water.base1 : theme.water.base2);
  }
  if (landMode) drawLand(); else drawSeaDots(landVisible);
}

// matas/rocas dispersas sobre la tierra (parallax de movimiento a ras del suelo)
function drawLand() {
  const SPX = 4.2, SPZ = 4.2, farZ = 190;
  const dv = run.dist + momentum.drift();
  const startZ = Math.max(cfg.coast + 2, Math.ceil((dv + 4) / SPZ) * SPZ);
  for (let wz = startZ; wz < dv + farZ; wz += SPZ) {
    const camZ = wz - dv, k = F / camZ;
    const fade = Math.min(1, (camZ - 3) / 9) * (1 - (camZ / farZ) * 0.8);
    if (fade <= 0.03) continue;
    for (let wx = Math.ceil((cam.x - 74) / SPX) * SPX; wx < cam.x + 74; wx += SPX) {
      const r = Math.sin(wx * 12.9 + wz * 7.3);
      if (r < 0.35) continue;                                            // dispersa (no cubre todo)
      const s = proj(wx, 0, camZ);
      if (s.x < -4 || s.x > W + 4 || s.y < HOR) continue;
      const rock = r > 0.86;
      ctx.globalAlpha = fade * 0.85;
      const w = Math.max(1, k * (rock ? 0.7 : 0.5)), h = Math.max(1, k * (rock ? 0.55 : 0.9));
      px(s.x - w / 2, s.y - h, w, h, rock ? LAND.rock : LAND.tuft);
    }
  }
  ctx.globalAlpha = 1;
}

// malla de puntos que forma la onda del mar en perspectiva (estilo boostivity)
function drawSeaDots(landVisible) {
  const SPX = 1.4, SPZ = 1.5, farZ = 190;   // densidad x4 (antes 2.8x3.0), puntos a 1/4
  const dv = run.dist + momentum.drift();
  const startZ = Math.ceil((dv + 4) / SPZ) * SPZ;
  // paso ADAPTATIVO: cerca muestrea a SPZ/SPX plenos; lejos el paso crece para mantener
  // ~1px de separacion en pantalla (los puntos subpixel no se ven y este loop corre
  // TODO el vuelo — el mar es 2D siempre fuera del momentum)
  let wz = startZ;
  while (wz < dv + farZ) {
    const camZ = wz - dv;
    wz += Math.max(SPZ, camZ * camZ * 0.0019);
    if (landVisible && wz < cfg.coast + 6) continue;           // sin puntos sobre tierra/rompiente
    const k = F / camZ;
    const fade = Math.min(1, (camZ - 3) / 9) * (1 - (camZ / farZ) * 0.8);
    if (fade <= 0.03) continue;
    const dotW = Math.max(1, k * 0.12);   // 1/4 del tamaño clasico (0.48)
    // franja acorde al FRUSTUM: el ancho visible crece con la distancia (antes era ±74 fijo
    // y el mar quedaba "cortito" a lo lejos, p.ej. detras de la pista durante el despegue)
    const half = Math.min(320, (W / 2 + 10) * camZ / F + 6);
    const xL = cam.x - half, xR = cam.x + half;
    const sx3 = Math.max(SPX, camZ * 0.011);                   // paso x adaptativo (~1px)
    const x0 = Math.ceil(xL / sx3) * sx3;
    for (let wx = x0; wx < xR; wx += sx3) {
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

export function drawWake() {
  for (const wp of wake) {
    const trail = PZ - wp.z;                       // metros que quedaron atrás
    const s = proj(wp.x, 0, wp.z);
    const spread = (0.6 + trail * 0.34) * s.k;       // apertura de la V
    ctx.globalAlpha = Math.min(0.85, wp.i * (0.3 + trail * 0.055));
    px(s.x - s.k * 0.7, s.y, s.k * 1.4, Math.max(1, s.k * 0.2), P.foam);       // centro batido
    px(s.x - spread - s.k * 0.7, s.y, s.k * 1.4, 1, P.crest);                // brazo izq
    px(s.x + spread - s.k * 0.7, s.y, s.k * 1.4, 1, P.crest);                // brazo der
  }
  ctx.globalAlpha = 1;
}

export function drawObstacle(o) {
  const k = F / o.z;
  if (o.type === 'mast') {
    const base = proj(o.x, 0, o.z);
    px(base.x - 5 * k, base.y - 2.5 * k, 10 * k, 2.5 * k, P.bodyDark);          // casco
    px(base.x - 5 * k, base.y - 2.5 * k, 10 * k, Math.max(1, 0.6 * k), '#5c6e73');
    px(base.x - 0.45 * k, base.y - o.h * k, Math.max(1, 0.9 * k), o.h * k, P.bodyDark); // mástil
    px(base.x - 2.2 * k, base.y - (o.h - 2) * k, 4.4 * k, Math.max(1, 0.5 * k), P.bodyDark);
    px(base.x - 0.45 * k, base.y - o.h * k, Math.max(1, 0.9 * k), Math.max(1, 0.7 * k), P.warn);
  } else if (o.type === 'balloon') {
    const oy = o.y + Math.sin(run.t * 1.3 + o.ph) * 0.6;
    const s = proj(o.x, oy, o.z), base = proj(o.x, 0, o.z);
    ctx.strokeStyle = P.bodyDark; ctx.beginPath();
    ctx.moveTo(s.x, s.y + 1.6 * k); ctx.lineTo(base.x, base.y); ctx.stroke();
    px(s.x - 2.6 * k, s.y - 1.6 * k, 5.2 * k, 3.2 * k, P.dim);
    px(s.x - 2.6 * k, s.y - 1.6 * k, 5.2 * k, Math.max(1, 1.1 * k), P.body);
    px(s.x + 1.8 * k, s.y - 0.4 * k, 1.8 * k, Math.max(1, 1.1 * k), P.bodyDark);
  } else if (o.type === 'helo') {
    const oy = o.y + Math.sin(run.t * 2 + o.ph) * 0.8;
    const s = proj(o.x, oy, o.z);
    px(s.x - 3 * k, s.y - 0.8 * k, 6 * k, 2 * k, P.bodyDark);
    px(s.x + 2.4 * k, s.y - 0.4 * k, 2.4 * k, Math.max(1, 0.8 * k), P.bodyDark);
    px(s.x - 1.4 * k, s.y - 1.4 * k, 2 * k, Math.max(1, 0.8 * k), P.canopy);
    const r = Math.sin(run.t * 40) * 4;
    px(s.x - (4 + r * 0.2) * k, s.y - 2 * k, (8 + r * 0.4) * k, 1, P.body);
  } else if (o.type === 'jet') {
    // avion enemigo de frente: alas anchas, fuselaje central, canopy, deriva y leve alabeo
    const oy = o.y + Math.sin(run.t * 1.6 + o.ph) * 0.5;
    const s = proj(o.x, oy, o.z);
    const bank = Math.sin(run.t * 1.1 + o.ph) * 0.7;          // metros de alabeo en las puntas
    px(s.x - 5 * k, s.y - bank * k - 0.45 * k, 5 * k, 0.9 * k, P.body);   // ala izquierda
    px(s.x, s.y + bank * k - 0.45 * k, 5 * k, 0.9 * k, P.body);   // ala derecha
    px(s.x - 5 * k, s.y - bank * k + 0.45 * k, 5 * k, 0.5 * k, P.bodyDark);
    px(s.x, s.y + bank * k + 0.45 * k, 5 * k, 0.5 * k, P.bodyDark);
    px(s.x - 5 * k, s.y - bank * k - 0.45 * k, 1 * k, 0.9 * k, P.dim);    // puntas de ala
    px(s.x + 4 * k, s.y + bank * k - 0.45 * k, 1 * k, 0.9 * k, P.dim);
    px(s.x - 1.1 * k, s.y - 1.5 * k, 2.2 * k, 3 * k, P.bodyDark);         // fuselaje
    px(s.x - 0.9 * k, s.y - 1.2 * k, 1.8 * k, 2.4 * k, P.body);
    px(s.x - 0.7 * k, s.y - 1.1 * k, 1.4 * k, 1 * k, P.canopy);           // canopy
    px(s.x - 0.35 * k, s.y - 3 * k, 0.8 * k, 1.6 * k, P.bodyDark);        // deriva
    px(s.x - 0.4 * k, s.y - 1.5 * k, 0.8 * k, 0.8 * k, P.warn);           // nariz
  } else if (o.type === 'fuel') {
    const oy = o.y + Math.sin(run.t * 2) * 0.5;
    const s = proj(o.x, oy, o.z);
    px(s.x - 1.4 * k, s.y - 1.8 * k, 2.8 * k, 3.6 * k, P.accent);
    px(s.x - 1.4 * k, s.y - 0.4 * k, 2.8 * k, Math.max(1, 0.7 * k), P.ink);
  }
}

// la barcaza objetivo VISIBLE en vuelo normal: aparece en el horizonte desde el 45% del recorrido
// y crece hasta empalmar con la escala de la proxima pasada del momentum (es el final del mapa)
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
  // ALINEADO AL HORIZONTE: la barcaza queda pegada a la linea del horizonte (donde emergen los
  // obstaculos, misma perspectiva) casi todo el acercamiento, y recien "baja" (se acerca) sobre
  // el final con ease-in cuadratico, empalmando exacto con la cubierta del momentum (HOR+36*scE).
  const d0 = ph === 0 ? 2 : 36 * sc0;
  const dOff = d0 + (36 * scE - d0) * f * f;
  const bx = W / 2 - cam.x * 1.2 + Math.sin(run.t * 0.8) * 6 * sc;
  const by = HOR + dOff + Math.sin(run.t * 1.3) * 1.2 * sc;
  // bruma atmosferica: de lejos es una silueta tenue → los obstaculos (solidos) resaltan encima
  ctx.globalAlpha = ph === 0 ? 0.35 + 0.65 * f : 1;
  momRender.drawBargeHull(bx, W * 0.82 * sc, by, 9 * sc, run.t);
  ctx.globalAlpha = 1;
  if (sc > 0.28) {   // ya cerca: nombre sobre el barco
    ctx.font = '6px monospace'; ctx.textAlign = 'center'; ctx.fillStyle = P.warn; ctx.globalAlpha = 0.85;
    ctx.fillText(objectiveShip, bx, by - 9 * sc * 4.6);
    ctx.globalAlpha = 1;
  }
}

