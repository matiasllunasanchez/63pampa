// LA BUSQUEDA EN EL MAR — el RESCATE DEL BELGRANO (libro de vuelo r6, 21/11/2026). La logica en
// systems/islas/busqueda.js; el dibujo en systems/islas/busqueda3d.js. Se vuela con el motor de LAS ISLAS sobre
// MAR ABIERTO (fuera del mapa de las Malvinas no hay tierra: todo es agua).
//
// El autor, 21/11: "1. Volar bajo las nubes para poder ver, con el mar picado. 2. Barrer la zona en espiral hasta
// encontrar la mancha y despues las balsas. 3. Marcarlas con humo, porque si no las perdes. 4. Subir en circulos
// para que el destructor las tome. 5. Volver con la nafta justa, que es el verdadero enemigo."
//
// LO QUE DICEN LAS FUENTES (Armada: argentina.gob.ar/armada/crucero-ara-general-belgrano; Boletin del Centro Naval
// 829): el 2-P-112 busco de noche unas nueve horas, muy bajo, sin indicios; hacia las 05:00 lo relevo el 2-P-111,
// tambien muy bajo por el techo de nubes. Poco despues de las 09:00 vio una MANCHA DE ACEITE de unos 300 m de ancho
// que se extendia hacia el SE, y abrio una busqueda en cuadrados que se agrandan; los destructores D-26 y D-29 y el
// aviso A-3 fueron para alla. El HUMO y los CIRCULOS son mecanica de juego (a verificar: PREGUNTAS_HISTORICAS).
// ⚠ Los numeros son de juego.

export const BUSQ = {
  // LA ZONA: un circulo con centro a ZONA_A m adelante de donde se entra, radio ZONA_R. Fuera, el aviso
  ZONA_A: 3500, ZONA_R: 7000,
  // VER: lo que esta a menos de VISTA m (horizontal) se ve si volas abajo del techo de nubes; mas abajo, mas lejos
  // (VISTA_BAJO a ras del agua) — y adentro de la nube, nada
  TECHO: 150, VISTA: 260, VISTA_BAJO: 420, BAJO: 50,
  // (26/11, el autor: "estoy a 1120 m y en algun punto debo sobrepasar el piso de NUBES BLANCAS para llegar al cielo
  // limpio"): la capa tiene TECHO arriba — de TECHO a TOPE estas adentro (todo blanco); arriba, cielo y un PISO de nubes
  TOPE: 240,
  // LA MANCHA DE ACEITE: ANCHO m de ancho y LARGO de largo, hacia el SE (RUMBO, grados), desde una de las BENGALAS
  MANCHA_ANCHO: 300, MANCHA_LARGO: 1800, MANCHA_RUMBO: 135,
  // LAS BENGALAS (26/11): cuantas, a que distancia del centro, separadas cuanto (y de la entrada); el radar las barre a
  // menos de BENGALA_R, arriba de RADAR_ALT, durante BENGALA_S segundos
  // (26/11, el autor: "pocas bengalas, 3 o 4, y 2 o 3 grupos de balsas; 1 o 2 bengalas solas lejos"): GRUPOS de las
  // BENGALAS tienen balsas al lado (a GRUPO_A m, entre BENGALA_D del centro); las solas, mas lejos (BENGALA_SOLA_D)
  BENGALAS: 4, GRUPOS: 2, GRUPO_A: 260, BENGALA_D: [700, 2400], BENGALA_SOLA_D: [2600, 3800], BENGALA_SEP: 1400,   // (26/11, el autor: "estan demasiado lejos": eran [900, 5200] y 2200)
  BENGALA_R: 2000, BENGALA_S: 2.5, RADAR_ALT: 22, BENGALA_CERCA: 450,   // (pasar a BENGALA_CERCA m de una sola la da por revisada)
  // LAS BALSAS: N, en un racimo de RACIMO m, DERIVA m mas alla de la punta SE de la mancha
  BALSAS_N: 6, RACIMO: 110, DERIVA: [700, 1300],
  // SI NO LAS MARCAS SE PIERDEN: alejarse PIERDE m de las balsas sin humo y vuelven a ser invisibles (derivaron)
  PIERDE: 1600, DERIVA_PERDIDA: 600,
  // EL HUMO: HUMOS marcadores; uno que cae a menos de MARCA m del racimo las marca. Dura HUMO_S s (y se renueva)
  // (FRENTE / FRENTE_ANG: soltar la bengala con el grupo adelante, a menos de FRENTE m y dentro de ±FRENTE_ANG°, ya marca)
  // (26/11, el autor: "formas de perder"): HUMOS bengalas de humo, bastantes pero contadas — si se acaban y falta marcar
  // algun grupo, se pierde; y LA NAFTA de la busqueda: arranca en NAFTA_INI % y baja NAFTA_S %/s (sin el piso de la ida)
  NAFTA_INI: 60, NAFTA_S: 0.25, NAFTA_AVISO: 15,
  HUMOS: 5, MARCA: 320, FRENTE: 1100, FRENTE_ANG: 35, HUMO_S: 240,
  // LOS CIRCULOS: arriba de CIRCULO_ALT m, a menos de CIRCULO_R m del humo, sumar VUELTAS vueltas de rumbo
  CIRCULO_ALT: 260, CIRCULO_R: 1500, VUELTAS: 2, CIRCULO_S: 3.5,   // (26/11: RADAR prendido CIRCULO_S s, arriba y cerca)
  // LOS INDICIOS FALSOS: cuantos, y a que distancia del centro (lo que se ve en el mar y no es)
  INDICIOS_N: 9,
};
// (LA NAFTA en la busqueda es la del vuelo de siempre: flight.js la gasta igual sobre el mapa — `cfg.fuelScale`
// de la salida en data/libro_vuelo.js es lo que la hace justa)

/** LOS INDICIOS: lo que se ve en el agua y NO son las balsas. `n` el cartel (data/strings.js `busq_ind_<id>`),
 *  `c` el color del dibujo, `t` el tamaño (m). */
export const INDICIOS = [
  { id: 'espuma', c: [0.92, 0.95, 0.97], t: 26 },
  { id: 'restos', c: [0.32, 0.26, 0.2], t: 8 },
  { id: 'cajon', c: [0.55, 0.45, 0.3], t: 4 },
  { id: 'bidon', c: [0.75, 0.2, 0.12], t: 3 },
  { id: 'algas', c: [0.25, 0.32, 0.18], t: 30 },
  { id: 'lobos', c: [0.2, 0.18, 0.16], t: 10 },
];
