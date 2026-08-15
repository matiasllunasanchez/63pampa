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

## Vocabulario: PASILLO y ARENA

Todo run del juego se arma combinando dos **fases**, no dos modos:

- **PASILLO** — el vuelo rasante de siempre: gas contra gravedad, esquivar en un carril, cañón y
  misil sobre lo que aparece. Es el estado `'play'` (más `'takeoff'`/`'relevo'` a su alrededor) y
  vive en `systems/flight.js` + `spawn.js` + `collision.js` + `moves.js`.
- **ARENA** — el asalto al buque, volado en 3D en un espacio abierto y acotado. Es el estado
  `'arena'` y vive en `systems/arena.js` + `systems/three-arena.js` + `render/arena.js`.

Los **modos** del menú son combinaciones de estas dos fases:

| modo | fases |
|---|---|
| HISTORIA | PASILLO → ARENA, con guion entre niveles |
| CICLO DE MUERTE | PASILLO → ARENA, misión al azar |
| POR LA PATRIA | solo PASILLO, infinito (nunca entra a ARENA) |
| MINUTOS SAGRADOS | solo ARENA, batallas al azar (nunca cruza el PASILLO) |

`systems/momentum.js` es el clímax de pasadas VIEJO (bullet-time, cámara en riel): hoy es el
**fallback sin 3D** de la fase ARENA (web / `?no3d`), no un modo aparte. Ver
[PROMPT_ARENA_VUELO_LIBRE.md](PROMPT_ARENA_VUELO_LIBRE.md) para la historia completa (incluye el
intento anterior, rechazado, documentado en `PROMPT_MOMENTUM_3D.md`).

> ⚠️ **"MOMENTUM" el nombre significa DOS cosas hoy** (ROADMAP #13, construido 3/8/2026): el
> **ESPECIAL de cámara lenta** del jugador existe y vive en `systems/tempo.js` — la barra se
> carga **con puntos** (`TEMPO_CHARGE`) y llena se **lanza** con la tecla 4 (`TEMPO_DUR` s; esas
> dos perillas son el árbol de mejoras futuro). Por ahora **solo PASILLO**; el ARENA queda para
> una iteración futura. El
> módulo se llama `tempo` a propósito: `systems/momentum.js` — el bullet-time viejo del clímax
> sin 3D — todavía conserva el nombre por herencia histórica y **sigue pendiente renombrarlo**
> (p. ej. `barcaza.js`, junto con `render/momentum.js` y el estado `'momentum'`) en un commit
> mecánico propio, para que "momentum" quede libre para el poder.

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
| `story.js` | **escenas del MODO HISTORIA** en el modelo nuevo (id de línea + `hold` + placa + cara). Hoy: el locker de m7. El resto del guion sigue como pantallas en `strings.js` |
| `planes.js` | aviones seleccionables + sprite sheets horneados |
| `sfx.js` | tabla de efectos de sonido |
| `tuning.js` | **las perillas**: constantes de ajuste (zona de vuelo, momentum, pirueta) |

### Fundacionales — canvas y sonido

Viven en `render/` y `systems/` por nombre, pero son **capas base** que importa medio juego:

- **`render/ctx.js`** — el canvas, su contexto, las medidas del mundo (`W/H/HOR/F/PZ`) y las
  primitivas de dibujo (`px`, `panel`). Todo lo que dibuja pasa por acá.

  > ⚠️ **HAY DOS ESPACIOS DE COORDENADAS.** Es lo primero que hay que saber para tocar el render:
  >
  > | capa | espacio | quiénes |
  > |---|---|---|
  > | **mundo** | `W`×`H` = **480×270** | `world.js`, `plane.js`, `momentum.js`, `three-world.js`, `fx.js` (`proj`), y el vuelo |
  > | **diseño** | `DW`×`DH` = **320×180** | `hud.js`, `screens.js`, `menus.js` |
  >
  > Las de diseño **importan `DW`/`DH` con alias `W`/`H`** y el orquestador (`draw()` en `game.js`)
  > las dibuja envueltas en `ctx.scale(U, U)` (`U` = 1.5). Se hizo así al subir la resolución: el
  > mundo es procedural y gana detalle real con más píxeles, pero el HUD es texto y cajas, que no
  > ganan nada y solo se habrían corrido de lugar. Como `U × SC` = 3 exacto, no hay medio píxel.
  >
  > **Al tocar el HUD o una pantalla, razonás en 320×180.** Si necesitás una posición del mundo ahí
  > (como el multiplicador pegado al avión), dividí el resultado de `proj()` por `U`.
  >
  > Las constantes de **mundo** (`FLY_X`, `PZ`, alturas de obstáculos) son independientes de la
  > resolución y no se tocan.
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
| `physics.js` | **pura**: la matemática de la *sensación* del PASILLO (cabeceo, energía, roce). La importa el feeltest |
| `aero.js` | **pura**: la matemática de la *sensación* del ARENA — ángulos comandados (cabeceo/alabeo), viraje coordinado, energía, el **sweet spot** de viraje, la **media vuelta** guionada (`startUturn`/`stepUturn`) y el **drift** (`stepVel`: la trayectoria se despega del morro). Es un módulo aparte de `physics.js` porque el arena **dejó de heredar el sobre de vuelo del pasillo** (allá `y` es altura de scroll; acá el jugador manda ángulos) — la decisión está en `PLAN_MINUTOS_SAGRADOS.md` §3. La importa el feeltest |
| `squad.js` | **pura**: vidas, fases del relevo, indicativos y puestos de la formación (la importa el unit test) |
| `damage.js` | **pura**: los tres MODELOS DE VIDA (`squad` / `integ` / `visual`), la tabla de daño por causa, qué mata siempre y los escalones de avería. La regla: **te disparan → daño; chocás algo → muerte**. Ver [SPEC_AVERIAS.md](sistemas/SPEC_AVERIAS.md) |
| `horizon.js` | horizonte giratorio: cuánto se inclina el **mundo** (`hzWorld`), cuánto se le descuenta al sprite (`hzSprite`), el alabeo real que lee el instrumento (`attitude`), el giro libre de `[Q]`/`[E]` (`stepHorizon`) y cuánto se funde lo que solo se lee derecho (`tiltFade`). Es **solo dibujo** — `proj()` no lo ve |
| `i18n.js` | idioma: único dueño de `LANG`; `T`, `L`, `cycleLang` |
| `dialogue.js` | **el motor de líneas del MODO HISTORIA**: tipea letra a letra, completa de un toque y hace respetar el `hold` (el silencio actuado, que NO se puede saltear). Puro — sin canvas, audio ni idioma — así lo prueba `npm run unit`. Trae el store `dlg` y el adaptador que lee las pantallas viejas de `strings.js` |
| `util.js` | utilidades puras (`wrapChars`, `multOf`) |

### `systems/` — el comportamiento (escriben el estado)

La lógica que hace avanzar el juego. Cada uno muta stores y devuelve señales; ninguno dibuja.

| archivo | qué hace | señala |
|---|---|---|
| `flight.js` | el integrador del PASILLO: gas, energía, roce, combustible, radar, cañón | `'arena'`·`'momentum'`·`'objective'`·`{death}` |
| `spawn.js` | siembra obstáculos y soldados por distancia (PASILLO) | — |
| `collision.js` | resuelve impactos y reparte puntaje (PASILLO) | `{death}` |
| `arena.js` | la fase ARENA: asalto VOLADO en 3D (vuelo libre alrededor del buque, todas las zonas vivas, flak con predicción que consume escuadrón) — el modo normal con three.js; ver `PROMPT_ARENA_VUELO_LIBRE.md` | `'objective'`·`{death}` |
| `momentum.js` | el ARENA VIEJO: pasadas en riel (bullet-time, zonas, re-ataque) — hoy es el **fallback sin 3D** de la fase ARENA (web / `?no3d`) | `'objective'`·`{death}` |
| `moves.js` | las PIRUETAS de combate del PASILLO: mientras `run.mv` está activo es el dueño del avión (vx/vy/bank/pitch); el catálogo vive en `data/moves.js` y los combos los detecta `core/input.js` |  |
| `squad.js` | el RELEVO del escuadrón (vidas): cinemática, autopiloto y reset parcial; `game.js` decide relevo-o-muerte en `onDeath`. Corre en PASILLO y en ARENA | `'done'` |
| `three-world.js` | el fondo 3D (three.js) del ARENA VIEJO (`momentum.js`); ver `three-arena.js` para la escena del ARENA actual |  |
| `three-arena.js` | el mundo 3D de la fase ARENA: domo de cielo, mar centrado en el avión, buque a escala real (`ship3d.js`), proyección mundo→pantalla y raycast del disparo contra las zonas |  |
| `ship3d.js` | el modelo del buque y sus zonas críticas etiquetadas — DATA/geometría compartida entre `arena.js` (ARENA) y `momentum.js`/`three-world.js` (fallback) |  |
| `audio.js` | *(fundacional, ver arriba)* |  |

### `render/` — el dibujo (leen el estado)

Todo lo que pinta. `draw()` en `game.js` gestiona los transforms y delega acá.

| archivo | qué dibuja |
|---|---|
| `world.js` | mar, tierra, cielo bajo, oleaje, estela, obstáculos, barcaza |
| `plane.js` | el sprite del avión, tren de aterrizaje, fogonazos, turbina y su mira |
| `ammo.js` | las trazadoras del cañón (estela muestreada en z, color que enfría) |
| `enemies.js` | hojas horneadas de enemigos y props (helo, jet, vehículos, barcaza, globo, AA, carpa, depósito, puesto, fragata) — cajas medidas sobre el alfa; `world.js` cae a su dibujo a mano si una hoja no cargó |
| `soldiers.js` | hoja de sprites de los soldados (correr / cuerpo a tierra) |
| `boom.js` / `blast.js` | hongo de bomba / bola de fuego frontal (hojas de explosión) |
| `miras.js` | la hoja de miras del menú `[M]` |
| `hud.js` | instrumentos, avisos, barra de objetivo, cuenta regresiva del despegue, tablero del escuadrón |
| `squad.js` | la formación del despegue (y su salida de plano) + la sobreimpresión de la cinemática del relevo |
| `screens.js` | recuento, briefing, derribado, victoria, y el guion narrativo (UNA LÍNEA POR VEZ, leyendo `core/dialogue.js`) |
| `menus.js` | selección de modo/avión y el menú de configuración `[M]` |
| `momentum.js` | el render del ARENA VIEJO (barcaza, zonas, cabina, visor) |
| `arena.js` | el overlay 2D de la fase ARENA: corchetes/HP proyectados desde la escena 3D, fx del duelo, cabina o sprite (1ª/3ª persona, tecla V) y tablero (zonas + escuadrón) |
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
| cómo se *siente* volar (cabeceo, energía, roce, control por alabeo) | `core/physics.js` (y probalo con `npm run feel`) |
| que ←/→ rolen en vez de mover de costado | `cfg.control` + `bankStep`/`bankVx` en `core/physics.js`, aplicados en `systems/flight.js` |
| una perilla de ajuste (zona de vuelo, momentum) | `data/tuning.js` |
| a qué altura vuela un enemigo, o el techo de radar | `data/tuning.js` (`SPAWN_Y`, `RADAR_ALT`) — **una sola fuente para los tres terrenos** |
| desde qué distancia se ven los enemigos | `data/tuning.js` (`SPAWN_Z`) + `APPROACH_*` en `render/world.js` — **no** es `F` (ver el comentario de `SPAWN_Z`) |
| agregar un buque / sus zonas críticas | `data/ships.js` (es data; la lógica de ARENA y del fallback es genérica) |
| una misión nueva | `data/missions.js` |
| textos / traducciones | `data/strings.js` |
| una escena del MODO HISTORIA (líneas, holds, caras) | `data/story.js` — es DATA; el motor es genérico. Probala con `?scene=<ID>` y `npm run story` |
| cómo se siente leer el guion (velocidad de tipeo, auto-avance) | `core/dialogue.js` (`TYPE_CPS`, `autoSecs`) |
| el orden/flujo de las pantallas de campaña | `enterMission`/`initStory` en `game.js` + el análisis funcional en [SPEC_MODO_HISTORIA.md](sistemas/SPEC_MODO_HISTORIA.md) |
| colores | `data/palette.js` |
| agregar un FONDO de clima (imagen) | poner la imagen en `assets/world/terrain_back/`, sumar entrada a `TBACK_MAP` en `game.js` **con su fila de horizonte**, un preset en `SKY_PRESETS` y la opción a la fila FONDO de `CFG_ROWS` |
| qué pasa al chocar / puntaje (PASILLO) | `systems/collision.js` |
| aparición de obstáculos (PASILLO) | `systems/spawn.js` |
| la fase ARENA (vuelo, ring, combate) | `systems/arena.js` (lógica) + `systems/three-arena.js` (mundo 3D) + `render/arena.js` (overlay) |
| el ARENA VIEJO / fallback sin 3D | `systems/momentum.js` (lógica) + `render/momentum.js` (dibujo) |
| controles / teclas | `core/input.js` (+ las acciones en `game.js`) |
| el HUD | `render/hud.js` |
| el mar / los obstáculos en pantalla | `render/world.js` |
| dibujar filas del raster de suelo/mar | `render/world.js` — usá `rowH`, no `1`: con el horizonte girado las filas de 1 px dejan costuras y se ve el fondo por debajo |
| el sprite del avión | `render/plane.js` |
| el arte de un enemigo / prop horneado | `tools/bake_enemies.html` (modelo) → `npx electron tools/bake_enemies_run.js` → re-medir cajas en `render/enemies.js` |
| una pirueta (combo, duración, qué deja controlar) | `data/moves.js` (catálogo) + `systems/moves.js` (cinemática) — referencia jugable en [PIRUETAS.md](PIRUETAS.md) |
| una maniobra del **ARENA** (media vuelta, drift) | `core/aero.js` + `data/arena.js` (números) — **NO** `systems/moves.js`. El arena corre su **propio ejecutor** y esto es deliberado (decisión D2 de [PLAN_MINUTOS_SAGRADOS.md](sistemas/PLAN_MINUTOS_SAGRADOS.md) §10): `systems/moves.js` escribe `plane` y `run.mv*`, que son estado del PASILLO en 2D con `plane.y` como altura de scroll, y el arena tiene actitud propia en 3D. Lo que sí se comparte es la IDEA: mientras la maniobra corre, ella escribe el `io` y el jugador no maneja — el vuelo sigue siendo UNA sola integración |
| cuánto se ajusta el vuelo del ARENA (giro, freno, energía, techo) | `data/arena.js` (`AR.*`) — y medilo con `npm run feel`, sección *arena* |
| cuánto aguanta el avión / el modelo de vida | `core/damage.js` (la tabla y los escalones) + `systems/damage.js` (el estado) + la fila `DAÑO DEL AVION` en OPCIONES → PARTIDA. **No** agregues el chequeo en el sistema que golpea: llamá a `takeHit(cause)` y respetá lo que conteste |
| las vidas / el relevo del escuadrón | `core/squad.js` (tiempos, indicativos) + `systems/squad.js` (cinemática) + `render/squad.js` (dibujo) |
| que el horizonte gire al rolar, o el horizonte artificial del HUD | `core/horizon.js` (el ángulo, una sola fuente) + `draw()` en `game.js` (aplica el giro) + `drawADI` en `render/hud.js` |
| **cualquier ajuste del juego** | `OPT_ROWS` en `game.js` → pantalla **OPCIONES**. Es la única: el menú `[M]` ya no existe. Sumá `{ head }` para una sección nueva y `save:` para que persista |
| **un ajuste que toca al AVIÓN** (piruetas, mira, ejes, esquema de control, desempeño) | `MEJ_PREFS` / `mejRows()` en `game.js` → sub-pantalla **MEJORAS DEL PICHÓN**, que se abre con una fila `{ open: 'mejoras' }` de OPCIONES. Misma forma de fila que `OPT_ROWS` (mudar una es mover el objeto); `card:` es lo que se lee en la tarjeta de la derecha y `sw: true` la pinta como interruptor |
| que una pirueta se pueda prender y apagar | ya se puede: `cfg.movesOff` (`core/state.js`) + `moveAllowed()` en `data/upgrades.js`, que es la ÚNICA regla de qué pirueta sale — junta TENERLA (el banco, en campaña) con QUERERLA (el menú) |
| que suene la música del lobby en una pantalla nueva de menú | `inLobby()` en `systems/audio.js` **y** el `inLobby()` de `game.js` — son dos listas distintas y tienen que coincidir |
| el arte de un avión jugable | `tools/bake_planes.html` → `npx electron tools/bake_planes_run.js` |
| sonido | `systems/audio.js` + `data/sfx.js` |

## Las redes de seguridad (`npm run check` las corre todas)

| comando | qué garantiza |
|---|---|
| `lint:state` | nadie reasigna un store compartido (los mutás, no los reemplazás) |
| `unit` | la física pura, con casos de borde (`node:test`, cero dependencias) |
| `feel` | la *sensación* — importa las fórmulas REALES de `core/physics.js`, no las re-implementa |
| `smoke` | abre el juego en Electron y falla si el canvas queda en blanco, **deja de cambiar**, no suena o tira error de consola — en menú, PASILLO, derribado, ARENA, combate y mouse. Con three.js cargado (siempre en Electron y en el build web) entra a la fase ARENA nueva, no al fallback en riel de `momentum.js` |
| `build:web` + `smoke:web` | lo mismo sobre el build web autocontenido |

Y una que corre aparte, a mano, porque son 13 s de silencios reales:

| comando | qué garantiza |
|---|---|
| `story` | el fixture del MODO HISTORIA (el locker de m7): que cada `hold` dure lo que dice el guion, que una tecla complete el tipeo sin saltear la línea, que ningún toque atraviese un silencio — y que todo eso ande **con cero assets**. `STORY_SHOTS=<dir> npm run story` deja una captura por línea |

> El chequeo de "el canvas cambia entre cuadros" no es adorno: en este refactor atrapó un
> `ReferenceError` entre módulos que la sintaxis y el bundle dejaron pasar (una función de render
> usaba una variable que no recibía). El render se congela, y el smoke lo ve.
