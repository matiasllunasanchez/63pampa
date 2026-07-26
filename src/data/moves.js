// PIRUETAS: el catalogo de maniobras de combate. Datos puros — quien las EJECUTA es
// systems/moves.js, y quien las DISPARA es el detector de combos de core/input.js via game.js.
//
// Son "poderes" estilo juego de pelea: una secuencia de dos toques direccionales las lanza, y
// durante la maniobra el avion NO se controla — salvo el eje que cada una deja libre (`steer`).
// El tonel (barrel roll) es la pirueta original del juego y conserva su camino legado
// (run.rollT); las demas usan run.mv.
//
//   dur    duracion en segundos
//   steer  eje que el jugador SIGUE controlando: 'x' (lateral), 'y' (vertical) o null (nada)
//   fire   ¿puede disparar el cañon durante la maniobra?
//   turbo  ¿el turbo funciona durante la maniobra?
//   tight  el perfil de colision se ENCOGE (alas de canto / banqueo fuerte), como en el tonel —
//          tambien habilita el bonus de roce "con estilo" (250 en vez de 75)
//
// COMBOS: secuencias de 3 o 4 toques direccionales, cada uno a menos de 0.28 s del anterior
// (teclado o joystick — cruceta o flicks del stick). Ver docs/PIRUETAS.md para la tabla completa.
//
// NINGUNA se hace con DOS toques, y es a proposito. Antes los 16 pares posibles estaban ocupados:
// no existia forma de tocar dos direcciones seguidas sin ejecutar algo. Y como las teclas de combo
// son las de VOLAR, el avion parecia manejarse solo — bombear gas (↑↑) lanzaba un yo-yo, corregir
// el rumbo (←→) lanzaba un S-turn. Con un minimo de tres toques el vuelo normal ya no produce
// secuencias completas, y NINGUNA maniobra usa repeticion vertical, asi que bombear gas
// ('↑↑↑↑↑') no puede disparar nada.
//
//   4 toques — trayectoria CERRADA (la secuencia dibuja la figura)
//     ↓→↑←   TONEL BARRIL horario      ←↓←↓   TIRABUZON izquierda
//     ↓←↑→   TONEL BARRIL antihorario  →↓→↓   TIRABUZON derecha
//
//   3 toques
//     ←←←    TONEL izquierda           →→→    TONEL derecha
//     ↑↓↓    SPLIT-S / MASKING         ↓↑↑    POP-UP / HIGH YO-YO   (segun ALTURA)
//     ↓↑↓    LOW YO-YO                 ↑↓↑    HIGH YO-YO
//     ↓←←    BREAK TURN izquierda      ↓→→    BREAK TURN derecha
//     ←→←    S-TURN izquierda          →←→    S-TURN derecha
//     ↑←→    JINK izquierda            ↑→←    JINK derecha
//
// CONTEXTUALES. '↑↓↓' y '↓↑↑' no los decide como apretas sino la ALTURA A LA QUE VIENE VOLANDO EL
// AVION (plane.y). Se resuelve en el `combo` de game.js contra los umbrales de abajo.
//
//   ↑↓↓  con el avion ALTO (y > MV_HI)  → SPLIT-S          (hay cielo debajo para picar)
//   ↑↓↓  con el avion BAJO (y <= MV_HI) → TERRAIN MASKING  (ya estas bajo: pegate mas)
//   ↓↑↑  con el avion BAJO (y < MV_LO)  → POP-UP           (salis de rasante hacia arriba)
//   ↓↑↑  con el avion ALTO (y >= MV_LO) → HIGH YO-YO       (ya tenes altura: colgate arriba)
//
// REGLA DE DISEÑO: ninguna secuencia puede ser PREFIJO de otra, o la corta dispararia antes de que
// la larga se complete. El caso inverso (una corta que es el FINAL de una larga, como '←←' dentro
// de '↓←←') lo resuelve la coincidencia por sufijo mas largo en core/input.js.
export const MOVES = {
  // medio tonel invertido + picada fuerte: la salida vertical hacia ABAJO. Pide altura.
  // DISPARA aunque quede invertido: el cañon sigue montado en las alas y la punteria del juego
  // (mira libre o auto-apuntado) no depende de para donde este la panza. El tonel clasico
  // siempre dejo disparar, asi que bloquearlo aca era una incoherencia entre dos maniobras que
  // el jugador vive como la misma cosa (dar vuelta el avion).
  splits: { dur: 1.15, name: 'SPLIT-S', steer: 'x', fire: true, turbo: false, tight: true },
  // viraje quebrado: tiron lateral violento sostenido, banqueo a fondo
  breakt: { dur: 0.7, name: 'BREAK TURN', steer: 'y', fire: true, turbo: false, tight: true },
  // sube, cuelga y recae: esquive vertical que sangra velocidad
  hiyo: { dur: 1.0, name: 'HIGH YO-YO', steer: 'x', fire: true, turbo: false, tight: false },
  // pica y remonta: convierte altura en VELOCIDAD (el unico combo que acelera)
  loyo: { dur: 1.0, name: 'LOW YO-YO', steer: 'x', fire: true, turbo: true, tight: false },
  // zigzag de esquive: 4 quiebres laterales secos, rumbo impredecible — no se controla nada
  jink: { dur: 0.85, name: 'JINK', steer: null, fire: true, turbo: false, tight: true },
  // barrido en S: se abre a un lado y vuelve — esquiva sin perder el carril
  sturn: { dur: 1.1, name: 'S-TURN', steer: 'y', fire: true, turbo: false, tight: true },
  // pegarse al terreno: clava el avion a ras, congela el roce y DESCARGA el radar enemigo
  mask: { dur: 1.6, name: 'TERRAIN MASKING', steer: 'x', fire: true, turbo: true, tight: false },
  // trepada brusca de ataque desde rasante
  popup: { dur: 0.8, name: 'POP-UP', steer: 'x', fire: true, turbo: false, tight: false },
  // TIRABUZON: rola sobre su PROPIO EJE picando derecho, sin desvio lateral. No deja controlar
  // nada (steer null) justamente porque lo que la define es que NO se va para ningun costado.
  spin: { dur: 1.0, name: 'TIRABUZON', steer: null, fire: true, turbo: true, tight: true },
  // TONEL BARRIL: la O grande — se abre, sube, pasa boca arriba y vuelve. Trayectoria cerrada,
  // asi que tampoco se controla: corregirla la dejaria de cerrar.
  barrel: { dur: 1.4, name: 'TONEL BARRIL', steer: null, fire: true, turbo: false, tight: true },
};

/** ¿La maniobra activa encoge el perfil de colision? (la consultan collision y el overlay) */
export const mvTight = mv => !!(mv && MOVES[mv] && MOVES[mv].tight);

// UMBRALES DE ALTURA de los pares contextuales (ver el bloque de COMBOS arriba). Son unidades de
// MUNDO — la misma escala de plane.y, donde el techo de vuelo es FLY_TOP = 68.
//
// Son DOS numeros distintos porque responden preguntas distintas: MV_HI pregunta "¿tengo aire
// debajo para tirarme?" y MV_LO, "¿estoy lo bastante bajo como para que trepar sea la jugada?".
// Referencia para calibrarlos: el multiplicador de altitud cambia a los 4.5 (x10), 9 (x5) y
// 16 (x2) — MV_HI queda apenas arriba del ultimo escalon, asi que en la practica "ALTO" coincide
// con el x1 del HUD y "BAJO" con x10/x5.
//
// MV_HI SIGUE EN 18 aunque el techo de radar bajara de 30 a 20 (data/tuning.js), y no es un
// descuido: 18 esta atado a los escalones del multiplicador, que no se movieron. Lo que cambio es
// lo que SIGNIFICA estar ahi — a 18 ya estas a dos metros del radar y adentro de la banda letal
// de los cazas (15-25). Que el SPLIT-S sea justamente el combo que se habilita ahi pasa a ser una
// salida: la maniobra que te tira para abajo es la forma de salir del techo y del trafico de una.
export const MV_HI = 18, MV_LO = 14;
