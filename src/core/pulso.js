// EL PULSO: la matematica PURA de la prueba — escalada, pool y armado de secuencias.
//
// Mismo lugar y misma razon que core/squad.js: cero dependencias, cero estado, y por eso se puede
// probar en node (`npm run unit`). Lo que decide CUAN dificil es la prueba de un nivel no puede
// vivir enterrado adentro del sistema: es la perilla que hay que poder verificar sin abrir el
// juego. systems/pulso.js es el que tiene estado y sonido; esto es solo cuentas.
//
// La unidad de dificultad es `t01`: el avance de campaña normalizado 0..1 (mision 1 = 0, ultima
// = 1). Se elige asi y no "numero de nivel" porque los modos tienen largos distintos — CICLO y
// PATRIA entran con su propia fraccion sin que estas cuentas sepan de misiones.
import { PULSO, PULSO_PREMIO, COMPASES, REMATE, POOL_BASICO } from '../data/pulso.js';
import { moveAllowed } from '../data/upgrades.js';

const clamp01 = v => (v < 0 ? 0 : v > 1 ? 1 : v);
const lerp = (a, b, f) => a + (b - a) * f;

/** Margen (segundos) de UN compas: escala con el avance y se achica con el grado de flak. */
export function beatFor(t01, flak) {
  const base = lerp(PULSO.T_BEAT[0], PULSO.T_BEAT[1], clamp01(t01));
  const k = PULSO.FLAK_T[Math.max(0, Math.min(PULSO.FLAK_T.length - 1, flak | 0))];
  return base * k;
}

/** Cuantas PIRUETAS pide la secuencia (sin contar el remate), ya con el ajuste de la zona. */
export function barsFor(t01, dz) {
  const n = Math.round(lerp(PULSO.BARS[0], PULSO.BARS[1], clamp01(t01))) + (dz | 0);
  return Math.max(0, n);
}

/** ¿Se perdona un error en esta secuencia? Escala por nivel, no por dificultad (no existe). */
export const errFor = t01 => (clamp01(t01) <= PULSO.ERR_LV ? 1 : 0);

/** El pool de compases DISPONIBLES (regla 1: el examen toma lo aprendido).
 *
 *  En campaña sale de la libreta del Pichon: si todavia no aprendio ninguna pirueta el pool queda
 *  VACIO — y eso no es un bug, es la regla llevada hasta el final. Una secuencia sin piruetas es
 *  solo el remate: en la primera mision el examen es soltar bien, que es exactamente lo unico que
 *  el juego enseño hasta ahi. Fuera de campaña se usa el pool basico (no hay libreta que respetar).
 */
export function poolFor({ campaign, owned, off } = {}) {
  if (!campaign) return COMPASES.filter(c => POOL_BASICO.includes(c.seq));
  return COMPASES.filter(c => moveAllowed(c.move, { campaign: true, owned: owned || [], off }));
}

/** Arma UNA secuencia: `n` piruetas del pool + el remate, sin repetir maniobra seguida.
 *  `rnd` se inyecta (Math.random por defecto) para que el test sea determinista. */
export function armar(pool, n, rnd = Math.random) {
  const seqs = [];
  let last = null;
  for (let i = 0; i < n && pool.length; i++) {
    const cand = pool.filter(c => c.move !== last);
    const from = cand.length ? cand : pool;
    const c = from[Math.min(from.length - 1, Math.floor(rnd() * from.length))];
    seqs.push(c.seq); last = c.move;
  }
  seqs.push(REMATE.seq);
  return seqs;
}

/** Las 2-3 zonas del buque, cada una con SU secuencia (plan §3: elegir blanco ES la prueba).
 *
 *  Se intenta que ARRANQUEN CON TOKENS DISTINTOS, porque la eleccion se hace tecleando: el primer
 *  toque elige el carril. Si el pool es tan chico que no alcanza, se acepta la colision y el
 *  desempate lo hace el sistema quedandose con el primer carril que coincide.
 */
export function armarZonas(zonas, pool, t01, rnd = Math.random) {
  const usados = new Set();
  return zonas.map(z => {
    const n = barsFor(t01, z.bars);
    if (!n || !pool.length) return { zona: z, seqs: armar(pool, n, rnd) };
    // el PRIMER compas se elige a proposito, no se sortea y se reza: de los que arrancan con una
    // tecla todavia libre. Si el pool es tan chico que no queda ninguna, se acepta la colision y
    // el desempate lo hace el sistema (se queda con el primer carril que coincide).
    const libres = pool.filter(c => !usados.has(c.seq[0]));
    const from = libres.length ? libres : pool;
    const head = from[Math.min(from.length - 1, Math.floor(rnd() * from.length))];
    usados.add(head.seq[0]);
    const resto = armar(pool.filter(c => c.move !== head.move), n - 1, rnd);
    return { zona: z, seqs: [head.seq, ...resto] };
  });
}

// ---------------- EL PREMIO (Q3) ----------------
// Tambien es cuenta pura, y por la misma razon que la escalada: si el premio se desbalancea no da
// error ni se ve — el climax simplemente pasa a pagar de mas o de menos, y eso solo se descubre
// mirando el recuento de diez misiones. Aca se prueba en un segundo.

/** PAR de tiempo de una secuencia: cuanto tendria que tardar el que no duda.
 *  `n` compases × su margen × PAR. Sale del margen VIGENTE (que ya trae el nivel y el flak), asi
 *  que el sello de velocidad es igual de alcanzable en la primera mision que en la ultima. */
export const parSecsFor = (n, beatMax) => Math.max(0, n) * Math.max(0, beatMax) * PULSO_PREMIO.PAR;

/** Los tres SELLOS del premio (plan §3). `secs` es el tiempo REAL desde que se eligio blanco. */
export function sellosDe({ errs, secs, par, zona } = {}) {
  return {
    limpio: !(errs > 0),
    rapido: secs > 0 && par > 0 && secs <= par,
    // la zona brava es la que PIDE MAS compases que el nivel (bars > 0), no la que mas paga: si
    // algun dia se repesan los puntos, el sello sigue significando lo mismo.
    bravo: !!(zona && zona.bars > 0),
  };
}

/** Puntos del climax: la base de la zona por lo que sumaron los sellos. Entra al recuento de la
 *  mision como una fila mas (game.js), no como una moneda aparte. */
export function puntosDe(zona, s) {
  const base = (zona && zona.pts) || 0;
  const k = 1
    + (s && s.limpio ? PULSO_PREMIO.LIMPIO : 0)
    + (s && s.rapido ? PULSO_PREMIO.RAPIDO : 0)
    + (s && s.bravo ? PULSO_PREMIO.BRAVO : 0);
  return Math.round(base * k);
}

/** Cuantos sellos se llevo (0..3): el numero que se muestra en el recuento. */
export const sellosN = s => (s ? (s.limpio ? 1 : 0) + (s.rapido ? 1 : 0) + (s.bravo ? 1 : 0) : 0);
