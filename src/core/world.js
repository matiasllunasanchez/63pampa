// ENTIDADES DEL MUNDO: todo lo que vive, se mueve y muere dentro de una corrida.
//
// Cada array lo LLENA un sistema y lo LEEN varios: spawn crea obstaculos, colision los mata,
// el render los dibuja. Por eso viven aca y no dentro de un sistema.
//
// LA REGLA (la misma que en core/state.js): estos arrays NUNCA se reasignan, solo se mutan.
// Se comparten por referencia entre modulos, asi que un `obstacles = obstacles.filter(...)`
// dejaria a los demas modulos leyendo el array viejo — el juego seguiria andando y dibujando
// obstaculos fantasma. Para filtrar esta prune(); para vaciar, clear().
// tools/lint_state.js vigila que no se reasignen.

export const obstacles = [];   // mastiles, globos, helicopteros, cazas y bidones de combustible
export const soldiers = [];    // infanteria en tierra (array propio: atropellarlos NO mata al avion)
export const bullets = [];     // canon del jugador
export const missiles = [];    // misiles ENEMIGOS (estos si matan)
export const pmissiles = [];   // misiles DEL JUGADOR (nunca se chequean contra el hitbox propio)
export const parts = [];       // particulas: chispas, rocio, polvo, sangre, humo
export const popups = [];      // textos flotantes de puntaje
export const streaks = [];     // lineas de velocidad radiales
export const wake = [];        // estela sobre el agua
export const gusts = [];       // rafagas de viento cruzando el cielo

/** Filtra EN EL LUGAR: conserva los elementos que cumplen `keep` y descarta el resto.
 *  Reemplaza a `arr = arr.filter(keep)`, que rompia la identidad del array.
 *  Compacta hacia adelante en una sola pasada: mismo costo que filter, sin asignar. */
export function prune(arr, keep) {
  let n = 0;
  for (let i = 0; i < arr.length; i++) if (keep(arr[i])) arr[n++] = arr[i];
  arr.length = n;
  return arr;
}

/** Vacia el campo de juego. `keepFx` conserva las particulas y los textos flotantes, que es lo
 *  que hace falta al entrar al MOMENTUM: se limpian los obstaculos para la cinematica pero las
 *  explosiones en curso tienen que terminar de dibujarse. */
export function clearWorld({ keepFx = false } = {}) {
  for (const a of [obstacles, soldiers, bullets, missiles, pmissiles, streaks, gusts]) a.length = 0;
  if (!keepFx) for (const a of [parts, popups, wake]) a.length = 0;
}
