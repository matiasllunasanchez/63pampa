// LA VOZ DE LOS PERSONAJES POR RADIO, para quien no es el orquestador (28/9: los avisos de la
// persecucion y del Sea Harrier dejaron de ser carteles — "tienen que ser dialogos de personajes").
//
// Es la caja de radio de siempre (core/radioVN.js), con la tabla de CARAS: el texto lleva el nombre
// del que habla ('PUMA: …') y de ahi sale su retrato. La tabla vive aca para que la compartan
// game.js y los sistemas; los ids validos los lista `python3 tools/hacer_prompts_retratos.py --ids`.
import { decir, partirHablante } from './radioVN.js';
import { hashTexto } from './azar.js';
import { PILOTOS_GENERALES, carasGeneral } from '../data/pilotos_generales.js';

export const CARA_DE_RADIO = {
  CONDOR: 'condor_radio', 'CÓNDOR': 'condor_radio',
  PUMA: 'puma_neutro', GITANO: 'gitano_neutro', VASCO: 'vasco_neutro',
  PICHON: 'pichon_neutro', 'PICHÓN': 'pichon_neutro',
  TERO: 'tero_casco', ESTEBAN: 'tero_casco',   // en vuelo van con el casco puesto
  PILOTO: 'tero_casco',   // el del LIBRO DE VUELO: la cara de Esteban hasta tener un retrato propio
  'EL TURCO': 'turco_neutro', TURCO: 'turco_neutro',
};

// ---------- LA RADIO DEL LIBRO DE VUELO (17/11, el autor) ----------
// "Los dialogos tienen que tener siempre un personaje… todos tienen que tener imagen, aleatoria aunque no
// la misma que tiene el piloto". En el libro no vuela nadie de la campaña: lo que los sistemas le hacen
// decir al elenco (PUMA grita el Harrier, PATRIA 2 avisa el radar) lo dice EL NUMERAL — el amigo que vuela
// detras, con su apodo y su cara (data/pilotos_generales.js). Sin amigo en el aire, esa voz se calla.
// game.js prende esto al armar una salida (`setVozLibro`) y lo apaga en cualquier otro modo.
const DEL_ELENCO = new Set(['PATRIA 2', 'PUMA', 'GITANO', 'VASCO', 'PICHON', 'PICHÓN', 'TERO', 'ESTEBAN', 'PILOTO', 'EL TURCO', 'TURCO']);
let libro = null;   // { numeral: () => nombre | null, piloto: () => nombre }

/** `ctx` = { numeral, piloto } (funciones) para el libro de vuelo; null fuera de el. */
export function setVozLibro(ctx) { libro = ctx || null; }

/** La cara de quien habla. En el libro, nadie queda sin cara: un nombre sin retrato propio lleva uno
 *  de los pilotos generales, fijo por nombre y nunca el del que vuela. */
export function caraDe(n) {
  if (!n) return null;
  const g = carasGeneral(n);
  if (g) return g.neutro;
  if (CARA_DE_RADIO[n]) return CARA_DE_RADIO[n];
  if (!libro) return null;
  const yo = libro.piloto(), pool = PILOTOS_GENERALES.filter(p => p.nombre !== yo);
  return pool[Math.abs(hashTexto(n)) % pool.length].caras.neutro;
}

/** Dice una linea entera ('QUIEN: texto'). En el libro, el elenco pasa al numeral (o se calla si no hay). */
export function decirLinea(raw) {
  // 'PATRIA 2' lleva un numero y partirHablante no lo toma por nombre: se mira a mano
  const m = /^PATRIA 2:\s*/.exec(raw || '');
  let { personaje, txt } = m ? { personaje: 'PATRIA 2', txt: raw.slice(m[0].length) } : partirHablante(raw);
  if (libro && personaje && DEL_ELENCO.has(personaje)) {
    const quien = libro.numeral();
    if (!quien) return false;
    personaje = quien;
  }
  decir(personaje ? personaje + ': ' + txt : txt, caraDe);
  return true;
}

/** Dice `txt` por la radio en boca de `quien` ('PUMA', 'GITANO'…), con su cara. */
export function hablar(quien, txt) { decirLinea(quien + ': ' + txt); }
