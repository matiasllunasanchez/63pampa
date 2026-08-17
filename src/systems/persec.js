// PERSECUCION: volar de NUMERAL. El lider vuela el pasillo adelante tuyo y vos mantenes la
// distancia dentro de una banda.
//
// Plan y porque: docs/sistemas/PLAN_HARRIERS_PERSECUCION.md, PLAN B (§4). No comparte una linea de
// codigo con PLAN A (LA COLA) — comparten la filosofia y nada mas, y por eso son dos archivos.
//
// LA IDEA EN UNA LINEA: la linea del lider es LA RESPUESTA CORRECTA del nivel. Esquiva todo lo que
// viene, asi que seguirlo ES leer el pasillo con anticipacion — y eso convierte "ir atras de un
// avion" en la habilidad real de 1982 en vez de un paseo.
//
// LO QUE ESTE MODULO NO HACE, que es la misma lista de siempre:
//
//   · NO ESCRIBE TU FISICA. Lee `plane` y `run` y no les escribe una linea. `npm run feel` tiene
//     que dar identico con esto adentro, igual que con LA COLA.
//   · NO LLAMA HACIA ARRIBA. Devuelve señales (`{ death }` cuando lo perdes o lo chocas) y game.js
//     decide si eso es relevo o derrota.
//   · NO DIBUJA. `snapshot()` y lo pinta render/persec.js.
//
// ═══ LA REGLA DEL AMIGO ═══════════════════════════════════════════════════════════════════════
//
// EL LIDER DE LA PERSECUCION ES UN AMIGO, Y UN AMIGO NO SE MUERE SOLO. No lo mata un obstaculo, no
// lo mata una bala tuya, no lo mata que le pases por encima, y no lo mata una casualidad de la
// siembra. La UNICA puerta por la que puede caerse del cielo es `caerLider()`, que la llama el
// GUION — y un guion, por definicion, dice tambien COMO y POR QUE.
//
// No es piedad: es que el modo entero descansa en una promesa. «Su linea es la respuesta correcta
// del nivel» solo sirve si su linea es SIEMPRE correcta. Un lider que a veces se come un mastil le
// enseña al jugador a desconfiar de el, y en el momento en que desconfias de el ya no estas volando
// de numeral — estas volando solo con un estorbo adelante. Y peor: le enseña que la muerte de un
// compañero es ruido de fondo, cuando en esta campaña es el unico evento que de verdad importa.
//
// QUE SI ES DESTRUIBLE, para que quede la frontera escrita: los HARRIER de LA COLA (PLAN A,
// systems/caza.js). Esos son los villanos que te sobrepasan con el afterburner — se los puede
// ahuyentar con el cañon y se los puede derribar. La regla del juego es de BANDO, no de sistema:
// el enemigo que te pasa por al lado se rompe; el numeral de tu escuadrilla no. Y los personajes
// con nombre de la campaña no se mueren en campaña salvo donde el guion lo diga (el caso escrito
// es el Vasco a la salida de m7, §5 C3 del plan).
//
// EL LIDER NUNCA CHOCA, y es un requisito explicito del §4 (N0). Se sostiene con DOS cosas, no una:
//   1. ESQUIVA — mira PURS_LOOK hacia adelante y se corre del carril de lo que viene. Es el mismo
//      mecanismo del esquive automatico del relevo (systems/squad.js), generalizado.
//   2. EL SEMBRADOR CONOCE SU LINEA — `carrilLibre()` es lo que systems/spawn.js consulta antes de
//      elegir un carril, y le corre la mano al lider. Sin esto el punto 1 seria una apuesta: un
//      obstaculo sembrado justo encima de el, a la velocidad del pasillo, no da tiempo a nada.
// Las dos juntas son la garantia. La primera lo hace CREIBLE (se lo ve esquivar, que es la mitad
// del punto: por eso seguirlo enseña); la segunda lo hace CIERTO.
//
// ESTADO DE LAS FASES: N0 (el lider), N1 (la cinta y la banda), N2 (el modo de menu), N3 (el dato
// de mision) y N5 (el tiron y el cierre) hechos. N4 queda anotado y sin construir.

import { plane } from '../core/state.js';
import { run } from '../core/run.js';
import { obstacles } from '../core/world.js';
import { popup } from '../core/fx.js';
import { T } from '../core/i18n.js';
import { P } from '../data/palette.js';
import { W } from '../render/ctx.js';
import { beep, duck } from './audio.js';
import { multOf } from '../core/util.js';
import { speedTarget } from '../core/physics.js';
import { pilotName } from './squad.js';
import { pilotIdx } from '../core/squad.js';
import { FLY_X, FLY_TOP } from '../data/tuning.js';
import {
  PURS_D, PURS_D0, PURS_V_F, PURS_V_AMP, PURS_V_T,
  PURS_SAFE, PURS_LOOK, PURS_AGIL,
  PURS_GRACE, PURS_WASH_D, PURS_WASH_SHAKE, PURS_CHOQUE_D, PURS_AVISO_T, PURS_PTS_S,
  PURS_TIGHT_D, PURS_TIGHT_F, PURS_TIGHT_MIN, PURS_ROTA_D,
  PURS_TIRON_T, PURS_TIRON_AVISO, PURS_TIRON_DUR, PURS_TIRON_F, PURS_TIRON_PTS,
  PURS_CIERRE_S, PURS_CIERRE_MAX,
} from '../data/tuning.js';
import { PZ } from '../render/ctx.js';

// ---- estado privado ----
// UN SOLO LIDER. Igual que el duelo, es una instancia o nada — `L` null cuesta un `if`.
let L = null;

/** ¿Hay persecucion corriendo? La consulta el sembrador antes de gastar un solo ciclo. */
export function active() { return L !== null; }

/** ARRANCA LA PERSECUCION. `opts.nombre` es el indicativo del lider (lo pone game.js segun el modo:
 *  un Fiel en campaña, un numeral anonimo en arcade). */
export function startPersec(opts = {}) {
  if (L) return false;
  L = {
    // EL INDICATIVO SALE DEL ESCUADRON, no de una constante: en campaña es un Fiel con nombre y en
    // arcade un numeral PATRIA. El indice arranca en 1 porque el 0 sos vos.
    lidIdx: 1,
    nombre: opts.nombre || pilotName(1),
    // INFINITO = el modo de menu (N2): la banda se aprieta y el lider se releva con la distancia.
    // En CAMPAÑA (N3) esto va APAGADO — ahi el tramo tiene largo conocido y una intencion escrita,
    // y una dificultad que trepa sola convertiria un tutorial en una prueba de resistencia.
    infinito: !!opts.infinito,
    d: PURS_D0,                 // DISTANCIA a vos, en unidades de mundo. Es la metrica del modo.
    t: 0,
    // donde esta, en el mismo espacio que obstaculos y balas. Su z sale de `d`: vos volas en PZ.
    x: plane.x, y: Math.max(6, plane.y), z: PZ + PURS_D0,
    tx: plane.x,                // carril al que va (el esquive mueve ESTO y no la posicion, para
    ty: Math.max(6, plane.y),   // que la curva siga siendo curva — misma idea que rv.x2 del relevo)
    bank: 0,
    // --- N1: la banda ---
    lo: PURS_D[0], hi: PURS_D[1],   // la banda de esta corrida (N2 la va angostando; aca es fija)
    fuera: 0,                   // segundos ACUMULADOS fuera de banda. Llega a PURS_GRACE y lo perdes.
    avisoT: 0,                  // reloj del proximo grito de radio
    enBanda: true,              // el estado del cuadro anterior: sirve para avisar en el FLANCO
    banda: 0,                   // segundos totales dentro de banda (es el puntaje del modo)
    // --- N2: el modo infinito ---
    d0: run.dist,               // desde donde se cuentan los escalones de apretado y los relevos
    pasos: 0,                   // escalones de apretado ya aplicados
    rotas: 0,                   // relevos de lider ya hechos
    // --- N5: el tiron y el cierre ---
    tirT: PURS_TIRON_T[0],      // reloj de la fase actual del tiron
    tirF: 0,                    // 0 esperando · 1 avisado · 2 quemando
    tirOk: true,                // ¿aguantaste EN BANDA todo el tiron? (el premio es todo o nada)
    cierre: 0,                  // u/s a las que te acercas (>0) o te alejas (<0), suavizado
  };
  return true;
}

/** Corta la persecucion de raiz. Lo llama `reset()` de game.js. */
export function resetPersec() { L = null; }

/** LA VELOCIDAD DEL LIDER este instante, y es RELATIVA A LA TUYA.
 *
 *  El numero de referencia es tu propia velocidad NOMINAL —la que tendrias volando derecho, sin
 *  turbo y sin afterburner— y sale de la misma funcion pura que usa tu vuelo (`speedTarget`). Es
 *  la unica forma de que el modo sea jugable: tu nominal sube sola con el tiempo de vuelo, asi que
 *  un lider a velocidad fija te deja atras al principio y se queda atras despues.
 *
 *  LO QUE VIENE GRATIS CON ESTO, y es lo mejor del asunto: la referencia se calcula SIN tu racha ni
 *  tu multiplicador (rasLevel 0, mult 1), pero tu velocidad real SI los tiene. O sea que volando
 *  pegado al agua vas mas rapido que el nominal y le seguis el tren comodo, y volando alto te
 *  descolgas. La tesis del juego, otra vez, sin una linea escrita para ella.
 *
 *  Encima, los dos senos: el patron se puede ANTICIPAR, que es distinto de adivinar. */
function velocidad(t) {
  const nominal = speedTarget({
    t: run.t, rasLevel: 0, mult: 1, windF: run.windF, boost: false, afterTier: 0,
  });
  const respiro = Math.sin(t / PURS_V_T[0] * 6.283) * 0.65 + Math.sin(t / PURS_V_T[1] * 6.283) * 0.35;
  // EL TIRON multiplica encima de todo lo demas: el respiro sigue corriendo abajo, asi que dos
  // tirones no se sienten calcados aunque duren lo mismo.
  return nominal * (PURS_V_F + PURS_V_AMP * respiro) * (L.tirF === 2 ? PURS_TIRON_F : 1);
}

const rnd = r => r[0] + Math.random() * (r[1] - r[0]);

/** EL TIRON (N5): el lider abre el turbo y hay que seguirlo. Tres tiempos — espera, AVISO, quemada —
 *  y el aviso es la mitad del mecanismo: ver «EL TIRON» en data/tuning.js.
 *
 *  El premio es TODO O NADA a proposito. Si pagara por segundo, la jugada optima seria aguantar dos
 *  segundos y soltar; asi la jugada optima es la unica que se siente bien: acelerar a fondo y
 *  aguantar hasta que el otro corte. El §4 pide un minijuego de gas y este es su punto alto. */
function stepTiron(dt) {
  L.tirT -= dt;
  if (L.tirF === 0) {
    if (L.tirT > 0) return;
    L.tirF = 1; L.tirT = PURS_TIRON_AVISO;
    popup(W / 2, 38, T('purs_tiron', { c: L.nombre }), P.accent, true);
    beep(760, 0.1, 'square', 0.05, 900);
    duck(0.25);
    return;
  }
  if (L.tirF === 1) {
    if (L.tirT > 0) return;
    L.tirF = 2; L.tirT = rnd(PURS_TIRON_DUR); L.tirOk = true;
    beep(300, 0.35, 'sawtooth', 0.05, 190);
    return;
  }
  // quemando: cualquier cuadro fuera de banda quema el premio, y no se recupera dentro del mismo
  // tiron — «le seguiste el tren» es una sola cosa y no un promedio
  if (!(L.d >= L.lo && L.d <= L.hi)) L.tirOk = false;
  if (L.tirT > 0) return;
  L.tirF = 0; L.tirT = rnd(PURS_TIRON_T);
  if (L.tirOk) {
    run.score += PURS_TIRON_PTS * multOf(plane.y);
    popup(W / 2, 38, T('purs_pegado'), P.foam);
    beep(880, 0.12, 'square', 0.05, 1180);
  }
}

/** EL ESQUIVE. Mira PURS_LOOK hacia adelante DESDE EL LIDER y se corre del carril de lo que se le
 *  viene encima. Mueve el ANCLA (`tx`/`ty`) y no la posicion: asi el movimiento sale curvo y se lee
 *  como un avion decidiendo, no como un sprite teletransportado de carril.
 *
 *  QUE ESQUIVA Y QUE NO: se saltea lo que no es un cuerpo solido (escombros, hongos, bidones,
 *  pajaros, trincheras de decorado) por la misma razon por la que el relevo los saltea — correrse
 *  de una bandada es un tic nervioso, no una maniobra, y el jugador que lo copia aprende mal. */
function esquivar(dt) {
  let tx = L.tx, ty = L.ty;
  let subir = 0;
  for (const o of obstacles) {
    if (o.done || o.type === 'chunk' || o.type === 'airboom' || o.type === 'boom'
      || o.type === 'fuel' || o.type === 'trench' || o.type === 'birds') continue;
    if (o.z < L.z || o.z > L.z + PURS_LOOK) continue;
    if (Math.abs(o.x - tx) > PURS_SAFE) continue;
    // ALTO Y ANCLADO AL PISO (mastil, torre, farallon, arbol): correrse de costado es la respuesta,
    // y si es MUY alto ademas conviene trepar. Volante (helo, jet, globo): solo de costado.
    tx = o.x + (tx >= o.x ? PURS_SAFE + 1 : -(PURS_SAFE + 1));
    if (o.h !== undefined && o.y === undefined && o.h > ty) subir = Math.max(subir, o.h + 3);
  }
  // el carril reservado no sale del pasillo: correrse hasta el borde seria salvarse del obstaculo
  // para chocar contra el limite del mundo, que desde afuera se lee igual de mal
  L.tx = Math.max(-FLY_X + PURS_SAFE, Math.min(FLY_X - PURS_SAFE, tx));
  L.ty = Math.max(4, Math.min(FLY_TOP - 6, subir ? Math.max(ty, subir) : ty));
  // …y vuelve despacio a su altura de crucero cuando ya no hay nada que saltar: un lider que se
  // queda arriba despues de trepar te obliga a volar alto atras suyo, que es lo contrario del juego
  if (!subir) L.ty += (7 - L.ty) * Math.min(1, dt * 0.5);
}

/** UN CUADRO de la persecucion. Devuelve `{ death }` cuando lo perdes o lo chocas (ver `banda`), y
 *  `undefined` mientras siga todo en orden. game.js decide que hacer con la señal. */
export function persecSystem(dt) {
  if (!L) return;
  L.t += dt;
  // EL GUION: la unica puerta por la que el lider se cae del cielo (ver LA REGLA DEL AMIGO arriba).
  // Se atiende ANTES que nada para que no haya un cuadro de lider muerto que igual esquiva.
  if (L.guion) {
    const m = L.guion; L = null;
    return { guion: m };
  }
  stepTiron(dt);
  // LA DISTANCIA ES LA DIFERENCIA DE VELOCIDADES, y no hay mas modelo que ese. Si el lider va mas
  // rapido se aleja; si vos vas mas rapido, se acerca. Es lo que hace que el modo se juegue con el
  // acelerador y no con el timon — el §4 lo dice con todas las letras.
  const v = velocidad(L.t);
  L.d += (v - run.spd) * dt;
  // EL CIERRE (N5): la misma resta, pero SUAVIZADA y guardada para que el HUD la pueda mostrar. Es
  // la lectura anticipada del modo — ver «EL CIERRE» en data/tuning.js.
  L.cierre += ((run.spd - v) - L.cierre) * Math.min(1, dt * PURS_CIERRE_S);
  // techo y piso duros de la metrica: mas alla de esto el lider deja de ser un avion en pantalla y
  // pasa a ser un punto o un choque, y las dos cosas las resuelve N1 (la gracia y el jet wash)
  L.d = Math.max(2, Math.min(PURS_D[1] * 3, L.d));
  L.z = PZ + L.d;
  esquivar(dt);
  // seguimiento suave hacia el ancla: PURS_AGIL es todo lo agil que es este avion
  const k = Math.min(1, PURS_AGIL * dt);
  const nx = L.x + (L.tx - L.x) * k;
  L.y += (L.ty - L.y) * k;
  // el BANQUEO sale del movimiento real, igual que en el autopiloto del relevo: el lider banquea
  // como banquearia el jugador, y eso es la mitad de que se lea como un avion pilotado
  L.bank += (Math.max(-1, Math.min(1, (nx - L.x) / Math.max(dt, 1 / 240) / 26)) - L.bank) * Math.min(1, dt * 8);
  L.x = nx;
  if (L.infinito) infinito();
  return banda(dt);
}

/** EL MODO INFINITO (N2): la banda se APRIETA y el lider se RELEVA.
 *
 *  Los dos son de distancia y no de tiempo, porque en un pasillo infinito la distancia es la unica
 *  medida de progreso que el jugador ya entiende (es la que mueve la velocidad y la siembra).
 *
 *  EL APRETADO es la curva de dificultad entera del modo — no hay enemigos nuevos ni un jefe al
 *  final: lo que se pone dificil es la misma tarea. Cada PURS_TIGHT_D metros la banda se encoge un
 *  8%, con piso: mas apretada que PURS_TIGHT_MIN deja de ser un minijuego de gas y pasa a ser una
 *  cuerda floja, y el §6.3 de este documento (peligroso, nunca imposible) vale igual para el PLAN B.
 *
 *  EL RELEVO no es cosmetica. En un modo infinito lo unico que puede marcar que PASO algo es que la
 *  radio cambie de persona: el que venia adelante se queda sin nafta y te pasa la posta a otro Fiel.
 *  Es tambien la unica forma que tiene este modo de contar que hay un escuadron y no un objetivo. */
function infinito() {
  const rec = run.dist - L.d0;
  // apretado
  const paso = Math.floor(rec / PURS_TIGHT_D);
  if (paso > L.pasos) {
    L.pasos = paso;
    const f = Math.pow(PURS_TIGHT_F, paso);
    L.lo = Math.max(PURS_TIGHT_MIN[0], PURS_D[0] * f);
    L.hi = Math.max(PURS_TIGHT_MIN[1], PURS_D[1] * f);
    popup(W / 2, 54, T('purs_aprieta', { c: pilotName(pilotIdx(run.squad, run.lives)) }), P.accent);
    beep(700, 0.09, 'square', 0.045, 520);
  }
  // relevo del lider
  const rota = Math.floor(rec / PURS_ROTA_D);
  if (rota > L.rotas) {
    L.rotas = rota;
    const antes = L.nombre;
    L.lidIdx++;
    L.nombre = pilotName(L.lidIdx);
    popup(W / 2, 46, T('purs_releva', { a: antes, b: L.nombre }), P.foam);
    beep(520, 0.12, 'square', 0.05, 620);
    duck(0.3);
  }
}

/** LA BANDA (N1). Es todo el juego del modo: el lider acelera y frena, y vos dosificas el gas para
 *  quedarte adentro. Tres consecuencias, de menor a mayor, y ninguna es un numero en pantalla:
 *
 *   · CERCA DE MAS → su ESTELA. Por debajo de PURS_WASH_D entras en el aire sucio que deja atras y
 *     la camara se sacude cada vez mas. Es aviso fisico, no cartel: se siente antes de entenderse.
 *   · ENCIMA → lo CHOCASTE. Por debajo de PURS_CHOQUE_D es un choque como cualquier otro del juego
 *     (el mar mata, un mastil mata, tu propio lider mata). No hay excepcion para los amigos.
 *   · LEJOS DE MAS o cerca de mas SOSTENIDO → la GRACIA. PURS_GRACE segundos de aviso por radio y
 *     recien despues lo perdes. La gracia se GASTA y no se resetea de a poco: volver a banda la
 *     recupera, pero salir y entrar todo el tiempo la va comiendo igual — que es lo justo.
 *
 *  Devuelve señal como todos: `{ death }` y game.js decide si es relevo o derrota. */
function banda(dt) {
  const dentro = L.d >= L.lo && L.d <= L.hi;
  if (dentro) {
    L.banda += dt;
    // EL PUNTAJE DEL MODO es tiempo en banda por el multiplicador de ALTURA que ya tiene el juego.
    // No hace falta inventar economia: volar pegado al agua sigue pagando mas, asi que seguir al
    // lider bien abajo es la jugada — la misma tesis de siempre, dicha con otro sistema.
    run.score += PURS_PTS_S * dt * multOf(plane.y);
    // la gracia se recupera, pero mas lento de lo que se gasta: entrar y salir no es gratis
    L.fuera = Math.max(0, L.fuera - dt * 0.6);
  } else {
    L.fuera += dt;
  }

  // CHOQUE: es un avion, no un aura. EL QUE SE MATA SOS VOS — le pasaste por encima al que ibas
  // siguiendo y te fuiste al agua; el lider sigue volando, porque es un amigo y los amigos no se
  // mueren por un error tuyo de acelerador (LA REGLA DEL AMIGO, arriba). Que la consecuencia sea
  // toda tuya es ademas lo unico que hace que la estela signifique algo.
  // Y LA PERSECUCION TERMINA AHI — igual que el duelo de LA COLA cuando te alcanza, y por la misma
  // razon: el relevo tiene que devolverle al compañero un pasillo limpio. Sin esto el lider sobrevive
  // a tu propia muerte, el compañero entra ya fuera de banda con la gracia de otro corriendo, y la
  // ventana de gracia que el embudo de game.js garantiza deja de valer.
  if (L.d < PURS_CHOQUE_D) { L = null; return { death: 'purs_choque' }; }

  // JET WASH: el aire sucio del que va adelante. Crece hacia adentro — a PURS_WASH_D es un
  // cosquilleo y pegado a el es un manotazo. Escribe `run.shake`, que es el mismo canal de camara
  // que usan el roce y las explosiones: feedback, no fisica (el §6.4 protege el vuelo, no la camara).
  if (L.d < PURS_WASH_D) {
    const f = 1 - (L.d - PURS_CHOQUE_D) / Math.max(1, PURS_WASH_D - PURS_CHOQUE_D);
    run.shake = Math.min(9, run.shake + PURS_WASH_SHAKE * f * dt * 6);
  }

  // LA RADIO. Avisa en el FLANCO (apenas te saliste) y despues insiste cada PURS_AVISO_T — no por
  // cuadro, que seria un grito continuo, y no una sola vez, que se pierde en el medio de un esquive.
  L.avisoT -= dt;
  if (!dentro && (L.enBanda || L.avisoT <= 0)) {
    L.avisoT = PURS_AVISO_T;
    const lejos = L.d > L.hi;
    popup(W / 2, 46, lejos ? T('purs_lejos', { c: L.nombre }) : T('purs_cerca'), P.warn);
    beep(lejos ? 520 : 380, 0.1, 'square', 0.045, lejos ? 620 : 300);
    if (L.enBanda) duck(0.25);
  }
  L.enBanda = dentro;

  // SE ACABO LA GRACIA: lo perdiste. Es una derrota "con gracia" en los dos sentidos — te avisaron
  // cuatro segundos y no es un choque, pero el avion sale de la partida igual.
  if (L.fuera >= PURS_GRACE) { L = null; return { death: 'purs_perdido' }; }
  return;
}

/** EL CARRIL RESERVADO — lo que hace que "el sembrador conoce su linea" sea verdad y no una
 *  intencion. systems/spawn.js llama a esto con el carril que iba a usar y recibe uno corregido.
 *
 *  Se compara contra el ANCLA (`tx`) y no contra la posicion: el ancla es a donde el lider VA, o
 *  sea el unico dato que dice algo del futuro — que es cuando el obstaculo recien sembrado va a
 *  llegar hasta el. Comparar contra donde esta hoy reservaria el carril equivocado. */
export function carrilLibre(x) {
  if (!L) return x;
  const d = x - L.tx;
  if (Math.abs(d) > PURS_SAFE * 2) return x;
  // se lo corre al lado mas cercano, y si eso lo saca del pasillo, al otro
  const fuera = PURS_SAFE * 2 + 1;
  let nx = L.tx + (d >= 0 ? fuera : -fuera);
  if (Math.abs(nx) > FLY_X) nx = L.tx - (d >= 0 ? fuera : -fuera);
  return Math.max(-FLY_X, Math.min(FLY_X, nx));
}

/** LA PUERTA DEL GUION — la UNICA forma de que el lider se caiga (ver LA REGLA DEL AMIGO arriba).
 *
 *  No la llama ningun sistema: la llama el guion de una mision, y por eso pide un `motivo` — una
 *  clave de `data/strings.js` que dice COMO se cayo. El caso escrito es el Vasco a la salida de m7
 *  (§5 C3 del plan), enganchado por un Sea Harrier con el jugador al lado sin poder hacer nada.
 *
 *  La señal `{ guion }` NO es una muerte tuya: game.js la cuenta como fin de la persecucion. Si el
 *  guion ademas quiere que eso te cueste algo, es el guion el que lo escribe. */
export function caerLider(motivo) {
  if (!L) return false;
  L.guion = motivo || 'purs_caido';
  return true;
}

/** LO QUE VE EL RENDER. Copia chata y de solo lectura (convencion 4: el dibujo lee, no manda). */
export function snapshot() {
  if (!L) return null;
  return {
    nombre: L.nombre, d: L.d, x: L.x, y: L.y, z: L.z, bank: L.bank, t: L.t,
    lo: L.lo, hi: L.hi, fuera: L.fuera, gracia: PURS_GRACE, banda: L.banda,
    // N5: `tir` es la fase del tiron (1 = avisado, 2 = quemando) y `cierre` la lectura anticipada
    tir: L.tirF, cierre: L.cierre, cmax: PURS_CIERRE_MAX,
    wash: L.d < PURS_WASH_D ? 1 - (L.d - PURS_CHOQUE_D) / Math.max(1, PURS_WASH_D - PURS_CHOQUE_D) : 0,
  };
}

// ---------- SONDA (QUITAR al cerrar el plan) ----------

/** El estado del lider, en JSON. Lo lee el fixture. */
export function dbgPersec() {
  return JSON.stringify(L ? {
    nombre: L.nombre, d: +L.d.toFixed(1), v: +velocidad(L.t).toFixed(1),
    lo: L.lo, hi: L.hi, dentro: L.d >= L.lo && L.d <= L.hi,
    fuera: +L.fuera.toFixed(2), gracia: PURS_GRACE, segs: +L.banda.toFixed(1),   // segundos acumulados DENTRO de banda
    x: +L.x.toFixed(1), y: +L.y.toFixed(1), z: +L.z.toFixed(1),
    tx: +L.tx.toFixed(1), ty: +L.ty.toFixed(1), bank: +L.bank.toFixed(2),
    spd: +run.spd.toFixed(1), t: +L.t.toFixed(1),
    tir: L.tirF, tirT: +L.tirT.toFixed(2), tirOk: L.tirOk, cierre: +L.cierre.toFixed(1),
  } : null);
}

/** Devuelve la GRACIA a cero. Las secciones del tiron dejan al jugador lejos de banda a proposito
 *  durante segundos, y sin esto se le acaba la gracia en el medio de la prueba: la seccion muere por
 *  un mecanismo que ya prueban las secciones 5 y 6, y peor, deja el mundo en relevo — o sea que la
 *  seccion SIGUIENTE mide un lider congelado. Es la tercera vez en este plan. */
export function setFuera(v) { if (L) L.fuera = +v; }

/** Fuerza la fase del tiron: 0 lo DESARMA por un rato largo (para medir el vuelo de crucero sin que
 *  se dispare uno en el medio), 1 dispara el aviso, 2 lo pone a quemar. Probar un tiron esperandolo
 *  son 11 a 18 segundos de vuelo por asercion. */
export function setTiron(f) {
  if (!L) return false;
  L.tirF = +f;
  L.tirT = +f === 2 ? PURS_TIRON_DUR[1] : (+f === 1 ? PURS_TIRON_AVISO : PURS_TIRON_T[1]);
  if (+f === 2) L.tirOk = true;
  return true;
}

/** Pone la distancia donde se la pida: sirve para mirar los extremos de la banda sin volar hasta
 *  ellos, que es medio minuto de gas cada vez. */
export function setDist(d) { if (L) { L.d = +d; L.z = PZ + L.d; } }

/** Adelanta el ODOMETRO del modo infinito sin volar los kilometros. Los escalones de apretado caen
 *  cada 900 m y los relevos cada 1800: probarlos volando son minutos por asercion. */
export function setRec(m) { if (L) L.d0 = run.dist - (+m); }

/** Prende o apaga el modo infinito en vivo: es la diferencia entre N2 (el modo de menu, que aprieta)
 *  y N3 (la campaña, donde el tramo tiene largo escrito y la banda queda quieta). */
export function setInf(v) { if (L) L.infinito = !!v; }

/** LO QUE VE EL VIGILANTE del fixture: los obstaculos solidos cerca del lider, en crudo. Se expone
 *  desde aca —y no leyendo `obstacles` de afuera— porque el criterio de "solido" es el mismo que
 *  usa `esquivar`, y tenerlo escrito dos veces seria la forma mas facil de que la prueba deje de
 *  probar lo que el sistema hace. */
export function obsCerca() {
  if (!L) return [];
  const r = [];
  for (const o of obstacles) {
    if (o.done || o.type === 'chunk' || o.type === 'airboom' || o.type === 'boom'
      || o.type === 'fuel' || o.type === 'trench' || o.type === 'birds') continue;
    if (Math.abs(o.z - L.z) > 40) continue;
    r.push({ x: o.x, y: o.y === undefined ? null : o.y, z: o.z, t: o.type });
  }
  return r;
}

/** Sortea `n` carriles como lo hace el sembrador y cuenta cuantos caen ADENTRO del corredor
 *  reservado del lider. La respuesta correcta es cero, y es la unica forma de probar la promesa del
 *  §4 sin tener que esperar a que la casualidad siembre justo encima. */
export function carrilTest(n) {
  if (!L) return -1;
  let malos = 0;
  for (let i = 0; i < n; i++) {
    const x = carrilLibre(Math.random() * FLY_X * 2 - FLY_X);
    if (Math.abs(x - L.tx) < PURS_SAFE) malos++;
  }
  return malos;
}
