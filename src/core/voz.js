// LA VOZ DE LOS PERSONAJES POR RADIO, para quien no es el orquestador (28/9: los avisos de la
// persecucion y del Sea Harrier dejaron de ser carteles — "tienen que ser dialogos de personajes").
//
// Es la caja de radio de siempre (core/radioVN.js), con la tabla de CARAS: el texto lleva el nombre
// del que habla ('PUMA: …') y de ahi sale su retrato. La tabla vive aca para que la compartan
// game.js y los sistemas; los ids validos los lista `python3 tools/hacer_prompts_retratos.py --ids`.
import { decir } from './radioVN.js';

export const CARA_DE_RADIO = {
  CONDOR: 'condor_radio', 'CÓNDOR': 'condor_radio',
  PUMA: 'puma_neutro', GITANO: 'gitano_neutro', VASCO: 'vasco_neutro',
  PICHON: 'pichon_neutro', 'PICHÓN': 'pichon_neutro',
  TERO: 'tero_casco', ESTEBAN: 'tero_casco',   // en vuelo van con el casco puesto
  'EL TURCO': 'turco_neutro', TURCO: 'turco_neutro',
};

/** Dice `txt` por la radio en boca de `quien` ('PUMA', 'GITANO'…), con su cara. */
export function hablar(quien, txt) { decir(quien + ': ' + txt, n => CARA_DE_RADIO[n] || null); }
