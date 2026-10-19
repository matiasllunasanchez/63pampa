// LA MEZCLA — en que grupo (bus) va cada sonido y cuanto pesa cada grupo. Datos puros; el que los
// aplica es systems/audio.js.
//
// Pedido del autor (18/10/2026): "los sonidos estan MUY ALTOS TODOS (...) que se pueda disfrutar el sonido
// de las balas y el motor mezclado con la musica, pero que el radar cuando este activo tome cierto
// protagonismo". Hasta hoy cada sample llevaba un maestro de 0.3 —salvo los que traian `m: 1`, que lo
// salteaban y sonaban a pleno: el radar, las pantallas, el Exocet, la voz—, y no habia nada que hiciera
// lugar. Ahora todo sale por un GRUPO, y cuando el radar te esta mirando los demas se corren.

/** CUANTO SUENA CADA GRUPO: multiplica el volumen propio de cada sonido (`v` en data/sfx.js). La musica
 *  multiplica el volumen base de cada pista (audio.js). */
export const MEZCLA = {
  musica: 1.5,      // (18/10, el autor: "priorizar la musica, un poco mas alta"; era 0.8, despues 1)
  // (18/10, el autor: "los sonidos de aviones y demas estan MUY FUERTES": vuelo y combate a ~60%, y el
  // ambiente y las explosiones se separaron a sus grupos para que respondan a su perilla)
  vuelo: 0.13,      // TU avion: motor, poscombustion, el agua y el roce
  combate: 0.15,    // TUS armas: metrallas, cañon, misiles, bombas, los golpes que recibis
  ambiente: 0.16,   // el mundo: lluvia, tormenta, viento, la guerra a lo lejos
  enemigo: 0.3,     // las explosiones y lo que lanzan los enemigos (18/10: "las explosiones un poco mas altas, el doble")
  atencion: 0.35,   // radares, detectando, alarma, Exocet, el lanzamiento del buque
  voz: 0.5,         // la radio de los pilotos
  pantalla: 0.38,   // BIOS, tarjeta, teclas, ficha
};

/** EL RADAR TOMA LA ESCENA: mientras te estan mirando (el verde en el techo, o DETECTANDO) los demas
 *  grupos bajan a esta fraccion. Entra en `entra` segundos y vuelve en `sale`. */
export const FOCO_RADAR = { musica: 0.4, vuelo: 0.6, ambiente: 0.6, entra: 0.3, sale: 1.0 };

/** Cuantas explosiones pueden sonar a la vez: cinco juntas saturan y no se distingue ninguna. */
export const EXPLOSIONES_MAX = 3;

/** La metralla cambia apenas de tono en cada rafaga (±3%): el mismo loop siempre igual cansa. */
export const METRALLA_TONO = 0.03;

/** EL GRUPO DE CADA SONIDO del catalogo. Lo que no esta aca va a `combate`. */
export const BUS_DE = {
  engN: 'vuelo', engN2: 'vuelo', turbo: 'vuelo', abInicio: 'vuelo', abSostenido: 'vuelo', lv1: 'vuelo',
  waterNear: 'vuelo', waveFly: 'vuelo', graze: 'vuelo', swoosh: 'vuelo',
  ambRain: 'ambiente', ambStorm: 'ambiente', ambWarFar: 'ambiente', ambWarNear: 'ambiente', ambWind: 'ambiente',
  exXheavy: 'enemigo', exHeavy: 'enemigo', exHeavyDist: 'enemigo', exMedium: 'enemigo', exSmall: 'enemigo', exXsmall: 'enemigo',
  lanzaMisil: 'enemigo',
  radarAzul: 'atencion', radarDetecta: 'atencion', radarVerde: 'atencion', radarVerdeInicio: 'atencion',
  radarDetectando: 'atencion', exocetSale: 'atencion', alarm: 'atencion',
  pilot: 'voz',
  insertCoin: 'pantalla', bootPc: 'pantalla', tituloBeep: 'pantalla', tecla: 'pantalla',
};

/** LAS PERILLAS DEL JUGADOR (OPCIONES → SONIDO): que grupos mueve cada una. */
// (18/10, el autor: "VOLUMEN DE MUSICA, VOLUMEN DE AMBIENTE y VOLUMEN DE UNIDAD: unidad todo lo que refiere a
// mi avion y mis sonidos, ambiente a nivel general y unidades enemigas, y musica solo musica")
export const PERILLAS_SONIDO = {
  musica: ['musica'],
  ambiente: ['ambiente', 'enemigo', 'pantalla'],
  unidad: ['vuelo', 'combate', 'atencion', 'voz'],
};
