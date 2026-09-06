// ZIGZAG — el estado de la corrida (docs/sistemas/PLAN_PASILLO_ZIGZAG.md).
//
// La MATEMATICA vive en core/zigzag.js, que es puro y lo prueba `npm run unit`. Aca vive lo que
// tiene estado: que trazado trae la mision en curso, cual es su objetivo, y si el zigzag esta
// habilitado AHORA. Es la misma division que core/tramos.js ↔ systems/tramos.js.
//
// A DIFERENCIA DE LOS TRAMOS, esto NO resuelve on demand: rehace una tabla de 101 muestras una
// vez por cuadro. La razon es que quien la consume son los bucles del mar y de la tierra, que
// recorren miles de puntos por cuadro — ahi adentro no puede haber una integral. El riesgo que
// eso trae es el que systems/tramos.js documenta (un cache le agrega un orden obligatorio
// adentro de `update()`), y se desactiva de la unica forma que sirve: `stepZigzag()` se llama
// SIN CONDICION desde `update()` y decide adentro si hay zigzag o no. Asi no existe el camino
// en el que alguien no la llama y la tabla queda del cuadro anterior — el bug seria un mundo
// doblado adentro del climax.
//
// NADIE ESCRIBE cfg. El preset del menu se LEE; la mision se LEE.
import { rebuild, apagar, reset as resetCore, avanzar, deriva as derivaCore,
  tilt as tiltCore, lead as leadCore, validarZigzag, zz } from '../core/zigzag.js';
import { S, cfg } from '../core/state.js';
import { ZZ_ARRANQUE, ZZ_ARRANQUE_BASE } from '../data/tuning.js';
import { run } from '../core/run.js';

let spec = null;         // el trazado de la mision en curso (null = mision recta, el caso normal)
let objetivo = 0;        // la distancia meta contra la que se miden desde/hasta
let probe = null;        // el trazado inyectado por `__zzset`, que pisa al de la mision
let distPrev = 0;        // para saber cuantos metros se volaron este cuadro (el rumbo se integra)

// LOS PRESETS DEL MENU [M] / `?zigzag=`. Existen para poder PROBAR el item sin una mision que lo
// declare —POR LA PATRIA es infinito y no tiene objetivo, asi que no hay fracciones que valgan—
// y para que el autor pueda mirar una curva sin editar datos. No son contenido: una mision de
// verdad trae su propio trazado.
// LOS DOS LLEVAN PAREDES, y eso es la conclusion del playtest de Z2: el carril curvo sobre mar
// abierto y plano MAREA, porque no hay contra que referenciar el giro. Las laderas no son un
// adorno del preset CALLEJON — son lo que vuelve mirable la curva. Un preset sin ellas seria
// ofrecer desde el menu justo la version que marea.
// LOS DOS VAN CON `amp: 0`, o sea CAMARA COMPLETAMENTE QUIETA, y esa es la conclusion del segundo
// playtest. Con el carril doblando, el veredicto fue "se siente mal, como si se moviese el avion
// solo" — y es cierto: si la camara vira por su cuenta, el jugador deja de ser el dueño del avion.
//
// Con curvatura cero, TODO el movimiento de camara se apaga solo: `bendW` da cero exacto, la
// inclinacion da cero y la deriva da cero. No hizo falta desarmar nada — el trazado es un DATO, y
// el dato dice "derecho". La maquinaria de la curva queda entera para el dia que se quiera un
// callejon que ademas doble, y hasta entonces no cuesta un solo ciclo.
//
// LO QUE HACE EL CALLEJON ES LA TIERRA: promontorios que se meten adentro del pasillo y hay que
// rodear. El zigzag lo hace el JUGADOR esquivando, que es donde tiene que estar.
const PRESETS = {
  // SUAVE: puntas mas cortas y cerros bajos que NO MATAN (topan, como el borde del carril de
  // siempre). Es para acostumbrarse al callejon sin morirse.
  1: { amp: 0, largo: 800, seed: 3, paredes: { alto: 0.6, x: 52, mata: false } },
  // CALLEJON: laderas plenas y letales, puntas a fondo. Es Bomb Alley.
  2: { amp: 0, largo: 800, seed: 9, paredes: { alto: 1, x: 46, mata: true } },
  // COSTA IZQUIERDA / COSTA DERECHA: tierra de UN SOLO LADO y mar abierto del otro.
  //
  // No es medio callejon: es otra cosa de jugar. En el callejon el pasillo esta cerrado y el
  // trabajo es elegir por que lado rodear cada promontorio; con una costa sola, el mar de al lado
  // es una salida SIEMPRE disponible, asi que la tension no esta en pasar sino en cuanto te
  // animas a arrimarte a la tierra —que es donde estan los antiaereos y el puntaje de rasante—
  // antes de abrirte. Es el estrecho contra la costa de la isla.
  //
  // Las puntas siguen siendo UNA POR BANDA: con un solo costado van todas ahi, porque si no la
  // mitad caeria en el lado que no existe y el ritmo se partiria al medio.
  3: { amp: 0, largo: 800, seed: 4, paredes: { alto: 1, x: 46, mata: true, lado: 'izq' } },
  4: { amp: 0, largo: 800, seed: 6, paredes: { alto: 1, x: 46, mata: true, lado: 'der' } },
  // CERRADO: el callejon con BARRERAS — cada tanto se cierra de lado a lado y hay que pasarlo por
  // arriba (roca) o por abajo (puente). Va como preset aparte y no encima de CALLEJON porque son
  // dos cosas distintas de jugar, y hay que poder mirar una sin la otra.
  5: { amp: 0, largo: 800, seed: 9, paredes: { alto: 1, x: 46, mata: true, barreras: 'mezcla' } },
};

// LOS ESTADOS EN LOS QUE EL CALLEJON EXISTE. Es la MISMA lista que dibuja el mundo del pasillo
// (`MARCO_STATES` en game.js) menos el climax, y tiene que serlo: con solo `'play'` el callejon
// DESAPARECIA al morir — el avion se estrellaba contra una ladera y en la cinematica de la muerte
// los cerros ya no estaban, con el mar liso hasta el horizonte. El mundo no puede evaporarse
// justo en el cuadro donde el jugador mira que le paso.
//
// 'pulso' queda AFUERA a proposito (tiene cabina y encuadre propios), y ARENA/PASADA ni figuran:
// esas fases tienen su propio mundo, y una tabla encendida ahi les torceria el dibujo.
const ESTADOS = ['play', 'takeoff', 'dead', 'relevo'];

/** ¿El zigzag puede estar activo AHORA? Tres condiciones, y las tres importan:
 *
 *  · EL ESTADO (ver ESTADOS): el PASILLO, incluida la muerte y el relevo. El despegue entra en la
 *    lista pero no lo va a ver nunca: el arranque del callejon deja la pista atras.
 *  · QUE HAYA TRAZADO. La mision, el preset del menu o la sonda.
 *  · LA CAMARA LIBRE (`cfg.devcam`) lo apaga: es la herramienta para mirar el mundo derecho. */
function activo() {
  if (ESTADOS.indexOf(S.state) < 0) return null;
  if (cfg.devcam) return null;
  if (probe) return probe;
  if (spec) return spec;
  const p = PRESETS[cfg.zigzag | 0];
  return p || null;
}

/** Le pasa a la corrida el trazado de la mision. Lo llama `setRunObjective()` en game.js — el
 *  mismo sitio que `setTramos`, y por la misma razon: es donde ya se calcula `objectiveDist`,
 *  asi que la fraccion y su objetivo son SIEMPRE del mismo run. */
export function setZigzag(z, obj) {
  spec = z && typeof z === 'object' ? z : null;
  objetivo = obj > 0 ? obj : 0;
  probe = null;
  distPrev = 0;
  resetCore();
  return spec;
}

export function resetZigzag() { setZigzag(null, 0); }

/** Inyecta un trazado al run EN CURSO (sonda `__zzset`). Devuelve los errores del validador:
 *  una data mal formada se rechaza entera y la corrida sigue con lo que tenia.
 *  `__zzset(null)` saca la inyeccion y devuelve el mando a la mision. */
export function setZigzagProbe(z) {
  if (z === null || z === undefined) { probe = null; return []; }
  const e = validarZigzag(z);
  if (e.length) return e;
  probe = z;
  return [];
}

/** UN CUADRO. Se llama SIN CONDICION desde `update()` (ver el encabezado). Rehace la tabla si
 *  hay zigzag y la apaga si no — apagarla es la mitad importante. */
export function stepZigzag() {
  const z = activo();
  if (!z) { apagar(); distPrev = run.dist; return zz; }
  // EL RUMBO se integra con los METROS VOLADOS y no con el `dt`, y esa eleccion es la que hace
  // que el fondo no se desincronice: el trazado esta escrito en metros, asi que si el mundo se
  // frena (camara lenta, pausa) o se salta (`__wjump`), el rumbo acompaña exactamente lo que el
  // avion recorrio sobre el camino. Con `dt` habria que multiplicar por la velocidad y confiar
  // en que nadie la toque de costado.
  const dd = run.dist - distPrev;
  distPrev = run.dist;
  // un salto de sonda no tiene que hacer girar el rumbo medio mundo de golpe
  if (dd > 0 && dd < 200) avanzar(dd);
  // DONDE PUEDE EMPEZAR EL CALLEJON. Este modulo es el unico que sabe las dos cosas que hacen
  // falta: el piso absoluto (un callejon que ya esta ahi al arrancar no es un lugar al que se
  // entra) y donde termina la pista, porque levantar cerros encima del despegue seria tapar la
  // unica parte del vuelo donde el avion no puede maniobrar. Una mision que ya arranca EN EL AIRE
  // no tiene ese problema y solo respeta el piso.
  const arranque = cfg.start === 'air'
    ? ZZ_ARRANQUE
    : Math.max(ZZ_ARRANQUE, (cfg.coast || 0) + ZZ_ARRANQUE_BASE);
  rebuild(run.dist, z, objetivo, arranque);
  return zz;
}

/** LA DERIVA de la curva, en m/s. La consume `flight.js` y se la pasa a la cama de vuelo como
 *  un parametro mas — la cama no sabe que existe el zigzag, igual que no sabe que existe el
 *  poder RASANTE. */
export const derivaZigzag = () => derivaCore(run.spd);

/** ¿Se puede SOSTENER la curva con la palanca? `max` son los 30 m/s del control lateral.
 *  Es lo que contesta si el turbo en la curva es un riesgo o una muerte sin salida (RF-04). */
export const sostenible = (max = 30) => Math.abs(derivaZigzag()) <= max;

/** Cuanto INCLINA la curva el horizonte, en radianes. Cero sin zigzag.
 *  El signo sigue a la curvatura: doblando a la derecha, el mundo se inclina como cuando se
 *  banquea a la derecha. Quien decide si se aplica es core/horizon.js, que ya sabe que en
 *  HZ_FIX no se inclina nada — la salida del que se marea la respeta tambien el zigzag. */
export const tiltZigzag = tiltCore;

/** Cuanto ADELANTA la camara la mirada hacia el apice, en unidades de mundo. Cero sin zigzag. */
export const leadZigzag = leadCore;

/** El RUMBO acumulado del recorrido, en radianes. Lo lee el fondo (telon y sierras). */
export const headingZigzag = () => (zz.on ? zz.head : 0);

/** Foto del estado para la sonda `__zzdbg`. Reporta lo RESUELTO —lo que el dibujo y el vuelo
 *  van a leer este cuadro— y no lo que dice la data: es la unica forma de comprobar desde
 *  afuera que el trazado esta rigiendo de verdad. */
export function dbg() {
  const z = activo();
  return {
    on: zz.on,
    fuente: probe ? 'sonda' : spec ? 'mision' : z ? 'preset' : null,
    estado: S.state,
    curv: +zz.curv.toFixed(6),
    curvN: +zz.curvN.toFixed(3),
    head: +zz.head.toFixed(3),
    headGrados: +(zz.head * 180 / Math.PI).toFixed(1),
    deriva: +derivaZigzag().toFixed(2),
    sostenible: sostenible(),
    tilt: +tiltZigzag().toFixed(3),
    lead: +leadZigzag().toFixed(2),
    dist: Math.round(run.dist), obj: Math.round(objetivo), arranque: Math.round(zz.arranque),
    p: objetivo > 0 ? +(run.dist / objetivo).toFixed(3) : null,
    // el corrimiento del carril a la profundidad de siembra: es el numero que la pantalla tiene
    // que estar mostrando, y con el que el fixture compara el dibujo contra el nucleo
    bend320: +(zz.on ? zz.bend[Math.min(zz.n - 1, 80)] : 0).toFixed(2),
    paredes: z && z.paredes ? z.paredes : null,
  };
}
