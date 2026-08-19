// TRAMOS — el estado de la corrida (docs/sistemas/SPEC_TRAMOS.md).
//
// La MATEMATICA vive en core/tramos.js, que es puro y lo prueba `npm run unit`. Aca vive lo
// que tiene estado: que lista de tramos trae la mision en curso, cual es su objetivo, y que
// radios ya sonaron. Es la misma division que core/squad.js ↔ systems/squad.js.
//
// COMO SE LEE, y por que asi: `val('obstacles', cfg.obstacles)` RESUELVE en el momento, contra
// `run.dist`. La alternativa era cachear el tramo vigente una vez por cuadro, pero eso le
// agrega al item un orden obligatorio adentro de `update()` — y el dia que alguien mueva una
// llamada, el sembrador leeria el tramo del cuadro anterior sin que nada se queje. Resolver
// on demand son cinco comparaciones y no se puede desincronizar.
//
// NADIE ESCRIBE cfg. Ni aca ni en spawn.js: los tramos se leen y el cfg queda intacto, que es
// lo que permite que salir de la mision no te deje la densidad del ultimo tramo pegada al modo
// siguiente.
import { tramoAt, validarTramos } from '../core/tramos.js';
import { run } from '../core/run.js';

let lista = null;        // los tramos de la mision en curso (null = mision sin tramos)
let objetivo = 0;        // la distancia meta contra la que se miden las fracciones
let dichas = [];         // las claves de radio que ya sonaron EN ESTA CORRIDA
let ultimo = -1;         // el indice del tramo vigente en el cuadro anterior (para el flanco)

/** Le pasa a la corrida los tramos de la mision. Lo llama `setRunObjective()` en game.js, que
 *  es donde ya se calcula `objectiveDist` — atarlo ahi y no a `reset()` es lo que garantiza
 *  que la fraccion y su objetivo son SIEMPRE del mismo run. */
export function setTramos(t, obj) {
  lista = Array.isArray(t) && t.length ? t : null;
  objetivo = obj > 0 ? obj : 0;
  dichas = [];
  ultimo = -1;
  return lista;
}

/** Sin tramos: es el estado normal de casi todas las misiones y de todos los modos infinitos. */
export const hayTramos = () => !!lista && objetivo > 0;

/** El tramo vigente ahora mismo, o null (= manda el cfg plano). */
export const vigente = () => tramoAt(run.dist, objetivo, lista);

/** EL LECTOR. `fallback` es lo que rige sin tramos — normalmente `cfg.loQueSea`, que este
 *  modulo no importa a proposito: quien pregunta ya sabe cual es su default, y asi el item no
 *  se convierte en un segundo dueño de la configuracion del mapa. */
export function val(clave, fallback) {
  const t = vigente();
  return t ? t.val(clave, fallback) : fallback;
}

/** Inyecta tramos al run EN CURSO (sonda `__trset`). Devuelve los errores del validador: una
 *  lista mal formada se rechaza entera y la corrida sigue con lo que tenia. */
export function setTramosProbe(t, obj) {
  const e = validarTramos(t);
  if (e.length) return e;
  setTramos(t, obj > 0 ? obj : objetivo);
  return [];
}

export function resetTramos() { setTramos(null, 0); }

/** UN CUADRO del item, y lo unico que hace es CONTESTAR: `{ radio: clave }` cuando se acaba de
 *  entrar a un tramo que trae linea, o null. Quien la dice es el orquestador — un sistema no
 *  llama hacia arriba (convencion 2 de ARQUITECTURA), y ademas la radio es popup + sonido, que
 *  son dos cosas que este archivo no tiene por que conocer.
 *
 *  Las tres reglas del RF-03 caen solas de esta forma:
 *   · UNA VEZ POR TRAMO — el flanco (`ultimo`) mas la lista de dichas;
 *   · SOLO EN 'play' — lo llama game.js unicamente ahi, y como `ultimo` no se mueve mientras
 *     tanto, un cambio de tramo ocurrido en relevo o en pausa suena al volver al vuelo;
 *   · SIN CORO tras un salto de sonda — los tramos que el salto se llevo por delante nunca
 *     llegaron a ser vigentes, asi que su linea no existe para este cuadro ni para ninguno. */
export function stepTramos() {
  const t = vigente();
  const i = t ? t.idx : -1;
  if (i === ultimo) return null;
  ultimo = i;
  if (!t) return null;
  const k = t.val('radio', null);
  if (!k || yaDicha(k)) return null;
  marcarDicha(k);
  return { radio: k };
}

/** Foto del estado para la sonda `__trdbg`. `valores` son los RESUELTOS: lo que el sembrador
 *  va a leer este cuadro, no lo que dice la data — que es la unica forma de comprobar desde
 *  afuera que el tramo esta rigiendo de verdad. */
export function dbg(cfg) {
  const t = vigente();
  return {
    idx: t ? t.idx : null,
    hasta: t ? t.hasta : null,
    n: lista ? lista.length : 0,
    p: objetivo > 0 ? +(run.dist / objetivo).toFixed(3) : null,
    dist: Math.round(run.dist), obj: Math.round(objetivo),
    // EL CFG DEL QUE SE CAE, al lado del valor resuelto. Es lo que hace comprobable la regla
    // suprema (RF-04) desde afuera: sin tramos los dos numeros tienen que ser el MISMO.
    cfg: cfg ? { obstacles: cfg.obstacles, caza: cfg.caza, bombs: cfg.bombs, fuelOn: !!cfg.fuelOn } : null,
    obstacles: val('obstacles', cfg ? cfg.obstacles : null),
    caza: val('caza', cfg ? cfg.caza : null),
    bombs: val('bombs', cfg ? cfg.bombs : null),
    bidones: val('bidones', true),
    favor: val('favor', null),
    marcas: val('marcas', false),
    radio: val('radio', null),
    dichas: dichas.slice(),
  };
}

/** Marca una clave de radio como ya dicha. Lo usa el orquestador al despacharla (T2). */
export const yaDicha = k => dichas.indexOf(k) >= 0;
export const marcarDicha = k => { if (!yaDicha(k)) dichas.push(k); };
