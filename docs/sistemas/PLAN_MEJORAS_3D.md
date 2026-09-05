# PLAN — LAS MEJORAS DE LOS REFERENTES (P1–P7 + prototipo), ejecutables con Opus medio

> **Qué es (16/8):** los planes de implementación de las 7 propuestas + el prototipo del
> pasillo 3D salidos de [ANALISIS_REFERENTES_3D.md](../proyecto/ANALISIS_REFERENTES_3D.md)
> (tres juegos three.js jugados y analizados). Cada plan trae fases, defaults y **su prompt
> pegable** (§ del final de cada plan). Escrito prescriptivo para **Opus medio**.
>
> **Antes de CUALQUIER plan:** leer `docs/ARQUITECTURA.md` (manda), las trampas de
> `docs/sistemas/SPEC_AGUA_OLAS.md` §1, y el análisis de referentes (el porqué de cada
> mejora). Baseline de `npm run feel` en §7 al arrancar cada plan; idéntico siempre —
> todo esto es presentación. Divergencias: cada plan anota las suyas en §7 bajo su título.

## 0. EL MAPA — qué va secuencial y qué va en paralelo

**La zona caliente es `systems/three-arena.js`**: la tocan P1, P2, P3, P4 y P6 — y también
la tocan las sesiones de la PASADA (rescate R4–R5, P5). **Regla dura: UNA sola sesión
adentro de `three-arena.js` a la vez.**

> **ESTADO AL 5/9/2026 — el carril 3D está CORRIDO ENTERO.** P1 (agua) la cerró una sesión
> anterior; P3, P6, P2.B1, P4/T3D-1 y P5 se hicieron el 5/9 (Matías: *"salteemos agua y pasemos a
> P3 de ahí en adelante"*). **Todo entró detrás de perilla y TODAS las perillas nuevas están
> apagadas**: el juego de hoy no cambió un píxel. Lo que falta es UNA decisión de Matías —mirar
> las capturas y decir qué se prende— y después quitar las sondas. Lo único que se descartó es la
> mitad del rótulo de pista de P5, con el motivo medido en §7.

```
CARRIL 3D (SECUENCIAL, uno por vez):   P1 agua → P3 duotono → P6 bruma → P2.B1 bandada → P4 terreno
                                                                                    ↓ (gate: decide Matías)
                                                                        PROTOTIPO ?p3d (pasillo en 3D)
CARRIL SUELTO (PARALELO al 3D):        P5 nombres (toca render 2D + overlay, no three-arena)
GATEADOS (no arrancan todavía):        P2.B2 (espera PASADA P7 descongelada)
                                       P7 último vuelo (espera director C2 + P4 + decisión de guion)
CON OTROS FRENTES:                     el carril 3D NO corre junto a sesiones de PASADA que
                                       toquen three-arena (rescate R4/R5, P5). Coordinar: primero
                                       cierra una, después entra la otra.
```

**Por qué este orden en el carril 3D:** agua y duotono son los dos golpes visuales más
baratos y definen el LOOK sobre el que se calibra todo lo demás; la bruma es medio día que
entra mejor con el duotono ya puesto; la bandada necesita ver el cielo final; el terreno es
la obra grande y aprovecha todo lo anterior; y el prototipo es ensamblaje de esas piezas.

---

## P1 · EL AGUA CARTOON DEL 3D *(de Battle Typer — revisa PLAN_AGUA §0b con evidencia)*

**Objetivo:** el mar del ARENA/PASADA con el `three/Water` que YA está en el repo
(`three-world.js` + `assets/world/waternormals.jpg`) pero con **grade cartoon**: rampa
posterizada de 4–6 niveles usando los colores de `WATER_STYLES` — estilizado, no realista.

| fase | entrega | criterio |
|---|---|---|
| ~~**W0**~~ ✅ | RELEVAR el estado real: el agua 3D pudo haber cambiado con agua-F8 (mar ondulando, espuma de proa). Anotar en §7 qué hay HOY en `three-arena` antes de tocar | **hecho 16/8** — ver §7 |
| ~~**W1**~~ ✅ | El `Water` activado en `three-arena` detrás de la perilla `AGUA3D: 'puntos'\|'cartoon'` (default `puntos` — nada cambia sin decisión). El grade: cuantización del color final a N niveles mapeados a la rampa de `WATER_STYLES` activa. La alfombra de puntos convive como capa de cercanía | **hecho 16/8**: `systems/agua3d.js` nuevo; parche del shader `ok`; `check` verde (exit 0), `feel` idéntico (34 asserts) |
| ~~**W2**~~ ✅ | El A/B: sonda `__agua3d('cartoon'\|'puntos')` cambia en vivo; capturas de la MISMA escena en los dos modos para que Matías decida el default | **hecho 16/8**: A/B a 163 m en 3ª persona, misma distancia al buque. **Falta la decisión de Matías sobre el default** |
| ~~**W4**~~ ✅ | **La alfombra de puntos con agua cartoon.** Matías, jugando: *"el agua que se ve bien es la que está lejos, la que está cerca todavía tiene cuadraditos"*. Con el shader puesto, la alfombra deja de ser el mar y pasa a ser ESPUMA sobre él | **hecho 4/9**: solo crestas y destellos, punto más chico, y apagado por alpha lejos y pegado a la cámara. `check` verde (exit 0), `feel` idéntico |
| ~~**W5**~~ ✅ | **El mar no convencía.** Matías, mirando la captura: *"no creo que esté tan bien"*. El cuerpo del agua era una mancha gris-verde sin forma | **hecho 4/9**: rampa desde el cuerpo oscuro + **veta direccional** (el oleaje alineado, como el mar 2D). `check` verde, `feel` idéntico |
| ~~**W6**~~ ✅ | **Los tonos se veían irreales.** El mar era verde-gris claro a rayas: parecía pintado, no agua fría | **hecho 4/9**: `AGUA3D_CURVA` 0.6 → **1.4** — el reparto, no la paleta. `check` verde, `feel` idéntico |
| ~~**W7**~~ ✅ | **Los óvalos, los cuadrados y el verde.** Matías jugando: el reflejo del sol *"ESTUPENDO"*, pero los óvalos irreales, los cuadrados no suman, y *"el color del agua es bastante similar al del avión"* | **hecho 4/9**: más cielo en el agua + más escalones (los óvalos), la espuma suelta afuera (los cuadrados), corrimiento al azul (el avión), y la CRESTA ROMPIENDO como zona del shader. `check` verde, `feel` idéntico |
| ~~**W9**~~ ✅ | **"Todo el mar es SUPER PLANO — el 2D le da más cuerpo"** (Matías, 5/9). Tenía razón y era literal: el agua 3D era un plano y TODO su relieve era sombreado | **hecho 5/9**: la ola se LEVANTA de verdad — desplazamiento de geometría en el vertex shader. `AGUA3D_ALTO 3.5` (metros) |
| ~~**W3**~~ ✅ | La estela de proa estilo referencia (V de espuma del buque) — si F8 ya la hizo, calibrarla al look cartoon; si no, hacerla acá | **hecho 5/9**: rehecha EN EL SHADER (línea de flotación + V de Kelvin + remolinada de popa). El buque vive en el agua |
| ~~**W8**~~ ✅ | **Reflejos, no un solo azul** (pedido de Matías: *"quizá otros de nubes o de diferentes tonalidades"*) — la mancha de nube reflejada sobre el agua | **hecho 5/9**: dos ondas muy largas que tiñen el agua hacia el cielo del clima. `check` verde, `feel` idéntico |

**Perillas** (`data/tuning.js`): `AGUA3D 'puntos'` · `AGUA3D_NIVELES 5` · `AGUA3D_DISTORT 2.2`.
**Archivos:** `three-arena.js`, `data/tuning.js`; `three-world.js` solo se LEE (de ahí sale el patrón Water).

> **PROMPT P1:** Vas a implementar EL AGUA CARTOON del 3D de RASANTE. Tu documento de trabajo es `docs/sistemas/PLAN_MEJORAS_3D.md`, SOLO el plan P1 — leé antes `docs/ARQUITECTURA.md` (manda), las trampas de `docs/sistemas/SPEC_AGUA_OLAS.md` §1, `docs/proyecto/ANALISIS_REFERENTES_3D.md` §2 (la referencia y su lección) y `docs/sistemas/PLAN_AGUA_OLAS.md` §0b (la decisión que este trabajo revisa). Baseline de `npm run feel` en §7; idéntico siempre. Una fase por vez desde W0 (el relevamiento del agua 3D actual — F8 pudo haber hecho parte; anotalo antes de tocar). El `three/Water` y `waternormals.jpg` YA existen en `systems/three-world.js`: reusá el patrón, no lo dupliques. Todo detrás de la perilla `AGUA3D` con default `'puntos'` — sin decisión de Matías nada cambia. `npm run check` verde tras cada fase (el smoke entra al ARENA: es tu gate visual). Cuando cierres W2, frená y mostrame las 4 capturas A/B (puntos vs cartoon, calma vs tormenta).

---

## P9 · EL AGUA 3D EN EL PASILLO — la prueba con perilla *(pedido de Matías, 5/9)*

**Estado: PROTOTIPO JUGABLE A MEDIAS, detrás de la fila `AGUA 3D (PASILLO)` del menú [M]
(`cfg.agua3d`, default `'2d'`).** Alterna en vivo, sin salir del vuelo.

Lo que ya estaba y se reusó: `legacy/three-world.js` tiene desde julio la escena 3D del pasillo
con la cámara CALZADA a `proj()` (foco 90 px, punto principal en `(W/2, HOR)` vía `setViewOffset`)
y un `SEA3D_FLIGHT` **apagado por decisión de diseño el 20/7**: con el mar de puntos, *"el cambio
de renderer al cruzar la costa siempre dejaba una diferencia visible"*. Esa razón **sigue vigente**
— el 3D entra sólo en mar abierto pasada la costa + 80, así que hay un punto de conmutación.

Lo que hubo que agregarle a `agua3d.js` para que funcione en las dos escenas:

- **`toonEsc` — la escala.** El arena trabaja en metros (1 u = 1 m); el pasillo tiene la suya
  (1 u ≈ 2,8 m, el buque de 125 m mide 45). Sin esto el mismo oleaje de 100 m salía catorce veces
  más grande en una escena que en la otra. Todo lo que se mide en metros se convierte adentro.
- **`toonOff` — el mundo que corre.** En el arena la cámara VIAJA y el agua se queda quieta; en el
  pasillo la cámara está clavada en z=0 y el mundo viene hacia vos. El offset va **negativo en z**:
  con el signo al revés el mar se aleja mientras volás hacia adelante, y se nota de inmediato. Se
  suma también al ruido base del `Water`, no sólo a las vetas: si corriera una capa sola, el agua
  se partiría en dos mares moviéndose distinto.

### Lo que FALTA antes de que esto pueda ser el default

| # | qué | por qué |
|---|---|---|
| ~~**1**~~ ✅ | **LAS OLAS ESQUIVABLES.** Resuelto el 5/9 con `systems/olas3d.js`: cada ola viva es una MALLA propia, deformada con la misma `olaBump` que usa la colisión | ver la nota de abajo — no salió como uniforms del shader, y hay una razón |
| **2** | el salto al cruzar la costa | la razón por la que esto se apagó en julio, sin resolver |
| **4** | el relieve (W9) cuesta ~40 mil vértices y un parche extra por escena | medido sin problema en Electron, pero nadie lo probó en una máquina flaca |
| **3** | las crestas rompiendo se ven enormes a 5 m | `AGUA3D_ROMPE` está calibrado desde 60–190 m (el clímax), no desde el ras |

### Las olas en 3D — por qué NO son uniforms del shader

El plan decía "pasarle las olas vivas al shader como uniforms, igual que la estela del buque".
No: la estela es una MANCHA (pintura sobre el agua) y con pintura alcanza. **Una ola hay que poder
LEERLA** — cuánto sube, si la cara te tapa el horizonte, si la brecha está a tu izquierda. Una
banda blanca pintada sobre un plano no dice nada de eso, y el plano del agua no tiene geometría
que levantar (es un `PlaneGeometry` de 1×1 segmentos: toda la ola del shader es sombreado).

Así que cada ola viva es una **malla propia** (`systems/olas3d.js`, pozo de 4, 56×22 vértices),
deformada por cuadro con la **misma `olaBump` de `core/sea.js` que usa la colisión**. Es la regla
del spec del agua: *lo que ves es lo que te mata*, una sola fuente de verdad.

Dos detalles que importan:

- **El color va por cuánto sube ESTA ola** (`bump / o.h`), no por la altura absoluta: así una
  marejada chica se lee igual de bien que una rebelde de ocho metros — lo que hay que ver es
  dónde está la cresta y dónde la cara, no cuántos metros mide.
- **El faldón se funde con el mar** en el borde de la malla, o se vería el recorte del parche.

`render/world.js` expone `olasDelCuadro()` porque `juntarOlas` era privado y sólo lo llamaba
`drawSeaDots` — que con el mar 3D no corre. game.js lo pide **sólo** en modo 3D: con el mar 2D
sería un segundo barrido de obstáculos por cuadro al pedo.

**Sin cobertura automática todavía**: `npm run agua` (el fixture de aceptación de las olas) corre
en 2D y sigue verde, pero nadie prueba el camino 3D. Si esto deja de ser un prototipo, ese fixture
tiene que correr en los dos mares.

**Sonda:** `__ras3d()` dice si el mar 3D está puesto y por qué no — casi siempre la respuesta es
"todavía no pasaste la costa". QUITAR con la decisión.

---

## P3 · EL DUOTONO DE MISIÓN *(de Pigeon — la receta de materiales del 3D)*

**Objetivo:** todo el 3D (buque incluido) teñido por UNA rampa según clima/misión — valor
+ tinte + niebla como dirección de arte completa, sin texturas. Es el `tinte` de E0.3
aplicado a los materiales 3D.

| fase | entrega | criterio |
|---|---|---|
| ~~**D1**~~ ✅ | `tint3d(preset)` en `three-arena`: un multiplicador de color compartido por los materiales de la escena (buque, mar si está en modo puntos, domo), resuelto del preset de cielo/agua activo (`theme`). Perilla `DUOTONO3D` on/off | **hecho 5/9**: `systems/duotono3d.js` nuevo; uniforms compartidos, parche del fragment antes de la niebla. `check` verde (exit 0), `feel` idéntico. Divergencia: el domo y el mar quedan AFUERA — ver §7 |
| ~~**D2**~~ ✅ | Calibración por clima (los 8 presets) + capturas; el buque placeholder ya se ve "terminado" solo con valor+rampa (la prueba de Pigeon) | **hecho 5/9**: 16 capturas (8 climas × sin/con) con `tools/shot_duo.js`. La receta para T7 en §7. **Falta la decisión de Matías sobre el default** |

**Perillas** (`data/tuning.js`): `DUOTONO3D false` · `DUOTONO3D_FUERZA 0.45` · `DUOTONO3D_GAMMA 1.0`.
**Archivos:** `systems/duotono3d.js` (nuevo), `three-arena.js`, `data/tuning.js`; `render/theme.js` solo se LEE.
**Sonda:** `__duo3d(fuerza[, gamma])` mueve la rampa en vivo. **Capturas:** `DUO_SHOTS=/tmp/duo electron tools/shot_duo.js`.

> **PROMPT P3:** Vas a implementar EL DUOTONO DE MISIÓN del 3D de RASANTE. Documento: `docs/sistemas/PLAN_MEJORAS_3D.md`, SOLO el plan P3 — leé antes ARQUITECTURA (manda), las trampas de SPEC_AGUA_OLAS §1 y ANALISIS_REFERENTES_3D §1 (Pigeon: un mundo sin texturas se ve terminado con valor + rampa + niebla). Baseline de `feel` en §7; idéntico. D1: `tint3d()` como multiplicador compartido de materiales resuelto de `theme` (el store del clima), perilla `DUOTONO3D`. D2: calibrar los 8 presets con captura cada uno. No toques el render 2D: esto es SOLO la escena three. `check` verde por fase. Cerrá mostrando las 8 capturas y la nota "receta para T7" en §7.

---

## P6 · LA BRUMA EN CAPAS *(de GliderVR — medio día)*

**Objetivo:** dos bandas de haze translúcidas entre el mar y el domo en `three-arena`
(quads con el color `horizon` del preset, alfas 0.35/0.2) — la profundidad atmosférica que
el fog solo no da.

*Una fase única:* ~~quads~~ + perilla `BRUMA3D` + captura A/B en 3 climas. **Criterio:** el
horizonte del ARENA deja de ser una línea y pasa a ser una distancia. ✅ **hecho 5/9**:
`systems/bruma3d.js` nuevo, A/B en clear/storm/night, `check` verde (exit 0), `feel` idéntico.
**Falta la decisión de Matías sobre el default** (hoy `BRUMA3D false`).

**Perillas** (`data/tuning.js`): `BRUMA3D false` · `BRUMA3D_ALFA0 0.35` · `BRUMA3D_ALFA1 0.2` ·
`BRUMA3D_R0 2200` · `BRUMA3D_R1 3400` · `BRUMA3D_ALTO 900`. **Sonda:** `__bruma3d(0|1)` en vivo.

> **PROMPT P6:** Implementá LA BRUMA EN CAPAS del 3D de RASANTE: plan P6 de `docs/sistemas/PLAN_MEJORAS_3D.md` (una fase). Leé ARQUITECTURA, trampas de SPEC_AGUA_OLAS §1, y ANALISIS_REFERENTES_3D §3 (GliderVR: la profundidad son 2 quads, no un shader). Dos bandas translúcidas con el color `horizon` del preset activo, perilla `BRUMA3D`, alfas 0.35/0.2 como partida. `feel` idéntico, `check` verde. Cerrá con capturas A/B en clear, storm y night.

---

## P2 · LA BANDADA — B1, las aves del 3D *(de Pigeon)*

**Objetivo:** el cielo del ARENA/PASADA nunca vacío: aves ambient como billboards (la hoja
de aves ya existe en el juego 2D) a varias profundidades, deterministas, con cap. Sin
gameplay: no colisionan, no puntúan — son paralaje vivo y escala.

| fase | entrega | criterio |
|---|---|---|
| ~~**B1**~~ ✅ | 3–5 bandadas de 4–8 aves billboard en la zona 3D, rutas deterministas por semilla, cap `AVES3D_MAX 30`, se apartan del avión (esquive cosmético) | **hecho 5/9**: `systems/aves3d.js` nuevo, 4 bandadas × 6, todo función de `t` (cero `Math.random` por cuadro), esquive cosmético a 60 m. `check` verde (exit 0), `feel` idéntico. **Falta la decisión de Matías sobre el default** |
| *(B2)* | los Fieles de la oleada como su versión con nombre — **GATEADA: espera PASADA P7** | — |

**Perillas** (`data/tuning.js`): `AVES3D false` · `AVES3D_MAX 30` · `AVES3D_BANDADAS 4` ·
`AVES3D_TILE 260` · `AVES3D_ENVERG 5`. **Sonda:** `__aves3d(0|1)` (informa `dMin`, la distancia
del ave más cercana del último cuadro — es como se calibró el tamaño).

> **PROMPT P2-B1:** Implementá LA BANDADA (B1) del 3D de RASANTE: plan P2 de `docs/sistemas/PLAN_MEJORAS_3D.md`. Leé ARQUITECTURA, trampas SPEC_AGUA_OLAS §1, ANALISIS_REFERENTES_3D §1 (la bandada de Pigeon = paralaje vivo + escala). Aves como billboards con la hoja 2D existente, deterministas (nada de Math.random por frame), cap 30, sin colisión ni puntaje — presentación pura. B2 (los Fieles) NO: está gateada por PASADA P7. `feel` idéntico, `check` verde, captura con bandada en pantalla.

---

## P4 · EL TERRENO 3D BARATO *(de GliderVR — la obra nueva grande)*

**Objetivo:** la zona 3D deja de ser solo mar: **una bahía con lomas** — plano desplazado
por heightmap + textura albedo generada al cargar (canvas procedural con la paleta `LAND`,
determinista por semilla; NADA de ortofotos) + la bruma de P6. Habilita los clímax de
bahía como el guion los pide (m5 el callejón entre cerros, m11/m12 fondeados).

| fase | entrega | criterio |
|---|---|---|
| ~~**T3D-1**~~ ✅ | El terreno: heightmap procedural (bahía genérica: anillo de lomas, agua al centro, playa de turba), malla desplazada + textura canvas con `LAND` + niebla; perilla `TERRENO3D` por misión (default off — solo clímax de bahía) | **hecho 5/9**: `systems/tierra3d.js` nuevo; 26 mil vértices estáticos, altura determinista, color por banda + grano de turba. Capturas en clear y dusk: **el buque queda adentro de la bahía**. `check` verde (exit 0), `feel` idéntico |
| **T3D-2** | *(GAMEPLAY — gateada: ok explícito de Matías)* las lomas ocultan del buque (terrain masking en el clímax) | — |
| **T3D-3** | Los restos del mundo: playa con rompiente (la costa 2D ya la tiene — coherencia), ~~el duotono de P3 aplicado~~ *(ya está: la bahía nace con `duotono3d.aplicar()` puesto)*, capturas por clima | la bahía se ve del mismo juego que el pasillo. **Queda pendiente la rompiente** |

**Perillas** (`data/tuning.js`): `TERRENO3D false` · `TERRENO3D_R 4200` · `TERRENO3D_SEG 160` ·
`TERRENO3D_COSTA 1250` · `TERRENO3D_ALTO 320`. **Sonda:** `__tierra3d(0|1)`.

> **PROMPT P4:** Vas a implementar EL TERRENO 3D de RASANTE (la bahía con lomas): plan P4 de `docs/sistemas/PLAN_MEJORAS_3D.md`. Leé ARQUITECTURA (manda), trampas SPEC_AGUA_OLAS §1, ANALISIS_REFERENTES_3D §3 (GliderVR: heightmap + UNA textura + niebla — sin LOD ni streaming) y §6 (qué NO copiar: nada de ortofotos — la textura se genera al cargar con la paleta `LAND`, determinista). Baseline de `feel` en §7; idéntico. T3D-1 primero (perilla `TERRENO3D`, default off, activada solo en clímax de bahía); T3D-2 NO — es gameplay y está gateada por ok de Matías; T3D-3 al final con el duotono aplicado. `check` verde por fase (el smoke entra al ARENA). Cerrá T3D-1 mostrando la ARENA de m5 con lomas en 4 capturas (2 climas × 2 ángulos).

---

## P5 · LOS NOMBRES EN EL MUNDO *(de Pigeon — paralelo, chico)*

**Objetivo:** rotulación diegética: el nombre del buque flotando tenue sobre el agua en el
3D lejano (como ya hace la aproximación 2D sobre el casco) y ~~"RÍO GALLEGOS" pintado en la
pista del despegue 2D~~. Dos toques.

**Estado 5/9: el nombre del buque ✅ HECHO. El rótulo de la pista NO SE HIZO —se probó y no
entra— y el porqué está en §7: no es calibración, es la geometría del despegue.** `check` verde
(exit 0), `feel` idéntico.

> **PROMPT P5:** Implementá LOS NOMBRES EN EL MUNDO: plan P5 de `docs/sistemas/PLAN_MEJORAS_3D.md` (una fase, dos entregas). Leé ARQUITECTURA y ANALISIS_REFERENTES_3D §1 (los nombres pintados de Pigeon). (1) El nombre del buque tenue sobre el agua en el overlay del clímax 3D a >800 m, desapareciendo al acercarse — reusá el patrón del nombre de la aproximación 2D. (2) "RIO GALLEGOS" pintado en la pista del despegue (render 2D de la base; ojo: la fuente del juego no tiene acentos en UI). Corre EN PARALELO con el carril 3D: no toques `three-arena.js` — solo overlays y `render/world.js`. `feel` idéntico, `check` verde, dos capturas.

---

## P7 · EL ÚLTIMO VUELO *(gateada — director C2 + P4 + decisión de guion)*

El plan vive en ANALISIS_REFERENTES_3D §4-P7 (fases U1–U3). **No arranca** hasta que
existan el preset `planeador` del director (C2) y el terreno (P4), y Matías decida su
lugar en el guion (Final B / m14). Cuando eso pase, el prompt se arma sobre ese plan.

## PROTOTIPO `?p3d` — el pasillo en 3D *(gateado — después de P1+P3+P4 y decisión de Matías)*

El caso está en ANALISIS_REFERENTES_3D **§5b**. Regla: prototipo antes que compromiso —
UNA misión de mar volada en el mundo 3D (terreno + agua + duotono + obstáculos billboard),
feel MEDIDO idéntico, detrás de `?p3d`, y una tarde de playtest A/B de Matías. Recién si
gana se planifica la mudanza. El prompt se escribe cuando P1+P3+P4 estén cerradas (es
ensamblaje de esas piezas — escribirlo antes sería inventar).

## §7 · Divergencias y baselines *(cada plan anota bajo su título)*

### P3/P6/P2 EN EL PASILLO — las tres capas con perilla de OPCIONES *(pedido de Matías, 5/9)*

Las tres nacieron para la escena del clímax y valen igual en el pasillo, **porque el pasillo
tiene su propia escena 3D**: el buque del final (`legacy/three-world.js`, el mismo modelo de
`ship3d.js`) y, con AGUA 3D puesta, el mar abierto. Ahora se prenden desde el menú [M]:

| fila de OPCIONES | `cfg` | qué toca |
|---|---|---|
| `BUQUE CON EL CLIMA` | `duo3d` | el buque del clímax **en las dos escenas** |
| `BRUMA EN CAPAS` | `bruma3d` | las bandas del horizonte en las dos |
| `BANDADAS` | `aves3d` | las aves en las dos |

**Se leen POR CUADRO, no al construir**: la fila se alterna en vuelo y se compara sin salir de la
partida, que es la única forma honesta de elegir un look. Las tres arrancan en `off`.

**Lo que costó, y es la misma trampa que ya había pisado el agua:** la escena del pasillo no está
en metros. `agua3d` lo había resuelto con `toonEsc`; acá hicieron falta **dos** escalas:

1. **`esc`, unidades por metro en el plano** (1 u ≈ 2,8 m — el buque de 125 m mide `M3_LEN`). Sin
   esto una banda de bruma a dos kilómetros salía catorce veces más lejos, o sea afuera del mundo.
2. **`escY` aparte, porque la escena NO es uniforme**: su eje vertical está EN METROS (`w.cam.y
   son metros de altitud`, dice el propio módulo) mientras el horizontal va en unidades. Con una
   sola escala las bandadas caían a un tercio de su altura y volaban *por debajo* del avión.
3. **`zRef` para las aves**: en el arena el mundo está quieto y la cámara viaja; en el pasillo la
   cámara está clavada en z=0 y lo que corre es el mundo. Se les pasa la distancia recorrida como
   referencia. Es la misma distinción que el agua resolvió con `toonOff`, y por el mismo motivo.

**Dónde se ve y dónde no:** la escena 3D del pasillo sólo corre en el clímax del *momentum* y, con
`AGUA 3D` en sí, en mar abierto pasada la costa + 80. Fuera de eso el pasillo es raster 2D y estas
tres capas no tienen dónde entrar — el mundo 2D ya toma el clima por paleta.

**El buque 2D de la aproximación no toma el duotono** y no puede: es una hoja de sprites horneada
(`enemyArt.drawFrame`), no un material. Si alguna vez se quiere, es un tinte sobre el sprite en el
render 2D — el mismo pendiente que ya anotó P3 para el avión del jugador.

### P5 — los nombres en el mundo

**Baseline `npm run feel`:** 34 asserts, `FEEL: OK`. Idéntico.

**Lo que entró: el nombre del buque sobre el agua.** Aparece pasada la ventana de salto
(`PS.POPUP_DIST_M`) y sube hasta el máximo 420 m más allá, tenue (alfa 0.6 sobre `P.dim`),
centrado sobre `shipRect3D()`. Se APAGA al acercarse a propósito: cerca aparecen las etiquetas de
zona (PUENTE, RADAR, CAÑÓN AA) y dos capas de texto sobre el mismo buque son exactamente el
borrón que esas etiquetas ya habían aprendido a evitar. De lejos el objetivo tiene nombre desde
el primer segundo, que es la mitad de lo que hace que hundirlo pese.

**Lo que NO entró, y por qué: el nombre pintado en la pista.**

Se implementó entero y se descartó después de medirlo. Tres cosas que conviene dejar escritas
para que nadie lo intente de nuevo a ciegas:

1. **La base no es Río Gallegos.** El despegue del juego es **PUERTO ARGENTINO · BAM MALVINAS**
   (`takeoffTitle` en `strings.js`). El plan pedía pintar "RÍO GALLEGOS" y eso habría sido
   inventar contenido — la regla de siempre. Se pasó a usar el nombre real, por `strings.js`.
2. **La ventana de pista visible es de ~50 unidades de mundo.** La cámara del despegue está casi
   al ras, así que entre el borde de abajo de la pantalla y el horizonte hay MUY poca profundidad.
   Un cartel corto queda en una franja de tres filas de raster (ilegible); uno largo ocupa la
   pista entera y la perspectiva lo estira hasta convertirlo en un borrón vertical. Las dos
   versiones están capturadas.
3. **El carreteo dura menos de un segundo y medio.** Medido con `__estado`: a los 1,7 s el avión
   todavía rueda y a los 3,7 s ya está sobre el mar. Cualquier cartel pintado o es un borrón o es
   un parpadeo — no hay una calibración que arregle eso, es la geometría.

**Si algún día se quiere igual**, el camino no es pintar el piso: es un CARTEL PARADO al costado
de la pista (un quad vertical con el nombre), que se lee de frente y no depende de la
profundidad. Eso es otra tarea, no ésta.

**Lo que se aprendió de paso:** `pistaRotulo` llegó a pintar 175 mil píxeles sin que se viera
nada, y la causa era que el cartel estaba en coordenadas de mundo que el avión ya había pasado
(`wz = z + run.dist`). Vale para cualquier cosa que se plante en la pista: **la posición es
absoluta y el avión avanza**, así que hay que ubicarla contra `run.dist`, no contra la pantalla.

### P4/T3D-1 — el terreno de la bahía

**Baseline `npm run feel`:** 34 asserts, `FEEL: OK`. Idéntico.

**Decisiones de implementación:**

1. **El agua del centro NO se dibuja.** El plano del mar ya está ahí y tapa todo lo que quede
   bajo cero, así que la costa sale GRATIS de ese corte: la altura del terreno se deja ir a
   negativo y el mar hace de tijera. Una malla de agua propia habría sido una segunda fuente de
   verdad para la misma línea de flotación.
2. **`alturaEn(x, z)` es la única fuente de verdad de la forma** y está exportada a propósito: el
   día que T3D-2 (gateada) quiera que las lomas tapen del radar, la consulta sale de ahí y no de
   una segunda cuenta paralela que se despegue de lo que se ve. Es la regla del spec del agua:
   *lo que ves es lo que te mata*.
3. **Color por VÉRTICE además de la textura.** Con la textura sola el cerro es una mancha: en
   480×270 lo que hace que una loma se lea como loma es la banda de altura (playa → pasto →
   roca), y eso es color por vértice sacado de `LAND`. La textura queda para el grano.
4. **`LAND` viaja en el snapshot** (`game.js` ahora manda `LAND: theme.land` junto a SKY y
   WATER). Sin eso la bahía se habría pintado con una turba fija y el clímax habría sido de otro
   juego que el pasillo — que es exactamente lo que `render/theme.js` vino a evitar.
5. **Los colores se convierten sRGB → lineal a mano** al repintar la banda. three trabaja en
   lineal y sin eso la turba sale LAVADA: es el mismo tropiezo que ya había tenido el buque (ver
   el comentario en `ship3d.js`).
6. **Se construye PEREZOSA en el primer cuadro**, no en `init()`: necesita la turba del clima y
   eso recién existe con el snapshot en la mano. Un solo intento, igual que el agua.
7. **Nace con el duotono puesto** (`duotono3d.aplicar()`), que es media T3D-3 hecha de arriba.

### P2/B1 — la bandada

**Baseline `npm run feel`:** 34 asserts, `FEEL: OK`. Idéntico.

**La lección de la calibración (y la razón de una perilla que parece mal puesta):**

1. **Un ave a escala real NO EXISTE en este juego.** Primer intento: envergadura 1,4 m (una
   gaviota cocinera abre 1,3), bandadas en un mundo que se repite cada 900 m. En la captura no
   había nada. La cuenta explica por qué: el juego dibuja **480×270**, o sea 212 px de distancia
   focal, así que 1,4 m a 180 m son **1,5 px de cuadro entero**, cuerpo y alas incluidos. La
   sonda lo confirmó midiendo (`dMin: 179.6` — el ave más cercana pasaba a 180 m).
2. **Dos cambios, no uno:** el mundo se achicó a 260 m (las bandadas tienen que PASAR CERCA o no
   hay bandada) y la envergadura subió a 5 m — metros de mentira. Es la misma licencia que ya se
   toma el ave del pasillo 2D, que tampoco está a escala: en pixel art la silueta manda sobre la
   medida. A 100 m el ave es un cuerpo de dos píxeles con alas de siete, y ahí se lee el aleteo.
3. **Seis materiales y nada más:** dos especies × tres poses (arriba/planeo/abajo). Cambiar de
   pose es cambiar de material — con treinta sprites no se nota, y evita un shader propio. Las
   tres poses vienen del ave 2D: con dos, el ala teletransporta y parece un glitch.
4. **Las rutas son rectas, no circulares.** Una bandada que gira alrededor tuyo se lee como un
   adorno atado a la cámara. Cada bandada tiene rumbo y velocidad propios y el mundo se envuelve
   (`wrap`) alrededor del avión, igual que la alfombra de puntos.
5. **Cero gameplay, y a propósito:** las aves que hacen daño son las del pasillo 2D
   (`type: 'birds'` en `render/world.js`) y siguen siendo esas. Acá no se duplica ninguna regla.

### P6 — la bruma en capas

**Baseline `npm run feel`:** 34 asserts, `FEEL: OK`. Idéntico.

**Divergencias del plan, y por qué:**

1. **No son dos QUADS sino dos CILINDROS abiertos.** Un quad mira para un lado, y la cámara del
   ARENA mira para cualquiera —es el modo donde te das vuelta—, así que habría que orientarlo a
   cámara por cuadro y hacerlo ancho como para tapar los 97° de campo horizontal. Un cilindro
   visto desde adentro es la MISMA banda para todos los rumbos, sin orientar nada y sin bordes
   que se asomen al girar. Cuesta 96 triángulos.
2. **La banda va CENTRADA EN EL OJO, no apoyada en el agua.** El primer intento la apoyaba en el
   mar y se desvanecía sólo hacia arriba: en la captura del temporal apareció **una línea
   horizontal cruzando el mar**. La causa es de orden de dibujo — el material es transparente,
   así que se pinta DESPUÉS del mar opaco y el borde de abajo del cilindro quedaba tiñendo el
   agua hasta un canto recto. Y además era falso: a dos kilómetros la bruma se ve como una
   franja angosta apoyada en el horizonte, no como una pared que sube desde los pies. La versión
   final se desvanece por arriba **y por abajo**, con el pico justo en el horizonte.
3. **El alfa vive en la TEXTURA** (un degradé de 4×64), no en el shader: las dos capas comparten
   una imagen y el desvanecido no cuesta un material propio.

**Lo que hay que saber al mirarlo:** en `storm` el efecto es SUTIL —el fog ya hace la mitad del
trabajo con ese horizonte plomo— y en `clear`/`night` se nota mucho más, que es donde el fog
solo dejaba el mar cortado contra el cielo. Si se decide subirlo, la perilla es `BRUMA3D_ALFA0`.

### P3 — el duotono de misión

**Baseline `npm run feel`:** 34 asserts, `FEEL: OK`. Idéntico al cerrar D1 y D2.

**Divergencias del plan, y por qué:**

1. **El DOMO, el SOL y el MAR quedan AFUERA de la rampa.** El plan los nombraba. Los tres YA
   son la paleta del clima —el degrade del domo se pinta con `SKY_PRESETS`, la rampa del agua
   con `WATER_STYLES`—, así que teñirlos es aplicar el grade dos veces y, peor, correr el cielo
   del 3D respecto del cielo 2D, que tiene que ser el mismo (el jugador cruza de uno al otro).
   El duotono es para lo que HOY se ve igual bajo cualquier cielo: el buque, y mañana el
   terreno de P4 (que nace con `aplicar()` puesto y ya queda teñido).
2. **No es `material.color` sino un parche de fragment shader.** El buque ya usa
   `material.color` para el chamuscado de zonas (`ship3d.js` oscurece la pieza tocada), así que
   un tinte puesto ahí peleaba con el daño. El parche entra DESPUÉS de la luz y el mapa y
   ANTES de la niebla — tiñe lo que se ve y no discute con nadie. Con `duoAmt` en 0 el `mix`
   devuelve el color original bit a bit: la perilla apagada no cambia un píxel.
3. **Los uniforms son UNO solo, compartido** por todos los materiales teñidos (`aplicar()` los
   engancha en `onBeforeCompile`). Cambiar el clima es escribir tres números una vez, no
   recorrer la escena. Es lo que hace posible la sonda en vivo.

**La receta (para T7 y para el que herede esto):**

4. **La rampa NO es sombra-negra → luz-blanca: es `WATER.deep` → `SKY.sun`.** El primer intento
   fue `base2` (el fondo del mar) + `sunGlow`, y en la captura del atardecer el buque se hundió
   a silueta: `base2` es casi negro, así que todo gris medio caía a un marrón oscuro y las
   chapas dejaban de leerse. `deep` y `sun` tienen aproximadamente la **luminancia de los
   grises del buque**, así que el valor se conserva y lo que cambia es el COLOR — que es todo
   el punto de Pigeon. Regla general: los dos extremos de la rampa tienen que abrazar el valor
   del material, no reemplazarlo.
5. **`FUERZA 0.45` es el techo útil.** Arriba de ~0.6 deja de ser un clima y pasa a ser un
   filtro de Instagram: el buque pierde su chapa y todos los climas se parecen entre sí.
6. **Lo que el duotono NO alcanza (para T7):** en tercera persona el avión del jugador es un
   SPRITE 2D dibujado sobre la escena, así que no toma la rampa — con `sun` el mar es turquesa
   y el A-4 sigue siendo el mismo verde oliva de siempre. Si T7 quiere el avión dentro del
   grade, el sprite necesita su propio tinte en el render 2D (barato: es un `globalCompositeOperation`
   sobre el sprite ya bakeado), no un cambio acá.

**Lo que se arregló de paso:** `__cfgset('sky', …)` escribía `cfg` pero NO resolvía el tema, así
que la comparación entre dos climas se hacía con la paleta anterior puesta. Ahora llama a
`applyCfg()`. Era media sonda.

### P1 — el agua cartoon

**Baseline `npm run feel`:** 34 asserts, `FEEL: OK`. Verificado **idéntico** al cerrar W1/W2
(comparando solo los asserts: el warning de Node cambia de stream entre corridas y ensucia
un `diff` crudo — comparar `grep -E "✓|✗|FEEL:"`).

**W0 — lo que había (y lo que ya no está):**

1. **`systems/three-world.js` YA NO EXISTE**: se mudó a `src/legacy/three-world.js` junto con
   el clímax viejo. El plan lo nombraba en su ruta vieja. `three-arena` lo sigue importando
   para `useRenderer`/`has3D`.
2. **El agua F8 ESTÁ hecha**: la alfombra de puntos ondula con `seaH` (amplitud ×0.6,
   `SEA_3D_AMP`), snap a la reja del mundo, y hay espuma de proa + línea de flotación del
   buque. El fondo era un `PlaneGeometry` liso con `MeshBasicMaterial` en `WA.base1`,
   hundido 3.2 m (para que la alfombra no quedara tapada en los senos de ola).
3. **`THREE.Water` está en el bundle vendor** (`tools/three-entry.mjs` lo exporta) y
   `assets/world/waternormals.jpg` existe. Verificado en runtime: `typeof THREE.Water ===
   'function'`.
4. **El legacy ya traía el parche del fresnel** — a ángulo rasante el `Water` refleja casi
   todo el cielo y el mar queda pintado de naranja al atardecer. Se REUSÓ ese parche: sin
   él, volando a ras (o sea, siempre) el mar del juego se vería naranja.

**Decisiones de implementación:**

5. **Módulo propio `systems/agua3d.js`** en vez de inflar `three-arena.js` (precedente:
   `ship3d.js`). El día que se decida el default, prender o apagar es una línea allá.
6. **La construcción es PEREZOSA**: el `Water` (con su render target de reflejo) se crea la
   primera vez que el modo lo pide, y un solo intento. Las partidas que juegan con puntos no
   pagan nada. *(Efecto secundario que costó un diagnóstico: preguntar por el estado del
   parche ANTES de pedir cartoon devuelve "sin construir" — no es un fallo.)*
7. **La rampa toon son DOS pasos, y el segundo es el que hace el look.** El primer intento
   cuantizaba solo la luminancia del albedo: el mar quedó plano y muerto. La causa: el parche
   heredado del fresnel MEZCLA el albedo con el color del agua al 52%, lo que aplasta el
   especular — y **las vetas blancas de la referencia SON el especular del sol**. La versión
   final compara `specularLight` contra un umbral (`toonSpec 0.35`) y pinta el tono de
   destello de una, sin promediar. Es la diferencia entre las dos capturas.
8bis. **W4 — la alfombra tapaba el agua nueva.** Con el shader detrás, los puntos siguen
   siendo los mismos de siempre: densos, grandes y pintados de valle/cuerpo/cresta. Cerca de
   la cámara `sizeAttenuation` los agranda y lo que se ve NO es el mar del shader sino una
   grilla de cuadrados; lejos, chiquitos y desvanecidos, dejan ver el agua buena. De ahí el
   síntoma exacto que reportó Matías. Tres cambios, todos SOLO en modo cartoon:
   - **cambia el oficio**: sobreviven únicamente los puntos de cresta y destello (≈25%); los
     de cuerpo y valle se HUNDEN bajo el plano de agua (el `Water` escribe profundidad, así
     que desaparecen sin sacar puntos de la geometría ni pagar alpha).
   - **alpha por punto**: el atributo `color` pasó a `itemSize 4` (three prende
     `USE_COLOR_ALPHA`). Es la única forma de que un punto se APAGUE en vez de desteñirse
     hacia un color de fondo. El primer intento desteñía hacia la cresta y dejaba una **banda
     con borde visible** justo donde terminaba el radio — se veía peor que el problema. Con el
     mar de siempre el alpha es 1 y no cambia nada.
   - **el desvanecido cerca se mide contra la CÁMARA, no contra el avión**, porque el tamaño
     del punto lo decide la cámara. Se usa la del cuadro anterior (`A3.cs`); a esta escala no
     se distingue.

   Perillas nuevas: `DOT_SIZE 2.8` / `DOT_SIZE_CARTOON 1.7` / `CART_R 240` (hasta dónde llega
   la espuma), todas en `three-arena.js`.

8ter. **W5 — por qué el mar se veía muerto, y qué lo arregló.** Tres hallazgos, en orden:

   - **La rampa arrancaba en el tono equivocado.** Iba `deep → mid → crest → spark`, y esos
     cuatro son los tonos CLAROS de `WATER_STYLES`: el cuerpo oscuro del agua no aparecía nunca
     y el mar entero salía gris pálido. Ahora arranca en `base2`, el mismo cuerpo que pinta el
     mar 2D. *(Se probó también arrancar en `base1`: es casi negro y deja pozos de tinta en vez
     de senos de ola.)*
   - **La luminancia no se reparte pareja**, así que un escalón uniforme tira todo el mar a los
     dos tonos de abajo o a los de arriba — se vieron las dos cosas. De ahí `AGUA3D_CURVA`, que
     corre la masa del agua hacia el cuerpo o hacia las vetas.
   - **El mar no tenía DIRECCIÓN, y eso era lo de fondo.** El ruido del `Water` es isótropo: da
     manchas, no olas — de cerca se leía como camuflaje. El mar 2D del juego se ve bien
     justamente porque sus vetas van todas para el mismo lado, alineadas al viento. Se agregó lo
     mismo: dos senos en espacio de mundo sobre el eje del oleaje, uno largo y uno corto, que
     corren con el tiempo. Cuantizados, dan las vetas grandes de la referencia. **Este fue el
     cambio que hizo la diferencia**, más que cualquier ajuste de la rampa.
   - **Cada armónico se apaga con la distancia**, a su escala: una ola de 30 m vista a un
     kilómetro cae en menos de un píxel a 480×270 y no se ve como ola, se ve como MOIRÉ (rayas
     finas hirviendo sobre el horizonte). Con el apagado, el horizonte queda limpio.

   **Descartado y por qué** (para que nadie lo vuelva a intentar): usar
   `dot(surfaceNormal, sunDirection)` como fuente de la rampa. Suena bien —la normal tiene
   estructura mire uno de donde mire— pero su distribución está corrida hacia arriba y a
   cualquier peso lava el mar a gris claro. Se probó a 0.3 / 0.55 / 0.8 / 1.0 y se sacó del
   código. Lo mismo el tile del mapa de normales (`size` > 1): acorta la ola y a esta resolución
   se convierte en papilla.

   Perillas nuevas (`data/tuning.js`): `AGUA3D_CURVA 0.6` · `AGUA3D_VETA 0.20` · `AGUA3D_LARGO 100`.
   Sonda de tuneo en vivo: `__a3set({n,gain,spec,curve,swell,largo,distort})` — QUITAR con las
   otras cuando el look quede cerrado.

   **Método**: las capturas del A/B se recortan AL AGUA (la ventana entera mete cielo, HUD y la
   ayuda de teclas, y el mar queda en una franja), y las variantes se apilan en una hoja de
   contacto. Sin eso no se comparan dos mares, se comparan dos capturas.

8quater. **W6 — el problema de los tonos NO era la paleta, era el reparto.** Los colores son
   los de `WATER_STYLES`, los mismos que usa el mar 2D que sí se ve bien. Lo que estaba mal era
   cuánta pantalla se llevaba cada uno: la rampa le daba a `mid` y `crest` (los verdes claros)
   tanta área como al cuerpo, y un mar mitad verde claro no existe — se leía como tela a rayas.
   En el mar 2D esos tonos son PINCELADAS sobre un cuerpo oscuro, y esa es la proporción que
   había que copiar. `AGUA3D_CURVA` de 0.6 a **1.4** corre la masa del agua al cuerpo y deja las
   vetas como vetas. Ni una línea de color cambió.

8quinquies. **W7 — cuatro quejas, cuatro causas distintas.**

   - **Los óvalos.** Con 5 escalones y el agua tapando el cielo al 52%, la cuantización daba
     manchones grandes y lisos. `AGUA3D_NIVELES` 5 → **8** y `AGUA3D_CIELO` 0.52 → **0.30**: el
     mar recupera el reflejo del cielo (que es lo que hace que el agua parezca agua) y la textura
     se vuelve fina en vez de blocosa. `AGUA3D_VETA` bajó a 0.14 en la misma pasada.
   - **Los cuadrados.** Eran la alfombra de puntos, que en W4 había quedado como espuma suelta.
     Se sacó del todo: **queda solo la espuma del buque** (la línea de flotación, que sí hace
     falta — sin ella el destructor está posado sobre el agua como una calcomanía).
   - **El color igual al del avión.** `WATER_STYLES.sea` es verde-azulado, y eso funciona en el
     2D porque el mar ocupa media pantalla; en el clímax ocupa TODA, y compite con el verde oliva
     del avión hasta confundirse. Nuevo `AGUA3D_AZUL` (0.5): corre el TONO hacia el azul acero
     sin tocar el brillo. **Solo el agua 3D** — el 2D del pasillo no se toca.
   - **Lo que reemplazó a los cuadrados**: la CRESTA ROMPIENDO, ahora como zona del shader
     (`AGUA3D_ROMPE`). Lo único blanco en el mar de verdad es la cresta que rompe, y es una
     mancha conexa a lo largo del lomo de la ola, no un puñado de píxeles sueltos. Dos
     correcciones sobre la marcha: el umbral **no** puede medirse sobre la luminancia (en este
     cielo casi nunca pasa de la mitad de la escala, así que no disparaba nunca — se probó hasta
     0.52 sin ver una sola cresta); va sobre la ola. Y sobre el seno puro las crestas salen
     limpias y parejas, como rayas blancas pintadas: hay que romperlas sumándoles la luminancia
     local.

   **La trampa del repo, otra vez**: un backtick dentro de un comentario GLSL (el shader vive en
   un template literal) rompe el build en silencio y te deja mirando un bundle viejo. Es la
   segunda vez en este plan. Si una variante “no cambia nada”, mirá la salida de `build:game`
   antes de sacar conclusiones.

10. **W3 — la estela va en el SHADER, no en la alfombra.** F8.2 la había hecho con los puntos
   del mar pintados de espuma, y era lo correcto entonces (no costaba nada, la alfombra ya se
   recorría entera). Pero una estela es una MANCHA CONTINUA de agua batida: dibujada con puntos
   sueltos se ve como puntos sueltos. Ahora sale del mismo campo que pinta el agua, y son TRES
   cosas que se leen distinto: la línea de flotación (el casco METIDO en el agua), la V de Kelvin
   (los dos brazos que abren 19,5° desde la proa — el ángulo es físico y no depende de la
   velocidad) y la remolinada de la popa. Los brazos se AFINAN y se apagan hacia atrás: sin esa
   potencia llegaban enteros hasta el final y se leían como dos rieles blancos pintados sobre el
   mar. Perillas: `AGUA3D_ESTELA 420` (largo en metros) y `AGUA3D_ESPUMA 1.8` (cuánto blanquea).

   El buque del arena está en el origen con la proa al +x, y así se lo pasa `agua3d.buque()`. El
   día que navegue, esa llamada pasa a leer su transform y nada más cambia.

   **Consecuencia: la alfombra de puntos ya no corre con el agua cartoon.** El shader cuenta el
   cuerpo, las crestas y la estela; los puntos se quedaron sin oficio. Se saltea el bucle entero
   (10.816 puntos por cuadro) y el objeto va invisible. Con el mar de siempre no cambia nada.

11. **W8 — el mar no es de un solo azul.** Refleja el cielo, y el cielo tiene nubes. Dos ondas
   MUY largas (cientos de metros) que corren lentas y tiñen el agua hacia el tono del cielo del
   clima activo. No es una nube dibujada: es la MANCHA de una nube sobre el agua, que es lo único
   que se ve desde arriba. Cuesta dos senos más — sin textura, sin segunda pasada, sin geometría.
   `AGUA3D_NUBE 0.14`; arriba de 0.25 el mar se pone brumoso y pierde el azul.

12. **W9 — el mar era un plano, y se notaba.** Todo lo de W5–W8 PINTA: cuantiza colores sobre una
   superficie que no tiene ni un vértice de relieve. El mar 2D, en cambio, DESPLAZA cada punto de
   la alfombra por `seaH` — por eso da profundidad y parece tener olas de verdad. La comparación
   la hizo Matías jugando y la ganó el 2D.

   La ola ahora se levanta en el **vertex shader**. Tres decisiones:

   - **Una sola definición de la ola, compartida por los dos shaders** (el chunk `COMUN`). El
     vertex la usa para levantar la geometría y el fragment para pintarla. Si vivieran separadas,
     la cresta pintada y la cresta levantada se irían corriendo una de la otra al primer ajuste.
   - **Un plano grande liso + un PARCHE DENSO de cerca, con el MISMO material.** El plano tiene
     cuatro vértices: sirve de fondo, no hay nada que levantar en él. El parche (950 m, 200×200,
     ~40 mil vértices) es el que tiene con qué. Comparten material, así que no hay costura de
     color, y el desplazamiento se apaga a los ~420 m — adentro del parche — así que tampoco hay
     escalón de silueta.
   - **La altura va en METROS** (`AGUA3D_ALTO`), no en un número de shader: así vale igual en el
     arena y en el pasillo, que tienen escalas distintas.

   **Bug que salió a la luz con esto y que había que arreglar igual:** `GL_INVALID_OPERATION —
   feedback loop` en cada cuadro. El `Water` renderea la escena a un render target para su reflejo
   y se esconde a sí mismo mientras lo hace; el parche es OTRO objeto con el MISMO material, así
   que quedaba dibujándose con la textura del espejo puesta como destino. Se lo esconde junto con
   el plano envolviendo su `onBeforeRender`. Estaba escupiendo errores de GL por cuadro y nadie lo
   veía, porque el juego seguía dibujando igual.

9. **El punto de vista importa para juzgarlo**: desde la cabina a 52 m el mar se ve casi de
   canto y la alfombra de puntos tapa el fondo — el A/B parecía sutil. A 163 m en 3ª persona
   la diferencia es inequívoca. Anotado para quien vuelva a mirar esto.

**Estado del gate al cerrar W2:** `npm run check` **exit 0** (121 unit, smoke, cine,
maniobras, web+smoke web). El build web informa 27,7 MB contra el viejo techo de 16 MB —
**no es un problema y no hay nada que decidir**: el target es **Electron + Steam**
(confirmado por Matías el 16/8, y ya escrito en `historia/RESUELTOS_GUION.md` y
`historia/PLAN_4_PENDIENTES.md`). El techo de 16 MB era del Artifact web; `build_web.py`
solo lo imprime, nunca falla. **Ningún plan de este documento se limita por peso web.**

**Pendiente de P1:** la decisión de Matías sobre el default (`AGUA3D` en `data/tuning.js`),
y W3 — la espuma de proa ya existe por F8.2, falta calibrarla al look cartoon.
