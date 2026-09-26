// LOS GESTOS DEL PACK DE SEÑALES (data/senales.js): que pose tiene el avion en cada instante.
// PURO: recibe el gesto, el avance `u` (0..1) y el lado `dir` (+1 derecha, -1 izquierda), y
// devuelve { bank, pitch, rot }:
//   bank   alabeo que se DIBUJA (-1..1 = ±60°, lo que trae la hoja del sprite)
//   pitch  cabeceo que se dibuja (-1 = morro abajo, 0 nivel)
//   rot    giro EXTRA del sprite (rad), para lo que la hoja no llega (mostrar la panza pasa de 60°)
// Todos empiezan y terminan en cero: el avion sale y vuelve a su pose sin saltos.

const S = Math.sin, PI = Math.PI;
/** Sube rapido, se sostiene y baja: 0 en las puntas, 1 en el medio. */
const meseta = (u, k) => Math.min(1, k * S(PI * u));

export function pose(gesto, u, dir) {
  const d = dir || 1;
  if (gesto === 'balanceo') return { bank: d * 0.8 * S(u * PI * 2 * 2), pitch: 0, rot: 0 };   // dos idas y vueltas
  if (gesto === 'panza') { const m = meseta(u, 3); return { bank: d * m, pitch: 0, rot: d * m * PI / 6 }; }   // 90°: la panza al compañero
  if (gesto === 'cabeceo') return { bank: 0, pitch: -Math.max(0, S(u * PI * 2 * 2)), rot: 0 };   // morro abajo, dos veces
  if (gesto === 'rompo') return { bank: d * meseta(u, 2.5), pitch: 0, rot: 0 };   // una inclinacion hacia el lado
  if (gesto === 'alerta') return { bank: 0.6 * S(u * PI * 2 * 4), pitch: 0, rot: 0 };   // cuatro rapidas (ya no se usa)
  if (gesto === 'tonel') {
    // UNA VUELTA ENTERA sobre el eje, con arranque y frenada suaves. Los primeros y ultimos 60° los
    // pone la hoja (alabeo real del sprite); el resto, la rotacion — asi no hay salto en las puntas.
    const a = 2 * PI * (u * u * (3 - 2 * u));
    // la pose de la hoja SIEMPRE del mismo lado (sube al entrar, se sostiene, baja al salir): si
    // cambiara de signo a mitad de vuelta, el sprite saltaria de un dibujo al otro boca abajo
    const b = Math.min(1, a / (PI / 3), (2 * PI - a) / (PI / 3));
    return { bank: d * b, pitch: 0, rot: d * (a - b * PI / 3) };
  }
  return { bank: 0, pitch: 0, rot: 0 };
}
