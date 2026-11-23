// EL CIELO DE FONDO — los numeros (el dibujo es render/nubes_cielo.js y render/cielo_vida.js).
//
// 21/11/2026, el autor, despues de jugar el tutorial:
//   "las nubes hoy parecen globos (formas redondas). Que parezcan nubes; poner nubes tambien a la altura del
//    sol; variar alturas y cercanias al horizonte"
//   "fondo con mas vida: pajaros volando a lo lejos, de vez en cuando un avion lejano; de noche alguna estrella
//    fugaz, algun satelite, o rara vez algo desconocido (luz extraña). Todo chico, lejano, decorativo"
//
// Todo es DECORADO: nada de aca choca, ni se ve en el radar, ni cambia una regla.

/** LAS CAPAS DE NUBES, de lo lejano a lo cercano (se dibujan en ese orden). Por capa:
 *   n       cuantas en un cielo normal (se multiplica por NUBES_POR_CIELO y se topa en `max`)
 *   y       [desde, hasta] px POR ENCIMA del horizonte donde se apoya la BASE de la nube. La capa `sol` se
 *           centra en la altura del astro cuando el telon tiene uno (y ± `ySol`), si no usa `y`
 *   w, h    ancho y alto del dibujo, px
 *   tipo    'estrato' (franja chata y rota, de lejos), 'cumulo' (base chata y copete), 'cirro' (velo fino)
 *   par     cuanto se corre con la camara de costado (2,2 era el de las nubes viejas; lo lejano, menos)
 *   deriva  px/s que la lleva el viento
 *   bruma   cuanto se funde con el color del horizonte (lo lejano es mas palido y sin contraste)
 *   alfa    [min, max] opacidad */
export const NUBES_CAPAS = [
  { nombre: 'lejos', n: 6, max: 10, y: [1, 12], w: [50, 150], h: [4, 9], tipo: 'estrato', par: 0.55, deriva: 0.5, bruma: 0.55, alfa: [0.55, 0.85] },
  { nombre: 'baja', n: 4, max: 7, y: [8, 26], w: [34, 80], h: [9, 16], tipo: 'cumulo', par: 1.0, deriva: 0.9, bruma: 0.35, alfa: [0.7, 0.9] },
  { nombre: 'sol', n: 4, max: 7, y: [40, 70], ySol: 14, w: [44, 110], h: [8, 16], tipo: 'cumulo', par: 1.5, deriva: 1.4, bruma: 0.15, alfa: [0.7, 0.92] },
  { nombre: 'cirro', n: 3, max: 5, y: [62, 92], w: [60, 140], h: [4, 8], tipo: 'cirro', par: 1.2, deriva: 1.1, bruma: 0.1, alfa: [0.3, 0.5] },
  { nombre: 'alta', n: 3, max: 6, y: [58, 92], w: [70, 150], h: [16, 30], tipo: 'cumulo', par: 2.2, deriva: 2.0, bruma: 0, alfa: [0.75, 0.92] },
];

/** Cuantas nubes por cielo (multiplica `n` de cada capa). El nublado y la tormenta, cargados; el sol pleno,
 *  despejado. Un cielo que no esta aca usa 1. */
export const NUBES_POR_CIELO = { clear: 1, sun: 0.7, cloudy: 1.7, dusk: 1, dawn: 1.2, storm: 1.6, night: 0.8, moon: 0.9 };

/** EL BORDE ENCENDIDO: una nube que pasa cerca del sol toma luz en el filo (a menos de `R` px del astro,
 *  hasta `A` de opacidad). */
export const NUBES_SOL = { R: 70, A: 0.85 };

/** LA VIDA DEL FONDO. `cada` = [min, max] segundos entre una aparicion y la siguiente (se sortea cada vez).
 *   PAJAROS   bandadas chicas cerca del horizonte, de dia. `n` cuantos por bandada, `y` px sobre el horizonte,
 *             `vel` px/s, `aleteo` aletazos por segundo, `cerca` chance de una bandada mas cerca (pajaro de
 *             2 px). No salen con tormenta ni de noche.
 *   AVION     un avion lejano que cruza alto. De dia una silueta con estela de condensacion (`estela` chance,
 *             `largo` px); de noche, sus luces de navegacion.
 *   FUGAZ     estrella fugaz (solo de noche): `vel` px/s, `vida` s, `cola` s de rastro.
 *   SATELITE  un punto que cruza parejo (solo de noche); `destello` chance de un brillo a mitad de camino.
 *   RARO      LA LUZ EXTRAÑA (solo de noche, casi nunca): `chance` de que salga cuando toca; se queda
 *             `quieta` s, pega `saltos` saltos y se va. */
export const VIDA_CIELO = {
  PAJAROS: { cada: [7, 22], n: [3, 8], y: [6, 34], vel: [4, 8], aleteo: [1.3, 2], planeo: 0.45, cerca: 0.25 },   // (23/11: "parecen murcielagos": aleteo lento y planean)
  AVION: { cada: [35, 80], y: [52, 86], vel: [5, 9], estela: 0.65, largo: [50, 120] },
  FUGAZ: { cada: [5, 16], vel: [150, 260], vida: [0.35, 0.75], cola: 0.11 },
  SATELITE: { cada: [25, 60], vel: [6, 11], destello: 0.3 },
  RARO: { cada: [90, 200], chance: 0.5, quieta: [2, 4], saltos: [2, 4] },
};
