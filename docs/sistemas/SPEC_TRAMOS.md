# SPEC — TRAMOS: el guion de spawn por misión · Análisis funcional para implementación

> **Audiencia: una IA implementadora en sesión nueva, sin el chat donde se decidió esto.**
> Define la mecánica de **TRAMOS**: partir cada misión del PASILLO en segmentos por
> fracción de la distancia, cada uno con su propia densidad, mezcla y línea de radio. Es
> LA herramienta que convierte 14 configs planas en 14 niveles con dramaturgia — el
> tránsito mudo del Narwal (M4), el cordón de radares (M2), el infierno que crece (M9),
> las fases de M14. Nace de [DISENO_MISIONES.md](../proyecto/DISENO_MISIONES.md) §2.
>
> **Antes de tocar código, leer en orden:**
> 1. `docs/ARQUITECTURA.md` — manda sobre este spec; divergencias a §8.
> 2. `src/systems/spawn.js` — el sembrador que va a leer los tramos. Notar: el VEIL
>    (cordón final), la mezcla por terreno, y que `spawnSystem` ya recibe `objectiveDist`.
> 3. `docs/proyecto/DISENO_MISIONES.md` §3–§4 — las misiones que van a usar esto.

## 0. Cómo usar este documento

1. Una fase por vez (§6); tras cada una, fixture (§5) + `npm run check` verdes.
2. La regla suprema: **una misión SIN tramos se comporta EXACTAMENTE igual que hoy.**
   Cualquier fase que no pueda demostrar eso, no cierra.
3. Anotar toda divergencia spec↔código en §8.

## 1. Objetivo y alcance

`tramos:` es un campo opcional de la misión (`data/missions.js`) — **data pura, cero
código por misión**:

```js
tramos: [
  { hasta: 0.35, obstacles: 0.3, caza: 0, radio: 'm4_narwal1' },  // el tránsito
  { hasta: 0.85, obstacles: 1.2, caza: 1 },                       // mar abierto
  { hasta: 1.0,  obstacles: 1.8, favor: ['radar', 'aatruck'] },   // el cordón final
]
```

**Alcance:** solo la fase PASILLO (estado `'play'`) de misiones CON objetivo
(`objectiveDist > 0`). CICLO los usa (juega misiones reales). **Fuera de alcance:**
POR LA PATRIA (sin objetivo — v1 los ignora), ARENA/PASADA/PULSO (tienen su propio
reglamento), clima/terreno por tramo (el cielo no cambia a mitad de vuelo en v1), y
cualquier scripting en metros absolutos (las fracciones sobreviven a `?qa`, los metros no).

## 2. El modelo de datos *(las reglas, no negociables)*

- `hasta` = fracción de `objectiveDist`, **estrictamente creciente**; el último tramo debe
  llegar a `1` (si no llega, el resto del vuelo usa el `cfg` plano — válido y deliberado).
- **Claves v1** (toda otra clave es error de datos y el unit test la rechaza):
  - `obstacles` — multiplicador de densidad del tramo (pisa `cfg.obstacles`)
  - `caza` — nivel de LA COLA en el tramo (pisa `cfg.caza`)
  - `bombs` — cadencia de bombardeo del tramo (pisa `cfg.bombs`)
  - `bidones: false` — corta los bidones de combustible en el tramo (M10, último tercio)
  - `favor: ['tipo', …]` — sesgo de mezcla por **re-sorteo**: si el tipo sorteado no está
    en la lista, se sortea UNA vez más. No reescribe las tablas de mezcla del terreno: las
    inclina. (Con dos sorteos, un tipo favorecido de prob. p pasa a ~p·(2−p).)
  - `radio: 'clave'` — línea de radio que se dispara UNA vez al entrar al tramo
  - `marcas: true|false` — reservada para las marcas de Cóndor en HUD (la consume el
    ítem H del plan de misiones; este spec solo la transporta)
- **Nada muta `cfg`.** Los tramos se RESUELVEN por lectura (`core/tramos.js`); si algo
  escribiera `cfg.obstacles`, el valor quedaría pegado para el resto del run y para el
  modo siguiente — exactamente el bug que la convención de stores existe para impedir.

## 3. Requerimientos funcionales

### RF-01 · La resolución es pura
`core/tramos.js`: `tramoAt(dist, objetivo, tramos)` devuelve `{ idx, val(clave) }` (o
`null` sin tramos / sin objetivo); `val` cae al `cfg` cuando el tramo no trae la clave.
Sin DOM, sin stores — **la importa `npm run unit`**. Incluye el validador de datos
(`hasta` creciente, claves permitidas) que corre en el unit contra TODAS las misiones de
`missions.js`. **CA:** unit tests de bordes — dist 0, dist=objetivo, un solo tramo, tramo
corto que `?qa` comprime a metros, clave ausente, lista vacía.

### RF-02 · El sembrador respeta el tramo
`spawn.js` consulta la resolución al decidir densidad (`obstacles`), bombardeo (`bombs`),
bidones y `favor`. `caza` la consulta quien gobierna LA COLA (su gate ya lee `cfg.caza`;
pasa a leer el valor resuelto). **CA (por sonda de conteo):** en una misión de prueba con
tramos 0.3/1.0 de densidades 0.3/1.8, el conteo de spawns por kilómetro difiere ≥3× entre
tramos; con `bidones: false` no nace un solo bidón en el tramo; con `favor: ['radar']` la
proporción de radares al menos se duplica contra el mismo tramo sin favor.

### RF-03 · La radio, una vez y a tiempo
`game.js` (el orquestador, no `spawn`) detecta el cambio de tramo vigente en `update()` y
dispara la `radio:` del tramo NUEVO — popup estilo Cóndor + beep de radio, texto por
`strings.js`. Reglas: **una vez por tramo por run** · solo en `'play'` (jamás en relevo,
pausa o clímax — si el cambio ocurre ahí, la línea se dispara al volver a `'play'`) · si
una sonda salta varios tramos de golpe (`__wjump`), suena SOLO la del tramo vigente, no la
cola entera. **CA:** fixture — volar la misión de prueba entera produce exactamente una
radio por tramo que la declare, en orden, y un `__wjump(0.9)` no produce un coro.

### RF-04 · Cero regresión sin tramos
Misión sin `tramos` → `tramoAt` devuelve `null` y el sembrador lee `cfg` directo, por el
mismo camino de hoy. **CA:** `npm run feel` idéntico al baseline, smoke verde, y el
fixture corre una misión sin tramos verificando que `__trdbg()` reporta `idx: null`.

### RF-05 · Convivencia con lo que ya gobierna el pasillo
El **VEIL** (cordón final) manda SIEMPRE: pasado su corte no siembra nadie, diga lo que
diga el último tramo. El `?qa` comprime distancias: como los tramos son fracciones,
sobreviven — pero un tramo puede quedar de pocos metros; la radio igual debe sonar (RF-03
cubre el salto). El clímax (`flight.js` → señal) no se toca. **CA:** con `?qa`, la misión
de prueba dispara todas sus radios y el VEIL sigue limpiando el final.

## 4. Sondas *(marcadas QUITAR, patrón `__adbg`/`__pdbg`)*

- `window.__trdbg()` — `{ idx, hasta, valores resueltos (obstacles/caza/bombs/bidones/favor), radiosDisparadas }`.
- `window.__trset(tramos)` — inyecta una lista de tramos al run EN CURSO (la única forma
  de probar densidades sin editar `missions.js`); devuelve el resultado del validador.

## 5. Fixture — `npm run tramos` *(`tools/fixture_tramos.js`, patrón de los 9 existentes)*

Corre con `?qa`: (1) misión sin tramos → `idx: null`, feel/smoke intactos · (2) `__trset`
con 3 tramos → conteo de spawns por tramo (RF-02) · (3) `bidones: false` y `favor` medidos ·
(4) radios: una por tramo, en orden, sin coro tras `__wjump` · (5) VEIL sigue mandando ·
(6) cero errores de consola.

## 6. Fases

| fase | entrega | criterio de cierre |
|---|---|---|
| **T0** | `core/tramos.js` puro (resolución + validador) + unit tests + validador corriendo contra `MISSIONS` | `npm run unit` con los casos de RF-01; `check` verde |
| **T1** | `spawn.js` lee obstacles/bombs/bidones/favor; el gate de LA COLA lee `caza` resuelto | fixture pasos 1–3 |
| **T2** | La radio por tramo en `game.js` + strings + supresión (relevo/pausa/salto de sonda) | fixture paso 4 |
| **T3** | Sondas + `npm run tramos` completo en `package.json` | los 6 pasos verdes; `check` verde |
| **T4** | La misión piloto REAL: el tránsito del Narwal en M4 (código `m3`) — tramos + 3–4 claves de radio del guion (GUION_3, "de dónde salen las posiciones") + docs (ARQUITECTURA fila y "¿dónde voy?", DISENO_MISIONES marca ✅) | volar m3: 0 spawns hostiles en el tránsito, la conversación suena en orden, el mar abierto llega con densidad plena |

## 7. Qué NO hacer

1. **No mutar `cfg`** — resolución por lectura, siempre (§2).
2. **No metros absolutos** — fracciones; el `?qa` es un modo de vida.
3. **No tocar el VEIL** ni reescribir las tablas de mezcla por terreno (`favor` inclina
   por re-sorteo, no reemplaza).
4. **No radio desde `spawn.js`** — los sistemas no llaman hacia arriba; la despacha el
   orquestador.
5. **No tramos en ARENA/PASADA/PULSO/PATRIA** (v1).
6. **No clima/terreno por tramo** (v1) — si una misión lo pide a futuro, es spec nuevo.
7. **No strings sueltos, no reasignar stores, no editar el bundle.**

## 8. Divergencias encontradas *(completar durante la implementación)*

**T0–T4 (19/8/2026). Item cerrado: fixture `npm run tramos` verde, `check` verde, `npm run feel`
byte a byte idéntico al baseline.**

### Del diseño

1. **El item se partió en dos archivos**, y el spec nombraba uno. `core/tramos.js` es la
   resolución PURA (fracciones + validador) que importa `npm run unit`; `systems/tramos.js` es el
   estado de la corrida (qué lista trae la misión, cuál es su objetivo, qué radios ya sonaron).
   Es la misma división que `core/squad.js` ↔ `systems/squad.js`, y sin ella el núcleo no podía
   ser puro: la lista y el objetivo son estado de run.
2. **`val(clave)` pasó a ser `val(clave, fallback)`.** El spec (RF-01) dice "cae al `cfg`", pero un
   módulo que ve `cfg` deja de ser puro y de correr en node. El fallback lo pone quien pregunta
   —normalmente `cfg.loQueSea`—, con la ventaja de que el item no se vuelve un segundo dueño de la
   configuración del mapa.
3. **El CA de `favor` ("la proporción al menos se duplica") es inalcanzable por construcción**, y
   el propio §2 tiene la fórmula que lo demuestra: con un solo re-sorteo, un tipo de probabilidad
   `p` pasa a `p·(2−p)`, así que la ganancia **no puede pasar de `(2−p)`** y sólo se acerca a 2
   cuando `p` tiende a 0. El fixture afirma contra esa teoría en vez de contra un número redondo:
   medido sobre el caza (p ≈ 0.11), **10,9% → 20,9% = 1,92×**, con techo teórico 1,89×.
4. **⚠ `?qa` NO SIRVE para medir el pasillo, y el fixture corre sin él** (§5 pedía lo contrario).
   Medido: `?qa` acorta la misión al 6%, así que los 2600 m de M2 quedan en **156** — que es menos
   que la carrera de despegue *y* menos que el primer intervalo de siembra (`run.nextSpawn` nace
   en 320 m). Consecuencias, las tres comprobadas: una misión de distancia **se cumple sola
   durante el despegue** y nunca llega a `'play'`; **no nace un solo obstáculo** en toda la
   corrida; y el corte del VEIL cae en el 50% (su piso "nunca antes de la mitad"). Un fixture con
   `?qa` habría dado verde midiendo cero contra cero. Que las fracciones sobreviven a la
   compresión sí se prueba — en `npm run unit`, que es donde se puede.
5. **`favor` se implementó sembrando y desenterrando**, no clasificando el sorteo por adelantado.
   Para preguntar "qué tipo va a salir" antes de sembrarlo habría que tener las tres cadenas de
   umbrales de `spawn()` **además** en una tabla aparte, y dos copias de la misma lista es el bug
   que este repo ya se comió dos veces (`MODES` y `opts`). Sembrar y deshacer no puede divergir:
   la mezcla que se inclina es la misma que se juega. **Quedan exentos el bidón y la ola** — no
   son mezcla: el bidón tiene su propia llave y resetea `run.fuelDist`, y la ola sale del clima y
   trae su propio reglamento de separación (desenterrarla dejaría el aviso de la rebelde sin ola).
6. **La supresión de la radio fuera de `'play'` no es un chequeo de estado: es DÓNDE está la
   llamada.** `stepTramos()` se invoca en el bloque de vuelo de `update()`, así que en relevo,
   pausa o clímax no se ejecuta y el flanco no se mueve — la línea de un tramo cruzado ahí suena
   sola al volver al vuelo. Verificado en el fixture pausando y saltando de tramo.

### Del comportamiento (cosas que el spec no dice y ahora se saben)

7. **El contador de siembra NO se reinicia al cambiar de tramo.** `run.nextSpawn` se descuenta con
   los metros volados, así que al entrar a un tramo flojo viniendo de uno denso el primer spawn
   ya estaba pago y sale igual — y al revés, **el mar abierto de M4 llega de golpe** apenas se
   termina el tránsito, porque el contador siguió corriendo durante el silencio. Es correcto (el
   mundo no se entera de las fracciones) y para M4 es incluso deseable, pero distorsiona cualquier
   medición chica: el fixture deja asentar el contador antes de contar.
8. **Medir un tramo exige quedarse adentro del tramo.** Una ventana de 10 s a 74 m/s son 740 m y
   el tramo flojo de la prueba mide 780: la medición se comía el principio del tramo siguiente y
   la razón se caía de 6× a 1,9×. El fixture vuelve a saltar al mismo punto cada 400 ms — el
   sembrador cuenta metros VOLADOS, así que volar se sigue volando; lo único que se congela es en
   qué parte del mapa está el avión.

### De las fases

9. **Las sondas (`__trdbg`/`__trset`) nacieron en T1 y no en T3**, porque el criterio de cierre de
   T1 es "fixture pasos 1–3" y esos pasos no se pueden escribir sin ellas. T3 quedó siendo el
   fixture COMPLETO (los seis pasos) más el `package.json`. Se sumaron dos sondas que el spec no
   pedía y sin las cuales la densidad no se puede medir desde afuera: **`__trclear()`/`__trcount()`**,
   el censo de siembra por tipo — mirar `obstacles.length` no sirve, porque la población visible
   es la resta de dos caudales y el tramo gobierna uno solo. Y `__trdbg` reporta **también el
   `cfg` del que cae**: sin eso, la regla suprema ("sin tramos, lo resuelto ES el cfg") no se
   puede comprobar sin meterse en las tripas del bundle.

### De la misión piloto (T4)

10. **M4 (código `m3`) va con `obstacles: 0` en el tránsito, no con 0.3** como proponía
    PLAN_MISIONES_FASES §4. El criterio de aceptación de esa misma ficha es "0 spawns hostiles en
    el tránsito" y el guion dice "sin un solo enemigo en pantalla": con 0.3 igual nace algo cada
    ~200 m. Con 0 el tramo queda literalmente mudo, que es lo que la escena pide. **Efecto
    colateral a saber: tampoco nacen bidones ahí** (viven en el mismo sorteo), o sea que los
    primeros 910 m de M4 no reponen combustible.
11. **`bombs: 0` en el tránsito, que el plan no pedía.** Un bombardeo cayendo del cielo contradice
    la escena tanto como una fragata, y `bombs` es una población aparte del sorteo de obstáculos:
    ponerla en 0 es lo único que hace que "sin un solo enemigo" sea cierto.
12. **El tránsito son CUATRO tramos y no uno**, porque una radio suena una vez por tramo (RF-03).
    Repartir la conversación en cuatro entradas es lo que la convierte en conversación y no en un
    cartel; los cuatro son idénticos salvo la línea. Las cuatro claves (`m4_radio1..4`) son el
    esqueleto de la escena de GUION_3: la posición que el jugador va a usar, la pregunta de
    Gitano, la respuesta que planta el Narwal y el cierre de Puma.
