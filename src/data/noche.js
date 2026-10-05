// LA NOCHE — los numeros (el dibujo es render/noche.js; pedido del autor 4/10/2026).
//
// Por cielo: `rgb` y `a` la oscuridad (color y cuanto tapa), `horiz` cuanto menos tapa en la linea
// del horizonte (lo que se tiene que seguir leyendo), `lejanas` cuanto brillan las luces lejanas,
// `luna` si hay reflejo, `tablero` el color con que se MULTIPLICA el tablero (ambar retroiluminado:
// lo blanco queda de este color, lo gris casi negro). Sin entrada para un cielo = de dia.
//   night   sin luna: oscuro y AZUL (no negro), el horizonte apenas
//   storm   tormenta: igual de negro, sin luces lejanas (la lluvia las tapa)
//   moon    con luna: luz BLANCA de plata, se ve el mar, y la luna se refleja en el agua
export const NOCHE = {
  CIELOS: {
    // (4/10, el autor: "un poco menos de negro y un poco mas de AZUL, brillo azul — no TANTISIMO, pero
    // que no este TAN negro. Y con luna es brillo blanco")
    night: { rgb: [6, 14, 38], a: 0.85, horiz: 0.72, lejanas: 0.9, luna: false, tablero: 'rgb(214,140,62)' },
    storm: { rgb: [5, 11, 28], a: 0.85, horiz: 0.8, lejanas: 0.25, luna: false, tablero: 'rgb(214,140,62)' },
    // luna: false desde el 4/10 (autor: "el reflejo de la luna esta feo, quitalo") — la columna de rayas
    // de render/noche.js queda escrita, apagada; el camino de luz del mar tampoco va con luna (world.js)
    moon: { rgb: [26, 30, 40], a: 0.6, horiz: 0.7, lejanas: 0.7, luna: false, tablero: 'rgb(226,160,84)' },
  },
  LEJANAS: 14,     // cuantas luces lejanas sobre el horizonte
  ABRE: 2,         // pasadas de la mascara de luz (mas = la luz abre mas la oscuridad)
  REFLEJO: 0.32,   // cuanto brilla el reflejo de la luna en el agua
  BRILLO: 1.6,     // el resplandor de noche (de dia es BRILLO_FUERZA, 0.9)
  AUREOLA: 0.3,    // la aureola del astro de noche: la luna brilla, pero "no como el sol" (el autor)
};
