// AERODINAMICA DEL ARENA: las formulas de vuelo de la fase ARENA, como funciones PURAS.
//
// Por que existe este modulo (PLAN_MINUTOS_SAGRADOS E0): las formulas vivian inline en
// systems/arena.js y no habia forma de MEDIRLAS sin abrir Electron. Aca no hay estado ni imports
// de stores, asi que tools/feeltest.js las corre tal cual — el mismo codigo que vuela el juego,
// no una copia que puede dar verde mientras el juego hace otra cosa (la leccion de physics.js).
//
// MODELO E1/E2 (2/8/2026): el jugador comanda ANGULOS y las velocidades son la consecuencia —
// exactamente al reves del modelo heredado del pasillo, que comandaba vy y deducia el cabeceo
// (con el tope emergente de 8.2° que hacia imposible picar sobre el buque; medido en el plan §2.2,
// y conservado como referencia en el propio plan).
//
//   · CABECEO: W/S mueven el morro hasta ±51°; vy = sin(pitch) * spd. Al soltar, el morro vuelve
//     solo al horizonte (LEVEL_EASE) — a 480x270, perder el horizonte es perder el avion.
//   · ALABEO: Q/E y el stick derecho piden banqueo; BANQUEAR ES VIRAR (viraje coordinado), y
//     tirar del morro banqueado APRIETA el viraje: el cabeceo se reparte entre subir y girar
//     segun el angulo de alas (cos/sin del roll). Eso es carvear, no patinar.
//   · ENERGIA: la gravedad ya no pelea contra la altura sino contra la VELOCIDAD (G_E * sin
//     pitch): trepar sangra, picar regala. Sin velocidad (SPD_MUSH) la autoridad de cabeceo cae
//     y el morro se hunde solo — hundimiento blando, no perdida dura.
//   · DERRAPE: A/D quedan como correccion fina de punteria (VX_MAX 8), no como el viraje.
//
// Lo que SI se conserva del pasillo es la CADENA CORTA: input → estado en UNA integracion, sin
// suavizados intermedios. Era lo que hacia suelto al modelo anterior y es la vara de feeltest.

import { AR } from '../data/arena.js';

const clamp = (v, a, b) => v < a ? a : v > b ? b : v;

/** vector unitario del MORRO a partir de guinada y cabeceo. yaw=0 mira a -z. */
export function forward(yaw, pitch) {
  const cp = Math.cos(pitch);
  return { x: Math.sin(yaw) * cp, y: Math.sin(pitch), z: -Math.cos(yaw) * cp };
}

/**
 * Un paso de vuelo. Muta y devuelve `st` = { yaw, pitch, roll, spd, vx } (radianes, m/s).
 * `io` = { pitch: -1..1, roll: -1..1, slip: -1..1, brake: bool, boost: bool }.
 * Sin estado propio ni stores: feeltest la corre igual que el juego.
 */
export function stepFlight(st, io, dt) {
  // inputs normalizados: un io PARCIAL ({ pitch: 1 } solo) es valido — API pura, se defiende sola
  const inP = clamp(io.pitch || 0, -1, 1), inR = clamp(io.roll || 0, -1, 1), inS = clamp(io.slip || 0, -1, 1);

  // ALABEO: el stick pide un ANGULO objetivo y el banqueo lo persigue con resorte. Roll > 0 =
  // ala derecha abajo. Soltar el stick es pedir alas niveladas: el avion se endereza solo.
  st.roll += (inR * AR.ROLL_MAX - st.roll) * Math.min(1, dt * AR.ROLL_RESP);

  // CABECEO EN EL MARCO DEL AVION: tirar del morro con las alas banqueadas reparte el gesto
  // entre levantar el morro (cos roll) y VIRAR (sin roll). A 80° de banqueo, tirar es girar.
  // autoridad CUADRATICA: lineal, a 45 m/s todavia quedaba 0.64 de mando y el morro clavado al
  // fondo le ganaba al hundimiento — con el cuadrado, quedarse sin energia se siente de verdad
  const auth = clamp((st.spd / AR.SPD_MUSH) ** 2, 0, 1);
  const pr = inP * AR.PITCH_RATE * auth;
  const cr = Math.cos(st.roll), sr = Math.sin(st.roll);
  st.pitch += pr * cr * dt;
  if (!inP) st.pitch -= st.pitch * Math.min(1, dt * AR.LEVEL_EASE);   // auto-nivelado suave
  st.pitch -= (1 - auth) * AR.MUSH_DROP * dt;              // sin velocidad, el morro se hunde
  st.pitch = clamp(st.pitch, -AR.PITCH_MAX, AR.PITCH_MAX);

  // GIRO: banquear vira solo (coordinado) y tirar banqueado aprieta. No hay tasa de guinada
  // comandada aparte: girar ES banquear, como en el pasillo girar es moverse.
  // El SWEET SPOT (S3) multiplica la tasa: el giro mas cerrado no es a fondo sino frenado, asi
  // el acelerador entra en la pelea en vez de quedarse en 1.0 toda la batalla.
  st.yaw += (AR.AUTO_TURN * sr + pr * sr) * turnGain(st.spd) * dt;
  if (st.yaw > Math.PI) st.yaw -= Math.PI * 2; else if (st.yaw < -Math.PI) st.yaw += Math.PI * 2;

  // DERRAPE fino (la cadena corta del pasillo, con tope chico): punteria, no viraje
  st.vx += inS * AR.VX_ACC * dt;
  if (!inS) st.vx *= Math.max(0, 1 - AR.VX_DRAG * dt);
  st.vx = clamp(st.vx, -AR.VX_MAX, AR.VX_MAX);

  // ENERGIA: el acelerador pone el objetivo (freno 0.6 / crucero / turbo 1.5) y la gravedad
  // pelea contra la VELOCIDAD via el seno del cabeceo: trepar sangra, picar regala.
  // `turboMul`/`accMul` los pisa el reparto de energia (los PIPS, S1) — entran por `io` y no
  // mutando AR porque los datos son datos: el mismo modelo tiene que poder correr en feeltest
  // sin que nadie le haya cambiado una constante por debajo.
  const tb = io.turboMul || AR.SPD_TURBO;
  const tgt = AR.SPD_CRUISE * (io.boost ? tb : io.brake ? AR.SPD_BRAKE : 1);
  st.spd += ((tgt - st.spd) * AR.SPD_ACC * (io.accMul || 1) - AR.G_E * Math.sin(st.pitch)) * dt;
  st.spd = clamp(st.spd, AR.SPD_MIN, AR.SPD_CRUISE * AR.SPD_TURBO * 1.15);
  return st;
}

/** velocidad vertical EMERGENTE del cabeceo: la consecuencia, no el comando. */
export const vyOf = st => Math.sin(st.pitch) * st.spd;

/** SWEET SPOT (S3): cuanto aprieta el viraje a `spd`. Campana centrada en AR.SWEET_SPD — vale 1
 *  lejos de ella, asi el modelo E2 medido en crucero no se mueve. */
export const turnGain = spd =>
  1 + AR.SWEET_GAIN * Math.exp(-(((spd - AR.SWEET_SPD) / AR.SWEET_W) ** 2));

// ---- VIRAJE DE COMBATE (E3) y DRIFT (S2): el ejecutor PROPIO del arena ----
// D2 del plan: el arena NO puede usar systems/moves.js (ese escribe `plane` y `run.mv*`, que son
// del PASILLO en 2D). Lo que se comparte es la IDEA de maniobra guionada: mientras corre, el
// jugador no maneja — la maniobra escribe el `io` y el vuelo sigue siendo UNA sola integracion.

/** Arranca una media vuelta hacia `dir` (+1 derecha / -1 izquierda). Devuelve el estado a llevar. */
export const startUturn = dir => ({ id: 'uturn', dir: dir < 0 ? -1 : 1, t: 0, acc: 0 });

/** Un paso de la media vuelta. Muta `st` y `mv`; devuelve true cuando TERMINO.
 *  Corta por GUINADA ACUMULADA, no por reloj: con el sweet spot el mismo gesto tarda distinto
 *  segun la velocidad, y lo que el jugador pidio es "dar media vuelta", no "esperar 1.2 s". */
export function stepUturn(st, mv, dt) {
  mv.t += dt;
  // el banqueo se CLAVA al tope en vez de perseguirlo con el resorte: 0.5 s de ROLL_RESP se
  // comerian la mitad de la maniobra y la media vuelta no entraria en el 1.2 s del plan
  st.roll = mv.dir * AR.ROLL_MAX;
  const y0 = st.yaw;
  stepFlight(st, { pitch: 1, roll: mv.dir }, dt);
  let dy = st.yaw - y0;
  if (dy > Math.PI) dy -= Math.PI * 2; else if (dy < -Math.PI) dy += Math.PI * 2;
  mv.acc += Math.abs(dy);
  // LA ENERGIA ES EL PRECIO (plan E3: "con costo de energia"). Sin esto la media vuelta es gratis
  // y la respuesta correcta a todo pasa a ser encadenarlas.
  st.spd = Math.max(AR.SPD_MIN, st.spd - AR.UTURN_COST * dt / AR.UTURN_DUR);
  return mv.acc >= Math.PI || mv.t > AR.UTURN_DUR * 1.8;   // el reloj es solo el seguro
}

/** ¿Esta derrapando? (S2) Freno sostenido + alas bien paradas + energia para sostenerlo. */
export const drifting = (st, brake) =>
  !!brake && Math.abs(st.roll) >= AR.ROLL_MAX * AR.DRIFT_ROLL && st.spd > AR.SPD_MIN * 1.15;

/** La TRAYECTORIA persigue al MORRO. Fuera del drift converge casi al instante (el morro sigue
 *  siendo la trayectoria); derrapando queda atras y ahi nace la pasada de "pasar de largo y
 *  seguir tirando". Muta y devuelve `vel` (unitario). */
export function stepVel(vel, fwd, drift, dt) {
  const k = Math.min(1, dt * (drift ? AR.DRIFT_EASE : AR.VEL_EASE));
  vel.x += (fwd.x - vel.x) * k;
  vel.y += (fwd.y - vel.y) * k;
  vel.z += (fwd.z - vel.z) * k;
  const l = Math.hypot(vel.x, vel.y, vel.z) || 1;
  vel.x /= l; vel.y /= l; vel.z /= l;
  return vel;
}

/** angulo (rad) entre el morro y la trayectoria: lo que el HUD dibuja como vector de vuelo. */
export const driftAngle = (vel, fwd) =>
  Math.acos(clamp(vel.x * fwd.x + vel.y * fwd.y + vel.z * fwd.z, -1, 1));

// ---- metricas del sobre de vuelo (derivadas, para feeltest y __adbg) ----
// Viven aca y no en el test para que el juego y la medicion usen LA MISMA definicion.

/** angulo de derrape instantaneo (rad): cuanto cruza el aire de costado. */
export const slipAngle = (vx, spd) => Math.atan2(vx, spd);

/** tasa de guinada (rad/s) banqueado a `roll`, tirando con `pull` (-1..1), a `spd`. */
export const yawRateAt = (roll, pull = 0, spd = AR.SPD_CRUISE) =>
  (AR.AUTO_TURN + clamp(pull, -1, 1) * AR.PITCH_RATE) * Math.sin(roll) * turnGain(spd);

/** radio (m) y tiempo (s) del giro sostenido a banqueo pleno. */
export const turnRadius = (spd = AR.SPD_CRUISE, pull = 0) => spd / yawRateAt(AR.ROLL_MAX, pull, spd);
export const turnTime = (pull = 0, spd = AR.SPD_CRUISE) => Math.PI * 2 / yawRateAt(AR.ROLL_MAX, pull, spd);
