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
import { PZ, W, H, HOR } from '../render/ctx.js';
import { FLY_X, FLY_TOP, ALA_PX } from '../data/tuning.js';
import { PITCH_LERP } from '../core/physics.js';
import { hzWorld } from '../core/horizon.js';

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
  // LA DERIVA DE LA CURVA (zigzag Z2) se suma ACA, en la integracion, y NUNCA a `plane.vx`.
  // No es un detalle de estilo: con CONTROL POR ALABEO, `flight.js` ASIGNA `plane.vx` entero
  // cada cuadro (`plane.vx = bankVx(...)`), asi que un empujon a la velocidad se pisaria solo y
  // el modo por alabeo no sentiria la curva. Sumada a la posicion, la centrifuga la sienten los
  // dos esquemas de control igual.
  //
  // Como el resto de lo que este modulo no conoce (el poder RASANTE, el techo de una cinematica),
  // llega POR PARAMETRO: la cama de vuelo no sabe que existe el zigzag. Sin el parametro vale 0,
  // y por eso una cinematica —o el juego con el pasillo recto— integra exactamente como siempre.
  plane.x += (plane.vx + (o.deriva || 0)) * dt;
  plane.y += plane.vy * dt;
  // EL TOPE LATERAL, que por omision es el carril de siempre. Lo levanta EL CALLEJON (zigzag Z3)
  // y por una razon de correccion, no de gusto: con paredes, la cara de la roca queda MAS AFUERA
  // que FLY_X, asi que el avion se frenaba contra el borde invisible de siempre y no podia tocar
  // la ladera nunca — la pared quedaba de adorno. Con paredes, el limite del carril ES la roca.
  //
  // Es el mismo mecanismo que `techo`: un parametro con default, para que sin callejon la cuenta
  // sea exactamente la de siempre y `feel` no se mueva.
  const limX = o.limX || FLY_X;
  if (plane.x < -limX) { plane.x = -limX; plane.vx = 0; }
  if (plane.x > limX) { plane.x = limX; plane.vx = 0; }
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
  // LA MIRADA AL APICE (zigzag Z2): en la curva la camara se adelanta HACIA ADENTRO, que es lo
  // que hace un piloto y lo que hace que la curva se descubra a tiempo en vez de aparecer. Entra
  // por el mismo renglon que el corrimiento del poder RASANTE porque es lo mismo —correr la
  // camara al costado— y asi hereda gratis el peso del lerp: la mirada VIAJA, no salta.
  cam.x += (plane.x * 0.86 + lat + (o.lead || 0) - cam.x) * Math.min(1, dt * 7);
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


// CUANTO SE LA LLEVA EL AIRE, y cuanto queda del salto original. Las dos son del rocio y viven
// juntas porque se reparten el mismo gesto: subir y volar para atras (ver estelaVuelo).
const BARRIDO = 2.8;   // x la velocidad del avion: a spd 80 son ~224 px/s de mundo
// EL ENVION HACIA ARRIBA de la gota barrida: CERO. Es lo unico que la sacaba del rayo del
// barrido — con 0.55 la gota subia mientras el mundo se iba, y el resultado era una direccion
// propia que no coincidia con ninguna raya de la pantalla. Lo vertical lo hacen las particulas de
// COLUMNA, que son otras y para eso estan; estas van EN LINEA y nada mas.
const SALTO = 0;
// LA APERTURA DE LA V, y no es un numero libre: es el MISMO con el que se abren los brazos de
// la estela en render/world.js (`spread = (0.6 + trail * 0.34) * s.k`). Si los dos no abren
// igual, el rocio y el agua batida se leen como dos efectos distintos pegados.
const ABRE_V = 0.34;
// CUANTAS gotas nacen en las PUNTAS (el resto va bajo el fuselaje: el agua que el avion empuja
// con su propia presion). Y de las de punta, cuantas son COLUMNA — la lineita vertical que sube
// antes de que el aire se la lleve. Las dos son fracciones: 1 = todas.
const PUNTA = 0.7, COLUMNA = 0.45;

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
    const nace = (Math.random() - 0.5) * ancho;                  // de que lado del eje nacio
    const s = proj(plane.x + nace, 0, PZ - Math.random() * cerca);
    // TIERRA ES TODO LO QUE NO ES AGUA, y eso incluye la PISTA. Los dos datos existen porque
    // dicen cosas distintas —`tierra` es "hay relieve abajo" y `pista` es "estoy sobre la
    // cabecera"— pero para lo que salta son lo mismo: polvo, no espuma. Mirando solo `tierra`,
    // rasar la pista de salida levantaba agua de mar sobre el asfalto.
    const onLand = o.tierra || o.pista;
    const fuera = abre ? (s.x - W / 2) * abre : 0;
    // NACE EN LAS PUNTAS DE ALA, no en el morro. Es lo que pasa de verdad: lo que arranca el agua
    // son los VORTICES DE PUNTA DE ALA tocando la superficie, y por eso el agua sale en DOS LINEAS
    // y no en un chorro central. Cerca de la superficie esos vortices dejan de bajar y se separan
    // muy despacio —dos o tres nudos contra doscientos de avance—, o sea que la V es CORTA: dos
    // lineas casi paralelas que se abren de a poco, no un abanico.
    //   fuente: https://pilotinstitute.com/wingtip-vortices/
    // Se usa el MISMO `ALA_PX` que las cortinas de punta de ala de render/plane.js (F3.1), que ya
    // nacian ahi: sin compartir el numero, el rocio y las cortinas se leen como dos efectos
    // distintos pegados uno al lado del otro.
    const punta = Math.random() < PUNTA;
    const lado = punta || nace === 0 ? (Math.random() < 0.5 ? -1 : 1) : Math.sign(nace);
    // LA PUNTA, MEDIDA. `run.alaLx/alaRx` los publica el render con la tabla de anclas de ESTA
    // pose (data/anclas.js): sigue el alabeo, el cabeceo y el punto de vista de la hoja del poder.
    // El ancho fijo de abajo es el plan B para cuando el dato esta viejo —el avion no se dibujo
    // este cuadro: cinematica, pausa, otro modo— y para eso esta `alaT`.
    const fresco = run.t - run.alaT < 0.2;
    const tipX = lado < 0 ? run.alaLx : run.alaRx;
    const bx = punta ? (fresco ? tipX : s.x + lado * ALA_PX) : s.x;
    // LA COLUMNA: la primera mitad del gesto. El vortice levanta el agua DERECHO —una lineita
    // vertical de dos o tres pixeles en la punta del ala— y recien despues el viento relativo se
    // la lleva. Va como particulas APARTE y no como una curva porque el paso de particulas es
    // lineal (x += vx*dt, con gravedad fija y chica): una sola gota con envion arriba y barrido
    // atras dibuja una DIAGONAL, no "primero vertical y despues abierta". Con dos poblaciones si.
    if (punta && Math.random() < COLUMNA) {
      parts.push({
        x: bx, y: s.y - 1, vx: (Math.random() - 0.5) * 8, vy: -(150 + Math.random() * 90),
        life: 0.09 + Math.random() * 0.07,
        c: onLand ? '#6b6250' : (Math.random() < 0.5 ? P.foam : '#f2f7fb'), r: 1,
      });
      continue;
    }
    // EL AIRE SE LA LLEVA (13/9). Una gota arrancada del agua a 300 km/h sube un palmo y el viento
    // relativo la tira PARA ATRAS: no es una fuente, es algo que el avion atropella. Subia derecho
    // —vy negativo y nada mas— y por eso se leia como agua hirviendo debajo del avion.
    //
    // "Atras" EN ESTA CAMARA es alejarse del PUNTO DE FUGA, (W/2, HOR): ahi converge todo lo que
    // pasa de largo, porque en proj() la k tiende a 0 cuando la z tiende a infinito. Asi que al
    // rocio se le suma una velocidad RADIAL desde ese punto, que es la misma direccion en la que
    // se van el mar y los obstaculos — la gota vuela con el mundo y no contra el.
    //
    // Y ES PROPORCIONAL A LA VELOCIDAD porque de eso se trata: a 200 km/h las gotas se despegan y
    // se van, a 700 pasan como rayas. El mismo numero que mueve el mundo mueve el rocio.
    // EL ANGULO ES EL DEL BARRIDO, y el barrido es RADIAL PURO. Comprobado por eliminacion: sin el
    // poder no hay rayas largas en pantalla, o sea que las rayas son el desenfoque — y el
    // desenfoque smearea ESCALANDO el cuadro entero desde el punto de fuga (render/desenfoque.js),
    // asi que cada pixel se estira sobre su propio rayo, sin achatar nada. Se probo con el achatado
    // de las lineas de velocidad (FUGA_Y) y era la referencia equivocada.
    // …Y EL GIRO DEL MUNDO, que es lo que faltaba. El mundo se dibuja ADENTRO de una rotacion
    // alrededor del CENTRO de la pantalla (game.js, hzW) y el barrido se hace DESPUES, sobre el
    // cuadro ya rotado. Asi que una direccion calculada aca —antes de rotar— aparece en pantalla
    // girada `hzW` respecto de las rayas. Con el avion nivelado hzW es 0 y no se nota; en la camara
    // del PODER, que compensa el rolido, no es cero, y ahi es donde se veia torcido.
    //
    // Se resuelve en tres pasos: llevar el nacimiento al espacio FINAL (rotarlo), sacar AHI la
    // direccion radial, y traerla de vuelta girando al reves — asi, al dibujarse rotada, cae
    // exactamente sobre el rayo. Girar solo el resultado no alcanza: el punto tambien se mueve.
    const hz = hzWorld(), hc = Math.cos(hz), hs = Math.sin(hz);
    const rx0 = bx - W / 2, ry0 = s.y - H / 2;
    const fx2 = W / 2 + rx0 * hc - ry0 * hs, fy2 = H / 2 + rx0 * hs + ry0 * hc;
    const ex = fx2 - W / 2, ey = fy2 - HOR;
    const en = Math.max(1, Math.hypot(ex, ey));
    const dx = (ex / en) * hc + (ey / en) * hs, dy = -(ex / en) * hs + (ey / en) * hc;
    const d = 1;                                   // dx,dy ya vienen normalizados
    const barrido = run.spd * BARRIDO;
    // LA V, Y POR QUE SALE SOLA. El agua batida ya dibuja una (drawWake: los brazos se abren
    // ABRE_V por metro de estela) y el rocio tiene que ser LA MISMA o se leen como dos efectos
    // distintos pegados uno al otro. Como las gotas nacen casi en el eje y se van con velocidad
    // lateral CONSTANTE, su rastro ARRANCA EN PUNTA Y SE ABRE — una divergencia constante desde
    // un mismo origen ES una V—: primero vertical, despues abierta, sin programar ninguna de las
    // dos cosas. Lo que habia era velocidad lateral AL AZAR, y eso con el mismo origen da nube.
    //
    // El lado lo decide donde nacio; la que nace justo en el eje se la juega a cara o ceca.
    parts.push({
      x: bx, y: s.y - 1,
      // `s.k` mete la perspectiva: la V del agua se abre en METROS, asi que a la misma distancia
      // tiene que abrirse los mismos pixeles que la estela, no un ancho fijo de pantalla.
      vx: (Math.random() - 0.5) * 14 + fuera + lado * ABRE_V * run.spd * s.k,
      // el salto hacia arriba se achica: lo que hace el gesto ahora es el barrido, y con el salto
      // entero la gota subia mas de lo que se iba, que es justo lo que se venia a arreglar.
      vy: -(50 + Math.random() * 110) * (0.5 + lowI) * SALTO + (dy / d) * barrido,
      life: 0.25 + Math.random() * 0.3, c: onLand ? (Math.random() < 0.6 ? '#6b6250' : '#4a4636') : (Math.random() < 0.7 ? P.foam : P.crest), r: 1 + Math.random() * 1.3
    });
  }
  if (alt < 4.5) run.shake = Math.max(run.shake, (4.5 - alt) * 0.3);
}
