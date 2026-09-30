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
import { tanqueInicial, capacidadKm, capacidadDe, kmQuedan, gastar, cargar, gastoKm, zonaGasto, fAltura, soltar, proximoPilon, velRelativa } from '../core/nafta.js';
import { RAS_GASTO_F } from '../data/tuning.js';

/** Llena el tanque para la carga `id` al empezar la corrida (o lo apaga con `id` null). Lo llama
 *  `setRunObjective()`, donde ya se sabe si la mision tiene ruta y con que carga despega. */
// DESDE EL 30/9 EL TANQUE EXISTE EN TODAS LAS MISIONES ("aplicalo tambien en las misiones sin ruta"):
// lo que cuelga pesa y se suelta en cualquiera. Lo que sigue siendo SOLO DE LA RUTA es la cuenta en
// km (gasto por km, zonas de altura, bingo, el reloj en km): eso pregunta `activo()`. Sin ruta el %
// por segundo de siempre manda, y `sincronizar()` lo traslada al tanque — por eso los externos se
// vacian primero y aliviana quemarlos, igual que con ruta.

/** Llena el tanque para la carga `id` (o lo apaga con `id` null). `km`: la cuenta en km (con ruta). */
export function preparar(id, km = true) {
  if (!id) { run.tanque = null; run.naftaCap = run.naftaCap0 = 0; run.naftaKm = false; return; }
  run.tanque = tanqueInicial(id);
  run.naftaCap = run.naftaCap0 = capacidadKm(id);
  run.naftaKm = !!km;
  run.fuel = 100; run.fuelSync = 100;
}

/** La cuenta de la nafta es en KM (la mision tiene ruta). */
export const activo = () => !!run.tanque && run.naftaKm;
/** Hay tanque con pilones (cualquier mision con carga): pesa y se puede soltar. */
export const hayTanque = () => !!run.tanque;

/** Lo que OTROS le hicieron al % desde el cuadro anterior (la Chancha, piruetas, golpes, y sin ruta
 *  el gasto por segundo), llevado a km del tanque; despues el % se reescribe desde el tanque. */
export function sincronizar() {
  if (!run.tanque) return;
  const d = run.fuel - run.fuelSync;
  if (d > 1e-9) run.tanque = cargar(run.tanque, d / 100 * run.naftaCap);
  else if (d < -1e-9) run.tanque = gastar(run.tanque, -d / 100 * run.naftaCap);
  reflejar();
}
function reflejar() {
  run.fuel = run.naftaCap > 0 ? Math.max(0, Math.min(100, kmQuedan(run.tanque) / run.naftaCap * 100)) : 0;
  run.fuelSync = run.fuel;
}

/** SIN RUTA, cuanto se estira el gasto en % por segundo: el % se mide contra la capacidad de AHORA,
 *  y despues de soltar un tanque es mas chica. Sin esto soltar vacios subiria el reloj y lo haria
 *  bajar igual de lento — nafta gratis. Asi se quema lo mismo en litros. */
export const escalaGasto = () => (run.tanque && run.naftaCap > 0 ? run.naftaCap0 / run.naftaCap : 1);

/** Los km de crucero que quedan en el tanque. */
export const kmRestan = () => (run.tanque ? kmQuedan(run.tanque) : 0);

/** UN CUADRO. `km` recorridos (reales), a la altura `y`, con `colgado` puesto, el turbo a `r`, y
 *  `ras` si venis sosteniendo el rasante (que te cobra el vuelo normal, ver RAS_GASTO_F).
 *  Devuelve 'seco' el cuadro en que el tanque llega a cero — quien decide que pasa es game.js. */
export function step(km, y, colgado, r, ras) {
  if (!run.tanque) return null;
  sincronizar();
  run.tanque = gastar(run.tanque, gastoKm(km, y, colgado, r, ras));
  reflejar();
  return kmQuedan(run.tanque) <= 0 ? 'seco' : null;
}

/** La zona de gasto en la que vuela el avion ahora (para el HUD). */
/** La zona que se muestra. Con el rasante sostenido y abajo —donde de verdad se ahorra— dice
 *  'rasante': el rotulo AHORRO RASANTE es lo que le enseña al jugador que el estado tambien paga en
 *  nafta. Arriba, donde ya se vuela a tarifa base, sigue diciendo su zona: no hay ahorro que contar. */
export const zona = (y, ras) => (ras && fAltura(y) > RAS_GASTO_F ? 'rasante' : zonaGasto(y).id);

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
  reflejar();
  return { pilon, soltados: r.soltados };
}

/** ¿Le queda algo para soltar? (el HUD y la tecla lo preguntan) */
export const quedaParaSoltar = () => !!run.tanque && !!proximoPilon(run.tanque);

/** CUANTO MAS RAPIDO VA SEGUN LO QUE CUELGA (PLAN_NAFTA_ALCANCE §3.7 y el peso del 30/9). La cuenta
 *  es `velRelativa` (core/nafta.js). Con tanque —cualquier mision con carga—; sin el, 1. */
export const velCarga = colgado => (run.tanque ? velRelativa(colgado) : 1);   // (con o sin ruta, desde el 30/9)

/** LO QUE CUELGA AHORA, con lo que sabe el tanque: cuantos externos siguen y cuanta nafta les queda
 *  (el peso, ver velRelativa). `bombas` y `bombaKg` los pone quien sabe de bombas (el vuelo). null
 *  sin ruta. */
export const colgadoAhora = (bombas, bombaKg) => (run.tanque
  ? { bombas, bombaKg, tanques: run.tanque.tanques.length, nafta: run.tanque.tanques.reduce((s, k) => s + k, 0) }
  : null);
