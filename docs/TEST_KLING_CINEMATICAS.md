# RASANTE — Protocolo de prueba en Kling VIDEO 3.0

> **Objetivo real de esta tanda:** no es sacar un trailer lindo. Es contestar en una tarde
> **si Kling sirve para hacer las cinemáticas del juego**, y con qué límites. El trailer es
> la excusa; los datos son el entregable.
>
> Material de origen: STORYBOARD_1 (Prólogo, escena P.1 y P.2) y GUION_2 2.3.

---

## Lo que hay que contestar, en orden de importancia

| # | Pregunta | Si la respuesta es NO… |
|---|---|---|
| **1** | ¿**Sobrevive el pixel art**? ¿O el modelo lo licúa en 3D borroso? | Se cae todo. Kling no sirve para cinemáticas de este juego. **Probar esto primero y barato.** |
| **2** | ¿Aguanta la **transformación** birome → color sin cortar? | Perdemos el recurso maestro del juego en video. Se sigue usando para planos sueltos. |
| **3** | ¿El **multi-shot** mantiene al mismo personaje entre planos? | Cada plano se genera suelto y se monta a mano. Más caro pero viable. |
| **4** | ¿El **audio nativo** sirve para algo más que ambiente? | Se usa solo como foley de referencia y se dobla todo en post. |
| **5** | ¿Habla **castellano rioplatense** creíble? | Casi seguro que no. Voces en post con actores. **No es bloqueante.** |

---

## Qué modelo usar y cómo no quemar créditos *(verificado en la cuenta, 2026-08)*

| Modelo | Para qué | End frame |
|---|---|---|
| **3.0 Turbo** | Tantear: encuadre, ¿el prompt agarra?, ¿el movimiento se rompe? | ❌ **no lo permite** |
| **3.0 completo** | La toma final de todo lo que tenga personaje o tenga que encadenar | ✅ sí |
| **2.1 Master** | Un tiro, solo si 3.0 te suaviza el pixel art (alta adherencia literal al prompt) | — |
| 2.6, 1.6, 1.5 | Ignorar | — |

**Regla:** se itera en Turbo, se cierra en 3.0. Cuando un prompt da algo bueno en Turbo, se
repite tal cual en 3.0 y esa es la toma buena.

### La consecuencia de que Turbo no tenga end frame

Parece un problema y no lo es, porque **el end frame no decide si el plano funciona**. El
end frame *dirige*: le dice al modelo adónde llegar. Pero si las piernas de un personaje se
van a romper, se rompen igual con end frame o sin él.

Entonces Turbo sigue sirviendo, como **sonda de riesgo**: se carga solo el frame A, se deja
que el modelo invente el final, y se mira **una sola cosa** — si el movimiento se rompe. El
encuadre final y la luz no importan en la sonda: eso lo arregla el end frame después.

### Orden de gasto recomendado

1. **Test 0** en Turbo. Casi quieto, no necesita end frame. Es el filtro de todo.
2. **Test 4A** completo en Turbo. No usa end frame por diseño — es el test que Turbo puede
   hacer entero, y es el más informativo que queda (¿se pueden encadenar planos?).
3. **Las imágenes** (placa, frame A, frame B) se iteran en el generador de imágenes. No
   consumen créditos de Kling. Acá va el tiempo, no la plata.
4. **La sonda** del 4B en Turbo, con el frame A aprobado y el prompt de destino descrito en
   texto (está en PROMPTS_TEST4.md).
5. **Solo si la sonda pasa:** 3.0 completo con start + end.

---

# TEST 0 — ¿sobrevive el pixel art? *(Turbo · 5 s · lo primero)*

El riesgo número uno. Los modelos de video están entrenados con imagen fotográfica y
tienden a **interpolar el pixel art hasta volverlo puré**: bordes que se redondean, el
dithering que se convierte en gradiente, el sprite que empieza a parecer 3D. Un plano
quieto con poco movimiento es el test más limpio.

**Imagen de entrada:** el cuadro P2.1 (la cocina) o cualquier hoja de personaje ya aprobada.

**Prompt de movimiento:**
```
Almost still shot. Only the steam from the kettle drifts upward and the light
flickers very slightly. The characters barely breathe. Locked-off camera, no
push-in, no pan, no zoom. Preserve the hard chunky pixel art aesthetic exactly:
crisp aliased pixel edges, visible dither patterns, flat colour blocks, no
smoothing, no motion blur, no depth of field, no photorealistic rendering.
```

**Cómo se evalúa — pausá en el frame 1, el 40 y el último y compará:**

- ¿Los contornos negros siguen siendo duros o se pusieron grises y suaves?
- ¿El dithering sigue siendo puntitos o se volvió degradé?
- ¿Aparece motion blur? *(es el enemigo — el pixel art no tiene motion blur)*
- ¿La grilla de píxeles se mantiene estable o "hierve" entre frames?

> **Truco si falla:** generar a resolución alta, y en post **bajar a la resolución del juego
> con nearest-neighbor**. Eso mata gran parte del suavizado y vuelve a cuantizar los bordes.
> Si con ese pase queda crocante, Kling sirve igual aunque el crudo salga blando.

---

# TEST 1 — La transformación *(3.0 · start + end frame · 5 s)*

**El corazón del juego en cinco segundos:** el dibujo de un nene se convierte en la guerra.

El juego arranca dibujado en birome azul sobre hoja de cuaderno —la infancia, el recuerdo,
la mano del pibe— y **la guerra lo pasa a color pleno**. La infancia es del cuaderno; la
guerra es de la máquina. El avioncito que el padre señala en el campo es el mismo avión que
vuelve rasante sobre el Atlántico Sur, y ya no hay nadie mirándolo desde el pasto.

**Anclas de composición — esto es lo que hace que interpole en vez de cortar:**

| Ancla | Frame A | Frame B |
|---|---|---|
| Línea de horizonte | tercio inferior | **la misma altura** |
| Avión | puntito arriba a la derecha | **nace en ese punto** y crece |
| Dominante de color | azul birome sobre papel crema | azul-gris de mar y tormenta |
| Masa del cuadro | 70 % cielo vacío | 70 % cielo vacío |

**El azul de la birome se convierte en el azul del mar.** Esa es toda la idea.

### FRAME A — inicio · "Los valientes vuelan abajo"

```
Naive pixel art sketch drawn entirely in blue ballpoint-pen tones on lined
notebook paper, Metal Slug-inspired sprite proportions but drawn like a child's
heartfelt doodle. A young father in a simple aviator uniform crouches in a pampa
field beside his 8-year-old son, one arm around the boy, the other pointing up at
the sky. The boy looks up open-mouthed in wonder. Far above, tiny, a small jet
with a long contrail crossing the upper right of the frame. Low horizon line in
the bottom third, a rusty pickup truck small at the left edge, a stream. Enormous
empty sky filling the top two thirds. Single-color blue palette with dithered
shading, cream paper texture with faint ruled lines, ink smudges, crisp clean
pixels, no anti-aliasing, hand-made naive warmth.

16:9 landscape. No text, no letters, no watermark, no signature.
```

### FRAME B — fin · El rasante

```
Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug (SNK Neo Geo
era), hand-drawn sprite look, chunky black pixel outlines, rich dithered shading,
crisp clean pixels, no anti-aliasing. A single A-4 Skyhawk attack jet in
Argentine Air Force colours flying extremely low over the grey South Atlantic,
coming toward the camera slightly off-centre, so low its jetwash tears a white
scar of spray across the water beneath it. Heavy storm sky filling the top two
thirds, sea horizon line in the bottom third. Cold palette of steel blue-grey,
olive drab and white sea spray. No land, no people, nobody watching. Dramatic
cinematic composition, sense of enormous empty ocean and one small brave machine.

PERIOD LOCK — 1982: no modern aircraft, no modern markings, no missiles of later
eras, no digital HUD.

16:9 landscape. No text, no letters, no watermark, no signature.
```

### Prompt de movimiento

```
Slow cinematic push-in toward the sky. The blue ballpoint drawing on notebook
paper gradually dissolves into full colour as the paper texture fades away and
the drawn field becomes a real stormy ocean. The tiny sketched jet in the upper
right grows and turns into a real low-flying attack aircraft rushing toward the
camera at wave height, throwing spray. The two small drawn figures on the ground
slowly fade out and are gone. Ink lines melt into sea foam. One continuous
transformation, no cuts. Preserve hard pixel art edges throughout, no smoothing,
no motion blur.

AUDIO: soft pampa wind and a distant lone acoustic guitar note, which cuts
abruptly to silence, then the rising roar of a jet turbine and heavy ocean spray.
No music after the cut. No voices.
```

**Parámetros:** 5 s · *Professional / High Quality* · **Creativity (CFG) baja, 0.3–0.4.**
Cuanto más baja, más respeta los dos frames y menos inventa. Acá queremos transformación,
no imaginación.

> **Generar los frames sin texto.** La leyenda *"Los valientes vuelan abajo."* se tipografía
> encima en el editor, no en la imagen: así se controla la fuente manuscrita y puede
> aparecer *durante* el clip, que rinde mucho más.

---

# TEST 2 — Multi-shot con audio nativo *(3.0 · la prueba grande)*

Acá se prueba lo que 3.0 promete y lo que de verdad decide si sirve para cinemáticas:
**varios planos en una sola generación, con los mismos personajes y con sonido.**

Es la escena P.2 del prólogo — la cocina de 1982, la noche en que la radio dice que el
pibe se va. Tres planos, una sola idea: *un padre que vuela se entera de que a su hijo se
lo llevan por tierra.*

```
Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug (SNK Neo Geo
era), hand-drawn sprite look, chunky black pixel outlines, expressive faces, rich
dithered shading, crisp aliased pixels, no anti-aliasing, no photorealism, no 3D
render, no motion blur. Interior of a modest 1982 Argentine family kitchen at
night, floral oilcloth on the table, a kettle on the stove, a small transistor
radio on the counter, warm dim lamplight.

SHOT 1 — Medium wide. A gaunt tall 41-year-old air force pilot in civilian
clothes sits across the table from his skinny 18-year-old son, whose head has
just been shaved for conscription. The mother stands with her back turned at the
stove, not moving. Nobody speaks. The camera slowly pushes in.

SHOT 2 — Close-up on the small transistor radio on the counter, its dial glowing
faintly, the kettle beginning to whistle behind it, unattended. Steam rises.

SHOT 3 — Close-up on the father's face, lit from one side, listening. He does not
react. His jaw tightens once. His eyes stay on his son off-frame. Hold.

Keep the same characters, same kitchen, same lighting and the same pixel art
style across all three shots.

AUDIO: a kettle whistling and slowly rising in pitch, a muffled radio broadcast
in the background too distorted to understand, a chair creaking, dead domestic
silence underneath. No music. No dialogue.
```

**Qué mirar:**

- **Consistencia de elemento:** ¿el padre del plano 3 es el mismo señor del plano 1? ¿La
  cocina es la misma cocina? Esto es lo que 3.0 dice haber mejorado — verificalo.
- **Los cortes:** ¿corta limpio entre planos o hace un morph raro?
- **El audio:** ¿la pava suena a pava? ¿El sonido está *sincronizado* con la imagen o es una
  capa ambiental pegada encima?
- **El estilo entre planos:** el riesgo es que el plano 1 salga pixel art y el 3 salga
  ilustración suave. Si pasa eso, multi-shot no sirve y hay que generar plano por plano.

> **Por qué esta escena y no una de acción:** si Kling aguanta tres planos quietos de gente
> en una cocina sin romper la cara de nadie, aguanta cualquier cosa. El combate aéreo es más
> fácil de disimular — el humo tapa los errores. La cocina no perdona.

---

# TEST 3 — ¿Habla argentino? *(3.0 · 5 s · el test que probablemente falle)*

Corto y barato, pero hay que saberlo antes de planificar el audio del juego.

Un solo plano, la línea más característica del prólogo:

```
[mismo bloque de estilo pixel art]

Close-up of a young father in aviator uniform crouching beside his small son in
an Argentine field, pointing up at the sky, speaking gently to the boy. Warm
afternoon light. The boy looks up.

AUDIO: the father speaks one short line in Argentine Spanish with a Río de la
Plata accent, warm and low: "Los valientes vuelan abajo." Soft wind. No music.
```

**Cómo se evalúa:** ¿el acento es rioplatense o suena a español neutro de doblaje mexicano?
¿La boca acompaña? ¿La voz tiene edad de hombre de cuarenta?

> **Esto casi seguro sale mal, y no importa.** Sirve para cerrar la pregunta con un dato en
> vez de una intuición. **Las voces del juego van con actores argentinos, sí o sí** — el
> voseo y la cadencia son parte de la tesis del proyecto, no un detalle de producción. Lo
> que sí puede servir del audio nativo es el **foley y el ambiente**: turbinas, mar, pava,
> radio, viento de turba. Eso ya sería mucho.

---

# Montaje del pseudo-trailer con lo que salga

Si el Test 1 sale bien, con eso solo ya hay pieza:

| t | Qué pasa | Audio |
|---|---|---|
| 0.0 – 1.5 | Frame A quieto. Papel, birome, el nene mirando arriba. | Viento de campo. |
| 1.5 – 2.5 | Entra la leyenda manuscrita: **"Los valientes vuelan abajo."** | Una guitarra sola. |
| 2.5 – 6.0 | **El clip del Test 1.** El dibujo se convierte en el mar. | La guitarra corta seco. Turbina. |
| 6.0 – 7.5 | El Skyhawk pasa. Negro. | Turbina + mar. |
| 7.5 – 9.0 | Cartela: **RASANTE** | Un solo golpe de bombo. |

Si además sale el Test 2, se intercala la cocina entre 1.5 y 2.5 y la pieza se va a ~15 s,
que ya es un teaser de verdad.

---

# Rúbrica final — qué decidir con los resultados

| Resultado | Qué significa para el proyecto |
|---|---|
| **Test 0 falla** | Kling no sirve para cinemáticas. Se van a **cinemáticas de imágenes fijas con movimiento de cámara hecho en el motor** (Ken Burns, parallax por capas) — que además es más barato, más controlable y muy de la época. **No sería una mala noticia.** |
| **0 pasa, 1 falla** | Sirve para planos sueltos animados, no para transiciones conceptuales. La transformación birome → color se hace en post con máscaras. |
| **0 y 1 pasan, 2 falla** | Sirve, pero **plano por plano**. Cada cuadro del storyboard es una generación. Costoso pero totalmente viable — el storyboard ya está desglosado así. |
| **0, 1 y 2 pasan** | Podemos hacer las cinemáticas del juego en Kling. Se arma un pipeline: hoja de personaje → cuadro fijo aprobado → clip. **El storyboard ya está escrito en ese formato.** |
| **3 pasa** | Sorpresa. Igual las voces finales van con actores. |

> **Anotá los resultados acá abajo cuando corras las pruebas** — con esto decidimos el
> pipeline de las 12 misiones, así que conviene que quede escrito y no en la memoria.
>
> - Test 0 — estilo: …
> - Test 1 — transformación: …
> - Test 2 — multi-shot y audio: …
> - Test 3 — voz: …

---

## Anexo — alternativa para un teaser posterior: "La foto"

Mismo formato start/end, otro nervio. Prueba cuánto aguanta Kling un plano cerrado y
quieto, que es lo contrario del Test 1.

- **FRAME A:** primerísimo plano de la foto en blanco y negro de una mujer joven y hermosa,
  riéndose apoyada en una baranda, peinado y vestido de fines de los cincuenta, bordes
  gastados, sostenida por dos manos con grasa de motor. Luz cálida de lámpara.
- **FRAME B:** **el dorso de la misma foto.** Papel crema envejecido, la sombra de la imagen
  transparentándose, y escrito a mano con birome, letra dura de hombre que no escribe nunca:
  *"Rosa Elena Arrieta / 1926 – 1961 / Te amo, mamá. Perdoname."*
- **Movimiento:** `Two greasy hands slowly turn the small photograph over, a single tender
  continuous motion, lamplight raking across the paper, dust in the air, no cuts. AUDIO:
  distant wind, a hangar door, paper handled softly. No music.`

Es el mejor giro del guion en dos frames — **pero lo spoilea entero.** Guardarlo para un
teaser posterior al lanzamiento, nunca para promoción previa.

---

# TEST 4 — Encadenar planos *(nuevo, después de que el Test 1 salió bien)*

Dos pruebas distintas. **Hacer 4A primero**: no requiere generar nada nuevo y contesta la
pregunta más barata.

## 4A — Continuar el vuelo *(gratis de preparar)*

El frame final del Test 1 —el Skyhawk rasante sobre el Atlántico— **ya está aprobado**. Se
usa como **start frame** de un clip nuevo. Eso prueba lo que de verdad hace falta para armar
una cinemática: que dos clips **corten juntos** sin que el avión cambie de forma, de color o
de escala en el corte.

**Start frame:** el último frame del clip del Test 1 (exportarlo como PNG desde el editor).
**Sin end frame** — acá se prueba justamente si el modelo sostiene la continuidad solo.

```
The camera holds as the low-flying attack jet continues toward and past the
viewer, then banks hard to the right and climbs, its wings tilting against the
storm sky, sea spray falling away beneath it. The horizon rolls with the bank.
Keep the aircraft's shape, markings and colours exactly consistent. Preserve hard
pixel art edges, no smoothing, no motion blur.

AUDIO: jet turbine passing and doppler-shifting, heavy wind, ocean below.
```

**Qué mirar:** ¿el avión sigue siendo EL MISMO avión a los 3 segundos? ¿Le aparecen o
desaparecen marcas? ¿La paleta se corre hacia el azul o el gris? Si esto pasa, se pueden
encadenar clips y **la campaña entera es producible**.

> **Variante que vale la pena si 4A sale bien:** tomar el último frame de *este* clip y
> encadenar un tercero. Tres eslabones ya es una cinemática de verdad, y ahí se ve si la
> deriva de color se acumula. Si se acumula, `pixelrefine.py` con una paleta bloqueada
> tomada del **primer** clip lo corrige de una.

## 4B — Tero y el avión *(el de personaje — más caro y más frágil)*

### La pregunta primero: ¿se pueden animar dos hojas modelo juntas? **No.**

Las hojas de personaje **no son cuadros de escena**: son referencias, con pose neutra y
fondo plano. Kling necesita **una sola imagen compuesta** como frame de partida. La hoja del
personaje y la del avión se usan como *referencia de imagen* para componer ese cuadro, no
como entrada del video.

El instinto de "primero el avión estacionado y después el personaje" es **exactamente el
correcto**, y hay una razón técnica fuerte para hacerlo así:

> **LA PLACA DE FONDO ES LO QUE DECIDE LA CALIDAD.** Los dos keyframes tienen que compartir
> **el mismo fondo, píxel por píxel**: el mismo avión, la misma escalerilla, la misma luz,
> el mismo horizonte. Si generás A y B por separado, entre uno y otro se le mueve el avión,
> le cambia la sombra y le gira el cielo — y el modelo gasta toda su capacidad **transformando
> el decorado** en vez de mover al hombre. Con la placa fija, la única diferencia entre A y B
> es el personaje, y ahí el modelo hace una cosa sola y la hace bien.

### Paso 1 — La placa (generar una vez, aprobar, guardar)

```
Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug (SNK Neo Geo
era), hand-drawn sprite look, chunky black pixel outlines, rich dithered shading,
crisp aliased pixels, no anti-aliasing, no photorealism, no 3D render.

A cold empty airbase flightline at dawn in Patagonia. One {SKYHAWK} parked in
three-quarter view facing left, canopy open, a metal boarding ladder hooked to
the cockpit sill, chocks under the wheels, a fuel hose coiled on the concrete.
Low grey light, long shadows, wind-bent grass at the edge of the apron, distant
flat horizon. NOBODY IN THE FRAME. Empty, waiting, quiet.

Argentina 1982, no modern military equipment, no NATO or US insignia, no invented
unit patches, no national flag on clothing.

16:9 landscape. No text, no watermark, no signature.
```

### Paso 2 — FRAME A: Tero caminando *(la placa + el personaje)*

Componer **sobre la placa aprobada**, usando la hoja de `{ESTEBAN}` como referencia:

```
[la misma placa, idéntica] Add, in the mid-ground with his BACK TO THE CAMERA,
{ESTEBAN} walking away from the viewer toward the parked aircraft, mid-stride,
white flight helmet carried under one arm, shoulders squared, head slightly down
against the wind. He is small in the frame — the aircraft dominates. His lower
legs are partly lost in the low ground haze. Same lighting, same shadows, same
aircraft position as the plate.
```

### Paso 3 — FRAME B: arriba de la escalerilla

```
[la misma placa, idéntica] {ESTEBAN} now at the TOP of the boarding ladder, seen
from behind, one hand gripping the cockpit sill, one boot lifted over the edge,
helmet now ON his head. Same camera, same lighting, same aircraft position as the
plate. Nothing else in the scene has moved.
```

### Paso 4 — Movimiento

```
The pilot walks away from camera toward the parked jet with a steady weighted
stride, reaches the ladder, and climbs it, ending with one boot over the cockpit
sill. Slow, heavy, unhurried. The camera does not move. The aircraft, ladder,
shadows and sky remain completely static. Preserve hard pixel art edges, no
smoothing, no motion blur.

AUDIO: boots on cold concrete, wind across an open airfield, the metallic clank
of a boarding ladder, distant idling machinery. No music. No voices.
```

### Advertencia — dónde se rompe esto

**Caminar es lo que peor hace todo modelo de video.** Las piernas patinan, aparece un pie de
más, el paso se deforma. Por eso este cuadro está armado a propósito así:

- **De espaldas.** Sin cara que se rompa y sin sincronía labial. La marcha perdona mucho más
  desde atrás.
- **Chiquito en el cuadro.** El avión domina; el hombre ocupa poco. Menos píxeles, menos
  superficie donde fallar.
- **Pocos pasos.** No cruza el plano de lado a lado: camina unos metros y sube.
- **Piernas medio tapadas** por la bruma baja del suelo.
- **Cámara fija.** Si además movés la cámara, le pedís dos cosas difíciles a la vez.

> **Si igual sale mal**, la caída elegante es **quedarse solo con la trepada**: frame A con
> Tero ya al pie de la escalerilla, mano en el primer peldaño. Trepar es un movimiento mucho
> más restringido que caminar —las manos y los pies tienen puntos de apoyo obligados— y sale
> bien mucho más seguido. Se pierde la caminata y no se pierde la escena.
