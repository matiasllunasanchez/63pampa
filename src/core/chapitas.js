// LAS CHAPITAS — el chaff de la maquina de fideos (docs/historia/MEJORAS_PICHON.md §1, CHAPITAS en
// data/tuning.js). La CUENTA, pura: que misil se deja engañar, cual toma la nube, y cuando el soltar
// mas el bajar borran las alarmas del radar. Sin stores ni DOM — la prueba `npm run unit`. El estado
// (cuantas quedan, la nube en el aire, la ventana) vive en systems/chapitas.js.
import { CHAPITAS } from '../data/tuning.js';

/** ¿Lo engaña EL ALUMINIO? Los GUIADOS POR RADAR (CHAPITAS.ENGANA): el Sea Dart y el Sea Wolf. El
 *  Sea Cat es el mismo objeto que el Sea Wolf (`tipo: 'wolf'`) con `def: 'cat'`, pero lo guia un
 *  operador a ojo: el aluminio no le cambia nada. */
export const porRadar = m => !!m && CHAPITAS.ENGANA.includes(m.tipo) && !(m.tipo === 'wolf' && m.def === 'cat');

/** ¿Lo engaña LA BENGALA? El INFRARROJO: el Sidewinder (`aim9`), de frente o de cola, mientras
 *  todavia te sigue (no el que ya te perdio ni el que estalla). */
export const porCalor = m => !!m && m.tipo === 'aim9' && m.fase !== 'perdido' && m.fase !== 'estallido';

/** ¿Lo engaña una carga de chafitas? Cada tubo lleva aluminio Y una bengala: radar o calor. */
export const engaña = m => porRadar(m) || porCalor(m);

/** ¿La nube se lleva a ESTE misil, ahora? Tiene que poder engañarse, seguir vivo y siguiendote
 *  (no ya resuelto, ni detras de un señuelo, ni de otro cebo), y estar a menos de ALCANCE_Z: por
 *  DELANTE el de radar; el de calor de los DOS LADOS — el Sidewinder de LA COLA viene de atras, y la
 *  bengala queda justo ahi. `pz` es la profundidad del avion. */
export function tomaNube(m, pz) {
  if (!engaña(m) || m.done || m.senuelo || m.cebo) return false;
  const dz = m.z - pz;
  return porCalor(m) ? Math.abs(dz) <= CHAPITAS.ALCANCE_Z : dz > 0 && dz <= CHAPITAS.ALCANCE_Z;
}

/** LA NUBE NUEVA, soltada desde el avion en (x, y), apenas detras de la profundidad `pz`. Sale con la
 *  velocidad del avion (`lleva` = 1) y se va quedando atras (ver pasoNube). `vida` en segundos;
 *  cuando llega a cero deja de engañar. Es el mismo objeto que el señuelo de los tanques
 *  espera como `m.cebo` ({ x, y, z }), y por eso la cuenta del misil contra el es una sola. */
export const nubeNueva = (x, y, pz) => ({ x, y, z: pz - 1, vida: CHAPITAS.VIDA, t: 0, lleva: 1, chapitas: true });

/** UN CUADRO DE LA NUBE (devuelve la NUEVA): sale con la velocidad del avion (`lleva` = 1) y el aire
 *  se la come (CHAPITAS.INERCIA), asi que se va quedando atras de a poco; cae despacio, y se apaga. */
export function pasoNube(n, dt, spd) {
  const lleva = n.lleva * Math.exp(-CHAPITAS.INERCIA * dt);
  return { ...n, lleva, z: n.z - spd * (1 - lleva) * dt, y: n.y - 1.5 * dt, t: n.t + dt, vida: n.vida - dt };
}

/** ¿Borra las alarmas? Hacia falta ESTAR VISTO al soltar (`vistoAlSoltar`), y BAJAR DEL RADAR
 *  (`bajoTecho`) antes de que se cierre la ventana (`desde` = segundos desde que se solto). Las dos
 *  cosas: soltar arriba sin bajar no esconde nada (seguis ahi, a la vista), y bajar sin soltar es
 *  el escondite de siempre — lento (las estrellas se pierden de a una, systems/estrellas.js). */
export const borraAlarmas = ({ vistoAlSoltar, bajoTecho, desde }) =>
  !!vistoAlSoltar && !!bajoTecho && desde >= 0 && desde <= CHAPITAS.VENTANA;
