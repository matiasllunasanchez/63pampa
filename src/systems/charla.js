// LAS CHARLAS EN VUELO (docs/sistemas/SPEC_CHARLAS_VUELO.md): dialogo DURANTE la mision jugable.
//
// LA TESIS: "una pausa sin pausa". El avion sigue volando exactamente igual —fisica, gas,
// laterales, roce, el mar pasando— pero el KILOMETRAJE deja de acreditar hacia el objetivo. Eso
// es lo unico que se congela. La UI se va, y con ella el numero quieto: la ficcion cierra sola.
//
// ESTE ARCHIVO ES EL DUEÑO DEL ESTADO Y NADA MAS. No dibuja, no habla, no arranca el motor de
// dialogo y no sabe que existe `data/story.js`: contesta EN QUE FASE esta la charla y devuelve
// SEÑALES ('arranca', 'fin') para que el orquestador de game.js decida (convencion 2 de
// ARQUITECTURA). El tipeo lo corre el motor de siempre (core/dialogue.js), que no se reforma.
//
// LAS CUATRO FASES, y por que hay cuatro y no dos:
//
//   idle      no pasa nada. Es el estado de TODA mision sin `charla:` en sus tramos, y por eso la
//             regla suprema de los tramos se cumple sola: en idle este modulo contesta que si a
//             todo y no toca un solo numero.
//   armada    el tramo entro y el sembrador YA ESTA APAGADO, pero el dialogo todavia no arranco:
//             se espera el DRENAJE (que lo ya sembrado pase de largo). Existe porque el §RF-01
//             pide CERO enemigos en pantalla durante la charla, y matarlos seria hacer trampa —
//             se los deja pasar, que es lo que el mundo hace solo cuando nadie siembra atras.
//   activa    corre el dialogo.
//   saliendo  el letterbox se va (CHV_FADE). Es presentacion, pero cuenta como charla: ver abajo.
//
// LA BURBUJA VALE DESDE 'armada' Y HASTA 'idle', no solo mientras se habla. Es deliberado: si el
// odometro corriera durante el drenaje, el tramo que disparo la charla podria TERMINARSE antes de
// que la primera linea aparezca — la charla se armaria en un tramo y se jugaria en otro, y con el
// tope de 2,5 s eso no es una hipotesis. Igual del otro lado: acreditar durante el fundido de
// salida deja medio segundo de mundo corriendo bajo unas bandas negras que todavia estan puestas.
//
// LO QUE ESTE MODULO NO DECIDE: si hay amenazas vivas. Eso lo mira el orquestador (LA COLA, la
// ola, la niebla, el climax) y lo pasa en `e.amenaza` — preguntarlo aca obligaria a importar
// medio motor para responder algo que game.js ya tiene a mano.
import { CHV_DRAIN_S, CHV_MAX_S, CHV_FADE } from '../data/tuning.js';

let fase = 'idle';
let escenaId = null;   // el id de la escena de story.js que pidio el tramo
let drenT = 0;         // segundos que lleva drenando el corredor
let vivaT = 0;         // reloj de la charla ACTIVA (contra CHV_MAX_S)
let salT = 0;          // lo que queda del fundido de salida
let cortada = false;   // la ultima charla se corto (muerte/relevo) en vez de terminar sola

/** ARMA una charla. La llama el orquestador al entrar a un tramo con `charla:`.
 *
 *  Se ignora si ya hay una corriendo: dos charlas encimadas no es un caso que el guion pueda
 *  querer, y dejar que la segunda pise a la primera convertiria un error de datos (dos tramos
 *  seguidos con charla) en media escena muda que nadie va a poder explicar despues.
 *  Devuelve true si la tomo. */
export function armar(id) {
  if (fase !== 'idle' || !id) return false;
  fase = 'armada'; escenaId = id; drenT = 0; vivaT = 0; salT = 0; cortada = false;
  return true;
}

/** UN CUADRO. `e` = { inPlay, limpia, amenaza, dlgFin }:
 *    inPlay   se esta volando el pasillo (fuera de eso la charla se corta: RF-06)
 *    limpia   no queda nada sembrado en el corredor
 *    amenaza  hay algo vivo que la charla tiene que esperar (§6.3: COLA, ola, niebla ciega)
 *    dlgFin   el motor de dialogo termino la escena
 *
 *  Devuelve SIEMPRE un objeto: `{ sig }` con 'arranca' | 'fin' | null. */
export function tick(dt, e) {
  const out = { sig: null };
  if (fase === 'idle') return out;
  // SALIR DEL PASILLO LA CORTA, y no la suspende: morir, relevo o climax. "El momento paso"
  // (RF-06). Al reintentar la mision el tramo se vuelve a entrar y la charla se re-dispara sola,
  // porque el estado de tramos nace de cero con el run.
  if (!e.inPlay) { cortar(); return out; }

  if (fase === 'armada') {
    drenT += dt;
    // EL DRENAJE ES UN TOPE, NO UNA ESPERA: pantalla limpia manda, y CHV_DRAIN_S es el techo por
    // si algo se quedo (un mastil lejano, un soldado que corre). Lo que NO tiene techo es la
    // amenaza viva: ahi la charla espera lo que haga falta — hablar mientras un Harrier te tiene
    // la cola no es una escena, es una distraccion.
    if ((e.limpia || drenT >= CHV_DRAIN_S) && !e.amenaza) {
      fase = 'activa'; vivaT = 0;
      out.sig = 'arranca';
    }
    return out;
  }

  if (fase === 'activa') {
    vivaT += dt;
    // DOS FORMAS DE TERMINAR y las dos van al mismo lado: el guion se acabo, o se agoto el tope
    // duro. El tope no recorta la escena por gusto — esta para que un guion mal medido no
    // secuestre la mision; si una charla lo toca, lo que hay que hacer es partirla en dos tramos
    // (§6.4), y este numero es lo unico que lo va a delatar.
    if (e.dlgFin || vivaT >= CHV_MAX_S) { fase = 'saliendo'; salT = CHV_FADE; out.sig = 'fin'; }
    return out;
  }

  // saliendo
  salT -= dt;
  if (salT <= 0) { fase = 'idle'; escenaId = null; }
  return out;
}

/** La corta en seco. La llama el orquestador en la muerte y en el relevo (RF-06): no hay fundido
 *  ni reanudacion — el mundo ya cambio de registro y las bandas negras se van con el resto. */
export function cortar() {
  if (fase === 'idle') return false;
  fase = 'idle'; escenaId = null; drenT = 0; vivaT = 0; salT = 0; cortada = true;
  return true;
}

/** Run nuevo. El `cortada` se limpia acá y no en `cortar()` porque es justamente lo que el
 *  fixture de RF-06 mira entre morir y reintentar. */
export function resetCharla() { fase = 'idle'; escenaId = null; drenT = 0; vivaT = 0; salT = 0; cortada = false; }

// ---------- LO QUE PREGUNTAN LOS DEMAS ----------

/** ¿Puede sembrar el sembrador? En idle es SIEMPRE que si, y esa es la regla suprema: una mision
 *  sin charlas nunca sale de idle, asi que spawn.js se comporta exactamente igual que ayer. */
export const sembrar = () => fase === 'idle';

/** ¿Hay charla en curso? (cualquier fase que no sea idle). Es lo que apaga el HUD y lo que
 *  congela la acreditacion — ver la nota de la burbuja arriba. */
export const enCurso = () => fase !== 'idle';

/** ¿Se esta hablando AHORA? Solo 'activa'. Lo usa el render de la barra de dialogo. */
export const hablando = () => fase === 'activa';

/** FACTOR DEL AVANCE, el hermano de `chAvance()` de la CHANCHA: 0 congela la acreditacion sin
 *  tocar `run.spd`. La velocidad del avion es fisica y no se toca — lo que cambia es cuanto de
 *  esa velocidad se ANOTA en el odometro. */
export const avance = () => (enCurso() ? 0 : 1);

export const escena = () => escenaId;
export const faseDe = () => fase;

/** Foto para la sonda `__cvdbg`. QUITAR con la sonda. */
export function dbg() {
  return {
    fase, escena: escenaId, cortada,
    dren: +drenT.toFixed(2), viva: +vivaT.toFixed(2), sal: +salT.toFixed(2),
    // los TRES gates, resueltos: es lo que de verdad van a leer los otros modulos este cuadro
    sembrar: sembrar(), avance: avance(), hablando: hablando(),
    max: CHV_MAX_S, drenMax: CHV_DRAIN_S,
  };
}
