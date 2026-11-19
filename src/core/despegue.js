// EL DESPEGUE JUGABLE: la carrera por la pista con el gas en la mano (constantes en data/tuning.js
// DESPEGUE). Puro: no toca el estado del juego, asi se mide en Node. game.js lo usa en el estado
// 'takeoff' cuando la mision pide `despegueJugable: true` y copia lo que sale a run.spd, run.dist y plane.y.
//
// La regla, dicha para el jugador: apretá el gas y no lo sueltes. A la velocidad de rotacion, con el gas
// a fondo, el avion levanta; soltarlo en la carrera hace perder velocidad, y si se termina la pista
// antes de levantar, `sinPista` (el que llama decide: el tutorial vuelve a la cabecera).
import { DESPEGUE as D } from '../data/tuning.js';

/** Una carrera nueva, en la cabecera, motor en marcha y gas en cero. */
export const nuevaCarrera = () => ({ gas: 0, spd: D.SPD0, dist: 0, aire: false, y: 0, sinPista: false, t: 0 });

/** Un paso de `dt` segundos con el gas apretado o no. `largo` = metros de pista utiles. */
export function pasoCarrera(c, dt, gas, largo) {
  c.t += dt;
  c.gas = Math.max(0, Math.min(1, c.gas + (gas ? D.GAS_SUBE : -D.GAS_BAJA) * dt));
  c.spd = Math.max(D.SPD0, Math.min(D.SPD_MAX, c.spd + (D.ACC * c.gas - D.ROCE) * dt));
  c.dist += c.spd * dt;
  if (!c.aire) {
    if (c.spd >= D.VR && c.gas >= D.GAS_MIN) c.aire = true;
    else if (c.dist >= largo - D.MARGEN) c.sinPista = true;
  } else c.y = Math.max(0, c.y + (D.TREPA * c.gas - D.CAE * (1 - c.gas)) * dt);
  return c;
}

/** ¿Ya es tuyo? (subio hasta la altura de control) */
export const enControl = c => c.aire && c.y >= D.CONTROL;
