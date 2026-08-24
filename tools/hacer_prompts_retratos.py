#!/usr/bin/env python3
"""
hacer_prompts_retratos — arma PROMPTS_RETRATOS_LISTOS.md, una hoja por personaje.

POR QUE UN GENERADOR Y NO OCHO BLOQUES ESCRITOS A MANO. Las ocho hojas tienen que salir con la
MISMA GRILLA —mismas celdas, mismos espacios, misma escala de cabeza— porque los retratos se
alternan en la misma caja de dialogo: si en uno la cabeza es mas grande, al cambiar de hablante
el busto salta. Copiado ocho veces, ese bloque se desincroniza en la primera correccion que
alguien haga en uno solo y nadie se entera hasta ver el juego. Aca es literalmente el mismo
string ocho veces.

Lo unico que cambia entre hojas es el personaje: su numero en team.png, su lamina, su intencion,
su fisico y como se le lee cada una de las seis expresiones.

    python3 tools/hacer_prompts_retratos.py
"""
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
SALIDA = RAIZ / 'docs' / 'historia' / 'PROMPTS_RETRATOS_LISTOS.md'

# LAS SEIS EXPRESIONES son fijas y en este orden para los ocho. Las cinco primeras son las mismas
# para todos; la sexta es la propia de cada personaje — misma celda, contenido distinto.
RANURAS = ['neutro', 'sonrisa', 'preocupado', 'ceno', 'roto', None]

ESTILO = """Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug (SNK Neo Geo
era), hand-drawn sprite look, chunky black pixel outlines, expressive exaggerated
character poses and faces, rich dithered shading, saturated military palette of
olive drab, steel blue-grey, silver and warm sand with a single red accent when
noted, dramatic cinematic side-scroller composition, crisp clean pixels, no
anti-aliasing, no photorealism, no 3D render, no smooth digital painting."""

# LA GRILLA. Este texto es identico en las ocho hojas — es lo que hace que la familia se lea como
# familia. Si hay que cambiarlo, se cambia ACA y se regenera: nunca en una hoja sola.
NUM = {1: 'ONE', 2: 'TWO', 3: 'THREE', 4: 'FOUR', 5: 'FIVE', 6: 'SIX'}

def grilla(n):
    """El bloque de formato de la hoja. Es el MISMO texto para todas, salvo la cantidad de celdas.

    Vive en una funcion y no en ocho copias porque es justo lo que no se puede desincronizar: si
    en una hoja la cabeza sale mas grande, al cambiar de hablante en la caja de dialogo el busto
    SALTA, y eso no se ve hasta jugar. Aca es literalmente el mismo string.
    """
    N, plural = NUM[n], 'cell' if n == 1 else 'cells'
    return f"""SHEET FORMAT - follow this exactly, it is the same for every character in this cast:
a SINGLE HORIZONTAL ROW of {N} {plural}. Each cell is EXACTLY SQUARE, so the finished
image is exactly {'as wide as it is tall' if n == 1 else f'{N.lower()} times as wide as it is tall'}. The cells sit edge to edge: no
gutters, no gaps, no frames, no borders, no rounded corners, no shadows between
them. Flat mid-grey background inside every cell, the same grey as IMAGE 1.

FRAMING - identical in all {n} {plural}: portrait bust, three-quarter view facing
slightly LEFT, eyes toward camera. The bottom edge cuts across the upper chest,
just below the collar - the waist, the arms and the hands are OUTSIDE the frame
and must not appear. The head is the SAME SIZE in all {n} and the eyes sit at the
SAME HEIGHT in all {n}. Leave a little clear space above the hair in every cell.
If the head does not fit, draw it SMALLER - never lower the crop.

The ONLY thing that changes from cell to cell is the FACIAL EXPRESSION.

SCALE NOTE: these will be displayed at 108x108 pixels. Build each expression out of
EYEBROW DIRECTION, MOUTH SHAPE and HEAD ANGLE, which survive at that size. Do not
rely on fine wrinkles or small details to carry an expression."""

CANDADOS = """PERIOD LOCK - Argentina 1982: no modern military equipment, no digital or woodland
camouflage, no nylon webbing, no NATO or US insignia, no invented unit patches, no
name tapes.

ABSOLUTELY NO TEXT anywhere: no letters, no labels, no cell numbers, no captions
under the faces, no watermark, no signature. The cells are unlabelled."""

P = [
 dict(id='tero', nom='TERO · Esteban', n=3, orden='THIRD', lam='tero3.png',
      intent='A GOOD MAN WHO IS SUFFERING. The kindness and the pain are visible at the same\ntime. Tired and sad, never hard, never threatening.',
      cara="""Argentine air force pilot, late thirties. The most gaunt face of the cast: hollow
cheeks, high cheekbones, deep lines beside the mouth, dark shadows under the eyes.
MOROCHO - weathered olive-brown criollo skin, clearly darker than the pale pilot in
the line-up. Dark hair combed back with STRONG GREY AT THE TEMPLES. Straight dark
eyebrows, a fine straight nose, a thin mouth, a long thin neck. Olive flight suit
with a chest harness, collar open.""",
      exp=['level eyebrows, mouth closed and relaxed. Tired but composed and watching.',
           'one corner of the mouth up, eyebrows lifted a fraction. Almost nothing - it must read as rare on him.',
           'inner ends of the eyebrows pulled down, jaw set, mouth a thin line. He is hiding it and it shows anyway.',
           'eyebrows hard down, eyes narrowed, mouth flat. Cold rather than loud.',
           'eyebrows high and collapsed in the middle, mouth open and slack, eyes unfocused. He has just been told something.'],
      propia=('casco', 'HELMETED - the neutral face of cell 1, now wearing the white flight helmet\n  with the green oxygen mask unclipped and hanging to one side. The helmet must not\n  hide his eyes or eyebrows.')),
 dict(id='puma', nom='PUMA', n=4, orden='FOURTH', lam='puma.png',
      intent='THE AUTHORITY THAT DOES NOT NEED TO MOVE. Solid, unhurried, has seen all of this\nbefore and is not surprised by any of it.',
      cara="""Argentine air force squadron leader, forties. The WIDEST face of the cast: broad and
square, straight heavy jaw. Fair weathered skin. THICK SILVER-GREY HAIR, plenty of
it, combed back - not balding, not cropped. Heavy grey eyebrows. HEAVILY HOODED
EYES, almost closed, lines at the corners. A grey walrus moustache dropping past the
corners of the mouth. Straight, ordinary-sized nose. Nothing on his head. Brown
leather flight jacket collar at the neck.""",
      exp=['completely level and unreadable, mouth a straight line under the moustache. Giving an order he has given a hundred times.',
           'a genuine warm smile, eyes crinkling. He gives this away almost never - for one second he must look like a kinder man.',
           'eyebrows drawn together, eyes open wider than usual. On him, worry reads as attention.',
           'eyebrows hard down, mouth tight. Displeased and about to say why.',
           'eyes closed or nearly, head lowered a fraction, the moustache hiding a mouth that has given up.'],
      propia=('duda', 'THE DOUBT - eyebrows up and uneven, eyes off to one side, mouth slightly open as\n  if a sentence stopped halfway. A man about to disobey. Not angry, not sad -\n  unmoored.')),
 dict(id='gitano', nom='GITANO', n=5, orden='FIFTH', lam='gitano.png',
      intent='SMILING IS HIS RESTING STATE, not a reaction to anything. Which is exactly what\nmakes cells 3 to 6 land.',
      cara="""Argentine air force pilot, thirties. VERY CURLY VOLUMINOUS BLACK HAIR, tight curls
standing high - the first thing anyone sees of him. Olive-bronze criollo skin. Round
face, high cheekbones, wide mouth, large lively dark eyes, straight broad nose. NOT
of African descent: no afro-textured hair, no sub-Saharan features - he is a
sun-darkened criollo of the Argentine interior. Olive flight suit zipped closed to
the top.""",
      exp=['a wide easy open grin, eyes crinkled, head tilted. THIS IS HIS DEFAULT, not a reaction.',
           'head back, mouth wide open in a full laugh, eyes squeezed shut.',
           'the grin gone, eyebrows up and pinched, eyes wide. On him this reads as alarm because the smile is missing.',
           'completely straight-faced, level eyebrows, flat steady eyes. Really blank - do not let a hint of a smile survive. On this man a blank face is frightening.',
           'grin completely gone, eyebrows collapsed inward, mouth open, eyes wet.'],
      propia=('risa_apagada', 'THE GRIN COLLAPSING - the hardest cell. His grin caught HALFWAY through falling\n  apart: the mouth is still shaped like the smile, the eyes and eyebrows have\n  already dropped and gone elsewhere. Half a second of an older, sadder man showing\n  through. Do NOT resolve it into either a smile or a sad face.')),
 dict(id='vasco', nom='VASCO', n=8, orden='EIGHTH AND LAST, on the far right, the tallest', lam='vasco2.png',
      intent='A RETIRED MAFIOSO, OR A VAMPIRE: pale, still, quietly dangerous. Nothing warm.\nHe is NOT the gaunt sad pilot who also has dark hair - that one is kind and tired,\nthis one is cold.',
      cara="""Argentine air force pilot of Basque descent, thirties. THE PALEST SKIN OF THE CAST.
Long angular face, very pronounced square jaw, high cheekbones. JET-BLACK HAIR
combed straight back with volume on top - NO grey anywhere. Straight heavy black
eyebrows. A LARGE straight nose. Deep-set light eyes with a fixed hard stare. A thin
mouth held in a straight line. Olive flight suit zipped to the chin, a large silver
crucifix on a red cord outside the collar.""",
      exp=['shut. Mouth closed, eyes lowered a fraction, level eyebrows. Gives nothing away.',
           'the smallest possible change: one corner of the mouth barely lifted. He is not smiling, he is ALMOST smiling.',
           'eyes slightly wider, eyebrows level still. Even his worry is contained.',
           'jaw set hard, eyebrows down, the stare gone from cold to furious. The only cell where he shows heat.',
           'eyes closed, head lowered. Grief held completely still.'],
      propia=('rezo', 'IN PRAYER - eyes closed, head bowed a little, mouth moving on a word. The one\n  moment where the stillness is devotion instead of threat.'),
      nota='**Su pobreza de expresión ES el personaje.** Las seis celdas tienen que ser **casi\nindistinguibles entre sí** — mucho más parecidas que las de cualquier otro. Si se le nota la\ndiferencia de lejos, está mal.'),
 dict(id='pichon', nom='PICHÓN', n=6, orden='SIXTH', lam='pichon3.png',
      intent='A BOY TRYING TO LOOK LIKE HE BELONGS among men.',
      cara="""Argentine air force pilot, NINETEEN - he must read as a BOY among adults, not as a
short man. Round face, no defined jaw, no facial hair. CLEAR FRECKLES across the
nose and cheeks. Short messy black hair with a loose fringe. DARK EYEBROWS ANGLED UP
AT THE INNER ENDS, which leave him looking apologetic even when he smiles. Large
brown eyes with a lot of white showing. The narrowest shoulders of the pilots. Olive
flight suit with a chest harness.""",
      exp=['open and attentive, mouth slightly parted, eyebrows up. Even his neutral looks eager.',
           'open-mouthed wonder, eyebrows high, eyes wide and shining. A boy who just saw something wonderful.',
           'eyebrows high and straight, eyes very wide and fixed, mouth a small tight line. Not screaming - frozen.',
           'trying to look hard and not managing it. Eyebrows forced down over eyes that are still soft.',
           'face open, eyes wet, mouth trembling. He has not learned to hide anything yet.'],
      propia=('auriculares', 'LISTENING HARD - wearing period padded radio headphones over the ears, eyes\n  narrowed in concentration, mouth closed, head tilted slightly. Not scared -\n  absorbed.')),
 dict(id='turco', nom='TURCO', n=7, orden='SEVENTH', lam='turco3.png',
      intent='THE GRUMPY CRAFTSMAN who does everything with care. The grumbling is the surface;\nthe care is the man.',
      cara="""The squadron mechanic, fifties, heavy-set. Syrian-Lebanese Argentine features, strongly
drawn: a LARGE, BROAD, PROMINENT NOSE, slightly bulbous at the tip, which dominates
the whole face. THE DARKEST, most weathered skin of the cast. VERY THICK ARCHED
EYEBROWS, black going grey. LARGE PROTRUDING EYES with a lot of white. A wide WHITE
moustache covering the upper lip, and a short white beard on the chin. Large ears
standing out. BALD ON TOP with grey at the sides. HE ALWAYS WEARS A KHAKI CLOTH CAP
WITH AVIATOR GOGGLES RESTING ON IT - the cap and goggles appear in ALL SIX cells,
they are how he is recognised. Stained blue-grey coverall collar at the neck.""",
      exp=['eyebrows down, mouth hidden under the moustache, unimpressed. His default.',
           'the same gruff face with one crooked corner of the mouth lifted and the eyes gone warm. Tenderness he would deny having.',
           'the big eyebrows up, eyes wider, mouth open under the moustache. Alarm on a man who is never alarmed.',
           'eyebrows down hard, eyes fixed. The look he gives a job done badly.',
           'eyebrows collapsed, eyes closed or nearly, head lowered.'],
      propia=('orgullo', 'PRIDE - chin slightly up, eyes bright, a small closed satisfied smile under the\n  moustache. The face he makes when everyone came back.')),
 dict(id='mateo', nom='MATEO', n=2, orden='SECOND', lam='mato32.png',
      intent='THE BOY WHO WRITES. He is eighteen and he is trying to sound fine in every letter.',
      cara="""An 18-year-old Argentine conscript. HEAD SHAVED to the scalp, military crop. Golden
tanned criollo skin. TRIANGULAR face: narrow jaw, pointed chin. THICK STRAIGHT BLACK
EYEBROWS. LARGE dark brown eyes, very expressive. Ears standing out. He must read as
the son of the gaunt pilot in the line-up: same eye shape, same nose. Olive winter
parka with a pale synthetic fur hood collar.""",
      exp=['mouth closed, eyebrows level, looking straight out. Younger than he is trying to look.',
           'an easy young closed-mouth grin, a bit cheeky. Nothing has happened to him yet.',
           'eyebrows up and pinched, eyes wide, mouth small. Trying not to show it.',
           'eyebrows down, mouth tight. Anger that has nowhere to go.',
           'eyes wet, mouth open, face undefended. He is still a kid.'],
      propia=('frio', 'COLD - jaw clenched, shoulders drawn up into the frame, eyebrows pinched, the fur\n  hood pulled up over the shaved head. Not sad, just very very cold.'),
      nota='🔴 **Mateo tiene un SEGUNDO estado** en su lámina: pelo crecido, sucio, ojeroso, después de\nsemanas en la isla. **Generar esta hoja dos veces** — una con la cabeza rapada y limpia\n(`mateo_*`) y otra con el segundo estado (`mateo2_*`), cambiando solo esa descripción. Las cartas\nde M1 y las de M8 no las escribe el mismo chico.'),
 dict(id='colorado', nom='COLORADO', n=1, orden='FIRST, on the far left', lam='colorado3.png',
      intent='THE ONE WHO GIVES. Human warmth in a freezing place.',
      cara="""An Argentine army corporal, thirties. VERY FAIR SKIN with STRONG RED FLUSH on the
cheeks and the nose, from the cold - it is his marker. REDDISH FRECKLES. RED HAIR,
mostly hidden under a DARK GREY WOOL BEANIE with a turned-up brim, worn in ALL SIX
cells. RED-BLONDE EYEBROWS, so pale they are almost invisible. LIGHT BLUE EYES. Round
broad face, thick neck. Olive field jacket collar at the neck.""",
      exp=['relaxed and open, mouth closed, eyebrows level. Friendly at rest.',
           'a huge open smile with all the teeth showing and dimples. The warmest face in the game.',
           'eyebrows up and together, eyes softened. Worried about somebody else, not himself.',
           'eyebrows down, jaw forward. Rare on him, and all the louder for it.',
           'the smile gone completely, eyes down, mouth closed. On this face, absence of the smile is the whole expression.'],
      propia=('ofreciendo', 'OFFERING - head tilted forward and down a little, eyebrows raised in the middle,\n  a small encouraging smile, eyes on someone lower than him. The face of a man\n  holding something out to you.')),
]

def hoja(p):
    ids = [f'{p["id"]}_{r}' for r in RANURAS[:5]] + [f'{p["id"]}_{p["propia"][0]}']
    celdas = '\n'.join(
        f'CELL {i+1} - {n.upper()}: {t}' for i, (n, t) in
        enumerate(zip(['neutral', 'smile', 'worried', 'anger', 'broken'], p['exp'])))
    txt = f"""## {p['nom']} — 6 celdas

**Adjuntar:** `final/{p['lam']}` *(IMAGE 1)* · `final/team.png` *(IMAGE 2)*

```
{ESTILO}

IMAGE 1 is this character's finished model sheet. Copy his clothing, his colouring
and his line work exactly, and match its rendering precisely: same line weight,
same shading, same flat mid-grey background.
IMAGE 2 is the full cast line-up. This character is the {p['orden']} figure. Copy his
build and his face from there. The other seven are the rest of the cast and he must
stay clearly different from every one of them.

INTENT, and this matters more than any feature below: he is {p['intent']}

CHARACTER, identical in all six cells:
{p['cara']}

{grilla(6)}

EXPRESSIONS, left to right:
{celdas}
CELL 6 - {p['propia'][1]}

{CANDADOS}
```

**Cortar con:**

```bash
python3 tools/install_retratos.py <la-hoja-generada>.png --anclaje pad {' '.join(ids)}
```
"""
    if p.get('nota'):
        txt += f"\n> {p['nota']}\n"
    return txt


# ---------------------------------------------------------------------------------------------
# LOS QUE NO ESTAN EN team.png
#
# Dos reglas OPUESTAS conviven en este grupo, y confundirlas arruina el prologo:
#
#   'nuevo'  -> team.png se adjunta SOLO por el trazo. La cara tiene que ser de OTRA persona, que
#               no se parezca a ninguno de los ocho. Es el caso de Norma, el peruano, Claribel y
#               el pibe de la 10.
#   'puente' -> al reves: TIENE que ser la misma persona que su version adulta, veinte o cuarenta
#               años antes. Esteban joven y Mateo nene existen para que el jugador los reconozca
#               sin que nadie se lo diga; si no se reconocen, la escena del arroyo es la de dos
#               desconocidos y el prologo no cierra.
#
# Y la trampa a evitar en los 'puente': NO es "el mismo descriptor pero mas joven". Ese atajo
# arrastra la ropa, y la ropa es de otra decada — deja a Esteban con el mono de vuelo del 82
# sentado junto a un arroyo diez años antes. Se conserva la CARA y se cambia todo lo demas.
SEC = [
 dict(id='norma', nom='NORMA — la madre', n=4, modo='nuevo', lam=None,
      intent='THE ONE WHO WAITS. Everything happens to other people and reaches her as news.',
      cara="""An Argentine woman of about 48, from a modest household, in 1982. Criollo interior
features, a soft square face, dark hair going grey at the temples and pulled back
tightly. Warm brown eyes with fine lines at the corners, a small mouth. Plainly
dressed: a flowered apron over a plain house dress, the SAME flowered apron in every
cell. A wedding ring is the only jewellery. NOTHING military or patriotic: no
cockade, no flag, no insignia of any kind - she is a housewife in her own kitchen.""",
      exp=[('neutro', 'level and quiet, mouth closed, eyes on something out of frame. Listening to a radio.'),
           ('calida', 'a real settled smile, eyes soft, head tilted a little. The face of somebody\'s mother.'),
           ('seria', 'the smile gone, eyebrows level, mouth closed and firm. She has decided not to say something.'),
           ('rota', 'eyes closed, eyebrows collapsed inward, chin down. Grief held quietly, in a kitchen.')],
      nota='Su hoja de personaje decia *«casi siempre vista de espaldas o de perfil»* — no verle la cara era un dispositivo de guion. **Pedir este retrato resuelve esa contradiccion a favor del canon 3.4** («Norma habla y se la ve»). La regla de la espalda sigue valiendo para las escenas completas; el retrato es la excepcion.'),
 dict(id='peruano', nom='EL PILOTO PERUANO', n=3, modo='nuevo', lam=None,
      intent='THE ONLY OUTSIDER IN THE ENTIRE GAME. Courteous, professional, and wrecked by a very long flight.',
      cara="""A Peruvian air force pilot, around 40, in 1982. Mestizo Andean features - a broader,
flatter face than the Argentine cast, strong prominent cheekbones, straight black
hair, bronze skin. He must NOT look like any of the eight Argentines: different bone
structure, different colouring.
VISIBLY EXHAUSTED from hours in the air: heavy eyelids, slack jaw, dark shadows under
the eyes, and A RED PRESSURE MARK ACROSS THE FOREHEAD where the helmet sat. A plain
flight suit with NO country insignia and NO patches of any kind, collar open.""",
      exp=[('neutro', 'level eyebrows, heavy eyelids, mouth closed. Tired to the bone and still standing.'),
           ('cortes', 'a small polite smile that does not reach the tired eyes. A professional being kind.'),
           ('serio', 'eyebrows down, eyes steady, mouth firm. Explaining something that matters.')]),
 dict(id='claribel_nena', nom='CLARIBEL — la nena, 1982', n=3, modo='nuevo', lam=None,
      intent='A NINE-YEAR-OLD WHO WROTE A LETTER TO A SOLDIER SHE HAD NEVER MET.',
      cara="""An Argentine girl, EXACTLY 9 years old, from San Luis province, in 1982. Criollo
interior features: olive-tan skin, dark brown hair in two plaits with a fringe, big
dark eyes, and A GAP where a milk tooth is missing. Over her clothes she wears the
white apron-smock of an Argentine public primary school, in every cell.
She must NOT resemble any of the adult cast.""",
      exp=[('timida', 'looking slightly up and away, a small closed smile, eyebrows raised. Shy of being looked at.'),
           ('sonrisa', 'a wide open grin with the gap tooth showing, eyes squeezed happy.'),
           ('seria', 'mouth closed, eyebrows level, eyes straight ahead. A child concentrating on doing something properly.')],
      nota='**Claribel se genera DOS VECES y las dos hojas tienen que leerse como la misma persona.** Generá primero la nena, y después la grande **con la hoja de la nena adjunta**: mismos ojos, misma forma de cara. En el juego **nadie lo explica nunca** — el jugador se tiene que dar cuenta solo, y por eso el parecido es todo.'),
 dict(id='claribel', nom='CLARIBEL — la seño, presente', n=3, modo='nuevo', lam=None,
      intent='THE SAME GIRL, forty-four years later. Warm and tired. Nobody ever explains who she is.',
      cara="""An Argentine schoolteacher, a woman of about 53, from San Luis, PRESENT DAY.
SHE IS THE SAME PERSON as the nine-year-old girl: same eye shape, same face shape,
same colouring. Dark hair going grey, cut short. Reading glasses pushed up into the
hair. Plain public-school clothes, a cardigan. A kind, worn face with laugh lines.
She must NOT resemble any of the 1982 cast.""",
      exp=[('neutro', 'level and attentive, mouth closed. A teacher listening to a child.'),
           ('calida', 'a settled kind smile with something older behind the eyes.'),
           ('emocionada', 'eyebrows up in the middle, eyes bright and wet, mouth trying to hold a smile. She has just recognised something.')]),
 dict(id='pibe_diez', nom='EL PIBE DE LA 10', n=3, modo='nuevo', lam=None,
      intent='A SMALL CHILD IN A COUNTRY THAT ALREADY WON. He has no idea what any of it cost.',
      cara="""An Argentine boy, FOUR OR FIVE YEARS OLD, PRESENT DAY. A round toddler face, chubby
cheeks, soft messy dark hair, huge dark eyes, a small nose. Criollo features.
He wears an ARGENTINA FOOTBALL SHIRT with THREE STARS above the crest - the three
stars must be large, clearly separated and readable without anyone pointing at them,
and must appear in every cell.
He must NOT resemble any other child or adult in the cast.""",
      exp=[('asombro', 'mouth open, eyebrows high, eyes enormous. Looking up at something much bigger than him.'),
           ('risa', 'eyes squeezed shut, mouth wide open laughing, head back.'),
           ('timido', 'chin tucked down, looking up from under the eyebrows, a small closed smile.')]),
 dict(id='esteban_joven', nom='ESTEBAN JOVEN — ~1972', n=3, modo='puente', lam='tero3.png',
      puente='the SAME MAN as IMAGE 1, but around 30 years old, twenty years earlier',
      intent='THE SAME GOOD MAN, before anything happened to him. Warm, unhurried, whole.',
      cara="""Around 30 years old, in rural Argentina in the early 1970s. Same bone structure, same
nose, same eye shape and same long neck as IMAGE 1 - but YOUNGER: hair fuller and
COMPLETELY BLACK, with NO GREY ANYWHERE (the grey at the temples is exactly what
twenty years did to him, and it has not happened yet). Face unweathered - none of the
hollow cheeks, none of the deep lines beside the mouth, none of the shadows under the
eyes.
HE IS NOT A PILOT HERE AND WEARS NOTHING MILITARY: an open-collared worn cotton work
shirt with the sleeves rolled, nothing on his head, no flight suit, no chest harness,
no helmet, no insignia of any kind. Summer in the countryside.""",
      exp=[('calido', 'looking slightly down as if toward a small child beside him, a real open smile, eyebrows relaxed. The warmest face in the game.'),
           ('serio', 'level eyebrows, mouth closed, looking straight ahead. Teaching something that matters.'),
           ('risa', 'head back, an open laugh, eyes crinkled. He laughs easily at this age.')],
      periodo="""PERIOD LOCK - rural Argentina, EARLY 1970s. Nothing military, nothing from 1982, no
flight equipment, no modern clothing, no printed graphics on the shirt."""),
 dict(id='mateo_nene', nom='MATEO NENE — 8 años, ~1972', n=3, modo='puente', lam='mato32.png',
      puente='the SAME BOY as IMAGE 1, but eight years old, ten years earlier',
      intent='A CHILD BEING TOLD SOMETHING BY HIS FATHER AND BELIEVING ALL OF IT.',
      cara="""An Argentine boy, EXACTLY 8 years old, skinny, in the rural interior in the early
1970s. Same eye shape, same eye colour and same black hair as IMAGE 1 - he must read
as the same child. Olive-tan skin, messy black hair CUT AT HOME - not shaved, the
military crop has not happened yet - and big dark eyes.
Summer clothes of the Argentine countryside: a worn short-sleeved cotton shirt,
nothing on his head. A smudge of blue ink on one cheek. NOTHING MILITARY: no helmet,
no parka, no webbing, no uniform of any kind.""",
      exp=[('asombro', 'looking up and slightly to the side as if at an adult standing beside him, mouth open, eyebrows high, completely absorbed.'),
           ('risa', 'eyes squeezed shut, mouth wide open, head back.'),
           ('serio', 'mouth closed, eyebrows level, eyes straight ahead. Trying to look like a grown-up.')],
      periodo="""PERIOD LOCK - rural Argentina, EARLY 1970s. Nothing military, nothing from 1982, no
modern sportswear, no printed graphics on the shirt, no modern haircut."""),
]

NO_TEXTO = """ABSOLUTELY NO TEXT anywhere: no letters, no labels, no cell numbers, no captions
under the faces, no watermark, no signature. The cells are unlabelled."""

PERIODO_DEF = """PERIOD LOCK - Argentina 1982: no modern military equipment, no NATO or US insignia,
no invented unit patches, no name tapes."""

REF_NUEVO = """IMAGE 1 is the cast line-up. Copy its RENDERING ONLY: the line weight, the dithered
shading, the palette, the flat mid-grey background, the sprite proportions.
DO NOT COPY ANY FACE FROM IT. This is a different person who has never appeared
before and must not resemble any of the eight figures in IMAGE 1 - not their face,
not their hair, not their build."""


def hoja_sec(p):
    ids = [f'{p["id"]}_{n}' for n, _ in p['exp']]
    celdas = '\n'.join(f'CELL {i+1} - {n.upper()}: {t}' for i, (n, t) in enumerate(p['exp']))
    if p['modo'] == 'puente':
        refs = (f"IMAGE 1 is this character's ADULT model sheet. He is {p['puente']}.\n"
                "Copy the bone structure, the eyes, the nose and the colouring from IMAGE 1, then\n"
                "make him younger as described below. Someone who knows the adult must recognise\n"
                "him here WITHOUT being told.\n"
                "IMAGE 2 is the cast line-up - copy its rendering only: line weight, shading, flat\n"
                "mid-grey background. Do not copy anyone's face from it.")
        adj = f"`final/{p['lam']}` *(IMAGE 1 — la versión adulta)* · `final/team.png` *(IMAGE 2 — solo el trazo)*"
    else:
        refs = REF_NUEVO
        adj = "`final/team.png` *(IMAGE 1 — **solo** por el trazo)*"
    txt = f"""## {p['nom']} — {p['n']} celdas

**Adjuntar:** {adj}

```
{ESTILO}

{refs}

INTENT, and this matters more than any feature below: {p['intent']}

CHARACTER, identical in all {p['n']} cells:
{p['cara']}

{grilla(p['n'])}

EXPRESSIONS, left to right:
{celdas}

{p.get('periodo', PERIODO_DEF)}

{NO_TEXTO}
```

**Cortar con:**

```bash
python3 tools/install_retratos.py <la-hoja-generada>.png --anclaje pad {' '.join(ids)}
```
"""
    if p.get('nota'):
        txt += f"\n> {p['nota']}\n"
    return txt


CAB = """# RASANTE — Las hojas de rostros, una por personaje

**Ocho hojas, una por personaje, todas con la MISMA GRILLA: seis celdas cuadradas en fila, misma
escala de cabeza, misma altura de ojos.** Eso es lo que hace que la familia se lea como familia —
los retratos se alternan en la misma caja de diálogo, y si en uno la cabeza es más grande, al
cambiar de hablante el busto salta.

> 📐 **El respaldo de estas decisiones** —las alturas medidas, la cara de cada uno y la
> intención de cada lámina— está en [`RETRATOS_CANON.md`](RETRATOS_CANON.md).

> ⚙ **Este archivo lo genera [`tools/hacer_prompts_retratos.py`](../../tools/hacer_prompts_retratos.py).**
> El bloque de grilla es literalmente el mismo string en las ocho hojas. **No editar acá**: se
> toca el script y se regenera, o las hojas se desincronizan y nadie se entera hasta ver el juego.

## Las seis expresiones

Las cinco primeras son iguales para los ocho; **la sexta es la propia de cada uno** — misma
celda, contenido distinto.

| celda | | |
|---|---|---|
| 1 | **neutro** | la cara base |
| 2 | **sonrisa** | alegría, como le salga a cada uno |
| 3 | **preocupado** | miedo o inquietud |
| 4 | **ceño** | enojo, dureza |
| 5 | **roto** | dolor, el quiebre |
| 6 | **la propia** | Tero con casco · la duda de Puma · la risa que se apaga del Gitano · el rezo del Vasco · los auriculares del Pichón · el orgullo del Turco · el frío de Mateo · el Colorado ofreciendo |

## Cómo se usa

1. Se copia el bloque de un personaje **entero** y se pega, con **las dos imágenes adjuntas**.
2. Sale **una tira** de seis cabezas.
3. Se corta con el comando que está debajo de cada bloque. **Probá primero con `--preview`**:
   escribe una tira de control al lado y no toca `assets/`.

**48 retratos** en total. La caja de diálogo los busca por nombre en `assets/portraits/` y si
falta alguno simplemente no dibuja busto — se puede ir de a uno.

---

"""

# --ids lista los nombres validos de retrato. Existe porque los ids se nombran a mano en
# data/strings.js y en la documentacion de misiones, y ahi es donde se desincronizan: un id mal
# escrito no da error, simplemente no dibuja busto y nadie se entera. Esta es la lista de verdad.
if '--ids' in sys.argv:
    todos = ['condor_reposo', 'condor_radio']
    for p in P:
        todos += [f'{p["id"]}_{r}' for r in RANURAS[:5]] + [f'{p["id"]}_{p["propia"][0]}']
    for p in SEC:
        todos += [f'{p["id"]}_{n}' for n, _ in p['exp']]
    print('\n'.join(sorted(todos)))
    raise SystemExit

partes = [CAB] + [hoja(p) + '\n---\n\n' for p in P]
partes.append("""# Los que no están en `team.png`

Ocho personajes más, **con la misma grilla** — misma escala de cabeza, misma altura de ojos, mismo
recorte de pecho. Cambia la cantidad de celdas: acá alcanza con tres o cuatro expresiones.

> ### La regla se invierte en dos de ellos
>
> En **seis** de estas hojas, `team.png` se adjunta **solo por el trazo**: la cara tiene que ser de
> otra persona y **no parecerse a ninguno** de los ocho.
>
> En **Esteban joven** y **Mateo nene** pasa exactamente lo contrario: **tienen que ser la misma
> persona** que su versión adulta. Existen para que el jugador los reconozca sin que nadie se lo
> diga; si no se reconocen, la escena del arroyo es la de dos desconocidos y el prólogo no cierra.
>
> Y la trampa a evitar ahí: **no es «lo mismo pero más joven»**. Ese atajo arrastra la ropa, y la
> ropa es de otra década — te deja a Esteban con el mono de vuelo del 82 sentado junto a un arroyo
> diez años antes. **Se conserva la cara y se cambia todo lo demás.**

---

""")
partes += [hoja_sec(p) + '\n---\n\n' for p in SEC]
partes.append("""## CÓNDOR — la voz del comando

Cóndor **no se ve nunca**: es la radio. Su «retrato» es un objeto, y esa es toda la idea — la
máquina de la guerra no tiene cara. Dos celdas, para que la caja tenga algo que cambiar cuando
habla.

**Adjuntar:** `final/team.png` *(solo por el trazo)*

```
""" + ESTILO + """

IMAGE 1 is the cast line-up. Copy its RENDERING ONLY: line weight, dithered shading,
palette, flat mid-grey background. DO NOT DRAW ANY PERSON.

SUBJECT: a 1960s military radio loudspeaker unit, seen three-quarter from slightly
left, filling the square cell exactly the way a face would - the round perforated
speaker grille sits where the eyes would be. Olive drab painted metal case, two
toggle switches, one large knurled knob, a fabric-covered coiled cable leaving the
bottom edge. Chipped paint at the corners, a dent in one edge.

""" + grilla(2) + """

THE TWO CELLS (this is an object, so the change is not an expression):
CELL 1 - IDLE: the case dark and even, no light anywhere. Cold. Nobody is talking.
CELL 2 - TRANSMITTING: a small amber lamp lit on the case, and the speaker grille
  picked out slightly brighter, as if the cone were moving. Nothing else changes -
  same angle, same size, same position in the cell.

LIGHT: cold and even in both cells except for that one amber lamp. No warmth
anywhere else. It is a machine and it is on nobody's side.

PERIOD LOCK - Argentina 1982, valve-era military equipment only: no digital display,
no LED, no modern connectors, no branding.

ABSOLUTELY NO TEXT anywhere: no dial markings, no letters, no labels, no watermark.
Leave every plate on the case blank.
```

**Cortar con:**

```bash
python3 tools/install_retratos.py <la-hoja-generada>.png --anclaje pad condor_reposo condor_radio
```

> **Si preferís la silueta en vez de la radio**, reemplazá el bloque `SUBJECT` por:
> `SUBJECT: the black silhouette of a man's head and shoulders wearing a peaked
> officer's cap and a radio headset, filled flat with a single dark colour, no
> features, no eyes, no detail inside the shape - only the outline reads. Centred in
> the cell like a portrait.`
> Y en la celda 2, el borde de la silueta apenas iluminado. **La radio es la opción
> mejor**: una silueta humana invita a preguntarse quién es, y el punto de Cóndor es
> que no importa.

---

""")
partes.append("""## Cómo saber si quedó bien

Poné los retratos en fila y miralos **a tamaño real, 108 px**, sin ampliar. Si a ese tamaño una
expresión no se lee, o dos personajes se confunden, todavía está mal — en el juego se van a ver
exactamente así.

**Y la prueba de la grilla:** superponé dos retratos de personajes distintos. Los ojos tienen que
caer a la misma altura y las cabezas tienen que medir lo mismo. Si no, esa hoja hay que rehacerla.
""")
SALIDA.write_text(''.join(partes))
n_sec = sum(p['n'] for p in SEC) + 2
print(f'{SALIDA.relative_to(RAIZ)} · {len(P) + len(SEC) + 1} hojas · {len(P)*6 + n_sec} retratos')
