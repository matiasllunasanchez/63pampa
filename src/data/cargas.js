// LA CARGA DE LOS AVIONES — que cuelga de cada punto de carga.
//
// Cada avion tiene DOS puntos: el PAR de pilones de ala (siempre simetrico) y el pilon central,
// bajo el fuselaje. En cada uno va nada, un tanque o una bomba: nueve combinaciones.
//
// NO HAY UNA HOJA POR COMBINACION. Cada pieza esta horneada en su propia CAPA, con la misma camara
// y las mismas poses que el avion (tools/bake_planes.html, `hornearCapas`), y el avion ya viene de
// fabrica tapando lo que tiene que tapar. El juego pinta el avion y encima las capas de la carga
// elegida: las nueve combinaciones se ARMAN con cuatro capas.

/** El catalogo, en el orden en que se ofrece. `ala` y `centro` valen null, 'tanque' o 'bomba'.
 *  LAS DOS PRIMERAS SON LAS BASE, palabra del autor: "2 tanques y una bomba, o 3 bombas". Las dos
 *  llevan al menos una bomba, porque la ultima queda reservada para el climax. */
export const CARGAS = [
  { id: 'tanques_bomba', ala: 'tanque', centro: 'bomba',  es: '2 TANQUES + BOMBA', en: '2 TANKS + BOMB' },
  { id: 'tres_bombas',   ala: 'bomba',  centro: 'bomba',  es: '3 BOMBAS',          en: '3 BOMBS' },
  { id: 'nada',          ala: null,     centro: null,     es: 'SIN CARGA',         en: 'CLEAN' },
  { id: 'tanques',       ala: 'tanque', centro: null,     es: '2 TANQUES',         en: '2 TANKS' },
  { id: 'tres_tanques',  ala: 'tanque', centro: 'tanque', es: '3 TANQUES',         en: '3 TANKS' },
  { id: 'bomba',         ala: null,     centro: 'bomba',  es: '1 BOMBA',           en: '1 BOMB' },
  { id: 'dos_bombas',    ala: 'bomba',  centro: null,     es: '2 BOMBAS',          en: '2 BOMBS' },
  { id: 'bombas_tanque', ala: 'bomba',  centro: 'tanque', es: '2 BOMBAS + TANQUE', en: '2 BOMBS + TANK' },
  { id: 'tanque',        ala: null,     centro: 'tanque', es: '1 TANQUE',          en: '1 TANK' },
];

/** LA CARGA BASE, la que trae todo avion si nadie eligio nada. Palabra del autor: "la
 *  configuracion mas basica es 2 tanques y una bomba". */
export const CARGA_BASE = 'tanques_bomba';

/** Las cuatro capas horneadas, en el orden en que se pintan (primero lo del ala, despues lo del
 *  centro: el pilon central cuelga del fuselaje y queda por delante de las alas). */
export const CAPAS_CARGA = ['carga_tanques_ala', 'carga_bombas_ala', 'carga_tanque_centro', 'carga_bomba_centro'];

export const cargaDe = id => CARGAS.find(c => c.id === id) || CARGAS.find(c => c.id === CARGA_BASE);

/** Que capas se pintan para la carga `id`. */
export function capasDe(id) {
  const c = cargaDe(id), out = [];
  if (c.ala) out.push(c.ala === 'tanque' ? 'carga_tanques_ala' : 'carga_bombas_ala');
  if (c.centro) out.push(c.centro === 'tanque' ? 'carga_tanque_centro' : 'carga_bomba_centro');
  return out;
}

/** Cuantas bombas lleva la carga `id`: el par de ala cuenta dos. */
export const bombasDe = id => { const c = cargaDe(id); return (c.ala === 'bomba' ? 2 : 0) + (c.centro === 'bomba' ? 1 : 0); };
/** Cuantos tanques lleva la carga `id`. */
export const tanquesDe = id => { const c = cargaDe(id); return (c.ala === 'tanque' ? 2 : 0) + (c.centro === 'tanque' ? 1 : 0); };

/** LA BOMBA DEL BUQUE (LA SUELTA, pedido del autor 23/9): en las misiones contra un buque TODO avion
 *  del escuadron lleva la bomba del CENTRO, "porque todos tienen que poder tirar la bomba que
 *  derrota al barco". El ala se respeta (tanques, bombas o nada); el centro se fuerza a bomba.
 *  Devuelve el id de la carga que resulta. */
export function conBombaCentral(id) {
  const c = cargaDe(id);
  if (c.centro === 'bomba') return c.id;
  const x = CARGAS.find(k => k.ala === c.ala && k.centro === 'bomba');
  return x ? x.id : CARGA_BASE;
}
