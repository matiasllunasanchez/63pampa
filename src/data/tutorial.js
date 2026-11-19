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
  start: 'runway', cliff: false, coast: 230, ...over });

const MAR = ['ola', 'birds'];

// UNA SOLA FASE, SIN DENSIDAD: la siembra la manda cada paso (`obstacles`, que game.js escribe en cfg).
const FASES = [{ tipo: 'rasante', hasta: 1, solo: MAR, bombs: 0, bidones: false }];

// TERO SOLO EN EL A-4B (autor, 17/11; era Esteban hasta el 18/11). `squad: 1`: sin escuadrilla, sin relevo.
const AVION = [{ chapa: 'TERO', plane: 'sky', carga: 'tanques', cargaTxt: '', squad: 1 }];

// EL OBJETIVO NO CIERRA LA ETAPA: la cierran los pasos. Por eso es lejisimo — nunca se llega volando.
const LEJOS = { kind: 'distance', meters: 400000 };

const base = {
  despegue: { desde: 'BASE AÉREA MILITAR RÍO GALLEGOS', rumbo: 'vuelo de instrucción' },
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
  { dice: 'TUT1_GAS', foco: ['gas', 'alt'], teclas: ['Gas'],
    sigue: [{ altSobre: 30, consigna: 'tutC_subi' }], remate: 'TUT1_GAS_OK' },
  { dice: 'TUT1_PICADA', foco: ['alt'], teclas: ['Dive'],
    sigue: [{ altBajo: 12, consigna: 'tutC_baja' }], remate: 'TUT1_PICADA_OK' },
  // (SIN RADAR en la etapa 1, 18/11: el autor, "el tutorial no tiene que mostrar todo el potencial del juego". El
  // paso es volar bajito sin tocar el agua; el techo del radar se aprende en la campaña)
  { dice: 'TUT1_RASANTE', foco: ['alt'], teclas: ['Gas'],
    sigue: [{ bajoTecho: 8, consigna: 'tutC_rasante' }], remate: 'TUT1_RASANTE_OK' },
  { dice: 'TUT1_TABLERO', foco: ['vel', 'horizonte', 'alt', 'gas'] },
  { dice: 'TUT1_ESQUIVAR', teclas: ['Fly'],
    sigue: [{ usa: ['l', 'r'], consigna: 'tutC_esquivar' }], remate: 'TUT1_ESQUIVAR_OK' },
  { dice: 'TUT1_ROLAR', foco: ['horizonte'], teclas: ['Roll'],
    sigue: [{ usa: ['rollL', 'rollR'], consigna: 'tutC_rolar' }], remate: 'TUT1_ROLAR_OK' },
  // (solo OLAS y pocas: sin pajaros ni nada mas, 18/11 — "no tantos enemigos, y menos en la primera etapa")
  { dice: 'TUT1_OLAS', obstacles: 0.9,
    sigue: [{ pasa: 6, consigna: 'tutC_pasa' }], remate: 'TUT1_OLAS_OK' },
  { dice: 'TUT1_TURBO', foco: ['vel'], teclas: ['Boost'],
    sigue: [{ usa: ['turbo'], consigna: 'tutC_turbo' }], remate: 'TUT1_TURBO_OK' },
  // LA PAUSA GUIADA: el juego abre la pausa en CONTROLES, y para seguir hay que cerrarla
  { dice: 'TUT1_PAUSA', teclas: ['Pause'], abre: 'movilidad',
    sigue: [{ cierra: true, consigna: 'tutC_pausa' }], remate: 'TUT1_PAUSA_OK' },
  { dice: 'TUT1_FIN', foco: ['ruta'], remate: 'TUT1_FIN_OK' },
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
  { dice: 'TUT2_HARRIER', teclas: ['Gun'], blancos: { tipo: 'jet', n: 1 },
    sigue: [{ rompe: 1, consigna: 'tutC_harrier' }], remate: 'TUT2_HARRIER_OK' },
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
  { dice: 'TUT3_BLANCO', cuando: { faltan: 0.35 }, foco: ['alt', 'rack'], teclas: ['Msl', 'Aim'],
    sigue: [{ suelta: true, consigna: 'tutC_suelta' }, { hunde: true, consigna: 'tutC_hunde' }], remate: 'TUT3_BLANCO_OK' },
  // EN LA VUELTA (que se estira hasta practicarlo: game.js no deja aterrizar antes)
  { dice: 'TUT3_TONEL', cuando: { vuelta: true }, teclas: ['Tonel'], sigue: [{ maniobra: 'tonel', consigna: 'tutC_tonel' }], remate: 'TUT3_TONEL_OK' },
  { dice: 'TUT3_PIRUETAS', abre: 'piruetas',
    sigue: [{ cierra: true, consigna: 'tutC_pausa' }], remate: 'TUT3_PIRUETAS_OK' },
  // (sin foco: en la aproximacion el tablero es otro —VEL, DESC, TREN— y los huecos del HUD de vuelo quedan vacios)
  { dice: 'TUT3_APROX', cuando: { aterrizando: true }, teclas: ['Gas', 'Dive', 'Tren'],
    sigue: [{ tren: true, consigna: 'tutC_tren' }, { aterriza: true, consigna: 'tutC_aterriza' }], remate: 'TUT3_APROX_OK' },
  { dice: 'TUT3_FIN', remate: 'TUT3_FIN_OK' },
];

export const TUTORIAL_ETAPAS = [
  { ...base, id: 'tut1', etapa: 1, name: 'DESPEGAR Y VOLAR', despegueJugable: true,
    desc: { es: 'Gas, altura, el radar y el agua. Lo justo para no caerse.', en: 'Throttle, altitude, radar and the sea. Just enough not to fall.' },
    // (su propia fase: SOLO OLAS — sin pajaros ni nada mas en la primera etapa)
    fases: [{ tipo: 'rasante', hasta: 1, solo: ['ola'], bombs: 0, bidones: false }],
    cfg: P({ sky: 'dawn', terrain: 'sea' }), pasos: ETAPA1 },
  // (las etapas 2 y 3 todavia son el tramo vacio de la fase 1: sus pasos llegan en las fases 4 y 5)
  { ...base, id: 'tut2', etapa: 2, name: 'PELEAR',
    desc: { es: 'El cañón, el calor y un Harrier de práctica.', en: 'The cannon, the heat and a practice Harrier.' },
    cfg: P({ sky: 'clear', terrain: 'sea' }), pasos: ETAPA2 },
  { ...base, id: 'tut3', etapa: 3, name: 'LA PASADA Y LA VUELTA',
    desc: { es: 'La bomba, el tonel, la vuelta y el aterrizaje.', en: 'The bomb, the barrel roll, the way home and the landing.' },
    // EL BUQUE: un casco viejo, quieto y sin defensa, y todas las pasadas que hagan falta. Con vuelta: al
    // pegarle se vuelve, y al llegar, la aproximacion final de siempre (systems/fases.js `llegaste`)
    goal: { kind: 'ship', ship: 'CASCO DE PRÁCTICA', dist: 4200 }, climax: 'suelta', pasadas: 99, defensa: null,
    fases: [
      { tipo: 'transito', hasta: 0.2, solo: MAR, bombs: 0, bidones: false },
      { tipo: 'rasante', hasta: 0.85, solo: MAR, bombs: 0, bidones: false },
      { tipo: 'blanco', hasta: 1, solo: MAR, bombs: 0, bidones: false },
      { tipo: 'vuelta', hasta: 1.45, obstacles: 0, caza: 0, bombs: 0, bidones: false },
    ],
    aviones: [{ ...AVION[0], carga: 'tanques_bomba' }],
    cfg: P({ sky: 'dusk', terrain: 'sea', carga: 'tanques_bomba', radar: 'normal' }), pasos: ETAPA3 },
];

// ---------------------------------------------------------------------------------------------
// LO QUE DICEN (borrador). Mismo formato que data/story.js; game.js las suma a SCENES.
const T = (personaje, cara, es) => ({ personaje, cara, hold: 0, es, en: '' });
const TURCO = 'EL TURCO', PICHON = 'PICHÓN';
const escena = (id, ...lineas) => ({ id, tipo: 'LECCION', titulo: id,
  lineas: lineas.map((l, i) => ({ id: id + '_' + String((i + 1) * 10).padStart(3, '0'), ...l })) });
const banco = (id, ...lineas) => ({ ...escena(id, ...lineas), tipo: 'AVISO' });

const LISTA = [
  escena('TUT1_HOLA',
    T(TURCO, 'turco_neutro', 'Buen día, Tero. Soy el Turco, el que le ajusta las tuercas a este pájaro. Hoy le enseño a volarlo.'),
    T(PICHON, 'pichon_sonrisa', 'Y yo le explico por qué vuela, Turco. Me leí el manual entero. Dos veces.'),
    T(TURCO, 'turco_ceno', 'El manual no lo armó nadie, changuito. Bueno, Tero: escuchá.')),
  escena('TUT1_DESPEGUE',
    T(TURCO, 'turco_neutro', 'Esto es el gas. Apretalo y no lo sueltes: el avión agarra velocidad por la pista.'),
    T(PICHON, 'pichon_neutro', 'A doscientos cincuenta kilómetros por hora, con el gas a fondo, levanta solo. Si lo soltás, se te acaba la pista.'),
    T(TURCO, 'turco_ceno', 'Y la pista no la alargo, changuito. Dale.')),
  escena('TUT1_DESPEGUE_OK', T(PICHON, 'pichon_sonrisa', '¡Arriba! Exactamente como en el manual.')),
  escena('TUT1_GAS',
    T(TURCO, 'turco_neutro', 'En el aire es igual: mientras tengas el gas apretado, el avión sube. Lo soltás, y se viene abajo.'),
    T(PICHON, 'pichon_neutro', 'Técnicamente es empuje, no gas. Sin empuje no hay sustentación, y sin sustentación…'),
    T(TURCO, 'turco_ceno', 'Gas, m\'hijo. Subí, que te quiero ver.')),
  escena('TUT1_GAS_OK', T(TURCO, 'turco_sonrisa', 'Ahí está. Y ni un golpecito le tuve que dar.')),
  escena('TUT1_PICADA',
    T(PICHON, 'pichon_neutro', 'Para bajar rápido, picada. La aguja de la altura cae y el agua sube. Con cuidado.')),
  escena('TUT1_PICADA_OK', T(PICHON, 'pichon_sonrisa', 'Muy bien. El mar está más cerca de lo que parece.')),
  escena('TUT1_RASANTE',
    T(PICHON, 'pichon_neutro', 'Ahora bajito, pegado al agua. Así se vuela acá: al ras.'),
    T(TURCO, 'turco_neutro', 'Pero sin tocarla, que el mar te come entero. Gas de a toques.')),
  escena('TUT1_RASANTE_OK', T(TURCO, 'turco_sonrisa', 'Así se vuela, changuito. Como si el agua te debiera plata.')),
  escena('TUT1_TABLERO',
    T(TURCO, 'turco_neutro', 'Ahora el tablero. En el medio, lo que cambia rápido: velocidad, horizonte, altura y gas.'),
    T(PICHON, 'pichon_neutro', 'Lo demás se mira de reojo. Si algo se prende, es porque hay que mirarlo.'),
    T(TURCO, 'turco_ceno', 'Esos relojes los calibré yo. No me los discutas.')),
  escena('TUT1_ESQUIVAR',
    T(PICHON, 'pichon_neutro', 'Para correrte de algo, esquivá: el avión se desliza a un costado sin perder el rumbo.'),
    T(TURCO, 'turco_neutro', 'Probá para los dos lados, que el avión no es rengo.')),
  escena('TUT1_ESQUIVAR_OK', T(PICHON, 'pichon_sonrisa', '¡Perfecto! Bueno, casi. Pero perfecto.')),
  escena('TUT1_ROLAR',
    T(PICHON, 'pichon_neutro', 'Y esto es rolar: girás el avión sobre su eje. El horizonte te dice cómo quedaste.'),
    T(TURCO, 'turco_ceno', 'Rolá para los dos lados y volvé derecho, que me mareo desde acá.')),
  escena('TUT1_ROLAR_OK', T(TURCO, 'turco_neutro', 'Bien. No vomité.')),
  escena('TUT1_OLAS',
    T(TURCO, 'turco_neutro', 'Ahí vienen unas olas. No son muchas, pero alcanza con una para mojarte el avión.'),
    T(PICHON, 'pichon_neutro', 'Las olas grandes suben más que tu altura. Esquivalas o pasales por arriba.')),
  escena('TUT1_OLAS_OK', T(PICHON, 'pichon_sonrisa', 'Ni una pluma, Tero.')),
  escena('TUT1_TURBO',
    T(PICHON, 'pichon_neutro', 'La poscombustión: combustible directo al escape. Mucha más velocidad, pero consume más del triple.'),
    T(TURCO, 'turco_neutro', 'Por eso el reloj de la nafta está al lado. Miralo, que no lo puse de adorno.'),
    T(PICHON, 'pichon_neutro', 'No lo puso usted, Turco. Viene de fábrica.')),
  escena('TUT1_TURBO_OK', T(TURCO, 'turco_ceno', 'Lo ajusté yo, changuito.')),
  escena('TUT1_FIN',
    T(TURCO, 'turco_neutro', 'Arriba tenés la ruta: cuánto falta y para dónde. Por hoy, alcanza.'),
    T(PICHON, 'pichon_sonrisa', 'Mañana, las armas. Tengo unas ideas para el cañón…'),
    T(TURCO, 'turco_ceno', 'Pibe, eso no se puede.')),
  escena('TUT1_FIN_OK', T(TURCO, 'turco_neutro', '…A ver. Mañana me mostrás.')),
  escena('TUT2_HOLA',
    T(TURCO, 'turco_neutro', 'Hoy, el cañón. Lo limpié anoche, así que no me lo ensucies de balde.'),
    T(PICHON, 'pichon_sonrisa', 'Pusimos unos globos de práctica sobre el agua. Bueno, el Turco los infló.'),
    T(TURCO, 'turco_ceno', 'Yo los inflé. Vos les dibujaste las caritas.')),
  escena('TUT2_CANON',
    T(TURCO, 'turco_neutro', 'El cañón tira para adelante, para donde apunta la nariz. Ponete en la línea del globo y apretá.'),
    T(PICHON, 'pichon_neutro', 'Costado y altura, las dos cosas. Si el globo está más alto, subí un poquito antes de tirar.')),
  escena('TUT2_CANON_OK', T(TURCO, 'turco_sonrisa', 'Tres. Ni uno se escapó.')),
  escena('TUT2_CALOR',
    T(PICHON, 'pichon_neutro', 'El cañón calienta. Si tirás de corrido se traba hasta que se enfría: ese reloj te lo marca.'),
    T(TURCO, 'turco_ceno', 'Probalo. Tirá hasta que se trabe, que lo quiero escuchar.')),
  escena('TUT2_CALOR_OK', T(PICHON, 'pichon_sonrisa', '¿Ves? Se enfría solo. Ráfagas cortas, Tero.')),
  escena('TUT2_MOVILES',
    T(PICHON, 'pichon_neutro', 'Ahora el viento los mueve. No tires adonde está: tirá adonde va a estar.'),
    T(TURCO, 'turco_neutro', 'Y no te le pegues tanto, que si lo chocás lo pago yo.')),
  escena('TUT2_MOVILES_OK', T(TURCO, 'turco_neutro', 'Eso. Con calma.')),
  escena('TUT2_HARRIER',
    T(TURCO, 'turco_neutro', 'Ahí viene un Harrier de práctica. No tira y vuela derecho.'),
    T(PICHON, 'pichon_neutro', 'Viene de frente y muy rápido. Ponete en su línea y disparale antes de que te pase.')),
  escena('TUT2_HARRIER_OK', T(PICHON, 'pichon_sonrisa', '¡Abajo! Y eso que venía a ochocientos.')),
  escena('TUT2_DANO',
    T(TURCO, 'turco_neutro', 'Si te pegan, lo sufre la chapa: ese reloj es la salud del avión. Si baja mucho, volvé.'),
    T(PICHON, 'pichon_neutro', 'Y la nafta: hoy no la gastamos, pero en una misión de verdad es lo que te trae de vuelta.'),
    T(TURCO, 'turco_ceno', 'Lo que te trae de vuelta soy yo, que te lo arreglo.')),
  escena('TUT2_FIN',
    T(TURCO, 'turco_neutro', 'Mañana, la pasada de verdad. Con bomba.'),
    T(PICHON, 'pichon_sonrisa', 'Tengo una idea para esquivar la antiaérea, Turco. Una maniobra…'),
    T(TURCO, 'turco_ceno', 'Pibe…')),
  escena('TUT2_FIN_OK', T(PICHON, 'pichon_neutro', 'Ya sé. Mañana le muestro.')),
  escena('TUT1_PAUSA',
    T(TURCO, 'turco_neutro', 'Una cosa más. Si te olvidás de algo, pausá: ahí están todos los controles, ordenaditos.'),
    T(PICHON, 'pichon_sonrisa', 'Por categoría. Lo armé yo, Turco.'),
    T(TURCO, 'turco_ceno', 'Lo armamos. Mirá y cerrá, Tero, que se enfría el motor.')),
  escena('TUT1_PAUSA_OK', T(TURCO, 'turco_neutro', 'Bien. Seguimos.')),
  escena('TUT3_HOLA',
    T(TURCO, 'turco_neutro', 'Hoy la pasada de verdad. Te colgué una bomba de práctica. Pesa como una de verdad, así que ojo.'),
    T(PICHON, 'pichon_sonrisa', 'Y a la vuelta, la maniobra que le conté, Turco.'),
    T(TURCO, 'turco_ceno', 'Pibe, eso no se puede.')),
  escena('TUT3_TONEL',
    T(PICHON, 'pichon_neutro', 'Se llama tonel: el avión gira completo sobre su eje y por un momento ocupa menos lugar. Sirve para pasar entre las balas.'),
    T(TURCO, 'turco_neutro', '…A ver. Mostrame, Tero.')),
  escena('TUT3_TONEL_OK', T(TURCO, 'turco_sonrisa', 'Lo que yo decía. Se puede.')),
  escena('TUT3_RADAR',
    T(PICHON, 'pichon_neutro', 'Antes del buque, el radar inglés. ¿Ves la raya roja en la altura? Arriba de esa raya, te ven.'),
    T(TURCO, 'turco_neutro', 'Subí un poquito y mirá cómo se te pone todo rojo. Después bajá, rapidito.'),
    T(PICHON, 'pichon_sonrisa', 'Por eso volamos al ras, Tero. Es lo único que nos esconde.')),
  escena('TUT3_RADAR_OK', T(TURCO, 'turco_sonrisa', 'Eso. Abajo de la raya no existís.')),
  escena('TUT3_BLANCO',
    T(PICHON, 'pichon_neutro', 'Ahí está el buque. La bomba tiene que caer más de un segundo para armarse: soltala alta y temprano.'),
    T(TURCO, 'turco_neutro', 'Elegís la bomba y la soltás. Con la mira apretada ves dónde va a caer.'),
    T(PICHON, 'pichon_preocupado', 'Y si errás, otra pasada. El casco no se va a ningún lado.')),
  escena('TUT3_BLANCO_OK', T(PICHON, 'pichon_sonrisa', '¡Le diste! Ahora, a casa.')),
  escena('TUT3_PIRUETAS',
    T(PICHON, 'pichon_sonrisa', 'Y el tonel no es la única. En la pausa están las demás piruetas.'),
    T(TURCO, 'turco_ceno', 'Ni las mires, Tero. Cerrá y volvé entero.')),
  escena('TUT3_PIRUETAS_OK', T(PICHON, 'pichon_neutro', 'Algún día las probamos todas.')),
  escena('TUT3_APROX',
    T(PICHON, 'pichon_neutro', 'La pista. Con el gas regulás: poco gas y el avión baja; mucho, y flota. Llegá despacio.'),
    T(TURCO, 'turco_neutro', 'Y el tren abajo antes de tocar, que la panza la enderezo yo.')),
  escena('TUT3_APROX_OK', T(TURCO, 'turco_sonrisa', 'En casa. Entero, más o menos.')),
  escena('TUT3_FIN',
    T(TURCO, 'turco_neutro', 'Bueno, Tero. Ya sabés lo básico. Esta noche le pinto la estrellita.'),
    T(PICHON, 'pichon_sonrisa', 'La primera. Y mañana, la guerra de verdad.'),
    T(TURCO, 'turco_ceno', 'Mañana, changuito. Hoy, mate.')),
  escena('TUT3_FIN_OK', T(PICHON, 'pichon_neutro', 'Yo cebo.')),
  // LOS AVISOS: el avion no se cae, pero el golpe se comenta (una al azar, sin repetir la anterior)
  banco('AV_TUT_AGUA',
    T(TURCO, 'turco_ceno', '¡El mar, Tero! Pegado, sí. Adentro, no.'),
    T(PICHON, 'pichon_preocupado', 'Eso fue agua salada. Gas, gas, gas.'),
    T(TURCO, 'turco_neutro', 'Esa chapa la enderezo yo después. Subí un poquito.')),
  banco('AV_TUT_CHOQUE',
    T(TURCO, 'turco_neutro', 'Eso fue el viento. Seguí.'),
    T(PICHON, 'pichon_preocupado', 'No había viento, Turco. Mirá adelante, Tero.'),
    T(TURCO, 'turco_ceno', 'Otro golpe así y te cobro la chapa.')),
  // LA PISTA SE TERMINO antes de levantar: se dicen en orden, una por intento
  banco('AV_TUT_PISTA',
    T(TURCO, 'turco_ceno', '¡Se te acabó la pista! A la cabecera de nuevo. Y el gas no se suelta.'),
    T(PICHON, 'pichon_preocupado', 'Te faltó velocidad, Tero. Gas a fondo desde el principio, y sostenido.'),
    T(TURCO, 'turco_neutro', 'Apretá y no lo largues hasta que estés arriba. Como el mate: sin soltar.')),
  banco('AV_TUT_ERRO',
    T(PICHON, 'pichon_preocupado', 'Erraste. Soltala más temprano, que la bomba sigue de largo con tu velocidad.'),
    T(TURCO, 'turco_neutro', 'Otra pasada. El casco no se va a ningún lado.'),
    T(PICHON, 'pichon_neutro', 'Más alto, Tero: si cae menos de un segundo, no se arma.')),
  banco('AV_TUT_PISO',
    T(TURCO, 'turco_preocupado', 'Tero, me lo estás desarmando. Tranquilo, que tenemos tiempo.')),
];

export const TUT_SCENES = Object.fromEntries(LISTA.map(s => [s.id, s]));
