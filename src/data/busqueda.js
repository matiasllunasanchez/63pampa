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
  // LA MANCHA DE ACEITE: ANCHO m de ancho y LARGO de largo, hacia el SE (RUMBO, grados), a MANCHA_D m del centro
  MANCHA_ANCHO: 300, MANCHA_LARGO: 1800, MANCHA_RUMBO: 135, MANCHA_D: [2500, 4200],
  // LAS BALSAS: N, en un racimo de RACIMO m, DERIVA m mas alla de la punta SE de la mancha
  BALSAS_N: 9, RACIMO: 140, DERIVA: [700, 1300],
  // SI NO LAS MARCAS SE PIERDEN: alejarse PIERDE m de las balsas sin humo y vuelven a ser invisibles (derivaron)
  PIERDE: 1600, DERIVA_PERDIDA: 600,
  // EL HUMO: HUMOS marcadores; uno que cae a menos de MARCA m del racimo las marca. Dura HUMO_S s (y se renueva)
  HUMOS: 6, MARCA: 320, HUMO_S: 240,
  // LOS CIRCULOS: arriba de CIRCULO_ALT m, a menos de CIRCULO_R m del humo, sumar VUELTAS vueltas de rumbo
  CIRCULO_ALT: 260, CIRCULO_R: 2600, VUELTAS: 2,
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
