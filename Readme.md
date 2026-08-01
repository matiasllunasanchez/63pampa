# RASANTE

Arcade 2D de vuelo rasante ambientado en el Atlántico Sur, 1982. Homenaje a los
pilotos y veteranos de Malvinas, centrado en la adrenalina del vuelo a ras del mar.

**Jugar:** abrir `index.html` en el navegador (doble clic alcanza — no necesita build ni servidor).

Dos versiones en el repo:

- `index.html` — **vista frontal** (pseudo-3D detrás del avión, estilo After Burner). La principal.
- `lateral.html` — el primer prototipo de scroll lateral, conservado como referencia.

## Estructura del código

El juego está modularizado: `src/game.js` es el ensamblador (bucle, flujo de misión, cámara,
cableado del input) y el resto vive en `src/core` (estado + helpers puros), `src/systems`
(comportamiento), `src/render` (dibujo) y `src/data` (contenido). El mapa completo —qué archivo
hace qué, las convenciones y dónde tocar cada cosa— está en **[`ARQUITECTURA.md`](docs/ARQUITECTURA.md)**.

## Música y sonido

- Dos pistas: **`the_weight_of_honor.mp3`** suena en loop en el lobby (menús); **`weight_of_honor_v2.mp3`**
  suena de fondo, en volumen bajo, durante el vuelo. `updateMusic()` cambia según la pantalla.
- **Ícono de sonido** arriba a la derecha (botón `#snd`): togglea mute (persiste en `localStorage`). Muteás
  música + efectos. La música arranca en la **primera interacción** (política de autoplay del navegador).
- A futuro: cambiar soundtracks por **nivel / momento / secuencia** (una pista por contexto).
- **Adrenalina aleatoria**: en SUPERVIVENCIA y CICLO DE MUERTE cada run arranca con una pista al
  azar del pool `musAdr` — **11 pistas `pmetal_*.mp3`** en calidad original (array `MUSIC_ADR` en
  `src/game.js`). Para sumar/rotar: editá el array (rutas a `assets/audio/`). La campaña mantiene
  su música propia. En el **build web** solo se re-embeben 3 comprimidas (ver abajo).
- **Audio de cámara lenta (MOMENTUM)** — procedural, sin assets: la música se **ahoga** (0.30→0.10,
  lerp suave), el motor baja a un **rumble de 30Hz con latido** (~0.4Hz), sting de entrada con
  pitch cayendo (620→65Hz) y de salida subiendo (110→640Hz), y **ducking**: las explosiones
  grandes agachan la música 0.55s (`duckT`). El disparo de la ráfaga es grave (140→55Hz + ruido)
  y cada impacto suma un thump (88→44Hz). Los **samples finales** quedan para después de la
  migración de assets — los eventos ya están cableados, el swap es mecánico.
- **Doble build de audio** (post-migración a Electron): el juego (`src/game.js`) referencia
  **archivos sueltos** — mp3 originales en `assets/audio/`. Para el **Artifact web**, que no admite
  `assets/` externos (CSP), `tools/build_web.py` re-embebe una versión **comprimida** (`assets/audio/
  web/*.m4a`, 6 pistas) como data URI y descarta las adrenaline que no entran en 16 MB. Así el juego
  de escritorio tiene 11 pistas en calidad original y el demo web queda liviano.

## El loop (vista frontal)

- **Despegue de Puerto Argentino**: cada run arranca en la pista de la BAM Malvinas con
  cuenta regresiva 3…2…1; el avión carretea y asciende solo, y el control llega a los 3 s
  ("CONTROL LIBRE!"). Se cruza la costa y empieza el mar abierto.
- **Escuadrón (las vidas)**: se despega en formación de 1 a 8 aviones (`ESCUADRON` en el menú
  OPCIONES → PARTIDA, default 4). Al CONTROL LIBRE la formación sale de plano detrás de la cámara — te siguen
  aunque no los veas. Al morir, si queda escuadrón, no hay pantalla de derribado: una cinemática
  corta muestra los restos del líder y el numeral siguiente (GUARDIA 2, 3…) entra, pasa por la
  caída y asume el mando con 2 s de invulnerabilidad y esquive automático. Hereda combustible y
  munición (morir no repone nada); pierde racha y multiplicador. El HUD muestra el tablero de
  aviones con los caídos tachados. Con `SOLO`, morir es morir, como siempre.
- **Horizonte giratorio**: al rolar, lo que gira es el **mundo** — el avión queda derecho, como
  visto desde una cámara pegada a él. Se elige en **OPCIONES** (`HORIZONTE: FIJO · EN PIRUETAS ·
  TOTAL`, default *EN PIRUETAS*) y la elección se guarda entre sesiones. Es solo dibujo: no cambia
  colisiones ni dificultad. Abajo a la izquierda hay un **horizonte artificial** que dice dónde
  está el suelo y para qué lado queda arriba; se ve siempre, incluso con `FIJO`. Con el modo
  `LIBRE 360°`, `[Q]` y `[E]` rolan a voluntad sin tope — el suelo puede quedar en el techo y
  quedarse ahí mientras aguantes la tecla; al soltar, el avión se endereza solo.
- **Control por alabeo** (opcional, en **OPCIONES** → `CONTROL: DIRECTO · POR ALABEO`): con
  `POR ALABEO`, `←`/`→` **rolan** el avión y moverse de costado es la consecuencia de estar
  banqueado, en vez de un empujón lateral directo. El techo de velocidad lateral es el mismo (~30)
  y en 0,9 s de viraje recorrés lo mismo: no es un ajuste de dificultad sino de acople — lo que te
  desplaza pasa a ser un ángulo que estás viendo. Combinado con `HORIZONTE: TOTAL`, esquivar
  inclina el mundo. El arrastre táctil no cambia: sigue siendo directo.
- Volar bajo multiplica el puntaje: **x2** (≤16 m) / **x5** (≤9 m) / **x10** (≤4,5 m).
- **Racha rasante**: sostener la zona x10 sube el multiplicador cada 2 s: **x15 → x20 → x25 → x30**,
  con beeps ascendentes y el borde de la pantalla encendiéndose. Subir de la zona la corta (0,45 s de gracia).
- **El multiplicador acelera el avión**: x5 da +5% de velocidad, x10 da +10%, y cada nivel
  de racha suma +12% (hasta ~+58% en x30). Más recompensa = menos tiempo de reacción:
  la velocidad es premio y castigo a la vez.
- **Viento en contra en altura**: por encima de ~16 m la resistencia crece con el tiempo
  (hasta **-35%** de velocidad), con ráfagas visibles, turbulencia que sacude el avión y
  aviso en el HUD. Arriba no hay refugio: sos lento, te pinta el radar y el viento te zamarrea.
- **Estela y rocío**: debajo de ~9 m el avión deja una estela en V sobre el agua que corre
  hacia la cámara; debajo de ~4,5 m el rocío explota y la pantalla vibra. Es la referencia
  visual de altura y la principal sensación de velocidad.
- **Agua "malla de puntos"** (efecto onda, inspirado en el fondo WebGL de boostivity.ai): el mar
  se dibuja como una grilla de puntos en perspectiva desplazada por ondas superpuestas
  (`drawSeaDots` + `seaH`), que fluye hacia la cámara. Estilo conmutable con `cfg.water` (OPCIONES → AMBIENTE):
  `'sea'` (tono Atlántico, por defecto) o `'violet'` (neón tipo boostivity). Paletas en `WATER_STYLES`.
- Tocar el agua es fatal. Las olas suben y bajan — el margen nunca es fijo.
- **Turbo**: +60% de velocidad y **puntaje x2**, pero quema combustible mucho más rápido.
- **Near-miss**: rozar un obstáculo sin chocarlo da **+75** (y esquivar un misil también).
- Volar alto llena la barra de **radar**. Al completarse te avisa (**"! TE DETECTÓ EL RADAR !" /
  "TE ATACARÁN DESDE TIERRA"**) y empiezan las **oleadas de misiles desde tierra**, que **crecen
  sin techo**: +1 misil cada 3 oleadas, en abanico, y la barra queda cada vez más cargada (el
  intervalo baja de 1,4 s a ~0,6 s). Quedarse arriba es insostenible por diseño. El HUD muestra
  cuántas oleadas van y una marca de dónde va a rearrancar la barra. Hay un tope de **48 misiles
  simultáneos** — solo para proteger el frame, el tamaño de la oleada sigue creciendo.
- **Altímetro en el HUD**: al lado de los km/h, abajo al centro. Se pone **naranja** en la zona
  rasante (≤4,5 m) y **rojo parpadeante con subrayado** cuando estás por encima de la altura de
  detección del radar — el aviso donde ya estás mirando el número que lo causa.
- **RED DE RADAR** (OPCIONES → `RED DE RADAR: NO / AL ENTRAR / SIEMPRE`): dibuja la **malla del
  techo de detección** (`RADAR_ALT`, hoy 20) como un plano en perspectiva con un **barrido** que
  viaja desde el horizonte, al estilo de una pantalla de radar. **Por defecto `AL ENTRAR`**:
  se **funde** cuando el mundo se inclina (rolada deja de leerse como techo) e
  invisible mientras volás por debajo —que es casi todo el juego, y ahí sería ruido sobre algo que
  todavía no te afecta— y **aparece con un fundido al cruzar el techo**, en rojo, latiendo y
  desplegada debajo tuyo, con la línea de umbral punteada a la altura del avión. `SIEMPRE` la deja
  fija para aprender dónde está el techo. La frontera existía desde siempre, pero era invisible:
  se aprendía muriendo.
- **Cañón 20mm** con calentamiento: derriba globos (+150), helicópteros (+300, 2 impactos)
  y misiles (+400). Mástiles, fragatas y agua NO se destruyen — esquivar es la habilidad central.
- **Terreno TIERRA** (`cfg.terrain`, fila TERRENO en OPCIONES): además del mar. Sobre tierra el suelo **es letal**
  (tocarlo = explotás, no rebota): hay que volar en una **banda baja y arriesgada** — bastante arriba para no
  estrellarte, pero bajo para clipear/matar a los **soldados** con el pase rasante (cabeza / impacto de aire).
  Tres formas de eliminarlos:
  - **Atropellar** con el avión a ras del suelo → **puntos × el multiplicador** (a ras con racha = MUCHÍSIMO).
  - **Metralleta** (cañón): tenés que estar **de frente y a distancia** (la bala va baja y alineada).
  - **Misil**: tiene **caída** (arco), así podés estar **un poco más arriba**; explota con splash (mata varios).
- **Misiles del jugador** (arma secundaria, tecla `Z` o botón `◈ MISIL` en táctil): munición limitada
  (3, recarga lenta, pips en el HUD). One-shot con hitbox amplio y guiado leve, +100 de bonus; también
  interceptan misiles enemigos. Van en su propio array (`pmissiles`) que **nunca** toca el hitbox del avión.
  > Nota de seguridad (bug corregido): al derribar un blanco con munición, el objeto muerto podía disparar
  > la colisión del avión el frame siguiente (`o.z=-99` sin `o.done`). Fix: se marca `.done=true` al destruir.
- **Combustible** como reloj del run; se recoge en vuelo. Sin combustible el avión se hunde.
- Récord local (`localStorage`) y fichas históricas reales en cada derribo.

## Controles

| Acción    | Teclado                  | Táctil                          |
|-----------|--------------------------|---------------------------------|
| Gas (subir) | mantener `ARRIBA` / `W` — **si soltás, el avión cae** | arrastrar en el 60% izquierdo (control directo) |
| Esquivar  | `←` / `→` / `A` / `D`    | ídem arrastre                   |
| Picada    | `ABAJO` / `S`            | —                               |
| Disparar  | `X` / `ESPACIO` / `K`    | mantener derecha-arriba         |
| Turbo     | `SHIFT` / `C`            | mantener derecha-abajo          |
| Cámara    | `V` — cicla 4 cámaras: **1× → 1.5× → 2× → 2.5×** (siguen al avión) | — |
| Idioma    | `L` (cambia es ↔ en)     | —                               |
| **Piruetas** | **combo de dos toques** direccionales (ver abajo) | — |

### Piruetas (los "poderes")

Once maniobras de caza que se disparan con un **combo de 3 o 4 toques direccionales** (cada uno a
menos de 0.28 s del anterior), al estilo de un juego de pelea. Durante la maniobra **el avión no se
controla**, salvo el eje que cada una deja libre. Funcionan igual con joystick (cruceta o stick).

| combo | maniobra | | combo | maniobra |
|---|---|---|---|---|
| `←←←` / `→→→` | BARREL ROLL (tonel) | | `↓←←` / `↓→→` | BREAK TURN |
| `↑↓↓` **volando alto** | SPLIT-S | | `←→←` / `→←→` | S-TURN |
| `↑↓↓` **volando bajo** | TERRAIN MASKING | | `↑←→` / `↑→←` | JINK |
| `↓↑↑` **volando bajo** | POP-UP | | `↓→↑←` / `↓←↑→` | TONEL BARRIL (la "O") |
| `↓↑↑` **volando alto** / `↑↓↑` | HIGH YO-YO | | `←↓←↓` / `→↓→↓` | TIRABUZÓN |
| `↓↑↓` | LOW YO-YO | | | |

> ⚠️ **"Volando alto / bajo" es la ALTURA DEL AVIÓN, no una dirección más del combo.** El mismo
> combo hace cosas distintas según tu altitud — el juego elige la maniobra que tiene sentido donde
> estás. Regla práctica: **si el HUD marca ×10 o ×5 estás BAJO; si marca ×1, ALTO**.

**Ninguna se hace con dos toques, y es a propósito.** Antes los 16 pares posibles estaban ocupados
y —como las teclas de combo son las de volar— el avión parecía manejarse solo: bombear gas lanzaba
un yo-yo, corregir el rumbo lanzaba un S-turn. Con un mínimo de tres toques el PASILLO ya no
produce secuencias completas, y **ninguna maniobra usa repetición vertical**, así que bombear gas
(`↑↑↑↑↑`) no puede disparar nada.

**Las secuencias dibujan la maniobra**: `↓→↑←` es la vuelta completa del tonel barril (una O),
`←↓←↓` baja sin cambiar de lado como el tirabuzón, `↓←←` es picar y empujar al costado.

Se apagan desde OPCIONES → **PIRUETAS: SI/NO** (el tonel queda siempre).
**Tabla completa** — duración, qué controlás, si podés disparar o usar turbo, y economía de
energía: **[docs/PIRUETAS.md](docs/PIRUETAS.md)**.

**Idiomas:** el juego está internacionalizado (i18n). Se elige el idioma por, en orden, `?lang=xx`
en la URL, `localStorage 'rasante_lang'`, el idioma del navegador, o español por defecto. La tecla
`L` lo cambia en vivo. Hoy vienen español e inglés; agregar otro es traducir un bloque en `STRINGS`.

**Vuelo a gas:** la gravedad tira siempre (`G=22 m/s²`); mantener ARRIBA empuja (`TH=55`);
ABAJO acelera la caída (`DIVE=30`). Sin gas desde 12 m tocás el agua en ~1 s; en la zona
x10 (~4 m) el margen es ~0,5 s. Sin combustible no hay empuje: el avión se hunde solo.
En táctil se mantiene el control directo por arrastre (más manejable en pantalla chica).

## Arte (pipeline Photoshop)

Todo el arte actual es **placeholder dibujado por código**. Resolución nativa del
juego: **320×180 px** (escala limpia a 720p/1080p/4K). Para reemplazar:

- Avión (vista trasera): hoy se dibuja con rects en `drawPlaneSprite()`; un sprite
  de ~**40×16 px** con 2–3 frames de alabeo (nivel / banqueo izq / der) lo reemplaza directo.
- Obstáculos: se dibujan escalados por distancia (`drawObstacle`, factor `k` = px por metro),
  así que conviene dibujarlos grandes (p. ej. 48 px) y dejar que el juego los achique.
- Paleta corta (16–32 colores), en el objeto `P` del script: cielo plomizo `#2a3540`,
  mar `#2e4a4e`, metal/bruma `#93a7ab`, acento naranja `#e8a33d`.
- Exportar PNG sin suavizado (vecino más cercano) a `assets/`.

### Embeber assets configurables (`tools/embed_asset.py`)

Los assets "enchufables" (cockpit del MOMENTUM y los 3 iconos de la barra de objetivo) se
embeben como data URI con un comando — **no hace falta tocar código**:

```bash
python3 tools/embed_asset.py cockpit assets/cockpit.png     # marco de cabina (MOMENTUM)
python3 tools/embed_asset.py obj_port assets/obj_puerto.png # extremo izq. barra objetivo
python3 tools/embed_asset.py obj_barge assets/obj_barcaza.png
python3 tools/embed_asset.py obj_plane assets/obj_avion.png
python3 tools/embed_asset.py cockpit --clear                # volver al placeholder por código
python3 tools/check_syntax.py                               # verificar después de embeber
```

Idempotente (correrlo de nuevo reemplaza el asset anterior). PNG o WebP con transparencia.
**Cockpit**: proporción 320×180 (ideal 640×360), centro transparente — specs completas en
`docs/UPDATE_ANIMATIONS.md` §3.2b. Pipeline verificado end-to-end con una imagen de prueba.

## Tuning

Los números del gamefeel están en el `<script>` de `index.html`:

- Velocidad base y techo: `spdBase = Math.min(150, 62 + t*2.8)` · turbo: `*1.5` · tope base `280`
- Aceleración por racha: `rachaVel = 1 + rasLevel*0.12 + (x10: 0.10 / x5: 0.05)`, con suavizado `dt*3`
- **Afterburner sostenido:** aguantar **BOOST + RASANTE** (bajo) sube un escalón cada
  `AFTER_STEP = 2` s (hasta `AFTER_MAX = 5`). Cada escalón multiplica la velocidad
  (`+AFTER_GAIN = 0.16` acumulativo) **y sube el techo** (`+AFTER_CAP = 42` → hasta 490).
  Soltar turbo o trepar lo resetea (gracia `0.4` s para bobs cortos). HUD: `»n`; popup `TURBINA ×n`
- Viento: se acumula sobre `plane.y > 16` (tope 6 s, ~0,8 s de gracia), frena hasta
  `-35%` (`windF`), decae al doble de velocidad al bajar; turbulencia bajo `windF < 0.97`
- Despegue: duración 3 s (`toT`), rotación a `1.35` s, tierra firme `COAST = 230` m,
  primer obstáculo en `nextSpawn = 320` m
- Agilidad: aceleraciones `115/105`, velocidades máx. `±30/±24`
- Bandas de multiplicador: `multOf()` · radar: `alt > RADAR_ALT` (20)
- **Capas del cielo** (`SPAWN_Y` en `data/tuning.js`, una sola fuente para los tres terrenos):
  pájaros `5-10` · helicópteros `10-15` · cazas `15-25` · globos `6-30`. Son alturas de
  NACIMIENTO: la banda que realmente toca suma los semiejes de `core/hitbox.js` (±2.6 los
  aéreos), o sea helos letales `7.4-17.6` y cazas letales `12.4-27.6`
- Fragata (`mast`): alto fijo `SHIP_H = 6.5` (el del sprite horneado) — se le pasa por arriba
  desde ~8 m; el casco barre ±5 por debajo de `HULL_Y = 3.6`
- Racha rasante: 2 s por nivel (`Math.floor(streak/2)`), tope x30 (`rasLevel` máx. 4), gracia `0.45`
- Estela: arranca bajo 9 m (`lowI = 1 - alt/9`) · rocío: umbrales `2.8 / 4.5 / 7` m en `nSpray`
- Densidad de obstáculos: `nextSpawn = max(34, 52+rnd*42 - t*0.8)` (en metros)
- **Alcance de visión**: `SPAWN_Z = 320` (`data/tuning.js`) — a qué profundidad nace todo lo que
  viene del horizonte. Es tiempo de reacción: a velocidad de crucero da ~1,9 s desde que aparece
  hasta que te alcanza (con 250 eran ~1,5 s). **No confundir con el campo de visión** (`F` en
  `render/ctx.js`): bajar `F` abre el ángulo pero achica *todo*, incluido lo que querés ver antes.
  Las bandas de comportamiento (AA, caza que dispara, alcance de balas) no se movieron: se ven
  antes, no atacan antes
- Combustible: drenaje `3.2` (+`4.2` con turbo), bidón `+30` · **toggle en OPCIONES**:
  fila COMBUSTIBLE SI/NO (`cfg.fuelOn`) — con NO no hay drenaje ni spawn de bidones.
  **Por defecto arranca en NO** (tanque infinito) hasta rebalancear el reloj de combustible
  (la ruta óptima de bidones es ROADMAP #28); se enciende desde OPCIONES
- Ventana de near-miss: margen `< 3` en el chequeo de paso (`dx < 3 && dy < 3`)
- Perfil de colisión del avión: `pw=2.1, ph2=1.0` (afinado; antes 2.6×1.2) — en PIRUETA `1.0×0.7`
- **PIRUETA (tonel)**: doble-tap `←`/`→` (ventana 0.24s) → tonel de `ROLL_DUR=0.55s`, cooldown
  `1.15s`, dash lateral `vx = dir*40*(0.45+rollT/DUR)`. Alas de canto = perfil mínimo → pasa por
  huecos finos. Rozar un obstáculo **durante** la pirueta: `+250` (vs +75). Visual: rotación 360°
  del sprite + 2 fantasmas translúcidos + estelas de viento.
- **PIRUETAS de combate** (8 más, `data/moves.js` + `systems/moves.js`): mismo cooldown de `1.15s`,
  perfil fino en las banqueadas (split-s, break turn, s-turn, jink). Los pares `↓↓`/`↑↑` se
  resuelven por **altura del avión** contra `MV_HI=18` / `MV_LO=14`. Ver
  [docs/PIRUETAS.md](docs/PIRUETAS.md)

## Flujo de pantallas y modos

> **Vocabulario:** todo run combina dos FASES — **PASILLO** (el vuelo rasante de siempre, estado
> `'play'`) y **ARENA** (el asalto al buque, volado en 3D — ver más abajo). Los modos del menú son
> combinaciones de las dos. Detalle técnico en `docs/ARQUITECTURA.md`.

Al arrancar aparece una **pantalla de selección de modo** (estado `'modeselect'`):

```
modeselect ─► CAMPAÑA (HISTORIA)  ─► takeoff (avión y config fijos)  ─► PASILLO (NIVEL 1 → 2 → …) ─► ARENA
           ├► CICLO DE MUERTE     ─► menu (avión)                  ─► PASILLO (objetivo: barcaza) ─► ARENA
           ├► POR LA PATRIA       ─► menu (avión)                   ─► PASILLO infinito (nunca entra a ARENA)
           ├► MINUTOS SAGRADOS    ─► menu (avión)                        ─► directo a ARENA (sin PASILLO)
           ├► OPCIONES  (LA pantalla de configuración: control, controles, partida, mapa…)
           └► SALIR
```

**MINUTOS SAGRADOS** es el modo que juega solo la fase ARENA: entra derecho a la batalla contra el
buque elegido, y al ganar o perder **encadena otra batalla al azar** — nunca cruza al PASILLO ni al
camino de CICLO DE MUERTE.

**La diferencia clave entre CAMPAÑA / CICLO DE MUERTE / POR LA PATRIA es el OBJETIVO FINAL:**
- **Con objetivo** (campaña y ciclo de muerte): hay una meta en metros (puerto → barcaza británica). Durante
  el vuelo se dibuja una **barra de misión centrada** (~**30% del ancho**, `drawObjectiveBar`) con el nombre
  real de la barcaza arriba (`SHIPS`: HMS Sheffield, Coventry, Ardent, Antelope, RFA Sir Galahad, Atlantic
  Conveyor). El avión avanza por la línea según el progreso (`dist/objectiveDist`); el turbo se marca con líneas.
  Al llegar, el run termina (estado según modo). `objectiveDist` = 0 significa sin objetivo.
  - **Assets configurables** de la barra (`OBJ_ASSETS` en `index.html`): `port` (puerto, izq), `barge`
    (objetivo, der) y `plane` (avión que avanza). Hoy tienen `src:''` → se dibuja un **fallback**. Cuando haya
    imágenes: embeberlas como data URI en `OBJ_ASSETS.<k>.src` (mismo método que los aviones — ver más abajo);
    `drawHudAsset()` las usa automáticamente (escala por alto, mantiene aspecto).
- **Sin objetivo** (supervivencia): distancia infinita, solo junta puntos. No hay barra ni metros.

### CICLO DE MUERTE (nuevo)

Como un nivel suelto pero **sin cinemáticas ni orden**: `randomizeCfg()` aleatoriza el mapa (fondo, agua,
viento, obstáculos) en cada entrada al modo. Al acercarse a la barcaza arranca el **asalto por pasadas
(MOMENTUM, ver abajo)**; destruir el puente en la pasada final → tarjeta **BARCAZA DESTRUIDA** (`drawObjective`)
→ vuelve al menú con config nueva. Los **metros totales** (puerto→barcaza) se ajustan en OPCIONES,
fila `METROS`, dentro de la sección *SOLO CICLO DE MUERTE* — necesario para pruebas.

### ARENA — el asalto al buque (fase, no minijuego)

> ⚠️ **Esta sección describe el MOMENTUM viejo — hoy es solo el fallback sin 3D** (build web con
> `?no3d`, o si WebGL falla). Con three.js disponible (Electron y el build web normal), el asalto
> es la fase **ARENA**: el avión **vuela de verdad en los tres ejes** (gas contra gravedad, la mira
> dirige el morro) dentro de un ring 3D abierto alrededor del buque — no una cámara sobre rieles.
> Salirte del ring no mata: el juego avisa y te reencara solo. Todas las zonas están vivas a la
> vez, el buque dispara flak con predicción (con el radar vivo te apunta a donde vas a estar) y
> cada impacto consume un avión del **escuadrón**; chocar el mar o el casco también mata. 1ª
> persona por defecto (cabina), 3ª con `[V]`. Código: `src/systems/arena.js` (vuelo y combate),
> `src/systems/three-arena.js` (el mundo 3D), `src/render/arena.js` (overlay). El modo
> **MINUTOS SAGRADOS** juega solo esta fase, batalla tras batalla. Detalle completo y las
> decisiones de diseño: `docs/PROMPT_ARENA_VUELO_LIBRE.md`.

Aplica en **ciclo de muerte y campaña** (todo modo con `objectiveDist > 0`). Al alcanzar ciertas fracciones
de la distancia objetivo, el tiempo se **ralentiza** (el mundo corre al 35%), aparece la **barcaza a lo
largo de la pantalla** (crece a medida que te acercás) y se abre un minijuego de puntería:

- **La barcaza se ve venir**: desde el **45%** del recorrido aparece durante el PASILLO
  (`drawApproachBarge`) como **silueta con bruma anclada a la línea del horizonte** (misma
  perspectiva que los obstáculos, que pasan sólidos por delante y se leen claro) y **crece**;
  recién sobre el final baja/se acerca (ease-in cuadrático) hasta empalmar con la pasada del
  momentum. Entre pasadas sigue creciendo donde quedó.
- **Aproximación lenta en cámara lenta**: dentro de cada pasada el barco crece de **0.82× a 0.98×** de
  su escala (`momShipGeom`) y el mundo corre al **30%** — deriva lentísima hacia el blanco.
- **Ambiente bullet-time** (`mom.fx`): **trazadoras de la AA** del barco pasando de largo con estela
  (lentas, visuales, no dañan), **bocanadas de flak** expandiéndose despacio en el cielo y
  **rocío/escombros** derivando por los costados del vidrio. Densidades y velocidades en el bloque
  de FX de `updateMomentum` (2.6 / 3.6 / 1.1 por segundo; ~26-56 px/s).
- **Cámara DESDE ADENTRO (cockpit)**: durante el momentum se ve desde la cabina (`drawCockpit`),
  con el **asset real embebido** (`assets/original/cockpit_sky.png`: cabina pixel-art completa con
  manos, tablero y palanca; vidrio transparente y visor HUD semitransparente). Bob de vuelo +
  parallax inverso a la mira; al disparar, **fogonazos + trazadoras gemelas** por encima de las
  manos del piloto. **Apuntar = girar la trompa**: la mira queda fija al visor HUD del cockpit y
  las flechas panean el MUNDO detrás del vidrio (`momCam()`) — el blanco "viene" al visor, como
  maniobrar el avión de verdad. Para cambiar el asset: `python3 tools/embed_asset.py cockpit <archivo>`.
- **Mira libre** con flechas/WASD; el barco **se balancea y cabecea** → hay que corregir todo el tiempo.
- **Cañón por ráfagas lentas [X]**: una bala gruesa cada **0.5s** con **45 de daño**, que sale
  del ala (alternando lado) y viaja a 150 px/s (~1.3s) en **balística pura al punto apuntado**
  (sin tracking) con **dispersión** que se abre al rolar. RADAR = 1 hit preciso · AA = 2 ·
  PUENTE = 3. Ventanas de pasada más cortas (4.5–5.5s): cada tiro errado cuesta.
- **Misiles [Z]** también en primera persona: salen del ala (alternando lado), vuelan **lentos**
  (~2.1s, bullet-time) con lock al punto apuntado al disparar, y explotan con **80 de daño en área**
  — un misil mata una AA o el radar; el puente pide misil + cañón. Misma munición que el
  PASILLO (pips `Z ▪▪▪` junto a la barra de tiempo; la recarga se pausa en cámara lenta).
- Mantener **[X] fuego sostenido** sobre una **zona crítica** (corchetes titilantes + barra de HP) la destruye.
- **3 pasadas** (`MOM_PHASES`): al **78%** → los 2 **cañones AA** (barco chico) · al **90%** → el **radar**
  (más cerca, blanco chico en el mástil) · al **100%** → el **PUENTE** (barco gigante, mucha HP).
- Entre pasadas volvés al PASILLO — **hay que seguir volando** (el gas sigue mandando).
- Cada zona destruida da puntos (`pts`) + bonus por pasada completa (`500×pasada`).
- **Ventana de tiempo por pasada** (barra abajo): si se agota, la defensa te derriba (`death_aa`).
- La pasada final destruye la barcaza **de verdad** → fin de nivel exitoso.

**Layouts por clase de barco** (`MOM_LAYOUTS` + `SHIP_CLASS`; `randomShip()` fija el del run):

| Clase | Barcos | Pasadas |
|---|---|---|
| **Tipo 42** (destructor) | SHEFFIELD, COVENTRY | 2× CAÑÓN AA (55hp) → RADAR (45) → PUENTE (130) |
| **Tipo 21** (fragata) | ARDENT, ANTELOPE | 2× CAÑÓN AA (55) → RADAR chico (50) → **2× MOTOR** al nivel del casco (70 c/u, ventana 8s) |
| **Logístico** | SIR GALAHAD, ATLANTIC CONVEYOR | AA única (70) → **DEPÓSITO** grande (110, fácil de pegar) → PUENTE a popa (100) |

**Tuning** (todo en `MOM_LAYOUTS` y `updateMomentum` en `index.html`): `at` (dónde arranca cada pasada,
igual en todas las clases), `time` (ventana), `maxHp` (dificultad por zona), `pts`, daño de la ráfaga
(`22` cada `0.36s`), velocidad de la mira (`CS=98`), amplitud del balanceo (`momShipGeom`).
**Pendiente**: soporte táctil del minijuego (hoy la mira es solo teclado) y sprite real del barco
(placeholder por rects; pedido en `docs/UPDATE_ANIMATIONS.md`).

- **Supervivencia** (`gameMode='survival'`): juntar puntos infinitamente hasta morir. Pasás por el menú
  de **selección de avión**. La configuración del mapa está en OPCIONES, antes de elegir el modo.
  Desde ese menú, `[ESC]` vuelve a la pantalla de modo.
- **Campaña / Historia** (`gameMode='campaign'`): **no** pasás por selección — usa un **avión fijo**
  (`CAMPAIGN_PLANE`, hoy el A-4 Skyhawk) y una **config por defecto** (`CAMPAIGN_CFG`). Por niveles:
  arriba se muestra `NIVEL n`; al alcanzar la distancia objetivo (`goalDist`) aparece una **tarjeta de
  transición** (placeholder de cinemática) → siguiente nivel, con puntaje acumulado. Tras el último →
  `CAMPANA COMPLETADA` → vuelve a la pantalla de modo.
  - **POR AHORA todos los niveles de campaña usan la MISMA config** (`CAMPAIGN_CFG`); solo cambia el
    label `NIVEL n`. A futuro: una `cfg` distinta por nivel (cada objeto de `LEVELS` puede llevar su cfg).

### Pantalla de HISTORIA (campaña)

Al elegir CAMPAÑA corre una **secuencia de pantallas de historia** (fondo negro estilo
expediente: grano de película + scanline + marco + puntitos de progreso), con **`epic_himno.mp3`**
de fondo. Cada **Cinemática** de `docs/NIVELES.md` es una pantalla (`{title, paras}`) y la de **NIVEL**
es la previa al despegue (`{level, obj}`, centrada). El texto se **tipea letra por letra con
ruido** (lento: 19 cps, pausas largas entre párrafos). Tecla/tap: completa el tipeo → pasa a la
siguiente → en la del nivel arranca el **despegue con fade desde negro**. ESC vuelve al menú.
Implementadas: `storyIntro` (3 cinemáticas iniciales + NIVEL 0) y `storyL1` (La Flota + NIVEL 1);
agregar más = escribir el array `storyLN` en `STRINGS` (es/en) y setear `LEVELS[n].story`.
`docs/NIVELES.md` es la fuente de verdad del guión completo (12 niveles + cinemática final + créditos).

### ⚠️ Campaña — PENDIENTE (estructura lista, contenido a futuro)

Hoy la campaña tiene **solo 2 niveles de PRUEBA** (`LEVELS` en `index.html`) que apenas cambian el
mapa y el label `NIVEL 1` / `NIVEL 2`. Falta definir a futuro (a pedido):

- **X niveles reales** con progresión de dificultad y objetivos propios (agregar objetos al array `LEVELS`;
  cada uno lleva `name`, `goalDist` y un `cfg` de mapa). Hoy `goalDist` es distancia; se puede cambiar a
  objetivos (hundir X fragatas, sobrevivir, llegar a un punto, etc.).
- **Cinemáticas entre niveles**: hoy es una tarjeta de texto placeholder (`drawLevelClear` / `drawVictory`).
  Reemplazar por la cinemática real (imágenes/animación/relato) — dejar el gancho en el estado `'levelclear'`.
- **i18n**: los textos de config y de las tarjetas de campaña están hardcodeados en español (ASCII).
  Al cerrar el contenido, pasarlos al sistema `STRINGS`/`T()` como el resto.

## OPCIONES — la pantalla de configuración

**Toda** la configuración vive en **OPCIONES**, que se alcanza desde la selección de modo — o sea
también antes de la campaña. Se navega con flechas (arriba/abajo elige fila, izq/der cambia el valor)
y `[ESC]` vuelve. La lista está partida en secciones, y las de prototipado dicen a qué modos afectan:

| sección | qué hay |
|---------|---------|
| JUEGO | idioma |
| CONTROL Y VISTA | control (directo / por alabeo), horizonte, piruetas, mira, red de radar |
| CONTROLES | teclado y joystick, **solo lectura** |
| PARTIDA | escuadrón (vidas), combustible, energía, enemigos móviles |
| AMBIENTE · *no en la campaña* | fondo (8 cielos), agua |
| MAPA · *solo POR LA PATRIA y CICLO DE MUERTE* | terreno, viento, obstáculos, bombardeo, costa, pista, acantilado, arranque |
| SOLO CICLO DE MUERTE | metros |
| SOLO MINUTOS SAGRADOS | buque |
| DEPURACIÓN | hitboxes, modo cámara |

Todo **persiste** entre sesiones menos DEPURACIÓN, que arranca siempre apagada a propósito (MODO
CÁMARA deja el mundo sin avanzar solo; encontrárselo puesto se leería como que el juego se rompió).

> El menú `[M]` **ya no existe**. Se abría solo desde la selección de avión, una pantalla por la que
> la campaña nunca pasa — y varias de sus filas (ESCUADRÓN, COMBUSTIBLE, ENERGÍA, PIRUETAS) sí
> afectan a la campaña, porque `CAMPAIGN_CFG` únicamente pisa `sky/water/wind/obstacles/coast`.

El objeto `cfg` es lo que lee todo el juego; agregar una característica nueva = sumar campo a `cfg`
+ fila a `OPT_ROWS` (con `save:` si tiene que persistir) + leerla donde corresponda.

> Nota: "flying sobre tierra" (todo el nivel sobre terreno, no mar) requiere un render de terreno — hoy solo
> hay agua + un tramo de costa/pista al inicio. Pendiente si se quiere un nivel íntegramente terrestre.

## Selección de avión

Antes de despegar hay una **pantalla de selección** (5 aviones). Se elige con `←`/`→` (o tap
izquierda/derecha en táctil) y se arranca con `ENTER`/`X`/`ESPACIO` o tap central. El sprite
elegido (`selPlane`) se usa en el juego. Aviones y sus sprites (`assets/`, embebidos como data URI):

| Avión           | Archivo            | Estado |
|-----------------|--------------------|--------|
| A-4 Skyhawk     | `sky_op.webp`      | jugable |
| IAI Dagger      | `dagger_op.webp`   | jugable |
| Super Étendard  | `supere.webp`      | jugable |
| A-4Q            | `a4q.webp`         | jugable |
| Pampa 63        | `pampav1_op.webp`  | jugable |

> **PENDIENTE (a pedido — implementar más adelante): características distintas por avión.**
> Hoy los 5 aviones son **solo estéticos** (mismas físicas). La intención de diseño:
> - **A-4 Skyhawk:** equilibrado, protagonista de la campaña.
> - **IAI Dagger:** más rápido y con más potencia de fuego, pero más difícil de controlar.
> - **Super Étendard:** desbloqueable para misiones especiales con misiles Exocet.
> - **A-4Q:** variante naval, similar al A-4B/C.
> - **Pampa 63:** (definir stats).
>
> Al implementarlo: agregar campos de stats en el array `PLANES` (velocidad, empuje/gas, fuego,
> maniobra) y leerlos en la física; sistema de desbloqueo para el Super Étendard; mostrar las
> stats en la pantalla de selección.

## Próximos pasos (ideas)

- [ ] **Características por avión** (ver arriba: velocidad/fuego/maniobra + desbloqueos)
- [ ] Desafío diario por seed compartido (competitivo sin servidor)
- [ ] Corrida de bombardeo: fragata al final del tramo, ventana de altura para armar la espoleta
- [ ] Reabastecimiento en vuelo con KC-130
- [ ] Museo: fichas desbloqueables con hechos y aviones (A-4, Dagger, Super Étendard, Pucará)
- [ ] Sprites propios en Photoshop, sonido con más cuerpo
- [ ] Leaderboard online

*En homenaje a los pilotos y veteranos de Malvinas.*
