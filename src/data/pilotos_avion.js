// EL PILOTO DE CADA AVION en los modos sueltos (POR LA PATRIA y CICLO DE MUERTE), autor 24/10: "un
// piloto para cada avion seleccionable (...) los pilotos random tienen que estar todos dentro de
// aviones". Una clave por avion de data/planes.js; null = sin retratos (el HUD queda sin cara). Los pilotos
// propios de cada avion esperan en docs/historia/chats_hojas/13_… a 27_… (ver 00_INDICE.md).
//
// `caras`: el retrato de assets/portraits para cada gesto del HUD (GESTOS de data/gestos.js). Van
// todas las de ADENTRO DEL AVION: la cara del piloto se ve volando. La Chancha es el unico personaje
// CRUZADO —campaña y modos sueltos— y en vuelo usa sus chancha_cab_* (con la cabina del Hercules).
//
// POR AHORA TODOS SON EL CRIOLLO (autor, 11/11: "todos los de por la patria o ciclo de muerte tienen que
// ser el criollo") menos el Hercules, que es la Chancha. Cuando un avion tenga su piloto, se cambia su fila.
const CRIOLLO = { nombre: 'EL CRIOLLO', caras: { neutro: 'av_a4b_neutro', sonrisa: 'av_a4b_sonrisa', preocupado: 'av_a4b_preocupado', ceno: 'av_a4b_ceno', roto: 'av_a4b_miedo' } };

export const PILOTOS_AVION = {
  sky: CRIOLLO,
  dagger: CRIOLLO,
  supere: CRIOLLO,
  a4q: CRIOLLO,
  herc: { nombre: 'LA CHANCHA', caras: { neutro: 'chancha_cab_escucha', sonrisa: 'chancha_cab_sonrisa', preocupado: 'chancha_cab_preocupado', ceno: 'chancha_cab_concentrado', roto: 'chancha_cab_roto' } },
  mirage: CRIOLLO,
  pampa: CRIOLLO,
  pucara: CRIOLLO,
  mb339: CRIOLLO,
  neptune: CRIOLLO,
  learjet: CRIOLLO,
  citation: CRIOLLO,
  merlin: CRIOLLO,
  mu2: CRIOLLO,
  aerostar: CRIOLLO,
  commander: CRIOLLO,
  guarani: CRIOLLO,
};
