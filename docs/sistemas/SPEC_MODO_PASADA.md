# SPEC — Modo PASADA · Análisis funcional para implementación

> **Audiencia de este documento: una IA implementadora trabajando sobre el código del
> juego, en una sesión nueva y sin el chat donde se decidió esto.** Define QUÉ construir
> para el modo PASADA — el clímax de una sola pasada contra el buque — con requerimientos
> numerados, defaults elegidos, criterios de aceptación, sondas de prueba y un plan en 8
> fases. El PORQUÉ de cada decisión vive en
> [PROPUESTAS_PASADA.md](PROPUESTAS_PASADA.md) (§2 la base histórica, §3 las mentiras
> permitidas, §8b la decisión compuesta): no repetirlo acá, consultarlo ahí.
>
> **Antes de tocar código, leer en este orden:**
> 1. `docs/ARQUITECTURA.md` — el mapa del código y sus 4 convenciones. **Manda sobre
>    cualquier suposición de este spec**: si algo no coincide (nombres, estados, rutas),
>    adaptarse a la arquitectura y anotar la diferencia en §10 "Divergencias".
> 2. `docs/sistemas/PROPUESTAS_PASADA.md` — la decisión de diseño (leer §2, §3 y §8b).
> 3. `docs/sistemas/PROMPT_ARENA_VUELO_LIBRE.md` — el 3D que se HEREDA entero
>    (`three-arena.js`, `ship3d.js`, `render/arena.js`, el vuelo PASILLO-idéntico).
> 4. `src/systems/arena.js` — el sistema hermano: la PASADA copia su disciplina de
>    señales, sus sondas y su relación con el relevo.

## 0. Cómo usar este documento (workflow de la sesión implementadora)

1. Implementar **una fase por vez** (§8), en orden. No arrancar la siguiente sin que la
   anterior funcione.
2. Tras cada fase: correr el fixture (§7) y `npm run check` completo. Verde o no se avanza.
3. Todo dato que falte: usar el default de §6 y seguir — **no inventar valores nuevos ni
   frenar a preguntar**. Si el default resulta injugable, anotarlo en §10 con la medición.
4. **No tocar los modos existentes** (HISTORIA / CICLO / POR LA PATRIA / MINUTOS SAGRADOS)
   salvo los puntos de integración explícitos de P6.
5. Anotar TODA divergencia entre este spec y el código real en §10.

## 1. Objetivo y alcance

Construir la fase **PASADA**: el enfrentamiento contra el buque al final del nivel,
resuelto con la doctrina real de 1982 — llegar a ras del agua, saltar lo justo, soltar la
ristra y salir — en lugar de la órbita libre del ARENA. La PASADA pasa a ser **el clímax
por defecto** de las misiones con buque; el ARENA queda como excepción (misiones señaladas
en PROPUESTAS §8) y MINUTOS SAGRADOS no se toca.

**Principios:**

- **P1 — La PASADA es el PASILLO con consecuencias.** Mismas teclas, misma física (la del
  PASILLO, ya portada al 3D en `systems/arena.js`), ningún control nuevo. Cambia el
  reglamento, no el manejo.
- **P2 — Sin corte.** Del pasillo a la pasada no hay pantalla, ni fade a negro, ni cambio
  de manejo perceptible. Un espectador no puede señalar el frame de la transición.
- **P3 — El aviso es humano o no es.** Nada de lock-on, tonos, RWR ni radar propio: los
  avisos llegan por radio (escuadrón / Cóndor) o por el mundo (estelas, fogonazos,
  columnas de agua).
- **P4 — Todo dato de juego es dato, no código**: perillas en `data/`, textos por
  `strings.js`, zonas por `ships.js`, clímax por misión en `missions.js`.

**Fuera de alcance:** arte nuevo (el buque placeholder de `ship3d.js` sirve), voces,
la m14 scripted, tocar el guion, IA de combate (la oleada es coreografía, ver RF-11).

## 2. Vocabulario y estados

- Fase nueva: **PASADA**, estado `'pasada'` (via `setState`). Se suma al vocabulario
  PASILLO/ARENA de ARQUITECTURA (actualizarlo en P6).
- Los modos quedan: HISTORIA/CICLO = PASILLO → **PASADA o ARENA según la misión**;
  POR LA PATRIA = solo PASILLO; MINUTOS SAGRADOS = solo ARENA (sin cambios).
- `flight.js` hoy señala `'arena'` al llegar al objetivo; pasará a señalar según el campo
  `climax` de la misión (RF-14). El fallback sin 3D (`?no3d` / web) sigue siendo el
  `momentum.js` viejo para AMBOS clímax — la PASADA requiere three.js igual que el ARENA.

## 3. Módulos (dónde vive cada cosa)

| archivo | rol | estado |
|---|---|---|
| `systems/pasada.js` | NUEVO — el reglamento: corridas, ventana, ristra, sapito, re-encare, nafta, oleada. Muta stores, devuelve `'objective'` / `{death}`, **jamás llama hacia arriba** | crear |
| `render/pasada.js` | NUEVO — overlay 2D: banda de armado, HUD de corrida, avisos. Reusar TODO lo posible de `render/arena.js` (corchetes de zonas, fx en mundo, cabina/sprite, letterbox) — importar, no copiar | crear |
| `systems/three-arena.js` | la escena 3D — se COMPARTE con el ARENA (mismo `useRenderer`, mismo `project`/`shootRay`) | reusar |
| `systems/ship3d.js` | buque + zonas etiquetadas | reusar |
| `data/pasada.js` | NUEVO — todas las perillas de §6, con un comentario por perilla | crear |
| `data/missions.js` | campo `climax: 'pasada' \| 'arena'` por misión con buque | tocar en P6 |
| `data/strings.js` | textos nuevos (es/en) — TODOS por clave, nada hardcodeado | tocar |
| `core/physics.js`, `systems/tempo.js`, `systems/squad.js` | física, cámara lenta, relevo | reusar sin tocar |

Convenciones que aplican SIEMPRE (ARQUITECTURA §"cuatro convenciones"): stores se mutan y
no se reasignan (`lint:state` lo custodia); sistemas devuelven señales; snapshot para el
render; editar módulos, nunca el bundle.

## 4. Requerimientos funcionales

### RF-01 · Transición sin corte (la entrada)
Al cumplirse la distancia del objetivo, el buque aparece en el horizonte DEL PASILLO y el
mundo se abre a la zona 3D sin fade, sin pantalla y sin cambio de manejo. Los spawns de
enemigos se cortan `ENTRY_CLEAR_M` antes; desde ahí, columnas de agua (RF-04) reemplazan a
los obstáculos. **CA:** grabando la secuencia, no hay frame negro ni salto de cámara; el
smoke de "el canvas cambia entre cuadros" pasa durante toda la transición.

### RF-02 · La corrida
Una corrida = ingreso a ras → (salto) → suelta → sobrevuelo/egreso → re-encare. El avión
vuela LIBRE (el modelo de `systems/arena.js`: mismas constantes de `flight.js`, viraje
coordinado, turbo, mira elegible, V para 1ª/3ª persona). La zona es acotada con
auto-retorno al borde, como el ARENA. **CA:** el feel lateral y de gas medido en la pasada
da los mismos números que el PASILLO (vx 0→30 en ~0.27 s, decae a <2 en 0.6 s).

### RF-03 · El techo de radar (capa Sea Dart)
Bajo `RADAR_CEIL_M` el buque no puede lanzarte el misil de área. Cruzarlo lejos del blanco
(más de `POPUP_DIST_M`) dispara UN Sea Dart: esquivable con un quiebre sostenido, pero
cuesta tiempo y nafta. Volar bajo se ESCUCHA: sin lanzamientos, solo el motor y el mar.
**CA:** ingresando a ras nunca sale; subiendo a 2× el techo a >1200 m sale siempre.

### RF-04 · Las columnas de agua (el cañón)
El cañón de 4,5" tira salvas que CAMINAN hacia el rumbo del avión (reusar la predicción
del flak del ARENA): columnas de agua visibles, letales al contacto, esquivables cambiando
de rumbo. Solo le tira **al avión en corrida** — si un compañero está en la suya (RF-11),
las columnas son para él. **CA:** volar 6 s en rumbo constante = te alcanzan; zigzag
suave = pasás.

### RF-05 · El salto
El salto es una subida CONTROLADA con el gas (no un botón): subir mide exposición. Entre
`POPUP_DIST_M` y el buque, estar sobre el ras habilita la mira sobre las zonas (corchetes
del ARENA) y enciende TODA la defensa corta. **CA:** desde el salto se puede elegir zona
visualmente en <1 s; quedarse arriba >3.5 s en esa distancia = daño casi seguro.

### RF-06 · La ventana de suelta y la ristra
[Z] suelta. La bomba es un proyectil balístico (hereda velocidad + gravedad). El resultado
depende de la altura de suelta: **ALTA** (> `BAND_SWEET_MAX`): arma, pero la exposición ya
te castigó · **DULCE** (`BAND_ARM_MIN`–`BAND_SWEET_MAX`): arma y entra · **DORMIDA**
(< `BAND_ARM_MIN`): golpea, no explota, popup `pasada_dud` ("NO DESPERTÓ"), daño mínimo.
Se llevan `BOMBS_N` bombas por corrida y salen **en salva sobre la línea de vuelo**
(separación `RIPPLE_S`); pegarle a dos zonas en una pasada = haber elegido un eje que las
alinee. No hay segunda mira. **CA:** con el avión colocado en un eje que alinea dos zonas
(sonda `__pset`), una ristra de 2 daña las dos; en un eje que no, la segunda cae al agua.

### RF-07 · El sapito (easter egg)
Suelta **antes del salto**, al ras (< `SAPITO_ALT_M`) y a fondo (turbo): la bomba pica una
vez en el agua y entra al casco — daño pleno + bonus `SAPITO_PTS` + popup propio. Corta
(lejos): se hunde. Larga (encima): **rebota por sobre la cubierta** y sigue de largo,
visible. Sin asistencia de mira: es a ojo. **CA:** las tres salidas (entra / se hunde /
salta por encima) se producen y se distinguen visualmente.

### RF-08 · Sea Cat y fusilería (la defensa corta)
En el egreso (y en el salto si te demorás) sale UN Sea Cat por corrida: estela visible,
subsónico, guiado — un quiebre lateral franco dentro de `SEACAT_DODGE_S` lo pierde; volar
recto, te alcanza. El aviso es por radio (`pasada_break`: "¡Quebrá, {piloto}!") — con
menos Fieles vivos, a veces NO hay aviso (regla del juego: sin radar, los ojos son el
escuadrón). Sobre la cubierta, fusilería: daño chico por segundo de sobrevuelo. **CA:**
con quiebre se esquiva >90% de las veces; recto, pega; sin escuadrón no hay llamada.

### RF-09 · El re-encare — dos maneras, dos precios
Tras el sobrevuelo: **viraje lateral** = volvés por el lado opuesto, rápido, y te cruzás
de frente con la oleada (RF-11) · **chandelle por arriba** = mismo lado, más nafta, y el
lomo de la subida asoma al Sea Dart (un lanzamiento si se cruza el techo). No hay menú: es
cómo VOLÁS la vuelta. Cada re-encare **calienta la defensa**: `+HEAT_RATE` de cadencia y
precisión del cañón por corrida. **CA:** en la corrida 3 el cañón tira medible-mente más
cerrado que en la 1 (leer por sonda).

### RF-10 · La nafta es el reloj
La zona arranca con nafta para ~`FUEL_MIN` minutos de juego. Todo la gasta (turbo y
chandelle, más). Tanque seco = caída = muerte por el embudo de siempre (`onDeath` decide
relevo o derribo; el relevo re-entra A LA PASADA con el daño al buque intacto, igual que
hace el ARENA). **CA:** `[M] COMBUSTIBLE: NO` la apaga, como en el resto del juego.

### RF-11 · La oleada (coreografía, no IA)
Entre tu corrida y la siguiente, los Fieles vivos del roster hacen las suyas: **splines de
ataque pre-armadas** (entrada, suelta, salida) con timing `WAVE_GAP_S`, alternando ejes.
No reaccionan ni combaten: son pasadas. Sus bombas hacen daño real (probabilidad
`WING_HIT_P` por corrida); la defensa les tira a ellos mientras corren (RF-04); sus toques
pasan por el sistema de relevo SOLO como avería narrada por radio — **la muerte de un
Fiel jamás ocurre acá: los muertos los decide el guion** (Vasco m7, Pichón m9). En el
re-encare lateral te los cruzás de frente (flyby, sin colisión amiga). **CA:** con roster
de 3, entre tus corridas se ven/escuchan hasta 2 corridas amigas; con roster de 1, ninguna
y ningún aviso de radio.

### RF-12 · El ralentí de la ventana
De `POPUP_DIST_M` hasta la suelta (o el sobrevuelo), el tiempo del mundo corre a
`SLOW_FACTOR` (default 0.85×). Implementarlo como el MOMENTUM: escalando el `dt` del mundo
(la infraestructura de `tempo.js` ya lo hace) — **jamás** relojes de pared por sistema. El
MOMENTUM del jugador (tecla 4, barra cargada) SE SUMA multiplicando. Perilla en OPCIONES
(`OPT_ROWS`). **CA:** con la perilla en NO, el mundo corre 1×; los dos ralentís compuestos
no rompen spawns ni flak (nada usa reloj de pared).

### RF-13 · Fin de la batalla
El buque define sus objetivos = las zonas de su clase (`ships.js`, como ARENA). Todas
apagadas → `'objective'` → el flujo de siempre (results → epílogo). **CA:** en HISTORIA y
CICLO encadena igual que hoy encadena el ARENA; ninguna pasada aparece en POR LA PATRIA ni
en MINUTOS SAGRADOS.

### RF-14 · El clímax es dato de la misión
`missions.js`: cada misión con buque lleva `climax: 'pasada'` (default) o `'arena'`
(las señaladas — PROPUESTAS §8). `flight.js` señala `'pasada'` o `'arena'` leyendo ese
campo. Sin el campo → `'pasada'`. **CA:** cambiar el campo de una misión cambia su clímax
sin tocar código.

## 5. Requerimientos no funcionales

- **RNF-01** Pixel-perfect coherente (render a 480×270 vía `useRenderer`, blit sin
  suavizado — igual que el ARENA).
- **RNF-02** Cero dependencias nuevas. Cero assets nuevos requeridos (el buque placeholder
  sirve; los fx son procedurales).
- **RNF-03** No romper NINGÚN modo existente. El gate es `npm run check` completo, con
  smoke y web (límite Artifact 16 MB).
- **RNF-04** Todo texto por `strings.js` (es/en; `en` vacío cae a `es`).
- **RNF-05** Sondas de prueba marcadas `QUITAR` como las del ARENA (`__adbg`/`__aset`).

## 6. Perillas y defaults *(viven en `data/pasada.js`; NO inventar otros valores)*

| perilla | default | qué es |
|---|---|---|
| `ENTRY_CLEAR_M` | 700 | metros antes del buque sin spawns de enemigos (entrada) |
| `ZONE_R` | 1600 | radio de la zona con auto-retorno (el buque al centro) |
| `RADAR_CEIL_M` | 35 | techo de radar: abajo, el Sea Dart no existe |
| `POPUP_DIST_M` | 800 | desde acá el salto habilita mira (y el ralentí RF-12) |
| `BAND_ARM_MIN` | 20 | piso de armado: soltar más abajo = dormida |
| `BAND_SWEET_MAX` | 55 | techo de la banda dulce |
| `BOMBS_N` | 2 | bombas por corrida (la 3ª queda para una mejora del Pichón) |
| `RIPPLE_S` | 0.35 | separación de la salva |
| `SAPITO_ALT_M` | 12 | altura máxima de suelta del sapito (+ turbo requerido) |
| `SAPITO_PTS` | 2000 | bonus de estilo |
| `SEACAT_DODGE_S` | 1.2 | ventana de quiebre tras el aviso |
| `HEAT_RATE` | 0.15 | +cadencia/precisión del cañón por re-encare |
| `FUEL_MIN` | 10 | minutos de nafta de la zona |
| `SLOW_FACTOR` | 0.85 | ralentí de la ventana (perilla en OPCIONES) |
| `WAVE_GAP_S` | 6 | separación entre corridas de la oleada |
| `WING_HIT_P` | 0.4 | probabilidad de que la corrida de un Fiel dañe su zona |

## 7. Sondas y fixture

- **`?pasada=<n>`** — arranca DERECHO en la pasada de la misión `n` (mismo patrón que
  `?qa` / `?no3d` / `?scene=`): sin menú, sin pasillo. Sin el parámetro, cero efecto.
- **`window.__pdbg()`** — JSON con: corrida nº, fase (ingreso/salto/egreso/re-encare),
  altura, banda actual, bombas restantes, nafta, calor de defensa, zonas vivas, oleada
  (quién corre). **`window.__pset(dist, alt, off)`** — coloca el avión (distancia al
  buque, altura, desvío lateral del eje). Ambas marcadas QUITAR.
- **`tools/fixture_pasada.js`** + script npm **`pasada`** (patrón de
  `tools/fixture_story.js`): entra con `?pasada=`, y verifica con `__pdbg`/`__pset`:
  1. cero assets nuevos y cero errores de consola;
  2. banda dormida: suelta a 10 m → impacto sin explosión, popup NO DESPERTÓ;
  3. banda dulce: suelta a 35 m → daño a la zona apuntada;
  4. ristra: en un eje que alinea dos zonas, una salva de 2 daña las dos; desalineado, la
     segunda cae al agua;
  5. sapito: al ras + turbo → entra; lejos → se hunde; encima → rebota por sobre cubierta;
  6. Sea Cat: con quiebre no pega, recto pega;
  7. calor: cadencia de la corrida 3 > corrida 1;
  8. nafta: drena, y con `[M] COMBUSTIBLE: NO` no;
  9. todas las zonas muertas → `results` (DEBUG_STATE: sin `brief`/`takeoff` intermedios).

## 8. Plan por fases *(cada una shippeable; gate: fixture + `npm run check` verdes)*

| Fase | Entrega | Criterio de cierre |
|---|---|---|
| ~~**P0**~~ ✅ | Estado `'pasada'` + esqueleto de `systems/pasada.js`/`render/pasada.js` + `?pasada=` + `__pdbg`. La zona 3D compartida con el ARENA, el buque en el centro, el vuelo libre PASILLO-idéntico volando en ella | **hecho 16/8/2026**: se entra por sonda y se vuela; la transición sin corte anda y está medida (§10.4); `npm run pasada` y `npm run check` verdes |
| **P1** | La corrida: eje de ataque, ingreso, sobrevuelo, re-encare racetrack (todavía sin las dos variantes), auto-retorno de zona. Sin defensa ni bomba | 3 corridas seguidas se vuelan fluidas; feel = PASILLO |
| ~~**P2**~~ ✅ | La suelta completa: bomba balística, 3 bandas, ristra de `BOMBS_N` en salva, el sapito con sus 3 salidas, daño por zona, popups | **hecho 16/8/2026**: fixture pasos 2–5 verdes (dulce 130 de daño · dormida 2 impactos sin estallar · sapito entra picando · la ristra alcanza 2 zonas por el eje del casco y 1 cruzando la manga) |
| **P3** | La defensa por capas: techo Sea Dart, columnas que caminan (solo al avión en corrida), Sea Cat + aviso por radio, fusilería, calor por re-encare | fixture pasos 6–7; cada capa se aprende muriendo UNA vez |
| **P4** | El reglamento: nafta como reloj, ralentí de la ventana + MOMENTUM sumado, los DOS re-encares con sus precios, derrota/victoria por el embudo (`onDeath` / `'objective'`, relevo re-entra a la pasada) | fixture pasos 8–9 |
| **P5** ◐ | Legibilidad + audio: HUD de banda de armado, corchetes/zonas, NO DESPERTÓ, silencio del Sea Dart abajo (la recompensa se escucha), sonidos por capa | **adelantado a medias 16/8/2026** por pedido del autor (§10.22–25): contador de suelta + su tic-tac, escalera de armado, distancia al buque y etiquetas de zona sin apilarse. Falta todo lo que depende de P3/P4 (audio por capa, silencio del Sea Dart) |
| ~~**P6**~~ ✅ | Integración: `climax` en `missions.js`, `flight.js` señala según el campo, ARQUITECTURA + ESTADO + strings en/es, fallback `?no3d` documentado (momentum viejo) | **hecho 16/8/2026**: `climaxOf()` puro en `data/missions.js` con default `'pasada'`, probado en `npm run unit`; m4 y m12 son las dos de ARENA (§10.26–27). Pendiente el combo `'pasada+arena'` (§10.28) |
| **P7** | La oleada: splines coreografiadas de los Fieles vivos, timing, radio, daño `WING_HIT_P`, cruce de frente en el lateral, averías narradas (sin muertes) | RF-11; con roster 1 no hay oleada |

**Después de P7** (fuera de este spec): decidir retiro de `momentum.js` viejo (libera el
nombre MOMENTUM — ver la advertencia de ARQUITECTURA), la 3ª bomba como mejora, m14 con
oleada completa.

## 9. Qué NO hacer *(prohibido por diseño — PROPUESTAS §10, más lo operativo)*

1. **No resucitar el riel** (avión clavado, mundo que gira): ya fue rechazado una vez.
2. **No lock-on con tono, no RWR, no radar propio, no chaff/bengalas.** El aviso es
   humano (radio) o visual (mundo), o no es.
3. **No aire-aire.** Los Harrier no aparecen en la PASADA.
4. **No matar Fieles fuera de guion** — la oleada avería, nunca mata.
5. **No relojes de pared** en nada del mundo: todo escala por `dt` (el ralentí y el
   MOMENTUM dependen de eso).
6. **No cinemática en la suelta**: la suelta se juega siempre.
7. **No inventar cifras históricas en pantalla** — toda afirmación nueva pasa antes por
   `PREGUNTAS_HISTORICAS.md`.
8. **No tocar** `momentum.js`/`render/momentum.js` (fallback vivo), ni el ARENA salvo
   extraer-para-compartir (y eso, sin cambiarle el comportamiento: su fixture es el smoke).
9. **No strings sueltos**, no reasignar stores, no editar el bundle.

## 10. Divergencias encontradas *(completar durante la implementación)*

> La IA implementadora anota acá toda diferencia entre este spec y la realidad del código,
> con la decisión tomada. Este bloque es la memoria del proyecto para la próxima pasada.

### P0 (16/8/2026)

1. **`__pdbg` ya existía y era otra cosa.** El nombre estaba tomado por la sonda de la PAUSA en
   `game.js` (`{paused, view, sel, saveSel, state}`), y `tools/smoke.js` la usa. `__udbg` tampoco
   servía: es la del BANCO DEL PICHÓN. **Decisión:** la sonda de la pausa pasó a llamarse
   `__pausedbg` (dos usos en `smoke.js`, actualizados) y `__pdbg` quedó libre para la PASADA, como
   pide §7. Ninguna es de juego: las tres son sondas de desarrollo.

2. **Parámetro de sonda extra: `?pasada=<n>&pasillo`.** El spec pide que `?pasada=<n>` entre
   *derecho* a la zona, sin pasillo — y así quedó, es la que usa el fixture. Pero entonces la
   transición sin corte (RF-01) **no se puede observar**, porque no hay pasillo del que venir. Se
   agregó el flag `pasillo`: juega el nivel y lo deja desembocar en la pasada. Sin él, nada cambia.

3. **RF-14 todavía no está: el clímax lo decide la sonda, no `missions.js`.** `runClimax()` en
   `game.js` devuelve `'pasada'` sólo si la sonda está puesta. El campo `climax` por misión y el
   default `'pasada'` son **P6**, que es su fase; hasta entonces ningún modo existente cambia de
   clímax (regla §0.4).

4. **El "sin corte" tenía un dueño concreto: el CORDÓN DE BRUMA.** `veilNow()` cierra un velo negro
   desde el 55% del camino hasta ser pared sobre el buque — mirado de frente, **es un fade**, y es
   lo que esconde el teletransporte del ARENA. Con clímax PASADA devuelve 0. Medido con el brillo
   medio del cuadro, normalizado contra el 60% del mismo run: **ARENA 100% → 87 → 70 → 52 → 40%;
   PASADA 100% → 101 → 100 → 100 → 101%.** El fixture lo verifica solo.

5. **Bug de arranque encontrado y arreglado (`game.js`): el primer `dt` podía ser NEGATIVO.** `last`
   se sembraba con `performance.now()` y el `now` del primer `requestAnimationFrame` es el instante
   en que arrancó ese cuadro — medido, **−9,6 ms**. Con dt negativo el volumen del motor sale
   negativo, el `<audio>` tira `IndexSizeError` y, como pasa dentro del rAF, **se lleva puesto el
   loop entero**. Nadie lo veía porque en la portada no suena el motor; apareció al entrar derecho
   al pasillo con esta sonda. Fix: `Math.max(0, …)` en el `raw` del loop.

6. **Lo que se comparte con el ARENA se exportó, no se copió** (§3 y §9.8): `drawThirdPlane`,
   `shipArrow` y `COCKPIT_Y` de `render/arena.js`, y la escena de `three-arena.js` (que ahora acepta
   el estado `'pasada'`). Exportar no le cambia el comportamiento al arena — su fixture es el smoke,
   que sigue verde. **No** se compartieron los indicadores de sistemas que la pasada no tiene
   (pintado de misiles, stagger, reparto de energía): dibujar la barra de algo que no existe sería
   mentirle al jugador. El armado del `io` de vuelo (12 líneas) quedó duplicado a propósito: la
   pasada no tiene pips ni media vuelta, y compartirlo obligaría a tocar el arena.

7. **Los corchetes de zona sólo se dibujan dentro de `POPUP_DIST_M`.** Es RF-05 (el salto es lo que
   habilita la mira sobre las zonas) y además resuelve lo que se veía a 1200 m: cinco etiquetas
   apiladas sobre un buque de diez píxeles. **Sigue pendiente para P5**: entre 800 y ~400 m las
   etiquetas todavía se pisan entre ellas (el buque ocupa pocos píxeles y las zonas están juntas).
   Es el mismo comportamiento que tiene el ARENA de lejos, y es trabajo de legibilidad, no de P0.

8. **Pendiente de RF-01 que P0 NO entrega:** el buque todavía no se dibuja en el horizonte *del
   pasillo* — aparece cuando el mundo se abre. El criterio de aceptación de RF-01 (ni frame negro
   ni salto de cámara, el canvas cambiando durante toda la transición) sí se cumple y está medido.
   Queda anotado para P1/P5.

9. **Fase y banda son derivadas, no estado.** `fase` (ingreso/salto/egreso/re-encare) se calcula de
   la geometría y `banda` de la altura. Alcanza para que la sonda las lea; **P1** las convierte en
   estado real con el eje de ataque y el re-encare.

### P2 — la suelta (16/8/2026)

11. **§6 no trae daño de bomba.** Define la VENTANA (las bandas) pero no cuánto pega. Se agregaron
    tres perillas nuevas en `data/pasada.js`, con su porqué: `BOMB.DMG = 90` (apaga de una el radar
    45, el AA 55 y el motor 70, pero **no el PUENTE de 130, que pide dos** — el blanco duro tiene
    que sentirse duro, y con 2 bombas por corrida deja la doctrina en 2–4 pasadas), `BOMB.DUD = 0.12`
    (la dormida golpea y hace ~11: no es cero, y esa es exactamente la historia de las bombas que
    entraron sin estallar) y `BOMB.G = 9.8` (gravedad real).

12. **Hizo falta la MIRA DE SUELTA.** Con la bomba heredando 100 m/s y cayendo con gravedad real, a
    35 m de altura el adelanto son **~270 metros**: sin marca, la suelta es adivinar y el CA de la
    ristra no lo puede cumplir una persona. Es la mentira permitida §3.4 de PROPUESTAS. **Y
    desaparece por debajo de `SAPITO_ALT_M`**, porque RF-07 pide que el sapito sea a ojo.

13. **El casco NO es agua.** El rayo de la bomba puede pegarle a una pieza sin zona (la chapa) y eso
    contaba como "cayó al agua": una bomba bien puesta en el medio del buque no hacía nada. Ahora un
    impacto sin zona se lo cobra **la zona viva más cercana** — una bomba que entra por el casco
    revienta adentro y se lleva lo que tiene encima.

14. **La ristra se repone por corrida** (`OUT_R` = `POPUP_DIST_M + ENTRY_CLEAR_M/2` = 1150 m). El
    recurso escaso no son las bombas: son la nafta (RF-10) y una defensa cada vez más caliente
    (RF-09). El umbral va a la MITAD del tramo limpio porque pedir 1500 dejaba el rearme pegado a la
    correa del piloto automático, que está en 1600.

15. **El CA de la ristra se mide en ZONAS ALCANZADAS, no en daño.** Dos bombas en zonas de 45 y 55
    suman 100; una sola que revienta el puente suma 130 — con la métrica de daño, la pasada *peor*
    ganaba. Medido: **a lo largo del casco 2 zonas de una sola pasada; cruzando la manga, 1.**

16. **`npm run pasada` no entra a `npm run check`**, por el mismo criterio que `npm run story`: son
    segundos de vuelo real. Se corre a mano después de cada fase, como pide §0.2.

### El JOYSTICK (16/8/2026)

17. **El mando no volaba la pasada.** La lista `inGame` de `core/input.js` —los estados donde el pad
    escribe el vuelo— era `play · takeoff · momentum · arena`. La PASADA no estaba, así que el
    `else` (la rama de menús) le **soltaba todos los ejes**: se entraba al clímax sin corte y el
    avión se quedaba sin piloto. No lo veía nadie porque el fixture y el smoke manejan con teclado.
    **Regla que queda:** *todo clímax nuevo entra en `inGame`*, y ahora el fixture lo verifica.

18. **Sección 3 nueva del fixture: el mando de punta a punta, con un pad FALSO.** Se pisa
    `navigator.getGamepads` con un objeto que el script mueve a mano; el poll de `input.js` lo lee
    como a cualquier otro, así que el camino probado es el real entero (poll → flancos → `setPad`).
    Cubre los cuatro gestos de la pasada: stick izquierdo = gas, stick derecho = banqueo, **L1 =
    soltar la ristra** y cruceta abajo = cámara. El umbral del gas es de 0,2 rad y no "subió algo":
    con el pad muerto el morro **deriva** unas centésimas solo, y esa deriva daba el chequeo por
    bueno con el mando desconectado.

19. **Un botón nuevo, y no es un control nuevo (§9): cruceta ABAJO = cámara.** Era la última
    dirección de la cruceta sin dueño en juego. La PASADA y el ARENA conmutan CABINA ↔ TERCERA
    PERSONA en vivo con `[V]` y el mando **no tenía con qué**: la tabla de OPCIONES decía "—" en la
    columna JOYSTICK. No agrega una mecánica; le da al pad lo que el teclado ya tenía.

20. **La suelta NO estrena botón: es L1/□, el del misil.** Mismo campo (`inp.msl`) que lee el
    pasillo, así que "el otro índice tira lo pesado" vale en los tres modos y no hay una mano nueva
    que aprender. Es lo que pide §9 (*ningún control nuevo*), leído al pie de la letra.

21. **La tabla de CONTROLES de OPCIONES estaba incompleta desde antes.** Le faltaba el **FRENO**
    (`[F]` / L2), que el ARENA usa desde que existe. Se agregó la fila y una nota al pie: *en la
    PASADA, el MISIL suelta las bombas*. La tabla dice lo que `input.js` **hace**, así que cada
    binding nuevo se anota ahí en el mismo commit — en los dos idiomas.

### P6 y media P5, fuera de orden (16/8/2026)

> **Por qué fuera de orden.** El autor jugó P2 y encontró dos cosas que no dejaban jugar:
> *"al volar no sé cuándo disparar"* y *"llego a estar tan cerca que entro en modo ARENA, que
> según entiendo ya no debería aparecer"*. Las dos son fases posteriores (P5 legibilidad, P6
> integración) pero bloquean el playtest de todo lo demás, así que se adelantaron. **P1, P3 y P4
> siguen pendientes y en su orden.**

22. **El CONTADOR DE SUELTA no está en el spec, y era lo que faltaba.** La mira de impacto (§10.12)
    dice *dónde* cae la bomba; no dice *cuándo* soltar, y con el buque a 500 m sobre el mar vacío
    eso no se deduce. `releaseCue()` **marcha** desde el punto de impacto por el rumbo actual, de a
    4 m, y devuelve los metros hasta que la marcha cae dentro de la huella del buque. Tres salidas:
    `0` (la ventana está abierta — el HUD canta **AHORA**), un número (metros que faltan volar) y
    **`null`, que es la mitad del valor**: tu rumbo no cruza el buque, así que no hay cuándo. Une
    *¿cuándo suelto?* con *¿estoy encarado?* en un solo dato. Se marcha en vez de despejar una
    fórmula justamente para que la huella real (133 × 30 m) se sienta.

23. **Medido y con consecuencias de diseño: la ventana dura 0,3 s cruzando la manga y 1,2 s
    entrando por el eje del casco** (110 m/s contra 30 m y 133 m de huella). Es la misma lección
    que la ristra (§10.15) dicha por otro lado, y es el argumento más fuerte a favor del **eje de
    ataque de P1**: hoy el jugador puede entrar por donde quiera y por la manga el modo es
    injustamente duro.

24. **La ESCALERA DE ARMADO (parte del HUD de P5).** La palabra `DULCE/DORMIDA/ALTA` no dice cuánto
    falta ni para dónde. La regla vertical de la izquierda pinta la franja que arma, la marca del
    avión con el color de su banda, y **el techo de radar punteado en el mismo eje** — las dos
    decisiones de altura del modo (RF-03 y RF-06) leídas de un vistazo.

25. **El contador va ARRIBA, en la franja de cielo bajo el letterbox.** Primero se puso bajo el
    centro y en la captura se leía **encima del tablero de la cabina**: ilegible. Esa franja es la
    única despejada en las dos cámaras. Los avisos de la correa y el cartel de controles bajaron a
    44 y 54 para dejarle el lugar.

26. **RF-14 completo, y el default vive en `data/missions.js`.** `climaxOf(m)` es una función pura
    ahí mismo —no una rama en `game.js`— porque es la regla de la campaña y siendo pura se prueba
    en node: `npm run unit` verifica el CA ("cambiar el campo cambia el clímax") con misiones
    inventadas. `runClimax()` la consulta. **MINUTOS SAGRADOS y PASADAS MORTALES no la miran**, y no
    es inconsistencia: esos modos no juegan la misión, juegan un clímax suelto.

27. **Las misiones de ARENA quedaron en DOS y no en cuatro.** PROPUESTAS §8 pedía m4 Ardent, m9
    Galahad, m10 Tristram y m12 Glamorgan. El autor dijo *"PASILLO y ARENA, ocasionalmente"* y
    *"quizá uno o dos"*, así que quedaron **m4** (San Carlos: el callejón ES una arena, y la misión
    se llama EL CALLEJÓN DE LAS BOMBAS) y **m12** (el cierre de la campaña se pelea). Galahad y
    Tristram pasaron a PASADA, que además es lo que históricamente les pasó.

28. **El combo `'pasada+arena'` que pidió el autor NO está.** Necesita que la pasada sepa
    desembocar en el arena, y eso depende de una decisión suya que quedó abierta: *qué pasa si no
    derrotás al buque en la pasada*. Hasta que la conteste, el campo acepta `'pasada'` o `'arena'`.

29. **Las etiquetas de zona sólo se dibujan con 14 px de ancho de corchete**, lo que cierra a
    medias el pendiente §10.7: a 500 m los cinco carteles se apilaban en un borrón sobre el buque
    —peor que no poner nada, parece un error del juego— y ahora queda el corchete solo. El nombre
    aparece cuando sirve para ELEGIR entre una zona y otra.

30. **La ventana del fixture pasó a 1280x760.** Con 960x540 la página (que tiene encabezado y pie
    alrededor del canvas) dejaba el canvas anclado abajo y **se perdían los 33 px de arriba**:
    `getBoundingClientRect` daba `y = -63`. Las capturas salían sin el título de la fase y sin el
    contador, y el bug era el encuadre, no el HUD. La ventana real del juego es 1280x720.

31. **Sonda nueva `__pdrop()`**, que suelta sin pasar por la tecla. No es comodidad: cruzando la
    manga la ventana dura 0,3 s y un ida y vuelta de sondeo de más ya la deja atrás, así que
    colocar y soltar tiene que ser **una sola llamada**.
