// LA NAFTA COMO ALCANCE — la cuenta (docs/sistemas/PLAN_NAFTA_ALCANCE.md, fase N0).
//
// QUE ES: el tanque medido en KM DE CRUCERO ALTO y el gasto cobrado por KM RECORRIDO, con tres
// factores que el jugador decide volando:
//
//     km gastados = km recorridos × fAltura(y) × fCarga(colgado) × fVelocidad(r)
//
//   fAltura     la zona de gasto en la que esta el avion: MAYOR abajo, MEDIO, MENOR arriba
//   fCarga      el arrastre de lo que cuelga de los pilones (soltar algo lo baja en el acto)
//   fVelocidad  el TURBO: (v / vSinTurbo)². Cuesta en proporcion a lo que acelera
//
// POR KM Y NO POR SEGUNDO, y es el corazon del plan: el alcance real del A-4 es una distancia, y
// asi el turbo paga solo — ir mas rapido recorre mas km por segundo Y cada km sale mas caro.
//
// ESTE ARCHIVO ES PURO: sin DOM, sin stores, sin cfg. Recibe numeros y devuelve numeros; el estado
// del tanque es un objeto chico que se pasa y se devuelve NUEVO (nunca se muta el que llega). Por
// eso lo importa `npm run unit` y el reporte de `npm run feel`, y por eso el dia que el vuelo lo
// use (N3) lo va a llamar con los mismos numeros que las pruebas.
import {
  TANQUE_INTERNO_KM, TANQUE_EXTRA_KM, TANQUE_LLENO_FRAC, ZONAS_GASTO,
  ARRASTRE_LIMPIO, ARRASTRE_BOMBA, ARRASTRE_TANQUE,
} from '../data/tuning.js';
import { tanquesDe, bombasDe } from '../data/cargas.js';

// ---------- EL TANQUE ----------

/** Cuantos km de crucero alto entran con la carga `id`: el interno mas lo de cada tanque. */
export const capacidadKm = id => TANQUE_INTERNO_KM + tanquesDe(id) * TANQUE_EXTRA_KM;

/** El tanque lleno para la carga `id`. `tanques` es la lista de los EXTERNOS que cuelgan (km que le
 *  quedan a cada uno); `interno` el del fuselaje. Por separado porque cada tanque se suelta solo y
 *  pega segun lo que tenga adentro (PLAN §3.7). */
export function tanqueInicial(id) {
  return { tanques: Array.from({ length: tanquesDe(id) }, () => TANQUE_EXTRA_KM), interno: TANQUE_INTERNO_KM };
}

/** Todo lo que queda, externos mas interno, en km de crucero. */
export const kmQuedan = t => t.tanques.reduce((s, k) => s + k, 0) + t.interno;

/** Gasta `km` del tanque y devuelve el tanque NUEVO.
 *
 *  PRIMERO LOS EXTERNOS, como volaban: se quemaba lo de afuera y despues se soltaba el tanque
 *  vacio. Y los externos se vacian PAREJOS entre si — los dos de ala chupan juntos — porque si uno
 *  se secara antes el avion quedaria desbalanceado, y porque asi "lleno" y "vacio" se leen igual
 *  en los dos al momento de soltar. El interno toca recien cuando no queda nada afuera.
 *  Nunca baja de cero: lo que no alcanza, no se gasta (quedarse seco lo decide quien llama). */
export function gastar(t, km) {
  const tanques = t.tanques.slice();
  let resta = Math.max(0, km);
  // de a rondas: se reparte entre los que tienen, y el que se seca pasa su parte a los demas
  while (resta > 1e-9) {
    const vivos = tanques.map((k, i) => (k > 0 ? i : -1)).filter(i => i >= 0);
    if (!vivos.length) break;
    const parte = resta / vivos.length;
    for (const i of vivos) {
      const saca = Math.min(tanques[i], parte);
      tanques[i] -= saca; resta -= saca;
    }
  }
  return { tanques, interno: Math.max(0, t.interno - resta) };
}

/** Si un tanque externo con `km` adentro cuenta como LLENO al soltarlo (pega grave y explota) o
 *  como VACIO (pega medio). */
export const tanqueLleno = km => km >= TANQUE_EXTRA_KM * TANQUE_LLENO_FRAC;

// ---------- LOS TRES FACTORES ----------

/** La zona de gasto a la altura de mundo `y`: { id: 'menor'|'medio'|'mayor', desde, f }. */
export const zonaGasto = y => ZONAS_GASTO.find(z => y >= z.desde);

/** El factor de la altura: escalonado, no una curva (el altimetro dice la zona con una palabra). */
export const fAltura = y => zonaGasto(y).f;

/** El arrastre de lo que cuelga. `colgado` = { bombas, tanques } que SIGUEN colgados: la carga
 *  elegida al despegar menos lo que ya se solto. */
export const fCarga = ({ bombas = 0, tanques = 0 } = {}) =>
  ARRASTRE_LIMPIO + bombas * ARRASTRE_BOMBA + tanques * ARRASTRE_TANQUE;

/** Lo que cuelga de la carga `id` recien despegado. */
export const colgadoDe = id => ({ bombas: bombasDe(id), tanques: tanquesDe(id) });

/** El TURBO, por km. `r` = velocidad con turbo / velocidad sin turbo (1 sin turbo, 1.5 con el de
 *  siempre, mas con el `after` apilado). La resistencia crece con el cuadrado de la velocidad.
 *  Por debajo de 1 no abarata: frenar no es un turbo al reves, y la velocidad natural (la que sube
 *  sola con la racha) no se cobra — quien llama pasa `r` solo con lo que el turbo suma. */
export const fVelocidad = r => Math.max(1, r) ** 2;

/** LOS KM QUE CUESTA recorrer `km` a la altura `y`, con `colgado` puesto y el turbo a `r`. */
export const gastoKm = (km, y, colgado, r = 1) => km * fAltura(y) * fCarga(colgado) * fVelocidad(r);

/** EL TURBO EN LAS MISIONES SIN `ruta`, que siguen gastando % por SEGUNDO (PLAN §6.6: el turbo
 *  proporcional va en todas). Por segundo el turbo cuesta r³ y no r²: cada km sale r² mas caro y
 *  ademas se recorren r veces mas km por segundo. Devuelve el EXTRA por encima de `base` (el
 *  consumo sin turbo, ya con su multiplicador de fase), para sumarlo como se sumaba FUEL_BOOST. */
export const extraTurboPorSeg = (base, r) => base * (Math.max(1, r) ** 3 - 1);

// ---------- EL BINGO ----------

/** Cuanto hace falta para volver `kmACasa` volando en la zona de gasto menor, sin turbo, con lo que
 *  sigue colgado. Es la linea del HUD (PLAN §3.8): cuando `kmQuedan` la cruza, se decide. Es el
 *  piso optimista a proposito — si ni volando perfecto alcanza, el aviso tiene que llegar YA. */
export const bingoKm = (kmACasa, colgado) => gastoKm(kmACasa, Infinity, colgado);
