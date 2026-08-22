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
// LO QUE ESTE MODULO NO HACE, A PROPOSITO (plan §6.4): no toca tempo.js ni moves.js por dentro, y
// desde el DIRECTOR (PLAN_DIRECTOR_CINEMATICAS C0) tampoco es dueño de la cinematica del premio:
// esa es una timeline en data/cines.js que corre systems/cine.js. Aca queda LA PRUEBA —lo que se
// juega— y las ligaduras que solo se saben jugando. La dilatacion del tiempo la sigue aplicando
// game.js escalando el dt del mundo, ahora preguntandole al director cuanto (verbo `tempo`).
//
// EL RELOJ ES REAL. La prueba corre en tiempo de pared aunque el mundo este casi detenido: es la
// mano del jugador contra el cronometro, no contra el mundo. Por eso update() recibe DOS dt.
import { S, setState, plane, cfg } from '../core/state.js';
import { run } from '../core/run.js';
import { popup } from '../core/fx.js';
import { popups } from '../core/world.js';
import { W } from '../render/ctx.js';
import { P } from '../data/palette.js';
import { T } from '../core/i18n.js';
import { MOVES } from '../data/moves.js';
import { SHIP_CLASS } from '../data/ships.js';
import { horizonRoll, spriteRoll } from '../core/horizon.js';
import { PULSO, PULSO_CINE, PULSO_TEATRO, COMPASES, REMATE, PULSO_ZONAS, PULSO_CLASE, CLASE_DEF, TOK_GLIFO } from '../data/pulso.js';
import { beatFor, barsFor, errFor, poolFor, armarZonas, parSecsFor, sellosDe, puntosDe, sellosN } from '../core/pulso.js';
import * as cine from './cine.js';
import { PULSO_D_MUERTE, CINE_VUELO } from '../data/cines.js';
import { beep, engineOff, duck } from './audio.js';

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

export function resetPulso() { Q = null; carry = null; cine.stop(); }

/** La CONFIGURACION de la prueba para esta corrida. La pone game.js al armar el run, porque este
 *  sistema no puede mirar la campaña ni la libreta del Pichon (convencion 2: nadie llama hacia
 *  arriba) — y porque quien dispara la entrada es systems/flight.js, que tampoco las conoce.
 *
 *  `t01` = avance de campaña normalizado 0..1. Es la UNICA perilla de dificultad que existe en el
 *  juego (no hay [H] en OPCIONES): de ella salen el margen, el largo de la secuencia y el perdon. */
export function setCfg(c) {
  carry = { t01: (c && c.t01) || 0, campaign: !!(c && c.campaign), owned: (c && c.owned) || [],
            off: (c && c.off) || null, ship: (c && c.ship) || '', tries: 0, flak: 0 };
}

/** EL BUQUE de esta corrida. Entra aparte de setCfg() y no dentro porque el orden de armado del
 *  run es reset() → setRunObjective(): cuando se configura la prueba, el objetivo todavia es el de
 *  la mision ANTERIOR. Lo unico que cambia es COMO se muere (la clase), no la prueba. */
export function setShip(name) {
  carry = carry || { t01: 0, campaign: false, owned: [], off: null, tries: 0, flak: 0 };
  carry.ship = name || '';
}

/** La clase del buque objetivo — de ella sale COMO se muere (PULSO_CLASE). Sale del mismo
 *  SHIP_CLASS que ya elige el layout de zonas del climax 2D: un buque nuevo no agrega nada. */
const claseDe = ship => PULSO_CLASE[SHIP_CLASS[ship]] || CLASE_DEF;

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
export function enter(desdePasillo, conf) {
  setState('pulso');
  engineOff();                            // el motor se apaga: lo que se escucha es el corazon
  const c = conf || carry || {};
  carry = { t01: c.t01 || 0, campaign: !!c.campaign, owned: c.owned || [], off: c.off || null,
            ship: c.ship || '', tries: (carry && carry.tries) || 0, flak: (carry && carry.flak) || 0 };
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
    pts: 0,                               // puntos de la zona elegida (base del premio)
    tSel: 0,                              // instante en que se eligio blanco (el reloj del sello)
    premio: null,                         // { zona, secs, par, sellos, pts } — lo arma exito()
    clase: claseDe(carry.ship),           // COMO se muere este buque
    hb: 0, hbDub: -1, hbT: 0,             // EL LATIDO (Q5): reloj, segundo golpe pendiente, fase 0..1
    shake: 0,
    desdePasillo: !!desdePasillo,
  };
  armarCarriles();
  // LA PRUEBA TAMBIEN ARRANCA CON LA PANTALLA LIMPIA (mismo motivo que el premio): los popups del
  // pasillo envejecen con el dt del mundo, que aca corre al 8%, asi que un "CONTROL LIBRE" del
  // ultimo tramo se quedaba trece segundos escrito encima de la eleccion de blanco.
  popups.length = 0;
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
  // el cronometro del SELLO DE VELOCIDAD arranca al ELEGIR, no al entrar: lo que se mide es
  // teclear sin dudar, y el tiempo que uno se tomo para decidir el blanco no es titubeo — es la
  // decision, que es justamente lo que el modo pide que tomes.
  Q.tSel = Q.t;
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

/** LA PRUEBA SALIO. De aca en adelante el jugador ya no tiene nada que hacer: se le paga y se le
 *  muestra. Los puntos se congelan ANTES de la cinematica (con el reloj de la prueba, no con el
 *  del premio) — si se calcularan al final, la cinematica formaria parte del tiempo medido.
 *
 *  LA CINEMATICA NO VIVE ACA: es una timeline en data/cines.js que corre EL DIRECTOR
 *  (systems/cine.js). Este sistema solo la arranca y le pasa lo que solo se sabe jugando —cual
 *  pirueta se tecleo, que tan grande es el estallido de la zona elegida, cuanto tarda en hundirse
 *  este buque— como LIGADURAS. Antes esto era una maquina de estados de sesenta lineas aca adentro;
 *  hoy el que quiera cambiar el premio no necesita abrir un sistema.  */
function exito() {
  const zona = (Q.carriles[Q.zi] && Q.carriles[Q.zi].zona) || PULSO_ZONAS[1];
  const secs = Q.t - Q.tSel;
  const par = parSecsFor(Q.bars.length, Q.beatMax);
  const sellos = sellosDe({ errs: Q.errs, secs, par, zona });
  Q.premio = { zona, secs, par, sellos, n: sellosN(sellos), pts: puntosDe(zona, sellos) };
  Q.fase = 'cine'; Q.faseT = 0;
  // LA PIRUETA QUE SE TECLEO: el ULTIMO compas que fue una pirueta (el remate no lo es). Regla 1
  // del plan del PULSO cerrando el circulo — el examen pedia la maniobra, y la recompensa es verla
  // salir. Si no hay ninguna (primera mision, libreta vacia) la ligadura queda sin atar y el beat
  // de la pirueta no hace nada; en su lugar se ata el del rotulo.
  const b = [...Q.bars].reverse().find(x => x.move);
  // CUANDO TERMINA LA PIRUETA: el encare mas lo que dura LA maniobra que se tecleo. Todo el resto
  // de la timeline se mide contra esto, asi que una maniobra corta no deja aire muerto y una larga
  // no queda cortada (PLAN_CINE_PESO P3). Sin pirueta, el encare y nada mas.
  const durMv = b && MOVES[b.move] ? MOVES[b.move].dur : 0;
  cine.start('pulso_premio', {
    pirueta: b ? b.move : undefined,
    piruetaDir: b ? b.dir : 1,
    tPir: CINE_VUELO.RAS_T + CINE_VUELO.POSE_T + durMv,
    tSinPirueta: b ? undefined : 0,
    // el estallido del impacto: lo que propone la zona, escalado por la clase del buque
    boom: 0.34 * zona.blast * Q.clase.blast,
    shake: 6 * zona.blast,
    // el SEGUNDO estallido (la santabarbara) existe solo en la zona brava: si `sec` es 0 la
    // ligadura queda sin atar y el beat directamente no se agenda
    secOff: zona.sec || undefined,
    boomSec: 0.5 * zona.blast * Q.clase.blast,
    // cuanto dura la agonia: la clase del buque estira el ultimo tramo
    muerteDur: PULSO_CINE.MUERTE * Q.clase.sink,
  });
}

// ---------------- EL TEATRO (Q5): el corazon y el silencio ----------------
// El plan §1 dice que el modo ES la tachypsychia: el tiempo estirado, el mundo mudo y las manos.
// Lo unico que puede contar eso sin escribirlo es el sonido — por eso el latido no es un adorno,
// es el reloj de la prueba hecho audible: acelera con el margen que se va y no se calma entre
// pasadas. Cuando la prueba sale, para: el premio devuelve el mundo (ver timeScale).

/** ¿Cuan apurado esta el corazon ahora? 0 = compas recien abierto · 1 = al limite. */
function urgencia() {
  if (Q.fase === 'fallo') return 1;                       // pasandote de largo: a mil
  const m = Q.beatMax > 0 ? Q.beatT / Q.beatMax : 0;
  return Math.min(1, m + Q.tries * PULSO_TEATRO.HB_TRY);
}

function latido(dt) {
  // EL MUNDO ENMUDECIDO: el motor ya esta apagado desde enter(); la musica se agacha CADA CUADRO
  // (el ducking decae solo, asi que mantenerlo es pedirlo de nuevo). En el premio se suelta: ahi
  // el mundo vuelve, y que la musica vuelva con el es la mitad del alivio.
  if (Q.fase !== 'cine') duck(0.55);

  if (Q.fase === 'cine') { Q.hbDub = -1; return; }         // gano: el corazon deja de ser la banda
  const u = urgencia();
  Q.hbT = u;
  const per = PULSO_TEATRO.HB[0] + (PULSO_TEATRO.HB[1] - PULSO_TEATRO.HB[0]) * u;
  Q.hb += dt;
  if (Q.hb >= per) {
    Q.hb = 0; Q.hbDub = PULSO_TEATRO.DUB;
    beep(58, 0.1, 'sine', 0.05 + u * 0.03, -14);           // el "lub": el golpe grande
  }
  if (Q.hbDub >= 0) {
    Q.hbDub -= dt;
    if (Q.hbDub < 0) beep(46, 0.13, 'sine', 0.035 + u * 0.02, -10);   // el "dub", mas grave y corto
  }
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
  latido(dtReal);

  if (Q.fase === 'prueba') {
    // EL MARGEN: cada compas tiene su ventana. Agotarla es fallar igual que equivocarse — el
    // pulso es tanto precision como decision rapida.
    Q.beatT += dtReal;
    if (Q.beatT >= Q.beatMax) fallar('pulso_fallo_t');
    return null;
  }

  Q.faseT += dtReal;
  // EL PREMIO: lo corre EL DIRECTOR (la timeline `pulso_premio` de data/cines.js). Cuando dice
  // que se termino, la mision se cierra por el embudo de siempre.
  //
  // El director puede devolver ademas `{ radio }` o `{ scene }`; esta timeline no los usa, asi que
  // el unico que se traduce es `done`. La primera cinematica que encadene una lamina va a tener
  // que subir esa señal al orquestador (plan §7, divergencia 5).
  if (Q.fase === 'cine') {
    const s = cine.update(dtReal);
    return s && s.done ? 'objective' : null;
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
  Q.errs = 0; Q.beatT = 0; Q.premio = null;
  cine.stop();                            // si se re-encara, la cinematica del premio no existio
  Q.flak = Math.min(PULSO.FLAK_T.length - 1, Q.tries);
  if (carry) carry.flak = Q.flak;
  Q.beatMax = beatFor(Q.t01, Q.flak);
  Q.perdon = errFor(Q.t01);
  armarCarriles();
  beep(700, 0.1, 'square', 0.05, 180);
}

// ---------------- LO QUE LA ORQUESTACION Y EL RENDER LEEN (Q3) ----------------
// Todo de solo lectura: el sistema sigue sin llamar hacia arriba. game.js pregunta y decide.

/** El premio ya congelado, para el recuento de la mision (game.js lo pasa a `stats`). */
export const premio = () => (Q && Q.premio) || null;

/** CUANTO CORRE EL MUNDO detras del vidrio. Durante la prueba, casi nada (PULSO.SLOW: el tiempo
 *  dilatado del plan §1). En el premio se DESHIELA hasta 1 — la bomba suelta el tiempo, que es la
 *  otra mitad de la tesis del modo: la lentitud era la concentracion, no una pausa. */
export function timeScale() {
  if (!Q) return 1;
  // durante la prueba manda la perilla del modo; en el premio manda EL DIRECTOR (el verbo `tempo`
  // de la timeline es el que devuelve el mundo a 1× — el deshielo dejo de ser una cuenta de aca)
  return Q.fase === 'cine' ? PULSO.SLOW + (1 - PULSO.SLOW) * cine.tempo() : PULSO.SLOW;
}

/** Cuanto se inclina EL MUNDO por la pirueta de la cinematica (radianes).
 *
 *  Sale de la misma cuenta que el pasillo (core/horizon.js) y respeta cfg.horizon: con el
 *  horizonte en FIJO devuelve 0 — quien apago el mundo giratorio porque se marea no se lo come
 *  igual en el climax. La pirueta se sigue leyendo por el resto (el tiron, el humo, la suelta). */
export const camRoll = () => (Q && Q.fase === 'cine' && cfg.horizon
  ? horizonRoll(cfg.horizon, spriteRoll(), 0, 0) : 0);


/** Lo que le pasa AL BUQUE en pantalla, para que lo aplique quien lo dibuja (render/world.js, por
 *  parametro desde game.js — nadie llama hacia arriba). `grow` es el pendiente honesto de Q1: el
 *  blanco recien DOMINA el cuadro cuando la autopista ya no esta y no le pelea el pixel. */
export function shipFx(vb) {
  // …y SOLO MIENTRAS EL DIRECTOR CORRE. Desde que la cinematica se apaga sola en su `fin`, la fase
  // del PULSO sigue en 'cine' un cuadro mas (el orquestador cierra la mision en ese mismo cuadro),
  // y sin esta guarda el buque volvia a 1× y sin escora justo ahi: un parpadeo del blanco a tamaño
  // de horizonte. Que hoy no se vea porque el recuento ya tapo la escena no lo hace correcto.
  if (!Q || Q.fase !== 'cine' || !cine.active()) return null;
  const z = Q.premio.zona;
  // EL ACERCAMIENTO ES UNA SOLA CURVA, de punta a punta del premio. Estuvo partido en dos —el zoom
  // de la caida hasta la agonia, y el del sobrevuelo durante la agonia— y las DOS arrancaban con
  // pendiente cero (van al cuadrado): en la costura, que caia justo en el impacto, el buque dejaba
  // de crecer casi un segundo. Medido con `__buque`: el largo en pantalla pasaba de +70 %/s a
  // +7 %/s exactamente ahi. Eso es lo que se veia como «el avion frena al segundo que impacta la
  // bomba» — y no era el avion: en una camara que mira para adelante, el tamaño del blanco es lo
  // unico que dice a que velocidad vas.
  //
  // El exponente es >1 porque un acercamiento ACELERA: el tamaño aparente va con 1/distancia, asi
  // que a velocidad constante los ultimos metros crecen mucho mas que los primeros.
  const g = Math.min(1, cine.t() / Math.max(0.1, cine.dur()));
  const grow = 1 + (PULSO_CINE.ZOOM - 1) * Math.pow(g, PULSO_CINE.ZOOM_CURVA);
  // LA AGONIA, como avance 0..1 — y 0 mientras el buque todavia no se este muriendo.
  const p = cine.parte() === 'muerte' ? cine.fParte() : 0;
  // …y BAJA en el cuadro mientras crece: le estas cayendo encima, asi que el buque deja de estar
  // clavado en el horizonte y se viene al centro de lo que la cabina deja ver.
  const drop = PULSO_CINE.DROP * g;
  // EL ENCUADRE CONTRA LA VENTANA. `grow` dice como se acerca; esto dice contra QUE se mide que
  // sea grande — y desde que la cabina va a ancho pleno lo que hay que mirar no es la pantalla
  // sino el hueco del parabrisas. Entra progresivo con la misma curva del acercamiento: al
  // principio el buque esta donde el pasillo lo dejo, y al final llena la ventana.
  // `llena` es el tamaño FINAL (fraccion de la ventana) y `g` el avance del acercamiento: quien
  // dibuja interpola de "lo que dejo el pasillo" a "lleno la ventana". Se manda asi y no ya
  // multiplicado porque el encuadre REEMPLAZA al zoom, no se le suma — sumados, el buque llegaba
  // al doble de grande y se leia como tres planchas grises.
  const enc = vb > 0 ? { ventana: vb, largo: PULSO_CINE.LARGO, agua: PULSO_CINE.AGUA, g } : null;
  if (!p) return Object.assign({ grow, drop, tilt: 0, sink: 0 }, enc);
  // MUERTE: escora y se va. La CURVA es de quien es dueño del buque, no del director — igual que
  // la curva de una pirueta es de moves.js. La timeline solo dice cuando empieza y cuanto dura, y
  // eso llega como el avance 0..1 del tramo.
  const k = z.sink * Q.clase.sink;
  // …y SE QUEDA ATRAS. Mientras el buque se hunde, vos estas trepando y alejandote: cae en el
  // cuadro. En una camara 2D —que mira siempre para adelante— esto es lo unico que puede decir
  // "te lo dejaste abajo", y sin eso la escena se lee como el avion estacionado mirando el humo.
  // EL HUNDIMIENTO se frena a mitad de camino a proposito. Con 1.15 el buque quedaba con la
  // cubierta MEDIO CASCO por debajo del agua antes de que la cinematica terminara, y el recorte del
  // mar se lo comia entero: el ultimo segundo era mar vacio. Un buque no se hunde en tres segundos
  // —lo que se cuenta aca es que EMPEZO a hundirse— y el que se lo termina de tragar es el recuento.
  return Object.assign(
    { grow, drop: drop + CINE_VUELO.ESC_DROP * p, tilt: p * p * 0.26 * k, sink: p * p * 0.78 * k }, enc);
}

// ---------------- SONDA (QUITAR antes de publicar) ----------------
// Sin esto la prueba no se puede medir desde afuera: los margenes son de decimas y a ojo no se
// distingue "fallo por tiempo" de "fallo por tecla".
if (typeof window !== 'undefined') window.__qdbg = () => {
  // sin prueba activa igual se informa el AVANCE del pasillo: es lo que deja medir que la prueba
  // llega volando al final del nivel y no por un teletransporte (Q4)
  if (!Q) return JSON.stringify({ state: S.state, on: false, dist: Math.round(run.dist) });
  const b = barNow();
  return JSON.stringify({
    state: S.state, on: true, fase: Q.fase, dist: Math.round(run.dist),
    t: +Q.t.toFixed(2), bar: Q.bi, bars: Q.bars.length,
    label: b ? b.label : null,
    esperado: Q.zi < 0 ? Q.carriles.map(c => c.bars[0].toks[0]).join('') : (b ? b.toks[Q.ti] : null),
    glifo: b ? TOK_GLIFO[b.toks[Q.ti]] || b.toks[Q.ti] : null,
    zi: Q.zi, zona: Q.zi < 0 ? null : Q.carriles[Q.zi].zona.id,
    carriles: Q.carriles.map(c => c.zona.id + ':' + c.bars.map(b2 => b2.seq).join('-')),
    beat: Q.fase === 'cine' ? cine.parte() : null,
    premio: Q.premio ? { zona: Q.premio.zona.id, pts: Q.premio.pts, n: Q.premio.n,
      secs: +Q.premio.secs.toFixed(2), par: +Q.premio.par.toFixed(2), sellos: Q.premio.sellos } : null,
    mv: run.mv || null, roll: +(camRoll()).toFixed(2), tScale: +timeScale().toFixed(2),
    fx: (f => f && { grow: +f.grow.toFixed(2), tilt: +f.tilt.toFixed(3), sink: +f.sink.toFixed(3) })(shipFx()),
    sec: cine.marca('sec') >= 0, clase: Q.clase.str,
    hb: +Q.hbT.toFixed(2), hbPer: +(PULSO_TEATRO.HB[0] + (PULSO_TEATRO.HB[1] - PULSO_TEATRO.HB[0]) * Q.hbT).toFixed(2),
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
// __qgana(zona): GANA la prueba ya mismo, con la zona pedida ('radar'|'bridge'|'deposit'). Es la
// unica forma de mirar el premio sin depender de que el que mira acierte una secuencia de decimas
// de segundo — la usa el menu CINEMATICAS y sirve igual desde la consola.
if (typeof window !== 'undefined') window.__qgana = z => {
  if (!Q || Q.fase !== 'prueba') return false;
  const i = Math.max(0, Q.carriles.findIndex(c => c.zona.id === z));
  Q.zi = i; Q.bars = Q.carriles[i].bars; Q.pts = Q.carriles[i].zona.pts;
  Q.bi = Q.bars.length; Q.ti = 0; Q.errs = 0;
  Q.tSel = Q.t;                            // se gana en cero: el premio sale con todos sus sellos
  exito();
  return true;
};
// __qcfg: re-entra con otra configuracion. Es la unica forma de ver la ESCALADA sin jugar la
// campaña entera: `__qcfg({t01:1})` da la prueba de la ultima mision en la primera.
if (typeof window !== 'undefined') window.__qcfg = o => {
  setCfg(Object.assign({}, carry, o)); enter(false); return window.__qdbg();
};
