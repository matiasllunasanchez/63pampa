// LA RADIO EN VUELO CON CAJA DE DIALOGO — una linea a la vez, abajo, con su barrita de tiempo.
//
// POR QUE EXISTE. La radio de los tramos se dibujaba como un `popup` centrado: una linea corta,
// en mayusculas, flotando sobre el horizonte. Sirve para un aviso ("CHANCHA LISTA"), pero el
// transito del Narwal NO es un aviso: son trece entradas de una conversacion que el jugador tiene
// que LEER mientras vuela, y leer trece carteles no es lo mismo que escuchar una charla.
//
// Asi que la charla en vuelo usa LA MISMA CAJA que la charla en tierra —render/screens.js
// `cajaVN`, literalmente la misma funcion— con dos diferencias que salen de que el jugador tiene
// las manos ocupadas:
//
//   1. NO SE AVANZA APRETANDO. La linea entra, dura, y se va sola. Pedirle un boton a alguien que
//      esta a treinta metros del agua es pedirle que elija entre leer y volar.
//   2. POR ESO HAY BARRITA. Es la unica forma honesta de decir "esto se va a ir": sin ella, el
//      jugador no sabe si tiene que apurarse a leer o si puede mirar el avion un segundo.
//
// EL TEXTO YA TRAE QUIEN HABLA. Las claves de strings vienen como 'CONDOR: ANOTO POSICIONES...',
// que es el mismo formato del guion viejo — asi que el nombre y el retrato salen de ahi sin que
// haya que tocar una sola linea de datos.
//
// NO DIBUJA ni decide cuando hablar: expone estado y un tick. Quien lo pinta es render/screens.js
// y quien lo dispara, el orquestador.

import { wrapChars } from './util.js';

// segundos que dura una linea: un piso para las cortas, y despues por largo de texto. 15 cps es
// mas lento que leer comodo a proposito — el jugador esta volando, no leyendo.
const T_MIN = 2.6, T_POR_CHAR = 1 / 15, T_MAX = 9;
// EL TOAST ES ANGOSTO Y DE DOS RENGLONES (ver drawRadioVN): 38 caracteres por renglon a cuerpo 6
// entran en los 226 px de la banda libre. No es el ancho del modo historia a proposito — alla la
// caja ocupa la pantalla entera porque no hay nada mas que mirar; aca hay un avion que volar.
const ANCHO = 38;

/** ESTADO DE IDENTIDAD ESTABLE (state.js §1): se MUTA, nunca se reasigna. */
export const radio = {
  activa: false,
  personaje: null,
  cara: null,
  wrap: [],
  t: 0,          // segundos transcurridos de la linea en curso
  dur: 0,        // cuanto dura
  ease: 0,       // 0..1 de la entrada subiendo
};

const SALIDA = 0.3;                  // segundos de la caja bajando al terminar

/** Parte 'CONDOR: TEXTO' en quien habla y que dice. Sin prefijo, es una acotacion. */
export function partirHablante(raw) {
  const m = /^([A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑ' .]*?):\s*/.exec(raw || '');
  if (!m) return { personaje: null, txt: raw || '' };
  return { personaje: m[1].trim(), txt: raw.slice(m[0].length) };
}

/** Arranca una linea. `caraDe` traduce nombre → id de retrato (lo pasa el orquestador para que
 *  este modulo no dependa del catalogo de caras: aca no se sabe quien es Condor). */
// ---------- EL HISTORIAL (solo lo usa el PANEL) ----------
// El TOAST es una linea que pasa y no deja nada: es un aviso. El PANEL es lo contrario — la radio
// de la escuadrilla, donde lo que se dijo hace diez segundos todavia se puede leer. Las dos formas
// se alimentan del MISMO `decir()`: el historial se llena siempre y lo mira quien lo necesita.
//
// CUATRO entradas y no mas: cinco ya no entran en la banda libre del HUD, y un log que crece hasta
// tapar el mundo es exactamente lo que la ley del §0b prohibe.
export const LOG_N = 4;
export const log = [];          // el mas NUEVO al final (identidad estable: se muta)

/** Envejece el historial. `dt` en segundos; las entradas viejas se apagan solas. */
export function tickLog(dt) {
  for (const e of log) e.t += dt;
  while (log.length > LOG_N) log.shift();
}

export function decir(raw, caraDe) {
  const { personaje, txt } = partirHablante(raw);
  radio.personaje = personaje;
  radio.cara = personaje && caraDe ? caraDe(personaje) || null : null;
  radio.wrap = wrapChars(txt, ANCHO);
  // el historial se llena SIEMPRE, use o no el panel: cambiar de presentacion en OPCIONES no puede
  // dejar un log vacio esperando a que alguien vuelva a hablar
  log.push({ personaje: radio.personaje, cara: radio.cara, txt, t: 0 });
  while (log.length > LOG_N) log.shift();
  radio.dur = Math.min(T_MAX, Math.max(T_MIN, T_MIN + txt.length * T_POR_CHAR));
  radio.t = 0;
  radio.activa = true;
  radio.ease = 0;
}

/** Corta la linea en curso (cambio de estado, muerte, fin de mision). */
export function callar() {
  radio.activa = false;
  radio.t = 0;
  radio.ease = 0;
  radio.wrap.length = 0;              // se MUTA el array, no se reemplaza
  radio.personaje = null;
  radio.cara = null;
}

export function tickRadio(dt) {
  tickLog(dt);                     // el historial envejece SIEMPRE, hable alguien o no
  if (!radio.activa) {
    if (radio.ease > 0) radio.ease = Math.max(0, radio.ease - dt / SALIDA);
    return;
  }
  radio.t += dt;
  radio.ease = Math.min(1, radio.ease + dt / 0.25);
  if (radio.t >= radio.dur) radio.activa = false;
}

/** Cuanto queda, 0..1. Es lo que dibuja la barrita. */
export const restante = () => (radio.dur > 0 ? Math.max(0, 1 - radio.t / radio.dur) : 0);

/** ¿Hay algo que dibujar? Sigue siendo `true` mientras la caja termina de bajar. */
export const visible = () => radio.activa || radio.ease > 0;
