# Editar `ppal01.jpg` — poner al escuadrón en la foto del menú

**Imagen a editar:** [`assets/photos/ppal/ppal01.jpg`](../../assets/photos/ppal/ppal01.jpg) · 1024 × 723
**Referencia de identidad:** `docs/historia/characters_examples/final/espaldas.png`
*(armada para este trabajo: la vista DE ESPALDAS de las seis láminas, en el mismo orden en que
van en la foto — Gitano · Vasco · Puma · Pichón · Turco · Esteban)*

---

## Por qué esta imagen les cae bien

**Están todos de espaldas.** Ninguna cara se ve, así que lo único que identifica a cada uno es
**el pelo, la contextura y el ancho de hombros** — y eso es justo lo que está medido sobre
`team.png` ([`RETRATOS_CANON.md`](RETRATOS_CANON.md)):

| | hombros | alto | qué lo delata de espaldas |
|---|---|---|---|
| **GITANO** | 153 | 0.88 | **el pelo negro muy rizado y voluminoso** — el mejor servido de todos acá |
| **VASCO** | 160 | **1.00** | el más alto, pelo negro peinado plano hacia atrás, nuca pálida |
| **PUMA** | **200** | 0.91 | **los hombros más anchos, con diferencia**, pelo gris espeso, casi sin cuello |
| **PICHÓN** | **134** | **0.78** | el más bajo y el más angosto, pelo negro corto y desprolijo |
| **ESTEBAN** | 141 | 0.91 | **el más flaco**, cuello largo adelantado, canas en las sienes que se ven de costado |
| **TURCO** | 175 | 0.87 | no es piloto: overol azul, **gorra caqui con antiparras** |

**Puma con 200 de hombros contra Esteban con 141 es una diferencia enorme**, y es la que hace
todo el trabajo en una imagen sin caras.

---

## El reparto, de izquierda a derecha

| # | En la foto | Personaje |
|---|---|---|
| 1 | el piloto de más a la izquierda, casco en la mano | **GITANO** |
| 2 | el que está casi tapado detrás del grande | **VASCO** |
| 3 | **el grande del centro, el más cerca de cámara** | **PUMA** |
| 4 | el que camina más adelante, a la derecha del grande | **PICHÓN** |
| 5 | las figuritas del fondo junto al carro | **una sola persona: el TURCO**, en una mesa de herramientas |
| 6 | el piloto de la derecha, guantes blancos | **ESTEBAN** |

---

## El prompt *(copiar entero, adjuntando las dos imágenes)*

```
IMAGE 1 is the artwork to edit. Keep it EXACTLY as it is: same composition, same
camera, same overcast sky, same wet reflective deck, same aircraft, same colours,
same pixel-art rendering and line quality, same light. Do not reframe, do not
recolour, do not restyle. Every figure keeps the pose, the position, the stride
and the hand holding the helmet that it already has.

IMAGE 2 shows these six men FROM BEHIND, already, in the order they appear in
IMAGE 1: 1 Gitano, 2 Vasco, 3 Puma, 4 Pichón, 5 Turco, 6 Esteban. Copy each man's
BUILD, SHOULDER WIDTH, HEIGHT, HAIR and the back of his head from there. It is a
reference for WHO THEY ARE, not for pose or framing: the poses come from IMAGE 1.
IGNORE the crucifix drawn on Vasco's back in IMAGE 2 - he does not wear one there.

THE JOB: the figures in IMAGE 1 are generic pilots. Replace them with six specific
people. This is the SAME PHOTOGRAPH, with different men in it.

THE HARD RULE, above everything else below: EVERY FIGURE STAYS SEEN FROM BEHIND, in
the SAME POSE, at the SAME POSITION, mid-SAME STRIDE, holding the helmet in the SAME
HAND. Nobody turns, nobody looks over a shoulder, nobody stops walking, nobody
changes place. NOT ONE FACE APPEARS ANYWHERE IN THE IMAGE.
The only things that change about a person are: BUILD, SHOULDER WIDTH, HEIGHT and
THE BACK OF THE HEAD.
TEST BEFORE YOU FINISH: put your version next to IMAGE 1. If any figure is standing
differently, facing differently, or in a different place, it is wrong. The two
images must be confusable at a glance and only tell apart by who these men are.

FROM LEFT TO RIGHT:

1. LEFTMOST PILOT (walking away, helmet in hand): give him VERY CURLY, VOLUMINOUS
   BLACK HAIR, tight curls standing high off the head - it must be obvious from
   behind and he is the only one with curly hair. Average build.

2. THE PARTLY HIDDEN MAN behind and left of the big central figure: make him the
   TALLEST of the group and narrow, with straight BLACK HAIR COMBED FLAT BACK and
   a pale neck. Shoulders narrow and dropped.

3. THE BIG FIGURE IN THE CENTRE, closest to camera: make him MUCH BROADER ACROSS
   THE SHOULDERS than anybody else in the picture - a heavy, blocky back that
   fills the flight suit. THICK SILVER-GREY HAIR, plenty of it. Almost no visible
   neck: the head sits straight on the shoulders. He is not taller than the
   others, he is WIDER.

4. THE PILOT AHEAD AND RIGHT OF HIM: make him CLEARLY SHORTER and NARROWER than
   everyone else - he should read as a boy among men from behind alone. Thin neck,
   narrow shoulders, short messy black hair. Keep his stride and his helmet.

5. THE SMALL DISTANT FIGURES near the equipment cart on the right: replace all of
   them with ONE SINGLE MAN, heavy-set and short, standing at a low workbench
   covered in tools, with his back to us and both hands busy on the bench. He is
   NOT a pilot: stained blue-grey mechanic's coveralls instead of a flight suit,
   no helmet, a KHAKI CLOTH CAP WITH AVIATOR GOGGLES resting on top of it, and a
   pale towel over one shoulder. Same scale and same distance as the figures he
   replaces.

6. THE PILOT ON THE FAR RIGHT (white gloves): make him the THINNEST of all - lean
   and wiry, narrow sloping shoulders, and a LONG THIN NECK carried forward of the
   shoulders so the head sits ahead of the body. Dark hair with GREY AT THE
   TEMPLES, visible from behind at the sides of the head.

THE ONE THING YOU MAY CHANGE beyond build: their HEIGHTS relative to each other,
as described above. Everything else in the frame stays untouched.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear.

ABSOLUTELY NO TEXT anywhere: no letters, no labels, no numbers, no watermark, no
signature.
```

---

## Lo que probablemente haya que corregir

| Si pasa | Pegarle esto |
|---|---|
| los seis salen del mismo tamaño | `The differences in build are too small. Make figure 3 dramatically WIDER across the shoulders and figure 4 dramatically SHORTER and NARROWER. Someone should be able to tell them apart from behind, at a glance.` |
| le da vuelta la cara a alguno | `Nobody turns around. Every figure stays seen from behind exactly as in IMAGE 1.` |
| el mecánico sale de piloto | `Figure 5 is a mechanic, not a pilot. Stained blue-grey coveralls, no flight suit, no harness, no helmet, and a khaki cap with goggles on it.` |
| cambia el cielo o el piso | `Do not touch the sky, the deck, the water, the aircraft or the light. Only the six people change.` |

---

## ¿Hay que adjuntar la referencia, o alcanza con el contexto?

**Adjuntarla, siempre.** Tres razones, en orden de peso:

1. **El prompt la nombra.** Dice «IMAGE 2 es...». Si no hay una IMAGE 2 en ese mensaje, el
   generador ignora ese bloque entero o se lo inventa.
2. **Los modelos de imagen no "recuerdan" imágenes viejas como recuerdan texto.** Una imagen
   subida diez mensajes atrás pesa mucho menos que una adjunta en el turno, y a veces nada.
3. **Y es la razón de fondo:** describir una contextura con palabras es exactamente lo que ya
   falló dos veces en este proyecto — los aviones que salían todos iguales, y el Gitano. «Hombros
   más anchos» es una frase; 200 contra 141 dibujados es un hecho.

**El riesgo de adjuntarla**, y hay que saberlo: una referencia puede *contaminar la pose*. Por eso
`espaldas.png` es mejor que `team.png` acá — si la referencia ya los muestra de espaldas, el
generador no tiene de dónde sacar la idea de darlos vuelta. Con la lámina de frente, sí.

**Si aun así te los da vuelta:** sacá IMAGE 2 y generá solo con el texto. Las descripciones de
contextura son medidas y bastante específicas, así que aguantan solas — se pierde precisión, no
identidad.

---

## Dos cosas para saber antes de generar

**El Vasco casi no se ve, y está bien.** Es el más tapado de los seis: de espaldas y detrás de
otro, su altura —lo único que lo delata— apenas se lee. Podría cambiarse de lugar con el Gitano,
pero **el Gitano es el que mejor funciona ahí**: su pelo rizado es lo primero que se reconoce en
toda la imagen. Y un Vasco medio tapado y callado al fondo no es un problema del encuadre: es el
personaje.

**Esta foto es del menú principal, no del guion.** Vive en `assets/photos/ppal/` y la rota
`drawPpalBg`. Si se reemplaza, conviene guardar el original al lado — es la única imagen de la
rotación donde los cinco están juntos y caminando, y si el resultado no convence no hay de dónde
volver.
