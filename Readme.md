# RASANTE

Arcade 2D de vuelo rasante ambientado en el Atlántico Sur, 1982. Homenaje a los
pilotos y veteranos de Malvinas, centrado en la adrenalina del vuelo a ras del mar.

**Jugar:** abrir `index.html` en el navegador (doble clic alcanza — no necesita build ni servidor).

Dos versiones en el repo:

- `index.html` — **vista frontal** (pseudo-3D detrás del avión, estilo After Burner). La principal.
- `lateral.html` — el primer prototipo de scroll lateral, conservado como referencia.

## Música y sonido

- Dos pistas: **`the_weight_of_honor.mp3`** suena en loop en el lobby (menús); **`weight_of_honor_v2.mp3`**
  suena de fondo, en volumen bajo, durante el vuelo. `updateMusic()` cambia según la pantalla.
- **Ícono de sonido** arriba a la derecha (botón `#snd`): togglea mute (persiste en `localStorage`). Muteás
  música + efectos. La música arranca en la **primera interacción** (política de autoplay del navegador).
- A futuro: cambiar soundtracks por **nivel / momento / secuencia** (una pista por contexto).
- **Audio de cámara lenta (MOMENTUM)** — procedural, sin assets: la música se **ahoga** (0.30→0.10,
  lerp suave), el motor baja a un **rumble de 30Hz con latido** (~0.4Hz), sting de entrada con
  pitch cayendo (620→65Hz) y de salida subiendo (110→640Hz), y **ducking**: las explosiones
  grandes agachan la música 0.55s (`duckT`). El disparo de la ráfaga es grave (140→55Hz + ruido)
  y cada impacto suma un thump (88→44Hz). Los **samples finales** quedan para después de la
  migración de assets — los eventos ya están cableados, el swap es mecánico.
- ⚠️ Los MP3 están **embebidos como data URI** para que el artifact suene (CSP bloquea `assets/` externos),
  lo que deja `index.html` en **~10MB**. Es el disparador más claro del pipeline de assets (ver sección de
  arquitectura): al migrar, los MP3 se cargan como archivos y el HTML vuelve a ser liviano.

## El loop (vista frontal)

- **Despegue de Puerto Argentino**: cada run arranca en la pista de la BAM Malvinas con
  cuenta regresiva 3…2…1; el avión carretea y asciende solo, y el control llega a los 3 s
  ("CONTROL LIBRE!"). Se cruza la costa y empieza el mar abierto.
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
  (`drawSeaDots` + `seaH`), que fluye hacia la cámara. Estilo conmutable con `cfg.water` (menú `[M]`):
  `'sea'` (tono Atlántico, por defecto) o `'violet'` (neón tipo boostivity). Paletas en `WATER_STYLES`.
- Tocar el agua es fatal. Las olas suben y bajan — el margen nunca es fijo.
- **Turbo**: +60% de velocidad y **puntaje x2**, pero quema combustible mucho más rápido.
- **Near-miss**: rozar un obstáculo sin chocarlo da **+75** (y esquivar un misil también).
- Volar alto llena la barra de **radar**: al detectarte, te lanzan un misil que persigue.
- **Cañón 20mm** con calentamiento: derriba globos (+150), helicópteros (+300, 2 impactos)
  y misiles (+400). Mástiles, fragatas y agua NO se destruyen — esquivar es la habilidad central.
- **Terreno TIERRA** (`cfg.terrain`, fila TERRENO en `[M]`): además del mar. Sobre tierra el suelo **es letal**
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
| Idioma    | `L` (cambia es ↔ en)     | —                               |

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
`UPDATE_ANIMATIONS.md` §3.2b. Pipeline verificado end-to-end con una imagen de prueba.

## Tuning

Los números del gamefeel están en el `<script>` de `index.html`:

- Velocidad base y techo: `spdBase = Math.min(150, 62 + t*2.8)` · turbo: `*1.5` · tope absoluto `280`
- Aceleración por racha: `rachaVel = 1 + rasLevel*0.12 + (x10: 0.10 / x5: 0.05)`, con suavizado `dt*3`
- Viento: se acumula sobre `plane.y > 16` (tope 6 s, ~0,8 s de gracia), frena hasta
  `-35%` (`windF`), decae al doble de velocidad al bajar; turbulencia bajo `windF < 0.97`
- Despegue: duración 3 s (`toT`), rotación a `1.35` s, tierra firme `COAST = 230` m,
  primer obstáculo en `nextSpawn = 320` m
- Agilidad: aceleraciones `115/105`, velocidades máx. `±30/±24`
- Bandas de multiplicador: `multOf()` · radar: `alt > 30`
- Racha rasante: 2 s por nivel (`Math.floor(streak/2)`), tope x30 (`rasLevel` máx. 4), gracia `0.45`
- Estela: arranca bajo 9 m (`lowI = 1 - alt/9`) · rocío: umbrales `2.8 / 4.5 / 7` m en `nSpray`
- Densidad de obstáculos: `nextSpawn = max(34, 52+rnd*42 - t*0.8)` (en metros)
- Combustible: drenaje `3.2` (+`4.2` con turbo), bidón `+30`
- Ventana de near-miss: margen `< 3` en el chequeo de paso (`dx < 3 && dy < 3`)
- Perfil de colisión del avión: `pw=2.1, ph2=1.0` (afinado; antes 2.6×1.2) — en PIRUETA `1.0×0.7`
- **PIRUETA (tonel)**: doble-tap `←`/`→` (ventana 0.28s) → tonel de `ROLL_DUR=0.55s`, cooldown
  `1.15s`, dash lateral `vx = dir*40*(0.45+rollT/DUR)`. Alas de canto = perfil mínimo → pasa por
  huecos finos. Rozar un obstáculo **durante** la pirueta: `+250` (vs +75). Visual: rotación 360°
  del sprite + 2 fantasmas translúcidos + estelas de viento.

## Flujo de pantallas y modos

Al arrancar aparece una **pantalla de selección de modo** (estado `'modeselect'`, 3 opciones):

```
modeselect ─► CAMPAÑA        ─► takeoff (avión y config fijos)  ─► play (NIVEL 1 → NIVEL 2 → …)
           ├► CICLO DE MUERTE ─► menu (avión + [M] config random + METROS) ─► play (objetivo: barcaza)
           └► SUPERVIVENCIA   ─► menu (avión + [M] config)      ─► play (infinito, junta puntos)
```

**La diferencia clave entre modos es el OBJETIVO FINAL:**
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
→ vuelve al menú con config nueva. Los **metros totales** (puerto→barcaza) se ajustan en `[M]` fila `METROS` —
necesario para pruebas. El menú `[M]` está visible en **ciclo de muerte y supervivencia** (la fila METROS solo en ciclo).

### MOMENTUM — asalto final a la barcaza (minijuego)

Aplica en **ciclo de muerte y campaña** (todo modo con `objectiveDist > 0`). Al alcanzar ciertas fracciones
de la distancia objetivo, el tiempo se **ralentiza** (el mundo corre al 35%), aparece la **barcaza a lo
largo de la pantalla** (crece a medida que te acercás) y se abre un minijuego de puntería:

- **La barcaza se ve venir**: desde el **45%** del recorrido aparece durante el vuelo normal
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
- **Cañón por ráfagas lentas [X]**: menos balas, más lentas, más daño — una bala gruesa cada
  **0.36s** con **22 de daño**, que sale del ala (alternando lado), viaja a 150 px/s (~1.3s) y
  **trackea la zona que apuntabas al disparar** mientras el barco se balancea. Mismo DPS que antes,
  pero se VE el bullet-time.
- **Misiles [Z]** también en primera persona: salen del ala (alternando lado), vuelan **lentos**
  (~2.1s, bullet-time) con lock al punto apuntado al disparar, y explotan con **55 de daño en área**
  — un misil mata una AA o el radar; el puente pide combinar cañón + misiles. Misma munición que el
  vuelo normal (pips `Z ▪▪▪` junto a la barra de tiempo; la recarga se pausa en cámara lenta).
- Mantener **[X] fuego sostenido** sobre una **zona crítica** (corchetes titilantes + barra de HP) la destruye.
- **3 pasadas** (`MOM_PHASES`): al **78%** → los 2 **cañones AA** (barco chico) · al **90%** → el **radar**
  (más cerca, blanco chico en el mástil) · al **100%** → el **PUENTE** (barco gigante, mucha HP).
- Entre pasadas volvés al vuelo normal — **hay que seguir volando** (el gas sigue mandando).
- Cada zona destruida da puntos (`pts`) + bonus por pasada completa (`500×pasada`).
- **Ventana de tiempo por pasada** (barra abajo): si se agota, la defensa te derriba (`death_aa`).
- La pasada final destruye la barcaza **de verdad** → fin de nivel exitoso.

**Tuning** (todo en `MOM_PHASES` y `updateMomentum` en `index.html`): `at` (dónde arranca cada pasada),
`time` (ventana), `maxHp` (dificultad por zona), `pts`, DPS del cañón (`60*dt`), velocidad de la mira
(`CS=98`), amplitud del balanceo (`momShipGeom`). Cada barcaza podrá tener **layouts de zonas distintos**
(radar/AA/depósito/motores…) — hoy hay un layout genérico; extender `MOM_PHASES` por barco es el camino.
**Pendiente**: soporte táctil del minijuego (hoy la mira es solo teclado) y sprite real del barco
(placeholder por rects; pedido en `UPDATE_ANIMATIONS.md`).

- **Supervivencia** (`gameMode='survival'`): juntar puntos infinitamente hasta morir. Pasás por el menú
  de **selección de avión** y podés abrir el **menú de configuración `[M]`** para tunear el mapa.
  Desde ese menú, `[ESC]` vuelve a la pantalla de modo.
- **Campaña / Historia** (`gameMode='campaign'`): **no** pasás por selección — usa un **avión fijo**
  (`CAMPAIGN_PLANE`, hoy el A-4 Skyhawk) y una **config por defecto** (`CAMPAIGN_CFG`). Por niveles:
  arriba se muestra `NIVEL n`; al alcanzar la distancia objetivo (`goalDist`) aparece una **tarjeta de
  transición** (placeholder de cinemática) → siguiente nivel, con puntaje acumulado. Tras el último →
  `CAMPANA COMPLETADA` → vuelve a la pantalla de modo.
  - **POR AHORA todos los niveles de campaña usan la MISMA config** (`CAMPAIGN_CFG`); solo cambia el
    label `NIVEL n`. A futuro: una `cfg` distinta por nivel (cada objeto de `LEVELS` puede llevar su cfg).

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

## Menú de configuración de mapa `[M]`

Herramienta para **prototipar niveles**, disponible en el **menú de supervivencia** (después de elegir
ese modo): tecla `[M]` abre el panel. Se navega con flechas (arriba/abajo elige fila, izq/der cambia el
valor) y `[M]`/`ENTER` cierra. (El modo ya no está acá — se elige en la pantalla inicial.) Permite variar:

| Fila         | Valores                                   | Efecto |
|--------------|-------------------------------------------|--------|
| FONDO        | Atardecer / Noche / Tormenta / Despejado  | `cfg.sky` (preset de cielo `SKY_PRESETS`) |
| AGUA         | Mar / Violeta                             | `cfg.water` (paleta `WATER_STYLES`) |
| VIENTO       | Sí / No                                   | `cfg.wind` (viento en altura on/off) |
| OBSTÁCULOS   | Ninguno / Pocos / Normal / Muchos         | `cfg.obstacles` (multiplicador de densidad) |
| COSTA        | Corta / Normal / Larga                    | `cfg.coast` (metros de tierra antes del mar) |

En **supervivencia** estos valores se aplican tal cual (prototipado libre). La **campaña** no usa este
menú: arranca con `CAMPAIGN_CFG` fijo. El objeto `cfg` es lo que lee todo el juego; agregar una característica
nueva = sumar campo a `cfg` + fila a `CFG_ROWS` + leerla donde corresponda.

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
