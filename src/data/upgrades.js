// EL BANCO DEL PICHON (GUION_2 §2c): las mejoras de campaña son una persona. Datos puros.
//
// Cada mejora desbloquea UNA pirueta de data/moves.js — en campaña los combos no aprendidos
// no disparan (gate en el dispatcher de game.js); en los demas modos rige cfg.moves como
// siempre. El TONEL clasico no esta aca: viene puesto de fabrica ("ya la trae puesta: es lo
// primero que le muestra a Esteban").
//
// El orden es el orden CAUSAL del guion: cada maniobra la inventa el Pichon para resolver
// el problema que la escuadrilla acaba de sufrir. Entre mision y mision se OFRECEN las dos
// primeras no aprendidas y se elige UNA (roguelike-lite): las no elegidas quedan esperando.
// Con 11 huecos y 12 mejoras, una queda sin aprender por partida.
//
// A partir de M8 (muerto el Pichon) la pantalla cambia de nombre: las mejoras salen de su
// libreta y las construye el Turco solo. Eso lo decide game.js por el indice de mision;
// aca no hay estado.
//
//   id    → clave de MOVES (data/moves.js)
//   name  → nombre en pantalla (sin acentos: es UI)
//   seq   → el combo, como se teclea (para la tarjeta)
//   desc  → que hace, en una linea
//   quote → la voz de la dupla (Pichon vivo) o de la libreta (M8+)
export const UPGRADES = [
  { id: 'mask', name: 'TERRAIN MASKING', seq: 'abajo abajo-abajo', desc: 'Clava el avion a ras: congela el roce y descarga el radar', quote: 'Si abajo no nos ven... por que subimos?' },
  { id: 'splits', name: 'SPLIT-S', seq: 'arriba abajo abajo (alto)', desc: 'Medio tonel y picada: la salida vertical hacia abajo', quote: 'Necesitaba una forma de irse para abajo YA.' },
  { id: 'breakt', name: 'BREAK TURN', seq: 'abajo izq izq / abajo der der', desc: 'Viraje quebrado: tiron lateral violento', quote: 'La escolta casi nos engancha de costado.' },
  { id: 'loyo', name: 'LOW YO-YO', seq: 'abajo arriba abajo', desc: 'Pica y remonta: altura convertida en velocidad', quote: 'Salir vivo es cuestion de nudos.' },
  { id: 'sturn', name: 'S-TURN', seq: 'izq der izq', desc: 'Barrido en S: esquiva sin perder el carril', quote: 'Abrirse y volver, como al costado del arco.' },
  { id: 'popup', name: 'POP-UP', seq: 'abajo arriba arriba (bajo)', desc: 'Trepada brusca de ataque desde rasante', quote: 'Nunca mas sin poder mirar hacia arriba.' },
  { id: 'hiyo', name: 'HIGH YO-YO', seq: 'arriba abajo arriba', desc: 'Sube, cuelga y recae: esquive vertical', quote: 'Colgarse arriba y dejar que pase de largo.' },
  { id: 'jink', name: 'JINK', seq: 'arriba izq der', desc: 'Zigzag de esquive: 4 quiebres impredecibles', quote: 'Copie como vuela usted cuando esta desesperado, Tero.' },
  { id: 'spin', name: 'TIRABUZON', seq: 'picar + rolar (der) izq izq', desc: 'Rola sobre su eje picando', quote: 'La dejo a medio explicar. El Turco la termino esa noche.' },
  { id: 'climb', name: 'ASCENSO', seq: 'mirar arriba + arriba arriba', desc: 'Trepa hasta el techo del radar y lo sostiene', quote: 'Pagina 14 de la libreta.' },
  { id: 'climbmax', name: 'SOBRE EL RADAR', seq: 'igual, ya contra el radar', desc: 'Cruza el techo: expuesto, pero llegas', quote: 'Peligroso, pero si hay que llegar a algun lado...' },
  { id: 'barrel', name: 'TONEL BARRIL', seq: 'rolar: abajo der arriba izq', desc: 'La O grande: vuelve al punto exacto', quote: 'Para cuando haya que volver a buscar a alguien.' },
];

/** Las proximas `n` mejoras NO aprendidas, en orden del guion. `owned` = Set/array de ids. */
export function nextUpgrades(owned, n) {
  const has = id => owned.includes ? owned.includes(id) : owned.has(id);
  return UPGRADES.filter(u => !has(u.id)).slice(0, n);
}
