# Prompt — MOMENTUM 3D: el asalto al buque pasa de galería de tiro a combate volado

> **✖ RECHAZADO TRAS PROBARLO** (26/7/2026). Se implementó, se jugó, y el veredicto del autor fue
> "está horrible: al mover se mueve el mapa y no el avión". Y es correcto: para no romper el
> entorno 3D existente (cielo plano, mar en frustum) resolví la órbita **rotando el buque** con la
> cámara clavada mirando a `-z` — o sea, el avión sigue sin volar. El rediseño, con el mundo 3D de
> verdad y vuelo libre en los tres ejes, está en
> **[PROMPT_ARENA_VUELO_LIBRE.md](PROMPT_ARENA_VUELO_LIBRE.md)**.
> Lo que sobrevive de este trabajo: las zonas etiquetadas en el modelo, el raycast, el chamuscado,
> la integración con el escuadrón y el overlay 2D. Lo que se tira: la cámara orbital falsa.
>
> **✔ IMPLEMENTADO** (26/7/2026) — primera versión jugable completa. `systems/arena.js` +
> `render/arena.js`; `three-world.js` ganó cámara orbital (el BUQUE rota — ver la nota adentro),
> proyección y raycast; entrada en `flight.js` (100%, una sola vez, solo con 3D); el momentum
> clásico quedó intacto como fallback web/`?no3d`. Decisiones 1–5 aplicadas tal como están abajo.
> Gate completo en verde (incl. build web 16.0 MB y ambos smokes) y verificado jugando en Electron
> con screenshots (cockpit, órbita, zonas, flak, 3ª persona, chamuscado por zona).
> **De paso se arregló un bug latente**: `mom3DInit()` llamaba `m3Palette()` sin argumento y el
> catch silencioso marcaba `MOM3D.failed` en CADA arranque (el render de calentamiento nunca
> corrió; el 3D solo funcionaba porque `ready` se seteaba antes del throw).
> **Pendiente de tuning** (jugar y ajustar): sensación de la órbita, cadencia/castigo del flak,
> HP de zonas con todas vivas a la vez, empalme visual aproximación→arena, y el modelo 3D por
> clase con piezas nombradas (decisión 5 — hoy sigue el buque de cajas).

Convertí el **clímax del nivel** de `63pampa` (juego arcade de vuelo rasante sobre Malvinas 1982,
JS vanilla + canvas + three.js, Electron) en un **minijuego distinto**: en vez de un avión clavado
en el aire apuntando con la trompa, el jugador **vuela de verdad** en un espacio reducido alrededor
del buque, destruye sus **puntos estratégicos** y **esquiva el fuego antiaéreo**, que ahora sí
puede matarlo. Jugable en **primera o tercera persona**, conmutable.

Antes de tocar código leé `docs/ARQUITECTURA.md` (las cuatro convenciones), `src/systems/momentum.js`
completo y `src/systems/three-world.js`. Es un proyecto con convenciones fuertes, una red de tests
que hay que respetar, y este es **el sistema más entrelazado del juego**: toca estado, render 2D,
render 3D, audio, HUD, misiones y puntaje.

---

## Lo que hay hoy (y por qué se cambia)

El MOMENTUM actual es un **bullet-time de galería de tiro**:

- El mundo corre al **30%** (`run.t -= dt*0.70`) y el avión **no se mueve**: solo avanza al 50% de
  su velocidad para que el mar siga fluyendo (`MOM_ADVANCE`).
- **Apuntar es girar la trompa**: la mira está clavada al visor y las flechas panean el MUNDO
  (`mom.cx/cy` + `momCam()`), o el mouse la mueve libre sobre el vidrio.
- El buque está **anclado** (sin balanceo) y crece 0.82× → 1.06× por pasada.
- Hay **3 pasadas** con ventana de tiempo (`at` 0.78 / 0.90 / 1.00, `time` 4.5–5.5 s) y zonas con
  HP definidas como **rectángulos en pantalla** (`u/v/w/h` sobre el rect del barco).
- **El buque no puede matarte.** Sus trazadoras, el flak y el rocío son **FX decorativos**
  (`mom.fx`, comentado explícitamente: *"son visuales, no danian"*). La única forma de perder es
  quedarte sin combustible o sin intentos de re-ataque (`REATTACK_MAX = 6`).

Es ceremonioso y se ve bien, pero **no es una pelea**: no hay nada que esquivar y el avión no vuela.

## Lo que hay que construir

Un **arena de combate acotada** sobre el buque:

1. **El avión vuela.** Movimiento libre en un volumen limitado alrededor del blanco (lateral,
   vertical y una banda de acercamiento/alejamiento), con la misma física de sensación que el vuelo
   normal — gas, inercia, alabeo — pero en un espacio cerrado del que no se sale.
2. **Los puntos estratégicos viven en el barco 3D**, no en un rectángulo de pantalla: el AA de proa
   está **en la proa**, el radar **arriba del mástil**, los motores **al ras del agua**. Se llega a
   cada uno **volando al ángulo correcto**, y algunos solo se pueden batir desde cierto lado.
3. **El buque dispara de verdad y mata.** Flak con predicción, trazadoras que vienen hacia la
   cámara, y **cada torreta viva suma presión**: destruir el AA de proa **baja el volumen de fuego**.
   Eso convierte el orden de las zonas en una decisión, no en un guion.
4. **Dos cámaras conmutables en vivo**: **cockpit** (el asset ya existe) y **tercera persona**
   (el sprite del avión ya existe, 9×3 + la hoja 2 de cabeceos empinados).
5. **Sin bullet-time permanente.** La cámara lenta queda como **acento** (entrada al combate,
   destrucción de una zona, remate final), no como estado.

El resto del run (vuelo, aproximación, misiones, puntaje, estrellas) **no se toca**.

---

## Contexto real del código (verificado — usá estos puntos de entrada)

| qué | dónde |
|---|---|
| **el subsistema completo** (estado, entrada, update, salida) | `src/systems/momentum.js` — `enterMomentum`, `updateMomentum`, `startReattack`, `momShipGeom`, `momCam`, `momScrToWorld`, `momZoneRect` |
| **el render 2D del clímax** (barco por rects, zonas, cabina, letterbox, FX) | `src/render/momentum.js` — `drawMomentum`, `drawCockpit`, `drawBargeHull` |
| **el mundo 3D** (cielo + mar + buque de cajas, three.js) | `src/systems/three-world.js` — `frame(w)` recibe un **snapshot de solo lectura**; `isOn()`, `view()`, `M3W/M3H` |
| **layout de zonas por clase de buque** (DATA) | `src/data/ships.js` — `MOM_LAYOUTS` (`t42`/`t21`/`log`) + `SHIP_CLASS` (6 buques) |
| **perillas compartidas** | `src/data/tuning.js` — `MOM_AX/MOM_AY`, `MSL_MAX`, `SHIP_UH`, `SHIP_DECK`, `REATTACK_DUR/FUEL/MAX` |
| **orquestación** (entrada al estado, draw, señal de salida) | `src/game.js` — rama `S.state === 'momentum'` en update y en draw (translate + roll + blit del 3D) |
| **cámara de vuelo ya conmutable** | `src/game.js` — `camMode` / `CAM_ZOOMS` (tecla de cámara): el precedente para el toggle 1ª/3ª |
| **sprite del avión en 3ª persona** | `src/render/plane.js` — `drawPlane`, hojas `sheet`/`sheet2` (`data/planes.js`) |
| **audio del clímax** | `src/systems/audio.js` — `engineRumble`, `duck`, `boom`, `sfxOne('momGun')` |
| **inventario de arte y specs** | `docs/PENDIENTES_DE_REDISENO.md` §8 (los 3 layouts y sus zonas) |

**El buque 3D ya existe y está calibrado.** `three-world.js` renderiza el buque de cajas con la
cámara alineada al `proj()` del 2D: foco 90 px, punto principal en `(W/2, HOR)` vía `setViewOffset`,
eslora fija `M3_LEN = 45` y **distancia variable** `D = M3_LEN*F/len_px` para que calce exacto con
`momShipGeom()`. Ese trabajo **no se tira**: es la base sobre la que se mueve la cámara.

---

## Trampas reales de este repo (esto es lo que te va a hacer perder tiempo)

1. **La equivalencia 2D↔3D está calibrada para una cámara QUIETA.** Hoy el 3D se blitea *dentro
   del mismo transform del canvas* que rota el mundo 2D, y por eso las zonas, la mira y la cabina
   quedan alineadas **por construcción**. Si la cámara se mueve de verdad, esa alineación gratis
   **se termina**: las zonas ya no pueden ser rects de pantalla calculados desde `momShipGeom()`.
   Es *el* problema técnico del pedido, no un detalle. Decidí temprano cómo se proyecta una zona
   3D a pantalla para dibujarle los corchetes y la barra de HP.

2. **`MOM_LAYOUTS` es 2D y es DATA compartida.** Las zonas son `u/v/w/h` **relativos al rect del
   barco** (`u` a lo largo de la eslora, `v` en alturas de `uh`). Hay 3 clases × 3 pasadas y
   `docs/PENDIENTES_DE_REDISENO.md` §8 las documenta como spec de arte. Si pasan a coordenadas 3D,
   **siguen siendo data** (`data/ships.js`), no constantes adentro del sistema — un buque nuevo no
   debe obligar a tocar lógica. Y hay que **mantener la lectura de diseño** de cada clase: `t21`
   remata abajo (motores al ras del agua), `log` tiene un depósito grande y fácil, `t42` el puente.

3. **`SHIP_UH` y `SHIP_DECK` (`data/tuning.js`) son fuente única de TRES consumidores**:
   `momShipGeom()`, la aproximación en vuelo normal (`drawApproachBarge` en `render/world.js`) y la
   cámara 3D. El comentario lo dice: si se desincronizan, **el barco salta al entrar**. La
   aproximación en vuelo sigue siendo 2D aunque el clímax sea 3D — el empalme tiene que seguir
   siendo invisible.

4. **El buque no puede matar hoy, y la muerte del juego es instantánea.** Chocar = morir
   (`systems/collision.js`), el avión **no tiene integridad**. Meter flak letal en un arena cerrada
   con esa regla es una picadora. Resuelto por la decisión 1: los impactos gastan ESCUADRÓN.

5. **La regla del límite.** `systems/momentum.js` **no llama hacia arriba**: `update()` devuelve una
   señal (`'objective'` o `{ death }`) y `game.js` decide el flujo. Mantenela — es lo que hace que
   el clímax no dependa del sistema de misiones ni del de muerte.

6. **Los stores se MUTAN, nunca se reasignan** (`cfg`, `cam`, `plane`, `run`, `stats`). Lo custodia
   `npm run lint:state` y falla el gate.

7. **`?no3d` y el build web.** El fallback 2D no es teórico: `three-world.js` se saltea solo si
   three no cargó o si se pasa `?no3d`, y `tools/build_web.py` arma el artifact autocontenido con
   tope de **16 MB**. Un minijuego que **exige** 3D deja al build web sin clímax. Ver decisión
   abierta 4.

8. **El táctil y el gamepad son ciudadanos de primera.** `inp` unifica teclado / mouse / pad /
   touch, y el momentum actual ya tiene dos esquemas (mouse = mira libre; táctil = visor fijo).
   Volar en 3D con la pantalla táctil es un problema de diseño aparte — no lo dejes para el final.

9. **El audio asume bullet-time**: `engineRumble(mom.t)` baja el motor a 30 Hz con latido y
   `updateMusic` ahoga la música al entrar. Si la cámara lenta deja de ser el estado, el audio del
   clímax hay que **re-pensarlo**, no solo re-conectarlo.

10. **`src/game.bundle.js` es generado** por esbuild (`npm run build:game`). **No lo edites a mano.**

11. **Hay un `window.__dbg` marcado "PROBE TEMPORAL — QUITAR"** en `src/game.js` (piruetas). No lo
    uses como base ni lo dejes crecer; si necesitás un harness, hacé el tuyo y sacalo al terminar.

---

## Decisiones ya tomadas (no las re-discutas)

- El avión **vuela** en el clímax. Se termina el avión clavado apuntando con la trompa.
- El buque **dispara de verdad** y su fuego es una amenaza real.
- **Primera y tercera persona**, conmutables **en vivo** (no una opción de menú que se elige antes).
- Las **zonas críticas por clase de buque** (`t42` / `t21` / `log`) y su lectura de diseño **se
  conservan**: cambia dónde viven y cómo se llega, no cuáles son.
- El **espacio es reducido y cerrado**: no es vuelo libre, es un ring alrededor del blanco.
- El resto del run (vuelo normal, aproximación, misiones, estrellas, puntaje) **no se toca**.

### Las cinco decisiones que estaban abiertas, RESUELTAS (26/7/2026, con el autor)

**1. Integridad = el ESCUADRÓN.** No se inventa una barra de vida nueva: los impactos del buque
consumen **aviones del escuadrón** — la misma reserva de vidas que ya usa el resto del juego
(commit `86cf4cd`: las vidas como aviones de una formación real). Un impacto del flak = cae un
avión de la formación y seguís vos al mando del siguiente, como en cualquier muerte. Escuadrón
agotado = derrota. El clímax no tiene recurso propio: gasta el del run.

**2. SIN FASES: un solo asalto.** Las 3 pasadas al 78/90/100% **desaparecen** en el modo 3D. El
vuelo hasta el objetivo ("el minijuego tipo carrera") es la primera parte; al llegar al **100%**
empieza el asalto, que **empieza y termina ahí**: se ganan la partida destruyendo el buque, o se
pierde. Consecuencias directas: el **re-ataque** (`REATTACK_*`) muere en el modo 3D (existía
porque "se te acabó la ventana"), y **todas las zonas están vivas a la vez** — el orden lo decide
el jugador, con el fuego enemigo como presión (menos AA vivas = menos fuego).

**3. ÓRBITA COMPLETA con distancia variable.** El avión orbita el buque: ←/→ controlan la órbita,
↑/↓ la altura, y el acercamiento es una banda acotada (turbo cierra, freno abre). Se elige la
alternativa "menos parecida al resto del juego" **a conciencia**: el clímax ES otro minijuego.

**4. ELECTRON PRIMERO; al web no le den bola.** El asalto 3D es el modo normal en Electron. El
fallback sin three (`?no3d` / build web) es el **momentum viejo, intacto y sin pulir** — se queda
porque ya existe y borra el riesgo de dejar la web sin final, pero no se le dedica ni un minuto
más. Si la web pierde calidad, pierde.

**5. MODELO 3D nuevo, visible desde todos lados.** El sprite lateral de 280×70 **queda obsoleto**
(actualizar `PENDIENTES_DE_REDISENO.md` §8: que nadie lo dibuje). En su lugar, el asset del buque
es un **modelo low-poly por clase** (`t42`/`t21`/`log`) con las **piezas separadas y nombradas**
(casco, puente, chimenea, mástil+radar, torretas AA, motores, depósito) para que las zonas se
anclen a piezas reales y el daño se muestre por pieza. El buque de cajas actual de
`three-world.js` es el placeholder hasta que exista — mismo criterio que todo el arte del juego.

---

## Convenciones que hay que respetar

- **Comentarios en español, sin tildes**, explicando **por qué**, no qué. Mirá `systems/momentum.js`
  o `data/tuning.js` para calibrar el tono: este repo comenta decisiones y trampas.
- **Una sola fuente por número.** Las perillas del clímax van a `data/tuning.js`; los layouts de
  buque, a `data/ships.js`. Nada de literales sueltos repartidos entre lógica y render.
- **Data vs lógica.** Agregar un buque tiene que seguir siendo agregar una entrada en `data/`.
- **El módulo no llama hacia arriba** (señal de salida, trampa 5).
- **`three-world.js` no lee globales**: recibe un snapshot. Si necesita más datos, se agregan al
  snapshot — no se importa el estado del juego.

---

## Plan por etapas

**Dejando el juego jugable al final de cada una.** Cada etapa se prueba en los tres layouts
(`t42` / `t21` / `log`). El subsistema nuevo vive en `systems/arena.js` (+ `render/arena.js` si el
overlay lo pide); `systems/momentum.js` **no se toca**: es el fallback sin 3D (decisión 4).

- **Etapa 0 — la cámara se mueve.** `three-world.js` gana un modo de cámara ORBITAL (ángulo,
  radio, altura alrededor del buque, mirando al buque) y un helper de **proyección mundo→pantalla**
  para que el overlay 2D (corchetes, HP) se dibuje donde corresponde. Sin gameplay nuevo. Es la
  etapa que valida la trampa 1; si esto no cierra, lo demás no importa.
- **Etapa 1 — el avión vuela.** Estado `arena`: se entra UNA vez al 100% de la distancia (con 3D;
  sin 3D sigue el momentum viejo con sus 3 pasadas). Controles de órbita (←/→), altura (↑/↓) y
  banda de acercamiento (turbo/freno). Límites del ring. Sensación primero: **jugarlo antes de
  seguir**.
- **Etapa 2 — las zonas en 3D.** Layouts convertidos a **anclas 3D sobre el buque** (siguen en
  `data/ships.js`: data, no lógica), hit-test del cañón/misil contra las zonas, corchetes y barra
  de HP proyectados. Destruir todas = `'objective'`.
- **Etapa 3 — el buque contraataca.** Flak y trazadoras desde las **AA vivas** (cada una que cae
  baja el volumen de fuego). Impacto = **un avión del escuadrón** (decisión 1). Escuadrón agotado
  = `{ death }`.
- **Etapa 4 — las dos cámaras.** Cockpit y 3ª persona, toggle en vivo (precedente: `camMode`), HUD
  funcional en ambas.
- **Etapa 5 — el pulido.** Audio (el bullet-time deja de ser estado y queda como acento), entrada
  y salida del clímax, puntaje, empalme con la aproximación en vuelo, docs y gate.

---

## Verificación (no des nada por hecho sin esto)

1. **El gate completo tiene que quedar en verde:**

   ```bash
   npm run check
   ```

   (incluye sintaxis, `lint:state`, bundle, unit, feeltest, smoke de Electron, build web y smoke
   del web — los dos smokes cuentan.)

2. **Los tres layouts, jugados enteros**: `t42` (SHEFFIELD/COVENTRY), `t21` (ARDENT/ANTELOPE) y
   `log` (GALAHAD/CONVEYOR). Cada uno tiene una lectura distinta y es donde se nota si una zona
   quedó inalcanzable desde el aire.

3. **Alcanzabilidad, medida y no mirada.** Hoy hay precedente: cuando se agregaron los layouts se
   simuló que **todas las zonas caían dentro del clamp de la mira** y el puente del `log` se corrigió
   de `u 0.36 → 0.32` por 0.3 px. Hacé el equivalente en 3D: que no exista una zona que solo se pueda
   batir desde afuera del ring.

4. **`?no3d`**: el juego tiene que seguir arrancando y llegando al final del nivel (con el fallback
   que hayas decidido). Y el **build web** tiene que seguir bajo 16 MB.

5. **Los tres controles**: teclado+mouse, **gamepad** y **táctil**. El táctil es el que se rompe.

6. **FPS.** Hoy hay 120 medidos con el mundo a 480×270 y 2.25× más puntos de mar que antes. Un
   arena 3D con proyectiles no puede comerse eso: **medilo y reportá el número**.

7. **Que la entrada y la salida no salten**: la aproximación en vuelo (2D) empalma con la escala del
   clímax; ese empalme está calibrado y es donde un cambio de cámara se nota como un tirón.

**Reportá lo que verificaste y lo que no.** Si algo queda a medias, decilo explícitamente. Y decí
**cómo se siente**: esto es un cambio de género del clímax, no un refactor. Si el arena resultó
confuso, aburrido o injusto, **es un resultado válido y hay que decirlo** — con la perilla que
habría que mover.

---

## Documentación

- `docs/ARQUITECTURA.md`: el mapa de módulos y el flujo del clímax cambian. Es el documento que se
  lee primero.
- `docs/ESTADO.md`: la sección del MOMENTUM describe con detalle el diseño viejo (cámara desde
  adentro, puntería girando la trompa, pasadas con timer). Queda **mintiendo** entera.
- `docs/PENDIENTES_DE_REDISENO.md` §8: la spec del arte del buque (decisión 5 — el sprite lateral
  de 280×70 queda obsoleto; el pedido pasa a ser un modelo low-poly por clase con piezas nombradas).
- `docs/ROADMAP.md` **#12** (otro momentum de vuelo rasante) y **#13** (el momentum como poder en
  vivo): este trabajo los toca directamente — actualizá o cerrá lo que corresponda.
- `README.md`: si el clímax cambia de controles, la sección de controles cambia.
- Este prompt queda como **especificación**: cuando esté implementado, marcalo arriba con el
  resultado real y las decisiones que se tomaron (mismo criterio que `PROMPT_ALTURAS.md`).
