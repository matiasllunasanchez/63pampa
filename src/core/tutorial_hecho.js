// LO QUE EL JUGADOR YA HIZO DEL TUTORIAL (data/tutorial.js): las etapas terminadas, en localStorage.
// Decide donde arranca el cursor del menu de modos (en TUTORIAL hasta terminarlo, despues en HISTORIA),
// que etapas se pueden elegir (cada una abre la siguiente) y el tilde de cada fila. Si el almacenamiento
// no anda (ventana privada, previsualizacion), el tutorial queda como no hecho y se juega igual.
const KEY = 'rasante_tutorial';
// (los puntos de control de adentro de una etapa se sacaron el 18/11 — "todos los tutoriales arrancan de cero"):
// se borra lo que haya quedado guardado de antes, para que no quede nada de una version vieja
try { localStorage.removeItem('rasante_tutorial_punto'); } catch (e) { }
let hechas = null;

function leer() {
  if (hechas) return hechas;
  try { hechas = new Set(JSON.parse(localStorage.getItem(KEY)) || []); } catch (e) { hechas = new Set(); }
  return hechas;
}

/** ¿La etapa `k` (0, 1, 2) ya se termino alguna vez? */
export const etapaHecha = k => leer().has(k);

/** Anota la etapa `k` como terminada. */
export function marcarEtapa(k) {
  leer().add(k);
  try { localStorage.setItem(KEY, JSON.stringify([...hechas])); } catch (e) { }
}

/** ¿Se termino el tutorial entero (las `n` etapas)? */
export const tutorialHecho = n => { for (let k = 0; k < n; k++) if (!etapaHecha(k)) return false; return true; };

