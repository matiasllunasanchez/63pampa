# PLAN — EL PULSO CON CABINA FILMADA

> **La idea es del autor y es la mejor que apareció para el Pulso.** Un clip de cabina que
> **no se reproduce: se avanza a fuerza de teclas**. Cada acierto empuja el video unos cuadros,
> así que el jugador **ve al piloto armando el lanzamiento con sus propias manos**.
>
> Resuelve de una el problema que hacía inviable meter video en el Pulso: **un clip que el
> jugador maneja no se gasta**, porque nunca se ve igual dos veces.

---

## 0 · 🔴 DECISIÓN DE AUTOR (15/9/2026): SE ELIMINA LA ZONA, ENTERA

Primero se decidió que **el jugador no elige zona** —esos buques fueron dañados donde fueron
dañados—. Y enseguida apareció la pregunta que cierra el tema: **¿a quién le importa dónde
pegó? Si lo destruís, ese es el tema.**

Es correcto. **La zona se va del juego, no pasa a ser dato: desaparece.**

### Qué se borra

- La pantalla `ELEGI BLANCO` y su string `pulso_elegi`.
- Los tres rótulos de zona: `pulso_z_radar`, `pulso_z_bridge`, `pulso_z_deposit`.
- Los tres rótulos de muerte por zona: `pulso_m_ciego`, `pulso_m_puente`, `pulso_m_polvorin`.
- Toda la lógica de elección de blanco del Pulso.

### Qué queda, y es lo único que siempre importó

**Tres hechos, ninguno elegido por el jugador, todos salidos del guion:**

| Hecho | De dónde sale | Dónde se ve |
|---|---|---|
| **¿Le pegaste?** | del Pulso | la mano del jugador |
| **¿Explotó?** | dato de la misión | 🔴 M6, y el modo `1982` |
| **¿Se hundió o solo ardió?** | dato de la misión | la ranura MUERTE |

**No se pierde nada de variedad**, porque la variedad ya vive en la ranura MUERTE del catálogo
de remates (`CINEMATICAS_FIN_DE_NIVEL.md` §5): una fragata revienta, un carguero arde y se
parte despacio, y en M6 **no pasa nada**. Eso es más diferencia visual que la que daban tres
rótulos distintos sobre la misma explosión.

**Y el segundo estallido —la santabárbara— no necesita zonas:** es simplemente lo que pasa en
las misiones donde el buque voló, y ya está declarado ahí.

### Lo que gana el Pulso

Se queda con **una sola pregunta: ¿te salió la mano o no?** Sin menú, sin administrar, sin
riesgo/recompensa. Y la tensión, si hace falta más, se agrega **en el margen del compás**.

> ⚠ Esto borra la parte de `PLAN_EL_PULSO.md` que habla de elección de blanco por secuencia, y
> hay que sacar los strings de `data/strings.js` (líneas 435, 438 y 442 aprox.).

---

## 1 · LA MECÁNICA

```
El Pulso pide 4 teclas.     El clip de cabina tiene 60 cuadros.
Acierto  →  avanza 15 cuadros de un saque, con su chasquido.
Error    →  el clip NO avanza. Se queda clavado. (Y eso se siente.)
4 aciertos →  el clip llegó al final → LA SUELTA.
```

**Por qué funciona:** la barra de progreso del Pulso deja de ser una barra. **El progreso es
el piloto armando la bomba.** Y cuando errás, lo que ves es que **la mano se detuvo**.

> **Detalle que vale oro y es gratis:** que el avance sea **a saltos y no suave**. Un empujón
> seco de 15 cuadros por tecla se siente mecánico, como un interruptor que traba. Si lo
> interpolás suave, se convierte en un video que se reproduce solo y pierde toda la gracia.

---

## 2 · CÓMO SE COMPONE — el clip no muestra el exterior

**El clip mira al panel, no al mundo.** La cámara está en el ojo del piloto pero apunta **hacia
abajo**: entra el tablero, las consolas, la palanca y las manos, y **no entra nada de afuera**.

Eso resuelve tres cosas de un saque:

- **Sirve para las catorce misiones**, de día, de noche, con lluvia, sobre mar o sobre tierra.
  Un solo clip, para siempre.
- **No hay que recortar nada.** Sin verde croma, sin máscara, sin retrovisores que salgan mal.
- **No pelea con el motor**: el buque, la zona y el mar los sigue dibujando el juego, en su
  propia capa, sin que el video los tape.

```
   [ motor: el mundo, el buque, el mar ]        ← la capa de abajo sigue viva
   [ clip: el panel y las manos ]               ← ocupa una franja, no la pantalla entera
   [ motor: el HUD, los compases, el retrato ]  ← arriba
```

> **Cuánta pantalla ocupa** es una decisión de puesta que conviene probar jugando: puede ser
> una franja inferior —como un tablero real visto de reojo— o la pantalla entera durante los
> segundos de la prueba. **Empezá por la franja**: tapa menos y deja ver el buque creciendo.

## 3 · CÓMO SE GUARDA — cuadros, no video

**No uses un `.mp4` con búsqueda por tiempo.** Saltar a un instante exacto en un video depende
de los cuadros clave y llega tarde: vas a apretar una tecla y el salto se va a ver medio cuadro
después, que en una prueba de décimas es la diferencia entre que se sienta preciso y que se
sienta roto.

**Exportá el clip a una secuencia de cuadros** — 5 s a 12 fps son **60 imágenes** — y
armá una **hoja de sprites**. A la resolución del juego eso pesa nada, y avanzar es sumar un
índice: exacto, instantáneo y sin depender del decodificador.

**De paso resolvés el recorte del croma una sola vez, en la hoja, y no en cada cuadro.**

---

## 4 · LOS CINCO ESTADOS

| Estado | Qué se ve | Clip |
|---|---|---|
| **Acierto** | el clip salta 15 cuadros: un interruptor que baja, la mano que se mueve al siguiente | 🔴 **CABINA** *(nuevo)* |
| **Error** | el clip **no se mueve**. Nada. El silencio de la mano quieta | — |
| **Éxito** | el avión trepa y se va · el buque ardiendo | 🟢 `que_se_va` + `cierre_flota` *(**ya los tenés**)* |
| **Fallo** | **el mismo clip del avión trepando, sin nada abajo.** Y el rótulo: *NO LOGRASTE LANZAR* | 🟢 `que_se_va` *(el mismo, sin el segundo)* |
| **Relevo** | el avión pasa, corte, **vuelve a empezar con otra cara** | 🟢 el mismo, + el retrato del otro piloto |

> **El fallo sale gratis y es mejor así.** Que sea **exactamente el mismo plano** que el éxito,
> y que la única diferencia sea que abajo no pasa nada, es más cruel que cualquier animación
> nueva. El jugador reconoce el plano, espera el fuego, y no llega.

---

## 5 · EL RELEVO — la cara del otro piloto es GRATIS

La idea del autor de *"la cuadrícula de la cara del otro piloto concentrado"* **no necesita
video**: son los **retratos que ya existen** (`PROMPTS_RETRATOS_LISTOS.md`, la grilla de seis
celdas por personaje, misma escala de cabeza, misma altura de ojos).

**Se compone el retrato sobre el mismo clip de cabina.** Mismo clip, otra cara, otro nombre.
Y como la grilla es la misma para los ocho, **los bustos no saltan al cambiar de piloto** —
que es justamente para lo que se diseñó esa grilla.

> **Y narrativamente es un hallazgo:** el relevo deja de ser una penalización de sistema y pasa
> a ser **la escuadrilla turnándose para entrar**. Cuando llegás al último piloto vivo, el
> jugador entiende sin que nadie se lo diga. En M13 quedan tres.

---

## 6 · EL PROMPT DE LA CABINA — A-4B SKYHAWK · **v3, COMPLETO**

> 🟢 **DECISIÓN: el clip NO muestra el exterior.** La cámara mira **hacia abajo, al tablero**.
> Así **un solo clip sirve para las catorce misiones**, de día, de noche, con lluvia y sobre
> mar o tierra, sin recortar ni componer nada.
>
> **Historial de tiros:** v1 → salieron tres manos y se veía el cielo por los costados ·
> v2 → manos corregidas, pero **el vidrio se derramó sobre el tablero** y el panel salió
> celeste y translúcido · **v3 = éste.** Las dos causas están atacadas por separado:
> **el lado derecho se declara vacío**, y **el parabrisas se saca del encuadre** para que la
> superficie grande del centro no pueda ser otra cosa que el panel.

### El cuadro A

Si podés, arrancá de `assets/planes/a4-skyhawk/cockpit.png` o de la mejor de las cabinas que ya
generaste: el clip sale siendo **la cabina del juego** y no una parecida.

### El prompt — completo, se copia entero

```
Detailed 90s arcade pixel art in the style of Metal Slug (SNK Neo Geo era), hand-drawn sprite
look, chunky dark outlines, rich dithered shading, crisp clean pixels, no anti-aliasing, no
photorealism, no 3D render, no smooth digital painting, no depth of field, no motion blur.

CLOSE INTERIOR SHOT INSIDE THE COCKPIT OF A DOUGLAS A-4B SKYHAWK. The camera is at the pilot's
eye position but LOOKING DOWN AND FORWARD AT THE INSTRUMENT PANEL, not out of the aircraft.
The A-4 is a TINY aircraft: the canopy frame sits close around the pilot and the panel is
narrow, not wide. Late 1950s American naval design, all analog.

THE INSTRUMENT PANEL IS THE CENTRE OF THE IMAGE AND IT IS NOT GLASS. It is a solid slab of
DARK CHARCOAL GREY-BLACK METAL, matte and opaque - never pale, never blue, never translucent,
never tinted, and nothing shows through it. It is the darkest large surface in the picture.
Set into it: round analog dial housings arranged in rows, as DARK metal rings with DARK faces;
below them, rows of small metal toggle switches on a dark plate; and circuit breaker panels at
the sides.

ON THE LEFT CONSOLE: a throttle lever with a black grip, plus trim and flap levers and fuel
controls. ON THE RIGHT CONSOLE: radio and electrical panels with small round knobs. BETWEEN
THE PILOT'S KNEES: a plain control stick with a grey grip and a black trigger. BELOW THE
PANEL: a bright YELLOW AND BLACK STRIPED ejection handle - the single strongest colour accent
in the image; everything else is grey, black and olive. The metal is worn from use: chipped
grey paint, bare metal along the rails, fingerprints and grime around the switches.

AT THE BOTTOM CORNERS, the pilot's two knees in DULL OLIVE DRAB flight suit, low and wide.

THE ONLY GLASS IN THIS IMAGE IS TWO SMALL SIDE PANES, one in the UPPER LEFT corner and one in
the UPPER RIGHT corner, set in the metal canopy frame. They are small: together they take up
less than a tenth of the image. THE WINDSCREEN IS NOT IN FRAME AT ALL - the top edge of the
picture is cut just above the top of the instrument panel, so there is no forward glass to
draw. Everything across the top of the image between those two small panes is METAL: canopy
frame and the top edge of the panel.
Those two small panes are drawn as ILLUSTRATED GLASS, the way a flat vector icon draws a pane:
a FLAT PALE SKY-BLUE fill with two or three broad soft diagonal sheen bands across it, clean
hard edges, no depth, no blur. NOTHING SHOWS THROUGH THEM - no sky, no clouds, no horizon, no
sea, no land, no sun, no stars, no scenery of any kind. They are a SURFACE, not an opening.

THE HANDS - COUNT THEM BEFORE YOU DRAW. There are EXACTLY TWO HANDS AND TWO FOREARMS IN THIS
IMAGE. Not three. Not four. Two. Both wear worn olive leather flying gloves and both enter the
frame from the BOTTOM EDGE, cut off by it. No shoulders, no torso, no head, no helmet, no face
- the viewer IS the pilot.
  - THE RIGHT HAND is in the CENTRE, at the bottom, gripping the control stick between the
    pilot's knees. It stays there the whole time.
  - THE LEFT HAND is on the LEFT side, working the switches of the left console and the lower
    left of the instrument panel.
THE ENTIRE RIGHT SIDE OF THE COCKPIT IS EMPTY OF HANDS. The right console, the right side of
the panel and every knob and switch on the right are UNTOUCHED: no hand on them, no hand near
them, no hand reaching towards them, no arm crossing over to that side. Mentioning any control
does NOT mean a hand is on it. When the image is finished, count the gloves: if there are more
than two, erase the extras.

MOTION, AND THIS IS THE POINT OF THE SHOT: the RIGHT hand stays on the control stick and
barely moves. THE LEFT HAND WORKS METHODICALLY ACROSS THE PANEL, ONE CONTROL AT A TIME, arming
the aircraft for the bomb release: it flips a row of toggle switches down one by one, moves to
a dial and turns it, moves to the master arming switch and throws it, and finally drops to the
left console and closes around the release lever. Each action is SEPARATE AND DELIBERATE, and
the hand STOPS COMPLETELY on each control before moving to the next, with a visible pause -
like a switch that clicks, never a hand that sweeps or waves. Small indicator lamps light up
one by one as it goes.

NOTHING ELSE MOVES. The camera is LOCKED OFF: no pan, no zoom, no shake, no cut, no camera
movement of any kind.

LIGHTING: even and NEUTRAL, a flat cockpit interior light with no strong colour cast and no
harsh shadows - this shot gets tinted later for day, night and rain, so it must start neutral.

THE DIALS ARE REAL INSTRUMENTS, NOT EMPTY HOLES. Every round gauge has a VISIBLE FACE: a pale
off-white or light grey dial face inside its dark metal bezel, a ring of small TICK MARKS
around the rim, and A THIN DARK NEEDLE pointing somewhere - each needle at a DIFFERENT angle
from the next, never all the same. Two or three of the larger gauges also carry a coloured arc
segment on the rim, red or amber, the way an aviation gauge marks its limits. An artificial
horizon among them, drawn as a split disc, pale above and dark below.
Scattered across the panel and the consoles, SMALL ROUND INDICATOR LAMPS in green, amber and
red - some dark, some lit and glowing.
The marks on the dials are MARKS ONLY: ticks, needles and arcs. NO readable numbers, NO
letters, NO words, NO digits anywhere on the faces or the labels.

AS THE LEFT HAND WORKS, THE PANEL ANSWERS: the needles tremble very slightly the whole time,
and each time the hand throws a switch, an indicator lamp near it LIGHTS UP and stays lit.

NO gunsight, NO reticle, NO HUD, no text, no letters, no numbers, no watermark, no signature.
16:9.
```

### 🟢 EL PROMPT DE VIDEO — v2 COMPLETO, con la suelta

> **Se escribe distinto al de imagen.** Acá la cabina **ya está**: el cuadro A es la imagen. Si
> volvés a describir la escena, el modelo la redibuja y perdés lo que costó cuatro tiros. Un
> prompt de imagen a video describe **solo el movimiento** y bloquea todo lo demás.
>
> **Y calza con el Pulso:** los **cuatro compases** son las cuatro acciones de la mano
> izquierda, y **la `Z` del remate es el botón rojo del bastón**. El clip termina con el pulgar
> apretado, y ése es el cuadro que el motor corta hacia la cinemática del avión trepando.
>
> ⚠ **Nada de comillas en el texto**: en este generador las comillas activan diálogo hablado.

```
Animate this image. DO NOT REDRAW IT. Keep the artwork exactly as it is: same pixel art style,
same cockpit, same instrument panel, same gauges, same colours, same framing, same two gloved
hands. Nothing is redesigned, nothing is restyled, no new object appears.

THE CAMERA IS LOCKED OFF for the entire shot: no pan, no tilt, no zoom, no push-in, no shake,
no camera movement of any kind. The cockpit, the panel, the canopy frame and the glass stay
perfectly still.

THERE ARE EXACTLY TWO HANDS IN THIS SHOT AND THERE MUST STILL BE EXACTLY TWO AT EVERY MOMENT.
No third hand appears and no extra arm enters the frame.

THE RIGHT HAND NEVER LETS GO OF THE CONTROL STICK. It stays gripping the stick in the centre
for the whole shot, only shifting a few pixels as it breathes. It never lifts off, never opens,
never reaches for anything, and it never touches the right console.

THE LEFT HAND WORKS THE KNOBS AND SWITCHES OF THE LEFT CONSOLE AND THE LEFT SIDE WALL, and it
NEVER crosses to the right half of the image. It performs FOUR SEPARATE ACTIONS, EVENLY SPACED
ACROSS THE SHOT - roughly one per second, with a clear still pause between each one. The hand
STOPS COMPLETELY on each control, acts on it, holds for a beat, and only then moves to the
next. It never sweeps, never waves, never drifts.
  1. Thumb and index finger close on a small round KNOB on the left console and TURN IT a
     quarter turn, then let go.
  2. The hand moves along and turns a SECOND, LARGER KNOB, this one with a slower half turn.
  3. The index finger flips down the row of small toggle switches on the left side wall, ONE
     SWITCH AT A TIME, working along the row.
  4. The hand slides onto the lever on the left console, closes around it, and stays there.
After the fourth action the left hand does not move again.

THE RELEASE - THIS IS THE LAST MOVEMENT OF THE CLIP. At the very end of the shot, after the
left hand has finished its four actions, THE RIGHT THUMB PRESSES THE RED BUTTON ON TOP OF THE
CONTROL STICK: the thumb lifts a few pixels, comes down firmly on the red button, pushes it in
and HOLDS IT PRESSED. The rest of the right hand never releases its grip and the stick itself
does not move. The red button goes from bright red to pushed in and darker.
Nothing moves after that: the shot holds completely still with the thumb down on the button.

THE INSTRUMENTS ARE ALIVE THE WHOLE TIME: every needle on every round gauge trembles and
drifts slightly and continuously, each one at its own small rhythm - never frozen, never all
moving together. The artificial horizon disc rocks very gently.

THE PANEL ANSWERS EACH ACTION: after each of the four actions, ONE small indicator lamp near
that control LIGHTS UP and STAYS LIT for the rest of the shot. By the end, four lamps that
were dark are lit.

NOTHING ELSE MOVES OR CHANGES. The lighting stays constant - no flicker, no flashes, no change
of colour or brightness. The glass panes stay flat, opaque and unchanged, with nothing ever
appearing through them. No smoke, no sparks, no rain, no reflections moving.

No text, no letters, no numbers, no HUD appears. No motion blur. Keep the hard pixel edges.
```

### El campo de AUDIO — aparte, y sin comillas

```
Inside a fighter cockpit, heard through a flight helmet. Closest and loudest: the pilot
breathing steadily through an oxygen mask, amplified and slightly rasping, with a soft
mechanical click and a faint hiss of the regulator on every breath. Under it, constant and
muffled: the deep sustained roar and high whine of a single turbojet at high power, never
changing pitch. With it, a broad steady rush of air over the canopy and a low rattling buffet
of the airframe shaking at high speed and very low altitude, plus occasional dull creaks of
stressed metal. Punctuating it, four crisp dry metallic clicks of switches and knobs being
worked, one per second. AT THE VERY END, a final firm button click, immediately followed by a
heavy mechanical clunk of a weapon releasing from under the aircraft and a rushing whoosh
falling away and receding downward, and then the airframe noise carrying on alone. No speech,
no dialogue, no voices, no radio chatter, no words in any language. No music, no score. No
explosions, no gunfire, no alarms.
```

### Si el video sale mal *(regenerar por 60, no editar)*

- **le crece una tercera mano** → *"Only two hands exist in this shot at all times. No new hand
  or arm may enter the frame."*
- **amontona las acciones o la mano flota** → *"The left hand must be completely still between
  actions. Four distinct stops, about one second apart."*
- **mueve la cámara o hace zoom** → *"The camera is completely static. Do not add any camera
  motion, push-in or parallax."*
- **le licúa el pixel art** → *"Preserve the original pixel art exactly: hard edges, no
  smoothing, no blur, no interpolation artifacts."*
- **aparece paisaje en el vidrio** → *"The glass panes are opaque and never change."*

### La luz se resuelve desde el motor

Se genera **neutro** y el motor le pone el tinte por misión: ninguno de día · cálido al
amanecer · oscuro con brillo verdoso de instrumentos de noche · azul frío con lluvia.
**Un clip × cuatro tintes = cuatro cabinas al precio de una.**

### Si vuelve a salir mal *(regenerar por 60, no editar)*

- **el panel sale celeste otra vez** → *"The instrument panel is DARK CHARCOAL METAL, opaque.
  There is no glass in the centre of the image at all."*
- **aparece una tercera mano** → *"There are exactly two arms and two hands. The right side of
  the cockpit has NO hand on it. Delete every extra hand, arm or forearm."*
- **se ve cielo o paisaje** → *"Nothing is visible outside the aircraft. The two small side
  panes are opaque pale blue surfaces."*
- **la mano barre en vez de accionar** → *"The left hand stops completely on each control,
  pauses, and only then moves to the next."*

## 7 · PRESUPUESTO

| Qué | Créditos |
|---|---|
| **CABINA** — 2 tiros (el segundo es el probable) | **120** |
| Tercer tiro de reserva | 60 |
| Éxito, fallo y relevo — **ya los tenés** | **0** |
| **Queda para el Teaser 2** | **480** |

**Todo el sistema del Pulso sale 120 créditos**, porque los otros tres estados salen de clips
que ya están pagos.

---

## 8 · LO QUE HAY QUE AGREGAR AL MOTOR

Siguiendo la regla de `cines.js` —*se agrega el verbo, no la excepción*:

| Falta | Para qué |
|---|---|
| **`cabina: { hoja, cuadros, porTecla }`** | la hoja de cuadros del Pulso, y cuántos avanza cada acierto |
| **tinte por misión** | oscurecer / colorear la hoja según día, noche o lluvia. Es una multiplicación de color, no assets nuevos |
| **`video` / `clipe`** | reproducir un clip en una cinemática (éxito, fallo, relevo) |
| **`retrato: 'piloto'`** | componer el busto del piloto de turno encima |

> **Ya no hace falta recortar croma**: el clip no tiene exterior, así que no hay nada que
> recortar.

---

## 9 · POR QUÉ ESTO ARREGLA LO QUE ESTABA FEO

Lo que se veía duro no era el arte: era que **el Pulso pedía teclas y no devolvía nada más que
un cartel**. Con esto, cada tecla acertada **hace algo en el mundo** — una mano se mueve, un
interruptor baja, una luz se prende — y cada error **congela una mano a la vista**.

Y lo mejor: **no reemplaza la mecánica, la ilustra.** Los compases, los márgenes y los tres
grados de fallo siguen exactamente como están.
