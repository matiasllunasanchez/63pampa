# LAS CHAFITAS — el chaff de la máquina de fideos

> **El nombre (autor, 8/10):** en pantalla son **CHAFITAS** — así les dice el Pichón, "porque son
> chapitas, pero más finitas"; los estadounidenses le dicen *chaff*. En el código siguen siendo
> `chapitas`. El texto de la tarjeta de la mejora está en `data/upgrades.js` `MEJORA_CHAFITAS`.

> Cómo funciona **hoy** (8/10/2026). La historia está en
> [MEJORAS_PICHON.md §1](../historia/MEJORAS_PICHON.md) («Fideos») y en
> [PREGUNTAS_HISTORICAS.md](../historia/PREGUNTAS_HISTORICAS.md) (CONTRAMEDIDAS).

**Pedido del autor (8/10):** "tirar chapitas largas brillantes: si tengo un misil cerca, se desvía y
explota detrás mío sin dañarme prácticamente nada, o poco; y si estoy con radar, tiro chapitas y bajo
del radar, me elimina todas las alarmas y vuelvo al sigilo. En el radar se genera una onda grande
alrededor del avión — pareciera que explotó, cuando en realidad está debajo." Las cargas por avión,
"mejorable de 1 a 4 máx." (hoy 2); "se va a desbloquear después con las mejoras del Pichón, pero ahora
debería estar activa". Cada carga son **30 tubos de 16 cm** ("30 cartuchos, 30 barritas"), a escala
del avión, que brillan "como brillan los aviones con la luz, pero el doble".

## 1 · Qué hace

| Paso | Qué pasa |
|---|---|
| **Soltar** — **H**, o **Z** con las chafitas elegidas (**3** o la ruedita, 9/10) (mando: **◯** en vuelo) | Se gasta una carga. El avión pierde `CHAPITAS.FRENO` (15%) de velocidad: el chaff iba **en el freno aerodinámico**, y abrirlo es el precio. Sale un soplo de humo de la cola y el cartucho escupe **30 tubos de 16 cm** hacia atrás, en abanico, girando; a los 0,2 s cada uno revienta en su nubecita de tiras. Tubos y tiras **brillan con la luz del cielo como el filo de los aviones, al doble** (`render/borde.js` `luzDelCielo`: su color y su fuerza según el cielo y la niebla): al girar, cada uno destella cuando agarra la luz. |
| **La bengala** | Cada carga es **un cartucho con 30 chafitas y UNA bengala** (el autor: "se tiraba todo junto"). Cuando los tubos revientan se enciende la bengala —un tubito de cartón marrón ardiendo por la punta, con su hilo de humo y un poco de brillo— **en el medio de la nube**, y baja con ella ("debe verse la bengala brillando entre medio de la nube"). |
| **Los misiles** | Los de **radar** (por delante, a menos de `ALCANCE_Z`) se van a la **nube**; los de **calor** (el Sidewinder, de frente o el de LA COLA que viene de atrás) a la **bengala**. Después, **la mitad** (`EXPLOTA`) **revienta ahí**, detrás tuyo: **+150** y, si te queda a menos de `CERCA`, te sacude un poco (el golpe no letal: frena y quema algo de nafta, nunca integridad). **La otra mitad se desvía a un costado** de la nube (`LADO`) y **pasa de largo**, "lo de siempre": como un misil esquivado, +75, y al agua si iba bajo. Cartel **¡CHAFITAS!** en la nube; **la bengala no dice nada** (el autor: "no debe decir texto BENGALA"): se la ve. |
| **El radar** | Si te estaban viendo al soltar (la barra cargando, alguna alarma, o arriba del techo) y **bajás del radar** antes de que pasen `VENTANA` segundos, se borran **todas** las alarmas: la barra, las estrellas y la escalada de oleadas. Cartel **TE PERDIERON**. |
| **En pantalla** | En la pantallita del radar (panel de alarmas) tu contacto desaparece en un destello y anillos que crecen más allá del aro. En la barra RADAR / SEA DART la carga se deshace en granos plateados. Es lo que veía el operador: un blanco que de golpe es una nube enorme, y después nada. |
| **Cuántas quedan** | **El estante** (abajo a la derecha), tres filas con su número al costado: el par de ala (tanques o bombas, **2**), el centro (la bomba), y **las chapitas** (hasta 4). Sin chapitas, la fila queda vacía. Son **de cada avión**: el relevo trae las suyas. |

### Qué misiles engaña — el aluminio a los de radar, la bengala a los de calor

| Misil | ¿Lo engaña? | Por qué |
|---|---|---|
| Sea Dart (`dart`, el de las oleadas del radar) | **Sí** | radar semiactivo |
| Sea Wolf (`wolf`, `def: 'wolf'`) | **Sí** | lo sigue un radar de a bordo |
| Sea Cat (`wolf`, `def: 'cat'`) | No | un operador a ojo |
| Sidewinder (`aim9`, LA COLA y los Harrier de frente) | **Sí — la bengala** | infrarrojo: se va al calor de la bengala, que arde más que el escape del motor (también el que viene de atrás) |
| Rapier, portátiles (sin `tipo`), trazadoras, ráfaga del Aden | No | ópticos o cañón |

## 2 · Dónde vive

| Archivo | Qué |
|---|---|
| `src/data/tuning.js` `CHAPITAS` | todos los números (abajo) |
| `src/core/chapitas.js` | la cuenta pura: `engaña`, `tomaNube`, `nubeNueva`, `pasoNube`, `borraAlarmas` |
| `src/systems/chapitas.js` | el estado: cargas, nubes en el aire, la ventana del sigilo; `reset`, `soltar`, `step`, `snapshot` |
| `src/systems/collision.js` | el misil contra la nube: el mismo bloque `m.cebo` que el señuelo de los tanques |
| `src/game.js` | `chapitasAccion` (la tecla), el paso por cuadro y el sigilo junto a las estrellas, `drawChapitas` |
| `src/render/hud.js` | `chapitasRadar` (la mancha), la de la barra en `drawRadar`, `drawEstante` (el estante de tres filas con sus números) |
| `src/data/iconos.js` | el icono `chapitas` del estante |
| `tools/blender/modelos_partes.py` `municion_chafita` + `hojas.py` `chafita` | **el tubo horneado en Blender** (8/10: "son cilindros de 16 cm"): aluminio con dos costuras, la faja de cinta y la tapa de cartón; 16 × 3,8 cm (el cartucho de 1,5" del Mirage), 6 vistas de punta a costado → `assets/ammo/chafita.png`. Rehornear: `python3 tools/blender/hornear_hojas.py chafita` y `.venv-art/bin/python3 tools/blender/armar_enemigos.py chafita` |
| `modelos_partes.py` `municion_tira` + `hojas.py` `tira` | **las tiras de la nube, horneadas** (la foto del autor, 8/10: cintas de aluminio arrugadas): 7 cm × el ancho de un tallarín, retorcidas y arrugadas, con el destello duro de la chapa; 4 variantes × 6 vistas → `assets/ammo/tira.png`. `CHAPITAS.TIRAS_TUBO` (4) por tubo: 120 por carga |
| `modelos_partes.py` `municion_bengala` + `hojas.py` `bengala` | **la bengala horneada**: el tubito de cartón marrón con tapa roja, ardiendo por abajo (llama naranja, corazón blanco), 8 cuadros de fuego latiendo → `assets/ammo/bengala.png` |
| `src/render/chafita.js` | dibuja el tubo, las tiras y la bengala con esas hojas (girados, tumbándose, con el filo de luz de los aviones); sin las hojas, la raya de antes |
| `src/render/borde.js` | `luzDelCielo`: la luz con que brillan (la de los aviones) |
| `src/core/run.js` | `chapitas`, `chapitasMax`, `chapitasOnda` |
| `src/systems/squad.js` | la ficha del relevo lleva `chapitas` |

## 3 · Los números (`CHAPITAS`)

| Clave | Valor | Qué |
|---|---|---|
| `CARGAS` / `CARGAS_MIN` / `CARGAS_MAX` | 2 / 1 / 4 | por avión: hoy 2; con la mejora del Pichón, de 1 a 4 |
| `TUBOS` / `TUBO_M` / `TUBO_ABRE` / `TUBO_SALE` | 30 / 0,08 u / 0,2 s / 9 u/s | los tubos de cada carga: cuántos, su largo (16 cm; 1 u ≈ 2 m), cuándo revientan, con qué los escupe el cartucho |
| `LARGO` / `BRILLO` | 0,035 u / 2 | el largo de cada tira: **7 cm** ("los tubos tenían 16 cm pero las tiras eran de 7"; La Nación), un pixel o dos a la distancia del avión — y cuánto brillan contra los aviones |
| `ALCANCE_Z` | 160 u | hasta dónde por delante toma misiles la nube |
| `VIDA` | 4 s | lo que brilla y engaña |
| `INERCIA` | 0,6 /s | la nube sale con la velocidad del avión y el aire se la come: se ve quedar atrás ~1 s |
| `VEL` / `GIRO` / `RADIO` | 260 / 6 / 3 | el misil contra la nube (los del señuelo de tanque) |
| `CERCA` / `SOFT` | 8 u / 0,35 | si revienta cerca, el golpe no letal y su fuerza |
| `FRENO` | 0,15 | velocidad que se pierde al soltar |
| `VENTANA` | 4 s | para bajar del radar y que se borren las alarmas |
| `PTS` | 150 | por misil que revienta en la nube o la bengala |
| `EXPLOTA` / `LADO` | 0,5 / 2,5–6 u | la probabilidad de reventar ahí; si no, a qué distancia del costado se desvía |
| `BENGALA` | `CAE` 0 · `ALTO` 0,35 · `LUZ` 0,9 · `HALO_A` 0,25 · `LUZ_A` 0,25 · `NOCHE_A` 0,3 · `HUMO_CADA` 0,06 s · `HUMO_VIDA` 1,1 s | cómo cae, su tamaño, su luz y su humo. La luz es la de la turbina del avión: un halo sin borde con tope del 25% ("20 o 30% máximo", el autor) y en el centro el fueguito amarillo-naranja; así se ven las chapitas |
| `TIRA_MIN_PX` / `NUBE` | 3 px / ×1,4 | el largo mínimo de una tira en pantalla, para que se lea la cinta ("agrandá un poco, muy poco"), y cuánto se abre la nube ("un poco más grande") |
| `BRILLO_NUCLEO` / `BRILLO_HALO` | blanco / blanco frío | el color de los destellos de tiras y tubos: blancos, no del color del cielo |
| `DESTELLO_R` | 0,7 | el radio de cada destello de tira o tubo, en veces el de la chapa del avión (~2 px). Las tiras no derraman halo: brillan como la chapa |

## 4 · Cómo probarlo

- **En el juego:** cualquier misión del pasillo. Subí arriba del radar hasta que salte la barra (o la
  oleada de Sea Dart), apretá **H** y bajá enseguida: cartel **TE PERDIERON**, barra y alarmas en
  cero. Con un Sea Dart viniendo de frente, **H**: el misil se va a la nube y revienta atrás.
- **Sondas:** `__chapitas()` (la foto: cargas, nubes, ventana, misiles con `cebo`) y `__chapitas(n)`
  para poner n cargas; `__dart(dz)` larga un Sea Dart de frente a `dz`.
- **Pruebas:** `npm run unit` (cuatro `chapitas:`).

## 5 · Pendiente

- ~~Colgarla del banco del Pichón~~ **HECHO (8/10)** — ver §6. El banco
  (`data/upgrades.js`) solo sabe de piruetas: hace falta que acepte una mejora que no lo es.
- **La explicación real para el guion** (lo verificado y lo que no): [MEJORAS_PICHON.md §1](../historia/MEJORAS_PICHON.md), «LA EXPLICACIÓN REAL». El autor: "quizá por cada mejora puede (o no) cambiar el guion".
- **El brillo** (8/10): la mancha amarilla que tapaba el avión al abrirse la carga eran los destellos de las tiras con radio de mundo (~12 px cada uno) y su halo, más el halo de la bengala. Ahora: destellos de ~2 px como los de la chapa, sin halo, y la bengala con tope del 25%. Si hace falta, se ajusta en `BRILLO`, `DESTELLO_R`, `DESTELLA` y `BENGALA`.
- **Dudas históricas:** cómo cargaba el chaff el A-4 (las fuentes lo dicen para Mirage y Dagger),
  y los datos sin verificar del 8/10 (ver PREGUNTAS_HISTORICAS).

## 6 · En el banco del Pichón (8/10/2026)

Decisión del autor: **cuatro cartas, una carga cada una**, y la primera **desde M3 «El invento»**.

| Carta | Qué da | Cuándo se ofrece |
|---|---|---|
| **CHAFITAS** | 1 carga | desde la oferta de M3 (contra el SPLIT-S); si no se elige, queda esperando |
| **MÁS CHAFITAS** ×3 | +1 cada una, hasta 4 | más adelante en el orden, y cada una solo si se tiene la anterior (`requiere`) |

- **En campaña** las cargas del avión son las cartas que se tienen (`chafitasDe(pichon)`, de 0 a 4). Sin
  ninguna, la fila de abajo del estante queda vacía y la tecla no hace nada (un beep grave, sin cartel).
  **Fuera de la campaña** salen con `CHAPITAS.CARGAS` (2), como todas las piruetas, que se tienen todas.
- **El banco** (`data/upgrades.js`): `UPGRADES` sigue siendo la lista de piruetas (la leen
  `moveAllowed`, el pulso y los interruptores de OPCIONES); `CHAFITAS` son las cuatro cartas, y `BANCO`
  el orden de entrega con todo junto. `nextUpgrades` y `loadoutAt` recorren `BANCO`.
- **La cuenta cambió:** 12 ventanas y 16 cartas → **quedan cuatro sin aprender por partida** (antes se
  aprendían las doce). Es buscado: elegir pesa.
- **La tarjeta** dice TECLA en vez de COMBO, y la frase del Pichón: *"Chaff le dicen los yanquis. Yo les
  digo chafitas: son chapitas, pero más finitas."*

