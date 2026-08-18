// LA TIERRA: EL RELIEVE DEL SUELO (PLAN_TIERRA_COSTA T3).
//
// PURO: sin canvas, sin stores, sin imports del render. Hermano exacto de `core/sea.js`, y por la
// MISMA razon: la colision contra el suelo tiene que evaluar la misma superficie que se dibuja, y
// un sistema no puede importar del render. Lo que ves es lo que te mata — de este lado tambien.
//
// LA TESIS DE LA FASE: hasta hoy el suelo era `y = 0` exacto en todo el mapa, o sea que volar
// rasante sobre turba era MAS FACIL que sobre el mar (que ya tiene campo de altura y olas). Con
// esto, ir a ras de la tierra pasa a ser SEGUIR EL TERRENO, que es la habilidad que el mapa de
// tierra nunca cobro.
import { TIERRA_AMP, TIERRA_LZ, TIERRA_LZ2, TIERRA_LX,
  PEDRERO_CADA, PEDRERO_HW, PEDRERO_SERP, TURBAL_CADA, TURBAL_L, TURBAL_HW } from '../data/tuning.js';

/** ALTURA DEL SUELO en un punto del mundo, en metros. Siempre >= 0.
 *
 *  Dos senos y nada mas: uno largo (las lomas por las que se sube y se baja) y uno corto con un
 *  termino en X (los ondulados que hacen que la loma no sea un tubo, o sea que cruzarla por un
 *  lado no sea igual que por el otro). No hay ruido ni hash: el relieve tiene que ser SUAVE y,
 *  sobre todo, tiene que poder leerse desde lejos — una loma que no se ve venir no es terreno,
 *  es una trampa. */
export function tierraH(wx, wz) {
  if (TIERRA_AMP <= 0) return 0;
  const a = Math.sin(wz / TIERRA_LZ) * 0.62 + Math.sin(wz / TIERRA_LZ2 + wx / TIERRA_LX) * 0.38;
  // llevado a [0, TIERRA_AMP]: el suelo nunca baja del cero del mundo. Si bajara habria que
  // hundir tambien el raster de color y la orilla, y el pozo no aporta nada que la loma no de.
  return TIERRA_AMP * 0.5 * (a + 1);
}

/** PENDIENTE en la direccion de vuelo (dh/dz). Positiva = el terreno SUBE alejandose, o sea que
 *  le estamos viendo la cara. La usa el sombreado para darle volumen a la loma, que es lo unico
 *  que la hace visible antes de estar encima. */
export function tierraPend(wx, wz) {
  if (TIERRA_AMP <= 0) return 0;
  const d = Math.cos(wz / TIERRA_LZ) * (0.62 / TIERRA_LZ) + Math.cos(wz / TIERRA_LZ2 + wx / TIERRA_LX) * (0.38 / TIERRA_LZ2);
  return TIERRA_AMP * 0.5 * d;
}

/** ¿ESTE MAPA TIENE RELIEVE? Solo TIERRA. La COSTA queda plana a proposito (ver divergencia 9 del
 *  plan): la orilla, la playa y la franja de espuma estan todas clavadas al cero del mundo, y
 *  levantarles el suelo por debajo seria mover tres sistemas para ganar una loma que ademas
 *  taparia el mar. Se pasa el cfg —no se importa— para que el modulo siga siendo puro. */
export const hayRelieve = cfg => TIERRA_AMP > 0 && cfg.terrain === 'land';

// hash entero → [0,1). Copia de bolsillo del de `render/world.js`: este modulo es PURO y no puede
// importar del render, y el accidente inverso —que el terreno dependa del dibujo— es peor que
// tener ocho lineas dos veces.
function hash2(a, b) {
  let h = Math.imul(a | 0, 374761393) ^ Math.imul(b | 0, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** PEDRERO (T5): los *stone runs* de Malvinas, rios de piedra que bajan por las laderas. Devuelve
 *  cuanto pertenece el punto al rio, en [0,1] — 0 es turba limpia, 1 el centro del pedrero.
 *
 *  No estan en todos lados a proposito: aparecen en poco menos de la mitad de las bandas, duran
 *  un tramo y se terminan. Un accidente que esta SIEMPRE deja de ser un accidente y pasa a ser
 *  textura, y entonces ya no sirve de referencia — que es para lo que el pedrero esta. */
export function pedreroAt(wx, wz) {
  const banda = Math.floor(wz / PEDRERO_CADA);
  const h = hash2(banda, 8171);
  if (h < 0.55) return 0;
  // el tramo que ocupa dentro de su banda, con puntas suaves: si empezara de golpe se leeria
  // como una alfombra apoyada, no como piedra bajando
  const u = (wz - banda * PEDRERO_CADA) / PEDRERO_CADA;
  const largo = Math.min(1, Math.min(u - 0.08, 0.62 - u) / 0.07);
  if (largo <= 0) return 0;
  const cx = (h * 2 - 1) * 46 + Math.sin(wz * 0.011 + banda) * PEDRERO_SERP;
  const d = Math.abs(wx - cx);
  if (d > PEDRERO_HW) return 0;
  return (1 - d / PEDRERO_HW) * largo;
}

/** TURBAL (T5): el corte de turba apilada. Devuelve el tablero al que pertenece esta profundidad
 *  —{ x0, x1, cara }— o null. `cara` marca las dos filas del frente del corte, que es la que se
 *  ve levantada y va mas clara: sin ella el turbal es una mancha, con ella es un pozo. */
export function turbalAt(wz) {
  const banda = Math.floor(wz / TURBAL_CADA);
  const h = hash2(banda, 4409);
  if (h < 0.5) return null;
  const z0 = banda * TURBAL_CADA + h * (TURBAL_CADA - TURBAL_L);
  if (wz < z0 || wz > z0 + TURBAL_L) return null;
  const cx = (hash2(banda, 991) * 2 - 1) * 40;
  return { x0: cx - TURBAL_HW, x1: cx + TURBAL_HW, cara: wz > z0 + TURBAL_L - 2.5 };
}
