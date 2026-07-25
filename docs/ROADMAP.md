# Roadmap — ideas y features a futuro

Backlog **vivo** de ideas. No son compromisos ni están priorizadas todavía: es dónde anotamos lo
que queremos explorar para no perderlo. Cada ítem conserva el número con el que se anotó, así se
puede referenciar ("hagamos el #3"). Donde ayuda, hay un puntero **Dónde tocar →** al mapa del
código ([ARQUITECTURA.md](ARQUITECTURA.md)).

> Las dudas históricas que salgan de estas ideas (sobre todo #18 y #19) van a
> [PREGUNTAS_HISTORICAS.md](PREGUNTAS_HISTORICAS.md), no acá. Acá va el **diseño de juego**.

## Por tema

- **Primera persona / momentum** — #1, #12, #13
- **Combate y enemigos** — #2, #9, #19
- **Movimiento y sensación de vuelo** — #3, #4, #8
- **Aviones** — #10, #11, #18, #19, #22

> 📄 **Velocidad máxima por avión, escalones MACH, barrera del sonido y aporte de las
> piruetas**: el diseño está en [VELOCIDAD_MACH.md](VELOCIDAD_MACH.md) (propuesta, sin
> implementar — tiene 5 decisiones pendientes al final).
- **Economía y progresión** — #5, #6, #11, #14
- **Mundo, terreno y aliados** — #15, #16, #17
- **Modos de juego aparte del vuelo** — #24
- **Asimetría y aliados (geopolítica)** — #18, #19, #20, #21
- **Niveles y estructura** — #7, #14, #23
- **Puntaje y recompensa** — #5, #23

---

## 1. Momentum en primera persona a velocidad de juego

Rearmar el momentum: cambiarlo por **cámara en primera persona**, pero con el **avance tal como
funciona hoy el juego** (no cámara lenta). **Un solo objetivo** a destruir, en pocos segundos y
**en movimiento**. Mismo control que el avión, pero en primera persona.

> Relacionado con #12 y #13.
> Dónde tocar → `systems/momentum.js` (lógica, hoy bullet-time) + `render/momentum.js` (cabina/visor).

- [ ] Prototipar la vista 1ª persona a velocidad real, un objetivo móvil.

## 2. Barra de vida + metralleta más larga

Darle **barra de vida a algunos enemigos** (no muerte instantánea). Y **aumentar la capacidad
máxima de la metralleta**: poder mantener el disparo un poco más de tiempo antes de recalentar.

> Relacionado con #9.
> Dónde tocar → enemigos en `systems/spawn.js` + `systems/collision.js`; el calor/recalentamiento
> de la metralla (`overheat`, `heat`) en `systems/flight.js`.

- [x] **HP a enemigos seleccionados (barra visible).** Helo 2→4, jet 2→3, globo queda en 1 (cae de
      un tiro). Los de más de 1 HP llevan barra (`drawHpBar`, `render/world.js`): tenue mientras
      están intactos, opaca apenas los tocás. Se sumó un fogonazo al impacto (`hitFlash`) para que
      más vida no se sienta esponja. Perillas en `ENEMY_HP` (`data/tuning.js`).
- [x] **Ráfaga más larga.** El calor por tiro bajó de 0.10 a 0.06 → el fuego sostenido pasó de
      ~1.5 s a ~3.1 s antes de recalentar. Perillas en `GUN_*` (`data/tuning.js`).

## 3. Dashes de esquive cinemáticos

Agregar **dashes de esquive** hacia izquierda (**L1**) y derecha (**R1**). Podemos **reutilizar la
pirueta/tonel actual**, pero la **animación tiene que ser más cinemática** — no una voltereta de
un JPG.

> Dónde tocar → la pirueta ya existe: la dispara `core/input.js` (`roll`) y la anima
> `render/plane.js` (rotación del sprite). Hoy L1/R1 tienen otras funciones en el joystick →
> revisar el mapeo antes de asignarlas.

- [ ] Rehacer la animación del dash (más peso, estela, deformación) en vez del giro plano.
- [ ] Mapear el dash a L1/R1.

## 4. Más animaciones de vuelo

Sumar animaciones, **al menos una mientras vuela**: *bob* de vuelo + **micro-wobble** — una
oscilación sutil para que el avión **nunca quede congelado** en el aire.

**Acción pendiente:** probarlo en el preview y decidir si la inclinación se siente bien o si me
pasé / quedó corto. Las perillas son **0.42** (rotación), **0.26** (foreshortening) y **dt·9**
(suavizado).

> Dónde tocar → `render/plane.js` (esas tres perillas viven ahí; ya hay un bob básico, esto lo
> profundiza).

- [ ] Ajustar y validar el bob + micro-wobble en preview.

## 5. Sistema de monedas

La pantalla de fin **no acumula puntos en monedas**. Agregar un **sistema de monedas** (los puntos
—o parte— se convierten en moneda para gastar).

> Base de la economía: relacionado con #6 y
> #11.
> Dónde tocar → el recuento se arma en `freezeRun()` (`game.js`) y se dibuja en `render/screens.js`
> (`drawResults`).

- [ ] Convertir puntaje → monedas; persistir el saldo.

## 6. Dinámica de compra (roguelike y/o mercado)

Agregar alguna **dinámica de compra**: quizá **roguelike**, quizá **mercado**, o **ambos**.
Revisar cuál encaja.

> Relacionado con #5, #11 y
> #14.

- [ ] Definir modelo (roguelike vs mercado persistente vs mixto).

## 7. Niveles

¿Cómo estructuramos los niveles? (abierto)

> Ya hay diseño de campaña en [NIVELES.md](NIVELES.md) — punto de partida.

## 8. Más adrenalina en el vuelo rasante

Necesito **más adrenalina y complejidad** en los vuelos, los movimientos y el vuelo rasante.

> Relacionado con #3 y #4.

- [ ] Explorar mecánicas que suban la tensión a ras (obstáculos, ventanas de tiempo, riesgo/recompensa).

## 9. Más variedad y complejidad de enemigos

Más **variedad** y **complejidad** en los enemigos.

> Relacionado con #2.
> Dónde tocar → `systems/spawn.js` (tipos y aparición) + `systems/collision.js` (comportamiento).

### Arte de las aeronaves enemigas (assets)

Hoy el helicóptero y el jet se dibujan **por código** (rects) en `drawObstacle` (`render/world.js`),
con dos efectos ya implementados:

- **Zoom de cercanía** (`approachZoom`): arrancan chiquitos en el horizonte y se agrandan al
  acercarse, con ease-in. Perillas `APPROACH_*`. Es solo visual — no toca hitboxes.
- **Viraje del helicóptero**: llega **de frente** y se pone **de costado** al acercarse. No son dos
  dibujos: es uno que se estira por escorzo y al que le crece la cola. Perillas `HELO_TURN_*`.

**Si se reemplaza por assets**, el spec para que entren sin rehacer la lógica (mismo criterio que
`data/planes.js`, que ya usa hojas de sprites horneadas):

| aeronave | hoja | por qué |
|---|---|---|
| helicóptero | **1 fila × 8 columnas**, yaw de 0° (de frente) a 90° (perfil) | la columna la elige el `yaw` que ya se calcula por distancia |
| jet | **1 fila × 5 columnas**, alabeo de −30° a +30° | reemplaza el `bank` que hoy se finge con rects |

- **Tamaño sugerido:** 48×32 por cuadro, PNG con transparencia (la hoja del jugador es 56×32).
- **Sin bordes suavizados** (el juego dibuja con `imageSmoothingEnabled = false`).
- El rotor conviene que venga **barrido/borroso** en el propio cuadro.
- Si hay modelos 3D, `tools/bake_planes.html` ya hornea hojas así para los aviones jugables.

## 10. Aviones con características distintas

Más **complejidad entre aviones**: características diferentes (velocidad, maniobra, armamento,
resistencia…).

> Relacionado con #18.
> Dónde tocar → `data/planes.js` (definición de aviones).

## 10.1 Nuevo avión: IA-58 Pucará

Sumar el **IA-58 Pucará** al roster jugable (`data/planes.js`). Encaja en #10 (más
complejidad entre aviones): es turbohélice bimotor, no jet — el opuesto de perfil a todo lo que
hay hoy (Skyhawk, Dagger, Super Etendard, A-4Q, Mirage IIIEA), así que es candidato natural a
tener características bien distintas (más lento, más resistente, mejor en apoyo terrestre).

**Uso histórico real** (contexto para el diseño, no solo estética):

- **Bases:** operó desde la BAM Malvinas (Puerto Argentino) y la BAM Cóndor en Pradera del
  Ganso (Darwin), además de apostaderos chicos como Puerto Calderón.
- **Misiones:** apoyo directo a las tropas terrestres, patrullaje del litoral, exploración y
  combate contra helicópteros enemigos — no interceptación aire-aire con aviones rápidos.
- **Capacidad rústica:** el tren turbohélice le permitía operar en pistas blandas o cortas
  donde los reactores de la Fuerza Aérea no podían — coherente con el trabajo reciente de
  pistas de tierra/pasto (#26, `data/runways.js`): el Pucará sería EL avión que tiene sentido
  en esas pistas.

> Relacionado con #10, #18 (asimetría) y #26 (misiones de regreso — el Pucará operaba corto,
> desde bases avanzadas, distinto perfil de autonomía que los jets desde el continente).
> Dónde tocar → `data/planes.js` (definición), `tools/bake_planes.html` (hornear la hoja del
> sprite si no hay modelo 3D/2D ya listo).
>
> Fuentes: amilarg.com.ar/pucara-mlv.html · videos de referencia sobre operaciones del Pucará
> en Malvinas (aportados por el usuario).

## 10.2 Nuevo avión: Aermacchi MB-339

Sumar el **Aermacchi MB-339** al roster jugable (`data/planes.js`). Es jet de entrenamiento
avanzado y ataque ligero, construido en Italia por Alenia Aermacchi, en servicio desde 1978 —
mundialmente conocido por ser el avión del equipo acrobático Frecce Tricolori de la Fuerza
Aérea Italiana.

**Características:**

- **Velocidad máxima:** 898 km/h (Mach 0.73) — subsónico, más lento que los cazas de la línea
  actual (Dagger, Mirage, Super Etendard): otro candidato a "distinto" para #10, en el extremo
  opuesto de la balanza al Pucará (#10.1): jet liviano de entrenamiento, no turbohélice.
- **Armamento:** hasta 1885 kg de carga externa — cañones de 30mm, bombas y misiles.

**Uso histórico real:** operado por la Aviación Naval Argentina durante la guerra — incluye el
ataque en solitario del Teniente Owen Crippa a la fragata HMS Argonaut. Sigue en servicio hoy
en varias fuerzas aéreas (entre ellas la de Perú).

> Relacionado con #10 y #18 (asimetría).
> Dónde tocar → `data/planes.js` (definición), `tools/bake_planes.html` (hornear la hoja del
> sprite si no hay modelo 3D/2D ya listo).
>
> Fuentes: Wikipedia (Aermacchi MB-339) · amilarg.com.ar/aermacchi-339.html ·
> shelknamsur.com (nota sobre el MB-339 en Malvinas) · zona-militar.com · key.aero
> (aportadas por el usuario).

## 11. Reparaciones y mejoras

¿Sistema de **reparaciones**? ¿**Mejoras**? (abierto) — pieza de progresión/economía.

> Relacionado con #5 y #6.

## 12. Otro momentum de vuelo rasante

¿Una **nueva dinámica tipo "momentum"** pero de **vuelo rasante**? (abierto)

> Relacionado con #1 y
> #13.

## 13. Momentum a primera persona como "poder" en vivo

El **momentum lento** actual, **cambiable a primera persona si se quiere, DURANTE el juego**, como
un **"PODER"** que el jugador activa.

> Relacionado con #1 y
> #14.

## 14. Roguelike con poderes por nivel

¿**Roguelike** con **poderes por cada nivel**? (abierto)

> Relacionado con #6 y
> #13.

## 15. Reabastecimiento con el Hércules

Agregar **reabastecimiento de gasolina asociado al HÉRCULES**.

- **Por ahora:** el Hércules volando arriba con la manguera de gasolina conectada.
- **A futuro:** un **sobrevuelo manteniendo la conexión** con el Hércules por unos metros (mecánica
  de acople/mantener posición).

> Dónde tocar → mecánica de combustible (`run.fuel`) + un nuevo actor/obstáculo aliado en
> `systems/spawn.js`.

- [ ] Hércules como aliado con manguera (versión estática).
- [ ] Sobrevuelo con conexión sostenida (versión con skill).

## 16. Mejorar el nivel de tierra y los soldados

**Mejorar el nivel de TIERRA** y la **mecánica de soldados**.

> Dónde tocar → terreno land en `render/world.js` (`drawLand`), spawn de soldados en
> `systems/spawn.js`, impactos en `systems/collision.js`.

- [x] **Soldados mejorados (hecho).** Eran 3 rects (y arrastraban un bug latente: una variable
      `run` que sombreaba el store y crasheaba cualquier nivel de tierra). Ahora son una figura de
      infantería con casco, cara, torso, fusil cruzado y piernas que alternan al correr —
      `drawSoldier()` en `render/world.js`.
- [x] **Árboles esquivables (hecho).** Obstáculo `tree` que sale solo en tierra (el `mast` es de
      mar), con **altura y ubicación aleatorias** para esquivar a distintas alturas en el rasante.
      Colisiona como el mástil (`systems/collision.js`) y se dibuja como arbusto batido por el
      viento (`drawObstacle`).
- [ ] Más variedad de terreno/props (rocas, trincheras, cercos) y comportamiento de soldados.

## 17. Nuevas mecánicas y terrenos

¿**Nuevas mecánicas** y **nuevos terrenos**? (abierto)

- [x] **Terreno COSTA (hecho): el desembarco británico.** Tierra a la izquierda, playa y mar a la
      derecha (`SHORE_X` en `data/tuning.js`), la flota fondeada en el horizonte. Mucho más denso
      que los otros mapas. Actores nuevos (`systems/spawn.js` + `render/world.js`):
      **carpas** (paren patrullas; arrasarlas a ras NO mata y da puntos), **antiaéreos**
      (disparan misiles guiados, destruibles — blanco prioritario), **puestos** (destruibles;
      los armados tienen un soldado que tira ráfagas de trazadoras) y **barcazas de desembarco**
      (entran por el agua con soldados). Los soldados son británicos: corren TODOS de derecha
      (la playa) a izquierda, más rápido, y con silueta de contraste para despegarlos del
      terreno. TIERRA replica carpas y antiaéreos sueltos. Se elige en el menú [M] → TERRENO.
- [x] **Segunda tanda de COSTA (hecho).** La orilla **serpentea** (`shoreAt()` en `data/tuning.js`,
      única fuente para render/vuelo/spawn), playa ancha con arena húmeda, tierra arenosa (`CLAND`),
      cielo **NUBLADO** (day_cloudy, se activa solo al elegir COSTA). Los árboles de la costa se
      reemplazaron por **radares móviles** y **camiones antiaéreos**. Nuevos en todos los mapas:
      **BOMBARDEO** (bombas que caen — chocarlas mata; al tocar el suelo levantan un **hongo** que
      daña sin derribar; densidad en menú [M] → BOMBARDEO) y **bandadas de aves** (dañan, no
      derriban). Las **barcazas ahora navegan** desde la derecha y desembarcan la patrulla al tocar
      la playa. Del lado izquierdo, **trincheras argentinas** (decorado sin colisión) tirotean y
      cada tanto abaten un británico.


## 18. Jugar con los ingleses (asimetría)

Poder **jugar con los ingleses** para mostrar la **diferencia**: dar **facilidades de poderes y
tecnología** al inglés, **versus** un avión argentino, para que se sienta que con el argentino
**necesitás ser habilidoso** y con el inglés **está todo servido**.

Analogía guía: **dron estabilizado** (inglés) **vs dron acro personalizado** (argentino).

> Relacionado con #10 y
> #19.
> El *framing* es de diseño; cualquier dato concreto de tecnología/época va a
> [PREGUNTAS_HISTORICAS.md](PREGUNTAS_HISTORICAS.md).

## 19. Radares ingleses vs base terrestre argentina

**Aviones ingleses** con **radares de cercanía incorporados**. **Aviones argentinos** que
**requieren que les avise una BASE DE TIERRA** → agregar la **mecánica de base terrestre**.

> Relacionado con #10 y
> #18.
> Dónde tocar → la detección/radar hoy vive en `systems/flight.js` (`detection`); la base terrestre
> sería un sistema nuevo que alimente ese aviso.

## 20. Ayuda de países aliados a la Argentina

Reflejar en el juego las **ayudas que tuvo la Argentina** de otros países: que aparezcan como
**apoyos concretos** en la partida (equipamiento, aviso/inteligencia, un aliado que sobrevuela,
un arma o pieza extra), no como texto suelto.

La idea es que el jugador **sienta** de dónde vino cada ayuda, y que se integre a la asimetría:
suma del lado argentino, sin romper el espíritu de "avión exigente".

### Quiénes ayudaron a la Argentina

Los datos, con una idea de cómo podría expresarse cada uno **dentro de la partida** (que es lo
que hace falta para que no queden en texto de menú). **Verificar antes de publicar** — ver la
nota en [PREGUNTAS_HISTORICAS.md](PREGUNTAS_HISTORICAS.md).

| País | Qué aportó | Posible expresión en el juego |
|---|---|---|
| **Perú** | **10 Dassault Mirage 5** entregados | Un avión más en el roster (#10) que se **desbloquea** a mitad de campaña, no está desde el principio: se siente la llegada del refuerzo |
| **Venezuela** | Apoyo militar inmediato y **combustible** | Bidones extra / autonomía: toca directo el reloj del run (#26 depende del combustible) |
| **Libia** | Misiles soviéticos, armamento pesado y minas terrestres, de forma **secreta** | Armamento extra que aparece **sin anuncio** — encaja con que fue clandestino |
| **España** | Filtró extraoficialmente información y **manuales técnicos de los Harrier** | El Harrier enemigo pasa a mostrar sus **puntos débiles** (marcador de zona vulnerable, como el momentum) |
| **Unión Soviética** | **Inteligencia satelital** de los movimientos de la flota británica | Aviso previo de dónde está la flota: el marcador de objetivo aparece antes / se ve el rumbo enemigo |

El patrón: cada ayuda debería tocar **un sistema distinto** (roster, combustible, armamento,
información del enemigo, información del objetivo) para que se noten como cosas separadas.

> Relacionado con #15 (el Hércules ya es un aliado en el aire), #18 y #19 (es el otro platillo de
> la balanza: qué compensa la desventaja tecnológica), #10 (el Mirage 5 peruano es un avión más).

## 21. Ayuda de países aliados a Inglaterra

Lo simétrico del #20: reflejar las **ayudas que tuvo Inglaterra** de otros países, del lado inglés,
como **ventajas concretas** (mejor detección, reabastecimiento, tecnología o apoyo logístico).

Es la contracara que hace legible la asimetría del #18: no es que "el inglés es mejor porque sí",
sino que **contó con apoyos** que se traducen en poderes/tecnología dentro del juego.

### Quiénes ayudaron a Inglaterra

Mismo criterio que #20: el dato y su posible expresión jugable. **Verificar antes de publicar**
— varias de estas son afirmaciones sensibles; ver [PREGUNTAS_HISTORICAS.md](PREGUNTAS_HISTORICAS.md).

| País | Qué aportó | Posible expresión en el juego |
|---|---|---|
| **Estados Unidos** | Misiles **Sidewinder AIM-9L** de última generación, combustible, e inteligencia satelital **en tiempo real** de las posiciones argentinas | Misiles enemigos que **persiguen mejor** (el AIM-9L era all-aspect: podía dispararse de frente, no solo por la cola) + el enemigo sabe dónde estás aunque no te vea |
| **Chile** | Radares británicos de largo alcance en su territorio, base para comandos del SAS, y escuchas de radio que **avisaban cada despegue argentino desde el continente** | La alarma de radar suena **antes** en las misiones que salen del continente (#26): te esperan |
| **Francia** | Suspendió el envío ya pagado de Super Étendard y **Exocet**, y sus pilotos entrenaron a los británicos para **evadir los aviones franceses que tenía Argentina** | Munición limitada de Exocet en el Super Étendard (#10) + los buques **esquivan mejor** justo a ese avión: tu mejor arma es contra la que más se prepararon |

El caso francés es el más interesante como diseño: es una desventaja **específica del avión**,
no general — el jugador lo descubre usando el Super Étendard y notando que ahí cuesta más.

> Relacionado con #18 y #19 (es de dónde sale, narrativamente, el "está todo servido" del inglés),
> con #10 (esas ayudas se expresan como stats/tecnología por bando) y con #26 (el aviso chileno
> pega justo en las misiones desde el continente).

## 22. Panel de daños por partes del avión

Un **panel de daños** en el HUD que muestre el **estado de las partes del avión** (ala, motor,
cabina, tren, cola…) para **indicar la vida**: qué está sano, qué está golpeado, qué está por
ceder. La silueta del avión con las partes coloreadas según su estado.

> **Ojo — esto implica una decisión de diseño, no solo una UI:** hoy el avión **no tiene vida**.
> Cualquier choque es muerte instantánea (`{ death }` en `systems/collision.js`), y esa regla es
> justamente lo que hace tenso el vuelo rasante. Un panel de daños sin integridad detrás no
> mostraría nada.
>
> Relacionado con #2 (mismo lenguaje visual que las barras de vida de enemigos), #10 (la
> "resistencia" por avión es lo que llenaría el panel) y #11 (si hay daño, hay reparaciones).
> Dónde tocar → la muerte hoy sale de `systems/collision.js` y `systems/flight.js` (roce); el panel
> iría en `render/hud.js`.

- [x] **Versión liviana (hecha):** panel que muestra lo que YA existe — silueta del avión de
      espaldas en el borde izquierdo, con alas = calor del cañón, motor = combustible y panza =
      margen de roce. Vive en `drawStatusPanel()` (`render/hud.js`). El margen de roce era el único
      de los tres que no se veía en ningún lado.
- [ ] Decidir si el jugador pasa a tener integridad (y si eso saca tensión al rasante).
- [ ] Versión completa: daño por partes que degrade stats concretos.

## 23. Cuarta estrella: las Malvinas (rango "S")

El puntaje de cada nivel otorga estrellas por desempeño, **hasta 4 como máximo**: las **3 primeras
son estrellas** normales y la **4ª son las Malvinas** (la silueta de las islas, no una estrella).
Las Malvinas son el tope — el equivalente al **"S" / "excelente"** de cualquier juego: solo cae con
un desempeño sobresaliente.

Guiño cultural: las 3 estrellas + la 4ª "que falta" es la lectura argentina inmediata (los tres
mundiales y Malvinas como la cuarta pendiente). Le da peso emocional al rango máximo.

> **Esto EVOLUCIONA un sistema que ya existe, no lo crea de cero.** Hoy `freezeRun()` (`game.js`) ya
> calcula `stars` (1/2/3 según `total` vs el `par` de la misión) y `drawResults()`
> (`render/screens.js`) ya las dibuja con rebote — pero el loop está clavado en `for i < 3` y las
> pinta con el glifo `★`. Además hay un `rank` paralelo (RANKS: cadete/piloto/as/halcón) que sube
> con la precisión: la 4ª estrella y ese rango máximo son la misma idea, conviene **unificarlos**
> (sacar las Malvinas = alcanzar el rango tope).
> Dónde tocar → umbral de estrellas en `freezeRun()`; render en `drawResults()` (el 4º slot dibuja
> las islas, no un `★`).

- [x] **Escala a 4 tramos (hecho).** `freezeRun()`: 1 base · 2 en `par` · 3 en `par*1.5` · 4 en
      `par*2`. El doble del par para las Malvinas, que se sientan merecidas.
- [x] **4º slot = silueta de las islas (hecho).** `drawMalvinas()` (`render/screens.js`) usa la
      silueta real `assets/images/malvinas.webp` (islas negras sobre transparente), **coloreada por
      tintado** (`source-in`): dorada con halo pulsante cuando se ganan, gris tenue cuando faltan.
      Tiene fallback vectorial por si la imagen no cargó. El build web la re-embebe como data URI
      (`tools/build_web.py`).
- [x] **Distribución tipo emblema (hecho).** El galardón NO va en fila: las 3 estrellas van
      dispersas y con leve rotación y las islas en el centro del racimo (`AWARD_STARS`/`AWARD_MAL`),
      como el emblema de la remera de referencia.
- [x] **Rango unificado (hecho).** El `rank` ahora deriva directo de las estrellas (se sacó el bonus
      de precisión que competía); 4 estrellas = HALCÓN DEL ATLÁNTICO, el rango S.
- [x] **Estrellas también en POR LA PATRIA (hecho).** El derribado de survival ES el fin del "nivel",
      así que premia con estrellas según el puntaje (`SURVIVAL_PAR`, `game.js`). El galardón se
      extrajo a `drawAward()` (`render/screens.js`), compartido entre el recuento y el derribado.
      En campaña/ciclo morir sigue siendo fracaso, sin estrellas.
- [ ] Persistir las estrellas por nivel (para un futuro selector de niveles / 100%).

## 24. Minijuego terrestre: el piloto/soldado en tierra

Un **minijuego aparte del vuelo**, jugando en tierra como el **piloto derribado** (o un soldado),
para **recuperar partes** (u otro recurso). Es un modo de juego DISTINTO al núcleo aéreo: otra
cámara, otro control, otro ritmo — un respiro entre vuelos, no un reemplazo.

Idea base: caés en las islas, tenés que **moverte a pie**, evitar/enfrentar amenazas y **juntar
piezas** que después sirven para reparar o mejorar el avión (engancha con la economía).

> **Es contenido NUEVO, no una extensión del vuelo.** Hoy los "soldados" existen solo como
> **enemigos** que se ametrallan desde el avión (`systems/spawn.js` los siembra en terreno `land`,
> `systems/collision.js` los mata) — no hay un personaje jugable a pie. Este minijuego sería un
> **estado/modo nuevo** con su propio loop de update y render, como lo es hoy el momentum.
>
> Relacionado con #11 (reparaciones — las piezas alimentan eso), #5/#6 (economía — otra fuente de
> recurso), #10 (si las piezas mejoran stats del avión) y #16 (ya toca el nivel de tierra y los
> soldados).
> Dónde tocar → un modo nuevo tipo el momentum (su propio `update`/`draw`); reusaría el render de
> tierra (`drawLand`) y el sprite de soldado como base.
> La carga emocional es fuerte (son pilotos y soldados reales): el tono va en
> [PREGUNTAS_HISTORICAS.md](PREGUNTAS_HISTORICAS.md) si hace falta consultar.

- [ ] Definir **cuándo** entra: ¿tras ser derribado (segunda oportunidad)? ¿misión lateral opcional?
      ¿entre niveles?
- [ ] Definir el **género**: cenital de sigilo/evasión, plataformas 2D, o recolección simple.
- [ ] Definir **qué recupera** y cómo vuelve al juego aéreo (piezas → reparación/mejora).

## 25. Subir la resolución base (320×180 → 480×270)

Subir la resolución interna para que **cada cosa esté compuesta por más cuadraditos** y gane detalle.
Hoy el juego se dibuja a **320×180** lógicos (buffer 2×). 480×270 es exactamente **1.5×**.

> **Contexto: 320×180 NO es baja resolución para el género.** Es una base estándar de pixel-art en
> Steam (Shovel Knight, The Messenger y muchos otros rondan 256×224–320×180; Celeste es ~320×180
> lógico). Los que "se ven mejor" no tienen más resolución: tienen **más densidad de arte** dentro
> de la misma. Por eso el paso 1 fue subir el detalle del arte por código, no la resolución.

### Resultados del spike (medidos, no estimados)

Se probó de verdad: copia del árbol con `W=480, H=270, HOR=96, F=135` y build.

**Lo bueno — arranca y no rompe nada:**
- **Cero errores de consola.** El juego corre, el menú se ve bien, el mundo se dibuja correcto.
- **231 posiciones** ya están expresadas con `W`/`H` (ej. `W/2`, `H-8`, `W-66`) → **se adaptan solas**.
  Casi todo el HUD (puntaje, barra de objetivo, avisos, COMB, CAÑÓN, velocímetro) cayó en su lugar.
- El terreno llenó todo el ancho correctamente.

**Lo que se rompe:**
- **~40-60 posiciones hardcodeadas** en coordenadas absolutas. Confirmado en el spike: el panel
  ESTADO (`drawStatusPanel(287, 140)`) quedó flotando en el medio, y la palanca de gas
  (`tyTop=46, tyBot=118`) quedó arriba en vez de centrada.
- **68 tamaños de fuente** (`'6px monospace'`…) → todos necesitan ×1.5, o el texto queda chico.
- **Sprites horneados** (`SHEET_FW=56, SHEET_FH=32`): se dibujarían al mismo tamaño en píxeles →
  el avión se vería **2/3 más chico** en relación a la pantalla. Hay que **re-hornearlos** a 84×48
  con `tools/bake_planes.html`, si no NO se gana detalle (solo se agranda lo mismo).
- **Trampa importante:** subir la resolución **no agrega detalle por sí sola**. Los pasos de muestreo
  del mar y la tierra (`SPX`/`SPZ`) son de MUNDO: al subir `F`, se dibuja la misma cantidad de puntos
  pero 1.5× más grandes. Para ganar densidad real hay que **bajar esos pasos** también.

### Camino barato recomendado (híbrido)

En vez de re-tunear 60 posiciones + 68 fuentes: **el mundo va a 480×270 nativo y el HUD/pantallas
siguen razonando en su grilla de 320×180**, escalados ×1.5 al dibujar.

1. En `hud.js` / `screens.js` / `menus.js`, importar `HUD_W`/`HUD_H` (=320×180) en vez de `W`/`H`
   (reemplazo mecánico; las ~231 expresiones relativas siguen valiendo).
2. Envolver esas llamadas en `ctx.scale(W/HUD_W, H/HUD_H)`.
3. Re-hornear los sprites de aviones a 1.5×.
4. Bajar `SPX`/`SPZ` del mar y la tierra para ganar densidad real.

Así el **mundo gana detalle de verdad** (es procedural: más píxeles = más detalle gratis) y el HUD
queda idéntico sin tocar una sola coordenada.

### ✅ HECHO — cómo quedó

Se aplicó el camino híbrido. **Dos espacios de coordenadas, explícitos:**

| capa | espacio | por qué |
|---|---|---|
| mundo (mar, tierra, obstáculos, avión, momentum) | **480×270 nativo** | es procedural: más píxeles = más detalle real |
| HUD, pantallas, menús | **320×180 escalado ×U** | son texto y cajas; no ganan nada con más píxeles |

Claves de por qué el híbrido no tiene costo:
- **Sin medio píxel:** `U` (1.5) × `SC` (2) = **3 exacto**, así que cada unidad de diseño cae en 3
  píxeles enteros. El texto del HUD encima quedó *más* nítido (se rasteriza a 3× en vez de 2×).
- **El mundo se adaptó solo:** `proj()` usa `W/2`, `HOR` y `F` juntos, así que al escalar los tres
  todo lo dibujado en coordenadas de mundo conservó su tamaño relativo sin tocar una línea.
- Las constantes de MUNDO (`FLY_X`, `PZ`, alturas de obstáculos) no se tocaron.

**Bugs latentes que aparecieron y se arreglaron:**
- `systems/three-world.js` tenía una **copia hardcodeada** de `W/HOR/F`. Al cambiar la resolución el
  3D se habría desalineado del 2D **sin tirar ningún error**. Ahora las importa de `render/ctx.js`.
- La geometría de la barcaza (`36`/`9`) estaba repetida en tres módulos. Se centralizó en
  `SHIP_DECK`/`SHIP_UH` (`data/tuning.js`).

**Verificado:** gate completo en verde (incluye smoke de Electron y de web), momentum capturado y
alineado, y **120 FPS** medidos — sin regresión pese a 2.25× más puntos de mar.

- [x] **Sprites re-horneados a 1.5× (hecho).** `tools/bake_planes.html` pasó de 56×32 a **84×48**
      por cuadro (mismo aspecto 1.75, así que el encuadre de cámara no cambió). Con el buffer 2×
      del juego el sprite cae a **2× exacto** en pantalla en vez de un estirado 3×. De paso se le
      sumó detalle a los modelos low-poly (tomas de aire, anillo de escape, puntas de ala), que
      a 56×32 no se distinguía.

## 26. Misiones de REGRESO al continente

La secuencia real de una misión de ataque era: despegue desde Río Gallegos, San Julián o Río
Grande → vuelo rasante sobre el mar durante cientos de kilómetros para evitar los radares
británicos → ataque a la flota o a un objetivo en las islas → **regreso a la misma base en el
continente, muchas veces con el combustible al límite**.

El juego ya cubre las primeras tres patas. Falta la cuarta: niveles donde **se empieza YA
VOLANDO** (sin despegue, sin plataforma — `cfg.start = 'air'`, ya implementado) y el objetivo
final **no es destruir nada sino LLEGAR a la base argentina** con la nafta que quede.

Qué falta para cerrarla:
- [ ] Un tipo de objetivo "llegar a la base": la meta es una pista/base argentina que aparece en
      el horizonte (reutiliza la mecánica del marcador de objetivo y de la barcaza que crece).
- [ ] El combustible como tensión central: el nivel se diseña para llegar CON LO JUSTO
      (el dato histórico: los A-4 volvían "chupando el aire de los tanques").
- [ ] Aterrizaje o sobrevuelo de la base como final feliz (¿mini-secuencia de toma de contacto
      con las pistas nuevas de data/runways.js?).
- [ ] En campaña: intercalar una de regreso después de cada gran ataque.

Lo ya implementado que esta mision aprovecha: `cfg.start='air'` (arranque en vuelo, sin
takeoff), los 5 estilos de pista (`data/runways.js`) para la base de llegada, y `cfg.cliff`.


## 26.1 Bases argentinas en las islas: BAM Malvinas y BAM Cóndor

Dos bases reales, distintas entre sí, para las misiones que despegan/aterrizan EN las islas
(a diferencia de #26, que es continente↔islas). Encajan directo con `data/runways.js` — cada
una es candidata a un `RUNWAYS` propio — y con los aviones nuevos #10.1/#10.2.

- **BAM Malvinas** (Puerto Argentino) — la base grande: operaban Pucará (#10.1), Aermacchi
  MB-339 (#10.2), helicópteros, y los **C-130 Hércules** para transporte y abastecimiento
  cuando las condiciones lo permitían (ver #15, reabastecimiento con el Hércules — mismo
  avión, otra pata del mismo tema). Es la base "grande" del juego hoy (el despegue actual
  es de acá) — con pista pavimentada.

- **BAM Cóndor** (Pradera del Ganso / Darwin) — base chica, de apoyo cercano: la usaban
  sobre todo los IA-58 Pucará y helicópteros, en apoyo directo al Ejército en tierra. Es la
  candidata natural para una pista de tierra o pasto (`RUNWAYS`: 'dirt' / 'field',
  ya implementadas) — coherente con que el Pucará podía operar en pistas blandas/cortas
  donde los reactores no entraban.

Diferencia de personalidad entre las dos: Malvinas es la base "aérea" (jets, Hércules,
pista formal); Cóndor es la base "de tierra" (Pucará, helicópteros, apoyo al Ejército,
pista rústica). Un nivel ambientado en cada una debería sentirse distinto — no solo el
fondo, sino qué aviones/obstáculos aparecen.

> Relacionado con #10.1, #10.2, #15, #17 (terrenos) y #26.
> Dónde tocar → `data/runways.js` (nuevo estilo de pista por base), `docs/NIVELES.md`
> (asignar qué misión sale de cuál base).
