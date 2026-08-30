// PIRUETAS: la ejecucion de las maniobras de combate (catalogo en data/moves.js).
//
// Mientras run.mv esta activo, ESTE modulo es el dueño del avion: escribe vx/vy/x/y, el alabeo
// y el cabeceo, y flight.js saltea su propio bloque de control. El jugador solo conserva el eje
// que la maniobra deja libre (`steer`), a media autoridad — esta comprometido en la maniobra,
// no paseando.
//
// El TONEL (barrel roll) NO pasa por aca: conserva su camino legado (run.rollT en flight.js).
// Comparten el cooldown (run.rollCd), asi que no se encadenan tonel y pirueta sin pagar.

import { plane, cfg, S } from '../core/state.js';
import { run } from '../core/run.js';
import { parts } from '../core/world.js';
import { proj, popup } from '../core/fx.js';
import { sfxOne, beep } from './audio.js';
import { P } from '../data/palette.js';
import { PZ, W, H } from '../render/ctx.js';
import { FLY_X, FLY_TOP } from '../data/tuning.js';
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
  // decorado, no un poder que alguien haya aprendido.
  if (B === plane && !cfg.moves) return false;
  if (E.mv || E.rollT > 0 || E.rollCd > 0) return false;
  const M = MOVES[id]; if (!M) return false;
  E.mv = id; E.mvT = 0; E.mvDir = dir || 1; E.mvY0 = B.y; E.mvTgt = tgt || 0;
  E.mvRoll = 0; E.mvSteep = 0; E.mvSeed = (Math.random() * 9999) | 0;
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
      E.mvRoll = dir * th;                          // el rolido acompaña al circulo: arriba, invertido
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
      const tgt = cfg.terrain === 'sea' ? 2.4 : 1.7;
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
      E.spd = Math.max(40, E.spd - E.spd * 0.10 * dt);
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
    E.mv = null; E.mvRoll = 0; E.mvSteep = 0; E.rollCd = MV_CD;
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
    rollT: +(run.rollT || 0).toFixed(3), cd: +(run.rollCd || 0).toFixed(2),
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
  run.mv = null; run.mvT = 0; run.mvRoll = 0; run.mvSteep = 0;
  run.rollT = 0; run.rollCd = 0;
  plane.x = 0; plane.vx = 0; plane.vy = 0; plane.bank = 0; plane.pitch = 0;
  plane.y = y === undefined ? 24 : +y;
  run.spd = spd === undefined ? 78 : +spd;
  return JSON.stringify({ y: plane.y, spd: run.spd });
};
