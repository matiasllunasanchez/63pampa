// LAS PATRULLAS DE SEA HARRIER — cuantos te toman la cola y cuanto se quedan (pedido del autor
// 3/10/2026): "los Harriers en general montaban patrullas de a dos, asi que van a venir de a 2,
// tiran sus misiles, disparan y se van —o mueren— y al rato otros dos, y asi. Salvo donde yo diga:
// en la ultima mision vamos a meter muchos mas Harriers que de costumbre".
//
// Lo lee el director de LA COLA (systems/caza.js, `cazaDirector`). Antes los Harrier ciclaban sin
// fin hasta que los bajaras o ahuyentaras, y se iban acumulando —con las estrellas— hasta cuatro.
//
//   PARES  cuantas parejas pueden estar en tu cola A LA VEZ, por defecto. La mision lo pisa con
//          `harriers: { pares: N }` en su renglon de data/missions.js.
//   GAP    segundos entre que se va (o cae) una pareja y llega la siguiente. Las estrellas de
//          busqueda lo acortan —el radar encima te los manda antes—, pero no traen mas a la vez.
//   ESCALON  con lugar para mas de una pareja (la mision pidio varias), cada cuantos segundos entra
//          la siguiente: llegan escalonadas, no todas juntas, y no esperan el GAP.
//   PASES  pasadas que hace cada Harrier antes de irse aunque le quede algun Sidewinder: la
//          patrulla no se queda de estacion en tu cola. El que ya tiro los dos se va al terminar
//          su pasada, haya hecho las que haya hecho.
export const PATRULLA = { PARES: 1, GAP: [20, 35], ESCALON: [6, 10], PASES: 2 };

/** Cuantas parejas a la vez trae la mision `m` (fuera de una mision, las de siempre). */
export const paresDe = m => (m && m.harriers && m.harriers.pares > 0 ? m.harriers.pares : PATRULLA.PARES);
