// EL DIRECTOR — el interprete de las cinematicas (docs/sistemas/PLAN_DIRECTOR_CINEMATICAS.md).
//
// Lee una timeline declarada en data/cines.js y, en cada instante, LLAMA A LOS SISTEMAS QUE YA
// EXISTEN: las piruetas las vuela moves.js, el sonido lo hace audio.js, la sacudida vive en `run`,
// los fundidos los dibuja render/cine.js. **El director no mueve nada** (plan §6.4): encadena.
//
// Es la diferencia entre un director y un segundo motor. Si mañana la pirueta cambia de curva, la
// cinematica cambia con ella sin que este archivo se entere — porque nunca supo volar.
//
// DISCIPLINA DE SEÑALES (convencion 2 de ARQUITECTURA): este modulo muta stores y DEVUELVE señales
// (`{ done }`, `{ radio }`, `{ scene }`); jamas llama a setState, a die() ni al flujo de mision.
// Una cinematica que encadena a una lamina no la abre: dice que hay que abrirla.
//
// EL RELOJ ES REAL. La timeline corre en segundos de PARED aunque el mundo venga dilatado — de
// hecho una de las cosas que sabe hacer es devolverle el tiempo al mundo (verbo `tempo`).
import { run } from '../core/run.js';
// `cam` (la camara del mundo) entra con otro nombre: `cam()` ya es el verbo del director
import { plane, cam as camMundo } from '../core/state.js';
import { popups, streaks } from '../core/world.js';
import { popup } from '../core/fx.js';
import { T } from '../core/i18n.js';
import { W } from '../render/ctx.js';
import { P } from '../data/palette.js';
import { armar, enVentana, finDe, parteEn, fParte as fParteDe, rampa } from '../core/cine.js';
import { CINES } from '../data/cines.js';
import { startMove, movesSystem } from './moves.js';
import { stepVuelo, estelaVuelo } from './vuelo.js';
import * as teatro from './teatro.js';
import { CINE_VUELO } from '../data/cines.js';
import { beep, boom, sfxOne, engineFly } from './audio.js';

// La cinematica en curso. Se REEMPLAZA entera al arrancar: nadie la lee por referencia (el render
// la pide con state()), asi que no es un store compartido.
let C = null;

// palanca NEUTRA para las piruetas de la cinematica: el avion esta comprometido en la maniobra y
// nadie la esta corrigiendo (movesSystem espera el input del cuadro)
const INP0 = { l: 0, r: 0, u: 0, d: 0 };

/** Una rampa: `{ de, a, dur, t0 }`. Vale `a` apenas se cumple `dur` desde `t0`. */
const ramp = (de, a, dur, t0, ease) => ({ de, a, dur: dur || 0, t0, ease });
const valor = (r, t) => (r ? rampa(r.de, r.a, r.dur, t - r.t0, r.ease) : 0);

/** Arranca la cinematica `id`. `vars` resuelve las ligaduras `$` de la timeline (ver data/cines.js).
 *  Devuelve false si la timeline no existe — el juego nunca se traba por una cinematica que falta. */
export function start(id, vars) {
  const tl = CINES[id];
  if (!tl) return false;
  C = {
    id, vars: vars || {},
    beats: armar(tl, vars || {}),
    // EL RELOJ ARRANCA APENAS ANTES DE CERO. La ventana de disparo es abierta abajo y cerrada
    // arriba —(t0, t1]— para que ningun beat salga dos veces; con el reloj en 0 exacto, todo lo
    // que la timeline pide en `t: 0` (la parte inicial, la pirueta, el primer golpe) caia afuera
    // de la primera ventana y no ocurria nunca. Costo un fixture en rojo descubrirlo.
    t: -1e-6,
    fin: false,
    ritmo: 1,                    // la velocidad de LA PELICULA (verbo `ritmo`)
    parte: null,
    marcas: {},
    control: 'total',
    tempo: ramp(1, 1, 0, 0),
    cam: { modo: null, off: ramp(0, 0, 0, 0) },
    vuelo: null,                 // la CAMA DE VUELO prendida (verbo `vuelo`): ver systems/vuelo.js
    pose: null,                  // altura pedida por el verbo `pose` (y hasta cuando)
    camForce: null,              // solo la sonda __ccam (QUITAR): probar un plano sin recompilar
    fade: ramp(0, 0, 0, 0), fadeColor: '#000', fadeThen: null,
    letterbox: ramp(0, 0, 0, 0),
  };
  C.durTotal = finDe(C.beats);
  return true;
}

export function stop() { C = null; }
export const active = () => !!C;
export const idOf = () => (C ? C.id : null);

/** Un cuadro de la cinematica. `dt` es tiempo REAL (segundos de pared).
 *  @returns null · `{ done }` · `{ radio }` · `{ scene }` — el orquestador decide. */
export function update(dtReal) {
  if (!C) return null;
  // EL RITMO: el dt de LA PELICULA. Todo lo que el director maneja —el reloj de la timeline, la
  // pirueta, la cama de vuelo, el mundo corriendo debajo— corre con este, asi que bajarlo pone la
  // escena entera en camara lenta SIN desincronizar nada. Es distinto de `tempo`, que dice a que
  // velocidad corre EL MUNDO detras del vidrio: uno es la camara, el otro es el reloj de afuera.
  const dt = dtReal * C.ritmo;
  const t0 = C.t;
  C.t += dt;
  const sig = {};

  for (const b of enVentana(C.beats, t0, C.t)) aplicar(b, sig);

  // LA PIRUETA LA SIGUE VOLANDO SU SISTEMA, cuadro a cuadro. El director la larga y la acompaña;
  // no la interpola el mismo (plan §6.4). Cuando moves.js termina, se suelta solo.
  //
  // …PERO SOLO SI EL AVION ES SUYO, y eso se lee en la cama de vuelo (`C.vuelo`). En una cinematica
  // como el premio del PULSO el director es el dueño y tiene que llamarla; en el PASILLO el dueño
  // es flight.js, que YA la llama — sin esta guarda, una timeline corrida sobre el vuelo normal
  // (el menu MANIOBRAS, presentacion "como cinematica") hacia avanzar la maniobra DOS VECES por
  // cuadro: duraba la mitad y se veia al doble de velocidad.
  if (C.vuelo && run.mv) movesSystem(dt, INP0);

  // …y LA CAMA DE VUELO debajo (PLAN_CINE_PESO): integra la posicion, persigue con la camara y
  // devuelve las actitudes a nivel con el MISMO peso que el pasillo — es literalmente su codigo.
  // Sin esto `moves.js` escribe velocidades que nadie integra y la pirueta es un sprite girando
  // sobre una foto, que es como se veia el premio del PULSO antes de esta fase.
  // POSE: mientras dura, el avion PIDE altura. Se apaga sola y no pelea con una pirueta — durante
  // la maniobra el dueño del avion es moves.js, y esto seria un segundo piloto.
  if (C.pose && !run.mv) {
    // se persigue la altura pidiendo velocidad vertical, y se ASIENTA sola: cuanto mas cerca del
    // objetivo, menos vy se pide. `ramp` es el peso del cambio — mas grande, mas perezoso.
    const tgt = Math.max(-18, Math.min(18, (C.pose.alt - plane.y) * 3.2));
    plane.vy += (tgt - plane.vy) * Math.min(1, dt * (2 / C.pose.ramp));
  }
  if (C.vuelo) {
    // SIN PALANCA, la actitud la dicta la TRAYECTORIA: el alabeo tiende a nivel y la trompa sigue
    // a la velocidad vertical. Es lo que hace que la trepada de salida se vea "mirando al cielo" en
    // vez de un avion horizontal que sube de costado — y sale gratis, porque es la verdad fisica.
    const pitchTgt = Math.max(-1, Math.min(1, plane.vy / 12));
    stepVuelo(dt, { bank: 0, pitch: pitchTgt, boost: C.vuelo.boost, techo: C.vuelo.techo });
    // EL AGUA: la estela y el rocio de volar a ras. Es la mitad de lo que dice "rasante".
    if (C.vuelo.agua) {
      // …y EN CABINA se abre a los costados: el chorro del morro lo tapa el tablero, y lo que se ve
      // desde adentro son las dos cortinas pasando al lado del canopy (CINE_VUELO.ROCIO_1A).
      const primera = cam().modo !== 'chase';
      estelaVuelo(dt, Object.assign({ mas: C.vuelo.agua === true ? 1 : C.vuelo.agua },
        primera ? CINE_VUELO.ROCIO_1A : null));
    }
    // EL MUNDO CORRE DEBAJO. Es la mitad de la sensacion de volar: sin esto el mar esta quieto y
    // no hay estela ni lineas de velocidad, por mucho que el avion se mueva.
    run.dist += run.spd * dt * C.vuelo.avance;
    // …y el motor vuelve. El PULSO lo apaga al entrar a la prueba (lo que se escucha es el
    // corazon); el premio es donde el mundo vuelve, y volver sin motor suena a pausa.
    if (C.vuelo.motor) engineFly(run.spd, C.vuelo.boost, C.vuelo.gain * (C.vuelo.boost ? 1.7 : 1));
    // LINEAS DE VELOCIDAD: las mismas del pasillo a fondo. Son lo que convierte "el avion sube" en
    // "el avion se ESTA YENDO" — sin ellas la trepada se lee como flotar hacia arriba.
    // NACEN MAS AFUERA que las del pasillo (70 en vez de 26): salen del punto de fuga, y en una
    // cinematica el punto de fuga es justo donde esta el blanco — apiladas ahi se veian como un
    // erizo blanco encima del buque que se hundia. Mas afuera hacen lo mismo sin taparlo.
    if (C.vuelo.estelas && Math.random() < 0.75) {
      const a = Math.random() * 6.283;
      // …Y SE DIMENSIONAN POR PLANO. Desde la cabina el punto de fuga esta en tu cara: las lineas
      // no convergen a lo lejos, te pasan por al lado. Mismo efecto, otra escala.
      const k = cam().modo !== 'chase' ? CINE_VUELO.ESTELA_1A : { r: 1, v: 1, largo: 1, tope: 260, bajo: 0 };
      streaks.push({ a, r: (70 + Math.random() * 40) * k.r, v: (240 + Math.random() * 160) * k.v,
        L: 9 * k.largo, rmax: k.tope, dy: k.bajo, life: 0.5 });
    }
  }

  // el `then` de un fundido dispara cuando el fundido TERMINA de cerrar, no cuando empieza: es lo
  // que hace que la lamina entre con la pantalla ya en negro y no a media luz
  if (C.fadeThen && C.t >= C.fadeThen.at) {
    const th = C.fadeThen; C.fadeThen = null;
    if (th.scene) sig.scene = th.scene;
    if (th.radio) sig.radio = th.radio;
  }
  // ---- Y SE APAGA SOLA. `fin` no es nada mas una señal para arriba: es EL FINAL, y el director se
  // suelta ahi mismo. Sin esto el ultimo estado de la timeline se quedaba pintado encima de todo lo
  // que viniera despues — y como el premio del PULSO termina en un RESPLANDOR BLANCO a opacidad 1,
  // lo que quedaba era la pantalla en blanco, para siempre, sobre el panel de recuento (playtest
  // 22/8: «quedó en blanco y nunca más pude hacer nada»). El orquestador ya recibio su señal en
  // `sig`; nadie mas necesita que esto siga vivo.
  //
  // Y EL RESPALDO, que es la parte que importa: tambien se suelta si el reloj PASA el final de la
  // timeline. Una cinematica sin `fin` —o con un `fin` cuya ligadura no se ato, que es una cosa que
  // esta timeline hace a proposito en otros beats— es exactamente el mismo cuelgue esperando. Una
  // cinematica no puede durar para siempre: eso no es una politica, es una invariante.
  if (C.fin || C.t > C.durTotal + 0.5) C = null;
  return Object.keys(sig).length ? sig : null;
}

/** Aplica UN beat: cada verbo delega en el sistema que ya sabe hacerlo. */
function aplicar(b, sig) {
  // ---- la pantalla arranca limpia. Los popups envejecen con el dt DEL MUNDO, que en una
  // cinematica puede venir dilatado: un rotulo de hace un segundo puede seguir colgado diez.
  if (b.limpiar === 'popups') popups.length = 0;

  // ---- LA CAMA DE VUELO: `vuelo: true` la prende con los valores de siempre, un objeto pisa los
  // que quiera, `false` la apaga (una cinematica que quiera al avion quieto tiene que pedirlo).
  if (b.vuelo !== undefined) {
    C.vuelo = b.vuelo === false ? null : Object.assign(
      { avance: CINE_VUELO.AVANCE, motor: true, gain: CINE_VUELO.GAIN, boost: false, estelas: false,
        agua: CINE_VUELO.AGUA, techo: undefined },
      typeof b.vuelo === 'object' ? b.vuelo : {});
  }

  // ---- POSE: llevar el avion a una altura. No es un teletransporte — pide una velocidad
  // vertical y la CAMA la integra, asi que el avion SUBE, con su peso y su cabeceo.
  if (b.pose !== undefined) {
    const o = typeof b.pose === 'object' ? b.pose : { alt: b.pose };
    // SOSTIENE la altura hasta que otra pose la reemplace (o `pose: false` la suelte). Con una
    // pose que EXPIRABA el avion se quedaba con la velocidad vertical colgada —en una cinematica
    // no hay gravedad ni intercambio de energia que la frene, eso es de flight.js— y la trepada de
    // salida terminaba a 50 m en vez de a los 26 pedidos: subia para siempre.
    C.pose = b.pose === false ? null : { alt: o.alt, ramp: o.ramp || 0.5 };
  }

  if (b.ritmo !== undefined) C.ritmo = b.ritmo;

  if (b.parte) C.parte = b.parte;
  if (b.marca) C.marcas[b.marca] = C.t;
  if (b.control) C.control = b.control;

  if (b.tempo !== undefined) {
    const o = typeof b.tempo === 'object' ? b.tempo : { a: b.tempo };
    C.tempo = ramp(valor(C.tempo, C.t), o.a, o.ramp, C.t, o.ease);
  }
  if (b.cam) {
    const o = typeof b.cam === 'object' ? b.cam : { modo: b.cam };
    if (o.modo) C.cam.modo = o.modo;
    if (o.off !== undefined) C.cam.off = ramp(valor(C.cam.off, C.t), o.off, o.ramp, C.t, o.ease);
  }
  if (b.fade) {
    const o = typeof b.fade === 'object' ? b.fade : { a: b.fade === 'negro' ? 1 : 0 };
    const dur = o.dur || 0;
    C.fade = ramp(valor(C.fade, C.t), o.a, dur, C.t, o.ease);
    // EL COLOR DEL FUNDIDO. Negro por omision —fundir es irse— pero un fundido a BLANCO no es lo
    // mismo: no cierra, REVIENTA. Es el remate de una explosion vista desde adentro y el unico
    // final honesto para una cinematica que termina alejandose de algo que arde. Un verbo nuevo
    // (`destello`) hubiera sido este mismo codigo con otro nombre: fundir a un color YA era esto.
    if (o.color) C.fadeColor = o.color;
    if (b.then) C.fadeThen = Object.assign({ at: C.t + dur }, b.then);
  }
  if (b.letterbox !== undefined) {
    const o = typeof b.letterbox === 'object' ? b.letterbox : { a: b.letterbox };
    C.letterbox = ramp(valor(C.letterbox, C.t), o.a, o.ramp || o.dur, C.t, o.ease);
  }

  // ---- LA PIRUETA: se la pide a moves.js tal cual la pediria el jugador con el combo. Si esta
  // en cooldown o el avion ya viene en una maniobra, startMove dice que no y la cinematica sigue:
  // una cinematica nunca puede trabar el juego.
  if (b.move && (!b.who || b.who === 'player')) startMove(b.move, b.dir);
  // ---- EL TEATRO AEREO (PLAN_TEATRO_AEREO TA3): la coreografia como DATO. El beat describe la
  // escena y quien la monta es `systems/teatro.js`, que ya sabe hacerla — el director no
  // reimplementa nada, y por eso el verbo es una linea. Nada de lo que monta entra en las cinco
  // listas de core/world.js, asi que una timeline no puede lastimar al jugador por accidente.
  if (b.teatro) teatro.escena(b.teatro === true ? {} : b.teatro);

  if (b.fx) {
    if (b.fx.boom !== undefined) boom(b.fx.boom);
    if (b.fx.shake !== undefined) run.shake = Math.max(run.shake, b.fx.shake);
  }
  // el `beep` de adentro del sfx es el RESPALDO: si la hoja de sonido no cargo (build web sin
  // samples), la cinematica igual suena. Es el mismo patron que usa todo el juego.
  if (b.sfx) {
    const s = typeof b.sfx === 'object' ? b.sfx : { key: b.sfx };
    if (!sfxOne(s.key, s.vol) && s.beep) beep.apply(null, s.beep);
  }
  if (b.beep) beep.apply(null, b.beep);

  // ROTULO: una palabra en pantalla, por clave de strings (nunca texto crudo — convencion del
  // repo). Lo dibuja el popup de siempre, con el reloj del MUNDO: en tiempo dilatado dura mas,
  // que es justo lo que se quiere de un rotulo puesto adentro de una camara lenta.
  if (b.rotulo) {
    const o = typeof b.rotulo === 'object' ? b.rotulo : { key: b.rotulo };
    popup(W / 2, o.y === undefined ? 16 : o.y, T(o.key), o.c === 'warn' ? P.warn : P.accent, !!o.big);
  }

  if (b.radio) sig.radio = b.radio;
  if (b.fin) { C.fin = true; sig.done = true; }
}

// ---------------- LO QUE LOS CLIENTES Y EL RENDER LEEN ----------------
// Todo de solo lectura. El director dice QUE tramo se esta jugando y CUANTO lleva; COMO se dibuja
// ese tramo es del que es dueño de la escena — igual que la curva de la pirueta es de moves.js.

export const t = () => (C ? C.t : 0);
/** Cuanto dura la cinematica entera. Lo consulta quien necesita una curva que abarque TODA la
 *  escena en vez de un tramo: el acercamiento del buque es una sola caida de punta a punta, y
 *  partirla en tramos fue lo que le puso una costura visible justo en el impacto. */
export const dur = () => (C ? C.durTotal : 0);
export const parte = () => (C ? C.parte : null);
/** Segundos desde que arranco la parte vigente. */
export function tParte() {
  if (!C) return 0;
  const p = parteEn(C.beats, C.t);
  return p ? C.t - p.t0 : C.t;
}
/** Avance 0..1 dentro de la parte vigente (para las curvas que duran un tramo). */
export function fParte() {
  if (!C) return 0;
  return fParteDe(parteEn(C.beats, C.t), C.t);
}
/** EN QUE INSTANTE arranca una parte (o el fin de la timeline si no existe). Lo consulta quien
 *  necesita medir contra un tramo que se mueve: desde que los instantes son relativos a la
 *  duracion real de la maniobra, "cuando empieza la agonia" ya no es un numero fijo. */
export function tParte0(id) {
  if (!C) return 0;
  const b = C.beats.find(x => x.parte === id);
  return b ? b.t : C.durTotal;
}

/** Segundos desde una MARCA, o -1 si todavia no ocurrio. */
export const marca = id => (C && C.marcas[id] !== undefined ? C.t - C.marcas[id] : -1);
/** Cuanto corre el MUNDO ahora mismo (el verbo `tempo`). */
export const tempo = () => (C ? valor(C.tempo, C.t) : 1);
/** Cuanta palanca conserva el jugador ('ninguno' | 'limitado' | 'total'). */
export const control = () => (C ? C.control : 'total');
/** La camara pedida: `{ modo, off }`. En 2D `modo` es 'cabina' o 'chase'; el 3D llega en C2. */
export const cam = () => (C ? { modo: C.camForce || C.cam.modo, off: valor(C.cam.off, C.t) } : { modo: null, off: 0 });

/** Foto de solo lectura para el render (convencion 4: el que dibuja no toca el estado). */
export const state = () => (C ? {
  id: C.id, t: C.t, parte: C.parte, fin: C.fin,
  tParte: tParte(), fParte: fParte(),
  // las marcas van con SU INSTANTE (no con "cuanto hace"): asi el render calcula lo que necesita
  // —cuanto hace, o si ya paso— sin que el snapshot tenga que adivinar cual de las dos quiere
  marcas: C.marcas,
  fade: valor(C.fade, C.t), fadeColor: C.fadeColor, letterbox: valor(C.letterbox, C.t),
  cam: cam(), control: C.control,
} : null);

// ---------------- SONDA (QUITAR antes de publicar) ----------------
// __ccam(modo): fuerza la camara de la cinematica en curso ('cabina' | 'chase'). Es para PROBAR un
// plano sin editar la timeline y recompilar — elegir camara es una decision que se toma mirando,
// y mirar dos versiones no puede costar dos builds.
// Es PEGAJOSA a proposito: pisa lo que pida la timeline, tambien los beats que todavia no
// ocurrieron. Puesta como un valor mas se la comia el `cam` del beat en `t: 0`, que dispara recien
// en el primer cuadro — o sea despues de que la sonda corriera.
if (typeof window !== 'undefined') window.__ccam = m => {
  if (C) C.camForce = m || null;
  return C ? cam().modo : null;
};
// Una cinematica dura segundos y pasa una vez: sin esto, "¿por que no sono el segundo estallido?"
// solo se puede contestar mirando el cuadro justo.
// La foto lleva TAMBIEN el estado de vuelo (altura, carril, actitudes, camara) y no solo el de la
// timeline: lo que hace que una cinematica se vea DURA no es lo que la timeline pide, es lo que el
// avion y la camara hacen —o no hacen— mientras tanto. Sin estos campos, "muy dura" no se puede
// medir desde afuera (PLAN_CINE_PESO §0, fase P0).
if (typeof window !== 'undefined') window.__cdbg = () => JSON.stringify(C ? {
  id: C.id, t: +C.t.toFixed(2), parte: C.parte, fin: C.fin,
  alt: +plane.y.toFixed(2), x: +plane.x.toFixed(2),
  vx: +plane.vx.toFixed(1), vy: +plane.vy.toFixed(1),
  bank: +plane.bank.toFixed(3), pitch: +plane.pitch.toFixed(3),
  roll: +(run.mvRoll || 0).toFixed(3), mv: run.mv || null,
  camx: +camMundo.x.toFixed(2), camy: +camMundo.y.toFixed(2), dist: Math.round(run.dist),
  tParte: +tParte().toFixed(2), fParte: +fParte().toFixed(2),
  marcas: Object.keys(C.marcas), tempo: +tempo().toFixed(2), control: C.control,
  cam: { modo: cam().modo, off: +cam().off.toFixed(1), forzada: !!C.camForce },
  vuelo: C.vuelo ? C.vuelo.avance : null, pose: C.pose ? C.pose.alt : null, ritmo: C.ritmo,
  fade: +valor(C.fade, C.t).toFixed(2), fadeColor: C.fadeColor,
  letterbox: +valor(C.letterbox, C.t).toFixed(2), techo: C.vuelo ? (C.vuelo.techo || null) : null,
  beats: C.beats.length, dur: +C.durTotal.toFixed(2),
} : { on: false });
