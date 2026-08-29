// TRAMOS — el guion de spawn por mision (docs/sistemas/SPEC_TRAMOS.md).
//
// QUE ES: partir el PASILLO de una mision en segmentos por FRACCION de la distancia al
// objetivo, cada uno con su propia densidad, su mezcla y su linea de radio. Es lo que
// convierte una config plana en un nivel con dramaturgia: el transito mudo del Narwal, el
// cordon de radares del final, el infierno que crece.
//
// ESTE ARCHIVO ES PURO: sin DOM, sin stores, sin cfg. Solo matematica de fracciones y el
// validador de datos. Por eso lo puede importar `npm run unit` y correr en node pelado — y
// por eso la RESOLUCION es por LECTURA: nadie escribe `cfg.obstacles`. Si alguien lo
// escribiera, el valor quedaria pegado para el resto de la corrida Y para el modo siguiente,
// que es exactamente el bug que la convencion de stores del repo existe para impedir.
//
// El ESTADO (que tramos tiene la corrida en curso, que radios ya sonaron) vive en
// systems/tramos.js, con la misma division que core/squad.js ↔ systems/squad.js.
//
// POR FRACCIONES Y NO POR METROS, y no es un detalle: `?qa` acorta las misiones al 6%. Una
// fraccion sobrevive a eso; un metro absoluto no — el guion entero caeria adentro del primer
// segundo de vuelo y las pruebas medirian otra cosa que el juego.

/** Las claves que un tramo puede traer. Cualquier otra es error de DATOS y el validador la
 *  rechaza: una clave mal escrita (`obstaculos` por `obstacles`) no hace nada y no avisa —
 *  el tramo simplemente se comporta como si no la trajera, que es la peor forma de fallar. */
export const CLAVES = ['hasta', 'obstacles', 'caza', 'bombs', 'bidones', 'favor', 'radio', 'marcas', 'charla'];

/** Como se valida cada clave. `hasta` va aparte (es la unica obligatoria y la que ordena). */
const TIPOS = {
  obstacles: v => typeof v === 'number' && v >= 0,
  caza: v => typeof v === 'number' && v >= 0,
  bombs: v => typeof v === 'number' && v >= 0,
  bidones: v => typeof v === 'boolean',
  favor: v => Array.isArray(v) && v.length > 0 && v.every(t => typeof t === 'string'),
  radio: v => typeof v === 'string' && !!v,
  marcas: v => typeof v === 'boolean',
  // CHARLA EN VUELO (SPEC_CHARLAS_VUELO RF-01): el id de una escena de data/story.js. Se valida
  // como texto y nada mas — que la escena EXISTA no se puede comprobar aca sin importar el
  // guion, y core/ no importa contenido. Lo comprueba el unit test, que si puede ver los dos.
  charla: v => typeof v === 'string' && !!v,
};

/** Revisa una lista de tramos y devuelve los ERRORES en texto (lista vacia = data sana).
 *
 *  Devuelve errores en vez de tirar porque quien lo llama son dos cosas muy distintas: el
 *  unit test, que quiere verlos todos juntos para poder decir cual mision esta mal, y la
 *  sonda `__trset`, que los tiene que contestar por consola sin llevarse el juego puesto.
 *
 *  `undefined` es valido: una mision sin tramos es la mayoria de las misiones. */
export function validarTramos(tramos) {
  const e = [];
  if (tramos === undefined || tramos === null) return e;
  if (!Array.isArray(tramos)) return ['`tramos` tiene que ser una lista'];
  if (!tramos.length) return ['`tramos` no puede ser una lista vacia (sacala y listo)'];
  let prev = 0;
  tramos.forEach((t, i) => {
    if (!t || typeof t !== 'object' || Array.isArray(t)) { e.push(`tramo ${i}: no es un objeto`); return; }
    // HASTA: el unico campo obligatorio, y ESTRICTAMENTE creciente. Sin esto un tramo puede
    // quedar tapado por el anterior y no ejecutarse nunca — silenciosamente.
    if (typeof t.hasta !== 'number' || !(t.hasta > 0) || t.hasta > 1)
      e.push(`tramo ${i}: 'hasta' tiene que ser una fraccion en (0, 1] y es ${JSON.stringify(t.hasta)}`);
    else if (t.hasta <= prev)
      e.push(`tramo ${i}: 'hasta' ${t.hasta} no es mayor que el anterior (${prev})`);
    else prev = t.hasta;
    for (const k of Object.keys(t)) {
      if (CLAVES.indexOf(k) < 0) { e.push(`tramo ${i}: clave desconocida '${k}' (las validas: ${CLAVES.join(', ')})`); continue; }
      if (TIPOS[k] && !TIPOS[k](t[k])) e.push(`tramo ${i}: '${k}' con valor invalido ${JSON.stringify(t[k])}`);
    }
  });
  return e;
}

/** QUE TRAMO rige a `dist` metros de un objetivo de `objetivo` metros.
 *
 *  Devuelve `{ idx, hasta, val }` o **null**, y null es un resultado de primera clase: quiere
 *  decir "aca no hay tramo, usa el cfg plano". Pasa en tres casos legitimos —la mision no
 *  tiene tramos, el modo no tiene objetivo (POR LA PATRIA), o el vuelo paso el ultimo `hasta`
 *  (§2: si la lista no llega a 1, el resto del vuelo es cfg plano y eso es deliberado).
 *
 *  `val(clave, fallback)` lee la clave del tramo y cae al fallback si el tramo no la trae.
 *  El fallback lo pone QUIEN LLAMA (normalmente `cfg.loQueSea`) porque este archivo no puede
 *  ver el cfg sin dejar de ser puro — ver la divergencia 1 del §8 del spec.
 *
 *  BORDES: `hasta` es el FINAL del tramo y es exclusivo (una fraccion justo en el limite ya
 *  pertenece al siguiente), salvo en el ultimo, donde es inclusivo — si no, llegar exacto al
 *  objetivo dejaria la mision sin tramo en su ultimo cuadro. */
export function tramoAt(dist, objetivo, tramos) {
  if (!(objetivo > 0)) return null;
  if (!Array.isArray(tramos) || !tramos.length) return null;
  const p = (dist > 0 ? dist : 0) / objetivo;
  for (let i = 0; i < tramos.length; i++) {
    const t = tramos[i];
    const ultimo = i === tramos.length - 1;
    if (p < t.hasta || (ultimo && p <= t.hasta)) {
      return {
        idx: i,
        hasta: t.hasta,
        val: (clave, fallback) =>
          Object.prototype.hasOwnProperty.call(t, clave) ? t[clave] : fallback,
      };
    }
  }
  return null;
}
