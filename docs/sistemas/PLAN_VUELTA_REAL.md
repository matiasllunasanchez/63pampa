# PLAN — LA VUELTA COMO FUE *(el escape en el pasillo, el viraje filmado, la vuelta en el pasillo)*

> **Estado:** 📝 propuesta para aprobar (24/9/2026) · pedido del autor: *"La dinámica de IDA Y
> VUELTA vamos a tener que cambiarla. Vamos a meter sobrepaso de barco. Si no le pegamos, pantalla
> negra y derrota; si le pegamos, el juego SIGUE. Vamos a respetar lo real."*
>
> **La forma, en palabras del autor (24/9), que manda sobre todo lo de abajo:**
> *"Una vez que eliminamos al barco, y pasamos a través, suenan las alarmas y el radar se pone con
> todas las cosas rojas, hasta perder las estrellas, y ahí cinemática. Asumimos que la cinemática
> implica la vuelta y ahí arranca la vuelta. Entonces el juego pasillo nunca ROTA: lo hace una
> cinemática."*
>
> **Fuente histórica:** el texto que trajo el autor (el salto, la víbora, la reunión en silencio,
> "mirame la panza", la Chancha que los trajo "a upa", la eyección en el Atlántico Sur). Lo que hay
> que confirmar está en `docs/historia/PREGUNTAS_HISTORICAS.md` («EL ESCAPE Y LA VUELTA»).
>
> **Hermanos:** `PLAN_NAFTA_ALCANCE.md` (N0–N5 hechos: la ruta en km, el radar con alcance, la
> Chancha en dos mitades, soltar tanques) y `PLAN_ESTRELLAS_BUSQUEDA.md` (las estrellas que suben
> con el radar y bajan escondiéndose) — **este plan se monta encima de los dos, no los pisa**.
> `MECANICAS_LLEGADA.md` §8 (LA SUELTA).

---

## 0 · La idea en una línea

**El pasillo nunca rota.** Va siempre hacia adelante: primero hacia el buque, después —pasándolo—
hacia afuera del fuego. Dar la vuelta es lo único que la cámara del pasillo no puede mostrar, así
que **lo hace una cinemática**, y es la bisagra entre las dos mitades:

```
IDA (pasillo) ──► LA SUELTA ──► EL ESCAPE (pasillo) ──► EL VIRAJE (cinemática) ──► LA VUELTA (pasillo) ──► CASA
                  una pasada     alarmas, radar rojo,    la reunión y la          otro sector, Chancha,
                  errarle =      4 estrellas → 0         media vuelta             eyección, aterrizaje
                  derrota
```

---

## 1 · Lo que hay hoy y qué cambia

| hoy | cambia a |
|---|---|
| la bomba pega → cámara lenta → **negro** → `volverDelBlanco` (**otro negro** + la cinta gira) | la bomba pega → cámara lenta → **el salto y el pasillo sigue** en el mismo sentido: empieza EL ESCAPE |
| sin pegarle → otra pasada (hasta 3) | sin pegarle → **negro y derrota**. Las pasadas quedan solo en la prueba `t16` |
| la media vuelta es un corte a negro en el buque | la media vuelta es **una cinemática** cuando perdés las estrellas: EL VIRAJE |
| la vuelta = 4 fases `vuelta` con distinto radio | la vuelta = tramos con mecánica propia (§2.D–F), anclados a la ruta en km |
| quedarse sin nafta = `death_fuel` | antes del cero, **planear y eyectarse** (§2.F) — la misión se pierde igual, el piloto puede salvarse |

**Lo que NO cambia:** la ida, la ruta y la nafta de `PLAN_NAFTA_ALCANCE`, LA SUELTA hasta el
impacto, las estrellas (se usan tal cual), el aterrizaje.

---

## 2 · Tramo por tramo

Los km son de la **ruta** (`ruta.js`); los números son de partida y se calibran jugando.

### A · EL ATAQUE — una pasada

- **Una sola pasada**, como era (`BL.PASADAS = 1` en misión). Sin pegarle → el negro que ya existe y
  **derrota** (causa nueva `death_fallo_blanco`, con su ficha).
- **Pegarle no corta.** Queda el **MOMENTUM OBLIGADO x3** del impacto (tiempo de juego, no una
  cinemática) y se va el negro: pasás **a través** del buque y el pasillo sigue.

### B · EL ESCAPE — alarmas, radar en rojo, hasta perder las estrellas *(pasillo)*

**El disparo:** en el cruce, **4 estrellas** de golpe (`EST_MAX`: "todos encima"), **la alarma**
(el loop `alarm`, que ya suena desde el impacto) y **el radar entero en rojo** (la barra de
búsqueda al tope, la red roja, el techo bajo). Todo lo que las 4 estrellas sueltan —Harriers en la
cola, bombardeo— sale de la tabla de `data/estrellas.js`, sin mecanismo nuevo.

**La salida:** perder las estrellas **ya es una mecánica**: cada `EST_PERDER_S` seguidos por debajo
del techo baja una. Cuatro estrellas = pegarse al agua y **aguantar**. Cuando llegan a **0**, se
dispara EL VIRAJE. *(Con 20 s por estrella son 80 s: probablemente pida un valor propio del escape,
~8–10 s por estrella, para que dure lo que dura un escape y no un tramo.)*

**Lo que se juega mientras tanto** — la historia, hecha reglas:

1. **El salto** (ya existe): tirón para pasar por encima, marca amarilla en el altímetro, rozar los
   palos = `death_palos`.
2. **Volver al agua y la línea recta.** *"Bajaban la nariz para pegarse a las olas y seguían en
   línea recta. Virar o abrirse al lado del barco era una sentencia de muerte: exponía la panza."*
   Un **carril de escape** de ±8 alrededor del eje por donde cruzaste: salirte o alabear fuerte
   (`run.mvRoll`) es **mostrar la panza** y el daño de la artillería de a bordo se multiplica
   (×2,5). Además, arriba del techo **no bajan las estrellas**: el escape se juega al ras.
3. **La víbora.** *"Balanceaban el avión de lado a lado sin apartarse de la ruta; así el artillero
   de popa no podía calcular el tiro."* El **artillero de popa** arma una **solución de tiro**
   mientras volás predecible (el patrón de LA COLA, `systems/caza.js`) y dispara con plomo adonde
   vas a estar. **Cada inversión lateral dentro del carril la resetea.** Viborear abriéndose vuelve
   a mostrar la panza: es precisión de muñeca, no de ruta.
4. **Humo y agua.** Pasar por una columna reciente de sus propios tiros (`columnaBomba`) o por el
   humo del incendio **congela la solución** 0,4 s: "los ocultaban brevemente".
5. **Lectura:** trazadoras **desde atrás** (`HOSE` de la PASADA, horneadas) y columnas a los costados
   del carril. El carril no se dibuja: se lee por dónde caen los tiros. El artillero de popa se
   calla solo al salir de su alcance (~15 km); lo que queda son las estrellas.
6. **Silencio de radio** desde el impacto: el último grito de Puma es "¡Arriba, por encima de los
   palos!". Suben el motor y el agua (el recurso del poder RASANTE) para que el silencio no se lea
   como audio roto.

### C · EL VIRAJE — la cinemática *(el único corte de la vuelta)*

**Cuándo:** en el cuadro en que las estrellas llegan a 0. No antes: la cinemática es el premio de
haber escapado.

**Qué cuenta (3–5 s, una timeline de EL DIRECTOR, `systems/cine.js`):** la reunión y la media
vuelta, que son justo lo que el pasillo no puede mostrar.
- Puma adelante **meciendo las alas** — la seña para que lo encuentren sin radio.
- Los **Fieles vivos** se le acoplan uno a uno (`squadRender.drawFormation`). **Los muertos no
  llegan**: el hueco en la formación es el pase de lista, sin una línea de texto.
- La formación **alabea y gira** contra el cielo; el sol barre de un lado al otro.
- Fundido corto, y el pasillo vuelve **del otro lado**: otro sector, otra luz, rumbo a casa.
  La cinta de arriba gira acá (el `giroVuelta` que ya existe, desenganchado del buque).

**Asumido (autor):** la cinemática **implica** la vuelta — no hay que jugar la reunión ni el giro.

**Los prompts** (24/9, tercera versión, a pedido del autor: *"prefiero que la imagen sea la
silueta del avión, así me evito limitar por color, y que sea de lejos: una silueta volando de
izquierda a derecha, luz detrás o sol, y la silueta pegando la vuelta, para dejar en claro que no
sigue derecho"*). La silueta **no tiene color ni marcas**: sirve para cualquier piloto y cualquier
misión. Y el giro se lee sin explicación porque **el avión cambia de sentido en pantalla**: entra
yendo a la derecha y sale yendo a la izquierda. Cámara quieta: es lo más fácil de sostener para el
modelo y lo más claro de leer.

Protocolo de `docs/produccion/TEST_KLING_CINEMATICAS.md`: se tantea en **3.0 Turbo** solo con el
cuadro A, y la toma buena sale de **3.0 completo** con A + B. Si el pixel art sale blando: bajar a
la resolución del juego con nearest-neighbor en post.

*Cuadro A — inicio (Nano Banana):*
```
Detailed 90s arcade pixel art, hand-drawn sprite look, crisp clean pixels, no
anti-aliasing, rich dithered gradients in the sky.

Wide, distant side view of a single jet attack aircraft flying from LEFT to RIGHT,
extremely low over the open sea, seen as a pure solid black SILHOUETTE against a huge
low sun just above the horizon behind it. The silhouette must read unmistakably as an
A-4 Skyhawk in exact side profile: small swept delta wing, tall swept tail fin, long
pointed nose with a thin in-flight refuelling probe, compact fuselage, nose pointing
right. No colours, no markings, no details inside the silhouette: flat black. The jet
is small in the frame, in the left third, just above the water. A thin line of spray
trails behind it on the sea. The sun sits at the centre-right on the horizon with a
bright glittering path of light across the water; the sky is a dithered gradient of
warm light fading upward into dusk. Sea horizon in the lower third, calm dark sea.
Mood: silent, lonely, an enormous empty ocean.

PERIOD LOCK - 1982: a single A-4 Skyhawk only, no modern aircraft, no missiles, no
helicopters, no ships, no land.

16:9 landscape. No text, no letters, no numbers, no watermark, no signature, no UI.
```

*Cuadro B — final (editar el A en Nano Banana, así la silueta sale idéntica):*
```
Keep the exact same scene: the same sun, sky, sea and horizon, the same pixel art
style and the same 16:9 framing. Change only the aircraft: the same black A-4 Skyhawk
silhouette, now flying from RIGHT to LEFT with its nose pointing left, in exact side
profile, slightly smaller as if a little further away, placed in the right third of
the frame just above the water, a thin line of spray trailing behind it to the right.
Flat black silhouette, no colours, no markings. No text.
```

*Movimiento (Kling 3.0 · 10 s · A de inicio, B de final):*
```
Locked-off wide shot, the camera does not move. The black jet silhouette flies from
left to right low over the sea, crossing in front of the huge low sun. Past the sun it
banks steeply away from the camera, showing the flat shape of its wings for a moment,
and carries out a wide U-turn over the water, spray curving behind it. It rolls out
and flies back from right to left, a little further away, heading off the way it came
from. One continuous flight, no cuts. The sun, clouds and sea stay still except for
the glitter on the water and the spray.

Preserve the hard chunky pixel art aesthetic exactly: the aircraft is always a flat
black silhouette with crisp aliased pixel edges; visible dither in the sky, flat
colour blocks, no smoothing, no motion blur, no depth of field, no photorealistic
rendering, no 3D look.

AUDIO: a distant jet engine passing over the sea, rising and fading as it turns away,
wind and waves. No voices, no music.
```
*Negativo (campo aparte de Kling):* `text, letters, numbers, UI, colours on the aircraft, markings,
detailed aircraft, second aircraft, missiles, helicopters, ships, land, camera movement, zoom,
blur, motion blur, smooth gradients, 3D render, photorealistic`

*Variante DE NOCHE (24/9): la misma toma, con la luna de contraluz.* De noche la silueta solo
se lee contra algo claro, así que **cruza por delante del disco de la luna**, que va grande y baja.

*Cuadro A — noche:*
```
Detailed 90s arcade pixel art, hand-drawn sprite look, crisp clean pixels, no
anti-aliasing, rich dithered gradients in the sky.

Wide, distant side view of a single jet attack aircraft flying from LEFT to RIGHT,
extremely low over the open sea at night, seen as a pure solid black SILHOUETTE against
a huge full moon rising just above the horizon behind it. The silhouette must read
unmistakably as an A-4 Skyhawk in exact side profile: small swept delta wing, tall
swept tail fin, long pointed nose with a thin in-flight refuelling probe, compact
fuselage, nose pointing right. No colours, no markings, no details inside the
silhouette: flat black. The jet is small in the frame, in the left third, just above
the water, about to cross the moon's disc. A thin pale line of spray trails behind it
on the sea. The moon sits at the centre-right on the horizon, pale silver-white, with a
long glittering silver path of moonlight across the black water; a deep navy night sky
dithered from dark blue near the moon to near-black above, a few scattered stars, thin
dark clouds. Sea horizon in the lower third. Mood: silent, cold, lonely, an enormous
empty ocean at night.

PERIOD LOCK - 1982: a single A-4 Skyhawk only, no modern aircraft, no missiles, no
helicopters, no ships, no land, no lights on the aircraft.

16:9 landscape. No text, no letters, no numbers, no watermark, no signature, no UI.
```

*Cuadro B — noche (editar el A):*
```
Keep the exact same night scene: the same moon, stars, sky, sea and horizon, the same
pixel art style and the same 16:9 framing. Change only the aircraft: the same black A-4
Skyhawk silhouette, now flying from RIGHT to LEFT with its nose pointing left, in exact
side profile, slightly smaller as if a little further away, placed in the right third
of the frame just above the moonlit water, a thin pale line of spray trailing behind
it to the right. Flat black silhouette, no colours, no markings, no lights. No text.
```

*Movimiento — noche (Kling 3.0 · 10 s · A + B):*
```
Locked-off wide shot, the camera does not move. The black jet silhouette flies from
left to right low over the dark sea and crosses right in front of the huge full moon,
its shape sharp against the silver disc. Past the moon it banks steeply away from the
camera, showing the flat shape of its wings for a moment against the moonlight, and
carries out a wide U-turn over the water, a pale spray curving behind it. It rolls out
and flies back from right to left, a little further away, heading off the way it came
from, fading into the dark. One continuous flight, no cuts. The moon, stars and clouds
stay still except for the shimmer of the moonlight path on the water and the spray.

Preserve the hard chunky pixel art aesthetic exactly: the aircraft is always a flat
black silhouette with crisp aliased pixel edges; visible dither in the sky, flat
colour blocks, no smoothing, no motion blur, no depth of field, no photorealistic
rendering, no 3D look.

AUDIO: a distant jet engine passing over the sea at night, rising and fading as it
turns away, wind and slow waves. No voices, no music.
```
*Negativo — noche:* `text, letters, numbers, UI, colours on the aircraft, markings, aircraft
lights, navigation lights, afterburner flame, detailed aircraft, second aircraft, missiles,
helicopters, ships, land, daylight, sun, camera movement, zoom, blur, motion blur, smooth
gradients, 3D render, photorealistic`

### D · LA VUELTA — "mirame la panza" y el dilema *(pasillo)*

- **"MIRAME LA PANZA"** — el primer beat al volver del viraje: un compañero **se pone debajo tuyo**
  (actor del TEATRO AÉREO) y te hace **señas**: el daño real del avión (`run.integ`, las averías de
  `core/damage.js`, la fuga de abajo) como **pictogramas de manos**. Es el único momento en que el
  juego te dice qué tenés, y te lo dice sin radio. No hay que rotar nada: vuela a tu lado.

**El dilema del combustible:**

- **Nuevo daño: la FUGA.** Un impacto de la artillería del buque (§B) puede **perforar un
  tanque** (probabilidad por impacto, más alta mostrando la panza). La fuga suma un gasto por km
  encima del de `PLAN_NAFTA_ALCANCE` — el tanque pierde aunque no vueles.
- **Quién decide es el jefe:** en las señas, si tu autonomía (el **bingo** de NAFTA §3.8) no llega,
  Puma lo **dice por señas**: pulgar a casa, o la mano en forma de manguera → **a la Chancha**.
  El jugador lo ve venir en el HUD de nafta, pero la decisión la comunica el escuadrón.

### E · EL OTRO SECTOR Y EL ASCENSO TÁCTICO *(pasillo)*

> *"No regresaban por el mismo camino. Las rutas se planificaban por sectores distintos para no
> cruzarse con los Sea Harrier. El regreso se hacía pegado al agua la mayor cantidad de km
> posible; recién fuera del radar, un ascenso pronunciado."*

- **El ascenso táctico ya está en NAFTA §3.4** (radar vivo hasta `radarKm` pasado el blanco; subir
  antes ahorra nafta y hace nacer los Harrier). Este plan no lo toca: lo nombra y lo ubica.
- **Nuevo — el otro sector:** la vuelta **no repite el mar de la ida**: otro cielo/luz, otra
  siembra (`solo:` por fase), y **la CAP**: patrullas de Harrier que cruzan el pasillo de frente a
  distancias fijas de la ruta. Bajo el radar no te ven; arriba te enganchan (LA COLA).
- **Opcional:** una **bifurcación** al volver del viraje — dos rumbos, y el jefe marca uno por
  señas. El otro tiene la CAP. Es la única decisión de ruta del juego y conviene medir si suma.

### F · LA CHANCHA Y LA ÚLTIMA OPCIÓN *(pasillo)*

- **La Chancha de la vuelta ya está en NAFTA §3.5** (la barra decide hasta dónde baja a buscarte).
  Dos agregados de este plan:
  - **Romper el silencio con una palabra:** pedirla es **una sola tecla = la palabra clave**, y si
    la pedís **adentro del alcance de radar** te triangulan (+1 estrella). Afuera, gratis.
  - **"La trajo a upa" — el remolque:** con **fuga**, la nafta se escapa mientras entra. La cita se
    vuelve **sostenida**: quedarse en la canasta un tramo largo, con los comandos más duros (la
    agilidad de la avería ya existe en `effects()`), mientras la Chancha te arrastra hacia la costa.
    Soltarte antes de tiempo es quedarte corto.
- **Planear y eyectarse** (en vez de morir en el cero):
  - Con el tanque en cero **el motor se para** y el avión **planea**: baja solo, y cabeceando se
    estira el planeo (a costa de velocidad). Sin gas, sin turbo, sin poderes.
  - **Una tecla eyecta.** El resultado depende de **qué tan cerca de la costa** caíste (km de la
    ruta a la Gran Malvina o al continente): cerca → **rescatado**; lejos → **perdido en el mar**
    (el frío del Atlántico Sur: 15–20 minutos). Tocar el agua sin eyectar = `death_sea`.
  - **La misión se pierde igual** (NAFTA §3.8 se respeta), pero el piloto puede volver — y eso
    importa en campaña, donde los Fieles son personajes.

---

## 3 · Qué se reusa y qué hay que construir

| pieza | estado | de dónde |
|---|---|---|
| el salto, rozar los palos, la cámara lenta del impacto, la alarma | ✅ hecho | `systems/blanco.js`, `audio.js` |
| las estrellas (suben con el radar, bajan escondiéndose, qué sueltan) | ✅ hecho | `systems/estrellas.js`, `data/estrellas.js` |
| el FILO (techo de radar por fase, con rampa) | ✅ hecho | `fases`, `flight.js` |
| trazadoras desde atrás | ✅ horneadas, en cuarentena | `pasada.js` (`HOSE`) |
| columnas de agua | ✅ hecho | `columnaBomba` (`core/fx.js`) |
| solución de tiro que se arma y se rompe | ✅ hecho para el Harrier | `systems/caza.js` |
| timelines de cinemática | ✅ hecho | EL DIRECTOR, `systems/cine.js`, `data/cines.js` |
| actores del escuadrón, formación | ✅ hecho | `teatro.js`, `wingmv.js`, `squad` |
| el giro de la cinta | ✅ hecho, atado al corte del buque | `giroVuelta` (`render/hud.js`) |
| ruta en km, radar con alcance, Chancha en dos mitades | ✅ N0–N5 | `PLAN_NAFTA_ALCANCE` |
| averías con efectos | ✅ hecho | `core/damage.js` |
| **el disparo del escape** (4 estrellas + radar rojo en el cruce) | ❌ nuevo, chico | `systems/blanco.js` → `estrellas` |
| **el carril de escape y "mostrar la panza"** | ❌ nuevo | multiplicador de daño por carril/alabeo |
| **el artillero de popa** | ❌ nuevo | sistema chico, patrón de `caza.js` |
| **EL VIRAJE** (la timeline) | ❌ nuevo | una entrada en `data/cines.js` + el disparo en estrellas = 0 |
| **las señas** | ❌ nuevo | pictogramas en la cabina del compañero |
| **la fuga, el remolque, planeo y eyección** | ❌ nuevo | nafta, chancha, un estado de planeo |

---

## 4 · Fases de implementación

Cada una deja el juego jugable; `npm run check` y `npm run feel` idénticos tras cada una. Se prueba
en `t15` (IDA Y VUELTA) y con una fila de PRUEBAS por tramo (patrón de `t16`).

- ✅ **V0 — la bisagra** *(hecho 24/9)*. Pegarle = el pasillo sigue (sin negro, sin
  `volverDelBlanco` en el buque); errarle = negro y `death_fallo_blanco`; una pasada en misión
  (`BL.PASADAS = 1`; `t16` pide 3 con `pasadas:`). En el cruce: 4 estrellas, alarma, radar rojo.
  Estrellas en 0 → EL VIRAJE (hoy, el fundido de `volverDelBlanco` como suplente) → la vuelta desde
  el buque. Verificado volando t15 entero con capturas; 2 tests `vuelta real:` en `unit.js`.
  **Cómo quedó, y lo que se desvió de lo escrito:**
  1. **El escape es una FASE PUESTA A MANO** (`fases.tapar(FASE_ESCAPE)`, `data/blanco.js`): el
     odómetro sigue avanzando —el mar, la nafta y la siembra dependen de él— y la tapa evita que
     corran antes de tiempo las fases de la vuelta, con sus radios. En el viraje el odómetro
     **vuelve al punto del buque**: lo escapado gastó nafta pero no es camino a casa.
  2. **El radar va a 0,99, no a 1.** El 1 dispara la oleada de misiles en el acto y el avión
     todavía está arriba por el salto: medido, un misil lo bajaba medio segundo después del cruce.
  3. **Las estrellas bajan con su reloj propio** (`BL.ESCAPE_EST_S` = 9 s por estrella, 36 s en
     total; el general es 20) y **no se narran**: el silencio de radio arranca con el impacto.
  4. **La siembra vuelve en el escape** (`spawnsCut` se apagaba desde que asomaba el buque y nunca
     se volvía a prender): lo que sueltan las 4 estrellas es lo que hay que esquivar.
  5. **El buque se resincroniza con el odómetro** si este salta (sondas, relevos).
- ✅ **V0.1 — la fila y el viraje con video** *(hecho 24/9, pedido del autor)*.
  - **La escuadrilla ataca EN FILA** (corrige la decisión 1, ver `PREGUNTAS_HISTORICAS.md` «¿ATACABA
    UN SOLO AVIÓN?»): errar pasa el mando al **siguiente avión** —vivo, sano y con la bomba del
    centro, que la llevan todos— ya en la aproximación, a `BL.FILA_M` (900 m) del buque, con el
    relevo de siempre ("VASCO SALE DE LA CORRIDA · TURNO DE PICHÓN"). Los intentos son los aviones:
    sin nadie más, `death_fallo_blanco`. Verificado: cinco pasadas erradas, la quinta es la derrota.
  - **El viraje:** estrellas en 0 → Puma *"Los perdimos. Nadie atrás."* (3,5 s para leer) → *"Comencemos
    la vuelta a casa."* mientras el cuadro se funde a negro por debajo de la radio → el **video**
    (`assets/vuelta_dia.mp4` o `vuelta_noche.mp4` según el cielo: `night`, `storm` y `moon` son
    noche), a pantalla completa, salteable con una tecla después del primer segundo → la vuelta de
    siempre desde el buque. Estado nuevo `viraje`; si el video no carga, se sigue solo. El build web
    no carga los 13 MB del video (`tools/build_web.py` lo apaga).
- **V1 — la cinemática del viraje.** La timeline de EL DIRECTOR: Puma meciendo alas, los vivos
  acoplándose, el giro contra el cielo. Reemplaza al fundido suplente de V0.
- ✅ **V2 — la línea recta** *(hecho 24/9)*. En el cruce se fija el **carril** (±8 alrededor de
  donde pasaste) y la **artillería de popa** tira ráfagas desde atrás durante 12 s (`ESC` en
  `data/blanco.js`, `systems/escape.js`, trazadoras en `render/escape.js`, piques en `piqueAgua`).
  Techo de radar a **6** en todo el escape. **Desvío del plan:** no hay multiplicador ×2,5 de daño;
  el castigo es la **puntería** — yendo derecho la campana de tiro se abre (σ 12) y mostrando la
  panza (fuera del carril, alabeado o en pirueta) se cierra (σ 1,8), que es literal lo que dice la
  fuente. Medido en modo INTEGRIDAD: derecho, 0–1 golpes (lo absorbe el escudo); con la panza, el
  avión cae en ~3 s. Un golpe es `death_popa` (34, "mostraste la panza"). Los 2,2 s después del
  cruce el radar no completa la barra: el salto te deja alto y la oleada pegaba antes de bajar.
  Ajustes medidos: las trazadoras vienen casi paralelas (popa a 400) y su cola es proporcional a la
  profundidad — con otro modelo se iban al cielo o duraban un décimo de segundo en cuadro.
- ✅ **V3 — la víbora** *(hecho 24/9)*. De los 12 a los 28 s del escape el artillero de popa **arma
  una solución** (1,3 s volando predecible) y tira una ráfaga precisa con plomo; **cada inversión
  del movimiento lateral la tira a cero**. Mientras se arma, los tiros comunes se cierran (σ 12 →
  1,4): los piques que se acercan son el aviso. Pasar por un pique reciente la **congela** 0,4 s.
  Un cartel —no una radio: rige el silencio— avisa una vez: **VIBOREÁ · NO LES DES LÍNEA**.
  Medido en INTEGRIDAD: derecho te bajan en 6–8 s; viboreando (±5, inversión cada 0,6 s) un golpe
  que absorbe el escudo. **Dos correcciones que salieron de medir:** el alabeo del esquive ya no
  cuenta como "mostrar la panza" (en el control directo todo movimiento lateral inclina el sprite
  casi a tope, y viborear era mostrar la panza); y la velocidad lateral sale de cuánto se movió el
  avión, no de `plane.vx`, para que valga con mouse, alabeo o teclado.
- ✅ **V4 — las señas y la fuga** *(hecho 24/9)*.
  - **La fuga:** un tiro de popa que el avión aguanta perfora un tanque la mitad de las veces (8 de
    cada 10 mostrando la panza). El tanque pierde 0,18 %/s toda la vuelta, vueles como vueles —
    por `run.fuel`, que la nafta de la ruta ya sabe sincronizar. La corta un avión nuevo (relevo).
    En ESCUADRÓN no aparece: ahí cualquier golpe baja el avión.
  - **"Mirame la panza":** al volver del viraje, si queda un compañero vivo, se pone a tu derecha
    y abajo y te hace dos o tres señas en un globo con pictograma: QUÉ TENÉS (SANO · AVERIADO ·
    PERDÉS NAFTA) y A DÓNDE (A CASA · A LA CHANCHA, si con lo que queda —y lo que vas a perder—
    no llegás y la misión tiene Chancha). Sin radio. `SENAS` en `data/blanco.js`, dibujo en
    `render/squad.js` `drawSenas`, pictogramas `sena_*` en `data/iconos.js`.
  - **Mientras te revisa no se siembra nada:** la reunión era fuera del fuego, y con la vuelta
    sembrando desde el primer metro, en la prueba el avión se chocaba en plena seña.
- ✅ **V5 — el otro sector y la Chancha a upa** *(hecho 24/9)*.
  - **El otro sector:** del otro lado del viraje el cielo cambia (`CIELO_VUELTA`: el atardecer se
    hace noche, el día se hace atardecer…). Se devuelve el de la ida si se reintenta la misión.
  - **La CAP:** la misión dice dónde cruzan las patrullas (`cap: [1.22, 1.52]` en t15). Puma avisa
    3 s antes (*"Patrulla adelante. Abajo, que no nos vean."*); dos Sea Harrier cruzan el pasillo
    lejos y adelante durante 5 s. Arriba del techo del radar te ven: una estrella y LA COLA
    (*"Nos vieron. Harrier en la cola."*). Fuera del alcance de la flota el techo que usan es
    `RADAR_ALT` —la patrulla mira con sus ojos—. Verificado: a 5 m pasa de largo, a 30 m te ven.
  - **La palabra clave:** pedir la Chancha en la vuelta **adentro del radar** (donde ya no entra)
    te delata: *"TE TRIANGULARON LA RADIO"*, una estrella.
  - **"A upa":** con el tanque perforado la cita no termina al llenarse — ella te sigue pasando
    mientras la nafta se escapa, hasta que se le acaba la reserva o la ventana (*"No te sueltes.
    Te llevamos a upa."*). Test en `unit.js`; en vuelo no se probó (pide ruta, fuga y barra
    juntas). Lo de "comandos más duros" quedó afuera.
  - **La siembra distinta** de la vuelta no se tocó: ya la da la data de las fases de t15.
- **V6 — planeo y eyección.**

**Orden sugerido:** V0 y V1 primero — son la forma que pidió el autor y ya la hacen jugable de
punta a punta. V2 y V3 son el corazón del escape ("la tensión del escape era aún mayor que la del
ataque"). V4–V6 después, cada una con su playtest.

---

## 5 · Decisiones abiertas *(para el autor)*

1. ~~¿Errarle al buque es derrota aunque queden pilotos?~~ **No** (24/9): la escuadrilla atacaba en
   fila; el siguiente avión toma la pasada (V0.1).
2. **¿Cuánto dura el escape?** Con `EST_PERDER_S` (20 s por estrella) serían 80 s al ras.
   Propuesta: un valor propio del escape, ~8–10 s por estrella (30–40 s en total).
3. **"Mostrar la panza": ¿mata o multiplica daño?** Propuesta: multiplica (×2,5).
4. **¿Las señas con pictogramas o texto corto?** Propuesta: pictogramas.
5. **¿El piloto rescatado vuelve al escuadrón en campaña?** Toca el guion.
6. **¿Entra la bifurcación de rumbo?**

## 6 · Riesgos

- **Que el escape se haga largo** si las estrellas bajan lento — por eso la decisión 2.
- **Que la víbora se lea como spam de teclas.** Se cura con el carril: es precisión, no dedos.
- **Que el silencio se lea como audio roto.** Suben motor y agua (recurso del RASANTE).
- **Que la cinemática se sienta como un corte que saca del juego.** Se cura con lo corta que es y
  con que llega como premio: sólo aparece si escapaste.

## 7 · Para el historiador *(a `PREGUNTAS_HISTORICAS.md`)*

1. Alcance real de la artillería de popa y del Sea Cat en el escape (para los ~15 km de §C).
2. A qué distancia se reunían (el texto dice 20–30 millas: se usa 15–50 km).
3. Casos de "remolque" (se nombran Rotolo y Zini): confirmar nombres, grados y misiones.
4. Supervivencia real en el agua y rescates de pilotos eyectados en 1982 (para la tabla del §G).
