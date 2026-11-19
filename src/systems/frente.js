// EL FRENTE DE TORMENTA (18/11/2026, el autor: "nubes negras en el horizonte que se vayan acercando hasta que el
// avion pase de estar en dia de sol a debajo de las nubes negras … un fade transicional con niebla entre una etapa
// y la otra"). Perillas en FRENTE (data/tuning.js); lo dibuja render/frente.js con lo que deja en `run.frente`.
//
// COMO CAMBIA EL CIELO SIN QUE SE VEA EL CORTE: el juego no mezcla cielos (cfg.sky es un preset entero), asi que
// el cambio se hace DE GOLPE pero escondido — en el pico de la niebla del cruce, o adentro del blanco de la capa
// de nubes si se la atraviesa (ALTO.NUBES). Del otro lado cfg.sky es 'storm' y todo lo de la tormenta (rayos,
// oscuridad, mar bravo, la ola gigante, el ruido) se prende solo, porque ya lee ese cielo.
//
// La definicion: { desde, hasta } en fracciones del objetivo (misiones) o { desdeM, hastaM } en metros. `hasta`
// (o `hastaM`) es opcional: si esta, del otro lado vuelve a despejar con otra niebla.
import { run } from '../core/run.js';
import { cfg, plane } from '../core/state.js';
import { FRENTE, ALTO } from '../data/tuning.js';

let def = null;     // { d0, d1|null } en metros de run.dist
let base = null;    // lo que el frente piso: { sky, rain, wind } (para devolverlo al despejar o al reiniciar)
let tocado = false;

/** Arma el frente de la corrida (`f` = la definicion de la mision, o null). `obj`: los metros del objetivo. */
export function setFrente(f, obj) {
  def = null;
  if (!f) return;
  const m = (frac, mts) => (mts != null ? mts : frac != null && obj > 0 ? frac * obj : null);
  const d0 = m(f.desde, f.desdeM);
  if (d0 == null) return;
  def = { d0, d1: m(f.hasta, f.hastaM) };
}
/** El frente al azar de POR LA PATRIA / CICLO (sortea si hay, donde cruza y si despeja). */
export function sortearFrente(obj = 0) {
  const az = ([a, b]) => a + Math.random() * (b - a);
  if (Math.random() >= FRENTE.SUELTO_P) return null;
  // (con blanco —el CICLO—, entre un tercio y la mitad del camino: que el buque quede del otro lado del frente)
  const desdeM = obj > 0 ? obj * az([0.3, 0.55]) : az(FRENTE.SUELTO_M);
  return { desdeM, hastaM: Math.random() < FRENTE.DESPEJA_P ? desdeM + az(FRENTE.DURA_M) : null };
}
/** Vuelve todo a como estaba (corrida nueva, reintento). Devuelve true si toco el cielo (game.js aplica). */
export function resetFrente() {
  const cambio = tocado && base && cfg.sky !== base.sky;
  if (tocado && base) { cfg.sky = base.sky; cfg.rain = base.rain; cfg.wind = base.wind; }
  base = null; tocado = false; run.frente = null;
  return !!cambio;
}
export const hayFrente = () => !!def;
/** ¿El frente esta manejando la lluvia y el viento ahora? (el re-sorteo del clima de los modos sueltos espera) */
export const frenteManda = () => tocado;

const suave = u => { u = Math.max(0, Math.min(1, u)); return u * u * (3 - 2 * u); };
/** La niebla del cruce en `x` metros del punto de cruce (0..1, pico en 0). */
const nieblaEn = x => suave(1 - Math.abs(x) / FRENTE.NIEBLA_M);

/** Un paso. `blanco` = cuanto blanco de la capa de nubes hay ahora (render/nubes_altas `nubesAltas().blanco`, lo
 *  pasa game.js). Devuelve true si cambio cfg.sky (game.js tiene que aplicarlo: applyCfg). */
export function stepFrente(blanco = 0) {
  if (!def) { run.frente = null; return false; }
  const F = FRENTE, d = run.dist, x0 = d - def.d0, x1 = def.d1 != null ? d - def.d1 : -Infinity;
  if (!base && x0 > -F.VISTA) base = { sky: cfg.sky, rain: cfg.rain, wind: cfg.wind };
  if (!base) { run.frente = null; return false; }
  // donde estamos: antes del cruce, adentro (debajo de la tormenta) o pasado el despeje
  const adentro = x0 >= 0 && !(x1 >= 0);
  const niebla = Math.max(nieblaEn(x0), def.d1 != null ? nieblaEn(x1) : 0);
  // LA LLUVIA Y EL VIENTO: suben desde un poco antes del cruce; arriba de la capa de nubes no llueve
  const arriba = plane.y > ALTO.NUBES;
  let lluvia = base.rain, viento = base.wind;
  if (x0 > F.VIENTO && !(x1 >= 0)) {
    tocado = true;
    viento = true;
    lluvia = Math.max(base.rain, F.LLUVIA.filter(m => x0 >= m).length);
  }
  if (x1 >= 0) { lluvia = base.rain; viento = base.wind; }
  if (tocado) { cfg.rain = arriba ? 0 : lluvia; cfg.wind = viento; }
  // EL CIELO: tormenta debajo del frente; el de antes antes, despues del despeje y POR ENCIMA de las nubes. Se
  // cambia solo escondido: en el pico de la niebla o adentro del blanco de la capa
  const quiere = adentro && !arriba ? 'storm' : base.sky;
  let cambio = false;
  if (cfg.sky !== quiere && (niebla > 0.6 || blanco > 0.6)) { cfg.sky = quiere; tocado = true; cambio = true; }
  // para el dibujo: la pared (a cuantos metros esta, si todavia esta adelante), la niebla y lo oscuro de antes
  run.frente = {
    muro: x0 < 0 && x0 > -F.VISTA ? -x0 : null,
    niebla: niebla * F.NIEBLA_A,
    oscuro: x0 < 0 && !arriba ? F.OSCURO * suave(1 + x0 / 1800) : 0,   // (la sombra de la pared llega antes que la pared)
    tapaSol: arriba ? 0 : x0 < 0 ? suave(1 + x0 / 1600) : adentro ? 1 : 0,   // (la aureola se apaga con la pared encima; arriba de las nubes, sol)
  };
  return cambio;
}

// SONDA: `__frente(m)` pone el cruce a `m` metros adelante (y sin despeje), para mirarlo sin esperar
if (typeof window !== 'undefined') window.__frente = (m = 2500, dura = null) => {
  def = { d0: run.dist + m, d1: dura ? run.dist + m + dura : null };
  return JSON.stringify(def);
};
if (typeof window !== 'undefined') window.__frenteDbg = () => (def ? { falta: Math.round(def.d0 - run.dist), sky: cfg.sky, rain: cfg.rain,
  wind: cfg.wind, fr: run.frente && { muro: run.frente.muro && Math.round(run.frente.muro), niebla: +run.frente.niebla.toFixed(2), oscuro: +run.frente.oscuro.toFixed(2) } } : null);
