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
// LA DISTANCIA ES LA REAL Y SE QUEDA: 29 km de ida y otros 29 de vuelta, contra los 3,4 km de la
// mision mas larga de la campaña. Es decision del autor — "la distancia esta buena que sea la
// real" — y lo que se acorto en su lugar fue el TIEMPO MUERTO, no el mapa. La ida sigue midiendo
// 29 km; lo que cambio es cuanto de ella se va en tramos donde no pasa nada.
//
// LO QUE DURA CADA COSA (a la velocidad real del modelo: 62 m/s trepando al techo de 150 en ~31 s)
//
//     transito   1.450 m ·  19 s   volas alto, hay radio, no hay presion
//     filo       1.450 m ·  10 s   AVISADO por radio, el techo baja en rampa
//     transito   1.740 m ·  12 s   se respira, y tambien se avisa
//     descenso   1.160 m ·   8 s
//     rasante   17.400 m · 116 s   el pasillo, que es donde vive el juego
//     filo       2.030 m ·  14 s   pegado al blanco: mas concentracion
//     blanco     3.770 m ·  25 s   → 29.000 m hasta el buque, ~3:24
//     vuelta    29.000 m · 193 s   la mitad DIFICIL, del mismo largo que la ida
//
// LAS FRACCIONES SON UNA APROXIMACION CALCULADA, no medida: la velocidad real depende de como
// vuele el jugador (la racha rasante acelera hasta un 48%, el viento en altura frena hasta un
// 35%). Los segundos de verdad salen del playtest y estas fracciones se corrigen con lo medido.
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
    // un numero calibrado contra pasillos de medio minuto. Esta mision dura seis.
    //
    // 0.065 sale de una cuenta. Sumando cada fase por su multiplicador de nafta, la IDA son 371
    // "segundos de crucero" y la VUELTA otros 164. A 3.2 x 0.065 = 0.208 %/s eso da:
    //     ida     77% del tanque   → llegas al buque raspando, que es lo que el plan pide
    //     mision  111%             → NO cierra con un tanque: hay que reabastecer una vez
    // O sea que la Chancha deja de ser un lujo y pasa a ser el gozne de la mision, que es
    // exactamente el papel que le da el §3 del plan. Y como la vuelta ahora mide lo mismo que la
    // ida, la decision de CUANDO pedirla es de verdad: gastarla temprano te deja sin red para el
    // regreso, que es la mitad donde te buscan.
    fuelScale: 0.065,
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
  // CADA ETAPA DEL MAPA ESTA MARCADA POR UNA LINEA DE RADIO, y es decision del autor sobre como va
  // a funcionar el juego entero: "que se marquen las etapas del mapa con dialogos, seguramente
  // sera asi todo". Una fase sin `radio` es una fase que el jugador cruza sin enterarse.
  //
  // Y EL REPARTO DE QUIEN HABLA ES LA MECANICA DEL SILENCIO, contada sin un solo cartel:
  //   · hasta el descenso habla PUMA — el escuadron, que va con vos;
  //   · del descenso al blanco habla SOLO CONDOR, que es tierra y no esta en riesgo;
  //   · y en la vuelta PUMA vuelve.
  // El jugador no tiene que entender la regla: la escucha. Ese es el "pase de lista gratis" del
  // §2 del plan, funcionando sin una linea de codigo dedicada.
  //
  // CONDOR AVISA LO QUE VIENE. No te dice donde estas —eso ya lo sabes—: te dice que hay adelante.
  // Por eso los tramos largos estan PARTIDOS en dos o tres fases del mismo tipo: una fase suena
  // una sola vez, asi que un rasante de dos minutos con una linea es un rasante mudo. Partirlo no
  // cambia nada del juego (los dos pedazos resuelven igual) y le da a Condor donde hablar.
  //
  // LA FORMA salio del primer playtest: la version anterior tenia dos filos de veintidos segundos
  // pegados al despegue y tardaba CIEN segundos en llegar al descenso ("no aburre pero es
  // DEMASIADO LARGO", "es dificil tedioso y largo"). Ahora se arranca suelto, el filo se ANUNCIA y
  // dura diez, y el segundo se mudo al final —pegado al blanco— porque el pedido fue textual:
  // "llegando cerca ahi si mas concentracion".
  fases: [
    { tipo: 'transito', hasta: 0.05, radio: 'fase_salida' },
    { tipo: 'filo', hasta: 0.10, radio: 'fase_filo' },
    { tipo: 'transito', hasta: 0.16, radio: 'fase_libre' },
    { tipo: 'descenso', hasta: 0.20, radio: 'fase_descenso' },
    { tipo: 'rasante', hasta: 0.45, radio: 'fase_rasante' },
    { tipo: 'rasante', hasta: 0.80, radio: 'fase_trafico' },
    { tipo: 'filo', hasta: 0.87, radar: 6, radio: 'fase_filo2' },
    { tipo: 'blanco', hasta: 1, radio: 'fase_blanco' },
    // LA VUELTA, EN TRES: vuelven las voces · llegan los cazas · se ve la costa. Es la mitad
    // dificil y la mas larga, y sin partirla tendria una sola linea en tres minutos.
    { tipo: 'vuelta', hasta: 1.35, radio: 'fase_vuelta' },
    { tipo: 'vuelta', hasta: 1.70, radio: 'fase_cazas' },
    { tipo: 'vuelta', hasta: 2.0, radio: 'fase_casa' },
  ],
  // …Y UNA CHARLA EN VUELO, para ver el OTRO formato de dialogo. Los `radio:` son una linea con
  // retrato en la caja chica; una `charla:` es una escena entera de data/story.js corriendo en
  // vuelo (SPEC_CHARLAS_VUELO), con su propia caja y su propio ritmo. Van por TRAMOS y no por
  // fases a proposito: es la demostracion de que los dos items conviven sin pisarse — el tramo
  // solo trae la charla, y todas las densidades siguen saliendo de la fase.
  // M01_GANSOS es contenido de M1 reusado: esta mision es un banco, no tiene guion propio.
  tramos: [
    { hasta: 0.02 },
    { hasta: 0.038, charla: 'M01_GANSOS' },
    { hasta: 1 },
  ],
};

/** Las misiones que NO son la campaña. `game.js` las concatena a `MISSIONS` para resolver una
 *  mision por id o por indice; nada que recorra la campaña las mira. */
export const MISIONES_PRUEBA = [t15];
