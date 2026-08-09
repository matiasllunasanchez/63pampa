# RASANTE — Storyboard 1: Prólogo + Movimiento I (M1–M3)

> Guion visual viñeta por viñeta del [GUION_2.md](GUION_2.md), con un prompt listo para
> pegar en el generador de imágenes por cada cuadro. Cubre Prólogo y Misiones 1–3. Cuando
> este sistema esté validado, el resto de la campaña sale en serie con el mismo molde.
>
> **⚠ ACTUALIZACIÓN 3.0 — leer la sección «ACTUALIZACIÓN 3.0» al final ANTES de generar.**
> Renumeración: los cuadros M3.x de este documento corresponden ahora a la **MISIÓN 4**
> (Sheffield). Las misiones nuevas (M3 «El invento», M10 «Los primos»), la escena P.0, el
> terito y las marcas personales de casco están en esa sección. Sincronizado con GUION_3.
> **Sincronizado originalmente con GUION 2.3.** Las hojas modelo de personaje y las de props viven en
> [PROMPTS_HOJAS_PERSONAJE.md](PROMPTS_HOJAS_PERSONAJE.md) — generá y aprobá esas ANTES de
> generar cuadros, y usá siempre sus tokens.

---

## 0b. Tercer registro visual — la carta del padre *(nuevo en 2.1)*

El guion tiene ahora **tres** registros, no dos. Además de `[AIRE]` y `[TIERRA]`:

**`[CARTA]`** — 🟨 **CORREGIDO (3.0+):** ya NO existen los cinco fragmentos entre misiones.
**Hay UNA sola carta en todo el juego**: la que Esteban le escribe a **Norma** la noche del
asado (M13), **por las dudas**, sin saber que al día siguiente hay salida. Se la ve escribir
pero **no se lee ni una línea** — y solo se abre en el **epílogo del Final A**. El registro
`[CARTA]` se usa entonces DOS veces: el sobre cerrado con el nombre "Norma" (M13) y la hoja
leída (Final A). Sigue siendo lo mismo visualmente: un hombre que no sabe escribir lo que
siente y lo intenta igual.

```
Detailed 90s arcade pixel art close-up of a single sheet of military-issue lined
block paper on a bare table under a hard single-source lamp, the sheet folded in
four with soft worn creases, covered in cramped tight adult printed handwriting
with several heavy angry crossings-out, a cheap pen resting on it, deep shadows
around the pool of lamplight, chunky black pixel outlines, dithered shading,
muted olive and warm paper tones, crisp clean pixels, no anti-aliasing.
```

La regla visual: el papel de Mateo es **claro y ancho** (cuaderno escolar, letra grande,
dibujos); el de Esteban es **oscuro y apretado** (block militar, letra chica, tachones). Un
vistazo tiene que bastar para saber quién escribe.

---

## 0. Sistema de producción — leer antes de generar

### El estilo maestro: pixel art tipo METAL SLUG

**Todo el juego se genera en UN solo estilo maestro:** pixel art de arcade run-and-gun de
los 90 — la escuela Metal Slug / Neo Geo. Sprites que parecen dibujados a mano, contornos
negros gruesos, poses expresivas y exageradas, sombreado con dithering, paleta saturada
militar. Coincide con el arte del propio juego, así las cinemáticas y el gameplay son un
mismo mundo.

Los dos registros del guion (aire / cuaderno) **no se distinguen por técnica sino por
paleta y tratamiento**: el `[AIRE]` es pixel art a todo color; el `[TIERRA]` es el mismo
pixel art pero monocromo azul-birome sobre fondo de hoja de cuaderno — el cuaderno de
Mateo "dibujado en píxeles". Así el dispositivo narrativo del cuaderno sobrevive al cambio
de estilo.

Cada prompt empieza con su bloque. **Copiá el bloque tal cual al inicio del prompt y
después pegá la escena.**

**`[AIRE]`** — cinemáticas del "mundo real 1982": base, cabina, combate, cocina, plaza.

```
Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug (SNK Neo Geo
era), hand-drawn sprite look, chunky black pixel outlines, expressive exaggerated
character poses and faces, rich dithered shading, saturated military palette of
olive drab, steel blue-grey, silver and warm sand with a single red accent when
noted, dramatic cinematic side-scroller composition, crisp clean pixels, no
anti-aliasing, no photorealism, no 3D render, no smooth digital painting.
```

**`[TIERRA]`** — las páginas del cuaderno de Mateo: cartas y dibujos.

```
Naive pixel art sketch drawn entirely in blue ballpoint-pen tones on a lined
notebook-paper background, Metal Slug-inspired sprite proportions but drawn like
an 18-year-old soldier's heartfelt doodle, single-color blue palette with
dithered shading, cream paper texture with faint ruled lines, ink smudges and
damp stains rendered as pixels, crisp clean pixels, no anti-aliasing, hand-made
naive feel, no photorealism, no 3D render.
```

**Nota de derechos sobre "Metal Slug":** es marca de SNK. Como keyword de estilo dentro
del generador funciona y el estilo visual en sí no es protegible, pero el bloque describe
el estilo por sus atributos (Neo Geo era, chunky outlines, dithering) para que rinda igual
si tu generador rechaza la marca — en ese caso borrá "in the style of Metal Slug (SNK Neo
Geo era)" y listo. Y en el marketing de Steam nunca escribas "estilo Metal Slug": decí
"90s arcade pixel art".

**Tip de resolución:** generá grande (la resolución nativa del generador) y después
reducí a la resolución del juego con nearest-neighbor para que el píxel quede crocante.
Si el generador saca "falso pixel art" borroso, agregá `pixel-perfect grid` al prompt.

**Excepción de apertura:** la escena P.1 (el arroyo) va en `[TIERRA]` aunque sea "mundo
real": es la primera página del cuaderno, y el epílogo la vuelve a mostrar. El juego ABRE
en azul-birome, y recién con la guerra entra el color pleno del `[AIRE]`. Esa transición
es narrativa: la infancia es del cuaderno; la guerra es de la máquina.

### Regla de texto — ESPAÑOL ARGENTINO SIEMPRE

**Todo texto que aparezca DENTRO de una imagen (carteles, globos, letras, tapas, grafitis)
va en español argentino, con voseo.** En cada prompt el texto exacto va indicado como
`TEXT IN IMAGE (Argentine Spanish): "..."`. Dos caminos:

1. Pedirle el texto al generador (los actuales suelen escribir bien, pero verificá
   ortografía letra por letra: "birome no perdona").
2. **Recomendado para cartas largas:** generar el cuadro SIN texto (agregá `no text` al
   prompt) y tipografiar encima en el juego con las fuentes manuscritas ya elegidas
   (`assets/fonts/simple/` — ver [REFERENCIAS.md](REFERENCIAS.md)). Así el texto queda
   editable y traducible.

### Fichas de personaje — tokens de consistencia

Para que cada personaje sea EL MISMO en todos los cuadros, usá siempre el mismo descriptor.
Pegá el token donde el prompt diga el nombre. Generá primero una "hoja modelo" por
personaje (prompt de ficha al final de esta sección) y usala como referencia de imagen si
tu generador soporta image reference.

> ⚠️ **Tabla v2 — revisada por época.** La v1 de esta tabla producía un reparto de soldados
> norteamericanos genéricos: Mateo con capote largo de la Segunda Guerra, los cinco pilotos con la
> misma silueta y caras del norte de Europa. Los descriptores de abajo ya incorporan el equipo
> argentino real del 82 y la separación de siluetas del escuadrón. La justificación completa, la
> auditoría de los errores y los prompts largos de hoja modelo están en
> [PROMPTS_HOJAS_PERSONAJE.md](PROMPTS_HOJAS_PERSONAJE.md).

| Token | Descriptor (inglés, pegar tal cual) |
|---|---|
| `{ESTEBAN}` | argentine air force pilot, 41 years old, very tall and very thin, gaunt and narrow, the tallest and thinnest of the squadron, neck carried forward, criollo features, olive skin, black hair greying at the temples, clean-shaven, tired warm eyes, olive flight suit unzipped to mid-chest, no jacket, white 1960s flight helmet with oxygen mask hanging under one arm — the helmet PLAIN WHITE with no personal markings —, black leather flight boots |
| `{MATEO}` | argentine army conscript, 18 years old and reads as 18, skinny teenager, criollo features, olive skin, black hair, patchy teenage mustache, hip-length oversized olive hooded parka (NOT a long coat), argentine brown leather webbing with canteen, unmarked steel helmet with cloth cover over a wool cap, brown leather boots caked in peat mud, notebook and blue pen in his pocket, wind-burnt face, cracked lips, clearly the son of a tall lean 41-year-old pilot |
| `{PUMA}` | argentine squadron leader, 44 years old, short and very heavy, squat, the broadest and shortest of the squadron, criollo, sun-darkened, iron-grey hair cropped to the scalp, sun-squinted eyes, grey BRUSH mustache, brown leather flight jacket over his olive flight suit, helmet held low in one hand — TWO thin crisp dark stripes painted across it —, flight scarf knotted with regulation precision, black leather flight boots |
| `{GITANO}` | argentine pilot, 33 years old, the most open silhouette: flight suit pulled down to the waist with sleeves knotted in front, white undershirt, bare arms, tall voluminous black curly hair, the darkest-skinned of the squadron, big warm grin, brown gourd mate with metal bombilla in hand, a single CROOKED hand-painted red stripe on his helmet, black leather flight boots |
| `{VASCO}` | argentine pilot, 36 years old, the most closed silhouette: tall and narrow, sloping shoulders, flight suit zipped to the chin, arms straight at his sides, motionless, pale skin, basque features, heavy brow, solemn face, LARGE silver crucifix worn outside the collar, plain unmarked helmet, black leather flight boots |
| `{PICHON}` | argentine rookie pilot, 22 years old, the smallest of the squadron, reads as a boy among men, criollo, olive skin, baby face, freckles, nervous eyes, flight suit clearly too big, sleeves swallowing his hands, helmet held with both hands against his chest, a carpenter's pencil tucked crosswise under the helmet band, half-erased pencil formulas on the back of his left hand |
| `{TURCO}` | argentine chief mechanic, late 50s, syrian-lebanese descent, olive skin, hooked nose, stocky with a round belly, bald on top with grey sides, cloth cap, glasses pushed up on his forehead, grey DROOPING WALRUS mustache, grease-stained blue overalls plain and unmarked on the back, rag over one shoulder, a small white hand-painted star on the front of his cloth cap, big weathered hands |
| `{COLORADO}` | argentine corporal, 26 years old, tall and sturdy, fair freckled skin raw red from the cold, red hair, broad honest smile, plain olive field uniform with NO insignia, wool cap, argentine brown leather webbing with canteen, muddy brown leather boots |
| `{NORMA}` | argentine mother, 47 years old, middle-aged not elderly, dark hair with grey at the temples in a low bun, criolla, warm tired face, gentle firm expression, faded blue dress with a cream floral apron, always the same apron, no military insignia of any kind |
| `{SKYHAWK}` | A-4B Skyhawk attack jet, bare silver-grey metal, blue-white argentine roundel, worn painted metal, single seat, a row of small plain white stars below the cockpit |
| `{RASTROJERO}` | rusty old Argentine Rastrojero pickup truck, 1960s workhorse |

**Candado de época — pegalo al final de CADA cuadro que tenga personas:**

```
Argentina 1982, no modern military equipment, no NATO or US insignia, no invented
unit patches, no national flag on clothing, argentine latin-american faces.
```

**Prompt de hoja modelo:** el corto de acá abajo sirve para una prueba rápida, pero para las hojas
definitivas usá los prompts largos y cerrados de
[PROMPTS_HOJAS_PERSONAJE.md](PROMPTS_HOJAS_PERSONAJE.md) — el corto no lleva el candado de época y
por eso salieron mal las primeras.

```
[AIRE] Character sprite model sheet, {TOKEN}, front view, three-quarter view and
profile, idle standing pose, full body plus a face portrait close-up, neutral flat
background, consistent design, arcade sprite proportions. Argentina 1982, no modern
military equipment, no NATO or US insignia, no invented unit patches, no national
flag on clothing. No text, no watermark.
```

### Formatos

- Cuadros de cinemática `[AIRE]`: **16:9** (pantalla completa entre niveles).
- Páginas de carta y dibujos `[TIERRA]`: **3:4 vertical** (una hoja de cuaderno).
- Agregá siempre al final del prompt: `no watermark, no signature`.
  (Steam: las imágenes van sin marcas — ver Pendientes en REFERENCIAS.md.)

### Gramática de cuadros

Cada viñeta se anota así:

- **Plano** — encuadre y composición, en criollo, para vos y para el artista.
- **PROMPT** — listo para pegar: `[ESTILO]` + escena + `TEXT IN IMAGE` si corresponde.
- **Texto en pantalla** — lo que el motor del juego tipografía encima (no va al generador).

---

# PRÓLOGO — "El cielo compartido"

## Escena P.1 — El arroyo *(estilo TIERRA — la primera página del cuaderno)*

### Cuadro P1.1 — El campo
**Plano:** general amplio, horizonte bajo pampeano. El Rastrojero al costado, el arroyo
cruzando, dos figuras chiquitas — padre e hijo — a la orilla. Arriba, enorme cielo con una
estela de avión. La escala dice: el cielo es el protagonista.

**PROMPT:**
```
[TIERRA] Wide rural Argentine pampa landscape in blue pixel-sketch style, low horizon,
a small rusty {RASTROJERO} parked by a dirt road, a little stream crossing the
field, two tiny figures by the water: a father and his small son, an enormous sky
above them with a single jet contrail crossing diagonally, naive child-memory
warmth, 3:4 vertical notebook page. No text, no watermark, no signature.
```

### Cuadro P1.2 — El sapito
**Plano:** detalle. La mano del padre soltando la piedra chata; la piedra ya picó tres
veces sobre el agua, tres coronitas de salpicadura en secuencia. Movimiento dibujado con
rayitas, como dibuja un pibe.

**PROMPT:**
```
[TIERRA] Close-up pixel-sketch drawing of a man's hand releasing a flat skipping
stone over a stream, the stone bouncing three times leaving three small splash
crowns in sequence, naive motion lines drawn like a kid draws speed, water ripples
in blue dithered pixels, 3:4 vertical notebook page. No text, no watermark.
```

### Cuadro P1.3 — "Los valientes vuelan abajo"
**Plano:** medio. Esteban en cuclillas señalando el cielo; Mateo nene mirando hacia
arriba con la boca abierta. El avión de la estela, chiquito, justo donde apunta el dedo.

**PROMPT:**
```
[TIERRA] Blue pixel-sketch drawing, a young father in aviator uniform crouching beside
his 8-year-old son in a field, the father pointing up at a tiny jet with a long
contrail, the boy looking up open-mouthed in wonder, warm naive linework, big sky,
3:4 vertical notebook page. TEXT IN IMAGE (Argentine Spanish, handwritten caption
under the drawing): "Los valientes vuelan abajo." No watermark.
```

**Texto en pantalla (motor, tipografía manuscrita):** el diálogo completo de la escena
(GUION_2, P.1) sobre el cuadro o en cartela inferior.

### Cuadro P1.4 — Cartel de transición
**Plano:** el mismo campo, pero vacío: el Rastrojero solo, el arroyo, nadie. La estela del
avión deshaciéndose. Silencio dibujado.

**PROMPT:**
```
[TIERRA] The same Argentine field now empty, the rusty {RASTROJERO} alone by the
dirt road, the stream, no people, a fading jet contrail dissolving in the big sky,
melancholic stillness, sparse pixel-sketch linework with lots of empty paper, 3:4
vertical notebook page. No text, no watermark.
```

**Texto en pantalla:** *"La tierra iba a ser lo único que le quedara."*

---

## Escena P.2 — La cocina *(estilo AIRE — acá entra la guerra y entra la tinta)*

### Cuadro P2.1 — La mesa
**Plano:** general de cocina argentina de 1982: mantel de hule floreado, pava en la
hornalla, radio a transistores en la mesada, repasador colgado. Mateo (rapado, 18) y
Esteban enfrentados en la mesa; Norma de espaldas sirviendo. Luz cálida de tubo de cocina.

**PROMPT:**
```
[AIRE] Interior of a modest 1982 Argentine family kitchen, floral oilcloth on the
table, kettle on the stove, small transistor radio on the counter, {MATEO} with
freshly shaved conscript head sitting across from {ESTEBAN} in civilian clothes,
{NORMA} standing with her back turned serving food, warm domestic lamplight,
intimate composition, 16:9. No text, no watermark.
```

### Cuadro P2.2 — La chicana del Rastrojero
**Plano:** dos planos cortos enfrentados en un mismo cuadro partido (split panel): Mateo
sonriendo canchero; Esteban con media sonrisa que no le llega a los ojos.

**PROMPT:**
```
[AIRE] Split comic panel, two facing close-ups across a kitchen table: left, an
18-year-old with shaved head grinning cocky and young; right, his father {ESTEBAN}
with a half-smile that does not reach his worried eyes, warm kitchen light,
emotional contrast between the two faces, 16:9. No text, no watermark.
```

**Texto en pantalla:** el diálogo del Rastrojero (GUION_2, P.2).

### Cuadro P2.3 — La radio
**Plano:** detalle dramático: la radio a transistores en primer plano, enorme, con ondas
dibujadas saliendo del parlante. Detrás, desenfocadas, las tres figuras quietas.

**PROMPT:**
```
[AIRE] Dramatic close-up of a 1970s transistor radio on a kitchen counter, drawn
sound waves radiating from the speaker filling the panel, in the blurred
background three motionless family figures at a table, ominous mood, deep pixel
shadows, 16:9. TEXT IN IMAGE (Argentine Spanish, radio speech ribbon): "...tropas
argentinas desembarcaron esta madrugada en las Islas Malvinas..." No watermark.
```

### Cuadro P2.4 — La pava que nadie saca
**Plano:** la cocina entera congelada. La pava chiflando con vapor dibujado en espiral;
nadie se mueve. Norma detenida con el cucharón en el aire, de espaldas.

**PROMPT:**
```
[AIRE] The same Argentine kitchen frozen in time, the kettle whistling with a
spiral of steam, {NORMA} from behind stopped mid-gesture with a ladle in the air,
father and son motionless at the table, nobody moves, heavy silence rendered in
still pixels, long shadows, 16:9. No text, no watermark.
```

### Cuadro P2.5 — La Plaza
**Plano:** aéreo de Plaza de Mayo repleta, 2 de abril: un mar de gente, banderas
argentinas, papelitos. Épico y ambiguo a la vez: la multitud vista desde tan arriba que
parece marea.

**PROMPT:**
```
[AIRE] Aerial view of Plaza de Mayo Buenos Aires 1982 completely packed with a sea
of people, Argentine flags waving, confetti in the air, the Casa Rosada facade at
the top of the frame, the crowd rendered as an ocean-like mass in dithered pixels,
epic yet ambiguous mood, 16:9. No text, no watermark.
```

### Cuadro P2.6 — El balcón
**Plano:** contraluz desde ATRÁS del balcón: la silueta de una figura militar de espaldas,
brazos abiertos ante la multitud infinita. **Nunca la cara** — no es un retrato, es el
poder de espaldas a nosotros.

**PROMPT:**
```
[AIRE] View from behind a presidential balcony, the dark silhouette of a military
figure with arms raised addressing an infinite crowd below, seen entirely from the
back, face never visible, the crowd a sea of tiny flags, strong backlight,
oppressive triumphal atmosphere, high-contrast pixel shading, 16:9. No text, no watermark.
```

**Texto en pantalla:** *"Si quieren venir, que vengan. Les presentaremos batalla."* +
cartel: *"En esa cocina, un padre que conocía la guerra de verdad no salió a festejar."*

---

## Escena P.3 — Lo que un padre puede y lo que no *(AIRE)*

### Cuadro P3.1 — El teléfono de la base
**Plano:** nocturno. Esteban de uniforme en un pasillo de base militar, encorvado sobre un
teléfono de pared, tapándose la otra oreja. Un tubo fluorescente lo alumbra desde arriba,
frío. Sombra larga.

**PROMPT:**
```
[AIRE] Night interior of a military base corridor, {ESTEBAN} hunched over a
wall-mounted rotary phone, covering his other ear with one hand, lit harshly from
above by a single fluorescent tube, long dramatic shadow on the floor, desperate
body language, cold light, deep black pixel shading, 16:9. No text, no watermark.
```

### Cuadro P3.2 — El montaje de los papeles
**Plano:** tríptico dentro del cuadro (tres insertos): manos firmando un formulario /
un sello que cae sobre papel / una carpeta que se cierra. La burocracia como máquina.

**PROMPT:**
```
[AIRE] Comic panel divided in three vertical inset strips: hands signing an
official form with a fountain pen, a rubber stamp slamming down on a document, a
manila folder being closed, bureaucratic machine mood, harsh office lighting,
dithered shading, 16:9. No readable text on the documents, no watermark.
```

### Cuadro P3.3 — La puerta
**Plano:** un pasillo de ministerio, alto y solemne. Una puerta doble de madera
cerrándose; por la ranura que queda, apenas la mitad de la cara de Esteban afuera.

**PROMPT:**
```
[AIRE] Tall solemn ministry hallway, heavy double wooden doors closing, through
the narrowing gap only half of {ESTEBAN}'s face visible standing outside, marble
floor reflections, crushing institutional architecture towering over the small
human figure, high contrast pixels, 16:9. No text, no watermark.
```

### Cuadro P3.4 — Tono de ocupado
**Plano:** primer plano definitivo: Esteban con el tubo todavía en la oreja, mirada al
vacío. Del auricular salen dibujadas las ondas cortas y repetidas del tono de ocupado.
Es EL cuadro de la impotencia del padre.

**PROMPT:**
```
[AIRE] Extreme close-up of {ESTEBAN} still holding a phone receiver to his ear,
eyes staring into nothing, defeated, small repeated sound-wave marks drawn coming
from the earpiece suggesting a busy tone, night background out of focus, tragic
stillness, masterful pixel-art portrait, 16:9. No text, no watermark.
```

**Texto en pantalla:** *"Aldao. Su hijo ya está embarcado. Está en las islas. Lo siento."*
+ cartel: *"Le quedaba una sola manera de estar cerca: el cielo."*

---

## Escena P.4 — La primera página del cuaderno *(TIERRA)*

### Cuadro P4.1 — La carta
**Plano:** la hoja de cuaderno completa, vertical, con la primera carta de Mateo. Generar
SIN texto y tipografiar encima con la fuente manuscrita del juego (recomendado).

**PROMPT:**
```
[TIERRA] A full lined Rivadavia notebook page seen from above on a rough wooden
surface, slightly curled corners, damp stain in one corner, a cheap blue ballpoint
pen resting beside it, empty writing lines ready for handwritten text, soft cold
window light, 3:4 vertical. No text, no watermark.
```

**Texto en pantalla:** la carta completa de P.4 (GUION_2), fuente manuscrita.

### Cuadro P4.2 — El dibujito del pozo
**Plano:** al pie de la hoja, el primer dibujo de guerra de Mateo: un pozo con dos
casquitos asomando y arriba, desproporcionado y enorme, un avión. La desproporción ES el
mensaje: el padre gigante en el cielo del hijo.

**PROMPT:**
```
[TIERRA] Naive pixel doodle at the bottom of a notebook page: a small foxhole
with two tiny helmeted heads peeking out, and above them a huge oversized
fighter jet drawn way out of scale filling the sky, childlike proportions full of
feeling, blue pixels on lined paper, 3:4 vertical. TEXT IN IMAGE (Argentine Spanish,
shaky handwriting under the plane): "papá". No watermark.
```

---

# MISIÓN 1 — "Sal en las alas"

## Briefing *(AIRE)*

### Cuadro M1.1 — La línea de vuelo
**Plano:** general de amanecer en Río Gallegos: cuatro Skyhawks plateados escarchados en
fila, vapor de aliento, cielo patagónico rosa y acero. La primera postal épica del juego.

**PROMPT:**
```
[AIRE] Dawn at a Patagonian airbase 1982, four frost-covered silver {SKYHAWK}
jets lined up on the flightline, ground crew breath visible in the freezing air,
pink and steel-grey southern sky, vast flat horizon, epic quiet before the war,
wide cinematic composition, 16:9. No text, no watermark.
```

### Cuadro M1.2 — La comunión del mate
**Plano:** grupal cálido: el Turco cebando de un termo abollado y pasando el mate a la
ronda de pilotos. Cada Fiel reconocible: Puma sereno, Gitano riendo, Vasco serio, Pichón
nervioso, Esteban recién llegado, un paso afuera de la ronda todavía.

**PROMPT:**
```
[AIRE] Group scene on a cold flightline at dawn, {TURCO} pouring mate from a
dented thermos and passing the gourd around a circle of five pilots: {PUMA} calm
and solid, {GITANO} laughing, {VASCO} solemn, {PICHON} nervous, and {ESTEBAN}
standing half a step outside the circle as the newcomer, warm camaraderie inside
freezing air, jets in the background, 16:9. No text, no watermark.
```

### Cuadro M1.3 — La regla número uno
**Plano:** primer plano de Puma, casco bajo el brazo, mirada franca al frente (casi a
cámara). Detrás, fuera de foco, el mar.

**PROMPT:**
```
[AIRE] Close-up portrait of {PUMA} holding his flight helmet under one arm,
looking almost directly at the viewer with calm frank authority, the grey South
Atlantic sea out of focus behind him, fatherly commanding presence, strong
pixel-art portrait work, 16:9. No text, no watermark.
```

**Texto en pantalla:** *"Pegado al agua el radar de ellos no te ve. Volás tan bajo que
volvés con sal en las alas."*

### Cuadro M1.4 — Chistes y rezos
**Plano:** dos tiempos en un cuadro partido: izquierda, Gitano a carcajadas señalando a
Pichón que se ríe nervioso; derecha, el Vasco aparte, persignándose contra el amanecer.
El chiste y el rezo: la misma oración.

**PROMPT:**
```
[AIRE] Split comic panel: left side {GITANO} laughing heartily teasing a nervous
smiling {PICHON}; right side {VASCO} standing apart in silhouette against the
dawn, crossing himself quietly, humor and prayer side by side as two forms of the
same ritual, emotional contrast, 16:9. No text, no watermark.
```

### Cuadro M1.5 — El Turco y el avión
**Plano:** el Turco palmeando el fuselaje del Skyhawk de Esteban como a un caballo, mejilla
casi apoyada en la chapa. Debajo de la cabina, un espacio vacío pintado donde van a ir las
estrellitas.

**PROMPT:**
```
[AIRE] {TURCO} patting the silver fuselage of a {SKYHAWK} tenderly like a horse,
his cheek almost resting against the metal, below the cockpit a small clean blank
space on the paint where tiny stars will be painted, morning light on worn
aluminum, quiet love between a mechanic and his machine, 16:9. No text, no
watermark.
```

**Texto en pantalla:** *"Traémela entera, Tero. Y traete vos adentro, que la estrellita la
pinto por vos, no por ella."*

### Cuadro M1.5b — La casada *(nuevo en 2.2 — se siembra el gag)*
**Plano:** el Gitano en primer término, cómplice, hablándole al Pichón y señalando con el
pulgar por encima del hombro; al fondo y desenfocado, el Vasco subiendo la escalerilla de
espaldas, sin darse vuelta. **El chiste adelante, el hombre atrás sin contestar** — la
composición ES la escena.

> **Importancia:** este cuadro planta el gag que corre seis misiones y explota en M6. Que se
> lea el gesto del pulgar y la indiferencia del Vasco.
>
> **⚠ CORRECCIÓN 2.3 — no es "la foto que nadie vio".** Es al revés: **todos la vieron**. El
> Gitano manda al Pichón a mirarla y el jugador la mira con él (cuadro M1.5c). El chiste
> existe *porque* la vieron y es una mujer joven y hermosa. Lo que nadie hace nunca es darla
> vuelta. Ver GUION_2 §8a.

**PROMPT:**
```
[AIRE] Foreground: {GITANO} leaning in conspiratorially telling a joke to a
wide-eyed {PICHON}, jerking his thumb back over his shoulder, big grin. Background
slightly out of focus: {VASCO} climbing the boarding ladder of a {SKYHAWK} with
his back turned, not looking around, not reacting at all. Cold dawn flightline.
The joke in front, the silent man behind — gossip and dignity in one frame, 16:9.
No text, no watermark.
```

**Texto en pantalla:** *"Esa mujer tiene dueño y el dueño tiene charreteras."* / *"A mí me
dijeron que tiene un hermano preso."* / *"A mí me dijeron que él estuvo preso."*

> **Ojo:** este cuadro siembra DOS cosas — el chiste de la foto y el sistema de **rumores
> contradictorios** sobre el pasado del Vasco, que el juego no confirma nunca. Si el arte
> puede sugerir el cuchicheo (dos hablando, uno alejándose), mejor.

### Cuadro M1.5c — La foto *(nuevo en 2.3 — LA PISTA)*
**Plano:** POV del Pichón frente al locker abierto del Vasco. En el centro del cuadro,
pegada con cinta amarillenta del lado de adentro de la puerta de chapa gris, **la foto**:
una mujer joven y hermosa en blanco y negro, riéndose apoyada en una baranda. Penumbra de
vestuario, un haz de luz sobre la foto. **La foto tiene que ocupar el cuadro y leerse
perfecta.**

> **EL CUADRO MÁS IMPORTANTE DEL PRIMER MOVIMIENTO, y el más fácil de arruinar.** Acá el
> juego le muestra al jugador la respuesta y confía en que no la vea. La mujer es joven y
> linda: por eso todos —personajes y jugador— asumen "amante". **La pista está en el mismo
> cuadro:** el peinado, el vestido y el grano son de finales de los cincuenta, treinta años
> antes de 1982. Está a la vista. Nadie la lee, porque el chiste del Gitano ya enseñó cómo
> mirar. En M6 el Turco la da vuelta y todo se reconfigura. **Si esta foto se muestra chica,
> borrosa o de refilón, el mejor giro del guion no vale nada.** Se repite en M3 y M5.

**PROMPT:**
```
[AIRE] POV shot looking into an open grey steel locker in a dim squadron changing
room. Taped inside the door with yellowed tape: {FOTO_VASCO} — a small worn
black-and-white photograph of a beautiful young woman in her mid-thirties,
late-1950s hair and dress, laughing as she leans on a balcony railing. A single
shaft of light falls on the photograph. The photo is the centre of the frame,
large and perfectly readable. Flight gear hanging in shadow around it.
CRITICAL: the woman is YOUNG and beautiful, and the photograph must clearly look
thirty years old. 16:9. No text, no watermark.
```

**Texto en pantalla:** *"…Es hermosa."*

## Epílogo *(AIRE)*

### Cuadro M1.6 — Volver con sal
**Plano:** los cuatro Skyhawks volviendo rasantes sobre el mar al atardecer, tan bajo que
levantan spray de las crestas. Contraluz dorado. LA imagen del juego.

**PROMPT:**
```
[AIRE] Four silver {SKYHAWK} jets flying home in loose formation impossibly low
over the open sea at sunset, so low they lift spray from the wave crests, golden
backlight, salt mist trailing behind them, heroic and serene at once, the
signature image of low-level flight, wide 16:9. No text, no watermark.
```

### Cuadro M1.7 — La estrellita
**Plano:** detalle máximo: la mano del Turco con un pincel finito pintando una estrellita
bajo la cabina, la lengua afuera de concentración. Primera estrella de la fila.

**PROMPT:**
```
[AIRE] Extreme close-up of {TURCO}'s weathered hand painting a tiny five-pointed
star with a fine brush below a {SKYHAWK} cockpit, tip of his tongue sticking out
in concentration, one single fresh star at the start of an empty row, warm hangar
lamplight on silver metal, loving craftsmanship, 16:9. No text, no watermark.
```

## Carta de Mateo *(TIERRA)*

### Cuadro M1.8 — La hoja de la carta
**Plano:** hoja de cuaderno sobre una rodilla embarrada, escrita a la luz de una vela o
farol. Se reutiliza la plantilla de P4.1 con ambiente de pozo (variación).

**PROMPT:**
```
[TIERRA] A lined notebook page resting on a muddy knee inside a dim foxhole,
written by candlelight, cold blue night tones in the blue pixel shading, a soldier's
chapped hand holding a ballpoint pen at the edge of frame, empty writing lines,
3:4 vertical. No text, no watermark.
```

**Texto en pantalla:** carta completa de M1 (GUION_2), fuente manuscrita.

### Cuadro M1.9 — El Colorado con capa
**Plano:** el dibujo de Mateo: el Colorado dibujado como superhéroe naif — grandote,
sonriente, con capa al viento — repartiendo una lata de comida a un soldadito flaquito
(Mateo mismo). Ternura pura.

**PROMPT:**
```
[TIERRA] Naive pixel-sketch superhero drawing by a young soldier: a big smiling
red-haired corporal wearing a flowing cape, handing a food tin to a skinny little
soldier with an oversized helmet, childlike heroic pose, hearts of humor and
gratitude in every line, blue pixels on lined notebook paper, 3:4 vertical. TEXT IN
IMAGE (Argentine Spanish, handwritten label with an arrow pointing at the caped
figure): "el Colorado". No watermark.
```

---

# MISIÓN 2 — "Bautismo de fuego"

## Briefing *(AIRE)*

### Cuadro M2.1 — El pizarrón de la brecha
**Plano:** sala de briefing: un pizarrón con dos siluetas de tiza — un Harrier erizado de
misiles y radares; un Skyhawk pelado, con una sola bomba. Los pilotos de espaldas,
mirándolo. La brecha tecnológica en un dibujo de tiza.

**PROMPT:**
```
[AIRE] Military briefing room, a large chalkboard with two chalk silhouettes: a
modern Sea Harrier jet bristling with drawn missiles and radar waves, and beside
it a simple bare {SKYHAWK} silhouette with a single bomb, five pilots seen from
behind studying the board in silence, bare hanging bulb, the technology gap drawn
in chalk, 16:9. TEXT IN IMAGE (Argentine Spanish, chalk handwriting above each
silhouette): "ELLOS" and "NOSOTROS". No watermark.
```

### Cuadro M2.2 — Las manos
**Plano:** primer plano de Puma de perfil ante el pizarrón, y en primer término, grandes,
las manos curtidas de un piloto sosteniendo el casco. "Ellos tienen la máquina. Nosotros
tenemos las manos."

**PROMPT:**
```
[AIRE] Foreground close-up of a pilot's weathered scarred hands holding a white
flight helmet, in the background {PUMA} in profile before the chalkboard, focus
on the hands as the true weapon, dignity of manual skill, dramatic single-source
lighting, 16:9. No text, no watermark.
```

**Texto en pantalla:** *"Ellos tienen la máquina. Nosotros tenemos las manos."*

### Cuadro M2.3 — Splash de carga: el rasante
**Plano:** pantalla de carga / splash de misión: un Skyhawk visto DE FRENTE a la altura de
la ola, ocupando el cuadro, spray a los costados, el piloto apenas visible tras el
parabrisas. Velocidad pura.

**PROMPT:**
```
[AIRE] Head-on dramatic shot of a {SKYHAWK} flying directly at the viewer at
wave-top height, sea spray exploding to both sides, the pilot a faint figure
behind the windscreen, motion speed lines in the pixel work, raw adrenaline,
maximum drama dithered shading, 16:9. No text, no watermark.
```

## Epílogo *(AIRE)*

### Cuadro M2.4 — El colador
**Plano:** el avión de Pichón en la pista al atardecer, agujereado: haces de luz del sol
bajo entrando por los agujeros de bala del fuselaje como lucecitas. Belleza terrible.

**PROMPT:**
```
[AIRE] {PICHON}'s {SKYHAWK} parked on the tarmac at low sunset, its fuselage
riddled with bullet holes, beams of golden light passing through each hole like
tiny spotlights across the tarmac, terrible beauty, the pilot standing small
beside it staring, 16:9. No text, no watermark.
```

### Cuadro M2.5 — El abrazo del Turco
**Plano:** el Turco abrazando a Pichón contra el avión herido, sin palabras, la mano llena
de grasa apretando la nuca del pibe. Pichón con las manos todavía temblando.

**PROMPT:**
```
[AIRE] {TURCO} embracing young {PICHON} tightly beside the damaged jet, his
grease-stained hand pressing the back of the boy's head, the rookie's hands still
trembling at his sides, no words needed, fatherly protection, dusk light, heavy
emotional pixel work, 16:9. No text, no watermark.
```

### Cuadro M2.6 — "Esa no es del avión. Es tuya."
**Plano:** amanecer siguiente: detalle del fuselaje de Pichón con los agujeros parchados
con chapas remachadas, y al lado una estrellita fresca recién pintada, todavía brillante.

**PROMPT:**
```
[AIRE] Morning close-up of a {SKYHAWK} fuselage with fresh riveted patches
covering yesterday's bullet holes, and beside them one newly painted tiny star
still glossy and wet, worn silver metal, quiet pride of repair and survival, soft
dawn light, 16:9. No text, no watermark.
```

**Texto en pantalla:** *"¿Ves? Esa no es del avión. Es tuya."*

## Carta de Mateo *(TIERRA)*

### Cuadro M2.7 — La hoja
**Plano:** plantilla de carta (variación: la hoja apoyada sobre una caja de municiones,
un jarro de lata al lado).

**PROMPT:**
```
[TIERRA] A lined notebook page resting on a wooden ammunition crate inside a
foxhole, a dented tin mug beside it, blue pixel shading suggesting cold
grey daylight, empty writing lines, 3:4 vertical. No text, no watermark.
```

**Texto en pantalla:** carta completa de M2 (GUION_2).

### Cuadro M2.8 — Las cajas y los pibes
**Plano:** el dibujo-denuncia de Mateo: una carpa gorda repleta de cajas apiladas (se ven
por la puerta entreabierta) y afuera, bajo la lluvia dibujada en rayitas, una fila de
soldaditos flacos con platos vacíos. Trazo de nene, mensaje de adulto.

**PROMPT:**
```
[TIERRA] Naive but biting pixel-sketch drawing: a fat officer's tent stuffed with
stacked boxes visible through the half-open flap, outside in rain drawn as pixel
streaks a line of skinny little soldiers holding empty plates, childlike style
carrying an adult accusation, blue pixels on notebook paper, 3:4 vertical. TEXT IN
IMAGE (Argentine Spanish, handwritten under the tent): "las cajas" and under the
soldiers: "nosotros". No watermark.
```

### Cuadro M2.9 — La radio del pozo
**Plano:** de noche, el pozo iluminado por una radio a pilas chiquita en el centro; alrededor,
casquitos y mantas, caras de pibes cantando bajito. Arriba del pozo, la letra de la canción
subiendo dibujada como humito con notas.

**PROMPT:**
```
[TIERRA] Blue pixel-sketch night scene inside a foxhole lit only by a small battery
radio in the center, young conscript faces wrapped in blankets singing softly
around it, music notes rising from the hole drawn like little smoke curls into
the night sky, warmth inside cold, naive hopeful linework, 3:4 vertical. No text,
no watermark.
```

---

# MISIÓN 3 — "El día que sangró el mar"

## Briefing *(AIRE)*

### Cuadro M3.1 — El estallido de la sala de radio
**Plano:** la sala de operaciones explotando de euforia: Gitano con los brazos en alto,
pilotos abrazándose, papeles por el aire, un operador de radio con auriculares sonriendo.
Energía de gol de mundial.

**PROMPT:**
```
[AIRE] A military radio operations room erupting in celebration, {GITANO} with
both arms raised in triumph like a stadium goal, pilots hugging, papers flying, a
radio operator with headphones grinning, explosive joy drawn with motion lines
and speed, world-cup-goal energy inside a war room, 16:9. No text, no watermark.
```

### Cuadro M3.2 — "Veinte marinos"
**Plano:** contraste inmediato: mismo encuadre, la euforia congelada. Puma en el centro,
serio, y alrededor las sonrisas apagándose una por una. El cuadro que le enseña el tono al
jugador.

**PROMPT:**
```
[AIRE] The same operations room a moment later, celebration frozen: {PUMA}
standing serious and still at the center, the smiles around him fading one by
one, {GITANO}'s raised arms half-lowered, sudden gravity, the weight of twenty
dead sailors entering the room, muted tones, 16:9. No text, no watermark.
```

**Texto en pantalla:** *"Veinte marinos, Gitano. Del otro lado hay pibes iguales a
nosotros que hoy no vuelven."*

### Cuadro M3.3 — La profecía de la gambeta *(guiño del presente)*
**Plano:** Gitano aparte, apoyado en el marco de la puerta mirando el horizonte, con una
pelota de trapo de la base a los pies. Habla en voz baja. El jugador de hoy sabe
exactamente qué gambeta está profetizando.

**PROMPT:**
```
[AIRE] {GITANO} alone leaning on a doorframe looking at the far horizon, a
makeshift rag football resting at his feet on the tarmac, thoughtful gentle smile,
jets blurred in the background, quiet prophetic mood, warm late light, 16:9.
No text, no watermark.
```

**Texto en pantalla:** *"Algún día un pibe nuestro va a agarrar una pelota y los va a
gambetear a TODOS. Y ese día va a ser más grande que éste."*

### Cuadro M3.4 — Splash: el Exocet
**Plano:** splash épico de misión: el misil rasante cruzando el cuadro a centímetros del
agua, estela recta como un tajo, y en el horizonte la silueta gris de un destructor. El
mar enorme, el misil chiquito, el destino inevitable.

**PROMPT:**
```
[AIRE] Epic wide shot of a sea-skimming missile crossing the frame inches above
the grey South Atlantic, its straight white wake like a knife cut across the
water, on the far horizon the small dark silhouette of a destroyer, huge ominous
sea and sky, the missile tiny and unstoppable, high-contrast pixel drama, 16:9.
No text, no watermark.
```

## Epílogo *(AIRE)*

### Cuadro M3.5 — El festejo y el que mira el mar
**Plano:** profundidad de campo narrativa: en primer término el festejo — una botella
descorchada, brazos, risas —; al fondo, solo, de espaldas en el borde de la pista, Puma
mirando el mar oscuro. El cuadro dice dos cosas a la vez, como todo el juego.

**PROMPT:**
```
[AIRE] Two-layer composition at dusk: foreground pilots celebrating with an
uncorked bottle, laughter and raised arms slightly out of focus; deep background
in sharp focus, {PUMA} standing alone at the edge of the airfield with his back
turned, facing the dark sea, joy and grief in the same frame, 16:9. No text, no
watermark.
```

### Cuadro M3.5b — Dos segundos *(nuevo en 2.3 — segunda aparición de la foto)*
**Plano:** el Vasco solo en el vestuario vacío, ya con el traje puesto, mirando la foto
pegada en la puerta del locker. No la toca. La mira dos segundos y cierra la puerta. Contra
plano cerrado sobre la foto — **la misma imagen de M1, ya familiar.**

> **Sin diálogo, sin música, sin comentario.** El jugador cree estar viendo a un hombre
> extrañando a su amante, y se conmueve con eso. Está viendo a un huérfano de quince años
> despidiéndose de su madre antes de cada vuelo, como hace desde 1961. **La escena entera
> cambia de significado en M6 sin cambiar un solo cuadro.** Es el mejor recurso del guion:
> el jugador va a querer volver a verla.

**PROMPT:**
```
[AIRE] {VASCO} alone in an empty dim changing room, already in his flight suit,
standing motionless in front of his open locker, looking at {FOTO_VASCO} taped
inside the door. He is not touching it. His face is unreadable, private, tender.
Warm single light source. Nobody else in the room. Quiet and intimate, 16:9.
No text, no watermark.
```

## Carta de Mateo *(TIERRA)*

### Cuadro M3.6 — La hoja
**Plano:** plantilla de carta (variación: la hoja al viento, sostenida con una piedra en
cada punta, pasto de turba alrededor).

**PROMPT:**
```
[TIERRA] A lined notebook page held down against the wind by a small stone on
each corner, tufts of peat grass around it, pixel streaks suggesting strong wind,
harsh daylight of the islands, empty writing lines, 3:4 vertical. No text, no
watermark.
```

**Texto en pantalla:** carta completa de M3 (GUION_2).

### Cuadro M3.7 — El avioncito y el barco chueco
**Plano:** EL dibujo de Mateo de este movimiento: un avioncito plateado chiquito y
orgulloso, y un barco enorme deliberadamente chueco y mal dibujado ("los barcos son
difíciles"), con rayitas de humo. Debajo, la flecha y la letra.

**PROMPT:**
```
[TIERRA] Charming naive pixel-sketch drawing: a small proud silver fighter jet
facing a huge warship drawn clumsy and crooked on purpose with smoke scribbles,
the ship visibly badly drawn as if the young artist struggled with ships,
triumphant childlike energy, blue pixels on lined notebook paper, 3:4 vertical.
TEXT IN IMAGE (Argentine Spanish, handwritten caption with an arrow to the jet):
"y el avioncito gana". No watermark.
```

### Cuadro M3.8 — "Quiero volar con vos" *(nuevo en 2.2)*
**Plano:** el dibujo más tierno del cuaderno hasta acá: **dos aviones plateados volando en
formación**, uno grande y uno chico, pegados ala con ala. Debajo de cada uno, una flechita
con un nombre. Es el plan de vida de un pibe de 18 dibujado con birome — y es el plan que
la guerra no va a dejar que pase.

> **Peso narrativo:** este cuadro es una bomba de tiempo. Vuelve en el epílogo, cuando Norma
> pasa las páginas. Que sea deliberadamente **alegre y prolijo**: el trazo más cuidado del
> Movimiento I, porque Mateo lo dibujó ilusionado.

**PROMPT:**
```
[TIERRA] Naive but carefully drawn pixel-sketch: two silver fighter jets flying
in tight formation wingtip to wingtip, one big and one small, drawn with obvious
love and more care than any other page, little speed lines and a sun in the
corner, hopeful and proud, blue pixels on lined notebook paper, 3:4 vertical.
TEXT IN IMAGE (Argentine Spanish, small handwritten labels with arrows, one under
each plane): "papá" under the big one and "yo" under the small one. No watermark.
```

**Texto en pantalla:** *"Cuando salga de acá me anoto en la escuela de aviación, pá. Quiero
volar con vos."*

---

# Cómo sigue — el molde para M4–M12

Con este documento validado, el resto de la campaña se produce en serie:

1. **Mismo formato por misión:** briefing (3–5 cuadros) → splash de misión (1) → epílogo
   (2–3) → página del cuaderno (2–3, hoja + dibujo). ⚠ **El paso "fragmento de la carta del
   padre" YA NO EXISTE** — ver el registro `[CARTA]` corregido arriba. Los picos emocionales
   (numeración 3.0: M7 el locker, M8 sobrevuelo, M9 Pichón, M12 Correa, M14 final) llevan
   más cuadros — estimar 8–14 cada uno.
2. **Consistencia:** usá SIEMPRE los tokens de personaje y props y los bloques
   `[AIRE]`/`[TIERRA]`/`[CARTA]` tal cual. Si el generador soporta referencias de imagen,
   alimentá las hojas modelo de [PROMPTS_HOJAS_PERSONAJE.md](PROMPTS_HOJAS_PERSONAJE.md).
3. **Los dibujos de Mateo evolucionan:** el trazo arranca prolijo y curioso (M1–M3), se
   vuelve oscuro y ralo en el Movimiento III (más sombra, menos detalle: "no me salió
   dibujar más nada hoy"), y la página del sobrevuelo (M7) es la más luminosa y trabajada
   de todo el cuaderno. Anotar esa curva en cada prompt del cuaderno cuando avancemos.
4. **Checklist por cuadro generado:** ¿el personaje coincide con su hoja modelo? ¿el texto
   in-image está en español argentino y bien escrito? ¿sin marca de agua? ¿16:9 (aire) o
   3:4 (cuaderno)?

---

# ⛔ SUPERSEDIDA — numeración 2.3. Ver la tabla 3.0 (M4–M14) en «ACTUALIZACIÓN 3.0» al final

> **NO GENERAR NADA DESDE ESTA TABLA.** Se conserva solo como registro de lo que se pensó
> en la 2.3. Todo lo que sigue hasta el separador está **desactualizado en cuatro cosas**:
>
> 1. **La numeración es la vieja de 12 misiones** (acá "M10" es Correa; en el canon es M12).
> 2. **"Fragmento N `[CARTA]`" no existe más** — hay UNA sola carta, a Norma, en M13, y solo
>    se lee en el Final A.
> 3. **"La media de lana" es ahora un CUERO DE OVEJA** (3.4).
> 4. Falta todo lo posterior: M3 y M10 nuevas, el terito, Tandil, el post-créditos.
>
> **La fuente de verdad es la «Tabla 3.0 — cuadros obligatorios M4–M14» del final del
> documento.**

## (vieja) Cuadros obligatorios de M4–M12 *(mapa para la próxima tanda)*

Lo que el guion 2.3 exige y no puede faltar cuando se produzcan las misiones restantes.
**Los objetos de esta lista importan tanto como los personajes** — son los actores de
reparto del juego.

| Misión | Cuadros que NO pueden faltar |
|---|---|
| **M4** | Gitano cerrando la cúpula tras nombrar el festival (el silencio incómodo). El Callejón como pasillo de fuego. El Vasco volviendo con el tren colgando. |
| **M5** | El chiste de la casada volviendo (Colorado: "le avisás vos a tu casada") **+ `{FOTO_VASCO}` de frente en primer plano por tercera vez** — última vez antes del reveal, el jugador ya la tiene grabada como "la novia". El Vasco casi riéndose. La bomba bajo el ala (el sapito que necesita hundirse). **La Chancha**: el Hércules gordo salvando a Gitano de noche, manguera conectada sobre el mar. |
| **M6** | El chocolate y las facturas del 25. El Vasco hablando de más (sin saber que se despide). Los cuatro aviones donde había cinco. **EL LOCKER: `{FOTO_VASCO_LOCKER}` (la foto de siempre, ya conocida) → el Turco la despega → `{FOTO_VASCO}` DORSO: "Rosa Elena Arrieta / 1926–1961 / Te amo, mamá. Perdoname." → los tres haciendo la cuenta → la cara del Gitano.** El tarrito de pintura abierto. Fragmento 1 de la carta del padre `[CARTA]`. |
| **M7** | **EL SOBREVUELO**: el batir de alas visto desde el aire Y desde tierra (decenas de casquitos mirando arriba, un pibe flaco agitando un cuaderno). La página más luminosa del cuaderno. |
| **M8** | Pichón con la libreta explicándole el tirabuzón al Turco esa mañana. El misil que gira. **La libreta bajo el catre** → `{LIBRETA_PICHON}`. El Turco con los dos bolsillos llenos de muertos. Fragmento 2 `[CARTA]`. |
| **M9** | El mate del Gitano enfriándose entero durante todo el briefing. El Colorado planeando el asado y el micro a Corrientes (presagio sin presagiar). Los tres volviendo enteros — la victoria limpia que hace que la próxima duela el doble. Turco+libreta construyendo el ASCENSO. |
| **M10** | El pozo, Correa tapando a Mateo con el cuerpo. **La media de lana y la foto de la hermana** entre sus cosas. Esteban preguntando por carta y que no haya. Fragmento 3 `[CARTA]` — "Así que voy a ir" sin tachar. |
| **M11** | Volar sobre las posiciones propias (pozos y casquitos abajo, bajo fuego). **El asado**: la foto del Vasco y la libreta del Pichón apoyadas en la mesa junto a la damajuana. **La confesión del Gitano mirando las brasas** — y su cabeza "la risa que se apaga". La última página de la libreta ("para cuando haya que volver a buscar a alguien"). El borrador tachado de la última carta de Mateo. Fragmento 4 `[CARTA]`. |
| **M12** | Los tres Skyhawks bajo la luna. Puma apagando la radio. El pincel en el bolsillo. Gitano encendiéndose. Puma entrando en la muralla. **El misil saliendo desde tierra** (3 segundos). El monte apagándose. Esteban batiendo las alas sobre la nada. Las tres opciones. |
| **Epílogo** | Los dos telegramas como cubiertos. La mesa para dos. **Las dos encomiendas**: `{CUADERNO_MATEO}` y `{CARTA_PADRE}` + `{FOTO_VASCO}` + el pincel. Norma años después — más canas, el mismo delantal. El cuaderno y la carta enfrentados en la mesa. El pibe de la 10 en el museo. *(⛔ fila supersedida — el estado vigente está en la tabla 3.0)* |


---
---

# ACTUALIZACIÓN 3.0 — lo nuevo del guion, en cuadros

> Complemento de sincronización con [GUION_3.md](GUION_3.md). Todo lo de arriba sigue
> valiendo salvo lo que esta sección reemplaza. **Renumeración:** M1 y M2 quedan; los
> cuadros "M3.x" viejos son ahora la **MISIÓN 4**; de ahí en más, +1 hasta M9 (ex M8),
> **M10 nueva**, y +2 desde M11 (ex M9) hasta M14 (ex M12).

## R.1 — Tokens: las marcas personales *(ya aplicadas a la tabla de §0)*
Casco pelado (Tero) · dos franjas (Puma) · franja roja torcida (Gitano) · casco liso +
rosario (Vasco) · lápiz bajo la cinta + fórmulas en la mano (Pichón) · estrellita en la
gorra (Turco). **Regla: el terito es el ÚNICO animal pintado de la escuadrilla** — ver
AVIONES_ESCUADRON.md. Obligatorias en todo cuadro de hangar o cabina.

---

## ESCENA P.0 — La puerta *(🟨 3.2: YA NO ABRE EL JUEGO — estos cuadros son ahora el
EPÍLOGO DEL FINAL A, la revelación del marco. El juego abre directo en P.1. Prompts sin
cambios.)*

**Registro:** `[AIRE]`, pero con paleta lavada y fría — el presente es más gris que el
recuerdo. Sin música hasta que se abre el cuaderno.

### Cuadro P0.1 — La encomienda
**Plano:** el umbral de una casa de barrio, luz de media mañana. Norma —más canas, el mismo
delantal— recibe de un empleado de correo un paquete de papel madera atado con hilo. La
cámara del lado de adentro de la casa: Norma de espaldas, el pasillo en penumbra, la puerta
un rectángulo de luz.

**PROMPT:**
```
[AIRE con paleta desaturada, tonos grises y ocres apagados] Interior of a modest
argentine house years after the war, seen from inside a dim hallway: {NORMA} from
behind at the open front door, receiving a brown-paper parcel tied with string
from a postal worker, morning light framing the doorway as a bright rectangle,
the hallway in shadow, quiet and heavy, 16:9. No text, no watermark.
```

### Cuadro P0.2 — Los dos papeles
**Plano:** cenital suave sobre la mesa de la cocina. A la izquierda, el cuaderno Rivadavia
hinchado de humedad, recién salido del papel madera. A la derecha, una hoja de block
militar doblada en cuatro, blanda de años de dobleces, que Norma apoya con las dos manos.
Uno frente al otro, derechitos.

**PROMPT:**
```
[AIRE desaturado] Soft overhead shot of a kitchen table with a floral oilcloth:
on the left a hardcover school notebook swollen with old damp, sand in its
seams, just unwrapped from brown paper; on the right a single sheet of military
block paper folded in four, soft and worn from years of refolding, being placed
down gently by a woman's hands. The two papers facing each other, carefully
aligned, like two place settings. Quiet light, 16:9. No text, no watermark.
```

**Sin cartel** *(3.2: nada que explique — la imagen sola. El único cartel del cierre es
el de GUION_3, Final A.)*

### Cuadro P0.3 — La primera página *(la transición al juego)*
**Plano:** primerísimo plano de las manos de Norma abriendo el cuaderno. La página: el
dibujo del arroyo (P1.1). **Match cut:** el dibujo llena la pantalla y el juego "entra" al
recuerdo — de acá se encadena directo a la Escena P.1.

**PROMPT:**
```
[AIRE desaturado → transición] Extreme close-up of a woman's careful hands
opening a worn hardcover notebook to its first page: a naive blue ballpoint
drawing of a stream, a rusty pickup truck and two small figures. The drawing
fills more and more of the frame. 16:9. No text, no watermark.
```

---

## ~~Cuadro P2.2b — El terito~~ *(🟨 ELIMINADO en 3.3 — era demasiado obvio)*
**Canon 3.4 (edición manual):** P.2 pasó al **2 de abril de 1982** y ahora es LA LLAMADA —
Norma atiende el teléfono, **habla en escena** (le explica a Mateo lo del apodo: "a tu
padre le dicen Tero… el pájaro lo sigue a todos lados") y Esteban atiende, palidece y
prende la radio. El diario de M1 remata la siembra ("en la Fuerza te dicen Tero desde
antes de que yo naciera"). El reconocimiento de M8 es una **deducción** de Mateo: tero
pintado + papá Tero = certeza. Ver GUION_3, P.2 y M1.

---

## MISIÓN 1 — cambios 3.0

**La misión es TUTORIAL PURO:** sin boss, sin enemigos, sin disparos enemigos. Esquivar
mástiles de pesqueros, pasar bajo un puente de chapa, seguir a Puma, tirar a tambores
flotantes. Los cuadros de briefing ya producidos siguen todos valiendo.

### Cuadro M1.5d — El pájaro *(NUEVO)*
**Plano:** el Turco en cuclillas junto al Skyhawk de Esteban, pincel fino en la mano,
terminando de pintar **el terito** bajo la cabina — pintura fresca, blanco y gris, folk.
Esteban parado al lado, tocando el borde de la pintura con un dedo, la cara entre sorpresa
y otra cosa.

**PROMPT:**
```
[AIRE] {TURCO} crouched beside the fuselage of a {SKYHAWK} at dawn, fine brush
in hand, finishing a small hand-painted SOUTHERN LAPWING bird (tero) below the
cockpit sill — long legs, proud chest, folk-art style in white and dark grey,
paint still fresh; {ESTEBAN} standing beside him touching the edge of the fresh
paint with one finger, moved and trying not to show it. Cold morning light,
16:9. No text, no watermark.
```

**Texto en pantalla:** *"Su pájaro, Teniente. Acá los aviones van con nombre."*

> **Ojo de arte:** este terito es EL objeto del juego — el mismo que Mateo reconoce en M8.
> Mismo diseño exacto en la hoja del avión (AVIONES_ESCUADRON), acá, y en M8. Pincel, no
> calcomanía.

---

## MISIÓN 3 — "El invento" *(NUEVA — cuadros clave)*

### Cuadro M3.1 — El tribunal
**Plano:** el Pichón trepado a una escalera contra el avión de Esteban, manga engrasada
hasta el codo, hablando con las manos. Abajo, el Turco, brazos cruzados, cara de juez. La
escuadrilla al fondo, mirando como quien mira un partido.

**PROMPT:**
```
[AIRE] {PICHON} up a metal ladder against the fuselage of a {SKYHAWK}, one
sleeve greasy to the elbow, talking fast with both hands mid-gesture; below,
{TURCO} with crossed arms and a stern judging face; in the background {GITANO}
and {PUMA} watching amused like spectators at a match. Morning hangar light,
16:9. No text, no watermark.
```

**Texto en pantalla:** *"Pibe. Eso no se puede."* / *"…A ver. Mostrame."*

### Cuadro M3.2 — El fracaso glorioso
**Plano:** el segundo invento explotando en anticlímax: humo negro chiquito, una pieza
saliendo despedida y rodando por la pista, el Turco y el Pichón mirándola pasar — el Turco
con cara de "lo sabía", el Pichón anotando en su libreta, imperturbable.

**PROMPT:**
```
[AIRE] Comic beat on the flightline: a small contraption of metal and tape on a
{SKYHAWK} emitting a puff of black smoke, a single round metal part bouncing and
rolling away across the concrete in the foreground; {TURCO} watching it roll
with a deadpan told-you-so face, {PICHON} unbothered, already writing in a small
black oilcloth notebook with a carpenter pencil. 16:9. No text, no watermark.
```

**Texto en pantalla:** *"Esto no lo levanta ni Alá."* / *"…Interesante."*

### Cuadro M3.3 — La navaja *(TIERRA — el regalo)*
**Plano:** página del cuaderno. Dibujo en birome: una mano abierta ofreciendo un
cortaplumas con cabo de asta, y al lado el mismo cortaplumas dibujado enorme, con
flechitas señalando "las marquitas del cabo". Debajo, la leyenda manuscrita.

**PROMPT:**
```
[TIERRA] Notebook page drawing in blue ballpoint: an open hand offering a small
worn pocketknife with a horn handle, and beside it the same knife drawn LARGE
with childish arrows pointing at the little marks on the handle, naive loving
detail, cream lined paper, 3:4 vertical. No text, no watermark.
```

**Texto en pantalla (manuscrito):** *"En el campo, un hombre sin navaja no es nadie,
chamigo."*

---

## MISIÓN 8 — el reconocimiento *(cuadros REESCRITOS del sobrevuelo)*

### Cuadro M8.A — El paso *(EL CUADRO MÁS IMPORTANTE DEL JUEGO junto con la foto)*
**Plano:** contrapicado desde el pozo, cámara lenta: el Skyhawk plateado pasando ENORME
sobre las cabezas, ala inclinada en pleno batir, y en el fuselaje — nítido, imposible de
no ver — **el terito pintado**. La turba volando por la onda del paso.

**PROMPT:**
```
[AIRE] Dramatic low-angle shot from inside a muddy trench: a silver {SKYHAWK}
passing HUGE directly overhead at treetop height, one wing dipped mid-waggle,
peat and straw whipped up by its wake; on the fuselage below the cockpit,
perfectly legible, a small hand-painted southern lapwing bird (tero) and a row
of little white stars. Slow-motion feel, overwhelming presence, 16:9. No text,
no watermark.
```

> **Regla de oro:** el terito se tiene que LEER. Si en el render no se distingue, se
> regenera. De este cuadro depende la certeza de Mateo — y toda la asimetría del final.

### Cuadro M8.B — La cara
**Plano:** primer plano de Mateo, casco ladeado, la boca abriéndose — el instante exacto
del reconocimiento. Detrás, desenfocados, otros conscriptos saltando y saludando.

**PROMPT:**
```
[AIRE] Close-up of {MATEO} in the trench looking straight up, helmet tilted
back, his mouth just opening in recognition and disbelief, eyes wide and
shining; behind him out of focus other conscripts jumping and waving. The
moment a son recognizes his father, 16:9. No text, no watermark.
```

**Texto en pantalla:** *"¡Es mi viejo! ¡El del terito es MI VIEJO!"*

### Cuadro M8.C — La multitud *(el plano de Esteban)*
**Plano:** lo que ve el padre: el monte alejándose YA, decenas de casquitos idénticos,
brazos en alto, y un pibe flaco al borde de un pozo agitando un cuaderno — uno más entre
cientos, imposible de confirmar.

**PROMPT:**
```
[AIRE] Aerial view from a fast-receding cockpit: a hillside with dozens of tiny
identical helmeted conscripts waving up, arms raised, one thin figure at the
edge of a foxhole waving a small notebook — indistinguishable among the crowd,
already far away. The mountain sliding out of frame, 16:9. No text, no
watermark.
```

**Texto en pantalla:** *"¿Alguno de esos sos vos?… Tenías que ser vos."*

---

## MISIÓN 10 — "Los primos" *(NUEVA — cuadros clave)*

> 🟥 **REESCRITO 3.5 — los cuadros viejos M10.A/M10.B están MUERTOS.** Eran la escolta
> sobre el mar: históricamente imposible (los Mirage aterrizaron en **Tandil**, a 2.000 km
> del sur, volados por pilotos peruanos que se volvieron el mismo día en un Hércules con
> librea de Aeroperú, y **nunca combatieron**). La escena ahora es un **corte a Tandil**
> intercalado en la misión — la segunda y última vez que el juego rompe su montaje.

### Cuadro M10.A — Los diez que llegaron
**Plano:** plataforma de Tandil al amanecer, pasto escarchado. Diez Mirage nuevos rodando
en fila hacia la plataforma, prolijos, sin una marca de uso, la luz naranja rasante
metiéndose en las cúpulas. Mecánicos saliendo del hangar despacio, sin creerlo.

**PROMPT:**
```
[AIRE] Ten brand-new delta-wing Mirage jets taxiing in single file onto a
mainland airbase apron at freezing dawn, frost on the grass, low orange sunlight
raking across their canopies, gleaming unmarked airframes, argentine ground
mechanics in overalls walking slowly out of a hangar in disbelief, cold breath
in the air, 16:9. PERIOD LOCK — 1982: no modern aircraft, no modern ground
equipment. No text, no watermark.
```

**Texto en pantalla:** *"…Todavía está tierna."*

### Cuadro M10.B — La escarapela fresca
**Plano:** primerísimo plano de la mano del mecánico sobre el fuselaje, la escarapela
argentina recién pintada, y la yema del dedo apenas manchada de azul.

**PROMPT:**
```
[AIRE] Extreme close-up of a mechanic's weathered hand resting on a jet
fuselage beside a freshly painted blue-white argentine roundel, the paint
visibly newer and glossier than the surrounding metal, a faint smudge of wet
blue on his fingertip, cold dawn light, 16:9. No text, no watermark.
```

**Texto en pantalla:** *"Salieron del Perú siendo de ustedes."*

### Cuadro M10.C — El Hércules que saluda
**Plano:** el C-130 con los colores de **Aeroperú** despegando en el amanecer, y **batiendo
las alas** al irse: gordo, lento, torpe. El mismo saludo de M8, en otro idioma.

**PROMPT:**
```
[AIRE] A four-engine C-130 Hercules transport in civilian airline livery
climbing away at dawn over frozen plains, rocking its wings in a farewell
waggle, heavy and slow and ungainly, the ten fighter jets tiny and still on the
apron below, 16:9. PERIOD LOCK — 1982. No text, no watermark.
```

**Texto en pantalla:** *(ninguno — el saludo se reconoce solo)*

### Cuadro M10.D — Los que no van a llegar
**Plano:** los diez Mirage estacionados en fila, turbinas enfriándose, cúpulas vacías,
plataforma desierta. **Sostener el plano.** Sin cartel.

**PROMPT:**
```
[AIRE] Ten brand-new fighter jets parked in a neat row on an empty apron, canopies
closed and empty, no people anywhere, heat shimmer fading from the exhausts, long
cold morning shadows, absolute stillness, a gift nobody came to collect, 16:9.
NOBODY IN THE FRAME. No text, no watermark.
```

---

## Tabla 3.0 — cuadros obligatorios M4–M14 *(reemplaza a la tabla vieja)*

| Misión | Cuadros que NO pueden faltar |
|---|---|
| **M4** (Sheffield) | Los cuadros "M3.x" viejos de este doc, tal cual + la 2ª aparición de la foto (el Vasco solo frente al locker). |
| **M5** (Callejón) | Gitano cerrando la cúpula tras el festival. El pasillo de fuego. El Vasco con el tren colgando. |
| **M6** (Antelope) | El chiste de la casada nº3 + foto de frente 3ª vez. **LA CHANCHA: manguera conectada bajo fuego, el pedazo de ala que se arranca, y la Chancha rota en tierra rodeada de mecánicos.** |
| **M7** (Vasco) | El chocolate del 25. El Vasco hablando de más. Cuatro aviones donde había cinco. **EL LOCKER completo** (ver tabla vieja) + Gitano con el mate frío: "tres años le cebé mate a este culiao". El tarrito abierto. |
| **M8** (sobrevuelo) | **M8.A / M8.B / M8.C de arriba** + la página del monte (con el terito en el avión dibujado). |
| **M9** (Pichón) | "Me dieron. Todavía no quiero—". La libreta bajo el catre. **El Turco comparando la libreta con los aviones: la cuenta del "un cuarto".** |
| **M10** (Tandil) | El avión del Pichón abierto en canal, el Turco sacándole una pieza ("Vuela en los otros tres"). El hueco en la formación que nadie ocupa. **M10.A / M10.B / M10.C / M10.D.** El Turco con el trapo: "Hay gente buena en todos lados…". La placa SISTEMA del desbloqueo del Mara. |
| **M11** (respiro) | El mate que se enfría entero en la mano del Gitano. Tres estrellitas. El gesto del bolsillo. |
| **M12** (Correa) | El corte a tierra. Correa poniéndole el cuerpo. **Los jazmines** (la mano buscando la mano). El inventario del hombre bueno (la mochila volcada, la foto de Teresa, el mate) + 🟥 **el cuero de oveja de M1 sobre los hombros de Mateo, tapándolo hasta el final** + Mateo guardando la foto de Teresa en el cuaderno. **EL TALLADO: la navaja del Colorado mordiendo la viga — "VAMOS A VOLVER / LOS PIBES DE MALVINAS".** |
| **M13** (asado) | El fuego, la foto contra la damajuana, la libreta al lado. El Gitano en serio (una sola vez). **La CARTA: Esteban escribiendo de noche, ilegible, el sobre "Norma" parado en el locker.** |
| **M14** (final) | El dedo en el mapa. La foto de cabina de Puma + "que me perdone el abuelo" + click. **"TRES desayunos."** El destello del Gitano al borde de pantalla. El show de Puma + kamikaze. El vacío. **LAS TRAYECTORIAS CRUZADAS** (el misil y la salva en el mismo cuadro). La cara de Tero. El tonel sobre el monte apagado. |
| **Finales** | **A:** la vorágine (el enjambre de frente, todo rojo) + el locker con la carta + la mesa de Norma completa. **B:** el planeo del sapito (tocando el agua) + la panza en el pasto + LA MESA: Esteban y el Turco, el cuaderno abierto, la navaja contra la azucarera, Norma por la ventana en el jazminero. |
| 🟥 **Post-créditos** *(3.6)* | El museo escolar, la vitrina con el cuaderno abierto en la página del monte. **El pibe con la 10 de la TERCERA estrella** (verificado: Argentina no ganó 2026). La seño **Claribel** agachándose a su altura para acomodarle el cuello de la camiseta. Y **la mano chiquita en el vidrio, con el MISMO encuadre que la de Norma sobre la página** — es una rima visual, se reusa el plano, no se inventa uno nuevo. |

---

# PASADA VN — retratos y placas *(sincronización con RETRATOS.md)*

> Decisión de producción: las escenas de diálogo van **placa de ambiente + retrato**
> (estilo Police Stories); solo los **cuadros sagrados** se producen como escena completa.
> Esta sección reclasifica los cuadros existentes. Regla de lectura: lo que no figura acá
> como VN, **queda como estaba**.

## Cuadros existentes que pasan a VN *(no se generan como escena — placa + retratos)*

| Cuadro | Placa que usa | Retratos en juego |
|---|---|---|
| P2.2 la llamada *(🟨 3.4: ex chicana del Rastrojero)* | cocina 1982 | Mateo sonrisa-colimba · Tero sonrisa chica → preocupado · **Norma cálida** *(🟨 3.4: Norma habla y tiene retrato)* |
| M1.3 la regla número uno | línea de vuelo amanecer | Puma reglamentario |
| M1.4 chistes y rezos | línea de vuelo amanecer | Gitano sonrisa · Pichón neutro · Vasco cerrado |
| M1.5b la casada | línea de vuelo amanecer | Gitano sonrisa · Pichón entusiasmo · Puma reglamentario |
| M2.1 el pizarrón de la brecha | sala de radio / briefing | Puma ceño · Tero preocupado |
| M4 (ex M3.1) el estallido de la sala de radio | sala de radio | Gitano carcajada |
| M4 (ex M3.2) "veinte marinos" | sala de radio | **Gitano carcajada → serio** (el cambio de retrato ES la escena) · Puma ceño |
| M4 (ex M3.3) la profecía de la gambeta | sala de radio | Gitano serio · Puma neutro |

**El caso testigo es "veinte marinos":** el corte del retrato del Gitano de carcajada a
serio, con la placa quieta y el `hold` después, hace más trabajo que cualquier escena
dibujada. Así se dirige en VN.

## Cuadros que se CONSERVAN como escena completa *(sagrados — sin cambios)*

Todo el P.0 y P.1 · P2.1 (la mesa — presenta a la familia UNA vez) · P2.3–P2.6 (la radio,
la pava, la Plaza, el balcón) · P3.x (el teléfono) · P4 y toda página `[TIERRA]` · M1.1*
(pasa a doblar como placa, ver abajo) · M1.2 (la comunión del mate — el retrato grupal de
la familia, una sola vez) · M1.5 / M1.5c / M1.5d (el Turco, la foto, el terito) · M1.6 /
M1.7 (sal en las alas, la estrellita) · M2.2 (las manos) · M2.3 (splash) · M2.4 / M2.5 /
M2.6 (el colador, el abrazo, la estrellita del Pichón) · M4 (ex M3.4) splash Exocet · M4
(ex M3.5) el festejo y el que mira el mar · M3.5b los dos segundos del Vasco · y toda la
lista de la tabla obligatoria M4–M14 (sección ACTUALIZACIÓN 3.0).

## Las 14 placas — de dónde salen

| Placa | Origen |
|---|---|
| 1. Línea de vuelo amanecer | regenerar M1.1 SIN personas (o borrar figuras del ya generado) |
| 2. Línea de vuelo atardecer | variante de luz de la 1 |
| 3. Línea de vuelo noche | variante (m13/m14) |
| 4. Hangar día | nueva — sirve el fondo de M1.5 sin figuras |
| 5. Hangar noche con lámpara | nueva (la libreta) |
| 6. Vestuario / lockers | del cuadro M1.5c sin figuras |
| 7. Sala de radio | nueva (briefings, "veinte marinos") |
| 8. Cocina 1982 | de P2.1 sin figuras |
| 9. Cocina presente (lavada) | de P0.1/P0.2 sin figuras |
| 10. Fogón del asado | del interludio m13 sin figuras |
| 11. Cabina día | nueva (radio en vuelo) |
| 12. Cabina noche | variante (m14) |
| 13. Pista bajo lluvia | nueva |
| 14. El jazminero por la ventana | nueva (Final B) |

**Regla de producción de placas:** mismo prompt del cuadro de origen + `NOBODY IN THE
FRAME. Empty, waiting, quiet.` — el patrón es la placa del TEST 4B.

## Regla para los storyboards de M4–M14 *(los que faltan producir)*

De acá en adelante los storyboards nuevos se escriben **directo en formato VN**: por
escena, indicar `placa + secuencia de retratos` para el diálogo, y cuadro completo SOLO
para los momentos de la tabla obligatoria. Eso reduce los storyboards restantes a: puñado
de cuadros sagrados por misión + guion de retratos (que ya está escrito en GUION_3 — el
storyboard solo asigna caras).
