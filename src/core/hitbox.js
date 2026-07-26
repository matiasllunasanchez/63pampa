// CAJAS DE COLISION. Una sola fuente para el que DECIDE el choque (systems/collision.js) y el que
// las DIBUJA (el overlay de depuracion en render/world.js).
//
// Por que vive aparte: un overlay de hitboxes que copie los numeros a mano es peor que no tenerlo
// — te muestra una caja y el juego usa otra, y te pasas la tarde persiguiendo un fantasma. Con
// esto, si alguien cambia un ancho, cambian los dos lados o no cambia ninguno.
//
// Todas las medidas son SEMI-ejes (medio ancho / media altura) en unidades de MUNDO.

// obstaculos VERTICALES fijos: se colisionan de la base a la punta.
//
// La FRAGATA ('mast') ESTUVO ACA y ya no: cuando era un palo de 11 a 28 metros, "de la base a la
// punta" era exactamente lo que hacia falta. Al sacarle el palo (queda el buque con su luz roja)
// dejo de ser algo vertical y paso a ser una estructura apoyada en el agua — ver STRUCT.
const TALL = ['tree', 'tower', 'flag', 'poles', 'cliff'];
// los POSTES son anchos: lo peligroso es el CABLE tendido entre ellos, no el palo
const TALL_HW = { tree: 1.4, tower: 1.6, flag: 0.8, poles: 6.5 };

// ESTRUCTURAS apoyadas en el suelo (o en el agua): cajas con el centro a h/2.
// 'mast' es la FRAGATA del mar abierto. Su semi-ancho es el del CASTILLO (la superestructura),
// que es lo unico que sobresale arriba; el casco, que es mucho mas ancho, lo cubre el barrido de
// hullReach por debajo de HULL_Y. Modelarlo con un solo ancho daria un barco con forma de caja.
const STRUCT = ['tent', 'aa', 'bldg', 'lcu', 'radar', 'aatruck', 'depot', 'mast'];
const STRUCT_HW = { tent: 2.4, aa: 1.7, bldg: 3.0, lcu: 3.6, radar: 2.4, aatruck: 2.6, depot: 3.4, mast: 2.0 };

const AIR = ['helo', 'jet'];

export const isTall = t => TALL.indexOf(t) >= 0;
export const isStruct = t => STRUCT.indexOf(t) >= 0;
export const isAir = t => AIR.indexOf(t) >= 0;

/** Caja del obstaculo `o`: { hw, hh, oy } — semi-ancho, semi-alto y centro vertical. */
export function hitbox(o) {
  if (isTall(o.type)) {
    // el ACANTILADO trae SU ancho (cada uno se sortea distinto), asi que no sale de la tabla
    return { hw: o.type === 'cliff' ? o.hw : TALL_HW[o.type], hh: o.h, oy: o.h / 2 };
  }
  if (isStruct(o.type)) return { hw: STRUCT_HW[o.type], hh: o.h / 2 + 0.4, oy: o.h / 2 };
  const air = isAir(o.type);
  return { hw: air ? 3 : 2.6, hh: air ? 1.6 : 1.9, oy: o.y };
}

/** Perfil del AVION. En PIRUETA las alas van de canto → perfil minimo: pasa por espacios mas finos. */
export function planeBox(rolling) {
  return rolling ? { pw: 1.0, ph: 0.7 } : { pw: 2.1, ph: 1.0 };
}

/** A ras del suelo el casco barre ancho y engancha lo vertical aunque el centro no coincida.
 *  Devuelve el semi-ancho de ese barrido, o 0 si al tipo no le aplica. */
export function hullReach(o, hw) {
  // la FRAGATA es el caso original de este barrido y por eso se llama "casco": el buque mide 11
  // unidades de eslora visible pero arriba solo asoma el castillo (STRUCT_HW.mast = 2). Sin esto,
  // pasar a ras del agua por encima de la cubierta no chocaria nada.
  if (o.type === 'mast') return 5;
  if (!isTall(o.type)) return 0;
  // el acantilado usa SU ancho + el pedregal del pie: con el 5 fijo mataba de lejos, fuera de la
  // roca dibujada (una muerte invisible)
  return o.type === 'cliff' ? hw + 1.2 : 5;
}
export const HULL_Y = 3.6;   // altura por debajo de la cual actua el barrido del casco

/** SOLDADO atropellado. `hw` es el CUERPO del soldado, no el alcance del atropello: al chequear
 *  se le suma la semi-envergadura del avion (planeBox), igual que con los obstaculos.
 *  Antes era un 4 fijo que ya incluia el avion — la caja se veia enorme al lado del sprite y el
 *  pase rasante "barria" soldados que visiblemente pasaban al costado. Modelado asi, ademas, la
 *  PIRUETA afina el barrido como en todo el resto del juego. */
export const SOLDIER = { hw: 0.6, top: 2.2, zBack: 2, zFront: 1 };

// COSAS CHICAS: lo que es del tamaño de un soldado no derriba — DAÑA. Si se puede bajar a
// arrasar infanteria en vuelo rasante, un nido de ametralladoras no puede hacer explotar el
// avion: seria incoherente y el jugador no sabria cuando es seguro bajar.
// Regla: estructura apoyada en el suelo mas baja que SOFT_H. Se decide por ALTURA y no por una
// lista de tipos, asi un obstaculo nuevo entra solo en la categoria que le corresponde.
export const SOFT_H = 4.8;
// Los BUQUES quedan afuera por NOMBRE y no por altura: una barcaza de desembarco y una fragata
// son miles de toneladas de acero, y meterles el avion adentro tiene que matar aunque el numero
// de altura diga que son bajitas. Confiar solo en SOFT_H seria dejar armada la trampa de que
// bajarle 2 metros a la fragata la convierta, muda, en un golpecito no letal.
const SHIPS = ['lcu', 'mast'];
export const isSoftStruct = o => isStruct(o.type) && SHIPS.indexOf(o.type) < 0 && o.h <= SOFT_H;
