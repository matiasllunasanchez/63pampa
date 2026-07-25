# PENDIENTES DE REDISEÑO — inventario de unidades y objetos

_Relevamiento del 25 de julio de 2026. Última actualización: 25 de julio de 2026 (cuarta tanda:
**piruetas de combate** por combos de dos toques y la **hoja 2** de cabeceos empinados ±32° para
sus poses, horneada para los 6 aviones + **§13: pendiente de diseño** — persecución enemiga, radio
de la base y contraataque con candado)._

Lista completa de **todo lo que el juego dibuja** (unidades, objetos, FX, UI y escenario) con el
estado de su arte, para saber qué sprites hay que hacer y con qué spec.

Fuentes del relevamiento: `src/data/planes.js`, `src/data/missions.js`, `src/data/ships.js`,
`src/data/tuning.js`, `src/data/runways.js`, `src/systems/spawn.js`, `src/systems/collision.js`,
`src/render/world.js`, `src/render/enemies.js`, `src/render/soldiers.js`, `src/render/boom.js`,
`src/render/blast.js`, `src/render/ammo.js`, `src/render/plane.js`, `src/render/momentum.js`,
`src/render/hud.js`, `src/render/miras.js` + [NIVELES.md](NIVELES.md), [ROADMAP.md](ROADMAP.md),
[UPDATE_ANIMATIONS.md](UPDATE_ANIMATIONS.md).

**Leyenda de estado:**

| símbolo | significado |
|---|---|
| ✅ | tiene arte propio, enchufado y funcionando |
| 🟡 | hay asset pero falta enchufarlo o está a medias |
| ❌ | se dibuja por código (rects, `px()`) — **acá va el trabajo de arte** |
| 🔵 | decisión tomada: **se queda por código**, no necesita sprite |
| ⬜ | todavía no existe en el juego (viene del ROADMAP / NIVELES) |

**Specs generales para todo sprite nuevo** (de UPDATE_ANIMATIONS §3): PNG-32 con alpha, pixel art
de bordes duros (el juego dibuja con `imageSmoothingEnabled = false`), tira **horizontal** de
frames del mismo tamaño, sujeto **centrado** en cada frame (mismo centro en todos, para que el
swap no salte). El mundo se dibuja a **480×270** lógicos con buffer 2×.

---

## 1. Aviones jugables

Definidos en `data/planes.js`. Cada uno lleva **dos** imágenes: `preview` (ilustración grande del
menú de selección) y `sheet` (la hoja de vuelo).

**Spec de la hoja:** `84 × 84 px` por cuadro, **9 columnas (alabeo) × 3 filas (cabeceo:
trepa / nivel / pica)**. El frame es cuadrado a propósito: el avión ocupa 48 px de alto
(`SHEET_BODY_H`) y el resto es aire transparente para que al alabear 60° no se corten las puntas de
ala. Todo lo que se dibuje pegado al avión (llama de turbina, fogonazos) se mide contra 48, no
contra 84. Las hornea `tools/bake_planes.html` desde modelos low-poly; el arte manual tiene que
respetar el mismo layout.

**Spec de la HOJA 2** (`sheet2.png`, nueva): mismo frame de `84 × 84`, **9 columnas (alabeo) × 2
filas** — fila 0 **trepada fuerte (+32°)**, fila 1 **picada fuerte (−32°)**. Es el cabeceo de
COMBATE: el ±14° de la hoja base es cabeceo de crucero y una trepada de pirueta necesita verse
brusca. La usa el render solo durante las maniobras (`run.mvSteep`).

| # | Avión | preview | sheet | sheet2 | cockpit |
|---|---|---|---|---|---|
| 1 | **A-4 SKYHAWK** — equilibrado, el de la campaña | ✅ | ✅ | ✅ | ✅ |
| 2 | **IAI DAGGER** — rápido y con más fuego | ✅ | ✅ | ✅ | ❌ |
| 3 | **SUPER ÉTENDARD** — misiones especiales, Exocet | ✅ | ✅ | ✅ | ❌ |
| 4 | **A-4Q** — variante naval | ✅ | ✅ | ✅ | ❌ |
| 5 | **PAMPA 63** — entrenador biplaza IA-63 | ✅ | ✅ | ✅ | ❌ |
| 6 | **MIRAGE IIIEA** — interceptor de altura | ✅ | ✅ | ✅ | ❌ |
| 7 | **IA-58 PUCARÁ** — turbohélice bimotor, apoyo terrestre (ROADMAP #10.1) | ⬜ | ⬜ | ⬜ | ⬜ |
| 8 | **AERMACCHI MB-339** — jet liviano de ataque (ROADMAP #10.2) | ⬜ | ⬜ | ⬜ | ⬜ |
| 9 | **MIRAGE 5 peruano** — refuerzo desbloqueable a mitad de campaña (ROADMAP #20) | ⬜ | ⬜ | ⬜ | ⬜ |

> ⚠️ La hoja 2 es **opcional con fallback real**: `tools/build_web.py` la **descarta** en el bundle
> web (vacía la ruta para que no se pida un archivo inexistente) porque el artifact tiene tope de
> 16 MB. Sin ella el render cae a las filas normales de trepada/picada de la hoja base y **la
> pirueta se juega igual** — solo pierde la pose empinada. Si se hace arte a mano, mismo criterio:
> la hoja 2 puede faltar.

### Hoja 2 — cabeceos empinados de las PIRUETAS (`sheet2.png`)

Cada avión lleva además una **hoja 2**: `9 columnas de alabeo × 2 filas` (trepada fuerte +32° /
picada fuerte −32°), mismos frames de 84×84, horneada por el mismo `bake_planes.html`. La usan
las **piruetas de combate** (pop-up, split-s, yo-yos — ver `data/moves.js`): el ±14° de la hoja
base es cabeceo de crucero y una maniobra brusca necesita VERSE brusca. Es opcional con fallback
real: el build web la descarta (límite de 16 MB) y el render cae a las filas normales.

### Lo que va PEGADO al sprite y se dibuja por código

Todo esto vive en `render/plane.js` y ya está hecho en pixel art (rects enteros, sin degradés ni
strokes). **No hacen falta sprites**, pero conviene saber que existen porque están medidos contra
la hoja de vuelo:

| pieza | estado |
|---|---|
| **Tren de aterrizaje** — dos patas principales bajo la raíz del ala + rueda de proa; se recoge derecho para arriba y desaparece detrás del ala (`gear()`) | 🔵 hecho |
| **Piruetas de combate** — 9 maniobras por combo de dos toques (barrel roll, split-s, break turn, high/low yo-yo, jink, s-turn, terrain masking, pop-up); el split-s invierte el sprite (rotación en pantalla) y las poses empinadas salen de la hoja 2 | 🔵 hecho (`data/moves.js` + `systems/moves.js`) |
| **Fogonazos del cañón — DOS bocas alternadas** en la raíz del ala, convergentes; la posición gira con el alabeo y la inclinación entra recién pasada la mitad del giro (`muzzles()` / `muzzle()`) | 🔵 hecho |
| **Llama de la turbina** — filas que se afinan y enfrían hacia la punta, con diamante de choque (`flame()`) | 🔵 hecho |
| **Sombra sobre el agua**, rociada bajo el fuselaje, estela | 🔵 hecho |
| **Manchas de sangre** en el morro al atropellar (`bloodSplat`) | 🔵 por código (hay idea de un sprite de avión ensangrentado) |

> ⚠️ Las medidas verticales del tren salen de **medir las hojas horneadas** (frame de 84 px, el ala
> apoya en y=47..49, la panza termina en y=52). **Si se rehornean los aviones, hay que re-medir.**

### Piruetas de combate — qué pose usa cada una

Catálogo en `data/moves.js`, ejecución en `systems/moves.js`, combos en `core/input.js` + `game.js`.
Se lanzan con **dos toques direccionales en menos de 0.24 s** (teclado, cruceta o flicks del stick)
y se pueden apagar desde el menú [M] → **PIRUETAS: SÍ / NO**. El **tonel** clásico (←← / →→) queda
siempre: es la mecánica original, no una pirueta nueva.

| combo | maniobra | de dónde sale la pose |
|---|---|---|
| ←← →← | **BARREL ROLL** (tonel) | rotación completa del sprite + 2 fantasmas translúcidos (camino legado) |
| ↓↓ alto | **SPLIT-S** | medio tonel **rotando el sprite** 180° (`run.mvRoll`) + fila de picada de la **hoja 2** |
| ↓↓ bajo | **TERRAIN MASKING** | alabeo/cabeceo normales de la hoja base |
| ↑↑ bajo | **POP-UP** | fila de trepada de la **hoja 2** |
| ↑↑ alto · ↑↓ | **HIGH YO-YO** | hoja 2: trepada al subir → picada al recaer |
| ↓↑ | **LOW YO-YO** | hoja 2: picada al bajar → trepada al remontar |
| ↓← ↓→ | **BREAK TURN** | columna de alabeo a fondo + sobre-rotación del sprite (`run.mvRoll`) |
| ←→ →← | **S-TURN** | columnas de alabeo de la hoja base |
| ↑← ↑→ | **JINK** | columnas de alabeo, alternando a los quiebres |

**Lo que hoy está fingido y podría ser arte** (nada urgente, el gesto se lee):

- **Pose INVERTIDA de verdad** (panza a cámara) para el medio tonel del Split-S: hoy se rota el
  frame normal 180°, así que se ve el mismo avión al revés y no la panza.
- **Alabeo más allá de 60°** para el Break Turn: la columna extrema de la hoja llega a 60° y el
  resto se completa rotando el sprite.

### Cockpit (vista de cabina del MOMENTUM)

Hoy hay **uno solo, genérico** (`assets/planes/a4-skyhawk/cockpit.png`, 1024×559) usado por todos
los aviones. Pendiente: **un cockpit por avión** (array como `PLANES`).

Spec: proporción de pantalla **320×180** (ideal 640×360 para nitidez 2×), **centro transparente**
(el vidrio, aprox. de y=15 a y=145 en coords 320×180), parantes laterales del canopy, panel de
instrumentos abajo. Los 13 px de arriba y abajo los tapa el letterbox.

---

## 2. Enemigos aéreos

| objeto | qué es | HP | estado y spec |
|---|---|---|---|
| `helo` | helicóptero: llega **de frente** y **vira a perfil** al acercarse | 4 | ✅ `enemies/helo.png` horneada (8 columnas de yaw × **2 fases de rotor** — el rotor bate). La columna la elige el `yaw` por distancia; se espeja según el lado al que abre. Fallback por código queda |
| `jet` | caza enemigo de frente, cierra más rápido (`spd+45`) | 3 | ✅ `enemies/jet.png` horneada (5 columnas de alabeo −30°→+30°). Con ENEMIGOS MÓVILES el alabeo sale de la velocidad lateral real del tejido |
| `balloon` | globo de barrera, cae de un tiro | 1 | ✅ `enemies/balloon.png` horneada — **3 poses de rolido** cicladas por un seno lento (tambaleo en el lugar); el cable y la inclinación al viento van por código |
| `birds` | bandada (daña, no derriba); variante blanca y oscura, deriva lateral propia | — | 🔵 se queda por código — rehechas con aleteo en TRES poses (arriba/planeo/abajo, con quiebre de ala), cuerpo con panza, tamaños desparejos y bob por ave |
| `missile` | misil guiado enemigo — lo lanzan el radar, los `aa`, los `aatruck` **y los cazas armados**; variante `tracer` desde puestos y cazas | — | 🔵 rehecho por código: ojiva oscura con canto, escape blanco encarándote, corona de llama que late y estela de humo que se abre atrás |
| `bomb` | bomba cayendo del cielo (modo BOMBARDEO); chocarla en el aire mata | — | ❌ código |
| **Harrier británico** | con marcador de zona vulnerable (ROADMAP #20, ayuda española) | — | ⬜ no existe |
| **C-130 Hércules aliado** | reabastecimiento en vuelo con manguera (ROADMAP #15) | — | ⬜ no existe |

### Movimiento propio (`cfg.enemyMove`, menú [M] → "ENEMIGOS: MÓVILES / QUIETOS")

Los enemigos ahora **se mueven solos**, y eso condiciona qué tiene que expresar cada hoja:

- **globos** inclinados al viento sobre su cable (el ancla queda fija),
- **helicópteros** patrullando — solo el 55%, porque la mezcla de quietos y móviles confunde más,
- **cazas** que tejen **y corrigen hacia tu carril** (2.2 u/s): por eso el alabeo del sprite tiene
  que corresponder a hacia dónde va de verdad. **El 45% viene ARMADO** (`gun`): suelta 2 trazadoras
  en su pasada de ataque (banda z 70–190, gatillo en `systems/collision.js`), con fogonazos de ala,
- **vehículos** (radar, camión AA) rodando con rebote contra la orilla real,
- **mástiles-fragata** navegando.

La personalidad se sortea al nacer (`systems/spawn.js`) y se aplica por frame
(`systems/collision.js`); la llave del menú apaga la **aplicación**, no el sorteo. Lo que ya se
movía de antes (bandada, barcaza, bombas) queda fuera de la llave.

---

## 3. Objetos del terreno TIERRA (`cfg.terrain = 'land'`)

Sembrados por `systems/spawn.js`. La altura es en unidades de MUNDO.

| objeto | qué es | HP | alto |
|---|---|---|---|
| `cliff` | acantilado / masa de roca. **Indestructible** — el único obstáculo del juego que no se puede eliminar, solo esquivar. Altura sorteada con sesgo a lo bajo; cuanto más alto, más angosto | — | 5–22 (ancho 6–13) |
| `tree` | arbusto batido por el viento | — | 7–22 |
| `tower` | torre | 3 | 16–25 |
| `poles` | postes / tendido eléctrico | — | 9–12 |
| `flag` | mástil con bandera | 1 | 11–16 |
| `depot` | depósito de suministros | 3 | 4.5–6.5 |
| `tent` | carpa: **pare una patrulla** de soldados al aparecer | 1 | 3.4 |
| `aa` | pieza antiaérea: **dispara misiles guiados**, blanco prioritario | 3 | 4.4 |

Estado: `tent` ✅ (`enemies/tent.png`, carpa a dos aguas con entrada), `aa` ✅ (`enemies/aa.png`,
2 poses de apunte de los caños), `depot` ✅ (`enemies/depot.png`, galpón abovedado; se escala por
`o.h` al dibujar). `cliff`, `tree`, `poles` y `flag` quedan 🔵 por código — los tres se **animan**
(roca sorteada por seed, copa al viento, bandera flameando por franjas) y un sprite fijo perdería
justamente eso. `tower` sigue ❌ (la celosía por código se ve bien; baja prioridad).

ROADMAP #16 pide además **más variedad de props**: rocas, cercos, trincheras.

> **Blancos chicos = daño, no derribo.** Por regla de ALTURA (`SOFT_H = 4.8`, `systems/collision.js`),
> toda estructura apoyada en el suelo y más baja que eso **daña la célula y se destruye** en vez de
> hacer explotar el avión. Hoy caen ahí el `aa` de campaña y el `aatruck`; `radar`, `depot`, `bldg`
> y `lcu` siguen siendo letales. Importa para el arte: los "blandos" se ven de cerca y se pasan por
> encima, así que su silueta se lee **desde arriba y a un metro**.

---

## 4. Objetos del terreno COSTA (`cfg.terrain = 'coast'`) — el desembarco británico

Tierra a la izquierda, playa y mar a la derecha. Campo **35% más denso** que los otros mapas.
Incluye todo lo de TIERRA (`cliff`, `tent`, `aa`) más:

| objeto | qué es | HP | alto |
|---|---|---|---|
| `bldg` | puesto / edificio británico; los `armed` (60%) tienen soldados adentro tirando ráfagas de trazadoras | 4 | 7.5–11.5 |
| `lcu` | **barcaza de desembarco navegando**: entra desde el mar, encalla en la playa y larga la patrulla. Es el **boss del NIVEL 1** | 2 | 4 |
| `radar` | radar móvil (vehículo). Es el **boss del NIVEL 2** | 2 | 5 |
| `aatruck` | camión antiaéreo, dispara misiles | 3 | 4.6 |
| `trench` | **trinchera argentina** — decorado sin colisión, del lado izquierdo; tirotea a los británicos y cada tanto abate uno | — | — |

Estado: `lcu` ✅ (`enemies/lcu.png`, 3/4 con la rampa hacia la playa — **3 poses de rolido** + bob:
cabecea con la marejada navegando y, apenas, encallada), `radar` ✅ (`enemies/radar.png`, 4 poses
del plato girando), `aatruck` ✅ (`enemies/aatruck.png`, 3 poses de torreta barriendo).
`bldg` ✅ (`enemies/bldg.png`, bloque a dos plantas con bolsas de arena; se escala por `o.h` —
el soldado asomado y su fogonazo siguen por código encima). `trench` sigue ❌ (código).

> **Hojas de enemigos**: las hornea `tools/bake_enemies.html` (`npx electron tools/bake_enemies_run.js`)
> a `assets/world/enemies/`, con el mismo pipeline low-poly de los aviones pero cámara FRONTAL.
> Las enchufa `src/render/enemies.js` (cajas de contenido **medidas sobre el alfa** — re-medir si
> se rehornea) y el dibujo a mano de `render/world.js` queda como fallback si una hoja no carga.
> Las 6 hojas juntas pesan 19.6 KB y `tools/build_web.py` embebe la carpeta entera.

**Spec exacta de las hojas actuales** (`SHEETS` en `render/enemies.js`) — si el arte lo hace una
persona en vez del horno, tiene que respetar esto:

| hoja | frame | grilla | caja de contenido (alfa) | ancho en mundo (`wu`) |
|---|---|---|---|---|
| `helo.png` | 64 × 48 | 8 cols (yaw) × 2 filas (rotor) | x 6–57, y 16–36 | 11.5 |
| `jet.png` | 64 × 48 | 5 cols (alabeo) × 1 | x 14–49, y 10–31 | 10.5 |
| `radar.png` | 48 × 48 | 4 cols (plato girando) × 1 | x 10–43, y 7–40 | 6.2 |
| `aatruck.png` | 56 × 48 | 3 cols (torreta) × 1 | x 13–48, y 12–39 | 6.6 |
| `lcu.png` | 72 × 48 | 1 × 1 | x 10–51, y 11–32 | 8.6 |
| `balloon.png` | 48 × 48 | 1 × 1 | x 9–37, y 11–33 | 5.6 |

Los vehículos se anclan por el **pie del contenido** (no del frame), así apoyan en el suelo.
`wu` es la perilla de tamaño en pantalla y **no toca la colisión** (los hitboxes viven en
`core/hitbox.js`).

---

## 5. Objetos de MAR ABIERTO

| objeto | qué es | estado y spec |
|---|---|---|
| `mast` | mástil de fragata que emerge del agua, 11–28 de alto. **No se destruye** — esquivarlo es la habilidad central. Con ENEMIGOS MÓVILES **navega** (deriva lateral propia) | ✅ `enemies/fragata.png`: el CASCO horneado (proa a cámara, con puente) + estela de proa cuando navega. El **mástil sigue por código** encima — su altura se sortea 11–28 y un sprite fijo la aplastaría |
| **flota del horizonte** | 3 siluetas de buques fondeados (`drawFleet`), decorado con parallax | ❌ código |

---

## 6. Pickups

| objeto | qué es | estado |
|---|---|---|
| `fuel` | bidón de combustible (+30), aparece en el aire | 🔵 rehecho por código: tambor con aros, canto al sol, tapón, brillo y **halo pulsante** (lo separa de los enemigos: nada peligroso late con luz cálida) |

---

## 7. Soldados (infantería)

Ya hay hojas: `assets/world/soldats/englishsoldatv2.png` (la que usa el juego) y
`argentinesoldatv2.png`. Son grillas de ~128 px por fila con las animaciones rotuladas, **de perfil
mirando a la izquierda** — que es hacia donde huyen del avión. Las cajas de recorte están
**medidas sobre el alfa** en `render/soldiers.js`: si se cambia la hoja, hay que volver a medirlas.
Los frames se **espejan** cuando el soldado va a la izquierda (siempre, porque huyen), y el
uniforme se retocó a **DPM oscuro con contorno de dos tonos** para despegarlo del terreno.

| animación | frames | estado |
|---|---|---|
| **Correr** de perfil | 6 | ✅ enchufada (`RUN_LEFT`) |
| **Cuerpo a tierra / prone** — los soldados cercanos **se tiran al suelo** al ver caer a uno y quedan a salvo del atropello | 1 | ✅ enchufada (`PRONE`) |
| **Muerte** — caída/desintegración con sangre (para metralleta y misil) | 3–4 | ❌ pedida, ~24×24 px |
| **Atropellado por el avión** — salpicón / vuelo de cuerpo | 2–3 | ❌ pedida, ~32×24 px |
| **Variantes** de casco/color (`_a`, `_b`, `_c`) para dar variedad | — | ❌ pedidas |
| **Soldado argentino de trinchera** disparando | — | 🟡 la hoja existe, no está enchufada |
| **Piloto derribado jugable a pie** (minijuego terrestre, ROADMAP #24) | — | ⬜ no existe |

> Atropellar ya **no es gratis**: golpea la célula de a poco (0.12 acumulativo), así que una pasada
> larga te deja sin nafta. El puntaje sigue alto — es un canje, no un castigo. La caja del soldado
> se remodeló: `hw` es el **cuerpo** (0.6) y el chequeo le suma la semi-envergadura del avión.

---

## 8. Buques del MOMENTUM — los bosses ⭐

El minijuego del clímax muestra el buque **horizontal a lo largo de la pantalla**, en vista
**lateral**, creciendo por pasada (`scale` 0.55 → 0.75 → 1.0). Hoy son **rects**: es el asset más
importante que falta.

**Spec:** `barcaza_lateral.png`, imagen única ~**280 × 70 px**, vista lateral completa.
Las piezas tienen que quedar **reconocibles y separadas** porque el juego les dibuja encima los
recuadros de zona crítica, la barra de HP y el estado "chamuscado/destruido" **por zona**.
Opcional: versión dañada, o se chamusca por código.

Geometría compartida (`data/tuning.js`): `SHIP_UH = 13.5` (el casco mide `uh*1.5`),
`SHIP_DECK = 54` (cubierta, bajo el horizonte).

### Las 3 clases y sus zonas (`data/ships.js`)

| clase | buques | zonas por pasada (HP) |
|---|---|---|
| **`t42`** Destructor Tipo 42 | HMS SHEFFIELD, HMS COVENTRY | 2× **cañón AA** proa/popa (55) → **radar** del mástil (45) → **puente** (130) |
| **`t21`** Fragata Tipo 21 | HMS ARDENT, HMS ANTELOPE | 2× **AA** (55) → **radar chico** (50) → 2× **motores** gemelos al nivel del casco (70 c/u) |
| **`log`** Logístico | RFA SIR GALAHAD, ATLANTIC CONVEYOR | **AA única** a proa (70) → **depósito de carga** grande (110) → **puente a popa** (100) |

Es decir, las piezas que hay que dibujar identificables: **casco, puente/superestructura, chimenea,
mástil con radar, torretas AA a proa y popa, motores al nivel del agua, depósito de carga.**

### Bosses de NIVELES.md sin clase asignada todavía

De los 12 niveles de la campaña, estos objetivos aún no tienen entrada en `SHIP_CLASS` ni misión en
`data/missions.js`:

- **Lancha de desembarco** (NIVEL 1) — hoy existe como obstáculo `lcu`, no como boss
- **Radar británico** (NIVEL 2) — hoy existe como obstáculo `radar`, no como boss
- **Centro logístico de San Carlos** (NIVEL 7) — no existe
- **Sir Tristram** (NIVEL 10) — probablemente clase `log`
- **HMS Broadsword** (NIVEL 11) — fragata Tipo 22, clase nueva
- **HMS Glasgow** (NIVEL 12) — destructor Tipo 42, entra en `t42`

---

## 9. Explosiones y FX

| FX | estado |
|---|---|
| **Hongo de bomba** — ciclo completo en grilla 6×3 = **18 frames** (destello → columna → hongo naranja → humo blanco → gris que se disipa) | ✅ `assets/world/explosions/bomb.png`, enchufado en `render/boom.js` |
| **Bola de fuego FRONTAL** — la explosión de cara: bomba reventada en el aire, el avión al estrellarse y **cada blanco que revienta** (va enganchada a `explodeAt`, por donde pasan todas las destrucciones) | ✅ `explosions_front.png` en `render/blast.js`: 32 frames con las cajas **medidas una por una sobre el alfa** (la hoja parece 12×3 celdas de 85×85 pero el contenido se derrama a la celda vecina: 31 de 36 tienen píxeles pegados al borde). Ciclo de 1.15 s, 26 unidades de mundo a escala 1; los frames se escalan contra un alto de referencia común para que el destello inicial no salga del tamaño de la bola desplegada |
| explosion1/2, explosion_floor, explosion_floor_smoke, explosion_shot1/2, explosion_smoke, explosion_small_distant, smoke_distant | ✅ existen en `assets/world/explosions/` (sin enchufar todavía) |
| ~~**Explosión genérica** 48×48 para choque, impacto y remate~~ | ✅ **cubierta** por la bola frontal — ya no hace falta pedirla |
| **Trazadoras del cañón** — estela muestreada hacia atrás en z y proyectada punto por punto: la perspectiva sale sola (gruesa cerca, fina hacia el horizonte) y el color enfría hacia atrás (blanco → ámbar → naranja → rojo sucio) | 🔵 rehecho en pixel art (`render/ammo.js`), todo con rects enteros |
| **Muzzle flash del cockpit** — resplandor lateral que entra por el borde del canopy al disparar (hoy cuadrados blancos) | ❌ pedido: `muzzle_flash.png` único, ~24×32 px; se espeja por código |
| Salpicadura y estela de agua, rocío, espuma, sombra en el agua | 🔵 se quedan por código |
| Fogonazo del cañón (dos bocas) y postquemador | 🔵 hechos en pixel art (ver §1) |
| Balas y misiles | 🔵 se quedan por código |
| Sangre + tierra al atropellar, `bloodSplat` sobre el morro | 🔵 por código |
| **Derribo con INERCIA** — al morir, los pedazos del avión ('chunk') y la bola de fuego conservan la velocidad que traía: siguen de largo alejándose (vz que se frena), caen, **rebotan** en el suelo/agua con salpicón y quedan tirados humeando. `DEATH_REVEAL` pasó de 1.0 a 1.5 s para que el patinazo se alcance a ver | 🔵 hecho por código (`die()` + bloque 'dead' del update en `game.js`) |
| **Bola de fuego del DERRIBO en pixel art** (`pix` en el airboom) — corona de bloques sueltos que se enfrían, núcleo blanco breve y humo que sube, **con huecos y más chica** que la hoja frontal: la hoja tapaba los pedazos del avión rompiéndose, que es justo lo que hay que ver. La hoja sigue para bombas y blancos | 🔵 hecho por código (`drawObstacle` rama `airboom.pix`) |
| **Flash de impacto con la forma del sprite** — al pegarle a un enemigo horneado, el destello pinta el SPRITE de blanco (canvas auxiliar + 'source-in'); antes era un rectángulo blanco que parecía el hitbox de depuración parpadeando | 🔵 hecho (`drawFrame(..., flash)` en `render/enemies.js`) |

---

## 10. UI / HUD

| elemento | estado |
|---|---|
| **Miras** — hoja de 9 miras en grilla 3×3, teñidas al acento del juego por código | ✅ `assets/ui/miras.webp` (cajas medidas al píxel en `render/miras.js`) |
| **Silueta de Malvinas** — la 4ª estrella / rango S, coloreada por tintado | ✅ `assets/ui/malvinas.webp` |
| **Logos** | ✅ `assets/ui/logos/` |
| `obj_puerto.png` — Puerto Argentino, extremo izquierdo de la barra de objetivo | ❌ fallback dibujado (`drawHudAsset`) |
| `obj_barcaza.png` — barcaza inglesa, extremo derecho (puede ser la misma `fragata.png`) | ❌ fallback dibujado |
| `obj_avion.png` — marcador del avión que avanza por la línea | ❌ fallback dibujado |
| **Estrellas** del galardón | 🔵 glifo `★` por código |
| Panel de estado (silueta del avión: alas = calor del cañón, motor = combustible, panza = roce) | 🔵 por código |
| **Panel de daños por partes** completo (ROADMAP #22) | ⬜ requiere decidir antes si el avión tiene integridad |

Los tres assets de la barra de objetivo se enchufan llenando `src` en `OBJ_ASSETS`
(`render/hud.js`); mientras estén vacíos, se dibuja el fallback.

---

## 11. Escenario y terreno

| elemento | estado |
|---|---|
| **Cielos** — día argentino, nublado, noche, noche de tormenta, amanecer | ✅ `assets/world/terrain_back/` |
| **Normales del agua** | ✅ `assets/world/waternormals.jpg` |
| **Fotos** — principal, victoria, derrota, informe Rattenbach | ✅ `assets/photos/` |
| **Pistas de despegue** — 5 estilos (`data/runways.js`): BAM MALVINAS, GASTADA, TIERRA, PASTO, ASFALTO | 🔵 procedural (suelo, superficie, eje, balizas, marcas de frenada) |
| **BAM Cóndor** (Pradera del Ganso / Darwin) — base chica de pista rústica (ROADMAP #26.1) | ⬜ pendiente |
| **Base argentina de llegada** para las misiones de REGRESO (ROADMAP #26) | ⬜ pendiente |
| Puerto/meseta y su pared (`PORT_H = 15`), orilla serpenteante, playa, mar de puntos, moorland | 🔵 procedural |
| **Colinas del horizonte** (las siluetas con parallax) | 🔵 rehechas por código: cresta quebrada sorteada por seed y **dos tonos** (laderas al sol / en sombra) + bruma al pie — antes eran dos triángulos planos |

---

## 12. Orden sugerido de trabajo

Lo que queda, de mayor a menor impacto visible:

1. **Barcaza lateral del momentum** ⭐ — es el clímax del juego y hoy son rectángulos. 3 variantes
   (`t42`, `t21`, `log`) con las piezas separadas.
2. **Soldados**: muerte + atropellado (correr y prone ya están enchufados).
3. Los 3 iconos de la barra de objetivo (`obj_puerto`, `obj_barcaza`, `obj_avion`).
4. **Muzzle flash** del cockpit.
5. Props que siguen por código: `trench`, `tower`; **misil enemigo**, **bomba** y **bidón**.
6. **Cockpit por avión** (hoy uno genérico para los 6).
7. **Pose invertida** para el Split-S y alabeo más allá de 60° para el Break Turn (§1) — mejora
   fina de las piruetas, no bloquea nada.
8. Aviones nuevos: **Pucará** y **MB-339**.

**Ya resueltos** (no reabrir): helicóptero, caza, globo, radar móvil, camión AA, barcaza de
desembarco, nido AA, carpa, depósito, puesto y casco de fragata (hojas horneadas, §2–§5); bandada
rehecha por código (§2); hongo de bomba y bola de fuego frontal (§9); trazadoras, fogonazos de dos
bocas, tren de aterrizaje y derribo con inercia (§1 y §9); **hoja 2 de cabeceos empinados** para
las piruetas, horneada para los 6 aviones (§1).

---

## 13. PENDIENTE DE DISEÑO — persecución enemiga y contraataque

> Anotado el 25 de julio de 2026. **No está implementado**: esto es el pedido, con lo que implica
> en sistemas y en arte. Es la continuación natural de las piruetas (§1): hoy son un esquive
> precioso **sin nadie a quien esquivar de atrás**.

### 13.1 Los cazas enemigos te PERSIGUEN

Hoy el `jet` viene **de frente**, cruza y se va (el 45% suelta dos trazadoras en la pasada). Nunca
se te pone atrás, así que no hay presión sostenida: el peligro dura el segundo del cruce.

Lo que falta es que el caza **se te cuelgue de la cola** y quede ahí, disparando, hasta que hagas
algo. Ciclo propuesto:

1. **Cruce** — entra de frente como ahora.
2. **Viraje** — en vez de irse, invierte y se acomoda **detrás** tuyo (fuera de cámara: la vista es
   desde atrás del avión, así que el perseguidor **no se ve**, se AVISA).
3. **Persecución** — sigue tu carril con retardo, corrige y **abre fuego** por ráfagas.
4. **Resolución** — o lo sacás con una maniobra, o te alcanza.

**Qué hace falta para que se lea sin verlo** (el problema de diseño principal): un aviso claro de
"lo tenés en la cola" — arco de radar en el HUD, luz de alerta, la alarma que ya existe
(`alarm` en `data/sfx.js`, hoy reservada al misil buscador) y las trazadoras que te pasan por al
lado desde ATRÁS hacia el horizonte (al revés de las tuyas — la dirección es la pista visual).
El aviso **de que viene** es otra cosa y sale de la radio: ver §13.2.

> Dónde tocaría: `systems/spawn.js` (estado inicial del caza), `systems/collision.js` (donde ya
> vive el movimiento propio de enemigos, `cfg.enemyMove`), `render/hud.js` (aviso), `render/ammo.js`
> (trazadoras que vienen de atrás).

### 13.2 El aviso llega por RADIO desde la base de tierra — y a veces NO llega

**El avión argentino no tiene radar.** El aviso de que viene un caza enemigo no sale de un sistema
a bordo: te lo **canta por radio la base de tierra**. Ese es el sistema que reemplaza al radar del
enemigo, y también la fuente del spawn:

- **La base habla, y ahí aparecen.** El mensaje de radio ("caza entrando por el norte", rumbo,
  cuántos) es lo que **anuncia el spawn**: primero la voz, después el enemigo. Le da un latido al
  mapa — dejás de mirar el horizonte a ciegas y empezás a escuchar.
- **A VECES aparecen sin avisar.** Un porcentaje de los cazas entra en silencio: la base no los vio,
  o no llegó el mensaje. **Esa es la idea histórica hecha mecánica** — los aviones argentinos
  volaban sin radar propio y dependían de un aviso que podía no llegar. El jugador aprende a no
  confiar del todo en la radio, y el susto del que entra callado vale por diez avisados.
- La radio sirve para **todo lo demás** también: la flota, el clima, el estado de la misión, aliento
  entre pasadas. No es solo un detector de amenazas — es la voz que te acompaña en un juego donde
  volás solo.

> Es la bajada concreta de **ROADMAP #19** (radares ingleses vs base terrestre argentina) y del
> **#18** (asimetría): el inglés ve; vos dependés de que alguien te avise.
>
> Dónde tocaría: un sistema nuevo de radio que alimente el spawn (`systems/spawn.js`) en vez de que
> el spawn sortee solo; textos en `data/strings.js` (i18n, como todo lo visible); línea de mensaje
> en `render/hud.js`; sonido de la radio en `systems/audio.js` (hoy todo el chirrido y el ruido son
> procedurales — un click de PTT y estática se hacen sin assets).

### 13.3 Combinaciones de CONTRAATAQUE

Las piruetas ya existen y el detector de combos ya es genérico (§1): el contraataque es **darles
un para qué**. La idea es que cada maniobra sirva contra la persecución de una forma distinta y que
haya **combos propios de contraataque**, no solo de esquive:

| maniobra | qué debería hacerle al perseguidor |
|---|---|
| **BREAK TURN** (↓← / ↓→) | lo obliga a **pasarse de largo** (overshoot): te quedás vos atrás |
| **SPLIT-S** (↓↓ alto) | lo perdés por abajo — el clásico para romper el contacto |
| **JINK** (↑← / ↑→) | le arruina la solución de tiro: falla las ráfagas mientras dura |
| **HIGH YO-YO** (↑↑ alto) | lo dejás pasar por debajo y recaés sobre él |
| **TERRAIN MASKING** (↓↓ bajo) | ya descarga el radar; debería **romper el lock** del misil |

**La ventana de contraataque** es el premio: cuando el perseguidor **se pasa de largo**, queda
adelante tuyo unos segundos, y ahí sí lo ves y lo podés matar. Ese es el bucle completo —
te persiguen → maniobrás → se pasa → lo cazás.

Combos **nuevos** a definir (el detector acepta cualquier par de toques; los pares libres hoy son
`lu`, `ru`, `ld`, `rd` y los triples si se amplía la ventana).

### 13.4 Contraataque tipo BATTLEFIELD con el lanzamisiles

El modelo es el **lanzamisiles con candado** de Battlefield (Stinger / Igla): no es apretar y que
salga — es **apuntar, sostener, esperar el tono, y recién ahí disparar**, con el enemigo enterándose
de que lo estás enganchando.

Piezas del pedido:

- **Candado sostenido**: mantener el blanco en la mira carga el enganche (tono que sube, corchetes
  que se cierran sobre el objetivo). Soltar antes = se pierde.
- **Tono de lock** y **aviso al enemigo**: el caza enganchado reacciona — rompe, se va, o suelta
  contramedidas.
- **Misil que persigue de verdad** (el guiado ya existe para el misil enemigo: se puede espejar).
- **Contramedidas**: **bengalas / flares** para vos también, contra el misil buscador del radar
  (hoy la única defensa es interceptarlo a tiros o esquivarlo).
- **Munición escasa** — el misil ya es limitado (`MSL_MAX = 3`, recarga 1 cada 7 s): el candado le
  da peso a cada uno.

> Lo que YA está y se reusa: `pmissiles` con guiado leve e intercepción de misiles enemigos,
> `MSL_MAX`/recarga (`data/tuning.js`), la mira del mouse/joystick (`render/miras.js`), el misil
> enemigo con homing (`systems/flight.js`) y la alarma (`data/sfx.js`).

### 13.5 Arte que implica

| pieza | por qué |
|---|---|
| **Caza enemigo visto DESDE ATRÁS** (cola a cámara) | cuando se pasa de largo queda adelante tuyo: la hoja actual son 5 alabeos de frente, no sirve de espaldas |
| **Poses de viraje del caza** (se invierte para ponerse en tu cola) | hoy solo tiene alabeo; el giro de 180° no tiene con qué dibujarse |
| **Aviso de perseguidor en el HUD** — arco/radar trasero, luz de alerta | es lo único que hace legible una amenaza que no se ve |
| **Línea de radio en el HUD** (§13.2) — franja de mensaje con el emisor, tipografía de teletipo | la voz de la base tiene que leerse sin tapar el vuelo; conviene un lugar fijo y reconocible |
| **Retícula de candado** — corchetes que se cierran + estado enganchado | la mira actual (`miras.webp`) es fija, no tiene estados |
| **Bengalas / flares** | FX nuevo: racimo de luces cayendo hacia atrás |
| **Trazadoras entrantes desde atrás** | mismas del cañón pero alejándose de la cámara (§9) |

> Prioridad: **después** de la barcaza del momentum (§12 #1). Es la feature que más cambia el
> juego de las que quedan, pero también la que más sistemas toca — y arranca con diseño, no con
> arte: sin el aviso de "lo tenés atrás" resuelto, ningún sprite lo salva.
