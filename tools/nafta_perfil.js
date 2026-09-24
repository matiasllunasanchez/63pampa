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
