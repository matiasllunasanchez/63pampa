// GEOGRAFIA — la carga de la corrida y sus sondas (docs/sistemas/PLAN_GEOGRAFIA.md).
//
// La matematica y el store viven en core/geografia.js, que es puro y lo lee el render. Aca vive lo
// que NO es puro: saber si la URL trae una sonda que pisa la data, y las sondas de consola.
import { setGeografia, validarGeografia, geo, sueloEn, esTierraEn, orillaS, ladoEn, alturaSuelo } from '../core/geografia.js';
import { GEOGRAFIAS } from '../data/geografias.js';

// `?geo=<nombre>`: vuela la mision que sea con una geografia de data/geografias.js encima. Se lee
// UNA vez: la URL no cambia durante la corrida.
let pisada = null;
// `?geo=ninguna`: la mision SIN su geografia — el mapa de siempre, `cfg.terrain` en todo el camino.
// Es la forma de comparar, y la que usa el fixture para mirar una mision sin nada puesto.
let ninguna = false;
if (typeof location !== 'undefined') {
  const m = /[?&]geo=([a-z0-9_]+)/i.exec(location.search || '');
  if (m && m[1] === 'ninguna') ninguna = true;
  else if (m) {
    const g = GEOGRAFIAS[m[1]];
    const e = validarGeografia(g);
    if (!g) console.error(`?geo=${m[1]}: no existe (hay: ${Object.keys(GEOGRAFIAS).join(', ')})`);
    else if (e.length) console.error(`?geo=${m[1]}: ${e.join(' · ')}`);
    else pisada = g;
  }
}

/** Carga la geografia de la corrida: la de la mision, o la de la sonda si la hay. */
export function cargar(lista, obj, base) {
  if (ninguna) return setGeografia(null, obj);
  const g = pisada || lista;
  // LA FORMA EN KM se revisa de nuevo aca, contra la distancia de ESTA mision: una geografia con
  // nombre puesta encima de una mision mas corta se desbordaria. Se rechaza entera y se avisa —
  // cargarla a medias seria volar un mapa que nadie escribio.
  const e = validarGeografia(g, base);
  if (e.length) { console.error('geografia: ' + e.join(' · ')); return setGeografia(null, obj); }
  return setGeografia(g, obj, base);
}

// ---------- SONDAS (QUITAR al cerrar el plan) ----------
if (typeof window !== 'undefined') {
  // __geoset(lista): pisa la geografia de la corrida en curso, con el mismo objetivo. Devuelve los
  // errores del validador si la lista esta mal — no la carga a medias.
  window.__geoset = lista => {
    const e = validarGeografia(lista, geo.base);
    if (e.length) return JSON.stringify({ errores: e });
    setGeografia(lista, geo.obj, geo.base);
    return JSON.stringify({ ok: true, obj: geo.obj | 0, tramos: geo.tramos ? geo.tramos.length : 0 });
  };
  // __geoen(frac, x): que hay a esa fraccion del camino (y en esa x del carril).
  window.__geoen = (frac, x) => {
    const wz = (+frac || 0) * geo.obj, xx = +x || 0;
    return JSON.stringify({
      wz: wz | 0, suelo: sueloEn(wz), tierra: esTierraEn(xx, wz), orilla: +orillaS(wz).toFixed(1),
      lado: ladoEn(wz), altura: +alturaSuelo(xx, wz).toFixed(2),
    });
  };
}
