# CONTESTAR — elegir qué se responde en el diálogo *(plan para el futuro, sin implementar)*

> **Qué es.** Que en ciertos puntos del diálogo el juego le dé al jugador **dos o tres respuestas**
> y la escena siga por la que eligió. Hoy el guion es una fila: el jugador lee y avanza.
>
> **Por qué va después** de [PLAN_ESCENAS_INVESTIGABLES.md](PLAN_ESCENAS_INVESTIGABLES.md): el
> código es chico; **lo caro es el guion**. Cada punto de decisión pide escribir dos o tres
> versiones de un tramo de escena, con sus IDs, sus caras y sus holds, y hacer que todas vuelvan
> a la historia. Eso es agrandar el guion, y el guion está a medio cerrar.
>
> **Estado:** plan para encarar en el futuro. Antes de escribir una línea de código hay que
> resolver las dos preguntas de §1, que son del autor.

---

## 1 · Las dos preguntas que van primero (y por qué no son de código)

### 1.1 ¿Quién contesta?

El canon dice (GUION_3 §1): **"El jugador nunca juega al hijo. Solo lo lee."** El jugador es el
lector de los papeles, y recién al final se entera de dónde estuvo sentado. Si el jugador
*contesta*, alguien en la escena tiene que estar diciendo esas palabras. Las opciones:

| quién | qué implica | choque con el canon |
|---|---|---|
| **A · Esteban** | el jugador elige lo que dice el Tero | el más natural para un juego de pilotos; pero Esteban ya tiene una voz muy escrita (los silencios, el "Sí..." de M05). Contestar por él puede romperla |
| **B · El piloto que se vuela** | contesta el del avión elegido (PILOTOS_JUGABLES) | multiplica el texto por piloto |
| **C · Nadie: se elige QUÉ PREGUNTAR, no qué decir** | las opciones son temas ("¿Y eso para qué sirve?", "¿Y el Vasco?") y el personaje responde | **el que menos choca**: el lector *pregunta* sin tener voz propia. Es además el que mejor empalma con los lugares investigables |
| **D · Callarse es una respuesta** | toda elección trae un silencio como opción | combina con A; es lo más Esteban que hay |

**Recomendación: C como base, con D donde la escena lo pida.** Preguntar en vez de responder
mantiene al jugador como lector curioso —que es lo que el marco del final revela que es— y no le
pone palabras en la boca a un personaje que el guion ya actúa.

### 1.2 ¿Qué cambia lo que elegís?

Tres niveles, de más barato a más caro:

| nivel | qué cambia | costo de guion | ejemplo |
|---|---|---|---|
| **1 · Sabor** | solo las 1–3 líneas que siguen; después la escena vuelve a la fila | bajo | preguntarle al Pichón por la máquina o por las bengalas |
| **2 · Memoria** | deja una **marca** que una escena POSTERIOR lee para cambiar una línea | medio | si en M3 le preguntaste al Turco por su pincel, en M12 el Turco te lo nombra |
| **3 · Consecuencia** | cambia algo jugable | alto | hoy ya existe una: la mejora que se elige (dos ofrecidas, una se toma). Cualquier otra toca diseño de misiones |

**Recomendación: 1 y 2. El 3 no.** El juego ya tiene su consecuencia jugable (las mejoras) y su
gran decisión (el final, que el canon quiere **sin menú**: GUION_3 §7, SPEC RF-10 — *"muere el
sistema de tres opciones con textos"*). Este plan **no toca el final**: las respuestas viven en
las conversaciones, nunca en el timón.

---

## 2 · El diseño

### 2.1 La forma: abanicos que vuelven, nunca árboles

Cada punto de decisión abre **un abanico corto** (2–3 ramas de 1–4 líneas) que **vuelve a la
misma línea siguiente**. Nada de árboles: un árbol de tres niveles con tres opciones son 27
finales de escena, y el guion se vuelve inmanejable. La historia es una sola; lo que cambia es
el camino de un párrafo.

```
… línea 040 ──► ELEGÍ ──┬─ rama A (2 líneas) ─┐
                         ├─ rama B (3 líneas) ─┼──► línea 050 …
                         └─ rama C (silencio) ─┘
```

### 2.2 El formato en `story.js`

Respeta SISTEMA_DIALOGO al pie: **cada opción y cada línea de rama tiene su ID estable** (son
futuros archivos de voz y futuras filas de traducción).

```js
{ id: 'M03_INVENTO_045', tipo: 'ELEGIR',
  opciones: [
    { id: 'M03_INVENTO_045A', es: '¿Y eso para qué sirve?', marca: 'pregunto_fideos',
      rama: [
        { id: 'M03_INVENTO_046A', personaje: 'PICHÓN', cara: 'pichon_entusiasmo', hold: 0.6,
          es: '…', en: '' },
      ] },
    { id: 'M03_INVENTO_045B', es: '¿El Turco sabe?', rama: [ /* … */ ] },
    { id: 'M03_INVENTO_045C', silencio: true, rama: [ /* la escena sigue sin que preguntes */ ] },
  ] },
// …y una linea POSTERIOR (otra escena, otra mision) que lee la marca:
{ id: 'M08_HANGAR_030', personaje: 'PICHÓN', si: 'pregunto_fideos', es: '…', en: '' },
{ id: 'M08_HANGAR_031', personaje: 'PICHÓN', sino: 'pregunto_fideos', es: '…', en: '' },
```

- **`si` / `sino`**: la línea se muestra o no según una marca. Se filtran al empezar la escena,
  así el motor sigue recorriendo una lista plana.
- **`silencio: true`**: una opción sin texto, que se dibuja como `…` o como esperar.
- **Las marcas son nombres, no números.** `pregunto_fideos`, no `flag_17`.

### 2.3 Cómo se ve: la caja de diálogo crece

Este es el cambio de presentación que el autor ya anticipó ("cambiar o agrandar el diálogo del
guion"):

- En el punto de decisión, **la caja VN deja de tipear y muestra las opciones** apiladas, una
  por renglón, con el busto del que preguntó todavía a la izquierda.
- Hoy la caja mide lo que miden sus renglones (`WRAP_BODY = 68`). Con 3 opciones de hasta ~40
  caracteres la caja **sube 2–3 renglones** solo mientras se elige, y baja después. Animado, no
  de golpe.
- **Selector compartido con los lugares:** foco + confirmar, mouse (hover y click), flechas /
  stick (arriba-abajo), A / Enter. Se construye una vez (en el plan de lugares) y se usa en los
  dos.
- **Sin reloj por defecto.** Este juego se lee. *(Ver §2.4 la excepción.)*
- **Sin "volver atrás" por encima de una elección.** `backDialogue()` hoy deja retroceder
  líneas; una elección hecha no se des-hace, si no deja de ser elección.

### 2.4 La excepción: contestar volando

Las charlas en vuelo (`tipo: 'VUELO'`, `systems/charla.js`) corren **solas, sin pausa**, con el
avión volando abajo. Una pregunta ahí sería por radio, con **tiempo**: no contestar a tiempo
elige la rama de silencio. Es la versión más interesante y la más riesgosa (se lee mientras se
vuela al ras del mar). **Queda fuera de las primeras fases** y se evalúa después de jugar las de
pantalla.

---

## 3 · La arquitectura

| capa | archivo | qué cambia |
|---|---|---|
| datos | `data/story.js` | `tipo: 'ELEGIR'`, `opciones`, `rama`, `marca`, `si`/`sino`, `silencio`. |
| motor | `core/dialogue.js` | Sigue **puro y lineal**. Cuando la línea actual es `ELEGIR`: `dlg.elige = { foco }` y el avance se frena. `elegir(i)` **inserta las líneas de la rama** después de la actual en la lista de la escena (no salta a ningún lado) y anota la marca. `si`/`sino` se filtran en `startScene` contra `dlg.marcas`. Todo testeable en node. |
| estado de partida | `systems/saves.js` | `marcas: string[]` por partida. Sobrevive a guardar/cargar; un replay de misión las conserva (una elección no se re-elige por reintentar una misión). |
| render | `render/screens.js` (`drawVNBox`) | La caja con opciones y su altura animada. |
| orquesta | `game.js` | Pasa las marcas al motor al arrancar la secuencia y las recoge al terminar. Nada más: **el motor no llama para arriba**, devuelve `'eligio'` como señal. |

**Por qué insertar y no saltar:** el motor de hoy avanza `li` de a uno; saltar a etiquetas lo
convierte en un intérprete de grafos. Insertar la rama en la lista mantiene la regla de una sola
fila — la fila simplemente cambia de contenido según lo elegido. El `hold`, el tope `HOLD_MAX`,
el tipeo y las caras no se enteran de nada.

---

## 4 · Verificación: el guion con ramas necesita su propio lint

Con ramas, el error más probable no es de código sino de **datos**: una marca que nadie pone, un
`si` mal escrito, una rama sin salida. Se agrega `npm run lint:guion` (entra al gate `check`):

- todo `si` / `sino` nombra una marca que **alguna** opción pone, en una escena **anterior**;
- todo ID es único en todo `story.js` (ramas incluidas);
- toda rama termina (no hay `ELEGIR` adentro de una rama — abanicos de un solo nivel);
- ninguna opción pasa de ~40 caracteres (lo que entra en un renglón de la caja).

Y un fixture `npm run elegir` que recorre **cada opción de cada punto** y verifica que todas
vuelven a la misma línea siguiente.

---

## 5 · Fases

| fase | qué | depende de |
|---|---|---|
| **R0 · decisiones** | §1.1 quién contesta · §1.2 qué cambia | el autor |
| **R1 · motor** | `ELEGIR` + inserción de rama + marcas + `si`/`sino` en `core/dialogue.js`; unit tests | R0 |
| **R2 · lint** | `lint:guion` en el gate | R1 |
| **R3 · caja** | opciones en la caja VN, altura animada, selector (reusado de los lugares) | R1 · selector de L2/L3 del plan de lugares |
| **R4 · guardado** | marcas en la partida; PRUEBAS → una escena con elección | R1 |
| **R5 · el primer punto de verdad** | UNA elección de nivel 1 en UNA escena, escrita por el autor | R3 · texto |
| **R6 · memoria** | una marca que una escena posterior lee | R5 · texto |
| **R7 · en vuelo** *(opcional)* | pregunta por radio con tiempo, rama de silencio por defecto | jugar R5–R6 primero |

R1–R4 es código sin contenido. **El volumen del plan lo pone R5 en adelante**, y es guion.

---

## 6 · Cuánto guion es

Una estimación para decidir con números:

- 1–2 puntos de decisión por misión × 14 misiones ≈ **15–25 puntos**;
- cada punto ≈ 3 opciones × 2–3 líneas ≈ **6–9 líneas nuevas**;
- total ≈ **100–220 líneas nuevas**, más las líneas `si`/`sino` de memoria (≈ 2 por marca que
  se lee), más su traducción cuando llegue el `en`.

Para comparar: es del orden de **un tercio a la mitad de lo que ya tiene el guion entero**.
Por eso es futuro.

## 7 · Cómo se cruzan los dos planes

Los dos comparten la misma idea —**el jugador elige qué quiere saber**— desde dos lados: en el
LUGAR elige tocando la imagen; en la conversación elige preguntando. El orden que conviene:

1. **Lugares primero.** Agrega contenido opcional sin tocar el guion que existe, y deja hecho el
   selector (foco + confirmar, mouse + pad).
2. **Respuestas después**, empezando por las preguntas de nivel 1 — que son, en el fondo, una
   cosa del lugar convertida en conversación.
