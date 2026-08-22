# PLAN DE REFACTOR — desacoplar para escalar *(análisis a fondo + fases)*

> ⏸️ **STANDBY — versión 2 (18/8/2026), LISTA para ejecutar cuando se pueda frenar el
> desarrollo.** Incorpora la DIRECCIÓN de Matías (ajustada el 18/8): **ARENA y PASADA
> quedan PENDIENTES** — no se borran: se ponen en cuarentena (fuera del menú y de los
> flujos, compilando, con sus fixtures) para revisarlas a fondo en otro momento y, si se
> puede, incorporarlas como MÓDULOS de alguna misión. El registro de fases (RF3) es
> justamente lo que hace eso posible después. Ver §4b. Mientras tanto vale la regla barata:
> **lo nuevo nace en el patrón nuevo** (datos en `data/<dominio>`, sondas registradas,
> fases como módulo).

> **Estado: análisis hecho sobre el código del 18/8/2026 + plan por fases, sin ejecutar.**
> Pedido de Matías: *"vamos a meterle muchas cosas nuevas — refactorizar con buenas
> prácticas, orientado al desacoplamiento, para escalabilidad y mantenibilidad"*.
>
> **Tesis del plan:** el proyecto NO necesita una reescritura. Las cuatro convenciones de
> ARQUITECTURA siguen siendo buenas y la red de pruebas es excelente. Lo que pasó es que
> **el crecimiento volvió a concentrarse en `game.js`** (3.382 líneas — el doc dice ~800) y
> que cada feature nueva **toca los mismos 5–8 archivos** porque las decisiones "por tipo"
> y "por estado" viven en cadenas de `if` y no en registros. El refactor convierte esas
> cadenas en **registros de datos + módulos por fase**, sin cambiar una línea de
> comportamiento: cada fase cierra con `npm run check` verde, `npm run feel` idéntico y los
> 12 fixtures verdes. Es un *strangler*, no un big-bang.

## 1. Diagnóstico a fondo *(medido, no opinado)*

### 1.1 Tamaño y concentración

| medida | valor | lectura |
|---|---|---|
| `src/` sin bundle ni vendor | **26.090 líneas** en ~60 módulos | el juego ya es mediano-grande |
| `game.js` | **3.382 líneas** (ARQUITECTURA: "~800") | **4× de deriva**: volvió a ser el monolito |
| `update()` / `draw()` | **460 / 530 líneas** — cadenas `if/else` por estado | cada estado nuevo alarga las dos cadenas |
| estados de la máquina | **24** (20 `setState` en game.js + 4 que ponen los sistemas) | y `S.state ===` aparece **95 veces** en game.js |
| modos | 6 literales (`campaign cycle survival persec arena pasadas`) en **27 comparaciones** | las reglas de flujo de cada modo están esparcidas, no declaradas |
| imports de game.js | **71** · funciones: **120** | el ensamblador conoce a todos |
| `render/world.js` | **2.367 líneas** | el segundo monolito: mar + tierra + obstáculos + buque + nubes |
| sondas `window.__*` | **114** en total, **62 dentro de game.js** (~350 líneas marcadas QUITAR) | la capa dev vive dentro del juego |

### 1.2 Acoplamientos (el grafo de imports real)

| violación de capa | sitios | qué significa |
|---|---|---|
| `systems/*` → `render/ctx.js` | **13 sistemas** | importan `W/H/PZ` — `ctx.js` mezcla CONSTANTES del mundo con el CANVAS. Un sistema no debería saber que existe un canvas |
| `render/*` → `systems/*` | **16 sitios** | el render lee estado INTERNO de sistemas (`squad`, `damage`, `chancha`, `tempo`, `fog`, `persec`…) en vez de stores. Cada sistema nuevo = el HUD importa uno más |
| `core/*` → `systems`/`render` | `fx.js`→`audio`, `input.js`→`audio`+`ctx` | el núcleo "puro" ya no es puro |
| `core/input.js` → `game.js` | **45 callbacks `a.*`** que input ESPERA que game.js registre + **12 `e.code` hardcodeados** | contrato implícito gigante; sin mapa de acciones no hay rebinding ni paridad de gamepad |

### 1.3 Las decisiones "por tipo" — el costo de agregar cosas

| para agregar… | hay que tocar | por qué |
|---|---|---|
| **un enemigo** | `hitbox.js`, `render/world.js`, `collision.js`, `spawn.js`, `tuning.js` + hojas + `despiece.js` + strings = **7–8 archivos** | `o.type === '…'` aparece **85 veces** (collision 38, world 30, game 9) |
| **un modo de juego** | `MODES`/`quickRows`, `confirmMode`, el `else if` de `results`/`epilogue`/`dead`, `canPickMusic`, `inLobby` ×2, strings, menús | no hay un DESCRIPTOR de modo: cada regla es un `if (gameMode === …)` |
| **un estado/fase** | `update()` + `draw()` + `setState` + pausa + música + `inLobby` | no hay registro de fases |
| **un sonido con fallback** | copiar `if (!sfxOne('x')) beep(…)` | **33 copias** (pasada 17, arena 11) |
| **una opción persistida** | `OPT_ROWS` + clave `rasante_*` | **37 claves** ad hoc en localStorage + `saves.js` aparte, **sin versionado** — peligroso antes de Steam (cloud saves) |
| **un parámetro de prueba** | `location.search` en game.js | `?qa ?no3d ?scene ?pasada ?pulso ?caza ?persec ?mision ?lang` — 3 archivos distintos lo parsean |

### 1.4 Lo que está BIEN y hay que proteger

- **Las 4 convenciones** (stores estables, señales hacia arriba, `deps`, snapshot) — válidas; el
  problema es que no escalaron a registros.
- **`core/aero.js` ya es el integrador 3D compartido** (arena, pasada, persec lo usan): la
  duplicación de vuelo que temía NO existe. Bien hecho.
- **La capa de datos por sistema ya empezó** (`data/pasada.js`, `pulso.js`, `arena.js`,
  `despiece.js`, `cines.js`, `missions.js` con `climax`) — el patrón correcto, a extender.
- **La red de pruebas es de primera**: 88 tests unitarios, feeltest, `lint:state`, smoke
  (Electron + web) y **12 fixtures** de feature. **El refactor tiene red: se puede hacer.**
- `lint_state.js` demuestra que el repo acepta **lints textuales como custodios de
  convenciones** — el refactor suma tres más (capas, strings, señales).

### 1.5 Deuda y deriva

- **Legacy vivo**: `systems/momentum.js` + `render/momentum.js` + `three-world.js`
  (~1.300 líneas) como fallback `?no3d`; el nombre MOMENTUM sigue doble (`tempo.js`).
- **ARQUITECTURA.md desactualizado** en lo central (800 vs 3.382; 29 módulos vs ~60).
- `tuning.js` (696 líneas) mezcla perillas de todos los dominios con las del feel.

## 2. Principios del refactor

1. **Cero cambio de comportamiento** salvo lo marcado explícitamente. Cada fase: `npm run
   check` verde · `npm run feel` byte-idéntico al baseline · 12 fixtures verdes.
2. **Strangler**: lo nuevo convive con lo viejo y lo reemplaza por partes; nunca hay un
   commit donde el juego no anda.
3. **Cada regla nueva nace con su lint** (como `lint:state`): sin custodio, la deriva vuelve.
4. **Registros antes que cadenas**: todo `if` por tipo/estado/modo se vuelve una tabla.
5. **El núcleo es puro**: `core/` no importa canvas ni audio. Las constantes del mundo se
   separan del canvas.
6. **Fases chicas y mergeables** (1–3 días) — el proyecto tiene desarrollo activo en
   paralelo (§5).

## 3. Arquitectura objetivo

```
data/      contenido y perillas, por dominio, cero imports (como hoy, más completo)
core/      puro: stores, física, aero, señales, geometría del mundo (SIN canvas/audio)
systems/   comportamiento; devuelven señales; NUNCA importan render
render/    dibujo; leen STORES (no internals de sistemas)
phases/    NUEVO — una carpeta por estado: { enter, update, draw, exit, flags }
modes/     NUEVO — un descriptor por modo (data): flujo, clímax, vidas, música, menú
dev/       NUEVO — sondas, parámetros de URL, modo PRUEBAS; inerte en build de Steam
app/game.js  el ensamblador REAL: bucle, registro de fases/modos, cableado (~400 líneas)
```

Registros que nacen: **fases** (`phases/index.js`), **modos** (`modes/*.js`),
**entidades** (`data/entities.js`: hitbox, hp, spawn, render, despiece, muerte, strings),
**acciones de input** (`data/controls.js`), **cues de audio** (`data/sfx.js` + fallback),
**persistencia** (`core/persist.js` con esquema versionado), **parámetros/sondas**
(`dev/params.js`, `dev/probes.js`), **señales** (`core/signals.js`: constantes tipadas).

## 4. Las fases

| fase | objetivo | qué cambia | custodio | sesiones · modelo |
|---|---|---|---|---|
| **RF0 · La red** | Congelar la verdad antes de mover nada | Baseline guardado de `feel` y de los 12 fixtures; script `npm run fixtures` (todos en serie); **`lint:layers`** (grafo de imports: `core` no importa `systems/render`; `systems` no importa `render`; `data` no importa nada) arranca en modo REPORTE con la lista actual de violaciones como whitelist que solo puede achicarse; ARQUITECTURA gana una sección "estado real 18/8" | `lint:layers` | ½ · medio |
| **RF1 · La capa dev** | Sacar 350 líneas de sondas y todos los `location.search` de game.js | `dev/probes.js` (registro `probe('nombre', fn)`; los sistemas registran las suyas ahí, no en `window`), `dev/params.js` (único parser de URL: `qa, no3d, scene, pasada, pulso, caza, persec, mision, lang`), flag `DEV` — en build Steam las sondas quedan inertes salvo el modo PRUEBAS que las usa por registro | grep: `window.__` solo en `dev/` | ½–1 · medio |
| **RF2 · Mundo ≠ canvas** | Que 13 sistemas dejen de importar el canvas | `core/world-geom.js` (W, H, HOR, F, PZ, U — constantes puras); `render/ctx.js` queda solo canvas+primitivas y re-exporta para compatibilidad; `core/fx.js` y `core/input.js` dejan de importar audio (emiten señales/eventos — ver RF4) | `lint:layers` en modo ERROR para `core` y `systems` | 1 · medio |
| **RF3 · La máquina de fases** *(la grande)* | `update()`/`draw()` dejan de ser cadenas | `phases/<estado>.js` con `{ enter, update(dt), draw(), exit, lobby, pausable, music }`; `game.js` itera el registro. Se migra **por grupos**: (a) pantallas/menús (title, modeselect, quickmenu, campmenu, saves, options, mejoras, misiones, pruebas, cines), (b) vuelo (takeoff, play, relevo, dead), (c) clímax (arena, pasada, pulso, momentum), (d) narrativa (story, epilogue, results, victory, brief, upgrade). Cada grupo = un commit verde. Los 95 `S.state ===` bajan a los que son genuinamente cross-fase | `lint:phases` (ningún `S.state ===` fuera de `game.js`/`phases/`) | **2–3 · ALTO** (una sesión por grupo a–d, `game.js` reservado) |
| **RF4 · Señales y eventos** | Que collision/flight no sepan de audio, fx ni puntaje | `core/signals.js` (constantes: `OBJECTIVE, DEATH(cause)…` — fin de los strings sueltos) + `core/events.js` (emisor mínimo: `emit('destroyed', {o, by})`); **audio, fx, puntaje y estadísticas se vuelven LISTENERS**. `audio.cue('exHeavy')` con tabla de fallback en `data/sfx.js` elimina las 33 copias de `if (!sfxOne…) beep` | grep: `sfxOne(`/`beep(` solo en `systems/audio.js` y listeners | 1 · alto |
| **RF5 · Modos como data** | Agregar un modo = un descriptor | `modes/<modo>.js`: `{ id, menu, entry(), afterResults(), afterDeath(), climaxPolicy, lives, music, lobby }`. Las 27 comparaciones de `gameMode` y los `else if` de results/epilogue/dead se vuelven llamadas al descriptor. `inLobby` ×2 y `canPickMusic` salen del descriptor | grep: `gameMode ===` = 0 fuera de `modes/` | 1 · medio-alto |
| **RF6 · Entidades como registro** *(la de mayor retorno)* | Agregar un enemigo = 1 entrada + su arte | `data/entities.js`: por tipo `{ hitbox, hp, spawn: { terrenos, peso, altura }, move, render, despiece, death: 'death_x', pts }`. `collision.js`, `spawn.js`, `render/world.js`, `hitbox.js` pasan a ser genéricos leyendo el registro; los casos realmente especiales (cliff, barcaza) quedan como `special` explícitos. Se migra tipo por tipo (helo primero, el más complejo) | test unitario: todo tipo del registro tiene hitbox, render y muerte; `o.type ===` < 15 sitios | **2 · ALTO** (tipo por tipo) |
| **RF7 · Input y persistencia** | Rebinding, gamepad completo y saves seguros antes de Steam | `data/controls.js` (mapa acción→teclas/botones; `input.js` emite ACCIONES, no teclas; los 45 callbacks se vuelven un registro `onAction`); `core/persist.js` (único dueño de localStorage: esquema con **versión y migraciones**, las 37 claves pasan a un solo objeto `rasante.v2`, `saves.js` encima) | `lint:persist` (ningún `localStorage` fuera de `persist.js`) | 1 · medio |
| **RF8 · El render por capas** | `world.js` deja de ser monolito; los dos espacios de coordenadas, en un solo lugar | `render/world/{sea,land,sky,props,ship,clouds}.js`; `render/pipeline.js` (capas: mundo → entidades → fx → overlay de fase → HUD → pantallas, con los `ctx.scale(U)` en UN sitio); el render lee **stores**, no sistemas: lo que hoy lee de `squad/damage/chancha/tempo/fog` pasa por un `view` que cada sistema expone (snapshot, convención 4) | `lint:layers` ERROR para `render`→`systems` | 1–2 · alto |
| **RF9 · Legacy y verdad** | Cerrar deudas y que el mapa vuelva a ser cierto | `momentum.js`+`render/momentum.js`+`three-world.js` → `legacy/` aislado (o retiro, según §6); `tempo.js` → `momentum.js` (el nombre libre); `tuning.js` solo con el feel, el resto a su `data/<dominio>`; **ARQUITECTURA.md reescrito** sobre la arquitectura objetivo con los lints como verdad; `?no3d` decidido | doc + `check` | 1 · medio |

**Total: ~11–14 sesiones de IA** (calibrado con la velocidad medida del proyecto: LA
DESTRUCCIÓN D0–D5 o EL PULSO Q0–Q5 cerraron en UNA sesión cada uno). En calendario, con la
revisión de Matías entre fases como gate: **1–2 semanas** en serie, menos si RF4/RF7/RF8
corren en carriles paralelos (no comparten archivos). **La restricción real no es el
modelo: es el tiempo de revisión de Matías y las ventanas reservadas de `game.js` (RF3).**

**Modelo por fase**: *ALTO* para las tres estructurales de radio de daño grande (RF3 la
máquina de fases, RF6 entidades, RF8 render) y para RF4 (eventos); *medio* para las
mecánicas (RF0, RF1, RF2, RF7, RF9); RF5 medio-alto. Las fases ALTO se ejecutan de a un
grupo por sesión y con `game.js` reservado — el refactor, a diferencia de un feature,
toca todo a la vez y una sesión que se pasa de alcance es más cara de revertir.

## 4b. Versión 2 — el plan con ARENA y PASADA en CUARENTENA *(la que se ejecuta)*

**Qué queda pendiente, sin borrar** (decisión 18/8): `systems/arena.js`, `systems/pasada.js`,
`render/arena.js`, `render/pasada.js`, `systems/three-arena.js`, `systems/ship3d.js`,
`data/arena.js`, `data/pasada.js` (~4.200 líneas) siguen en el repo, **compilando y con sus
fixtures verdes**, pero fuera del menú y de todo flujo de campaña/ciclo. Se revisan a fondo
en otro momento; la hipótesis a explorar entonces es **incorporarlos como módulos de una
misión** (un tramo o un clímax opcional), y el registro de fases de RF3 es lo que lo vuelve
barato. El momentum legacy (`momentum.js`, `render/momentum.js`, `three-world.js`, ~1.300
líneas) sí se aísla en `legacy/` (solo era el fallback de esos clímax).

**Qué cambia en las fases:**

| fase | antes | versión 2 |
|---|---|---|
| **RF-A · La cuarentena** *(NUEVA, primera)* | — | ARENA y PASADA fuera del menú y de los flujos (`climax` de todas las misiones → `'pulso'`; MINUTOS SAGRADOS y PASADAS MORTALES ocultos por perilla); sus módulos ganan un encabezado `PENDIENTE — en cuarentena desde 18/8, ver PLAN_REFACTOR §4b`; `?pasada=`/`?arena` y los fixtures siguen andando (son la garantía de que no se pudren); el momentum legacy a `legacy/`; docs de ARENA/PASADA marcados pendientes (no archivados). **Sin borrar nada.** Custodio: `check` verde + fixtures de pasada/arena verdes. **½ · medio** |
| RF0 la red | igual | igual, baselines tomados DESPUÉS del hacha |
| RF1 capa dev | 114 sondas | igual (las de ARENA/PASADA también se registran en `dev/`) |
| RF2 mundo ≠ canvas | 13 sistemas | 12 (three-world se va a legacy); arena/pasada se migran igual, es mecánico |
| **RF3 máquina de fases** | 24 estados, 4 grupos, 2–3 sesiones ALTO | igual: 23 estados (sin `momentum`); el grupo (c) clímax = `pulso` + `cines` + **`arena`/`pasada` registradas como fases en cuarentena** (migración mínima, sin pulido) — **2–3 sesiones ALTO** |
| RF4 eventos | 33 fallbacks de audio | los 33 (pasada/arena incluidas, es un reemplazo mecánico) — **1 · alto** |
| RF5 modos | 6 modos | 6 descriptores (los dos en cuarentena con `menu: false`) — **1 · medio-alto** |
| RF6 entidades | igual | igual — **2 · ALTO** (sigue siendo la de mayor retorno para "meter cosas nuevas") |
| RF7 input/persist | igual | igual — 1 · medio |
| RF8 render por capas | incluía render/arena+pasada | `world.js` + pipeline; render/arena y pasada solo se adaptan al pipeline — **1–2 · alto** |
| RF9 legacy y verdad | aislar momentum, renombrar tempo | el legacy ya se aisló en RF-A: queda **renombrar `tempo.js` → `momentum.js`**, `tuning.js` por dominio y ARQUITECTURA reescrito (con la sección "pendientes en cuarentena") — ½ · medio |

**Total versión 2: ~11–12 sesiones de IA** (RF-A incluida). **Orden de arranque cuando se
pueda: RF-A → RF0 → RF1 → RF2 → RF3 → RF6 → RF4 → RF5 → RF7 → RF8 → RF9.** (RF6 antes que
RF4/RF5 porque lo próximo son cosas nuevas en el pasillo: enemigos, mecánicas — el registro
de entidades es el que más las abarata.)

**RF-A no tiene condición previa**: como no borra nada, se puede hacer hoy.

## 5. Convivir con el desarrollo activo *(tres sesiones implementan en paralelo HOY)*

- **Carriles por archivo**: cada fase declara sus archivos "en obra"; las sesiones de
  features evitan esos archivos mientras la fase está abierta (o rebasan al cierre).
- **RF3 pide una ventana**: migrar `update()`/`draw()` con otros tocando `game.js` es
  pisarse seguro. Se hace por grupo (a–d), cada grupo en 1 día, y **ese día `game.js` es
  de una sola sesión**.
- **Todo lo demás convive**: RF1, RF4, RF6, RF7, RF8 tocan archivos que las features
  actuales tocan poco (o se hacen tipo por tipo).
- **Regla para features nuevas desde RF0**: lo nuevo nace en el patrón nuevo (fase en
  `phases/`, datos en `data/<dominio>`, sondas en `dev/`) aunque lo viejo aún no migró.
  Así el refactor no corre detrás del crecimiento.

### 5b. ¿Esperar a terminar un desarrollo o intercalar? *(pregunta del 18/8)*

**Intercalar, con una condición y una distinción.**

- **La condición: árbol limpio al entrar y al salir de cada fase.** Los features en curso se
  commitean antes de arrancar una fase de refactor, la fase corre sobre un árbol limpio y
  se commitea sola. Sin esto, un `feel` que cambia o un fixture que cae no se sabe de quién
  es — y el refactor vive de poder atribuir cada diferencia. No hace falta TERMINAR el
  desarrollo: hace falta un punto de corte commiteado.
- **La distinción: fases quirúrgicas vs estructurales.**

| tipo | fases | cómo se intercalan |
|---|---|---|
| **Quirúrgicas** (pocos archivos, mecánicas, ½–1 sesión) | RF-A, RF0, RF1, RF2, RF7, RF9 | **entre features, cuando sea** — cualquier tarde con el árbol limpio |
| **Estructurales** (tocan `game.js`, `collision/spawn/world` o el pipeline de render) | **RF3, RF6, RF8, RF4** | **ventana de 1 día por grupo** sin sesiones de features en sus archivos. Conviene hacerlas ANTES de la próxima tanda de estados/enemigos nuevos: cada feature que nace en el patrón viejo agranda la migración |

**Calendario sugerido:** ahora, entre features → RF-A + RF0 (media sesión), después RF1 y
RF2 cuando haya huecos. En la próxima pausa natural (antes de la BARRA o de enemigos
nuevos) → la ventana de RF3; antes de agregar enemigos → RF6. El resto, intercalado.

## 6. Decisiones de Matías *(con el default que toma el plan si no hay respuesta)*

1. **¿Fallback sin WebGL (`?no3d`, el momentum viejo): aislar o retirar?** Default: aislar
   en `legacy/` en RF9 y retirar cuando el rescate de la PASADA cierre su gate.
2. **¿Ventana de congelamiento para RF3?** ¿Se puede reservar `game.js` 4 días (uno por
   grupo) o hay que convivir sí o sí? Default: 4 ventanas de 1 día, avisadas.
3. **¿Plataformas próximas?** ¿Steam Deck / gamepad es prioridad (sube RF7)? ¿La web
   sigue importando? Default: Electron + gamepad sí; web se mantiene verde sin priorizar.
4. **¿Tipado?** TypeScript es una migración aparte; `// @ts-check` + JSDoc en `core/` y
   `data/` (los contratos) es barato y atrapa mucho. Default: JSDoc + `@ts-check` solo ahí.
5. **¿Tests nuevos?** Default: sí, pero solo sobre lo que el refactor CREA (registros,
   señales, persist, lints) — no retro-testear sistemas que los fixtures ya cubren.
6. **¿Las sondas viajan al build de Steam?** Default: quedan (el modo PRUEBAS las usa)
   pero inertes fuera de PRUEBAS/`DEV`.
7. **¿Orden de RF4–RF8?** Default: RF6 (entidades) antes que RF5 si lo próximo son
   enemigos; RF5 antes si lo próximo son modos.

## 7. Métricas de éxito *(se miden al cerrar RF9)*

| métrica | hoy | objetivo |
|---|---|---|
| `game.js` | 3.382 líneas | **< 500** |
| `S.state ===` fuera de fases | 95 | **< 10** |
| `gameMode ===` | 27 | **0** fuera de `modes/` |
| archivos para agregar un enemigo | 7–8 | **2** (entrada en `entities.js` + arte) |
| archivos para agregar un modo | 8+ | **2** (descriptor + fase) |
| violaciones de capas | 34 | **0** (lint en ERROR) |
| copias de fallback de audio | 33 | **0** |
| claves sueltas de localStorage | 37 | **1** objeto versionado |
| `window.__` fuera de `dev/` | 114 | **0** |
| `npm run feel` | baseline | **byte-idéntico** |

## 8. Qué NO hacer

1. **No reescribir**: strangler, por partes, siempre verde.
2. **No migrar de motor ni a TypeScript** dentro de este plan.
3. **No colar cambios de comportamiento** "ya que estamos": todo lo que cambie el juego
   va en su propio plan, no en el refactor.
4. **No registros sin lint**: cada regla nueva nace con su custodio o no nace.
5. **No tocar `core/physics.js` ni `aero.js`** salvo moverlos: el feel es sagrado.
6. **No abstraer por anticipación**: los registros se diseñan con los casos que EXISTEN
   (24 estados, 6 modos, ~20 tipos), no con los imaginarios.

## 9. Divergencias *(completar durante la ejecución — con el baseline de RF0)*

### 1. `legacy/` NO era legacy: tiene código vivo, y bastante *(RF-A)*

§4b dice que el momentum legacy «solo era el fallback de esos clímax». **Medido al mudarlo, no es
así**, y por eso los tres archivos llevan arriba una lista de qué parte suya sigue viva:

| archivo | lo que sigue VIVO | quién lo usa |
|---|---|---|
| `legacy/momentum.js` | `readyToEnter`/`enter` | `systems/flight.js:137` — es el **último eslabón de la cadena de clímax**: el fallback real sin 3D. El estado `momentum` se alcanza |
| | `drift()` | `render/world.js`, en **tres caminos calientes** (la distancia visual) |
| | `phases()`/`phase()` | `render/world.js`, la aproximación al buque |
| `legacy/momentum_render.js` | `drawCockpit`, `salpicar`, `MIRA_PLENA`, `V_VISOR`, `COCKPIT_FILL` | **la cabina**, que usa `render/pulso.js` — y EL PULSO es hoy el único clímax fuera de cuarentena |
| | `drawBargeHull`, `drawBargeBow` | `render/world.js` dibuja el buque del pasillo con esto |
| `legacy/three-world.js` | `has3D`, `useRenderer` | el arranque **compartido** de three.js: `systems/three-arena.js` depende de él |
| | `isSea()`, `frame()`, `view()` | el **mar 3D del vuelo normal**, que no es el clímax viejo |

**Decisión:** la mudanza se hizo igual —es mecánica, no cambia comportamiento y es reversible— pero
**la carpeta miente hasta que RF2/RF8 separen esas partes**. Se compensó con tres cosas: el
encabezado de cada archivo dice qué suyo sigue vivo, las **7 dependencias vivas quedaron escritas en
el techo del lint de capas** (`tools/baseline/layers_whitelist.json`, que solo puede achicarse), y
esta entrada. **Fila propuesta para RF2/RF8**: sacar la cabina a `render/cockpit.js`, `drift()` a un
store y el bootstrap de three a `systems/three.js`; recién ahí `legacy/` es de verdad legacy.

*Efecto medido en §7*: el movimiento **agregó 7 violaciones de capa** (33 → 40). Es deuda declarada,
no escondida: sin la mudanza serían 33 pero el legacy seguiría mezclado con el juego vivo.

### 2. Corrección al diagnóstico: el estado `momentum` NO está muerto *(RF-A)*

§1.5 lo llama «legacy vivo» y es exacto, pero conviene ser explícito porque es fácil leerlo como
código muerto: `systems/flight.js` lo entra cuando `arena.available()` da false (sin 3D). Cualquier
fase que lo trate como inalcanzable se va a equivocar.

### 3. El smoke entraba al ARENA y a la PASADA **contando flechas del menú** *(RF-A)*

La cuarentena les sacó la fila de JUEGO RÁPIDO y el smoke se rompió — la trampa que el propio
ARQUITECTURA ya avisaba («agregar un modo corre las filas y rompe la navegación de `smoke.js`»).
Se reencaminó a las puertas que la cuarentena mantiene vivas a propósito: `__prb('arena')` y
`?pasada=0&pasillo`. **De paso se fue la fragilidad**: la prueba ya no depende del ORDEN del menú,
que es lo que la había roto antes al entrar PERSECUCIÓN.

**Una afirmación se mudó, y no se perdió**: el smoke medía «PASADAS MORTALES arranca en la
aproximación (p > 0.3)», que es una propiedad **del modo** en cuarentena, no de la fase — la sonda
arranca desde la pista. Esa medición ya la hace a fondo `npm run pasada` (el telón, el cruce al
clímax, el fundido). El smoke se quedó con lo que ninguna otra prueba toca: que el **pasillo**
desemboque en la fase pasada.

### 4. `feel` byte-idéntico exige filtrar el ruido de node *(RF0)*

El warning `MODULE_TYPELESS_PACKAGE_JSON` trae **el PID**, que cambia en cada corrida: comparar la
salida cruda daba distinto siempre y el juez del refactor no servía. `tools/fixtures.js` filtra esas
líneas antes de guardar y comparar. Sin esto, el criterio «byte-idéntico» era inaplicable.

### 5. El baseline de los fixtures se guarda NORMALIZADO, no crudo *(RF0)*

`feel` es determinista y se guarda tal cual. Los fixtures **vuelan de verdad, con azar en la
siembra**: su texto crudo cambia en cada corrida, así que un baseline literal «fallaría» siempre y
enseñaría a ignorarlo. Se guarda la **forma** —las mismas comprobaciones, en el mismo orden, con el
mismo veredicto, con los números enmascarados—, que es lo que un refactor no puede cambiar. Los
números exactos los juzga cada fixture, que para eso tiene sus propios umbrales.

### 6. Números del §1 re-medidos: algunos habían quedado viejos *(RF0)*

Contados el 18/8: **88 módulos** (§1.1 decía ~60), **26.434 líneas**, `S.state ===` **101** (decía
95), `gameMode ===` **37** (decía 27), `window.__` **124** (decía 114), `o.type ===` **138** (decía
85). El sentido del diagnóstico no cambia —al contrario, la deriva es peor— pero las métricas de §7
se miden contra estos, que están en ARQUITECTURA §"Estado real".
