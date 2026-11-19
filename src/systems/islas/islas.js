// LAS ISLAS REALES — LA FASE (prototipo I0, docs/proyecto/ANALISIS_ISLAS_REALES.md §7).
//
// QUE ES I0: vuelo libre sobre las Malvinas reales a escala 1:1, ADENTRO de RASANTE. No es otro juego:
// se monta sobre el ARENA (systems/arena.js), que ya vuela en 3D con los controles del pasillo, la
// cabina de autor en primera persona, el sprite en tercera [V], el HUD, el escuadron y el sonido. Lo
// unico que cambia es el MUNDO: en vez del ring de 700 m alrededor del buque, el mapa real (mundo.js)
// dibujado con el terreno de Dusk Patrol (terreno3d.js) en la paleta del clima.
//
// LAS REGLAS DE I0 (todas a revisar con el autor jugandolo):
//   · EL TERRENO MATA, como el mar (autor, 19/11). No hay tiron automatico: es RASANTE, volar bajo
//     entre los cerros es el juego.
//   · EL BORDE DEL MAPA es una correa, como el ring del arena: cerca del borde el avion vira solo
//     hacia las islas.
//   · SIN ENEMIGOS NI BUQUE: I0 es para medir si volar las islas se siente bien. Los AA, las tropas y
//     los Harriers son la etapa I2.
//   · EL LUGAR MAS CERCANO aparece en pantalla al acercarse (orientacion sin flechas). Los nombres son
//     los que usa Dusk Patrol para 1982 y estan A VERIFICAR (ver LUGARES).
//
// SE ENTRA SOLO POR PRUEBAS (data/pruebas.js → sonda __malvinas → el verbo arena). Nada del menu normal
// ni de la campaña pasa por aca.
import { popup } from '../../core/fx.js';
import { P } from '../../data/palette.js';
// la mitad de la grilla del juego (480 de ancho): systems no importa render (tools/lint_layers.js)
const MEDIO = 240;
import { forward } from '../../core/aero.js';
import * as mundo from './mundo.js';
import * as camara from './camara.js';
import { turnGain } from '../../core/aero.js';
import { run } from '../../core/run.js';

const PANZA = 1.5;           // metros del centro del avion a la panza
const PUNTA_MORRO = 6;       // metros del centro a la punta del morro (un A-4 mide ~12)
const ALA = 4.2;             // media envergadura
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

/** El avion recien entra (o vuelve del relevo): se lo ubica cuando el mundo este listo. */
export function entrar() { I.puesto = false; I.lugar = null; camara.reiniciar(); }

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

/** LA CORREA DEL BORDE: reemplaza a la del ring. Banquea hacia el centro del mapa cerca del borde. */
export function correa(A, io) {
  const k = Math.max(0, Math.min(1, (BORDE - mundo.alBorde(A.pos.x, A.pos.z)) / 8000));
  if (k <= 0) return;
  let d = mundo.rumboAlCentro(A.pos.x, A.pos.z) - A.yaw;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  io.roll = io.roll * (1 - k) + Math.max(-1, Math.min(1, d * 1.6)) * k;
}

/** EL CHOQUE (autor, 19/11: "el vuelo de los otros juegos no tiene colision con nada, eso tiene que
 *  estar"). Sin tiron automatico ni piso: el terreno mata como en el pasillo. Se prueba el morro, la
 *  panza y las dos puntas de ala contra el suelo; el mar lo sigue resolviendo el arena (SEA_KILL). */
export function choque(A) {
  const f = A.fwd, cy = Math.cos(A.yaw), sy = Math.sin(A.yaw), sr = Math.sin(A.roll || 0);
  const pts = [[0, 0], [f.x * PUNTA_MORRO, f.z * PUNTA_MORRO], [cy * ALA, sy * ALA], [-cy * ALA, -sy * ALA]];
  for (let k = 0; k < pts.length; k++) {
    const [dx, dz] = pts[k];
    // las puntas de ala suben o bajan con el alabeo
    const dy = k === 0 ? 0 : k === 1 ? f.y * PUNTA_MORRO : (k === 2 ? -1 : 1) * sr * ALA;
    const h = mundo.sueloH(A.pos.x + dx, A.pos.z + dz);
    if (h > 0 && A.pos.y + dy < h + PANZA) return 'death_land';
  }
  return null;
}

/** LAS VISTAS (Dusk Patrol): la tecla de vista del arena cicla arriba → atras → cabina. */
export const cambiarVista = () => camara.siguiente();

/** LO QUE LEE LA CABINA (render/islas_cabina.js): el snapshot del avion, en las unidades y con los
 *  nombres del overlay de Dusk Patrol. Se arma en el sistema porque el render no importa sistemas. */
export function instrumentos(A, dt, pip) {
  const S = A.islas || (A.islas = { vs: 0, yawRate: 0, G: 1, abAmt: 0, prevY: A.pos.y, prevYaw: A.yaw });
  const k = Math.min(1, dt * 3);
  let dy = A.yaw - S.prevYaw; while (dy > Math.PI) dy -= Math.PI * 2; while (dy < -Math.PI) dy += Math.PI * 2;
  if (dt > 0) {
    S.vs += ((A.pos.y - S.prevY) / dt - S.vs) * k;
    S.yawRate += (dy / dt - S.yawRate) * k;
  }
  S.prevY = A.pos.y; S.prevYaw = A.yaw;
  const g = Math.hypot(A.spd * S.yawRate, 9.81) / 9.81;
  S.G += (g - S.G) * Math.min(1, dt * 5);
  S.abAmt += ((run.boost ? 1 : 0) - S.abAmt) * Math.min(1, dt * 3);
  S.thr = run.boost ? 1 : 0.8 * Math.min(1, A.spd / 110);
  S.speed = A.spd; S.pitch = A.pitch; S.bank = A.roll || 0; S.yaw = A.yaw;
  S.p = [A.pos.x, A.pos.y, A.pos.z];
  S.f = [A.fwd.x, A.fwd.y, A.fwd.z];
  S.v = [A.vel.x, A.vel.y, A.vel.z];
  S.ra = A.pos.y - mundo.superficieH(A.pos.x, A.pos.z);
  S.suelo = mundo.sueloH;
  S.lugar = I.lugar && I.lugar.n;
  S.pip = pip | 0;
  S.sweet = turnGain(A.spd) > 1.15;
  S.nombre = 'A-4B';
  S.vista = camara.vista(); S.cw = camara.pesoCabina(); S.mezclaLista = camara.mezclaLista();
  // ARRIBA: si sigue asi, en menos de 2,5 s se mete en el terreno (el aviso que reemplaza al tiron
  // automatico de Dusk Patrol: aca nadie tira por vos)
  S.tirar = false;
  for (const t of [0.5, 1, 1.5, 2, 2.5]) {
    const x = A.pos.x + A.vel.x * A.spd * t, z = A.pos.z + A.vel.z * A.spd * t, y = A.pos.y + A.vy * t;
    if (y < mundo.sueloH(x, z) + 4) { S.tirar = true; break; }
  }
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

/** El cartel mientras carga (la carga tarda unos segundos la primera vez). */
export function cartelCarga(A, dt) {
  A.cargaT = (A.cargaT || 0) - dt;
  if (A.cargaT <= 0) {
    popup(MEDIO, 62, 'CARGANDO LAS ISLAS ' + Math.round(mundo.progreso() * 100) + '%', P.dim);
    A.cargaT = 0.5;
  }
}

/** Sonda (consola, fixtures y PRUEBAS): `__malvinas()` prende, `__malvinas(false)` apaga, `__malvinas('?')` informa. */
if (typeof window !== 'undefined') {
  window.__malvinas = (on = true) => {
    if (on && typeof on === 'object') { I.ir = on; return true; }   // ir a un lugar: { lon, lat, alt, rumbo }
    if (on === '?') return { on: I.on, estado: mundo.estado(), prog: +mundo.progreso().toFixed(2), org: mundo.org(), lugar: I.lugar && I.lugar.n };
    return activar(on);
  };
}
