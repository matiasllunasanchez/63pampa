// POR QUE PERDISTE — la pantalla de derrota explica lo que paso y cuenta algo de la guerra que
// tenga que ver con ESE caso (pedido del autor 28/9: "cada pantalla de perdiste explique que
// sucedio… y acote detalles de historia de cada caso puntual").
//
// Cada causa de muerte (`death_*`, las mismas claves del titular) apunta a dos textos de
// data/strings.js: `que` (lo que paso, en una o dos lineas) y `hist` (el dato historico). La BOMBA
// errada se explica por su VEREDICTO (systems/blanco.js: dormida, corta, larga…): no es lo mismo
// que no explote que caer al agua. Una causa que no esta aca muestra el dato al azar de siempre.
const CHOQUE = { que: 'que_choque', hist: 'hist_choque' };
const TIERRA = { que: 'que_tierra', hist: 'hist_tierra' };
const FUEGO = { que: 'que_fuego', hist: 'hist_fuego' };
const NAFTA = { que: 'que_nafta', hist: 'hist_nafta' };

export const DERROTAS = {
  death_sea: { que: 'que_mar', hist: 'hist_mar' },
  death_land: TIERRA, death_cliff: TIERRA, death_pared: TIERRA,
  death_mast: CHOQUE, death_tree: CHOQUE, death_flag: CHOQUE, death_tower: CHOQUE, death_wire: CHOQUE,
  death_bldg: CHOQUE, death_depot: CHOQUE, death_radar: CHOQUE, death_aagun: CHOQUE, death_lcu: CHOQUE,
  death_balloon: CHOQUE, death_barrera: CHOQUE,
  death_palos: { que: 'que_palos', hist: 'hist_palos' },
  death_estallido: { que: 'que_estallido', hist: 'hist_estallido' },
  death_onda: { que: 'que_estallido', hist: 'hist_estallido' },
  death_helo: { que: 'que_aire', hist: 'hist_choque' }, death_jet: { que: 'que_aire', hist: 'hist_choque' },
  death_missile: { que: 'que_misil', hist: 'hist_misil' },
  death_seadart: { que: 'que_seadart', hist: 'hist_misil' },
  death_seawolf: { que: 'que_seawolf', hist: 'hist_seawolf' },
  death_seacat: { que: 'que_seacat', hist: 'hist_seacat' },
  death_pintado: { que: 'que_pintado', hist: 'hist_misil' },
  death_gunfire: FUEGO, death_aa: FUEGO,
  death_bomb: { que: 'que_seaslug', hist: 'hist_seaslug' },
  death_popa: { que: 'que_popa', hist: 'hist_popa' },
  death_caza: { que: 'que_caza', hist: 'hist_caza' },
  // el dato historico es el mismo del Sea Harrier: ya habla de los Sidewinder de ultima generacion
  death_sidewinder: { que: 'que_sidewinder', hist: 'hist_caza' },
  death_fuel: NAFTA, death_seco: NAFTA,
  death_eyecto_rescate: { que: null, hist: 'hist_eyeccion' },
  death_eyecto_mar: { que: null, hist: 'hist_eyeccion' },
  death_pulso: { que: 'que_pulso', hist: 'hist_bomba' },
  death_pasada: { que: 'que_pasada', hist: 'hist_bomba' },
};

/** Lo que dice la pantalla para la causa `causa`. `veredicto` es el de la ultima bomba sobre el
 *  buque (blanco.res) y solo cuenta cuando se perdio por errar la suelta. Devuelve { que, hist }
 *  con CLAVES de strings (null = no hay). */
// (`bomba` es la de la mision, 'mk17' | 'brp' — data/bombas.js: sin dormida, el dato es el de ESA
// bomba, su origen incluido)
export function derrota(causa, veredicto, bomba) {
  if (causa === 'death_fallo_blanco' || causa === 'death_suelta') {
    const v = ['dormida', 'corta', 'larga', 'costado', 'averiado'].includes(veredicto) ? veredicto : 'nada';
    const hist = v === 'dormida' ? 'hist_bomba_dormida'
      : bomba === 'mk17' || bomba === 'brp' ? 'hist_bomba_' + bomba : 'hist_bomba';
    return { que: 'que_bomba_' + v, hist };
  }
  return DERROTAS[causa] || { que: null, hist: null };
}
