// PIRUETAS: la ejecucion de las maniobras de combate (catalogo en data/moves.js).
//
// Mientras run.mv esta activo, ESTE modulo es el dueño del avion: escribe vx/vy/x/y, el alabeo
// y el cabeceo, y flight.js saltea su propio bloque de control. El jugador solo conserva el eje
// que la maniobra deja libre (`steer`), a media autoridad — esta comprometido en la maniobra,
// no paseando.
//
// EL TONEL TAMBIEN PASA POR ACA desde que se mudo al catalogo (data/moves.js): era la unica
// pirueta con camino propio, y esa excepcion dejaba a la primera fila del menu MANIOBRAS sin las
// otras dos presentaciones. Todas comparten el cooldown (run.rollCd): no se encadenan sin pagar.

import { plane, cfg, S } from '../core/state.js';
import { run } from '../core/run.js';
import { geoActiva, esTierraEn } from '../core/geografia.js';   // G1: agua o tierra, por punto
import { parts } from '../core/world.js';
import { proj, popup } from '../core/fx.js';
import { sfxOne, beep } from './audio.js';
import { P } from '../data/palette.js';
import { PZ, W, H } from '../render/ctx.js';
import { FLY_X, FLY_TOP, FUEL_PIRUETA, COBRA, DERRAPE, MORTAL, POPUP, PIQUE } from '../data/tuning.js';
import { MOVES } from '../data/moves.js';

const MV_CD = 1.15;          // cooldown compartido con el tonel (mismo valor que startRoll)
const STEER_F = 0.55;        // autoridad del eje libre durante la maniobra (media palanca)
// RADIO del tonel barril, en unidades de mundo. La O sube 2·R (el circulo solo puede ir hacia
// arriba, ver el case 'barrel'), asi que 9 da una trepada de 18 — bien visible sin comerse el
// techo de vuelo (FLY_TOP = 68) ni salirse del carril (FLY_X = 38).
const BARREL_R = 9;
// ASCENSO: techo de velocidad vertical de la trepada. Con 30 u/s el tramo largo —del techo del
// radar (20) al de vuelo (68)— tarda 1.6 s, que es justo lo que dura `climbmax`: la maniobra
// llega, no se queda a mitad de camino.
const CLIMB_VY = 30;

// ---------------- EL CUERPO (PLAN_MANIOBRAS_FASES M1) ----------------
// Las maniobras no son del avion del jugador: son CURVAS. Lo unico que necesitan es algo que
// tenga posicion, velocidad y actitud —un CUERPO— y algo donde anotar en que va la maniobra —un
// ESTADO—. Por omision esos dos son `plane` y `run`, o sea exactamente lo de siempre; pasando
// otros dos, la MISMA maniobra, con las mismas curvas y los mismos tiempos, la vuela otra cosa
// (un Fiel de `systems/wingmv.js`).
//
// Es toda la generalizacion de M1, y es a proposito que sea tan poca: el plan (§3.1) pide el
// minimo cambio y pone a `npm run maniobras` de testigo. Si esto hubiera sido un refactor grande,
// estaria mal encarado — lo que se queria no era otro motor, era el mismo motor apuntando a otro
// lado.
const cuerpoDe = act => (act && act.cuerpo) || plane;
const estadoDe = act => (act && act.est) || run;

/** Lanza la maniobra `id` (si se puede). `tgt` es la altura objetivo de las que trepan a un techo
 *  (ASCENSO / SOBRE EL RADAR); el resto lo ignora. Devuelve true si arranco. */
export function startMove(id, dir, tgt, act) {
  const B = cuerpoDe(act), E = estadoDe(act);
  // EL GATE `cfg.moves` ES DEL JUGADOR. Es la perilla con la que se apagan SUS poderes (banco del
  // Pichon, opciones); un Fiel que entra a hacer una pirueta en escena no depende de eso — es
  // decorado, no un poder que alguien haya aprendido. El TONEL es la excepcion (`legado`): existe
  // desde el primer dia del juego y nunca dependio de esa perilla — apagarlo con ella seria
  // quitarle al jugador algo que no eligio tener.
  if (B === plane && !cfg.moves && !MOVES[id].legado) return false;
  if (E.mv || E.rollCd > 0) return false;
  const M = MOVES[id]; if (!M) return false;
  E.mv = id; E.mvT = 0; E.mvDir = dir || 1; E.mvY0 = B.y; E.mvX0 = B.x; E.mvTgt = tgt || 0; E.mvFase = '';
  // EL PICO DE NAFTA (PLAN_MISION_CINCO_FASES §3: "si no cuestan, el jugador vuela haciendo
  // toneles"). Va ACA, en el unico lugar por donde entran TODAS las piruetas —el tonel legado
  // incluido, que llega por `startMove('tonel')`—, asi que no hay forma de estrenar una maniobra
  // nueva y olvidarse de cobrarla.
  //
  // SOLO AL JUGADOR (`B === plane`): un Fiel piruetando en una cinematica no gasta de tu tanque.
  // Y solo con COMBUSTIBLE: SI — con el tanque infinito las piruetas siguen siendo gratis, que es
  // lo que las mantiene libres en los modos donde la nafta no es el tema.
  if (B === plane && cfg.fuelOn) run.fuel = Math.max(0, run.fuel - FUEL_PIRUETA);
  E.mvRoll = 0; E.mvGiro = 0; E.mvSteep = 0; E.mvCobra = 0; E.mvMortal = 0; E.mvFreno = 0; E.mvSeed = (Math.random() * 9999) | 0;
  // feedback de entrada: nombre de la maniobra sobre el velocimetro + rafaga de aire. Es del
  // JUGADOR: el rotulo y el sonido dicen "vos hiciste esto". Un actor los apaga (`act.mudo`) o la
  // escena se llenaria de carteles anunciando piruetas que no hizo nadie.
  if (!(act && act.mudo)) {
    popup(W / 2, H - 30, M.name, P.accent);
    sfxOne('waveFly');
    beep(430, 0.14, 'triangle', 0.05, 820);
  }
  return true;
}

/** ¿Puede disparar / usar turbo ahora? (lo consultan flight.js y el HUD)
 *
 *  Estas DOS siguen preguntando por `run`, y no es un olvido de la generalizacion: la pregunta que
 *  contestan es "¿el JUGADOR puede disparar?". Un actor no dispara (regla §3.7 del plan: los
 *  actores son escena, no gameplay), asi que no tiene a quien contestarle. */
export const mvAllowsFire = () => !run.mv || MOVES[run.mv].fire;
export const mvAllowsTurbo = () => !run.mv || MOVES[run.mv].turbo;

/** ¿La maniobra activa del jugador es LEGADA (el tonel)? Lo pregunta flight.js.
 *
 *  Una maniobra normal es DUEÑA del avion: mientras dura, el bloque de control de flight.js no
 *  corre. El tonel nunca fue asi —vivia aparte y el gas seguia respondiendo durante el giro— y esa
 *  diferencia es parte de como se siente. Al mudarlo al catalogo, esta bandera es lo que la
 *  conserva: el tonel impone SOLO su rafaga lateral y el resto del avion se sigue volando. */
export const mvLegado = () => !!(run.mv && MOVES[run.mv].legado);

// ---------------- LA CAMARA DE LA COBRA (solo dibujo) ----------------
// Un resorte sobre la profundidad a la que se DIBUJA el avion: la fisica sigue en PZ. Mientras la
// trompa esta plantada el objetivo es acercarse a la camara; al bajarla el objetivo vuelve a cero y,
// como el resorte esta poco amortiguado, el avion se pasa hacia adelante y regresa — el frenazo y la
// salida. Vive aca porque es parte de la maniobra; game.js lo avanza y se lo pasa a drawPlane.
let camDz = 0, camV = 0;
export function stepCobraCam(dt) {
  // LA CAMARA-DRON (el autor, 4/10: "como un dron FPV que sigue al avion: si frena, el dron tarda un
  // poco en frenar"): el objetivo es acercarse en proporcion a CUANTO se esta frenando — sea la cobra
  // o el derrape —, y el resorte pone el retraso y el pasarse al salir.
  // EL DERRAPE SE ACERCA EN CADA FRENADA (autor, 4/10: "debe acercarse el avion en cada frenada, para
  // hacer el efecto de freno"): ahi no se mide por `mvFreno` —el patinazo frena el avance poco, y
  // acercaba casi nada— sino por la POSE del patinazo: entra de golpe al doblar, se sostiene en el
  // arrastre lento y se suelta al salir disparado (el resorte pone el pasarse hacia adelante).
  // EL MORTAL tiene su propio acercamiento, chico: el de la cobra (7.2) con el avion trepando y pasando
  // boca abajo lo ponia enorme arriba y, con el pasarse del resorte, debajo del cuadro en la bajada.
  const obj = run.mv === 'derrape' ? -DERRAPE.ACERCA * run.mvPose
    : run.mv === 'mortal' ? -MORTAL.ACERCA * run.mvFreno / MORTAL.CORTE
    : -COBRA.ACERCA * (run.mv ? run.mvFreno / COBRA.CORTE : 0);
  // ACERCANDOSE: exponencial — rapido al principio y lento en los ultimos momentos, los mas cerca de
  // la camara. VOLVIENDO: el resorte de siempre (velocidad normal y el pasarse hacia adelante). La
  // velocidad del tramo exponencial se le pasa al resorte para que el empalme no tenga salto.
  if (obj < camDz) {
    const nuevo = camDz + (obj - camDz) * Math.min(1, dt * COBRA.ENTRA);
    camV = (nuevo - camDz) / Math.max(dt, 1e-4);
    camDz = nuevo;
  } else {
    camV += ((obj - camDz) * COBRA.K - camV * COBRA.AMORT) * dt;
    camDz += camV * dt;
  }
  if (Math.abs(camDz) < 0.01 && Math.abs(camV) < 0.01 && !run.mv) camDz = camV = 0;
  stepDerrapeCam(dt);
}
export const cobraDz = () => camDz;

// LA CAMARA SE QUEDA QUIETA EN EL DERRAPE (4/10). En vuelo la camara persigue 0,86 de la x del avion
// (systems/vuelo.js), y con eso los cruces de borde a borde casi no se veian: corria el MUNDO, no el
// avion. Mientras dura el derrape sigue solo DERRAPE.CAM_SIGUE, asi la moto de agua cruza la pantalla
// de punta a punta; entra y sale suave (CAM_RATE) para que la vuelta al encuadre no sea un salto.
let camLib = 0;
function stepDerrapeCam(dt) {
  camLib += ((run.mv === 'derrape' ? 1 : 0) - camLib) * Math.min(1, dt * DERRAPE.CAM_RATE);
  if (camLib < 0.002 && run.mv !== 'derrape') camLib = 0;
}
/** lo que se corre el objetivo de la camara (se suma al `lead` del vuelo): de 0,86·x a CAM_SIGUE·x.
 *  Mas la ANTICIPACION: la camara persigue con un lerp de 7/s (systems/vuelo.js), y a 150 u/s eso la
 *  deja ~16 u atras — medido en captura, el avion se iba contra el borde de la pantalla y el abanico
 *  quedaba afuera. Sumarle vx/7 al objetivo cancela ese atraso solo mientras dura el derrape. */
export const derrapeLead = () => camLib
  ? (plane.x * (DERRAPE.CAM_SIGUE - 0.86) + plane.vx * DERRAPE.CAM_SIGUE / 7) * camLib : 0;

/** EL PERFIL DE LA VUELTA DEL MORTAL: grados para una fraccion p de la maniobra, por tramos de Hermite
 *  entre los puntos de MORTAL.VUELTA ([p, grados, pendiente]). */
function vueltaMortal(p) {
  const K = MORTAL.VUELTA;
  if (p <= 0) return 0;
  for (let i = 0; i < K.length - 1; i++) {
    const [p0, g0, m0] = K[i], [p1, g1, m1] = K[i + 1];
    if (p > p1 && i < K.length - 2) continue;
    const h = p1 - p0, t = Math.min(1, (p - p0) / h), t2 = t * t, t3 = t2 * t;
    return (2 * t3 - 3 * t2 + 1) * g0 + (t3 - 2 * t2 + t) * h * m0 + (-2 * t3 + 3 * t2) * g1 + (t3 - t2) * h * m1;
  }
  return 360;
}

// perfil suave 0→1→0 (campana) — la base de los empujes que entran y salen con peso
const bell = p => Math.sin(Math.PI * Math.max(0, Math.min(1, p)));

/** Un frame de la maniobra activa. flight.js lo llama ANTES de su bloque de control y, si hay
 *  maniobra, saltea el suyo. Integra vx/vy pero NO la posicion: eso sigue en flight.js (asi los
 *  topes de FLY_X/FLY_TOP y el roce funcionan igual que siempre). */
export function movesSystem(dt, inp, act) {
  const B = cuerpoDe(act), E = estadoDe(act);
  if (!E.mv) return;
  const M = MOVES[E.mv];
  E.mvT += dt;
  const p = E.mvT / M.dur;
  const dir = E.mvDir;

  // el eje libre: media palanca sobre lo que la maniobra impone
  const sx = M.steer === 'x' ? (inp.r - inp.l) * 30 * STEER_F : 0;
  const sy = M.steer === 'y' ? (inp.u - inp.d) * 14 * STEER_F : 0;
  // DERIVA DEL ROLIDO (ver `drift` en data/moves.js): el avion se va hacia el lado que rola.
  // Campana: cero al entrar y al salir, pico en el medio — asi la maniobra no arranca ni termina
  // con un tiron lateral, y no deja velocidad colgada al devolver el control.
  const drift = M.drift ? dir * M.drift * bell(p) : 0;

  switch (E.mv) {
    case 'splits': {
      // ENTRADA (0-28 %): medio tonel hasta quedar invertido.
      // PICADA  (28-62 %): panza arriba, cae y CONVIERTE altura en velocidad.
      // SALIDA  (62-100 %): completa el tonel y endereza.
      //
      // LA SALIDA ES LA FASE MAS LARGA, a proposito. Antes duraba 0.14 s contra 0.28 s de la
      // entrada: el avion se daba vuelta al DOBLE de velocidad de la que se habia invertido y
      // el enderezado se leia como un tiron. Ahora sale mas lento de lo que entro, que es como
      // se recupera de verdad.
      //
      // Las dos medias vueltas van con SMOOTHSTEP: la velocidad angular arranca y termina en
      // cero, asi el giro entra y sale sin golpe. Con la rampa lineal de antes, el alabeo se
      // frenaba de golpe justo al llegar a la horizontal.
      const ss = t => { const c = Math.max(0, Math.min(1, t)); return c * c * (3 - 2 * c); };
      if (p < 0.28) { E.mvRoll = dir * ss(p / 0.28) * Math.PI; B.vy *= 0.8; E.mvSteep = 0; }
      else if (p < 0.62) {
        E.mvRoll = dir * Math.PI; E.mvSteep = -1;
        B.vy = Math.max(-26, B.vy - 130 * dt);
        E.spd += 26 * dt;
        if (B.y < 3) { B.vy = Math.max(B.vy, 0); E.mvT = Math.max(E.mvT, M.dur * 0.62); }  // piso: endereza ya
      } else { E.mvRoll = dir * (Math.PI + ss((p - 0.62) / 0.38) * Math.PI); E.mvSteep = 0; B.vy *= 0.6; }
      B.vx = sx + drift; B.bank = 0; B.pitch = p > 0.28 && p < 0.62 ? -1 : 0;
      break;
    }
    case 'tonel': {
      // EL TONEL clasico (aileron roll): rola 360° en el lugar con una RAFAGA LATERAL que decae.
      // Es la maniobra original del juego y esta es su curva de siempre, movida tal cual desde
      // flight.js: `40 · (0.45 + restante/dur)` — empuja fuerte al entrar y se va apagando.
      // Escrita con el tiempo TRANSCURRIDO (p) en vez del restante, que es la convencion de este
      // modulo; `0.45 + (1 - p)` es la misma recta.
      B.vx = dir * 40 * (0.45 + (1 - p));
      // GIRA EL AVION, NO EL MUNDO (autor, 4/10: "que no gire el mundo, solo el avion en su eje, y el
      // mundo y la camara queden fijos"): el giro va a `mvGiro`, que es SOLO DEL DIBUJO — `mvRoll` lo
      // toma el horizonte giratorio y daba vuelta el mundo entero con el avion derecho.
      E.mvRoll = 0;
      E.mvGiro = dir * p * Math.PI * 2;
      B.bank = 0; B.pitch = 0;
      break;
    }
    case 'spin': {
      // TIRABUZON: rola 360° sobre su propio eje mientras pica. Sigue siendo la mas axial de las
      // tres que giran —el tonel clasico lleva un dash de costado y el barril describe un circulo
      // entero— pero ya no se queda clavada en el carril: se va la mitad que el split-s.
      E.mvRoll = dir * p * Math.PI * 2;
      B.vx = drift;                               // se va hacia el lado que rola (ver `drift`)
      B.vy = -20 * Math.sin(Math.PI * p) - 4;     // pica con panza (entra y sale suave)
      if (B.y < 3.5 && B.vy < 0) B.vy = 0;   // piso de seguridad
      E.spd += 30 * dt * bell(p);                   // la picada paga velocidad
      B.bank = 0; B.pitch = -0.8;
      E.mvSteep = -1;
      break;
    }
    case 'cobra': {
      // LA COBRA, EL FRENO. Tres tiempos: la trompa SUBE hasta pasar la vertical, la panza queda
      // PLANTADA contra el aire con la turbina a fondo empujando para atras —ahi se pierde la
      // velocidad—, y BAJA de vuelta a nivel. La pose la lee el render (`mvCobra`, hoja 4).
      const ss = t => { const c = Math.max(0, Math.min(1, t)); return c * c * (3 - 2 * c); };
      // la trompa sube RAPIDO y frena al llegar (1−(1−x)²), se sostiene, y baja suave
      E.mvCobra = p < COBRA.SUBE ? 1 - Math.pow(1 - p / COBRA.SUBE, 2) : p < COBRA.BAJA ? 1 : 1 - ss((p - COBRA.BAJA) / (1 - COBRA.BAJA));
      E.mvFreno = COBRA.CORTE * E.mvCobra;
      // EL FRENO es proporcional a cuanta panza le mostras al aire: nada al arrancar, todo plantado.
      // Escribe `spd` como el split-S; flight.js lo devuelve despues al crucero con su arrastre de
      // siempre, asi que la velocidad perdida se recupera de a poco y no de golpe.
      E.spd *= Math.exp(-COBRA.FRENO * E.mvCobra * dt);
      // se SIENTA: sube apenas, no pierde altura (es lo que la hace un freno y no una trepada)
      B.vy = COBRA.SUBE_VY * E.mvCobra;
      B.vx *= Math.max(0, 1 - dt * 4);
      B.bank = 0; B.pitch = Math.min(1, E.mvCobra * 1.5);
      // la turbina a fondo contra el freno: tiembla todo
      if (B === plane && E.mvCobra > 0.6) run.shake = Math.min(5, run.shake + dt * 9);
      break;
    }
    case 'mortal': {
      // EL MORTAL HACIA ATRAS (el Kulbit): la cobra que no se detiene en la vertical. La trompa sube, pasa
      // la vertical, sigue de espaldas, cruza BOCA ABAJO arriba de todo —ahi frena a fondo y la camara-dron
      // se le viene encima— y baja picando hasta nivelar. La vuelta es un perfil suave (despacio al
      // levantar y al nivelar, rapido arriba) — desde el 4/10 al reves: RAPIDO al levantar, LENTO
      // sobre lo alto, normal al bajar (MORTAL.VUELTA); la altura sigue a la vuelta: (1−cos θ)/2 de SUBE, asi
      // vuelve a la altura de la que salio. La pose la lee el render (`mvMortal`, hoja 4 extendida).
      const g = vueltaMortal(p);
      const th = g * Math.PI / 180;
      E.mvMortal = Math.min(360, g);
      // EL FRENO DE LA COBRA, en la PANZA AL SOL (MORTAL.FRENA): entra mientras la trompa sube, pleno
      // con la panza plantada contra el aire, y se suelta al seguir la vuelta.
      const [f0, f1, f2, f3] = MORTAL.FRENA;
      const sm = x => { const c = Math.max(0, Math.min(1, x)); return c * c * (3 - 2 * c); };
      const freno = sm((g - f0) / (f1 - f0)) * (1 - sm((g - f2) / (f3 - f2)));
      E.mvFreno = MORTAL.CORTE * freno;
      E.spd *= Math.exp(-MORTAL.FRENO * freno * dt);
      const yObj = E.mvY0 + MORTAL.SUBE * Math.pow((1 - Math.cos(th)) / 2, MORTAL.FORMA);
      B.vy = (yObj - B.y) / Math.max(dt, 1 / 240);
      B.vx *= Math.max(0, 1 - dt * 4);
      B.bank = 0; B.pitch = 0;
      if (B === plane && freno > 0.6) run.shake = Math.min(5, run.shake + dt * 7);
      break;
    }
    case 'derrape': {
      // LA MOTO DE AGUA (autor, 4/10: "que se comporte como una moto de agua al ras del mar… el derrape
      // de una moto de agua con ese efecto"). Lo de antes eran posiciones suavizadas: llegaba al borde
      // ya frenado y recien ahi ponia la pose — quieto, sin patinar. Una moto de agua dobla CON la
      // velocidad encima: tira la cola para afuera, la trompa ya mira para el otro lado y el casco SIGUE
      // DE COSTADO por la inercia, frenando contra el agua y tirandola en abanico; cuando se le acaba
      // el patinazo ya esta saliendo disparada para el otro lado. Por eso aca manda la velocidad
      // lateral, no la posicion (DERRAPE en data/tuning.js cuenta las tres fases).
      const D = DERRAPE, X = FLY_X * D.BORDE;
      if (!E.mvFase) { E.mvFase = 'carva'; E.mvCanto = 0; E.mvPose = 0; E.mvLado = dir; }
      const hacia = dir * (E.mvCanto % 2 === 0 ? 1 : -1);      // el borde al que va
      const falta = (hacia * X - B.x) * hacia;                  // lo que le queda hasta ese borde (u)
      const v = B.vx * hacia;                                    // lo que va hacia ese borde (u/s)
      // lo que correria de costado si dobla ya, frenando contra el agua (DESACEL + ROCE·v)
      const patinaDe = w => w > 0 ? w / D.ROCE - D.DESACEL / (D.ROCE * D.ROCE) * Math.log(1 + D.ROCE * w / D.DESACEL) : 0;
      const patina = patinaDe(v);
      const acerca = (a, b, r) => a + (b - a) * Math.min(1, r * dt);
      let poseObj = 0, bankObj = 0, canto = 0;
      if (E.mvFase === 'carva') {
        // acelera hacia el borde inclinado hacia donde va; justo antes de doblar se pone DERECHO.
        // CADA ZIGZAG MAS LENTO que el anterior (autor, 4/10: "reduce velocidad entre zigzag y zigzag
        // hasta reducir la velocidad"): el tope cae MENGUA por canto — va frenando de a escalones.
        const vmax = D.VMAX * Math.pow(D.MENGUA, E.mvCanto);
        B.vx = Math.max(-vmax, Math.min(vmax, B.vx + hacia * D.ACEL * dt));
        bankObj = falta - patina < D.ENDEREZA_U ? 0 : hacia * D.BANK_CRUCE;
        // DOBLA cuando lo que patinaria (ya con la velocidad de este cuadro) llega justo al borde
        const v1 = B.vx * hacia;
        if (v1 > 0 && patinaDe(v1) >= falta) { E.mvFase = 'derrapa'; E.mvLado = hacia; }
      } else if (E.mvFase === 'derrapa') {
        // DE COSTADO: la cola contra el borde, la trompa al centro de arriba, y la inercia lo sigue
        // llevando mientras el agua le come la velocidad lateral: de golpe al principio y despues se
        // arrastra despacio — el freno lento. `canto` va con la raiz para que el arrastre siga mojando.
        poseObj = 1;
        B.vx -= hacia * Math.min(Math.max(0, v), (D.DESACEL + D.ROCE * Math.max(0, v)) * dt);
        canto = Math.sqrt(Math.max(0, Math.min(1, v / D.VMAX)));
        if (B.vx * hacia <= 0) {                                 // se acabo el patinazo
          E.mvCanto++;
          E.mvFase = E.mvCanto >= D.CANTOS ? 'fin' : 'carva';    // …y ya sale para el otro lado
        }
      } else {
        // EL FINAL: se queda del lado pedido, suelta la pose y devuelve el avion
        B.vx *= Math.max(0, 1 - dt * 8);
        if (E.mvPose < 0.04) E.mvT = M.dur;                      // termina (el cierre de abajo lo limpia)
      }
      E.mvPose = acerca(E.mvPose, poseObj, poseObj > E.mvPose ? D.ATAQUE : D.SUELTA);
      B.bank = acerca(B.bank, bankObj, D.BANK_RATE);
      // EL GIRO ES DEL DIBUJO (`mvGiro`), no un rolido: con el horizonte giratorio, `mvRoll` lo toma el
      // MUNDO y el avion queda derecho — medido en captura, se inclinaba el horizonte y no el avion.
      // Contra el borde derecho es antihorario: la trompa mira a la izquierda, la turbina abajo a la derecha.
      E.mvRoll = 0;
      E.mvGiro = -E.mvLado * D.GIRA * E.mvPose;
      E.mvCobra = D.COBRA * E.mvPose;
      // el patinazo frena el avance; el ultimo, el freno chico
      const fin = E.mvCanto >= D.CANTOS - 1;
      E.spd *= Math.exp(-D.FRENO * canto * (fin ? D.FRENO_FINAL : 1) * dt);
      E.mvFreno = D.CORTE * canto * (fin ? D.FRENO_FINAL : 1);
      B.vy *= Math.max(0, 1 - dt * 6); B.pitch = 0;
      // UN PISO, como el del masking: el derrape es para hacerlo PEGADO AL AGUA (ahi salpica), y sin
      // control no se puede salir del roce — medido, a 2,3 las olas lo mataban en pleno zigzag. Lo
      // sostiene apenas arriba de la cresta; mas alto, no toca nada.
      const agua = geoActiva() ? !esTierraEn(B.x, run.dist + PZ) : cfg.terrain === 'sea';
      const piso = agua ? 2.8 : 2.2;
      if (B.y < piso) B.vy = Math.max(B.vy, (piso - B.y) * 6);
      if (B === plane) E.scrapeT = 0;
      // LAS GOTAS DEL ABANICO (el abanico lo dibuja render/plane.js): salen hacia ADELANTE y HACIA
      // ADENTRO —hacia donde ya mira la trompa— y ACOMPAÑAN al avion: llevan entera su velocidad en
      // pantalla, asi no quedan atras cuando sale disparado para el otro lado (el autor, 4/10).
      // GORDAS y sin partir (`fino`): partidas en tres se perdian como polvo.
      const kk = B.y < D.SPRAY_ALT ? canto * (1 - B.y / D.SPRAY_ALT) : 0;
      if (B === plane) run.derrapeAgua = agua ? kk : 0;          // la estela lo marca como patinazo
      if (B === plane && kk > 0.05) {
        const adentro = -E.mvLado, f60 = dt * 60;
        const sp0 = proj(B.x, 0, PZ);
        const acompana = B.vx * sp0.k * (1 - D.CAM_SIGUE);
        const color = () => agua ? (Math.random() < 0.45 ? '#f4fbff' : Math.random() < 0.6 ? P.foam : P.crest)
          : (Math.random() < 0.5 ? '#6b5638' : '#8c7856');
        const tira = (n, fn) => { for (let i = 0, m = Math.floor(n + Math.random()); i < m; i++) parts.push(fn()); };
        tira(D.SPRAY_N * kk * f60, () => {
          const sp = proj(B.x + adentro * Math.random() * 1.5, PIQUE.Y, PZ + Math.random() * 1.5);
          return { x: sp.x, y: sp.y, vx: adentro * (20 + Math.random() * 80) * (0.5 + kk) + acompana,
            vy: -(60 + Math.random() * 90) * (0.55 + 0.6 * kk), life: 0.5 + Math.random() * 0.4,
            r: Math.max(2, sp.k * (0.2 + Math.random() * 0.12)), c: color(), fondo: !agua, fino: true };
        });
      }
      break;
    }
    case 'barrel': {
      // TONEL BARRIL de verdad (el clasico 'barrel roll' del juego es en realidad un aileron
      // roll: gira en el lugar). Este describe una O GRANDE en el plano de la pantalla —
      // se abre hacia un lado, sube, pasa BOCA ABAJO por arriba y vuelve por el otro lado al
      // punto de partida — mientras rola 360°, asi la cola nunca deja de mirar a la camara.
      //
      // Se programa como CIRCULO: x = R·sen(θ), y = y0 + R·(1−cos θ). Por eso solo puede SUBIR
      // (1−cos va de 0 a 2): arranque donde arranque, nunca se mete contra el suelo.
      const th = p * Math.PI * 2;
      const w = Math.PI * 2 / M.dur;                  // velocidad angular del circulo
      B.vx = dir * BARREL_R * Math.cos(th) * w;
      B.vy = BARREL_R * Math.sin(th) * w;
      // el rolido acompaña al circulo (arriba, invertido) — SOLO EN EL DIBUJO, como el tonel (4/10):
      // el mundo y la camara quedan fijos
      E.mvRoll = 0;
      E.mvGiro = dir * th;
      B.bank = 0; B.pitch = 0;
      E.spd = Math.max(40, E.spd - E.spd * 0.09 * dt);   // el circulo cuesta energia
      break;
    }
    case 'breakt': {
      // tiron lateral violento que decae; banqueo clavado a fondo y un extra de rotacion
      B.vx = dir * 58 * (1 - p * 0.55);
      B.vy = sy;
      B.bank = dir; B.pitch = 0;
      E.mvRoll = dir * 0.3 * bell(p);
      E.spd = Math.max(40, E.spd - E.spd * 0.16 * dt);
      break;
    }
    case 'hiyo': {
      // sube y recae sobre la misma altura: campana de vy positiva→negativa. Sangra velocidad.
      B.vy = 21 * Math.cos(Math.PI * p);
      B.vx = sx; B.bank = B.vx / 40; B.pitch = Math.cos(Math.PI * p);
      E.mvSteep = p < 0.4 ? 1 : p > 0.6 ? -1 : 0;
      E.spd = Math.max(40, E.spd - E.spd * 0.14 * dt);
      break;
    }
    case 'loyo': {
      // pica y remonta: la inversa del high yo-yo — GANA velocidad (energia por altura)
      B.vy = -19 * Math.cos(Math.PI * p);
      if (B.y < 2.2 && B.vy < 0) B.vy = 0;          // piso de seguridad
      B.vx = sx; B.bank = B.vx / 40; B.pitch = -Math.cos(Math.PI * p);
      E.mvSteep = p < 0.4 ? -1 : p > 0.6 ? 1 : 0;
      E.spd += 34 * dt * bell(p);
      break;
    }
    case 'jink': {
      // 4 quiebres ALTERNADOS (si no alternan, el jink deriva para un lado y es un dash); lo
      // aleatorio son el lado inicial (mvDir del combo) y la fuerza de cada quiebre (semilla).
      //
      // CONTINUIDAD. Antes B.vx se CLAVABA en el valor del quiebre, asi que cuatro veces por
      // maniobra la velocidad lateral saltaba de golpe ~90 u/s y el avion se teletransportaba de
      // costado. Ahora el quiebre es un objetivo que se PERSIGUE con aceleracion limitada: la
      // velocidad lateral queda continua y el gesto se lee como un latigazo en vez de un corte.
      //
      // Y escala con la VELOCIDAD REAL del avion: mas rapido = mas recorrido lateral y mas
      // autoridad para cambiarlo. Un jink a 40 u/s es suave; a 110 es violento. La proporcion
      // entre `amp` y `rate` esta elegida para que el barrido tarde ~un segmento a cualquier
      // velocidad — asi el ritmo de la maniobra no cambia, solo su amplitud.
      const seg = Math.min(3, (p * 4) | 0);
      const sgn = E.mvDir * (seg % 2 ? -1 : 1);
      const amp = 22 + E.spd * 0.34 + ((E.mvSeed + seg * 31) % 9);
      const rate = 320 + E.spd * 2.9;                    // u/s²: cuanto puede cambiar vx por segundo
      const tgt = sgn * amp;
      B.vx += Math.max(-rate * dt, Math.min(rate * dt, tgt - B.vx));
      // bamboleo vertical suave (antes eran 5 Hz de temblor, que era la mitad de lo "brusco")
      B.vy += (Math.sin(E.mvT * 9 + E.mvSeed) * 3 - B.vy) * Math.min(1, dt * 6);
      B.bank = Math.max(-1, Math.min(1, B.vx / Math.max(18, amp)));   // el alabeo sigue a vx real
      B.pitch = 0;
      break;
    }
    case 'sturn': {
      // barrido en S: seno completo — se abre, cruza y VUELVE al carril
      B.vx = dir * 52 * Math.sin(2 * Math.PI * p);
      B.vy = sy;
      B.bank = Math.max(-1, Math.min(1, B.vx / 34)); B.pitch = 0;
      break;
    }
    case 'mask': {
      // clavado al terreno: baja rapido a la banda rasante y se QUEDA ahi. Congela el reloj
      // del roce (es la maniobra "pro" de volar pegado) y DESCARGA el radar enemigo.
      const tgt = (geoActiva() ? !esTierraEn(plane.x, run.dist + PZ) : cfg.terrain === 'sea') ? 2.4 : 1.7;
      B.vy = (tgt - B.y) * 6;
      B.vx = sx * 1.6;                                       // lateral CASI pleno: esquivas a ras
      B.bank = B.vx / 40; B.pitch = B.y > tgt + 2 ? -0.6 : 0;
      E.scrapeT = 0;
      E.detection = Math.max(0, E.detection - dt * 0.85);
      break;
    }
    case 'popup': {
      // trepada brusca de ataque: empuje grande que se agota — sale disparado y se asienta
      B.vy = 30 * (1 - p);
      B.vx = sx; B.bank = B.vx / 40; B.pitch = 1;
      E.mvSteep = p < 0.75 ? 1 : 0;
      // …y con la trompa arriba FRENA UN POCO, como una cobra chica (POPUP, autor 4/10): `mvFreno`
      // baja el objetivo de velocidad y acerca la camara-dron; al soltar, el resorte la devuelve.
      const ssP = x => { const c = Math.max(0, Math.min(1, x)); return c * c * (3 - 2 * c); };
      const frenoP = ssP(p / POPUP.ENTRA) * (1 - ssP((p - POPUP.SUELTA) / (0.75 - POPUP.SUELTA)));
      E.mvFreno = POPUP.CORTE * frenoP;
      E.spd = Math.max(40, E.spd * Math.exp(-POPUP.FRENO * frenoP * dt) - E.spd * 0.10 * dt);
      break;
    }
    case 'climb': case 'climbmax': {
      // ASCENSOR: la misma cinematica del TERRAIN MASKING pero hacia arriba y contra un techo que
      // no es fijo (E.mvTgt). Persigue la altura y SE QUEDA — el tope de vy es lo unico que la
      // separa de un teletransporte, y es lo que hace que se lea como una trepada.
      B.vy = Math.max(-20, Math.min(CLIMB_VY, (E.mvTgt - B.y) * 3.2));
      B.vx = sx * 1.6;                                       // lateral CASI pleno, como el mask
      B.bank = B.vx / 40;
      B.pitch = B.y < E.mvTgt - 2 ? 1 : 0;
      E.mvSteep = B.y < E.mvTgt - 4 ? 1 : 0;
      E.spd = Math.max(40, E.spd - E.spd * 0.13 * dt);     // trepar CUESTA energia
      break;
    }
  }

  // estelas de viento de la maniobra (las mismas del tonel): venden el tiron
  if (Math.random() < 0.6) {
    // …y salen del CUERPO que la esta volando, a SU profundidad: un actor vuela mas lejos que el
    // jugador (`B.z`), y con PZ clavado su viento aparecia pegado a la camara, delante de todo.
    const sp = proj(B.x + (Math.random() - 0.5) * 3, B.y + (Math.random() - 0.5) * 2, B.z === undefined ? PZ : B.z);
    parts.push({
      x: sp.x, y: sp.y, vx: -B.vx * (1.2 + Math.random()), vy: (Math.random() - 0.5) * 24,
      life: 0.3, c: P.crest, r: 1,
    });
  }

  // TOPES DEL CARRIL (los mismos de flight.js, por si el empuje lateral pega en el borde) — y son
  // del carril DEL JUGADOR, que es lo que FLY_X/FLY_TOP significan: hasta aca llega la zona
  // jugable. Un actor entra DESDE AFUERA de ese carril (esa es toda la gracia de que entre de
  // costado), asi que aplicarselos lo teletransportaria al borde en su primer cuadro.
  if (B === plane) {
    if (B.x < -FLY_X) { B.x = -FLY_X; if (B.vx < 0) B.vx = 0; }
    if (B.x > FLY_X) { B.x = FLY_X; if (B.vx > 0) B.vx = 0; }
    if (B.y > FLY_TOP) { B.y = FLY_TOP; if (B.vy > 0) B.vy = 0; }
  }

  if (E.mvT >= M.dur) {                       // fin: devuelve el avion y arranca el cooldown
    E.mv = null; E.mvRoll = 0; E.mvGiro = 0; E.mvSteep = 0; E.mvCobra = 0; E.mvMortal = 0; E.mvFreno = 0; E.rollCd = MV_CD;
    E.mvFase = ''; E.mvPose = 0;
    if (B === plane) run.derrapeAgua = 0;
    B.pitch = Math.max(-1, Math.min(1, B.pitch));
  }
}

// ---------------- SONDAS (QUITAR antes de publicar) ----------------
// LA VARA DE LAS MANIOBRAS (PLAN_MANIOBRAS_FASES M0). `__mv` (game.js) DISPARA; esto MIRA.
//
// Una pirueta dura entre 0,7 y 2 s y durante todo ese tiempo ESTE modulo es dueño del avion. Sin
// una foto por cuadro, "el SPLIT-S sale sano" es una opinion: la maniobra pasa, el avion queda
// volando, y si dejo la velocidad en cero o el cabeceo colgado nadie se entera hasta que se juega.
//
// La foto trae junto lo que el motor ESCRIBE y lo que el catalogo DECLARA (`dur`, `steer`, `fire`,
// `turbo`), a proposito: asi el fixture compara una cosa contra la otra sin tener que copiarse el
// catalogo — el dia que una maniobra cambie de duracion, la vara la sigue sola.
// QUITAR — EL CATALOGO tal cual esta en memoria. El fixture compara lo que la maniobra HACE
// contra lo que DECLARA, y esa declaracion tiene que salir del objeto vivo y no de una copia en el
// fixture: una copia se desincroniza el dia que alguien cambia un `dur`, y lo hace en silencio.
if (typeof window !== 'undefined') window.__mvcat = () => JSON.stringify(MOVES);

if (typeof window !== 'undefined') window.__mvdbg = () => {
  const M = run.mv ? MOVES[run.mv] : null;
  return JSON.stringify({
    mv: run.mv || null, t: +(run.mvT || 0).toFixed(3), dur: M ? M.dur : 0,
    steer: M ? (M.steer || null) : null, fire: M ? !!M.fire : null,
    turbo: M ? !!M.turbo : null, tight: !!(M && M.tight),
    // lo que el resto del juego PREGUNTA (flight.js y el HUD llaman a estas dos, no al catalogo)
    puedeFuego: mvAllowsFire(), puedeTurbo: mvAllowsTurbo(),
    roll: +(run.mvRoll || 0).toFixed(3), steep: run.mvSteep || 0,
    cd: +(run.rollCd || 0).toFixed(2),
    x: +plane.x.toFixed(2), y: +plane.y.toFixed(2),
    vx: +plane.vx.toFixed(2), vy: +plane.vy.toFixed(2),
    bank: +plane.bank.toFixed(3), pitch: +plane.pitch.toFixed(3),
    spd: +run.spd.toFixed(2),
    // EL ESTADO DEL JUEGO viaja con la foto a proposito: una maniobra que "no termina" porque el
    // avion choco y el juego paso a 'relevo' no es un bug de la maniobra, y sin este campo las dos
    // cosas se leen igual desde afuera.
    estado: S.state,
  });
};

// QUITAR — deja el avion listo para la SIGUIENTE pirueta: corta la que corre, limpia el cooldown
// que el tonel y las piruetas comparten, y lo devuelve a una altura y una velocidad de crucero.
//
// Sin esto el catalogo no se puede recorrer de una pasada: la 2ª maniobra heredaria el estado de
// la 1ª —y el cooldown la rechazaria— asi que lo que se estaria midiendo seria la resaca, no la
// maniobra. Es de la MISMA familia que `__qhold` del PULSO: no cambia una regla, saca de en medio
// una que existe para el jugador y no para el que mide.
if (typeof window !== 'undefined') window.__mvreset = (y, spd) => {
  run.mv = null; run.mvT = 0; run.mvRoll = 0; run.mvGiro = 0; run.mvSteep = 0; run.mvCobra = 0; run.mvFreno = 0;
  run.mvFase = ''; run.mvPose = 0; run.derrapeAgua = 0; run.mvMortal = 0;
  run.rollCd = 0;
  plane.x = 0; plane.vx = 0; plane.vy = 0; plane.bank = 0; plane.pitch = 0;
  plane.y = y === undefined ? 24 : +y;
  run.spd = spd === undefined ? 78 : +spd;
  return JSON.stringify({ y: plane.y, spd: run.spd });
};
