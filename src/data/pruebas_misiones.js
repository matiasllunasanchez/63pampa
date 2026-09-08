// MISIONES DEL BANCO DE PRUEBAS — las que existen para MEDIR algo, no para contar nada.
// docs/sistemas/PLAN_MISION_CINCO_FASES.md §5 y §11.
//
// POR QUE UN ARCHIVO APARTE Y NO UNA ENTRADA EN missions.js. Porque `MISSIONS` no es una lista de
// niveles: es LA CAMPAÑA. Su largo decide cuando termina el juego, su orden es el orden del guion,
// y `SHIP_MISSIONS` la usa de pool para el CICLO DE MUERTE. Meter aca adentro una misión de
// laboratorio la haria aparecer sorteada a mitad de una partida de verdad, y correria el final de
// la campaña un renglon. Separadas, `game.js` las concatena para RESOLVER una mision por id o por
// indice, y todo lo que recorre la campaña —el encadenado, el guardado, el selector, el ciclo—
// sigue mirando `MISSIONS` sola y no se entera de que estas existen.
//
// QUE NO LLEVAN: `story`, `brief`, `epi`, `roster` ni fecha. No hay nada que leer antes ni despues
// — el recuento es su final (ver la guarda del epilogo en game.js). Son herramientas de autor.
import { CAMPAIGN_CFG } from './missions.js';

// EL CFG SALE DE `CAMPAIGN_CFG` Y NO DE UNA COPIA A MANO, y es la unica forma de escribirlo: el
// cfg es un `Object.assign` sobre un objeto compartido, asi que una clave que falte no queda en su
// default — queda PEGADA de la mision anterior. `CAMPAIGN_CFG` es `C({})`, o sea el juego de
// perillas completo; extenderlo con `...` garantiza que estan todas sin repetir ninguna.
const P = over => ({ ...CAMPAIGN_CFG, ...over });

// ---------------------------------------------------------------------------------------------
// t15 · IDA Y VUELTA — el banco de la estructura de cinco fases.
//
// LA DISTANCIA ES ENORME A PROPOSITO: 29 km contra los 3,4 km de la mision mas larga de la
// campaña. No es un numero inflado, es la traduccion de los segundos del plan §5 a metros con el
// modelo de velocidad real (`speedTarget`: 62 m/s que trepan al techo de 150 en ~31 s):
//
//     transito 25 s ·  2.425 m   (el tramo lento: el avion todavia esta acelerando)
//     filo     20 s ·  2.940 m
//     transito 15 s ·  2.250 m
//     filo     20 s ·  3.000 m
//     descenso 20 s ·  3.000 m
//     rasante  90 s · 13.500 m
//     blanco   15 s ·  2.250 m   → 29.000 m hasta el buque
//     vuelta  120 s · 18.000 m   → hasta 1.62 del objetivo
//
// Total ~5:45 con el climax. Las fracciones de abajo son esas distancias acumuladas sobre 29.000.
// SON UNA PRIMERA APROXIMACION: la velocidad real depende de como vuele el jugador (la racha
// rasante acelera hasta un 48%, el viento en altura frena hasta un 35%), asi que los segundos de
// verdad se miden en el playtest y estas fracciones se corrigen con lo medido.
//
// RESPIRAR Y APRETAR (§11.2): el transito no es un bloque, es DOS, con un filo entre medio y otro
// despues. Esa alternancia es la mitad del experimento — un tramo tranquilo sin nada que lo
// interrumpa contesta la pregunta 1 del plan ("¿aburre o se siente como respirar?") con un si.
const t15 = {
  id: 't15', name: 'IDA Y VUELTA',
  // HMS SHEFFIELD por dos motivos y ninguno es historico: es clase `t42`, que es el layout de
  // zonas POR DEFECTO (el fallback de `setLayout`), asi que lo que se mida aca vale para la
  // mayoria de las misiones; y es el buque que la fila de LA PASADA ya usa en este mismo
  // catalogo, o sea que la convencion de "buque generico de prueba" ya estaba tomada.
  goal: { kind: 'ship', ship: 'HMS SHEFFIELD', dist: 29000 },
  // SIN `climax`: cae en el default de la campaña ('pasada'), que hoy esta en cuarentena y juega
  // EL PULSO de suplente. Es exactamente lo que pide el plan ("el climax que ya existe"), y se
  // consigue no escribiendo nada — que es la prueba de que el climax sigue siendo DATO.
  cfg: P({
    // EL COMBUSTIBLE PRENDIDO es la unica perilla que esta mision REALMENTE necesita: el §5 pide
    // la nafta "mostrada todo el tiempo", y sin esto el poder de la Chancha ni siquiera existe
    // (su gate es `cfg.fuelOn`) — o sea que el transito se quedaria sin su unica exigencia.
    fuelOn: true,
    // …Y EL RELOJ CORRIENDO A LA ESCALA DE ESTA MISION. Sin esto t15 es INVOLABLE, y no por
    // dificultad: el tanque son 100 unidades a 3.2 %/s, o sea TREINTA Y UN SEGUNDOS de vuelo —
    // un numero calibrado contra pasillos de medio minuto. Esta mision dura cinco.
    //
    // 0.08 sale de una cuenta y no de probar numeros. Sumando cada fase por su multiplicador, la
    // IDA son 326 "segundos de crucero" (25x1 + 20x2 + 15x1 + 20x2 + 20x1.3 + 90x2) y la VUELTA
    // otros 102 (120x0.85). A 3.2 x 0.08 = 0.256 %/s eso da:
    //     ida     83% del tanque   → llegas al buque raspando, que es lo que el plan pide
    //     mision  109%             → NO cierra con un tanque: hay que reabastecer una vez
    // O sea que la Chancha deja de ser un lujo y pasa a ser el gozne de la mision, que es
    // exactamente el papel que le da el §3 del plan.
    fuelScale: 0.08,
  }),
  // …Y POR ESO LA CHANCHA TIENE QUE PODER PEDIRSE EN EL TRANSITO. `CH_MIN_T` son 240 s, un numero
  // pensado contra misiones cuyo pasillo dura medio minuto: ahi la espera dice "esto es un recurso
  // de mision larga". Aca la espera dejaria el poder afuera de TODA la ida — justo del tramo donde
  // el plan lo pone ("La Chancha vive aca", §2 fase 1) y donde decide si llegas con una bomba o con
  // tres. 45 s es despues del despegue y del primer respiro, no antes.
  chanchaMinT: 45,
  // PAR PROVISORIO. Los pares de campaña van de 5.000 a 14.000 sobre misiones de 3 km; esta mide
  // diez veces mas y ademas cobra la vuelta entera, asi que el puntaje va a ser otro orden. 20.000
  // es una apuesta para que las estrellas no salgan las cuatro de arriba en el primer vuelo: es
  // de lo primero que hay que corregir con un numero medido.
  par: 20000,
  fases: [
    { tipo: 'transito', hasta: 0.08 },
    { tipo: 'filo', hasta: 0.19 },
    { tipo: 'transito', hasta: 0.26 },
    // EL SEGUNDO FILO APRIETA MAS QUE EL PRIMERO, y es lo unico que esta mision declara a mano:
    // el primero enseña la banda, el segundo la cobra. Sin esta diferencia el tramo no tiene
    // curva de aprendizaje — son dos veces la misma prueba.
    { tipo: 'filo', hasta: 0.37, radar: 4.5 },
    { tipo: 'descenso', hasta: 0.47 },
    { tipo: 'rasante', hasta: 0.93 },
    { tipo: 'blanco', hasta: 1 },
    { tipo: 'vuelta', hasta: 1.62 },
  ],
};

/** Las misiones que NO son la campaña. `game.js` las concatena a `MISSIONS` para resolver una
 *  mision por id o por indice; nada que recorra la campaña las mira. */
export const MISIONES_PRUEBA = [t15];
