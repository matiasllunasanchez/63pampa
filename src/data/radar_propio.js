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
  AVIONES: ['supere'],
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
  COLOR: [90, 180, 255],
  // LOS OTROS BUQUES DEL PASILLO (15/10, el autor: "que marque tambien los otros buques, sin texto, solo
  // flechitas azules: son puntos nomas"): la fragata del mastil y la barcaza. Estan cerca —no los tapa el
  // horizonte—, asi que se marcan a cualquier altura, como los Harrier.
  BUQUES: ['mast', 'lcu'],
  // EL TAMAÑO DEL ECO (15/10, el autor: "la flecha tiene tamaño segun lo que sea el eco, grande o chico"):
  // la escala de la flechita por contacto. El blanco final (render/world.js `marcaRadar`) es el 1.
  ECO: { lcu: 0.55, mast: 0.8, harrier: 0.6 },
};
/** ¿Este obstaculo es un buque que el radar marca? Vivo y adelante tuyo (`pz` = la profundidad del avion). */
export const buqueRadar = (o, pz) => RADAR_PROPIO.BUQUES.includes(o.type) && o.z > pz + 2 && !o.dead && !(o.hp <= 0);
