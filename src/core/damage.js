// INTEGRIDAD DEL AVION: los tres modelos de VIDA del juego, como datos y funciones PURAS.
//
// Hasta ahora el juego tenia UN solo modelo: cualquier impacto mata y se descuenta un avion del
// escuadron (systems/squad.js). Este modulo agrega los otros dos que pidio el autor y deja los
// tres detras de la misma perilla, para poder atarlos a la DIFICULTAD mas adelante:
//
//   'squad'   como siempre: un toque y caiste. El escuadron ES la barra de vida.
//   'integ'   el avion aguanta varios impactos y se va DEGRADANDO — mas lento, sin turbo, sin
//             piruetas. Al llegar a cero cae, y recien ahi se gasta un avion del escuadron.
//   'visual'  la misma integridad y los mismos golpes, pero SIN tocar el desempeño: el daño se
//             ve y se cuenta, y el avion vuela igual hasta que se acaba.
//
// LA REGLA QUE SEPARA UNA COSA DE LA OTRA: te DISPARAN → daño. CHOCAS algo → muerte.
// El mar, el terreno, un mastil o quedarse sin nafta matan en los tres modos, porque esa es la
// regla del juego entero ("el mar MATA") y suspenderla convertiria el rasante en un paseo.
//
// Puro y sin imports de stores: lo corre tools/unit.js igual que el juego.

/** Los tres modelos, en el orden en que los ofrece OPCIONES. */
export const DMG_MODES = ['squad', 'integ', 'visual'];

/** Daño por causa (sobre 100 de integridad). Lo que NO esta aca es una colision: mata siempre. */
export const DMG = {
  death_aa: 34,        // antiaereo / metralla del buque: 3 impactos y estas en el piso
  death_gunfire: 22,   // trazadora de un caza: la mas barata, pero se acumula
  death_missile: 45,   // misil enganchado: dos y listo
  death_bomb: 50,      // meterse en el hongo de una bomba: media vida de una
  // LA COLA: los Aden de 30 mm del Sea Harrier. Mas caro que el fuego desde tierra (22) porque es
  // artilleria de caza a quemarropa, y mas barato que un misil enganchado (45) porque es una
  // rafaga y no una ojiva. Tres impactos y estas en el piso.
  death_caza: 34,
};

/** ¿Esta causa mata SIEMPRE, sin importar el modo? (todo lo que no sea "te dispararon") */
export const isFatal = cause => DMG[cause] === undefined;

// ESCALONES DE AVERIA. `min` es el piso EXCLUSIVO de integridad de cada escalon.
// Los efectos son multiplicadores y permisos que leen el PASILLO y el ARENA por igual:
//   spd    factor de velocidad de punta       turbo  ¿queda turbo?
//   agil   factor de respuesta (cabeceo/alabeo en arena, esquive en pasillo)
//   moves  ¿se pueden ejecutar piruetas / media vuelta?
//
// El ultimo escalon deja "lo basico" que pidio el autor: volar y disparar, nada mas.
export const TIERS = [
  { id: 'ok', min: 75, spd: 1.00, agil: 1.00, turbo: true, moves: true },
  { id: 'hit', min: 50, spd: 0.93, agil: 0.94, turbo: true, moves: true },
  { id: 'dmg', min: 25, spd: 0.86, agil: 0.86, turbo: false, moves: true },
  { id: 'crit', min: 0, spd: 0.78, agil: 0.76, turbo: false, moves: false },
];
const NOMINAL = TIERS[0];

/** El escalon que corresponde a `integ` (0..100). */
export const tierOf = integ => TIERS.find(t => integ > t.min) || TIERS[TIERS.length - 1];

/** Lo que el resto del juego consulta para saber como responde el avion.
 *  En 'squad' y en 'visual' SIEMPRE es nominal — en el primero porque no hay avion averiado que
 *  volar (un toque y caiste), y en el segundo porque esa es justamente su definicion. */
export const effects = (integ, mode) => mode === 'integ' ? tierOf(integ) : NOMINAL;

/**
 * Resuelve UN impacto. Devuelve `{ integ, down, dmg }` — `down` = el avion cae (y ahi el que
 * decide relevo-o-muerte sigue siendo game.js, como siempre).
 * No muta nada: el estado lo escribe systems/damage.js, que es su unico dueño.
 */
export function applyHit(integ, cause, mode) {
  if (isFatal(cause) || mode === 'squad') return { integ: 0, down: true, dmg: 100 };
  const dmg = DMG[cause];
  const next = Math.max(0, integ - dmg);
  return { integ: next, down: next <= 0, dmg };
}
