// ESCENAS del modo historia en el modelo nuevo (SPEC_MODO_HISTORIA §3): una escena = placa +
// ambiente + una lista ORDENADA de lineas, cada una con su id estable y su `hold`.
//
// Es contenido, no motor: aca no hay logica (data/ no importa nada, ver ARQUITECTURA). El que las
// interpreta es core/dialogue.js.
//
// Reglas de datos que NO se negocian (SISTEMA_DIALOGO):
//   - el `id` de linea es inmutable aunque el texto cambie, y no se reutiliza jamas;
//   - se numera de 10 en 10 para poder intercalar sin renumerar;
//   - `en` vacio cae a `es` — no se traduce nada en esta fase;
//   - `hold` son los segundos de SILENCIO despues de la linea. Es actuacion, no delay tecnico:
//     el 4.0 de "El Vasco tenia quince años" ES la escena.
//
// El resto del guion todavia vive como pantallas en data/strings.js (formato v0.0.1) y entra por
// el adaptador de core/dialogue.js. Cada escena que se pase a este modelo gana holds de verdad.

export const SCENES = {
  // FIXTURE DE ACEPTACION (spec §6) — el locker de m7, el pico emocional del juego.
  // Texto y holds: SPEC_MODO_HISTORIA §6, que los toma de GUION_3.md M7 "El locker".
  // Se prueba con `?scene=M07_LOCKER` (arranca derecho aca y vuelve al menu al terminar).
  M07_LOCKER: {
    id: 'M07_LOCKER',
    tipo: 'VN',
    placa: 'vestuario',            // assets/plates/vestuario.png — TODAVIA NO EXISTE (cae a negro)
    ambiente: 'locker_noche',      // capa de audio de la escena — todavia no existe (silencio)
    lineas: [
      // acotacion: sin personaje, se muestra sin nombre y respeta el hold igual (regla D5)
      { id: 'M07_LOCKER_010', personaje: null, cara: null, hold: 2.0,
        es: 'El Turco junta las cosas del Vasco en una caja.', en: '' },
      { id: 'M07_LOCKER_020', personaje: 'GITANO', cara: 'gitano_roto', hold: 1.0,
        es: 'La casada… Turco, dejámela ver una última vez.', en: '' },
      // EL DORSO DE LA FOTO: la imagen ES el contenido, asi que esta linea sola cambia de registro
      // a CUADRO sin cortar la escena (decision documentada en el spec §9).
      { id: 'M07_LOCKER_030', personaje: null, cara: null, hold: 2.5,
        tipo: 'CUADRO', img: 'M7_FOTO_DORSO',
        es: 'La da vuelta. Nada más que eso.', en: '' },
      { id: 'M07_LOCKER_040', personaje: 'PUMA', cara: 'puma_quebrado', hold: 1.5,
        es: 'Sesenta y uno.', en: '' },
      // el hold mas largo de la escena: aca no se avanza por 4 segundos, y eso es el juego
      { id: 'M07_LOCKER_050', personaje: 'ESTEBAN', cara: 'tero_roto', hold: 4.0,
        es: 'El Vasco tenía quince años.', en: '' },
      { id: 'M07_LOCKER_060', personaje: 'GITANO', cara: 'gitano_roto', hold: 2.0,
        es: 'Tres años le cebé mate a este culiao. Tres años…', en: '' },
    ],
  },
};
