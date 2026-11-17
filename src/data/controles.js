// LA PANTALLA DE CONTROLES, POR CATEGORIAS (17/11, el autor: "la parte de controles tiene que ser mejor
// visualmente, CLARA, y con todo bien segregado: un punto de piruetas y solo mostrar piruetas, otra
// movilidad, y asi"). Antes era una sola tabla de treinta renglones adentro de OPCIONES.
//
// Cada categoria es una pestaña. Las filas son ids de la tabla `ctrl*` de data/strings.js (accion ·
// teclado · joystick): el texto vive ahi, una sola vez, y lo comparten las lecciones. PIRUETAS no tiene
// filas: sale del catalogo de maniobras (data/moves.js), asi que una pirueta nueva aparece sola.
// `notas` son ids de la misma tabla que se leen como aclaracion al pie, no como fila.

export const CTRL_CATEGORIAS = [
  { id: 'movilidad', filas: ['Fly', 'Gas', 'Dive', 'Roll', 'Pan', 'Boost', 'Brake', 'Turn'], notas: ['ctrlHands', 'ctrlArena'] },
  { id: 'armas', filas: ['Gun', 'Msl', 'Secund', 'Tanques', 'Chapitas', 'Aim'], notas: ['ctrlBombs', 'ctrlWasd'] },
  { id: 'piruetas', piruetas: true, notas: ['ctrlPirNota'] },
  { id: 'escuadrilla', filas: ['Chancha', 'Cambio', 'Pips', 'Tempo', 'Cam'], notas: ['ctrlCabinaProx'] },
  { id: 'general', filas: ['Pause', 'Menu', 'Music', 'Inv'], notas: ['ctrlSame', 'ctrlBoth'] },
];
