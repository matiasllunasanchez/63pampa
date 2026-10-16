// EL RADAR PROPIO — el store (la logica es systems/radarPropio.js; las reglas, data/radar_propio.js).
//
// Vive en core/ porque lo leen el render (la onda, la marca del blanco, el cuadro del tablero) y el
// vuelo (lo que te delata), y el render no puede importar sistemas (`npm run lint:layers`). El objeto
// se MUTA, nunca se reasigna (`npm run lint:state`).
export const radarP = {
  tiene: false,     // el avion de esta corrida lleva radar de busqueda
  on: false,        // prendido AHORA
  carga: 1,         // 0..1
  ondas: [],        // [{ t }] segundos de vida de cada onda que sale del avion
  cadaT: 0,         // reloj de la proxima onda
  marcaT: 0,        // segundos que le quedan a la marca del blanco (0 = sin marcar)
  ecoT: -1,         // segundos desde el ultimo eco (para el destello), -1 si nunca
  ve: false,        // este cuadro: prendido, a altura y con el blanco a tiro
  aereoT: 0,        // segundos que le quedan a la marca de los CONTACTOS AEREOS (los Harrier), 0 = sin marcar
  buquesT: 0,       // idem, los OTROS BUQUES del pasillo (fragatas y barcazas)
  onT: 0,           // segundos desde que se prendio esta vez
  detectando: false, // esta corriendo la deteccion (suena detecting)
  detectaT: 0,      // `onT` en que arranco la deteccion
  detectado: false, // ya detecto en esta prendida: las ondas marcan de una
};

export function resetRadarP(tiene) {
  radarP.tiene = !!tiene; radarP.on = false; radarP.carga = 1;
  radarP.ondas.length = 0; radarP.cadaT = 0; radarP.marcaT = 0; radarP.ecoT = -1; radarP.ve = false; radarP.aereoT = 0; radarP.buquesT = 0;
  radarP.onT = 0; radarP.detectando = false; radarP.detectaT = 0; radarP.detectado = false;
}
