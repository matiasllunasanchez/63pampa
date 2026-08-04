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
  st.yaw += (AR.AUTO_TURN * sr + pr * sr) * dt;
  if (st.yaw > Math.PI) st.yaw -= Math.PI * 2; else if (st.yaw < -Math.PI) st.yaw += Math.PI * 2;

  // DERRAPE fino (la cadena corta del pasillo, con tope chico): punteria, no viraje
  st.vx += inS * AR.VX_ACC * dt;
  if (!inS) st.vx *= Math.max(0, 1 - AR.VX_DRAG * dt);
  st.vx = clamp(st.vx, -AR.VX_MAX, AR.VX_MAX);

  // ENERGIA: el acelerador pone el objetivo (freno 0.6 / crucero / turbo 1.5) y la gravedad
  // pelea contra la VELOCIDAD via el seno del cabeceo: trepar sangra, picar regala.
  const tgt = AR.SPD_CRUISE * (io.boost ? AR.SPD_TURBO : io.brake ? AR.SPD_BRAKE : 1);
  st.spd += ((tgt - st.spd) * AR.SPD_ACC - AR.G_E * Math.sin(st.pitch)) * dt;
  st.spd = clamp(st.spd, AR.SPD_MIN, AR.SPD_CRUISE * AR.SPD_TURBO * 1.15);
  return st;
}

/** velocidad vertical EMERGENTE del cabeceo: la consecuencia, no el comando. */
export const vyOf = st => Math.sin(st.pitch) * st.spd;

// ---- metricas del sobre de vuelo (derivadas, para feeltest y __adbg) ----
// Viven aca y no en el test para que el juego y la medicion usen LA MISMA definicion.

/** angulo de derrape instantaneo (rad): cuanto cruza el aire de costado. */
export const slipAngle = (vx, spd) => Math.atan2(vx, spd);

/** tasa de guinada (rad/s) banqueado a `roll`, tirando con `pull` (-1..1). */
export const yawRateAt = (roll, pull = 0) =>
  (AR.AUTO_TURN + clamp(pull, -1, 1) * AR.PITCH_RATE) * Math.sin(roll);

/** radio (m) y tiempo (s) del giro sostenido a banqueo pleno. */
export const turnRadius = (spd = AR.SPD_CRUISE, pull = 0) => spd / yawRateAt(AR.ROLL_MAX, pull);
export const turnTime = (pull = 0) => Math.PI * 2 / yawRateAt(AR.ROLL_MAX, pull);
