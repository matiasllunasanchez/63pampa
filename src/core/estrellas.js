// ESTRELLAS DE BUSQUEDA — la matematica (docs/sistemas/PLAN_ESTRELLAS_BUSQUEDA.md).
//
// ESTE ARCHIVO ES PURO: sin DOM, sin stores, sin cfg. Subir, bajar, el reloj del escondite y el
// piso que impone cada nivel. Por eso lo importa `npm run unit` y corre en node pelado — y por eso
// el ESTADO (cuantas estrellas tiene la corrida) vive en systems/estrellas.js, con la misma
// division que core/fases.js ↔ systems/fases.js.
//
// LA REGLA QUE ORDENA TODO (§2 del plan): este eje decide QUIEN TE BUSCA. QUE HAY en el mundo lo
// decide la distancia, o sea el `solo` de la fase. Por eso todo lo de aca es un PISO —levanta lo
// resuelto y nunca lo baja— y la lista blanca se UNE en vez de reemplazarse.
import { NIVELES } from '../data/estrellas.js';
import { EST_MAX } from '../data/tuning.js';

/** Acota un nivel al rango valido. Se usa en TODAS las entradas y salidas: un contador que se
 *  puede pasar del tope es un indice fuera de la tabla, y eso es un `undefined` silencioso. */
export const acotar = n => Math.max(0, Math.min(EST_MAX, n | 0));

/** LO QUE IMPONE UN NIVEL. Devuelve siempre una entrada valida, incluso con basura de entrada. */
export const nivelDe = n => NIVELES[acotar(n)] || NIVELES[0];

/** EL PISO DE UN VALOR NUMERICO (`bombs`, `caza`).
 *
 *  `Math.max` y no reemplazo, y es la mitad del diseño: una mision que ya bombardea fuerte no se
 *  ablanda porque el jugador tenga cero estrellas. Este eje SUBE; nunca afloja lo que la fase o el
 *  cfg ya habian decidido. */
export function piso(clave, resuelto, n) {
  const nv = nivelDe(n);
  const min = nv[clave];
  if (typeof min !== 'number') return resuelto;
  return typeof resuelto === 'number' ? Math.max(resuelto, min) : min;
}

/** LA LISTA BLANCA, UNIDA.
 *
 *  `solo` es lo que la FASE deja nacer (la distancia: naturaleza en mar abierto, defensa cerca del
 *  blanco). El nivel le AGREGA lo que te mandaron a buscar. Se unen porque son dos preguntas
 *  distintas — si el nivel reemplazara la lista, con tres estrellas apareceria un globo en mar
 *  abierto, que es justo el sinsentido que el §2 existe para evitar.
 *
 *  `null` significa "sin lista blanca: puede nacer cualquier cosa", y en ese caso agregar tipos no
 *  significa nada — se devuelve null y el sembrador sigue sin recortar. */
export function listaCon(solo, n) {
  if (!solo) return null;
  const suma = nivelDe(n).suma;
  if (!suma || !suma.length) return solo;
  const out = solo.slice();
  for (const t of suma) if (out.indexOf(t) < 0) out.push(t);
  return out;
}

/** UN PASO DEL RELOJ DEL ESCONDITE, y es lo unico verdaderamente nuevo del item.
 *
 *  `st` = `{ reloj, fuera }` — segundos acumulados escondido, y segundos que se lleva asomado.
 *  Devuelve un estado NUEVO mas `baja: true` en el cuadro en que se completa un ciclo.
 *
 *  CONTINUO Y NO ACUMULADO: asomarse reinicia el reloj. Es lo que convierte esconderse en un
 *  compromiso —veinte segundos seguidos pegado al agua, pagando el doble de nafta— en vez de una
 *  espera que se junta de a pedacitos mientras hacés otra cosa.
 *
 *  …PERO CON GRACIA. Un bob no te delata: asomarse menos de `graciaS` no reinicia nada. Sin esto
 *  el oleaje y el cabeceo hacen imposible sostener veinte segundos limpios, y la mecanica pasa de
 *  ser una decision a ser una moneda al aire. La gracia se GASTA y se repone al volver abajo. */
export function pasoEscondite(dt, st, bajoTecho, perderS, graciaS) {
  const reloj = st && st.reloj > 0 ? st.reloj : 0;
  const fuera = st && st.fuera > 0 ? st.fuera : 0;
  if (bajoTecho) {
    const r = reloj + dt;
    // se completo un ciclo: baja una y el reloj arranca de nuevo (no se pierde el sobrante)
    if (r >= perderS) return { reloj: r - perderS, fuera: 0, baja: true };
    return { reloj: r, fuera: 0, baja: false };
  }
  // ARRIBA DEL TECHO: se gasta la gracia; agotada, el reloj vuelve a cero
  const f = fuera + dt;
  if (f >= graciaS) return { reloj: 0, fuera: f, baja: false };
  return { reloj, fuera: f, baja: false };
}
