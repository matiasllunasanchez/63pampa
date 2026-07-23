# Arquitectura de RASANTE

Mapa de la estructura del código. Para el *qué hace el juego* está el [README](../README.md); esto es
el *dónde vive cada cosa y por qué*.

El juego era un solo archivo (`src/game.js`, ~3700 líneas). Hoy es un **ensamblador de ~800
líneas** más 29 módulos. `game.js` conserva lo que es genuinamente "el pegamento": el arranque, el
bucle (`update`/`draw` como orquestadores), el flujo de misión/campaña, la cámara y el cableado del
input. Todo lo demás son módulos con dependencias explícitas.

> **Build**: los módulos son ES modules, pero Electron los carga por `file://` (donde Chromium los
> bloquea por CORS). Por eso `npm run build:game` los empaqueta con esbuild en `src/game.bundle.js`.
> Corre solo antes de `start`/`build:web`/`dist`. **Editás los módulos, nunca el bundle.**

## Las cuatro convenciones que mantienen esto ordenado

Entenderlas es entender el 90% del código.

1. **Stores de identidad estable.** El estado compartido entre módulos vive en objetos que se
   **mutan, nunca se reasignan**. `plane.y = 1` sí; `plane = {...}` no. Se comparten por referencia:
   reasignar dejaría a los otros módulos mirando el objeto viejo y el juego seguiría andando,
   dibujando un avión que ya no es el que vuela — un bug mudo. Por eso `reset()` llama a
   `resetPlane()` (muta) en vez de crear uno nuevo. Lo custodia `npm run lint:state`.

2. **Los sistemas no llaman "hacia arriba".** Un sistema (vuelo, colisión, momentum) nunca invoca
   al flujo de misión o de muerte. Cuando algo termina la partida, **devuelve una señal**
   (`'objective'`, `{ death }`) y el orquestador en `game.js` decide qué hacer. Así el sistema no
   depende de subsistemas que son de otro lado.

3. **`deps` para el integrador.** `flight` toca tantas cosas (cámara, armas, objetivo) que recibe
   lo que aún no es módulo propio en un objeto `deps` chico y documentado. No es una bolsa: cada
   ítem tiene una razón y se graduará a `import` cuando cámara/armas tengan su archivo.

4. **Snapshot para el render que aún no importa stores.** Algunas pantallas (`screens`, `menus`)
   reciben lo que necesitan por parámetro en vez de importar el estado — dependencias explícitas y
   testeables. Los módulos de render más nuevos (`world`, `plane`, `hud`) ya leen los stores directo.

## El árbol

### `data/` — contenido estático, cero dependencias

Todo lo que es "datos del juego" y no cambia en runtime. Ningún archivo de acá importa lógica.

| archivo | qué contiene |
|---|---|
| `strings.js` | textos es/en, briefings y epílogos |
| `palette.js` | colores `P`, estilos de agua, presets de cielo, paleta de tierra |
| `ships.js` | layouts de zonas del momentum por clase de buque |
| `missions.js` | las 6 misiones de campaña, tipos de objetivo |
| `planes.js` | aviones seleccionables + sprite sheets horneados |
| `sfx.js` | tabla de efectos de sonido |
| `tuning.js` | **las perillas**: constantes de ajuste (zona de vuelo, momentum, pirueta) |

### Fundacionales — canvas y sonido

Viven en `render/` y `systems/` por nombre, pero son **capas base** que importa medio juego:

- **`render/ctx.js`** — el canvas, su contexto, las medidas del mundo (`W/H/HOR/F/PZ`) y las
  primitivas de dibujo (`px`, `panel`). Todo lo que dibuja pasa por acá.
- **`systems/audio.js`** — el "driver" de sonido: música, efectos con samples, y beep/boom
  procedurales. Dueño del `AudioContext`.

### `core/` — estado compartido y helpers puros

El corazón. Los **stores** (identidad estable) y lo que es matemática/utilidad sin estado.

| archivo | qué posee / qué es |
|---|---|
| `state.js` | `S.state` (la máquina de estados, se toca con `setState`), `cfg`, `cam`, `plane`, `stats` |
| `run.js` | `run`: los ~40 números de la corrida en curso (velocidad, nafta, rachas, armas) |
| `world.js` | los arrays de entidades (obstáculos, balas, misiles, soldados, partículas) + `prune`/`clearWorld` |
| `input.js` | `inp`/`mouse`/`pointer`/`flags` + `initInput`: el único que escucha teclado/mouse/táctil |
| `fx.js` | helpers visuales compartidos: `proj` (proyección), `popup`, `explodeAt`, `bloodBurst` |
| `physics.js` | **pura**: la matemática de la *sensación* (cabeceo, energía, roce). La importa el feeltest |
| `i18n.js` | idioma: único dueño de `LANG`; `T`, `L`, `cycleLang` |
| `util.js` | utilidades puras (`wrapChars`, `multOf`) |

### `systems/` — el comportamiento (escriben el estado)

La lógica que hace avanzar el juego. Cada uno muta stores y devuelve señales; ninguno dibuja.

| archivo | qué hace | señala |
|---|---|---|
| `flight.js` | el integrador: gas, energía, roce, combustible, radar, cañón | `'momentum'`·`'objective'`·`{death}` |
| `spawn.js` | siembra obstáculos y soldados por distancia | — |
| `collision.js` | resuelve impactos y reparte puntaje | `{death}` |
| `momentum.js` | el clímax en primera persona (bullet-time, zonas, re-ataque) | `'objective'`·`{death}` |
| `three-world.js` | el fondo 3D (three.js) del momentum |  |
| `audio.js` | *(fundacional, ver arriba)* |  |

### `render/` — el dibujo (leen el estado)

Todo lo que pinta. `draw()` en `game.js` gestiona los transforms y delega acá.

| archivo | qué dibuja |
|---|---|
| `world.js` | mar, tierra, cielo bajo, oleaje, estela, obstáculos, barcaza |
| `plane.js` | el sprite del avión y su mira |
| `hud.js` | instrumentos, avisos, barra de objetivo, cuenta regresiva del despegue |
| `screens.js` | recuento, briefing, derribado, victoria, guion narrativo |
| `menus.js` | selección de modo/avión y el menú de configuración `[M]` |
| `momentum.js` | el render del clímax (barcaza, zonas, cabina, visor) |
| `theme.js` | `theme.sky`/`theme.water`: la paleta activa (la comparten mar 2D, telón 3D y HUD) |
| `ctx.js` | *(fundacional, ver arriba)* |

### `game.js` — el ensamblador

Lo que queda es genuinamente el pegamento:
- **arranque** y carga de assets
- **el bucle**: `update(dt)` y `draw()`, cada uno un orquestador de ~40 líneas que llama a los sistemas / al render en orden
- **flujo de misión y campaña**: `enterMission`, `finishObjective`, `freezeRun`, encadenado de niveles
- **cámara**: `camZ`, `camMode`, `viewMouse` (aún no es módulo)
- **cableado del input**: registra las acciones (callbacks) que `core/input.js` dispara

## "Quiero cambiar X — ¿dónde voy?"

| cambio | archivo |
|---|---|
| cómo se *siente* volar (cabeceo, energía, roce) | `core/physics.js` (y probalo con `npm run feel`) |
| una perilla de ajuste (zona de vuelo, momentum) | `data/tuning.js` |
| agregar un buque / fase al momentum | `data/ships.js` (es data; la lógica es genérica) |
| una misión nueva | `data/missions.js` |
| textos / traducciones | `data/strings.js` |
| colores | `data/palette.js` |
| qué pasa al chocar / puntaje | `systems/collision.js` |
| aparición de obstáculos | `systems/spawn.js` |
| el clímax en primera persona | `systems/momentum.js` (lógica) + `render/momentum.js` (dibujo) |
| controles / teclas | `core/input.js` (+ las acciones en `game.js`) |
| el HUD | `render/hud.js` |
| el mar / los obstáculos en pantalla | `render/world.js` |
| el sprite del avión | `render/plane.js` |
| sonido | `systems/audio.js` + `data/sfx.js` |

## Las redes de seguridad (`npm run check` las corre todas)

| comando | qué garantiza |
|---|---|
| `lint:state` | nadie reasigna un store compartido (los mutás, no los reemplazás) |
| `unit` | la física pura, con casos de borde (`node:test`, cero dependencias) |
| `feel` | la *sensación* — importa las fórmulas REALES de `core/physics.js`, no las re-implementa |
| `smoke` | abre el juego en Electron y falla si el canvas queda en blanco, **deja de cambiar**, no suena o tira error de consola — en menú, vuelo, derribado, momentum, combate y mouse |
| `build:web` + `smoke:web` | lo mismo sobre el build web autocontenido |

> El chequeo de "el canvas cambia entre cuadros" no es adorno: en este refactor atrapó un
> `ReferenceError` entre módulos que la sintaxis y el bundle dejaron pasar (una función de render
> usaba una variable que no recibía). El render se congela, y el smoke lo ve.
