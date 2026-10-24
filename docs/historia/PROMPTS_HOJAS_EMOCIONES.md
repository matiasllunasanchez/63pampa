# RASANTE — Hojas de emociones (muchas) · 22/10/2026

**Pedido del autor:** *"necesito armar hojas de emociones de algunos personajes que quiero definir
nuevos, no de la historia sino genéricos de diversos pilotos para rellenar, y uno para la historia
que sería el que maneja la Chancha (...) 5 personajes diferentes a las misiones de campaña, hacer a
Cóndor también, y al de la Chancha, y quiero hacer las hojas de personajes con MUCHAS EMOCIONES,
MUCHAS."* — *"y rearmar las de los personajes que ya tengo"*.

## Cómo está armado

*Autor, 22/10: «Necesito mucha mas variedad de gestos (...) usar todas las combinaciones posibles qe
se usan en una tira de emoticones. ademas de las normales (...) algunas caras un poco mas como esta»
(una cara incómoda, de reojo, labios apretados) · «para expresar diversas emociones bien variadas»
· «de todos los personajes necesito realmente» · «Y con fondo de avion y sin fondo de avion (por
ahora puede ser fondo gris)» · «Los piltoos genericos no ahce falta q tengan tanta variedad, los de
la campaña si».*

- **Personajes de campaña** (Chancha, Cóndor, Tero, Puma, Gitano, Vasco, Pichón, Turco, Mateo,
  Colorado, Norma): **Tira A (6) + Tira B (6) + tres hojas de 10 en grilla 5×2 = 42 caras**, todas
  **llevadas al extremo**. *(Autor, 23/10: «son muchas 142, podrian ser la mitad pero mas extremas
  en emociones».)*
  - **Tira A, la base:** neutro · sonrisa · preocupado · ceño · roto · *la propia*.
  - **Tira B, las fuertes:** risa · miedo · grito · llanto · alivio · decidido.
  - **Hoja C, las grandes:** carcajada con lágrimas · pánico · furia roja · llanto a moco tendido ·
    mandíbula al piso · asco · shock · dolor · euforia · sobresalto.
  - **Hoja D, las incómodas y las pícaras:** incómodo *(la de la foto)* · aguantando la risa ·
    «¿en serio?» · de reojo · «uh» con dientes apretados · sobrador · ojos en blanco · guiño · lengua
    afuera · risa nerviosa.
  - **Hoja E, las de todos los días y las profundas:** sorpresa · duda · pensativo · hablando ·
    ternura · mirada perdida · aguantando el llanto · sonrisa triste · orgullo · agotado.
- **En el avión:** los que vuelan (Tero, Puma, Gitano, Vasco, Pichón: cabina de A-4, casco con
  visor arriba y máscara colgando · la Chancha: cabina del Hércules, auriculares) tienen **las hojas
  C, D y E otra vez con fondo de cabina** (`<personaje>_av_…`) = **72 caras**. La Chancha suma su
  hoja de cabina: **82**. Los que no vuelan (Cóndor, Turco, Mateo, Colorado, Norma) van solo en gris.
- **Pilotos genéricos: ocho, con Tira A + Tira B = 12 caras, las básicas.** *(Autor, 22/10: «8
  pilotos random con menos expresiones no hace falta tanta, con mas basicas esos, son para rellenar
  los modos de juego basicos».)* Los pilotos 6, 7 y 8 son propuestas nuevas de diseño.
- **Fondo gris medio liso** en todas, el mismo de los retratos que ya existen. *(Autor, 22/10:
  «El fondo verde me paece qe qeda mal» · «pongamoslo gris».)*
- **Mismo bloque de estilo, misma grilla, misma escala** en todas las hojas.
- **Los personajes que ya existen** usan su lámina como IMAGE 1 en la Tira A, como siempre.

## El proceso, tira por tira

*(Aprendido con la Chancha, 22/10: en un chat largo el generador mezcla imágenes y prompts
anteriores — repitió caras de otra tira y perdió los auriculares.)*

1. **Un chat nuevo para cada tira.** Nunca dos tiras en el mismo chat.
2. **Tira A:** se adjunta lo que dice debajo de cada una (`team.png`, y la lámina si el personaje
   ya existe).
3. **Tiras B y C:** se adjuntan **dos imágenes**: primero `team.png` (o la lámina, si el personaje
   ya existe) y después la Tira A buena. *(Con una sola imagen el generador la toma como edición y
   devuelve la misma tira — pasó con la Chancha, 22/10.)*
4. **Si una tira sale con mucho cuerpo** (celdas altas en vez de cuadradas), no se rehace: se
   recorta cada celda en cuadrado desde arriba.
5. **Si sale rota** (caras de otra tira, cuerpo girado, falta la celda propia), se tira y se
   repite en un chat nuevo.
- **Los nuevos son PROPUESTAS de diseño:** las caras las define el autor; cambiá lo que quieras
  antes de generar.

> ⚠ **Para la sesión de código:** estos prompts están escritos a mano a partir de
> `PROMPTS_RETRATOS_LISTOS.md`. El generador `tools/hacer_prompts_retratos.py` todavía no los
> conoce: hay que sumarle las tiras B y C, las hojas C–H en grilla 5×2 y los personajes nuevos,
> y regenerar. `install_retratos.py` tiene que **cortar grillas de 5×2** además de tiras, y
> **no quitar el fondo** en las hojas «en el avión» (la cabina es parte del retrato). Y en
> `tools/install_retratos.py`: **recortar cada celda a un cuadrado desde el borde de arriba** antes
> de instalar, por si el generador entrega celdas altas.

> ⚠ **Cóndor:** hasta ahora **no tenía cara** — su retrato era una radio (*"la máquina de la guerra
> no tiene cara"*). Con esta hoja pasa a tener. **Es un cambio de canon: confirmalo.**

**Cortar:** `python3 tools/install_retratos.py <hoja>.png --anclaje pad <seis nombres>` — los
nombres van debajo de cada prompt.

---

# LOS NUEVOS — propuestas de diseño

*Ocho pilotos genéricos (de otras escuadrillas, para rellenar los modos de juego básicos), el de la Chancha y Cóndor. Ninguno se parece a los ocho del elenco: el Vasco es el pálido de pelo negro, el Colorado el rubio colorado, el Turco el de nariz grande, Puma el del bigote gris.*

---

## LA CHANCHA — el piloto del Hércules

### Tira A

**Adjuntar (chat nuevo):** `final/team.png` *(IMAGE 1 — **solo** por el trazo)*

```
Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SHEET LAYOUT: a single horizontal strip of SIX SQUARE cells in one row, edge to
edge, no gaps, no borders drawn between them. The finished image is exactly six
times as wide as it is tall. Each cell contains the SAME character as a portrait
bust - chest up, three-quarter view facing slightly LEFT, eyes toward camera.
Identical framing and identical scale in every cell: the head is the same size and
the eyes sit at the same height in all of them. The bottom edge cuts across the
upper chest; arms and hands are outside the frame. Leave a little clear space
above the hair. The ONLY difference between cells is the facial expression.
BUST ONLY: nothing below the upper chest - no legs, no boots, no full bodies, even
if the attached images show full figures.
BACKGROUND: flat neutral mid-grey (about #808080), the same grey behind the figure
in every cell. No scenery, no props, no vignette, no gradient, no shadow cast on the
background.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is the cast line-up of this game. Copy its RENDERING ONLY: line weight,
dithered shading, palette. This man is NOT any of the eight people in it and must
not resemble any of them.

INTENT, and this matters more than any feature below: the man you would trust with
your life. Big, slow, warm, never in a hurry, always there. He flies the tanker.

CHARACTER, identical in every cell:
Argentine air force transport pilot, mid forties, the HEAVIEST man in the game. Big
round face, full cheeks, a soft double chin, short thick neck. Small kind eyes set
deep in the cheeks. A wide, slightly upturned nose - affectionate, never grotesque.
Ruddy pink cheeks. Thin dark hair combed flat over a big round head. Clean-shaven.
Criollo Argentine features. Olive flight suit, collar open, stretched a little
across the chest.

EXPRESSIONS, left to right - STRIP A, the base set:
CELL 1 - NEUTRAL: level eyebrows, mouth closed and relaxed.
CELL 2 - SMILE: the smile that is his, as warm as it gets.
CELL 3 - WORRIED: inner ends of the eyebrows up, mouth a tight line.
CELL 4 - ANGER: eyebrows hard down, eyes narrowed, mouth flat or bared.
CELL 5 - BROKEN: eyebrows high and collapsed in the middle, mouth slack, eyes
  unfocused. He has just been told something.
CELL 6 - WITH HEADSET: the smile of cell 2, now wearing a 1970s aviation headset with a
  boom microphone in front of the mouth - he is talking on the radio.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `chancha_neutro chancha_sonrisa chancha_preocupado chancha_ceno chancha_roto chancha_auriculares`

### Tira B

**Adjuntar (chat nuevo), en este orden:** `final/team.png` *(IMAGE 1)* · la **Tira A** de este personaje que haya salido bien *(IMAGE 2)*.

```
DRAW A NEW IMAGE FROM SCRATCH. Do NOT return IMAGE 2, do NOT edit it, do NOT repeat
any of its faces. Every cell of the new strip shows one of the NEW expressions
listed below.

Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SHEET LAYOUT: a single horizontal strip of SIX SQUARE cells in one row, edge to
edge, no gaps, no borders drawn between them. The finished image is exactly six
times as wide as it is tall. Each cell contains the SAME character as a portrait
bust - chest up, three-quarter view facing slightly LEFT, eyes toward camera.
Identical framing and identical scale in every cell: the head is the same size and
the eyes sit at the same height in all of them. The bottom edge cuts across the
upper chest; arms and hands are outside the frame. Leave a little clear space
above the hair. The ONLY difference between cells is the facial expression.
BUST ONLY: nothing below the upper chest - no legs, no boots, no full bodies, even
if the attached images show full figures.
BACKGROUND: flat neutral mid-grey (about #808080), the same grey behind the figure
in every cell. No scenery, no props, no vignette, no gradient, no shadow cast on the
background.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is the cast line-up of this game. Copy its RENDERING ONLY: line weight,
dithered shading, palette. This man is NOT any of the eight people in it and must
not resemble any of them.

IMAGE 2 is STRIP A of THIS SAME MAN, already finished - a reference only. He must be
the same person: same face, same head shape, same hairline, same clothing, same
colours, same grey background, same framing, the head as big in the cell as it is
there. Only the expressions change.

INTENT, and this matters more than any feature below: the man you would trust with
your life. Big, slow, warm, never in a hurry, always there. He flies the tanker.

CHARACTER, identical in every cell:
Argentine air force transport pilot, mid forties, the HEAVIEST man in the game. Big
round face, full cheeks, a soft double chin, short thick neck. Small kind eyes set
deep in the cheeks. A wide, slightly upturned nose - affectionate, never grotesque.
Ruddy pink cheeks. Thin dark hair combed flat over a big round head. Clean-shaven.
Criollo Argentine features. Olive flight suit, collar open, stretched a little
across the chest.

EXPRESSIONS, left to right - STRIP B, the strong ones. Each one as THIS character
would do it, never as a generic face:
CELL 1 - LAUGHING: a real laugh, mouth wide open, eyes squeezed almost shut, head
  tipped slightly back.
CELL 2 - AFRAID: eyes wide with white showing, eyebrows up and pulled together,
  mouth open and tense.
CELL 3 - SHOUTING IN ANGER: eyebrows hard down, mouth wide open in a shout, teeth
  showing, head pushed forward.
CELL 4 - CRYING: eyebrows high and pinched in the middle, eyes squeezed, mouth turned
  down and trembling, one or two simple pixel tear lines on the cheek.
CELL 5 - RELIEVED: eyes closed, eyebrows relaxed upward, a long breath out, a small
  tired smile, head tilted a little back.
CELL 6 - DETERMINED: eyebrows low and level, eyes narrowed and fixed ahead, jaw set,
  mouth a firm line, head slightly forward.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `chancha_risa chancha_miedo chancha_grito chancha_llanto chancha_alivio chancha_decidido`

### Hoja EN CABINA — nota

*Pedido del autor (22/10): «necesitamos con casco de piloto dentro del HERCULES, nos e qe cascos
usaban».* En un Hércules **no se usa casco** (es de los cazas: asiento eyectable y visor). La
tripulación vuela con **mono y auriculares con micrófono de brazo**, como la celda 6 de la Tira A.
*Sin foto argentina de 1982 que lo confirme todavía.* Esta hoja sale directo en **grilla de 5×2**
(10 caras), el formato que el generador maneja mejor. *Autor: «alguna tira tiene qe ser dentro del
avion tambien»* → esta hoja tiene de fondo la **cabina del Hércules** en vez del gris.

### Hoja EN CABINA (grilla 5×2)

**Adjuntar (chat nuevo), en este orden:** `final/team.png` *(IMAGE 1)* · la **Tira A** de este personaje que haya salido bien *(IMAGE 2)*.

```
DRAW A NEW IMAGE FROM SCRATCH. Do NOT return IMAGE 2, do NOT edit it, do NOT repeat
any of its faces. Every cell of the new sheet shows one of the NEW expressions
listed below.

Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SHEET LAYOUT: a GRID of TEN SQUARE cells, FIVE columns and TWO rows - exactly two
rows, not three - edge to edge, no gaps, no borders drawn between them. The finished image is two and a half
times as wide as it is tall. Each cell contains the SAME character as a portrait
bust - chest up, three-quarter view facing slightly LEFT, eyes toward camera.
Identical framing and identical scale in every cell: the head is the same size and
the eyes sit at the same height in all of them. The bottom edge cuts across the
upper chest; arms and hands are outside the frame. Leave a little clear space
above the headset. The ONLY difference between cells is the facial expression.
BUST ONLY: nothing below the upper chest - no legs, no boots, no full bodies, even
if the attached images show full figures.
BACKGROUND - INSIDE THE AIRCRAFT: behind him, the cockpit of a C-130 Hercules
transport, 1970s: dark grey-green panels, rows of round analogue dials, overhead
switch panels, a side window with grey South Atlantic sky. Keep it DARK, SIMPLE and
SLIGHTLY BLURRED in big pixel shapes so the face reads first. The SAME background,
the same part of the cockpit, behind him in every cell.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is the cast line-up of this game. Copy its RENDERING ONLY: line weight,
dithered shading, palette. This man is NOT any of the eight people in it and must
not resemble any of them.

IMAGE 2 is STRIP A of THIS SAME MAN, already finished - a reference only. He must be
the same person: same face, same head shape, same hairline, same clothing, same
colours, same framing, the head as big in the cell as it is
there. Only the expressions change.

INTENT, and this matters more than any feature below: the man you would trust with
your life. Big, slow, warm, never in a hurry, always there. He flies the tanker.

CHARACTER, identical in every cell:
Argentine air force transport pilot, mid forties, the HEAVIEST man in the game. Big
round face, full cheeks, a soft double chin, short thick neck. Small kind eyes set
deep in the cheeks. A wide, slightly upturned nose - affectionate, never grotesque.
Ruddy pink cheeks. Thin dark hair combed flat over a big round head. Clean-shaven.
Criollo Argentine features. Olive flight suit, collar open, stretched a little
across the chest.

HEADSET IN EVERY CELL: the same 1970s aviation headset as cell 6 of IMAGE 2 - two
padded ear cups on a headband over the head, a boom microphone curving in front of
the mouth, a coiled cable going down out of frame. No helmet, no visor, no oxygen
mask. He is flying the aircraft and talking on the radio.

EXPRESSIONS, left to right, top row then bottom row - EN CABINA. Each one as THIS
character would do it, never as a generic face:
CELL 1 - CALM ON THE RADIO: the neutral face, mouth open mid-word, speaking into the
  boom microphone.
CELL 2 - SMILE: warm smile, eyes crinkled - good news on the radio.
CELL 3 - LISTENING HARD: head tilted, eyes to the side, eyebrows slightly together,
  mouth closed - straining to hear a weak voice on the radio.
CELL 4 - CONCENTRATING: eyes narrowed and fixed straight ahead, eyebrows low, lips
  pressed - flying very low over the water.
CELL 5 - WORRIED: inner ends of the eyebrows up, mouth a tight line.
CELL 6 - SHOUTING INTO THE MIC: eyebrows hard down, mouth wide open, head pushed
  forward toward the microphone.
CELL 7 - AFRAID: eyes wide with white showing, eyebrows up and pulled together,
  mouth open and tense.
CELL 8 - RELIEVED: eyes closed, a long breath out, a small tired smile.
CELL 9 - LAUGHING: a real laugh, mouth wide open, eyes squeezed almost shut.
CELL 10 - BROKEN: eyebrows high and collapsed in the middle, mouth slack, eyes
  unfocused - he has just heard something on the radio.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `chancha_cab_radio chancha_cab_sonrisa chancha_cab_escucha chancha_cab_concentrado chancha_cab_preocupado chancha_cab_grito chancha_cab_miedo chancha_cab_alivio chancha_cab_risa chancha_cab_roto`

### Hoja C — las grandes (grilla 5×2)

**Adjuntar (chat nuevo), en este orden:** `final/team.png` *(IMAGE 1)* · la **Tira A** de este personaje que haya salido bien *(IMAGE 2)*.

```
DRAW A NEW IMAGE FROM SCRATCH. Do NOT return IMAGE 2, do NOT edit it, do NOT repeat
any of its faces. Every cell of the new sheet shows one of the NEW expressions
listed below.

Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SHEET LAYOUT: a GRID of TEN SQUARE cells, FIVE columns and TWO rows - exactly two
rows, not three - edge to edge, no gaps, no borders drawn between them. The finished
image is two and a half times as wide as it is tall. Each cell contains the SAME
character as a portrait bust - chest up, three-quarter view facing slightly LEFT,
eyes toward camera. Identical framing and identical scale in every cell: the head is
the same size and the eyes sit at the same height in all of them. The bottom edge
cuts across the upper chest; arms and hands are outside the frame. Leave a little clear space above the head.
The ONLY difference between cells is the facial expression.
BUST ONLY: nothing below the upper chest - no legs, no boots, no full bodies, even
if the attached images show full figures.
BACKGROUND: flat neutral mid-grey (about #808080), the same grey behind the figure
in every cell. No scenery, no props, no vignette, no gradient, no shadow cast on the
background.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is the cast line-up of this game. Copy its RENDERING ONLY: line weight,
dithered shading, palette. This man is NOT any of the eight people in it and must
not resemble any of them.

IMAGE 2 is STRIP A of THIS SAME MAN, already finished - a reference only. He must be
the same person: same face, same head shape, same hairline, same clothing, same
colours, same grey background, same framing, the head as big in the cell as it is
there. Only the expressions change.

INTENT, and this matters more than any feature below: the man you would trust with
your life. Big, slow, warm, never in a hurry, always there. He flies the tanker.

CHARACTER, identical in every cell:
Argentine air force transport pilot, mid forties, the HEAVIEST man in the game. Big
round face, full cheeks, a soft double chin, short thick neck. Small kind eyes set
deep in the cheeks. A wide, slightly upturned nose - affectionate, never grotesque.
Ruddy pink cheeks. Thin dark hair combed flat over a big round head. Clean-shaven.
Criollo Argentine features. Olive flight suit, collar open, stretched a little
across the chest.

EXPRESSIONS, left to right, top row then bottom row - SHEET C. Each one as
THIS character would do it, never as a generic face:
Push every expression to the EXTREME - big, exaggerated and unmistakable, like a 90s
arcade cut-in portrait, readable at 108 px. Never subtle, even the quiet ones.
CELL 1 - LAUGHING TILL CRYING: mouth thrown wide open, eyes squeezed shut, tears of laughter flying from the corners, head thrown far back.
CELL 2 - PANIC: eyes huge with tiny pupils, mouth stretched open in a scream, eyebrows at the top of the forehead, sweat drops flying.
CELL 3 - RED WITH RAGE: face flushed dark red, teeth bared and clenched, eyebrows crushed down, a vein bulging on the forehead.
CELL 4 - SOBBING: mouth wide open and wailing, eyebrows high and pinched, eyes shut, streams of tears down both cheeks.
CELL 5 - JAW DROP: mouth hanging enormously open, eyes huge, eyebrows shot up as high as they go.
CELL 6 - DISGUSTED: nose wrinkled hard, upper lip curled up to the nose, eyes squinting, head pulled far back.
CELL 7 - IN SHOCK: frozen, face drained pale, eyes wide and fixed on nothing, mouth slightly open.
CELL 8 - IN PAIN: eyes squeezed shut, teeth clenched, the whole face scrunched to one side.
CELL 9 - EUPHORIC: shouting with joy, mouth wide open, eyes shut, eyebrows up, head tipped back.
CELL 10 - STARTLED: head jerked back, eyes popping, mouth snapped open, shoulders up to the ears.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `chancha_carcajada chancha_panico chancha_furia chancha_llanto chancha_mandibula chancha_asco chancha_shock chancha_dolor chancha_euforia chancha_sobresalto`

### Hoja D — las incómodas y las pícaras (grilla 5×2)

**Adjuntar (chat nuevo), en este orden:** `final/team.png` *(IMAGE 1)* · la **Tira A** de este personaje que haya salido bien *(IMAGE 2)*.

```
DRAW A NEW IMAGE FROM SCRATCH. Do NOT return IMAGE 2, do NOT edit it, do NOT repeat
any of its faces. Every cell of the new sheet shows one of the NEW expressions
listed below.

Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SHEET LAYOUT: a GRID of TEN SQUARE cells, FIVE columns and TWO rows - exactly two
rows, not three - edge to edge, no gaps, no borders drawn between them. The finished
image is two and a half times as wide as it is tall. Each cell contains the SAME
character as a portrait bust - chest up, three-quarter view facing slightly LEFT,
eyes toward camera. Identical framing and identical scale in every cell: the head is
the same size and the eyes sit at the same height in all of them. The bottom edge
cuts across the upper chest; arms and hands are outside the frame. Leave a little clear space above the head.
The ONLY difference between cells is the facial expression.
BUST ONLY: nothing below the upper chest - no legs, no boots, no full bodies, even
if the attached images show full figures.
BACKGROUND: flat neutral mid-grey (about #808080), the same grey behind the figure
in every cell. No scenery, no props, no vignette, no gradient, no shadow cast on the
background.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is the cast line-up of this game. Copy its RENDERING ONLY: line weight,
dithered shading, palette. This man is NOT any of the eight people in it and must
not resemble any of them.

IMAGE 2 is STRIP A of THIS SAME MAN, already finished - a reference only. He must be
the same person: same face, same head shape, same hairline, same clothing, same
colours, same grey background, same framing, the head as big in the cell as it is
there. Only the expressions change.

INTENT, and this matters more than any feature below: the man you would trust with
your life. Big, slow, warm, never in a hurry, always there. He flies the tanker.

CHARACTER, identical in every cell:
Argentine air force transport pilot, mid forties, the HEAVIEST man in the game. Big
round face, full cheeks, a soft double chin, short thick neck. Small kind eyes set
deep in the cheeks. A wide, slightly upturned nose - affectionate, never grotesque.
Ruddy pink cheeks. Thin dark hair combed flat over a big round head. Clean-shaven.
Criollo Argentine features. Olive flight suit, collar open, stretched a little
across the chest.

EXPRESSIONS, left to right, top row then bottom row - SHEET D. Each one as
THIS character would do it, never as a generic face:
Push every expression to the EXTREME - big, exaggerated and unmistakable, like a 90s
arcade cut-in portrait, readable at 108 px. Never subtle, even the quiet ones.
CELL 1 - AWKWARD: head perfectly still, eyes sliding sideways toward the camera, lips pressed together and pulled to one side in a tight uneasy half-smile - caught in an uncomfortable moment.
CELL 2 - HOLDING IN A LAUGH: cheeks puffed out, lips pressed tight and wobbling, eyes crinkled and watering.
CELL 3 - "REALLY?": a totally flat deadpan face, eyelids half down, eyebrows level, staring straight at the camera.
CELL 4 - SUSPICIOUS SIDE-EYE: head turned away, eyes sliding hard to the side, one eyebrow down, mouth flat.
CELL 5 - GRIMACE: teeth clenched and showing in a wide stiff line, eyebrows up, eyes wide - "uh oh".
CELL 6 - SMUG: chin up, eyelids half down, a slow one-sided smirk, one eyebrow raised high.
CELL 7 - EYE ROLL: eyes rolled all the way up, eyelids half down, mouth twisted to one side.
CELL 8 - WINK: one eye shut tight, a big cheeky half-smile.
CELL 9 - TONGUE OUT: tongue stuck far out in a teasing face, eyes squinting playfully.
CELL 10 - NERVOUS LAUGH: a huge forced smile, eyebrows up and apart, eyes darting, big drops of sweat on the temple.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `chancha_incomodo chancha_aguanta_risa chancha_en_serio chancha_de_reojo chancha_yikes chancha_sobrador chancha_ojos_blanco chancha_guino chancha_lengua chancha_risa_nerviosa`

### Hoja E — las de todos los días y las profundas (grilla 5×2)

**Adjuntar (chat nuevo), en este orden:** `final/team.png` *(IMAGE 1)* · la **Tira A** de este personaje que haya salido bien *(IMAGE 2)*.

```
DRAW A NEW IMAGE FROM SCRATCH. Do NOT return IMAGE 2, do NOT edit it, do NOT repeat
any of its faces. Every cell of the new sheet shows one of the NEW expressions
listed below.

Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SHEET LAYOUT: a GRID of TEN SQUARE cells, FIVE columns and TWO rows - exactly two
rows, not three - edge to edge, no gaps, no borders drawn between them. The finished
image is two and a half times as wide as it is tall. Each cell contains the SAME
character as a portrait bust - chest up, three-quarter view facing slightly LEFT,
eyes toward camera. Identical framing and identical scale in every cell: the head is
the same size and the eyes sit at the same height in all of them. The bottom edge
cuts across the upper chest; arms and hands are outside the frame. Leave a little clear space above the head.
The ONLY difference between cells is the facial expression.
BUST ONLY: nothing below the upper chest - no legs, no boots, no full bodies, even
if the attached images show full figures.
BACKGROUND: flat neutral mid-grey (about #808080), the same grey behind the figure
in every cell. No scenery, no props, no vignette, no gradient, no shadow cast on the
background.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is the cast line-up of this game. Copy its RENDERING ONLY: line weight,
dithered shading, palette. This man is NOT any of the eight people in it and must
not resemble any of them.

IMAGE 2 is STRIP A of THIS SAME MAN, already finished - a reference only. He must be
the same person: same face, same head shape, same hairline, same clothing, same
colours, same grey background, same framing, the head as big in the cell as it is
there. Only the expressions change.

INTENT, and this matters more than any feature below: the man you would trust with
your life. Big, slow, warm, never in a hurry, always there. He flies the tanker.

CHARACTER, identical in every cell:
Argentine air force transport pilot, mid forties, the HEAVIEST man in the game. Big
round face, full cheeks, a soft double chin, short thick neck. Small kind eyes set
deep in the cheeks. A wide, slightly upturned nose - affectionate, never grotesque.
Ruddy pink cheeks. Thin dark hair combed flat over a big round head. Clean-shaven.
Criollo Argentine features. Olive flight suit, collar open, stretched a little
across the chest.

EXPRESSIONS, left to right, top row then bottom row - SHEET E. Each one as
THIS character would do it, never as a generic face:
Push every expression to the EXTREME - big, exaggerated and unmistakable, like a 90s
arcade cut-in portrait, readable at 108 px. Never subtle, even the quiet ones.
CELL 1 - SURPRISED: eyebrows shot up, eyes wide, mouth a small round O.
CELL 2 - DOUBTFUL: one eyebrow high and one low, eyes to the side, mouth pulled hard to one side.
CELL 3 - THINKING: eyes up and to the side, lips pushed out, one eyebrow raised.
CELL 4 - TALKING: the neutral face, mouth open mid-word, eyebrows slightly raised.
CELL 5 - TENDERNESS: soft wet eyes, eyebrows gently up, a small closed-mouth smile - thinking of someone loved.
CELL 6 - FAR AWAY: eyes looking off into the distance at nothing, a faint sad smile, eyebrows up.
CELL 7 - FIGHTING TEARS: chin trembling, lips pressed tight, eyes full of tears, eyebrows pinched up.
CELL 8 - SAD SMILE: eyebrows up in the middle, eyes wet, the mouth smiling anyway.
CELL 9 - PROUD: chin up high, a firm small smile, eyes bright.
CELL 10 - EXHAUSTED: eyelids almost shut, head drooping, mouth hanging slack - about to fall asleep.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `chancha_sorpresa chancha_duda chancha_pensativo chancha_hablando chancha_ternura chancha_mirada_perdida chancha_aguanta_llanto chancha_sonrisa_triste chancha_orgullo chancha_agotado`

### EN EL AVIÓN — las mismas tres hojas, con fondo de cabina

### Hoja C · en el avión — las grandes (grilla 5×2)

**Adjuntar (chat nuevo), en este orden:** la **Tira A** *(IMAGE 1)* · la **hoja cabina** de este personaje que haya salido bien *(IMAGE 2)*.

```
DRAW A NEW IMAGE FROM SCRATCH. Do NOT return IMAGE 2, do NOT edit it, do NOT repeat
any of its faces. Every cell of the new sheet shows one of the NEW expressions
listed below.

Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SHEET LAYOUT: a GRID of TEN SQUARE cells, FIVE columns and TWO rows - exactly two
rows, not three - edge to edge, no gaps, no borders drawn between them. The finished
image is two and a half times as wide as it is tall. Each cell contains the SAME
character as a portrait bust - chest up, three-quarter view facing slightly LEFT,
eyes toward camera. Identical framing and identical scale in every cell: the head is
the same size and the eyes sit at the same height in all of them. The bottom edge
cuts across the upper chest; arms and hands are outside the frame. Leave a little clear space above the head.
The ONLY difference between cells is the facial expression.
BUST ONLY: nothing below the upper chest - no legs, no boots, no full bodies, even
if the attached images show full figures.
BACKGROUND - INSIDE THE AIRCRAFT: behind him, the cockpit of a C-130 Hercules
transport, 1970s: dark grey-green panels, rows of round analogue dials, overhead
switch panels, a side window with grey South Atlantic sky. Keep it DARK, SIMPLE and
SLIGHTLY BLURRED in big pixel shapes so the face reads first. The SAME background,
the same part of the cockpit, behind him in every cell.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is STRIP A of THIS SAME MAN, already finished - a reference only. He must
be the same person: same face, same head shape, same hairline, same clothing, same
colours, same line work and dithered shading.
IMAGE 2 is an earlier sheet of THIS SAME MAN IN THE COCKPIT. Copy from it exactly:
the cockpit background, the headset, the framing and the head size.

INTENT, and this matters more than any feature below: the man you would trust with
your life. Big, slow, warm, never in a hurry, always there. He flies the tanker.

CHARACTER, identical in every cell:
Argentine air force transport pilot, mid forties, the HEAVIEST man in the game. Big
round face, full cheeks, a soft double chin, short thick neck. Small kind eyes set
deep in the cheeks. A wide, slightly upturned nose - affectionate, never grotesque.
Ruddy pink cheeks. Thin dark hair combed flat over a big round head. Clean-shaven.
Criollo Argentine features. Olive flight suit, collar open, stretched a little
across the chest.

IN THE COCKPIT, EVERY CELL: a 1970s aviation headset - two padded ear cups on a
headband over the head, a boom microphone curving in front of the mouth. No helmet,
no visor, no oxygen mask.

EXPRESSIONS, left to right, top row then bottom row - SHEET C, IN THE COCKPIT. Each one as
THIS character would do it, never as a generic face:
Push every expression to the EXTREME - big, exaggerated and unmistakable, like a 90s
arcade cut-in portrait, readable at 108 px. Never subtle, even the quiet ones.
CELL 1 - LAUGHING TILL CRYING: mouth thrown wide open, eyes squeezed shut, tears of laughter flying from the corners, head thrown far back.
CELL 2 - PANIC: eyes huge with tiny pupils, mouth stretched open in a scream, eyebrows at the top of the forehead, sweat drops flying.
CELL 3 - RED WITH RAGE: face flushed dark red, teeth bared and clenched, eyebrows crushed down, a vein bulging on the forehead.
CELL 4 - SOBBING: mouth wide open and wailing, eyebrows high and pinched, eyes shut, streams of tears down both cheeks.
CELL 5 - JAW DROP: mouth hanging enormously open, eyes huge, eyebrows shot up as high as they go.
CELL 6 - DISGUSTED: nose wrinkled hard, upper lip curled up to the nose, eyes squinting, head pulled far back.
CELL 7 - IN SHOCK: frozen, face drained pale, eyes wide and fixed on nothing, mouth slightly open.
CELL 8 - IN PAIN: eyes squeezed shut, teeth clenched, the whole face scrunched to one side.
CELL 9 - EUPHORIC: shouting with joy, mouth wide open, eyes shut, eyebrows up, head tipped back.
CELL 10 - STARTLED: head jerked back, eyes popping, mouth snapped open, shoulders up to the ears.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `chancha_av_carcajada chancha_av_panico chancha_av_furia chancha_av_llanto chancha_av_mandibula chancha_av_asco chancha_av_shock chancha_av_dolor chancha_av_euforia chancha_av_sobresalto`

### Hoja D · en el avión — las incómodas y las pícaras (grilla 5×2)

**Adjuntar (chat nuevo), en este orden:** la **Tira A** *(IMAGE 1)* · la **hoja cabina** de este personaje que haya salido bien *(IMAGE 2)*.

```
DRAW A NEW IMAGE FROM SCRATCH. Do NOT return IMAGE 2, do NOT edit it, do NOT repeat
any of its faces. Every cell of the new sheet shows one of the NEW expressions
listed below.

Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SHEET LAYOUT: a GRID of TEN SQUARE cells, FIVE columns and TWO rows - exactly two
rows, not three - edge to edge, no gaps, no borders drawn between them. The finished
image is two and a half times as wide as it is tall. Each cell contains the SAME
character as a portrait bust - chest up, three-quarter view facing slightly LEFT,
eyes toward camera. Identical framing and identical scale in every cell: the head is
the same size and the eyes sit at the same height in all of them. The bottom edge
cuts across the upper chest; arms and hands are outside the frame. Leave a little clear space above the head.
The ONLY difference between cells is the facial expression.
BUST ONLY: nothing below the upper chest - no legs, no boots, no full bodies, even
if the attached images show full figures.
BACKGROUND - INSIDE THE AIRCRAFT: behind him, the cockpit of a C-130 Hercules
transport, 1970s: dark grey-green panels, rows of round analogue dials, overhead
switch panels, a side window with grey South Atlantic sky. Keep it DARK, SIMPLE and
SLIGHTLY BLURRED in big pixel shapes so the face reads first. The SAME background,
the same part of the cockpit, behind him in every cell.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is STRIP A of THIS SAME MAN, already finished - a reference only. He must
be the same person: same face, same head shape, same hairline, same clothing, same
colours, same line work and dithered shading.
IMAGE 2 is an earlier sheet of THIS SAME MAN IN THE COCKPIT. Copy from it exactly:
the cockpit background, the headset, the framing and the head size.

INTENT, and this matters more than any feature below: the man you would trust with
your life. Big, slow, warm, never in a hurry, always there. He flies the tanker.

CHARACTER, identical in every cell:
Argentine air force transport pilot, mid forties, the HEAVIEST man in the game. Big
round face, full cheeks, a soft double chin, short thick neck. Small kind eyes set
deep in the cheeks. A wide, slightly upturned nose - affectionate, never grotesque.
Ruddy pink cheeks. Thin dark hair combed flat over a big round head. Clean-shaven.
Criollo Argentine features. Olive flight suit, collar open, stretched a little
across the chest.

IN THE COCKPIT, EVERY CELL: a 1970s aviation headset - two padded ear cups on a
headband over the head, a boom microphone curving in front of the mouth. No helmet,
no visor, no oxygen mask.

EXPRESSIONS, left to right, top row then bottom row - SHEET D, IN THE COCKPIT. Each one as
THIS character would do it, never as a generic face:
Push every expression to the EXTREME - big, exaggerated and unmistakable, like a 90s
arcade cut-in portrait, readable at 108 px. Never subtle, even the quiet ones.
CELL 1 - AWKWARD: head perfectly still, eyes sliding sideways toward the camera, lips pressed together and pulled to one side in a tight uneasy half-smile - caught in an uncomfortable moment.
CELL 2 - HOLDING IN A LAUGH: cheeks puffed out, lips pressed tight and wobbling, eyes crinkled and watering.
CELL 3 - "REALLY?": a totally flat deadpan face, eyelids half down, eyebrows level, staring straight at the camera.
CELL 4 - SUSPICIOUS SIDE-EYE: head turned away, eyes sliding hard to the side, one eyebrow down, mouth flat.
CELL 5 - GRIMACE: teeth clenched and showing in a wide stiff line, eyebrows up, eyes wide - "uh oh".
CELL 6 - SMUG: chin up, eyelids half down, a slow one-sided smirk, one eyebrow raised high.
CELL 7 - EYE ROLL: eyes rolled all the way up, eyelids half down, mouth twisted to one side.
CELL 8 - WINK: one eye shut tight, a big cheeky half-smile.
CELL 9 - TONGUE OUT: tongue stuck far out in a teasing face, eyes squinting playfully.
CELL 10 - NERVOUS LAUGH: a huge forced smile, eyebrows up and apart, eyes darting, big drops of sweat on the temple.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `chancha_av_incomodo chancha_av_aguanta_risa chancha_av_en_serio chancha_av_de_reojo chancha_av_yikes chancha_av_sobrador chancha_av_ojos_blanco chancha_av_guino chancha_av_lengua chancha_av_risa_nerviosa`

### Hoja E · en el avión — las de todos los días y las profundas (grilla 5×2)

**Adjuntar (chat nuevo), en este orden:** la **Tira A** *(IMAGE 1)* · la **hoja cabina** de este personaje que haya salido bien *(IMAGE 2)*.

```
DRAW A NEW IMAGE FROM SCRATCH. Do NOT return IMAGE 2, do NOT edit it, do NOT repeat
any of its faces. Every cell of the new sheet shows one of the NEW expressions
listed below.

Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SHEET LAYOUT: a GRID of TEN SQUARE cells, FIVE columns and TWO rows - exactly two
rows, not three - edge to edge, no gaps, no borders drawn between them. The finished
image is two and a half times as wide as it is tall. Each cell contains the SAME
character as a portrait bust - chest up, three-quarter view facing slightly LEFT,
eyes toward camera. Identical framing and identical scale in every cell: the head is
the same size and the eyes sit at the same height in all of them. The bottom edge
cuts across the upper chest; arms and hands are outside the frame. Leave a little clear space above the head.
The ONLY difference between cells is the facial expression.
BUST ONLY: nothing below the upper chest - no legs, no boots, no full bodies, even
if the attached images show full figures.
BACKGROUND - INSIDE THE AIRCRAFT: behind him, the cockpit of a C-130 Hercules
transport, 1970s: dark grey-green panels, rows of round analogue dials, overhead
switch panels, a side window with grey South Atlantic sky. Keep it DARK, SIMPLE and
SLIGHTLY BLURRED in big pixel shapes so the face reads first. The SAME background,
the same part of the cockpit, behind him in every cell.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is STRIP A of THIS SAME MAN, already finished - a reference only. He must
be the same person: same face, same head shape, same hairline, same clothing, same
colours, same line work and dithered shading.
IMAGE 2 is an earlier sheet of THIS SAME MAN IN THE COCKPIT. Copy from it exactly:
the cockpit background, the headset, the framing and the head size.

INTENT, and this matters more than any feature below: the man you would trust with
your life. Big, slow, warm, never in a hurry, always there. He flies the tanker.

CHARACTER, identical in every cell:
Argentine air force transport pilot, mid forties, the HEAVIEST man in the game. Big
round face, full cheeks, a soft double chin, short thick neck. Small kind eyes set
deep in the cheeks. A wide, slightly upturned nose - affectionate, never grotesque.
Ruddy pink cheeks. Thin dark hair combed flat over a big round head. Clean-shaven.
Criollo Argentine features. Olive flight suit, collar open, stretched a little
across the chest.

IN THE COCKPIT, EVERY CELL: a 1970s aviation headset - two padded ear cups on a
headband over the head, a boom microphone curving in front of the mouth. No helmet,
no visor, no oxygen mask.

EXPRESSIONS, left to right, top row then bottom row - SHEET E, IN THE COCKPIT. Each one as
THIS character would do it, never as a generic face:
Push every expression to the EXTREME - big, exaggerated and unmistakable, like a 90s
arcade cut-in portrait, readable at 108 px. Never subtle, even the quiet ones.
CELL 1 - SURPRISED: eyebrows shot up, eyes wide, mouth a small round O.
CELL 2 - DOUBTFUL: one eyebrow high and one low, eyes to the side, mouth pulled hard to one side.
CELL 3 - THINKING: eyes up and to the side, lips pushed out, one eyebrow raised.
CELL 4 - TALKING: the neutral face, mouth open mid-word, eyebrows slightly raised.
CELL 5 - TENDERNESS: soft wet eyes, eyebrows gently up, a small closed-mouth smile - thinking of someone loved.
CELL 6 - FAR AWAY: eyes looking off into the distance at nothing, a faint sad smile, eyebrows up.
CELL 7 - FIGHTING TEARS: chin trembling, lips pressed tight, eyes full of tears, eyebrows pinched up.
CELL 8 - SAD SMILE: eyebrows up in the middle, eyes wet, the mouth smiling anyway.
CELL 9 - PROUD: chin up high, a firm small smile, eyes bright.
CELL 10 - EXHAUSTED: eyelids almost shut, head drooping, mouth hanging slack - about to fall asleep.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `chancha_av_sorpresa chancha_av_duda chancha_av_pensativo chancha_av_hablando chancha_av_ternura chancha_av_mirada_perdida chancha_av_aguanta_llanto chancha_av_sonrisa_triste chancha_av_orgullo chancha_av_agotado`

---

## CÓNDOR — el comando, desde la base

### Tira A

**Adjuntar (chat nuevo):** `final/team.png` *(IMAGE 1 — **solo** por el trazo)*

```
Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SHEET LAYOUT: a single horizontal strip of SIX SQUARE cells in one row, edge to
edge, no gaps, no borders drawn between them. The finished image is exactly six
times as wide as it is tall. Each cell contains the SAME character as a portrait
bust - chest up, three-quarter view facing slightly LEFT, eyes toward camera.
Identical framing and identical scale in every cell: the head is the same size and
the eyes sit at the same height in all of them. The bottom edge cuts across the
upper chest; arms and hands are outside the frame. Leave a little clear space
above the hair. The ONLY difference between cells is the facial expression.
BUST ONLY: nothing below the upper chest - no legs, no boots, no full bodies, even
if the attached images show full figures.
BACKGROUND: flat neutral mid-grey (about #808080), the same grey behind the figure
in every cell. No scenery, no props, no vignette, no gradient, no shadow cast on the
background.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is the cast line-up of this game. Copy its RENDERING ONLY: line weight,
dithered shading, palette. This man is NOT any of the eight people in it and must
not resemble any of them.

INTENT, and this matters more than any feature below: the voice from the base.
Calm, dry, tired of sending boys out. He never raises his voice and he never gets
used to it.

CHARACTER, identical in every cell:
Argentine air force senior officer, late fifties. Lean, upright. Long narrow face,
a big hooked nose like a bird of prey, deep-set dark eyes under heavy grey
eyebrows. Short grey hair cut close at the sides. Criollo Argentine features,
weathered skin. Olive uniform shirt with a dark tie, no insignia, no badges.

EXPRESSIONS, left to right - STRIP A, the base set:
CELL 1 - NEUTRAL: level eyebrows, mouth closed and relaxed.
CELL 2 - SMILE: the smile that is his, as warm as it gets.
CELL 3 - WORRIED: inner ends of the eyebrows up, mouth a tight line.
CELL 4 - ANGER: eyebrows hard down, eyes narrowed, mouth flat or bared.
CELL 5 - BROKEN: eyebrows high and collapsed in the middle, mouth slack, eyes
  unfocused. He has just been told something.
CELL 6 - AT THE RADIO: the neutral face of cell 1, a desk radio headset over one ear,
  speaking into a hand microphone held just below the frame edge (only the cable
  shows).

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `condor_neutro condor_sonrisa condor_preocupado condor_ceno condor_roto condor_radio`

### Tira B

**Adjuntar (chat nuevo), en este orden:** `final/team.png` *(IMAGE 1)* · la **Tira A** de este personaje que haya salido bien *(IMAGE 2)*.

```
DRAW A NEW IMAGE FROM SCRATCH. Do NOT return IMAGE 2, do NOT edit it, do NOT repeat
any of its faces. Every cell of the new strip shows one of the NEW expressions
listed below.

Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SHEET LAYOUT: a single horizontal strip of SIX SQUARE cells in one row, edge to
edge, no gaps, no borders drawn between them. The finished image is exactly six
times as wide as it is tall. Each cell contains the SAME character as a portrait
bust - chest up, three-quarter view facing slightly LEFT, eyes toward camera.
Identical framing and identical scale in every cell: the head is the same size and
the eyes sit at the same height in all of them. The bottom edge cuts across the
upper chest; arms and hands are outside the frame. Leave a little clear space
above the hair. The ONLY difference between cells is the facial expression.
BUST ONLY: nothing below the upper chest - no legs, no boots, no full bodies, even
if the attached images show full figures.
BACKGROUND: flat neutral mid-grey (about #808080), the same grey behind the figure
in every cell. No scenery, no props, no vignette, no gradient, no shadow cast on the
background.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is the cast line-up of this game. Copy its RENDERING ONLY: line weight,
dithered shading, palette. This man is NOT any of the eight people in it and must
not resemble any of them.

IMAGE 2 is STRIP A of THIS SAME MAN, already finished - a reference only. He must be
the same person: same face, same head shape, same hairline, same clothing, same
colours, same grey background, same framing, the head as big in the cell as it is
there. Only the expressions change.

INTENT, and this matters more than any feature below: the voice from the base.
Calm, dry, tired of sending boys out. He never raises his voice and he never gets
used to it.

CHARACTER, identical in every cell:
Argentine air force senior officer, late fifties. Lean, upright. Long narrow face,
a big hooked nose like a bird of prey, deep-set dark eyes under heavy grey
eyebrows. Short grey hair cut close at the sides. Criollo Argentine features,
weathered skin. Olive uniform shirt with a dark tie, no insignia, no badges.

EXPRESSIONS, left to right - STRIP B, the strong ones. Each one as THIS character
would do it, never as a generic face:
CELL 1 - LAUGHING: a real laugh, mouth wide open, eyes squeezed almost shut, head
  tipped slightly back.
CELL 2 - AFRAID: eyes wide with white showing, eyebrows up and pulled together,
  mouth open and tense.
CELL 3 - SHOUTING IN ANGER: eyebrows hard down, mouth wide open in a shout, teeth
  showing, head pushed forward.
CELL 4 - CRYING: eyebrows high and pinched in the middle, eyes squeezed, mouth turned
  down and trembling, one or two simple pixel tear lines on the cheek.
CELL 5 - RELIEVED: eyes closed, eyebrows relaxed upward, a long breath out, a small
  tired smile, head tilted a little back.
CELL 6 - DETERMINED: eyebrows low and level, eyes narrowed and fixed ahead, jaw set,
  mouth a firm line, head slightly forward.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `condor_risa condor_miedo condor_grito condor_llanto condor_alivio condor_decidido`

### Hoja C — las grandes (grilla 5×2)

**Adjuntar (chat nuevo), en este orden:** `final/team.png` *(IMAGE 1)* · la **Tira A** de este personaje que haya salido bien *(IMAGE 2)*.

```
DRAW A NEW IMAGE FROM SCRATCH. Do NOT return IMAGE 2, do NOT edit it, do NOT repeat
any of its faces. Every cell of the new sheet shows one of the NEW expressions
listed below.

Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SHEET LAYOUT: a GRID of TEN SQUARE cells, FIVE columns and TWO rows - exactly two
rows, not three - edge to edge, no gaps, no borders drawn between them. The finished
image is two and a half times as wide as it is tall. Each cell contains the SAME
character as a portrait bust - chest up, three-quarter view facing slightly LEFT,
eyes toward camera. Identical framing and identical scale in every cell: the head is
the same size and the eyes sit at the same height in all of them. The bottom edge
cuts across the upper chest; arms and hands are outside the frame. Leave a little clear space above the head.
The ONLY difference between cells is the facial expression.
BUST ONLY: nothing below the upper chest - no legs, no boots, no full bodies, even
if the attached images show full figures.
BACKGROUND: flat neutral mid-grey (about #808080), the same grey behind the figure
in every cell. No scenery, no props, no vignette, no gradient, no shadow cast on the
background.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is the cast line-up of this game. Copy its RENDERING ONLY: line weight,
dithered shading, palette. This man is NOT any of the eight people in it and must
not resemble any of them.

IMAGE 2 is STRIP A of THIS SAME MAN, already finished - a reference only. He must be
the same person: same face, same head shape, same hairline, same clothing, same
colours, same grey background, same framing, the head as big in the cell as it is
there. Only the expressions change.

INTENT, and this matters more than any feature below: the voice from the base.
Calm, dry, tired of sending boys out. He never raises his voice and he never gets
used to it.

CHARACTER, identical in every cell:
Argentine air force senior officer, late fifties. Lean, upright. Long narrow face,
a big hooked nose like a bird of prey, deep-set dark eyes under heavy grey
eyebrows. Short grey hair cut close at the sides. Criollo Argentine features,
weathered skin. Olive uniform shirt with a dark tie, no insignia, no badges.

EXPRESSIONS, left to right, top row then bottom row - SHEET C. Each one as
THIS character would do it, never as a generic face:
Push every expression to the EXTREME - big, exaggerated and unmistakable, like a 90s
arcade cut-in portrait, readable at 108 px. Never subtle, even the quiet ones.
CELL 1 - LAUGHING TILL CRYING: mouth thrown wide open, eyes squeezed shut, tears of laughter flying from the corners, head thrown far back.
CELL 2 - PANIC: eyes huge with tiny pupils, mouth stretched open in a scream, eyebrows at the top of the forehead, sweat drops flying.
CELL 3 - RED WITH RAGE: face flushed dark red, teeth bared and clenched, eyebrows crushed down, a vein bulging on the forehead.
CELL 4 - SOBBING: mouth wide open and wailing, eyebrows high and pinched, eyes shut, streams of tears down both cheeks.
CELL 5 - JAW DROP: mouth hanging enormously open, eyes huge, eyebrows shot up as high as they go.
CELL 6 - DISGUSTED: nose wrinkled hard, upper lip curled up to the nose, eyes squinting, head pulled far back.
CELL 7 - IN SHOCK: frozen, face drained pale, eyes wide and fixed on nothing, mouth slightly open.
CELL 8 - IN PAIN: eyes squeezed shut, teeth clenched, the whole face scrunched to one side.
CELL 9 - EUPHORIC: shouting with joy, mouth wide open, eyes shut, eyebrows up, head tipped back.
CELL 10 - STARTLED: head jerked back, eyes popping, mouth snapped open, shoulders up to the ears.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `condor_carcajada condor_panico condor_furia condor_llanto condor_mandibula condor_asco condor_shock condor_dolor condor_euforia condor_sobresalto`

### Hoja D — las incómodas y las pícaras (grilla 5×2)

**Adjuntar (chat nuevo), en este orden:** `final/team.png` *(IMAGE 1)* · la **Tira A** de este personaje que haya salido bien *(IMAGE 2)*.

```
DRAW A NEW IMAGE FROM SCRATCH. Do NOT return IMAGE 2, do NOT edit it, do NOT repeat
any of its faces. Every cell of the new sheet shows one of the NEW expressions
listed below.

Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SHEET LAYOUT: a GRID of TEN SQUARE cells, FIVE columns and TWO rows - exactly two
rows, not three - edge to edge, no gaps, no borders drawn between them. The finished
image is two and a half times as wide as it is tall. Each cell contains the SAME
character as a portrait bust - chest up, three-quarter view facing slightly LEFT,
eyes toward camera. Identical framing and identical scale in every cell: the head is
the same size and the eyes sit at the same height in all of them. The bottom edge
cuts across the upper chest; arms and hands are outside the frame. Leave a little clear space above the head.
The ONLY difference between cells is the facial expression.
BUST ONLY: nothing below the upper chest - no legs, no boots, no full bodies, even
if the attached images show full figures.
BACKGROUND: flat neutral mid-grey (about #808080), the same grey behind the figure
in every cell. No scenery, no props, no vignette, no gradient, no shadow cast on the
background.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is the cast line-up of this game. Copy its RENDERING ONLY: line weight,
dithered shading, palette. This man is NOT any of the eight people in it and must
not resemble any of them.

IMAGE 2 is STRIP A of THIS SAME MAN, already finished - a reference only. He must be
the same person: same face, same head shape, same hairline, same clothing, same
colours, same grey background, same framing, the head as big in the cell as it is
there. Only the expressions change.

INTENT, and this matters more than any feature below: the voice from the base.
Calm, dry, tired of sending boys out. He never raises his voice and he never gets
used to it.

CHARACTER, identical in every cell:
Argentine air force senior officer, late fifties. Lean, upright. Long narrow face,
a big hooked nose like a bird of prey, deep-set dark eyes under heavy grey
eyebrows. Short grey hair cut close at the sides. Criollo Argentine features,
weathered skin. Olive uniform shirt with a dark tie, no insignia, no badges.

EXPRESSIONS, left to right, top row then bottom row - SHEET D. Each one as
THIS character would do it, never as a generic face:
Push every expression to the EXTREME - big, exaggerated and unmistakable, like a 90s
arcade cut-in portrait, readable at 108 px. Never subtle, even the quiet ones.
CELL 1 - AWKWARD: head perfectly still, eyes sliding sideways toward the camera, lips pressed together and pulled to one side in a tight uneasy half-smile - caught in an uncomfortable moment.
CELL 2 - HOLDING IN A LAUGH: cheeks puffed out, lips pressed tight and wobbling, eyes crinkled and watering.
CELL 3 - "REALLY?": a totally flat deadpan face, eyelids half down, eyebrows level, staring straight at the camera.
CELL 4 - SUSPICIOUS SIDE-EYE: head turned away, eyes sliding hard to the side, one eyebrow down, mouth flat.
CELL 5 - GRIMACE: teeth clenched and showing in a wide stiff line, eyebrows up, eyes wide - "uh oh".
CELL 6 - SMUG: chin up, eyelids half down, a slow one-sided smirk, one eyebrow raised high.
CELL 7 - EYE ROLL: eyes rolled all the way up, eyelids half down, mouth twisted to one side.
CELL 8 - WINK: one eye shut tight, a big cheeky half-smile.
CELL 9 - TONGUE OUT: tongue stuck far out in a teasing face, eyes squinting playfully.
CELL 10 - NERVOUS LAUGH: a huge forced smile, eyebrows up and apart, eyes darting, big drops of sweat on the temple.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `condor_incomodo condor_aguanta_risa condor_en_serio condor_de_reojo condor_yikes condor_sobrador condor_ojos_blanco condor_guino condor_lengua condor_risa_nerviosa`

### Hoja E — las de todos los días y las profundas (grilla 5×2)

**Adjuntar (chat nuevo), en este orden:** `final/team.png` *(IMAGE 1)* · la **Tira A** de este personaje que haya salido bien *(IMAGE 2)*.

```
DRAW A NEW IMAGE FROM SCRATCH. Do NOT return IMAGE 2, do NOT edit it, do NOT repeat
any of its faces. Every cell of the new sheet shows one of the NEW expressions
listed below.

Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SHEET LAYOUT: a GRID of TEN SQUARE cells, FIVE columns and TWO rows - exactly two
rows, not three - edge to edge, no gaps, no borders drawn between them. The finished
image is two and a half times as wide as it is tall. Each cell contains the SAME
character as a portrait bust - chest up, three-quarter view facing slightly LEFT,
eyes toward camera. Identical framing and identical scale in every cell: the head is
the same size and the eyes sit at the same height in all of them. The bottom edge
cuts across the upper chest; arms and hands are outside the frame. Leave a little clear space above the head.
The ONLY difference between cells is the facial expression.
BUST ONLY: nothing below the upper chest - no legs, no boots, no full bodies, even
if the attached images show full figures.
BACKGROUND: flat neutral mid-grey (about #808080), the same grey behind the figure
in every cell. No scenery, no props, no vignette, no gradient, no shadow cast on the
background.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is the cast line-up of this game. Copy its RENDERING ONLY: line weight,
dithered shading, palette. This man is NOT any of the eight people in it and must
not resemble any of them.

IMAGE 2 is STRIP A of THIS SAME MAN, already finished - a reference only. He must be
the same person: same face, same head shape, same hairline, same clothing, same
colours, same grey background, same framing, the head as big in the cell as it is
there. Only the expressions change.

INTENT, and this matters more than any feature below: the voice from the base.
Calm, dry, tired of sending boys out. He never raises his voice and he never gets
used to it.

CHARACTER, identical in every cell:
Argentine air force senior officer, late fifties. Lean, upright. Long narrow face,
a big hooked nose like a bird of prey, deep-set dark eyes under heavy grey
eyebrows. Short grey hair cut close at the sides. Criollo Argentine features,
weathered skin. Olive uniform shirt with a dark tie, no insignia, no badges.

EXPRESSIONS, left to right, top row then bottom row - SHEET E. Each one as
THIS character would do it, never as a generic face:
Push every expression to the EXTREME - big, exaggerated and unmistakable, like a 90s
arcade cut-in portrait, readable at 108 px. Never subtle, even the quiet ones.
CELL 1 - SURPRISED: eyebrows shot up, eyes wide, mouth a small round O.
CELL 2 - DOUBTFUL: one eyebrow high and one low, eyes to the side, mouth pulled hard to one side.
CELL 3 - THINKING: eyes up and to the side, lips pushed out, one eyebrow raised.
CELL 4 - TALKING: the neutral face, mouth open mid-word, eyebrows slightly raised.
CELL 5 - TENDERNESS: soft wet eyes, eyebrows gently up, a small closed-mouth smile - thinking of someone loved.
CELL 6 - FAR AWAY: eyes looking off into the distance at nothing, a faint sad smile, eyebrows up.
CELL 7 - FIGHTING TEARS: chin trembling, lips pressed tight, eyes full of tears, eyebrows pinched up.
CELL 8 - SAD SMILE: eyebrows up in the middle, eyes wet, the mouth smiling anyway.
CELL 9 - PROUD: chin up high, a firm small smile, eyes bright.
CELL 10 - EXHAUSTED: eyelids almost shut, head drooping, mouth hanging slack - about to fall asleep.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `condor_sorpresa condor_duda condor_pensativo condor_hablando condor_ternura condor_mirada_perdida condor_aguanta_llanto condor_sonrisa_triste condor_orgullo condor_agotado`

---

## PILOTO 1 — EL VETERANO

### Tira A

**Adjuntar (chat nuevo):** `final/team.png` *(IMAGE 1 — **solo** por el trazo)*

```
Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SHEET LAYOUT: a single horizontal strip of SIX SQUARE cells in one row, edge to
edge, no gaps, no borders drawn between them. The finished image is exactly six
times as wide as it is tall. Each cell contains the SAME character as a portrait
bust - chest up, three-quarter view facing slightly LEFT, eyes toward camera.
Identical framing and identical scale in every cell: the head is the same size and
the eyes sit at the same height in all of them. The bottom edge cuts across the
upper chest; arms and hands are outside the frame. Leave a little clear space
above the hair. The ONLY difference between cells is the facial expression.
BUST ONLY: nothing below the upper chest - no legs, no boots, no full bodies, even
if the attached images show full figures.
BACKGROUND: flat neutral mid-grey (about #808080), the same grey behind the figure
in every cell. No scenery, no props, no vignette, no gradient, no shadow cast on the
background.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is the cast line-up of this game. Copy its RENDERING ONLY: line weight,
dithered shading, palette. This man is NOT any of the eight people in it and must
not resemble any of them.

INTENT: the old hand of another squadron. Has flown everything, trusts nobody's
enthusiasm, looks after the young ones without saying so.

CHARACTER, identical in every cell:
Argentine air force pilot, about 45. Stocky, square face, heavy jaw, receding
hairline with short dark-grey hair, a THICK DARK MOUSTACHE, heavy straight eyebrows,
ruddy weathered criollo skin. Olive flight suit, collar open.

EXPRESSIONS, left to right - STRIP A, the base set:
CELL 1 - NEUTRAL: level eyebrows, mouth closed and relaxed.
CELL 2 - SMILE: the smile that is his, as warm as it gets.
CELL 3 - WORRIED: inner ends of the eyebrows up, mouth a tight line.
CELL 4 - ANGER: eyebrows hard down, eyes narrowed, mouth flat or bared.
CELL 5 - BROKEN: eyebrows high and collapsed in the middle, mouth slack, eyes
  unfocused. He has just been told something.
CELL 6 - HELMETED: the neutral face of cell 1 in a white flight helmet with the visor up
  and the oxygen mask hanging unclipped. Eyes and eyebrows visible.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `piloto_veterano_neutro piloto_veterano_sonrisa piloto_veterano_preocupado piloto_veterano_ceno piloto_veterano_roto piloto_veterano_casco`

### Tira B

**Adjuntar (chat nuevo), en este orden:** `final/team.png` *(IMAGE 1)* · la **Tira A** de este personaje que haya salido bien *(IMAGE 2)*.

```
DRAW A NEW IMAGE FROM SCRATCH. Do NOT return IMAGE 2, do NOT edit it, do NOT repeat
any of its faces. Every cell of the new strip shows one of the NEW expressions
listed below.

Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SHEET LAYOUT: a single horizontal strip of SIX SQUARE cells in one row, edge to
edge, no gaps, no borders drawn between them. The finished image is exactly six
times as wide as it is tall. Each cell contains the SAME character as a portrait
bust - chest up, three-quarter view facing slightly LEFT, eyes toward camera.
Identical framing and identical scale in every cell: the head is the same size and
the eyes sit at the same height in all of them. The bottom edge cuts across the
upper chest; arms and hands are outside the frame. Leave a little clear space
above the hair. The ONLY difference between cells is the facial expression.
BUST ONLY: nothing below the upper chest - no legs, no boots, no full bodies, even
if the attached images show full figures.
BACKGROUND: flat neutral mid-grey (about #808080), the same grey behind the figure
in every cell. No scenery, no props, no vignette, no gradient, no shadow cast on the
background.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is the cast line-up of this game. Copy its RENDERING ONLY: line weight,
dithered shading, palette. This man is NOT any of the eight people in it and must
not resemble any of them.

IMAGE 2 is STRIP A of THIS SAME MAN, already finished - a reference only. He must be
the same person: same face, same head shape, same hairline, same clothing, same
colours, same grey background, same framing, the head as big in the cell as it is
there. Only the expressions change.

INTENT: the old hand of another squadron. Has flown everything, trusts nobody's
enthusiasm, looks after the young ones without saying so.

CHARACTER, identical in every cell:
Argentine air force pilot, about 45. Stocky, square face, heavy jaw, receding
hairline with short dark-grey hair, a THICK DARK MOUSTACHE, heavy straight eyebrows,
ruddy weathered criollo skin. Olive flight suit, collar open.

EXPRESSIONS, left to right - STRIP B, the strong ones. Each one as THIS character
would do it, never as a generic face:
CELL 1 - LAUGHING: a real laugh, mouth wide open, eyes squeezed almost shut, head
  tipped slightly back.
CELL 2 - AFRAID: eyes wide with white showing, eyebrows up and pulled together,
  mouth open and tense.
CELL 3 - SHOUTING IN ANGER: eyebrows hard down, mouth wide open in a shout, teeth
  showing, head pushed forward.
CELL 4 - CRYING: eyebrows high and pinched in the middle, eyes squeezed, mouth turned
  down and trembling, one or two simple pixel tear lines on the cheek.
CELL 5 - RELIEVED: eyes closed, eyebrows relaxed upward, a long breath out, a small
  tired smile, head tilted a little back.
CELL 6 - DETERMINED: eyebrows low and level, eyes narrowed and fixed ahead, jaw set,
  mouth a firm line, head slightly forward.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `piloto_veterano_risa piloto_veterano_miedo piloto_veterano_grito piloto_veterano_llanto piloto_veterano_alivio piloto_veterano_decidido`

---

## PILOTO 2 — EL PIBE

### Tira A

**Adjuntar (chat nuevo):** `final/team.png` *(IMAGE 1 — **solo** por el trazo)*

```
Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SHEET LAYOUT: a single horizontal strip of SIX SQUARE cells in one row, edge to
edge, no gaps, no borders drawn between them. The finished image is exactly six
times as wide as it is tall. Each cell contains the SAME character as a portrait
bust - chest up, three-quarter view facing slightly LEFT, eyes toward camera.
Identical framing and identical scale in every cell: the head is the same size and
the eyes sit at the same height in all of them. The bottom edge cuts across the
upper chest; arms and hands are outside the frame. Leave a little clear space
above the hair. The ONLY difference between cells is the facial expression.
BUST ONLY: nothing below the upper chest - no legs, no boots, no full bodies, even
if the attached images show full figures.
BACKGROUND: flat neutral mid-grey (about #808080), the same grey behind the figure
in every cell. No scenery, no props, no vignette, no gradient, no shadow cast on the
background.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is the cast line-up of this game. Copy its RENDERING ONLY: line weight,
dithered shading, palette. This man is NOT any of the eight people in it and must
not resemble any of them.

INTENT: the youngest pilot on the line. Excited, scared, trying to hide both.

CHARACTER, identical in every cell:
Argentine air force pilot, about 22. Skinny, long thin face, LARGE STICKING-OUT
EARS, a black cowlick standing up at the crown, wide eyes, thin neck. Light-brown
criollo skin. Olive flight suit slightly too big for him, collar open.

EXPRESSIONS, left to right - STRIP A, the base set:
CELL 1 - NEUTRAL: level eyebrows, mouth closed and relaxed.
CELL 2 - SMILE: the smile that is his, as warm as it gets.
CELL 3 - WORRIED: inner ends of the eyebrows up, mouth a tight line.
CELL 4 - ANGER: eyebrows hard down, eyes narrowed, mouth flat or bared.
CELL 5 - BROKEN: eyebrows high and collapsed in the middle, mouth slack, eyes
  unfocused. He has just been told something.
CELL 6 - HELMETED: the neutral face of cell 1 in a white flight helmet a little too big,
  visor up, oxygen mask hanging. Eyes and eyebrows visible.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `piloto_pibe_neutro piloto_pibe_sonrisa piloto_pibe_preocupado piloto_pibe_ceno piloto_pibe_roto piloto_pibe_casco`

### Tira B

**Adjuntar (chat nuevo), en este orden:** `final/team.png` *(IMAGE 1)* · la **Tira A** de este personaje que haya salido bien *(IMAGE 2)*.

```
DRAW A NEW IMAGE FROM SCRATCH. Do NOT return IMAGE 2, do NOT edit it, do NOT repeat
any of its faces. Every cell of the new strip shows one of the NEW expressions
listed below.

Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SHEET LAYOUT: a single horizontal strip of SIX SQUARE cells in one row, edge to
edge, no gaps, no borders drawn between them. The finished image is exactly six
times as wide as it is tall. Each cell contains the SAME character as a portrait
bust - chest up, three-quarter view facing slightly LEFT, eyes toward camera.
Identical framing and identical scale in every cell: the head is the same size and
the eyes sit at the same height in all of them. The bottom edge cuts across the
upper chest; arms and hands are outside the frame. Leave a little clear space
above the hair. The ONLY difference between cells is the facial expression.
BUST ONLY: nothing below the upper chest - no legs, no boots, no full bodies, even
if the attached images show full figures.
BACKGROUND: flat neutral mid-grey (about #808080), the same grey behind the figure
in every cell. No scenery, no props, no vignette, no gradient, no shadow cast on the
background.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is the cast line-up of this game. Copy its RENDERING ONLY: line weight,
dithered shading, palette. This man is NOT any of the eight people in it and must
not resemble any of them.

IMAGE 2 is STRIP A of THIS SAME MAN, already finished - a reference only. He must be
the same person: same face, same head shape, same hairline, same clothing, same
colours, same grey background, same framing, the head as big in the cell as it is
there. Only the expressions change.

INTENT: the youngest pilot on the line. Excited, scared, trying to hide both.

CHARACTER, identical in every cell:
Argentine air force pilot, about 22. Skinny, long thin face, LARGE STICKING-OUT
EARS, a black cowlick standing up at the crown, wide eyes, thin neck. Light-brown
criollo skin. Olive flight suit slightly too big for him, collar open.

EXPRESSIONS, left to right - STRIP B, the strong ones. Each one as THIS character
would do it, never as a generic face:
CELL 1 - LAUGHING: a real laugh, mouth wide open, eyes squeezed almost shut, head
  tipped slightly back.
CELL 2 - AFRAID: eyes wide with white showing, eyebrows up and pulled together,
  mouth open and tense.
CELL 3 - SHOUTING IN ANGER: eyebrows hard down, mouth wide open in a shout, teeth
  showing, head pushed forward.
CELL 4 - CRYING: eyebrows high and pinched in the middle, eyes squeezed, mouth turned
  down and trembling, one or two simple pixel tear lines on the cheek.
CELL 5 - RELIEVED: eyes closed, eyebrows relaxed upward, a long breath out, a small
  tired smile, head tilted a little back.
CELL 6 - DETERMINED: eyebrows low and level, eyes narrowed and fixed ahead, jaw set,
  mouth a firm line, head slightly forward.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `piloto_pibe_risa piloto_pibe_miedo piloto_pibe_grito piloto_pibe_llanto piloto_pibe_alivio piloto_pibe_decidido`

---

## PILOTO 3 — EL NORTEÑO

### Tira A

**Adjuntar (chat nuevo):** `final/team.png` *(IMAGE 1 — **solo** por el trazo)*

```
Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SHEET LAYOUT: a single horizontal strip of SIX SQUARE cells in one row, edge to
edge, no gaps, no borders drawn between them. The finished image is exactly six
times as wide as it is tall. Each cell contains the SAME character as a portrait
bust - chest up, three-quarter view facing slightly LEFT, eyes toward camera.
Identical framing and identical scale in every cell: the head is the same size and
the eyes sit at the same height in all of them. The bottom edge cuts across the
upper chest; arms and hands are outside the frame. Leave a little clear space
above the hair. The ONLY difference between cells is the facial expression.
BUST ONLY: nothing below the upper chest - no legs, no boots, no full bodies, even
if the attached images show full figures.
BACKGROUND: flat neutral mid-grey (about #808080), the same grey behind the figure
in every cell. No scenery, no props, no vignette, no gradient, no shadow cast on the
background.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is the cast line-up of this game. Copy its RENDERING ONLY: line weight,
dithered shading, palette. This man is NOT any of the eight people in it and must
not resemble any of them.

INTENT: from the far north of Argentina. Quiet, patient, unshakeable; speaks little
and means all of it.

CHARACTER, identical in every cell:
Argentine air force pilot, about 30, from Salta or Jujuy. ANDEAN features: a wide
round face, high flat cheekbones, narrow dark eyes, straight jet-black hair cut
short, warm brown skin. Calm mouth. Olive flight suit, collar open.

EXPRESSIONS, left to right - STRIP A, the base set:
CELL 1 - NEUTRAL: level eyebrows, mouth closed and relaxed.
CELL 2 - SMILE: the smile that is his, as warm as it gets.
CELL 3 - WORRIED: inner ends of the eyebrows up, mouth a tight line.
CELL 4 - ANGER: eyebrows hard down, eyes narrowed, mouth flat or bared.
CELL 5 - BROKEN: eyebrows high and collapsed in the middle, mouth slack, eyes
  unfocused. He has just been told something.
CELL 6 - HELMETED: the neutral face of cell 1 in a white flight helmet, visor up, oxygen
  mask hanging. Eyes and eyebrows visible.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `piloto_norteno_neutro piloto_norteno_sonrisa piloto_norteno_preocupado piloto_norteno_ceno piloto_norteno_roto piloto_norteno_casco`

### Tira B

**Adjuntar (chat nuevo), en este orden:** `final/team.png` *(IMAGE 1)* · la **Tira A** de este personaje que haya salido bien *(IMAGE 2)*.

```
DRAW A NEW IMAGE FROM SCRATCH. Do NOT return IMAGE 2, do NOT edit it, do NOT repeat
any of its faces. Every cell of the new strip shows one of the NEW expressions
listed below.

Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SHEET LAYOUT: a single horizontal strip of SIX SQUARE cells in one row, edge to
edge, no gaps, no borders drawn between them. The finished image is exactly six
times as wide as it is tall. Each cell contains the SAME character as a portrait
bust - chest up, three-quarter view facing slightly LEFT, eyes toward camera.
Identical framing and identical scale in every cell: the head is the same size and
the eyes sit at the same height in all of them. The bottom edge cuts across the
upper chest; arms and hands are outside the frame. Leave a little clear space
above the hair. The ONLY difference between cells is the facial expression.
BUST ONLY: nothing below the upper chest - no legs, no boots, no full bodies, even
if the attached images show full figures.
BACKGROUND: flat neutral mid-grey (about #808080), the same grey behind the figure
in every cell. No scenery, no props, no vignette, no gradient, no shadow cast on the
background.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is the cast line-up of this game. Copy its RENDERING ONLY: line weight,
dithered shading, palette. This man is NOT any of the eight people in it and must
not resemble any of them.

IMAGE 2 is STRIP A of THIS SAME MAN, already finished - a reference only. He must be
the same person: same face, same head shape, same hairline, same clothing, same
colours, same grey background, same framing, the head as big in the cell as it is
there. Only the expressions change.

INTENT: from the far north of Argentina. Quiet, patient, unshakeable; speaks little
and means all of it.

CHARACTER, identical in every cell:
Argentine air force pilot, about 30, from Salta or Jujuy. ANDEAN features: a wide
round face, high flat cheekbones, narrow dark eyes, straight jet-black hair cut
short, warm brown skin. Calm mouth. Olive flight suit, collar open.

EXPRESSIONS, left to right - STRIP B, the strong ones. Each one as THIS character
would do it, never as a generic face:
CELL 1 - LAUGHING: a real laugh, mouth wide open, eyes squeezed almost shut, head
  tipped slightly back.
CELL 2 - AFRAID: eyes wide with white showing, eyebrows up and pulled together,
  mouth open and tense.
CELL 3 - SHOUTING IN ANGER: eyebrows hard down, mouth wide open in a shout, teeth
  showing, head pushed forward.
CELL 4 - CRYING: eyebrows high and pinched in the middle, eyes squeezed, mouth turned
  down and trembling, one or two simple pixel tear lines on the cheek.
CELL 5 - RELIEVED: eyes closed, eyebrows relaxed upward, a long breath out, a small
  tired smile, head tilted a little back.
CELL 6 - DETERMINED: eyebrows low and level, eyes narrowed and fixed ahead, jaw set,
  mouth a firm line, head slightly forward.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `piloto_norteno_risa piloto_norteno_miedo piloto_norteno_grito piloto_norteno_llanto piloto_norteno_alivio piloto_norteno_decidido`

---

## PILOTO 4 — EL TANO

### Tira A

**Adjuntar (chat nuevo):** `final/team.png` *(IMAGE 1 — **solo** por el trazo)*

```
Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SHEET LAYOUT: a single horizontal strip of SIX SQUARE cells in one row, edge to
edge, no gaps, no borders drawn between them. The finished image is exactly six
times as wide as it is tall. Each cell contains the SAME character as a portrait
bust - chest up, three-quarter view facing slightly LEFT, eyes toward camera.
Identical framing and identical scale in every cell: the head is the same size and
the eyes sit at the same height in all of them. The bottom edge cuts across the
upper chest; arms and hands are outside the frame. Leave a little clear space
above the hair. The ONLY difference between cells is the facial expression.
BUST ONLY: nothing below the upper chest - no legs, no boots, no full bodies, even
if the attached images show full figures.
BACKGROUND: flat neutral mid-grey (about #808080), the same grey behind the figure
in every cell. No scenery, no props, no vignette, no gradient, no shadow cast on the
background.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is the cast line-up of this game. Copy its RENDERING ONLY: line weight,
dithered shading, palette. This man is NOT any of the eight people in it and must
not resemble any of them.

INTENT: Buenos Aires son of Italian immigrants. Loud, expressive, talks with his whole
face.

CHARACTER, identical in every cell:
Argentine air force pilot, about 35. CURLY dark-brown hair cut short on the sides,
a LARGE HOOKED NOSE, very thick black eyebrows, a heavy five-o'clock shadow, olive
Mediterranean skin, a wide mobile mouth. Olive flight suit, collar open.

EXPRESSIONS, left to right - STRIP A, the base set:
CELL 1 - NEUTRAL: level eyebrows, mouth closed and relaxed.
CELL 2 - SMILE: the smile that is his, as warm as it gets.
CELL 3 - WORRIED: inner ends of the eyebrows up, mouth a tight line.
CELL 4 - ANGER: eyebrows hard down, eyes narrowed, mouth flat or bared.
CELL 5 - BROKEN: eyebrows high and collapsed in the middle, mouth slack, eyes
  unfocused. He has just been told something.
CELL 6 - HELMETED: the neutral face of cell 1 in a white flight helmet, visor up, oxygen
  mask hanging. Eyes and eyebrows visible.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `piloto_tano_neutro piloto_tano_sonrisa piloto_tano_preocupado piloto_tano_ceno piloto_tano_roto piloto_tano_casco`

### Tira B

**Adjuntar (chat nuevo), en este orden:** `final/team.png` *(IMAGE 1)* · la **Tira A** de este personaje que haya salido bien *(IMAGE 2)*.

```
DRAW A NEW IMAGE FROM SCRATCH. Do NOT return IMAGE 2, do NOT edit it, do NOT repeat
any of its faces. Every cell of the new strip shows one of the NEW expressions
listed below.

Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SHEET LAYOUT: a single horizontal strip of SIX SQUARE cells in one row, edge to
edge, no gaps, no borders drawn between them. The finished image is exactly six
times as wide as it is tall. Each cell contains the SAME character as a portrait
bust - chest up, three-quarter view facing slightly LEFT, eyes toward camera.
Identical framing and identical scale in every cell: the head is the same size and
the eyes sit at the same height in all of them. The bottom edge cuts across the
upper chest; arms and hands are outside the frame. Leave a little clear space
above the hair. The ONLY difference between cells is the facial expression.
BUST ONLY: nothing below the upper chest - no legs, no boots, no full bodies, even
if the attached images show full figures.
BACKGROUND: flat neutral mid-grey (about #808080), the same grey behind the figure
in every cell. No scenery, no props, no vignette, no gradient, no shadow cast on the
background.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is the cast line-up of this game. Copy its RENDERING ONLY: line weight,
dithered shading, palette. This man is NOT any of the eight people in it and must
not resemble any of them.

IMAGE 2 is STRIP A of THIS SAME MAN, already finished - a reference only. He must be
the same person: same face, same head shape, same hairline, same clothing, same
colours, same grey background, same framing, the head as big in the cell as it is
there. Only the expressions change.

INTENT: Buenos Aires son of Italian immigrants. Loud, expressive, talks with his whole
face.

CHARACTER, identical in every cell:
Argentine air force pilot, about 35. CURLY dark-brown hair cut short on the sides,
a LARGE HOOKED NOSE, very thick black eyebrows, a heavy five-o'clock shadow, olive
Mediterranean skin, a wide mobile mouth. Olive flight suit, collar open.

EXPRESSIONS, left to right - STRIP B, the strong ones. Each one as THIS character
would do it, never as a generic face:
CELL 1 - LAUGHING: a real laugh, mouth wide open, eyes squeezed almost shut, head
  tipped slightly back.
CELL 2 - AFRAID: eyes wide with white showing, eyebrows up and pulled together,
  mouth open and tense.
CELL 3 - SHOUTING IN ANGER: eyebrows hard down, mouth wide open in a shout, teeth
  showing, head pushed forward.
CELL 4 - CRYING: eyebrows high and pinched in the middle, eyes squeezed, mouth turned
  down and trembling, one or two simple pixel tear lines on the cheek.
CELL 5 - RELIEVED: eyes closed, eyebrows relaxed upward, a long breath out, a small
  tired smile, head tilted a little back.
CELL 6 - DETERMINED: eyebrows low and level, eyes narrowed and fixed ahead, jaw set,
  mouth a firm line, head slightly forward.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `piloto_tano_risa piloto_tano_miedo piloto_tano_grito piloto_tano_llanto piloto_tano_alivio piloto_tano_decidido`

---

## PILOTO 5 — EL GRINGO

### Tira A

**Adjuntar (chat nuevo):** `final/team.png` *(IMAGE 1 — **solo** por el trazo)*

```
Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SHEET LAYOUT: a single horizontal strip of SIX SQUARE cells in one row, edge to
edge, no gaps, no borders drawn between them. The finished image is exactly six
times as wide as it is tall. Each cell contains the SAME character as a portrait
bust - chest up, three-quarter view facing slightly LEFT, eyes toward camera.
Identical framing and identical scale in every cell: the head is the same size and
the eyes sit at the same height in all of them. The bottom edge cuts across the
upper chest; arms and hands are outside the frame. Leave a little clear space
above the hair. The ONLY difference between cells is the facial expression.
BUST ONLY: nothing below the upper chest - no legs, no boots, no full bodies, even
if the attached images show full figures.
BACKGROUND: flat neutral mid-grey (about #808080), the same grey behind the figure
in every cell. No scenery, no props, no vignette, no gradient, no shadow cast on the
background.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is the cast line-up of this game. Copy its RENDERING ONLY: line weight,
dithered shading, palette. This man is NOT any of the eight people in it and must
not resemble any of them.

INTENT: from the German-descended farming colonies of Entre Ríos. Reserved, exact,
polite, slow to smile.

CHARACTER, identical in every cell:
Argentine air force pilot, about 28. Fair skin that reddens in the cold, short
SANDY-BLOND hair parted neatly at the side, light eyebrows, a long straight jaw, a
narrow straight nose, a long neck. Olive flight suit, collar buttoned to the top.

EXPRESSIONS, left to right - STRIP A, the base set:
CELL 1 - NEUTRAL: level eyebrows, mouth closed and relaxed.
CELL 2 - SMILE: the smile that is his, as warm as it gets.
CELL 3 - WORRIED: inner ends of the eyebrows up, mouth a tight line.
CELL 4 - ANGER: eyebrows hard down, eyes narrowed, mouth flat or bared.
CELL 5 - BROKEN: eyebrows high and collapsed in the middle, mouth slack, eyes
  unfocused. He has just been told something.
CELL 6 - HELMETED: the neutral face of cell 1 in a white flight helmet, visor up, oxygen
  mask hanging. Eyes and eyebrows visible.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `piloto_gringo_neutro piloto_gringo_sonrisa piloto_gringo_preocupado piloto_gringo_ceno piloto_gringo_roto piloto_gringo_casco`

### Tira B

**Adjuntar (chat nuevo), en este orden:** `final/team.png` *(IMAGE 1)* · la **Tira A** de este personaje que haya salido bien *(IMAGE 2)*.

```
DRAW A NEW IMAGE FROM SCRATCH. Do NOT return IMAGE 2, do NOT edit it, do NOT repeat
any of its faces. Every cell of the new strip shows one of the NEW expressions
listed below.

Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SHEET LAYOUT: a single horizontal strip of SIX SQUARE cells in one row, edge to
edge, no gaps, no borders drawn between them. The finished image is exactly six
times as wide as it is tall. Each cell contains the SAME character as a portrait
bust - chest up, three-quarter view facing slightly LEFT, eyes toward camera.
Identical framing and identical scale in every cell: the head is the same size and
the eyes sit at the same height in all of them. The bottom edge cuts across the
upper chest; arms and hands are outside the frame. Leave a little clear space
above the hair. The ONLY difference between cells is the facial expression.
BUST ONLY: nothing below the upper chest - no legs, no boots, no full bodies, even
if the attached images show full figures.
BACKGROUND: flat neutral mid-grey (about #808080), the same grey behind the figure
in every cell. No scenery, no props, no vignette, no gradient, no shadow cast on the
background.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is the cast line-up of this game. Copy its RENDERING ONLY: line weight,
dithered shading, palette. This man is NOT any of the eight people in it and must
not resemble any of them.

IMAGE 2 is STRIP A of THIS SAME MAN, already finished - a reference only. He must be
the same person: same face, same head shape, same hairline, same clothing, same
colours, same grey background, same framing, the head as big in the cell as it is
there. Only the expressions change.

INTENT: from the German-descended farming colonies of Entre Ríos. Reserved, exact,
polite, slow to smile.

CHARACTER, identical in every cell:
Argentine air force pilot, about 28. Fair skin that reddens in the cold, short
SANDY-BLOND hair parted neatly at the side, light eyebrows, a long straight jaw, a
narrow straight nose, a long neck. Olive flight suit, collar buttoned to the top.

EXPRESSIONS, left to right - STRIP B, the strong ones. Each one as THIS character
would do it, never as a generic face:
CELL 1 - LAUGHING: a real laugh, mouth wide open, eyes squeezed almost shut, head
  tipped slightly back.
CELL 2 - AFRAID: eyes wide with white showing, eyebrows up and pulled together,
  mouth open and tense.
CELL 3 - SHOUTING IN ANGER: eyebrows hard down, mouth wide open in a shout, teeth
  showing, head pushed forward.
CELL 4 - CRYING: eyebrows high and pinched in the middle, eyes squeezed, mouth turned
  down and trembling, one or two simple pixel tear lines on the cheek.
CELL 5 - RELIEVED: eyes closed, eyebrows relaxed upward, a long breath out, a small
  tired smile, head tilted a little back.
CELL 6 - DETERMINED: eyebrows low and level, eyes narrowed and fixed ahead, jaw set,
  mouth a firm line, head slightly forward.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `piloto_gringo_risa piloto_gringo_miedo piloto_gringo_grito piloto_gringo_llanto piloto_gringo_alivio piloto_gringo_decidido`

---

## PILOTO 6 — EL PELADO

### Tira A

**Adjuntar (chat nuevo):** `final/team.png` *(IMAGE 1 — **solo** por el trazo)*

```
Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SHEET LAYOUT: a single horizontal strip of SIX SQUARE cells in one row, edge to
edge, no gaps, no borders drawn between them. The finished image is exactly six
times as wide as it is tall. Each cell contains the SAME character as a portrait
bust - chest up, three-quarter view facing slightly LEFT, eyes toward camera.
Identical framing and identical scale in every cell: the head is the same size and
the eyes sit at the same height in all of them. The bottom edge cuts across the
upper chest; arms and hands are outside the frame. Leave a little clear space
above the hair. The ONLY difference between cells is the facial expression.
BUST ONLY: nothing below the upper chest - no legs, no boots, no full bodies, even
if the attached images show full figures.
BACKGROUND: flat neutral mid-grey (about #808080), the same grey behind the figure
in every cell. No scenery, no props, no vignette, no gradient, no shadow cast on the
background.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is the cast line-up of this game. Copy its RENDERING ONLY: line weight,
dithered shading, palette. This man is NOT any of the eight people in it and must
not resemble any of them.

INTENT: the tough one of another squadron. Looks like a boxer, is the gentlest man on
the base, and nobody believes it until they see him laugh.

CHARACTER, identical in every cell:
Argentine air force pilot, about 38. COMPLETELY SHAVED HEAD, smooth and shiny. A
heavy brow ridge, a BROKEN, FLATTENED BOXER'S NOSE, a thick neck, a wide jaw, small
dark eyes. Tanned criollo skin. Clean-shaven. Olive flight suit, collar open.

EXPRESSIONS, left to right - STRIP A, the base set:
CELL 1 - NEUTRAL: level eyebrows, mouth closed and relaxed.
CELL 2 - SMILE: the smile that is his, as warm as it gets.
CELL 3 - WORRIED: inner ends of the eyebrows up, mouth a tight line.
CELL 4 - ANGER: eyebrows hard down, eyes narrowed, mouth flat or bared.
CELL 5 - BROKEN: eyebrows high and collapsed in the middle, mouth slack, eyes
  unfocused. He has just been told something.
CELL 6 - HELMETED: the neutral face of cell 1 in a white flight helmet, visor up, oxygen
  mask hanging. Eyes and eyebrows visible.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `piloto_pelado_neutro piloto_pelado_sonrisa piloto_pelado_preocupado piloto_pelado_ceno piloto_pelado_roto piloto_pelado_casco`

### Tira B

**Adjuntar (chat nuevo), en este orden:** `final/team.png` *(IMAGE 1)* · la **Tira A** de este personaje que haya salido bien *(IMAGE 2)*.

```
DRAW A NEW IMAGE FROM SCRATCH. Do NOT return IMAGE 2, do NOT edit it, do NOT repeat
any of its faces. Every cell of the new strip shows one of the NEW expressions
listed below.

Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SHEET LAYOUT: a single horizontal strip of SIX SQUARE cells in one row, edge to
edge, no gaps, no borders drawn between them. The finished image is exactly six
times as wide as it is tall. Each cell contains the SAME character as a portrait
bust - chest up, three-quarter view facing slightly LEFT, eyes toward camera.
Identical framing and identical scale in every cell: the head is the same size and
the eyes sit at the same height in all of them. The bottom edge cuts across the
upper chest; arms and hands are outside the frame. Leave a little clear space
above the hair. The ONLY difference between cells is the facial expression.
BUST ONLY: nothing below the upper chest - no legs, no boots, no full bodies, even
if the attached images show full figures.
BACKGROUND: flat neutral mid-grey (about #808080), the same grey behind the figure
in every cell. No scenery, no props, no vignette, no gradient, no shadow cast on the
background.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is the cast line-up of this game. Copy its RENDERING ONLY: line weight,
dithered shading, palette. This man is NOT any of the eight people in it and must
not resemble any of them.

IMAGE 2 is STRIP A of THIS SAME MAN, already finished - a reference only. He must be
the same person: same face, same head shape, same hairline, same clothing, same
colours, same grey background, same framing, the head as big in the cell as it is
there. Only the expressions change.

INTENT: the tough one of another squadron. Looks like a boxer, is the gentlest man on
the base, and nobody believes it until they see him laugh.

CHARACTER, identical in every cell:
Argentine air force pilot, about 38. COMPLETELY SHAVED HEAD, smooth and shiny. A
heavy brow ridge, a BROKEN, FLATTENED BOXER'S NOSE, a thick neck, a wide jaw, small
dark eyes. Tanned criollo skin. Clean-shaven. Olive flight suit, collar open.

EXPRESSIONS, left to right - STRIP B, the strong ones. Each one as THIS character
would do it, never as a generic face:
CELL 1 - LAUGHING: a real laugh, mouth wide open, eyes squeezed almost shut, head
  tipped slightly back.
CELL 2 - AFRAID: eyes wide with white showing, eyebrows up and pulled together,
  mouth open and tense.
CELL 3 - SHOUTING IN ANGER: eyebrows hard down, mouth wide open in a shout, teeth
  showing, head pushed forward.
CELL 4 - CRYING: eyebrows high and pinched in the middle, eyes squeezed, mouth turned
  down and trembling, one or two simple pixel tear lines on the cheek.
CELL 5 - RELIEVED: eyes closed, eyebrows relaxed upward, a long breath out, a small
  tired smile, head tilted a little back.
CELL 6 - DETERMINED: eyebrows low and level, eyes narrowed and fixed ahead, jaw set,
  mouth a firm line, head slightly forward.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `piloto_pelado_risa piloto_pelado_miedo piloto_pelado_grito piloto_pelado_llanto piloto_pelado_alivio piloto_pelado_decidido`

---

## PILOTO 7 — EL FLACO

### Tira A

**Adjuntar (chat nuevo):** `final/team.png` *(IMAGE 1 — **solo** por el trazo)*

```
Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SHEET LAYOUT: a single horizontal strip of SIX SQUARE cells in one row, edge to
edge, no gaps, no borders drawn between them. The finished image is exactly six
times as wide as it is tall. Each cell contains the SAME character as a portrait
bust - chest up, three-quarter view facing slightly LEFT, eyes toward camera.
Identical framing and identical scale in every cell: the head is the same size and
the eyes sit at the same height in all of them. The bottom edge cuts across the
upper chest; arms and hands are outside the frame. Leave a little clear space
above the hair. The ONLY difference between cells is the facial expression.
BUST ONLY: nothing below the upper chest - no legs, no boots, no full bodies, even
if the attached images show full figures.
BACKGROUND: flat neutral mid-grey (about #808080), the same grey behind the figure
in every cell. No scenery, no props, no vignette, no gradient, no shadow cast on the
background.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is the cast line-up of this game. Copy its RENDERING ONLY: line weight,
dithered shading, palette. This man is NOT any of the eight people in it and must
not resemble any of them.

INTENT: the tall thin one, a bit old-fashioned, very correct. Says little, notices
everything.

CHARACTER, identical in every cell:
Argentine air force pilot, about 33, very tall and thin. A LONG NARROW FACE, a
prominent Adam's apple, WAVY CHESTNUT HAIR COMBED STRAIGHT BACK with brilliantine, a
THIN PENCIL MOUSTACHE, narrow eyes, light-olive skin. Olive flight suit, collar open.

EXPRESSIONS, left to right - STRIP A, the base set:
CELL 1 - NEUTRAL: level eyebrows, mouth closed and relaxed.
CELL 2 - SMILE: the smile that is his, as warm as it gets.
CELL 3 - WORRIED: inner ends of the eyebrows up, mouth a tight line.
CELL 4 - ANGER: eyebrows hard down, eyes narrowed, mouth flat or bared.
CELL 5 - BROKEN: eyebrows high and collapsed in the middle, mouth slack, eyes
  unfocused. He has just been told something.
CELL 6 - HELMETED: the neutral face of cell 1 in a white flight helmet, visor up, oxygen
  mask hanging. Eyes and eyebrows visible.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `piloto_flaco_neutro piloto_flaco_sonrisa piloto_flaco_preocupado piloto_flaco_ceno piloto_flaco_roto piloto_flaco_casco`

### Tira B

**Adjuntar (chat nuevo), en este orden:** `final/team.png` *(IMAGE 1)* · la **Tira A** de este personaje que haya salido bien *(IMAGE 2)*.

```
DRAW A NEW IMAGE FROM SCRATCH. Do NOT return IMAGE 2, do NOT edit it, do NOT repeat
any of its faces. Every cell of the new strip shows one of the NEW expressions
listed below.

Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SHEET LAYOUT: a single horizontal strip of SIX SQUARE cells in one row, edge to
edge, no gaps, no borders drawn between them. The finished image is exactly six
times as wide as it is tall. Each cell contains the SAME character as a portrait
bust - chest up, three-quarter view facing slightly LEFT, eyes toward camera.
Identical framing and identical scale in every cell: the head is the same size and
the eyes sit at the same height in all of them. The bottom edge cuts across the
upper chest; arms and hands are outside the frame. Leave a little clear space
above the hair. The ONLY difference between cells is the facial expression.
BUST ONLY: nothing below the upper chest - no legs, no boots, no full bodies, even
if the attached images show full figures.
BACKGROUND: flat neutral mid-grey (about #808080), the same grey behind the figure
in every cell. No scenery, no props, no vignette, no gradient, no shadow cast on the
background.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is the cast line-up of this game. Copy its RENDERING ONLY: line weight,
dithered shading, palette. This man is NOT any of the eight people in it and must
not resemble any of them.

IMAGE 2 is STRIP A of THIS SAME MAN, already finished - a reference only. He must be
the same person: same face, same head shape, same hairline, same clothing, same
colours, same grey background, same framing, the head as big in the cell as it is
there. Only the expressions change.

INTENT: the tall thin one, a bit old-fashioned, very correct. Says little, notices
everything.

CHARACTER, identical in every cell:
Argentine air force pilot, about 33, very tall and thin. A LONG NARROW FACE, a
prominent Adam's apple, WAVY CHESTNUT HAIR COMBED STRAIGHT BACK with brilliantine, a
THIN PENCIL MOUSTACHE, narrow eyes, light-olive skin. Olive flight suit, collar open.

EXPRESSIONS, left to right - STRIP B, the strong ones. Each one as THIS character
would do it, never as a generic face:
CELL 1 - LAUGHING: a real laugh, mouth wide open, eyes squeezed almost shut, head
  tipped slightly back.
CELL 2 - AFRAID: eyes wide with white showing, eyebrows up and pulled together,
  mouth open and tense.
CELL 3 - SHOUTING IN ANGER: eyebrows hard down, mouth wide open in a shout, teeth
  showing, head pushed forward.
CELL 4 - CRYING: eyebrows high and pinched in the middle, eyes squeezed, mouth turned
  down and trembling, one or two simple pixel tear lines on the cheek.
CELL 5 - RELIEVED: eyes closed, eyebrows relaxed upward, a long breath out, a small
  tired smile, head tilted a little back.
CELL 6 - DETERMINED: eyebrows low and level, eyes narrowed and fixed ahead, jaw set,
  mouth a firm line, head slightly forward.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `piloto_flaco_risa piloto_flaco_miedo piloto_flaco_grito piloto_flaco_llanto piloto_flaco_alivio piloto_flaco_decidido`

---

## PILOTO 8 — EL DE LOS ANTEOJOS

### Tira A

**Adjuntar (chat nuevo):** `final/team.png` *(IMAGE 1 — **solo** por el trazo)*

```
Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SHEET LAYOUT: a single horizontal strip of SIX SQUARE cells in one row, edge to
edge, no gaps, no borders drawn between them. The finished image is exactly six
times as wide as it is tall. Each cell contains the SAME character as a portrait
bust - chest up, three-quarter view facing slightly LEFT, eyes toward camera.
Identical framing and identical scale in every cell: the head is the same size and
the eyes sit at the same height in all of them. The bottom edge cuts across the
upper chest; arms and hands are outside the frame. Leave a little clear space
above the hair. The ONLY difference between cells is the facial expression.
BUST ONLY: nothing below the upper chest - no legs, no boots, no full bodies, even
if the attached images show full figures.
BACKGROUND: flat neutral mid-grey (about #808080), the same grey behind the figure
in every cell. No scenery, no props, no vignette, no gradient, no shadow cast on the
background.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is the cast line-up of this game. Copy its RENDERING ONLY: line weight,
dithered shading, palette. This man is NOT any of the eight people in it and must
not resemble any of them.

INTENT: the cheerful one, always with a joke and his sunglasses on his head. 1982
through and through.

CHARACTER, identical in every cell:
Argentine air force pilot, about 30. GOLD-FRAMED TEARDROP AVIATOR SUNGLASSES PUSHED UP
ON HIS FOREHEAD, over FEATHERED DARK-BROWN 1970s HAIR with LONG SIDEBURNS. A wide
mouth, an easy grin, a dimple in the chin, warm criollo skin. Olive flight suit,
collar open.

EXPRESSIONS, left to right - STRIP A, the base set:
CELL 1 - NEUTRAL: level eyebrows, mouth closed and relaxed.
CELL 2 - SMILE: the smile that is his, as warm as it gets.
CELL 3 - WORRIED: inner ends of the eyebrows up, mouth a tight line.
CELL 4 - ANGER: eyebrows hard down, eyes narrowed, mouth flat or bared.
CELL 5 - BROKEN: eyebrows high and collapsed in the middle, mouth slack, eyes
  unfocused. He has just been told something.
CELL 6 - HELMETED: the neutral face of cell 1 in a white flight helmet, visor up, oxygen
  mask hanging, the sunglasses gone. Eyes and eyebrows visible.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `piloto_anteojos_neutro piloto_anteojos_sonrisa piloto_anteojos_preocupado piloto_anteojos_ceno piloto_anteojos_roto piloto_anteojos_casco`

### Tira B

**Adjuntar (chat nuevo), en este orden:** `final/team.png` *(IMAGE 1)* · la **Tira A** de este personaje que haya salido bien *(IMAGE 2)*.

```
DRAW A NEW IMAGE FROM SCRATCH. Do NOT return IMAGE 2, do NOT edit it, do NOT repeat
any of its faces. Every cell of the new strip shows one of the NEW expressions
listed below.

Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SHEET LAYOUT: a single horizontal strip of SIX SQUARE cells in one row, edge to
edge, no gaps, no borders drawn between them. The finished image is exactly six
times as wide as it is tall. Each cell contains the SAME character as a portrait
bust - chest up, three-quarter view facing slightly LEFT, eyes toward camera.
Identical framing and identical scale in every cell: the head is the same size and
the eyes sit at the same height in all of them. The bottom edge cuts across the
upper chest; arms and hands are outside the frame. Leave a little clear space
above the hair. The ONLY difference between cells is the facial expression.
BUST ONLY: nothing below the upper chest - no legs, no boots, no full bodies, even
if the attached images show full figures.
BACKGROUND: flat neutral mid-grey (about #808080), the same grey behind the figure
in every cell. No scenery, no props, no vignette, no gradient, no shadow cast on the
background.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is the cast line-up of this game. Copy its RENDERING ONLY: line weight,
dithered shading, palette. This man is NOT any of the eight people in it and must
not resemble any of them.

IMAGE 2 is STRIP A of THIS SAME MAN, already finished - a reference only. He must be
the same person: same face, same head shape, same hairline, same clothing, same
colours, same grey background, same framing, the head as big in the cell as it is
there. Only the expressions change.

INTENT: the cheerful one, always with a joke and his sunglasses on his head. 1982
through and through.

CHARACTER, identical in every cell:
Argentine air force pilot, about 30. GOLD-FRAMED TEARDROP AVIATOR SUNGLASSES PUSHED UP
ON HIS FOREHEAD, over FEATHERED DARK-BROWN 1970s HAIR with LONG SIDEBURNS. A wide
mouth, an easy grin, a dimple in the chin, warm criollo skin. Olive flight suit,
collar open.

EXPRESSIONS, left to right - STRIP B, the strong ones. Each one as THIS character
would do it, never as a generic face:
CELL 1 - LAUGHING: a real laugh, mouth wide open, eyes squeezed almost shut, head
  tipped slightly back.
CELL 2 - AFRAID: eyes wide with white showing, eyebrows up and pulled together,
  mouth open and tense.
CELL 3 - SHOUTING IN ANGER: eyebrows hard down, mouth wide open in a shout, teeth
  showing, head pushed forward.
CELL 4 - CRYING: eyebrows high and pinched in the middle, eyes squeezed, mouth turned
  down and trembling, one or two simple pixel tear lines on the cheek.
CELL 5 - RELIEVED: eyes closed, eyebrows relaxed upward, a long breath out, a small
  tired smile, head tilted a little back.
CELL 6 - DETERMINED: eyebrows low and level, eyes narrowed and fixed ahead, jaw set,
  mouth a firm line, head slightly forward.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `piloto_anteojos_risa piloto_anteojos_miedo piloto_anteojos_grito piloto_anteojos_llanto piloto_anteojos_alivio piloto_anteojos_decidido`

---

# LOS QUE YA EXISTEN — rearmadas

*La tira A es la misma de `PROMPTS_RETRATOS_LISTOS.md` (con su celda propia y su fondo gris). B y las hojas C, D y E son nuevas.*

---

## TERO · Esteban

### Tira A

**Adjuntar (chat nuevo):** `final/tero3.png` *(IMAGE 1)* · `final/team.png` *(IMAGE 2)*

```
Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SHEET LAYOUT: a single horizontal strip of SIX SQUARE cells in one row, edge to
edge, no gaps, no borders drawn between them. The finished image is exactly six
times as wide as it is tall. Each cell contains the SAME character as a portrait
bust - chest up, three-quarter view facing slightly LEFT, eyes toward camera.
Identical framing and identical scale in every cell: the head is the same size and
the eyes sit at the same height in all of them. The bottom edge cuts across the
upper chest; arms and hands are outside the frame. Leave a little clear space
above the hair. The ONLY difference between cells is the facial expression.
BUST ONLY: nothing below the upper chest - no legs, no boots, no full bodies, even
if the attached images show full figures.
BACKGROUND: flat neutral mid-grey (about #808080), the same grey behind the figure
in every cell. No scenery, no props, no vignette, no gradient, no shadow cast on the
background.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is this character's finished model sheet. Copy his clothing, his colouring
and his line work exactly, and match its rendering precisely: same line weight,
same shading, same flat mid-grey background.
IMAGE 2 is the full cast line-up. This character is the THIRD figure. Copy his
build and his face from there. The other seven are the rest of the cast and he must
stay clearly different from every one of them.

INTENT, and this matters more than any feature below: he is A GOOD MAN WHO IS SUFFERING. The kindness and the pain are visible at the same
time. Tired and sad, never hard, never threatening.

CHARACTER, identical in every cell:
Argentine air force pilot, late thirties. The most gaunt face of the cast: hollow
cheeks, high cheekbones, deep lines beside the mouth, dark shadows under the eyes.
MOROCHO - weathered olive-brown criollo skin, clearly darker than the pale pilot in
the line-up. Dark hair combed back with STRONG GREY AT THE TEMPLES. Straight dark
eyebrows, a fine straight nose, a thin mouth, a long thin neck. Olive flight suit
with a chest harness, collar open.

EXPRESSIONS, left to right:
CELL 1 - NEUTRAL: level eyebrows, mouth closed and relaxed. Tired but composed and watching.
CELL 2 - SMILE: one corner of the mouth up, eyebrows lifted a fraction. Almost nothing - it must read as rare on him.
CELL 3 - WORRIED: inner ends of the eyebrows pulled down, jaw set, mouth a thin line. He is hiding it and it shows anyway.
CELL 4 - ANGER: eyebrows hard down, eyes narrowed, mouth flat. Cold rather than loud.
CELL 5 - BROKEN: eyebrows high and collapsed in the middle, mouth open and slack, eyes unfocused. He has just been told something.
CELL 6 - HELMETED - the neutral face of cell 1, now wearing the white flight helmet
  with the green oxygen mask unclipped and hanging to one side. The helmet must not
  hide his eyes or eyebrows.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `tero_neutro tero_sonrisa tero_preocupado tero_ceno tero_roto tero_casco`

### Tira B

**Adjuntar (chat nuevo), en este orden:** `final/tero3.png` *(IMAGE 1)* · la **Tira A** de este personaje que haya salido bien *(IMAGE 2)*.

```
DRAW A NEW IMAGE FROM SCRATCH. Do NOT return IMAGE 2, do NOT edit it, do NOT repeat
any of its faces. Every cell of the new strip shows one of the NEW expressions
listed below.

Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SHEET LAYOUT: a single horizontal strip of SIX SQUARE cells in one row, edge to
edge, no gaps, no borders drawn between them. The finished image is exactly six
times as wide as it is tall. Each cell contains the SAME character as a portrait
bust - chest up, three-quarter view facing slightly LEFT, eyes toward camera.
Identical framing and identical scale in every cell: the head is the same size and
the eyes sit at the same height in all of them. The bottom edge cuts across the
upper chest; arms and hands are outside the frame. Leave a little clear space
above the hair. The ONLY difference between cells is the facial expression.
BUST ONLY: nothing below the upper chest - no legs, no boots, no full bodies, even
if the attached images show full figures.
BACKGROUND: flat neutral mid-grey (about #808080), the same grey behind the figure
in every cell. No scenery, no props, no vignette, no gradient, no shadow cast on the
background.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is this character's finished model sheet. Copy his clothing, his colouring
and his line work exactly, and match its rendering precisely: same line weight,
same shading, same flat mid-grey background.
IMAGE 2 is STRIP A of THIS SAME MAN, already finished - a reference only. He must be
the same person: same face, same head shape, same hairline, same clothing, same
colours, same grey background, same framing, the head as big in the cell as it is
there. Only the expressions change.

INTENT, and this matters more than any feature below: he is A GOOD MAN WHO IS SUFFERING. The kindness and the pain are visible at the same
time. Tired and sad, never hard, never threatening.

CHARACTER, identical in every cell:
Argentine air force pilot, late thirties. The most gaunt face of the cast: hollow
cheeks, high cheekbones, deep lines beside the mouth, dark shadows under the eyes.
MOROCHO - weathered olive-brown criollo skin, clearly darker than the pale pilot in
the line-up. Dark hair combed back with STRONG GREY AT THE TEMPLES. Straight dark
eyebrows, a fine straight nose, a thin mouth, a long thin neck. Olive flight suit
with a chest harness, collar open.

EXPRESSIONS, left to right - STRIP B, the strong ones. Each one as THIS character
would do it, never as a generic face:
CELL 1 - LAUGHING: a real laugh, mouth wide open, eyes squeezed almost shut, head
  tipped slightly back.
CELL 2 - AFRAID: eyes wide with white showing, eyebrows up and pulled together,
  mouth open and tense.
CELL 3 - SHOUTING IN ANGER: eyebrows hard down, mouth wide open in a shout, teeth
  showing, head pushed forward.
CELL 4 - CRYING: eyebrows high and pinched in the middle, eyes squeezed, mouth turned
  down and trembling, one or two simple pixel tear lines on the cheek.
CELL 5 - RELIEVED: eyes closed, eyebrows relaxed upward, a long breath out, a small
  tired smile, head tilted a little back.
CELL 6 - DETERMINED: eyebrows low and level, eyes narrowed and fixed ahead, jaw set,
  mouth a firm line, head slightly forward.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `tero_risa tero_miedo tero_grito tero_llanto tero_alivio tero_decidido`

### Hoja C — las grandes (grilla 5×2)

**Adjuntar (chat nuevo), en este orden:** `final/tero3.png` *(IMAGE 1)* · la **Tira A** de este personaje que haya salido bien *(IMAGE 2)*.

```
DRAW A NEW IMAGE FROM SCRATCH. Do NOT return IMAGE 2, do NOT edit it, do NOT repeat
any of its faces. Every cell of the new sheet shows one of the NEW expressions
listed below.

Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SHEET LAYOUT: a GRID of TEN SQUARE cells, FIVE columns and TWO rows - exactly two
rows, not three - edge to edge, no gaps, no borders drawn between them. The finished
image is two and a half times as wide as it is tall. Each cell contains the SAME
character as a portrait bust - chest up, three-quarter view facing slightly LEFT,
eyes toward camera. Identical framing and identical scale in every cell: the head is
the same size and the eyes sit at the same height in all of them. The bottom edge
cuts across the upper chest; arms and hands are outside the frame. Leave a little clear space above the head.
The ONLY difference between cells is the facial expression.
BUST ONLY: nothing below the upper chest - no legs, no boots, no full bodies, even
if the attached images show full figures.
BACKGROUND: flat neutral mid-grey (about #808080), the same grey behind the figure
in every cell. No scenery, no props, no vignette, no gradient, no shadow cast on the
background.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is this character's finished model sheet. Copy his clothing, his colouring
and his line work exactly, and match its rendering precisely: same line weight,
same shading, same flat mid-grey background.
IMAGE 2 is STRIP A of THIS SAME MAN, already finished - a reference only. He must be
the same person: same face, same head shape, same hairline, same clothing, same
colours, same grey background, same framing, the head as big in the cell as it is
there. Only the expressions change.

INTENT, and this matters more than any feature below: he is A GOOD MAN WHO IS SUFFERING. The kindness and the pain are visible at the same
time. Tired and sad, never hard, never threatening.

CHARACTER, identical in every cell:
Argentine air force pilot, late thirties. The most gaunt face of the cast: hollow
cheeks, high cheekbones, deep lines beside the mouth, dark shadows under the eyes.
MOROCHO - weathered olive-brown criollo skin, clearly darker than the pale pilot in
the line-up. Dark hair combed back with STRONG GREY AT THE TEMPLES. Straight dark
eyebrows, a fine straight nose, a thin mouth, a long thin neck. Olive flight suit
with a chest harness, collar open.

EXPRESSIONS, left to right, top row then bottom row - SHEET C. Each one as
THIS character would do it, never as a generic face:
Push every expression to the EXTREME - big, exaggerated and unmistakable, like a 90s
arcade cut-in portrait, readable at 108 px. Never subtle, even the quiet ones.
CELL 1 - LAUGHING TILL CRYING: mouth thrown wide open, eyes squeezed shut, tears of laughter flying from the corners, head thrown far back.
CELL 2 - PANIC: eyes huge with tiny pupils, mouth stretched open in a scream, eyebrows at the top of the forehead, sweat drops flying.
CELL 3 - RED WITH RAGE: face flushed dark red, teeth bared and clenched, eyebrows crushed down, a vein bulging on the forehead.
CELL 4 - SOBBING: mouth wide open and wailing, eyebrows high and pinched, eyes shut, streams of tears down both cheeks.
CELL 5 - JAW DROP: mouth hanging enormously open, eyes huge, eyebrows shot up as high as they go.
CELL 6 - DISGUSTED: nose wrinkled hard, upper lip curled up to the nose, eyes squinting, head pulled far back.
CELL 7 - IN SHOCK: frozen, face drained pale, eyes wide and fixed on nothing, mouth slightly open.
CELL 8 - IN PAIN: eyes squeezed shut, teeth clenched, the whole face scrunched to one side.
CELL 9 - EUPHORIC: shouting with joy, mouth wide open, eyes shut, eyebrows up, head tipped back.
CELL 10 - STARTLED: head jerked back, eyes popping, mouth snapped open, shoulders up to the ears.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `tero_carcajada tero_panico tero_furia tero_llanto tero_mandibula tero_asco tero_shock tero_dolor tero_euforia tero_sobresalto`

### Hoja D — las incómodas y las pícaras (grilla 5×2)

**Adjuntar (chat nuevo), en este orden:** `final/tero3.png` *(IMAGE 1)* · la **Tira A** de este personaje que haya salido bien *(IMAGE 2)*.

```
DRAW A NEW IMAGE FROM SCRATCH. Do NOT return IMAGE 2, do NOT edit it, do NOT repeat
any of its faces. Every cell of the new sheet shows one of the NEW expressions
listed below.

Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SHEET LAYOUT: a GRID of TEN SQUARE cells, FIVE columns and TWO rows - exactly two
rows, not three - edge to edge, no gaps, no borders drawn between them. The finished
image is two and a half times as wide as it is tall. Each cell contains the SAME
character as a portrait bust - chest up, three-quarter view facing slightly LEFT,
eyes toward camera. Identical framing and identical scale in every cell: the head is
the same size and the eyes sit at the same height in all of them. The bottom edge
cuts across the upper chest; arms and hands are outside the frame. Leave a little clear space above the head.
The ONLY difference between cells is the facial expression.
BUST ONLY: nothing below the upper chest - no legs, no boots, no full bodies, even
if the attached images show full figures.
BACKGROUND: flat neutral mid-grey (about #808080), the same grey behind the figure
in every cell. No scenery, no props, no vignette, no gradient, no shadow cast on the
background.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is this character's finished model sheet. Copy his clothing, his colouring
and his line work exactly, and match its rendering precisely: same line weight,
same shading, same flat mid-grey background.
IMAGE 2 is STRIP A of THIS SAME MAN, already finished - a reference only. He must be
the same person: same face, same head shape, same hairline, same clothing, same
colours, same grey background, same framing, the head as big in the cell as it is
there. Only the expressions change.

INTENT, and this matters more than any feature below: he is A GOOD MAN WHO IS SUFFERING. The kindness and the pain are visible at the same
time. Tired and sad, never hard, never threatening.

CHARACTER, identical in every cell:
Argentine air force pilot, late thirties. The most gaunt face of the cast: hollow
cheeks, high cheekbones, deep lines beside the mouth, dark shadows under the eyes.
MOROCHO - weathered olive-brown criollo skin, clearly darker than the pale pilot in
the line-up. Dark hair combed back with STRONG GREY AT THE TEMPLES. Straight dark
eyebrows, a fine straight nose, a thin mouth, a long thin neck. Olive flight suit
with a chest harness, collar open.

EXPRESSIONS, left to right, top row then bottom row - SHEET D. Each one as
THIS character would do it, never as a generic face:
Push every expression to the EXTREME - big, exaggerated and unmistakable, like a 90s
arcade cut-in portrait, readable at 108 px. Never subtle, even the quiet ones.
CELL 1 - AWKWARD: head perfectly still, eyes sliding sideways toward the camera, lips pressed together and pulled to one side in a tight uneasy half-smile - caught in an uncomfortable moment.
CELL 2 - HOLDING IN A LAUGH: cheeks puffed out, lips pressed tight and wobbling, eyes crinkled and watering.
CELL 3 - "REALLY?": a totally flat deadpan face, eyelids half down, eyebrows level, staring straight at the camera.
CELL 4 - SUSPICIOUS SIDE-EYE: head turned away, eyes sliding hard to the side, one eyebrow down, mouth flat.
CELL 5 - GRIMACE: teeth clenched and showing in a wide stiff line, eyebrows up, eyes wide - "uh oh".
CELL 6 - SMUG: chin up, eyelids half down, a slow one-sided smirk, one eyebrow raised high.
CELL 7 - EYE ROLL: eyes rolled all the way up, eyelids half down, mouth twisted to one side.
CELL 8 - WINK: one eye shut tight, a big cheeky half-smile.
CELL 9 - TONGUE OUT: tongue stuck far out in a teasing face, eyes squinting playfully.
CELL 10 - NERVOUS LAUGH: a huge forced smile, eyebrows up and apart, eyes darting, big drops of sweat on the temple.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `tero_incomodo tero_aguanta_risa tero_en_serio tero_de_reojo tero_yikes tero_sobrador tero_ojos_blanco tero_guino tero_lengua tero_risa_nerviosa`

### Hoja E — las de todos los días y las profundas (grilla 5×2)

**Adjuntar (chat nuevo), en este orden:** `final/tero3.png` *(IMAGE 1)* · la **Tira A** de este personaje que haya salido bien *(IMAGE 2)*.

```
DRAW A NEW IMAGE FROM SCRATCH. Do NOT return IMAGE 2, do NOT edit it, do NOT repeat
any of its faces. Every cell of the new sheet shows one of the NEW expressions
listed below.

Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SHEET LAYOUT: a GRID of TEN SQUARE cells, FIVE columns and TWO rows - exactly two
rows, not three - edge to edge, no gaps, no borders drawn between them. The finished
image is two and a half times as wide as it is tall. Each cell contains the SAME
character as a portrait bust - chest up, three-quarter view facing slightly LEFT,
eyes toward camera. Identical framing and identical scale in every cell: the head is
the same size and the eyes sit at the same height in all of them. The bottom edge
cuts across the upper chest; arms and hands are outside the frame. Leave a little clear space above the head.
The ONLY difference between cells is the facial expression.
BUST ONLY: nothing below the upper chest - no legs, no boots, no full bodies, even
if the attached images show full figures.
BACKGROUND: flat neutral mid-grey (about #808080), the same grey behind the figure
in every cell. No scenery, no props, no vignette, no gradient, no shadow cast on the
background.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is this character's finished model sheet. Copy his clothing, his colouring
and his line work exactly, and match its rendering precisely: same line weight,
same shading, same flat mid-grey background.
IMAGE 2 is STRIP A of THIS SAME MAN, already finished - a reference only. He must be
the same person: same face, same head shape, same hairline, same clothing, same
colours, same grey background, same framing, the head as big in the cell as it is
there. Only the expressions change.

INTENT, and this matters more than any feature below: he is A GOOD MAN WHO IS SUFFERING. The kindness and the pain are visible at the same
time. Tired and sad, never hard, never threatening.

CHARACTER, identical in every cell:
Argentine air force pilot, late thirties. The most gaunt face of the cast: hollow
cheeks, high cheekbones, deep lines beside the mouth, dark shadows under the eyes.
MOROCHO - weathered olive-brown criollo skin, clearly darker than the pale pilot in
the line-up. Dark hair combed back with STRONG GREY AT THE TEMPLES. Straight dark
eyebrows, a fine straight nose, a thin mouth, a long thin neck. Olive flight suit
with a chest harness, collar open.

EXPRESSIONS, left to right, top row then bottom row - SHEET E. Each one as
THIS character would do it, never as a generic face:
Push every expression to the EXTREME - big, exaggerated and unmistakable, like a 90s
arcade cut-in portrait, readable at 108 px. Never subtle, even the quiet ones.
CELL 1 - SURPRISED: eyebrows shot up, eyes wide, mouth a small round O.
CELL 2 - DOUBTFUL: one eyebrow high and one low, eyes to the side, mouth pulled hard to one side.
CELL 3 - THINKING: eyes up and to the side, lips pushed out, one eyebrow raised.
CELL 4 - TALKING: the neutral face, mouth open mid-word, eyebrows slightly raised.
CELL 5 - TENDERNESS: soft wet eyes, eyebrows gently up, a small closed-mouth smile - thinking of someone loved.
CELL 6 - FAR AWAY: eyes looking off into the distance at nothing, a faint sad smile, eyebrows up.
CELL 7 - FIGHTING TEARS: chin trembling, lips pressed tight, eyes full of tears, eyebrows pinched up.
CELL 8 - SAD SMILE: eyebrows up in the middle, eyes wet, the mouth smiling anyway.
CELL 9 - PROUD: chin up high, a firm small smile, eyes bright.
CELL 10 - EXHAUSTED: eyelids almost shut, head drooping, mouth hanging slack - about to fall asleep.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `tero_sorpresa tero_duda tero_pensativo tero_hablando tero_ternura tero_mirada_perdida tero_aguanta_llanto tero_sonrisa_triste tero_orgullo tero_agotado`

### EN EL AVIÓN — las mismas tres hojas, con fondo de cabina

### Hoja C · en el avión — las grandes (grilla 5×2)

**Adjuntar (chat nuevo), en este orden:** `final/tero3.png` *(IMAGE 1)* · la **Tira A** de este personaje que haya salido bien *(IMAGE 2)*.

```
DRAW A NEW IMAGE FROM SCRATCH. Do NOT return IMAGE 2, do NOT edit it, do NOT repeat
any of its faces. Every cell of the new sheet shows one of the NEW expressions
listed below.

Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SHEET LAYOUT: a GRID of TEN SQUARE cells, FIVE columns and TWO rows - exactly two
rows, not three - edge to edge, no gaps, no borders drawn between them. The finished
image is two and a half times as wide as it is tall. Each cell contains the SAME
character as a portrait bust - chest up, three-quarter view facing slightly LEFT,
eyes toward camera. Identical framing and identical scale in every cell: the head is
the same size and the eyes sit at the same height in all of them. The bottom edge
cuts across the upper chest; arms and hands are outside the frame. Leave a little clear space above the head.
The ONLY difference between cells is the facial expression.
BUST ONLY: nothing below the upper chest - no legs, no boots, no full bodies, even
if the attached images show full figures.
BACKGROUND - INSIDE THE AIRCRAFT: behind the pilot, the cramped cockpit of an A-4
Skyhawk single-seat attack jet, 1970s: the metal canopy frame, a dark instrument
coaming with round analogue dials, grey South Atlantic sky through the canopy. Keep
it DARK, SIMPLE and SLIGHTLY BLURRED in big pixel shapes so the face reads first.
The SAME background behind the pilot in every cell.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is this character's finished model sheet. Copy his clothing, his colouring
and his line work exactly, and match its rendering precisely: same line weight,
same shading, same flat mid-grey background.
IMAGE 2 is STRIP A of THIS SAME MAN, already finished - a reference only. He must be
the same person: same face, same head shape, same hairline, same clothing, same
colours, same framing, the head as big in the cell as it is
there. Only the expressions change.

INTENT, and this matters more than any feature below: he is A GOOD MAN WHO IS SUFFERING. The kindness and the pain are visible at the same
time. Tired and sad, never hard, never threatening.

CHARACTER, identical in every cell:
Argentine air force pilot, late thirties. The most gaunt face of the cast: hollow
cheeks, high cheekbones, deep lines beside the mouth, dark shadows under the eyes.
MOROCHO - weathered olive-brown criollo skin, clearly darker than the pale pilot in
the line-up. Dark hair combed back with STRONG GREY AT THE TEMPLES. Straight dark
eyebrows, a fine straight nose, a thin mouth, a long thin neck. Olive flight suit
with a chest harness, collar open.

IN THE COCKPIT, EVERY CELL: the white flight helmet with the visor up, and the
green oxygen mask unclipped and hanging to one side, so the whole face shows. The
helmet must not hide the eyes or the eyebrows.

EXPRESSIONS, left to right, top row then bottom row - SHEET C, IN THE COCKPIT. Each one as
THIS character would do it, never as a generic face:
Push every expression to the EXTREME - big, exaggerated and unmistakable, like a 90s
arcade cut-in portrait, readable at 108 px. Never subtle, even the quiet ones.
CELL 1 - LAUGHING TILL CRYING: mouth thrown wide open, eyes squeezed shut, tears of laughter flying from the corners, head thrown far back.
CELL 2 - PANIC: eyes huge with tiny pupils, mouth stretched open in a scream, eyebrows at the top of the forehead, sweat drops flying.
CELL 3 - RED WITH RAGE: face flushed dark red, teeth bared and clenched, eyebrows crushed down, a vein bulging on the forehead.
CELL 4 - SOBBING: mouth wide open and wailing, eyebrows high and pinched, eyes shut, streams of tears down both cheeks.
CELL 5 - JAW DROP: mouth hanging enormously open, eyes huge, eyebrows shot up as high as they go.
CELL 6 - DISGUSTED: nose wrinkled hard, upper lip curled up to the nose, eyes squinting, head pulled far back.
CELL 7 - IN SHOCK: frozen, face drained pale, eyes wide and fixed on nothing, mouth slightly open.
CELL 8 - IN PAIN: eyes squeezed shut, teeth clenched, the whole face scrunched to one side.
CELL 9 - EUPHORIC: shouting with joy, mouth wide open, eyes shut, eyebrows up, head tipped back.
CELL 10 - STARTLED: head jerked back, eyes popping, mouth snapped open, shoulders up to the ears.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `tero_av_carcajada tero_av_panico tero_av_furia tero_av_llanto tero_av_mandibula tero_av_asco tero_av_shock tero_av_dolor tero_av_euforia tero_av_sobresalto`

### Hoja D · en el avión — las incómodas y las pícaras (grilla 5×2)

**Adjuntar (chat nuevo), en este orden:** la **Tira A** *(IMAGE 1)* · la **hoja C en el avión** de este personaje que haya salido bien *(IMAGE 2)*.

```
DRAW A NEW IMAGE FROM SCRATCH. Do NOT return IMAGE 2, do NOT edit it, do NOT repeat
any of its faces. Every cell of the new sheet shows one of the NEW expressions
listed below.

Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SHEET LAYOUT: a GRID of TEN SQUARE cells, FIVE columns and TWO rows - exactly two
rows, not three - edge to edge, no gaps, no borders drawn between them. The finished
image is two and a half times as wide as it is tall. Each cell contains the SAME
character as a portrait bust - chest up, three-quarter view facing slightly LEFT,
eyes toward camera. Identical framing and identical scale in every cell: the head is
the same size and the eyes sit at the same height in all of them. The bottom edge
cuts across the upper chest; arms and hands are outside the frame. Leave a little clear space above the head.
The ONLY difference between cells is the facial expression.
BUST ONLY: nothing below the upper chest - no legs, no boots, no full bodies, even
if the attached images show full figures.
BACKGROUND - INSIDE THE AIRCRAFT: behind the pilot, the cramped cockpit of an A-4
Skyhawk single-seat attack jet, 1970s: the metal canopy frame, a dark instrument
coaming with round analogue dials, grey South Atlantic sky through the canopy. Keep
it DARK, SIMPLE and SLIGHTLY BLURRED in big pixel shapes so the face reads first.
The SAME background behind the pilot in every cell.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is STRIP A of THIS SAME MAN, already finished - a reference only. He must
be the same person: same face, same head shape, same hairline, same clothing, same
colours, same line work and dithered shading.
IMAGE 2 is an earlier sheet of THIS SAME MAN IN THE COCKPIT. Copy from it exactly:
the cockpit background, the white flight helmet and hanging oxygen mask, the framing and the head size.

INTENT, and this matters more than any feature below: he is A GOOD MAN WHO IS SUFFERING. The kindness and the pain are visible at the same
time. Tired and sad, never hard, never threatening.

CHARACTER, identical in every cell:
Argentine air force pilot, late thirties. The most gaunt face of the cast: hollow
cheeks, high cheekbones, deep lines beside the mouth, dark shadows under the eyes.
MOROCHO - weathered olive-brown criollo skin, clearly darker than the pale pilot in
the line-up. Dark hair combed back with STRONG GREY AT THE TEMPLES. Straight dark
eyebrows, a fine straight nose, a thin mouth, a long thin neck. Olive flight suit
with a chest harness, collar open.

IN THE COCKPIT, EVERY CELL: the white flight helmet with the visor up, and the
green oxygen mask unclipped and hanging to one side, so the whole face shows. The
helmet must not hide the eyes or the eyebrows.

EXPRESSIONS, left to right, top row then bottom row - SHEET D, IN THE COCKPIT. Each one as
THIS character would do it, never as a generic face:
Push every expression to the EXTREME - big, exaggerated and unmistakable, like a 90s
arcade cut-in portrait, readable at 108 px. Never subtle, even the quiet ones.
CELL 1 - AWKWARD: head perfectly still, eyes sliding sideways toward the camera, lips pressed together and pulled to one side in a tight uneasy half-smile - caught in an uncomfortable moment.
CELL 2 - HOLDING IN A LAUGH: cheeks puffed out, lips pressed tight and wobbling, eyes crinkled and watering.
CELL 3 - "REALLY?": a totally flat deadpan face, eyelids half down, eyebrows level, staring straight at the camera.
CELL 4 - SUSPICIOUS SIDE-EYE: head turned away, eyes sliding hard to the side, one eyebrow down, mouth flat.
CELL 5 - GRIMACE: teeth clenched and showing in a wide stiff line, eyebrows up, eyes wide - "uh oh".
CELL 6 - SMUG: chin up, eyelids half down, a slow one-sided smirk, one eyebrow raised high.
CELL 7 - EYE ROLL: eyes rolled all the way up, eyelids half down, mouth twisted to one side.
CELL 8 - WINK: one eye shut tight, a big cheeky half-smile.
CELL 9 - TONGUE OUT: tongue stuck far out in a teasing face, eyes squinting playfully.
CELL 10 - NERVOUS LAUGH: a huge forced smile, eyebrows up and apart, eyes darting, big drops of sweat on the temple.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `tero_av_incomodo tero_av_aguanta_risa tero_av_en_serio tero_av_de_reojo tero_av_yikes tero_av_sobrador tero_av_ojos_blanco tero_av_guino tero_av_lengua tero_av_risa_nerviosa`

### Hoja E · en el avión — las de todos los días y las profundas (grilla 5×2)

**Adjuntar (chat nuevo), en este orden:** la **Tira A** *(IMAGE 1)* · la **hoja C en el avión** de este personaje que haya salido bien *(IMAGE 2)*.

```
DRAW A NEW IMAGE FROM SCRATCH. Do NOT return IMAGE 2, do NOT edit it, do NOT repeat
any of its faces. Every cell of the new sheet shows one of the NEW expressions
listed below.

Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SHEET LAYOUT: a GRID of TEN SQUARE cells, FIVE columns and TWO rows - exactly two
rows, not three - edge to edge, no gaps, no borders drawn between them. The finished
image is two and a half times as wide as it is tall. Each cell contains the SAME
character as a portrait bust - chest up, three-quarter view facing slightly LEFT,
eyes toward camera. Identical framing and identical scale in every cell: the head is
the same size and the eyes sit at the same height in all of them. The bottom edge
cuts across the upper chest; arms and hands are outside the frame. Leave a little clear space above the head.
The ONLY difference between cells is the facial expression.
BUST ONLY: nothing below the upper chest - no legs, no boots, no full bodies, even
if the attached images show full figures.
BACKGROUND - INSIDE THE AIRCRAFT: behind the pilot, the cramped cockpit of an A-4
Skyhawk single-seat attack jet, 1970s: the metal canopy frame, a dark instrument
coaming with round analogue dials, grey South Atlantic sky through the canopy. Keep
it DARK, SIMPLE and SLIGHTLY BLURRED in big pixel shapes so the face reads first.
The SAME background behind the pilot in every cell.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is STRIP A of THIS SAME MAN, already finished - a reference only. He must
be the same person: same face, same head shape, same hairline, same clothing, same
colours, same line work and dithered shading.
IMAGE 2 is an earlier sheet of THIS SAME MAN IN THE COCKPIT. Copy from it exactly:
the cockpit background, the white flight helmet and hanging oxygen mask, the framing and the head size.

INTENT, and this matters more than any feature below: he is A GOOD MAN WHO IS SUFFERING. The kindness and the pain are visible at the same
time. Tired and sad, never hard, never threatening.

CHARACTER, identical in every cell:
Argentine air force pilot, late thirties. The most gaunt face of the cast: hollow
cheeks, high cheekbones, deep lines beside the mouth, dark shadows under the eyes.
MOROCHO - weathered olive-brown criollo skin, clearly darker than the pale pilot in
the line-up. Dark hair combed back with STRONG GREY AT THE TEMPLES. Straight dark
eyebrows, a fine straight nose, a thin mouth, a long thin neck. Olive flight suit
with a chest harness, collar open.

IN THE COCKPIT, EVERY CELL: the white flight helmet with the visor up, and the
green oxygen mask unclipped and hanging to one side, so the whole face shows. The
helmet must not hide the eyes or the eyebrows.

EXPRESSIONS, left to right, top row then bottom row - SHEET E, IN THE COCKPIT. Each one as
THIS character would do it, never as a generic face:
Push every expression to the EXTREME - big, exaggerated and unmistakable, like a 90s
arcade cut-in portrait, readable at 108 px. Never subtle, even the quiet ones.
CELL 1 - SURPRISED: eyebrows shot up, eyes wide, mouth a small round O.
CELL 2 - DOUBTFUL: one eyebrow high and one low, eyes to the side, mouth pulled hard to one side.
CELL 3 - THINKING: eyes up and to the side, lips pushed out, one eyebrow raised.
CELL 4 - TALKING: the neutral face, mouth open mid-word, eyebrows slightly raised.
CELL 5 - TENDERNESS: soft wet eyes, eyebrows gently up, a small closed-mouth smile - thinking of someone loved.
CELL 6 - FAR AWAY: eyes looking off into the distance at nothing, a faint sad smile, eyebrows up.
CELL 7 - FIGHTING TEARS: chin trembling, lips pressed tight, eyes full of tears, eyebrows pinched up.
CELL 8 - SAD SMILE: eyebrows up in the middle, eyes wet, the mouth smiling anyway.
CELL 9 - PROUD: chin up high, a firm small smile, eyes bright.
CELL 10 - EXHAUSTED: eyelids almost shut, head drooping, mouth hanging slack - about to fall asleep.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `tero_av_sorpresa tero_av_duda tero_av_pensativo tero_av_hablando tero_av_ternura tero_av_mirada_perdida tero_av_aguanta_llanto tero_av_sonrisa_triste tero_av_orgullo tero_av_agotado`

---

## PUMA

### Tira A

**Adjuntar (chat nuevo):** `final/puma.png` *(IMAGE 1)* · `final/team.png` *(IMAGE 2)*

```
Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SHEET LAYOUT: a single horizontal strip of SIX SQUARE cells in one row, edge to
edge, no gaps, no borders drawn between them. The finished image is exactly six
times as wide as it is tall. Each cell contains the SAME character as a portrait
bust - chest up, three-quarter view facing slightly LEFT, eyes toward camera.
Identical framing and identical scale in every cell: the head is the same size and
the eyes sit at the same height in all of them. The bottom edge cuts across the
upper chest; arms and hands are outside the frame. Leave a little clear space
above the hair. The ONLY difference between cells is the facial expression.
BUST ONLY: nothing below the upper chest - no legs, no boots, no full bodies, even
if the attached images show full figures.
BACKGROUND: flat neutral mid-grey (about #808080), the same grey behind the figure
in every cell. No scenery, no props, no vignette, no gradient, no shadow cast on the
background.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is this character's finished model sheet. Copy his clothing, his colouring
and his line work exactly, and match its rendering precisely: same line weight,
same shading, same flat mid-grey background.
IMAGE 2 is the full cast line-up. This character is the FOURTH figure. Copy his
build and his face from there. The other seven are the rest of the cast and he must
stay clearly different from every one of them.

INTENT, and this matters more than any feature below: he is THE AUTHORITY THAT DOES NOT NEED TO MOVE. Solid, unhurried, has seen all of this
before and is not surprised by any of it.

CHARACTER, identical in every cell:
Argentine air force squadron leader, forties. The WIDEST face of the cast: broad and
square, straight heavy jaw. Fair weathered skin. THICK SILVER-GREY HAIR, plenty of
it, combed back - not balding, not cropped. Heavy grey eyebrows. HEAVILY HOODED
EYES, almost closed, lines at the corners. A grey walrus moustache dropping past the
corners of the mouth. Straight, ordinary-sized nose. Nothing on his head. Brown
leather flight jacket collar at the neck.

EXPRESSIONS, left to right:
CELL 1 - NEUTRAL: completely level and unreadable, mouth a straight line under the moustache. Giving an order he has given a hundred times.
CELL 2 - SMILE: a genuine warm smile, eyes crinkling. He gives this away almost never - for one second he must look like a kinder man.
CELL 3 - WORRIED: eyebrows drawn together, eyes open wider than usual. On him, worry reads as attention.
CELL 4 - ANGER: eyebrows hard down, mouth tight. Displeased and about to say why.
CELL 5 - BROKEN: eyes closed or nearly, head lowered a fraction, the moustache hiding a mouth that has given up.
CELL 6 - THE DOUBT - eyebrows up and uneven, eyes off to one side, mouth slightly open as
  if a sentence stopped halfway. A man about to disobey. Not angry, not sad -
  unmoored.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `puma_neutro puma_sonrisa puma_preocupado puma_ceno puma_roto puma_duda`

### Tira B

**Adjuntar (chat nuevo), en este orden:** `final/puma.png` *(IMAGE 1)* · la **Tira A** de este personaje que haya salido bien *(IMAGE 2)*.

```
DRAW A NEW IMAGE FROM SCRATCH. Do NOT return IMAGE 2, do NOT edit it, do NOT repeat
any of its faces. Every cell of the new strip shows one of the NEW expressions
listed below.

Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SHEET LAYOUT: a single horizontal strip of SIX SQUARE cells in one row, edge to
edge, no gaps, no borders drawn between them. The finished image is exactly six
times as wide as it is tall. Each cell contains the SAME character as a portrait
bust - chest up, three-quarter view facing slightly LEFT, eyes toward camera.
Identical framing and identical scale in every cell: the head is the same size and
the eyes sit at the same height in all of them. The bottom edge cuts across the
upper chest; arms and hands are outside the frame. Leave a little clear space
above the hair. The ONLY difference between cells is the facial expression.
BUST ONLY: nothing below the upper chest - no legs, no boots, no full bodies, even
if the attached images show full figures.
BACKGROUND: flat neutral mid-grey (about #808080), the same grey behind the figure
in every cell. No scenery, no props, no vignette, no gradient, no shadow cast on the
background.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is this character's finished model sheet. Copy his clothing, his colouring
and his line work exactly, and match its rendering precisely: same line weight,
same shading, same flat mid-grey background.
IMAGE 2 is STRIP A of THIS SAME MAN, already finished - a reference only. He must be
the same person: same face, same head shape, same hairline, same clothing, same
colours, same grey background, same framing, the head as big in the cell as it is
there. Only the expressions change.

INTENT, and this matters more than any feature below: he is THE AUTHORITY THAT DOES NOT NEED TO MOVE. Solid, unhurried, has seen all of this
before and is not surprised by any of it.

CHARACTER, identical in every cell:
Argentine air force squadron leader, forties. The WIDEST face of the cast: broad and
square, straight heavy jaw. Fair weathered skin. THICK SILVER-GREY HAIR, plenty of
it, combed back - not balding, not cropped. Heavy grey eyebrows. HEAVILY HOODED
EYES, almost closed, lines at the corners. A grey walrus moustache dropping past the
corners of the mouth. Straight, ordinary-sized nose. Nothing on his head. Brown
leather flight jacket collar at the neck.

EXPRESSIONS, left to right - STRIP B, the strong ones. Each one as THIS character
would do it, never as a generic face:
CELL 1 - LAUGHING: a real laugh, mouth wide open, eyes squeezed almost shut, head
  tipped slightly back.
CELL 2 - AFRAID: eyes wide with white showing, eyebrows up and pulled together,
  mouth open and tense.
CELL 3 - SHOUTING IN ANGER: eyebrows hard down, mouth wide open in a shout, teeth
  showing, head pushed forward.
CELL 4 - CRYING: eyebrows high and pinched in the middle, eyes squeezed, mouth turned
  down and trembling, one or two simple pixel tear lines on the cheek.
CELL 5 - RELIEVED: eyes closed, eyebrows relaxed upward, a long breath out, a small
  tired smile, head tilted a little back.
CELL 6 - DETERMINED: eyebrows low and level, eyes narrowed and fixed ahead, jaw set,
  mouth a firm line, head slightly forward.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `puma_risa puma_miedo puma_grito puma_llanto puma_alivio puma_decidido`

### Hoja C — las grandes (grilla 5×2)

**Adjuntar (chat nuevo), en este orden:** `final/puma.png` *(IMAGE 1)* · la **Tira A** de este personaje que haya salido bien *(IMAGE 2)*.

```
DRAW A NEW IMAGE FROM SCRATCH. Do NOT return IMAGE 2, do NOT edit it, do NOT repeat
any of its faces. Every cell of the new sheet shows one of the NEW expressions
listed below.

Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SHEET LAYOUT: a GRID of TEN SQUARE cells, FIVE columns and TWO rows - exactly two
rows, not three - edge to edge, no gaps, no borders drawn between them. The finished
image is two and a half times as wide as it is tall. Each cell contains the SAME
character as a portrait bust - chest up, three-quarter view facing slightly LEFT,
eyes toward camera. Identical framing and identical scale in every cell: the head is
the same size and the eyes sit at the same height in all of them. The bottom edge
cuts across the upper chest; arms and hands are outside the frame. Leave a little clear space above the head.
The ONLY difference between cells is the facial expression.
BUST ONLY: nothing below the upper chest - no legs, no boots, no full bodies, even
if the attached images show full figures.
BACKGROUND: flat neutral mid-grey (about #808080), the same grey behind the figure
in every cell. No scenery, no props, no vignette, no gradient, no shadow cast on the
background.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is this character's finished model sheet. Copy his clothing, his colouring
and his line work exactly, and match its rendering precisely: same line weight,
same shading, same flat mid-grey background.
IMAGE 2 is STRIP A of THIS SAME MAN, already finished - a reference only. He must be
the same person: same face, same head shape, same hairline, same clothing, same
colours, same grey background, same framing, the head as big in the cell as it is
there. Only the expressions change.

INTENT, and this matters more than any feature below: he is THE AUTHORITY THAT DOES NOT NEED TO MOVE. Solid, unhurried, has seen all of this
before and is not surprised by any of it.

CHARACTER, identical in every cell:
Argentine air force squadron leader, forties. The WIDEST face of the cast: broad and
square, straight heavy jaw. Fair weathered skin. THICK SILVER-GREY HAIR, plenty of
it, combed back - not balding, not cropped. Heavy grey eyebrows. HEAVILY HOODED
EYES, almost closed, lines at the corners. A grey walrus moustache dropping past the
corners of the mouth. Straight, ordinary-sized nose. Nothing on his head. Brown
leather flight jacket collar at the neck.

EXPRESSIONS, left to right, top row then bottom row - SHEET C. Each one as
THIS character would do it, never as a generic face:
Push every expression to the EXTREME - big, exaggerated and unmistakable, like a 90s
arcade cut-in portrait, readable at 108 px. Never subtle, even the quiet ones.
CELL 1 - LAUGHING TILL CRYING: mouth thrown wide open, eyes squeezed shut, tears of laughter flying from the corners, head thrown far back.
CELL 2 - PANIC: eyes huge with tiny pupils, mouth stretched open in a scream, eyebrows at the top of the forehead, sweat drops flying.
CELL 3 - RED WITH RAGE: face flushed dark red, teeth bared and clenched, eyebrows crushed down, a vein bulging on the forehead.
CELL 4 - SOBBING: mouth wide open and wailing, eyebrows high and pinched, eyes shut, streams of tears down both cheeks.
CELL 5 - JAW DROP: mouth hanging enormously open, eyes huge, eyebrows shot up as high as they go.
CELL 6 - DISGUSTED: nose wrinkled hard, upper lip curled up to the nose, eyes squinting, head pulled far back.
CELL 7 - IN SHOCK: frozen, face drained pale, eyes wide and fixed on nothing, mouth slightly open.
CELL 8 - IN PAIN: eyes squeezed shut, teeth clenched, the whole face scrunched to one side.
CELL 9 - EUPHORIC: shouting with joy, mouth wide open, eyes shut, eyebrows up, head tipped back.
CELL 10 - STARTLED: head jerked back, eyes popping, mouth snapped open, shoulders up to the ears.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `puma_carcajada puma_panico puma_furia puma_llanto puma_mandibula puma_asco puma_shock puma_dolor puma_euforia puma_sobresalto`

### Hoja D — las incómodas y las pícaras (grilla 5×2)

**Adjuntar (chat nuevo), en este orden:** `final/puma.png` *(IMAGE 1)* · la **Tira A** de este personaje que haya salido bien *(IMAGE 2)*.

```
DRAW A NEW IMAGE FROM SCRATCH. Do NOT return IMAGE 2, do NOT edit it, do NOT repeat
any of its faces. Every cell of the new sheet shows one of the NEW expressions
listed below.

Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SHEET LAYOUT: a GRID of TEN SQUARE cells, FIVE columns and TWO rows - exactly two
rows, not three - edge to edge, no gaps, no borders drawn between them. The finished
image is two and a half times as wide as it is tall. Each cell contains the SAME
character as a portrait bust - chest up, three-quarter view facing slightly LEFT,
eyes toward camera. Identical framing and identical scale in every cell: the head is
the same size and the eyes sit at the same height in all of them. The bottom edge
cuts across the upper chest; arms and hands are outside the frame. Leave a little clear space above the head.
The ONLY difference between cells is the facial expression.
BUST ONLY: nothing below the upper chest - no legs, no boots, no full bodies, even
if the attached images show full figures.
BACKGROUND: flat neutral mid-grey (about #808080), the same grey behind the figure
in every cell. No scenery, no props, no vignette, no gradient, no shadow cast on the
background.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is this character's finished model sheet. Copy his clothing, his colouring
and his line work exactly, and match its rendering precisely: same line weight,
same shading, same flat mid-grey background.
IMAGE 2 is STRIP A of THIS SAME MAN, already finished - a reference only. He must be
the same person: same face, same head shape, same hairline, same clothing, same
colours, same grey background, same framing, the head as big in the cell as it is
there. Only the expressions change.

INTENT, and this matters more than any feature below: he is THE AUTHORITY THAT DOES NOT NEED TO MOVE. Solid, unhurried, has seen all of this
before and is not surprised by any of it.

CHARACTER, identical in every cell:
Argentine air force squadron leader, forties. The WIDEST face of the cast: broad and
square, straight heavy jaw. Fair weathered skin. THICK SILVER-GREY HAIR, plenty of
it, combed back - not balding, not cropped. Heavy grey eyebrows. HEAVILY HOODED
EYES, almost closed, lines at the corners. A grey walrus moustache dropping past the
corners of the mouth. Straight, ordinary-sized nose. Nothing on his head. Brown
leather flight jacket collar at the neck.

EXPRESSIONS, left to right, top row then bottom row - SHEET D. Each one as
THIS character would do it, never as a generic face:
Push every expression to the EXTREME - big, exaggerated and unmistakable, like a 90s
arcade cut-in portrait, readable at 108 px. Never subtle, even the quiet ones.
CELL 1 - AWKWARD: head perfectly still, eyes sliding sideways toward the camera, lips pressed together and pulled to one side in a tight uneasy half-smile - caught in an uncomfortable moment.
CELL 2 - HOLDING IN A LAUGH: cheeks puffed out, lips pressed tight and wobbling, eyes crinkled and watering.
CELL 3 - "REALLY?": a totally flat deadpan face, eyelids half down, eyebrows level, staring straight at the camera.
CELL 4 - SUSPICIOUS SIDE-EYE: head turned away, eyes sliding hard to the side, one eyebrow down, mouth flat.
CELL 5 - GRIMACE: teeth clenched and showing in a wide stiff line, eyebrows up, eyes wide - "uh oh".
CELL 6 - SMUG: chin up, eyelids half down, a slow one-sided smirk, one eyebrow raised high.
CELL 7 - EYE ROLL: eyes rolled all the way up, eyelids half down, mouth twisted to one side.
CELL 8 - WINK: one eye shut tight, a big cheeky half-smile.
CELL 9 - TONGUE OUT: tongue stuck far out in a teasing face, eyes squinting playfully.
CELL 10 - NERVOUS LAUGH: a huge forced smile, eyebrows up and apart, eyes darting, big drops of sweat on the temple.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `puma_incomodo puma_aguanta_risa puma_en_serio puma_de_reojo puma_yikes puma_sobrador puma_ojos_blanco puma_guino puma_lengua puma_risa_nerviosa`

### Hoja E — las de todos los días y las profundas (grilla 5×2)

**Adjuntar (chat nuevo), en este orden:** `final/puma.png` *(IMAGE 1)* · la **Tira A** de este personaje que haya salido bien *(IMAGE 2)*.

```
DRAW A NEW IMAGE FROM SCRATCH. Do NOT return IMAGE 2, do NOT edit it, do NOT repeat
any of its faces. Every cell of the new sheet shows one of the NEW expressions
listed below.

Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SHEET LAYOUT: a GRID of TEN SQUARE cells, FIVE columns and TWO rows - exactly two
rows, not three - edge to edge, no gaps, no borders drawn between them. The finished
image is two and a half times as wide as it is tall. Each cell contains the SAME
character as a portrait bust - chest up, three-quarter view facing slightly LEFT,
eyes toward camera. Identical framing and identical scale in every cell: the head is
the same size and the eyes sit at the same height in all of them. The bottom edge
cuts across the upper chest; arms and hands are outside the frame. Leave a little clear space above the head.
The ONLY difference between cells is the facial expression.
BUST ONLY: nothing below the upper chest - no legs, no boots, no full bodies, even
if the attached images show full figures.
BACKGROUND: flat neutral mid-grey (about #808080), the same grey behind the figure
in every cell. No scenery, no props, no vignette, no gradient, no shadow cast on the
background.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is this character's finished model sheet. Copy his clothing, his colouring
and his line work exactly, and match its rendering precisely: same line weight,
same shading, same flat mid-grey background.
IMAGE 2 is STRIP A of THIS SAME MAN, already finished - a reference only. He must be
the same person: same face, same head shape, same hairline, same clothing, same
colours, same grey background, same framing, the head as big in the cell as it is
there. Only the expressions change.

INTENT, and this matters more than any feature below: he is THE AUTHORITY THAT DOES NOT NEED TO MOVE. Solid, unhurried, has seen all of this
before and is not surprised by any of it.

CHARACTER, identical in every cell:
Argentine air force squadron leader, forties. The WIDEST face of the cast: broad and
square, straight heavy jaw. Fair weathered skin. THICK SILVER-GREY HAIR, plenty of
it, combed back - not balding, not cropped. Heavy grey eyebrows. HEAVILY HOODED
EYES, almost closed, lines at the corners. A grey walrus moustache dropping past the
corners of the mouth. Straight, ordinary-sized nose. Nothing on his head. Brown
leather flight jacket collar at the neck.

EXPRESSIONS, left to right, top row then bottom row - SHEET E. Each one as
THIS character would do it, never as a generic face:
Push every expression to the EXTREME - big, exaggerated and unmistakable, like a 90s
arcade cut-in portrait, readable at 108 px. Never subtle, even the quiet ones.
CELL 1 - SURPRISED: eyebrows shot up, eyes wide, mouth a small round O.
CELL 2 - DOUBTFUL: one eyebrow high and one low, eyes to the side, mouth pulled hard to one side.
CELL 3 - THINKING: eyes up and to the side, lips pushed out, one eyebrow raised.
CELL 4 - TALKING: the neutral face, mouth open mid-word, eyebrows slightly raised.
CELL 5 - TENDERNESS: soft wet eyes, eyebrows gently up, a small closed-mouth smile - thinking of someone loved.
CELL 6 - FAR AWAY: eyes looking off into the distance at nothing, a faint sad smile, eyebrows up.
CELL 7 - FIGHTING TEARS: chin trembling, lips pressed tight, eyes full of tears, eyebrows pinched up.
CELL 8 - SAD SMILE: eyebrows up in the middle, eyes wet, the mouth smiling anyway.
CELL 9 - PROUD: chin up high, a firm small smile, eyes bright.
CELL 10 - EXHAUSTED: eyelids almost shut, head drooping, mouth hanging slack - about to fall asleep.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `puma_sorpresa puma_duda puma_pensativo puma_hablando puma_ternura puma_mirada_perdida puma_aguanta_llanto puma_sonrisa_triste puma_orgullo puma_agotado`

### EN EL AVIÓN — las mismas tres hojas, con fondo de cabina

### Hoja C · en el avión — las grandes (grilla 5×2)

**Adjuntar (chat nuevo), en este orden:** `final/puma.png` *(IMAGE 1)* · la **Tira A** de este personaje que haya salido bien *(IMAGE 2)*.

```
DRAW A NEW IMAGE FROM SCRATCH. Do NOT return IMAGE 2, do NOT edit it, do NOT repeat
any of its faces. Every cell of the new sheet shows one of the NEW expressions
listed below.

Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SHEET LAYOUT: a GRID of TEN SQUARE cells, FIVE columns and TWO rows - exactly two
rows, not three - edge to edge, no gaps, no borders drawn between them. The finished
image is two and a half times as wide as it is tall. Each cell contains the SAME
character as a portrait bust - chest up, three-quarter view facing slightly LEFT,
eyes toward camera. Identical framing and identical scale in every cell: the head is
the same size and the eyes sit at the same height in all of them. The bottom edge
cuts across the upper chest; arms and hands are outside the frame. Leave a little clear space above the head.
The ONLY difference between cells is the facial expression.
BUST ONLY: nothing below the upper chest - no legs, no boots, no full bodies, even
if the attached images show full figures.
BACKGROUND - INSIDE THE AIRCRAFT: behind the pilot, the cramped cockpit of an A-4
Skyhawk single-seat attack jet, 1970s: the metal canopy frame, a dark instrument
coaming with round analogue dials, grey South Atlantic sky through the canopy. Keep
it DARK, SIMPLE and SLIGHTLY BLURRED in big pixel shapes so the face reads first.
The SAME background behind the pilot in every cell.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is this character's finished model sheet. Copy his clothing, his colouring
and his line work exactly, and match its rendering precisely: same line weight,
same shading, same flat mid-grey background.
IMAGE 2 is STRIP A of THIS SAME MAN, already finished - a reference only. He must be
the same person: same face, same head shape, same hairline, same clothing, same
colours, same framing, the head as big in the cell as it is
there. Only the expressions change.

INTENT, and this matters more than any feature below: he is THE AUTHORITY THAT DOES NOT NEED TO MOVE. Solid, unhurried, has seen all of this
before and is not surprised by any of it.

CHARACTER, identical in every cell:
Argentine air force squadron leader, forties. The WIDEST face of the cast: broad and
square, straight heavy jaw. Fair weathered skin. THICK SILVER-GREY HAIR, plenty of
it, combed back - not balding, not cropped. Heavy grey eyebrows. HEAVILY HOODED
EYES, almost closed, lines at the corners. A grey walrus moustache dropping past the
corners of the mouth. Straight, ordinary-sized nose. Nothing on his head. Brown
leather flight jacket collar at the neck.

IN THE COCKPIT, EVERY CELL: the white flight helmet with the visor up, and the
green oxygen mask unclipped and hanging to one side, so the whole face shows. The
helmet must not hide the eyes or the eyebrows.

EXPRESSIONS, left to right, top row then bottom row - SHEET C, IN THE COCKPIT. Each one as
THIS character would do it, never as a generic face:
Push every expression to the EXTREME - big, exaggerated and unmistakable, like a 90s
arcade cut-in portrait, readable at 108 px. Never subtle, even the quiet ones.
CELL 1 - LAUGHING TILL CRYING: mouth thrown wide open, eyes squeezed shut, tears of laughter flying from the corners, head thrown far back.
CELL 2 - PANIC: eyes huge with tiny pupils, mouth stretched open in a scream, eyebrows at the top of the forehead, sweat drops flying.
CELL 3 - RED WITH RAGE: face flushed dark red, teeth bared and clenched, eyebrows crushed down, a vein bulging on the forehead.
CELL 4 - SOBBING: mouth wide open and wailing, eyebrows high and pinched, eyes shut, streams of tears down both cheeks.
CELL 5 - JAW DROP: mouth hanging enormously open, eyes huge, eyebrows shot up as high as they go.
CELL 6 - DISGUSTED: nose wrinkled hard, upper lip curled up to the nose, eyes squinting, head pulled far back.
CELL 7 - IN SHOCK: frozen, face drained pale, eyes wide and fixed on nothing, mouth slightly open.
CELL 8 - IN PAIN: eyes squeezed shut, teeth clenched, the whole face scrunched to one side.
CELL 9 - EUPHORIC: shouting with joy, mouth wide open, eyes shut, eyebrows up, head tipped back.
CELL 10 - STARTLED: head jerked back, eyes popping, mouth snapped open, shoulders up to the ears.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `puma_av_carcajada puma_av_panico puma_av_furia puma_av_llanto puma_av_mandibula puma_av_asco puma_av_shock puma_av_dolor puma_av_euforia puma_av_sobresalto`

### Hoja D · en el avión — las incómodas y las pícaras (grilla 5×2)

**Adjuntar (chat nuevo), en este orden:** la **Tira A** *(IMAGE 1)* · la **hoja C en el avión** de este personaje que haya salido bien *(IMAGE 2)*.

```
DRAW A NEW IMAGE FROM SCRATCH. Do NOT return IMAGE 2, do NOT edit it, do NOT repeat
any of its faces. Every cell of the new sheet shows one of the NEW expressions
listed below.

Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SHEET LAYOUT: a GRID of TEN SQUARE cells, FIVE columns and TWO rows - exactly two
rows, not three - edge to edge, no gaps, no borders drawn between them. The finished
image is two and a half times as wide as it is tall. Each cell contains the SAME
character as a portrait bust - chest up, three-quarter view facing slightly LEFT,
eyes toward camera. Identical framing and identical scale in every cell: the head is
the same size and the eyes sit at the same height in all of them. The bottom edge
cuts across the upper chest; arms and hands are outside the frame. Leave a little clear space above the head.
The ONLY difference between cells is the facial expression.
BUST ONLY: nothing below the upper chest - no legs, no boots, no full bodies, even
if the attached images show full figures.
BACKGROUND - INSIDE THE AIRCRAFT: behind the pilot, the cramped cockpit of an A-4
Skyhawk single-seat attack jet, 1970s: the metal canopy frame, a dark instrument
coaming with round analogue dials, grey South Atlantic sky through the canopy. Keep
it DARK, SIMPLE and SLIGHTLY BLURRED in big pixel shapes so the face reads first.
The SAME background behind the pilot in every cell.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is STRIP A of THIS SAME MAN, already finished - a reference only. He must
be the same person: same face, same head shape, same hairline, same clothing, same
colours, same line work and dithered shading.
IMAGE 2 is an earlier sheet of THIS SAME MAN IN THE COCKPIT. Copy from it exactly:
the cockpit background, the white flight helmet and hanging oxygen mask, the framing and the head size.

INTENT, and this matters more than any feature below: he is THE AUTHORITY THAT DOES NOT NEED TO MOVE. Solid, unhurried, has seen all of this
before and is not surprised by any of it.

CHARACTER, identical in every cell:
Argentine air force squadron leader, forties. The WIDEST face of the cast: broad and
square, straight heavy jaw. Fair weathered skin. THICK SILVER-GREY HAIR, plenty of
it, combed back - not balding, not cropped. Heavy grey eyebrows. HEAVILY HOODED
EYES, almost closed, lines at the corners. A grey walrus moustache dropping past the
corners of the mouth. Straight, ordinary-sized nose. Nothing on his head. Brown
leather flight jacket collar at the neck.

IN THE COCKPIT, EVERY CELL: the white flight helmet with the visor up, and the
green oxygen mask unclipped and hanging to one side, so the whole face shows. The
helmet must not hide the eyes or the eyebrows.

EXPRESSIONS, left to right, top row then bottom row - SHEET D, IN THE COCKPIT. Each one as
THIS character would do it, never as a generic face:
Push every expression to the EXTREME - big, exaggerated and unmistakable, like a 90s
arcade cut-in portrait, readable at 108 px. Never subtle, even the quiet ones.
CELL 1 - AWKWARD: head perfectly still, eyes sliding sideways toward the camera, lips pressed together and pulled to one side in a tight uneasy half-smile - caught in an uncomfortable moment.
CELL 2 - HOLDING IN A LAUGH: cheeks puffed out, lips pressed tight and wobbling, eyes crinkled and watering.
CELL 3 - "REALLY?": a totally flat deadpan face, eyelids half down, eyebrows level, staring straight at the camera.
CELL 4 - SUSPICIOUS SIDE-EYE: head turned away, eyes sliding hard to the side, one eyebrow down, mouth flat.
CELL 5 - GRIMACE: teeth clenched and showing in a wide stiff line, eyebrows up, eyes wide - "uh oh".
CELL 6 - SMUG: chin up, eyelids half down, a slow one-sided smirk, one eyebrow raised high.
CELL 7 - EYE ROLL: eyes rolled all the way up, eyelids half down, mouth twisted to one side.
CELL 8 - WINK: one eye shut tight, a big cheeky half-smile.
CELL 9 - TONGUE OUT: tongue stuck far out in a teasing face, eyes squinting playfully.
CELL 10 - NERVOUS LAUGH: a huge forced smile, eyebrows up and apart, eyes darting, big drops of sweat on the temple.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `puma_av_incomodo puma_av_aguanta_risa puma_av_en_serio puma_av_de_reojo puma_av_yikes puma_av_sobrador puma_av_ojos_blanco puma_av_guino puma_av_lengua puma_av_risa_nerviosa`

### Hoja E · en el avión — las de todos los días y las profundas (grilla 5×2)

**Adjuntar (chat nuevo), en este orden:** la **Tira A** *(IMAGE 1)* · la **hoja C en el avión** de este personaje que haya salido bien *(IMAGE 2)*.

```
DRAW A NEW IMAGE FROM SCRATCH. Do NOT return IMAGE 2, do NOT edit it, do NOT repeat
any of its faces. Every cell of the new sheet shows one of the NEW expressions
listed below.

Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SHEET LAYOUT: a GRID of TEN SQUARE cells, FIVE columns and TWO rows - exactly two
rows, not three - edge to edge, no gaps, no borders drawn between them. The finished
image is two and a half times as wide as it is tall. Each cell contains the SAME
character as a portrait bust - chest up, three-quarter view facing slightly LEFT,
eyes toward camera. Identical framing and identical scale in every cell: the head is
the same size and the eyes sit at the same height in all of them. The bottom edge
cuts across the upper chest; arms and hands are outside the frame. Leave a little clear space above the head.
The ONLY difference between cells is the facial expression.
BUST ONLY: nothing below the upper chest - no legs, no boots, no full bodies, even
if the attached images show full figures.
BACKGROUND - INSIDE THE AIRCRAFT: behind the pilot, the cramped cockpit of an A-4
Skyhawk single-seat attack jet, 1970s: the metal canopy frame, a dark instrument
coaming with round analogue dials, grey South Atlantic sky through the canopy. Keep
it DARK, SIMPLE and SLIGHTLY BLURRED in big pixel shapes so the face reads first.
The SAME background behind the pilot in every cell.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is STRIP A of THIS SAME MAN, already finished - a reference only. He must
be the same person: same face, same head shape, same hairline, same clothing, same
colours, same line work and dithered shading.
IMAGE 2 is an earlier sheet of THIS SAME MAN IN THE COCKPIT. Copy from it exactly:
the cockpit background, the white flight helmet and hanging oxygen mask, the framing and the head size.

INTENT, and this matters more than any feature below: he is THE AUTHORITY THAT DOES NOT NEED TO MOVE. Solid, unhurried, has seen all of this
before and is not surprised by any of it.

CHARACTER, identical in every cell:
Argentine air force squadron leader, forties. The WIDEST face of the cast: broad and
square, straight heavy jaw. Fair weathered skin. THICK SILVER-GREY HAIR, plenty of
it, combed back - not balding, not cropped. Heavy grey eyebrows. HEAVILY HOODED
EYES, almost closed, lines at the corners. A grey walrus moustache dropping past the
corners of the mouth. Straight, ordinary-sized nose. Nothing on his head. Brown
leather flight jacket collar at the neck.

IN THE COCKPIT, EVERY CELL: the white flight helmet with the visor up, and the
green oxygen mask unclipped and hanging to one side, so the whole face shows. The
helmet must not hide the eyes or the eyebrows.

EXPRESSIONS, left to right, top row then bottom row - SHEET E, IN THE COCKPIT. Each one as
THIS character would do it, never as a generic face:
Push every expression to the EXTREME - big, exaggerated and unmistakable, like a 90s
arcade cut-in portrait, readable at 108 px. Never subtle, even the quiet ones.
CELL 1 - SURPRISED: eyebrows shot up, eyes wide, mouth a small round O.
CELL 2 - DOUBTFUL: one eyebrow high and one low, eyes to the side, mouth pulled hard to one side.
CELL 3 - THINKING: eyes up and to the side, lips pushed out, one eyebrow raised.
CELL 4 - TALKING: the neutral face, mouth open mid-word, eyebrows slightly raised.
CELL 5 - TENDERNESS: soft wet eyes, eyebrows gently up, a small closed-mouth smile - thinking of someone loved.
CELL 6 - FAR AWAY: eyes looking off into the distance at nothing, a faint sad smile, eyebrows up.
CELL 7 - FIGHTING TEARS: chin trembling, lips pressed tight, eyes full of tears, eyebrows pinched up.
CELL 8 - SAD SMILE: eyebrows up in the middle, eyes wet, the mouth smiling anyway.
CELL 9 - PROUD: chin up high, a firm small smile, eyes bright.
CELL 10 - EXHAUSTED: eyelids almost shut, head drooping, mouth hanging slack - about to fall asleep.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `puma_av_sorpresa puma_av_duda puma_av_pensativo puma_av_hablando puma_av_ternura puma_av_mirada_perdida puma_av_aguanta_llanto puma_av_sonrisa_triste puma_av_orgullo puma_av_agotado`

---

## GITANO

### Tira A

**Adjuntar (chat nuevo):** `final/gitano.png` *(IMAGE 1)* · `final/team.png` *(IMAGE 2)*

```
Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SHEET LAYOUT: a single horizontal strip of SIX SQUARE cells in one row, edge to
edge, no gaps, no borders drawn between them. The finished image is exactly six
times as wide as it is tall. Each cell contains the SAME character as a portrait
bust - chest up, three-quarter view facing slightly LEFT, eyes toward camera.
Identical framing and identical scale in every cell: the head is the same size and
the eyes sit at the same height in all of them. The bottom edge cuts across the
upper chest; arms and hands are outside the frame. Leave a little clear space
above the hair. The ONLY difference between cells is the facial expression.
BUST ONLY: nothing below the upper chest - no legs, no boots, no full bodies, even
if the attached images show full figures.
BACKGROUND: flat neutral mid-grey (about #808080), the same grey behind the figure
in every cell. No scenery, no props, no vignette, no gradient, no shadow cast on the
background.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is this character's finished model sheet. Copy his clothing, his colouring
and his line work exactly, and match its rendering precisely: same line weight,
same shading, same flat mid-grey background.
IMAGE 2 is the full cast line-up. This character is the FIFTH figure. Copy his
build and his face from there. The other seven are the rest of the cast and he must
stay clearly different from every one of them.

INTENT, and this matters more than any feature below: he is SMILING IS HIS RESTING STATE, not a reaction to anything. Which is exactly what
makes cells 3 to 6 land.

CHARACTER, identical in every cell:
Argentine air force pilot, thirties. VERY CURLY VOLUMINOUS BLACK HAIR, tight curls
standing high - the first thing anyone sees of him. Olive-bronze criollo skin. Round
face, high cheekbones, wide mouth, large lively dark eyes, straight broad nose. NOT
of African descent: no afro-textured hair, no sub-Saharan features - he is a
sun-darkened criollo of the Argentine interior. Olive flight suit zipped closed to
the top.

EXPRESSIONS, left to right:
CELL 1 - NEUTRAL: a wide easy open grin, eyes crinkled, head tilted. THIS IS HIS DEFAULT, not a reaction.
CELL 2 - SMILE: head back, mouth wide open in a full laugh, eyes squeezed shut.
CELL 3 - WORRIED: the grin gone, eyebrows up and pinched, eyes wide. On him this reads as alarm because the smile is missing.
CELL 4 - ANGER: completely straight-faced, level eyebrows, flat steady eyes. Really blank - do not let a hint of a smile survive. On this man a blank face is frightening.
CELL 5 - BROKEN: grin completely gone, eyebrows collapsed inward, mouth open, eyes wet.
CELL 6 - THE GRIN COLLAPSING - the hardest cell. His grin caught HALFWAY through falling
  apart: the mouth is still shaped like the smile, the eyes and eyebrows have
  already dropped and gone elsewhere. Half a second of an older, sadder man showing
  through. Do NOT resolve it into either a smile or a sad face.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `gitano_neutro gitano_sonrisa gitano_preocupado gitano_ceno gitano_roto gitano_risa_apagada`

### Tira B

**Adjuntar (chat nuevo), en este orden:** `final/gitano.png` *(IMAGE 1)* · la **Tira A** de este personaje que haya salido bien *(IMAGE 2)*.

```
DRAW A NEW IMAGE FROM SCRATCH. Do NOT return IMAGE 2, do NOT edit it, do NOT repeat
any of its faces. Every cell of the new strip shows one of the NEW expressions
listed below.

Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SHEET LAYOUT: a single horizontal strip of SIX SQUARE cells in one row, edge to
edge, no gaps, no borders drawn between them. The finished image is exactly six
times as wide as it is tall. Each cell contains the SAME character as a portrait
bust - chest up, three-quarter view facing slightly LEFT, eyes toward camera.
Identical framing and identical scale in every cell: the head is the same size and
the eyes sit at the same height in all of them. The bottom edge cuts across the
upper chest; arms and hands are outside the frame. Leave a little clear space
above the hair. The ONLY difference between cells is the facial expression.
BUST ONLY: nothing below the upper chest - no legs, no boots, no full bodies, even
if the attached images show full figures.
BACKGROUND: flat neutral mid-grey (about #808080), the same grey behind the figure
in every cell. No scenery, no props, no vignette, no gradient, no shadow cast on the
background.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is this character's finished model sheet. Copy his clothing, his colouring
and his line work exactly, and match its rendering precisely: same line weight,
same shading, same flat mid-grey background.
IMAGE 2 is STRIP A of THIS SAME MAN, already finished - a reference only. He must be
the same person: same face, same head shape, same hairline, same clothing, same
colours, same grey background, same framing, the head as big in the cell as it is
there. Only the expressions change.

INTENT, and this matters more than any feature below: he is SMILING IS HIS RESTING STATE, not a reaction to anything. Which is exactly what
makes cells 3 to 6 land.

CHARACTER, identical in every cell:
Argentine air force pilot, thirties. VERY CURLY VOLUMINOUS BLACK HAIR, tight curls
standing high - the first thing anyone sees of him. Olive-bronze criollo skin. Round
face, high cheekbones, wide mouth, large lively dark eyes, straight broad nose. NOT
of African descent: no afro-textured hair, no sub-Saharan features - he is a
sun-darkened criollo of the Argentine interior. Olive flight suit zipped closed to
the top.

EXPRESSIONS, left to right - STRIP B, the strong ones. Each one as THIS character
would do it, never as a generic face:
CELL 1 - LAUGHING: a real laugh, mouth wide open, eyes squeezed almost shut, head
  tipped slightly back.
CELL 2 - AFRAID: eyes wide with white showing, eyebrows up and pulled together,
  mouth open and tense.
CELL 3 - SHOUTING IN ANGER: eyebrows hard down, mouth wide open in a shout, teeth
  showing, head pushed forward.
CELL 4 - CRYING: eyebrows high and pinched in the middle, eyes squeezed, mouth turned
  down and trembling, one or two simple pixel tear lines on the cheek.
CELL 5 - RELIEVED: eyes closed, eyebrows relaxed upward, a long breath out, a small
  tired smile, head tilted a little back.
CELL 6 - DETERMINED: eyebrows low and level, eyes narrowed and fixed ahead, jaw set,
  mouth a firm line, head slightly forward.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `gitano_risa gitano_miedo gitano_grito gitano_llanto gitano_alivio gitano_decidido`

### Hoja C — las grandes (grilla 5×2)

**Adjuntar (chat nuevo), en este orden:** `final/gitano.png` *(IMAGE 1)* · la **Tira A** de este personaje que haya salido bien *(IMAGE 2)*.

```
DRAW A NEW IMAGE FROM SCRATCH. Do NOT return IMAGE 2, do NOT edit it, do NOT repeat
any of its faces. Every cell of the new sheet shows one of the NEW expressions
listed below.

Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SHEET LAYOUT: a GRID of TEN SQUARE cells, FIVE columns and TWO rows - exactly two
rows, not three - edge to edge, no gaps, no borders drawn between them. The finished
image is two and a half times as wide as it is tall. Each cell contains the SAME
character as a portrait bust - chest up, three-quarter view facing slightly LEFT,
eyes toward camera. Identical framing and identical scale in every cell: the head is
the same size and the eyes sit at the same height in all of them. The bottom edge
cuts across the upper chest; arms and hands are outside the frame. Leave a little clear space above the head.
The ONLY difference between cells is the facial expression.
BUST ONLY: nothing below the upper chest - no legs, no boots, no full bodies, even
if the attached images show full figures.
BACKGROUND: flat neutral mid-grey (about #808080), the same grey behind the figure
in every cell. No scenery, no props, no vignette, no gradient, no shadow cast on the
background.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is this character's finished model sheet. Copy his clothing, his colouring
and his line work exactly, and match its rendering precisely: same line weight,
same shading, same flat mid-grey background.
IMAGE 2 is STRIP A of THIS SAME MAN, already finished - a reference only. He must be
the same person: same face, same head shape, same hairline, same clothing, same
colours, same grey background, same framing, the head as big in the cell as it is
there. Only the expressions change.

INTENT, and this matters more than any feature below: he is SMILING IS HIS RESTING STATE, not a reaction to anything. Which is exactly what
makes cells 3 to 6 land.

CHARACTER, identical in every cell:
Argentine air force pilot, thirties. VERY CURLY VOLUMINOUS BLACK HAIR, tight curls
standing high - the first thing anyone sees of him. Olive-bronze criollo skin. Round
face, high cheekbones, wide mouth, large lively dark eyes, straight broad nose. NOT
of African descent: no afro-textured hair, no sub-Saharan features - he is a
sun-darkened criollo of the Argentine interior. Olive flight suit zipped closed to
the top.

EXPRESSIONS, left to right, top row then bottom row - SHEET C. Each one as
THIS character would do it, never as a generic face:
Push every expression to the EXTREME - big, exaggerated and unmistakable, like a 90s
arcade cut-in portrait, readable at 108 px. Never subtle, even the quiet ones.
CELL 1 - LAUGHING TILL CRYING: mouth thrown wide open, eyes squeezed shut, tears of laughter flying from the corners, head thrown far back.
CELL 2 - PANIC: eyes huge with tiny pupils, mouth stretched open in a scream, eyebrows at the top of the forehead, sweat drops flying.
CELL 3 - RED WITH RAGE: face flushed dark red, teeth bared and clenched, eyebrows crushed down, a vein bulging on the forehead.
CELL 4 - SOBBING: mouth wide open and wailing, eyebrows high and pinched, eyes shut, streams of tears down both cheeks.
CELL 5 - JAW DROP: mouth hanging enormously open, eyes huge, eyebrows shot up as high as they go.
CELL 6 - DISGUSTED: nose wrinkled hard, upper lip curled up to the nose, eyes squinting, head pulled far back.
CELL 7 - IN SHOCK: frozen, face drained pale, eyes wide and fixed on nothing, mouth slightly open.
CELL 8 - IN PAIN: eyes squeezed shut, teeth clenched, the whole face scrunched to one side.
CELL 9 - EUPHORIC: shouting with joy, mouth wide open, eyes shut, eyebrows up, head tipped back.
CELL 10 - STARTLED: head jerked back, eyes popping, mouth snapped open, shoulders up to the ears.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `gitano_carcajada gitano_panico gitano_furia gitano_llanto gitano_mandibula gitano_asco gitano_shock gitano_dolor gitano_euforia gitano_sobresalto`

### Hoja D — las incómodas y las pícaras (grilla 5×2)

**Adjuntar (chat nuevo), en este orden:** `final/gitano.png` *(IMAGE 1)* · la **Tira A** de este personaje que haya salido bien *(IMAGE 2)*.

```
DRAW A NEW IMAGE FROM SCRATCH. Do NOT return IMAGE 2, do NOT edit it, do NOT repeat
any of its faces. Every cell of the new sheet shows one of the NEW expressions
listed below.

Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SHEET LAYOUT: a GRID of TEN SQUARE cells, FIVE columns and TWO rows - exactly two
rows, not three - edge to edge, no gaps, no borders drawn between them. The finished
image is two and a half times as wide as it is tall. Each cell contains the SAME
character as a portrait bust - chest up, three-quarter view facing slightly LEFT,
eyes toward camera. Identical framing and identical scale in every cell: the head is
the same size and the eyes sit at the same height in all of them. The bottom edge
cuts across the upper chest; arms and hands are outside the frame. Leave a little clear space above the head.
The ONLY difference between cells is the facial expression.
BUST ONLY: nothing below the upper chest - no legs, no boots, no full bodies, even
if the attached images show full figures.
BACKGROUND: flat neutral mid-grey (about #808080), the same grey behind the figure
in every cell. No scenery, no props, no vignette, no gradient, no shadow cast on the
background.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is this character's finished model sheet. Copy his clothing, his colouring
and his line work exactly, and match its rendering precisely: same line weight,
same shading, same flat mid-grey background.
IMAGE 2 is STRIP A of THIS SAME MAN, already finished - a reference only. He must be
the same person: same face, same head shape, same hairline, same clothing, same
colours, same grey background, same framing, the head as big in the cell as it is
there. Only the expressions change.

INTENT, and this matters more than any feature below: he is SMILING IS HIS RESTING STATE, not a reaction to anything. Which is exactly what
makes cells 3 to 6 land.

CHARACTER, identical in every cell:
Argentine air force pilot, thirties. VERY CURLY VOLUMINOUS BLACK HAIR, tight curls
standing high - the first thing anyone sees of him. Olive-bronze criollo skin. Round
face, high cheekbones, wide mouth, large lively dark eyes, straight broad nose. NOT
of African descent: no afro-textured hair, no sub-Saharan features - he is a
sun-darkened criollo of the Argentine interior. Olive flight suit zipped closed to
the top.

EXPRESSIONS, left to right, top row then bottom row - SHEET D. Each one as
THIS character would do it, never as a generic face:
Push every expression to the EXTREME - big, exaggerated and unmistakable, like a 90s
arcade cut-in portrait, readable at 108 px. Never subtle, even the quiet ones.
CELL 1 - AWKWARD: head perfectly still, eyes sliding sideways toward the camera, lips pressed together and pulled to one side in a tight uneasy half-smile - caught in an uncomfortable moment.
CELL 2 - HOLDING IN A LAUGH: cheeks puffed out, lips pressed tight and wobbling, eyes crinkled and watering.
CELL 3 - "REALLY?": a totally flat deadpan face, eyelids half down, eyebrows level, staring straight at the camera.
CELL 4 - SUSPICIOUS SIDE-EYE: head turned away, eyes sliding hard to the side, one eyebrow down, mouth flat.
CELL 5 - GRIMACE: teeth clenched and showing in a wide stiff line, eyebrows up, eyes wide - "uh oh".
CELL 6 - SMUG: chin up, eyelids half down, a slow one-sided smirk, one eyebrow raised high.
CELL 7 - EYE ROLL: eyes rolled all the way up, eyelids half down, mouth twisted to one side.
CELL 8 - WINK: one eye shut tight, a big cheeky half-smile.
CELL 9 - TONGUE OUT: tongue stuck far out in a teasing face, eyes squinting playfully.
CELL 10 - NERVOUS LAUGH: a huge forced smile, eyebrows up and apart, eyes darting, big drops of sweat on the temple.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `gitano_incomodo gitano_aguanta_risa gitano_en_serio gitano_de_reojo gitano_yikes gitano_sobrador gitano_ojos_blanco gitano_guino gitano_lengua gitano_risa_nerviosa`

### Hoja E — las de todos los días y las profundas (grilla 5×2)

**Adjuntar (chat nuevo), en este orden:** `final/gitano.png` *(IMAGE 1)* · la **Tira A** de este personaje que haya salido bien *(IMAGE 2)*.

```
DRAW A NEW IMAGE FROM SCRATCH. Do NOT return IMAGE 2, do NOT edit it, do NOT repeat
any of its faces. Every cell of the new sheet shows one of the NEW expressions
listed below.

Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SHEET LAYOUT: a GRID of TEN SQUARE cells, FIVE columns and TWO rows - exactly two
rows, not three - edge to edge, no gaps, no borders drawn between them. The finished
image is two and a half times as wide as it is tall. Each cell contains the SAME
character as a portrait bust - chest up, three-quarter view facing slightly LEFT,
eyes toward camera. Identical framing and identical scale in every cell: the head is
the same size and the eyes sit at the same height in all of them. The bottom edge
cuts across the upper chest; arms and hands are outside the frame. Leave a little clear space above the head.
The ONLY difference between cells is the facial expression.
BUST ONLY: nothing below the upper chest - no legs, no boots, no full bodies, even
if the attached images show full figures.
BACKGROUND: flat neutral mid-grey (about #808080), the same grey behind the figure
in every cell. No scenery, no props, no vignette, no gradient, no shadow cast on the
background.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is this character's finished model sheet. Copy his clothing, his colouring
and his line work exactly, and match its rendering precisely: same line weight,
same shading, same flat mid-grey background.
IMAGE 2 is STRIP A of THIS SAME MAN, already finished - a reference only. He must be
the same person: same face, same head shape, same hairline, same clothing, same
colours, same grey background, same framing, the head as big in the cell as it is
there. Only the expressions change.

INTENT, and this matters more than any feature below: he is SMILING IS HIS RESTING STATE, not a reaction to anything. Which is exactly what
makes cells 3 to 6 land.

CHARACTER, identical in every cell:
Argentine air force pilot, thirties. VERY CURLY VOLUMINOUS BLACK HAIR, tight curls
standing high - the first thing anyone sees of him. Olive-bronze criollo skin. Round
face, high cheekbones, wide mouth, large lively dark eyes, straight broad nose. NOT
of African descent: no afro-textured hair, no sub-Saharan features - he is a
sun-darkened criollo of the Argentine interior. Olive flight suit zipped closed to
the top.

EXPRESSIONS, left to right, top row then bottom row - SHEET E. Each one as
THIS character would do it, never as a generic face:
Push every expression to the EXTREME - big, exaggerated and unmistakable, like a 90s
arcade cut-in portrait, readable at 108 px. Never subtle, even the quiet ones.
CELL 1 - SURPRISED: eyebrows shot up, eyes wide, mouth a small round O.
CELL 2 - DOUBTFUL: one eyebrow high and one low, eyes to the side, mouth pulled hard to one side.
CELL 3 - THINKING: eyes up and to the side, lips pushed out, one eyebrow raised.
CELL 4 - TALKING: the neutral face, mouth open mid-word, eyebrows slightly raised.
CELL 5 - TENDERNESS: soft wet eyes, eyebrows gently up, a small closed-mouth smile - thinking of someone loved.
CELL 6 - FAR AWAY: eyes looking off into the distance at nothing, a faint sad smile, eyebrows up.
CELL 7 - FIGHTING TEARS: chin trembling, lips pressed tight, eyes full of tears, eyebrows pinched up.
CELL 8 - SAD SMILE: eyebrows up in the middle, eyes wet, the mouth smiling anyway.
CELL 9 - PROUD: chin up high, a firm small smile, eyes bright.
CELL 10 - EXHAUSTED: eyelids almost shut, head drooping, mouth hanging slack - about to fall asleep.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `gitano_sorpresa gitano_duda gitano_pensativo gitano_hablando gitano_ternura gitano_mirada_perdida gitano_aguanta_llanto gitano_sonrisa_triste gitano_orgullo gitano_agotado`

### EN EL AVIÓN — las mismas tres hojas, con fondo de cabina

### Hoja C · en el avión — las grandes (grilla 5×2)

**Adjuntar (chat nuevo), en este orden:** `final/gitano.png` *(IMAGE 1)* · la **Tira A** de este personaje que haya salido bien *(IMAGE 2)*.

```
DRAW A NEW IMAGE FROM SCRATCH. Do NOT return IMAGE 2, do NOT edit it, do NOT repeat
any of its faces. Every cell of the new sheet shows one of the NEW expressions
listed below.

Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SHEET LAYOUT: a GRID of TEN SQUARE cells, FIVE columns and TWO rows - exactly two
rows, not three - edge to edge, no gaps, no borders drawn between them. The finished
image is two and a half times as wide as it is tall. Each cell contains the SAME
character as a portrait bust - chest up, three-quarter view facing slightly LEFT,
eyes toward camera. Identical framing and identical scale in every cell: the head is
the same size and the eyes sit at the same height in all of them. The bottom edge
cuts across the upper chest; arms and hands are outside the frame. Leave a little clear space above the head.
The ONLY difference between cells is the facial expression.
BUST ONLY: nothing below the upper chest - no legs, no boots, no full bodies, even
if the attached images show full figures.
BACKGROUND - INSIDE THE AIRCRAFT: behind the pilot, the cramped cockpit of an A-4
Skyhawk single-seat attack jet, 1970s: the metal canopy frame, a dark instrument
coaming with round analogue dials, grey South Atlantic sky through the canopy. Keep
it DARK, SIMPLE and SLIGHTLY BLURRED in big pixel shapes so the face reads first.
The SAME background behind the pilot in every cell.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is this character's finished model sheet. Copy his clothing, his colouring
and his line work exactly, and match its rendering precisely: same line weight,
same shading, same flat mid-grey background.
IMAGE 2 is STRIP A of THIS SAME MAN, already finished - a reference only. He must be
the same person: same face, same head shape, same hairline, same clothing, same
colours, same framing, the head as big in the cell as it is
there. Only the expressions change.

INTENT, and this matters more than any feature below: he is SMILING IS HIS RESTING STATE, not a reaction to anything. Which is exactly what
makes cells 3 to 6 land.

CHARACTER, identical in every cell:
Argentine air force pilot, thirties. VERY CURLY VOLUMINOUS BLACK HAIR, tight curls
standing high - the first thing anyone sees of him. Olive-bronze criollo skin. Round
face, high cheekbones, wide mouth, large lively dark eyes, straight broad nose. NOT
of African descent: no afro-textured hair, no sub-Saharan features - he is a
sun-darkened criollo of the Argentine interior. Olive flight suit zipped closed to
the top.

IN THE COCKPIT, EVERY CELL: the white flight helmet with the visor up, and the
green oxygen mask unclipped and hanging to one side, so the whole face shows. The
helmet must not hide the eyes or the eyebrows.

EXPRESSIONS, left to right, top row then bottom row - SHEET C, IN THE COCKPIT. Each one as
THIS character would do it, never as a generic face:
Push every expression to the EXTREME - big, exaggerated and unmistakable, like a 90s
arcade cut-in portrait, readable at 108 px. Never subtle, even the quiet ones.
CELL 1 - LAUGHING TILL CRYING: mouth thrown wide open, eyes squeezed shut, tears of laughter flying from the corners, head thrown far back.
CELL 2 - PANIC: eyes huge with tiny pupils, mouth stretched open in a scream, eyebrows at the top of the forehead, sweat drops flying.
CELL 3 - RED WITH RAGE: face flushed dark red, teeth bared and clenched, eyebrows crushed down, a vein bulging on the forehead.
CELL 4 - SOBBING: mouth wide open and wailing, eyebrows high and pinched, eyes shut, streams of tears down both cheeks.
CELL 5 - JAW DROP: mouth hanging enormously open, eyes huge, eyebrows shot up as high as they go.
CELL 6 - DISGUSTED: nose wrinkled hard, upper lip curled up to the nose, eyes squinting, head pulled far back.
CELL 7 - IN SHOCK: frozen, face drained pale, eyes wide and fixed on nothing, mouth slightly open.
CELL 8 - IN PAIN: eyes squeezed shut, teeth clenched, the whole face scrunched to one side.
CELL 9 - EUPHORIC: shouting with joy, mouth wide open, eyes shut, eyebrows up, head tipped back.
CELL 10 - STARTLED: head jerked back, eyes popping, mouth snapped open, shoulders up to the ears.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `gitano_av_carcajada gitano_av_panico gitano_av_furia gitano_av_llanto gitano_av_mandibula gitano_av_asco gitano_av_shock gitano_av_dolor gitano_av_euforia gitano_av_sobresalto`

### Hoja D · en el avión — las incómodas y las pícaras (grilla 5×2)

**Adjuntar (chat nuevo), en este orden:** la **Tira A** *(IMAGE 1)* · la **hoja C en el avión** de este personaje que haya salido bien *(IMAGE 2)*.

```
DRAW A NEW IMAGE FROM SCRATCH. Do NOT return IMAGE 2, do NOT edit it, do NOT repeat
any of its faces. Every cell of the new sheet shows one of the NEW expressions
listed below.

Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SHEET LAYOUT: a GRID of TEN SQUARE cells, FIVE columns and TWO rows - exactly two
rows, not three - edge to edge, no gaps, no borders drawn between them. The finished
image is two and a half times as wide as it is tall. Each cell contains the SAME
character as a portrait bust - chest up, three-quarter view facing slightly LEFT,
eyes toward camera. Identical framing and identical scale in every cell: the head is
the same size and the eyes sit at the same height in all of them. The bottom edge
cuts across the upper chest; arms and hands are outside the frame. Leave a little clear space above the head.
The ONLY difference between cells is the facial expression.
BUST ONLY: nothing below the upper chest - no legs, no boots, no full bodies, even
if the attached images show full figures.
BACKGROUND - INSIDE THE AIRCRAFT: behind the pilot, the cramped cockpit of an A-4
Skyhawk single-seat attack jet, 1970s: the metal canopy frame, a dark instrument
coaming with round analogue dials, grey South Atlantic sky through the canopy. Keep
it DARK, SIMPLE and SLIGHTLY BLURRED in big pixel shapes so the face reads first.
The SAME background behind the pilot in every cell.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is STRIP A of THIS SAME MAN, already finished - a reference only. He must
be the same person: same face, same head shape, same hairline, same clothing, same
colours, same line work and dithered shading.
IMAGE 2 is an earlier sheet of THIS SAME MAN IN THE COCKPIT. Copy from it exactly:
the cockpit background, the white flight helmet and hanging oxygen mask, the framing and the head size.

INTENT, and this matters more than any feature below: he is SMILING IS HIS RESTING STATE, not a reaction to anything. Which is exactly what
makes cells 3 to 6 land.

CHARACTER, identical in every cell:
Argentine air force pilot, thirties. VERY CURLY VOLUMINOUS BLACK HAIR, tight curls
standing high - the first thing anyone sees of him. Olive-bronze criollo skin. Round
face, high cheekbones, wide mouth, large lively dark eyes, straight broad nose. NOT
of African descent: no afro-textured hair, no sub-Saharan features - he is a
sun-darkened criollo of the Argentine interior. Olive flight suit zipped closed to
the top.

IN THE COCKPIT, EVERY CELL: the white flight helmet with the visor up, and the
green oxygen mask unclipped and hanging to one side, so the whole face shows. The
helmet must not hide the eyes or the eyebrows.

EXPRESSIONS, left to right, top row then bottom row - SHEET D, IN THE COCKPIT. Each one as
THIS character would do it, never as a generic face:
Push every expression to the EXTREME - big, exaggerated and unmistakable, like a 90s
arcade cut-in portrait, readable at 108 px. Never subtle, even the quiet ones.
CELL 1 - AWKWARD: head perfectly still, eyes sliding sideways toward the camera, lips pressed together and pulled to one side in a tight uneasy half-smile - caught in an uncomfortable moment.
CELL 2 - HOLDING IN A LAUGH: cheeks puffed out, lips pressed tight and wobbling, eyes crinkled and watering.
CELL 3 - "REALLY?": a totally flat deadpan face, eyelids half down, eyebrows level, staring straight at the camera.
CELL 4 - SUSPICIOUS SIDE-EYE: head turned away, eyes sliding hard to the side, one eyebrow down, mouth flat.
CELL 5 - GRIMACE: teeth clenched and showing in a wide stiff line, eyebrows up, eyes wide - "uh oh".
CELL 6 - SMUG: chin up, eyelids half down, a slow one-sided smirk, one eyebrow raised high.
CELL 7 - EYE ROLL: eyes rolled all the way up, eyelids half down, mouth twisted to one side.
CELL 8 - WINK: one eye shut tight, a big cheeky half-smile.
CELL 9 - TONGUE OUT: tongue stuck far out in a teasing face, eyes squinting playfully.
CELL 10 - NERVOUS LAUGH: a huge forced smile, eyebrows up and apart, eyes darting, big drops of sweat on the temple.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `gitano_av_incomodo gitano_av_aguanta_risa gitano_av_en_serio gitano_av_de_reojo gitano_av_yikes gitano_av_sobrador gitano_av_ojos_blanco gitano_av_guino gitano_av_lengua gitano_av_risa_nerviosa`

### Hoja E · en el avión — las de todos los días y las profundas (grilla 5×2)

**Adjuntar (chat nuevo), en este orden:** la **Tira A** *(IMAGE 1)* · la **hoja C en el avión** de este personaje que haya salido bien *(IMAGE 2)*.

```
DRAW A NEW IMAGE FROM SCRATCH. Do NOT return IMAGE 2, do NOT edit it, do NOT repeat
any of its faces. Every cell of the new sheet shows one of the NEW expressions
listed below.

Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SHEET LAYOUT: a GRID of TEN SQUARE cells, FIVE columns and TWO rows - exactly two
rows, not three - edge to edge, no gaps, no borders drawn between them. The finished
image is two and a half times as wide as it is tall. Each cell contains the SAME
character as a portrait bust - chest up, three-quarter view facing slightly LEFT,
eyes toward camera. Identical framing and identical scale in every cell: the head is
the same size and the eyes sit at the same height in all of them. The bottom edge
cuts across the upper chest; arms and hands are outside the frame. Leave a little clear space above the head.
The ONLY difference between cells is the facial expression.
BUST ONLY: nothing below the upper chest - no legs, no boots, no full bodies, even
if the attached images show full figures.
BACKGROUND - INSIDE THE AIRCRAFT: behind the pilot, the cramped cockpit of an A-4
Skyhawk single-seat attack jet, 1970s: the metal canopy frame, a dark instrument
coaming with round analogue dials, grey South Atlantic sky through the canopy. Keep
it DARK, SIMPLE and SLIGHTLY BLURRED in big pixel shapes so the face reads first.
The SAME background behind the pilot in every cell.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is STRIP A of THIS SAME MAN, already finished - a reference only. He must
be the same person: same face, same head shape, same hairline, same clothing, same
colours, same line work and dithered shading.
IMAGE 2 is an earlier sheet of THIS SAME MAN IN THE COCKPIT. Copy from it exactly:
the cockpit background, the white flight helmet and hanging oxygen mask, the framing and the head size.

INTENT, and this matters more than any feature below: he is SMILING IS HIS RESTING STATE, not a reaction to anything. Which is exactly what
makes cells 3 to 6 land.

CHARACTER, identical in every cell:
Argentine air force pilot, thirties. VERY CURLY VOLUMINOUS BLACK HAIR, tight curls
standing high - the first thing anyone sees of him. Olive-bronze criollo skin. Round
face, high cheekbones, wide mouth, large lively dark eyes, straight broad nose. NOT
of African descent: no afro-textured hair, no sub-Saharan features - he is a
sun-darkened criollo of the Argentine interior. Olive flight suit zipped closed to
the top.

IN THE COCKPIT, EVERY CELL: the white flight helmet with the visor up, and the
green oxygen mask unclipped and hanging to one side, so the whole face shows. The
helmet must not hide the eyes or the eyebrows.

EXPRESSIONS, left to right, top row then bottom row - SHEET E, IN THE COCKPIT. Each one as
THIS character would do it, never as a generic face:
Push every expression to the EXTREME - big, exaggerated and unmistakable, like a 90s
arcade cut-in portrait, readable at 108 px. Never subtle, even the quiet ones.
CELL 1 - SURPRISED: eyebrows shot up, eyes wide, mouth a small round O.
CELL 2 - DOUBTFUL: one eyebrow high and one low, eyes to the side, mouth pulled hard to one side.
CELL 3 - THINKING: eyes up and to the side, lips pushed out, one eyebrow raised.
CELL 4 - TALKING: the neutral face, mouth open mid-word, eyebrows slightly raised.
CELL 5 - TENDERNESS: soft wet eyes, eyebrows gently up, a small closed-mouth smile - thinking of someone loved.
CELL 6 - FAR AWAY: eyes looking off into the distance at nothing, a faint sad smile, eyebrows up.
CELL 7 - FIGHTING TEARS: chin trembling, lips pressed tight, eyes full of tears, eyebrows pinched up.
CELL 8 - SAD SMILE: eyebrows up in the middle, eyes wet, the mouth smiling anyway.
CELL 9 - PROUD: chin up high, a firm small smile, eyes bright.
CELL 10 - EXHAUSTED: eyelids almost shut, head drooping, mouth hanging slack - about to fall asleep.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `gitano_av_sorpresa gitano_av_duda gitano_av_pensativo gitano_av_hablando gitano_av_ternura gitano_av_mirada_perdida gitano_av_aguanta_llanto gitano_av_sonrisa_triste gitano_av_orgullo gitano_av_agotado`

---

## VASCO

### Tira A

**Adjuntar (chat nuevo):** `final/vasco2.png` *(IMAGE 1)* · `final/team.png` *(IMAGE 2)*

```
Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SHEET LAYOUT: a single horizontal strip of SIX SQUARE cells in one row, edge to
edge, no gaps, no borders drawn between them. The finished image is exactly six
times as wide as it is tall. Each cell contains the SAME character as a portrait
bust - chest up, three-quarter view facing slightly LEFT, eyes toward camera.
Identical framing and identical scale in every cell: the head is the same size and
the eyes sit at the same height in all of them. The bottom edge cuts across the
upper chest; arms and hands are outside the frame. Leave a little clear space
above the hair. The ONLY difference between cells is the facial expression.
BUST ONLY: nothing below the upper chest - no legs, no boots, no full bodies, even
if the attached images show full figures.
BACKGROUND: flat neutral mid-grey (about #808080), the same grey behind the figure
in every cell. No scenery, no props, no vignette, no gradient, no shadow cast on the
background.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is this character's finished model sheet. Copy his clothing, his colouring
and his line work exactly, and match its rendering precisely: same line weight,
same shading, same flat mid-grey background.
IMAGE 2 is the full cast line-up. This character is the EIGHTH AND LAST, on the far right, the tallest figure. Copy his
build and his face from there. The other seven are the rest of the cast and he must
stay clearly different from every one of them.

INTENT, and this matters more than any feature below: he is A RETIRED MAFIOSO, OR A VAMPIRE: pale, still, quietly dangerous. Nothing warm.
He is NOT the gaunt sad pilot who also has dark hair - that one is kind and tired,
this one is cold.

CHARACTER, identical in every cell:
Argentine air force pilot of Basque descent, thirties. THE PALEST SKIN OF THE CAST.
Long angular face, very pronounced square jaw, high cheekbones. JET-BLACK HAIR
combed straight back with volume on top - NO grey anywhere. Straight heavy black
eyebrows. A LARGE straight nose. Deep-set light eyes with a fixed hard stare. A thin
mouth held in a straight line. Olive flight suit zipped to the chin, a large silver
crucifix on a red cord outside the collar.

EXPRESSIONS, left to right:
CELL 1 - NEUTRAL: shut. Mouth closed, eyes lowered a fraction, level eyebrows. Gives nothing away.
CELL 2 - SMILE: the smallest possible change: one corner of the mouth barely lifted. He is not smiling, he is ALMOST smiling.
CELL 3 - WORRIED: eyes slightly wider, eyebrows level still. Even his worry is contained.
CELL 4 - ANGER: jaw set hard, eyebrows down, the stare gone from cold to furious. The only cell where he shows heat.
CELL 5 - BROKEN: eyes closed, head lowered. Grief held completely still.
CELL 6 - IN PRAYER - eyes closed, head bowed a little, mouth moving on a word. The one
  moment where the stillness is devotion instead of threat.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `vasco_neutro vasco_sonrisa vasco_preocupado vasco_ceno vasco_roto vasco_rezo`

### Tira B

**Adjuntar (chat nuevo), en este orden:** `final/vasco2.png` *(IMAGE 1)* · la **Tira A** de este personaje que haya salido bien *(IMAGE 2)*.

```
DRAW A NEW IMAGE FROM SCRATCH. Do NOT return IMAGE 2, do NOT edit it, do NOT repeat
any of its faces. Every cell of the new strip shows one of the NEW expressions
listed below.

Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SHEET LAYOUT: a single horizontal strip of SIX SQUARE cells in one row, edge to
edge, no gaps, no borders drawn between them. The finished image is exactly six
times as wide as it is tall. Each cell contains the SAME character as a portrait
bust - chest up, three-quarter view facing slightly LEFT, eyes toward camera.
Identical framing and identical scale in every cell: the head is the same size and
the eyes sit at the same height in all of them. The bottom edge cuts across the
upper chest; arms and hands are outside the frame. Leave a little clear space
above the hair. The ONLY difference between cells is the facial expression.
BUST ONLY: nothing below the upper chest - no legs, no boots, no full bodies, even
if the attached images show full figures.
BACKGROUND: flat neutral mid-grey (about #808080), the same grey behind the figure
in every cell. No scenery, no props, no vignette, no gradient, no shadow cast on the
background.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is this character's finished model sheet. Copy his clothing, his colouring
and his line work exactly, and match its rendering precisely: same line weight,
same shading, same flat mid-grey background.
IMAGE 2 is STRIP A of THIS SAME MAN, already finished - a reference only. He must be
the same person: same face, same head shape, same hairline, same clothing, same
colours, same grey background, same framing, the head as big in the cell as it is
there. Only the expressions change.

INTENT, and this matters more than any feature below: he is A RETIRED MAFIOSO, OR A VAMPIRE: pale, still, quietly dangerous. Nothing warm.
He is NOT the gaunt sad pilot who also has dark hair - that one is kind and tired,
this one is cold.

CHARACTER, identical in every cell:
Argentine air force pilot of Basque descent, thirties. THE PALEST SKIN OF THE CAST.
Long angular face, very pronounced square jaw, high cheekbones. JET-BLACK HAIR
combed straight back with volume on top - NO grey anywhere. Straight heavy black
eyebrows. A LARGE straight nose. Deep-set light eyes with a fixed hard stare. A thin
mouth held in a straight line. Olive flight suit zipped to the chin, a large silver
crucifix on a red cord outside the collar.

EXPRESSIONS, left to right - STRIP B, the strong ones. Each one as THIS character
would do it, never as a generic face:
CELL 1 - LAUGHING: a real laugh, mouth wide open, eyes squeezed almost shut, head
  tipped slightly back.
CELL 2 - AFRAID: eyes wide with white showing, eyebrows up and pulled together,
  mouth open and tense.
CELL 3 - SHOUTING IN ANGER: eyebrows hard down, mouth wide open in a shout, teeth
  showing, head pushed forward.
CELL 4 - CRYING: eyebrows high and pinched in the middle, eyes squeezed, mouth turned
  down and trembling, one or two simple pixel tear lines on the cheek.
CELL 5 - RELIEVED: eyes closed, eyebrows relaxed upward, a long breath out, a small
  tired smile, head tilted a little back.
CELL 6 - DETERMINED: eyebrows low and level, eyes narrowed and fixed ahead, jaw set,
  mouth a firm line, head slightly forward.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `vasco_risa vasco_miedo vasco_grito vasco_llanto vasco_alivio vasco_decidido`

### Hoja C — las grandes (grilla 5×2)

**Adjuntar (chat nuevo), en este orden:** `final/vasco2.png` *(IMAGE 1)* · la **Tira A** de este personaje que haya salido bien *(IMAGE 2)*.

```
DRAW A NEW IMAGE FROM SCRATCH. Do NOT return IMAGE 2, do NOT edit it, do NOT repeat
any of its faces. Every cell of the new sheet shows one of the NEW expressions
listed below.

Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SHEET LAYOUT: a GRID of TEN SQUARE cells, FIVE columns and TWO rows - exactly two
rows, not three - edge to edge, no gaps, no borders drawn between them. The finished
image is two and a half times as wide as it is tall. Each cell contains the SAME
character as a portrait bust - chest up, three-quarter view facing slightly LEFT,
eyes toward camera. Identical framing and identical scale in every cell: the head is
the same size and the eyes sit at the same height in all of them. The bottom edge
cuts across the upper chest; arms and hands are outside the frame. Leave a little clear space above the head.
The ONLY difference between cells is the facial expression.
BUST ONLY: nothing below the upper chest - no legs, no boots, no full bodies, even
if the attached images show full figures.
BACKGROUND: flat neutral mid-grey (about #808080), the same grey behind the figure
in every cell. No scenery, no props, no vignette, no gradient, no shadow cast on the
background.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is this character's finished model sheet. Copy his clothing, his colouring
and his line work exactly, and match its rendering precisely: same line weight,
same shading, same flat mid-grey background.
IMAGE 2 is STRIP A of THIS SAME MAN, already finished - a reference only. He must be
the same person: same face, same head shape, same hairline, same clothing, same
colours, same grey background, same framing, the head as big in the cell as it is
there. Only the expressions change.

INTENT, and this matters more than any feature below: he is A RETIRED MAFIOSO, OR A VAMPIRE: pale, still, quietly dangerous. Nothing warm.
He is NOT the gaunt sad pilot who also has dark hair - that one is kind and tired,
this one is cold.

CHARACTER, identical in every cell:
Argentine air force pilot of Basque descent, thirties. THE PALEST SKIN OF THE CAST.
Long angular face, very pronounced square jaw, high cheekbones. JET-BLACK HAIR
combed straight back with volume on top - NO grey anywhere. Straight heavy black
eyebrows. A LARGE straight nose. Deep-set light eyes with a fixed hard stare. A thin
mouth held in a straight line. Olive flight suit zipped to the chin, a large silver
crucifix on a red cord outside the collar.

EXPRESSIONS, left to right, top row then bottom row - SHEET C. Each one as
THIS character would do it, never as a generic face:
Push every expression to the EXTREME - big, exaggerated and unmistakable, like a 90s
arcade cut-in portrait, readable at 108 px. Never subtle, even the quiet ones.
CELL 1 - LAUGHING TILL CRYING: mouth thrown wide open, eyes squeezed shut, tears of laughter flying from the corners, head thrown far back.
CELL 2 - PANIC: eyes huge with tiny pupils, mouth stretched open in a scream, eyebrows at the top of the forehead, sweat drops flying.
CELL 3 - RED WITH RAGE: face flushed dark red, teeth bared and clenched, eyebrows crushed down, a vein bulging on the forehead.
CELL 4 - SOBBING: mouth wide open and wailing, eyebrows high and pinched, eyes shut, streams of tears down both cheeks.
CELL 5 - JAW DROP: mouth hanging enormously open, eyes huge, eyebrows shot up as high as they go.
CELL 6 - DISGUSTED: nose wrinkled hard, upper lip curled up to the nose, eyes squinting, head pulled far back.
CELL 7 - IN SHOCK: frozen, face drained pale, eyes wide and fixed on nothing, mouth slightly open.
CELL 8 - IN PAIN: eyes squeezed shut, teeth clenched, the whole face scrunched to one side.
CELL 9 - EUPHORIC: shouting with joy, mouth wide open, eyes shut, eyebrows up, head tipped back.
CELL 10 - STARTLED: head jerked back, eyes popping, mouth snapped open, shoulders up to the ears.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `vasco_carcajada vasco_panico vasco_furia vasco_llanto vasco_mandibula vasco_asco vasco_shock vasco_dolor vasco_euforia vasco_sobresalto`

### Hoja D — las incómodas y las pícaras (grilla 5×2)

**Adjuntar (chat nuevo), en este orden:** `final/vasco2.png` *(IMAGE 1)* · la **Tira A** de este personaje que haya salido bien *(IMAGE 2)*.

```
DRAW A NEW IMAGE FROM SCRATCH. Do NOT return IMAGE 2, do NOT edit it, do NOT repeat
any of its faces. Every cell of the new sheet shows one of the NEW expressions
listed below.

Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SHEET LAYOUT: a GRID of TEN SQUARE cells, FIVE columns and TWO rows - exactly two
rows, not three - edge to edge, no gaps, no borders drawn between them. The finished
image is two and a half times as wide as it is tall. Each cell contains the SAME
character as a portrait bust - chest up, three-quarter view facing slightly LEFT,
eyes toward camera. Identical framing and identical scale in every cell: the head is
the same size and the eyes sit at the same height in all of them. The bottom edge
cuts across the upper chest; arms and hands are outside the frame. Leave a little clear space above the head.
The ONLY difference between cells is the facial expression.
BUST ONLY: nothing below the upper chest - no legs, no boots, no full bodies, even
if the attached images show full figures.
BACKGROUND: flat neutral mid-grey (about #808080), the same grey behind the figure
in every cell. No scenery, no props, no vignette, no gradient, no shadow cast on the
background.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is this character's finished model sheet. Copy his clothing, his colouring
and his line work exactly, and match its rendering precisely: same line weight,
same shading, same flat mid-grey background.
IMAGE 2 is STRIP A of THIS SAME MAN, already finished - a reference only. He must be
the same person: same face, same head shape, same hairline, same clothing, same
colours, same grey background, same framing, the head as big in the cell as it is
there. Only the expressions change.

INTENT, and this matters more than any feature below: he is A RETIRED MAFIOSO, OR A VAMPIRE: pale, still, quietly dangerous. Nothing warm.
He is NOT the gaunt sad pilot who also has dark hair - that one is kind and tired,
this one is cold.

CHARACTER, identical in every cell:
Argentine air force pilot of Basque descent, thirties. THE PALEST SKIN OF THE CAST.
Long angular face, very pronounced square jaw, high cheekbones. JET-BLACK HAIR
combed straight back with volume on top - NO grey anywhere. Straight heavy black
eyebrows. A LARGE straight nose. Deep-set light eyes with a fixed hard stare. A thin
mouth held in a straight line. Olive flight suit zipped to the chin, a large silver
crucifix on a red cord outside the collar.

EXPRESSIONS, left to right, top row then bottom row - SHEET D. Each one as
THIS character would do it, never as a generic face:
Push every expression to the EXTREME - big, exaggerated and unmistakable, like a 90s
arcade cut-in portrait, readable at 108 px. Never subtle, even the quiet ones.
CELL 1 - AWKWARD: head perfectly still, eyes sliding sideways toward the camera, lips pressed together and pulled to one side in a tight uneasy half-smile - caught in an uncomfortable moment.
CELL 2 - HOLDING IN A LAUGH: cheeks puffed out, lips pressed tight and wobbling, eyes crinkled and watering.
CELL 3 - "REALLY?": a totally flat deadpan face, eyelids half down, eyebrows level, staring straight at the camera.
CELL 4 - SUSPICIOUS SIDE-EYE: head turned away, eyes sliding hard to the side, one eyebrow down, mouth flat.
CELL 5 - GRIMACE: teeth clenched and showing in a wide stiff line, eyebrows up, eyes wide - "uh oh".
CELL 6 - SMUG: chin up, eyelids half down, a slow one-sided smirk, one eyebrow raised high.
CELL 7 - EYE ROLL: eyes rolled all the way up, eyelids half down, mouth twisted to one side.
CELL 8 - WINK: one eye shut tight, a big cheeky half-smile.
CELL 9 - TONGUE OUT: tongue stuck far out in a teasing face, eyes squinting playfully.
CELL 10 - NERVOUS LAUGH: a huge forced smile, eyebrows up and apart, eyes darting, big drops of sweat on the temple.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `vasco_incomodo vasco_aguanta_risa vasco_en_serio vasco_de_reojo vasco_yikes vasco_sobrador vasco_ojos_blanco vasco_guino vasco_lengua vasco_risa_nerviosa`

### Hoja E — las de todos los días y las profundas (grilla 5×2)

**Adjuntar (chat nuevo), en este orden:** `final/vasco2.png` *(IMAGE 1)* · la **Tira A** de este personaje que haya salido bien *(IMAGE 2)*.

```
DRAW A NEW IMAGE FROM SCRATCH. Do NOT return IMAGE 2, do NOT edit it, do NOT repeat
any of its faces. Every cell of the new sheet shows one of the NEW expressions
listed below.

Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SHEET LAYOUT: a GRID of TEN SQUARE cells, FIVE columns and TWO rows - exactly two
rows, not three - edge to edge, no gaps, no borders drawn between them. The finished
image is two and a half times as wide as it is tall. Each cell contains the SAME
character as a portrait bust - chest up, three-quarter view facing slightly LEFT,
eyes toward camera. Identical framing and identical scale in every cell: the head is
the same size and the eyes sit at the same height in all of them. The bottom edge
cuts across the upper chest; arms and hands are outside the frame. Leave a little clear space above the head.
The ONLY difference between cells is the facial expression.
BUST ONLY: nothing below the upper chest - no legs, no boots, no full bodies, even
if the attached images show full figures.
BACKGROUND: flat neutral mid-grey (about #808080), the same grey behind the figure
in every cell. No scenery, no props, no vignette, no gradient, no shadow cast on the
background.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is this character's finished model sheet. Copy his clothing, his colouring
and his line work exactly, and match its rendering precisely: same line weight,
same shading, same flat mid-grey background.
IMAGE 2 is STRIP A of THIS SAME MAN, already finished - a reference only. He must be
the same person: same face, same head shape, same hairline, same clothing, same
colours, same grey background, same framing, the head as big in the cell as it is
there. Only the expressions change.

INTENT, and this matters more than any feature below: he is A RETIRED MAFIOSO, OR A VAMPIRE: pale, still, quietly dangerous. Nothing warm.
He is NOT the gaunt sad pilot who also has dark hair - that one is kind and tired,
this one is cold.

CHARACTER, identical in every cell:
Argentine air force pilot of Basque descent, thirties. THE PALEST SKIN OF THE CAST.
Long angular face, very pronounced square jaw, high cheekbones. JET-BLACK HAIR
combed straight back with volume on top - NO grey anywhere. Straight heavy black
eyebrows. A LARGE straight nose. Deep-set light eyes with a fixed hard stare. A thin
mouth held in a straight line. Olive flight suit zipped to the chin, a large silver
crucifix on a red cord outside the collar.

EXPRESSIONS, left to right, top row then bottom row - SHEET E. Each one as
THIS character would do it, never as a generic face:
Push every expression to the EXTREME - big, exaggerated and unmistakable, like a 90s
arcade cut-in portrait, readable at 108 px. Never subtle, even the quiet ones.
CELL 1 - SURPRISED: eyebrows shot up, eyes wide, mouth a small round O.
CELL 2 - DOUBTFUL: one eyebrow high and one low, eyes to the side, mouth pulled hard to one side.
CELL 3 - THINKING: eyes up and to the side, lips pushed out, one eyebrow raised.
CELL 4 - TALKING: the neutral face, mouth open mid-word, eyebrows slightly raised.
CELL 5 - TENDERNESS: soft wet eyes, eyebrows gently up, a small closed-mouth smile - thinking of someone loved.
CELL 6 - FAR AWAY: eyes looking off into the distance at nothing, a faint sad smile, eyebrows up.
CELL 7 - FIGHTING TEARS: chin trembling, lips pressed tight, eyes full of tears, eyebrows pinched up.
CELL 8 - SAD SMILE: eyebrows up in the middle, eyes wet, the mouth smiling anyway.
CELL 9 - PROUD: chin up high, a firm small smile, eyes bright.
CELL 10 - EXHAUSTED: eyelids almost shut, head drooping, mouth hanging slack - about to fall asleep.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `vasco_sorpresa vasco_duda vasco_pensativo vasco_hablando vasco_ternura vasco_mirada_perdida vasco_aguanta_llanto vasco_sonrisa_triste vasco_orgullo vasco_agotado`

### EN EL AVIÓN — las mismas tres hojas, con fondo de cabina

### Hoja C · en el avión — las grandes (grilla 5×2)

**Adjuntar (chat nuevo), en este orden:** `final/vasco2.png` *(IMAGE 1)* · la **Tira A** de este personaje que haya salido bien *(IMAGE 2)*.

```
DRAW A NEW IMAGE FROM SCRATCH. Do NOT return IMAGE 2, do NOT edit it, do NOT repeat
any of its faces. Every cell of the new sheet shows one of the NEW expressions
listed below.

Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SHEET LAYOUT: a GRID of TEN SQUARE cells, FIVE columns and TWO rows - exactly two
rows, not three - edge to edge, no gaps, no borders drawn between them. The finished
image is two and a half times as wide as it is tall. Each cell contains the SAME
character as a portrait bust - chest up, three-quarter view facing slightly LEFT,
eyes toward camera. Identical framing and identical scale in every cell: the head is
the same size and the eyes sit at the same height in all of them. The bottom edge
cuts across the upper chest; arms and hands are outside the frame. Leave a little clear space above the head.
The ONLY difference between cells is the facial expression.
BUST ONLY: nothing below the upper chest - no legs, no boots, no full bodies, even
if the attached images show full figures.
BACKGROUND - INSIDE THE AIRCRAFT: behind the pilot, the cramped cockpit of an A-4
Skyhawk single-seat attack jet, 1970s: the metal canopy frame, a dark instrument
coaming with round analogue dials, grey South Atlantic sky through the canopy. Keep
it DARK, SIMPLE and SLIGHTLY BLURRED in big pixel shapes so the face reads first.
The SAME background behind the pilot in every cell.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is this character's finished model sheet. Copy his clothing, his colouring
and his line work exactly, and match its rendering precisely: same line weight,
same shading, same flat mid-grey background.
IMAGE 2 is STRIP A of THIS SAME MAN, already finished - a reference only. He must be
the same person: same face, same head shape, same hairline, same clothing, same
colours, same framing, the head as big in the cell as it is
there. Only the expressions change.

INTENT, and this matters more than any feature below: he is A RETIRED MAFIOSO, OR A VAMPIRE: pale, still, quietly dangerous. Nothing warm.
He is NOT the gaunt sad pilot who also has dark hair - that one is kind and tired,
this one is cold.

CHARACTER, identical in every cell:
Argentine air force pilot of Basque descent, thirties. THE PALEST SKIN OF THE CAST.
Long angular face, very pronounced square jaw, high cheekbones. JET-BLACK HAIR
combed straight back with volume on top - NO grey anywhere. Straight heavy black
eyebrows. A LARGE straight nose. Deep-set light eyes with a fixed hard stare. A thin
mouth held in a straight line. Olive flight suit zipped to the chin, a large silver
crucifix on a red cord outside the collar.

IN THE COCKPIT, EVERY CELL: the white flight helmet with the visor up, and the
green oxygen mask unclipped and hanging to one side, so the whole face shows. The
helmet must not hide the eyes or the eyebrows.

EXPRESSIONS, left to right, top row then bottom row - SHEET C, IN THE COCKPIT. Each one as
THIS character would do it, never as a generic face:
Push every expression to the EXTREME - big, exaggerated and unmistakable, like a 90s
arcade cut-in portrait, readable at 108 px. Never subtle, even the quiet ones.
CELL 1 - LAUGHING TILL CRYING: mouth thrown wide open, eyes squeezed shut, tears of laughter flying from the corners, head thrown far back.
CELL 2 - PANIC: eyes huge with tiny pupils, mouth stretched open in a scream, eyebrows at the top of the forehead, sweat drops flying.
CELL 3 - RED WITH RAGE: face flushed dark red, teeth bared and clenched, eyebrows crushed down, a vein bulging on the forehead.
CELL 4 - SOBBING: mouth wide open and wailing, eyebrows high and pinched, eyes shut, streams of tears down both cheeks.
CELL 5 - JAW DROP: mouth hanging enormously open, eyes huge, eyebrows shot up as high as they go.
CELL 6 - DISGUSTED: nose wrinkled hard, upper lip curled up to the nose, eyes squinting, head pulled far back.
CELL 7 - IN SHOCK: frozen, face drained pale, eyes wide and fixed on nothing, mouth slightly open.
CELL 8 - IN PAIN: eyes squeezed shut, teeth clenched, the whole face scrunched to one side.
CELL 9 - EUPHORIC: shouting with joy, mouth wide open, eyes shut, eyebrows up, head tipped back.
CELL 10 - STARTLED: head jerked back, eyes popping, mouth snapped open, shoulders up to the ears.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `vasco_av_carcajada vasco_av_panico vasco_av_furia vasco_av_llanto vasco_av_mandibula vasco_av_asco vasco_av_shock vasco_av_dolor vasco_av_euforia vasco_av_sobresalto`

### Hoja D · en el avión — las incómodas y las pícaras (grilla 5×2)

**Adjuntar (chat nuevo), en este orden:** la **Tira A** *(IMAGE 1)* · la **hoja C en el avión** de este personaje que haya salido bien *(IMAGE 2)*.

```
DRAW A NEW IMAGE FROM SCRATCH. Do NOT return IMAGE 2, do NOT edit it, do NOT repeat
any of its faces. Every cell of the new sheet shows one of the NEW expressions
listed below.

Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SHEET LAYOUT: a GRID of TEN SQUARE cells, FIVE columns and TWO rows - exactly two
rows, not three - edge to edge, no gaps, no borders drawn between them. The finished
image is two and a half times as wide as it is tall. Each cell contains the SAME
character as a portrait bust - chest up, three-quarter view facing slightly LEFT,
eyes toward camera. Identical framing and identical scale in every cell: the head is
the same size and the eyes sit at the same height in all of them. The bottom edge
cuts across the upper chest; arms and hands are outside the frame. Leave a little clear space above the head.
The ONLY difference between cells is the facial expression.
BUST ONLY: nothing below the upper chest - no legs, no boots, no full bodies, even
if the attached images show full figures.
BACKGROUND - INSIDE THE AIRCRAFT: behind the pilot, the cramped cockpit of an A-4
Skyhawk single-seat attack jet, 1970s: the metal canopy frame, a dark instrument
coaming with round analogue dials, grey South Atlantic sky through the canopy. Keep
it DARK, SIMPLE and SLIGHTLY BLURRED in big pixel shapes so the face reads first.
The SAME background behind the pilot in every cell.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is STRIP A of THIS SAME MAN, already finished - a reference only. He must
be the same person: same face, same head shape, same hairline, same clothing, same
colours, same line work and dithered shading.
IMAGE 2 is an earlier sheet of THIS SAME MAN IN THE COCKPIT. Copy from it exactly:
the cockpit background, the white flight helmet and hanging oxygen mask, the framing and the head size.

INTENT, and this matters more than any feature below: he is A RETIRED MAFIOSO, OR A VAMPIRE: pale, still, quietly dangerous. Nothing warm.
He is NOT the gaunt sad pilot who also has dark hair - that one is kind and tired,
this one is cold.

CHARACTER, identical in every cell:
Argentine air force pilot of Basque descent, thirties. THE PALEST SKIN OF THE CAST.
Long angular face, very pronounced square jaw, high cheekbones. JET-BLACK HAIR
combed straight back with volume on top - NO grey anywhere. Straight heavy black
eyebrows. A LARGE straight nose. Deep-set light eyes with a fixed hard stare. A thin
mouth held in a straight line. Olive flight suit zipped to the chin, a large silver
crucifix on a red cord outside the collar.

IN THE COCKPIT, EVERY CELL: the white flight helmet with the visor up, and the
green oxygen mask unclipped and hanging to one side, so the whole face shows. The
helmet must not hide the eyes or the eyebrows.

EXPRESSIONS, left to right, top row then bottom row - SHEET D, IN THE COCKPIT. Each one as
THIS character would do it, never as a generic face:
Push every expression to the EXTREME - big, exaggerated and unmistakable, like a 90s
arcade cut-in portrait, readable at 108 px. Never subtle, even the quiet ones.
CELL 1 - AWKWARD: head perfectly still, eyes sliding sideways toward the camera, lips pressed together and pulled to one side in a tight uneasy half-smile - caught in an uncomfortable moment.
CELL 2 - HOLDING IN A LAUGH: cheeks puffed out, lips pressed tight and wobbling, eyes crinkled and watering.
CELL 3 - "REALLY?": a totally flat deadpan face, eyelids half down, eyebrows level, staring straight at the camera.
CELL 4 - SUSPICIOUS SIDE-EYE: head turned away, eyes sliding hard to the side, one eyebrow down, mouth flat.
CELL 5 - GRIMACE: teeth clenched and showing in a wide stiff line, eyebrows up, eyes wide - "uh oh".
CELL 6 - SMUG: chin up, eyelids half down, a slow one-sided smirk, one eyebrow raised high.
CELL 7 - EYE ROLL: eyes rolled all the way up, eyelids half down, mouth twisted to one side.
CELL 8 - WINK: one eye shut tight, a big cheeky half-smile.
CELL 9 - TONGUE OUT: tongue stuck far out in a teasing face, eyes squinting playfully.
CELL 10 - NERVOUS LAUGH: a huge forced smile, eyebrows up and apart, eyes darting, big drops of sweat on the temple.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `vasco_av_incomodo vasco_av_aguanta_risa vasco_av_en_serio vasco_av_de_reojo vasco_av_yikes vasco_av_sobrador vasco_av_ojos_blanco vasco_av_guino vasco_av_lengua vasco_av_risa_nerviosa`

### Hoja E · en el avión — las de todos los días y las profundas (grilla 5×2)

**Adjuntar (chat nuevo), en este orden:** la **Tira A** *(IMAGE 1)* · la **hoja C en el avión** de este personaje que haya salido bien *(IMAGE 2)*.

```
DRAW A NEW IMAGE FROM SCRATCH. Do NOT return IMAGE 2, do NOT edit it, do NOT repeat
any of its faces. Every cell of the new sheet shows one of the NEW expressions
listed below.

Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SHEET LAYOUT: a GRID of TEN SQUARE cells, FIVE columns and TWO rows - exactly two
rows, not three - edge to edge, no gaps, no borders drawn between them. The finished
image is two and a half times as wide as it is tall. Each cell contains the SAME
character as a portrait bust - chest up, three-quarter view facing slightly LEFT,
eyes toward camera. Identical framing and identical scale in every cell: the head is
the same size and the eyes sit at the same height in all of them. The bottom edge
cuts across the upper chest; arms and hands are outside the frame. Leave a little clear space above the head.
The ONLY difference between cells is the facial expression.
BUST ONLY: nothing below the upper chest - no legs, no boots, no full bodies, even
if the attached images show full figures.
BACKGROUND - INSIDE THE AIRCRAFT: behind the pilot, the cramped cockpit of an A-4
Skyhawk single-seat attack jet, 1970s: the metal canopy frame, a dark instrument
coaming with round analogue dials, grey South Atlantic sky through the canopy. Keep
it DARK, SIMPLE and SLIGHTLY BLURRED in big pixel shapes so the face reads first.
The SAME background behind the pilot in every cell.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is STRIP A of THIS SAME MAN, already finished - a reference only. He must
be the same person: same face, same head shape, same hairline, same clothing, same
colours, same line work and dithered shading.
IMAGE 2 is an earlier sheet of THIS SAME MAN IN THE COCKPIT. Copy from it exactly:
the cockpit background, the white flight helmet and hanging oxygen mask, the framing and the head size.

INTENT, and this matters more than any feature below: he is A RETIRED MAFIOSO, OR A VAMPIRE: pale, still, quietly dangerous. Nothing warm.
He is NOT the gaunt sad pilot who also has dark hair - that one is kind and tired,
this one is cold.

CHARACTER, identical in every cell:
Argentine air force pilot of Basque descent, thirties. THE PALEST SKIN OF THE CAST.
Long angular face, very pronounced square jaw, high cheekbones. JET-BLACK HAIR
combed straight back with volume on top - NO grey anywhere. Straight heavy black
eyebrows. A LARGE straight nose. Deep-set light eyes with a fixed hard stare. A thin
mouth held in a straight line. Olive flight suit zipped to the chin, a large silver
crucifix on a red cord outside the collar.

IN THE COCKPIT, EVERY CELL: the white flight helmet with the visor up, and the
green oxygen mask unclipped and hanging to one side, so the whole face shows. The
helmet must not hide the eyes or the eyebrows.

EXPRESSIONS, left to right, top row then bottom row - SHEET E, IN THE COCKPIT. Each one as
THIS character would do it, never as a generic face:
Push every expression to the EXTREME - big, exaggerated and unmistakable, like a 90s
arcade cut-in portrait, readable at 108 px. Never subtle, even the quiet ones.
CELL 1 - SURPRISED: eyebrows shot up, eyes wide, mouth a small round O.
CELL 2 - DOUBTFUL: one eyebrow high and one low, eyes to the side, mouth pulled hard to one side.
CELL 3 - THINKING: eyes up and to the side, lips pushed out, one eyebrow raised.
CELL 4 - TALKING: the neutral face, mouth open mid-word, eyebrows slightly raised.
CELL 5 - TENDERNESS: soft wet eyes, eyebrows gently up, a small closed-mouth smile - thinking of someone loved.
CELL 6 - FAR AWAY: eyes looking off into the distance at nothing, a faint sad smile, eyebrows up.
CELL 7 - FIGHTING TEARS: chin trembling, lips pressed tight, eyes full of tears, eyebrows pinched up.
CELL 8 - SAD SMILE: eyebrows up in the middle, eyes wet, the mouth smiling anyway.
CELL 9 - PROUD: chin up high, a firm small smile, eyes bright.
CELL 10 - EXHAUSTED: eyelids almost shut, head drooping, mouth hanging slack - about to fall asleep.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `vasco_av_sorpresa vasco_av_duda vasco_av_pensativo vasco_av_hablando vasco_av_ternura vasco_av_mirada_perdida vasco_av_aguanta_llanto vasco_av_sonrisa_triste vasco_av_orgullo vasco_av_agotado`

---

## PICHÓN

### Tira A

**Adjuntar (chat nuevo):** `final/pichon3.png` *(IMAGE 1)* · `final/team.png` *(IMAGE 2)*

```
Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SHEET LAYOUT: a single horizontal strip of SIX SQUARE cells in one row, edge to
edge, no gaps, no borders drawn between them. The finished image is exactly six
times as wide as it is tall. Each cell contains the SAME character as a portrait
bust - chest up, three-quarter view facing slightly LEFT, eyes toward camera.
Identical framing and identical scale in every cell: the head is the same size and
the eyes sit at the same height in all of them. The bottom edge cuts across the
upper chest; arms and hands are outside the frame. Leave a little clear space
above the hair. The ONLY difference between cells is the facial expression.
BUST ONLY: nothing below the upper chest - no legs, no boots, no full bodies, even
if the attached images show full figures.
BACKGROUND: flat neutral mid-grey (about #808080), the same grey behind the figure
in every cell. No scenery, no props, no vignette, no gradient, no shadow cast on the
background.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is this character's finished model sheet. Copy his clothing, his colouring
and his line work exactly, and match its rendering precisely: same line weight,
same shading, same flat mid-grey background.
IMAGE 2 is the full cast line-up. This character is the SIXTH figure. Copy his
build and his face from there. The other seven are the rest of the cast and he must
stay clearly different from every one of them.

INTENT, and this matters more than any feature below: he is A BOY TRYING TO LOOK LIKE HE BELONGS among men.

CHARACTER, identical in every cell:
Argentine air force pilot, NINETEEN - he must read as a BOY among adults, not as a
short man. Round face, no defined jaw, no facial hair. CLEAR FRECKLES across the
nose and cheeks. Short messy black hair with a loose fringe. DARK EYEBROWS ANGLED UP
AT THE INNER ENDS, which leave him looking apologetic even when he smiles. Large
brown eyes with a lot of white showing. The narrowest shoulders of the pilots. Olive
flight suit with a chest harness.

EXPRESSIONS, left to right:
CELL 1 - NEUTRAL: open and attentive, mouth slightly parted, eyebrows up. Even his neutral looks eager.
CELL 2 - SMILE: open-mouthed wonder, eyebrows high, eyes wide and shining. A boy who just saw something wonderful.
CELL 3 - WORRIED: eyebrows high and straight, eyes very wide and fixed, mouth a small tight line. Not screaming - frozen.
CELL 4 - ANGER: trying to look hard and not managing it. Eyebrows forced down over eyes that are still soft.
CELL 5 - BROKEN: face open, eyes wet, mouth trembling. He has not learned to hide anything yet.
CELL 6 - LISTENING HARD - wearing period padded radio headphones over the ears, eyes
  narrowed in concentration, mouth closed, head tilted slightly. Not scared -
  absorbed.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `pichon_neutro pichon_sonrisa pichon_preocupado pichon_ceno pichon_roto pichon_auriculares`

### Tira B

**Adjuntar (chat nuevo), en este orden:** `final/pichon3.png` *(IMAGE 1)* · la **Tira A** de este personaje que haya salido bien *(IMAGE 2)*.

```
DRAW A NEW IMAGE FROM SCRATCH. Do NOT return IMAGE 2, do NOT edit it, do NOT repeat
any of its faces. Every cell of the new strip shows one of the NEW expressions
listed below.

Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SHEET LAYOUT: a single horizontal strip of SIX SQUARE cells in one row, edge to
edge, no gaps, no borders drawn between them. The finished image is exactly six
times as wide as it is tall. Each cell contains the SAME character as a portrait
bust - chest up, three-quarter view facing slightly LEFT, eyes toward camera.
Identical framing and identical scale in every cell: the head is the same size and
the eyes sit at the same height in all of them. The bottom edge cuts across the
upper chest; arms and hands are outside the frame. Leave a little clear space
above the hair. The ONLY difference between cells is the facial expression.
BUST ONLY: nothing below the upper chest - no legs, no boots, no full bodies, even
if the attached images show full figures.
BACKGROUND: flat neutral mid-grey (about #808080), the same grey behind the figure
in every cell. No scenery, no props, no vignette, no gradient, no shadow cast on the
background.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is this character's finished model sheet. Copy his clothing, his colouring
and his line work exactly, and match its rendering precisely: same line weight,
same shading, same flat mid-grey background.
IMAGE 2 is STRIP A of THIS SAME MAN, already finished - a reference only. He must be
the same person: same face, same head shape, same hairline, same clothing, same
colours, same grey background, same framing, the head as big in the cell as it is
there. Only the expressions change.

INTENT, and this matters more than any feature below: he is A BOY TRYING TO LOOK LIKE HE BELONGS among men.

CHARACTER, identical in every cell:
Argentine air force pilot, NINETEEN - he must read as a BOY among adults, not as a
short man. Round face, no defined jaw, no facial hair. CLEAR FRECKLES across the
nose and cheeks. Short messy black hair with a loose fringe. DARK EYEBROWS ANGLED UP
AT THE INNER ENDS, which leave him looking apologetic even when he smiles. Large
brown eyes with a lot of white showing. The narrowest shoulders of the pilots. Olive
flight suit with a chest harness.

EXPRESSIONS, left to right - STRIP B, the strong ones. Each one as THIS character
would do it, never as a generic face:
CELL 1 - LAUGHING: a real laugh, mouth wide open, eyes squeezed almost shut, head
  tipped slightly back.
CELL 2 - AFRAID: eyes wide with white showing, eyebrows up and pulled together,
  mouth open and tense.
CELL 3 - SHOUTING IN ANGER: eyebrows hard down, mouth wide open in a shout, teeth
  showing, head pushed forward.
CELL 4 - CRYING: eyebrows high and pinched in the middle, eyes squeezed, mouth turned
  down and trembling, one or two simple pixel tear lines on the cheek.
CELL 5 - RELIEVED: eyes closed, eyebrows relaxed upward, a long breath out, a small
  tired smile, head tilted a little back.
CELL 6 - DETERMINED: eyebrows low and level, eyes narrowed and fixed ahead, jaw set,
  mouth a firm line, head slightly forward.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `pichon_risa pichon_miedo pichon_grito pichon_llanto pichon_alivio pichon_decidido`

### Hoja C — las grandes (grilla 5×2)

**Adjuntar (chat nuevo), en este orden:** `final/pichon3.png` *(IMAGE 1)* · la **Tira A** de este personaje que haya salido bien *(IMAGE 2)*.

```
DRAW A NEW IMAGE FROM SCRATCH. Do NOT return IMAGE 2, do NOT edit it, do NOT repeat
any of its faces. Every cell of the new sheet shows one of the NEW expressions
listed below.

Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SHEET LAYOUT: a GRID of TEN SQUARE cells, FIVE columns and TWO rows - exactly two
rows, not three - edge to edge, no gaps, no borders drawn between them. The finished
image is two and a half times as wide as it is tall. Each cell contains the SAME
character as a portrait bust - chest up, three-quarter view facing slightly LEFT,
eyes toward camera. Identical framing and identical scale in every cell: the head is
the same size and the eyes sit at the same height in all of them. The bottom edge
cuts across the upper chest; arms and hands are outside the frame. Leave a little clear space above the head.
The ONLY difference between cells is the facial expression.
BUST ONLY: nothing below the upper chest - no legs, no boots, no full bodies, even
if the attached images show full figures.
BACKGROUND: flat neutral mid-grey (about #808080), the same grey behind the figure
in every cell. No scenery, no props, no vignette, no gradient, no shadow cast on the
background.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is this character's finished model sheet. Copy his clothing, his colouring
and his line work exactly, and match its rendering precisely: same line weight,
same shading, same flat mid-grey background.
IMAGE 2 is STRIP A of THIS SAME MAN, already finished - a reference only. He must be
the same person: same face, same head shape, same hairline, same clothing, same
colours, same grey background, same framing, the head as big in the cell as it is
there. Only the expressions change.

INTENT, and this matters more than any feature below: he is A BOY TRYING TO LOOK LIKE HE BELONGS among men.

CHARACTER, identical in every cell:
Argentine air force pilot, NINETEEN - he must read as a BOY among adults, not as a
short man. Round face, no defined jaw, no facial hair. CLEAR FRECKLES across the
nose and cheeks. Short messy black hair with a loose fringe. DARK EYEBROWS ANGLED UP
AT THE INNER ENDS, which leave him looking apologetic even when he smiles. Large
brown eyes with a lot of white showing. The narrowest shoulders of the pilots. Olive
flight suit with a chest harness.

EXPRESSIONS, left to right, top row then bottom row - SHEET C. Each one as
THIS character would do it, never as a generic face:
Push every expression to the EXTREME - big, exaggerated and unmistakable, like a 90s
arcade cut-in portrait, readable at 108 px. Never subtle, even the quiet ones.
CELL 1 - LAUGHING TILL CRYING: mouth thrown wide open, eyes squeezed shut, tears of laughter flying from the corners, head thrown far back.
CELL 2 - PANIC: eyes huge with tiny pupils, mouth stretched open in a scream, eyebrows at the top of the forehead, sweat drops flying.
CELL 3 - RED WITH RAGE: face flushed dark red, teeth bared and clenched, eyebrows crushed down, a vein bulging on the forehead.
CELL 4 - SOBBING: mouth wide open and wailing, eyebrows high and pinched, eyes shut, streams of tears down both cheeks.
CELL 5 - JAW DROP: mouth hanging enormously open, eyes huge, eyebrows shot up as high as they go.
CELL 6 - DISGUSTED: nose wrinkled hard, upper lip curled up to the nose, eyes squinting, head pulled far back.
CELL 7 - IN SHOCK: frozen, face drained pale, eyes wide and fixed on nothing, mouth slightly open.
CELL 8 - IN PAIN: eyes squeezed shut, teeth clenched, the whole face scrunched to one side.
CELL 9 - EUPHORIC: shouting with joy, mouth wide open, eyes shut, eyebrows up, head tipped back.
CELL 10 - STARTLED: head jerked back, eyes popping, mouth snapped open, shoulders up to the ears.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `pichon_carcajada pichon_panico pichon_furia pichon_llanto pichon_mandibula pichon_asco pichon_shock pichon_dolor pichon_euforia pichon_sobresalto`

### Hoja D — las incómodas y las pícaras (grilla 5×2)

**Adjuntar (chat nuevo), en este orden:** `final/pichon3.png` *(IMAGE 1)* · la **Tira A** de este personaje que haya salido bien *(IMAGE 2)*.

```
DRAW A NEW IMAGE FROM SCRATCH. Do NOT return IMAGE 2, do NOT edit it, do NOT repeat
any of its faces. Every cell of the new sheet shows one of the NEW expressions
listed below.

Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SHEET LAYOUT: a GRID of TEN SQUARE cells, FIVE columns and TWO rows - exactly two
rows, not three - edge to edge, no gaps, no borders drawn between them. The finished
image is two and a half times as wide as it is tall. Each cell contains the SAME
character as a portrait bust - chest up, three-quarter view facing slightly LEFT,
eyes toward camera. Identical framing and identical scale in every cell: the head is
the same size and the eyes sit at the same height in all of them. The bottom edge
cuts across the upper chest; arms and hands are outside the frame. Leave a little clear space above the head.
The ONLY difference between cells is the facial expression.
BUST ONLY: nothing below the upper chest - no legs, no boots, no full bodies, even
if the attached images show full figures.
BACKGROUND: flat neutral mid-grey (about #808080), the same grey behind the figure
in every cell. No scenery, no props, no vignette, no gradient, no shadow cast on the
background.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is this character's finished model sheet. Copy his clothing, his colouring
and his line work exactly, and match its rendering precisely: same line weight,
same shading, same flat mid-grey background.
IMAGE 2 is STRIP A of THIS SAME MAN, already finished - a reference only. He must be
the same person: same face, same head shape, same hairline, same clothing, same
colours, same grey background, same framing, the head as big in the cell as it is
there. Only the expressions change.

INTENT, and this matters more than any feature below: he is A BOY TRYING TO LOOK LIKE HE BELONGS among men.

CHARACTER, identical in every cell:
Argentine air force pilot, NINETEEN - he must read as a BOY among adults, not as a
short man. Round face, no defined jaw, no facial hair. CLEAR FRECKLES across the
nose and cheeks. Short messy black hair with a loose fringe. DARK EYEBROWS ANGLED UP
AT THE INNER ENDS, which leave him looking apologetic even when he smiles. Large
brown eyes with a lot of white showing. The narrowest shoulders of the pilots. Olive
flight suit with a chest harness.

EXPRESSIONS, left to right, top row then bottom row - SHEET D. Each one as
THIS character would do it, never as a generic face:
Push every expression to the EXTREME - big, exaggerated and unmistakable, like a 90s
arcade cut-in portrait, readable at 108 px. Never subtle, even the quiet ones.
CELL 1 - AWKWARD: head perfectly still, eyes sliding sideways toward the camera, lips pressed together and pulled to one side in a tight uneasy half-smile - caught in an uncomfortable moment.
CELL 2 - HOLDING IN A LAUGH: cheeks puffed out, lips pressed tight and wobbling, eyes crinkled and watering.
CELL 3 - "REALLY?": a totally flat deadpan face, eyelids half down, eyebrows level, staring straight at the camera.
CELL 4 - SUSPICIOUS SIDE-EYE: head turned away, eyes sliding hard to the side, one eyebrow down, mouth flat.
CELL 5 - GRIMACE: teeth clenched and showing in a wide stiff line, eyebrows up, eyes wide - "uh oh".
CELL 6 - SMUG: chin up, eyelids half down, a slow one-sided smirk, one eyebrow raised high.
CELL 7 - EYE ROLL: eyes rolled all the way up, eyelids half down, mouth twisted to one side.
CELL 8 - WINK: one eye shut tight, a big cheeky half-smile.
CELL 9 - TONGUE OUT: tongue stuck far out in a teasing face, eyes squinting playfully.
CELL 10 - NERVOUS LAUGH: a huge forced smile, eyebrows up and apart, eyes darting, big drops of sweat on the temple.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `pichon_incomodo pichon_aguanta_risa pichon_en_serio pichon_de_reojo pichon_yikes pichon_sobrador pichon_ojos_blanco pichon_guino pichon_lengua pichon_risa_nerviosa`

### Hoja E — las de todos los días y las profundas (grilla 5×2)

**Adjuntar (chat nuevo), en este orden:** `final/pichon3.png` *(IMAGE 1)* · la **Tira A** de este personaje que haya salido bien *(IMAGE 2)*.

```
DRAW A NEW IMAGE FROM SCRATCH. Do NOT return IMAGE 2, do NOT edit it, do NOT repeat
any of its faces. Every cell of the new sheet shows one of the NEW expressions
listed below.

Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SHEET LAYOUT: a GRID of TEN SQUARE cells, FIVE columns and TWO rows - exactly two
rows, not three - edge to edge, no gaps, no borders drawn between them. The finished
image is two and a half times as wide as it is tall. Each cell contains the SAME
character as a portrait bust - chest up, three-quarter view facing slightly LEFT,
eyes toward camera. Identical framing and identical scale in every cell: the head is
the same size and the eyes sit at the same height in all of them. The bottom edge
cuts across the upper chest; arms and hands are outside the frame. Leave a little clear space above the head.
The ONLY difference between cells is the facial expression.
BUST ONLY: nothing below the upper chest - no legs, no boots, no full bodies, even
if the attached images show full figures.
BACKGROUND: flat neutral mid-grey (about #808080), the same grey behind the figure
in every cell. No scenery, no props, no vignette, no gradient, no shadow cast on the
background.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is this character's finished model sheet. Copy his clothing, his colouring
and his line work exactly, and match its rendering precisely: same line weight,
same shading, same flat mid-grey background.
IMAGE 2 is STRIP A of THIS SAME MAN, already finished - a reference only. He must be
the same person: same face, same head shape, same hairline, same clothing, same
colours, same grey background, same framing, the head as big in the cell as it is
there. Only the expressions change.

INTENT, and this matters more than any feature below: he is A BOY TRYING TO LOOK LIKE HE BELONGS among men.

CHARACTER, identical in every cell:
Argentine air force pilot, NINETEEN - he must read as a BOY among adults, not as a
short man. Round face, no defined jaw, no facial hair. CLEAR FRECKLES across the
nose and cheeks. Short messy black hair with a loose fringe. DARK EYEBROWS ANGLED UP
AT THE INNER ENDS, which leave him looking apologetic even when he smiles. Large
brown eyes with a lot of white showing. The narrowest shoulders of the pilots. Olive
flight suit with a chest harness.

EXPRESSIONS, left to right, top row then bottom row - SHEET E. Each one as
THIS character would do it, never as a generic face:
Push every expression to the EXTREME - big, exaggerated and unmistakable, like a 90s
arcade cut-in portrait, readable at 108 px. Never subtle, even the quiet ones.
CELL 1 - SURPRISED: eyebrows shot up, eyes wide, mouth a small round O.
CELL 2 - DOUBTFUL: one eyebrow high and one low, eyes to the side, mouth pulled hard to one side.
CELL 3 - THINKING: eyes up and to the side, lips pushed out, one eyebrow raised.
CELL 4 - TALKING: the neutral face, mouth open mid-word, eyebrows slightly raised.
CELL 5 - TENDERNESS: soft wet eyes, eyebrows gently up, a small closed-mouth smile - thinking of someone loved.
CELL 6 - FAR AWAY: eyes looking off into the distance at nothing, a faint sad smile, eyebrows up.
CELL 7 - FIGHTING TEARS: chin trembling, lips pressed tight, eyes full of tears, eyebrows pinched up.
CELL 8 - SAD SMILE: eyebrows up in the middle, eyes wet, the mouth smiling anyway.
CELL 9 - PROUD: chin up high, a firm small smile, eyes bright.
CELL 10 - EXHAUSTED: eyelids almost shut, head drooping, mouth hanging slack - about to fall asleep.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `pichon_sorpresa pichon_duda pichon_pensativo pichon_hablando pichon_ternura pichon_mirada_perdida pichon_aguanta_llanto pichon_sonrisa_triste pichon_orgullo pichon_agotado`

### EN EL AVIÓN — las mismas tres hojas, con fondo de cabina

### Hoja C · en el avión — las grandes (grilla 5×2)

**Adjuntar (chat nuevo), en este orden:** `final/pichon3.png` *(IMAGE 1)* · la **Tira A** de este personaje que haya salido bien *(IMAGE 2)*.

```
DRAW A NEW IMAGE FROM SCRATCH. Do NOT return IMAGE 2, do NOT edit it, do NOT repeat
any of its faces. Every cell of the new sheet shows one of the NEW expressions
listed below.

Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SHEET LAYOUT: a GRID of TEN SQUARE cells, FIVE columns and TWO rows - exactly two
rows, not three - edge to edge, no gaps, no borders drawn between them. The finished
image is two and a half times as wide as it is tall. Each cell contains the SAME
character as a portrait bust - chest up, three-quarter view facing slightly LEFT,
eyes toward camera. Identical framing and identical scale in every cell: the head is
the same size and the eyes sit at the same height in all of them. The bottom edge
cuts across the upper chest; arms and hands are outside the frame. Leave a little clear space above the head.
The ONLY difference between cells is the facial expression.
BUST ONLY: nothing below the upper chest - no legs, no boots, no full bodies, even
if the attached images show full figures.
BACKGROUND - INSIDE THE AIRCRAFT: behind the pilot, the cramped cockpit of an A-4
Skyhawk single-seat attack jet, 1970s: the metal canopy frame, a dark instrument
coaming with round analogue dials, grey South Atlantic sky through the canopy. Keep
it DARK, SIMPLE and SLIGHTLY BLURRED in big pixel shapes so the face reads first.
The SAME background behind the pilot in every cell.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is this character's finished model sheet. Copy his clothing, his colouring
and his line work exactly, and match its rendering precisely: same line weight,
same shading, same flat mid-grey background.
IMAGE 2 is STRIP A of THIS SAME MAN, already finished - a reference only. He must be
the same person: same face, same head shape, same hairline, same clothing, same
colours, same framing, the head as big in the cell as it is
there. Only the expressions change.

INTENT, and this matters more than any feature below: he is A BOY TRYING TO LOOK LIKE HE BELONGS among men.

CHARACTER, identical in every cell:
Argentine air force pilot, NINETEEN - he must read as a BOY among adults, not as a
short man. Round face, no defined jaw, no facial hair. CLEAR FRECKLES across the
nose and cheeks. Short messy black hair with a loose fringe. DARK EYEBROWS ANGLED UP
AT THE INNER ENDS, which leave him looking apologetic even when he smiles. Large
brown eyes with a lot of white showing. The narrowest shoulders of the pilots. Olive
flight suit with a chest harness.

IN THE COCKPIT, EVERY CELL: the white flight helmet with the visor up, and the
green oxygen mask unclipped and hanging to one side, so the whole face shows. The
helmet must not hide the eyes or the eyebrows.

EXPRESSIONS, left to right, top row then bottom row - SHEET C, IN THE COCKPIT. Each one as
THIS character would do it, never as a generic face:
Push every expression to the EXTREME - big, exaggerated and unmistakable, like a 90s
arcade cut-in portrait, readable at 108 px. Never subtle, even the quiet ones.
CELL 1 - LAUGHING TILL CRYING: mouth thrown wide open, eyes squeezed shut, tears of laughter flying from the corners, head thrown far back.
CELL 2 - PANIC: eyes huge with tiny pupils, mouth stretched open in a scream, eyebrows at the top of the forehead, sweat drops flying.
CELL 3 - RED WITH RAGE: face flushed dark red, teeth bared and clenched, eyebrows crushed down, a vein bulging on the forehead.
CELL 4 - SOBBING: mouth wide open and wailing, eyebrows high and pinched, eyes shut, streams of tears down both cheeks.
CELL 5 - JAW DROP: mouth hanging enormously open, eyes huge, eyebrows shot up as high as they go.
CELL 6 - DISGUSTED: nose wrinkled hard, upper lip curled up to the nose, eyes squinting, head pulled far back.
CELL 7 - IN SHOCK: frozen, face drained pale, eyes wide and fixed on nothing, mouth slightly open.
CELL 8 - IN PAIN: eyes squeezed shut, teeth clenched, the whole face scrunched to one side.
CELL 9 - EUPHORIC: shouting with joy, mouth wide open, eyes shut, eyebrows up, head tipped back.
CELL 10 - STARTLED: head jerked back, eyes popping, mouth snapped open, shoulders up to the ears.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `pichon_av_carcajada pichon_av_panico pichon_av_furia pichon_av_llanto pichon_av_mandibula pichon_av_asco pichon_av_shock pichon_av_dolor pichon_av_euforia pichon_av_sobresalto`

### Hoja D · en el avión — las incómodas y las pícaras (grilla 5×2)

**Adjuntar (chat nuevo), en este orden:** la **Tira A** *(IMAGE 1)* · la **hoja C en el avión** de este personaje que haya salido bien *(IMAGE 2)*.

```
DRAW A NEW IMAGE FROM SCRATCH. Do NOT return IMAGE 2, do NOT edit it, do NOT repeat
any of its faces. Every cell of the new sheet shows one of the NEW expressions
listed below.

Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SHEET LAYOUT: a GRID of TEN SQUARE cells, FIVE columns and TWO rows - exactly two
rows, not three - edge to edge, no gaps, no borders drawn between them. The finished
image is two and a half times as wide as it is tall. Each cell contains the SAME
character as a portrait bust - chest up, three-quarter view facing slightly LEFT,
eyes toward camera. Identical framing and identical scale in every cell: the head is
the same size and the eyes sit at the same height in all of them. The bottom edge
cuts across the upper chest; arms and hands are outside the frame. Leave a little clear space above the head.
The ONLY difference between cells is the facial expression.
BUST ONLY: nothing below the upper chest - no legs, no boots, no full bodies, even
if the attached images show full figures.
BACKGROUND - INSIDE THE AIRCRAFT: behind the pilot, the cramped cockpit of an A-4
Skyhawk single-seat attack jet, 1970s: the metal canopy frame, a dark instrument
coaming with round analogue dials, grey South Atlantic sky through the canopy. Keep
it DARK, SIMPLE and SLIGHTLY BLURRED in big pixel shapes so the face reads first.
The SAME background behind the pilot in every cell.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is STRIP A of THIS SAME MAN, already finished - a reference only. He must
be the same person: same face, same head shape, same hairline, same clothing, same
colours, same line work and dithered shading.
IMAGE 2 is an earlier sheet of THIS SAME MAN IN THE COCKPIT. Copy from it exactly:
the cockpit background, the white flight helmet and hanging oxygen mask, the framing and the head size.

INTENT, and this matters more than any feature below: he is A BOY TRYING TO LOOK LIKE HE BELONGS among men.

CHARACTER, identical in every cell:
Argentine air force pilot, NINETEEN - he must read as a BOY among adults, not as a
short man. Round face, no defined jaw, no facial hair. CLEAR FRECKLES across the
nose and cheeks. Short messy black hair with a loose fringe. DARK EYEBROWS ANGLED UP
AT THE INNER ENDS, which leave him looking apologetic even when he smiles. Large
brown eyes with a lot of white showing. The narrowest shoulders of the pilots. Olive
flight suit with a chest harness.

IN THE COCKPIT, EVERY CELL: the white flight helmet with the visor up, and the
green oxygen mask unclipped and hanging to one side, so the whole face shows. The
helmet must not hide the eyes or the eyebrows.

EXPRESSIONS, left to right, top row then bottom row - SHEET D, IN THE COCKPIT. Each one as
THIS character would do it, never as a generic face:
Push every expression to the EXTREME - big, exaggerated and unmistakable, like a 90s
arcade cut-in portrait, readable at 108 px. Never subtle, even the quiet ones.
CELL 1 - AWKWARD: head perfectly still, eyes sliding sideways toward the camera, lips pressed together and pulled to one side in a tight uneasy half-smile - caught in an uncomfortable moment.
CELL 2 - HOLDING IN A LAUGH: cheeks puffed out, lips pressed tight and wobbling, eyes crinkled and watering.
CELL 3 - "REALLY?": a totally flat deadpan face, eyelids half down, eyebrows level, staring straight at the camera.
CELL 4 - SUSPICIOUS SIDE-EYE: head turned away, eyes sliding hard to the side, one eyebrow down, mouth flat.
CELL 5 - GRIMACE: teeth clenched and showing in a wide stiff line, eyebrows up, eyes wide - "uh oh".
CELL 6 - SMUG: chin up, eyelids half down, a slow one-sided smirk, one eyebrow raised high.
CELL 7 - EYE ROLL: eyes rolled all the way up, eyelids half down, mouth twisted to one side.
CELL 8 - WINK: one eye shut tight, a big cheeky half-smile.
CELL 9 - TONGUE OUT: tongue stuck far out in a teasing face, eyes squinting playfully.
CELL 10 - NERVOUS LAUGH: a huge forced smile, eyebrows up and apart, eyes darting, big drops of sweat on the temple.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `pichon_av_incomodo pichon_av_aguanta_risa pichon_av_en_serio pichon_av_de_reojo pichon_av_yikes pichon_av_sobrador pichon_av_ojos_blanco pichon_av_guino pichon_av_lengua pichon_av_risa_nerviosa`

### Hoja E · en el avión — las de todos los días y las profundas (grilla 5×2)

**Adjuntar (chat nuevo), en este orden:** la **Tira A** *(IMAGE 1)* · la **hoja C en el avión** de este personaje que haya salido bien *(IMAGE 2)*.

```
DRAW A NEW IMAGE FROM SCRATCH. Do NOT return IMAGE 2, do NOT edit it, do NOT repeat
any of its faces. Every cell of the new sheet shows one of the NEW expressions
listed below.

Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SHEET LAYOUT: a GRID of TEN SQUARE cells, FIVE columns and TWO rows - exactly two
rows, not three - edge to edge, no gaps, no borders drawn between them. The finished
image is two and a half times as wide as it is tall. Each cell contains the SAME
character as a portrait bust - chest up, three-quarter view facing slightly LEFT,
eyes toward camera. Identical framing and identical scale in every cell: the head is
the same size and the eyes sit at the same height in all of them. The bottom edge
cuts across the upper chest; arms and hands are outside the frame. Leave a little clear space above the head.
The ONLY difference between cells is the facial expression.
BUST ONLY: nothing below the upper chest - no legs, no boots, no full bodies, even
if the attached images show full figures.
BACKGROUND - INSIDE THE AIRCRAFT: behind the pilot, the cramped cockpit of an A-4
Skyhawk single-seat attack jet, 1970s: the metal canopy frame, a dark instrument
coaming with round analogue dials, grey South Atlantic sky through the canopy. Keep
it DARK, SIMPLE and SLIGHTLY BLURRED in big pixel shapes so the face reads first.
The SAME background behind the pilot in every cell.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is STRIP A of THIS SAME MAN, already finished - a reference only. He must
be the same person: same face, same head shape, same hairline, same clothing, same
colours, same line work and dithered shading.
IMAGE 2 is an earlier sheet of THIS SAME MAN IN THE COCKPIT. Copy from it exactly:
the cockpit background, the white flight helmet and hanging oxygen mask, the framing and the head size.

INTENT, and this matters more than any feature below: he is A BOY TRYING TO LOOK LIKE HE BELONGS among men.

CHARACTER, identical in every cell:
Argentine air force pilot, NINETEEN - he must read as a BOY among adults, not as a
short man. Round face, no defined jaw, no facial hair. CLEAR FRECKLES across the
nose and cheeks. Short messy black hair with a loose fringe. DARK EYEBROWS ANGLED UP
AT THE INNER ENDS, which leave him looking apologetic even when he smiles. Large
brown eyes with a lot of white showing. The narrowest shoulders of the pilots. Olive
flight suit with a chest harness.

IN THE COCKPIT, EVERY CELL: the white flight helmet with the visor up, and the
green oxygen mask unclipped and hanging to one side, so the whole face shows. The
helmet must not hide the eyes or the eyebrows.

EXPRESSIONS, left to right, top row then bottom row - SHEET E, IN THE COCKPIT. Each one as
THIS character would do it, never as a generic face:
Push every expression to the EXTREME - big, exaggerated and unmistakable, like a 90s
arcade cut-in portrait, readable at 108 px. Never subtle, even the quiet ones.
CELL 1 - SURPRISED: eyebrows shot up, eyes wide, mouth a small round O.
CELL 2 - DOUBTFUL: one eyebrow high and one low, eyes to the side, mouth pulled hard to one side.
CELL 3 - THINKING: eyes up and to the side, lips pushed out, one eyebrow raised.
CELL 4 - TALKING: the neutral face, mouth open mid-word, eyebrows slightly raised.
CELL 5 - TENDERNESS: soft wet eyes, eyebrows gently up, a small closed-mouth smile - thinking of someone loved.
CELL 6 - FAR AWAY: eyes looking off into the distance at nothing, a faint sad smile, eyebrows up.
CELL 7 - FIGHTING TEARS: chin trembling, lips pressed tight, eyes full of tears, eyebrows pinched up.
CELL 8 - SAD SMILE: eyebrows up in the middle, eyes wet, the mouth smiling anyway.
CELL 9 - PROUD: chin up high, a firm small smile, eyes bright.
CELL 10 - EXHAUSTED: eyelids almost shut, head drooping, mouth hanging slack - about to fall asleep.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `pichon_av_sorpresa pichon_av_duda pichon_av_pensativo pichon_av_hablando pichon_av_ternura pichon_av_mirada_perdida pichon_av_aguanta_llanto pichon_av_sonrisa_triste pichon_av_orgullo pichon_av_agotado`

---

## TURCO

### Tira A

**Adjuntar (chat nuevo):** `final/turco3.png` *(IMAGE 1)* · `final/team.png` *(IMAGE 2)*

```
Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SHEET LAYOUT: a single horizontal strip of SIX SQUARE cells in one row, edge to
edge, no gaps, no borders drawn between them. The finished image is exactly six
times as wide as it is tall. Each cell contains the SAME character as a portrait
bust - chest up, three-quarter view facing slightly LEFT, eyes toward camera.
Identical framing and identical scale in every cell: the head is the same size and
the eyes sit at the same height in all of them. The bottom edge cuts across the
upper chest; arms and hands are outside the frame. Leave a little clear space
above the hair. The ONLY difference between cells is the facial expression.
BUST ONLY: nothing below the upper chest - no legs, no boots, no full bodies, even
if the attached images show full figures.
BACKGROUND: flat neutral mid-grey (about #808080), the same grey behind the figure
in every cell. No scenery, no props, no vignette, no gradient, no shadow cast on the
background.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is this character's finished model sheet. Copy his clothing, his colouring
and his line work exactly, and match its rendering precisely: same line weight,
same shading, same flat mid-grey background.
IMAGE 2 is the full cast line-up. This character is the SEVENTH figure. Copy his
build and his face from there. The other seven are the rest of the cast and he must
stay clearly different from every one of them.

INTENT, and this matters more than any feature below: he is THE GRUMPY CRAFTSMAN who does everything with care. The grumbling is the surface;
the care is the man.

CHARACTER, identical in every cell:
The squadron mechanic, fifties, heavy-set. Syrian-Lebanese Argentine features, strongly
drawn: a LARGE, BROAD, PROMINENT NOSE, slightly bulbous at the tip, which dominates
the whole face. THE DARKEST, most weathered skin of the cast. VERY THICK ARCHED
EYEBROWS, black going grey. LARGE PROTRUDING EYES with a lot of white. A wide WHITE
moustache covering the upper lip, and a short white beard on the chin. Large ears
standing out. BALD ON TOP with grey at the sides. HE ALWAYS WEARS A KHAKI CLOTH CAP
WITH AVIATOR GOGGLES RESTING ON IT - the cap and goggles appear in ALL SIX cells,
they are how he is recognised. Stained blue-grey coverall collar at the neck.

EXPRESSIONS, left to right:
CELL 1 - NEUTRAL: eyebrows down, mouth hidden under the moustache, unimpressed. His default.
CELL 2 - SMILE: the same gruff face with one crooked corner of the mouth lifted and the eyes gone warm. Tenderness he would deny having.
CELL 3 - WORRIED: the big eyebrows up, eyes wider, mouth open under the moustache. Alarm on a man who is never alarmed.
CELL 4 - ANGER: eyebrows down hard, eyes fixed. The look he gives a job done badly.
CELL 5 - BROKEN: eyebrows collapsed, eyes closed or nearly, head lowered.
CELL 6 - PRIDE - chin slightly up, eyes bright, a small closed satisfied smile under the
  moustache. The face he makes when everyone came back.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `turco_neutro turco_sonrisa turco_preocupado turco_ceno turco_roto turco_orgullo`

### Tira B

**Adjuntar (chat nuevo), en este orden:** `final/turco3.png` *(IMAGE 1)* · la **Tira A** de este personaje que haya salido bien *(IMAGE 2)*.

```
DRAW A NEW IMAGE FROM SCRATCH. Do NOT return IMAGE 2, do NOT edit it, do NOT repeat
any of its faces. Every cell of the new strip shows one of the NEW expressions
listed below.

Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SHEET LAYOUT: a single horizontal strip of SIX SQUARE cells in one row, edge to
edge, no gaps, no borders drawn between them. The finished image is exactly six
times as wide as it is tall. Each cell contains the SAME character as a portrait
bust - chest up, three-quarter view facing slightly LEFT, eyes toward camera.
Identical framing and identical scale in every cell: the head is the same size and
the eyes sit at the same height in all of them. The bottom edge cuts across the
upper chest; arms and hands are outside the frame. Leave a little clear space
above the hair. The ONLY difference between cells is the facial expression.
BUST ONLY: nothing below the upper chest - no legs, no boots, no full bodies, even
if the attached images show full figures.
BACKGROUND: flat neutral mid-grey (about #808080), the same grey behind the figure
in every cell. No scenery, no props, no vignette, no gradient, no shadow cast on the
background.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is this character's finished model sheet. Copy his clothing, his colouring
and his line work exactly, and match its rendering precisely: same line weight,
same shading, same flat mid-grey background.
IMAGE 2 is STRIP A of THIS SAME MAN, already finished - a reference only. He must be
the same person: same face, same head shape, same hairline, same clothing, same
colours, same grey background, same framing, the head as big in the cell as it is
there. Only the expressions change.

INTENT, and this matters more than any feature below: he is THE GRUMPY CRAFTSMAN who does everything with care. The grumbling is the surface;
the care is the man.

CHARACTER, identical in every cell:
The squadron mechanic, fifties, heavy-set. Syrian-Lebanese Argentine features, strongly
drawn: a LARGE, BROAD, PROMINENT NOSE, slightly bulbous at the tip, which dominates
the whole face. THE DARKEST, most weathered skin of the cast. VERY THICK ARCHED
EYEBROWS, black going grey. LARGE PROTRUDING EYES with a lot of white. A wide WHITE
moustache covering the upper lip, and a short white beard on the chin. Large ears
standing out. BALD ON TOP with grey at the sides. HE ALWAYS WEARS A KHAKI CLOTH CAP
WITH AVIATOR GOGGLES RESTING ON IT - the cap and goggles appear in ALL SIX cells,
they are how he is recognised. Stained blue-grey coverall collar at the neck.

EXPRESSIONS, left to right - STRIP B, the strong ones. Each one as THIS character
would do it, never as a generic face:
CELL 1 - LAUGHING: a real laugh, mouth wide open, eyes squeezed almost shut, head
  tipped slightly back.
CELL 2 - AFRAID: eyes wide with white showing, eyebrows up and pulled together,
  mouth open and tense.
CELL 3 - SHOUTING IN ANGER: eyebrows hard down, mouth wide open in a shout, teeth
  showing, head pushed forward.
CELL 4 - CRYING: eyebrows high and pinched in the middle, eyes squeezed, mouth turned
  down and trembling, one or two simple pixel tear lines on the cheek.
CELL 5 - RELIEVED: eyes closed, eyebrows relaxed upward, a long breath out, a small
  tired smile, head tilted a little back.
CELL 6 - DETERMINED: eyebrows low and level, eyes narrowed and fixed ahead, jaw set,
  mouth a firm line, head slightly forward.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `turco_risa turco_miedo turco_grito turco_llanto turco_alivio turco_decidido`

### Hoja C — las grandes (grilla 5×2)

**Adjuntar (chat nuevo), en este orden:** `final/turco3.png` *(IMAGE 1)* · la **Tira A** de este personaje que haya salido bien *(IMAGE 2)*.

```
DRAW A NEW IMAGE FROM SCRATCH. Do NOT return IMAGE 2, do NOT edit it, do NOT repeat
any of its faces. Every cell of the new sheet shows one of the NEW expressions
listed below.

Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SHEET LAYOUT: a GRID of TEN SQUARE cells, FIVE columns and TWO rows - exactly two
rows, not three - edge to edge, no gaps, no borders drawn between them. The finished
image is two and a half times as wide as it is tall. Each cell contains the SAME
character as a portrait bust - chest up, three-quarter view facing slightly LEFT,
eyes toward camera. Identical framing and identical scale in every cell: the head is
the same size and the eyes sit at the same height in all of them. The bottom edge
cuts across the upper chest; arms and hands are outside the frame. Leave a little clear space above the head.
The ONLY difference between cells is the facial expression.
BUST ONLY: nothing below the upper chest - no legs, no boots, no full bodies, even
if the attached images show full figures.
BACKGROUND: flat neutral mid-grey (about #808080), the same grey behind the figure
in every cell. No scenery, no props, no vignette, no gradient, no shadow cast on the
background.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is this character's finished model sheet. Copy his clothing, his colouring
and his line work exactly, and match its rendering precisely: same line weight,
same shading, same flat mid-grey background.
IMAGE 2 is STRIP A of THIS SAME MAN, already finished - a reference only. He must be
the same person: same face, same head shape, same hairline, same clothing, same
colours, same grey background, same framing, the head as big in the cell as it is
there. Only the expressions change.

INTENT, and this matters more than any feature below: he is THE GRUMPY CRAFTSMAN who does everything with care. The grumbling is the surface;
the care is the man.

CHARACTER, identical in every cell:
The squadron mechanic, fifties, heavy-set. Syrian-Lebanese Argentine features, strongly
drawn: a LARGE, BROAD, PROMINENT NOSE, slightly bulbous at the tip, which dominates
the whole face. THE DARKEST, most weathered skin of the cast. VERY THICK ARCHED
EYEBROWS, black going grey. LARGE PROTRUDING EYES with a lot of white. A wide WHITE
moustache covering the upper lip, and a short white beard on the chin. Large ears
standing out. BALD ON TOP with grey at the sides. HE ALWAYS WEARS A KHAKI CLOTH CAP
WITH AVIATOR GOGGLES RESTING ON IT - the cap and goggles appear in ALL SIX cells,
they are how he is recognised. Stained blue-grey coverall collar at the neck.

EXPRESSIONS, left to right, top row then bottom row - SHEET C. Each one as
THIS character would do it, never as a generic face:
Push every expression to the EXTREME - big, exaggerated and unmistakable, like a 90s
arcade cut-in portrait, readable at 108 px. Never subtle, even the quiet ones.
CELL 1 - LAUGHING TILL CRYING: mouth thrown wide open, eyes squeezed shut, tears of laughter flying from the corners, head thrown far back.
CELL 2 - PANIC: eyes huge with tiny pupils, mouth stretched open in a scream, eyebrows at the top of the forehead, sweat drops flying.
CELL 3 - RED WITH RAGE: face flushed dark red, teeth bared and clenched, eyebrows crushed down, a vein bulging on the forehead.
CELL 4 - SOBBING: mouth wide open and wailing, eyebrows high and pinched, eyes shut, streams of tears down both cheeks.
CELL 5 - JAW DROP: mouth hanging enormously open, eyes huge, eyebrows shot up as high as they go.
CELL 6 - DISGUSTED: nose wrinkled hard, upper lip curled up to the nose, eyes squinting, head pulled far back.
CELL 7 - IN SHOCK: frozen, face drained pale, eyes wide and fixed on nothing, mouth slightly open.
CELL 8 - IN PAIN: eyes squeezed shut, teeth clenched, the whole face scrunched to one side.
CELL 9 - EUPHORIC: shouting with joy, mouth wide open, eyes shut, eyebrows up, head tipped back.
CELL 10 - STARTLED: head jerked back, eyes popping, mouth snapped open, shoulders up to the ears.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `turco_carcajada turco_panico turco_furia turco_llanto turco_mandibula turco_asco turco_shock turco_dolor turco_euforia turco_sobresalto`

### Hoja D — las incómodas y las pícaras (grilla 5×2)

**Adjuntar (chat nuevo), en este orden:** `final/turco3.png` *(IMAGE 1)* · la **Tira A** de este personaje que haya salido bien *(IMAGE 2)*.

```
DRAW A NEW IMAGE FROM SCRATCH. Do NOT return IMAGE 2, do NOT edit it, do NOT repeat
any of its faces. Every cell of the new sheet shows one of the NEW expressions
listed below.

Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SHEET LAYOUT: a GRID of TEN SQUARE cells, FIVE columns and TWO rows - exactly two
rows, not three - edge to edge, no gaps, no borders drawn between them. The finished
image is two and a half times as wide as it is tall. Each cell contains the SAME
character as a portrait bust - chest up, three-quarter view facing slightly LEFT,
eyes toward camera. Identical framing and identical scale in every cell: the head is
the same size and the eyes sit at the same height in all of them. The bottom edge
cuts across the upper chest; arms and hands are outside the frame. Leave a little clear space above the head.
The ONLY difference between cells is the facial expression.
BUST ONLY: nothing below the upper chest - no legs, no boots, no full bodies, even
if the attached images show full figures.
BACKGROUND: flat neutral mid-grey (about #808080), the same grey behind the figure
in every cell. No scenery, no props, no vignette, no gradient, no shadow cast on the
background.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is this character's finished model sheet. Copy his clothing, his colouring
and his line work exactly, and match its rendering precisely: same line weight,
same shading, same flat mid-grey background.
IMAGE 2 is STRIP A of THIS SAME MAN, already finished - a reference only. He must be
the same person: same face, same head shape, same hairline, same clothing, same
colours, same grey background, same framing, the head as big in the cell as it is
there. Only the expressions change.

INTENT, and this matters more than any feature below: he is THE GRUMPY CRAFTSMAN who does everything with care. The grumbling is the surface;
the care is the man.

CHARACTER, identical in every cell:
The squadron mechanic, fifties, heavy-set. Syrian-Lebanese Argentine features, strongly
drawn: a LARGE, BROAD, PROMINENT NOSE, slightly bulbous at the tip, which dominates
the whole face. THE DARKEST, most weathered skin of the cast. VERY THICK ARCHED
EYEBROWS, black going grey. LARGE PROTRUDING EYES with a lot of white. A wide WHITE
moustache covering the upper lip, and a short white beard on the chin. Large ears
standing out. BALD ON TOP with grey at the sides. HE ALWAYS WEARS A KHAKI CLOTH CAP
WITH AVIATOR GOGGLES RESTING ON IT - the cap and goggles appear in ALL SIX cells,
they are how he is recognised. Stained blue-grey coverall collar at the neck.

EXPRESSIONS, left to right, top row then bottom row - SHEET D. Each one as
THIS character would do it, never as a generic face:
Push every expression to the EXTREME - big, exaggerated and unmistakable, like a 90s
arcade cut-in portrait, readable at 108 px. Never subtle, even the quiet ones.
CELL 1 - AWKWARD: head perfectly still, eyes sliding sideways toward the camera, lips pressed together and pulled to one side in a tight uneasy half-smile - caught in an uncomfortable moment.
CELL 2 - HOLDING IN A LAUGH: cheeks puffed out, lips pressed tight and wobbling, eyes crinkled and watering.
CELL 3 - "REALLY?": a totally flat deadpan face, eyelids half down, eyebrows level, staring straight at the camera.
CELL 4 - SUSPICIOUS SIDE-EYE: head turned away, eyes sliding hard to the side, one eyebrow down, mouth flat.
CELL 5 - GRIMACE: teeth clenched and showing in a wide stiff line, eyebrows up, eyes wide - "uh oh".
CELL 6 - SMUG: chin up, eyelids half down, a slow one-sided smirk, one eyebrow raised high.
CELL 7 - EYE ROLL: eyes rolled all the way up, eyelids half down, mouth twisted to one side.
CELL 8 - WINK: one eye shut tight, a big cheeky half-smile.
CELL 9 - TONGUE OUT: tongue stuck far out in a teasing face, eyes squinting playfully.
CELL 10 - NERVOUS LAUGH: a huge forced smile, eyebrows up and apart, eyes darting, big drops of sweat on the temple.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `turco_incomodo turco_aguanta_risa turco_en_serio turco_de_reojo turco_yikes turco_sobrador turco_ojos_blanco turco_guino turco_lengua turco_risa_nerviosa`

### Hoja E — las de todos los días y las profundas (grilla 5×2)

**Adjuntar (chat nuevo), en este orden:** `final/turco3.png` *(IMAGE 1)* · la **Tira A** de este personaje que haya salido bien *(IMAGE 2)*.

```
DRAW A NEW IMAGE FROM SCRATCH. Do NOT return IMAGE 2, do NOT edit it, do NOT repeat
any of its faces. Every cell of the new sheet shows one of the NEW expressions
listed below.

Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SHEET LAYOUT: a GRID of TEN SQUARE cells, FIVE columns and TWO rows - exactly two
rows, not three - edge to edge, no gaps, no borders drawn between them. The finished
image is two and a half times as wide as it is tall. Each cell contains the SAME
character as a portrait bust - chest up, three-quarter view facing slightly LEFT,
eyes toward camera. Identical framing and identical scale in every cell: the head is
the same size and the eyes sit at the same height in all of them. The bottom edge
cuts across the upper chest; arms and hands are outside the frame. Leave a little clear space above the head.
The ONLY difference between cells is the facial expression.
BUST ONLY: nothing below the upper chest - no legs, no boots, no full bodies, even
if the attached images show full figures.
BACKGROUND: flat neutral mid-grey (about #808080), the same grey behind the figure
in every cell. No scenery, no props, no vignette, no gradient, no shadow cast on the
background.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is this character's finished model sheet. Copy his clothing, his colouring
and his line work exactly, and match its rendering precisely: same line weight,
same shading, same flat mid-grey background.
IMAGE 2 is STRIP A of THIS SAME MAN, already finished - a reference only. He must be
the same person: same face, same head shape, same hairline, same clothing, same
colours, same grey background, same framing, the head as big in the cell as it is
there. Only the expressions change.

INTENT, and this matters more than any feature below: he is THE GRUMPY CRAFTSMAN who does everything with care. The grumbling is the surface;
the care is the man.

CHARACTER, identical in every cell:
The squadron mechanic, fifties, heavy-set. Syrian-Lebanese Argentine features, strongly
drawn: a LARGE, BROAD, PROMINENT NOSE, slightly bulbous at the tip, which dominates
the whole face. THE DARKEST, most weathered skin of the cast. VERY THICK ARCHED
EYEBROWS, black going grey. LARGE PROTRUDING EYES with a lot of white. A wide WHITE
moustache covering the upper lip, and a short white beard on the chin. Large ears
standing out. BALD ON TOP with grey at the sides. HE ALWAYS WEARS A KHAKI CLOTH CAP
WITH AVIATOR GOGGLES RESTING ON IT - the cap and goggles appear in ALL SIX cells,
they are how he is recognised. Stained blue-grey coverall collar at the neck.

EXPRESSIONS, left to right, top row then bottom row - SHEET E. Each one as
THIS character would do it, never as a generic face:
Push every expression to the EXTREME - big, exaggerated and unmistakable, like a 90s
arcade cut-in portrait, readable at 108 px. Never subtle, even the quiet ones.
CELL 1 - SURPRISED: eyebrows shot up, eyes wide, mouth a small round O.
CELL 2 - DOUBTFUL: one eyebrow high and one low, eyes to the side, mouth pulled hard to one side.
CELL 3 - THINKING: eyes up and to the side, lips pushed out, one eyebrow raised.
CELL 4 - TALKING: the neutral face, mouth open mid-word, eyebrows slightly raised.
CELL 5 - TENDERNESS: soft wet eyes, eyebrows gently up, a small closed-mouth smile - thinking of someone loved.
CELL 6 - FAR AWAY: eyes looking off into the distance at nothing, a faint sad smile, eyebrows up.
CELL 7 - FIGHTING TEARS: chin trembling, lips pressed tight, eyes full of tears, eyebrows pinched up.
CELL 8 - SAD SMILE: eyebrows up in the middle, eyes wet, the mouth smiling anyway.
CELL 9 - PROUD: chin up high, a firm small smile, eyes bright.
CELL 10 - EXHAUSTED: eyelids almost shut, head drooping, mouth hanging slack - about to fall asleep.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `turco_sorpresa turco_duda turco_pensativo turco_hablando turco_ternura turco_mirada_perdida turco_aguanta_llanto turco_sonrisa_triste turco_orgullo turco_agotado`

---

## MATEO

### Tira A

**Adjuntar (chat nuevo):** `final/mato32.png` *(IMAGE 1)* · `final/team.png` *(IMAGE 2)*

```
Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SHEET LAYOUT: a single horizontal strip of SIX SQUARE cells in one row, edge to
edge, no gaps, no borders drawn between them. The finished image is exactly six
times as wide as it is tall. Each cell contains the SAME character as a portrait
bust - chest up, three-quarter view facing slightly LEFT, eyes toward camera.
Identical framing and identical scale in every cell: the head is the same size and
the eyes sit at the same height in all of them. The bottom edge cuts across the
upper chest; arms and hands are outside the frame. Leave a little clear space
above the hair. The ONLY difference between cells is the facial expression.
BUST ONLY: nothing below the upper chest - no legs, no boots, no full bodies, even
if the attached images show full figures.
BACKGROUND: flat neutral mid-grey (about #808080), the same grey behind the figure
in every cell. No scenery, no props, no vignette, no gradient, no shadow cast on the
background.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is this character's finished model sheet. Copy his clothing, his colouring
and his line work exactly, and match its rendering precisely: same line weight,
same shading, same flat mid-grey background.
IMAGE 2 is the full cast line-up. This character is the SECOND figure. Copy his
build and his face from there. The other seven are the rest of the cast and he must
stay clearly different from every one of them.

INTENT, and this matters more than any feature below: he is THE BOY WHO WRITES. He is eighteen and he is trying to sound fine in every letter.

CHARACTER, identical in every cell:
An 18-year-old Argentine conscript. HEAD SHAVED to the scalp, military crop. Golden
tanned criollo skin. TRIANGULAR face: narrow jaw, pointed chin. THICK STRAIGHT BLACK
EYEBROWS. LARGE dark brown eyes, very expressive. Ears standing out. He must read as
the son of the gaunt pilot in the line-up: same eye shape, same nose. Olive winter
parka with a pale synthetic fur hood collar.

EXPRESSIONS, left to right:
CELL 1 - NEUTRAL: mouth closed, eyebrows level, looking straight out. Younger than he is trying to look.
CELL 2 - SMILE: an easy young closed-mouth grin, a bit cheeky. Nothing has happened to him yet.
CELL 3 - WORRIED: eyebrows up and pinched, eyes wide, mouth small. Trying not to show it.
CELL 4 - ANGER: eyebrows down, mouth tight. Anger that has nowhere to go.
CELL 5 - BROKEN: eyes wet, mouth open, face undefended. He is still a kid.
CELL 6 - COLD - jaw clenched, shoulders drawn up into the frame, eyebrows pinched, the fur
  hood pulled up over the shaved head. Not sad, just very very cold.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `mateo_neutro mateo_sonrisa mateo_preocupado mateo_ceno mateo_roto mateo_frio`

### Tira B

**Adjuntar (chat nuevo), en este orden:** `final/mato32.png` *(IMAGE 1)* · la **Tira A** de este personaje que haya salido bien *(IMAGE 2)*.

```
DRAW A NEW IMAGE FROM SCRATCH. Do NOT return IMAGE 2, do NOT edit it, do NOT repeat
any of its faces. Every cell of the new strip shows one of the NEW expressions
listed below.

Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SHEET LAYOUT: a single horizontal strip of SIX SQUARE cells in one row, edge to
edge, no gaps, no borders drawn between them. The finished image is exactly six
times as wide as it is tall. Each cell contains the SAME character as a portrait
bust - chest up, three-quarter view facing slightly LEFT, eyes toward camera.
Identical framing and identical scale in every cell: the head is the same size and
the eyes sit at the same height in all of them. The bottom edge cuts across the
upper chest; arms and hands are outside the frame. Leave a little clear space
above the hair. The ONLY difference between cells is the facial expression.
BUST ONLY: nothing below the upper chest - no legs, no boots, no full bodies, even
if the attached images show full figures.
BACKGROUND: flat neutral mid-grey (about #808080), the same grey behind the figure
in every cell. No scenery, no props, no vignette, no gradient, no shadow cast on the
background.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is this character's finished model sheet. Copy his clothing, his colouring
and his line work exactly, and match its rendering precisely: same line weight,
same shading, same flat mid-grey background.
IMAGE 2 is STRIP A of THIS SAME MAN, already finished - a reference only. He must be
the same person: same face, same head shape, same hairline, same clothing, same
colours, same grey background, same framing, the head as big in the cell as it is
there. Only the expressions change.

INTENT, and this matters more than any feature below: he is THE BOY WHO WRITES. He is eighteen and he is trying to sound fine in every letter.

CHARACTER, identical in every cell:
An 18-year-old Argentine conscript. HEAD SHAVED to the scalp, military crop. Golden
tanned criollo skin. TRIANGULAR face: narrow jaw, pointed chin. THICK STRAIGHT BLACK
EYEBROWS. LARGE dark brown eyes, very expressive. Ears standing out. He must read as
the son of the gaunt pilot in the line-up: same eye shape, same nose. Olive winter
parka with a pale synthetic fur hood collar.

EXPRESSIONS, left to right - STRIP B, the strong ones. Each one as THIS character
would do it, never as a generic face:
CELL 1 - LAUGHING: a real laugh, mouth wide open, eyes squeezed almost shut, head
  tipped slightly back.
CELL 2 - AFRAID: eyes wide with white showing, eyebrows up and pulled together,
  mouth open and tense.
CELL 3 - SHOUTING IN ANGER: eyebrows hard down, mouth wide open in a shout, teeth
  showing, head pushed forward.
CELL 4 - CRYING: eyebrows high and pinched in the middle, eyes squeezed, mouth turned
  down and trembling, one or two simple pixel tear lines on the cheek.
CELL 5 - RELIEVED: eyes closed, eyebrows relaxed upward, a long breath out, a small
  tired smile, head tilted a little back.
CELL 6 - DETERMINED: eyebrows low and level, eyes narrowed and fixed ahead, jaw set,
  mouth a firm line, head slightly forward.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `mateo_risa mateo_miedo mateo_grito mateo_llanto mateo_alivio mateo_decidido`

### Hoja C — las grandes (grilla 5×2)

**Adjuntar (chat nuevo), en este orden:** `final/mato32.png` *(IMAGE 1)* · la **Tira A** de este personaje que haya salido bien *(IMAGE 2)*.

```
DRAW A NEW IMAGE FROM SCRATCH. Do NOT return IMAGE 2, do NOT edit it, do NOT repeat
any of its faces. Every cell of the new sheet shows one of the NEW expressions
listed below.

Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SHEET LAYOUT: a GRID of TEN SQUARE cells, FIVE columns and TWO rows - exactly two
rows, not three - edge to edge, no gaps, no borders drawn between them. The finished
image is two and a half times as wide as it is tall. Each cell contains the SAME
character as a portrait bust - chest up, three-quarter view facing slightly LEFT,
eyes toward camera. Identical framing and identical scale in every cell: the head is
the same size and the eyes sit at the same height in all of them. The bottom edge
cuts across the upper chest; arms and hands are outside the frame. Leave a little clear space above the head.
The ONLY difference between cells is the facial expression.
BUST ONLY: nothing below the upper chest - no legs, no boots, no full bodies, even
if the attached images show full figures.
BACKGROUND: flat neutral mid-grey (about #808080), the same grey behind the figure
in every cell. No scenery, no props, no vignette, no gradient, no shadow cast on the
background.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is this character's finished model sheet. Copy his clothing, his colouring
and his line work exactly, and match its rendering precisely: same line weight,
same shading, same flat mid-grey background.
IMAGE 2 is STRIP A of THIS SAME MAN, already finished - a reference only. He must be
the same person: same face, same head shape, same hairline, same clothing, same
colours, same grey background, same framing, the head as big in the cell as it is
there. Only the expressions change.

INTENT, and this matters more than any feature below: he is THE BOY WHO WRITES. He is eighteen and he is trying to sound fine in every letter.

CHARACTER, identical in every cell:
An 18-year-old Argentine conscript. HEAD SHAVED to the scalp, military crop. Golden
tanned criollo skin. TRIANGULAR face: narrow jaw, pointed chin. THICK STRAIGHT BLACK
EYEBROWS. LARGE dark brown eyes, very expressive. Ears standing out. He must read as
the son of the gaunt pilot in the line-up: same eye shape, same nose. Olive winter
parka with a pale synthetic fur hood collar.

EXPRESSIONS, left to right, top row then bottom row - SHEET C. Each one as
THIS character would do it, never as a generic face:
Push every expression to the EXTREME - big, exaggerated and unmistakable, like a 90s
arcade cut-in portrait, readable at 108 px. Never subtle, even the quiet ones.
CELL 1 - LAUGHING TILL CRYING: mouth thrown wide open, eyes squeezed shut, tears of laughter flying from the corners, head thrown far back.
CELL 2 - PANIC: eyes huge with tiny pupils, mouth stretched open in a scream, eyebrows at the top of the forehead, sweat drops flying.
CELL 3 - RED WITH RAGE: face flushed dark red, teeth bared and clenched, eyebrows crushed down, a vein bulging on the forehead.
CELL 4 - SOBBING: mouth wide open and wailing, eyebrows high and pinched, eyes shut, streams of tears down both cheeks.
CELL 5 - JAW DROP: mouth hanging enormously open, eyes huge, eyebrows shot up as high as they go.
CELL 6 - DISGUSTED: nose wrinkled hard, upper lip curled up to the nose, eyes squinting, head pulled far back.
CELL 7 - IN SHOCK: frozen, face drained pale, eyes wide and fixed on nothing, mouth slightly open.
CELL 8 - IN PAIN: eyes squeezed shut, teeth clenched, the whole face scrunched to one side.
CELL 9 - EUPHORIC: shouting with joy, mouth wide open, eyes shut, eyebrows up, head tipped back.
CELL 10 - STARTLED: head jerked back, eyes popping, mouth snapped open, shoulders up to the ears.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `mateo_carcajada mateo_panico mateo_furia mateo_llanto mateo_mandibula mateo_asco mateo_shock mateo_dolor mateo_euforia mateo_sobresalto`

### Hoja D — las incómodas y las pícaras (grilla 5×2)

**Adjuntar (chat nuevo), en este orden:** `final/mato32.png` *(IMAGE 1)* · la **Tira A** de este personaje que haya salido bien *(IMAGE 2)*.

```
DRAW A NEW IMAGE FROM SCRATCH. Do NOT return IMAGE 2, do NOT edit it, do NOT repeat
any of its faces. Every cell of the new sheet shows one of the NEW expressions
listed below.

Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SHEET LAYOUT: a GRID of TEN SQUARE cells, FIVE columns and TWO rows - exactly two
rows, not three - edge to edge, no gaps, no borders drawn between them. The finished
image is two and a half times as wide as it is tall. Each cell contains the SAME
character as a portrait bust - chest up, three-quarter view facing slightly LEFT,
eyes toward camera. Identical framing and identical scale in every cell: the head is
the same size and the eyes sit at the same height in all of them. The bottom edge
cuts across the upper chest; arms and hands are outside the frame. Leave a little clear space above the head.
The ONLY difference between cells is the facial expression.
BUST ONLY: nothing below the upper chest - no legs, no boots, no full bodies, even
if the attached images show full figures.
BACKGROUND: flat neutral mid-grey (about #808080), the same grey behind the figure
in every cell. No scenery, no props, no vignette, no gradient, no shadow cast on the
background.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is this character's finished model sheet. Copy his clothing, his colouring
and his line work exactly, and match its rendering precisely: same line weight,
same shading, same flat mid-grey background.
IMAGE 2 is STRIP A of THIS SAME MAN, already finished - a reference only. He must be
the same person: same face, same head shape, same hairline, same clothing, same
colours, same grey background, same framing, the head as big in the cell as it is
there. Only the expressions change.

INTENT, and this matters more than any feature below: he is THE BOY WHO WRITES. He is eighteen and he is trying to sound fine in every letter.

CHARACTER, identical in every cell:
An 18-year-old Argentine conscript. HEAD SHAVED to the scalp, military crop. Golden
tanned criollo skin. TRIANGULAR face: narrow jaw, pointed chin. THICK STRAIGHT BLACK
EYEBROWS. LARGE dark brown eyes, very expressive. Ears standing out. He must read as
the son of the gaunt pilot in the line-up: same eye shape, same nose. Olive winter
parka with a pale synthetic fur hood collar.

EXPRESSIONS, left to right, top row then bottom row - SHEET D. Each one as
THIS character would do it, never as a generic face:
Push every expression to the EXTREME - big, exaggerated and unmistakable, like a 90s
arcade cut-in portrait, readable at 108 px. Never subtle, even the quiet ones.
CELL 1 - AWKWARD: head perfectly still, eyes sliding sideways toward the camera, lips pressed together and pulled to one side in a tight uneasy half-smile - caught in an uncomfortable moment.
CELL 2 - HOLDING IN A LAUGH: cheeks puffed out, lips pressed tight and wobbling, eyes crinkled and watering.
CELL 3 - "REALLY?": a totally flat deadpan face, eyelids half down, eyebrows level, staring straight at the camera.
CELL 4 - SUSPICIOUS SIDE-EYE: head turned away, eyes sliding hard to the side, one eyebrow down, mouth flat.
CELL 5 - GRIMACE: teeth clenched and showing in a wide stiff line, eyebrows up, eyes wide - "uh oh".
CELL 6 - SMUG: chin up, eyelids half down, a slow one-sided smirk, one eyebrow raised high.
CELL 7 - EYE ROLL: eyes rolled all the way up, eyelids half down, mouth twisted to one side.
CELL 8 - WINK: one eye shut tight, a big cheeky half-smile.
CELL 9 - TONGUE OUT: tongue stuck far out in a teasing face, eyes squinting playfully.
CELL 10 - NERVOUS LAUGH: a huge forced smile, eyebrows up and apart, eyes darting, big drops of sweat on the temple.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `mateo_incomodo mateo_aguanta_risa mateo_en_serio mateo_de_reojo mateo_yikes mateo_sobrador mateo_ojos_blanco mateo_guino mateo_lengua mateo_risa_nerviosa`

### Hoja E — las de todos los días y las profundas (grilla 5×2)

**Adjuntar (chat nuevo), en este orden:** `final/mato32.png` *(IMAGE 1)* · la **Tira A** de este personaje que haya salido bien *(IMAGE 2)*.

```
DRAW A NEW IMAGE FROM SCRATCH. Do NOT return IMAGE 2, do NOT edit it, do NOT repeat
any of its faces. Every cell of the new sheet shows one of the NEW expressions
listed below.

Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SHEET LAYOUT: a GRID of TEN SQUARE cells, FIVE columns and TWO rows - exactly two
rows, not three - edge to edge, no gaps, no borders drawn between them. The finished
image is two and a half times as wide as it is tall. Each cell contains the SAME
character as a portrait bust - chest up, three-quarter view facing slightly LEFT,
eyes toward camera. Identical framing and identical scale in every cell: the head is
the same size and the eyes sit at the same height in all of them. The bottom edge
cuts across the upper chest; arms and hands are outside the frame. Leave a little clear space above the head.
The ONLY difference between cells is the facial expression.
BUST ONLY: nothing below the upper chest - no legs, no boots, no full bodies, even
if the attached images show full figures.
BACKGROUND: flat neutral mid-grey (about #808080), the same grey behind the figure
in every cell. No scenery, no props, no vignette, no gradient, no shadow cast on the
background.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is this character's finished model sheet. Copy his clothing, his colouring
and his line work exactly, and match its rendering precisely: same line weight,
same shading, same flat mid-grey background.
IMAGE 2 is STRIP A of THIS SAME MAN, already finished - a reference only. He must be
the same person: same face, same head shape, same hairline, same clothing, same
colours, same grey background, same framing, the head as big in the cell as it is
there. Only the expressions change.

INTENT, and this matters more than any feature below: he is THE BOY WHO WRITES. He is eighteen and he is trying to sound fine in every letter.

CHARACTER, identical in every cell:
An 18-year-old Argentine conscript. HEAD SHAVED to the scalp, military crop. Golden
tanned criollo skin. TRIANGULAR face: narrow jaw, pointed chin. THICK STRAIGHT BLACK
EYEBROWS. LARGE dark brown eyes, very expressive. Ears standing out. He must read as
the son of the gaunt pilot in the line-up: same eye shape, same nose. Olive winter
parka with a pale synthetic fur hood collar.

EXPRESSIONS, left to right, top row then bottom row - SHEET E. Each one as
THIS character would do it, never as a generic face:
Push every expression to the EXTREME - big, exaggerated and unmistakable, like a 90s
arcade cut-in portrait, readable at 108 px. Never subtle, even the quiet ones.
CELL 1 - SURPRISED: eyebrows shot up, eyes wide, mouth a small round O.
CELL 2 - DOUBTFUL: one eyebrow high and one low, eyes to the side, mouth pulled hard to one side.
CELL 3 - THINKING: eyes up and to the side, lips pushed out, one eyebrow raised.
CELL 4 - TALKING: the neutral face, mouth open mid-word, eyebrows slightly raised.
CELL 5 - TENDERNESS: soft wet eyes, eyebrows gently up, a small closed-mouth smile - thinking of someone loved.
CELL 6 - FAR AWAY: eyes looking off into the distance at nothing, a faint sad smile, eyebrows up.
CELL 7 - FIGHTING TEARS: chin trembling, lips pressed tight, eyes full of tears, eyebrows pinched up.
CELL 8 - SAD SMILE: eyebrows up in the middle, eyes wet, the mouth smiling anyway.
CELL 9 - PROUD: chin up high, a firm small smile, eyes bright.
CELL 10 - EXHAUSTED: eyelids almost shut, head drooping, mouth hanging slack - about to fall asleep.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `mateo_sorpresa mateo_duda mateo_pensativo mateo_hablando mateo_ternura mateo_mirada_perdida mateo_aguanta_llanto mateo_sonrisa_triste mateo_orgullo mateo_agotado`

---

## COLORADO

### Tira A

**Adjuntar (chat nuevo):** `final/colorado3.png` *(IMAGE 1)* · `final/team.png` *(IMAGE 2)*

```
Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SHEET LAYOUT: a single horizontal strip of SIX SQUARE cells in one row, edge to
edge, no gaps, no borders drawn between them. The finished image is exactly six
times as wide as it is tall. Each cell contains the SAME character as a portrait
bust - chest up, three-quarter view facing slightly LEFT, eyes toward camera.
Identical framing and identical scale in every cell: the head is the same size and
the eyes sit at the same height in all of them. The bottom edge cuts across the
upper chest; arms and hands are outside the frame. Leave a little clear space
above the hair. The ONLY difference between cells is the facial expression.
BUST ONLY: nothing below the upper chest - no legs, no boots, no full bodies, even
if the attached images show full figures.
BACKGROUND: flat neutral mid-grey (about #808080), the same grey behind the figure
in every cell. No scenery, no props, no vignette, no gradient, no shadow cast on the
background.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is this character's finished model sheet. Copy his clothing, his colouring
and his line work exactly, and match its rendering precisely: same line weight,
same shading, same flat mid-grey background.
IMAGE 2 is the full cast line-up. This character is the FIRST, on the far left figure. Copy his
build and his face from there. The other seven are the rest of the cast and he must
stay clearly different from every one of them.

INTENT, and this matters more than any feature below: he is THE ONE WHO GIVES. Human warmth in a freezing place.

CHARACTER, identical in every cell:
An Argentine army corporal, thirties. VERY FAIR SKIN with STRONG RED FLUSH on the
cheeks and the nose, from the cold - it is his marker. REDDISH FRECKLES. RED HAIR,
mostly hidden under a DARK GREY WOOL BEANIE with a turned-up brim, worn in ALL SIX
cells. RED-BLONDE EYEBROWS, so pale they are almost invisible. LIGHT BLUE EYES. Round
broad face, thick neck. Olive field jacket collar at the neck.

EXPRESSIONS, left to right:
CELL 1 - NEUTRAL: relaxed and open, mouth closed, eyebrows level. Friendly at rest.
CELL 2 - SMILE: a huge open smile with all the teeth showing and dimples. The warmest face in the game.
CELL 3 - WORRIED: eyebrows up and together, eyes softened. Worried about somebody else, not himself.
CELL 4 - ANGER: eyebrows down, jaw forward. Rare on him, and all the louder for it.
CELL 5 - BROKEN: the smile gone completely, eyes down, mouth closed. On this face, absence of the smile is the whole expression.
CELL 6 - OFFERING - head tilted forward and down a little, eyebrows raised in the middle,
  a small encouraging smile, eyes on someone lower than him. The face of a man
  holding something out to you.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `colorado_neutro colorado_sonrisa colorado_preocupado colorado_ceno colorado_roto colorado_ofreciendo`

### Tira B

**Adjuntar (chat nuevo), en este orden:** `final/colorado3.png` *(IMAGE 1)* · la **Tira A** de este personaje que haya salido bien *(IMAGE 2)*.

```
DRAW A NEW IMAGE FROM SCRATCH. Do NOT return IMAGE 2, do NOT edit it, do NOT repeat
any of its faces. Every cell of the new strip shows one of the NEW expressions
listed below.

Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SHEET LAYOUT: a single horizontal strip of SIX SQUARE cells in one row, edge to
edge, no gaps, no borders drawn between them. The finished image is exactly six
times as wide as it is tall. Each cell contains the SAME character as a portrait
bust - chest up, three-quarter view facing slightly LEFT, eyes toward camera.
Identical framing and identical scale in every cell: the head is the same size and
the eyes sit at the same height in all of them. The bottom edge cuts across the
upper chest; arms and hands are outside the frame. Leave a little clear space
above the hair. The ONLY difference between cells is the facial expression.
BUST ONLY: nothing below the upper chest - no legs, no boots, no full bodies, even
if the attached images show full figures.
BACKGROUND: flat neutral mid-grey (about #808080), the same grey behind the figure
in every cell. No scenery, no props, no vignette, no gradient, no shadow cast on the
background.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is this character's finished model sheet. Copy his clothing, his colouring
and his line work exactly, and match its rendering precisely: same line weight,
same shading, same flat mid-grey background.
IMAGE 2 is STRIP A of THIS SAME MAN, already finished - a reference only. He must be
the same person: same face, same head shape, same hairline, same clothing, same
colours, same grey background, same framing, the head as big in the cell as it is
there. Only the expressions change.

INTENT, and this matters more than any feature below: he is THE ONE WHO GIVES. Human warmth in a freezing place.

CHARACTER, identical in every cell:
An Argentine army corporal, thirties. VERY FAIR SKIN with STRONG RED FLUSH on the
cheeks and the nose, from the cold - it is his marker. REDDISH FRECKLES. RED HAIR,
mostly hidden under a DARK GREY WOOL BEANIE with a turned-up brim, worn in ALL SIX
cells. RED-BLONDE EYEBROWS, so pale they are almost invisible. LIGHT BLUE EYES. Round
broad face, thick neck. Olive field jacket collar at the neck.

EXPRESSIONS, left to right - STRIP B, the strong ones. Each one as THIS character
would do it, never as a generic face:
CELL 1 - LAUGHING: a real laugh, mouth wide open, eyes squeezed almost shut, head
  tipped slightly back.
CELL 2 - AFRAID: eyes wide with white showing, eyebrows up and pulled together,
  mouth open and tense.
CELL 3 - SHOUTING IN ANGER: eyebrows hard down, mouth wide open in a shout, teeth
  showing, head pushed forward.
CELL 4 - CRYING: eyebrows high and pinched in the middle, eyes squeezed, mouth turned
  down and trembling, one or two simple pixel tear lines on the cheek.
CELL 5 - RELIEVED: eyes closed, eyebrows relaxed upward, a long breath out, a small
  tired smile, head tilted a little back.
CELL 6 - DETERMINED: eyebrows low and level, eyes narrowed and fixed ahead, jaw set,
  mouth a firm line, head slightly forward.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `colorado_risa colorado_miedo colorado_grito colorado_llanto colorado_alivio colorado_decidido`

### Hoja C — las grandes (grilla 5×2)

**Adjuntar (chat nuevo), en este orden:** `final/colorado3.png` *(IMAGE 1)* · la **Tira A** de este personaje que haya salido bien *(IMAGE 2)*.

```
DRAW A NEW IMAGE FROM SCRATCH. Do NOT return IMAGE 2, do NOT edit it, do NOT repeat
any of its faces. Every cell of the new sheet shows one of the NEW expressions
listed below.

Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SHEET LAYOUT: a GRID of TEN SQUARE cells, FIVE columns and TWO rows - exactly two
rows, not three - edge to edge, no gaps, no borders drawn between them. The finished
image is two and a half times as wide as it is tall. Each cell contains the SAME
character as a portrait bust - chest up, three-quarter view facing slightly LEFT,
eyes toward camera. Identical framing and identical scale in every cell: the head is
the same size and the eyes sit at the same height in all of them. The bottom edge
cuts across the upper chest; arms and hands are outside the frame. Leave a little clear space above the head.
The ONLY difference between cells is the facial expression.
BUST ONLY: nothing below the upper chest - no legs, no boots, no full bodies, even
if the attached images show full figures.
BACKGROUND: flat neutral mid-grey (about #808080), the same grey behind the figure
in every cell. No scenery, no props, no vignette, no gradient, no shadow cast on the
background.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is this character's finished model sheet. Copy his clothing, his colouring
and his line work exactly, and match its rendering precisely: same line weight,
same shading, same flat mid-grey background.
IMAGE 2 is STRIP A of THIS SAME MAN, already finished - a reference only. He must be
the same person: same face, same head shape, same hairline, same clothing, same
colours, same grey background, same framing, the head as big in the cell as it is
there. Only the expressions change.

INTENT, and this matters more than any feature below: he is THE ONE WHO GIVES. Human warmth in a freezing place.

CHARACTER, identical in every cell:
An Argentine army corporal, thirties. VERY FAIR SKIN with STRONG RED FLUSH on the
cheeks and the nose, from the cold - it is his marker. REDDISH FRECKLES. RED HAIR,
mostly hidden under a DARK GREY WOOL BEANIE with a turned-up brim, worn in ALL SIX
cells. RED-BLONDE EYEBROWS, so pale they are almost invisible. LIGHT BLUE EYES. Round
broad face, thick neck. Olive field jacket collar at the neck.

EXPRESSIONS, left to right, top row then bottom row - SHEET C. Each one as
THIS character would do it, never as a generic face:
Push every expression to the EXTREME - big, exaggerated and unmistakable, like a 90s
arcade cut-in portrait, readable at 108 px. Never subtle, even the quiet ones.
CELL 1 - LAUGHING TILL CRYING: mouth thrown wide open, eyes squeezed shut, tears of laughter flying from the corners, head thrown far back.
CELL 2 - PANIC: eyes huge with tiny pupils, mouth stretched open in a scream, eyebrows at the top of the forehead, sweat drops flying.
CELL 3 - RED WITH RAGE: face flushed dark red, teeth bared and clenched, eyebrows crushed down, a vein bulging on the forehead.
CELL 4 - SOBBING: mouth wide open and wailing, eyebrows high and pinched, eyes shut, streams of tears down both cheeks.
CELL 5 - JAW DROP: mouth hanging enormously open, eyes huge, eyebrows shot up as high as they go.
CELL 6 - DISGUSTED: nose wrinkled hard, upper lip curled up to the nose, eyes squinting, head pulled far back.
CELL 7 - IN SHOCK: frozen, face drained pale, eyes wide and fixed on nothing, mouth slightly open.
CELL 8 - IN PAIN: eyes squeezed shut, teeth clenched, the whole face scrunched to one side.
CELL 9 - EUPHORIC: shouting with joy, mouth wide open, eyes shut, eyebrows up, head tipped back.
CELL 10 - STARTLED: head jerked back, eyes popping, mouth snapped open, shoulders up to the ears.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `colorado_carcajada colorado_panico colorado_furia colorado_llanto colorado_mandibula colorado_asco colorado_shock colorado_dolor colorado_euforia colorado_sobresalto`

### Hoja D — las incómodas y las pícaras (grilla 5×2)

**Adjuntar (chat nuevo), en este orden:** `final/colorado3.png` *(IMAGE 1)* · la **Tira A** de este personaje que haya salido bien *(IMAGE 2)*.

```
DRAW A NEW IMAGE FROM SCRATCH. Do NOT return IMAGE 2, do NOT edit it, do NOT repeat
any of its faces. Every cell of the new sheet shows one of the NEW expressions
listed below.

Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SHEET LAYOUT: a GRID of TEN SQUARE cells, FIVE columns and TWO rows - exactly two
rows, not three - edge to edge, no gaps, no borders drawn between them. The finished
image is two and a half times as wide as it is tall. Each cell contains the SAME
character as a portrait bust - chest up, three-quarter view facing slightly LEFT,
eyes toward camera. Identical framing and identical scale in every cell: the head is
the same size and the eyes sit at the same height in all of them. The bottom edge
cuts across the upper chest; arms and hands are outside the frame. Leave a little clear space above the head.
The ONLY difference between cells is the facial expression.
BUST ONLY: nothing below the upper chest - no legs, no boots, no full bodies, even
if the attached images show full figures.
BACKGROUND: flat neutral mid-grey (about #808080), the same grey behind the figure
in every cell. No scenery, no props, no vignette, no gradient, no shadow cast on the
background.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is this character's finished model sheet. Copy his clothing, his colouring
and his line work exactly, and match its rendering precisely: same line weight,
same shading, same flat mid-grey background.
IMAGE 2 is STRIP A of THIS SAME MAN, already finished - a reference only. He must be
the same person: same face, same head shape, same hairline, same clothing, same
colours, same grey background, same framing, the head as big in the cell as it is
there. Only the expressions change.

INTENT, and this matters more than any feature below: he is THE ONE WHO GIVES. Human warmth in a freezing place.

CHARACTER, identical in every cell:
An Argentine army corporal, thirties. VERY FAIR SKIN with STRONG RED FLUSH on the
cheeks and the nose, from the cold - it is his marker. REDDISH FRECKLES. RED HAIR,
mostly hidden under a DARK GREY WOOL BEANIE with a turned-up brim, worn in ALL SIX
cells. RED-BLONDE EYEBROWS, so pale they are almost invisible. LIGHT BLUE EYES. Round
broad face, thick neck. Olive field jacket collar at the neck.

EXPRESSIONS, left to right, top row then bottom row - SHEET D. Each one as
THIS character would do it, never as a generic face:
Push every expression to the EXTREME - big, exaggerated and unmistakable, like a 90s
arcade cut-in portrait, readable at 108 px. Never subtle, even the quiet ones.
CELL 1 - AWKWARD: head perfectly still, eyes sliding sideways toward the camera, lips pressed together and pulled to one side in a tight uneasy half-smile - caught in an uncomfortable moment.
CELL 2 - HOLDING IN A LAUGH: cheeks puffed out, lips pressed tight and wobbling, eyes crinkled and watering.
CELL 3 - "REALLY?": a totally flat deadpan face, eyelids half down, eyebrows level, staring straight at the camera.
CELL 4 - SUSPICIOUS SIDE-EYE: head turned away, eyes sliding hard to the side, one eyebrow down, mouth flat.
CELL 5 - GRIMACE: teeth clenched and showing in a wide stiff line, eyebrows up, eyes wide - "uh oh".
CELL 6 - SMUG: chin up, eyelids half down, a slow one-sided smirk, one eyebrow raised high.
CELL 7 - EYE ROLL: eyes rolled all the way up, eyelids half down, mouth twisted to one side.
CELL 8 - WINK: one eye shut tight, a big cheeky half-smile.
CELL 9 - TONGUE OUT: tongue stuck far out in a teasing face, eyes squinting playfully.
CELL 10 - NERVOUS LAUGH: a huge forced smile, eyebrows up and apart, eyes darting, big drops of sweat on the temple.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `colorado_incomodo colorado_aguanta_risa colorado_en_serio colorado_de_reojo colorado_yikes colorado_sobrador colorado_ojos_blanco colorado_guino colorado_lengua colorado_risa_nerviosa`

### Hoja E — las de todos los días y las profundas (grilla 5×2)

**Adjuntar (chat nuevo), en este orden:** `final/colorado3.png` *(IMAGE 1)* · la **Tira A** de este personaje que haya salido bien *(IMAGE 2)*.

```
DRAW A NEW IMAGE FROM SCRATCH. Do NOT return IMAGE 2, do NOT edit it, do NOT repeat
any of its faces. Every cell of the new sheet shows one of the NEW expressions
listed below.

Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SHEET LAYOUT: a GRID of TEN SQUARE cells, FIVE columns and TWO rows - exactly two
rows, not three - edge to edge, no gaps, no borders drawn between them. The finished
image is two and a half times as wide as it is tall. Each cell contains the SAME
character as a portrait bust - chest up, three-quarter view facing slightly LEFT,
eyes toward camera. Identical framing and identical scale in every cell: the head is
the same size and the eyes sit at the same height in all of them. The bottom edge
cuts across the upper chest; arms and hands are outside the frame. Leave a little clear space above the head.
The ONLY difference between cells is the facial expression.
BUST ONLY: nothing below the upper chest - no legs, no boots, no full bodies, even
if the attached images show full figures.
BACKGROUND: flat neutral mid-grey (about #808080), the same grey behind the figure
in every cell. No scenery, no props, no vignette, no gradient, no shadow cast on the
background.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is this character's finished model sheet. Copy his clothing, his colouring
and his line work exactly, and match its rendering precisely: same line weight,
same shading, same flat mid-grey background.
IMAGE 2 is STRIP A of THIS SAME MAN, already finished - a reference only. He must be
the same person: same face, same head shape, same hairline, same clothing, same
colours, same grey background, same framing, the head as big in the cell as it is
there. Only the expressions change.

INTENT, and this matters more than any feature below: he is THE ONE WHO GIVES. Human warmth in a freezing place.

CHARACTER, identical in every cell:
An Argentine army corporal, thirties. VERY FAIR SKIN with STRONG RED FLUSH on the
cheeks and the nose, from the cold - it is his marker. REDDISH FRECKLES. RED HAIR,
mostly hidden under a DARK GREY WOOL BEANIE with a turned-up brim, worn in ALL SIX
cells. RED-BLONDE EYEBROWS, so pale they are almost invisible. LIGHT BLUE EYES. Round
broad face, thick neck. Olive field jacket collar at the neck.

EXPRESSIONS, left to right, top row then bottom row - SHEET E. Each one as
THIS character would do it, never as a generic face:
Push every expression to the EXTREME - big, exaggerated and unmistakable, like a 90s
arcade cut-in portrait, readable at 108 px. Never subtle, even the quiet ones.
CELL 1 - SURPRISED: eyebrows shot up, eyes wide, mouth a small round O.
CELL 2 - DOUBTFUL: one eyebrow high and one low, eyes to the side, mouth pulled hard to one side.
CELL 3 - THINKING: eyes up and to the side, lips pushed out, one eyebrow raised.
CELL 4 - TALKING: the neutral face, mouth open mid-word, eyebrows slightly raised.
CELL 5 - TENDERNESS: soft wet eyes, eyebrows gently up, a small closed-mouth smile - thinking of someone loved.
CELL 6 - FAR AWAY: eyes looking off into the distance at nothing, a faint sad smile, eyebrows up.
CELL 7 - FIGHTING TEARS: chin trembling, lips pressed tight, eyes full of tears, eyebrows pinched up.
CELL 8 - SAD SMILE: eyebrows up in the middle, eyes wet, the mouth smiling anyway.
CELL 9 - PROUD: chin up high, a firm small smile, eyes bright.
CELL 10 - EXHAUSTED: eyelids almost shut, head drooping, mouth hanging slack - about to fall asleep.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `colorado_sorpresa colorado_duda colorado_pensativo colorado_hablando colorado_ternura colorado_mirada_perdida colorado_aguanta_llanto colorado_sonrisa_triste colorado_orgullo colorado_agotado`

---

## NORMA — la madre

### Tira A

**Adjuntar (chat nuevo):** `final/team.png` *(IMAGE 1 — **solo** por el trazo)*

```
Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SHEET LAYOUT: a single horizontal strip of FOUR SQUARE cells in one row, edge to
edge, no gaps, no borders drawn between them. The finished image is exactly four
times as wide as it is tall. Each cell contains the SAME character as a portrait
bust - chest up, three-quarter view facing slightly LEFT, eyes toward camera.
Identical framing and identical scale in every cell: the head is the same size and
the eyes sit at the same height in all of them. The bottom edge cuts across the
upper chest; arms and hands are outside the frame. Leave a little clear space
above the hair. The ONLY difference between cells is the facial expression.
BUST ONLY: nothing below the upper chest - no legs, no boots, no full bodies, even
if the attached images show full figures.
BACKGROUND: flat neutral mid-grey (about #808080), the same grey behind the figure
in every cell. No scenery, no props, no vignette, no gradient, no shadow cast on the
background.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is the cast line-up. Copy its RENDERING ONLY: the line weight, the dithered
shading, the palette, the flat mid-grey background, the sprite proportions.
DO NOT COPY ANY FACE FROM IT. This is a different person who has never appeared
before and must not resemble any of the eight figures in IMAGE 1 - not their face,
not their hair, not their build.

INTENT, and this matters more than any feature below: THE ONE WHO WAITS. Everything happens to other people and reaches her as news.

CHARACTER, identical in every cell:
An Argentine woman of about 48, from a modest household, in 1982. Criollo interior
features, a soft square face, dark hair going grey at the temples and pulled back
tightly. Warm brown eyes with fine lines at the corners, a small mouth. Plainly
dressed: a flowered apron over a plain house dress, the SAME flowered apron in every
cell. A wedding ring is the only jewellery. NOTHING military or patriotic: no
cockade, no flag, no insignia of any kind - she is a housewife in her own kitchen.

EXPRESSIONS, left to right:
CELL 1 - NEUTRO: level and quiet, mouth closed, eyes on something out of frame. Listening to a radio.
CELL 2 - CALIDA: a real settled smile, eyes soft, head tilted a little. The face of somebody's mother.
CELL 3 - SERIA: the smile gone, eyebrows level, mouth closed and firm. She has decided not to say something.
CELL 4 - ROTA: eyes closed, eyebrows collapsed inward, chin down. Grief held quietly, in a kitchen.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `norma_neutro norma_calida norma_seria norma_rota`

### Tira B

**Adjuntar (chat nuevo), en este orden:** `final/team.png` *(IMAGE 1)* · la **Tira A** de este personaje que haya salido bien *(IMAGE 2)*.

```
DRAW A NEW IMAGE FROM SCRATCH. Do NOT return IMAGE 2, do NOT edit it, do NOT repeat
any of its faces. Every cell of the new strip shows one of the NEW expressions
listed below.

Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SHEET LAYOUT: a single horizontal strip of SIX SQUARE cells in one row, edge to
edge, no gaps, no borders drawn between them. The finished image is exactly six
times as wide as it is tall. Each cell contains the SAME character as a portrait
bust - chest up, three-quarter view facing slightly LEFT, eyes toward camera.
Identical framing and identical scale in every cell: the head is the same size and
the eyes sit at the same height in all of them. The bottom edge cuts across the
upper chest; arms and hands are outside the frame. Leave a little clear space
above the hair. The ONLY difference between cells is the facial expression.
BUST ONLY: nothing below the upper chest - no legs, no boots, no full bodies, even
if the attached images show full figures.
BACKGROUND: flat neutral mid-grey (about #808080), the same grey behind the figure
in every cell. No scenery, no props, no vignette, no gradient, no shadow cast on the
background.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is the cast line-up. Copy its RENDERING ONLY: the line weight, the dithered
shading, the palette, the flat mid-grey background, the sprite proportions.
DO NOT COPY ANY FACE FROM IT. This is a different person who has never appeared
before and must not resemble any of the eight figures in IMAGE 1 - not their face,
not their hair, not their build.
IMAGE 2 is STRIP A of THIS SAME WOMAN, already finished - a reference only. She must be
the same person: same face, same head shape, same hairline, same clothing, same
colours, same grey background, same framing, the head as big in the cell as it is
there. Only the expressions change.

INTENT, and this matters more than any feature below: THE ONE WHO WAITS. Everything happens to other people and reaches her as news.

CHARACTER, identical in every cell:
An Argentine woman of about 48, from a modest household, in 1982. Criollo interior
features, a soft square face, dark hair going grey at the temples and pulled back
tightly. Warm brown eyes with fine lines at the corners, a small mouth. Plainly
dressed: a flowered apron over a plain house dress, the SAME flowered apron in every
cell. A wedding ring is the only jewellery. NOTHING military or patriotic: no
cockade, no flag, no insignia of any kind - she is a housewife in her own kitchen.

EXPRESSIONS, left to right - STRIP B, the strong ones. Each one as THIS character
would do it, never as a generic face:
CELL 1 - LAUGHING: a real laugh, mouth wide open, eyes squeezed almost shut, head
  tipped slightly back.
CELL 2 - AFRAID: eyes wide with white showing, eyebrows up and pulled together,
  mouth open and tense.
CELL 3 - SHOUTING IN ANGER: eyebrows hard down, mouth wide open in a shout, teeth
  showing, head pushed forward.
CELL 4 - CRYING: eyebrows high and pinched in the middle, eyes squeezed, mouth turned
  down and trembling, one or two simple pixel tear lines on the cheek.
CELL 5 - RELIEVED: eyes closed, eyebrows relaxed upward, a long breath out, a small
  tired smile, head tilted a little back.
CELL 6 - DETERMINED: eyebrows low and level, eyes narrowed and fixed ahead, jaw set,
  mouth a firm line, head slightly forward.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `norma_risa norma_miedo norma_grito norma_llanto norma_alivio norma_decidido`

### Hoja C — las grandes (grilla 5×2)

**Adjuntar (chat nuevo), en este orden:** `final/team.png` *(IMAGE 1)* · la **Tira A** de este personaje que haya salido bien *(IMAGE 2)*.

```
DRAW A NEW IMAGE FROM SCRATCH. Do NOT return IMAGE 2, do NOT edit it, do NOT repeat
any of its faces. Every cell of the new sheet shows one of the NEW expressions
listed below.

Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SHEET LAYOUT: a GRID of TEN SQUARE cells, FIVE columns and TWO rows - exactly two
rows, not three - edge to edge, no gaps, no borders drawn between them. The finished
image is two and a half times as wide as it is tall. Each cell contains the SAME
character as a portrait bust - chest up, three-quarter view facing slightly LEFT,
eyes toward camera. Identical framing and identical scale in every cell: the head is
the same size and the eyes sit at the same height in all of them. The bottom edge
cuts across the upper chest; arms and hands are outside the frame. Leave a little clear space above the head.
The ONLY difference between cells is the facial expression.
BUST ONLY: nothing below the upper chest - no legs, no boots, no full bodies, even
if the attached images show full figures.
BACKGROUND: flat neutral mid-grey (about #808080), the same grey behind the figure
in every cell. No scenery, no props, no vignette, no gradient, no shadow cast on the
background.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is the cast line-up. Copy its RENDERING ONLY: the line weight, the dithered
shading, the palette, the flat mid-grey background, the sprite proportions.
DO NOT COPY ANY FACE FROM IT. This is a different person who has never appeared
before and must not resemble any of the eight figures in IMAGE 1 - not their face,
not their hair, not their build.
IMAGE 2 is STRIP A of THIS SAME WOMAN, already finished - a reference only. She must be
the same person: same face, same head shape, same hairline, same clothing, same
colours, same grey background, same framing, the head as big in the cell as it is
there. Only the expressions change.

INTENT, and this matters more than any feature below: THE ONE WHO WAITS. Everything happens to other people and reaches her as news.

CHARACTER, identical in every cell:
An Argentine woman of about 48, from a modest household, in 1982. Criollo interior
features, a soft square face, dark hair going grey at the temples and pulled back
tightly. Warm brown eyes with fine lines at the corners, a small mouth. Plainly
dressed: a flowered apron over a plain house dress, the SAME flowered apron in every
cell. A wedding ring is the only jewellery. NOTHING military or patriotic: no
cockade, no flag, no insignia of any kind - she is a housewife in her own kitchen.

EXPRESSIONS, left to right, top row then bottom row - SHEET C. Each one as
THIS character would do it, never as a generic face:
Push every expression to the EXTREME - big, exaggerated and unmistakable, like a 90s
arcade cut-in portrait, readable at 108 px. Never subtle, even the quiet ones.
CELL 1 - LAUGHING TILL CRYING: mouth thrown wide open, eyes squeezed shut, tears of laughter flying from the corners, head thrown far back.
CELL 2 - PANIC: eyes huge with tiny pupils, mouth stretched open in a scream, eyebrows at the top of the forehead, sweat drops flying.
CELL 3 - RED WITH RAGE: face flushed dark red, teeth bared and clenched, eyebrows crushed down, a vein bulging on the forehead.
CELL 4 - SOBBING: mouth wide open and wailing, eyebrows high and pinched, eyes shut, streams of tears down both cheeks.
CELL 5 - JAW DROP: mouth hanging enormously open, eyes huge, eyebrows shot up as high as they go.
CELL 6 - DISGUSTED: nose wrinkled hard, upper lip curled up to the nose, eyes squinting, head pulled far back.
CELL 7 - IN SHOCK: frozen, face drained pale, eyes wide and fixed on nothing, mouth slightly open.
CELL 8 - IN PAIN: eyes squeezed shut, teeth clenched, the whole face scrunched to one side.
CELL 9 - EUPHORIC: shouting with joy, mouth wide open, eyes shut, eyebrows up, head tipped back.
CELL 10 - STARTLED: head jerked back, eyes popping, mouth snapped open, shoulders up to the ears.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `norma_carcajada norma_panico norma_furia norma_llanto norma_mandibula norma_asco norma_shock norma_dolor norma_euforia norma_sobresalto`

### Hoja D — las incómodas y las pícaras (grilla 5×2)

**Adjuntar (chat nuevo), en este orden:** `final/team.png` *(IMAGE 1)* · la **Tira A** de este personaje que haya salido bien *(IMAGE 2)*.

```
DRAW A NEW IMAGE FROM SCRATCH. Do NOT return IMAGE 2, do NOT edit it, do NOT repeat
any of its faces. Every cell of the new sheet shows one of the NEW expressions
listed below.

Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SHEET LAYOUT: a GRID of TEN SQUARE cells, FIVE columns and TWO rows - exactly two
rows, not three - edge to edge, no gaps, no borders drawn between them. The finished
image is two and a half times as wide as it is tall. Each cell contains the SAME
character as a portrait bust - chest up, three-quarter view facing slightly LEFT,
eyes toward camera. Identical framing and identical scale in every cell: the head is
the same size and the eyes sit at the same height in all of them. The bottom edge
cuts across the upper chest; arms and hands are outside the frame. Leave a little clear space above the head.
The ONLY difference between cells is the facial expression.
BUST ONLY: nothing below the upper chest - no legs, no boots, no full bodies, even
if the attached images show full figures.
BACKGROUND: flat neutral mid-grey (about #808080), the same grey behind the figure
in every cell. No scenery, no props, no vignette, no gradient, no shadow cast on the
background.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is the cast line-up. Copy its RENDERING ONLY: the line weight, the dithered
shading, the palette, the flat mid-grey background, the sprite proportions.
DO NOT COPY ANY FACE FROM IT. This is a different person who has never appeared
before and must not resemble any of the eight figures in IMAGE 1 - not their face,
not their hair, not their build.
IMAGE 2 is STRIP A of THIS SAME WOMAN, already finished - a reference only. She must be
the same person: same face, same head shape, same hairline, same clothing, same
colours, same grey background, same framing, the head as big in the cell as it is
there. Only the expressions change.

INTENT, and this matters more than any feature below: THE ONE WHO WAITS. Everything happens to other people and reaches her as news.

CHARACTER, identical in every cell:
An Argentine woman of about 48, from a modest household, in 1982. Criollo interior
features, a soft square face, dark hair going grey at the temples and pulled back
tightly. Warm brown eyes with fine lines at the corners, a small mouth. Plainly
dressed: a flowered apron over a plain house dress, the SAME flowered apron in every
cell. A wedding ring is the only jewellery. NOTHING military or patriotic: no
cockade, no flag, no insignia of any kind - she is a housewife in her own kitchen.

EXPRESSIONS, left to right, top row then bottom row - SHEET D. Each one as
THIS character would do it, never as a generic face:
Push every expression to the EXTREME - big, exaggerated and unmistakable, like a 90s
arcade cut-in portrait, readable at 108 px. Never subtle, even the quiet ones.
CELL 1 - AWKWARD: head perfectly still, eyes sliding sideways toward the camera, lips pressed together and pulled to one side in a tight uneasy half-smile - caught in an uncomfortable moment.
CELL 2 - HOLDING IN A LAUGH: cheeks puffed out, lips pressed tight and wobbling, eyes crinkled and watering.
CELL 3 - "REALLY?": a totally flat deadpan face, eyelids half down, eyebrows level, staring straight at the camera.
CELL 4 - SUSPICIOUS SIDE-EYE: head turned away, eyes sliding hard to the side, one eyebrow down, mouth flat.
CELL 5 - GRIMACE: teeth clenched and showing in a wide stiff line, eyebrows up, eyes wide - "uh oh".
CELL 6 - SMUG: chin up, eyelids half down, a slow one-sided smirk, one eyebrow raised high.
CELL 7 - EYE ROLL: eyes rolled all the way up, eyelids half down, mouth twisted to one side.
CELL 8 - WINK: one eye shut tight, a big cheeky half-smile.
CELL 9 - TONGUE OUT: tongue stuck far out in a teasing face, eyes squinting playfully.
CELL 10 - NERVOUS LAUGH: a huge forced smile, eyebrows up and apart, eyes darting, big drops of sweat on the temple.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `norma_incomodo norma_aguanta_risa norma_en_serio norma_de_reojo norma_yikes norma_sobrador norma_ojos_blanco norma_guino norma_lengua norma_risa_nerviosa`

### Hoja E — las de todos los días y las profundas (grilla 5×2)

**Adjuntar (chat nuevo), en este orden:** `final/team.png` *(IMAGE 1)* · la **Tira A** de este personaje que haya salido bien *(IMAGE 2)*.

```
DRAW A NEW IMAGE FROM SCRATCH. Do NOT return IMAGE 2, do NOT edit it, do NOT repeat
any of its faces. Every cell of the new sheet shows one of the NEW expressions
listed below.

Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.

SHEET LAYOUT: a GRID of TEN SQUARE cells, FIVE columns and TWO rows - exactly two
rows, not three - edge to edge, no gaps, no borders drawn between them. The finished
image is two and a half times as wide as it is tall. Each cell contains the SAME
character as a portrait bust - chest up, three-quarter view facing slightly LEFT,
eyes toward camera. Identical framing and identical scale in every cell: the head is
the same size and the eyes sit at the same height in all of them. The bottom edge
cuts across the upper chest; arms and hands are outside the frame. Leave a little clear space above the head.
The ONLY difference between cells is the facial expression.
BUST ONLY: nothing below the upper chest - no legs, no boots, no full bodies, even
if the attached images show full figures.
BACKGROUND: flat neutral mid-grey (about #808080), the same grey behind the figure
in every cell. No scenery, no props, no vignette, no gradient, no shadow cast on the
background.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is the cast line-up. Copy its RENDERING ONLY: the line weight, the dithered
shading, the palette, the flat mid-grey background, the sprite proportions.
DO NOT COPY ANY FACE FROM IT. This is a different person who has never appeared
before and must not resemble any of the eight figures in IMAGE 1 - not their face,
not their hair, not their build.
IMAGE 2 is STRIP A of THIS SAME WOMAN, already finished - a reference only. She must be
the same person: same face, same head shape, same hairline, same clothing, same
colours, same grey background, same framing, the head as big in the cell as it is
there. Only the expressions change.

INTENT, and this matters more than any feature below: THE ONE WHO WAITS. Everything happens to other people and reaches her as news.

CHARACTER, identical in every cell:
An Argentine woman of about 48, from a modest household, in 1982. Criollo interior
features, a soft square face, dark hair going grey at the temples and pulled back
tightly. Warm brown eyes with fine lines at the corners, a small mouth. Plainly
dressed: a flowered apron over a plain house dress, the SAME flowered apron in every
cell. A wedding ring is the only jewellery. NOTHING military or patriotic: no
cockade, no flag, no insignia of any kind - she is a housewife in her own kitchen.

EXPRESSIONS, left to right, top row then bottom row - SHEET E. Each one as
THIS character would do it, never as a generic face:
Push every expression to the EXTREME - big, exaggerated and unmistakable, like a 90s
arcade cut-in portrait, readable at 108 px. Never subtle, even the quiet ones.
CELL 1 - SURPRISED: eyebrows shot up, eyes wide, mouth a small round O.
CELL 2 - DOUBTFUL: one eyebrow high and one low, eyes to the side, mouth pulled hard to one side.
CELL 3 - THINKING: eyes up and to the side, lips pushed out, one eyebrow raised.
CELL 4 - TALKING: the neutral face, mouth open mid-word, eyebrows slightly raised.
CELL 5 - TENDERNESS: soft wet eyes, eyebrows gently up, a small closed-mouth smile - thinking of someone loved.
CELL 6 - FAR AWAY: eyes looking off into the distance at nothing, a faint sad smile, eyebrows up.
CELL 7 - FIGHTING TEARS: chin trembling, lips pressed tight, eyes full of tears, eyebrows pinched up.
CELL 8 - SAD SMILE: eyebrows up in the middle, eyes wet, the mouth smiling anyway.
CELL 9 - PROUD: chin up high, a firm small smile, eyes bright.
CELL 10 - EXHAUSTED: eyelids almost shut, head drooping, mouth hanging slack - about to fall asleep.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `norma_sorpresa norma_duda norma_pensativo norma_hablando norma_ternura norma_mirada_perdida norma_aguanta_llanto norma_sonrisa_triste norma_orgullo norma_agotado`

---
