// Utilidades PURAS: misma entrada, misma salida. Sin estado, sin DOM, sin canvas.
// Todo lo que este aca tiene que poder probarse llamandolo y comparando el resultado.
//
// El unico import es de `data/`, que son constantes: no le saca la pureza a nadie.
import { BANDA_ALT } from '../data/tuning.js';

/** Parte un texto en lineas de como maximo `max` caracteres, cortando entre palabras.
 *  Lo usan las pantallas de guion (tipeo letra a letra) y el briefing de mision. */
export function wrapChars(s, max) {
  const out = []; let line = '';
  for (const w of s.split(' ')) {
    if ((line + ' ' + w).trim().length > max) { out.push(line.trim()); line = w; }
    else line = (line ? line + ' ' : '') + w;
  }
  if (line) out.push(line.trim());
  return out;
}

/** Multiplicador de puntaje segun la altura: volar bajo multiplica.
 *  Es la regla central del juego — a ras del agua (<=BANDA_ALT) vale 10x. El techo de esa primera
 *  banda es el unico de los tres escalones que sale de una constante: los otros dos (9 y 16) no los
 *  mira nadie mas, la banda del x10 la miran nueve lugares. */
export function multOf(alt) { return alt <= BANDA_ALT ? 10 : alt <= 9 ? 5 : alt <= 16 ? 2 : 1; }
