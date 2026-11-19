// LAS ISLAS REALES — LA FASE (prototipo I0, docs/proyecto/ANALISIS_ISLAS_REALES.md).
//
// QUE ES I0: el PASILLO de siempre —su gas contra la gravedad, el roce, las piruetas, el HUD, la cabina, el
// radar, el relevo, la musica— volado sobre las Malvinas reales a escala 1:1, con el mundo de Dusk Patrol
// (mundo.js + terreno3d.js), sus tres vistas (camara.js) y el A-4B de Blender como malla (avion3d.js).
// Lo que este archivo agrega al pasillo esta explicado abajo, en `pasoPasillo`.
//
// SE ENTRA SOLO POR PRUEBAS (data/pruebas.js → sonda __malvinas → POR LA PATRIA). Nada del menu normal ni
// de la campaña pasa por aca: `enPasillo()` exige S.test.
//
// EL LUGAR MAS CERCANO aparece en pantalla al acercarse (orientacion sin flechas). Los nombres son los que
// usa Dusk Patrol para 1982 y estan A VERIFICAR (ver LUGARES).
import { popup } from '../../core/fx.js';
import { P } from '../../data/palette.js';
// la mitad de la grilla del juego (480 de ancho): systems no importa render (tools/lint_layers.js)
const MEDIO = 240;
import { forward } from '../../core/aero.js';
import * as mundo from './mundo.js';
import * as camara from './camara.js';
import { run } from '../../core/run.js';
import { S, plane } from '../../core/state.js';
import { cabina } from '../../core/cabina.js';
import { geoExterna } from '../../core/geografia.js';
import { KMH_U } from '../../data/tuning.js';

const BORDE = 12000;         // a esta distancia del borde del mapa empieza la vuelta automatica
// ARRANQUE: sobre el estrecho de San Carlos, rumbo sudoeste (el de Dusk Patrol), bajo.
const INICIO = { lon: -59.22, lat: -51.58, alt: 90, rumbo: 222 };

// LOS LUGARES (lon/lat aproximados ~1 km; nombres del uso argentino de 1982 segun Dusk Patrol).
// ⚠ A VERIFICAR antes de que salgan de PRUEBAS: TEAL INLET (¿Caleta Trullo?), PUERTO YAPEYU (Port
// Howard: whitepass lo llama Puerto Mitre). Van a docs/historia/PREGUNTAS_HISTORICAS.md.
export const LUGARES = [
  { n: 'PUERTO ARGENTINO', lon: -57.845, lat: -51.690 },
  { n: 'BAM MALVINAS', lon: -57.777, lat: -51.686 },
  { n: 'MONTE LONGDON', lon: -57.982, lat: -51.665 },
  { n: 'DOS HERMANAS', lon: -58.025, lat: -51.682 },
  { n: 'MONTE HARRIET', lon: -58.013, lat: -51.708 },
  { n: 'MONTE TUMBLEDOWN', lon: -57.965, lat: -51.698 },
  { n: 'MONTE KENT', lon: -58.112, lat: -51.674 },
  { n: 'PRADERA DEL GANSO', lon: -58.973, lat: -51.826 },
  { n: 'DARWIN', lon: -58.958, lat: -51.808 },
  { n: 'BAHIA SAN CARLOS', lon: -59.065, lat: -51.535 },
  { n: 'PUERTO SAN CARLOS', lon: -59.030, lat: -51.505 },
  { n: 'BAHIA AGRADABLE', lon: -58.250, lat: -51.790 },
  { n: 'ISLA BORBON', lon: -59.610, lat: -51.310 },
  { n: 'PUERTO YAPEYU', lon: -59.516, lat: -51.616 },
  { n: 'BAHIA FOX', lon: -60.070, lat: -51.940 },
  { n: 'TEAL INLET', lon: -58.430, lat: -51.560 },
  { n: 'ESTRECHO DE SAN CARLOS', lon: -59.30, lat: -51.62 },
];
const LUGAR_R = 6000;

const I = { on: false, puesto: false, lugar: null, avisoT: 0, ir: null };

export const activa = () => I.on;
export const listo = () => mundo.listo();
export const progreso = () => mundo.progreso();

/** Prende (o apaga) las islas para la PROXIMA entrada al arena, y empieza a cargar el mundo. */
export function activar(on = true) {
  I.on = !!on; I.puesto = false; I.lugar = null;
  if (I.on) mundo.cargar();
  return I.on;
}


/** Ubica al avion en el arranque si todavia no lo esta. Devuelve false mientras el mundo carga. */
export function ubicar(A) {
  if (!mundo.listo()) return false;
  if (I.ir) {                                               // la sonda __malvinas({ lon, lat, alt, rumbo })
    const q = I.ir; I.ir = null;
    if (!I.puesto) ubicar(A);
    const [x, z] = mundo.lonLatLocal(q.lon, q.lat);
    A.pos.x = x; A.pos.z = z; A.pos.y = mundo.superficieH(x, z) + (q.alt || 80);
    if (q.rumbo != null) { A.yaw = q.rumbo * Math.PI / 180; A.fwd = forward(A.yaw, 0); A.vel = forward(A.yaw, 0); }
    A.pitch = 0;
    return true;
  }
  if (I.puesto) return true;
  let [cx, cz] = mundo.lonLatAbs(INICIO.lon, INICIO.lat);
  // el punto mas hondo de los alrededores: que el arranque caiga en el agua del estrecho, no en la costa
  let best = [cx, cz], bestH = 1e9;
  for (let r = 0; r <= 4000; r += 500) for (let k = 0; k < 16; k++) {
    const x = cx + Math.cos(k / 16 * Math.PI * 2) * r, z = cz + Math.sin(k / 16 * Math.PI * 2) * r, h = mundo.mapH(x, z);
    if (h < bestH - 2) { bestH = h; best = [x, z]; }
  }
  mundo.fijarOrigen(best[0], best[1]);
  const o = mundo.org();
  A.pos.x = best[0] - o[0]; A.pos.z = best[1] - o[1];
  A.pos.y = Math.max(INICIO.alt, mundo.superficieH(A.pos.x, A.pos.z) + 60);
  A.yaw = INICIO.rumbo * Math.PI / 180; A.pitch = 0; A.roll = 0;
  A.fwd = forward(A.yaw, 0); A.vel = forward(A.yaw, 0);   // la trayectoria arranca por el morro nuevo
  I.puesto = true;
  return true;
}

// =====================================================================================================
// LAS ISLAS SOBRE EL MOTOR DEL PASILLO (autor, 19/11: "la misma mecanica de GAS, colision identica a
// PASILLO tanto en cosas como en agua, las piruetas y la forma de maniobrar, misma gravedad", "la UI del
// PASILLO", "el radar activable segun mision", "la musica tambien").
//
// El pasillo corre ENTERO (systems/flight.js, moves.js, el HUD, la cabina, el relevo, el radar, la musica)
// y esto le agrega solo dos cosas:
//   · EL RUMBO: la velocidad de costado del pasillo (`plane.vx`, la que el alabeo produce) aca no corre al
//     avion de lado: lo hace VIRAR. vx / velocidad = cuanto gira por segundo. `plane.x` se vuelve a 0 cada
//     cuadro, asi el carril queda siempre bajo el avion.
//   · EL SUELO REAL: `plane.y` se mide DESDE EL SUELO de abajo (autor: "Isla Soledad se puede, pero hay que
//     ir rasante y esquivando"), asi las bandas del pasillo (rasante, radar, techo) valen igual sobre un
//     cerro que sobre el mar. Cuando el terreno SUBE, se come esa altura: si no le das gas a tiempo, rozas
//     (el roce del pasillo, con su gracia) y si sube de golpe, es una pared: death_land.
//   La geografia del pasillo pregunta "¿hay tierra abajo?" a core/geografia.js (`geoExterna`).
// =====================================================================================================
const U = KMH_U / 3.6;        // metros por unidad de velocidad del pasillo (el HUD pasa a km/h con KMH_U)
const PARED = 6;              // un escalon de terreno de mas de esto en un cuadro, por debajo del avion, es pared
const BANK_FULL = 60 * Math.PI / 180;
const P3 = { x: 0, z: 0, yaw: 0, g: 0, A: null };

/** ¿Las islas estan corriendo sobre el pasillo AHORA? Solo desde PRUEBAS (S.test) y en el vuelo. */
export const enPasillo = () => I.on && !!S.test && (S.state === 'play' || S.state === 'relevo' || S.state === 'dead');

/** Un cuadro de vuelo, DESPUES de flightSystem: vira, avanza sobre el mapa y le pasa el suelo al avion.
 *  Devuelve una causa de muerte si el terreno se le vino encima, o null. */
export function pasoPasillo(dt) {
  if (!enPasillo()) { geoExterna.on = false; return null; }
  if (!mundo.listo()) return null;
  if (!I.puesto) {
    const A0 = { pos: { x: 0, y: 0, z: 0 }, yaw: 0 };
    ubicar(A0);
    P3.x = A0.pos.x; P3.z = A0.pos.z; P3.yaw = A0.yaw; P3.g = Math.max(mundo.sueloH(P3.x, P3.z), 0);
    cabina.on = camara.vista() === camara.CABINA;
    geoExterna.tierra = () => mundo.sueloH(P3.x, P3.z) > 0.3;
  }
  if (I.ir) { const q = I.ir; I.ir = null; const [x, z] = mundo.lonLatLocal(q.lon, q.lat); P3.x = x; P3.z = z; if (q.rumbo != null) P3.yaw = q.rumbo * Math.PI / 180; P3.g = Math.max(mundo.sueloH(x, z), 0); if (q.alt) plane.y = q.alt; }
  geoExterna.on = true;
  // EL VIRAJE: lo de costado se vuelve rumbo
  const spd = Math.max(run.spd, 20);
  P3.yaw += (plane.vx / spd) * dt;
  plane.x = 0;
  // la correa del borde del mapa, como siempre
  const k = Math.max(0, Math.min(1, (BORDE - mundo.alBorde(P3.x, P3.z)) / 8000));
  if (k > 0) { let d = mundo.rumboAlCentro(P3.x, P3.z) - P3.yaw; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; P3.yaw += d * k * dt; }
  // AVANZAR
  const m = run.spd * U * dt;
  P3.x += Math.sin(P3.yaw) * m; P3.z -= Math.cos(P3.yaw) * m;
  // EL SUELO QUE SUBE se come la altura; el que baja te la devuelve (y la gravedad del pasillo hace el resto)
  const g = Math.max(mundo.sueloH(P3.x, P3.z), 0), dg = g - P3.g;
  P3.g = g;
  plane.y -= dg;
  if (S.state === 'play' && dg > PARED && plane.y < -PARED) return 'death_land';
  if (P3.A) lugares(P3.A, dt);
  return null;
}

/** El avion del pasillo puesto en el mapa, con la forma que lee la escena 3D (la del arena). */
export function estadoA() {
  if (!enPasillo() || !mundo.listo() || !I.puesto) return null;
  const sp = Math.max(1, run.spd * U);
  const pitch = Math.atan2(plane.vy, sp) * 0.8 + plane.pitch * 0.12;
  const roll = Math.max(-1, Math.min(1, plane.bank)) * BANK_FULL + (run.mvRoll || 0);
  const f = forward(P3.yaw, pitch);
  const A = P3.A || (P3.A = { pos: { x: 0, y: 0, z: 0 } });
  A.pos.x = P3.x; A.pos.y = P3.g + Math.max(plane.y, 0.3); A.pos.z = P3.z;
  A.yaw = P3.yaw; A.pitch = pitch; A.roll = roll; A.fwd = f; A.vel = f; A.spd = sp; A.t = run.t;
  return A;
}

/** LAS VISTAS (Dusk Patrol): la tecla de vista del arena cicla arriba → atras → cabina. */
export function cambiarVista() {
  const v = camara.siguiente();
  cabina.on = v === camara.CABINA;            // en la cabina, la del PASILLO con su HUD (game.js `enCabina`)
  return v;
}

/** El nombre del lugar mas cercano, cuando cambia. */
export function lugares(A, dt) {
  const o = mundo.org(), ax = A.pos.x + o[0], az = A.pos.z + o[1];
  let best = null, bd = LUGAR_R;
  for (const l of LUGARES) {
    if (!l.xz) l.xz = mundo.lonLatAbs(l.lon, l.lat);
    const d = Math.hypot(l.xz[0] - ax, l.xz[1] - az);
    if (d < bd) { bd = d; best = l; }
  }
  I.avisoT = Math.max(0, I.avisoT - dt);
  if (best && best !== I.lugar && I.avisoT <= 0) {
    popup(MEDIO, 40, best.n, P.accent, true);
    I.avisoT = 4;
  }
  if (best) I.lugar = best;
}

/** Sonda (consola, fixtures y PRUEBAS): `__malvinas()` prende, `__malvinas(false)` apaga, `__malvinas('?')` informa. */
if (typeof window !== 'undefined') {
  window.__malvinas = (on = true) => {
    if (on && typeof on === 'object') { I.ir = on; return true; }   // ir a un lugar: { lon, lat, alt, rumbo }
    if (on === '?') return { on: I.on, estado: mundo.estado(), prog: +mundo.progreso().toFixed(2), org: mundo.org(), lugar: I.lugar && I.lugar.n };
    return activar(on);
  };
}
