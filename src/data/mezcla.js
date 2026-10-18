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
  musica: 1,        // (18/10, el autor: "un poco mas alta la musica"; era 0.8)
  vuelo: 0.22,      // motor, poscombustion, agua, ambiente
  combate: 0.25,    // metrallas, cañon, misiles, explosiones
  atencion: 0.35,   // radares, detectando, alarma, Exocet, el lanzamiento del buque
  voz: 0.5,         // la radio de los pilotos
  pantalla: 0.38,   // BIOS, tarjeta, teclas, ficha
};

/** EL RADAR TOMA LA ESCENA: mientras te estan mirando (el verde en el techo, o DETECTANDO) los demas
 *  grupos bajan a esta fraccion. Entra en `entra` segundos y vuelve en `sale`. */
export const FOCO_RADAR = { musica: 0.4, vuelo: 0.6, entra: 0.3, sale: 1.0 };

/** Cuantas explosiones pueden sonar a la vez: cinco juntas saturan y no se distingue ninguna. */
export const EXPLOSIONES_MAX = 3;

/** La metralla cambia apenas de tono en cada rafaga (±3%): el mismo loop siempre igual cansa. */
export const METRALLA_TONO = 0.03;

/** EL GRUPO DE CADA SONIDO del catalogo. Lo que no esta aca va a `combate`. */
export const BUS_DE = {
  engN: 'vuelo', engN2: 'vuelo', turbo: 'vuelo', abInicio: 'vuelo', abSostenido: 'vuelo', lv1: 'vuelo',
  waterNear: 'vuelo', waveFly: 'vuelo', graze: 'vuelo',
  ambRain: 'vuelo', ambStorm: 'vuelo', ambWarFar: 'vuelo', ambWarNear: 'vuelo', ambWind: 'vuelo',
  radarAzul: 'atencion', radarDetecta: 'atencion', radarVerde: 'atencion', radarVerdeInicio: 'atencion',
  radarDetectando: 'atencion', exocetSale: 'atencion', lanzaMisil: 'atencion', alarm: 'atencion',
  pilot: 'voz',
  insertCoin: 'pantalla', bootPc: 'pantalla', tituloBeep: 'pantalla', tecla: 'pantalla',
};

/** LAS PERILLAS DEL JUGADOR (OPCIONES → SONIDO): que grupos mueve cada una. */
export const PERILLAS_SONIDO = {
  musica: ['musica'],
  efectos: ['vuelo', 'combate', 'voz', 'pantalla'],
  radar: ['atencion'],
};
