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

import { plane, stats } from '../core/state.js';
import { run } from '../core/run.js';
import { bullets } from '../core/world.js';
import { popup, proj, chispazo, explodeAt } from '../core/fx.js';
import { T } from '../core/i18n.js';
import { P } from '../data/palette.js';
import { W, PZ } from '../render/ctx.js';
import {
  CAZA_SOL_T, CAZA_PASSES, CAZA_CAP_T, CAZA_WINDOW, CAZA_RAS_ALT, CAZA_HP, CAZA_KILLABLE,
  CAZA_PRES_T, CAZA_AVISO_T, CAZA_OVER_T, CAZA_RECOLA_T, CAZA_SALIDA_T,
  CAZA_Z_COLA, CAZA_Z_FRENTE, CAZA_X_COLA, CAZA_MISS,
  CAZA_TRAC_V, CAZA_TRAC_N, CAZA_TRAC_GAP,
  CAZA_SOL_AVISO, CAZA_LET_N, CAZA_LET_V, CAZA_LET_RX, CAZA_LET_RY, CAZA_SOL_POST, CAZA_GOLPE_CD,
  CAZA_HIT_RX, CAZA_HIT_RY, CAZA_PTS, CAZA_MV_FUERZA,
  CAZA_DIR_D0, CAZA_DIR_FIN, CAZA_DIR_GAP, CAZA_MUDO_P,
} from '../data/tuning.js';
import { beep, boom, duck, sfxOne } from './audio.js';
import * as dmg from './damage.js';
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
    // MANSO = el PASE FANTASMA de H1 conservado como modo: la coreografia entera sin las rafagas
    // que matan. No es una dificultad, es un instrumento — la unica forma de mirar el ciclo
    // completo sin que la tercera pasada te mate en el medio de la captura. El juego nunca lo usa.
    manso: !!opts.manso,
    // --- la solucion de tiro (H2 la usa; H0/H1 la MIDEN sin cobrarla) ---
    sol: 0,                     // 0..1 — madura con rumbo predecible, se resetea con los quiebres
    px: plane.x, py: plane.y,   // tu posicion del cuadro anterior: de ahi sale si estas quebrando
    grito: false,               // ¿ya grito la radio en esta maduracion? (H2)
    pegue: false,               // una rafaga letal te alcanzo este cuadro (H2)
    golpeT: 0,                  // veda tras un impacto: una RAFAGA cobra un golpe, no uno por tiro
    mvPrev: null,               // pirueta del cuadro anterior: sirve para detectar una NUEVA (H3)
    // --- vida del caza (H3) ---
    hp: 0,                      // impactos encajados
    humo: 0,                    // 0..1 — ahuyentado y humeando
    // --- donde esta, en unidades de MUNDO (misma z que obstaculos y balas; vos volas en PZ) ---
    x: plane.x, y: plane.y, z: CAZA_Z_COLA,
    lado: Math.random() < 0.5 ? -1 : 1,   // por que costado va a sobrepasar
    // --- coreografia (H1) ---
    fx: [],                     // trazadoras que te pasan de largo y estela del sobrepaso
    tracT: 0,                   // reloj de la proxima rafaga
    humoT: 0,                   // reloj de la columna de humo cuando esta averiado (H3)
    muerto: false,              // lo derribaste: el duelo termina sin salida que mirar
  };
  if (!C.mudo) popup(W / 2, 46, T('caza_warn', { c: miIndicativo() }), P.warn);
  return true;
}

/** Corta el duelo de raiz Y olvida lo que el director llevaba contado. Lo llama `reset()` de
 *  game.js: una corrida nueva no hereda ni el Harrier de antes ni su reloj. */
export function resetCaza() { C = null; D = null; }

// ---------------- H4: EL REGLAMENTO (cuando aparece) ----------------
//
// LA DECISION DE CUANDO HAY DUELO NO ES DEL DUELO: es del nivel. El §6.6 y el §4 del PLAN C piden
// que la aparicion sea DATO (`caza` por mision, 0..2) y no una regla escondida en el sistema, y
// que jamas aparezca donde arruinaria otra cosa. Este director es todo lo que hace falta para eso,
// y esta aca —y no en game.js— porque game.js ya tiene demasiado y esto es una regla del duelo.
//
// Las cinco puertas, y cada una tapa un modo de arruinar una partida:
//   · INTENSIDAD 0 → no hay duelo. m1 es el tutorial y el tutorial no se pelea (§5, C2).
//   · los primeros CAZA_DIR_D0 m son sagrados: nadie te embosca antes de ver el pasillo.
//   · los ultimos CAZA_DIR_FIN m antes del objetivo tambien: ese tramo es del climax, y meterle un
//     Harrier encima seria exactamente lo que el §6.6 prohibe con otro nombre.
//   · dentro del BANCO DE NIEBLA no arranca. No podes esquivar lo que no ves, y un duelo a ciegas
//     no es dificil: es una moneda.
//   · UNO POR VEZ (§6.2) y con un hueco entre duelos, o el pasillo deja de ser un pasillo.
let D = null;

/** DECIDE SI HOY HAY HARRIER. No devuelve señal —lo unico que hace es armar el duelo— porque el
 *  que responde por el duelo despues es `cazaSystem`, que ya devuelve la suya.
 *  `o`: `{ intensidad, dist, meta, ciego }` — `meta` en 0 significa pasillo INFINITO (POR LA PATRIA
 *  y compañia), y ahi el techo de duelos no existe: es el modo donde se los aguanta hasta que uno
 *  te agarra. */
export function cazaDirector(dt, o) {
  if (!D) D = { hechos: 0, prox: entre(CAZA_DIR_GAP) };
  const int = Math.max(0, Math.min(2, o.intensidad | 0));
  if (!int) return;
  // LA INTENSIDAD ACORTA LA ESPERA, no acorta el duelo. Un Harrier mas peligroso no es uno que
  // pega mas fuerte —eso lo decide el modelo de averias, que es del juego entero— es uno que
  // VUELVE ANTES. En 2 el reloj corre al doble y el pasillo no te deja respirar.
  if (D.prox > 0) D.prox -= dt * (0.5 + int * 0.75);
  if (C || D.prox > 0) return;
  if (o.dist < CAZA_DIR_D0) return;
  if (o.meta && o.meta - o.dist < CAZA_DIR_FIN) return;
  if (o.ciego) return;
  if (o.meta && D.hechos >= int) return;   // en campaña el techo de duelos ES la intensidad
  D.hechos++;
  D.prox = entre(CAZA_DIR_GAP);
  // …Y A VECES NO TE AVISAN. Es canon (§2): sin radar ni RWR el aviso era de Condor o de un Fiel,
  // y a veces no llegaba. La probabilidad sube con la intensidad porque las misiones de intensidad
  // 2 son justamente las de clima cerrado y las nocturnas — donde el que mira no ve.
  start({ mudo: Math.random() < CAZA_MUDO_P[int] });
}

/** Pasa a la fase `f` con su duracion. Un solo lugar donde se escribe `fase`, para que el ciclo
 *  del §3 se lea entero en `avanzar()` y no haya transiciones sueltas por el archivo. */
function ir(f, dur) { C.fase = f; C.t = 0; C.dur = dur; }

/** LA MADURACION DE LA SOLUCION DE TIRO — y desde H2, lo que cobra cuando madura. Es el numero que
 *  dice si el duelo esta enseñando lo que promete: si nadie baja, la regla del ras no existe.
 *  Tres reglas, y las tres son la tesis del juego:
 *    · madura con el RUMBO PREDECIBLE — volar derecho es lo que le da la solucion;
 *    · cada QUIEBRE se la borra — moverse cuesta energia pero salva;
 *    · A RAS casi no progresa (§2: abajo el ambiente degradaba al cazador).
 *  El quiebre se mide contra tu propio cuadro anterior y no contra el input: asi vale igual una
 *  pirueta, un golpe de alabeo o un salto de gas — el sistema no tiene que saber COMO lo hiciste. */
function stepSolucion(dt) {
  const quiebre = Math.abs(plane.x - C.px) + Math.abs(plane.y - C.py) * 0.7;
  C.px = plane.x; C.py = plane.y;
  // el umbral es por segundo, no por cuadro: si no, a 60 fps cualquier temblor contaba de quiebre
  const q = quiebre / Math.max(dt, 1e-4);
  if (q > 9) {
    // EL QUIEBRE SE LA BORRA, y borrar no es "frenar el progreso": el §3 dice RESETEA. Por eso la
    // caida es proporcional a lo fuerte que quebraste y no una constante — un bamboleo de gas la
    // frena, un BREAK TURN de verdad la deja en cero en dos decimas. Con una caida fija (la primera
    // version) un quiebre entero le sacaba menos de lo que recuperaba en el medio segundo
    // siguiente, o sea que maniobrar era, en los numeros, casi lo mismo que no maniobrar.
    C.sol = Math.max(0, C.sol - dt * Math.min(6, q / 9) / (CAZA_SOL_T * 0.5));
    if (C.sol < CAZA_SOL_AVISO) C.grito = false;   // se enfrio: el proximo grito vuelve a valer
    return;
  }
  const ras = plane.y <= CAZA_RAS_ALT ? 0.12 : 1;   // a ras casi no progresa
  C.sol = Math.min(1, C.sol + (dt / CAZA_SOL_T) * ras);

  // ---- H2: LOS DIENTES ----
  // Solo dispara APUNTADO desde la cola. Adelante tuyo no tiene angulo, y ahi el que tira sos vos.
  if (C.fase !== 'presion' && C.fase !== 'aviso') return;
  // EL AVISO ES HUMANO O NO ES (§6.1). Nada de tono de fijado ni recuadro: alguien que te ve por
  // el espejo y te lo grita. En un duelo MUDO no suena nada y el unico aviso son las trazadoras —
  // que es exactamente lo que el §2 dice que pasaba sin radar ni RWR.
  if (C.sol >= CAZA_SOL_AVISO && !C.grito) {
    C.grito = true;
    if (!C.mudo) popup(W / 2, 46, T('caza_break', { c: miIndicativo() }), P.warn, true);
  }
  if (C.sol >= 1) { if (!C.manso) rafagaLetal(); C.sol = CAZA_SOL_POST; C.grito = false; }
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

/** LA RAFAGA QUE SI VIENE A DARTE (H2). Sale cuando la solucion de tiro maduro, y es otra cosa que
 *  la de aviso: sin el offset de CAZA_MISS —va derecho a donde estas— y bastante mas LENTA.
 *
 *  DONDE ESTA DE VERDAD LA VENTANA DE ESQUIVE — y conviene decirlo porque es facil equivocarse al
 *  leer esto. NO esta en el vuelo del proyectil: de la cola (z 6) a tu z (14) hay OCHO unidades, o
 *  sea que a cualquier velocidad razonable la rafaga llega en centesimas y no hay reflejo humano
 *  que la saque. La ventana es LA MADURACION: el grito de radio sale a CAZA_SOL_AVISO (0,72) y de
 *  ahi al disparo falta el 28% de CAZA_SOL_T, o sea casi UN SEGUNDO entero de aviso. Eso es lo que
 *  se esquiva, y por eso el §3 pone toda la defensa en la solucion de tiro y no en el proyectil:
 *  quebras y se le borra; volas a ras y casi no le sube. Cuando la rafaga sale, ya perdiste ese
 *  intercambio — y que TE PEGUE es la consecuencia, no una moneda.
 *
 *  Que sea LENTA (210 contra los 340 de las de aviso) tiene otro motivo, que es de lectura: son las
 *  unicas trazadoras que se quedan un rato largo cruzando ADELANTE tuyo despues de pasarte, y verlas
 *  irse es como se entiende, sin un cartel, que esas venian con tu nombre.
 *
 *  La dispersion es chica pero no nula: a fondo del cono uno de los tres pasa raspando y no pega,
 *  y esa es la diferencia entre "me salve" y "no me toco". */
function rafagaLetal() {
  const n = Math.round(entre(CAZA_LET_N));
  for (let i = 0; i < n; i++) {
    C.fx.push({
      k: 'trac', letal: 1,
      x: plane.x + (Math.random() - 0.5) * 2.6,
      y: plane.y + (Math.random() - 0.5) * 2.2,
      z: 2,
      wait: i * 0.05,
      vz: CAZA_LET_V * (0.97 + Math.random() * 0.06),
      life: 2.2 + i * 0.05,
    });
  }
  // mas grave y mas largo que el chasquido de las de aviso: se tiene que oir DISTINTO, porque es
  // otra cosa. El oido es el segundo canal del tell y no puede decir lo mismo en los dos casos.
  beep(420, 0.16, 'sawtooth', 0.06, 260);
}

/** Avanza trazadoras y estela, y siembra rafagas nuevas mientras el caza este ATRAS. */
function stepFx(dt) {
  for (const f of C.fx) {
    if (f.k === 'trac') {
      if (f.wait > 0) { f.wait -= dt; continue; }   // todavia no salio: ni se mueve ni se dibuja
      const z0 = f.z;
      f.z += f.vz * dt; f.life -= dt;
      // EL IMPACTO SE RESUELVE AL CRUZAR TU z, no al salir del cañon. Es lo que convierte a la
      // rafaga en algo esquivable: entre que sale y que llega hay tiempo real de vuelo, y en ese
      // tiempo la bala ya no se corrige — vos si. Se mide el CRUCE (z0 <= PZ < z) y no la cercania
      // por cuadro, porque a 210 u/s un proyectil salta 3,5 unidades por cuadro y una prueba de
      // proximidad se lo saltearia entero a poco que baje el framerate.
      // UNA RAFAGA COBRA UN IMPACTO, no uno por proyectil. Sin este cooldown los tres o cuatro
      // tiros de la misma rafaga entraban de a uno y cada uno llamaba a `takeHit`: en el modelo de
      // averias eso son 102 puntos de daño en dos cuadros, o sea el avion en el piso de un solo
      // pase. Una rafaga de cañon que engancha es UN evento — el modelo de averias lo dice al poner
      // "tres impactos y estas en el piso", y tres impactos tienen que ser tres PASES.
      if (C.golpeT > 0) C.golpeT -= dt;
      if (f.letal && C.golpeT <= 0 && !C.pegue && z0 <= PZ && f.z > PZ
          && Math.abs(f.x - plane.x) < CAZA_LET_RX && Math.abs(f.y - plane.y) < CAZA_LET_RY) {
        f.life = 0;
        // EL MODELO DE AVERIAS ES EL DE SIEMPRE, y por eso se pregunta y no se decide. En 'squad'
        // un toque te tira; en 'integ' el A-4 aguanta tres rafagas y se va degradando. El duelo no
        // tiene su propia regla de vida: usa la del juego (core/damage.js) igual que la colision,
        // el misil y el antiaereo. `takeHit` avisa, sacude y suena solo.
        C.golpeT = CAZA_GOLPE_CD;
        if (dmg.takeHit('death_caza')) C.pegue = true;
      }
    }
    else { f.life -= dt; f.z -= run.spd * dt; }    // la estela del sobrepaso queda quieta en el mundo
  }
  // TRAMPA #2 DEL REPO: todo fx lleva `life` mayor que su tiempo de uso, porque este filtro
  // generico destruye en el mismo cuadro lo que nace sin vida.
  let n = 0;
  for (let i = 0; i < C.fx.length; i++) if (C.fx[i].life > 0 && C.fx[i].z < 260 && C.fx[i].z > 1) C.fx[n++] = C.fx[i];
  C.fx.length = n;
  // solo dispara desde la cola: adelante tuyo ya no tiene angulo, y ahi el que tira sos vos.
  // AVERIADO NO TIRA MAS: le rompiste el ataque, y eso es literalmente lo que significa (H3).
  if ((C.fase === 'aviso' || C.fase === 'presion') && !C.humo) {
    C.tracT -= dt;
    if (C.tracT <= 0) { C.tracT = entre(CAZA_TRAC_GAP); rafaga(); }
  }
  // LA COLUMNA DE HUMO del ahuyentado. Es el unico premio que se ve desde lejos y sin leer: el que
  // se va dejando una raya negra se va PORQUE le pegaste, y eso no lo dice ningun cartel.
  if (C.humo) {
    C.humoT -= dt;
    if (C.humoT <= 0) {
      C.humoT = 0.05;
      C.fx.push({ k: 'humo', x: C.x + (Math.random() - 0.5) * 1.2, y: C.y + (Math.random() - 0.5) * 1.2,
        z: C.z, life: 1.4 + Math.random() * 0.8, r: 0.8 + Math.random() * 1.2 });
    }
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

// ---------------- H3: EL CONTRAATAQUE ----------------
//
// La ventana frontal es TU TURNO, y sin esto era decorado. Dos desenlaces, y la distancia entre
// ellos es toda la verdad historica del §2: al Harrier se lo AHUYENTA (le rompes el ataque y se va
// humeando) y eso es lo normal; DERRIBARLO existe, sale el triple de caro y es la hazaña.

/** ¿LE PEGASTE? Recorre tus balas contra el caza cuando esta ADELANTE. Vive aca y no en
 *  collision.js a proposito: el duelo es dueño de su propio estado y no hay forma de que un modulo
 *  de afuera le toque el `hp` (convencion 2 — cada sistema manda en lo suyo). Lo que SI comparte es
 *  el store `bullets`, que se lee y se marca igual que hace la colision con los obstaculos. */
function stepTiro() {
  // solo cuando esta adelante y en aire limpio: mientras cruza no es un blanco, es un choque
  if (C.z <= PZ + 6) return;
  for (const b of bullets) {
    if (b.z >= 999) continue;
    if (Math.abs(b.z - C.z) > 6) continue;
    if (Math.abs(b.x - C.x) > CAZA_HIT_RX || Math.abs(b.y - C.y) > CAZA_HIT_RY) continue;
    b.z = 999; C.hp++; stats.hits++;
    chispazo(C.x, C.y, C.z, 'metal');
    beep(300, 0.05, 'triangle', 0.05);
    // EL DERRIBO SE PREGUNTA PRIMERO. Si no, seria inalcanzable: el ahuyentado (6) dispara la
    // salida y el derribo (18) nunca llegaria. Asi el orden es el honesto — le seguis pegando
    // MIENTRAS huye humeando, que ademas es cuando es un blanco dificil de verdad.
    if (CAZA_KILLABLE && C.hp >= CAZA_HP.derribo) { derribar(); return; }
    if (C.hp >= CAZA_HP.ahuyenta && !C.humo) { ahuyentar(); return; }
  }
}

/** LE ROMPISTE EL ATAQUE. No lo mataste: se va humeando, y el duelo termina por donde termina
 *  siempre — la fase de salida, para que se VEA irse (§3 paso 5). */
function ahuyentar() {
  C.humo = 1;
  C.pase = CAZA_PASSES;          // aunque le queden pasadas, ya no vuelve
  ir('salida', CAZA_SALIDA_T * 1.6);   // mas larga que la normal: la huida humeando es el premio
  run.score += CAZA_PTS.ahuyenta;
  const s = proj(C.x, C.y, C.z);
  popup(s.x, s.y - 10, '+' + CAZA_PTS.ahuyenta, P.foam);
  popup(W / 2, 46, T('caza_hit'), P.foam);
  sfxOne('exSmall');
}

/** LA HAZAÑA. Ningun Harrier cayo en combate aire-aire (§2), asi que cuando pasa el juego lo grita
 *  con la receta de muerte mas cara que tiene. Termina el duelo en el acto: no hay salida que
 *  mirar, hay una bola de fuego. */
function derribar() {
  run.score += CAZA_PTS.derribo;
  const s = proj(C.x, C.y, C.z);
  popup(s.x, s.y - 10, '+' + CAZA_PTS.derribo, P.warn, true);
  popup(W / 2, 46, T('caza_kill'), P.warn);
  explodeAt(C.x, C.y, C.z, true);
  sfxOne('exHeavy');
  stats.air++;
  C.muerto = true;
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
        // AGUANTARLE LAS PASADAS TAMBIEN ES GANAR. No le pegaste un tiro y sobreviviste al evento
        // mas peligroso del pasillo: el §3 paso 5 pide racha de puntos por eso, y es coherente con
        // un juego cuya tesis es que sobrevivir abajo ya es la hazaña.
        run.score += CAZA_PTS.sobrevivir;
        popup(W / 2, 62, '+' + CAZA_PTS.sobrevivir, P.foam);
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

/** LAS PIRUETAS DE ESQUIVE FUERZAN EL SOBREPASO (§3 paso 3). El BREAK TURN, el JINK y el S-TURN son
 *  exactamente las maniobras que en la vida real obligaban al perseguidor a pasarse de largo: el
 *  que va atras lleva mas energia y no puede seguir un quiebre seco sin sobrepasarte.
 *
 *  ACA LAS MEJORAS DEL PICHON ENCUENTRAN SU PARA QUE. Hasta hoy las piruetas eran esquive de
 *  obstaculos; esta es la primera vez que una pirueta le GANA a un enemigo. Y el gate de campaña
 *  ("solo si estan aprendidas") sale gratis y sin una linea de codigo: una pirueta que no aprendiste
 *  no se puede ejecutar, asi que no puede forzar nada. */
function comboFuerza() {
  const mv = run.mv;
  const nueva = mv && mv !== C.mvPrev;
  C.mvPrev = mv;
  if (!nueva || C.fase !== 'presion') return false;
  if (!CAZA_MV_FUERZA.includes(mv)) return false;
  // se le corta la solucion: la maniobra no solo lo pasa de largo, ademas le borra la punteria
  C.sol = 0; C.grito = false;
  return true;
}

/** UN CUADRO del duelo. Devuelve `{ death }` cuando te alcanza y `undefined` mientras siga
 *  corriendo o no haya duelo. game.js decide que hacer con la señal — relevo o derrota. */
export function cazaSystem(dt) {
  if (!C) return;
  C.t += dt; C.capT += dt;
  stepSolucion(dt);
  if (comboFuerza()) { C.pase++; ir('sobrepaso', CAZA_OVER_T); golpeDelPase(); }
  stepPos(dt);
  stepFx(dt);
  stepTiro();
  // LA MUERTE VA ANTES QUE EL AVANCE DE FASE: si la rafaga te alcanzo, este cuadro ya no tiene
  // coreografia que seguir.
  //
  // Y EL DUELO TERMINA AHI, aunque le queden pasadas. Dos razones y las dos importan: cobrado el
  // golpe el Harrier rompe y se va (es lo que hacia de verdad — un pase, y control de energia),
  // y el relevo tiene que devolverte al pasillo limpio. Un duelo que sobrevive a tu propia muerte
  // le comeria al companero la ventana de gracia que el embudo de game.js garantiza.
  if (C.pegue) { C = null; return { death: 'death_caza' }; }
  if (C.muerto || avanzar()) C = null;
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
    hp: C.hp, humo: +C.humo.toFixed(2), mudo: C.mudo, manso: C.manso,
    x: +C.x.toFixed(1), y: +C.y.toFixed(1), z: +C.z.toFixed(1), lado: C.lado,
    alto: +plane.y.toFixed(1), pz: PZ,
  } : null);
}

/** Pone la solucion de tiro donde se la pida: sirve para ver la rafaga LETAL sin volar recto tres
 *  segundos y medio, que es justo lo que el duelo esta diseñado para que no hagas. */
export function setSol(v) { if (C) C.sol = v; }

/** Cuantos proyectiles APUNTADOS hay en vuelo ahora mismo. Es como el fixture distingue la rafaga
 *  de aviso (que pasa de largo por definicion) de la que viene a darte. */
export function letales() { return C ? C.fx.filter(f => f.letal).length : 0; }

/** Le mete `n` balazos al caza POR EL CAMINO DE VERDAD: empuja balas en el store y corre el mismo
 *  `stepTiro` que corre el juego. Contar `hp` a mano probaria el contador, no el sistema. */
export function pegar(n) {
  if (!C) return -1;
  for (let i = 0; i < n; i++) bullets.push({ x: C.x, y: C.y, z: C.z, life: 1 });
  // varias vueltas porque stepTiro CORTA al cruzar un umbral (ahuyentado, derribo) y deja balas sin
  // resolver: es correcto que corte, asi que el que prueba tiene que volver a llamar
  for (let i = 0; i < n + 2 && C; i++) stepTiro();
  return C ? C.hp : -1;
}

/** Corre UN paso del director con el contexto dado y `s` segundos de golpe (para saltarse el hueco
 *  entre duelos, que se mide en decenas de segundos). Devuelve si armo duelo. */
export function dirPaso(o, s) { cazaDirector(s, o); return active(); }

/** Cuantos duelos llega a armar el director en `n` oportunidades. Es como se prueba el TECHO por
 *  mision sin volar doce mil metros. */
export function dirN(o, n) {
  resetCaza();
  let k = 0;
  for (let i = 0; i < n; i++) { cazaDirector(400, o); if (C) { k++; C = null; } }
  return k;
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
