// EL FRIO — la temperatura exterior y lo que le hace al avion (20/11, el autor). Lo usan LAS ISLAS (con su clima,
// data/islas_clima.js) y EL PASILLO (con su cielo, su lluvia y su niebla): systems/frio.js.
//
// Lo que el autor trajo de la campaña (y que el juego vuelve mecanicas SIMPLES, para entender por lo que pasaban):
//   · ENGELAMIENTO: atravesar nubes o humedad con 0 °C o menos le juntaba HIELO en los bordes de ataque y la toma de
//     aire. El A-4B no tenia antihielo en las alas ni en la cola (solo calefaccion del Pitot, el parabrisas y partes
//     del motor): el hielo PESA y quita sustentacion y control. La salida era bajar a aire mas templado cerca del mar
//     (rasante sobre el oceano, apenas arriba de cero, el aire denso lo derretia) o subir por encima de las nubes,
//     donde el aire es seco y no hay humedad que se congele.
//   · EL CAÑON: el frio intenso en altura congelaba la humedad y hacia caer la presion del neumatico que alimentaba y
//     recargaba los Colt Mk 12 de 20 mm: se trababa mucho mas seguido y tiraba mas lento.
//   · LA SAL: volando a metros de las olas el rocio golpeaba el vidrio caliente y se evaporaba dejando sal (sin
//     lavaparabrisas de agua dulce). En el juego, con el aire frio (SAL_T para abajo).
//   · EL ARRANQUE: con mucho frio en las bases del continente los fluidos se endurecian y fallaban retenes y
//     arranques: mas fallas al salir.
//   · LA TURBULENCIA: los frentes de tormenta con frio sacudian al avion.
// ⚠ Los numeros son de juego. Lo que cambia por avion (antihielo, cañon, etc.) va en data/perfiles.js `frio`.

export const GRADIENTE = 6.5;            // °C menos cada 1000 m
export const HIELO = {
  T: 1,                                  // °C: con esto o menos, y humedad, se junta hielo
  JUNTA: 0.055, JUNTA_NUBE: 0.09,        // por segundo (adentro de las nubes, mas rapido)
  SALE: 0.035, SALE_CALIDO: 0.09,        // por segundo (arriba de 3 °C, o rasante sobre el mar, se va rapido)
  RASANTE: 40,                           // m: abajo de esto sobre el agua, el aire del mar lo derrite
  PESA: 15,                              // m/s² que tira para abajo con el hielo lleno (hay que darle gas)
  CONTROL: 0.5,                          // cuanto del control se pierde con el hielo lleno (las islas: el viraje)
};
// EL CAÑON con frio: por debajo de CANON_T °C se traba antes (el limite de calor baja hasta CANON_LIMITE) y tira mas
// lento (hasta la mitad), y a veces se traba solo (CANON_TRABA por tiro), todo pleno a CANON_T - CANON_RANGO
export const CANON_T = -2, CANON_RANGO = 8, CANON_LIMITE = 0.55, CANON_TRABA = 0.02;
// LA SAL del parabrisas: solo con el aire a SAL_T °C o menos
export const SAL_T = 6;
// EL ARRANQUE con frio: las fallas al salir son ARRANQUE.k veces mas probables segun la temperatura de la base
export const ARRANQUE = [[0, 2.5], [3, 1.6]];   // [°C o menos, k]
// LA TURBULENCIA del frente frio: con tormenta o lluvia fuerte y TURB_T °C o menos
export const TURB_T = 2;

// EL PASILLO: la temperatura al nivel del mar segun el cielo (y la lluvia la baja), de dia nublado del Atlantico Sur
// (al nivel del mar queda apenas arriba de cero aun en tormenta: volar rasante sobre el oceano derrite el hielo)
export const T_CIELO = { clear: 7, sun: 8, cloudy: 4, dusk: 4, dawn: 3, night: 2, moon: 2, storm: 2.5 };
export const T_LLUVIA = -1, T_NIEBLA = -0.5;
