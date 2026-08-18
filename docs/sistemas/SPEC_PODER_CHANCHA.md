# SPEC — Poder LA CHANCHA (reabastecimiento en vuelo) · Análisis funcional para implementación

> **Audiencia: una IA implementadora trabajando sobre el código del juego, en sesión nueva
> y sin el chat donde se decidió esto.** Define el poder **LA CHANCHA**: llamar al KC-130
> Hércules reabastecedor para recargar combustible en pleno vuelo. Es el hermano caro del
> MOMENTUM — misma familia (barra que se carga jugando), pero **mucho más costoso, UNA vez
> por partida/misión, y recién pasado un tiempo mínimo de juego**. Cubre ROADMAP #15 y la
> fila "C-130 Hércules aliado" de PENDIENTES_DE_REDISENO.
>
> **Antes de tocar código, leer en este orden:**
> 1. `docs/ARQUITECTURA.md` — **manda sobre este spec**; divergencias se anotan en §9.
> 2. `src/systems/tempo.js` + sus perillas en `data/tuning.js` (`TEMPO_*`) — EL PATRÓN:
>    barra, tick, señal `'ready'`, sondas. La Chancha copia esa disciplina, no la toca.
> 3. `src/systems/flight.js` (la nafta: drena 3.2/s + 4.2 con turbo, `cfg.fuelOn` la
>    apaga; `run.fuel <= 0` fuerza el descenso) y `run.detection`/`radarSeen` (el radar).
> 4. `docs/historia/GUION_3.md`, epílogo de "LA BOMBA QUE NO DESPERTÓ" — la escena de la
>    Chancha y su ROTURA: desde ahí "vuela corto" y **no está disponible** (§2).

## 0. Cómo usar este documento

1. Una fase por vez (§7), en orden; tras cada fase, fixture (§6) + `npm run check` verdes.
2. Dato faltante → default de §5, seguir, y anotar en §9 si resulta injugable. No inventar.
3. No tocar los modos ni poderes existentes salvo los puntos de integración de H5.
   **`tempo.js` no se modifica**: son dos poderes hermanos con barras separadas.
4. Anotar TODA divergencia spec↔código en §9.

## 1. Objetivo y alcance

El jugador, corto de nafta en el PASILLO, pide por radio a la Chancha. Si los gates lo
permiten, el Hércules aparece adelante y ARRIBA — sobre el techo de radar — volando lento
y recto con la canasta desplegada. Hay que **subir hasta él, meterse en la caja detrás de
la manguera y sostener la formación**: el combustible pasa por segundo conectado. Todo el
rato que estás ahí arriba sos lento, no multiplicás y el radar te está viendo. Ella no
abandona jamás; el que se cae de la cita sos vos.

**Principios:**
- **P1 — Es un PODER, no un pickup.** Familia del MOMENTUM: barra propia que se carga con
  puntos, se pide con una tecla. Los bidones del pasillo no se tocan: siguen existiendo.
- **P2 — La cita SE VUELA.** Nada de cinemática ni autopiloto: la conexión es pilotaje
  (la física de siempre). Lo único automático es la radio.
- **P3 — Solo PASILLO.** En ARENA y PASADA la nafta ES el reloj del clímax: la Chancha no
  entra ahí jamás (histórico además: el tanquero nunca se acercaba al combate).
- **P4 — Cero assets requeridos.** Silueta procedural del Hércules como fallback (patrón
  `render/enemies.js`: si la hoja horneada no cargó, dibujo a mano). La hoja llega después
  por el pipeline de bake.

**Fuera de alcance:** el arte horneado del Hércules, la escena scriptada del guion (esa es
del modo historia), reparaciones (la Chancha da NAFTA, nada más), reabastecer wingmen
(color de radio como mucho), y cualquier presencia en ARENA/PASADA/MINUTOS SAGRADOS.

## 2. Las reglas que vienen de la historia *(el porqué, corto)*

- Los KC-130 del Grupo 1 reabastecieron A-4s en misiones reales; los A-4 tenían sonda
  fija. Manguera y canasta, formación lenta detrás del ala. → la cita como se describe.
- Reabastecer es volar ALTO y predecible un rato largo. → mientras dura, el radar te ve
  (`run.detection` sube), no hay multiplicador (ya emerge de `multOf`) y sos lento.
- **"La Chancha no abandona."** → nunca muere, nunca aborta, no hay colisión amiga. El
  eslabón débil de la cita es siempre el jugador.
- **La rotura (guion):** desde el epílogo de "LA BOMBA QUE NO DESPERTÓ", la Chancha vuela
  corto y no baja al sur. → en CAMPAÑA el poder existe **hasta esa misión inclusive**;
  después, pedirla responde por radio la negativa (`ch_broken`) y no viene. Es la trama
  vuelta mecánica: "sin Chancha no hay nafta de vuelta" se SIENTE.
- Dudas históricas nuevas → ya anotadas en `PREGUNTAS_HISTORICAS.md` (sección Chancha).

## 3. Requerimientos funcionales

### RF-01 · La barra y los gates
Barra propia (no la del MOMENTUM), se carga con puntos (`CH_CHARGE`). Pedirla exige TODO a
la vez: barra llena + `run.t >= CH_MIN_T` + no usada este run + `cfg.fuelOn` + misión con
Chancha viva + estado `'play'`. **CA:** cada gate que falla responde su línea de radio
propia (§5 strings) y NO consume la barra; con `[M] COMBUSTIBLE: NO` el poder ni se
muestra (barra oculta, tecla muda).

### RF-02 · El pedido
Tecla **5** (`Digit5`/`Numpad5`, patrón de la tecla 4 del MOMENTUM — la acción se registra
en `game.js`, el binding en `core/input.js`). Ritual de radio en 2–3 líneas por
`strings.js` (pedido → Cóndor → la Chancha confirma) y cuenta regresiva `CH_ETA` visible.
**CA:** el pedido en gate válido es irreversible (la barra se consume al confirmar, no al
conectar) y solo puede ocurrir una vez por run — el flag SOBREVIVE al relevo (mismo run).

### RF-03 · La cita
Cumplido el ETA, el Hércules entra adelante y arriba: altura `CH_ALT` (sobre
`RADAR_ALT`, bajo `FLY_TOP`), velocidad de formación (el mundo scrollea a
`CH_SPD_F` × mientras estás conectado), rumbo recto. Canasta con manguera detrás, oscila
suave. Marcador direccional en HUD mientras esté en el aire. La ventana dura `CH_WINDOW`
segundos; al vencer, "vira a casa" (radio) y se va — lo no cargado, se perdió. **CA:** con
cero assets se ve una silueta procedural legible; la ventana vence aunque nunca conectes.

### RF-04 · La conexión
Estar dentro de la caja de tolerancia `CH_BOX` detrás de la canasta = conectado:
`run.fuel += CH_RATE` por segundo (tope 100). Salirse de la caja o recibir un golpe =
desconexión (chispazo + radio corta), y se puede RECONECTAR dentro de la ventana. **CA:**
la nafta sube SOLO conectado; un drift sostenido la corta; reconectar retoma.

### RF-05 · Los costos
Mientras estás a la altura de la cita: el radar te ve (`run.detection` sube como ya sube
volando alto — no inventar sistema nuevo), el multiplicador es 1× (emerge solo de
`multOf`), y conectado el avance es `CH_SPD_F` (menos distancia, menos puntos). Los spawns
del pasillo siguen corriendo abajo: lo que viene, te espera al bajar. **CA:** `radarSeen`
es true durante una cita completa; el score por minuto medido durante la cita es
sensiblemente menor que a ras.

### RF-06 · Fin y regreso
Con el tanque lleno o la ventana vencida, la Chancha acelera y se va por arriba
(despedida por radio). El jugador pica de vuelta al ras y el pasillo sigue donde estaba.
**CA:** no hay estado nuevo de juego — todo ocurre DENTRO de `'play'`; pausa, muerte y
relevo durante la cita funcionan sin romperla (muerte/relevo la despiden: se fue, y el
poder quedó gastado).

### RF-07 · Disponibilidad por modo y misión
`missions.js`: campo `chancha: false` desde la misión siguiente a la rotura (hoy en código
la rotura es el epílogo de "LA BOMBA QUE NO DESPERTÓ" — anotar en §9 el id que corresponda
al remapeo de 14 de PLAN_CAMPANA_001). CICLO y POR LA PATRIA: disponible siempre (sin
narrativa). ARENA / PASADA / MINUTOS SAGRADOS: jamás — la tecla responde `ch_nozone` si la
barra está llena, nada si no. **CA:** cambiar el campo cambia la disponibilidad sin tocar
código; en misión rota responde `ch_broken`.

### RF-08 · HUD y legibilidad
Barra del poder junto a la del MOMENTUM (mismo lenguaje visual, otro ícono/color); ETA en
cuenta regresiva; marcador direccional; indicador de conexión + % de tanque subiendo;
popups por strings (`ch_ready`, `ch_connect`, `ch_full`…). **CA:** mirada muda — un
espectador entiende pedido → espera → cita → carga → despedida sin leer este doc.

### RF-09 · Audio
Radio con los beeps de siempre, motores del Hércules (rumble procedural, más grave que el
propio), bomba de transferencia mientras carga, chispazo al desconectar. Todo procedural
vía `systems/audio.js` — cero archivos nuevos requeridos. **CA:** silencio total no ocurre
durante la cita; nada depende de la duración de un sample.

## 4. Requerimientos no funcionales

- **RNF-01** Cero dependencias ni assets nuevos. Silueta procedural; hoja horneada después
  (`tools/bake_enemies.html`, fila ya listada en PENDIENTES_DE_REDISENO).
- **RNF-02** No romper nada: gate `npm run check` completo (unit, feel, smoke, web).
- **RNF-03** Stores mutados, señales hacia arriba, textos por `strings.js` es/en,
  perillas en `data/tuning.js` con comentario (sección propia `CH_*`, al lado de las
  `TEMPO_*`).
- **RNF-04** Sondas marcadas `QUITAR` (patrón `__adbg`/`__tcharge`).

## 5. Perillas y defaults *(sección `CH_*` en `data/tuning.js`; NO inventar otros)*

| perilla | default | qué es |
|---|---|---|
| `CH_CHARGE` | 2000 | puntos que llenan la barra (≈3× `TEMPO_CHARGE`: cara a propósito) |
| `CH_MIN_T` | 240 | s de misión antes de poder pedirla ("bastante tiempo de juego") |
| `CH_ETA` | 18 | s entre el pedido confirmado y la aparición |
| `CH_ALT` | 48 | altura de la cita (unidades de `plane.y`; sobre `RADAR_ALT`=20, bajo `FLY_TOP`=68) |
| `CH_BOX` | 6 | radio de la caja de conexión detrás de la canasta |
| `CH_RATE` | 9 | % de tanque por segundo conectado (lleno en ~11 s limpios) |
| `CH_WINDOW` | 30 | s de ventana desde que aparece hasta que vira a casa |
| `CH_SPD_F` | 0.75 | factor del scroll mientras estás conectado (formación lenta) |

Strings mínimos (es/en, `en` vacío cae a `es`): `ch_call`, `ch_ack` (Cóndor), `ch_come`
("La Chancha no abandona. Voy."), `ch_eta`, `ch_ready`, `ch_connect`, `ch_drop`,
`ch_full` ("Servite."), `ch_bye`, `ch_early` (falta tiempo), `ch_used`, `ch_broken`
("La Chancha no baja más al sur."), `ch_nozone`. Las líneas de sabor pueden citar el tono
de la escena del guion, pero NO reproducir la escena (esa es del modo historia).

## 6. Sondas y fixture

- **`window.__chdbg()`** — JSON: barra, gates (cuál falla), fase (idle/eta/cita/conectado),
  ventana restante, fuel, usada. **`window.__chset(meter, t)`** — llena la barra y avanza
  el gate de tiempo (patrón `__tcharge`). Ambas QUITAR.
- **`tools/fixture_chancha.js`** + script npm **`chancha`** (patrón `fixture_story.js`),
  corre con `?qa`:
  1. antes de `CH_MIN_T`: pedir → `ch_early`, barra intacta;
  2. gates ok: pedir → ETA → aparece; la nafta sube SOLO dentro de la caja;
  3. drift sostenido → desconexión; reconectar retoma; golpe → desconexión;
  4. ventana vencida → se va, lo no cargado se perdió;
  5. segundo pedido en el mismo run → `ch_used`;
  6. `[M] COMBUSTIBLE: NO` → poder oculto y tecla muda;
  7. misión con `chancha: false` → `ch_broken`, no viene;
  8. muerte + relevo durante la cita → no rompe nada y el poder queda gastado;
  9. cero errores de consola; `npm run check` verde.

## 7. Plan por fases *(cada una shippeable; gate: fixture + `npm run check`)*

| Fase | Entrega | Criterio de cierre |
|---|---|---|
| **H0** | `systems/chancha.js` con la disciplina de `tempo.js` (tick/barra/reset por run), perillas `CH_*`, strings, sondas `__chdbg`/`__chset`. Sin UI ni Hércules | la barra carga y los gates responden por sonda; check verde |
| **H1** | El pedido completo: tecla 5, radio ritual + ETA, negativas (`ch_early`/`ch_used`/`ch_broken`/`ch_nozone`), consumo de barra al confirmar. Al llegar, v0: recarga instantánea (placeholder marcado) | fixture pasos 1, 5–7 |
| **H2** | La cita jugable: Hércules procedural + canasta, subida, caja `CH_BOX`, transferencia `CH_RATE`, reconexión, ventana `CH_WINDOW`, despedida. Muere el placeholder de H1 | fixture pasos 2–4 |
| **H3** | Los costos y los bordes: detección de radar arriba, `CH_SPD_F` conectado, spawns intactos abajo, pausa/muerte/relevo durante la cita, flag que sobrevive al relevo | fixture paso 8; RF-05 medido |
| **H4** | Legibilidad + audio: barra junto al MOMENTUM, ETA, marcador direccional, indicador de conexión, popups, motores/bomba/chispazo procedurales | mirada muda (RF-08/09) |
| **H5** | Integración: campo `chancha` en `missions.js` (rotura según guion — anotar mapeo en §9), docs (ARQUITECTURA: fila del sistema y "¿dónde voy?"; PENDIENTES: estado de la hoja; ROADMAP #15), fixture en `package.json`, QUITAR revisadas | fixture completo; check verde con web |

## 8. Qué NO hacer

1. **No cinemática**: la cita se vuela. (El relevo es cinemática porque el avión no es
   tuyo; acá el avión es tuyo todo el tiempo.)
2. **No tocar `tempo.js`** ni compartir su barra: poderes hermanos, medidores separados.
3. **No aparecer jamás en ARENA / PASADA / MINUTOS SAGRADOS** — ahí la nafta es el reloj.
4. **La Chancha no muere, no aborta, no colisiona.** Nada puede tocarla. Si el guion algún
   día la rompe EN vuelo, eso es una escena del modo historia, no de este sistema.
5. **No segundo uso por run**, ni "carga parcial que devuelve barra": se gastó, se gastó.
6. **No relojes de pared**: todo por `dt` (compatible con el MOMENTUM activo — sí, se
   puede pedir la Chancha en cámara lenta; el ETA corre en tiempo de mundo).
7. **No assets requeridos, no strings sueltos, no reasignar stores, no editar el bundle.**
8. **No inventar cifras históricas en pantalla** — dudas a `PREGUNTAS_HISTORICAS.md`.

## 9. Divergencias encontradas *(completar durante la implementación)*

> Anotar acá toda diferencia entre este spec y la realidad del código, con la decisión
> tomada. Incluir: a qué id de misión quedó atada la rotura (código 12 vs canon 14).

### 1. Las sondas se llaman `__cha*`, no `__ch*`

`window.__chdbg` **ya existía**: es el censo del escombro (los `chunk` del despiece). Definir el
mío encima lo habría pisado en silencio y el fixture de la Chancha habría estado leyendo la
población de pedazos — de hecho pasó, y la primera corrida lo mostró: `{"n":0,"max":60,…}`.
Quedaron `__chadbg`, `__chaset`, `__chacall`, `__chaput`, `__chafuel`, `__chamis`, `__chagolpe`,
`__chanafta`, `__charadar`, `__chacalma`. Todas QUITAR.

### 2. La geometría de la cita no estaba en el spec, y hacía falta medirla

§5 da las ocho perillas de mecánica pero ninguna de dónde está la Chancha. Se agregaron `CH_Z`,
`CH_HOSE_X/Y/Z`, `CH_DERIVA`, `CH_DERIVA_V` y `CH_SALIDA`, y **la decisión importante es la
profundidad**: la canasta va a la profundidad de juego (`PZ = 14`), la misma del avión.

Con la canasta a otra profundidad, la proyección (`k = F/z`) las separa en pantalla aunque en el
mundo estén pegadas: probado con el Hércules a 34 y la canasta a 25, "estar en la caja" se veía
como estar *al lado*, y la manguera cruzaba media pantalla hasta un aro fuera de cuadro. Con la
canasta en `PZ` y el Hércules en `CH_Z = 24`, **la caja que se dibuja es exactamente donde hay que
poner el avión** — que es la única forma de que una cita de puntería sea justa.

### 3. El ritual de radio corre por `dt`

§8.6 prohíbe relojes de pared, así que las dos respuestas (Cóndor y la Chancha) no salen de
`setTimeout` sino de umbrales sobre un contador que avanza con el `dt` del mundo, adentro de la
fase `eta`. Pedirla en cámara lenta no descoloca el diálogo, y una pausa no deja a Cóndor
contestando solo.

### 4. La rotura quedó atada a **m6 en adelante** (código)

El epílogo de la rotura es el de **m5 · LA BOMBA QUE NO DESPERTÓ**, así que el poder existe
**hasta m5 inclusive** y `chancha: false` está en m6…m12 (los ids del código de hoy, 12 misiones).
Si el remapeo a 14 de PLAN_CAMPANA_001 se aplica, hay que mover el campo con la misión, no con el
número: el gate es "después de la rotura", no "de la sexta en adelante".

### 5. "Recibir un golpe" quedó definido como sacudón

El spec no lo define. Se resolvió con lo que ya existe: `run.scrapeVib > 0.1 || run.shake > 3`
—o sea rozar el mar/suelo o comerse una explosión— y se prueba con la sonda `__chagolpe`.

### 6. El fixture apaga el cielo para medir la cita, salvo donde el precio ES lo medido

`__chacalma` vacía obstáculos, misiles y detección durante los pasos de la cita: sostener el avión
a 44 m durante los 18 s del ETA sin eso termina en relevo antes de que la Chancha llegue (medido:
tres relevos seguidos). Es el mismo criterio de `__czcalma` en el duelo. El paso 9 —el precio—
corre **sin** calma a propósito: apagarlo sería medir un mundo que el jugador nunca juega.

### 7. Un paso más que los ocho del §6: el precio (RF-05)

El §6 lista ocho pasos y ninguno mide RF-05, que es la mitad del diseño del poder. Se agregó el
paso 9: a ras el radar no te ve y el multiplicador va en ×10; a la altura de la cita te ve y cae a
×1 (medido: detección 0 → 0,62 · x10 → x1).
