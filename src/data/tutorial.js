// EL TUTORIAL — la fila de arriba de todo del menu de modos (docs/sistemas/PLAN_TUTORIAL.md).
//
// Tres ETAPAS, cada una una salida que se vuela como las del LIBRO DE VUELO (game.js las lleva con el
// mismo `libro`, marcado `tut`): semilla fija, Esteban solo en el A-4B, sin contexto ni "lo que pasó" —
// al terminar se vuelve al menu del tutorial con la etapa tildada.
//
// LOS PASOS (fase 2 del plan). Cada etapa es una lista de `pasos`, que corre systems/tutorial.js:
//   dice     escena de TUT_SCENES (abajo): sus lineas se dicen UNA POR UNA con el mundo congelado
//            (la pausa de las lecciones de M1: velo, foco y teclas). Maximo tres por paso.
//   foco     zonas del HUD que quedan sin velo mientras se dicen (render/hud.js `zonaHud`)
//   teclas   filas de la tabla de CONTROLES (`ctrl<Nombre>`) que se muestran debajo
//   sigue    lo que el jugador tiene que HACER despues, en orden; cada una con su `consigna` (el
//            cartelito de arriba). Sin `sigue`, el paso es solo lo que se dice.
//              despega: true terminar la carrera y quedar en el aire (el despegue jugable)
//              altSobre: m   pasar por arriba de esa altura
//              altBajo: m    bajar de esa altura
//              bajoTecho: s  tantos segundos abajo del techo del radar sin rozar el agua (rozar los
//                            vuelve a cero)
//              usa: [...]    tocar todos esos mandos (campos de `inp`, core/input.js), en cualquier orden
//              pasa: n       que te pasen al costado n obstaculos
//              rompe: n      romper n blancos de practica (los de `blancos`)
//              calienta: true trabar el cañon de tanto tirar, y esperar a que se enfrie
//              maniobra: id  hacer esa pirueta entera (data/moves.js; el tonel es 'tonel')
//              suelta / hunde  soltar una bomba / pegarle al buque (la etapa 3)
//              tren / aterriza  bajar el tren / tocar la pista (la aproximacion final)
//              cierra: true  cerrar la pausa guiada (ver `abre`)
//   cuando   el MOMENTO del paso: su intro espera { faltan: f } (falta menos de esa FRACCION del camino al
//            buque: en fraccion y no en metros porque los fixtures acortan las distancias), { vuelta }
//            (despues de pegarle, ya volviendo) o { aterrizando } (la aproximacion final)
//   abre     una pestaña de CONTROLES (data/controles.js): el juego abre la pausa sola ahi al practicar
//   remate   escena de una linea que se dice por radio, sin pausa, al cumplir
//   obstacles  la densidad de olas y pajaros durante la practica (0 si no dice: cielo limpio)
//   blancos  { tipo, n, mueve, paso }: blancos de PRACTICA que game.js siembra al empezar la practica, con
//            un anillo encima (systems/spawn.js `sembrarPractica`). Globos quietos o paseados por el viento
//            (`mueve`), o un Harrier que viene derecho y desarmado. Si no queda ninguno adelante, vuelven.
//
// LA PROSA ES BORRADOR: espera el OK del autor. El tono sale del canon (docs/historia/GUION_3.md): el
// Turco es el mecanico jefe, tucumano y seco; el Pichon, el pibe que se leyo el manual. El Pichon explica
// lo de piloto y el Turco lo de la maquina y los mandos. NINGUNO NOMBRA UNA TECLA: las pone el juego.
// (las 7 letras de RASANTE = CONC_MIN de core/aguante.js: data no importa de core, asi que va el numero; si cambia
// alla, cambia aca)
const CONC_MIN = 7;
const CARGA_PERF = 4;   // = AGU.CARGA (core/aguante.js): los segundos de PERFECTO (va como numero por el lint de capas)
import { CAMPAIGN_CFG } from './missions.js';

// sin nafta, sin globos, sin cazas, sin bombas y SIN RADAR (subir arriba del techo es un ejercicio, no
// tiene que traer a nadie), Esteban solo
// …y SIEMPRE DESDE LA PISTA (18/11): ARRANQUE, ACANTILADO y el largo de la costa son preferencias de OPCIONES que
// la mision no pisaba, y con ARRANQUE en "en vuelo" la etapa 1 empezaba en el aire, sin la carrera del despegue.
const P = over => ({ ...CAMPAIGN_CFG, fuelOn: false, globos: false, caza: 0, bombs: 0, squad: 1, radar: 'off', obstacles: 0,
  start: 'runway', cliff: false, coast: 230,
  // SIN PODERES (18/11, el autor: "en la etapa 1 active RASANTE y no se entendio que era"): ni RASANTE ni MOMENTUM
  poderes: false, ...over });

const MAR = ['ola', 'birds'];

// UNA SOLA FASE, SIN DENSIDAD: la siembra la manda cada paso (`obstacles`, que game.js escribe en cfg).
const FASES = [{ tipo: 'rasante', hasta: 1, solo: MAR, bombs: 0, bidones: false }];

// TERO SOLO EN EL A-4B (autor, 17/11; era Esteban hasta el 18/11). `squad: 1`: sin escuadrilla, sin relevo.
const AVION = [{ chapa: 'TERO', plane: 'sky', carga: 'tanques', cargaTxt: '', squad: 1 }];

// EL OBJETIVO NO CIERRA LA ETAPA: la cierran los pasos. Por eso es lejisimo — nunca se llega volando.
const LEJOS = { kind: 'distance', meters: 400000 };

const base = {
  // (la hora es inventada — 21/11, el autor: "inventemos una hora": temprano, con el sol bajo del amanecer)
  despegue: { desde: 'BASE AÉREA MILITAR RÍO GALLEGOS', rumbo: 'vuelo de instrucción', hora: '07:40' },
  chancha: false, par: 3000, aviones: AVION, escuadrilla: '', goal: LEJOS, fases: FASES,
  // (26/11: eso lo dijo en LAS ISLAS — solo la etapa 4 (`islas`) mata; las otras tienen vida infinita, game.js onDeath)
  // (25/11, el autor: "en tutorial debe poder morir. Muero y reinicio completamente el tutorial. Acabo de chocar y no
  // muero pero se trabo"): ya no lleva `sinMuerte` —el avion que no se caia quedaba metido en el cerro o el buque,
  // golpeando cuadro tras cuadro—. Chocar revienta y sale REINTENTAR; SI vuelve a empezar la etapa de cero (game.js
  // onDeath / reintentarLibro).
  avisos: { agua: 'AV_TUT_AGUA', choque: 'AV_TUT_CHOQUE', piso: 'AV_TUT_PISO', pista: 'AV_TUT_PISTA', bl_errado: 'AV_TUT_ERRO', bl_larga: 'AV_TUT_ERRO', cada: 5 },
};

const ETAPA1 = [
  { dice: 'TUT1_HOLA' },
  // EL MANDO DIBUJADO (21/11, el autor: "antes de arrancar, mostrar el joystick para indicar cual es todo. O teclado"):
  // la lamina de render/mando.js encima del velo mientras se dice (`mando`), con el joystick o el teclado segun haya uno
  { dice: 'TUT1_MANDO', mando: true },
  // EL DESPEGUE (fase 3): en la cabecera, la carrera con el gas (core/despegue.js)
  { dice: 'TUT1_DESPEGUE', foco: ['gas', 'vel'], teclas: ['Gas'],
    sigue: [{ despega: true, consigna: 'tutC_despega' }], remate: 'TUT1_DESPEGUE_OK' },
  // (21/11, el autor: "el tutorial nunca me explica como despegar" y "Pichon dice hola despues de que ya hablo y
  // despegue, se desordeno todo"): el saludo iba por radio ANTES del despegue con el mundo corriendo, y uno ya habia
  // despegado cuando llegaba la explicacion. Ahora el juego ARRANCA EN PAUSA: los dos saludan, y enseguida el despegue
  // (26/11, el autor: "El avión planea, en esta indicacion dice gas pero en realidad no usa gas… ya arrancamos con la
  // explicacion del gas"): en SUAVE soltar NO deja el avion quieto —planea y baja—, asi que "Soltá y se queda" mentia.
  // Con SUAVE, despues del despegue va directo el SOSTEN; el "Arriba subís…" queda solo para NORMAL y ESTABLE
  // EL SOSTEN (23/11): solo si se juega en GAS MODO SUAVE (`vert`: el paso se saltea con los otros modos)
  { dice: 'TUT1_SOSTEN', vert: ['planeo', 'planeo_m'], foco: ['gas'], teclas: ['Mant'],
    sigue: [{ usa: ['mant'], consigna: 'tutC_sosten' }], remate: 'TUT1_SOSTEN_OK' },
  { dice: 'TUT1_GAS', vert: ['gas', 'fija'], foco: ['gas', 'alt'], teclas: ['Gas'],
    sigue: [{ altSobre: 30, consigna: 'tutC_subi' }], remate: 'TUT1_GAS_OK' },
  // (27/11, el autor: "el rolar puede estar MUCHO ANTES, al inicio casi del tutorial, en los primeros movimientos")
  { dice: 'TUT1_ROLAR', foco: ['horizonte'], teclas: ['Roll'],
    sigue: [{ usa: ['rollL', 'rollR'], consigna: 'tutC_rolar' }], remate: 'TUT1_ROLAR_OK' },
  // (27/11, el autor: "poscombustion lo mismo, ademas se va a usar para subir a las nubes")
  { dice: 'TUT1_TURBO', foco: ['vel'], teclas: ['Boost'],
    sigue: [{ usa: ['turbo'], consigna: 'tutC_turbo' }], remate: 'TUT1_TURBO_OK' },
  // (27/11, el autor: "poder rasante y tablero al final"): la pausa guiada sube a los primeros movimientos
  // LA PAUSA GUIADA: el juego abre la pausa en CONTROLES, y para seguir hay que cerrarla
  { dice: 'TUT1_PAUSA', teclas: ['Pause'], abre: 'movilidad',
    sigue: [{ cierra: true, consigna: 'tutC_pausa' }], remate: 'TUT1_PAUSA_OK' },
  { dice: 'TUT1_PICADA', foco: ['alt'], teclas: ['Dive'],
    sigue: [{ altBajo: 12, consigna: 'tutC_baja' }], remate: 'TUT1_PICADA_OK' },
  // (SIN RADAR en la etapa 1, 18/11: el autor, "el tutorial no tiene que mostrar todo el potencial del juego". El
  // paso es volar bajito sin tocar el agua; el techo del radar se aprende en la campaña)
  // (23/11, el autor: "el tutorial debe explicar que es rasante: 'vola a 5 metros del agua por 8 segundos' y luego que
  // aclaren ESO SE LLAMA VUELO RASANTE"): la consigna dice la altura concreta (`techo`: 5 m, no el del radar) y el
  // remate le pone el nombre
  // (26/11, el autor: "La parte de las olas podemos ponerlas antes, en la parte de vuelo rasante mientras mantengo"):
  // las olas ya vienen mientras se sostiene el rasante, y el paso de las olas va pegado detras
  // (27/11, el autor: "llenalo vos entre las olas PRE rasante y DURANTE rasante"): la sal se va juntando sola, apurada
  { dice: 'TUT1_RASANTE', foco: ['alt'], teclas: ['Gas'], obstacles: 0.9, salRapido: 6,
    sigue: [{ bajoTecho: 8, techo: 5, consigna: 'tutC_rasante' }], remate: 'TUT1_RASANTE_OK' },
  // LA SAL EN EL PARABRISAS (19/11, el autor: "explicar la mecanica del vidrio empañado con sal, y que para mejorarlo
  // tiene que subir un poco"; despues, "que la limpie la nube"): el paso arranca con el vidrio salado (`sal`) y se lava
  // adentro de la nube (systems/salitre.js)
  // (22/11, el autor: "el salitre no debe aparecer magicamente, el tutorial te debe obligar a bajar primero, mantenerte
  // abajo, y luego llenarte de sal, tal cual el juego"): primero se JUNTA volando al ras (la misma cuenta de
  // systems/salitre.js, solo que `salRapido` la apura para no esperar minutos), y recien despues se lava en la nube
  // (26/11, el autor: "Luego de pasar las olas rasante que pase 3 olas cerca y que se llene el vidrio de salitre, y ahi
  // el turco en vez de decirte que vueles un rato te dice para, mira el vidrio, se te lleno de salitre"): va pegado a
  // las olas y SIN charla antes —se sigue volando al ras con olas—; el aviso del Turco abre el paso siguiente
  // (27/11, el autor: "la parte de VIENEN OLAS no hace falta… una vez finalizado el poder rasante, llename la pantalla
  // de salitre"): sin el paso de las olas; apenas se apaga el poder (`cuando.rasanteFin`) el vidrio se llena de golpe
  // (27/11, el autor: "el salitre debe venir antes del poder rasante, porque ya me llene de salitre"): va pegado al vuelo
  // rasante con olas —ahi se junto— y el poder viene despues de lavar el vidrio
  { dice: 'TUT1_SAL_JUNTA', sal: 0.7,
    sigue: [{ salSobre: 0.4, consigna: 'tutC_salJunta' }] },
  { dice: 'TUT1_SAL', foco: ['alt'], teclas: ['Gas', 'Boost'],
    sigue: [{ salBajo: 0.05, consigna: 'tutC_sal' }], remate: 'TUT1_SAL_OK' },
  // (26/11, el autor: "la parte de la mecanica de rasante no se entiende y quiza deberia ser explicada en la etapa 1
  // cuando se vuela rasante"): vino de la etapa 2, pegado al vuelo rasante; sin el esquive con globos de despues
  // LOS PODERES (18/11, el autor: "falta explicar rasante, falta explicar momentum"): el RASANTE se muestra
  // prendiendolo (aparece solo, por la racha de vuelo bajo) y el MOMENTUM se usa, con la barra ya llena
  // (19/11, el autor: "me carga el poder de una, eso no sirve; tiene que enseñarme como funciona: como pegarle, que es
  // la barrita, cuando aparece, como mantenerla" y "mientras va rasante tiene que haber obstaculos para esquivar"):
  // se gana de verdad, en cuatro pasos — PERFECTO 4 s, la barrita (acertar el azul), soltarlo, y esquivar con el poder
  // (todo se explica ANTES de bajar: con el estado abierto, cada linea congelaba el juego y lo cortaba. Despues, las
  // tres consignas seguidas: entrar, acertar el azul, soltarlo)
  // (`demo`: la barrita dibujada en grande mientras se explica — 21/11, el autor: "que MUESTREN la barrita")
  { dice: 'TUT2_RASANTE', foco: ['alt'], teclas: ['Gas', 'Dive'], poderes: true, demo: 'rasante',
    sigue: [{ aguante: true, consigna: 'tutC_perfecto' }, { aciertos: CONC_MIN, consigna: 'tutC_aciertos' },
      { rasante: true, consigna: 'tutC_soltaRas' }], remate: 'TUT2_RASANTE_OK' },
  // (27/11, el autor: "dice volá rasante para derretir el hielo pero nunca se congeló nada, así que ni lo pongamos en el
  // tutorial"): sin el paso del HIELO — las escenas TUT1_HIELO quedan sin usar
  { dice: 'TUT1_TABLERO', foco: ['vel', 'horizonte', 'alt', 'gas'] },
  // (27/11, el autor: "esquivar olas o pajaros y deslizarte para los lados ya es al pedo: el jugador ya se deslizo, es
  // instinto"): sin el paso de ESQUIVAR — las escenas TUT1_ESQUIVAR quedan sin usar
  { dice: 'TUT1_FIN', foco: ['ruta'] },   // (27/11: sin el remate TUT1_FIN_OK — el Turco lo dice todo junto)
  // LA PRACTICA LIBRE (21/11, el autor: "etapa 1: decision del usuario de terminar el nivel, para darle tiempo a que
  // juegue o siga probando"): las olas siguen y se vuela lo que se quiera; se termina desde la PAUSA (TERMINAR ETAPA)
  { dice: 'TUT1_LIBRE', teclas: ['Pause'], libre: true, obstacles: 0.9,
    sigue: [{ termina: true, consigna: 'tutC_libre' }] },
];

// LA ETAPA 2 (fase 4): el cañon, sobre el mar (la costa trae el desembarco, con soldados: no es para una practica). El A-4B no lleva misiles aire-aire y la media vuelta es del
// 3D, asi que no entran (el plan los nombraba): cañon, calor, blancos que se mueven y un Harrier de practica.
const ETAPA2 = [
  { dice: 'TUT2_HOLA' },
  // (25/11, el autor: "dice rompe los globos y te permite esquivarlos con el stick izquierdo, eso no va… solo A"): solo el cañon
  // (26/11, el autor: "lo del viento es al pedo una seccion adicional… quitarlo"): UN solo tramo de globos —los 10 en
  // grupos de a 3, quietos, en tu linea; rotos o esquivados cuentan igual— y el CALOR adentro, por radio, si se traba
  { dice: 'TUT2_CANON', foco: ['canon'], teclas: ['Gun', 'Fly'], alTrabar: 'TUT2_CALOR',
    blancos: { tipo: 'balloon', tandas: [3, 3, 3, 3], linea: true, y: 'avion', mueve: true, paso: 70, entre: 300 },
    sigue: [{ despeja: 10, consigna: 'tutC_despeja' }], remate: 'TUT2_CANON_OK' },
  // HARRIERS DE VERDAD (21/11, el autor: "el Harrier de practica no, poner Harriers"): tejen, te buscan el carril y
  // alguno puede venir armado (systems/spawn.js `sembrarPractica` con `real`)
  { dice: 'TUT2_HARRIER', teclas: ['Gun', 'Fly'], blancos: { tipo: 'jet', n: 2, real: true, paso: 70 },
    sigue: [{ rompe: 2, consigna: 'tutC_harrier' }], remate: 'TUT2_HARRIER_OK' },
  // EL TONEL, ACA (21/11, el autor: "¿por que metemos el tonel en la etapa 3?"): estaba en la vuelta de la etapa 3
  // para llenar el tramo vacio. Su lugar es donde hay algo que esquivar: Harriers ARMADOS, y el tonel con el
  // Sidewinder cerca hace que se pase de largo (core/aim9.js)
  { dice: 'TUT2_TONEL', teclas: ['Tonel'], blancos: { tipo: 'jet', n: 2, real: true, armado: true, paso: 80 },
    sigue: [{ maniobra: 'tonel', consigna: 'tutC_tonel' }], remate: 'TUT2_TONEL_OK' },
  // EL MISIL, DE LAS DOS FORMAS (23/11, el autor: "el tutorial debe explicarme como esquivar un misil de frente con
  // piruetas, o desde atras; tiene que tener ambas cosas"): un Sidewinder de PRACTICA por vez (`misil`, game.js
  // tirarMisilPractica) — si te pega no te mata, revienta al lado y sale otro. DE FRENTE se esquiva corriendose o con
  // una pirueta cuando esta encima; DE ATRAS solo lo pierde una pirueta en la zona (el grito avisa cuando)
  { dice: 'TUT2_MISIL_FRENTE', teclas: ['Fly', 'Tonel'], misil: 'frente',
    sigue: [{ misil: 'frente', n: 1, consigna: 'tutC_misFrente' }]   /* (26/11, el autor: "con un esquive es suficiente") */, remate: 'TUT2_MISIL_FRENTE_OK' },
  { dice: 'TUT2_MISIL_COLA', teclas: ['Tonel'], misil: 'cola',
    sigue: [{ misil: 'cola', consigna: 'tutC_misCola' }], remate: 'TUT2_MISIL_COLA_OK' },
  // LAS CHAFITAS (21/11, el autor: "chafitas no se explican en el tutorial"): con los mismos Harriers armados, la otra
  // forma de sacarse un misil de encima. `chafitas` = las cargas que el paso deja puestas para practicar
  // (26/11, el autor: "inmediatamente de esquivar el primer misil trasero, viene otro y a ese le lanzamos chafitas; para
  // explicar, pausa y el Turco dice…"): sin Harriers — el misil de atras sale primero (`misilPrimero`) y la pausa llega
  // con el misil ya en la cola
  { dice: 'TUT2_CHAFITAS', teclas: ['Chapitas'], chafitas: 3, misil: 'cola', misilPrimero: true, cuando: { misil: true },
    sigue: [{ chafitas: true, consigna: 'tutC_chafitas' }], remate: 'TUT2_CHAFITAS_OK' },
  // EL MOMENTUM, PROBADO (21/11, el autor: "probarlo esquivando globos varias veces y esperar la recarga, frenar el
  // juego para avisar como lanzarlo"): lanzarlo, esquivar globos con el tiempo lento, esperar que la barra se llene
  // sola, y cuando esta llena el juego FRENA y dice como lanzarlo — y otra vez, con globos
  // (26/11: el paso del RASANTE, que prendia los poderes, se mudo a la etapa 1 — ahora los prende este)
  { dice: 'TUT2_MOMENTUM', poderes: true, teclas: ['Tempo'], llena: ['momentum'], blancos: { tipo: 'balloon', n: 4, linea: true, y: 'avion', paso: 140 },
    sigue: [{ momentum: true, consigna: 'tutC_momentum' }, { esquiva: 2, consigna: 'tutC_esquivaMom' },
      { momentumLleno: true, consigna: 'tutC_recarga' }] },
  { dice: 'TUT2_MOMENTUM_LISTO', teclas: ['Tempo'], foco: ['momentum'], blancos: { tipo: 'balloon', n: 4, linea: true, y: 'avion', paso: 140 },
    sigue: [{ momentum: true, consigna: 'tutC_momentum' }, { esquiva: 2, consigna: 'tutC_esquivaMom' }], remate: 'TUT2_MOMENTUM_OK' },
  { dice: 'TUT2_DANO', foco: ['salud', 'nafta'] },
  { dice: 'TUT2_FIN', remate: 'TUT2_FIN_OK' },
];

// LA ETAPA 3 (fase 5): un buque viejo de practica, una pasada con bomba (todas las que hagan falta), la
// vuelta y el aterrizaje. La Chancha no entra: sin nafta en el tutorial no hay nada que cargar.
const ETAPA3 = [
  { dice: 'TUT3_HOLA' },
  // EL RADAR, RECIEN ACA (18/11, el autor: "subir y que aparezca el radar al INICIO del tutorial no tiene sentido;
  // tiene que aparecer DESPUES, cuando explican el concepto"). En las etapas 1 y 2 esta apagado y no se dibuja nada
  // de el; aca se prende: la raya roja, la red, la barra. Nadie sale a buscarte (game.js limpia las estrellas).
  { dice: 'TUT3_RADAR', foco: ['alt'], teclas: ['Gas', 'Dive'],
    sigue: [{ altSobre: 24, consigna: 'tutC_radarSube' }, { altBajo: 16, consigna: 'tutC_radarBaja' }], remate: 'TUT3_RADAR_OK' },
  // EL SECUNDARIO (18/11, "falta explicar cambio de bomba"): el estante, pasar a los tanques y volver a la bomba
  { dice: 'TUT3_SECUND', foco: ['rack'], teclas: ['Secund'],
    sigue: [{ secundaria: 'tanque', consigna: 'tutC_secTanque' }, { secundaria: 'bomba', consigna: 'tutC_secBomba' }], remate: 'TUT3_SECUND_OK' },
  // (21/11, el autor: "para lanzarla, stick derecho para arriba y clic R3: eso tiene que explicar el tutorial")
  // (21/11, el autor: "la marca verde de buque debo mostrarla ahi"; "no tenes forma de medir segundos"): el foco va en
  // el SEMAFORO de la suelta (render/blanco.js), que dice cuando soltar sin contar nada
  { dice: 'TUT3_BLANCO', cuando: { faltan: 0.35 }, foco: ['ruta'], teclas: ['Bomba'], demo: 'bomba',   // (27/11: la lamina del stick derecho)   // (25/11: sin semaforo — el foco, la barra de arriba)
    // (sin el altimetro en el foco: la caja va abajo y no tapa el semaforo)
    sigue: [{ suelta: true, consigna: 'tutC_suelta' }, { pega: true, consigna: 'tutC_hunde' }] },
  // EL ESCAPE, APENAS PEGA LA BOMBA (21/11, el autor: "la explicacion del escape debe estar apenas entra la bomba: pausa y
  // explica, BIEN, AHORA ESCAPA RAPIDO DE LA ZONA. Sin cambio de clima ni tanta transicion"): game.js, en el tutorial,
  // saltea el video del viraje y escapa con una sola estrella
  // LA VUELTA MAS LARGA Y CON ENEMIGOS (25/11, el autor: "la pasada y la vuelta es muy corta… meter mas complejidad en
  // ESCAPA YA, mas enemigos y demas, hasta estar a una distancia considerable como para estar lejos del radar y llamar a
  // la Chancha"): despues de hundirlo hay que ALEJARSE (`pasado`: 0,35 del camino mas alla del buque) con la fase de
  // escape sembrada (abajo, `fases`); recien ahi la nafta y la Chancha
  { dice: 'TUT3_ESCAPE', sigue: [{ hunde: true, consigna: 'tutC_escapa' }, { pasado: 0.35, consigna: 'tutC_aleja' }], remate: 'TUT3_BLANCO_OK' },
  // LA NAFTA Y LA CHANCHA (18/11, "falta explicar combustible y recarga"): el tanque baja y la Chancha lo llena
  { dice: 'TUT3_NAFTA', foco: ['nafta'], nafta: 35 },
  { dice: 'TUT3_CHANCHA', foco: ['chancha'], teclas: ['Chancha'], llena: ['chancha'],
    sigue: [{ chancha: true, consigna: 'tutC_chancha' }], remate: 'TUT3_CHANCHA_OK' },
  // (21/11, el autor: "las demas piruetas no hace falta que me abras opciones; que las busque en controles y listo"):
  // se nombran y nada mas — sin abrir la pausa ni esperar a que la cierre
  // (27/11, el autor: "Pichon me avisa en la etapa 3 que hay mas piruetas, ya me lo aviso en otro tutorial"): sin TUT3_PIRUETAS
  { dice: 'TUT3_FIN', remate: 'TUT3_FIN_OK' },
];

// LA ETAPA 4 · LAS ISLAS (20/11, el autor: "otra etapa que es cuando llega a la isla y las variantes que haya en la
// isla"; "directo"): arranca ya volando sobre las Malvinas reales (systems/islas/, `islas: true` en la etapa) — la
// llegada desde el pasillo todavia no existe (docs/proyecto/PLAN_ARENA_2.md). Lo que las islas tienen distinto: el
// rumbo y la brujula, la altura desde el suelo, las zonas de radar, los Harriers, el clima y el frio, el MAPA de la
// pausa, la base costera y la eyeccion.
const ETAPA4 = [
  // (27/11, el autor: "en la etapa 4 es solo para presentar la isla. Esto es Malvinas. Usa lo que sabes, busca la base
  // costera, apunta con la caida de la bomba y lanzala!"): la presentacion, la base y el cierre. El rumbo, el relieve, el
  // radar, los Harriers, el mapa y la eyeccion se fueron (sus escenas quedan sin usar)
  { dice: 'TUT4_HOLA' },
  // (27/11, el autor: "explica lo de los radares y las zonas, si; y la parte de Harriers tambien… pero el jugador ya sabe
  // manejarse contra Harriers"): el cartel de ZONA RADAR y que te persiguen, en una pausa corta
  { dice: 'TUT4_RADAR', foco: ['radar', 'alt'] },
  { dice: 'TUT4_BLANCO',
    sigue: [{ suelta: true, consigna: 'tutC_sueltaBase' }, { objIslas: true, consigna: 'tutC_baseIslas' }], remate: 'TUT4_BLANCO_OK' },
  { dice: 'TUT4_FIN', remate: 'TUT4_FIN_OK' },
];

export const TUTORIAL_ETAPAS = [
  // (21/11, el autor: "karera2 en la etapa 1 del tutorial")
  { ...base, id: 'tut1', etapa: 1, name: 'DESPEGAR Y VOLAR', despegueJugable: true, musica: 'original:karera2',
    desc: { es: 'Gas, altura, el radar y el agua. Lo justo para no caerse.', en: 'Throttle, altitude, radar and the sea. Just enough not to fall.' },
    // (su propia fase: SOLO OLAS — sin pajaros ni nada mas en la primera etapa)
    fases: [{ tipo: 'rasante', hasta: 1, solo: ['ola'], bombs: 0, bidones: false }],
    cfg: P({ sky: 'dawn', terrain: 'sea' }), pasos: ETAPA1,
    // los consejos de la pantalla del final (screens.drawResults)
    consejos: { es: ['Rasante: a menos de 5 metros del agua, sin tocarla.', 'En PAUSA → CONTROLES están todos los botones.', 'Lo que sigue: ETAPA 2 · PELEAR.'],
      en: ['Rasante: under 5 meters above the sea, without touching it.', 'PAUSE → CONTROLS lists every button.', 'Next up: STAGE 2 · FIGHT.'] } },
  // (las etapas 2 y 3 todavia son el tramo vacio de la fase 1: sus pasos llegan en las fases 4 y 5)
  { ...base, id: 'tut2', etapa: 2, name: 'PELEAR', musica: 'original:tangalfa',   // (21/11, el autor: "tangalfa para la etapa 2")
    desc: { es: 'El cañón, el calor, los Harriers y el tonel.', en: 'The cannon, the heat, the Harriers and the barrel roll.' },
    cfg: P({ sky: 'clear', terrain: 'sea' }), pasos: ETAPA2,   // (los poderes los prende el paso del MOMENTUM)
    consejos: { es: ['Ráfagas cortas: el cañón caliente se traba.', 'Ponete en la línea del blanco antes de tirar.', 'Lo que sigue: ETAPA 3 · LA PASADA Y LA VUELTA.'],
      en: ['Short bursts: a hot cannon jams.', 'Line up with the target before you fire.', 'Next up: STAGE 3 · THE PASS AND THE WAY HOME.'] } },
  { ...base, id: 'tut3', etapa: 3, name: 'LA PASADA Y LA VUELTA', musica: 'original:Malambo',   // (21/11, el autor: "etapa 3 malambo")
    desc: { es: 'La bomba, la vuelta y el aterrizaje.', en: 'The bomb, the way home and the landing.' },
    // EL BUQUE: un casco viejo, quieto y sin defensa, y todas las pasadas que hagan falta. Con vuelta: al
    // pegarle se vuelve, y al llegar, la aproximacion final de siempre (systems/fases.js `llegaste`)
    goal: { kind: 'ship', ship: 'CASCO DE PRÁCTICA', dist: 9000 }, climax: 'suelta', pasadas: 99, defensa: 'cat', unGolpe: true,   // (21/11: con su zona de corto alcance y sus 20 mm; y la bomba que pega, hunde)
    // la BRP y la ventana mas ancha (18/11, "tiro la bomba bien y no le pega"); con nafta y la Chancha para la vuelta
    bomba: 'brp', dificultad: 'tutorial', chancha: true, chanchaMinT: 0,   // (la ventana mas ancha: data/blanco.js HOLGURA)
    fases: [
      { tipo: 'transito', hasta: 0.2, solo: MAR, bombs: 0, bidones: false },
      { tipo: 'rasante', hasta: 0.85, solo: MAR, bombs: 0, bidones: false },
      { tipo: 'blanco', hasta: 1, solo: MAR, bombs: 0, bidones: false },
      // (25/11) el ESCAPE con enemigos —olas, pajaros y Harriers— hasta 1,35; despues, mar calmo para la Chancha y la llegada
      { tipo: 'vuelta', hasta: 1.35, obstacles: 1.1, caza: 1, bombs: 0, bidones: false },
      { tipo: 'vuelta', hasta: 2, obstacles: 0, caza: 0, bombs: 0, bidones: false },
    ],
    aviones: [{ ...AVION[0], carga: 'tanques_bomba' }],
    cfg: P({ sky: 'dusk', terrain: 'sea', carga: 'tanques_bomba', radar: 'normal', fuelOn: true, fuelScale: 0.2 }), pasos: ETAPA3,   // (sin poderes: el RASANTE te clava al ras y no deja subir a soltar la bomba)
    consejos: { es: ['Volá por debajo del nivel del radar: si lo pasás, te ven.', 'Soltá la bomba alta y temprano.', 'Ya podés volar el LIBRO DE VUELO, en HISTORIA.'],
      en: ['Stay under the radar line: cross it and you get burned.', 'Drop the bomb high and early.', 'You can now fly the FLIGHT LOG, in CAMPAIGN.'] } },
  // (21/11, el autor: "etapa de islas: fernetardo + virus rasante + carnavalitox + chamoide"): en ese orden, y vuelve a empezar
  { ...base, id: 'tut4', etapa: 4, name: 'LAS ISLAS', islas: true,
    musica: 'lista:original/fenretardo.mp3|original/Virus Rasante.m4a|original/Carnavalitox.mp3|original/Chamoide.m4a',
    desc: { es: 'Aprendé a sobrevolar las islas.', en: 'Learn to fly over the islands.' },
    // DESPEGANDO DE PUERTO ARGENTINO (23/11, el autor: "en la etapa 4 debe aparecer el avion despegando en las islas, para
    // no aparecer directamente en conflicto"): el despegue de siempre y, al levantar, sobre la pista de la BAM MALVINAS,
    // en cobertura nuestra — el mismo arranque que el SOBREVUELO de JUEGO RAPIDO (`desdePuerto`, data/islas_teatro.js
    // SOBREVUELO). Antes arrancaba en vuelo sobre el estrecho de San Carlos. Con bomba y el radar del pasillo; sin nafta
    // (la Chancha ya se enseño). Un solo tramo largo: la etapa la cierran los pasos, como las otras
    bomba: 'brp', dificultad: 'facil', desdePuerto: true,
    aviones: [{ ...AVION[0], carga: 'tanques_bomba' }],
    // (25/11, el autor: "no engancha bien entre el despegue y la isla, despeguemos DIRECTAMENTE en la isla, no secuencia"):
    // ya no hay carrera en la pista del pasillo y salto al mapa — arranca en el aire, recien levantado sobre la cabecera de
    // la BAM MALVINAS, con el tren todavia abajo (game.js `abrirTutorial`)
    // (27/11, el autor: "la etapa 4 ya deberia poder llamarlo… ya funcionaria normal"): nafta y Chancha como en el juego
    chancha: true, chanchaMinT: 0,
    cfg: P({ sky: 'cloudy', terrain: 'sea', start: 'air', carga: 'tanques_bomba', radar: 'normal', fuelOn: true }), pasos: ETAPA4,
    consejos: { es: ['En las islas la altura se mide desde el suelo: el cerro te la come.', 'Marcá en el MAPA de la pausa y seguí la brújula.', 'Adentro de un radar inglés, abajo de 20 m.'],
      en: ['On the islands altitude is measured from the ground: hills eat it.', 'Mark a point on the pause MAP and follow the compass.', 'Inside a British radar, stay under 20 m.'] } },
];

// ---------------------------------------------------------------------------------------------
// LO QUE DICEN (borrador). Mismo formato que data/story.js; game.js las suma a SCENES.
const T = (personaje, cara, es) => ({ personaje, cara, hold: 0, es, en: '' });
// LA CHARLA QUE NO ENSEÑA (21/11, el autor: "los dialogos que no son importantes y son solo pelea entre el Turco y el
// Pichon, que sean INGAME"): la linea va por la radio en vuelo, sin frenar el juego (systems/tutorial.js `ingame`)
const B = (personaje, cara, es) => ({ ...T(personaje, cara, es), ingame: true });
const TURCO = 'EL TURCO', PICHON = 'PICHÓN';
const escena = (id, ...lineas) => ({ id, tipo: 'LECCION', titulo: id,
  lineas: lineas.map((l, i) => ({ id: id + '_' + String((i + 1) * 10).padStart(3, '0'), ...l })) });
const banco = (id, ...lineas) => ({ ...escena(id, ...lineas), tipo: 'AVISO' });

// (23/11, el autor: "evitemos tanta charla, frases cortas; cuando debaten entre ellos va en dialogo in game; no debe
// suceder nunca que un dialogo pausa se pise con un in game"): la PAUSA (`T`) es una o dos frases cortas con lo que
// ENSEÑA; la charla entre el Turco y el Pichon va por la radio en vuelo (`B`). El motor no abre una pausa mientras la
// radio hable o tenga algo en cola (systems/tutorial.js + core/radioVN.js `ocupada`).
const LISTA = [
  escena('TUT1_HOLA',
    T(TURCO, 'turco_radio_sonrisa', 'Hola, Tero. Acá Turco. Hoy probás tu pajarraco.'),
    B(PICHON, 'pichon_radio_orgullo', 'Y yo asisto. Me leí el manual. Dos veces.'),
    B(TURCO, 'turco_radio_ceno', 'Los manuales no vuelan, changuito.')),
  escena('TUT1_MANDO',
    T(PICHON, 'pichon_radio_explicando', 'Mirá los mandos antes de salir. En la pausa están todos.')),
  escena('TUT1_DESPEGUE',
    T(TURCO, 'turco_radio_aprueba', 'Pa despegar, mantené arriba hasta que agarre velocidá.'),
    B(PICHON, 'pichon_radio_explicando', 'A 250 km/h levanta solo.')),
  escena('TUT1_DESPEGUE_OK', T(PICHON, 'pichon_radio_sonrisa', 'Despegaste. Como dice el manual.')),
  escena('TUT1_GAS',
    T(TURCO, 'turco_radio_escucha', 'Arriba subís, abajo bajás. Soltá y se queda. Subí un poco.'),
    B(PICHON, 'pichon_radio_explicando', 'Técnicamente es el timón de profundidad…'),
    B(TURCO, 'turco_radio_ceno', '¿Qué dice? Dale, Tero.')),
  escena('TUT1_GAS_OK', T(TURCO, 'turco_radio_aprueba', 'Va, va. Bien.')),
  escena('TUT1_PICADA',
    T(PICHON, 'pichon_radio_explicando', 'Ahora bajá. Mirá la aguja de la altura: el agua no se toca.')),
  escena('TUT1_PICADA_OK', T(PICHON, 'pichon_radio_sonrisa', 'El mar está más cerca de lo que parece.')),
  // (23/11: el GAS MODO SUAVE — solo si se juega con ese modo, `vert`; el dialogo NO nombra el modo, explica como
  // vuela: el autor, "no hablemos de SUAVE… expliquemos tal cual")
  escena('TUT1_SOSTEN',
    T(PICHON, 'pichon_radio_explicando', 'Cada vez que llevás el gas a 100, el avión toma potencia vertical y se mantiene en su altura lo que dure la barra de gas.'),
    T(PICHON, 'pichon_radio_explicando', 'Cuando la barra de gas llega a cero, el avión sigue planeando pero comienza a descender.')),
  escena('TUT1_SOSTEN_OK', T(TURCO, 'turco_radio_aprueba', 'Eso. Así se vuela sin andar subiendo y bajando.')),
  escena('TUT1_RASANTE',
    T(PICHON, 'pichon_radio_explicando', 'Ahora bajá hasta casi tocar el agua: a menos de 5 metros.'),
    B(TURCO, 'turco_radio_desconfiado', '¡OJO! Si la tocás a esa velocidá, te hace pingo. Así que cuidado con las olas.')),
  escena('TUT1_RASANTE_OK',
    T(PICHON, 'pichon_radio_risa', '¡Eso se llama VUELO RASANTE! Pegado al agua, abajo de todo, donde nadie te espera.'),
    T(TURCO, 'turco_radio_aprueba', 'Rasante, ura. Ha sido así como volamos todos acá.')),
  escena('TUT1_SAL_JUNTA'),   // (26/11: sin charla; el Turco avisa al abrir TUT1_SAL)
  // (23/11, el autor, textual: "en los bordes de la pantalla vas a ver salitre…")
  escena('TUT1_SAL',
    T(TURCO, 'turco_radio_preocupado', '¡Pará, ura! Mirá el vidrio: se te ha llenao de salitre.'),
    // (27/11: "explica eso, cortito")
    T(PICHON, 'pichon_radio_explicando', 'Es la sal del mar. Atravesá una nube: el agua la lava.')),
  escena('TUT1_SAL_OK', T(PICHON, 'pichon_radio_sonrisa', 'Ahora sí. Volvé a rasante, que a esa altura el radar enemigo ya te vió.')),
  escena('TUT1_HIELO',
    T(TURCO, 'turco_radio_preocupado', '¿Notás pesado al avión? El frío y las nubes te generan hielo en las alas. Prestá atención a la temperatura cada tanto.'),
    T(PICHON, 'pichon_radio_explicando', 'Si subís por encima de las nubes la temperatura va bajando; cerca del mar es más templada. Volvé a rasante y el hielo se derrite.'),
    B(PICHON, 'pichon_radio_pensativo', 'El clima cambia todo el tiempo. Mirá el cielo antes de salir.')),
  escena('TUT1_HIELO_OK', T(PICHON, 'pichon_radio_sonrisa', 'Se derritió. Por eso volamos rasante.')),
  escena('TUT1_TABLERO',
    T(TURCO, 'turco_radio_aprueba', 'Esto es lo importante: velocidá, horizonte y altura. Lo demás, de reojo.'),
    B(TURCO, 'turco_radio_sonrisa', 'Los relojes los he calibrao yo.')),
  escena('TUT1_ESQUIVAR',
    T(PICHON, 'pichon_radio_explicando', 'Si algo viene de frente, deslizate al costado.'),
    B(TURCO, 'turco_radio_sonrisa', 'Pa los dos lao, que el avión no es rengo.')),
  escena('TUT1_ESQUIVAR_OK', T(PICHON, 'pichon_radio_risa', '¡Perfecto! Bueno, casi.')),
  escena('TUT1_ROLAR',
    T(PICHON, 'pichon_radio_explicando', 'Rolar: girás sobre tu eje. El horizonte te dice cómo quedaste.'),
    B(TURCO, 'turco_radio_preocupado', 'Y volvé derecho, que me mareo.')),
  escena('TUT1_ROLAR_OK', T(TURCO, 'turco_radio_aprueba', 'Bien. No he vomitao.')),
  escena('TUT1_OLAS',
    T(TURCO, 'turco_radio_desconfiado', 'Vienen olas: esquivalas o pasales por arriba. Una sola te desfigura.')),
  escena('TUT1_OLAS_OK', T(PICHON, 'pichon_radio_sonrisa', 'Ni una pluma, Tero.')),
  escena('TUT1_TURBO',
    T(PICHON, 'pichon_radio_explicando', 'Poscombustión: mucha más velocidad, pero gasta el triple.'),
    B(TURCO, 'turco_radio_desconfiado', 'Por eso mirá la nafta, ura. No es de adorno.')),
  escena('TUT1_TURBO_OK', T(TURCO, 'turco_radio_aprueba', 'Eso, ura. Largalo, que te chupa la nafta.')),
  escena('TUT1_PAUSA',
    T(TURCO, 'turco_radio_aprueba', 'Si te olvidás de algo, pausá: ahí ta todo ordenao.'),
    // (27/11, el autor: "tiene que ser ANTES de abrir la pausa"): en la pausa de dialogo, no por radio despues
    T(PICHON, 'pichon_radio_sonrisa', 'Mirá, te muestro… Te lo ordené por categoría.')),
  escena('TUT1_PAUSA_OK', T(TURCO, 'turco_radio_sonrisa', 'Bien. Seguimo.')),
  escena('TUT1_FIN',
    T(TURCO, 'turco_radio_sonrisa', 'Arriba está la barra de ruta. Te dice cuánto falta y pa dónde. Por hoy, estamo.'),
    B(PICHON, 'pichon_radio_pensativo', 'Mañana, las armas. Tengo ideas para el cañón…'),
    B(TURCO, 'turco_radio_ceno', 'Chango, ya te dije… eso no se puede… pero… mañana me mostrás.')),   // (27/11: en un solo mensaje)
  escena('TUT1_FIN_OK', T(TURCO, 'turco_radio_escucha', '…Bueno. Mañana me mostrás.')),
  escena('TUT1_LIBRE',
    T(TURCO, 'turco_radio_sonrisa', 'Volá lo que quierás. Pa terminar: pausa, TERMINAR ETAPA.')),
  escena('TUT2_HOLA',
    T(TURCO, 'turco_radio_desconfiado', 'Hoy, el cañón. Lo he limpiao anoche, no me lo ensuciés.'),
    B(PICHON, 'pichon_radio_risa', 'Pusimos globos de práctica. Les dibujé caritas.'),
    B(TURCO, 'turco_radio_ceno', 'Esas caritas cajetas…')),
  escena('TUT2_CANON',
    T(TURCO, 'turco_radio_aprueba', 'Tira pa donde apunta la nariz de tu avión. Ponete de frente a la misma altura y bajales el cargador.'),
    T(PICHON, 'pichon_radio_explicando', 'Rompelos o esquivalos. Si tirás de corrido, el cañón se calienta y se traba.')),
  escena('TUT2_CANON_OK', T(TURCO, 'turco_radio_risa', 'Diez. Bieeen, uuraa.')),
  // (por radio, sin frenar, cuando el cañon se traba en TUT2_CANON — systems/tutorial.js `alTrabar`)
  escena('TUT2_CALOR',
    B(PICHON, 'pichon_radio_explicando', 'Se trabó: tiraste de corrido y se calentó. Se enfría solo. Ráfagas cortas, Tero.'),
    B(PICHON, 'pichon_radio_pensativo', 'La temperatura afecta al cañón: por ejemplo, el frío lo traba.')),
  escena('TUT2_HARRIER',
    T(TURCO, 'turco_radio_grito', 'E ura, Harriers. Vienen de frente, ligero, y van a buscar tu retaguardia.'),
    T(PICHON, 'pichon_radio_alerta', 'Tratá de evitar que pasen detrás tuyo: ponete de frente y tirales antes de que te pasen.')),
  escena('TUT2_HARRIER_OK', T(PICHON, 'pichon_radio_sorpresa', '¡Los bajaste! Así: de frente, antes de que te pasen.')),
  escena('TUT2_TONEL',
    T(PICHON, 'pichon_radio_explicando', 'Para esquivar los obstáculos de frente podés hacer una pirueta. Probá tocar dos veces el stick izquierdo para el mismo lado.')),
  escena('TUT2_TONEL_OK', T(TURCO, 'turco_radio_risa', 'Bieeeen, uraaa.')),
  // (23/11: el misil de frente y el de atras — BORRADOR, espera el OK del autor)
  escena('TUT2_MISIL_FRENTE',
    // (26/11, el autor: "una vez que lo hace y el Turco dice BIEEEN URAA, que Pichon diga…"): el remate es una sola
    // linea, asi que la del Pichon abre el paso siguiente, por radio
    B(PICHON, 'pichon_radio_risa', '¡Hiciste un tonel! Es una de las tantas piruetas que existen.'),
    T(PICHON, 'pichon_radio_alerta', 'Misil de frente: viene derecho a donde estabas.'),
    T(PICHON, 'pichon_radio_explicando', 'Correte al costado, o hacé una pirueta cuando lo tengas encima.')),
  escena('TUT2_MISIL_FRENTE_OK', T(TURCO, 'turco_radio_aprueba', 'Eso. Pasó de largo, chango.')),
  escena('TUT2_MISIL_FRENTE_TEDIO', B(PICHON, 'pichon_radio_sorpresa', 'Te dio. Correte antes. Ahí viene otro.')),
  escena('TUT2_MISIL_COLA',
    // (26/11, el autor: "ahi inmediatamente…"): una sola linea, por radio, sin frenar
    B(PICHON, 'pichon_radio_alerta', 'Tenés otro misil detrás: te persigue por calor. ¡Hacé otra pirueta para esquivarlo!')),
  escena('TUT2_MISIL_COLA_OK', T(TURCO, 'turco_radio_risa', '¡Se fue de largo! Ya está.')),
  escena('TUT2_MISIL_COLA_TEDIO', B(PICHON, 'pichon_radio_sorpresa', 'Muy temprano o muy tarde. Esperá el grito. Ahí va otro.')),
  escena('TUT2_CHAFITAS',
    T(TURCO, 'turco_radio_grito', 'Lanzá chaff para perderlo.'),
    B(PICHON, 'pichon_radio_orgullo', 'Chafitas, Turco. Les puse de nombre chafitas.')),
  escena('TUT2_CHAFITAS_OK', T(TURCO, 'turco_radio_aprueba', 'Eso, vago.')),
  escena('TUT2_RASANTE',
    // (27/11, el autor, textual; los segundos son AGU.CARGA de core/aguante.js —el autor escribio 6, el juego pide 4—; va como numero por el lint de capas)
    T(PICHON, 'pichon_radio_explicando', `Cuando te mantengas en rasante aparecerá una barra naranja: PERFECTO. Si lo mantenés por ${CARGA_PERF} segundos, podés armar el RASANTE perfecto.`),
    T(TURCO, 'turco_radio_aprueba', 'Una vez que completes la barra naranja, se convertirá en una azul. Acá la mecánica es simple: levantás el stick cada vez que pase la aguja por la zona azul de la barra, pa juntar cargas.'),
    T(PICHON, 'pichon_radio_neutro', 'Cada acierto llena una carga del poder RASANTE. Una vez que lo completás, se lanza la habilidad y te vas a sentir indestructible por unos segundos.')),
  escena('TUT2_RASANTE_OK', T(PICHON, 'pichon_radio_risa', '¡Eso es RASANTE! Nadie te toca mientras dura.')),
  escena('TUT2_RAS_ESQUIVA',
    T(TURCO, 'turco_radio_escucha', 'No te hace inmortal: esquivá los globos en rasante.')),
  escena('TUT2_RAS_ESQUIVA_OK', T(TURCO, 'turco_radio_aprueba', 'Más aciertos, más rasante. Ese es el negocio.')),
  escena('TUT2_MOMENTUM',
    T(PICHON, 'pichon_radio_orgullo', 'El momentum: un toque y el tiempo se pone lento, y vos te movés más rápido. Con las dos cargas llenas, otro toque y más lento todavía.'),
    B(TURCO, 'turco_radio_sonrisa', 'Concentración extrema, le digo yo.')),
  escena('TUT2_MOMENTUM_LISTO',
    T(PICHON, 'pichon_radio_alerta', 'Se llenó otra vez. Lanzalo y esquivá los globos.')),
  escena('TUT2_MOMENTUM_OK', T(PICHON, 'pichon_radio_risa', 'De película, ¿no?')),
  escena('TUT2_DANO',
    T(TURCO, 'turco_radio_escucha', 'Si te pegan, lo sufre la chapa: ese reloj. Si baja mucho, volvé.'),
    B(PICHON, 'pichon_radio_explicando', 'Y la nafta es lo que te trae de vuelta.'),
    B(TURCO, 'turco_radio_sonrisa', 'Lo que te trae de vuelta soy yo, que arreglo los pajarracos hechos pingo.')),
  escena('TUT2_FIN',
    T(TURCO, 'turco_radio_aprueba', 'Mañana metemos bomba.'),
    B(PICHON, 'pichon_radio_pensativo', 'Tengo una idea para la antiaérea, Turco…'),
    B(TURCO, 'turco_radio_escucha', 'Chango…')),
  escena('TUT2_FIN_OK', T(PICHON, 'pichon_radio_corregido', 'Ya sé, ya sé. Mañana le muestro.')),
  escena('TUT3_HOLA',
    T(TURCO, 'turco_radio_desconfiado', 'Hoy la pasada de verdá. Te he colgao una bomba de práctica.')),
  escena('TUT3_RADAR',
    T(PICHON, 'pichon_radio_explicando', 'El radar inglés te ve arriba de la raya verde. Subí a verlo y bajá rápido.'),
    B(PICHON, 'pichon_radio_orgullo', 'Abajo del radar no existimos.')),
  escena('TUT3_RADAR_OK', T(TURCO, 'turco_radio_aprueba', 'El radar avisa y después te tira. Tenés poco tiempo para bajar.')),
  escena('TUT3_SECUND',
    T(TURCO, 'turco_radio_escucha', 'Abajo a la derecha está todo lo que podés soltar. Podés soltar la bomba o los tanques de combustible para ganar velocidad, pero perdés capacidad de combustible.')),
  escena('TUT3_SECUND_OK', T(TURCO, 'turco_radio_aprueba', 'Bien. No largués los tanques en vez de la bomba.')),
  escena('TUT3_NAFTA',
    T(PICHON, 'pichon_radio_preocupado', 'Mirá la nafta: queda poca. El turbo y el ras la gastan.')),
  escena('TUT3_CHANCHA',
    T(TURCO, 'turco_radio_sonrisa', 'Llamá a la Chancha, el Hércules cisterna. Ponete atrás y abajo de la manguera, quietito.')),
  escena('TUT3_CHANCHA_OK', T(TURCO, 'turco_radio_risa', 'La Chancha no falla nunca. Bueno, casi.')),
  escena('TUT3_BLANCO',
    // (27/11, el autor, textual)
    T(PICHON, 'pichon_radio_alerta', 'Ahí está el buque. Ponete a su altura, apuntá la caída y, cuando la mira del buque se ponga amarilla y titile, ¡soltá la bomba con R3!'),
    B(PICHON, 'pichon_radio_preocupado', 'Si errás, otra pasada. El casco no se va.')),
  escena('TUT3_ESCAPE',
    T(TURCO, 'turco_radio_grito', '¡Le diste! Ahora escapá rasante, que te tiran.')),
  escena('TUT3_BLANCO_OK', T(PICHON, 'pichon_radio_risa', 'A casa.')),
  escena('TUT3_PIRUETAS',
    T(PICHON, 'pichon_radio_sonrisa', 'Hay más piruetas: están en CONTROLES, en la pausa.'),
    B(TURCO, 'turco_radio_ceno', 'Volvé entero, no desfigurao.')),
  escena('TUT3_PIRUETAS_OK', T(PICHON, 'pichon_radio_pensativo', 'Algún día las probamos todas.')),
  escena('TUT3_APROX',
    T(PICHON, 'pichon_radio_explicando', 'La pista. Llegá despacio y bajá el tren antes de tocar.')),
  escena('TUT3_APROX_OK', T(TURCO, 'turco_radio_sonrisa', 'En casa. Entero, más o menos.')),
  escena('TUT3_FIN',
    T(TURCO, 'turco_radio_sonrisa', 'Ya sabés lo básico, Tero. Esta noche te pinto la estrellita.'),
    B(PICHON, 'pichon_radio_orgullo', 'La primera.'),
    B(TURCO, 'turco_radio_aprueba', 'Ahora… mate. Poné la pava, Pichón.')),
  escena('TUT3_FIN_OK', T(PICHON, 'pichon_radio_sonrisa', 'Dele, don. Yo cebo.')),
  escena('TUT4_HOLA',
    T(TURCO, 'turco_radio_sonrisa', 'Esto es Malvinas, Tero. Usá lo que sabés: evitá los radares, los Harrier y no te la pongás contra nada.'),
    T(TURCO, 'turco_radio_aprueba', 'Buscá la base costera, apuntá con la caída de la bomba y ¡largala!')),
  escena('TUT4_RUMBO',
    T(PICHON, 'pichon_radio_explicando', 'La brújula: tu rumbo y dónde queda el objetivo. Virá a los dos lados.')),
  escena('TUT4_RUMBO_OK', T(TURCO, 'turco_radio_risa', 'Ya sabés pa dónde va la nariz.')),
  escena('TUT4_RELIEVE',
    T(TURCO, 'turco_radio_desconfiado', 'Acá la altura es desde el suelo: un cerro te la come.'),
    T(PICHON, 'pichon_radio_explicando', 'Volá rasante, pegado al relieve, abajo de la raya.')),
  escena('TUT4_RELIEVE_OK', T(PICHON, 'pichon_radio_sonrisa', 'El cerro también te tapa del radar.')),
  escena('TUT4_RADAR',
    T(PICHON, 'pichon_radio_alerta', 'El cartel de arriba dice tu zona: radar inglés, radar nuestro o fuera de radar.'),
    T(PICHON, 'pichon_radio_explicando', 'En zona inglesa, arriba de 20 metros te ven. Y si te ven, salen los Harrier a perseguirte.'),
    B(TURCO, 'turco_radio_aprueba', 'Ya sabés: esquivá el misil o bajalos.')),
  escena('TUT4_HARRIER',
    T(TURCO, 'turco_radio_grito', 'Si te ven, salen los Harrier culiaos. La flecha roja dice de dónde.'),
    B(PICHON, 'pichon_radio_explicando', 'Al Sidewinder: pirueta o chafitas.')),
  escena('TUT4_CLIMA',
    T(PICHON, 'pichon_radio_pensativo', 'Acá el tiempo cambia solo. Con frío y humedad, hielo: buscá aire más templado.')),
  escena('TUT4_MAPA',
    T(PICHON, 'pichon_radio_explicando', 'En el mapa marcás un punto y la brújula te lleva. Marcá la base costera.')),
  escena('TUT4_MAPA_OK', T(TURCO, 'turco_radio_aprueba', 'Ahora seguí la brújula.')),
  escena('TUT4_BLANCO',
    B(PICHON, 'pichon_radio_explicando', 'La brújula te dice ande queda la base.')),
  escena('TUT4_BLANCO_OK', T(PICHON, 'pichon_radio_risa', '¡Le diste a la base!')),
  escena('TUT4_EYECCION',
    T(TURCO, 'turco_radio_preocupado', 'Si el avión no da más, eyectate: mantené las dos de rolar a la vez, o la cruceta ◄ dos veces.'),
    B(PICHON, 'pichon_radio_explicando', 'En tierra te rescatan. En el mar es otra historia.')),
  escena('TUT4_FIN',
    T(TURCO, 'turco_radio_sonrisa', 'Ya conocés las islas. Otra estrellita.'),
    B(PICHON, 'pichon_radio_orgullo', 'Ahora sí, lo sabés todo.')),
  escena('TUT4_FIN_OK', T(TURCO, 'turco_radio_aprueba', 'Volvé entero, changuito. Hay mate.')),
  // LOS AVISOS: el avion no se cae, pero el golpe se comenta (una al azar, sin repetir la anterior)
  banco('AV_TUT_AGUA',
    T(TURCO, 'turco_radio_grito', '¡El mar, Tero! Pegao, sí. Adentro, no.'),
    T(PICHON, 'pichon_radio_alerta', 'Eso fue agua salada. ¡Arriba, arriba!'),
    T(TURCO, 'turco_radio_ceno', 'Se hizo aca la chapa. Dejá, la enderezo yo después. Subí, carnero.')),
  banco('AV_TUT_CHOQUE',
    T(TURCO, 'turco_radio_escucha', 'Eso ha sido el viento. Seguí.'),
    T(PICHON, 'pichon_radio_duda', 'No había viento, Turco. Mirá adelante, Tero.'),
    T(TURCO, 'turco_radio_ceno', '¿Qué asimo, Tero? Otro golpe así y te cobro la chapa.')),
  // LA PISTA SE TERMINO antes de levantar: se dicen en orden, una por intento
  banco('AV_TUT_PISTA',
    T(TURCO, 'turco_radio_ceno', '¡Se te ha acabao la pista! Va de nuevo. Y no solté el gas, carnero.'),
    T(PICHON, 'pichon_radio_explicando', 'Te faltó velocidad, Tero. Mantené arriba desde el principio.'),
    T(TURCO, 'turco_radio_grito', 'No lo largué. Hasta ashiiiiba.')),
  banco('AV_TUT_ERRO',
    T(PICHON, 'pichon_radio_preocupado', 'Erraste. Soltala más temprano.'),
    T(TURCO, 'turco_radio_sonrisa', 'Intentemo otra pasada. Ese casco no se va a ningún lao.'),
    T(PICHON, 'pichon_radio_explicando', 'Más alto: soltada muy baja no se arma. Esperá el amarillo.')),
  // ROZAR EL AGUA (sin chocar): game.js lo comenta cada tanto
  banco('AV_TUT_ROCE',
    T(TURCO, 'turco_radio_preocupado', '¡Cuidao, cuidao!'),
    T(PICHON, 'pichon_radio_nervioso', 'Estás rozando. Subí un palmo.'),
    T(TURCO, 'turco_radio_desconfiado', 'Tené cuidao, que la sal se come la chapa.')),
  banco('AV_TUT_PISO',
    T(TURCO, 'turco_radio_grito', '¿Qué hacé vo? Tero, si me hacés pingo al avión te hago aca, carnero.')),
];

export const TUT_SCENES = Object.fromEntries(LISTA.map(s => [s.id, s]));
