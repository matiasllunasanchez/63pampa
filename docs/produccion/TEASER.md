# RASANTE — Teaser · Plan de rodaje FINAL para Kling

> **Hay un segundo teaser, distinto y complementario:** `TEASER_2_LA_ESCUCHA.md` — el
> ataque contado por un marinero británico. Éste es el corazón; aquél es la amenaza. Si
> salen los dos, se publica primero el otro.

> **Presupuesto real: 620 créditos · 60 por generación → 10 generaciones. Punto.**
> Este documento es autocontenido: todos los prompts van completos, sin tokens, listos para
> pegar. No hace falta abrir ningún otro archivo para rodar el teaser.
>
> **Novedad verificada en la cuenta:** 3.0 Turbo ahora SÍ acepta frame A + frame B + prompt.
> Eso cambia la estrategia: **se rueda todo en Turbo**, y 3.0 completo queda como rescate
> solo si Turbo licúa el estilo o rompe un movimiento.

---

## Multi-Shot: NO. Apagado. Para todo el teaser.

La pestaña Multi-Shot genera varios planos en una sola generación. Para este teaser es
**la herramienta equivocada**, por tres razones:

1. **El teaser se monta en editor, no en Kling.** Cada plano es un clip independiente que
   después cortás con el sonido adelantado un frame. Multi-shot te entrega los cortes ya
   decididos por el modelo, y perdés el montaje — que es donde este teaser se juega la vida.
2. **Cada plano nuestro tiene su par frame A → frame B.** Multi-shot no acepta un par de
   keyframes por cada shot interno: perdés el control exacto de inicio y fin, que es lo que
   hace que los clips salgan bien al primer o segundo intento.
3. **Los 5 segundos se reparten.** Tres shots en una generación = menos de 2 segundos por
   plano. Nuestros planos necesitan los 5 segundos enteros cada uno.

**Configuración fija para las 10 generaciones:** Multi-Shot OFF · 5 s · 16:9 ·
Creativity/CFG **0.3–0.4** · frame A + frame B cargados · prompt de movimiento pegado.

---

## Presupuesto — asignación de las 10 generaciones

| Plano | Contenido | Gens asignadas | Créditos |
|---|---|---|---|
| 2 | La transformación | **0 — ✅ ya hecho** | 0 |
| 5 | El campo vacío | 2 (1 toma + 1 retoma) | 120 |
| 1 | El sapito | 2 | 120 |
| 4 | El batir de alas | 2 | 120 |
| 3 | Mateo dibujando | 3 (el único con persona: más margen) | 180 |
| — | **Reserva de emergencia** | 1 | 60 |
| | **Total** | **10** | **600 / 620** |

**Reglas de gasto:**
- **Orden de rodaje: 5 → 1 → 4 → 3.** De menor a mayor riesgo. Si el plano 5 (casi quieto)
  falla, hay un problema de estilo y conviene saberlo habiendo gastado 60, no 400.
- Si un plano sale bien a la primera, su segunda gen **pasa a la reserva**, no se gasta "por
  las dudas".
- Si un plano quema sus gens y no sale, **se reemplaza por su versión fija con parallax en
  el motor** (gratis) y el teaser sigue. Ningún plano justifica robarle créditos a otro.
- Bordes blandos NO justifican regenerar: eso lo arregla `pixelrefine.py` en post
  (`--native`, paleta bloqueada). **Solo se regenera por movimiento roto o dibujo mal.**

**Los frames A y B se generan en la pestaña Image Generation** (o en tu generador habitual)
— no gastan créditos de video. Iterá ahí todo lo que haga falta: es donde va el tiempo.
Aprobá cada par ANTES de tocar Video Generation.

---

## Los dos bloques de estilo *(se pegan al inicio de cada prompt de imagen)*

**BLOQUE `[AIRE]`** — planos 3 y 4 (el mundo real, color pleno):

```
Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug (SNK Neo Geo
era), hand-drawn sprite look, chunky black pixel outlines, expressive exaggerated
character poses, rich dithered shading, saturated military palette of olive drab,
steel blue-grey, silver and warm sand, dramatic cinematic side-scroller
composition, crisp clean pixels, no anti-aliasing, no photorealism, no 3D render,
no smooth digital painting.
```

**BLOQUE `[TIERRA]`** — planos 1 y 5 (el cuaderno, birome azul):

```
Naive pixel art sketch drawn entirely in blue ballpoint-pen tones on lined
notebook paper, Metal Slug-inspired sprite proportions but drawn like a child's
heartfelt doodle, single-color blue palette with dithered shading, cream paper
texture with faint ruled lines, ink smudges rendered as pixels, crisp clean
pixels, no anti-aliasing, hand-made naive feel, no photorealism, no 3D render.
```

---

# PLANO 5 — El campo vacío *(rodar PRIMERO — el test de estilo barato)*

*Cierre del teaser. El mismo campo de la infancia, sin nadie. La estela del avión se
deshace en el papel. Es el cuadro P1.4 del storyboard, animado.*

### FRAME A — Image Generation

```
[pegar BLOQUE TIERRA]

A wide empty rural argentine pampa field. A rusty old 1960s Rastrojero pickup
truck parked alone by a dirt road at the left edge. A small stream crossing the
field. No people anywhere. Low horizon line in the bottom third. An enormous
empty sky filling the top two thirds, crossed diagonally by a single long jet
contrail, still sharp and unbroken. Melancholic stillness, sparse linework with a
lot of empty paper.

16:9 landscape. No text, no letters, no watermark, no signature.
```

### FRAME B — Image Generation

```
[pegar BLOQUE TIERRA]

The identical empty argentine field: same rusty pickup truck at the left, same
dirt road, same stream, same low horizon, nobody there. The jet contrail in the
sky has now almost completely DISSOLVED — only faint, broken wisps of pale blue
ink remain, scattered and fading into the bare cream paper. The sky is emptier
than before. Nothing else has changed.

16:9 landscape. No text, no letters, no watermark, no signature.
```

### PROMPT DE VIDEO — Turbo 3.0, frame A + frame B

```
Nothing moves in the field. The jet contrail very slowly spreads, breaks apart
and dissolves into the empty paper until almost nothing is left of it. Very slow,
very quiet. The camera holds completely still. Everything remains a flat blue
ballpoint drawing on notebook paper — hard pixel edges, no smoothing, no motion
blur, no added colour.

AUDIO: soft wind across an open field, very distant birds, nothing else. No
music. No voices.
```

**Checklist al ver el resultado:** ¿sigue pareciendo un dibujo en papel, o Kling le metió
volumen y luz "de cine"? ¿La estela se disolvió o se movió como humo real? (Debe deshacerse
como tinta, no flotar como nube.) ¿El papel quedó quieto?

---

# PLANO 1 — El sapito *(la tesis del juego en 5 segundos)*

*Apertura. La piedra pica tres veces sobre el arroyo: volar bajo, pegado al agua. Es el
cuadro P1.2 del storyboard, animado.*

### FRAME A — Image Generation

```
[pegar BLOQUE TIERRA]

Close-up of a man's hand at the left edge of the frame, just releasing a flat
skipping stone low over the surface of a small stream. The stone has just left
his fingers and is still close to the hand, a few centimetres above the water.
The water ahead of it is calm and unbroken. Reeds drawn at the edges. Big empty
paper above the water line.

16:9 landscape. No text, no letters, no watermark, no signature.
```

### FRAME B — Image Generation

```
[pegar BLOQUE TIERRA]

The same stream and the same composition. The man's hand at the left is now empty
and slightly lowered. The stone is far away at the RIGHT edge of the frame, still
low over the water, and behind it THREE small splash crowns in a receding line
mark where it bounced, naive motion lines drawn the way a kid draws speed.
Ripples spreading in blue dithered pixels.

16:9 landscape. No text, no letters, no watermark, no signature.
```

### PROMPT DE VIDEO — Turbo 3.0, frame A + frame B

```
The flat skipping stone travels low and fast from left to right just above the
water, touching the surface exactly three times and throwing up three small
splash crowns in sequence, ripples spreading behind each bounce. The hand stays
still after the release. The camera does not move. Everything remains a flat blue
ballpoint drawing on notebook paper — hard pixel edges, no smoothing, no motion
blur, no added colour, no realistic water.

AUDIO: a small stream flowing, three light stone skips on water, distant birds,
soft wind. No music. No voices.
```

**Checklist:** ¿picó TRES veces? (El número importa: es el gesto que Esteban le enseña a
Mateo.) ¿El agua siguió siendo birome o se volvió agua real? ¿La piedra fue rasante o hizo
una parábola alta? Rasante o nada.

---

# PLANO 4 — El batir de alas *(un clip, tres usos en el juego: M7 → M11 → M12)*

*El saludo. No existe en imagen fija. Se reusa dentro del juego cambiando el color del
cielo en post.*

### FRAME A — Image Generation

```
[pegar BLOQUE AIRE]

An A-4B Skyhawk attack jet, bare silver-grey metal, blue-white argentine roundel,
worn painted metal, single seat, a row of small plain white stars below the
cockpit, seen from BELOW and slightly behind, flying away from the camera over a
cold grey sea. Its wings are perfectly LEVEL. Heavy overcast sky, low light. The
aircraft is small and alone in a very large empty sky, high above the water. Cold
palette of steel blue-grey and silver.

PERIOD LOCK — 1982: no modern aircraft, no modern markings, no missiles of later
eras, no digital HUD.

16:9 landscape. No text, no letters, no watermark, no signature.
```

### FRAME B — Image Generation

```
[pegar BLOQUE AIRE]

The IDENTICAL aircraft in the identical position, distance and scale, same camera
angle from below and behind, same overcast sky and grey sea. The ONLY difference:
the aircraft is now BANKED in a wing waggle — one wing dipped low, the other
raised high, rolled hard to one side while still flying straight ahead. It has
not turned, not climbed, not moved closer or farther. Same light, same palette.

PERIOD LOCK — 1982: no modern aircraft, no modern markings, no digital HUD.

16:9 landscape. No text, no letters, no watermark, no signature.
```

### PROMPT DE VIDEO — Turbo 3.0, frame A + frame B

```
The aircraft flies steadily straight away from the camera and rocks its wings —
dips one wing low, levels, dips the other, levels again — a slow, deliberate wing
waggle salute. It does NOT turn, does NOT change heading, altitude, distance or
scale. The camera does not move. The sky and sea stay still. Keep the aircraft's
shape, markings and colours exactly consistent. Preserve hard pixel art edges, no
smoothing, no motion blur.

AUDIO: a single jet engine receding, high cold wind, empty sea far below. No
music. No voices.
```

**Checklist:** ¿se bamboleó o GIRÓ? Un viraje no es un saludo — si el avión cambió de rumbo
o se alejó en curva, la retoma insiste con `it does NOT turn, it only rocks its wings and
continues straight`. ¿El avión del final es el mismo del principio (marcas, forma, escala)?

---

# PLANO 3 — Mateo dibujando bajo la lluvia *(el más frágil — rodar ÚLTIMO, 3 gens)*

*El marco entero del juego: lo que sabemos de la isla es lo que un pibe alcanzó a dibujar.
Sobre el hombro, sin cara — sin riesgo de rostro roto.*

### FRAME A — Image Generation

```
[pegar BLOQUE AIRE]

Over-the-shoulder shot, from behind and slightly above, of an argentine army
conscript, 18 years old, skinny teenager, wearing a hip-length oversized olive
hooded parka and an unmarked steel helmet with a cloth cover, hunched down inside
a wet peat trench in the rain. His face is NOT visible. He holds an open school
notebook against his knee, shielding it with one hand, drawing with a blue
ballpoint pen. On the notebook page, HALF-FINISHED: a small naive child-style
drawing of a jet aircraft. Grey rain falling, dark peat trench walls, mud, cold
flat light.

Argentina 1982, no modern military equipment, no NATO or US insignia, no invented
unit patches, no national flag on clothing, argentine latin-american hands.

16:9 landscape. No text, no letters, no watermark, no signature.
```

### FRAME B — Image Generation

```
[pegar BLOQUE AIRE]

The identical over-the-shoulder shot, camera unchanged, same trench, same rain,
same light, same conscript in the same position. The naive drawing of the jet on
the notebook page is now FINISHED. Several dark round rain spots have landed on
the page and the blue ink is beginning to BLEED and run at the edges of the
drawing. His drawing hand is lifted slightly away from the page, pen still held,
as he looks at what he made.

Argentina 1982, no modern military equipment, no NATO or US insignia.

16:9 landscape. No text, no letters, no watermark, no signature.
```

### PROMPT DE VIDEO — Turbo 3.0, frame A + frame B

```
The young soldier finishes the small naive drawing of the jet with short quick
strokes of his blue pen, hunched over to shield the notebook from the rain. Rain
falls steadily throughout. A few drops land on the paper and the blue ink slowly
bleeds and runs at the edges of the drawing. He lifts his hand slightly away and
just looks at the page. The camera does not move at all. His face is never shown.
Preserve hard pixel art edges, no smoothing, no motion blur.

AUDIO: heavy rain on a steel helmet and on wet peat, gusting wind, the faint
scratch of a pen on paper, artillery very far away, almost imperceptible. No
music. No voices.
```

**Checklist:** ¿la mano dibuja o "flota"? ¿El dibujo del avioncito sigue siendo naif o
Kling lo volvió técnico? ¿La tinta sangró (correcto) o el papel se rompió/derritió
(regenerar)? ¿Se le vio la cara en algún frame? Si se vio, retoma: la cara de Mateo no se
muestra nunca en el teaser.

---

# PLANO 2 — La transformación ✅ *(ya está hecho — 0 créditos)*

El clip del Test 1. No se toca. Si al montarlo notás bordes blandos, va por
`pixelrefine.py`, no se regenera.

---

# PLANO 6 — Título *(en el motor / editor — 0 créditos)*

Negro 0.5 s → cartela **RASANTE** sola, sin subtítulo, sin fecha → un golpe de bombo →
negro. Tipografía del juego. Nada más.

---

## Montaje final — ~45 segundos

| t | Plano | Texto en pantalla (post, tipografía manuscrita) | Sonido |
|---|---|---|---|
| 0:00–0:04 | Negro | — | Arroyo, entra antes que la imagen |
| 0:04–0:09 | **1 · Sapito** | — | Tres picadas en el agua |
| 0:09–0:12 | Sigue el 1, congelado en su último frame | *"Los valientes vuelan abajo."* | Una guitarra sola |
| 0:12–0:18 | **2 · Transformación** ✅ | — | La guitarra corta seco → turbina |
| 0:18–0:24 | **3 · Mateo** | — | Lluvia; artillería lejísimos |
| 0:24–0:30 | **4 · Batir de alas** | — | Motor que se aleja |
| 0:30–0:38 | **5 · Campo vacío** | — | Viento; después, nada |
| 0:38–0:41 | Sigue el 5 | *"La tierra iba a ser lo único que le quedara."* | Silencio |
| 0:41–0:45 | **6 · RASANTE** | — | Un bombo. Negro. |

**Reglas de montaje:** el sonido cambia **un frame antes** que la imagen, en todos los
cortes. Los textos se tipografían en post (por eso todos los prompts dicen `no text`).
Sin música épica: una guitarra, un bombo, y silencio al final.

**Post-proceso de cada clip aprobado:** pasada por `pixelrefine.py --native <resolución>
--colors 48` para emparejar paleta y bordes entre los cinco clips — así los cuatro nuevos y
el viejo de la transformación quedan del mismo material.

---

## Resumen operativo — qué hacer, en orden

1. **Image Generation** (sin costo de video): generar y aprobar los 4 pares A/B. Iterar acá
   todo lo necesario.
2. **Video, plano 5** (60 cr). Evaluar con su checklist. Si falla el estilo → parar y
   revisar antes de seguir gastando.
3. **Video, plano 1** (60 cr). → checklist.
4. **Video, plano 4** (60 cr). → checklist (¿bamboleo o giro?).
5. **Video, plano 3** (60 cr, hasta 3 intentos). → checklist.
6. Retomas solo por movimiento roto o dibujo mal — nunca por bordes blandos.
7. `pixelrefine.py` sobre los 5 clips → montar → tipografiar los dos textos → bombo → negro.

**Presupuesto de salida: 600 de 620. Quedan 20 de colchón psicológico.**
