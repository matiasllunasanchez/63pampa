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
  // LA «CONFIGURACION INDIA» DEL DAGGER (12/10, el autor: "llevaban 3 tanques y bombas en un mismo
  // espacio"): los tanques en el ala interna y en la panza, y las dos bombas de 250 kg en el ala MEDIA,
  // al lado de los tanques, cada una en su soporte. Es el TERCER punto (`ext`, el par del ala media),
  // que solo tiene el Dagger: `avion` dice de quien es — otro avion no la puede colgar.
  { id: 'india', ala: 'tanque', centro: 'tanque', ext: 'bomba', avion: 'dagger', es: 'INDIA: 3 TANQUES + 2 BOMBAS', en: 'INDIA: 3 TANKS + 2 BOMBS' },
  // LA CARGA DEL 4 DE MAYO DEL SUPER ETENDARD (14/10, el autor: "en la mision de test del Super Etendard
  // no tiene puesto el Exocet debajo del ala"): el Exocet AM39 bajo el ala DERECHA y un tanque de 1.100 l
  // bajo la IZQUIERDA (`babor`), cada uno en su capa horneada. El tanque se suelta como los otros.
  { id: 'exocet', ala: null, centro: null, exocet: true, babor: 'tanque', avion: 'supere', es: 'EXOCET AM39 + 1 TANQUE', en: 'EXOCET AM39 + 1 TANK' },
  // EL HERCULES BOMBARDERO (16/10, el autor: "llevaba hasta 12 bombas de 250 kg o 6 de 500 kg"): los
  // dos afustes bajo la raiz del ala, con un MER de seis bombas cada uno; cada carga en su capa horneada (`herc`: 'carga_herc_<herc>').
  // `bombasN` cuantas cuelgan; `buqueN` cuantas de esas son DEL BUQUE (salen solo con el buque a tiro,
  // como la del centro de los cazas) — el resto se tira donde sea, como las del ala.
  { id: 'herc_250', ala: null, centro: null, herc: '250', bombasN: 12, buqueN: 4, avion: 'herc', es: '12 BOMBAS DE 250 KG', en: '12 x 250 KG BOMBS' },
  { id: 'herc_500', ala: null, centro: null, herc: '500', bombasN: 6, buqueN: 2, avion: 'herc', es: '6 BOMBAS DE 500 KG', en: '6 x 500 KG BOMBS' },
];

/** LA CARGA PROPIA DE CADA AVION, la que sale si nadie eligio otra (12/10). Fuera de la campaña no hay
 *  hangar, y el Dagger volaba con la India: es la suya. (La campaña vuela A-4B.) */
export const CARGA_PROPIA = { dagger: 'india', supere: 'exocet', herc: 'herc_250' };

/** La carga que cuelga de verdad el avion `key` si se pidio `id`: una carga de OTRO avion no se puede
 *  colgar (vuelve la base), y la base se cambia por la propia del avion si tiene una. */
export function cargaParaAvion(id, key) {
  const c = cargaDe(id);
  if (c.avion && c.avion !== key) return CAPAS_SOLO[key] ? CARGA_PROPIA[key] : CARGA_BASE;
  if (CAPAS_SOLO[key] && c.avion !== key) return CARGA_PROPIA[key];   // el Hercules no tiene pilones de caza
  if (c.id === CARGA_BASE && CARGA_PROPIA[key]) return CARGA_PROPIA[key];
  return c.id;
}

/** LA CARGA BASE, la que trae todo avion si nadie eligio nada. Palabra del autor: "la
 *  configuracion mas basica es 2 tanques y una bomba". */
export const CARGA_BASE = 'tanques_bomba';

/** LAS QUE SE ELIGEN EN EL HANGAR (PLAN_NAFTA_ALCANCE N7), en el orden de la pantalla. Son las tres
 *  configuraciones reales que trajo el autor: "3 bombas, o solo una bomba sin tanques, o solo una
 *  bomba con 2 tanques". Las tres llevan la bomba del centro, asi que la del buque nunca falta. */
export const CARGAS_ELEGIBLES = ['tanques_bomba', 'tres_bombas', 'bomba'];

/** DESDE QUE MISION DE CAMPAÑA se elige (indice: 2 = M3, decision del autor 24/9). Antes sale la
 *  BASE: en M1 no hay bombas propias y en M2 el objetivo se revienta a cañon. */
export const CARGA_ELEGIBLE_DESDE = 2;

/** Las cuatro capas horneadas, en el orden en que se pintan (primero lo del ala, despues lo del
 *  centro: el pilon central cuelga del fuselaje y queda por delante de las alas). */
export const CAPAS_CARGA = ['carga_tanques_ala', 'carga_bombas_ala', 'carga_tanque_centro', 'carga_bomba_centro'];
/** Las capas que solo hornea un avion (tools/blender/hornear_todo.py, CAPAS_EXTRA): el ala media del Dagger. */
export const CAPAS_EXTRA = { dagger: ['carga_bombas_ext'], supere: ['carga_tanque_babor', 'carga_exocet'] };
/** Los aviones que NO tienen los pilones de los cazas: solo cuelgan sus capas propias (el Hercules). */
export const CAPAS_SOLO = { herc: ['carga_herc_250', 'carga_herc_500'] };
/** Las capas que se cargan para el avion `key`. */
export const capasAvion = key => CAPAS_SOLO[key] || CAPAS_CARGA.concat(CAPAS_EXTRA[key] || []);

export const cargaDe = id => CARGAS.find(c => c.id === id) || CARGAS.find(c => c.id === CARGA_BASE);

/** Que capas se pintan para la carga `id`. */
export function capasDe(id) {
  const c = cargaDe(id), out = [];
  if (c.ala) out.push(c.ala === 'tanque' ? 'carga_tanques_ala' : 'carga_bombas_ala');
  if (c.ext === 'bomba') out.push('carga_bombas_ext');   // el ala media va despues del ala, antes del centro
  if (c.babor === 'tanque') out.push('carga_tanque_babor');   // la carga del Super Etendard (un ala cada una)
  if (c.exocet) out.push('carga_exocet');
  if (c.herc) out.push('carga_herc_' + c.herc);
  if (c.centro) out.push(c.centro === 'tanque' ? 'carga_tanque_centro' : 'carga_bomba_centro');
  return out;
}

/** Cuantas bombas lleva la carga `id`: el par de ala cuenta dos. */
export const bombasDe = id => { const c = cargaDe(id); if (c.bombasN) return c.bombasN; return (c.ala === 'bomba' ? 2 : 0) + (c.ext === 'bomba' ? 2 : 0) + (c.centro === 'bomba' ? 1 : 0); };
/** Cuantos tanques lleva la carga `id`. */
export const tanquesDe = id => { const c = cargaDe(id); return (c.ala === 'tanque' ? 2 : 0) + (c.babor === 'tanque' ? 1 : 0) + (c.centro === 'tanque' ? 1 : 0); };

/** LA BOMBA DEL BUQUE (LA SUELTA, pedido del autor 23/9): en las misiones contra un buque TODO avion
 *  del escuadron lleva la bomba del CENTRO, "porque todos tienen que poder tirar la bomba que
 *  derrota al barco". El ala se respeta (tanques, bombas o nada); el centro se fuerza a bomba.
 *  Devuelve el id de la carga que resulta. */
export function conBombaCentral(id) {
  const c = cargaDe(id);
  if (c.centro === 'bomba') return c.id;
  // …LA INDIA YA LLEVA LAS DEL BUQUE: en el ala media (systems/blanco.js las cuenta como del centro)
  if (c.ext === 'bomba') return c.id;
  // …Y EL SUPER ETENDARD LLEVA SU EXOCET: es su arma contra el buque (systems/blanco.js lo cuenta como
  // la del centro, y al soltarlo deja de dibujarse — render/plane.js)
  if (c.exocet) return c.id;
  // …Y EL HERCULES lleva las del buque en sus racks (`buqueN`)
  if (c.herc) return c.id;
  const x = CARGAS.find(k => k.ala === c.ala && k.centro === 'bomba');
  return x ? x.id : CARGA_BASE;
}
