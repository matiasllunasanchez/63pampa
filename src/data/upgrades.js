// EL BANCO DEL PICHON (GUION_2 §2c): las mejoras de campaña son una persona. Datos puros.
//
// Cada mejora desbloquea UNA pirueta de data/moves.js — en campaña los combos no aprendidos
// no disparan (gate en el dispatcher de game.js); en los demas modos rige cfg.moves como
// siempre. El TONEL clasico no esta aca: viene puesto de fabrica ("ya la trae puesta: es lo
// primero que le muestra a Esteban").
//
// El orden es el orden CAUSAL del guion: cada maniobra la inventa el Pichon para resolver
// el problema que la escuadrilla acaba de sufrir. Entre mision y mision se OFRECEN las primeras
// no aprendidas y se elige UNA (roguelike-lite): las no elegidas quedan esperando. CUANTAS se
// ofrecen y desde cuando se puede elegir lo dice `ofertaTrasMision`, mas abajo — el tutorial no
// entrega nada y la segunda mision sirve una sin elegir. Con 10 ventanas y 12 mejoras, DOS quedan
// sin aprender por partida.
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

/** ¿Puede SALIR esta pirueta? Son dos preguntas distintas que se responden juntas porque quien
 *  juega las vive como una sola: TENERLA (en campaña se gana una por mision) y QUERERLA (MEJORAS
 *  DEL PICHON las prende y las apaga desde el menu). Fuera de campaña se tienen todas.
 *
 *  Vive aca y no en game.js para poder probarla: es la unica regla del banco que, si se rompe,
 *  no da error ni se ve — simplemente una pirueta deja de salir y parece que el combo no anda.
 *
 *  `off` es un objeto usado como conjunto (cfg.movesOff): la clave presente = apagada. */
export function moveAllowed(id, { campaign, owned, off }) {
  if (off && off[id]) return false;              // apagada a mano: no sale nunca, la tengas o no
  if (!campaign) return true;
  return !!owned && (owned.includes ? owned.includes(id) : owned.has(id));
}

// ---------- CUANDO SE ENTREGA UNA MEJORA, Y SI SE ELIGE ----------
// LA RAMPA DE ENTRADA (pedido de Matias, 23/8). Antes el banco se abria en el epilogo de TODAS
// las misiones y siempre con dos cartas: o sea que la primera decision del juego —cual de dos
// piruetas aprender— caia justo despues del TUTORIAL, cuando el jugador todavia no sabe que es
// una pirueta ni para que sirve ninguna de las dos. Elegir sin entender no es elegir: es apretar.
//
// Ahora la campaña ENSEÑA el mecanismo antes de pedir que se use:
//
//   m1 (tutorial) → NADA.  El avion de fabrica y nada mas. Que el tutorial no premie es parte de
//                          lo que dice: todavia no paso nada que resolver.
//   m2            → UNA, SIN ELEGIR. El Pichon te pasa la primera. La pantalla es la misma, con
//                          una sola carta: se aprende QUE es el banco sin tener que decidir.
//   m3 en adelante→ DOS, a elegir. Recien aca empieza el roguelike, con una pirueta ya en la mano
//                          para comparar contra la que se ofrece.
//
// ⚠ CON 14 MISIONES LA CUENTA CAMBIO (guion 3.0, 24/8). Antes eran 12 misiones para 12 mejoras
// y quedaban DOS sin aprender por partida. Ahora hay 14 misiones: con la misma regla habria 13
// ventanas de entrega para 12 mejoras, o sea que el banco se quedaria SIN CARTAS antes del final
// y las dos ultimas misiones no entregarian nada — sin que nada avise, porque `nextUpgrades`
// devuelve lista vacia y la pantalla no se abre.
//
// La regla nueva mete UNA SEGUNDA MISION SIN ENTREGA, y no es un parche numerico: es la m10,
// LOS PRIMOS. Es la unica mision de la campaña donde no se pelea contra nadie —el enemigo es el
// clima, la nafta y el lugar vacio del Pichon— y es ademas la primera despues de su muerte. Que
// el banco no se abra ahi DICE algo: el que inventaba las mejoras no esta, y esa noche no hay
// nada nuevo que aprender. Vuelve a abrirse en m11, ya con el Turco solo.
//
// Quedan 12 ventanas para 12 mejoras: se aprenden TODAS por partida, que es la otra diferencia
// con el esquema viejo. Si se quiere volver a dejar alguna sin aprender, la perilla es esta
// funcion o el largo de UPGRADES — no un parche en game.js.
//
// Devuelve CUANTAS cartas ofrece el epilogo de la mision `i` (0-based). Cero = el banco ni se abre.
// Es la unica regla del ritmo del banco y vive aca, no en game.js, por dos motivos: se puede
// probar, y `loadoutAt` la deriva en vez de repetirla — si estuviera escrita dos veces, el
// selector de misiones mostraria un loadout que la campaña no entrega.
export const SIN_ENTREGA = 9;      // m10 LOS PRIMOS, 0-based: la mision sin banco (ver arriba)

export function ofertaTrasMision(i) {
  if ((i | 0) <= 0) return 0;              // el tutorial no entrega
  if ((i | 0) === SIN_ENTREGA) return 0;   // la noche sin el Pichon tampoco
  if ((i | 0) === 1) return 1;             // la segunda entrega una, servida
  return 2;                                // de la tercera en adelante, se elige
}

/** Las proximas `n` mejoras NO aprendidas, en orden del guion. `owned` = Set/array de ids. */
export function nextUpgrades(owned, n) {
  const has = id => owned.includes ? owned.includes(id) : owned.has(id);
  return UPGRADES.filter(u => !has(u.id)).slice(0, n);
}

// ---------- EL LOADOUT DE REFERENCIA (PLAN_MISIONES_FASES §1, el selector "real real") ----------
// Cuantas mejoras tendria un jugador REAL al entrar a la mision `i`, y cuales.
//
// La cuenta sale del flujo de campaña y no de una tabla escrita a mano: se recorre el mismo
// `ofertaTrasMision` que usa la campaña de verdad y se cuentan las ventanas que SI entregaron.
// Con la rampa de entrada (m1 nada, m2 una servida, m3+ a elegir) al entrar a la mision `i` se
// tienen `i - 1` mejoras, y con 12 misiones quedan DOS sin aprender por partida.
//
// ⚠ ERAN UNA. El guion (§5 de GUION_3) dice "una queda sin aprender por partida" y esa cuenta
// salia de 11 ventanas para 12 mejoras. La rampa saca una ventana —la del tutorial— asi que ahora
// son dos. Es consecuencia directa del pedido, no un descuido; si se quiere volver a una, la
// perilla es esta funcion (o el largo de UPGRADES), no un parche en game.js.
//
// QUE mejoras: las `n` PRIMERAS del orden causal, que es el orden en que el guion las inventa
// (el Pichon las saca del problema que la escuadrilla acaba de sufrir). Son ademas las mas
// basicas — TERRAIN MASKING antes que el TONEL BARRIL — asi que "las primeras" y "las que un
// jugador tendria" son la misma lista, y por eso alcanza una sola funcion.
//
// Es una APROXIMACION declarada, no una simulacion: en una partida real el jugador elige UNA de
// DOS por ventana, asi que su lista puede diferir. Lo que esta funcion garantiza es lo que el
// selector necesita — volar la mision con la CANTIDAD correcta de piruetas y con las que el guion
// ya presento, en vez de con las doce (irreal) o con ninguna (tambien irreal).
//
// El dia que las ofertas sean al azar (DISENO_MISIONES §5, tarea U), ESTA funcion es el unico
// lugar donde cambia la regla.
export function loadoutAt(i) {
  let n = 0;
  for (let j = 0; j < Math.max(0, i | 0); j++) if (ofertaTrasMision(j) > 0) n++;
  return UPGRADES.slice(0, Math.min(n, UPGRADES.length)).map(u => u.id);
}
