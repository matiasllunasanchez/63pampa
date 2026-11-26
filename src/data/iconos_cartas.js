// EL DIBUJO DE CADA CARTA DEL BANCO (18/10/2026). La hoja assets/hud/cartas.png la hornea Blender
// (tools/blender/modelos_cartas.py, hoja `cartas` de tools/blender/hojas.py): 96 x 96 por cuadro, 8 columnas,
// EN ESTE ORDEN — el mismo que ICONOS_CARTAS de hojas.py (si se cambia alla, aca). Datos puros.
export const ICONOS = ['canon', 'cinta', 'bala', 'brp', 'snakeye', 'espoleta', 'ter', 'exocet',
  'chafitas', 'chapa', 'casco', 'llave', 'a4', 'caja_herr', 'motor', 'reloj',
  'cajon', 'tanques', 'hercules', 'arena', 'rasante', 'radar', 'neptune', 'auriculares',
  'antena', 'mirage', 'learjet', 'pinza', 'terreno', 'itb', 'paracaidas', 'pirueta',
  'fideos',    // (20/10: la maquina de fideos — la carta de las primeras chafitas)
  'aerosol',   // (17/11: el siliconado M-60 del parabrisas)
  'bidon',     // (23/11: el bidon verde de la Chancha, con su pico y la gota — tools/blender/modelos_cartas.py)
  // (25/11: la tanda del album — la eyeccion con el asiento, el Rapier con el Blowpipe, las chafitas por carga y cada pirueta)
  'eyeccion', 'rapier', 'chaf2', 'chaf3', 'chaf4', 'chaf_rec', 'chaf_den',
  'pir_mask', 'pir_splits', 'pir_breakt', 'pir_loyo', 'pir_sturn', 'pir_popup', 'pir_hiyo', 'pir_jink',
  'pir_spin', 'pir_climb', 'pir_climbmax', 'pir_barrel', 'pir_salto'];
export const ICONO_FW = 96, ICONO_COLS = 8;

/** Carta → dibujo. Las familias comparten (las tres de MOMENTUM, las cuatro CHAFITAS…). */
const DE = {
  metralla2: 'canon', metralla3: 'canon', canon: 'canon', cinta2: 'cinta', cinta3: 'cinta',
  potencia2: 'bala', potencia3: 'bala', brp: 'brp', snakeye: 'snakeye', espoletas1: 'espoleta', espoletas2: 'espoleta',
  soporte1: 'ter', soporte2: 'ter', exocet: 'exocet',
  chafitas1: 'fideos', chafitas2: 'chaf2', chafitas3: 'chaf3', chafitas4: 'chaf4', chafRecarga: 'chaf_rec', chafPotencia: 'chaf_den',
  escudo1: 'chapa', escudo2: 'chapa', veterano: 'reloj',   /* (22/11, el autor: "visualmente no se que es esto": el casco no se leia; el relevo en la mitad de tiempo = el reloj) */ reparacion: 'llave', amigo: 'a4', rescate: 'paracaidas',
  tallerLiv: 'caja_herr', tallerPes: 'motor', vuelta: 'reloj', municion: 'cajon',
  tanques: 'tanques', chancha1: 'bidon', kc130: 'bidon',
  momentum1: 'arena', momentum2: 'arena', momentum3: 'arena', rasante1: 'rasante', radar1: 'radar',
  radarMalvinas: 'radar', neptune: 'neptune', tracker: 'auriculares', guerraElec: 'antena', mirage: 'mirage',
  fenix: 'learjet', coordinado: 'pinza', terreno: 'terreno', itb: 'itb', siliconado: 'aerosol',
  // las PIRUETAS, cada una su camino (25/11)
  mask: 'pir_mask', splits: 'pir_splits', breakt: 'pir_breakt', loyo: 'pir_loyo', sturn: 'pir_sturn', popup: 'pir_popup',
  hiyo: 'pir_hiyo', jink: 'pir_jink', spin: 'pir_spin', climb: 'pir_climb', climbmax: 'pir_climbmax', barrel: 'pir_barrel', salto: 'pir_salto',
};
/** Si una carta nueva no tiene dibujo propio, el de su grupo. */
const POR_GRUPO = { armas: 'canon', defensa: 'chapa', alcance: 'tanques', poderes: 'arena', piruetas: 'pirueta',
  taller: 'caja_herr', inteligencia: 'radar' };

/** El cuadro (0..ICONOS.length-1) de la carta `c`. */
export function iconoDe(c) {
  const k = (c && (DE[c.id] || POR_GRUPO[c.grupo])) || 'pirueta';
  return Math.max(0, ICONOS.indexOf(k));
}
