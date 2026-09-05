// PIRUETAS DE ACTOR — un Fiel entra en escena, vuela UNA maniobra del catalogo y se va
// (docs/sistemas/PLAN_MANIOBRAS_FASES.md, fase M1).
//
// POR QUE EXISTE. Las maniobras del juego eran un PODER: el jugador teclea un combo y su avion las
// vuela. Pero las mismas curvas sirven para contar cosas que no son del jugador — un companero que
// entra de costado haciendo un tonel barril, el batido de alas de una pasada de homenaje, el
// sobrepaso de alguien que te pasa por arriba. Eso es lo que este modulo agrega: **el mismo motor
// de piruetas apuntando a otro avion**.
//
// COMO. `systems/moves.js` dejo de estar casado con `plane`/`run` (ver EL CUERPO alla): recibe un
// CUERPO y un ESTADO y vuela las MISMAS curvas sobre ellos. Aca se arma uno de esos pares por
// actor, se lo hace entrar, se le pide la maniobra y se lo hace salir. No hay una segunda copia de
// ninguna curva — si mañana el tonel barril cambia de radio, el del Fiel cambia con el.
//
// LO QUE UN ACTOR NO ES (regla §3.7 del plan): **escena, no gameplay**. No dispara, no colisiona
// con el jugador, no lo empuja y no aparece en ninguna cuenta. Si algun dia hace falta un
// companero que SI pelee, eso es otra decision y otro modulo — mezclarlas convertiria una
// herramienta de puesta en escena en una fuente de muertes que nadie pidio.
//
// DISCIPLINA DE SEÑALES (convencion 2 de ARQUITECTURA): esto muta su propio store y no llama a
// nadie hacia arriba. El orquestador lo actualiza y el render lo dibuja; nada mas.
import { plane } from '../core/state.js';
import { run } from '../core/run.js';
import { FLY_X } from '../data/tuning.js';
import { MOVES, WINGMV } from '../data/moves.js';
import { startMove, movesSystem } from './moves.js';

// LOS ACTORES EN ESCENA. Store de identidad estable (convencion 1): se MUTA, nunca se reasigna —
// el render lo lee por referencia.
export const actores = [];

// palanca NEUTRA: un actor no tiene a nadie corrigiendolo. Es la misma constante que usa el
// director de cinematicas por la misma razon.
const INP0 = { l: 0, r: 0, u: 0, d: 0 };

// suavizado de entrada y salida: arranca y termina sin golpe (el mismo smoothstep de todo el repo)
const ss = t => { const c = Math.max(0, Math.min(1, t)); return c * c * (3 - 2 * c); };

/** EL LADO, resuelto. `'izq'` / `'der'` / `'atras'` mandan; `'auto'` sortea con los pesos de
 *  `WINGMV.MEZCLA` (mayormente por atras); cualquier otra cosa —incluido no decir nada— cae en
 *  `WINGMV.LADO`, que es 'atras'. Toda la eleccion vive aca: quien llama pide una maniobra, no
 *  una geometria.  */
function ladoDe(lado) {
  if (lado === 'izq' || lado === 'der' || lado === 'atras') return lado;
  if (lado !== 'auto') return WINGMV.LADO;
  const M = WINGMV.MEZCLA;
  const total = Object.keys(M).reduce((a, k) => a + M[k], 0);
  let r = Math.random() * total;
  for (const k of Object.keys(M)) { r -= M[k]; if (r <= 0) return k; }
  return WINGMV.LADO;
}

/** DONDE NACE, POR DONDE PASA y HACIA DONDE SE VA, por lado de entrada.
 *
 *  **DESDE ATRAS (la de casa): un SOBREPASO.** Nace pegado a la camara (z chico, o sea grande en
 *  pantalla), un hombro al costado y mas ABAJO que el jugador, y se va alejando hacia adelante
 *  mientras trepa — que es exactamente como se ve pasar a alguien mas rapido que vos. Recien
 *  cuando ya esta adelante arranca la maniobra, asi la figura se lee entera y en cielo limpio.
 *  El hombro se sortea, y de ese lado sale despues: el que te pasa por la izquierda no se cruza
 *  a la derecha para irse.
 *
 *  **DE COSTADO.** Nace FUERA del carril del jugador (`FLY_X`) a su altura de trabajo y cruza el
 *  cuadro. Es lo que hay que pedir cuando la escena quiere que el Fiel ATRAVIESE el plano.
 *  (De paso, nacer fuera del carril es la razon por la que `movesSystem` no le aplica los topes:
 *  en su primer cuadro lo teletransportarian al borde.)  */
function entrada(lado) {
  if (lado === 'atras') {
    const s = Math.random() < 0.5 ? 1 : -1;      // por que hombro te pasa
    return {
      x: plane.x + s * WINGMV.PASA_X, y: plane.y - WINGMV.PASA_DY, z: WINGMV.Z0,
      // SE VA POR EL MISMO HOMBRO por el que te paso, y sobre todo hacia ADELANTE (salZ). El
      // signo esta invertido porque la salida empuja hacia `-salX` (ver la fase 'sale'): el que te
      // pasa por la izquierda no se cruza a la derecha para irse. El 0.35 es apenas una abierta —
      // lo que de verdad lo saca de escena es alejarse, no correrse.
      salX: -s * 0.35, salZ: 1,
      // el punto donde arranca la figura: ya adelantado y de SU lado, no encima del jugador
      mx: plane.x + s * WINGMV.PASA_X, dur: WINGMV.ENTRA_ATRAS,
    };
  }
  const s = lado === 'der' ? 1 : -1;
  return { x: plane.x + s * WINGMV.X0, y: plane.y + WINGMV.DY, z: WINGMV.Z, salX: s, salZ: 0,
    mx: plane.x - s * WINGMV.ENC, dur: WINGMV.ENTRA };
}

/** Mete un actor que vuela `id` y se va.
 *
 *  `lado` = 'izq' | 'der' | 'atras' | 'auto'. **Sin decir nada entra por atras, sobrepasando**
 *  (`WINGMV.LADO`); 'auto' sortea con los pesos de `WINGMV.MEZCLA`.
 *
 *  `dir` es el sentido de la maniobra; por omision **la vuela hacia el lado contrario al que se
 *  va**, que es lo que hace que la figura quede EN ESCENA en vez de salirse mientras la hace.
 *  Devuelve el actor (o null si el id no existe: una escena que pide una maniobra que no esta no
 *  puede trabar el juego).  */
export function entra(id, lado, o) {
  const M = MOVES[id]; if (!M) return null;
  o = o || {};
  lado = ladoDe(lado);
  const e = entrada(lado);
  // el punto donde ARRANCA la maniobra: adelante del jugador y a su altura de trabajo, para que la
  // figura caiga adentro del cuadro y no en un borde.
  const mx = o.x === undefined ? e.mx : o.x;
  const my = o.y === undefined ? Math.max(8, plane.y + WINGMV.DY) : o.y;
  const a = {
    id, lado, fase: 'entra', t: 0, vida: 0, dur: e.dur,
    cuerpo: { x: e.x, y: e.y, z: e.z, vx: 0, vy: 0, bank: 0, pitch: 0 },
    // el ESTADO de maniobra del actor: el mismo juego de campos que `run` usa para el jugador, y
    // por eso el motor no se entera de la diferencia. Arranca limpio (sin cooldown heredado).
    est: {
      // EL SENTIDO de la figura: por omision, HACIA EL LADO CONTRARIO al que se va — asi la
      // maniobra cruza el cuadro en vez de salirse por donde el actor ya venia yendo. Es el SIGNO
      // de `salX` y no su valor: la salida de atras se abre apenas (0.35) y usarlo crudo achicaba
      // la pirueta entera a un tercio.
      mv: null, mvT: 0, mvDir: o.dir === undefined ? -Math.sign(e.salX) || 1 : o.dir,
      mvY0: my, mvTgt: o.tgt || my + 20, mvRoll: 0, mvSteep: 0, mvSeed: 0,
      rollCd: 0, spd: WINGMV.SPD, scrapeT: 0, detection: 0,
    },
    de: { x: e.x, y: e.y }, a: { x: mx, y: my }, salX: e.salX, salZ: e.salZ,
  };
  actores.push(a);
  return a;
}

/** Un cuadro de todos los actores. Lo llama el orquestador en el PASILLO. */
export function update(dt) {
  for (let i = actores.length - 1; i >= 0; i--) {
    const a = actores[i];
    const B = a.cuerpo;
    a.t += dt; a.vida += dt;

    if (a.fase === 'entra') {
      // ENTRA VOLANDO, no aparece: interpola de su punto de nacimiento al de la maniobra con
      // smoothstep, y BANQUEA hacia donde va. Sin el banqueo se lee como un sprite deslizandose.
      const f = ss(a.t / a.dur);
      const px0 = B.x, py0 = B.y;
      B.x = a.de.x + (a.a.x - a.de.x) * f;
      B.y = a.de.y + (a.a.y - a.de.y) * f;
      if (a.salZ) B.z = WINGMV.Z0 + (WINGMV.Z - WINGMV.Z0) * f;
      B.bank = Math.max(-1, Math.min(1, (B.x - px0) / Math.max(1e-4, dt) / 60));
      // EL MORRO ACOMPAÑA AL SOBREPASO: el que te pasa viene de abajo y trepa, y sin cabeceo se
      // leia como un sprite deslizandose hacia arriba. Sale de la velocidad real, no de una
      // constante, asi el cabeceo entra y sale con la misma curva que el movimiento.
      B.pitch = Math.max(-1, Math.min(1, (B.y - py0) / Math.max(1e-4, dt) / 26));
      if (a.t >= a.dur) {
        a.fase = 'mv'; a.t = 0;
        B.vx = 0; B.vy = 0; B.bank = 0;
        // MUDO: el rotulo con el nombre y el golpe de sonido son del JUGADOR ("vos hiciste esto").
        // Un actor que los disparara llenaria la pantalla de carteles anunciando piruetas ajenas.
        startMove(a.id, a.est.mvDir, a.est.mvTgt, { cuerpo: B, est: a.est, mudo: true });
      }
    } else if (a.fase === 'mv') {
      // LA MANIOBRA, volada por el MISMO motor que la del jugador. `movesSystem` escribe
      // velocidades y actitudes; la posicion la integra quien es dueño del cuerpo — para el
      // jugador es flight.js, y para un actor, esto.
      movesSystem(dt, INP0, { cuerpo: B, est: a.est });
      B.x += B.vx * dt;
      B.y += B.vy * dt;
      if (!a.est.mv) { a.fase = 'sale'; a.t = 0; }
    } else {
      // SE VA DE PLANO. Sigue con la velocidad que traia y se abre hacia su lado (o se aleja hacia
      // adelante, si vino de atras): la escena tiene que terminar con el cuadro vacio, no con un
      // avion parado en el medio.
      const f = a.t / WINGMV.SALE;
      // se abre hacia el lado CONTRARIO al que entro —que es hacia donde ya viene saliendo la
      // figura— y no hacia el suyo: empujarlo de vuelta a su borde lo frenaria en el medio del
      // cuadro, justo cuando tiene que irse.
      B.x += (B.vx - a.salX * WINGMV.SAL_VX * f) * dt;
      B.y += (B.vy + WINGMV.SAL_VY * f) * dt;
      B.z += a.salZ * WINGMV.SAL_VZ * dt;
      B.bank += ((-a.salX || 0.4) * 0.8 - B.bank) * Math.min(1, dt * 3);
      a.est.mvRoll = 0;
    }

    // …Y SE VA SOLO. Tres puertas: el reloj de salida, salirse del cuadro, y un TOPE DURO de vida.
    // El tope existe por la misma leccion que el director de cinematicas (que se quedaba pintando
    // blanco para siempre): algo que entra a escena tiene que tener escrito como se termina, o
    // tarde o temprano un caso raro lo deja ahi para siempre.
    const fuera = Math.abs(B.x) > FLY_X + WINGMV.X0 + 10 || B.z > WINGMV.Z_MAX || B.z < 2 || B.y > 140 || B.y < -20;
    if ((a.fase === 'sale' && a.t >= WINGMV.SALE) || fuera || a.vida > WINGMV.VIDA) actores.splice(i, 1);
  }
}

/** Saca a todos de escena (cambio de fase, muerte, reinicio). El store se MUTA. */
export function limpiar() { actores.length = 0; }
export const cuantos = () => actores.length;

/** Foto de solo lectura para el render (convencion 4: el que dibuja no toca el estado). */
export const state = () => actores.map(a => ({
  id: a.id, fase: a.fase, x: a.cuerpo.x, y: a.cuerpo.y, z: a.cuerpo.z,
  bank: a.cuerpo.bank, pitch: a.cuerpo.pitch, roll: a.est.mvRoll || 0,
}));

// ---------------- SONDA (QUITAR antes de publicar) ----------------
// La prueba de fuego de M1, y la puerta por la que cualquiera puede ver una maniobra desde afuera
// sin volarla: `__mvactor('barrel', 'izq')` mete un Fiel haciendo el TONEL BARRIL en escena, en
// cualquier modo, sin tocar el control ni la fisica del jugador.
if (typeof window !== 'undefined') window.__mvactor = (id, lado, dir) => {
  const a = entra(id || 'barrel', lado, dir === undefined ? undefined : { dir: +dir });
  return JSON.stringify(a ? { id: a.id, lado: a.lado, fase: a.fase, x: +a.cuerpo.x.toFixed(1), y: +a.cuerpo.y.toFixed(1), z: +a.cuerpo.z.toFixed(1), n: actores.length }
    : { error: 'no existe la maniobra ' + id, n: actores.length });
};
// QUITAR — la foto de los actores en escena, con SU estado de maniobra: es lo que deja afirmar
// desde un fixture que el Fiel volo la pirueta entera y no que aparecio y se fue.
if (typeof window !== 'undefined') window.__mvactordbg = () => JSON.stringify(actores.map(a => ({
  id: a.id, fase: a.fase, mv: a.est.mv || null, t: +a.est.mvT.toFixed(2), vida: +a.vida.toFixed(2),
  x: +a.cuerpo.x.toFixed(2), y: +a.cuerpo.y.toFixed(2), z: +a.cuerpo.z.toFixed(2),
  roll: +(a.est.mvRoll || 0).toFixed(3), bank: +a.cuerpo.bank.toFixed(3),
  // el estado del JUGADOR, para poder afirmar lo mas importante: que el actor no lo toco
  pj: { x: +plane.x.toFixed(2), y: +plane.y.toFixed(2), mv: run.mv || null },
})));
