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
//   resto   nombre de hoja | null      LO QUE QUEDA EN EL LUGAR (PLAN_HORNEADO B1). El estado roto,
//                                       horneado con silueta propia, que se planta donde estaba la
//                                       cosa y se queda ahi hasta que el pasillo lo deja atras. Es
//                                       lo que convierte "el pasillo detras tuyo es la historia de
//                                       tu corrida" en algo que se ve: la columna de humo dura 6
//                                       segundos, el resto dura toda la pasada. `null` es una
//                                       respuesta valida — lo que se DESINTEGRA no deja carcasa.
//   partes  lista de PIEZAS horneadas    de que se rompe esta cosa, en piezas de verdad. Los
//           nombres salen de PARTES en render/partes.js (y de la hoja que hornea
//           tools/bake_partes.html). Sin `partes`, el pedazo cae al rectangulo de siempre.
//
// Y EL PESO (V2 del plan v2) — 'liviano' | 'medio' | 'pesado'. No es decoracion: es lo que decide
// si un misil manda la cosa VOLANDO por el aire, la VUELCA, o no la mueve y la revienta en el
// lugar. Va en la receta y no en una tabla aparte porque es una propiedad del objeto, igual que
// su paleta o su pieza reconocible.
export const DESPIECE = {
  // DEPOSITO DE COMBUSTIBLE: el mas grande y el mas sucio. Chapa oxidada del tanque.
  depot: { masa: 'pesado', n: 9, size: [0.7, 1.9], c: OXIDO, hot: 0.85, up: 20, spread: 20, pieza: 'tanque',
    bola: 'grande', chispa: null, sec: true, humo: HUMO_T, resto: 'resto_depot' },
  // ANTIAEREO: metal, poco pedazo y muy caliente — le vuela la municion adentro
  aa: { masa: 'medio', n: 6, size: [0.4, 1.0], c: METAL, hot: 0.8, up: 17, spread: 15, pieza: 'canon',
    bola: 'chica', chispa: 'metal', humo: 2.5, resto: 'resto_aa' },
  aatruck: { masa: 'medio', n: 7, size: [0.5, 1.3], c: METAL, hot: 0.75, up: 15, spread: 15, pieza: 'cabina',
    bola: 'chica', chispa: 'metal', humo: 3, resto: 'resto_aatruck' },
  // RADAR: el plato sale entero, girando. Es la pieza mas reconocible del juego.
  radar: { masa: 'medio', n: 6, size: [0.5, 1.2], c: METAL, hot: 0.5, up: 16, spread: 14, pieza: 'plato',
    bola: 'chica', chispa: 'metal', humo: 2, resto: 'resto_radar' },
  // CARPA: lona y polvo. Liviana: vuela lejos y alto, y casi no arde (D2 le saca la bola de fuego)
  tent: { masa: 'liviano', n: 6, size: [0.5, 1.4], c: LONA, hot: 0.1, up: 24, spread: 22, pieza: null,
    bola: null, chispa: 'polvo', humo: 0, grav: 0.5, resto: 'resto_tent' },
  // HELICOPTERO: el rotor se va solo. La muerte en dos actos del plan (D2) empieza en esta pieza.
  helo: { masa: 'medio', n: 7, size: [0.5, 1.3], c: METAL, hot: 0.7, up: 18, spread: 16, pieza: 'rotor',
    bola: 'chica', chispa: 'metal', caida: 'espiral', humo: 3, resto: 'resto_helo',
    // el HELO comparte las piezas de chapa y de tren, pero no las de avion de combate: no tiene
    // ala ni tobera. El rotor sigue siendo su `pieza` dibujada a mano — es su firma y ya funciona.
    partes: [null, 'panel', 'fuselaje', 'tren', 'panel', 'cabina', 'panel'] },
  // JET: fuselaje de avion — el mismo escombro que el del jugador, que es justo la lectura.
  //
  // LAS CUATRO MUERTES DEL AIRE (v2 §3). Se distinguen por CUANTOS PEDAZOS GRANDES quedan y por
  // que hacen — no por el color, que en las cuatro es el mismo fuselaje:
  //
  //   desintegracion  NINGUNO       abanico ancho de pedacitos, y se acabo         (instantanea)
  //   ala             UNO           el ala sola girando + el resto en tirabuzon    (media)
  //   partido         DOS           proa girando y cola cayendo plana, separandose (media)
  //   moribundo       UNO, ENTERO   sigue de largo humeando y revienta lejos       (larga)
  //
  // Esa es la prueba del §1: en blanco y negro, "cuantas cosas grandes hay y para donde van" se
  // lee de un vistazo. Los tiempos ademas no se pisan: la primera termina cuando la ultima empieza.
  jet: { masa: 'medio', n: 8, size: [0.5, 1.4], c: AVION, hot: 0.7, up: 16, spread: 18, pieza: 'ala',
    bola: 'grande', chispa: null, humo: 0, resto: 'resto_jet',
    // DE QUE SE ROMPE UN AVION. El orden importa: el pedazo 0 es el que la variante convierte en
    // "la pieza grande", asi que el ala va primera. Y el panel va al final porque es el relleno —
    // el pedazo que no es nada en particular, pero que igual tiene forma de chapa arrancada.
    partes: ['ala', 'fuselaje', 'estab', 'cola', 'deriva', 'tanque', 'tren', 'panel', 'morro', 'cabina'],
    variantes: [
      // EL MISIL NO DEJA NADA. Tambien es la muerte de la onda y de la cadena: energia de sobra.
      { id: 'desintegracion', peso: 3,
        cuando: a => a.killer === 'misil' || a.killer === 'onda' || a.killer === 'cadena',
        receta: { n: 12, size: [0.28, 0.8], up: 26, spread: 40, hot: 0.9, bola: 'grande', pieza: null } },
      // EL CAÑON ARRANCA UN ALA. La pieza grande gira sola y el resto se va en tirabuzon: es la
      // misma maquinaria de dos actos del helo (D2), aplicada a otro cuerpo.
      { id: 'ala', peso: 3, forma: 'ala',
        cuando: a => a.killer === 'canon' || a.killer === 'choque',
        receta: { n: 7, size: [0.4, 1.0], up: 14, spread: 14, bola: 'chica', chispa: 'metal' } },
      // EL QUE SE VA MURIENDO. El unico que NO revienta donde lo tocaste: sigue de largo, baja, y
      // explota lejos. Por eso tiene cap (MORIBUNDO_MAX) y vida acotada — §6.2.
      { id: 'moribundo', peso: 2, forma: 'moribundo',
        cuando: a => a.killer === 'canon',
        receta: { n: 4, size: [0.3, 0.75], up: 8, spread: 9, bola: null, chispa: 'metal' } },
      // PARTIDO AL MEDIO. Dos pedazos grandes que se separan, y cada uno cae distinto.
      { id: 'partido', peso: 2, forma: 'partido',
        cuando: a => a.killer === 'misil' || a.killer === 'choque',
        receta: { n: 6, size: [0.4, 1.0], up: 12, spread: 12, bola: 'chica', chispa: 'metal' } },
    ] },
  // GLOBO: no hay escombro duro; son jirones de tela que caen planeando
  balloon: { masa: 'liviano', n: 5, size: [0.6, 1.6], c: LONA, hot: 0, up: 10, spread: 20, pieza: 'funda',
    bola: null, chispa: null, humo: 0, grav: 0.25, resto: 'resto_balloon' },
  // CONSTRUCCION: mamposteria. Pesada, poco vuelo, mucho polvo.
  bldg: { masa: 'pesado', n: 9, size: [0.8, 2.0], c: MAMPO, hot: 0.2, up: 11, spread: 16, pieza: null,
    bola: 'chica', chispa: 'polvo', humo: 4, resto: 'resto_bldg' },
  tower: { masa: 'pesado', n: 7, size: [0.6, 1.6], c: MAMPO, hot: 0.2, up: 13, spread: 14, pieza: null,
    bola: null, chispa: 'polvo', humo: 2 },
  // MADERA: el arbol, los postes, el mastil de la fragata
  tree: { masa: 'medio', n: 6, size: [0.5, 1.5], c: MADERA, hot: 0.15, up: 14, spread: 18, pieza: null,
    bola: null, chispa: 'polvo', humo: 0 },
  poles: { masa: 'liviano', n: 5, size: [0.4, 1.1], c: MADERA, hot: 0.1, up: 12, spread: 16, pieza: 'cable',
    bola: null, chispa: 'metal', humo: 0 },
  mast: { masa: 'medio', n: 6, size: [0.5, 1.3], c: METAL, hot: 0.5, up: 14, spread: 14, pieza: null,
    bola: 'chica', chispa: 'metal', humo: 2 },
  flag: { masa: 'liviano', n: 4, size: [0.4, 1.0], c: LONA, hot: 0, up: 18, spread: 20, pieza: null,
    bola: null, chispa: 'polvo', humo: 0, grav: 0.6 },
  // BARCAZA DE DESEMBARCO: chapa de barco
  lcu: { masa: 'pesado', n: 8, size: [0.7, 1.7], c: METAL, hot: 0.6, up: 12, spread: 18, pieza: 'rampa',
    bola: 'grande', chispa: 'metal', sec: true, humo: 5, resto: 'resto_lcu' },
  // AVION DEL JUGADOR: la receta que ya existia en die(), escrita como fila. Es la referencia de
  // la que sale todo el resto — el despiece del derribo es el que se generalizo.
  plane: { masa: 'medio', n: 9, size: [0.5, 1.4], c: AVION, hot: 0.6, up: 18, spread: 14, pieza: null,
    bola: null, chispa: null, humo: 0,     // el derribo pone SU bola pixel aparte (ver die)
    // TU avion se rompe en las mismas piezas que los demas — tiene que ser asi: es el mismo avion,
    // y el derribo es la referencia de la que salio todo el despiece (D0).
    partes: ['fuselaje', 'ala', 'cabina', 'cola', 'estab', 'deriva', 'tren', 'panel', 'morro'] },
};

// LA RECETA POR DEFECTO. §4.6 del plan: `explodeAt` no se rompe y la migracion es tipo por tipo,
// asi que lo que no tiene fila igual se despieza — con escombro neutro, sin pieza especial.
export const DESPIECE_DEF = { masa: 'medio', n: 5, size: [0.5, 1.2], c: METAL, hot: 0.4, up: 15, spread: 15,
  pieza: null, bola: 'chica', chispa: null, humo: 0 };

/** La receta de un tipo (siempre devuelve una: nada se queda sin morir). */
export const recetaDe = tipo => DESPIECE[tipo] || DESPIECE_DEF;

// ================= LAS VARIANTES DE MUERTE (PLAN_DESTRUCCION_V2) =================
//
// D2 le dio a cada TIPO su receta de muerte. Esto le da a cada muerte sus VARIANTES: la misma
// cosa se rompe distinto segun que la mato, con cuanta fuerza, desde donde, cuanto pesa y un dado.
//
// LA REGLA (plan §1): una variante se distingue por la SILUETA del movimiento y por el TIEMPO,
// nunca solo por el color. Si dos variantes no se distinguen en una captura en blanco y negro, la
// segunda no existe.

export const VIDA_LARGA = 7;      // segundos: el techo de vida del pedazo que sobrevive a su muerte
                                  // (moribundo, tirabuzon, paracaidas). §6.2: la muerte se alarga, pero no sin tope
export const MORIBUNDO_MAX = 2;   // cuantos "se van muriendo" pueden vivir a la vez (§6.2: sin esto la muerte no tiene tope)
export const EYECT_P = 0.35;      // probabilidad de que el piloto alcance a eyectarse
export const SANTABARBARA_P = 0.12;  // la explosion rara del barco: el evento que se comenta
export let VAR_SEED = null;       // fuerza una variante por id (solo pruebas; null = sortea)

/** Fuerza (o libera) la variante. Es de PRUEBAS: sin esto, afirmar "las cuatro se ven distintas"
 *  depende de que el dado quiera, y una prueba que depende del azar no prueba nada. */
export function forzarVariante(id) { VAR_SEED = id || null; }

/** EL DADO de una muerte: 0..1 estable POR OBJETO.
 *
 *  Nada de `Math.random()` (trampa §1.4 del plan v2 y §1.3 de SPEC_AGUA_OLAS): si el dado se
 *  sorteara en el momento de morir, la misma muerte daria una variante distinta en cada corrida y
 *  el fixture no podria afirmar nada. Sale de lo que el objeto YA trae y no cambia nunca.
 *
 *  DIVERGENCIA con el plan §2: `o.seed` NO existe en general — solo lo tiene el acantilado (el
 *  unico destructible que ademas no se despieza). El resto trae `ph`, la fase que se le sortea al
 *  nacer, que es igual de estable. Se usa `seed` si esta y `ph`+posicion si no, con el hash de
 *  senos que el repo ya usa para todo lo determinista. */
export function dadoDe(o) {
  if (o.seed != null) return (Math.abs(o.seed) % 9973) / 9973;
  const s = Math.sin((o.ph || 0) * 127.1 + (o.x || 0) * 311.7 + (o.z || 0) * 74.7) * 43758.5453;
  return s - Math.floor(s);
}

/** ELIGE LA VARIANTE de una muerte, ponderada y determinista.
 *
 *  `cuando(acta)` filtra las elegibles (un ala arrancada la hace el cañon, no una onda expansiva)
 *  y `peso` pondera entre las que quedan. Devuelve `null` si el tipo no declara variantes — y ese
 *  null es la garantia de que esto no rompe nada: sin variantes, se muere exactamente como en D2.
 */
export function elegirVariante(tipo, acta) {
  const vs = (DESPIECE[tipo] || {}).variantes;
  if (!vs || !vs.length) return null;
  if (VAR_SEED) return vs.find(v => v.id === VAR_SEED) || null;
  const ok = vs.filter(v => !v.cuando || v.cuando(acta));
  const elegibles = ok.length ? ok : vs;
  const total = elegibles.reduce((a, v) => a + (v.peso || 1), 0);
  let t = (acta.dado || 0) * total;
  for (const v of elegibles) { t -= (v.peso || 1); if (t <= 0) return v; }
  return elegibles[elegibles.length - 1];
}

/** Los ids de variante de un tipo, en orden. La usa `__romperTodas` para ponerlas en fila. */
export const variantesDe = tipo => ((DESPIECE[tipo] || {}).variantes || []).map(v => v.id);
