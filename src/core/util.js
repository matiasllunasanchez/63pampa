// Utilidades PURAS: misma entrada, misma salida. Sin estado, sin DOM, sin canvas.
// Todo lo que este aca tiene que poder probarse llamandolo y comparando el resultado.

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
 *  Es la regla central del juego — a ras del agua (<=4.5) vale 10x. */
export function multOf(alt) { return alt <= 4.5 ? 10 : alt <= 9 ? 5 : alt <= 16 ? 2 : 1; }
