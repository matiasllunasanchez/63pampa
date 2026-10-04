// ESCUADRON — el sistema del RELEVO. Cuando el lider cae y queda formacion, aca vive la
// cinematica: la camara se queda con los restos, el companero entra desde afuera, PASA por el
// lugar de la caida y se asienta en el carril con esquive automatico. El corazon emocional de
// la mecanica es ese pase: el piloto nuevo VE morir a su companero y continua.
//
// REGLA DEL LIMITE: no llama hacia arriba. game.js decide si una muerte es relevo o fin
// (onDeath), le pide a este modulo startRelevo/updateRelevo, y updateRelevo DEVUELVE 'done'
// cuando hay que devolver el control. Durante el estado 'relevo' ni flight ni collision corren,
// asi que la invulnerabilidad de la ventana es ESTRUCTURAL: no hay nadie que pueda devolver
// { death } — no hace falta repartir un flag de gracia por todos los sistemas de muerte.
//
// La matematica pura (fases, indicativos, puestos de formacion) esta en core/squad.js para que
// tools/unit.js la pruebe sin canvas. Aca queda solo lo que toca stores.

import { cfg, cam, plane } from '../core/state.js';
import { AVION } from '../data/pilots.js';
import { run } from '../core/run.js';
import { obstacles, missiles } from '../core/world.js';
import { proj } from '../core/fx.js';
import { nuevoHumo, humoFocos } from '../core/humo.js';
import { FLY_TOP, MSL_MAX } from '../data/tuning.js';
import { PZ } from '../render/ctx.js';
import { beep, sfxOne, duck } from './audio.js';
import { resetAguante } from './aguante.js';
import { RELEVO_WRECK, REBOBINA_T, RELEVO_GRACE, RELEVO_DUR, RELEVO_AHORRO, pilotIdx, relevoPhase, callsign, naftaCompanero,
  filaOk, filaDeVidas, CAMBIO_CD, cambioEntraDz } from '../core/squad.js';

// --- estado privado del subsistema ---
let rv = null;      // el relevo en curso (null fuera de la cinematica)
let exitT = -1;     // reloj de la SALIDA DE PLANO de la formacion al CONTROL LIBRE (-1 = no corre)
// ROSTER de la corrida: null = arcade (PATRIA 1..N anonimos, el relevo es una muerte);
// una lista de nombres = campaña (los Fieles: el relevo es un AVERIADO que vuelve a la base).
// Lo fija game.js en reset() segun el modo — un solo escritor, como todo el estado de aca.
let roster = null;

export function setRoster(r) { roster = r; }
export const rosterActive = () => !!roster;
/** Nombre en radio del numeral `idx`: Fiel con nombre en campaña, PATRIA n en arcade.
 *  Mas alla de la lista (escuadron agrandado en pruebas), numerales CAUQUEN del guion. */
export const pilotName = idx => roster ? (roster[idx] || 'CAUQUEN ' + (idx + 1)) : callsign(idx);
/** El nombre PINTADO del avion del numeral `idx` (data/pilots.js AVION), o null: fuera de campaña
 *  no hay Fieles, y un CAUQUEN de pruebas no tiene chapa con nombre. */
export const planeName = idx => roster ? (AVION[roster[idx]] || null) : null;

/** Cuanto dura la salida de plano tras el despegue (la formacion pasa detras de la camara). */
export const EXIT_T = 0.9;

// --- accesores (el render y game.js solo leen) ---
export const relevo = () => rv;
export const exitState = () => (exitT >= 0 ? exitT : null);

/** Reinicia el subsistema entre runs (lo llama reset() del juego). */
export function resetSquad() { rv = null; exitT = -1; }

/** Al pasar a 'play' desde el despegue: arranca la salida de plano de la formacion.
 *  Con ARRANQUE: EN VUELO no hubo despegue ni formacion, asi que no hay nada que salga. */
export function beginExit() { if (run.squad > 1 && cfg.start !== 'air') exitT = 0; }
export function tickExit(dt) { if (exitT >= 0) { exitT += dt; if (exitT > EXIT_T) exitT = -1; } }

// ---------- LA FILA Y EL CAMBIO DE PILOTO (core/squad.js, pedido del autor 26/9/2026) ----------

/** Corrida nueva: la fila en orden, nadie con ficha propia, ningun cambio en curso. Va DESPUES de
 *  que game.js fija `squad` y `lives` — una partida guardada puede arrancar con aviones caidos. */
export function resetFila() {
  run.orden = filaDeVidas(run.squad, run.lives);
  run.flota = []; run.gastoLider = 0;
  run.cambioCd = 0;
}

/** LA FICHA del avion que vuela: lo que se lleva cuando pasa atras. `gastoRef` fotografia cuanto
 *  llevaba gastado el que manda, para cobrarle despues solo lo que gasto el mientras esperaba. */
function ficha() {
  return { fuel: run.fuel, fuelSync: run.fuelSync, tanque: run.tanque, naftaCap: run.naftaCap,
    integ: run.integ, escudo: run.escudo, escudoT: run.escudoT, msl: run.msl, gastoRef: run.gastoLider };
}

/** La ficha del numeral `i` AHORA. Los de atras vuelan a crucero economico: gastan RELEVO_AHORRO de
 *  lo que gasta el que manda (la misma regla que ya usaba el relevo, ver naftaCompanero). Se lleva
 *  como UN acumulador de lo que gasto el lider y no como un tanque por avion descontado cuadro a
 *  cuadro: la cuenta es la misma y cuesta una resta.
 *
 *  UN AVION QUE TODAVIA NO VOLO no tiene ficha: arranco lleno, sano y con su carga, y desde el
 *  despegue viene gastando a crucero economico. Su tanque (con ruta) es el del que manda — la
 *  estructura de la carga es la misma— y la diferencia de % la pasa a km la sincronizacion de
 *  systems/nafta.js, que es la puerta de siempre para lo que le pasa a la nafta desde afuera. */
function fichaDe(i) {
  const f = run.flota[i];
  const gasto = RELEVO_AHORRO * (run.gastoLider - (f ? f.gastoRef : 0));
  if (!f) return { fuel: Math.max(0, 100 - gasto), tanque: null, integ: 100, escudo: 1, escudoT: 0, msl: MSL_MAX };
  return { ...f, fuel: Math.max(0, f.fuel - gasto) };
}

/** Sube al avion `f` a los mandos. `conMunicion` en false deja las bombas como estan. */
function ponerFicha(f, conMunicion) {
  if (f.tanque) { run.tanque = f.tanque; run.naftaCap = f.naftaCap; run.fuelSync = f.fuelSync; }
  run.fuel = f.fuel;
  run.integ = f.integ; run.escudo = f.escudo; run.escudoT = f.escudoT;
  if (conMunicion) run.msl = f.msl;
}

/** Lo que gasto el que manda este cuadro (solo lo que BAJO: la Chancha no le carga a los de atras). */
export function gastoLider(d) { if (d > 0) run.gastoLider += d; }

/** CAMBIO DE PILOTO: el que vuela pasa al fondo de la fila con su ficha, y sube el siguiente con la
 *  suya. Devuelve { sale, entra } o null si no hay a quien pasarle. Lo que es DEL PILOTO en vuelo —
 *  la racha, el estado rasante, el posquemador prendido, la pirueta a medias— no cambia de manos:
 *  se corta, como en el relevo. Lo que es DEL AVION se va con el avion. */
export function cambiar() {
  if (!filaOk(run)) run.orden = filaDeVidas(run.squad, run.lives);
  if (run.orden.length < 2) return null;
  const sale = run.orden.shift();
  run.flota[sale] = ficha();
  run.orden.push(sale);
  const entra = run.orden[0];
  ponerFicha(fichaDe(entra), true);
  delete run.flota[entra];   // mientras vuela, su ficha es `run`
  run.streak = 0; run.rasLevel = 0; run.graceT = 0;
  resetAguante();
  run.afterT = 0; run.afterTier = 0; run.afterGrace = 0; run.boost = false;
  run.heat = 0; run.overheat = false; run.rollCd = 0;
  run.mv = null; run.mvT = 0; run.mvRoll = 0; run.mvGiro = 0; run.mvSteep = 0; run.mvCobra = 0; run.mvFreno = 0;
  run.scrapeT = 0; run.scrapeVib = 0;
  run.cambioCd = CAMBIO_CD;
  beep(520, 0.06, 'square', 0.04, 160);
  return { sale, entra };
}

/** LA CINEMATICA DEL CAMBIO (pedido del autor, 27/9: "tiene que haber una cinematica entre cambio y
 *  cambio" — lo que no queria era "la cinematica del avion DAÑADO"). Monta sobre la del relevo, que
 *  ya tiene todo lo que hace falta: barras negras, piloto automatico con esquive, camara, la voz del
 *  que entra y el texto de quien asume. Lo que cambia con `rv.cambio`:
 *    · NO HAY RESTOS: el primer tiempo (la camara clavada en el caido) dura la mitad — lo justo para
 *      ver al tuyo abrirse y quedarse atras— y enseguida entra el siguiente.
 *    · EL QUE SE VA ESTA SANO: nivelado, sin tambaleo, sin humo (fallenPos, drawFallen).
 *    · NO SE DESCUENTA NADA: la fila rota y las fichas se cambian (`cambiar`), nadie cae.
 *  Devuelve { sale, entra } o null. Quien llama pone el estado 'relevo'. */
export function startCambio() {
  const c = cambiar();
  if (!c) return null;
  const wx = plane.x, wy = Math.max(2, plane.y), side = wx > 0 ? -1 : 1;
  const t0 = RELEVO_WRECK * 0.5;
  rv = {
    t: t0, t0, cambio: true, cause: null, spent: null,
    fallen: c.sale, next: c.entra,
    wx, wy, side,
    // entra por su carril, apenas corrido hacia el lado con mas aire (el tuyo se corre al otro), a
    // tu misma altura: viene de atras, no de arriba
    x0: wx + side * 4, y0: wy,
    x2: wx + side * 2, y2: Math.max(6, Math.min(11, wy)),
    said: false,
  };
  plane.x = rv.x0; plane.y = rv.y0;
  plane.vx = 0; plane.vy = 0; plane.bank = 0; plane.pitch = 0;
  return c;
}

/** El corrimiento de profundidad con que se DIBUJA al que entra en un cambio (0 fuera de uno). */
export const cambioDz = () => (rv && rv.cambio ? cambioEntraDz(rv.t) : 0);

/** Un cuadro de la espera entre cambios. */
export function tickFila(dt) { if (run.cambioCd > 0) run.cambioCd = Math.max(0, run.cambioCd - dt); }

/** Se puede pedir otro: hay a quien pasarle y paso la espera. */
export const puedeCambiar = () => (filaOk(run) ? run.orden.length : run.lives) > 1 && run.cambioCd <= 0;

/** Arranca el relevo: descuenta la vida, congela el punto de la caida y prepara al companero.
 *  game.js ya disparo crashFX() — los restos del lider estan volando cuando esto corre. */
export function startRelevo(cause, spent) {
  // LA FILA: cae el primero y vuela el que seguia. Con la mecanica apagada la fila esta en orden y
  // esto da el mismo `next` que `pilotIdx` daba antes; si una sonda la desincronizo, se rehace.
  if (!filaOk(run)) run.orden = filaDeVidas(run.squad, run.lives);
  const fallen = run.orden.shift();
  run.lives--;
  const next = run.orden.length ? run.orden[0] : pilotIdx(run.squad, run.lives);
  const wx = plane.x, wy = Math.max(2, plane.y);
  // el companero entra por el lado con mas aire, desde ALTO y fuera de pantalla: la lectura es
  // "venia ahi atras, cubriendote" — no un respawn que aparece de la nada
  const side = wx > 0 ? -1 : 1;
  // ERRAR LA BOMBA NO ES UN DAÑO (pedido del autor, 27/9): el que fallo la suelta no esta roto, y
  // ademas YA PASO — se fue trepando en el fundido de la pasada perdida. "No tengo que volver a ver
  // el mio": no hay avion que se va (`solo`). El primer tiempo, estirado, es EL REBOBINADO —la
  // camara vuelve por el pasillo hasta el de la fila, que viene lejos (game.js)— y despues el
  // siguiente entra desde atras como en el cambio de piloto. La cuenta es la del relevo.
  const sano = spent === 'suelta';
  const t0 = sano ? RELEVO_WRECK - REBOBINA_T : 0;
  rv = {
    t: t0, t0, cambio: sano, solo: sano, cause,
    // RF-15: `spent` = la pasada se gasto (soltaste o secaste el tanque), NO te derribaron. Cambia
    // el titular de la cinematica y nada mas — la cuenta es la misma. Sin esto la pantalla decia
    // "DERRIBADO" sobre un avion al que nadie toco, que es la clase de mentira que rompe un juego.
    spent: spent || null,
    fallen, next,
    wx, wy, side,                                       // donde cayo el lider (la camara arranca aca)
    x0: sano ? wx : wx + side * 30, y0: sano ? wy : Math.min(FLY_TOP - 10, wy + 13),
    x2: sano ? wx : wx * 0.5, y2: Math.max(6, Math.min(11, wy)),   // punto de asentado (carril + altura sana)
    said: false,
  };

  // RESET PARCIAL — nunca reset(): la mision es LA MISMA. Se conserva puntaje, distancia,
  // stats, objetivo, y se HEREDA la municion. El combustible NO se hereda tal cual: el compañero
  // venia atras ahorrando (naftaCompanero) — entra con mas que el lider, nunca lleno: reponerlo
  // al 100% convertiria morir en la forma barata de repostar. Lo que si se pierde: racha,
  // multiplicador y afterburner — el avion nuevo entra frio.
  // CON CAMBIO DE PILOTO, EL QUE ENTRA TRAE LO SUYO (ver `fichaDe`): la nafta que gasto volando
  // atras, su chapa y sus bombas — cada avion es un avion. Menos las bombas si la pasada se gasto en
  // LA SUELTA: ahi el estante del que sigue ya lo colgo systems/blanco.js (`enFila`), y es el suyo.
  // Sin la mecanica, la cuenta de siempre: entra con naftaCompanero y la chapa sana (game.js).
  if (cfg.cambioPiloto) { ponerFicha(fichaDe(next), spent !== 'suelta'); delete run.flota[next]; }
  else run.fuel = naftaCompanero(run.fuel);
  run.scrapeT = 0; run.scrapeVib = 0;
  run.streak = 0; run.rasLevel = 0; run.mult = 1; run.multShow = 1; run.graceT = 0;
  resetAguante();                                      // el estado RASANTE no se hereda
  run.afterT = 0; run.afterTier = 0; run.afterGrace = 0;
  run.boost = false; run.throttle = 0;
  run.heat = 0; run.overheat = false;                   // canon propio, frio
  run.rollCd = 0;
  run.mv = null; run.mvT = 0; run.mvRoll = 0; run.mvGiro = 0; run.mvSteep = 0; run.mvCobra = 0; run.mvFreno = 0;
  run.bloodSplat = 0;
  run.gear = 0;                                         // llega volando: tren recogido
  run.spd = Math.max(56, Math.min(run.spd, 110));       // entra a velocidad de crucero
  // la tanda que mato al lider no se hereda: seria morir dos veces por el mismo disparo.
  // El radar (run.detection) SI queda: el cielo no se olvida de que estuviste arriba.
  missiles.length = 0;

  plane.x = rv.x0; plane.y = rv.y0;
  plane.vx = 0; plane.vy = 0; plane.bank = 0; plane.pitch = 0;

  // la radio cae de tono en el derribo; gastar la pasada suena distinto — mas corto y sin drama:
  // no hubo desgracia, hubo una corrida que termino
  if (spent) beep(340, 0.16, 'square', 0.045, 260);
  else beep(240, 0.3, 'sawtooth', 0.05, 90);
}

// Cuanto se agacha la musica mientras habla el piloto. Las grabaciones miden entre 1.42 s
// (woho5) y 4.73 s (dio_perfecto_este_señor), asi que no hay un numero que las cubra a todas sin
// dejar la musica baja media eternidad: 3.0 tapa a la mayoria y a las dos mas largas les deja la
// cola sonando mientras la musica ya volvio, que es cuando el piloto igual esta terminando.
// De referencia: la cinematica entera del relevo dura 3 s y la voz arranca al segundo.
const PILOT_DUCK = 3.0;

/** Posicion del AVERIADO durante la cinematica (campaña): pierde velocidad y QUEDA ATRAS —
 *  crece hacia la camara y la pasa (z < 3.8, el umbral de la salida de plano de la formacion),
 *  mientras el nuevo lo SOBREPASA hacia adelante. El corrimiento lateral es SUAVE (seno easeado
 *  hacia el lado contrario al que entra el companero: se abre lo justo para no chocarlo — el
 *  t² anterior era un codazo, playtest 4/8) y encima lleva el TAMBALEO del avion roto: bamboleo
 *  vertical y lateral que crece con el tiempo. La comparte el render y la estela de humo. */
export function fallenPos(r) {
  // EN EL CAMBIO el reloj arranca en `t0` (ver startCambio), el avion va SANO y "BAJA LA VELOCIDAD Y
  // PASA ATRAS" (pedido del autor, 27/9): cae derecho hacia la camara hasta pasarla, apenas corrido
  // hacia su lado para no cruzarse con el que entra, sin abrirse ni subir. El roto, en cambio, se
  // abre, trepa un poco y tambalea: esa es la salida de un avion que vuelve a la base.
  if (r.cambio) {
    const t = r.t - r.t0, ease = (1 - Math.cos(Math.min(t, 1.2) * Math.PI / 1.2)) / 2;
    return { x: r.wx - r.side * 5 * ease, y: Math.max(2.5, r.wy), z: PZ - t * t * 5 };
  }
  const t = r.t - (r.t0 || 0), sd = -r.side, w = r.cambio ? 0 : 1;
  const ease = (1 - Math.cos(Math.min(t, 1.6) * Math.PI / 1.6)) / 2;   // 0→1 suave, asienta en 1.6 s
  return {
    x: r.wx + sd * 12 * ease + Math.sin(t * 13) * 0.4 * t * w,
    y: Math.max(2.5, r.wy) + t * 1.2 + Math.sin(t * 9) * 0.45 * t * w,
    z: PZ - t * t * 3.4,
  };
}

/** Un frame de cinematica. Mueve camara y avion (autopiloto) y devuelve 'done' al terminar. */
export function updateRelevo(dt) {
  rv.t += dt;
  const ph = relevoPhase(rv.t);

  // CAMPAÑA: el averiado deja ESTELA DE HUMO mientras queda atras — la prueba visible, junto
  // con el sprite que dibuja el render, de que no exploto (norma 3/8: nadie muere por gameplay)
  // EL MISMO HUMO POR FOCOS que el avion averiado que volas (core/humo.js; pedido del autor 2/10):
  // cada relevo sortea cuan roto viene —dos o tres focos— y de donde le sale. La semi-ala en
  // pantalla se toma de la del avion propio (las puntas que publica el dibujo), escalada a la
  // distancia del que se va; el sprite del que se va trae el alabeo horneado, asi que el ala va
  // horizontal. El humo sube y se abre hacia el lado al que se va, como la estela de antes.
  if (roster && !rv.cambio && fallenPos(rv).z > 3.8) {
    if (!rv.humo) { rv.humo = nuevoHumo(); rv.humoA = 0.5 + Math.random() * 0.45; }
    const p0 = fallenPos(rv), s = proj(p0.x, p0.y, p0.z), sp = proj(plane.x, plane.y, PZ);
    const semi = run.t - run.alaT < 1 && sp.k > 0 ? Math.abs(run.alaRx - run.alaLx) / 2 / sp.k : 1.6;
    humoFocos(rv.humo, dt, rv.humoA, { cx: s.x, cy: s.y, ux: semi * s.k, uy: 0, k: s.k },
      { vx: rv.side * 6, vy: -10 });
  }

  // CAMARA. Primer tiempo: clavada en los restos — ver caer al companero ES la escena. Segundo
  // tiempo: persigue al avion nuevo con el mismo lerp del vuelo, un poco mas lento (pasa por el
  // humo del lider en el camino, no corta seco).
  if (ph.beat === 'wreck') {
    cam.x += (rv.wx * 0.86 - cam.x) * Math.min(1, dt * 4);
    cam.y += (rv.wy + 2.6 - cam.y) * Math.min(1, dt * 4);
  } else {
    cam.x += (plane.x * 0.86 - cam.x) * Math.min(1, dt * 3);
    cam.y += (plane.y + 2.6 - cam.y) * Math.min(1, dt * 2.6);
  }
  if (cam.y < 3.4) cam.y = 3.4;

  if (ph.beat === 'handoff') {
    if (!rv.said) {
      rv.said = true;
      sfxOne('waveFly');                                // la rafaga del companero barriendo al entrar
      beep(620, 0.09, 'square', 0.05);
      // VOZ DE PILOTO: una grabacion al azar del escuadron (data/sfx.js → `pilot`). Va en el
      // HANDOFF y no en el derribo: es el companero tomando el mando, y coincide con la linea de
      // radio que ya aparece en pantalla ("PATRIA n ASUME EL MANDO").
      // La musica se agacha mientras habla — si no, la voz compite con la pista y no se entiende.
      if (sfxOne('pilot')) duck(PILOT_DUCK);
    }
    // ESQUIVE AUTOMATICO del punto de llegada: si algo letal viene por ese carril, lo corre.
    // Se ajusta el ancla (rv.x2) y no la posicion directa, para que la curva siga siendo curva.
    let tx = rv.x2;
    for (const o of obstacles) {
      if (o.done || o.type === 'chunk' || o.type === 'airboom' || o.type === 'boom'
        || o.type === 'fuel' || o.type === 'trench' || o.type === 'birds') continue;
      if (o.z > PZ + 2 && o.z < 60 && Math.abs(o.x - tx) < 7) tx = o.x + (tx >= o.x ? 7 : -7);
    }
    rv.x2 += (tx - rv.x2) * Math.min(1, dt * 6);

    // TRAYECTORIA: curva de tres puntos — entra de afuera (x0), PASA por los restos (wx,wy)
    // y se asienta (x2). El punto medio es el del lider caido a proposito: es lo que hace que
    // el relevo se lea como "lo vio caer y siguio", no como un teletransporte.
    const u = Math.min(1, (rv.t - RELEVO_WRECK) / RELEVO_GRACE);
    const e = u * u * (3 - 2 * u), a = 1 - e;
    // en el CAMBIO no hay restos por los que pasar: la curva va derecho de la entrada al puesto
    const mx = rv.cambio ? (rv.x0 + rv.x2) / 2 : rv.wx, my = rv.cambio ? (rv.y0 + rv.y2) / 2 : rv.wy + 0.5;
    const bx = a * a * rv.x0 + 2 * a * e * mx + e * e * rv.x2;
    const by = a * a * rv.y0 + 2 * a * e * my + e * e * rv.y2;
    // el zigzag del esquive va ENCIMA de la curva y se apaga al asentarse
    const nx = bx + (rv.cambio ? 0 : Math.sin(u * Math.PI * 3) * 2.2 * (1 - e));   // el que viene de atras no zigzaguea
    const ny = Math.max(2.2, by);
    const pvx = (nx - plane.x) / Math.max(dt, 1 / 240);
    const pvy = (ny - plane.y) / Math.max(dt, 1 / 240);
    // bank/pitch salen del movimiento real: el autopiloto banquea como banquearia el jugador
    plane.bank += (Math.max(-1, Math.min(1, pvx / 26)) - plane.bank) * Math.min(1, dt * 8);
    plane.pitch += (Math.max(-1, Math.min(1, pvy / 14)) - plane.pitch) * Math.min(1, dt * 6);
    plane.x = nx; plane.y = ny;
    plane.vx = Math.max(-30, Math.min(30, pvx));
    plane.vy = Math.max(-20, Math.min(18, pvy));
  }

  if (ph.done) {
    // devolver el control SUAVE: la velocidad lateral del asentado ya es chica, pero se
    // recorta igual para que el primer frame de vuelo no herede un tiron del autopiloto
    plane.vx = Math.max(-16, Math.min(16, plane.vx));
    plane.vy = 0;
    rv = null;
    return 'done';
  }
  return null;
}
