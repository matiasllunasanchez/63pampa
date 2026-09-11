// LOS GESTOS DEL PILOTO EN VUELO (playtest 10/9): el cuadro de la cara, al lado del horizonte.
//
// Es INMERSION PURA — no dice nada que un instrumento no diga ya — y justamente por eso la regla
// es que nunca mienta: la cara cambia por lo MISMO que el tablero, un instante antes de que el
// jugador lo lea. Preocupado cuando rozas o te pinta el radar, con ceño cuando exprimis el avion,
// una sonrisa cuando algo se va al agua, roto cuando el avion se esta cayendo a pedazos.
//
// LAS CARAS YA EXISTEN: los cinco Fieles tienen neutro, ceno, preocupado, sonrisa y roto en
// assets/portraits (108x108). Usa el set a CARA DESCUBIERTA para todos, TERO incluido: `tero_casco`
// es el unico retrato con casco y mascara, y como no tiene gestos, alternarlo haria que el casco
// apareciera y desapareciera con cada cambio de cara.

/** Nombre de piloto (sin tildes) → prefijo de sus retratos. Un piloto que no esta aca (los
 *  indicativos PATRIA n de los modos rapidos) no tiene cuadro: no hay cara que mostrar. */
export const CARA_PILOTO = { TERO: 'tero', PUMA: 'puma', GITANO: 'gitano', VASCO: 'vasco', PICHON: 'pichon' };

/** De MAS a MENOS urgente. Subir de gesto es inmediato; bajar espera `GESTO_SOSTEN`. */
export const GESTOS = ['roto', 'preocupado', 'sonrisa', 'ceno', 'neutro'];

// Segundos minimos antes de BAJAR a un gesto menos urgente. Sin esto, un roce de un cuadro o una
// ola que toca el margen hacen parpadear la cara, y una cara que parpadea no es una cara: es un
// indicador roto. Subir no espera — el susto llega cuando llega.
export const GESTO_SOSTEN = 0.9;

// LA SONRISA sale de un SALTO de puntaje en un solo cuadro: el goteo del multiplicador suma de a
// poco, un derribo o un blanco suma de golpe. Este es el umbral y lo que dura.
export const SONRISA_PTS = 250;
export const SONRISA_T = 1.4;
