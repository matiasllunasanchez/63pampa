# CÓMO LEER ESTOS DOCUMENTOS

> Traducción al castellano de todas las palabras raras que aparecen en `MISION_00` … `MISION_14`.
> Pensado para poder decir **"quiero cambiar esto"** y saber exactamente dónde se toca.

---

## 1 · LA IDEA DE FONDO: TODO ES UNA PLANILLA

El juego está hecho con una regla: **lo que se puede cambiar, se cambia en una lista de datos, no
en el código.** Está escrito así en el propio repo:

> *"ESTO ES LA ÚNICA PERILLA. Sacar una entrada de estas listas revive la parte entera: no hay que
> buscar `if`s por el código."*

O sea: cuando querés que una misión tenga más viento, más cazas o menos niebla, **no se programa
nada.** Se cambia un número en una planilla. Los archivos de `src/data/` son esas planillas, y
ninguno tiene lógica adentro: son listas de valores.

Las tres planillas que importan para estos documentos:

| Archivo | Qué guarda | En criollo |
|---|---|---|
| `src/data/missions.js` | las 14 misiones | **la ficha de cada misión**: fecha, objetivo, clima, enemigos, puntaje |
| `src/data/story.js` | las 134 escenas | **el guion**: cada línea, quién la dice, con qué cara, cuánto silencio deja después |
| `src/data/fases.js` | los 6 tipos de tramo | **la forma del vuelo**: ida sigilosa, objetivo, vuelta a las trompadas |

---

## 2 · EL DICCIONARIO

### ▸ `goal` — **el objetivo de la misión**

Es cómo sabe el juego que la misión terminó. Hay dos formas:

**`goal: { kind: 'distance', meters: 2200 }`**
→ *"la misión termina cuando volaste 2200 metros."* Y nada más. No hay nada al final: el pasillo
se corta y aparece MISIÓN CUMPLIDA. Es lo que tienen hoy M1, M2, M3, M9 y M10.
**Si querés que haya algo al final, esto es lo que hay que cambiar.**

**`goal: { kind: 'ship', ship: 'HMS SHEFFIELD', dist: 2600 }`**
→ *"a los 2600 metros aparece el HMS Sheffield y ahí se pelea el final."* Lo tienen las otras
nueve misiones.

> **`kind`** quiere decir *tipo*. **`meters`** y **`dist`** son los dos la distancia, pero en el
> primer caso es *dónde termina* y en el segundo es *dónde aparece el barco*.

---

### ▸ `cfg` — **el clima y la cantidad de enemigos**

`cfg` es de *configuración*. Es **la perilla general de la misión**: cómo se ve y cuánto te
molestan. Cada misión arranca de una configuración base y **solo escribe lo que cambia**.

Ejemplo real, el de M1:
```js
cfg: C({ sky: 'dawn', wind: false, obstacles: 0.5, bombs: 0, caza: 0, persec: 1 })
```
Se lee: *"amanecer, sin viento, la mitad de obstáculos, ninguna bomba, ningún caza, y con el modo
de seguir al líder prendido."* Todo lo que no está escrito queda en el valor por defecto.

**Las perillas, una por una:**

| Perilla | Qué es | Valores |
|---|---|---|
| `sky` | **la hora y el clima del cielo** | `dawn` amanecer · `dusk` atardecer · `cloudy` nublado · `storm` tormenta |
| `terrain` | **sobre qué volás** | `sea` mar abierto · `coast` costa · (tierra) |
| `water` | el tipo de agua | `sea` |
| `coast` | **a qué distancia queda la orilla** | un número (230 por defecto) |
| `wind` | **si hay viento** que te empuja | `true` / `false` |
| `obstacles` | **cuántas cosas hay para esquivar** | multiplicador: `1` normal · `0.5` la mitad · `1.7` casi el doble |
| `caza` | **cuántos cazas te persiguen** | `0` ninguno · `1` normal · `2` el doble |
| `bombs` | **cada cuánto te bombardean** ⚠ | `0` nunca · `1` normal · `2` el doble. **Son las bombas que te tiran A VOS, no las tuyas** |
| `rain` | **lluvia** | `0` nada · `1` · `2` |
| `fog` | **niebla** | `0` nada · `1` · `2` |
| `fogLen` | qué tan largos son los bancos de niebla | `1` normal · `3` larguísimos |
| `squad` | **cuántos aviones tenés** (o sea, cuántas vidas) | `5` al principio, `3` al final de la campaña |
| `persec` | **el modo "seguí al líder"** | `0` apagado · `1` prendido |

> **La confusión más común:** `bombs` NO son tus bombas. Son las que te caen encima. `bombs: 0`
> quiere decir *"nadie te bombardea"*, no *"vas sin armas"*.

---

### ▸ `roster` y `F5` — **quiénes vuelan, y cuántas vidas tenés**

`roster` es **la lista de pilotos vivos en esa misión**, y son atajos:

| Atajo | Quiénes | Cuándo |
|---|---|---|
| **`F5`** | TERO, PUMA, GITANO, VASCO, PICHÓN | M1 a M7 — están los cinco |
| **`F4`** | TERO, PUMA, GITANO, PICHÓN | M8 y M9 — **murió el Vasco** |
| **`F3`** | TERO, PUMA, GITANO | M10 en adelante — **murió el Pichón** |

**Y el largo de la lista es la cantidad de vidas.** Vos jugás siempre como TERO; si te rompen el
avión, seguís como el que sigue en la lista. Con `F5` tenés cinco intentos, con `F3` tres.

**Por eso la campaña se endurece sola sin tocar un número de dificultad:** a medida que se muere
gente, tenés menos vidas.

> **Nada de esto te mata a nadie.** Regla del proyecto: *"en campaña NADIE muere por gameplay — el
> avión alcanzado queda AVERIADO y vuelve a la base; los Fieles mueren únicamente cuando el guion
> lo dice."*

---

### ▸ `par` — **el puntaje de referencia**

`par: 5000` quiere decir: **★** por terminarla, **★★** si llegás a 5000 puntos, **★★★** si llegás a
7500 (el par por uno y medio). Es la vara de las estrellitas.

---

### ▸ `tramos` — **cómo está dividido el vuelo, hoy**

Un `tramo` es **un pedazo del camino**, y sirve para dos cosas: cambiar la cantidad de enemigos en
esa parte, y colgar una conversación.

```js
{ hasta: 0.12, obstacles: 0, caza: 0, bombs: 0, charla: 'M01_OBJETIVO' }
```
Se lee: *"desde donde venía hasta el 12% del camino: sin obstáculos, sin cazas, sin bombas, y acá
suena la charla M01_OBJETIVO."*

> **`hasta` es una fracción del camino**, no metros. `0.12` es el 12%, `1` es el final.
> Los valores que escribe el tramo **pisan** los de `cfg` mientras dura ese tramo, y después el
> juego vuelve a lo que decía `cfg`.

---

### ▸ `fases` — **la forma nueva: ida, objetivo y vuelta**

Es lo que reemplaza a `tramos`. La diferencia grande: **con `fases`, el `hasta` puede pasar de 1**.
`1` es el objetivo, y todo lo que viene después es **la vuelta**.

```js
{ tipo: 'rasante', hasta: 1.00, radio: 'm1_tambores' },
{ tipo: 'vuelta',  hasta: 1.25, radio: 'm1_casa', obstacles: 0.5, caza: 0 },
```
Se lee: *"hasta el objetivo, volando rasante. Y después, un 25% más de camino de vuelta a casa,
con pocos obstáculos y ningún caza."*

**Los seis tipos de fase** (cada uno ya viene con sus valores puestos; la misión solo escribe lo
que quiere cambiar):

| Tipo | En criollo | Qué trae puesto |
|---|---|---|
| `transito` | **el viaje cómodo de ida** | Cero enemigos. Es donde va la charla |
| `filo` | **el tramo de esconderse** | Techo bajísimo, mundo vacío, radio muda. Si te detectan, te esperan armados |
| `descenso` | **bajar al rasante** | Se apagan las voces |
| `rasante` | **el pasillo de siempre, callado** | Igual que hoy, pero mudo |
| `blanco` | **la corrida final sobre el objetivo** | Callado |
| `vuelta` | **la guerra** | ⚠ **Sube los enemigos solo**: obstáculos ×1.6, cazas ×2, voces prendidas |

> ⚠ **El tipo `vuelta` sube la dificultad por su cuenta.** Si una misión quiere una vuelta
> tranquila (como M1), **tiene que escribirlo explícitamente**, o aparecen cazas en el tutorial.

**Y dos campos más de fase**, que son dos de las tres formas de hablar en vuelo (ver más abajo):
- **`radio: 'm1_casa'`** — una línea por radio que suena en esa fase **y no frena el juego**.
- **`pausa: true`** — esa línea **congela el juego hasta que apretás**. Se usa para marcar que
  empezó una etapa.

---

### ▸ Los tipos de escena — **qué ve el jugador, y si frena**

Cada escena de `story.js` tiene un `tipo`:

Hay **seis** formas de que el juego te diga algo, y se diferencian por **cuánto te interrumpen**.
Tres son pantallas (el juego no está corriendo) y **tres son diálogo mientras volás**.

### Las tres que son pantalla — el juego está parado

| Tipo | Qué es |
|---|---|
| **`VN`** | Pantalla de historia: fondo + cara del que habla + caja de texto. Avanzás vos, línea por línea |
| **`TIERRA`** | La página del cuaderno de Mateo |
| **`TARJETA`** | La tarjeta de misión (nombre, fecha, objetivo) |

*(VN es "visual novel", el formato de las pantallas de diálogo. Es solo la etiqueta.)*

### Las tres que pasan mientras volás

**1 · LA CHARLA EN VUELO — la del temporizador**
`tipo: 'VUELO'` en `story.js` + `charla: 'M01_RITUAL'` colgado de un tramo en `missions.js`.

Es una escena entera —varias líneas, con caras— que ocurre **sin sacarte del avión**. Lo que hace
es una cosa que el propio código llama **"una pausa sin pausa"**:

- **Seguís volando y seguís manejando.** La física, el gas, los laterales y el roce quedan
  intactos. No es una cinemática: estás al mando.
- **Lo que se congela es el kilometraje**, o sea que mientras dura la charla no avanzás hacia el
  objetivo. Y **la nafta tampoco baja** — porque *"sería injusto cobrar combustible por una escena
  que el jugador no pidió y no puede saltear"*.
- **Las líneas pasan solas.** Vos no las avanzás y **no se pueden saltear**: cada línea dura
  `max(1.6 s, caracteres/12)` más su `hold`. Los silencios son sagrados.
- **Tiene un tope duro de 25 segundos.** Una escena que no entra **no se recorta**: se parte en dos
  y se cuelga de dos tramos seguidos.
- Antes de arrancar hay un **drenaje de hasta 2.5 s**: se apaga el sembrador y se espera a que lo
  que ya estaba en pantalla pase de largo, así la charla no arranca con un obstáculo encima.
- Entra y sale con **letterbox de 0.4 s** (las dos barras negras) y la UI se va. *"Avisa que cambió
  el registro, no corta la acción."*

**2 · LA LÍNEA DE RADIO — la que no frena nada**
`radio: 'm1_rasante'` declarado en una fase.

Una sola línea por radio que suena en esa fase **y no interrumpe absolutamente nada**. Es para ir
marcando el camino sin cortar el vuelo. Es el formato que estrenó la misión de prueba `t15`.

**3 · LA LÍNEA DE RADIO CON PAUSA — la que te para**
Lo mismo, pero con `pausa: true`.

**Congela el juego hasta que apretás.** Se usa para marcar que empezó una etapa nueva. En `t15`
está sólo en la primera fase; agregarle la palabra a otra la pausa igual, y borrarla la vuelve
normal.

> **La diferencia en una frase:** la **charla** es una escena con temporizador que corre sola
> mientras volás; la **radio** es una línea suelta que no frena; la **radio con pausa** te detiene
> hasta que aceptás.

---

### ▸ Los campos de una línea de diálogo

```js
{ id: 'M01_3_020', personaje: 'PUMA', cara: 'puma_neutro', hold: 1.5,
  accion: 'sin levantar la vista', es: 'Bienvenido a Los Fieles, Tero...' }
```

| Campo | Qué es |
|---|---|
| `id` | el nombre de la línea, para poder referirse a ella. Van de 10 en 10 para poder meter una en el medio |
| `personaje` | quién habla. Si dice `null`, es el narrador |
| `cara` | **qué expresión se le dibuja**: `puma_neutro`, `gitano_sonrisa`, `pichon_roto`… |
| **`hold`** | **el silencio OBLIGATORIO después de la línea, en segundos.** No es un retardo técnico: es actuación. Un `hold: 3.0` es un personaje callándose tres segundos |
| `accion` | la acotación, lo que hace mientras habla |
| `es` | el texto en castellano (`en` sería el inglés, vacío por ahora) |
| `placa` | el fondo de la escena: `linea_amanecer`, `hangar_noche`, `p1c_cuaderno`… |
| `img` | una ilustración específica de esa escena |

> **El `hold` es la perilla más importante del guion y la más fácil de pasar por alto.** Si una
> escena se siente apurada, casi siempre es un `hold` corto, no un texto malo.

---

### ▸ `climax` — **cómo se pelea el final en las misiones con barco**

Tres opciones: **`pasada`** (pasadas de bombardeo), **`arena`** (combate libre en 3D alrededor del
buque) y **`pulso`** (la prueba de teclas).

⚠ **Hoy no importa cuál diga:** `arena` y `pasada` están **en cuarentena**, así que toda misión que
las pida **juega EL PULSO igual**. Afecta a M5 y M14, que en la ficha piden `arena`.

---

### ▸ Las mejoras — **`ofertaTrasMision`**

Después de cada misión el juego te ofrece maniobras nuevas (las inventa el Pichón). El calendario
ya está escrito y es éste:

| Después de… | Qué pasa |
|---|---|
| **M1** | nada. *"El tutorial no entrega."* |
| **M2** | **te dan una, servida, sin elegir**: TERRAIN MASKING |
| **M3 en adelante** | **te ofrecen dos y elegís una** |

Hay 12 maniobras y 10 oportunidades, así que **siempre quedan dos sin aprender** por partida. Y el
TONEL no está en la lista porque **ya viene puesto de fábrica**.

> **Esto está atado al Pulso:** las teclas del Pulso son las maniobras que ya aprendiste. Por eso
> el Pulso no puede aparecer antes de M4 — antes no hay con qué.

---

## 3 · "QUIERO CAMBIAR ESTO, ¿DÓNDE TOCO?"

| Lo que querés cambiar | Dónde se toca |
|---|---|
| Lo que dice un personaje | `story.js`, la línea `es:` de esa escena |
| Cuánto silencio deja después de hablar | `story.js`, el `hold:` de esa línea |
| Qué cara pone | `story.js`, el `cara:` |
| El fondo de una escena | `story.js`, el `placa:` |
| Agregar o sacar una escena entera | `story.js` |
| Que la misión tenga más o menos enemigos | `missions.js`, el `cfg` de esa misión |
| El clima, la hora, la niebla, la lluvia | `missions.js`, el `cfg` |
| Cuántas vidas tenés | `missions.js`, el `roster` (`F5`/`F4`/`F3`) |
| Qué hay que hacer para terminar la misión | `missions.js`, el `goal` |
| El nombre de la misión | `missions.js`, el `name` |
| Dónde suena cada charla durante el vuelo | `missions.js`, el `charla:` de cada tramo |
| Que una charla no frene el vuelo | pasarla de `charla:` (tramo) a `radio:` (fase) |
| Que una línea de radio pare el juego | agregarle `pausa: true` a esa fase |
| Cuánto puede durar una charla en vuelo | `tuning.js`, `CHV_MAX_S` (hoy 25 s) |
| La forma del vuelo (ida / objetivo / vuelta) | `missions.js`, declarando `fases:` |
| Qué trae puesto cada tipo de fase | `fases.js` |
| Cuánto puntaje hace falta para 2 y 3 estrellas | `missions.js`, el `par` |
| Que una maniobra se aprenda antes o después | `upgrades.js`, el orden de la lista |

---

## 4 · LAS DOS TRAMPAS QUE YA NOS MORDIERON

**1. `bombs` son las bombas que te tiran a vos.** No tus armas. `bombs: 0` = nadie te bombardea.

**2. El tipo de fase `vuelta` sube los enemigos solo.** Si querés una vuelta tranquila, hay que
escribir `obstacles` y `caza` a mano en esa fase.

---

## 5 · UNA COSA MÁS: HAY DOS GUIONES EN EL CÓDIGO

`story.js` es **el guion de verdad** — el README del repo lo dice: *"se edita ahí, no en
`strings.js`"*. Pero todavía existe `strings.js` con una versión **vieja** de las mismas escenas,
con textos distintos y peores (ahí Puma dice *"Bienvenido a la Plata"* en vez de *"Bienvenido a Los
Fieles"*).

**Cuando cambies algo, cambialo en `story.js`.** Lo viejo se borra cuando confirmemos que el juego
ya no lo lee.
