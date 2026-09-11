# Íconos del HUD — lo que falta dibujar o conseguir

Acá van los PNG. Cuando tengas uno, ponelo en esta carpeta y escribí su nombre de archivo en
`src/data/iconos.js`, en el campo `png` de su entrada. Nada más. Mientras `png` sea `null`, el
juego dibuja la silueta provisoria en píxeles que figura abajo.

**Tamaño:** cada ícono tiene su tamaño en la grilla de diseño del juego. Un PNG de **ese tamaño
exacto o ×3** entra sin medio píxel; cualquier otro se escala y pierde el filo del pixel art.
**Fondo transparente**, y si el ícono es de un solo color, **en blanco**: el juego lo puede teñir.

## La ruta (arriba al centro)

| Nombre | Qué es | Tamaño | ×3 | Qué buscar |
|---|---|---|---|---|
| `buque_t42` | destructor Tipo 42 — Sheffield, Coventry, Glamorgan | 11 × 5 | 33 × 15 | silueta lateral de destructor, proa a la derecha |
| `buque_t21` | fragata Tipo 21 — Ardent, Antelope, Broadsword | 11 × 5 | 33 × 15 | silueta lateral de fragata, chimenea inclinada |
| `buque_log` | buque de desembarco — Sir Galahad, Sir Tristram | 11 × 5 | 33 × 15 | landing ship: superestructura atrás, cubierta plana |
| `buque_carga` | portacontenedores — Atlantic Conveyor | 11 × 5 | 33 × 15 | carguero: puente atrás, contenedores apilados |
| `puerto` | el muelle de salida | 7 × 6 | 21 × 18 | muelle con grúa |
| `avion` | el marcador que avanza por la ruta | 7 × 5 | 21 × 15 | avión visto desde arriba, nariz a la derecha |
| `bandera` | la meta: misiones por distancia y récord de POR LA PATRIA | 4 × 7 | 12 × 21 | banderín de meta |

## El tablero (abajo)

| Nombre | Qué es | Tamaño | ×3 | Qué buscar |
|---|---|---|---|---|
| `nafta` | el reloj de combustible | 7 × 7 | 21 × 21 | surtidor de nafta |
| `chancha` | el reloj de la Chancha | 7 × 4 | 21 × 12 | avión tanque (Hercules KC-130) **de costado** — de arriba se confunde con la cruz |
| `emergencia` | la marca del final del reloj de la Chancha | 5 × 7 | 15 × 21 | gota de combustible con signo de admiración |
| `canon` | el reloj del cañón | 7 × 5 | 21 × 15 | proyectil o cañón |
| `vida` | la barra de salud | 6 × 6 | 18 × 18 | cruz **blanca** (la roja es un emblema protegido) |
| `rasante` | el riel del borde izquierdo | 6 × 6 | 18 × 18 | avión rozando olas |
| `momentum` | el riel del borde derecho | 5 × 6 | 15 × 18 | reloj de arena |

## Las siluetas provisorias

Son las que se ven hoy, dibujadas en `src/data/iconos.js`. Sirven de referencia de proporción: el
PNG no tiene que ser igual, pero sí ocupar ese mismo rectángulo.

```
buque_t42     buque_t21     buque_log     buque_carga   puerto    avion     bandera
.....#.....   ....#......   .#.........   #..........   ++++...   ..#....   ####
....###....   ....#.##...   .###.......   ##.###.###.   +..+...   #.##...   ###.
..######...   ..#######..   .####......   ##.###.###.   +......   #######   ##..
###########   ###########   ###########   ###########   +......   #.##...   #...
.#########.   ..########.   .##########   .#########.   #######   ..#....   #...
                                                        #.#.#.#             #...
                                                                            #...

nafta     chancha   emergencia  canon     vida     rasante  momentum
.###...   #......   ..#..       ####...   ..##..   ..#...   #####
.#+#.#.   ##.###.   .###.       #####+.   ..##..   ######   .###.
.###.#.   #######   .#+#.       ######+   ######   ..#...   ..#..
.###.#.   .######   ##+##       #####+.   ######   ......   ..#..
.###.#.             #####       ####...   ..##..   #.#.#.   .###.
.###.#.             ##+##                 ..##..   .#.#.#   #####
#####..             .###.
```

`#` es el color principal y `+` el secundario (en la gota y el surtidor, el `+` es un calado).

## Pendiente de fondo

El **Atlantic Conveyor** tiene ícono de portacontenedores, pero en el mundo se dibuja con la hoja
del buque de desembarco (`log`), porque no hay una hoja de carguero. Si se consigue ese ícono,
conviene conseguir también el sprite del barco, así el blanco de arriba y el de abajo coinciden.
