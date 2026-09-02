# PLAN — los 4 pendientes de motor

`G-02` barks · `G-04` daño acumulado · `G-08` la radio del objetivo · `G-09` orden de posmisión.

Pensado para ejecutar con varias sesiones en paralelo. **El dato que manda todo el plan**: tres de
los cuatro terminan tocando `src/game.js`, que es el orquestador de 4.147 líneas. Si tres sesiones
lo editan a la vez, el merge es peor que el trabajo.

Por eso cada tarea se parte en **NÚCLEO** (archivos propios, paralelizable) y **CABLEADO** (game.js,
serial y corto).

## Reparto de archivos

| | núcleo — se puede en paralelo | cableado — serial |
| --- | --- | --- |
| **G-02** | `data/barks.js` *(nuevo)* · `render/bark.js` *(nuevo)* | `game.js`: el disparador |
| **G-04** | `core/desgaste.js` *(nuevo)* · `render/plane.js` | `game.js`: contador + `saves` |
| **G-08** | `data/story.js` · `data/missions.js` | — **ninguno** |
| **G-09** | `render/screens.js` | `game.js`: la cadena de estados |

**`G-08` no toca `game.js` y no colisiona con nadie: puede correr solo, desde el minuto cero y hasta
el final.**

---

# ✅ FASE 0 — el contrato — **HECHA**

Ya está commiteada. Las cuatro vías pueden arrancar.

| | |
| --- | --- |
| `src/core/desgaste.js` | store de identidad estable. `tickDesgaste(n)` · `misionCumplida()` · `nivel()` → 0..1 · `resetDesgaste()` |
| `src/data/barks.js` | `BARKS` con `HEAVY MACHINE GUN`, `barkDe(id)`, `barksVivos(n, usados)`. **La curva del tono vive en el campo `hasta`**, no en el código |
| `src/render/bark.js` | `drawBark(txt, p)` y `BARK_S` |
| `src/render/screens.js` | `interstitial(txt, p, t)` — negro pleno, mismo grano y scanline que la pantalla de historia, sin marco |
| `src/game.js` | el bloque `// ---- GANCHOS DE MOTOR ----` con los tres puntos de cableado documentados. **Sin llamar a nada todavía**: la fase 0 fija la costura, no el cableado |
| `tools/unit.js` | **tres tests de contrato**. Si una vía cambia una firma sobre la marcha, falla acá y no en el merge |

Uno de esos tests ya hace trabajo: verifica que **ningún bark pueda sonar en M14**, que es la regla
§9c que hace que el jugador sienta que el juego se quedó callado sin poder nombrarlo.

<details><summary>Lo que decía el plan original</summary>

# FASE 0 — el contrato *(1 sesión, 20 min, bloqueante)*

Antes de abrir nada en paralelo hay que dejar clavadas las costuras, porque son lo único compartido.
Sale un solo commit que **no cambia comportamiento**:

1. En `game.js`, un único bloque `// ---- GANCHOS DE MOTOR ----` con cuatro llamadas no-op y su
   import. Cada vía después sólo rellena *su* función, en *su* archivo.
2. La firma de cada gancho, cerrada acá y no negociable después:

```js
barks.tick(dt, { arma, sostenido, mision, estado })   // devuelve id de bark o null
desgaste.tick(run, { impactos, mision })              // acumula; no dibuja
desgaste.nivel()                                      // 0..1, lo lee render/plane.js
pantallas.interstitial(txt, seg)                      // negro + texto, para G-09
```

3. `tools/unit.js`: un test por gancho que sólo verifica que existe y que el no-op no rompe nada.

Sin esto, dos sesiones inventan dos formas de colgarse del mismo lugar.

</details>

---

# FASE 1 — cuatro vías en paralelo *(sin colisión de archivos)*

## VÍA A · G-08 — la radio del objetivo
**Toca**: `data/story.js`, `data/missions.js`. **No toca `game.js`.** Es la más independiente y la
más larga en volumen, así que conviene arrancarla primero y dejarla corriendo.

Ya está hecha la mitad: las 14 tarjetas llevan `OBJETIVO · …`. Falta la segunda capa, que es Cóndor
diciéndolo por radio en el primer tramo, para el que ya está volando.

1. Una escena `tipo: 'VUELO'` por misión, `M<nn>_OBJETIVO`, de **una a tres líneas**, con Cóndor
   dando el objetivo como parte real y no como tutorial. El texto sale de la línea `OBJETIVO ·` de
   cada tarjeta, reescrito a voz de radio.
2. Colgarla del **primer tramo** de cada misión. Las que no tienen `tramos:` hay que dárselos, con
   el mismo criterio que se usó en `m1`: `{ hasta: 0.10, obstacles: 0, caza: 0, bombs: 0, charla: … }`
   y `{ hasta: 1 }` después.
3. **Regla dura**: cada escena tiene que entrar en `CHV_MAX_S` (25 s). La cuenta es
   `max(1.6, caracteres/12) + hold` por línea. Verificar las 14 antes de commitear.
4. Cuidado con `m4` y `m5`: ya tienen tramos del Narwal. El objetivo va **antes**, en un tramo nuevo
   al principio.

**Verifica con**: `npm run unit` y una pasada por el modo DIÁLOGOS del selector, que desde el
arreglo de `T-11` ya lista las charlas.

## VÍA B · G-04 — el daño acumulado
**Toca**: `core/desgaste.js` *(nuevo)*, `render/plane.js`. **No toca `game.js` en esta fase.**

⚠ **Lo primero que hay que entender**: los sprites del avión están **horneados**
(`tools/bake_planes.html`, `bake_planes_run.js`, y las MARCAS de `data/skins.js`). Hornear una
variante por nivel de daño multiplica los assets y el juego ya viene grande. **Va como overlay
dibujado encima del sprite**, no como sprite nuevo.

1. `core/desgaste.js`: store de identidad estable (mutar, nunca reasignar — `npm run lint:state`).
   Guarda `impactos` por campaña y expone `nivel()` en 0..1.
2. `render/plane.js`, dentro de `drawPlane`: después del sprite, una capa de parches. Tres o cuatro
   manchas de pintura que no coincide, remaches, un panel más claro. **Deterministas por semilla**,
   no aleatorias por cuadro, o el avión titila.
3. Escalar con `nivel()`: a 0 no se dibuja nada; a 1, el avión es un animal remendado.
4. **Ley 4 de §9d: NADIE LO MENCIONA.** No hay línea de diálogo, no hay cartel, no hay contador en
   el HUD. Si aparece un texto explicándolo, está mal hecho.

**Verifica con**: `npm run cine` y `npm run maniobras`, que son las fixtures que miran el render, y
una captura a nivel 0 y a nivel 1.

## VÍA C · G-02 — los barks
**Toca**: `data/barks.js` *(nuevo)*, `render/bark.js` *(nuevo)*. **No toca `game.js` en esta fase.**

1. `data/barks.js`: la tabla. Cada entrada `{ id, texto, cuando, mision }`. **El banco se achica
   solo**: completo hasta M8, reducido en M9–M13, y **vacío en M14** (§9c). Esa curva va en la data,
   no en el código.
2. `render/bark.js`: el cartel. Letras grandes de arcade, centrado, con entrada y salida.
   **Regla número uno del juego: tiene que funcionar sin voz.** Es un cartel, no un locutor.
3. El primero es `HEAVY MACHINE GUN`, la primera vez que se sostiene la metralleta.
4. Reglas que van codificadas y no en un comentario: **una sola vez por campaña** (no por misión),
   **nunca sobre una línea de historia**, nunca sobre una muerte.

⚠ **Hay decisión de autor pendiente**: la lista de barks más allá del primero no existe. Esta vía
puede dejar el sistema listo con **un solo bark** y la tabla preparada; escribir el resto es guion.

**Verifica con**: `npm run smoke` — que la consola quede limpia — y una corrida sosteniendo el arma.

## VÍA D · G-09 — la pantalla negra
**Toca**: `render/screens.js`. **No toca `game.js` en esta fase.**

Sólo la pieza visual: `pantallas.interstitial(txt, seg)` — negro pleno, el texto centrado con la
tipografía de las tarjetas, y un fundido corto a cada lado. Es lo que va a usar el cableado para el
título de misión y para el **«DÍA SIGUIENTE»**.

**Verifica con**: `npm run cine`.

---

# FASE 2 — cableado, en `game.js`, **de a uno**

Las tres vías vuelven acá. Orden fijo, y cada una es un commit:

### 2.1 · G-09 primero — porque reordena la máquina de estados
Hoy la cadena es `results → epilogue → upgrade → advanceCampaign` (game.js ~2589-2610).
Tiene que quedar:

```
results → upgrade → epilogue → «DÍA SIGUIENTE» → brief
```

- La **pantalla de mejoras va inmediatamente después de la misión**, antes de la carta de Mateo.
  Hoy va después de todo el epílogo, y por eso la recompensa llega tarde.
- El **título de misión como negro unos segundos** antes de la escena con imagen.
- **«DÍA SIGUIENTE»** entre misiones.

⚠ Cuidado con `S.test` y con los modos `arena`, `pasadas` y `ciclo`: los cuatro pasan por el mismo
bloque y ninguno debe ver el interstitial de campaña.

### 2.2 · G-04 — el contador
Colgar `desgaste.tick()` de donde ya se cuentan los impactos, y **sumar el acumulado al payload de
`systems/saves.js`**: si no se guarda, el avión se cura solo al cargar una partida.

### 2.3 · G-02 — el disparador
Colgar `barks.tick()` del bucle de vuelo. La condición de «sostener la metralleta X segundos» sale
de `systems/flight.js`, que ya lleva el estado del arma.

---

# FASE 3 — cierre *(1 sesión)*

1. `npm run check` completo.
2. Jugar M1 → M3 de punta a punta: es el tramo que toca las cuatro cosas a la vez — el objetivo por
   radio, el orden de posmisión, el primer bark y el avión todavía limpio.
3. Mover los 4 ítems de `PENDIENTES_GUION.md` a `RESUELTOS_GUION.md`.

---

# Resumen de paralelismo

```
FASE 0  ██                        contrato (bloqueante, 1 sesión)
FASE 1  ████████████████████      A · B · C · D en paralelo
FASE 2      ████                  2.1 → 2.2 → 2.3, serial en game.js
FASE 3          ██                verificación
```

- **Máximo paralelismo real: 4 vías**, y sólo en la fase 1.
- **La vía A (G-08) se puede lanzar antes que la fase 0** y no molesta a nadie: no toca `game.js`.
- Las vías B, C y D **no pueden saltearse la fase 0**: sin las firmas cerradas, el cableado de la
  fase 2 se convierte en tres refactors.
- Si hay que elegir una sola: **G-09**, que es la queja del playtest y la que más se nota jugando.

---

# PROMPTS DE EJECUCIÓN

Para pegar tal cual en una sesión nueva. Cada uno es **autocontenido**: no supone que la sesión haya
visto esta conversación.

## Contexto común — va al principio de todos

> Trabajás en **RASANTE**, un arcade 2D de vuelo rasante sobre Malvinas 1982. JS vanilla + Canvas 2D,
> sin framework, target Electron + Steam. **El límite de 16 MB del build web NO aplica: ignoralo.**
>
> Convenciones que no se negocian, están en `docs/ARQUITECTURA.md`:
> - Los stores son de **identidad estable**: se mutan, nunca se reasignan. Lo verifica `npm run lint:state`.
> - Los sistemas **nunca llaman hacia arriba**: devuelven señales y el orquestador (`src/game.js`) decide.
> - `src/data/` no importa nada del juego.
> - Espacios: mundo 480×270, diseño 320×180, `U = 1.5`, `SC = 2`, y `U × SC = 3` exacto.
>
> Antes de dar nada por terminado corré **`npm run check`** y que cierre en verde.
> Los comentarios del código están en castellano y explican **por qué**, no qué. Seguí ese registro.

---

## PROMPT · VÍA A — G-08, la radio del objetivo

> **Tarea**: que el jugador se entere de a qué va cada misión mientras vuela, no sólo leyendo la tarjeta.
>
> La mitad ya está: las 14 escenas `TARJETA` de `src/data/story.js` llevan una segunda línea
> `OBJETIVO · …`. Falta la segunda capa: **Cóndor diciéndolo por radio en el primer tramo**.
>
> 1. Escribí una escena `tipo: 'VUELO'` por misión en `src/data/story.js`, con id `M<nn>_OBJETIVO`
>    (dos dígitos: `M01_OBJETIVO`, `M04_OBJETIVO`…). **Una a tres líneas.** El texto sale de la línea
>    `OBJETIVO ·` de la tarjeta de esa misión, reescrito a **voz de radio militar real**, no a
>    tutorial. Mirá `M01_RITUAL` y `M04_NARWAL_A` como modelo de tono.
> 2. Colgala del **primer tramo** de esa misión en `src/data/missions.js`, con el campo `charla:`.
>    Las misiones sin `tramos:` necesitan uno: `{ hasta: 0.10, obstacles: 0, caza: 0, bombs: 0,
>    charla: 'M<nn>_OBJETIVO' }` y `{ hasta: 1 }` después. `obstacles: 0` no es opcional: una charla
>    en vuelo pide cero enemigos en pantalla.
> 3. **`m4` y `m5` ya tienen tramos del Narwal.** El objetivo va **antes**, en un tramo nuevo al principio.
> 4. **Regla dura**: cada escena tiene que entrar en `CHV_MAX_S` (25 s, en `src/data/tuning.js`).
>    La cuenta es `max(1.6, caracteres/12) + hold` por línea. Verificá las 14 con un script antes de
>    commitear; si una no entra, se parte en dos y se cuelga de dos tramos seguidos.
> 5. Los `id` de línea van de diez en diez y no se repiten jamás.
>
> **Archivos**: `src/data/story.js` y `src/data/missions.js`. **No toques `src/game.js`.**
> **Verificación**: `npm run check`, y que ninguna escena `VUELO` pase de 23 s.

---

## PROMPT · VÍA B — G-04, el daño acumulado

> **Tarea**: que el avión del jugador junte parches y remaches misión tras misión, y que **nadie lo
> mencione nunca**.
>
> Es la ley 4 de la sección 9d del guion (`docs/historia/GUION_3.md`): el daño se acumula y se ve, y
> no hay una sola línea de diálogo, cartel ni contador de HUD que lo señale. **Si aparece un texto
> explicándolo, está mal hecho.** Al final el jugador vuela un animal remendado que reconoce de
> memoria, y eso hace todo el trabajo solo.
>
> ⚠ **Los sprites del avión están horneados** (`tools/bake_planes.html`, `tools/bake_planes_run.js`,
> y las MARCAS de `src/data/skins.js`). **No hornees variantes por nivel de daño**: multiplica los
> assets. Va como **overlay dibujado encima del sprite**.
>
> 1. `src/core/desgaste.js` (nuevo): store de identidad estable. Acumula impactos por campaña y
>    expone `nivel()` en 0..1. No dibuja y no sabe que existe el render.
> 2. En `src/render/plane.js`, dentro de `drawPlane`: después del sprite, una capa de parches —
>    manchas de pintura que no coincide, remaches, un panel más claro. **Deterministas por semilla**,
>    nunca aleatorias por cuadro, o el avión titila.
> 3. Escalá con `nivel()`: a 0 no se dibuja nada; a 1 el avión está remendado entero.
>
> **Archivos**: `src/core/desgaste.js` y `src/render/plane.js`. **No toques `src/game.js`** — el
> contador y el guardado son otra fase.
> **Verificación**: `npm run check`, más `npm run cine` y `npm run maniobras`, que son las fixtures
> que miran el render. Sacá una captura a nivel 0 y otra a nivel 1 y comparalas.

---

## PROMPT · VÍA C — G-02, los barks

> **Tarea**: el sistema de carteles de arcade, con **un solo bark implementado** y la tabla lista
> para que el autor escriba el resto.
>
> Está definido en la sección 9c de `docs/historia/GUION_3.md`. La idea: hay dos canales de guiño y
> **no se mezclan nunca**. El canal 1 es el Gitano hablando dentro de la ficción de 1982. El canal 2
> es **la voz de la máquina** — un arcade de los noventa — y ahí las referencias son libres.
>
> 1. `src/data/barks.js` (nuevo): la tabla. Cada entrada `{ id, texto, cuando, mision }`.
>    **El banco se achica solo**: completo hasta M8, reducido en M9–M13, y **vacío en M14**. Esa
>    curva va en la data, no en el código: el jugador no lo va a poder nombrar, pero va a sentir que
>    el juego se quedó callado, que es exactamente lo que pasó.
> 2. `src/render/bark.js` (nuevo): el cartel. Letras grandes de arcade, centrado, entrada y salida.
>    **Regla número uno del juego: tiene que funcionar SIN VOZ.** Es un cartel, no un locutor. Si
>    algún día hay voces, la voz se suma; el cartel nunca depende de ella.
> 3. El primero y único por ahora: **`HEAVY MACHINE GUN`**, la primera vez que se sostiene la
>    metralleta unos segundos.
> 4. Reglas que van **codificadas**, no en un comentario: una sola vez **por campaña** (no por
>    misión), **nunca encima de una línea de historia**, nunca sobre una muerte.
>
> **Archivos**: `src/data/barks.js` y `src/render/bark.js`. **No toques `src/game.js`** — el
> disparador es otra fase. Dejá la función lista para que la llamen.
> **Verificación**: `npm run check`, y que `npm run smoke` deje la consola limpia.

---

## PROMPT · VÍA D — G-09 (parte visual), la pantalla negra

> **Tarea**: la pieza visual del interstitial de campaña.
>
> En `src/render/screens.js`, una función `interstitial(txt, seg)`: negro pleno, el texto centrado
> con la tipografía de las tarjetas de misión, y un fundido corto de entrada y de salida. Nada más.
>
> La va a usar el orquestador para dos cosas: el **título de misión como pantalla negra** unos
> segundos antes de la escena con imagen, y el **«DÍA SIGUIENTE»** entre misiones.
>
> Mirá cómo dibuja `drawStory` en ese mismo archivo para el tinte, el grano de película y la
> scanline: el interstitial tiene que verse de la misma familia, no de otro juego.
>
> **Archivos**: sólo `src/render/screens.js`. **No toques `src/game.js`.**
> **Verificación**: `npm run check` y `npm run cine`.

---

## PROMPT · FASE 2 — el cableado *(una sola sesión, después de las cuatro)*

> **Tarea**: colgar de `src/game.js` lo que las cuatro vías dejaron listo, y reordenar la posmisión.
> Es la única sesión que toca `game.js`, y va **de a un commit por punto**.
>
> **2.1 — el orden de posmisión.** Hoy la cadena está en `src/game.js` cerca de la línea 2589:
> `results → epilogue → upgrade → advanceCampaign`. Tiene que quedar
> `results → upgrade → epilogue → «DÍA SIGUIENTE» → brief`.
> El motivo: **la pantalla de mejoras tiene que venir inmediatamente después de la misión**, antes
> de la carta de Mateo. Hoy la recompensa llega después de todo el epílogo y se pierde.
> Sumá el título de misión como negro unos segundos antes de la escena con imagen, usando
> `interstitial()`.
> ⚠ Por ese mismo bloque pasan `S.test` y los modos `arena`, `pasadas` y `ciclo`: **ninguno** debe
> ver el interstitial de campaña.
>
> **2.2 — el contador de desgaste.** Colgá `desgaste.tick()` de donde ya se cuentan los impactos del
> jugador, y **sumá el acumulado al payload de `src/systems/saves.js`**. Si no se guarda, el avión se
> cura solo al cargar una partida.
>
> **2.3 — el disparador de barks.** Colgá `barks.tick()` del bucle de vuelo. La condición de
> «sostener la metralleta» sale de `src/systems/flight.js`, que ya lleva el estado del arma.
>
> **Verificación**: `npm run check` después de cada commit, y una corrida de M1 a M3 de punta a
> punta — es el tramo que toca las cuatro cosas a la vez.
