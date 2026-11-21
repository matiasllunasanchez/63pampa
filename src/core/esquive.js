// EL ESQUIVE: la chance de que un disparo que te alcanza pase de largo (data/perfiles.js ESQUIVE). Puro, sin estado:
// lo usa systems/damage.js antes de cobrar el impacto y tools/unit.js lo prueba.
import { ESQUIVE } from '../data/perfiles.js';

/** ¿Esta causa es un disparo (se puede esquivar)? */
export const esDisparo = cause => ESQUIVE.CAUSAS.includes(cause);

/** La chance (0..TOPE) con esquive `base`, clase de maniobras `clase` y la pirueta en curso `mv` (o null). */
export function chanceEsquive(base, clase, mv) {
  const bono = mv ? (ESQUIVE.PIRUETA[mv] || 0) * (ESQUIVE.CLASE[clase] ?? 1) : 0;
  return Math.max(0, Math.min(ESQUIVE.TOPE, (base || 0) + bono));
}
