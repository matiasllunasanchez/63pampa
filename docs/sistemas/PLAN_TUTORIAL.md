# PLAN — TUTORIAL (modo básico arriba de HISTORIA)

17/11/2026, pedido del autor: "un modo más arriba de historia que sea solo una misión de tutorial, bien
BÁSICA, que explique lo básico… 3 etapas… usar a Pichón y Tano… dinámica maestro-alumno que choca y da
risa… usar la pausa y mostrar o marcar cosas, además de los diálogos en juego".

Estado: **plan, sin código**. Las decisiones abiertas están al final.

---

## 1. Qué es

- Una fila nueva **TUTORIAL** en el menú de modos, **arriba de HISTORIA**:
  `TUTORIAL · HISTORIA · JUEGO RÁPIDO · OPCIONES · SALIR`.
- Es **una sola misión con 3 etapas**. Cada etapa dura 2–3 minutos y se puede elegir suelta una vez
  hecha.
- **No se pierde.** Si chocás, volvés al último punto de control con una línea de Tano o de Pichón.
- **Semilla fija** (`sembrarAzar('tutorial/<etapa>')`): siempre las mismas olas, pájaros y blancos.
- **Primera vez:** el cursor del menú arranca en TUTORIAL. Ya hecho, arranca en HISTORIA y TUTORIAL
  lleva una marca de visto.
- **Se puede saltear:** la pausa suma la fila SALTEAR ETAPA.

## 2. Los personajes y el chiste

Decidido por el autor el 17/11:

- **Vuela ESTEBAN** (Tero) en el **A-4B**.
- **Tano y Pichón se reparten las explicaciones:**

| Quién | Explica | Cómo |
|---|---|---|
| **PICHÓN** | Lo de piloto: volar, altura y radar, esquivar, piruetas, bombardear, aterrizar | Leyó el manual entero: cita páginas y números exactos |
| **TANO** | Lo de la UI, las partes mecánicas y los controles: tablero, relojes, gas, nafta, salud, armas, pausa, teclas | Mecánico de oficio: "eso se arregla con un golpe", anécdotas de hangar |

**El motor del humor:** los dos se creen el instructor de Esteban y se meten en el tema del otro.

- Tano opina de vuelo con una anécdota que no viene al caso.
- Pichón corrige un reloj con el dato del manual, y Tano le contesta que el manual no lo arma nadie.

Esteban casi no habla: cuando lo hace, es el que tiene los pies en la tierra.

**Ninguno nombra una tecla:** la regla de las lecciones de M1 se mantiene. Las teclas las pone el
juego (teclado o joystick, según lo que esté conectado).

Ejemplos del tono (borrador, la prosa espera el OK del autor):

- **PICHÓN:** Sin empuje, el avión cae. Página 14.
  **TANO:** Y el gas es esta palanca, que la ajusté yo. Si se traba, golpecito.
  **PICHÓN:** No le diga que le pegue al avión.
- **PICHÓN:** La poscombustión consume 3,4 veces más combustible.
  **TANO:** Por eso el reloj de nafta está al lado. Miralo, Tero, que no es decorativo.
- **TANO** (cuando Esteban choca): Eso fue el viento.
  **PICHÓN:** No había viento.
  **TANO:** Fue el viento, Pichón.
- **PICHÓN** (al primer tonel bien hecho): ¡Salió! Como en la página 112.
  **TANO:** Yo esa la hacía con el carrito de las herramientas.

## 3. Las tres etapas

En cada paso:

- **Foco:** lo que queda sin velo durante la pausa.
- **Teclas:** filas de `ctrl*` que se muestran.
- **Sigue cuando:** la condición que el jugador tiene que cumplir para avanzar. Es lo nuevo; hoy las
  lecciones avanzan solo por distancia.

### ETAPA 1 — VOLAR (mar abierto, sin enemigos)

| # | Qué se enseña | Foco | Teclas | Sigue cuando |
|---|---|---|---|---|
| 1 | Bienvenida y presentación del chiste (en la pista) | — (pausa con los dos) | — | Aprieta cualquier tecla |
| 2 | **Despegue jugable:** subir el gas de a poco en la carrera y levantar la nariz a la velocidad justa | `gas`, `vel` | Gas, Fly | Despega sin rozar el final de la pista |
| 3 | Subir y bajar, el reloj de altura | `alt` | Fly, Dive | Pasa por arriba de 200 m y vuelve abajo de 60 m |
| 4 | El agua mata y el radar ve arriba del techo | `alt` + marca en el agua | — | Vuela 10 s abajo del techo sin tocar el agua |
| 5 | Velocidad, horizonte y "lo de reojo" | `vel`, `horizonte` | — | Aprieta cualquier tecla |
| 6 | Rolar y mirar | `horizonte` | Roll, Pan | Rola a los dos lados |
| 7 | Esquivar olas y pájaros | Marca en la primera ola | — | Pasa 5 obstáculos |
| 8 | Poscombustión y freno | `vel`, `nafta` | Boost, Brake | Usa las dos |
| 9 | La ruta y el objetivo | `ruta` | — | Llega al final del tramo |
| 10 | **La pausa** (pausa guionada) | Fila CONTROLES | Pause | Abre CONTROLES y vuelve |

### ETAPA 2 — PELEAR (costa, blancos fijos y un Harrier lento)

| # | Qué se enseña | Foco | Teclas | Sigue cuando |
|---|---|---|---|---|
| 1 | El cañón y su calor | `canon` | Gun | Rompe 3 boyas |
| 2 | Apuntar | Marca en el blanco | Aim | Rompe 2 más apuntando |
| 3 | El misil (el rack) | `rack` | Msl | Pega un misil |
| 4 | Un Harrier lento, sin disparar | Marca en el Harrier | — | Lo derriba |
| 5 | Media vuelta | — | Turn | La usa una vez |
| 6 | Salud y nafta: qué te sacan y qué te gasta | `salud`, `nafta` | — | Aprieta cualquier tecla |
| 7 | Tanques y secundario | `rack` | Tanques, Secund | Suelta los tanques |

### ETAPA 3 — LA PASADA (un buque con AA floja)

| # | Qué se enseña | Foco | Teclas | Sigue cuando |
|---|---|---|---|---|
| 1 | La escuadrilla en el HUD | Escuadrón | — | Aprieta cualquier tecla |
| 2 | La bomba y la espoleta (caer más de 1 s) | `alt`, `rack` + marca en el buque | — | Suelta una bomba |
| 3 | Errar no es derribo: pasa el siguiente | Escuadrón | Cambio | Pasa el turno a otro |
| 4 | Tonel para esquivar | Marca en la primera bala de AA | Tonel | Hace un tonel |
| 5 | Pegarle al buque | Marca en el buque | — | Le pega una bomba |
| 6 | La Chancha (reabastecer) | `chancha` | Chancha | La llama |
| 7 | **Aterrizaje:** la vuelta, el tren, cortar gas, velocidad y régimen de descenso | `vel`, `alt`, `gas` | Gas (+ fila nueva TREN en la tabla) | Toca la pista entero |
| 8 | **Cierre en la pausa:** abre CONTROLES → PIRUETAS. Pichón: "acá están las otras dieciocho". Tano: "ni las mires". | Pestaña PIRUETAS | — | Cierra |

**Afuera a propósito** (se descubren jugando): Pips, Tempo, Cam, Chapitas, las 18 piruetas restantes
y fallas.

## 4. Lo que hay hoy y lo que falta

**Ya existe** (lecciones de M1, `data/missions.js` campo `lecciones` y `stepLecciones` en `game.js`):

- Pausa con velo y huecos de foco (`zonaHud`, en `render/hud.js`).
- Teclas sacadas de la tabla de controles, según teclado o joystick.
- Retrato y radio.
- Semillas fijas (`core/azar.js`).
- La pantalla CONTROLES con pestañas (`drawControles`).

**Falta:**

| # | Pieza | Dónde | Notas |
|---|---|---|---|
| A | El modo `tutorial` en `MODES`, la fila del menú y su texto | `game.js`, `menus.js`, `strings.js` | El cursor arranca en TUTORIAL la primera vez |
| B | **Pasos por condición** (`sigue: { alt: '>200' }`, `{ hacer: 'tonel' }`, `{ romper: 3 }`…) | `data/tutorial.js` (dato) + `systems/tutorial.js` (motor) | Las lecciones de hoy solo avanzan por distancia. El motor lee contadores que el juego ya lleva, sin nuevos dentro de los sistemas |
| C | **Diálogo de varias líneas en una pausa** (Tano ↔ Pichón) | `stepLecciones` / radio | Hoy una lección dice solo `sc.lineas[0]` |
| D | **Marca sobre el MUNDO** (ola, blanco, Harrier, buque, bala) | `render/` (anillo y flecha mundo→pantalla) | Hoy el foco solo conoce zonas del HUD |
| E | **Pausa guionada:** abrir la pausa, resaltar una fila o pestaña y esperar que el jugador la use | `game.js` (`pauseView`, `ctrlTab`) | Reusa la pantalla CONTROLES nueva |
| F | **Punto de control sin derrota:** al chocar, volver al inicio del paso con línea de chiste | `game.js` (reset parcial) | Sin pantalla de derribo |
| G | Enemigos "de práctica": boyas, un Harrier que no dispara, AA floja | `data/` (config de la etapa) | Por dato, sin sistemas nuevos si alcanza |
| H | Guardado: `tutorialHecho` y etapas vistas | `core/state.js` | |
| I | SALTEAR ETAPA en la pausa | `game.js` | |
| K | **Despegue con gas:** carrera en pista donde el gas decide la aceleración y la rotación tiene una ventana (lento: no levanta; tarde: se acaba la pista) | `core/` + `systems/` del despegue | El aterrizaje ya es jugable; el despegue hoy es automático. Sirve para la campaña también |
| L | **Aviones bloqueados en el selector:** A-4B solo, el resto en gris con candado | `game.js`, `menus.js` | HECHO para PATRIA y CICLO en prod (17/11). El tutorial no muestra selector: vuela el A-4B |
| J | Fixture `npm run tutorial`: recorre las 3 etapas por teclas y verifica cada condición | `tools/fixture_tutorial.js` | Entra en `npm run check` |

## 5. Orden de trabajo

1. **Esqueleto:** pieza A más una etapa vacía que despega y termina. Se ve en el menú.
2. **Motor:** piezas B, C y F. Etapa 1 completa con texto provisorio, más el fixture.
3. **Marcas:** piezas D y G. Etapa 2.
4. **Pausa y pista:** piezas E y K. Etapa 3, el aterrizaje y el cierre en PIRUETAS; el despegue
   jugable entra en la etapa 1.
5. **Cierre:** piezas H e I, prosa final del autor, ritmo (que ninguna etapa pase de 3 min) y
   capturas en survival (las lecciones ponen velo).

Cada fase deja el juego jugable y `npm run check` verde.

## 6. Decisiones

**Cerradas** (17/11):

- Vuela **Esteban** en el **A-4B**.
- **Pichón** explica lo de piloto; **Tano**, la UI, la mecánica y los controles.
- La fila se llama **TUTORIAL** y el contenido es **básico**.
- **Entran despegue y aterrizaje**, con el gas como mecánica jugable en los dos.

**Abiertas:**

1. **La cara de TANO.** Hoy TANO es un piloto general con las caras de **Tero**, que son las de
   **Esteban**. Con Esteban volando, Tano y él tendrían la misma cara. Hace falta un retrato propio
   para Tano.
2. **Las lecciones de M1.** Con el tutorial, la campaña puede alivianar las suyas o dejarlas como
   están.
