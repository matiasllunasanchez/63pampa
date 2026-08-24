# PROMPTS — LAS PLACAS DE TODA LA CAMPAÑA

> **Qué es esto.** Los prompts de **todas las escenas estáticas** del juego: los fondos sobre
> los que ocurre la historia, de P.1 a los dos finales. Es la bajada operativa de
> [RETRATOS.md](RETRATOS.md) §2 y §3.
>
> **Se produce en este orden, y este documento es el paso 1:**
>
> | | Qué | Estado |
> |---|---|---|
> | **1** | **las placas** — los lugares, vacíos | ⬅ **este documento** |
> | 2 | los retratos — las caras que hablan | después |
> | 3 | las figuras — los cuerpos para componer encima | al final |
>
> El orden no es arbitrario: **las placas no tienen gente**, así que no arrastran el problema de
> consistencia de caras ni el candado de época en uniformes. Son lo más barato y lo que más
> pantalla cubre. Y con las placas puestas el juego ya se ve entero, aunque hable con siluetas.

---

## La idea que hace que esto sea corto

**No hay una escena por misión. Hay DIECISÉIS LUGARES que se repiten catorce veces.**

Una escuadrilla vuelve siempre a la misma línea de vuelo, el mismo hangar, la misma sala de
radio. Generar un fondo nuevo por misión sería pagar catorce veces por la misma pared — y
encima haría que la base se sintiera distinta cada vez, que es lo contrario de lo que se busca:
**el lugar tiene que ser reconocible para que el jugador note cuando falta alguien.**

Lo que cambia entre misiones no es el lugar: es **la luz** (amanecer, atardecer, noche), y
**quién está** — que se resuelve componiendo encima, en el paso 3.

Además de las dieciséis hay **cuadros propios**: los momentos donde la imagen ES el contenido y
no alcanza con un fondo. Están abajo, separados, con marca de si se pueden hacer ahora o hay
que esperar al paso 3.

---

## Cómo se usa

Cada prompt arranca con `[AIRE]` o `[TIERRA]`: **reemplazalo por el bloque de estilo completo**
de [PROMPTS_VN_PROLOGO.md](PROMPTS_VN_PROLOGO.md) antes de generar — o usá la versión ya
ensamblada, [PROMPTS_PLACAS_LISTOS.md](PROMPTS_PLACAS_LISTOS.md), que se copia y se pega.

- **Todas las placas van sin gente:** `NOBODY IN THE FRAME. Empty, waiting, quiet.`
- **Formato:** `[AIRE]` en 16:9 · `[TIERRA]` en 3:4 vertical.
- **Nombre de archivo:** el que dice cada ficha. El motor las busca por ese nombre exacto
  (`render/screens.js` → `assets/plates/<id>.png`), y el campo del guion es `placa: '<id>'`
  (ver `data/story.js`).
- **Si una placa no existe, el juego no se rompe:** cae a negro. Se pueden ir soltando de a una.

> ### ⚠️ La regla de las variantes: cambia la LUZ, no las COSAS
>
> **Todo objeto que aparezca en una variante tiene que existir en TODAS.** Es el error que más
> rompe la ilusión de "mismo lugar, otra hora", y es silencioso: cada placa por separado se ve
> bien, y solo al ponerlas juntas se nota que aparecieron muebles de la nada.
>
> Pasó dos veces acá y quedó corregido: la placa de noche tenía **un poste de luz** que no
> estaba en las de día, y la del hangar de noche **una lámpara sobre el banco** que tampoco.
> Ahora el poste y la lámpara están en las tres/dos versiones — **apagados de día y encendidos
> de noche**, que es lo único que debería cambiar.
>
> La fórmula que lo mantiene honesto: la variante nombra el objeto y dice *"THAT SAME …, now
> switched on"*. Si una variante necesita algo que la base no tiene, **se agrega a la base**.
>
> **Y se generan como segunda pasada de su placa base, en la misma sesión.** Si la sacás en
> otra, los objetos se reacomodan solos y deja de leerse como el mismo lugar.

---

# BLOQUE A — LOS DIECISÉIS LUGARES

## A1 · `linea_amanecer` — la línea de vuelo, amanecer

**Dónde:** el briefing de casi todas las misiones. Es LA placa del juego: la que más se ve.

```
[AIRE] Wide view of a windswept Patagonian airbase flightline at dawn in 1982:
cracked concrete apron, a row of empty aircraft parking spots marked with faded
paint, a fuel bowser and a wheeled ground-power cart parked to one side, coiled
hoses, oil stains, A TALL FLOODLIGHT MAST standing at the edge of the apron with its
lamp head dark and switched off, a low corrugated-metal hangar closed in the
background, flat empty horizon beyond, frost on the concrete. Pink and steel-grey southern sky, long
raking light. NOBODY IN THE FRAME. Empty, waiting, quiet. 16:9. Argentina 1982, no
modern equipment, no NATO or US insignia, no national flag. No text, no watermark,
no signature.
```

## A2 · `linea_atardecer` — la línea de vuelo, atardecer

**Dónde:** epílogos de misión, el regreso. **Segunda pasada de A1.**

```
[AIRE] The exact same Patagonian airbase flightline and camera angle, now at dusk:
the same cracked concrete apron, the same fuel bowser and ground-power cart, the same
tall floodlight mast still switched off, the same closed hangar behind. Low orange sun almost at the horizon, long blue shadows
stretching across the concrete, the sky burning orange into deep blue above. NOBODY
IN THE FRAME. Empty, waiting, quiet. 16:9. Argentina 1982, no modern equipment, no
NATO or US insignia, no national flag. No text, no watermark, no signature.
```

## A3 · `linea_noche` — la línea de vuelo, noche

**Dónde:** M13 y M14 — la pista nocturna, antes de la última salida. **Segunda pasada de A1.**

```
[AIRE] The exact same Patagonian airbase flightline and camera angle, now at night:
the same cracked concrete apron, the same fuel bowser and ground-power cart, the same
hangar behind. Lit only by THAT SAME floodlight mast, now switched on and throwing a
hard yellow pool of light down onto the concrete, plus cold moonlight,
deep blue-black darkness, wet concrete reflecting the light, breath-cold air. NOBODY
IN THE FRAME. Empty, waiting, quiet. 16:9. Argentina 1982, no modern equipment, no
NATO or US insignia, no national flag. No text, no watermark, no signature.
```

## A4 · `hangar_dia` — el hangar por dentro, de día

**Dónde:** M3 (el invento) y todas las viñetas del banco del Pichón.

```
[AIRE] Interior of a corrugated-metal aircraft hangar in daylight, 1982: a wheeled
maintenance ladder, a workbench along one wall covered in tools and rags, an oil
drum, a wooden crate, a chain hoist hanging from a roof beam, A SINGLE WORK LAMP hanging on a cable over the
bench, switched off, wide doors open to a flat bright horizon at the far end, dust hanging in the shafts of light. Working,
scruffy, real. NOBODY IN THE FRAME. Empty, waiting, quiet. 16:9. Argentina 1982, no
modern equipment, no NATO or US insignia, no national flag. No text, no watermark,
no signature.
```

## A5 · `hangar_noche` — el hangar de noche, con lámpara

**Dónde:** M9 en adelante, el Turco construyendo de noche lo que dejó la libreta. **Segunda
pasada de A4.**

```
[AIRE] The exact same corrugated-metal hangar interior and camera angle, now at
night: the same workbench, the same ladder, the same oil drum and crate, the wide
doors now shut. Lit by THAT SAME work lamp over the bench, now switched on and
throwing a hard cone of warm light, everything beyond it falling into deep blue shadow. Late, quiet, someone
has been working here for hours. NOBODY IN THE FRAME. Empty, waiting, quiet. 16:9.
Argentina 1982, no modern equipment, no NATO or US insignia, no national flag. No
text, no watermark, no signature.
```

## A6 · `vestuario` — el vestuario, penumbra

**Dónde:** M7, la noche del locker del Vasco. Ya está declarada en `data/story.js`.

```
[AIRE] Interior of a spartan military changing room at night, 1982: a row of tall
grey steel lockers, one of them standing open and empty, a worn wooden bench bolted
to the floor in front of them, flight helmets and jackets hanging on hooks, a
concrete floor, a single bare bulb overhead. Deep shadows between the lockers,
everything still. NOBODY IN THE FRAME. Empty, waiting, quiet. 16:9. Argentina 1982,
no modern equipment, no NATO or US insignia, no national flag. No text, no
watermark, no signature.
```

## A7 · `radio` — la sala de radio

**Dónde:** las escenas de Cóndor, y M14 cuando se enteran del bombardeo.

```
[AIRE] Interior of a small military radio room, 1982: a bank of olive-green valve
radio sets with dials and meters on a metal desk, headphones resting on the desk,
a large wall map of the south atlantic covered in grease-pencil marks, a green
desk lamp throwing a pool of light, a wall clock, cables running along the skirting.
Cramped, warm with valve heat, everything else dark. NOBODY IN THE FRAME. Empty,
waiting, quiet. 16:9. Argentina 1982, no modern equipment, no digital displays, no
NATO or US insignia. No text, no watermark, no signature.
```

## A8 · `cocina_calida` — la cocina de Norma, 1982

**Dónde:** P.2, y se reusa en el **Final B**. *(Ya está en el prólogo como asset 4.)*

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

## A9 · `cocina_gris` — la misma cocina, lavada

**Dónde:** cuando entra el parte de radio en P.2, y en los epílogos años después. **Segunda
pasada de A8.** *(Ya está en el prólogo como asset 5.)*

```
[AIRE] Interior of a modest Argentine home kitchen in 1982, the exact same room and
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

## A10 · `fogon` — el fogón detrás del hangar

**Dónde:** M13, el asado. La última mesa.

```
[AIRE] Behind a corrugated-metal hangar at night, 1982: an oil drum cut in half
lengthways and set on legs as a grill, glowing embers inside it, a grill rack across
the top, a wooden crate and two upturned buckets set around it as seats, a demijohn
of wine and a tin mug on the crate, a hurricane lamp hanging on a nail. Warm orange
firelight against cold blue night, sparks rising. NOBODY IN THE FRAME. Empty,
waiting, quiet. 16:9. Argentina 1982, no modern equipment, no NATO or US insignia,
no national flag. No text, no watermark, no signature.
```

## A11 · `cabina_dia` — la cabina por dentro, de día

**Dónde:** las conversaciones por radio en vuelo.

```
[AIRE] Interior of a 1950s single-seat attack jet cockpit seen from the pilot's
seat in daylight, 1982: a black instrument panel of round analog dials and toggle
switches, a simple optical gunsight on a bracket, the canopy arch framing the top of
the view, side rails at the edges, a bright grey overcast sky and a flat grey sea
visible through the glass ahead. NOBODY IN THE FRAME — no pilot, no hands, no arms.
Empty, waiting, quiet. 16:9. Argentina 1982, no modern avionics, no digital displays,
no NATO or US insignia. No text, no watermark, no signature.
```

## A12 · `cabina_noche` — la cabina de noche

**Dónde:** M14. **Segunda pasada de A11.**

```
[AIRE] The exact same 1950s jet cockpit interior and camera angle, now at night: the
same instrument panel, the same gunsight, the same canopy arch. Lit only by the dim
red-orange glow of the instrument lighting from below, everything else in darkness,
a black sea and a faint band of moonlight on the horizon through the glass ahead.
NOBODY IN THE FRAME — no pilot, no hands, no arms. Empty, waiting, quiet. 16:9.
Argentina 1982, no modern avionics, no digital displays, no NATO or US insignia. No
text, no watermark, no signature.
```

## A13 · `pista_lluvia` — la pista bajo la lluvia

**Dónde:** la ventana del alerta, las esperas, M10 (el frente cerrado).

```
[AIRE] View out across a Patagonian airbase apron in heavy rain, 1982, seen from
under the shelter of a doorway: rain falling in sheets, standing water on the
concrete throwing back a grey sky, the far end of the apron lost in the weather, a
row of empty parking spots, a wind sock straight out horizontal. Cold, grey, waiting.
NOBODY IN THE FRAME. Empty, waiting, quiet. 16:9. Argentina 1982, no modern
equipment, no NATO or US insignia, no national flag. No text, no watermark, no
signature.
```

## A14 · `jazminero` — el patio con el jazminero

**Dónde:** el **Final B**, años después. Norma en el patio.

```
[AIRE] A small back patio of a modest Argentine house on a warm afternoon: a
whitewashed wall, a large flowering jasmine bush against it in full white bloom,
worn red floor tiles, a washing line with two clothes pegs and nothing hanging, a
wooden chair against the wall, an enamel basin. Late golden light, absolutely still,
peaceful. NOBODY IN THE FRAME. Empty, waiting, quiet. 16:9. No modern appliances, no
military equipment of any kind, no national flag. No text, no watermark, no
signature.
```

## A15 · `tandil` — la plataforma de Tandil, amanecer helado

**Dónde:** el intercalado de M10. **La única placa que no es del sur** — y tiene que sentirse
otro país adentro del mismo país: pasto, verde, escarcha, sierras.

```
[AIRE] A military airbase apron at Tandil, Buenos Aires province, at first light on
a freezing morning, 1982: clean wide concrete, frost-whitened green grass beyond it,
low rounded hills on the horizon, a hangar with its doors open, everything neat and
well-kept. Low orange sun raking almost horizontally across the frost, long shadows,
breath-cold clear air. Green and orderly — NOT the barren windswept south. NOBODY IN
THE FRAME. Empty, waiting, quiet. 16:9. Argentina 1982, no modern equipment, no NATO
or US insignia, no national flag. No text, no watermark, no signature.
```

## A16 · `museo` — el museo escolar, presente

**Dónde:** los post-créditos. La única placa del presente además de la cocina.

```
[AIRE] Interior of a small school museum room in the present day: a glass display
case on a wooden base standing in the middle of the room, an open notebook resting
inside it on a cloth-covered stand, soft daylight from a high window falling across
the glass, a plain painted wall behind, a worn wooden floor. Quiet, reverent,
ordinary. NOBODY IN THE FRAME. Empty, waiting, quiet. Present day, no period military
equipment, no flags, no banners. No text, no letters, no labels, no plaques, no
watermark, no signature.
```

---

# BLOQUE B — LA HOJA DEL CUADERNO

## B1 · `p4_hoja` — la hoja vacía

**Dónde:** las **catorce** páginas del cuaderno. Se genera una vez.
*(Ya está en el prólogo como asset 9, con su capa de tinta y su prop aparte.)*

```
[TIERRA] A single blank open notebook page seen straight on, filling the frame, the
printed ruled lines running edge to edge, the paper damp-wrinkled at one corner with
a faint brown water stain, a soft worn edge along the outside, a few pale foxing
specks. NOTHING RESTING ON IT and NOTHING DRAWN ON IT: no pen, no pencil, no
drawings, no sketches, no writing, no letters, no words anywhere. Completely empty
paper — it is a background that other things get composited onto later. 3:4 vertical.
No text, no watermark, no signature.
```

---

# BLOQUE C — LOS CUADROS PROPIOS *(sin gente — se pueden hacer AHORA)*

Momentos donde la imagen ES el contenido, y que además **no necesitan personas**. Son placas
igual, pero de un momento y no de un lugar.

> ### ⚠️ En los primeros planos de props, fijá la ESCALA con un objeto conocido
>
> Un generador no tiene idea de cuán grande es un sobre. Si no se lo decís, lo dibuja del
> tamaño que llene mejor el cuadro — y salen sobres del porte de un casco. **Los primeros
> planos que funcionan traen un ancla:** los dedos que sostienen la foto, la taza al lado de
> los papeles, el casco arriba del sobre.
>
> ### ⚠️ Objetos con marca: pedí las FORMAS, no las palabras
>
> Un cuaderno Rivadavia, una lata, una revista: su identidad **es** lo impreso en la tapa, y
> sin eso el objeto no se reconoce. Pero la regla del proyecto es `no text`, y con razón —
> un generador escribe mal y deja el error horneado en el PNG.
>
> **La salida es describir lo impreso como geometría** y cerrar con una orden explícita:
> *"ALL LETTERING IS ILLEGIBLE… drawn as SHAPES and marks only, with the rhythm of writing,
> never actual readable words"*. A escala de pixel art eso es exactamente lo que se vería de
> todos modos, así que no se pierde nada: se gana un objeto reconocible sin una sola palabra
> escrita.

> **Y para controlar el tamaño de un CONTENEDOR —un locker, una caja, un cuarto— no sirve
> darle medidas** (*"no wider than a man's shoulders"* no significa nada para un generador:
> lo probamos y salió un ropero). **Definilo por lo que entra adentro:** *"only just wide
> enough to hold a helmet and a folded jacket side by side, with barely a hand's width left
> over — those two objects nearly span its full width"*. Eso sí lo puede dibujar, porque los
> objetos que hacen de vara ya están en la escena.
>
> Y si aun así mete vecinos en el cuadro, el problema es el ENCUADRE, no el objeto: hay que
> acercar la cámara hasta que no quede lugar — *"so close that it FILLS THE WHOLE FRAME, edge
> to edge; no neighbouring lockers visible anywhere"*.

> La fórmula: nombrar el objeto grande, y medir el chico contra él —
> *"roughly half the height of the helmet above it"*. Y si el objeto es un tipo de mueble que
> viene en varios tamaños (un locker, un armario, una caja), **decir cuál NO es**: *"NOT a
> wardrobe, NOT a two-door cabinet, NOT a row of lockers"*. Nombrar lo que no es cuesta una
> línea y ahorra tres generaciones.

## C1 · `m7_foto_frente` — la foto de la bella dama

**Dónde:** M7, el locker. Es el engaño honesto: el jugador la ve tres veces antes de saber.

```
[AIRE] Extreme close-up of a small worn late-1950s black-and-white photograph taped
inside a grey steel locker door: it shows a beautiful young argentine woman in her
mid-thirties, laughing, on a balcony, in late-1950s hair and dress. Deckled white
border, curled corners, a strip of yellowed tape at the top. Dim locker-room light.
NOBODY ELSE IN THE FRAME. 16:9. Argentina, no modern equipment. No text, no letters,
no watermark, no signature.
```

## C2 · `m7_foto_dorso` — el dorso *(ya declarado en `data/story.js` como `M7_FOTO_DORSO`)*

**⚠ Este lleva texto escrito a mano y es la excepción a la regla de "no text"** — pero **el
texto lo pone el motor**, no el generador: se genera el dorso en blanco.

```
[AIRE] Extreme close-up of the BACK of a small worn late-1950s photograph, held
between two weathered fingers: blank cream photographic paper, slightly foxed, a
deckled white border, curled corners, a strip of yellowed tape at the top edge. The
back of the photo is COMPLETELY BLANK — no writing, no letters, no words, no marks
of any kind. Dim locker-room light. 16:9. No text, no watermark, no signature.
```

## C3 · `m9_libreta` — la libreta del Pichón bajo el catre

**Dónde:** M9, la noche que el Turco la encuentra.
*(El prompt completo, con las páginas de ingeniería, está en
[PROMPTS_HOJAS_PERSONAJE.md](PROMPTS_HOJAS_PERSONAJE.md) `{LIBRETA_PICHON}` — se usa tal cual.)*

## C4 · `m10_mirage_fila` — los diez Mirage, las cúpulas vacías

**Dónde:** el último cuadro de Tandil. El regalo que llegó tarde, sostenido en silencio.

```
[AIRE] Ten identical delta-wing fighter jets parked in a neat row on a frosted
apron at first light, seen from a low three-quarter angle down the line, their
canopies all closed and empty, their turbines cold, brand new and unmarked by use,
a freshly painted blue-and-white argentine roundel on each. Low orange sun raking
across the frost, long shadows, green hills behind. NOBODY IN THE FRAME. Empty,
waiting, quiet. 16:9. Argentina 1982, no modern equipment, no NATO or US insignia,
no national flag. No text, no watermark, no signature.
```

## C5 · `m12_tallado` — el VAMOS A VOLVER tallado en la viga

**Dónde:** M12, después de la muerte de Correa.
**⚠ Lleva texto tallado, y acá el texto SÍ va en la imagen** — es un objeto, no una interfaz,
y tiene que verse hecho con una navaja.

```
[AIRE] Extreme close-up of a rough wooden beam shoring up the wall of a muddy
trench, lit by grey daylight from above: cut into the wood with a knife, in crooked
uneven capital letters gouged deep and pale against the dark damp timber, the words
"VAMOS A VOLVER" on one line and "LOS PIBES DE MALVINAS" on the line below. The
letters are clumsy, carved with effort, splinters raised at the edges. Wet peat and
mud around. NOBODY IN THE FRAME. 16:9. Argentina 1982. No other text, no watermark,
no signature.
```

## C6 · `m13_carta_locker` — la carta contra el fondo del locker

**Dónde:** M13, la noche del asado. El jugador la ve y **no la lee** hasta el Final A.

```
[AIRE] EXTREME CLOSE-UP taken from right in front of the open door of ONE personal
steel locker, so close that the inside of that single compartment FILLS THE WHOLE
FRAME, edge to edge. NO neighbouring lockers are visible anywhere — not to the left,
not to the right, not in the background. The camera is right up against the opening
and there is no room in the frame for anything else.

THE COMPARTMENT IS NARROW, and here is how narrow: it is only just wide enough to
hold a flight helmet and a folded jacket side by side on its shelf, with barely a
hand's width left over. Those two objects nearly span its full width. It is much
taller than it is wide.

On the shelf: a white flight helmet lying on its side, and a folded flight jacket
beside it. Standing on the floor of the compartment below them, leaning against the
back wall: a small cheap cream paper envelope, unsealed with its flap tucked in,
about half the height of the helmet.

Dim light falling in from one side, the back of the compartment in shadow. The
envelope is BLANK — no writing, no letters, no words on it. NOBODY IN THE FRAME.
Empty, waiting, quiet. 16:9. Argentina 1982, no modern equipment. No text, no
watermark, no signature.
```

## C7 · `final_monte` — el monte apagado

**Dónde:** M14, después de la salva. Lo que Tero sobrevuela sin entender.

```
[AIRE] Aerial view looking down at a low peat hillside at dawn from a low-flying
aircraft: fresh shell craters torn in the dark earth, columns of grey smoke drifting
sideways in the wind, scattered debris, everything backlit by a cold orange sunrise
low on the horizon. Silent, still, over. NOBODY IN THE FRAME. Empty, waiting, quiet.
16:9. Argentina 1982, no modern equipment, no national flag. No text, no watermark,
no signature.
```

## C8 · `mesa_dos_papeles` — los dos papeles enfrentados

**Dónde:** el **Final A**. El marco del juego, revelado.

```
[AIRE] Overhead close-up of a formica kitchen table with a plastic tablecloth,
years later: two things laid side by side and squared up neatly, like two pieces of
cutlery set for a meal.

ON THE LEFT, lying closed: a classic argentine "Rivadavia" school exercise book. A
stiff card cover in pale cream sage-green, swollen and damp-wrinkled, corners gone
soft and round from handling, faint brown water stains creeping in along one edge.
Printed on the cover in dark sepia brown: a small upright rectangular heraldic
emblem centred near the top — an oval crest holding a set of scales, an open book
and laurel branches, with a border of lettering around it — and below it, large
across the middle of the cover, a flowing handwritten-style signature logo. Two tiny
lines of small print near the bottom corners.

ON THE RIGHT, lying flat: a single sheet of military block paper, soft and furred
along its fold lines, the four folds still visible as creases.

A chipped cup of tea to one side. Flat grey afternoon light from a window.

ALL LETTERING IS ILLEGIBLE. The emblem, the signature logo and the small print are
drawn as SHAPES and marks only — suggested pixel forms with the rhythm of writing,
never actual readable words or letters. The sheet of paper on the right is
completely BLANK.

NOBODY IN THE FRAME. Empty, waiting, quiet. 16:9. No readable text, no watermark, no
signature.
```

### Corregir sin regenerar — encuadre

Si una placa salió bien de estilo pero mal de encuadre —como pasó con el locker— no hace falta
rehacerla:

```
Keep this image exactly as it is - same style, same colours, same lighting, same
objects. Change only the framing: move the camera much closer so that the single
open locker compartment fills the entire frame edge to edge, and crop out every
neighbouring locker completely. The compartment must read as narrow: the helmet and
the folded jacket should nearly span its full width. Do not redraw anything else.
```

---

# BLOQUE D — LOS QUE ESPERAN AL PASO 3 *(llevan gente)*

Estos cuadros **no se pueden cerrar todavía** porque su contenido son personas. Se hacen
cuando estén las figuras, componiendo sobre una placa. Quedan anotados para no perderlos:

| Cuadro | Dónde | Sobre qué placa se compone |
|---|---|---|
| El terito fresco bajo la cabina | M1 | `linea_amanecer` |
| La Chancha enganchada bajo fuego | M6 | cuadro propio, de noche y en el aire |
| El locker completo — la cuenta | M7 | `vestuario` + figuras |
| El paso del terito · la cara de Mateo · la multitud | M8 | cuadro propio, desde tierra |
| La escarapela fresca · el Hércules batiendo las alas | M10 | `tandil` + figuras |
| El corte a tierra — la muerte de Correa | M12 | cuadro propio, en el pozo |
| El pibe frente a la vitrina · la mano en el vidrio | post-créditos | `museo` + figura |

---

# Enganchado en el motor

Las 32 placas ya están instaladas y el juego las usa. Tres cosas para saber:

- **Van en WEBP, no en PNG.** `tools/install_placas.py` toma los originales de `assets/plates/`
  (jpeg o png, como salgan del generador), los escala a 960×540 y escribe el `.webp` al lado.
  Los originales quedan intactos. 114 MB → 2,8 MB. Correr el script de nuevo cada vez que se
  agregue o regenere una placa.
- **No se recortan.** El script escala sin deformar ni recortar, y `render/screens.js` centra la
  placa respetando su forma. Las páginas del cuaderno son 3:4 vertical: recortarlas al 16:9 les
  comía la mitad. Una hoja vertical queda centrada con negro a los costados, que es como se ve
  una hoja sobre una pantalla.
- **Qué placa le toca a cada pantalla lo dice `src/data/placas.js`**, no `strings.js`. Las 76
  pantallas del guion piden su CUADRO propio (`img: 'M6_LOCKER1'`), que es el paso 3 y todavía no
  existe; esa tabla dice en qué LUGAR pasa cada cuadro, así la escena se ve ambientada mientras
  tanto. Cuando el cuadro propio se genere, se le borra la línea a la tabla y el cuadro gana solo.

**Placas generadas sin pantalla que las use todavía:** `museo`, `jazminero`, `cocina_calida`,
`p1b_sapito`, `p2b_cocina_gris`, `p3c_puerta`, `m10_mirage_fila`, `m12_tallado`. Son escenas del
guion que aún no tienen pantalla en `strings.js`. **Falta generar:** `p4_hoja` (B1) — mientras no
esté, las cartas de Mateo usan `p1c_cuaderno`.

---

# El mapa — qué placa usa cada misión

`briefing` y `epílogo` son las dos pantallas de aire de cada misión; `cuaderno` es siempre
`p4_hoja` con su capa de tinta encima.

| Misión | Briefing | Epílogo | Cuadro propio |
|---|---|---|---|
| **P.1** | *(placas propias del prólogo)* | — | el arroyo, el sapito, el cuaderno |
| **P.2–P.4** | `cocina_calida` → `cocina_gris` | — | el teléfono, los papeles, la puerta |
| **M1** Sal en las alas | `linea_amanecer` | `linea_atardecer` | el terito fresco ⏳ |
| **M2** Bautismo de fuego | `linea_amanecer` | `hangar_noche` | — |
| **M3** El invento | `hangar_dia` | `hangar_dia` | — |
| **M4** El día que sangró el mar | `linea_amanecer` | `linea_atardecer` | `m7_foto_frente` *(2ª vez)* |
| **M5** El callejón | `linea_amanecer` | `linea_atardecer` | — |
| **M6** La bomba que no despertó | `linea_amanecer` | `linea_noche` | la Chancha ⏳ |
| **M7** 25 de Mayo | `linea_amanecer` | `vestuario` | `m7_foto_frente` · `m7_foto_dorso` |
| **M8** El batir de alas | `linea_amanecer` | `linea_atardecer` | el sobrevuelo ⏳ |
| **M9** El pibe | `linea_amanecer` | `hangar_noche` | `m9_libreta` |
| **M10** Los primos | `pista_lluvia` | `hangar_dia` | `tandil` · `m10_mirage_fila` |
| **M11** Lo que no se dice | `linea_amanecer` | `linea_atardecer` | — |
| **M12** El ángel Correntino | `linea_amanecer` | `linea_atardecer` | `m12_tallado` · el pozo ⏳ |
| **M13** La última mesa | `radio` | `fogon` | `m13_carta_locker` |
| **M14** El tero | `radio` | `linea_noche` · `cabina_noche` | `final_monte` |
| **Final A** | — | `cocina_gris` | `mesa_dos_papeles` |
| **Final B** | — | `cocina_calida` · `jazminero` | — |
| **Post-créditos** | — | `museo` | el pibe y la vitrina ⏳ |

⏳ = espera al paso 3 (lleva gente).

---

## Orden de producción

1. **`linea_amanecer`** — es la placa que más se ve del juego. Si esa sale bien, el estilo
   `[AIRE]` está validado y el resto sale.
2. Sus dos variantes de luz, **en la misma sesión**: `linea_atardecer` y `linea_noche`.
3. **`hangar_dia`** + `hangar_noche` — el segundo lugar más usado.
4. `radio`, `vestuario`, `fogon` — los tres que cargan las escenas más importantes del guion.
5. El resto, por orden de aparición.

**Con los primeros cinco, once de las catorce misiones ya tienen sus dos pantallas de aire.**
