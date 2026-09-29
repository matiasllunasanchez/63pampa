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
  // LA DEMO: todas las costuras de G1 en una sola pasada. En la ida: una costa que ENTRA por la
  // izquierda y SALE al mar; una tierra con lomas a la que se entra y se sale por PLAYA que cruza
  // el carril; y una costa del otro lado. En la vuelta, un tramo de tierra mas movido. El buque
  // (fraccion 1) queda en mar abierto.
  demo: [
    { hasta: 0.20, suelo: 'mar' },
    { hasta: 0.30, suelo: 'costa', lado: 'izq' },
    { hasta: 0.36, suelo: 'mar' },
    { hasta: 0.46, suelo: 'tierra', lomas: 3 },
    { hasta: 0.54, suelo: 'mar' },
    { hasta: 0.66, suelo: 'costa', lado: 'der' },
    { hasta: 1.10, suelo: 'mar' },
    { hasta: 1.26, suelo: 'tierra', lomas: 5 },
    { hasta: 2.00, suelo: 'mar' },
  ],
};
