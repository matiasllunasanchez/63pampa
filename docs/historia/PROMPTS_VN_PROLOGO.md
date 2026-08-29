# PROMPTS VN — PRÓLOGO (P.1 → P.4)

> # ⛔ NO COPIES PROMPTS DE ESTE ARCHIVO
> Este documento es **de trabajo**: tiene tokens entre llaves (`{HOJA}`, `{MANO_DE_MATEO}`,
> `{TERITO}`, `{BIROME}`…) que **no se pegan tal cual** en el generador de imágenes.
> Sirve para discutir y corregir el criterio, no para producir.
>
> **Los prompts listos para copiar y pegar están en:**
> - `historia/PROMPTS_AIRE_LISTOS.md` — todo lo que es pixel art a color (placas y retratos)
> - `historia/PROMPTS_TIERRA_LISTOS.md` — todo lo que es cuaderno / birome (P.1 y las cartas)


> **Qué es esto.** La lista de producción, escena por escena, en el formato que se va a usar
> de acá en adelante: **ESCENA + PROMPT DE PLACA**, y debajo **PERSONAJE : EMOCIÓN + PROMPT
> DE RETRATO**. Es la bajada operativa del sistema definido en
> [RETRATOS.md](RETRATOS.md) y de las fichas de [STORYBOARD_1.md](STORYBOARD_1.md) §0.
>
> **Empezamos por el prólogo y nada más.** El resto de la campaña sale en tandas.
>
> ### ⭐ ¿Solo querés generar? Usá [PROMPTS_VN_PROLOGO_LISTOS.md](PROMPTS_VN_PROLOGO_LISTOS.md)
>
> Este documento es la **referencia**: explica el sistema y deja los prompts con el marcador
> `[AIRE]`/`[TIERRA]` sin resolver, para poder leerlos y editarlos. El otro archivo tiene **los
> mismos 22 prompts ya ensamblados**, con el bloque de estilo adentro y el nombre de archivo de
> cada asset: se copia y se pega, sin armar nada.
>
> Se regenera con `python3 tools/hacer_prompts_prologo.py`. **Los prompts se editan ACÁ**, nunca
> en el archivo generado.

---

## Cómo se usa

**Cada prompt arranca con su bloque de estilo.** En los prompts de abajo aparece como
`[AIRE]` o `[TIERRA]`: **reemplazalo por el bloque completo de acá abajo antes de generar.**
Son los mismos bloques de STORYBOARD_1.md §0 — están copiados acá para que este documento
sea autocontenido y no tengas que abrir otro archivo para producir.

### 🔵 Bloque `[AIRE]` — el mundo real 1982

*(base, cabina, combate, cocina, despacho — todo lo que no sea el cuaderno)*

```
Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug (SNK Neo Geo
era), hand-drawn sprite look, chunky black pixel outlines, expressive exaggerated
character poses and faces, rich dithered shading, saturated military palette of
olive drab, steel blue-grey, silver and warm sand with a single red accent when
noted, dramatic cinematic side-scroller composition, crisp clean pixels, no
anti-aliasing, no photorealism, no 3D render, no smooth digital painting.
```

### 🔷 Bloque `[TIERRA]` — las páginas del cuaderno de Mateo

*(P.1, P.4 y todas las páginas de diario de la campaña)*

> 🟩 **Corregido 22/8 — el bloque viejo hacía que TODO fuera un dibujo.** Decía *"drawn
> entirely in blue ballpoint-pen tones **on a lined notebook-paper background**"*, así que el
> generador dibujaba también el papel: los renglones salían trazados a mano en azul birome, las
> manchas parecían dibujadas, y una birome apoyada sobre la hoja salía como **el dibujo de una
> birome**. La hoja dejaba de leerse como una hoja.
>
> **El registro TIERRA tiene DOS capas y hay que nombrarlas por separado:**
>
> | Capa | Qué es | Cómo se ve |
> |---|---|---|
> | **El soporte** | la hoja, los renglones impresos, las manchas, y cualquier objeto real apoyado encima (la birome, la navaja, una foto) | objetos SÓLIDOS con volumen y sombra — pixel art, pero de cosas reales |
> | **La tinta** | solo lo que Mateo dibujó | trazo de birome azul, ingenuo, plano |
>
> El detalle que más arregla la lectura: **los renglones de un cuaderno están IMPRESOS**, son
> celeste pálido o gris, no azul birome. Y el Rivadavia del guion tiene además **margen rojo**.

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
```

### 🟩 Bloque `[TINTA]` — la tinta sola, para componer

*(los dibujos de Mateo recortados, que se pegan encima de la hoja)*

Desde que la hoja se genera **vacía** y reutilizable, los dibujos van aparte. Este bloque es el
`[TIERRA]` **sin el papel**: solo el trazo, sobre fondo plano para recortar.

```
Naive pixel art line drawing in dark blue ballpoint-pen strokes, Metal Slug-inspired
sprite proportions but drawn like an 18-year-old soldier's heartfelt doodle,
single-colour blue ink, slightly wobbly confident lines with visible pen-pressure
variation and small ink blots, crisp clean pixels, no anti-aliasing, hand-made naive
feel, no photorealism, no 3D render. Just the ink strokes on a plain flat white
background for clean cutout — NO paper texture, NO ruled lines, NO page, NO frame.
```

### 🟩 La birome es siempre la misma — `{BIROME}`

Cuando la birome aparece como **objeto real** —apoyada en una hoja, en un bolsillo, en una
mano— lleva siempre los mismos tres colores, que son canon:

| Parte | Color |
|---|---|
| **Tapa** | blanca |
| **Tubo** | azul |
| **Punta** *(el cono)* | marrón claro |

En inglés, para pegar: `a WHITE cap with a pocket clip, a BLUE opaque plastic barrel and a
LIGHT BROWN tapered tip cone`. La ficha completa del prop está en
[PROMPTS_HOJAS_PERSONAJE.md](PROMPTS_HOJAS_PERSONAJE.md) `{BIROME}`.

> **Excepción: cuando la birome está DIBUJADA**, como en P.1.c —donde toda la escena es un
> dibujo de Mateo— no lleva colores: es trazo de tinta azul como todo lo demás. Los tres
> colores valen solo para la capa física.

### ✂️ Corregir sin regenerar — TIERRA

Si una página ya salió buena salvo por un objeto que quedó dibujado, no hace falta rehacerla:

```
Keep this image exactly as it is - same page, same paper texture, same stains, same
ink drawing in the margin, same composition. Change only the [OBJETO]: it must be a
REAL PHYSICAL OBJECT resting on top of the paper, with a solid opaque body, volume,
a highlight along one edge and a soft contact shadow on the paper underneath it -
not an object drawn in ballpoint ink. Do not redraw anything else.
```

Y si lo que quedó dibujado es **la hoja misma**:

```
Keep this image exactly as it is. Change only the paper: the ruled lines must be
PRINTED pale grey-blue lines on real cream paper with visible fibre texture, and the
stains must be real damp stains in the paper - not lines and stains drawn in blue
ballpoint ink. The paper is a real sheet, photographed. Do not redraw anything else.
```

### 🔴 `{MANO_DE_MATEO_NENE}` — el prólogo lo dibuja un chico de OCHO *(29/8)*

**P.1 no la dibuja el mismo Mateo que las cartas.** El arroyo es un recuerdo de años antes:
**lo dibujó a los ocho**, y tiene que verse. La diferencia entre esos dibujos y los de las
cartas **es el paso del tiempo, y no la cuenta nadie.**

```
DRAWN BY MATEO AT EIGHT YEARS OLD. He is better than most kids his age and it
shows - but he is still eight, and it must read as a CHILD'S drawing at a glance: everything
sits on ONE single ground line ruled across the bottom, there is NO perspective and NO depth
at all, the sizes are wrong because he drew biggest whatever he cared about most, the pen
pressure is HEAVY and the lines are WOBBLY and gone over three or four times, and there is
NO hatching and NO shading anywhere - a child does not shade. People are big-headed
matchstick figures with round heads much too large for their bodies, stick arms and legs,
and a face of two dots and a curved line.
THE ONE EXCEPTION, and it matters: THE AIRPLANE IS THE BEST THING ON THE PAGE, drawn with
far more attention, detail and accuracy than anything else - wings, tail, a real shape -
because it is the thing he studies. Everything else is eight years old; the plane is not.
```

**Punto por punto contra la mano de los dieciocho:**

| | Mateo a los 8 *(P.1)* | Mateo a los 18 *(las cartas)* |
|---|---|---|
| Suelo | **una sola línea rayada abajo**, todo apoyado ahí | paisaje observado, sin línea de piso |
| Profundidad | **ninguna** | la hay, y funciona |
| Sombreado | **nada** — un nene no raya | rayado y sombra de verdad |
| Personas | **cabezas enormes**, palotes | tiesas y mal proporcionadas, pero de adulto |
| Trazo | **fuerte, tembloroso, repasado 3 o 4 veces** | firme, con arranques falsos |
| Tamaños | **mal a propósito** — lo más grande es lo que más le importa | correctos |
| **El avión** | **lo mejor de la página** | **lo mejor de la página** |

**El avión es el puente.** A los ocho ya le sale mejor que todo lo demás, y a los dieciocho
sigue siendo lo que mejor dibuja. *Canon: en P.1 el padre le dice **"salió mejor el avión que
yo, ¿eh?"**.* **Es lo único que no cambia entre las dos manos**, y por eso el jugador
reconoce que es la misma persona sin que nadie se lo diga.

### 🔒 Candado de época — va al final de TODO prompt con personas

*(en los prompts de abajo ya está escrito adentro de cada uno; esta es la versión suelta
por si armás uno nuevo)*

```
Argentina 1982, argentine latin-american faces, no modern military equipment, no
NATO or US insignia, no invented unit patches, no national flag on clothing.
```

> **Por qué importa tanto:** sin el candado, la primera versión de este reparto salió como
> un pelotón de soldados norteamericanos genéricos, con capotes de la Segunda Guerra y caras
> del norte de Europa. La auditoría completa está en
> [PROMPTS_HOJAS_PERSONAJE.md](PROMPTS_HOJAS_PERSONAJE.md).

### ✂️ Bloque de recorte — va en TODA figura del nivel 2

```
full body, STATIC held pose, no motion blur, no action, flat solid magenta
background for clean cutout.
```

### 🎨 Formatos y cierre

- Placas `[AIRE]` (pantalla completa): **16:9**
- 🔴 Páginas `[TIERRA]` (las cartas de Mateo): **el CUADERNO ABIERTO en 16:9** — carilla izquierda **en blanco** (la carta la tipografía el motor), carilla derecha **con los dibujos**. Y **todo lo que Mateo dice que dibujó tiene que estar, y grande**. *(Spec completa en PROMPTS_VN_M1_M3.md.)*
- Retratos y figuras: **fondo plano, recortable**
- Al final de todo prompt: `no watermark, no signature`
- **Marca registrada:** "Metal Slug" es de SNK. Como keyword de estilo funciona y el estilo
  en sí no es protegible, pero si tu generador la rechaza, **borrá "in the style of Metal
  Slug (SNK Neo Geo era)"** y el bloque rinde igual, porque describe el estilo por sus
  atributos. En el marketing de Steam nunca escribas "estilo Metal Slug": escribí "90s
  arcade pixel art".
- **Resolución:** generá grande y reducí a la resolución del juego con nearest-neighbor.
  Si sale "falso pixel art" borroso, agregá `pixel-perfect grid` al prompt.

## 🟥 Las placas y los personajes — TRES NIVELES

Los personajes **sí** pueden estar en la placa de pantalla completa, quietos. Lo que hay que
elegir es **cómo llegan ahí**, y hay tres formas con costos muy distintos:

| Nivel | Cómo | Cuándo | Riesgo |
|---|---|---|---|
| **1 · Placa vacía** | `NOBODY IN THE FRAME`. Solo el lugar. | Escenas de radio, montajes, transiciones, y todo lo que no necesite ver al grupo | ninguno |
| **2 · Placa vacía + sprites compuestos por el MOTOR** ⭐ | La placa se genera vacía y el motor dibuja encima los sprites de los personajes, en posiciones fijas | **EL DEFAULT para toda escena con gente** | ninguno |
| **3 · Placa con los personajes HORNEADOS en la imagen** | Los descriptores van adentro del prompt, posicionados | Solo los **cuadros sagrados**: donde la composición ES el contenido (el locker, el asado, Tandil, el final) | alto |

### Por qué el nivel 2 es el default

Es la misma pantalla que imaginás —el grupo quieto en el lugar, sin cinemática— pero:

- **Consistencia perfecta.** Es el mismo PNG del personaje siempre. La falla número uno de
  la generación por IA es que las caras cambian entre imágenes; componiendo, ese problema
  directamente no existe.
- **Un lugar, muchos repartos.** La misma cocina sirve con tres personas, con dos, o vacía.
  El mismo hangar sirve con la escuadrilla completa y, después de M7, **con uno menos** —
  y esa ausencia no cuesta una generación nueva: cuesta borrar una línea.
- **Los sprites ya los necesitás igual** para el gameplay y para las hojas modelo.
- **El estado de la escena es libre.** Alguien se sienta, alguien se va, alguien entra con
  una noticia. Con la placa horneada, cada uno de esos estados es una imagen nueva.

### Si igual querés hornear los personajes (nivel 3), dos reglas

1. **⚠ NEUTROS Y DE ESPALDAS O DE 3/4 DE ATRÁS, sin cara legible.** El retrato de abajo es
   el que actúa; si el personaje de la placa también hace un gesto fuerte, se pelean, y
   encima la placa queda pegada a un solo momento de la escena. **Si no se le lee la cara,
   no puede quedar inconsistente** — es el truco que resuelve el 90% del riesgo.
2. **Pose sostenida, sin movimiento.** `all figures STATIC, held still poses, no motion
   blur, no action` adentro del prompt. Estamos armando un cuadro, no un fotograma.

**Y el candado de época va sí o sí en toda placa con personas** — es donde el generador se
manda las macanas (soldados norteamericanos genéricos, insignias inventadas). Ver la
auditoría en [PROMPTS_HOJAS_PERSONAJE.md](PROMPTS_HOJAS_PERSONAJE.md).

---

**En este documento las placas están escritas en nivel 1 (vacías)**, porque así sirven para
los tres niveles: vacías se usan tal cual, y son la base sobre la que el motor compone. Las
que además tienen versión horneada la traen anotada abajo.

---

## 🟥 FIGURAS EN ESCENA — el tercer bloque de cada escena

El nivel 2 necesita **un prompt por personaje por escena**: el cuerpo entero, en la pose que
tiene en ese momento, recortable. Eso es distinto del retrato (que es solo el busto para el
cuadro de diálogo). Por eso cada escena con gente lleva **tres bloques**:

1. **PLACA** — el lugar, vacío.
2. **FIGURAS EN ESCENA** — un prompt por personaje presente, cuerpo entero, para componer.
3. **RETRATOS** — un prompt por emoción, busto, para el cuadro de diálogo.

### Las cuatro reglas de las figuras

1. **⚠ LA LUZ TIENE QUE COINCIDIR CON LA PLACA.** Es el único riesgo real de componer: si
   la figura viene iluminada de otro lado, se ve pegoteada. Por eso **cada prompt de figura
   repite la luz de su placa palabra por palabra** (`warm low late-afternoon light from a small
   window on the left`). No es redundancia: es lo que hace que funcione.
2. **Fondo plano para recortar** — `flat solid magenta background for clean cutout`. El
   magenta porque no existe en la paleta del juego y el recorte sale limpio.
3. **Cuerpo entero, quieto, sin cara legible.** `full body, STATIC held pose, no motion
   blur`. La cara la pone el retrato; si acá también actúa, se pelean. De espaldas o de 3/4
   de atrás siempre que se pueda.
4. **Nombre de archivo = personaje + escena + pose:** `fig_tero_p2_sentado.png`. Las que se
   repiten en varias escenas pierden el número de escena y pasan a la **biblioteca**:
   `fig_puma_linea_parado.png` sirve en todos los briefings de la campaña.

> **La biblioteca es donde está el ahorro.** Un piloto parado en la línea de vuelo, un
> mecánico agachado en el hangar, alguien sentado en un cajón: **eso se genera una vez y se
> usa catorce veces.** Las figuras propias de una escena, como Norma sirviendo, son la
> excepción, no la regla.



**Los retratos se generan UNA vez y se reusan para siempre.** El campo del motor es
`cara: 'tero_preocupado'`. Si el archivo no existe, el juego muestra solo el nombre y
funciona igual — se puede implementar el prólogo entero antes de tener un solo asset.

**⚠ HALLAZGO DEL PRÓLOGO — dos variantes que no estaban previstas.** En P.2 Esteban y Mateo
están **en su casa**, no en la guerra. Los tokens de STORYBOARD_1 los describen con
mameluco de vuelo y equipo de campaña: **acá NO va nada de eso.** La primera imagen que el
jugador tiene de Esteban tiene que ser **un padre, no un piloto** — el mameluco entra recién
en M1, y ese contraste es gratis y vale oro. Por eso el prólogo necesita dos retratos
propios: `tero_civil_*` y `mateo_casa_*`.

---

# P.1 — EL ARROYO *(años antes · registro TIERRA · 16:9 pantalla completa)*

**Decisión:** P.1 **no lleva retratos.** Es un recuerdo dibujado por Mateo, y el diálogo
flota sobre el dibujo. 🟩 **La excepción es P.1.c**, que muestra al chico dibujando y por lo
tanto no puede estar dibujada: va en `[AIRE]`, con la tinta solo adentro de la página. Meter bustos acá rompería el registro del cuaderno — que es el
dispositivo que sostiene todo el juego. Es cuadro sagrado (RETRATOS.md §2).

### PLACA P.1.a — el arroyo y el Rastrojero

```
[TIERRA] DRAWN BY MATEO AT EIGHT YEARS OLD. He is better than most kids his age and it
shows - but he is still eight, and it must read as a CHILD'S drawing at a glance: everything
sits on ONE single ground line ruled across the bottom, there is NO perspective and NO depth
at all, the sizes are wrong because he drew biggest whatever he cared about most, the pen
pressure is HEAVY and the lines are WOBBLY and gone over three or four times, and there is
NO hatching and NO shading anywhere - a child does not shade. People are big-headed
matchstick figures with round heads much too large for their bodies, stick arms and legs,
and a face of two dots and a curved line.
THE ONE EXCEPTION, and it matters: THE AIRPLANE IS THE BEST THING ON THE PAGE, drawn with
far more attention, detail and accuracy than anything else - wings, tail, a real shape -
because it is the thing he studies. Everything else is eight years old; the plane is not.
Wide shot of a flat Argentine countryside creek on a summer afternoon, low
grassy bank, still shallow water, a rusty 1960s Argentine Rastrojero pickup truck
parked on the grass in the middle distance, a huge empty pale sky, one small distant
jet trail crossing it. NOBODY IN THE FRAME. Empty, waiting, quiet. Drawn entirely in
blue ballpoint pen on lined notebook paper, cream paper texture with faint ruled
lines, ink smudges as pixels. 16:9 widescreen. No text, no watermark, no signature.
```

### PLACA P.1.b — el sapito *(el plano que da nombre al juego)*

```
[TIERRA] DRAWN BY MATEO AT EIGHT YEARS OLD. He is better than most kids his age and it
shows - but he is still eight, and it must read as a CHILD'S drawing at a glance: everything
sits on ONE single ground line ruled across the bottom, there is NO perspective and NO depth
at all, the sizes are wrong because he drew biggest whatever he cared about most, the pen
pressure is HEAVY and the lines are WOBBLY and gone over three or four times, and there is
NO hatching and NO shading anywhere - a child does not shade. People are big-headed
matchstick figures with round heads much too large for their bodies, stick arms and legs,
and a face of two dots and a curved line.
THE ONE EXCEPTION, and it matters: THE AIRPLANE IS THE BEST THING ON THE PAGE, drawn with
far more attention, detail and accuracy than anything else - wings, tail, a real shape -
because it is the thing he studies. Everything else is eight years old; the plane is not.
Extreme close-up, low angle almost at water level: a flat stone skipping
across the surface of a creek, caught mid-bounce, three small rings of ripples
trailing behind it marking the three previous bounces, a thin spray of droplets, the
far bank blurred and low. NOBODY IN THE FRAME. Drawn entirely in blue ballpoint pen
on lined notebook paper, cream paper texture with faint ruled lines running edge to edge.
16:9 widescreen.
No text, no watermark, no signature.
```

> **Nota:** este cuadro ya tiene además una versión en video (plano 1 del teaser, `TEASER.md`).
> La placa fija es la que va adentro del juego; el clip es para el teaser.

### PLACA P.1.c — el cuaderno en las rodillas *(🟩 la excepción: registro AIRE)*

🟩 **Corregido 22/8 — este cuadro NO es registro TIERRA, y pedirlo así lo rompía.**

P.1 entero es un recuerdo **dibujado por Mateo**… salvo éste, que muestra **a Mateo
dibujando**. Un dibujo de sí mismo dibujando es una recursión que no cierra, y el generador la
resolvía mal de la única forma que podía: aplastando todo contra la hoja. La hoja terminaba
ocupando el cuadro entero, las rodillas quedaban **encima** del papel en vez de debajo, y la
mano salía enorme.

**Es el único cuadro del juego donde los dos registros conviven** — y eso, bien hecho, es la
tesis del juego en una imagen: el mundo real en color, y adentro, en tinta, cómo lo ve el
chico. Va en `[AIRE]`, con la capa de tinta nombrada aparte.

```
[AIRE] Over-the-shoulder view from just behind and slightly above a seated
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
drawing: a child's ballpoint sketch of the creek, a rusty pickup truck and a little
aeroplane crossing the sky - EVERYTHING SITTING ON ONE SINGLE RULED GROUND LINE, no
perspective, no shading, heavy wobbly lines gone over several times, the sizes plainly
wrong. THE AEROPLANE IS THE BEST-DRAWN THING ON THE PAGE by a long way, with real wings
and a real shape: it is the only thing on that page that does not look eight years old.

Warm summer afternoon light from the side. 16:9 widescreen. No text, no letters, no
words on the page, no watermark, no signature.
```

> **Lo que hay que mirar al aprobarla:** que se vea el **borde de la hoja** y algo de pasto
> alrededor. Si la página llena el cuadro, volvió el error — la corrección es
> `zoom out so the notebook is a small object resting on the boy's knees with grass visible
> around it, and never fills the frame`.

---

# P.2 — LA COCINA *(2 de abril de 1982 · registro AIRE · 16:9)*

**La escena bisagra del prólogo.** Placa única, cuatro estados de luz/sonido, y todo el
trabajo lo hacen los retratos. Es la primera vez que el jugador ve a Norma **y se le ve la
cara** (canon 3.4).

### PLACA P.2 — la cocina de Norma, 1982, cálida

```
[AIRE] Interior of a modest Argentine home kitchen in 1982, a Friday afternoon, warm low late-afternoon light
through a small curtained window, formica table with a plastic tablecloth, four
mismatched wooden chairs, a kettle on the lit stove with a thin plume of steam, a
wall-mounted rotary telephone, a small valve radio on the shelf, a saint's picture
and a wall calendar, worn tiled floor. Lived-in, warm, ordinary. NOBODY IN THE
FRAME. Empty, waiting, quiet. 16:9. Argentina 1982, no modern appliances, no modern
military equipment, no NATO or US insignia, no national flag. No text, no watermark,
no signature.
```

### PERSONAJES EN LA PLACA P.2

**Nivel 2 — composición por motor (recomendado).** Sobre la placa vacía, tres sprites en
posición fija: **Esteban** sentado a la izquierda de la mesa, de 3/4 de espaldas; **Mateo**
sentado enfrente, de 3/4 de frente pero lejos, con la cara chica; **Norma** de pie junto a
la cocina, de espaldas, sirviendo. Los tres quietos. Cuando Norma atiende el teléfono, el
motor **cambia su sprite de posición**, no la placa. Cuando Esteban se levanta a prender la
radio, ídem. **Con una sola placa tenés la escena entera.**

**Nivel 3 — versión horneada,** por si querés probarla (la cocina es de las pocas del juego
donde la composición familiar dice algo por sí sola):

```
[AIRE] Interior of a modest Argentine home kitchen in 1982, a Friday afternoon, warm low late-afternoon light
through a small curtained window, formica table with a plastic tablecloth, a kettle on
the lit stove with a thin plume of steam, a wall-mounted rotary telephone, a small
valve radio on the shelf, worn tiled floor. Three figures, all STATIC, held still
poses, no motion blur, no action, none of their faces clearly legible:
LEFT, seated at the table seen from three-quarter BEHIND, an argentine man, 41 years
old, very tall and very thin, gaunt and narrow, black hair greying at the temples,
plain buttoned civilian shirt with sleeves rolled up, NO flight suit and NO military
equipment;
RIGHT, seated across from him at a distance, a skinny argentine teenager, 18 years
old, head freshly shaved to the scalp, plain civilian short-sleeved shirt, face small
in frame and turned down toward the table;
BACKGROUND, standing at the stove with her BACK to the room, an argentine woman, 47
years old, dark hair with grey at the temples in a low bun, faded blue dress with a
cream floral apron, serving.
Lived-in, warm, ordinary, quiet. 16:9. Argentina 1982, argentine latin-american
people, no modern appliances, no modern military equipment, no NATO or US insignia,
no invented unit patches, no national flag on clothing. No text, no watermark, no
signature.
```

> **Ojo con el nivel 3 acá:** esta placa queda casada con UN momento de la escena. Cuando
> Norma se levanta a atender el teléfono, o cuando Esteban se para a prender la radio, la
> imagen ya no corresponde. **O generás tres versiones, o componés por motor.** Por eso la
> recomendación es el nivel 2.

### PLACA P.2-b — la misma cocina, lavada *(obligatoria)*

Es la placa que entra cuando arranca el parte de radio y **no la saca nadie del fuego**. Un
solo cambio de placa hace todo el corte de tono. Mismo encuadre, mismos objetos: lo único que
cambia es la luz y que la radio ahora está prendida.

```
[AIRE] Interior of a modest Argentine home kitchen in 1982, a Friday afternoon, the exact same room and
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

> **Generala como segunda pasada de la 4, no de cero** — si la sacás en otra sesión, los
> objetos de la cocina van a cambiar de lugar y el corte de tono se rompe: el jugador tiene que
> ver **la misma cocina** apagándose, no otra cocina.

### FIGURAS EN ESCENA — P.2

*(Seis figuras cubren la escena entera. La luz de todas repite la de la placa: ventanita a
la izquierda, luz cálida de media mañana.)*

**`fig_tero_p2_sentado`** — sentado a la mesa, hablando con el hijo

```
[AIRE] Full body of an argentine man, 41 years old, very tall and very thin, gaunt and
narrow, neck carried forward, black hair greying at the temples, clean-shaven,
wearing a plain buttoned civilian shirt with the sleeves rolled up — NO flight suit,
NO military equipment of any kind —, seated on a wooden kitchen chair seen from
three-quarter BEHIND, one forearm resting on the table, relaxed, his face turned away
and NOT legible. STATIC held pose, no motion blur, no action. Warm low late-afternoon light
from a small window on the left. Flat solid magenta background for clean cutout.
Argentina 1982, argentine latin-american person, no modern equipment, no NATO or US
insignia, no national flag on clothing. No text, no watermark.
```

**`fig_tero_p2_telefono`** — de pie en el teléfono de pared, de espaldas

```
[AIRE] Full body of an argentine man, 41 years old, very tall and very thin, gaunt and
narrow, black hair greying at the temples, plain buttoned civilian shirt with sleeves
rolled up, standing with his BACK to the viewer at a wall-mounted rotary telephone,
the handset held to his ear, the free hand flat against the wall, shoulders very
still, face NOT visible. STATIC held pose, no motion blur, no action. Warm
low late-afternoon light from a small window on the left. Flat solid magenta background for
clean cutout. Argentina 1982, argentine latin-american person, no modern equipment, no
NATO or US insignia, no national flag on clothing. No text, no watermark.
```

**`fig_tero_p2_radio`** — de pie en la repisa, la mano en la radio

```
[AIRE] Full body of an argentine man, 41 years old, very tall and very thin, gaunt and
narrow, black hair greying at the temples, plain buttoned civilian shirt with sleeves
rolled up, standing with his BACK to the viewer at a shelf, one hand on the knob of a
small valve radio, head slightly lowered, completely still, face NOT visible. STATIC
held pose, no motion blur, no action. Warm low late-afternoon light from a small window on
the left. Flat solid magenta background for clean cutout. Argentina 1982, argentine
latin-american person, no modern equipment, no NATO or US insignia, no national flag
on clothing. No text, no watermark.
```

**`fig_mateo_p2_sentado`** — sentado enfrente, de 3/4 de frente pero lejos

```
[AIRE] Full body of a skinny argentine teenager, 18 years old and reads as 18, criollo
features, olive skin, head freshly shaved to the scalp for military service, patchy
teenage mustache, plain civilian short-sleeved shirt — NO uniform, NO helmet, NO field
gear —, seated on a wooden kitchen chair in three-quarter view, leaning back easy with
one arm hooked over the chair back, small in frame, face small and NOT detailed.
STATIC held pose, no motion blur, no action. Warm low late-afternoon light from a small
window on the left. Flat solid magenta background for clean cutout. Argentina 1982,
argentine latin-american person, no modern military equipment, no NATO or US insignia,
no national flag on clothing. No text, no watermark.
```

**`fig_norma_p2_sirviendo`** — de pie en la cocina, de espaldas

```
[AIRE] Full body of an argentine woman, 47 years old, middle-aged not elderly, criolla,
dark hair with grey at the temples pulled back in a low bun, faded blue dress with a
cream floral apron, standing with her BACK to the viewer at a stove, serving from a pot
with a wooden spoon, weight on one hip, face NOT visible. STATIC held pose, no motion
blur, no action. Warm low late-afternoon light from a small window on the left. Flat solid
magenta background for clean cutout. Argentina 1982, argentine latin-american person,
no military insignia of any kind, no national flag on clothing. No text, no watermark.
```

**`fig_norma_p2_telefono`** — se da vuelta con el tubo en la mano

```
[AIRE] Full body of an argentine woman, 47 years old, middle-aged not elderly, criolla,
dark hair with grey at the temples pulled back in a low bun, faded blue dress with a
cream floral apron, standing in three-quarter view half-turned toward the room, holding
out a telephone handset on its stretched coiled cord toward someone off-frame, the
other hand on her hip, face small and NOT detailed. STATIC held pose, no motion blur,
no action. Warm low late-afternoon light from a small window on the left. Flat solid magenta
background for clean cutout. Argentina 1982, argentine latin-american person, no
military insignia of any kind, no national flag on clothing. No text, no watermark.
```

**Cómo se arma la escena con estas seis:**

| Beat del guion | Figuras en pantalla |
|---|---|
| Mateo y Esteban charlando | `tero_sentado` + `mateo_sentado` + `norma_sirviendo` |
| Suena el teléfono, Norma atiende | `tero_sentado` + `mateo_sentado` + `norma_telefono` |
| Esteban atiende | `tero_telefono` + `mateo_sentado` + `norma_sirviendo` |
| Corta. Queda pálido. | `tero_telefono` + `mateo_sentado` + `norma_sirviendo` *(no cambia nada en la placa: **cambia el retrato**, y eso es todo)* |
| Prende la radio | `tero_radio` + `mateo_sentado` + `norma_sirviendo`, **placa P.2-b (gris)** |

> **Fijate el cuarto beat.** El momento más fuerte del prólogo no necesita **ninguna** imagen
> nueva: la escena se queda exactamente igual y lo único que cambia es la cara del cuadro de
> diálogo. Eso es el sistema funcionando — y es más parecido a lo que pasa de verdad en una
> cocina cuando alguien corta el teléfono y no dice nada.

### RETRATOS DE P.2

**MATEO : sonrisa colimba** *(su entrada; el chico que todavía cree que son tres meses)*

```
[AIRE] Portrait bust of an argentine teenager, 18 years old and reads as 18, skinny,
criollo features, olive skin, head freshly shaved to the scalp for military service,
patchy teenage mustache, wearing a plain civilian short-sleeved shirt at home — NO
uniform, NO helmet, NO field gear —, chest-up, three-quarter view facing slightly
left, a wide easy grin, eyebrows up, completely unworried, neutral dark background
for clean cutout, consistent framing and scale, pixel art character portrait for a
dialogue box. Argentina 1982, argentine latin-american face, no modern military
equipment, no NATO or US insignia, no invented unit patches, no national flag on
clothing. No text, no watermark.
```

**MATEO : serio** *("¿Qué pasa pá?" — la primera vez que el chico se asusta)*

```
[AIRE] Portrait bust of an argentine teenager, 18 years old and reads as 18, skinny,
criollo features, olive skin, head freshly shaved to the scalp for military service,
patchy teenage mustache, plain civilian short-sleeved shirt at home — NO uniform, NO
helmet, NO field gear —, chest-up, three-quarter view facing slightly left, the grin
completely gone, lips parted, brow drawn together, looking at someone off-frame and
not understanding, neutral dark background for clean cutout, consistent framing and
scale, pixel art character portrait for a dialogue box. Argentina 1982, argentine
latin-american face, no modern military equipment, no NATO or US insignia, no
national flag on clothing. No text, no watermark.
```

**ESTEBAN (TERO) : sonrisa chica — de civil** *(el padre, antes de que exista el piloto)*

```
[AIRE] Portrait bust of an argentine man, 41 years old, very tall and very thin,
gaunt and narrow, neck carried forward, criollo features, olive skin, black hair
greying at the temples, clean-shaven, tired warm eyes, wearing a plain buttoned
civilian shirt with the sleeves rolled up — NO flight suit, NO helmet, NO military
equipment of any kind —, chest-up, three-quarter view facing slightly left, a small
amused closed-mouth smile, eyes crinkled, relaxed at his own kitchen table on a Friday afternoon on a Friday afternoon, neutral
dark background for clean cutout, consistent framing and scale, pixel art character
portrait for a dialogue box. Argentina 1982, argentine latin-american face, no
modern equipment, no NATO or US insignia, no national flag on clothing. No text, no
watermark.
```

**ESTEBAN (TERO) : blanco — de civil** *(cuando corta el teléfono. **El retrato más
importante del prólogo.**)*

```
[AIRE] Portrait bust of an argentine man, 41 years old, very tall and very thin,
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

> **⚠ Este retrato es un agregado a la economía de RETRATOS.md** (Tero tenía cuatro: neutro
> · preocupado · sonrisa chica · roto). **Vale la pena y es el único que agrego**: es el
> gancho del prólogo entero y "preocupado" se queda corto. **La versión barata, si querés no
> generarlo:** usar `tero_preocupado` con un `hold` largo y la pava chiflando. Funciona —
> pero pierde.

**NORMA : cálida** *(sirviendo, cargándolo con lo del apodo)*

```
[AIRE] Portrait bust of an argentine mother, 47 years old, middle-aged not elderly,
criolla, dark hair with grey at the temples pulled back in a low bun, warm tired
face, wearing a faded blue dress with a cream floral apron, chest-up, three-quarter
view facing slightly left, a warm knowing half-smile aimed at her husband, eyebrows
raised in gentle teasing, completely at ease in her own kitchen, neutral dark
background for clean cutout, consistent framing and scale, pixel art character
portrait for a dialogue box. Argentina 1982, argentine latin-american face, no
military insignia of any kind, no national flag on clothing. No text, no watermark.
```

**NORMA : seria** *(cuando entra la radio — se queda quieta, con la fuente en la mano)*

```
[AIRE] Portrait bust of an argentine mother, 47 years old, middle-aged not elderly,
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

# P.3 — LO QUE UN PADRE PUEDE Y LO QUE NO *(montaje · AIRE · 16:9)*

**Decisión:** P.3 **no lleva retrato de Esteban.** Su línea va en **voz superpuesta** sobre
los objetos — que un padre humillado no tenga cara mientras lo dice es exactamente el punto.
El único "retrato" de la escena es el de Cóndor, que no es una cara.

### PLACA P.3.a — el teléfono de la base

```
[AIRE] Close-up of an olive-green military field telephone on a scratched metal desk
in a bare office, the handset off the hook and lying on its side on the desk, a coiled
cord, a stack of carbon-copy forms, a tin ashtray with three crushed cigarettes,
hard raking light from a high window. NOBODY IN THE FRAME. Empty, waiting, quiet.
16:9. Argentina 1982, no modern equipment, no NATO or US insignia, no national flag.
No text, no watermark, no signature.
```

### PLACA P.3.b — los papeles

```
[AIRE] Overhead close-up of a bare metal desk covered with typed carbon-copy military
forms and a rubber stamp lying on its side, one form pushed slightly away from the
others, a fountain pen uncapped, cold indifferent overhead light. NOBODY IN THE
FRAME. Empty, waiting, quiet. 16:9. Argentina 1982, no modern equipment, no NATO or
US insignia, no invented unit patches. No text, no watermark, no signature.
```

### PLACA P.3.c — la puerta que se cierra *(el remate: "No pude.")*

```
[AIRE] A plain closed office door at the end of an empty institutional corridor,
frosted glass panel dark from the inside, worn linoleum floor, a single bare bulb,
deep shadow, the corridor stretching away. NOBODY IN THE FRAME. Empty, waiting,
quiet. Cold, final. 16:9. Argentina 1982, no modern equipment, no national flag. No
text, no watermark, no signature.
```

### RETRATO DE P.3

**CÓNDOR : el parlante** *(único "retrato" — la máquina de la guerra no tiene cara)*

```
[AIRE] Portrait-format close-up of a scratched olive-green military radio loudspeaker
grille with a single amber indicator lamp lit beside it, worn painted metal, chipped
edges, a faint green audio waveform glowing across the grille, framed exactly like a
character portrait bust — chest-up scale, three-quarter view facing slightly left —
neutral dark background for clean cutout, consistent framing and scale with the
character portraits, pixel art portrait for a dialogue box. Argentina 1982, no modern
equipment, no NATO or US insignia. No text, no watermark.
```

> **Se genera una sola vez y se usa en las 14 misiones.** Es el retrato más rentable del
> juego. Debajo suena el sting 30 (SOUNDTRACK.md).

---

# P.4 — LA PRIMERA PÁGINA DEL CUADERNO *(registro TIERRA · 16:9 pantalla completa)*

**Decisión:** sin retratos, y **sin texto en la imagen.** La carta la tipografía el motor
encima con la fuente manuscrita, para que quede editable y traducible (STORYBOARD_1 §0,
regla de texto, camino 2).

### PLACA P.4 — CARTA 1: LA PRIMERA PÁGINA *(cuaderno abierto · 16:9)* 🔴 **v2 — 29/8**

*Cuenta: "Somos pibes de todo el país. Hay uno de Jujuy que nunca había visto el mar y no puede parar de mirarlo. Hay un porteño que extraña el colectivo, ¿podés creer? Extrañar el 60, pá… Me acuerdo lo que me enseñaste del sapito… A mamá le decimos que acá había guiso y pan."*

**El patrón de TODAS las cartas del juego.** Cuaderno abierto, carta a la izquierda (en
blanco, la tipografía el motor), **dibujos sueltos a la derecha**.

```
[TIERRA] AN OPEN NOTEBOOK SEEN FROM DIRECTLY ABOVE, filling the entire frame, its two
facing pages spanning the full width, with the central fold and the wire binding visible
down the middle. THE LEFT-HAND PAGE IS COMPLETELY BLANK: ruled lines only, no writing, no
words, no letters, no sentences anywhere on it - the game types the letter over it. THE
RIGHT-HAND PAGE carries ALL the drawings, in blue ballpoint pen.
Drawn by an untrained but genuinely gifted 18-year-old who has drawn since he
was a child, with a ballpoint pen, cold, in bad light. THE LANDSCAPE, THE OBJECTS AND THE
MACHINES are confident and well observed - he is good at those. THE PEOPLE ARE NOT: they
are little STICK-LIKE MATCHSTICK FIGURES, stiff and out of proportion, with mitten hands
and faces of two dots and a line. Some lines gone over twice, a few false starts left in,
nothing erased. NOTHING IS POLISHED. IT MUST LOOK LIKE A DRAWING, NOT AN ILLUSTRATION.
These are SEPARATE, UNRELATED DOODLES scattered around the page, NOT one
composed illustration. Each drawing sits on its own bare patch of paper, at its own size and
its own slight angle, with clear empty paper between them. There is NO shared ground line,
NO shared horizon, NO shared perspective and NO background connecting them.
EXACTLY ONE of each drawing, and NOTHING IS REPEATED anywhere on the spread. If
there is empty paper left over, LEAVE IT EMPTY - blank ruled paper is the correct result.
NEVER fill space by duplicating a drawing.
THE RIGHT-HAND PAGE CONTAINS EXACTLY FOUR SEPARATE DOODLES AND NOTHING ELSE, scattered
across the page with bare paper between them:
1. LARGEST, upper middle - THE SEA: long confident horizontal pen strokes for the water,
   a bare rocky shore, no trees. Standing on the shore with his back to us, ONE small
   stick figure just looking at it, and a small handwritten label with a short arrow
   pointing at him.
   AND RIGHT BESIDE HIM, a SECOND small stick figure in the act of throwing, side-on,
   arm swung low - and out over the water in front of him, ONE flat stone caught skipping
   with THREE small ripple rings behind it. A short handwritten arrow points at this second
   figure.
2. LOWER LEFT, small, drawn well and separately, floating on bare paper with no street and
   no ground under it - ONE city BUS seen from the side, boxy 1970s Argentine city bus,
   drawn in a few confident lines.
3. UPPER RIGHT, small and rough - a crude wobbly OUTLINE MAP OF ARGENTINA, and around it
   FOUR OR FIVE tiny stick figures at different points of the map with short lines linking
   them toward the bottom of the country, like a kid explaining where everyone came from.
4. LOWER RIGHT, small, drawn carefully and with obvious appetite - ONE deep plate of stew
   with a spoon in it and steam coming off, and beside it TWO thick slices of bread.
Cream paper texture, a few ink smudges and a damp wrinkle in one corner. 16:9 widescreen.
No watermark, no signature.
TEXT IN IMAGE (Argentine Spanish), handwritten in the same blue ballpoint, small and
slightly crooked, ONLY these two labels and nothing else:
  - next to the figure looking at the sea: "el jujeño"
  - next to the figure throwing the stone: "yo"
```

> **Las únicas palabras de la imagen son "el jujeño" y "yo".** El cuerpo de la carta lo
> tipografía el motor sobre la carilla izquierda.

> **El "yo" con la flecha es la página entera.** Mateo se dibuja a sí mismo **haciendo el
> sapito que le enseñó el padre**, al lado del pibe que nunca había visto el mar. La carta
> está dirigida al padre: **le está mostrando que se acuerda.** Y no lo dice con palabras,
> lo dice con una flecha.

> **Los cuatro dibujos NO comparten escena.** El colectivo flota sin calle ni piso, el mapa
> está en otro rincón, el plato en otro. **Es una hoja con garabatos sueltos, no una
> ilustración.**

---

## Resumen de la tanda — lo que hay que generar para tener el prólogo entero

| # | Asset | Tipo | Reuso |
|---|---|---|---|
| 1 | P.1.a el arroyo | placa TIERRA | también en el epílogo |
| 2 | P.1.b el sapito | placa TIERRA | + clip de teaser |
| 3 | P.1.c el cuaderno en las rodillas | placa TIERRA | — |
| 4 | P.2 la cocina cálida | placa AIRE | **se reusa en Final B** |
| 5 | P.2-b la cocina lavada | placa AIRE | **se reusa en P.0 y epílogos** |
| 6 | P.3.a el teléfono | placa AIRE | — |
| 7 | P.3.b los papeles | placa AIRE | — |
| 8 | P.3.c la puerta | placa AIRE | — |
| 9 | 🟩 P.4 la hoja **vacía** | placa TIERRA | **las 14 páginas del cuaderno** |
| 10 | 🟩 tinta P.4: el avioncito | recorte TINTA | — |
| 11 | 🟩 la birome | recorte prop | toda página que la quiera |
| 12 | `mateo_casa_sonrisa` | retrato | — |
| 13 | `mateo_casa_serio` | retrato | — |
| 14 | `tero_civil_sonrisa` | retrato | — |
| 15 | `tero_civil_blanco` | retrato | — |
| 16 | `norma_calida` | retrato | + epílogos |
| 17 | `norma_seria` | retrato | + epílogos |
| 18 | `condor_parlante` | retrato | **las 14 misiones** |
| 19 | `fig_tero_p2_sentado` | figura | — |
| 20 | `fig_tero_p2_telefono` | figura | — |
| 21 | `fig_tero_p2_radio` | figura | — |
| 22 | `fig_mateo_p2_sentado` | figura | — |
| 23 | `fig_norma_p2_sirviendo` | figura | + Final B |
| 24 | `fig_norma_p2_telefono` | figura | — |

**Nueve placas, siete retratos, seis figuras y dos recortes, y el prólogo está entero.** Cuatro de esos dieciséis se
reusan en el final del juego, así que el prólogo paga parte de su propio costo.

**Orden sugerido:** primero la placa 4 (la cocina) — es la que valida el estilo `[AIRE]` y
la que más se reusa. Si esa sale bien, el resto sale. Después la 9 (la hoja), que valida
`[TIERRA]` y es el patrón de todas las páginas del cuaderno. Recién ahí los retratos.
