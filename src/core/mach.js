// LO TRANSONICO — la matematica PURA del numero Mach (docs/sistemas/PLAN_TRANSONICO.md).
//
// Mismo lugar y misma razon que core/squad.js y core/pulso.js: cero dependencias, cero estado, y
// por eso se puede probar en node (`npm run unit`). Lo que decide CUANDO aparece el vapor y el
// cono no puede vivir enterrado en el render: es la vara del efecto entero, y si se corre, el
// efecto deja de significar lo que dice significar.
import { A_MAR, KMH_U, M_VAPOR, M_CONO, M_CONO_FULL } from '../data/tuning.js';

/** Mach a NIVEL DEL MAR a partir de la velocidad del juego. RASANTE se juega entre 0 y 68 m, asi
 *  que no hay corrección por altura: el mar es el unico sitio donde pasa esto. */
export const machNow = spd => (spd * KMH_U) / A_MAR;

/** 0..1 — cuanto vapor de ala corresponde. Sale del Mach Y de la G: el vapor del extrados es lo
 *  que hace la CARGA, no la velocidad sola. Volando derecho a la misma velocidad no hay nada. */
export function vaporAmt(spd, g) {
  const m = machNow(spd);
  if (m < M_VAPOR) return 0;
  // rampa de 0.15 Mach por encima del umbral: entra de a poco, no de golpe
  const km = Math.min(1, (m - M_VAPOR) / 0.15);
  return km * Math.min(1, Math.max(0, g));
}

/** 0..1 — cuanto cono corresponde. Solo el regimen: el cono no depende de la G. */
export function conoAmt(spd) {
  const m = machNow(spd);
  if (m < M_CONO) return 0;
  return Math.min(1, (m - M_CONO) / (M_CONO_FULL - M_CONO));
}

/** ¿Se cruzo hacia el regimen del cono entre dos cuadros? Es el disparador del CRUCE (V3) — el
 *  golpe de una sola vez, que no puede salir de mirar `conoAmt` porque eso es un nivel, no un
 *  evento. */
export const cruzo = (spdAntes, spdAhora) =>
  machNow(spdAntes) < M_CONO && machNow(spdAhora) >= M_CONO;
