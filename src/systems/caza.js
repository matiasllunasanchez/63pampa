// LA COLA: los Harriers que te toman la cola durante el PASILLO.
//
// Plan y porque: docs/sistemas/PLAN_HARRIERS_PERSECUCION.md, PLAN A (§3). El §1 es el analisis de
// la dinamica de After Burner — de ahi sale cada regla de abajo — y el §2 la verdad historica que
// la sostiene. El §6 dice lo que NO se hace, y conviene tenerlo a mano al tocar esto.
//
// EL HARRIER TE TIRA EL SIDEWINDER (30/9/2026, pedido del autor). Hasta aca la regla era "no te
// puede pegar": desde la cola tiraba rafagas que cruzaban lejos, sin codigo de impacto — el aviso
// era el contenido. Eso se fue. Ahora cada Harrier lleva DOS AIM-9L (la carga real del FRS.1,
// AIM9.POR_HARRIER) y te los tira desde la cola, de a uno, cuando asoma.
//
// EL MISIL SE VE Y SE ESQUIVA — que es la leccion de la vez anterior que tuvo dientes: sus rafagas
// te mataban desde lejos en el acercamiento, sin haber llegado a ver el avion, y por eso se le
// sacaron. El Sidewinder es lo contrario: sale del avion que acabas de ver asomar, se te pone en la
// cola DE A POCO, y tiene una sola salida que el jugador controla —una MANIOBRA hecha cuando ya
// esta cerca, que lo hace seguir de largo—. La regla y los numeros viven en core/aim9.js; el misil
// vive con los demas misiles (collision.js lo mueve y lo resuelve). Este archivo solo lo LANZA.
//
// El duelo sigue sin poder matarte POR SI MISMO: `cazaSystem` no devuelve muerte. Te mata su misil,
// y el misil entra por el embudo de todos los misiles.
//
// No hay lock-on, no hay tono, no hay recuadro de fijado (§6.1): los A-4 no tenian nada. Los ojos
// y la radio, y a veces ni la radio — el duelo mudo tampoco avisa el misil.
//
// EL CICLO, que es todo el sistema:
//
//     aviso ──> presion ──> sobrepaso ──> ventana ──> recola ──> presion (INFINITO hasta eliminarlo)
//                                                          └──> cayendo (si lo bajaste)
//
//   aviso      LA ENTRADA. Es EL AVION el que avisa: aparece chiquito en el horizonte, viene de
//              frente creciendo y te cruza. Termina cuando te paso — no cuando suena un reloj.
//   presion    LOS TRES AMAGUES. Ya esta en tu cola. Asoma despacio por un costado, se esconde,
//              vuelve (y a partir del segundo te tira un Sidewinder), se esconde, y a la TERCERA
//              se compromete. Es el corazon del ritmo y la razon de que exista: ver mas abajo.
//   sobrepaso  el que estaba atras NO se queda atras — te pasa ENORME por un costado y queda
//              adelante. Es la moneda del juego (§1: "el cruce cercano ES el juego").
//   ventana    unos segundos ADELANTE TUYO Y DE COLA, esquivandose: es tu turno de tirarle (H3).
//   recola     desperdiciada la ventana, se hace chiquito hasta el horizonte y vuelve a empezar.
//   cayendo    lo bajaste y todavia no toco el suelo (ver "COMO CAEN").
//
// POR QUE TRES AMAGUES, que es la decision de diseño de todo esto:
//
// Un avion que se te pega y te pasa sin previo aviso no se puede CONTESTAR. No hay nada que
// hacer con el, solo esperar a que ocurra. Tres asomadas legibles convierten la cola en algo que
// el jugador MIRA y ANTICIPA: sabe que hay una tercera, y sabe cuando viene.
//
// Y es el gancho del que va a colgar la maniobra que todavia no existe — la combinacion que te
// deja sacarte de encima al que tenes atras de un golpe. Ese movimiento necesita un BLANCO y un
// MOMENTO, y los amagues son las dos cosas. Por eso `asoma` sale en el snapshot y hay un
// `asomando()` exportado: el dia que la maniobra se escriba, no hay que tocar este archivo.
//
// DE QUE LADO SE LO VE. Una sola regla, y de ella sale el sprite (`deFrente` en el snapshot):
// se lo ve DE FRENTE mientras viene hacia vos (aviso y presion) y DE COLA desde el instante en que
// te pasa hasta que se pierde en el horizonte (sobrepaso, ventana, recola, salida). Nunca al reves.
//
// MULTIPLES HARRIERS SIMULTANEOS. El director sigue sumando Harriers hasta CAZA_DIR_MAX. Cada uno
// cicla independientemente hasta que lo ahuyentes o lo derriben — si no los eliminas, se acumulan
// como moscas. Es la presion dramatica de la cola: el pasillo se llena si no te defendes.

import { plane, cfg, stats } from '../core/state.js';
import { run } from '../core/run.js';
import { hablar } from '../core/voz.js';
import { bullets, missiles } from '../core/world.js';
// EL SIDEWINDER: la cuenta de su vuelo es pura y vive aparte (la usa tambien el caza de frente).
import { lanzarCola } from '../core/aim9.js';
import { popup, proj, chispazo, explodeAt } from '../core/fx.js';
import { T } from '../core/i18n.js';
import { P } from '../data/palette.js';
import { W, PZ } from '../render/ctx.js';
import {
  CAZA_SOL_T, CAZA_PASSES, CAZA_CAP_T, CAZA_WINDOW, CAZA_RAS_ALT, CAZA_HP, CAZA_KILLABLE,
  CAZA_PRES_T, CAZA_AVISO_T, CAZA_OVER_T, CAZA_RECOLA_T, CAZA_SALIDA_T,
  CAZA_Z_COLA, CAZA_Z_FRENTE, CAZA_Z_LEJOS, CAZA_X_COLA, CAZA_Y_ENTRA,
  CAZA_V_MERGE, CAZA_V_FUGA, CAZA_V_FUGA_MIN,
  CAZA_AMAGUES, CAZA_AMAGUE_T, CAZA_AMAGUE_GAP, CAZA_AMAGUE_TIRA,
  CAZA_Z_ASOMA, CAZA_X_ASOMA, CAZA_X_ESCONDE,
  AIM9, ADEN,
  CAZA_FINALES, CAZA_CAIDA_G, CAZA_CAIDA_MAX,
  CAZA_SOL_AVISO, CAZA_SOL_POST,
  CAZA_HIT_RX, CAZA_HIT_RY, CAZA_PTS, CAZA_MV_FUERZA,
  CAZA_DIR_D0, CAZA_DIR_FIN, CAZA_DIR_INIT, CAZA_DIR_GAP, CAZA_DIR_MAX, CAZA_DIR_JETS, CAZA_MUDO_P,
  CAZA_SOBRE_TERRENO, ZZ_PARED_TALUD, ZZ_PARED_LIBRE,
} from '../data/tuning.js';
import { beep, boom, duck, sfxOne } from './audio.js';
import { pilotName } from './squad.js';
// EL TERRENO, con las MISMAS funciones que resuelven la colision del jugador: si el enemigo
// tuviera su propia idea de donde esta la roca habria dos verdades (ver `pisoTerreno`).
import { enPared, paredH } from '../core/zigzag.js';
import { tierraH, hayRelieve } from '../core/tierra.js';
import { alMando } from '../core/squad.js';

// ---- estado privado ----
// FLOTA DE HARRIERS. Cada elemento es un Harrier independiente que cicla hasta eliminarse.
// `C` es un cursor que apunta al Harrier en proceso durante cazaSystem — las funciones de paso
// (stepSolucion, stepPos, etc.) leen y escriben el cursor sin saber que hay una lista detras.
let fleet = [];
let C = null;

/** Sorteo en un rango [lo, hi]. Se llama al ENTRAR a una fase, nunca por cuadro. */
const entre = ([lo, hi]) => lo + Math.random() * (hi - lo);

// MEDIA ENVERGADURA del Harrier, en unidades de mundo — de donde salen los dos hilos de estela.
// Sale de medir la hoja `jet_rear` (10,5 unidades de ancho util) y descontar lo que el extremo del
// ala se mete para adentro del borde del frame. Vive ACA y no se importa del render: un sistema no
// mira el dibujo (convencion 2). Si algun dia se rehornea el sprite con otra envergadura, este
// numero se toca a mano y a proposito.
const CAZA_SEMI = 4.6;

const miIndicativo = () => pilotName(alMando(run));

/** ¿Hay al menos un Harrier corriendo? */
export function active() { return fleet.length > 0; }

/** ARMA UN HARRIER. Lo agrega a la flota — pueden haber varios simultaneos.
 *  `opts.mudo` entra sin aviso por radio. `opts.manso` NO TIRA SIDEWINDER: es el duelo sin
 *  dientes con el que el fixture mide la COREOGRAFIA (secciones 1-8 de `npm run caza`), y vuelve a
 *  significar lo que decia su nombre desde que el Harrier volvio a tirar (30/9). En el juego
 *  normal nunca es manso: lo arma el director. */
export function start(opts = {}) {
  const h = {
    fase: 'aviso',
    t: 0,
    dur: CAZA_AVISO_T,
    capT: 0,
    pase: 0,
    mudo: !!opts.mudo,
    manso: !!opts.manso,
    sol: 0,
    px: plane.x, py: plane.y,
    grito: false,
    mvPrev: null,
    hp: 0,
    humo: 0,
    // ENTRA POR EL HORIZONTE, de frente. No aparece pegado a la cola de la nada: el primer ciclo
    // se ve igual que todos los demas (ver "DE QUE LADO SE LO VE" arriba).
    //
    // DOS POSICIONES, no una. `bx`/`by` son la TRAYECTORIA (lo que la fase manda) y `x`/`y` son
    // donde el avion esta DE VERDAD este cuadro: trayectoria + bandeo. Mezclarlas hacia que el
    // bandeo se lerpeara contra si mismo y quedaba un temblor sucio en vez de un avion volando.
    // NACE POR DEBAJO: sube a tu altura mientras se acerca (ver la fase 'aviso')
    bx: plane.x, by: Math.max(0.8, plane.y - CAZA_Y_ENTRA),
    x: plane.x, y: Math.max(0.8, plane.y - CAZA_Y_ENTRA), z: CAZA_Z_LEJOS,
    lado: opts.lado || (Math.random() < 0.5 ? -1 : 1),
    seed: Math.random() * 6.283,   // desfase propio: dos Harriers de la flota no bandean igual
    bank: 0, xPrev: plane.x,
    fx: [],
    humoT: 0, estT: 0, tiroT: 0,
    // LA RAFAGA (ADEN): `gunT` el reloj de la asomada, `gunHecho` si ya tiro en esta, `rafaga` la que
    // esta en curso ({ tx, ty, t, n }: el punto fijado, el reloj y cuantos tiros salieron)
    gunT: 0, gunHecho: false, rafaga: null,
    // LOS SIDEWINDER que le quedan y el que tiene en el aire. Nunca dos a la vez: el segundo sale
    // recien cuando el primero se resolvio (te pego, o lo perdiste de una maniobra).
    aim9: AIM9.POR_HARRIER, misil: null, libreT: 0, tiroHace: 99,
    // LOS AMAGUES. `amague` cuenta las asomadas hechas, `asoma` dice si esta afuera AHORA y
    // `asomaK` es cuanto (0..1, suavizado) — de ese numero salen la posicion y la visibilidad.
    amague: 0, asoma: false, asomaK: 0, amT: entre(CAZA_AMAGUE_GAP),
    // COMO VA A CAER, sorteado ACA y no al morir: asi el final es del avion y no del momento, y
    // una sonda puede fijarlo antes de matarlo para fotografiar los tres.
    final: CAZA_FINALES[(Math.random() * CAZA_FINALES.length) | 0],
    vyC: 0, vzC: 0,   // velocidad de la caida (ver stepCaida)
    muerto: false,
  };
  // EL SEGUNDO DE LA PATRULLA entra un poco mas atras: se los ve llegar de a uno, no encimados
  if (opts.atras) h.z += opts.atras;
  fleet.push(h);
  if (!h.mudo) hablar('PUMA', T('caza_warn', { c: miIndicativo() }));   // lo grita Puma (28/9)
  // EL QUE YA TE PASO DE FRENTE Y QUEDO VIVO (pedido del autor 1/10: "si un Harrier viene de frente
  // y no lo mato, queda yendo y viniendo"): no entra por el horizonte — ya esta atras tuyo. Va
  // directo a la cola, escondido, y empieza sus amagues como cualquiera.
  if (opts.dePaso) {
    const prev = C; C = h;
    h.z = CAZA_Z_COLA; h.bx = h.x = plane.x + h.lado * CAZA_X_ESCONDE; h.by = h.y = plane.y;
    irPresion();
    C = prev;
  }
  return true;
}

/** Corta TODO y olvida lo que el director llevaba contado — los Sidewinder que el duelo tenia en
 *  el aire incluidos: son del duelo, y un misil sin el Harrier que lo tiro seguiria viniendo a
 *  pegarle a una corrida que ya no tiene nada que ver con el. Se sacan con splice: `missiles` es un
 *  store compartido y se muta, no se reasigna. */
export function resetCaza() {
  fleet.length = 0; C = null; D = null;
  for (let i = missiles.length - 1; i >= 0; i--) if ((missiles[i].tipo === 'aim9' && missiles[i].modo === 'cola') || missiles[i].tipo === 'aden') missiles.splice(i, 1);
}

// ---------------- H4: EL REGLAMENTO (cuando aparece) ----------------
let D = null;

export function cazaDirector(dt, o) {
  if (!D) D = { hechos: 0, prox: entre(CAZA_DIR_INIT) };
  const int = Math.max(0, Math.min(2, o.intensidad | 0));
  if (!int) { if (D) D.jets = o.jets; return; }
  // LA PATRULLA (pedido del autor 1/10): los Harrier volaban de a DOS, asi que el duelo es de a dos;
  // y con el radar encima (`o.refuerzo`: las estrellas de busqueda) pueden juntarse mas. `tope` es
  // cuantos puede haber en tu cola a la vez.
  const tope = Math.min(CAZA_DIR_MAX, 2 + Math.max(0, o.refuerzo | 0));
  // EL QUE PASO DE FRENTE Y NO BAJASTE se queda: da la vuelta y se suma a la cola (hasta el tope).
  // `o.jets` cuenta los que te cruzaron vivos (collision.js); cada uno nuevo es uno que se queda.
  if (D.jets === undefined) D.jets = o.jets;
  if (o.jets > D.jets) {
    D.jets = o.jets;
    if (fleet.length && fleet.length < tope && !o.ciego && !(o.meta && o.meta - o.dist < CAZA_DIR_FIN))
      start({ mudo: true, dePaso: true, lado: -fleet[fleet.length - 1].lado });
  }
  if (D.prox > 0) D.prox -= dt * (0.5 + int * 0.75);
  if (fleet.length >= tope || D.prox > 0) return;
  if (o.dist < CAZA_DIR_D0) return;
  if (o.jets < CAZA_DIR_JETS) return;
  if (o.meta && o.meta - o.dist < CAZA_DIR_FIN) return;
  if (o.ciego) return;
  if (o.meta && D.hechos >= int) return;
  D.hechos++;
  D.prox = entre(CAZA_DIR_GAP);
  // EL DUELO MUDO YA EXISTIA como sorteo (`CAZA_MUDO_P`: a mas intensidad, mas chance de que
  // nadie te avise). `o.voces === false` no agrega una mecanica nueva — CLAVA esa moneda en cruz.
  // Es lo que hace que el silencio de radio de una fase (PLAN_MISION_CINCO_FASES §11.2) alcance
  // tambien a LA COLA sin que este archivo tenga que saber que es una fase: le llega un valor ya
  // resuelto en el mismo paquete que la intensidad, igual que `ciego` o `jets`.
  const mudo = o.voces === false || Math.random() < CAZA_MUDO_P[int];
  const lado = Math.random() < 0.5 ? -1 : 1;
  start({ mudo, lado });
  // …y su numeral, por el otro lado y un poco mas atras (callado: el aviso ya lo dio el primero)
  if (fleet.length < tope) start({ mudo: true, lado: -lado, atras: 70 });
}

/** Pasa a la fase `f` con su duracion. */
function ir(f, dur) { C.fase = f; C.t = 0; C.dur = dur; }

function stepSolucion(dt) {
  const quiebre = Math.abs(plane.x - C.px) + Math.abs(plane.y - C.py) * 0.7;
  C.px = plane.x; C.py = plane.y;
  const q = quiebre / Math.max(dt, 1e-4);
  if (q > 9) {
    C.sol = Math.max(0, C.sol - dt * Math.min(6, q / 9) / (CAZA_SOL_T * 0.5));
    if (C.sol < CAZA_SOL_AVISO) C.grito = false;
    return;
  }
  const ras = plane.y <= CAZA_RAS_ALT ? 0.12 : 1;
  C.sol = Math.min(1, C.sol + (dt / CAZA_SOL_T) * ras);

  if (C.fase !== 'presion' && C.fase !== 'aviso') return;
  // EL "¡QUEBRA!" YA NO SALE DE ACA (30/9). Lo gritaba la solucion madura aunque no viniera nada,
  // y con el Sidewinder esa palabra pasa a querer decir "HACE LA MANIOBRA YA": gritarla sin misil
  // le haria gastar al jugador la pirueta —y su enfriamiento de 1,15 s— contra el aire, justo
  // antes de necesitarla. Ahora la grita el MISIL, al entrar en la zona donde quebrar lo pierde
  // (collision.js, con el texto que se le deja armado en `lanzarAim9`).
  if (C.sol >= CAZA_SOL_AVISO && !C.grito) C.grito = true;
  if (C.sol >= 1) { C.sol = CAZA_SOL_POST; C.grito = false; }
}

/** ¿Tiene un Sidewinder suyo todavia persiguiendote? Lo que no esta mas en `missiles` (lo limpio
 *  un relevo, una sonda) o ya se resolvio (te pego, o lo perdiste) no cuenta. */
const misilVivo = () => !!C.misil && C.misil.fase === 'guia' && missiles.indexOf(C.misil) >= 0;

/** DE DONDE SALE: el pilon INTERIOR del ala, la mitad que mira hacia vos. Asomado, el Harrier
 *  muestra medio avion por el borde (ver CAZA_X_ASOMA) y su centro puede quedar fuera de cuadro;
 *  el ala de adentro es la parte que SE VE. */
const pilon = () => ({ x: C.x - C.lado * CAZA_SEMI * 0.55, y: C.y - 0.4, z: C.z });

/** ¿El pilon esta EN PANTALLA? Medido en el juego: a los 0,25 s de empezar a asomar el Harrier
 *  todavia viene deslizandose desde afuera (su centro en -246 px) y el misil nacia fuera de cuadro:
 *  aparecia de la nada un segundo despues. El reloj del disparo corre solo mientras esto es cierto. */
function pilonAVista() {
  const p = pilon(), s = proj(p.x, p.y, p.z);
  return s.x > 10 && s.x < W - 10;
}

/** EL SIDEWINDER. Sale del Harrier ASOMADO —de donde esta el avion que acabas de ver— y se te
 *  pone en la cola de a poco (core/aim9.js). Se tira solo asomado por lo mismo que antes se tiraba
 *  asi la rafaga: lo que aparece es EL, ahi, ahora; un misil que naciera de un Harrier escondido
 *  fuera de cuadro seria una emboscada.
 *
 *  Uno por vez y dos por avion (AIM9.POR_HARRIER): "un misil, o maximo dos por Harrier". */
function lanzarAim9() {
  // EN PATRULLA (dos o mas en la cola) no espera a que su primer misil se resuelva: con
  // AIM9.PATRULLA_GAP entre uno y otro alcanza, y es lo que junta varios en el aire a la vez
  const patrulla = fleet.length >= 2;
  const enAire = missiles.filter(m => m.tipo === 'aim9' && m.modo === 'cola' && m.fase === 'guia');
  if (C.manso || C.aim9 <= 0) return;
  if (patrulla ? (C.tiroHace < AIM9.PATRULLA_GAP || enAire.length >= AIM9.ZONAS.length) : misilVivo()) return;
  // EL RESPIRO entre el primero y el segundo: medido en el juego, sin esto el segundo salia 0,4 s
  // despues de perder el primero —en la asomada siguiente— y le pisaba al jugador el "¡se fue de
  // largo!" justo cuando se lo ganaba. Con el respiro, el segundo llega en la pasada que sigue.
  if (!patrulla && C.aim9 < AIM9.POR_HARRIER && C.libreT < AIM9.COLA_RESPIRO) return;
  C.aim9--; C.tiroHace = 0;
  const p = pilon();
  // LA ZONA por la que se acerca: con otro misil ya en el aire (o siendo patrulla), cada uno toma la
  // primera libre de AIM9.ZONAS — un ala, la otra, arriba, abajo — y cierra hacia el centro. El
  // misil solitario de siempre no lleva zona: viene derecho desde el pilon.
  let zona = null;
  if (patrulla || enAire.length) {
    const usadas = enAire.map(m => m.zonaI);
    let i = AIM9.ZONAS.findIndex((_, k) => !usadas.includes(k));
    if (i < 0) i = enAire.length % AIM9.ZONAS.length;
    zona = { x: AIM9.ZONAS[i][0], y: AIM9.ZONAS[i][1], i };
  }
  const m = lanzarCola(p, { x: plane.x, y: plane.y, vx: plane.vx, vy: plane.vy || 0, pz: PZ }, AIM9, zona);
  if (zona) m.zonaI = zona.i;
  // LA VOZ DEL AVISO, armada ACA: el que sabe si el duelo es mudo es este archivo, y el que sabe
  // cuando el misil entra en la zona es collision.js. Se le deja el texto hecho y alla solo se dice.
  // El duelo MUDO no avisa ni el disparo ni el quiebre: en ese hay que mirar el misil.
  if (!C.mudo) {
    m.rompe = T('caza_break', { c: miIndicativo() });
    hablar('PUMA', T('aim9_tira', { c: miIndicativo() }));
  }
  missiles.push(m);
  C.misil = m;
  // EL FOGONAZO DEL MOTOR al encenderse bajo el ala: lo primero que se ve del misil
  C.fx.push({ k: 'humo', x: p.x, y: p.y, z: p.z, life: 0.7, r: 1.6 });
  beep(220, 0.32, 'sawtooth', 0.05, 900);   // el siseo del motor cohete
  // en patrulla, el segundo sale en esta misma asomada, PATRULLA_GAP despues
  if (patrulla && C.aim9 > 0) C.tiroT = AIM9.PATRULLA_GAP;
}

/** LA RAFAGA DEL HARRIER (pedido del autor 1/10): FIJA el punto donde estas ahora y lo marca. Los
 *  tiros salen despues (`stepRafaga`), todos a ese punto: no te siguen. Moverse en el aviso salva. */
function armarRafaga() {
  C.gunHecho = true;
  C.rafaga = { tx: plane.x, ty: plane.y, t: 0, n: 0 };
  beep(980, 0.06, 'square', 0.04);   // el clic del aviso: te fijo
}

/** Un cuadro de la rafaga en curso: pasado el AVISO, un tiro cada GAP al punto fijado. Los tiros
 *  viven con los demas misiles (tipo 'aden'); collision.js los mueve y decide si te pegaron. */
function stepRafaga(dt) {
  const r = C.rafaga;
  if (!r) return;
  r.t += dt;
  if (r.n < ADEN.N && r.t >= ADEN.AVISO + r.n * ADEN.GAP) {
    r.n++;
    const x0 = C.x, y0 = C.y - 0.3, z0 = C.z;
    missiles.push({ tipo: 'aden', x0, y0, z0, x: x0, y: y0, z: z0, tx: r.tx, ty: r.ty, t: 0, done: false });
    C.fx.push({ k: 'humo', x: x0, y: y0, z: z0, life: 0.25, r: 0.6 });
    beep(160, 0.07, 'square', 0.06, 90);   // el golpe seco del 30 mm
  }
  if (r.n >= ADEN.N) C.rafaga = null;
}

/** EL PUNTO FIJADO de las rafagas en AVISO, para el dibujo: { x, y, u } (u = 0..1 del aviso). */
export const avisosAden = () => fleet.filter(h => h.rafaga && h.rafaga.n === 0)
  .map(h => ({ x: h.rafaga.tx, y: h.rafaga.ty, u: Math.min(1, h.rafaga.t / ADEN.AVISO) }));

// EL FX DEL HARRIER: humo y estela. Queda todo en el aire y se lo lleva el mundo a `run.spd`.
function stepFx(dt) {
  for (const f of C.fx) {
    f.life -= dt; f.z -= run.spd * dt;
  }
  let n = 0;
  for (let i = 0; i < C.fx.length; i++) {
    const f = C.fx[i];
    if (f.life > 0 && f.z < CAZA_Z_LEJOS + 30 && f.z > 1) C.fx[n++] = f;
  }
  C.fx.length = n;
  // LA ESTELA SALE DE LAS PUNTAS DE ALA. Son DOS hilos, no uno: el vortice del extremo del ala es
  // lo que de verdad deja una linea blanca detras de un avion, y sale de ahi y de ningun otro
  // lado. La tobera tiene su llama y se queda en la tobera (render/caza.js).
  //
  // Que sean dos es la mitad del valor: con el alabeo una punta sube y la otra baja, asi que los
  // hilos se cruzan y se abren solos. Un hilo unico al centro no dice nada de como esta virando.
  //
  // Y SE QUEDAN EN EL MUNDO — por eso se les resta `run.spd` como a cualquier cosa del pasillo, y
  // por eso despues los atravesas.
  C.estT -= dt;
  if (C.estT <= 0) {
    C.estT = 0.045;
    const ang = C.bank * 0.95;
    const ca = Math.cos(ang) * CAZA_SEMI, sa = Math.sin(ang) * CAZA_SEMI;
    for (const s of [-1, 1]) C.fx.push({
      k: 'estela', x: C.x + s * ca, y: C.y - s * sa, z: C.z,
      vida0: 0.8, life: 0.8, r: 0.2 + Math.random() * 0.12,
    });
  }
  if (C.humo) {
    C.humoT -= dt;
    if (C.humoT <= 0) {
      C.humoT = 0.05;
      C.fx.push({ k: 'humo', x: C.x + (Math.random() - 0.5) * 1.2, y: C.y + (Math.random() - 0.5) * 1.2,
        z: C.z, life: 1.4 + Math.random() * 0.8, r: 0.8 + Math.random() * 1.2 });
    }
  }
}

/** LOS TRES AMAGUES — el ritmo de la cola, y la razon de que exista (ver el encabezado).
 *
 *  Alterna escondido / asomado, y a la tercera asomada completa deja de amagar: `avanzar` ve el
 *  contador lleno y lo manda al sobrepaso. `asomaK` es el estado suavizado — entrar y salir de
 *  cuadro tardan medio segundo cada uno, y eso es lo que hace que la asomada se LEA como una
 *  maniobra en vez de un parpadeo. LENTO es el pedido: hay que poder verlo llegar.
 *
 *  Desde el segundo amague ademas te tira un SIDEWINDER (ver `lanzarAim9`). Sale cuando el ala
 *  lleva 0,25 s EN PANTALLA, y no en el cuadro en que asoma: primero se lo ve, despues dispara. Al
 *  reves seria una emboscada con luces. Uno por asomada como mucho, y el humo (ahuyentado) no tira. */
function stepAmague(dt) {
  const meta = C.asoma ? 1 : 0;
  C.asomaK += (meta - C.asomaK) * Math.min(1, dt * 3.2);
  if (C.asoma && C.amague + 1 >= CAZA_AMAGUE_TIRA && !C.humo && C.tiroT > 0 && pilonAVista()) {
    C.tiroT -= dt;
    if (C.tiroT <= 0) lanzarAim9();
  }
  // LA RAFAGA: en las asomadas que no son del Sidewinder (ver ADEN en data/tuning.js)
  const tocaAim9 = C.amague + 1 >= CAZA_AMAGUE_TIRA && C.aim9 > 0 && !misilVivo();
  if (C.asoma && !C.humo && !C.manso && !C.gunHecho && !C.rafaga && !tocaAim9 && pilonAVista()) {
    C.gunT -= dt;
    if (C.gunT <= 0) armarRafaga();
  }
  C.amT -= dt;
  if (C.amT > 0) return;
  if (C.asoma) { C.asoma = false; C.amague++; C.amT = entre(CAZA_AMAGUE_GAP); }
  else { C.asoma = true; C.amT = entre(CAZA_AMAGUE_T); C.tiroT = 0.25; C.gunT = ADEN.ESPERA; C.gunHecho = false; }
}

/** Entra a PRESION y rearma el ciclo de amagues. Se llama desde la entrada, desde la recola y
 *  desde la sonda de fases: tres lugares que si no comparten esto se desincronizan. */
function irPresion() {
  ir('presion', 0);   // dur 0 = `avanzar` opina todos los cuadros; el corte lo dan los amagues
  C.amague = 0; C.asoma = false; C.asomaK = 0;
  C.amT = entre(CAZA_AMAGUE_GAP);
  C.presMax = entre(CAZA_PRES_T) * 1.8;   // techo de seguridad, por si un amague queda trabado
}

function golpeDelPase() {
  beep(760, 0.55, 'sawtooth', 0.1, 190);
  boom(0.1, true);
  duck(0.35);
  run.shake = Math.min(8, run.shake + 5);
  for (let i = 0; i < 14; i++) C.fx.push({
    k: 'estela',
    x: plane.x + C.lado * (4 + i * 1.1), y: plane.y + 2.5 + (Math.random() - 0.5) * 1.5,
    z: CAZA_Z_COLA + i * 3.5, life: 0.8 + Math.random() * 0.5, r: 0.5 + Math.random(),
  });
}

// ---------------- H3: EL CONTRAATAQUE ----------------

function stepTiro() {
  if (C.fase === 'cayendo') return;   // ya esta muerto: no se le cobra dos veces el derribo
  if (C.z <= PZ + 6) return;
  for (const b of bullets) {
    if (b.z >= 999) continue;
    if (Math.abs(b.z - C.z) > 6) continue;
    if (Math.abs(b.x - C.x) > CAZA_HIT_RX || Math.abs(b.y - C.y) > CAZA_HIT_RY) continue;
    b.z = 999; C.hp++; stats.hits++;
    chispazo(C.x, C.y, C.z, 'metal');
    beep(300, 0.05, 'triangle', 0.05);
    if (CAZA_KILLABLE && C.hp >= CAZA_HP.derribo) { derribar(); return; }
    if (C.hp >= CAZA_HP.ahuyenta && !C.humo) { ahuyentar(); return; }
  }
}

function ahuyentar() {
  C.humo = 1;
  ir('salida', CAZA_SALIDA_T * 1.6);
  run.score += CAZA_PTS.ahuyenta;
  const s = proj(C.x, C.y, C.z);
  popup(s.x, s.y - 10, '+' + CAZA_PTS.ahuyenta, P.foam);
  hablar('PUMA', T('caza_hit'));
  sfxOne('exSmall');
}

/** LO BAJASTE. El premio se cobra ACA y no cuando toca el suelo: el jugador tiene que saber que
 *  lo bajo en el instante en que lo baja. Lo que cambia entre un Harrier y otro es lo que se VE
 *  despues, y ese sorteo ya venia hecho desde `start` (ver CAZA_FINALES).
 *
 *  Que no siempre termine igual es el punto. Un desenlace unico se vuelve una animacion que el
 *  jugador deja de mirar a la tercera vez; tres hacen que derribar uno siga siendo un evento —
 *  la primera vez que uno se va girando hasta el agua en vez de reventar, se cuenta. */
function derribar() {
  run.score += CAZA_PTS.derribo;
  const s = proj(C.x, C.y, C.z);
  popup(s.x, s.y - 10, '+' + CAZA_PTS.derribo, P.warn, true);
  hablar('PUMA', T('caza_kill'));
  stats.air++;
  if (C.final === 'bola') {
    // REVIENTA EN EL AIRE, ahi mismo. No queda nada que seguir: se termina en este cuadro.
    explodeAt(C.x, C.y, C.z, true);
    sfxOne('exHeavy');
    C.muerto = true;
    return;
  }
  // LOS OTROS DOS SE VAN CAYENDO. `pedazos` se ABRE en el aire (reventon grande pero sin bola de
  // fuego: lo que sale es chatarra) y baja rapido y sucio; `caida` solo se apaga — un chispazo, se
  // le va el morro y baja girando entero. Por eso arranca con vyC positivo: todavia trepa un
  // instante por inercia antes de que la gravedad gane, que es lo que lo hace ver PESADO.
  const roto = C.final === 'pedazos';
  explodeAt(C.x, C.y, C.z, roto, true);
  sfxOne(roto ? 'exHeavy' : 'exSmall');
  C.humo = 1;
  C.vyC = roto ? -5 : 3;
  C.vzC = roto ? 40 : 95;
  ir('cayendo', CAZA_CAIDA_MAX);
}

// EL BANDEO: lo que lo hace parecer un avion y no una calcomania que cambia de tamaño.
//
// Se suma A LA TRAYECTORIA, en metros de mundo, y la amplitud CRECE CON LA DISTANCIA. Esto ultimo
// no es un capricho: el tamaño en pantalla va con 1/z, asi que un bandeo de amplitud fija se
// achica junto con el avion y a 300 m no se ve mover un pixel — que es exactamente por lo que la
// entrada parecia una foto alejandose. Escalando con z, lo que queda parejo es el movimiento
// ANGULAR, que es lo que el ojo lee como "ese avion esta volando".
//
// El 0.35 de piso es la otra mitad de la cuenta. El desplazamiento EN PANTALLA es amplitud x k, y
// k va con 1/z: con `esc = 1 + z/120` el bandeo terminaba siendo dieciseis veces mas grande pegado
// a la cola (z 6) que en el horizonte (z 320) — un avion quieto lejos y epileptico cerca. Con
// 0.35 + z/110 la relacion baja a dos, que es lo que corresponde: de cerca se mueve algo mas,
// como pasa de verdad, pero es el mismo avion volando igual.
function bandeo() {
  const s = C.seed, esc = 0.35 + C.z / 110;
  return {
    x: (Math.sin(run.t * 1.7 + s) * 2.2 + Math.sin(run.t * 2.9 + s * 0.5) * 0.8) * esc,
    y: (Math.sin(run.t * 1.15 + s * 2.3) * 1.3 + Math.sin(run.t * 0.63 + s * 1.7) * 0.9) * esc,
  };
}

// LA FUGA, cuando se va ADELANTE tuyo. Aca la velocidad se RESTA y no se suma: vuela en tu mismo
// sentido, asi que lo que se aleja es la diferencia. La consecuencia es la que el jugador espera —
// si lo perseguis con el turbo puesto se aleja mas despacio y le podes tirar mas tiempo— y el piso
// esta para que a fondo no se congele: sin el, con turbo pleno la diferencia daba cero y el
// Harrier se quedaba flotando adelante para siempre.
const fuga = () => Math.max(CAZA_V_FUGA_MIN, CAZA_V_FUGA - run.spd);

/** LA CAIDA. El avion ya esta muerto: aca no se le tira, no se le mide y no decide nada — baja.
 *
 *  Baja con gravedad Y PIERDE VELOCIDAD, asi que ademas de hundirse se va quedando atras: lo pasas
 *  de largo mientras cae. Eso es lo que lo vuelve tuyo y no una animacion en un rincon.
 *
 *  El tumbo sale de sacudir `bank`, no de rotar el sprite. La hoja tiene cinco poses de alabeo y
 *  alternarlas rapido se lee como un avion sin control; rotar un raster chico unos grados a esta
 *  resolucion le ensucia los bordes (la misma leccion que ya esta escrita en render/plane.js). */
function stepCaida(dt) {
  C.vyC -= CAZA_CAIDA_G * dt;
  C.by += C.vyC * dt;
  C.vzC = Math.max(0, C.vzC - 55 * dt);
  C.z += (C.vzC - run.spd) * dt;
  C.bx += C.lado * 5 * dt;                       // se va abriendo: nadie cae en linea recta
  const roto = C.final === 'pedazos';
  C.bank = Math.sin(C.t * (roto ? 13 : 7) + C.seed) * (roto ? 1 : 0.8);
  C.x = C.bx; C.y = C.by;
  if (C.by <= 0.4) {
    // TOCO. Revienta DONDE TOCO y no en el aire — es la mitad del valor de haberlo dejado caer.
    explodeAt(C.bx, 0.6, C.z, true);
    sfxOne('exHeavy');
    run.shake = Math.min(9, run.shake + 4);
    C.muerto = true;
    return;
  }
  // se fue del cuadro por atras, o se acabo el tope: el pasillo se lo traga sin ceremonia
  if (C.z < 1.5 || C.t > CAZA_CAIDA_MAX) C.muerto = true;
}

/** LA ALTURA MINIMA A LA QUE PUEDE VOLAR EL HARRIER en (x, su profundidad), en unidades de mundo.
 *
 *  Son tres pisos y manda el mas alto: el nivel del mar de siempre, la LADERA del callejon si el
 *  avion esta metido en su huella, y el RELIEVE de tierra/costa. El margen sobre la cresta es el
 *  mismo `ZZ_PARED_LIBRE` con el que el jugador la puede saltar: si al Harrier le alcanzara con
 *  menos, estaria pasando por donde a vos te matan. */
function pisoTerreno(x, y) {
  const wz = run.dist + C.z;
  let piso = 0.8;
  // LA LADERA. `enPared` contesta si ESTA cota esta adentro de la roca; si lo esta, el piso pasa a
  // ser la cresta con el mismo margen que el juego le exige al jugador para saltarla.
  if (enPared(x, y, wz, ZZ_PARED_TALUD, ZZ_PARED_LIBRE)) {
    const h = paredH(wz, x >= 0 ? 1 : -1);
    if (h > 0) piso = Math.max(piso, h * ZZ_PARED_LIBRE + CAZA_SOBRE_TERRENO);
  }
  // EL RELIEVE de TIERRA y COSTA, que es el otro suelo que el juego tiene.
  if (hayRelieve(cfg)) piso = Math.max(piso, tierraH(x, wz) + CAZA_SOBRE_TERRENO);
  return piso;
}

function stepPos(dt) {
  const f = C.dur > 0 ? Math.min(1, C.t / C.dur) : 1;
  const lerp = (a, b, k) => a + (b - a) * Math.min(1, k * dt);
  if (C.fase === 'cayendo') { stepCaida(dt); return; }
  if (C.fase === 'presion') {
    // EN LA COLA, ASOMANDO. `asomaK` mueve el carril: escondido esta fuera de cuadro (X_ESCONDE,
    // ~413 px del centro) y afuera entra por el borde (X_ASOMA, ~193 px), asi que la asomada es
    // literalmente un avion metiendose en el cuadro por un costado. La z acompaña — asomar es
    // tambien acercarse un poco, y eso hace que crezca mientras entra.
    const k = C.asomaK;
    C.bx = lerp(C.bx, plane.x + C.lado * (CAZA_X_ESCONDE + (CAZA_X_ASOMA - CAZA_X_ESCONDE) * k), 2.6);
    C.by = lerp(C.by, plane.y + 1.2 + k * 0.9, 1.8);
    C.z = lerp(C.z, CAZA_Z_COLA + (CAZA_Z_ASOMA - CAZA_Z_COLA) * k, 2.2);
  } else if (C.fase === 'aviso') {
    C.bx = lerp(C.bx, plane.x + C.lado * CAZA_X_COLA * (1 - C.sol), 1.6);
    // SUBE DESDE ABAJO A MEDIDA QUE SE ACERCA. La altura no se lerpea contra un objetivo fijo:
    // se interpola con CUAN CERCA esta, asi que la trepada la marca la distancia y no un reloj.
    // Asi se lo ve LLEGAR desde abajo en vez de aparecer ya puesto a tu altura y solo crecer.
    const cerca = 1 - Math.min(1, Math.max(0, (C.z - CAZA_Z_COLA) / (CAZA_Z_LEJOS - CAZA_Z_COLA)));
    C.by = lerp(C.by, Math.max(0.8, plane.y - CAZA_Y_ENTRA * (1 - cerca) + 1.5 * cerca), 1.4);
    // VIENE HACIA VOS: cierra a la suma de las dos velocidades, como cualquier cosa del pasillo
    // (collision.js hace `run.spd + 45` con los jets de frente). Antes era un lerp exponencial a
    // tasa fija, y eso tenia dos vicios: el turbo no lo hacia pasar antes —volabas mas rapido y el
    // merge duraba lo mismo, que es imposible— y sobre todo el lerp FRENA cuando llega, asi que
    // los ultimos metros, justo donde el Harrier ocupa media pantalla, los hacia al ralenti y
    // quedaba colgado ahi adelante. Con velocidad constante el tamaño crece como 1/z: chico casi
    // todo el acercamiento y un fogonazo al final, que es como pasa un avion de verdad.
    C.z = Math.max(CAZA_Z_COLA, C.z - (run.spd + CAZA_V_MERGE) * dt);
  } else if (C.fase === 'sobrepaso') {
    const e = Math.pow(f, 2.2);
    C.z = CAZA_Z_COLA + (CAZA_Z_FRENTE - CAZA_Z_COLA) * e;
    C.bx = plane.x + C.lado * (4 + CAZA_X_COLA * 0.20 * (1 - e));
    C.by = plane.y + 1.5 + 3 * e;
  } else if (C.fase === 'ventana') {
    const jink = Math.sin(run.t * 2.3 + C.lado * 3) * 0.7 + Math.sin(run.t * 3.7 + C.lado) * 0.3;
    C.z = lerp(C.z, CAZA_Z_FRENTE + Math.sin(run.t * 1.1 + C.lado) * 14, 1.2);
    C.bx = lerp(C.bx, plane.x + jink * 12, 1.4);
    C.by = lerp(C.by, plane.y + 6 + Math.sin(run.t * 1.8 + C.lado) * 4, 1.3);
  } else if (C.fase === 'recola') {
    // SE VA EN CURVA, no en linea recta hacia el punto de fuga. Antes la x no se tocaba y el
    // Harrier se achicaba clavado en el centro: la lectura era "zoom out", no "se aleja volando".
    C.z += fuga() * dt;
    C.bx = lerp(C.bx, plane.x + C.lado * 34, 0.7);
    C.by = lerp(C.by, plane.y + 4, 0.8);
  } else if (C.fase === 'salida') {
    C.z += fuga() * dt;
    C.by = lerp(C.by, plane.y + 30, 1.2);
    C.bx = lerp(C.bx, plane.x + C.lado * 40, 1.2);
  }
  const b = bandeo();
  C.x = C.bx + b.x;
  // EL PISO. El clamp va DESPUES del bandeo y no antes: `by` es la trayectoria y `b.y` el
  // cabeceo vivo que se le suma, asi que acotar solo la trayectoria dejaba al Harrier metiendose
  // bajo el agua en la parte baja de su propio bandeo — medido, y=-1.2 entrando desde abajo.
  //
  // …Y EL PISO NO ES 0.8: ES EL TERRENO. Hasta aca el unico piso del Harrier era el nivel del mar,
  // asi que en un CALLEJON —donde el cerro mide entre 17 y 39 unidades— volaba LITERALMENTE DENTRO
  // DE LA ROCA, y se lo veia pasar a traves del acantilado. Lo reporto el autor jugando: "los
  // harriers pasan a traves o directamente ENCIMA del terreno, deberian esquivar e irse, o irse
  // por arriba para no chocar".
  //
  // SE VA POR ARRIBA, que es la opcion que el autor nombro y ademas la unica que no le rompe el
  // ciclo al duelo: abortar la pasada al entrar en callejon dejaria al Harrier desapareciendo en
  // mitad de una maniobra, que se lee peor que el bug. Trepar sobre la cresta es lo que haria un
  // piloto, y encima lo pone donde se lo ve.
  //
  // SE PREGUNTA CON LAS MISMAS FUNCIONES QUE MATAN AL JUGADOR (`enPared`, `paredH` de
  // core/zigzag.js, `tierraH` de core/tierra.js). Es la regla de la casa desde el mar y la turba:
  // si el enemigo usara su propia idea de donde esta la roca, el dia que la ladera cambie de forma
  // habria dos verdades y el Harrier volveria a enterrarse.
  C.y = Math.max(pisoTerreno(C.x, C.y), C.by + b.y);
  // ALABEO LEIDO DEL MOVIMIENTO, no sorteado. El sprite tiene cinco poses de alabeo y hasta ahora
  // se elegia con `lado`, que es fijo por pasada: el avion volaba de costado todo el ciclo. Ahora
  // la pose sale de para donde se esta yendo de verdad, asi que el bandeo se VE en el dibujo.
  const vx = (C.x - C.xPrev) / Math.max(dt, 1e-4);
  C.xPrev = C.x;
  C.bank += (Math.max(-1, Math.min(1, vx / 26)) - C.bank) * Math.min(1, dt * 6);
}

/** EL CICLO — infinito hasta que lo elimines. */
function avanzar() {
  if (C.t < C.dur) return false;
  switch (C.fase) {
    case 'aviso':
      // LA ENTRADA TERMINA CUANDO TE PASO, no cuando suena un reloj: con la velocidad de cierre
      // relativa, cuanto tarda depende de a cuanto vayas vos (ver stepPos). CAZA_AVISO_T quedo
      // como MINIMO —el tell no puede durar menos que eso— y el gate de z es el que manda.
      if (C.z > CAZA_Z_COLA + 0.5) return false;
      irPresion();
      return false;
    case 'presion':
      // SE COMPROMETE A LA TERCERA, no a los N segundos: el corte lo da el contador de amagues.
      // El techo de tiempo esta solo por si un amague queda trabado — no es el reloj de la fase.
      if (C.amague < CAZA_AMAGUES && C.t < C.presMax) return false;
      C.pase++;
      ir('sobrepaso', CAZA_OVER_T);
      golpeDelPase();
      return false;
    case 'cayendo':
      return false;   // la caida se termina sola (stepCaida marca `muerto`)
    case 'sobrepaso':
      ir('ventana', CAZA_WINDOW);
      return false;
    case 'ventana':
      C.lado = Math.random() < 0.5 ? -1 : 1;
      ir('recola', CAZA_RECOLA_T);
      return false;
    case 'recola':
      // NO SE REENCOLA HASTA HABERSE IDO DE VERDAD. Cumplido el reloj todavia se le exige estar
      // lejos, porque con la fuga relativa la fase ya no dura siempre lo mismo: si lo perseguis,
      // se aleja mas despacio y te ganaste mas ventana de tiro. Cerrar por reloj lo teletransportaria
      // al horizonte en la cara del que lo estaba alcanzando.
      if (C.z < CAZA_Z_LEJOS * 0.7) return false;
      irPresion();
      return false;
    case 'salida':
      return true;
  }
  return false;
}

function comboFuerza() {
  const mv = run.mv;
  const nueva = mv && mv !== C.mvPrev;
  C.mvPrev = mv;
  if (!nueva || C.fase !== 'presion') return false;
  if (!CAZA_MV_FUERZA.includes(mv)) return false;
  C.sol = 0; C.grito = false;
  return true;
}

/** UN CUADRO de toda la flota. NO devuelve muerte: el Harrier no te mata (ver la nota del encabezado).
 *  La firma sigue siendo la de un sistema que podria devolver una señal, porque `game.js` la lee
 *  igual que las demas y porque el dia que el duelo vuelva a tener dientes entra por aca. */
export function cazaSystem(dt) {
  for (let i = fleet.length - 1; i >= 0; i--) {
    C = fleet[i];
    C.t += dt; C.capT += dt;
    // EL QUE CAE YA NO JUEGA. Ni solucion de tiro, ni combos, ni caja de impacto: esta muerto y
    // lo unico que le queda es llegar al suelo. Sin este corte se le podia seguir pegando a un
    // avion en llamas y volver a cobrar el derribo.
    if (C.fase === 'cayendo') {
      stepPos(dt); stepFx(dt);
      if (C.muerto) fleet.splice(i, 1);
      continue;
    }
    stepSolucion(dt);
    // cuanto hace que no tiene un Sidewinder suyo en el aire (el respiro de `lanzarAim9`)
    C.libreT = misilVivo() ? 0 : C.libreT + dt;
    C.tiroHace += dt;
    if (comboFuerza()) { C.pase++; ir('sobrepaso', CAZA_OVER_T); golpeDelPase(); }
    if (C.fase === 'presion') stepAmague(dt);
    stepRafaga(dt);
    stepPos(dt);
    stepFx(dt);
    stepTiro();
    if (C.muerto || avanzar()) fleet.splice(i, 1);
  }
  C = null;
  return;
}

/** ¿Se lo esta viendo de frente? Solo mientras VIENE hacia vos. Desde el sobrepaso hasta que se
 *  pierde en el horizonte se le ve la cola, sin excepcion. El render no decide esto. */
const deFrente = h => h.fase === 'aviso';

/** ¿YA TE PASO Y ESTA EN TU COLA? Entonces NO SE DIBUJA, porque tu cola no esta en la pantalla.
 *
 *  En la PRESION esto lo decide el amague: escondido no se dibuja, asomado si. Antes se dibujaba
 *  siempre y quedaba clavado en CAZA_Z_COLA los cinco a ocho segundos de la fase — a esa z la
 *  escala es F/6 = 22,5, o sea 236 px de ancho sobre una pantalla de 480, plantado en el cuadro.
 *  En la ENTRADA el corte es geometrico y exacto: por debajo de tu z ya te paso. */
const enCola = h => (h.fase === 'aviso' && h.z <= PZ) || (h.fase === 'presion' && h.asomaK < 0.05);

/** LO QUE VE EL RENDER — la flota entera. */
export function snapshot() {
  return fleet.map(h => ({
    fase: h.fase, t: h.t, dur: h.dur, pase: h.pase, sol: h.sol,
    x: h.x, y: h.y, z: h.z, lado: h.lado, humo: h.humo, fx: h.fx,
    deFrente: deFrente(h), enCola: enCola(h), bank: h.bank,
    asoma: h.asomaK, amague: h.amague, final: h.final,
  }));
}

// ---------- SONDA (QUITAR al cerrar el plan) ----------

export function dbg() {
  const h = fleet[0];
  if (!h) return JSON.stringify(null);
  return JSON.stringify({
    fase: h.fase, t: +h.t.toFixed(2), dur: +h.dur.toFixed(2),
    pase: h.pase, capT: +h.capT.toFixed(2), sol: +h.sol.toFixed(3),
    hp: h.hp, humo: +h.humo.toFixed(2), mudo: h.mudo, manso: h.manso,
    x: +h.x.toFixed(1), y: +h.y.toFixed(1), z: +h.z.toFixed(1), lado: h.lado,
    alto: +plane.y.toFixed(1), pz: PZ,
    frente: deFrente(h), cola: enCola(h),
    // DONDE CAE EN LA PANTALLA. Sin esto, "¿se ve el amague?" solo se puede contestar
    // mirando una captura, y una captura vacia no distingue entre "no asomo" y "asomo
    // fuera del cuadro" — que es exactamente el rato que se perdio la primera vez.
    sx: +proj(h.x, h.y, h.z).x.toFixed(1), sy: +proj(h.x, h.y, h.z).y.toFixed(1),
    semi: +(CAZA_SEMI * proj(h.x, h.y, h.z).k).toFixed(1), w: W,
    amague: h.amague, asoma: +h.asomaK.toFixed(2), final: h.final,
    n: fleet.length,
    // LOS SIDEWINDER: cuantos le quedan y en que anda el que tiro (guia / perdido / impacto), y si
    // ya esta en la ZONA donde una pirueta lo pierde
    aim9: h.aim9, misil: h.misil ? h.misil.fase : null, zona: h.misil ? !!h.misil.zona : null,
  });
}

// __aim9 (QUITAR): TODOS los Sidewinder vivos —los de la cola y los de los cazas de frente—, con lo
// que hace falta para afirmar la regla desde afuera: de donde vino, en que fase esta, si ya entro a
// la zona, cuanta EVASION lleva (la poscombustion con quiebres), por que te perdio ('maniobra' |
// 'quemado') y donde cae en la pantalla. Vive aca y no en collision.js porque es el archivo de LA
// COLA, que es donde se entiende la regla; los de frente salen en la misma lista.
if (typeof window !== 'undefined') window.__aim9 = () => JSON.stringify(missiles.filter(m => m.tipo === 'aim9').map(m => {
  const s = proj(m.x, m.y, Math.max(0.5, m.z));
  return { modo: m.modo, fase: m.fase, zona: !!m.zona, t: +m.t.toFixed(2), z: +m.z.toFixed(1),
    eva: +(m.eva || 0).toFixed(2), porque: m.porque || null,
    sx: Math.round(s.x), sy: Math.round(s.y), tr: (m.tr || []).length };
}));

/** ¿HAY UNO ASOMADO EN TU COLA AHORA MISMO? Devuelve su indice en la flota, o -1.
 *
 *  Este es el seam del que habla el encabezado. La maniobra que todavia no existe —la combinacion
 *  que te saca de encima al de atras de un golpe— necesita dos cosas, un BLANCO y un MOMENTO, y
 *  las dos estan aca: si esto devuelve algo distinto de -1, hay a quien pegarle y es ahora.
 *
 *  Se exporta antes de tener usuario a proposito. El estado ya existe; esconderlo obligaria a
 *  reabrir este archivo el dia que la maniobra se escriba, y el `0.5` —que es "esta afuera de
 *  verdad, no entrando ni saliendo"— se volveria a elegir a ojo en otro lado. */
export function asomando() {
  for (let i = 0; i < fleet.length; i++) {
    if (fleet[i].fase === 'presion' && fleet[i].asomaK > 0.5) return i;
  }
  return -1;
}

export function setSol(v) { if (fleet[0]) fleet[0].sol = v; }

/** SONDA: fija el final del primer Harrier. El sorteo de `start` es lo correcto para jugar y
 *  lo peor posible para medir — sin esto, probar los tres desenlaces es tirar la moneda hasta
 *  que salgan las tres caras. */
export function setFinal(f) { if (!fleet[0]) return null; fleet[0].final = f; return f; }

export function pegar(n) {
  if (!fleet[0]) return -1;
  C = fleet[0];
  for (let i = 0; i < n; i++) bullets.push({ x: C.x, y: C.y, z: C.z, life: 1 });
  for (let i = 0; i < n + 2 && C && !C.muerto; i++) stepTiro();
  const hp = C ? C.hp : -1;
  if (C && C.muerto) fleet.splice(0, 1);
  C = null;
  return hp;
}

export function dirPaso(o, s) { cazaDirector(s, o); return active(); }

export function dirN(o, n) {
  resetCaza();
  let k = 0;
  for (let i = 0; i < n; i++) {
    const before = fleet.length;
    cazaDirector(400, o);
    if (fleet.length > before) { k++; fleet.length = 0; }
  }
  return k;
}

export function forceFase(f) {
  if (!fleet[0]) return false;
  C = fleet[0];
  if (f === 'presion') { irPresion(); C = null; return true; }
  const dur = { aviso: CAZA_AVISO_T, sobrepaso: CAZA_OVER_T,
    ventana: CAZA_WINDOW, recola: CAZA_RECOLA_T, salida: CAZA_SALIDA_T }[f];
  if (dur === undefined) { C = null; return false; }
  ir(f, dur);
  C = null;
  return true;
}
