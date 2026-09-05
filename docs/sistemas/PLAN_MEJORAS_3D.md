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
| ~~**W3**~~ ✅ | La estela de proa estilo referencia (V de espuma del buque) — si F8 ya la hizo, calibrarla al look cartoon; si no, hacerla acá | **hecho 5/9**: rehecha EN EL SHADER (línea de flotación + V de Kelvin + remolinada de popa). El buque vive en el agua |
| ~~**W8**~~ ✅ | **Reflejos, no un solo azul** (pedido de Matías: *"quizá otros de nubes o de diferentes tonalidades"*) — la mancha de nube reflejada sobre el agua | **hecho 5/9**: dos ondas muy largas que tiñen el agua hacia el cielo del clima. `check` verde, `feel` idéntico |

**Perillas** (`data/tuning.js`): `AGUA3D 'puntos'` · `AGUA3D_NIVELES 5` · `AGUA3D_DISTORT 2.2`.
**Archivos:** `three-arena.js`, `data/tuning.js`; `three-world.js` solo se LEE (de ahí sale el patrón Water).

> **PROMPT P1:** Vas a implementar EL AGUA CARTOON del 3D de RASANTE. Tu documento de trabajo es `docs/sistemas/PLAN_MEJORAS_3D.md`, SOLO el plan P1 — leé antes `docs/ARQUITECTURA.md` (manda), las trampas de `docs/sistemas/SPEC_AGUA_OLAS.md` §1, `docs/proyecto/ANALISIS_REFERENTES_3D.md` §2 (la referencia y su lección) y `docs/sistemas/PLAN_AGUA_OLAS.md` §0b (la decisión que este trabajo revisa). Baseline de `npm run feel` en §7; idéntico siempre. Una fase por vez desde W0 (el relevamiento del agua 3D actual — F8 pudo haber hecho parte; anotalo antes de tocar). El `three/Water` y `waternormals.jpg` YA existen en `systems/three-world.js`: reusá el patrón, no lo dupliques. Todo detrás de la perilla `AGUA3D` con default `'puntos'` — sin decisión de Matías nada cambia. `npm run check` verde tras cada fase (el smoke entra al ARENA: es tu gate visual). Cuando cierres W2, frená y mostrame las 4 capturas A/B (puntos vs cartoon, calma vs tormenta).

---

## P3 · EL DUOTONO DE MISIÓN *(de Pigeon — la receta de materiales del 3D)*

**Objetivo:** todo el 3D (buque incluido) teñido por UNA rampa según clima/misión — valor
+ tinte + niebla como dirección de arte completa, sin texturas. Es el `tinte` de E0.3
aplicado a los materiales 3D.

| fase | entrega | criterio |
|---|---|---|
| **D1** | `tint3d(preset)` en `three-arena`: un multiplicador de color compartido por los materiales de la escena (buque, mar si está en modo puntos, domo), resuelto del preset de cielo/agua activo (`theme`). Perilla `DUOTONO3D` on/off | m7 (clear) y m9 (storm) se ven de DOS mundos distintos con la misma geometría |
| **D2** | Calibración por clima (los 8 presets) + capturas; el buque placeholder ya se ve "terminado" solo con valor+rampa (la prueba de Pigeon) | 8 capturas, una por preset; la receta anotada para T7 |

**Archivos:** `three-arena.js`, `render/theme.js` (solo lectura), `data/tuning.js`.

> **PROMPT P3:** Vas a implementar EL DUOTONO DE MISIÓN del 3D de RASANTE. Documento: `docs/sistemas/PLAN_MEJORAS_3D.md`, SOLO el plan P3 — leé antes ARQUITECTURA (manda), las trampas de SPEC_AGUA_OLAS §1 y ANALISIS_REFERENTES_3D §1 (Pigeon: un mundo sin texturas se ve terminado con valor + rampa + niebla). Baseline de `feel` en §7; idéntico. D1: `tint3d()` como multiplicador compartido de materiales resuelto de `theme` (el store del clima), perilla `DUOTONO3D`. D2: calibrar los 8 presets con captura cada uno. No toques el render 2D: esto es SOLO la escena three. `check` verde por fase. Cerrá mostrando las 8 capturas y la nota "receta para T7" en §7.

---

## P6 · LA BRUMA EN CAPAS *(de GliderVR — medio día)*

**Objetivo:** dos bandas de haze translúcidas entre el mar y el domo en `three-arena`
(quads con el color `horizon` del preset, alfas 0.35/0.2) — la profundidad atmosférica que
el fog solo no da.

*Una fase única:* quads + perilla `BRUMA3D` + captura A/B en 3 climas. **Criterio:** el
horizonte del ARENA deja de ser una línea y pasa a ser una distancia.

> **PROMPT P6:** Implementá LA BRUMA EN CAPAS del 3D de RASANTE: plan P6 de `docs/sistemas/PLAN_MEJORAS_3D.md` (una fase). Leé ARQUITECTURA, trampas de SPEC_AGUA_OLAS §1, y ANALISIS_REFERENTES_3D §3 (GliderVR: la profundidad son 2 quads, no un shader). Dos bandas translúcidas con el color `horizon` del preset activo, perilla `BRUMA3D`, alfas 0.35/0.2 como partida. `feel` idéntico, `check` verde. Cerrá con capturas A/B en clear, storm y night.

---

## P2 · LA BANDADA — B1, las aves del 3D *(de Pigeon)*

**Objetivo:** el cielo del ARENA/PASADA nunca vacío: aves ambient como billboards (la hoja
de aves ya existe en el juego 2D) a varias profundidades, deterministas, con cap. Sin
gameplay: no colisionan, no puntúan — son paralaje vivo y escala.

| fase | entrega | criterio |
|---|---|---|
| **B1** | 3–5 bandadas de 4–8 aves billboard en la zona 3D, rutas deterministas por semilla, cap `AVES3D_MAX 30`, se apartan del avión (esquive cosmético) | el cielo tiene vida; 0 costo de gameplay; perf sin caída |
| *(B2)* | los Fieles de la oleada como su versión con nombre — **GATEADA: espera PASADA P7** | — |

> **PROMPT P2-B1:** Implementá LA BANDADA (B1) del 3D de RASANTE: plan P2 de `docs/sistemas/PLAN_MEJORAS_3D.md`. Leé ARQUITECTURA, trampas SPEC_AGUA_OLAS §1, ANALISIS_REFERENTES_3D §1 (la bandada de Pigeon = paralaje vivo + escala). Aves como billboards con la hoja 2D existente, deterministas (nada de Math.random por frame), cap 30, sin colisión ni puntaje — presentación pura. B2 (los Fieles) NO: está gateada por PASADA P7. `feel` idéntico, `check` verde, captura con bandada en pantalla.

---

## P4 · EL TERRENO 3D BARATO *(de GliderVR — la obra nueva grande)*

**Objetivo:** la zona 3D deja de ser solo mar: **una bahía con lomas** — plano desplazado
por heightmap + textura albedo generada al cargar (canvas procedural con la paleta `LAND`,
determinista por semilla; NADA de ortofotos) + la bruma de P6. Habilita los clímax de
bahía como el guion los pide (m5 el callejón entre cerros, m11/m12 fondeados).

| fase | entrega | criterio |
|---|---|---|
| **T3D-1** | El terreno: heightmap procedural (bahía genérica: anillo de lomas, agua al centro, playa de turba), malla desplazada + textura canvas con `LAND` + niebla; perilla `TERRENO3D` por misión (default off — solo clímax de bahía) | volar la ARENA de m5 con lomas alrededor; horizonte con relieve; perf estable |
| **T3D-2** | *(GAMEPLAY — gateada: ok explícito de Matías)* las lomas ocultan del buque (terrain masking en el clímax) | — |
| **T3D-3** | Los restos del mundo: playa con rompiente (la costa 2D ya la tiene — coherencia), el duotono de P3 aplicado, capturas por clima | la bahía se ve del mismo juego que el pasillo |

> **PROMPT P4:** Vas a implementar EL TERRENO 3D de RASANTE (la bahía con lomas): plan P4 de `docs/sistemas/PLAN_MEJORAS_3D.md`. Leé ARQUITECTURA (manda), trampas SPEC_AGUA_OLAS §1, ANALISIS_REFERENTES_3D §3 (GliderVR: heightmap + UNA textura + niebla — sin LOD ni streaming) y §6 (qué NO copiar: nada de ortofotos — la textura se genera al cargar con la paleta `LAND`, determinista). Baseline de `feel` en §7; idéntico. T3D-1 primero (perilla `TERRENO3D`, default off, activada solo en clímax de bahía); T3D-2 NO — es gameplay y está gateada por ok de Matías; T3D-3 al final con el duotono aplicado. `check` verde por fase (el smoke entra al ARENA). Cerrá T3D-1 mostrando la ARENA de m5 con lomas en 4 capturas (2 climas × 2 ángulos).

---

## P5 · LOS NOMBRES EN EL MUNDO *(de Pigeon — paralelo, chico)*

**Objetivo:** rotulación diegética: el nombre del buque flotando tenue sobre el agua en el
3D lejano (como ya hace la aproximación 2D sobre el casco) y "RÍO GALLEGOS" pintado en la
pista del despegue 2D. Dos toques.

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
