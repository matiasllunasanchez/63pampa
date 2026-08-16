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

  // ---- EL EJE VERTICAL: LA MISMA MANO QUE EN EL PASILLO (PENDIENTE, ver abajo) ----
  // ESTO SALIO DE UN PLAYTEST y TODAVIA NO ESTA RESUELTO: "apenas entra en el modo PASADAS se
  // invierten los controles y me estrello". El sintoma es real; la CAUSA tiene dos lecturas que
  // piden arreglos opuestos, y elegir mal empeora el modo:
  //
  //   (a) DOS LEYES PARA UNA TECLA. En el pasillo W es GAS (soltas y caes); en la pasada es
  //       CABECEO (soltas y el morro se auto-nivela). Si la molestia es esa, el arreglo es que
  //       soltar vuelva a hundir.
  //   (b) EL TIRON AL CRUZAR. Si venias con W apretada —como el pasillo obliga—, al entrar esa
  //       misma tecla comanda morro arriba a fondo (PITCH_RATE 1.4 rad/s, 51 grados en 0,64 s):
  //       el avion trepa, pierde velocidad, y el MUSH_DROP del modelo lo deja caer. Se siente
  //       como "se invirtio". Si es esta, el arreglo es limitar el comando heredado al cruzar,
  //       NO agregar hundimiento.
  //
  // Se probo (a) y MEDIDO EMPEORA: con el morro hundiendose solo, el avion toca el agua ~2 s
  // despues de entrar sin que nadie toque nada, y la sonda no llegaba ni a leerlo. Revertido.
  // Queda preguntado al autor cual de las dos es, porque solo el sabe que tenia apretado.
  // ---- LAS CAPAS DE DEFENSA (RF-03/RF-05: la dificultad es GEOGRAFIA) ----
  // EL TECHO BAJO DE 10 m ES PEDIDO DEL AUTOR (playtest 16/8): "el misil lo tiran unicamente si el
  // avion se pasa de los 10 metros; si no se pasa, recien el barco lo VE con antiaereos o con lo
  // que sea visible desde los OJOS, no desde el radar". Es una regla mas dura y mas clara que los
  // 35 m del spec: abajo de 10 no existe el misil, pero SI existe el que te ve pasar.
  RADAR_CEIL_M: 10,      // techo de radar: abajo de esto el misil de largo alcance no existe.
                         // Volar mas bajo que la cubierta de una fragata es la tesis del juego
  POPUP_DIST_M: 800,     // desde aca el salto habilita la mira sobre las zonas (y corre el
                         // ralenti de la ventana, RF-12)

  // ---- EL EJE DE ATAQUE (RF-02 / P1: la forma de la corrida) ----
  // El buque tiene la eslora sobre X y la manga sobre Z (three-arena: |x| < 62.5, |z| < 11.25).
  // Entrar POR EL EJE del casco da una ventana de suelta de 1,2 s a 110 m/s; cruzando la manga,
  // 0,3 s — medido. O sea que el eje no es una preferencia estetica: es CUATRO VECES la ventana.
  // Hasta P1 eso no se decia en ningun lado y entrar de costado parecia simplemente injusto.
  AXIS_LEN_M: 1400,      // largo del pasillo de aproximacion dibujado sobre el agua, por punta
  AXIS_STEP_M: 70,       // separacion de las marcas del pasillo (de a saltos: es una pista de
                         // aterrizaje vista desde el aire, no una linea continua)
  AXIS_W_M: 45,          // media manga del pasillo. NO es cero: dibujado sobre el eje exacto queda
                         // JUSTO debajo de tu trayectoria y colapsa en el punto de fuga — medido
                         // en captura, invisible. Con dos bordes separados, la perspectiva los
                         // hace converger y el pasillo se lee como lo que es: por donde se entra
  AXIS_OK: 0.82,         // |cos| del angulo entre tu rumbo y el casco para contar como ENCARADO.
                         // 0.82 son ~35 grados: ancho a proposito — el eje es una invitacion, no
                         // un riel, y el spec pide que el avion vuele LIBRE

  // ---- EL RE-ENCARE (RF-09 / P1: el racetrack, todavia sin las dos variantes) ----
  RACE_D_M: 1150,        // a que distancia del buque queda la puerta de re-entrada, sobre el eje
  RACE_GATE_R: 220,      // radio de la puerta: cruzarla encarado reinicia la corrida

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

  // ---- EL CAÑON DE 4,5" — LAS COLUMNAS DE AGUA (RF-04) ----
  // La capa que castiga volar DERECHO. La salva no te apunta: apunta a donde vas a estar, y las
  // columnas CAMINAN sobre tu rumbo — la primera cae corta, la ultima donde estarias dentro de un
  // segundo y medio. Volar recto es meterse en la ultima. Y como caen sobre el AGUA y se ven
  // subir, el aviso es el mundo y no un icono: la regla P3 del spec ("el aviso es humano o no es").
  GUN_RANGE_M: 1500,     // desde aca el buque te toma con el cañon
  GUN_EVERY_S: 2.9,      // entre salva y salva (se acorta con el calor del re-encare)
  COL_N: 5,              // columnas por salva
  COL_STEP_M: 42,        // cuanto camina la salva por columna. Es ~la distancia que volas en
                         // COL_GAP_S a 110 m/s: por eso derecho te alcanza y virando no
  COL_GAP_S: 0.38,       // entre columna y columna de la misma salva
  COL_R: 24,             // radio letal de la columna mientras sube
  COL_LIFE: 1.7,         // lo que dura la columna en el agua
  COL_JIT_M: 60,         // dispersion del tirador SIN punteria hecha. Es lo que el CALOR aprieta
                         // (RF-09): en la corrida 3 la salva cae medible-mente mas cerca que en la 1
  // EL CAÑON SE APUNTA, NO ACIERTA DE UNA. Sin esto la primera salva mataba a los tres segundos de
  // entrar —medido, el fixture no llegaba ni a la segunda prueba— y una capa que mata antes de
  // poder aprenderse no enseña: frustra. Asi el tirador CORRIGE mientras vueles derecho, que es
  // como se apunta un cañon naval de verdad, y cambiar de rumbo le borra la correccion.
  GUN_AIM_SALVOS: 2,     // salvas de tanteo antes de tenerte tomado. Va por SALVAS y no por
                         // segundos porque asi se corrige un cañon naval: se mira donde cayo la
                         // anterior. El efecto de juego es el que importa — la PRIMERA salva es
                         // siempre un aviso, nunca una emboscada, y recien la tercera mata. A
                         // GUN_EVERY_S son ~6 s de rumbo constante: el criterio de RF-04, exacto
  GUN_RESET_RAD: 0.35,   // cuanto rumbo hay que cambiar para borrarle la correccion (~20 grados:
                         // un zigzag SUAVE alcanza, no hace falta un tonel)
  GUN_AIM_MAX: 0.82,     // cuanto de la dispersion llega a comerse la punteria hecha. No es 1:
                         // aun apuntado, el cañon falla a veces — y esa es la unica razon por la
                         // que una corrida perfecta se puede tener suerte de sobrevivir

  // ---- EL SEA DART — EL TECHO DE RADAR (RF-03) ----
  // La capa que castiga volar ALTO lejos del buque, y la tesis del juego hecha sistema. No hay
  // lock-on ni RWR: lo que hay es una estela que sale del buque y viene. Se esquiva con un quiebre
  // sostenido porque el misil vira a ritmo LIMITADO — no es un dado, es geometria.
  DART_V: 250,           // m/s
  DART_TURN: 1.35,       // rad/s de viraje: menos que el avion, y ahi vive el esquive
  DART_HIT: 26,          // radio letal
  DART_LIFE: 9,          // se queda sin motor
  // ---- R1, EL MISIL JUSTO (PASADA_ADRENALINA §3) ----
  // El playtest fue lapidario: "los misiles te matan sin verlos, sin sonido, vienen de frente".
  // Y la vara de R0 le dio la razon: 3,27 s de vida MEDIDOS desde el lanzamiento, contra un punto
  // de 3x3 px que de frente no tiene movimiento angular. Nada de esto sube el daño — sube lo que
  // se VE, se OYE y se puede LEER. La regla madre del plan es densidad y teatro, jamas letalidad.
  DART_RISE_T: 1.0,      // el misil TREPA antes de picar. Es historico (el Sea Dart subia y
                         // despues caia) y ademas resuelve el problema de fondo: de frente un
                         // punto no se mueve en pantalla, pero subiendo contra el CIELO si
  DART_TTI_MIN: 4.5,     // si el misil fuera a impactar antes de esto, NO SE LANZA. Es la regla
                         // que convierte "muerte sin lectura" en "muerte entendida": nunca sale
                         // un misil que no te de tiempo de verlo, oirlo y decidir
  DART_SMOKE_LIFE: 2.0,  // lo que dura cada bocanada de la SOGA DE HUMO. La leccion After Burner:
                         // lo que se esquiva es la soga, no el punto — y cuando la esquivas, la
                         // soga pasando de largo es la prueba visible de que lo hiciste bien

  // ---- SEA CAT Y FUSILERIA — LA DEFENSA CORTA (RF-08) ----
  CAT_T: 3.4,            // segundos desde el lanzamiento hasta el impacto
  CAT_BREAK: 0.85,       // radianes de cambio de rumbo que lo pierden. El Sea Cat real era
                         // subsonico y guiado A MANO, asi que un quiebre franco lo dejaba atras
  // FUSILERIA: es SOBRE LA CUBIERTA, no "cerca del buque", y la diferencia decide el modo. Con un
  // radio grande, una pasada normal ya se comia un impacto — y con el modelo de vida por defecto
  // (ESCUADRON, donde cualquier toque baja el avion) eso significa que TODA pasada termina en
  // relevo. Acotada a la huella del casco, cruzarla a 110 m/s son ~1,2 s por la eslora: nunca
  // muerde. Muerde el que se QUEDA, que es exactamente la falta que esta capa cobra.
  FUS_X: 90, FUS_Z: 60,  // media huella vigilada (el casco mide 125 x 22)
  FUS_ALT: 90,           // altura maxima. Arriba de eso ya sos problema del Sea Dart
  FUS_BITE_S: 2.5,       // segundos acumulados encima antes de cobrar UN impacto

  // ---- DEFENSA CORTA Y CALOR (RF-08/RF-09) ----
  SEACAT_DODGE_S: 1.2,   // ventana de quiebre desde el aviso por radio: el Sea Cat real era
                         // subsonico y guiado a mano, asi que se esquiva de verdad
  HEAT_RATE: 0.15,       // +cadencia/precision del cañon por re-encare. La doctrina era UNA
                         // pasada: repetir es legal y cuesta

  // ---- LOS RELOJES (RF-10/RF-12) ----
  FUEL_MIN: 10,          // minutos de nafta de la zona: no hay timer artificial, hay combustible.
                         // OJO: RF-15 le cambio la escala y este numero quedo SIN USAR — ver
                         // PASS_TANK abajo y la divergencia §10.35
  SLOW_FACTOR: 0.85,     // ralenti de la ventana (perilla en OPCIONES). Se aplica escalando el dt
                         // del mundo, como el MOMENTUM — jamas relojes de pared

  // ---- EL FIN DE LA PASADA (RF-15: un avion, una suelta) ----
  PASS_END_T: 1.9,       // segundos entre que la ristra termina de resolverse y entra el
                         // siguiente. NO es una pausa tecnica: es el tiempo de VER en que quedo
                         // tu suelta. Cortar apenas revienta la bomba dejaria al jugador sin
                         // saber por que perdio el avion, que es la unica leccion de la corrida
  PASS_TANK: 100,        // nafta con la que ENTRA cada avion a la zona (la escala de run.fuel).
                         // Es por AVION y no por batalla porque cada relevo es literalmente otra
                         // maquina. Al drenaje del pasillo (3.2/s) da ~31 s de corrida: alcanza
                         // para encarar y dudar una vez, no para dar vueltas hasta que salga

  // ---- LA OLEADA (RF-11: coreografia, no IA) ----
  // Lo que convierte un poligono de tiro en un ATAQUE DE ESCUADRILLA, y la diferencia mas grande
  // entre este modo y los otros dos: en el PASILLO y en el ARENA volas solo. Aca te turnas.
  // Los Fieles no son IA ni adorno — hacen SU corrida mientras vos das la vuelta, y mientras uno
  // corre el buque le tira A EL. Esa es la mecanica: el escuadron te compra segundos con su
  // propio pellejo, que es exactamente lo que hacia un escuadron.
  WAVE_GAP_S: 6,         // separacion entre corridas de los Fieles
  WING_HIT_P: 0.22,      // probabilidad de que la corrida de un Fiel dañe una zona. BAJA a
                         // proposito: con 0.4 la oleada bajaba media nave sola en una batalla de
                         // 36 s —medido— y el jugador pasaba a mirar trabajar a otros. Ablandan,
                         // no rematan (y nunca voltean la ultima zona: ese golpe es tuyo)
  WAVE_T: 9,             // lo que dura la corrida de un Fiel, de punta a punta
  WAVE_D_M: 1250,        // de donde entra y hasta donde sale (sobre el eje, como vos)
  WAVE_ALT_M: 26,        // su altura de corrida: a ras, como corresponde
  WAVE_HURT_P: 0.35,     // probabilidad de que la defensa lo AVERIE en su corrida. Nunca lo mata:
                         // los muertos los decide el guion (Vasco m7, Pichon m9), jamas el azar
};

// GEOMETRIA DE ENTRADA — DERIVADA de las perillas de arriba, no son perillas nuevas (§0.3: "no
// inventar valores"). Se usan cuando se entra por sonda, sin pasillo del que heredar altura.
export const ENTRY_D = PS.ZONE_R * 0.8;          // 1280 m: adentro de la zona y lejos del buque
// ALTURA DE ENTRADA. Dejo de derivarse del techo de radar cuando el techo bajo de 35 a 10 m (la
// mitad de 10 son 5 metros, y la cresta mata a 3,5). Es un numero propio y explicito, y elegido
// para cumplir las dos cosas a la vez: aire suficiente bajo el avion, y POR DEBAJO DEL TECHO DE
// RADAR — se llega como se llegaba de verdad, por abajo, y el misil de largo alcance no existe
// hasta que subas. Con la entrada a 18 m, medido, TODA entrada se comia un Sea Dart.
export const ENTRY_ALT = 8;

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
