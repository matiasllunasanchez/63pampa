# PLAN — TUTORIAL (modo básico arriba de HISTORIA)

17/11/2026, pedido del autor: "un modo más arriba de historia que sea solo una misión de tutorial, bien
BÁSICA, que explique lo básico… 3 etapas… usar a Pichón y Tano [era EL TURCO]… dinámica maestro-alumno que choca y da
risa… usar la pausa y mostrar o marcar cosas, además de los diálogos en juego".

Estado: **fases 1 a 5 hechas** (18/11). Fase 5: la etapa 3 sobre un CASCO DE PRÁCTICA (desarmado, pasadas
ilimitadas): tonel con el ritual cómico, la bomba (soltar y pegar), la vuelta, la pausa guiada en PIRUETAS,
la aproximación con el tren y el aterrizaje; la etapa 1 suma la pausa guiada en CONTROLES. Pasos con
`cuando` (esperan un momento del vuelo) y `abre` (la pausa sola en una pestaña). Fila TREN en CONTROLES.
La Chancha no entra (sin nafta no hay qué cargar). El tren va en ✕ (A) del joystick durante la aproximación, que antes no se podía volar con mando (18/11).
Fase 4: Fase 4: blancos de práctica (`sembrarPractica` en `systems/spawn.js`)
con anillo y flecha encima, y la etapa 2 sobre el mar: cañón (3 globos), el calor (trabarlo y dejarlo
enfriar), globos que se mueven y un Harrier de práctica que vuela derecho y no tira. El A-4B no lleva
misiles aire-aire y la media vuelta es del 3D: esos dos pasos del plan no entran. Antes, fases 1 a 3 (17/11). Fase 3: el despegue jugable (`core/despegue.js`, `DESPEGUE` en
`data/tuning.js`, perilla `despegueJugable` de la misión): gas a fondo levanta a los ~150 m de 205 útiles;
soltarlo 2 s o darle a toques deja sin pista y se vuelve a la cabecera con una línea del Turco o el Pichón. Fase 2: el motor de pasos (`systems/tutorial.js`), la etapa 1 con
sus diez pasos (sin despegue jugable todavía), la consigna arriba y `npm run tutorial`. El "punto de
control" es la perilla `sinMuerte` de M1: un choque pega en la chapa y lo comenta el Turco o el Pichón,
sin rebobinar. Fase 1: la fila TUTORIAL, el menú de etapas y las tres etapas como tramos de
vuelo vacíos (`data/tutorial.js`, `core/tutorial_hecho.js`, `abrirTutorial` en `game.js`). El orden de trabajo está en §6 y las decisiones en §7.

---

## 1. Qué es

- Una fila nueva **TUTORIAL** en el menú de modos, **arriba de HISTORIA**:
  `TUTORIAL · HISTORIA · JUEGO RÁPIDO · OPCIONES · SALIR`.
- Es **una sola misión con 3 etapas**. Cada etapa dura 2–3 minutos y se puede elegir suelta una vez
  hecha (sub-menú ETAPA 1 · 2 · 3).
- **No se pierde.** Si chocás, volvés al último punto de control con una línea del Turco o de Pichón.
- **Semilla fija** (`sembrarAzar('tutorial/<etapa>')`): siempre las mismas olas, pájaros y blancos.
- **Primera vez:** el cursor del menú arranca en TUTORIAL. Ya hecho, arranca en HISTORIA y TUTORIAL
  lleva una marca de visto.
- **Se puede saltear:** la pausa suma la fila SALTEAR ETAPA.
- **Al terminar las 3 etapas** se puede jugar cada una suelta.

## 2. Los personajes y el chiste

Decidido por el autor el 17/11:

- **Vuela ESTEBAN** (Tero) en el **A-4B**, **solo**: el tutorial no tiene escuadrilla.
- **El Turco y Pichón son voces EXTERNAS:** hablan por radio desde tierra (el hangar y la torre), no vuelan.
  Salen en el recuadro de radio y en las pausas, cada uno con su retrato.
- **El Turco y Pichón se reparten las explicaciones:**

| Quién | Explica | Cómo |
|---|---|---|
| **PICHÓN** | Lo de piloto: volar, altura y radar, esquivar, piruetas, bombardear, aterrizar | Leyó el manual entero: cita páginas y números exactos |
| **EL TURCO** | Lo de la UI, las partes mecánicas y los controles: tablero, relojes, gas, nafta, salud, armas, pausa, teclas | Mecánico de oficio: "eso se arregla con un golpe", anécdotas de hangar |

### La dinámica entre el Turco y el Pichón

Sale del canon (`docs/historia/GUION_3.md`), no se inventa:

- **El Turco** es el suboficial Miguel Salomón, mecánico jefe. Tucumano ("changuito", "m'hijo",
  "esto no lo levanta ni Alá"), de pocas palabras, desconfía de todo lo que no se toca con la mano.
- **El Pichón** es el alférez Tomás Rivas, 22 años, superdotado e inocente. Habla de más, con
  entusiasmo, y siempre tiene una observación. Probablemente hubiera sido mejor ingeniero que piloto
  (se ve, no se dice).

**El ritual cómico** es el mismo de la campaña: el Pichón propone, el Turco lo frena
("Pibe, eso no se puede") y, después de una pausa, cede ("…A ver. Mostrame"). Si sale bien, el Turco
se queda con la mitad del mérito. Si sale mal, el Turco tenía razón y lo dice.

**Aplicado al tutorial:**

- **El Pichón explica de más** lo de piloto: la teoría, el porqué y el dato exacto. Se va por las
  ramas y el Turco lo corta.
- **El Turco explica de menos** lo de la máquina: el tablero, el gas, las armas, las teclas. Va al
  grano con una frase seca, y casi siempre con razón.
- **Los dos se pisan.** El Pichón le corrige un reloj al Turco con el manual ("en realidad la aguja
  tiene un retraso de…"). El Turco le mete una frase de vuelo al Pichón con una anécdota de hangar
  que no viene al caso.
- **Los errores de Esteban** son la excusa para la pelea: cada choque o mala maniobra lo explica
  cada uno a su manera, y ninguno le pregunta a Esteban.
- **Ternura de fondo:** el Turco lo trata de "changuito", pero lo escucha. El chiste nunca deja mal
  parado al Pichón: el que queda en ridículo es el ego del Turco.

**Ninguno nombra una tecla:** la regla de las lecciones de M1 se mantiene. Las teclas las pone el
juego (teclado o joystick, según lo que esté conectado).

Ejemplos del tono (borrador, la prosa espera el OK del autor):

- **PICHÓN:** Sin empuje el avión cae, Tero. La sustentación depende del cuadrado de la velocidad,
  así que si la velocidad baja a la mitad…
  **EL TURCO:** Gas, m'hijo. Si no le das gas, se cae. Listo.
- **PICHÓN:** Ojo con la poscombustión, que el consumo se va a más del triple.
  **EL TURCO:** Por eso el reloj de nafta está al lado. Miralo, que no lo puse de adorno.
  **PICHÓN:** No lo puso usted, viene de fábrica.
  **EL TURCO:** Lo ajusté yo, changuito.
- **EL TURCO** (cuando Esteban choca): El viento.
  **PICHÓN:** No había viento, Turco.
  **EL TURCO:** Había un poquito.
- **PICHÓN:** Hay una maniobra, el tonel, que con este avión debería salir fácil…
  **EL TURCO:** Pibe, eso no se puede. *(pausa)* …A ver. Hacelo, Tero.
  *(Esteban hace el tonel)*
  **EL TURCO:** Lo que yo decía.

## 3. Cómo es un paso

El tutorial es una lista de **pasos**, agrupados en 3 etapas. Todos tienen la misma forma:

1. **Pausa (si hace falta).** El juego se congela con velo. Queda sin velo lo que se explica (un reloj
   del HUD o una cosa del mundo marcada con un anillo). El Pichón y el Turco dicen **de 1 a 3 líneas**,
   y abajo aparecen las teclas del paso (teclado o joystick).
2. **Práctica.** Se suelta el juego y el jugador hace lo que se pidió. Arriba queda un cartelito con
   la consigna corta ("SUBÍ ARRIBA DE 200 M") y un tilde cuando se cumple.
3. **Remate.** Una línea corta por radio, sin pausa: el Turco o el Pichón comentan cómo salió.
4. **Si sale mal** (choque, pasarse del tiempo): vuelve al inicio del paso, no de la etapa, con un
   chiste de los dos. No hay pantalla de derribo ni se pierde nada.

Reglas para que no aburra:

- **Nunca más de 3 líneas por pausa.** Si hay más para decir, se parte en dos pasos.
- **Primero se hace, después se explica lo de reojo.** Los pasos de "solo mirar" (un reloj) van
  pegados a uno de práctica, nunca dos seguidos.
- **Cada etapa dura entre 2 y 3 minutos** volándola bien.
- **Las etapas se juegan sueltas** una vez hechas (sub-menú del TUTORIAL: ETAPA 1 · 2 · 3 · ATRÁS).

En datos (`data/tutorial.js`), un paso se escribe así (borrador):

```js
{ id: 'T1_ALTURA', dice: 'TUT_ALTURA',            // escena de data/story.js (varias líneas)
  foco: ['alt'], teclas: ['Fly', 'Dive'],          // lo que se muestra en la pausa
  consigna: 'tutConsignaAltura',                   // el cartelito de arriba
  sigue: [{ alt: '>200' }, { alt: '<60' }],        // en orden: primero subir, después bajar
  remate: 'TUT_ALTURA_OK', falla: 'TUT_CHOQUE' }
```

## 4. Las tres etapas, paso por paso

En cada tabla: **quién** explica (P = Pichón, T = Turco), **foco** (lo que queda sin velo), **teclas**
(filas de la tabla de CONTROLES) y **sigue cuando** (la condición para pasar al siguiente).

### ETAPA 1 — DESPEGAR Y VOLAR (Río Gallegos → mar abierto, sin enemigos)

Objetivo: que el jugador sepa mantener el avión en el aire, bajo el radar, sin tocar el agua.

| # | Paso | Quién | Foco | Teclas | Sigue cuando |
|---|---|---|---|---|---|
| 1.1 | **Presentación** en la pista, motor en marcha. Se presentan los dos y se pelean por quién enseña. | T + P | — | — | Cualquier tecla |
| 1.2 | **El gas.** T: "esta palanca es la que importa". | T | `gas` | Gas | Gas arriba del 80% |
| 1.3 | **La carrera y la rotación** (despegue jugable): la velocidad sube con el gas; en la marca, tirar de la nariz. | P | `vel` + marca en el fin de pista | Fly | En el aire antes del fin de pista |
| 1.4 | **Subir y bajar.** P explica por qué el avión cae sin velocidad. | P | `alt` | Fly, Dive | Pasa los 200 m y vuelve abajo de 60 m |
| 1.5 | **El radar y el agua.** P: abajo del techo no te ven; T: más abajo, el mar te come. | P + T | `alt` + marca en el agua | — | 10 s abajo del techo sin tocar el agua |
| 1.6 | **El tablero** (de reojo): velocidad, horizonte, altura, gas. | T | `vel`, `horizonte`, `alt`, `gas` | — | Cualquier tecla |
| 1.7 | **Rolar y mirar.** | P | `horizonte` | Roll, Pan | Rola a los dos lados |
| 1.8 | **Esquivar.** Entran olas y pájaros (semilla fija). | P | Marca en la primera ola | Fly | Pasa 6 obstáculos |
| 1.9 | **Poscombustión y freno.** P da el consumo exacto; T señala la nafta. | P + T | `vel`, `nafta` | Boost, Brake | Usa las dos |
| 1.10 | **La ruta.** Lo que falta hasta el objetivo. | T | `ruta` | — | Llega al final del tramo |
| 1.11 | **La pausa** (pausa guionada): el juego abre la pausa sola y marca CONTROLES. T: "acá está todo, por si te olvidás". | T | Fila CONTROLES | Pause | Entra a CONTROLES, cambia de pestaña y vuelve |

### ETAPA 2 — PELEAR (costa, blancos fijos y un Harrier de práctica)

Objetivo: disparar, apuntar y entender que el cañón calienta y el misil se gasta.

| # | Paso | Quién | Foco | Teclas | Sigue cuando |
|---|---|---|---|---|---|
| 2.1 | **El cañón.** T: "esto lo cargué yo, no lo desperdicies". | T | `canon` + marca en las boyas | Gun | Rompe 3 boyas |
| 2.2 | **El calor.** Si tirás de corrido se traba; P explica por qué. | P | `canon` | — | Deja enfriar una vez después de calentarlo |
| 2.3 | **Apuntar.** | T | Marca en el blanco | Aim | Rompe 2 blancos más apuntando |
| 2.4 | **El misil y el rack.** P: "son pocos, contalos". | P | `rack` | Msl | Pega un misil |
| 2.5 | **El Harrier de práctica** (no dispara, vuela recto). | P | Marca en el Harrier | — | Lo derriba |
| 2.6 | **Media vuelta.** | P | — | Turn | La usa una vez |
| 2.7 | **Salud y nafta**: qué te saca un golpe y qué te gasta volar. T: "si se pone roja, volvé". | T | `salud`, `nafta` | — | Cualquier tecla |
| 2.8 | **Tanques y secundario.** T: "si te persiguen, largás peso". | T | `rack` | Tanques, Secund | Suelta los tanques |

### ETAPA 3 — LA PASADA Y LA VUELTA (un buque con AA floja → regreso a la base)

Objetivo: bombardear bien, esquivar con una pirueta, reabastecer y aterrizar.

| # | Paso | Quién | Foco | Teclas | Sigue cuando |
|---|---|---|---|---|---|
| 3.1 | **El blanco.** Aparece el buque. P explica la aproximación rasante. | P | Marca en el buque | — | Cualquier tecla |
| 3.2 | **La bomba y la espoleta:** soltarla alta y temprano, que caiga más de 1 s. | P | `alt`, `rack` | Secund | Suelta una bomba |
| 3.3 | **Si erraste:** P explica qué falló (corta, larga, no armó); se da otra pasada. | P | — | — | Vuelve a estar en posición |
| 3.4 | **El tonel** para esquivar la AA: el ritual cómico ("Pibe, eso no se puede… A ver"). | P + T | Marca en la primera bala de AA | Tonel | Hace un tonel |
| 3.5 | **Pegarle al buque.** | P | Marca en el buque | Secund | Le pega una bomba |
| 3.6 | **La Chancha:** reabastecer en la vuelta. T: "la Chancha es como mi señora, viene cuando quiere". | T | `chancha`, `nafta` | Chancha | La llama y carga |
| 3.7 | **La aproximación.** Bajar el gas, alinear con la pista. | P | `vel`, `alt`, `gas` | Gas, Dive | Entra a la aproximación final |
| 3.8 | **El tren.** T: "sin tren, la panza la pagás vos". | T | — | (fila nueva TREN) | Baja el tren |
| 3.9 | **Tocar.** Velocidad y régimen de descenso justos. | P | `vel`, `alt` | — | Toca la pista entero |
| 3.10 | **Cierre en la pausa:** abre CONTROLES → PIRUETAS. P: "acá están las otras dieciocho". T: "ni las mires". | P + T | Pestaña PIRUETAS | — | Cierra |
| 3.11 | **Despedida** en la pista: el Turco pinta la estrellita en el fuselaje. | T + P | — | — | Vuelve al menú con TUTORIAL ✓ |

**Afuera a propósito** (se descubren jugando): escuadrilla y cambio de piloto (Esteban vuela solo),
Pips, Tempo, Cam, Chapitas, las 18 piruetas restantes y fallas.

## 5. Lo que hay hoy y lo que falta

**Ya existe** (lecciones de M1, `data/missions.js` campo `lecciones` y `stepLecciones` en `game.js`):

- Pausa con velo y huecos de foco (`zonaHud`, en `render/hud.js`).
- Teclas sacadas de la tabla de controles, según teclado o joystick.
- Retrato y radio (`core/voz.js`), y las caras del Turco y del Pichón.
- Semillas fijas (`core/azar.js`).
- La pantalla CONTROLES con pestañas (`drawControles`).
- El aterrizaje jugable (estado `landing`). El despegue hoy es **automático** (`toT` en `game.js`).

**Falta:**

| # | Pieza | Dónde | Notas |
|---|---|---|---|
| A | El modo `tutorial` en `MODES`, la fila del menú, el sub-menú de etapas y sus textos | `game.js`, `menus.js`, `strings.js` | El cursor arranca en TUTORIAL la primera vez |
| B | **Pasos por condición** (`sigue`): altura, gas, tecla usada, maniobra hecha, blancos rotos, llegar a un estado | `data/tutorial.js` (dato) + `systems/tutorial.js` (motor) | El motor lee lo que el juego ya lleva (`plane.y`, `run.dist`, maniobras, derribos) |
| C | **Diálogo de varias líneas en una pausa** (Turco ↔ Pichón) | Lecciones / radio | Hoy una lección dice solo `sc.lineas[0]` |
| D | **Consigna y tilde** arriba de la pantalla durante la práctica | `render/` | Fuera del velo, no pisa la ruta |
| E | **Marca sobre el MUNDO** (ola, boya, Harrier, buque, bala, fin de pista) | `render/` (anillo y flecha mundo→pantalla) | Hoy el foco solo conoce zonas del HUD |
| F | **Pausa guionada:** abrir la pausa, resaltar una fila o pestaña y esperar que el jugador la use | `game.js` (`pauseView`, `ctrlTab`) | Reusa la pantalla CONTROLES nueva |
| G | **Punto de control sin derrota:** al chocar, volver al inicio del paso con un chiste | `game.js` (reset parcial) | Sin pantalla de derribo |
| H | Blancos "de práctica": boyas, un Harrier que no dispara, AA floja | `data/` (config de la etapa) | Por dato, sin sistemas nuevos si alcanza |
| I | **Despegue con gas:** la carrera acelera según el gas y la rotación tiene una ventana (lento: no levanta; tarde: se acaba la pista) | Despegue en `game.js` → `systems/` | Sirve también para la campaña |
| J | Fila **TREN** en la tabla de CONTROLES | `strings.js`, `data/controles.js` | Hoy el tren no figura |
| K | Guardado: `tutorialHecho` y etapas vistas; SALTEAR ETAPA en la pausa | `core/state.js`, `game.js` | |
| L | Fixture `npm run tutorial`: recorre las 3 etapas por teclas y verifica cada condición | `tools/fixture_tutorial.js` | Entra en `npm run check` |
| M | **Aviones bloqueados en el selector:** A-4B solo, el resto en gris con candado | `game.js`, `menus.js` | HECHO para PATRIA y CICLO en prod (17/11). El tutorial no tiene selector |

## 6. Orden de trabajo

Cada fase deja el juego jugable y `npm run check` verde, y termina con algo que se puede probar.

| Fase | Qué se hace | Piezas | Para probar al final |
|---|---|---|---|
| **1. Esqueleto** ✓ | La fila TUTORIAL, el sub-menú y una etapa que despega (automático), vuela un tramo vacío y vuelve al menú | A, K | Entrar desde el menú, volar, volver con el tilde |
| **2. Motor de pasos** ✓ | Pasos por condición, diálogo de varias líneas, consigna y punto de control. Etapa 1 completa (sin despegue jugable) con texto provisorio | B, C, D, G, L | Hacer la etapa 1 entera; chocar a propósito y ver que vuelve al paso |
| **3. Despegue jugable** ✓ | La carrera con gas y la rotación. Paso 1.3 | I | Despegar bien, quedarse corto y pasarse |
| **4. Marcas y pelea** ✓ | Marcas sobre el mundo, blancos de práctica. Etapa 2 | E, H | Hacer la etapa 2 entera |
| **5. Pasada y vuelta** ✓ | Pausa guionada, fila TREN. Etapa 3 con aterrizaje y cierre en PIRUETAS | F, J | Hacer la etapa 3 entera, aterrizar |
| **6. Prosa y ritmo** | El texto final (con OK del autor), cronometrar cada etapa (2–3 min), capturas | — | Las 3 etapas de punta a punta |

## 7. Decisiones

**Cerradas** (17/11):

- Vuela **Esteban** en el **A-4B**.
- **Pichón** explica lo de piloto; **el Turco**, la UI, la mecánica y los controles.
- La fila se llama **TUTORIAL** y el contenido es **básico**.
- El Turco y Pichón hablan desde tierra. El segundo personaje es **EL TURCO**, con sus retratos `turco_*`
  (el autor dijo "Tano" y era el Turco).
- **Entran despegue y aterrizaje**, con el gas como mecánica jugable en los dos.

**Abiertas:**

1. **Las lecciones de M1.** Con el tutorial, la campaña puede alivianar las suyas o dejarlas como
   están.
