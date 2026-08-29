# SPEC — LAS CHARLAS EN VUELO: diálogo durante la misión, sin pausar el mundo

> **Estado: spec aprobado en charla (16/8), sin implementar.** Pedido de Matías: momentos
> de diálogo DURANTE la misión jugable — sin enemigos mientras dura, sin UI, foco en los
> aviones y el texto; "una pausa sin pausa": el avión sigue volando igual, pero el
> kilometraje no avanza.
>
> **El truco que lo hace barato:** se desacopla el ODÓMETRO del SCROLL. El mundo sigue
> moviéndose (física intacta, el avión no se cae, el mar pasa), pero `run.dist` deja de
> contar hacia el objetivo y el sembrador deja de sembrar. La UI oculta esconde el
> kilometraje quieto — la ficción cierra sola.
>
> **Las tres piezas ya existen:** el motor de diálogo con AUTO-AVANCE y holds
> (`core/dialogue.js` — en vuelo el auto es el default, las manos están ocupadas) · los
> TRAMOS para ubicarlas en cualquier lapso (`tramos:` en `missions.js`, SPEC_TRAMOS) · el
> letterbox y los retratos (chips de cara del sistema VN).
>
> Leer antes: `docs/ARQUITECTURA.md` (manda; divergencias al §7) · `SPEC_TRAMOS.md` (la
> regla suprema: una misión sin tramos se comporta EXACTO igual que hoy — acá aplica
> idéntica: una misión sin charlas no cambia en nada) · `core/dialogue.js` ·
> `SPEC_MODO_HISTORIA.md` (RF-09 ya anticipaba escenas disparadas por evento de misión).

## 1. Requerimientos

### RF-01 · El disparador es un tramo
Campo opcional `charla: 'ESCENA_ID'` en un tramo (`data/missions.js`). Al ENTRAR al tramo
la charla se ARMA: el sembrador se apaga y se espera el **drenaje** (que lo ya sembrado
pase de largo, ~2–3 s o pantalla limpia, lo que llegue primero). Recién con el corredor
limpio arranca el diálogo. **CA:** cero enemigos en pantalla durante toda la charla; una
misión sin `charla:` en sus tramos no cambia en NADA (la regla suprema de los tramos).

### RF-02 · La burbuja (la pausa que no pausa)
Durante la charla: `run.dist` NO acredita hacia el objetivo (el mundo SIGUE scrolleando —
física, gas, laterales, roce: intactos, los mismos números) · el combustible NO drena
(perilla `CHV_FUEL_FREEZE true` — sería injusto cobrar nafta por escuchar) · los poderes
no se activan ni cargan (4/5/6 ignorados con aviso suave) · LA COLA, las olas y la CHANCHA
no disparan (mismo patrón de gate que la niebla ciega) · el MAR SIGUE MATANDO (el corredor
está limpio; la física honesta se queda). **CA:** fixture — la distancia al objetivo es
idéntica antes y después; `npm run feel` idéntico SIEMPRE (la burbuja no toca fórmulas,
solo acreditación y gates).

### RF-03 · La presentación
Letterbox arriba/abajo (el de arena/pasada) + **la UI se va entera** (HUD, kilometraje,
barras) + barra de diálogo abajo: NOMBRE + chip de retrato (la cara del sistema VN, con su
cascada de fallback a silueta) + texto tipeado con el motor de siempre. Entrada y salida
con transición corta (~0.4 s), sin corte seco. **Formación opcional** (`formacion: true`
en la escena): el numeral que habla SE ACERCA y vuela al lado durante la charla
(`render/squad.js` ya vuela Fieles en formación) — "el foco en los aviones". **CA:**
mirada muda — se entiende quién habla sin leer el nombre (chip + avión al lado).

### RF-04 · El avance es automático, los silencios son sagrados
`dlg.auto = true` durante la charla (la fórmula RF-03 del motor: `max(1.6, chars/12) +
hold`). Los `hold` se respetan EXACTOS como en la VN — el silencio con los dos aviones
volando juntos ES la escena. Sin skip en v1 (las charlas son cortas: tope `CHV_MAX_S 25`;
el skip de mantener llega con el de la historia si hace falta). **CA:** los holds miden
exactos por sonda (el patrón del fixture del locker).

### RF-05 · El contenido vive donde ya vive
Escenas en `data/story.js` con tipo nuevo **`'VUELO'`** (sin placa — el fondo ES el juego;
líneas con `personaje`/`cara`/`hold` como siempre). IDs estables de SISTEMA_DIALOGO.
Primeros usos de campaña: el ritual de Cóndor COMO charla del primer tramo · el banter de
los Fieles en tramos calmos · m10 «LOS PRIMOS» (la escolta ES charlas en vuelo) · a
futuro, la salida de m7. **CA:** cero texto hardcodeado; una escena `'VUELO'` con 0 assets
se ve y anda (P2 de siempre).

### RF-06 · La muerte y el reintento
Morir durante la charla: la charla se corta y el embudo de siempre decide (relevo/derribo).
Al reintentar la misión, la charla se re-dispara (el tramo se vuelve a entrar). El relevo
DURANTE una charla la corta limpio y no la reanuda (el momento pasó). **CA:** fixture del
ciclo muerte→reintento→la charla vuelve.

## 2. Perillas *(en `data/tuning.js`, bloque «CHARLAS EN VUELO»)*

`CHV_DRAIN_S 2.5` (drenaje máx.) · `CHV_FUEL_FREEZE true` · `CHV_MAX_S 25` (tope duro por
charla) · `CHV_FADE 0.4` (letterbox in/out) · `CHV_FORM_D 14` (a qué distancia se pone el
numeral).

## 3. Módulos

| archivo | rol |
|---|---|
| `systems/charla.js` | NUEVO — dueño del estado (armada/drenando/activa/saliendo), el gate de spawns/poderes, señales. No llama hacia arriba |
| `systems/spawn.js` | consulta el gate (patrón del veil/niebla que ya tiene) |
| `systems/flight.js` | acreditación de `run.dist` y nafta condicionadas (dos líneas, mismo patrón que la CHANCHA con `chAvance`) |
| `render/charla.js` | NUEVO y chico — letterbox + barra + chip; el tipeo lo dibuja el motor de siempre |
| `game.js` | tick + apagar HUD durante la charla en `draw()` |
| `data/story.js` · `data/missions.js` | escenas `'VUELO'` · campo `charla:` en tramos |

## 4. Sondas y fixture

`?charla=<ESCENA_ID>` (arranca PATRIA con la charla armada a los 300 m) · `__cvdbg()`
(fase, escena, línea, dist congelada sí/no, gates activos) — QUITAR. **`npm run charlas`**:
drenaje deja pantalla limpia · dist idéntica antes/después · nafta quieta · poderes
ignorados · holds exactos · mar mata igual · muerte→reintento re-dispara · misión sin
charlas = cero diferencia (el assert más importante) · `feel` idéntico.

## 5. Fases

| fase | entrega | criterio |
|---|---|---|
| **C0** ✅ | Data + gate: tipo `'VUELO'` en story.js, campo `charla:` en tramos, `systems/charla.js` esqueleto (armar/drenar/activar/salir), sondas + fixture base | la charla se arma y drena por sonda; misión sin charlas idéntica; `check` verde |
| **C1** | La burbuja completa (RF-02): odómetro y nafta congelados, poderes/COLA/olas/CHANCHA gateados, reanudación limpia | fixture de burbuja entero verde; `feel` idéntico |
| **C2** | La presentación (RF-03/04): letterbox + UI fuera + barra con chip + tipeo + auto-avance con holds + la formación opcional | mirada muda; holds medidos exactos |
| **C3** | Campaña (RF-05/06): el ritual de Cóndor como charla, 2–3 charlas reales del guion en tramos, muerte/reintento, docs (ARQUITECTURA, COMO_PROBAR, SPEC_MODO_HISTORIA §divergencias: RF-09 parcialmente cubierto por esto) | jugar m1 con el ritual EN VUELO; `npm run charlas` completo |

## 6. Qué NO hacer

1. **No pausar el mundo** — la burbuja congela ACREDITACIÓN, jamás física ni relojes.
2. **No input para avanzar** — el auto es el modo; las manos están volando.
3. **No charlas en clímax** (ARENA/PASADA/PULSO) ni durante niebla ciega, LA COLA activa u
   ola viva — si el tramo llega con algo de eso vivo, la charla espera a que termine.
4. **No matar la charla por diseño**: nunca más de `CHV_MAX_S`; si una escena no entra, se
   parte en dos tramos.
5. Texto por strings/story.js — nada en código.

## 7. Divergencias

> **Baseline de `npm run feel`** (tomado antes de tocar una línea, el 27/8/2026 — `md5`
> `54edf5490828fc762637824f2304f989`, 64 líneas): **FEEL: OK**, sin un solo número movido.
> Verificado idéntico al cerrar C0. La burbuja no toca fórmulas: congela acreditación y
> abre gates, y ninguna de las dos cosas entra en `core/physics.js`.

### 1 · `CHV_DRAIN_S 2.5` no alcanza para vaciar el corredor — **decisión pendiente del autor**

El RF-01 dice dos cosas que a velocidad de crucero **no pueden ser ciertas a la vez**:

- el drenaje dura *"~2–3 s **o** pantalla limpia, lo que llegue primero"* → es un **tope**;
- **CA:** *"cero enemigos en pantalla durante toda la charla"*.

El corredor tiene `SPAWN_Z = 320` m de profundidad y se vuela a ~74 m/s, así que **lo ya
sembrado tarda ~4,3 s en pasar de largo**. Medido por el fixture (§5, corredor poblado):
el tope corta a los **2,50 s con 4 unidades todavía en pantalla**. Apagar el sembrador está
bien; el número está corto.

**Se implementó el default del spec (2.5) sin tocarlo**, y el fixture *imprime el residuo*
en vez de esconderlo — la sección 5 avisa en pantalla cuando queda alguien. Las salidas:

- **`CHV_DRAIN_S = 5`** — cumple la CA en el peor caso, al costo de hasta 5 s de vuelo mudo
  antes de que alguien hable. Es lo que recomiendo.
- dejar 2.5 y **bajar la CA** a "nadie te puede alcanzar", aceptando siluetas lejanas.

Es una perilla de sensación, no de código: la decide el autor jugándola.

### 2 · La burbuja vale desde `armada`, no sólo mientras se habla

El RF-02 dice *"durante la charla"*. Se implementó **desde el armado y hasta volver a
`idle`**, fundido de salida incluido. Si el odómetro corriera durante el drenaje, el tramo
que disparó la charla podría **terminarse antes de la primera línea** — con un tope de 2,5 s
eso no es una hipótesis. Del otro lado, acreditar bajo unas bandas negras que todavía están
puestas es la misma incoherencia al revés.

### 3 · Una sonda de más: `__cvarm(id)` / `__cvcut()`

El §4 pedía `?charla=<ID>` y `__cvdbg()`. `?charla=` dispara **una sola vez por carga de
página**, y las dos mitades del RF-06 —cortar y volver a disparar— piden armarla dos veces
en la misma corrida. `__cvcut()` llama al **mismo `cortar()`** que usa el orquestador al
salir del pasillo, no a un atajo propio. Las dos, marcadas QUITAR.

### 4 · La sonda `?charla=` fuerza `persec: 0`

`POR LA PATRIA` arma su mapa con el `cfg` de **m1**, que trae `persec: 1`. Volar de numeral
tiene **banda**: con el avión clavado por sonda para poder medir, eso es una muerte a los
treinta segundos y la burbuja se acaba antes de poder mirarla. Es el mismo criterio que
`cazaCalma` en LA COLA: *la sección que mide una cosa apaga lo que no está midiendo.*

### 5 · El fixture mide el drenaje con **soldados**, no con obstáculos

El avión va clavado (`__czalto`) para poder medir, o sea que **no esquiva**: la sección se
comía lo primero que le pasaba por el carril y acusaba al drenaje de una muerte por
colisión (pasó dos veces). Los soldados pueblan el corredor igual —cuentan para `limpia`
como cualquier obstáculo—, nacen cada 26–60 m en COSTA y **no matan**. Se vuela m3 con
`__trset([{ hasta: 1, obstacles: 0 }])`: lo que sí mata se apaga sin tocar `missions.js`.

### 6 · C0 ya corre el motor de diálogo (sin dibujar nada)

El §5 pone el tipeo en C2. Se adelantó a C0 **la parte que no se ve**: sin el motor
corriendo, la fase `activa` no tendría final natural y sólo saldría por `CHV_MAX_S` — o sea
que el fixture de C0 mediría un comportamiento que no es el final. C2 no agrega lógica:
agrega **píxeles** (letterbox, HUD fuera, barra, chip, formación).

### 7 · `charla:` viaja por el flanco de `stepTramos`, junto con `radio:`

`systems/tramos.js` devolvía `{ radio }`; ahora devuelve `{ radio, charla }`. Son la misma
pregunta —*"algo que pasa AL ENTRAR a un tramo"*— y un segundo detector sería un segundo
`ultimo` que alguien tiene que acordarse de mover. **`charla:` no lleva lista de `dichas`**:
una charla no suena una vez por corrida sino una vez por **entrada** al tramo (RF-06).

### 8 · El validador de `core/tramos.js` no puede comprobar que la escena exista

`core/` no importa contenido, así que desde ahí un `charla: 'NO_EXISTE'` pasa como texto
válido. La red está en `npm run unit`, que sí ve las dos mitades: **tres tests nuevos** —
que toda `charla:` apunte a una escena `'VUELO'` que existe, que ninguna escena `'VUELO'`
se pase de `CHV_MAX_S` (con la fórmula del motor **importada, no copiada**) y que ninguna
lleve placa. Un id mal escrito no da error en el juego: la charla no se arma y la misión se
juega sin la escena, que es la peor forma de fallar.

### 9 · `M01_RITUAL` se partió en dos escenas

El ritual de Cóndor más la contestación del Gitano dan **~23 s contra un tope de 25**, y una
charla que roza el tope es una charla que el día que alguien alargue una línea se corta
sola. Partida como manda el §6.4: `M01_RITUAL` (~15,5 s) y `M01_GANSOS` (~7,5 s), para dos
tramos seguidos. De paso el chiste llega **después** del silencio, que es donde funciona.

### 10 · `run.fuelDist` se congela junto con `run.dist` *(C1)*

El RF-02 nombra `run.dist` y el combustible. `run.fuelDist` —el odómetro que decide cuándo
nace un bidón— también es **acreditación**, y dejarlo corriendo haría aparecer un bidón
apenas termina la charla, pagado con metros que el jugador no voló.
