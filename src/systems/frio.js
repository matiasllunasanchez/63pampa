// EL FRIO (data/frio.js): la temperatura exterior, el HIELO que se junta, el cañon que se traba, la turbulencia del
// frente frio. Un solo modulo para LAS ISLAS (systems/islas/islas.js le pasa su clima) y EL PASILLO (game.js le pasa
// su cielo). Escribe en el store lo que leen los demas: `run.temp` (°C), `run.hielo` (0..1), `run.frioCanon` (0..1,
// flight.js: el cañon), y el reloj de temperatura (render/hud.js) lee `estado()`.
import { run } from '../core/run.js';
import { plane } from '../core/state.js';
import { cartelSostenido } from '../core/cartel.js';
import { T } from '../core/i18n.js';
import { HIELO, CANON_T, CANON_RANGO, TURB_T, GRADIENTE, SAL_T, ARRANQUE, T_CIELO, T_LLUVIA, T_NIEBLA } from '../data/frio.js';

let turbT = 0;
// EL AVION QUE VUELA (data/perfiles.js `frio`: { hielo, canon, sal, arranque, turbulencia }, 1 = como el A-4B): lo
// pone game.js al arrancar
let perfil = {};
export function avion(f) { perfil = f || {}; }
export const perfilAvion = () => perfil;
export function reiniciar() { run.hielo = 0; run.frioCanon = 0; run.temp = null; turbT = 0; }

/** UN CUADRO. `e` = lo que dice el clima de donde vuelas:
 *    temp      °C a la altura del avion
 *    enNube    adentro de la capa de nubes
 *    humedo    lluvia, nieve, niebla o nube (la humedad que se congela)
 *    seco      por encima de las nubes (no junta, aunque haga frio)
 *    rasante   abajo de HIELO.RASANTE sobre el agua (el aire del mar lo derrite)
 *    sacude    0..1, tormenta o lluvia fuerte (la turbulencia, si ademas hace frio)
 *  `k` = el avion (data/perfiles.js `frio`): hielo, canon, turbulencia. */
export function paso(dt, e, k = perfil) {
  run.temp = e.temp;
  const h0 = run.hielo || 0;
  let h = h0;
  if (e.rasante && e.temp > -1) h -= dt * HIELO.SALE_CALIDO;
  else if (e.temp <= HIELO.T && e.humedo && !e.seco) h += dt * (e.enNube ? HIELO.JUNTA_NUBE : HIELO.JUNTA) * (k.hielo ?? 1);
  else h -= dt * (e.temp > 3 ? HIELO.SALE_CALIDO : HIELO.SALE);
  run.hielo = Math.max(0, Math.min(1, h));
  // EL HIELO PESA (y quita sustentacion): hay que darle gas para sostenerse
  plane.vy -= HIELO.PESA * run.hielo * dt;
  cartelSostenido('frioHielo', run.hielo > 0.25, T('islasHielo'), '#9fdcff', { alerta: run.hielo > 0.6 }, T('islasHieloSub'));
  // EL CAÑON NEUMATICO con frio (flight.js: se traba antes, mas seguido y tira lento)
  run.frioCanon = Math.max(0, Math.min(1, (CANON_T - e.temp) / CANON_RANGO)) * (k.canon ?? 1);
  // LA TURBULENCIA DEL FRENTE FRIO: tormenta o lluvia fuerte con frio, sacude y tira para arriba y abajo
  const turb = e.sacude > 0 && e.temp <= TURB_T ? e.sacude * (k.turbulencia ?? 1) : 0;
  if (turb > 0) {
    turbT += dt;
    const g = Math.sin(turbT * 2.3) * Math.sin(turbT * 5.7 + 0.7) + 0.4 * Math.sin(turbT * 11.1);
    plane.vy += g * turb * 30 * dt;
    run.shake = Math.max(run.shake || 0, turb * (1.2 + Math.abs(g) * 1.6));
  }
}

/** Lo que muestra el reloj: °C, el hielo y cuanto sufre el cañon; null si no hay temperatura (fuera de vuelo). */
export const estado = () => (run.temp == null ? null : { c: run.temp, hielo: run.hielo || 0, canon: run.frioCanon || 0 });
/** ¿Se junta sal en el parabrisas con este aire? (systems/salitre.js la cobra; con aire frio, SAL_T) */
export const salOk = () => (perfil.sal ?? 1) > 0 && (run.temp == null || run.temp <= SAL_T);
/** Cuanto mas probables son las fallas al ARRANCAR con `temp` en la base (data/frio.js ARRANQUE). */
export function arranqueK(temp) { for (const [t, k] of ARRANQUE) if (temp <= t) return 1 + (k - 1) * (perfil.arranque ?? 1); return 1; }

/** EL PASILLO: la temperatura a la altura `y` con el cielo y el tiempo de la mision (data/frio.js T_CIELO). */
export function tempPasillo(cfg, y) {
  const base = (T_CIELO[cfg.sky] ?? 5) + (cfg.rain > 0 ? T_LLUVIA * Math.min(2, cfg.rain) : 0) + (cfg.fog ? T_NIEBLA : 0);
  return base - GRADIENTE * Math.max(0, y) / 1000;
}
