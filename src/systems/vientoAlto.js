// EL VIENTO DE ALTURA (data/tuning.js VIENTO_ALTO, 26/11/2026). Cuatro problemas que crecen con la altura, en todo el pasillo:
//   · el viento de FRENTE baja el objetivo de velocidad (`frenoVel`)
//   · el de COSTADO deriva al avion (`deriva`, m/s sumados a la posicion en la integracion, como el zigzag: asi lo
//     sienten igual el control directo y el de alabeo)
//   · la CORRENTADA descendente lo hunde un par de segundos (`hunde`, m/s, tambien a la posicion: anda en los cuatro
//     modos del gas, que son todos por velocidad)
//   · la TURBULENCIA lo sacude (temblor en la posicion y shake)
// Abajo de la primera capa todo vale 0 y el vuelo es exactamente el de siempre.
import { VIENTO_ALTO as VA, TORMENTA_ELEC as TE } from '../data/tuning.js';
import { vibrar } from '../core/vibra.js';
import { va as est } from '../core/vientoAlto.js';

let t = 0, corrT = 0, corrDur = 0, corrProx = 6, temX = 0, temY = 0, vibT = 0;

/** Intensidad de la capa a esta altura, 0..1 (sin el clima). */
export function capa(y) {
  const C = VA.CAPAS;
  if (y <= C[0][0]) return C[0][1];
  for (let i = 1; i < C.length; i++) if (y < C[i][0]) {
    const u = (y - C[i - 1][0]) / (C[i][0] - C[i - 1][0]);
    return C[i - 1][1] + (C[i][1] - C[i - 1][1]) * u;
  }
  return C[C.length - 1][1];
}

/** El multiplicador del dia. `mision` (fases `vientoAlto`) manda si viene. */
export function climaK(cfg, mision) {
  if (mision != null) return +mision;
  if (cfg.rain >= 2 || cfg.sky === 'storm') return VA.CLIMA.tormenta;
  return cfg.wind ? VA.CLIMA.ventoso : VA.CLIMA.calmo;
}

/** Un paso. `y` la altura del avion; `k0` el clima; `rnd` (opcional) para medir sin azar; `torm` 1 con tormenta
 *  electrica (su turbulencia propia, a cualquier altura, y el sacudon de cada trueno). Devuelve el estado. */
export function paso(dt, y, k0, rnd = Math.random, torm = 0) {
  t += dt;
  const k = capa(y) * k0;
  est.k = k;
  // de frente: vaiven lento alrededor de su valor
  const vai = 1 - VA.FRENTE_VAR + VA.FRENTE_VAR * (0.5 + 0.5 * Math.sin(t * 0.37 + 1.1));
  est.frenoVel = 1 - Math.min(0.5, VA.FRENTE * k * vai);
  // de costado: un ciclo largo con un rulo corto encima; cruza el cero de vez en cuando (el viento rola)
  const w = 2 * Math.PI / VA.LADO_PER;
  est.lado = Math.sin(t * w) * 0.8 + 0.35 * Math.sin(t * w * 3.3 + 0.7);
  est.deriva = VA.LADO * k * est.lado;
  // la correntada
  est.hunde = 0; est.corr = 0;
  if (corrDur > 0) {
    corrT += dt;
    if (corrT >= corrDur || k < VA.CORR.DESDE * 0.5) { corrDur = 0; corrT = 0; }
    else { est.corr = Math.sin(Math.PI * corrT / corrDur); est.hunde = VA.CORR.HUNDE * k * est.corr; }
  } else if (k >= VA.CORR.DESDE) {
    corrProx -= dt;
    if (corrProx <= 0) {
      corrDur = VA.CORR.DURA[0] + rnd() * (VA.CORR.DURA[1] - VA.CORR.DURA[0]); corrT = 0;
      corrProx = (VA.CORR.CADA[0] + rnd() * (VA.CORR.CADA[1] - VA.CORR.CADA[0])) / Math.max(0.3, k);
    }
  } else corrProx = Math.max(corrProx, VA.CORR.CADA[0]);
  // la turbulencia: un temblor de posicion que se renueva rapido (ruido filtrado), mas fuerte en la correntada
  // LA TORMENTA ELECTRICA (TORMENTA_ELEC): su temblor propio (poco al ras, mas arriba) y el sacudon del trueno
  est.tormenta = torm;
  est.pulso = Math.max(0, (est.pulso || 0) - dt / TE.SACUDON_S);
  const tormTu = torm * (TE.TURB_MS + (TE.TURB_ALTO - TE.TURB_MS) * Math.min(1, Math.max(0, y / 300))) + TE.SACUDON * est.pulso * Math.min(1, 0.3 + y / 120);
  const tu = VA.TURB_MS * k * (1 + est.corr * 0.6) + tormTu;
  temX += ((rnd() - 0.5) * 2 * tu - temX) * Math.min(1, dt * 9);
  temY += ((rnd() - 0.5) * 2 * tu - temY) * Math.min(1, dt * 9);
  est.temX = temX; est.temY = temY;
  est.shake = VA.TURB_SHAKE * k * (0.6 + 0.4 * est.corr) + torm * 0.5 + est.pulso * 3;
  // el mando vibra con la sacudida (de a pulsos cortos; el trueno lo vibra por su lado: systems/tormenta.js)
  vibT -= dt;
  if (est.shake >= TE.VIBRA.TURB_VIBRA && vibT <= 0) { const m = Math.min(1, est.shake / 5); vibrar(m * 0.5, m * 0.8, 140); vibT = 0.18 + rnd() * 0.25; }
  return est;
}

/** Para el HUD y las sondas: el ultimo estado. */
export const vientoAlto = () => est;
export function reset() { t = 0; corrT = 0; corrDur = 0; corrProx = 6; temX = temY = 0; Object.assign(est, { k: 0, frenoVel: 1, deriva: 0, hunde: 0, corr: 0, lado: 0, temX: 0, temY: 0, shake: 0 }); }
