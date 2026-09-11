// LOS ICONOS DEL TABLERO — la tabla de reemplazo (playtest 10/9).
//
// El HUD dejo de rotular con palabras: NAFTA, CHANCHA, CAÑON y VIDA son iconos. Como todavia no
// estan dibujados, cada uno tiene una LETRA que se dibuja mientras tanto — el hueco existe, el
// tamaño esta reservado, y el dia que el icono aparezca no hay que tocar el render.
//
// COMO SE REEMPLAZA: se pone el PNG en `assets/hud/` y se escribe su nombre de archivo en `png`.
// Nada mas. Mientras `png` sea null se dibuja la letra.
//
// POR QUE UNA TABLA Y NO CARGAR EL ARCHIVO A VER SI ESTA: un `new Image()` a un archivo que no
// existe ensucia la consola con un error de red por cada icono, y `npm run smoke` falla justamente
// porque vigila que la consola este limpia. La tabla dice que hay; lo que no esta, no se pide.
//
// EL TAMAÑO: los iconos se dibujan en 7 px de la grilla de diseño, que son 21 px reales (U 1,5 x
// SC 2 = 3 exacto). Un PNG de 7x7 o de 21x21 entra sin medio pixel; cualquier otro tamaño se
// escala y pierde el filo del pixel art.
export const ICONOS = {
  // LA RUTA (la cinta de arriba al centro): siluetas en PIXELES, porque a 5-7 px de alto una letra
  // no dice nada y un dibujo bien pensado se lee perfecto. `pix` es el dibujo mientras no haya PNG:
  // '#' se pinta con el color principal que pasa quien dibuja y '+' con el secundario. Un PNG que
  // las reemplace va del MISMO tamaño que el dibujo (o x3 en pixeles reales).
  //
  // El BUQUE es un destructor Tipo 42 de costado —casco largo y bajo, superestructura con chimenea
  // y mastil—, que es la silueta del Sheffield, del Coventry y del Glasgow: la mitad de los blancos
  // de la campaña. El AVION va visto desde arriba y apunta al buque.
  // LOS BLANCOS, uno por CLASE. La clase sale de `SHIP_CLASS` (data/ships.js), la MISMA tabla que
  // elige la hoja de sprites del mundo: el icono de arriba y el barco que aparece al final tienen que
  // ser el mismo barco. Todos con la proa a la derecha, que es hacia donde va la ruta.
  buque_t42: { letra: 'D', png: null, pix: [     // destructor Tipo 42: Sheffield, Coventry (y Glamorgan)
    '.....#.....',
    '....###....',
    '..######...',
    '###########',
    '.#########.',
  ] },
  buque_t21: { letra: 'F', png: null, pix: [     // fragata Tipo 21: Ardent, Antelope (y Broadsword)
    '....#......',
    '....#.##...',
    '..#######..',
    '###########',
    '..########.',
  ] },
  buque_log: { letra: 'L', png: null, pix: [     // buque de desembarco: Sir Galahad, Sir Tristram
    '.#.........',
    '.###.......',
    '.####......',
    '###########',
    '.##########',
  ] },
  buque_carga: { letra: 'K', png: null, pix: [   // portacontenedores: el Atlantic Conveyor
    '#..........',
    '##.###.###.',
    '##.###.###.',
    '###########',
    '.#########.',
  ] },
  puerto: { letra: 'P', png: null, pix: [
    '++++...',
    '+..+...',
    '+......',
    '+......',
    '#######',
    '#.#.#.#',
  ] },
  avion: { letra: 'A', png: null, pix: [
    '..#....',
    '#.##...',
    '#######',
    '#.##...',
    '..#....',
  ] },
  bandera: { letra: 'F', png: null, pix: [   // la marca a batir de POR LA PATRIA (el mastil es la columna 0)
    '####',
    '###.',
    '##..',
    '#...',
    '#...',
    '#...',
    '#...',
  ] },

  // LOS DEL TABLERO. `col2` es el color de los '+' cuando quien dibuja no pasa uno: el oscuro de la
  // placa hace de CALADO (la ventanita del surtidor, el signo de la emergencia).
  nafta: { letra: 'N', png: null, col2: '#0a0e11', pix: [      // el surtidor
    '.###...',
    '.#+#.#.',
    '.###.#.',
    '.###.#.',
    '.###.#.',
    '.###.#.',
    '#####..',
  ] },
  // el avion tanque DE COSTADO: cola alta y ala por encima del fuselaje, que es la silueta del
  // Hercules. Visto desde arriba, un ala recta a 7 px es un signo +, y quedaba al lado de la cruz de
  // VIDA: dos cruces que dicen cosas distintas.
  chancha: { letra: 'T', png: null, pix: [
    '#......',
    '##.###.',
    '#######',
    '.######',
  ] },
  emergencia: { letra: 'E', png: null, col2: '#0a0e11', pix: [ // una gota con el signo de admiracion calado
    '..#..',
    '.###.',
    '.#+#.',
    '##+##',
    '#####',
    '##+##',
    '.###.',
  ] },
  canon: { letra: 'C', png: null, col2: '#e9edf0', pix: [      // un proyectil de 20 mm: vaina y punta
    '####...',
    '#####+.',
    '######+',
    '#####+.',
    '####...',
  ] },
  vida: { letra: '+', png: null, pix: [                         // la cruz (BLANCA: ver hud.js, relojSalud)
    '..##..',
    '..##..',
    '######',
    '######',
    '..##..',
    '..##..',
  ] },
  // LA OLA: la escala de abajo del reloj de SALUD, el agua. UNA sola linea y no dos: con dos, la de
  // arriba chocaba con la marca de 135 del reloj y la de abajo tocaba el borde de la placa.
  ola: { letra: '~', png: null, pix: [
    '.#..#.',
    '#.##.#',
  ] },
  rasante: { letra: 'R', png: null, pix: [                      // un avion rozando las olas
    '..#...',
    '######',
    '..#...',
    '......',
    '#.#.#.',
    '.#.#.#',
  ] },
  momentum: { letra: 'M', png: null, pix: [                     // el reloj de arena: el tiempo partido
    '#####',
    '.###.',
    '..#..',
    '..#..',
    '.###.',
    '#####',
  ] },
};

/** CLASE DE BUQUE → su icono. La clase la da `SHIP_CLASS` (data/ships.js). */
export const ICONO_BUQUE = { t42: 'buque_t42', t21: 'buque_t21', log: 'buque_log' };

/** EXCEPCIONES POR NOMBRE, cuando la clase del mundo es una aproximacion y el icono puede ser fiel.
 *  El Atlantic Conveyor era un PORTACONTENEDORES; el mundo lo dibuja con la hoja de desembarco
 *  (`log`) porque no hay otra, pero arriba si se puede decir la verdad. */
export const ICONO_BUQUE_NOMBRE = { 'ATLANTIC CONVEYOR': 'buque_carga' };
