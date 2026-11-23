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
    // (22/11, el autor: "en la noche completa no se ve nada: darle efecto AZUL pero algo de luz"): menos tapa y mas
    // azul — se leen el mar, las siluetas y el horizonte, sigue siendo de noche
    // (22/11, otra vez: "todo tiene mucha luz, no se entiende nada: sumar luz AZUL"): la luz de la noche es el azul
    // de ambiente, no los halos — mas azul y menos tapado, y los halos de cada luz mucho mas chicos (luces_enemigos.js)
    night: { rgb: [18, 40, 104], a: 0.62, horiz: 0.56, lejanas: 0.9, luna: false, tablero: 'rgb(214,140,62)' },
    storm: { rgb: [14, 30, 76], a: 0.7, horiz: 0.62, lejanas: 0.25, luna: false, tablero: 'rgb(214,140,62)' },
    // luna: false desde el 4/10 (autor: "el reflejo de la luna esta feo, quitalo") — la columna de rayas
    // de render/noche.js queda escrita, apagada; el camino de luz del mar tampoco va con luna (world.js)
    moon: { rgb: [26, 30, 40], a: 0.6, horiz: 0.7, lejanas: 0.7, luna: false, tablero: 'rgb(226,160,84)' },
  },
  LEJANAS: 14,     // cuantas luces lejanas sobre el horizonte
  ABRE: 2,         // pasadas de la mascara de luz: la oscuridad se abre SOLO donde ilumina (8/10: con 4 se iba todo el velo)
  REFLEJO: 0.32,   // cuanto brilla el reflejo de la luna en el agua
  BRILLO: 0.45,    // el resplandor de noche, SUMADO (aditivo): con 'screen' a 1,6 lavaba a gris (8/10); 0,75 → 0,45 el 22/11 ("mucha luz")
  TOBERA: 0.35,    // la turbina encendida de noche, sin turbo: un tercio de la llama (7/10)
  LUNA_R: 34,      // el disco de la luna (unidades de mundo): ahi la oscuridad se abre entera (7/10)
  LUNA_HALO: 1.8,  // …y se va cerrando hasta este multiplo del radio
  AUREOLA: 0.3,    // la aureola del astro de noche: la luna brilla, pero "no como el sol" (el autor)
};
