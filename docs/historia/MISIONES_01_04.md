# RASANTE — Dossier de misiones · M1 a M4

> **Para qué existe.** Hasta hoy, tocar una misión pedía abrir cinco archivos y adivinar cuál de
> ellos manda. Este documento junta, misión por misión, **todo lo que la define**: la ficha, cada
> perilla del mapa con su valor y su porqué, la distancia y el tiempo medidos, la composición del
> nivel, el clímax, la mejora que entrega, el guion con sus diálogos textuales, y los prompts de
> las escenas y de los rostros que hay que generar.
>
> **No reemplaza al código: lo indexa.** Donde este documento y `src/data/` no coincidan, manda
> `src/data/`. Cada sección termina en **Palancas** — el archivo y el campo exacto que hay que
> tocar para cambiar eso.

---

## Cómo leer esto

### Dónde vive cada cosa

| Qué | Archivo | Forma |
|---|---|---|
| ficha, objetivo, perillas del mapa, tramos | [`src/data/missions.js`](../../src/data/missions.js) | un objeto por misión en `MISSIONS` |
| qué mejora entrega y cuántas cartas ofrece | [`src/data/upgrades.js`](../../src/data/upgrades.js) | `UPGRADES` + `ofertaTrasMision(i)` |
| el guion: pantallas, títulos y diálogos | [`src/data/strings.js`](../../src/data/strings.js) | `storyM*`, `briefM*`, `epiM*` |
| qué placa de ambiente usa cada pantalla | [`src/data/placas.js`](../../src/data/placas.js) | `PLACA_DE_CUADRO` |
| las líneas de radio de los tramos | [`src/data/strings.js`](../../src/data/strings.js) | claves sueltas (`m4_radio1`…) |
| el clímax de buque | [`src/data/pulso.js`](../../src/data/pulso.js) · `arena.js` · `pasada.js` | constantes por modo |
| qué clímax está apartado | [`src/data/cuarentena.js`](../../src/data/cuarentena.js) | dos listas |
| el bloque de estilo de todo prompt | [`ESTILO_VISUAL.md`](ESTILO_VISUAL.md) | se cita, no se reescribe |
| los descriptores canónicos de cada personaje | [`PROMPTS_HOJAS_PERSONAJE.md`](PROMPTS_HOJAS_PERSONAJE.md) | una sección por personaje |

### El vocabulario de la configuración

Toda misión declara **las mismas trece perillas, siempre explícitas**. Es a propósito: la config
se aplica con `Object.assign` sobre `cfg`, así que una clave faltante no vuelve al default —
**se queda pegado el valor de la misión anterior**. La función `C()` de `missions.js` garantiza
que eso no pase.

| Perilla | Valores | Qué hace | Cambia el juego? |
|---|---|---|---|
| `sky` | `dawn` `dusk` `sun` `clear` `cloudy` `storm` `moon` `night` | el cielo, y de él sale el color del agua en modo `auto` | no, ambiente |
| `water` | `auto` `sea` `violet` `storm` `night` `sun` `dawn` | estilo del mar; `sea` es el fijo de siempre | no, ambiente |
| `terrain` | `sea` `land` `coast` | sobre qué se vuela | **sí** |
| `wind` | `true` `false` | viento en contra: **te va frenando hasta −35 %** cuanto más llevás en el aire | **sí** |
| `obstacles` | `0` `0.5` `1` `1.7` — NINGUNO · POCOS · NORMAL · MUCHOS | densidad de siembra del pasillo | **sí** |
| `coast` | `120` `230` `400` — CORTA · NORMAL · LARGA | metros de tierra firme antes de que empiece el mar | **sí** |
| `bombs` | `0` `0.5` `1` `2` — NO · POCO · NORMAL · INTENSO | bombardeo cayendo del cielo | **sí** |
| `rain` | `0` `1` `2` `3` — NO · GARÚA · LLUVIA · TORMENTA | lluvia. **Ambiente puro**: no cambia el vuelo | no |
| `fog` | `0` `1` `2` — NO · VISIBLE · CASI NULA | banco de niebla: te ciega dentro del banco | **sí** |
| `fogLen` | `0` `1` `2` `3` — CORTO · MEDIO · LARGO · MUY LARGO | qué tan largo es el banco | **sí** |
| `squad` | `1`–`8` | **las vidas**: cuántos aviones tiene la formación | **sí** |
| `caza` | `0` `1` `2` | intensidad de LA COLA — el Harrier que te persigue por detrás | **sí** |
| `persec` | `0` `1` | vuelo de numeral: seguís al líder y su línea es la respuesta correcta del nivel | **sí** |

Fuera de `C()`, dos campos más aparecen a nivel de misión: **`chancha`** (`false` corta el
reabastecedor desde el epílogo de M5) y **`tramos`** (ver M3).

### Cómo se leen la distancia y el tiempo

La velocidad **no es una perilla**: sube sola con el tiempo de vuelo, con lo bajo que volás y
con la racha. El modelo vive en [`core/physics.js`](../../src/core/physics.js):

```
base  = min(150, 62 + t·2.8)          ← 62 al despegar, techo 150 a los ~31 s
racha = 1 + rasLevel·0.12 + bonus de multiplicador
viento = 1 − min(0.35, (t − 0.8)·0.075)   ← solo si wind: true
spd = base · racha · viento · (turbo ? 1.5 : 1)
```

Los tiempos de abajo son **medidos integrando ese modelo**, no estimados a ojo. Se dan en tres
columnas porque el mismo nivel dura cosas muy distintas según cómo se vuele:

- **neutro** — sin volar rasante, sin turbo. Es el **techo**: nadie tarda más que esto.
- **rasante 2** y **rasante 3** — sosteniendo el bono de vuelo bajo. Es como se juega de verdad.

### Las estrellas

`starsFor(total, par)` en `game.js:1255`. Son **cuatro**, no tres:

| | Condición |
|---|---|
| ★ | terminar la misión (cualquier puntaje bajo el par) |
| ★★ | llegar al `par` |
| ★★★ | `par × 1.5` |
| ★★★★ | `par × 2` — rango **HALCÓN DEL ATLÁNTICO**, el tope |

---

## Las cuatro de un vistazo

| | **M1** SAL EN LAS ALAS | **M2** BAUTISMO DE FUEGO | **M3** EL DÍA QUE SANGRÓ EL MAR | **M4** EL CALLEJÓN DE LAS BOMBAS |
|---|---|---|---|---|
| fecha | fines de abril 1982 | 1 de mayo 1982 | 4 de mayo 1982 | 21 de mayo 1982 |
| objetivo | distancia 2200 m | distancia 2600 m | **buque** HMS SHEFFIELD · 2600 m | **buque** HMS ARDENT · 2600 m |
| cielo | AMANECER | ATARDECER | ATARDECER | NUBLADO |
| viento | **no** | sí | sí | sí |
| obstáculos | POCOS `0.5` | NORMAL `1` | NORMAL `1` *(por tramos)* | **MUCHOS `1.7`** |
| bombardeo | **NO `0`** | POCO `0.5` | POCO `0.5` | NORMAL `1` |
| caza (la cola) | **0** | 1 | 1 *(por tramos)* | 1 |
| numeral | **sí `1`** | no | no | no |
| lluvia · niebla | no · no | no · no | no · no | no · no |
| escuadrón | 5 | 5 | 5 | 5 |
| par | 5000 | 6500 | 7500 | 8500 |
| clímax | — | — | PASADA → **EL PULSO** | ARENA → **EL PULSO** |
| mejora | **ninguna** | 1 servida | 2 a elegir | 2 a elegir |

**La forma de la rampa.** M1 le saca al juego todo lo que castiga (sin viento, sin bombas, sin
caza, obstáculos a la mitad) y a cambio le pone lo único que **enseña**: el numeral. M2 prende
las tres cosas de golpe pero deja la densidad en normal. M3 mantiene la dificultad de M2 y
gasta su novedad en otra cosa —los tramos y el silencio—. M4 es la primera que sube la densidad
a MUCHOS, y ahí recién empieza a doler.

---

# MISIÓN 1 — SAL EN LAS ALAS

*fines de abril de 1982 · mar abierto*

## Ficha

| | |
|---|---|
| `id` | `m1` — índice 0 |
| objetivo | `{ kind: 'distance', meters: 2200 }` — **no hay buque**: la misión termina al llegar |
| clímax | **ninguno**. `climaxDeclarado` devuelve `null` para todo objetivo que no sea `ship` |
| roster | `F5` = TERO · PUMA · GITANO · VASCO · PICHÓN — **5 vidas** |
| `par` | 5000 |
| brief *(ciclo de muerte)* | «Vuelo de adaptación sobre mar abierto. Pegado al agua el radar de ellos no te ve: volvés con sal en las alas.» |

## Configuración del mapa

```js
cfg: C({ sky: 'dawn', wind: false, obstacles: 0.5, bombs: 0, caza: 0, persec: 1 })
```

| Perilla | Valor | Lectura |
|---|---|---|
| `sky` | `dawn` **AMANECER** | la primera salida es de madrugada — y el amanecer es el cielo más legible del set |
| `water` | `sea` | el mar clásico |
| `terrain` | `sea` | mar abierto |
| `wind` | **`false`** ⚑ | **la única misión sin viento de toda la campaña.** El viento le come hasta un 35 % de la velocidad a quien lleva rato arriba; en el tutorial eso sería castigar antes de enseñar |
| `obstacles` | **`0.5`** POCOS ⚑ | mitad de densidad. Hay pasillo que leer, pero se puede fallar |
| `coast` | `230` NORMAL | 230 m de tierra firme antes del mar |
| `bombs` | **`0`** NO ⚑ | no cae nada del cielo |
| `rain` · `fog` · `fogLen` | `0` · `0` · `1` | despejado |
| `squad` | `5` | cinco aviones = cinco vidas |
| `caza` | **`0`** ⚑ | **LA COLA no existe.** Nadie te persigue por detrás |
| `persec` | **`1`** ⚑ | **vuelo de numeral** — la única de las cuatro que lo prende |

⚑ = se aparta del default de `C()`. **Cinco de trece perillas**, todas en la misma dirección:
quitar castigo. M1 es la única misión de la campaña que no tiene ni viento, ni bombas, ni cola.

## Distancia y tiempo

| | |
|---|---|
| distancia | **2200 m** — la más corta de la campaña |
| neutro | **23,3 s** |
| rasante 2 | 19,8 s |
| rasante 3 | 18,4 s |

Sin viento, el avión llega al techo de 150 recién a los 31 s: **M1 termina antes de que el avión
llegue a su velocidad máxima**. Toda la misión transcurre en la parte de la curva donde acelerar
todavía se siente.

## Composición del nivel

Sin `tramos`: la densidad es pareja de punta a punta.

- **El numeral es el nivel.** Con `persec: 1`, el líder vuela adelante y su línea esquiva todo
  lo que viene. Seguirlo *es* leer el pasillo con anticipación — que es la habilidad real del
  juego. Perderlo o chocarlo devuelve señal de muerte, y en campaña eso es relevo, no derrota.
- **La regla del amigo** ([`systems/persec.js`](../../src/systems/persec.js)): al líder no lo
  mata un obstáculo, ni una bala tuya, ni la casualidad de la siembra. La única puerta es
  `caerLider()`, y la llama el guion. Si el líder a veces se comiera un mástil, el jugador
  aprendería a desconfiar de su línea — y ahí el modo entero deja de funcionar.
- **Nada te persigue.** `caza: 0` y `bombs: 0`: todas las amenazas de M1 están **adelante**.
  El jugador aprende a mirar hacia adelante antes de que el juego le pida mirar atrás.

## Mejora que entrega

**Ninguna.** `ofertaTrasMision(0)` devuelve `0` — el banco del Pichón **ni se abre**.

Es una decisión de diseño explícita, no un olvido: antes el banco se abría después de todas las
misiones y siempre con dos cartas, o sea que **la primera decisión del juego caía justo después
del tutorial**, cuando el jugador todavía no sabe qué es una pirueta ni para qué sirve ninguna de
las dos. Elegir sin entender no es elegir: es apretar. Que el tutorial no premie además *dice
algo* — todavía no pasó nada que resolver.

El avión entra a M1 con el **TONEL clásico de fábrica** y nada más.

## Palancas

| Para cambiar | Tocar |
|---|---|
| distancia | `goal.meters` en `missions.js:m1` |
| dificultad del pasillo | `obstacles` (0 · 0.5 · 1 · 1.7) |
| que el tutorial sí entregue mejora | `ofertaTrasMision` en `upgrades.js` — es la única regla del ritmo del banco |
| que el numeral aparezca en otras misiones | `persec: 1` en el `C({...})` de esa misión |
| vidas | `squad` (y `roster`, que debe tener el mismo largo) |

---
## El guion de M1

Seis pantallas de entrada (`storyM1`) y dos de salida (`epiM1`). **Las cuatro primeras son el
prólogo entero** — se juegan una sola vez, antes de la primera misión, y sus prompts ya están
armados en [`PROMPTS_VN_PROLOGO_LISTOS.md`](PROMPTS_VN_PROLOGO_LISTOS.md).

### Entrada — `storyM1`

| # | `img` | Título | Registro | Placa que usa hoy | ¿Necesita cuadro propio? |
|---|---|---|---|---|---|
| 1 | `P1_2` | AÑOS ANTES · UN ARROYO | AIRE | `p1a_arroyo` | ya generada *(prólogo)* |
| 2 | `P2_3` | LA COCINA · MARZO DE 1982 | AIRE | `p2_cocina` | ya generada *(prólogo)* |
| 3 | `P3_4` | LO QUE UN PADRE PUEDE | AIRE | `p3a_telefono` | ya generada *(prólogo)* |
| 4 | `P4_1` | EL CUADERNO DE MATEO | **TIERRA** | `p1c_cuaderno` | ya generada *(prólogo)* |
| 5 | `M1_3` | RÍO GALLEGOS · LA LÍNEA DE VUELO | AIRE | `linea_amanecer` | **no** — placa + tres retratos |
| 6 | `M1_5B` | LA CASADA | AIRE | `m7_foto_frente` | **no** — la placa *es* la foto |

**Pantalla 5 — RÍO GALLEGOS · LA LÍNEA DE VUELO**
> **PUMA:** Bienvenido a la Plata, Tero. Regla número uno: pegado al agua el radar de ellos no te ve. Volás tan bajo que volvés con sal en las alas. Regla número dos: no hay. Con la uno alcanza.
> **GITANO:** Regla dos: el mate lo cebo yo. Regla tres: si no volvés, te lo cebo igual, pero solo. Y cebar solo es tristísimo, así que volvé.
> **VASCO:** *(bajito)* Siempre hacen chistes. Es la manera que tienen de rezar.

Rostros: `puma_neutro` · `gitano_neutro` · `vasco_neutro`.

**Pantalla 6 — LA CASADA**
> **GITANO:** Andá, mirala, Pichón. Está pegada adentro del locker. Esa mujer no es de nadie que esté solo: tiene dueño, y el dueño tiene charreteras.
> **PICHÓN:** ...Es hermosa.
> *El Vasco se persigna, sube la escalerilla y no contesta. Nunca desmiente nada.*
> **CÓNDOR:** Escuadrilla CAUQUÉN, autorizada pista dos. Buen vuelo.

Rostros: `gitano_sonrisa` · `pichon_sonrisa` · *(sin cara)* · `condor_radio`.

**Pantalla 7 — la tarjeta de nivel** *(sin imagen)*
`MISIÓN 1 — SAL EN LAS ALAS` · *Objetivo: dominar el vuelo rasante · Mar abierto*

### Salida — `epiM1`

| # | `img` | Título | Registro | Placa | ¿Cuadro propio? |
|---|---|---|---|---|---|
| 1 | `M1_7` | TODOS VUELVEN | AIRE | `linea_atardecer` | **SÍ** — el Turco pintando estrellitas |
| 2 | `M1_9` | CARTA DE MATEO | **TIERRA** | `p1c_cuaderno` *(debería ser `p4_hoja`)* | **SÍ** — capa de tinta |

**M1_7 — TODOS VUELVEN**
> *Cinco estrellitas nuevas, una por avión. El Turco las pinta con pincel finito y la lengua afuera. No cuenta lo que baja: cuenta lo que vuelve.*
> **EL TURCO:** La estrellita la pinto por vos, no por el avión.
> *Por un rato, esto parece una aventura.*

**M1_9 — CARTA DE MATEO** *(registro TIERRA: birome azul sobre hoja rayada)*
> Viejo: hoy conocí a un tipo, el cabo Correa. Correntino. Le dicen el Colorado. Me vio tiritando y me tiró una media de lana sin decir nada, como quien no quiere la cosa.
> No sé por qué, pero con él cerca tengo menos miedo. ¿Vos lo mandaste, no? No me mientas que te conozco, viejo. Gracias.
> Lo dibujé con capa, como un superhéroe. Te lo guardo para cuando vuelva. Te vas a reír. Mateo.

### Prompts de escena — M1

Los dos cuadros propios de M1. **El bloque de estilo va inline y se pega tal cual** — no editarlo
(ver [`ESTILO_VISUAL.md`](ESTILO_VISUAL.md) §1 para qué hace cada frase).

#### `m1_estrellitas` — el Turco pintando · *cuadro de `M1_7`*

```
Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SCENE: extreme close-up on the nose of a parked 1982 Argentine A-4B Skyhawk at
dusk, seen from the side. The metal skin fills most of the frame. A row of four
small hand-painted white stars is already there, slightly uneven, clearly painted
by hand and not stencilled. A fifth star is half finished and still wet.
A single weathered hand holds a very fine brush against the metal. Only the hand
and forearm are in frame - no face, no head, no body. The sleeve is a stained
mechanic's coverall, rolled to the elbow.
LIGHT: low orange dusk light raking across the metal from the left, long soft
shadow of the brush on the skin. Warm rim on the top edge of the nose.
MOOD: quiet, careful, tender. This is a small ceremony, not maintenance.
FRAMING: horizontal 16:9, the stars in the left third, the hand and brush in the
centre, empty metal on the right for dialogue text to sit over.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern missiles or
guided weapons, no modern avionics or digital displays, no NATO or United States
markings, no invented squadron patches, no digital camouflage.

ABSOLUTELY NO TEXT of any kind anywhere: no serial numbers, no letters, no labels,
no callouts, no arrows, no legend, no watermark, no signature. If you feel the urge
to label anything, leave it blank.
```
**Guardar como:** `assets/plates/m1_estrellitas.png` · *placa AIRE · 16:9*
**Corrección más probable:** si aparece la cara del Turco → `Crop tighter. Only the hand and
forearm are visible. There is no head anywhere in this image.`

#### `m1_colorado` — el dibujo de Mateo · *cuadro de `M1_9`*

Es una **capa de tinta**, no una escena: va encima de la hoja de cuaderno reutilizable.

```
Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SUBJECT: a child-like ballpoint pen drawing, as if drawn by an untrained
19-year-old conscript in a notebook. BLUE BALLPOINT INK ONLY, single colour, thin
scratchy line, visible hatching where he pressed harder, small wobbles in the
line. NOT a polished illustration - the charm is that it is clumsy.
WHAT IS DRAWN: a stocky soldier standing straight and proud, wearing a long cape
that flares behind him like a superhero. Under the cape, an ordinary 1982
Argentine army winter uniform and a wool cap. He holds one wool sock up in one
hand like a trophy. His face is drawn simply: two dots and a wide confident line
of a smile.
The whole drawing is a FLOATING INK LAYER on pure white - no paper texture, no
notebook lines, no background, no shading behind it. It will be composited over a
photographed notebook page.
FRAMING: the figure centred, occupying about 60% of the height, plenty of white
around it.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear.

ABSOLUTELY NO TEXT of any kind anywhere: no letters, no words, no signature, no
watermark. He is drawn, not labelled.
```
**Guardar como:** `assets/plates/m1_colorado.png` · *capa TIERRA · fondo blanco puro, para recortar*
**Corrección más probable:** si sale demasiado bien dibujado → `Make it WORSE. This was drawn by
someone who cannot draw. Shakier line, flatter face, wrong proportions.`

---

# MISIÓN 2 — BAUTISMO DE FUEGO

*1 de mayo de 1982 · costa*

## Ficha

| | |
|---|---|
| `id` | `m2` — índice 1 |
| objetivo | `{ kind: 'distance', meters: 2600 }` — **sin buque** |
| clímax | **ninguno** |
| roster | `F5` — **5 vidas** |
| `par` | 6500 |
| brief | «Primera salida real contra la flota. Ellos tienen la máquina; nosotros, las manos. Rasante o nada.» |

## Configuración del mapa

```js
cfg: C({ bombs: 0.5 })
```

**Una sola perilla apartada del default.** Todo lo demás vuelve a los valores de `C()` — y ese
regreso *es* el salto de dificultad: M1 apagaba cinco cosas, M2 las vuelve a prender todas.

| Perilla | Valor | Cambio respecto de M1 |
|---|---|---|
| `sky` | `dusk` **ATARDECER** | de amanecer a atardecer |
| `wind` | **`true`** ▲ | **se prende el viento.** Hasta −35 % de velocidad sostenida |
| `obstacles` | **`1`** NORMAL ▲ | el doble de densidad que M1 |
| `bombs` | **`0.5`** POCO ▲ ⚑ | empieza a caer cosa del cielo |
| `caza` | **`1`** ▲ | **aparece LA COLA**: el Harrier que te busca por detrás |
| `persec` | **`0`** ▼ | **se apaga el numeral.** Ya no hay línea correcta que seguir |
| `coast` · `rain` · `fog` · `squad` | `230` · `0` · `0` · `5` | igual |

⚑ = apartada del default · ▲ = sube la dificultad respecto de M1 · ▼ = se retira una ayuda

**Cinco cambios de golpe.** Es la misión que más salta de las cuatro, y salta en un nivel que no
tiene buque al final — a propósito: se aprende a sobrevivir sin tener además que acertarle a algo.

## Distancia y tiempo

| | |
|---|---|
| distancia | **2600 m** (+400 sobre M1) |
| neutro | **35,1 s** |
| rasante 2 | 30,0 s |
| rasante 3 | 28,0 s |

**El viento es la mitad del salto.** Sin viento, 2600 m se hacen en ~26 s; con viento, 35. Son
**+50 % de tiempo en el aire** con la misma distancia nominal — y en ese tiempo extra el pasillo
sigue sembrando.

## Composición del nivel

Sin `tramos`: densidad pareja.

- **LA COLA a intensidad 1.** El Harrier entra por detrás y busca el sobrepaso. Corre *solo* en
  el PASILLO; no aparece en ningún clímax.
- **Bombardeo a POCO.** No es una amenaza seria todavía: es el vocabulario. Cuando M4 lo suba a
  NORMAL, el jugador ya sabe qué mira.
- **Sin numeral, sin ayuda.** M2 es la primera vez que el jugador lee el pasillo solo.

## Mejora que entrega

**Una, servida, sin elegir.** `ofertaTrasMision(1)` devuelve `1`.

| | |
|---|---|
| mejora | **TERRAIN MASKING** — `UPGRADES[0]`, id `mask` |
| combo | `abajo abajo-abajo` |
| qué hace | clava el avión a ras: congela el roce y descarga el radar |
| la voz del Pichón | *«Si abajo no nos ven... ¿por qué subimos?»* |

La pantalla del banco es **la misma de siempre, con una sola carta**: se aprende *qué es* el
banco sin tener que decidir todavía. La primera elección real llega en M3, ya con una pirueta en
la mano para comparar.

Es también la primera mejora del **orden causal**: cada maniobra la inventa el Pichón para
resolver el problema que la escuadrilla acaba de sufrir. M2 es la misión donde volvieron todos
raspados — el Terrain Masking es la respuesta a eso.

## Palancas

| Para cambiar | Tocar |
|---|---|
| el salto de dificultad | quitar perillas del `C({...})` de M2 las devuelve al default, que ya es duro |
| que M2 no sirva mejora | `ofertaTrasMision` en `upgrades.js` |
| **cuál** mejora sirve | el **orden** de `UPGRADES` — se sirve siempre la primera no aprendida |
| el viento | `wind: false` — es la perilla que más cambia el tiempo de vuelo |

## El guion de M2

La más corta de la campaña: **una sola pantalla de entrada**.

### Entrada — `storyM2`

| # | `img` | Título | Registro | Placa | ¿Cuadro propio? |
|---|---|---|---|---|---|
| 1 | `M2_1` | LA BRECHA | AIRE | `linea_amanecer` | **SÍ** — la comparación de material |

> *Ellos tienen misiles que piensan solos, radares que ven de noche, Sea Harriers de última generación. Los Fieles tienen aviones con más horas que un colectivo del interior, bombas de otra década y coraje.*
> **PUMA:** Ellos tienen la máquina. Nosotros tenemos las manos. Vamos a volar tan bajo que la máquina no va a poder creer que alguien esté tan loco. Esa incredulidad es toda nuestra ventaja.
> **ESTEBAN:** ¿Y alcanza?
> **PUMA:** No. Pero es lo que hay, y lo que hay lo volamos con todo.

Rostros: *(sin cara)* · `puma_neutro` · `tero_preocupado` · `puma_ceno`.

**Pantalla 2 — tarjeta de nivel:** `MISIÓN 2 — BAUTISMO DE FUEGO` · *1 de mayo de 1982 · Costa*

> ⚠ **Inconsistencia detectada.** La tarjeta dice **«Costa»** pero `cfg.terrain` es `sea`. O la
> tarjeta miente o falta `terrain: 'coast'` en la config. Hay que decidir cuál — ver *Pendientes*.

### Salida — `epiM2`

| # | `img` | Título | Registro | Placa | ¿Cuadro propio? |
|---|---|---|---|---|---|
| 1 | `M2_5` | RASPADOS | AIRE | `hangar_noche` | **SÍ** — el Turco remendando chapa |
| 2 | `M2_8` | CARTA DE MATEO | **TIERRA** | `p1c_cuaderno` | no — texto sobre hoja |

**M2_5 — RASPADOS**
> *Vuelven todos, pero raspados. El Pichón aterriza con el avión agujereado y las manos temblándole.*
> *El Turco lo abraza sin decir nada y se pasa la noche remendando chapa a la luz de un farol. A la mañana, el avión tiene los agujeros parchados y una estrellita nueva.*
> **EL TURCO:** ¿Ves? Esa no es del avión. Es tuya.

**M2_8 — CARTA DE MATEO** *(TIERRA)*
> Pá: hoy comimos una vez. Una. La comida está, pero no llega a nosotros. Hay un subteniente, Bordón, que tiene la carpa llena de cajas. Nosotros afuera, las cajas adentro.
> Igual te cuento una linda: como prohibieron la música en inglés, la radio pasa rock nacional todo el día. Los pibes cantaban en el pozo, pá. Cantábamos para no llorar y al final era lo mismo, pero cantado.
> A mamá contale que comemos bien. Que hay guiso, que hay pan. Contale eso, viejo, aunque sea mentira. Nosotros dos aguantamos la verdad. Mateo.

### Prompts de escena — M2

#### `m2_brecha` — la desproporción · *cuadro de `M2_1`*

```
Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SCENE: a 1982 Argentine A-4B Skyhawk on a cold windswept airfield apron at dusk,
seen three-quarter from the front-left, filling the frame. The aircraft is
visibly OLD and hard-used: paint chalked and faded, panel lines dark with grease,
mismatched touch-up patches on the fuselage, a small dent near the intake, oil
streaking back from a panel. Under the wing hangs one plain iron free-fall bomb
of an older generation - blunt, unpainted, no guidance fins, no seeker head.
Two mechanics in stained coveralls work at the undercarriage with ordinary hand
tools and a wooden stepladder. They are small in frame; the aircraft dominates.
LIGHT: cold flat dusk, low grey-blue, a single yellow work lamp on a stand
throwing a warm pool under the wing. The contrast between the cold sky and that
one warm lamp is the point.
MOOD: not heroic. Tired, worn, stubborn. A machine kept alive by hand.
FRAMING: horizontal 16:9, the aircraft nose in the left two thirds, open dusk sky
on the right for dialogue text.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern missiles or
guided weapons, no modern avionics or digital displays, no NATO or United States
markings, no invented squadron patches, no digital camouflage. The bomb must look
like a dumb iron bomb from the 1960s.

ABSOLUTELY NO TEXT of any kind anywhere: no serial numbers, no letters, no labels,
no callouts, no arrows, no legend, no watermark, no signature. If you feel the urge
to label anything, leave it blank.
```
**Guardar como:** `assets/plates/m2_brecha.png` · *placa AIRE · 16:9*
**Corrección más probable:** si el avión sale limpio y nuevo → `The aircraft is too clean. Add
chalked faded paint, mismatched touch-up patches, oil streaks and grease in the panel lines. This
aircraft has flown more hours than it should have.`

#### `m2_remiendo` — la noche del Turco · *cuadro de `M2_5`*

```
Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SCENE: night inside an open hangar. A 1982 Argentine A-4B Skyhawk wing seen from
close, angled across the frame. The wing skin is punched through with a scatter of
small ragged holes; two of them are already covered with fresh unpainted metal
patches and a line of rivets. Sheet-metal offcuts, a rivet gun and a tin of
primer sit on a wooden crate under the wing.
A single kerosene lamp hangs from the wing itself and is the ONLY light source:
everything falls off to deep blue-black within a few metres. The holes that are
not yet patched read as black punctures against the lit skin.
NO PEOPLE in frame. The work is happening, the worker is not shown.
MOOD: patient, solitary, night-shift. Somebody stayed up.
FRAMING: horizontal 16:9, the wing running from lower-left to upper-right, the
lamp and its pool of light in the centre, dark hangar depth on the right for
dialogue text.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern tools, no
battery power tools, no LED lighting, no modern markings.

ABSOLUTELY NO TEXT of any kind anywhere: no serial numbers, no letters, no labels,
no callouts, no arrows, no legend, no watermark, no signature. If you feel the urge
to label anything, leave it blank.
```
**Guardar como:** `assets/plates/m2_remiendo.png` · *placa AIRE · 16:9*
**Corrección más probable:** si mete al mecánico → `Remove every person. The hangar is empty. Only
the wing, the lamp and the tools.`

---

# MISIÓN 3 — EL DÍA QUE SANGRÓ EL MAR

*4 de mayo de 1982 · HMS SHEFFIELD*

## Ficha

| | |
|---|---|
| `id` | `m3` — índice 2 |
| objetivo | `{ kind: 'ship', ship: 'HMS SHEFFIELD', dist: 2600 }` — **la primera con buque** |
| clímax declarado | `pasada` *(el default de toda misión con buque)* |
| clímax que se juega hoy | **EL PULSO** — `pasada` está en cuarentena |
| roster | `F5` — **5 vidas** |
| `par` | 7500 |
| brief | «La Task Force navega al este de las islas. Un destructor Tipo 42 cubre la pantalla de radar de la flota. Volá bajo: su radar no distingue un blanco pegado al agua.» |

## Configuración del mapa

```js
cfg: C({ bombs: 0.5 })
```

**Idéntica a M2.** Es la única de las cuatro que no sube ni una perilla respecto de la anterior —
a propósito: M3 gasta toda su novedad en otras dos cosas, los **tramos** y el **buque**. Subir
además la densidad habría enterrado las dos.

| Perilla | Valor | Cambio respecto de M2 |
|---|---|---|
| todas | iguales | **ninguno** |

## Distancia y tiempo

| | |
|---|---|
| distancia | **2600 m** hasta el buque |
| neutro | **35,1 s** |
| rasante 2 | 30,0 s |
| rasante 3 | 28,0 s |

Más el clímax: EL PULSO **nunca pasa de ~10 s** (`PULSO.T_BEAT` × `BARS`), más `REENCARE_T` de
3,4 s por cada fallo.

## Composición del nivel — **los tramos**

M3 es **la primera misión con `tramos`**, el sistema que parte el pasillo en segmentos con
config propia ([`docs/sistemas/SPEC_TRAMOS.md`](../sistemas/SPEC_TRAMOS.md)).

| Tramo | `hasta` | Metros | `obstacles` | `caza` | `bombs` | Radio |
|---|---|---|---|---|---|---|
| 1 | 0.09 | 0 – 234 | **0** | 0 | 0 | `m4_radio1` |
| 2 | 0.18 | 234 – 468 | **0** | 0 | 0 | `m4_radio2` |
| 3 | 0.27 | 468 – 702 | **0** | 0 | 0 | `m4_radio3` |
| 4 | 0.35 | 702 – 910 | **0** | 0 | 0 | `m4_radio4` |
| 5 | 1.00 | 910 – 2600 | **1.2** | 1 | *(hereda)* | — |

*(los nombres de las claves de radio dicen `m4_` por el numerado viejo del guion — apuntan a M3)*

### **EL TRÁNSITO DEL NARWAL** — el primer tercio, en silencio

Los cuatro primeros tramos son **el mismo tramo repetido cuatro veces**, idénticos salvo la línea
de radio. Los primeros **910 metros — un 35 % de la misión — no tienen un solo enemigo en
pantalla.** El jugador solo vuela y escucha:

> **CÓNDOR:** ANOTO POSICIONES. DOS AL NORESTE, RUMBO SUR.
> **GITANO:** ¿DE DÓNDE SACÁS VOS TODO ESO, CÓNDOR?
> **CÓNDOR:** DE UN BARCO PESQUERO LLAMADO NARWAL.
> **PUMA:** NO SON MILITARES. Y ESTÁN MÁS ADENTRO QUE NOSOTROS.

**Por qué cuatro tramos y no uno:** una radio suena **una sola vez por tramo** (RF-03). Repartir
la conversación en cuatro entradas es lo que la convierte en conversación y no en un cartel.

**Por qué `obstacles: 0` y no una densidad baja:** el criterio del guion es *cero* enemigos, y
una densidad chica igual siembra cada doscientos metros. Con `bombs: 0` además no cae nada del
cielo — un bombardeo durante el tramo mudo contradice la escena tanto como una fragata.

**Por qué importa:** el Narwal se planta acá, liviano y sin subrayado, **para que el cobro en M5
no se vea venir**. Es una siembra narrativa hecha con perillas de nivel.

### El contraste

El tramo 5 salta de `0` a **`1.2`** de golpe — *por encima* del NORMAL del resto de la misión — y
enciende LA COLA. **El silencio se cobra en el contraste**: los 1690 m restantes se sienten más
poblados de lo que serían si la misión entera hubiera estado a 1.2.

## El clímax

| | |
|---|---|
| declarado en `missions.js` | `pasada` *(default, se puede omitir)* |
| se juega | **EL PULSO** |
| por qué | `CLIMAX_EN_CUARENTENA = ['arena', 'pasada']` desde el 18/8/2026 |

**La cuarentena no pisa el dato.** La misión sigue declarando lo suyo; levantar la cuarentena es
sacar una entrada de [`cuarentena.js`](../../src/data/cuarentena.js) y la campaña vuelve sola a
lo que decía. Reescribir los renglones habría borrado la decisión del autor.

### EL PULSO en dos líneas

Al final del pasillo el tiempo se dilata (`SLOW: 0.08` — el mundo casi detenido, pero el mar
sigue brillando), la cámara entra a la cabina y el juego pide **teclear una secuencia contra
reloj**. Las dos reglas que lo gobiernan:

1. **El input es vocabulario aprendido.** Ningún compás se inventa: cada uno es la secuencia real
   de una pirueta del juego. En campaña **solo salen las piruetas que el jugador tiene
   aprendidas** — el examen final toma lo que el juego enseñó.
2. **Cada compás tiene nombre diegético.** El rótulo es el nombre de la maniobra, así que no se
   teclea «abajo-izquierda-izquierda»: se *vuela* un BREAK TURN.

| Perilla | Valor | Qué significa en M3 |
|---|---|---|
| `BARS` | `[2, 4]` | M3 está al principio de la campaña → **2 compases** |
| `T_BEAT` | `[2.2, 1.1]` | **2,2 s por compás** en M3; baja a 1,1 al final de la campaña |
| `ERR_LV` | `0.3` | hasta el 30 % del avance de campaña **se perdona un error**. M3 entra |
| `TRIES` | `3` | 1º fallo cuesta una vuelta · 2º una vida del escuadrón · 3º es derrota |
| `FLAK_T` | `[1, 0.92, 0.85]` | cada fallo achica el margen del compás — el costo del error, hecho número |

⚠ **En M3 el jugador tiene una sola pirueta** (TERRAIN MASKING, servida tras M2). El PULSO saca
sus compases del vocabulario aprendido: con un solo verbo, los dos compases de M3 son
necesariamente el mismo. **Verificar jugando si eso se lee como intencional o como pobreza.**

## Mejora que entrega

**Dos cartas, a elegir una.** `ofertaTrasMision(2)` devuelve `2` — acá empieza el roguelike, con
una pirueta ya en la mano para comparar.

| | Carta A | Carta B |
|---|---|---|
| mejora | **SPLIT-S** | **BREAK TURN** |
| id | `splits` | `breakt` |
| combo | `arriba abajo abajo (alto)` | `abajo izq izq` / `abajo der der` |
| qué hace | medio tonel y picada: la salida vertical hacia abajo | viraje quebrado: tirón lateral violento |
| la voz del Pichón | *«Necesitaba una forma de irse para abajo YA.»* | *«La escolta casi nos engancha de costado.»* |

Son las dos siguientes del **orden causal**, y las dos responden a lo que acaba de pasar en el
nivel: la escolta y el tener que irse.

## Palancas

| Para cambiar | Tocar |
|---|---|
| el largo del silencio | los `hasta` de los cuatro primeros tramos (hoy 0.35 = 35 % del nivel) |
| que el silencio se rompa antes | `obstacles` del tramo 4 |
| el contraste | `obstacles: 1.2` del tramo 5 |
| el diálogo del Narwal | claves `m4_radio1`…`m4_radio4` en `strings.js` |
| que juegue PASADA de verdad | sacar `'pasada'` de `CLIMAX_EN_CUARENTENA` |
| la dureza del PULSO | `BARS`, `T_BEAT`, `TRIES` en `pulso.js` |
| qué buque | `goal.ship` — el string tiene que estar en `SHIPS` |

## El guion de M3

### Entrada — `storyM3`

| # | `img` | Título | Registro | Placa | ¿Cuadro propio? |
|---|---|---|---|---|---|
| 1 | `M3_1` | 4 DE MAYO | AIRE | `linea_amanecer` | **SÍ** — la noticia por radio |
| 2 | `M3_2` | LA GAMBETA | AIRE | `hangar_dia` | no — placa + retratos |

**M3_1 — 4 DE MAYO**
> *El día que el mundo se enteró de que la flota más poderosa podía sangrar: un misil argentino alcanza a un destructor británico.*
> **GITANO:** ¡Le dimos! ¡A la Royal Navy le dimos, muchachos! ¡Argentina, carajo!
> **PUMA:** Veinte marinos, Gitano. Del otro lado hay pibes iguales a nosotros que hoy no vuelven. Alegrate de que nosotros sí. Y callate un minuto por los que no.

Rostros: *(sin cara)* · `gitano_sonrisa` · `puma_ceno`.
**Es la pantalla que enseña el tono del juego.** Puma corta la celebración, y el jugador aprende
en qué registro está parado.

**M3_2 — LA GAMBETA**
> **GITANO:** *(después del minuto, casi para sí)* Algún día se la vamos a ganar en algo que no mate a nadie. Un pibe nuestro va a agarrar una pelota y los va a gambetear a todos. A TODOS, Puma. Y ese día va a ser más grande que éste.
> **PUMA:** Ojalá la única guerra que nos quede sea esa.
> *Orden de misión: ataque rasante a la escolta. Hoy sienten miedo ellos.*

Rostros: **`gitano_risa_apagada`** ← *la cabeza que ninguna otra hoja tiene: el medio segundo en
que la sonrisa cae y aparece el pibe que fue* · `puma_neutro`.

**Pantalla 3 — tarjeta:** `MISIÓN 3 — EL DÍA QUE SANGRÓ EL MAR` · *4 de mayo de 1982 · HMS SHEFFIELD*

### Salida — `epiM3`

| # | `img` | Título | Registro | Placa | ¿Cuadro propio? |
|---|---|---|---|---|---|
| 1 | `M3_6` | PRIMERA GRAN VICTORIA | AIRE | `linea_atardecer` | **SÍ** — Puma apartado mirando el mar |
| 2 | `M3_8` | CARTA DE MATEO | **TIERRA** | `p1c_cuaderno` | no |
| 3 | `M3_HIST` | HMS SHEFFIELD · 4 MAYO 1982 | **HISTÓRICA** | `radio` | **SÍ** — placa documental |

**M3_6 — PRIMERA GRAN VICTORIA**
> *En la base hay abrazos, alguien descorcha algo. En la radio quedó grabado el pánico inglés: "Low level! Low level! Here they come again!"*
> *Puma se aparta y se queda mirando el mar, sin sonreír. Cuando Puma no sonríe, hay que preocuparse.*

**M3_8 — CARTA DE MATEO** *(TIERRA)*
> ¡Viejo! Llegó la noticia del Sheffield y por primera vez vi a los pibes levantar la cabeza. El Colorado me apretó el hombro: "tu viejo anda ahí arriba, pibe. Seguro anda por ahí".
> ¿Eras vos? No me contestes. Prefiero creer que sí.
> Y te cuento algo que no te dije en la despedida: cuando salga de acá me anoto en la escuela de aviación, pá. Quiero volar con vos. Quiero que un día la escuadrilla sea "Aldao y Aldao".
> Cuidate mucho. Volá bajo, como me enseñaste. Yo te espero acá, pegadito a la tierra. Mateo.

**M3_HIST — HMS SHEFFIELD · 4 MAYO 1982** *(registro HISTÓRICO — cifras reales)*
> Un Super Étendard de la Armada Argentina lanzó un misil Exocet que impactó el casco del destructor.
> Murieron 20 tripulantes. El fuego obligó a abandonar el buque.
> Fue el primer buque de guerra británico perdido en acción desde la Segunda Guerra Mundial.

### Prompts de escena — M3

#### `m3_noticia` — la radio en la línea de vuelo · *cuadro de `M3_1`*

```
Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SCENE: a battered 1960s valve radio set sitting on an upturned wooden ammunition
crate on a windswept airfield apron, seen close and slightly from above. Bakelite
case, cloth speaker grille, two big round knobs, a bent wire aerial. A tin mug of
mate with a metal straw sits beside it, steam rising. A folded wool blanket is
draped over the crate.
Behind and out of focus, the blurred grey shapes of parked aircraft and a windsock
standing straight out in the wind.
LIGHT: cold flat overcast daylight, no sun. Everything is grey-blue except the
warm brown of the gourd and the amber glow behind the radio dial - the only two
warm points in the frame.
MOOD: the moment before news. Ordinary objects, about to matter.
FRAMING: horizontal 16:9, radio and mate in the lower-left third, empty grey
apron and sky filling the right for dialogue text.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no transistor boombox,
no digital display, no modern branding, no NATO or United States markings.

ABSOLUTELY NO TEXT of any kind anywhere: no dial markings, no letters, no labels,
no callouts, no arrows, no legend, no watermark, no signature. Leave the radio
dial blank.
```
**Guardar como:** `assets/plates/m3_noticia.png` · *placa AIRE · 16:9*
**Corrección más probable:** si le escribe números al dial → `The radio dial must be completely
blank. No numbers, no letters, no markings of any kind on it.`

#### `m3_puma_solo` — el que no festeja · *cuadro de `M3_6`*

```
Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SCENE: the back of one broad, heavy-set man standing alone at the edge of a cliff
above a grey southern sea at dusk. He wears a 1982 Argentine flight suit with the
top half peeled down and tied at the waist over an olive undershirt; a flight
helmet hangs from one hand at his side. Shoulders square, feet planted, perfectly
still. HIS FACE IS NOT VISIBLE - we see him only from behind.
He is small in the frame; the sea and the sky are large.
Far behind him, tiny and out of focus, the warm lit doorway of a hangar with
indistinct celebrating figures - just silhouettes and light, no faces, no detail.
LIGHT: the dusk sky is banded orange to deep blue; the sea below is dark and
choppy. He is a dark silhouette rimmed in orange along one shoulder.
MOOD: the wrong reaction. Everyone else is celebrating; he is counting.
FRAMING: horizontal 16:9, the figure on the left third at the cliff edge, the open
sea and sky filling the right two thirds for dialogue text.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear.

ABSOLUTELY NO TEXT of any kind anywhere: no letters, no labels, no callouts, no
arrows, no legend, no watermark, no signature.
```
**Guardar como:** `assets/plates/m3_puma_solo.png` · *placa AIRE · 16:9*
**Corrección más probable:** si le gira la cara → `He is seen from BEHIND only. His face does not
appear anywhere in this image. Turn him fully away from camera.`

#### `m3_hist_sheffield` — la placa histórica · *cuadro de `M3_HIST`*

> ⚠ **Sin prompt: falta una decisión.** Las placas históricas son el único registro del juego
> cuyo tratamiento visual **nunca se definió**. Son cifras reales sobre muertos reales, y hay dos
> caminos incompatibles: pixel art como todo lo demás (coherente, pero estetiza un dato duro), o
> un registro aparte —tipografía sobre negro, o fotografía de archivo tratada— que se lea como
> documento y no como juego. **Hasta que se decida, no se generan.** Hoy caen en la placa `radio`,
> que funciona pero no dice nada. Lo mismo vale para `M4_HIST` y las seis restantes.

---

# MISIÓN 4 — EL CALLEJÓN DE LAS BOMBAS

*21 de mayo de 1982 · HMS ARDENT*

## Ficha

| | |
|---|---|
| `id` | `m4` — índice 3 |
| objetivo | `{ kind: 'ship', ship: 'HMS ARDENT', dist: 2600 }` |
| clímax declarado | **`arena`** — declarado a mano, no es el default |
| clímax que se juega hoy | **EL PULSO** — `arena` está en cuarentena |
| roster | `F5` — **5 vidas** |
| `par` | 8500 |
| brief | «Los británicos desembarcaron en San Carlos. Las fragatas cubren la cabecera de playa desde el estrecho. El pasillo es angosto y está erizado de antiaérea.» |

## Configuración del mapa

```js
cfg: C({ sky: 'cloudy', obstacles: 1.7 })
climax: 'arena'
```

| Perilla | Valor | Cambio respecto de M3 |
|---|---|---|
| `sky` | **`cloudy`** NUBLADO ⚑ | de atardecer a nublado: el cielo del desembarco |
| `obstacles` | **`1.7`** MUCHOS ▲ ⚑ | **el tope de la escala.** Primera vez en la campaña |
| `bombs` | **`1`** NORMAL ▲ | vuelve al default: de POCO a NORMAL |
| `wind` `caza` `squad` `coast` | `true` `1` `5` `230` | igual |
| `rain` `fog` `fogLen` | `0` `0` `1` | igual |

⚑ = apartada del default · ▲ = sube respecto de M3

**M4 es la primera que duele.** M2 hizo el salto de *ayuda* a *sin ayuda*; M4 hace el de *normal*
a *saturado*. Y `1.7` no es un escalón intermedio: es el máximo que la perilla admite. De acá en
adelante, **las ocho misiones restantes vuelan todas a `1.7`** — M4 fija el piso de densidad del
resto de la campaña.

## Distancia y tiempo

| | |
|---|---|
| distancia | **2600 m** — igual que M2 y M3 |
| neutro | **35,1 s** |
| rasante 2 | 30,0 s |
| rasante 3 | 28,0 s |

**La distancia no cambia desde M2; lo que cambia es lo que hay adentro.** Tres misiones seguidas
de 2600 m con densidades de 1, 1.2 y 1.7: la rampa de M2→M4 está hecha **de contenido, no de
largo**. La distancia recién vuelve a moverse en M5 (2800 m).

## Composición del nivel

Sin `tramos`: densidad pareja de `1.7` de punta a punta.

- **Densidad al tope + bombardeo NORMAL + la cola.** Las tres fuentes de amenaza prendidas juntas
  y ninguna al mínimo. Es la primera configuración «completa» de la campaña.
- **El nombre es la mecánica.** «El Callejón de las Bombas» era el apodo real del estrecho de San
  Carlos, y `obstacles: 1.7` es la traducción literal: un pasillo tan sembrado que se vuelve
  angosto sin que las paredes se muevan.
- **El clímax declarado es ARENA, y ahí está el porqué.** El callejón **es** un arena: agua
  encerrada entre cerros con el buque fondeado. Es una de las **dos únicas misiones** de toda la
  campaña que lo declaran (la otra es M12, EL TERO). La regla de la campaña, dicha por el autor:
  *la mayoría de los niveles con buque son PASILLO + PASADA; el ARENA queda para las ocasionales.*

## El clímax

| | |
|---|---|
| declarado | **`arena`** — decisión explícita de autor, escrita a mano en el renglón de la misión |
| se juega | **EL PULSO** — `arena` está en `CLIMAX_EN_CUARENTENA` desde el 18/8/2026 |

El ARENA cambia el modelo de vuelo entero: en el pasillo `y` es una altura de scroll con techo;
en el arena el jugador **comanda ángulos**. Los números viven en
[`data/arena.js`](../../src/data/arena.js) — `PITCH_MAX: 0.9` (±51,6°), `ROLL_MAX: 1.4` (80°),
`SPD_CRUISE: 110`. Es otro juego durante un minuto.

Mientras dure la cuarentena, M4 juega EL PULSO con los mismos parámetros que M3 salvo uno: el
jugador llega con **tres piruetas** en vez de una (la servida de M2 + la elegida de M3 + la de
M4), así que los compases pueden ser distintos entre sí. **M4 es la primera vez que EL PULSO
tiene vocabulario de verdad.**

## Mejora que entrega

**Dos cartas, a elegir una.** `ofertaTrasMision(3)` devuelve `2`.

Cuáles dos **depende de lo que el jugador eligió en M3** — son las dos siguientes no aprendidas
del orden causal:

| Si en M3 eligió… | En M4 se le ofrecen |
|---|---|
| **SPLIT-S** | **BREAK TURN** *(la que dejó)* y **LOW YO-YO** |
| **BREAK TURN** | **SPLIT-S** *(la que dejó)* y **LOW YO-YO** |

| | |
|---|---|
| **LOW YO-YO** | id `loyo` · combo `abajo arriba abajo` |
| qué hace | pica y remonta: altura convertida en velocidad |
| la voz del Pichón | *«Salir vivo es cuestión de nudos.»* |

Al entrar a M4 el jugador tiene **3 mejoras** (`loadoutAt(3)`). Con 12 mejoras y 10 ventanas de
entrega, **dos quedan sin aprender por partida**.

## Palancas

| Para cambiar | Tocar |
|---|---|
| que M4 no sea el salto | `obstacles: 1.7` → `1` — pero entonces la campaña no tiene su primera pared |
| que juegue ARENA de verdad | sacar `'arena'` de `CLIMAX_EN_CUARENTENA` — el dato ya está declarado |
| el modelo de vuelo del arena | `AR` en `data/arena.js` |
| el cielo | `sky: 'cloudy'` — el único apartado del default acá |
| qué mejoras salen | el **orden** de `UPGRADES`; se ofrecen siempre las primeras no aprendidas |

## El guion de M4

### Entrada — `storyM4`

| # | `img` | Título | Registro | Placa | ¿Cuadro propio? |
|---|---|---|---|---|---|
| 1 | `M4_1` | SAN CARLOS | AIRE | `linea_amanecer` | **SÍ** — el estrecho visto desde arriba |
| 2 | `M4_2` | POR EL HIJO DE ALGUIEN | AIRE | `hangar_dia` | no — placa + retratos |

**M4_1 — SAN CARLOS**
> *Los británicos desembarcan. El estrecho se vuelve una trampa de fuego antiaéreo que los propios pilotos bautizan, con humor de velorio, el Callejón de las Bombas. Hay que entrar ahí. Todos los días.*
> **PUMA:** Es la boca del lobo. Entramos, soltamos, salimos. Nadie se hace el héroe: los héroes no llegan a cebar el mate de la tarde.

Rostros: *(sin cara)* · `puma_neutro`.

**M4_2 — POR EL HIJO DE ALGUIEN**
> **ESTEBAN:** Puma. Mi hijo está en tierra. Cerca de acá.
> **PUMA:** Lo sé, Tero. Todos tenemos a alguien abajo. Cada barco que tocamos es una bomba menos cayéndole a los pibes. Volás por tu hijo. Volamos todos por el hijo de alguien.
> **GITANO:** ¿Vieron que hicieron un festival allá en Buenos Aires? Juntaron montañas de cosas para los pibes. Chocolates, cigarrillos, abrigo... Y nada. Eso digo. Juntaron.

Rostros: `tero_preocupado` · `puma_ceno` · **`gitano_ceno`** ← *si el Gitano está serio, algo
pasa: es el presagio más barato del juego, y acá se usa para plantar lo que no llegó.*

**Pantalla 3 — tarjeta:** `MISIÓN 4 — EL CALLEJÓN DE LAS BOMBAS` · *21 de mayo de 1982 · HMS ARDENT*

### Salida — `epiM4`

| # | `img` | Título | Registro | Placa | ¿Cuadro propio? |
|---|---|---|---|---|---|
| 1 | `M4_EPI` | EL PRECIO | AIRE | `linea_atardecer` | **SÍ** — el tren colgando |
| 2 | `M4_CARTA` | CARTA DE MATEO | **TIERRA** | `p1c_cuaderno` | no |
| 3 | `M4_HIST` | HMS ARDENT · 21 MAYO 1982 | **HISTÓRICA** | `radio` | pendiente de decisión |

**M4_EPI — EL PRECIO**
> *El Ardent arde. Victoria. Pero el avión del Vasco vuelve rozando el mar, con el tren de aterrizaje colgando como una pata quebrada. Toca pista de milagro.*
> *Esa noche nadie hace chistes. El Turco no pinta la estrellita del Vasco hasta el otro día, porque le temblaba el pulso.*

**M4_CARTA — CARTA DE MATEO** *(TIERRA)*
> Pá: hoy vi caer un avión nuestro a lo lejos. Recé para que no fueras vos y después me sentí una basura, porque el que cayó también era el hijo de alguien.
> Bordón hizo estaquear a dos pibes por "robar" comida. La comida era nuestra, pá. Los ató al descampado con este frío. Uno era el jujeño de la radio.
> ¿Esto es la guerra o es otra cosa? Contra los ingleses todavía no disparé un tiro, pero contra el frío, el hambre y Bordón peleamos todos los días. Mateo.

> **El eco.** «También era el hijo de alguien» de Mateo contesta, sin saberlo, al «volamos todos
> por el hijo de alguien» de Puma **de la misión anterior a esta misma pantalla**. Padre e hijo
> llegan a la misma frase por caminos opuestos y ninguno se entera. Es el mejor par del guion —
> **no separar estas dos pantallas si se reordena la campaña.**

**M4_HIST — HMS ARDENT · 21 MAYO 1982** *(cifras reales)*
> La fragata fue atacada en oleadas sucesivas mientras cubría el desembarco en San Carlos.
> Murieron 22 tripulantes. Se hundió al día siguiente.
> Su comandante fue el último en abandonarla.

### Prompts de escena — M4

#### `m4_estrecho` — el callejón · *cuadro de `M4_1`*

```
Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SCENE: a narrow sea strait seen from high above and ahead, looking down its
length. Bare treeless hills of brown moorland and grey rock rise steeply on BOTH
sides, squeezing the grey water into a corridor that runs away into haze. The
water is dark, wind-scuffed, no waves breaking.
Scattered along the strait, small and low in the frame, are the grey angular
shapes of anchored warships and landing craft - read as silhouettes only, no
detail, no flags, no markings. Thin white wakes trail from a few of them. A
handful of small dirty black airburst puffs hang in the air above the water at
low altitude, drifting.
LIGHT: flat cold overcast, no sun, no shadows. The whole frame is grey-brown and
grey-blue. The only saturated colour is the dirty black-brown of the flak bursts.
MOOD: a trap seen from the entrance. Narrow, cold, waiting.
FRAMING: horizontal 16:9, the strait running from the bottom edge into the centre
distance, hills filling both sides, pale hazy sky across the top third for
dialogue text.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern missiles or
guided weapons, no modern vessels, no NATO or United States markings, no flags,
no invented insignia.

ABSOLUTELY NO TEXT of any kind anywhere: no letters, no labels, no callouts, no
arrows, no legend, no watermark, no signature.
```
**Guardar como:** `assets/plates/m4_estrecho.png` · *placa AIRE · 16:9*
**Corrección más probable:** si abre demasiado el estrecho → `The strait must feel NARROW. Bring
the hills much closer together, so the water is a corridor and not a bay.`

#### `m4_tren_roto` — el precio · *cuadro de `M4_EPI`*

```
Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SCENE: close on the main landing gear leg of a parked 1982 Argentine A-4B Skyhawk,
seen from low and to the side, at dusk. The leg is BENT and hangs wrong - twisted
outward at the knee, the wheel canted at an ugly angle, hydraulic lines torn and
dangling, a dark stain spreading on the concrete beneath it. The gear door is
crumpled.
The rest of the aircraft looms above and out of frame; we see only the belly, the
broken leg, and the concrete.
NO PEOPLE. A single fire extinguisher on a trolley stands abandoned nearby.
LIGHT: last orange dusk light low and level from the left, throwing a long
distorted shadow of the bent leg across the wet concrete. Everything else in deep
blue shadow.
MOOD: aftermath. Nobody is celebrating. Something nearly went very badly.
FRAMING: horizontal 16:9, the broken gear leg in the left third, wet reflective
concrete and its long shadow filling the right for dialogue text.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear.

ABSOLUTELY NO TEXT of any kind anywhere: no serial numbers, no letters, no labels,
no callouts, no arrows, no legend, no watermark, no signature.
```
**Guardar como:** `assets/plates/m4_tren_roto.png` · *placa AIRE · 16:9*
**Corrección más probable:** si dibuja el tren sano → `The landing gear leg is BROKEN. Bend it
outward at the knee, cant the wheel at a wrong angle, tear the hydraulic lines. It must look like
a broken animal leg.`

---

# Los rostros del diálogo · M1 a M4

**Los prompts y el procedimiento viven en
[`PROMPTS_RETRATOS_LISTOS.md`](PROMPTS_RETRATOS_LISTOS.md)**, que genera
[`tools/hacer_prompts_retratos.py`](../../tools/hacer_prompts_retratos.py) — **los ids válidos
salen de ahí**: `python3 tools/hacer_prompts_retratos.py --ids` los lista todos. Ese documento se reescribió el 24/8
sobre las láminas finales, y trae el hallazgo que cambia el trabajo: **las láminas de
`characters_examples/final/` ya traen dibujadas las tiras de expresiones** — unos 25 de los 38
retratos existen y solo hay que cosecharlos con `tools/install_retratos.py`.

Acá queda únicamente **qué cara pide cada línea de M1 a M4**:

| Pantalla | Personaje | `cara:` | ¿ya existe? |
|---|---|---|---|
| P3_4 · M2_1 · M4_2 | ESTEBAN | `tero_preocupado` | ✅ en `tero3` |
| M1_5B *(Cóndor)* · P3_4 | CÓNDOR | `condor_radio` | ❌ generar |
| M1_3 · M3_2 · M4_1 | PUMA | `puma_neutro` | ✅ en `puma` |
| M3_1 · M4_2 | PUMA | `puma_ceno` | ✅ en `puma` |
| M1_3 | GITANO | `gitano_neutro` | ✅ en `gitano` |
| M1_5B · M3_1 | GITANO | `gitano_sonrisa` | ✅ en `gitano` |
| M4_2 | GITANO | `gitano_ceno` | ❌ generar — **el presagio** |
| M3_2 | GITANO | `gitano_risa_apagada` | ❌ generar — la sonrisa a mitad de caerse |
| M1_3 | VASCO | `vasco_neutro` | ✅ en `vasco2` |
| M1_5B | PICHÓN | `pichon_sonrisa` | ✅ en `pichon3` |
| M1_7 · M2_5 | TURCO | `turco_sonrisa` | ❌ generar |
| P2_3 | MATEO | `mateo_sonrisa` · `mateo_neutro` | ✅ en `mato32` *(cabezas sueltas)* |

**De las doce caras que piden las cuatro primeras misiones, ocho ya están dibujadas.** Las cuatro
que faltan son `condor_radio`, `gitano_ceno`, `gitano_risa_apagada` y `turco_sonrisa`.

> **Y una que el guion de M1–M4 todavía no usa pero debería:** `mato32` trae a Mateo en **dos
> estados** —recién llegado (rapado, limpio) y después de semanas en la isla (pelo crecido,
> embarrado, ojeroso)—. Las cartas de M1 y las de M8 no las escribe el mismo chico, y el arte ya
> lo distingue aunque el guion todavía no.

---

# Pendientes que salieron de armar esto

Cosas que este repaso destapó y que **no** se tocaron:

| # | Qué | Dónde | Por qué importa |
|---|---|---|---|
| 1 | **La tarjeta de M2 dice «Costa» y `cfg.terrain` es `sea`** | `strings.js` `storyM2` vs `missions.js` m2 | o la tarjeta miente o falta `terrain: 'coast'`. Es la única contradicción dato↔texto de las cuatro |
| 2 | **Las placas históricas no tienen tratamiento visual definido** | `M3_HIST`, `M4_HIST` y 6 más | son cifras reales sobre muertos reales; pixel art las estetiza. Sin decidir esto no se pueden generar |
| 3 | **`p4_hoja` sigue sin generarse** | `PROMPTS_PLACAS.md` B1 | es la hoja vacía reutilizable: **las 11 cartas de Mateo la usan**. Hoy caen en `p1c_cuaderno`, que tiene el cuaderno dibujado adentro de la escena |
| 4 | **EL PULSO en M3 tiene un solo verbo** | `pulso.js` + `loadoutAt(2)` | el jugador llega con una sola pirueta, así que los dos compases de M3 son forzosamente el mismo. Verificar jugando si se lee como intención o como pobreza |
| 5 | **Falta decidir `esteban_joven_calido`** | P1_2 | ver arriba |
| 6 | **Las claves de radio de M3 se llaman `m4_radio*`** | `strings.js` + `missions.js:84-87` | resto del numerado viejo del guion. Renombrar es mecánico pero toca dos archivos y ninguna prueba lo cubre |
| 7 | **No separar M4_2 de M4_CARTA** | `strings.js` | «volamos todos por el hijo de alguien» / «también era el hijo de alguien». Si la campaña se reordena, ese par se rompe sin que nada avise |
