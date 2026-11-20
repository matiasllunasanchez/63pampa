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
import { popup, explodeAt, columnaBomba } from '../../core/fx.js';
import { cartel } from '../../core/cartel.js';
import { T } from '../../core/i18n.js';
import * as objetivo from './objetivo.js';
import * as teatro from './teatro.js';
import * as caza from '../caza.js';
import * as mapa from './mapa.js';
import { P } from '../../data/palette.js';
// la mitad de la grilla del juego (480 de ancho): systems no importa render (tools/lint_layers.js)
const MEDIO = 240;
import { forward } from '../../core/aero.js';
import * as mundo from './mundo.js';
import * as camara from './camara.js';
import { run } from '../../core/run.js';
import { S, plane, cam } from '../../core/state.js';
import { cabina, CABINA, enCabina } from '../../core/cabina.js';
import { bullets, missiles, pmissiles, streaks } from '../../core/world.js';
import { geoExterna } from '../../core/geografia.js';
import { inp } from '../../core/input.js';
import { KMH_U } from '../../data/tuning.js';
import { AIR_START_Y } from '../../data/runways.js';

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

// `radar`: LA LLAVE DEL RADAR DE LAS ISLAS (19/11, el autor: "la mecanica de radar tiene que estar en las
// islas, activable o desactivable segun mision"). Prendido es la del pasillo tal cual; apagado, la barra
// no carga y no sale ningun misil. Hasta que haya misiones en las islas la pone PRUEBAS (`__malvinas`).
const I = { on: false, puesto: false, lugar: null, avisoT: 0, ir: null, radar: true };
// LA MARCA DEL JUGADOR (autor 19/11: "marcar objetivo en mapa con cursor de mouse y con joystick… el que quiera
// el usuario… y seleccionar puntos existentes"): un punto cualquiera del mapa, o un lugar/base/buque elegido en
// el MAPA de la pausa. Manda sobre la BASE COSTERA: la brujula y la marca del pasillo la señalan a ella.
// (x, z relativos a `mundo.org()`, como P3; `n` = el nombre que se muestra)
const CAM_ARRIBA = 4, CAM_ABAJO = 9.5;   // cuanto puede quedar la camara por debajo / por encima del avion (m)
const MARCA = { on: false, x: 0, z: 0, g: 0, n: '' };

export const activa = () => I.on;
/** ¿Las islas estan corriendo CON el radar apagado? (flight.js no carga la barra; el HUD no la muestra) */
export const sinRadar = () => enPasillo() && !I.radar;
export const listo = () => mundo.listo();
export const progreso = () => mundo.progreso();

/** Prende (o apaga) las islas para la PROXIMA entrada al arena, y empieza a cargar el mundo. */
export function activar(on = true) {
  I.on = !!on; I.puesto = false; I.lugar = null;
  objetivo.reiniciar(); teatro.reiniciar(); MARCA.on = false;
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
// LA VELOCIDAD SOBRE EL MAPA (autor, 19/11: "el avion va lento, no se siente adrenalina"): en el pasillo la
// velocidad la cuenta el mar de cerca, lleno de detalle que pasa; el terreno real, a 15 m, es liso de cerca y
// a la misma velocidad se leia lento. Sobre el mapa se avanza VEL_MAPA veces lo que marca el velocimetro (el
// numero del HUD no cambia: es el del pasillo).
const VEL_MAPA = 1 / U;   // 1:1 CON EL PASILLO (19/11, el autor: "equilibralos"): el mar del pasillo pasa a run.spd
// unidades/s con la camara 1:1 en metros, asi que el mapa avanza lo mismo. La velocidad la cuenta la alfombra de
// puntos del agua (terreno3d.js), con la misma densidad que la del pasillo (render/world.js drawSeaDots, SPZ 1).
// (Antes: 2,5 se sentia lento con el agua lisa; 3,6 mas rapido que el pasillo.)
// EL TURBO EMPUJA DE VERDAD (autor, 19/11: "mas turbo?"): con la poscombustion prendida el mapa pasa
// TURBO_MAPA veces mas rapido (con la rampa de P3.turbo), y se suman lineas de velocidad largas.
const TURBO_MAPA = 1;   // (el turbo del pasillo ya sube run.spd: encima, desparejaba los dos modos)
const PARED = 6;              // un escalon de terreno de mas de esto en un cuadro, por debajo del avion, es pared
const BANK_FULL = 60 * Math.PI / 180;
const P3 = { x: 0, z: 0, yaw: 0, g: 0, giro: 0, turbo: 0, altFija: null, A: null, sostiene: 0, od: 0, muerto: false };
// EL ARRANQUE SOSTENIDO (19/11, el autor: "cuando arranca… el avion arriba, como que se descuelga"): la prueba
// entra en vuelo sin el piloto automatico de los modos sueltos (game.js `autoAire` pide `suelto()`, y una PRUEBA
// no lo es), asi que sin gas el avion se caia apenas aparecia. Lo sostiene a la altura de salida hasta que des
// gas o pasen SOSTIENE_T segundos.
const SOSTIENE_T = 3;
// desde ARRIBA, cuanto sube el gas y baja la picada (m/s), y el techo sobre el suelo
const ARRIBA_VY = 10, ARRIBA_TECHO = 120;
// EL VIRAJE (19/11, el autor: "desde arriba el avion se mueve en un rectangulo/cuadrado"): A/D ponen la
// velocidad de costado del pasillo en ±30 DE GOLPE, y pasada directo a giro daba un rumbo que cambiaba a
// tasa fija y cortaba en seco — esquinas. Ahora el giro ENTRA y SALE (GIRO_T) y tiene un tope (GIRO_MAX)
// que no depende de la velocidad: a 140 km/h el avion ya no gira a 50°/s.
const GIRO_MAX = 0.55;        // rad/s a fondo (~32°/s)
const GIRO_T = 0.35;          // segundos en que el giro llega a lo que pide la mano
const VX_FONDO = 30;          // la velocidad de costado del pasillo con A/D apretada a fondo

/** ¿Las islas estan corriendo sobre el pasillo AHORA? Solo desde PRUEBAS (S.test) y en el vuelo. */
export const enPasillo = () => I.on && !!S.test && (S.state === 'play' || S.state === 'relevo' || S.state === 'dead');
/** ¿Se esta mirando con LA CAMARA DEL PASILLO? (autor, 19/11: "TODO debe parecerse MUCHISIMO a pasillo").
 *  La vista de atras y la cabina son la camara exacta del pasillo —`proj()`: focal 135, horizonte en la fila
 *  96, el avion 14 m adelante (1,6 en cabina)— con el sprite del pasillo, sus efectos, su giro de mundo. Solo
 *  la vista de ARRIBA es la de Dusk Patrol, con la malla 3D. */
export const vistaPasillo = () => enPasillo() && camara.vista() !== camara.ARRIBA;

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
    // EL OBJETIVO (systems/islas/objetivo.js): la BASE COSTERA, en la tierra plana mas cercana. La brujula lo marca.
    if (objetivo.colocar(P3.x, P3.z)) cartel(T('islasObjetivo'), P.accent, T('islasObjetivoSub'));
    P3.sostiene = SOSTIENE_T; plane.y = AIR_START_Y; P3.muerto = false;
  }
  if (P3.sostiene > 0) {
    P3.sostiene = run.throttle > 0.3 ? 0 : P3.sostiene - dt;
    if (P3.sostiene > 0) { plane.y = AIR_START_Y; plane.vy = Math.max(0, plane.vy); }
  }
  if (S.state === 'play' && P3.muerto && run.t > 0) P3.muerto = false;   // el relevo: el avion nuevo ya vuela
  if (I.ir) { const q = I.ir; I.ir = null; const [x, z] = mundo.lonLatLocal(q.lon, q.lat); P3.x = x; P3.z = z; if (q.rumbo != null) P3.yaw = q.rumbo * Math.PI / 180; P3.g = Math.max(mundo.sueloH(x, z), 0); if (q.alt) plane.y = q.alt; }
  geoExterna.on = true; geoExterna.sinRoce = true;
  // EL VIRAJE: lo de costado se vuelve rumbo, con peso
  const pide = Math.max(-1, Math.min(1, plane.vx / VX_FONDO)) * GIRO_MAX;
  P3.giro += (pide - P3.giro) * Math.min(1, dt / GIRO_T);
  P3.yaw += P3.giro * dt;
  plane.x = 0;
  // la correa del borde del mapa, como siempre
  const k = Math.max(0, Math.min(1, (BORDE - mundo.alBorde(P3.x, P3.z)) / 8000));
  if (k > 0) { let d = mundo.rumboAlCentro(P3.x, P3.z) - P3.yaw; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; P3.yaw += d * k * dt; }
  // EL TURBO, con rampa (como la llama del pasillo, render/plane.js `flameF`): lo leen la tobera, el humo y
  // la camara (systems/islas/avion3d.js, camara.js)
  P3.turbo += (((run.boost && run.fuel > 0) ? 1 : 0) - P3.turbo) * Math.min(1, dt * 4);
  // AVANZAR
  const m = run.spd * U * VEL_MAPA * (1 + (TURBO_MAPA - 1) * P3.turbo) * dt;
  // LAS LINEAS DE VELOCIDAD, de mas (autor: "falta el efecto particulas"): las del pasillo nacen pocas
  // y solo pasados los 115; sobre el mapa siempre hay algunas, y con el turbo, un chorro largo y rapido
  if (S.state === 'play' && run.spd > 60) {
    const n = Math.random() < dt * 30 ? 1 : 0, nt = Math.round(P3.turbo * 4);
    for (let i = 0; i < n + nt; i++) streaks.push({ a: Math.random() * 6.283, r: 22 + Math.random() * 24,
      v: 320 + Math.random() * 200 + 260 * P3.turbo, life: 0.45, L: 9 + 10 * P3.turbo });
  }
  P3.x += Math.sin(P3.yaw) * m; P3.z -= Math.cos(P3.yaw) * m;
  P3.od += m;   // el cuentakilometros: con el, las balas siguen sobre el mapa (`proyectiles`)
  bombas(dt, m);
  // EL TEATRO (teatro.js, docs/proyecto/PLAN_TEATRO_MALVINAS.md): las bases, los buques y las PAC del 24 de mayo
  teatro.armar();
  teatro.paso(dt, { x: P3.x, z: P3.z, g: P3.g, yaw: P3.yaw, y: plane.y }, enCabina() ? CABINA.PZ : CABINA.PZ_AFUERA, estallido, S.state === 'play');
  // EL SUELO QUE SUBE se come la altura; el que baja te la devuelve (y la gravedad del pasillo hace el resto)
  const g = Math.max(mundo.sueloH(P3.x, P3.z), 0), dg = g - P3.g;
  P3.g = g;
  plane.y -= dg;
  cam.y -= dg;   // (la camara del pasillo mide su altura sobre el MISMO suelo: si no se corre con el, salta)
  if (S.state === 'play' && dg > PARED && plane.y < -PARED) return 'death_land';
  // SOBRE TIERRA NO HAY ROCE (autor, 19/11: "el avion no debe tomar de referencia la colina… sube solo cuando
  // pasa por una irregularidad; eso solo con la altura trabada desde arriba, en los otros casos debe
  // colisionar si no mantengo gas"): el roce del pasillo LEVANTA al avion al piso, que en el agua es su gracia
  // y en una loma era subirla solo. En las islas tocar la tierra es chocar; el agua sigue con su roce.
  // (y ya no hay roce que lo levante — flight.js `geoExterna.sinRoce`—: tocar la tierra es chocar, en todas las vistas)
  if (S.state === 'play' && g > 0.3 && plane.y <= 0.5) return 'death_land';
  // SIN NAFTA EL AGUA TAMBIEN TE MATA: el roce del pasillo te dejaba planeando sobre las olas para siempre
  if (S.state === 'play' && run.fuel <= 0 && plane.y <= 0.6) return 'death_sea';
  // DESDE ARRIBA EL AVION MANTIENE LA ALTURA (autor, 19/11): desde la vista cenital no hay como medirla, asi que
  // se traba la que tenia al entrar. Es ALTURA ABSOLUTA (19/11 tarde, el autor: "el avion no puede subir solo cuando
  // esta cerca de la tierra o de irregularidades… y bajar tampoco, debe poder subir"): no sigue el relieve —una
  // loma mas alta te choca—, el GAS la sube y la PICADA (S) la baja. Al volver a las otras vistas se SUELTA.
  if (camara.vista() === camara.ARRIBA && S.state === 'play') {
    if (P3.altFija === null) P3.altFija = P3.g + Math.max(plane.y, 1);
    if (inp.u && run.fuel > 0) P3.altFija += ARRIBA_VY * dt;
    if (inp.d) P3.altFija -= ARRIBA_VY * dt;
    P3.altFija = Math.min(P3.altFija, P3.g + ARRIBA_TECHO);
    plane.y = P3.altFija - P3.g; plane.vy = 0;
  } else P3.altFija = null;
  // EL AVION NO SE SALE DEL CUADRO (autor, 19/11: "cuando esta bajando o subiendo en picada en 3ra persona se
  // pierde de la pantalla"): la camara del pasillo lo sigue con retardo (vuelo.js, lerp de 3,2/s) y en el
  // pasillo alcanza, pero sobre el mapa una picada larga la deja atras. Se la ata a una franja alrededor del
  // avion: con PZ 14 y focal 135, 1 m son ~10 px; la franja lo deja entre la fila ~55 y la ~190 (arriba del tablero).
  if (!enCabina()) cam.y = Math.max(plane.y - CAM_ARRIBA, Math.min(plane.y + CAM_ABAJO, cam.y));
  if (P3.A) lugares(P3.A, dt);
  return null;
}

/** LA MALLA QUE VUELA (assets/mallas, tools/blender/exportar_mallas_todas.py): el avion elegido; los
 *  numerales que no son el primero vuelan una de las cuatro variantes de pintura de los cazas, con la misma
 *  cuenta que los sprites del pasillo (render/squad.js: `variantes[(n - 1) % 4]`). */
const CON_VARIANTES = ['sky', 'a4q', 'dagger', 'mirage', 'supere', 'pampa'];
export function mallaDe(clave, numeral) {
  return numeral > 0 && CON_VARIANTES.includes(clave) ? 'var_' + clave + '_' + ((numeral - 1) % 4 + 1) : clave;
}

// LAS BOMBAS SOBRE EL MAPA (systems/islas/objetivo.js): las nuevas del pasillo se anotan con su punto de suelta,
// y las que pegan (la base o la tierra) se sacan del pasillo con su estallido.
const _b = { x: 0, y: 0, z: 0 };
function bombas(dt, m) {
  for (const pm of pmissiles) {
    if (pm.exocet || pm.tanque || !('extra' in pm) || objetivo.seguida(pm)) continue;
    aMundo(pm.x, 0, pm.z, _b);
    objetivo.soltada(pm, _b.x, _b.z, P3.yaw, P3.g);
  }
  const golpes = objetivo.paso(dt, new Set(pmissiles), m);
  for (const { pm, que, x, z, alto } of golpes) {
    // LA EXPLOSION EN 3D (estallido3d.js): la ven todas las camaras, tambien la de arriba
    estallido(x, alto, z, que === 'blanco' ? 2.2 : que === 'agua' ? 0.8 : 1, que === 'agua' ? 'agua' : 'fuego');
    if (que === 'agua') continue;   // (el agua la resolvio el pasillo: la bomba ya no esta)
    teatro.impacto(x, z, estallido);   // lo del teatro que estaba ahi
    const i = pmissiles.indexOf(pm); if (i >= 0) pmissiles.splice(i, 1);
    if (que === 'blanco') {
      explodeAt(pm.x, Math.max(pm.y, 2), pm.z, true);
      for (let k = 0; k < 4; k++) explodeAt(pm.x + (Math.random() - 0.5) * 30, 3 + Math.random() * 10, pm.z + (Math.random() - 0.5) * 40, true, false, true);
      cartel(T('islasObjDestruido'), P.accent, T('islasObjDestruidoSub'));
    } else columnaBomba(pm.x, Math.max(pm.y, 0), pm.z, false);
  }
}

// LAS EXPLOSIONES EN 3D (19/11, el autor: "mejora las explosiones, el avion debe explotar en todas las
// camaras"): las del pasillo son de pantalla (core/fx.js, con `proj`) y desde arriba no se veian. Estas van en el
// MAPA: se anotan aca y las dibuja systems/islas/estallido3d.js (three-arena.js las toma cada cuadro).
const ESTALLIDOS = [];
export function estallido(x, y, z, esc = 1, tipo = 'fuego', vx = 0, vz = 0) {
  if (ESTALLIDOS.length < 16) ESTALLIDOS.push({ x, y, z, esc, tipo, vx, vz });
}
/** Los estallidos nuevos de este cuadro (y se vacia la cola). */
export function tomarEstallidos() { const o = ESTALLIDOS.slice(); ESTALLIDOS.length = 0; return o; }
/** EL AVION REVIENTA (game.js `crashFX`): en su punto del mapa, con la inercia que traia; la malla se apaga. */
export function estallarAvion(misil) {
  if (!enPasillo() || !I.puesto || P3.muerto) return;
  const v = run.spd * U * VEL_MAPA * 0.5;
  estallido(P3.x, P3.g + Math.max(plane.y, 0.5), P3.z, misil ? 2 : 1.5, 'avion', Math.sin(P3.yaw) * v, -Math.cos(P3.yaw) * v);
  P3.muerto = true;
}
/** EL TEATRO para la escena 3D (teatro3d.js), o null fuera de las islas. */
export const teatroEscena = () => (enPasillo() ? teatro.escena() : null);
/** …y para apagarlo al salir (three-arena.js), aunque ya no se este en las islas. */
export const teatroTodo = () => teatro.escena();
/** LOS HARRIERS DEL DUELO puestos en el mapa (los del pasillo, systems/caza.js, viven en el carril): solo los
 *  dibuja la vista de arriba. */
export function cazasEnMapa() {
  if (!enPasillo() || !I.puesto) return [];
  return caza.snapshot().filter(h => h.z > 1).map(h => {
    const p = aMundo(h.x, h.y, h.z, {});
    // (de frente solo mientras ENTRA —el aviso, que viene del horizonte hacia vos—; despues vuela con vos)
    return { x: p.x, y: P3.g + h.y, z: p.z, yaw: P3.yaw + (h.fase === 'aviso' ? Math.PI : 0), roll: (h.bank || 0) * 0.6 };
  });
}
/** ¿El avion ya revento? (three-arena.js deja de dibujar la malla) */
export const avionMuerto = () => P3.muerto;

/** El objetivo, para la escena 3D (objetivo3d.js), o null. */
export const objetivoDe = () => (enPasillo() && objetivo.OBJ.on ? objetivo.OBJ : null);
/** La base ya cayo y paso el rato del festejo: la mision termina (game.js vuelve a PRUEBAS). */
export const misionCumplida = () => enPasillo() && objetivo.OBJ.on && !objetivo.OBJ.vivo && objetivo.OBJ.cayoT > 4;
/** LA BRUJULA del tablero (render/hud.js): el rumbo del avion y hacia donde y a cuanto queda el objetivo. */
export function brujula() {
  if (!enPasillo() || !I.puesto) return null;
  const o = blanco();
  return { rumbo: P3.yaw, obj: o ? Math.atan2(o.x - P3.x, -(o.z - P3.z)) : null, dist: o ? Math.hypot(o.x - P3.x, o.z - P3.z) : null };
}
/** A donde apunta todo (brujula, marca del pasillo): la marca del jugador, o la base costera viva, o nada. */
function blanco() {
  if (MARCA.on) return MARCA;
  const O = objetivo.OBJ;
  return O.on && O.vivo ? { x: O.x, z: O.z, g: O.g, n: T('islasObjetivoCorto') } : null;
}
/** LA MARCA del objetivo en las vistas del pasillo: donde cae en el carril (la cuenta de `aMundo`, al reves),
 *  con su distancia y su nombre, o null si quedo atras. */
export function objetivoPasillo() {
  const O = blanco();
  if (!vistaPasillo() || !O) return null;
  const pz = enCabina() ? CABINA.PZ : CABINA.PZ_AFUERA;
  const dx = O.x - P3.x, dz = O.z - P3.z, sy = Math.sin(P3.yaw), cy = Math.cos(P3.yaw);
  const d = sy * dx - cy * dz, l = cy * dx + sy * dz;
  if (d < 30) return null;
  return { x: plane.x + l, y: O.g - P3.g + 12, z: d + pz, dist: Math.hypot(dx, dz), n: O.n };
}

/** Marca el objetivo del jugador en (u, v) del mapa, con su nombre. */
export function marcar(u, v, n) {
  if (!enPasillo() || !I.puesto) return;
  const o = mundo.org(), [ax, az] = mapa.deUV(u, v);
  MARCA.x = ax - o[0]; MARCA.z = az - o[1];
  MARCA.g = Math.max(mundo.sueloH(MARCA.x, MARCA.z), 0); MARCA.n = n; MARCA.on = true;
}
export function desmarcar() { MARCA.on = false; }

/** EL MAPA DE DESARROLLO (systems/islas/mapa.js, lo dibuja render/islas_mapa.js): la imagen y lo de este cuadro.
 *  `cursor` = { u, v } o null. */
const PEGA = 0.012;   // a cuanto (fraccion del ancho del mapa) el cursor se pega a un punto
export function mapaDatos(cursor) {
  if (!enPasillo() || !I.puesto || !mundo.listo()) return null;
  const o = mundo.org(), ax = P3.x + o[0], az = P3.z + o[1];
  const [lon, lat] = mapa.lonLat(ax, az);
  const lug = LUGARES.map(l => { const [x, z] = mundo.lonLatAbs(l.lon, l.lat); return { n: l.n, ...mapa.aUV(x, z), d: Math.hypot(x - ax, z - az), r: Math.atan2(x - ax, -(z - az)) }; });
  const cerca = lug.reduce((a, b) => (b.d < a.d ? b : a), lug[0]);
  const O = objetivo.OBJ;
  const obj = O.on ? { ...mapa.aUV(O.x + o[0], O.z + o[1]), vivo: O.vivo, n: O.nombre, d: Math.hypot(O.x - P3.x, O.z - P3.z) } : null;
  let cur = null;
  if (cursor) { const [cx, cz] = mapa.deUV(cursor.u, cursor.v); const [clon, clat] = mapa.lonLat(cx, cz); cur = { ...cursor, lat: mapa.gm(clat, 'N', 'S'), lon: mapa.gm(clon, 'E', 'O'), h: Math.round(mundo.mapH(cx, cz)) }; }
  // EL TEATRO (teatro.js): lo nuestro siempre; lo britanico, cuando ya lo pasaste cerca (era dificil encontrarlos)
  const E = teatro.escena(), teat = [];
  if (E) {
    for (const b of teatro.bases()) if (b.visto) teat.push({ k: 'base', bando: b.bando, n: b.n, ...mapa.aUV(b.x + o[0], b.z + o[1]) });
    for (const b of E.buques) if (b.visto) teat.push({ k: 'buque', bando: 'gb', vivo: b.vivo, n: b.n, ...mapa.aUV(b.x + o[0], b.z + o[1]) });
    for (const c of E.pac) if (c.vista && c.estado !== 'muerta') teat.push({ k: 'pac', bando: 'gb', n: c.n, ...mapa.aUV(c.x + o[0], c.z + o[1]), r: c.r / mundo.MAP_W });
  }
  // LOS PUNTOS ELEGIBLES (el cursor se les pega; Q/E y L1/R1 saltan de uno a otro, de oeste a este)
  const puntos = [...lug.map(l => ({ k: 'lugar', n: l.n, u: l.u, v: l.v })),
    ...teat.filter(q => q.k !== 'pac').map(q => ({ k: q.k, n: q.n, u: q.u, v: q.v })),
    ...(obj && obj.vivo ? [{ k: 'obj', n: obj.n, u: obj.u, v: obj.v }] : [])].sort((a, b) => a.u - b.u);
  const asp = mundo.MAP_D / mundo.MAP_W;
  if (cur) {
    let best = null, bd = PEGA;
    for (const q of puntos) { const dd = Math.hypot(q.u - cur.u, (q.v - cur.v) * asp); if (dd < bd) { bd = dd; best = q; } }
    cur.punto = best;
  }
  const marca = MARCA.on ? { ...mapa.aUV(MARCA.x + o[0], MARCA.z + o[1]), n: MARCA.n, d: Math.hypot(MARCA.x - P3.x, MARCA.z - P3.z) } : null;
  return {
    img: mapa.imagen(), avion: { ...mapa.aUV(ax, az), rumbo: P3.yaw }, obj, lugares: lug, cursor: cur, teatro: teat, puntos, marca,
    lat: mapa.gm(lat, 'N', 'S'), lon: mapa.gm(lon, 'E', 'O'), alt: Math.round(P3.g + plane.y), suelo: Math.round(P3.g),
    rumbo: Math.round(((P3.yaw * 180 / Math.PI) % 360 + 360) % 360), cerca,
  };
}
/** El mapa lleva al avion a (u, v), con su rumbo y a 40 m sobre lo que haya ahi. */
export function mapaIr(u, v) {
  if (!enPasillo() || !I.puesto) return;
  const o = mundo.org(), [ax, az] = mapa.deUV(u, v);
  P3.x = ax - o[0]; P3.z = az - o[1];
  P3.g = Math.max(mundo.sueloH(P3.x, P3.z), 0); plane.y = 40; plane.vy = 0;
}

/** El avion esta sobre tierra (la eyeccion: caes entre los tuyos o al agua). */
export const sobreTierra = () => enPasillo() && P3.g > 0.3;

/** La altura trabada desde arriba (el candado del altimetro, render/hud.js). */
export const altFija = () => enPasillo() && P3.altFija !== null;

/** Donde esta el avion en el mapa (x, z), su rumbo y el suelo bajo el: lo lee la camara del pasillo. */
export const marco = () => ({ x: P3.x, z: P3.z, yaw: P3.yaw, g: P3.g });

/** El avion del pasillo puesto en el mapa, con la forma que lee la escena 3D (la del arena). */
export function estadoA() {
  if (!enPasillo() || !mundo.listo() || !I.puesto) return null;
  const sp = Math.max(1, run.spd * U * VEL_MAPA);
  const pitch = Math.atan2(plane.vy, sp) * 0.8 + plane.pitch * 0.12;
  // el ALABEO: el del pasillo, el giro de las piruetas y EL ROLIDO SOBRE SU EJE (Q/E, flechas, stick
  // derecho: `run.freeRoll`, que en el pasillo rola el dibujo y el horizonte)
  const roll = Math.max(-1, Math.min(1, plane.bank)) * BANK_FULL + (run.mvRoll || 0) + (run.freeRoll || 0);
  const f = forward(P3.yaw, pitch);
  const A = P3.A || (P3.A = { pos: { x: 0, y: 0, z: 0 } });
  A.pos.x = P3.x; A.pos.y = P3.g + Math.max(plane.y, 0.3); A.pos.z = P3.z;
  A.yaw = P3.yaw; A.pitch = pitch; A.roll = roll; A.fwd = f; A.vel = f; A.spd = sp; A.t = run.t;
  A.turbo = P3.turbo; A.motor = run.fuel > 0 ? 1 : 0; A.pirueta = !!run.mv;   // (los vortices: fuertes en la pirueta)
  return A;
}

/** Un punto del CARRIL del pasillo (x de costado, y sobre el suelo, z de profundidad delante de la camara)
 *  puesto en el mapa: el carril va pegado al avion y mira para donde mira el avion. */
export function aMundo(x, y, z, out) {
  const pz = enCabina() ? CABINA.PZ : CABINA.PZ_AFUERA;
  // (1:1, en el mismo marco que la camara del pasillo: asi lo que se dibuja en 3D cae donde lo pone `proj`)
  const d = z - pz, l = x - plane.x, sy = Math.sin(P3.yaw), cy = Math.cos(P3.yaw);
  out.x = P3.x + sy * d + cy * l; out.z = P3.z - cy * d + sy * l;
  out.y = Math.max(mundo.sueloH(out.x, out.z), 0) + y;
  return out;
}

/** LOS PROYECTILES DEL PASILLO en el mapa (19/11: "los misiles no se ven"): las balas propias, los misiles
 *  enemigos (con las trazadoras) y los propios. Cada uno con su punto y el de su estela (de donde viene). */
const PROY = [];
const ESTELA_N = 28;          // cuadros de estela de un misil (~0,5 s)
export function proyectiles() {
  PROY.length = 0;
  if (!enPasillo() || !I.puesto) return PROY;
  const add = (o, k, dz) => {
    if (o.done || o.x == null || o.z == null) return;
    if (k === 'bala') return addBala(o);
    const p = aMundo(o.x, o.y || 0, o.z, {}), c = aMundo(o.x, o.y || 0, o.z + dz, {});
    // LA ESTELA DE LOS MISILES: por donde PASO en el mapa (no en el carril, que gira con el avion)
    let h = null;
    if (k === 'misil' || k === 'propio') {
      h = o.__islasH || (o.__islasH = []);
      h.push(p); if (h.length > ESTELA_N) h.shift();
    }
    PROY.push({ k, p, c, h });
  };
  for (const b of bullets) add(b, 'bala', -6);
  for (const m of missiles) add(m, m.tracer ? 'traza' : 'misil', 14);
  for (const m of pmissiles) {
    // LA BOMBA, sobre el mapa (objetivo.js la sigue desde que se suelta) y con su SOMBRA (abajo)
    const b = objetivo.posBomba(m);
    if (b) { PROY.push({ k: 'bomba', p: { x: b.x, y: b.alto, z: b.z }, s: { x: b.x, y: b.suelo + 0.3, z: b.z }, alto: b.alto - b.suelo }); continue; }
    add(m, 'propio', -14);
  }
  return PROY;
}
// LAS BALAS DERECHO (19/11, el autor: "que el avion dispare derecho"): el carril gira con el avion, y una bala
// dibujada en el carril se iba con el en cada viraje (desde arriba, un abanico). Ahora cada bala se ANCLA al mapa
// la primera vez que se la ve —punto y rumbo de salida— y avanza lo que avanza en el carril mas lo que avanzo el
// avion (P3.od). El pasillo la sigue chocando en su carril: esto es solo donde se dibuja.
function addBala(o) {
  let a = o.__islasB;
  if (!a) {
    const p0 = aMundo(o.x, o.y || 0, o.z, {});
    a = o.__islasB = { x: p0.x, z: p0.z, dx: Math.sin(P3.yaw), dz: -Math.cos(P3.yaw), zp: o.z, xp: o.x, od: P3.od };
  }
  const adv = (o.z - a.zp) + (P3.od - a.od), lat = o.x - a.xp;
  a.x += a.dx * adv - a.dz * lat; a.z += a.dz * adv + a.dx * lat;
  a.zp = o.z; a.xp = o.x; a.od = P3.od;
  const y = P3.g + (o.y || 0);   // (a la altura del avion: el mismo suelo que `estadoA`)
  PROY.push({ k: 'bala', p: { x: a.x, y, z: a.z }, c: { x: a.x + a.dx * 6, y, z: a.z + a.dz * 6 }, h: null });
}
/** LA MIRA de la vista de arriba: adelante del avion, en su rumbo (la dibuja proyectiles3d.js). */
// (a una distancia que va con el zoom, `d`: asi cae siempre en el mismo lugar de la pantalla, arriba del avion)
export function mira(d = 60) {
  if (!enPasillo() || !I.puesto || P3.muerto) return null;
  return { x: P3.x + Math.sin(P3.yaw) * d, y: P3.g + Math.max(plane.y, 0.3), z: P3.z - Math.cos(P3.yaw) * d, yaw: P3.yaw };
}

/** La vista de arriba y su zoom (camara.js ZOOMS): [+] / [-]. */
export const vistaArriba = () => camara.vista() === camara.ARRIBA;
export const zoom = dir => camara.zoom(dir);

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
    // (ABAJO, arriba del tablero: arriba de todo se pisaba con la radio — "CHANCHA, … TENGO SECO" — y los carteles)
    popup(MEDIO, 205, best.n, P.accent, true);
    I.avisoT = 4;
  }
  if (best) I.lugar = best;
}

/** Sonda (consola, fixtures y PRUEBAS): `__malvinas()` prende, `__malvinas(false)` apaga, `__malvinas('?')` informa. */
if (typeof window !== 'undefined') {
  window.__malvinas = (on = true) => {
    if (on && typeof on === 'object' && on.radar != null) { I.radar = !!on.radar; return I.radar; }
    if (on && typeof on === 'object' && on.vista != null) { camara.poner(on.vista); cabina.on = on.vista === camara.CABINA; return true; }
    // { aObjetivo: m }: a m metros del objetivo, de frente, a 20 m sobre su explanada (para probar la suelta)
    if (on && typeof on === 'object' && on.aObjetivo != null) {
      const O = objetivo.OBJ; if (!O.on) return false;
      const r = Math.atan2(O.x - P3.x, -(O.z - P3.z));
      P3.x = O.x - Math.sin(r) * on.aObjetivo; P3.z = O.z + Math.cos(r) * on.aObjetivo; P3.yaw = r;
      P3.g = Math.max(mundo.sueloH(P3.x, P3.z), 0); plane.y = O.g + (on.alt || 20) - P3.g; plane.vy = 0;
      return true;
    }
    if (on && typeof on === 'object') { I.ir = on; return true; }   // ir a un lugar: { lon, lat, alt, rumbo }
    if (on === '?') return { on: I.on, estado: mundo.estado(), prog: +mundo.progreso().toFixed(2), org: mundo.org(), lugar: I.lugar && I.lugar.n,
      // el recorrido sobre el mapa y lo que lo mueve (para medir viraje y rolido sin mirar)
      x: Math.round(P3.x), z: Math.round(P3.z), rumbo: Math.round(P3.yaw * 180 / Math.PI), vx: +plane.vx.toFixed(2), px: +plane.x.toFixed(2),
      bank: +plane.bank.toFixed(2), freeRoll: +(run.freeRoll || 0).toFixed(2), mvRoll: +(run.mvRoll || 0).toFixed(2), spd: +run.spd.toFixed(1), y: +plane.y.toFixed(1), st: S.state,
      // los proyectiles en el mapa: cuantos de cada tipo y el mas cercano al avion (metros)
      proy: proyectiles().map(q => q.k + ':' + Math.round(Math.hypot(q.p.x - P3.x, q.p.z - P3.z)) + '/' + Math.round(q.p.y - P3.g - plane.y)).slice(0, 6),
      enemigos: missiles.length,
      brujula: brujula(), obj: objetivo.OBJ.on ? { vivo: objetivo.OBJ.vivo, g: Math.round(objetivo.OBJ.g), dist: Math.round(objetivo.haciaDesde(P3.x, P3.z).dist), cayoT: +objetivo.OBJ.cayoT.toFixed(1) } : null };
    return activar(on);
  };
}
