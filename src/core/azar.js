// EL AZAR FIJO DEL LIBRO DE VUELO (17/11, el autor: "las misiones de libro de vuelo deben estar fijas,
// no deben ser aleatorios los enemigos y demas, asi es mas facil de probar").
//
// Cada sistema que decide QUE APARECE y COMO SE PORTA (la siembra, los cazas, las defensas del buque, la
// artilleria, la tormenta) pide su propio dado con `dado('nombre')`. Sin semilla, el dado es Math.random
// —los modos sueltos y la campaña siguen igual—; con `sembrarAzar(semilla)`, cada dado es una secuencia
// fija. UN DADO POR SISTEMA y no uno compartido: si los cazas tiraran del mismo dado que la siembra, una
// tirada de mas de un caza (que depende de los cuadros por segundo) correria toda la siembra que sigue.
//
// Las chispas, el humo y los demas adornos siguen con Math.random: no cambian la partida.

let semilla = null;
const dados = new Map();   // nombre -> { s: estado de mulberry32 }

/** mulberry32: chico, rapido y con buena mezcla para un juego. */
function paso(d) {
  let t = (d.s = (d.s + 0x6D2B79F5) | 0);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/** Un numero a partir de un texto (la semilla de cada dado sale de la general + su nombre). */
export function hashTexto(txt) {
  let h = 2166136261;
  for (let i = 0; i < txt.length; i++) h = Math.imul(h ^ txt.charCodeAt(i), 16777619);
  return h | 0;
}

/** Fija el azar (un numero o un texto, p. ej. el id de la salida). null = vuelve a Math.random. */
export function sembrarAzar(s) {
  semilla = s === null || s === undefined ? null : typeof s === 'number' ? s | 0 : hashTexto(String(s));
  dados.clear();
}

export const azarFijo = () => semilla !== null;

/** El dado de un sistema: una funcion que devuelve [0, 1) como Math.random. */
export function dado(nombre) {
  return () => {
    if (semilla === null) return Math.random();
    let d = dados.get(nombre);
    if (!d) { d = { s: semilla ^ hashTexto(nombre) }; dados.set(nombre, d); }
    return paso(d);
  };
}
