# RASANTE — Hojas de emociones (muchas) · 22/10/2026

**Pedido del autor:** *"necesito armar hojas de emociones de algunos personajes que quiero definir
nuevos, no de la historia sino genéricos de diversos pilotos para rellenar, y uno para la historia
que sería el que maneja la Chancha (...) 5 personajes diferentes a las misiones de campaña, hacer a
Cóndor también, y al de la Chancha, y quiero hacer las hojas de personajes con MUCHAS EMOCIONES,
MUCHAS."* — *"y rearmar las de los personajes que ya tengo"*.

## Cómo está armado

- **Tres tiras de seis por personaje = 18 caras.** Más de seis por tira y el generador pierde la
  escala entre celdas; tres tiras iguales mantienen todo alineado.
  - **Tira A, la base:** neutro · sonrisa · preocupado · ceño · roto · *la propia*.
  - **Tira B, las fuertes:** risa · miedo · grito · llanto · alivio · decidido.
  - **Tira C, los matices:** sorpresa · duda · cansado · pícaro · culpa · hablando.
- **Fondo verde fosforescente (#00ff00)** en todas, para recortarlo — el formato nuevo.
- **Mismo bloque de estilo, misma grilla, misma escala** en todas las hojas.
- **Los personajes que ya existen** usan su lámina como IMAGE 1, como siempre; su tira A es la
  misma de antes, ahora con fondo verde.
- **Los nuevos son PROPUESTAS de diseño:** las caras las define el autor; cambiá lo que quieras
  antes de generar.

> ⚠ **Para la sesión de código:** estos prompts están escritos a mano a partir de
> `PROMPTS_RETRATOS_LISTOS.md`. El generador `tools/hacer_prompts_retratos.py` todavía no los
> conoce: hay que sumarle las tiras B y C, los personajes nuevos y el fondo verde, y regenerar.

> ⚠ **Cóndor:** hasta ahora **no tenía cara** — su retrato era una radio (*"la máquina de la guerra
> no tiene cara"*). Con esta hoja pasa a tener. **Es un cambio de canon: confirmalo.**

**Cortar:** `python3 tools/install_retratos.py <hoja>.png --anclaje pad <seis nombres>` — los
nombres van debajo de cada prompt.

---

# LOS NUEVOS — propuestas de diseño

*Cinco pilotos genéricos (de otras escuadrillas, para rellenar), el de la Chancha y Cóndor. Ninguno se parece a los ocho del elenco: el Vasco es el pálido de pelo negro, el Colorado el rubio colorado, el Turco el de nariz grande, Puma el del bigote gris.*

---

## LA CHANCHA — el piloto del Hércules

### Tira A

**Adjuntar:** `final/team.png` *(IMAGE 1 — **solo** por el trazo)*

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
BACKGROUND: flat pure phosphorescent green (#00ff00) behind the figure in every
cell, no scenery, no props, no vignette, no shadow cast on the background - this
will be colour-keyed out. Nothing on the character may be that green.
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

**Adjuntar:** `final/team.png` *(IMAGE 1 — **solo** por el trazo)*

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
BACKGROUND: flat pure phosphorescent green (#00ff00) behind the figure in every
cell, no scenery, no props, no vignette, no shadow cast on the background - this
will be colour-keyed out. Nothing on the character may be that green.
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

### Tira C

**Adjuntar:** `final/team.png` *(IMAGE 1 — **solo** por el trazo)*

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
BACKGROUND: flat pure phosphorescent green (#00ff00) behind the figure in every
cell, no scenery, no props, no vignette, no shadow cast on the background - this
will be colour-keyed out. Nothing on the character may be that green.
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

EXPRESSIONS, left to right - STRIP C, the in-between ones. Each one as THIS
character would do it, never as a generic face:
CELL 1 - SURPRISED: eyebrows shot up, eyes wide, mouth a small round O.
CELL 2 - DOUBTFUL: one eyebrow up and one down, eyes glancing to the side, mouth
  pulled to one side.
CELL 3 - EXHAUSTED: heavy half-closed eyelids, head tilted, mouth slack, shoulders
  dropped.
CELL 4 - MISCHIEVOUS: a one-sided grin, one eyebrow cocked, eyes sliding sideways -
  he knows something.
CELL 5 - ASHAMED: head lowered, eyes looking down and away, eyebrows up in the middle,
  mouth pressed shut.
CELL 6 - TALKING: the neutral face, mouth open mid-word, eyebrows slightly raised -
  for dialogue lines.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `chancha_sorpresa chancha_duda chancha_cansado chancha_picaro chancha_culpa chancha_hablando`

---

## CÓNDOR — el comando, desde la base

### Tira A

**Adjuntar:** `final/team.png` *(IMAGE 1 — **solo** por el trazo)*

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
BACKGROUND: flat pure phosphorescent green (#00ff00) behind the figure in every
cell, no scenery, no props, no vignette, no shadow cast on the background - this
will be colour-keyed out. Nothing on the character may be that green.
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

**Adjuntar:** `final/team.png` *(IMAGE 1 — **solo** por el trazo)*

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
BACKGROUND: flat pure phosphorescent green (#00ff00) behind the figure in every
cell, no scenery, no props, no vignette, no shadow cast on the background - this
will be colour-keyed out. Nothing on the character may be that green.
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

### Tira C

**Adjuntar:** `final/team.png` *(IMAGE 1 — **solo** por el trazo)*

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
BACKGROUND: flat pure phosphorescent green (#00ff00) behind the figure in every
cell, no scenery, no props, no vignette, no shadow cast on the background - this
will be colour-keyed out. Nothing on the character may be that green.
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

EXPRESSIONS, left to right - STRIP C, the in-between ones. Each one as THIS
character would do it, never as a generic face:
CELL 1 - SURPRISED: eyebrows shot up, eyes wide, mouth a small round O.
CELL 2 - DOUBTFUL: one eyebrow up and one down, eyes glancing to the side, mouth
  pulled to one side.
CELL 3 - EXHAUSTED: heavy half-closed eyelids, head tilted, mouth slack, shoulders
  dropped.
CELL 4 - MISCHIEVOUS: a one-sided grin, one eyebrow cocked, eyes sliding sideways -
  he knows something.
CELL 5 - ASHAMED: head lowered, eyes looking down and away, eyebrows up in the middle,
  mouth pressed shut.
CELL 6 - TALKING: the neutral face, mouth open mid-word, eyebrows slightly raised -
  for dialogue lines.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `condor_sorpresa condor_duda condor_cansado condor_picaro condor_culpa condor_hablando`

---

## PILOTO 1 — EL VETERANO

### Tira A

**Adjuntar:** `final/team.png` *(IMAGE 1 — **solo** por el trazo)*

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
BACKGROUND: flat pure phosphorescent green (#00ff00) behind the figure in every
cell, no scenery, no props, no vignette, no shadow cast on the background - this
will be colour-keyed out. Nothing on the character may be that green.
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

**Adjuntar:** `final/team.png` *(IMAGE 1 — **solo** por el trazo)*

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
BACKGROUND: flat pure phosphorescent green (#00ff00) behind the figure in every
cell, no scenery, no props, no vignette, no shadow cast on the background - this
will be colour-keyed out. Nothing on the character may be that green.
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

### Tira C

**Adjuntar:** `final/team.png` *(IMAGE 1 — **solo** por el trazo)*

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
BACKGROUND: flat pure phosphorescent green (#00ff00) behind the figure in every
cell, no scenery, no props, no vignette, no shadow cast on the background - this
will be colour-keyed out. Nothing on the character may be that green.
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

EXPRESSIONS, left to right - STRIP C, the in-between ones. Each one as THIS
character would do it, never as a generic face:
CELL 1 - SURPRISED: eyebrows shot up, eyes wide, mouth a small round O.
CELL 2 - DOUBTFUL: one eyebrow up and one down, eyes glancing to the side, mouth
  pulled to one side.
CELL 3 - EXHAUSTED: heavy half-closed eyelids, head tilted, mouth slack, shoulders
  dropped.
CELL 4 - MISCHIEVOUS: a one-sided grin, one eyebrow cocked, eyes sliding sideways -
  he knows something.
CELL 5 - ASHAMED: head lowered, eyes looking down and away, eyebrows up in the middle,
  mouth pressed shut.
CELL 6 - TALKING: the neutral face, mouth open mid-word, eyebrows slightly raised -
  for dialogue lines.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `piloto_veterano_sorpresa piloto_veterano_duda piloto_veterano_cansado piloto_veterano_picaro piloto_veterano_culpa piloto_veterano_hablando`

---

## PILOTO 2 — EL PIBE

### Tira A

**Adjuntar:** `final/team.png` *(IMAGE 1 — **solo** por el trazo)*

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
BACKGROUND: flat pure phosphorescent green (#00ff00) behind the figure in every
cell, no scenery, no props, no vignette, no shadow cast on the background - this
will be colour-keyed out. Nothing on the character may be that green.
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

**Adjuntar:** `final/team.png` *(IMAGE 1 — **solo** por el trazo)*

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
BACKGROUND: flat pure phosphorescent green (#00ff00) behind the figure in every
cell, no scenery, no props, no vignette, no shadow cast on the background - this
will be colour-keyed out. Nothing on the character may be that green.
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

### Tira C

**Adjuntar:** `final/team.png` *(IMAGE 1 — **solo** por el trazo)*

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
BACKGROUND: flat pure phosphorescent green (#00ff00) behind the figure in every
cell, no scenery, no props, no vignette, no shadow cast on the background - this
will be colour-keyed out. Nothing on the character may be that green.
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

EXPRESSIONS, left to right - STRIP C, the in-between ones. Each one as THIS
character would do it, never as a generic face:
CELL 1 - SURPRISED: eyebrows shot up, eyes wide, mouth a small round O.
CELL 2 - DOUBTFUL: one eyebrow up and one down, eyes glancing to the side, mouth
  pulled to one side.
CELL 3 - EXHAUSTED: heavy half-closed eyelids, head tilted, mouth slack, shoulders
  dropped.
CELL 4 - MISCHIEVOUS: a one-sided grin, one eyebrow cocked, eyes sliding sideways -
  he knows something.
CELL 5 - ASHAMED: head lowered, eyes looking down and away, eyebrows up in the middle,
  mouth pressed shut.
CELL 6 - TALKING: the neutral face, mouth open mid-word, eyebrows slightly raised -
  for dialogue lines.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `piloto_pibe_sorpresa piloto_pibe_duda piloto_pibe_cansado piloto_pibe_picaro piloto_pibe_culpa piloto_pibe_hablando`

---

## PILOTO 3 — EL NORTEÑO

### Tira A

**Adjuntar:** `final/team.png` *(IMAGE 1 — **solo** por el trazo)*

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
BACKGROUND: flat pure phosphorescent green (#00ff00) behind the figure in every
cell, no scenery, no props, no vignette, no shadow cast on the background - this
will be colour-keyed out. Nothing on the character may be that green.
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

**Adjuntar:** `final/team.png` *(IMAGE 1 — **solo** por el trazo)*

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
BACKGROUND: flat pure phosphorescent green (#00ff00) behind the figure in every
cell, no scenery, no props, no vignette, no shadow cast on the background - this
will be colour-keyed out. Nothing on the character may be that green.
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

### Tira C

**Adjuntar:** `final/team.png` *(IMAGE 1 — **solo** por el trazo)*

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
BACKGROUND: flat pure phosphorescent green (#00ff00) behind the figure in every
cell, no scenery, no props, no vignette, no shadow cast on the background - this
will be colour-keyed out. Nothing on the character may be that green.
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

EXPRESSIONS, left to right - STRIP C, the in-between ones. Each one as THIS
character would do it, never as a generic face:
CELL 1 - SURPRISED: eyebrows shot up, eyes wide, mouth a small round O.
CELL 2 - DOUBTFUL: one eyebrow up and one down, eyes glancing to the side, mouth
  pulled to one side.
CELL 3 - EXHAUSTED: heavy half-closed eyelids, head tilted, mouth slack, shoulders
  dropped.
CELL 4 - MISCHIEVOUS: a one-sided grin, one eyebrow cocked, eyes sliding sideways -
  he knows something.
CELL 5 - ASHAMED: head lowered, eyes looking down and away, eyebrows up in the middle,
  mouth pressed shut.
CELL 6 - TALKING: the neutral face, mouth open mid-word, eyebrows slightly raised -
  for dialogue lines.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `piloto_norteno_sorpresa piloto_norteno_duda piloto_norteno_cansado piloto_norteno_picaro piloto_norteno_culpa piloto_norteno_hablando`

---

## PILOTO 4 — EL TANO

### Tira A

**Adjuntar:** `final/team.png` *(IMAGE 1 — **solo** por el trazo)*

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
BACKGROUND: flat pure phosphorescent green (#00ff00) behind the figure in every
cell, no scenery, no props, no vignette, no shadow cast on the background - this
will be colour-keyed out. Nothing on the character may be that green.
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

**Adjuntar:** `final/team.png` *(IMAGE 1 — **solo** por el trazo)*

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
BACKGROUND: flat pure phosphorescent green (#00ff00) behind the figure in every
cell, no scenery, no props, no vignette, no shadow cast on the background - this
will be colour-keyed out. Nothing on the character may be that green.
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

### Tira C

**Adjuntar:** `final/team.png` *(IMAGE 1 — **solo** por el trazo)*

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
BACKGROUND: flat pure phosphorescent green (#00ff00) behind the figure in every
cell, no scenery, no props, no vignette, no shadow cast on the background - this
will be colour-keyed out. Nothing on the character may be that green.
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

EXPRESSIONS, left to right - STRIP C, the in-between ones. Each one as THIS
character would do it, never as a generic face:
CELL 1 - SURPRISED: eyebrows shot up, eyes wide, mouth a small round O.
CELL 2 - DOUBTFUL: one eyebrow up and one down, eyes glancing to the side, mouth
  pulled to one side.
CELL 3 - EXHAUSTED: heavy half-closed eyelids, head tilted, mouth slack, shoulders
  dropped.
CELL 4 - MISCHIEVOUS: a one-sided grin, one eyebrow cocked, eyes sliding sideways -
  he knows something.
CELL 5 - ASHAMED: head lowered, eyes looking down and away, eyebrows up in the middle,
  mouth pressed shut.
CELL 6 - TALKING: the neutral face, mouth open mid-word, eyebrows slightly raised -
  for dialogue lines.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `piloto_tano_sorpresa piloto_tano_duda piloto_tano_cansado piloto_tano_picaro piloto_tano_culpa piloto_tano_hablando`

---

## PILOTO 5 — EL GRINGO

### Tira A

**Adjuntar:** `final/team.png` *(IMAGE 1 — **solo** por el trazo)*

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
BACKGROUND: flat pure phosphorescent green (#00ff00) behind the figure in every
cell, no scenery, no props, no vignette, no shadow cast on the background - this
will be colour-keyed out. Nothing on the character may be that green.
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

**Adjuntar:** `final/team.png` *(IMAGE 1 — **solo** por el trazo)*

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
BACKGROUND: flat pure phosphorescent green (#00ff00) behind the figure in every
cell, no scenery, no props, no vignette, no shadow cast on the background - this
will be colour-keyed out. Nothing on the character may be that green.
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

### Tira C

**Adjuntar:** `final/team.png` *(IMAGE 1 — **solo** por el trazo)*

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
BACKGROUND: flat pure phosphorescent green (#00ff00) behind the figure in every
cell, no scenery, no props, no vignette, no shadow cast on the background - this
will be colour-keyed out. Nothing on the character may be that green.
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

EXPRESSIONS, left to right - STRIP C, the in-between ones. Each one as THIS
character would do it, never as a generic face:
CELL 1 - SURPRISED: eyebrows shot up, eyes wide, mouth a small round O.
CELL 2 - DOUBTFUL: one eyebrow up and one down, eyes glancing to the side, mouth
  pulled to one side.
CELL 3 - EXHAUSTED: heavy half-closed eyelids, head tilted, mouth slack, shoulders
  dropped.
CELL 4 - MISCHIEVOUS: a one-sided grin, one eyebrow cocked, eyes sliding sideways -
  he knows something.
CELL 5 - ASHAMED: head lowered, eyes looking down and away, eyebrows up in the middle,
  mouth pressed shut.
CELL 6 - TALKING: the neutral face, mouth open mid-word, eyebrows slightly raised -
  for dialogue lines.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `piloto_gringo_sorpresa piloto_gringo_duda piloto_gringo_cansado piloto_gringo_picaro piloto_gringo_culpa piloto_gringo_hablando`

---

# LOS QUE YA EXISTEN — rearmadas con fondo verde y 18 caras

*La tira A es la misma de `PROMPTS_RETRATOS_LISTOS.md` (con su celda propia), ahora sobre verde. B y C son nuevas.*

---

## TERO · Esteban

### Tira A

**Adjuntar:** `final/tero3.png` *(IMAGE 1)* · `final/team.png` *(IMAGE 2)*

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
BACKGROUND: flat pure phosphorescent green (#00ff00) behind the figure in every
cell, no scenery, no props, no vignette, no shadow cast on the background - this
will be colour-keyed out. Nothing on the character may be that green.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is this character's finished model sheet. Copy his clothing, his colouring
and his line work exactly, and match its rendering precisely: same line weight,
same shading.
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

**Adjuntar:** `final/tero3.png` *(IMAGE 1)* · `final/team.png` *(IMAGE 2)*

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
BACKGROUND: flat pure phosphorescent green (#00ff00) behind the figure in every
cell, no scenery, no props, no vignette, no shadow cast on the background - this
will be colour-keyed out. Nothing on the character may be that green.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is this character's finished model sheet. Copy his clothing, his colouring
and his line work exactly, and match its rendering precisely: same line weight,
same shading.
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

### Tira C

**Adjuntar:** `final/tero3.png` *(IMAGE 1)* · `final/team.png` *(IMAGE 2)*

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
BACKGROUND: flat pure phosphorescent green (#00ff00) behind the figure in every
cell, no scenery, no props, no vignette, no shadow cast on the background - this
will be colour-keyed out. Nothing on the character may be that green.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is this character's finished model sheet. Copy his clothing, his colouring
and his line work exactly, and match its rendering precisely: same line weight,
same shading.
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

EXPRESSIONS, left to right - STRIP C, the in-between ones. Each one as THIS
character would do it, never as a generic face:
CELL 1 - SURPRISED: eyebrows shot up, eyes wide, mouth a small round O.
CELL 2 - DOUBTFUL: one eyebrow up and one down, eyes glancing to the side, mouth
  pulled to one side.
CELL 3 - EXHAUSTED: heavy half-closed eyelids, head tilted, mouth slack, shoulders
  dropped.
CELL 4 - MISCHIEVOUS: a one-sided grin, one eyebrow cocked, eyes sliding sideways -
  he knows something.
CELL 5 - ASHAMED: head lowered, eyes looking down and away, eyebrows up in the middle,
  mouth pressed shut.
CELL 6 - TALKING: the neutral face, mouth open mid-word, eyebrows slightly raised -
  for dialogue lines.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `tero_sorpresa tero_duda tero_cansado tero_picaro tero_culpa tero_hablando`

---

## PUMA

### Tira A

**Adjuntar:** `final/puma.png` *(IMAGE 1)* · `final/team.png` *(IMAGE 2)*

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
BACKGROUND: flat pure phosphorescent green (#00ff00) behind the figure in every
cell, no scenery, no props, no vignette, no shadow cast on the background - this
will be colour-keyed out. Nothing on the character may be that green.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is this character's finished model sheet. Copy his clothing, his colouring
and his line work exactly, and match its rendering precisely: same line weight,
same shading.
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

**Adjuntar:** `final/puma.png` *(IMAGE 1)* · `final/team.png` *(IMAGE 2)*

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
BACKGROUND: flat pure phosphorescent green (#00ff00) behind the figure in every
cell, no scenery, no props, no vignette, no shadow cast on the background - this
will be colour-keyed out. Nothing on the character may be that green.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is this character's finished model sheet. Copy his clothing, his colouring
and his line work exactly, and match its rendering precisely: same line weight,
same shading.
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

### Tira C

**Adjuntar:** `final/puma.png` *(IMAGE 1)* · `final/team.png` *(IMAGE 2)*

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
BACKGROUND: flat pure phosphorescent green (#00ff00) behind the figure in every
cell, no scenery, no props, no vignette, no shadow cast on the background - this
will be colour-keyed out. Nothing on the character may be that green.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is this character's finished model sheet. Copy his clothing, his colouring
and his line work exactly, and match its rendering precisely: same line weight,
same shading.
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

EXPRESSIONS, left to right - STRIP C, the in-between ones. Each one as THIS
character would do it, never as a generic face:
CELL 1 - SURPRISED: eyebrows shot up, eyes wide, mouth a small round O.
CELL 2 - DOUBTFUL: one eyebrow up and one down, eyes glancing to the side, mouth
  pulled to one side.
CELL 3 - EXHAUSTED: heavy half-closed eyelids, head tilted, mouth slack, shoulders
  dropped.
CELL 4 - MISCHIEVOUS: a one-sided grin, one eyebrow cocked, eyes sliding sideways -
  he knows something.
CELL 5 - ASHAMED: head lowered, eyes looking down and away, eyebrows up in the middle,
  mouth pressed shut.
CELL 6 - TALKING: the neutral face, mouth open mid-word, eyebrows slightly raised -
  for dialogue lines.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `puma_sorpresa puma_duda puma_cansado puma_picaro puma_culpa puma_hablando`

---

## GITANO

### Tira A

**Adjuntar:** `final/gitano.png` *(IMAGE 1)* · `final/team.png` *(IMAGE 2)*

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
BACKGROUND: flat pure phosphorescent green (#00ff00) behind the figure in every
cell, no scenery, no props, no vignette, no shadow cast on the background - this
will be colour-keyed out. Nothing on the character may be that green.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is this character's finished model sheet. Copy his clothing, his colouring
and his line work exactly, and match its rendering precisely: same line weight,
same shading.
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

**Adjuntar:** `final/gitano.png` *(IMAGE 1)* · `final/team.png` *(IMAGE 2)*

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
BACKGROUND: flat pure phosphorescent green (#00ff00) behind the figure in every
cell, no scenery, no props, no vignette, no shadow cast on the background - this
will be colour-keyed out. Nothing on the character may be that green.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is this character's finished model sheet. Copy his clothing, his colouring
and his line work exactly, and match its rendering precisely: same line weight,
same shading.
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

### Tira C

**Adjuntar:** `final/gitano.png` *(IMAGE 1)* · `final/team.png` *(IMAGE 2)*

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
BACKGROUND: flat pure phosphorescent green (#00ff00) behind the figure in every
cell, no scenery, no props, no vignette, no shadow cast on the background - this
will be colour-keyed out. Nothing on the character may be that green.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is this character's finished model sheet. Copy his clothing, his colouring
and his line work exactly, and match its rendering precisely: same line weight,
same shading.
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

EXPRESSIONS, left to right - STRIP C, the in-between ones. Each one as THIS
character would do it, never as a generic face:
CELL 1 - SURPRISED: eyebrows shot up, eyes wide, mouth a small round O.
CELL 2 - DOUBTFUL: one eyebrow up and one down, eyes glancing to the side, mouth
  pulled to one side.
CELL 3 - EXHAUSTED: heavy half-closed eyelids, head tilted, mouth slack, shoulders
  dropped.
CELL 4 - MISCHIEVOUS: a one-sided grin, one eyebrow cocked, eyes sliding sideways -
  he knows something.
CELL 5 - ASHAMED: head lowered, eyes looking down and away, eyebrows up in the middle,
  mouth pressed shut.
CELL 6 - TALKING: the neutral face, mouth open mid-word, eyebrows slightly raised -
  for dialogue lines.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `gitano_sorpresa gitano_duda gitano_cansado gitano_picaro gitano_culpa gitano_hablando`

---

## VASCO

### Tira A

**Adjuntar:** `final/vasco2.png` *(IMAGE 1)* · `final/team.png` *(IMAGE 2)*

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
BACKGROUND: flat pure phosphorescent green (#00ff00) behind the figure in every
cell, no scenery, no props, no vignette, no shadow cast on the background - this
will be colour-keyed out. Nothing on the character may be that green.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is this character's finished model sheet. Copy his clothing, his colouring
and his line work exactly, and match its rendering precisely: same line weight,
same shading.
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

**Adjuntar:** `final/vasco2.png` *(IMAGE 1)* · `final/team.png` *(IMAGE 2)*

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
BACKGROUND: flat pure phosphorescent green (#00ff00) behind the figure in every
cell, no scenery, no props, no vignette, no shadow cast on the background - this
will be colour-keyed out. Nothing on the character may be that green.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is this character's finished model sheet. Copy his clothing, his colouring
and his line work exactly, and match its rendering precisely: same line weight,
same shading.
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

### Tira C

**Adjuntar:** `final/vasco2.png` *(IMAGE 1)* · `final/team.png` *(IMAGE 2)*

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
BACKGROUND: flat pure phosphorescent green (#00ff00) behind the figure in every
cell, no scenery, no props, no vignette, no shadow cast on the background - this
will be colour-keyed out. Nothing on the character may be that green.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is this character's finished model sheet. Copy his clothing, his colouring
and his line work exactly, and match its rendering precisely: same line weight,
same shading.
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

EXPRESSIONS, left to right - STRIP C, the in-between ones. Each one as THIS
character would do it, never as a generic face:
CELL 1 - SURPRISED: eyebrows shot up, eyes wide, mouth a small round O.
CELL 2 - DOUBTFUL: one eyebrow up and one down, eyes glancing to the side, mouth
  pulled to one side.
CELL 3 - EXHAUSTED: heavy half-closed eyelids, head tilted, mouth slack, shoulders
  dropped.
CELL 4 - MISCHIEVOUS: a one-sided grin, one eyebrow cocked, eyes sliding sideways -
  he knows something.
CELL 5 - ASHAMED: head lowered, eyes looking down and away, eyebrows up in the middle,
  mouth pressed shut.
CELL 6 - TALKING: the neutral face, mouth open mid-word, eyebrows slightly raised -
  for dialogue lines.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `vasco_sorpresa vasco_duda vasco_cansado vasco_picaro vasco_culpa vasco_hablando`

---

## PICHÓN

### Tira A

**Adjuntar:** `final/pichon3.png` *(IMAGE 1)* · `final/team.png` *(IMAGE 2)*

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
BACKGROUND: flat pure phosphorescent green (#00ff00) behind the figure in every
cell, no scenery, no props, no vignette, no shadow cast on the background - this
will be colour-keyed out. Nothing on the character may be that green.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is this character's finished model sheet. Copy his clothing, his colouring
and his line work exactly, and match its rendering precisely: same line weight,
same shading.
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

**Adjuntar:** `final/pichon3.png` *(IMAGE 1)* · `final/team.png` *(IMAGE 2)*

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
BACKGROUND: flat pure phosphorescent green (#00ff00) behind the figure in every
cell, no scenery, no props, no vignette, no shadow cast on the background - this
will be colour-keyed out. Nothing on the character may be that green.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is this character's finished model sheet. Copy his clothing, his colouring
and his line work exactly, and match its rendering precisely: same line weight,
same shading.
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

### Tira C

**Adjuntar:** `final/pichon3.png` *(IMAGE 1)* · `final/team.png` *(IMAGE 2)*

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
BACKGROUND: flat pure phosphorescent green (#00ff00) behind the figure in every
cell, no scenery, no props, no vignette, no shadow cast on the background - this
will be colour-keyed out. Nothing on the character may be that green.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is this character's finished model sheet. Copy his clothing, his colouring
and his line work exactly, and match its rendering precisely: same line weight,
same shading.
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

EXPRESSIONS, left to right - STRIP C, the in-between ones. Each one as THIS
character would do it, never as a generic face:
CELL 1 - SURPRISED: eyebrows shot up, eyes wide, mouth a small round O.
CELL 2 - DOUBTFUL: one eyebrow up and one down, eyes glancing to the side, mouth
  pulled to one side.
CELL 3 - EXHAUSTED: heavy half-closed eyelids, head tilted, mouth slack, shoulders
  dropped.
CELL 4 - MISCHIEVOUS: a one-sided grin, one eyebrow cocked, eyes sliding sideways -
  he knows something.
CELL 5 - ASHAMED: head lowered, eyes looking down and away, eyebrows up in the middle,
  mouth pressed shut.
CELL 6 - TALKING: the neutral face, mouth open mid-word, eyebrows slightly raised -
  for dialogue lines.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `pichon_sorpresa pichon_duda pichon_cansado pichon_picaro pichon_culpa pichon_hablando`

---

## TURCO

### Tira A

**Adjuntar:** `final/turco3.png` *(IMAGE 1)* · `final/team.png` *(IMAGE 2)*

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
BACKGROUND: flat pure phosphorescent green (#00ff00) behind the figure in every
cell, no scenery, no props, no vignette, no shadow cast on the background - this
will be colour-keyed out. Nothing on the character may be that green.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is this character's finished model sheet. Copy his clothing, his colouring
and his line work exactly, and match its rendering precisely: same line weight,
same shading.
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

**Adjuntar:** `final/turco3.png` *(IMAGE 1)* · `final/team.png` *(IMAGE 2)*

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
BACKGROUND: flat pure phosphorescent green (#00ff00) behind the figure in every
cell, no scenery, no props, no vignette, no shadow cast on the background - this
will be colour-keyed out. Nothing on the character may be that green.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is this character's finished model sheet. Copy his clothing, his colouring
and his line work exactly, and match its rendering precisely: same line weight,
same shading.
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

### Tira C

**Adjuntar:** `final/turco3.png` *(IMAGE 1)* · `final/team.png` *(IMAGE 2)*

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
BACKGROUND: flat pure phosphorescent green (#00ff00) behind the figure in every
cell, no scenery, no props, no vignette, no shadow cast on the background - this
will be colour-keyed out. Nothing on the character may be that green.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is this character's finished model sheet. Copy his clothing, his colouring
and his line work exactly, and match its rendering precisely: same line weight,
same shading.
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

EXPRESSIONS, left to right - STRIP C, the in-between ones. Each one as THIS
character would do it, never as a generic face:
CELL 1 - SURPRISED: eyebrows shot up, eyes wide, mouth a small round O.
CELL 2 - DOUBTFUL: one eyebrow up and one down, eyes glancing to the side, mouth
  pulled to one side.
CELL 3 - EXHAUSTED: heavy half-closed eyelids, head tilted, mouth slack, shoulders
  dropped.
CELL 4 - MISCHIEVOUS: a one-sided grin, one eyebrow cocked, eyes sliding sideways -
  he knows something.
CELL 5 - ASHAMED: head lowered, eyes looking down and away, eyebrows up in the middle,
  mouth pressed shut.
CELL 6 - TALKING: the neutral face, mouth open mid-word, eyebrows slightly raised -
  for dialogue lines.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `turco_sorpresa turco_duda turco_cansado turco_picaro turco_culpa turco_hablando`

---

## MATEO

### Tira A

**Adjuntar:** `final/mato32.png` *(IMAGE 1)* · `final/team.png` *(IMAGE 2)*

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
BACKGROUND: flat pure phosphorescent green (#00ff00) behind the figure in every
cell, no scenery, no props, no vignette, no shadow cast on the background - this
will be colour-keyed out. Nothing on the character may be that green.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is this character's finished model sheet. Copy his clothing, his colouring
and his line work exactly, and match its rendering precisely: same line weight,
same shading.
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

**Adjuntar:** `final/mato32.png` *(IMAGE 1)* · `final/team.png` *(IMAGE 2)*

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
BACKGROUND: flat pure phosphorescent green (#00ff00) behind the figure in every
cell, no scenery, no props, no vignette, no shadow cast on the background - this
will be colour-keyed out. Nothing on the character may be that green.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is this character's finished model sheet. Copy his clothing, his colouring
and his line work exactly, and match its rendering precisely: same line weight,
same shading.
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

### Tira C

**Adjuntar:** `final/mato32.png` *(IMAGE 1)* · `final/team.png` *(IMAGE 2)*

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
BACKGROUND: flat pure phosphorescent green (#00ff00) behind the figure in every
cell, no scenery, no props, no vignette, no shadow cast on the background - this
will be colour-keyed out. Nothing on the character may be that green.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is this character's finished model sheet. Copy his clothing, his colouring
and his line work exactly, and match its rendering precisely: same line weight,
same shading.
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

EXPRESSIONS, left to right - STRIP C, the in-between ones. Each one as THIS
character would do it, never as a generic face:
CELL 1 - SURPRISED: eyebrows shot up, eyes wide, mouth a small round O.
CELL 2 - DOUBTFUL: one eyebrow up and one down, eyes glancing to the side, mouth
  pulled to one side.
CELL 3 - EXHAUSTED: heavy half-closed eyelids, head tilted, mouth slack, shoulders
  dropped.
CELL 4 - MISCHIEVOUS: a one-sided grin, one eyebrow cocked, eyes sliding sideways -
  he knows something.
CELL 5 - ASHAMED: head lowered, eyes looking down and away, eyebrows up in the middle,
  mouth pressed shut.
CELL 6 - TALKING: the neutral face, mouth open mid-word, eyebrows slightly raised -
  for dialogue lines.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `mateo_sorpresa mateo_duda mateo_cansado mateo_picaro mateo_culpa mateo_hablando`

---

## COLORADO

### Tira A

**Adjuntar:** `final/colorado3.png` *(IMAGE 1)* · `final/team.png` *(IMAGE 2)*

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
BACKGROUND: flat pure phosphorescent green (#00ff00) behind the figure in every
cell, no scenery, no props, no vignette, no shadow cast on the background - this
will be colour-keyed out. Nothing on the character may be that green.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is this character's finished model sheet. Copy his clothing, his colouring
and his line work exactly, and match its rendering precisely: same line weight,
same shading.
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

**Adjuntar:** `final/colorado3.png` *(IMAGE 1)* · `final/team.png` *(IMAGE 2)*

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
BACKGROUND: flat pure phosphorescent green (#00ff00) behind the figure in every
cell, no scenery, no props, no vignette, no shadow cast on the background - this
will be colour-keyed out. Nothing on the character may be that green.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is this character's finished model sheet. Copy his clothing, his colouring
and his line work exactly, and match its rendering precisely: same line weight,
same shading.
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

### Tira C

**Adjuntar:** `final/colorado3.png` *(IMAGE 1)* · `final/team.png` *(IMAGE 2)*

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
BACKGROUND: flat pure phosphorescent green (#00ff00) behind the figure in every
cell, no scenery, no props, no vignette, no shadow cast on the background - this
will be colour-keyed out. Nothing on the character may be that green.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is this character's finished model sheet. Copy his clothing, his colouring
and his line work exactly, and match its rendering precisely: same line weight,
same shading.
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

EXPRESSIONS, left to right - STRIP C, the in-between ones. Each one as THIS
character would do it, never as a generic face:
CELL 1 - SURPRISED: eyebrows shot up, eyes wide, mouth a small round O.
CELL 2 - DOUBTFUL: one eyebrow up and one down, eyes glancing to the side, mouth
  pulled to one side.
CELL 3 - EXHAUSTED: heavy half-closed eyelids, head tilted, mouth slack, shoulders
  dropped.
CELL 4 - MISCHIEVOUS: a one-sided grin, one eyebrow cocked, eyes sliding sideways -
  he knows something.
CELL 5 - ASHAMED: head lowered, eyes looking down and away, eyebrows up in the middle,
  mouth pressed shut.
CELL 6 - TALKING: the neutral face, mouth open mid-word, eyebrows slightly raised -
  for dialogue lines.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `colorado_sorpresa colorado_duda colorado_cansado colorado_picaro colorado_culpa colorado_hablando`

---

## NORMA — la madre

### Tira A

**Adjuntar:** `final/team.png` *(IMAGE 1 — **solo** por el trazo)*

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
BACKGROUND: flat pure phosphorescent green (#00ff00) behind the figure in every
cell, no scenery, no props, no vignette, no shadow cast on the background - this
will be colour-keyed out. Nothing on the character may be that green.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is the cast line-up. Copy its RENDERING ONLY: the line weight, the dithered
shading, the palette, the line work, the sprite proportions.
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

**Adjuntar:** `final/team.png` *(IMAGE 1 — **solo** por el trazo)*

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
BACKGROUND: flat pure phosphorescent green (#00ff00) behind the figure in every
cell, no scenery, no props, no vignette, no shadow cast on the background - this
will be colour-keyed out. Nothing on the character may be that green.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is the cast line-up. Copy its RENDERING ONLY: the line weight, the dithered
shading, the palette, the line work, the sprite proportions.
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

### Tira C

**Adjuntar:** `final/team.png` *(IMAGE 1 — **solo** por el trazo)*

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
BACKGROUND: flat pure phosphorescent green (#00ff00) behind the figure in every
cell, no scenery, no props, no vignette, no shadow cast on the background - this
will be colour-keyed out. Nothing on the character may be that green.
SCALE NOTE: this will be displayed very small (108x108). Build every expression out
of EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE. Do not rely on fine wrinkles,
freckles, small scars or eye colour - at final size they do not exist.

IMAGE 1 is the cast line-up. Copy its RENDERING ONLY: the line weight, the dithered
shading, the palette, the line work, the sprite proportions.
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

EXPRESSIONS, left to right - STRIP C, the in-between ones. Each one as THIS
character would do it, never as a generic face:
CELL 1 - SURPRISED: eyebrows shot up, eyes wide, mouth a small round O.
CELL 2 - DOUBTFUL: one eyebrow up and one down, eyes glancing to the side, mouth
  pulled to one side.
CELL 3 - EXHAUSTED: heavy half-closed eyelids, head tilted, mouth slack, shoulders
  dropped.
CELL 4 - MISCHIEVOUS: a one-sided grin, one eyebrow cocked, eyes sliding sideways -
  he knows something.
CELL 5 - ASHAMED: head lowered, eyes looking down and away, eyebrows up in the middle,
  mouth pressed shut.
CELL 6 - TALKING: the neutral face, mouth open mid-word, eyebrows slightly raised -
  for dialogue lines.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern avionics, no
digital or woodland camouflage, no NATO or United States markings, no invented
squadron patches, no modern eyewear, no modern haircuts.

ABSOLUTELY NO TEXT of any kind anywhere: no name tapes, no rank lettering, no
labels, no cell numbers, no captions under the faces, no watermark, no signature.
If you feel the urge to label anything, leave it blank.
```

**Cortar con:** `norma_sorpresa norma_duda norma_cansado norma_picaro norma_culpa norma_hablando`

---
