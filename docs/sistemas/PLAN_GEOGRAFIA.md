# PLAN — La GEOGRAFÍA del pasillo *(mar, costa, acantilado, isla y niebla en una misma misión)*

> **ESTADO (29/9/2026): G0, G1 y G2 HECHAS.** El suelo por tramos anda —mar, costa (de cualquiera
> de los dos lados) y tierra con lomas en una misma misión, con sus costuras— y los bancos de niebla
> se ponen donde dice la data. Se prueba con `?mision=t17&geo=demo` y con `npm run geografia`.
> Faltan G3 (acantilados y barreras por tramo) → G6.

> **Audiencia: una IA implementadora en sesión nueva, sin el chat donde se decidió esto.** Define
> cómo un mismo pasillo —en particular los de IDA Y VUELTA (`t15`, `t17`)— pasa a tener **etapas
> de terreno**: tramos de mar, de costa, de tierra con lomas, **islas que se sobrevuelan**,
> acantilados a un lado, al otro o a los dos, y bancos de niebla puestos donde la misión dice.
>
> **Lo que NO cambia:** el pasillo sigue siendo pasillo. Adelante es `+z`, el carril tiene el
> ancho de siempre, no hay vuelo libre. Lo que cambia es **qué hay abajo y a los costados**.
>
> Pedido del autor (29/9/2026): *"necesito que un mismo pasillo o misión pueda tener etapas donde
> es agua, donde es montaña, donde es acantilado… momentos en donde pueda pasar por encima de quizá
> una isla o un pedazo de tierra"*.
>
> **Antes de tocar código, leer en orden:**
> 1. `docs/ARQUITECTURA.md` — manda sobre este plan; divergencias a §9. En especial las cuatro
>    convenciones y el **lint de capas** (`render` no importa `systems`; la lista solo se achica).
> 2. `src/core/fases.js` + `src/systems/fases.js` — el modelo que este plan COPIA: dato por
>    misión en fracciones, resolución pura en `core/`, estado en `systems/`, nadie escribe `cfg`.
> 3. `src/render/world.js` `drawSea` (el raster por filas: hoy decide el terreno UNA vez por
>    cuadro, líneas ~376-379) · `drawLand` · `drawSeaDots`.
> 4. `src/core/zigzag.js` + `src/render/paredes.js` — las paredes que ya existen (`lado: izq |
>    der | ambos`, con `desde`/`hasta`) y el patrón de dibujo "columnas a lo largo de z, de lejos
>    a cerca" que la isla va a reusar.
> 5. `src/core/tierra.js` (el relieve, `hayRelieve`, `pedreroAt`) y `plantar()` en
>    `systems/spawn.js` (el `gy` de lo que se apoya en el suelo).
> 6. `docs/sistemas/PLAN_TIERRA_COSTA.md` §4 divergencia 10 — por qué el raster de color NO se
>    desplaza con el relieve. Para las lomas de 2 m alcanzaba; **para una isla no alcanza** (§4 G4).

---

## 0. La regla suprema

**Una misión sin `geografia:` se ve y se juega EXACTAMENTE igual que hoy.** Todas las preguntas
nuevas ("¿qué suelo hay acá?") contestan `cfg.terrain` cuando la misión no declara nada. Ninguna
fase cierra si no puede demostrarlo: `npm run feel` idéntico, `npm run agua` / `tierra` / `zigzag`
verdes, y el unit test de §6 comparando `sueloAt()` contra `cfg.terrain` en misiones sin dato.

Una fase por vez (§5). Tras cada una: `npm run geografia` + `npm run check`.

---

## 1. Qué hay hoy, y por qué no alcanza *(la auditoría, 29/9/2026)*

| lo pedido | qué existe | a qué escala | qué falta |
|---|---|---|---|
| tramos de **costa** | mapa COSTA: la orilla corre a lo largo del carril (`shoreAt`), tierra a la izquierda | **misión entera** (`cfg.terrain`) | que la costa aparezca y se vaya adentro de una misión de mar, y que pueda estar a la derecha |
| tramos de **tierra con lomas** | mapa TIERRA: turba, lomas de 2,2 m (T3), pedreros, alambrados | **misión entera** | que sea un tramo |
| **islas** que se sobrevuelan | **la BARRERA DE ROCA del zigzag** (Z8): franja maciza de lado a lado que se pasa trepando, cresta **14–20 m medida contra el radar**, dibujada hasta 1200 m (se ve ~8 s antes), con colisión. Es el núcleo de la isla, ya probado | **sorteada al azar** (`ZZ_BARR_P`), y es un **muro** de 22 m de fondo, no una masa de tierra | ponerla por dato y **alargarla**: de muro a isla (playa, subida, lomo con tierra arriba, bajada) |
| **acantilados** izq / der / ambos | paredes del zigzag (`lado: izq|der|ambos`, `amp: 0` = recto), laderas de 26 m con **meseta arriba que se sobrevuela pagando radar**, con colisión | **un tramo por misión** (`zigzag:` es un objeto, no una lista) | varios tramos por misión, en ida y en vuelta |
| **puentes, tendidos, viaductos** *(el "y demás")* | las otras pieles de la barrera: PUENTE (se pasa por abajo, rasante), MADERA, CABLES | sorteadas | ponerlas por dato |
| tramos de **niebla** | bancos de niebla con fundido (`fogFade`) | **sorteados al azar** por `cfg.fog` | ponerlos donde la misión dice |

**El nudo técnico es uno solo.** `drawSea` resuelve `landMode` / `coastMode` una vez por cuadro y
después pinta todas las filas igual. Pero cada fila del raster **ya sabe a qué profundidad está**
(`wz`). Si la pregunta "¿qué suelo hay?" se hace **por fila**, una isla a 180 m se pinta en las
filas de arriba mientras las de abajo siguen siendo mar: **se la ve venir desde el horizonte y se
acerca sola**, sin un solo sistema de "aparición".

---

## 2. El modelo de datos

Un campo nuevo y opcional de la misión: **`geografia:`**, una lista de tramos por **fracción de
`objectiveDist`**, con el mismo lenguaje que `fases:` — y por lo tanto de **0 a 2** en IDA Y
VUELTA (la vuelta es de 1 a 2, porque el odómetro sigue corriendo después del buque).

```js
geografia: [
  { hasta: 0.20, suelo: 'mar' },
  { hasta: 0.32, suelo: 'costa', lado: 'izq' },                     // la costa entra por la izquierda
  { hasta: 0.36, suelo: 'isla', alto: 9 },                          // una isla que cruza: se pasa por encima
  { hasta: 0.50, suelo: 'mar', paredes: 'ambos' },                  // el estrecho entre acantilados
  { hasta: 0.58, suelo: 'mar', niebla: 1 },                         // un banco PUESTO, no sorteado
  { hasta: 1.00, suelo: 'mar' },
  { hasta: 1.20, suelo: 'tierra', lomas: 4 },                       // la vuelta cruza tierra
  { hasta: 1.26, suelo: 'isla', alto: 14, ancho: 0.6, x: -18 },     // isla parcial: por encima O por el canal
  { hasta: 2.00, suelo: 'mar' },
]
```

### 2.1 Por qué es una lista APARTE de `fases:` *(decisión de diseño)*

Las fases son la **dramaturgia**: radio, techo de radar, qué se siembra, la Chancha. Son largas
(el rasante de t15 son 17 km partidos en dos). La geografía son **accidentes cortos**: una isla
dura 4 % del camino. Meterla en `fases` obligaría a partir una fase en tres solo para ubicar una
isla, y a copiar su radio y su siembra en los tres pedazos — dos preocupaciones en una lista. Van
separadas, **con el mismo lenguaje de fracciones**, y el validador exige lo mismo: `hasta`
estrictamente creciente.

### 2.2 Las claves

**El suelo de base** (`suelo`, obligatoria):

| suelo | qué es | reusa |
|---|---|---|
| `mar` | el de siempre | todo el ítem del agua |
| `costa` | orilla a lo largo del carril; `lado: 'izq' \| 'der'` (dónde queda la tierra) | `shoreAt`, arena, resaca, kelp |
| `tierra` | turba; `lomas` = amplitud del relieve en m (default `TIERRA_AMP`) | todo T1–T6 |
| `isla` | tierra CORTA que cruza el carril con relieve alto: playa, loma, playa | lo nuevo de G4 |

**Los accidentes** (opcionales, combinables con cualquier suelo):

| clave | valores | qué hace | reusa |
|---|---|---|---|
| `paredes` | `'izq' \| 'der' \| 'ambos'` | acantilados a los costados, rectos | paredes del zigzag (`amp: 0`) |
| `niebla` | `1 \| 2` | un banco de niebla en todo el tramo (densidad de `cfg.fog`) | `fog.js`, `fogFade` |
| `barrera` | `'roca' \| 'puente' \| 'madera' \| 'cables'` | una barrera de lado a lado al principio del tramo, PUESTA (no sorteada) | barreras del zigzag (Z8) |
| `alto` | m | *(solo isla)* altura de la cumbre | — |
| `ancho` | `(0, 1]` | *(solo isla)* fracción del carril que tapa; `1` = de lado a lado | — |
| `x` | m | *(solo isla parcial)* dónde está centrada | — |
| `borde` | `'playa' \| 'acantilado'` | *(solo isla)* cómo se entra: loma que sube o farallón | — |

Toda otra clave es **error de datos** y el unit test la rechaza (misma política que `CLAVES` de
`core/tramos.js`: una clave mal escrita que no hace nada y no avisa es la peor forma de fallar).

### 2.3 Las costuras *(la lección de la niebla)*

**Nada aparece de golpe** — es la regla que costó el arreglo del 23/8 (la niebla que se encendía en
un metro). Cada cambio de tramo tiene una costura con su largo (`GEO_COSTURA`, en metros, topada
contra el largo del tramo como el empalme del zigzag para sobrevivir a `?qa`):

- **mar → tierra / isla**: una **playa que cruza el carril** de lado a lado (arena + resaca del
  lado del agua). Como se pinta por fila, se la ve en el horizonte y se acerca.
- **mar → costa**: la orilla **entra desde el costado**: `shoreAt` arranca fuera de pantalla y se
  corre a su lugar a lo largo de la costura.
- **paredes**: el empalme que el zigzag ya tiene (`ZZ_EMPALME`).
- **niebla**: `fogFade`, que ya existe.

---

## 3. La pieza central: `sueloAt` y `alturaSuelo`

`core/geografia.js`, **PURO** (sin DOM, sin stores, sin `cfg` importado — se le pasa lo que
necesita), hermano de `core/sea.js`, `core/tierra.js` y `core/fases.js`:

```js
validarGeografia(lista)            // → lista de errores en texto (vacía = sana)
tramoGeoAt(d, objetivo, lista)     // → { idx, suelo, val(k, fb), costura } o null (= cfg plano)
sueloAt(d, objetivo, lista, plano) // → 'mar' | 'costa' | 'tierra' | 'isla'  (plano = cfg.terrain)
alturaSuelo(wx, wz, …)             // → metros de suelo en ese punto: 0 sobre el mar,
                                   //   tierraH sobre tierra, el perfil de la isla sobre la isla
esTierra(wx, wz, …)                // → ¿hay tierra bajo ese punto? (costa: depende del lado de la orilla)
```

**`alturaSuelo` es la función que decide todo, y la evalúan TRES**: el render (dónde se dibuja el
suelo), el vuelo (`groundY` en `systems/flight.js`) y la siembra (`gy` de lo que se planta). Es la
regla del repo desde `core/sea.js`: **lo que ves es lo que te mata**. Si fueran dos cuentas, la
isla se vería en un lado y mataría en otro.

`systems/geografia.js` tiene el estado (la lista de la corrida y su objetivo), con la misma forma
que `systems/fases.js`, y se carga en `setRunObjective()` al lado de `setFases` y `setTramos`.

### 3.1 Los ~35 lugares que hoy leen `cfg.terrain`

Relevados el 29/9: `render/world.js` (7), `game.js` (6), `systems/spawn.js` (5), `collision.js`
(3), `audio.js` (3), `flight.js` (2), `render/paredes.js` (2), `core/fx.js` (2), `moves.js`,
`render/plane.js`, `core/tierra.js`. Se clasifican en cuatro, y **cada uno pregunta a la
profundidad que le corresponde**:

| quién | pregunta por | ejemplo |
|---|---|---|
| el **raster** | la `wz` de **su fila** | el color del suelo, la costura, la cubierta |
| el **avión** | `run.dist + PZ` (bajo el avión) | `groundY`, la estela, el rocío, el sonido del roce |
| la **siembra** | `run.dist + SPAWN_Z` (donde nace) | fragata sobre el mar, antiaéreo sobre tierra |
| el **tema** | nada: sigue siendo `cfg` | el cielo, la paleta del agua |

---

## 4. Las fases

| fase | entrega | cierre |
|---|---|---|
| **G0** · el cimiento | `core/geografia.js` + `systems/geografia.js` + validador + unit tests + sonda `__geo` + esqueleto de `npm run geografia`. **Nada visible.** | unit verde; **una misión sin dato contesta `cfg.terrain` en todo punto**; `feel` idéntico |
| **G1** · el suelo por fila | el raster decide **por fila**; `drawLand` / `drawSeaDots` recortan por ventana de `wz`; la siembra por el suelo donde nace; `groundY`, estela y rocío por el suelo bajo el avión; las costuras mar↔tierra (playa que cruza) y mar↔costa (orilla que entra); costa con `lado: 'der'` (espejo). Banco de prueba **`t18 · GEOGRAFÍA`** en PRUEBAS | la tierra se ve venir desde el horizonte; sobre tierra no nacen olas ni fragatas; sobre el mar no nacen antiaéreos; la costura no es un corte (se mide su ancho) |
| **G2** · la niebla puesta | `niebla:` en un tramo pone el banco AHÍ (el sorteo de `fog.js` se aparta mientras dure), con `fogFade` | el banco existe dentro del tramo, entra y sale con fundido, y no aparece fuera |
| **G3** · acantilados y barreras por tramo | `paredes: izq \| der \| ambos` por tramo: el zigzag pasa de UNA ventana a una **lista** de ventanas (con `amp: 0`: rectas); y `barrera:` pone una barrera de las cuatro pieles donde dice la data, en vez de sortearla. El `zigzag:` de m5 queda como está | chocar la pared mata del lado que la tiene y el otro lado queda libre; `npm run zigzag` sigue verde |
| **G4** · la isla | `suelo: 'isla'` con `alto`, `ancho`, `x`, `borde`: **la barrera de roca alargada** (ver abajo) con tierra arriba; colisión por `alturaSuelo`; lo que nace en la isla queda plantado (`gy`) | a ras contra la isla se roza y se muere; por encima se pasa; la parcial deja pasar por el canal; **la cumbre se ve desde `SPAWN_Z`** (sin esto la isla es una trampa) |
| **G5** · IDA Y VUELTA la usa | `geografia:` en `t15` — y `t17` la hereda sola, porque es la t15 a escala y las fracciones sobreviven a la compresión. El trazado lo revisa el autor | el fixture corre sobre `t17` (4 min) punta a punta |
| **G6** · docs | fila en ARQUITECTURA, README, y **una guía corta para escribir la geografía de una misión** (qué suelos hay, cómo se combinan, qué no hacer) | alguien que no leyó este plan puede armar el mapa de una misión nueva |

### 4.1 G4 en detalle: la isla es una barrera de roca ALARGADA

`PLAN_TIERRA_COSTA` decidió **no** desplazar el raster con el relieve (divergencia 10): las lomas
miden 2,2 m, y levantar el pasto y sombrear las pendientes alcanzaba para leerlas. **Una isla de
14 m vista desde 3 m de altura no se lee así**: hay que ver su silueta **subir por encima del
horizonte**, o el jugador se estrella contra algo que no vio — la única cosa que este repo no se
permite.

**Pero eso ya está resuelto, en el zigzag.** La barrera de ROCA (Z8) es exactamente esa pieza: un
primitivo "franja maciza entre dos alturas" que cruza el pasillo, se dibuja por rebanadas a lo
largo de `z` de lejos a cerca (el patrón de `render/paredes.js`, con su cara iluminada, su sombra y
su `SOLAPE`), asoma por encima del horizonte hasta 1200 m antes, y la colisión la evalúa la misma
función que la dibuja (`enBarrera`). Lo que le falta para ser isla es **fondo**:

| | barrera de roca (hoy) | isla (G4) |
|---|---|---|
| fondo en `z` | 22 m — un muro | 80 a 400 m — una masa de tierra |
| perfil | cresta plana | playa → subida (`GEO_ISLA_PENDIENTE`) → lomo → bajada → playa |
| arriba | roca | **tierra**: turba, pasto que el viento peina, pedreros (todo T1–T6 sobre el lomo) |
| ancho | siempre de lado a lado | de lado a lado **o parcial**, dejando un canal (`ancho`, `x`) |
| aparece | sorteada | puesta por dato |

O sea: G4 **extiende un primitivo que ya existe y ya se midió**, en vez de inventar un campo de
alturas nuevo. La parte cara del riesgo —verla venir, y que colisión y dibujo coincidan— ya está
pagada.

---

## 5. Decisiones que son del autor *(propuestas con default; nada de esto bloquea G0–G1)*

> **RESPONDIDAS por el autor el 29/9/2026:**
> 1. *"Sí, acorde a la realidad de las islas."* — la altura de cada isla sale de su tamaño real, no
>    de un número fijo. El techo del radar sigue siendo el límite de JUEGO (§5.1 abajo) y se aplica
>    en G4, anotando la excepción cuando una isla real lo supere.
> 2. *"No siempre podemos rodear o pasar por abajo o por arriba, permitamos lo que se pueda."* —
>    cada isla o accidente declara POR DATO qué pasos admite (por encima, por un canal, por abajo en
>    un puente). No hay una regla única.
> 3. *"Por ahora unidades no pongamos nada, concentrémonos en terreno primero, terreno
>    recorrible."* — **sobre tierra no nace nada**. Hecho en G1 (ver §9.4).
> 4. *"Sí, variar según necesidad y todo por tramos."* — `lado: 'izq' | 'der'` por tramo. Hecho en G1.

1. **La altura de las islas contra el radar — ya tiene respuesta MEDIDA.** Las barreras de roca
   se bajaron dos veces midiendo (30–42 → 24–34 → **14–20**): volando a 40 m sin ninguna barrera el
   avión se muere en tres segundos, porque arriba de `RADAR_ALT` (20) llueven misiles. Una isla que
   pide más de 20 no pide una trepada, pide comerse una oleada. **Default:** cresta entre 8 y 20 m,
   y el validador **rechaza** una isla más alta que el techo de radar de la fase que la contiene —
   ojo que el filo de t15 lo baja a **6 m**: ahí no puede haber islas, o el cruce es a la vista.
   Si alguna vez se quiere una isla que obligue a exponerse, es un evento deliberado y va anotado.
2. **Por encima o por el costado.** ¿La isla es siempre de lado a lado, o puede dejar un canal?
   **Default:** las dos, por dato (`ancho`). La parcial convierte la isla en una decisión — subir y
   exponerse o meterse por el canal angosto —, que es el tipo de pregunta que el juego ya hace.
3. **Qué nace sobre la tierra en una fase que dice `solo: ['ola', 'birds']`.** Una ola sobre una
   isla no existe. **Default:** la lista `solo` de la fase se filtra por lo que puede existir en ese
   suelo, y un tramo de geografía puede traer su propio `solo` (el antiaéreo en la ladera, por
   ejemplo, que el zigzag ya sabe plantar).
4. **La costa a la derecha.** Hoy la tierra de la costa está siempre a la izquierda (los soldados
   corren hacia allá, las barcazas desembarcan del lado del agua). El espejo es barato pero toca a
   todos los que leen `shoreAt`. Entra en G1.

---

## 6. El fixture: `npm run geografia`

Corre el juego de verdad, como `agua` y `tierra`. Por fase:

- **G0** — misión SIN dato: `sueloAt` == `cfg.terrain` en 200 puntos del camino, en los tres mapas.
- **G1** — el suelo cambia donde dice la data; la costura mide lo que dice `GEO_COSTURA` (no es un
  corte); sobre tierra no nacen olas ni fragatas; la estela desaparece sobre tierra.
- **G2** — el banco puesto existe dentro del tramo, entra y sale con fundido, y no hay banco fuera.
- **G3** — contra la pared izquierda se muere y por la derecha se pasa (y al revés); `ambos` cierra
  los dos lados.
- **G4** — a ras contra la isla se roza (el vuelo lee su relieve); tres metros por encima se pasa;
  por el canal de la parcial se pasa sin subir; **la cumbre se proyecta por encima del horizonte
  cuando la isla está a `SPAWN_Z`**; la pendiente de entrada de `borde: 'playa'` se puede seguir con
  el gas (se mide, como el 4 % de T3).
- **`?qa`** — las costuras se topan contra el largo del tramo y la geografía entera sobrevive a la
  compresión (la trampa que el zigzag ya encontró una vez).

La medición de física (pendientes, alcance de trepada) se hace **en Node contra el integrador
real**, no piloteando el juego con sondas (memoria del proyecto: ahí se pierden tardes).

---

## 7. Qué NO hacer

1. **No convertir el pasillo en vuelo libre.** El carril, `FLY_X` y la cámara no se tocan.
2. **No escribir `cfg.terrain`** desde la geografía. Se resuelve por lectura, como las fases: si
   algo lo escribiera, el terreno del último tramo quedaría pegado al modo siguiente.
3. **No hacer que algo aparezca de golpe.** Toda transición tiene costura.
4. **No dibujar un relieve que la colisión no conoce** (ni al revés). Una sola `alturaSuelo`.
5. **No agregar cruces de capas.** `render/` no importa `systems/`: la geografía que el render
   necesita la lee de `core/geografia.js` (puro) con la lista que le pasa el orquestador, o de un
   snapshot. El lint de capas tiene trinquete y esto no lo puede agrandar.
6. **No tocar el `zigzag:` de m5.** El callejón de San Carlos sigue siendo lo que es; G3 agrega
   ventanas, no reescribe la que hay.

---

## 8. Perillas *(sección `GEO_*` en `data/tuning.js`)*

| perilla | default | qué es |
|---|---|---|
| `GEO_COSTURA` | 160 m | largo de la costura entre tramos (topada contra el tramo, por `?qa`) |
| `GEO_PLAYA` | 14 m | ancho de la playa que cruza el carril al entrar a tierra |
| `GEO_ISLA_ALTO` | 14 m | altura por defecto de la cumbre — la banda que las barreras de roca ya midieron (14–20: asomarse al borde del radar sin cruzarlo) |
| `GEO_ISLA_PENDIENTE` | 0,07 | pendiente máxima de una isla con `borde: 'playa'` (se sigue con el gas) |
| `GEO_ORILLA_ENTRA` | 220 m | cuánto tarda la orilla en correrse a su lugar al entrar a un tramo de costa |

Todos son de partida: los definitivos salen de medir (§6) y de jugar.

---

## 9. Divergencias *(completar durante la implementación)*

### 1. El estado vive en `core/`, no en `systems/` *(G0)*

El plan pedía `systems/geografia.js` con el estado, copiando `systems/fases.js`. No se puede: el
**render** tiene que leer la geografía (el raster decide el suelo por fila) y el lint de capas
prohíbe que `render/` importe `systems/`. El store (`geo`) quedó en `core/geografia.js`, que es el
precedente de `zz` en `core/zigzag.js`: un store chico más las funciones que lo leen. Lo que sí
quedó en `systems/geografia.js` es lo que no es puro: la carga con la sonda `?geo=` y las sondas de
consola. `lint:layers` terminó sin ninguna entrada nueva.

### 2. El validador rechaza las claves de las fases que no existen todavía *(G0)*

El §2.2 lista el esquema completo (`paredes`, `niebla`, `barrera`, `alto`, `ancho`, `x`, `borde`,
el suelo `isla`). En G0 el validador acepta **solo lo que hoy hace algo** (`hasta`, `suelo`,
`lado`, `lomas`) y rechaza el resto: una clave aceptada que no hace nada es la peor forma de fallar
—el mapa se escribe, se valida y no pasa nada—. Cada fase agrega las suyas, y el unit test que lo
cuida cambia en esa misma fase.

### 3. Sin geografía, cada lector se queda con su código de siempre *(G1)*

La regla suprema se cumple de dos maneras a la vez: las preguntas de `core/geografia.js` contestan
lo mismo que `cfg.terrain` (unit test que recorre los tres mapas en 200 puntos), **y** en el camino
caliente del render ni se hacen — `drawSea`, `drawLand`, `drawSeaDots` y `drawAlambre` miran
`geoOn` una vez y, si es falso, recorren exactamente las ramas de antes. `feel` quedó idéntico.

### 4. Con geografía, la siembra es SIEMPRE la del mar *(G1 — decisión 3 del autor)*

Sobre tierra o costa **no nace nada** (`spawn()` vuelve antes de sortear y cuenta el sorteo en
`geo.sinSiembra`), y sobre el mar nace lo del mar aunque la misión tenga `cfg.terrain` de tierra.
Los soldados, las carpas y los antiaéreos de tierra quedan fuera hasta que el autor decida qué
puebla cada suelo. La pregunta se hace **a la profundidad de siembra** (`SPAWN_Z`), no bajo el avión:
lo que nace allá es lo que va a estar ahí cuando llegues. El fixture lo mide: cruzando la tierra de
la demo, cero cosas del mar paradas sobre la turba.

### 5. La costa de la derecha es la de la izquierda EN ESPEJO *(G1)*

Una segunda versión del dibujo de la costa (arena, arena mojada, resaca, kelp, moteado, bruma)
habría sido otra copia a mantener. En su lugar, la fila se dibuja con la cámara reflejada
(`camX = -cam.x`, `ZB = -ZB`) y un espejo del canvas encima. Todo sale gratis y queda una sola
costa. `groundMottle` y `kelpRow` pasaron a recibir la `x` de cámara por parámetro.

### 6. Qué costura lleva cada cambio *(G1)*

- **mar ↔ tierra: la playa que cruza el carril.** 14 m de arena con su espuma, y el filo
  despeinado (±7 m, dos senos deterministas: la playa no titila). Esas filas se pintan por columnas,
  con el mismo método que la franja de orilla del puerto. La clase de cada columna (agua, espuma,
  arena, turba) sale de `playaClase`, que es la misma que usa el vuelo.
- **cualquier cosa ↔ costa: la orilla se corre.** Viniendo del mar arranca afuera, del lado de la
  tierra (todo agua), y entra a su lugar en `GEO_ORILLA_ENTRA`; viniendo de tierra arranca del lado
  del agua (todo tierra) y se abre. Costa ↔ tierra no lleva playa cruzada.
- **la loma de la tierra arranca plana** después de la playa y crece en `GEO_COSTURA`.
- **Dos costas pegadas de distinto lado están prohibidas** por el validador: la orilla tendría que
  cruzar el carril en diagonal, y eso no es una costura sino un mapa ilegible.

Todas las costuras se topan contra el largo del tramo (35 %) para sobrevivir a `?qa`.

### 7. Lo que G1 NO convirtió, y por qué *(G1)*

Quedan leyendo `cfg.terrain` a secas: en `game.js` el dibujo de soldados, la detonación de la bomba
contra el suelo y el fondo del clímax viejo (con geografía no hay soldados ni bombas sobre tierra, y
el archivo estaba en la tanda *staged* de la otra sesión); `audio.js` (el sonido está bloqueado);
`collision.js` 170 y 510 (camiones de radar y ametrallar soldados: no existen con geografía); y
`render/paredes.js`, que es de G3. Se convirtieron los que dependen del suelo bajo un punto: el
roce y la estela (vuelo), el rocío del avión, la maniobra de pegarse al piso, el rebote de los
escombros, el `alt` de la muerte y la detonación del misil propio.

### 8. No hay `t18` todavía: hay `?geo=` *(G1)*

El banco de prueba `t18 · GEOGRAFÍA` iba en `data/pruebas_misiones.js`, que estaba en la tanda
*staged* de la otra sesión. En su lugar, `data/geografias.js` tiene geografías con nombre y la
sonda `?geo=<nombre>` pisa la de cualquier misión: `?mision=t17&geo=demo` vuela IDA Y VUELTA SMALL
entera con la demo encima. Es mejor que un banco nuevo para probar, porque es la misión real; el
`t18` en el menú PRUEBAS queda para cuando esa tanda esté comiteada.

### 9. Detalles que cambiaron de rebote *(G1)*

- La **flota del horizonte** (decorado del mapa COSTA) no se dibuja con geografía.
- Los **alambrados** cruzan solo la tierra de verdad. En el mapa COSTA de siempre cruzaban el
  carril entero, mar incluido; sin geografía eso se dejó como estaba.

---

### 10. Con bancos puestos, el sorteo no corre *(G2)*

El plan decía que el sorteo de `fog.js` "se aparta mientras dure" el banco puesto. Se hizo más
simple y más fuerte: **si la geografía declara aunque sea un banco, esos bancos SON la niebla de la
misión** y el sorteo no corre en toda la corrida. Una misión que escribe dónde hay niebla no puede
sumar bancos al azar encima: el mapa escrito dejaría de ser el mapa que se juega. Si la geografía no
declara ninguno, todo sigue como siempre (`cfg.fog`, la fila NIEBLA de OPCIONES).

### 11. El sistema de niebla pasó a preguntar una DENSIDAD, no `cfg.fog` *(G2)*

`inBank`, `fogVis`, `fogFade` y `bankAhead` preguntaban `cfg.fog` directo. Ahora preguntan `dens`,
que escribe solo `stepFog`: vale `cfg.fog` con los bancos sorteados y la densidad del banco con los
puestos. Todo lo que ya colgaba de la niebla —el cartel BANCO DE NIEBLA, la vista
que se corta, las olas que no nacen adentro, el Harrier que queda ciego— funciona con los bancos
puestos **sin haberlo tocado**.

### 12. Dos tramos seguidos con niebla son UN banco *(G2)*

Si fueran dos, el fundido bajaría a cero en la juntura y volvería a subir: un pozo de claridad en
medio de la bruma que nadie escribió. `juntarNieblas` los une al armar la geografía, con la
densidad más cerrada de los dos.

### 13. El unit test prueba el SISTEMA, no solo la data *(G2)*

`systems/fog.js` corre en Node (lee el odómetro y nada más), así que el test mueve `run.dist` y
mira lo que el sistema contesta: lejos no hay nada, la bruma se ve venir antes del borde, adentro
recorta la vista, se va con fundido, y pasado el banco no aparece ninguno más — con `cfg.fog` en 0
**y en 2**, que es la prueba de que el sorteo no se suma.

## 10. Coordinación *(29/9/2026)*

Hay otra sesión editando el mismo árbol en paralelo — al escribir este plan tenía cambios *staged*
en `game.js`, `render/hud.js`, `render/menus.js`, `systems/blanco.js` y `data/pruebas_misiones.js`.
G1 toca `render/world.js`, `systems/spawn.js`, `systems/flight.js` y `setRunObjective()` en
`game.js`; G5 toca `pruebas_misiones.js`. **Antes de cada fase: `git status`, releer el archivo
justo antes de editarlo, y commitear lo propio por nombre, en commits chicos.**
