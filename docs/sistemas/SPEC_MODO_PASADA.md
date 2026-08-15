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
| **P0** | Estado `'pasada'` + esqueleto de `systems/pasada.js`/`render/pasada.js` + `?pasada=` + `__pdbg`. La zona 3D compartida con el ARENA, el buque en el centro, el vuelo libre PASILLO-idéntico volando en ella | se entra por sonda, se vuela, `check` verde |
| **P1** | La corrida: eje de ataque, ingreso, sobrevuelo, re-encare racetrack (todavía sin las dos variantes), auto-retorno de zona. Sin defensa ni bomba | 3 corridas seguidas se vuelan fluidas; feel = PASILLO |
| **P2** | La suelta completa: bomba balística, 3 bandas, ristra de `BOMBS_N` en salva, el sapito con sus 3 salidas, daño por zona, popups | fixture pasos 2–5 |
| **P3** | La defensa por capas: techo Sea Dart, columnas que caminan (solo al avión en corrida), Sea Cat + aviso por radio, fusilería, calor por re-encare | fixture pasos 6–7; cada capa se aprende muriendo UNA vez |
| **P4** | El reglamento: nafta como reloj, ralentí de la ventana + MOMENTUM sumado, los DOS re-encares con sus precios, derrota/victoria por el embudo (`onDeath` / `'objective'`, relevo re-entra a la pasada) | fixture pasos 8–9 |
| **P5** | Legibilidad + audio: HUD de banda de armado, corchetes/zonas, NO DESPERTÓ, silencio del Sea Dart abajo (la recompensa se escucha), sonidos por capa | mirada muda: se entiende sin leer |
| **P6** | Integración: `climax` en `missions.js`, `flight.js` señala según el campo, ARQUITECTURA + ESTADO + strings en/es, fallback `?no3d` documentado (momentum viejo) | RF-13/14; `check` verde con web |
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

- *(vacío)*
