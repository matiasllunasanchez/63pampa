// EL TEATRO AEREO: las perillas de la escena que pelea sola
// (docs/sistemas/PLAN_TEATRO_AEREO.md, fase TA0).
//
// LA REGLA DE ORO, escrita donde se la va a leer: **nada de lo que se configura aca entra en las
// cinco listas de `core/world.js`** (obstacles, soldiers, bullets, missiles, pmissiles). Cada una
// de esas listas es un CONTRATO DE DAÑO —con esto chocas, esto te mata, a estos los atropellas— y
// el teatro no firma ninguno. No es que el daño este en cero: es que **no hay codigo de daño**,
// que es una garantia de otra naturaleza. Un numero en cero lo puede subir cualquiera sin querer;
// una rutina que ni siquiera mira la lista, no.
//
// El precedente del repo es el Harrier de LA COLA (`systems/caza.js`): sus rafagas cruzan lejos y
// **no existe codigo de impacto para ellas**. Disparar y errar es el contenido, no una concesion.
//
// DONDE VIVE. En la PROFUNDIDAD. El avion del jugador vuela SIEMPRE a `PZ = 14` (render/ctx.js):
// no es una variable con topes, es una constante del juego — puede subir, bajar y correrse, pero
// no tiene forma de cambiar su z. El teatro vive detras, desde `WINGMV.Z`. No es una valla que se
// pueda saltar con un bug: es una dimension que para el jugador no se mueve.
export const TEATRO = {
  // LOS TIROS DE UTILERIA. Velocidades en unidades de mundo por segundo.
  //
  // Van MAS RAPIDO de lo que se camina la escena pero no tanto como para ser un cuadro: un tiro
  // que no se ve viajar no se puede leer como esquivado, y esquivar es todo lo que estos tiros
  // hacen. El cañon es seco y el misil se toma su tiempo (y deja estela).
  CANON_V: 150,
  MISIL_V: 95,
  // TOPE DURO DE VIDA, en segundos. Misma leccion que el director de cinematicas y que los
  // actores: lo que entra en escena tiene que tener escrito COMO SE TERMINA, o un caso raro lo
  // deja ahi para siempre. Es una segunda puerta ademas de salirse del cuadro.
  VIDA: 4,
  // LA CAJA DEL MUNDO del teatro: fuera de esto, un tiro no se ve mas y se saca. Generosa a
  // proposito — el limite que importa es el de vida; esto es para no integrar de gusto.
  X_MAX: 200, Y_MIN: -40, Y_MAX: 200, Z_MIN: 2, Z_MAX: 320,
  // LA ESTELA del misil de utileria: cada cuanto suelta una muestra y cuanto vive cada una.
  ESTELA_T: 0.03, ESTELA_VIDA: 0.42,
  // CRUCERO: lo que un actor SIN maniobra se queda en escena antes de irse. Es el caso del blanco
  // que entra, cruza y sale — el que hace falta en TA0 para poder afirmar la valla sin que todavia
  // exista una coreografia. Una escena lo pisa (`o.crucero`) cuando necesita que se quede a mirar.
  CRUCERO: 1.2,

  // ---------------- TA1: LA ESQUIVADA ----------------
  //
  // LA REGLA, y es toda la fase: **el tiro apunta a donde el Fiel YA NO VA A ESTAR.** Se lanza
  // contra el punto que ocupaba al empezar la pirueta —el que esta vaciando— y llega cuando la
  // figura ya lo desplazo. Pasa por el lugar exacto donde estaba, tarde.
  //
  // La alternativa —apuntarle a el y confiar en que la pirueta lo salve— es una moneda al aire, y
  // en una escena que se MIRA la moneda sale mal la mitad de las veces: o le pega (y como no hay
  // daño, lo atraviesa y queda ridiculo) o pasa a treinta unidades y no se lee como esquivada.
  //
  // CUANDO SALE. Apenas arranco la pirueta: el tiro tiene que estar en el aire mientras la figura
  // se abre, o llega a un cuadro en el que no hay nada que esquivar.
  // …pero NO EN EL PRIMER CUADRO: el tiro sale cuando el Fiel ya se despego de su punto de partida
  // lo suficiente como para que se sepa PARA DONDE se fue. Antes de eso no hay direccion de escape
  // que leer, y apuntar "atras" seria apuntar a cualquier lado.
  DESPEGUE: 1.2,
  DISPARA: 0.3,
  // EL MARGEN, y es lo unico de todo esto que hay que entender bien.
  //
  // Apuntar al punto vaciado NO ALCANZA, y el fixture lo demostro: tres de cuatro piruetas median
  // impacto. El motivo es geometrico — un tiro no se detiene en su blanco, SIGUE—, asi que si la
  // linea de fuego queda alineada con la fuga del Fiel, el tiro lo persigue por el mismo pasillo
  // (yendo hacia el mismo lado, lo alcanza; viniendo de frente, lo choca). El TONEL y el BREAK TURN
  // se van de costado, y el blanco tira de costado: colineales, impacto asegurado.
  //
  // La solucion no es correr el punto "un poco mas": es correrlo en la direccion en que correrlo
  // SIRVE. La mira se desplaza sobre la PERPENDICULAR COMUN a la fuga del Fiel y a la linea de
  // fuego (el producto vectorial de las dos). Con eso, la distancia entre las dos rectas —la del
  // tiro y la del escape— vale exactamente este numero, sea cual sea la geometria de la escena.
  // No es una constante bien elegida: es una cota, y por eso ninguna pirueta nueva la puede romper.
  MARGEN: 7,
  // CUANDO LLEGA, en fraccion de la duracion de la maniobra. 0.45 es cerca del desplazamiento
  // MAXIMO de casi todas: el tonel ya se fue de costado, el barril esta arriba de todo su circulo,
  // el split-s ya pico. Ojo con pasarse: el TONEL BARRIL **vuelve al punto de partida** al cerrar,
  // asi que un tiro que llegue al final del circulo le encontraria el avion de nuevo ahi.
  LLEGA: 0.45,
  // la velocidad se DERIVA del tiempo de vuelo (llegar a horario es lo que importa), pero acotada:
  // fuera de esta banda deja de leerse como un tiro — abajo es una piedra, arriba es un cuadro.
  V_MIN: 60, V_MAX: 260,
  // la rafaga: cuantos tiros y cada cuanto. Varios rastrillando el mismo punto vacio se leen mejor
  // que uno solo — el ojo necesita repeticion para entender que lo estan buscando ahi.
  RAFAGA: 3, CADENCIA: 0.12,
  // las piruetas que se leen como esquivada de costado: las que DESPLAZAN. Trepar o pegarse al
  // terreno tambien esquiva, pero no se ve.
  ESQUIVAS: ['tonel', 'barrel', 'breakt', 'splits'],

  // ---------------- TA2: EL DERRIBO ----------------
  //
  // El Fiel contesta al SALIR de la pirueta — esquiva y responde, en ese orden, que es lo que
  // convierte dos actos sueltos en una escena.
  FIEL_RAFAGA: 2, FIEL_CADENCIA: 0.18,
  // a que distancia un tiro del Fiel cuenta como impacto en un blanco. Es la UNICA prueba de
  // distancia del teatro, y sigue sin ser una colision del juego: no esta en ninguna de las cinco
  // listas y no puede tocar al jugador ni por accidente.
  IMPACTO: 5,
  // la bola de fuego del derribo, en segundos. La pinta el teatro con su propia lista: `explodeAt`
  // empuja su bola a `obstacles`, y meter algo del teatro en una lista del juego seria romper la
  // regla justo en el unico lugar donde nadie la estaria mirando.
  BOLA: 0.5,
};
