// HORIZONTE GIRATORIO — cuanto se inclina el MUNDO en pantalla cuando el avion rola.
//
// ES 100% COSMETICO. proj() usa W/2, HOR, F y cam, y se resuelve ANTES de que el canvas rote:
// colisiones, spawn, hitboxes y dificultad no ven nada de esto. Lo unico que se mueve es el
// raster ya dibujado. Por eso se puede prender y apagar en pleno vuelo sin resetear nada
// (a diferencia de ACANTILADO o ARRANQUE, que recolocan el avion).
//
// QUE ARREGLA. Hasta ahora, en un tonel el SPRITE giraba 360° contra un mar perfectamente plano,
// y eso se lee como "el modelito esta girando", no como "estoy rolando". Con la camara pegada al
// avion —que es como se ve desde atras— pasa al reves: el avion queda derecho y el que gira es
// el mundo. Es la misma tecnica que ya usa el MOMENTUM (game.js rota -mom.roll y drawMomentum lo
// deshace para la cabina); aca se extiende al PASILLO.
//
// CUATRO POSICIONES (cfg.horizon), no un SI/NO — igual que RED RADAR. Cada una CONTIENE a la
// anterior, asi que la lista se lee como una perilla de "cuanto se mueve el mundo":
//   0 FIJO      el mundo nunca se inclina, como siempre. Es la salida para quien se marea.
//   1 PIRUETAS  solo durante tonel/maniobra (DEFAULT): el giro es un EVENTO que premia la
//               pirueta, y entre pirueta y pirueta el horizonte esta quieto.
//   2 TOTAL     ademas el alabeo continuo del vuelo normal inclina el horizonte.
//   3 LIBRE     ademas [Q] y [E] hacen ROLAR a voluntad, sin tope: el suelo puede terminar en el
//               techo y quedarse ahi mientras aguantes la tecla. Al soltar, se endereza solo.
//
// Vive en OPCIONES y no en el menu [M] a proposito: [M] solo se abre desde la seleccion de avion
// y la campaña nunca pasa por ahi, asi que quien lo necesitara apagado en campaña quedaria
// atrapado. Ver el bloque OPT_ROWS en game.js.
import { S, cfg, plane } from './state.js';
import { run } from './run.js';
import { ROLL_DUR } from '../data/tuning.js';

export const HZ_FIX = 0, HZ_MOVES = 1, HZ_ALL = 2, HZ_FREE = 3;
export const HZ_N = 4;
// ALABEO PLENO del avion, en radianes. No es un numero a ojo: los frames horneados del sprite van
// de -60° a +60° (ver SHEET_NF en data/planes.js), asi que plane.bank = ±1 ES ±60°.
export const BANK_FULL = Math.PI / 3;
// Inclinacion maxima (rad) del modo TOTAL: ~25°, alrededor de DOS QUINTOS del alabeo real. Sigue
// siendo menos que la verdad a proposito —el alabeo esta SIEMPRE presente, y darlo entero seria un
// fondo que nunca se queda quieto— pero el 0.22 anterior (12.6°) se leia como un temblor y no como
// una virada. Se subio al doble a pedido: doblar tiene que SENTIRSE.
export const BANK_TILT = 0.44;

// LO QUE SOLO SE LEE CON EL MUNDO DERECHO. Hay dibujo que depende de que el horizonte este donde
// se espera: hoy, la RED DE RADAR (render/world.js), que es un plano horizontal y se entiende como
// "techo" solo vista desde abajo. Rolado deja de informar y pasa a ser ruido, asi que se funde.
//
// SE MIDE LA INCLINACION QUE EL JUGADOR VE, hzWorld(), y punto. Costo dos intentos llegar aca:
//
//   1º Se median los 0.30..0.95 rad de la inclinacion total. A 20° de tonel la red seguia al 70%.
//   2º Se separo la MANIOBRA (pirueta + giro libre) del BANQUEO continuo y se dejo el banqueo
//      afuera, para poder ser agresivo sin apagar la red cada vez que el jugador dobla en TOTAL.
//      Peor: con CONTROL POR ALABEO el avion banquea todo el tiempo, asi que la red se quedaba
//      entera justo mientras el mundo estaba torcido.
//
// El error de las dos fue optimizar contra una distincion que existe en el codigo y NO en la
// pantalla. El jugador no ve "una maniobra" ni "un banqueo": ve el mundo inclinado. Si esta
// inclinado, un plano horizontal no se lee, venga de donde venga el angulo.
//
// Que el modo TOTAL tambien la funda al banquear a fondo NO es un efecto colateral que haya que
// tolerar: es lo mismo que se queria: la red vuelve entera en cuanto nivelas, que es cuando se
// puede leer. Y el fundido no parpadea porque el angulo del que sale ya viene suavizado.
// TILT_FADE1 esta DEBAJO de BANK_TILT a proposito: asi banquear a fondo la apaga del todo y no
// deja un fantasma al 12%, que es lo que quedaba con 0.24 y se seguia viendo.
//
// AL DUPLICAR BANK_TILT (0.22 → 0.44) ESTOS DOS NUMEROS NO SE TOCARON, y no es un olvido: miden
// una INCLINACION EN PANTALLA, no una fraccion de la palanca. La pregunta que responden es "¿a
// que angulo deja de leerse un plano horizontal?", y esa respuesta no cambia porque el avion
// llegue antes a ese angulo. Lo unico que cambia es que ahora se llega a media palanca.
export const TILT_FADE0 = 0.07, TILT_FADE1 = 0.21;

/** PURA: cuanto sobrevive (1 entero, 0 apagado) con el mundo inclinado `tilt` radianes.
 *  En grados: 4° entera · 6° 0.75 · 8° 0.50 · 10° 0.25 · 12° nada (y el tope del banqueo en
 *  TOTAL son 25°, o sea que ya a media palanca la apaga). Volando derecho el bamboleo normal ni
 *  la roza, y con el horizonte en FIJO hzWorld() es siempre 0 y esto no se activa nunca. */
export const tiltFade = tilt => {
  const t = Math.abs(tilt);
  return t <= TILT_FADE0 ? 1 : t >= TILT_FADE1 ? 0 : 1 - (t - TILT_FADE0) / (TILT_FADE1 - TILT_FADE0);
};

/** Rotacion propia del SPRITE por pirueta: tonel legado (run.rollT) o maniobra (run.mvRoll).
 *  Es la MISMA cuenta que hace render/plane.js — de ahi sale, para que no haya dos formulas. */
export const spriteRoll = () => run.rollT > 0
  ? run.rollDir * (1 - run.rollT / ROLL_DUR) * Math.PI * 2
  : run.mvRoll;

/** PURA (se prueba en Node, sin canvas): angulo del mundo en radianes.
 *  Es el OPUESTO al del avion — si el avion rola a la derecha y la camara va con el, el mundo
 *  aparece girando a la izquierda.
 *
 *  Los terminos SE SUMAN (girar libre boca abajo y ENCIMA tirar un tonel son dos vueltas, no una),
 *  con una sola excepcion: durante una pirueta el banqueo continuo no se cuenta. Es que el alabeo
 *  del sprite durante la maniobra ya no significa lo que significa volando derecho, y sumarlo
 *  metia un temblor en el angulo justo cuando el mundo esta dando la vuelta. */
export function horizonRoll(mode, roll, bank, free) {
  if (!mode) return 0;
  const b = mode >= HZ_ALL && !roll ? Math.max(-1, Math.min(1, bank)) * BANK_TILT : 0;
  const a = roll + b + (mode === HZ_FREE ? free || 0 : 0);
  return a ? -a : 0;   // el `? :` evita devolver -0, que no rompe nada pero ensucia comparaciones
}

/** El modo VIGENTE ahora mismo, o 0. Solo gira en el PASILLO: el momentum tiene su propio roll
 *  (game.js) y en el arena la camara es del sistema 3D. */
export const hzMode = () => S.state === 'play' ? cfg.horizon : 0;

/** Angulo del MUNDO este cuadro. Lo consultan draw() y viewMouse() — sin parametros, para que
 *  no puedan discrepar. */
export const hzWorld = () => horizonRoll(hzMode(), spriteRoll(), plane.bank, run.freeRoll);

/** Cuanto hay que SUMARLE a la rotacion del sprite para cancelar la que el mundo ya absorbio.
 *  Si no, el avion giraria dos veces (una por el mundo, otra por si mismo) y el efecto se
 *  perderia. Solo cancela la PIRUETA: el alabeo continuo no rota el sprite (lo traen los frames
 *  horneados), asi que restarselo lo inclinaria para el lado equivocado. */
export const hzSprite = () => { const r = spriteRoll(); return hzMode() && r ? -r : 0; };


/** ACTITUD: cuanto esta rolado el avion DE VERDAD, en radianes. Es lo que lee el horizonte
 *  artificial del HUD (render/hud.js).
 *
 *  NO depende de cfg.horizon, y es a proposito: un instrumento no se apaga porque apagues el
 *  efecto visual — con el horizonte FIJO pasa a ser la UNICA forma de saber como venis. Por eso
 *  puede no coincidir con lo que se ve afuera: en TOTAL el fondo se inclina BANK_TILT, un quinto
 *  de esto, para no marear. Durante una PIRUETA los dos son exactamente el mismo numero. */
export const attitude = () => {
  const r = spriteRoll();
  return run.freeRoll + (r || Math.max(-1, Math.min(1, plane.bank)) * BANK_FULL);
};

// ---------- GIRO LIBRE ([Q] / [E], modo LIBRE) ----------
// VELOCIDAD a fondo: ~1.9 s por vuelta completa. Mas rapido y el mundo se vuelve ilegible; mas
// lento y no llegas a ponerlo boca abajo antes de que se te venga un obstaculo encima.
export const FREE_ROLL_V = 3.3;
// ENDEREZADO al soltar. Es el doble de rapido que el del momentum (1.1), del que salio el resto de
// esta cinematica: alla el rolido dura un instante, aca podes soltar boca abajo y con 1.1 volver a
// nivel tardaba casi tres segundos — se sentia como un avion mojado, no como soltar la palanca.
const FREE_LEVEL = 2.2;

/** Avanza el giro libre. `d` es el sentido que pide el jugador: -1, 0 o +1.
 *
 *  Vive ACA y no en un sistema aparte porque son seis lineas que forman una sola regla con el
 *  resto del archivo: partirlas dejaria el angulo en un lado y su integrador en el otro. La llama
 *  game.js una vez por cuadro, junto al resto de la actualizacion de vuelo.
 *
 *  RECIBE el sentido en vez de leer `inp`: importar core/input.js aca arrastraria render/ctx.js
 *  —que toca `document`— y este modulo dejaria de poder probarse en Node.
 *
 *  El peso (entra y sale interpolado) esta copiado del alabeo del MOMENTUM a proposito: es el
 *  mismo gesto en las dos fases del juego y tiene que sentirse igual. */
export function stepHorizon(dt, d) {
  if (hzMode() !== HZ_FREE) {
    // al salir del modo (o de 'play') el mundo vuelve derecho, no se queda torcido para siempre
    run.freeRoll = 0; run.freeRollV = 0;
    return;
  }
  run.freeRollV += (d * FREE_ROLL_V - run.freeRollV) * Math.min(1, dt * 2.8);
  run.freeRoll += run.freeRollV * dt;
  // SIN tecla se endereza solo, y por el CAMINO CORTO. Primero se DESCARTAN las vueltas enteras
  // —2*PI es el mismo angulo que 0, asi que restarlas no se ve— y recien despues se interpola a
  // cero. Sin ese descarte el acumulado se queda clavado en 6.28 para siempre: visualmente
  // derecho, pero el numero nunca vuelve a casa y la proxima medicion miente.
  //
  // El efecto secundario es el bueno: soltando PASADA la media vuelta el resto se completa para
  // el lado que ibas, en vez de rebobinar. Y nunca te deja colgado boca abajo sin querer.
  if (!d) {
    run.freeRoll -= Math.round(run.freeRoll / (Math.PI * 2)) * Math.PI * 2;
    run.freeRoll -= run.freeRoll * Math.min(1, dt * FREE_LEVEL);
    if (Math.abs(run.freeRoll) < 1e-3) { run.freeRoll = 0; run.freeRollV = 0; }
  }
}
