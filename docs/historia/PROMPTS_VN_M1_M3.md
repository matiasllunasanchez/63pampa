# PROMPTS VN — M1 · M2 · M3 *(placas, sin personajes)*

> # ⛔ NO COPIES PROMPTS DE ESTE ARCHIVO
> Este documento es **de trabajo**: tiene tokens entre llaves (`{HOJA}`, `{MANO_DE_MATEO}`,
> `{TERITO}`, `{BIROME}`…) que **no se pegan tal cual** en el generador de imágenes.
> Sirve para discutir y corregir el criterio, no para producir.
>
> **Los prompts listos para copiar y pegar están en:**
> - `historia/PROMPTS_AIRE_LISTOS.md` — todo lo que es pixel art a color (placas y retratos)
> - `historia/PROMPTS_TIERRA_LISTOS.md` — todo lo que es cuaderno / birome (P.1 y las cartas)


> **Segunda tanda.** Sigue a [PROMPTS_VN_PROLOGO.md](PROMPTS_VN_PROLOGO.md), con la misma
> gramática: los bloques `[AIRE]` / `[TIERRA]`, el candado de época y los formatos están
> definidos allá — **este documento asume esa base**.
>
> **Decisión de Matías (22/8): por ahora TODAS las placas van SIN PERSONAJES.** Todo lo demás
> de la descripción del guion sí: cada objeto, cada resto, cada detalle. Los personajes se
> componen encima después (nivel 2), y así se pueden cambiar sin regenerar un solo fondo.

---

## La regla de esta tanda: **el objeto tiene que hacer el trabajo de la persona**

Cuando sacás a la gente de una escena, **los objetos tienen que contar que la gente estuvo
ahí hace un minuto.** Un hangar vacío y un hangar abandonado son dos imágenes distintas, y
nosotros queremos el primero.

Por eso cada prompt de acá lleva **las huellas**: el mate a medio tomar, la escalerilla
todavía apoyada, las herramientas desparramadas como las dejó alguien, el gorro en el piso.
`NOBODY IN THE FRAME` no significa "lugar deshabitado" — significa **"se acaban de ir".**

## 🔴 LAS CARTAS DE MATEO — EL CUADERNO ABIERTO *(spec definitiva, 29/8)*

**Cada carta es una hoja de cuaderno ABIERTA, vista desde arriba, en 16:9.**

- **Carilla IZQUIERDA: EN BLANCO.** Solo el rayado. **El motor tipografía la carta encima**,
  así queda editable y traducible.
- **Carilla DERECHA: LOS DIBUJOS.** Todo en birome azul.

**El jugador lee lo que Mateo escribió, y al lado ve lo que Mateo realmente dibujó.** Ese
es el dispositivo entero, y por eso el formato es apaisado: **un cuaderno abierto ES
panorámico.**

### 🔴 La regla de contenido: lo que dice que dibujó, ESTÁ

**Todo lo que la carta nombra como dibujado es OBLIGATORIO y va grande.** Si Mateo escribe
*"lo dibujé con capa, como un superhéroe"*, **el Colorado con capa tiene que estar sí o sí.**
Lo demás que cuenta puede aparecer como viñetas más chicas alrededor.

*Y el guion hasta te da la calibración: en M4 escribe **"salió medio chueco el barco. Los
barcos son difíciles."** Cuando el pibe dice que algo le salió mal, en la hoja tiene que
verse mal.*

### `{HOJA}` — el formato *(pegar al inicio de TODA carta)*

```
AN OPEN NOTEBOOK SEEN FROM DIRECTLY ABOVE, filling the entire frame, its two
facing pages spanning the full width, with the central fold and the wire binding visible
down the middle. THE LEFT-HAND PAGE IS COMPLETELY BLANK: ruled lines only, no writing, no
words, no letters, no sentences anywhere on it - the game types the letter over it. THE
RIGHT-HAND PAGE carries ALL the drawings, in blue ballpoint pen.
```

### 🔴 `{SIN REPETIR}` — el bug número uno *(pegar en TODA carta)*

**Lo que falla:** si el prompt lista las viñetas sin decir **cuántas** ni **dónde**, el
generador **rellena el espacio vacío duplicando motivos** — te devuelve dos pozos y dos
mates. Ya pasó en la primera generación de M1.

**Se arregla con dos cosas juntas:** este bloque, **y una posición explícita para cada
viñeta** (arriba a la derecha, al medio, abajo a la izquierda…). Las dos, no una.

```
EXACTLY ONE of each drawing, and NOTHING IS REPEATED anywhere on the spread.
Every motif appears ONE single time. If there is empty paper left over, LEAVE IT EMPTY -
blank ruled paper is the correct result and is expected. NEVER fill space by duplicating a
drawing, and never add drawings that were not asked for.
```

### 🔴 `{SUELTOS}` — los dibujos NO comparten escena *(pegar en TODA carta)*

**Una carilla de cuaderno no es una ilustración compuesta: es una hoja con dibujos sueltos.**
Cada viñeta es **independiente**, hecha en un momento distinto, y no comparte espacio,
suelo, horizonte ni perspectiva con las otras.

```
These are SEPARATE, UNRELATED DOODLES scattered around the page, NOT one composed
illustration. Each drawing sits on its own bare patch of paper, at its own size and its own
slight angle, with clear empty paper between them. There is NO shared ground line, NO shared
horizon, NO shared perspective and NO background connecting them. They were drawn at
different moments, by the same hand, on the same page.
```

**La línea que hace el trabajo es "dejá el papel vacío".** Si no le decís que el vacío es
correcto, va a inventar algo para llenarlo. Y en una hoja de cuaderno **el aire es
verosímil**: nadie llena una carilla entera de dibujos.

### `{MANO_DE_MATEO}` — la calibración *(pegar en TODA carta)*

*"Que dibuje mal" a secas le sale mal al generador. La calibración sale del propio guion: en
P.1 el padre le dice **"salió mejor el avión que yo, ¿eh?"**. El pibe dibuja desde chico y
tiene talento. Lo que no sabe es dibujar **gente**.*

```
Drawn by an untrained but genuinely gifted 18-year-old who has drawn since he
was a child, with a ballpoint pen, cold, in bad light. THE LANDSCAPE, THE OBJECTS AND THE
MACHINES are confident and well observed - he is good at those. THE PEOPLE ARE NOT: they
come out stiff, slightly out of proportion, with simplified mitten-like hands and faces
either left blank or barely sketched with two dots and a line. Some lines gone over twice,
a few false starts left in, nothing erased. NOTHING IS POLISHED. IT MUST LOOK LIKE A
DRAWING, NOT LIKE AN ILLUSTRATION.
```

**Los paisajes, los objetos y las máquinas le salen bien. La gente le sale torcida.** Esa
asimetría es lo que hace que el cuaderno se lea como un cuaderno.

---

**Y todo lo que el guion nombra, está.** Si la acotación dice "un Rastrojero oxidado", el
Rastrojero está. Si dice "cinta aisladora", la cinta está.

## 🔴 EXCEPCIÓN: LAS CARTAS DE MATEO SÍ LLEVAN GENTE *(corrección del 29/8)*

La regla de "sin personajes" vale para las placas `[AIRE]`, donde las figuras se componen
encima y la consistencia importa. **En las cartas se da vuelta, y por una razón de fondo:
esas personas no las dibuja el juego, las dibuja Mateo.** No son sprites, son garabatos de
un pibe — no tienen que parecerse a los personajes, no hay consistencia que proteger, y
**no tienen que salir bien**. Si los dibujos del cuaderno salen prolijos, **se muere el
dispositivo que sostiene la historia entera.**

### 🔴 `{MANO_DE_MATEO}` — la calibración *(pegar en TODA carta con gente)*

*"Que dibuje mal" a secas le sale mal al generador: devuelve un garabato feo y listo. La
calibración sale del propio guion — en P.1 el padre le dice **"salió mejor el avión que yo,
¿eh?"**. El pibe dibuja desde chico y tiene talento de verdad. Lo que no sabe es dibujar
gente, como cualquier autodidacta de dieciocho.*

```
Drawn by an untrained but genuinely gifted 18-year-old who has drawn since he
was a child, with a ballpoint pen, cold, in bad light. THE LANDSCAPE, THE OBJECTS AND THE
MACHINES are confident and well observed - he is good at those. THE PEOPLE ARE NOT: they
come out stiff, slightly out of proportion, with simplified mitten-like hands and faces
either left blank or barely sketched with two dots and a line, drawn from memory the way a
self-taught kid draws people. Some lines gone over twice, a few false starts left in, nothing
erased. NOTHING IS POLISHED. IT MUST LOOK LIKE A DRAWING, NOT LIKE AN ILLUSTRATION.
```

**Los paisajes, los objetos y las máquinas le salen bien. La gente le sale torcida.** Esa
asimetría es exactamente lo que hace que el cuaderno se lea como un cuaderno.

---

# MISIÓN 1 — "Sal en las alas"

## M1.a — LA LÍNEA DE VUELO, DE MADRUGADA *(briefing · AIRE · 16:9)*

*Guion: "La línea de vuelo de Río Gallegos, de madrugada. El Turco ceba mate como quien da la comunión."*

```
[AIRE] A military flight line at dawn in Patagonia, three attack jets parked in a row
angled away into the distance on cracked concrete, a boarding ladder still leaning
against the nearest fuselage, a wooden bench with a thermos and a gourd mate with a
metal straw resting on it, a rag hanging over the bench, scattered hand tools and an
open toolbox on the ground, a low grey horizon and flat windswept scrub beyond the
apron, cold blue pre-sunrise light with the first orange line at the horizon. NOBODY
IN THE FRAME - they just walked away, everything still warm. 16:9. Argentina 1982, no
modern military equipment, no NATO or US insignia, no invented unit patches. No text,
no watermark, no signature.
```

## M1.b — EL VESTUARIO *(placa `vestuario` · AIRE · 16:9)* 🟩 **REHECHA 29/8**

*Código (`M1_5B`): "El vestuario, media hora antes de subir. El Vasco cierra su locker rápidamente y se aparta."*

**La idea: que se vea EL VESTUARIO DE ELLOS.** Todo cerrado, todo oscuro, y **un solo locker
apenas entornado del que NO se ve nada adentro.** El jugador oye hablar de una foto y no la
ve nunca.

```
[AIRE] Interior of a small military changing room in deep shadow, seen straight on: a
row of six tall grey steel lockers along the back wall, worn and dented, ALL OF THEM
SHUT except one that is very slightly ajar - and the gap is PITCH BLACK, nothing
whatsoever visible inside it, just darkness. A long wooden bench runs in front of the
lockers with personal things left on it: a gourd mate with a metal straw and a thermos
at one end, a pair of black leather flight boots underneath, a folded flight suit
squared off with obsessive neatness beside a crumpled one, a white flight helmet
resting on its crown, a small silver crucifix on a chain hanging from a locker handle,
and a carpenter's pencil left on the bench. Coats and a towel on hooks. One weak bare
bulb high up, the light falling only on the bench, the top of the lockers and the
corners lost in black. NOBODY IN THE FRAME - he just shut it and walked away. 16:9.
Argentina 1982, no modern military equipment, no NATO or US insignia, no invented unit
patches, no national flag. No text, no watermark, no signature.
```

> **⚠ EL HUECO DEL LOCKER ENTORNADO TIENE QUE SER NEGRO PURO.** Si el generador mete un
> reflejo, una tela o un papel ahí adentro, **se arruina el sistema entero**: la gracia es
> que el jugador NO ve. Si sale con algo, se corrige con
> `make the gap in the ajar locker completely black, nothing visible inside`.

> **🟩 Consecuencia narrativa — y creo que es la mejor decisión de la escena.** Con esta placa
> **la foto NUNCA se muestra en M1.** El Gitano la describe, el Pichón la mira y dice *"...es
> hermosa"*, la escuadrilla le puso nombre —**"La Casada"**— y el jugador **no ve nada**. La
> ve por primera vez recién en **M7**, cuando ya es otra cosa. Es exactamente el método del
> juego: nombrar sin mostrar, y cobrar mucho después.
>
> **⚠ Decisión pendiente en `story.js`:** hoy `M1_5B` usa `placa: 'm7_foto_frente'`, o sea
> que **sí muestra la foto en M1**. Si se cambia a `placa: 'vestuario'` y se sostiene toda la
> escena, se gana el giro. Es un cambio de una palabra.

> **Los objetos hacen de los cinco sin que aparezca ninguno.** El mate y el termo son del
> Gitano. El mameluco doblado con obsesión al lado del arrugado son Puma y el Gitano, uno
> junto al otro. El crucifijo colgando de la manija es del Vasco. El lápiz de carpintero es
> del Pichón. El casco blanco sin marcas es de Tero. **Cinco personajes plantados antes de
> conocerlos**, sin una sola figura en el cuadro — es la regla de esta tanda llevada al
> extremo.

## M1.b-bis — LA FOTO *(placa `m7_foto_frente` · solo M7)*

La lámina de la foto **existe y no se toca** — es el cuadro sagrado del giro. Lo único que
cambia es **cuándo se muestra**: ya no en M1. Su prompt vive con el resto de los cuadros de
M7, en la tanda que corresponda.

## M1.c — EL TERITO RECIÉN PINTADO *(cuadro sagrado · AIRE · 16:9)* 🟩 **REHECHA 29/8**

### 🔴 `{TERITO}` — el descriptor canónico del pájaro

**Pegar este bloque tal cual cada vez que aparezca el terito, en cualquier documento y en
cualquier prompt del proyecto.** Es la forma del pájaro y no se improvisa.

```
a southern lapwing (TERO) in strict SIDE PROFILE facing left, standing still and
upright on both legs. The defining feature, which must ALWAYS be present: a SINGLE LONG
THIN CREST FEATHER sweeping backwards from the back of the skull, longer than the head
itself, curving slightly up at the tip. A short straight pointed beak. A slender upright
neck. A compact rounded chest. A smooth unbroken back line running to a LONG POINTED TAIL
that extends backwards and slightly down. Two thin straight legs with small feet. The whole
shape is ELEGANT, THIN AND WIRY, drawn with clean confident lines - NEVER chunky, NEVER a
round blob, NEVER a cartoon bird. NOT shouting, NOT with an open beak, NOT leaping, NOT
with the chest puffed out: it is simply standing, alert and still.
```

> **Por qué la primera versión salió mal.** El prompt viejo decía *"patas largas, pecho al
> frente, gritón… saltando"* y **no mencionaba la cresta**. Sin la cresta no es un tero: es
> un pájaro enojado genérico, y encima "gritón" y "saltando" empujaban al generador hacia un
> dibujito. **La cresta larga y fina hacia atrás es TODO el reconocimiento** — es lo que hace
> que la silueta se lea como tero a cualquier tamaño, incluso en 16 píxeles.

> **🟩 Usá tu imagen de referencia.** Si el generador acepta imagen, **cargá la silueta de
> metal como referencia de FORMA del pájaro únicamente** —no de color, no de fondo, no de
> pose de cámara— y agregá al prompt: `IMAGE 1 is the shape reference for the BIRD ONLY; use
> it for the silhouette and ignore its material, colour and background.`

### El prompt

```
[AIRE] Extreme close-up of the side of a camouflaged attack jet fuselage just below the
cockpit rail, filling the frame, worn green and brown paint with panel lines and rivets
- and stencilled onto it in SOLID FLAT WHITE, small, a bird:
a southern lapwing (TERO) in strict SIDE PROFILE facing left, standing still and
upright on both legs. The defining feature, which must ALWAYS be present: a SINGLE LONG
THIN CREST FEATHER sweeping backwards from the back of the skull, longer than the head
itself, curving slightly up at the tip. A short straight pointed beak. A slender upright
neck. A compact rounded chest. A smooth unbroken back line running to a LONG POINTED TAIL
that extends backwards and slightly down. Two thin straight legs with small feet. The whole
shape is ELEGANT, THIN AND WIRY, drawn with clean confident lines - NEVER chunky, NEVER a
round blob, NEVER a cartoon bird. NOT shouting, NOT with an open beak, NOT leaping, NOT
with the chest puffed out: it is simply standing, alert and still.
The white paint is WET AND FRESH, slightly glossy, with one thin drip running down from
the tail. Resting on the wing root beside it: a SMALL FINE-TIPPED ARTIST'S BRUSH, thin
as a pencil, with a slender wooden handle and a narrow pointed tip - NOT a wide house
painter's brush, NOT a thick brush - and a small open tin of white paint the size of a
teacup. Dawn light raking across the panels. NOBODY IN THE FRAME. 16:9. Argentina 1982,
no modern military equipment, no NATO or US insignia. No text, no watermark, no
signature.
```

> **⚠ Las dos correcciones que hacen falta si sale mal:**
> - Pájaro sin cresta o achatado → `redraw the bird with a single long thin crest feather
>   sweeping backwards from the back of the head, longer than the head itself; make the whole
>   bird thinner and more elegant`
> - Pincel gigante → `replace the brush with a small fine-tipped artist's brush, thin as a
>   pencil, with a narrow pointed tip`

### 🟩 VERSIÓN ENSAMBLADA — adjuntando la foto de la silueta *(copiar y pegar entero)*

**Adjuntás UNA sola imagen: la foto de la silueta de metal del tero.** El prompt ya le dice
que la use solo para la forma del pájaro y que ignore todo lo demás.

```
Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug (SNK Neo Geo
era), hand-drawn sprite look, chunky black pixel outlines, rich dithered shading,
saturated military palette of olive drab, steel blue-grey, silver and warm sand,
dramatic cinematic composition, crisp clean pixels, no anti-aliasing, no
photorealism, no 3D render, no smooth digital painting.

IMAGE 1 IS THE SHAPE REFERENCE FOR THE BIRD ONLY. Copy the bird's silhouette from it
faithfully - the proportions, the posture, the long swept-back crest, the tail. IGNORE
everything else about IMAGE 1: ignore its material, its black colour, its sky, its
tree, its background and its framing. Do not draw a metal sculpture and do not draw a
photograph.

THE SCENE: an extreme close-up of the side of a camouflaged attack jet fuselage just
below the cockpit rail, filling the frame, worn green and brown paint with panel lines
and rivets - and stencilled onto that metal in SOLID FLAT WHITE, small, a bird:

a southern lapwing (TERO) in strict SIDE PROFILE facing left, standing still and
upright on both legs. The defining feature, which must ALWAYS be present: a SINGLE LONG
THIN CREST FEATHER sweeping backwards from the back of the skull, longer than the head
itself, curving slightly up at the tip. A short straight pointed beak. A slender upright
neck. A compact rounded chest. A smooth unbroken back line running to a LONG POINTED
TAIL that extends backwards and slightly down. Two thin straight legs with small feet.
The whole shape is ELEGANT, THIN AND WIRY, drawn with clean confident lines - NEVER
chunky, NEVER a round blob, NEVER a cartoon bird. NOT shouting, NOT with an open beak,
NOT leaping, NOT with the chest puffed out: it is simply standing, alert and still.

The bird is painted flat white with no detail inside the silhouette. The white paint is
WET AND FRESH, slightly glossy, with one thin drip running down from the tail.

Resting on the wing root beside it: a SMALL FINE-TIPPED ARTIST'S BRUSH, thin as a
pencil, with a slender wooden handle and a narrow pointed tip - NOT a wide house
painter's brush, NOT a thick brush - and a small open tin of white paint the size of a
teacup.

Dawn light raking across the panels. NOBODY IN THE FRAME.

Wide 16:9 framing. Argentina 1982, no modern military equipment, no NATO or US
insignia, no invented unit patches. ABSOLUTELY NO TEXT of any kind: no letters, no
numbers, no labels, no watermark, no signature.
```

> **Esta placa es la REFERENCIA MAESTRA del terito.** El mismo pájaro tiene que ser idéntico
> en sus tres apariciones del guion y en el sprite del avión. **Si cambia acá, cambian las
> tres.**

## M1.d — EL MAR DEL TUTORIAL *(la misión · AIRE · 16:9)*

*Guion: "esquivar los mástiles de una flotilla pesquera, pasar bajo un puente de chapa, tirar a tambores flotantes."*

```
[AIRE] Grey open sea seen very low, almost at wave height, with three small rusted
fishing boats scattered in the middle distance, their tall masts and rigging sticking
up like obstacles, a low corrugated-iron bridge on stilts crossing a channel further
back, and a scatter of empty oil drums floating in the foreground with rope handles.
Overcast sky, cold silver light, spray blowing off the wave tops. NOBODY IN THE FRAME.
16:9. Argentina 1982, no modern equipment. No text, no watermark, no signature.
```

## M1.e — LA PRIMERA ESTRELLITA *(epílogo · AIRE · 16:9)* 🔴 **CORREGIDA 29/8**

*Guion: "Todos vuelven. El Turco pinta cinco estrellitas con la lengua afuera."*

### 🔴 EL ERROR QUE HABÍA, Y LA REGLA

**Era UNA estrellita por avión por vuelta, no cinco en un avión.** El Turco lo dice en el
mismo M1: *"tengo la costumbre de pintarles una estrella a cada uno **por cada vuelta**"*. Las
cinco estrellitas del epílogo son **cinco aviones, una cada uno** — no una fila de cinco en
el mismo fuselaje. Un avión con cinco estrellas en la misión 1 significa que ya volvió cinco
veces: está mal.

**Y hay DOS contadores distintos, que van en direcciones opuestas:**

| Contador | Qué hace | Se ve en |
|---|---|---|
| **Estrellas POR AVIÓN** | **SUBE** — una por misión sobrevivida. Después de M1 hay 1; después de M4, 4 | el fuselaje de cada avión |
| **Aviones QUE SE PINTAN** | **BAJA** — cuando alguien no vuelve, ese avión deja de sumar | la línea de vuelo |

**Y el cruce de los dos es el momento de M7:** *"hay una estrellita que hoy no se pinta. El
tarrito queda abierto toda la noche."*

> **⚠ COLISIÓN DE NOMBRES — ojo con esto.** El juego tiene **otro** sistema de estrellas: las
> **1 a 4 estrellas de puntaje por nivel** (`freezeRun()`, ROADMAP). **No tienen nada que ver.**
> Las del Turco son diegéticas y están pintadas en el fuselaje; las de puntaje son HUD. Al
> hablar de esto conviene decir siempre **"las estrellitas del Turco"** para no mezclarlas.

> **🟩 DECISIÓN DE PRODUCCIÓN: las estrellitas las dibuja EL MOTOR, no la IA.** Son formas
> blancas de cinco píxeles. **Se genera UNA sola placa del fuselaje SIN NINGUNA estrella**, y
> el juego pinta las que correspondan según cuántas volvió ese avión. Así el número deja de
> ser arte y pasa a ser dato — y no hay que generar trece versiones. **Y el momento de M7 sale
> gratis:** el motor simplemente no incrementa el contador de ese avión, y el jugador ve el
> hueco. *(Mismo criterio que las cinemáticas: conteo y geometría al motor, materia a la IA.)*

### El prompt — **el fuselaje limpio, sin estrellas** *(recomendado)*

```
[AIRE] Close-up of the worn camouflaged side of an attack jet fuselage just below the
cockpit, filling the frame, green and brown paint with panel lines, rivets, exhaust
staining and scuffed edges. The area below the cockpit rail is CLEAN AND EMPTY - no
stars, no markings, no numbers, no insignia of any kind on that panel, just bare worn
paint waiting. Resting on the wing root: a small fine-tipped artist's brush, thin as a
pencil, and a small open tin of white paint the size of a teacup. Warm late afternoon
light raking across the panel lines. NOBODY IN THE FRAME. 16:9. Argentina 1982, no
modern military equipment, no NATO or US insignia. No text, no watermark, no signature.
```

### Variante — **con UNA sola estrellita**, si la querés horneada

```
…same as above, but with EXACTLY ONE small white hand-painted star below the cockpit
rail - slightly crooked, clearly painted by hand and not stencilled, the paint still
WET and slightly glossy. ONE star only. Not two, not a row.
```

### 🔧 CORRECCIÓN de la imagen que ya generaste *(adjuntándola como referencia)*

```
Keep this image exactly as it is - same aircraft, same panel, same pose, same framing,
same colours, same light, same background. Change only this one thing: REMOVE FOUR OF
THE FIVE PAINTED STARS. Leave EXACTLY ONE small white hand-painted star below the
cockpit rail, slightly crooked, the paint still wet and slightly glossy. The area where
the other four stars were must become bare worn camouflage paint with panel lines, as
if nothing had ever been painted there.
Do not redraw anything else. Do not change the brush, the paint tin, the light or the
fuselage.
```

> Si además querés la versión limpia para que el motor pinte encima, corré la misma
> corrección cambiando el arreglo por: `REMOVE ALL FIVE PAINTED STARS and leave that panel
> completely bare - worn camouflage paint with panel lines and nothing else.`

## M1.f — CARTA 1: EL COLORADO *(TIERRA · 16:9)* 🟥 **v3 — UN SOLO DIBUJO**

> 🟥 **CAMBIO (29/8): la hoja tiene UN SOLO DIBUJO.** Se cae el pozo suelto del ángulo. El
> Colorado está **de brazos abiertos protegiendo**, el cuero de oveja abierto detrás **como
> un techo**, y bajo el cuero **una trinchera con seis o siete cabecitas en silueta, sin
> cara, con el casco más grande que la cabeza**. Es lo único que dibuja porque es lo único
> en lo que piensa. **El prompt armado está en `PROMPTS_TIERRA_LISTOS.md` · CARTA 2.**

*Dice que dibujó: **"Lo dibujé con capa, como un superhéroe, y abajo le puse «el Colorado»."*** *· Y cuenta: el cuero de oveja con la lana para adentro, el pozo armado mirando de dónde viene el viento, los mates.*

```
[TIERRA] AN OPEN NOTEBOOK SEEN FROM DIRECTLY ABOVE, filling the entire frame, its two
facing pages spanning the full width, with the central fold and the wire binding visible
down the middle. THE LEFT-HAND PAGE IS COMPLETELY BLANK: ruled lines only, no writing, no
words, no letters, no sentences anywhere on it - the game types the letter over it. THE
RIGHT-HAND PAGE carries ALL the drawings, in blue ballpoint pen.
Drawn by an untrained but genuinely gifted 18-year-old who has drawn since he
was a child, with a ballpoint pen, cold, in bad light. THE LANDSCAPE, THE OBJECTS AND THE
MACHINES are confident and well observed - he is good at those. THE PEOPLE ARE NOT: they
come out stiff, slightly out of proportion, with simplified mitten-like hands and faces
either left blank or barely sketched with two dots and a line. Some lines gone over twice,
a few false starts left in, nothing erased. NOTHING IS POLISHED. IT MUST LOOK LIKE A
DRAWING, NOT LIKE AN ILLUSTRATION.
EXACTLY ONE of each drawing, and NOTHING IS REPEATED anywhere on the spread.
Every motif appears ONE single time. If there is empty paper left over, LEAVE IT EMPTY -
blank ruled paper is the correct result and is expected. NEVER fill space by duplicating a
drawing, and never add drawings that were not asked for.
THE RIGHT-HAND PAGE CONTAINS EXACTLY TWO DRAWINGS AND NOTHING ELSE:
1. CENTRE-LEFT OF THE RIGHT PAGE, large, the main drawing - A CLUMSY, HEROIC,
   SUPERMAN-LIKE FIGURE OF A SOLDIER, drawn by a kid trying to make his friend look
   magnificent:
   - A HUGELY EXAGGERATED BARREL CHEST and very broad shoulders tapering to a narrow
     waist, comic-book superhero build, feet planted wide apart, fists on his hips, chin
     lifted, chest thrown forward. Heroic stance.
   - HIS CAPE IS NOT CLOTH: IT IS A RAW SHEEPSKIN HIDE worn as a cape and billowing behind
     him - an irregular, ragged-edged animal hide with the WOOLLY FLEECE turned INWARD and
     clearly visible along the inside edge and where it folds, drawn with thick curly
     texture. It must read unmistakably as a sheepskin, not as a superhero cloak. Drawn
     with far more enthusiasm and detail than anything else on the page.
   - HE MUST READ AS A REDHEAD EVEN THOUGH THE DRAWING IS ALL ONE COLOUR OF INK. HIS HAIR
     IS FULLY DRAWN IN THE SAME BLUE BALLPOINT AS EVERYTHING ELSE - never left as bare
     paper, never white, never blank - but drawn with LOOSE, OPEN, SPARSE STROKES: a mass
     of light curls and thin airy hatching with plenty of paper showing between the lines,
     so it reads PALE and BRIGHT next to the densely hatched dark uniform. It is ink, and
     it is visibly drawn. And his face and cheekbones are covered in a scatter of SMALL INK
     DOTS: FRECKLES, clearly visible, unmistakable.
   - And it is still badly drawn: proportions off, one arm longer than the other, hands
     like mittens, the face simple - two dots, a line for the mouth, and the freckles.
   A small handwritten label directly under his boots.
2. TOP RIGHT CORNER, much smaller, drawn well and carefully - ONE shallow foxhole dug into
   peat, its low stone-and-turf parapet built up on ONE side only, with all the grass bent
   hard in that same direction. NO sheepskin here, NO hide, NO fleece: the sheepskin
   appears ONLY as the cape.
THE ENTIRE BOTTOM AND RIGHT OF THE PAGE ARE EMPTY: blank ruled paper, no drawings at all,
no mate gourd, no kettle, no extra objects of any kind.
Cream paper texture, a few ink smudges and one damp stain. 16:9 widescreen. No watermark,
no signature.
TEXT IN IMAGE (Argentine Spanish), handwritten in the same blue ballpoint under the caped
figure, small and slightly crooked: "el Colorado"
```

> **⚠ Las únicas dos palabras de la imagen son "el Colorado".** El resto lo tipografía el
> motor sobre la carilla izquierda.

> **🔴 LA CAPA ES EL CUERO DE OVEJA _(idea de Matías, 29/8)_ — y es lo mejor de la página.**
> El Colorado le regaló el cuero; Mateo lo dibuja como superhéroe **con ese mismo cuero de
> capa**. **Lo que a él lo abriga es lo que hace héroe al otro**, y el pibe lo dibuja sin
> darse cuenta de lo que está diciendo. **No se explica en ningún lado, nunca.**
>
> Dos efectos laterales: **funde dos dibujos en uno** (la página baja de tres viñetas a
> dos), y **obliga a sacar el cuero del pozo** — si aparece en los dos lugares se repite el
> motivo, que es justo el bug que acabamos de arreglar.
>
> **Se cayeron el mate y la pava.** Estaban porque la carta dice *"unos mates que te levantan
> de la tumba"*, pero era el objeto más genérico de la hoja y no sostenía nada.

> **Y sigue valiendo: si sale bien dibujado, no funciona.** *"Te vas a reír cuando lo veas."*

> **🔴 CÓMO SE DICE "COLORADO" A UNA SOLA TINTA.** En birome no hay color, así que el pelo
> rojo se dibuja con **dos convenciones que cualquiera lee**: el pelo **queda sin rellenar**
> —papel crudo, apenas el contorno y dos o tres rulos— mientras el resto del dibujo está
> rayado y oscuro, así que **la cabeza sale clara y brillante**; y la cara va **llena de
> pecas**, puntitos de tinta bien visibles. **Vale para todas las apariciones del Colorado
> en el cuaderno**, no solo ésta.

> **🔴 Y el pecho tipo Superman no traiciona la regla de "mal dibujado": la refuerza.**
> Un pibe que dibuja a alguien que admira **le exagera el pecho y los hombros**. La pose
> heroica y el dibujo torpe no se pelean — **es exactamente así como dibuja un chico a su
> héroe.**

> **🔧 Corrección si igual repite algo:** `delete the duplicated drawings and leave that area
> as empty blank ruled notebook paper; keep exactly one of each motif; empty paper is
> correct.`

---

# MISIÓN 2 — "Bautismo de fuego"

## M2.a — LA LÍNEA ANTES DE LA PRIMERA DE VERDAD *(briefing · AIRE · 16:9)*

*Guion: la ronda de mate en la línea de vuelo, el Turco cargando.*

```
[AIRE] A military flight line in the grey hour before sunrise, an attack jet in the
foreground with its access panels open and a bomb trolley parked under the wing
carrying two olive bombs, a gourd mate with a metal straw and a thermos left standing
on an upturned crate, the boarding ladder in place, a coiled ground power cable
snaking across the concrete. Flat cold light, no shadows. NOBODY IN THE FRAME - the
mate is still half full. 16:9. Argentina 1982, no modern military equipment, no NATO
or US insignia, no invented unit patches. No text, no watermark, no signature.
```

## M2.b — LA COSTA Y EL RADAR *(la misión · AIRE · 16:9)*

```
[AIRE] A bleak coastline seen from very low over the water: black rock, peat and low
scrub climbing to a bare ridge, and on the high ground a British-style mobile radar
installation - a lattice mast with a rotating dish, sandbagged emplacements and a
generator trailer. Overcast, wind-flattened grass, cold flat light. NOBODY IN THE
FRAME. 16:9. Argentina 1982, no modern equipment, no digital camouflage. No text, no
watermark, no signature.
```

## M2.c — LA CHAPA REMENDADA *(epílogo · AIRE · 16:9)*

*Guion: "Pichón aterriza agujereado… el Turco remienda chapa toda la noche. A la mañana, agujeros parchados y una estrellita nueva."*

```
[AIRE] Close-up of an attack jet's camouflaged flank in morning light, riddled with
cannon holes that have been PATCHED overnight - a dozen rough metal patches riveted
over the punctures, the new rivets bright against the worn paint, the patch primer a
different colour that does not match. Beside them, one small white hand-painted star,
newer and whiter than the others. Tools and a hand riveter left on the wing root, a
work lamp on a stand still switched on in the daylight. NOBODY IN THE FRAME - he
worked all night and just left. 16:9. Argentina 1982, no modern equipment. No text, no
watermark, no signature.
```

## M2.d — CARTA 2: EL HAMBRE Y LOS QUE CANTAN *(TIERRA · 16:9)* 🔴

*Cuenta: comieron una vez en todo el día · el Colorado le pasó la mitad de su lata · Bordón tiene la carpa llena de cajas, "nosotros afuera, las cajas adentro" · la radio pasa rock nacional · "anoche los pibes cantaban en el pozo".*

```
[TIERRA] AN OPEN NOTEBOOK SEEN FROM DIRECTLY ABOVE, filling the entire frame, its two
facing pages spanning the full width, with the central fold and the wire binding visible
down the middle. THE LEFT-HAND PAGE IS COMPLETELY BLANK: ruled lines only, no writing, no
words, no letters, no sentences anywhere on it - the game types the letter over it. THE
RIGHT-HAND PAGE carries ALL the drawings, in blue ballpoint pen.
Drawn by an untrained but genuinely gifted 18-year-old who has drawn since he
was a child, with a ballpoint pen, cold, in bad light. THE LANDSCAPE, THE OBJECTS AND THE
MACHINES are confident and well observed - he is good at those. THE PEOPLE ARE NOT: they
come out stiff, slightly out of proportion, with simplified mitten-like hands and faces
either left blank or barely sketched with two dots and a line. Some lines gone over twice,
a few false starts left in, nothing erased. NOTHING IS POLISHED. IT MUST LOOK LIKE A
DRAWING, NOT LIKE AN ILLUSTRATION.
EXACTLY ONE of each drawing, and NOTHING IS REPEATED anywhere on the spread.
Every motif appears ONE single time. If there is empty paper left over, LEAVE IT EMPTY -
blank ruled paper is the correct result and is expected. NEVER fill space by duplicating a
drawing, and never add drawings that were not asked for.
THE RIGHT-HAND PAGE CONTAINS EXACTLY THREE DRAWINGS AND NOTHING ELSE:
1. UPPER TWO THIRDS, large, the main drawing - ONE shallow muddy foxhole with FOUR OR FIVE YOUNG
SOLDIERS crammed into it shoulder to shoulder around a small portable transistor radio
with its aerial up. THEIR MOUTHS ARE OPEN: they are singing. Faces barely sketched, two
dots and a line each, all of them stiff and slightly the wrong size, arms drawn as simple
tubes.
2. BOTTOM LEFT, small, drawn carefully - ONE opened ration tin, scraped clean, with a
   spoon still in it.
3. BOTTOM RIGHT, small but drawn MUCH better and with the pen pressing harder - ONE large
   officer's tent with the flap tied half open and STACKS OF WOODEN SUPPLY CRATES clearly
visible piled inside it, a lantern at the entrance, and nobody around it.
Rain drawn as long diagonal pen strokes across the drawing page. Cream paper texture,
damp stains and ink smudges rendered as pixels. 16:9 widescreen. No text, no watermark,
no signature.
```

> **La asimetría es la denuncia:** los compañeros salen torcidos, **la carpa de las cajas
> sale bien dibujada y con más lápiz encima.** Mateo no lo dice en ningún lado.

---

# MISIÓN 3 — "El invento"

## M3.a — EL AMANECER DEL INVENTO *(briefing · AIRE · 16:9)*

*Guion: "Amanecer tranquilo, de esos que la guerra regala para confundir. El Pichón trepado a una escalera contra el avión de Esteban."*

```
[AIRE] A quiet golden sunrise over a military flight line, an attack jet in
three-quarter view with a wooden stepladder leaning against its fuselage, an access
panel hanging open beside the air intake with wiring and pipework visible inside, hand
tools laid out in a neat row on a rag on the wing, a grease-stained notebook and a
carpenter's pencil left open on the crate below. Long soft shadows, still air, mist on
the scrub beyond. NOBODY IN THE FRAME. Warm and deceptively peaceful. 16:9. Argentina
1982, no modern military equipment, no NATO or US insignia. No text, no watermark, no
signature.
```

## M3.b — LAS BOYAS Y EL RADAR PORTÁTIL *(la misión · AIRE · 16:9)*

```
[AIRE] A calm grey coastal strait seen low over the water, with a line of enemy
marker buoys floating in a row - squat, drum-shaped, with short antenna whips and
faded paint - and further inland on a low headland a small portable radar unit on a
towed trailer with its dish folded half up. Soft morning light, glassy water, no wind.
NOBODY IN THE FRAME. 16:9. Argentina 1982, no modern equipment. No text, no watermark,
no signature.
```

## M3.c — EL INVENTO QUE EXPLOTA *(epílogo · AIRE · 16:9)*

*Guion: "algo con un carenado y mucha cinta aisladora… hace un ruido espantoso, tira una pieza que sale volando, y se apaga con humo. Pasa cerca del Turco y le vuela el gorro."*

```
[AIRE] Interior of a hangar, and on a workbench in the centre a bizarre home-made
contraption: a curved sheet-metal fairing lashed to a small motor with LOTS of black
electrical tape wound around every joint, wires sticking out, one hose clamp holding
the whole thing together. A thin plume of grey smoke rising from it, a scorch mark on
the bench, and a small metal washer lying on the floor several metres away next to a
mechanic's cloth cap that has been knocked off. Tools scattered where they were
dropped. Hard work light from above. NOBODY IN THE FRAME - it just happened. 16:9.
Argentina 1982, no modern equipment. No text, no watermark, no signature.
```

## M3.d — EL CARRITO DEL MISIL *(la burrada del Gitano · AIRE · 16:9)*

```
[AIRE] A low wheeled ordnance trolley standing in the middle of a hangar floor with a
single olive-green air-to-ground missile strapped to it, its fins wrapped in
protective cloth, a hand crank at one end and chocks under the wheels. The hangar
around it half in shadow, an attack jet's nose visible at the edge of frame. Hard
overhead work light. NOBODY IN THE FRAME. 16:9. Argentina 1982, no modern guided
weapons, no NATO or US markings. No text, no watermark, no signature.
```

## M3.e — LA NOTICIA *(el Belgrano · AIRE · 16:9)*

*Guion: "El Turco deja el gorro sobre el banco y no lo levanta más… junta las herramientas de a una, muy despacio, como si ordenar sirviera para algo."*

```
[AIRE] Interior of a hangar at the end of the day, the laughter gone out of it. In the
foreground a wooden workbench with a mechanic's grey cloth cap left lying on it, not
folded, just put down. Beside the bench, hand tools lined up one next to another in a
too-careful row, and three still on the floor. An attack jet in shadow behind. The work
lamp is on but the daylight from the hangar doors is going blue. NOBODY IN THE FRAME.
Silent, heavy, stopped. 16:9. Argentina 1982, no modern equipment. No text, no
watermark, no signature.
```

> **Esta placa hace el corte de tono.** Es el mismo hangar de M3.c pero **ordenado y
> apagado**. Si se generan las dos con el mismo encuadre, cambiar de una a la otra vale más
> que cualquier cinemática.

## M3.f — CARTA 3: LA NAVAJA *(TIERRA · 16:9)* 🔴

*Dice que dibujó: **"La dibujé abajo, mirá. Le hice hasta las marquitas del cabo."*** *· Y cuenta: el cortaplumas viejo con el cabo de asta gastado, que la probó pelando un palo para el fuego, que la lleva en el bolsillo de arriba con la birome.*

```
[TIERRA] AN OPEN NOTEBOOK SEEN FROM DIRECTLY ABOVE, filling the entire frame, its two
facing pages spanning the full width, with the central fold and the wire binding visible
down the middle. THE LEFT-HAND PAGE IS COMPLETELY BLANK: ruled lines only, no writing, no
words, no letters, no sentences anywhere on it - the game types the letter over it. THE
RIGHT-HAND PAGE carries ALL the drawings, in blue ballpoint pen.
Drawn by an untrained but genuinely gifted 18-year-old who has drawn since he
was a child, with a ballpoint pen, cold, in bad light. THE LANDSCAPE, THE OBJECTS AND THE
MACHINES are confident and well observed - he is good at those. THE PEOPLE ARE NOT: they
come out stiff, slightly out of proportion, with simplified mitten-like hands and faces
either left blank or barely sketched with two dots and a line. Some lines gone over twice,
a few false starts left in, nothing erased. NOTHING IS POLISHED. IT MUST LOOK LIKE A
DRAWING, NOT LIKE AN ILLUSTRATION.
EXACTLY ONE of each drawing, and NOTHING IS REPEATED anywhere on the spread.
Every motif appears ONE single time. If there is empty paper left over, LEAVE IT EMPTY -
blank ruled paper is the correct result and is expected. NEVER fill space by duplicating a
drawing, and never add drawings that were not asked for.
THE RIGHT-HAND PAGE CONTAINS EXACTLY FOUR DRAWINGS AND NOTHING ELSE:
1. CENTRE OF THE PAGE, large, drawn WITH FAR MORE CARE THAN ANYTHING ELSE - ONE OLD
   FOLDING POCKET KNIFE lying open at a slight angle: a worn
horn handle with visible NICKS AND SMALL NOTCHES along it from years of use, a short
blade with a rounded worn edge, a simple brass bolster. Clearly the thing the artist
loves most on this page, with faint construction lines still showing where the hand went
over it twice.
2. TOP RIGHT, small and much rougher - ONE pair of clumsy mitten-like hands whittling a
   stick with long curled shavings falling off it, the hands stiff and badly proportioned.
3. BOTTOM LEFT, small, drawn well - ONE small campfire with a blackened kettle over it.
4. BOTTOM RIGHT, small - ONE shirt breast pocket with the knife and a ballpoint pen
   sticking out of it side by side.
Cream paper texture, ink smudges rendered as pixels. 16:9 widescreen. No text, no
watermark, no signature.
```

> **Referencia maestra del objeto** — las marquitas del cabo tienen que ser las mismas en
> las tres apariciones de la navaja. **Y el contraste dentro de la página:** el cuchillo
> perfecto, las manos que lo sostienen torcidas. Es el pibe entero en un cuadro.

---

# 🔴 RETRATOS DEL COLORADO *(nuevos — 29/8)*

**Cambió el canon.** RETRATOS decía que el Colorado *"existe solo en los dibujos del
cuaderno"*. **Ya no: tiene retrato como todos.** Es el segundo personaje más importante del
registro TIERRA, el que le da el cuero de oveja, el que le enseña a armar el pozo, el que le
regala la navaja, el que se sienta en el barro a esperar que se le pase el llanto — y **el
que muere en M12 tapando con su cuerpo a un pibe que conocía hacía dos meses.**

**Y las dos versiones conviven:** el retrato de verdad, y el monigote con capa que dibuja
Mateo. **Ese contraste es el punto** — el jugador ve la cara real de un tipo al que un chico
dibujó como superhéroe.

**`colorado_sonrisa`** *(SU neutro — la sonrisa ancha y honesta)*

```
[AIRE] Portrait bust of an argentine corporal, 26 years old, tall and sturdy, fair freckled skin raw red
from the cold, red hair, plain olive field uniform with NO insignia of any kind, wool cap,
argentine brown leather webbing, chest-up, three-quarter view facing slightly
left, a broad open honest grin that reaches the eyes, weather-beaten and cheerful despite
the cold, neutral dark background for clean cutout, consistent framing and scale, pixel
art character portrait for a dialogue box. Argentina 1982, argentine latin-american face,
no modern military equipment, no NATO or US insignia, no invented unit patches, no
national flag on clothing. No text, no watermark.
```

**`colorado_callado`** *(el que sabe esperar — se sienta en el barro y no dice nada)*

```
[AIRE] Portrait bust of an argentine corporal, 26 years old, tall and sturdy, fair freckled skin raw red
from the cold, red hair, plain olive field uniform with NO insignia of any kind, wool cap,
argentine brown leather webbing, chest-up, three-quarter view facing slightly
left, the grin gone, mouth closed, looking slightly down and away, patient and completely
unhurried - the face of a man who is willing to sit in the mud for as long as it takes and
has no intention of saying anything, neutral dark background for clean cutout, consistent
framing and scale, pixel art character portrait for a dialogue box. Argentina 1982,
argentine latin-american face, no modern military equipment, no NATO or US insignia, no
national flag on clothing. No text, no watermark.
```

**`colorado_serio`** *(cuando la cosa se pone fea)*

```
[AIRE] Portrait bust of an argentine corporal, 26 years old, tall and sturdy, fair freckled skin raw red
from the cold, red hair, plain olive field uniform with NO insignia of any kind, wool cap,
argentine brown leather webbing, chest-up, three-quarter view facing slightly
left, jaw set, brow low, eyes hard and fixed on something off-frame, all the warmth gone
out of the face, neutral dark background for clean cutout, consistent framing and scale,
pixel art character portrait for a dialogue box. Argentina 1982, argentine
latin-american face, no modern military equipment, no NATO or US insignia, no national
flag on clothing. No text, no watermark.
```

> **Su marca personal es la ausencia de marca:** uniforme de campaña **sin ninguna insignia**,
> gorro de lana, correaje de cuero marrón. En una guerra llena de galones, el que se porta
> como un hermano no tiene ninguno.

---

## Resumen de la tanda

| # | Asset | Registro | Nota |
|---|---|---|---|
| 1 | M1.a línea de vuelo, madrugada | AIRE | **se reusa en todos los briefings de madrugada** |
| 2 | M1.b **el vestuario** 🟩 | AIRE | **rehecha 29/8** · todo cerrado, un locker entornado y negro adentro · **la foto NO se ve en M1** |
| 3 | M1.c el terito recién pintado | AIRE | cuadro sagrado · **referencia maestra del terito** |
| 4 | M1.d el mar del tutorial | AIRE | — |
| 5 | M1.e **el fuselaje limpio** 🔴 | AIRE | **corregida 29/8** · sin estrellas: **las pinta el motor** |
| 6 | M1.f **el Colorado** 🟥 | TIERRA | 16:9 · **un solo dibujo: capa de cuero abierta como techo sobre las cabecitas con casco** |
| 7 | M2.a la línea antes de la primera | AIRE | variante de luz de la 1 |
| 8 | M2.b la costa y el radar | AIRE | — |
| 9 | M2.c la chapa remendada | AIRE | **se reusa cada vez que alguien vuelve tocado** |
| 10 | M2.d **el hambre y los que cantan** 🔴 | TIERRA | 16:9 · **con los pibes cantando** |
| 11 | M3.a el amanecer del invento | AIRE | — |
| 12 | M3.b las boyas y el radar portátil | AIRE | — |
| 13 | M3.c el invento que explota | AIRE | **par con la 14, mismo encuadre** |
| 14 | M3.e la noticia (el Belgrano) | AIRE | **par con la 13, mismo encuadre** |
| 15 | M3.d el carrito del misil | AIRE | — |
| 16 | M3.f la navaja | TIERRA | 🟥 16:9 · **referencia maestra del objeto** |

**Dieciséis placas + los tres retratos del Colorado, y las tres primeras misiones quedan de pie.** Cuatro son patrones que se
reusan el resto de la campaña (la línea de vuelo, las estrellitas, la chapa remendada, el
locker), así que esta tanda paga bastante más de lo que cuesta.

**Empezá por la 13 y la 14** — el hangar alegre y el hangar apagado, mismo encuadre. Si ese
par funciona, tenés resuelto el recurso más potente y más barato de todo el juego.
