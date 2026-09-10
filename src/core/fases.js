// FASES — la forma de una mision entera (docs/sistemas/PLAN_MISION_CINCO_FASES.md §11).
//
// QUE ES, y en que se diferencia de los TRAMOS. Los dos parten la mision por fracciones y los dos
// resuelven POR LECTURA sin tocar el cfg; son el mismo mecanismo. La diferencia es el alcance:
//
//   TRAMOS  el guion de SPAWN adentro del pasillo. Cortan en 1: mas alla del objetivo no existen.
//   FASES   la forma de la MISION. Van mas alla de 1 a proposito, porque la VUELTA ocurre pasado
//           el buque — que es justamente lo que este plan vino a agregar.
//
// Por eso conviven en vez de reemplazarse, y la precedencia natural es tramo → fase → cfg: de lo
// mas especifico a lo mas general. Una mision puede declarar las dos cosas y no se pisan.
//
// ESTE ARCHIVO ES PURO: sin DOM, sin stores, sin cfg. Solo fracciones, la herencia del tipo y el
// validador de datos. Por eso lo importa `npm run unit` y corre en node pelado — y por eso la
// resolucion es por LECTURA: nadie escribe `cfg.obstacles`. Si alguien lo escribiera, el valor
// quedaria pegado para el resto de la corrida Y para el modo siguiente, que es exactamente el bug
// que la convencion de stores del repo existe para impedir.
//
// El ESTADO (que fases tiene la corrida en curso, en cual esta parada) vive en systems/fases.js,
// con la misma division que core/tramos.js ↔ systems/tramos.js.
import { TIPOS, TIPOS_VALIDOS, PINTAS } from '../data/fases.js';
import { FASE_MAX_HASTA } from '../data/tuning.js';

/** Las claves que una fase puede traer. Cualquier otra es error de DATOS y el validador la
 *  rechaza: una clave mal escrita (`radares` por `radar`) no hace nada y no avisa — la fase
 *  simplemente se comporta como si no la trajera, que es la peor forma de fallar. */
export const CLAVES = ['tipo', 'hasta', 'obstacles', 'caza', 'bombs', 'radar', 'agua', 'voces', 'nafta', 'pinta', 'radio'];

/** Como se valida cada clave. `tipo` y `hasta` van aparte: son las dos obligatorias. */
const TIPOS_DE_CLAVE = {
  obstacles: v => typeof v === 'number' && v >= 0,
  caza: v => typeof v === 'number' && v >= 0,
  bombs: v => typeof v === 'number' && v >= 0,
  // el techo del filo, en unidades de mundo. Tiene que ser POSITIVO: un techo en 0 no seria un
  // filo estrecho, seria una fase donde volar ya es imposible.
  radar: v => typeof v === 'number' && v > 0,
  // cuanto PERDONA el agua en esta fase (multiplicador del margen de roce). >= 1: una fase puede
  // ablandar el mar, nunca endurecerlo — para eso ya estan la velocidad y el turbo.
  agua: v => typeof v === 'number' && v >= 1,
  voces: v => typeof v === 'boolean',
  nafta: v => typeof v === 'number' && v >= 0,
  pinta: v => PINTAS.indexOf(v) >= 0,
  radio: v => typeof v === 'string' && !!v,
};

/** Revisa una lista de fases y devuelve los ERRORES en texto (lista vacia = data sana).
 *
 *  Devuelve errores en vez de tirar por el mismo motivo que el validador de tramos: quien llama
 *  son dos cosas distintas — el unit test, que quiere verlos todos juntos para poder decir cual
 *  mision esta mal, y la sonda `__fsset`, que los tiene que contestar por consola sin llevarse
 *  el juego puesto.
 *
 *  `undefined` es valido: una mision sin fases es TODAS las misiones de hoy, y que eso siga
 *  siendo valido es la regla suprema de este item. */
export function validarFases(fases) {
  const e = [];
  if (fases === undefined || fases === null) return e;
  if (!Array.isArray(fases)) return ['`fases` tiene que ser una lista'];
  if (!fases.length) return ['`fases` no puede ser una lista vacia (sacala y listo)'];
  let prev = 0;
  fases.forEach((f, i) => {
    if (!f || typeof f !== 'object' || Array.isArray(f)) { e.push(`fase ${i}: no es un objeto`); return; }
    // TIPO: obligatorio y conocido. Sin el no hay de quien heredar, y una fase sin herencia es
    // una fase que no hace nada — otra vez, la peor forma de fallar.
    if (typeof f.tipo !== 'string' || TIPOS_VALIDOS.indexOf(f.tipo) < 0)
      e.push(`fase ${i}: 'tipo' desconocido ${JSON.stringify(f.tipo)} (los validos: ${TIPOS_VALIDOS.join(', ')})`);
    // HASTA: ESTRICTAMENTE creciente. Sin esto una fase puede quedar tapada por la anterior y no
    // ejecutarse nunca, en silencio. Puede pasar de 1 (la vuelta), pero no de FASE_MAX_HASTA.
    if (typeof f.hasta !== 'number' || !(f.hasta > 0) || f.hasta > FASE_MAX_HASTA)
      e.push(`fase ${i}: 'hasta' tiene que ser una fraccion en (0, ${FASE_MAX_HASTA}] y es ${JSON.stringify(f.hasta)}`);
    else if (f.hasta <= prev)
      e.push(`fase ${i}: 'hasta' ${f.hasta} no es mayor que el anterior (${prev})`);
    else prev = f.hasta;
    for (const k of Object.keys(f)) {
      if (CLAVES.indexOf(k) < 0) { e.push(`fase ${i}: clave desconocida '${k}' (las validas: ${CLAVES.join(', ')})`); continue; }
      if (TIPOS_DE_CLAVE[k] && !TIPOS_DE_CLAVE[k](f[k])) e.push(`fase ${i}: '${k}' con valor invalido ${JSON.stringify(f[k])}`);
    }
  });
  return e;
}

/** QUE FASE rige a `dist` metros de un objetivo de `objetivo` metros.
 *
 *  Devuelve `{ idx, tipo, hasta, val }` o **null**, y null es un resultado de primera clase:
 *  quiere decir "aca no hay fase, manda el cfg plano". Pasa en tres casos legitimos — la mision
 *  no declara fases (o sea: todas las de hoy), el modo no tiene objetivo (POR LA PATRIA), o el
 *  vuelo paso el ultimo `hasta`, que en una mision con vuelta es haber aterrizado.
 *
 *  `val(clave, fallback)` LEE EN TRES ESCALONES, y ese es todo el aporte de este archivo sobre
 *  el de tramos:
 *      1. lo que la fase declara explicitamente        (esta corrida, este tramo, este numero)
 *      2. el default de su TIPO (data/fases.js)        (lo que significa ser un 'filo')
 *      3. el fallback de quien pregunta                (normalmente `cfg.loQueSea`)
 *  El fallback lo pone QUIEN LLAMA porque este archivo no puede ver el cfg sin dejar de ser puro
 *  — misma divergencia 2 que ya quedo asentada en SPEC_TRAMOS §8.
 *
 *  BORDES: identicos a los de un tramo, porque el jugador no tiene por que aprender dos reglas.
 *  `hasta` es el FINAL y es exclusivo (la fraccion justa del limite ya pertenece a la siguiente),
 *  salvo en la ultima, donde es inclusivo. */
export function faseAt(dist, objetivo, fases) {
  if (!(objetivo > 0)) return null;
  if (!Array.isArray(fases) || !fases.length) return null;
  const p = (dist > 0 ? dist : 0) / objetivo;
  for (let i = 0; i < fases.length; i++) {
    const f = fases[i];
    const ultima = i === fases.length - 1;
    if (p < f.hasta || (ultima && p <= f.hasta)) {
      const base = TIPOS[f.tipo] || {};
      return {
        idx: i,
        tipo: f.tipo,
        hasta: f.hasta,
        val: (clave, fallback) => {
          if (Object.prototype.hasOwnProperty.call(f, clave)) return f[clave];
          if (Object.prototype.hasOwnProperty.call(base, clave)) return base[clave];
          return fallback;
        },
      };
    }
  }
  return null;
}
