# RASANTE — Los aviones de la escuadrilla *(hojas modelo + canon)*

> Cinco A-4B Skyhawk, uno por Fiel. **Mismo modelo para todos** — una escuadrilla vuela un
> solo tipo, y romper eso rompería la época — pero **ningún avión es igual a otro**, porque
> los aviones los cuida un solo hombre, el Turco, y el Turco no trata a dos pilotos igual.
>
> Regla heredada del guion, que ordena todo: **las estrellitas se pintan una por cada
> REGRESO, no por cada derribo.** Las pinta el Turco, con pincel finito, en los cinco
> aviones. Son la única marca común. Todo lo demás es de cada uno.

---

## Por qué el mismo modelo para los cinco

Tentación descartada: darle a cada piloto un avión distinto (un Mirage, un Dagger, un
Pucará). **No.** Una escuadrilla de caza-bombardeo vuela un solo tipo — mantenimiento,
repuestos, táctica y formación dependen de eso, y la Fuerza Aérea del 82 no mezclaba tipos
en una escuadrilla. La personalización va **adentro del mismo avión**: en la pintura, el
desgaste, las marcas chicas y la historia de cada célula. Que es, además, como fue siempre
en la realidad: el avión "de" un piloto es el mismo modelo que el del resto, pero él sabe
cuál es el suyo con los ojos cerrados.

**La regla de sprite:** cada avión necesita UNA marca legible a 20 píxeles, porque en vuelo
el jugador los ve chiquitos y de costado. Esa marca está definida en cada ficha. El resto
del detalle es para las cinemáticas y las hojas modelo.

**La regla de época:** nada de nose-art yanqui, ni bocas de tiburón, ni pin-ups. La FAA del
82 era sobria. Lo que hay acá son marcas chicas, a pincel, hechas por un mecánico que
quiere a sus pilotos — el tipo de cosa que un fotógrafo de 1982 podría haber encontrado sin
sorprenderse.

---

## 🟩 Por qué A-4B y no Super Étendard *(la decisión, escrita)*

La pregunta vuelve cada tanto y hasta ahora la respuesta no existía en ningún archivo. Queda
acá, porque ordena todo el resto del documento.

**No son dos aviones: son dos fuerzas peleando dos guerras distintas.**

| | **A-4B Skyhawk** | **Super Étendard** |
|---|---|---|
| Fuerza | **Aérea** — Grupos 4 y 5 de Caza | **Armada** — 2ª Escuadrilla Aeronaval |
| Cuántos | decenas | **cinco entregados** antes del embargo francés |
| Munición | bombas: hay que llegar encima | **cinco Exocet**, y se acabaron |
| Cómo atacaba | rasante hasta el buque, a metros | lanzaba a decenas de km y viraba |
| Pérdidas | altas, sostenidas | **ninguno perdido en combate** |

Con cinco misiles no se hace una campaña de catorce misiones. Y una escuadrilla que no pierde
aviones no tiene el arco de RASANTE: no hay desgaste, no hay Vasco, no hay Pichón.

### La razón que decide de verdad: el Exocet no tiene juego adentro

El juego se llama **RASANTE** y su mecánica entera es volar pegado al agua *hasta el blanco*,
soltar a quemarropa y volver con sal en las alas. El Super Étendard hacía lo contrario: subía,
encendía el radar unos segundos, disparaba a 30-50 km y se iba. **Nunca ve el barco.** Como
nivel, la acción aérea más famosa de la guerra es "volá cuarenta minutos, apretá un botón,
volvé".

Y hay una consecuencia peor: **con misil se muere el sapito.** La escena de M6 —Esteban
mirando la bomba bajo el ala, *"la piedra va tan pegada al agua que no se hunde; el problema
es que nosotros necesitamos que se hunda"*— solo existe porque tiene que soltar bombas bajo.
Sin bombas no hay tragedia de espoleta, no hay bombas que pegan y no explotan, y no hay
**LA ESPOLETA CORREGIDA** en el banco del Pichón.

### La razón narrativa: el Étendard era la máquina

La tesis de Puma en M2 es *"Ellos tienen la máquina. Nosotros tenemos las manos."* El A-4B es
un diseño de los 50 **sin radar** — de ahí sale Cóndor como radar humano, que es una mecánica
entera. El Super Étendard era el moderno: radar, misil antibuque, lo último que Francia había
vendido. **Ponerlo como el desvalido sería mentir.**

### La regla que sale de esto *(y que el proyecto ya venía aplicando sin escribirla)*

> **Cuando el hecho histórico es un Exocet, el jugador lo MIRA, no lo vuela.**

Ya está aplicada: el hundimiento del Sheffield vive en el storyboard como *"Cuadro M3.4 —
Splash: el Exocet"*, una cinemática, no un nivel. El Étendard no está excluido del juego —
está en `data/planes.js` como avión seleccionable de **misiones especiales**. El reparto
correcto es ese: **campaña = A-4B; el Étendard vive en los modos sueltos.**

> ⚠️ **Donde esto todavía chirría:** M8 tiene de boss el **Atlantic Conveyor**, que lo hundió
> un Exocet desde un Super Étendard. Ahí el guion le da a la escuadrilla un blanco que no era
> suyo. Está anotado en PREGUNTAS_HISTORICAS, pero conviene saber que **la fricción no es de
> fecha: es de arma y de fuerza.** No es urgente —el contenido real de M8 es el sobrevuelo, no
> el barco— pero si algún día se blinda, cambiar ese blanco por uno que sí hundieron los A-4
> cuesta una línea y no toca una sola escena.

> 📄 El resto del roster —qué es cada avión cargado, qué hizo de verdad y qué debería hacer en
> el juego— está en [AVIONES_CATALOGO.md](AVIONES_CATALOGO.md).

---

## Numeración — ⚠ cuidado histórico

Los A-4B de la FAA llevaban matrícula **C-2xx** en el fuselaje. Las de abajo son
**placeholders plausibles**: antes de fijarlas hay que **verificarlas contra la lista real
de células perdidas en Malvinas** — usar el número de un avión real derribado, con su
piloto real muerto, sería una falta de respeto. Agregar esta verificación a
PREGUNTAS_HISTORICAS.md. En las imágenes generadas **el número no se genera** (regla de "no
text"): se tipografía en el motor, así además se puede corregir sin regenerar.

---

# Las cinco fichas

## 1 · El avión de TERO *(Esteban — el que volás)* — "C-222"

**La historia:** el avión del jefe de la última misión. El que en M12 vuela sin indicativo,
como *Plata Fiel* a secas.

**Las marcas:**
- 🟥 **EL TERITO** *(3.0 — la marca más importante del juego)*: un tero **recortado en BLANCO
  MACIZO** bajo la cabina — una silueta llena, sin detalle adentro: patas largas, pecho al
  frente, gritón. 🟩 *(22/8: era "pintado a pincel en blanco y gris oscuro". Sobre el
  camuflaje verde-marrón eso se perdía, y de que se vea depende M8 entero. Una silueta blanca
  maciza es lo único que se lee a trescientos metros y a velocidad de pasada.)* "Tero" es su apodo de veinte
  años en la Fuerza y el pájaro lo siguió a cada avión que voló; el Turco se lo pinta en el
  Skyhawk la primera mañana. **Es la marca por la que Mateo reconoce a su padre en el
  sobrevuelo de M8** — tiene que ser legible en el flanco del avión cuando pasa a altura de
  árbol, y estar sembrada visualmente desde M1.
- **La fila de estrellitas** bajo la cabina, la más larga de la escuadrilla — no porque
  derribe más: porque **vuelve más**. La cuenta visible de un tipo que promete volver.
- Un **sapito**: una piedrita chata, real, alojada en el borde del parabrisas, del lado de
  adentro. Nadie sabe desde cuándo está. Él sí.
- Camuflaje gastado prolijo: limpio pero no lustrado. Un avión usado por un profesional.

**Marca de sprite (20 px):** 🟩 **el terito.** *(22/8: antes era la fila de estrellitas. Con el
camuflaje la silueta blanca es lo que más contrasta del avión, así que la marca de sprite y la
marca narrativa pasaron a ser la misma — que es como tendría que haber sido desde el principio:
lo que el jugador reconoce a 20 px es lo mismo que Mateo reconoce desde el pozo.)* **En
cinemáticas y planos cercanos: el terito** — a escala de sprite el tero puede reducirse a una manchita, pero en todo plano
donde el avión pase cerca (M8 sobre todo) tiene que leerse perfecto.

**Hoja modelo:**
```
Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug (SNK Neo Geo
era), hand-drawn sprite look, chunky black pixel outlines, rich dithered shading,
crisp clean pixels, no anti-aliasing, no photorealism, no 3D render.

Master reference sheet of an A-4B Skyhawk attack jet, full side profile on a
plain light background. Argentine Air Force camouflage: dark olive green and mid green
patches over brown, with a pale blue-grey belly. Worn but clean and well-kept,
blue-white argentine roundel, single seat. On the tail fin near the top, the
ARGENTINE FLAG in three horizontal bands - light blue, white, light blue - with
the golden Sun of May in the white band. Below the cockpit sill: a small
SOUTHERN LAPWING bird (tero) painted as a SOLID WHITE SILHOUETTE — a filled
white shape with no detail inside it, long legs, proud chest, wings half raised
as if crying out, naive folk-art shape, standing out sharply against the dark
camouflage — and next to it the LONGEST row of small
hand-painted plain white stars in the squadron, slightly uneven. A tiny flat
grey pebble resting inside the windscreen frame, barely visible. No shark mouth,
no other nose art, no pin-ups, no flags.

PERIOD LOCK — Argentina 1982: no modern weapons, no modern avionics, no NATO or
US markings, no invented unit patches.

16:9 landscape. No text, no letters, no numbers, no watermark, no signature.
```

---

## 2 · El avión de PUMA — "C-207"

**La historia:** el avión del jefe. Tercera generación de uniforme: todo reglamentario,
todo impecable, nada personal. **Su personalización es que no hay ninguna.** El Turco lo
sabe y se lo respeta: a este avión no se le agrega nada que no esté en el manual.

**Las marcas:**
- **Doble franja de conducción en la deriva** — la marca reglamentaria del jefe de
  escuadrilla. Pintada perfecta, enmascarada con cinta, sin un pelo fuera. 🟩 *(22/8: ahora
  es BLANCA. Eran "dos franjas oscuras", que sobre el camuflaje verde-marrón no existen.)*
- El avión **más prolijo** de los cinco: paneles alineados, sin chorreaduras, remaches
  limpios. Brilla apenas más que los otros.
- Sus estrellitas: en fila perfecta, equidistantes. (Las de los demás están apenas
  torcidas. Las de Puma no, porque el Turco sabe que él las mira.)

**Marca de sprite (20 px):** las dos franjas **blancas** en la cola.

**Hoja modelo:**
```
Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug (SNK Neo Geo
era), hand-drawn sprite look, chunky black pixel outlines, rich dithered shading,
crisp clean pixels, no anti-aliasing, no photorealism, no 3D render.

Master reference sheet of an A-4B Skyhawk attack jet, full side profile on a
plain light background. Argentine Air Force camouflage: dark olive green and mid green
patches over brown, with a pale blue-grey belly. The CLEANEST and most immaculate
aircraft of the squadron: the camouflage pattern is sharp and evenly applied, no
streaks, no stains, regulation finish. TWO neat WHITE command stripes painted
across the tail fin, masked and crisp, standing out hard against the camouflage. Below the cockpit, a short row of small white stars painted in
a PERFECTLY straight, evenly spaced line. Nothing personal anywhere else, strictly
by the book. No nose art, no flags.

On the tail fin near the top, the ARGENTINE FLAG in three horizontal bands -
light blue, white, light blue - with the golden Sun of May in the white band.

PERIOD LOCK — Argentina 1982: no modern weapons, no modern avionics, no NATO or
US markings, no invented unit patches.

16:9 landscape. No text, no letters, no numbers, no watermark, no signature.
```

---

## 3 · El avión del GITANO — "C-239"

**La historia:** el único avión de la escuadrilla con nombre propio, y el único con el
acento rojo de la paleta. El Gitano habla en el potrero: *"cuando el rival tiene botines y
vos estás descalzo, gambeteás más pegado"*. El Turco le pintó el nombre una noche, sin
avisarle: **GAMBETA**, chiquito, bajo la cabina. El Gitano lo vio a la mañana y no dijo
nada, pero ese día voló mejor.

**Las marcas:**
- **La punta de la nariz pintada de rojo** — un anillo angosto, a pincel. El único rojo de
  la escuadrilla (la paleta del juego permite "a single red accent when noted": es este).
- El nombre **GAMBETA** bajo la cabina *(se tipografía en el motor, no se genera)*.
- Un **matecito verde chiquito** pintado junto a la escalerilla — la marca del cebador
  oficial de la escuadrilla.
- Desgaste alegre: chorreaduras de aceite, panza sucia. Un avión que se usa mucho y se
  lustra poco.

**Marca de sprite (20 px):** la nariz roja.

**Hoja modelo:**
```
Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug (SNK Neo Geo
era), hand-drawn sprite look, chunky black pixel outlines, rich dithered shading,
crisp clean pixels, no anti-aliasing, no photorealism, no 3D render.

Master reference sheet of an A-4B Skyhawk attack jet, full side profile on a
plain light background. Argentine Air Force camouflage: dark olive green and mid green
patches over brown, with a pale blue-grey belly. Well-used and cheerfully scruffy:
oil streaks along the belly, scuffed panels, a hard-working aircraft. The TIP OF
THE NOSE CONE painted with a narrow hand-brushed RED ring — the only red accent
in the squadron. Next to the cockpit boarding step, a tiny hand-painted green
mate gourd with a little metal straw, naive and small. Below the cockpit, a row
of small white stars, slightly crooked. Clear space under the cockpit sill where
a small name will be added later. No shark mouth, no pin-ups, no flags.

On the tail fin near the top, the ARGENTINE FLAG in three horizontal bands -
light blue, white, light blue - with the golden Sun of May in the white band.

PERIOD LOCK — Argentina 1982: no modern weapons, no modern avionics, no NATO or
US markings, no invented unit patches.

16:9 landscape. No text, no letters, no numbers, no watermark, no signature.
```

---

## 4 · El avión del VASCO — "C-214"

**La historia:** el avión sin nada. Ni nombre, ni marca, ni adorno — igual que el dueño,
que tiene el locker cerrado y la foto adentro. **Su personalización es la ausencia**, y en
formación se lo reconoce por eso: es el limpio de marcas y el más oscuro de tono, con los
paneles más curtidos.

Pero hay una cosa, una sola, y no la hizo el Turco: **una crucecita blanca, chiquita,
pintada a mano detrás del riel de la cabina**, donde solo la ve el que sube. Se la pintó él
mismo, con el pincel del Turco, sin pedir permiso. El Turco la encontró un día y no dijo
nada. *(Después de M6, el Turco la repasa con pincel finito cada vez que le toca pintar
estrellitas en los otros aviones. Tampoco se lo cuenta a nadie.)*

**Las marcas:**
- **Ninguna visible.** Célula más vieja, metal más oscuro y apagado que el resto.
- La crucecita blanca tras el riel de cabina — invisible a distancia de sprite, presente en
  toda cinemática que muestre a alguien subiendo.
- Sus estrellitas: las pinta el Turco igual que a todos. Es lo único que el Vasco acepta.

**Marca de sprite (20 px):** ser el único SIN marca — el gris más oscuro de la formación.

**Hoja modelo:**
```
Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug (SNK Neo Geo
era), hand-drawn sprite look, chunky black pixel outlines, rich dithered shading,
crisp clean pixels, no anti-aliasing, no photorealism, no 3D render.

Master reference sheet of an A-4B Skyhawk attack jet, full side profile on a
plain light background. Argentine Air Force camouflage: dark olive green and mid
green patches over brown, with a pale blue-grey belly. The OLDEST and most
weathered airframe of the squadron — its camouflage is SUN-BLEACHED and chalky,
the pattern washed out and its edges gone soft, while every other aircraft's is
sharp:
darker, duller grey metal, heavily worn panels, faded roundel. NO personal
markings of any kind, completely anonymous. Below the cockpit, a short row of
small white stars, the only marking it carries. Behind the cockpit rail, almost
invisible, a TINY hand-painted white cross, small and private, visible only up
close. No nose art, no name, no flags.

On the tail fin near the top, the ARGENTINE FLAG in three horizontal bands -
light blue, white, light blue - with the golden Sun of May in the white band.

PERIOD LOCK — Argentina 1982: no modern weapons, no modern avionics, no NATO or
US markings, no invented unit patches.

16:9 landscape. No text, no letters, no numbers, no watermark, no signature.
```

---

## 5 · El avión del PICHÓN — "C-231"

**La historia:** al pibe le dieron el peor avión, porque así funciona el mundo: el último
en llegar hereda la carcacha. Es el avión **reconstruido** de la escuadrilla — el Turco lo
armó con paneles de tres células distintas, y se nota: parches de tonos que no coinciden,
un panel de ala todavía en imprimación verde.

Y entonces pasó lo que nadie esperaba: el Pichón, que entiende el aire mejor que nadie,
**lo fue arreglando en secreto**. Carenados chiquitos no reglamentarios, una toma de aire
retocada, cosas de la libreta. En los paneles quedan **fórmulas a lápiz de carpintero,
medio borradas** — escribe, prueba, borra con la manga. El Turco las encontró y las dejó:
*"eso no se puede… a ver, mostrame."* **La carcacha termina siendo el avión más fino de la
escuadrilla, y nadie lo dice en voz alta.**

🟥 **Su final (3.5, M10):** el C-231 **no vuelve a volar**. La mañana después de la muerte
del Pichón, el Turco lo abre en canal en la línea de vuelo y **le saca las piezas buenas**
para los tres que quedan: la bomba de nafta al del Gitano, el equipo de radio al de Tero,
los frenos a repuesto. *"A él ya no le hace falta, m'hijo. A ustedes sí. Así el changuito
sale igual. En los tres."* **El avión más fino de la escuadrilla termina repartido adentro
de sus amigos.** Para el arte: a partir de M10 el C-231 aparece de fondo como carcasa
abierta, paneles en el piso, el número todavía pintado en la trompa.

**Las marcas:**
- **Un panel de ala en imprimación GRIS y dos parches de metal desnudo**, sin camuflar — la
  marca de sprite perfecta. 🟩 *(22/8: era "verde imprimación", que sobre un camuflaje verde
  desaparecía. Un panel sin pintar sobre camuflaje CANTA más que sobre metal plateado, así que
  el cambio la mejora.)*
- Parches de chapa de tonos desparejos por todo el fuselaje.
- Trazos de lápiz de carpintero en los paneles, medio borrados.
- Carenados y detalles aerodinámicos chiquitos que ningún otro A-4 tiene.
- Sus estrellitas: pocas — es nuevo. La primera se la pintó el Turco tras M2: *"Esa no es
  del avión. Es tuya."*

**Marca de sprite (20 px):** el panel verde en el ala.

**Hoja modelo:**
```
Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug (SNK Neo Geo
era), hand-drawn sprite look, chunky black pixel outlines, rich dithered shading,
crisp clean pixels, no anti-aliasing, no photorealism, no 3D render.

Master reference sheet of an A-4B Skyhawk attack jet, full side profile on a
plain light background. Argentine Air Force camouflage: dark olive green and mid green
patches over brown, with a pale blue-grey belly. A REBUILT patchwork airframe:
several mismatched replacement panels in slightly different shades, one wing
panel still in flat GREY primer plus two bare unpainted metal repair
patches, never camouflaged over - they stand out hard against the pattern. Faint half-erased carpenter-pencil
marks and little formulas sketched on some panels. A few small non-standard
hand-made aerodynamic fairings, subtle and neat, unique to this aircraft. Below
the cockpit, a very SHORT row of small white stars, just two or three. It looks
like the worst aircraft of the squadron and is secretly the finest. No nose art,
no flags.

On the tail fin near the top, the ARGENTINE FLAG in three horizontal bands -
light blue, white, light blue - with the golden Sun of May in the white band.

PERIOD LOCK — Argentina 1982: no modern weapons, no modern avionics, no NATO or
US markings, no invented unit patches.

16:9 landscape. No text, no letters, no numbers, no watermark, no signature.
```

---

## 🟩 HOJA DE AVIÓN CON NANO BANANA — regenerar a partir de imágenes

Las cinco hojas de arriba son prompts **de texto**: describen el avión de cero y confían en
que el modelo sepa qué es un A-4B. Nano Banana (Gemini Image) trabaja distinto y mejor para
esto: **ve las imágenes que le das y le podés asignar un rol a cada una.** Eso permite pedir
algo que un prompt ciego no puede — *la silueta de esta foto, el estilo de esta otra, las
marcas de este texto* — y elimina de un saque el problema más caro de las hojas actuales:
que el modelo se invente la forma del avión.

### Qué se le da de comer, y en qué orden

El orden importa: Nano Banana pondera más las primeras imágenes.

| # | Imagen | Rol | De dónde sale |
|---|---|---|---|
| 1 | **Foto real de un A-4B en perfil** | LA FORMA. Manda sobre todo lo demás. | Foto de archivo — de perfil puro, ala completa, sin gente ni fondo cargado |
| 2 | **Un sprite de Metal Slug** (vehículo, no personaje) | EL ESTILO. Contorno, dithering, disciplina de paleta. | Referencia de estilo |
| 3 | *(opcional)* **La hoja que se reemplaza** | EL ENCUADRE. Nada más: ni forma ni color. | `docs/historia/characters_examples/tero_avion.png` o `assets/planes/a4-skyhawk/source.png` |

> ⚠ **La 3 es opcional y peligrosa.** Si le das la hoja vieja, el modelo tiende a copiarle
> los errores. Dásela solo si lo que querés conservar es la composición; si querés una hoja
> mejor, no se la des.

### El prompt

Va en castellano-neutro/inglés indistinto — Nano Banana entiende los dos. Se pega tal cual y
se reemplaza **solo el bloque `[MARCAS]`**.

```
You are given reference images. Use each one for one job only:

IMAGE 1 is the AIRFRAME REFERENCE. Copy its shape exactly and do not stylize it
away: the short stubby nose, the low delta wing planform, the twin side air
intakes below and behind the canopy, the tall swept tail fin, the tricycle
landing gear, the single seat bubble canopy, the overall stocky proportions.
This is a real Douglas A-4B Skyhawk and the silhouette must stay accurate.
If anything in my description conflicts with this shape, the shape wins.

IMAGE 2 is the ART STYLE REFERENCE. Copy its rendering technique only, never its
subject: 90s arcade run-and-gun pixel art, hand-drawn sprite look, chunky dark
pixel outlines around every shape, rich dithered shading in visible pixel
clusters, a small disciplined palette, crisp hard pixel edges. No smooth
gradients, no anti-aliasing, no soft airbrush, no photographic texture, no 3D
render lighting, no bloom, no lens effects.

Now draw a MASTER REFERENCE SHEET of that aircraft: one single aircraft, full
LEFT SIDE PROFILE, perfectly side-on with zero perspective and zero three-quarter
angle, centred, filling most of the frame, on a plain flat light neutral
background with no scenery, no ground, no sky gradient and no shadow.

Finish and markings:
- Argentine Air Force camouflage: dark olive green and mid green patches
  over brown, with a pale blue-grey belly, worn from use but cared for. Panel
  lines and rivets visible as pixel detail, not as photographic texture.
- One blue-and-white Argentine roundel on the fuselage.
  ON THE VERTICAL TAIL FIN, near the top: the ARGENTINE FLAG painted as three
  horizontal bands - light blue, white, light blue - with the golden Sun of May
  centred in the white band. This marking is IDENTICAL on every aircraft of the set
  and must always be present. It is the only insignia they all share.
[MARCAS]

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern missiles or
guided weapons, no modern avionics or antennas, no NATO or United States
markings, no invented squadron patches, no digital camouflage, no stealth
shaping.

ABSOLUTELY NO TEXT of any kind anywhere in the image: no serial numbers, no
letters, no labels, no callouts, no arrows, no legend, no measurements, no
watermark, no signature. If you feel the urge to label anything, leave it blank.

16:9 landscape.
```

### El bloque `[MARCAS]` de cada avión

Se pega en lugar de `[MARCAS]`. Es lo único que cambia entre las cinco hojas.

**TERO — C-222**
```
- Below the cockpit sill, hand-painted with a fine brush in white and dark grey
  in a naive folk-art style: a small SOUTHERN LAPWING bird - the argentine
  "tero". Long thin legs, proud puffed chest, a thin crest feather at the back
  of the head, wings half raised as if it were crying out. It is a lapwing, not
  an eagle and not a heraldic bird. It must read clearly at a glance.
- Next to it, the LONGEST row of small hand-painted plain white stars in the
  squadron, in a slightly uneven line.
- A tiny flat grey pebble resting inside the windscreen frame, barely visible.
- No shark mouth, no pin-up, no flag, no other nose art.
```

**PUMA — C-207**
```
- The CLEANEST and most immaculate aircraft of the five: perfectly aligned
  panels, no streaks, no oil stains, regulation finish, very slightly glossier
  than the others.
- TWO neat dark command stripes painted across the tail fin, crisply masked.
- A short row of small white stars in a PERFECTLY straight, evenly spaced line.
- Nothing personal anywhere. Strictly by the book. No nose art of any kind.
```

**GITANO — C-239**
```
- Cheerfully scruffy: visible oil streaks trailing back from the panel joints,
  a working aircraft that nobody polishes.
- A narrow hand-brushed red ring painted around the very tip of the nose.
- A tiny painted green mate gourd next to the boarding step.
- A crooked, uneven row of small white stars.
```

**VASCO — C-214**
```
- The OLDEST and most weathered airframe of the five: its camouflage is
  SUN-BLEACHED and chalky, the pattern washed out with soft blurred edges, while
  every other aircraft's is sharp. The roundel is visibly faded. 🟩 (22/8: antes
  era "el metal más oscuro"; sobre camuflaje eso no distingue nada — todos son
  oscuros. Lo que lo separa ahora es la SATURACIÓN: el suyo está lavado.)
- Absolutely NO personal markings anywhere - this aircraft is deliberately bare.
- A short row of small white stars.
- One tiny white hand-painted cross behind the cockpit rail, small enough to
  miss.
```

**PICHÓN — C-231**
```
- A REBUILT PATCHWORK airframe: mismatched replacement panels in slightly
  different shades of grey, visible repair seams, one wing panel left in flat
  grey primer plus bare unpainted metal repair patches, never camouflaged over -
  on a camouflaged aircraft an unpainted panel stands out hard.
- Faint pencil marks and half-erased handwritten-looking scribbles on two
  panels - as marks and smudges only, never readable text.
- Two or three small non-standard fairings and fillets that no other A-4 has,
  clearly hand-made.
- Only two or three white stars. It is the newest pilot.
```

### Cómo se corrige — la parte que hace que valga la pena

**No regenerar. Editar.** Es en lo que Nano Banana es mejor que cualquier otro modelo: le
das la imagen que salió y le pedís UN cambio. Las hojas de arriba salían a fuerza de
rerolls; ésta se arregla hablando.

```
Keep this image exactly as it is - same aircraft, same pose, same style, same
background, same colours. Change only this one thing: [EL ARREGLO].
Do not redraw anything else.
```

Arreglos típicos, en el orden en que suelen aparecer:

| Sale mal | El arreglo que se le pide |
|---|---|
| Lo dibujó en tres cuartos | `rotate the aircraft to a perfectly flat side-on profile with zero perspective` |
| Quedó fotográfico / con brillos suaves | `redraw the shading as hard dithered pixel clusters with a chunky dark outline, remove every smooth gradient and every specular highlight` |
| El tero parece un águila | `replace the painted bird with a SOLID WHITE FILLED SILHOUETTE of a southern lapwing, no detail inside the shape: long thin legs, puffed chest, thin crest at the back of the head, wings half raised` |
| Le puso números o etiquetas | `remove every letter, number and label from the image and leave those areas blank` |
| Le inventó misiles modernos | `remove all weapons and pylons; leave the wings and fuselage clean` |
| Le puso escarapela de EEUU/OTAN | `the only insignia is one Argentine blue-and-white roundel on the fuselage; remove everything else` |

### Lo que hay que mirar antes de dar una hoja por buena

Vale el mismo checklist de más abajo, más tres cosas propias de generar desde imágenes:

- [ ] **La silueta sigue siendo un A-4B.** Es el error que este método vino a resolver: si
      el modelo se comió las tomas de aire laterales o le estiró la trompa, no sirve por más
      linda que esté.
- [ ] **Las cinco hojas se hicieron con las MISMAS imágenes 1 y 2.** Cambiar la referencia de
      estilo a mitad de camino da cinco aviones que no parecen de la misma escuadrilla — que
      es justamente lo que este documento existe para evitar.
- [ ] **Cero texto.** Nano Banana es bueno escribiendo, y por eso rotula sin que se lo pidan.
      Mirar bien las zonas de cola y trompa.

---

## 🟥 MARCAS PERSONALES — la segunda capa *(el piloto, no el avión)*

Cada Fiel lleva además **una marca visual sobre sí mismo** — casco, traje o costumbre — que
lo identifica en cinemáticas aunque el avión no esté en cuadro. Regla de época: los pilotos
del 82 personalizaban poco y a mano; nada de calcos brillantes.

> **⚠ REGLA DE PROTECCIÓN — leer antes de agregar nada:** **el terito es EL ÚNICO animal
> pintado en toda la escuadrilla.** Ni pumas, ni gitanos con pájaros, ni mascotas en los
> cascos. Dos razones: (1) el reconocimiento de M8 depende de que un pájaro pintado
> signifique UNA sola cosa — si hay bichos por todos lados, Mateo no puede estar seguro y
> el momento se muere; (2) el canon de nombres dice que las aves viven en la radio y solo
> Tero y Pichón son aves "humanas" — llenar los aviones de fauna rompe ese sistema
> silencioso. Las marcas de los demás son geométricas, de objeto o de costumbre. Nunca
> animales.

| Piloto | Marca en el avión *(ya definida)* | 🟥 Marca personal *(casco / traje / costumbre)* |
|---|---|---|
| **Tero** | el terito + estrellitas + piedrita | Casco blanco **sin nada** — el hombre más marcado de la escuadrilla lleva el casco más pelado. Su marca vuela en el fuselaje, no en la cabeza. |
| **Puma** | doble franja en la deriva | **Dos franjas finas pintadas en el casco**, espejo de las de su cola — reglamentarias, perfectas, enmascaradas con cinta. Y el pañuelo de vuelo siempre anudado igual, milimétrico. |
| **Gitano** | nariz roja + GAMBETA + matecito | **Una franja roja torcida en el casco** — se la pintó él mismo, a pulso, mal a propósito ("derechita la pintan los ingleses"). Y el mate atado con alambre al arnés, asomando. |
| **Vasco** | sin marcas, el gris más oscuro | Casco **sin marca**, como el de Tero — pero con el barbijo del rosario asomando por el borde del cuello. La crucecita del riel es su única pintura, y no está a la vista. |
| **Pichón** | panel verde + trazos de lápiz | **El lápiz de carpintero cruzado bajo la cinta del casco**, siempre, como un albañil. Y fórmulas a medio borrar en el DORSO de la mano izquierda — se anota ahí cuando no llega a la libreta. |
| **El Turco** | *(no vuela)* | La gorra de paño con una **estrellita blanca pintada** — la única estrellita que no está en un fuselaje: se la pintó la noche que volvieron todos por primera vez. |

**Uso en producción:** estas marcas van a las hojas de personaje (PROMPTS_HOJAS_PERSONAJE)
como línea extra del descriptor de cada uno, y son **obligatorias en toda cinemática de
hangar o cabina** — son lo que permite reconocer a un piloto con el casco puesto, que en
cabina es la única cara que hay.

---

## La tabla para el storyboard *(tokens nuevos)*

Agregar a la tabla de tokens de STORYBOARD_1 — el `{SKYHAWK}` genérico queda para planos
lejanos; en cuadros donde se sepa de quién es el avión, usar el específico:

| Token | Descriptor corto (pegar tal cual) |
|---|---|
| `{SKYHAWK_TERO}` | A-4B Skyhawk, argentine flag on the tail fin, argentine air force green-and-brown camouflage, worn, argentine roundel, a small SOLID WHITE SILHOUETTE of a southern lapwing bird (tero) below the cockpit next to the longest row of small white stars, a tiny flat pebble inside the windscreen frame |
| `{SKYHAWK_PUMA}` | A-4B Skyhawk, argentine flag on the tail fin, immaculate regulation green-and-brown camouflage sharply applied, two crisp WHITE command stripes on the tail fin, a perfectly straight short row of small white stars |
| `{SKYHAWK_GITANO}` | A-4B Skyhawk, argentine flag on the tail fin, cheerfully scruffy green-and-brown camouflage with oil streaks, a narrow hand-brushed red ring on the nose tip, a tiny painted green mate gourd by the boarding step, crooked row of white stars |
| `{SKYHAWK_VASCO}` | A-4B Skyhawk, argentine flag on the tail fin, the oldest airframe, its camouflage sun-bleached and chalky with the pattern washed out, no personal markings at all, faded roundel, a short row of white stars, a tiny white hand-painted cross behind the cockpit rail |
| `{SKYHAWK_PICHON}` | A-4B Skyhawk, argentine flag on the tail fin, rebuilt patchwork airframe with mismatched camouflage panels that do not line up, one wing panel in flat grey primer and two bare metal patches never painted over, faint pencil marks on panels, small non-standard fairings, only two or three white stars |

---

## Los momentos que esto habilita *(gratis, ya estaban en el guion)*

- **M7, "los cuatro aviones donde había cinco":** ahora ese cuadro duele más, porque el
  hueco en la línea de vuelo no es un avión menos — es **el gris oscuro sin marcas** que ya
  no está. El jugador lo reconoce sin que nadie diga nada.
- **El tarrito que queda abierto toda la noche** (M7): las estrellitas son por REGRESO. La
  estrellita que no se pinta esa noche es la del C-214.
- **M13, el hangar del asado:** los tres aviones que quedan, juntos y a oscuras. Tres
  personalidades estacionadas. No hace falta diálogo.
- **Idea opcional para M12** *(decisión de Matías, no canon todavía)*: el Turco prepara el
  avión de Esteban para la última misión con **repuestos de los otros** — un panel del
  C-231 con un cálculo a lápiz del Pichón, un carenado, la crucecita repasada en el riel.
  *Plata Fiel* vuela con un pedazo de cada uno. Si se adopta, se anota en el guion; si no,
  se descarta y listo.

---

## Producción

1. Generar las **cinco hojas modelo** con los prompts de arriba (Image Generation, sin
   costo de video). **Los cinco prompts son autocontenidos: se copia el bloque entero y
   va, sin nada que reemplazar.** Aprobarlas contra la checklist: ¿marca de sprite
   legible? ¿nada moderno? ¿sin texto?
2. Los **números C-2xx y el nombre GAMBETA se tipografían en el motor** — nunca en la
   generación.
3. Verificar los números contra la lista real de pérdidas (→ PREGUNTAS_HISTORICAS.md).
4. Usar cada hoja como *image reference* en todo cuadro donde aparezca ese avión.

### Checklist de aprobación por hoja *(pausar y mirar antes de dar por buena)*

| Avión | Lo que TIENE que verse | Lo que NO puede aparecer |
|---|---|---|
| Tero | **El terito pintado, legible** + fila de estrellitas LARGA + piedrita en el parabrisas | Estrellas gigantes tipo USAF; bandera; que el tero parezca un logo moderno — es pincel, no calcomanía |
| Puma | Dos franjas nítidas en la deriva; el más limpio de los cinco | Cualquier marca personal extra |
| Gitano | Anillo rojo SOLO en la punta de la nariz; matecito chico junto al estribo | Boca de tiburón; rojo en otra parte; nose-art grande |
| Vasco | Camuflaje DESTEÑIDO y calcáreo, el patrón lavado, contra el de todos los demás que está nítido; NADA visible salvo estrellitas; crucecita mínima tras el riel | Cualquier adorno; la cruz grande o llamativa |
| Pichón | Panel de ala VERDE imprimación; parches de tonos desparejos; 2-3 estrellitas apenas | Un avión prolijo; el panel verde enorme o fosforescente |

Y para los cinco: roundel argentino (celeste-blanco), nada moderno, sin texto ni números —
si el generador mete letras, se regenera o se limpian en edición.

---

## 🟩 LAS ESTRELLITAS DEL TURCO — la regla, para que no se vuelva a pintar mal *(29/8)*

**UNA estrellita por avión y por vuelta.** No es una fila que se pinta de golpe: las "cinco
estrellitas" del epílogo de M1 son **cinco aviones, una cada uno**. Un avión con cinco
estrellas en la misión 1 estaría diciendo que ya volvió cinco veces.

**Dos contadores, en direcciones opuestas:**

- **Estrellas por avión: SUBEN.** Una por misión sobrevivida. Después de M1 hay 1; después de
  M4, 4.
- **Aviones que se pintan: BAJAN.** Cuando alguien no vuelve, ese avión deja de sumar.

**El cruce de los dos es M7:** *"hay una estrellita que hoy no se pinta. El tarrito queda
abierto toda la noche."*

**⚠ No confundir con las 1–4 estrellas de puntaje por nivel** (`freezeRun()`, ROADMAP): esas
son HUD y no tienen ninguna relación. Para hablar de éstas, decir siempre **"las estrellitas
del Turco"**.

**🟩 Producción: las dibuja EL MOTOR.** Se genera **una sola placa de fuselaje SIN estrellas**
y el juego pinta las que correspondan según el contador de ese avión. El número es dato, no
arte — y el momento de M7 sale gratis: el motor no incrementa ese contador y el jugador ve el
hueco. Ver PROMPTS_VN_M1_M3 · M1.e.
