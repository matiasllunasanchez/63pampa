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
  T_BEAT: [1.6, 0.9],
  // errores perdonados por secuencia segun dificultad. En facil se perdona UNO; de normal para
  // arriba, ninguno: el error corta el compas y hay que rehacerlo.
  ERR: { easy: 1, normal: 0, hard: 0 },
  // intentos antes de que la mision se pierda. El 1º cuesta una vuelta; el 2º, una vida del
  // escuadron; el 3º es la derrota de siempre (plan §3 "El fallo").
  TRIES: 3,
  // compases por secuencia: nivel 1 → maximo
  BARS: [2, 4],
  // duracion de la cinematica de re-encare tras fallar (plan §3: el fallo es drama, no reset)
  REENCARE_T: 3.4,
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
export const PULSO_ZONAS = [
  { id: 'radar', bars: -1, pts: 600, cine: 'alto' },      // -1 = un compas MENOS que el nivel
  { id: 'bridge', bars: 0, pts: 1000, cine: 'medio' },    //  0 = los del nivel
  { id: 'deposit', bars: 1, pts: 2200, cine: 'bajo' },    // +1 = uno mas: la brava
];

// LA SECUENCIA FIJA DE Q1. La primera fase del plan pide "UNA secuencia fija visible con cursor"
// para poder cerrar el ciclo de punta a punta antes de que exista el sorteo por nivel (Q2).
// Es un BREAK TURN + la suelta: el combo mas corto del pasillo y el remate.
export const SEQ_Q1 = ['dll', 'Z'];

/** Glifos de cada token, para el render. Van ACA porque son parte del vocabulario, no del dibujo:
 *  el mismo simbolo que el jugador vio toda la partida en docs/PIRUETAS y en el HUD. */
export const TOK_GLIFO = {
  l: '←', r: '→', u: '↑', d: '↓',
  L: '⟳←', R: '⟳→', U: '↑↑', D: '↓↓',
  Z: 'Z',
};
