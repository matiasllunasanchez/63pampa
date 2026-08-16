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
import { PULSO, COMPASES, REMATE, PULSO_ZONAS, TOK_GLIFO } from '../data/pulso.js';
import { beatFor, barsFor, errFor, poolFor, armarZonas } from '../core/pulso.js';
import { beep, boom, sfxOne, engineOff } from './audio.js';

// El estado de la prueba. Se REEMPLAZA entero al entrar (no es un store compartido: nadie mas lo
// lee por referencia — el render lo pide con state()).
let Q = null;
// LO QUE SOBREVIVE A UNA RE-ENTRADA. enter() vuelve a correr cuando el escuadron releva DENTRO de
// la prueba (game.js re-entra tras la cinematica), y ahi los intentos gastados y el flak que ya se
// acerco NO se perdonan: si se reiniciaran, perder un avion seria la forma barata de limpiar la
// cuenta. Lo unico que borra esto es resetPulso() — o sea, empezar la mision de nuevo.
let carry = null;

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

export function resetPulso() { Q = null; carry = null; }

/** La CONFIGURACION de la prueba para esta corrida. La pone game.js al armar el run, porque este
 *  sistema no puede mirar la campaña ni la libreta del Pichon (convencion 2: nadie llama hacia
 *  arriba) — y porque quien dispara la entrada es systems/flight.js, que tampoco las conoce.
 *
 *  `t01` = avance de campaña normalizado 0..1. Es la UNICA perilla de dificultad que existe en el
 *  juego (no hay [H] en OPCIONES): de ella salen el margen, el largo de la secuencia y el perdon. */
export function setCfg(c) {
  carry = { t01: (c && c.t01) || 0, campaign: !!(c && c.campaign), owned: (c && c.owned) || [],
            off: (c && c.off) || null, tries: 0, flak: 0 };
}

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
export function enter(desdePasillo, cfg) {
  setState('pulso');
  engineOff();                            // el motor se apaga: lo que se escucha es el corazon
  const c = cfg || carry || {};
  carry = { t01: c.t01 || 0, campaign: !!c.campaign, owned: c.owned || [], off: c.off || null,
            tries: (carry && carry.tries) || 0, flak: (carry && carry.flak) || 0 };
  Q = {
    t: 0,                                 // reloj REAL de la prueba
    fase: 'prueba',                       // 'prueba' | 'exito' | 'fallo'
    faseT: 0,
    t01: carry.t01,                       // avance de campaña 0..1: la perilla de dificultad real
    carriles: [],                         // las zonas del buque, cada una con SU secuencia
    zi: -1,                               // carril elegido (-1 = todavia se esta eligiendo)
    bars: [],                             // la secuencia en curso (la del carril elegido)
    bi: 0,                                // compas en curso
    ti: 0,                                // token en curso DENTRO del compas
    errs: 0,                              // errores cometidos en esta secuencia
    perdon: errFor(carry.t01),            // errores perdonados en esta secuencia (escala por nivel)
    motivo: null,                         // por que se fallo (lo canta el render, no un popup)
    tries: carry.tries,                   // fallos gastados (plan §3: 3 y se pierde la mision)
    flak: carry.flak,                     // grados que se acerco el flak (cada fallo lo acerca)
    beatT: 0,                             // cuanto lleva abierto el compas actual
    beatMax: beatFor(carry.t01, carry.flak),
    pts: 0,                               // puntos de la zona elegida (los cobra Q3)
    shake: 0,
    desdePasillo: !!desdePasillo,
  };
  armarCarriles();
  beep(880, 0.12, 'square', 0.05, 220);
}

/** Sortea las secuencias de las zonas. Se llama al entrar Y en cada re-encare: volver con la
 *  MISMA secuencia convertiria el fallo en memorizar en vez de volar (plan §3). */
function armarCarriles() {
  const pool = poolFor(carry);
  Q.carriles = armarZonas(PULSO_ZONAS, pool, Q.t01).map(x => ({
    zona: x.zona, bars: x.seqs.map(compas),
  }));
  Q.zi = -1; Q.bars = []; Q.bi = 0; Q.ti = 0;
  // si por lo que sea no hay carriles (pool y zonas vacios), la prueba se degrada al remate solo:
  // el modo tiene que poder correr siempre — nada bloquea (P2 del juego)
  if (!Q.carriles.length) Q.carriles = [{ zona: PULSO_ZONAS[1], bars: [compas(REMATE.seq)] }];
}

/** Elige carril: el primero cuyo PRIMER token coincide con la tecla. Elegir es empezar a teclear
 *  (plan §3) — no hay un menu previo, la decision se toma con las manos ya adentro de la prueba. */
function elegir(tok) {
  const i = Q.carriles.findIndex(c => c.bars[0] && c.bars[0].toks[0] === tok);
  if (i < 0) return false;
  Q.zi = i;
  Q.bars = Q.carriles[i].bars;
  Q.pts = Q.carriles[i].zona.pts;
  Q.bi = 0; Q.ti = 0;
  return true;
}

/** El compas que se esta tecleando ahora (o null si la secuencia ya se completo). */
const barNow = () => (Q && Q.fase === 'prueba' ? Q.bars[Q.bi] || null : null);

/** UN TOQUE del jugador. Lo llama game.js desde la accion que registra core/input.js — los tokens
 *  son los MISMOS del detector de combos (TAPTOK), que es lo que hace que la prueba se sienta
 *  volar y no teclear (regla 1 del plan).
 *
 *  Devuelve true si el toque se consumio (para que el orquestador sepa que hubo lectura). */
export function tap(tok) {
  if (!Q || Q.fase !== 'prueba') return false;
  // TODAVIA SIN CARRIL: este toque no es un acierto, es una DECISION. Si no coincide con ninguna
  // zona cuenta como error igual — apretar cualquier cosa no es elegir.
  if (Q.zi < 0) {
    if (!elegir(tok)) return errar();
    Q.ti = 1; Q.beatT = 0;
    beep(700, 0.05, 'square', 0.05);
    if (Q.ti >= Q.bars[0].toks.length) cerrarCompas();
    return true;
  }
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
  return errar();
}

/** UN ERROR. Corta el compas y hay que rehacerlo entero — no hay "casi". Pero no mata (§6.2): el
 *  PERDON de los primeros niveles absorbe uno por secuencia, y recien el segundo tumba la pasada.
 *  (El plan ataba el perdon a la dificultad; como no existe esa perilla, escala por nivel.) */
function errar() {
  Q.errs++;
  Q.ti = 0; Q.beatT = 0;
  Q.shake = Math.min(5, Q.shake + 2);
  beep(150, 0.14, 'sawtooth', 0.06, -60);
  if (Q.errs > Q.perdon) fallar('pulso_fallo_err');
  return true;
}

function cerrarCompas() {
  const b = Q.bars[Q.bi];
  popup(W / 2, 16, b.label, P.foam);   // en el cielo, con la autopista: nunca encima del buque
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
  // la cuenta se guarda ACA y no en el re-encare: el 2º fallo no re-encara — sale a la cinematica
  // del relevo y vuelve por enter(), asi que si no se anotara aca, perder un avion borraria el flak
  if (carry) { carry.tries = Q.tries; carry.flak = Math.min(PULSO.FLAK_T.length - 1, Q.tries); }
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
  // FALLO: el re-encare corto, con SU COSTO segun cual fallo es (plan §3, regla 4 del genero —
  // fallar duele, pero nunca es un reset seco):
  //   1º  te pasas de largo y volves, con el flak un grado mas cerca (el margen se achica)
  //   2º  ademas cuesta un avion del escuadron — el companero te cubre la vuelta
  //   3º  la mision se pierde por el mismo camino que cualquier derrota
  if (Q.faseT > PULSO.REENCARE_T) {
    if (Q.tries >= PULSO.TRIES) return { death: 'death_pulso' };
    if (Q.tries === 2) {
      // el orquestador decide: si hay escuadron, relevo (y re-entra por enter(), que conserva
      // intentos y flak); si volas solo, no hay avion que cobrar y se sigue como el 1er fallo
      return { spent: 'pulso', why: 'pulso_why', dieWhy: 'death_pulso' };
    }
    reencarar();
  }
  return null;
}

/** Vuelve a empezar tras un fallo: SECUENCIA NUEVA (sorteada de cero) y el flak un grado encima. */
export function reencarar() {
  if (!Q) return;
  Q.fase = 'prueba'; Q.faseT = 0;
  Q.errs = 0; Q.beatT = 0;
  Q.flak = Math.min(PULSO.FLAK_T.length - 1, Q.tries);
  if (carry) carry.flak = Q.flak;
  Q.beatMax = beatFor(Q.t01, Q.flak);
  Q.perdon = errFor(Q.t01);
  armarCarriles();
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
    esperado: Q.zi < 0 ? Q.carriles.map(c => c.bars[0].toks[0]).join('') : (b ? b.toks[Q.ti] : null),
    glifo: b ? TOK_GLIFO[b.toks[Q.ti]] || b.toks[Q.ti] : null,
    zi: Q.zi, zona: Q.zi < 0 ? null : Q.carriles[Q.zi].zona.id,
    carriles: Q.carriles.map(c => c.zona.id + ':' + c.bars.map(b2 => b2.seq).join('-')),
    perdon: Q.perdon, flak: Q.flak, pts: Q.pts, t01: +Q.t01.toFixed(2),
    beatMax: +Q.beatMax.toFixed(2),
    ti: Q.ti, errs: Q.errs, tries: Q.tries,
    beatLeft: +(Q.beatMax - Q.beatT).toFixed(2),
    alt: +plane.y.toFixed(1),
  });
};
// __qtap: teclea por sonda (el fixture no puede depender del foco del teclado)
if (typeof window !== 'undefined') window.__qtap = tok => tap(tok);
// __qhold: cuelga el margen del compas. Es SOLO para las capturas: sacar una foto tarda mas que la
// ventana de la prueba, asi que sin esto toda captura sale mostrando el fallo por tiempo.
if (typeof window !== 'undefined') window.__qhold = () => { if (Q) Q.beatMax = 1e9; return 1; };
// __qlives: fuerza el escuadron, para poder ver el COSTO del 2º fallo (un avion) sin depender de
// cuantos aviones traiga la mision de la sonda.
if (typeof window !== 'undefined') window.__qlives = n => { run.squad = run.lives = n; return n; };
// __qcfg: re-entra con otra configuracion. Es la unica forma de ver la ESCALADA sin jugar la
// campaña entera: `__qcfg({t01:1})` da la prueba de la ultima mision en la primera.
if (typeof window !== 'undefined') window.__qcfg = o => {
  setCfg(Object.assign({}, carry, o)); enter(false); return window.__qdbg();
};
