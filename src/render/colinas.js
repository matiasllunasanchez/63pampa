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
import { COLINA_X0, COLINA_Z, COLINA_ORILLA, COLINA_PLAYA } from '../data/tuning.js';

// LA GRILLA EN X ES FIJA EN EL MUNDO (y mas densa cerca del carril): la misma x en todas las
// rebanadas, asi la franja entre dos rebanadas es un pedazo de suelo de verdad y su pendiente se puede
// medir — que es lo que la hace VISIBLE. Pintada de un solo color, cada rebanada era del color del
// pasto y la lomada se camuflaba contra la tierra plana de atras (primera version, 30/9).
const N = 24, X_MAX = 2600;
const AX = Array.from({ length: N }, (_, i) => COLINA_X0 * Math.pow(X_MAX / COLINA_X0, i / (N - 1)));
const HS = new Float64Array(N), PX = new Float64Array(N), PY = new Float64Array(N);
const HP = new Float64Array(N), QX = new Float64Array(N), QY = new Float64Array(N);   // la rebanada anterior
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

/** Las lomadas del cuadro. Va despues del suelo (raster + matas) y antes de todo lo que se levanta. */
export function drawColinas() {
  let pintadas = 0;
  const dv = run.dist;
  // ¿hay tierra en algun lado de lo que se ve? Barato y primero: el mapa de mar no paga nada.
  if (sueloEn(dv + 60) === 'sea' && sueloEn(dv + 400) === 'sea' && sueloEn(dv + COLINA_Z) === 'sea') return 0;
  const T = tierraArriba(), L = caraLadera();
  const lejos = sueloEn(dv + COLINA_Z) === 'land' ? theme.land.far : theme.water.base0;
  for (const lado of [-1, 1]) {
    let hay = false, zPrev = 0, izPrev = null;
    for (let camZ = COLINA_Z; camZ >= 6; camZ -= Math.max(2.5, camZ * 0.028)) {
      const wz = dv + camZ;
      const rampa = rampaTierra(wz);
      if (rampa <= 0.01 || islaEn(wz) || paredH(wz, lado) > 0) { hay = false; continue; }
      let hMax = 0;
      const costa = sueloEn(wz) === 'coast';
      for (let i = 0; i < N; i++) {
        const x = lado * AX[i];
        const t = tierraAdentro(x, wz, costa);
        HS[i] = t > 0 ? colinaH(x, wz) * rampa * t : 0;
        if (HS[i] > hMax) hMax = HS[i];
        const p = proj(x, HS[i], camZ);
        PX[i] = p.x; PY[i] = p.y;
      }
      if (hay && hMax > 0.05) {
        // LA NIEBLA de la distancia, por rebanada: se funde con la lejania sin borrarse del todo
        const niebla = Math.max(0, Math.min(1, (camZ - NIEBLA_Z0) / (COLINA_Z - NIEBLA_Z0))) * NIEBLA_MAX;
        const base = camZ < 180 ? T.cerca : T.lejos;
        const dz = zPrev - camZ;
        for (let i = 0; i < N - 1; i++) {
          // fuera de cuadro (o todo al ras): nada que pintar
          if (Math.min(PX[i], PX[i + 1], QX[i], QX[i + 1]) > W + 40 || Math.max(PX[i], PX[i + 1], QX[i], QX[i + 1]) < -40) continue;
          if (HS[i] + HS[i + 1] + HP[i] + HP[i + 1] < 0.2) continue;
          // LA LUZ: la cara que SUBE alejandose te mira (se ilumina, y si es empinada se ve la tierra
          // de costado); la que baja queda en sombra. Y de costado, la ladera que mira al carril se
          // aclara y la de afuera se oscurece: el volumen se lee en los dos ejes.
          const cara = ((HP[i] + HP[i + 1]) - (HS[i] + HS[i + 1])) / (2 * dz);
          const lat = lado * (HS[i + 1] - HS[i]) / (AX[i + 1] - AX[i]);
          // (contraste de ladera, no de pasto: con los tonos del suelo la lomada se camuflaba)
          const luz = cara * 1.8 + lat * 1.4;
          let col = luz > 0 ? mez(base, luz > 0.3 ? L.luz : T.corona, Math.min(0.8, 0.25 + luz * 1.4))
            : mez(base, L.som, Math.min(0.8, 0.2 - luz * 2));
          if (cara > 0.25) col = mez(col, L.cuerpo, Math.min(0.7, (cara - 0.25) * 1.8));   // la cara empinada: tierra
          ctx.fillStyle = mez(col, lejos, niebla);
          ctx.beginPath();
          ctx.moveTo(QX[i], QY[i]); ctx.lineTo(QX[i + 1], QY[i + 1]);
          ctx.lineTo(PX[i + 1], PY[i + 1] + 0.6); ctx.lineTo(PX[i], PY[i] + 0.6);
          ctx.closePath(); ctx.fill();
        }
        pintadas++;
        // LAS MATAS de cerca, cuando la rebanada cruza una fila de la grilla de mundo
        const iz = Math.floor(wz / MATA_PASO);
        if (camZ < MATA_Z && iz !== izPrev) matas(lado, iz, camZ, rampa, T);
        izPrev = iz;
      }
      for (let i = 0; i < N; i++) { HP[i] = HS[i]; QX[i] = PX[i]; QY[i] = PY[i]; }
      hay = true; zPrev = camZ;
    }
  }
  return pintadas;
}

/** Una fila de matas sobre las lomadas de un costado. Deterministas por celda: no titilan. */
function matas(lado, iz, camZ, rampa, T) {
  const k = F / camZ, wz = iz * MATA_PASO;
  const borde = Math.abs(cam.x - bendW(camZ)) + (W / 2 + 20) / k;
  for (let ia = Math.ceil(COLINA_X0 / MATA_PASO); ia * MATA_PASO <= borde; ia++) {
    const h1 = hash2(ia * lado, iz);
    if (h1 < 0.6) continue;
    const h2 = hash2(ia * lado + 911, iz - 307);
    const x = lado * (ia * MATA_PASO + (h2 - 0.5) * MATA_PASO);
    const t = tierraAdentro(x, wz, sueloEn(wz) === 'coast');
    if (t <= 0) continue;
    const gy = colinaH(x, wz) * rampa * t;
    if (gy < 0.6) continue;
    const s = proj(x, gy, camZ);
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
