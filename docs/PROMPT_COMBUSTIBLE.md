# Prompt — mecánica de RUTA ÓPTIMA de combustible para RASANTE

Implementá la mecánica de **ruta óptima de combustible** en este proyecto (`63pampa`, juego arcade
de vuelo rasante, JS vanilla + canvas, empaquetado con Electron). Está anotada como el ítem **#28
de `docs/ROADMAP.md`** — leelo antes de empezar, junto con `docs/ARQUITECTURA.md` (las cuatro
convenciones y el árbol). Es un proyecto con convenciones fuertes y una red de tests que hay que
respetar.

---

## Lo que hay que construir

Los lugares donde hoy aparecen los **bidones de combustible** dejan de ser objetos que se agarran y
pasan a ser los **puntos óptimos de paso**: el trazado que el avión *debería* seguir para volar
eficiente.

- **Pasar por el punto** = volar como corresponde: no perdés nada.
- **No pasar** = **desperdiciás combustible**, y se avisa en el momento, no al final.
- **Camino ideal:** hacer el recorrido completo pasando por **todos** los puntos y llegar al final
  del nivel con el **tanque al máximo** para enfrentar el enfrentamiento final.
- **Camino desperdiciado:** cada punto que fallás te deja con menos nafta para esa pelea.

**De dónde sale:** los aviones argentinos llegaban al objetivo con lo justo para pelear unos diez
minutos y volverse. El combustible no era algo que se juntaba en el camino: era **el resultado de
haber volado bien todo el camino anterior**. Esta mecánica convierte esa frase en la regla del
nivel.

---

## El dato que hace que esto encastre (leelo antes de diseñar nada)

**El enfrentamiento final ya existe y ya se paga con combustible.** Es el **MOMENTUM**: el clímax
en primera persona sobre el buque (`src/systems/momentum.js`). Cada pasada de ataque **cuesta
`REATTACK_FUEL = 12`**, hay un máximo de `REATTACK_MAX = 6` pasadas, y quedarte sin nafta ahí
arriba te mata con la causa `death_fuel` — *"Te quedaste sin combustible sobre el blanco"*
(`momentum.js:186-191`, constantes en `data/tuning.js:144`).

O sea: **el combustible con el que llegás YA ES cuántas pasadas de ataque tenés.** Esta mecánica no
inventa un consumidor nuevo — le da sentido al que ya está.

**Rumbo del proyecto que tenés que respetar:** ese clímax va a **extraerse a su propio estado /
minijuego** al final del nivel, reusando el momentum actual. **No lo construyas en este trabajo** —
pero dejá la costura limpia: tiene que haber **un solo lugar** que responda *"con cuánto combustible
se llega al blanco"*, y el consumo del clímax tiene que seguir siendo el único que lo gasta. Si esa
frontera queda difusa, el día que se mueva el clímax se rompe esto.

---

## Contexto real del código (verificado — usá estos puntos de entrada)

| qué | dónde |
|---|---|
| **drenaje** del tanque: `3.2/s`, `+4.2` con turbo | `src/systems/flight.js:140` |
| quedarse en cero (el avión deja de sostenerse) | `src/systems/flight.js:141` |
| **spawn** del bidón: cada 700 de distancia, carril y altura **sorteados** | `src/systems/spawn.js:96-97` (+ ramas en :132, :157, :168) |
| altura de nacimiento del bidón: `SPAWN_Y.fuel = [4, 26]` | `src/data/tuning.js:47-53` |
| **pickup**: `+30` con techo 100, caja de contacto `dx<1.5 dy<1.5` | `src/systems/collision.js:153-158` |
| dibujo del bidón (tambor con aros y halo pulsante) | `src/render/world.js:1040` |
| barra COMB del HUD | `src/render/hud.js:296` |
| combustible como reloj de la corrida + `run.fuelDist` | `src/core/run.js:22-25` |
| **el clímax y su costo en nafta** | `src/systems/momentum.js:186-191`, `data/tuning.js:144-145` |
| entrada al clímax (distancia al objetivo) | `momentum.readyToEnter()`, `game.js:207` (`objectiveDist`) |
| opción `COMBUSTIBLE: SI/NO` del menú `[M]` | `src/game.js:235` (`cfg.fuelOn`) |
| misiones (objetivo y distancia por nivel) | `src/data/missions.js` |
| textos es/en | `src/data/strings.js` (se leen con `T()`; ya existe `pickFuel`) |

---

## El modelo que resuelve "llegar al máximo" (default — implementá este)

Es la decisión central, y la más fácil de errar. Si el tanque solo drena, llegar "al máximo" es
imposible; si el punto simplemente recarga `+30` como hoy, llegar al máximo no significa nada.

**Modelo: el punto óptimo devuelve exactamente lo que costó el tramo anterior.**

- Pasar bien por un punto → el tramo sale **neutro**: el tanque vuelve a donde estaba.
- Fallar un punto → te quedás con **la pérdida de ese tramo**. Eso es "el desperdicio", y es
  proporcional a lo que ese tramo costó: no es un castigo inventado, es la nafta que gastaste sin
  haberla volado bien.
- Pasar por **todos** → llegás al clímax con **el tanque al máximo**. La frase del diseño se cumple
  literalmente, sin tunear nada a ojo.

**Excepción importante: el turbo no se devuelve.** El extra de `+4.2/s` es una decisión tuya, no
parte del tramo. Así el turbo pasa a ser **un préstamo contra la pelea final**: duplica puntaje
ahora, llegás con menos después. Es un dilema bueno y sale gratis con este modelo.

Consecuencia que hay que abrazar: **la barra COMB deja de decir "cuánto me queda" y pasa a decir
"qué tan bien volé"**. Es el objetivo, no un efecto colateral.

---

## Trampas reales de este repo (esto es lo que te va a hacer perder tiempo)

1. **Hoy la posición del bidón es SORTEADA.** `lane` aleatorio y altura entre 4 y 26. **Una ruta no
   se sortea: se compone.** Si los puntos siguen apareciendo al azar no hay línea que aprender y
   toda la mecánica se cae. Los puntos tienen que ser un dato de la misión (o generarse con una
   forma legible: subidas, bajadas, encadenados), no un `Math.random()` por spawn.

2. **La altura 4-26 cruza el techo de radar.** `RADAR_ALT = 20` (`data/tuning.js:23`): un punto
   sembrado a 24 te obliga a **pintarte en el radar** para tomarlo. Eso puede ser un dilema
   buenísimo o un castigo incomprensible — pero tiene que ser **una decisión, no un sorteo**.
   Mismo eje pelean tres cosas: la racha rasante premia abajo, el radar castiga arriba, y ahora la
   ruta manda a una altura fija. Coordinalo.

3. **La caja de contacto es diminuta** (`dx<1.5 dy<1.5`) y el dibujo es un tambor de ~2.6×3.4 px
   con halo. Como *pickup* funciona; como **puerta que hay que ver venir y encarar con tiempo**, no.
   Tiene que leerse desde lejos y permitir acomodar la trayectoria.

4. **`cfg.fuelOn = false`** (menú `[M]` → `COMBUSTIBLE: NO`) apaga hoy todo el sistema, incluido el
   spawn de bidones. Si la ruta pasa a ser **la estructura del nivel**, apagar el combustible no
   puede hacer desaparecer los puntos: quedan como guía, sin castigo.

5. **No toques `src/game.bundle.js`** — lo genera esbuild (`npm run build:game`) y tu cambio se
   pierde.

6. **El feedback tiene que ser inmediato o la mecánica no existe.** Si el jugador se entera del
   desperdicio recién en el clímax, no puede corregir ni aprender la ruta. Hace falta el aviso en
   el momento de fallar **y** una referencia permanente de cuánto llevás perdido.

---

## Decisiones ya tomadas (no las re-discutas)

- Los bidones **dejan de ser pickups**: son puntos de paso. El modelo es el de arriba (devolver el
  tramo).
- **Aviso inmediato al fallar**: cartel en pantalla (texto nuevo, tipo `COMBUSTIBLE DESPERDICIADO`)
  **más** una **marca fantasma en la barra COMB** que muestre dónde estaría el tanque si no
  hubieras fallado ninguno. Sin esa marca, el jugador no tiene con qué comparar.
- **El clímax no se toca en este trabajo.** Solo se garantiza la costura descrita arriba.
- Sonido: reusá lo que hay (`beep`, `sfxOne`, `boom`), sin assets nuevos.

## Decisiones abiertas — tomá el default y dejalo anotado

- **Grados en vez de binario (default: sí).** Pasar por el centro devuelve el 100% del tramo; rozar
  el borde, ~60%. Premia precisión y evita el "acertaste / no acertaste" seco.
- **Punto óptimo fallado ≠ punto no alcanzable.** Si un punto quedó imposible (te lo tapó un
  obstáculo, venías obligado por el radar), sigue contando como fallado. No inventes perdón
  automático: la ruta tiene que ser justa **por composición**, no por excepciones.
- **Recuento final:** `stats.fuelPicks` ya existe (`core/state.js:90`) y hoy cuenta bidones. Pasalo a
  contar **puntos de ruta acertados sobre el total** y mostralo en el recuento
  (`render/screens.js`, `drawResults`) como algo tipo `RUTA: 7/9`. Es la nota de la corrida.
- **Alcance:** aplicá la mecánica a los tres modos (campaña, ciclo, POR LA PATRIA). En POR LA PATRIA
  no hay objetivo final, así que ahí la ruta es pura supervivencia — verificá que no quede rota.

---

## Convenciones que hay que respetar

- **Comentarios en español, sin tildes**, como todo el código existente, y explicando **por qué**,
  no qué. Calibrá el tono mirando `systems/momentum.js` o el encabezado de `data/tuning.js`.
- **Los números de balance van a `src/data/tuning.js`**, con un comentario que diga qué significan
  y qué pasa si los movés. Nada de literales sueltos en la lógica: es la convención del repo.
- **Nada de reasignar los stores** (`cfg`, `cam`, `plane`, `stats`): se **mutan**. `S.state` se
  escribe solo con `setState()`. Lo custodia `npm run lint:state` y frena el gate.
- **Los sistemas no llaman hacia arriba**: si algo termina la corrida, se **devuelve una señal** y
  `game.js` decide.
- **Estado compartido:** si lo escribe un solo sistema, se queda en ese sistema (ver el encabezado
  de `core/state.js`). El estado de la ruta lo leen spawn, colisión, HUD y el recuento → va al
  store de la corrida (`core/run.js`), no a una variable suelta de un módulo.
- **Textos nuevos → `src/data/strings.js`, en español Y en inglés**, leídos con `T()`.

---

## Cómo trabajar

En **fases**, dejando el juego jugable al final de cada una. No arranques por el arte.

- **Fase 0 — la matemática, sin arte.** Reusá el tambor tal cual está. Implementá el modelo de
  devolución del tramo, el desperdicio al fallar y la composición de la ruta (que deje de sortearse).
  Al terminar esta fase ya tenés que poder **medir** que la línea perfecta llega al 100%.
- **Fase 1 — que se lea.** La puerta visible desde lejos, el aviso de desperdicio y la marca
  fantasma en la barra COMB.
- **Fase 2 — cuadrar por misión.** Que la ruta y la distancia de cada misión (`data/missions.js`)
  den un número de puntos coherente, y que el máximo sea alcanzable pero exigente.
- **Fase 3 — cierre.** `RUTA: n/m` en el recuento y verificación de la costura con el clímax.

---

## Verificación (no des nada por hecho sin esto)

1. **El gate completo en verde:**

   ```
   npm run check
   ```

   Corre sintaxis, `lint:state`, build, unit, feeltest, smoke de Electron y smoke de web.

2. **`tools/feeltest.js` es la herramienta correcta para esto** y ya existe: simula la matemática
   real del vuelo fuera del navegador, importando las fórmulas de verdad (no copias). Sumale un
   reporte que imprima **con cuánto combustible se llega al blanco** acertando el **0%, 50% y 100%**
   de los puntos, en una misión típica. Ese es el número que prueba que la mecánica funciona; sin
   él estás tuneando a ojo.

3. **Tests unitarios** en `tools/unit.js` (node:test, sin dependencias) para la lógica pura:
   - pasar por el punto devuelve **exactamente** lo que costó el tramo (neutro);
   - fallarlo cuesta exactamente ese tramo, ni más ni menos;
   - **el turbo no se devuelve**;
   - el techo de 100 no se puede superar acumulando.

4. **Probalo en el juego:** `npm start`. Con terreno mar y una misión de barco, verificá que
   **acertando todo se entra al clímax con el tanque lleno** (y te alcanza para varias pasadas), y
   que **fallando la mayoría llegás corto** — con `death_fuel` como final posible si insistís.

5. **Chequeos que probablemente fallen la primera vez:**
   - `COMBUSTIBLE: NO` en el menú `[M]` no debe romper ni hacer desaparecer la ruta;
   - POR LA PATRIA (sin objetivo final) no debe quedar sin sentido ni tirar error;
   - un punto sembrado por encima de `RADAR_ALT` no debe ser una trampa muda;
   - el recuento final no debe mostrar `RUTA: 0/0`.

**Reportá lo que verificaste y lo que no.** Si algo queda a medias, decilo explícitamente.

---

## Documentación

- **Actualizá el ítem #28 de `docs/ROADMAP.md`** (ya existe, con el diseño completo y sus
  checkboxes): marcá lo hecho y explicá **cómo quedó**, que es la convención del archivo — no
  alcanza con tildar. **No crees un ítem nuevo.**
- Si los números de balance quedan en `data/tuning.js`, documentalos ahí con el mismo criterio que
  las constantes vecinas.
- Actualizá `README.md` si cambia algo que el jugador ve (y cambia: el bidón deja de ser un bidón).
