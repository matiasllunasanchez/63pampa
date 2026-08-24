# RASANTE — Biblia de estilo visual

> **Para qué existe.** Cada frente de arte del proyecto tenía su prompt propio —hojas de
> personaje, hojas de avión, previews del roster— y **los tres repetían el mismo bloque de
> estilo copiado a mano**. Con tres se aguanta; al cuarto, el juego se empieza a desarmar de a
> poco y nadie sabe por qué. Este archivo es la fuente única: se cita, no se reescribe.

---

## 0 · ⚠ Corrección del 24/8 — cuál es el bloque de verdad

**Este archivo se escribió como fuente única, pero no es el que generó el arte del proyecto.**
Las láminas de personaje de [`characters_examples/final/`](characters_examples/final/) —que son
el material de referencia— salieron del bloque que vive en
[`PROMPTS_HOJAS_PERSONAJE.md`](PROMPTS_HOJAS_PERSONAJE.md), y no es el mismo:

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
```

**Las diferencias que importan**, y que explican por qué usar el de §1 para personajes daba otra
cosa:

| | §1 *(el de este archivo)* | el que generó las láminas |
|---|---|---|
| paleta | «pequeña y disciplinada» | **`saturated military palette of olive drab, steel blue-grey, silver and warm sand`** — nombrada, no abstracta |
| fondo | no lo dice | **`neutral flat mid-grey background`** |
| proporciones | «silueta legible primero» | **`arcade sprite proportions, orthographic reference lámina layout`** |
| negaciones | lista larga *(bloom, lens flare, drop shadow, vector…)* | corta: `no anti-aliasing, no photorealism, no 3D render, no smooth digital painting` |

La lista larga de negaciones de §1 **empuja el resultado lejos** de lo que ya está dibujado:
pedirle que evite cinco cosas más lo mueve a un registro más duro y más plano que el del juego.

### La regla, y vale para todo frente de arte

**El estilo del proyecto no es el que está escrito: es el que está dibujado.** Si un prompt de
este archivo y una lámina de `final/` se contradicen, **gana la lámina**. Este archivo describe;
las láminas definen.

**Para personajes y rostros: usar el bloque de arriba**, y siempre con la lámina final del
personaje adjunta como referencia de forma. Ver
[`PROMPTS_RETRATOS_LISTOS.md`](PROMPTS_RETRATOS_LISTOS.md).

**Para placas de ambiente y objetos** —que no tienen lámina final contra la cual comparar— el
bloque de §1 sigue sirviendo, y es el que produjo las 32 placas instaladas.

---

## 1 · El bloque para PLACAS Y OBJETOS *(no para personajes — ver §0)*

Va **al principio** de todo prompt de imagen del proyecto.

```
Detailed 90s arcade run-and-gun pixel art in the style of Metal Slug on SNK Neo Geo
hardware. Hand-drawn sprite look: chunky dark pixel outlines around every shape,
rich dithered shading in visible pixel clusters, a small disciplined palette, hard
crisp pixel edges, readable silhouette first and detail second.
No anti-aliasing, no smooth gradients, no soft airbrush, no photorealism, no 3D
render lighting, no bloom, no lens flare, no drop shadow, no modern vector or
flat-illustration look.
```

**Qué hace cada parte, para no romperla al "mejorarla":**

| Frase | Por qué está |
|---|---|
| `on SNK Neo Geo hardware` | ancla la época y la resolución mental. Sin esto sale "pixel art" moderno, limpio y plano |
| `chunky dark pixel outlines` | el contorno grueso es LA marca de Metal Slug. Sin él sale pixel art genérico |
| `dithered shading in visible pixel clusters` | el dithering reemplaza al degradé. Es lo primero que un generador tira a la basura |
| `readable silhouette first` | a 20 px el detalle no existe; la silueta sí |
| toda la lista de `no ...` | son las cinco formas en que un modelo se escapa a fotorrealismo |

## 2 · Las tres reglas que van en TODO prompt

```
PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern missiles or
guided weapons, no modern avionics or digital displays, no NATO or United States
markings, no invented squadron patches, no digital camouflage.

ABSOLUTELY NO TEXT of any kind anywhere: no serial numbers, no letters, no labels,
no callouts, no arrows, no legend, no watermark, no signature. If you feel the urge
to label anything, leave it blank.
```

- **Period lock**: el juego trata hechos reales y muertos reales. Un misil moderno en una
  cabina del 82 no es un detalle: es una mentira en pantalla.
- **Sin texto**: los generadores buenos escriben bien, y por eso rotulan sin que se lo pidan.
  Además todo el texto del juego pasa por `data/strings.js` para poder traducirlo — un cartel
  horneado en un PNG queda en castellano para siempre.
- **Sobriedad militar** *(no va en el prompt, va en la cabeza)*: vapor, humo, sal, chispas,
  óxido — sí. Humo de colores, arcoíris de partículas, nose-art de pin-up — no. Es 1982 y es
  una guerra.

## 3 · La paleta

La del juego vive en [`src/data/palette.js`](../../src/data/palette.js) y **manda**: si un
asset nuevo trae colores que no conversan con `P`, el que está mal es el asset.

| Rol | Hex | Dónde |
|---|---|---|
| acento (el amarillo del logotipo) | `#e8a33d` | títulos, marcas, fuego |
| tinta / texto claro | `#e8eef0` | texto sobre oscuro |
| apagado | `#8a9ba1` | secundario |
| alarma | `#d94f30` | daño, alerta |
| mar | `#2e4a4e` · `#33545a` · `#22383c` | el agua |
| espuma | `#cfe3df` | crestas, estela |

**Un solo rojo por escena**, y solo cuando está anotado. El rojo es el color de la alarma; si
se usa de adorno, deja de avisar.

## 4 · Cómo se pide una imagen — el método de los tres roles

Nunca de cero. Siempre imagen a imagen, con **un trabajo por imagen** y dicho explícito:

| Imagen | Rol | Frase que la fija |
|---|---|---|
| 1 | **LA FORMA** | `IMAGE 1 is the SHAPE reference. Copy its shape exactly. If anything in my description conflicts with this shape, the shape wins.` |
| 2 | **EL ESTILO** | `IMAGE 2 is the ART STYLE reference. Copy its rendering technique only, never its subject.` |
| 3 *(opcional)* | **EL ENCUADRE** | `IMAGE 3 defines POSE and FRAMING only. Do NOT copy its art style.` |

La línea `if anything conflicts, the shape wins` es la que evita el error más caro: que el
modelo dibuje algo hermoso que no es el objeto que pediste.

> ⚠️ **La imagen 2 es SIEMPRE el mismo archivo** en toda una tanda. Cambiar la referencia de
> estilo a mitad de camino da seis assets que no parecen del mismo juego.

## 5 · Corregir, no regenerar

Es lo que mejor hace un modelo de edición, y lo que más tiempo ahorra:

```
Keep this image exactly as it is - same subject, same pose, same framing, same
colours, same background. Change only this one thing: [EL ARREGLO].
Do not redraw anything else.
```

| Sale mal | El arreglo |
|---|---|
| suave, vectorial, no pixel art | `redraw all shading as hard dithered pixel clusters with chunky dark outlines; remove every smooth gradient and every soft edge` |
| fotorrealista | `flatten it into hand-drawn sprite art with a small palette; remove all photographic texture and realistic lighting` |
| puso texto | `remove every letter and number from the image and leave those areas blank` |
| inventó armamento moderno | `remove all weapons and pylons; leave it clean` |
| fondo o sombra de más | `replace the background with flat pure white and remove all shadows and glows` |

## 6 · Después de generar — el paso que no se saltea

**Una IA no entrega pixel art: entrega algo que se le PARECE**, con anti-aliasing en los
bordes y degradés donde debería haber dithering. Hay que cuantizarlo:

```bash
./.venv-art/bin/python docs/produccion/pixelrefine.py <entrada> <salida> --native <WxH> --colors 48
```

Y sobre todo: **el asset tiene que medir lo que el juego dibuja.** Si no, el navegador lo
reescala por un factor no entero y el pixel art se parte en escalones o se empasta. Los
tamaños canónicos, calculados con `U × SC = 3` exacto (ver `render/ctx.js`):

| Asset | Tamaño 1:1 | De dónde sale |
|---|---|---|
| preview de avión | **390 × 188** | `PW = 130` en `render/menus.js` × 3 |
| cabina | **984 × 564** | `W+12, H+12` en `render/momentum.js` × `SC` |
| pantalla completa | **960 × 540** | `W × H × SC` |

Para las previews hay una herramienta que hace las tres cosas de una:
`tools/install_previews.py` — ver [AVIONES_CATALOGO.md](AVIONES_CATALOGO.md).

---

## Dónde se aplica esto

| Frente | Documento |
|---|---|
| Hojas de personaje (9) | [PROMPTS_HOJAS_PERSONAJE.md](PROMPTS_HOJAS_PERSONAJE.md) |
| Hojas de avión (5, las marcas de cada Fiel) | [AVIONES_ESCUADRON.md](AVIONES_ESCUADRON.md) |
| Previews del menú + **cabinas** (6) | [AVIONES_CATALOGO.md](AVIONES_CATALOGO.md) |
| Placas, retratos y cuadros VN | [RETRATOS.md](RETRATOS.md) |
| Plan de qué se produce y en qué orden | [PLAN_VISUAL_FASES.md](../proyecto/PLAN_VISUAL_FASES.md) §11 |
