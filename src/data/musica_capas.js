// LA MUSICA EN CAPAS — el catalogo y las perillas (docs/produccion/MUSICA_CAPAS.md). Datos puros.
//
// Una pista en capas son sus STEMS sonando juntos y sincronizados (systems/capas.js, WebAudio), y cada
// capa sube o baja segun la INTENSIDAD del juego (core/intensidad.js). Las capas salen de dos lados:
//   · de una pista existente, separada con Demucs (bateria / bajo / resto / voces): `origen: 'demucs'`
//   · de una pista pedida a Suno con sus stems: `origen: 'suno'` (el molde del pedido esta en el doc)
//
// Por pista:
//   bpm, offset, compas  la grilla (offset = segundo del primer tiempo fuerte; compas = tiempos por
//                        compas). Los cambios de capa caen en el proximo compas. Medidos con
//                        tools/musica_capas.py (librosa), no a oido.
//   dur                  largo de la pista en segundos (vuelve a empezar al terminar)
//   capas                cada una: archivo, y su rampa contra la intensidad — `desde`/`hasta` (0 antes,
//                        1 despues), `min` (el piso: nunca baja de ahi), `siempre` (no se mueve)
//   filtro               el pasabajos del master: cerrado (`cerrado` Hz) en calma, abierto del todo
//                        desde `abre` de intensidad. Lo que "aleja" la musica cuando no pasa nada
export const CAPAS_BASE = '../assets/music/capas/';

/** LA PISTA QUE SUENA EN DEV → SMALL CON MUSICA. Para probar otra, se cambia este id (o se abre el
 *  juego con `?capas=<id>`). */
export const CAPAS_PRUEBA = 'synctest';

export const PISTAS_CAPAS = {
  // BALAS EN BANDONEON (assets/music/original/balas_en_bandoneon1.mp3), separada con Demucs htdemucs
  // el 23/10/2026. Grilla medida con tools/musica_capas.py (ajuste de recta a los tiempos): 88,513 BPM,
  // primer tiempo a 1,774 s, 77 compases de 4 — pero con hasta 475 ms de error: la pista tiene TEMPO
  // HUMANO (se mueve), y una grilla fija no le calza del todo. Los cambios de capa pueden caer corridos
  // en algunos tramos. Los niveles medidos (volumedetect, promedio): bajo -21,8 dB, bateria -21,6, resto
  // (el bandoneon y todo lo melodico) -18,8, voces -32,1 — la pista es INSTRUMENTAL: lo que Demucs
  // llama voces es lo que se le filtra de los otros, un brillo que se guarda para el climax.
  balas: {
    nombre: 'BALAS EN BANDONEON', origen: 'demucs',
    bpm: 88.513, offset: 1.774, compas: 4, dur: 208.85,
    capas: {
      bajo: { archivo: 'balas/bajo.m4a', siempre: true },
      resto: { archivo: 'balas/resto.m4a', desde: 0.0, hasta: 0.45, min: 0.35 },
      bateria: { archivo: 'balas/bateria.m4a', desde: 0.25, hasta: 0.6 },
      voces: { archivo: 'balas/voces.m4a', desde: 0.7, hasta: 0.95 },
    },
    filtro: { cerrado: 900, abre: 0.5 },
  },
  // SYNCTEST — la primera pedida a Suno con el molde de docs/produccion/MUSICA_CAPAS.md (23/10/2026). Vino
  // la mezcla sola (sin stems), asi que se separo con Demucs como Balas. La grilla es PERFECTA: 120,004
  // BPM (se pidio 120), 421 de 423 tiempos sobre la recta, error maximo 27 ms. Instrumental: el stem de
  // voces de Demucs salio en -74 dB (silencio) y no entra.
  synctest: {
    nombre: 'SYNCTEST (SUNO)', origen: 'suno',
    bpm: 120.004, offset: 1.444, compas: 4, dur: 219.6,
    capas: {
      bajo: { archivo: 'synctest/bajo.m4a', siempre: true },
      resto: { archivo: 'synctest/resto.m4a', desde: 0.0, hasta: 0.45, min: 0.35 },
      bateria: { archivo: 'synctest/bateria.m4a', desde: 0.25, hasta: 0.6 },
    },
    filtro: { cerrado: 900, abre: 0.5 },
  },
};

/** LA INTENSIDAD (core/intensidad.js): cuanto aporta cada fuente (se suman y se acota a 1). */
export const INTENSIDAD = {
  base: 0.08,           // volando sin nada: la musica nunca esta en cero
  estrellas: 0.3, estrellasMax: 4,     // el nivel de alerta (EST_MAX)
  radar: 0.15,          // la barra del radar cargando
  misiles: 0.3, misilesTope: 3,        // misiles enemigos viniendo: 3 o mas es el tope
  hostiles: 0.15, hostilesTope: 6,     // enemigos cerca en el pasillo
  buque: 0.5, buqueLejos: 2200, buqueVentana: 175,   // el buque de la suelta, de que aparece a la ventana
  escape: 0.75,         // escapando del buque
  herido: 0.4,          // con la chapa bajo 50: nunca menos que esto
  sube: 0.6, baja: 4.0, // segundos del suavizado: entra rapido, se va despacio
};
