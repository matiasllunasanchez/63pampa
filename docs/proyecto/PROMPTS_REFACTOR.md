# PROMPTS DEL REFACTOR — uno por paso del calendario (PLAN_REFACTOR §4b + §5b)

> Cada sesión nueva = **ENCABEZADO COMÚN + el bloque del paso**. Modelo/esfuerzo indicado
> en cada bloque. Regla de oro del calendario (§5b): **árbol limpio al entrar y al salir**
> — commitear los features antes de arrancar, la fase se commitea sola.

## ENCABEZADO COMÚN *(pegar arriba de todos)*

> Vas a ejecutar UNA fase del refactor de RASANTE (la indico abajo). Tu documento de trabajo es `docs/proyecto/PLAN_REFACTOR.md`: leé §1 (diagnóstico medido), §2 (principios), §3 (arquitectura objetivo) y **§4b** (la versión que se ejecuta: ARENA y PASADA quedan EN CUARENTENA, no se borran). Leé antes `docs/ARQUITECTURA.md` (manda sobre el plan; divergencias al §9 del plan) y las trampas del repo en `docs/sistemas/SPEC_AGUA_OLAS.md` §1.
>
> Reglas no negociables: (1) **cero cambio de comportamiento** — al cerrar, `npm run check` verde, `npm run feel` byte-idéntico al baseline de §9 y los fixtures verdes; si algo cambia de comportamiento, revertilo y anotalo; (2) **strangler**: nunca un commit donde el juego no anda; (3) **cada regla nueva nace con su lint** o la fase no cierra; (4) **alcance exacto**: solo la fila de tu fase — lo demás se anota en §9, no se hace; (5) `core/physics.js` y `core/aero.js` no se tocan salvo moverlos; los módulos en cuarentena (arena, pasada) se migran mecánicamente cuando la fase lo pide, sin pulirlos; (6) stores se mutan, señales hacia arriba, strings por `strings.js`, `npm run build:game` antes de probar en Electron.
>
> Al terminar reportá: archivos tocados, el lint nuevo y qué custodia, las métricas de §7 que movió la fase (antes → después) y las divergencias anotadas. Frená ahí: la siguiente fase es otra sesión.

---

## PASO 1 · RF-A + RF0 — la cuarentena y la red *(½ + ½ sesión · Opus MEDIO)*

> Fase: **RF-A (cuarentena) y después RF0 (la red), en esa orden.**
> RF-A: ARENA y PASADA fuera del menú y de los flujos SIN borrar nada — `climax: 'pulso'` en todas las misiones con buque; MINUTOS SAGRADOS y PASADAS MORTALES ocultos por perilla en data (no eliminados); encabezado `PENDIENTE — en cuarentena desde 18/8, ver PLAN_REFACTOR §4b` en `systems/arena.js`, `systems/pasada.js`, `render/arena.js`, `render/pasada.js`, `three-arena.js`, `ship3d.js`; `?pasada=`/`?arena` y `npm run pasada` tienen que seguir andando; el momentum legacy (`systems/momentum.js`, `render/momentum.js`, `systems/three-world.js`) se mueve a `src/legacy/` ajustando imports, sin cambiar comportamiento (`?no3d` sigue igual).
> RF0: guardar el baseline de `npm run feel` y de cada fixture en `tools/baseline/` (texto, commiteado); crear `npm run fixtures` que corre todos en serie y falla si uno falla; crear `tools/lint_layers.js` (`npm run lint:layers`) que lee el grafo de imports de `src/` y reporta las violaciones `core→systems/render`, `systems→render`, `data→*`, `render→systems` — **en modo REPORTE** con la lista actual como whitelist que solo puede achicarse (falla si aparece una violación nueva); sumar a `check`; agregar a `docs/ARQUITECTURA.md` una sección "Estado real (18/8)" con los números de PLAN_REFACTOR §1.
> Cierre: `check` verde con `lint:layers` adentro; `fixtures` verde; baseline commiteado.

## PASO 2 · RF1 — la capa dev *(½–1 sesión · Opus MEDIO)*

> Fase: **RF1.** Crear `src/dev/probes.js` (registro `probe(nombre, fn)` que expone `window.__<nombre>` solo si `DEV`) y `src/dev/params.js` (ÚNICO parser de `location.search`: `qa no3d scene pasada pulso caza persec mision lang` — exporta valores ya tipados). Migrar las 114 sondas `window.__*` a `probe(...)` en el módulo que las posee (las de `game.js` van a `dev/probes-game.js` o al sistema dueño) y los tres sitios que parsean la URL a `params`. `DEV` = true en `npm start` y en los fixtures, inerte en `build:web`/`dist` salvo para el modo PRUEBAS, que usa el registro por import. Custodio: un grep en `check` que falla si hay `window.__` o `location.search` fuera de `src/dev/` (excepción documentada: `core/i18n.js` solo si no se puede mover el `?lang`).
> Cierre: todos los fixtures y el modo PRUEBAS andan igual; `game.js` baja ~350 líneas.

## PASO 3 · RF2 — mundo ≠ canvas *(1 sesión · Opus MEDIO)*

> Fase: **RF2.** Crear `src/core/world-geom.js` con las constantes puras del mundo (`W H HOR F PZ U DW DH` y lo que sea geometría, no canvas); `render/ctx.js` las importa y re-exporta para compatibilidad, y queda solo canvas + primitivas. Los sistemas que importan `render/ctx.js` pasan a importar `core/world-geom.js`. `core/fx.js` y `core/input.js` dejan de importar `systems/audio.js`: reciben el audio por un hook inyectado desde `game.js` (`setAudio({beep, boom, sfx})`) — mecánico, sin cambiar qué suena. `lint:layers` pasa a **ERROR** para `core→*` y `systems→render`.
> Cierre: `lint:layers` en error para esas dos reglas, `check` verde, cero cambio visual (capturas A/B de menú, vuelo y PULSO).

## PASO 4 · RF3 — la máquina de fases *(2–3 sesiones, UNA POR GRUPO · Opus ALTO)*

> Fase: **RF3, grupo {a|b|c|d}** — esta sesión hace SOLO ese grupo. Esta fase es estructural: `game.js` es tuyo en esta sesión, nadie más lo toca; cerrá el grupo verde antes de parar.
> Crear (si no existe) `src/phases/index.js`: registro `{ [estado]: { enter, update(dt), draw(), exit, lobby, pausable, music } }`; `game.js` itera el registro en `update()`/`draw()` para los estados ya migrados y mantiene la cadena vieja para los demás (strangler). Migrar los estados del grupo a `src/phases/<estado>.js` moviendo el código TAL CUAL (sin reescribir lógica):
> · grupo **a** pantallas/menús: `title modeselect quickmenu campmenu saves options mejoras misiones pruebas cines`
> · grupo **b** vuelo: `takeoff play relevo dead`
> · grupo **c** clímax: `pulso` (+ `arena` y `pasada` registradas como fases EN CUARENTENA: migración mínima, sin pulir)
> · grupo **d** narrativa: `story epilogue results victory brief upgrade`
> Con el último grupo: eliminar la cadena vieja, y `lint:phases` (`S.state ===` solo en `game.js` y `src/phases/`) en `check`.
> Cierre del grupo: `check` + `fixtures` verdes, `feel` idéntico, `DEBUG_STATE=1` muestra las mismas transiciones que antes en un recorrido menú → misión → clímax → resultados.

## PASO 5 · RF6 — entidades como registro *(2 sesiones, TIPO POR TIPO · Opus ALTO)*

> Fase: **RF6, sesión {1|2}.** Estructural: `collision.js`, `spawn.js`, `render/world.js` y `core/hitbox.js` son tuyos en esta sesión.
> Crear `src/data/entities.js`: por tipo `{ hitbox, hp, spawn: { terrenos, peso, altura }, move, render, despiece, death, pts }` con los valores EXACTOS que hoy están dispersos (copiar, no recalibrar). Hacer genéricos `collision.js`, `spawn.js`, `world.js` y `hitbox.js` leyendo el registro; los casos realmente especiales (`cliff`, `barcaza`, `chunk`, `airboom`) quedan como `special` explícito. Migrar **tipo por tipo** empezando por `helo` (el más complejo), después `jet aa aatruck radar tent bldg depot tower tree poles flag balloon birds lcu mast fuel trench`; sesión 1 = la infraestructura + helo + jet + aa; sesión 2 = el resto. Test unitario en `tools/unit.js`: todo tipo del registro tiene hitbox, render, muerte y spawn válidos. Custodio: `o.type ===` < 15 sitios en `src/` (grep en `check`).
> Cierre: `fixtures` verdes (romper, caza, tramos, misiones sobre todo), `feel` idéntico, capturas A/B de m9 y m13.

## PASO 6 · RF4 — señales y eventos *(1 sesión · Opus ALTO)*

> Fase: **RF4.** Crear `src/core/signals.js` (constantes: `OBJECTIVE`, `DEATH(cause)`, `CINE`, …) y reemplazar los strings sueltos de señal en sistemas y `game.js`. Crear `src/core/events.js` (emisor mínimo: `on/emit`, síncrono, sin dependencias) y convertir a LISTENERS lo que hoy `collision.js`/`flight.js`/`pasada.js` hacen inline: audio, fx, puntaje y estadísticas se suscriben a `destroyed`, `hit`, `graze`, `death`, `objective`. Crear `audio.cue(id)` con la tabla de fallback en `data/sfx.js` y reemplazar las 33 copias de `if (!sfxOne(x)) beep(...)`. Custodio: grep en `check` — `sfxOne(`/`beep(`/`boom(` solo en `systems/audio.js` y en los listeners declarados.
> Cierre: `check` + `fixtures` verdes, `feel` idéntico, y una grabación corta de sonido A/B del mismo recorrido (los cues suenan igual).

## PASO 7 · RF5 — modos como data *(1 sesión · Opus MEDIO-ALTO)*

> Fase: **RF5.** Crear `src/modes/<modo>.js` para `campaign cycle survival persec` y los dos en cuarentena (`arena pasadas` con `menu: false`): `{ id, menu, entry(), afterResults(), afterDeath(), climaxPolicy, lives, music, lobby }`. Reemplazar las 27 comparaciones de `gameMode` y los `else if` de results/epilogue/dead por llamadas al descriptor; `inLobby` (los dos) y `canPickMusic` salen del descriptor. Custodio: grep en `check` — `gameMode ===` = 0 fuera de `src/modes/`.
> Cierre: los 4 modos visibles encadenan igual que antes (`DEBUG_STATE=1`, recorrido por cada uno), `fixtures` verdes.

## PASO 8 · RF7 — input y persistencia *(1 sesión · Opus MEDIO)*

> Fase: **RF7.** Crear `src/data/controls.js` (mapa acción → teclas/botones de pad, con los bindings EXACTOS de hoy) y hacer que `core/input.js` emita ACCIONES por ese mapa (los 45 callbacks `a.*` pasan a un registro `onAction(nombre, fn)` que `game.js`/las fases llenan). Crear `src/core/persist.js`: único dueño de `localStorage`, un objeto `rasante.v2` con versión y migración automática desde las 37 claves `rasante_*` actuales (leerlas una vez, escribir el objeto, no borrar las viejas en esta fase); `saves.js` y `OPT_ROWS` pasan por `persist`. Custodio: `lint:persist` (ningún `localStorage` fuera de `core/persist.js`) en `check`.
> Cierre: opciones y partidas guardadas de una instalación existente se conservan (probar con un `localStorage` viejo real), gamepad y teclado responden igual, `fixtures` verdes.

## PASO 9 · RF8 — el render por capas *(1–2 sesiones · Opus ALTO)*

> Fase: **RF8.** Estructural: `render/` es tuyo en esta sesión. Partir `render/world.js` en `render/world/{sea,land,sky,props,ship,clouds}.js` moviendo código tal cual; crear `render/pipeline.js` con las capas (mundo → entidades → fx → overlay de fase → HUD → pantallas) y los `ctx.scale(U)` de los dos espacios de coordenadas en UN solo sitio; el render deja de importar sistemas: cada sistema que hoy lee el render (`squad damage chancha tempo fog persec caza`) expone un `view()`/snapshot y el render lo recibe. `render/arena.js` y `render/pasada.js` solo se adaptan al pipeline (cuarentena). `lint:layers` pasa a **ERROR** para `render→systems`.
> Cierre: capturas A/B píxel-idénticas (o con diferencia explicada) en menú, vuelo, m9, m13, PULSO y PRUEBAS; `check` verde con `lint:layers` todo en error.

## PASO 10 · RF9 — la verdad *(½ sesión · Opus MEDIO)*

> Fase: **RF9.** Renombrar `systems/tempo.js` → `systems/momentum.js` (el nombre queda libre porque el viejo ya vive en `legacy/`), ajustando imports y docs. Repartir `data/tuning.js` por dominio (`data/<dominio>.js`, dejando en `tuning.js` solo las perillas del feel del vuelo). **Reescribir `docs/ARQUITECTURA.md`** sobre la arquitectura real post-refactor: capas, registros (fases, modos, entidades, acciones, persist, dev), los lints como verdad, una sección "Pendientes en cuarentena" para ARENA/PASADA, y la tabla "¿dónde voy?" al día. Actualizar `docs/README.md`.
> Cierre: `check` verde; las métricas de PLAN_REFACTOR §7 medidas y anotadas en §9 con su antes/después.
