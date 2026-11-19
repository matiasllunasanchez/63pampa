// LOS PILOTOS GENERALES (17/11, el autor): los que vuelan en el LIBRO DE VUELO —antes todos "PILOTO" con
// la cara de Esteban—. "Los pilotos hay que variar entre los que tenemos… de ultima usemos todos los que
// tenemos, y despues agrego un lote mas grande de pilotos generales para libro de vuelo y por la patria,
// para no usar los de la campaña". Hasta ese lote, las caras son las que hay: el Criollo y los retratos
// del elenco. LOS NOMBRES SON APODOS INVENTADOS de la epoca, nunca de una persona real (la regla del libro:
// sin nombres reales en pantalla). Cuando llegue el lote nuevo, se cambia esta lista y nada mas.
//
// `caras` va gesto por gesto (los cinco de data/gestos.js), como PILOTOS_AVION.

const de = base => ({ neutro: base + '_neutro', sonrisa: base + '_sonrisa', preocupado: base + '_preocupado', ceno: base + '_ceno', roto: base + '_roto' });

// 17/11 (el autor): "no quiero que se use la cara del Turco como piloto". Al mando va ESTEBAN (game.js,
// libroRoster); el resto es el Criollo y, TEMPORALMENTE, las caras del elenco de la campaña con otro apodo
// —nunca su nombre—. Sin Tero (es la cara de Esteban) ni el Turco (es el mecanico, no vuela).
export const PILOTOS_GENERALES = [
  { nombre: 'CRIOLLO', caras: { neutro: 'av_a4b_neutro', sonrisa: 'av_a4b_sonrisa', preocupado: 'av_a4b_preocupado', ceno: 'av_a4b_ceno', roto: 'av_a4b_miedo' } },
  { nombre: 'FLACO', caras: de('puma') },
  { nombre: 'RUSO', caras: de('gitano') },
  { nombre: 'GRINGO', caras: de('vasco') },
  { nombre: 'CHUECO', caras: de('pichon') },
  { nombre: 'GALLEGO', caras: de('colorado') },
];

const POR_NOMBRE = Object.fromEntries(PILOTOS_GENERALES.map(p => [p.nombre, p]));

/** Las caras de un piloto general por su nombre, o null si no es uno de ellos. */
export const carasGeneral = nombre => (POR_NOMBRE[nombre] || {}).caras || null;
