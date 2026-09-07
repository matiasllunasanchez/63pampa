// LAS FASES DE UNA MISION — el catalogo de tipos y sus defaults.
// docs/sistemas/PLAN_MISION_CINCO_FASES.md, §11 (la forma definitiva: dos mitades, dos verbos).
//
// QUE ES. Una mision declara `fases: [...]` y con eso deja de ser un pasillo parejo de punta a
// punta: pasa a tener una IDA que se juega en sigilo (silencio, concentracion, sostener una
// linea) y una VUELTA que es la guerra del pasillo de siempre. Entras como fantasma y salis a
// las trompadas.
//
// COMO SE DECLARA, y es el mismo trato que `C(over)` le da al cfg en data/missions.js: la fase
// dice su TIPO y su final, y hereda del tipo todo lo que no diga. Una fase de filo es
//
//     { tipo: 'filo', hasta: 0.35 }
//
// y ya viene con el techo estrangulado, sin siembra, sin voces y con la nafta del rasante. Si esa
// fase en particular quiere otro techo, lo escribe: `{ tipo: 'filo', hasta: 0.35, radar: 4 }`.
//
// ESTE ARCHIVO NO TIENE LOGICA. Es la tabla; la resuelve core/fases.js y la sostiene
// systems/fases.js, con la misma division que core/tramos.js ↔ systems/tramos.js.
import { FILO_RADAR } from './tuning.js';

/** LOS DEFAULTS DE CADA TIPO, y la regla es que **solo declaran lo que el tipo CAMBIA**.
 *
 *  Una clave ausente aca no es un cero: es "de esto no opino", y entonces la lectura sigue de
 *  largo hasta el cfg de la mision. Es lo que permite que `rasante` sea literalmente el pasillo
 *  de hoy con la radio apagada, sin tener que repetir la densidad de cada mision que lo use.
 *
 *  Las llaves, y de donde sale cada una:
 *    obstacles/caza/bombs  la siembra, con el MISMO significado que en los tramos
 *    radar                 el techo de EL FILO (§11.1). Ausente = RADAR_ALT, el de siempre
 *    voces                 si el escuadron habla. Ver la nota de abajo: casi nunca hace falta
 *    nafta                 multiplicador de consumo por REGIMEN de vuelo (§3 del plan)
 *    pinta                 que pasa si te detectan: 'cap' (te esperan armados) | 'muerte'
 *
 *  SOBRE `voces`, y es la unica sutileza del archivo: el escuadron no tiene un interruptor —
 *  habla CUANDO PASA ALGO (te avisa del Harrier, te grita la ola, te canta la pasada). En las
 *  fases mudas no hay siembra ni cola, asi que **no hay nada de que hablar y el silencio sale
 *  solo**. `voces: false` esta igual porque es la declaracion de intencion del tramo —lo que el
 *  autor quiso— y porque el dia que una voz se cuele, el lugar donde apagarla ya tiene nombre. */
export const TIPOS = {
  // ARRIBA, el transito. Sin un solo enemigo, y es historico y es a proposito: es el unico rato
  // en que estos cinco tipos estan encerrados sin nada que hacer mas que hablarse.
  transito: { obstacles: 0, caza: 0, bombs: 0, voces: true, nafta: 1, pinta: 'cap' },

  // EL FILO — el tramo de concentracion (§11.1). Techo estrangulado, mundo vacio y radio muda:
  // no hay radio PORQUE ESTAS CONTENIENDO LA RESPIRACION, que es mejor motivo que el historico.
  // La nafta va a x2 aunque no sea el rasante del pasillo porque el regimen es el mismo: volar
  // pegado al agua cuesta el doble, y el filo es exactamente eso con el techo mas cerca.
  filo: { obstacles: 0, caza: 0, bombs: 0, radar: FILO_RADAR, voces: false, nafta: 2, pinta: 'cap' },

  // EL DESCENSO. No cambia la siembra —la hereda del cfg— porque su tension no es el enemigo:
  // es la decision de cuando bajar. Lo unico suyo es que aca se apagan las voces.
  descenso: { voces: false, nafta: 1.3, pinta: 'cap' },

  // EL RASANTE: el pasillo de hoy tal cual, pero mudo. Ni una perilla de siembra propia.
  rasante: { voces: false, nafta: 2, pinta: 'cap' },

  // EL BLANCO: la corrida final sobre el buque. Cae justo donde el CORDON FINAL ya vacia el
  // pasillo solo (VEIL_STOP), asi que no necesita apagar nada — el mundo ya se limpio.
  blanco: { voces: false, nafta: 2, pinta: 'cap' },

  // LA VUELTA: la guerra. El pasillo de siempre, con la siembra del cfg y las voces de vuelta.
  // x0.85 porque venis liviano: soltaste las bombas, y la vuelta es mas barata que la ida (§3).
  vuelta: { voces: true, nafta: 0.85, pinta: 'cap' },
};

/** Los tipos validos, para el validador y para los mensajes de error. */
export const TIPOS_VALIDOS = Object.keys(TIPOS);

/** Que puede contestar `pinta` cuando el radar te completa la carga (§11.3).
 *
 *  'cap' es el default y no es blandura: el primer filo cae en el minuto 1 de una mision de seis,
 *  y una muerte ahi no cobra dificultad — cobra REJUGAR LA PARTE TRANQUILA. Con 'cap' no perdes
 *  la corrida: perdes el silencio, y de ahi en adelante el mundo te espera armado.
 *  'muerte' es la version seca, y existe para que el playtest pueda pedirla cambiando una palabra. */
export const PINTAS = ['cap', 'muerte'];
