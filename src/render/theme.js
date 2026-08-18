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

/** Resuelve el tema desde cfg. Lo llama applyCfg() cada vez que cambia el cielo o el agua. */
export function applyTheme(cfg) {
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
}
