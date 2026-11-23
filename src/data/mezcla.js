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
// EL BALANCE MEDIDO (21/11, el autor: "analiza la relacion del volumen de las cosas del juego y ajustalo"): ffmpeg
// ebur128 sobre cada archivo × su volumen en el codigo. Antes la musica de vuelo (-24,5 LUFS efectivos) era lo mas
// fuerte del vuelo constante; el MOTOR a -43 (no se oia), agua/viento a -52, la metralla a -29, las explosiones
// medianas/chicas a -28/-30 (DEBAJO de la musica) y la RADIO a -26, peleando con la musica. Objetivo: musica de
// colchon a ~-27,5; voz ~-20; armas y explosiones arriba de la musica; motor y ambiente presentes sin tapar nada.
export const MEZCLA = {
  musica: 1.5,      // (18/10, el autor: "priorizar la musica, un poco mas alta"; era 0.8, despues 1)
  // (18/10, el autor: "los sonidos de aviones y demas estan MUY FUERTES": vuelo y combate a ~60%, y el
  // ambiente y las explosiones se separaron a sus grupos para que respondan a su perilla)
  vuelo: 0.18,     // (21/11, era 0.13: el motor quedaba a -43 LUFS, inaudible; probado 0.25 y "demasiado fuerte": 0.18, ~-40, bajo la musica — el 18/10 se habia pedido que no tape) TU avion: motor, poscombustion, el agua y el roce
  combate: 0.2,     // (21/11, era 0.15: la metralla a -29 quedaba 5 dB bajo la musica; ahora a la par) TUS armas: metrallas, cañon, misiles, bombas, los golpes que recibis
  ambiente: 0.25,   // (21/11, era 0.16) el mundo: lluvia, tormenta, viento, la guerra a lo lejos
  enemigo: 0.6,     // (21/11, era 0.3; la extra pesada y los truenos bajaron en sfx.js) las explosiones y lo que lanzan los enemigos (18/10: "las explosiones un poco mas altas, el doble")
  atencion: 0.35,   // radares, detectando, alarma, Exocet, el lanzamiento del buque
  voz: 1.0,         // (21/11, era 0.5: a la par de la musica; ahora ~7 dB arriba) la radio de los pilotos
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
  ambRain: 'ambiente', ambStorm: 'ambiente', olaGigante: 'ambiente', truenoDoble: 'enemigo', truenoLargo: 'enemigo', truenoCorto: 'enemigo', ambWarFar: 'ambiente', ambWarNear: 'ambiente', ambWind: 'ambiente',
  exXheavy: 'enemigo', exHeavy: 'enemigo', exHeavyDist: 'enemigo', exMedium: 'enemigo', exSmall: 'enemigo', exXsmall: 'enemigo',
  lanzaMisil: 'enemigo', balasCerca: 'enemigo', agua0: 'enemigo', agua1: 'enemigo', aguaColumna: 'enemigo', chapa0: 'enemigo', chapa1: 'enemigo', chapa2: 'enemigo', chapa3: 'enemigo',
  radarAzul: 'atencion', radarDetecta: 'atencion', radarVerde: 'atencion', radarVerdeInicio: 'atencion',
  radarDetectando: 'atencion', exocetSale: 'atencion', alarm: 'atencion', planeFail: 'atencion',
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
