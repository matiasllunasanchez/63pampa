// EL RADAR PROPIO — la logica (pedido del autor 15/10; las reglas y el porque, data/radar_propio.js).
//
// Misma disciplina que sus hermanos (rasante, chancha): estado en un store de core/, `tick()` recibe el
// mundo ya resuelto por el orquestador y DEVUELVE señales — no suena, no escribe carteles, no llama
// hacia arriba. Lo que te DELATA lo cobra flight.js leyendo `radarP.on` contra la misma barra del
// radar enemigo.
import { RADAR_PROPIO as R } from '../data/radar_propio.js';
import { radarP, resetRadarP } from '../core/radarPropio.js';

/** Corrida nueva: lo lleva si el avion es de los que tenian radar de busqueda. */
export function preparar(planeKey) { resetRadarP(R.AVIONES.includes(planeKey)); }

/** LA TECLA. Devuelve 'on' | 'off' | 'vacio' (sin carga para prender) | null (este avion no tiene). */
export function toggle() {
  if (!radarP.tiene) return null;
  if (radarP.on) { radarP.on = false; return 'off'; }
  if (radarP.carga < R.MIN_PRENDER) return 'vacio';
  radarP.on = true; radarP.cadaT = 0;   // la primera onda sale al toque
  return 'on';
}

/** Un cuadro. `e` = { enVuelo, alt, aTiro } — `aTiro` = el blanco dentro del alcance (lo resuelve el
 *  orquestador con la ruta o con los metros) y `aereos` = cuantos Harrier hay adelante. Devuelve { sig }:
 *  'eco' el cuadro en que una onda marca el blanco, 'ecoAereo' el que marca los Harrier, 'sinCarga' cuando se apaga solo, 'bajo' (una vez por prendida) si barre al ras
 *  con el blanco a tiro pero el horizonte lo tapa. */
let dijoBajo = false;
export function tick(dt, e) {
  const out = { sig: null };
  if (!radarP.tiene) return out;
  for (const o of radarP.ondas) o.t += dt;
  while (radarP.ondas.length && radarP.ondas[0].t > R.ONDA_VIDA) radarP.ondas.shift();
  if (radarP.marcaT > 0) radarP.marcaT = Math.max(0, radarP.marcaT - dt);
  if (radarP.aereoT > 0) radarP.aereoT = Math.max(0, radarP.aereoT - dt);
  if (radarP.buquesT > 0) radarP.buquesT = Math.max(0, radarP.buquesT - dt);
  if (radarP.ecoT >= 0) radarP.ecoT += dt;
  if (!e.enVuelo) { radarP.on = false; radarP.ve = false; return out; }
  if (!radarP.on) { radarP.carga = Math.min(1, radarP.carga + R.RECARGA * dt); radarP.ve = false; dijoBajo = false; return out; }
  radarP.carga = Math.max(0, radarP.carga - R.GASTA * dt);
  if (radarP.carga <= 0) { radarP.on = false; radarP.ve = false; out.sig = 'sinCarga'; return out; }
  radarP.ve = e.alt >= R.ALT_MIN && !!e.aTiro;
  radarP.cadaT -= dt;
  if (radarP.cadaT <= 0) {
    radarP.cadaT = R.ONDA_CADA;
    radarP.ondas.push({ t: 0 });
    // EL ECO va con la onda: el blanco queda marcado cuando ella sale viendolo (el destello lo dibuja el
    // render al llegar la onda al horizonte, que es donde esta el buque lejano)
    if (radarP.ve) { const nuevo = radarP.marcaT <= 0; radarP.marcaT = R.MARCA_T; radarP.ecoT = 0; if (nuevo) out.sig = 'eco'; }
    else if (e.aTiro && !dijoBajo) { dijoBajo = true; out.sig = 'bajo'; }
    // LOS CONTACTOS AEREOS (15/10, el autor: "que marque tambien los Harrier"): los que tenes ADELANTE —el
    // Agave mira hacia la nariz—, y a cualquier altura: en el aire no los tapa el horizonte
    if (e.aereos > 0) { const nuevo = radarP.aereoT <= 0; radarP.aereoT = R.MARCA_T; if (nuevo && !out.sig) out.sig = 'ecoAereo'; }
    // …y los otros buques del pasillo: solo puntos, sin aviso — no son el blanco
    if (e.buques > 0) radarP.buquesT = R.MARCA_T;
  }
  return out;
}
