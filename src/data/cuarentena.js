// LA CUARENTENA — que partes del juego estan APARTADAS, y por que.
//
// Decision del 18/8/2026, PLAN_REFACTOR §4b: MINUTOS SAGRADOS (el ARENA) y PASADAS MORTALES
// quedan fuera del menu y de todo flujo de campaña/ciclo **sin borrarse**. Sus modulos siguen
// en el repo, compilando, y sus fixtures siguen verdes — eso es lo que evita que se pudran
// mientras esperan. La hipotesis a explorar despues es incorporarlos como modulos de una
// mision (un tramo, o un climax opcional), y el registro de fases de RF3 es lo que lo abarata.
//
// ESTO ES LA UNICA PERILLA. Sacar una entrada de estas listas revive la parte entera: no hay
// que buscar `if`s por el codigo, ni recordar que misiones decian `climax: 'arena'` — el dato
// de autor sigue intacto en data/missions.js y vuelve solo. Es la prueba de que la cuarentena
// es DATO y no una cirugia.

/** Climax apartados (`climax` de data/missions.js). Una mision que declare uno de estos juega
 *  el SUPLENTE en su lugar, y conserva su declaracion original para cuando la cuarentena caiga. */
export const CLIMAX_EN_CUARENTENA = ['arena', 'pasada'];

/** El climax que se juega mientras tanto. EL PULSO es el unico climax fuera de cuarentena. */
export const CLIMAX_SUPLENTE = 'pulso';

/** Modos apartados del menu JUEGO RAPIDO (los `id` de `quickRows` en game.js). No se les toca
 *  el codigo: dejan de tener una fila desde donde entrar. Las sondas y el catalogo de PRUEBAS
 *  siguen llegando (`?pasada=`, `__prb('arena')`, `npm run pasada`) — a proposito: son la red
 *  que avisa si algo de lo apartado se rompe. */
export const MODOS_EN_CUARENTENA = ['arena', 'pasadas'];

export const climaxEnCuarentena = c => CLIMAX_EN_CUARENTENA.includes(c);
export const modoEnCuarentena = id => MODOS_EN_CUARENTENA.includes(id);
