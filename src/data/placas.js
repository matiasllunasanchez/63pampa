// QUE PLACA DE AMBIENTE LE TOCA A CADA CUADRO DEL GUION
//
// Las pantallas de historia (data/strings.js) traen `img: 'M6_LOCKER1'`, que es el nombre del
// CUADRO del storyboard: el dibujo propio de esa escena, con los personajes adentro. Esos
// cuadros son el paso 3 de la produccion de arte y todavia no existen ninguno.
//
// Las PLACAS si existen: son los 32 fondos reutilizables de assets/plates (la linea de vuelo al
// amanecer, el hangar de noche, la cabina, la hoja del cuaderno). Una placa no es la escena —
// es el LUGAR donde pasa, sin gente. Esta tabla dice, para cada cuadro que falta, en que lugar
// pasa, asi la escena ya se ve ambientada en vez de quedar en la tarjeta negra.
//
// Es una tabla y no 76 campos `placa:` sueltos en strings.js a proposito: cuando el cuadro
// propio de una escena se genere, alcanza con borrarle la linea de aca y el cuadro gana solo
// (render/screens.js prueba primero assets/story, y recien despues esta tabla).
//
// Criterio de asignacion, tomado del mapa de docs/historia/PROMPTS_PLACAS.md:
//   briefing -> linea_amanecer · epilogo -> linea_atardecer · carta de Mateo -> el cuaderno
//   carta del padre -> los papeles · pantalla historica -> la sala de radio
export const PLACA_DE_CUADRO = {
  // --- prologo -------------------------------------------------------------------------
  INTRO_1: 'final_monte',       INTRO_2: 'cocina_gris',      INTRO_3: 'radio',
  INTRO_4: 'linea_amanecer',    P1_2: 'p1a_arroyo',          P2_3: 'p2_cocina',
  P3_4: 'p3a_telefono',         P4_1: 'p1c_cuaderno',
  // --- misiones ------------------------------------------------------------------------
  M1_3: 'linea_amanecer',   M1_5B: 'm7_foto_frente',  M1_7: 'linea_atardecer',
  M1_9: 'p1c_cuaderno',
  M2_1: 'linea_amanecer',   M2_5: 'hangar_noche',     M2_8: 'p1c_cuaderno',
  M3_1: 'linea_amanecer',   M3_2: 'hangar_dia',       M3_6: 'linea_atardecer',
  M3_8: 'p1c_cuaderno',
  M4_1: 'linea_amanecer',   M4_2: 'hangar_dia',       M4_EPI: 'linea_atardecer',
  M4_CARTA: 'p1c_cuaderno',
  M5_1: 'linea_amanecer',   M5_2: 'hangar_dia',       M5_EPI: 'linea_atardecer',
  M5_CHANCHA: 'hangar_noche', M5_CARTA: 'p1c_cuaderno',
  M6_1: 'linea_amanecer',   M6_2: 'vestuario',        M6_EPI: 'linea_noche',
  M6_LOCKER1: 'm13_carta_locker', M6_LOCKER2: 'm7_foto_dorso',
  M6_CARTA: 'p1c_cuaderno', M6_PADRE: 'p3b_papeles',
  M7_1: 'linea_amanecer',   M7_2: 'cabina_dia',       M7_SOBREVUELO: 'linea_atardecer',
  M7_CARTA: 'p1c_cuaderno',
  M8_1: 'linea_amanecer',   M8_2: 'hangar_dia',       M8_EPI: 'linea_atardecer',
  M8_LIBRETA: 'm9_libreta', M8_CARTA: 'p1c_cuaderno', M8_PADRE: 'p3b_papeles',
  M9_1: 'linea_amanecer',   M9_EPI: 'hangar_noche',   M9_CARTA: 'p1c_cuaderno',
  M10_1: 'pista_lluvia',    M10_TIERRA: 'final_monte', M10_PISTA: 'pista_lluvia',
  M10_CARTA: 'p1c_cuaderno', M10_PADRE: 'p3b_papeles',
  M11_1: 'linea_amanecer',  M11_2: 'cabina_dia',      M11_ASADO1: 'fogon',
  M11_ASADO2: 'fogon',      M11_CARTA: 'p1c_cuaderno', M11_CARTA2: 'p1c_cuaderno',
  M11_PADRE: 'p3b_papeles',
  M12_1: 'radio',           M12_2: 'linea_amanecer',  M12_GITANO: 'cabina_noche',
  M12_PUMA: 'cabina_noche', M12_TARDE: 'final_monte', M12_FINAL: 'linea_noche',
  // --- epilogo y pantallas historicas ---------------------------------------------------
  EPI_MESA1: 'cocina_gris', EPI_MESA2: 'mesa_dos_papeles',
  M3_HIST: 'radio', M4_HIST: 'radio', M5_HIST: 'radio', M6_HIST: 'radio',
  M7_HIST: 'radio', M9_HIST: 'radio', M10_HIST: 'radio', M12_HIST: 'radio',
};
