// INTEGRIDAD DEL AVION: los tres modelos de SALUD del juego, como datos y funciones PURAS.
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
// LA REGLA QUE SEPARA UNA COSA DE LA OTRA: te DISPARAN o ROZAS → daño. CHOCAS algo → muerte.
// Un mastil, una barranca, la cara de una ola o quedarse sin nafta matan en los tres modos. ROZAR
// el agua o el suelo mato tambien, en los tres, hasta el 11/9: desde entonces, en los modos con
// chapa, el roce le pega al ESCUDO y despues a la chapa (ver ESCUDO, abajo). En ESCUADRON sigue
// siendo el reloj de gracia de siempre — el mar sigue matando ahi, porque no hay chapa que gastar.
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

// EL ESCUDO (pedido del autor, 11/9). La aguja amarilla de SALUD deja de ser solo "cuanto mas podes
// rozar" y pasa a ser un ESCUDO RECUPERABLE delante de la chapa. TODO el daño le pega primero
// —trazadora, antiaereo, misil, bomba y el ROCE con el agua o el suelo— y lo que el escudo no
// alcanza a parar pasa a la chapa, que es el daño PERMANENTE (la aguja blanca). El escudo vuelve
// solo si pasa un rato sin que nada te toque; la chapa no vuelve nunca.
//
// Solo en los modos con chapa (INTEGRIDAD y VISUAL). En ESCUADRON un impacto sigue bajandote y el
// roce sigue siendo el reloj de gracia de siempre: sin chapa, no hay adonde pase el resto.
//
// LO QUE SIGUE MATANDO IGUAL es CHOCAR (`isFatal`): el escudo para lo que te tiran y lo que ROZAS,
// no lo que embestis.
export const ESCUDO = {
  pts: 30,       // cuanto para, en puntos de chapa: una trazadora entera (22) y un poco mas
  demora: 1.2,   // segundos sin daño antes de que empiece a llenarse
  llenar: 3,     // segundos de vacio a lleno
};

/** Reparte `dmg` puntos: primero el escudo (0..1) y el resto a la chapa. Devuelve
 *  `{ escudo, integ, down, aChapa }` — `aChapa` es lo que llego a la chapa. */
export function absorber(escudo, integ, dmg) {
  const cabe = Math.max(0, escudo) * ESCUDO.pts;
  const para = Math.min(dmg, cabe);
  const aChapa = dmg - para;
  const next = Math.max(0, integ - aChapa);
  return { escudo: (cabe - para) / ESCUDO.pts, integ: next, down: next <= 0, aChapa };
}

/** Lo que cobra ROZAR `dt` segundos con un margen de `lim` segundos (`scrapeLimit`, core/physics):
 *  el escudo entero en `lim` —el mismo margen que antes separaba el roce de la muerte— y despues la
 *  chapa AL MISMO RITMO, sin que la aguja cambie de velocidad al pasar de una a la otra. Por eso el
 *  agua pega mas que una bala: con el margen mas largo (0,85 s, lento) son 35 puntos por segundo, y
 *  a fondo, ~170. */
export const dmgRoce = (dt, lim) => dt * ESCUDO.pts / Math.max(0.01, lim);

/** El escudo un cuadro despues, sin daño nuevo. `quieto` es lo que falta de la demora. */
export function recargar(escudo, quieto, dt) {
  if (quieto > 0) return { escudo, quieto: Math.max(0, quieto - dt) };
  return { escudo: Math.min(1, escudo + dt / ESCUDO.llenar), quieto: 0 };
}
