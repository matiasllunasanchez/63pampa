// LAS CINEMATICAS, declaradas (docs/sistemas/PLAN_DIRECTOR_CINEMATICAS.md §4).
//
// Una cinematica es una LISTA DE BEATS `{ t, ...verbos }` con `t` en segundos REALES desde que
// arranca. Esto es SOLO data: quien la interpreta es systems/cine.js y quien dibuja el letterbox
// y los fundidos, render/cine.js. Nada de logica aca.
//
// LA REGLA QUE GOBIERNA ESTE ARCHIVO (plan §6.5): **si una escena no se puede escribir aca, falta
// un verbo — se agrega el verbo, no la excepcion.** Una cinematica en codigo es una que nadie mas
// va a poder tocar sin abrir el motor.
//
// LOS VERBOS (todos delegan en sistemas que YA existen — plan §6.4: el director no mueve nada,
// encadena a los que mueven):
//
//   parte: 'suelta'        abre un TRAMO con nombre. Es lo que leen los renders para saber que
//                          estan dibujando, y de el sale el avance 0..1 del tramo.
//   tempo: { a, ramp }     el dt del MUNDO (systems/tempo.js / el escalado de game.js)
//   control: 'ninguno'     cuanta palanca conserva el jugador ('ninguno'|'limitado'|'total')
//   move: 'breakt'         una PIRUETA, volada por systems/moves.js (+ `dir`, `who`)
//   fx: { boom, shake }    core/fx + la sacudida de la corrida
//   sfx: { key, vol, beep }  un efecto de systems/audio.js, con su `beep` de respaldo
//   beep: [f,dur,tipo,vol,slide]   un tono suelto
//   ritmo: 0.7             la velocidad de LA PELICULA (camara lenta de la escena entera)
//   vuelo: { avance }      prende LA CAMA DE VUELO: el avion vuela de verdad debajo de la escena
//   rotulo: 'clave'        una palabra en pantalla, por clave de strings (nunca texto crudo)
//   radio: 'clave'         una linea de radio → SEÑAL (la dice el orquestador, no el director)
//   fade: { a, dur, color, then }  fundido (negro por omision; a blanco es un RESPLANDOR);
//                          `then` encadena (→ SEÑAL `{ scene }`)
//   letterbox: { a, dur }  las bandas negras
//   cam: { modo, off, ramp }   'cabina' | 'chase' (2D); el 3D llega en C2
//   marca: 'sec'           deja una MARCA con su instante, para que un render la lea
//   limpiar: 'popups'      la pantalla arranca limpia
//   fin: true              se termino → SEÑAL 'done'
//
// CADA CINEMATICA ADEMAS SE DECLARA MIRABLE. `titulo`, `desc` y `ver` son lo que la pone en el
// menu CINEMATICAS (la puerta hermana de PRUEBAS): el catalogo NO es una lista aparte, se deriva
// de este archivo. Una timeline nueva aparece sola en el menu — y si no se puede mirar suelta, lo
// que falta es su `ver`, no una entrada en otro lado.
//
// `ver(a)` recibe la MISMA api de verbos que el catalogo de PRUEBAS (`pruebasApi()` en game.js) y
// vale la misma regla de oro: si mirar una cinematica necesita algo nuevo, ese algo NACE COMO
// SONDA —utilizable tambien desde la consola y desde los fixtures— y aca solo se lo llama.
//
// `titulo` y `desc` van ACA y no en data/strings.js, con el mismo criterio que los momentos de
// PRUEBAS y los nombres de campaña: son rotulos de una herramienta de autor, no texto del juego.
//
// LAS LIGADURAS `'$loQueSea'` las resuelve quien arranca la cinematica (core/cine.js `lig`). Es
// como una timeline en data dice lo que solo se sabe jugando: cual pirueta se tecleo, que tan
// grande es el estallido de la zona elegida, cuanto tarda en hundirse este buque. **Un beat cuyo
// `t` queda sin ligar no ocurre** — asi se escribe "esto pasa solo a veces" sin un `if`.
import { PULSO_CINE } from './pulso.js';

// ---------------- LAS PERILLAS DEL PESO (PLAN_CINE_PESO §5) ----------------
// Lo que hace que una cinematica se sienta volada y no dibujada. Los retardos de la camara y la
// relajacion de las actitudes NO estan aca a proposito: son los de systems/vuelo.js, o sea los
// del PASILLO, y esa es toda la gracia — el avion de una cinematica pesa lo mismo que el que
// venias volando porque es la misma cuenta.
export const CINE_VUELO = {
  // cuanto avanza el MUNDO debajo, como fraccion de la velocidad del avion. No es 1 porque una
  // cinematica no es una corrida: es lo justo para que el mar corra y la escena respire. El
  // RELEVO DEL ESCUADRON usa 0.4 desde siempre por la misma razon, y de ahi sale el numero.
  AVANCE: 0.35,
  GAIN: 0.017,        // volumen del motor (el mismo del pasillo)
  // ALTURA de encare antes de una pirueta, y cuanto tarda en tomarla. El SPLIT-S tiene un piso de
  // seguridad (`plane.y < 3` corta la picada) y a ras del agua se volaba MOCHO: la maniobra mas
  // violenta del catalogo terminaba a los 0,78 de sus 1,15 s. Subir un poco y picar es ademas la
  // doctrina real del ataque, asi que el arreglo tecnico y el gesto correcto son el mismo.
  // A RAS DEL AGUA, primero. El ataque real entra pegado al mar —por abajo del radar— y recien
  // ahi SALTA para soltar: «a ras, saltar, soltar y salir». La cinematica arrancaba ya en el salto
  // y el tramo rasante no existia: el avion no se veia nunca cerca del agua, que es donde el modo
  // vive.
  //
  // ES EL TRAMO MAS LARGO DE LA CINEMATICA, y no por capricho. Con 0,4 s existia en la data y no en
  // la pantalla: entre que la altura tarda en asentarse y que el rocio necesita cuadros para
  // acumularse, el rasante duraba menos que su propio arranque. El juego se llama RASANTE — este
  // es el plano que tiene que ganar la escena, no el que la introduce.
  //
  // Y MAS ABAJO: 1,5 m. El rocio de la cama de vuelo cambia de escalon a los 2,8 m, asi que a 2,2
  // se volaba justo del lado flojo — seis motas en vez del manto. Un metro menos es la diferencia
  // entre "vuela bajo" y "va tocando el agua".
  RAS_ALT: 1.5, RAS_T: 1.6,
  // …y cuanto rocio de mas levanta una cinematica respecto del pasillo (systems/vuelo.js `mas`).
  // El pasillo es juego: el agua no puede taparte lo que tenes que esquivar. Un plano rasante es
  // una toma, y ahi el agua saltando ES el tema.
  AGUA: 2.4,
  // EL ROCIO EN PRIMERA PERSONA. Desde afuera el agua es un chorro delante del morro; desde
  // ADENTRO ese chorro lo tapa el tablero y lo que se ve son las dos cortinas pasandote por al lado
  // del canopy. No es un efecto distinto: es el mismo, nacido mas ancho, mas cerca de la camara, y
  // abriendose hacia afuera (ver `ancho`/`cerca`/`abre` en systems/vuelo.js).
  ROCIO_1A: { ancho: 34, cerca: 6.5, abre: 3.1 },
  // LAS LINEAS DE VELOCIDAD, dimensionadas POR PLANO. Es literal el playtest: «está todo
  // manteniendo el mismo radio y distancia que cuando es tercera persona». Y no puede ser el mismo:
  // en tercera el punto de fuga esta lejos y las lineas convergen chiquitas sobre el buque; en
  // CABINA el punto de fuga esta en tu cara y lo que las lineas hacen es PASARTE POR AL LADO —
  // nacen mas afuera, corren mas rapido, son mas largas y se van del cuadro en vez de amontonarse.
  // `bajo` es cuanto se corre el PUNTO DE FUGA hacia abajo respecto del horizonte: desde la cabina
  // el aire no viene del horizonte, viene de donde apunta el morro. Cae cerca del borde de abajo
  // del parabrisas, que es tambien de donde sale la ristra — las dos cosas nacen en el mismo lugar
  // porque las dos van adonde va el avion.
  ESTELA_1A: { r: 1.7, v: 2.4, largo: 3.6, tope: 420, bajo: 58 },
  POSE_ALT: 12, POSE_T: 0.4,
  // LA SALIDA. Un ataque real no termina cuando se suelta: termina cuando saliste. Ningun piloto
  // se quedaba flotando en el lugar mirando hundirse lo que acababa de bombardear — soltaba y se
  // iba a fondo, trepando. Es la doctrina que el juego ya tiene escrita para la PASADA («a ras,
  // saltar, soltar y SALIR») y le faltaba a la cinematica.
  // DOS FRENOS habia que sacar, y el primero era la `pose`: sostiene la altura pedida, asi que con
  // un objetivo alcanzable el avion llegaba y SE QUEDABA. Se pide una altura que NO se alcanza en
  // lo que dura la escena (el avion trepa ~18 por segundo y la salida dura unos cuatro), y de paso
  // se pide con margen: cerca del objetivo la pose afloja sola, asi que un techo "justo" ya frena
  // medio segundo antes de llegar. 160 mantiene la trepada a fondo de punta a punta.
  ESC_ALT: 160, ESC_T: 1.1,
  // …y el segundo freno era el TECHO DEL CARRIL (FLY_TOP, 68): el avion tocaba el vidrio invisible
  // del juego a mitad de la salida, se nivelaba y bajaba la trompa. El techo es una regla del
  // PASILLO —hasta aca llega el carril— y una cinematica no juega en el carril. Se lo levanta
  // hasta donde no exista, y con eso la trompa se queda mirando al cielo hasta el ultimo cuadro.
  TECHO_SAL: 400,
  // …y el buque se queda ABAJO: cae en el cuadro mientras vos trepas, hasta salirse por el borde.
  // Es lo unico que en una camara 2D —que mira siempre para adelante— puede decir "le pasaste por
  // encima". Con 34 solo se despegaba del horizonte y se quedaba ahi; el buque tiene que IRSE del
  // cuadro por abajo, porque eso es lo que hace un blanco al que sobrevolas.
  ESC_DROP: 96,
};

// EL PREMIO DEL PULSO (PLAN_EL_PULSO §3 "La recompensa"), primera timeline del director y su
// prueba de fuego: antes vivia como una maquina de estados adentro de systems/pulso.js.
//
// Los instantes se derivan de las duraciones de cada compas (PULSO_CINE) en vez de estar escritos
// a mano: si mañana la suelta dura mas, todo lo que viene despues se corre solo.
// Los instantes ya NO se miden desde el arranque sino DESDE QUE TERMINA LA PIRUETA (`$tPir`, que
// liga el sistema: el encare mas la duracion real de LA maniobra que se tecleo). Un BREAK TURN dura
// 0,7 s y un SPLIT-S 1,15: con un compas fijo, el corto dejaba medio segundo de avion nivelado sin
// nada que pase. Asi la escalera entera se corre sola.
// EL RITMO DEL PREMIO. La cinematica entera corre en camara lenta suave: no es un efecto, es
// respiracion — a velocidad de juego los cuatro compases se atropellaban y no daba tiempo a MIRAR
// nada. El mismo numero gobierna la pelicula (`ritmo`) y el mundo detras del vidrio (`tempo`):
// escritos por separado se desincronizarian en cuanto alguien tocara uno solo.
const RITMO = 0.7;

// EL DESTELLO FINAL: cuanto tarda el blanco en comerse la pantalla. Corto, porque es un
// resplandor y no un fundido — con medio segundo todavia se leia como que la pantalla se lavaba.
// Un golpe de luz es un GOLPE: entra antes de que te des cuenta.
const DESTELLO = 0.28;

const D_SUELTA = PULSO_CINE.SUELTA;
const D_IMPACTO = D_SUELTA + PULSO_CINE.IMPACTO;

export const CINES = {
  pulso_premio: {
    id: 'pulso_premio',
    titulo: 'EL PREMIO DEL PULSO',
    desc: 'La pirueta tecleada, la suelta y el buque muriendo  ·  HMS SHEFFIELD',
    // se entra a la prueba y se la GANA por sonda: mirar el premio no puede depender de que el
    // que mira sepa teclear la secuencia a tiempo (el margen es de decimas).
    //
    // SIN ESPERA, y no es un descuido: `a.pulso()` deja la prueba armada en el mismo instante, y
    // `a.luego()` cuenta con el reloj DEL MUNDO — que adentro del PULSO corre al 8%, asi que medio
    // segundo de timeline eran seis de reloj de pared. Lo que hace de tiempo de asentado es el
    // primer compas de la cinematica, que es la pirueta y dura mas de un segundo.
    ver: a => { a.pulso('m3'); a.sonda('qgana', 'deposit'); },
    // el reloj es de PARED: la cinematica del premio corre en tiempo real aunque el mundo venga
    // dilatado al 8% — de hecho lo primero que hace es devolverlo a 1 (ver el `tempo` de abajo)
    beats: [
      // ---- LA PIRUETA. Se suelta el tiempo dilatado (la concentracion se termino con la suelta),
      // baja la cabina para abrirle cielo al buque, y el avion vuela LA maniobra que se tecleo.
      { t: 0, parte: 'pirueta', limpiar: 'popups', control: 'ninguno', ritmo: RITMO },
      // EL AVION VUELA. Sin esta linea `moves.js` escribia velocidades que nadie integraba: la
      // pirueta giraba en el lugar sobre un mar quieto y con la camara clavada (PLAN_CINE_PESO §0).
      { t: 0, vuelo: true },
      // EL DESHIELO, con curva: el mundo no vuelve a correr de golpe ni arranca de golpe — sale
      // del tiempo dilatado como sale de una inspiracion. Lineal, el instante en que empieza y el
      // instante en que para se notaban los dos.
      { t: 0, tempo: { a: RITMO, ramp: PULSO_CINE.DESHIELO, ease: 'suave' } },
      // LA CAMARA, en dos planos. La PIRUETA va en TERCERA: la recompensa de la regla 1 es VER
      // salir la maniobra que se tecleo, y desde la cabina eso no se ve — se lee como un horizonte
      // que gira, y solo si el jugador no tiene el horizonte en FIJO. El `off` de la cabina se
      // rampea igual desde ahora, para que cuando entre ya este abajo.
      // ---- LA CAMARA: UN SOLO PLANO, la cabina, de punta a punta. Estuvo cortando a tercera para
      // el salto («la recompensa de la regla 1 es VER salir la maniobra, y desde la cabina eso no
      // se ve») y el playtest dijo lo contrario: la pirueta se siente MEJOR en primera. Y tiene
      // sentido — desde adentro la maniobra no la mirás, la sufrís, que es lo que la prueba te
      // acaba de hacer teclear. Sin corte, ademas, el premio es literalmente la continuacion de la
      // prueba: la misma cabina, el mismo vidrio, el mismo ojo.
      //
      // LO QUE CUESTA: con el horizonte en FIJO (opciones) el mundo no se inclina y la maniobra no
      // tiene con que mostrarse. Se respeta igual — FIJO lo elige quien se marea, y una cinematica
      // no es lugar para pasarle por encima a eso.
      { t: 0, cam: { modo: 'cabina', off: PULSO_CINE.CABINA, ramp: 1.2, ease: 'sale' } },
      // A RAS: el tramo pegado al agua, con su rocio y su estela. Es el encare de verdad.
      { t: 0, pose: { alt: CINE_VUELO.RAS_ALT, ramp: 0.25 } },
      // …y EL SALTO: recien ahora sube, que es lo que le da aire a la maniobra para completarse
      // (el SPLIT-S tiene piso de seguridad) y es, de paso, como se atacaba de verdad.
      { t: CINE_VUELO.RAS_T, pose: { alt: CINE_VUELO.POSE_ALT, ramp: CINE_VUELO.POSE_T } },
      { t: CINE_VUELO.RAS_T + CINE_VUELO.POSE_T, move: '$pirueta', dir: '$piruetaDir', who: 'player' },
      { t: 0, fx: { boom: 0.18 } },
      // …y si el Pichon todavia no enseño ninguna pirueta (la primera mision), el premio es LA
      // SUELTA y se rotula. Solo entonces se liga `$tSinPirueta`: el beat existe siempre y ocurre
      // nada mas cuando corresponde — misma idea que el segundo estallido, sin un `if`.
      { t: '$tSinPirueta', rotulo: 'pulso_soltar' },
      // ---- LA SUELTA: el unico tramo en que no pasa nada mas. El silencio es la suelta.
      // ---- LA SALIDA, en el mismo instante que la suelta: gas a fondo y trepada. El avion se VA;
      // lo que sigue —el impacto y la muerte del buque— pasa mientras te alejas, que es como pasa
      // de verdad. Antes el avion se quedaba clavado esperando que el barco se hundiera.
      { t: ['$tPir'], pose: { alt: CINE_VUELO.ESC_ALT, ramp: CINE_VUELO.ESC_T } },
      { t: ['$tPir'], vuelo: { avance: 1, boost: true, estelas: true, techo: CINE_VUELO.TECHO_SAL } },
      { t: ['$tPir'], parte: 'suelta', sfx: { key: 'waveFly', vol: 0.5 },
        beep: [300, 0.09, 'triangle', 0.05, -120] },
      // ---- EL IMPACTO en la zona elegida: el tamaño lo trae la zona y la clase del buque
      { t: ['$tPir', D_SUELTA], parte: 'impacto', fx: { boom: '$boom', shake: '$shake' },
        sfx: { key: 'exHeavy', beep: [70, 0.3, 'sawtooth', 0.07, 38] } },
      // ---- LA MUERTE: el buque ardiendo y yendose. La curva la dibuja quien es dueño del buque;
      // aca solo se dice CUANDO empieza y cuanto dura (el `fin` de abajo, que la clase estira).
      { t: ['$tPir', D_IMPACTO], parte: 'muerte' },
      // ---- EL SEGUNDO ESTALLIDO: la santabarbara. Solo la zona brava liga `$tSec`; en las otras
      // este beat no ocurre — no hay un `if` en ningun lado, simplemente no se agenda.
      { t: ['$tPir', D_IMPACTO, '$secOff'], marca: 'sec', fx: { boom: '$boomSec', shake: 9 },
        sfx: { key: 'exHeavy', beep: [52, 0.5, 'sawtooth', 0.08, 26] } },
      // ---- EL RESPLANDOR que cierra. La escena no puede terminar en un corte a seco mientras
      // seguis trepando: un corte ahi se lee como que el juego se colgo. Se cierra a BLANCO —no a
      // negro— porque lo que estas haciendo es alejarte de algo que arde, y el blanco es la unica
      // forma de que el ultimo cuadro sea la explosion y no la ausencia de imagen. Arranca justo
      // lo que dura el destello antes del `fin`, asi que la timeline sigue midiendo lo mismo.
      { t: ['$tPir', D_IMPACTO, '$muerteDur', -DESTELLO],
        fade: { a: 1, dur: DESTELLO, ease: 'entra', color: '#f4fbff' } },
      { t: ['$tPir', D_IMPACTO, '$muerteDur'], fin: true },
    ],
  },
};

/** EL CATALOGO: las cinematicas mirables, en el orden en que estan escritas. Lo lee el menu
 *  CINEMATICAS. Se deriva de CINES a proposito — una timeline nueva se ve en el menu sin tocar
 *  nada mas, y ninguna lista puede quedar desincronizada de la otra porque hay una sola. */
export const cinematicas = () => Object.values(CINES).filter(c => c.titulo);

/** Cuanto va del premio, desde que termina la pirueta, hasta que el buque empieza a morirse.
 *  Lo necesita quien mide el crecimiento del buque (systems/pulso.js): el zoom llega a pleno justo
 *  cuando arranca la agonia. Se exporta para que ese numero no este copiado a mano — es el mismo
 *  dato, leido de la misma timeline. */
export const PULSO_D_MUERTE = D_IMPACTO;
