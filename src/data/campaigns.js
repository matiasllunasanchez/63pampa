// CAMPAÑAS del modo HISTORIA. Datos puros: la lista que dibuja el menu de historia y la que
// rotula las partidas guardadas (systems/saves.js). Los nombres son propios y NO se traducen.
//
// `missions` apunta a la lista de misiones de cada una; `enabled: false` deja la campaña VISIBLE
// pero bloqueada en el menu ("PROXIMAMENTE") — existe para que la estructura de dos campañas este
// en pie desde ya, aunque la segunda no tenga guion todavia.
import { MISSIONS } from './missions.js';

export const CAMPAIGNS = [
  // renombrada (pedido 6/8): era LA MESA DE NORMA. El `id` NO cambia: rotula las partidas
  // guardadas en localStorage y renombrarlo las dejaria huerfanas.
  { id: 'norma', name: 'EL CUADERNO DE MATEO', missions: MISSIONS, enabled: true },
  { id: 'fantasma', name: 'EL FANTASMA DEL MAR', missions: null, enabled: false },
];
