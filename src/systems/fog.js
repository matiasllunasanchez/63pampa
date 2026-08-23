// NIEBLA — bancos de bruma pegados al agua, con principio y fin.
//
// NO ES UN FILTRO: es un TRAMO. RASANTE entero se juega con una sola herramienta —volar bajo— y
// esto te la saca por unos segundos. El banco se acuesta ABAJO, contra el agua, y su techo queda
// apenas por debajo del techo del radar: adentro no ves lo que viene, y el unico lugar donde ves
// es arriba, que es justo donde el radar te pinta y te llueven misiles.
//
//   normalmente        · abajo seguro y rentable (racha x10, afterburner) · arriba te pinta
//   dentro del banco   · abajo CIEGO                                      · arriba es lo unico que se ve
//
// O sea que el banco te EXPULSA hacia arriba, a aguantar misiles un rato, hasta que se termina.
// Por eso es temporal: una niebla pareja durante todo el mapa se vuelve monotona y ademas no
// obliga a nada — es un tramo con reloj o no es nada.
//
// EL FILO: entre el techo de la niebla (FOG_TOP) y el piso del radar (RADAR_ALT) queda una
// RENDIJA de 3 unidades donde ves Y no te pintan. No esta programada aparte: sale sola de poner
// los dos umbrales cerca. El que la encuentra la hilvana; el resto sube y come misiles.
//
// CONTRAJUGADA QUE YA EXISTE: el TERRAIN MASKING clava el avion a ras y DESCARGA el radar. Dentro
// del banco eso pasa a significar zambullirse a ciegas para sacarse los misiles de encima.
//
// EL ESTADO VIVE ACA y no en los stores compartidos (regla de core/state.js): lo escribe este
// sistema y el resto lo LEE por las funciones de abajo.

import { run } from '../core/run.js';
import { cfg } from '../core/state.js';
import { FOG_TOP, FOG_FRAC, FOG_FLOOR, FOG_LEN, FOG_GAP, FOG_SPREAD, FOG_FADE, SPAWN_Z } from '../data/tuning.js';

// Banco activo o el proximo: [z0, z1) en coordenadas de DISTANCIA RECORRIDA (run.dist).
const bank = { z0: 0, z1: 0, armed: false };
// `entered` sirve para avisar UNA sola vez al entrar; lo consume game.js.
let entered = false, exited = false;

/** Reinicia los bancos (lo llama el arranque de cada corrida). */
export function resetFog() { bank.z0 = 0; bank.z1 = 0; bank.armed = false; entered = false; exited = false; }

// El largo se sortea DENTRO de una banda alrededor del elegido: si todos los bancos midieran
// exactamente lo mismo, el tramo se volveria un metronomo y se aprenderia de memoria en vez de
// leerse en pantalla.
const roll = (v, s) => v * (1 - s + Math.random() * 2 * s);

function schedule(from) {
  const len = roll(FOG_LEN[cfg.fogLen] || FOG_LEN[1], FOG_SPREAD);
  const gap = roll(len * FOG_GAP, FOG_SPREAD);
  bank.z0 = from + gap;
  bank.z1 = bank.z0 + len;
  bank.armed = true;
}

/** Un cuadro. Va en update(), arriba de los early-return. */
export function stepFog() {
  if (!cfg.fog) { bank.armed = false; return; }
  if (!bank.armed) { schedule(run.dist); return; }
  const inside = run.dist >= bank.z0 && run.dist < bank.z1;
  if (inside && !entered) { entered = true; exited = false; }
  if (!inside && entered) { entered = false; exited = true; }
  if (run.dist >= bank.z1) schedule(bank.z1);
}

/** ¿El avion esta DENTRO del tramo de niebla? (posicion en el mapa, no altura) */
export const inBank = () => !!cfg.fog && bank.armed && run.dist >= bank.z0 && run.dist < bank.z1;
/** Metros que faltan para salir del banco (0 si no estas adentro). */
export const bankLeft = () => inBank() ? bank.z1 - run.dist : 0;
/** Metros que faltan para ENTRAR (0 si ya estas adentro o no hay banco armado). */
export const bankAhead = () => (!cfg.fog || !bank.armed || run.dist >= bank.z0) ? 0 : bank.z0 - run.dist;
/** Pulso de un cuadro: acaba de entrar / acaba de salir. Los consume game.js para el aviso. */
export function tookEntry() { if (!entered || exited) return false; return true; }
export function takeExit() { if (!exited) return false; exited = false; return true; }

/** CUANTA BRUMA HAY AHORA, de 0 a 1 — la rampa de entrada y de salida del banco.
 *
 *  Es lo unico que separa "un tramo de niebla" de "un filtro que se prendio": `inBank()` es un
 *  booleano y cambia en un metro, asi que el render enganchado a el aparecia DE GOLPE. Esto sube
 *  a lo largo de FOG_FADE metros y baja igual.
 *
 *  Y arranca ANTES del borde (`z0 - FOG_FADE`) a proposito: la bruma se ve venir y te envuelve,
 *  que es el orden real de las cosas. Las reglas de JUEGO —donde no se siembra, cuando avisa el
 *  HUD, cuando el Harrier queda ciego— siguen colgadas de `inBank()`: el borde del efecto es
 *  nitido aunque el de la imagen no lo sea. */
export function fogFade() {
  if (!cfg.fog || !bank.armed) return 0;
  const d = run.dist;
  const sube = (d - (bank.z0 - FOG_FADE)) / FOG_FADE;
  const baja = ((bank.z1 + FOG_FADE) - d) / FOG_FADE;
  return Math.max(0, Math.min(1, sube, baja));
}

/** Techo del banco, en unidades de mundo. Debajo de esto hay bruma; arriba se ve. */
export const fogTop = () => FOG_TOP;

/** ALCANCE DE VISION dentro de la niebla, en unidades de PROFUNDIDAD (z).
 *
 *  Dos terminos y se toma el MAYOR (ver FOG_FRAC / FOG_FLOOR en data/tuning.js):
 *    · una FRACCION de SPAWN_Z — recorta el aviso en la misma proporcion a cualquier velocidad,
 *      que es lo que hace que la niebla muerda tambien yendo rapido;
 *    · un PISO EN SEGUNDOS — por rapido que vayas nunca te deja sin margen de maniobra.
 *  A crucero manda la fraccion (aprieta); a fondo manda el piso (protege). */
export function fogVis() {
  const frac = FOG_FRAC[cfg.fog] || 0;
  if (!frac) return 1e9;
  return Math.max(28, SPAWN_Z * frac, run.spd * FOG_FLOOR[cfg.fog]);
}
/** Segundos de aviso que da la niebla a la velocidad actual. Lo usa el probe y sirve para calibrar. */
export const fogWarnSec = () => run.spd > 1 ? fogVis() / run.spd : 0;

// ---------- SONDA (QUITAR) ----------
// El banco es un TRAMO que aparece cada tantos cientos de metros: mirarlo entrar, sin esto, es
// volar a ciegas hasta que toque. `__fog(n)` fija la densidad y `__fog(n, 1)` planta el proximo
// banco justo adelante para poder fotografiar la ENTRADA, que es donde se ve si aparece de golpe.
if (typeof window !== 'undefined') window.__fog = (n, ya) => {
  if (n !== undefined) { cfg.fog = +n || 0; resetFog(); }
  if (ya) { bank.z0 = run.dist + (+ya === 1 ? 60 : +ya); bank.z1 = bank.z0 + 2400; bank.armed = true; }
  return JSON.stringify({
    fog: cfg.fog, dist: run.dist | 0, z0: bank.z0 | 0, z1: bank.z1 | 0,
    dentro: inBank(), falta: bankAhead() | 0, queda: bankLeft() | 0, top: fogTop(),
  });
};
