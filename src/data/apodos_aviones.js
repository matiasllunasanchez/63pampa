// EL NOMBRE DE USO DE CADA AVION (23/11/2026, el autor: "pongamos AERMACCHI o PUCARÁ o SKYHAWK, etc"): lo que va
// arriba de la cara del piloto en el tablero (render/hud.js drawPiloto). El nombre largo de la ficha sigue en
// data/planes.js `name`; este es el que se decia en la base.
export const APODO_AVION = {
  sky: 'SKYHAWK', a4q: 'SKYHAWK', dagger: 'DAGGER', supere: 'SUPER ÉTENDARD', mirage: 'MIRAGE', pampa: 'PAMPA',
  pucara: 'PUCARÁ', mb339: 'AERMACCHI', herc: 'HÉRCULES', neptune: 'NEPTUNE', learjet: 'LEARJET', citation: 'CITATION',
  merlin: 'MERLIN', mu2: 'MU-2', aerostar: 'AEROSTAR', commander: 'COMMANDER', guarani: 'GUARANÍ',
  chinook_faa: 'CHINOOK', chinook_ej: 'CHINOOK', uh1h: 'HUEY', bell212: 'BELL 212', puma_ej: 'PUMA', puma_pna: 'PUMA',
  a109: 'HIRUNDO', t34c: 'MENTOR', skyvan: 'SKYVAN',
};
/** El nombre de uso del avion `pl` (o su nombre de ficha si no tiene). */
export const apodoAvion = pl => (pl ? APODO_AVION[pl.key] || pl.name : '');
