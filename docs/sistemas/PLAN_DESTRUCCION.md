# PLAN — LA DESTRUCCIÓN: colisiones mutuas y explosiones con carácter

> **Estado: plan por etapas, sin implementar.** Pedido de Matías (16/8): explosiones más
> espectaculares, y que **lo que chocás se rompa** — hoy chocar contra un destructible te
> mata a vos y el objeto queda INTACTO mirando tus pedazos pasar.
>
> **El estado actual, medido en el código:**
> - Choque contra destructible (`collision.js` ~217): `return { death: ... }` y nada más —
>   el objeto no explota, no se rompe, no se entera.
> - Destrucción a tiros (`explodeAt`, `core/fx.js`): 12–24 chispas genéricas + UNA bola de
>   fuego igual para todo — carpa, helo, radar y depósito mueren idéntico y se desvanecen.
> - **El sistema bueno ya existe pero es exclusivo del jugador**: el derribo con inercia
>   (`'chunk'`) — pedazos que conservan velocidad, caen, REBOTAN y quedan humeando en el
>   suelo. Este plan lo generaliza: **el despiece es para todos.**
>
> Leer antes: `docs/ARQUITECTURA.md` (manda) · trampas del repo en `SPEC_AGUA_OLAS.md` §1.
> **No duplica**: el glow de las explosiones es VISUAL_UPGRADES E0.1 (lo multiplica) y los
> impactos por material sobre objetos VIVOS son PLAN_VISUAL_FASES T4 — este plan es la
> MUERTE de los objetos, no su castigo.

## 1. La regla de todo el plan

**Nada muere desvaneciéndose.** Todo destructible tiene una receta de muerte propia:
pedazos que heredan el impulso del que lo mató (la bala empuja, la bomba irradia, TU AVIÓN
arrastra), fuego según su naturaleza, y restos que QUEDAN — el pasillo detrás tuyo es la
historia de tu corrida. Sobriedad de siempre: escombros, fuego y humo; nada de confeti.

## 2. Etapas

| etapa | entrega | criterio de cierre |
|---|---|---|
| ~~**D0**~~ ✅ · El despiece generalizado | El pipeline de `'chunk'` del jugador se vuelve **de todos**: `despiece(o, impulso)` — cada tipo de obstáculo declara su receta de pedazos EN DATA (`data/despiece.js`: cuántos, tamaños, colores de su paleta, y sus piezas especiales — el rotor del helo, el plato del radar, el tanque del depósito). Los pedazos heredan el impulso del asesino (dirección de bala / velocidad del avión / radial de bomba), rebotan y quedan humeando como los del derribo. Perillas + **cap global de chunks vivos** (perf: los más viejos se disuelven antes) | **hecho 16/8/2026**: `npm run romper` verde — 6 firmas de muerte distintas, escombro que dura y toca el suelo, cap 60/60. `check` verde, `feel` idéntico |
| ~~**D1**~~ ✅ · La destrucción MUTUA *(el pedido central)* | Chocar contra un destructible: el objeto **también** explota y se despieza — con TU velocidad como impulso (los pedazos salen disparados hacia adelante, mezclados con los tuyos: los dos destrozos comparten la escena). La letalidad NO cambia: chocar te mata igual que hoy (la variante "embestir algo blando cuesta avería en vez de muerte" queda ANOTADA como decisión de gameplay aparte, apagada) | **hecho 16/8/2026**: los tres choques dejan escombro del objeto; en los letales conviven con el del avión. La letalidad de los tres quedó igual (verificado). `feel` idéntico |
| ~~**D2**~~ ✅ · Explosiones con CARÁCTER | La receta de muerte por naturaleza: **depósito/combustible** = bola grande + explosiones secundarias retardadas (pop-pop-pop) + escombros ardiendo + columna de humo que PERSISTE · **AA/vehículos** = chispazo metálico + casco que vuelca · **carpa** = jirones y polvo, SIN bola de fuego · **helo** = el rotor sale volando solo girando + caída en espiral con humo + boom al tocar el suelo (la muerte en dos actos) · **jet** = airboom + resto que cae · **globo** = reventón y desinflado. Todo en la receta de data de D0 | **hecho 16/8/2026**: seis capturas (`d2_*.png`) y seis firmas de muerte medidas — la carpa sin bola, el depósito con 5 secundarias y columna de 6 s, el helo en dos actos. `check` verde, `feel` idéntico |
| **D3 · La onda y el golpe** | Para explosiones grandes: anillo de onda expansiva + flash de 1 frame + anillo de polvo (tierra) o corona de agua (mar) + shake escalado por cercanía + los escombros cercanos EMPUJADOS por la onda. Se monta sobre el glow de E0.1 si ya está (y si no, funciona igual) | la explosión de un depósito al lado tuyo se SIENTE distinta a una a 300 m |
| **D4 · El encadenamiento** | Una explosión grande daña lo que tiene a `CHAIN_R` metros: el depósito enciende las carpas vecinas, la AA detona su munición (secundarias). Cap de profundidad de cadena (2 saltos). Las cadenas puntúan con la racha existente — volar UN tiro que tira tres cosas es la jugada de estilo | fixture: depósito entre dos carpas → cadena de 3, con retardos legibles; nunca cascadas infinitas |
| **D5 · Perf + gate** | Presupuesto: cap de chunks/partículas con poda de los más viejos, cero allocations por frame nuevas, medición en la misión más densa (m9). Fixture `npm run romper` completo + capturas por tipo + `npm run check` con web | 60 fps sostenidos en m9 con 3 muertes encadenadas en pantalla |

## 3. Perillas *(en `data/despiece.js`, defaults elegidos)*

`CHUNKS_MAX 60` (global vivos) · `CHUNK_LIFE 4 s` humeando · pedazos por tipo 4–9 ·
`CHAIN_R 22` m · `CHAIN_DEPTH 2` · `CHAIN_DELAY 0.25–0.6 s` (el retardo ES la lectura) ·
secundarias del depósito 3–5 en 1.5 s.

## 4. Qué NO hacer

1. **No tocar la letalidad de nada** — D1 es visual; la variante de embestida con avería
   es decisión aparte y nace apagada.
2. **No una receta genérica con otro color**: si dos tipos mueren igual, D2 falló.
3. **No física real de rígidos** — los chunks del derribo ya tienen la física justa
   (inercia + rebote + reposo); se reusa, no se reinventa.
4. **No romper el presupuesto**: el cap manda; espectáculo que baja de 60 fps no shippea.
5. Sobriedad militar (regla de siempre): escombros, fuego, humo. Nada de festival.
6. `explodeAt` no se rompe: los llamadores actuales siguen andando mientras se migra tipo
   por tipo (la receta default = el comportamiento de hoy).

## 5. Relación con los otros planes

- **E0.1 (glow)** multiplica todo esto gratis — conviene T1 antes, no es prerequisito.
- **T4 (armas)** = el impacto sobre lo VIVO; este plan = la muerte. Frontera limpia.
- **PASADA R5** (fogonazos/punch del buque) y **T7** (buque 3D con piezas que se
  ennegrecen) son la versión del BUQUE de esta misma filosofía — comparten regla, no código.
- Archivos calientes: `collision.js` (D1), `core/fx.js` (D0/D2/D3), `spawn.js` apenas.
  Si corre junto al rescate de la PASADA no se pisan; con T4/T5 del plan visual, serial.

## 6. Divergencias

**Baseline de `npm run feel` (antes de D0):** 33 asserts, `FEEL: OK`. Verificado **idéntico**
(diff vacío contra el archivo guardado) al cerrar D0, D1 y D2 — como debe ser: este
plan es 100% presentación.

### D0 — el despiece generalizado

1. **La física del pedazo se mudó a `core/fx.js` (`stepChunk`)**, no se duplicó. Vivía dentro del
   bloque de estado `'dead'` de `game.js`, donde solo podía correr para los restos del jugador;
   ahora la llaman los dos lados — el mundo en vuelo (`collision.js`) y el mundo detenido
   (`game.js`) — porque desde D0 hay escombro AJENO cayendo mientras se juega. El código es el
   mismo, movido: sin esto, todo lo que se despezara durante el pasillo quedaba congelado.
2. **`vz` es velocidad RELATIVA al mundo.** En vuelo el pedazo retrocede con el scroll
   (`o.z -= run.spd·dt`, el mismo que mueve todo) y encima lleva su inercia. No es un tercer
   sistema de movimiento: es el de siempre más un empujón.
3. **El derribo del jugador se MIGRÓ** a `despiece()` con la receta `plane` — que es ese mismo
   destrozo escrito como fila de data. Era la única muerte decente del juego y ahora es la
   referencia de la que salen las demás; dejarlo aparte habría sido tener dos verdades.
4. **El cap es DURO y se cobra al crear, no en el `prune` del cuadro.** El primer intento
   envejecía a los más viejos para que el filtro los barriera, y no alcanzó: entre dos muertes
   casi simultáneas no siempre hay un cuadro en el medio (medido: **147** pedazos vivos con tope
   60, y **78** tras un segundo intento). Ahora se los saca de la lista ahí mismo y el tope se
   cumple exacto (medido: 60/60 tras 14 despieces seguidos). El desvanecido de medio segundo del
   render sigue siendo lo que se ve en el caso normal, que es cuando el pedazo muere de viejo.
5. **El pedazo trae su color** (`o.c`/`o.c2`): el dibujo de `'chunk'` tenía la chapa del avión
   hardcodeada. Los valores viejos quedan de respaldo para cualquier chunk que nazca sin receta.
6. **`__romper` cuenta solo `'chunk'`**: `explodeAt` empuja además una bola de fuego (`airboom`)
   al mismo array, y contarla arruinaba las tres medidas de la sonda (número, tamaños y colores)
   con un objeto que no es escombro. Lo detectó el propio fixture — reportaba 10 pedazos donde la
   receta dice 9, y un color de más que era `undefined`.

### D1 — la destrucción mutua

7. **También se despiezan las dos muertes NO letales**: la carpa que atravesás y el nido chico que
   pisás. El plan hablaba del choque letal, pero "pasarle por encima a un nido y verlo seguir ahí"
   es exactamente la mitad del problema que D1 viene a resolver. La letalidad de ninguna de las
   tres cambió — la carpa se sigue atravesando, el depósito sigue derribando (§4.1, verificado en
   el fixture como criterio propio).
8. **El acantilado queda afuera.** Es terreno, no un objeto: reventarlo sería mentir sobre de qué
   está hecho el mundo. Es el único destructible que no despieza.
9. **`__chocar` estira el objeto hasta tu altura** en vez de bajar el avión al blanco. Bajarlo
   lo mataba contra el suelo ANTES de llegar, y el choque que se quería medir no ocurría. Además
   el `h` por defecto (7) está por encima de `SOFT_H` (4.8), que es el umbral que separa lo que
   derriba de lo que solo golpea.
10. **La ventana de medición del choque es corta y fija (450 ms)**, no "esperar a que muera": el
    objeto está a 8 m y cierra en centésimas, y seguir volando termina chocando algo REAL del
    pasillo — esa muerte ajena se leía como si la carpa hubiera empezado a matar.
11. **Fixture propio: `npm run romper`** (`tools/fixture_romper.js`), con sondas `__romper(tipo)`,
    `__chocar(tipo)` y `__chdbg()` (censo del escombro), todas marcadas QUITAR. Lo que mide es lo
    que los criterios de cierre piden con números: seis firmas de muerte distintas, el escombro
    que dura y toca el suelo, el cap que aguanta, y los dos despieces conviviendo tras el choque.

### D2 — explosiones con carácter

12. **Un solo punto de entrada: `morir(o, imp)`.** El plan describía efectos por tipo; lo que hacía
    falta primero era que hubiera **un lugar** donde se decide cómo muere algo. Quien mata ahora
    llama a `morir()` y no arma la escena a mano — que es exactamente cómo se llegó a que carpa,
    helo, radar y depósito murieran idéntico. `explodeAt` sigue intacto y sigue siendo válido para
    todo lo que no es la muerte de un objeto con receta (la bomba, el misil enemigo) — §4.6.
13. **Migraron los CUATRO sitios de muerte, no solo el choque**: el choque letal, la carpa, el nido
    chico, el cañón y el misil del jugador. Un depósito derribado a tiros y otro embestido tienen
    que morir igual de bien; si no, el carácter dependería del arma.
14. **La ausencia de bola de fuego es parte de la receta**, no un olvido: `bola: null` en la carpa,
    el globo, el árbol y la bandera. Una lona que revienta en llamas miente sobre de qué está
    hecha, y esa mentira era justo lo que hacía que todo se pareciera.
15. **Las secundarias y la columna de humo son OBSTÁCULOS** (`'sec'`, `'humo'`), no un sistema de
    temporizadores aparte. Así viajan con el mundo y se podan con todo lo demás: una explosión
    retardada que se queda clavada en la pantalla mientras el avión sigue sería peor que no tenerla.
16. **La muerte en dos actos del helo se resuelve con una bandera en un pedazo**, no con un objeto
    nuevo: el último chunk cae en espiral humeando y revienta al tocar el suelo. Sigue siendo el
    mismo pipeline de D0 (§4.3: no se reinventa la física).
17. **Tope de tamaño de dibujo del escombro (26 px).** Un pedazo a cinco metros de la cámara se
    proyecta gigante y tapa la pantalla entera por un cuadro — y pasa seguido, porque le volás por
    adentro al destrozo que acabás de hacer. Además se desvanece por debajo de ~14 m: te pasó por
    el ala, no es algo que estés mirando. Se vio en la primera tanda de capturas.
18. **`__romper` planta el objeto a TU altura** y llama a `morir()` (no a `despiece()` a secas):
    a ras el destrozo quedaba fuera de cuadro apenas el avión subía, y sin la muerte completa la
    sonda no podía comparar el carácter — solo el escombro. La sonda además informa lo que
    realmente se creó (bola, secundarias, humo, espiral), no lo que la receta prometía: así no
    puede confirmar una intención que el código no cumplió.
