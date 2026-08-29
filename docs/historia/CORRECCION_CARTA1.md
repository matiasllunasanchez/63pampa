# CORRECCIÓN — CARTA 1 · P.4 (`carta1_p4.png`)

Tres arreglos sobre la imagen ya generada. Se pega este prompt **adjuntando la imagen
generada + la foto de referencia del colectivo** (`ref/bondi_60.jpg`).

1. **El bondi es demasiado moderno.** Va el Mercedes-Benz de carrocería nacional: frente
   chato sin trompa, parrilla cromada vertical con la estrella, faros redondos, paragolpes
   cromado, parabrisas partido en dos, **el cartelón de destino arriba del techo** y
   fileteado en los costados.
2. **Los monigotes tienen que ser soldados**, no gente de civil. Casco (más ancho que la
   cabeza), campera abultada, y el fusil como una raya cruzada en la espalda. Nada más.
3. **En el mapa, las líneas terminan en MALVINAS**, no en el medio del país. Las islas van
   dibujadas aparte, en el mar, a la derecha de la costa, y **más grandes de lo que van**.
4. **Todo en birome azul.** Un cuaderno y una Bic: no hay negro, ni rojo, ni lápiz, ni blanco.

## Si el problema es que se pasó a la carilla izquierda

Prompt corto, adjuntando la imagen generada:

```
Keep every drawing exactly as it is - same style, same blue ballpoint, same subjects, same
handwriting, same notebook. CHANGE ONLY WHERE THEY SIT ON THE SPREAD.

Move ALL of them onto the RIGHT-HAND PAGE, scaling them down as much as needed so that every
one of them fits completely inside that page. THE LEFT-HAND PAGE MUST END UP COMPLETELY
EMPTY: nothing on it but the printed ruled lines, no drawing, no part of a drawing, no
horizon, no label, no arrow, no pen mark of any kind.
NOTHING MAY TOUCH OR CROSS THE WIRE BINDING: no drawing spans the two pages and no horizon
runs through the rings. Leave clear bare paper between every drawing and the binding.
The handwritten labels move with their drawings and also stay on the right-hand page.
Do not add anything, do not remove anything, do not redraw anything.
```

## Prompt de corrección

```
Keep this drawing EXACTLY as it is - same page, same handwriting, same labels, same sea,
same plate of stew, same blue ballpoint on lined notebook paper, same layout and same
positions. CHANGE ONLY THE THREE THINGS LISTED BELOW.

1) THE BUS. The bus currently drawn is a MODERN city bus and it is wrong. Replace it, in the
same spot and at the same size, with the OLD ARGENTINE COLECTIVO shown in the reference
photograph, still drawn in the same blue ballpoint by the same hand:
- FLAT-FRONTED, UPRIGHT, SNUB-NOSED, NO BONNET: the front is a tall vertical slab.
- Dead centre of that front panel, A LARGE UPRIGHT CHROME RADIATOR GRILLE of stacked
  horizontal bars, taller than it is wide, with A THREE-POINTED STAR INSIDE A CIRCLE on top.
- ONE ROUND HEADLAMP each side of the grille, low, in a chrome ring. ROUND, never rectangular.
- A HEAVY CHROME BUMPER across the bottom.
- A FLAT SPLIT WINDSCREEN in two upright panes. NEVER a single curved windscreen.
- ON THE ROOF above the windscreen, A RECTANGULAR DESTINATION SIGN BOX standing proud of the
  roofline, with the number "60" written in it in the same handwriting.
- Tall, narrow, boxy body with a rounded roof and a rain gutter, a row of tall rectangular
  side windows, ONE door just behind the front wheel, big round wheel arches, fat tyres,
  round dish hubcaps.
- THIN PINSTRIPES AND CURLING SCROLLWORK (Buenos Aires fileteado) along the flank and around
  the sign box. Front three-quarter view: grille and one whole side both visible.
NO low floor, NO wide curved windscreen, NO smooth plastic front, NO LED or digital display,
NO roof air-conditioning pod, NO wheelchair ramp, NO modern mirrors.

2) THE STICK FIGURES ARE SOLDIERS, NOT CIVILIANS. Every stick figure on the page - the two on
the shore and the ones on the map - keeps its exact position and pose, but must now be
unmistakably a soldier: A ROUND HELMET on the head, PLAINLY WIDER THAN THE HEAD UNDER IT, and
a bulky squared-off jacket over the body. On the two figures on the shore, add a simple rifle
drawn as one straight line slung across the back. Nothing else - still no faces, no insignia,
no boots. NO bare heads, NO caps, NO hats, NO civilian clothes.

3) THE MAP. The lines currently meet in the middle of the country and that is wrong. Redraw
the map so that OUT IN THE SEA TO THE LOWER RIGHT OF THE MAINLAND, clearly SEPARATE from it
and surrounded by water, there are TWO SMALL ISLANDS side by side: the Malvinas / Falkland
Islands. The stick figures stay scattered over the mainland, and FROM EACH ONE A LINE RUNS
ACROSS THE MAP, OFF THE COAST AND OVER THE WATER, AND ALL THE LINES MEET ON THOSE TWO
ISLANDS. They converge ON THE ISLANDS OUT AT SEA - never in the middle of the country, never
anywhere on the mainland. DRAW THE ISLANDS NOTICEABLY TOO BIG - out of scale, several times
larger than they should be next to the mainland, the way a kid draws from memory the place he
is standing in.

4) ONE PEN, ONE COLOUR. Every line on the page, including everything you redraw, is the SAME
BLUE BALLPOINT. The only two colours in the image are the blue of the ink and the cream of the
paper. No black, no red, no green, no grey wash, no pencil, no marker, no white highlights.

Do not add any new drawing, do not move anything else, do not change the text.
```

## Si lo generás de cero

Ya está todo corregido en `PROMPTS_TIERRA_LISTOS.md` · **CARTA 1 · P.4**. Los descriptores
viven en `produccion/hacer_prompts_listos.py` como `BONDI` y `SOLDADITO`: se tocan una vez y
bajan a todos los prompts que los usen.
