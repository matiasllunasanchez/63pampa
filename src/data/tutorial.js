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
  // EL AVION NO SE CAE (la perilla de M1): un choque pega en la chapa, nunca baja de `piso`, y lo comenta
  // un banco de avisos del Turco y el Pichon. Es el "punto de control" del plan: no se pierde nada.
  sinMuerte: { golpe: 20, piso: 30, gracia: 1.5 },
  avisos: { agua: 'AV_TUT_AGUA', choque: 'AV_TUT_CHOQUE', piso: 'AV_TUT_PISO', pista: 'AV_TUT_PISTA', bl_errado: 'AV_TUT_ERRO', bl_larga: 'AV_TUT_ERRO', cada: 5 },
};

const ETAPA1 = [
  { dice: 'TUT1_HOLA' },
  // EL DESPEGUE (fase 3): en la cabecera, la carrera con el gas (core/despegue.js)
  { dice: 'TUT1_DESPEGUE', foco: ['gas', 'vel'], teclas: ['Gas'],
    sigue: [{ despega: true, consigna: 'tutC_despega' }], remate: 'TUT1_DESPEGUE_OK' },
  // (21/11, el autor: "el tutorial nunca me explica como despegar" y "Pichon dice hola despues de que ya hablo y
  // despegue, se desordeno todo"): el saludo iba por radio ANTES del despegue con el mundo corriendo, y uno ya habia
  // despegado cuando llegaba la explicacion. Ahora el juego ARRANCA EN PAUSA: los dos saludan, y enseguida el despegue
  { dice: 'TUT1_GAS', foco: ['gas', 'alt'], teclas: ['Gas'],
    sigue: [{ altSobre: 30, consigna: 'tutC_subi' }], remate: 'TUT1_GAS_OK' },
  { dice: 'TUT1_PICADA', foco: ['alt'], teclas: ['Dive'],
    sigue: [{ altBajo: 12, consigna: 'tutC_baja' }], remate: 'TUT1_PICADA_OK' },
  // (SIN RADAR en la etapa 1, 18/11: el autor, "el tutorial no tiene que mostrar todo el potencial del juego". El
  // paso es volar bajito sin tocar el agua; el techo del radar se aprende en la campaña)
  { dice: 'TUT1_RASANTE', foco: ['alt'], teclas: ['Gas'],
    sigue: [{ bajoTecho: 8, consigna: 'tutC_rasante' }], remate: 'TUT1_RASANTE_OK' },
  { dice: 'TUT1_TABLERO', foco: ['vel', 'horizonte', 'alt', 'gas'] },
  // (21/11, el autor: "mas globos para esquivar, varios esquives"): primero el deslizamiento a cada lado, despues
  // GLOBOS en tu linea, a tu altura, uno detras del otro
  { dice: 'TUT1_ESQUIVAR', teclas: ['Fly'], blancos: { tipo: 'balloon', tandas: [3, 2, 3], linea: true, y: 'avion', paso: 40, entre: 170 },
    sigue: [{ usa: ['l', 'r'], consigna: 'tutC_esquivar' }, { esquiva: 6, consigna: 'tutC_esquiva' }], remate: 'TUT1_ESQUIVAR_OK' },
  { dice: 'TUT1_ROLAR', foco: ['horizonte'], teclas: ['Roll'],
    sigue: [{ usa: ['rollL', 'rollR'], consigna: 'tutC_rolar' }], remate: 'TUT1_ROLAR_OK' },
  // (solo OLAS y pocas: sin pajaros ni nada mas, 18/11 — "no tantos enemigos, y menos en la primera etapa")
  { dice: 'TUT1_OLAS', obstacles: 0.9,
    sigue: [{ pasa: 6, consigna: 'tutC_pasa' }], remate: 'TUT1_OLAS_OK' },
  // LA SAL EN EL PARABRISAS (19/11, el autor: "explicar la mecanica del vidrio empañado con sal, y que para mejorarlo
  // tiene que subir un poco"; despues, "que la limpie la nube"): el paso arranca con el vidrio salado (`sal`) y se lava
  // adentro de la nube (systems/salitre.js)
  { dice: 'TUT1_SAL', foco: ['alt'], teclas: ['Gas'], sal: 0.45,
    sigue: [{ salBajo: 0.05, consigna: 'tutC_sal' }], remate: 'TUT1_SAL_OK' },
  // EL HIELO (20/11, el autor: "meter las nuevas mecanicas de clima y frio"; data/frio.js): lavando el vidrio en la nube,
  // con el frio del amanecer, se junta hielo en las alas. Se muestra el termometro y se derrite bajando al ras del mar
  { dice: 'TUT1_HIELO', foco: ['temp', 'alt'], teclas: ['Gas', 'Dive'],
    sigue: [{ hieloSobre: 0.15, consigna: 'tutC_hielo' }, { hieloBajo: 0.05, consigna: 'tutC_deshiela' }], remate: 'TUT1_HIELO_OK' },
  { dice: 'TUT1_TURBO', foco: ['vel'], teclas: ['Boost'],
    sigue: [{ usa: ['turbo'], consigna: 'tutC_turbo' }], remate: 'TUT1_TURBO_OK' },
  // LA PAUSA GUIADA: el juego abre la pausa en CONTROLES, y para seguir hay que cerrarla
  { dice: 'TUT1_PAUSA', teclas: ['Pause'], abre: 'movilidad',
    sigue: [{ cierra: true, consigna: 'tutC_pausa' }], remate: 'TUT1_PAUSA_OK' },
  { dice: 'TUT1_FIN', foco: ['ruta'], remate: 'TUT1_FIN_OK' },
  // LA PRACTICA LIBRE (21/11, el autor: "etapa 1: decision del usuario de terminar el nivel, para darle tiempo a que
  // juegue o siga probando"): las olas siguen y se vuela lo que se quiera; se termina desde la PAUSA (TERMINAR ETAPA)
  { dice: 'TUT1_LIBRE', teclas: ['Pause'], libre: true, obstacles: 0.9,
    sigue: [{ termina: true, consigna: 'tutC_libre' }] },
];

// LA ETAPA 2 (fase 4): el cañon, sobre el mar (la costa trae el desembarco, con soldados: no es para una practica). El A-4B no lleva misiles aire-aire y la media vuelta es del
// 3D, asi que no entran (el plan los nombraba): cañon, calor, blancos que se mueven y un Harrier de practica.
const ETAPA2 = [
  { dice: 'TUT2_HOLA' },
  { dice: 'TUT2_CANON', foco: ['canon'], teclas: ['Gun', 'Fly'], blancos: { tipo: 'balloon', n: 3 },
    sigue: [{ rompe: 3, consigna: 'tutC_rompe' }], remate: 'TUT2_CANON_OK' },
  { dice: 'TUT2_CALOR', foco: ['canon'], teclas: ['Gun'],
    sigue: [{ calienta: true, consigna: 'tutC_calienta' }], remate: 'TUT2_CALOR_OK' },
  { dice: 'TUT2_MOVILES', teclas: ['Fly', 'Gun'], blancos: { tipo: 'balloon', n: 3, mueve: true, paso: 60 },
    sigue: [{ rompe: 2, consigna: 'tutC_moviles' }], remate: 'TUT2_MOVILES_OK' },
  // HARRIERS DE VERDAD (21/11, el autor: "el Harrier de practica no, poner Harriers"): tejen, te buscan el carril y
  // alguno puede venir armado (systems/spawn.js `sembrarPractica` con `real`)
  { dice: 'TUT2_HARRIER', teclas: ['Gun', 'Fly'], blancos: { tipo: 'jet', n: 2, real: true, paso: 70 },
    sigue: [{ rompe: 2, consigna: 'tutC_harrier' }], remate: 'TUT2_HARRIER_OK' },
  // EL TONEL, ACA (21/11, el autor: "¿por que metemos el tonel en la etapa 3?"): estaba en la vuelta de la etapa 3
  // para llenar el tramo vacio. Su lugar es donde hay algo que esquivar: Harriers ARMADOS, y el tonel con el
  // Sidewinder cerca hace que se pase de largo (core/aim9.js)
  { dice: 'TUT2_TONEL', teclas: ['Tonel'], blancos: { tipo: 'jet', n: 2, real: true, armado: true, paso: 80 },
    sigue: [{ maniobra: 'tonel', consigna: 'tutC_tonel' }], remate: 'TUT2_TONEL_OK' },
  // LOS PODERES (18/11, el autor: "falta explicar rasante, falta explicar momentum"): el RASANTE se muestra
  // prendiendolo (aparece solo, por la racha de vuelo bajo) y el MOMENTUM se usa, con la barra ya llena
  // (19/11, el autor: "me carga el poder de una, eso no sirve; tiene que enseñarme como funciona: como pegarle, que es
  // la barrita, cuando aparece, como mantenerla" y "mientras va rasante tiene que haber obstaculos para esquivar"):
  // se gana de verdad, en cuatro pasos — PERFECTO 4 s, la barrita (acertar el azul), soltarlo, y esquivar con el poder
  // (todo se explica ANTES de bajar: con el estado abierto, cada linea congelaba el juego y lo cortaba. Despues, las
  // tres consignas seguidas: entrar, acertar el azul, soltarlo)
  { dice: 'TUT2_RASANTE', foco: ['alt'], teclas: ['Gas', 'Dive'], poderes: true,
    sigue: [{ aguante: true, consigna: 'tutC_perfecto' }, { aciertos: 4, consigna: 'tutC_aciertos' },
      { rasante: true, consigna: 'tutC_soltaRas' }], remate: 'TUT2_RASANTE_OK' },
  // (las olas se atraviesan con el RASANTE y los pajaros vuelan mas alto: lo que se esquiva al ras son GLOBOS bajos,
  // en tu linea)
  { dice: 'TUT2_RAS_ESQUIVA', teclas: ['Fly'], blancos: { tipo: 'balloon', tandas: [3, 2, 3], linea: true, y: 2.6, paso: 45, entre: 180 },
    sigue: [{ esquiva: 6, consigna: 'tutC_esquiva' }], remate: 'TUT2_RAS_ESQUIVA_OK' },
  // EL MOMENTUM, PROBADO (21/11, el autor: "probarlo esquivando globos varias veces y esperar la recarga, frenar el
  // juego para avisar como lanzarlo"): lanzarlo, esquivar globos con el tiempo lento, esperar que la barra se llene
  // sola, y cuando esta llena el juego FRENA y dice como lanzarlo — y otra vez, con globos
  { dice: 'TUT2_MOMENTUM', teclas: ['Tempo'], llena: ['momentum'], blancos: { tipo: 'balloon', n: 6, linea: true, y: 'avion', paso: 55 },
    sigue: [{ momentum: true, consigna: 'tutC_momentum' }, { esquiva: 3, consigna: 'tutC_esquivaMom' },
      { momentumLleno: true, consigna: 'tutC_recarga' }] },
  { dice: 'TUT2_MOMENTUM_LISTO', teclas: ['Tempo'], foco: ['momentum'], blancos: { tipo: 'balloon', n: 6, linea: true, y: 'avion', paso: 55 },
    sigue: [{ momentum: true, consigna: 'tutC_momentum' }, { esquiva: 3, consigna: 'tutC_esquivaMom' }], remate: 'TUT2_MOMENTUM_OK' },
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
  { dice: 'TUT3_BLANCO', cuando: { faltan: 0.35 }, foco: ['alt', 'rack'], teclas: ['Bomba'],
    sigue: [{ suelta: true, consigna: 'tutC_suelta' }, { pega: true, consigna: 'tutC_hunde' }] },
  // EL ESCAPE, APENAS PEGA LA BOMBA (21/11, el autor: "la explicacion del escape debe estar apenas entra la bomba: pausa y
  // explica, BIEN, AHORA ESCAPA RAPIDO DE LA ZONA. Sin cambio de clima ni tanta transicion"): game.js, en el tutorial,
  // saltea el video del viraje y escapa con una sola estrella
  { dice: 'TUT3_ESCAPE', sigue: [{ hunde: true, consigna: 'tutC_escapa' }], remate: 'TUT3_BLANCO_OK' },
  // LA NAFTA Y LA CHANCHA (18/11, "falta explicar combustible y recarga"): el tanque baja y la Chancha lo llena
  { dice: 'TUT3_NAFTA', foco: ['nafta'], nafta: 35 },
  { dice: 'TUT3_CHANCHA', foco: ['chancha'], teclas: ['Chancha'], llena: ['chancha'],
    sigue: [{ chancha: true, consigna: 'tutC_chancha' }], remate: 'TUT3_CHANCHA_OK' },
  { dice: 'TUT3_PIRUETAS', abre: 'piruetas',
    sigue: [{ cierra: true, consigna: 'tutC_pausa' }], remate: 'TUT3_PIRUETAS_OK' },
  { dice: 'TUT3_FIN', remate: 'TUT3_FIN_OK' },
];

// LA ETAPA 4 · LAS ISLAS (20/11, el autor: "otra etapa que es cuando llega a la isla y las variantes que haya en la
// isla"; "directo"): arranca ya volando sobre las Malvinas reales (systems/islas/, `islas: true` en la etapa) — la
// llegada desde el pasillo todavia no existe (docs/proyecto/PLAN_ARENA_2.md). Lo que las islas tienen distinto: el
// rumbo y la brujula, la altura desde el suelo, las zonas de radar, los Harriers, el clima y el frio, el MAPA de la
// pausa, la base costera y la eyeccion.
const ETAPA4 = [
  { dice: 'TUT4_HOLA' },
  { dice: 'TUT4_RUMBO', foco: ['mach'], teclas: ['Fly'],
    sigue: [{ usa: ['l', 'r'], consigna: 'tutC_virar' }], remate: 'TUT4_RUMBO_OK' },
  { dice: 'TUT4_RELIEVE', foco: ['alt'], teclas: ['Gas'],
    sigue: [{ bajoTecho: 8, consigna: 'tutC_relieve' }], remate: 'TUT4_RELIEVE_OK' },
  { dice: 'TUT4_RADAR', foco: ['alt'] },
  { dice: 'TUT4_HARRIER' },
  { dice: 'TUT4_MAPA', teclas: ['Pause'], abre: 'mapa',
    sigue: [{ marca: true, consigna: 'tutC_marcaBase' }, { cierra: true, consigna: 'tutC_pausa' }], remate: 'TUT4_MAPA_OK' },
  { dice: 'TUT4_BLANCO', foco: ['mach', 'rack'], teclas: ['Bomba'],
    sigue: [{ suelta: true, consigna: 'tutC_sueltaBase' }, { objIslas: true, consigna: 'tutC_baseIslas' }], remate: 'TUT4_BLANCO_OK' },
  { dice: 'TUT4_EYECCION', teclas: ['Eyecta'] },
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
    consejos: { es: ['Gas de a toques: así se vuela al ras sin tocar el agua.', 'En PAUSA → CONTROLES están todos los botones.', 'Lo que sigue: ETAPA 2 · PELEAR.'],
      en: ['Tap the throttle: that is how you fly low without touching the sea.', 'PAUSE → CONTROLS lists every button.', 'Next up: STAGE 2 · FIGHT.'] } },
  // (las etapas 2 y 3 todavia son el tramo vacio de la fase 1: sus pasos llegan en las fases 4 y 5)
  { ...base, id: 'tut2', etapa: 2, name: 'PELEAR', musica: 'original:tangalfa',   // (21/11, el autor: "tangalfa para la etapa 2")
    desc: { es: 'El cañón, el calor, los Harriers y el tonel.', en: 'The cannon, the heat, the Harriers and the barrel roll.' },
    cfg: P({ sky: 'clear', terrain: 'sea' }), pasos: ETAPA2,   // (los poderes los prende el paso del RASANTE)
    consejos: { es: ['Ráfagas cortas: el cañón caliente se traba.', 'Ponete en la línea del blanco antes de tirar.', 'Lo que sigue: ETAPA 3 · LA PASADA Y LA VUELTA.'],
      en: ['Short bursts: a hot cannon jams.', 'Line up with the target before you fire.', 'Next up: STAGE 3 · THE PASS AND THE WAY HOME.'] } },
  { ...base, id: 'tut3', etapa: 3, name: 'LA PASADA Y LA VUELTA', musica: 'original:Malambo',   // (21/11, el autor: "etapa 3 malambo")
    desc: { es: 'La bomba, la vuelta y el aterrizaje.', en: 'The bomb, the way home and the landing.' },
    // EL BUQUE: un casco viejo, quieto y sin defensa, y todas las pasadas que hagan falta. Con vuelta: al
    // pegarle se vuelve, y al llegar, la aproximacion final de siempre (systems/fases.js `llegaste`)
    goal: { kind: 'ship', ship: 'CASCO DE PRÁCTICA', dist: 4200 }, climax: 'suelta', pasadas: 99, defensa: null,
    // la BRP y la ventana mas ancha (18/11, "tiro la bomba bien y no le pega"); con nafta y la Chancha para la vuelta
    bomba: 'brp', dificultad: 'facil', chancha: true, chanchaMinT: 0,
    fases: [
      { tipo: 'transito', hasta: 0.2, solo: MAR, bombs: 0, bidones: false },
      { tipo: 'rasante', hasta: 0.85, solo: MAR, bombs: 0, bidones: false },
      { tipo: 'blanco', hasta: 1, solo: MAR, bombs: 0, bidones: false },
      { tipo: 'vuelta', hasta: 1.45, obstacles: 0, caza: 0, bombs: 0, bidones: false },
    ],
    aviones: [{ ...AVION[0], carga: 'tanques_bomba' }],
    cfg: P({ sky: 'dusk', terrain: 'sea', carga: 'tanques_bomba', radar: 'normal', fuelOn: true, fuelScale: 0.2 }), pasos: ETAPA3,   // (sin poderes: el RASANTE te clava al ras y no deja subir a soltar la bomba)
    consejos: { es: ['Volá por debajo del nivel del radar: si lo pasás, te ven.', 'Soltá la bomba alta y temprano.', 'Ya podés volar el LIBRO DE VUELO, en HISTORIA.'],
      en: ['Stay under the radar line: cross it and you get burned.', 'Drop the bomb high and early.', 'You can now fly the FLIGHT LOG, in CAMPAIGN.'] } },
  // (21/11, el autor: "etapa de islas: fernetardo + virus rasante + carnavalitox + chamoide"): en ese orden, y vuelve a empezar
  { ...base, id: 'tut4', etapa: 4, name: 'LAS ISLAS', islas: true,
    musica: 'lista:original/fenretardo.mp3|original/Virus Rasante.m4a|original/Carnavalitox.mp3|original/Chamoide.m4a',
    desc: { es: 'Aprendé a sobrevolar las islas.', en: 'Learn to fly over the islands.' },
    // EN VUELO sobre el estrecho de San Carlos (islas.js INICIO), con bomba y el radar del pasillo; sin nafta (la Chancha
    // ya se enseño). Un solo tramo largo: la etapa la cierran los pasos, como las otras
    bomba: 'brp', dificultad: 'facil',
    aviones: [{ ...AVION[0], carga: 'tanques_bomba' }],
    cfg: P({ sky: 'cloudy', terrain: 'sea', start: 'air', carga: 'tanques_bomba', radar: 'normal' }), pasos: ETAPA4,
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

const LISTA = [
  escena('TUT1_HOLA',
    T(TURCO, 'turco_radio_sonrisa', 'Hola, Tero. Acá Turco. Ya ajusté las tuercas de tu pajarraco. Hoy te toca probarlo.'),
    T(PICHON, 'pichon_radio_orgullo', 'Hola Tero, yo voy a estar acá asistiendo. Leí el manual entero. Dos veces.'),
    T(TURCO, 'turco_radio_ceno', 'Los manuales no vuelan, changuito. Bueno, cuchá.')),
  escena('TUT1_DESPEGUE',
    T(TURCO, 'turco_radio_aprueba', 'Esto es gas. Apretá y levanta. Soltá y cae. Pa despegar, mantené hasta que agarre velocidad.'),
    T(PICHON, 'pichon_radio_explicando', 'A doscientos cincuenta kilómetros por hora, con el gas a fondo, levanta solo. Si lo soltás, se te acaba la pista.'),
    B(TURCO, 'turco_radio_desconfiado', 'Y la pista no se estira, ojo. Pero mandale nomá.')),
  escena('TUT1_DESPEGUE_OK', T(PICHON, 'pichon_radio_sonrisa', 'Exactamente, altura perfecta como dice el manual.')),
  escena('TUT1_GAS',
    B(TURCO, 'turco_radio_escucha', 'Este changuito con su manual... En el aire es lo mismo, apretao sube, soltá y baja.'),
    B(PICHON, 'pichon_radio_explicando', 'Técnicamente es combustible, pero está en inglés, no es gas. Y eso genera empuje. Sin empuje no hay sustentación, y sin sustentación…'),
    B(TURCO, 'turco_radio_ceno', '¿Ahí qué dice? Gas, chango. Dale Tero, subí.')),
  escena('TUT1_GAS_OK', T(TURCO, 'turco_radio_aprueba', 'Va, va. Bien, bien.')),
  escena('TUT1_PICADA',
    T(PICHON, 'pichon_radio_explicando', 'Para bajar rápido, mantenés y baja en picada. Mientras la aguja de la altura cae, el avión también. Cuidado con el agua.')),
  escena('TUT1_PICADA_OK', T(PICHON, 'pichon_radio_sonrisa', 'Muy bien. El mar está más cerca de lo que parece.')),
  escena('TUT1_RASANTE',
    T(PICHON, 'pichon_radio_explicando', 'Ahora bajito, pegado al agua. Así se vuela acá: al ras.'),
    T(TURCO, 'turco_radio_desconfiado', 'Sin tocar el agua, que si chocás a esa velocidad contra el agua, te hace pingo. Mandale gas de a poco.')),
  escena('TUT1_RASANTE_OK', T(TURCO, 'turco_radio_risa', 'E ura, así se vuela.')),
  escena('TUT1_SAL',
    T(TURCO, 'turco_radio_escucha', 'El vidrio... Mientras vas volando pegao al agua, se te llena el vidrio de sal. Tratá de atravesar algunas nubes con agua para limpiarlo.'),
    T(PICHON, 'pichon_radio_explicando', 'Subir solo no la saca: la costra queda pegada. Metete en la nube, que el agua te lava el vidrio.'),
    T(TURCO, 'turco_radio_desconfiado', 'En una misión de verdá, allá ashiba te ve el radar. Subís, te lavás y te volvés a bajar antes de que te llegue a detectar.'),
    B(PICHON, 'pichon_radio_pensativo', 'Mmmmm... Se me ocurre algo para probar. Bueno, buscá alguna nube mientras.')),
  escena('TUT1_SAL_OK', T(PICHON, 'pichon_radio_sonrisa', 'Ahí está. Ahora sí se ve mejor. Bajá, que te ven.')),
  escena('TUT1_HIELO',
    T(TURCO, 'turco_radio_preocupado', 'E ura, ¿sentís que el avión pesa? Ha sido el hielo: en la nube, con este frío, se te pega en las alas. Y el A-4 no tiene con qué sacarlo.'),
    T(PICHON, 'pichon_radio_explicando', 'Mirá el termómetro: con un grado o menos y humedad se junta hielo. Pesa y te quita sustentación, así que dale más gas.'),
    T(TURCO, 'turco_radio_aprueba', 'Bajá al ras del mar, que el aire de abajo es más templao y te lo derrite. O subí por encima de las nubes, que ahí es seco.'),
    // (21/11, el autor: "el clima general, aclararlo en una de las primeras etapas, la primera"; se fue de la etapa 4)
    T(PICHON, 'pichon_radio_explicando', 'Y el clima cambia todo el tiempo: el viento te sacude, la lluvia y la niebla te tapan, y el frío te traba cosas. Mirá el cielo antes de salir.')),
  escena('TUT1_HIELO_OK', T(PICHON, 'pichon_radio_sonrisa', 'Se derritió. Por eso volamos abajo, Tero.')),
  escena('TUT1_TABLERO',
    T(TURCO, 'turco_radio_aprueba', 'Ahora el tablero. En el medio, lo que cambia ligero: velocidá, horizonte, altura y gas.'),
    T(PICHON, 'pichon_radio_explicando', 'Lo demás se mira de reojo. Si algo se prende, es porque hay que mirarlo.'),
    B(TURCO, 'turco_radio_sonrisa', 'Los relojes los he calibrao yo. Todos son importantes.')),
  escena('TUT1_ESQUIVAR',
    T(PICHON, 'pichon_radio_explicando', 'Si algo viene de frente, simplemente esquivá deslizando hacia los costados.'),
    B(TURCO, 'turco_radio_sonrisa', 'Probá pa\' los dos lao, que el avión no es rengo.')),
  escena('TUT1_ESQUIVAR_OK', T(PICHON, 'pichon_radio_risa', '¡Perfecto! Bueno, casi. Pero perfecto.')),
  escena('TUT1_ROLAR',
    T(PICHON, 'pichon_radio_explicando', 'Y esto es rolar: girás el avión sobre su eje. El horizonte te dice cómo quedaste.'),
    T(TURCO, 'turco_radio_preocupado', 'Rolá pa\' los dos lao y volvé derecho, que me mareo desde acá.')),
  escena('TUT1_ROLAR_OK', T(TURCO, 'turco_radio_aprueba', 'Bien. No he vomitao.')),
  escena('TUT1_OLAS',
    T(TURCO, 'turco_radio_desconfiado', 'Ahí vienen unas olas. No son muchas, pero con una sola te deja el avión desfigurao.'),
    T(PICHON, 'pichon_radio_explicando', 'Las olas grandes suben más que tu altura. Esquivalas o pasales por arriba.')),
  escena('TUT1_OLAS_OK', T(PICHON, 'pichon_radio_sonrisa', 'Ni una pluma, Tero.')),
  escena('TUT1_TURBO',
    T(PICHON, 'pichon_radio_explicando', 'La poscombustión: combustible directo al escape. Mucha más velocidad, pero consume más del triple.'),
    T(TURCO, 'turco_radio_desconfiado', 'Por eso el reloj de la nafta ta al lao. Está pa mirar, que no lo he puesto de adorno.'),
    B(PICHON, 'pichon_radio_orgullo', 'No lo puso usted, Turco. Viene de fábrica.')),
  escena('TUT1_TURBO_OK', T(TURCO, 'turco_radio_ceno', 'Qué dice... Lo he ajustao yo, changuito.')),
  escena('TUT1_FIN',
    T(TURCO, 'turco_radio_sonrisa', 'Ashiba ta la ruta: cuánto falta pa llegar y pa’ dónde ir. Por hoy, estamo.'),
    B(PICHON, 'pichon_radio_pensativo', 'Mañana, las armas. Tengo unas ideas para el cañón…'),
    B(TURCO, 'turco_radio_ceno', 'Chango, ya te dije. Eso no se puede.')),
  escena('TUT1_FIN_OK', T(TURCO, 'turco_radio_escucha', '…pero... Mañana me mostrás.')),
  escena('TUT1_LIBRE',
    T(TURCO, 'turco_radio_sonrisa', 'Ahora volá lo que quierás, Tero. Practicá lo que te ha costao.'),
    T(PICHON, 'pichon_radio_explicando', 'Cuando quieras terminar, pausá y elegí TERMINAR ETAPA.')),
  escena('TUT2_HOLA',
    T(TURCO, 'turco_radio_desconfiado', 'Hoy, el cañón. Lo he limpiao anoche, así que no me lo ensuciés.'),
    B(PICHON, 'pichon_radio_risa', 'Pusimos unos globos de práctica sobre el agua. Bueno, el Turco los infló.'),
    B(TURCO, 'turco_radio_ceno', 'Yo los he inflao. Vos les has dibujao las caritas cajetas esas.')),
  escena('TUT2_CANON',
    T(TURCO, 'turco_radio_aprueba', 'El cañón tira pa\'delante, pa\' donde apunta la nariz. Ponete en la línea del globo y apretá.'),
    T(PICHON, 'pichon_radio_explicando', 'Alineado y altura, las dos cosas. Si el globo está más alto, subí un poquito antes de tirar.')),
  escena('TUT2_CANON_OK', T(TURCO, 'turco_radio_risa', 'Tres. Bieeeeen, uuraa.')),
  escena('TUT2_CALOR',
    T(PICHON, 'pichon_radio_explicando', 'El cañón calienta. Si tirás de corrido se traba hasta que se enfría: ese reloj te lo marca.'),
    T(TURCO, 'turco_radio_sonrisa', 'Probalo, chango. Mete fuego hasta que trabe, que lo quiero escuchar.'),
    // EL CAÑON CON FRIO (20/11, data/frio.js CANON_T): se dice, no se practica
    T(PICHON, 'pichon_radio_pensativo', 'Y con frío fuerte, allá arriba, se traba antes: la humedad se congela en el aire que lo hace andar.')),
  escena('TUT2_CALOR_OK', T(PICHON, 'pichon_radio_orgullo', '¿Ves? Se enfría solo. Ráfagas cortas, Tero.')),
  escena('TUT2_MOVILES',
    T(PICHON, 'pichon_radio_explicando', 'Ahora el viento los mueve. No tires adonde está: tirá adonde va a estar.'),
    T(TURCO, 'turco_radio_desconfiado', 'Y no te le pegués tanto, que si lo chocás te hace aca.')),
  escena('TUT2_MOVILES_OK', T(TURCO, 'turco_radio_aprueba', 'Eso. Ahí va nomá.')),
  escena('TUT2_HARRIER',
    T(TURCO, 'turco_radio_grito', 'E ura, ahí vienen los Harriers. Estos quieren tu espalda, desde atra\' tirarte el sidewinder.'),
    T(TURCO, 'turco_radio_escucha', 'Por eso prefieren venir rápido de frente y ganarte la espalda. Tratá de dispararles de frente.'),
    T(PICHON, 'pichon_radio_alerta', 'Vienen de frente, muy rápido, y se te corren al carril. Ponete en su línea y disparales antes de que te pasen.')),
  escena('TUT2_HARRIER_OK', T(PICHON, 'pichon_radio_sorpresa', '¡Abajo! Y eso que venían a ochocientos.')),
  escena('TUT2_TONEL',
    T(PICHON, 'pichon_radio_explicando', 'Estos vienen armados. Cuando el misil esté cerca, hacé el tonel: el avión gira completo sobre su eje, ocupa menos lugar y el misil se pasa de largo.'),
    T(PICHON, 'pichon_radio_explicando', 'Se hace con DOS toques rápidos para el mismo lado: derecha-derecha o izquierda-izquierda. Tocá y soltá, no mantengas.'),
    T(TURCO, 'turco_radio_desconfiado', '…A ver... Probá, ura.')),
  escena('TUT2_TONEL_OK', T(TURCO, 'turco_radio_risa', 'Bieeeen, uraaa.')),
  escena('TUT2_RASANTE',
    T(PICHON, 'pichon_radio_explicando', 'Ahora el RASANTE. Bajá hasta que arriba del avión diga PERFECTO y aguantá cuatro segundos sin tocar el agua.'),
    T(TURCO, 'turco_radio_aprueba', 'Ahí aparece una barrita con un cachito azul y una marquita que va y viene. Hay que embocarle con el gas cuando pasa por lo azul.'),
    T(PICHON, 'pichon_radio_neutro', 'Cada toque bueno es un segundo de poder y vuelve a llenar la barra naranja de abajo. Tocar afuera la quema.'),
    T(TURCO, 'turco_radio_desconfiado', 'Cuando lo activás: picá, o mantené el gas un segundo. Si se te vacía la barra, sale solo.')),
  escena('TUT2_RASANTE_OK', T(PICHON, 'pichon_radio_risa', '¡Eso es RASANTE! El avión se mantiene al ras del agua. Dura lo que juntaste: mirá la barra azul.')),
  escena('TUT2_RAS_ESQUIVA',
    T(TURCO, 'turco_radio_escucha', 'Las olas chicas las cruzás, pero no te hace inmortal: ahí vienen unos globos al ras. Esquivalos.')),
  escena('TUT2_RAS_ESQUIVA_OK', T(TURCO, 'turco_radio_aprueba', 'Eso. Ha sido que más aciertos, más rasante. Ese es el negocio.')),
  escena('TUT2_MOMENTUM',
    T(TURCO, 'turco_radio_sonrisa', 'Ahora concentración extrema. El changuito le dice diferente. El tiempo se te pone lento y te deja pensar. Es una habilidad que ganás con tiempo.'),
    T(PICHON, 'pichon_radio_orgullo', 'Se le dice momentum. Lo lográs luego de un rato volando bien. Guardalo para cuando se complica y necesitás "ralentizar el tiempo".')),
  escena('TUT2_MOMENTUM_LISTO',
    T(PICHON, 'pichon_radio_alerta', 'Se llenó la barra: el momentum está listo otra vez. Lanzalo y esquivá los globos con el tiempo lento.')),
  escena('TUT2_MOMENTUM_OK', T(PICHON, 'pichon_radio_risa', 'Lindo, ¿no? De película. Una locura esquivar las balas así.')),
  escena('TUT2_DANO',
    T(TURCO, 'turco_radio_escucha', 'Si te pegan, lo sufre la chapa: ese reloj es la salud del avión. Si baja mucho, volvé.'),
    T(PICHON, 'pichon_radio_explicando', 'Y la nafta: hoy no la gastamos, pero en una misión de verdad es lo que te trae de vuelta.'),
    B(TURCO, 'turco_radio_sonrisa', 'El que te trae de vuelta soy yo, que les arreglo los pajarracos hechos pingo.')),
  escena('TUT2_FIN',
    T(TURCO, 'turco_radio_aprueba', 'Mañana... metemos bomba.'),
    B(PICHON, 'pichon_radio_pensativo', 'Tengo una idea para esquivar la antiaérea, Turco. Una nueva maniobra…'),
    B(TURCO, 'turco_radio_escucha', 'Chango…')),
  escena('TUT2_FIN_OK', T(PICHON, 'pichon_radio_corregido', 'Ya sé, ya sé. Pero mañana le muestro.')),
  escena('TUT1_PAUSA',
    T(TURCO, 'turco_radio_aprueba', 'Una cosita más. Si te olvidás de algo, podés pausar. Ahí ta todo ordenao.'),
    B(PICHON, 'pichon_radio_sonrisa', 'Sí. Los armé yo. Te dejé todos los controles ordenados por categoría.'),
    B(TURCO, 'turco_radio_aprueba', 'Lo hemo armao con el changuito. Pega una mirada.')),
  escena('TUT1_PAUSA_OK', T(TURCO, 'turco_radio_sonrisa', 'Bien. Seguimo.')),
  escena('TUT3_HOLA',
    T(TURCO, 'turco_radio_desconfiado', 'Hoy la pasada de verdá. Te he colgao una bomba de práctica. Pesa como una de verdá, así que ojo.'),
),
  escena('TUT3_RADAR',
    T(PICHON, 'pichon_radio_explicando', 'Antes del buque, el radar inglés. Barre hasta una altura: es el nivel del radar, la marca roja del altímetro.'),
    T(TURCO, 'turco_radio_desconfiado', 'Si cruzás, te quema. Subí un poquito pa\' verlo, y bajá rápido.'),
    B(PICHON, 'pichon_radio_orgullo', 'Por eso volamos al ras, Tero. Por debajo del radar, no existimos...')),
  escena('TUT3_RADAR_OK', T(TURCO, 'turco_radio_aprueba', '¿Viste? El radar avisa cuando empieza a detectar algo y luego se activa. Tenés poco tiempo pa\' bajar al ras del agua y mantenerte oculto.')),
  escena('TUT3_SECUND',
    T(TURCO, 'turco_radio_escucha', 'Abajo a la derecha están las armas secundarias: tanques de combustible y bomba. Podés elegir cualquiera y soltar. También está el arma rápida, que son las chafitas. Las lanzás.'),
    T(PICHON, 'pichon_radio_explicando', 'Probá: pasá a los tanques y volvé a la bomba, que la vas a necesitar.')),
  escena('TUT3_SECUND_OK', T(TURCO, 'turco_radio_aprueba', 'Bien. Tratá de no soltar los tanques en vez de la bomba. Soltar todo te hace liviano, y te da velocidad. Pero te quedás sin nada.')),
  escena('TUT3_NAFTA',
    T(PICHON, 'pichon_radio_preocupado', 'Mirá la nafta: te queda poca. La poscombustión y el vuelo al ras la gastan más.'),
    T(TURCO, 'turco_radio_aprueba', 'Sin nafta no volvés. Pero pa\' eso está la Chancha. Ese es el indicador.')),
  escena('TUT3_CHANCHA',
    T(TURCO, 'turco_radio_sonrisa', 'La Chancha es el Hércules cisterna reabastecedor. La llamás y recargás en vuelo.'),
    T(PICHON, 'pichon_radio_explicando', 'Ponete detrás y abajo de la manguera, quietito, y carga sola.')),
  escena('TUT3_CHANCHA_OK', T(TURCO, 'turco_radio_risa', 'La Chancha no falla nunca. Bueno, casi nunca.')),
  escena('TUT3_BLANCO',
    T(PICHON, 'pichon_radio_alerta', 'Ahí está el buque. La bomba tiene que caer más de un segundo para armarse: soltala alta y temprano. Prestá atención a la marca verde.'),
    T(TURCO, 'turco_radio_sonrisa', 'Con el joystick: mantené el stick derecho pa\' abajo y aparece la mira, que te muestra dónde cae. Sin soltarlo, hundí el stick, el R3, y sale. Con teclado, F y ESPACIO.'),
    T(PICHON, 'pichon_radio_preocupado', 'Y si errás, otra pasada. El casco no se va a ningún lado.')),
  escena('TUT3_ESCAPE',
    T(PICHON, 'pichon_radio_risa', '¡Bien! ¡Le diste!'),
    T(TURCO, 'turco_radio_grito', 'Ahora escapá rápido de la zona, pegao al agua, que te tiran desde el buque.')),
  escena('TUT3_BLANCO_OK', T(PICHON, 'pichon_radio_risa', '¡Le diste! Ahora, a casa.')),
  escena('TUT3_PIRUETAS',
    T(PICHON, 'pichon_radio_sonrisa', 'Y el tonel no es la única. En la pausa están las demás piruetas.'),
    B(TURCO, 'turco_radio_ceno', 'Ni las mirés, Tero. Cerrá y volvé entero, no desfigurao.')),
  escena('TUT3_PIRUETAS_OK', T(PICHON, 'pichon_radio_pensativo', 'Algún día las probamos todas.')),
  escena('TUT3_APROX',
    T(PICHON, 'pichon_radio_explicando', 'La pista. Con el gas regulás: poco gas y el avión baja; mucho, y flota. Llegá despacio.'),
    T(TURCO, 'turco_radio_desconfiado', 'Y el tren abajo antes de tocar, que la panza la enderezo yo.')),
  escena('TUT3_APROX_OK', T(TURCO, 'turco_radio_sonrisa', 'En casa. Entero, más o menos.')),
  escena('TUT3_FIN',
    T(TURCO, 'turco_radio_sonrisa', 'Bueno, Tero. Ya sabés lo básico. Esta noche le pinto la estrellita, y mañana lo sabe todo el bashio.'),
    B(PICHON, 'pichon_radio_orgullo', 'La primera. Y mañana, la guerra de verdad.'),
    B(TURCO, 'turco_radio_aprueba', 'Mañana, changuito. Hoy, mate.')),
  escena('TUT3_FIN_OK', T(PICHON, 'pichon_radio_sonrisa', 'Yo cebo.')),
  // LA ETAPA 4 · LAS ISLAS (borrador del 20/11: espera las correcciones del autor, como las otras)
  escena('TUT4_HOLA',
    T(TURCO, 'turco_radio_sonrisa', 'Ahora llegaste a las islas, Tero. Acá podés moverte libremente, pa\' donde quieras. Ojo, que el suelo sube y baja.'),
    T(PICHON, 'pichon_radio_explicando', 'Lo que aprendiste vale igual. Ahora virás y elegís vos para dónde ir.')),
  escena('TUT4_RUMBO',
    T(PICHON, 'pichon_radio_explicando', 'Donde estaba el mach ahora va la brújula: tu rumbo y para dónde queda el objetivo.'),
    T(TURCO, 'turco_radio_aprueba', 'Virá pa\' los dos lao y mirá cómo gira la brújula.')),
  escena('TUT4_RUMBO_OK', T(TURCO, 'turco_radio_risa', 'Eso. Ya sabés pa\' dónde va la nariz.')),
  escena('TUT4_RELIEVE',
    T(TURCO, 'turco_radio_desconfiado', 'Ojo, que acá la altura se mide desde el suelo de abajo. Si viene un cerro, se te come la altura y te hace pingo.'),
    T(PICHON, 'pichon_radio_explicando', 'Volá pegado al relieve, por debajo del nivel del radar. Si el suelo sube de golpe, dale gas antes.')),
  escena('TUT4_RELIEVE_OK', T(PICHON, 'pichon_radio_sonrisa', 'Así. El cerro también te tapa del radar.')),
  escena('TUT4_RADAR',
    T(PICHON, 'pichon_radio_alerta', 'Los radares ingleses tienen su zona: la bahía San Carlos y los buques de piquete. Adentro, arriba de veinte metros, te ven.'),
    T(TURCO, 'turco_radio_aprueba', 'Y cerca de Puerto Argentino es nuestra cobertura: ahí los Harrier no se meten.')),
  escena('TUT4_HARRIER',
    T(TURCO, 'turco_radio_grito', 'Si te ven, sale la patrulla de Harrier culiaos a buscarte la cola. La flecha roja te dice de dónde vienen.'),
    T(PICHON, 'pichon_radio_explicando', 'Las ráfagas se esquivan cambiando de línea. Y el Sidewinder viene de cola: rompé y bajá.')),
  escena('TUT4_CLIMA',
    T(PICHON, 'pichon_radio_pensativo', 'El tiempo acá cambia solo: llovizna, temporal, nevisca, niebla. Y el viento del oeste te sacude.'),
    T(TURCO, 'turco_radio_preocupado', 'Con frío y humedad se te junta hielo, como en la nube. Mirá el termómetro y buscá aire más templao.')),
  escena('TUT4_MAPA',
    T(PICHON, 'pichon_radio_explicando', 'Con la M, o desde la pausa, abrís el mapa. Marcá un punto y la brújula te lleva ahí.'),
    T(TURCO, 'turco_radio_sonrisa', 'Marcá la base costera, que la vamo\' a visitar.')),
  escena('TUT4_MAPA_OK', T(TURCO, 'turco_radio_aprueba', 'Bien. Ahora seguí la brújula.')),
  escena('TUT4_BLANCO',
    T(PICHON, 'pichon_radio_explicando', 'La base costera: seguí la brújula, entrá bajo y soltá la bomba alta y temprano, como con el buque.'),
    T(TURCO, 'turco_radio_desconfiado', 'Y no te quedés dando vueltas encima, que te ven.')),
  escena('TUT4_BLANCO_OK', T(PICHON, 'pichon_radio_risa', '¡Le diste a la base!')),
  escena('TUT4_EYECCION',
    T(TURCO, 'turco_radio_preocupado', 'Una más, y ojalá no la usés nunca. Si te quedás sin nafta o el avión no da más, eyectate.'),
    T(PICHON, 'pichon_radio_explicando', 'Sostené los dos rolidos juntos. Si caés en tierra te rescatan; en el mar es otra historia.')),
  escena('TUT4_FIN',
    T(TURCO, 'turco_radio_sonrisa', 'Bueno, Tero. Ya conocés las islas. Esta noche te pinto otra estrellita.'),
    T(PICHON, 'pichon_radio_orgullo', 'Ahora sí, lo sabés todo.')),
  escena('TUT4_FIN_OK', T(TURCO, 'turco_radio_aprueba', 'Volvé entero, changuito. Hay mate.')),
  // LOS AVISOS: el avion no se cae, pero el golpe se comenta (una al azar, sin repetir la anterior)
  banco('AV_TUT_AGUA',
    T(TURCO, 'turco_radio_grito', '¡El mar, Tero! Pegao, sí. Adentro, no.'),
    T(PICHON, 'pichon_radio_alerta', 'Eso fue agua salada. ¡Gas, gas, gas!'),
    T(TURCO, 'turco_radio_ceno', 'Se hizo aca la chapa. Dejá, la enderezo yo después. Subí, carnero.')),
  banco('AV_TUT_CHOQUE',
    T(TURCO, 'turco_radio_escucha', 'Eso ha sido el viento. Seguí.'),
    T(PICHON, 'pichon_radio_duda', 'No había viento, Turco. Mirá adelante, Tero.'),
    T(TURCO, 'turco_radio_ceno', '¿Qué asimo, Tero? Otro golpe así y te cobro la chapa.')),
  // LA PISTA SE TERMINO antes de levantar: se dicen en orden, una por intento
  banco('AV_TUT_PISTA',
    T(TURCO, 'turco_radio_ceno', '¡Se te ha acabao la pista! Va de nuevo. Y no solté el gas, carnero.'),
    T(PICHON, 'pichon_radio_explicando', 'Te faltó velocidad, Tero. Gas a fondo desde el principio, y sostenido.'),
    T(TURCO, 'turco_radio_grito', 'No lo largué. Hasta ashiiiiba.')),
  banco('AV_TUT_ERRO',
    T(PICHON, 'pichon_radio_preocupado', 'Erraste. Soltala más temprano, que la bomba sigue de largo con tu velocidad.'),
    T(TURCO, 'turco_radio_sonrisa', 'Intentemo otra pasada. Ese casco no se va a ningún lao.'),
    T(PICHON, 'pichon_radio_explicando', 'Más alto, Tero: si cae menos de un segundo, no se arma.')),
  // ROZAR EL AGUA (sin chocar): game.js lo comenta cada tanto
  banco('AV_TUT_ROCE',
    T(TURCO, 'turco_radio_preocupado', '¡Cuidao, cuidao!'),
    T(PICHON, 'pichon_radio_nervioso', 'Estás rozando. Subí un palmo.'),
    T(TURCO, 'turco_radio_desconfiado', 'Tené cuidao, que la sal se come la chapa.')),
  banco('AV_TUT_PISO',
    T(TURCO, 'turco_radio_grito', '¿Qué hacé vo? Tero, si me hacés pingo al avión te hago aca, carnero.')),
];

export const TUT_SCENES = Object.fromEntries(LISTA.map(s => [s.id, s]));
