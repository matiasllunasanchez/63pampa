# PENDIENTES DE REDISEÑO — inventario de unidades y objetos

_Relevamiento del 25 de julio de 2026._

Lista completa de **todo lo que el juego dibuja** (unidades, objetos, FX, UI y escenario) con el
estado de su arte, para saber qué sprites hay que hacer y con qué spec.

Fuentes del relevamiento: `src/data/planes.js`, `src/data/missions.js`, `src/data/ships.js`,
`src/data/tuning.js`, `src/data/runways.js`, `src/systems/spawn.js`, `src/render/world.js`,
`src/render/soldiers.js`, `src/render/boom.js`, `src/render/momentum.js`, `src/render/hud.js`,
`src/render/miras.js` + [NIVELES.md](NIVELES.md), [ROADMAP.md](ROADMAP.md),
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

| # | Avión | preview | sheet | cockpit |
|---|---|---|---|---|
| 1 | **A-4 SKYHAWK** — equilibrado, el de la campaña | ✅ | ✅ | ✅ |
| 2 | **IAI DAGGER** — rápido y con más fuego | ✅ | ✅ | ❌ |
| 3 | **SUPER ÉTENDARD** — misiones especiales, Exocet | ✅ | ✅ | ❌ |
| 4 | **A-4Q** — variante naval | ✅ | ✅ | ❌ |
| 5 | **PAMPA 63** — entrenador biplaza IA-63 | ✅ | ✅ | ❌ |
| 6 | **MIRAGE IIIEA** — interceptor de altura | ✅ | ✅ | ❌ |
| 7 | **IA-58 PUCARÁ** — turbohélice bimotor, apoyo terrestre (ROADMAP #10.1) | ⬜ | ⬜ | ⬜ |
| 8 | **AERMACCHI MB-339** — jet liviano de ataque (ROADMAP #10.2) | ⬜ | ⬜ | ⬜ |
| 9 | **MIRAGE 5 peruano** — refuerzo desbloqueable a mitad de campaña (ROADMAP #20) | ⬜ | ⬜ | ⬜ |

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
| `balloon` | globo de barrera, cae de un tiro | 1 | ✅ `enemies/balloon.png` horneada (frame único; el cable y la inclinación al viento van por código) |
| `birds` | bandada (daña, no derriba); variante blanca y oscura, deriva lateral propia | — | ❌ código |
| `missile` | misil guiado enemigo — lo lanzan el radar, los `aa` y los `aatruck`; variante `tracer` desde los puestos | — | ❌ código |
| `bomb` | bomba cayendo del cielo (modo BOMBARDEO); chocarla en el aire mata | — | ❌ código |
| **Harrier británico** | con marcador de zona vulnerable (ROADMAP #20, ayuda española) | — | ⬜ no existe |
| **C-130 Hércules aliado** | reabastecimiento en vuelo con manguera (ROADMAP #15) | — | ⬜ no existe |

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

Todos ❌ (código). ROADMAP #16 pide además **más variedad de props**: rocas, cercos, trincheras.

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

Estado: `lcu` ✅ (`enemies/lcu.png`, 3/4 con la rampa hacia la playa), `radar` ✅ (`enemies/radar.png`,
4 poses del plato girando), `aatruck` ✅ (`enemies/aatruck.png`, 3 poses de torreta barriendo).
`bldg` y `trench` siguen ❌ (código).

> **Hojas de enemigos**: las hornea `tools/bake_enemies.html` (`npx electron tools/bake_enemies_run.js`)
> a `assets/world/enemies/`, con el mismo pipeline low-poly de los aviones pero cámara FRONTAL.
> Las enchufa `src/render/enemies.js` (cajas de contenido **medidas sobre el alfa** — re-medir si
> se rehornea) y el dibujo a mano de `render/world.js` queda como fallback si una hoja no carga.

---

## 5. Objetos de MAR ABIERTO

| objeto | qué es | estado y spec |
|---|---|---|
| `mast` | mástil de fragata que emerge del agua, 11–28 de alto. **No se destruye** — esquivarlo es la habilidad central | ❌ Spec: `fragata.png`, imagen única ~64×40 px, vista de frente/proa |
| **flota del horizonte** | 3 siluetas de buques fondeados (`drawFleet`), decorado con parallax | ❌ código |

---

## 6. Pickups

| objeto | qué es | estado |
|---|---|---|
| `fuel` | bidón de combustible (+30), aparece en el aire | ❌ código |

---

## 7. Soldados (infantería)

Ya hay hojas: `assets/world/soldats/englishsoldatv2.png` (la que usa el juego) y
`argentinesoldatv2.png`. Son grillas de ~128 px por fila con las animaciones rotuladas, **de perfil
mirando a la izquierda** — que es hacia donde huyen del avión. Las cajas de recorte están
**medidas sobre el alfa** en `render/soldiers.js`: si se cambia la hoja, hay que volver a medirlas.

| animación | frames | estado |
|---|---|---|
| **Correr** de perfil | 6 | ✅ enchufada (`RUN_LEFT`) |
| **Cuerpo a tierra / prone** | 1 | ✅ enchufada (`PRONE`) |
| **Muerte** — caída/desintegración con sangre (para metralleta y misil) | 3–4 | ❌ pedida, ~24×24 px |
| **Atropellado por el avión** — salpicón / vuelo de cuerpo | 2–3 | ❌ pedida, ~32×24 px |
| **Variantes** de casco/color (`_a`, `_b`, `_c`) para dar variedad | — | ❌ pedidas |
| **Soldado argentino de trinchera** disparando | — | 🟡 la hoja existe, no está enchufada |
| **Piloto derribado jugable a pie** (minijuego terrestre, ROADMAP #24) | — | ⬜ no existe |

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
| explosion1/2, explosion_floor, explosion_floor_smoke, explosion_shot1/2, explosion_smoke, explosion_small_distant, smoke_distant | ✅ existen en `assets/world/explosions/` |
| `explosions_front.png` — 32 frames, explosión frontal (airburst, avión estrellado, blancos que revientan) | 🟡 agregada, cajas medidas sobre el alfa (la hoja parece 12×3 de 85×85 pero el contenido se derrama entre celdas) |
| **Explosión genérica** — para choque del avión, impacto en barcaza y remate de muerte de soldado | ❌ pedida: 5–6 frames, ~48×48 px, naranja/humo |
| **Muzzle flash** — resplandor lateral que entra por el borde del canopy al disparar (hoy cuadrados blancos) | ❌ pedido: `muzzle_flash.png` único, ~24×32 px; se espeja por código |
| Salpicadura y estela de agua, rocío, espuma, sombra en el agua | 🔵 se quedan por código |
| Fogonazo de cañón y postquemador | 🔵 se quedan por código |
| Balas, misiles, trazadoras | 🔵 se quedan por código |
| Sangre + tierra al atropellar, `bloodSplat` sobre el morro | 🔵 por código (hay idea de un sprite de avión ensangrentado) |

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

---

## 12. Orden sugerido de trabajo

Combina la prioridad de UPDATE_ANIMATIONS §4 con lo que más se ve hoy roto:

1. **Barcaza lateral del momentum** ⭐ — es el clímax del juego y hoy son rectángulos. 3 variantes
   (`t42`, `t21`, `log`) con las piezas separadas.
2. **Soldados**: muerte + atropellado (correr y prone ya están enchufados).
3. **Explosión genérica** 48×48, que sirve para choque, impacto y remate.
4. ~~**Helicóptero** (8 frames de yaw) y **jet** (5 de alabeo)~~ — ✅ horneados, junto con globo,
   radar, camión AA y barcaza (ver §2 y §4).
5. **Fragata / mástil** + los 3 iconos de la barra de objetivo (`obj_puerto`, `obj_barcaza`,
   `obj_avion`).
6. **Muzzle flash** del cockpit.
7. Props de tierra y costa (`aa`, `bldg`, `lcu`, `radar`, `aatruck`, `depot`, `tower`, `tent`).
8. Aviones nuevos: **Pucará** y **MB-339**.
