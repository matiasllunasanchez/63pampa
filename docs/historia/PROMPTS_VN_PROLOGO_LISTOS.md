# PRÓLOGO — los 24 prompts, listos para pegar

> # 🕰 ARCHIVO VIEJO — QUEDÓ DESACTUALIZADO
> Los prompts de acá son anteriores a las correcciones de agosto (el terito con copete, una
> estrella por avión por vuelta, el Colorado con retrato, los dibujos sueltos y sin repetir,
> la mano de Mateo a los 8). **No los uses.**
>
> **Usá:** `historia/PROMPTS_AIRE_LISTOS.md` y `historia/PROMPTS_TIERRA_LISTOS.md`.


> ⚠️ **GENERADO — no editar a mano.** Sale de
> [PROMPTS_VN_PROLOGO.md](PROMPTS_VN_PROLOGO.md), que es la fuente de verdad. Allá los prompts
> arrancan con un marcador `[AIRE]` o `[TIERRA]` que hay que reemplazar por el bloque de estilo
> completo; **acá ya está reemplazado**. Si cambia un prompt, se cambia allá y se corre:
>
> ```bash
> python3 tools/hacer_prompts_prologo.py
> ```

## Cómo se trabaja

1. Copiás el prompt completo y lo pegás en el generador. **No hay que agregarle nada.**
2. Guardás el resultado con **el nombre de archivo que dice cada ficha** — el motor los busca
   por ese nombre exacto (`render/screens.js`: `assets/plates/<id>.png` y
   `assets/portraits/<cara>.png`).
3. **Si un asset no existe, el juego no se rompe**: la placa cae a negro y el retrato a una
   silueta placeholder. Se puede jugar el prólogo entero sin un solo PNG e irlos soltando de
   a uno.

> **Empezá por el 4 y el 9.** La cocina (4) valida el estilo `[AIRE]` y es la placa que más se
> reusa en todo el juego; la hoja (9) valida `[TIERRA]` y es el patrón de **todas** las páginas
> del cuaderno. Si esas dos salen bien, el resto sale. Los retratos, recién después.

> **El 5 se genera como segunda pasada del 4**, en la misma sesión — es la misma cocina
> apagándose. Si la sacás aparte, los objetos cambian de lugar y el corte de tono se pierde.

**Formatos:** placas `[AIRE]` en 16:9 · páginas `[TIERRA]` en 3:4 vertical · retratos y figuras
sobre fondo plano para recortar. Generá grande y reducí con nearest-neighbor.

> Si tu generador rechaza "Metal Slug" por marca registrada, borrá `in the style of Metal Slug
> (SNK Neo Geo era)` — el bloque rinde igual porque describe el estilo por sus atributos.

---

## 1. PLACA P.1.a — el arroyo y el Rastrojero

**Guardar como:** `assets/plates/p1a_arroyo.png` · *placa TIERRA · 3:4*

```
A real sheet of lined notebook paper seen straight on, rendered as detailed 90s
arcade pixel art: warm cream paper with visible fibre texture, PRINTED pale
grey-blue ruled lines and a PRINTED red margin line, soft worn edges, damp
wrinkles and faint brown water stains. The paper itself and anything physically
resting on it are SOLID REAL OBJECTS with volume and soft contact shadows — they
are NOT drawings.

Drawn ON that paper, and only that: a naive sketch in dark blue ballpoint-pen
strokes, Metal Slug-inspired sprite proportions but drawn like an 18-year-old
soldier's heartfelt doodle, single-colour blue ink with dithered shading, ink
smudges and visible pen-pressure variation.

Crisp clean pixels, no anti-aliasing, hand-made naive feel in the ink layer only,
no photorealism, no 3D render.

Wide shot of a flat Argentine countryside creek on a summer afternoon, low
grassy bank, still shallow water, a rusty 1960s Argentine Rastrojero pickup truck
parked on the grass in the middle distance, a huge empty pale sky, one small distant
jet trail crossing it. NOBODY IN THE FRAME. Empty, waiting, quiet. Drawn entirely in
blue ballpoint pen on lined notebook paper, cream paper texture with faint ruled
lines, ink smudges as pixels. 3:4 vertical. No text, no watermark, no signature.
```

---

## 2. PLACA P.1.b — el sapito

**Guardar como:** `assets/plates/p1b_sapito.png` · *placa TIERRA · 3:4*

```
A real sheet of lined notebook paper seen straight on, rendered as detailed 90s
arcade pixel art: warm cream paper with visible fibre texture, PRINTED pale
grey-blue ruled lines and a PRINTED red margin line, soft worn edges, damp
wrinkles and faint brown water stains. The paper itself and anything physically
resting on it are SOLID REAL OBJECTS with volume and soft contact shadows — they
are NOT drawings.

Drawn ON that paper, and only that: a naive sketch in dark blue ballpoint-pen
strokes, Metal Slug-inspired sprite proportions but drawn like an 18-year-old
soldier's heartfelt doodle, single-colour blue ink with dithered shading, ink
smudges and visible pen-pressure variation.

Crisp clean pixels, no anti-aliasing, hand-made naive feel in the ink layer only,
no photorealism, no 3D render.

Extreme close-up, low angle almost at water level: a flat stone skipping
across the surface of a creek, caught mid-bounce, three small rings of ripples
trailing behind it marking the three previous bounces, a thin spray of droplets, the
far bank blurred and low. NOBODY IN THE FRAME. Drawn entirely in blue ballpoint pen
on lined notebook paper, cream paper texture with faint ruled lines. 3:4 vertical.
No text, no watermark, no signature.
```

---

## 3. PLACA P.1.c — el cuaderno en las rodillas

**Guardar como:** `assets/plates/p1c_cuaderno.png` · *placa AIRE · 3:4*

```
Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug (SNK Neo Geo
era), hand-drawn sprite look, chunky black pixel outlines, expressive exaggerated
character poses and faces, rich dithered shading, saturated military palette of
olive drab, steel blue-grey, silver and warm sand with a single red accent when
noted, dramatic cinematic side-scroller composition, crisp clean pixels, no
anti-aliasing, no photorealism, no 3D render, no smooth digital painting.

Over-the-shoulder view from just behind and slightly above a seated
eight-year-old boy: his lap, his two knees in worn trousers, and an open school
notebook resting flat across them, one small hand steadying the edge of the page
while the other holds a ballpoint pen to it. His head is out of frame: no face.

THE NOTEBOOK IS AN OBJECT INSIDE THE SCENE, not the frame itself: its two facing
pages, the spine between them, its outer edges and its slightly curled corners are
all clearly visible, and around and beyond it there is real ground — summer grass
and the low bank of a creek. Never let the page fill the frame.

Everything of the real world is in FULL COLOUR and solid: the boy's skin, his
trousers, the notebook cover, the grass, the pen with its WHITE cap, BLUE barrel and
LIGHT BROWN tip.

DRAWN IN BLUE INK ON THE OPEN PAGE, and the only thing in this image that is a
drawing: a naive child's ballpoint sketch of the creek, a rusty pickup truck and a
little aeroplane crossing the sky.

Warm summer afternoon light from the side. 3:4 vertical. No text, no letters, no
words on the page, no watermark, no signature.
```

---

## 4. PLACA P.2 — la cocina de Norma, 1982, cálida

**Guardar como:** `assets/plates/p2_cocina.png` · *placa AIRE · 16:9*

```
Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug (SNK Neo Geo
era), hand-drawn sprite look, chunky black pixel outlines, expressive exaggerated
character poses and faces, rich dithered shading, saturated military palette of
olive drab, steel blue-grey, silver and warm sand with a single red accent when
noted, dramatic cinematic side-scroller composition, crisp clean pixels, no
anti-aliasing, no photorealism, no 3D render, no smooth digital painting.

Interior of a modest Argentine home kitchen in 1982, warm late-morning light
through a small curtained window, formica table with a plastic tablecloth, four
mismatched wooden chairs, a kettle on the lit stove with a thin plume of steam, a
wall-mounted rotary telephone, a small valve radio on the shelf, a saint's picture
and a wall calendar, worn tiled floor. Lived-in, warm, ordinary. NOBODY IN THE
FRAME. Empty, waiting, quiet. 16:9. Argentina 1982, no modern appliances, no modern
military equipment, no NATO or US insignia, no national flag. No text, no watermark,
no signature.
```

---

## 5. PLACA P.2-b — la misma cocina, lavada

**Guardar como:** `assets/plates/p2b_cocina_gris.png` · *placa AIRE · 16:9*

```
Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug (SNK Neo Geo
era), hand-drawn sprite look, chunky black pixel outlines, expressive exaggerated
character poses and faces, rich dithered shading, saturated military palette of
olive drab, steel blue-grey, silver and warm sand with a single red accent when
noted, dramatic cinematic side-scroller composition, crisp clean pixels, no
anti-aliasing, no photorealism, no 3D render, no smooth digital painting.

Interior of a modest Argentine home kitchen in 1982, the exact same room and
camera angle as before but the warm light now drained to a flat cold grey through the
small curtained window, formica table with a plastic tablecloth, four mismatched
wooden chairs, a kettle still whistling on the lit stove with a thin plume of steam, a
wall-mounted rotary telephone, a small valve radio on the shelf now switched on with
its dial glowing faintly, a saint's picture and a wall calendar, worn tiled floor. The
warmth gone out of the room, everything gone still. NOBODY IN THE FRAME. Empty,
waiting, quiet. 16:9. Argentina 1982, no modern appliances, no modern military
equipment, no NATO or US insignia, no national flag. No text, no watermark, no
signature.
```

---

## 6. PLACA P.3.a — el teléfono de la base

**Guardar como:** `assets/plates/p3a_telefono.png` · *placa AIRE · 16:9*

```
Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug (SNK Neo Geo
era), hand-drawn sprite look, chunky black pixel outlines, expressive exaggerated
character poses and faces, rich dithered shading, saturated military palette of
olive drab, steel blue-grey, silver and warm sand with a single red accent when
noted, dramatic cinematic side-scroller composition, crisp clean pixels, no
anti-aliasing, no photorealism, no 3D render, no smooth digital painting.

Close-up of an olive-green military field telephone on a scratched metal desk
in a bare office, the handset off the hook and lying on its side on the desk, a coiled
cord, a stack of carbon-copy forms, a tin ashtray with three crushed cigarettes,
hard raking light from a high window. NOBODY IN THE FRAME. Empty, waiting, quiet.
16:9. Argentina 1982, no modern equipment, no NATO or US insignia, no national flag.
No text, no watermark, no signature.
```

---

## 7. PLACA P.3.b — los papeles

**Guardar como:** `assets/plates/p3b_papeles.png` · *placa AIRE · 16:9*

```
Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug (SNK Neo Geo
era), hand-drawn sprite look, chunky black pixel outlines, expressive exaggerated
character poses and faces, rich dithered shading, saturated military palette of
olive drab, steel blue-grey, silver and warm sand with a single red accent when
noted, dramatic cinematic side-scroller composition, crisp clean pixels, no
anti-aliasing, no photorealism, no 3D render, no smooth digital painting.

Overhead close-up of a bare metal desk covered with typed carbon-copy military
forms and a rubber stamp lying on its side, one form pushed slightly away from the
others, a fountain pen uncapped, cold indifferent overhead light. NOBODY IN THE
FRAME. Empty, waiting, quiet. 16:9. Argentina 1982, no modern equipment, no NATO or
US insignia, no invented unit patches. No text, no watermark, no signature.
```

---

## 8. PLACA P.3.c — la puerta que se cierra

**Guardar como:** `assets/plates/p3c_puerta.png` · *placa AIRE · 16:9*

```
Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug (SNK Neo Geo
era), hand-drawn sprite look, chunky black pixel outlines, expressive exaggerated
character poses and faces, rich dithered shading, saturated military palette of
olive drab, steel blue-grey, silver and warm sand with a single red accent when
noted, dramatic cinematic side-scroller composition, crisp clean pixels, no
anti-aliasing, no photorealism, no 3D render, no smooth digital painting.

A plain closed office door at the end of an empty institutional corridor,
frosted glass panel dark from the inside, worn linoleum floor, a single bare bulb,
deep shadow, the corridor stretching away. NOBODY IN THE FRAME. Empty, waiting,
quiet. Cold, final. 16:9. Argentina 1982, no modern equipment, no national flag. No
text, no watermark, no signature.
```

---

## 9. PLACA P.4 — la hoja

**Guardar como:** `assets/plates/p4_hoja.png` · *placa TIERRA · 3:4*

```
A real sheet of lined notebook paper seen straight on, rendered as detailed 90s
arcade pixel art: warm cream paper with visible fibre texture, PRINTED pale
grey-blue ruled lines and a PRINTED red margin line, soft worn edges, damp
wrinkles and faint brown water stains. The paper itself and anything physically
resting on it are SOLID REAL OBJECTS with volume and soft contact shadows — they
are NOT drawings.

Drawn ON that paper, and only that: a naive sketch in dark blue ballpoint-pen
strokes, Metal Slug-inspired sprite proportions but drawn like an 18-year-old
soldier's heartfelt doodle, single-colour blue ink with dithered shading, ink
smudges and visible pen-pressure variation.

Crisp clean pixels, no anti-aliasing, hand-made naive feel in the ink layer only,
no photorealism, no 3D render.

A single blank open notebook page seen straight on, filling the frame, the
printed ruled lines running edge to edge, the paper damp-wrinkled at one corner with
a faint brown water stain, a soft worn edge along the outside, a few pale foxing
specks. NOTHING RESTING ON IT and NOTHING DRAWN ON IT: no pen, no pencil, no
drawings, no sketches, no writing, no letters, no words anywhere. Completely empty
paper — it is a background that other things get composited onto later. 3:4 vertical.
No text, no watermark, no signature.
```

---

## 10. TINTA P.4 — el avioncito del margen

**Guardar como:** `assets/ink/tinta_p4_avioncito.png` · *recorte tinta · fondo blanco*

```
Naive pixel art line drawing in dark blue ballpoint-pen strokes, Metal Slug-inspired
sprite proportions but drawn like an 18-year-old soldier's heartfelt doodle,
single-colour blue ink, slightly wobbly confident lines with visible pen-pressure
variation and small ink blots, crisp clean pixels, no anti-aliasing, hand-made naive
feel, no photorealism, no 3D render. Just the ink strokes on a plain flat white
background for clean cutout — NO paper texture, NO ruled lines, NO page, NO frame.

One small drawing, alone and centred in the frame: a tiny aeroplane flying
very low over water, with three little ripple rings in a row underneath it marking
where it skipped. Nothing else in the frame. No text, no letters, no watermark, no
signature.
```

---

## 11. PROP — la birome

**Guardar como:** `assets/props/obj_birome.png` · *recorte prop · fondo magenta*

```
Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug (SNK Neo Geo
era), hand-drawn sprite look, chunky black pixel outlines, expressive exaggerated
character poses and faces, rich dithered shading, saturated military palette of
olive drab, steel blue-grey, silver and warm sand with a single red accent when
noted, dramatic cinematic side-scroller composition, crisp clean pixels, no
anti-aliasing, no photorealism, no 3D render, no smooth digital painting.

A single cheap ballpoint pen seen from above, lying diagonally: a WHITE cap with a plain pocket clip, a BLUE opaque plastic
barrel and a LIGHT BROWN tapered tip cone. A real solid three-dimensional object with
volume, a highlight running down one side and a soft contact shadow beneath it — NOT
a drawing of a pen. Slightly chewed cap, ink-stained tip. Flat solid magenta
background for clean cutout. No text, no letters, no brand, no logo, no watermark,
no signature.
```

---

## 12. MATEO : sonrisa colimba

**Guardar como:** `assets/portraits/mateo_casa_sonrisa.png` · *retrato*

```
Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug (SNK Neo Geo
era), hand-drawn sprite look, chunky black pixel outlines, expressive exaggerated
character poses and faces, rich dithered shading, saturated military palette of
olive drab, steel blue-grey, silver and warm sand with a single red accent when
noted, dramatic cinematic side-scroller composition, crisp clean pixels, no
anti-aliasing, no photorealism, no 3D render, no smooth digital painting.

Portrait bust of an argentine teenager, 18 years old and reads as 18, skinny,
criollo features, olive skin, head freshly shaved to the scalp for military service,
patchy teenage mustache, wearing a plain civilian short-sleeved shirt at home — NO
uniform, NO helmet, NO field gear —, chest-up, three-quarter view facing slightly
left, a wide easy grin, eyebrows up, completely unworried, neutral dark background
for clean cutout, consistent framing and scale, pixel art character portrait for a
dialogue box. Argentina 1982, argentine latin-american face, no modern military
equipment, no NATO or US insignia, no invented unit patches, no national flag on
clothing. No text, no watermark.
```

---

## 13. MATEO : serio

**Guardar como:** `assets/portraits/mateo_casa_serio.png` · *retrato*

```
Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug (SNK Neo Geo
era), hand-drawn sprite look, chunky black pixel outlines, expressive exaggerated
character poses and faces, rich dithered shading, saturated military palette of
olive drab, steel blue-grey, silver and warm sand with a single red accent when
noted, dramatic cinematic side-scroller composition, crisp clean pixels, no
anti-aliasing, no photorealism, no 3D render, no smooth digital painting.

Portrait bust of an argentine teenager, 18 years old and reads as 18, skinny,
criollo features, olive skin, head freshly shaved to the scalp for military service,
patchy teenage mustache, plain civilian short-sleeved shirt at home — NO uniform, NO
helmet, NO field gear —, chest-up, three-quarter view facing slightly left, the grin
completely gone, lips parted, brow drawn together, looking at someone off-frame and
not understanding, neutral dark background for clean cutout, consistent framing and
scale, pixel art character portrait for a dialogue box. Argentina 1982, argentine
latin-american face, no modern military equipment, no NATO or US insignia, no
national flag on clothing. No text, no watermark.
```

---

## 14. ESTEBAN (TERO) : sonrisa chica — de civil

**Guardar como:** `assets/portraits/tero_civil_sonrisa.png` · *retrato*

```
Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug (SNK Neo Geo
era), hand-drawn sprite look, chunky black pixel outlines, expressive exaggerated
character poses and faces, rich dithered shading, saturated military palette of
olive drab, steel blue-grey, silver and warm sand with a single red accent when
noted, dramatic cinematic side-scroller composition, crisp clean pixels, no
anti-aliasing, no photorealism, no 3D render, no smooth digital painting.

Portrait bust of an argentine man, 41 years old, very tall and very thin,
gaunt and narrow, neck carried forward, criollo features, olive skin, black hair
greying at the temples, clean-shaven, tired warm eyes, wearing a plain buttoned
civilian shirt with the sleeves rolled up — NO flight suit, NO helmet, NO military
equipment of any kind —, chest-up, three-quarter view facing slightly left, a small
amused closed-mouth smile, eyes crinkled, relaxed at his own kitchen table, neutral
dark background for clean cutout, consistent framing and scale, pixel art character
portrait for a dialogue box. Argentina 1982, argentine latin-american face, no
modern equipment, no NATO or US insignia, no national flag on clothing. No text, no
watermark.
```

---

## 15. ESTEBAN (TERO) : blanco — de civil

**Guardar como:** `assets/portraits/tero_civil_blanco.png` · *retrato*

```
Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug (SNK Neo Geo
era), hand-drawn sprite look, chunky black pixel outlines, expressive exaggerated
character poses and faces, rich dithered shading, saturated military palette of
olive drab, steel blue-grey, silver and warm sand with a single red accent when
noted, dramatic cinematic side-scroller composition, crisp clean pixels, no
anti-aliasing, no photorealism, no 3D render, no smooth digital painting.

Portrait bust of an argentine man, 41 years old, very tall and very thin,
gaunt and narrow, criollo features, olive skin, black hair greying at the temples,
clean-shaven, wearing a plain buttoned civilian shirt with the sleeves rolled up —
NO flight suit, NO helmet, NO military equipment of any kind —, chest-up,
three-quarter view facing slightly left, all the blood gone from his face, eyes wide
open and fixed on nothing, mouth slightly open, absolutely still, a man who has just
understood something before anyone else in the room, neutral dark background for
clean cutout, consistent framing and scale, pixel art character portrait for a
dialogue box. Argentina 1982, argentine latin-american face, no modern equipment, no
NATO or US insignia, no national flag on clothing. No text, no watermark.
```

---

## 16. NORMA : cálida

**Guardar como:** `assets/portraits/norma_calida.png` · *retrato*

```
Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug (SNK Neo Geo
era), hand-drawn sprite look, chunky black pixel outlines, expressive exaggerated
character poses and faces, rich dithered shading, saturated military palette of
olive drab, steel blue-grey, silver and warm sand with a single red accent when
noted, dramatic cinematic side-scroller composition, crisp clean pixels, no
anti-aliasing, no photorealism, no 3D render, no smooth digital painting.

Portrait bust of an argentine mother, 47 years old, middle-aged not elderly,
criolla, dark hair with grey at the temples pulled back in a low bun, warm tired
face, wearing a faded blue dress with a cream floral apron, chest-up, three-quarter
view facing slightly left, a warm knowing half-smile aimed at her husband, eyebrows
raised in gentle teasing, completely at ease in her own kitchen, neutral dark
background for clean cutout, consistent framing and scale, pixel art character
portrait for a dialogue box. Argentina 1982, argentine latin-american face, no
military insignia of any kind, no national flag on clothing. No text, no watermark.
```

---

## 17. NORMA : seria

**Guardar como:** `assets/portraits/norma_seria.png` · *retrato*

```
Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug (SNK Neo Geo
era), hand-drawn sprite look, chunky black pixel outlines, expressive exaggerated
character poses and faces, rich dithered shading, saturated military palette of
olive drab, steel blue-grey, silver and warm sand with a single red accent when
noted, dramatic cinematic side-scroller composition, crisp clean pixels, no
anti-aliasing, no photorealism, no 3D render, no smooth digital painting.

Portrait bust of an argentine mother, 47 years old, middle-aged not elderly,
criolla, dark hair with grey at the temples pulled back in a low bun, wearing a faded
blue dress with a cream floral apron, chest-up, three-quarter view facing slightly
left, the smile gone, mouth closed in a firm line, eyes turned toward something
off-frame she cannot see, one hand frozen halfway through a movement, a woman
listening very carefully, neutral dark background for clean cutout, consistent
framing and scale, pixel art character portrait for a dialogue box. Argentina 1982,
argentine latin-american face, no military insignia of any kind, no national flag on
clothing. No text, no watermark.
```

---

## 18. CÓNDOR : el parlante

**Guardar como:** `assets/portraits/condor_parlante.png` · *retrato*

```
Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug (SNK Neo Geo
era), hand-drawn sprite look, chunky black pixel outlines, expressive exaggerated
character poses and faces, rich dithered shading, saturated military palette of
olive drab, steel blue-grey, silver and warm sand with a single red accent when
noted, dramatic cinematic side-scroller composition, crisp clean pixels, no
anti-aliasing, no photorealism, no 3D render, no smooth digital painting.

Portrait-format close-up of a scratched olive-green military radio loudspeaker
grille with a single amber indicator lamp lit beside it, worn painted metal, chipped
edges, a faint green audio waveform glowing across the grille, framed exactly like a
character portrait bust — chest-up scale, three-quarter view facing slightly left —
neutral dark background for clean cutout, consistent framing and scale with the
character portraits, pixel art portrait for a dialogue box. Argentina 1982, no modern
equipment, no NATO or US insignia. No text, no watermark.
```

---

## 19. `fig_tero_p2_sentado` — sentado a la mesa, hablando con el hijo

**Guardar como:** `assets/figures/fig_tero_p2_sentado.png` · *figura*

```
Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug (SNK Neo Geo
era), hand-drawn sprite look, chunky black pixel outlines, expressive exaggerated
character poses and faces, rich dithered shading, saturated military palette of
olive drab, steel blue-grey, silver and warm sand with a single red accent when
noted, dramatic cinematic side-scroller composition, crisp clean pixels, no
anti-aliasing, no photorealism, no 3D render, no smooth digital painting.

Full body of an argentine man, 41 years old, very tall and very thin, gaunt and
narrow, neck carried forward, black hair greying at the temples, clean-shaven,
wearing a plain buttoned civilian shirt with the sleeves rolled up — NO flight suit,
NO military equipment of any kind —, seated on a wooden kitchen chair seen from
three-quarter BEHIND, one forearm resting on the table, relaxed, his face turned away
and NOT legible. STATIC held pose, no motion blur, no action. Warm late-morning light
from a small window on the left. Flat solid magenta background for clean cutout.
Argentina 1982, argentine latin-american person, no modern equipment, no NATO or US
insignia, no national flag on clothing. No text, no watermark.
```

---

## 20. `fig_tero_p2_telefono` — de pie en el teléfono de pared, de espaldas

**Guardar como:** `assets/figures/fig_tero_p2_telefono.png` · *figura*

```
Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug (SNK Neo Geo
era), hand-drawn sprite look, chunky black pixel outlines, expressive exaggerated
character poses and faces, rich dithered shading, saturated military palette of
olive drab, steel blue-grey, silver and warm sand with a single red accent when
noted, dramatic cinematic side-scroller composition, crisp clean pixels, no
anti-aliasing, no photorealism, no 3D render, no smooth digital painting.

Full body of an argentine man, 41 years old, very tall and very thin, gaunt and
narrow, black hair greying at the temples, plain buttoned civilian shirt with sleeves
rolled up, standing with his BACK to the viewer at a wall-mounted rotary telephone,
the handset held to his ear, the free hand flat against the wall, shoulders very
still, face NOT visible. STATIC held pose, no motion blur, no action. Warm
late-morning light from a small window on the left. Flat solid magenta background for
clean cutout. Argentina 1982, argentine latin-american person, no modern equipment, no
NATO or US insignia, no national flag on clothing. No text, no watermark.
```

---

## 21. `fig_tero_p2_radio` — de pie en la repisa, la mano en la radio

**Guardar como:** `assets/figures/fig_tero_p2_radio.png` · *figura*

```
Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug (SNK Neo Geo
era), hand-drawn sprite look, chunky black pixel outlines, expressive exaggerated
character poses and faces, rich dithered shading, saturated military palette of
olive drab, steel blue-grey, silver and warm sand with a single red accent when
noted, dramatic cinematic side-scroller composition, crisp clean pixels, no
anti-aliasing, no photorealism, no 3D render, no smooth digital painting.

Full body of an argentine man, 41 years old, very tall and very thin, gaunt and
narrow, black hair greying at the temples, plain buttoned civilian shirt with sleeves
rolled up, standing with his BACK to the viewer at a shelf, one hand on the knob of a
small valve radio, head slightly lowered, completely still, face NOT visible. STATIC
held pose, no motion blur, no action. Warm late-morning light from a small window on
the left. Flat solid magenta background for clean cutout. Argentina 1982, argentine
latin-american person, no modern equipment, no NATO or US insignia, no national flag
on clothing. No text, no watermark.
```

---

## 22. `fig_mateo_p2_sentado` — sentado enfrente, de 3/4 de frente pero lejos

**Guardar como:** `assets/figures/fig_mateo_p2_sentado.png` · *figura*

```
Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug (SNK Neo Geo
era), hand-drawn sprite look, chunky black pixel outlines, expressive exaggerated
character poses and faces, rich dithered shading, saturated military palette of
olive drab, steel blue-grey, silver and warm sand with a single red accent when
noted, dramatic cinematic side-scroller composition, crisp clean pixels, no
anti-aliasing, no photorealism, no 3D render, no smooth digital painting.

Full body of a skinny argentine teenager, 18 years old and reads as 18, criollo
features, olive skin, head freshly shaved to the scalp for military service, patchy
teenage mustache, plain civilian short-sleeved shirt — NO uniform, NO helmet, NO field
gear —, seated on a wooden kitchen chair in three-quarter view, leaning back easy with
one arm hooked over the chair back, small in frame, face small and NOT detailed.
STATIC held pose, no motion blur, no action. Warm late-morning light from a small
window on the left. Flat solid magenta background for clean cutout. Argentina 1982,
argentine latin-american person, no modern military equipment, no NATO or US insignia,
no national flag on clothing. No text, no watermark.
```

---

## 23. `fig_norma_p2_sirviendo` — de pie en la cocina, de espaldas

**Guardar como:** `assets/figures/fig_norma_p2_sirviendo.png` · *figura*

```
Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug (SNK Neo Geo
era), hand-drawn sprite look, chunky black pixel outlines, expressive exaggerated
character poses and faces, rich dithered shading, saturated military palette of
olive drab, steel blue-grey, silver and warm sand with a single red accent when
noted, dramatic cinematic side-scroller composition, crisp clean pixels, no
anti-aliasing, no photorealism, no 3D render, no smooth digital painting.

Full body of an argentine woman, 47 years old, middle-aged not elderly, criolla,
dark hair with grey at the temples pulled back in a low bun, faded blue dress with a
cream floral apron, standing with her BACK to the viewer at a stove, serving from a pot
with a wooden spoon, weight on one hip, face NOT visible. STATIC held pose, no motion
blur, no action. Warm late-morning light from a small window on the left. Flat solid
magenta background for clean cutout. Argentina 1982, argentine latin-american person,
no military insignia of any kind, no national flag on clothing. No text, no watermark.
```

---

## 24. `fig_norma_p2_telefono` — se da vuelta con el tubo en la mano

**Guardar como:** `assets/figures/fig_norma_p2_telefono.png` · *figura*

```
Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug (SNK Neo Geo
era), hand-drawn sprite look, chunky black pixel outlines, expressive exaggerated
character poses and faces, rich dithered shading, saturated military palette of
olive drab, steel blue-grey, silver and warm sand with a single red accent when
noted, dramatic cinematic side-scroller composition, crisp clean pixels, no
anti-aliasing, no photorealism, no 3D render, no smooth digital painting.

Full body of an argentine woman, 47 years old, middle-aged not elderly, criolla,
dark hair with grey at the temples pulled back in a low bun, faded blue dress with a
cream floral apron, standing in three-quarter view half-turned toward the room, holding
out a telephone handset on its stretched coiled cord toward someone off-frame, the
other hand on her hip, face small and NOT detailed. STATIC held pose, no motion blur,
no action. Warm late-morning light from a small window on the left. Flat solid magenta
background for clean cutout. Argentina 1982, argentine latin-american person, no
military insignia of any kind, no national flag on clothing. No text, no watermark.
```

---
