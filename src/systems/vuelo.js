// LA CAMA DE VUELO — lo que hace que el avion PESE (docs/sistemas/PLAN_CINE_PESO.md, fase P1).
//
// Es la parte de `systems/flight.js` que NO es reglas de juego: integrar la posicion, los topes
// del carril, el seguimiento de la camara y la relajacion del alabeo y el cabeceo. Nada de
// colision, nafta, puntaje, spawn, radar ni racha — por eso se puede invocar sin arrastrar el
// juego entero.
//
// POR QUE EXISTE. El PASILLO no se siente suave por las curvas de las piruetas: esas son las
// mismas en todos lados. Se siente suave porque **el mundo corre debajo, la camara llega TARDE y
// las actitudes vuelven con peso**. Una cinematica que corre `moves.js` pero no esto se ve como un
// modelito girando en el lugar, por buena que sea su timeline — que es exactamente el diagnostico
// que abrio este plan (§0: altura 0.00 · carril 0.00 · camara 0.00).
//
// NO ES UN SEGUNDO SISTEMA DE MOVIMIENTO (PLAN_DIRECTOR_CINEMATICAS §6.4): es el PRIMERO, separado
// de sus reglas para poder llamarlo desde una cinematica. `flight.js` lo llama —era codigo suyo,
// literalmente estas lineas— asi que el avion de una cinematica es EL MISMO avion del pasillo.
// Si algun dia el vuelo cambia de peso, las cinematicas cambian con el sin tocarlas.
import { plane, cam } from '../core/state.js';
import { run } from '../core/run.js';
import { FLY_X, FLY_TOP } from '../data/tuning.js';
import { PITCH_LERP } from '../core/physics.js';

// cuanto sube la camara con turbo (unidades de mundo): el efecto de 'alejarse'
export const BOOST_LIFT = 2.2;
// PANEO a fondo del stick derecho, en unidades de mundo. Es "un poco" a proposito: casi el triple
// del BOOST_LIFT de 2.2, asi que se nota sin discusion, pero el avion no se va de cuadro ni se
// pierde el horizonte. Es una mirada, no una camara libre.
export const CAM_PAN = 6;

/** Un cuadro de vuelo, SIN reglas de juego.
 *
 *  @param dt  segundos
 *  @param o   `{ bank, pitch, pan, boost }`
 *     `bank`/`pitch`  OBJETIVOS de actitud (-1..1). Los resuelve quien llama —el vuelo desde la
 *                     palanca, una cinematica desde el vacio (0 = nivelar)— porque la INTENCION es
 *                     de cada uno; lo que esta funcion aporta es el PESO con que se llega ahi.
 *                     Se ignoran mientras hay pirueta: ahi el dueño de la actitud es moves.js.
 *     `pan`           paneo pedido (-1..1). El jugador mira arriba/abajo; una cinematica no.
 *     `boost`         turbo puesto: la camara se va para atras.
 */
export function stepVuelo(dt, o) {
  o = o || {};
  // ---- INTEGRAR. `moves.js` y el bloque de control escriben VELOCIDADES; la posicion se integra
  // en un solo lugar, y este es. Sin esto una pirueta es un sprite rotando sobre una foto.
  plane.x += plane.vx * dt;
  plane.y += plane.vy * dt;
  if (plane.x < -FLY_X) { plane.x = -FLY_X; plane.vx = 0; }
  if (plane.x > FLY_X) { plane.x = FLY_X; plane.vx = 0; }
  if (plane.y > FLY_TOP) { plane.y = FLY_TOP; plane.vy = 0; }

  // ---- LA CAMARA LLEGA TARDE, y ese retardo ES el peso. No sigue al avion: lo persigue.
  cam.x += (plane.x * 0.86 - cam.x) * Math.min(1, dt * 7);
  // PANEO DEL JUGADOR (stick derecho vertical · [R]/[F]): mirar un poco hacia abajo o hacia arriba
  // sin mover el avion. Es el MISMO mecanismo que el turbo — se corre la camara en el MUNDO — asi
  // que empujar el stick hacia ABAJO SUBE la camara: entra mas mundo por debajo, que es lo que
  // uno quiere cuando mira para abajo. Va suavizado (no es un interruptor) y NO afecta al vuelo.
  run.camPan += (Math.max(-1, Math.min(1, o.pan || 0)) * CAM_PAN - run.camPan) * Math.min(1, dt * 4);
  // TURBO: la camara se VA PARA ATRAS. No se escala el raster (eso partia el mar en rayas, ver
  // CAM_ZOOMS en game.js): se sube la camara en el MUNDO, asi la proyeccion se recalcula sola,
  // entra mas agua en pantalla y el avion baja en el cuadro. Es un movimiento de camara real.
  const camLift = 2.6 + (o.boost ? BOOST_LIFT : 0) + run.camPan;
  cam.y += (plane.y + camLift - cam.y) * Math.min(1, dt * 3.2);
  if (cam.y < 3.4) cam.y = 3.4;

  // ---- ACTITUDES CON PESO: el alabeo y el cabeceo no saltan a su objetivo, llegan.
  // Durante una PIRUETA no se tocan: ahi los clava movesSystem (son las poses de la maniobra), y
  // al soltarla el avion vuelve a nivel por aca — que es lo que le faltaba a la cinematica, donde
  // el avion quedaba banqueado para siempre.
  if (!run.mv) {
    plane.bank += ((o.bank || 0) - plane.bank) * Math.min(1, dt * 9);   // entra/sale con peso
    plane.pitch += ((o.pitch || 0) - plane.pitch) * Math.min(1, dt * PITCH_LERP);   // igual de rapido que el alabeo
  }
}
