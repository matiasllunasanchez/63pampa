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
import { run } from '../core/run.js';
import { obstacles, missiles, parts } from '../core/world.js';
import { proj } from '../core/fx.js';
import { FLY_TOP } from '../data/tuning.js';
import { PZ } from '../render/ctx.js';
import { beep, sfxOne, duck } from './audio.js';
import { RELEVO_WRECK, RELEVO_GRACE, RELEVO_DUR, pilotIdx, relevoPhase, callsign } from '../core/squad.js';

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

/** Arranca el relevo: descuenta la vida, congela el punto de la caida y prepara al companero.
 *  game.js ya disparo crashFX() — los restos del lider estan volando cuando esto corre. */
export function startRelevo(cause, spent) {
  run.lives--;
  const next = pilotIdx(run.squad, run.lives);
  const wx = plane.x, wy = Math.max(2, plane.y);
  // el companero entra por el lado con mas aire, desde ALTO y fuera de pantalla: la lectura es
  // "venia ahi atras, cubriendote" — no un respawn que aparece de la nada
  const side = wx > 0 ? -1 : 1;
  rv = {
    t: 0, cause,
    // RF-15: `spent` = la pasada se gasto (soltaste o secaste el tanque), NO te derribaron. Cambia
    // el titular de la cinematica y nada mas — la cuenta es la misma. Sin esto la pantalla decia
    // "DERRIBADO" sobre un avion al que nadie toco, que es la clase de mentira que rompe un juego.
    spent: spent || null,
    fallen: next - 1, next,
    wx, wy, side,                                       // donde cayo el lider (la camara arranca aca)
    x0: wx + side * 30, y0: Math.min(FLY_TOP - 10, wy + 13),
    x2: wx * 0.5, y2: Math.max(6, Math.min(11, wy)),    // punto de asentado (carril + altura sana)
    said: false,
  };

  // RESET PARCIAL — nunca reset(): la mision es LA MISMA. Se conserva puntaje, distancia,
  // stats, objetivo, y se HEREDA combustible y municion (el companero venia volando la misma
  // ruta; reponerlo al 100% convertiria morir en la forma barata de repostar). Lo que si se
  // pierde: racha, multiplicador y afterburner — el avion nuevo entra frio.
  run.scrapeT = 0; run.scrapeVib = 0;
  run.streak = 0; run.rasLevel = 0; run.mult = 1; run.multShow = 1; run.graceT = 0;
  run.afterT = 0; run.afterTier = 0; run.afterGrace = 0;
  run.boost = false; run.throttle = 0;
  run.heat = 0; run.overheat = false;                   // canon propio, frio
  run.rollT = 0; run.rollCd = 0;
  run.mv = null; run.mvT = 0; run.mvRoll = 0; run.mvSteep = 0;
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
  const t = r.t, sd = -r.side;
  const ease = (1 - Math.cos(Math.min(t, 1.6) * Math.PI / 1.6)) / 2;   // 0→1 suave, asienta en 1.6 s
  return {
    x: r.wx + sd * 12 * ease + Math.sin(t * 13) * 0.4 * t,
    y: Math.max(2.5, r.wy) + t * 1.2 + Math.sin(t * 9) * 0.45 * t,
    z: PZ - t * t * 3.4,
  };
}

/** Un frame de cinematica. Mueve camara y avion (autopiloto) y devuelve 'done' al terminar. */
export function updateRelevo(dt) {
  rv.t += dt;
  const ph = relevoPhase(rv.t);

  // CAMPAÑA: el averiado deja ESTELA DE HUMO mientras queda atras — la prueba visible, junto
  // con el sprite que dibuja el render, de que no exploto (norma 3/8: nadie muere por gameplay)
  if (roster && Math.random() < 0.7 && fallenPos(rv).z > 3.8) {
    const p0 = fallenPos(rv), s = proj(p0.x, p0.y, p0.z);
    parts.push({
      x: s.x, y: s.y - 1, vx: rv.side * (4 + Math.random() * 5), vy: -6 - Math.random() * 9,
      life: 0.5 + Math.random() * 0.6, c: Math.random() < 0.5 ? '#5a6068' : '#7d858d',
      r: Math.max(1, s.k * 0.3),
    });
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
    const bx = a * a * rv.x0 + 2 * a * e * rv.wx + e * e * rv.x2;
    const by = a * a * rv.y0 + 2 * a * e * (rv.wy + 0.5) + e * e * rv.y2;
    // el zigzag del esquive va ENCIMA de la curva y se apaga al asentarse
    const nx = bx + Math.sin(u * Math.PI * 3) * 2.2 * (1 - e);
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
