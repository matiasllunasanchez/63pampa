// CONSTANTES DE LA FASE PASADA (SPEC_MODO_PASADA §6). Datos puros: cero imports de logica.
//
// EL VUELO NO VIVE ACA. La pasada vuela el MISMO modelo E1/E2 del arena (core/aero.js, numeros en
// data/arena.js) porque ese es el principio P1 del spec: "la PASADA es el PASILLO con
// consecuencias — mismas teclas, misma fisica, ningun control nuevo". Lo que se ajusta aca es el
// REGLAMENTO: la corrida, la ventana de suelta, la defensa por capas y el reloj de nafta.
//
// Los valores son los DEFAULTS DEL SPEC. La regla de la sesion implementadora (§0.3): si falta un
// dato se usa el default y se sigue; si el default resulta injugable se anota en §10 con la
// medicion que lo dice, no se cambia a ojo.
export const PS = {
  // ---- ENTRADA (RF-01: la transicion sin corte) ----
  ENTRY_CLEAR_M: 700,    // metros antes del buque sin spawns de enemigos: el pasillo se vacia y lo
                         // que queda es el buque. Desde aca mandan las columnas de agua (RF-04)
  ZONE_R: 1600,          // radio de la zona con auto-retorno, el buque al centro (la correa del
                         // arena, pero mas ancha: una corrida necesita pista para encarar)

  // ---- LAS CAPAS DE DEFENSA (RF-03/RF-05: la dificultad es GEOGRAFIA) ----
  RADAR_CEIL_M: 35,      // techo de radar: abajo de esto el Sea Dart no existe. Es la tesis del
                         // juego hecha sistema — "los valientes vuelan abajo" con consecuencia
  POPUP_DIST_M: 800,     // desde aca el salto habilita la mira sobre las zonas (y corre el
                         // ralenti de la ventana, RF-12)

  // ---- LA VENTANA DE SUELTA (RF-06: la mecanica central) ----
  BAND_ARM_MIN: 20,      // piso de armado: soltar mas abajo = la bomba llega DORMIDA (golpea y no
                         // explota). Es historico: varios buques cobraron bombas sin estallar
  BAND_SWEET_MAX: 55,    // techo de la banda dulce: mas arriba arma igual, pero la exposicion ya
                         // te cobro el salto
  BOMBS_N: 2,            // bombas por corrida (la 3ª queda como mejora del Pichon, PROPUESTAS §11)
  RIPPLE_S: 0.35,        // separacion de la salva: la ristra cae SOBRE LA LINEA DE VUELO, asi que
                         // pegarle a dos zonas es haber elegido un eje que las alinea

  // ---- EL SAPITO (RF-07: el easter egg de los que sabian) ----
  SAPITO_ALT_M: 12,      // altura maxima de suelta para que la bomba pique en el agua (+ turbo)
  SAPITO_PTS: 2000,      // bonus de estilo

  // ---- DEFENSA CORTA Y CALOR (RF-08/RF-09) ----
  SEACAT_DODGE_S: 1.2,   // ventana de quiebre desde el aviso por radio: el Sea Cat real era
                         // subsonico y guiado a mano, asi que se esquiva de verdad
  HEAT_RATE: 0.15,       // +cadencia/precision del cañon por re-encare. La doctrina era UNA
                         // pasada: repetir es legal y cuesta

  // ---- LOS RELOJES (RF-10/RF-12) ----
  FUEL_MIN: 10,          // minutos de nafta de la zona: no hay timer artificial, hay combustible
  SLOW_FACTOR: 0.85,     // ralenti de la ventana (perilla en OPCIONES). Se aplica escalando el dt
                         // del mundo, como el MOMENTUM — jamas relojes de pared

  // ---- LA OLEADA (RF-11: coreografia, no IA) ----
  WAVE_GAP_S: 6,         // separacion entre corridas de los Fieles
  WING_HIT_P: 0.4,       // probabilidad de que la corrida de un Fiel dañe su zona
};

// GEOMETRIA DE ENTRADA — DERIVADA de las perillas de arriba, no son perillas nuevas (§0.3: "no
// inventar valores"). Se usan cuando se entra por sonda, sin pasillo del que heredar altura.
export const ENTRY_D = PS.ZONE_R * 0.8;          // 1280 m: adentro de la zona y lejos del buque
export const ENTRY_ALT = PS.RADAR_CEIL_M / 2;    // 17 m: a ras, BAJO el techo de radar (la doctrina)

// ---- LA BOMBA (P2) ----
// El §6 del spec no trae daño de bomba: define la VENTANA (las bandas) pero no cuanto pega. Estos
// tres van anotados como perillas NUEVAS en §10, con el porque de cada numero.
export const BOMB = {
  G: 9.8,          // gravedad REAL. La bomba es lo unico del juego que cae de verdad: es un
                   // proyectil balistico que hereda la velocidad del avion, y de ahi sale el
                   // adelanto enorme de la suelta — soltar ENCIMA del buque es soltar tarde
  DMG: 90,         // una bomba en banda apaga de una casi cualquier zona (radar 45, AA 55, motor
                   // 70) pero NO el PUENTE (130), que pide dos. El blanco duro tiene que sentirse
                   // duro, y con 2 bombas por corrida esto deja la doctrina en 2-4 pasadas
  DUD: 0.12,       // la DORMIDA golpea y no estalla: ~11 de daño. No es cero — el impacto existe,
                   // y esa es justamente la historia de las bombas que entraron sin explotar
  R: 14,           // radio de la explosion contra el casco (m)
  SKIP_V: 0.45,    // cuanto rebote conserva el SAPITO al picar en el agua
};
