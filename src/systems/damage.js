// AVERIAS DEL AVION: el UNICO dueño de `run.integ` y de su ESCUDO (`run.escudo`, `run.escudoT`).
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
import { applyHit, effects, tierOf, isFatal, absorber, dmgRoce, recargar, ESCUDO, DMG } from '../core/damage.js';
import { tickDesgaste } from '../core/desgaste.js';

/** Avion nuevo: chapa sana y escudo lleno. La llama el arranque de corrida Y el relevo del
 *  escuadron — cada avion del escuadron entra entero, que es lo que hace que el escuadron siga
 *  siendo vidas. */
export function resetDamage() { run.integ = 100; run.escudo = 1; run.escudoT = 0; }

/** EL ESCUDO SE LLENA SOLO si pasa `ESCUDO.demora` sin daño. Lo llama el orquestador cada cuadro,
 *  en todos los estados: el escudo no es del pasillo ni de un climax, es del avion. */
export function tickEscudo(dt) {
  const r = recargar(run.escudo, run.escudoT, dt);
  run.escudo = r.escudo; run.escudoT = r.quieto;
}

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
  let r;
  // CHOCAR, o cualquier cosa en ESCUADRON: como siempre, abajo. Lo demas pasa por el ESCUDO.
  if (isFatal(cause) || !shown()) r = applyHit(run.integ, cause, cfg.dmgMode);
  else {
    const a = absorber(run.escudo, run.integ, DMG[cause]);
    run.escudo = a.escudo; run.escudoT = ESCUDO.demora;
    r = { integ: a.integ, down: a.down, dmg: Math.round(a.aChapa) };
  }
  run.integ = r.integ;
  if (r.down) return true;
  run.shake = Math.min(7, run.shake + 2.4);
  run.hurtT = 0.6;                       // fogonazo rojo en el HUD (lo lee el render)
  if (!sfxOne('exSmall')) boom(0.14);
  beep(150, 0.18, 'sawtooth', 0.05, 60);
  // LO PARO ENTERO EL ESCUDO: se sacude y suena —te pegaron—, pero no deja cicatriz ni numero. La
  // aguja amarilla ya cuenta cuanto costo.
  if (r.dmg <= 0) return false;
  // AGUANTO. El aviso no es decorativo: sin el, perder un tercio del avion es invisible y el
  // jugador no entiende por que de golpe no tiene turbo.
  stats.dmg = (stats.dmg || 0) + r.dmg;
  // Y QUEDA LA CICATRIZ (G-04). Va aca y no en el `down`: el avion que cae no vuelve a volar, asi
  // que su daño no se acumula en ninguna parte. Lo que marca la celula es lo que AGUANTO.
  tickDesgaste(1);
  const t = tierOf(run.integ), t0 = tierOf(before);
  // el popup grande sale SOLO al bajar de escalon: un numero cada vez que te rozan es ruido,
  // pero "te quedaste sin turbo" es una noticia y tiene que leerse
  if (t.id !== t0.id) popup(W / 2, 50, T('dmg_' + t.id), P.warn, true);
  else popup(W / 2, 50, '-' + r.dmg + '%', P.warn);
  return false;
}

/**
 * ROZAR la superficie `dt` segundos con un margen de `lim` segundos (`scrapeLimit`). Solo con chapa:
 * en ESCUADRON el que llama sigue con su reloj de gracia de siempre. Gasta el escudo y despues la
 * chapa, al ritmo de `dmgRoce`. Devuelve TRUE si el avion cae.
 *
 * Es CONTINUO, no un impacto: corre cada cuadro que el avion toca. Por eso no hay sonido ni numero
 * por cuadro —el roce ya tiene su sacudon, su vibracion y su "¡SUBI!"— y solo sale el cartel grande
 * al bajar de escalon, que es la noticia.
 */
export function roce(dt, lim) {
  const before = run.integ;
  const a = absorber(run.escudo, run.integ, dmgRoce(dt, lim));
  run.escudo = a.escudo; run.escudoT = ESCUDO.demora; run.integ = a.integ;
  if (a.down) return true;
  if (a.aChapa > 0) {
    stats.dmg = (stats.dmg || 0) + a.aChapa;
    // LA CICATRIZ, una cada 20 puntos que se come el agua: mas o menos lo que deja una trazadora.
    // Contarla por cuadro llenaria el avion de parches en un solo panzazo.
    const n = Math.floor(before / 20) - Math.floor(a.integ / 20);
    if (n > 0) tickDesgaste(n);
    const t = tierOf(a.integ), t0 = tierOf(before);
    if (t.id !== t0.id) popup(W / 2, 50, T('dmg_' + t.id), P.warn, true);
  }
  return false;
}

export { isFatal };
