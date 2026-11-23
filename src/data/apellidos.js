// LOS APELLIDOS DE LOS PILOTOS SIN NOMBRE (23/11/2026, el autor: "ponerle arriba del piloto un apellido random
// argentino, armar un listado de apellidos de Malvinas"). Los numerales genericos (PATRIA 1, PATRIA 2…) llevan
// arriba de la cara uno de estos, sorteado por corrida (render/hud.js drawPiloto).
//
// SON APELLIDOS COMUNES DE LA ARGENTINA, no una lista de combatientes: la regla del juego es no poner nombres de
// personas reales en pantalla (data/libro_vuelo.js), y un apellido sacado de un registro de Malvinas, al lado de una
// cara y un avion, señala a alguien. Estos son los que se repiten en cualquier padron del pais — los de la
// colimba del 82: de origen español, italiano, de las provincias, y algun aleman, sirio-libanes y vasco.
export const APELLIDOS = [
  'GONZÁLEZ', 'RODRÍGUEZ', 'FERNÁNDEZ', 'LÓPEZ', 'MARTÍNEZ', 'GARCÍA', 'PÉREZ', 'GÓMEZ', 'DÍAZ', 'SÁNCHEZ',
  'ROMERO', 'SOSA', 'ÁLVAREZ', 'TORRES', 'RUIZ', 'RAMÍREZ', 'FLORES', 'BENÍTEZ', 'ACOSTA', 'MEDINA',
  'HERRERA', 'SUÁREZ', 'AGUIRRE', 'GIMÉNEZ', 'GUTIÉRREZ', 'PEREYRA', 'ROJAS', 'MOLINA', 'CASTRO', 'ORTIZ',
  'SILVA', 'NÚÑEZ', 'LUNA', 'JUÁREZ', 'CABRERA', 'RÍOS', 'FERREYRA', 'GODOY', 'MORALES', 'DOMÍNGUEZ',
  'MOREIRA', 'PERALTA', 'VEGA', 'CARRIZO', 'QUIROGA', 'CASTILLO', 'LEDESMA', 'MUÑOZ', 'OJEDA', 'PONCE',
  'VERA', 'VÁZQUEZ', 'VILLALBA', 'CARDOZO', 'NAVARRO', 'CORREA', 'FIGUEROA', 'CÁCERES', 'PAZ', 'MANSILLA',
  'ROSSI', 'RUSSO', 'FERRARI', 'BIANCHI', 'COLOMBO', 'ROMANO', 'GALLO', 'RICCI', 'MARINO', 'BRUNO',
  'CHÁVEZ', 'SORIA', 'ARIAS', 'MAIDANA', 'GAUNA', 'CORONEL', 'MIRANDA', 'TOLEDO', 'ESCOBAR', 'ALBORNOZ',
  'ETCHEVERRY', 'IRIGOYEN', 'GOÑI', 'ECHEVERRÍA', 'SCHMIDT', 'MÜLLER', 'HABIB', 'SAADE', 'NAHUEL', 'CATRIEL',
];

// EL APELLIDO DE UN PILOTO EN PANTALLA (23/11): los genericos (PATRIA 1, PILOTO) y —desde el 23/11, el autor: "el piloto
// que no sea Esteban de nombre, que sean apellidos aleatorios argentinos de la epoca"— ESTEBAN y los apodos del libro
// (data/pilotos_generales.js) sortean uno de la lista por corrida, distinto para cada nombre; los personajes con
// nombre propio (TERO, PUMA, el GITANO…) llevan el suyo. La cara sigue saliendo del nombre de adentro.
import { PILOTOS_GENERALES } from './pilotos_generales.js';
const SORTEADOS = new Map();
const GENERALES = new Set(PILOTOS_GENERALES.map(p => p.nombre).concat(['ESTEBAN']));
const generico = n => /^PATRIA \d+$/.test(n) || n === 'PILOTO' || GENERALES.has(n);
export function apellidoDe(nombre) {
  if (!nombre || !generico(nombre)) return nombre;
  if (!SORTEADOS.has(nombre)) {
    const usados = new Set(SORTEADOS.values());
    let a; do a = APELLIDOS[(Math.random() * APELLIDOS.length) | 0]; while (usados.has(a) && usados.size < APELLIDOS.length);
    SORTEADOS.set(nombre, a);
  }
  return SORTEADOS.get(nombre);
}
/** Corrida nueva: los apellidos se vuelven a sortear. */
export function resortearApellidos() { SORTEADOS.clear(); }
