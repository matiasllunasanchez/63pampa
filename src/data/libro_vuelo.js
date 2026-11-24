// EL LIBRO DE VUELO — las misiones REALES de la demo / acceso anticipado.
// docs/historia/misiones/PROMPT_DEMO_MISIONES_REALES.md y LIBRO_DE_VUELO.md.
//
// Cuatro salidas que pasaron de verdad, una por avion, cada una con su dia y su hora. Se eligen
// desde HISTORIA → LIBRO DE VUELO: primero se lee el contexto, despues se elige el avion (uno de
// los que volaron ese dia, con la carga que llevaba) y se vuela; al final se cuenta lo que pasó,
// salga como salga la corrida.
//
// POR QUE UN ARCHIVO APARTE Y NO ENTRADAS EN missions.js: por la misma razon que el banco de
// pruebas (ver pruebas_misiones.js). `MISSIONS` es LA CAMPAÑA — su largo decide cuando termina el
// juego y `SHIP_MISSIONS` la sortea en el CICLO DE MUERTE. Estas no son campaña: en el juego
// completo son las MISIONES SUELTAS que la campaña desbloquea (MISIONES_SUELTAS.md), y en la demo
// son lo unico que se juega. `game.js` las concatena al final de `NIVELES` para resolverlas por
// indice, y nada que recorra la campaña se entera de que existen.
//
// LAS REGLAS QUE NO SE NEGOCIAN (autor, 12/10):
//   · SIN NOMBRES DE PERSONAS REALES en pantalla. Van matriculas, indicativos de escuadrilla y
//     «PILOTO». Fechas, horas, lugares, aviones, buques y cifras si, y exactos.
//   · NO SE INVENTA TEXTO. La prosa —el contexto, la descripcion de la fila, lo que pasó— se
//     propuso en LIBRO_DE_VUELO.md y el autor la aprobo el 12/10. Un texto nuevo sigue el mismo
//     camino: se propone ahi, y hasta el OK va como `PENDIENTE`.
//   · De dia. El avion es el del hecho. Lo que no existe en el juego (el Sea Wolf de la Brilliant,
//     la antiaerea propia de Pradera del Ganso, la Snakeye) NO se finge: se anota como pendiente.
import { CAMPAIGN_CFG } from './missions.js';

/** LA CAMPAÑA, BLOQUEADA EN LA DEMO. Es la unica perilla: con `true` la fila de EL CUADERNO DE MATEO
 *  se ve en gris con su candado y CONTINUAR desaparece (no hay partidas que retomar de una campaña
 *  que no se puede jugar). El SELECTOR DE MISIONES del modo dev la sigue abriendo: es la herramienta. */
export const CAMPANA_BLOQUEADA = true;

/** El texto que todavia no tiene el OK del autor. Se ve en pantalla A PROPOSITO: una caja vacia
 *  se confunde con un bug, y un texto inventado se confunde con uno aprobado. */
export const PENDIENTE = '[ texto pendiente del OK del autor ]';

const P = over => ({ ...CAMPAIGN_CFG, ...over });

// EL LARGO DE LA IDA, en metros de juego (la vuelta mide lo mismo). Eran 6 km, el de IDA Y VUELTA
// SMALL, y no alcanzaba (autor, 12/10: "¿por que es TAN RAPIDA la llegada al Sheffield?" y "¿por que
// no recargamos con el Hercules antes del radar?"). Las dos eran la misma cuenta: el tramo entre la
// cita con el Hercules y la linea del radar es ~12% de la ida, y con 6 km eso son ~700 m — once
// segundos, contra los ~6 que tarda en llegar mas los ~11 que tarda en llenarte. Llegaba cuando ya
// se estaba entrando al radar y se despedia. Con 20 km el tramo dura ~45 s y la ida, ~2:20.
// (La NAFTA no cambia con el largo: con `ruta` se cobra en km reales, ver core/ruta.js.)
const LARGO = 20000;
const PAR = 13000;   // el de IDA Y VUELTA SMALL (4000 a 6 km), a escala

// LO QUE NACE (el `solo` de cada fase). Lo de siempre es MUNDO: la ola, la bandada, el globo de
// barrera, los postes. Lo que se agrega por salida es lo que habia ESE dia en ESE lugar — el 12 de mayo
// las islas eran nuestras y sobre la tierra no hay antiaerea enemiga; el 21, en San Carlos, si.
const MAR = ['ola', 'birds'];
const DEFENSA = ['ola', 'birds', 'balloon', 'poles'];
const FLOTA = ['ola', 'birds', 'helo'];                                     // los helicopteros de la flota
const DESEMBARCO = ['ola', 'birds', 'helo', 'aa', 'manpad', 'lcu'];        // San Carlos, 21 de mayo
const TIERRA_NUESTRA = ['birds', 'poles', 'tree', 'tower', 'flag'];         // las islas, antes del desembarco

/** LAS FASES de una salida real: el molde de IDA Y VUELTA SMALL (t17) SIN SU RADIO — las lineas de
 *  fase de t17 son de Puma y Condor, personajes de la campaña, y aca no vuela nadie de la campaña.
 *
 *    lejos    lo que nace en la primera mitad del rasante (por defecto, mar)
 *    cerca    lo que nace en la segunda mitad y en el blanco
 *    blanco   claves extra del tramo del blanco (la cita de la Plymouth)
 *    vuelta   la lista de tramos de la vuelta, `{ hasta, ...claves }`, de 1 a 2. Por defecto, una
 *             vuelta TRANQUILA — el playtest (12/10): "la dificultad al pasar el barco es muy dificil,
 *             y creo que se muere la nafta". El tipo `vuelta` sube solo la siembra al 160% y prende LA
 *             COLA; aca se escribe a la baja, y con bidones.
 *    grito    claves extra del PRIMER tramo de la vuelta (la cita de la Ardent: se dice una vez)
 *    casa     false = sin vuelta: el climax cierra la mision (el Pulso del Sheffield)
 */
const VUELTA_TRANQUILA = [{ hasta: 1.5, obstacles: 0.7, caza: 0 }, { hasta: 2.0, obstacles: 0.5, caza: 0 }];
// MAS QUE ESQUIVAR EN LA IDA (17/11, el autor: "la parte donde el avion solo vuela tiene pocas
// complicaciones, pocas olas, pocos pajaros… hay que meterle mas"). Con `solo: MAR` el sorteo de la mezcla
// de mar descarta casi todo lo que no es ola ni bandada y deja huecos: la densidad se sube a mano en el
// transito y el descenso, y un poco en la primera mitad del rasante. (1 = la de siempre.)
const IDA_DENSA = 2.2, RASANTE_DENSO = 1.5;
// `ida`: claves que van a TODOS los tramos de la ida (23/11: `aves`, `olas`, `rafagas` — data/fases y systems/spawn.js)
function fases({ lejos = MAR, cerca = DEFENSA, blanco = {}, vuelta = VUELTA_TRANQUILA, grito = {}, casa = true, transito = 0.25, ida: todaIda = {} } = {}) {
  // EL TRANSITO ALTO ES UN CUARTO DE LA IDA (en t17 era 16%): es donde ocurre la cita con el Hercules,
  // y tiene que alcanzar para que llegue, te enganche y te llene ANTES de la linea del radar (que se
  // ancla al comienzo del descenso). Con 16% pasaba de largo (autor, 12/10).
  // `transito` ESTIRA EL TRANSITO ALTO (EL INVINCIBLE, 23/11: la Chancha recien con la nafta en rojo): el tramo alto
  // termina en `transito` y lo que sigue se corre en proporcion. La mision que lo use alarga su `goal.dist` para que el
  // resto dure lo mismo (ver `estirar`). El silencio de radio queda a los mismos metros antes de la linea.
  const T = transito, d = (1 - T) / 0.75, tras = p => +(T + (p - 0.25) * d).toFixed(4);
  const ida = [
    { tipo: 'transito', hasta: +(0.12 * T / 0.25).toFixed(4), solo: MAR, obstacles: IDA_DENSA, bombs: 0, bidones: false },
    { tipo: 'transito', hasta: +(T - 0.06 * d).toFixed(4), solo: MAR, obstacles: IDA_DENSA, bombs: 0, bidones: false },
    // EL SILENCIO DE RADIO (autor, 14/10): unos km antes de la linea del radar (~110 reales, 7-8 s de
    // vuelo: la linea es larga y tiene que poder leerse entera ANTES de entrar; al 0.22 eran 4 s) el amigo lo
    // dice. Si ya no queda ningun amigo en el aire, la linea no suena (ver radioTramo en game.js).
    { tipo: 'transito', hasta: T, solo: MAR, obstacles: IDA_DENSA, bombs: 0, bidones: false, radio: 'libro_radar_silencio' },
    { tipo: 'descenso', hasta: tras(0.30), solo: MAR, obstacles: IDA_DENSA, bombs: 0, bidones: false },
    { tipo: 'rasante', hasta: tras(0.55), solo: lejos, obstacles: RASANTE_DENSO, bombs: 0, bidones: false },
    { tipo: 'rasante', hasta: tras(0.82), solo: cerca, bombs: 0, bidones: false },
    { tipo: 'filo', hasta: tras(0.88), radar: 6, bombs: 0, bidones: false },
    { tipo: 'blanco', hasta: 1, solo: cerca, bombs: 0, bidones: false, ...blanco },
  ];
  // SIN VUELTA (`casa: false`): el climax cierra la mision. Es el caso del PULSO — despues de la
  // cinematica no hay pasillo de regreso que funcione (se volaba con el mar en negro, 12/10).
  for (const f of ida) Object.assign(f, todaIda);
  if (!casa) return ida;
  return ida.concat(vuelta.map((v, i) => ({ tipo: 'vuelta', bombs: 0, bidones: true, ...v, ...(i === 0 ? grito : {}) })));
}

// EL CFG DE LA SALIDA: el de IDA Y VUELTA SMALL (nafta prendida, mar variado, sin globos), con el
// clima del dia. `squad` es CUANTOS AVIONES VOLARON: el escuadron de la corrida es la escuadrilla
// real, y el relevo pasa al avion de al lado como en la campaña.
const cfgReal = over => P({ fuelOn: true, fuelScale: 0.065, globos: false, mar: 'variado', ...over });

// ---------------------------------------------------------------------------------------------
// r1 · EL SHEFFIELD — 4 de mayo de 1982
// Fuentes: Armada Argentina; Gaceta Aeronautica; RNA. Despegue de Rio Grande 09:45 (la Gaceta dice
// 09:44), reabastecidos por un KC-130 en la ida, Exocet lanzados a las 11:04 desde 20-30 millas,
// aterrizaje 12:04 (el prompt decia 12:10). Niebla y bruma: regla del 2 al 12 de mayo.
// EL CLIMAX ES EL PULSO: subir, prender el radar una vez, cargar el blanco, soltar y bajar.
// SIN DEFENSA EN LA IDA: el lanzamiento fue a 20-30 millas, nunca se acercaron al buque.
const r1 = {
  id: 'r1', name: 'EL SHEFFIELD',
  fecha: '4 DE MAYO DE 1982', hora: '11:04', horaQue: 'lanzamiento',
  desc: 'Dos Super Étendard de la Armada salen de Río Grande a buscar a la flota con un Exocet cada uno. Al ras del mar, con niebla, guiados por un Neptune.',
  despegue: { desde: 'BASE AERONAVAL RÍO GRANDE', zona: 'TIERRA DEL FUEGO', rumbo: 'blanco: destructor clase 42' },
  horaDespegue: '09:45',
  goal: { kind: 'ship', ship: 'HMS SHEFFIELD', dist: LARGO },
  climax: 'pulso',
  cfg: cfgReal({ sky: 'cloudy', fog: 1, fogLen: 1, squad: 2, caza: 0 }),
  chanchaMinT: 40,
  chanchaVeces: { ida: 1, vuelta: 0 },
  // KM APROXIMADOS (a confirmar): la cita con el Hercules fue en 50º30′S 65º30′O, a ~150 km de Rio
  // Grande; el blanco, a unos 650. LA ZONA DE LA CITA NO ES LA HISTORICA: en el juego, a 150 km de la
  // base el tanque todavia esta lleno y el Hercules te llenaba en dos segundos y se iba (medido: 98%).
  // Se corre a la segunda mitad del transito, donde ya gastaste, y llega hasta el radar.
  ruta: { blancoKm: 650, radarKm: 180, niveladoKm: 120, potenciaKm: 50, chanchaIda: [420, 200] },
  // SIN VUELTA: el Pulso cierra la mision. La vuelta real (al ras hasta Rio Grande, 12:04) no tuvo
  // nada que jugar, y la del juego despues del Pulso se volaba en negro (12/10).
  // MAR ABIERTO de punta a punta, que es lo real: el ataque fue sobre el Atlantico, a 20-30 millas de
  // la flota. Cerca del blanco, los helicopteros de la flota. Sin `geografia`: todo es mar.
  fases: fases({ cerca: FLOTA, casa: false }),
  // EL PREMIO SUELTA UN EXOCET, no cuatro: cada Super Etendard lanzo uno. Y la dificultad del Pulso
  // es la de M4 (4 de mayo): la cuenta por indice de campaña le daba la de la ultima mision.
  pulsoBombas: 1, pulsoT01: 3 / 13,
  par: PAR,
  escuadrilla: '2ª ESCUADRILLA AERONAVAL DE CAZA Y ATAQUE',
  // LA CARGA REAL: un Exocet AM39 bajo el ala derecha y un tanque de 1.100 l bajo la izquierda — desde
  // el 14/10 horneada y colgada (data/cargas.js `exocet`).
  aviones: [
    { chapa: '3-A-202', plane: 'supere', carga: 'exocet', cargaTxt: 'EXOCET AM39 + 1 TANQUE' },
    { chapa: '3-A-203', plane: 'supere', carga: 'exocet', cargaTxt: 'EXOCET AM39 + 1 TANQUE' },
  ],
  contexto: 'R1_CONTEXTO', epi: 'R1_LO_QUE_PASO',
};

// ---------------------------------------------------------------------------------------------
// r2 · LA GLASGOW — 12 de mayo de 1982
// Fuentes: Presidencia de la Nacion (12/5); Fuerza Aerea, Direccion de Estudios Historicos; ASN.
// Dos escuadrillas de A-4B de Rio Gallegos: CUÑA (despega 12:20, contra la Brilliant) y ORO
// (12:30, contra la Glasgow). Se vuela ORO. La bomba atraveso a la Glasgow y estallo en el agua.
// Al volver, uno de ORO cruzo Pradera del Ganso y lo derribo la antiaerea propia. Ultimo dia de
// niebla.
const r2 = {
  id: 'r2', name: 'HMS GLASGOW',   // nombre completo (autor, 16/10: "LA GLASGOW" quedaba feo)
  fecha: '12 DE MAYO DE 1982', hora: '12:30', horaQue: 'despegue',
  desc: 'Dos escuadrillas de A-4B salen de Río Gallegos contra dos buques en el estrecho. Volás la segunda, ORO, contra la Glasgow.',
  despegue: { desde: 'BASE AÉREA MILITAR RÍO GALLEGOS', zona: 'SANTA CRUZ', rumbo: 'blanco: destructor clase 42' },
  horaDespegue: '12:30',
  goal: { kind: 'ship', ship: 'HMS GLASGOW', dist: LARGO },
  climax: 'suelta',
  // LA MK-17 (la de las espoletas que fallaban en todo mayo) y el SEA WOLF: lo tiraba la Brilliant, que
  // escoltaba a la Glasgow, y fue lo que bajo a la escuadrilla CUÑA. El juego lo pone en el blanco.
  bomba: 'mk17', defensa: 'wolf',
  // EL SEA WOLF DE LA BRILLIANT, CONFUNDIDO (PLAN_DEFENSAS_BUQUE F5): contra CUÑA funciono —bajo a dos—,
  // y contra ORO, la que se vuela, su sistema fallo con los aviones cruzandose (≈ fuentes britanicas,
  // PREGUNTAS_HISTORICAS "EL ARMAMENTO DE CADA BUQUE" punto 4). Su 910 arranca DAÑADO: tira, pero a
  // ratos pierde el blanco. La Glasgow tira lo suyo: el Sea Dart —que al ras no sirve— y el 4,5".
  sistemasIniciales: [{ escolta: true, tipo: 'seawolf_910', estado: 'danado' }],
  cfg: cfgReal({ sky: 'cloudy', fog: 1, fogLen: 1, squad: 4 }),
  chanchaMinT: 40,
  chanchaVeces: { ida: 1, vuelta: 1 },
  // KM APROXIMADOS (a confirmar): de Rio Gallegos al estrecho, unos 780.
  ruta: { blancoKm: 780, radarKm: 180, niveladoKm: 120, potenciaKm: 50, chanchaIda: [500, 200], chanchaVuelta: [350, 420] },
  // LA RUTA: mar, la costa de la Gran Malvina, el estrecho, la Isla Soledad, y los buques frente a
  // Puerto Argentino. Sobre las islas no hay antiaerea enemiga (eran nuestras). EN LA VUELTA, PRADERA
  // DEL GANSO: tierra con ANTIAEREA PROPIA, en alerta roja — la que bajo a uno de ORO. Es el adicional
  // del prompt: no todo lo que dispara es enemigo.
  fases: fases({ lejos: MAR, cerca: FLOTA, vuelta: [
    { hasta: 1.12, obstacles: 0.7, caza: 0 },
    { hasta: 1.30, obstacles: 1.2, caza: 0, solo: ['aa', 'birds', 'poles'] },   // Pradera del Ganso
    { hasta: 2.0, obstacles: 0.5, caza: 0 },
  ] }),
  geografia: {
    ida: [
      { km: 9, suelo: 'mar' },
      { km: 2, suelo: 'costa', lado: 'izq' },               // la Gran Malvina
      { km: 0.4, suelo: 'mar' },                            // (una isla se entra desde el agua)
      { km: 0.8, suelo: 'isla', alto: 12 },                 // se la cruza
      { km: 1.5, suelo: 'mar', paredes: 'ambos' },          // el estrecho de San Carlos
      { km: 3, suelo: 'tierra', lomas: 4 },                 // la Isla Soledad
      { suelo: 'mar' },                                     // los buques, frente a Puerto Argentino
    ],
    vuelta: [
      { km: 2.4, suelo: 'mar' },
      { km: 3.6, suelo: 'tierra', lomas: 2 },               // Pradera del Ganso (la antiaerea propia)
      { km: 1.5, suelo: 'mar', paredes: 'ambos' },          // el estrecho
      { km: 2, suelo: 'costa', lado: 'der' },               // la Gran Malvina, del otro lado
      { suelo: 'mar' },
    ],
  },
  par: PAR,
  escuadrilla: 'ESCUADRILLA ORO · V BRIGADA AÉREA',
  // MATRICULAS de ORO segun el prompt (C-239 la confirma Los Andes; C-248 la confirma ASN; C-225 y
  // C-244 a confirmar). La carga del A-4B: una MK-17 de 1.000 lb al centro y dos tanques (a
  // confirmar con la orden de esa salida).
  aviones: [
    { chapa: 'C-225', plane: 'sky', carga: 'tanques_bomba', cargaTxt: '1 BOMBA MK-17 + 2 TANQUES' },
    { chapa: 'C-244', plane: 'sky', carga: 'tanques_bomba', cargaTxt: '1 BOMBA MK-17 + 2 TANQUES' },
    { chapa: 'C-248', plane: 'sky', carga: 'tanques_bomba', cargaTxt: '1 BOMBA MK-17 + 2 TANQUES' },
    { chapa: 'C-239', plane: 'sky', carga: 'tanques_bomba', cargaTxt: '1 BOMBA MK-17 + 2 TANQUES' },
  ],
  contexto: 'R2_CONTEXTO', epi: 'R2_LO_QUE_PASO',
};

// ---------------------------------------------------------------------------------------------
// r3 · LA ARDENT — 21 de mayo de 1982
// Fuentes: Boletin del Centro Naval 817 (relato de Castro Fox); Presidencia de la Nacion; La
// Capital de Mar del Plata; ASN. Primera seccion de la 3ª Escuadrilla Aeronaval de Caza y Ataque,
// despegue de Rio Grande a las 14:10, cuatro MK-82 con cola retardadora cada uno. Sin
// reabastecimiento. A la salida, dos Sea Harrier: los tres derribados; dos se eyectan.
// LA CITA REAL va en la vuelta, cuando entran los cazas: «¡Harrier! ¡Harrier!».
const r3 = {
  id: 'r3', name: 'LA ARDENT',
  fecha: '21 DE MAYO DE 1982', hora: '14:10', horaQue: 'despegue',
  desc: 'Tres A-4Q de la Armada, sin Hércules: cada litro contado. El blanco asignado no está; el alternativo, los buques de San Carlos.',
  despegue: { desde: 'BASE AERONAVAL RÍO GRANDE', zona: 'TIERRA DEL FUEGO', rumbo: 'blanco alternativo: bahía San Carlos' },
  horaDespegue: '14:10',
  goal: { kind: 'ship', ship: 'HMS ARDENT', dist: LARGO },
  climax: 'suelta',
  // LA BRP-250 hasta que exista la MK-82 Snakeye: es la bomba con cola retardadora que el juego ya
  // tiene (la mas parecida en como cae). La Ardent tenia Sea Cat.
  bomba: 'brp', defensa: 'cat',
  // LA ARDENT YA HERIDA (PLAN_DEFENSAS_BUQUE F5): la oleada anterior (Dagger, ~14:00) le pego en el
  // hangar y se llevo el lanzador del Sea Cat y el Lynx; los A-4Q llegaron despues (≈ a confirmar,
  // PREGUNTAS_HISTORICAS "EL ARMAMENTO DE CADA BUQUE" punto 3). Le queda el 4,5" y los 20 mm.
  sistemasIniciales: [{ tipo: 'seacat_lanz', estado: 'fuera' }],
  // SIN CHANCHA: los Hercules estaban en otras operaciones. La nafta es lo que se lleva.
  chancha: false,
  cfg: cfgReal({ sky: 'cloudy', squad: 3 }),
  // KM: de Rio Grande a San Carlos hay ~640 en linea recta (estaba en 750, y sin Hercules sobraban)
  ruta: { blancoKm: 640, radarKm: 180, niveladoKm: 120, potenciaKm: 50 },
  // LA RUTA: mar, LA BOCA SUR DEL ESTRECHO con mal tiempo (niebla), el estrecho entre acantilados y la
  // bahia San Carlos con el desembarco: antiaerea, misiles de hombro, lanchas y helicopteros. EN LA
  // VUELTA, los dos Sea Harrier (LA COLA) y la cita real.
  fases: fases({ lejos: MAR, cerca: DESEMBARCO, grito: { radio: 'libro_r3_harrier' }, vuelta: [
    { hasta: 1.4, obstacles: 0.8, caza: 1 },
    { hasta: 2.0, obstacles: 0.5, caza: 0 },
  ] }),
  geografia: {
    ida: [
      { km: 9, suelo: 'mar' },
      { km: 2, suelo: 'mar', niebla: 1 },                   // la boca sur, con mal tiempo
      { km: 2.5, suelo: 'mar', paredes: 'ambos' },          // el estrecho
      { km: 0.8, suelo: 'isla', alto: 10, ancho: 0.6, x: -14 },   // por arriba o por el canal
      { km: 2.5, suelo: 'mar', paredes: 'izq' },
      { km: 1.5, suelo: 'costa', lado: 'der' },             // la costa de San Carlos
      { suelo: 'mar' },                                     // la bahia, con la Ardent
    ],
    vuelta: [
      { km: 3, suelo: 'mar', paredes: 'ambos' },            // el estrecho, con los Harrier detras
      { km: 2, suelo: 'mar', niebla: 1 },
      { suelo: 'mar' },
    ],
  },
  par: PAR,
  escuadrilla: '3ª ESCUADRILLA AERONAVAL DE CAZA Y ATAQUE',
  // MATRICULAS segun ASN (baja confianza, a confirmar con la Armada). La carga real: cuatro MK-82
  // Snakeye y dos tanques. El juego cuelga una bomba al centro y dos tanques (`tanques_bomba`); la
  // Snakeye (frena en el aire: se suelta mas bajo) NO existe todavia como bomba — pendiente.
  aviones: [
    { chapa: '3-A-307', plane: 'a4q', carga: 'tanques_bomba', cargaTxt: '4 MK-82 SNAKEYE + 2 TANQUES' },
    { chapa: '3-A-312', plane: 'a4q', carga: 'tanques_bomba', cargaTxt: '4 MK-82 SNAKEYE + 2 TANQUES' },
    { chapa: '3-A-314', plane: 'a4q', carga: 'tanques_bomba', cargaTxt: '4 MK-82 SNAKEYE + 2 TANQUES' },
  ],
  contexto: 'R3_CONTEXTO', epi: 'R3_LO_QUE_PASO',
};

// ---------------------------------------------------------------------------------------------
// r4 · LA PLYMOUTH — 8 de junio de 1982
// Fuentes: Presidencia de la Nacion («un dia negro para la flota invasora»); DEF Online; Hastings y
// Jenkins (via Noonans). Dos escuadrillas de Dagger del Grupo 6 de Caza, PERRO y GATO, de tres
// aviones; uno vuelve por un pajaro que le dañó el parabrisas. Cinco llegan. Creian ir a Bahia
// Agradable y encuentran a la Plymouth en el estrecho de San Carlos, cerca de Punta Chancho. Cuatro
// bombas la alcanzan; vuelven todos. HORA: no hay una fuente argentina con la hora; los britanicos
// esperaban el ataque hacia las 13:30 y llego unos minutos antes. Va con «≈».
// LA CITA REAL va en el tramo del blanco: «¡Buque enemigo a las tres!».
const r4 = {
  id: 'r4', name: 'LA PLYMOUTH',
  fecha: '8 DE JUNIO DE 1982', hora: '≈13:00', horaQue: 'ataque',
  desc: 'Seis Dagger salen de Río Grande hacia Bahía Agradable. Al ras y muy rápidos, se pasan, y encuentran una fragata sola en el estrecho.',
  despegue: { desde: 'BASE AERONAVAL RÍO GRANDE', zona: 'TIERRA DEL FUEGO', rumbo: 'rumbo: Bahía Agradable' },
  horaDespegue: null,   // (sin fuente argentina de la hora: el rotulo no la escribe)
  goal: { kind: 'ship', ship: 'HMS PLYMOUTH', dist: LARGO },
  climax: 'suelta',
  // Bombas de 250 kg (la BRP-250 es la de 250 que el juego tiene; cual era exactamente, a confirmar).
  // La Plymouth (Tipo 12) tenia Sea Cat.
  bomba: 'brp', defensa: 'cat',
  // SIN CHANCHA por dos lados: el Dagger no tenia sonda (`sonda: false` en planes.js) y esa salida
  // no reabastecio. Se escribe igual: la regla tiene que leerse en la mision, no deducirse del avion.
  chancha: false,
  cfg: cfgReal({ sky: 'clear', squad: 5 }),
  // KM: de Rio Grande a Punta Chancho hay ~610 en linea recta
  ruta: { blancoKm: 610, radarKm: 180, niveladoKm: 120, potenciaKm: 50 },
  // LA RUTA: mar, la costa de la Gran Malvina, y el estrecho hacia el norte — donde aparece LA PLYMOUTH,
  // sola, de costado. En la vuelta, los Sea Harrier que mando la Exeter (no los alcanzaron).
  fases: fases({ lejos: MAR, cerca: DEFENSA, blanco: { radio: 'libro_r4_buque' }, vuelta: [
    { hasta: 1.4, obstacles: 0.7, caza: 1 },
    { hasta: 2.0, obstacles: 0.5, caza: 0 },
  ] }),
  geografia: {
    ida: [
      { km: 9, suelo: 'mar' },
      { km: 3, suelo: 'costa', lado: 'izq' },               // la Gran Malvina
      { km: 3, suelo: 'mar', paredes: 'izq' },              // el estrecho, pegado a la isla
      { km: 1.5, suelo: 'mar', paredes: 'ambos' },
      { suelo: 'mar' },                                     // cerca de Punta Chancho: la Plymouth
    ],
    vuelta: [
      { km: 2, suelo: 'mar', paredes: 'ambos' },
      { km: 3, suelo: 'costa', lado: 'der' },
      { suelo: 'mar' },
    ],
  },
  par: PAR,
  escuadrilla: 'ESCUADRILLAS PERRO Y GATO · GRUPO 6 DE CAZA',
  // SIN MATRICULAS: no se encontro una fuente con los numeros de esa salida. Se elige la
  // escuadrilla. La carga es la INDIA (3 tanques + 2 bombas de 250 kg, la propia del Dagger); el
  // prompt decia «dos tanques» — a confirmar.
  aviones: [
    { chapa: 'PERRO', plane: 'dagger', carga: 'india', cargaTxt: '2 BOMBAS DE 250 KG + 3 TANQUES' },
    { chapa: 'GATO', plane: 'dagger', carga: 'india', cargaTxt: '2 BOMBAS DE 250 KG + 3 TANQUES' },
  ],
  contexto: 'R4_CONTEXTO', epi: 'R4_LO_QUE_PASO',
};

// ---------------------------------------------------------------------------------------------
// r5 · EL INVINCIBLE — 30 de mayo de 1982. Plan entero en docs/historia/misiones/PLAN_INVINCIBLE.md.
// Fuentes: Conclusion; Canal 26; RNA; ASN (C-301). Dos Super Etendard (uno con el ULTIMO Exocet, el
// otro de apoyo con su radar) y cuatro A-4C de la Fuerza Aerea, todos de Rio Grande (los A-4C a las
// 12:30), reabastecidos por dos KC-130 en la ida. Version argentina: el Exocet y las bombas alcanzaron
// al Invincible. Version britanica: el Exocet cayo al mar, dos A-4C derribados (Sea Dart) y los otros
// dos atacaron a la HMS Avenger sin acertar.
//
// SE ELIGE UNO DE LOS DOS AVIONES, y cada uno es otra mision (autor, 13/11: "si usamos un skyhawk la
// mision arranca persiguiendo a los superetendard, y cuando lanzan el exocet la mision es DEFENDERLO;
// si es con el superetendard, es llegar sin que nos maten y lanzar el exocet"). El `rol` de cada avion:
//   'lanza'   el SUPER ETENDARD vuela la ida con el Hercules y, en `lanzamiento` (una fraccion de la
//             ida, y no en el blanco: el Exocet se suelta LEJOS), juega EL PULSO con el buque chico
//             (`pulsoLejos`). El Pulso bien hecho cierra la mision, como en el Sheffield;
//   'escolta' el A-4C carga del Hercules, despues SIGUE a los Super Etendard (lider de PERSECUCION con el
//             sprite del Super Etendard) y en `lanzamiento` el lider se vuelve el Exocet: hay que
//             custodiarlo —tirarle a todo lo que se le cruce— hasta el portaaviones. No suelta nada.
// (Hasta el 13/11 se jugaban los dos, uno detras del otro; game.js `empezarEscolta` sigue siendo el cambio.)
// el tramo alto de EL INVINCIBLE, en fraccion de su largo (antes 0.25 de LARGO * 1.2: ~1:37; ahora ~2:40)
const INV_TRANSITO = 0.357;
const r5 = {
  id: 'r5', name: 'EL INVINCIBLE',
  fecha: '30 DE MAYO DE 1982', hora: '12:30', horaQue: 'despegue',
  desc: 'Dos Super Étendard con el último Exocet y cuatro A-4C salen juntos de Río Grande a buscar al portaaviones. Primero lanzás el misil; después, lo escoltás.',
  despegue: { desde: 'BASE AERONAVAL RÍO GRANDE', zona: 'TIERRA DEL FUEGO', rumbo: 'blanco: el grupo de portaaviones' },
  horaDespegue: '12:30',
  // EL TRANSITO LARGO (23/11, el autor: "la Chancha debe aparecer MUCHO DESPUES… la gasolina debe llegar al rojo recien
  // para que la Chancha aparezca, y unos 5 o 10 segundos despues de cargar la zona de radar"; "no tiene sentido recargar
  // si casi no se gasto"). El tramo alto pasa de ~1:37 a ~2:40 (INV_TRANSITO) y el resto dura lo mismo que antes: el
  // largo crece lo que crece el transito. En ese tramo se gasta hasta el rojo (`chanchaAlRojo`, game.js gastoAlRojo).
  goal: { kind: 'ship', ship: 'HMS INVINCIBLE', dist: Math.round(LARGO * 1.2 * 0.75 / (1 - INV_TRANSITO)) },
  climax: 'pulso',
  // DONDE SE LANZA EL EXOCET: a esta fraccion de la ida, no en el blanco. Lo que queda de ahi al
  // portaaviones es la escolta del A-4C (~45% de la ida, ~1:30 de vuelo).
  lanzamiento: +(INV_TRANSITO + 0.30 * (1 - INV_TRANSITO) / 0.75).toFixed(4),   // (el 0.55 de antes, corrido por el transito largo)
  pulsoLejos: 0.45,           // el buque, de lejos: el encuadre del Pulso multiplicado por esto
  pulsoBombas: 1, pulsoT01: 1,   // el ultimo Exocet; el Pulso de fines de mayo
  cfg: cfgReal({ sky: 'cloudy', rain: 1, squad: 2 }),
  chanchaMinT: 40,
  chanchaVeces: { ida: 1, vuelta: 0 },
  // LA CHANCHA AL ROJO: la de la ida no viene por km — viene cuando la nafta entra al rojo (el ultimo cuarto), y el
  // transito gasta para que eso pase hacia el 80% del tramo alto. La linea del radar espera a que te llene (+ unos
  // segundos). Ver game.js (gastoAlRojo, CH_ROJO).
  chanchaAlRojo: true,
  // KM APROXIMADOS (a confirmar): el grupo de portaaviones estaba al este de las islas, mas lejos que
  // el Sheffield.
  ruta: { blancoKm: 850, radarKm: 180, niveladoKm: 120, potenciaKm: 50, chanchaIda: [620, 400] },
  // (23/11, el autor: "la cantidad de pajaros es UN MONTON, reduzcamos; agreguemos olas, viento que nos mueva y nos
  // complique el control, o factores climaticos, pero no tanto pajaro"): un cuarto de las bandadas, mas olas, y
  // rafagas de costado a cualquier altura; con llovizna (el mar se pone grueso)
  fases: fases({ cerca: FLOTA, casa: false, transito: INV_TRANSITO, ida: { aves: 0.25, olas: 1.8, rafagas: 1 } }),
  par: Math.round(PAR * 1.2),
  escuadrilla: '2ª ESCUADRILLA AERONAVAL Y GRUPO 4 DE CAZA',
  // `squad` y `chapas` por avion: cada eleccion es su propia escuadrilla — dos Super Etendard, o cuatro
  // A-4C con el indicativo de ASN («Zonda», a confirmar) en la placa.
  aviones: [
    // (23/11, el autor: "arriba el nombre o la unidad con codigo"): las matriculas de los dos Super Etendard en la placa
    // del escuadron —antes decia SUPER ÉTENDARD, repetido con el modelo de abajo—. ⚠ A CONFIRMAR (PREGUNTAS_HISTORICAS)
    { chapa: '3-A-202', plane: 'supere', carga: 'exocet', cargaTxt: 'EL ÚLTIMO EXOCET + 1 TANQUE',
      rol: 'lanza', squad: 2, chapas: ['3-A-202', '3-A-205'],
      // (23/11: los que despegan con el, en las filas de atras — render/squad.js `extras`)
      despeganCon: [{ plane: 'sky', n: 4 }] },
    { chapa: 'ZONDA 1', plane: 'sky', carga: 'tanques', cargaTxt: '2 TANQUES',
      rol: 'escolta', squad: 4, chapas: ['ZONDA 1', 'ZONDA 2', 'ZONDA 3', 'ZONDA 4'],
      despeganCon: [{ plane: 'supere', n: 2 }] },
  ],
  contexto: 'R5_CONTEXTO', epi: 'R5_LO_QUE_PASO',
};

// ---------------------------------------------------------------------------------------------
// r6 · EL RESCATE DEL BELGRANO — 2 y 3 de mayo de 1982 (21/11, pedido del autor; MISIONES_SUELTAS S-01)
// Fuentes: Armada (argentina.gob.ar/armada/crucero-ara-general-belgrano); Boletin del Centro Naval 829. El crucero
// fue torpedeado el 2 de mayo a las 16:02; la busqueda se ordeno unas seis horas despues. El Neptune 2-P-112 busco de
// noche unas nueve horas, muy bajo, sin indicios, y volvio a su base a las 06:30. Hacia las 05:00 lo relevo el 2-P-111
// (con un motor que consumia aceite de mas: en tiempos normales no habria volado), tambien muy bajo por el techo de
// nubes. Poco despues de las 09:00 vio una MANCHA DE ACEITE de unos 300 m de ancho que se extendia al SE y abrio una
// busqueda en cuadrados crecientes; los destructores D-26 y D-29 y el aviso A-3 fueron para alla.
// ⚠ A CONFIRMAR (PREGUNTAS_HISTORICAS «EL RESCATE DEL BELGRANO»): las horas de despegue (≈), la base, el humo y los
// circulos (son mecanica de juego, el autor 21/11), y donde exactamente.
// SE VUELA: ida por el pasillo bajo la tormenta (nubes a 150 m), y en la zona, fundido al MAR ABIERTO del motor de las
// islas: LA BUSQUEDA (systems/islas/busqueda.js). Vuelta por el pasillo, con la nafta justa.
const LARGO_BELGRANO = 12000;
const r6 = {
  id: 'r6', name: 'EL RESCATE DEL BELGRANO',
  fecha: '3 DE MAYO DE 1982', hora: '≈09:00', horaQue: 'mancha',
  desc: PENDIENTE,
  despegue: { desde: 'BASE AERONAVAL RÍO GRANDE', zona: 'TIERRA DEL FUEGO', rumbo: 'zona de búsqueda: el hundimiento del Belgrano' },
  goal: { kind: 'distance', meters: LARGO_BELGRANO },
  // LA BUSQUEDA: donde (el crucero se hundio en 55°24'S 61°32'O; las balsas derivaron al SE), con que rumbo se entra y
  // el clima del dia (data/islas_clima.js: TEMPORAL — lluvia, viento, mar muy grueso, relampagos)
  busqueda: { lon: -61.1, lat: -55.6, rumbo: 135, clima: 'temporal' },
  // EL TECHO: nubes a 150 m (la capa del pasillo baja hasta ahi; en el mar abierto, el velo de BUSQ.TECHO)
  techoNubes: 150,
  chancha: false,
  // (SIN RADAR BRITANICO: la busqueda fue lejos de la flota — sin barra, sin red, sin Sea Dart)
  cfg: cfgReal({ sky: 'storm', rain: 1, fog: 1, fogLen: 1, squad: 1, caza: 0, radar: 'off', fuelScale: 0.04 }),
  fases: [
    { tipo: 'rasante', hasta: 1, solo: MAR, obstacles: IDA_DENSA, bombs: 0, bidones: false },
    { tipo: 'vuelta', hasta: 2, solo: MAR, obstacles: 0.8, bombs: 0, bidones: false, caza: 0 },
  ],
  par: PAR,
  escuadrilla: 'ESCUADRILLA AERONAVAL DE EXPLORACIÓN',
  // LAS DOS SALIDAS (el autor: "son dos salidas con 2 aviones marcando la hora cuando despega el avion"): cada
  // Neptune trae su dia y su hora (el rotulo del despegue) y si ve o no la mancha (`encuentra`)
  aviones: [
    { chapa: '2-P-111', plane: 'neptune', carga: 'nada', cargaTxt: 'MARCADORES DE HUMO', fecha: '3 DE MAYO DE 1982', hora: '≈03:00', encuentra: true,
      papel: 'EL RELEVO: LLEGA A LA ZONA HACIA LAS 05:00' },
    { chapa: '2-P-112', plane: 'neptune', carga: 'nada', cargaTxt: 'MARCADORES DE HUMO', fecha: '2 DE MAYO DE 1982', hora: '≈21:30', encuentra: false,
      papel: 'LA NOCHE: NUEVE HORAS BARRIENDO LA ZONA' },
  ],
  contexto: 'R6_CONTEXTO', epi: 'R6_LO_QUE_PASO',
};

/** LAS QUE SE JUEGAN (23/11, el autor: "vamos solo con la del Invincible y el resto dejemoslas bloqueadas tambien
 *  como EN DESARROLLO"): las demas se ven en su lugar del libro, en gris, y no se entran (el modo DEV las abre).
 *  Se van sumando a medida que cada una tenga sus laminas y su repaso. */
export const LIBRO_ABIERTAS = ['r5'];
/** Las salidas, en orden de fecha: es el orden del LIBRO DE VUELO. */
export const LIBRO_VUELO = [r6, r1, r2, r3, r5, r4];

/** LAS QUE VIENEN (17/10, el autor: "agregar todas las misiones que relevamos en la documentacion, todas
 *  las que sucedieron, pero el resto ponerlas disabled debajo"). Los hechos reales de MISIONES_SUELTAS.md
 *  que todavia no se juegan: van en gris debajo de las salidas, en orden de fecha, con EN DESARROLLO
 *  al lado de la fecha. Sin nombres de personas (la regla de arriba): Owen Crippa es «el Aermacchi».
 *  `s` = su numero en MISIONES_SUELTAS.md. `fecha` null = el doc todavia no la fija. */
export const LIBRO_PROXIMAS = [
  { s: 2, es: 'EL NEPTUNE', en: 'THE NEPTUNE', fecha: { es: '4 DE MAYO DE 1982', en: '4 MAY 1982' } },
  { s: 9, es: 'EL AERMACCHI DEL ESTRECHO', en: 'THE AERMACCHI OVER THE SOUND', fecha: { es: '21 DE MAYO DE 1982', en: '21 MAY 1982' } },
  { s: 7, es: 'LOS DOS PUCARÁ', en: 'THE TWO PUCARÁS', fecha: { es: '21 DE MAYO DE 1982', en: '21 MAY 1982' } },
  { s: 10, es: 'TRES DAGGER CONTRA DOS HARRIER', en: 'THREE DAGGERS AGAINST TWO HARRIERS', fecha: { es: '21 DE MAYO DE 1982', en: '21 MAY 1982' } },
  { s: 11, es: 'COLGADO DEL PATÍN', en: 'HANGING FROM THE SKID', fecha: { es: '21 DE MAYO DE 1982', en: '21 MAY 1982' } },
  { s: 8, es: 'DESDE TIERRA: PUERTO HOWARD', en: 'FROM THE GROUND: PORT HOWARD', fecha: { es: '21 DE MAYO DE 1982', en: '21 MAY 1982' } },
  { s: 12, es: 'TRES DAGGER SOBRE PUERTO SAN CARLOS', en: 'THREE DAGGERS OVER PORT SAN CARLOS', fecha: { es: '24 DE MAYO DE 1982', en: '24 MAY 1982' } },
  { es: 'EL ATLANTIC CONVEYOR', en: 'THE ATLANTIC CONVEYOR', fecha: { es: '23 Y 25 DE MAYO DE 1982', en: '23 & 25 MAY 1982' } },
  { s: 13, es: 'SOBRE PRADERA DEL GANSO', en: 'OVER GOOSE GREEN', fecha: { es: '28 DE MAYO DE 1982', en: '28 MAY 1982' } },
  { s: 14, es: 'DOS PUCARÁ CONTRA DOS HELICÓPTEROS', en: 'TWO PUCARÁS AGAINST TWO HELICOPTERS', fecha: { es: '28 DE MAYO DE 1982', en: '28 MAY 1982' } },
  { s: 4, es: 'EL ESCUADRÓN FÉNIX', en: 'THE FÉNIX SQUADRON', fecha: { es: '7 DE JUNIO DE 1982', en: '7 JUNE 1982' } },
  // (21/11, el autor: "poner TODAS las misiones que mencioné": las 18 de LIBRO_DE_VUELO_MISIONES_REALES.pdf, en su orden)
  { es: 'EL ITB Y EL GLAMORGAN', en: 'THE ITB AND THE GLAMORGAN', fecha: { es: '11 Y 12 DE JUNIO DE 1982', en: '11–12 JUNE 1982' } },
  { es: 'DOS HERMANAS', en: 'TWO SISTERS', fecha: { es: '13 DE JUNIO DE 1982', en: '13 JUNE 1982' } },
];

// ---------------------------------------------------------------------------------------------
// LAS ESCENAS (mismo formato que data/story.js; las lee core/dialogue.js).
//
// EL CONTEXTO es una TARJETA: el dato (fecha · hora · base), despues EL AVION Y EL ARMA en dos lineas
// (que era, por que ese y no otro — autor, 14/10: "explicar cosas, antes de arrancar") y el contexto. LO QUE PASÓ es
// otra TARJETA. Una linea por frase larga: la tarjeta pasa de a una.
// `rotulo` (opcional): la linea CHICA de arriba del titulo, donde las misiones dicen CAPÍTULO N (autor,
// 16/10: "LO QUE PASÓ tambien chico, arriba"). El titulo grande queda solo con el nombre.
// LAS LAMINAS (23/11, el autor: "agregarles graficos e imagenes de elementos, bombas, barcos, aviones, y todo lo que
// ayude al texto, no llenar pero si ayudar, con ese efecto verde… todo lineas o vectorizado"): una linea puede ser
// `[texto, lamina, rotulo]` — la lamina es assets/libro/<lamina>.png (dibujo de linea en fosforo verde, horneado por
// tools/blender/hornear_laminas.py) y se dibuja a la derecha de la tarjeta mientras se tipea (render/screens.js
// drawTarjeta); el `rotulo` va chico debajo. Con lamina el texto se angosta a LAMINA_WRAP caracteres.
const LAMINA_WRAP = 38;
const tarjeta = (id, titulo, lineas, rotulo) => ({
  id, tipo: 'TARJETA', titulo, rotulo,
  lineas: lineas.map((l, i) => {
    const [es, lamina, laminaTxt] = Array.isArray(l) ? l : [l];
    return { id: id + '_' + String((i + 1) * 10).padStart(3, '0'), personaje: null, cara: null, hold: 0, es, en: '',
      ...(lamina ? { lamina, laminaTxt: laminaTxt || '', wrap: LAMINA_WRAP } : {}) };
  }),
});
const dato = m => m.fecha + ' · ' + m.hora + ' · ' + m.despegue.desde;

export const LIBRO_SCENES = {
  // EL CONTEXTO DE CADA SALIDA (23/11, el autor: "que cada mision te cuente EL CONTEXTO DONDE SUCEDE HOY, LO QUE SUCEDIO
  // ANTES Y CUAL ES EL PLAN A EJECUTAR… no hables a una sola persona, que sea CONTAR CUAL ES EL PLAN como si estuviesen
  // todos los pilotos reunidos"; "la mision jugable es el plan ejecutado"): HOY · ANTES · el avion · EL PLAN
  R1_CONTEXTO: tarjeta('R1_CONTEXTO', r1.name, [dato(r1),
    'HOY. Río Grande, Tierra del Fuego. Un Neptune de la Armada encontró esta mañana a la flota británica, al este de las islas.',
    'ANTES. El 2 de mayo un submarino británico hundió al crucero General Belgrano. La Argentina tiene cinco Exocet y no van a llegar más.',
    'El Super Étendard es de la Armada y el único avión argentino que puede lanzar el Exocet: un misil antibuque que se suelta a 20 o 30 millas y llega solo, rozando el agua.',
    'EL PLAN. Salen dos Super Étendard, con un Exocet cada uno. Cargan nafta de un Hércules en la ida y siguen al ras, sin radar, hasta la posición que pasó el Neptune.',
    'Ahí suben, prenden el radar una sola vez, lanzan a 20 o 30 millas y vuelven al ras a Río Grande. Si un misil falla, queda el otro.']),
  R1_LO_QUE_PASO: tarjeta('R1_LO_QUE_PASO', r1.name, ['4 de mayo de 1982. A las 11:04 los dos Super Étendard lanzaron sus Exocet desde 20 a 30 millas, y volvieron al ras a Río Grande.', 'Uno alcanzó al HMS Sheffield. Murieron 20 tripulantes. Se hundió seis días después, mientras lo remolcaban.'], 'rot_lqp'),
  R2_CONTEXTO: tarjeta('R2_CONTEXTO', r2.name, [dato(r2),
    'HOY. Dos buques británicos, la Glasgow y la Brilliant, bombardean desde el mar las posiciones de Puerto Argentino. Es el último día de niebla.',
    'ANTES. En mayo las espoletas fallan seguido: muchas bombas atraviesan el buque sin estallar.',
    'El A-4B Skyhawk de la Fuerza Aérea no tiene misiles antibuque: ataca con una bomba, y para soltarla tiene que pasar por encima del buque, adentro de su antiaérea.',
    'EL PLAN. Dos escuadrillas de A-4B desde Río Gallegos: CUÑA sale a las 12:20 contra la Brilliant y ORO a las 12:30 contra la Glasgow.',
    'Al ras sobre el agua, una pasada por encima de cada buque, bombas y afuera. La Brilliant tiene Sea Wolf: no quedarse cerca.']),
  R2_LO_QUE_PASO: tarjeta('R2_LO_QUE_PASO', r2.name, ['12 de mayo de 1982. De ocho A-4B volvieron cuatro: los Sea Wolf de la Brilliant bajaron a tres de CUÑA.', 'Una bomba de ORO atravesó a la Glasgow de lado a lado y estalló en el agua: el destructor quedó fuera de combate el resto de la guerra.', 'Al volver, uno de ORO cruzó Pradera del Ganso y lo derribó la antiaérea propia.'], 'rot_lqp'),
  R3_CONTEXTO: tarjeta('R3_CONTEXTO', r3.name, [dato(r3),
    'HOY. 21 de mayo: los británicos desembarcan en San Carlos, y sus fragatas cubren el estrecho.',
    'ANTES. Después del Belgrano la flota argentina se quedó en el continente: los A-4Q de la Armada, hechos para el portaaviones, vuelan desde Río Grande.',
    'Sus bombas tienen cola retardadora: frenan en el aire y dan tiempo a escapar de la explosión, así que se pueden soltar más bajo.',
    'EL PLAN. La primera sección de la Tercera Escuadrilla despega a las 14:10: tres A-4Q con cuatro bombas cada uno.',
    'No hay Hércules: la nafta es la que se lleva. Entrar al ras por la boca del estrecho, con mal tiempo, buscar una fragata y soltar bajo.']),
  R3_LO_QUE_PASO: tarjeta('R3_LO_QUE_PASO', r3.name, ['21 de mayo de 1982. Los tres A-4Q le pegaron a la HMS Ardent; la segunda sección, ocho minutos después, también. La fragata se hundió.', 'A la salida, dos Sea Harrier derribaron a los tres: dos pilotos se eyectaron y sobrevivieron; el tercero no volvió.'], 'rot_lqp'),
  R4_CONTEXTO: tarjeta('R4_CONTEXTO', r4.name, [dato(r4),
    'HOY. 8 de junio. Los británicos siguen en el estrecho de San Carlos y mueven tropas hacia Bahía Agradable.',
    'ANTES. Desde el desembarco del 21 de mayo, las fragatas británicas cuidan el estrecho.',
    'El Dagger es la versión israelí del Mirage 5, de la Fuerza Aérea: más rápido que el Skyhawk, pero sin sonda para cargar nafta en vuelo.',
    'EL PLAN. Dos escuadrillas de Dagger, PERRO y GATO, salen de Río Grande con tres tanques y dos bombas de 250 kg cada uno: el alcance justo para ir, atacar y volver.',
    'No hay carga en vuelo: lo que se lleva es lo que hay. Uno vuelve al rato porque un pájaro le rompe el parabrisas: siguen cinco.']),
  R4_LO_QUE_PASO: tarjeta('R4_LO_QUE_PASO', r4.name, ['8 de junio de 1982. Cinco Dagger encontraron sola a la HMS Plymouth en el estrecho de San Carlos.', 'Cuatro bombas la alcanzaron: una atravesó la chimenea y otra hizo estallar una carga de profundidad. Quedó fuera de combate. Volvieron todos.'], 'rot_lqp'),
  // UNA HOJA POR TIPO DE AVION (23/11, el autor: "en la explicacion de la mision del Invincible, explicar los roles de cada
  // tipo de avion y como funciona; una hoja para cada tipo de avion"): el que lanza, el que escolta y la cisterna, cada uno
  // con su lamina y lo que se hace con el en el juego
  R5_CONTEXTO: tarjeta('R5_CONTEXTO', r5.name, [
    [dato(r5), 'mapa_invincible', 'RÍO GRANDE → EL GRUPO DE PORTAAVIONES'],
    ['HOY. 30 de mayo. El portaaviones Invincible navega con su grupo al este de las islas. Desde ahí despegan los Harrier.', 'invincible', 'HMS INVINCIBLE'],
    ['ANTES. De los cinco Exocet se usaron cuatro: dos contra el Sheffield el 4 de mayo y dos contra el Atlantic Conveyor el 25. Queda uno.', 'exocet', 'EXOCET AM39 · EL ÚLTIMO'],
    // (las hojas del plan llevan los dibujos de los aviones; la del radar, la barra con la zona donde se lo busca)
    ['EL PLAN. Despegan juntos dos Super Étendard, uno con el último Exocet, y cuatro A-4C de la Fuerza Aérea. Un Hércules los carga en la ida.', 'kc130', 'KC-130 · LA CARGA EN LA IDA'],
    ['Los Super Étendard buscan al Invincible con el radar antes de tenerlo a la vista, en la zona donde debería estar. Subir lo encuentra antes, pero los delata.', 'ui_busca', 'LA ZONA DE BÚSQUEDA'],
    ['Encontrado, lanzan el Exocet a distancia y vuelven al ras a Río Grande.', 'supere_exocet', 'SUPER ÉTENDARD · EL LANZAMIENTO'],
    ['Los A-4C los custodian hasta el lanzamiento. Después siguen al misil hasta el portaaviones, bajan lo que se le cruce y sueltan sus bombas.', 'a4c', 'A-4C · LA ESCOLTA'],
  ]),
  R6_CONTEXTO: tarjeta('R6_CONTEXTO', r6.name, [dato(r6), PENDIENTE]),
  R6_LO_QUE_PASO: tarjeta('R6_LO_QUE_PASO', r6.name, [PENDIENTE], 'rot_lqp'),
  R5_LO_QUE_PASO: tarjeta('R5_LO_QUE_PASO', r5.name, [
    ['30 de mayo de 1982. Según la Argentina, el Exocet y las bombas alcanzaron al HMS Invincible. Según los británicos, el misil cayó al mar y los A-4C atacaron a la fragata Avenger sin acertar.', 'invincible', 'HMS INVINCIBLE'],
    ['Dos de los cuatro A-4C fueron derribados; sus pilotos no volvieron.', 'a4c', 'A-4C SKYHAWK'],
  ], 'rot_lqp'),
};
