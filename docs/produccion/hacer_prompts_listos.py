#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Arma los DOS documentos de prompts listos para pegar:
   historia/PROMPTS_AIRE_LISTOS.md   y   historia/PROMPTS_TIERRA_LISTOS.md
Cada prompt sale ENSAMBLADO: bloque de estilo + reglas + escena + candado. Se copia y se pega.
    python3 produccion/hacer_prompts_listos.py
"""
import os
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

AIRE = """Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug (SNK Neo Geo
era), hand-drawn sprite look, chunky black pixel outlines, rich dithered shading, saturated
military palette of olive drab, steel blue-grey, silver and warm sand, dramatic cinematic
composition, crisp clean pixels, no anti-aliasing, no photorealism, no 3D render, no smooth
digital painting."""

EPOCA = """Argentina 1982, argentine latin-american faces, no modern military equipment, no
NATO or US insignia, no invented unit patches, no national flag on clothing. No text, no
watermark, no signature."""

VACIA = "NOBODY IN THE FRAME - they just walked away, everything still warm."

TINTA = """ONE PEN, ONE COLOUR, NO EXCEPTIONS. Every single line, letter, dot, arrow,
hatch and scribble on the page is drawn with THE SAME ORDINARY BLUE BALLPOINT PEN - the blue
Bic he carries in his pocket. He does not own coloured pens: he has a notebook and one blue
biro, and that is all.
THE ONLY TWO COLOURS HE PUT ON THE PAGE ARE THE BLUE OF THAT INK AND THE CREAM OF THE PAPER.
(The paper's own PRINTED pale grey-blue ruling and the black metal of the binding are part of
the notebook itself, not part of his drawing, and they stay as they are.)
NOTHING is coloured in, NOTHING is filled with another colour, NOTHING is highlighted: no
black ink, no red, no green, no brown, no orange, no grey wash, no pencil, no charcoal, no
marker, no crayon, no watercolour, no white paint and no white gouache highlights, no
coloured or tinted paper.
IF SOMETHING IN THE WORLD IS RED, YELLOW OR ANY OTHER COLOUR, IT IS STILL DRAWN IN BLUE.
Every difference of tone comes ONLY from how hard he pressed and how densely he hatched with
that one blue pen - darker means more blue lines packed together, lighter means fewer, and
the lightest tone of all is bare cream paper."""

DESPROLIJO = """IT IS A BALLPOINT DRAWING, NOT A PRINT. It was made with a cheap biro on
a notebook held on his knee, in the cold, with the pen skipping. IT MUST LOOK MESSY AND
HAND-MADE AT A GLANCE, and the mess is the point:
- NO line is perfectly straight and NOTHING was drawn with a ruler. Long lines WOBBLE and are
  built out of several short overlapping strokes that do not meet cleanly.
- LINES OVERSHOOT AT THE CORNERS and cross past each other instead of stopping where they
  should. Shapes do not close properly.
- CIRCLES AND WHEELS ARE LOPSIDED and gone round two or three times, one pass not on top of
  the other.
- CONTOURS ARE DOUBLED where he went over a line again to darken it, so the outline is not
  one line but two or three that nearly agree.
- THE PRESSURE IS UNEVEN: some strokes bite hard and almost dent the paper, others come out
  faint or BREAK INTO GAPS where the ball ran dry, and there are SMALL BLOBS OF INK where a
  stroke started or stopped and where he paused.
- HATCHING IS RUSHED AND CROOKED, the strokes not parallel, RUNNING OUTSIDE the shape they
  were meant to fill and stopping short in other places.
- NOTHING WAS ERASED: false starts, abandoned lines, a shape started in the wrong place and
  simply left there, and one or two little smudges where his hand dragged across wet ink.
- NOTHING IS SYMMETRICAL: the two sides of anything never match.
- Each drawing sits slightly CROOKED, at its own angle, ignoring the ruled lines of the paper.
- NO fine detail anywhere: a biro cannot do fine texture, so detail is suggested with a few
  scratchy strokes and nothing more.
IT MUST NOT LOOK LIKE clean vector line art, a printed illustration, inked comic art,
engraving, a technical drawing, a tattoo design or anything digital and even. WHERE THE
DRAWING IS DESCRIBED AS CAREFUL OR WELL OBSERVED, THAT MEANS CAREFUL FOR A KID WITH A BIRO -
it is still crooked, still wobbly, still doubled and blotted. It is never neat."""

HOJA = """THE SINGLE MOST IMPORTANT RULE OF THIS IMAGE: EVERYTHING HE DREW IS ON THE
RIGHT-HAND PAGE, AND ONLY THERE. THE LEFT-HAND PAGE IS ENTIRELY EMPTY - nothing on it but the
printed ruled lines, from its top edge to its bottom edge and from its outer edge all the way
to the binding. NO drawing, NO part of a drawing, NO line, NO horizon, NO sea, NO ground, NO
label, NO arrow, NO word and NO stray mark ever appears on the left-hand page.
AND NOTHING CROSSES OR TOUCHES THE WIRE BINDING. No drawing spans the two pages, no horizon
runs through the rings, no background continues from one page to the other. Every drawing is
COMPLETELY CONTAINED inside the right-hand page with clear paper between it and the binding.
IF A DRAWING DOES NOT FIT, MAKE IT SMALLER - it is never allowed to spill to the left.

THE SAME RING-BOUND NOTEBOOK IN EVERY IMAGE OF THIS SET, AND ITS DESIGN NEVER
CHANGES. It is opened flat and seen from DIRECTLY ABOVE, filling the entire landscape frame,
its two facing pages spanning the full width and of equal size.
THE BINDING RUNS VERTICALLY DOWN THE EXACT CENTRE OF THE IMAGE: a column of BLACK TWIN-LOOP
WIRE RINGS (double-O spiral binding), each ring a small dark rounded metal loop, ABOUT TWENTY
of them evenly spaced from the top edge to the bottom edge, with the punched holes in the
paper visible where the wire passes through, and a soft shadow under the wire.
BOTH PAGES ARE IDENTICAL PAPER: warm cream ivory, slightly aged, with PRINTED HORIZONTAL
RULED LINES in PALE GREY-BLUE, thin and evenly spaced, running the full width of each page
from edge to edge. NO red margin line, NO vertical line of any kind, NO grid, NO squares, NO
printed header, NO page numbers, NO date box, NO brand name, NO logo, NO title.
Around the whole spread there is a NARROW DARK BORDER of the notebook covers with SOFTLY
ROUNDED CORNERS, and a gentle darkening in the four corners of the image. A few faint brown
damp stains and one or two small ink blots near the lower edges of the paper.
ONCE MORE, BECAUSE IT IS THE THING THAT GOES WRONG: THE LEFT-HAND PAGE IS COMPLETELY BLANK -
ruled lines only, no writing, no words, no letters, no drawings, not one pen mark anywhere on
it, because the game types the letter over it. THE RIGHT-HAND PAGE CARRIES ALL THE DRAWINGS
AND ALL THE HANDWRITTEN LABELS, in blue ballpoint pen, none of them touching the binding.
ONLY THE DRAWINGS ON THE RIGHT-HAND PAGE EVER CHANGE. The spread, the black wire binding, the
paper colour, the ruling and its spacing, the rounded dark cover border and the framing are
FIXED and must come out the same every single time."""

M18 = """DRAWN BY MATEO AT EIGHTEEN, an untrained but genuinely gifted kid who has drawn
since he was a child, with a ballpoint pen, cold, in bad light. THE LANDSCAPE, THE OBJECTS
AND THE MACHINES are confident and well observed - he is good at those. THE PEOPLE ARE NOT:
they are stiff, out of proportion, with mitten hands and faces of two dots and a line. Some
lines gone over twice, a few false starts left in, nothing erased. NOTHING IS POLISHED. IT
MUST LOOK LIKE A DRAWING, NOT AN ILLUSTRATION."""

M8 = """DRAWN BY MATEO AT EIGHT YEARS OLD. He is better than most kids his age and it shows,
but he is still eight and it must read as A CHILD'S drawing at a glance: everything sits on
ONE single ground line ruled across the bottom, NO perspective and NO depth at all, the sizes
plainly wrong because he drew biggest whatever he cared about most, the pen pressure HEAVY
and the lines WOBBLY and gone over three or four times, and NO hatching and NO shading
anywhere - a child does not shade. People are big-headed matchstick figures with round heads
much too large for their bodies and a face of two dots and a curved line.
VERY FEW LINES. THIS IS THE MOST IMPORTANT PART: a child does not render, he outlines and
moves on. THE WHOLE DRAWING IS MADE OF A HANDFUL OF SEPARATE PEN STROKES - if the drawing has
more than about THIRTY strokes in it, IT IS ALREADY TOO COMPLICATED. Everything is reduced to
its simplest possible sign: water is ONE straight line, a cloud is ONE bumpy outline, grass is
FOUR little spikes, a splash is THREE short dashes. There is NO texture, NO water surface, NO
reflections, NO depth, NO atmosphere, NO tone and NO massed lines anywhere. Nothing is filled
in and nothing is built up out of many strokes: an empty outline with bare paper inside it is
the correct answer every time.
NO CAMERA. He does not know about close-ups, low angles or points of view: everything is seen
flat and side-on, as if pinned to the paper.
THE ONE EXCEPTION: THE AIRPLANE IS THE BEST THING ON THE PAGE, drawn with far more attention
than anything else - wings, tail, a real shape - because it is the thing he studies. But even
the plane is an EIGHT-YEAR-OLD'S best: a simple confident outline, not a technical drawing and
not shaded. Everything else is eight years old; the plane is eight years old and gifted."""

BONDI = """ONE OLD ARGENTINE CITY BUS - a 1960s-70s Mercedes-Benz colectivo with a
locally built coachwork body, seen from a FRONT THREE-QUARTER angle so that both the front
panel and one whole side are visible. Drawn CAREFULLY and with real attention: it is a
machine, and machines are the thing he is good at.
IT IS FLAT-FRONTED, UPRIGHT AND SNUB-NOSED, WITH NO BONNET - the front is a tall vertical
slab, the driver sits right over the front wheel. On that front panel, dead centre, A LARGE
UPRIGHT CHROME RADIATOR GRILLE of stacked horizontal bars, taller than it is wide, with A
THREE-POINTED STAR INSIDE A CIRCLE at the top of it. ONE ROUND HEADLAMP on each side of the
grille, set low in a chrome ring - ROUND lamps, never rectangular. A HEAVY CHROME BUMPER
across the bottom. Above, A FLAT SPLIT WINDSCREEN in two upright panes, never curved.
ON THE ROOF, ABOVE THE WINDSCREEN, A RECTANGULAR DESTINATION SIGN BOX standing proud of the
roofline with the route number in it - the single most recognisable thing about this bus
after the grille.
The body is TALL, NARROW AND BOXY with a rounded roof and a rain gutter running along it, a
row of tall rectangular side windows, ONE passenger door just behind the front wheel, big
round wheel arches, fat tyres and round dish hubcaps. Along the flank, THIN DECORATIVE
PINSTRIPES AND CURLING SCROLLWORK (Buenos Aires fileteado) running the length of the body and
framing the sign box.
IT IS AN OLD BUS AND MUST NOT LOOK MODERN: no low floor, no single wide curved windscreen, no
smooth plastic front panel, no LED or digital display, no roof air-conditioning pod, no
wheelchair ramp, no modern wing mirrors, no sliding doors."""

TERITO_FORMA = """a southern lapwing (TERO) in strict SIDE PROFILE facing left, standing
still and upright on both legs. The defining feature, which must ALWAYS be present: a SINGLE
LONG THIN CREST FEATHER sweeping backwards from the back of the skull, longer than the head
itself, curving slightly up at the tip. A short straight pointed beak, a slender upright neck,
a compact rounded chest, a smooth unbroken back line running to a LONG POINTED TAIL, two thin
straight legs. ELEGANT, THIN AND WIRY - never chunky, never a round blob, never a cartoon
bird, never shouting or leaping."""

MICRO = """AN OLD ARGENTINE LONG-DISTANCE COACH of the same era and the same family as the
city colectivo: a 1960s-70s Mercedes-Benz chassis with a locally built coachwork body, seen
from a FRONT THREE-QUARTER angle so that the front panel and one whole side are visible. Drawn
CAREFULLY: it is a machine.
IT IS FLAT-FRONTED, UPRIGHT AND SNUB-NOSED, WITH NO BONNET - the front is a tall vertical
slab. Dead centre of that panel, A LARGE UPRIGHT CHROME RADIATOR GRILLE of stacked horizontal
bars, taller than it is wide, with A THREE-POINTED STAR INSIDE A CIRCLE at the top. ONE ROUND
HEADLAMP on each side of the grille, low, in a chrome ring - ROUND, never rectangular. A HEAVY
CHROME BUMPER across the bottom. A FLAT SPLIT WINDSCREEN in two upright panes, never curved.
ON THE ROOF ABOVE THE WINDSCREEN, A RECTANGULAR DESTINATION SIGN BOX standing proud of the
roofline.
The body is TALLER AND LONGER than a city bus but just as BOXY, with a rounded roof and a rain
gutter, a long row of tall rectangular windows, LUGGAGE LOCKER DOORS running along the bottom
of the flank, ONE passenger door at the very front behind the wheel, big round wheel arches,
fat tyres and round dish hubcaps. THIN PINSTRIPES AND CURLING SCROLLWORK (fileteado) along the
flank.
IT IS AN OLD COACH AND MUST NOT LOOK MODERN: no smooth aerodynamic nose, no single wide curved
windscreen, no tinted glass band, no double-decker body, no smooth plastic panels, no LED or
digital display, no roof air-conditioning pod, no modern wing mirrors, no wheelchair lift."""

PARRILLA = """AN ARGENTINE PARRILLA, NOT A ROUND KETTLE BARBECUE AND NOT A GAS GRILL: a
brick structure built against a back wall, with a BRICK HOOD AND A SHORT CHIMNEY over it
drawing the smoke up. Under the hood, a WIDE FLAT IRON GRATE made of parallel bars, hanging
from CHAINS or riding on a rack, with A LARGE HAND WHEEL OR CRANK AT ONE SIDE to raise and
lower it. THE FIRE IS NOT UNDER THE MEAT: a small wood fire burns off to ONE SIDE, in a
separate corner of the brick box, and the EMBERS are raked out and spread in a thin bed under
the grate, with a long IRON POKER left leaning against the brickwork.
ON THE GRATE, laid out flat in a row: A LONG RACK OF RIBS (tira de asado) - one continuous
strip of ribs, not separate steaks and not burgers - and beside it FOUR OR FIVE SAUSAGES
(chorizos) in a line. Nothing on skewers, no hamburgers, no hot dogs, no corn, no vegetables,
no bottle of sauce.
Nearby: a simple wooden board and a bottle of wine on a plain table."""

SOLDADITO = """EVERY STICK FIGURE ON THIS PAGE IS A SOLDIER, never a civilian in
ordinary clothes. They stay crude - stick limbs, mitten hands, a face of two dots and a line
or no face at all - but each one is unmistakably kitted out: A ROUND HELMET clearly drawn on
the head and PLAINLY WIDER THAN THE HEAD UNDER IT, and a bulky squared-off jacket over the
body. On most of them, a simple rifle drawn as one straight line, slung across the back. That
is all the detail there is - no faces, no insignia, no boots, no webbing. NO bare heads, NO
caps, NO hats, NO civilian coats, NO shorts, NO t-shirts."""

SUELTOS = """These are SEPARATE, UNRELATED DOODLES scattered around THE RIGHT-HAND PAGE and
fitted entirely within it, NOT one composed illustration. Each drawing sits on its own bare patch of paper, at its own size and its own
slight angle, with clear empty paper between them. There is NO shared ground line, NO shared
horizon, NO shared perspective and NO background connecting them. ALL OF THEM SIT ON THE
RIGHT-HAND PAGE: none of them touches the binding and none of them continues onto the left."""

UNICO = """THE RIGHT-HAND PAGE CARRIES ONE SINGLE DRAWING AND NOTHING ELSE. It is not a
busy page: this is the only thing he drew, because it is the only thing he is thinking about.
Every other part of the paper is EMPTY - blank ruled paper, no other doodles, no objects, no
frame, no border, no decoration, nothing in the corners. NOTHING IS REPEATED and nothing is
added that was not asked for."""

SINREP = """EXACTLY ONE of each drawing, and NOTHING IS REPEATED anywhere on the spread. If
there is empty paper left over, LEAVE IT EMPTY - blank ruled paper is the correct result.
NEVER fill space by duplicating a drawing, and never add drawings that were not asked for."""

PAPEL = """A few ink smudges where his hand dragged. 16:9 widescreen landscape. No watermark,
no signature, no border decoration, no frame added around the image."""

HOJA_SUELTA = """The support is a single page of the same notebook paper: warm cream ivory,
slightly aged, with PRINTED HORIZONTAL RULED LINES in PALE GREY-BLUE running edge to edge,
thin and evenly spaced. NO red margin, NO grid, NO squares, NO printed header. A couple of
faint brown damp stains."""

RETRATO = """chest-up, three-quarter view facing slightly left, personal marks clearly
visible, neutral dark background for clean cutout, consistent framing and scale, pixel art
character portrait for a dialogue box."""

FIGURA = """full body, STATIC held pose, no motion blur, no action, flat solid magenta
background for clean cutout."""

def bloque(titulo, archivo, nota, cuerpo):
    t = "## %s\n\n`%s`\n\n" % (titulo, archivo)
    if nota: t += "*%s*\n\n" % nota
    return t + "```\n" + cuerpo.strip() + "\n```\n\n"

# ============================== AIRE ==============================
A = []
def a(t, f, n, escena, extra=""):
    A.append(bloque(t, f, n, "%s\n\n%s\n\n%s\n%s" % (AIRE, escena.strip(), extra.strip(), EPOCA)))

a("P.2 · LA COCINA — cálida", "p2_cocina.png",
  "La escena bisagra del prólogo. Viernes a la tarde, 2 de abril de 1982.",
  """Interior of a modest Argentine home kitchen in 1982, a Friday afternoon, warm low
late-afternoon light through a small curtained window, formica table with a plastic
tablecloth, four mismatched wooden chairs, a kettle on the lit stove with a thin plume of
steam, a wall-mounted rotary telephone, a small valve radio on the shelf, a saint's picture
and a wall calendar, worn tiled floor. Lived-in, warm, ordinary.""",
  VACIA + " 16:9. No modern appliances.")

a("P.2b · LA COCINA — lavada", "p2_cocina_gris.png",
  "La MISMA placa con la luz drenada. Entra cuando arranca el parte de radio. Se reusa en P.0 y en los epílogos.",
  """Interior of a modest Argentine home kitchen in 1982, THE WARM LIGHT DRAINED TO A FLAT
GREY, the kettle still whistling on the lit stove, the small valve radio on the shelf NOW
SWITCHED ON, formica table with a plastic tablecloth, four mismatched wooden chairs, a
wall-mounted rotary telephone, a saint's picture and a wall calendar, worn tiled floor.""",
  VACIA + " Cold, stopped. 16:9. No modern appliances.")

a("P.3a · EL TELÉFONO DE LA BASE", "p3a_telefono.png", "",
  """Close-up of an olive-green military field telephone on a scratched metal desk in a bare
office, the handset off the hook and lying on its side on the desk, a coiled cord, a stack of
carbon-copy forms, a tin ashtray with three crushed cigarettes, hard raking light from a high
window.""", VACIA + " 16:9.")

a("P.3b · LOS PAPELES", "p3b_papeles.png", "",
  """Overhead close-up of a bare metal desk covered with typed carbon-copy military forms and
a rubber stamp lying on its side, one form pushed slightly away from the others, a fountain
pen uncapped, cold indifferent overhead light.""", VACIA + " 16:9.")

a("P.3c · LA PUERTA QUE SE CIERRA", "p3c_puerta.png", "El remate de «No pude».",
  """A plain closed office door at the end of an empty institutional corridor, frosted glass
panel dark from the inside, worn linoleum floor, a single bare bulb, deep shadow, the corridor
stretching away.""", VACIA + " Cold, final. 16:9.")

a("P.1c · EL CUADERNO EN LAS RODILLAS", "p1c_cuaderno.png",
  "El ÚNICO cuadro del juego donde conviven los dos registros: el mundo en color y, adentro, la tinta del chico. Por eso va en AIRE.",
  """Over-the-shoulder view from just behind and slightly above a seated eight-year-old boy:
his lap, his two knees in worn trousers, and an open school notebook resting flat across
them, one small hand steadying the edge of the page while the other holds a ballpoint pen to
it. His head is out of frame: no face.
THE NOTEBOOK IS AN OBJECT INSIDE THE SCENE, not the frame itself: its two facing pages, the
spine between them, its outer edges and its slightly curled corners are all clearly visible,
and around and beyond it there is real ground - summer grass and the low bank of a creek.
Never let the page fill the frame.
Everything of the real world is in FULL COLOUR and solid: the boy's skin, his trousers, the
notebook cover, the grass, the pen with its WHITE cap, BLUE barrel and LIGHT BROWN tip.
DRAWN IN BLUE INK ON THE OPEN PAGE, and the only thing in this image that is a drawing: a
child's ballpoint sketch of the creek, a rusty pickup truck, a little aeroplane crossing the
sky, and TWO BADLY DRAWN MATCHSTICK FIGURES - a tall one standing with an arm flung out and a
smaller one sitting on the bank - EVERYTHING SITTING ON ONE SINGLE RULED GROUND LINE, no
perspective, no shading, heavy wobbly lines gone over several times, the sizes plainly wrong.
Above the tall figure, in the child's hand, the word "PAPa" written as three big clumsy
capitals and a small accented lowercase "a", crooked and uneven. THE AEROPLANE IS THE
BEST-DRAWN THING ON THE PAGE by a long way, with real wings and a real shape, and the two
people are the worst.""",
  "Warm summer afternoon light from the side. 16:9. The only word anywhere on the page is the child's crooked \"PAPa\" above the tall figure.")

a("M1a · LA LÍNEA DE VUELO, DE MADRUGADA", "linea_amanecer.png",
  "Se reusa en TODOS los briefings de madrugada de la campaña.",
  """A military flight line at dawn in Patagonia, three attack jets parked in a row angled
away into the distance on cracked concrete, a boarding ladder still leaning against the
nearest fuselage, a wooden bench with a thermos and a gourd mate with a metal straw resting on
it, a rag hanging over the bench, scattered hand tools and an open toolbox on the ground, a
low grey horizon and flat windswept scrub beyond the apron, cold blue pre-sunrise light with
the first orange line at the horizon.""", VACIA + " 16:9.")

a("M1b · EL VESTUARIO", "vestuario.png",
  "Todo cerrado. El hueco del locker entornado tiene que ser NEGRO PURO: el jugador NO ve la foto en M1.",
  """Interior of a small military changing room in deep shadow, seen straight on: a row of six
tall grey steel lockers along the back wall, worn and dented, ALL OF THEM SHUT except one that
is very slightly ajar - and the gap is PITCH BLACK, nothing whatsoever visible inside it, just
darkness. A long wooden bench runs in front of the lockers with personal things left on it: a
gourd mate with a metal straw and a thermos at one end, a pair of black leather flight boots
underneath, a folded flight suit squared off with obsessive neatness beside a crumpled one, a
white flight helmet resting on its crown, a small silver crucifix on a chain hanging from a
locker handle, and a carpenter's pencil left on the bench. Coats and a towel on hooks. One
weak bare bulb high up, the light falling only on the bench and the top of the lockers, the
corners lost in black.""", "NOBODY IN THE FRAME - he just shut it and walked away. 16:9.")

a("M1c · EL TERITO RECIÉN PINTADO", "m1c_terito.png",
  "REFERENCIA MAESTRA del terito. Si además adjuntás la foto de la silueta de metal, agregá al principio: «IMAGE 1 IS THE SHAPE REFERENCE FOR THE BIRD ONLY. Ignore its material, its black colour, its sky, its tree and its background.»",
  """Extreme close-up of the side of a camouflaged attack jet fuselage just below the cockpit
rail, filling the frame, worn green and brown paint with panel lines and rivets - and
stencilled onto that metal in SOLID FLAT WHITE, small, a bird:
a southern lapwing (TERO) in strict SIDE PROFILE facing left, standing still and upright on
both legs. The defining feature, which must ALWAYS be present: a SINGLE LONG THIN CREST
FEATHER sweeping backwards from the back of the skull, longer than the head itself, curving
slightly up at the tip. A short straight pointed beak. A slender upright neck. A compact
rounded chest. A smooth unbroken back line running to a LONG POINTED TAIL that extends
backwards and slightly down. Two thin straight legs with small feet. The whole shape is
ELEGANT, THIN AND WIRY, drawn with clean confident lines - NEVER chunky, NEVER a round blob,
NEVER a cartoon bird. NOT shouting, NOT with an open beak, NOT leaping, NOT with the chest
puffed out: it is simply standing, alert and still.
The bird is flat white with no detail inside the silhouette. The white paint is WET AND
FRESH, slightly glossy, with one thin drip running down from the tail.
Resting on the wing root beside it: a SMALL FINE-TIPPED ARTIST'S BRUSH, thin as a pencil, with
a slender wooden handle and a narrow pointed tip - NOT a wide house painter's brush - and a
small open tin of white paint the size of a teacup.""",
  "Dawn light raking across the panels. " + VACIA + " 16:9.")

a("M1d · EL MAR DEL TUTORIAL", "m1d_mar.png", "",
  """Grey open sea seen very low, almost at wave height, with three small rusted fishing boats
scattered in the middle distance, their tall masts and rigging sticking up like obstacles, a
low corrugated-iron bridge on stilts crossing a channel further back, and a scatter of empty
oil drums floating in the foreground with rope handles. Overcast sky, cold silver light, spray
blowing off the wave tops.""", VACIA + " 16:9.")

a("M1e · EL FUSELAJE LIMPIO", "m1e_fuselaje.png",
  "SIN estrellas: las pinta el MOTOR, una por avión y por vuelta. Se genera una sola vez para toda la campaña.",
  """Close-up of the worn camouflaged side of an attack jet fuselage just below the cockpit,
filling the frame, green and brown paint with panel lines, rivets, exhaust staining and
scuffed edges. The area below the cockpit rail is CLEAN AND EMPTY - no stars, no markings, no
numbers, no insignia of any kind on that panel, just bare worn paint waiting. Resting on the
wing root: a small fine-tipped artist's brush, thin as a pencil, and a small open tin of white
paint the size of a teacup. Warm late afternoon light raking across the panel lines.""",
  VACIA + " 16:9.")

a("M2a · LA LÍNEA ANTES DE LA PRIMERA DE VERDAD", "m2a_linea_carga.png", "",
  """A military flight line in the grey hour before sunrise, an attack jet in the foreground
with its access panels open and a bomb trolley parked under the wing carrying two olive bombs,
a gourd mate with a metal straw and a thermos left standing on an upturned crate, the boarding
ladder in place, a coiled ground power cable snaking across the concrete. Flat cold light, no
shadows.""", "NOBODY IN THE FRAME - the mate is still half full. 16:9.")

a("M2b · LA COSTA Y EL RADAR", "m2b_costa_radar.png", "",
  """A bleak coastline seen from very low over the water: black rock, peat and low scrub
climbing to a bare ridge, and on the high ground a British-style mobile radar installation - a
lattice mast with a rotating dish, sandbagged emplacements and a generator trailer. Overcast,
wind-flattened grass, cold flat light.""", VACIA + " 16:9. No digital camouflage.")

a("M2c · LA CHAPA REMENDADA", "m2c_chapa.png",
  "Se reusa cada vez que alguien vuelve tocado.",
  """Close-up of an attack jet's camouflaged flank in morning light, riddled with cannon holes
that have been PATCHED overnight - a dozen rough metal patches riveted over the punctures, the
new rivets bright against the worn paint, the patch primer a different colour that does not
match. Tools and a hand riveter left on the wing root, a work lamp on a stand still switched
on in the daylight.""", "NOBODY IN THE FRAME - he worked all night and just left. 16:9.")

a("M3a · EL AMANECER DEL INVENTO", "m3a_amanecer.png", "",
  """A quiet golden sunrise over a military flight line, an attack jet in three-quarter view
with a wooden stepladder leaning against its fuselage, an access panel hanging open beside the
air intake with wiring and pipework visible inside, hand tools laid out in a neat row on a rag
on the wing, a grease-stained notebook and a carpenter's pencil left open on the crate below.
Long soft shadows, still air, mist on the scrub beyond.""",
  VACIA + " Warm and deceptively peaceful. 16:9.")

a("M3b · LAS BOYAS Y EL RADAR PORTÁTIL", "m3b_boyas.png", "",
  """A calm grey coastal strait seen low over the water, with a line of enemy marker buoys
floating in a row - squat, drum-shaped, with short antenna whips and faded paint - and further
inland on a low headland a small portable radar unit on a towed trailer with its dish folded
half up. Soft morning light, glassy water, no wind.""", VACIA + " 16:9.")

a("M3c · EL INVENTO QUE EXPLOTA", "m3c_invento.png",
  "PAR con M3e: mismo encuadre, dos estados. Generar las dos juntas.",
  """Interior of a hangar, and on a workbench in the centre a bizarre home-made contraption: a
curved sheet-metal fairing lashed to a small motor with LOTS of black electrical tape wound
around every joint, wires sticking out, one hose clamp holding the whole thing together. A thin
plume of grey smoke rising from it, a scorch mark on the bench, and a small metal washer lying
on the floor several metres away next to a mechanic's cloth cap that has been knocked off.
Tools scattered where they were dropped. Hard work light from above.""",
  "NOBODY IN THE FRAME - it just happened. 16:9.")

a("M3e · LA NOTICIA (EL BELGRANO)", "m3e_noticia.png",
  "PAR con M3c: el MISMO hangar, ordenado y apagado. El corte de tono se hace cambiando una placa por la otra.",
  """Interior of a hangar at the end of the day, the laughter gone out of it. In the foreground
a wooden workbench with a mechanic's grey cloth cap left lying on it, not folded, just put
down. Beside the bench, hand tools lined up one next to another in a too-careful row, and
three still on the floor. An attack jet in shadow behind. The work lamp is on but the daylight
from the hangar doors is going blue.""", VACIA + " Silent, heavy, stopped. 16:9.")

a("M3d · EL CARRITO DEL MISIL", "m3d_carrito.png", "",
  """A low wheeled ordnance trolley standing in the middle of a hangar floor with a single
olive-green air-to-ground missile strapped to it, its fins wrapped in protective cloth, a hand
crank at one end and chocks under the wheels. The hangar around it half in shadow, an attack
jet's nose visible at the edge of frame. Hard overhead work light.""",
  VACIA + " 16:9. No modern guided weapons.")

# ---- retratos ----
R = []
def r(t, f, desc, expr):
    R.append(bloque(t, f, "", "%s\n\nPortrait bust of %s, %s %s\n\n%s" % (AIRE, desc, RETRATO, expr, EPOCA)))

MATEO_CASA = """an argentine teenager, 18 years old and reads as 18, skinny, criollo
features, olive skin, head freshly shaved to the scalp for military service, patchy teenage
mustache, wearing a plain civilian short-sleeved shirt at home - NO uniform, NO helmet, NO
field gear"""
TERO_CIVIL = """an argentine man, 41 years old, very tall and very thin, gaunt and narrow,
neck carried forward, criollo features, olive skin, black hair greying at the temples,
clean-shaven, wearing a plain buttoned civilian shirt with the sleeves rolled up - NO flight
suit, NO helmet, NO military equipment of any kind"""
NORMA = """an argentine mother, 47 years old, middle-aged not elderly, criolla, dark hair with
grey at the temples pulled back in a low bun, warm tired face, wearing a faded blue dress with
a cream floral apron"""
COLORADO = """an argentine corporal, 26 years old, tall and sturdy, fair freckled skin raw red
from the cold, red hair, plain olive field uniform with NO insignia of any kind, wool cap,
argentine brown leather webbing"""

r("MATEO · sonrisa colimba", "mateo_casa_sonrisa.png", MATEO_CASA,
  "A wide easy grin, eyebrows up, completely unworried.")
r("MATEO · serio", "mateo_casa_serio.png", MATEO_CASA,
  "The grin completely gone, lips parted, brow drawn together, looking at someone off-frame and not understanding.")
r("TERO · sonrisa chica (de civil)", "tero_civil_sonrisa.png", TERO_CIVIL,
  "A small amused closed-mouth smile, eyes crinkled, relaxed at his own kitchen table on a Friday afternoon.")
r("TERO · blanco (de civil) — EL RETRATO MÁS IMPORTANTE DEL PRÓLOGO", "tero_civil_blanco.png", TERO_CIVIL,
  "All the blood gone from his face, eyes wide open and fixed on nothing, mouth slightly open, absolutely still - a man who has just understood something before anyone else in the room.")
r("NORMA · cálida", "norma_calida.png", NORMA,
  "A warm knowing half-smile aimed at her husband, eyebrows raised in gentle teasing, completely at ease in her own kitchen.")
r("NORMA · seria", "norma_seria.png", NORMA,
  "The smile gone, mouth closed in a firm line, eyes turned toward something off-frame she cannot see, one hand frozen halfway through a movement.")
r("COLORADO · sonrisa (SU neutro)", "colorado_sonrisa.png", COLORADO,
  "A broad open honest grin that reaches the eyes, weather-beaten and cheerful despite the cold.")
r("COLORADO · callado", "colorado_callado.png", COLORADO,
  "The grin gone, mouth closed, looking slightly down and away, patient and completely unhurried - a man willing to sit in the mud for as long as it takes and with no intention of saying anything.")
r("COLORADO · serio", "colorado_serio.png", COLORADO,
  "Jaw set, brow low, eyes hard and fixed on something off-frame, all the warmth gone out of the face.")
GITANO = """an argentine air force pilot, 33 years old, THE DARKEST-SKINNED OF THE
SQUADRON, olive-brown skin, TALL VOLUMINOUS BLACK CURLY HAIR piled high, big dark eyes, high
cheekbones, a straight wide nose, AN OLD THIN SCAR THROUGH ONE EYEBROW, and a huge warm
open-mouthed grin showing his teeth. He wears his flight suit PULLED DOWN TO THE WAIST with
the sleeves knotted in front and a white undershirt, bare shoulders and arms"""

R.append(bloque("GITANO · THANK YOU *(la reverencia — guiño a Metal Slug)*", "gitano_gracias.png",
  "Se usa UNA SOLA VEZ en todo el juego (M2). Es la única miniatura con una mano adentro del cuadro.",
  AIRE + """

Portrait bust of """ + GITANO + """, caught in the middle of a cheeky little bow of thanks -
the arcade "THANK YOU" pose.
ONLY HIS HEAD, HIS SHOULDERS AND ONE HAND ARE IN THE FRAME. Nothing else of him is visible:
no full body, no legs, no aircraft, no background objects.
THE POSE: his head is DIPPED SLIGHTLY FORWARD AND TILTED to one side in a small bow, chin
down, eyes crinkled almost shut with laughing, the grin enormous. ONE HAND IS RAISED UP
BESIDE HIS HEAD, level with his temple, PALM TURNED TOWARD THE VIEWER with the fingers open
and relaxed - half a wave, half a salute, entirely a joke. The forearm enters the frame from
below and the elbow is out of shot. The hand is CLEARLY SEPARATED from his hair, with clean
background visible between them so both silhouettes read at small size. His other arm is not
in the frame.
FRAMING - THIS IS A PORTRAIT FOR A DIALOGUE BOX AND IT MUST MATCH THE OTHER PORTRAITS EXACTLY:
chest-up, three-quarter view facing slightly left, THE HEAD AT THE SAME SIZE AND THE SAME
HEIGHT IN THE FRAME as every other character portrait in the set. The raised hand is fitted
into the empty space beside the head - it does NOT push the head down, does NOT shrink it and
does NOT crowd it. Personal marks clearly visible. Neutral dark background for clean cutout,
consistent framing and scale, pixel art character portrait for a dialogue box.
NO speech balloon, NO text, NO letters, NO sparkles, NO stars, NO motion lines, NO onomatopoeia
anywhere in the image.

""" + EPOCA))

R.append(bloque("CÓNDOR · el parlante", "condor_parlante.png",
  "Único «retrato» que no es una cara. Se genera UNA vez y se usa en las 14 misiones.",
  AIRE + """

Portrait-format close-up of a scratched olive-green military radio loudspeaker grille with a
single amber indicator lamp lit beside it, worn painted metal, chipped edges, a faint green
audio waveform glowing across the grille, framed exactly like a character portrait bust -
chest-up scale, three-quarter view facing slightly left - neutral dark background for clean
cutout, consistent framing and scale with the character portraits, pixel art portrait for a
dialogue box.

""" + EPOCA))

# ---- figuras ----
F = []
LUZ = "Warm low late-afternoon light from a small window on the left."
def f(t, fn, desc, pose):
    F.append(bloque(t, fn, "", "%s\n\nFull body of %s, %s %s %s\n\n%s" % (AIRE, desc, pose, "STATIC held pose, no motion blur, no action.", LUZ + " Flat solid magenta background for clean cutout.", EPOCA)))

F.append(bloque("TERO · sentado a la mesa", "fig_tero_p2_sentado.png", "", AIRE + "\n\nFull body of " + TERO_CIVIL + """, seated on a wooden kitchen chair seen from three-quarter BEHIND, one forearm resting on the table, relaxed, his face turned away and NOT legible. """ + FIGURA + " " + LUZ + "\n\n" + EPOCA))
F.append(bloque("TERO · en el teléfono", "fig_tero_p2_telefono.png", "", AIRE + "\n\nFull body of " + TERO_CIVIL + """, standing with his BACK to the viewer at a wall-mounted rotary telephone, the handset held to his ear, the free hand flat against the wall, shoulders very still, face NOT visible. """ + FIGURA + " " + LUZ + "\n\n" + EPOCA))
F.append(bloque("TERO · en la radio", "fig_tero_p2_radio.png", "", AIRE + "\n\nFull body of " + TERO_CIVIL + """, standing with his BACK to the viewer at a shelf, one hand on the knob of a small valve radio, head slightly lowered, completely still, face NOT visible. """ + FIGURA + " " + LUZ + "\n\n" + EPOCA))
F.append(bloque("MATEO · sentado enfrente", "fig_mateo_p2_sentado.png", "", AIRE + "\n\nFull body of " + MATEO_CASA + """, seated on a wooden kitchen chair in three-quarter view, leaning back easy with one arm hooked over the chair back, small in frame, face small and NOT detailed. """ + FIGURA + " " + LUZ + "\n\n" + EPOCA))
F.append(bloque("NORMA · sirviendo", "fig_norma_p2_sirviendo.png", "", AIRE + "\n\nFull body of " + NORMA + """, standing with her BACK to the viewer at a stove, serving from a pot with a wooden spoon, weight on one hip, face NOT visible. """ + FIGURA + " " + LUZ + "\n\n" + EPOCA))
F.append(bloque("NORMA · con el teléfono", "fig_norma_p2_telefono.png", "", AIRE + "\n\nFull body of " + NORMA + """, standing in three-quarter view half-turned toward the room, holding out a telephone handset on its stretched coiled cord toward someone off-frame, the other hand on her hip, face small and NOT detailed. """ + FIGURA + " " + LUZ + "\n\n" + EPOCA))

# ============================== TIERRA ==============================
T = []
def t_(titulo, archivo, nota, mano, cuerpo, texto=None, unico=False):
    reglas = UNICO if unico else (SUELTOS + "\n\n" + SINREP)
    c = "%s\n\n%s\n\n%s\n\n%s\n\n%s\n\n%s\n\n%s" % (TINTA, HOJA, mano, DESPROLIJO, reglas, cuerpo.strip(), PAPEL)
    if texto: c += "\n\n" + texto.strip()
    T.append(bloque(titulo, archivo, nota, c))

# P.1 no es carta: es un recuerdo dibujado. No lleva hoja abierta ni sueltos.
T.append(bloque("P.1a · EL ARROYO *(recuerdo · Mateo a los 8)*", "p1a_arroyo.png",
  "NO es una carta: es un dibujo suelto del recuerdo. No lleva cuaderno abierto.",
  TINTA + "\n\n" + M8 + "\n\n" + DESPROLIJO + """

Wide shot of a flat Argentine countryside creek on a summer afternoon, low grassy bank, still
shallow water, a rusty 1960s Argentine Rastrojero pickup truck parked on the grass, a huge
sky, and ONE small aeroplane crossing it.

AND THERE ARE TWO PEOPLE IN IT, both drawn TERRIBLY - they are the worst things on the page
and that is the whole point:
- A TALL MATCHSTICK FIGURE standing at the water's edge, one stick arm flung out sideways
  having just thrown something: a round head far too big for the body, a face of two dots and
  one curved line, straight single-stroke limbs, one arm longer than the other, no hands and
  no feet. DIRECTLY ABOVE HIS HEAD, written by the child in the same blue ballpoint, the word
  "PAPa" - and it must be written the way a small kid writes it: THREE BIG CLUMSY CAPITAL
  LETTERS "P A P" followed by a SMALL LOWERCASE "a" WITH AN ACCENT MARK OVER IT, the letters
  all different sizes, wobbly, crowded together, tilting, not sitting on any line, the last
  letter squeezed in because he ran out of room.
- A SMALLER MATCHSTICK FIGURE sitting on the bank a little way off, drawn just as badly, with
  something square and flat across its knees.
THE CONTRAST IS THE POINT: the aeroplane is beautifully observed and the two people are
hopeless.

Drawn entirely in blue ballpoint pen. """ + HOJA_SUELTA + "\n\n" + PAPEL))

T.append(bloque("P.1b · EL SAPITO *(recuerdo · Mateo a los 8)*", "p1b_sapito.png",
  "El plano que da nombre al juego. También existe como clip de teaser.",
  TINTA + "\n\n" + M8 + "\n\n" + DESPROLIJO + """

THE STONE SKIPPING ON THE CREEK, DRAWN AS SIMPLY AS A CHILD CAN DRAW IT, seen flat and
side-on, and made of almost nothing:
- ONE long straight horizontal line across the middle of the page: that is the water. Nothing
  under it. No second line, no texture, no shading, no reflections, no surface, no waves.
- ONE small flat stone above that line, drawn as a single simple lopsided oval outline, empty
  inside.
- THREE SMALL HALF-CIRCLE ARCS sitting ON the water line behind the stone, evenly spaced,
  marking where it bounced - just three little bumps, nothing more. NOT concentric ripple
  rings, NOT spreading circles, NOT a pattern in the water.
- A DOTTED CURVED LINE of five or six separate short dashes arcing from the last bounce up to
  the stone, showing the path it took.
- Above, ONE simple bumpy cloud outline, empty inside, and a couple of short strokes for the
  far bank with four little spikes of grass on it.
NOBODY IN THE FRAME AND NOTHING ELSE ON THE PAGE.
THE ENTIRE DRAWING MUST BE COUNTABLE IN PEN STROKES. It is thin, empty and plain, with a great
deal of bare paper around it. NO perspective, NO depth, NO close-up, NO low angle, NO water
texture, NO hatching, NO shading, NO dense clusters of lines anywhere.

Drawn entirely in blue ballpoint pen. """ + HOJA_SUELTA + "\n\n" + PAPEL))

t_("CARTA 1 · P.4 — LA PRIMERA PÁGINA", "carta1_p4.png",
   "Llega a las islas. El patrón de todas las cartas.", M18,
   SOLDADITO + """

THE RIGHT-HAND PAGE CONTAINS EXACTLY FOUR SEPARATE DOODLES AND NOTHING ELSE, scattered
across the page with bare paper between them:
1. LARGEST, in the UPPER MIDDLE OF THE RIGHT-HAND PAGE - THE SEA: long confident horizontal pen strokes for the water, a
   bare rocky shore, no trees. Standing on the shore with his back to us, ONE small stick
   figure just looking at it, with a short handwritten arrow pointing at him.
   RIGHT BESIDE HIM, a SECOND small stick figure in the act of throwing, side-on, arm swung
   low - and out over the water in front of him ONE flat stone caught skipping with THREE
   small ripple rings behind it. A short handwritten arrow points at this second figure.
   BOTH OF THEM ARE SOLDIERS: helmet on the head, bulky jacket, rifle slung across the back.
2. In the LOWER LEFT AREA OF THE RIGHT-HAND PAGE (still well clear of the binding),
   floating on bare paper with no street and no ground under it -
   """ + BONDI.replace("\n", "\n   ") + """
3. In the UPPER RIGHT CORNER OF THE RIGHT-HAND PAGE, small and rough - a crude wobbly OUTLINE MAP OF MAINLAND ARGENTINA, and
   OUT IN THE SEA TO THE LOWER RIGHT OF IT, clearly SEPARATE from the mainland and surrounded
   by water, TWO ISLANDS side by side: the Malvinas / Falkland Islands. HE HAS DRAWN THEM
   NOTICEABLY TOO BIG - out of scale, several times larger than they should be next to the
   mainland, the way a kid draws from memory the place he is standing in. They are the most
   carefully drawn part of the map. FOUR OR FIVE
   tiny stick figures stand at points scattered all over the mainland - north, west, centre -
   and FROM EACH ONE A LINE IS DRAWN THAT RUNS ACROSS THE MAP, OFF THE COAST AND OVER THE
   WATER, AND ALL THE LINES MEET ON THOSE TWO ISLANDS. The lines converge ON THE ISLANDS OUT
   AT SEA, never in the middle of the country and never anywhere on the mainland. EVERY ONE OF
   THOSE FIGURES IS A SOLDIER: helmet on the head, bulky jacket.
4. In the LOWER RIGHT CORNER OF THE RIGHT-HAND PAGE, small, drawn carefully and with
   obvious appetite - ONE deep plate of stew with
   a spoon in it and steam coming off, and beside it TWO thick slices of bread.""",
   """TEXT IN IMAGE (Argentine Spanish), handwritten in the same blue ballpoint, ON THE RIGHT-HAND
PAGE ONLY - never on the left page - small and slightly crooked, ONLY these three labels and
nothing else:
  - next to the figure looking at the sea: "el jujeño"
  - next to the figure throwing the stone: "yo"
  - inside the destination sign box on the roof of the bus, the route number: "60\"""")

t_("CARTA 2 · M1 — EL COLORADO", "carta2_m1.png",
   "Es LO ÚNICO que dibuja Mateo en esta hoja, porque es lo único en lo que piensa. La capa "
   "del superhéroe ES el cuero de oveja que el Colorado le regaló, y lo que protege son los "
   "pibes del pozo: cascos más grandes que sus cabezas. Nadie lo comenta nunca.", M18,
   """THE DRAWING IS A SINGLE SCENE THAT FILLS THE RIGHT-HAND PAGE AND STAYS ENTIRELY INSIDE IT,
clear of the binding: a clumsy, heroic,
Superman-like soldier standing in front of a trench, shielding the kids in it. Two parts, ONE
drawing:

THE FIGURE, front and centre, the biggest thing on the page by far, drawn by a kid trying to
make his friend look magnificent:
- A HUGELY EXAGGERATED BARREL CHEST and very broad shoulders tapering to a narrow waist,
  comic-book superhero build, feet planted wide apart, chin lifted, chest thrown forward.
- HE IS PROTECTING THEM: he stands squarely BETWEEN the viewer and the trench with BOTH ARMS
  SPREAD WIDE AND LOW, palms open and turned outward, barring the way - the unmistakable pose
  of someone shielding what is behind him with his own body.
- HIS CAPE IS NOT CLOTH: IT IS A RAW SHEEPSKIN HIDE worn as a cape - an irregular
  ragged-edged animal hide with the WOOLLY FLEECE turned INWARD, clearly visible along the
  inside edge and in the folds, drawn with thick curly texture. It must read unmistakably as
  a sheepskin, not as a superhero cloak. IT IS SPREAD OUT BEHIND HIM, WIDE, stretched almost
  from one side of the page to the other LIKE A ROOF OVER THE TRENCH, so that the kids are
  underneath it. Drawn with far more enthusiasm and detail than anything else on the page.
- HE MUST READ AS A REDHEAD EVEN THOUGH THE DRAWING IS ALL ONE COLOUR OF INK. HIS HAIR IS
  FULLY DRAWN IN THE SAME BLUE BALLPOINT AS EVERYTHING ELSE - never bare paper, never white,
  never blank - but with LOOSE, OPEN, SPARSE STROKES: a mass of light curls and thin airy
  hatching with plenty of paper showing between the lines, so it reads PALE and BRIGHT next
  to the densely hatched dark uniform. And his face and cheekbones are covered in a scatter
  of SMALL INK DOTS: FRECKLES, clearly visible, unmistakable.
- And it is still badly drawn: proportions off, one arm longer than the other, hands like
  mittens, the face simple - two dots, a line for the mouth, and the freckles.

THE TRENCH, BEHIND HIM AND LOWER, much smaller, drawn as a long low line of dug peat with a
turf parapet running across the right-hand page behind his legs and under the spread hide. ALONG IT,
SIX OR SEVEN SMALL HEADS SHOW JUST ABOVE THE PARAPET AND NOTHING MORE OF THEIR BODIES. THEY
ARE SILHOUETTES: each head filled in solid with ink, NO faces at all, no eyes, no mouths.
EVERY ONE OF THEM WEARS A HELMET THAT IS PLAINLY TOO BIG - a simple round dome, clearly
WIDER than the head under it, sitting low and heavy, some tipped forward so the helmet
covers where the face would be. They must read as CHILDREN'S HEADS UNDER GROWN MEN'S
HELMETS. They are TINY next to him, packed close together, all of them looking the same way.
NO weapons anywhere on the page, no rifles, no flags, no explosions, no enemy.

Everything above the figure and around the trench is EMPTY: blank ruled paper.""",
   """TEXT IN IMAGE (Argentine Spanish), handwritten in the same blue ballpoint directly under
his boots, small and slightly crooked, and NOTHING ELSE: "el Colorado\"""", unico=True)

t_("CARTA 3 · M2 — EL HAMBRE Y LOS QUE CANTAN", "carta3_m2.png",
   "Los compañeros salen torcidos; la carpa de las cajas sale bien dibujada.", M18,
   """THE RIGHT-HAND PAGE CONTAINS EXACTLY THREE DRAWINGS AND NOTHING ELSE:
1. Across the UPPER TWO THIRDS OF THE RIGHT-HAND PAGE, large - ONE shallow muddy foxhole with FOUR OR FIVE YOUNG SOLDIERS
   crammed into it shoulder to shoulder around a small portable transistor radio with its
   aerial up. THEIR MOUTHS ARE OPEN: they are singing. Faces barely sketched, two dots and a
   line each, all of them stiff and slightly the wrong size, arms drawn as simple tubes.
   THEY ARE SOLDIERS AND IT MUST SHOW: a round helmet on every head, plainly wider than the
   head under it, and bulky squared-off jackets. No bare heads, no caps, no civilian clothes.
2. In the BOTTOM LEFT AREA OF THE RIGHT-HAND PAGE (clear of the binding), small, drawn
   carefully - ONE opened ration tin, scraped clean, with a spoon
   still in it.
3. In the BOTTOM RIGHT CORNER OF THE RIGHT-HAND PAGE, small but drawn MUCH better and with the pen pressing harder - ONE large
   officer's tent with the flap tied half open and STACKS OF WOODEN SUPPLY CRATES clearly
   visible piled inside it, a lantern at the entrance, and nobody around it.
Rain drawn as long diagonal pen strokes across the drawing page.""",
   """TEXT IN IMAGE (Argentine Spanish), ON THE RIGHT-HAND PAGE ONLY, handwritten in the same
blue ballpoint, ONLY this one line and nothing else:
  - TUCKED INTO ONE CORNER OF THE PAGE, well away from the drawings and clear of the binding,
    written smaller than a caption and slightly crooked, like a note to himself scribbled in
    the margin so as not to forget it, WITH A HAND-DRAWN UNDERLINE beneath it - a single
    wobbly biro line that does not quite match the length of the words and overshoots at one
    end: pedir a mamá que prepare guiso
  - It is written WITHOUT quotation marks of any kind and it is NOT a label for any drawing:
    nothing points at it, no arrow touches it, it is not attached to anything on the page.""")

t_("CARTA 4 · M3 — LA NAVAJA", "carta4_m3.png",
   "Referencia maestra del objeto: las marquitas del cabo tienen que ser las mismas en sus tres apariciones.", M18,
   """THE RIGHT-HAND PAGE CONTAINS EXACTLY FOUR DRAWINGS AND NOTHING ELSE:
1. In the CENTRE OF THE RIGHT-HAND PAGE, large, drawn WITH FAR MORE CARE THAN ANYTHING ELSE - ONE OLD FOLDING POCKET KNIFE
   lying open at a slight angle: a worn horn handle with visible NICKS AND SMALL NOTCHES along
   it from years of use, a short blade with a rounded worn edge, a simple brass bolster.
   Clearly the thing the artist loves most on this page, with faint construction lines still
   showing where the hand went over it twice.
2. In the TOP RIGHT CORNER OF THE RIGHT-HAND PAGE, small and much rougher - ONE pair of clumsy mitten-like hands whittling a stick
   with long curled shavings falling off it, the hands stiff and badly proportioned.
3. In the BOTTOM LEFT AREA OF THE RIGHT-HAND PAGE (clear of the binding), small, drawn
   well - ONE small campfire with a blackened kettle over it.
4. In the BOTTOM RIGHT CORNER OF THE RIGHT-HAND PAGE, small - ONE shirt breast pocket with the knife and a ballpoint pen sticking
   out of it side by side.""")


t_("CARTA 5 · M4 — EL AVIONCITO GANA", "carta5_m4.png",
   "Dice qué dibujó: «un avioncito plateado y un barco enorme, y el avioncito gana». Y avisa que el barco le salió chueco: hay que respetarle el error.", M18,
   """ONE SINGLE DRAWING: a tiny aeroplane and an enormous ship, and the little aeroplane is
winning.
THE SHIP fills most of the right-hand page, a huge warship seen from the side, low and heavy
in the water - AND IT CAME OUT BADLY. Its hull line sags and bends where it should be
straight, the bow and the stern do not match, the superstructure is stacked crooked, the
proportions are plainly wrong and he went over the waterline three times trying to fix it and
made it worse. He knows it is wrong; he left it.
THE AEROPLANE IS TINY beside it, up and to the left, coming in very low over the water - and
it is the BEST-DRAWN THING ON THE PAGE by a long way: a real swept shape, wings, tail fin,
the nose down, drawn with quick confident lines that get everything right. Under it, a few
long horizontal strokes for the sea.
NOTHING ELSE ON THE PAGE. No explosion, no fire, no flags, no people, no words.""",
   None, unico=True)

t_("CARTA 6 · M5 — LO QUE VIO Y LO QUE HIZO", "carta6_m5.png",
   "🟥 La página más dura de la primera mitad. Nada está comentado, nada está señalado: están las tres cosas y punto.", M18,
   SOLDADITO + """

THE RIGHT-HAND PAGE CONTAINS EXACTLY THREE DRAWINGS AND NOTHING ELSE:
1. In the CENTRE OF THE RIGHT-HAND PAGE, drawn carefully and with attention - THREE OR FOUR
   BROKEN BONES lying on a flat stone, SPLIT LENGTHWAYS AND OPEN, and beside them one heavy
   round rock used to break them. Small, close, and looked at hard.
2. HIGH UP AND VERY SMALL, with a lot of empty paper all around it - ONE distant aeroplane
   going down at an angle, a thin trailing line of smoke behind it, no detail at all because
   it was far away. The emptiness around it is deliberate: LEAVE THAT PAPER BARE.
3. In the BOTTOM LEFT AREA OF THE RIGHT-HAND PAGE (clear of the binding), small and drawn
   quickly - ONE figure seen from above, lying face down and spread out flat on the ground,
   arms and legs pulled out wide, with FOUR SHORT PEGS driven into the ground at the wrists
   and the ankles and a short line running from each peg to each limb. Drawn plainly, without
   any emphasis, and NOT labelled.
NOTHING ELSE. No words anywhere on the page.""")

t_("CARTA 7 · M6 — LA PROMESA DEL ASADO", "carta7_m6.png",
   "🟥 La ÚNICA hoja del cuaderno donde los monigotes NO tienen casco: es lo que se imagina, no lo que ve.", M18,
   """THE RIGHT-HAND PAGE CONTAINS EXACTLY TWO DRAWINGS AND NOTHING ELSE:
1. In the UPPER TWO THIRDS OF THE RIGHT-HAND PAGE, the bigger of the two, drawn with obvious
   pleasure - A BACKYARD ASADO AT HOME.
   """ + PARRILLA.replace("\n", "\n   ") + """
   Around it, a couple of trees behind, and THREE STICK FIGURES standing near the fire.
   THESE THREE FIGURES WEAR NO HELMETS AND NO MILITARY CLOTHING - this is the one drawing in
   the whole notebook where nobody is a soldier, because it has not happened yet. Ordinary
   shirts and trousers, bare heads, and all three of them with their arms up or out, plainly
   in the middle of talking.
2. In the BOTTOM RIGHT CORNER OF THE RIGHT-HAND PAGE, small - ONE ROLLED-UP MAGAZINE jammed
   sideways into a gap in a low stone-and-turf wall to block the wind, battered and creased,
   its cover half visible.
NOTHING ELSE.""",
   """TEXT IN IMAGE (Argentine Spanish), ON THE RIGHT-HAND PAGE ONLY, handwritten in the same
blue ballpoint, small and slightly crooked, ONLY this one label and nothing else:
  - across the visible part of the magazine cover: "Estamos ganando\"""")

t_("CARTA 8 · M7 — LA RADIO SOLA", "carta8_m7.png",
   "«No me salió dibujar más nada hoy.» El vacío de la hoja ES el dibujo: chico, en el medio, y todo lo demás en blanco.", M18,
   """ONE SINGLE SMALL DRAWING IN THE MIDDLE OF A MOSTLY EMPTY PAGE: a small portable
transistor radio with its telescopic aerial pulled all the way up, sitting alone at the bottom
of a shallow empty foxhole, a few short strokes for the dug earth around it. It is DRAWN SMALL
- much smaller than the drawings on the other pages - and there is a great deal of bare ruled
paper above it, below it and on both sides.
THERE IS NOBODY IN IT AND NOTHING ELSE ON THE PAGE: no people, no other objects, no words, no
arrows, no second drawing. THE EMPTY PAPER IS THE POINT: do not fill it, do not decorate it,
do not add anything to balance the composition.""",
   None, unico=True)

t_("CARTA 9 · M8 — LA PÁGINA DEL MONTE", "carta9_m8.png",
   "🔴 LA MEJOR PÁGINA DEL CUADERNO. Vuelve en M13 y en el final: es la página que Esteban va a tener en la mano. El terito tiene que ser el terito.", M18,
   """ONE SINGLE DRAWING THAT FILLS THE RIGHT-HAND PAGE, and it is THE BEST AND MOST AMBITIOUS
THING IN THE WHOLE NOTEBOOK - he spent hours on it. It is still a biro drawing by an
untrained kid, still crooked and hatched and gone over twice, but everything he can do is in
it.
A BARE MOUNTAINSIDE SEEN FROM HIGH ABOVE, the way a pilot would see it: the slope and its rock
runs falling away, low scrub, the ground pocked with small dug positions. SCATTERED ALL OVER
IT, TINY - much smaller than anything else - DOZENS OF LITTLE FIGURES WITH THEIR ARMS RAISED,
waving upward. Each one is only a few strokes, all of them helmeted, none of them with a face.
CROSSING THE PAGE ABOVE THEM AND MUCH LARGER, seen from above and slightly behind: ONE
ATTACK JET, low over the ground, ITS WINGS TILTED OVER TO ONE SIDE mid-rock, drawn with far
more accuracy than the rest - a real swept shape, real wings, a real tail.
PAINTED SMALL ON THE FUSELAGE JUST UNDER THE COCKPIT, clearly visible and drawn with obvious
care, """ + TERITO_FORMA + """
NOTHING ELSE ON THE PAGE: no words, no arrows, no labels, no clouds, no sun, no enemy.""",
   None, unico=True)

t_("CARTA 10 · M9 — LO QUE DIBUJÓ CLARIBEL", "carta10_m9.png",
   "🟥 Mateo COPIA el dibujo de una nena de nueve años, y lo copia con la mano de ella. Es la única hoja donde el avión NO es lo mejor de la página.", M18,
   """THIS PAGE IS DIFFERENT FROM EVERY OTHER ONE: HE IS COPYING, STROKE BY STROKE, A DRAWING
MADE BY A NINE-YEAR-OLD GIRL, AND HE IS COPYING HER HAND TOO. So the three drawings on this
page are DELIBERATELY WORSE AND MORE CHILDISH than anything else in the notebook: no
perspective, no hatching, no shading at all, everything sitting on one straight ruled ground
line, the shapes simple and rounded and far too big.
OVERRIDE THE USUAL RULE: THE AEROPLANE HERE IS NOT THE BEST-DRAWN THING ON THE PAGE. It is a
child's aeroplane - a fat sausage body with two straight wings stuck on and a rectangle for a
tail - and it must look worse than the aeroplanes anywhere else in this notebook.
THE RIGHT-HAND PAGE CONTAINS EXACTLY THREE DRAWINGS, side by side along one ground line, and
nothing else:
1. A BIG ROUND SUN in the upper left with straight rays sticking out all around it like spokes.
2. THE CHILD'S AEROPLANE described above, in the middle, flying across.
3. A SOLDIER, drawn as a simple round-headed figure with a helmet too big for him and a
   rectangle for a body, STANDING STILL AND HOLDING ONE FLOWER UP in his hand - the flower
   with a round centre and five separate rounded petals.
NOTHING ELSE.""",
   """TEXT IN IMAGE (Argentine Spanish), ON THE RIGHT-HAND PAGE ONLY, handwritten in the same
blue ballpoint, small and slightly crooked, ONLY this one word and nothing else, in the corner
under the drawings: "Claribel\"""")

t_("CARTA 11 · M10 — EL AVIÓN CON PONCHO", "carta11_m10.png",
   "«No me salió. Te lo dejo igual para que te rías.» La única hoja donde le falla lo único que le sale bien — y la deja igual.", M18,
   """ONE SINGLE DRAWING, AND IT DID NOT COME OUT: an attack jet with a PONCHO thrown over it.
THE PONCHO IS THE PROBLEM. It sits on the aircraft like a blanket dumped over furniture: a
shapeless draped rectangle with a hole cut in the middle and a fringe of short strokes along
the bottom edge, and it does not follow the shape of anything underneath it. The wings
disappear where they should not, one of them comes out the wrong side, and the nose is too
long.
FOR ONCE THE AEROPLANE IS BADLY DRAWN. Break the usual rule: this is the one page where the
machine defeats him. The shape is wrong and it stays wrong.
AND HE LEFT THE EVIDENCE: beside it, TWO ABANDONED FALSE STARTS - a first outline of the same
aeroplane broken off halfway, and a second one with a single line scratched across it - both
left on the page, neither erased.
NOTHING ELSE ON THE PAGE. No words, no arrows, no other objects.""",
   None, unico=True)

t_("CARTA 12 · M11 — EL PLAN", "carta12_m11.png",
   "🟥 La ÚNICA hoja donde los dibujos SÍ están conectados entre sí: es un plan, y un plan tiene orden.", M18,
   """THIS PAGE BREAKS THE USUAL RULE ON PURPOSE: the drawings ARE connected, because this is a
plan and a plan has an order.
THE LAYOUT IS FIXED AND SIMPLE: THREE DRAWINGS SIDE BY SIDE IN ONE SINGLE HORIZONTAL ROW
ACROSS THE RIGHT-HAND PAGE, left to right, ALL THREE AT ROUGHLY THE SAME SIZE AND THE SAME
HEIGHT ON THE PAGE. None of them sits above or below the others. There is NO second row.
THERE ARE EXACTLY TWO ARROWS ON THE WHOLE PAGE AND NO MORE: one SHORT arrow in the gap between
the first and the second drawing, and one SHORT arrow in the gap between the second and the
third, both at mid-height, both the same size, both just a straight little line with a simple
V head, no longer than a thumb. THERE IS NO LONG ARROW RUNNING ACROSS THE PAGE, no arrow
between rows, no arrow anywhere else. Nothing else on the page.
1. FIRST, on the left of the row - A HOUSE WITH A BACKYARD ASADO: a simple house with a
   door, two windows and a smoking chimney, and beside it, drawn small but unmistakable, AN
   ARGENTINE PARRILLA - a brick box with a brick hood and a short chimney, a flat iron grate
   of parallel bars hanging under it with A HAND WHEEL AT ONE SIDE, a small wood fire burning
   off to ONE side and the embers raked in a thin bed under the grate, and ON THE GRATE A LONG
   RACK OF RIBS and a row of sausages. NOT a round kettle barbecue, NOT a gas grill, NO
   hamburgers and NO skewers.
2. SECOND, in the middle -
   """ + MICRO.replace("\n", "\n   ") + """
3. THIRD, on the right - CORRIENTES, drawn by someone who has never been there and is going
   on what a friend told him. THREE things and nothing else:
   - THE BRIDGE, the main sign and the biggest part of this little drawing: a long road bridge
     on TWO TALL A-SHAPED TOWERS with STRAIGHT CABLES FANNING DOWN from the top of each tower
     to the deck, the deck running flat across. Drawn carefully - it is a machine. THE BRIDGE
     ALONE IS WHAT SAYS "CORRIENTES": it does not need any other scenery to explain it.
   - Under it, only A NARROW BAND OF RIVER: a few long horizontal strokes low down, taking up
     a small part of the drawing. NOT an expanse of water, NOT a sea, NO waves, NO boats.
   - ONE RIVER FISH, drawn ABSURDLY TOO BIG - nearly as long as the bridge is wide - held up
     between TWO STICK FIGURES standing on the bank, one holding the head and one the tail,
     both in helmets and bulky jackets because that is the only way he knows how to draw
     people now. IT IS A SOUTH AMERICAN RIVER CATFISH, NOT A SEA FISH: a long low body, a
     BROAD FLAT WIDE HEAD, and LONG THIN WHISKERS (barbels) trailing back from its mouth.
     NEVER a tuna, never a rounded silvery sea fish, never a fish with a pointed snout. It is
     comically out of scale on purpose: a fisherman's story, drawn by someone who believed it.
   THERE ARE NO PALM TREES ANYWHERE ON THIS PAGE. NO tropical vegetation of any kind, NO
   coconut palms, NO beach, NO sand, NO island, NO holiday postcard scenery. This is a river
   town in the Argentine litoral, not the Caribbean.
NOTHING ELSE ON THE PAGE.""",
   """TEXT IN IMAGE (Argentine Spanish), ON THE RIGHT-HAND PAGE ONLY, handwritten in the same
blue ballpoint, small and slightly crooked, ONLY these two labels and nothing else:
  - under the house with the barbecue: "el asado"
  - under the bridge: "Corrientes\"""")

t_("CARTA 13 · M12 — LO QUE TALLÓ", "carta13_m12.png",
   "🔴 No es un dibujo de un objeto: es el dibujo de unas letras GRABADAS. Las letras están talladas, torcidas, hechas a punta de navaja — no escritas con birome.", M18,
   """ONE SINGLE DRAWING THAT FILLS THE RIGHT-HAND PAGE: A ROUGH WOODEN BEAM, a squared-off
timber propping the roof of a dugout, seen straight on and close, its grain and its splits
drawn with long strokes and its ends disappearing off the edges of the drawing.
CUT DEEP INTO THAT BEAM, LARGE, ACROSS TWO LINES, ARE CARVED LETTERS. They are NOT handwriting
and NOT ballpoint script: they are GOUGED CAPITALS, cut with the point of a knife, each stroke
a straight chopped groove with rough splintered edges, the letters uneven in size, tilting,
sitting crooked on the beam, some deeper than others, the wood chipped where the blade slipped.
They are drawn - in blue ballpoint like everything else - as CARVED MARKS: shown with a dark
inner groove and a lighter chipped edge so they read as cut INTO the wood and not written on it.
LYING OPEN ON THE BEAM below the carving, small: the folding pocket knife with the worn horn
handle and the nicks along it - the same knife from the earlier page - its blade dull and
marked.
NOTHING ELSE ON THE PAGE: no people, no background, no decoration.""",
   """TEXT IN IMAGE (Argentine Spanish), carved into the beam in ROUGH CROOKED CAPITALS as
described - not handwriting - on two lines, and these are the ONLY words on the page:
  VAMOS A VOLVER
  LOS PIBES DE MALVINAS""",
   unico=True)

t_("CARTA 14 · M13 — LA ÚLTIMA PÁGINA", "carta14_m13.png",
   "🟥 PROPUESTA: el guion no dice qué dibujó acá. Propongo el sapito — el mismo plano de P.1b, quince años después y con la mano de los 18. Es la última página del cuaderno.", M18,
   """ONE SINGLE SMALL DRAWING IN THE MIDDLE OF AN OTHERWISE EMPTY PAGE, and it is the same
subject as the very first drawing in this notebook, done years later by an older hand: seen
from very low, almost at water level, A FLAT STONE SKIPPING ACROSS THE SURFACE OF THE WATER,
caught mid-bounce, with THREE SMALL RINGS OF RIPPLES trailing behind it marking the three
previous bounces, a thin spray of droplets, and a low far bank.
IT IS DRAWN BETTER THAN THE CHILD'S VERSION: the water is real water now, built from long
confident horizontal strokes with the ripple rings sitting properly in it, the stone has weight
and an angle, there is depth between the near water and the far bank. Still crooked, still
hatched, still a biro - but this is a young man's drawing, not a child's.
NOBODY IN THE FRAME. NOTHING ELSE ON THE PAGE: no aeroplane, no people, no words, no arrows.
A great deal of the paper is left bare.""",
   None, unico=True)


# ============================== ESCRIBIR ==============================
CAB = """> **Documento generado. No se edita a mano.**
> `python3 produccion/hacer_prompts_listos.py`
> Los bloques de estilo, la calibración de la mano de Mateo y el candado de época ya están
> ADENTRO de cada prompt: **se copia el bloque entero y se pega.**

"""

with open(os.path.join(BASE,"historia","PROMPTS_AIRE_LISTOS.md"),"w",encoding="utf-8") as fh:
    fh.write("# PROMPTS LISTOS — REGISTRO `[AIRE]`\n\n" + CAB +
             "**Formato:** 16:9 · **Placas sin personas** (se componen encima) · **Retratos y figuras** sobre fondo recortable.\n\n---\n\n" +
             "# PLACAS\n\n" + "".join(A) +
             "---\n\n# RETRATOS *(busto para la caja de diálogo)*\n\n" + "".join(R) +
             "---\n\n# FIGURAS EN ESCENA *(cuerpo entero, para componer sobre la placa)*\n\n" + "".join(F))

with open(os.path.join(BASE,"historia","PROMPTS_TIERRA_LISTOS.md"),"w",encoding="utf-8") as fh:
    fh.write("# PROMPTS LISTOS — REGISTRO `[TIERRA]` *(el cuaderno de Mateo)*\n\n" + CAB +
             """**16 prompts: los 2 recuerdos del prólogo + las 14 páginas del cuaderno**, una por misión.

| # | Archivo | Misión | Qué hay dibujado |
|---|---|---|---|
| P.1a | `p1a_arroyo.png` | recuerdo | el arroyo, el Rastrojero y un avión — mano de los 8 |
| P.1b | `p1b_sapito.png` | recuerdo | la piedra rebotando — mano de los 8 |
| 1 | `carta1_p4.png` | P.4 | el mar, el jujeño y el sapito · el 60 · el mapa con Malvinas · el guiso |
| 2 | `carta2_m1.png` | M1 | el Colorado tapando la trinchera *(un solo dibujo)* |
| 3 | `carta3_m2.png` | M2 | los que cantan en el pozo · la lata · la carpa de Bordón |
| 4 | `carta4_m3.png` | M3 | la navaja · las manos pelando un palo · el fuego · el bolsillo |
| 5 | `carta5_m4.png` | M4 | el barco chueco y el avioncito que gana *(un solo dibujo)* |
| 6 | `carta6_m5.png` | M5 | 🟥 los huesos partidos · el avión que cae lejos · el estaqueado |
| 7 | `carta7_m6.png` | M6 | 🟥 el asado que no pasó *(la única hoja sin cascos)* · la revista |
| 8 | `carta8_m7.png` | M7 | la radio del jujeño sola en el pozo *(hoja casi vacía)* |
| 9 | `carta9_m8.png` | M8 | 🔴 **la página del monte** — la mejor del cuaderno, con el terito |
| 10 | `carta10_m9.png` | M9 | 🟥 el dibujo de Claribel copiado con mano de nena de 9 |
| 11 | `carta11_m10.png` | M10 | el avión con poncho que no le salió, con los dos intentos fallidos |
| 12 | `carta12_m11.png` | M11 | 🟥 el plan, con flechas *(la única hoja conectada)* |
| 13 | `carta13_m12.png` | M12 | 🔴 el VAMOS A VOLVER tallado en la viga, y la navaja |
| 14 | `carta14_m13.png` | M13 | 🟥 el sapito otra vez, con la mano de los 18 — la última página |

🟥 = el guion no dice qué dibujó ahí; es propuesta y está anotada en GUION_3 para que la
apruebes o la cambies.

**Las cartas son el CUADERNO ABIERTO en 16:9:** carilla izquierda en blanco (la carta la
tipografía el motor) y carilla derecha con los dibujos, **sueltos y sin escena compartida**.

**EL CUADERNO NO CAMBIA NUNCA.** Es el mismo objeto físico en las cuatro cartas: anillado
de alambre negro doble en el centro, papel crema, renglones impresos gris-celeste sin margen
rojo, borde oscuro con esquinas redondeadas. La referencia es `ref/cuaderno_canon.jpg` (la
carta 2, que salió bien). **Lo único que cambia de una carta a otra son los dibujos de la
carilla derecha.**

**UNA SOLA BIROME AZUL, siempre.** Mateo tiene un cuaderno y una Bic: no hay negro, no hay
rojo, no hay lápiz, no hay blanco. Los únicos dos colores de la imagen son el azul de la
tinta y el crema del papel; lo oscuro se consigue rayando más fuerte. El candado va al
principio de los seis prompts.

**Dos manos distintas, y la diferencia es el paso del tiempo:** P.1 lo dibujó **Mateo a los
8** (una línea de piso, sin perspectiva, sin sombreado, cabezas enormes, trazo fuerte y
repasado) y las cartas **Mateo a los 18**. **El avión es lo único que no cambia:** en las dos
manos es lo mejor de la página.

---

""" + "".join(T))
print("OK")
