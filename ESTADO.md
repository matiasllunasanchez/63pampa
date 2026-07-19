# RASANTE — Estado del proyecto

_Documento de continuidad. Última actualización: 18 de julio de 2026._

Resumen de todo lo construido, cómo está armado y por dónde seguir. Pensado para
retomar el proyecto sin tener que releer todo el código.

---

## 1. Qué es

Arcade 2D de **vuelo rasante** ambientado en la Guerra de Malvinas (Atlántico Sur, 1982),
en homenaje a los pilotos y veteranos. Idea rectora: la adrenalina de volar a ras del mar,
como lo hacían los A-4 Skyhawk para evadir el radar de la flota británica.

**Objetivo de diseño:** simple, adictivo, competitivo por puntaje, con un costado de homenaje
histórico sobrio (fichas con hechos reales). Arte pixel-art que el autor hará en Photoshop.

- **Autor:** Matias.
- **Stack:** un único archivo HTML autocontenido, Canvas 2D + Web Audio, sin dependencias ni build.
- **Resolución:** se dibuja en coords lógicas **320×180**, pero el buffer del canvas es **2× (640×360)**
  (`const SC=2`; `ctx.setTransform(SC,0,0,SC,0,0)` al inicio de `draw()`) → texto y arte más nítidos sin
  cambiar el código de dibujo. Escalado a pantalla con `image-rendering: pixelated`. El input mapea por
  el ancho CSS (`canvasPos`), independiente del buffer — no cambia. (Header/footer siguen siendo HTML, nítidos.)
- **Estado general:** prototipo jugable y bastante pulido en gamefeel. Falta reemplazar arte
  placeholder por sprites propios y sumar las mecánicas de "clímax" (bombardeo, desafío diario).

---

## 2. Cómo correrlo y probarlo

- **Jugar:** abrir `index.html` en el navegador (doble clic; no necesita servidor).
- **Para automatizar pruebas** (o si el navegador embebido no abre `file://`):
  ```
  cd /Users/matymun/personal/games/63pampa
  python3 -m http.server 8471 --bind 127.0.0.1
  # luego abrir http://127.0.0.1:8471/index.html
  ```
- **Artifact online (mismo link siempre):**
  https://claude.ai/code/artifact/7802b6a9-e257-4870-9811-d46cc266d0fb
  Flujo de republicación: editar `index.html` → copiar al scratchpad como `rasante.html`
  → volver a publicar pasando ese `url` para conservar el enlace.

---

## 3. Archivos

| Archivo        | Qué es                                                                 |
|----------------|------------------------------------------------------------------------|
| `index.html`   | **Juego principal** — vista frontal pseudo-3D (estilo After Burner).   |
| `lateral.html` | Primer prototipo, scroll lateral (Flappy-like). Conservado de referencia. |
| `README.md`    | Doc de jugador + controles + tuning + pipeline de arte.                |
| `ESTADO.md`    | Este documento.                                                        |
| `assets/`      | Arte fuente. 5 sprites de avión `*.webp` (embebidos en index.html como data URI). |

---

## 4. El game loop (cómo se juega hoy)

Cámara detrás del avión; el mar viene hacia el jugador en perspectiva. Se maniobra en 2 ejes.

**La regla de oro — la altura es todo:**

| Franja de altura      | Velocidad            | Puntaje        | Riesgo                        |
|-----------------------|----------------------|----------------|-------------------------------|
| Ras del mar (<4,5 m)  | máxima (racha acelera) | x10 → x30    | el agua y los obstáculos      |
| Media (5–16 m)        | normal               | x2 – x5        | poco (zona "cómoda/cobarde")  |
| Alta (>16 m)          | cada vez más lenta   | x1             | viento en contra + turbulencia|
| Muy alta (>30 m)      | lenta                | x1             | radar → misil buscador        |

**Bucle de riesgo cerrado:** volar bajo → multiplicador alto → **más velocidad** → menos
tiempo de reacción y más obstáculos por segundo → sobrevivir paga más. Subir para "descansar"
te frena (viento), te expone (radar) y te sacude (turbulencia). No hay refugio gratis.

### Mecánicas implementadas
- **Multiplicador por altura** (`multOf`): x2 / x5 / x10.
- **Racha rasante:** sostener la zona x10 sube el mult cada 2 s → x15 → x20 → x25 → x30
  (tope `rasLevel` = 4). 0,45 s de gracia para saltar una ola sin perderla. Cartel, beep
  ascendente, borde de pantalla encendido, número que tiembla/parpadea.
- **La velocidad la dictan los multiplicadores:** `rachaVel = 1 + rasLevel*0.12 + (x10:+0.10 / x5:+0.05)`.
  Hasta ~+58 % en x30. La velocidad **surge** suave (lerp `dt*3`), no salta.
- **Viento en contra en altura:** por encima de ~16 m la resistencia se acumula con el tiempo
  (`windT`, tope 6 s) y frena hasta **-35 %** (`windF`). Trae ráfagas visibles cruzando el cielo,
  turbulencia (sacudones en x/y + shake) y aviso en HUD. Al bajar, el arrastre se descarga al doble.
- **Cañón 20 mm** con calentamiento (`heat` / `overheat`): globos +150, helicópteros +300 (2 impactos),
  aviones enemigos +250 (2 impactos), misiles +400. Mástiles, fragatas y agua **no** se destruyen
  (esquivar sigue siendo la habilidad central).
- **Terreno TIERRA** (`cfg.terrain: 'sea'|'land'`, fila TERRENO del `[M]`, randomizable en ciclo): además
  del mar. Sobre tierra el suelo **ES LETAL igual que el agua** (tocar el suelo = explota, `groundY=0.5`,
  sin clamp/rebote). Hay que volar en una **banda baja y arriesgada**: arriba de 0.5 (no chocar) pero bajo
  para matar soldados (`plane.y<3` = clip de cabeza / impacto de aire). Se dibuja moorland (`LAND` palette,
  `drawLand()` con matas/rocas de parallax). El rocío/estela/espuma se desactivan (levanta polvo).
- **Soldados** (`soldiers`, array propio — atropellarlos NO mata al avión): spawnean en grupos sobre tierra,
  corren en diagonal. Tres formas de eliminarlos:
  - **Atropellar** a ras (`plane.y<2.6`, alineado, al llegar a `z≈PZ`): **puntos × multiplicador** (a x30 =
    brutal, `120*multShow`). Es la jugada de riesgo/recompensa.
  - **Sangre + tierra:** cada baja lanza `bloodBurst()` (partículas rojas de sangre + marrones de tierra).
    Atropellar además **mancha el sprite** (`bloodSplat`, se acumula y se desvanece ~3 s; se dibuja como
    manchas rojas sobre el morro en `drawPlaneSprite`). Placeholder — el autor hará un sprite ensangrentado.
  - **Metralleta** (cañón): la bala hitea al soldado si va **baja** (`b.y<4`) y **alineada** → hay que estar
    de frente y a distancia. +60 (×2 con multiplicador alto).
  - **Misil**: ahora tiene **caída/arco** (`pm.vy -= 26*dt`), así se puede estar un poco más arriba; explota
    contra el suelo o cerca de soldados con **splash** (mata varios), +130 por soldado.
- **Misiles del jugador** (arma secundaria): tecla `Z` o botón táctil `#msl` (abajo-izq, solo en juego).
  Munición limitada `msl` (máx `MSL_MAX`=3, recarga 1 cada 7 s, cooldown 0.5 s), pips en el HUD. One-shot con
  hitbox amplio + guiado leve; +100 de bonus sobre el valor del blanco; interceptan misiles enemigos.
  Array **propio** `pmissiles`, **jamás** chequeado contra el hitbox del avión (no pueden autoeliminarte).
- **🐞 FIX (bug de munición = choque):** al derribar un obstáculo/misil con munición se seteaba `o.z=-99`
  pero NO `o.done`, así que el frame siguiente el loop de colisión del avión procesaba el objeto muerto y,
  si el avión estaba en su carril, disparaba `die()`. Ahora se marca `.done=true` al destruir (balas,
  misiles del jugador e intercepción de misiles enemigos). Verificado con simulación numérica del orden de
  frames: sin fix → el avión moría por su propia munición; con fix → no.
- **Avión enemigo de frente (`jet`)**: reemplaza parte de los helos en el spawn (helo 10 %, jet 8 %;
  antes helo 18 %). Viene **de frente y cierra más rápido** (`spd+45`) para dar sensación de combate
  aéreo. Blanco aéreo con el mismo trato que el helo (auto-apuntado vertical + hitbox horizontal `5.6`
  = envolvente de colisión, así que todo jet que pueda chocarte también es derribable). Sprite frontal
  placeholder (alas anchas con leve alabeo, fuselaje/canopy, deriva, nariz roja) en `drawObstacle`.
  Verificado por simulación: 0 muertes por colisión al disparar en todo el barrido de altura/velocidad/offset.
- **MOMENTUM — asalto final a la barcaza (minijuego, NUEVO)**: en ciclo de muerte y campaña
  (`objectiveDist > 0`), al llegar al **78% / 90% / 100%** de la distancia objetivo el tiempo se
  **ralentiza** (mundo al 35%: `t -= dt*0.65`), se limpia el campo y aparece la **barcaza horizontal
  a lo largo** (crece por pasada: `scale` 0.55 → 0.75 → 1.0). Minijuego: mover la **mira** con
  flechas/WASD y mantener **[X]** sobre las **zonas críticas** (corchetes + barra HP) mientras el barco
  **se balancea** (`momShipGeom`). Pasadas (`MOM_PHASES`): 2× **CAÑÓN AA** → **RADAR** (blanco chico,
  alto en el mástil) → **PUENTE** (HP 130). Zona destruida = chamuscado + humo + puntos; pasada completa
  = bonus `500×pasada` y vuelta al vuelo (**hay que seguir volando entre pasadas** — el gas sigue rigiendo,
  te podés estrellar). **Timer por pasada**: si se agota → `die('death_aa')`. Puente destruido →
  `finishObjective()` → tarjeta BARCAZA DESTRUIDA (ciclo) o levelclear/victory (campaña).
  Estado: `state='momentum'`, vars `momPhase`/`mom`; lógica `enterMomentum/updateMomentum`; dibujo
  `drawMomentum` (barco por rects placeholder + letterbox + tinte slow-mo). **Verificado end-to-end**
  con harness (`__momTest(fase)` en scratchpad/momharness.html): entrada, daño, destrucción por zona,
  avance de pasada, muerte por timeout, muerte entre pasadas y pantalla final (score 2400).
  **Cámara DESDE ADENTRO (cockpit):** durante el momentum se ve desde la cabina (`drawCockpit`,
  reemplazó a la 3/4 chase `drawMomPlane`): parantes diagonales del canopy, panel de instrumentos
  (2 diales + **luz de cañón** que se enciende al disparar), reflejo del vidrio, bob + **parallax
  inverso a la mira**. Al disparar: fogonazos en las raíces alares (W*0.16 / W*0.82, H-38) y
  **trazadoras gemelas** que convergen en la mira. Marco = **asset configurable** `COCKPIT_ASSET`
  (data URI en `.src`, imagen proporción 320×180 con centro transparente, se dibuja sobredimensionada
  +12px para que el bob no muestre bordes); placeholder por código mientras esté vacío.
  `drawPlaneSprite` normal se salta en este estado. Verificado en harness: hitFx=1 con HP drenando
  (130→126.8) y trazadoras visibles en screenshot.
  **Asset del cockpit EMBEBIDO** (`assets/original/cockpit_sky.png`, 1024×559, 702KB → 936KB base64):
  pixel-art de cabina completa con manos/tablero/palanca; el vidrio viene con **alpha 0** (el cielo
  que se ve en previews es RGB residual en píxeles transparentes — NO hace falta chroma-key) y el
  visor HUD central con alpha 107 (semitransparente). **PUNTERÍA = GIRAR LA TROMPA (mira fija,
  mundo móvil):** la mira queda CLAVADA al visor del cockpit (`MOM_AX=W/2, MOM_AY=40`) y las
  flechas mueven el **punto apuntado en coords de MUNDO** (`mom.cx/cy`); `momCam()` devuelve el
  paneo 2D `{x: cx-MOM_AX, y: cy-MOM_AY}` que se resta en el translate de `draw()` → el mundo
  entero panea detrás del vidrio y el blanco "viene" al visor (como apuntar con el avión).
  Al entrar se apunta a la cubierta (`cy = deckY-8`). Clamps de paneo: cx ∈ W/2±60, cy ∈ [44,122];
  los fondos (cielo + filas del mar/tierra en `drawSea`) se extendieron a **±70 px** para que el
  paneo no exponga bordes. Hit-test directo mira-vs-zona (mismo espacio, sin offset). La cabina
  va clavada a pantalla (solo bob, sin parallax: la cabina ES la trompa). Popups fijos se spawnean
  en `visor + momCam()`. Verificado en harness: paneo horizontal hasta cmx=-23 sin bordes expuestos,
  blanco entrando al visor, hitFx=1 y HP drenando (55→51.4).
  **FX de cámara lenta (NUEVO):** array `mom.fx` (tope 70, spawn/update en `updateMomentum` — corre
  también en el outro —, dibujo en espacio-mundo en `drawMomentum` antes de la cabina). Tres tipos:
  `'tr'` **trazadoras AA** (nacen en el barco, vuelan LENTO ~26-56 px/s hacia un punto de fuga fuera
  de pantalla, estela doble que se alarga con `T`; visuales, no dañan), `'st'` **rocío/escombros**
  (nacen DENTRO del vidrio visible —x 56-116 desde el borde, y 15-70, porque los parantes tapan
  x<52/x>268 y el panel y>62— y derivan hacia afuera), `'fk'` **flak** (bocanada: fogonazo warn
  0.14s → humo gris expandiéndose despacio). Densidades: 2.6/3.6/1.1 por segundo. Además el avance
  se hizo MÁS LENTO: crecimiento del barco 0.82→**0.98** (antes 1.08; `drawApproachBarge` empalma
  con 0.98) y mundo al **30%** (`t -= dt*0.70`). Verificado con harness de densidad x12: trazadoras
  visibles cruzando el vidrio, nfx creciendo.
  **Trazadoras del jugador desde FUERA de la cabina (FIX):** antes nacían en el panel (W*0.16,
  H-38 = adentro). Ahora nacen fuera de pantalla a la altura del vidrio lateral (**(-40,66)** y
  **(W+40,66)**), se dibujan **ANTES** de `drawCockpit` → el marco/panel las tapa y solo se ven
  entrando por los vidrios laterales y convergiendo en el visor. Más gruesas: pasada de **glow**
  (`lineWidth 3`, warn, alpha 0.30) + **núcleo** (`lineWidth 1.6`, accent, alpha 0.9). Los
  fogonazos del capó se eliminaron (los cañones están en las alas, fuera de vista); queda la
  chispa de impacto en el visor. OJO: un linter reformateó `index.html` (indentación 4 espacios,
  espacios en operadores) — el código es el mismo.
  **MISILES en primera persona (NUEVO):** `Z` (o botón táctil) lanza en momentum. `momLaunchMissile()`
  usa la MISMA munición `msl` (pips `Z ▪▪▪` a la izquierda de la barra de tiempo; cd 0.6s;
  la recarga `mslRegen` queda pausada en cámara lenta). Sale del ala alternando lado
  (`±95` desde el visor, y `H-30` = detrás del panel), vuela **LENTO** (85 px/s, ~1.7s de vuelo)
  con guiado hacia el punto apuntado AL DISPARAR (lock, no persigue), deja estela de humo y
  explota con **55 de daño en área** (rect de zona ±9): 1 misil mata una AA (55hp) o el radar
  (45hp); el puente (130) necesita cañón + misiles. Helpers: `momZoneKilled(z)` (destrucción
  compartida cañón/misil — el bloque inline del cañón se refactorizó a esto), `momMissileBoom(x,y)`.
  El misil es un fx `k:'ms'` en `mom.fx` (guiado en el update de fx → sigue volando en el outro).
  `tryLaunchMissile()` rutea a `momLaunchMissile()` si `state==='momentum'` (cubre el botón táctil;
  `mslBtn` visible ahora en play Y momentum). Verificado: lanzamiento real en harness (msl 3→2,
  pip gastado, misil avanzando (65.9,194)→(78.5,176.6)) + sim numérica del guiado: impacto a los
  1.73s en (157,88), dentro del splash del puente.
  **CAÑÓN por ráfagas lentas (reemplaza al hitscan, NUEVO):** menos balas, más lentas, más daño
  por bala — mismo DPS (~61): **22 de daño cada 0.36s** (`mom.shotCd`). Cada bala es un fx `k:'sh'`:
  nace en el ala (alternando `mom.gunSide`, origen `cmw.x ± 40/W+40, cmw.y+66` = fuera del vidrio),
  viaja a **150 px/s** (~1.3s de vuelo) hacia el punto apuntado AL DISPARAR; si había una zona bajo
  la mira guarda `zi` y **trackea el centro vivo de la zona** (el barco se balancea → la bala curva).
  Impacto: chispas + `-22` (destrucción vía `momZoneKilled`); sin zona → solo chispas. Render: trazo
  grueso glow (lineWidth 3) + núcleo (1.6) que se alarga en vuelo. Las líneas fijas de trazadoras
  gemelas SE ELIMINARON (las balas viajando son las trazadoras). `mom.hitFx` pasó de booleano a
  **flash decadente** (`-dt*5`, se setea 1 al impactar) — sigue manejando luz de cañón/mira/chispa.
  El **misil** bajó de 85 a **70 px/s** (~2.1s). Verificado: spawn con `zi:0` lock, avance
  (-36.9→-19.8) + sim numérica con sway: puente destruido en 3.15s / 6 impactos.
  **Resplandor de disparo (feedback, NUEVO):** al disparar cañón (0.14s) o misil (0.22s) se
  enciende un fogonazo en el borde del vidrio del lado del ala que disparó (`mom.flashL/flashR`,
  decaen en el bloque FX, se dibujan en pantalla DESPUÉS de `drawCockpit` — la luz baña el marco).
  Placeholder: cuadrados blancos + halo; asset futuro `muzzle_flash.png` (UPDATE_ANIMATIONS §3.2c).
  Razón: la bala tarda ~1.3s en cruzar el vidrio y sin flash el disparo parecía no responder.
  Verificado en harness: flash visible en borde izq al apretar X, decayendo (0.14→0.06).
- **HITBOXES AFINADAS + PIRUETA (tonel) — NUEVO (19/7):**
  - **Perfil del avión afinado**: en el chequeo de obstáculos era `2.6×1.2` (chocaba "de lejos");
    ahora `pw=2.1, ph2=1.0`. En un hueco de 5.7 m entre mástiles el margen por lado pasó de 0.25
    a 0.75. La ventana de near-miss (`dx<3 && dy<3`) quedó igual → más roces premiados.
  - **PIRUETA (tonel / aileron roll)**: **doble-tap ←/→** (fresco, `!e.repeat`, ventana 0.28s,
    timestamps `tapL/tapR`) dispara `startRoll(dir)`. Dura `ROLL_DUR=0.55s`, cooldown 1.15s.
    Efectos: (1) **ráfaga lateral** `vx = dir*40*(0.45+rollT/DUR)` (dash, movió x 0→24.7 en el
    test); (2) **perfil de colisión MÍNIMO** `1.0×0.7` (alas de canto → pasa fino; margen 1.85 en
    el hueco de ejemplo); (3) hitbox vs misil enemigo también se encoge (3/2.2 → 1.6/1.2);
    (4) **rozar EN pirueta** = `rollGraze` **+250** (vs +75 normal, popup accent, i18n es/en).
  - **Visual**: el sprite (vista trasera) rota **360° completos** en el plano de pantalla
    (`rollDir*pr*2π`) con leve pulso de escala coseno + **2 fantasmas translúcidos** retrasados
    en el giro (alpha 0.14) + estelas de viento (`P.crest`) despedidas hacia el lado contrario.
    Verificado con harness pausable (`__pose(pr)`): poses a 38% y 62% muestran giro + ghosting.
  - Hint en pantalla de inicio (`ctrl2`): "doble ←/→: PIRUETA". **Pendiente**: gesto táctil
    (doble-tap lateral en la zona de vuelo) y quizá bonus de racha por piruetas encadenadas.
- **PANTALLA DE HISTORIA (campaña, NUEVO 19/7):** al elegir CAMPAÑA ya no se va directo al
  despegue: `startCampaign()` → `initStory()` → `state='story'`. Pantalla negra tipo "expediente"
  (grano de película parpadeante, banda de scanline bajando, marco fino) donde el texto se tipea
  **letra por letra con ruido** (tick `beep(1300+rnd*1100, 0.014)` por carácter, CPS=30, pausas
  0.10s por línea / 0.55s por párrafo). Contenido de **NIVELES.md** (fuente de verdad del guión):
  hoy SOLO la primera pantalla — Cinemática Inicial ("Desde 1833…" ×3 párrafos) + tag
  `NIVEL 1 — SE APROXIMA LA TASK FORCE` + objetivo — claves i18n `story1_*` (es/en).
  Interacción: cualquier tecla/tap **completa el tipeo de un saque**; con el texto completo, la
  siguiente arranca el despegue con **FADE desde negro** (`fadeT=1.4`, overlay negro que se pinta
  AL FINAL de `draw()` y decae — reutilizable para cualquier transición); `t=0` al confirmar para
  que el reloj de velocidad no herede los segundos de lectura. ESC/Backspace vuelve al menú.
  Código: `initStory/storyTyped/drawStory` + rama `'story'` en update y draw. Verificado:
  screenshots del tipeo con cursor de bloque titilante, layout completo sin solapes (se acortó
  `story1_obj` y se ajustó el ritmo vertical), y el fade revelando la cuenta regresiva del
  despegue (`state:'takeoff', fadeT:1.38, toT:0.02`).
  **Pendiente:** las demás cinemáticas de NIVELES.md (entre niveles: enganchar en el path
  `levelclear` con `initStory(n)`), y la cinemática final + créditos.
  **SECUENCIAS DE PANTALLAS + HIMNO (19/7):** la historia pasó de una pantalla a **secuencias**:
  cada Cinemática de NIVELES.md es UNA pantalla `{title, paras}` y la de NIVEL es `{level, obj}`
  (centrada verticalmente, prompt "despegar"; las intermedias muestran "continuar"). Guiones en
  STRINGS como arrays: `storyIntro` (4 pantallas: Malvinas 1982 / Argentina marzo / Operación
  Rosario / NIVEL 0) y `storyL1` (La Flota / NIVEL 1 — Bautismo de fuego), es+en. `LEVELS[n].story`
  nombra el guion; `startCampaign` y el path de `levelclear` lo lanzan (`initStory(key)` →
  `initStoryScreen()` por pantalla; avance con tecla: completar → siguiente → última = despegue
  con fade). **Puntitos de progreso** abajo. Tipeo MÁS LENTO: CPS 19, pausas 0.15/0.85.
  **Música de historia:** `epic_himno.mp3` (assets/new_sounds/soundtrack/epics, 3MB → 4MB base64,
  index.html ahora **15.4MB** — la migración de assets es cada vez más urgente) embebido como
  `MUSIC_STORY` con el tool (`embed_asset.py music_story <mp3>`, marcador nuevo); `musStory`
  (loop, vol 0.5) suena SOLO en `state='story'` — `updateMusic` es de 3 pistas ahora. OJO:
  `new Audio('')` resuelve `.src` a la URL de la página, por eso el guard usa el const
  (`want !== musStory || MUSIC_STORY`). Verificado: recorrido completo de las 4 pantallas en
  harness (dots avanzando, tipeo letra a letra visible "M→MA", pantalla NIVEL centrada con
  prompt) hasta despegue.
  **SOUNDTRACK ADRENALINA (19/7):** en SUPERVIVENCIA y CICLO DE MUERTE cada run arranca con una
  pista al azar de un **pool de 4** (elegida en `setRunObjective` → `curAdr`; campaña = null y usa
  `musGame`). Pistas de `assets/new_sounds/soundtrack/adrenaline/` (hay 11; se embebieron 4:
  pmetal_himno / sanmartin / soy_hincha / acero_blanco) **transcodificadas a AAC 80kbps con
  `afconvert`** (nativo macOS; no hay ffmpeg) para controlar peso: 8.5MB → consts `MUSIC_ADR1..4`
  (markers `adr1..adr4` en embed_asset.py, que ahora resuelve mime de .m4a). `updateMusic`
  generalizado: la pista de juego activa es `gm = curAdr || musGame` y el dip de momentum/ducking
  se aplica a `gm`. Verificado: 8 runs de supervivencia con índices aleatorios [2,0,1,1,0,1,2,1],
  ciclo elige, campaña null. Dead-retry re-randomiza (pasa por setRunObjective).
  **⚠️ LÍMITE DEL ARTIFACT DESCUBIERTO: 16MB.** Con el pool de 4 el archivo llegó a 26.7MB y el
  publish falló ("too large: 26MB (max 16MB)"). Solución: **TODA la música re-embebida en AAC**
  (`afconvert`): lobby/game/himno a 80kbps y el pool adrenalina a **64kbps con 3 pistas**
  (himno/sanmartin/soy_hincha; `MUSIC_ADR4` quedó vacío — `filter(Boolean)` adapta el pool solo).
  Resultado: **14.0MB** ✓ publicado. Markers nuevos del tool: `music_lobby`, `music_game`
  (comillas dobles, embebido original). OJO: el user reorganizó assets — los mp3 base ahora viven
  en `assets/new_sounds/soundtrack/epics/`. La migración a assets externos sigue siendo el techo
  real: sin ella no entran más pistas ni sprites grandes (quedan ~2MB de margen).
  **FIX (19/7) — música MUDA tras la recompresión:** `mimetypes.guess_type('.m4a')` de Python
  devuelve `audio/mp4a-latm`, que los browsers NO reconocen en `<audio>` → las 6 pistas AAC
  quedaron embebidas con mime inválido y el juego entero quedó sin música (el user lo notó como
  "no arranca el tema del lobby"; NO fue por mover archivos — la música va embebida). Fix en
  `embed_asset.py`: tabla `AUDIO_MIME` fija por extensión (`.m4a → audio/mp4`) ANTES de
  guess_type, y los markers de música ahora toleran comillas simples o dobles (el primer embebido
  las había cambiado). Re-embebidas las 6. **Verificado con playback real**: harness del archivo
  completo (14MB, sin strip) → `musLobby.paused=false, duration=158.1s, error=null`.
  Lección de proceso: verificar DECODIFICACIÓN real al cambiar formato de audio, no solo sintaxis.
  **FIX (19/7) — texto cortado:** la cinemática de ARGENTINA desbordaba la pantalla (título a
  13px envolvía en 2 líneas + 4 párrafos largos pisaban el prompt). Doble arreglo: (1) **título
  más chico** (11px, wrap 32 chars, avance 16px → entra en una línea); (2) **más cinemáticas**:
  ARGENTINA se partió en ARGENTINA + LA DECISIÓN, y LA FLOTA en LA FLOTA + RUMBO AL SUR (es/en)
  → `storyIntro` ahora tiene 5 pantallas y `storyL1` 3. Verificado con cálculo de altura de TODAS
  las pantallas (máx y=143, límite 150 antes del prompt) + screenshot de ARGENTINA limpia.
  Regla para guiones futuros: **máx ~6 líneas de cuerpo por pantalla** (2 párrafos medianos).
  **FIX (19/7) — el tipeo se salteaba:** el input que confirmaba CAMPAÑA en el menú (auto-repeat
  del Enter sostenido, o el pointer del tap) se filtraba a la pantalla de historia y la completaba
  al instante. Doble arreglo: (1) **`anyPress` solo con pulsaciones frescas** (`!e.repeat`) en TODOS
  los setters del keydown — beneficia también a derribado/transiciones; (2) **gracia de 0.4s** en la
  rama story antes de aceptar input. Además la campaña ahora **arranca en NIVEL 0** (tutorial
  "Se aproxima la Task Force"): `LEVELS[0].name='NIVEL 0'`, tag de la historia `story1_level`
  actualizado (es/en). Verificado con el flujo real: Enter confirma → story tipeando gradual
  (typed 224/317) pese a repeats inyectados; pulsación fresca a mitad → completa y espera;
  otra → despegue. HUD muestra NIVEL 0.
- **AUDIO DE CÁMARA LENTA (gamefeel, NUEVO 19/7)** — todo procedural (Web Audio ya existente),
  cero assets nuevos. Decisión: sonido ESTRUCTURAL ahora, samples/música por nivel DESPUÉS de
  la migración (los eventos ya quedan cableados; swap mecánico).
  - **Música ahogada en momentum**: `updateMusic` lerpa `musGame.volume` 0.30 → **0.10** al
    entrar (y de vuelta al salir), transición suave por frame (factor 0.08).
  - **Ducking**: `duckT` global (decae en `update`); las explosiones grandes (`momBoom`/
    `explodeAt` con `big`) la setean 0.55s → la música se agacha al 45% un instante.
  - **Motor → rumble con latido**: en momentum el motor sawtooth baja de 70Hz a **30Hz** con
    wobble lento, gain pulsando 0.014–0.023 a ~0.4Hz (latido); el lowpass de 320Hz que ya tenía
    da el "bajo el agua".
  - **Stings**: entrada = sine 620→65Hz en 0.7s + boom (el tiempo se estira); salida entre
    pasadas = sine 110→640Hz (el tiempo vuelve).
  - **Disparo gordo**: la ráfaga pasó de beep agudo a square 140→55Hz + boom; el impacto suma
    un thump triangle 88→44Hz.
  - Verificado en vivo: en momentum `vol` bajando (0.30→0.232→…), `engHz 30.2`, `engG` pulsando.
  **Pipeline de assets (NUEVO, en `tools/`):** `embed_asset.py <clave> <archivo|--clear>` embebe
  cualquier asset configurable como data URI en `index.html` (claves: `cockpit`, `obj_port`,
  `obj_barge`, `obj_plane`; idempotente, regexes anclados a cada constante) y `check_syntax.py`
  valida el `<script>` (neutraliza data URIs + `node --check`). **Probado end-to-end**: se generó
  un cockpit PNG de prueba (640×360, centro transparente), se embebió, `COCKPIT_ASSET.ready=true`
  y se vio renderizado en el momentum reemplazando al placeholder; luego `--clear` dejó todo como
  estaba. Cuando Matias entregue `cockpit.png` es un solo comando.
  **Aproximación:** el casco del barco está factorizado en `drawBargeHull(cx,len,deckY,uh)`
  (con silueta simplificada si `uh<1.1`). En vuelo normal, `drawApproachBarge` lo dibuja en el
  horizonte desde el **45%** del recorrido, creciendo hasta empalmar con la escala de entrada de la
  próxima pasada (0.82×) — entre pasadas continúa desde donde quedó (1.08× de la anterior). Dentro
  de cada pasada `momShipGeom` hace crecer el barco de **0.82× a 1.08×** de `scale` (acercamiento
  lento en cámara lenta). `enterMomentum` también limpia `streaks` (líneas de velocidad congeladas).
  **Legibilidad de obstáculos en la aproximación (FIX):** antes la barcaza "colgaba" bajo el
  horizonte (`deckY = HOR+36*sc` lineal) y camuflaba los obstáculos, que emergen pegados al
  horizonte (~y66 por perspectiva). Ahora: (1) queda **anclada a la línea del horizonte** casi todo
  el acercamiento y recién baja al final con **ease-in cuadrático** (`dOff = d0+(36*scE-d0)*f*f`,
  `d0=2` en fase 0 / continuidad exacta con la cubierta del momentum en f=1); (2) de lejos es
  **silueta con bruma** (`alpha = 0.35+0.65*f` en fase 0) → los obstáculos, sólidos y por delante,
  resaltan encima. Verificado con screenshots al 60% (silueta tenue en el horizonte) y 76% (sólida,
  asentada en el horizonte).
  **Pendiente:** táctil para la mira, sprite del barco.
  **LAYOUTS POR CLASE DE BARCO (HECHO 19/7):** `MOM_PHASES` pasó de const a `let`; `MOM_LAYOUTS`
  define 3 clases y `SHIP_CLASS` mapea cada barcaza; `randomShip()` fija el layout del run (único
  choke point — corre en setRunObjective/startCampaign/levelclear). `at`/`scale` IGUALES entre
  clases (aproximación y triggers no cambian); varían zonas/HP/tiempos/puntos:
  - **t42** (SHEFFIELD/COVENTRY): AA×2(55) → radar(45) → puente(130) — el layout original.
  - **t21** (ARDENT/ANTELOPE): AA×2(55) → radar chico(50, w 0.09) → **MOTORES gemelos** (70 c/u,
    `v:-0.3` = al nivel del casco, ventana 8s) — el remate es abajo, cerca del agua.
  - **log** (SIR GALAHAD/ATLANTIC CONVEYOR): AA única(70) → **DEPÓSITO** (110, w 0.30 grande y
    fácil de pegar) → puente a popa (u 0.32, 100).
  Zonas nuevas i18n: `zone_engine` (MOTOR/ENGINE), `zone_deposit` (DEPOSITO/CARGO HOLD).
  Verificado: sim de alcanzabilidad (todas las zonas dentro del clamp de mira W/2±60 / [44,122]
  en extremos de growth+sway; el puente log se corrigió de u 0.36→0.32 por 0.3px fuera) +
  harness en vivo: ANTELOPE pasada 3 con los 2 MOTOR visibles, GALAHAD pasada 2 con `dep:110`
  y ventana 6.5s.
- **Radar:** volar alto llena `detection`; al 100 % lanza un misil buscador que persigue.
- **Turbo** (`boost`): ×1,5 velocidad y **×2 puntos**, quema combustible al triple. Líneas de velocidad y shake.
- **Near-miss:** pasar rozando un obstáculo (o esquivar un misil por poco) da **+75**.
- **Combustible:** reloj del run; bidones (+30) en vuelo. Sin combustible el avión se hunde.
- **Estela y rocío** sobre el agua = referencia visual de altura y sensación de velocidad:
  estela en V bajo ~9 m; rocío escalonado a 7 / 4,5 / 2,8 m; espuma batida bajo el fuselaje; sombra en el agua.
- **Agua "malla de puntos"** (efecto onda, inspirado en el fondo WebGL de boostivity.ai): grilla de
  puntos en perspectiva desplazada por ondas (`drawSeaDots` + `seaH`), fluye hacia la cámara.
  `WATER_STYLE` = `'sea'` (por defecto) | `'violet'` (neón). Base oscura por líneas + puntos encima.
  El movimiento propio del agua viene de: una **marejada larga** (~180 m) que rueda hacia la cámara
  (`sin(wz*0.035 - t*1.1)`), fases temporales rápidas en las ondas cortas, y el **`shimmer`** —
  bandas de luz que barren la superficie (clave para que se vea vivo lejos, donde el bobbing es sub-píxel).
  Verificado con banco aislado: 4 instantes con cámara quieta muestran las crestas desplazándose.
- **Despegue desde Puerto Argentino / BAM Malvinas**: estado `'takeoff'` (3 s) antes de `'play'`;
  el avión carretea sobre la pista, acelera y rota solo; control libre a los 3 s. Cuenta regresiva
  3…2…1 (`drawTakeoff`) con beeps. Costa: primeros `COAST = 230` m son tierra (turba + pista con eje
  y balizas), luego rompiente y mar abierto. Sobre tierra no hay estela; morir dice "Chocaste el terreno".
- **Vuelo a gas (throttle):** la gravedad tira siempre; mantener ARRIBA empuja, soltar = caer
  hasta estrellarse. Constantes en el bloque de maniobra: `G=22`, `TH=55`, `DIVE=30` (m/s²),
  `vy` clampeada a [-20, 18]. Verificado numéricamente: sin gas desde 12 m → agua en ~0,97 s;
  desde 4 m (racha) → ~0,47 s; gas a fondo 12→46 m en ~2,2 s. El táctil conserva el control
  directo por arrastre (no usa gas). **HUD:** palanca de gas vertical en el borde derecho
  (`throttle`, valor suavizado lerp `dt*7`, solo indicador — no afecta la física); en teclado
  refleja ARRIBA, en táctil usa `vy>0` como proxy; muestra "SIN GAS" con combustible en 0.
- **Récord local** (`localStorage: rasante_frontal_best`).
- **Fichas históricas** reales en la pantalla de derribo (array `L().facts`, ver i18n).
- **Música + botón de sonido:** dos pistas (`musLobby`=`the_weight_of_honor.mp3`, vol 0.55; `musGame`=
  `weight_of_honor_v2.mp3`, vol 0.30), vía `<audio>` (aparte del SFX WebAudio). **El lobby suena SOLO en
  `modeselect` + `menu` (`inLobby()`)**; desde takeoff/play y en las pantallas de fin (derribado, nivel,
  victoria, objetivo) suena la del juego — nunca el lobby. `updateMusic()` cambia de pista según `inLobby()`; arranca en la primera interacción
  (`startMusicOnce`, política de autoplay). Botón HTML `#snd` (esquina sup. der. del stage) togglea `muted`
  (persistido en `localStorage: rasante_muted`); mutear también silencia SFX y motor. **A futuro:**
  soundtracks por nivel/momento/secuencia (una pista por contexto).
  ⚠️ **Los MP3 (~3.7MB c/u) están embebidos como data URI → `index.html` pesa ~10MB.** Es el precio de
  que suene en el artifact autocontenido, y **la señal más fuerte hacia el pipeline de assets** (ver §9 y
  la nota de arquitectura): al migrar, los MP3 salen del base64 y se cargan como archivos.
- **Flujo de pantallas:** estado inicial `'modeselect'` (3 modos, `MODES`, `drawModeSelect`, `modeSel`).
  CAMPAÑA → `startCampaign()` (avión `CAMPAIGN_PLANE`=A-4 + `CAMPAIGN_CFG` fijos, directo a `takeoff`).
  CICLO DE MUERTE → `goCycle()` (aleatoriza mapa con `randomizeCfg()`, va al `'menu'`). SUPERVIVENCIA →
  `goSurvival()` (`'menu'`). `'menu'` (avión + `[M]` config) lo comparten CICLO y SUPERVIVENCIA; `[ESC]`
  vuelve a modeselect. Router `confirmMode()`.
- **Objetivo final (diferencia entre modos):** `objectiveDist` (0 = infinito) + `objectiveShip` (de `SHIPS`,
  buques británicos reales). Con objetivo (campaña + ciclo): barra de misión **centrada, 30% del ancho**
  `drawObjectiveBar()` en el HUD (avión avanza por `dist/objectiveDist`, turbo con líneas, nombre del buque
  arriba). Puerto/avión/barcaza son **assets configurables** (`OBJ_ASSETS` = {port, barge, plane}, `src`
  vacío → fallback dibujado vía `drawHudAsset`; el usuario dará las imágenes, se embeben como data URI). Al llegar: campaña → `levelclear`/`victory`;
  ciclo → estado `'objective'` (`drawObjective`, "BARCAZA DESTRUIDA") → vuelve al menú con `randomizeCfg()`.
  `setRunObjective()` define el objetivo del run según modo. Supervivencia: sin objetivo, junta puntos.
  **Ciclo POR AHORA finaliza al llegar; sube complejidad a futuro (README).** Metros ajustables: fila `METROS`
  del `[M]` (`cfg.meters`), solo visible en ciclo (`getCfgRows()` filtra por `cycleOnly`).
- **Modos: supervivencia (actual) + campaña** (`gameMode`). Campaña por niveles (`LEVELS`, 2 de prueba),
  con label `NIVEL n` arriba, meta por distancia (`goalDist`), tarjeta de transición placeholder
  (estados `'levelclear'`/`'victory'`, funciones `drawLevelClear`/`drawVictory`), puntaje acumulado, y
  al terminar vuelve a `'modeselect'`. **POR AHORA todos los niveles usan la MISMA config** (`CAMPAIGN_CFG`);
  solo cambia el label. **Cinemáticas reales, X niveles y cfg por nivel = PENDIENTE** (ver README).
  Textos de modo en i18n; los de config/tarjetas hardcodeados en ES (falta pasar a i18n).
- **Config de mapa `[M]`** (solo en el menú de supervivencia): objeto `cfg` (sky, water, wind, obstacles,
  coast) que lee todo el juego; se edita con `CFG_ROWS`/`drawCfg`. `applyCfg()` recalcula `WATER`/`SKY`.
  Presets: `WATER_STYLES`, `SKY_PRESETS`. `COAST` pasó a `cfg.coast`; el viejo `WATER_STYLE` → `WATER_STYLES`+`cfg.water`.
- **Multi-idioma (i18n):** TODOS los textos visibles viven en la tabla `STRINGS` (bloque al inicio del
  script), agrupados por código ISO. Hoy están `es` (base) y `en`. Nada de texto suelto en el resto del
  código: todo pasa por `T('clave', {params})` (interpola `{n}`) o `L().facts`. Las causas de muerte se
  guardan como **clave** (`death_helo`, etc.) y se resuelven al dibujar, así el cambio de idioma es en vivo.
  El chrome de la página (header, footer con `<kbd>`, `aria-label`) también sale de `STRINGS` vía
  `applyChrome()`. **Selección de idioma** (en orden): `?lang=xx` en la URL · `localStorage 'rasante_lang'`
  · idioma del navegador · `es`. **Tecla `L`** cicla el idioma en vivo (y lo persiste). **Para agregar un
  idioma:** copiar el bloque `es`, traducir los valores (dejar las llaves y los `{n}` intactos) y sumarlo
  con su código. **Empaquetado Windows/Steam:** el launcher fija el idioma con `?lang=xx` o escribiendo
  `localStorage 'rasante_lang'`. Verificado en navegador: es↔en cambia todo (menú, HUD, derribo, fichas,
  chrome) y `?lang=` le gana a `localStorage`.

### ℹ️ Nota de verificación (sesión del 17/7)
El panel de preview **ralentiza `requestAnimationFrame` cuando no está en foco**, así que no se pudo
volar en vivo hasta mar abierto. Lo verificado esta sesión: el **despegue/pista** se vio renderizando
bien (carreteo, cuenta regresiva, balizas); el **agua de puntos** se validó con un banco aislado
(`wtest.html`, ya borrado) que reusa la misma matemática (`proj`/`seaH`/`drawSeaDots`/`WATER`) —
se confirmó la onda animando en tono mar y violeta. El juego real corre **sin errores de consola**.
Pendiente menor: jugar una corrida completa a mar abierto para el ajuste fino del gamefeel del agua
(densidad `SPX/SPZ`, brillo de la paleta `WATER`, amplitud de `seaH`).

### 🐞 Bugs conocidos

- **~~No se puede derribar el helicóptero disparándole: en vez de destruirlo, el jugador se
  colisiona~~ — CORREGIDO (sesión 17/7).** Se aplicó la opción (a): **apuntado vertical
  automático** del cañón.
  - Diagnóstico original: las balas salían a la altura exacta del avión y viajaban horizontales,
    sin apuntado vertical, mientras el helo aparece a 5–21 m (`y: 5 + random*16`, ~línea 203) y
    para el multiplicador se vuela a ~4 m → las balas pasaban por debajo y nunca impactaban. La
    única forma de "alcanzarlo" era subir a su altura, donde se disparaba antes la colisión del
    avión (`die('Colision con helicoptero')`) que las balas.
  - **Solución en dos partes (en `update`, cañón/balas):**
    1. **Apuntado vertical (Y):** al disparar, la bala **engancha el blanco aéreo con `hp` más
       cercano en su carril** y guarda su altura en `b.ty`; en el update de balas `b.y` hace homing
       hacia `b.ty` (`b.y += (b.ty-b.y) * min(1, dt*14)`), subiendo/bajando hacia el helo. Tolerancia
       vertical de impacto del helo ensanchada (`< 3` en vez de `< 2.4`).
    2. **Banda de x (fix del "volvió a pasar", sesión 17/7):** quedaba una **banda de desalineación
       horizontal** letal: para **matar** el helo la bala exigía `|Δx| < 3.4`, pero para **morir** por
       colisión bastaba `|Δx| < 5.6`. Con la x entre 3.4 y 5.6 (y a la altura del helo, típico volando
       rasante) le disparabas, las balas pasaban al costado, sobrevivía y te lo comías. Se **igualó la
       hitbox horizontal bala-vs-helo a la envolvente de colisión** (`< 5.6`) y se abrió la ventana de
       enganche del lock a `< 5.6`. Ahora **todo helo que pueda colisionar también es derribable**.
  - **Efecto:** se derriba el helo **volando rasante a 4 m**, sin necesidad de subir ni colisionar.
    Verificado con simulación numérica (node) del loop completo (incluida la colisión avión-helo, que
    corre antes que las balas en el frame): barriendo altura del helo 5–21 m, velocidad 62/90/150 y
    offset de x 0–6 m, **cero muertes por colisión** al disparar (antes: 30 muertes en la banda 3.4–5.6).

---

### MIRA CON MOUSE (PC) — NUEVO 19/7 (base para joystick)

Separación **puntería vs movimiento** en PC: el **mouse apunta**, las **flechas/WASD mueven**.
`mouse = {x, y, on}` (coords lógicas 320×180; `on` se enciende al primer `pointermove` de tipo
mouse → en táctil nunca, y rige el esquema anterior completo — cero regresión mobile).
- **Vuelo normal**: mira libre dibujada en el cursor (con recuadro); el cañón desproyecta el
  cursor al mundo a z=110 (`(mx-W/2)/k + cam.x`, inversa de `proj`) y la bala converge en
  horizontal (`b.tx`, lerp `dt*10`) y vertical (`b.ty`); el misil `Z` apunta al carril del cursor.
  Sin mouse: auto-aim vertical de siempre.
- **Momentum**: la mira es LIBRE con el mouse sobre el vidrio (`aim = mouse + momCam()` en mundo);
  las **flechas mueven la cabina/cámara** (mom.cx/cy, igual que antes). Ráfagas, lock de zona y
  misiles usan el punto del mouse. Sin mouse: visor fijo del centro (táctil).
- **Botones**: click izq = cañón sostenido, click der = misil (contextmenu suprimido); en menús
  el click sigue siendo tap. Footer actualizado (es/en) + strings `ctrl3`.
- Verificado en harness: mira renderizada en el cursor, disparo con `tx/ty` = mouse→mundo y
  `zi:0` (lock al motor izquierdo del ARDENT apuntando con mouse).
- **FIX — "los tiros deben salir desde el avión"**: el primer diseño usaba lerp exponencial
  (`b.x += (tx-b.x)*dt*10`) que hacía saltar la bala hacia el carril del cursor apenas nacía.
  Ahora las balas con mouse usan **balística recta** (`b.path`): guardan origen `x0/y0/z0` e
  interpolan LINEALMENTE en función del avance en z — nacen EN el avión, cruzan exacto el punto
  apuntado en z=110 y siguen derecho (extrapolación f>1). Sim: nace en x=-8.1 junto al avión
  (-10) y cruza la mira (25,8) en z=110. El auto-aim táctil conserva su lerp vertical.
- **JOYSTICK (pendiente, objetivo declarado)**: con la puntería ya separada del movimiento, el
  mapeo natural es stick izq = vuelo/cabina, stick der = mira, gatillos = cañón/misil (Gamepad API).
- **ALABEO EN PRIMERA PERSONA (reemplazó a la órbita, 19/7)**: iteración con el user — el barco
  debía quedar FIJO y el avión **rolar sobre su eje longitudinal** (alabeo). Modelo final:
  - **Barco ANCLADO**: `momShipGeom` sin sway/bob (cx=W/2 fijo); el movimiento del duelo lo pone
    el roll del avión, no el barco. Crecimiento por pasada 0.82→**1.06** se mantiene.
  - **Roll**: ←/→ → `mom.rollV` (easing dt*2.8, tope 1.6 rad/s) → `mom.roll` acumulativo
    (permite **toneles completos**). Al soltar: **auto-nivelado** suave hacia la vuelta completa
    más cercana (`round(roll/2π)*2π`, easing dt*1.1).
  - **Render**: el MUNDO ENTERO (horizonte, mar Y BARCO con sus zonas/fx) rota `-mom.roll`
    alrededor del centro (en `draw()` tras el translate); `drawMomentum` lo deshace recién en la
    sección de pantalla → **cabina/mira/letterbox nivelados** (vos rolás, tu marco no).
  - **Puntería exacta bajo roll**: `momScrToWorld(sx,sy)` deshace la rotación (rotar el vector
    cursor−centro por +roll y sumar cámara); la usan la mira del mouse, el fallback del visor y
    los ORÍGENES de balas/misiles (las alas rotan con vos). Verificado con helper `__aimAtZone`:
    con roll=0.56 el disparo al punto en pantalla de la zona rotada dio `zi:0` (lock exacto).
  - **Cobertura de rolls completos**: cielo extendido a y=-140 y filler bajo el mar (H..H+150,
    color del agua/tierra profunda) solo en momentum → girar 360° no muestra huecos.
  - cam.x ya NO se toca (se quitó el barrido lateral de la órbita). ↑/↓ siguen moviendo la
    cabina (mom.cy). Screenshots: mundo+SHEFFIELD ladeados 29°/34° con cabina e instrumentos
    perfectamente nivelados y la mira sobre la zona rotada.
  - **REBALANCEO "menos tiempo, tiros más dañinos, más difícil" (19/7)**:
    (1) **Ventanas ~35% más cortas**: t42 5.5/4.5/5 · t21 5.5/4.5/5.5 · log 5/4.5/5 (antes 6-8s).
    (2) **Cañón balístico SIN tracking**: se quitó el lock `zi` — la bala vuela al punto apuntado
    AL DISPARAR con **dispersión** (`±(3.5 + |rollV|*5)` px: rolar abre el cono) y al llegar
    hace chequeo punto-en-zona (margen ±1). **Daño 22→45**, cadencia 0.36→**0.5s**. DPS similar
    pero cada bala importa: PUENTE 130 = 3 hits · AA 55 = 2 · RADAR 45 = **1 hit preciso** ·
    MOTOR 70 = 2. (3) **Misil 55→80** (one-shotea AA/radar). Sim TTK (85% acierto): todas las
    zonas simples entran cómodas; las pasadas DOBLES (2 AA / 2 motores ≈ 5s de trabajo en 5.5)
    quedan al filo — fallar tiros cuesta la pasada. Verificado en vivo: timer 4.8/5 (ventana
    nueva), bala balística en vuelo sin `zi`; impacto garantizado por geometría (zona anclada +
    dispersión < media zona).
  - **AVANCE EN CÁMARA LENTA (19/7)**: el avión ya no queda "en el lugar" — durante el momentum
    `dist` sigue creciendo al **25% de spd** (en updateMomentum, corre también en el outro) →
    la textura del mar/tierra **fluye despacio hacia la cámara** (drawSea/drawSeaDots leen dist).
    Es acercamiento REAL a la barcaza, con **tope 2% antes del gatillo de la próxima pasada**
    (`Math.min(dist, objectiveDist*(nextAt-0.02))`) para no encadenar momentums al volver al
    vuelo; en la pasada final no hay tope (nextAt=99). Verificado: dist 781→786+ avanzando en
    momentum y el patrón de puntos del mar desplazándose entre frames.
    **FIX "frenazo" (19/7)**: al morder el tope, el mar se congelaba los últimos segundos de la
    pasada → sensación de avión FRENANDO en el aire. Ahora el sobrante del avance va a
    **`momDrift`** (avance solo-VISUAL): `dist` respeta el tope (gameplay/gatillos intactos)
    pero drawSea/drawLand/drawSeaDots leen `dist + momDrift` → el flujo del suelo JAMÁS se
    detiene, a ritmo constante (25% de spd) toda la pasada. `momDrift` queda como offset de
    fase constante al salir (sin salto visual) y se resetea en `reset()`. Verificado en vivo:
    dist clavado en 880 (tope) con drift 37.5→92.1 creciendo a 37.5/s exactos.
  - **CÁMARAS — tecla V (19/7)**: `V` CICLA 4 cámaras en vuelo normal: **1× → 1.5× → 2× → 2.5×**
    (`CAM_ZOOMS = [1, 1.5, 2, 2.5]`), con popup "CAM n×" al cambiar y beep ascendente por nivel.
    Zoom anclado al sprite del avión. Implementación: transform
    de canvas en `draw()` (translate/scale/translate alrededor de `proj(plane.x,plane.y,PZ)`)
    aplicado DESPUÉS de la rotación del momentum y desecho ANTES de `drawHUD` → el HUD no se
    agranda. Zoom-in solo muestra un subconjunto de la pantalla ya pintada: no descubre bordes
    jamás (no hacía falta ampliar márgenes). `camZ` interpola suave (`dt*3.5`); el target es
    `CAM_ZOOMS[camMode]` solo en play/takeoff → al morir hace zoom-out cinemático solo, y en menús/
    momentum vuelve a 1 (el momentum tiene su propia cámara cockpit; sin interacción). El mouse
    se compensa con `viewMouse()` (des-zoomea el cursor alrededor del mismo ancla): mira, cañón
    balístico y misil caen EXACTO bajo el cursor físico con cualquier zoom — verificado en vivo
    (mira dibujada en (250,60) físico con camZ=1.19 en transición). `camMode` persiste entre
    corridas; táctil no tiene toggle todavía (va con el mapeo de joystick).

## 5. Controles

| Acción      | Teclado                                        | Táctil                        |
|-------------|------------------------------------------------|-------------------------------|
| Gas (subir) | mantener `ARRIBA`/`W` — si soltás, el avión cae| arrastre directo (60 % izq.)  |
| Esquivar    | `←`/`→`/`A`/`D`                                | ídem arrastre                 |
| Picada      | `ABAJO`/`S`                                    | —                             |
| Disparar    | `X` / `ESPACIO` / `K`                          | mantener derecha-arriba       |
| Turbo       | `SHIFT` / `C`                                  | mantener derecha-abajo        |
| Cámara      | `V` (cicla 1× → 1.5× → 2× → 2.5×)              | — (pendiente joystick/táctil) |
| Empezar     | cualquier tecla / tocar                        | —                             |

---

## 6. Mapa del código (`index.html`, todo en un `<script>` IIFE)

- **Constantes:** `W,H` (320×180), `HOR` (horizonte), `F` (distancia focal de la proyección),
  `PZ` (z del avión, plano de juego), `COAST` (metros de tierra).
- **`P`** = paleta (Atlántico Sur; acento naranja `#e8a33d`). **`STRINGS`** = tabla i18n con todos los
  textos por idioma (incluye `facts`); acceso vía `T('clave', {params})` / `L()` (ver §4, Multi-idioma).
- **Estado global** + `reset()` + `cam`. Estados: `'menu'` → `'takeoff'` → `'play'` → `'dead'`.
- **Audio** (`audio`, `beep`, `boom`, `eng` = motor continuo por oscilador).
- **Input:** teclado (`inp`) + puntero (zona izquierda = timón por arrastre; derecha = fuego/turbo).
- **Mundo:** `waveNow`, `multOf`, `spawn`, `proj` (proyección 3D→2D, factor `k = F/z`),
  `explodeAt`, `popup`, `die`.
- **`update(dt)`:** rama `takeoff`, rama no-play (menú/muerte), y la simulación principal
  (velocidad, maniobra, viento, puntaje/racha, estela, radar, cañón, spawn, colisiones, partículas).
- **`draw()`** + helpers: `drawSea` (mar + pista), `drawWake`, `drawObstacle`, `drawPlaneSprite`,
  `drawHUD`, `drawTakeoff`, `drawMenu`, `drawDead`, `wrapText`, `bar`, `px`.
- **Loop:** `requestAnimationFrame`, `dt` clampeado a 33 ms.

---

## 7. Tuning rápido (dónde tocar el gamefeel)

Todo en el `<script>` de `index.html`:

- Velocidad base/techo: `spdBase = Math.min(150, 62 + t*2.8)` · turbo `*1.5` · tope `280`.
- Aceleración por racha: `rachaVel` (bajar el `0.12` si x25/x30 se vuelve injugable).
- Viento: acumula sobre `plane.y > 16`, frena hasta `-35 %` (`windF`); turbulencia `95/70`.
- Multiplicador: `multOf()` · racha 2 s/nivel (`Math.floor(streak/2)`), gracia `0.45`.
- Radar: `alt > 30`. Densidad de obstáculos: `nextSpawn = max(34, 52+rnd*42 - t*0.8)` (en metros).
- Combustible: drenaje `3.2` (+`4.2` turbo), bidón `+30`. Near-miss: margen `< 3`.
- Despegue: duración total `toT >= 3`, rotación arranca en `toT > 1.35`, costa `COAST = 230`.

---

## 8. Pipeline de arte (para Photoshop)

- El resto del arte (obstáculos, mar, pista) sigue **dibujado por código**. Trabajar a **320×180**,
  paleta corta (16–32 colores), exportar PNG/WEBP con transparencia a `assets/`.
- **Aviones: 5 sprites propios seleccionables** (vista trasera, con alfa, ~977×471). Array `PLANES`
  (key, name, `desc{es,en}`, img). Todos **embebidos como data URI** en `index.html` para que el
  artifact sea autocontenido (la CSP bloquea recursos externos). El elegido es `selPlane`;
  `drawPlaneSprite()` usa `PLANES[selPlane]` a `PW=54` px con `drawImage`, calcula el alto por imagen
  (`PH=PW*h/w`), conserva el alabeo (rotación por `plane.vx`), la sombra sobre el agua y los fogonazos;
  el postquemador extra sale solo con turbo. Fallback a rects si la imagen no cargó.
  **Pantalla de selección** = estado `'menu'` (`drawMenu`): preview grande con cabeceo, nombre + desc,
  puntos del carrusel, flechas. Input: `←`/`→` o tap izq/der cambian `selPlane`; `ENTER`/`X`/`ESPACIO`
  o tap central ponen `startReq` → despega. Textos en i18n: `selTitle`, `selHint`.
  **Nota:** hoy los 5 aviones son solo estéticos (mismas físicas). Características por avión = pendiente
  documentado en README (agregar stats al array `PLANES` y leerlos en la física; desbloqueo del Étendard).
  Para actualizar/agregar sprites: dejar el webp en `assets/`, y re-inyectar el base64 con `python3`
  reemplazando el placeholder correspondiente en el array `PLANES` (ver README).
- **Obstáculos:** se dibujan escalados por distancia (factor `k`). Dibujarlos grandes (~48 px) y
  dejar que el juego los achique.
- Paleta actual en el objeto `P`: cielo `#2a3540`, mar `#2e4a4e`, metal/bruma `#93a7ab`, acento `#e8a33d`.

---

## 9. Próximos pasos (backlog priorizado)

1. **Terminar y verificar el despegue** desde Puerto Argentino (ver §4) y **republicar el artifact**.
2. ~~Corrida de bombardeo~~ → **HECHO como MOMENTUM** (asalto por pasadas con minijuego de puntería,
   ver §4). Evoluciones: layouts de zonas por barcaza, ventana de espoleta como zona extra, táctil.
3. **Desafío diario por seed** compartido: competitivo real sin servidor.
4. **Reabastecimiento en vuelo con KC-130** (extender el run).
5. **Museo:** fichas desbloqueables + aviones jugables con stats (A-4, Dagger, Super Étendard, Pucará).
6. **Sprites propios** en Photoshop; sonido con más cuerpo.
7. **Leaderboard online.**
8. Sugerencia de tono: contactar asociaciones de veteranos (CECIM) si el juego crece; evitar gore
   y nombres de caídos sin permiso.

---

## 10. Git

- Rama `main`. Cambios **sin commitear** (`index.html`, `README.md` modificados; `lateral.html`
  y `ESTADO.md` sin trackear). No se commiteó nada todavía por decisión del autor.
- Al retomar, un buen primer commit agrupa: versión frontal + mecánicas + despegue + docs.

_En homenaje a los pilotos y veteranos de Malvinas._
