// LA SUELTA SOBRE EL BUQUE — el climax que se juega DENTRO del pasillo (pedido del autor, 23/9/2026).
//
// "Armemos un modo cortito de pasada que llegue al final del objetivo y permita lanzar la bomba y
// embocarla en algun lado." Y enseguida la condicion que lo separa de la PASADA: "la idea es
// hacerlo DIRECTAMENTE EN PASILLO" — sin 3D, sin cambiar de mapa, sin corte de camara.
//
// Es la opcion A1 + B1 + B3 de docs/sistemas/MECANICAS_LLEGADA.md (la banda de suelta, el carril
// de la eslora, la sombra de la bomba), que estaba bloqueada por una sola pieza: "el pasillo no
// tiene bomba". Desde el 20/9 la tiene — el tiro oblicuo de data/tuning.js (BOMBA_*) — asi que
// esto es lo que faltaba: un buque que exista EN EL MUNDO, con un casco contra el que la bomba
// pueda pegar.
//
// LA REGLA QUE ORDENA TODO: el buque es un objeto del mundo como cualquier otro. Viene hacia la
// camara a `run.spd` y la bomba lo alcanza a SU velocidad de mundo. Cuando llega a tu altura el
// ataque termina: se le pasa por encima, como en Malvinas, y el juego corta a negro. Ningun numero
// de aca mueve la camara ni congela el tiempo.
//
// Los numeros son unidades de mundo (las de `run.spd` y `proj`), no metros de la PASADA.

export const BL = {
  /** ESLORA, en unidades de mundo. 80 cruza el pasillo entero (±38, `FLY_X`): no hay por donde
   *  esquivarlo, y no hace falta — se le pasa por encima y el cruce es el fin del ataque. Fue 60 un
   *  rato (23/9), cuando pasarle por encima te derribaba y habia que dejar paso por proa y popa.
   *  El perfil de alturas de abajo se escala con esto. */
  LEN: 80,
  /** Centro lateral del buque. 0 es el eje del pasillo: el buque atraviesa el carril entero. */
  X: 0,
  /** Desde que profundidad se lo dibuja: el MARGEN DE TIEMPO. Una unidad son 1,17 m (`KMH_U`) y
   *  `run.spd` anda entre 60 (250 km/h) y 150 (630 km/h), asi que 3500 —4 km— son entre 25 y 60 s
   *  de verlo venir. Tan lejos, en perspectiva real, mediria un pixel: por eso se lo dibuja con la
   *  VISTA COMPRIMIDA de `zVista` (core/blanco.js), que lo agranda de lejos y lo deja exacto de cerca.
   *  (23/9, playtest: "aparece cuando ya estas demasiado cerca".) */
  VISIBLE_Z: 3500,
  /** HASTA DONDE DURA EL APARECER (pedido del autor, 26/9): "el barco no se ve en el horizonte; se
   *  empieza a ver con fade in, y quiza niebla que va desapareciendo mientras aparece a lo lejos".
   *  Entre VISIBLE_Z y esto el buque se funde de la nada con la bruma encima, y la bruma se va
   *  levantando. De aca para adentro ya esta ENTERO — y es tambien donde entran los corchetes y la
   *  flecha: "una vez que aparece bien, se marca con rojo". Un solo numero para las dos cosas, o el
   *  dia que uno cambie se marcaria un buque que todavia no termino de aparecer. */
  APARECE_Z: 2200,
  /** EL MOMENTO PERDIDO (pedido del autor, 26/9): si la ventana verde se pierde porque te acercaste
   *  demasiado sin soltar, "se mete FADE, se quita la UI, queda solo el avion volando, y el avion
   *  vuela solo hacia arriba controlado por la maquina".
   *    PERDIDA_T     segundos del fundido a negro, con el avion en piloto automatico. Es un FUNDIDO
   *                  y no un corte: el corte seco de la primera version era "un pantallazo negro".
   *    PERDIDA_SUBE  unidades/s que el piloto automatico sube. Se ve irse, que es la idea: el que
   *                  erro la pasada abre y deja el lugar. */
  PERDIDA_T: 1.6,
  PERDIDA_SUBE: 9,

  /** LA ESPOLETA: segundos de vuelo que la bomba necesita para armarse. Es lo que hace que la
   *  ALTURA importe sin ningun cartel: soltada al ras (0,6 s de caida) llega dormida — "la bomba
   *  que no desperto" de M6, que es historica —, y hace falta soltar de mas arriba (o tirando del
   *  morro) para que el vuelo dure lo suficiente. Con 0.8, a 10 m y a crucero, la ventana de suelta
   *  queda entre ~135 y ~190 m del buque: casi un segundo. Mas arriba se abre, al ras no existe. */
  ARMA_T: 0.8,

  /** LA ZONA DE MAQUINAS: media anchura de la franja central, como fraccion de la eslora. Es EL
   *  blanco claro que marca el HUD. Una bomba armada ahi lo hunde sola; en cualquier otro lado del
   *  casco lo deja averiado, y hacen falta dos. */
  CENTRO: 0.17,
  DANO_CENTRO: 100,
  DANO_EXTREMO: 55,

  /** Cuantas pasadas antes de que la mision se pierda. UNA, como era (PLAN_VUELTA_REAL V0, 24/9):
   *  "si no le pegamos, pantalla negra y derrota". La mision puede pedir mas con `pasadas:` en su
   *  renglon — la prueba t16 pide tres, y cada una es el avion siguiente del escuadron con SU carga
   *  entera (data/cargas.js, `conBombaCentral`). */
  PASADAS: 1,
  /** EL SIGUIENTE EN LA FILA (24/9, corrige al PLAN_VUELTA_REAL): la escuadrilla atacaba EN FILA,
   *  cada avion en la misma pasada y separados por segundos. Errar no terminaba el ataque: venia el
   *  de atras. Asi que en una mision, errar pasa el mando al siguiente avion del escuadron —vivo,
   *  sano y con la bomba del centro, que la llevan todos— ya en la aproximacion, a esta distancia
   *  del buque. Sin nadie que siga: derrota. */
  /*  2200 Y NO 900 (pedido del autor, 26/9): "si hay otro en el escuadron vuelve en fade, BASTANTE
   *  MAS LEJOS, y reintenta con otro avion". Con 900 el siguiente arrancaba casi adentro de la ventana
   *  —doce segundos de encare— y no llegaba a ver el buque aparecer ni a acomodar la altura con la
   *  flecha. 2200 deja el encare entero: el buque ya asomado (APARECE_Z), los corchetes rojos, la
   *  flecha, y recien despues la ventana. */
  FILA_M: 2200,
  /** Cuanto atras vuelve a quedar el buque en el RE-ENCARE: lo suficiente para verlo asomar de
   *  nuevo en el horizonte y rearmar la aproximacion, no tanto como para aburrir. */
  REENCARE_M: 1800,

  /** LA ALTURA IDEAL, marcada en verde en el ALTIMETRO del tablero (render/hud.js): la aguja se
   *  pone verde adentro. Por debajo la bomba no alcanza a armarse; por encima de 18 el radar enemigo
   *  te empieza a ver (RADAR_ALT = 20). Es una ayuda de lectura: lo que decide de verdad es la
   *  espoleta y el cruce, no esta banda. */
  ALT_IDEAL: [8, 18],
  /** LA CUENTA ATRAS DE LA SUELTA (pedido del autor, 26/9/2026): "un contador que me de una ventana
   *  de N segundos con letra verde encima del barco, que haga 3 2 1 para poder tirar la bomba".
   *
   *  LO QUE ESTO NO ES: no ensancha la ventana. La regla del autor sigue intacta — "no tirar lejos
   *  ni cerca, justo en cierta distancia"— y la fisica no se toca. Medido con la propia `predecir`,
   *  la ventana dura entre 0,53 s (al ras y rapido) y 2,11 s (a 18 m y lento): la altura la abre o
   *  la cierra, que es el diseño de `ARMA_T` y se queda como esta.
   *
   *  LO QUE ES: el AVISO. La queja fue "no aparezca verde UN SEGUNDO nomas, estirar eso un poco mas
   *  en la cercania" — o sea, saber CUANDO llega esa distancia con tiempo de prepararse. El
   *  contador arranca N segundos antes de que la ventana se abra y cuenta 3, 2, 1; cuando se abre,
   *  dice YA y todo el tablero se pone verde como siempre.
   *
   *  LA DIFICULTAD LA PONE LA MISION y no el jugador (decision del autor, 26/9): el campo
   *  `dificultad:` de su renglon en data/missions.js — 'facil' | 'normal' | 'dificil' | 'experto',
   *  y sin campo, NORMAL. No esta en OPCIONES a proposito: una mision sabe si es la primera del
   *  juego o la ultima, y cuanto aviso da es parte de como esta escrita, igual que sus fases o sus
   *  lecciones. Lo unico que cambia entre facil y experto es CUANTO AVISO tenes, nunca cuanto dura
   *  la ventana: la regla de "ni lejos ni cerca, justo en cierta distancia" es la misma en los cuatro.
   *  El ralenti NO entra aca por pedido del autor: "el jugador tiene MOMENTUM, que la use si
   *  quiere" — estirar el reloj es una decision suya, no un regalo del modo. */
  /** LA VENTANA DE SUELTA, EN SEGUNDOS — lo que se QUIERE que dure, por dificultad. Es el numero
   *  del autor (26/9/2026) y vive aca para poder contrastarlo: el que manda de verdad es HOLGURA,
   *  de abajo, y estos son los segundos que esa holgura da a crucero sin turbo.
   *    facil 5 · normal 3 · dificil 2 · experto 1 (balistica pura, sin una sola ayuda) */
  VENTANA: { facil: 5, normal: 3, dificil: 2, experto: 1 },

  /** EL PRESUPUESTO DE ENVION de la holgura, en unidades/s (ver `holgura` en core/blanco.js).
   *
   *  EL PROBLEMA QUE RESUELVE, con el numero que lo dijo: la ventana puramente balistica dura ~1 s
   *  — "es literal UN PARPADEO para que el jugador pueda tirar la bomba en tiempo, forma y altura".
   *  El pedido fue "que el juego te permita lanzar la bomba un poco antes y la trayectoria se
   *  acomode a esa ventana, que no sea exactamente por fisica segun velocidad altura y demas".
   *
   *  MEDIDO simulando el encare entero con el integrador REAL de systems/collision.js (no con la
   *  prediccion: la pregunta es si lo que la cuenta promete se cumple), promediando tres perfiles
   *  de vuelo — 10 m a 76, 14 m a 100 y 8 m a 62:
   *     presupuesto:  0     75    100    135    160    200    280    340
   *     ventana (s): 0,85  1,94  2,31  2,82  3,19  3,77  4,94  5,82
   *  De ahi salen los cuatro numeros, elegidos por la medicion y no a ojo. EXPERTO es CERO a
   *  proposito: no es una holgura chica, es NO TENER NINGUNA — la balistica cruda del 20/9, con la
   *  ventana de un parpadeo (0,85 s), que es exactamente el "1 s" que pidio el autor.
   *
   *  Y SE VERIFICO LO QUE IMPORTA, no solo el largo: con cada presupuesto se tira al PRINCIPIO, a
   *  la MITAD y al FINAL de la ventana, en los tres perfiles y tambien acelerando, y las doce
   *  sueltas pegan en el centro. "Al principio, al medio o al final, no importa — siempre que sea
   *  dentro de la ventana".
   *
   *  LA ALTURA Y EL TURBO SIGUEN CONTANDO, que era la condicion: el presupuesto son metros de
   *  envion, no segundos, asi que los mismos metros cubren MENOS TIEMPO cuanto mas rapido venis
   *  (a 140 el normal da 2,1 s en vez de 3) y mas tiempo cuanto mas alto soltas. La ayuda no
   *  aplana el modo: le pone un piso. */
  HOLGURA: { facil: 280, normal: 135, dificil: 75, experto: 0 },


  /** La luz de SOLTA: el HUD simula la bomba desde el estado actual del avion y prende verde
   *  cuando soltar AHORA pega armada en el casco. Es la "punteria" del modo de prueba; apagarla es
   *  cambiar este `true` y el modo pasa a jugarse a puro ojo. */
  AYUDA: true,

  /** EL FINAL DEL ATAQUE, filmado (pedido del autor, 23/9: "un MOMENTUM OBLIGADO x3, super camara
   *  lenta mientras explota y se ve el texto de Puma […] y mas tiempo de fade para alcanzar a leer").
   *    LENTO     el mundo a 1/3 desde que una bomba ARMADA revienta en el casco hasta el cruce. EL
   *              SALTO LO HACE EL JUGADOR (23/9): la camara lenta le da el tiempo de tirar del morro
   *              —antes el avion trepaba solo—; si cruza por debajo de la silueta, se lleva los palos
   *    FUNDIDO_T segundos DE MUNDO del fundido a negro antes del cruce (en camara lenta rinden x3)
   *    NEGRO_T   segundos de negro pleno despues del cruce, con Puma encima — el rato de leer
   *    SALIDA_T  segundos del fundido desde negro cuando hay otra pasada */
  LENTO: 1 / 3,
  FUNDIDO_T: 0.45,
  NEGRO_T: 2.4,
  SALIDA_T: 1.2,

  /** EL ESCAPE (PLAN_VUELTA_REAL §2.B, V0). En una mision CON VUELTA, pegarle no corta: en el cruce
   *  te ponen en todas las estrellas y el pasillo sigue hasta que las pierdas; recien ahi, el
   *  viraje. `EST_S` es cuanto hay que aguantar escondido por estrella — el general
   *  (EST_PERDER_S, 20 s) daria 80 s al ras, que es un tramo y no un escape. */
  ESCAPE_EST_S: 9,
  /** EL VIRAJE (pedido del autor, 24/9): sin estrellas, Puma dice "los perdimos" y se deja LEER
   *  (`VIR_LEER`); despues "comencemos la vuelta a casa" mientras el cuadro se funde a negro
   *  (`VIR_NEGRO`, el fundido dura `VIR_FUNDE`); y ahi el video del viraje, de dia o de noche. */
  VIR_LEER: 3.5,
  VIR_NEGRO: 3.0,
  VIR_FUNDE: 1.2,

  PTS_HUNDIDO: 3000,
  PTS_AVERIA: 600,
};

// EL PERFIL DEL CASCO, medido de las hojas horneadas (assets/world/enemies/buque_*.png, frame 0):
// la altura de la silueta en 20 franjas de proa a popa, como fraccion de la eslora. Es lo que hace
// que la bomba pegue DONDE SE VE casco (por debajo = pega; por encima = pasa LARGA).
// Si se re-hornea un buque, se re-mide esto: alfa > 40 por columna, del borde de abajo al pixel
// mas alto, en el frame 0 de la hoja.
export const PERFIL = {
  t21: [0.081, 0.094, 0.121, 0.101, 0.154, 0.174, 0.336, 0.174, 0.174, 0.168, 0.168, 0.101, 0.107, 0.101, 0.067, 0.060, 0.060, 0.060, 0.054, 0.054],
  t42: [0.089, 0.089, 0.104, 0.115, 0.083, 0.099, 0.141, 0.313, 0.313, 0.266, 0.099, 0.141, 0.141, 0.104, 0.099, 0.099, 0.099, 0.057, 0.057, 0.052],
  log: [0.126, 0.126, 0.230, 0.225, 0.209, 0.209, 0.162, 0.162, 0.220, 0.204, 0.199, 0.152, 0.152, 0.152, 0.204, 0.215, 0.304, 0.257, 0.094, 0.089],
};

/** LA FASE DEL ESCAPE: lo que rige mientras escapas, tapando a las fases de la vuelta (que recien
 *  corren despues del viraje). Mismo formato que una fase de data/missions.js — lo lee
 *  `fases.val()` como a cualquier otra. SIN RADIO: el silencio arranca con el impacto, y el ultimo
 *  grito es el de Puma ("¡por encima de los palos!"). Sin siembra propia: lo que te cae encima lo
 *  decide la tabla de las estrellas, que en el cruce quedan al tope. */
export const FASE_ESCAPE = { tipo: 'vuelta', radio: null, bidones: false, radar: 6 };
// …Y EL TECHO A 6 (V2): "bajaban la nariz de inmediato para volver a pegarse a las olas". Arriba de
// 6 el radar carga y las estrellas no bajan: el escape se juega al ras.

/** LA LINEA RECTA (PLAN_VUELTA_REAL §2.B, V2). *"Virar o abrirse por los laterales al lado del
 *  barco era una sentencia de muerte: exponer la panza le daba a la tripulacion una silueta
 *  perfecta."* La artilleria de popa tira rafagas DESDE ATRAS durante `RECTA_T` segundos. Yendo
 *  derecho por el carril sos un blanco de frente —una rayita— y los tiros se abren (`SIGMA_RECTA`);
 *  saliendote del carril (`CARRIL`) o rolando en una pirueta mostras la panza y se cierran
 *  (`SIGMA_PANZA`). No hay multiplicador de daño: el castigo es la PUNTERIA que les regalas, que es
 *  literal lo que dice la fuente. Unidades de mundo. */
export const ESC = {
  RECTA_T: 12,        // segundos de fuego de popa desde el cruce
  GRACIA: 2.2,        // segundos sin que el radar complete la barra: el salto te deja alto un rato
  CARRIL: 8,          // media anchura del carril alrededor de donde cruzaste
  RAFAGA_CADA: 0.9,
  POR_RAFAGA: 2,
  SIGMA_RECTA: 12,    // dispersion yendo derecho: medido, ~1 golpe de escudo en los 12 s
  SIGMA_PANZA: 1.8,   // …y mostrando la panza (pega seguido)
  HIT_X: 1.7, HIT_Y: 1.2,
  TIRO_V: 170,        // cuanto se adelanta una trazadora respecto de la camara, unidades/s (~1,5 s en cuadro)
  Z0: 7,              // donde entra en cuadro: atras del avion, entre el y la camara
  DIST: 400,          // a cuanto quedo la popa: fija la pendiente del tiro (lejos = casi paralelo)
  G: 1.1,             // caida pasado el avion (con 1.1 un tiro a 5 m pica a ~200 adelante)
  Z_MAX: 260,

  // LA VIBORA (V3). *"Movimientos laterales erraticos y bruscos, la viborita: no se apartaban de la
  // ruta, balanceaban el avion de lado a lado. Asi el artillero de popa no podia calcular el tiro."*
  // Pasada la linea recta, el artillero ARMA UNA SOLUCION mientras volas predecible: se completa en
  // `SOL_T` y ahi tira una rafaga precisa con plomo (adonde vas a estar en `PLOMO` s). Cada vez que
  // invertis el movimiento lateral (mas de `VX_MIN` hacia el otro lado) la solucion vuelve a cero.
  // Mientras se arma, los tiros comunes se van cerrando (de SIGMA_RECTA a SIGMA_SOL): los piques
  // que se acercan son el aviso. Pasar por un pique reciente CONGELA la solucion (`HUMO_T`).
  VIBORA_HASTA: 28,   // segundos desde el cruce: ahi sales del alcance de popa y se calla
  SOL_T: 1.3,
  SIGMA_SOL: 1.4,
  POR_SOLUCION: 3,
  PLOMO: 0.35,
  VX_MIN: 5,
  HUMO_T: 0.4,
  HUMO_X: 4,

  // LA FUGA (V4). Un tiro de popa que el avion AGUANTA puede perforarle un tanque: la mitad de las
  // veces yendo derecho, casi siempre mostrando la panza. La fuga saca nafta por segundo, vueles
  // como vueles — "el tanque pierde aunque no vueles". En % del tanque por segundo.
  FUGA_P: 0.5, FUGA_P_PANZA: 0.8,
  FUGA_PCT_S: 0.18,
};

/** "MIRAME LA PANZA" (V4). *"Un avion se colocaba debajo o al costado del otro, a pocos metros, y
 *  por señas le indicaba los daños."* Al volver del viraje, un compañero vivo se te pone al costado
 *  y abajo y te hace dos señas: QUE TENES (sano, averiado, perdiendo nafta) y A DONDE (a casa, o a
 *  la Chancha si con lo que queda no llegas). Sin radio: rige el silencio. Segundos. */
export const SENAS = {
  DESDE: 2.6,    // despues del viraje: lo que dura el fundido desde negro
  ENTRA: 1.2,    // lo que tarda en ponerse en posicion
  CADA: 2.8,     // cuanto dura cada seña
  SALE: 1.2,
  DX: 7, DY: -2.4, DZ: 3,   // donde se pone: a tu derecha, abajo y apenas adelante
};


/** EL OTRO SECTOR (PLAN_VUELTA_REAL §2.E, V5). *"No regresaban por el mismo camino: las rutas se
 *  planificaban por sectores distintos."* Despues del viraje el cielo es otro — la hora avanzo y
 *  el mar no es el de la ida. Cielo de la ida → cielo de la vuelta. */
export const CIELO_VUELTA = {
  sun: 'clear', clear: 'dusk', cloudy: 'dusk', dawn: 'clear',
  dusk: 'night', night: 'moon', moon: 'night', storm: 'storm',
};

/** LA CAP (V5): las patrullas de Sea Harrier que salian a cazar a los que volvian. La mision dice
 *  DONDE cruzan (`cap: [fracciones de la vuelta]`); cada una cruza el pasillo de lado a lado, lejos
 *  y adelante, en `T` segundos. Si en ese rato estas POR ENCIMA DEL TECHO DEL RADAR, te ven: una
 *  estrella y LA COLA se te pone atras. Abajo, pasan de largo. Puma avisa `AVISO` s antes. */
export const CAP = { T: 5, Z: 130, Y: 14, ANCHO: 70, AVISO: 3 };
