# PLAN — EL DIRECTOR: cómo generar cinemáticas (vuelos, sacrificios, épica) con lo que hay

> **Estado: C0 IMPLEMENTADA (17/8) — el director mínimo anda y el premio del PULSO ya es una
> timeline en data. C1–C5 sin empezar.** Verificado: `npm run pulso` verde con la cinemática leída
> de `data/cines.js` (la sección 6 del fixture lo mide), `npm run check` en cero, `npm run feel`
> idéntico al baseline.**
> Pregunta de Matías: *"¿cómo generamos cinemáticas — vuelos, piruetas, sacrificios como el
> final, escenas épicas? ¿Reusar la lógica de las piruetas con otras cámaras?"*
>
> **Complementa, no reemplaza, a [PLAN_CINEMATICAS.md](../produccion/PLAN_CINEMATICAS.md)**
> (producción): ahí se decidió que el juego se cuenta con **láminas fijas + sonido + texto**,
> y el video IA se reserva para un puñado. Eso sigue. Este doc cubre lo que ese plan no
> cubre: **las escenas que SE MUEVEN** — aviones volando, el sacrificio en el aire, la épica —
> y cómo hacerlas con el motor.

## 0. Lo que el proyecto YA tiene de "cinemática" *(sin llamarse así)*

| pieza | dónde | qué sabe hacer |
|---|---|---|
| **Las piruetas** | `systems/moves.js` | toma el control del avión (`run.mv`) y lo vuela solo por una curva: ES un sistema de movimiento scripted |
| **El premio del PULSO** | `systems/pulso.js` (`Q.cine`, beats) | encadena pirueta → suelta → impacto → muerte del buque: un mini-timeline ad hoc, el primer director de facto |
| **El relevo del escuadrón** | `systems/squad.js` | 3 s de cinemática: la cámara se queda con los restos, el compañero entra y PASA — un actor con trayectoria |
| **El líder de PERSECUCIÓN** | `systems/persec.js` | un avión amigo volando el pasillo con su línea |
| **El despegue** | `game.js` (takeoff) | cuenta, carrera, rotación, la formación saliendo de plano |
| **La cámara lenta** | `systems/tempo.js` | el dt de todo el mundo escala sincronizado |
| **El motor de líneas** | `core/dialogue.js` | texto con `hold`: el silencio actuado |
| **El mundo 3D** | `three-arena.js` | cámara REAL (1ª/3ª con resorte), buque a escala, mar, domo |
| **La cabina** | `drawCockpit` | 1ª persona sobre cualquier fondo |
| **El despiece** | `core/fx.js` | muertes con carácter, pedazos con inercia |

**Lo que NO hay:** una cámara móvil en 2D. El render del PASILLO proyecta desde UN punto
fijo detrás del avión (y el zoom por raster quedó desactivado: `CAM_ZOOMS = [1]`). No hay
plano lateral, ni frontal, ni grúa en 2D — y no es barato agregarlos: el mundo 2D no es
una escena, es una proyección.

## 1. Las opciones *(la carta completa, con su costo real)*

| # | opción | cómo | mejor para | costo | límite |
|---|---|---|---|---|---|
| **A** | **Láminas fijas + texto + sonido** (VN) | lo de siempre: `?scene=`, holds, placas, cuadros sagrados | el DOLOR: el locker, el cuaderno, la carta, los epílogos | ya existe | no se mueve — y eso es el personaje (PLAN_CINEMATICAS) |
| **B** | **El motor dirige en 2D** — *tu idea, afinada* | un DIRECTOR que encadena verbos existentes: `tempo`, `move` (piruetas), actores con trayectoria (relevo/persec), `fx`, `radio` con hold, `fade`, `letterbox`, nivel de control del jugador | vuelos, piruetas de premio, el despegue en formación, el compañero que pasa, la Chancha acoplándose | **bajo** (verbos hechos; falta el director) | **una sola cámara**: detrás del avión, más cabina. "Otras cámaras" en 2D = cabina / letterbox / rolido del horizonte / tempo / fade — no planos nuevos |
| **C** | **El estudio 3D** — el mundo del ARENA como escenario | cámara programable (órbita, dolly, flyby, grúa) sobre `three-arena.js`; el buque ya es 3D; los aviones como BILLBOARDS con las hojas horneadas (9 rolidos, ±32°, `jet_rear`/`jet_turn`) | la ÉPICA: el flyby al buque, los Mirage del sol, la vorágine, el cruce de trayectorias de m14 | **medio** (cámara + billboards + timeline) | los aviones son sprites: ángulos limitados a lo horneado; requiere 3D (no web) |
| **D** | **Video pre-renderizado** (IA / Kling) | lo decidido en producción: 5–6 clips | el puñado de momentos que ningún motor da | alto por clip | estático, pesado (solo Electron: el web tiene tope de 16 MB), no reactivo |
| **E** | **Machinima**: capturar el motor | grabar B/C desde el juego + `pixelrefine.py` | teaser, trailer, Steam | bajo (reusa B/C) | no es para adentro del juego |
| **F** | **Casi-cinemática con control** | el jugador conserva MANDOS LIMITADOS durante la escena (solo gas, o solo mirar) | los SACRIFICIOS y los FINALES: el planeo sin nafta, la vorágine, "lo tenés al lado y no podés hacer nada" | bajo (es B con `control: 'limitado'`) | hay que diseñar qué se puede hacer y qué no en cada escena |

## 2. La respuesta a "¿reusar las piruetas con otras cámaras?"

**Sí a la primera mitad, no a la segunda — y la segunda tiene una salida mejor.**

- **Sí:** `moves.js` ya es un sistema de movimiento scripted que toma el avión. Sumarle
  ACTORES (otros aviones con trayectoria — el relevo y PERSECUCIÓN ya los vuelan) y un
  TIMELINE que encadene verbos es exactamente el director de la opción B. El premio del
  PULSO ya lo hace en chico: es el prototipo.
- **No:** "otras cámaras" en 2D no existen ni se compran baratas — el mundo 2D es una
  proyección desde atrás. Lo que sí tenés en 2D: cabina (1ª persona), letterbox, rolido
  del horizonte, cámara lenta, fundidos. Es un lenguaje corto pero es el del arcade.
- **La salida:** para los planos que PIDEN cámara (el buque pasando al lado, un avión
  cruzando de frente, la formación vista desde afuera) está el estudio 3D (opción C): el
  mundo del ARENA ya tiene cámara real, buque y mar; los aviones entran como billboards
  con las hojas que ya existen. El mismo director dirige los dos escenarios.

## 3. Qué escena va con qué *(la regla: "el motor muestra el hecho, la lámina lo hace doler")*

| escena del guion | forma | por qué |
|---|---|---|
| Despegue en formación / la Chancha acoplándose / piruetas de premio | **B** | vuelo puro, cámara de atrás alcanza |
| **La salida de m7** — el Vasco enganchado por un Harrier, vos al lado sin poder hacer nada | **F + A**: LA COLA en modo cinemática (el duelo que no es tuyo — PLAN_HARRIERS §C3) con control limitado, y corte a la lámina del silencio | la impotencia se JUEGA; el dolor se LEE |
| m10 los Mirage del sol | **C** (flyby en el estudio 3D) + **A** | es imagen épica, pide cámara |
| m12 el corte a tierra (Correa) | **A** pura (registro TIERRA) | es el cuaderno: no se mueve, por diseño |
| **m14**: la vorágine (Final A) / el planeo del sapito (Final B) | **F** (control limitado: solo gas / solo mirar) + **C** para el cruce de trayectorias + **A** para cerrar | el final no puede ser una película: el jugador tiene que tener las manos en el avión |
| El momento del misil de m14 | **EL PULSO** (ya construido) | es literalmente para esto |
| Teaser / Steam | **E** sobre B/C + los clips **D** | producción, no juego |

## 4. La recomendación: construir UN director, con dos escenarios

`systems/cine.js` — un intérprete de **timelines declaradas en data** (`data/cines.js`)
cuyos verbos son cosas que YA existen. Una cinemática = una lista de beats:

```
{ t: 0.0, tempo: 0.35 }                       // cámara lenta
{ t: 0.0, control: 'ninguno' }                // o 'limitado' (solo gas) o 'total'
{ t: 0.2, actor: 'gitano', path: 'pasa_izq' } // un Fiel con trayectoria (relevo/persec)
{ t: 0.5, move: 'tonel', who: 'player' }      // moves.js
{ t: 1.4, radio: 'M07_SALIDA_030' }           // línea con hold (core/dialogue)
{ t: 2.0, fx: 'despiece', who: 'vasco' }      // core/fx
{ t: 2.0, cam: 'cabina' }                     // 2D: cabina/letterbox/roll/fade · 3D: orbit/dolly/flyby
{ t: 3.5, fade: 'negro', then: { scene: 'M07_SILENCIO' } }   // encadena la lámina
```

Dos escenarios para el mismo director: **2D** (el pasillo, cámara fija + cabina) y **3D**
(el estudio del ARENA, cámara programable). El director no sabe de cámaras: pide un
preset y el escenario lo resuelve.

**Los primeros dos clientes son refactors, no features nuevas**: el premio del PULSO
(`Q.cine`) y el relevo del escuadrón pasan a ser timelines en data. Si el director no puede
expresar esos dos, está mal diseñado — es la prueba de fuego.

## 5. Fases

| fase | entrega | criterio |
|---|---|---|
| ~~**C0 · El director mínimo**~~ ✅ | `systems/cine.js` + `data/cines.js`: timeline por beats con los verbos `tempo`, `control`, `move`, `fx`, `radio`, `fade`, `letterbox`, `cam:'cabina'/'chase'`; señales de fin (`'done'`) — nunca llama arriba. **El premio del PULSO migrado** como primer timeline | **hecho 17/8/2026**: `npm run pulso` verde — «la corre EL DIRECTOR desde data: timeline "pulso_premio" · 9 beats · 5,04 s»; `feel` idéntico (33 asserts) |
| **C0½ · EL PESO** | *(plan aparte, 17/8)* la cama de vuelo: que el avión de una cinemática sea el del pasillo — integra, la cámara llega tarde, las actitudes vuelven con peso, el mundo corre debajo. Salió de mirar C0: el premio era un sprite girando sobre una foto. Ver [PLAN_CINE_PESO.md](PLAN_CINE_PESO.md) | P0–P5 allá; `feel` idéntico es su gate |
| **C1 · Los actores** | verbo `actor` con trayectorias reusando el relevo y el líder de PERSECUCIÓN (los Fieles con indicativo, el Harrier de LA COLA, la Chancha). **El relevo migrado** como segundo timeline | `check` verde; el relevo se ve igual y vive en data |
| **C2 · El estudio 3D** | el escenario 3D: `three-arena.js` como set — cámara programable (`orbit`, `dolly`, `flyby`, `crane`, `cabina`) y aviones como billboards con las hojas horneadas (elige el frame por ángulo cámara-avión). Sonda `?cine=<id>` | un flyby al buque con dos Fieles pasando, capturado |
| **C3 · La casi-cinemática** | `control: 'limitado'` con perfiles (`solo_gas`, `solo_mirar`, `sin_armas`) + el HUD en modo escena (letterbox, sin puntaje) | el planeo sin nafta se vuela y se siente escena |
| **C4 · Las escenas del guion** | en orden de rendimiento: despegue en formación → la salida de m7 (LA COLA cinemática + lámina) → m10 Mirage (estudio 3D) → m14 (vorágine/planeo/cruce) | cada una en data, con su fixture de "carga limpia" |
| **C5 · Machinima + gate** | `npm run cine` recorre todos los timelines (carga sin errores, canvas vivo); captura a video de cualquier timeline para el teaser (+ `pixelrefine.py`) | el catálogo de cinemáticas es red de regresión, como PRUEBAS |

## 6. Qué NO hacer

1. **No inventar una cámara móvil en 2D** — es rehacer el render; la cámara va al 3D.
2. **No cinemáticas largas sin manos**: más de ~8 s sin control → debe ser lámina (A) o
   casi-cinemática (F). El juego se cuenta con láminas; el motor muestra hechos cortos.
3. **No animar el cuaderno** (PLAN_CINEMATICAS): la quietud de TIERRA es el personaje.
4. **No un segundo sistema de movimiento**: las piruetas, las trayectorias y el despiece
   son los verbos; el director solo los encadena.
5. **No timelines en código**: si una escena no puede escribirse en `data/cines.js`, falta
   un verbo — se agrega el verbo, no la excepción.
6. Video (D) solo Electron — el web tiene tope de 16 MB.

## 7. Divergencias *(completar durante la implementación)*

**Baseline de `npm run feel` (antes de C0):** 33 asserts, `FEEL: OK`. Verificado idéntico al cerrar
C0 — diff vacío contra el baseline guardado (la única diferencia era el PID del warning de node).

### Divergencias de C0

1. **El director se parte en DOS**, como `core/pulso.js` / `systems/pulso.js`: `core/cine.js` es el
   CALENDARIO (puro, sin dependencias, probado en `npm run unit`) y `systems/cine.js` el intérprete
   con efectos. No es simetría por gusto: `systems/cine.js` importa `moves.js` y `audio.js`, que
   tocan `document` y `AudioContext`, así que entero no se puede probar en node. Y una cinemática
   desfasada medio segundo **no da error** — sólo se ve mal, que es exactamente el tipo de cosa que
   tiene que poder verificarse sin abrir una ventana.

2. **Faltaba un mecanismo que el plan §4 no nombraba: las LIGADURAS `'$loQueSea'`.** El ejemplo del
   §4 tiene todos los valores escritos (`move: 'tonel'`, `radio: 'M07_SALIDA_030'`), pero el premio
   del PULSO necesita decir cosas que **sólo se saben jugando**: cuál pirueta se tecleó, qué tan
   grande es el estallido de la zona elegida, cuánto tarda en hundirse ESTE buque. Sin ligaduras,
   la mitad del premio se quedaba en código y C0 no cerraba. Las resuelve `core/cine.js` (`lig`) y
   las ata quien arranca la cinemática.

3. **Un beat cuyo instante queda sin ligar NO OCURRE.** Es la forma de escribir "esto pasa sólo a
   veces" sin un `if` adentro del intérprete: el segundo estallido de la santabárbara existe en la
   timeline y se agenda únicamente cuando la zona es la brava (`$tSec`); el rótulo SOLTAR, sólo
   cuando no hay ninguna pirueta aprendida (`$tSinPirueta`). Dos condicionales que habrían vivido
   en el motor viven en la data, que es la regla §6.5 llevada hasta el final.

4. **Siete verbos nuevos** — todos por la regla §6.5 («falta un verbo, no una excepción»), todos
   salidos de un beat del PULSO que no se podía escribir:
   - `parte: 'suelta'` — nombra el TRAMO vigente. Es lo que reemplaza al `Q.cine.beat`: los renders
     preguntan en qué tramo están y cuánto llevan (`tParte`) o cuánto va del tramo (`fParte`), y así
     dejan de tener copias de las duraciones.
   - `marca: 'sec'` — deja una marca con su instante. El render del segundo estallido dibuja "cuánto
     hace que voló la carga" sin que el director sepa qué es un estallido.
   - `sfx` / `beep` — el sonido. El `beep` de adentro del `sfx` es el **respaldo** de siempre para
     cuando la hoja no cargó (build web): la cinemática igual suena.
   - `rotulo: 'clave'` — una palabra en pantalla, **por clave de strings** (nunca texto crudo).
   - `limpiar: 'popups'` — la escena arranca con la pantalla limpia. Hace falta de verdad: los
     popups envejecen con el `dt` DEL MUNDO, y en tiempo dilatado 1,1 s de vida son trece segundos.
   - `fin: true` — el instante en que la timeline se terminó (señal `'done'`).

5. **`radio` y `scene` están implementados y probados, pero todavía no cableados al orquestador.**
   La timeline del premio no los usa, y no quise dejar plumbing muerto en `game.js` para probarlo:
   los emite el director y los cubre `npm run unit`. La primera timeline que encadene una lámina
   (C1/C4) es la que tiene que subir esas señales — `game.js` ya tiene `radioTramo(clave)` esperando.

6. **La CURVA es del dueño de la escena, no del director.** La timeline dice CUÁNDO empieza la
   agonía del buque y cuánto dura; cómo escora y se hunde lo sigue calculando `systems/pulso.js`,
   leyendo el avance 0..1 del tramo. Es el §6.4 aplicado dos veces: el director no vuela la pirueta
   (la vuela `moves.js`) y tampoco hunde el buque. Si mañana el hundimiento cambia de curva, la
   cinemática cambia con él sin que el director se entere.

7. **`data/cines.js` importa `data/pulso.js`** para derivar los instantes de las duraciones de cada
   compás en vez de escribirlos a mano. Es un import data→data (ya existían: `despiece`→`palette`,
   `campaigns`→`missions`) y evita el peor resultado posible de la migración: los mismos números en
   dos archivos, desincronizándose en silencio.

8. **Bug encontrado y corregido durante la migración:** la ventana de disparo es `(t0, t1]` —abierta
   abajo para que ningún beat suene dos veces— y con el reloj arrancando en 0 exacto, **todo lo que
   la timeline pide en `t: 0` caía afuera de la primera ventana y no ocurría nunca**. Se vio en el
   fixture: la cinemática componía `suelta → impacto → muerte`, sin pirueta. El reloj arranca en
   `-1e-6`. Hay un unit test que recorre una timeline entera a 60 Hz y cuenta que cada beat suene
   exactamente una vez.

9. **`render/cine.js` es lo ÚNICO que el director dibuja**: las bandas negras y su fundido. Todo lo
   demás de una cinemática lo dibuja el dueño de la escena — el buque muriendo lo pinta quien es
   dueño del buque. El fundido del director va **antes** del de misión: son dos cosas distintas
   (uno es de la escena, el otro del cambio de pantalla) y el de misión tiene que poder taparlo.

10. **El snapshot del director entra por parámetro** a `drawPulso` (convención 4 de ARQUITECTURA),
    no importando `systems/cine.js` desde el render. Por eso `state()` publica también `tParte`,
    `fParte` y las marcas: si el render tuviera que derivarlas, volvería a necesitar el sistema.

11. **Menú CINEMÁTICAS** (pedido del 17/8, fuera de las fases del plan): una fila propia del menú
    principal, justo debajo de PRUEBAS, con la misma mecánica —título y detalle por fila, ENTER
    reproduce, ESC vuelve al catálogo— y compartiendo con ella `S.test`, `testBack`, la api de
    verbos y el neutro de las sondas pegajosas. **La lista no se escribe: se deriva de `CINES`**
    (`cinematicas()`), así que una timeline nueva aparece sola; lo que cada una declara para poder
    mirarse suelta es su `ver(a)`, al lado de sus beats. Sonda gemela: `__cine(id)`.
    - Hizo falta **una sonda nueva**, por la regla de oro de PRUEBAS: `__qgana(zona)`, que gana la
      prueba del PULSO ya mismo — mirar el premio no puede depender de que el que mira acierte una
      secuencia cuyo margen es de décimas.
    - Y destapó **un bug que ya estaba**: `pruebasApi().pulso` no cargaba la libreta del Pichón (lo
      hace `abrirMision`, y este verbo no pasa por ahí), así que EL PULSO abierto desde una
      herramienta armaba su examen con la libreta VACÍA — secuencias de un solo `Z`, sin una sola
      pirueta. El momento «EL PULSO» de PRUEBAS mostraba otro juego que el que se juega. Arreglado
      en el verbo, que es la puerta común a las dos herramientas.
    - `a.luego()` **no sirve adentro del PULSO**: cuenta con el reloj del MUNDO, que ahí corre al
      8% — medio segundo de espera eran seis de reloj de pared. No hizo falta: la prueba queda
      armada en el mismo instante en que se entra.
    - El selector de modos pasó a SIETE filas y la descripción de SALIR se salía de pantalla:
      `MODE_ROWS` a `y0 72 / rh 29` (la misma cuenta que ya se había hecho con JUEGO RÁPIDO).

12. **El verbo `cam` se cableó, y el premio quedó en DOS PLANOS** (pedido del 17/8: *"¿por qué en
    primera persona y no en tercera?"*). La respuesta honesta era que el premio **heredó** la cámara
    de la prueba, no que alguien la eligiera. Se probaron las tres versiones mirando:
    - **toda cabina**: la pirueta no se ve — se lee como un horizonte que gira, y sólo si el jugador
      no tiene `cfg.horizon` en FIJO.
    - **toda tercera**: la pirueta se ve salir (el sprite tiene sus nueve alabeos horneados y el
      rótulo de la maniobra, que la cabina tapaba, queda a la vista), pero en la muerte el tercio de
      abajo del cuadro es mar vacío: lo que hace que el buque domine es que la cabina llena el resto.
    - **el corte en la suelta** ← el que quedó. Dos beats `cam` en la timeline, y el corte cae en el
      único lugar donde se lee como intención.
    Lo que costó: `hzMode()` tuvo que incluir `'pulso'` (sin eso `hzSprite()` no compensaba y la
    pirueta giraba dos veces — el avión por su lado y el mundo al revés), el mundo pasó a inclinarse
    por `pulso.camRoll()` en vez de sumarlo a `hzWorld()`, y en tercera no se dibujan ni el canopy ni
    la sal (son dispositivos de primera persona). La ristra, además, **sale del avión** en tercera y
    del borde del cuadro en cabina.
    - Sonda nueva: `__ccam(modo)`, pegajosa (pisa lo que pida la timeline, también los beats que aún
      no ocurrieron): elegir cámara es una decisión que se toma mirando, y mirar dos versiones no
      puede costar dos compilaciones.
    - **La esquina sin pintar** que destapa un rolido grande en tercera **no la trae la cámara**: es
      lo que el PASILLO ya muestra en cada tonel (`SEA3D_FLIGHT` está en `false`, así que el mundo es
      2D y su cielo/mar se pintan con ±70 px de margen). Verificado con una captura de un tonel en
      vuelo normal, al lado.

13. **Segundo bug destapado por mirar el premio suelto:** con R3 del rescate de la PASADA, el pasillo
    dibuja el buque **de proa** cuando el clímax declarado de la misión es `'pasada'` — y en ese
    camino `drawApproachBarge` sale antes de publicar su geometría. EL PULSO se quedaba **sin buque
    que hundir**: sin fuego, sin humo y sin el crecimiento del premio. Pasa sólo por las puertas de
    herramienta (se entra al PULSO en una misión cuyo clímax declarado es la PASADA), pero el arreglo
    es del orquestador: adentro de `'pulso'` nunca va de proa, porque la prueba apunta al casco
    lateral. El fixture no lo veía porque mide `shipFx()` —del sistema— y no píxeles.

14. **El PULSO perdió su reloj propio.** `Q.cine` (con su `beat`, su `tot` y su `sec`) desapareció;
    la sonda `__qdbg` sigue informando lo mismo pero leyéndolo del director, y el director tiene la
    suya (`__cdbg`, marcada QUITAR). Sesenta líneas de máquina de estados menos en el sistema.
