// PIRUETAS: la ejecucion de las maniobras de combate (catalogo en data/moves.js).
//
// Mientras run.mv esta activo, ESTE modulo es el dueño del avion: escribe vx/vy/x/y, el alabeo
// y el cabeceo, y flight.js saltea su propio bloque de control. El jugador solo conserva el eje
// que la maniobra deja libre (`steer`), a media autoridad — esta comprometido en la maniobra,
// no paseando.
//
// El TONEL (barrel roll) NO pasa por aca: conserva su camino legado (run.rollT en flight.js).
// Comparten el cooldown (run.rollCd), asi que no se encadenan tonel y pirueta sin pagar.

import { plane, cfg } from '../core/state.js';
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

/** Lanza la maniobra `id` (si se puede). Devuelve true si arranco. */
export function startMove(id, dir) {
  if (!cfg.moves || run.mv || run.rollT > 0 || run.rollCd > 0) return false;
  const M = MOVES[id]; if (!M) return false;
  run.mv = id; run.mvT = 0; run.mvDir = dir || 1; run.mvY0 = plane.y;
  run.mvRoll = 0; run.mvSteep = 0; run.mvSeed = (Math.random() * 9999) | 0;
  // feedback de entrada: nombre de la maniobra sobre el velocimetro + rafaga de aire
  popup(W / 2, H - 30, M.name, P.accent);
  sfxOne('waveFly');
  beep(430, 0.14, 'triangle', 0.05, 820);
  return true;
}

/** ¿Puede disparar / usar turbo ahora? (lo consultan flight.js y el HUD) */
export const mvAllowsFire = () => !run.mv || MOVES[run.mv].fire;
export const mvAllowsTurbo = () => !run.mv || MOVES[run.mv].turbo;

// perfil suave 0→1→0 (campana) — la base de los empujes que entran y salen con peso
const bell = p => Math.sin(Math.PI * Math.max(0, Math.min(1, p)));

/** Un frame de la maniobra activa. flight.js lo llama ANTES de su bloque de control y, si hay
 *  maniobra, saltea el suyo. Integra vx/vy pero NO la posicion: eso sigue en flight.js (asi los
 *  topes de FLY_X/FLY_TOP y el roce funcionan igual que siempre). */
export function movesSystem(dt, inp) {
  if (!run.mv) return;
  const M = MOVES[run.mv];
  run.mvT += dt;
  const p = run.mvT / M.dur;
  const dir = run.mvDir;

  // el eje libre: media palanca sobre lo que la maniobra impone
  const sx = M.steer === 'x' ? (inp.r - inp.l) * 30 * STEER_F : 0;
  const sy = M.steer === 'y' ? (inp.u - inp.d) * 14 * STEER_F : 0;

  switch (run.mv) {
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
      if (p < 0.28) { run.mvRoll = dir * ss(p / 0.28) * Math.PI; plane.vy *= 0.8; run.mvSteep = 0; }
      else if (p < 0.62) {
        run.mvRoll = dir * Math.PI; run.mvSteep = -1;
        plane.vy = Math.max(-26, plane.vy - 130 * dt);
        run.spd += 26 * dt;
        if (plane.y < 3) { plane.vy = Math.max(plane.vy, 0); run.mvT = Math.max(run.mvT, M.dur * 0.62); }  // piso: endereza ya
      } else { run.mvRoll = dir * (Math.PI + ss((p - 0.62) / 0.38) * Math.PI); run.mvSteep = 0; plane.vy *= 0.6; }
      plane.vx = sx; plane.bank = 0; plane.pitch = p > 0.28 && p < 0.62 ? -1 : 0;
      break;
    }
    case 'spin': {
      // TIRABUZON: rola 360° SOBRE SU PROPIO EJE mientras pica derecho — sin desvio lateral.
      // Es la unica maniobra puramente axial: el tonel clasico lleva un dash de costado y el
      // barril describe un circulo; esta se queda en su carril y baja girando.
      run.mvRoll = dir * p * Math.PI * 2;
      plane.vx = 0;                                   // NADA de lateral: ese es el punto
      plane.vy = -20 * Math.sin(Math.PI * p) - 4;     // pica con panza (entra y sale suave)
      if (plane.y < 3.5 && plane.vy < 0) plane.vy = 0;   // piso de seguridad
      run.spd += 30 * dt * bell(p);                   // la picada paga velocidad
      plane.bank = 0; plane.pitch = -0.8;
      run.mvSteep = -1;
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
      plane.vx = dir * BARREL_R * Math.cos(th) * w;
      plane.vy = BARREL_R * Math.sin(th) * w;
      run.mvRoll = dir * th;                          // el rolido acompaña al circulo: arriba, invertido
      plane.bank = 0; plane.pitch = 0;
      run.spd = Math.max(40, run.spd - run.spd * 0.09 * dt);   // el circulo cuesta energia
      break;
    }
    case 'breakt': {
      // tiron lateral violento que decae; banqueo clavado a fondo y un extra de rotacion
      plane.vx = dir * 58 * (1 - p * 0.55);
      plane.vy = sy;
      plane.bank = dir; plane.pitch = 0;
      run.mvRoll = dir * 0.3 * bell(p);
      run.spd = Math.max(40, run.spd - run.spd * 0.16 * dt);
      break;
    }
    case 'hiyo': {
      // sube y recae sobre la misma altura: campana de vy positiva→negativa. Sangra velocidad.
      plane.vy = 21 * Math.cos(Math.PI * p);
      plane.vx = sx; plane.bank = plane.vx / 40; plane.pitch = Math.cos(Math.PI * p);
      run.mvSteep = p < 0.4 ? 1 : p > 0.6 ? -1 : 0;
      run.spd = Math.max(40, run.spd - run.spd * 0.14 * dt);
      break;
    }
    case 'loyo': {
      // pica y remonta: la inversa del high yo-yo — GANA velocidad (energia por altura)
      plane.vy = -19 * Math.cos(Math.PI * p);
      if (plane.y < 2.2 && plane.vy < 0) plane.vy = 0;          // piso de seguridad
      plane.vx = sx; plane.bank = plane.vx / 40; plane.pitch = -Math.cos(Math.PI * p);
      run.mvSteep = p < 0.4 ? -1 : p > 0.6 ? 1 : 0;
      run.spd += 34 * dt * bell(p);
      break;
    }
    case 'jink': {
      // 4 quiebres ALTERNADOS (si no alternan, el jink deriva para un lado y es un dash); lo
      // aleatorio son el lado inicial (mvDir del combo) y la fuerza de cada quiebre (semilla).
      //
      // CONTINUIDAD. Antes plane.vx se CLAVABA en el valor del quiebre, asi que cuatro veces por
      // maniobra la velocidad lateral saltaba de golpe ~90 u/s y el avion se teletransportaba de
      // costado. Ahora el quiebre es un objetivo que se PERSIGUE con aceleracion limitada: la
      // velocidad lateral queda continua y el gesto se lee como un latigazo en vez de un corte.
      //
      // Y escala con la VELOCIDAD REAL del avion: mas rapido = mas recorrido lateral y mas
      // autoridad para cambiarlo. Un jink a 40 u/s es suave; a 110 es violento. La proporcion
      // entre `amp` y `rate` esta elegida para que el barrido tarde ~un segmento a cualquier
      // velocidad — asi el ritmo de la maniobra no cambia, solo su amplitud.
      const seg = Math.min(3, (p * 4) | 0);
      const sgn = run.mvDir * (seg % 2 ? -1 : 1);
      const amp = 22 + run.spd * 0.34 + ((run.mvSeed + seg * 31) % 9);
      const rate = 320 + run.spd * 2.9;                    // u/s²: cuanto puede cambiar vx por segundo
      const tgt = sgn * amp;
      plane.vx += Math.max(-rate * dt, Math.min(rate * dt, tgt - plane.vx));
      // bamboleo vertical suave (antes eran 5 Hz de temblor, que era la mitad de lo "brusco")
      plane.vy += (Math.sin(run.mvT * 9 + run.mvSeed) * 3 - plane.vy) * Math.min(1, dt * 6);
      plane.bank = Math.max(-1, Math.min(1, plane.vx / Math.max(18, amp)));   // el alabeo sigue a vx real
      plane.pitch = 0;
      break;
    }
    case 'sturn': {
      // barrido en S: seno completo — se abre, cruza y VUELVE al carril
      plane.vx = dir * 52 * Math.sin(2 * Math.PI * p);
      plane.vy = sy;
      plane.bank = Math.max(-1, Math.min(1, plane.vx / 34)); plane.pitch = 0;
      break;
    }
    case 'mask': {
      // clavado al terreno: baja rapido a la banda rasante y se QUEDA ahi. Congela el reloj
      // del roce (es la maniobra "pro" de volar pegado) y DESCARGA el radar enemigo.
      const tgt = cfg.terrain === 'sea' ? 2.4 : 1.7;
      plane.vy = (tgt - plane.y) * 6;
      plane.vx = sx * 1.6;                                       // lateral CASI pleno: esquivas a ras
      plane.bank = plane.vx / 40; plane.pitch = plane.y > tgt + 2 ? -0.6 : 0;
      run.scrapeT = 0;
      run.detection = Math.max(0, run.detection - dt * 0.85);
      break;
    }
    case 'popup': {
      // trepada brusca de ataque: empuje grande que se agota — sale disparado y se asienta
      plane.vy = 30 * (1 - p);
      plane.vx = sx; plane.bank = plane.vx / 40; plane.pitch = 1;
      run.mvSteep = p < 0.75 ? 1 : 0;
      run.spd = Math.max(40, run.spd - run.spd * 0.10 * dt);
      break;
    }
  }

  // estelas de viento de la maniobra (las mismas del tonel): venden el tiron
  if (Math.random() < 0.6) {
    const sp = proj(plane.x + (Math.random() - 0.5) * 3, plane.y + (Math.random() - 0.5) * 2, PZ);
    parts.push({
      x: sp.x, y: sp.y, vx: -plane.vx * (1.2 + Math.random()), vy: (Math.random() - 0.5) * 24,
      life: 0.3, c: P.crest, r: 1,
    });
  }

  // topes del carril (los mismos de flight.js, por si el empuje lateral pega en el borde)
  if (plane.x < -FLY_X) { plane.x = -FLY_X; if (plane.vx < 0) plane.vx = 0; }
  if (plane.x > FLY_X) { plane.x = FLY_X; if (plane.vx > 0) plane.vx = 0; }
  if (plane.y > FLY_TOP) { plane.y = FLY_TOP; if (plane.vy > 0) plane.vy = 0; }

  if (run.mvT >= M.dur) {                       // fin: devuelve el avion y arranca el cooldown
    run.mv = null; run.mvRoll = 0; run.mvSteep = 0; run.rollCd = MV_CD;
    plane.pitch = Math.max(-1, Math.min(1, plane.pitch));
  }
}
