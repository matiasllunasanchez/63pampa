# RASANTE — Storyboard 1: Prólogo + Movimiento I (M1–M3)

> Guion visual viñeta por viñeta del [GUION_2.md](GUION_2.md), con un prompt listo para
> pegar en el generador de imágenes por cada cuadro. Cubre Prólogo y Misiones 1–3. Cuando
> este sistema esté validado, el resto de la campaña sale en serie con el mismo molde.
>
> **Sincronizado con GUION 2.3.** Las hojas modelo de personaje y las de props viven en
> [PROMPTS_HOJAS_PERSONAJE.md](PROMPTS_HOJAS_PERSONAJE.md) — generá y aprobá esas ANTES de
> generar cuadros, y usá siempre sus tokens.

---

## 0b. Tercer registro visual — la carta del padre *(nuevo en 2.1)*

El guion tiene ahora **tres** registros, no dos. Además de `[AIRE]` y `[TIERRA]`:

**`[CARTA]`** — los cinco fragmentos de la carta que Esteban escribe y nunca manda (M6, M8,
M10, M11 y voz en off en M12). No es la manuscrita de Mateo ni la tipografía técnica del
juego: es un hombre que no sabe escribirle a su hijo y lo intenta igual.

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
| `{ESTEBAN}` | argentine air force pilot, 41 years old, very tall and very thin, gaunt and narrow, the tallest and thinnest of the squadron, neck carried forward, criollo features, olive skin, black hair greying at the temples, clean-shaven, tired warm eyes, olive flight suit unzipped to mid-chest, no jacket, white 1960s flight helmet with oxygen mask hanging, under one arm, black leather flight boots |
| `{MATEO}` | argentine army conscript, 18 years old and reads as 18, skinny teenager, criollo features, olive skin, black hair, patchy teenage mustache, hip-length oversized olive hooded parka (NOT a long coat), argentine brown leather webbing with canteen, unmarked steel helmet with cloth cover over a wool cap, brown leather boots caked in peat mud, notebook and blue pen in his pocket, wind-burnt face, cracked lips, clearly the son of a tall lean 41-year-old pilot |
| `{PUMA}` | argentine squadron leader, 44 years old, short and very heavy, squat, the broadest and shortest of the squadron, criollo, sun-darkened, iron-grey hair cropped to the scalp, sun-squinted eyes, grey BRUSH mustache, brown leather flight jacket over his olive flight suit, helmet held low in one hand, black leather flight boots |
| `{GITANO}` | argentine pilot, 33 years old, the most open silhouette: flight suit pulled down to the waist with sleeves knotted in front, white undershirt, bare arms, tall voluminous black curly hair, the darkest-skinned of the squadron, big warm grin, brown gourd mate with metal bombilla in hand, black leather flight boots |
| `{VASCO}` | argentine pilot, 36 years old, the most closed silhouette: tall and narrow, sloping shoulders, flight suit zipped to the chin, arms straight at his sides, motionless, pale skin, basque features, heavy brow, solemn face, LARGE silver crucifix worn outside the collar, black leather flight boots |
| `{PICHON}` | argentine rookie pilot, 22 years old, the smallest of the squadron, reads as a boy among men, criollo, olive skin, baby face, freckles, nervous eyes, flight suit clearly too big, sleeves swallowing his hands, helmet held with both hands against his chest |
| `{TURCO}` | argentine chief mechanic, late 50s, syrian-lebanese descent, olive skin, hooked nose, stocky with a round belly, bald on top with grey sides, cloth cap, glasses pushed up on his forehead, grey DROOPING WALRUS mustache, grease-stained blue overalls plain and unmarked on the back, rag over one shoulder, big weathered hands |
| `{COLORADO}` | argentine corporal, 26 years old, tall and sturdy, fair freckled skin raw red from the cold, red hair, broad honest smile, plain olive field uniform with NO insignia, wool cap, argentine brown leather webbing with canteen, muddy brown leather boots |
| `{NORMA}` | argentine mother, 47 years old, middle-aged not elderly, dark hair with grey at the temples in a low bun, criolla, faded blue dress with a cream floral apron, always the same apron, no military insignia of any kind, always seen from behind or in profile, face never fully shown, always alone |
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
   (2–3) → carta (2–3, hoja + dibujo) → **fragmento de la carta del padre en M6, M8, M10 y
   M11** (registro `[CARTA]`). Los picos emocionales (M6 el locker, M7 sobrevuelo, M8
   Pichón, M10 Correa, M12 final) llevan más cuadros — estimar 8–14 cada uno.
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

# Cuadros obligatorios de M4–M12 *(mapa para la próxima tanda)*

Lo que el guion 2.3 exige y no puede faltar cuando se produzcan las misiones restantes.
**Los objetos de esta lista importan tanto como los personajes** — son los actores de
reparto del juego.

| Misión | Cuadros que NO pueden faltar |
|---|---|
| **M4** | Gitano cerrando la cúpula tras nombrar el festival (el silencio incómodo). El Callejón como pasillo de fuego. El Vasco volviendo con el tren colgando. |
| **M5** | El chiste de la casada volviendo (Colorado: "le avisás vos a tu casada") **+ `{FOTO_VASCO}` de frente en primer plano por tercera vez** — última vez antes del reveal, el jugador ya la tiene grabada como "la novia". El Vasco casi riéndose. La bomba bajo el ala (el sapito que necesita hundirse). **La Chancha**: el Hércules gordo salvando a Gitano de noche, manguera conectada sobre el mar. |
| **M6** | El chocolate y las facturas del 25. El Vasco hablando de más (sin saber que se despide). Los tres aviones donde había cuatro. **EL LOCKER: `{FOTO_VASCO_LOCKER}` (la foto de siempre, ya conocida) → el Turco la despega → `{FOTO_VASCO}` DORSO: "Rosa Elena Arrieta / 1926–1961 / Te amo, mamá. Perdoname." → los tres haciendo la cuenta → la cara del Gitano.** El tarrito de pintura abierto. Fragmento 1 de la carta del padre `[CARTA]`. |
| **M7** | **EL SOBREVUELO**: el batir de alas visto desde el aire Y desde tierra (decenas de casquitos mirando arriba, un pibe flaco agitando un cuaderno). La página más luminosa del cuaderno. |
| **M8** | Pichón con la libreta explicándole el tirabuzón al Turco esa mañana. El misil que gira. **La libreta bajo el catre** → `{LIBRETA_PICHON}`. El Turco con los dos bolsillos llenos de muertos. Fragmento 2 `[CARTA]`. |
| **M9** | El mate del Gitano enfriándose entero durante todo el briefing. El Colorado planeando el asado y el micro a Corrientes (presagio sin presagiar). Los tres volviendo enteros — la victoria limpia que hace que la próxima duela el doble. Turco+libreta construyendo el ASCENSO. |
| **M10** | El pozo, Correa tapando a Mateo con el cuerpo. **La media de lana y la foto de la hermana** entre sus cosas. Esteban preguntando por carta y que no haya. Fragmento 3 `[CARTA]` — "Así que voy a ir" sin tachar. |
| **M11** | Volar sobre las posiciones propias (pozos y casquitos abajo, bajo fuego). **El asado**: la foto del Vasco y la libreta del Pichón apoyadas en la mesa junto a la damajuana. **La confesión del Gitano mirando las brasas** — y su cabeza "la risa que se apaga". La última página de la libreta ("para cuando haya que volver a buscar a alguien"). El borrador tachado de la última carta de Mateo. Fragmento 4 `[CARTA]`. |
| **M12** | Los tres Skyhawks bajo la luna. Puma apagando la radio. El pincel en el bolsillo. Gitano encendiéndose. Puma entrando en la muralla. **El misil saliendo desde tierra** (3 segundos). El monte apagándose. Esteban batiendo las alas sobre la nada. Las tres opciones. |
| **Epílogo** | Los dos telegramas como cubiertos. La mesa para dos. **Las dos encomiendas**: `{CUADERNO_MATEO}` y `{CARTA_PADRE}` + `{FOTO_VASCO}` + el pincel. Norma de frente por primera vez. El cuaderno y la carta enfrentados en la mesa. El pibe de la 10 en el museo. |

