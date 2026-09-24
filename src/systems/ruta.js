// LA RUTA — el estado de la corrida (docs/sistemas/PLAN_NAFTA_ALCANCE.md §3.3, fase N1).
//
// La MATEMATICA vive en core/ruta.js, que es puro y lo prueba `npm run unit`. Aca vive lo que tiene
// estado: la ruta de la mision en curso, ya anclada a sus fases y a su objetivo. Misma division que
// core/fases.js ↔ systems/fases.js, y se arma en el mismo lugar (`setRunObjective`) por el mismo
// motivo: las fracciones no significan nada sin su objetivo.
//
// UNA MISION SIN `ruta` ES TODAS LAS DE HOY: `hay()` da falso, nadie lee nada, y el juego es el de
// siempre hasta el ultimo decimal.
import { anclas, validarRuta, posKm, kmPorMetro, lineasRadar, techoAlcance, zonasChancha } from '../core/ruta.js';
import { run } from '../core/run.js';
import { FLY_TOP, RUTA_RADAR_RAMPA_M } from '../data/tuning.js';

let ruta = null;      // el dato de la mision (null = sin ruta)
let marcas = null;    // sus anclas contra las fases
let objetivo = 0;
let lineas = null;     // el horizonte de radar en fracciones: { entra, sale }
let zonas = null;      // las zonas de la Chancha en fracciones: { ida, vuelta }

/** Le pasa a la corrida la ruta de la mision. Una ruta invalida NO se usa (y se avisa por consola):
 *  mejor el juego de siempre que km inventados. El unit test la ataja antes de llegar aca. */
export function setRuta(r, fases, obj) {
  ruta = null; marcas = null; lineas = null; zonas = null; objetivo = obj > 0 ? obj : 0;
  if (!r || !objetivo) return null;
  const e = validarRuta(r, fases);
  if (e.length) { console.warn('[ruta] invalida, se ignora: ' + e.join(' · ')); return null; }
  ruta = r; marcas = anclas(r, fases); lineas = lineasRadar(r, marcas); zonas = zonasChancha(r, marcas);
  return ruta;
}

export const hay = () => !!ruta;
export const dato = () => ruta;

/** Km recorridos desde la base, ahora. */
export const pos = () => (ruta ? posKm(Math.max(0, run.dist) / objetivo, marcas) : 0);

/** Cuanto falta al blanco (la ida; 0 pasado el buque). */
export const alBlanco = () => (ruta ? Math.max(0, ruta.blancoKm - pos()) : 0);

/** Cuanto falta para casa en la vuelta (desde el blanco hasta la base: la misma distancia). */
export const aCasa = () => (ruta ? Math.max(0, 2 * ruta.blancoKm - pos()) : 0);

/** Cuantos km reales vale un metro de pasillo aca (la compresion del tramo vigente). */
export const kmPorM = () => (ruta ? kmPorMetro(Math.max(0, run.dist) / objetivo, marcas, objetivo) : 0);

// ---------- EL RADAR CON ALCANCE (PLAN_NAFTA_ALCANCE §3.4, N2) ----------

/** ¿El radar enemigo llega hasta aca? Sin ruta, siempre (el juego de siempre). Con ruta, solo entre
 *  la linea de `radarKm` de la ida y la de la vuelta. */
export function enAlcance() {
  if (!ruta) return true;
  const p = Math.max(0, run.dist) / objetivo;
  return p >= lineas.entra && (lineas.sale === null || p < lineas.sale);
}

/** El techo del radar corregido por el alcance. Lo aplica `techoRadar()` de systems/fases.js, que
 *  es la puerta unica del techo: detector, red, tinte, estrellas y HUD leen de ahi. Sin ruta
 *  devuelve el mismo numero que recibe. */
export const techo = t => (ruta ? techoAlcance(t, run.dist, objetivo, lineas, FLY_TOP, RUTA_RADAR_RAMPA_M) : t);

// ---------- LA CHANCHA EN SU ZONA (PLAN_NAFTA_ALCANCE §3.5, N4) ----------

/** ¿En que zona de la Chancha esta el avion? 'ida' | 'vuelta' | null. */
export function zonaChancha() {
  if (!ruta) return null;
  const p = Math.max(0, run.dist) / objetivo;
  for (const k of ['ida', 'vuelta']) { const z = zonas[k]; if (z && p >= z[0] && p <= z[1]) return k; }
  return null;
}

/** ¿Estamos en la vuelta y ya fuera del radar? Es donde la Chancha se puede LLAMAR (la barra la
 *  trae antes de su zona): ya te vieron, la radio esta abierta, y ella no entra al radar. */
export const vueltaFueraDeRadar = () => !!ruta && lineas.sale !== null && Math.max(0, run.dist) / objetivo >= lineas.sale;

/** ¿La vuelta todavia no llego a la zona de la Chancha? (despues de la zona ya no hay a quien llamar) */
export const antesDeZonaVuelta = () => !!ruta && !!zonas.vuelta && Math.max(0, run.dist) / objetivo <= zonas.vuelta[1];
