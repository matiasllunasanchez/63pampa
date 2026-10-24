// EL PILOTO DE CADA AVION en los modos sueltos (POR LA PATRIA y CICLO DE MUERTE), autor 24/10: "un
// piloto para cada avion seleccionable (...) los pilotos random tienen que estar todos dentro de
// aviones". Una clave por avion de data/planes.js; null = todavia sin retratos (sus hojas esperan en
// docs/historia/chats_hojas/13_… a 27_…, ver 00_INDICE.md), y ahi el HUD sigue sin cara como hasta hoy.
//
// `caras`: el retrato de assets/portraits para cada gesto del HUD (GESTOS de data/gestos.js). Van
// todas las de ADENTRO DEL AVION: la cara del piloto se ve volando. La Chancha es el unico personaje
// CRUZADO —campaña y modos sueltos— y en vuelo usa sus chancha_cab_* (con la cabina del Hercules).
export const PILOTOS_AVION = {
  sky: { nombre: 'EL CRIOLLO', caras: { neutro: 'av_a4b_neutro', sonrisa: 'av_a4b_sonrisa', preocupado: 'av_a4b_preocupado', ceno: 'av_a4b_ceno', roto: 'av_a4b_miedo' } },
  dagger: null,
  supere: null,
  a4q: null,
  herc: { nombre: 'LA CHANCHA', caras: { neutro: 'chancha_cab_escucha', sonrisa: 'chancha_cab_sonrisa', preocupado: 'chancha_cab_preocupado', ceno: 'chancha_cab_concentrado', roto: 'chancha_cab_roto' } },
  mirage: null,
  pampa: null,
  pucara: null,
  mb339: null,
  neptune: null,
  learjet: null,
  citation: null,
  merlin: null,
  mu2: null,
  aerostar: null,
  commander: null,
  guarani: null,
};
