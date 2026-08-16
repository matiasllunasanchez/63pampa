// LA COLA: el Harrier que te toma la cola durante el PASILLO.
//
// Plan y porque: docs/sistemas/PLAN_HARRIERS_PERSECUCION.md, PLAN A (§3). El §1 es el analisis de
// la dinamica de After Burner — de ahi sale cada regla de abajo — y el §2 la verdad historica que
// la sostiene. El §6 dice lo que NO se hace, y conviene tenerlo a mano al tocar esto.
//
// EN UNA LINEA: el aviso llega ANTES que el avion. Primero las trazadoras que te pasan de largo, y
// recien despues el caza. No hay lock-on, no hay tono, no hay recuadro de fijado (§6.1): los A-4
// no tenian nada. Los ojos y la radio, y a veces ni la radio.
//
// EL CICLO, que es todo el sistema:
//
//     aviso ──> presion ──> sobrepaso ──> ventana ──┬─> recola ──> presion (hasta CAZA_PASSES)
//                                                    └─> salida ──> se fue
//
//   aviso      las primeras trazadoras cruzan de atras hacia adelante, a los costados tuyos. Es el
//              tell clasico: no hace falta ver al enemigo para saber que esta.
//   presion    esta atras, invisible o asomando en los bordes, y su solucion de tiro madura
//              mientras tu rumbo sea predecible (H2 le pone los dientes: aca todavia no hay daño).
//   sobrepaso  el que estaba atras NO se queda atras — te pasa ENORME por un costado y queda
//              adelante. Es la moneda del juego (§1: "el cruce cercano ES el juego").
//   ventana    unos segundos de frente, esquivandose: es tu turno de tirarle (H3).
//   recola     desperdiciada la ventana, se reencola y vuelve a empezar.
//   salida     agotadas las pasadas o cumplido el reloj de la CAP, se va. Alivio dramatico.
//
// LO QUE ESTE MODULO NO HACE, y es la mitad de su diseño:
//
//   · NO ESCRIBE TU FISICA. Lee `plane` y `run` para saber como volas — altura, rumbo, velocidad —
//     y jamas les escribe una linea (§6.4). Es la razon por la que `npm run feel` tiene que dar
//     identico en todas las fases de este plan: el duelo pasa POR ENCIMA del vuelo, no adentro.
//   · NO LLAMA HACIA ARRIBA. Cuando te alcanza devuelve `{ death: 'death_caza' }` y game.js decide
//     si eso es relevo o derrota, igual que todos los sistemas (convencion 2 de ARQUITECTURA).
//   · NO DIBUJA. El estado se expone con `snapshot()` y lo pinta render/caza.js.
//   · NO APARECE en ARENA, PASADA ni MINUTOS SAGRADOS (§6.6): es una mecanica del PASILLO. Quien
//     hace respetar eso es game.js, que solo lo corre en el estado 'play'.
//
// ESTADO DE LAS FASES: H0 hecho (este cimiento). H1 le pone la coreografia visible SIN daño.
// Los dientes (la solucion de tiro y las rafagas que pegan) son H2, y el contraataque, H3.

import { plane } from '../core/state.js';
import { run } from '../core/run.js';
import { popup } from '../core/fx.js';
import { T } from '../core/i18n.js';
import { P } from '../data/palette.js';
import { W, PZ } from '../render/ctx.js';
import {
  CAZA_SOL_T, CAZA_PASSES, CAZA_CAP_T, CAZA_WINDOW, CAZA_RAS_ALT,
  CAZA_PRES_T, CAZA_AVISO_T, CAZA_OVER_T, CAZA_RECOLA_T, CAZA_SALIDA_T,
  CAZA_Z_COLA, CAZA_Z_FRENTE, CAZA_X_COLA, CAZA_MISS,
  CAZA_TRAC_V, CAZA_TRAC_N, CAZA_TRAC_GAP,
} from '../data/tuning.js';
import { beep, boom, duck } from './audio.js';
import { pilotName } from './squad.js';
import { pilotIdx } from '../core/squad.js';

// ---- estado privado ----
// UN SOLO DUELO POR VEZ, y es un EVENTO (§6.2). No es una lista de enemigos: es una instancia o
// nada. `C` null significa exactamente eso — no hay Harrier, y todo el sistema cuesta un `if`.
let C = null;

/** Sorteo en un rango [lo, hi]. Se llama al ENTRAR a una fase, nunca por cuadro: los patrones por
 *  cuadro con Math.random son la trampa #3 del repo (flicker) y aca ademas romperian el ritmo. */
const entre = ([lo, hi]) => lo + Math.random() * (hi - lo);

/** El indicativo del piloto que esta volando ahora. La radio le habla A EL, y en un relevo el
 *  nombre cambia — por eso se pregunta cada vez y no se guarda al armar el duelo. */
const miIndicativo = () => pilotName(pilotIdx(run.squad, run.lives));

/** ¿Hay un duelo corriendo? */
export function active() { return C !== null; }

/** ARMA EL DUELO. `opts.mudo` entra sin aviso por radio — el canon del §2: sin radar ni RWR, el
 *  aviso es de Condor o de un Fiel… y a veces no llega. Las trazadoras pasando son el unico aviso
 *  garantizado, y por eso son las que empiezan siempre.
 *  Si ya hay uno corriendo no hace nada: UN Harrier es un evento, dos es el final (§6.2). */
export function start(opts = {}) {
  if (C) return false;
  C = {
    fase: 'aviso',
    t: 0,                       // reloj de la fase en curso
    dur: CAZA_AVISO_T,          // cuanto dura esta fase
    capT: 0,                    // reloj de estacion de la CAP: corre SIEMPRE, aunque cambie la fase
    pase: 0,                    // pasadas completadas
    mudo: !!opts.mudo,          // duelo sin aviso por radio (§2)
    // --- la solucion de tiro (H2 la usa; H0/H1 la MIDEN sin cobrarla) ---
    sol: 0,                     // 0..1 — madura con rumbo predecible, se resetea con los quiebres
    px: plane.x, py: plane.y,   // tu posicion del cuadro anterior: de ahi sale si estas quebrando
    // --- vida del caza (H3) ---
    hp: 0,                      // impactos encajados
    humo: 0,                    // 0..1 — ahuyentado y humeando
    // --- donde esta, en unidades de MUNDO (misma z que obstaculos y balas; vos volas en PZ) ---
    x: plane.x, y: plane.y, z: CAZA_Z_COLA,
    lado: Math.random() < 0.5 ? -1 : 1,   // por que costado va a sobrepasar
    // --- coreografia (H1) ---
    fx: [],                     // trazadoras que te pasan de largo y estela del sobrepaso
    tracT: 0,                   // reloj de la proxima rafaga
  };
  if (!C.mudo) popup(W / 2, 46, T('caza_warn', { c: miIndicativo() }), P.warn);
  return true;
}

/** Corta el duelo de raiz. Lo llama `reset()` de game.js: una corrida nueva no hereda al de antes. */
export function resetCaza() { C = null; }

/** Pasa a la fase `f` con su duracion. Un solo lugar donde se escribe `fase`, para que el ciclo
 *  del §3 se lea entero en `avanzar()` y no haya transiciones sueltas por el archivo. */
function ir(f, dur) { C.fase = f; C.t = 0; C.dur = dur; }

/** LA MADURACION DE LA SOLUCION DE TIRO. Todavia no cobra nada (eso es H2), pero ya se mide desde
 *  H0 porque es el numero que dice si el duelo esta enseñando lo que promete: si nadie baja, la
 *  regla del ras no existe. Tres reglas, y las tres son la tesis del juego:
 *    · madura con el RUMBO PREDECIBLE — volar derecho es lo que le da la solucion;
 *    · cada QUIEBRE se la borra — moverse cuesta energia pero salva;
 *    · A RAS casi no progresa (§2: abajo el ambiente degradaba al cazador).
 *  El quiebre se mide contra tu propio cuadro anterior y no contra el input: asi vale igual una
 *  pirueta, un golpe de alabeo o un salto de gas — el sistema no tiene que saber COMO lo hiciste. */
function stepSolucion(dt) {
  const quiebre = Math.abs(plane.x - C.px) + Math.abs(plane.y - C.py) * 0.7;
  C.px = plane.x; C.py = plane.y;
  // el umbral es por segundo, no por cuadro: si no, a 60 fps cualquier temblor contaba de quiebre
  if (quiebre / Math.max(dt, 1e-4) > 9) { C.sol = Math.max(0, C.sol - dt / (CAZA_SOL_T * 0.5)); return; }
  const ras = plane.y <= CAZA_RAS_ALT ? 0.12 : 1;   // a ras casi no progresa
  C.sol = Math.min(1, C.sol + (dt / CAZA_SOL_T) * ras);
}

// ---------------- H1: LA COREOGRAFIA (el pase fantasma, SIN daño) ----------------
//
// H1 se juzga con una MIRADA MUDA: se tiene que entender el ciclo sin leer un solo cartel. Por eso
// todo lo de abajo es puro teatro y no cobra nada — las trazadoras pasan de largo por definicion y
// el sobrepaso no toca al avion. Los dientes son H2, y llegan a este mismo esqueleto.

/** UNA RAFAGA que te pasa de largo. Nacen DETRAS tuyo (z chico) y cruzan hacia adelante mucho mas
 *  rapido que el mundo, asi que se ven ADELANTAR al avion y perderse en el horizonte: es
 *  exactamente lo que hace legible que vienen de atras sin tener que ver quien las tira.
 *
 *  Pasan a CAZA_MISS de tu ala, con el signo del lado por el que viene el caza. No es puntería
 *  mala: es que el aviso tiene que leerse como aviso. Cuando el §3 hable de rafagas que ALCANZAN
 *  (H2), esas van a ser otras — con la solucion de tiro madura y sin este offset. */
function rafaga() {
  const n = Math.round(entre(CAZA_TRAC_N));
  for (let i = 0; i < n; i++) {
    C.fx.push({
      k: 'trac',
      // la rafaga se abre un poco: si salieran todas de la misma linea serian un peine
      x: plane.x + C.lado * CAZA_MISS + (Math.random() - 0.5) * 3,
      y: plane.y + (Math.random() - 0.5) * 4,
      z: 2,
      // LA RAFAGA ES UN CHORRO, NO UNA SALVA. Cada proyectil espera su turno: sin esto salian los
      // seis en el mismo cuadro, cruzaban juntos en 0,7 s y despues quedaba un segundo largo de
      // mar vacio — se leia como un parpadeo, no como fuego sostenido. Escalonados cada 60 ms la
      // rafaga dura casi medio segundo y SIEMPRE hay algo cruzando.
      wait: i * 0.06,
      vz: CAZA_TRAC_V * (0.94 + Math.random() * 0.12),
      life: 1.6 + i * 0.06,
    });
  }
  // el chasquido seco de algo que pasa cerca y no te dio. Corto y agudo: no es una explosion.
  beep(1500 + Math.random() * 500, 0.05, 'square', 0.035, 700);
}

/** Avanza trazadoras y estela, y siembra rafagas nuevas mientras el caza este ATRAS. */
function stepFx(dt) {
  for (const f of C.fx) {
    if (f.k === 'trac') {
      if (f.wait > 0) { f.wait -= dt; continue; }   // todavia no salio: ni se mueve ni se dibuja
      f.z += f.vz * dt; f.life -= dt;
    }
    else { f.life -= dt; f.z -= run.spd * dt; }    // la estela del sobrepaso queda quieta en el mundo
  }
  // TRAMPA #2 DEL REPO: todo fx lleva `life` mayor que su tiempo de uso, porque este filtro
  // generico destruye en el mismo cuadro lo que nace sin vida.
  let n = 0;
  for (let i = 0; i < C.fx.length; i++) if (C.fx[i].life > 0 && C.fx[i].z < 260 && C.fx[i].z > 1) C.fx[n++] = C.fx[i];
  C.fx.length = n;
  // solo dispara desde la cola: adelante tuyo ya no tiene angulo, y ahi el que tira sos vos
  if (C.fase === 'aviso' || C.fase === 'presion') {
    C.tracT -= dt;
    if (C.tracT <= 0) { C.tracT = entre(CAZA_TRAC_GAP); rafaga(); }
  }
}

/** EL CRUCE CERCANO, en sonido y en sacudon. Es la moneda del §1 y lo que lo vuelve un GOLPE no es
 *  el sprite: es que llegue con doppler y te mueva la camara.
 *
 *  OJO — esto escribe `run.shake`, que es lo UNICO que este modulo le escribe al estado del
 *  jugador. No es fisica (el §6.4 protege el vuelo, y `npm run feel` no mira el sacudon): es
 *  feedback de camara, el mismo canal que ya usan el roce, las explosiones y el afterburner. */
function golpeDelPase() {
  // DOPPLER: el tono ARRANCA agudo y cae mientras pasa. Es lo que dice "se acerca y se aleja"
  // sin dibujar nada — y es la razon por la que el sobrepaso se entiende de espaldas.
  beep(760, 0.55, 'sawtooth', 0.1, 190);
  boom(0.1, true);
  duck(0.35);
  run.shake = Math.min(8, run.shake + 5);
  // ESTELA del que te paso: un hilo de aire sucio que queda flotando donde cruzo. Se lee como
  // "por aca paso algo" un segundo despues de que ya no esta.
  for (let i = 0; i < 14; i++) C.fx.push({
    k: 'estela',
    x: plane.x + C.lado * (4 + i * 1.1), y: plane.y + 2.5 + (Math.random() - 0.5) * 1.5,
    z: CAZA_Z_COLA + i * 3.5, life: 0.8 + Math.random() * 0.5, r: 0.5 + Math.random(),
  });
}

/** DONDE ESTA EL CAZA este cuadro. Es la coreografia, no una IA: cada fase tiene su lugar y el
 *  caza va hacia el. H1 le pone el sprite y el sonido encima; lo que se ve moverse es esto. */
function stepPos(dt) {
  const f = C.dur > 0 ? Math.min(1, C.t / C.dur) : 1;
  // seguimiento con retardo: te persigue, no te copia. Lo mismo que hace que asome por un borde
  // cuando quebras — se queda con tu rumbo viejo un instante.
  const lerp = (a, b, k) => a + (b - a) * Math.min(1, k * dt);
  if (C.fase === 'aviso' || C.fase === 'presion') {
    C.x = lerp(C.x, plane.x + C.lado * CAZA_X_COLA * (1 - C.sol), 1.6);
    C.y = lerp(C.y, plane.y + 1.5, 1.4);
    C.z = lerp(C.z, CAZA_Z_COLA, 2);
  } else if (C.fase === 'sobrepaso') {
    // EL CRUCE CERCANO: pasa de atras (CAZA_Z_COLA) a adelante (CAZA_Z_FRENTE) cruzando tu z. En
    // el medio, proj() lo agranda solo — a z 6 la escala es F/6, o sea el sprite ocupando media
    // pantalla. No hay que escalar nada a mano: la perspectiva del juego ya hace el golpe.
    //
    // LA CURVA IMPORTA MAS QUE LA DURACION, y esto se aprendio mirando la primera captura: con un
    // suavizado simetrico (smoothstep) el caza cruzaba tu z en los primeros 200 ms y el resto del
    // sobrepaso era un punto alejandose. El golpe existia y no se veia. Con f^2.2 —lento al
    // arrancar, rapido al final— se QUEDA grande la primera mitad y despues se va de golpe, que es
    // como se lee un cruce cercano de verdad: te tapa la pantalla y desaparece.
    const e = Math.pow(f, 2.2);
    C.z = CAZA_Z_COLA + (CAZA_Z_FRENTE - CAZA_Z_COLA) * e;
    // entra DESDE EL COSTADO: arranca casi fuera de cuadro (donde venia presionando) y se cierra
    // sobre tu ala. No pasa por el centro — pasarte por encima taparia el juego, no lo adornaria.
    // EL 0.20 ESTA MEDIDO CONTRA EL BORDE DE LA PANTALLA, no elegido a ojo. En el momento mas
    // grande del pase el caza esta en z ~9, o sea escala 15: el sprite mide ahi 158 px de los 480
    // del mundo, y el cuadro llega hasta 240 desde el centro. Para que entre ENTERO su centro no
    // puede pasar de 160 px del eje, o sea ~10 unidades de mundo. Con 0.35 (13 unidades) quedaba
    // literalmente cortado por el marco y lo que se veia era media ala.
    C.x = plane.x + C.lado * (4 + CAZA_X_COLA * 0.20 * (1 - e));
    C.y = plane.y + 1.5 + 3 * e;
  } else if (C.fase === 'ventana') {
    // SE ESQUIVA: no es un blanco plantado. Teje en los tres ejes, y el de PROFUNDIDAD es el que
    // mas se nota — crecer y achicarse es lo que dice "esto es un avion maniobrando" y no un
    // sprite pegado al horizonte. Sigue siendo tirable: el tejido es amplio y lento, no un
    // tembleque (el §6.3 pide peligroso, no imposible).
    C.z = lerp(C.z, CAZA_Z_FRENTE + Math.sin(run.t * 1.1) * 12, 1.2);
    C.x = lerp(C.x, plane.x + Math.sin(run.t * 1.7) * 9, 1.1);
    C.y = lerp(C.y, plane.y + 6 + Math.sin(run.t * 0.9) * 2.5, 1.2);
  } else if (C.fase === 'recola') {
    // se va para arriba y para atras, y reaparece en la cola. Es el movimiento de After Burner y
    // es tambien lo honesto: recuperar la cola cuesta energia y se ve costar.
    C.z = lerp(C.z, 260, 2.2);
    C.y = lerp(C.y, plane.y + 22, 1.6);
    if (C.t > C.dur * 0.6) { C.z = CAZA_Z_COLA; C.y = plane.y + 8; C.x = plane.x + C.lado * CAZA_X_COLA; }
  } else if (C.fase === 'salida') {
    C.z = lerp(C.z, 340, 1.8);
    C.y = lerp(C.y, plane.y + 30, 1.2);
    C.x = lerp(C.x, plane.x + C.lado * 40, 1.2);
  }
}

/** EL CICLO del §3, en un solo lugar. Devuelve true cuando el duelo termino. */
function avanzar() {
  if (C.t < C.dur) return false;
  switch (C.fase) {
    case 'aviso':
      ir('presion', entre(CAZA_PRES_T));
      return false;
    case 'presion':
      C.pase++;
      ir('sobrepaso', CAZA_OVER_T);
      golpeDelPase();
      return false;
    case 'sobrepaso':
      ir('ventana', CAZA_WINDOW);
      return false;
    case 'ventana':
      // SE VA POR RELOJ O POR PASADAS, y las dos salidas son honestas: la CAP tenia minutos de
      // estacion (§2) y el plan le pone un techo de pasadas para que el evento no sea eterno.
      if (C.pase >= CAZA_PASSES || C.capT >= CAZA_CAP_T) {
        ir('salida', CAZA_SALIDA_T);
        popup(W / 2, 46, T('caza_out'), P.foam);
      } else ir('recola', CAZA_RECOLA_T);
      return false;
    case 'recola':
      ir('presion', entre(CAZA_PRES_T));
      return false;
    case 'salida':
      return true;
  }
  return false;
}

/** UN CUADRO del duelo. Devuelve `{ death }` cuando te alcanza (H2 en adelante) y `undefined`
 *  mientras siga corriendo o no haya duelo. game.js decide que hacer con la señal. */
export function cazaSystem(dt) {
  if (!C) return;
  C.t += dt; C.capT += dt;
  stepSolucion(dt);
  stepPos(dt);
  stepFx(dt);
  if (avanzar()) C = null;
  // H1 no hace daño: el pase es FANTASMA a proposito, para poder juzgar la coreografia sin morir
  // mientras se la mira. Los dientes entran en H2 y se devuelven por aca.
  return;
}

/** LO QUE VE EL RENDER. Copia chata y de solo lectura: render/caza.js no tiene por que poder
 *  escribir el duelo (convencion 4 de ARQUITECTURA — el dibujo lee, no manda). */
export function snapshot() {
  if (!C) return null;
  return {
    fase: C.fase, t: C.t, dur: C.dur, pase: C.pase, sol: C.sol,
    x: C.x, y: C.y, z: C.z, lado: C.lado, humo: C.humo, fx: C.fx,
  };
}

// ---------- SONDA (QUITAR al cerrar el plan) ----------
// El duelo es un evento que tarda en llegar y dura menos de un minuto: sin esto, mirar el
// sobrepaso una vez cuesta volar medio nivel y tener suerte. Mismo patron que `__adbg`/`__aset`
// de systems/arena.js.

/** El estado del duelo, en JSON. Es lo que lee el fixture para ver el ciclo pasar por sus fases. */
export function dbg() {
  return JSON.stringify(C ? {
    fase: C.fase, t: +C.t.toFixed(2), dur: +C.dur.toFixed(2),
    pase: C.pase, capT: +C.capT.toFixed(2), sol: +C.sol.toFixed(3),
    hp: C.hp, humo: +C.humo.toFixed(2), mudo: C.mudo,
    x: +C.x.toFixed(1), y: +C.y.toFixed(1), z: +C.z.toFixed(1), lado: C.lado,
    alto: +plane.y.toFixed(1), pz: PZ,
  } : null);
}

/** Salta A UNA FASE del ciclo sin esperarla. Es lo que permite fotografiar el sobrepaso —
 *  1,15 s en un ciclo de casi un minuto— sin volar quince veces el mismo tramo. */
export function forceFase(f) {
  if (!C) return false;
  const dur = { aviso: CAZA_AVISO_T, presion: entre(CAZA_PRES_T), sobrepaso: CAZA_OVER_T,
    ventana: CAZA_WINDOW, recola: CAZA_RECOLA_T, salida: CAZA_SALIDA_T }[f];
  if (dur === undefined) return false;
  ir(f, dur);
  return true;
}
