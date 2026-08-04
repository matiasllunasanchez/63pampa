# RASANTE — Storyboard 1: Prólogo + Movimiento I (M1–M3)

> Guion visual viñeta por viñeta del [GUION_2.md](GUION_2.md), con un prompt listo para
> pegar en el generador de imágenes por cada cuadro. Cubre Prólogo y Misiones 1–3. Cuando
> este sistema esté validado, el resto de la campaña sale en serie con el mismo molde.

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

| Token | Descriptor (inglés, pegar tal cual) |
|---|---|
| `{ESTEBAN}` | argentine fighter pilot, 41 years old, weathered handsome face, short dark hair greying at the temples, strong jaw, tired warm eyes, olive-green flight suit, white flight helmet |
| `{MATEO}` | argentine conscript soldier, 18 years old, skinny, freshly shaved head, big expressive dark eyes, oversized green wool coat, oversized helmet |
| `{PUMA}` | argentine squadron leader, 44 years old, broad shouldered, calm stern face, thick grey-streaked mustache, olive flight suit |
| `{GITANO}` | argentine pilot, 33 years old, curly dark hair, big warm grin, mate gourd in hand, olive flight suit |
| `{VASCO}` | argentine pilot, 36 years old, heavy brow, solemn quiet face, small crucifix on a chain, olive flight suit |
| `{PICHON}` | argentine rookie pilot, 22 years old, baby-faced, freckles, nervous eyes, slightly too-large flight suit |
| `{TURCO}` | argentine chief mechanic, late 50s, stocky, grease-stained blue overalls, thick grey mustache, rag over one shoulder, kind tired eyes |
| `{COLORADO}` | argentine corporal, 26 years old, red hair, broad honest smile, weathered freckled face, field uniform |
| `{NORMA}` | argentine mother, late 40s, apron over a plain dress, hair in a low bun, almost always seen from behind or in profile |
| `{SKYHAWK}` | A-4 Skyhawk attack jet, silver-grey, blue-white Argentine roundel, worn painted metal, single seat |
| `{RASTROJERO}` | rusty old Argentine Rastrojero pickup truck, 1960s workhorse |

**Prompt de hoja modelo** (una por personaje, guardala como referencia):

```
[AIRE] Character sprite model sheet, {TOKEN}, front view, three-quarter view and
profile, idle standing pose, full body plus a face portrait close-up, neutral flat
background, consistent design, arcade sprite proportions. No text, no watermark.
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

---

# Cómo sigue — el molde para M4–M12

Con este documento validado, el resto de la campaña se produce en serie:

1. **Mismo formato por misión:** briefing (3–5 cuadros) → splash de misión (1) → epílogo
   (2–3) → carta (2–3, hoja + dibujo). Los picos emocionales (M7 sobrevuelo, M8 Pichón,
   M9 Correa, M12 final) llevan más cuadros — estimar 8–14 cada uno.
2. **Consistencia:** usá SIEMPRE los tokens de personaje y los bloques `[AIRE]`/`[TIERRA]`
   tal cual. Si el generador soporta referencias de imagen, alimentá las hojas modelo.
3. **Los dibujos de Mateo evolucionan:** el trazo arranca prolijo y curioso (M1–M3), se
   vuelve oscuro y ralo en el Movimiento III (más sombra, menos detalle: "no me salió
   dibujar más nada hoy"), y la página del sobrevuelo (M7) es la más luminosa y trabajada
   de todo el cuaderno. Anotar esa curva en cada prompt del cuaderno cuando avancemos.
4. **Checklist por cuadro generado:** ¿el personaje coincide con su hoja modelo? ¿el texto
   in-image está en español argentino y bien escrito? ¿sin marca de agua? ¿16:9 (aire) o
   3:4 (cuaderno)?

