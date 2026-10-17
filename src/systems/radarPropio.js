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
  if (radarP.on) { radarP.on = false; radarP.detectando = false; return 'off'; }
  if (radarP.carga < R.MIN_PRENDER) return 'vacio';
  radarP.on = true; radarP.cadaT = 0;   // la primera onda sale al toque
  radarP.onT = 0; radarP.detectando = false; radarP.detectado = false;   // y detecta de nuevo
  return 'on';
}

/** Un cuadro. `e` = { enVuelo, alt, aTiro } — `aTiro` = el blanco dentro del alcance (lo resuelve el
 *  orquestador con la ruta o con los metros) y `aereos` = cuantos Harrier hay adelante. Devuelve { sig }:
 *  'eco' el cuadro en que una onda marca el blanco, 'ecoAereo' el que marca los Harrier, 'sinCarga' cuando se apaga solo, 'bajo' (una vez por prendida) si barre al ras
 *  con el blanco a tiro pero el horizonte lo tapa. */
let dijoBajo = false;
export function tick(dt, e) {
  // `det`: 'empieza' el cuadro en que arranca la deteccion, 'termina' cuando quedan marcadas las flechitas
  // (o se corta: apagado, sin carga, fuera de vuelo) — el orquestador prende y apaga el sonido con eso
  const out = { sig: null, det: null };
  if (!radarP.tiene) return out;
  for (const o of radarP.ondas) o.t += dt;
  while (radarP.ondas.length && radarP.ondas[0].t > R.ONDA_VIDA) radarP.ondas.shift();
  if (radarP.marcaT > 0) radarP.marcaT = Math.max(0, radarP.marcaT - dt);
  if (radarP.aereoT > 0) radarP.aereoT = Math.max(0, radarP.aereoT - dt);
  if (radarP.buquesT > 0) radarP.buquesT = Math.max(0, radarP.buquesT - dt);
  if (radarP.ecoT >= 0) radarP.ecoT += dt;
  if (!e.enVuelo) { if (radarP.detectando) out.det = 'termina'; radarP.on = false; radarP.detectando = false; radarP.ve = false; return out; }
  if (!radarP.on) { radarP.carga = Math.min(1, radarP.carga + R.RECARGA * (radarP.recargaK || 1) * dt); radarP.ve = false; dijoBajo = false; return out; }
  radarP.carga = Math.max(0, radarP.carga - R.GASTA * dt);
  if (radarP.carga <= 0) { if (radarP.detectando) out.det = 'termina'; radarP.on = false; radarP.detectando = false; radarP.ve = false; out.sig = 'sinCarga'; return out; }
  radarP.ve = e.alt >= R.ALT_MIN && !!e.aTiro;
  radarP.onT += dt;
  // LA DETECCION (data/radar_propio.js DETECTA_*): arranca al segundo de prendido si hay algo para
  // detectar, y al terminar marca todo de una — el blanco, los Harrier y los otros buques.
  if (!radarP.detectado) {
    const hay = radarP.ve || e.aereos > 0 || e.buques > 0;
    if (!radarP.detectando && hay && radarP.onT >= R.DETECTA_DESDE) { radarP.detectando = true; radarP.detectaT = radarP.onT; out.det = 'empieza'; }
    if (radarP.detectando && radarP.onT >= radarP.detectaT + R.DETECTA_DUR) {
      radarP.detectando = false; radarP.detectado = true; out.det = 'termina';
      marcar(e, out);
    }
  }
  radarP.cadaT -= dt;
  if (radarP.cadaT <= 0) {
    radarP.cadaT = R.ONDA_CADA;
    radarP.ondas.push({ t: 0 });
    // EL ECO va con la onda: el blanco queda marcado cuando ella sale viendolo (el destello lo dibuja el
    // render al llegar la onda al horizonte, que es donde esta el buque lejano)
    // (mientras no detecto, las ondas salen pero no marcan: ver DETECTA_* arriba)
    if (radarP.detectado) marcar(e, out);
    else if (!radarP.ve && e.aTiro && !dijoBajo) { dijoBajo = true; out.sig = 'bajo'; }
  }
  return out;
}

/** Marca lo que la onda ve: el blanco, los Harrier y los otros buques. Pone en `out.sig` el aviso. */
function marcar(e, out) {
  if (radarP.ve) { const nuevo = radarP.marcaT <= 0; radarP.marcaT = R.MARCA_T; radarP.ecoT = 0; if (nuevo) out.sig = 'eco'; }
  else if (e.aTiro && !dijoBajo) { dijoBajo = true; out.sig = 'bajo'; }
  // LOS CONTACTOS AEREOS (15/10, el autor: "que marque tambien los Harrier"): los que tenes ADELANTE —el
  // Agave mira hacia la nariz—, y a cualquier altura: en el aire no los tapa el horizonte
  if (e.aereos > 0) { const nuevo = radarP.aereoT <= 0; radarP.aereoT = R.MARCA_T; if (nuevo && !out.sig) out.sig = 'ecoAereo'; }
  // …y los otros buques del pasillo: solo puntos, sin aviso — no son el blanco
  if (e.buques > 0) radarP.buquesT = R.MARCA_T;
}
