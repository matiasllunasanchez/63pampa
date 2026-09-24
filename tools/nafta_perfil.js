// EL PERFIL DE UNA MISION TIPO, volado con la cuenta real de src/core/nafta.js
// (docs/sistemas/PLAN_NAFTA_ALCANCE.md §4). Lo usan dos: el reporte de `npm run feel`, que imprime
// la tabla para calibrar, y `npm run unit`, que afirma el trueque de la carga. Un solo perfil para
// los dos, asi el numero que se mira es el mismo que se prueba.
//
// Es un vuelo "de manual": alto hasta el horizonte de radar, descenso en diagonal, rasante, la
// corrida final, la suelta en el blanco, y la vuelta al reves. Las alturas son una por tramo, en el
// medio de su zona de gasto, porque lo que se mide es el REGIMEN, no el pilotaje.
import { tanqueInicial, gastar, gastoKm, kmQuedan, colgadoDe } from '../src/core/nafta.js';
import { FLY_TOP, RADAR_ALT, CH_ALT } from '../src/data/tuning.js';
import { speedTarget } from '../src/core/physics.js';
import { anclas, kmPorMetro, lineasRadar, zonasChancha, posKm } from '../src/core/ruta.js';
import { cargar, velRelativa, capacidadDe } from '../src/core/nafta.js';
import { CH_RATE, CH_ETA_ZONA } from '../src/data/tuning.js';

const ALTO = FLY_TOP, MEDIO = (RADAR_ALT + CH_ALT) / 2, RAS = 2;
const TURBO_R = 1.5;   // el turbo de siempre (physics.js: boost ×1.5), sin el after apilado

/** Vuela el perfil con la carga `id`. `turbo`: potencia maxima en los ultimos km antes del blanco.
 *  `sueltaTanques`: los externos se sueltan al llegar al horizonte de radar (con lo que les quede).
 *  Devuelve los km que quedan al llegar al blanco y al volver a casa; NEGATIVO = lo que falto. */
export function perfilMision(id, { blancoKm = 700, radarKm = 180, niveladoKm = 120, potenciaKm = 50,
  turbo = false, sueltaTanques = false } = {}) {
  let t = tanqueInicial(id), falta = 0;
  const colgado = colgadoDe(id);
  const tramo = (km, y, r = 1) => {
    const g = gastoKm(km, y, colgado, r);
    falta += Math.max(0, g - kmQuedan(t));
    t = gastar(t, g);
  };
  const saldo = () => kmQuedan(t) - falta;
  // LA IDA
  tramo(blancoKm - radarKm, ALTO);
  if (sueltaTanques) { t = { tanques: [], interno: t.interno }; colgado.tanques = 0; }
  tramo(radarKm - niveladoKm, MEDIO);
  tramo(niveladoKm - potenciaKm, RAS);
  tramo(potenciaKm, RAS, turbo ? TURBO_R : 1);
  const llega = saldo();
  // EL BLANCO: se van las bombas (los tanques, si siguen, se quedan)
  colgado.bombas = 0;
  // LA VUELTA
  tramo(niveladoKm, RAS);
  tramo(radarKm - niveladoKm, MEDIO);
  tramo(blancoKm - radarKm, ALTO);
  return { llega, vuelve: saldo() };
}

// ---------- LA MISION DE VERDAD: t15 volada a la velocidad del juego (PLAN_NAFTA_ALCANCE N8) ----------
// El perfil de arriba es la cuenta de manual en km. Este vuela UNA MISION CON RUTA con las formulas
// del juego: la velocidad de `speedTarget` (con la racha al ras y lo que acelera soltar), los km que
// vale cada metro segun la ruta, las zonas de gasto por altura y la cita con la Chancha en su zona
// (asoma a CH_ETA_ZONA y llena a CH_RATE % de la capacidad por segundo). El piloto es "de manual":
// alto fuera del radar, a media altura en el descenso, al ras adentro. Es la vara de calibracion.

/** Vuela la mision `m` (con `ruta` y `fases`) con la carga `id`. Opciones: `chIda` / `chVuelta`
 *  (se carga en esa zona), `turboFinal` (turbo en la fase blanco). Devuelve `{ llega, casa, seco,
 *  seg, enZona }`: km al buque y en casa, el km de ruta donde se seco (o null), los segundos por
 *  tipo de fase y los segundos que el avion pasa dentro de cada zona de la Chancha. */
export function vueloRuta(m, id, { chIda = false, chVuelta = false, turboFinal = false } = {}) {
  const obj = m.goal.dist || m.goal.meters, a = anclas(m.ruta, m.fases), L = lineasRadar(m.ruta, a), Z = zonasChancha(m.ruta, a);
  const fin = m.fases[m.fases.length - 1].hasta;
  const tipoEn = p => (m.fases.find(f => p < f.hasta) || m.fases[m.fases.length - 1]).tipo;
  const dt = 1 / 30;
  let t = 0, d = 0, tq = tanqueInicial(id), col = colgadoDe(id), llega = null, seco = null, cita = null;
  const seg = {}, enZona = { ida: 0, vuelta: 0 }, quiere = { ida: chIda, vuelta: chVuelta };
  while (d < fin * obj) {
    const p = d / obj, tipo = tipoEn(p);
    const dentro = p >= L.entra && (L.sale === null || p < L.sale);
    const y = tipo === 'descenso' ? 30 : dentro ? 3 : 60;
    const ras = y <= 4.5 ? 4 : 0, turbo = turboFinal && tipo === 'blanco';
    const q = { t, rasLevel: ras, mult: ras ? 10 : 1, windF: 1, afterTier: 0 };
    const v0 = speedTarget({ ...q, boost: false }) * velRelativa(col);
    const v = turbo ? speedTarget({ ...q, boost: true }) * velRelativa(col) : v0;
    tq = gastar(tq, gastoKm(v * dt * kmPorMetro(p, a, obj), y, col, v / v0));
    let zk = null;
    for (const k of ['ida', 'vuelta']) if (Z[k] && p >= Z[k][0] && p <= Z[k][1]) { enZona[k] += dt; zk = k; }
    if (!cita && zk && quiere[zk]) { cita = { k: zk, t: -CH_ETA_ZONA }; quiere[zk] = false; }
    if (cita) {
      cita.t += dt;
      if (cita.t > 0) tq = cargar(tq, CH_RATE / 100 * capacidadDe(tq) * dt);
      if (kmQuedan(tq) >= capacidadDe(tq) - 0.5) cita = null;
    }
    seg[tipo] = (seg[tipo] || 0) + dt;
    if (llega === null && p + v * dt / obj >= 1) llega = kmQuedan(tq);
    if (p >= 1 && col.bombas) col = { ...col, bombas: 0 };
    if (seco === null && kmQuedan(tq) <= 0) seco = Math.round(posKm(p, a));
    d += v * dt; t += dt;
  }
  const r1 = o => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, Math.round(v * 10) / 10]));
  return { llega: Math.round(llega), casa: seco === null ? Math.round(kmQuedan(tq)) : 0, seco, seg: r1(seg), enZona: r1(enZona), t: Math.round(t) };
}
