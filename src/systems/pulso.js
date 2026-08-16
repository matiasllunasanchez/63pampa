// EL PULSO — el climax como PRUEBA DE DESTREZA (docs/sistemas/PLAN_EL_PULSO.md).
//
// Al llegar al final del PASILLO el tiempo se dilata, la camara entra a la cabina y el juego pide
// ejecutar una secuencia de teclas contra reloj. Bien hecha: el avion vuela la pirueta, suelta, y
// el buque muere. Mal hecha: te pasas de largo y volves — con costo, nunca con una muerte seca.
//
// DISCIPLINA DE SEÑALES (convencion 2 de ARQUITECTURA): este modulo muta stores y DEVUELVE
// señales ('objective', { death }); jamas llama a die(), setState ni al flujo de mision. Quien
// decide es el orquestador de game.js.
//
// LO QUE ESTE MODULO NO HACE, A PROPOSITO (plan §6.4): no toca tempo.js ni moves.js por dentro.
// La dilatacion del tiempo la aplica game.js escalando el dt del mundo (PULSO.SLOW), y la pirueta
// de la recompensa la va a volar moves.startMove() en Q3 — este sistema solo dice CUAL.
//
// EL RELOJ ES REAL. La prueba corre en tiempo de pared aunque el mundo este casi detenido: es la
// mano del jugador contra el cronometro, no contra el mundo. Por eso update() recibe DOS dt.
import { S, setState, plane } from '../core/state.js';
import { run } from '../core/run.js';
import { popup } from '../core/fx.js';
import { W } from '../render/ctx.js';
import { P } from '../data/palette.js';
import { T } from '../core/i18n.js';
import { MOVES } from '../data/moves.js';
import { PULSO, COMPASES, REMATE, SEQ_Q1, TOK_GLIFO } from '../data/pulso.js';
import { beep, boom, sfxOne, engineOff } from './audio.js';

// El estado de la prueba. Se REEMPLAZA entero al entrar (no es un store compartido: nadie mas lo
// lee por referencia — el render lo pide con state()).
let Q = null;

/** ¿Puede jugarse? SIEMPRE: EL PULSO es 2D puro — no necesita three.js ni WebGL. Es la unica
 *  fase del juego sin deuda 3D, y por eso tambien sirve de fallback donde el 3D no esta. */
export const available = () => true;

/** Mismo gatillo que los otros climax: el 100% de la distancia de la mision. */
export function readyToEnter(dist, objectiveDist) {
  return objectiveDist > 0 && dist >= objectiveDist;
}

/** Foto de solo lectura para el render (convencion 4: el que dibuja no toca el estado). */
export const state = () => Q;
export const active = () => !!Q;

export function resetPulso() { Q = null; }

/** Arma un COMPAS a partir de su combo. Devuelve tokens sueltos + el rotulo diegetico (regla 2):
 *  el nombre sale de MOVES, asi que no puede desincronizarse del catalogo. */
function compas(seq) {
  if (seq === REMATE.seq) return { seq, toks: ['Z'], label: T('pulso_soltar'), remate: true };
  const c = COMPASES.find(x => x.seq === seq);
  const mv = c && MOVES[c.move];
  return {
    seq,
    toks: seq.split(''),
    // si el combo no existe en el catalogo se degrada al string crudo en vez de romper: el modo
    // tiene que poder correr aunque alguien renombre una pirueta (P2 del juego: nada bloquea)
    label: mv ? mv.name : seq.toUpperCase(),
    move: c ? c.move : null,
    dir: c ? c.dir : 1,
  };
}

/** Entra a EL PULSO. `desdePasillo` = venis volando y el mundo se congela debajo tuyo.
 *
 *  NO HAY TRANSICION QUE ROMPER: a diferencia de los climax 3D, aca no se cambia de escena ni de
 *  camara de mundo — el buque que se ve es EL MISMO que venia creciendo en el horizonte del
 *  pasillo (drawApproachBarge). Lo unico que pasa es que el tiempo se frena y baja la cabina. */
export function enter(desdePasillo) {
  setState('pulso');
  engineOff();                            // el motor se apaga: lo que se escucha es el corazon
  Q = {
    t: 0,                                 // reloj REAL de la prueba
    fase: 'prueba',                       // 'prueba' | 'exito' | 'fallo'
    faseT: 0,
    bars: SEQ_Q1.map(compas),             // Q1: la secuencia fija (el sorteo por nivel es Q2)
    bi: 0,                                // compas en curso
    ti: 0,                                // token en curso DENTRO del compas
    errs: 0,                              // errores cometidos en esta secuencia
    motivo: null,                         // por que se fallo (lo canta el render, no un popup)
    tries: 0,                             // fallos gastados (plan §3: 3 y se pierde la mision)
    beatT: 0,                             // cuanto lleva abierto el compas actual
    beatMax: PULSO.T_BEAT[0],             // margen del compas (la escalada por nivel es Q2)
    shake: 0,
    desdePasillo: !!desdePasillo,
  };
  beep(880, 0.12, 'square', 0.05, 220);
}

/** El compas que se esta tecleando ahora (o null si la secuencia ya se completo). */
const barNow = () => (Q && Q.fase === 'prueba' ? Q.bars[Q.bi] || null : null);

/** UN TOQUE del jugador. Lo llama game.js desde la accion que registra core/input.js — los tokens
 *  son los MISMOS del detector de combos (TAPTOK), que es lo que hace que la prueba se sienta
 *  volar y no teclear (regla 1 del plan).
 *
 *  Devuelve true si el toque se consumio (para que el orquestador sepa que hubo lectura). */
export function tap(tok) {
  const b = barNow();
  if (!b) return false;
  const esperado = b.toks[Q.ti];
  if (tok === esperado) {
    Q.ti++;
    // TIC de acierto: sube de tono con el avance dentro del compas — el oido va midiendo cuanto
    // falta sin tener que mirar
    beep(620 + Q.ti * 90, 0.04, 'square', 0.045);
    if (Q.ti >= b.toks.length) cerrarCompas();
    return true;
  }
  // ERROR: corta el compas y hay que rehacerlo entero. No hay "casi" — pero tampoco mata (§6.2).
  Q.errs++;
  Q.ti = 0; Q.beatT = 0;
  Q.shake = Math.min(5, Q.shake + 2);
  beep(150, 0.14, 'sawtooth', 0.06, -60);
  // PERDON: el juego NO tiene perilla de dificultad (anotado en el plan §7 — el `[H]` que pedia
  // el plan no existe en OPCIONES), asi que hoy rige `normal` = cero perdones. La tabla queda en
  // data para cuando la escalada por nivel entre en Q2.
  if (Q.errs > PULSO.ERR.normal) fallar('pulso_fallo_err');
  return true;
}

function cerrarCompas() {
  const b = Q.bars[Q.bi];
  popup(W / 2, 58, b.label, P.foam);
  beep(1040, 0.09, 'square', 0.05, 160);
  Q.bi++; Q.ti = 0; Q.beatT = 0;
  if (Q.bi >= Q.bars.length) exito();
}

function exito() {
  Q.fase = 'exito'; Q.faseT = 0;
  boom(0.26);
  if (!sfxOne('exHeavy')) beep(70, 0.3, 'sawtooth', 0.07, 38);
}

/** El fallo (plan §3): NUNCA es muerte. Se paga con la vuelta, y recien el 3er intento pierde. */
function fallar(motivo) {
  Q.fase = 'fallo'; Q.faseT = 0; Q.tries++; Q.motivo = motivo;
  beep(120, 0.4, 'sawtooth', 0.07, -80);
}

/** Un cuadro de la prueba.
 *  @param dtReal  segundos de PARED — el cronometro de la prueba corre con este
 *  @param dtMundo segundos ya dilatados (PULSO.SLOW) — para lo que se mueve detras del vidrio
 *  @returns 'objective' · { death } · null   (el orquestador decide; ver la disciplina arriba) */
export function update(dtReal, dtMundo) {
  if (!Q) return null;
  Q.t += dtReal;
  Q.shake = Math.max(0, Q.shake - dtReal * 6);
  run.shake = Math.max(run.shake, Q.shake);

  if (Q.fase === 'prueba') {
    // EL MARGEN: cada compas tiene su ventana. Agotarla es fallar igual que equivocarse — el
    // pulso es tanto precision como decision rapida.
    Q.beatT += dtReal;
    if (Q.beatT >= Q.beatMax) fallar('pulso_fallo_t');
    return null;
  }

  Q.faseT += dtReal;
  if (Q.fase === 'exito') {
    // la cinematica completa (pirueta + suelta + muerte por clase) es Q3; por ahora el remate es
    // el estallido y el cierre de la mision por el embudo de siempre
    if (Q.faseT > 1.4) return 'objective';
    return null;
  }
  // FALLO: el re-encare corto. Te pasaste de largo, volves — y al 3er intento se pierde la
  // mision por el mismo camino que cualquier derrota (el orquestador lo convierte en derribo).
  if (Q.faseT > PULSO.REENCARE_T) {
    if (Q.tries >= PULSO.TRIES) return { death: 'death_pulso' };
    reencarar();
  }
  return null;
}

/** Vuelve a empezar tras un fallo: secuencia NUEVA (en Q1 es la misma) y el reloj de cero. */
function reencarar() {
  Q.fase = 'prueba'; Q.faseT = 0;
  Q.bi = 0; Q.ti = 0; Q.errs = 0; Q.beatT = 0;
  beep(700, 0.1, 'square', 0.05, 180);
}

// ---------------- SONDA (QUITAR antes de publicar) ----------------
// Sin esto la prueba no se puede medir desde afuera: los margenes son de decimas y a ojo no se
// distingue "fallo por tiempo" de "fallo por tecla".
if (typeof window !== 'undefined') window.__qdbg = () => {
  if (!Q) return JSON.stringify({ state: S.state, on: false });
  const b = barNow();
  return JSON.stringify({
    state: S.state, on: true, fase: Q.fase,
    t: +Q.t.toFixed(2), bar: Q.bi, bars: Q.bars.length,
    label: b ? b.label : null,
    esperado: b ? b.toks[Q.ti] : null,
    glifo: b ? TOK_GLIFO[b.toks[Q.ti]] || b.toks[Q.ti] : null,
    ti: Q.ti, errs: Q.errs, tries: Q.tries,
    beatLeft: +(Q.beatMax - Q.beatT).toFixed(2),
    alt: +plane.y.toFixed(1),
  });
};
// __qtap: teclea por sonda (el fixture no puede depender del foco del teclado)
if (typeof window !== 'undefined') window.__qtap = tok => tap(tok);
