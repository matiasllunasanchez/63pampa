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
import { wake, parts, prune } from '../core/world.js';
import { proj } from '../core/fx.js';
import { P } from '../data/palette.js';
import { PZ, W } from '../render/ctx.js';
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
 *     `ras`           `{ lift, piso, lat }` o null: LA CAMARA DEL PODER RASANTE. `lift` es la
 *                     altura de la camara sobre el avion (2.6 es la de siempre; MAS la aleja del
 *                     agua en el mundo y por lo tanto BAJA al avion en el cuadro), `piso` hasta
 *                     donde puede bajar, y `lat` cuanto se corre la camara al costado — el avion
 *                     se va a la izquierda del cuadro. Quien lo pide es el orquestador: este
 *                     modulo no sabe que existe el poder, solo que le cambiaron el encuadre.
 *     `techo`         tope de altura. Por omision el del juego (`FLY_TOP`): quien vuela el
 *                     pasillo no lo pasa nunca y no cambia nada. Lo levanta UNA cinematica, y por
 *                     una razon: el techo es una REGLA DE JUEGO —«hasta aca llega el carril»— y en
 *                     una salida trepando lo que hacia era FRENAR el avion contra un vidrio
 *                     invisible justo cuando la escena pide que se vaya (playtest 8/2026).
 */
export function stepVuelo(dt, o) {
  o = o || {};
  const techo = o.techo === undefined ? FLY_TOP : o.techo;
  // ---- INTEGRAR. `moves.js` y el bloque de control escriben VELOCIDADES; la posicion se integra
  // en un solo lugar, y este es. Sin esto una pirueta es un sprite rotando sobre una foto.
  plane.x += plane.vx * dt;
  plane.y += plane.vy * dt;
  if (plane.x < -FLY_X) { plane.x = -FLY_X; plane.vx = 0; }
  if (plane.x > FLY_X) { plane.x = FLY_X; plane.vx = 0; }
  if (plane.y > techo) { plane.y = techo; plane.vy = 0; }

  // ---- LA CAMARA LLEGA TARDE, y ese retardo ES el peso. No sigue al avion: lo persigue.
  // EL CORRIMIENTO LATERAL DEL PODER RASANTE (RF-04). La camara se va A UN COSTADO del avion, asi
  // que el avion deja el centro del cuadro y se planta abajo a la izquierda — que es el encuadre
  // que Matias marco con dos referencias del video. No es una camara nueva: es la de siempre
  // mirando desde otro lado, y por eso hereda su peso (el lerp de abajo) y su transicion.
  //
  // EL SIGNO: `cam.x` MAYOR que la x del avion lo empuja hacia la IZQUIERDA de la pantalla, porque
  // la proyeccion es `W/2 + (x - cam.x) * F/z`. Un `lat` positivo mueve la camara a la derecha y
  // al avion a la izquierda.
  const lat = o.ras ? (o.ras.lat || 0) : 0;
  cam.x += (plane.x * 0.86 + lat - cam.x) * Math.min(1, dt * 7);
  // PANEO DEL JUGADOR (stick derecho vertical · [R]/[F]): mirar un poco hacia abajo o hacia arriba
  // sin mover el avion. Es el MISMO mecanismo que el turbo — se corre la camara en el MUNDO — asi
  // que empujar el stick hacia ABAJO SUBE la camara: entra mas mundo por debajo, que es lo que
  // uno quiere cuando mira para abajo. Va suavizado (no es un interruptor) y NO afecta al vuelo.
  run.camPan += (Math.max(-1, Math.min(1, o.pan || 0)) * CAM_PAN - run.camPan) * Math.min(1, dt * 4);
  // TURBO: la camara se VA PARA ATRAS. No se escala el raster (eso partia el mar en rayas, ver
  // CAM_ZOOMS en game.js): se sube la camara en el MUNDO, asi la proyeccion se recalcula sola,
  // entra mas agua en pantalla y el avion baja en el cuadro. Es un movimiento de camara real.
  // LA CAMARA DEL PODER RASANTE (SPEC_PODER_RASANTE RF-04): la quinta camara del juego, y solo
  // existe mientras el poder dura. Se pide por `o.ras` —el orquestador lo resuelve, este modulo no
  // conoce el poder— y son DOS NUMEROS: cuanto se cae la camara respecto del avion, y hasta donde
  // puede bajar el piso.
  //
  // Y LA TRANSICION NO SE PROGRAMA: la camara ya llega tarde (ese lerp de 3.2 es el peso de toda
  // la cama de vuelo), asi que cambiar el destino la hace VIAJAR sola, de ida y de vuelta, en
  // medio segundo. Escribir una interpolacion aparte habria sido una segunda camara peleando con
  // la primera — el criterio de cierre pide "sin corte seco" y esto es exactamente eso, gratis.
  const camLift = (o.ras ? o.ras.lift : 2.6) + (o.boost ? BOOST_LIFT : 0) + run.camPan;
  cam.y += (plane.y + camLift - cam.y) * Math.min(1, dt * 3.2);
  const piso = o.ras ? o.ras.piso : 3.4;
  if (cam.y < piso) cam.y = piso;

  // ---- ACTITUDES CON PESO: el alabeo y el cabeceo no saltan a su objetivo, llegan.
  // Durante una PIRUETA no se tocan: ahi los clava movesSystem (son las poses de la maniobra), y
  // al soltarla el avion vuelve a nivel por aca — que es lo que le faltaba a la cinematica, donde
  // el avion quedaba banqueado para siempre.
  if (!run.mv) {
    plane.bank += ((o.bank || 0) - plane.bank) * Math.min(1, dt * 9);   // entra/sale con peso
    plane.pitch += ((o.pitch || 0) - plane.pitch) * Math.min(1, dt * PITCH_LERP);   // igual de rapido que el alabeo
  }
}


/** EL AGUA QUE LEVANTAS al volar a ras: la estela sobre el mar y el rocio que salta.
 *
 *  Vive aca por la misma razon que el resto de la cama: era codigo de `flight.js` y hace falta
 *  TAMBIEN en una cinematica. Volar rasante sin que el agua reaccione no se lee como rasante — se
 *  lee como volar bajo sobre una foto, que es de lo que se quejo el playtest.
 *
 *  `alt` entra por parametro (y no de `plane.y`) porque el vuelo la calcula una vez por cuadro
 *  junto con el roce; `pista`/`tierra` apagan el agua donde no hay agua.
 */
export function estelaVuelo(dt, o) {
  o = o || {};
  const alt = o.alt === undefined ? plane.y : o.alt;
  // estela sobre el agua
  const lowI = Math.max(0, 1 - alt / 9);
  if (lowI > 0 && !o.pista && !o.tierra) {
    wake.push({ x: plane.x, z: PZ, i: lowI, seed: Math.random() * 100 });   // seed: motas estables
    if (wake.length > 150) wake.shift();
  }
  for (const wp of wake) wp.z -= run.spd * dt;
  prune(wake, w => w.z > 2.4);

  // rocío a ras del agua (escala con la cercanía) — solo sobre agua; sobre tierra levanta polvo
  //
  // `mas` multiplica el rocio y por omision es 1: el PASILLO no cambia. Lo levanta una CINEMATICA,
  // y por una razon honesta — el pasillo es juego y el rocio no puede taparte lo que tenes que
  // esquivar; un plano rasante es una TOMA, y ahi el agua saltando ES el tema.
  const nSpray = Math.round((alt < 2.8 ? 6 : alt < 4.5 ? 3 : alt < 7 ? 1 : 0) * (o.mas || 1));
  // DE DONDE SALE Y HACIA DONDE VA. Por omision es lo del PASILLO: una manchita angosta delante del
  // morro, que es donde uno la ve desde afuera del avion.
  //
  // DESDE ADENTRO ES OTRA COSA, y es el pedido del playtest: «el efecto rasante se hace adelante en
  // la punta, debe hacerse en los costados, bien alrededor de toda la cabina». Y es la verdad — a
  // dos metros del agua el avion levanta una cortina que el aire tira PARA ATRAS Y PARA AFUERA, y
  // desde la cabina lo que ves no es el chorro del morro (ese lo tapa el tablero): son los dos
  // muros de agua pasandote por al lado del canopy. Tres perillas, y las tres en 0 dejan el
  // pasillo exactamente como estaba:
  //   `ancho`  apertura del nacimiento, en unidades de MUNDO (4 = el chorrito del morro)
  //   `cerca`  cuanto mas cerca de la camara puede nacer: mas cerca = mas grande y mas afuera
  //   `abre`   cuanto se ABRE cada gota, proporcional a lo lejos del centro que nacio. Es lo que
  //            convierte una nube que sube en dos cortinas que se van a los costados.
  const ancho = o.ancho || 4, cerca = o.cerca || 2, abre = o.abre || 0;
  for (let i = 0; i < nSpray; i++) {
    const s = proj(plane.x + (Math.random() - 0.5) * ancho, 0, PZ - Math.random() * cerca);
    const onLand = o.tierra;
    const fuera = abre ? (s.x - W / 2) * abre : 0;
    parts.push({
      x: s.x, y: s.y - 1, vx: (Math.random() - 0.5) * 70 + fuera, vy: -(50 + Math.random() * 110) * (0.5 + lowI),
      life: 0.25 + Math.random() * 0.3, c: onLand ? (Math.random() < 0.6 ? '#6b6250' : '#4a4636') : (Math.random() < 0.7 ? P.foam : P.crest), r: 1 + Math.random() * 1.3
    });
  }
  if (alt < 4.5) run.shake = Math.max(run.shake, (4.5 - alt) * 0.3);
}
