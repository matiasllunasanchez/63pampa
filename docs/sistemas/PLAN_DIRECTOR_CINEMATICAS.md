# PLAN — EL DIRECTOR: cómo generar cinemáticas (vuelos, sacrificios, épica) con lo que hay

> **Estado: análisis de opciones + recomendación + plan por fases, sin implementar (16/8).**
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
| **C0 · El director mínimo** | `systems/cine.js` + `data/cines.js`: timeline por beats con los verbos `tempo`, `control`, `move`, `fx`, `radio`, `fade`, `letterbox`, `cam:'cabina'/'chase'`; señales de fin (`'done'`) — nunca llama arriba. **El premio del PULSO migrado** como primer timeline | `npm run pulso` sigue verde con la cinemática en data; `feel` idéntico |
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

- *(vacío)*
