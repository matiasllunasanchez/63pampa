// LA PRIMERA PERSONA — F0, la espiga (docs/sistemas/PLAN_PRIMERA_PERSONA.md, 14/10/2026).
//
// "¿Se siente?": el mismo juego visto desde la cabina, con lo minimo. No se reescribe ningun render:
// todo el juego mide la profundidad DESDE EL OJO y el avion vuela a `PZ` (14 m delante de la camara
// de persecucion). En cabina `PZ` pasa a PZ_CABINA —el avion queda pegado al ojo— y la camara se
// clava en el avion (systems/vuelo.js). Colisiones, disparos y suelta miden contra `PZ`, asi que el
// juego sigue igual: lo que cambia es desde donde se mira.
//
// Lo que esta espiga NO resuelve (lo dice el plan): el cabeceo es un corrimiento del mundo, no un
// horizonte de verdad; la cabina es la imagen de siempre (la del PULSO), sin relojes vivos; LA COLA
// (el Harrier que se te pone atras a z 6) queda DELANTE del ojo.
//
// Se conmuta con [V] / el boton de camara del mando (game.js `cycleCamera`), y `?cabina` arranca en ella.
// SIN render/ctx.js: lo importa core/horizon.js, que se prueba en Node (ctx toca `document`). El `PZ`
// lo pone game.js (`aplicarCabina` alla), leyendo `enCabina()` de aca.
import { S } from './state.js';

export const CABINA = {
  PZ: 1.6,          // a que profundidad queda el avion delante del ojo (m): el morro
  OJO: 0.45,        // cuanto mas alto que el avion va el ojo (el piloto se sienta arriba del eje)
  PZ_AFUERA: 14,    // el PZ de siempre, la camara de persecucion
  CABECEO_PX: 16,   // cuanto corre el mundo (px de 480x270) el cabeceo pleno: el falso horizonte
};

export const cabina = {
  on: typeof location !== 'undefined' && /[?&]cabina\b/.test(location.search),
};

/** ¿Se esta mirando desde la cabina AHORA? Solo en el vuelo: los menus, el despegue (la formacion
 *  viene detras del ojo) y las cinematicas siguen en tercera. */
export const enCabina = () => cabina.on && (S.state === 'play' || S.state === 'relevo' || S.state === 'dead');
