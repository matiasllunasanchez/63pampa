// ESTRELLAS DE BUSQUEDA — el estado de la corrida (PLAN_ESTRELLAS_BUSQUEDA.md).
//
// La MATEMATICA vive en core/estrellas.js, que es puro y lo prueba `npm run unit`. Aca vive lo que
// tiene estado: el reloj del escondite y los flancos que el orquestador convierte en radio. El
// CONTADOR en si vive en `run.estrellas`, con los otros numeros del vuelo — lo escribe este
// modulo y lo leen el HUD y el sembrador, que es exactamente el criterio de core/run.js.
//
// NADIE ESCRIBE cfg. Como las fases y los tramos, este eje se LEE: pone un piso sobre lo resuelto
// y el cfg queda intacto.
import { run } from '../core/run.js';
import { acotar, pasoEscondite } from '../core/estrellas.js';
import { EST_PERDER_S, EST_GRACIA_S } from '../data/tuning.js';

let esc = { reloj: 0, fuera: 0 };   // el reloj del escondite (ver core: continuo, con gracia)

export function resetEstrellas() { esc = { reloj: 0, fuera: 0 }; run.estrellas = 0; }

/** Cuantas te buscan ahora. */
export const nivel = () => acotar(run.estrellas);

/** SUMA UNA. La llama el orquestador cuando la barra del radar se completa — el evento ya existia
 *  (`run.detection >= 1`) y disparaba una oleada; ahora ademas deja memoria.
 *  Devuelve el nivel NUEVO, o null si ya estaba en el tope (para no repetir la radio). */
export function sumar() {
  const antes = nivel();
  run.estrellas = acotar(antes + 1);
  // al subir se pierde lo escondido: te acaban de ver, no estabas escondido
  esc = { reloj: 0, fuera: 0 };
  return run.estrellas !== antes ? run.estrellas : null;
}

/** UN CUADRO DEL ESCONDITE. `bajoTecho` lo resuelve el orquestador —es el techo de la FASE, no la
 *  constante, asi que esconderse en un FILO es mucho mas dificil que en mar abierto, y eso es
 *  correcto: en el filo hay alguien mirando de cerca.
 *
 *  Devuelve `{ bajo }` con el nivel NUEVO en el cuadro en que se completa un ciclo, o null. Quien
 *  lo anuncia es el orquestador: un sistema no llama hacia arriba. */
export function step(dt, bajoTecho) {
  if (nivel() <= 0) { esc = { reloj: 0, fuera: 0 }; return null; }
  const st = pasoEscondite(dt, esc, !!bajoTecho, EST_PERDER_S, EST_GRACIA_S);
  esc = { reloj: st.reloj, fuera: st.fuera };
  if (!st.baja) return null;
  run.estrellas = acotar(nivel() - 1);
  return { bajo: run.estrellas };
}

/** CUANTO FALTA para bajar la proxima, 0..1. Lo dibuja el HUD, y no es un adorno: si esconderse
 *  veinte segundos baja una estrella, el jugador tiene que VER esos veinte segundos correr. Sin
 *  el reloj a la vista, bajar no es una decision — es fe. */
export const progreso = () => (nivel() > 0 ? Math.max(0, Math.min(1, esc.reloj / EST_PERDER_S)) : 0);

/** Foto para la sonda `__estdbg`. */
export const dbg = () => JSON.stringify({
  n: nivel(), reloj: +esc.reloj.toFixed(2), fuera: +esc.fuera.toFixed(2),
  progreso: +progreso().toFixed(3), perderS: EST_PERDER_S, graciaS: EST_GRACIA_S,
});
