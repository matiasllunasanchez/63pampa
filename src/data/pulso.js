// EL PULSO — datos del climax como PRUEBA DE DESTREZA (docs/sistemas/PLAN_EL_PULSO.md).
//
// Al final del PASILLO el tiempo se dilata, la camara entra a la cabina y el juego pide ejecutar
// una secuencia de teclas contra reloj. Esto es SOLO data: quien la interpreta es systems/pulso.js
// y quien la dibuja, render/pulso.js. Nada de logica aca (data/ no importa nada del juego).
//
// LAS DOS REGLAS QUE GOBIERNAN ESTE ARCHIVO (plan §2, reglas 1 y 2):
//
//   1. El input es VOCABULARIO APRENDIDO. Ningun compas se inventa: cada uno es la secuencia REAL
//      de una pirueta del juego (el `case` de `combo` en game.js, catalogo en data/moves.js). El
//      examen final toma lo que el juego enseño durante todo el pasillo — por eso en campaña solo
//      salen las piruetas que el jugador tiene APRENDIDAS (la libreta del Pichon).
//   2. Cada compas tiene NOMBRE DIEGETICO. No son simbolos flotando: el rotulo es el nombre de la
//      maniobra (MOVES[id].name), asi que el jugador no teclea "abajo-izquierda-izquierda", VUELA
//      un BREAK TURN. Por eso el compas guarda el `move` y no un texto suelto: el nombre sale del
//      catalogo y no se puede desincronizar.
//
// Los TOKENS son los mismos del detector de combos (TAPTOK en core/input.js):
//   l r u d  = flechas / stick izquierdo   ·   L R = rolar (Q/E, el stick que rola)
//   U D      = mirar arriba/abajo          ·   Z   = la suelta (el remate, no es pirueta)

// ---------------- LAS PERILLAS (plan §5) ----------------
export const PULSO = {
  // el mundo casi detenido mientras dura la prueba. No es una pausa: a 0.08 el mar sigue
  // brillando y el buque cabecea — es TIEMPO DILATADO, que es lo que se siente en combate.
  SLOW: 0.08,
  // segundos por compas: del nivel 1 al maximo. La prueba entera nunca pasa de ~10 s (plan §6.3).
  // ARRANCA MAS HOLGADO QUE EL PLAN (1.6 s): tres toques en 1.6 s resultaron duros hasta para el
  // fixture, que fallaba por tiempo antes de poder teclear. La presion la pone la ESCALADA.
  T_BEAT: [2.2, 1.1],
  // errores perdonados por secuencia. El plan los ataba a la dificultad, pero el juego NO tiene
  // perilla de dificultad (plan §7, divergencia 1) — asi que el perdon escala por NIVEL: en los
  // primeros se perdona UNO (estas aprendiendo), despues ninguno.
  ERR_LV: 0.3,   // fraccion del avance de campaña hasta la que se perdona un error
  // el flak se acerca un grado por cada fallo (plan §3): cada grado ACHICA el margen del compas.
  // Es el costo del primer fallo hecho numero — volves, pero con menos aire.
  FLAK_T: [1, 0.92, 0.85],
  // intentos antes de que la mision se pierda. El 1º cuesta una vuelta; el 2º, una vida del
  // escuadron; el 3º es la derrota de siempre (plan §3 "El fallo").
  TRIES: 3,
  // compases por secuencia: nivel 1 → maximo
  BARS: [2, 4],
  // duracion de la cinematica de re-encare tras fallar (plan §3: el fallo es drama, no reset)
  REENCARE_T: 3.4,
};

// ---------------- LA RECOMPENSA (plan §3, fase Q3) ----------------
// Los COMPASES de la cinematica del premio, en segundos REALES. El techo de ~10 s del plan (§6.3)
// mide LA PRUEBA —lo que se juega— y no esto: el premio es la unica parte del modo donde el
// jugador no tiene nada que hacer, y por eso se cuenta aparte y se mantiene corto.
//
// La suma (≈5.3 s por el estirado de la clase) es deliberadamente mas larga que el re-encare del
// fallo (3.4 s): ganar tiene que durar mas que errar.
export const PULSO_CINE = {
  PIRUETA: 1.15,   // el avion vuela LA maniobra que se tecleo (la corre systems/moves.js)
  SUELTA: 0.85,    // la ristra cayendo — el unico tramo en que no pasa nada mas: es el silencio
  IMPACTO: 0.7,    // el estallido en la zona elegida
  // el buque muriendo (se estira por clase: ver PULSO_CLASE.sink). Bajo de 2,6 a pedido del
  // playtest: «sacar 1 segundo al final hasta que aparece el panel». La agonia era el unico tramo
  // que se podia recortar sin tocar el arco del ataque — y el que menos pierde, porque lo que hay
  // que ver ya se vio: el buque escorado y ardiendo se lee en un segundo y medio igual que en dos
  // y medio. El resto lo cuenta el recuento.
  MUERTE: 1.75,
  BOMBAS: 4,       // cuantas bombas tiene la ristra (canon de PASADA §8b)
  // el mundo VUELVE A CORRER cuando arranca el premio: el tiempo dilatado se suelta en esto. Con
  // 0,5 s y rampa lineal el arranque y el final del deshielo se notaban los dos como un escalon;
  // con 0,8 s y curva 'suave' (PLAN_CINE_PESO P4) el mundo sale de la camara lenta respirando.
  DESHIELO: 0.8,
  // cuanto CRECE el buque durante el premio. El pendiente honesto de Q1 era que el blanco no
  // domina el cuadro; se resuelve aca y no antes a proposito — durante la prueba el buque no
  // puede tapar la autopista, y en el premio la autopista ya no existe.
  // Es el tamaño del ULTIMO cuadro, no el del impacto: el acercamiento es una sola curva que corre
  // de punta a punta del premio (ver shipFx). Estuvo partido en dos y la costura caia justo en el
  // impacto — ahi el buque dejaba de crecer casi un segundo, que es lo que se leia como «el avion
  // frena al soltar».
  ZOOM: 4.2,
  // …y con que curva. >1 porque un acercamiento ACELERA: el tamaño aparente va con 1/distancia,
  // asi que a velocidad constante los ultimos metros crecen mucho mas que los primeros. Al
  // cuadrado (2) arrancaba demasiado plano y el buque tardaba en aparecer; 1.5 es el punto donde
  // domina el cuadro para el impacto Y sigue acelerando hasta el final.
  ZOOM_CURVA: 1.5,
  // …y cuanto BAJA en el cuadro mientras crece (pixeles de mundo). Un buque clavado en el
  // horizonte no puede dominar nada: la unica forma de que llene la vista es que se venga al
  // centro de la banda que la cabina deja libre.
  DROP: 16,
  // cuanto BAJA LA CABINA durante el premio. No es rediseñarla: es la misma cabina corrida, para
  // abrir cielo justo cuando lo que hay que mirar es el buque y ya no hay autopista que leer.
  //
  // ES UN CORRIMIENTO DE LA MIRA, no del dibujo (ver drawCockpit): la cabina baja Y SE ACHICA, pero
  // sigue estando ENTERA. Bajaba el PNG a secas y con 104 lo que quedaba en pantalla era el arco
  // del canopy flotando sobre nada — el panel, las manos y las rodillas afuera del cuadro. Una
  // cabina sin panel no se lee como una cabina; se lee como una calcomania.
  //
  // La regla a sostener sigue siendo "el buque tiene que quedar en cielo limpio", y ahora cuesta
  // MUCHO menos corrimiento: desde que la mira del PULSO apunta a la MIRA PLENA, la cabina ya
  // arranca alta y con el buque bien arriba del canopy.
  CABINA: 26,
};

// ---------------- EL TEATRO (plan §5, fase Q5) ----------------
// Lo que hace que la prueba se SIENTA sin que haya nada nuevo que leer. El criterio del plan es
// «mirada muda: tension sin leer nada» — o sea que todo esto tiene que funcionar con el sonido
// puesto y la vista en el buque, no como informacion.
export const PULSO_TEATRO = {
  // periodo del latido en segundos: con el compas recien abierto (relajado) → con el margen por
  // agotarse. 0.42 s son ~143 pulsaciones por minuto, que es el pulso de alguien en combate.
  HB: [0.95, 0.42],
  DUB: 0.15,      // separacion del segundo golpe del latido (el "lub-DUB")
  // cada fallo deja el corazon MAS ACELERADO de arranque: no se vuelve a la calma entre pasadas.
  HB_TRY: 0.13,
  SAL: 24,        // motas de sal secas en el vidrio (posiciones fijas, no titilan)
  // GOTAS de mar en el vidrio volando a ras (a 2 m es un manto; arriba de 7 no queda ninguna).
  // La sal es una marca vieja del avion; esto es el mar de AHORA, y por eso corre.
  AGUA: 74,
  // …y hasta que altura hay agua en el vidrio. Con 7 m el manto se secaba a mitad del salto; el
  // agua de verdad tarda en irse, y estirarlo hace que la trepada se lea como que te DESPEGAS del
  // mar en vez de como un interruptor.
  AGUA_ALT: 11,
};

// LOS SELLOS del premio (plan §3: "estrellas por sin errores, velocidad, zona brava"). Son
// multiplicadores sobre los puntos de la zona, no una moneda aparte: el premio del climax entra
// al recuento de la mision por la misma puerta que todo lo demas.
export const PULSO_PREMIO = {
  LIMPIO: 0.5,    // la secuencia entera sin un solo error
  RAPIDO: 0.35,   // por debajo del par de tiempo
  // la zona brava YA paga mas en la base (2200 contra 600): este extra es chico a proposito,
  // es el reconocimiento de haberla elegido, no el pago — el pago esta en `pts`.
  BRAVO: 0.25,
  // PAR de velocidad: fraccion del margen total que hay que gastar para llevarse el sello. 0.62
  // es "tecleaste sin dudar" — con el margen entero se llega, pero no si te quedaste pensando.
  PAR: 0.62,
};

// ---------------- LOS COMPASES ----------------
// `move` es el id de data/moves.js (de ahi sale el NOMBRE) y `seq` es su combo EXACTO — el mismo
// string que dispara la pirueta en el pasillo (ver el switch de `combo` en game.js). Si algun dia
// se cambia un combo alla, hay que cambiarlo aca: es la misma verdad escrita dos veces, y por eso
// systems/pulso.js valida al arrancar que cada `move` exista en MOVES.
export const COMPASES = [
  { move: 'breakt', seq: 'dll', dir: -1 },   // ↓←←  picar y empujar al lado
  { move: 'breakt', seq: 'drr', dir: 1 },    // ↓→→
  { move: 'sturn', seq: 'lrl', dir: -1 },    // ←→←  el barrido en S
  { move: 'sturn', seq: 'rlr', dir: 1 },     // →←→
  { move: 'jink', seq: 'ulr', dir: -1 },     // ↑←→  sacudida erratica
  { move: 'jink', seq: 'url', dir: 1 },      // ↑→←
  { move: 'loyo', seq: 'dud', dir: 1 },      // ↓↑↓  pica, sube, pica
  { move: 'hiyo', seq: 'udu', dir: 1 },      // ↑↓↑  sube, pica, sube
  { move: 'spin', seq: 'dLL', dir: -1 },     // picas con el izquierdo, rolas con el derecho
  { move: 'spin', seq: 'dRR', dir: 1 },
  { move: 'popup', seq: 'duu', dir: 1 },     // salir de rasante hacia arriba (contextual por altura)
  { move: 'splits', seq: 'udd', dir: 1 },    // medio tonel + picada (contextual por altura)
];

// EL REMATE. Toda secuencia termina soltando: es el unico compas que no es una pirueta, y por eso
// no tiene `move`. Su rotulo vive en strings (`pulso_soltar`) — es la accion, no una maniobra.
export const REMATE = { seq: 'Z', remate: true };

// POOL BASICO — el que se usa fuera de campaña (CICLO/PATRIA no tienen libreta del Pichon, asi que
// no hay "aprendidas" que respetar). Son los compases mas cortos y mas usados del pasillo.
export const POOL_BASICO = ['dll', 'drr', 'lrl', 'rlr', 'dud'];

// ---------------- LAS ZONAS (blanco → secuencia → cinematica) ----------------
// Elegir blanco ES parte de la prueba (plan §3): la zona facil pide una secuencia corta y paga
// poco; la brava pide la larga y paga el doble. `label` sale de strings, no de aca.
//
// LA CINEMATICA POR ZONA (Q3). `hitV`/`hitU` son DONDE pega, en unidades del buque dibujado
// (`uh` de alto, mitad de eslora de ancho, con la cubierta en v=0 y creciendo hacia abajo): el
// radar esta arriba del mastil, el puente a media torre y el polvorin bajo la linea de flotacion.
// El resto es COMO muere: `blast` el tamaño del estallido, `sec` el segundo (la carga que vuela
// despues, solo el polvorin), `sink` cuanto se hunde y `humo` cuanto arde.
//
// Es lo que hace que dos zonas den dos cinematicas distintas (criterio de cierre de Q3) sin
// escribir dos cinematicas: una sola, parametrizada por donde elegiste pegar.
export const PULSO_ZONAS = [
  { id: 'radar', str: 'pulso_z_radar', bars: -1, pts: 600, cine: 'alto',       // -1 = un compas MENOS
    hitV: -3.9, hitU: 0.03, blast: 0.85, sec: 0, sink: 0.5, humo: 0.55, muerte: 'pulso_m_ciego' },
  { id: 'bridge', str: 'pulso_z_bridge', bars: 0, pts: 1000, cine: 'medio',    //  0 = los del nivel
    hitV: -1.9, hitU: -0.07, blast: 1.15, sec: 0, sink: 0.85, humo: 1, muerte: 'pulso_m_puente' },
  { id: 'deposit', str: 'pulso_z_deposit', bars: 1, pts: 2200, cine: 'bajo',   // +1 = uno mas: la brava
    hitV: 0.7, hitU: 0.12, blast: 1.5, sec: 0.55, sink: 1.3, humo: 1.45, muerte: 'pulso_m_polvorin' },
];

// LA MUERTE POR CLASE (plan §3: "la muerte del buque por clase"). La clase sale de SHIP_CLASS
// (data/ships.js) — el mismo dato que ya elige el layout de zonas del climax 2D, asi que un buque
// nuevo no necesita nada nuevo aca. Modula lo que la zona propuso y aporta LA LINEA: cada clase
// se muere con su frase, que es lo unico que el jugador va a recordar de la cinematica.
export const PULSO_CLASE = {
  t42: { sink: 1.2, humo: 1, blast: 1.1, str: 'pulso_c_t42' },   // destructor: grande, se va lento
  t21: { sink: 0.9, humo: 0.9, blast: 1, str: 'pulso_c_t21' },   // fragata: mas chica, escora y se va
  log: { sink: 1.45, humo: 1.7, blast: 1.25, str: 'pulso_c_log' },   // logistico: la carga arde
};
export const CLASE_DEF = PULSO_CLASE.t21;

/** Glifos de cada token, para el render. Van ACA porque son parte del vocabulario, no del dibujo:
 *  el mismo simbolo que el jugador vio toda la partida en docs/PIRUETAS y en el HUD. */
export const TOK_GLIFO = {
  l: '←', r: '→', u: '↑', d: '↓',
  L: '⟳←', R: '⟳→', U: '↑↑', D: '↓↓',
  Z: 'Z',
};
