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
function fases({ lejos = MAR, cerca = DEFENSA, blanco = {}, vuelta = VUELTA_TRANQUILA, grito = {}, casa = true } = {}) {
  // EL TRANSITO ALTO ES UN CUARTO DE LA IDA (en t17 era 16%): es donde ocurre la cita con el Hercules,
  // y tiene que alcanzar para que llegue, te enganche y te llene ANTES de la linea del radar (que se
  // ancla al comienzo del descenso). Con 16% pasaba de largo (autor, 12/10).
  const ida = [
    { tipo: 'transito', hasta: 0.12, solo: MAR, bombs: 0, bidones: false },
    { tipo: 'transito', hasta: 0.25, solo: MAR, bombs: 0, bidones: false },
    { tipo: 'descenso', hasta: 0.30, solo: MAR, bombs: 0, bidones: false },
    { tipo: 'rasante', hasta: 0.55, solo: lejos, bombs: 0, bidones: false },
    { tipo: 'rasante', hasta: 0.82, solo: cerca, bombs: 0, bidones: false },
    { tipo: 'filo', hasta: 0.88, radar: 6, bombs: 0, bidones: false },
    { tipo: 'blanco', hasta: 1, solo: cerca, bombs: 0, bidones: false, ...blanco },
  ];
  // SIN VUELTA (`casa: false`): el climax cierra la mision. Es el caso del PULSO — despues de la
  // cinematica no hay pasillo de regreso que funcione (se volaba con el mar en negro, 12/10).
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
  despegue: { desde: 'BAN RÍO GRANDE', rumbo: 'blanco: destructor clase 42' },
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
  // LA CARGA REAL era un Exocet AM39 bajo el ala derecha y un tanque de 1.100 l bajo la izquierda.
  // El juego no tiene capa de Exocet: se cuelga UN TANQUE (`tanque`) y el rotulo dice la verdad.
  aviones: [
    { chapa: '3-A-202', plane: 'supere', carga: 'tanque', cargaTxt: 'EXOCET AM39 + 1 TANQUE' },
    { chapa: '3-A-203', plane: 'supere', carga: 'tanque', cargaTxt: 'EXOCET AM39 + 1 TANQUE' },
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
  id: 'r2', name: 'LA GLASGOW',
  fecha: '12 DE MAYO DE 1982', hora: '12:30', horaQue: 'despegue',
  desc: 'Dos escuadrillas de A-4B salen de Río Gallegos contra dos buques en el estrecho. Volás la segunda, ORO, contra la Glasgow.',
  despegue: { desde: 'BAM RÍO GALLEGOS', rumbo: 'blanco: destructor clase 42' },
  goal: { kind: 'ship', ship: 'HMS GLASGOW', dist: LARGO },
  climax: 'suelta',
  // LA MK-17 (la de las espoletas que fallaban en todo mayo) y el SEA WOLF: lo tiraba la Brilliant, que
  // escoltaba a la Glasgow, y fue lo que bajo a la escuadrilla CUÑA. El juego lo pone en el blanco.
  bomba: 'mk17', defensa: 'wolf',
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
  despegue: { desde: 'BAN RÍO GRANDE', rumbo: 'blanco alternativo: bahía San Carlos' },
  goal: { kind: 'ship', ship: 'HMS ARDENT', dist: LARGO },
  climax: 'suelta',
  // LA BRP-250 hasta que exista la MK-82 Snakeye: es la bomba con cola retardadora que el juego ya
  // tiene (la mas parecida en como cae). La Ardent tenia Sea Cat.
  bomba: 'brp', defensa: 'cat',
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
  despegue: { desde: 'BAN RÍO GRANDE', rumbo: 'rumbo: Bahía Agradable' },
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

/** Las cuatro, en orden de fecha: es el orden del LIBRO DE VUELO. */
export const LIBRO_VUELO = [r1, r2, r3, r4];

// ---------------------------------------------------------------------------------------------
// LAS ESCENAS (mismo formato que data/story.js; las lee core/dialogue.js).
//
// EL CONTEXTO es una TARJETA: el dato (fecha · hora · base) y, debajo, el contexto. LO QUE PASÓ es
// otra TARJETA. Una linea por frase larga: la tarjeta pasa de a una.
const tarjeta = (id, titulo, lineas) => ({
  id, tipo: 'TARJETA', titulo,
  lineas: lineas.map((es, i) => ({ id: id + '_' + String((i + 1) * 10).padStart(3, '0'), personaje: null, cara: null, hold: 0, es, en: '' })),
});
const dato = m => m.fecha + ' · ' + m.hora + ' · ' + m.despegue.desde;

export const LIBRO_SCENES = {
  R1_CONTEXTO: tarjeta('R1_CONTEXTO', r1.name, [dato(r1), 'Un Neptune de la Armada encontró a la flota esa mañana. Dos Super Étendard despegaron de Río Grande a las 09:45 y cargaron nafta de un Hércules en la ida.', 'Al ras del mar, sin radar, hasta la posición que pasó el Neptune. Para apuntar hay que subir y prender el radar: una sola vez.']),
  R1_LO_QUE_PASO: tarjeta('R1_LO_QUE_PASO', 'LO QUE PASÓ · ' + r1.name, ['4 de mayo de 1982. A las 11:04 los dos Super Étendard lanzaron sus Exocet desde 20 a 30 millas, y volvieron al ras a Río Grande.', 'Uno alcanzó al HMS Sheffield. Murieron 20 tripulantes. Se hundió seis días después, mientras lo remolcaban.']),
  R2_CONTEXTO: tarjeta('R2_CONTEXTO', r2.name, [dato(r2), 'Dos buques británicos bombardeaban las posiciones de Puerto Argentino. A las 12:20 salió la escuadrilla CUÑA contra la Brilliant; a las 12:30, ORO contra la Glasgow.', 'La Brilliant tiene Sea Wolf. Último día de niebla.']),
  R2_LO_QUE_PASO: tarjeta('R2_LO_QUE_PASO', 'LO QUE PASÓ · ' + r2.name, ['12 de mayo de 1982. De ocho A-4B volvieron cuatro: los Sea Wolf de la Brilliant bajaron a tres de CUÑA.', 'Una bomba de ORO atravesó a la Glasgow de lado a lado y estalló en el agua: el destructor quedó fuera de combate el resto de la guerra.', 'Al volver, uno de ORO cruzó Pradera del Ganso y lo derribó la antiaérea propia.']),
  R3_CONTEXTO: tarjeta('R3_CONTEXTO', r3.name, [dato(r3), '21 de mayo, el día del desembarco en San Carlos. La primera sección de la Tercera Escuadrilla despega de Río Grande a las 14:10, con cuatro bombas con cola retardadora cada uno.', 'No hay Hércules: la nafta es la que se lleva. Hay mal tiempo en la boca del estrecho.']),
  R3_LO_QUE_PASO: tarjeta('R3_LO_QUE_PASO', 'LO QUE PASÓ · ' + r3.name, ['21 de mayo de 1982. Los tres A-4Q le pegaron a la HMS Ardent; la segunda sección, ocho minutos después, también. La fragata se hundió.', 'A la salida, dos Sea Harrier derribaron a los tres: dos pilotos se eyectaron y sobrevivieron; el tercero no volvió.']),
  R4_CONTEXTO: tarjeta('R4_CONTEXTO', r4.name, [dato(r4), '8 de junio. Dos escuadrillas de Dagger, PERRO y GATO, salen de Río Grande. Uno vuelve porque un pájaro le rompe el parabrisas: quedan cinco.', 'El Dagger no carga nafta en vuelo: lo que llevás es lo que hay.']),
  R4_LO_QUE_PASO: tarjeta('R4_LO_QUE_PASO', 'LO QUE PASÓ · ' + r4.name, ['8 de junio de 1982. Cinco Dagger encontraron sola a la HMS Plymouth en el estrecho de San Carlos.', 'Cuatro bombas la alcanzaron: una atravesó la chimenea y otra hizo estallar una carga de profundidad. Quedó fuera de combate. Volvieron todos.']),
};
