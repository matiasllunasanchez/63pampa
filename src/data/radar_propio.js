// EL RADAR PROPIO — el de busqueda del avion, que el piloto prende y apaga (15/10/2026).
//
// Pedido del autor: "una mecanica de radar interno en aviones como el Super Etendard, que lo podamos
// prender nosotros, con una onda de radar circular que salga del avion, azul, y nos marque el
// objetivo". Decidido con el autor (15/10): TE DELATA y tiene CARGA LIMITADA, hay que SUBIR para que
// vea el blanco, y lo llevan SOLO los aviones que tenian radar de busqueda.
//
// LO HISTORICO: el 4 de mayo los Super Etendard volaron al ras con el Agave APAGADO (silencio de radio
// y de radar), subieron una vez cerca del blanco, lo prendieron unos segundos para enganchar al buque,
// bajaron y lanzaron. Prenderlo era delatarse: los buques escuchaban la emision. De ahi las tres
// reglas del juego. (Los numeros de alcance, A VERIFICAR — docs/historia/PREGUNTAS_HISTORICAS.md.)
export const RADAR_PROPIO = {
  // QUIEN LO LLEVA. El Agave del Super Etendard. El Mirage del juego es el 5P MARA, que no llevaba
  // radar de busqueda; los A-4 y el Dagger, tampoco.
  // (23/11, el autor: "Dagger y Mirage tienen radar tambien"): el suyo, CORTO — ver POR_AVION
  AVIONES: ['supere', 'neptune', 'dagger', 'mirage'],
  // HAY QUE SUBIR: al ras el horizonte tapa el buque. Por encima del radar enemigo (RADAR_ALT = 20):
  // el pop-up real te ponia arriba de su horizonte — mirar es dejarse mirar.
  ALT_MIN: 22,
  // HASTA DONDE VE. Con ruta, en km al blanco (el Agave contra un buque grande, ~50 millas: A VERIFICAR);
  // sin ruta, en metros de pasillo.
  ALCANCE_KM: 90,
  ALCANCE_M: 2500,
  // LA CARGA: unos 4 s de barrido seguido y ~25 s para llenarse de nuevo. Prenderlo es una decision.
  GASTA: 0.25,       // carga por segundo prendido
  RECARGA: 0.04,     // carga por segundo apagado
  MIN_PRENDER: 0.15, // con menos que esto no prende (un parpadeo no barre nada)
  // TE DELATA: lo que suma a la barra del radar enemigo (`run.detection`, la de DETECTANDO) por
  // segundo prendido — aunque vueles al ras. La barra se llena en 1 por si sola en 1,4 s arriba.
  DELATA: 0.45,
  // LA ONDA AZUL: sale del avion cada ONDA_CADA segundos y se abre durante ONDA_VIDA.
  ONDA_CADA: 0.9,
  ONDA_VIDA: 1.3,
  ONDA_R: 260,       // radio final en pixeles de mundo (480 de ancho): cruza la pantalla
  // EL ECO: cuando una onda llega con el blanco a tiro, el blanco queda MARCADO estos segundos.
  MARCA_T: 12,
  // LA DETECCION (16/10, el autor): al prender, primero sale la onda y suena el radar azul; recien al
  // segundo empieza a DETECTAR (suena detecting) y cuando termina quedan marcadas las flechitas. Antes de
  // eso las ondas salen pero no marcan nada. Solo la primera vez de cada prendida: despues marca de una.
  DETECTA_DESDE: 1.0,  // segundos de prendido hasta que empieza a detectar
  DETECTA_DUR: 1.2,    // lo que tarda en detectar (lo que suena detecting)
  COLOR: [90, 180, 255],
  // LOS OTROS BUQUES DEL PASILLO (15/10, el autor: "que marque tambien los otros buques, sin texto, solo
  // flechitas azules: son puntos nomas"): la fragata del mastil y la barcaza. Estan cerca —no los tapa el
  // horizonte—, asi que se marcan a cualquier altura, como los Harrier.
  BUQUES: ['mast', 'lcu'],
  // EL TAMAÑO DEL ECO (15/10, el autor: "la flecha tiene tamaño segun lo que sea el eco, grande o chico"):
  // la escala de la flechita por contacto. El blanco final (render/world.js `marcaRadar`) es el 1.
  ECO: { lcu: 0.55, mast: 0.8, harrier: 0.6 },
};
// EL NEPTUNE (21/11, el autor: "armá un NEPTUNE… este solo radar, y mas grande de alcance o mas potente que el Super
// Etendard"). El SP-2H no tenia armas: su guerra era el APS-20, el radar de busqueda maritima grande bajo la panza, que
// barria cientos de km de mar (contra los ~50 millas del Agave). En el juego: ve MUCHO mas lejos, barre mas tiempo con
// una carga y recarga antes, la onda es mas grande y lenta y lo marcado dura mas. El precio: es un emisor enorme y TE
// DELATA mas. Lo que no se pisa aca sale de RADAR_PROPIO. (Los numeros, de juego: A VERIFICAR.)
// EL DAGGER Y EL MIRAGE (23/11, el autor: "Dagger y Mirage tienen radar tambien"; decidido con el autor: corto). Lo que
// se sabe: el Dagger llevaba un radar TELEMETRICO (Elta EL/M-2001B: mide la distancia para apuntar, no busca) y el Mirage
// 5P, a verificar. En el juego, un radar de alcance CORTO: marca lo que tenes adelante y cerca, barre menos con una carga
// y delata menos (emite poco). A VERIFICAR (docs/historia/PREGUNTAS_HISTORICAS.md).
const CORTO = { ALCANCE_KM: 15, ALCANCE_M: 700, GASTA: 0.35, DELATA: 0.25, ONDA_R: 120 };
export const POR_AVION = {
  supere: {},
  dagger: CORTO,
  mirage: CORTO,
  neptune: { ALCANCE_KM: 320, ALCANCE_M: 6500, GASTA: 0.09, RECARGA: 0.07, MIN_PRENDER: 0.1, DELATA: 0.7,
    ONDA_CADA: 1.3, ONDA_VIDA: 1.8, ONDA_R: 420, MARCA_T: 25, DETECTA_DESDE: 0.6, DETECTA_DUR: 0.8, COLOR: [110, 200, 255] },
};
/** Las reglas del radar de `key` (RADAR_PROPIO con lo propio del avion encima). */
export const radarDe = key => ({ ...RADAR_PROPIO, ...(POR_AVION[key] || {}) });
/** ¿Este obstaculo es un buque que el radar marca? Vivo y adelante tuyo (`pz` = la profundidad del avion). */
export const buqueRadar = (o, pz) => RADAR_PROPIO.BUQUES.includes(o.type) && o.z > pz + 2 && !o.dead && !(o.hp <= 0);
