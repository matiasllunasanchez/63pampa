# LAS ESCENAS QUE SE INVESTIGAN — tocar la placa y que alguien te cuente *(plan, sin implementar)*

> **Qué es.** Que la placa de fondo de una escena del modo historia deje de ser una foto detrás de
> la caja de diálogo y pase a ser **un lugar**: el jugador puede pasar el cursor por la imagen,
> encontrar cosas, tocarlas, y que un personaje le cuente qué son y por qué están ahí. Los
> personajes siguen sin aparecer en la imagen —viven en el busto de la caja, como hoy—; lo que se
> vuelve interactivo es **el lugar**.
>
> **El ejemplo del autor (12/10/2026):** en el hangar del Pichón están las CHAFITAS a medio armar
> y la máquina de fideos con la que cortaban el aluminio. Si el jugador la toca, el Pichón le
> cuenta qué es y por qué está ahí. Si no la toca, no se pierde nada de la historia.
>
> **La tesis:** **no OBLIGAR a leer todo.** El guion de hoy es una fila: para llegar al despegue
> hay que pasar por cada línea. Con esto, la fila queda con lo esencial y **todo lo que es sabor,
> historia real y objeto se mueve a la imagen**, para el que tenga ganas de buscarlo.
>
> **Estado:** plan para encarar. Va **antes** que [PLAN_RESPUESTAS_DIALOGO.md](PLAN_RESPUESTAS_DIALOGO.md)
> porque no toca una sola línea del guion que ya existe: solo agrega escenas chicas nuevas.

---

## 1 · Lo que ya hay y se reusa

| pieza | dónde | qué aporta |
|---|---|---|
| **El motor de líneas** | `core/dialogue.js` | Tipeo, `hold`, caras, avance. Una COSA tocada dispara una escena de `story.js` con este motor, **sin reformarlo**. |
| **El guion como datos** | `data/story.js` (`SCENES`) | Cada explicación es una escena más, con IDs estables (`M03_HANGAR_FIDEOS_010`…) — las reglas de SISTEMA_DIALOGO valen enteras. |
| **Las placas** | `assets/plates/*.webp` + `data/placas.js` | 33 lugares sin gente. El LUGAR se monta sobre una placa existente. |
| **El encaje de la lámina** | `render/screens.js` `drawStory` → `lam` | Ya calcula el rectángulo donde cae la placa (encajada, centrada, con negro a los costados). Las cajas de las cosas se miden **en fracciones de ese rectángulo**, no de la pantalla. |
| **El mouse** | `core/input.js` (`mouse`, `pointerdown`) | Ya se escucha posición y click; hoy solo se usa en vuelo y en el selector de modo. |
| **El pad** | `core/input.js` | Ya navega menús. Se necesita para Steam / Steam Deck: **el lugar tiene que poder recorrerse sin mouse**. |

Lo que **no** hay y es nuevo: un estado `'lugar'`, el hit-test, el cursor que salta de cosa en
cosa con el pad, y el dibujo del resaltado.

---

## 2 · El diseño

### 2.1 Qué es un LUGAR

Un tipo de escena nuevo en `story.js`, al lado de `VN`, `TIERRA`, `CARTA`, `VUELO`:

```js
M03_HANGAR: {
  id: 'M03_HANGAR', tipo: 'LUGAR', titulo: 'EL INVENTO', placa: 'hangar_noche',
  // la escena con la que se ENTRA (opcional): una o dos lineas que ponen al jugador en el lugar
  entrada: 'M03_HANGAR_ENTRA',
  cosas: [
    { id: 'fideos',  nombre: 'LA MÁQUINA DE FIDEOS', caja: [0.62, 0.48, 0.14, 0.18], escena: 'M03_HANGAR_FIDEOS' },
    { id: 'chafitas', nombre: 'LAS CHAFITAS',        caja: [0.30, 0.55, 0.10, 0.12], escena: 'M03_HANGAR_CHAFITAS' },
    { id: 'pava',    nombre: 'LA PAVA',              caja: [0.08, 0.40, 0.08, 0.10], escena: 'M03_HANGAR_PAVA' },
  ],
  salidas: [
    { id: 'pista', nombre: 'A LA PISTA', caja: [0.90, 0.30, 0.10, 0.40], a: 'M03_PISTA' },
  ],
  // con que se sigue: 'salir' = una salida marcada como la que continua la mision
  sigue: { nombre: 'AL AVIÓN', caja: [0.45, 0.20, 0.12, 0.20] },
},
```

- **`caja` en fracciones de la lámina** `[x, y, w, h]`. Sobrevive a cambiar de resolución, a
  rehacer la placa con otro encuadre (se re-miden cuatro números) y a la placa 3:4 del cuaderno.
- **Una cosa = una escena** de `story.js`. Corta: 2 a 5 líneas. Nadie lee un párrafo por tocar
  una pava.
- **`sigue` es la puerta para continuar.** Siempre visible y siempre disponible desde el primer
  cuadro: el jugador que no quiere investigar se va en un click. Esa es la tesis entera.

### 2.2 Las reglas del contenido (las que no se negocian)

1. **Nada que la historia necesite vive solo en una cosa.** Si el jugador tiene que saberlo para
   entender lo que viene, va en la fila. La cosa es el *por qué*, el detalle, la anécdota real.
2. **Lo histórico se verifica antes** (memoria: *referencias, verificar antes*). Las cosas son el
   lugar natural para el material de MEJORAS_PICHON (la máquina de fideos ✅, las bengalas en
   cartuchos de arranque ✅, las espoletas…) — y ese material ya está verificado, con fuentes.
3. **Quien explica es un personaje, nunca un narrador de museo.** El Pichón explica la máquina,
   el Turco se queja de ella. La voz es la del guion, no la de una placa de vitrina.
4. **Pocas cosas por lugar: 3 a 5.** Más que eso es una pantalla de "buscá el objeto" y no un
   lugar.
5. **El tiempo no corre.** No hay reloj en un lugar. El lugar espera.

### 2.3 Cómo se ve y cómo se toca

- **Mouse:** al pasar sobre una cosa, se ilumina su contorno (un trazo fino, cálido, que respira
  despacio) y aparece su `nombre` chico, en la tipografía de la tarjeta de misión. Click = se
  abre la escena con la caja de diálogo de siempre, la placa queda atrás con el velo de siempre.
- **Pad / teclado:** el cursor **salta de cosa en cosa** (stick o flechas eligen la más cercana
  en esa dirección; A / Enter abre). No hay cursor libre con el stick: un puntero libre con
  stick es incómodo y en el Deck se nota.
- **Táctil:** tap = abrir; no hay hover, así que el nombre aparece al primer tap y abre al
  segundo. *(Decisión menor: o eso, o abrir directo.)*
- **Lo ya visto se apaga.** Una cosa leída queda con el contorno tenue. Y un contador discreto
  en una esquina, `2 / 3`, para el que quiere completar.
- **Encontrar sin pixel-hunting:** mantener un botón (RB / Shift) **muestra todas las cosas a la
  vez**. El jugador curioso las busca con el ojo; el apurado aprieta y ve el mapa.

### 2.4 El arte: el problema real de este plan

**Las placas de hoy no tienen las cosas dibujadas.** `hangar_noche` es un hangar, no el hangar
del Pichón con la máquina de fideos en la mesa. Hay tres caminos:

| camino | qué es | costo | límite |
|---|---|---|---|
| **A · Placa nueva por lugar** | regenerar el lugar con los objetos adentro | alto, por lugar | cada lugar es un asset único; si la cosa no quedó donde se quería, se regenera todo |
| **B · Objetos recortados encima** | PNG con alfa por cosa (`assets/cosas/fideos.webp`), puestos sobre la placa por dato | medio, por objeto | hay que lograr que el recorte "pegue" con la luz de la placa |
| **C · Solo contorno sobre lo que ya está** | usar lo que la placa ya muestra (una pava, una mesa, un avión) | cero | solo sirve para objetos genéricos — la máquina de fideos no está |

**Recomendación: B, con C donde alcance.** Los objetos recortados se reusan entre lugares (la
pava está en el hangar y en la cocina), la caja de la cosa sale sola del tamaño del recorte, y la
placa no se toca. El primer lugar sirve para medir si el recorte "pega"; si no pega, A para
ese lugar puntual.

### 2.5 Navegar entre lugares

Las `salidas` llevan a otro LUGAR. **Grafo chico a propósito:** 1 a 3 lugares por pausa entre
misiones (el hangar → la pista → la sala de radio). No es una aventura gráfica: es caminar el
cuartel un rato. Volver para atrás siempre se puede (la salida inversa la pone el motor, no el
dato).

### 2.6 Dónde entra en la campaña

Un LUGAR es una escena más dentro de la secuencia del briefing (`m.story`). La secuencia hoy es
`[VN, VN, TARJETA…]`; pasa a poder ser `[VN, LUGAR, VN…]`. El LUGAR se termina cuando el jugador
toma `sigue`, y la secuencia continúa con la escena siguiente. **Ninguna misión tiene que
cambiar de forma** para tener uno.

Candidatos naturales: el **hangar del Pichón** (M3 «El invento» — donde nacen las CHAFITAS),
la **sala de radio** (M5 — la libreta, los auriculares, el mapa), el **vestuario** (M6 — los
lockers, la foto), la **línea al amanecer** (cada avión del escuadrón es una cosa: tocás el
A-4 del Gitano y el Gitano te dice algo).

---

## 3 · La arquitectura (según ARQUITECTURA.md)

| capa | archivo | qué hace |
|---|---|---|
| datos | `data/story.js` | `tipo: 'LUGAR'` + las escenas de cada cosa. Sin lógica. |
| núcleo puro | `core/lugar.js` *(nuevo)* | `cosaEn(lugar, lam, x, y)` (hit-test), `vecina(lugar, desde, dir)` (el salto del pad), `rectDe(caja, lam)`. **Testeable en node**: es la parte que tiene que ser exacta. |
| sistema | `systems/lugar.js` *(nuevo)* | El store (`L`, se muta): lugar actual, cosa enfocada, `vistos` del lugar. `update()` devuelve **señales** — `{ abrir: 'M03_HANGAR_FIDEOS' }`, `{ ir: 'M03_PISTA' }`, `{ sigue: true }` — nunca llama al motor de diálogo. |
| render | `render/lugar.js` *(nuevo)* | Placa + objetos recortados + contornos + nombre + contador. **El cálculo de `lam` sale de `drawStory` a una función compartida** para que el hit-test y el dibujo midan el mismo rectángulo. |
| orquesta | `game.js` | Estado nuevo `'lugar'`. Señal `abrir` → `startSeq([SCENES[id]])` + `setState('story')` con una marca de "volver al lugar"; al terminar la escena, vuelve a `'lugar'` en vez de despegar. |
| input | `core/input.js` | En `'lugar'`: mouse mueve el foco, click abre; flechas/stick saltan; A/Enter abre; RB/Shift muestra todo. |
| guardado | `systems/saves.js` | `vistos` por partida (para el contador y el contorno apagado al volver a jugar la misión). |

**La pieza delicada es la vuelta:** hoy, cuando termina una secuencia de `'story'`, `game.js`
despega (`trasBrief`). Con un LUGAR, la escena de una cosa termina y **hay que volver al lugar**,
no despegar. Eso es una pila de un nivel (`volverA: 'M03_HANGAR'`), no un sistema de pila
general: un LUGAR no abre otro LUGAR desde una cosa.

---

## 4 · Fases

| fase | qué | cómo se verifica |
|---|---|---|
| **L0 · decisión** | el autor elige el primer lugar y el camino de arte (§2.4) | — |
| **L1 · núcleo** | `core/lugar.js` + `tipo: 'LUGAR'` en los datos + `lam` compartido | `npm run unit`: hit-test en los bordes, en la lámina 3:4, salto del pad en las cuatro direcciones |
| **L2 · se toca con mouse** | estado `'lugar'`, render con contornos, click abre la escena, la escena vuelve al lugar, `sigue` continúa | fixture `npm run lugar` (sonda `?lugar=<id>` QUITAR): abre, lee, vuelve, sale — y el briefing termina igual que antes |
| **L3 · pad, teclado y táctil** | salto entre cosas, mostrar todo, tap doble | el fixture recorre el lugar entero **sin mouse** |
| **L4 · el primer lugar de verdad** | el hangar del Pichón en M3 con 3 cosas y sus escenas (texto del autor) | se juega; captura de cada estado |
| **L5 · salidas** | navegar a un segundo lugar y volver | fixture: ida y vuelta, `vistos` se conserva |
| **L6 · memoria** | `vistos` al guardado; contador; PRUEBAS → LUGAR | fixture con guardado y recarga |
| **L7 · extender** | un lugar por pausa donde tenga sentido | — es contenido, no código |

L1–L3 son **código sin contenido** (un lugar de prueba con cajas de colores alcanza). L4 es
donde aparece el juego, y depende del texto y del arte.

---

## 5 · Lo que tiene que decidir el autor

1. **El primer lugar** — propuesta: el hangar de M3, porque ya tiene la máquina de fideos y las
   CHAFITAS como contenido verificado y como mecánica del juego.
2. **El camino de arte** (§2.4) — propuesta: B, objetos recortados.
3. **Si se ve cuántas cosas hay** (`2 / 3`) o el lugar no dice nada y se descubre.
4. **Si "mostrar todo" existe** o la búsqueda es parte del juego.
5. **Si las cosas cambian entre misiones** — la máquina de fideos en M3 es nueva; en M8 ya está
   gastada y el Pichón dice otra cosa. Es muy lindo y multiplica el texto.

## 6 · Riesgos

- **El arte es el cuello de botella**, no el código. Con L1–L3 hechos, cada lugar cuesta lo que
  cuesta su arte y su texto.
- **Un lugar puede frenar el ritmo** entre dos misiones. Por eso `sigue` está siempre a un click
  y por eso 3–5 cosas como techo.
- **El contenido opcional se escribe y nadie lo lee.** Es el precio de no obligar. Mitigación:
  que las cosas sean **lo mejor** del material histórico, no el relleno.
- **Se cruza con el plan de respuestas:** si un día una cosa abre una pregunta ("¿y esto
  funciona?"), ese es el plan de respuestas montado sobre este. El selector de §2.3 (foco +
  confirmar, con mouse y con pad) **se construye una vez acá y se reusa allá**.
