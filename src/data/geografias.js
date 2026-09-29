// GEOGRAFIAS CON NOMBRE (docs/sistemas/PLAN_GEOGRAFIA.md) — mapas de terreno listos para usar.
//
// Una mision escribe su `geografia:` en linea, como escribe sus `fases:`. Esto es para las que
// conviene NOMBRAR: los bancos de prueba, y la sonda `?geo=<nombre>`, que pisa la geografia de la
// mision que se este jugando. Con `?mision=t17&geo=demo` se vuela IDA Y VUELTA SMALL entera con
// esta geografia encima, sin tocar la definicion de la mision.
//
// FRACCIONES DE 0 A 2: la ida hasta el buque (1) y la vuelta hasta casa (2). El buque tiene que
// quedar SOBRE EL MAR — la suelta es contra un barco —, asi que alrededor de 1 siempre hay agua.

export const GEOGRAFIAS = {
  // EN KILOMETROS (G5): la forma de escribir UNA mision — se parte el camino en tramos de tantos km,
  // antes y despues del blanco. Hecha para t17 (6 km de ida): `?mision=t17&geo=km`. El ultimo tramo
  // de cada lista no dice `km` — es lo que falte hasta el blanco, o hasta casa.
  km: {
    ida: [
      { km: 1.2, suelo: 'mar' },
      { km: 0.6, suelo: 'mar', niebla: 1 },
      { km: 0.6, suelo: 'mar' },
      { km: 0.5, suelo: 'isla', alto: 10 },
      { km: 0.8, suelo: 'mar' },
      { km: 0.6, suelo: 'mar', paredes: 'izq' },
      { suelo: 'mar' },
    ],
    vuelta: [
      { km: 0.6, suelo: 'mar' },
      { km: 0.8, suelo: 'tierra', lomas: 3 },
      { km: 0.5, suelo: 'mar' },
      { km: 0.4, suelo: 'isla', alto: 10, ancho: 0.5, x: -18 },
      { suelo: 'mar' },
    ],
  },

  // LA DEMO: todo lo que la geografia sabe hacer, en una sola pasada. En la ida: un banco de niebla
  // puesto en mar abierto (G2); una costa que ENTRA por la
  // izquierda y SALE al mar; una tierra con lomas a la que se entra y se sale por PLAYA que cruza
  // el carril; una costa del otro lado; y (G3) un estrecho de ACANTILADOS — primero a la izquierda,
  // despues de los dos lados con un PUENTE que lo cruza, despues a la derecha. En la vuelta, un
  // tramo de tierra mas movido con acantilado a la izquierda, una ROCA que cierra un callejon, y
  // (G4) tres ISLAS: una de lado a lado que se sube por la playa, una parcial que deja un canal a la
  // derecha, y una chica de farallon que no se trepa. El buque (fraccion 1) queda en mar abierto.
  demo: [
    { hasta: 0.08, suelo: 'mar' },
    { hasta: 0.16, suelo: 'mar', niebla: 1 },   // G2: un banco PUESTO, no sorteado
    { hasta: 0.20, suelo: 'mar' },
    { hasta: 0.30, suelo: 'costa', lado: 'izq' },
    { hasta: 0.36, suelo: 'mar' },
    { hasta: 0.46, suelo: 'tierra', lomas: 3 },
    { hasta: 0.54, suelo: 'mar' },
    { hasta: 0.66, suelo: 'costa', lado: 'der' },
    { hasta: 0.70, suelo: 'mar' },
    { hasta: 0.76, suelo: 'mar', paredes: 'izq' },                        // G3: acantilado a la izquierda
    { hasta: 0.84, suelo: 'mar', paredes: 'ambos', barrera: 'puente' },   // el estrecho, con un puente
    { hasta: 0.90, suelo: 'mar', paredes: 'der' },                        // y la izquierda se abre
    { hasta: 1.10, suelo: 'mar' },
    { hasta: 1.26, suelo: 'tierra', lomas: 5, paredes: 'izq' },          // acantilado sobre la turba
    { hasta: 1.34, suelo: 'mar' },
    { hasta: 1.44, suelo: 'mar', paredes: 'ambos', barrera: 'roca' },    // el callejon cerrado: por arriba
    { hasta: 1.50, suelo: 'mar' },
    { hasta: 1.58, suelo: 'isla' },                                        // G4: de lado a lado, se sube por la playa
    { hasta: 1.64, suelo: 'mar' },
    { hasta: 1.70, suelo: 'isla', alto: 12, ancho: 0.55, x: -17 },        // por encima o por el canal de la derecha
    { hasta: 1.76, suelo: 'mar' },
    { hasta: 1.80, suelo: 'isla', alto: 16, borde: 'acantilado' },        // farallon: se sobrevuela, no se trepa
    { hasta: 2.00, suelo: 'mar' },
  ],
};
