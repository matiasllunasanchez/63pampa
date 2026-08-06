# TEST 4B — Prompts listos para pegar *(sin tokens, nada que reemplazar)*

> **Qué son los tokens y por qué acá no hay.** En el storyboard, `{ESTEBAN}` y `{SKYHAWK}`
> son atajos: existen para no repetir treinta palabras en cada cuadro y para que el
> personaje sea idéntico en las 12 misiones. Pero el generador **no sabe qué significan** —
> antes de pegar hay que cambiarlos por su descripción completa. En este archivo ya está
> hecho. Copiás el bloque entero y va.

**Orden obligatorio: 1 → 2 → 3.** El paso 2 y el 3 necesitan que el paso 1 esté aprobado y
cargado como imagen de referencia. Si generás los tres sueltos, no van a compartir el fondo
y el clip se va a romper.

---

## PASO 1 — La placa de fondo *(generar primero, aprobar, guardar)*

Sin personas. Es el escenario que se va a repetir idéntico en los dos keyframes.

```
Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug (SNK Neo Geo
era), hand-drawn sprite look, chunky black pixel outlines, rich dithered shading,
saturated military palette of olive drab, steel blue-grey, silver and warm sand,
dramatic cinematic side-scroller composition, crisp clean pixels, no
anti-aliasing, no photorealism, no 3D render, no smooth digital painting.

A cold empty airbase flightline at dawn in Patagonia. One A-4B Skyhawk attack
jet, bare silver-grey metal, blue-white argentine roundel, worn painted metal,
single seat, a row of small plain white stars below the cockpit, parked in
three-quarter view facing left, canopy open, a metal boarding ladder hooked to
the cockpit sill, chocks under the wheels, a coiled fuel hose on the concrete.
Low grey morning light, long shadows across the apron, wind-bent grass at the
edge of the concrete, flat distant horizon. NOBODY IN THE FRAME. Empty, waiting,
quiet.

Argentina 1982, no modern military equipment, no NATO or US insignia, no invented
unit patches, no national flag on clothing.

16:9 landscape. No text, no letters, no numbers, no watermark, no signature.
```

---

## PASO 2 — FRAME A *(inicio: Tero caminando hacia el avión)*

**Cargá la placa del paso 1 como imagen de referencia** y pegá esto:

```
Keep this exact scene, camera angle, lighting, shadows and aircraft position
completely unchanged. Add one figure in the mid-ground, with his BACK TO THE
CAMERA, walking away from the viewer toward the parked jet:

An argentine air force pilot, 41 years old, very tall and very thin, gaunt and
narrow, narrow shoulders, neck carried forward, black hair greying at the
temples, wearing an olive flight suit and black leather flight boots, carrying a
white 1960s flight helmet with a hanging oxygen mask under one arm, mid-stride,
shoulders squared, head slightly lowered against the wind. His face is not
visible. He is SMALL in the frame — the aircraft dominates the composition. His
lower legs are partly lost in low ground haze.

Same 90s arcade pixel art style as the reference: hand-drawn sprite look, chunky
black pixel outlines, dithered shading, crisp aliased pixels, no anti-aliasing,
no photorealism, no 3D render.

Argentina 1982, no modern military equipment, no NATO or US insignia, no invented
unit patches, no national flag on clothing.

16:9 landscape. No text, no watermark, no signature.
```

---

## PASO 3 — FRAME B *(fin: arriba de la escalerilla)*

**Cargá otra vez la placa del paso 1** (no el frame A) y pegá esto:

```
Keep this exact scene, camera angle, lighting, shadows and aircraft position
completely unchanged. Nothing in the background has moved. Add one figure, seen
from BEHIND, now at the TOP of the boarding ladder:

An argentine air force pilot, 41 years old, very tall and very thin, gaunt and
narrow, narrow shoulders, wearing an olive flight suit and black leather flight
boots, now WEARING the white 1960s flight helmet on his head with the oxygen mask
hanging loose, one hand gripping the cockpit sill, one boot lifted over the edge
of the cockpit, mid-motion climbing in. His face is not visible.

Same 90s arcade pixel art style as the reference: hand-drawn sprite look, chunky
black pixel outlines, dithered shading, crisp aliased pixels, no anti-aliasing,
no photorealism, no 3D render.

Argentina 1982, no modern military equipment, no NATO or US insignia, no invented
unit patches, no national flag on clothing.

16:9 landscape. No text, no watermark, no signature.
```

---

## PASO 4 — El video en Kling

Frame A como **start frame**, frame B como **end frame**, y esto en el campo de movimiento:

```
The pilot walks away from camera toward the parked jet with a steady weighted
stride, reaches the ladder, and climbs it, ending with one boot over the cockpit
sill. Slow, heavy, unhurried. The camera does not move at all. The aircraft,
ladder, shadows and sky remain completely static throughout. Preserve hard pixel
art edges, no smoothing, no motion blur.

AUDIO: boots on cold concrete, wind across an open airfield, the metallic clank
of a boarding ladder, distant idling machinery. No music. No voices.
```

**Parámetros:** 5 s · *Professional / High Quality* · **Creativity (CFG) 0.3–0.4.**

---

## Si la caminata sale mal — la caída elegante

Caminar es lo que peor hace todo modelo de video: las piernas patinan, aparece un pie de
más, el paso se deforma. Si pasa, **quedate solo con la trepada**, que es un movimiento
mucho más restringido porque las manos y los pies tienen puntos de apoyo obligados.

Regenerá el **frame A** con esta variante (misma placa como referencia):

```
Keep this exact scene, camera angle, lighting, shadows and aircraft position
completely unchanged. Add one figure seen from BEHIND, standing at the FOOT of
the boarding ladder, one hand already gripping a rung at chest height, one boot
on the lowest rung, about to climb:

An argentine air force pilot, 41 years old, very tall and very thin, gaunt and
narrow, narrow shoulders, wearing an olive flight suit, black leather flight
boots and a white 1960s flight helmet on his head with the oxygen mask hanging
loose. His face is not visible.

Same 90s arcade pixel art style as the reference: hand-drawn sprite look, chunky
black pixel outlines, dithered shading, crisp aliased pixels, no anti-aliasing,
no photorealism, no 3D render.

Argentina 1982, no modern military equipment, no NATO or US insignia, no invented
unit patches, no national flag on clothing.

16:9 landscape. No text, no watermark, no signature.
```

El frame B es el mismo del paso 3, y el prompt de movimiento pasa a ser:

```
The pilot climbs the boarding ladder rung by rung, hands gripping, boots finding
each rung, ending with one boot over the cockpit sill. Slow and heavy. The camera
does not move. The aircraft, ladder, shadows and sky remain completely static.
Preserve hard pixel art edges, no smoothing, no motion blur.

AUDIO: boots on metal rungs, the clank of a boarding ladder, wind across an open
airfield. No music. No voices.
```

---

## TEST 4A — el otro, que no necesita generar nada

Exportá el **último frame** del clip del Test 1 (el que ya te salió bien) y usalo como
**start frame**, sin end frame:

```
The camera holds as the low-flying attack jet continues toward and past the
viewer, then banks hard to the right and climbs, wings tilting against the storm
sky, sea spray falling away beneath it. The horizon rolls with the bank. Keep the
aircraft's shape, markings and colours exactly consistent throughout. Preserve
hard pixel art edges, no smoothing, no motion blur.

AUDIO: a jet turbine passing and doppler-shifting, heavy wind, ocean below.
```

Esto prueba si dos clips **cortan juntos** — que es lo que hace falta para armar una
cinemática de verdad. Hacelo antes que el 4B: no cuesta preparación y contesta más.

---

## SONDA EN TURBO — antes de gastar en 3.0

**Turbo no permite end frame.** No importa: el end frame dirige el clip, pero no decide si
el movimiento se rompe. Si las piernas patinan, patinan igual en 3.0.

Cargá **solo el frame A** en 3.0 Turbo y pegá esto. El destino va descrito en el texto,
porque sin end frame el prompt carga todo el peso:

```
Locked-off camera, nothing in the background moves. The pilot walks away from
the camera toward the parked jet with a steady weighted stride, reaches the
boarding ladder and begins to climb it, ending with one boot lifted over the
cockpit sill. Slow, heavy, unhurried. The aircraft, ladder, shadows and sky
remain completely static throughout. Preserve hard pixel art edges, no smoothing,
no motion blur.

AUDIO: boots on cold concrete, wind across an open airfield, the metallic clank
of a boarding ladder. No music. No voices.
```

**Mirá una sola cosa: las piernas y los pies.** ¿Camina como una persona o patina? ¿Aparece
un pie de más? ¿El paso se deforma?

Ignorá todo lo demás — que el encuadre final no sea el que querías, que la luz se corra, que
termine en otro lado. Eso lo arregla el end frame cuando pases a **3.0 completo**, que sí lo
permite.

**Si patina, no insistas con la caminata:** pasá directo a la variante de la trepada de
arriba. Trepar tiene puntos de apoyo obligados para manos y pies, y sale bien mucho más
seguido que caminar.
