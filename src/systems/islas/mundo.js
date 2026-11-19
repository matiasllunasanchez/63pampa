// LAS ISLAS REALES — EL MUNDO EN CPU (prototipo I0, docs/proyecto/ANALISIS_ISLAS_REALES.md).
//
// Portado de Dusk Patrol (repo rasantev2: world/terrain.js + world/terrain-worker.js). Arma, a partir
// del mapa de alturas real (data/islas_dem.js), las cuatro texturas que dibuja el shader del terreno
// (systems/islas/terreno3d.js) y contesta la altura del suelo en CPU para el vuelo.
//
//   altura(x, z) = mapa real (125 m por texel) + detAmp(mapa) * relieve fino (procedural, se repite
//                  cada TILE metros). detAmp es 0 en la costa: la costa queda donde la ponen los datos.
//
// EL SHADER CALCULA LA MISMA SUMA (`hgt()` en terreno3d.js): si se toca detAmp aca, se toca DET_AMP_GLSL.
//
// COORDENADAS: el arena vuela en metros LOCALES. Local = metros absolutos del mapa − `org`, y `org` se
// fija una sola vez, en el punto de arranque. Asi los numeros que ven three.js y la fisica son chicos
// (unos pocos km) aunque el mapa mida 310 × 210 km. Ejes: x = este, z = sur, y = arriba, mar en y = 0.
//
// Se carga UNA vez y en segundo plano (workers): `cargar()` devuelve una promesa y `listo()` dice si
// ya se puede volar. Nada de esto corre si no se entra a las islas.
import { ISLAS_DEM } from '../../data/islas_dem.js';

export const TILE = 10240, N = 1024, CN = 512;   // periodo (m) y resolucion del relieve fino; resolucion de nubes
export const MAP_NX = ISLAS_DEM.nx, MAP_NZ = ISLAS_DEM.nz, MAP_CELL = ISLAS_DEM.cell;
export const MAP_W = MAP_NX * MAP_CELL, MAP_D = MAP_NZ * MAP_CELL;
const SEA_FLOOR_M = -150;
// EL SOL DE MAYO: bajo y al norte, detras del manto de nubes (el de Dusk Patrol). Ilumina poco y de
// costado; lo que mas se nota de el son las sombras horneadas de los cerros.
export const SUN = (() => { const v = [-0.913, 0.191, 0.353], l = Math.hypot(...v); return v.map(c => c / l); })();

const sstep = (a, b, x) => { let t = (x - a) / (b - a); t = t < 0 ? 0 : t > 1 ? 1 : t; return t * t * (3 - 2 * t); };
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
/** Amplitud del relieve fino (m) segun la altura del mapa. Misma formula que DET_AMP_GLSL. */
export const detAmp = h => sstep(0.3, 8, h) * (3 + 15 * sstep(25, 320, h));
export const DET_AMP_GLSL = 'float detAmp(float h){ return smoothstep(0.3, 8.0, h) * (3.0 + 15.0*smoothstep(25.0, 320.0, h)); }';

const M = {
  estado: 'nada',        // 'nada' | 'cargando' | 'listo' | 'fallo'
  prog: 0,
  org: [0, 0],           // metros absolutos del mapa donde cae el (0, 0) local
  HT: null, DT: null, HMAX: 800,
  tex: null,             // { HD, BIO, DD, CL } para el shader
  prom: null,
};

export const listo = () => M.estado === 'listo';
export const estado = () => M.estado;
export const progreso = () => M.prog;
export const org = () => M.org;
export const hmax = () => M.HMAX;
export const texturas = () => M.tex;

/** lon/lat (grados) → metros ABSOLUTOS del mapa [x, z] (la misma proyeccion que el horneado). */
export function lonLatAbs(lon, lat) {
  const R = 6371000, d = ISLAS_DEM, DEG = Math.PI / 180;
  const z = (d.lat0 - lat) * DEG * R, x = (lon - d.lon0) * DEG * R * Math.cos(lat * DEG);
  return [x - d.px0, z - d.pz0];
}
/** lon/lat → metros LOCALES [x, z]. */
export function lonLatLocal(lon, lat) { const [x, z] = lonLatAbs(lon, lat); return [x - M.org[0], z - M.org[1]]; }

/** Fija el origen local en un punto absoluto del mapa, redondeado a TILE: el relieve fino y las nubes
 *  se repiten cada TILE, asi que un origen en multiplo de TILE no corre ningun patron. */
export function fijarOrigen(ax, az) { M.org = [Math.floor(ax / TILE) * TILE, Math.floor(az / TILE) * TILE]; }

/** Altura del mapa (sin relieve fino) en metros absolutos; fondo de mar fuera del mapa. */
export function mapH(ax, az) {
  const HT = M.HT;
  if (!HT) return 0;
  let fx = ax / MAP_CELL - 0.5, fz = az / MAP_CELL - 0.5;
  if (fx < 0 || fz < 0 || fx > MAP_NX - 1 || fz > MAP_NZ - 1) {
    if (fx < -1 || fz < -1 || fx > MAP_NX || fz > MAP_NZ) return SEA_FLOOR_M;
    fx = clamp(fx, 0, MAP_NX - 1.001); fz = clamp(fz, 0, MAP_NZ - 1.001);
  }
  const ix = Math.floor(fx), iz = Math.floor(fz); fx -= ix; fz -= iz;
  const o = iz * MAP_NX + ix, a = HT[o], b = HT[o + 1], c = HT[o + MAP_NX], d = HT[o + MAP_NX + 1];
  return a + (b - a) * fx + (c - a) * fz + (a - b - c + d) * fx * fz;
}
/** Relieve fino (−1..1) en coordenadas locales; se repite cada TILE. */
function detailH(x, z) {
  const DT = M.DT;
  if (!DT) return 0;
  let fx = x / TILE * N - 0.5, fz = z / TILE * N - 0.5;
  const ix = Math.floor(fx), iz = Math.floor(fz); fx -= ix; fz -= iz;
  const x0 = ((ix % N) + N) % N, z0 = ((iz % N) + N) % N, x1 = (x0 + 1) % N, z1 = (z0 + 1) % N;
  const a = DT[z0 * N + x0], b = DT[z0 * N + x1], c = DT[z1 * N + x0], d = DT[z1 * N + x1];
  return a + (b - a) * fx + (c - a) * fz + (a - b - c + d) * fx * fz;
}
/** Altura del suelo en coordenadas LOCALES (negativa = fondo de mar o laguna). */
export function sueloH(x, z) {
  const h = mapH(x + M.org[0], z + M.org[1]);
  return h + detAmp(h) * detailH(x, z);
}
/** Lo que el avion no puede atravesar: el suelo o el agua (y = 0), lo que este mas alto. */
export const superficieH = (x, z) => Math.max(sueloH(x, z), 0);
/** Distancia (m) al borde del mapa mas cercano, en coordenadas locales. */
export function alBorde(x, z) {
  const ax = x + M.org[0], az = z + M.org[1];
  return Math.min(ax, az, MAP_W - ax, MAP_D - az);
}
/** Rumbo (rad, 0 = norte, horario) desde un punto local hacia el centro del mapa. */
export function rumboAlCentro(x, z) {
  const ax = x + M.org[0], az = z + M.org[1];
  return Math.atan2(MAP_W / 2 - ax, -(MAP_D / 2 - az));
}

// ---------------------------------------------------------------------------------------------
// LA CARGA
// ---------------------------------------------------------------------------------------------

async function decodeDEM() {
  const bin = Uint8Array.from(atob(ISLAS_DEM.data), c => c.charCodeAt(0));
  const raw = new Uint8Array(await new Response(new Blob([bin]).stream().pipeThrough(new DecompressionStream('deflate'))).arrayBuffer());
  const nx = MAP_NX, n = nx * MAP_NZ, V = new Int16Array(n), H = new Float32Array(n), q = ISLAS_DEM.q;
  for (let j = 0; j < MAP_NZ; j++) for (let i = 0; i < nx; i++) {
    const k = j * nx + i, zz = raw[k] | (raw[n + k] << 8), r = zz & 1 ? -((zz + 1) >> 1) : zz >> 1;
    const l = i ? V[k - 1] : 0, u = j ? V[k - nx] : 0, ul = i && j ? V[k - nx - 1] : 0;
    V[k] = r + (i && j ? l + u - ul : i ? l : u);
    H[k] = V[k] * q;
  }
  return H;
}

function runWorkers(nW, makeMsg, onDone, onProg) {
  const url = URL.createObjectURL(new Blob([WORKER_SRC], { type: 'text/javascript' }));
  const prog = new Array(nW).fill(0);
  return Promise.all([...Array(nW)].map((_, k) => new Promise((res, rej) => {
    const w = new Worker(url);
    w.onerror = e => { rej(new Error('worker: ' + (e.message || 'fallo'))); w.terminate(); };
    w.onmessage = e => {
      const d = e.data;
      if (d.type === 'p') { prog[k] = d.v; onProg(prog.reduce((a, b) => a + b, 0) / nW); }
      else { onDone(k, d); w.terminate(); res(); }
    };
    const [msg, transfer] = makeMsg(k);
    w.postMessage(msg, transfer || []);
  }))).finally(() => URL.revokeObjectURL(url));
}

/** Carga el mundo una sola vez. Las llamadas siguientes devuelven la misma promesa. */
export function cargar() {
  if (M.prom) return M.prom;
  M.estado = 'cargando'; M.prog = 0;
  M.prom = (async () => {
    const nW = clamp(navigator.hardwareConcurrency || 4, 2, 8);
    const rowsOf = (k, n) => [Math.floor(n * k / nW), Math.floor(n * (k + 1) / nW)];
    const H = await decodeDEM();
    M.prog = 0.05;
    let mx = 0; for (let i = 0; i < H.length; i++) if (H[i] > mx) mx = H[i];
    // relieve fino y nubes
    const D = new Float32Array(N * N), CL = new Uint8Array(CN * CN * 4);
    await runWorkers(nW, k => { const [r0, r1] = rowsOf(k, N), [c0, c1] = rowsOf(k, CN); return [{ cmd: 'height', N, CN, r0, r1, c0, c1 }]; },
      (k, d) => { D.set(d.h, rowsOf(k, N)[0] * N); CL.set(d.c, rowsOf(k, CN)[0] * CN * 4); },
      p => { M.prog = 0.05 + p * 0.25; });
    let mean = 0; for (let i = 0; i < D.length; i++) mean += D[i]; mean /= D.length;
    let dev = 0; for (let i = 0; i < D.length; i++) { D[i] -= mean; dev = Math.max(dev, Math.abs(D[i])); }
    for (let i = 0; i < D.length; i++) D[i] /= dev;
    const DD = new Float32Array(N * N * 4), dc = TILE / N;
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const o = (j * N + i) * 4;
      DD[o] = D[j * N + i];
      DD[o + 1] = (D[j * N + (i + 1) % N] - D[j * N + (i - 1 + N) % N]) / (2 * dc);
      DD[o + 2] = (D[((j + 1) % N) * N + i] - D[((j - 1 + N) % N) * N + i]) / (2 * dc);
    }
    // normales, sombras horneadas y bioma del mapa; cada worker recibe sus filas y un margen
    const HD = new Float32Array(MAP_NX * MAP_NZ * 4), BIO = new Uint8Array(MAP_NX * MAP_NZ * 4);
    const PAD = 24;
    await runWorkers(nW, k => {
      const [r0, r1] = rowsOf(k, MAP_NZ), rs = Math.max(0, r0 - PAD), re = Math.min(MAP_NZ, r1 + PAD);
      const slice = H.slice(rs * MAP_NX, re * MAP_NX);
      return [{ cmd: 'derive', NX: MAP_NX, NZ: MAP_NZ, H: slice, rs, rows: re - rs, r0, r1, cell: MAP_CELL, sun: SUN, hmax: mx + 4 }, [slice.buffer]];
    },
      (k, d) => { const r0 = rowsOf(k, MAP_NZ)[0]; HD.set(d.out, r0 * MAP_NX * 4); BIO.set(d.bio, r0 * MAP_NX * 4); },
      p => { M.prog = 0.3 + p * 0.7; });
    M.HT = H; M.DT = D; M.HMAX = mx + detAmp(mx) + 4;
    M.tex = { HD, BIO, DD, CL };
    M.prog = 1; M.estado = 'listo';
  })().catch(e => { console.error('ISLAS: no cargo el mundo', e); M.estado = 'fallo'; });
  return M.prom;
}

// ---------------------------------------------------------------------------------------------
// EL WORKER. Corre en otro hilo a partir de su propio TEXTO (WORKER_SRC): no puede usar nada de
// afuera de la funcion. Copia textual del de Dusk Patrol (world/terrain-worker.js).
// ---------------------------------------------------------------------------------------------
function terrainWorker() {
  const G = new Float32Array(512);
  for (let i = 0; i < 256; i++) { const a = i * 2.399963229728653; G[i * 2] = Math.cos(a); G[i * 2 + 1] = Math.sin(a); }
  function hh(x, y, s) {
    let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(s, 1442695041)) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    h ^= h >>> 16;
    return h & 255;
  }
  function gn(x, y, P, s) {
    const xi = Math.floor(x), yi = Math.floor(y);
    const fx = x - xi, fy = y - yi;
    const x0 = ((xi % P) + P) % P, y0 = ((yi % P) + P) % P, x1 = (x0 + 1) % P, y1 = (y0 + 1) % P;
    let g = hh(x0, y0, s) * 2; const a = G[g] * fx + G[g + 1] * fy;
    g = hh(x1, y0, s) * 2; const b = G[g] * (fx - 1) + G[g + 1] * fy;
    g = hh(x0, y1, s) * 2; const c = G[g] * fx + G[g + 1] * (fy - 1);
    g = hh(x1, y1, s) * 2; const d = G[g] * (fx - 1) + G[g + 1] * (fy - 1);
    const u = fx * fx * fx * (fx * (fx * 6 - 15) + 10), v = fy * fy * fy * (fy * (fy * 6 - 15) + 10);
    return (a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v) * 1.42;
  }
  function fbm(u, v, P, o, s) {
    let a = 0.5, f = P, sum = 0, n = 0;
    for (let i = 0; i < o; i++) { sum += gn(u * f, v * f, f, s + i * 17) * a; n += a; a *= 0.5; f *= 2; }
    return sum / n;
  }
  function ss(a, b, x) { let t = (x - a) / (b - a); t = t < 0 ? 0 : t > 1 ? 1 : t; return t * t * (3 - 2 * t); }
  function detail(u, v) {
    let r = 0, amp = 0.5, f = 24, prev = 1, n = 0;
    for (let o = 0; o < 4; o++) {
      let k = 1 - Math.abs(gn(u * f, v * f, f, 700 + o * 13)); k *= k;
      r += k * amp * prev; n += amp; prev = Math.min(1, k * 1.3); amp *= 0.5; f *= 2;
    }
    return r / n + fbm(u, v, 96, 3, 720) * 0.25;
  }
  function cloud(u, v) {
    const big = fbm(u, v, 3, 3, 500);
    const puff = fbm(u + big * 0.04, v, 15, 4, 501);
    const c = ss(0.03, 0.40, puff * 0.95 + big * 0.5 + 0.06);
    const d = fbm(u, v, 52, 3, 502) * 0.5 + 0.5;
    return [c, d];
  }
  function bil(H, NX, NZ, rs, rows, x, y) {
    x = Math.min(Math.max(x, 0), NX - 1.001); y = Math.min(Math.max(y, rs), Math.min(NZ, rs + rows) - 1.001);
    const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy, o = (iy - rs) * NX;
    const a = H[o + ix], b = H[o + ix + 1], c = H[o + NX + ix], d = H[o + NX + ix + 1];
    return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
  }
  function doHeight(m) {
    const N = m.N, CN = m.CN, rows = m.r1 - m.r0, crows = m.c1 - m.c0;
    const h = new Float32Array(rows * N), c = new Uint8Array(crows * CN * 4);
    const total = rows + crows; let done = 0;
    for (let j = m.r0; j < m.r1; j++) {
      for (let i = 0; i < N; i++) h[(j - m.r0) * N + i] = detail(i / N, j / N);
      if (((++done) & 15) === 0) postMessage({ type: 'p', v: done / total });
    }
    for (let j = m.c0; j < m.c1; j++) {
      for (let i = 0; i < CN; i++) {
        const r = cloud(i / CN, j / CN), o = ((j - m.c0) * CN + i) * 4;
        c[o] = Math.round(r[0] * 255); c[o + 1] = Math.round(r[1] * 255); c[o + 2] = 0; c[o + 3] = 255;
      }
      if (((++done) & 15) === 0) postMessage({ type: 'p', v: done / total });
    }
    postMessage({ type: 'done', h, c }, [h.buffer, c.buffer]);
  }
  function doDerive(m) {
    const NX = m.NX, NZ = m.NZ, H = m.H, rs = m.rs, hr = m.rows, cell = m.cell, rows = m.r1 - m.r0, hmax = m.hmax;
    const out = new Float32Array(rows * NX * 4), bio = new Uint8Array(rows * NX * 4);
    const sx = m.sun[0], sz = m.sun[2], hl = Math.hypot(sx, sz), dx = sx / hl, dz = sz / hl, k = m.sun[1] / hl;
    const at = (i, j) => H[(Math.min(Math.max(j, rs), rs + hr - 1) - rs) * NX + Math.min(Math.max(i, 0), NX - 1)];
    const L = 65536;
    for (let j = m.r0; j < m.r1; j++) {
      for (let i = 0; i < NX; i++) {
        const h = at(i, j);
        let nx = -(at(i + 1, j) - at(i - 1, j)) / (2 * cell), nz = -(at(i, j + 1) - at(i, j - 1)) / (2 * cell), ny = 1;
        const nl = Math.hypot(nx, ny, nz); nx /= nl; nz /= nl; ny /= nl;
        const h0 = Math.max(h, 0) + 1.2; let res = 1, s = 1.0;
        while (s < 400) {
          const hs = Math.max(bil(H, NX, NZ, rs, hr, i + dx * s, j + dz * s), 0);
          const ray = h0 + k * s * cell;
          if (ray > hmax) break;
          const r = (ray - hs) / (1.5 + s * cell * 0.011);
          if (r < res) { res = r; if (res <= 0) { res = 0; break; } }
          s += s < 8 ? 0.5 : s < 40 ? 1 : 2;
        }
        const o = ((j - m.r0) * NX + i) * 4;
        out[o] = h; out[o + 1] = nx; out[o + 2] = nz; out[o + 3] = ss(0, 1, res);
        const u = i * cell / L, v = j * cell / L, slope = 1 - ny;
        const heath = ss(-0.1, 0.3, fbm(u, v, 44, 4, 300)) * (1 - ss(380, 520, h)) * ss(2, 10, h);
        const tone = Math.min(1, Math.max(0, fbm(u, v, 20, 3, 302) * 0.9 + 0.5 - ss(0.02, 0.12, slope) * 0.15));
        const runs = ss(0.05, 0.3, fbm(u, v, 64, 3, 303)) * ss(0.03, 0.08, slope) * (1 - ss(0.3, 0.45, slope)) * ss(50, 140, h) * (1 - ss(500, 620, h));
        const mv = fbm(u, v, 108, 3, 304) * 0.5 + 0.5;
        bio[o] = Math.round(heath * 255); bio[o + 1] = Math.round(tone * 255); bio[o + 2] = Math.round(runs * 255);
        bio[o + 3] = Math.round(Math.min(1, Math.max(0, mv)) * 255);
      }
      if (((j - m.r0) & 7) === 7) postMessage({ type: 'p', v: (j - m.r0 + 1) / rows });
    }
    postMessage({ type: 'done', out, bio }, [out.buffer, bio.buffer]);
  }
  self.onmessage = e => {
    const m = e.data;
    if (m.cmd === 'height') doHeight(m);
    else if (m.cmd === 'derive') doDerive(m);
  };
}
const WORKER_SRC = "'use strict';(" + terrainWorker.toString() + ')();';
