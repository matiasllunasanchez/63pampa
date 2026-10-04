// LAS ISLAS (docs/sistemas/PLAN_GEOGRAFIA.md, G4) — la tierra que cruza el carril y se LEVANTA.
//
// El raster del suelo no puede mostrar una isla: pinta filas planas, y una loma de 14 m vista desde
// 3 m de altura tiene que SUBIR POR ENCIMA DEL HORIZONTE o el jugador se estrella contra algo que no
// vio. Asi que se dibuja como las laderas del callejon (render/paredes.js): por REBANADAS a lo largo
// de z, de lejos a cerca. Cada rebanada es el perfil de la isla a esa profundidad —la altura en cada
// x, sacada de `islaAltura`, la MISMA funcion contra la que choca el avion— cerrado hacia el agua.
// La rebanada de adelante tapa la parte baja de la de atras, y lo que queda asomando es la silueta:
// la cumbre se ve venir desde el horizonte y se acerca sola.
//
// DEBAJO ES MAR (la isla es 'sea' de base, core/geografia.js): el raster pinta agua y la isla se
// apoya encima. Y lo que queda DETRAS (un antiaereo, una fragata pasada la isla) no se tapa por orden
// de dibujo —los obstaculos van despues— sino con un techo: `techoIsla`, que recorre las mismas
// rebanadas y le dice a drawObstacle en que pixel lo corta el filo.
import { ctx, px, W, HOR, F } from './ctx.js';
import { cam } from '../core/state.js';
import { run } from '../core/run.js';
import { proj } from '../core/fx.js';
import { bendW } from '../core/zigzag.js';
import { geo, islaAltura, islaX } from '../core/geografia.js';
import { theme } from './theme.js';
import { caraLadera, tierraArriba, mez } from './paredes.js';
import { colinasHasta } from './colinas.js';
import { GEO_ISLA_Z, GEO_ISLA_NIEBLA_Z0, GEO_ISLA_NIEBLA_FULL, GEO_ISLA_NIEBLA_MAX } from '../data/tuning.js';

const MUESTRAS = 28;        // puntos por rebanada: el perfil de costado a costado
const BANDA = 7;            // m de mundo entre surco y surco del lomo
const MATA_PASO = 5;        // m de la grilla de las matas
const MATA_Z = 150;         // hasta donde se plantan: mas lejos serian un pixel sucio
const XS = new Float64Array(MUESTRAS), HS = new Float64Array(MUESTRAS);
// la rebanada anterior ya proyectada: el sombreado va en las franjas ENTRE rebanadas (como las lomadas)
const QX = new Float64Array(MUESTRAS), QY = new Float64Array(MUESTRAS), HP = new Float64Array(MUESTRAS);
const PX = new Float64Array(MUESTRAS), PY = new Float64Array(MUESTRAS);

// lo que dibujo el ultimo cuadro, para la sonda (y el fixture: "la cumbre se ve desde SPAWN_Z")
const ultimo = { rebanadas: 0, lejos: 0, cumbreY: null, hor: 0 };

/** Las x de mundo que ocupa la isla a esa profundidad: la isla parcial, sus bordes; la que tapa el
 *  carril entero, lo que se ve de costado a costado (con margen: sin el, al rolar se ve el corte). */
function tramoX(r, camZ) {
  const I = r.isla;
  if (I.m !== Infinity) return islaX(r);   // con los bulbos de afuera
  const k = F / camZ, b = bendW(camZ);
  const med = (W / 2 + 90) / k;
  return [cam.x - b - med, cam.x - b + med];
}

/** Las islas del cuadro. Se llama despues del terreno y del buque de aproximacion (la isla lo tapa:
 *  esta mas cerca) y antes de las laderas y de lo que vuela. */
export function drawIslas() {
  ultimo.rebanadas = 0; ultimo.lejos = 0; ultimo.cumbreY = null; ultimo.hor = HOR;
  if (!geo.islas.length) { colinasHasta(0); return; }
  const dv = run.dist;
  const T = tierraArriba(), L = caraLadera();
  const arena = theme.cland.near, arenaL = theme.cland.far;
  const fondo = theme.water.base0;
  // DE LA MAS LEJANA A LA MAS CERCANA, y antes de cada una las LOMADAS que estan detras de ella
  // (render/colinas.js): el suelo solo pinto las que quedan mas lejos que la isla mas lejana.
  for (let j = geo.islas.length - 1; j >= 0; j--) {
    const r = geo.islas[j];
    colinasHasta(r.d1 - dv);
    if (r.d1 - dv <= 3 || r.d0 - dv >= GEO_ISLA_Z) continue;
    const zLejos = Math.min(GEO_ISLA_Z, r.d1 - dv), zCerca = Math.max(3, r.d0 - dv);
    let hPrev = null, izPrev = null, zPrev = 0;
    // REBANADAS MAS FINAS A LO LEJOS: con el 2,2 % la silueta de una isla lejana se leia ESCALONADA
    // (el autor, 4/10). Mismo arreglo que las lomadas de render/colinas.js.
    for (let camZ = zLejos; camZ >= zCerca; camZ -= Math.max(1.5, camZ * 0.012)) {
      const wz = dv + camZ;
      const [xa, xb] = tramoX(r, camZ);
      let hMax = 0, hMed = 0;
      for (let i = 0; i < MUESTRAS; i++) {
        const x = xa + (xb - xa) * i / (MUESTRAS - 1);
        XS[i] = x; HS[i] = islaAltura(x, wz, r);
        if (HS[i] > hMax) hMax = HS[i];
        hMed += HS[i];
      }
      hMed /= MUESTRAS;
      // LA PENDIENTE hacia la camara decide el color: la cara que SUBE alejandose te mira (tierra
      // de costado, marron), el lomo es campo (verde), y la bajada del otro lado queda en sombra
      const pend = hPrev === null ? 0 : (hPrev - hMed) / Math.max(1.5, camZ * 0.022);
      hPrev = hMed;
      let col;
      // (los tonos de cerca y de lejos, en FUNDIDO: un corte a distancia fija es una raya quieta en pantalla)
      if (hMax < 0.5) col = mez(arena, arenaL, (camZ - 70) / 110);       // la playa al pie
      else if (pend > 0.35) col = mez(L.cuerpo, L.luz, Math.min(1, (pend - 0.35) * 0.6));   // farallon
      else if (pend > 0.04) col = mez(T.cerca, L.cuerpo, Math.min(1, (pend - 0.04) / 0.31));
      else if (pend < -0.04) col = mez(T.lejos, L.som, Math.min(0.6, -pend * 3));          // la sombra de atras
      else col = mez(T.cerca, T.lejos, (camZ - 100) / 140);
      // LOS SURCOS: bandas de mundo cada BANDA metros, apenas mas oscuras. Sin esto el lomo es un
      // plano de un solo color y, volando encima, no hay nada que diga a que altura ni a que
      // velocidad vas — el mismo problema que la meseta de las laderas resolvio con sus matas.
      if (hMax >= 0.5 && (Math.floor(wz / BANDA) & 1)) col = mez(col, T.furrow, 0.16);
      // LA DISTANCIA la funde con el horizonte, pero NUNCA del todo: la silueta tiene que leerse
      // desde donde nace lo que viene, o la isla es una trampa
      const niebla = Math.max(0, Math.min(1, (camZ - GEO_ISLA_NIEBLA_Z0) / (GEO_ISLA_NIEBLA_FULL - GEO_ISLA_NIEBLA_Z0)))
        * GEO_ISLA_NIEBLA_MAX;
      ctx.fillStyle = mez(col, fondo, niebla);
      ctx.beginPath();
      const a0 = proj(XS[0], 0, camZ);
      ctx.moveTo(a0.x, a0.y + 1);
      let top = Infinity;
      for (let i = 0; i < MUESTRAS; i++) {
        const p = proj(XS[i], HS[i], camZ);
        PX[i] = p.x; PY[i] = p.y;
        ctx.lineTo(p.x, p.y);
        if (p.y < top) top = p.y;
      }
      const a1 = proj(XS[MUESTRAS - 1], 0, camZ);
      ctx.lineTo(a1.x, a1.y + 1);
      ctx.closePath();
      ctx.fill();
      // EL VOLUMEN DE COSTADO (30/9). Un color por rebanada leia el lomo como un plano —"¿una pista
      // de aterrizaje de tierra?"—: cada franja entre esta rebanada y la anterior se aclara o se
      // oscurece por SU pendiente, la de adelante (te mira o te da la espalda) y la de costado (la
      // ladera que mira a la izquierda, a la luz, o a la derecha, a la sombra).
      if (hPrev !== null && zPrev > camZ && hMax >= 0.5) {
        const dz = zPrev - camZ;
        for (let i = 0; i < MUESTRAS - 1; i++) {
          if (HS[i] + HS[i + 1] + HP[i] + HP[i + 1] < 1) continue;
          const cara = ((HP[i] + HP[i + 1]) - (HS[i] + HS[i + 1])) / (2 * dz);
          // (lat > 0: sube hacia la derecha, la ladera mira a la izquierda — a la luz. El flanco del
          // canal mira a la derecha y queda en SOMBRA: iluminado era una franja clara y larga que se
          // leia como un camino)
          const lat = (HS[i + 1] - HS[i]) / Math.max(0.5, XS[i + 1] - XS[i]);
          const luz = cara * 1.2 + Math.max(-0.5, Math.min(0.5, lat)) * 0.6;
          if (luz > -0.03 && luz < 0.03) continue;
          const c2 = luz > 0 ? mez(col, T.corona, Math.min(0.45, luz * 1.4))
            : mez(col, L.som, Math.min(0.6, -luz * 2));
          ctx.fillStyle = mez(c2, fondo, niebla);
          ctx.beginPath();
          ctx.moveTo(QX[i], QY[i]); ctx.lineTo(QX[i + 1], QY[i + 1]);
          ctx.lineTo(PX[i + 1], PY[i + 1] + 0.6); ctx.lineTo(PX[i], PY[i] + 0.6);
          ctx.closePath(); ctx.fill();
        }
      }
      for (let i = 0; i < MUESTRAS; i++) { QX[i] = PX[i]; QY[i] = PY[i]; HP[i] = HS[i]; }
      zPrev = camZ;
      // LAS MATAS, cuando la rebanada cruza una fila de la grilla de mundo: se plantan encima de lo
      // que acaba de pintarse y debajo de lo que viene mas cerca, asi que el lomo de adelante las
      // tapa como corresponde. Deterministas por celda: no titilan ni se mudan.
      const iz = Math.floor(wz / MATA_PASO);
      if (camZ < MATA_Z && hMax >= 0.5 && iz !== izPrev) matas(r, iz, camZ, xa, xb, T);
      izPrev = iz;
      ultimo.rebanadas++;
      if (camZ > ultimo.lejos) ultimo.lejos = camZ;
      if (ultimo.cumbreY === null || top < ultimo.cumbreY) ultimo.cumbreY = top;
    }
  }
  colinasHasta(0);   // las lomadas que quedan mas cerca que todas las islas
}

/** Una fila de matas sobre el lomo, a la profundidad `camZ` (fila `iz` de la grilla de mundo). Solo
 *  lo que cae en pantalla, y solo donde hay tierra de verdad (no sobre la arena del pie). */
function matas(r, iz, camZ, xa, xb, T) {
  const k = F / camZ, b = bendW(camZ);
  const med = (W / 2 + 8) / k;
  const x0 = Math.max(xa, cam.x - b - med), x1 = Math.min(xb, cam.x - b + med);
  const wz = iz * MATA_PASO;
  for (let ix = Math.ceil(x0 / MATA_PASO); ix * MATA_PASO <= x1; ix++) {
    const h1 = hash2(ix, iz);
    if (h1 < 0.62) continue;
    const h2 = hash2(ix + 911, iz - 307);
    const x = ix * MATA_PASO + (h2 - 0.5) * MATA_PASO;
    const gy = islaAltura(x, wz, r);
    if (gy < 0.6) continue;
    const s = proj(x, gy, camZ);
    const w = Math.max(1, k * 0.8), hh = Math.max(1, k * (0.6 + h2 * 0.8));
    px(s.x - w / 2, s.y - hh, w, hh, T.corona);
    px(s.x - w / 2, s.y - hh, w, Math.max(1, hh * 0.45), T.mata);
  }
}

/** hash entero → [0,1). Copia local, como en render/paredes.js. */
function hash2(a, b) {
  let h = Math.imul(a | 0, 374761393) ^ Math.imul(b | 0, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** EL FILO DE UNA ISLA que le pasa por delante a un objeto en (wx, camZ): el pixel de pantalla mas
 *  alto de la tierra que hay entre la camara y el, en su columna. Null si no hay isla en el medio.
 *  Recorre las mismas rebanadas que el dibujo (con paso mas grueso: aca se busca un borde, no se
 *  pinta) y la misma `islaAltura` — el corte cae donde esta la tierra dibujada. */
export function techoIsla(wx, camZ) {
  if (!geo.islas.length) return null;
  const dv = run.dist;
  const oX = proj(wx, 0, camZ).x;
  let techo = null;
  for (const r of geo.islas) {
    const z0 = Math.max(4, r.d0 - dv), z1 = Math.min(camZ - 1, r.d1 - dv);
    for (let z = z0; z < z1; z += Math.max(3, z * 0.04)) {
      const k = F / z;
      const x = (oX - W / 2) / k + cam.x - bendW(z);
      const h = islaAltura(x, dv + z, r);
      if (h <= 0.05) continue;
      const y = HOR + (cam.y - h) * k;
      if (techo === null || y < techo) techo = y;
    }
  }
  return techo;
}

// ---------- SONDA (se QUEDA: la usan `npm run geografia` y GUIA_GEOGRAFIA.md §9) ----------
if (typeof window !== 'undefined') {
  // __islas(): lo que dibujo el ultimo cuadro — cuantas rebanadas, hasta que distancia, y el pixel
  // mas alto de la silueta contra la linea del horizonte (cumbreY < hor: asoma por encima)
  window.__islas = () => JSON.stringify({
    n: geo.islas.length, rebanadas: ultimo.rebanadas, lejos: Math.round(ultimo.lejos),
    cumbreY: ultimo.cumbreY === null ? null : Math.round(ultimo.cumbreY), hor: Math.round(ultimo.hor),
    islas: geo.islas.map(r => ({ d0: Math.round(r.d0), d1: Math.round(r.d1), ...r.isla, m: r.isla.m === Infinity ? 'todo' : r.isla.m })),
  });
}
