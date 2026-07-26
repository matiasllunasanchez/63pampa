# Prompt — ALTURAS del cielo y limpieza del mástil de las fragatas

> **✔ IMPLEMENTADO** (julio 2026). Las alturas viven en `SPAWN_Y` (`data/tuning.js`), el techo de
> radar en `RADAR_ALT = 20`, y la fragata mide `SHIP_H` con su luz roja de tope. Se tomó el
> **default** de la decisión abierta: la fragata pasó a obstáculo bajo (sale de `TALL` y entra a
> `STRUCT` en `core/hitbox.js`) y el mar compensó con más aeronaves. Este archivo queda como la
> especificación original.

Rebalanceá las **alturas** a las que vive cada cosa en `63pampa` (juego arcade de vuelo rasante,
JS vanilla + canvas, Electron). La idea es que el cielo deje de ser una sopa donde todo aparece
en cualquier lado y pase a tener **capas legibles**: mirás la altura y sabés qué te puede pasar.

Antes de tocar código leé `docs/ARQUITECTURA.md` (las cuatro convenciones) y `src/data/tuning.js`.
Es un proyecto con convenciones fuertes y una red de tests que hay que respetar.

---

## Lo que hay que cambiar

### 1. Las capas del cielo

| qué | hoy | queda en |
|---|---|---|
| **Techo de radar** | 30 m | **20 m** |
| **Pájaros** (bandada, daño no letal) | 7 – 19 m | **5 – 10 m** |
| **Helicópteros** (letal) | 5 – 21 m | **10 – 15 m** |
| **Aviones enemigos** (`jet`, letal, viene de frente) | 5 – 20 m | **15 – 25 m** |

La lectura buscada, de abajo hacia arriba: **pájaros abajo** (te ensucian, no te matan),
**helicópteros en el medio**, **cazas arriba** — y el radar cortando justo por el medio de la
banda de los cazas, así que subir a pelear con ellos te pinta.

### 2. Las fragatas pierden el poste

Hoy la fragata del mar abierto (`type: 'mast'`) es un **palo altísimo** de 11 a 28 m con una
verga cruzada y una luz roja en la punta, y el casco horneado dibujado al pie. **El palo y la
verga no van más: queda la fragata con su luz roja arriba.**

> ⚠️ **Esto no es un cambio de dibujo, es un cambio de juego, y es la parte delicada del pedido.**
> El palo **es** el obstáculo: es lo único vertical del mar abierto y su altura sorteada es lo que
> hace que esquivar mástiles sea la habilidad central de ese mapa. Sacar el dibujo sin tocar la
> colisión deja una **columna letal invisible** — el peor bug posible, porque no parece un bug.
> Ver la decisión abierta más abajo.

---

## Contexto real del código (verificado — usá estos puntos de entrada)

| qué | dónde |
|---|---|
| **techo de radar** (una sola constante) | `src/data/tuning.js:18` — `RADAR_ALT = 30` |
| quién lee `RADAR_ALT` | `systems/flight.js:263` (carga/descarga de detección), `render/world.js:1358` (la RED), `render/hud.js:254` (altura en rojo) — **los tres ya salen de la constante: se cambia un número** |
| **altura de cada obstáculo al nacer** | `src/systems/spawn.js`, función `spawn()` |
| dibujo del mástil / fragata | `src/render/world.js:472-490` |
| cajas de colisión (una sola fuente) | `src/core/hitbox.js` |
| hoja horneada de la fragata | `render/enemies.js` (`SHEETS.fragata`, caja `y0:13 → y1:35`, `wu: 11`) |
| daño de la bandada (no letal) | `systems/collision.js:124` |
| overlay de depuración de hitboxes | menú `[M]` → `HITBOXES: SI` (`cfg.hitboxes`) |

**Las alturas están repetidas, una vez por terreno.** No hay un solo lugar donde tocarlas: el
sorteo de `spawn()` tiene tres bloques (COSTA, TIERRA, MAR ABIERTO) y cada tipo aparece en los
tres. Si cambiás uno solo, el juego queda inconsistente según el mapa.

| tipo | líneas en `systems/spawn.js` |
|---|---|
| `birds` | 128 (costa) · 153 (tierra) · 164 (mar) |
| `helo` | 130 (costa) · 155 (tierra) · 166 (mar) |
| `jet` | 131 (costa) · 156 (tierra) · 167 (mar) |
| `balloon` | 129 y 133 · 154 y 158 · 165 y 169 *(sale dos veces por bloque: el sorteo propio y el fallback de cuando el bidón no aplica)* |
| `mast` | 163 (solo mar abierto) |

> **Sugerencia fuerte**: aprovechá para sacar los literales sueltos a una tabla de alturas por
> tipo (candidato natural: `data/tuning.js`, que es "las perillas"). Hoy cambiar la altura de un
> helicóptero son tres ediciones idénticas en tres lugares; después debería ser una. Eso vale
> más que el rebalanceo en sí, porque es lo que hace barato el próximo ajuste.

---

## Trampas reales de este repo (esto es lo que te va a hacer perder tiempo)

1. **La altura del spawn NO es la altura a la que te mata.** La colisión suma los semiejes de
   `core/hitbox.js`: los aéreos (`helo`, `jet`) tienen `hh: 1.6` y el avión `ph: 1.0`, así que la
   banda letal es la altura del bicho **±2.6**. Con los números pedidos:

   | | banda de spawn | banda REAL de contacto |
   |---|---|---|
   | pájaros | 5 – 10 | 2.4 – 12.6 *(daño, no muerte)* |
   | helicópteros | 10 – 15 | **7.4 – 17.6 letal** |
   | cazas | 15 – 25 | **12.4 – 27.6 letal** |

   Verificá contra las bandas reales, no contra los números del pedido.

2. **El corredor seguro queda MUY apretado y hay que mirarlo con el juego en la mano.** Bajo el
   nuevo techo de radar (20 m) las bandas letales cubren de 7.4 para arriba, y los pájaros llegan
   hasta 2.4. Puede ser exactamente lo que se busca (cada altura tiene su amenaza, que es el
   punto) o puede ser un embudo: son bichos sueltos en un carril, no una pared. **Medilo jugando
   y decilo en el reporte.** Si hay que aflojar, la perilla menos invasiva es la densidad
   (`cfg.obstacles` / `run.nextSpawn` en `spawn.js:180`), no las alturas recién acordadas.

3. **Los escalones del multiplicador no se mueven** (`core/util.js:18`: x10 ≤4.5 · x5 ≤9 · x2 ≤16
   · x1 arriba). Con el radar en 20 y los cazas en 15-25, la franja x1 pasa a ser tierra de nadie
   — que está bien (arriba no debe pagar), pero conviene saberlo antes de tunear.

4. **`MV_HI = 18` queda descolocado** (`data/moves.js:89`). Es el umbral que decide si `↑↓↓` hace
   SPLIT-S o TERRAIN MASKING, y está calibrado como "apenas arriba del último escalón del
   multiplicador" cuando el radar estaba en 30. Con el radar en 20, "ALTO" (18) queda **2 metros
   bajo el techo de radar y adentro de la banda de los cazas**. Decidí si se baja y **actualizá
   el comentario de `data/moves.js`**, que hoy explica la calibración vieja.

5. **Los globos no están en el pedido y hoy nacen de 6 a 30 m** — o sea que van a quedar
   atravesando el nuevo techo de radar. No los toques por tu cuenta, pero **decilo** en el
   reporte: es la altura que quedó sin criterio explícito.

6. **Sacar el palo del mástil sin tocar `core/hitbox.js` es un bug mudo.** El mástil es `isTall`
   (`hitbox.js:11`): su caja va **de la base a la punta** (`hh: o.h, oy: o.h/2`) y además tiene
   `hullReach = 5` por debajo de `HULL_Y = 3.6` (el casco barre ancho a ras del agua). Si borrás
   el dibujo y dejás la caja, hay una columna que mata y no se ve.

7. **`src/game.bundle.js` es generado** por esbuild (`npm run build:game`). **No lo edites a mano.**

---

## Decisiones ya tomadas (no las re-discutas)

- Radar a **20 m**. Pájaros **5-10**, helicópteros **10-15**, cazas **15-25**.
- Las fragatas **no llevan más el palo ni la verga**. Queda la **luz roja**, y queda en el techo
  de la fragata — no flotando donde estaba la punta del palo.
- El resto de los obstáculos de tierra (torres, árboles, postes, banderas, acantilados) **no se
  toca**: son estructuras apoyadas en el suelo y su altura es parte del terreno, no del cielo.

## Decisión abierta — tomá el default y dejalo anotado

**¿Qué pasa con la colisión del mástil ahora que no hay mástil?**

- **DEFAULT: la fragata pasa a ser un obstáculo BAJO.** Se saca `mast` de la lista `TALL` de
  `core/hitbox.js` y su caja pasa a ser la de la superestructura (altura del orden de 4-6, la que
  se corresponda con lo que dibuja la hoja horneada). Consecuencia honesta: **el mar abierto
  pierde su obstáculo vertical** y se vuelve un mapa de puro tráfico aéreo, mucho más fácil.
  Compensalo donde corresponda (densidad de aeronaves en el bloque de mar, `spawn.js:163-169`) y
  **decí en el reporte cuánto bajó la dificultad del mar**.
- Alternativa si el default deja el mar vacío: **la fragata conserva algo de altura** — el palo
  se va, pero la superestructura + antena queda en el orden de 6-8 m, con la luz roja arriba.
  Sigue siendo un obstáculo que se esquiva o se salta, sin el poste de 28 m.
- **Lo que NO es opción**: dejar la caja de 11-28 m con la fragata dibujada baja.

---

## Convenciones que hay que respetar

- **Comentarios en español, sin tildes**, como todo el código existente, y explicando **por qué**,
  no qué. Este repo comenta decisiones y trampas. Mirá `data/tuning.js` o `core/hitbox.js` para
  calibrar el tono. Cada altura nueva merece una línea de *por qué ese número*.
- **Nada de reasignar los stores** (`cfg`, `cam`, `plane`, `run`, `stats`): se **mutan**.
  Lo custodia `npm run lint:state` y falla el gate.
- **Una sola fuente por número.** `RADAR_ALT` ya es el ejemplo a seguir: vive en `data/tuning.js`
  y lo leen la detección, la RED del radar y el HUD. Las alturas de spawn deberían terminar igual.
- **`core/hitbox.js` es la única fuente de las cajas**: la usan la colisión Y el overlay de
  depuración. Si las duplicás, el overlay te va a mostrar una caja y el juego va a usar otra.

---

## Cómo trabajar

En fases, dejando el juego jugable al final de cada una.

- **Fase 0 — el radar.** Cambiar `RADAR_ALT` a 20 y verificar los tres consumidores: la barra
  carga al cruzar 20, la RED se dibuja a esa altura y la altura del HUD se pone roja ahí.
- **Fase 1 — las alturas del cielo.** Sacar los literales a una tabla, aplicar las tres bandas
  nuevas en los **tres** bloques de terreno.
- **Fase 2 — la fragata.** Dibujo (sacar palo y verga, poner la luz roja en el techo) **y** caja
  de colisión, juntos, en el mismo commit lógico. Nunca uno sin el otro.
- **Fase 3 — el reajuste.** `MV_HI`, densidad si hizo falta, y los comentarios que quedaron
  mintiendo (`data/moves.js:84-88` explica la calibración vieja).

---

## Verificación (no des nada por hecho sin esto)

1. **El gate completo tiene que quedar en verde:**

   ```bash
   npm run check
   ```

2. **Medí las bandas, no las mires.** El juego corre a 480×270 y dos metros no se distinguen a
   ojo. Sacá la cuenta de spawn ± semiejes y confirmá que las bandas reales son las de la trampa 1.

3. **Probalo en el juego de verdad** (`npm start`) en **los tres terrenos** (MAR / TIERRA / COSTA),
   que es donde el spawn está triplicado y donde un olvido se nota.

4. **Prendé `HITBOXES: SI` en el menú `[M]`** y mirá la fragata: la caja verde tiene que coincidir
   con lo que se dibuja. Es el chequeo que atrapa la columna invisible.

5. **Chequeos específicos que probablemente fallen la primera vez:**
   - la bandada tiene que seguir **dañando y no matando** después de bajarla;
   - los cazas a 15-25 tienen que seguir siendo esquivables: cierran más rápido que el resto
     (`collision.js:70` les suma +45 de velocidad de acercamiento) y encima corrigen hacia tu
     carril (`home` en `spawn.js:53`) — a esa altura y con el radar encima puede volverse injusto;
   - volar a 18 m no debería ser una sentencia (banda de helos hasta 17.6 + radar a 20);
   - en MAR ABIERTO, que todavía haya algo que esquivar después de bajar la fragata.

**Reportá lo que verificaste y lo que no.** Si algo queda a medias, decilo explícitamente en vez
de darlo por bueno. Y decí **cómo se siente** el corredor nuevo: es un cambio de dificultad, no
un refactor.

---

## Documentación

- `README.md`: la sección del loop menciona los multiplicadores por altura y el `[M]`. Si el
  corredor cambia de forma, tiene que decirlo.
- `docs/ROADMAP.md` **#27** (techo de radar variable) está escrito asumiendo 30 m — actualizá la
  referencia. Es literalmente el ítem que planea mover este número por tramo de misión.
- `docs/PENDIENTES_DE_REDISENO.md`: si el mástil tenía una entrada de arte, cerrala.
- Si creás una tabla de alturas nueva, sumala al árbol de `docs/ARQUITECTURA.md` y a la sección
  "Quiero cambiar X — ¿dónde voy?".
