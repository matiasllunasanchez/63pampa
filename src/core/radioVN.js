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
import { VOZ_COLS } from '../data/tuning.js';

// segundos que dura una linea: un piso para las cortas, y despues por largo de texto. 15 cps es
// mas lento que leer comodo a proposito — el jugador esta volando, no leyendo.
const T_MIN = 2.6, T_POR_CHAR = 1 / 15, T_MAX = 9;
// EL TOAST ES ANGOSTO Y DE DOS RENGLONES (ver drawRadioVN). El numero vive en data/tuning.js
// (`VOZ_COLS`) porque el HUD lo usa para darle ancho a la cinta de la que cuelga el toast: los dos
// lados tienen que leer el mismo, o el renglon se sale de la caja. No es el ancho del modo historia
// a proposito — alla la caja ocupa la pantalla entera; aca hay un avion que volar.
const ANCHO = VOZ_COLS;

/** ESTADO DE IDENTIDAD ESTABLE (state.js §1): se MUTA, nunca se reasigna. */
export const radio = {
  activa: false,
  personaje: null,
  cara: null,
  wrap: [],
  bloque: 0,     // el bloque de dos renglones que muestra la caja en vuelo (ver `bloque()`)
  entera: false, // la linea ya se leyo entera (pausa de dialogo)
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

/** ANOTA EN EL HISTORIAL SIN ENCENDER LA CAJA.
 *
 *  Existe para las CHARLAS EN VUELO, que tienen caja propia: si usaran `decir()` la misma frase
 *  aparecería dos veces en pantalla, en dos cajas distintas. Lo que comparten con la radio no es
 *  la presentacion — es la MEMORIA: el modo PANEL muestra las ultimas cuatro cosas que se dijeron,
 *  y una conversacion que no deja rastro ahi es una conversacion que no se puede releer. */
export function apuntar(personaje, cara, txt) {
  if (!txt) return;
  log.push({ personaje: personaje || null, cara: cara || null, txt, t: 0 });
  while (log.length > LOG_N) log.shift();
}

// LA COLA DEL DIALOGO CONGELADO (19/11, el autor: "los dialogos in game se pisan con los de pausa,
// secuencialos"). Mientras el mundo esta quieto en una pausa de dialogo, la caja es de esa linea: lo
// que pida hablar en ese rato (un golpe, la Chancha, Puma) NO la pisa — espera aca y sale cuando la
// pausa se suelta, de a una. Dos como mucho: lo viejo de una cola larga ya no tiene sentido.
const COLA_MAX = 2;
const cola = [];
let retenida = false;

/** `on` = hay una pausa de dialogo en pantalla. Al soltarla sale lo que espero (si la caja quedo libre).
 *  `vaciar` tira lo que esperaba (fin de corrida: lo de antes no puede hablar en la siguiente). */
export function retener(on, vaciar) {
  retenida = !!on;
  if (vaciar) cola.length = 0;
  if (!retenida && !radio.activa && cola.length) { const [r, c] = cola.shift(); decir(r, c); }
}

export function decir(raw, caraDe) {
  if (retenida) { cola.push([raw, caraDe]); while (cola.length > COLA_MAX) cola.shift(); return; }
  const { personaje, txt } = partirHablante(raw);
  radio.personaje = personaje;
  radio.cara = personaje && caraDe ? caraDe(personaje) || null : null;
  // LO QUE NO ENTRA EN DOS RENGLONES SALE EN OTRO BLOQUE (21/11, el autor: "hay dialogos in game que no entran en 2
  // lineas, separalos en 2 bloques"): `wrap` guarda la linea ENTERA (la caja de la pausa de dialogo la muestra toda —
  // "me falta un renglon en la pausa", 21/11) y la caja en vuelo muestra de a dos (`bloque()`); el que sigue sale, del
  // mismo que habla, apenas se vence este (tickRadio). Antes el tercer renglon se cortaba y no se leia nunca.
  radio.wrap = wrapChars(txt, ANCHO);
  radio.bloque = 0; radio.entera = false;
  // el historial se llena SIEMPRE, use o no el panel: cambiar de presentacion en OPCIONES no puede
  // dejar un log vacio esperando a que alguien vuelva a hablar
  log.push({ personaje: radio.personaje, cara: radio.cara, txt, t: 0 });
  while (log.length > LOG_N) log.shift();
  radio.dur = durDe(bloque());
  radio.t = 0;
  radio.activa = true;
  radio.ease = 0;
}
const BLOQUE = 2;            // los renglones que entran en la caja en vuelo
const durDe = filas => { const n = filas.join(' ').length; return Math.min(T_MAX, Math.max(T_MIN, T_MIN + n * T_POR_CHAR)); };
/** Los renglones que muestra AHORA la caja en vuelo (dos, del bloque en curso). La pausa de dialogo usa `wrap` entero. */
export const bloque = () => radio.wrap.slice(radio.bloque * BLOQUE, radio.bloque * BLOQUE + BLOQUE);
/** ¿Queda otro bloque de la misma linea? (no si ya se leyo entera en una pausa de dialogo) */
const hayOtro = () => !radio.entera && (radio.bloque + 1) * BLOQUE < radio.wrap.length;

/** Corta la linea en curso (cambio de estado, muerte, fin de mision). */
export function callar() {
  radio.activa = false;
  radio.t = 0;
  radio.ease = 0;
  radio.wrap.length = 0;              // se MUTA el array, no se reemplaza
  radio.bloque = 0;
  radio.personaje = null;
  radio.cara = null;
}

/** Un cuadro de la caja. `congelada` es la PAUSA DE DIALOGO: la caja entra y se QUEDA.
 *
 *  POR QUE EL `ease` SIGUE SUBIENDO Y EL RELOJ NO. Son dos cosas distintas que este modulo tenia
 *  pegadas: `ease` es la caja ENTRANDO (0,25 s de subida) y `t` es la linea VENCIENDOSE. Con el
 *  mundo quieto hay que dejar la primera viva y frenar la segunda — si se frenan las dos, el fondo
 *  se pinta con alfa fijo pero el texto y el borde van con `globalAlpha = ease`, o sea un
 *  rectangulo negro sin una letra clavado a media pantalla. Ese bug ya paso y esta contado en
 *  game.js:3163; la pausa de dialogo cae justo en el peor cuadro posible, el del nacimiento.
 *
 *  Sin el parametro, el comportamiento es exactamente el de siempre. */
export function tickRadio(dt, congelada) {
  tickLog(dt);                     // el historial envejece SIEMPRE, hable alguien o no
  if (!radio.activa) {
    if (radio.ease > 0) radio.ease = Math.max(0, radio.ease - dt / SALIDA);
    else if (cola.length && !retenida) { const [r, c] = cola.shift(); decir(r, c); }   // la que esperaba
    return;
  }
  radio.ease = Math.min(1, radio.ease + dt / 0.25);
  // CONGELADA: la linea no se vence, espera. Es literalmente "no continua hasta finalizar la
  // lectura", y de paso deja la barrita llena y quieta — que es honesto, porque la barrita
  // significa "esto se va a ir solo" y aca eso deja de ser cierto.
  // (y la congelada se lee ENTERA en la caja de la pausa: al soltarla no se repiten los bloques que siguen)
  if (congelada) { radio.entera = true; return; }
  radio.t += dt;
  if (radio.t >= radio.dur) {
    if (hayOtro()) { radio.bloque++; radio.dur = durDe(bloque()); radio.t = 0; }
    else radio.activa = false;
  }
}

/** Cuanto queda, 0..1. Es lo que dibuja la barrita. */
export const restante = () => (radio.dur > 0 ? Math.max(0, 1 - radio.t / radio.dur) : 0);

/** ¿Hay algo que dibujar? Sigue siendo `true` mientras la caja termina de bajar. */
export const visible = () => radio.activa || radio.ease > 0;
/** ¿Hay voz en vuelo hablando O esperando turno? (23/11, el autor: "no debe suceder nunca que un dialogo pausa se pise con
 *  uno ingame": el tutorial no abre su pausa mientras quede algo en la cola — saldria pegado detras) */
export const ocupada = () => visible() || cola.length > 0;
