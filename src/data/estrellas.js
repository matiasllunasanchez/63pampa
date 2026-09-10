// LA ESCALADA DE LA BUSQUEDA — que te mandan, y cuanto, por nivel de estrellas.
// docs/sistemas/PLAN_ESTRELLAS_BUSQUEDA.md §4.
//
// ES UNA TABLA Y NADA MAS. La resuelve core/estrellas.js y la sostiene systems/estrellas.js, con
// la misma division que core/fases.js ↔ systems/fases.js. Datos puros: no importa logica.
//
// LO QUE ESTA TABLA **NO** DECIDE, y es la mitad del diseño (§2 del plan): QUE HAY en el mundo.
// Los globos, la antiaerea y el buque los pone LA DISTANCIA — el `solo` de la fase — y este eje
// no los toca. Aca solo vive QUIEN TE BUSCA. La distancia es donde estas; las estrellas son
// cuanto te odian. Mezclarlos hace aparecer un globo en mar abierto porque subiste, que es
// exactamente el sinsentido que el item existe para evitar.

/** LOS CINCO NIVELES. El indice ES la cantidad de estrellas.
 *
 *  Cada entrada es un PISO, no un reemplazo: lo que la fase resolvio se mantiene si ya era mas
 *  alto. Una mision de campaña con `bombs: 1` no se ablanda porque el jugador tenga cero
 *  estrellas — lo que hace este eje es SUBIR, nunca aflojar.
 *
 *    bombs  piso de la cadencia de bombardeo. Una bomba cayendo significa QUE TE VIERON, asi que
 *           en ★0 vale 0: la ida limpia es el estado de no haber sido visto.
 *    caza   piso de la intensidad de LA COLA (0..2). Es el Harrier que te busca de verdad.
 *    suma   tipos que se AGREGAN a la lista blanca de la fase (`solo`). Se unen, no la pisan. */
export const NIVELES = [
  // ★0 — NO TE VIERON. Nada de nada: el mundo es el que la distancia haya puesto ahi.
  { bombs: 0, caza: 0, suma: [] },
  // ★1 — TE PINTARON UNA VEZ. Cae algo del cielo y la cola se habilita, floja.
  { bombs: 0.5, caza: 1, suma: [] },
  // ★2 — TE ESTAN SIGUIENDO. Mas bombardeo y jets de frente cruzandote.
  { bombs: 1, caza: 2, suma: ['jet'] },
  // ★3 — TE MANDARON A BUSCAR. Es el nivel de los HARRIERS: la cola a fondo y helicopteros
  // sumandose al carril. Es el salto que el jugador tiene que SENTIR como distinto.
  { bombs: 1, caza: 2, suma: ['jet', 'helo'] },
  // ★4 — TODOS ENCIMA. Y ademas la antiaerea, que hasta aca era cosa de la zona y ahora te
  // acompaña: a esta altura ya no importa donde estes.
  { bombs: 2, caza: 2, suma: ['jet', 'helo', 'aa'] },
];
