// TEMA ACTIVO del mapa: la paleta de cielo y agua que esta en uso ahora mismo.
//
// `cfg.sky` / `cfg.water` son la ELECCION (strings: 'dusk', 'sea'…); esto es la paleta resuelta
// que sale de esa eleccion. Se separa porque la leen varios: el render 2D (cielo, mar), el telon
// 3D y el HUD. Es un objeto de identidad estable que se MUTA (no se reasigna), igual que los
// demas stores — asi todos ven el cambio al tocar el menu [M] o al cargar un nivel.

import { WATER_STYLES, WATER_AUTO, SKY_PRESETS, LAND, CLAND,
         LAND_STYLES, CLAND_STYLES, LAND_AUTO } from '../data/palette.js';

export const theme = {
  sky: SKY_PRESETS.dusk,
  water: WATER_STYLES.sea,
  // EL SUELO TAMBIEN ES TEMA (PLAN_TIERRA_COSTA T1). Antes `render/world.js` importaba LAND y
  // CLAND directo de la paleta, o sea que la turba era la misma bajo cualquier cielo. Ahora pasan
  // por aca como el agua, y por el mismo motivo: son paleta ACTIVA, no constantes.
  land: LAND,
  cland: CLAND,
};

// EL CAMBIO PAULATINO (23/11, el autor: "en POR LA PATRIA estoy andando a la tarde y se vuelve de noche de una… debe ser
// paulatino, con opacidad"): con `dur` (segundos), el tema no salta al cielo nuevo — mezcla color por color desde el
// que estaba (`pasoTema`, cada cuadro). Sin `dur`, como siempre: de una (arranque, menu, el video del viraje).
let trans = null;   // { de: {sky, water, land, cland}, a: {…}, t, dur }
const hex2 = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
const esHex = c => typeof c === 'string' && /^#[0-9a-f]{6}$/i.test(c);
function mezcla(a, b, k) {
  const o = {};
  for (const key of new Set([...Object.keys(a || {}), ...Object.keys(b || {})])) {
    const x = a && a[key], y = b && b[key];
    if (esHex(x) && esHex(y)) {
      const p = hex2(x), q = hex2(y);
      o[key] = '#' + p.map((v, i) => Math.round(v + (q[i] - v) * k).toString(16).padStart(2, '0')).join('');
    } else o[key] = k < 0.5 && x !== undefined ? x : y;
  }
  return o;
}
/** Un paso de la mezcla (segundos de pared). Devuelve true mientras siga mezclando. */
export function pasoTema(dt) {
  if (!trans) return false;
  trans.t = Math.min(trans.dur, trans.t + dt);
  // (en escalones de 1/24: las capas horneadas con la paleta —sierras, nubes— se rehacen pocas veces, no cada cuadro)
  const u = Math.round((trans.t / trans.dur) * 24) / 24, k = u * u * (3 - 2 * u);
  if (trans.u !== u) {
    trans.u = u;
    for (const c of ['sky', 'water', 'land', 'cland']) theme[c] = u >= 1 ? trans.a[c] : mezcla(trans.de[c], trans.a[c], k);
  }
  if (trans.t >= trans.dur) { trans = null; return false; }
  return true;
}
/** ¿Esta mezclando? (0..1 de avance, o null). */
export const temaMezcla = () => (trans ? trans.t / trans.dur : null);

/** Resuelve el tema desde cfg. Lo llama applyCfg() cada vez que cambia el cielo o el agua. */
export function applyTheme(cfg, dur) {
  const de = dur > 0 ? { sky: theme.sky, water: theme.water, land: theme.land, cland: theme.cland } : null;
  trans = null;
  // AGUA EN AUTO (F5): el mar lo elige el CIELO. Es el default, y la razon es que la mision ya
  // decide el cielo en campaña: sin esto, un temporal se jugaba sobre el mismo mar celeste del
  // atardecer y el clima quedaba a medio contar. Elegir un estilo a mano sigue mandando — la
  // fila AGUA de OPCIONES pisa el auto, que es para lo que existe una opcion.
  const w = cfg.water === 'auto' ? (WATER_AUTO[cfg.sky] || 'sea') : cfg.water;
  theme.water = WATER_STYLES[w] || WATER_STYLES.sea;
  theme.sky = SKY_PRESETS[cfg.sky] || SKY_PRESETS.dusk;
  // EL SUELO SIEMPRE VA EN AUTO, y esto es a proposito: el agua tiene una fila en OPCIONES porque
  // el mar es el fondo de casi todo el juego y hay gusto de por medio. La turba no — nadie quiere
  // "turba violeta". Que el suelo acompañe al cielo no es una preferencia, es que el mapa sea
  // coherente, asi que no lleva perilla (§6.6 del spec del agua: no agregar opciones de mas).
  const l = LAND_AUTO[cfg.sky];
  theme.land = (l && LAND_STYLES[l]) || LAND;
  theme.cland = (l && CLAND_STYLES[l]) || CLAND;
  if (de) {
    trans = { de, a: { sky: theme.sky, water: theme.water, land: theme.land, cland: theme.cland }, t: 0, dur, u: -1 };
    for (const c of ['sky', 'water', 'land', 'cland']) theme[c] = de[c];   // arranca donde estaba
  }
}
