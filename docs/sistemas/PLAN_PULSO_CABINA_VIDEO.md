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

## 2 · CÓMO SE COMPONE — y acá está el truco

**El clip NO puede tapar el mundo.** El jugador eligió a qué zona del buque pegarle (radar,
puente, polvorín) y el barco que se acerca lo dibuja el motor, con su clase y su avería. Un
video encima borra todo eso.

**La solución ya está escrita en tu propia documentación**, en `AVIONES_CATALOGO.md`, regla 2
de las cabinas: **el vidrio va en verde croma `#00FF00`, no transparente.**

```
   [ motor: el buque acercándose, la zona elegida, el mar ]      ← abajo, vivo
   [ clip: el marco de la cabina, el panel y las manos ]         ← encima, con el vidrio recortado
   [ motor: el HUD, los compases del Pulso, el retrato ]         ← arriba
```

Generás el clip **con el vidrio como un verde plano**, se recorta una vez, y el mundo se ve a
través. **El video aporta las manos; el motor sigue aportando la verdad.**

---

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

## 6 · EL PROMPT DE LA CABINA — A-4B SKYHAWK

> **Es la cabina de la campaña**, la misma que se ve en trece de las catorce misiones. El
> texto de abajo es el bloque `[CABINA]` del A-4B de `AVIONES_CATALOGO.md` §"Los seis bloques",
> adaptado a video: **mismo avión, mismo panel, misma manija amarilla y negra.**

### 🟢 Primero lo más importante: el cuadro A ya existe

**Usá `assets/planes/a4-skyhawk/cockpit.png` como cuadro inicial.** Es la cabina que el juego
ya dibuja, así que **el video arranca siendo exactamente la cabina del juego** y no una que se
le parece. Es gratis, y es lo único que garantiza que el clip y el motor no se contradigan.

*(Si el PNG no tiene manos, o las tiene quietas, el prompt de abajo las pone en movimiento
igual: lo que se le pide al modelo es el gesto, no el diseño de la cabina.)*

### Prompt, listo para pegar

```
Detailed 90s arcade pixel art in the style of Metal Slug (SNK Neo Geo era), hand-drawn sprite
look, chunky dark outlines, rich dithered shading, crisp clean pixels, no anti-aliasing, no
photorealism, no 3D render, no smooth digital painting, no depth of field, no motion blur.
PRESERVE THE PIXEL ART STYLE AND THE EXACT COCKPIT DESIGN OF THE INPUT FRAME. Do not redesign
the cockpit, do not smooth it, do not turn it into 3D.

FIRST-PERSON VIEW FROM THE PILOT'S SEAT OF A DOUGLAS A-4B SKYHAWK, looking straight forward.
The A-4 is a TINY aircraft and the canopy frame sits close around the pilot. Late 1950s
American naval design, all analog.

THE PANEL: flat dark grey-black metal with round analog dial housings arranged in rows, small
toggle switches in labelled rows below them, and circuit breaker panels. A simple optical
gunsight on a bracket at the top centre - a small angled glass plate on a dark metal arm, low
enough not to block the view. LEFT CONSOLE: throttle lever with a black grip, trim and flap
levers, fuel controls. RIGHT CONSOLE: radio and electrical panels with small round knobs.
BETWEEN THE PILOT'S LEGS: a plain control stick with a grey grip and a black trigger. BELOW
THE PANEL, a bright YELLOW AND BLACK STRIPED ejection handle - the single strongest colour
accent in the whole image; everything else is grey, black and olive. Bare metal shows through
chipped grey paint on the canopy rails, worn exactly where a pilot's elbows rub.

THE CANOPY GLASS IS FLAT SOLID CHROMA GREEN (#00FF00): a clean empty green shape with hard
edges - no sky, no clouds, no sea, no horizon, no reflections, no gradient inside it.
Nothing else in the image uses a bright saturated green: the flight suit is DULL OLIVE DRAB.

THE REAR-VIEW MIRRORS - read this twice, it is the detail that comes out wrong most often, and
it is the detail that makes a cockpit READ as a fighter cockpit. THREE small flat rear-view
mirrors, and EVERY ONE OF THEM SITS ON TOP OF A METAL BAR OF THE CANOPY FRAME, overlapping
that bar and silhouetted against it: one on the top centre of the arch, and one on each of the
two forward frame bars that run down to the sides. Each mirror OVERLAPS and covers part of the
metal it is mounted on, the way a mirror glued to a bar does.
NOT ONE OF THEM FLOATS IN THE GLASS. If a mirror is sitting in the middle of the open canopy
area with clear space around it, it is wrong: move it onto the nearest frame bar until it
overlaps the metal.
Each one is a THIN FLAT PLATE sitting FLUSH against the bar with only a narrow dark bezel
around it - no depth, no gap, no shadow underneath. THEY ARE NOT CAR MIRRORS: no stalks, no
arms, no brackets, no housings, no mounting posts, and no gap at all between the mirror and
the frame. Nothing hangs down from the arch.
The mirror glass is a FLAT, FRONT-FACING RECTANGLE - never angled, never tilted in
perspective, never oval, never rounded - and it is filled with the SAME flat chroma green as
the canopy, because the game composites a separate image into each of those rectangles later
and it arrives crooked if the opening is not square to the frame.
THE MIRRORS DO NOT MOVE AND NOTHING IS REFLECTED IN THEM during the shot.

EXACTLY TWO ARMS AND EXACTLY TWO HANDS. Not three. Not four. Two. Both in worn olive leather
flying gloves, entering from the BOTTOM EDGE and cut off by it. No shoulders, no torso, no
head, no helmet, no face - the viewer IS the pilot. Exactly two knees in dull olive flight
suit at the bottom corners, low and at the edges. Before finishing, count the hands: if there
are more than two, erase the extras.

MOTION, AND THIS IS THE WHOLE POINT OF THE SHOT: the RIGHT hand stays on the control stick and
barely moves. THE LEFT HAND WORKS METHODICALLY ACROSS THE PANEL, ONE CONTROL AT A TIME, arming
the aircraft for the bomb release: it flips a row of toggle switches down one by one, moves to
a dial and turns it, moves to the master arming switch and throws it, and finally drops to the
left console and grips the release lever. Each action is SEPARATE AND DELIBERATE, with a clear
pause between them - like a switch that clicks, not like a hand waving. Small indicator lamps
light up one by one as it goes.

NOTHING ELSE MOVES. The camera is LOCKED OFF: no pan, no zoom, no shake, no cut. The green
glass stays perfectly flat, empty and unchanged for the entire shot: no hand, no reflection
and no light ever crosses in front of it.

NO instrument needles, NO digits, NO gauge readings, NO gunsight reticle, NO lit warning
lights on the gauges - draw the gauge faces and bezels as empty housings; everything that
reads or moves is drawn by the game on top.
No text, no letters, no numbers, no HUD, no watermark, no signature. 16:9.
```

### Los dos arreglos más probables *(regenerar por 60, no editar)*

- **manos o brazos de más** → agregar: *"There are exactly two arms and two hands. Delete every
  extra hand, arm or forearm. No hand rests on any other control."*
- **le pinta cielo en el verde** → agregar: *"The green area must stay a FLAT UNIFORM GREEN
  SHAPE with nothing drawn inside it, like a blank green screen."*

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
| **recorte del croma** | una sola vez al cargar la hoja, no por cuadro |
| **`video` / `clipe`** | reproducir un clip en una cinemática (éxito, fallo, relevo) |
| **`retrato: 'piloto'`** | componer el busto del piloto de turno encima |

---

## 9 · POR QUÉ ESTO ARREGLA LO QUE ESTABA FEO

Lo que se veía duro no era el arte: era que **el Pulso pedía teclas y no devolvía nada más que
un cartel**. Con esto, cada tecla acertada **hace algo en el mundo** — una mano se mueve, un
interruptor baja, una luz se prende — y cada error **congela una mano a la vista**.

Y lo mejor: **no reemplaza la mecánica, la ilustra.** Los compases, los márgenes y los tres
grados de fallo siguen exactamente como están.
