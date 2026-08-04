# PROMPTS COMPUESTOS — hojas modelo de personaje

Un prompt **cerrado y listo para pegar** por cada personaje y vehículo de
[STORYBOARD_1.md](STORYBOARD_1.md). Nada que completar: el bloque de estilo `[AIRE]` ya está
escrito adentro de cada uno.

Estas hojas son **la referencia maestra**: se generan una vez, se guardan, y después se usan como
*image reference* en cada cuadro de cinemática. Son lo que hace que el Gitano de la Misión 1 sea el
mismo Gitano de la Misión 9.

---

## Leer una sola vez antes de generar

**1. La regla que rompe todo si se ignora: lo que va en la hoja tiene que estar en el token.**
Si la hoja modelo tiene un detalle que el descriptor de `STORYBOARD_1.md` no menciona (una
cicatriz, un pañuelo, el color de los ojos), los cuadros de cinemática —que usan el token corto— no
lo van a tener, y personaje y hoja se separan. Por eso cada prompt de acá **agrega solo cosas que
también quedan anotadas** en la tabla de tokens ampliada del final de este documento. Si cambiás un
prompt, actualizá la tabla.

**2. Orden de generación.** Primero `{ESTEBAN}` y `{MATEO}` (son padre e hijo: conviene fijar el
parecido de familia y que las dos caras se decidan juntas). Después los Fieles del escuadrón, y al
final el Turco, el Colorado, Norma y los vehículos.

**3. Guardá el seed.** Si tu generador lo expone, anotá el seed de cada hoja aprobada al lado del
archivo. Regenerar una hoja perdida sin el seed es empezar el personaje de nuevo.

**4. Formato.** Las hojas van en **16:9 apaisado** — necesitan lugar para tres vistas más el
retrato. No es lo mismo que el formato de un cuadro: es una lámina de referencia.

**5. Sin texto, nunca.** Una hoja modelo con letras rotas es inservible como referencia y el
generador va a intentar escribir "front view", "3/4" y el nombre. Todos los prompts terminan con la
negativa correspondiente.

**6. Época.** Todos llevan el candado `1982, no modern military equipment, no NATO or US insignia`.
Sin eso los generadores visten a cualquier soldado con equipo de 2010.

---

# LOS PILOTOS

## `{ESTEBAN}` — el padre. Protagonista del aire

Indicativo **TERO** (el pájaro que grita lejos del nido para alejar al depredador — es la clave de
su personaje y del final del guion). Es el que vuela; el jugador es él.

> **Construido como su indicativo: es el pájaro.** Alto, enjuto, alerta, el cuello adelantado, nunca
> del todo quieto. Es el **más flaco y más alto** del escuadrón y el **opuesto exacto de Puma**, que
> es la mole. Ver «Cómo se separan Tero y Puma» abajo.

```
Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug (SNK Neo Geo
era), hand-drawn sprite look, chunky black pixel outlines, expressive exaggerated
character poses and faces, rich dithered shading, saturated military palette of
olive drab, steel blue-grey, silver and warm sand with a single red accent when
noted, dramatic cinematic side-scroller composition, crisp clean pixels, no
anti-aliasing, no photorealism, no 3D render, no smooth digital painting.

Character sprite model sheet of a single character repeated in several views,
neutral flat mid-grey background, consistent design across all views, arcade
sprite proportions, orthographic reference lámina layout.

CHARACTER: argentine fighter pilot, 41 years old, TALL AND LEAN, wiry narrow
build, the tallest and thinnest man in the squadron, long neck carried slightly
forward like an alert bird, clean-shaven, short dark hair greying only at the
temples, strong jaw, tired warm watchful eyes, olive-green flight suit worn
unzipped to mid-chest with no jacket over it, white flight helmet always carried
under one arm, restless posture, never quite still.

SHEET CONTENTS, arranged left to right in one row: full-body front view standing
idle with weight on one leg, full-body three-quarter view, full-body side
profile emphasising the lean forward-leaning silhouette, full-body view from
behind; and along the bottom a strip of four head close-ups showing his range:
calm and steady, worried father, hard determined pre-flight stare, and grief held
in silence.

Argentina 1982, no modern military equipment, no NATO or US insignia, no name
tags. 16:9 landscape. No text, no labels, no letters, no numbers, no watermark,
no signature.
```

---

## `{PUMA}` — el líder del escuadrón

La autoridad paternal del grupo. Es el que le enseña al jugador la regla del rasante y el que le
enseña el **tono** del juego ("Veinte marinos, Gitano").

> **Construido como su indicativo: es el animal pesado.** Ancho, macizo, plantado, se mueve poco y
> cuando se mueve pesa. Es el **más corpulento** del escuadrón y el opuesto de Tero.

### Cómo se separan Tero y Puma

Eran dos pilotos de mediana edad con el mismo traje verde: a escala de sprite se leían como el
mismo tipo con y sin bigote. Ahora se separan por **cinco ejes**, y los tres primeros funcionan
aunque el personaje mida veinte píxeles y esté de espaldas:

| | `{ESTEBAN}` / TERO | `{PUMA}` |
|---|---|---|
| **silueta** | alto y flaco, angosto | bajo y ancho, macizo |
| **volumen** | solo el traje de vuelo | **campera de cuero encima** — más bulto, otro valor de gris |
| **postura** | cuello adelantado, inquieto, peso en una pierna | plantado, pies separados, inmóvil |
| **cabeza** | pelo oscuro, algo largo, canas solo en las sienes | rapado casi al ras a los costados, gris hierro |
| **cara** | afeitado, ojos cálidos y grandes | bigote de cepillo, ojos entrecerrados de sol |

El único de esos cinco que **no** sobrevive a la distancia es el último — por eso no puede ser el
que los distinga.

```
Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug (SNK Neo Geo
era), hand-drawn sprite look, chunky black pixel outlines, expressive exaggerated
character poses and faces, rich dithered shading, saturated military palette of
olive drab, steel blue-grey, silver and warm sand with a single red accent when
noted, dramatic cinematic side-scroller composition, crisp clean pixels, no
anti-aliasing, no photorealism, no 3D render, no smooth digital painting.

Character sprite model sheet of a single character repeated in several views,
neutral flat mid-grey background, consistent design across all views, arcade
sprite proportions, orthographic reference lámina layout.

CHARACTER: argentine squadron leader, 44 years old, SHORT AND HEAVY, the
broadest man in the squadron, thick neck, barrel chest and wide shoulders,
iron-grey hair cropped almost to the scalp at the sides, deeply weathered face
with a permanent sun squint, thick grey brush mustache, worn brown leather
flight jacket over his olive flight suit adding bulk to the silhouette, white
flight helmet held low in one hand, never tucked under the arm, planted immovable
stance with feet apart.

SHEET CONTENTS, arranged left to right in one row: full-body front view standing
planted with feet apart, full-body three-quarter view, full-body side profile
emphasising the wide heavy silhouette, full-body view from behind; and along the
bottom a strip of four head close-ups: calm frank authority looking straight at
the viewer, giving an order, quiet sorrow, and exhausted after a mission.

Argentina 1982, no modern military equipment, no NATO or US insignia, no name
tags. 16:9 landscape. No text, no labels, no letters, no numbers, no watermark,
no signature.
```

---

## `{GITANO}` — la alegría del escuadrón

El que ceba, el que se ríe, el que profetiza la gambeta. Su mate es un marcador de identidad: va en
la hoja.

```
Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug (SNK Neo Geo
era), hand-drawn sprite look, chunky black pixel outlines, expressive exaggerated
character poses and faces, rich dithered shading, saturated military palette of
olive drab, steel blue-grey, silver and warm sand with a single red accent when
noted, dramatic cinematic side-scroller composition, crisp clean pixels, no
anti-aliasing, no photorealism, no 3D render, no smooth digital painting.

Character sprite model sheet of a single character repeated in several views,
neutral flat mid-grey background, consistent design across all views, arcade
sprite proportions, orthographic reference lámina layout.

CHARACTER: argentine pilot, 33 years old, curly dark hair, big warm grin, olive
flight suit, holding a traditional mate gourd with a metal straw in one hand.

SHEET CONTENTS, arranged left to right in one row: full-body front view standing
idle holding the mate gourd, full-body three-quarter view mid-laugh, full-body
side profile, full-body view from behind; and along the bottom a strip of four
head close-ups: big open laugh, teasing sideways smirk, arms-raised triumph, and
the smile falling off his face as bad news lands.

Argentina 1982, no modern military equipment, no NATO or US insignia, no name
tags. 16:9 landscape. No text, no labels, no letters, no numbers, no watermark,
no signature.
```

---

## `{VASCO}` — el silencio y el rezo

Contrapeso del Gitano. Su crucifijo es el detalle que lo identifica de lejos, así que va grande y
visible en el retrato.

```
Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug (SNK Neo Geo
era), hand-drawn sprite look, chunky black pixel outlines, expressive exaggerated
character poses and faces, rich dithered shading, saturated military palette of
olive drab, steel blue-grey, silver and warm sand with a single red accent when
noted, dramatic cinematic side-scroller composition, crisp clean pixels, no
anti-aliasing, no photorealism, no 3D render, no smooth digital painting.

Character sprite model sheet of a single character repeated in several views,
neutral flat mid-grey background, consistent design across all views, arcade
sprite proportions, orthographic reference lámina layout.

CHARACTER: argentine pilot, 36 years old, heavy brow, solemn quiet face, small
silver crucifix on a thin chain worn outside the collar, olive flight suit.

SHEET CONTENTS, arranged left to right in one row: full-body front view standing
still and quiet, full-body three-quarter view crossing himself, full-body side
profile, full-body view from behind; and along the bottom a strip of four head
close-ups: solemn neutral, eyes closed in prayer, jaw set in anger, and a rare
small smile.

Argentina 1982, no modern military equipment, no NATO or US insignia, no name
tags. 16:9 landscape. No text, no labels, no letters, no numbers, no watermark,
no signature.
```

---

## `{PICHON}` — el pibe

El más joven del aire, espejo de Mateo en tierra. **Su arco es el que más cambia de cara**, así que
su tira de expresiones es la más importante de todas: es el personaje que envejece durante el juego.

```
Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug (SNK Neo Geo
era), hand-drawn sprite look, chunky black pixel outlines, expressive exaggerated
character poses and faces, rich dithered shading, saturated military palette of
olive drab, steel blue-grey, silver and warm sand with a single red accent when
noted, dramatic cinematic side-scroller composition, crisp clean pixels, no
anti-aliasing, no photorealism, no 3D render, no smooth digital painting.

Character sprite model sheet of a single character repeated in several views,
neutral flat mid-grey background, consistent design across all views, arcade
sprite proportions, orthographic reference lámina layout.

CHARACTER: argentine rookie pilot, 22 years old, baby-faced, freckles, nervous
eyes, olive flight suit slightly too large for him, white flight helmet held with
both hands.

SHEET CONTENTS, arranged left to right in one row: full-body front view standing
with tense shoulders, full-body three-quarter view, full-body side profile,
full-body view from behind; and along the bottom a strip of four head close-ups
telling his arc: eager and nervous, wide-eyed terror, hollow thousand-yard stare,
and finally hardened and quiet — the same boy but no longer a boy.

Argentina 1982, no modern military equipment, no NATO or US insignia, no name
tags. 16:9 landscape. No text, no labels, no letters, no numbers, no watermark,
no signature.
```

---

# TIERRA Y BASE

## `{MATEO}` — el hijo. Protagonista del cuaderno

El que escribe las cartas. **Generá esta hoja junto con la de Esteban**: tienen que leerse como
padre e hijo sin que haga falta decirlo.

```
Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug (SNK Neo Geo
era), hand-drawn sprite look, chunky black pixel outlines, expressive exaggerated
character poses and faces, rich dithered shading, saturated military palette of
olive drab, steel blue-grey, silver and warm sand with a single red accent when
noted, dramatic cinematic side-scroller composition, crisp clean pixels, no
anti-aliasing, no photorealism, no 3D render, no smooth digital painting.

Character sprite model sheet of a single character repeated in several views,
neutral flat mid-grey background, consistent design across all views, arcade
sprite proportions, orthographic reference lámina layout.

CHARACTER: argentine conscript soldier, 18 years old, skinny, freshly shaved
head, big expressive dark eyes, oversized green wool coat far too big for his
frame, oversized helmet, a lined notebook and a blue ballpoint pen tucked in his
coat pocket. His face should read as a younger, softer version of a 41-year-old
pilot father: same eyes, same jaw not yet grown into.

SHEET CONTENTS, arranged left to right in one row: full-body front view standing
swallowed by the oversized coat, full-body three-quarter view sitting hunched and
writing in the notebook on his knee, full-body side profile, full-body view from
behind; and along the bottom a strip of four head close-ups: cocky teenage grin,
cold and hungry, frightened, and looking up at the sky with pure hope.

Argentina 1982, no modern military equipment, no NATO or US insignia, no name
tags. 16:9 landscape. No text, no labels, no letters, no numbers, no watermark,
no signature.
```

---

## `{TURCO}` — el mecánico

El que pinta las estrellitas. Es el corazón de la base y aparece en varios de los cuadros más
emotivos del Movimiento I: sus **manos** importan tanto como su cara.

```
Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug (SNK Neo Geo
era), hand-drawn sprite look, chunky black pixel outlines, expressive exaggerated
character poses and faces, rich dithered shading, saturated military palette of
olive drab, steel blue-grey, silver and warm sand with a single red accent when
noted, dramatic cinematic side-scroller composition, crisp clean pixels, no
anti-aliasing, no photorealism, no 3D render, no smooth digital painting.

Character sprite model sheet of a single character repeated in several views,
neutral flat mid-grey background, consistent design across all views, arcade
sprite proportions, orthographic reference lámina layout.

CHARACTER: argentine chief mechanic, late 50s, stocky, grease-stained blue
overalls, thick grey mustache, an oily rag hanging over one shoulder, kind tired
eyes, big weathered hands.

SHEET CONTENTS, arranged left to right in one row: full-body front view standing
with hands on hips, full-body three-quarter view holding a dented thermos and a
mate gourd, full-body side profile, full-body view from behind; and along the
bottom a strip of four close-ups: head with a warm gruff smile, head grieving
with the rag pressed to his face, one weathered hand holding a fine paintbrush,
and one weathered hand flat against aircraft metal.

Argentina 1982, no modern military equipment, no NATO or US insignia, no name
tags. 16:9 landscape. No text, no labels, no letters, no numbers, no watermark,
no signature.
```

---

## `{COLORADO}` — el cabo que cuida a los pibes

Mateo lo dibuja como un superhéroe con capa. Para que ese chiste funcione, la hoja "real" tiene que
mostrar a un tipo grandote y común — el contraste ES la ternura.

```
Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug (SNK Neo Geo
era), hand-drawn sprite look, chunky black pixel outlines, expressive exaggerated
character poses and faces, rich dithered shading, saturated military palette of
olive drab, steel blue-grey, silver and warm sand with a single red accent when
noted, dramatic cinematic side-scroller composition, crisp clean pixels, no
anti-aliasing, no photorealism, no 3D render, no smooth digital painting.

Character sprite model sheet of a single character repeated in several views,
neutral flat mid-grey background, consistent design across all views, arcade
sprite proportions, orthographic reference lámina layout.

CHARACTER: argentine army corporal, 26 years old, red hair, broad honest smile,
weathered freckled face, worn field uniform with a wool cap, sturdy build, no
cape — an ordinary big-hearted man.

SHEET CONTENTS, arranged left to right in one row: full-body front view standing
solid and reassuring, full-body three-quarter view handing over a food tin,
full-body side profile, full-body view from behind; and along the bottom a strip
of four head close-ups: broad honest laugh, worried but hiding it, shouting an
order, and utterly exhausted.

Argentina 1982, no modern military equipment, no NATO or US insignia, no name
tags. 16:9 landscape. No text, no labels, no letters, no numbers, no watermark,
no signature.
```

---

## `{NORMA}` — la madre

⚠️ **Su hoja es distinta a propósito, y esto es una decisión de guion.** El token dice *"almost
always seen from behind or in profile"*: no verle la cara es el dispositivo — es la que espera, la
que no vuela y no combate, y el juego nunca la enfrenta al espectador. **Una hoja con vista frontal
rompería eso**, y una vez generada el generador la va a usar.

Por eso su lámina no tiene frente: tiene espalda, perfiles y manos.

```
Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug (SNK Neo Geo
era), hand-drawn sprite look, chunky black pixel outlines, expressive exaggerated
character poses and faces, rich dithered shading, saturated military palette of
olive drab, steel blue-grey, silver and warm sand with a single red accent when
noted, dramatic cinematic side-scroller composition, crisp clean pixels, no
anti-aliasing, no photorealism, no 3D render, no smooth digital painting.

Character sprite model sheet of a single character repeated in several views,
neutral flat mid-grey background, consistent design across all views, arcade
sprite proportions, orthographic reference lámina layout.

CHARACTER: argentine mother, late 40s, apron over a plain dress, hair in a low
bun, warm and worn. IMPORTANT: her face is never fully shown — she is always seen
from behind, in profile, or partially turned away. This is deliberate.

SHEET CONTENTS, arranged left to right in one row: full-body view from behind
standing at a stove, full-body view from behind serving food with a ladle,
full-body side profile with her face half hidden by loose hair, full-body
three-quarter from behind sitting at a table; and along the bottom a strip of
three close-ups that are NOT face portraits: the back of her head and bun, her
hands wringing a kitchen towel, and her hands holding an unopened letter.

Argentina 1982, no frontal face view, no eye contact with the viewer. 16:9
landscape. No text, no labels, no letters, no numbers, no watermark, no
signature.
```

---

# VEHÍCULOS

Los dos van con **vistas ortográficas**, no con poses: una hoja de vehículo sirve para dibujarlo
igual desde cualquier ángulo, no para actuar.

## `{SKYHAWK}` — el avión de Esteban

> Ojo: esta hoja es **para las cinemáticas**, no para el juego. El A-4 jugable ya tiene su hoja de
> sprites horneada desde un modelo 3D (`tools/bake_planes.html`). Son dos pipelines distintos y no
> hay que mezclarlos — pero el avión de las cinemáticas y el del gameplay tienen que **parecerse**,
> así que conviene generar esta hoja mirando el sprite del juego al lado.

```
Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug (SNK Neo Geo
era), hand-drawn sprite look, chunky black pixel outlines, rich dithered shading,
saturated military palette of olive drab, steel blue-grey, silver and warm sand,
crisp clean pixels, no anti-aliasing, no photorealism, no 3D render, no smooth
digital painting.

Vehicle orthographic model sheet, single aircraft repeated in multiple views,
neutral flat mid-grey background, consistent design and consistent scale across
all views.

VEHICLE: A-4 Skyhawk attack jet, silver-grey, blue-and-white Argentine roundel,
worn and weathered painted metal, single seat, short delta-ish wings, 1982
Argentine Air Force service condition.

SHEET CONTENTS: side view, top view, front view, rear view, and one dramatic
three-quarter hero view; plus two detail insets: the cockpit canopy with the
pilot's helmet visible inside, and a close-up of the clean painted area below the
cockpit where a row of tiny victory stars is painted.

Argentina 1982, no modern avionics, no NATO or US markings. 16:9 landscape. No
text, no labels, no letters, no numbers, no watermark, no signature.
```

---

## `{RASTROJERO}` — la camioneta del padre

Es el objeto que abre y cierra el juego (el arroyo del prólogo y el epílogo). Tiene que poder
dibujarse **en color** para el `[AIRE]` y **en azul de birome** para el cuaderno, así que la hoja va
en `[AIRE]` y el estilo `[TIERRA]` se aplica después sobre la misma silueta.

```
Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug (SNK Neo Geo
era), hand-drawn sprite look, chunky black pixel outlines, rich dithered shading,
saturated palette of faded work-truck paint, rust orange and warm sand, crisp
clean pixels, no anti-aliasing, no photorealism, no 3D render, no smooth digital
painting.

Vehicle orthographic model sheet, single vehicle repeated in multiple views,
neutral flat mid-grey background, consistent design and consistent scale across
all views.

VEHICLE: rusty old Argentine Rastrojero pickup truck, 1960s utilitarian workhorse,
rounded cab, simple flat bed, faded paint, dents, one mismatched panel, farm dust.

SHEET CONTENTS: side view, front view, rear view with the tailgate down, top
view, and one three-quarter view parked on a dirt road; plus one detail inset of
the worn driver's door handle and side mirror.

Argentina, rural, period-correct 1960s-70s vehicle. 16:9 landscape. No text, no
labels, no letters, no numbers, no watermark, no signature.
```

---

# EXTRA — la hoja que el storyboard no pide pero conviene tener

## `{TRAZO_MATEO}` — cómo dibuja Mateo

Los cuadros `[TIERRA]` no solo muestran cartas: muestran **dibujos hechos por un personaje**. El
Colorado con capa, las cajas y los pibes, el barco chueco. Si cada uno se genera suelto, cada dibujo
va a parecer de una mano distinta — y el cuaderno es de **una** persona.

Esta hoja fija esa mano. Además, el storyboard dice que el trazo de Mateo **evoluciona** (prolijo en
M1–M3, oscuro y ralo en el Movimiento III, luminoso en M7): la hoja incluye esa curva, así se puede
pedir "el trazo de la etapa 3" más adelante.

```
Naive pixel art sketch drawn entirely in blue ballpoint-pen tones on a lined
notebook-paper background, Metal Slug-inspired sprite proportions but drawn like
an 18-year-old soldier's heartfelt doodle, single-color blue palette with
dithered shading, cream paper texture with faint ruled lines, ink smudges and
damp stains rendered as pixels, crisp clean pixels, no anti-aliasing, hand-made
naive feel, no photorealism, no 3D render.

Style reference sheet showing the SAME young soldier's drawing hand across four
stages, as four small doodles on one notebook page: (1) early, neat and curious
with careful outlines and small hopeful details; (2) confident, bigger and more
expressive; (3) late, dark and sparse — heavy pen pressure, lots of shading,
almost no detail, like someone too tired to finish; (4) one radiant carefully
worked drawing, the most detailed of all, made with obvious love.

Each doodle simple: a little plane, a little soldier, a stick figure. Consistent
hand, consistent pen, consistent proportions. 3:4 vertical notebook page. No
text, no letters, no numbers, no watermark, no signature.
```

---

# Tabla de tokens AMPLIADA

Estos son los descriptores actualizados **con lo que se agregó en las hojas**. Si vas a usar las
hojas de arriba, reemplazá con esta tabla la de `STORYBOARD_1.md` — si no, los cuadros de cinemática
van a perder detalles que la hoja sí tiene.

| Token | Descriptor (inglés, pegar tal cual) |
|---|---|
| `{ESTEBAN}` | argentine fighter pilot, 41 years old, **tall and lean, wiry narrow build, neck carried slightly forward**, weathered handsome face, **clean-shaven**, short dark hair greying at the temples, strong jaw, tired warm eyes, olive-green flight suit **with no jacket**, white flight helmet **under one arm** |
| `{MATEO}` | argentine conscript soldier, 18 years old, skinny, freshly shaved head, big expressive dark eyes, oversized green wool coat, oversized helmet, notebook and blue pen in his coat pocket, clearly the son of a 41-year-old pilot |
| `{PUMA}` | argentine squadron leader, 44 years old, **short and heavy, barrel chest, thick neck**, calm stern face, **iron-grey hair cropped to the scalp**, sun-squinted eyes, thick grey **brush** mustache, **brown leather flight jacket over** his olive flight suit |
| `{GITANO}` | argentine pilot, 33 years old, curly dark hair, big warm grin, mate gourd in hand, olive flight suit |
| `{VASCO}` | argentine pilot, 36 years old, heavy brow, solemn quiet face, small silver crucifix on a chain worn outside the collar, olive flight suit |
| `{PICHON}` | argentine rookie pilot, 22 years old, baby-faced, freckles, nervous eyes, slightly too-large flight suit |
| `{TURCO}` | argentine chief mechanic, late 50s, stocky, grease-stained blue overalls, thick grey mustache, rag over one shoulder, kind tired eyes, big weathered hands |
| `{COLORADO}` | argentine corporal, 26 years old, red hair, broad honest smile, weathered freckled face, field uniform with a wool cap |
| `{NORMA}` | argentine mother, late 40s, apron over a plain dress, hair in a low bun, **always seen from behind or in profile, face never fully shown** |
| `{SKYHAWK}` | A-4 Skyhawk attack jet, silver-grey, blue-white Argentine roundel, worn painted metal, single seat |
| `{RASTROJERO}` | rusty old Argentine Rastrojero pickup truck, 1960s workhorse |

En **negrita** lo que cambió respecto de la tabla original: la separación de silueta entre Tero y
Puma, el parecido de familia de Mateo, el crucifijo del Vasco fuera del cuello, la gorra del
Colorado, las manos del Turco y la regla de Norma.

---

## ⚠ Lo mismo pasa con el resto del reparto (pendiente de decidir)

Tero y Puma no eran un caso aislado: **cinco pilotos con el mismo traje verde oliva** es la receta
para que todos se lean igual. Y hay un choque más, que ya venía de la tabla original: **Puma y el
Turco comparten "thick grey mustache"**, los dos mayores y corpulentos — se salvan solo porque el
Turco va de azul.

Propuesta, con el mismo criterio (que se distingan de espaldas y a veinte píxeles):

| personaje | marca de silueta propuesta |
|---|---|
| `{GITANO}` | el **más suelto**: traje de vuelo bajado hasta la cintura con las mangas atadas, camiseta debajo, pelo rulo alto y voluminoso. Siempre en movimiento, siempre con el mate |
| `{VASCO}` | el **más vertical y cerrado**: alto y angosto, hombros caídos, el traje cerrado hasta el cuello (su carácter es el cierre subido), quieto, manos a los costados |
| `{PICHON}` | el **más chico**: el traje le queda grande y le sobra tela en todos lados, casco agarrado con las dos manos contra el pecho |
| `{TURCO}` | bigote **de morsa, caído** (no de cepillo como Puma), calvo arriba con pelo gris a los costados, gorra de tela, panza redonda, anteojos subidos a la frente |

Con eso el escuadrón queda: **el más alto y flaco** (Tero), **el más ancho** (Puma), **el más
abierto** (Gitano), **el más cerrado** (Vasco) y **el más chico** (Pichón). Cinco siluetas que no se
confunden ni en contraluz.

**No lo apliqué todavía** — decime y actualizo los cuatro prompts y la tabla de una.

---

# Checklist al aprobar cada hoja

- [ ] ¿Las cuatro vistas son **el mismo** personaje? (el error más común: la vista de atrás sale de
      otra persona)
- [ ] ¿Los colores del uniforme coinciden entre vistas?
- [ ] ¿Cero texto, cero marca de agua?
- [ ] ¿Se ve como pixel art de verdad, o es pixel art "falso" borroso? (si es falso: agregar
      `pixel-perfect grid` y regenerar)
- [ ] ¿Equipo de 1982, sin nada moderno?
- [ ] Norma: ¿**no** se le ve la cara de frente?
- [ ] ¿Anotaste el seed?
