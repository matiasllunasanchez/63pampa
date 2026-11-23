// EL DIRECTOR DE LA DIFICULTAD (22/11/2026, el autor: "me hablaron de un director para ir mejorando o manejando la
// dificultad del juego"). La rampa de los modos sueltos (data/modos_sueltos.js RAMPA) sube con los km, juegues bien o
// mal. El director la CORRE: mira como te va y multiplica la presion (game.js aplicarPresion) dentro de un margen.
//
// Lleva una TENSION (0 calmo … 1 al limite) con lo que ya mide el juego: la chapa que perdes (run.integ), el roce con
// el agua y la chapa baja. Con eso maneja tres fases:
//   SUBE     — si venis sin daño (`CALMA_S`), aprieta de a poco hasta `MAX`; si te estan pegando, vuelve a 1
//   RESPIRO  — al pasar la tension de `PICO`, `RESPIRO_S` segundos con la presion en `ALIVIO`: aire para recuperarte
//   (y de vuelta a SUBE, desde 1, sin otro respiro por `ENFRIA_S`: es un ciclo, no un colchon)
// Nunca toca los techos de cada perilla (PERILLAS.techo): un pasillo imposible no es dificil, es injusto.
// Numeros en DIRECTOR (data/modos_sueltos.js). Sonda: `__director()` devuelve el estado.
import { DIRECTOR } from '../data/modos_sueltos.js';

let tension = 0, mult = 1, meta = 1, fase = 'sube', respiroT = 0, enfriaT = 0, calmaT = 0, integPrev = null;

/** Arranca de cero (una corrida nueva). */
export function reiniciar() { tension = 0; mult = 1; meta = 1; fase = 'sube'; respiroT = 0; enfriaT = 0; calmaT = 0; integPrev = null; }

/** Un paso. `integ` la chapa (0..100), `roza` si esta rozando el agua. Devuelve el multiplicador de la presion. */
export function paso(dt, { integ, roza }) {
  const D = DIRECTOR;
  // EL DAÑO: lo que bajo la chapa desde el cuadro anterior (lo que sube —reparacion, relevo— no cuenta)
  const golpe = integPrev === null ? 0 : Math.max(0, integPrev - integ);
  integPrev = integ;
  if (golpe > 0) { tension += golpe * D.POR_GOLPE; calmaT = 0; } else calmaT += dt;
  if (roza) tension += D.POR_ROCE * dt;
  if (integ < D.CHAPA_BAJA) tension = Math.max(tension, D.PISO_CHAPA);
  tension = Math.max(0, Math.min(1, tension - (fase === 'respiro' ? D.BAJA_RESPIRO : D.BAJA) * dt));

  if (fase === 'respiro') {
    meta = D.ALIVIO;
    respiroT -= dt;
    if (respiroT <= 0) { fase = 'sube'; meta = 1; enfriaT = D.ENFRIA_S; }
  } else {
    enfriaT = Math.max(0, enfriaT - dt);
    if (tension >= D.PICO && enfriaT <= 0) { fase = 'respiro'; respiroT = D.RESPIRO_S; meta = D.ALIVIO; }
    // venis sobrado: aprieta de a poco; te estan pegando: vuelve a la rampa sola
    else meta = calmaT >= D.CALMA_S ? Math.min(D.MAX, meta + D.APRIETA * dt) : Math.max(1, meta - D.APRIETA * 4 * dt);
  }
  mult += (meta - mult) * Math.min(1, dt * D.SUAVE);
  return mult;
}

export const estado = () => ({ tension: +tension.toFixed(2), mult: +mult.toFixed(2), fase, respiroT: +respiroT.toFixed(1), calmaT: +calmaT.toFixed(1) });
if (typeof window !== 'undefined') window.__director = estado;
