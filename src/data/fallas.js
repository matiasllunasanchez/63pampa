// LAS FALLAS DEL AVION — POR LA PATRIA y CICLO DE MUERTE (docs/sistemas/PLAN_FALLAS.md). Datos puros.
//
// El autor (17/10/2026): "1 de cada 3 aviones que salia a mision tenia que volver por fallas, generalmente
// de reaprovisionamiento; 1 de cada 5 tenia algun error al querer lanzar las bombas porque no se
// desprendian; y una explosion cerca podia dañar alguna parte del equipo". Las cuentas de 1982 estan en
// docs/sistemas/FALLAS_1982.md (son muestras que exageran: el juego va por debajo).
//
// Cada avion de la escuadrilla sale con su tirada: por SISTEMA, un dado contra `base`, y si sale, el
// GRADO con `grados` (pesos de LEVE / MEDIA / TOTAL). Se quedan las DOS mas graves: con mas, la
// escuadrilla seria un hospital. Una explosion cerca (`ESQUIRLA`) puede dañar un sistema o subirle un grado.
//
// Los grados: 0 sano · 1 LEVE (anda, peor) · 2 MEDIA (anda a medias) · 3 TOTAL (no existe en este avion).

export const SISTEMAS = {
  // EL REABASTECIMIENTO (la sonda): el historico, el que mas fallaba. Cargado a TOTAL: "tenia que volver".
  reabast: { base: 0.33, grados: [35, 30, 35], es: ['CARGA LENTA', 'SE DESENGANCHA', 'SONDA ROTA'],
    en: ['SLOW REFUEL', 'DISCONNECTS', 'PROBE BROKEN'] },
  // EL LANZADOR: las bombas que no se desprenden
  bombas: { base: 0.20, grados: [50, 35, 15], es: ['SE TRABA A VECES', 'SE TRABA SEGUIDO', 'NO SE DESPRENDEN'],
    en: ['JAMS AT TIMES', 'JAMS OFTEN', 'WON\'T RELEASE'] },
  // LOS CAÑONES
  canon: { base: 0.10, grados: [50, 35, 15], es: ['RECALIENTA', 'UN SOLO CAÑON', 'CAÑONES MUDOS'],
    en: ['OVERHEATS', 'ONE GUN ONLY', 'GUNS DEAD'] },
  // EL ALTIMETRO: no quita nada, cambia COMO se vuela
  altimetro: { base: 0.06, grados: [50, 35, 15], es: ['ALTIMETRO TIEMBLA', 'ALTIMETRO ATRASA', 'ALTIMETRO MUERTO'],
    en: ['ALTIMETER JITTERS', 'ALTIMETER LAGS', 'ALTIMETER DEAD'] },
};
export const SISTEMAS_ID = Object.keys(SISTEMAS);
/** Cuantas fallas puede tener un avion a la vez. */
export const MAX_FALLAS = 2;

/** LA ESQUIRLA: una explosion cerca (la nube de chafitas que revienta un misil, una explosion que se
 *  atraviesa) daña un sistema con `p`, elegido con estos pesos — "generalmente el sistema de lanzamiento de
 *  bombas o cañones". Si ya estaba fallado, le sube un grado. */
export const ESQUIRLA = { p: 0.25, pesos: { bombas: 40, canon: 40, reabast: 10, altimetro: 10 } };

/** VOLVER A LA BASE: cuanto tarda en volver reparado y lleno (segundos de vuelo). */
export const BASE_T = 90;

/** Elegir un indice segun pesos (con `rnd` 0..1). */
function pesado(pesos, rnd) {
  const tot = pesos.reduce((s, x) => s + x, 0);
  let x = rnd() * tot;
  for (let i = 0; i < pesos.length; i++) if ((x -= pesos[i]) < 0) return i;
  return pesos.length - 1;
}

/** Deja solo las MAX_FALLAS mas graves de `f` ({ sistema: grado }). */
export function recortar(f) {
  const ids = Object.keys(f).filter(k => f[k] > 0).sort((a, b) => f[b] - f[a]);
  const out = {};
  for (const k of ids.slice(0, MAX_FALLAS)) out[k] = f[k];
  return out;
}

/** LA TIRADA DE UNA SALIDA para un avion: suma a lo que ya traia (`previas`), sin bajar nada. */
export function tirarFallas(previas = {}, rnd = Math.random) {
  const f = { ...previas };
  for (const id of SISTEMAS_ID) {
    const s = SISTEMAS[id];
    if (rnd() >= s.base) continue;
    const g = pesado(s.grados, rnd) + 1;
    f[id] = Math.max(f[id] || 0, g);
  }
  return recortar(f);
}

/** LA ESQUIRLA sobre `f`: con ESQUIRLA.p, un sistema elegido por peso se daña (o sube un grado). Devuelve
 *  { fallas, sistema } — sistema null si no paso nada. */
export function esquirla(f, rnd = Math.random) {
  if (rnd() >= ESQUIRLA.p) return { fallas: f, sistema: null };
  const ids = Object.keys(ESQUIRLA.pesos), id = ids[pesado(ids.map(k => ESQUIRLA.pesos[k]), rnd)];
  const n = { ...f, [id]: Math.min(3, (f[id] || 0) + 1) };
  return { fallas: recortar(n), sistema: id };
}

/** EL ESTADO DE UN AVION, para el indicador de vidas: 'bien' · 'fallas' · 'muchas' (una TOTAL o dos). */
export function estadoAvion(f) {
  const g = Object.values(f || {}).filter(x => x > 0);
  if (!g.length) return 'bien';
  if (g.length >= 2 || g.some(x => x >= 3)) return 'muchas';
  return 'fallas';
}

/** Repara en `f` los sistemas de grado <= `hasta` (1-2: el TALLER LIVIANO; 3: el PESADO). */
export function reparar(f, hasta) {
  const out = {};
  for (const [k, g] of Object.entries(f || {})) if (g > hasta) out[k] = g;
  return out;
}

/** Las fallas en palabras, para el cartel al cambiar de avion ("SONDA ROTA · UN SOLO CAÑON"). */
export function textoFallas(f, lang = 'es') {
  return Object.entries(f || {}).filter(([, g]) => g > 0).sort((a, b) => b[1] - a[1])
    .map(([k, g]) => SISTEMAS[k][lang === 'en' ? 'en' : 'es'][g - 1]).join('  ·  ');
}
