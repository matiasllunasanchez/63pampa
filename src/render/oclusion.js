// LO QUE TAPA EL TERRENO (13/11/2026, el autor: "hay cosas que deberian estar ENCIMA de otras y se ven al
// reves: aviones que pasan por encima de montañas cuando deberian estar detras, el barco que aparece por
// encima de algo fisico del pasillo").
//
// EL PROBLEMA, de raiz: el terreno que se levanta —las laderas del callejon (paredes.js), las islas
// (islas.js), las lomadas de la tierra (colinas.js) y las olas— se pinta ANTES que lo que vuela y lo que
// navega, asi que todo lo que viene despues queda ENCIMA, este donde este. Hasta hoy habia recortes sueltos
// (el antiaereo de ladera, lo que esta detras de una isla, detras de una ola), cada uno con un solo filo
// horizontal.
//
// LA SOLUCION: una sola pregunta, por COLUMNA de pantalla — `techoCol(sx, z)`: ¿cual es el pixel mas alto del
// terreno que hay entre la camara y la profundidad `z`, en la columna `sx`? — y un recorte con la forma del
// filo (`recorteDetras`): se muestrea la columna a lo ancho del dibujo y se arma un poligono que deja ver
// solo lo que queda por encima de la tierra de adelante. Las cuentas son LAS MISMAS que pintan cada cosa
// (paredH/paredXAt/alturaSuelo, islaAltura, colinaH, olaBump): el corte cae donde esta la tierra dibujada.
//
// Cuesta: las respuestas se guardan por cuadro (columna redondeada + profundidad en escalones del 3%), y sin
// terreno a la vista no se recorre nada.
import { ctx, W, H, HOR, F } from './ctx.js';
import { cam } from '../core/state.js';
import { run } from '../core/run.js';
import { obstacles } from '../core/world.js';
import { pared, paredH, paredXAt, paredCara, bendW } from '../core/zigzag.js';
import { alturaSuelo, geo, islaAltura, rampaTierra, islaEn, sueloEn } from '../core/geografia.js';
import { olaBump } from '../core/sea.js';
import { GEO_ISLA_Z, COLINA_Z, COLINA_X0 } from '../data/tuning.js';
import { techoColinasCol, hayColinas, tierraAdentro } from './colinas.js';
import { colinaH } from '../core/tierra.js';
import { techoGigante } from './world.js';

const ZMAX = 2000;

// EL CUADRO: las muestras de profundidad y todo lo que NO depende de la columna, calculado una vez por cuadro
// (las alturas de las laderas a cada lado, si hay lomadas ahi, que islas cruzan). Despues cada columna se
// arma de a poco y se guarda su filo acumulado: la columna que ya se pregunto no se vuelve a recorrer.
let cuadroT = -1, cuadroD = -1, cuadroCX = NaN, cuadroCY = NaN;
const Z = [], K = [], BEND = [], WZ = [];
const PIE_I = [], CRE_I = [], GY_I = [], H_I = [], PIE_D = [], CRE_D = [], GY_D = [], H_D = [];
const COL = [], COSTA = [], RAMPA = [], ISLAS = [];
let hayPared = false, hayCol = false, hayIsla = false;
const columnas = new Map();   // columna (2 px) -> { n: muestras hechas, min: Float32Array }

function armarCuadro() {
  cuadroT = run.t; cuadroD = run.dist; cuadroCX = cam.x; cuadroCY = cam.y;
  columnas.clear();
  Z.length = 0;
  const dv = run.dist, p = !!pared();
  hayPared = p; hayCol = hayColinas(); hayIsla = geo.islas.length > 0;
  for (let z = 4; z < ZMAX; z += Math.max(3, z * 0.04)) {
    const i = Z.length, wz = dv + z;
    Z[i] = z; K[i] = F / z; BEND[i] = bendW(z); WZ[i] = wz;
    for (const [lado, PIE, CRE, GY, HH] of [[-1, PIE_I, CRE_I, GY_I, H_I], [1, PIE_D, CRE_D, GY_D, H_D]]) {
      const h = p ? paredH(wz, lado) : 0;
      HH[i] = h;
      if (h > 0.05) { const pie = lado * paredXAt(wz, lado); PIE[i] = pie; CRE[i] = lado * paredCara(wz, lado, h); GY[i] = alturaSuelo(pie, wz); }
    }
    const rampa = hayCol && z < COLINA_Z ? rampaTierra(wz) : 0;
    COL[i] = rampa > 0.01 && !islaEn(wz);
    RAMPA[i] = rampa; COSTA[i] = COL[i] && sueloEn(wz) === 'coast';
    ISLAS[i] = hayIsla && z < GEO_ISLA_Z ? geo.islas.filter(r => r.d0 < wz && r.d1 > wz) : null;
  }
}

/** El filo de UNA columna hasta la muestra `hasta` (exclusiva), acumulado: min[i] = lo mas alto de 0..i. */
function columna(sx, hasta) {
  const key = Math.round(sx / 2);
  let c = columnas.get(key);
  if (!c) { c = { n: 0, min: new Float32Array(Z.length) }; columnas.set(key, c); }
  if (c.n >= hasta) return c;
  const cx = key * 2;
  let t = c.n > 0 ? c.min[c.n - 1] : Infinity;
  for (let i = c.n; i < hasta; i++) {
    const k = K[i], z = Z[i];
    // LAS LADERAS: del lado de la roca; sobre la CARA la altura sube del pie a la cresta, de la cresta para
    // afuera la meseta a la altura entera
    if (hayPared) {
      for (let s = 0; s < 2; s++) {
        const lado = s ? 1 : -1, h = s ? H_D[i] : H_I[i];
        if (!(h > 0.05)) continue;
        const pie = s ? PIE_D[i] : PIE_I[i], cre = s ? CRE_D[i] : CRE_I[i];
        const a = W / 2 + (pie - cam.x + BEND[i]) * k;
        if (lado > 0 ? cx < a : cx > a) continue;
        const b = W / 2 + (cre - cam.x + BEND[i]) * k;
        const u = b === a ? 1 : Math.max(0, Math.min(1, (cx - a) / (b - a)));
        const y = HOR + (cam.y - (s ? GY_D[i] : GY_I[i]) - h * u) * k;
        if (y < t) t = y;
      }
    }
    const x = (cx - W / 2) / k + cam.x - BEND[i];
    // LAS ISLAS
    if (ISLAS[i]) for (const r of ISLAS[i]) {
      const h = islaAltura(x, WZ[i], r);
      if (h > 0.05) { const y = HOR + (cam.y - h) * k; if (y < t) t = y; }
    }
    // LAS LOMADAS de la tierra (fuera del carril, y no donde manda la ladera)
    if (COL[i] && Math.abs(x) >= COLINA_X0 && !((x < 0 ? H_I[i] : H_D[i]) > 0)) {
      const ta = tierraAdentro(x, WZ[i], COSTA[i]);
      if (ta > 0) {
        const h = colinaH(x, WZ[i]) * RAMPA[i] * ta;
        if (h > 0.05) { const y = HOR + (cam.y - h) * k; if (y < t) t = y; }
      }
    }
    c.min[i] = t;
  }
  c.n = hasta;
  return c;
}

/** ¿Hay algo que pueda tapar en este cuadro? La pregunta barata antes de todo. */
export function hayTerreno() {
  return !!pared() || geo.islas.length > 0 || hayColinas() || obstacles.some(o => o.type === 'ola' && o.z > 3);   // (la gigante es una 'ola')
}

/** EL FILO DEL TERRENO por delante de la profundidad `camZ`, en la columna de pantalla `sx`: la `y` de
 *  pantalla mas alta de lo que tapa, o null si no hay nada. */
export function techoCol(sx, camZ) {
  if (run.t !== cuadroT || run.dist !== cuadroD || cam.x !== cuadroCX || cam.y !== cuadroCY) armarCuadro();
  // cuantas muestras quedan delante de camZ (busqueda binaria: Z es creciente)
  let lo = 0, hi = Z.length;
  while (lo < hi) { const m = (lo + hi) >> 1; if (Z[m] < camZ - 1) lo = m + 1; else hi = m; }
  let t = Infinity;
  if (lo > 0 && (hayPared || hayIsla || hayCol)) t = columna(sx, lo).min[lo - 1];
  // LAS OLAS que pasan por delante (son pocas y se mueven: sin guardar)
  for (const w of obstacles) {
    if (w.type !== 'ola' || !(w.z > 3) || w.z >= camZ - 1 || w.kind === 'gigante') continue;   // (la gigante: abajo)
    const wx = cam.x + (sx - W / 2) * w.z / F;
    const h = olaBump(w, wx - w.x, 0);
    if (h > 0.3) { const y = HOR + (cam.y - h) * F / w.z; if (y < t) t = y; }
  }
  const tg = techoGigante(sx, camZ);
  if (tg !== null && tg < t) t = tg;
  return t === Infinity ? null : t;
}

/** RECORTA lo que se va a dibujar a la profundidad `camZ`, que en pantalla ocupa de `x0` a `x1` y de `yTop`
 *  a `yBase`, para que solo se vea lo que asoma por encima del terreno de adelante. Devuelve:
 *    'libre'  nada lo tapa: dibujar como siempre (no se toco el ctx)
 *    'oculto' esta tapado entero: no dibujar
 *    'clip'   se hizo ctx.save() + clip(): dibujar y despues llamar `soltarRecorte()` */
export function recorteDetras(x0, x1, yTop, yBase, camZ) {
  if (!(camZ > 6) || !hayTerreno()) return 'libre';
  if (typeof window !== 'undefined' && window.__sinOclusion) return 'libre';   // (sonda: comparar con y sin)
  // PRIMERO TRES COLUMNAS (los bordes y el medio): casi siempre no hay nada adelante y con eso alcanza para
  // saberlo — el muestreo fino es solo para lo que de verdad asoma por detras de algo
  let toca = false;
  for (const x of [x0, (x0 + x1) / 2, x1]) { const t = techoCol(x, camZ); if (t !== null && t < yBase) { toca = true; break; } }
  if (!toca) return 'libre';
  const ancho = Math.max(1, x1 - x0), paso = Math.max(2, ancho / 18);
  const xs = [], ts = [];
  let alguno = false, todos = true;
  for (let x = x0; x <= x1 + 0.01; x += paso) {
    const t = techoCol(x, camZ);
    const y = t === null ? Infinity : t;
    xs.push(x); ts.push(y);
    if (y < yBase) alguno = true;
    if (y > yTop) todos = false;
  }
  if (!alguno) return 'libre';
  if (todos) return 'oculto';
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x0 - 2, -400);
  for (let i = 0; i < xs.length; i++) {
    const y = Math.min(ts[i], H + 400);
    ctx.lineTo(xs[i] - paso / 2, y); ctx.lineTo(xs[i] + paso / 2, y);
  }
  ctx.lineTo(x1 + 2, -400);
  ctx.closePath();
  ctx.clip();
  ctx.beginPath();   // (el camino del recorte no puede quedar de camino actual: ver world.js drawObstacle)
  return 'clip';
}
export function soltarRecorte() { ctx.restore(); ctx.beginPath(); }

/** Dibuja `fn` recortado por el terreno de adelante (ver `recorteDetras`). */
export function detras(x0, x1, yTop, yBase, camZ, fn) {
  const r = recorteDetras(x0, x1, yTop, yBase, camZ);
  if (r === 'oculto') return;
  fn();
  if (r === 'clip') soltarRecorte();
}

// (SONDA) cuanto cuesta: N columnas a la profundidad z, en ms
if (typeof window !== 'undefined') window.__ocluPerf = (n, z) => { const t0 = performance.now(); cuadroT = -1; for (let i = 0; i < n; i++) techoCol((i * 7) % W, z + (i % 13) * 9); return +(performance.now() - t0).toFixed(2); };
// (SONDA) el filo en una columna, y que capas hay
if (typeof window !== 'undefined') window.__techoCol = (sx, z) => JSON.stringify({ t: techoCol(+sx, +z), colinas: hayColinas(), islas: geo.islas.length, pared: !!pared(), col: techoColinasCol(+sx, +z),
  suelo: [30, 80, 160, 300].map(zz => { const k = F / zz, x = (+sx - W / 2) / k + cam.x - bendW(zz); return [Math.round(x), +alturaSuelo(x, run.dist + zz).toFixed(1)]; }) });
