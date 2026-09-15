# PLAN — 660 CRÉDITOS, EN QUÉ SE GASTAN

> **VERIFICADO EN LA CUENTA (14/9/2026), 3.0 Turbo 1080p · 5 s:** generar de cero **60
> créditos**, editar o extender una vieja **50**. Entonces **660 ÷ 60 = 11 tiros nuevos**.
>
> 🟢 **Y ANTES DE GASTAR NADA, LEER `INVENTARIO_CLIPS.md`:** ya hay diez clips generados en la
> cuenta y **seis entran directo en huecos del juego**, incluido el plano que este documento
> proponía pagar. El juego no necesita créditos.
>
> 🔴 **DOS HALLAZGOS QUE CAMBIAN EL PLAN:**
>
> 1. **`End Frame` NO está soportado en 3.0 Turbo.** La pantalla lo dice textual. Esto
>    **contradice lo que afirma `TEASER.md`** («3.0 Turbo ahora SÍ acepta frame A + frame B»),
>    que armó toda su estrategia sobre eso. **Hay que corregir ese documento**: en Turbo se
>    rueda con **cuadro A solamente**, y el movimiento lo tiene que llevar el prompt.
> 2. **Editar sale 50 y generar de cero 60: diez de diferencia.** No alcanza para justificar
>    arrastrar los errores del intento anterior. **Editá solo cuando el clip está casi bien y
>    le falta un detalle**; si falla la composición, el estilo o el movimiento, pagá los 60 y
>    arrancá limpio.

---

## 0 · HOY, ANTES DE LAS 21 — los 10 créditos que se vencen

**10 créditos no alcanzan para un video (50), pero sí para IMÁGENES.** Y resulta que lo que
necesita el plano de §3 para salir bien es exactamente eso: **un buen cuadro A**.

**Gastalos generando el cuadro inicial de EL QUE SE VA.** No se tiran, y además dejan el
tiro de 60 mucho mejor apuntado. Si te alcanza para dos, generá dos y guardá el mejor.

### Prompt de IMAGEN, listo para pegar

```
Detailed 90s arcade pixel art in the style of Metal Slug (SNK Neo Geo era), hand-drawn sprite
look, chunky dark outlines, rich dithered shading, crisp clean pixels, no anti-aliasing, no
photorealism, no 3D render, no smooth digital painting, no depth of field.

A single 1960s attack jet seen from BEHIND AND SLIGHTLY ABOVE in three-quarter view, SMALL in
the frame and placed in the upper left third, climbing away low over a cold grey sea. The
aeroplane is a DARK SILHOUETTE against the pale sky, its shape clearly readable: swept wings,
a single tail fin, a short blunt nose. Thin white wingtip vapour trails behind it.

BEHIND IT AND BELOW, far away on the horizon line, A HUGE COLUMN OF BLACK SMOKE rises from
something burning at the waterline, boiling upward and leaning with the wind, with hot orange
and yellow fire glowing at its base and an orange glare spreading across the water underneath.
THE BURNING THING IS NOT VISIBLE: it is completely swallowed by its own smoke. The smoke
column is the biggest thing in the picture.

The sea is choppy grey-green with white wave crests. Cold overcast light, with the fire as the
only warm colour in the frame.

NOBODY IS VISIBLE: no people, no faces, no cockpit interior, no hands.
No text, no letters, no numbers, no HUD, no watermark, no logo, no signature. 16:9.
```

**Guardalo como** `produccion/teaser_imgs/QSV_A.png`. Ése es el cuadro A del tiro de video.

---

## 1 · LO PRIMERO: la cinemática del Pulso no se arregla con créditos

El remate del Pulso se ve **duro y feo**, y el diagnóstico es que **no es un problema de
assets: es de tiempos.** Kling no lo va a arreglar, y además es el peor lugar posible para
meter un video: **se repite en cada misión y en cada intento**. Un clip lindo visto catorce
veces se vuelve un cartel de carga.

**Lo que hay que arreglar, y es gratis** *(todo en `cines.js` / `tempo.js`)*:

1. **Falta el aire antes del golpe.** Hoy va impacto → estallido → sacudón, todo junto. Un
   remate se siente caro cuando hay **un hueco de silencio de 2 o 3 cuadros justo antes**:
   el mundo se frena un instante y recién ahí revienta. Es el recurso más barato que existe.
2. **El sacudón es demasiado y demasiado parejo.** `shake` fuerte y sostenido se lee como
   ruido. Un golpe corto y fuerte que cae rápido se lee como peso.
3. **Todo pasa a la misma velocidad.** El deshielo del tempo ya existe; **el impacto debería
   tener su propio micro-frenado** y volver, no correr al mismo ritmo que la trepada.
4. **El resplandor blanco cierra demasiado pronto.** Estás trepando y te cortan: el ojo no
   llega a ver el barco arder. Un segundo más de alejarte, y recién ahí el blanco.
5. **Falta una capa de suciedad en la pantalla.** Una sacudida de cámara sin partículas,
   humo o salpicadura se ve dura. Eso es render, no video.

> **Recomendación: arreglá esos cinco primero. Cuestan cero créditos y son el 80% del
> problema.** Si después seguís queriendo video, ya sabés exactamente qué te falta.

---

## 2 · DÓNDE SÍ VA EL VIDEO: la placa de cierre de misión

**No en el momento del impacto — en la placa que viene después.** Ese lugar tiene tres
ventajas: se ve **una vez por misión**, **no depende del estado del juego** (qué buque, qué
zona, cuántas bombas) y **el mismo clip sirve las catorce veces** sin que moleste, porque
funciona como cabecera, no como recompensa.

Y el mismo clip sirve para el trailer y para la ficha de la tienda. **Un solo tiro, tres
usos.** Eso es lo que hay que buscar con 660 créditos.

---

## 3 · EL PLANO — uno solo, y es éste

### `EL QUE SE VA` · ~4 segundos

Un A-4 alejándose bajo sobre el mar, en tres cuartos trasero, **en silueta contra el
incendio**: atrás y abajo, una columna de humo negro subiendo desde algo que arde en el agua.
El avión chico, el humo enorme.

**Por qué éste y no una explosión:**
- **El barco no se ve.** Está tapado por el humo y el fuego — así que **sirve para cualquier
  buque, en cualquier misión**, sin mentir.
- **No hay personas.** Nada de caras, nada de cabinas con piloto: es lo que peor genera la IA
  y lo que más barato se rompe.
- Es **el plano del juego**: el avión que se va, no el que ataca. *«Yo cuento lo que vuelve.»*
- Sirve igual para el trailer y para la portada.

---

## 4 · LA RECETA — cómo gastar tres tiros y no once

**El truco que ahorra la mitad del presupuesto: el cuadro A sale del juego, no de la IA.**
Sacá una captura del propio motor —el avión en el ángulo que querés, el mar, el humo— y usala
como frame A. Sale **gratis**, y garantiza que el estilo sea el del juego y no el que la IA
tenga ganas de hacer ese día. Es lo que evita el "licuado a 3D borroso" que ya está anotado
como riesgo #1 en `TEST_KLING_CINEMATICAS.md`.

**Modelo:** 3.0 Turbo, 1080p, 5 s. **Multi-shot: apagado.** **Cuadro A solamente** — en Turbo
no hay End Frame, así que todo el movimiento lo tiene que decir el prompt.

### Prompt, listo para pegar

```
Detailed 90s arcade pixel art in the style of Metal Slug (SNK Neo Geo era), hand-drawn sprite
look, chunky dark outlines, dithered shading, crisp pixels, no anti-aliasing, no photorealism,
no 3D render, no smooth digital painting. PRESERVE THE PIXEL ART STYLE OF THE INPUT FRAME
EXACTLY - do not smooth it, do not add depth of field, do not turn it into 3D.

A single 1960s attack jet, seen from BEHIND AND SLIGHTLY ABOVE in three-quarter view, small in
the frame, climbing away low over a grey cold sea. It is a DARK SILHOUETTE against the light.
BEHIND IT AND BELOW, far away on the water, a huge column of black smoke rises from something
burning at the waterline, with orange fire at its base. The burning thing is NOT clearly
visible: it is swallowed by its own smoke.

MOTION: the aeroplane holds a steady shallow climb away from the camera and gets slightly
smaller. The smoke column drifts and boils upward slowly. The sea moves underneath. The camera
does NOT cut, does NOT zoom and does NOT shake - it holds one single continuous shot.

NOBODY IS VISIBLE. No people, no faces, no cockpit interior, no hands.
No text, no letters, no numbers, no HUD, no watermark, no logo, no signature.
16:9.
```

### Cómo gastar los tiros

| Tiro | Qué | Costo |
|---|---|---|
| 1 | Con el frame del juego. **Si sale, parás acá.** | 50 |
| 2 | Solo si el 1 licuó el pixel art: **prompt corregido y regenerado**, nunca editado | 50 |
| 3 | Reserva | 50 |

**Techo duro: 150 créditos.** Si a los tres tiros no salió, **el plano no se hace** y se
resuelve con imagen fija, que es lo que `PLAN_CINEMATICAS.md` ya decidió como criterio general.

---

## 5 · EL REPARTO DE LOS 660

| Destino | Créditos | Tiros |
|---|---|---|
| **EL QUE SE VA** (juego + trailer + portada) | **150** | 3 |
| **Teaser 2 · La escucha** | **450** | 9 |
| Colchón | 60 | 1 |

> **Por qué el teaser 2 y no el 1:** `TEASER.md` ya está casi rodado y tiene sus frames
> generados en `teaser_imgs/`. El 2 arranca de cero y es el que engancha primero.
>
> **Y por qué el teaser 2 es barato:** es **80% sonido**. La mayoría de sus planos son mar
> vacío, cubierta vacía y cielo — lo más fácil y más barato que existe de generar, y lo que
> menos se rompe.

---

## 6 · LO QUE FALTA EN EL MOTOR

Para que un clip entre a una cinemática hace falta **un verbo `video`** en `cines.js`, que hoy
no existe (los verbos son `parte`, `tempo`, `cam`, `fx`, `sfx`, `fade`, `move`, `rotulo`…).

Siguiendo la regla del propio archivo —*se agrega el verbo, no la excepción*— sería:

```js
video: { clip: 'el_que_se_va', fit: 'cover', audio: false }
```

⚠ **Decidilo antes de generar el clip.** Si el verbo no se va a escribir, el video solo sirve
para el trailer y la portada — que ya es suficiente para justificar los 180, pero cambia la
prioridad.
