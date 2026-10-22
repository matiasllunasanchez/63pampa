// EL GUION DEL TRAILER — la lista de planos, como DATO.
//
// Cada plano es: con que se prepara el juego (`prep` / `antes`), cuanto dura (`dur`) y que pasa
// adentro (`marcas`, cada una con su segundo). El que filma (tools/trailer.js) no sabe nada del
// juego: todo lo que el trailer muestra se decide aca.
//
// TRES FORMAS DE ARMAR UN PLANO, y las tres estan a proposito:
//
//   · POR LA PUERTA DEL JUGADOR — teclas. Es la unica forma honesta de filmar los menus: lo que
//     se ve es el menu moviendose como se mueve cuando alguien lo usa, con sus fundidos y su
//     logo que viaja. Los planos del lobby son todos asi.
//   · POR EL CATALOGO DE MOMENTOS (`__prb`, data/pruebas.js) — para las escenas armadas. Ese
//     catalogo ya existe y ya es, literalmente, la lista de los mejores momentos del juego
//     puestos a mano: la tormenta, el callejon, la Chancha con la nafta justa, el climax. Un
//     trailer que los re-armara por su cuenta estaria copiando a mano algo que el repo mantiene.
//   · POR LAS SONDAS (`window.__*`) — para el vuelo libre y las piruetas. Pedirle a un piloto
//     automatico que entre justo al callejon y tire un SPLIT-S es pedirle que juegue bien sesenta
//     veces seguidas; pedirselo a `__mv('splits')` sale igual todas las veces.
//
// EL AVION VUELA BAJO, Y NO ES ESTETICA: arriba de RADAR_ALT (20) el radar enemigo te ve y te
// bajan — medido, a 34 de altura el piloto automatico se come tres derribos en veinte segundos y
// a 14 no se come ninguno en el mismo rato. El juego se llama RASANTE por eso.
//
// `calentar` SON CUADROS QUE NO SE GRABAN, y los momentos del catalogo los necesitan: casi todos
// siembran lo suyo con `a.luego(t, ...)` —la tormenta pone la rompiente a los 2,2 s, la Chancha
// llama al Hercules a los 2— y filmar antes de eso es filmar el momento que todavia no paso.
//
// `t` es segundos DESDE QUE EMPIEZA EL PLANO (no del trailer).

// LAS TECLAS (src/core/input.js). W/A/S/D es la mano que vuela SIEMPRE; las flechas cambian de
// trabajo segun la mira, asi que en vuelo no se usan — solo en los menus.
const FUEGO = 'KeyX', TURBO = 'ShiftLeft', BOMBA = 'KeyZ';
const OK = 'Enter', ARR = 'ArrowUp', ABJ = 'ArrowDown', MIZQ = 'ArrowLeft', MDER = 'ArrowRight';

// EL ROSTER (data/planes.js, por orden): el indice que entiende `__avion`.
const A4B = 0, DAGGER = 1, SUPERE = 2, A4Q = 3;

/** El pasillo infinito (POR LA PATRIA) con vidas de sobra y el piloto puesto: la cama de los
 *  planos de vuelo libre. `over` pisa cielo, terreno y clima; `piloto`, la altura y el vaiven.
 *  EL AVION SE ELIGE SIEMPRE: POR LA PATRIA respeta la eleccion del jugador, asi que sin esto el
 *  plano se vuela con lo que haya quedado en el carrusel (salio un Hercules haciendo toneles). */
const VOLANDO = (over = {}, piloto = {}, avion = A4B) => [
  `window.__avion(${avion})`,
  `window.__patria()`,
  `window.__vidas(99)`,
  ...Object.entries(over).map(([k, v]) => `window.__cfgset(${JSON.stringify(k)}, ${JSON.stringify(v)})`),
  `window.__tr.piloto(${JSON.stringify({ alt: 13, vagar: 9, ritmo: 0.5, ...piloto })})`,
].join('; ');

/** Un momento del catalogo (data/pruebas.js) con vidas de sobra y piloto. */
const MOMENTO = (id, piloto = {}) => [
  `window.__prb(${JSON.stringify(id)})`,
  `window.__vidas(99)`,
  piloto === null ? '' : `window.__tr.piloto(${JSON.stringify({ alt: 13, vagar: 8, ritmo: 0.5, ...piloto })})`,
].filter(Boolean).join('; ');

module.exports = [
  // ============ 1. LA MAQUINA ============
  { id: 'portada', dur: 3.0, prep: `window.__pantalla('title')` },

  {
    id: 'modos', dur: 2.8, prep: `window.__pantalla('title')`,
    marcas: [{ t: 0.3, toque: OK }, { t: 1.5, toque: ABJ }, { t: 2.2, toque: ARR }],
  },

  {
    id: 'salidas', dur: 4.0, prep: `window.__pantalla('campmenu')`,
    marcas: [
      { t: 0.3, toque: OK },                      // LIBRO DE VUELO
      { t: 1.3, toque: ABJ }, { t: 2.0, toque: ABJ }, { t: 2.7, toque: ABJ }, { t: 3.4, toque: ABJ },
    ],
  },

  {
    // EL CUADERNO: el contexto de una salida real, tipeado como un parte
    id: 'contexto', dur: 4.2, prep: `window.__pantalla('campmenu')`,
    antes: [{ toque: OK }],
    marcas: [{ t: 0.3, toque: OK }, { t: 2.4, toque: OK }, { t: 4.0, toque: OK }],
  },

  {
    // EL CARRUSEL DE AVIONES, con la ficha de cada uno. Entra por JUEGO RAPIDO → CICLO DE MUERTE,
    // que es donde el jugador elige avion de verdad.
    id: 'aviones', dur: 5.8, prep: `window.__pantalla('modeselect')`,
    antes: [{ toque: ABJ }, { toque: OK }, { toque: OK }],
    marcas: [
      { t: 0.8, toque: MDER }, { t: 1.8, toque: MDER }, { t: 2.8, toque: MDER },
      { t: 3.8, toque: MDER }, { t: 4.8, toque: MDER }, { t: 5.7, toque: MIZQ },
    ],
  },

  // ============ 2. EL VUELO ============
  {
    id: 'amanecer', dur: 4.0, prep: VOLANDO({ sky: 'dawn' }, { alt: 11, vagar: 12 }),
    calentar: 1.5,
    marcas: [{ t: 1.2, apretar: [TURBO] }, { t: 3.4, soltar: [TURBO] }],
  },

  {
    id: 'piruetas', dur: 6.5, prep: VOLANDO({ sky: 'sun' }, { alt: 13 }),
    calentar: 1.5,
    marcas: [
      { t: 0.5, js: `window.__mv('tonel', 1)` },
      { t: 1.9, js: `window.__mv('splits', 1)` },
      { t: 3.4, js: `window.__mv('breakt', -1)` },
      { t: 4.8, js: `window.__mv('barrel', 1)` },
      { t: 6.2, js: `window.__mv('jink', -1)` },
    ],
  },

  {
    // LA MANIOBRA FILMADA: bandas negras y mundo en camara lenta (data/cines.js, `maniobra`)
    id: 'mvfilm', dur: 4.0, prep: VOLANDO({ sky: 'dawn' }, { alt: 13 }),
    calentar: 1.5,
    marcas: [{ t: 0.4, js: `window.__mvfilm('splits', 1)` }],
  },

  { id: 'costa', dur: 3.6, prep: MOMENTO('costa', { alt: 12, vagar: 14, ritmo: 0.6 }), calentar: 3.5 },

  { id: 'ola', dur: 3.0, prep: MOMENTO('olaRebelde', { alt: 11, vagar: 4, ritmo: 0.5 }), calentar: 5 },

  { id: 'tormenta', dur: 3.6, prep: MOMENTO('tormenta', { alt: 12, vagar: 10, ritmo: 0.6 }), calentar: 4 },

  // ============ 3. LA GUERRA ============
  {
    // EL HARRIER ATRAS: el aviso, con el pasillo vacio
    id: 'cola', dur: 3.5, prep: MOMENTO('colaAviso', { alt: 13, vagar: 7, ritmo: 0.6 }), calentar: 5,
  },

  {
    // …Y ADELANTE: la unica chance de tirarle
    id: 'canion', dur: 4.0, prep: MOMENTO('colaVentana', { alt: 13, vagar: 5, ritmo: 0.6 }), calentar: 5,
    marcas: [{ t: 0.4, apretar: [FUEGO] }, { t: 3.8, soltar: [FUEGO] }],
  },

  {
    // EL TEATRO AEREO: el numeral entra, vuela la figura y derriba (data/cines.js, `teatro`)
    id: 'teatro', dur: 4.5, prep: VOLANDO({ sky: 'dawn' }, { alt: 13 }, DAGGER),
    calentar: 1.5,
    marcas: [{ t: 0.4, js: `window.__teatrofilm('breakt', 1)` }],
  },

  {
    id: 'noche', dur: 4.0, prep: VOLANDO({ sky: 'moon', terrain: 'land', fog: 1, obstacles: 1.4 }, { alt: 12 }),
    calentar: 2,
    marcas: [{ t: 2.0, js: `window.__mv('mask', 1)` }],
  },

  { id: 'cadena', dur: 3.6, prep: MOMENTO('cadena', { alt: 11, vagar: 3, ritmo: 0.5 }), calentar: 10 },


  {
    // LA CHANCHA: el KC-130 que viene a dar de tomar. La cita vive a CH_ALT = 48, o sea ARRIBA del
    // radar (20): sin limpiar el pasillo el avion sube y lo bajan antes de llegar — paso, y el
    // plano salia siendo un derribo. `__chacalma()` vacia obstaculos, misiles y deteccion, y se
    // repite durante el plano porque la deteccion vuelve a subir sola.
    id: 'chancha', dur: 4.5, calentar: 9,
    prep: [`window.__avion(${A4B})`, `window.__patria()`, `window.__vidas(99)`,
      `window.__chafuel(1)`, `window.__chacalma()`, `window.__chaset(1)`, `window.__chacall()`,
      `window.__tr.piloto({alt:47, vagar:3, ritmo:0.4})`].join('; '),
    marcas: [{ t: 1.5, js: `window.__chacalma()` }, { t: 3.5, js: `window.__chacalma()` }],
  },

  {
    // EL MOMENTUM: la barra llena y, con la tecla, la camara lenta
    id: 'momentum', dur: 3.5, prep: MOMENTO('tempo', { alt: 12, vagar: 8, ritmo: 0.6 }), calentar: 3,
    marcas: [{ t: 0.6, toque: 'Digit4' }],
  },

  // ============ 4. EL BLANCO ============

  { id: 'burbuja', dur: 3.5, prep: MOMENTO('arenaBurbuja', { alt: 14, vagar: 10, ritmo: 0.8 }), calentar: 10 },

  {
    // EL PULSO, JUGADO: el QTE acertado y, enganchada, la cinematica del premio
    id: 'pulso', dur: 10.0, prep: MOMENTO('pulso', null), calentar: 2,
    antes: [{ js: `window.__tr.pulso(9)` }],
  },

  // ============ 5. EL BANCO Y EL CIERRE ============
  {
    id: 'banco', dur: 4.0, prep: `window.__bancoAbrir()`,
    marcas: [{ t: 1.0, toque: MDER }, { t: 2.2, toque: MDER }, { t: 3.4, toque: ABJ }],
  },

  { id: 'cierre', dur: 4.5, prep: `window.__pantalla('title')` },
];
