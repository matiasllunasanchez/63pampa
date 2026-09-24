// LA NAFTA COMO ALCANCE — el tanque de la corrida (docs/sistemas/PLAN_NAFTA_ALCANCE.md, fase N3).
//
// La CUENTA vive en core/nafta.js (pura, la prueba `npm run unit`). Aca vive el tanque de la
// corrida en curso, y solo existe en las misiones que declaran `ruta:` — sin ruta, `activo()` da
// falso y la nafta sigue siendo el % por segundo de siempre (systems/flight.js).
//
// EL TANQUE EN KM ES LA VERDAD; `run.fuel` (0-100) ES SU REFLEJO, y la razon es que media docena de
// cosas ya leen y escriben `run.fuel`: la Chancha carga, las piruetas y los golpes descuentan, el
// HUD y los gates lo leen. En vez de enseñarle km a cada una, cada cuadro se mira si alguien movio
// el % desde la ultima vez (`run.fuelSync`) y ese movimiento se traslada al tanque: lo que subio se
// carga, lo que bajo se gasta. Despues se cobra el vuelo y se reescribe el %. Nadie mas se entera.
//
// El estado va en el STORE de la corrida (`run.tanque`, `run.naftaCap`) y no suelto aca porque lo
// leen varios: el HUD (alcance, bingo), la suelta de tanques (N5) y las sondas.
import { run } from '../core/run.js';
import { tanqueInicial, capacidadKm, capacidadDe, kmQuedan, gastar, cargar, gastoKm, zonaGasto, soltar, proximoPilon, fCarga, colgadoDe } from '../core/nafta.js';
import { CARGA_BASE } from '../data/cargas.js';
import { VEL_ARRASTRE_EXP } from '../data/tuning.js';

/** Llena el tanque para la carga `id` al empezar la corrida (o lo apaga con `id` null). Lo llama
 *  `setRunObjective()`, donde ya se sabe si la mision tiene ruta y con que carga despega. */
export function preparar(id) {
  if (!id) { run.tanque = null; run.naftaCap = 0; return; }
  run.tanque = tanqueInicial(id);
  run.naftaCap = capacidadKm(id);
  run.fuel = 100; run.fuelSync = 100;
}

export const activo = () => !!run.tanque;

/** Los km de crucero que quedan en el tanque. */
export const kmRestan = () => (run.tanque ? kmQuedan(run.tanque) : 0);

/** UN CUADRO. `km` recorridos (reales), a la altura `y`, con `colgado` puesto y el turbo a `r`.
 *  Devuelve 'seco' el cuadro en que el tanque llega a cero — quien decide que pasa es game.js. */
export function step(km, y, colgado, r) {
  if (!run.tanque) return null;
  // lo que OTROS le hicieron al % desde el cuadro anterior (Chancha, piruetas, golpes), a km
  const d = run.fuel - run.fuelSync;
  if (d > 1e-9) run.tanque = cargar(run.tanque, d / 100 * run.naftaCap);
  else if (d < -1e-9) run.tanque = gastar(run.tanque, -d / 100 * run.naftaCap);
  run.tanque = gastar(run.tanque, gastoKm(km, y, colgado, r));
  const quedan = kmQuedan(run.tanque);
  run.fuel = run.naftaCap > 0 ? Math.max(0, Math.min(100, quedan / run.naftaCap * 100)) : 0;
  run.fuelSync = run.fuel;
  return quedan <= 0 ? 'seco' : null;
}

/** La zona de gasto en la que vuela el avion ahora (para el HUD). */
export const zona = y => zonaGasto(y).id;

// ---------- SOLTAR LOS TANQUES (PLAN_NAFTA_ALCANCE §3.7, N5) ----------

/** Suelta el proximo grupo de externos: el PAR de ala si sigue colgado, si no el del centro.
 *  Devuelve `{ pilon, soltados }` (los km que se fueron en cada tanque) o null si no queda nada que
 *  soltar. La capacidad baja con ellos y el % se recalcula contra la nueva: el reloj de nafta no
 *  salta a "mas lleno" por magia — lo que queda es lo que queda. */
export function soltarTanques() {
  if (!run.tanque) return null;
  const pilon = proximoPilon(run.tanque);
  if (!pilon) return null;
  const r = soltar(run.tanque, pilon);
  run.tanque = r.tanque;
  run.naftaCap = capacidadDe(run.tanque);
  run.fuel = run.naftaCap > 0 ? Math.max(0, Math.min(100, kmQuedan(run.tanque) / run.naftaCap * 100)) : 0;
  run.fuelSync = run.fuel;
  return { pilon, soltados: r.soltados };
}

/** ¿Le queda algo para soltar? (el HUD y la tecla lo preguntan) */
export const quedaParaSoltar = () => !!run.tanque && !!proximoPilon(run.tanque);

/** CUANTO MAS RAPIDO VA SEGUN LO QUE CUELGA (PLAN_NAFTA_ALCANCE §3.7: "sin bombas, el avion va mas
 *  rapido", y ahora tambien sin tanques). Relativo a la carga BASE (2 tanques + bomba = x1): con
 *  menos arrastre, mas velocidad — (base / actual) ^ VEL_ARRASTRE_EXP. Solo con ruta; sin ella 1, y
 *  el vuelo de siempre no cambia ni un decimal. */
const ARRASTRE_BASE = fCarga(colgadoDe(CARGA_BASE));
export const velCarga = colgado => (run.tanque ? (ARRASTRE_BASE / fCarga(colgado)) ** VEL_ARRASTRE_EXP : 1);
