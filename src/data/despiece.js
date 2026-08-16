// LA DESTRUCCION — las recetas de muerte (docs/sistemas/PLAN_DESTRUCCION.md, etapa D0).
//
// LA REGLA DEL PLAN, en una linea: **nada muere desvaneciendose**. Todo destructible tiene su
// receta propia de pedazos — cuantos, de que tamaño, de que color, y sus piezas especiales — y
// los pedazos HEREDAN el impulso del que lo mato: la bala empuja hacia adelante, la bomba
// irradia, tu avion ARRASTRA. Despues rebotan y quedan humeando, igual que los del derribo.
//
// Esto es SOLO data: quien la interpreta es `despiece()` en core/fx.js y quien la dibuja es el
// caso 'chunk' de render/world.js. Nada de logica aca (data/ no importa nada del juego).
//
// POR QUE UNA TABLA Y NO UN if: porque el criterio de cierre de D2 es que seis tipos se
// distingan SIN leyenda. Con una receta generica pintada de otro color, D2 falla por definicion
// (§4.2). Agregar un tipo tiene que ser agregar una fila, no tocar codigo.
import { P, LAND } from './palette.js';

// ---------------- LAS PERILLAS (plan §3) ----------------
// Tope GLOBAL de pedazos vivos. Manda sobre el espectaculo (§4.4): al pasarse, los mas viejos se
// disuelven antes de tiempo — nunca se le niega el despiece al que acaba de morir.
export const CHUNKS_MAX = 60;
// segundos humeando antes de disolverse (el mismo reloj `chunkT` del derribo)
export const CHUNK_LIFE = 4;
// Tope de PARTICULAS vivas (D5). Los pedazos ya tenian su cap; las particulas no tenian ninguno, y
// son las que se disparan de a decenas por muerte — tres muertes encadenadas con secundarias y
// columnas de humo son cientos. Al pasarse se van las MAS VIEJAS, que son las que ya casi se
// apagaron: el reventon que acaba de nacer nunca se recorta.
export const PARTS_MAX = 260;
// SECUNDARIAS del deposito (plan §3): 3-5 reventones en 1.5 s. El pop-pop-pop es lo que convierte
// "exploto" en "se esta incendiando el combustible" — la muerte dura mas que el frame del impacto.
export const SEC_N = [3, 5];
export const SEC_T = 1.5;
// LA COLUMNA que queda: segundos que una pira sigue tirando humo despues de la explosion. Es el
// unico efecto de este plan que sobrevive al momento — el pasillo detrás tuyo es la historia de
// tu corrida (§1), y una columna a lo lejos es esa historia contada sin texto.
export const HUMO_T = 6;

// ---------------- LA ONDA Y EL GOLPE (D3) ----------------
// Lo que separa una explosion de un DETONACION: que te alcance. Todo esto escala con la distancia
// al avion — el criterio de cierre de la etapa es que la misma explosion se sienta distinta al
// lado tuyo que a 300 m.
export const ONDA_T = 0.5;        // segundos que tarda el anillo en abrirse del todo
export const ONDA_R = 30;         // radio final del anillo, en metros de mundo
export const ONDA_PUSH = 30;      // cuanto empuja al escombro que agarra adentro
export const CERCA = 90;          // metros: mas cerca que esto, la explosion te sacude a VOS
export const FLASH_T = 0.12;      // lo que dura el fogonazo (un parpadeo, no una pantalla blanca)

// ---------------- EL ENCADENAMIENTO (D4) ----------------
// Una explosion grande prende lo que tiene al lado. Volar UN tiro que tira tres cosas es la jugada
// de estilo del modo — pero una cadena sin tope es un bucle que se come la mision entera, asi que
// la profundidad esta acotada y solo encadena lo que revienta GRANDE.
export const CHAIN_R = 22;            // metros de contagio
export const CHAIN_DEPTH = 2;         // saltos maximos (el 1º prende al 2º, el 2º al 3º, y basta)
export const CHAIN_DELAY = [0.25, 0.6];   // el retardo ES la lectura: sin el, la cadena es un ruido

// Colores de escombro por familia. Salen de la paleta del juego, no inventados: el metal militar
// es el gris verdoso del fuselaje, la mamposteria toma del terreno, y la lona su propio beige.
const METAL = ['#3a4038', '#4a5148', '#5c6358'];
const OXIDO = ['#5a3d2a', '#6b4a30', '#3a2c20'];        // chapa quemada / oxidada (tanques)
const LONA = ['#7a6d4e', '#8d7f5c', '#5f5540'];         // carpa: lona y cabos
const MAMPO = [LAND.rock, '#6b6f62', '#4a4f44'];        // ladrillo, hormigon, piedra
const MADERA = ['#5b4630', '#6f5738', '#3d2f20'];       // postes, arboles, mastiles
const AVION = [P.body, P.bodyDark, P.canopy];           // fuselaje: el mismo del jugador

// ---------------- LAS RECETAS ----------------
//   n      cuantos pedazos (4-9 segun el plan §3; los chicos menos, los grandes mas)
//   size   rango de tamaño del pedazo, en unidades de mundo
//   c      paleta de escombro de ESE objeto
//   hot    fraccion de pedazos que quedan al rojo (dejan hilo de humo)
//   up     cuanto los tira para arriba el reventon (los livianos vuelan, la piedra no)
//   spread apertura lateral
//   pieza  UNA pieza especial, reconocible, que sale entera: la firma del tipo.
//
// Y LA MUERTE (D2) — lo que hace que seis tipos se distingan SIN leyenda:
//   bola    'grande' | 'chica' | null   la bola de fuego. `null` es tan expresivo como las otras:
//                                       la lona NO arde, y una carpa que revienta en llamas miente
//   chispa  'metal' | 'polvo' | null    el reventon inicial: chispazo blanco de acero contra acero,
//                                       o nube de tierra y polvo de la mamposteria
//   sec     true                        secundarias retardadas (el pop-pop-pop del combustible)
//   humo    segundos                    columna que PERSISTE en el lugar despues de todo
//   caida   'espiral'                   la muerte en dos actos: el resto cae girando y revienta
//                                       al tocar el suelo
//   grav    factor de gravedad          lo liviano planea (lona, tela); 1 = escombro normal
export const DESPIECE = {
  // DEPOSITO DE COMBUSTIBLE: el mas grande y el mas sucio. Chapa oxidada del tanque.
  depot: { n: 9, size: [0.7, 1.9], c: OXIDO, hot: 0.85, up: 20, spread: 20, pieza: 'tanque',
    bola: 'grande', chispa: null, sec: true, humo: HUMO_T },
  // ANTIAEREO: metal, poco pedazo y muy caliente — le vuela la municion adentro
  aa: { n: 6, size: [0.4, 1.0], c: METAL, hot: 0.8, up: 17, spread: 15, pieza: 'canon',
    bola: 'chica', chispa: 'metal', humo: 2.5 },
  aatruck: { n: 7, size: [0.5, 1.3], c: METAL, hot: 0.75, up: 15, spread: 15, pieza: 'cabina',
    bola: 'chica', chispa: 'metal', humo: 3 },
  // RADAR: el plato sale entero, girando. Es la pieza mas reconocible del juego.
  radar: { n: 6, size: [0.5, 1.2], c: METAL, hot: 0.5, up: 16, spread: 14, pieza: 'plato',
    bola: 'chica', chispa: 'metal', humo: 2 },
  // CARPA: lona y polvo. Liviana: vuela lejos y alto, y casi no arde (D2 le saca la bola de fuego)
  tent: { n: 6, size: [0.5, 1.4], c: LONA, hot: 0.1, up: 24, spread: 22, pieza: null,
    bola: null, chispa: 'polvo', humo: 0, grav: 0.5 },
  // HELICOPTERO: el rotor se va solo. La muerte en dos actos del plan (D2) empieza en esta pieza.
  helo: { n: 7, size: [0.5, 1.3], c: METAL, hot: 0.7, up: 18, spread: 16, pieza: 'rotor',
    bola: 'chica', chispa: 'metal', caida: 'espiral', humo: 3 },
  // JET: fuselaje de avion — el mismo escombro que el del jugador, que es justo la lectura
  jet: { n: 8, size: [0.5, 1.4], c: AVION, hot: 0.7, up: 16, spread: 18, pieza: 'ala',
    bola: 'grande', chispa: null, humo: 0 },
  // GLOBO: no hay escombro duro; son jirones de tela que caen planeando
  balloon: { n: 5, size: [0.6, 1.6], c: LONA, hot: 0, up: 10, spread: 20, pieza: 'funda',
    bola: null, chispa: null, humo: 0, grav: 0.25 },
  // CONSTRUCCION: mamposteria. Pesada, poco vuelo, mucho polvo.
  bldg: { n: 9, size: [0.8, 2.0], c: MAMPO, hot: 0.2, up: 11, spread: 16, pieza: null,
    bola: 'chica', chispa: 'polvo', humo: 4 },
  tower: { n: 7, size: [0.6, 1.6], c: MAMPO, hot: 0.2, up: 13, spread: 14, pieza: null,
    bola: null, chispa: 'polvo', humo: 2 },
  // MADERA: el arbol, los postes, el mastil de la fragata
  tree: { n: 6, size: [0.5, 1.5], c: MADERA, hot: 0.15, up: 14, spread: 18, pieza: null,
    bola: null, chispa: 'polvo', humo: 0 },
  poles: { n: 5, size: [0.4, 1.1], c: MADERA, hot: 0.1, up: 12, spread: 16, pieza: 'cable',
    bola: null, chispa: 'metal', humo: 0 },
  mast: { n: 6, size: [0.5, 1.3], c: METAL, hot: 0.5, up: 14, spread: 14, pieza: null,
    bola: 'chica', chispa: 'metal', humo: 2 },
  flag: { n: 4, size: [0.4, 1.0], c: LONA, hot: 0, up: 18, spread: 20, pieza: null,
    bola: null, chispa: 'polvo', humo: 0, grav: 0.6 },
  // BARCAZA DE DESEMBARCO: chapa de barco
  lcu: { n: 8, size: [0.7, 1.7], c: METAL, hot: 0.6, up: 12, spread: 18, pieza: 'rampa',
    bola: 'grande', chispa: 'metal', sec: true, humo: 5 },
  // AVION DEL JUGADOR: la receta que ya existia en die(), escrita como fila. Es la referencia de
  // la que sale todo el resto — el despiece del derribo es el que se generalizo.
  plane: { n: 9, size: [0.5, 1.4], c: AVION, hot: 0.6, up: 18, spread: 14, pieza: null,
    bola: null, chispa: null, humo: 0 },   // el derribo pone SU bola pixel aparte (ver die)
};

// LA RECETA POR DEFECTO. §4.6 del plan: `explodeAt` no se rompe y la migracion es tipo por tipo,
// asi que lo que no tiene fila igual se despieza — con escombro neutro, sin pieza especial.
export const DESPIECE_DEF = { n: 5, size: [0.5, 1.2], c: METAL, hot: 0.4, up: 15, spread: 15,
  pieza: null, bola: 'chica', chispa: null, humo: 0 };

/** La receta de un tipo (siempre devuelve una: nada se queda sin morir). */
export const recetaDe = tipo => DESPIECE[tipo] || DESPIECE_DEF;
