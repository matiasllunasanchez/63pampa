# Prompt — mecánica de ESCUADRÓN (vidas) para RASANTE

> **✔ IMPLEMENTADO** (julio 2026). El estado real, las decisiones tomadas y lo que quedó para
> después están en [ROADMAP.md #29](ROADMAP.md); el mapa de módulos en
> [ARQUITECTURA.md](ARQUITECTURA.md) (`core/squad.js` + `systems/squad.js` + `render/squad.js`).
> Este archivo queda como la especificación original.

Implementá una mecánica de **escuadrón** en este proyecto (`63pampa`, juego arcade de vuelo
rasante, JS vanilla + canvas, empaquetado con Electron). El escuadrón son las **vidas** del
jugador, pero contadas como aviones de una formación real, no como un contador abstracto.

Antes de tocar código, leé `docs/ARQUITECTURA.md` (las cuatro convenciones y el árbol) y
`src/core/state.js`. Es un proyecto con convenciones fuertes y una red de tests que hay que
respetar.

---

## Lo que hay que construir

**El escuadrón:** cada partida se juega con un escuadrón de **1 a 8 aviones** (configurable).
El jugador es el **líder**. Cada avión del escuadrón es una vida.

Cuatro momentos, en orden:

### 1. Despegue en formación

Al despegar, los aviones del escuadrón despegan **detrás del jugador** y se ven en pantalla.
Se renderizan **únicamente durante la cuenta regresiva del despegue** — o sea el estado
`'takeoff'`, que dura 3 s y termina con el aviso CONTROL LIBRE.

### 2. Salida de plano al empezar el juego

Apenas termina la cuenta (`toT >= 3`, `game.js:687`), los aviones del escuadrón **se van detrás
de la cámara y salen del plano**, y la cámara **se acerca un poco** al avión del jugador. La
lectura buscada: *el escuadrón te sigue ahí atrás, aunque no lo veas*. Durante la partida
(`'play'`) **no se renderizan**.

### 3. Relevo al morir el líder

Cuando el líder muere, en vez de ir a la pantalla de derribado:

- Arranca una **cinemática de relevo**, del mismo tono y duración que la previa al CONTROL LIBRE.
- El jugador **pasa a comandar otro avión del escuadrón** y sigue la misma misión.
- Se descuenta una vida.
- **Cuando ya no queda nadie**, ahí sí corre el flujo de muerte actual (pantalla de derribado).

**La intención emocional es explícita y es el corazón de esta feature:** tiene que notarse que el
piloto nuevo **ve morir a su compañero en combate y continúa**. La cámara no debe cortar seco al
avión nuevo — el relevo tiene que pasar por los restos del líder. Si la implementación queda
correcta pero fría, no está terminada.

### 4. Ventana de seguridad de 2 segundos

Durante los **2 s** del cambio, el avión nuevo:

- es **indestructible** (para no morir de nuevo por lo mismo que mató al líder), y
- **esquiva de forma automática** — vuela solo, priorizando la cinemática por encima del control
  del jugador.

Al terminar los 2 s, se devuelve el control con un aviso claro.

**Las vidas se muestran en el HUD** (por ahora alcanza con eso: cuántos aviones quedan).

---

## Contexto real del código (verificado — usá estos puntos de entrada)

| qué | dónde |
|---|---|
| máquina de estados (`'takeoff' → 'play' → 'dead'`) | `src/core/state.js` (`S`, `setState`) |
| bloque completo del despegue + cuenta regresiva | `src/game.js:664-696` (`toT`, `toCount`, transición a `'play'` en :687) |
| muerte del jugador (explosión, chunks, estrellas, best) | `src/game.js:585` (`die(cause)`) |
| reset total de la corrida | `src/game.js:331` (`reset()`) |
| config del mapa (lo que edita el menú `[M]`) | `src/core/state.js` (`cfg`) |
| filas del menú `[M]` | `src/game.js:225-250` |
| estado de la corrida (nafta, puntaje, rachas) | `src/core/run.js` (`run`, `resetRun()`) |
| dibujo del avión del jugador | `src/render/plane.js:125` (`drawPlane`) — hoy lee `plane` y `PZ` fijos |
| HUD (barras, avisos, panel de estado) | `src/render/hud.js` |
| textos es/en | `src/data/strings.js` (se leen con `T('clave')`) |
| colisiones (devuelven `{ death }`) | `src/systems/collision.js` |
| vuelo: roce, combustible, radar | `src/systems/flight.js` |

**El modelo a copiar es `momentum`**: `src/systems/momentum.js` + `src/render/momentum.js`. Es un
modo con cinemática propia, su `update`/`draw`, y que **devuelve una señal** en vez de llamar al
flujo de misión. El relevo debería ser exactamente eso: `src/systems/squad.js` +
`src/render/squad.js`, más un estado nuevo en la máquina.

---

## Trampas reales de este repo (esto es lo que te va a hacer perder tiempo)

1. **El zoom de cámara está DESACTIVADO a propósito.** `camZ` / `CAM_ZOOMS` existen pero el
   acercamiento por ráster quedó apagado: escalaba el frame ya dibujado y **el mar se parte en
   rayas** (el agua se dibuja en filas de 1 px; al escalar, unas caen en 1 px y otras en 2). Está
   documentado en `game.js:353-366` con las mediciones. **No resuelvas "la cámara se acerca" con
   `camZ`.** Hacelo por otro lado — escala del sprite del avión (`sc` en `render/plane.js`) y/o
   `cam.y`/`cam.x` — y verificá que el mar no se raye.

2. **`reset()` borra TODO** (puntaje, stats, mundo, objetivo). Un relevo **no puede llamarlo**:
   la misión sigue siendo la misma. Necesitás un reset **parcial** (avión + amenazas inmediatas)
   que conserve puntaje, distancia, stats y progreso del objetivo.

3. **`die()` hace seis cosas mezcladas**: transición a `'dead'`, estrellas, récord, explosión,
   pedazos, sonido. Separá **el espectáculo del derribo** (que el relevo reusa tal cual: la bola
   de fuego, los `chunk`, la sacudida) del **fin de la partida** (que solo corre cuando se acabó
   el escuadrón).

4. **La invulnerabilidad tiene que cubrir TODAS las fuentes de muerte, no solo el choque.**
   Hoy matan: `systems/collision.js` (`{ death }`), el roce de superficie y el combustible en
   `systems/flight.js`, los misiles del radar, y el reataque del momentum (`death_fuel`,
   `death_aa`). Poné la ventana de gracia en **un solo lugar** que todas consulten, no repartida.

5. **Hay dos espacios de coordenadas.** El mundo se dibuja a 480×270 nativo; el HUD y las
   pantallas razonan en 320×180 y se escalan ×U. El indicador de vidas va en el espacio **HUD**
   (ver `render/hud.js` y el ítem #25 de `docs/ROADMAP.md`).

6. **`cfg.start === 'air'`** (misiones de regreso) **no pasa por `'takeoff'`**: entra directo a
   `'play'` (`game.js:194`). Ahí no hay escena de despegue del escuadrón — decidí qué se ve
   (probablemente nada, o un pase de formación corto) y dejalo andando sin romperse.

7. **`src/game.bundle.js` es generado** por esbuild (`npm run build:game`). **No lo edites a
   mano** — se regenera y perdés el cambio.

---

## Decisiones ya tomadas (no las re-discutas)

- Rango del escuadrón: **1 a 8**. Default sugerido: **4**. Se elige en el menú `[M]` como una fila
  más (`ESCUADRON`), junto a las que ya existen.
- El escuadrón solo se renderiza en el despegue y en la cinemática de relevo. **Nunca durante
  `'play'`** (es un costo de render que no aporta y taparía el juego).
- Al agotarse el escuadrón, el flujo actual de derribado queda **igual que hoy** (pantalla, hechos
  históricos, estrellas en POR LA PATRIA).
- La ventana de gracia es de **2 s**, con esquive automático, y durante esos 2 s **manda la
  cinemática, no el input** del jugador.

## Decisiones abiertas — tomá el default y dejalo anotado

- **Herencia de estado al relevar → el default es HEREDAR.** El compañero venía volando la misma
  ruta: llega con **el mismo combustible y la misma munición** que tenía el líder al morir. Si en
  cambio repone al 100%, **morir se convierte en la forma barata de repostar y recargar** — un
  exploit que rompe el combustible como reloj del run. Lo que sí se pierde: la racha rasante y el
  multiplicador (el avión nuevo entra frío).
- **El puntaje se conserva** (es la misma misión).
- **Identidad de cada avión:** dales un **indicativo** (ej. `GUARDIA 2`, `GUARDIA 3`). Sale casi
  gratis y es de donde viene la emoción: el HUD tacha al que cayó y la línea de radio del relevo
  lo nombra. Sin nombre, una vida menos es un número menos.
- **Sonido:** reusá lo que hay (`beep`, `sfxOne`, `boom`); no agregues assets nuevos.

---

## Convenciones que hay que respetar

- **Comentarios en español, sin tildes**, como todo el código existente. Y explicando **por qué**,
  no qué: el repo comenta decisiones y trampas, no líneas obvias. Mirá `systems/momentum.js` o
  `game.js:585` para calibrar el tono.
- **Nada de reasignar los stores** (`cfg`, `cam`, `plane`, `stats`): se **mutan**. `S.state` se
  escribe **solo** con `setState()`. Lo custodia `npm run lint:state` y falla el gate.
- **Los sistemas no llaman hacia arriba**: el módulo de relevo **devuelve una señal**
  (`'relevo'`, `{ death }`, …) y `game.js` decide. No invoques el flujo de muerte desde el sistema.
- **Estado compartido:** si lo escribe un solo sistema, se queda en ese sistema. Las vidas y el
  escuadrón, que los leen HUD + game + el sistema nuevo, van al store de la corrida
  (`src/core/run.js`) y su tamaño configurado a `cfg`.
- **Textos nuevos → `src/data/strings.js`, en español Y en inglés**, leídos con `T()`. No hardcodees
  strings en el render.

---

## Cómo trabajar

Hacelo **en fases, y dejá el juego jugable al final de cada una**. No arranques por la cinemática.

- **Fase 0 — el esqueleto funcional.** Opción `ESCUADRON` en `[M]`, contador de vidas en el HUD, y
  relevo **sin cinemática**: morís → se descuenta una vida → reaparecés volando con 2 s de
  invulnerabilidad → al llegar a cero corre el derribado de siempre. Esto ya es verificable de
  punta a punta.
- **Fase 1 — la formación de despegue.** Los N aviones detrás durante los 3 s, la salida de plano
  al CONTROL LIBRE y el acercamiento de cámara (ojo con la trampa 1).
- **Fase 2 — la cinemática del relevo.** El compañero cayendo, el esquive automático, la
  devolución del control. Acá es donde se gana o se pierde la emoción.
- **Fase 3 — pulido.** Indicativos, línea de radio, sonido, sacudida.

---

## Verificación (no des nada por hecho sin esto)

1. **El gate completo tiene que quedar en verde:**

   ```
   npm run check
   ```

   Corre sintaxis, `lint:state`, build, unit, feeltest, smoke de Electron y smoke de web.

2. **Tests unitarios** en `tools/unit.js` (node:test, sin dependencias) para la lógica pura:
   descuento de vidas, expiración de la ventana de 2 s, y el caso borde de **escuadrón = 1**
   (tiene que comportarse exactamente como el juego de hoy: morir es morir).

3. **Probalo en el juego de verdad**, no solo en tests: `npm start`. Verificá los cuatro momentos
   con escuadrón de 8 y de 1, con `ARRANQUE: PISTA` y con `ARRANQUE: EN VUELO`, y en un terreno
   con obstáculos (para provocar la muerte fácil y ver el relevo encadenado).

4. **Chequeos específicos que probablemente fallen la primera vez:**
   - morir **durante** los 2 s de gracia no debe pasar (probá muriendo contra un mástil);
   - morir **dos veces seguidas** rápido no debe descontar dos vidas de un golpe ni encimar dos
     cinemáticas;
   - morir en el **momentum** (reataque) también debe relevar;
   - el puntaje y el progreso del objetivo **no se resetean** al relevar;
   - el mar **no se raya** con el acercamiento de cámara.

**Reportá lo que verificaste y lo que no.** Si algo queda a medias, decilo explícitamente en vez de
darlo por bueno.

---

## Documentación

- Agregá la mecánica a `docs/ROADMAP.md` como ítem nuevo (**#29** — el último es #28), con el
  formato del archivo: prosa, bloque `>` con **Relacionado con →** y **Dónde tocar →**, y
  checkboxes marcando lo hecho y lo que queda. Actualizá también el índice "Por tema" de arriba.
- Si creás módulos nuevos, sumalos al árbol de `docs/ARQUITECTURA.md`.
- Actualizá `README.md` si cambia algo que el jugador ve (la opción del menú y las vidas lo son).
