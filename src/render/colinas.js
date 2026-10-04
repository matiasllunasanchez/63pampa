// LAS LOMADAS — la tierra de afuera del carril, que no es un plano (30/9/2026).
//
// "Me gustaria que los terrenos no sean completamente planos, que tengan variables, como las partes
// donde estan los acantilados… el terreno de Malvinas era irregular, no eran super montañas pero
// tampoco todo era plano." El raster del suelo pinta filas planas: una loma de la turba se lee por
// su sombra, pero nada sale nunca del piso. Estas SI salen: se dibujan como las islas y las laderas
// —por REBANADAS a lo largo de z, de lejos a cerca, cada una con el perfil de alturas de su
// profundidad (`colinaH`, core/tierra.js)— y la de adelante tapa la base de la de atras. Lo que queda
// asomando es la silueta de las lomadas contra el horizonte.
//
// SOLO AFUERA DEL CARRIL (desde COLINA_X0 = 50): adentro el suelo es el de siempre y volar a ras no
// cambia. Y SOLO DONDE HAY TIERRA: en una costa, del lado de tierra y lejos de la orilla; en el mar,
// nada; donde el zigzag ya puso un acantilado o hay una isla, tampoco — ahi el relieve ya es otro.
import { ctx, px, W, F } from './ctx.js';
import { cam } from '../core/state.js';
import { run } from '../core/run.js';
import { proj } from '../core/fx.js';
import { bendW, paredH } from '../core/zigzag.js';
import { colinaH } from '../core/tierra.js';
import { esTierraEn, rampaTierra, islaEn, sueloEn, orillaS, ladoEn } from '../core/geografia.js';
import { theme } from './theme.js';
import { caraLadera, tierraArriba, mez } from './paredes.js';
import * as veg from './vegetacion.js';
import { COLINA_X0, COLINA_Z, COLINA_ORILLA, COLINA_PLAYA } from '../data/tuning.js';

// LA GRILLA EN X ES FIJA EN EL MUNDO (y mas densa cerca del carril): la misma x en todas las
// rebanadas, asi la franja entre dos rebanadas es un pedazo de suelo de verdad y su pendiente se puede
// medir — que es lo que la hace VISIBLE. Pintada de un solo color, cada rebanada era del color del
// pasto y la lomada se camuflaba contra la tierra plana de atras (primera version, 30/9).
const N = 24, X_MAX = 2600;
const LUZ = new Float32Array(64), CARA = new Float32Array(64);
const RAYAS_LOMA = ['#c9b266', '#3a3024', '#6b3a2c', '#8f8a58'];   // pasto seco, turba, murtilla, pasto palido   // la luz por vertice (ver colinasHasta)
const AX = Array.from({ length: N }, (_, i) => COLINA_X0 * Math.pow(X_MAX / COLINA_X0, i / (N - 1)));
const NIEBLA_Z0 = 220, NIEBLA_MAX = 0.8;              // se funde con la lejania, sin borrarse del todo
const MATA_PASO = 7, MATA_Z = 130;

/** CUANTA LOMADA hay en este punto, de 0 a 1. En una COSTA es un fundido por la distancia a la
 *  orilla: nada pegado al agua, y subiendo de a poco tierra adentro (COLINA_ORILLA + COLINA_PLAYA).
 *  Ese borde ademas SERPENTEA a lo largo de z — con un si/no de "hay tierra" la lomada terminaba en
 *  una pared vertical contra el mar y se leia como un bloque (30/9). En el resto, tierra o no. */
const suave = u => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
function tierraAdentro(x, wz, costa) {
  if (costa) {
    const d = orillaS(wz) - ladoEn(wz) * x;          // metros tierra adentro desde la orilla
    // siempre >= 0: el borde se aleja de la orilla, nunca se mete en el agua
    const vaiven = COLINA_PLAYA * 0.6 * (0.75 + 0.45 * Math.sin(wz * 0.011 + x * 0.004) + 0.3 * Math.sin(wz * 0.031 - 1.7));
    return suave((d - COLINA_ORILLA - vaiven) / COLINA_PLAYA);
  }
  return esTierraEn(x, wz) ? 1 : 0;
}

// EL CUADRO SE PINTA POR TRAMOS DE PROFUNDIDAD (30/9). Las lomadas van despues del suelo, pero las
// ISLAS (render/islas.js) se dibujan mas tarde, despues del buque: una isla a un kilometro pintaba su
// silueta ENCIMA de la lomada que esta a cien metros — una raya del horizonte cruzando el cerro. Asi
// que el recorrido de rebanadas (de lejos a cerca, los dos costados juntos) se puede cortar: el
// suelo pinta lo que esta mas lejos que la isla mas lejana, y `drawIslas` sigue, isla por isla,
// pintando las lomadas que quedan entre una y otra antes de cada una. Las rebanadas son las mismas:
// cortar no cambia el dibujo, solo el orden.
const POR_LADO = [-1, 1].map(lado => ({
  lado, hay: false, zPrev: 0, izPrev: null,
  HS: new Float64Array(N), PX: new Float64Array(N), PY: new Float64Array(N),
  HP: new Float64Array(N), QX: new Float64Array(N), QY: new Float64Array(N),   // la rebanada anterior
}));
const cuadro = { activo: false, camZ: 0, pintadas: 0, T: null, L: null, lejos: '', ms: 0, n: 0, ultimas: 0 };

/** Arranca las lomadas del cuadro. Va despues del suelo (raster + matas) y antes de todo lo que se
 *  levanta; pinta hasta `zCorte` (lo que queda mas cerca lo pinta `colinasHasta`). */
export function drawColinas(zCorte) {
  const t0 = performance.now();
  cuadro.activo = false; cuadro.pintadas = 0;
  const dv = run.dist;
  // ¿hay tierra en algun lado de lo que se ve? Barato y primero: el mapa de mar no paga nada.
  if (!(sueloEn(dv + 60) === 'sea' && sueloEn(dv + 400) === 'sea' && sueloEn(dv + COLINA_Z) === 'sea')) {
    cuadro.activo = true; cuadro.camZ = COLINA_Z;
    cuadro.T = tierraArriba(); cuadro.L = caraLadera();
    cuadro.lejos = sueloEn(dv + COLINA_Z) === 'land' ? theme.land.far : theme.water.base0;
    for (const S of POR_LADO) { S.hay = false; S.zPrev = 0; S.izPrev = null; }
  }
  cuadro.ms += performance.now() - t0; cuadro.n++;
  colinasHasta(zCorte || 0);
}

/** Sigue pintando las lomadas del cuadro, de donde quedaron, hasta `zCorte` (camZ). */
export function colinasHasta(zCorte) {
  if (!cuadro.activo) return;
  const t0 = performance.now();
  const dv = run.dist, T = cuadro.T, L = cuadro.L, lejos = cuadro.lejos;
  let camZ = cuadro.camZ;
  for (; camZ >= 6 && camZ >= zCorte; camZ -= Math.max(2.5, camZ * 0.028)) {
    const wz = dv + camZ;
    const rampa = rampaTierra(wz);
    const isla = rampa > 0.01 && islaEn(wz);
    const costa = sueloEn(wz) === 'coast';
    for (const S of POR_LADO) {
      const lado = S.lado, HS = S.HS, PX = S.PX, PY = S.PY, HP = S.HP, QX = S.QX, QY = S.QY;
      if (rampa <= 0.01 || isla || paredH(wz, lado) > 0) { S.hay = false; continue; }
      let hMax = 0;
      for (let i = 0; i < N; i++) {
        const x = lado * AX[i];
        const t = tierraAdentro(x, wz, costa);
        HS[i] = t > 0 ? colinaH(x, wz) * rampa * t : 0;
        if (HS[i] > hMax) hMax = HS[i];
        const p = proj(x, HS[i], camZ);
        PX[i] = p.x; PY[i] = p.y;
      }
      if (S.hay && hMax > 0.05) {
        // LA NIEBLA de la distancia, por rebanada: se funde con la lejania sin borrarse del todo
        const niebla = Math.max(0, Math.min(1, (camZ - NIEBLA_Z0) / (COLINA_Z - NIEBLA_Z0))) * NIEBLA_MAX;
        const base = mez(T.cerca, T.lejos, (camZ - 110) / 160);   // fundido: un corte por distancia es una raya quieta en pantalla
        const dz = S.zPrev - camZ;
        // LA LUZ POR VERTICE, no por cara (el autor, 4/10: "no quiero que se vea cuadrado"): cada punto de
        // la grilla promedia la pendiente con sus vecinos, y cada cara toma el promedio de sus dos
        // esquinas — el tono FLUYE de una cara a la otra en vez de saltar en un damero. Y con menos
        // contraste que antes: la loma se lee por el volumen, no por el corte entre caras.
        for (let i = 0; i < N; i++) {
          const a = Math.max(0, i - 1), b = Math.min(N - 1, i + 1);
          const cara = (HP[i] - HS[i]) / dz;
          const lat = lado * (HS[b] - HS[a]) / (AX[b] - AX[a] || 1);
          LUZ[i] = cara * 1.25 + lat * 0.95;
          CARA[i] = cara;
        }
        for (let i = 0; i < N - 1; i++) {
          // fuera de cuadro (o todo al ras): nada que pintar
          if (Math.min(PX[i], PX[i + 1], QX[i], QX[i + 1]) > W + 40 || Math.max(PX[i], PX[i + 1], QX[i], QX[i + 1]) < -40) continue;
          if (HS[i] + HS[i + 1] + HP[i] + HP[i + 1] < 0.2) continue;
          // LA LUZ: la cara que SUBE alejandose te mira (se ilumina, y si es empinada se ve la tierra
          // de costado); la que baja queda en sombra. Y de costado, la ladera que mira al carril se
          // aclara y la de afuera se oscurece: el volumen se lee en los dos ejes.
          const cara = (CARA[i] + CARA[i + 1]) / 2;
          // (contraste de ladera, no de pasto: con los tonos del suelo la lomada se camuflaba)
          const luz = (LUZ[i] + LUZ[i + 1]) / 2;
          let col = luz > 0 ? mez(base, luz > 0.3 ? L.luz : T.corona, Math.min(0.6, 0.18 + luz * 1.1))
            : mez(base, L.som, Math.min(0.6, 0.15 - luz * 1.6));
          if (cara > 0.25) col = mez(col, L.cuerpo, Math.min(0.55, (cara - 0.25) * 1.4));   // la cara empinada: tierra
          ctx.fillStyle = mez(col, lejos, niebla);
          ctx.beginPath();
          ctx.moveTo(QX[i], QY[i]); ctx.lineTo(QX[i + 1], QY[i + 1]);
          ctx.lineTo(PX[i + 1], PY[i + 1] + 0.6); ctx.lineTo(PX[i], PY[i] + 0.6);
          ctx.closePath(); ctx.fill();
          // LAS RAYAS de la loma (el autor, 4/10): vetas de pasto seco, turba y murtilla que corren
          // LOMA ARRIBA, alejandose — cada columna de la grilla puede llevar una, que ondula de lado a
          // lado de la cara y se afina en las puntas. Fijas en el mundo: no titilan.
          if (camZ < 220) {
            const largo = 22 + (i % 3) * 7, tramo = Math.floor((wz + i * 13) / largo), u = (wz + i * 13) / largo - tramo;
            const hr = hash2(tramo * 3 + (lado > 0 ? 1 : 0), i * 41);
            if (hr > 0.5) {
              const c0 = 0.5 + 0.38 * Math.sin(wz * 0.05 + i * 1.3 + hr * 5);
              const an = (0.10 + hr * 0.14) * Math.sin(Math.PI * u);
              const a0 = Math.max(0, c0 - an), a1 = Math.min(1, c0 + an);
              const lx = (x0, x1, t) => x0 + (x1 - x0) * t;
              ctx.globalAlpha = 0.22 * Math.sin(Math.PI * u) * (1 - niebla);
              ctx.fillStyle = RAYAS_LOMA[(hash2(tramo, i * 7 + 3) * RAYAS_LOMA.length) | 0];
              ctx.beginPath();
              ctx.moveTo(lx(QX[i], QX[i + 1], a0), lx(QY[i], QY[i + 1], a0));
              ctx.lineTo(lx(QX[i], QX[i + 1], a1), lx(QY[i], QY[i + 1], a1));
              ctx.lineTo(lx(PX[i], PX[i + 1], a1), lx(PY[i], PY[i + 1], a1) + 0.6);
              ctx.lineTo(lx(PX[i], PX[i + 1], a0), lx(PY[i], PY[i + 1], a0) + 0.6);
              ctx.closePath(); ctx.fill();
              ctx.globalAlpha = 1;
            }
          }
          // EL GRANO, como el del mar: un par de motas por cara, apenas mas claras u oscuras, fijas
          // en el MUNDO (hash de la celda) — no titilan y le sacan al plano liso su cara de poligono
          if (camZ < 160) {
            const g1 = hash2(i * 31 + (lado > 0 ? 7 : 0), Math.floor(wz * 0.7));
            if (g1 > 0.45) {
              const u = hash2(i * 17, Math.floor(wz * 0.7) + 3);
              const gx = QX[i] + (QX[i + 1] - QX[i]) * u, gy = (QY[i] + PY[i]) / 2;
              ctx.globalAlpha = 0.18;
              px(gx, gy, Math.max(1, 90 / camZ), 1, g1 > 0.75 ? '#f4eede' : '#0a0c08');
              ctx.globalAlpha = 1;
            }
          }
        }
        cuadro.pintadas++;
        // LAS MATAS de cerca, cuando la rebanada cruza una fila de la grilla de mundo
        const iz = Math.floor(wz / MATA_PASO);
        if (camZ < MATA_Z && iz !== S.izPrev) matas(lado, iz, camZ, rampa, T, costa);
        S.izPrev = iz;
      }
      for (let i = 0; i < N; i++) { HP[i] = HS[i]; QX[i] = PX[i]; QY[i] = PY[i]; }
      S.hay = true; S.zPrev = camZ;
    }
  }
  cuadro.camZ = camZ;
  if (camZ < 6) { cuadro.activo = false; cuadro.ultimas = cuadro.pintadas; }
  cuadro.ms += performance.now() - t0;
}

// ---------- SONDA: lo que cuestan (son miles de preguntas al terreno por cuadro) ----------
if (typeof window !== 'undefined') window.__colinas = () => {
  const r = { msPorCuadro: +(cuadro.ms / Math.max(1, cuadro.n)).toFixed(3), cuadros: cuadro.n, rebanadas: cuadro.ultimas };
  cuadro.ms = 0; cuadro.n = 0;
  return JSON.stringify(r);
};

/** Una fila de matas sobre las lomadas de un costado. Deterministas por celda: no titilan. */
function matas(lado, iz, camZ, rampa, T, costa) {
  const k = F / camZ, wz = iz * MATA_PASO;
  const borde = Math.abs(cam.x - bendW(camZ)) + (W / 2 + 20) / k;
  for (let ia = Math.ceil(COLINA_X0 / MATA_PASO); ia * MATA_PASO <= borde; ia++) {
    const h1 = hash2(ia * lado, iz);
    if (h1 < 0.6) continue;
    const h2 = hash2(ia * lado + 911, iz - 307);
    const x = lado * (ia * MATA_PASO + (h2 - 0.5) * MATA_PASO);
    const t = tierraAdentro(x, wz, costa);
    if (t <= 0) continue;
    const gy = colinaH(x, wz) * rampa * t;
    if (gy < 0.6) continue;
    const s = proj(x, gy, camZ);
    // la MATA HORNEADA (render/vegetacion.js); los rectangulos de siempre si la hoja no esta
    if (veg.mata(s.x, s.y, k * 2.3, h2, T.mata)) continue;
    const w = Math.max(1, k * 0.8), hh = Math.max(1, k * (0.6 + h2 * 0.8));
    px(s.x - w / 2, s.y - hh, w, hh, T.corona);
    px(s.x - w / 2, s.y - hh, w, Math.max(1, hh * 0.45), T.mata);
  }
}

/** hash entero → [0,1). Copia local, como en render/paredes.js e islas.js. */
function hash2(a, b) {
  let h = Math.imul(a | 0, 374761393) ^ Math.imul(b | 0, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
