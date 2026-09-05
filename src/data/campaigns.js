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
  // `intro` es la clave de STRINGS con la apertura historica (Malvinas 1833→1982, la Junta,
  // Operacion Rosario). Vivia al principio de storyM1 y abria la campaña 1 con una clase de
  // historia; la campaña 1 arranca ahora en el arroyo. La apertura queda RESERVADA aca: es esta
  // campaña —la de la flota— la que si necesita el contexto antes de la primera salida.
  // { id: 'fantasma', name: 'EL FANTASMA DEL MAR', missions: null, intro: 'storyC2Intro', enabled: false },
];
