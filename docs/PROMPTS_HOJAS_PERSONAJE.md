# PROMPTS COMPUESTOS — hojas modelo de personaje

Un prompt **cerrado y listo para pegar** por cada personaje y vehículo de
[STORYBOARD_1.md](STORYBOARD_1.md). Nada que completar: el bloque de estilo `[AIRE]` y el
**candado de época** ya están escritos adentro de cada uno.

Estas hojas son **la referencia maestra**: se generan una vez, se guardan, y después se usan como
*image reference* en cada cuadro de cinemática. Son lo que hace que el Gitano de la Misión 1 sea el
mismo Gitano de la Misión 9.

> **⚠ v2.3 — `{FOTO_VASCO}` se rehizo entera.** La mujer de la foto **no es una anciana: es
> joven y hermosa**, fotografiada a fines de los cincuenta. Es su madre, muerta en 1961, y es
> joven en la foto porque nunca llegó a ser vieja. De eso depende el mejor giro del guion —
> ver la ficha del prop y GUION_2 §8a antes de generar.

> **Versión 2 — revisión de época (auditoría sobre las hojas ya generadas).**
> Ver [«Qué salió mal en la tanda 1»](#qué-salió-mal-en-la-tanda-1) al final. Resumen: el generador
> vistió a todo el reparto de **soldado norteamericano genérico** —Mateo con capote largo de GI de la
> Segunda Guerra, los pilotos con parches y banderas inventadas, hasta Norma con una escarapela
> militar en la manga— y les puso a casi todos **cara del norte de Europa**. Esta versión mete tres
> cosas nuevas en cada prompt: un **candado de época y de origen**, el **equipo argentino real del
> 82**, y la **separación de siluetas** que estaba pendiente de decidir.

---

## Leer una sola vez antes de generar

**1. La regla que rompe todo si se ignora: lo que va en la hoja tiene que estar en el token.**
Si la hoja modelo tiene un detalle que el descriptor de `STORYBOARD_1.md` no menciona (una
cicatriz, un pañuelo, el color de los ojos), los cuadros de cinemática —que usan el token corto— no
lo van a tener, y personaje y hoja se separan. Por eso cada prompt de acá **agrega solo cosas que
también quedan anotadas** en la tabla de tokens ampliada del final de este documento. Si cambiás un
prompt, actualizá la tabla.

**2. Orden de generación.** Primero `{ESTEBAN}` y `{MATEO}` (son padre e hijo: conviene fijar el
parecido de familia y que las dos caras se decidan juntas). Después los Fieles del escuadrón, y al
final el Turco, el Colorado, Norma y los vehículos.

**3. Guardá el seed.** Si tu generador lo expone, anotá el seed de cada hoja aprobada al lado del
archivo. Regenerar una hoja perdida sin el seed es empezar el personaje de nuevo.

**4. Formato.** Las hojas van en **16:9 apaisado** — necesitan lugar para tres vistas más el
retrato. No es lo mismo que el formato de un cuadro: es una lámina de referencia.

**5. Sin texto, nunca.** Una hoja modelo con letras rotas es inservible como referencia y el
generador va a intentar escribir "front view", "3/4" y el nombre. Todos los prompts terminan con la
negativa correspondiente.

**6. Época y origen.** Todos llevan el `PERIOD LOCK` de abajo. Sin él los generadores visten a
cualquier soldado con equipo de 2010, le inventan parches de la OTAN y le ponen cara de Iowa.

---

## El candado de época — `PERIOD LOCK`

Va **dentro de cada prompt**, ya pegado. Se documenta acá suelto para que puedas modificarlo en un
solo lugar y volver a propagarlo.

```
PERIOD LOCK — Argentina 1982: no modern military equipment, no digital or
woodland camouflage pattern, no nylon or MOLLE webbing, no plate carrier or
tactical vest, no NATO or US insignia, no invented unit patches, no name
tapes, no large national flag printed across the back, no WWII American GI
look, no long WWII greatcoat, no modern sport eyewear, no modern wristwatch.
Plain olive-drab cloth, leather and painted steel only.
```

**Por qué cada negativa.** Cada una corresponde a un error real de la tanda 1: los parches
inventados en el pecho del Vasco y del Gitano, la bandera argentina gigante en la espalda del
Colorado y del Turco, el capote largo de Mateo, la escarapela en la manga de Norma.

### El candado de origen — `ARGENTINE FACES`

El generador, si no se le dice nada, devuelve caras del norte de Europa o de Estados Unidos. La
Argentina del 82 no era eso, y sobre todo **no lo era el ejército de Malvinas**: buena parte de los
conscriptos venía del Litoral y del Noroeste. Es una decisión de verdad histórica, no de estética.

Cada personaje lleva ahora una línea de origen explícita. **No es la misma para todos** —esa es la
gracia—:

| personaje | origen | cara |
|---|---|---|
| `{ESTEBAN}` / `{MATEO}` | criollo del interior | morocho, pelo negro, rasgos criollos |
| `{PUMA}` | criollo, militar de carrera | morocho curtido, canoso |
| `{GITANO}` | criollo del Litoral | el más morocho, pelo negro renegrido |
| `{VASCO}` | descendencia vasca | tez clara, rasgos duros del norte de España |
| `{PICHON}` | criollo del interior | morocho, muy joven |
| `{TURCO}` | **sirio-libanés** — de ahí el apodo | rasgos árabes, nariz fuerte, piel olivácea |
| `{COLORADO}` | descendencia gallega/irlandesa | pelirrojo, pecoso, tez muy clara |
| `{NORMA}` | criolla | morocha, como Mateo |

Que el Vasco y el Colorado sean claros **no es un descuido**: es exactamente por eso que los llaman
así. En un escuadrón de morochos, el que no lo es se gana el apodo. Si todos fueran claros, ningún
apodo significaría nada.

---

# LOS PILOTOS

> ### La separación de siluetas — AHORA APLICADA
>
> En la tanda 1 los cinco pilotos salieron **el mismo hombre con distinta cara**: mismo overol verde,
> misma altura, misma contextura. Tero salió macizo cuando el prompt pedía "el más alto y flaco".
> A escala de sprite eso es inservible.
>
> La propuesta que estaba pendiente al final del documento **ya está incorporada** a los cinco
> prompts. El escuadrón queda:
>
> | | silueta | marca que sobrevive a veinte píxeles y de espaldas |
> |---|---|---|
> | `{ESTEBAN}` / TERO | **el más alto y flaco** | angosto, cuello adelantado, traje abierto hasta el pecho, casco bajo el brazo |
> | `{PUMA}` | **el más ancho** | campera de cuero encima (otro valor de gris), pies plantados y separados |
> | `{GITANO}` | **el más abierto** | traje bajado a la cintura con las mangas atadas, camiseta, rulo alto y voluminoso |
> | `{VASCO}` | **el más cerrado** | vertical y angosto, hombros caídos, cierre hasta el cuello, manos a los costados |
> | `{PICHON}` | **el más chico** | el traje le sobra por todos lados, casco agarrado con las dos manos contra el pecho |
>
> Cinco siluetas que no se confunden ni en contraluz. **Ninguna depende de la cara** — eso es el
> punto.

## Equipo de vuelo — lo que va en los cinco

Los cinco comparten kit, así que conviene entenderlo una vez. Son pilotos de A-4B de la Fuerza
Aérea Argentina en 1982, volando aviones norteamericanos de los años 60 con equipo de esa misma
generación:

- **Traje de vuelo verde oliva** de una pieza, gastado, sin parches inventados. Lo único que puede
  llevar es la **escarapela argentina** chica en la manga y las **alas de piloto** bordadas en el
  pecho. Nada más.
- **Casco de vuelo blanco** de los 60 (tipo HGU-2), duro, con **visera corrediza** y **máscara de
  oxígeno verde colgando de un costado por el enganche**. La máscara colgando es el detalle que lo
  hace parecer real y que la tanda 1 no tenía: los cascos salieron lisos, como cascos de moto.
- **Arnés de torso** de cintas verdes sobre el traje (el A-4 engancha el paracaídas al asiento, no
  a la espalda del piloto) y **chaleco salvavidas** — el único punto de color fuerte del uniforme.
- **Botas negras de cuero, de caña alta.** En la tanda 1 salieron borceguíes marrones de trabajo y
  zapatillas grises. Van negras.
- **Guantes de cuero** metidos en el bolsillo de la pierna o en la mano.

> ⚠️ **Un punto histórico a verificar antes de dibujarlo, no después:** el traje de inmersión /
> anti-exposición para vuelo sobre agua fría. Es un detalle enorme para la tesis del guion —los de
> arriba mandaron a volar sobre el Atlántico Sur en pleno invierno— pero **no lo pude confirmar con
> fuente**, así que **no lo metí en ningún prompt**. Va a `PREGUNTAS_HISTORICAS.md`. Si se confirma,
> es material de guion antes que de dibujo.

---

## `{ESTEBAN}` — el padre. Protagonista del aire

Indicativo **TERO** (el pájaro que grita lejos del nido para alejar al depredador — es la clave de
su personaje y del final del guion). Es el que vuela; el jugador es él.

> **Construido como su indicativo: es el pájaro.** Alto, enjuto, alerta, el cuello adelantado, nunca
> del todo quieto. Es el **más flaco y más alto** del escuadrón y el **opuesto exacto de Puma**, que
> es la mole.
>
> *Cambios v2:* silueta reforzada con tres formulaciones distintas (el generador ignoró una sola),
> cara criolla para que cierre con Mateo, casco de época con máscara colgando, botas negras.
>
> **Background v2.2 (GUION_2 §2):** es el **primer piloto de la historia de su familia** — hijo y
> nieto de gente de campo, se hizo aviador contra todos los pronósticos. Moralmente, el policía
> bueno que tuerce la regla para hacer el bien: Capitán América criollo, sin suero, con
> supercorazón. *Traducción a la lámina:* **manos de alguien que arregló motores antes de
> volarlos** — nudillos anchos, uñas cortas, una cicatriz vieja en el dorso — y el uniforme
> impecable pero **usado**, no de desfile. No es un oficial de academia: es un tipo de campo que
> llegó. Agregar al prompt, en CHARACTER: `broad working-man hands with an old scar on the back
> of one hand, uniform immaculate but visibly worn, not parade-fresh`.

```
Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug (SNK Neo Geo
era), hand-drawn sprite look, chunky black pixel outlines, expressive exaggerated
character poses and faces, rich dithered shading, saturated military palette of
olive drab, steel blue-grey, silver and warm sand with a single red accent when
noted, dramatic cinematic side-scroller composition, crisp clean pixels, no
anti-aliasing, no photorealism, no 3D render, no smooth digital painting.

Character sprite model sheet of a single character repeated in several views,
neutral flat mid-grey background, consistent design across all views, arcade
sprite proportions, orthographic reference lámina layout.

CHARACTER: argentine air force fighter pilot, 41 years old. BUILD IS THE POINT:
he is VERY TALL AND VERY THIN, gaunt, narrow-shouldered, long-limbed, a head
taller than any other pilot and half their width, the silhouette of a wading
bird; long neck carried slightly forward as if always listening. Criollo
argentine features from the rural interior: olive-tan skin, black hair short and
greying only at the temples, dark eyes, strong jaw, clean-shaven, tired and
watchful. Olive-green one-piece flight suit worn UNZIPPED TO MID-CHEST with a
white undershirt showing, no jacket, small argentine sky-blue-and-white roundel
on the sleeve, embroidered pilot wings on the chest, green webbing torso harness
over the suit, black high leather flight boots, leather gloves stuffed in a thigh
pocket. White 1960s hard flight helmet with a sliding visor and a green oxygen
mask hanging loose from one side clip, always carried UNDER ONE ARM. Restless
posture, weight on one leg, never quite still.

SHEET CONTENTS, arranged left to right in one row: full-body front view standing
idle with weight on one leg, full-body three-quarter view, full-body side
profile emphasising the tall thin forward-leaning silhouette, full-body view from
behind; and along the bottom a strip of four head close-ups showing his range:
calm and steady, worried father, hard determined pre-flight stare, and grief held
in silence.

PERIOD LOCK — Argentina 1982: no modern military equipment, no digital or
woodland camouflage pattern, no nylon or MOLLE webbing, no plate carrier or
tactical vest, no NATO or US insignia, no invented unit patches, no name tapes,
no large national flag printed across the back, no WWII American GI look, no
modern sport eyewear, no modern wristwatch. Plain olive-drab cloth, leather and
painted steel only. Argentine latin-american face, not north-american, not
northern-european.

16:9 landscape. No text, no labels, no letters, no numbers, no watermark, no
signature.
```

---

## `{PUMA}` — el líder del escuadrón

La autoridad paternal del grupo. Es el que le enseña al jugador la regla del rasante y el que le
enseña el **tono** del juego ("Veinte marinos, Gitano").

> **Construido como su indicativo: es el animal pesado.** Ancho, macizo, plantado, se mueve poco y
> cuando se mueve pesa.
>
> *Cambios v2:* le sacamos los **parches inventados y la chapa de nombre roja** que el generador le
> puso en el pecho de la campera; el casco pasa de casco de moto con franjas a casco de época con
> máscara; se refuerza "bajo y ancho" (en la tanda 1 salió de contextura normal). El bigote **de
> cepillo** se mantiene, pero ahora el Turco tiene bigote **de morsa** para que no choquen.
>
> **Background v2.2 (GUION_2 §2):** **tercera generación de uniforme** — el abuelo, el padre, él.
> En su casa el reglamento era religión. Su arco es la lealtad mudándose de la institución a las
> personas, y culmina apagando la radio en M12 ("que me perdone el abuelo"). *Traducción a la
> lámina:* es el **único del escuadrón que anda siempre prolijo** — afeitado, cuello cerrado,
> todo en su lugar, incluso en el peor día. Esa prolijidad es el personaje: un hombre sostenido
> por un reglamento que se le está cayendo. Agregar al prompt: `always immaculately regulation —
> clean-shaven, collar correct, everything in its place, even when exhausted`. Y en la tira de
> expresiones, sumar una cabeza extra: **"la duda"** — la cara de un hombre a punto de desobedecer
> por primera vez en su vida.

```
Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug (SNK Neo Geo
era), hand-drawn sprite look, chunky black pixel outlines, expressive exaggerated
character poses and faces, rich dithered shading, saturated military palette of
olive drab, steel blue-grey, silver and warm sand with a single red accent when
noted, dramatic cinematic side-scroller composition, crisp clean pixels, no
anti-aliasing, no photorealism, no 3D render, no smooth digital painting.

Character sprite model sheet of a single character repeated in several views,
neutral flat mid-grey background, consistent design across all views, arcade
sprite proportions, orthographic reference lámina layout.

CHARACTER: argentine air force squadron leader, 44 years old. BUILD IS THE POINT:
SHORT AND VERY HEAVY, squat, the broadest and shortest man in the squadron,
thick bull neck, barrel chest, wide square shoulders, roughly half a head shorter
and twice as wide as the tall thin pilot. Criollo argentine features, weathered
sun-darkened skin, iron-grey hair cropped almost to the scalp at the sides, a
permanent sun squint, thick grey BRUSH mustache cut square. Worn brown leather
flight jacket over an olive flight suit, plain and unmarked except a small
argentine sky-blue-and-white roundel on one sleeve, green webbing torso harness,
black high leather flight boots. White 1960s hard flight helmet with a sliding
visor and a green oxygen mask hanging loose from one side clip, held LOW IN ONE
HAND, never tucked under the arm. Planted immovable stance, feet wide apart.

SHEET CONTENTS, arranged left to right in one row: full-body front view standing
planted with feet apart, full-body three-quarter view, full-body side profile
emphasising the wide heavy silhouette, full-body view from behind; and along the
bottom a strip of four head close-ups: calm frank authority looking straight at
the viewer, giving an order, quiet sorrow, and exhausted after a mission.

PERIOD LOCK — Argentina 1982: no modern military equipment, no digital or
woodland camouflage pattern, no nylon or MOLLE webbing, no plate carrier or
tactical vest, no NATO or US insignia, no invented unit patches, no name tapes,
no chest name plate, no large national flag printed across the back, no WWII
American GI look, no modern sport eyewear, no modern wristwatch. Plain
olive-drab cloth, leather and painted steel only. Argentine latin-american face,
not north-american, not northern-european.

16:9 landscape. No text, no labels, no letters, no numbers, no watermark, no
signature.
```

---

## `{GITANO}` — la alegría del escuadrón

El que ceba, el que se ríe, el que profetiza la gambeta. Su mate es un marcador de identidad: va en
la hoja.

> *Cambios v2:* ahora es **el más abierto** del escuadrón —traje bajado a la cintura con las mangas
> atadas— que es lo que lo separa de los otros cuatro sin depender de la cara. Se le sacan los dos
> parches inventados del pecho. El mate pasa de vasito blanco a **calabaza marrón con bombilla de
> alpaca**, que es lo que era. Y es el más morocho de los cinco.
>
> **Background v2.2 (GUION_2 §2):** se crió en una casa de golpes — padre violento, madre ausente,
> infancia rebotando por casas de tíos. **Su optimismo no es temperamento: es una decisión.**
> Decidió ser exactamente lo contrario de lo que le tocó. Lo cuenta una sola vez, en M9. *Traducción
> a la lámina:* la alegría es real pero **construida**, y eso se dibuja con dos cosas. Una: una
> **cicatriz vieja y fina en la ceja**, de las que no se explican. Dos —y es la clave— en la tira de
> expresiones va una cabeza que las otras hojas no tienen: **"la risa que se apaga"**, el medio
> segundo en que la sonrisa cae y aparece el pibe que fue. Agregar al prompt: `an old thin scar
> through one eyebrow`, y en la tira de cabezas: `and one head where the big grin is caught
> mid-collapse, the moment the joke ends and something older shows through`.

```
Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug (SNK Neo Geo
era), hand-drawn sprite look, chunky black pixel outlines, expressive exaggerated
character poses and faces, rich dithered shading, saturated military palette of
olive drab, steel blue-grey, silver and warm sand with a single red accent when
noted, dramatic cinematic side-scroller composition, crisp clean pixels, no
anti-aliasing, no photorealism, no 3D render, no smooth digital painting.

Character sprite model sheet of a single character repeated in several views,
neutral flat mid-grey background, consistent design across all views, arcade
sprite proportions, orthographic reference lámina layout.

CHARACTER: argentine air force pilot, 33 years old, medium height, loose and
athletic. SILHOUETTE IS THE POINT: he is the most OPEN and unbuttoned of the
squadron — the top half of his olive flight suit is PULLED DOWN TO HIS WAIST with
the empty sleeves KNOTTED IN FRONT, wearing only a white undershirt above the
waist, arms bare. Tall voluminous black curly hair, the darkest-skinned pilot of
the group, criollo argentine features from the Litoral, big warm open grin, always
mid-movement. Holds a traditional brown gourd mate with a metal bombilla straw in
one hand at all times. Black high leather flight boots.

SHEET CONTENTS, arranged left to right in one row: full-body front view standing
idle holding the mate gourd, full-body three-quarter view mid-laugh, full-body
side profile, full-body view from behind showing the knotted sleeves at the waist;
and along the bottom a strip of four head close-ups: big open laugh, teasing
sideways smirk, arms-raised triumph, and the smile falling off his face as bad
news lands.

PERIOD LOCK — Argentina 1982: no modern military equipment, no digital or
woodland camouflage pattern, no nylon or MOLLE webbing, no NATO or US insignia,
no invented unit patches, no chest patches, no name tapes, no large national
flag printed across the back, no WWII American GI look, no modern sport eyewear,
no modern wristwatch. Argentine latin-american face, not north-american, not
northern-european.

16:9 landscape. No text, no labels, no letters, no numbers, no watermark, no
signature.
```

---

## `{VASCO}` — el silencio y el rezo

Contrapeso del Gitano. Su crucifijo es el detalle que lo identifica de lejos, así que va grande y
visible en el retrato.

> *Cambios v2:* ahora es **el más cerrado** —alto y angosto, cierre hasta el mentón, hombros
> caídos, quieto—: el opuesto formal del Gitano, y la silueta cuenta su carácter sin una línea de
> diálogo. Se le saca la muñequera roja y los parches que el generador le inventó. El crucifijo va
> **más grande**: en la tanda 1 quedó tan chico que a escala de sprite desaparece. Su tez clara es
> deliberada — por eso lo llaman el Vasco.
>
> **Background v2.2 (GUION_2 §2) — el que más cambia la lámina.** El Vasco arrastra un pasado
> turbio que **el juego nunca confirma**: circulan tres versiones por la escuadrilla (un barrio
> bravo del puerto, un hermano preso, un papel movido para que lo admitieran) y todas se
> contradicen. Nadie sabe cuál es cierta — ni el jugador. Lo único verificable es lo que se ve.
> **Por eso la lámina tiene que mostrar evidencia física ambigua, no un origen.** Dos marcas:
> 1. **Nudillos arruinados** — cicatrices viejas, de algo que no fue esta guerra.
> 2. **Un tatuaje descolorido asomando apenas por el puño o el cuello** — hecho a mano, azul
>    desvaído, **deliberadamente ilegible**. Nunca se explica.
>
> Agregar al prompt, en CHARACTER: `badly scarred knuckles from an older life, and a faded
> hand-poked blue tattoo just barely showing at one cuff or at the collar line, deliberately
> illegible and unreadable, never explained`.
>
> **Ojo de arte — la regla que manda acá:** el tatuaje tiene que ser *casi invisible* a escala de
> sprite y **absolutamente ilegible aunque se agrande**. Si se llega a leer una palabra, un
> nombre o un símbolo reconocible, está mal: cualquier cosa legible cierra una pregunta que el
> guion deja abierta a propósito. El que lo busca encuentra una mancha azul con historia; el que
> no, no ve nada.

```
Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug (SNK Neo Geo
era), hand-drawn sprite look, chunky black pixel outlines, expressive exaggerated
character poses and faces, rich dithered shading, saturated military palette of
olive drab, steel blue-grey, silver and warm sand with a single red accent when
noted, dramatic cinematic side-scroller composition, crisp clean pixels, no
anti-aliasing, no photorealism, no 3D render, no smooth digital painting.

Character sprite model sheet of a single character repeated in several views,
neutral flat mid-grey background, consistent design across all views, arcade
sprite proportions, orthographic reference lámina layout.

CHARACTER: argentine air force pilot, 36 years old. SILHOUETTE IS THE POINT: he
is the most CLOSED and vertical of the squadron — tall, narrow, sloping tired
shoulders, arms hanging straight down at his sides, completely still, his olive
flight suit ZIPPED ALL THE WAY UP TO THE CHIN with the collar standing. Argentine
of Basque descent: pale skin, heavy dark brow, hard angular northern-spanish
features, solemn quiet face, dark hair combed back. A LARGE plain silver crucifix
on a chain worn OUTSIDE the collar, clearly visible, resting on his chest — the
one detail that identifies him at a distance. Black high leather flight boots.

SHEET CONTENTS, arranged left to right in one row: full-body front view standing
still and quiet with arms at his sides, full-body three-quarter view crossing
himself, full-body side profile emphasising the narrow vertical silhouette,
full-body view from behind; and along the bottom a strip of four head close-ups:
solemn neutral, eyes closed in prayer, jaw set in anger, and a rare small smile.

PERIOD LOCK — Argentina 1982: no modern military equipment, no digital or
woodland camouflage pattern, no nylon or MOLLE webbing, no NATO or US insignia,
no invented unit patches, no chest patches, no name tapes, no wristbands, no
large national flag printed across the back, no WWII American GI look, no modern
sport eyewear, no modern wristwatch.

16:9 landscape. No text, no labels, no letters, no numbers, no watermark, no
signature.
```

---

## `{PICHON}` — el pibe

El más joven del aire, espejo de Mateo en tierra. **Su arco es el que más cambia de cara**, así que
su tira de expresiones es la más importante de todas: es el personaje que envejece durante el juego.

> *Cambios v2:* refuerzo de "el más chico" —tiene que leerse como un chico entre hombres, no como
> un hombre bajo—, cara criolla, casco de época, botas negras. Las pecas se mantienen: son de las
> pocas cosas que sobreviven a la escala de sprite.
>
> **Background v2.2 (GUION_2 §2 y §2c) — le cambia el prop principal.** El Pichón es un
> **superdotado inocente**: un Tony Stark de hangar patagónico, sin soberbia y sin plata, que le
> propone al Turco mejoras que al Turco no se le ocurrieron en veinte años de oficio. **De él
> salen todas las mejoras jugables del avión** (piruetas, turbo, Mach), y después de su muerte
> siguen saliendo de su libreta. *Traducción a la lámina, lo más importante de esta hoja:*
>
> **LA LIBRETA es su objeto, como el mate es del Gitano y el crucifijo del Vasco.** Tapas de hule
> negro gastado, hojas cuadriculadas, gorda de tanto anotarla, **siempre en la mano o asomando del
> bolsillo del pecho**. Y con ella: un **lápiz de carpintero detrás de la oreja** y las **manos
> manchadas de grasa** (es el único piloto con manos de mecánico — se mete abajo del avión con el
> Turco). Esas tres marcas lo identifican de lejos y hacen legible su rol sin una línea de diálogo.
>
> Agregar al prompt, en CHARACTER: `he always carries a fat black oilcloth-covered notebook full of
> sketches, either in his hand or sticking out of his chest pocket, a carpenter's pencil tucked
> behind one ear, and grease-stained hands — the only pilot with a mechanic's hands`.
>
> Y en SHEET CONTENTS sumar una vista: `one three-quarter view crouched on his heels sketching on
> the notebook balanced on his knee, completely absorbed`. Es la pose que lo define.

```
Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug (SNK Neo Geo
era), hand-drawn sprite look, chunky black pixel outlines, expressive exaggerated
character poses and faces, rich dithered shading, saturated military palette of
olive drab, steel blue-grey, silver and warm sand with a single red accent when
noted, dramatic cinematic side-scroller composition, crisp clean pixels, no
anti-aliasing, no photorealism, no 3D render, no smooth digital painting.

Character sprite model sheet of a single character repeated in several views,
neutral flat mid-grey background, consistent design across all views, arcade
sprite proportions, orthographic reference lámina layout.

CHARACTER: argentine air force rookie pilot, 22 years old. SILHOUETTE IS THE
POINT: he is the SMALLEST of the squadron and reads as a boy among grown men —
short, slight, narrow, with a childish head-to-body ratio. His olive flight suit
is CLEARLY TOO BIG for him: sleeves swallowing his hands, excess fabric bunching
at the waist and ankles, the shoulder seams hanging halfway down his arms.
Criollo argentine features, olive skin, dark hair, baby face, freckles across the
nose, wide nervous eyes. White 1960s hard flight helmet with a sliding visor and
a green oxygen mask hanging loose from one clip, HELD WITH BOTH HANDS PRESSED
AGAINST HIS CHEST like a schoolbag. Black high leather flight boots that look new.

SHEET CONTENTS, arranged left to right in one row: full-body front view standing
with tense shoulders, full-body three-quarter view, full-body side profile,
full-body view from behind; and along the bottom a strip of four head close-ups
telling his arc: eager and nervous, wide-eyed terror, hollow thousand-yard stare,
and finally hardened and quiet — the same boy but no longer a boy.

PERIOD LOCK — Argentina 1982: no modern military equipment, no digital or
woodland camouflage pattern, no nylon or MOLLE webbing, no NATO or US insignia,
no invented unit patches, no chest patches, no name tapes, no large national
flag printed across the back, no WWII American GI look, no modern sport eyewear,
no modern wristwatch. Argentine latin-american face, not north-american, not
northern-european.

16:9 landscape. No text, no labels, no letters, no numbers, no watermark, no
signature.
```

---

# TIERRA Y BASE

## `{MATEO}` — el hijo. Protagonista del cuaderno

El que escribe las cartas. **Generá esta hoja junto con la de Esteban**: tienen que leerse como
padre e hijo sin que haga falta decirlo.

> ### 🔴 Esta es la hoja que más cambia — y la razón de toda la revisión
>
> La hoja de la tanda 1 **no es un conscripto de Malvinas: es un GI norteamericano de la Segunda
> Guerra Mundial.** Punto por punto:
>
> | lo que salió | lo que era en el 82 |
> |---|---|
> | **capote largo de lana hasta la pantorrilla** (el *overcoat* de la Segunda Guerra) | **camperón verde oliva hasta la cadera, con capucha** y cuello de piel sintética |
> | casco liso con **galones rojos pintados** (inventados) | casco de acero argentino con **funda de tela verde y red**, barbijo colgando suelto, **sin ninguna insignia pintada** |
> | **nada de correaje** | **correaje argentino de cuero**: cinturón, cartucheras y cantimplora. Cuero, no nylon — es la marca visual argentina |
> | **borceguíes marrones limpios y secos** | borceguíes de cuero **empapados y embarrados de turba**. Que el calzado no aguantara el agua es de las cosas más contadas de esa guerra |
> | cabeza rapada al ras | rapado de colimba **ya crecido y desprolijo** una vez en las islas |
> | **cara de treinta y pico, rasgos anglosajones** | **dieciocho de verdad**: flaco, pómulos marcados, cara y nariz quemadas por el viento, labios partidos, pelusa adolescente. Y **criollo del interior** |
> | ni frío ni barro | **gorro de lana debajo del casco**, bufanda, manos envueltas en trapos, todo mojado |
>
> **Decisión tomada: la hoja tiene DOS ETAPAS en la misma lámina.** Mateo aparece en el juego en dos
> momentos muy distintos —P.3 es la cocina en el continente, recién incorporado y entero; las cartas
> del frente son otra persona— y una sola versión no cubre las dos. La fila de arriba es el pibe
> que se va; la de abajo es el que escribe. **Es el mismo chico**: la lámina tiene que dejarlo claro,
> porque ese es el golpe.

```
Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug (SNK Neo Geo
era), hand-drawn sprite look, chunky black pixel outlines, expressive exaggerated
character poses and faces, rich dithered shading, saturated military palette of
olive drab, steel blue-grey, silver and warm sand with a single red accent when
noted, dramatic cinematic side-scroller composition, crisp clean pixels, no
anti-aliasing, no photorealism, no 3D render, no smooth digital painting.

Character sprite model sheet of ONE single character shown in TWO STAGES, two
rows, neutral flat mid-grey background, same face and same body in both rows,
arcade sprite proportions, orthographic reference lámina layout.

CHARACTER: argentine army conscript soldier, EXACTLY 18 YEARS OLD and he must
read as 18 — a skinny teenager, narrow shoulders, thin neck, a boy's face that
has not filled out. Criollo argentine features from the rural interior: olive-tan
skin, black hair, big dark expressive eyes, soft adolescent jaw with a faint
patchy teenage mustache that has not come in properly. His face is a younger,
softer version of a tall lean 41-year-old pilot's face: same dark eyes, same jaw
not yet grown into.

UNIFORM, 1982 argentine army: HIP-LENGTH olive-green hooded field parka with a
synthetic fur collar, several sizes too big for him — NOT a long coat, it ends at
the hip. Plain olive-drab combat trousers, no camouflage. ARGENTINE LEATHER
WEBBING: brown leather belt with leather ammunition pouches and a canteen, worn
over the parka. Brown leather ankle combat boots. Argentine steel combat helmet
with an olive cloth cover and netting, chin strap hanging loose and unbuckled,
COMPLETELY UNMARKED — no painted stripes, no chevrons, no insignia of any kind.
A knitted wool cap worn UNDER the helmet, showing over his ears. A lined school
notebook and a blue ballpoint pen in his parka pocket.

TOP ROW — STAGE ONE, "the boy who leaves": clean, whole, freshly issued. Head
shaved to the scalp, uniform dry and correct, standing straight, still soft in
the face. Views left to right: full-body front view standing swallowed by the
oversized parka, full-body three-quarter view, full-body side profile, full-body
view from behind.

BOTTOM ROW — STAGE TWO, "the boy who writes": the SAME boy after weeks in the
field. Shaved head now grown out uneven and untidy, face thinner and hollowed,
cheeks and nose wind-burnt raw red, lips cracked, dark rings under the eyes.
Uniform soaked through and caked in brown peat mud to the knees, boots sodden,
a scarf wrapped around his neck, HANDS WRAPPED IN RAGS against the cold, shoulders
hunched, visible breath. Views left to right: full-body front view hunched and
cold, full-body three-quarter view SITTING hunched on an ammunition crate writing
in the notebook balanced on his knee, and a strip of three head close-ups: cocky
teenage grin (from stage one, for comparison), frightened and freezing, and
looking up at the sky with pure open hope.

PERIOD LOCK — Argentina 1982: no modern military equipment, no digital or
woodland camouflage pattern, no nylon or MOLLE webbing, no plate carrier or
tactical vest, no NATO or US insignia, no invented unit patches, no name tapes,
no large national flag printed across the back, NO WWII AMERICAN GI LOOK, NO LONG
WWII GREATCOAT, no painted helmet insignia, no modern sport eyewear, no modern
wristwatch. Plain olive-drab cloth, brown leather and painted steel only.
Argentine latin-american face, not north-american, not northern-european.

16:9 landscape. No text, no labels, no letters, no numbers, no watermark, no
signature.
```

> **Si tu generador no banca dos filas** (algunos colapsan la lámina), generá dos hojas: corré el
> prompt una vez con solo el bloque TOP ROW y una vez con solo el bloque BOTTOM ROW, usando la
> primera como *image reference* de la segunda. Es la única forma de garantizar que sea el mismo
> chico.

---

## `{TURCO}` — el mecánico

El que pinta las estrellitas. Es el corazón de la base y aparece en varios de los cuadros más
emotivos del Movimiento I: sus **manos** importan tanto como su cara.

> *Cambios v2, y hay uno que es de guion:*
>
> 1. **El apodo por fin significa algo.** "El Turco", en Argentina, es el de familia sirio-libanesa.
>    En la tanda 1 salió un señor gris europeo cualquiera y el apodo quedó colgado. Ahora la hoja
>    pide rasgos árabes explícitamente. Es gratis y suma una capa de país.
> 2. **Bigote de morsa, caído** — no de cepillo. Puma tiene el de cepillo. Eran el mismo bigote en
>    dos personajes que además comparten edad y corpulencia; se salvaban solo por el color de la ropa.
> 3. 🔴 **El error más importante de toda la tanda:** en el recuadro de la mano con el pincel, el
>    Turco está **pintando una bandera argentina**. Tiene que estar pintando **una estrellita
>    blanca chica** — es su gesto central en el guion, la estrellita por cada regreso. Si el detalle
>    sale mal en la hoja maestra, sale mal en todos los cuadros que la usen de referencia.
> 4. Fuera la **bandera argentina gigante en la espalda del overol**. Un mecánico de base no lleva eso.

```
Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug (SNK Neo Geo
era), hand-drawn sprite look, chunky black pixel outlines, expressive exaggerated
character poses and faces, rich dithered shading, saturated military palette of
olive drab, steel blue-grey, silver and warm sand with a single red accent when
noted, dramatic cinematic side-scroller composition, crisp clean pixels, no
anti-aliasing, no photorealism, no 3D render, no smooth digital painting.

Character sprite model sheet of a single character repeated in several views,
neutral flat mid-grey background, consistent design across all views, arcade
sprite proportions, orthographic reference lámina layout.

CHARACTER: argentine air force chief mechanic, late 50s, of SYRIAN-LEBANESE
descent — olive skin, strong hooked nose, heavy dark brows gone grey, warm deep-set
tired eyes. Stocky with a round belly, bald on top with grey hair at the sides, a
soft cloth work cap, reading glasses pushed up onto his forehead. Thick grey
DROOPING WALRUS MUSTACHE covering the upper lip, NOT a clipped brush mustache.
Grease-stained faded blue mechanic's overalls, PLAIN AND UNMARKED on the back, an
oily rag hanging over one shoulder, big weathered scarred hands.

SHEET CONTENTS, arranged left to right in one row: full-body front view standing
with hands on hips, full-body three-quarter view holding a dented old metal
thermos and a gourd mate, full-body side profile, full-body view from behind
showing a completely plain overall back; and along the bottom a strip of four
close-ups: head with a warm gruff smile, head grieving with the rag pressed to
his face, ONE WEATHERED HAND HOLDING A FINE PAINTBRUSH AND PAINTING A SINGLE
SMALL WHITE FIVE-POINTED STAR onto grey riveted aircraft metal — a small plain
white star and nothing else, no flag, no emblem, no roundel — and one weathered
hand laid flat against aircraft metal.

PERIOD LOCK — Argentina 1982: no modern equipment, no NATO or US insignia, no
invented unit patches, no name tapes, no large national flag printed across the
back, no flag anywhere, no modern sport eyewear, no modern wristwatch.

16:9 landscape. No text, no labels, no letters, no numbers, no watermark, no
signature.
```

---

## `{COLORADO}` — el cabo que cuida a los pibes

Mateo lo dibuja como un superhéroe con capa. Para que ese chiste funcione, la hoja "real" tiene que
mostrar a un tipo grandote y común — el contraste ES la ternura.

> *Cambios v2:* fuera la **bandera argentina gigante en la espalda** y el escudo inventado en el
> pecho. Entra el **correaje argentino de cuero** (misma marca visual que Mateo — están en la misma
> guerra, tienen que verse del mismo ejército) y entra el **frío**: en la tanda 1 salió limpio y
> seco, parado en un día lindo. Su tez clara y su pelo colorado se mantienen: son la razón del apodo.

```
Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug (SNK Neo Geo
era), hand-drawn sprite look, chunky black pixel outlines, expressive exaggerated
character poses and faces, rich dithered shading, saturated military palette of
olive drab, steel blue-grey, silver and warm sand with a single red accent when
noted, dramatic cinematic side-scroller composition, crisp clean pixels, no
anti-aliasing, no photorealism, no 3D render, no smooth digital painting.

Character sprite model sheet of a single character repeated in several views,
neutral flat mid-grey background, consistent design across all views, arcade
sprite proportions, orthographic reference lámina layout.

CHARACTER: argentine army corporal, 26 years old, tall and sturdy and broad, an
ordinary big-hearted man. Argentine of galician-irish descent — very fair
freckled skin gone red and raw from the cold wind, bright red hair, pale eyes,
broad honest smile. UNIFORM, 1982 argentine army: plain olive-drab field jacket
and trousers with NO camouflage pattern and NO insignia, a knitted wool cap,
ARGENTINE BROWN LEATHER WEBBING — leather belt with leather ammunition pouches
and a canteen — and brown leather ankle combat boots caked in wet peat mud. Damp
and cold: collar turned up, visible breath. NO CAPE.

SHEET CONTENTS, arranged left to right in one row: full-body front view standing
solid and reassuring, full-body three-quarter view crouching to hand over a small
food tin, full-body side profile, full-body view from behind showing a completely
plain unmarked jacket back; and along the bottom a strip of four head close-ups:
broad honest laugh, worried but hiding it, shouting an order, and utterly
exhausted.

PERIOD LOCK — Argentina 1982: no modern military equipment, no digital or
woodland camouflage pattern, no nylon or MOLLE webbing, no plate carrier or
tactical vest, no NATO or US insignia, no invented unit patches, no chest
emblems, no name tapes, NO LARGE NATIONAL FLAG PRINTED ACROSS THE BACK, no WWII
American GI look, no modern sport eyewear, no modern wristwatch. Plain olive-drab
cloth, brown leather and painted steel only.

16:9 landscape. No text, no labels, no letters, no numbers, no watermark, no
signature.
```

---

## `{NORMA}` — la madre

⚠️ **Su hoja es distinta a propósito, y esto es una decisión de guion.** El token dice *"almost
always seen from behind or in profile"*: no verle la cara es el dispositivo — es la que espera, la
que no vuela y no combate, y el juego nunca la enfrenta al espectador. **Una hoja con vista frontal
rompería eso**, y una vez generada el generador la va a usar.

Por eso su lámina no tiene frente: tiene espalda, perfiles y manos.

> *Cambios v2 — la tanda 1 acertó lo difícil y erró lo fácil.* La regla de no mostrarle la cara se
> respetó perfecto. Pero:
>
> 1. 🔴 **Tiene una escarapela argentina cosida en la manga del vestido.** Es contaminación pura del
>    bloque militar del prompt: es un ama de casa en su cocina. Fuera.
> 2. 🔴 **El sobre del recuadro final tiene sello de lacre rojo**, como una carta del siglo XVIII. Lo
>    que llega a esa casa es un **telegrama militar argentino** o un sobre de papel barato — y ese
>    objeto es de los que más pesan en el guion. Va explícito.
> 3. Salió de unos **sesenta y pico**, no de "late 40s". Se refuerza la edad.
> 4. **El delantal cambia entre vistas** (liso en una, floreado en otra): en una hoja de referencia
>    eso es un defecto, es lo único que la hoja tiene que garantizar. Se fija floreado.
> 5. Apareció **un chico chiquito no pedido** en la segunda vista. Se agrega la negativa.

```
Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug (SNK Neo Geo
era), hand-drawn sprite look, chunky black pixel outlines, expressive exaggerated
character poses and faces, rich dithered shading, warm muted domestic palette of
faded blue, cream and worn wood, crisp clean pixels, no anti-aliasing, no
photorealism, no 3D render, no smooth digital painting.

Character sprite model sheet of a single character repeated in several views,
neutral flat mid-grey background, consistent design across all views, arcade
sprite proportions, orthographic reference lámina layout.

CHARACTER: argentine housewife and mother, 47 years old — middle-aged, NOT
elderly: dark hair still mostly black with grey only at the temples, gathered in
a low bun; upright and strong. Criolla argentine, olive skin, the mother of an
18-year-old conscript. She wears a plain faded blue everyday dress with a
CREAM FLORAL-PRINT APRON over it — THE SAME FLORAL APRON IN EVERY SINGLE VIEW,
identical print, no variation — and worn brown house shoes. She is a civilian in
her own kitchen: absolutely no military clothing, no insignia, no badge, no
cockade, no patch of any kind anywhere on her.

IMPORTANT: her face is NEVER fully shown — she is always seen from behind, in
profile, or partially turned away. This is deliberate and must hold in every view.
She is ALONE in every view.

SHEET CONTENTS, arranged left to right in one row: full-body view from behind
standing at a stove, full-body view from behind serving food with a ladle,
full-body side profile with her face half hidden by loose hair, full-body
three-quarter from behind sitting at a table; and along the bottom a strip of
three close-ups that are NOT face portraits: the back of her head and bun, her
hands wringing a kitchen towel, and her hands holding a plain unopened
cheap-paper envelope — an ordinary 1982 argentine military telegram, plain and
grey, NO WAX SEAL, no ribbon, no crest, no decoration of any kind.

PERIOD LOCK — Argentina 1982 domestic interior: no military uniform, no
insignia, no cockade, no patches, no wax seals, no modern appliances, no modern
eyewear. No other person in frame, no children, no second figure.

No frontal face view, no eye contact with the viewer. 16:9 landscape. No text,
no labels, no letters, no numbers, no watermark, no signature.
```

---

# VEHÍCULOS

Los dos van con **vistas ortográficas**, no con poses: una hoja de vehículo sirve para dibujarlo
igual desde cualquier ángulo, no para actuar.

## `{SKYHAWK}` — el avión de Esteban

> Ojo: esta hoja es **para las cinemáticas**, no para el juego. El A-4 jugable ya tiene su hoja de
> sprites horneada desde un modelo 3D (`tools/bake_planes.html`). Son dos pipelines distintos y no
> hay que mezclarlos — pero el avión de las cinemáticas y el del gameplay tienen que **parecerse**,
> así que conviene generar esta hoja mirando el sprite del juego al lado.

> *Cambio v2:* se fija el modelo en **A-4B**, que es el que voló el Grupo 5 de Caza, y se aclara que
> el recuadro de las estrellitas muestra **estrellas blancas chicas**, no escarapelas — mismo error
> que apareció en la hoja del Turco.

```
Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug (SNK Neo Geo
era), hand-drawn sprite look, chunky black pixel outlines, rich dithered shading,
saturated military palette of olive drab, steel blue-grey, silver and warm sand,
crisp clean pixels, no anti-aliasing, no photorealism, no 3D render, no smooth
digital painting.

Vehicle orthographic model sheet, single aircraft repeated in multiple views,
neutral flat mid-grey background, consistent design and consistent scale across
all views.

VEHICLE: A-4B Skyhawk attack jet in 1982 Argentine Air Force service, bare
silver-grey metal finish, blue-and-white argentine roundel on wings and fuselage,
worn and weathered painted metal with visible panel lines and streaking, single
seat, short delta wings, humpbacked spine, tricycle landing gear.

SHEET CONTENTS: side view, top view, front view, rear view, and one dramatic
three-quarter hero view; plus two detail insets: the cockpit canopy with the
pilot's white helmet visible inside, and a close-up of the clean painted area
below the cockpit showing a neat row of SMALL WHITE FIVE-POINTED STARS — plain
white stars only, no flags, no roundels, no emblems.

PERIOD LOCK — Argentina 1982: no modern avionics, no glass cockpit, no NATO or
US markings, no modern missiles, no digital camouflage.

16:9 landscape. No text, no labels, no letters, no numbers, no watermark, no
signature.
```

---

## `{RASTROJERO}` — la camioneta del padre

Es el objeto que abre y cierra el juego (el arroyo del prólogo y el epílogo). Tiene que poder
dibujarse **en color** para el `[AIRE]` y **en azul de birome** para el cuaderno, así que la hoja va
en `[AIRE]` y el estilo `[TIERRA]` se aplica después sobre la misma silueta.

```
Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug (SNK Neo Geo
era), hand-drawn sprite look, chunky black pixel outlines, rich dithered shading,
saturated palette of faded work-truck paint, rust orange and warm sand, crisp
clean pixels, no anti-aliasing, no photorealism, no 3D render, no smooth digital
painting.

Vehicle orthographic model sheet, single vehicle repeated in multiple views,
neutral flat mid-grey background, consistent design and consistent scale across
all views.

VEHICLE: rusty old Argentine Rastrojero pickup truck, 1960s utilitarian workhorse,
rounded cab, simple flat bed, faded paint, dents, one mismatched panel, farm dust.

SHEET CONTENTS: side view, front view, rear view with the tailgate down, top
view, and one three-quarter view parked on a dirt road; plus one detail inset of
the worn driver's door handle and side mirror.

PERIOD LOCK — Argentina, rural, period-correct 1960s-70s vehicle: no modern car,
no modern lights, no modern badges.

16:9 landscape. No text, no labels, no letters, no numbers, no watermark, no
signature.
```

---

# EXTRA — la hoja que el storyboard no pide pero conviene tener

## `{TRAZO_MATEO}` — cómo dibuja Mateo

Los cuadros `[TIERRA]` no solo muestran cartas: muestran **dibujos hechos por un personaje**. El
Colorado con capa, las cajas y los pibes, el barco chueco. Si cada uno se genera suelto, cada dibujo
va a parecer de una mano distinta — y el cuaderno es de **una** persona.

Esta hoja fija esa mano. Además, el storyboard dice que el trazo de Mateo **evoluciona** (prolijo en
M1–M3, oscuro y ralo en el Movimiento III, luminoso en M7): la hoja incluye esa curva, así se puede
pedir "el trazo de la etapa 3" más adelante.

```
Naive pixel art sketch drawn entirely in blue ballpoint-pen tones on a lined
notebook-paper background, Metal Slug-inspired sprite proportions but drawn like
an 18-year-old soldier's heartfelt doodle, single-color blue palette with
dithered shading, cream paper texture with faint ruled lines, ink smudges and
damp stains rendered as pixels, crisp clean pixels, no anti-aliasing, hand-made
naive feel, no photorealism, no 3D render.

Style reference sheet showing the SAME young soldier's drawing hand across four
stages, as four small doodles on one notebook page: (1) early, neat and curious
with careful outlines and small hopeful details; (2) confident, bigger and more
expressive; (3) late, dark and sparse — heavy pen pressure, lots of shading,
almost no detail, like someone too tired to finish; (4) one radiant carefully
worked drawing, the most detailed of all, made with obvious love.

Each doodle simple: a little plane, a little soldier, a stick figure. Consistent
hand, consistent pen, consistent proportions. 3:4 vertical notebook page. No
text, no letters, no numbers, no watermark, no signature.
```

---

# PROPS — los dos objetos que actúan *(nuevo en v2.2)*

El guion 2.2 le dio a dos objetos el peso de un personaje: aparecen en primer plano, se
revelan como plot twist y siguen viajando de mano en mano hasta el epílogo. Conviene tener
su hoja modelo aparte, porque **tienen que ser idénticos en todas sus apariciones** —
si la foto del Vasco cambia de cara entre M6 y el epílogo, el remate se arruina.

## `{FOTO_VASCO}` — la madre del Vasco

**Dónde aparece:** de frente, en primer plano, en **M1, M3 y M5** (el jugador la ve y se ríe
con el resto) → **M6, el reveal: el Turco la da vuelta** → el bolsillo del mameluco del Turco
→ la mesa del asado (M11) → el bolsillo del pecho de Esteban (M12) → la encomienda de la mesa
de Norma, que **también la da vuelta** (epílogo). **Una sola foto, ocho apariciones.**

> ### ⚠ LEER ANTES DE GENERAR — el error que arruina el giro
> La mujer de la foto **NO es una anciana**. Es una **mujer joven y hermosa de unos treinta y
> cinco años**, fotografiada a fines de los cincuenta. Esto no es un detalle: **es el
> mecanismo entero del gag.** La escuadrilla la joroba durante seis misiones porque vio esa
> foto y dio por hecho que era una amante. Si el frente muestra a una señora mayor, nadie
> haría ese chiste, el jugador tampoco lo compraría, y el giro se cae.
>
> Y la razón por la que es joven es la puñalada: **es su madre, y era joven porque se murió
> joven** — en 1961, cuando el Vasco tenía quince años. Nunca llegó a ser vieja.
>
> **La pista tiene que estar dibujada, no escondida:** peinado, vestido y grano de copia
> inequívocamente de finales de los cincuenta. Un jugador atento puede sospechar desde M1.
> Casi ninguno lo hace, porque el chiste le enseña cómo mirar. Eso es lo que hace honesto al
> engaño — pero solo si la foto **se ve clara, grande y varias veces.**

Se generan **dos láminas**: el frente (la mujer joven) y el dorso (las fechas y la
dedicatoria). El dorso es el remate del gag más largo del juego: la letra tiene que leerse
perfecta.

```
[AIRE] Extreme close-up of a small worn black-and-white photograph from the late
1950s held in frame, deckled white border, curled corners, fingerprints and a soft
crease across one corner from decades of handling. THE PHOTO SHOWS: a beautiful
young argentine woman in her mid-thirties, dark hair set in a late-1950s style,
wearing a simple pretty dress of that era, leaning on a balcony railing and
laughing openly at whoever is holding the camera, sunlight on her face, alive and
radiant, a working-class woman on a good day. Slightly soft focus, silver-gelatin
grain, the unmistakable look of a portrait taken thirty years before 1982.

CRITICAL: she is YOUNG and beautiful, not elderly. Mid-thirties. The photograph
must read as something a man would keep of a sweetheart — that misreading is the
entire point.

PERIOD LOCK — Argentina, late 1950s: no modern clothing, no modern hairstyle, no
plastic, no modern eyewear, nothing after 1960.

16:9 landscape. No text, no letters, no numbers, no watermark, no signature.
```

**Dorso — el remate.** Generar sin texto y tipografiar encima en el motor (recomendado, así
se controla la letra y las fechas quedan nítidas):

```
[AIRE] Extreme close-up of the BACK of the same small worn photograph: blank
photographic paper, aged cream-yellow, curled corners, one soft crease, the faint
ghost of the image showing through, a smudge of engine grease at one edge from a
mechanic's thumb. Empty space in the centre ready for a few short handwritten
lines. Dramatic single-source lamp light from the side.

TEXT IN IMAGE (handwritten in a hard blunt male hand with a ballpoint, slightly
crooked, centred, four short lines):
"Rosa Elena Arrieta"
"1926 - 1961"
"Te amo, mamá."
"Perdoname."

16:9 landscape. No watermark, no signature.
```

> **Nota de arte — el peso de esta imagen.** Es el remate de un gag que corre seis misiones
> **y el único backstory que el Vasco recibe en todo el juego**: nadie explica nunca de qué se
> disculpa. La letra tiene que ser **dura, torpe, de hombre que no escribe nunca** — nada de
> caligrafía linda. Si sale prolija, regenerá: la torpeza *es* el personaje.
>
> **Las fechas son el golpe, no la frase.** "1926 – 1961" tiene que leerse perfecto, porque
> es el dato que hace la cuenta: murió a los 35, y el Vasco tenía 15. Si el jugador no puede
> leer esos números, pierde la mitad del reveal. Tipografiarlos aparte si hace falta.
>
> **Composición:** nombre y fechas arriba, prolijitos, como copiados de un documento — un
> hombre que quiso dejarlo bien escrito. Y abajo, más chico y más torcido, el *"Perdoname"*
> en un renglón aparte, como agregado después de dudarlo. Esa duda es toda su vida anterior.

> **Lámina extra recomendada — `{FOTO_VASCO_LOCKER}`.** Vale la pena una tercera imagen: la
> foto **pegada del lado de adentro de la puerta del locker**, con cinta amarillenta en las
> cuatro esquinas, chapa gris, la penumbra del vestuario. Es el cuadro que se repite en M1,
> M3 y M5 y el que abre el reveal en M6. Que la foto se lea perfectamente incluso en este
> plano más abierto — es lo que hace que el jugador la reconozca cuando el Turco la despega.

## `{LIBRETA_PICHON}` — el cuaderno de ideas

**Dónde aparece:** en la mano del Pichón durante todo el Movimiento I y II (es su prop de
identidad, ver su hoja) → el Turco la encuentra bajo el catre (M8) → cada mejora del avión
de M9 a M11 → la mesa del asado, al lado de la foto del Vasco (M11).

Es el gemelo del cuaderno de Mateo y **tiene que leerse distinto de un vistazo**: el de
Mateo es escolar, celeste, con dibujos naif; el del Pichón es técnico, negro, con cortes de
fuselaje y números. Memoria contra futuro, en dos objetos.

```
[AIRE] Extreme close-up of a fat black oilcloth-covered pocket notebook lying open
on a workbench under a hanging lamp, grease fingerprints on the cover, corners
worn round, pages swollen and dog-eared. THE OPEN PAGES SHOW: dense engineering
sketches drawn in pencil by a brilliant young mechanic-minded pilot — cutaway
side views of a jet fuselage, arrows showing airflow, a manoeuvre drawn as a
looping arrow diagram, small margin calculations, a tiny doodled aeroplane in a
corner. Confident, obsessive, joyful handwriting-adjacent linework. A carpenter's
pencil resting in the gutter. Warm workshop lamplight, deep shadows around.

Deliberately the OPPOSITE of a child's notebook: technical, dark, precise.

16:9 landscape. No readable text, no letters, no numbers, no watermark, no
signature.
```

> **Variante para las mejoras póstumas (M9–M11):** el mismo prompt agregando
> `two big weathered grease-stained hands of an older mechanic holding the notebook open,
> and a half-built metal part on the bench beside it`. Es el plano del Turco construyendo
> las ideas de un muerto — se repite tres veces con la pieza cambiando.

---

# Tabla de tokens AMPLIADA — v2

Estos son los descriptores actualizados **con lo que se agregó en las hojas**. Reemplazan a la tabla
de `STORYBOARD_1.md` (que ya quedó actualizada con esta misma tabla).

| Token | Descriptor (inglés, pegar tal cual) |
|---|---|
| `{ESTEBAN}` | argentine air force pilot, 41 years old, **very tall and very thin, gaunt and narrow, the tallest and thinnest of the squadron**, neck carried forward, **criollo features, olive skin, black hair greying at the temples**, clean-shaven, tired warm eyes, olive flight suit **unzipped to mid-chest**, no jacket, **white 1960s flight helmet with oxygen mask hanging, under one arm, black leather flight boots** |
| `{MATEO}` | argentine army conscript, **18 years old and reads as 18**, skinny teenager, **criollo features, olive skin, black hair, patchy teenage mustache**, **hip-length oversized olive hooded parka (NOT a long coat)**, **argentine brown leather webbing with canteen**, **unmarked steel helmet with cloth cover over a wool cap**, brown leather boots caked in peat mud, notebook and blue pen in his pocket, **wind-burnt face, cracked lips**, clearly the son of a tall lean 41-year-old pilot |
| `{PUMA}` | argentine squadron leader, 44 years old, **short and very heavy, squat, the broadest and shortest of the squadron**, criollo, sun-darkened, **iron-grey hair cropped to the scalp**, sun-squinted eyes, **grey BRUSH mustache**, **brown leather flight jacket over** his olive flight suit, **helmet held low in one hand**, black leather flight boots |
| `{GITANO}` | argentine pilot, 33 years old, **the most open silhouette: flight suit pulled down to the waist with sleeves knotted in front, white undershirt, bare arms**, **tall voluminous black curly hair, the darkest-skinned of the squadron**, big warm grin, **brown gourd mate with metal bombilla** in hand, black leather flight boots |
| `{VASCO}` | argentine pilot, 36 years old, **the most closed silhouette: tall and narrow, sloping shoulders, flight suit zipped to the chin, arms straight at his sides, motionless**, **pale skin, basque features**, heavy brow, solemn face, **LARGE silver crucifix worn outside the collar**, black leather flight boots |
| `{PICHON}` | argentine rookie pilot, 22 years old, **the smallest of the squadron, reads as a boy among men**, criollo, olive skin, baby face, freckles, nervous eyes, **flight suit clearly too big, sleeves swallowing his hands**, **helmet held with both hands against his chest** |
| `{TURCO}` | argentine chief mechanic, late 50s, **syrian-lebanese descent, olive skin, hooked nose**, stocky with a round belly, **bald on top with grey sides, cloth cap, glasses pushed up on his forehead**, **grey DROOPING WALRUS mustache**, grease-stained blue overalls **plain and unmarked on the back**, rag over one shoulder, big weathered hands |
| `{COLORADO}` | argentine corporal, 26 years old, tall and sturdy, **fair freckled skin raw red from the cold**, red hair, broad honest smile, **plain olive field uniform with NO insignia**, wool cap, **argentine brown leather webbing with canteen**, muddy brown leather boots |
| `{NORMA}` | argentine mother, **47 years old, middle-aged not elderly**, dark hair with grey at the temples in a low bun, criolla, **faded blue dress with a cream floral apron, always the same apron**, **no military insignia of any kind**, **always seen from behind or in profile, face never fully shown**, always alone |
| `{SKYHAWK}` | **A-4B** Skyhawk attack jet, bare silver-grey metal, blue-white argentine roundel, worn painted metal, single seat, **a row of small plain white stars below the cockpit** |
| `{RASTROJERO}` | rusty old Argentine Rastrojero pickup truck, 1960s workhorse |
| `{FOTO_VASCO}` | small worn late-1950s black-and-white photograph, deckled white border, curled corners, showing a beautiful young argentine woman in her mid-thirties laughing on a balcony, late-1950s hair and dress — YOUNG, never elderly |
| `{LIBRETA_PICHON}` | fat black oilcloth-covered pocket notebook, grease-fingerprinted, swollen with dog-eared pages of pencil engineering sketches and margin calculations, carpenter's pencil |
| `{CUADERNO_MATEO}` | school Rivadavia hardcover notebook, pale blue cover, swollen with damp, peat sand between the lined pages, blue ballpoint drawings |
| `{CARTA_PADRE}` | single sheet of military-issue lined block paper, folded in four, soft and worn at the folds, covered in cramped printed adult handwriting with several heavy crossings-out, unsigned |

**Además, agregá el candado corto al final de CADA cuadro `[AIRE]` de cinemática:**

```
Argentina 1982, no modern military equipment, no NATO or US insignia, no invented
unit patches, no national flag on clothing, argentine latin-american faces.
```

---

# Qué salió mal en la tanda 1

Auditoría de las nueve hojas ya generadas, ordenada por gravedad. Sirve como checklist de qué mirar
al aprobar las nuevas.

### Errores que rompen el juego

1. **`{MATEO}` es un GI norteamericano de la Segunda Guerra**, no un conscripto argentino del 82.
   Capote largo, casco con galones pintados, cero correaje, cero frío, cero barro, cara de treinta y
   pico. Es el personaje emocional del juego y el que menos se parece a lo que tiene que ser.
2. **El Turco pinta una bandera, no una estrellita.** Su gesto entero en el guion —la estrellita por
   cada avión que vuelve— sale mal en la hoja maestra, y la hoja maestra es la referencia de todos
   los cuadros posteriores.
3. **Norma lleva una escarapela militar en la manga del vestido.** Y recibe un sobre con **sello de
   lacre**. Los dos objetos son de los que más pesan en el guion, y los dos están mal.

### Errores de sistema (afectan a varios)

4. **Los cinco pilotos son el mismo hombre con distinta cara.** Misma altura, misma contextura,
   mismo overol. Tero salió macizo cuando el prompt pedía "el más alto y flaco" y Puma salió normal
   cuando pedía "el más ancho". A escala de sprite no se distingue ninguno. → Ya corregido arriba
   con la separación de siluetas.
5. **Parches, escudos, chapas de nombre y banderas gigantes inventadas** en Puma, Gitano, Vasco,
   Turco y Colorado. El prompt decía "no name tags" y el generador igual puso una chapa roja en el
   pecho de Puma: **una negativa suelta no alcanza**, hay que bloquear la categoría entera. → Eso
   hace el `PERIOD LOCK`.
6. **Todo el reparto tiene cara del norte de Europa o de Estados Unidos**, incluidos los que el
   apodo define al revés (el Turco de sirio-libanés salió gris europeo). → Eso hace el candado de
   origen, personaje por personaje.
7. **Los cascos de vuelo son cascos de moto**: lisos, sin visera, sin máscara de oxígeno colgando.
8. **El calzado es un desastre transversal**: borceguíes marrones de trabajo en Tero y Puma,
   zapatillas grises en Gitano y Vasco. Los pilotos van con **bota negra de cuero**; la infantería,
   con **borceguí marrón embarrado**. Son dos calzados distintos y ninguno salió bien.

### Detalles menores

9. Artefacto de "destello" blanco abajo a la derecha en las hojas del Gitano y del Vasco.
10. El crucifijo del Vasco quedó tan chico que desaparece a escala de sprite, siendo que es su marca
    de identificación a distancia.
11. El mate del Gitano salió como vasito blanco de plástico en lugar de calabaza con bombilla.
12. El delantal de Norma cambia de liso a floreado entre vistas — en una hoja de referencia, eso es
    justo lo que no puede pasar.
13. Aparece un chico chiquito no pedido en la segunda vista de Norma.

---

# Checklist al aprobar cada hoja

- [ ] ¿Las cuatro vistas son **el mismo** personaje? (el error más común: la vista de atrás sale de
      otra persona)
- [ ] ¿Los colores del uniforme coinciden entre vistas? ¿Y los accesorios? (el delantal de Norma)
- [ ] ¿Cero texto, cero marca de agua, cero destellos de adorno?
- [ ] ¿Se ve como pixel art de verdad, o es pixel art "falso" borroso? (si es falso: agregar
      `pixel-perfect grid` y regenerar)
- [ ] **¿Equipo de 1982 argentino, sin nada moderno y sin nada norteamericano?**
- [ ] **¿Cero parches, escudos, chapas de nombre y banderas inventadas?**
- [ ] **¿La cara corresponde al origen del personaje?** (criollo por defecto; Vasco claro, Colorado
      pelirrojo, Turco árabe — a propósito)
- [ ] **¿El calzado es el correcto?** Bota negra los pilotos, borceguí marrón embarrado la infantería.
- [ ] **Pilotos: ¿el casco tiene visera y máscara de oxígeno colgando?**
- [ ] **¿Se distingue la silueta de los otros cuatro pilotos en contraluz, sin verle la cara?**
- [ ] Mateo: ¿el camperón le llega **a la cadera** y no a la pantorrilla? ¿Tiene correaje de cuero?
      ¿Parece de 18?
- [ ] Turco: ¿está pintando **una estrellita blanca** y no una bandera?
- [ ] Norma: ¿**no** se le ve la cara de frente? ¿Cero insignias? ¿El sobre es simple, sin lacre?
- [ ] ¿Anotaste el seed?
