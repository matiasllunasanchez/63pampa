// TEMA ACTIVO del mapa: la paleta de cielo y agua que esta en uso ahora mismo.
//
// `cfg.sky` / `cfg.water` son la ELECCION (strings: 'dusk', 'sea'…); esto es la paleta resuelta
// que sale de esa eleccion. Se separa porque la leen varios: el render 2D (cielo, mar), el telon
// 3D y el HUD. Es un objeto de identidad estable que se MUTA (no se reasigna), igual que los
// demas stores — asi todos ven el cambio al tocar el menu [M] o al cargar un nivel.

import { WATER_STYLES, SKY_PRESETS } from '../data/palette.js';

export const theme = {
  sky: SKY_PRESETS.dusk,
  water: WATER_STYLES.sea,
};

/** Resuelve el tema desde cfg. Lo llama applyCfg() cada vez que cambia el cielo o el agua. */
export function applyTheme(cfg) {
  theme.water = WATER_STYLES[cfg.water] || WATER_STYLES.sea;
  theme.sky = SKY_PRESETS[cfg.sky] || SKY_PRESETS.dusk;
}
