// LOS DOS MODOS SUELTOS — POR LA PATRIA ('survival') y CICLO DE MUERTE ('cycle'). Datos puros.
//
// Pedido del autor (16/10/2026), en sus palabras resumidas:
//   - Los dos empiezan y SOLO terminan cuando el jugador muere. Las vidas son el escuadron: cuando
//     cae uno, pasa la posta al siguiente.
//   - Antes de arrancar, ademas del avion, se elige la DIFICULTAD: FACIL (escuadron de 8), NORMAL
//     (6), DIFICIL (3) y CORONADO DE GLORIA (un solo avion).
//   - El mundo varia al azar en cada corrida: territorio, ambiente, clima, la hora del dia en que
//     arranca, terreno, enemigos.
//   - La complejidad crece con los KILOMETROS, de a poco. Cuantas mas ESTRELLAS (te buscan), MAS
//     cantidad; y con ALARMA (te pintaron: una estrella o mas) se multiplica DE GOLPE, hasta que la
//     pierdas escondiendote.
//   - Los efectos de radar aplican siempre. SIN DIALOGOS ni radio del guion (por ahora).
//   - La musica es al azar, de la que se usa en las misiones (no la `original`).
//   - El puntaje se ve siempre, y USAR cosas CUESTA puntos: la Chancha, el MOMENTUM, el radar…
//   - CICLO DE MUERTE es POR LA PATRIA con OBJETIVOS: encadena buques al azar, uno detras de otro;
//     la cinta de arriba va cambiando de blanco. No hay briefing ni recuento entre uno y otro.
//
// Todo lo que se tunea esta aca; el que lo aplica es game.js (`suelto*`).

/** LAS DIFICULTADES, en el orden en que se recorren en la pantalla del avion (arriba/abajo).
 *  `aviones` = el escuadron (las vidas). `k` = cuanto pesa el mundo de entrada (multiplica la presion). */
export const DIFICULTADES = [
  { id: 'facil', es: 'FÁCIL', en: 'EASY', aviones: 8, k: 0.75 },
  { id: 'normal', es: 'NORMAL', en: 'NORMAL', aviones: 6, k: 1 },   // (16/10: 8 / 6 / 3 / 1)
  { id: 'dificil', es: 'DIFÍCIL', en: 'HARD', aviones: 3, k: 1.3 },
  { id: 'gloria', es: 'CORONADO DE GLORIA', en: 'CROWNED IN GLORY', aviones: 1, k: 1.5 },
];
export const DIF_DEFAULT = 0;   // FACIL: cada vez que se abre el juego arranca aca (autor, 16/10)

/** LA PRESION DEL MUNDO. Cada perilla del spawn arranca en su `base` y se multiplica por
 *    presion = k(dificultad) × rampa(km) × alarma(estrellas)
 *  y nunca pasa de su `techo` (un pasillo imposible no es dificil, es injusto).
 *    rampa(km)       = min(RAMPA.max, 1 + RAMPA.porKm × km) — sube parejo con lo recorrido
 *    alarma(est)     = 1 sin estrellas; con alarma, ALARMA.golpe de entrada y + ALARMA.porEstrella
 *                      por cada estrella de mas. Se va apenas la perdes. */
export const RAMPA = { porKm: 0.12, max: 3 };
export const ALARMA = { golpe: 1.6, porEstrella: 0.3 };
export const PERILLAS = {
  obstacles: { base: 0.8, techo: 2.4 },   // densidad del pasillo (data/tuning SPAWN_DENS / obst)
  bombs: { base: 0.4, techo: 2.5 },       // Sea Slug
  caza: { base: 0.5, techo: 2.5 },        // LA COLA: los pares de Sea Harrier
};

/** EL MUNDO AL AZAR de cada corrida (y de cada blanco del ciclo). Pesos relativos. */
export const ENTORNO = {
  // la hora del dia la dice el cielo (SKY_PRESETS en data/palette.js; la noche sale de `nocheDe`)
  cielos: [['dawn', 2], ['clear', 2], ['sun', 2], ['cloudy', 2], ['dusk', 2], ['storm', 1], ['night', 1], ['moon', 1]],
  terrenos: [['sea', 5], ['coast', 3], ['land', 3]],
  lluvia: 0.25,      // probabilidad de lluvia si el cielo no es tormenta (en tormenta, siempre)
  niebla: 0.2,       // probabilidad de bancos de niebla
  viento: 0.7,       // probabilidad de viento
};

/** EL MAPA QUE CAMBIA MIENTRAS SE VUELA (16/10, el autor: "debe variar TODO y debe ir cambiando a medida
 *  que pasa el juego, salvo el fondo"). Una GEOGRAFIA al azar (docs/sistemas/PLAN_GEOGRAFIA.md): tramos de
 *  `tramoKm` con suelo y accidentes sorteados por estos pesos. El cielo no cambia: es el fondo. */
export const MAPA = {
  largoKm: 400,                       // POR LA PATRIA no tiene fin: la geografia cubre hasta aca
  tramoKm: [1.4, 3.2],                // largo de cada tramo
  suelos: [['mar', 5], ['costa', 2], ['tierra', 2], ['isla', 1]],
  niebla: 0.18,                       // probabilidad de que un tramo tenga un banco de niebla
  paredes: 0.15,                      // probabilidad de acantilados a los costados (sobre mar)
  lomas: [0, 6],                      // relieve de la tierra, metros
};
/** EL CLIMA QUE CAMBIA: cada `cadaKm` (al azar en el rango) se re-sortea la lluvia y el viento. */
export const CLIMA = { cadaKm: [2, 4], lluvia: 0.3, viento: 0.7 };

/** LA NAFTA de los modos sueltos (`cfg.fuelScale`): la del tutorial. Con la escala de siempre (1) el tanque
 *  se vaciaba en ~30 s y el avion se iba a reserva sin que se entendiera por que (16/10). Asi dura ~2 min,
 *  y los bidones y la Chancha la reponen. */
export const NAFTA_ESCALA = 0.25;

/** LO QUE CUESTA USAR (en puntos). Sin el puntaje alcanzado, la accion no sale y se avisa. */
export const COSTOS = {
  chancha: 1500,     // llamar a LA CHANCHA (el reabastecimiento)
  momentum: 800,     // lanzar el MOMENTUM (la camara lenta)
  radar: 300,        // prender el radar propio (Super Etendard)
  chapitas: 400,     // soltar chafitas
};
