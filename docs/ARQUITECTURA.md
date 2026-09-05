# Arquitectura de RASANTE

Mapa de la estructura del código. Para el *qué hace el juego* está el [README](../README.md); esto es
el *dónde vive cada cosa y por qué*.

El juego era un solo archivo (`src/game.js`, ~3700 líneas) y se partió en módulos con dependencias
explícitas. `game.js` conserva lo que es genuinamente "el pegamento": el arranque, el bucle
(`update`/`draw` como orquestadores), el flujo de misión/campaña, la cámara y el cableado del input.

> ⚠️ **La frase de arriba describía un ensamblador de ~800 líneas y 29 módulos. Hace rato que no es
> cierto** — y un mapa que miente es peor que ninguno. Los números reales están abajo.

## Estado real *(medido el 18/8/2026)*

Esta sección existe porque la deriva es silenciosa: nadie decide volver al monolito, se vuelve solo.
Los números salen de contar, no de recordar, y se vuelven a medir al cerrar cada fase del
[PLAN DE REFACTOR](proyecto/PLAN_REFACTOR.md).

| medida | valor | objetivo del refactor |
|---|---|---|
| `src/` sin bundle ni vendor | **26.434 líneas** en **88 módulos** | — |
| `game.js` | **3.388 líneas** · 72 imports | < 500 |
| `render/world.js` | **2.372 líneas** (mar + tierra + obstáculos + buque + nubes) | partido por capas (RF8) |
| estados de la máquina | **24** · `S.state ===` aparece **101** veces en `game.js` | registro de fases (RF3), < 10 |
| modos | 6 · `gameMode ===` **37** veces | descriptores (RF5), 0 fuera de `modes/` |
| decisiones por `o.type` | **138** | registro de entidades (RF6) |
| sondas `window.__` | **124** (64 dentro de `game.js`) | capa `dev/` (RF1), 0 fuera |
| copias del fallback de audio | **33** | eventos (RF4), 0 |
| claves sueltas de `localStorage` | **37**, sin versionar | 1 objeto versionado (RF7) |
| violaciones de capa | **40** *(techo en `tools/baseline/layers_whitelist.json`)* | 0, con el lint en ERROR |

**Lo que está bien y hay que proteger**: las cuatro convenciones siguen siendo correctas;
`core/aero.js` ya es el integrador 3D compartido (no hay vuelo duplicado); la capa de datos por
sistema ya empezó (`data/pasada.js`, `pulso.js`, `arena.js`, `missions.js` con `climax`); y la red
de pruebas —90 unitarios, `feel`, `lint:state`, `lint:layers`, dos smokes y **12 fixtures**— es lo
que vuelve posible el refactor. **Con red, se puede.**

### En cuarentena *(desde el 18/8/2026)*

**MINUTOS SAGRADOS (el ARENA) y PASADAS MORTALES están apartados, no borrados.** La perilla es
[`src/data/cuarentena.js`](../src/data/cuarentena.js) y es la única: saca de sus listas y la parte
entera revive. Sus módulos siguen compilando y sus fixtures siguen verdes a propósito — es lo que
avisa si se pudren mientras esperan. Se entra por sonda (`?pasada=`, `__prb('arena')`,
`npm run pasada`), nunca por el menú. Las misiones que declaraban `climax: 'arena'` **lo siguen
declarando**: la sustitución por EL PULSO ocurre en `climaxOf`, no pisando el dato.

### `legacy/` — leer antes de borrar

`src/legacy/` tiene el clímax viejo (`momentum.js`, `momentum_render.js`, `three-world.js`). **El
nombre promete más de lo que la carpeta cumple**: al mudarla se midió que todavía contiene código
**vivo** —la cabina que usa EL PULSO, `drift()` que `render/world.js` lee en tres caminos calientes,
el arranque compartido de three.js y el mar 3D del vuelo normal—. Cada archivo lista arriba qué
parte suya sigue viva. Hoy borrar ahí rompe el juego; separarlo es trabajo de RF2/RF8. Las 7
dependencias vivas están escritas en el techo del lint de capas y **solo pueden achicarse**.

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

Y hay una **tercera fase en construcción**, la **PASADA** — el clímax con la doctrina real (a ras,
saltar, soltar y salir), estado `'pasada'`, en `systems/pasada.js` + `render/pasada.js`, compartiendo
la escena 3D con el ARENA. Va por fases: el plan y las divergencias, en
[SPEC_MODO_PASADA.md](sistemas/SPEC_MODO_PASADA.md).

El menú tiene **dos puertas**: HISTORIA y **JUEGO RÁPIDO**, y adentro de la segunda viven los cuatro
modos que se juegan sin guion:

| modo | dónde | fases |
|---|---|---|
| HISTORIA | menú principal | PASILLO → **el clímax que diga la misión**, con guion entre niveles |
| CICLO DE MUERTE | JUEGO RÁPIDO | PASILLO → el clímax de esa misión, misión al azar |
| POR LA PATRIA | JUEGO RÁPIDO | solo PASILLO, infinito (nunca entra al clímax) |
| MINUTOS SAGRADOS | JUEGO RÁPIDO | solo ARENA, batallas al azar (nunca cruza el PASILLO) |
| PASADAS MORTALES | JUEGO RÁPIDO | **aproximación corta → PASADA**: arranca ya volando, en el punto exacto donde el buque asoma en el horizonte (`BARGE_T0` de `render/world.js`), con el mar vacío por delante. No hay spawns: el modo entero es el último tramo del ataque |

**QUÉ CLÍMAX juega una misión es DATO, no código**: el campo `climax` de `data/missions.js`, con
`climaxOf()` ahí mismo resolviendo el default — y el default de una misión con buque es la
**PASADA**; el ARENA quedó como excepción (hoy m4 y m12). Las misiones de distancia no tienen
clímax: las cierra el PASILLO. `runClimax()` en `game.js` no hace más que consultarlo.

> Los dos modos de **clímax suelto** (MINUTOS SAGRADOS y PASADAS MORTALES) **no miran el campo**, y
> no es una inconsistencia: esos modos no juegan la misión, juegan un clímax, y el buque es nada
> más el escenario. La sonda `?pasada=<n>` tampoco lo mira, por lo mismo.

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
| `moves.js` | **el catálogo de PIRUETAS** (`dur`, `steer`, `fire`, `turbo`, `tight`, `drift`) + la gramática de los combos escrita en prosa arriba, y `WINGMV`: las perillas de las **piruetas de actor** (dónde nace un Fiel, cuánto tarda en entrar y en irse, su tope de vida). Ver [PLAN_MANIOBRAS_FASES.md](sistemas/PLAN_MANIOBRAS_FASES.md) |
| `cines.js` | **las CINEMÁTICAS declaradas**: una lista de beats `{ t, ...verbos }` por escena, que interpreta `systems/cine.js`, más el `titulo`/`desc`/`ver` con que cada una se muestra en el menú **CINEMÁTICAS** (el catálogo se deriva de acá: una timeline nueva aparece sola). Hoy: el premio del PULSO. Ver [PLAN_DIRECTOR_CINEMATICAS.md](sistemas/PLAN_DIRECTOR_CINEMATICAS.md) |
| `pruebas.js` | **el catálogo del MODO PRUEBAS**: un MOMENTO por entrada (`{ id, titulo, desc, setup }`). `setup` recibe la api de verbos que arma `game.js` y solo llama a la capa de sondas — nunca tiene lógica de juego. Ver [COMO_PROBAR.md](proyecto/COMO_PROBAR.md) §4 |

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
| `tramos.js` | **pura**: el guion de spawn por misión — resuelve QUÉ tramo rige a una fracción del camino (`tramoAt`) y valida la data (`validarTramos`). Fracciones y no metros, porque `?qa` comprime las distancias y un metro absoluto no sobrevive. La importa el unit test |
| `zigzag.js` | **el PASILLO QUE DOBLA**: el trazado del carril curvo (procedural por semilla o explícito), la tabla `bendW(z)` —cuánto está corrido de costado el carril a cada profundidad, que es lo que suma `proj()` y con eso dobla el mundo entero—, la deriva de la curva, la inclinación del horizonte y la mirada al ápice. **Apagado, `bendW` devuelve CERO EXACTO**: cada sitio de dibujo suma `+ 0` y un mapa recto se dibuja igual que antes de que el módulo existiera. Trae su propio store (`zz`) porque la tabla se rehace una vez por cuadro. Ver [PLAN_PASILLO_ZIGZAG.md](sistemas/PLAN_PASILLO_ZIGZAG.md) |
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
| `caza.js` | **LA COLA**: el duelo contra el Harrier que te toma la cola durante el PASILLO (aviso → presión → sobrepaso → ventana → salida). Lee tu vuelo, **nunca lo escribe**; corre sólo en `'play'`. Incluye su propio **director** (`cazaDirector`), que decide *cuándo* hay duelo mirando `cfg.caza` — la aparición es dato de misión, no regla escondida (ver [PLAN_HARRIERS_PERSECUCION.md](sistemas/PLAN_HARRIERS_PERSECUCION.md)) | `{death}` |
| `persec.js` | **PERSECUCIÓN**: el líder que volás de numeral, con su banda de distancia (PLAN B del mismo documento). El líder **nunca choca**: esquiva con vista adelante *y* `carrilLibre()` es lo que `spawn.js` consulta para no sembrarle encima. Se arma por **modo** (`PERSECUCIÓN` del menú, infinito) o por **dato de misión** (`cfg.persec`). Lee tu vuelo, nunca lo escribe | `{death}` |
| `cine.js` | **EL DIRECTOR**: interpreta una timeline de `data/cines.js` y, en cada instante, llama a los sistemas que ya existen (piruetas por `moves.js`, sonido por `audio.js`, sacudida en `run`). **No mueve nada: encadena** — si la pirueta cambia de curva, la cinemática cambia con ella. El calendario puro (qué beat cae en qué segundo) vive en `core/cine.js` y se prueba en node | `'done'`·`{radio}`·`{scene}` |
| `squad.js` | el RELEVO del escuadrón (vidas): cinemática, autopiloto y reset parcial; `game.js` decide relevo-o-muerte en `onDeath`. Corre en PASILLO y en ARENA | `'done'` |
| `charla.js` | **LAS CHARLAS EN VUELO**: diálogo DURANTE la misión jugable, sin pausar el mundo. Es dueño de una FASE (`idle` → `armada` → `activa` → `saliendo`) y de nada más: no dibuja, no habla y no arranca el motor de líneas — contesta los gates (`sembrar()`, `avance()`, `hablando()`) y devuelve señales. La burbuja congela **acreditación** (`run.dist`, nafta), jamás física ni relojes. Ver [SPEC_CHARLAS_VUELO.md](sistemas/SPEC_CHARLAS_VUELO.md) | `'arranca'`·`'fin'` |
| `tramos.js` | el estado de los TRAMOS en la corrida: qué lista trae la misión, contra qué objetivo, y qué radios ya sonaron. `val(clave, cfg.loQueSea)` es lo que leen `spawn.js` y el gate de LA COLA; `stepTramos()` devuelve `{ radio }` al entrar a un tramo nuevo y **el orquestador la dice** | `{radio}` |
| `zigzag.js` | el estado del ZIGZAG en la corrida: qué trazado trae la misión, contra qué objetivo, y si está habilitado AHORA (solo en `'play'`, nunca en el clímax). `stepZigzag()` se llama **sin condición** desde `update()` y decide adentro — apagar la tabla es la mitad importante, o el mundo quedaría doblado dentro del ARENA | — |
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
| `miras.js` | la hoja de miras (`assets/miras.webp`), que elige la fila MIRA de **MEJORAS DEL PICHÓN** |
| `hud.js` | instrumentos, avisos, barra de objetivo, cuenta regresiva del despegue, tablero del escuadrón |
| `squad.js` | la formación del despegue (y su salida de plano) + la sobreimpresión de la cinemática del relevo |
| `screens.js` | recuento, briefing, derribado, victoria, y el guion narrativo (UNA LÍNEA POR VEZ, leyendo `core/dialogue.js`). Adentro vive **`drawCuaderno`**, la pantalla propia de las cartas de Mateo (registro TIERRA): la lámina de la carilla sin velo, el texto escrito a mano en la hoja izquierda, y los dos controles en las esquinas de abajo |
| `menus.js` | selección de modo/avión, los submenús de HISTORIA / JUEGO RÁPIDO / **PRUEBAS** (los tres son `drawRowMenu`, una sola función con otro contenido; PRUEBAS además usa su `view` para deslizar la lista) y las pantallas **OPCIONES** / **MEJORAS DEL PICHÓN** (`drawOptions` / `drawMejoras`; el viejo menú `[M]` ya no existe). ⚠️ La lista `opts` de `drawModeSelect` y `MODES` de `game.js` **son la misma lista en dos lados**: si divergen, el cursor se para en una fila y se dibuja otra |
| `momentum.js` | el render del ARENA VIEJO (barcaza, zonas, cabina, visor) |
| `arena.js` | el overlay 2D de la fase ARENA: corchetes/HP proyectados desde la escena 3D, fx del duelo, cabina o sprite (1ª/3ª persona, tecla V) y tablero (zonas + escuadrón) |
| `caza.js` | el Harrier de **LA COLA** y sus trazadoras. Se dibuja en **dos pasadas** (`drawCaza(true/false)`) porque el caza cruza de detrás tuyo a delante y no hay una sola capa correcta |
| `persec.js` | el líder de la **PERSECUCIÓN** (`drawPersec`, grilla de MUNDO) y su **cinta de formación** (`drawCinta`, grilla de DISEÑO, dentro del `scale(U)` del HUD). Ojo: los dos espacios de coordenadas conviven en este archivo |
| `sea.js` *(en `core/`)* | **PURO**: el campo de altura del mar y el bulto de las olas. Vive en `core/` y no en `render/` porque la colisión tiene que evaluar la MISMA superficie que se dibuja — lo que ves es lo que te mata |
| `cine.js` | lo único que EL DIRECTOR dibuja: las bandas negras (`letterbox`) y su fundido. El resto de una cinemática lo dibuja el dueño de la escena |
| `marco.js` | la **NIEBLA DE GUERRA**: el velo lateral que tapa lo que no es pasillo (`cfg.marco`: BRUMA blanca o FOCUS negro). Su borde interno es la proyección del carril y **nunca la cruza**, así que no puede tapar un obstáculo — por eso es preferencia y no dificultad, al revés que `systems/fog.js` |
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
| **que una misión NO sea igual de principio a fin** (un tránsito mudo, un cordón de radares al final, densidad que crece) | el campo `tramos` de `data/missions.js` — **data pura, cero código por misión**: segmentos por fracción del camino con su densidad (`obstacles`), su nivel de LA COLA (`caza`), su bombardeo (`bombs`), sus bidones (`bidones: false`), su sesgo de mezcla (`favor`) y su línea de radio (`radio`). La matemática es `core/tramos.js` (pura, con validador que corre en `npm run unit` contra TODAS las misiones) y el estado, `systems/tramos.js`. **Nada muta `cfg`**: se resuelve por lectura, porque un `cfg.obstacles` escrito quedaría pegado para el modo siguiente. Sondas: `__trdbg`, `__trset`, `__trclear`/`__trcount`. Fixture propio: `npm run tramos`. Spec y divergencias: [SPEC_TRAMOS.md](sistemas/SPEC_TRAMOS.md) |
| **que el pasillo DOBLE** (el callejón de las bombas: un brazo de mar torcido entre cerros, no un tubo recto) | el campo `zigzag` de `data/missions.js` y la fila PASILLO EN ZIGZAG de OPCIONES. El modelo es el **riel curvo** (OutRun / After Burner): el carril no se mueve en `x` absoluto — `FLY_X` y `SPAWN_X` no cambian —, lo que dobla es lo que la cámara ve, y en la curva el avión **deriva hacia afuera** y hay que sostener la palanca. Matemática pura en `core/zigzag.js` (con validador en `npm run unit` contra todas las misiones), estado en `systems/zigzag.js`. Sondas `__zzdbg`/`__zzset`/`__zzbend`, `?zigzag=1|2`, fixture `npm run zigzag`. Plan y divergencias: [PLAN_PASILLO_ZIGZAG.md](sistemas/PLAN_PASILLO_ZIGZAG.md) |
| **una CHARLA EN VUELO** (diálogo mientras se vuela) | dos datos y ningún código: la escena en `data/story.js` con `tipo: 'VUELO'` (sin placa — el fondo ES el juego) y el campo `charla: '<ID>'` en un tramo de `data/missions.js`. Las perillas son `CHV_*` en `data/tuning.js`; el estado vive en `systems/charla.js`. **Tiene que entrar en `CHV_MAX_S` segundos** (`max(1.6, chars/12) + hold` por línea): la escena que no entra NO se recorta, se parte en dos y se cuelga de dos tramos seguidos. Lo custodia `npm run unit`, que es el único que ve el texto; probala con `?charla=<ID>` y `npm run charlas` |
| textos / traducciones | `data/strings.js` |
| una escena del MODO HISTORIA (líneas, holds, caras) | `data/story.js` — es DATA; el motor es genérico. Probala con `?scene=<ID>` y `npm run story` |
| cómo se siente leer el guion (velocidad de tipeo, auto-avance) | `core/dialogue.js` (`TYPE_CPS`, `autoSecs`) |
| el orden/flujo de las pantallas de campaña | `enterMission`/`initStory` en `game.js` + el análisis funcional en [SPEC_MODO_HISTORIA.md](sistemas/SPEC_MODO_HISTORIA.md) |
| colores | `data/palette.js` |
| agregar un FONDO de clima (imagen) | poner la imagen en `assets/world/terrain_back/`, sumar entrada a `TBACK_MAP` en `game.js` **con su fila de horizonte**, un preset en `SKY_PRESETS` y la opción a la fila FONDO de `CFG_ROWS` |
| qué pasa al chocar / puntaje (PASILLO) | `systems/collision.js` |
| aparición de obstáculos (PASILLO) | `systems/spawn.js` |
| **el duelo del Harrier en la cola** | `systems/caza.js` (el ciclo) + `render/caza.js` (el dibujo) + las perillas `CAZA_*` de `data/tuning.js`. Corre **sólo en `'play'`**: es una mecánica del PASILLO y no aparece en ARENA, PASADA ni MINUTOS SAGRADOS. **Lee** tu vuelo y jamás lo escribe — por eso `npm run feel` no se mueve. Sondas: `?caza[=mudo,manso]`, `__czstart`, `__czdbg`, `__czfase`, `__czcalma`, `__czalto`, `__czquiebre`, `__czmv`, `__czsol`, `__czpegar`, `__czdir`. Fixture propio: `npm run caza` |
| **volar de numeral (PERSECUCIÓN)** | `systems/persec.js` (el líder y la banda) + `render/persec.js` (el avión y la cinta) + las perillas `PURS_*` de `data/tuning.js`. La garantía de que el líder no choca es **doble** y hay que tocar las dos: `esquivar()` acá y la llamada a `carrilLibre()` en `systems/spawn.js`. Sondas: `?persec`, `__psdbg`, `__psdist`, `__pscarril`, `__psrec`, `__psinf`. Fixture propio: `npm run persec`. **Agregar un modo al menú JUEGO RÁPIDO corre las filas y rompe la navegación por flechas de `tools/smoke.js`** — pasó al agregar éste |
| la fase ARENA (vuelo, ring, combate) | `systems/arena.js` (lógica) + `systems/three-arena.js` (mundo 3D) + `render/arena.js` (overlay) |
| el ARENA VIEJO / fallback sin 3D | `systems/momentum.js` (lógica) + `render/momentum.js` (dibujo) |
| controles / teclas | `core/input.js` (+ las acciones en `game.js`) |
| **con qué termina una misión** (PASADA o ARENA) | el campo `climax` de `data/missions.js` — una palabra, sin tocar código. `climaxOf()` vive ahí mismo y resuelve el default (`'pasada'` para toda misión con buque); `runClimax()` en `game.js` sólo lo consulta, y `npm run unit` custodia la regla |
| **la DEFENSA de la PASADA** (quién te dispara) | `stepDefensa()` en `systems/pasada.js`, tres capas y cada una castiga UNA falta: el cañón de 4,5" cobra volar derecho (columnas que caminan sobre tu rumbo), el Sea Dart cobra volar alto lejos del buque (el techo de radar), la fusilería cobra quedarse sobre la cubierta. Perillas `GUN_*`, `COL_*`, `DART_*`, `CAT_*`, `FUS_*` en `data/pasada.js`. Sondas: `__pdef` la apaga, `__pinv` te hace inmune a ella |
| **el EJE DE ATAQUE de la PASADA** | el casco del buque está sobre X (`three-arena.js`: `|x| < 62.5`, `|z| < 11.25`), así que entrar por la eslora da una ventana de suelta 4× más larga que cruzar la manga. `axisAlign()` en `systems/pasada.js` mide la alineación y `render/pasada.js` dibuja el pasillo. Perillas `AXIS_*` en `data/pasada.js` |
| **cuántos INTENTOS tenés contra el buque** | el escuadrón. En la PASADA, cada avión es una suelta: `systems/pasada.js` devuelve `{ spent }` al resolverse la ristra y `onPassSpent()` de `game.js` releva — o pierde la misión si era el último. El daño al buque **persiste entre pilotos** (las zonas viven en el módulo, no en la instancia). Ver SPEC_MODO_PASADA RF-15 |
| **que el relevado se rompa o se muera** | la fila AL PERDER UN AVIÓN de OPCIONES (`cfg.relevoFx`), leída por `relevoRompe()` en `game.js`. Es TONO, no cuenta: el avión sale de la partida en los tres casos. OJO: los NOMBRES de los pilotos siguen colgados del roster (`squad.rosterActive()`), que es otra pregunta |
| **que el JOYSTICK vuele una fase nueva** | la lista `inGame` de `core/input.js`. Es la que decide dónde el pad escribe el vuelo; fuera de ella corre la rama de menús, que **suelta todos los ejes** (el avión se queda sin piloto en el aire). Le pasó a la PASADA. Y si el binding es nuevo, anotalo en la tabla `ctrl*` de `data/strings.js` **en los dos idiomas**: esa tabla es la pantalla CONTROLES de OPCIONES y dice lo que `input.js` *hace*, no lo que debería |
| **qué tecla o botón hace qué, en cada modo** | [CONTROLES.md](sistemas/CONTROLES.md) — la tabla normativa (teclado · joystick · táctil, modo por modo) y los huecos conocidos. Si tocás un binding en `core/input.js`, actualizá ESE doc **y** las filas `ctrl*` de `data/strings.js` en los dos idiomas |
| el HUD | `render/hud.js` |
| el mar / los obstáculos en pantalla | `render/world.js` |
| **el agua: la superficie, las olas y el clima del mar** | `core/sea.js` (PURO: `seaH`, `olaBump`, `seaHTotal`, `climaDe` — la MISMA función que dibuja el mar es contra la que resuelve la colisión) + las perillas `OLA_*` / `SEA_*` / `SUN_GLINT_HALF` de `data/tuning.js`. El dibujo está en `drawSeaDots` de `render/world.js`, la siembra en `systems/spawn.js` y los tres desenlaces (cara mata / cresta cuesta / se salta) en `systems/collision.js`. Probalo con `npm run agua`; el plan y las divergencias, en [SPEC_AGUA_OLAS.md](sistemas/SPEC_AGUA_OLAS.md) |
| **el suelo: la turba, la arena y el pasto** | `LAND_STYLES` / `CLAND_STYLES` / `LAND_AUTO` en `data/palette.js` → `theme.land` / `theme.cland`. El suelo es TEMA, no constante: `render/world.js` NO importa `LAND` — si lo importás, la turba vuelve a ser el mismo verde bajo cualquier cielo, que es el bug que T1 arregló. Las tablas derivadas (gradiente y pasto) se refrescan en `refreshGround()` sólo al cambiar la paleta |
| **LA CHANCHA (el reabastecedor, tecla 5)** | `systems/chancha.js` (barra, gates, cita, conexión — devuelve señales y el % de tanque; no toca stores) + `render/chancha.js` (el Hércules procedural, la manguera y la canasta) + las perillas `CH_*` de `data/tuning.js`. El pedido y la radio están en `pedirChancha()`/`chanchaRadio()` de `game.js`; la barra, en `render/hud.js`; la disponibilidad por misión, en el campo `chancha` de `data/missions.js`. **La canasta va a la profundidad de juego (`PZ`)**: a otra profundidad, la caja que se dibuja no es donde hay que poner el avión. Probalo con `npm run chancha`; el spec y las divergencias, en [SPEC_PODER_CHANCHA.md](sistemas/SPEC_PODER_CHANCHA.md) |
| **el relieve del suelo (las lomas)** | `core/tierra.js` (PURO: `tierraH`, `tierraPend`, `hayRelieve` — la MISMA función que levanta el pasto es contra la que se resuelve el roce) + las perillas `TIERRA_*` de `data/tuning.js`. El piso lo lee `groundY` en `systems/flight.js`; lo que se apoya en el suelo lleva `gy`, puesto UNA vez por `plantar()` en `systems/spawn.js` y leído por `core/hitbox.js`, el dibujo y el overlay. Con `TIERRA_AMP = 0` el suelo vuelve a ser plano |
| **la costa: la resaca, la rompiente de la orilla y el kelp** | `resaca()` en `core/sea.js` (es el AGUA subiendo, no la arena moviéndose) + `rompienteCostera()` en `systems/spawn.js` + las perillas `RESACA_*` / `OLA_COSTA_*` / `KELP_*`. Ojo: el vuelo parte tierra/mar en `shoreAt`, NO en la lengua de la resaca |
| **lo que hay en el suelo (pedreros, turbales, alambrados)** | `pedreroAt` / `turbalAt` en `core/tierra.js` + `drawAlambre` en `render/world.js` + las perillas `PEDRERO_*` / `TURBAL_*` / `ALAMBRE_*`. Todo determinista por banda de mundo: nada de `Math.random()` por cuadro o titila |
| **la lluvia mojando el suelo** | `MOJADO_A` / `CHARCO_*` en `data/tuning.js`, aplicadas en `render/world.js`. Es un VELO sobre el color resuelto, no una paleta nueva — así funciona con los cinco climas de T1. Los charcos se juntan en los bajos del relieve de T3 y reflejan `theme.sky` |
| **el viento en el pasto** | `pastoLean` (exportada de `render/world.js`, la misma que dobla los matojos) + las perillas `PASTO_*` / `RACHA_*` de `data/tuning.js`. Con `PASTO_LEAN.calm = 0` el campo queda idéntico al de antes. Probalo con `npm run tierra`; el plan y las divergencias, en [PLAN_TIERRA_COSTA.md](sistemas/PLAN_TIERRA_COSTA.md) |
| **el estilo del agua por clima** | `WATER_STYLES` + `WATER_AUTO` en `data/palette.js` (es una TABLA: agregar un cielo y olvidarse de su agua es un renglón que falta, no un `if` escondido) → `applyTheme` en `render/theme.js` |
| **el BANCO DE NIEBLA** (el que tapa de verdad) | `systems/fog.js` (dónde empieza y termina el tramo, `fogFade()` la rampa, `fogVis()` el alcance) + `drawFog` en `render/world.js` + las perillas `FOG_*` de `data/tuning.js`. **Dos reglas para no romperlo:** el borde del EFECTO es nítido (`inBank()` — dónde no se siembra, cuándo avisa el HUD, cuándo el Harrier queda ciego) pero el de la IMAGEN nunca lo es (`fogFade()` sube y baja a lo largo de `FOG_FADE` metros, empezando antes del banco); y la niebla **tapa lejos y deja ver cerca** — contra el horizonte se mira a lo largo del banco, debajo tuyo se lo mira casi en vertical. `FOG_TOP` es la altura del techo, y su distancia a `RADAR_ALT` es una mecánica: la rendija donde ves sin que te pinten |
| **el velo de los costados** (NIEBLA DE GUERRA) | `render/marco.js` + las perillas `MARCO_*` de `data/tuning.js`. Ojo con los dos sentidos de "niebla": ésta ENMARCA y no esconde nada que te pueda pegar; la de `systems/fog.js` (`cfg.fog`) SÍ tapa obstáculos y por eso vive en el bloque MAPA |
| dibujar filas del raster de suelo/mar | `render/world.js` — usá `rowH`, no `1`: con el horizonte girado las filas de 1 px dejan costuras y se ve el fondo por debajo |
| el sprite del avión | `render/plane.js` |
| el arte de un enemigo / prop horneado | el modelo vive en `tools/models/enemies.js` (no en el HTML) y el encuadre en `tools/bake_enemies.html` → `npx electron tools/bake_enemies_run.js`. **Las cajas ya no se re-miden a mano**: el runner escanea el alfa y escribe `assets/world/enemies/cajas.json` + `src/data/cajas.js`, que es lo que importa `render/enemies.js`. Lo único que queda a mano ahí es `wu`/`href`, que son perillas de arte (qué tan grande se **ve**), no medidas |
| **lo que queda de algo roto** (la carcasa en el suelo) | el modelo del estado ROTO está en `tools/models/restos.js` y se hornea con el resto de los enemigos (`npx electron tools/bake_enemies_run.js`). Qué carcasa deja cada cosa es el campo `resto` de su receta en `data/despiece.js`; `morir()` la planta y `render/world.js` la dibuja. **No tiene respaldo por código a propósito**: sin la hoja no se dibuja nada, porque un rectángulo gris en el lugar de un naufragio ensucia la historia en vez de contarla. Y **no tiene reloj**: se va cuando el pasillo la pasa, no cuando se cumple un tiempo — si alguien le pone vida, le saca justamente lo que la distingue de la columna de humo. Sonda: `__restosTodos()` · `__restos()` · `npm run romper` §4 |
| **EL PODER RASANTE** (tecla 6) | `systems/rasante.js` es el dueño: barra, reloj, señales y el encuadre. **No mueve el avión**: `flight.js` le pregunta `active()` y aplica el resorte (`vertRasante`) y el colchón. Perillas en `data/tuning.js` bloque «EL PODER RASANTE». **La barra se DERIVA de los segundos de banda** — nunca guardarla aparte, se desincroniza y el poder se vuelve infinito (pasó). El HUD lo lee **por snapshot**, no por import (`lint:layers` no admite una tercera violación render→systems). ⚠️ El signo de `lift` es contraintuitivo: **más alto = el avión más abajo en el cuadro** — la superficie se dibuja del horizonte hacia abajo. Sondas: `?rasante` · `__rsdbg` · `__rscharge` · `__rscam` · `__rslift` · `__rsroce` · `npm run rasante` |
| **cuándo entrega mejoras la campaña** | `ofertaTrasMision(i)` en `data/upgrades.js` — **una sola fuente**: el epílogo de m1 no abre el banco, el de m2 sirve UNA sin elegir, y de m3 en adelante son dos a elegir. `loadoutAt` (el loadout de referencia del selector de misiones) **deriva** de esa misma función en vez de repetirla: escrita dos veces, el selector mostraría un loadout que la campaña no entrega. La pantalla se adapta sola a una carta (subtítulo y pie cambian). Sondas: `__campana(n)` · `__finMision()` · `__udbg()` |
| **cómo se ve el HARRIER de LA COLA** | modelo propio en `tools/models/harrier.js` (Sea Harrier FRS.1) → hojas `harrier` / `harrier_rear` / `harrier_turn`. El render es una cascada en `render/caza.js`: `harrier_turn` mientras dura la fase `recola` (la vuelta en U, columna por avance de fase), `harrier_rear` de cola, `harrier` de frente, silueta a mano si nada cargó. **El caza del pasillo (`jet`) es OTRO avión** y está modelado para diferenciarse punto por punto — los dos pueden estar en el mismo cuadro. ⚠️ Si se agrega una hoja que pida **yaw y alabeo a la vez**, mirarla: los dos van en grupos ANIDADOS en el horneador, y aplicados sobre el mismo objeto el avión sale encabritado en vez de alabeado |
| **cómo se ve el BUQUE del pasillo** | el modelo de las tres clases (`t42` / `t21` / `log`) está en `tools/models/buques.js`; qué clase es cada buque lo dice `SHIP_CLASS` de `data/ships.js`. El despachador es `drawCascoDelBuque` en `render/world.js`: usa la hoja horneada **a partir de 40 px de eslora** y por debajo cae a `drawBargeHull` (`legacy/momentum_render.js`), que tiene un modo de tres trazos para cuando el buque mide tres píxeles. **El agua no se hornea**: el bigote de proa y la flotación se pintan por código encima del sprite — es lo que hace que el buque se lea navegando. La vista DE PROA está horneada pero NO cableada (7,5 px de manga en el corte: ahí el dibujo a mano gana) y espera a que la PASADA salga de cuarentena. Sonda: `__buqueSet('HMS ARDENT')` · `__buque()` |
| **la luz, la cámara o las primitivas de CUALQUIER cosa horneada** | `tools/bake_common.js` — EL HORNO, compartido por los cuatro horneadores (PLAN_HORNEADO B0). Tocarlo cambia las 48 hojas del proyecto, así que se re-hornea todo y se compara: `npx electron tools/bake_{planes,enemies,ammo,partes}_run.js`. La regla es "una luz, una cámara, una paleta" y ahora es un archivo, no una promesa repetida en cuatro |
| una pirueta (combo, duración, qué deja controlar) | `data/moves.js` (catálogo) + `systems/moves.js` (cinemática) — referencia jugable en [PIRUETAS.md](PIRUETAS.md) |
| una maniobra del **ARENA** (media vuelta, drift) | `core/aero.js` + `data/arena.js` (números) — **NO** `systems/moves.js`. El arena corre su **propio ejecutor** y esto es deliberado (decisión D2 de [PLAN_MINUTOS_SAGRADOS.md](sistemas/PLAN_MINUTOS_SAGRADOS.md) §10): `systems/moves.js` escribe `plane` y `run.mv*`, que son estado del PASILLO en 2D con `plane.y` como altura de scroll, y el arena tiene actitud propia en 3D. Lo que sí se comparte es la IDEA: mientras la maniobra corre, ella escribe el `io` y el jugador no maneja — el vuelo sigue siendo UNA sola integración |
| cuánto se ajusta el vuelo del ARENA (giro, freno, energía, techo) | `data/arena.js` (`AR.*`) — y medilo con `npm run feel`, sección *arena* |
| cuánto aguanta el avión / el modelo de vida | `core/damage.js` (la tabla y los escalones) + `systems/damage.js` (el estado) + la fila `DAÑO DEL AVION` en OPCIONES → PARTIDA. **No** agregues el chequeo en el sistema que golpea: llamá a `takeHit(cause)` y respetá lo que conteste |
| las vidas / el relevo del escuadrón | `core/squad.js` (tiempos, indicativos) + `systems/squad.js` (cinemática) + `render/squad.js` (dibujo) |
| que el horizonte gire al rolar, o el horizonte artificial del HUD | `core/horizon.js` (el ángulo, una sola fuente) + `draw()` en `game.js` (aplica el giro) + `drawADI` en `render/hud.js` |
| **jugar UNA misión suelta** (probarla sin campaña alrededor) | la fila **MISIONES** del menú, o la sonda `__mision('m4')` / `?mision=m4[&historia]`. La puerta es UNA sola —`abrirMision()` en `game.js`— y la comparten el selector, la sonda y el verbo `mision` del catálogo de PRUEBAS: si fueran dos caminos, "probar la misión" y "jugar la misión" dejarían de ser lo mismo. Corre en `gameMode 'cycle'` con `S.test` puesto, que es lo que le da el roster y la regla de Chancha de la campaña **y** le saca el encadenado, los récords, los saves y las mejoras. La pantalla es `drawMisionesMenu` (`render/menus.js`, el mismo `drawRowMenu` de HISTORIA / JUEGO RÁPIDO / PRUEBAS). Fixture propio: `npm run misiones`. Plan y divergencias: [PLAN_MISIONES_FASES.md](proyecto/PLAN_MISIONES_FASES.md) §1 y §6 |
| **una CARTA de Mateo** (el registro TIERRA: cómo se ve, dónde cae el texto, qué tinta usa) | `drawCuaderno` y el bloque `CUAD` de `render/screens.js` — la columna se declara en **fracciones de la lámina**, no de la pantalla, así sobrevive al letterbox. La letra sale de `FONTS.mano` en `render/ctx.js` (**Mayorice**, la única manuscrita del banco con acentos y eñe: pasale `node tools/glifos.js` a cualquiera que quieras poner en su lugar, o la carta se dibuja media prestada a otra fuente sin que nada avise). La hoja es la carilla de `assets/story/carta*.webp`; sin ella se pinta una a mano (RF-01). Custodia: **`npm run cuaderno`** recorre las quince cartas y falla si alguna no entra en la página. Divergencias D-19…D-26 de [SPEC_MODO_HISTORIA.md](sistemas/SPEC_MODO_HISTORIA.md) |
| **una CINEMÁTICA** (cambiarla o agregar una) | `data/cines.js` — es DATA: una lista de beats, más el `ver` con que se mira suelta desde el menú **CINEMÁTICAS**. Si una escena no se puede escribir ahí, **falta un verbo** en `systems/cine.js`: se agrega el verbo, no la excepción |
| **un MOMENTO nuevo en el modo PRUEBAS** | `data/pruebas.js` — es DATA: una entrada más, con un `setup` que llama a los verbos de `pruebasApi()` (`mision`, `arena`, `pasada`, `pulso`, `escena`, `patria`, `persec`, `recarga`, `luego`, `sonda`, `cfg`). **Si el momento necesita algo que no existe, lo que se agrega es una SONDA** —útil también desde la consola y desde los fixtures— y el catálogo la llama: esa es la regla de oro que evita que el catálogo diverja del juego real, y la custodia un test unitario que corre cada `setup` contra una api espía. Ojo con las **sondas-interruptor** (las que quedan puestas, como `__czcalma`): van anotadas en `PRB_NEUTRO` de `game.js` o contaminan el momento siguiente. Sondas: `__prb(id)` entra a un momento por id, `__prb()` lista el catálogo |
| **cualquier ajuste del juego** | `OPT_ROWS` en `game.js` → pantalla **OPCIONES**. Es la única: el menú `[M]` ya no existe. Sumá `{ head }` para una sección nueva y `save:` para que persista |
| **un ajuste que toca al AVIÓN** (piruetas, mira, ejes, esquema de control, desempeño) | `MEJ_PREFS` / `mejRows()` en `game.js` → sub-pantalla **MEJORAS DEL PICHÓN**, que se abre con una fila `{ open: 'mejoras' }` de OPCIONES. Misma forma de fila que `OPT_ROWS` (mudar una es mover el objeto); `card:` es lo que se lee en la tarjeta de la derecha y `sw: true` la pinta como interruptor |
| que una pirueta se pueda prender y apagar | ya se puede: `cfg.movesOff` (`core/state.js`) + `moveAllowed()` en `data/upgrades.js`, que es la ÚNICA regla de qué pirueta sale — junta TENERLA (el banco, en campaña) con QUERERLA (el menú) |
| que suene la música del lobby en una pantalla nueva de menú | `inLobby()` en `systems/audio.js` **y** el `inLobby()` de `game.js` — son dos listas distintas y tienen que coincidir |
| **qué avión vuela la campaña** | `CAMPAIGN_PLANE` en `game.js` — se resuelve **por clave** (`key === 'sky'`), nunca por índice: `PLANES` se reordena y un `0` escrito a mano seguiría apuntando "al primero", que con una línea movida es otro avión. Lo fuerzan las **tres** puertas de una misión: `startCampaign()`, `loadSave()` y `abrirMision()` (el selector MISIONES, los MOMENTOS de PRUEBAS y la sonda `__mision`). Los modos que **no** son misión (POR LA PATRIA, PERSECUCIÓN, JUEGO RÁPIDO) respetan la elección del jugador. La decisión de fondo está en [AVIONES_ESCUADRON.md](historia/AVIONES_ESCUADRON.md) y el catálogo del roster en [AVIONES_CATALOGO.md](historia/AVIONES_CATALOGO.md). Custodia: `npm run misiones` |
| **cambiar la MUNICIÓN** (bombas y misiles) | son un **asset horneado**, igual que los aviones: modelo low-poly en `tools/bake_ammo.html` → `npm run ammo` → `assets/ammo/municion.png` → `render/municion.js`, que es el único que lee la hoja. La grilla NO es la de los aviones (alabeo × cabeceo): un proyectil **no rola**, así que las columnas son el **ángulo de vista** (de cola pura a casi de perfil) y las filas la munición (bomba / misil). Se hornea a **16 px** porque se dibuja entre 4 y 16: en pixel art el asset se hornea cerca del tamaño al que se dibuja. Quien la usa siempre tiene **plan B** — si la hoja no cargó, `dibujar()` devuelve false y cae a su receta de rectángulos. Al agregar un asset nuevo, **acordate de `tools/build_web.py`**: si no está en su lista, el build web falla con "rutas ../assets/ sin re-embeber" |
| **cambiar el PNG de la CABINA** | **el `src` y sus dos medidas viven JUNTOS**: `const COCKPIT` en `legacy/momentum_render.js` — `src`, `visor` (centro del vidrio del alza) y `vidrio` (dónde termina el parabrisas). Las dos se miden **leyendo el PNG**, nunca a ojo sobre la pantalla: el hueco central transparente da `vidrio` directo del canal alfa. Estuvieron declaradas a treinta líneas del `src` y pasó lo que tenía que pasar — el asset cambió en un lado y las fracciones en el otro. Cada modo declara **dónde apunta** (`COCKPIT_MIRA` en `render/arena.js`, que la PASADA importa; el suyo en `render/pulso.js`; `MOM_AY` para el ARENA VIEJO) y **cuánta pantalla se come** (`esc`, 1 por omisión). El tamaño no es una perilla libre: sale del mayor alto que no desborda (`altoDe`), con un **piso** de ancho pleno (`altoAncho`, para PNGs más angostos que el cuadro) que se aplica ANTES de `esc` — el piso evita un descuido, `esc` es una decisión, y una no puede vetar a la otra. Comprobalo con `__prb('arena'\|'pasada'\|'pulso')` y `__cabina()` |
| **de qué se rompe algo** (las piezas que vuelan al despiezarse) | el modelo 3D de cada pieza está en `tools/models/partes.js` y lo hornea `tools/bake_partes.html` y se hornea con `npx electron tools/bake_partes_run.js` → `assets/world/explosions/partes.png`. **Reusa las primitivas y las luces de `bake_planes.html`**: un ala arrancada es el ala del avión, no un icono aparte. La hoja se hornea en GRIS y el color lo pone la receta (`c` de `data/despiece.js`), tiñendo con `multiply` en `render/partes.js`. Qué piezas usa cada cosa es el campo `partes` de su receta, y el pedazo 0 es el que las variantes de v2 convierten en "la pieza grande". **El orden de las filas vive en `PARTES_HOJA` de `data/despiece.js`** (lo leen el render y `core/fx.js`) y `npm run unit` lo compara contra el modelo — antes vivía en el render y la única custodia era mirar la salida del runner. Hay DOS campos y hacen cosas distintas: `partes` reparte piezas por índice entre todos los pedazos, y `pieza` es **LA firma** del tipo, la que sale entera y girando (el rotor del helo, el plato del radar). Desde B5 las dos están horneadas; antes `pieza` se dibujaba a mano con tres recetas para todas. Sin la hoja, todo cae al rectángulo de siempre (`render/world.js`). Y si se agrega una hoja nueva, hay que declararla en `tools/build_web.py` o `npm run check` se pone en rojo |
| el arte de un avión jugable | el modelo está en `tools/models/planes.js`, el encuadre en `tools/bake_planes.html` → `npx electron tools/bake_planes_run.js`. El frame **nivelado** lo simetriza el horno (`BAKE.simetrizaCentro`): la proyección en perspectiva deja el ala izquierda medio píxel corrida y a 84 px eso se ve |
| sonido | `systems/audio.js` + `data/sfx.js` |

## Las redes de seguridad (`npm run check` las corre todas)

| comando | qué garantiza |
|---|---|
| `lint:state` | nadie reasigna un store compartido (los mutás, no los reemplazás) |
| **medir una muerte desde una sonda** | ⚠️ NUNCA con `obstacles.slice(largoDeAntes)`. `capParts()` saca a los pedazos viejos **spliceándolos** del array, así que todo se corre a la izquierda y esa ventana empieza en el lugar equivocado — se pierde el pedazo 0, que es el que lleva la firma del tipo. Se mide por **identidad**: `const antes = new Set(obstacles)` y después `obstacles.filter(c => !antes.has(c))`. Estuvo mal desde D0 y ensuciaba en silencio todas las medidas de `__romper` cuando había escombro en pantalla; lo destapó B5 |
| `lint:layers` | **el grafo de imports no empeora**. Lee todos los `import` de `src/` y marca lo que cruza capas mal (`data` importando fuera de data, `core` importando canvas o sistemas, `systems` importando render, `render` leyendo tripas de un sistema, y cualquiera **nuevo** colgándose de `legacy/`). Arranca en modo REPORTE con **trinquete**: la lista de hoy (`tools/baseline/layers_whitelist.json`, 40 entradas) es el techo — una violación que no esté ahí es ERROR, y la lista **solo puede achicarse** (`-- --prune`). Cuando llegue a cero pasa a ERROR puro |
| `unit` | la física pura, con casos de borde (`node:test`, cero dependencias) |
| `feel` | la *sensación* — importa las fórmulas REALES de `core/physics.js`, no las re-implementa |
| `smoke` | abre el juego en Electron y falla si el canvas queda en blanco, **deja de cambiar**, no suena o tira error de consola — en menú, PASILLO, derribado, ARENA, combate y mouse. Con three.js cargado (siempre en Electron y en el build web) entra a la fase ARENA nueva, no al fallback en riel de `momentum.js` |
| `build:web` + `smoke:web` | lo mismo sobre el build web autocontenido |

Y los **fixtures**, que corren aparte porque son minutos de juego real:

| comando | qué garantiza |
|---|---|
| `fixtures` | **los 12, en serie, más `feel`**. Uno por línea con su cuenta de ✓/✗ y su tiempo. En serie y no en paralelo a propósito: cada uno levanta su Electron con GPU y en paralelo se pelean por el contexto de WebGL — una prueba que falla por el corredor enseña a ignorar las pruebas. Con `-- --baseline` escribe `tools/baseline/`: `feel` **tal cual** (es determinista y es el juez del refactor) y cada fixture **normalizado** —los números enmascarados—, porque vuelan de verdad con azar en la siembra y un baseline literal fallaría siempre |


| comando | qué garantiza |
|---|---|
| `caza` | el fixture de **LA COLA**: que se entre al duelo por sonda, que el ciclo del §3 se encadene solo, que el sobrepaso mueva de verdad la pantalla (se mide el pico dentro del rAF, no desde afuera) y que nunca haya dos Harriers. Con `CAZA_SHOTS=<dir>` deja la secuencia entera en capturas — que es la mitad del criterio de H1, porque "se entiende sin leer nada" no lo puede juzgar una aserción |
| `tramos` | el fixture de los **TRAMOS**: que sin tramos no cambie nada (la regla suprema del spec), que la densidad de un tramo se note ≥3× contra otro, que `bidones: false` no deje nacer uno solo, que `favor` incline la mezcla hasta su techo teórico, que la radio suene una vez por tramo y en orden (y que un salto de sonda no produzca un coro, y que en pausa espere), que el VEIL siga mandando, y que **el tránsito del Narwal de M4 se vuele con cero spawns** y la conversación en orden. ⚠ Corre **sin `?qa`** a propósito: con el parámetro puesto la misión entera es más corta que la carrera de despegue y no nace un solo obstáculo — ver la divergencia 4 del spec |
| `misiones` | el fixture del **SELECTOR DE MISIONES**: recorre la campaña ENTERA por la sonda `__mision` y de cada misión exige que cargue (id, roster, buque, distancia), despegue, se dibuje **y se mueva**, y desemboque en **el clímax que declara** (`climax` de `data/missions.js`; las de distancia, en el recuento). Cierra entrando por la pantalla: la fila MISIONES abre el selector, la misión vuelve AL selector sin encadenar la siguiente, y `localStorage` queda idéntico. Es la red de regresión de la campaña, y la lista de misiones la pide al juego (`__misiones()`), así que agregar una la mete sola. `MISIONES_SHOTS=<dir>` deja una captura por misión |
| `charlas` | el fixture de **LAS CHARLAS EN VUELO**: que una misión SIN charlas no cambie en nada (el assert más importante del spec — se miden los tres gates RESUELTOS, no el estado interno), que la charla se arme, apague el sembrador en el mismo cuadro y espere el drenaje, que el motor sea el de siempre y avance SOLO (la línea cambia sin tocar una tecla), que al terminar el pasillo vuelva a sembrar y el auto-avance quede devuelto, y que cortarla no deje nada colgado. **El drenaje se mide con SOLDADOS y no con obstáculos**: el avión va clavado por sonda para poder medir, o sea que no esquiva — con obstáculos la sección se moría antes de terminar de drenar y acusaba al drenaje |
| `story` | el fixture del MODO HISTORIA (el locker de m7): que cada `hold` dure lo que dice el guion, que una tecla complete el tipeo sin saltear la línea, que ningún toque atraviese un silencio — y que todo eso ande **con cero assets**. `STORY_SHOTS=<dir> npm run story` deja una captura por línea |

> El chequeo de "el canvas cambia entre cuadros" no es adorno: en este refactor atrapó un
> `ReferenceError` entre módulos que la sintaxis y el bundle dejaron pasar (una función de render
> usaba una variable que no recibía). El render se congela, y el smoke lo ve.
