# PROMPTS VN — PRÓLOGO (P.1 → P.4)

> **Qué es esto.** La lista de producción, escena por escena, en el formato que se va a usar
> de acá en adelante: **ESCENA + PROMPT DE PLACA**, y debajo **PERSONAJE : EMOCIÓN + PROMPT
> DE RETRATO**. Es la bajada operativa del sistema definido en
> [RETRATOS.md](RETRATOS.md) y de las fichas de [STORYBOARD_1.md](STORYBOARD_1.md) §0.
>
> **Empezamos por el prólogo y nada más.** El resto de la campaña sale en tandas.

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

```
Naive pixel art sketch drawn entirely in blue ballpoint-pen tones on a lined
notebook-paper background, Metal Slug-inspired sprite proportions but drawn like
an 18-year-old soldier's heartfelt doodle, single-color blue palette with
dithered shading, cream paper texture with faint ruled lines, ink smudges and
damp stains rendered as pixels, crisp clean pixels, no anti-aliasing, hand-made
naive feel, no photorealism, no 3D render.
```

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
- Páginas `[TIERRA]` (hoja de cuaderno): **3:4 vertical**
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
   repite la luz de su placa palabra por palabra** (`warm late-morning light from a small
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

# P.1 — EL ARROYO *(años antes · registro TIERRA · 3:4 vertical)*

**Decisión:** P.1 **no lleva retratos.** Es un recuerdo dibujado por Mateo, y el diálogo
flota sobre el dibujo. Meter bustos acá rompería el registro del cuaderno — que es el
dispositivo que sostiene todo el juego. Es cuadro sagrado (RETRATOS.md §2).

### PLACA P.1.a — el arroyo y el Rastrojero

```
[TIERRA] Wide shot of a flat Argentine countryside creek on a summer afternoon, low
grassy bank, still shallow water, a rusty 1960s Argentine Rastrojero pickup truck
parked on the grass in the middle distance, a huge empty pale sky, one small distant
jet trail crossing it. NOBODY IN THE FRAME. Empty, waiting, quiet. Drawn entirely in
blue ballpoint pen on lined notebook paper, cream paper texture with faint ruled
lines, ink smudges as pixels. 3:4 vertical. No text, no watermark, no signature.
```

### PLACA P.1.b — el sapito *(el plano que da nombre al juego)*

```
[TIERRA] Extreme close-up, low angle almost at water level: a flat stone skipping
across the surface of a creek, caught mid-bounce, three small rings of ripples
trailing behind it marking the three previous bounces, a thin spray of droplets, the
far bank blurred and low. NOBODY IN THE FRAME. Drawn entirely in blue ballpoint pen
on lined notebook paper, cream paper texture with faint ruled lines. 3:4 vertical.
No text, no watermark, no signature.
```

> **Nota:** este cuadro ya tiene además una versión en video (plano 1 del teaser, `TEASER.md`).
> La placa fija es la que va adentro del juego; el clip es para el teaser.

### PLACA P.1.c — el cuaderno en las rodillas

```
[TIERRA] Close-up from over a child's shoulder: an open school notebook resting on
two small knees, a blue ballpoint pen held in a child's hand, and on the open page a
naive child's drawing of the same creek, the same rusty pickup truck and a little
airplane crossing the sky. Only the hands and knees visible, no face. Drawn entirely
in blue ballpoint pen on lined notebook paper, cream paper texture with faint ruled
lines. 3:4 vertical. No text, no watermark, no signature.
```

---

# P.2 — LA COCINA *(2 de abril de 1982 · registro AIRE · 16:9)*

**La escena bisagra del prólogo.** Placa única, cuatro estados de luz/sonido, y todo el
trabajo lo hacen los retratos. Es la primera vez que el jugador ve a Norma **y se le ve la
cara** (canon 3.4).

### PLACA P.2 — la cocina de Norma, 1982, cálida

```
[AIRE] Interior of a modest Argentine home kitchen in 1982, warm late-morning light
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
[AIRE] Interior of a modest Argentine home kitchen in 1982, warm late-morning light
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

> **Variante P.2-b (obligatoria, misma placa):** repetir el prompt cambiando la luz a
> `the warm light drained to a flat grey, the kettle still whistling on the lit stove,
> the radio now switched on` — es la placa que entra cuando arranca el parte de radio y
> **no la saca nadie del fuego**. Un solo cambio de placa hace todo el corte de tono.

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
and NOT legible. STATIC held pose, no motion blur, no action. Warm late-morning light
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
late-morning light from a small window on the left. Flat solid magenta background for
clean cutout. Argentina 1982, argentine latin-american person, no modern equipment, no
NATO or US insignia, no national flag on clothing. No text, no watermark.
```

**`fig_tero_p2_radio`** — de pie en la repisa, la mano en la radio

```
[AIRE] Full body of an argentine man, 41 years old, very tall and very thin, gaunt and
narrow, black hair greying at the temples, plain buttoned civilian shirt with sleeves
rolled up, standing with his BACK to the viewer at a shelf, one hand on the knob of a
small valve radio, head slightly lowered, completely still, face NOT visible. STATIC
held pose, no motion blur, no action. Warm late-morning light from a small window on
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
STATIC held pose, no motion blur, no action. Warm late-morning light from a small
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
blur, no action. Warm late-morning light from a small window on the left. Flat solid
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
no action. Warm late-morning light from a small window on the left. Flat solid magenta
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
amused closed-mouth smile, eyes crinkled, relaxed at his own kitchen table, neutral
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

# P.4 — LA PRIMERA PÁGINA DEL CUADERNO *(registro TIERRA · 3:4 vertical)*

**Decisión:** sin retratos, y **sin texto en la imagen.** La carta la tipografía el motor
encima con la fuente manuscrita, para que quede editable y traducible (STORYBOARD_1 §0,
regla de texto, camino 2).

### PLACA P.4 — la hoja

```
[TIERRA] A single open notebook page seen straight on, filling the frame, the paper
damp-wrinkled at one corner with a faint water stain, a blue ballpoint pen lying
diagonally across the lower third, the ruled lines running edge to edge, one small
naive drawing in the bottom margin of a tiny airplane flying very low over water with
three little ripple rings under it. The page otherwise BLANK — no writing, no letters,
no words anywhere. Cream paper texture, ink smudges rendered as pixels. 3:4 vertical.
No text, no watermark, no signature.
```

> **La regla `no text` en esta placa no es negociable** — el cuerpo de la carta lo pone el
> motor. Si el generador escribe algo igual, regenerá: "birome no perdona".

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
| 9 | P.4 la hoja en blanco | placa TIERRA | **patrón de TODAS las páginas del cuaderno** |
| 10 | `mateo_casa_sonrisa` | retrato | — |
| 11 | `mateo_casa_serio` | retrato | — |
| 12 | `tero_civil_sonrisa` | retrato | — |
| 13 | `tero_civil_blanco` | retrato | — |
| 14 | `norma_calida` | retrato | + epílogos |
| 15 | `norma_seria` | retrato | + epílogos |
| 16 | `condor_parlante` | retrato | **las 14 misiones** |
| 17 | `fig_tero_p2_sentado` | figura | — |
| 18 | `fig_tero_p2_telefono` | figura | — |
| 19 | `fig_tero_p2_radio` | figura | — |
| 20 | `fig_mateo_p2_sentado` | figura | — |
| 21 | `fig_norma_p2_sirviendo` | figura | + Final B |
| 22 | `fig_norma_p2_telefono` | figura | — |

**Nueve placas, siete retratos y seis figuras, y el prólogo está entero.** Cuatro de esos dieciséis se
reusan en el final del juego, así que el prólogo paga parte de su propio costo.

**Orden sugerido:** primero la placa 4 (la cocina) — es la que valida el estilo `[AIRE]` y
la que más se reusa. Si esa sale bien, el resto sale. Después la 9 (la hoja), que valida
`[TIERRA]` y es el patrón de todas las páginas del cuaderno. Recién ahí los retratos.
