// AVERIAS DEL AVION: el UNICO dueño de `run.integ`.
//
// La matematica (escalones, daño por causa, que mata siempre) vive en core/damage.js, pura y
// testeada por tools/unit.js. Aca queda el estado y lo que se ve y se oye — igual que aero.js
// contra systems/arena.js.
//
// COMO SE USA. En vez de devolver la muerte derecho, el que golpea PREGUNTA:
//
//     if (dmg.takeHit('death_aa')) death = { death: 'death_aa' };
//
// Si devuelve false el avion sigue volando, mas averiado. Los sistemas no saben en que modo esta
// el juego ni cuanto aguanta: eso lo decide este modulo con cfg.dmgMode.
import { run } from '../core/run.js';
import { cfg, stats } from '../core/state.js';
import { popup } from '../core/fx.js';
import { T } from '../core/i18n.js';
import { P } from '../data/palette.js';
import { W } from '../render/ctx.js';
import { boom, beep, sfxOne } from './audio.js';
import { applyHit, effects, tierOf, isFatal } from '../core/damage.js';

/** Avion nuevo: chapa sana. La llama el arranque de corrida Y el relevo del escuadron — cada
 *  avion del escuadron entra entero, que es lo que hace que el escuadron siga siendo vidas. */
export function resetDamage() { run.integ = 100; }

/** Los multiplicadores del escalon actual. Lo consultan el vuelo del pasillo y el del arena. */
export const fx = () => effects(run.integ, cfg.dmgMode);

/** El escalon actual (para el HUD). */
export const tier = () => tierOf(run.integ);

/** ¿Hay que dibujar la integridad? En 'squad' no existe: la barra de vida es el escuadron. */
export const shown = () => cfg.dmgMode !== 'squad';

/**
 * Un impacto. Devuelve TRUE si el avion cae (el que llama arma su `{ death }` como siempre).
 * Devuelve FALSE si lo aguanto: acá se avisa, se sacude y se sigue volando.
 */
export function takeHit(cause) {
  const before = run.integ;
  const r = applyHit(run.integ, cause, cfg.dmgMode);
  run.integ = r.integ;
  if (r.down) return true;
  // AGUANTO. El aviso no es decorativo: sin el, perder un tercio del avion es invisible y el
  // jugador no entiende por que de golpe no tiene turbo.
  stats.dmg = (stats.dmg || 0) + r.dmg;
  run.shake = Math.min(7, run.shake + 2.4);
  run.hurtT = 0.6;                       // fogonazo rojo en el HUD (lo lee el render)
  if (!sfxOne('exSmall')) boom(0.14);
  beep(150, 0.18, 'sawtooth', 0.05, 60);
  const t = tierOf(run.integ), t0 = tierOf(before);
  // el popup grande sale SOLO al bajar de escalon: un numero cada vez que te rozan es ruido,
  // pero "te quedaste sin turbo" es una noticia y tiene que leerse
  if (t.id !== t0.id) popup(W / 2, 50, T('dmg_' + t.id), P.warn, true);
  else popup(W / 2, 50, '-' + r.dmg + '%', P.warn);
  return false;
}

export { isFatal };
