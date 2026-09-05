# ANÁLISIS — tres juegos three.js de navegador, y qué se roba RASANTE de cada uno

> **Qué es (16/8):** análisis jugado (capturas propias en el navegador embebido) de tres
> juegos que pasó Matías, con la pregunta de fondo respondida y **seis propuestas** de
> mejora extraídas, cada una con su plan y su lugar en los planes existentes.
> Juegos: [Pigeon: A Love Story](https://wristwork.itch.io/pigeon-a-love-story) ·
> [Battle Typer](https://saukorr.itch.io/battle-typer) ·
> [GliderVR](https://simcoemedia.itch.io/glidervr-flight-simulator-experience).

## 0. LA PREGUNTA DE FONDO — "¿por qué RASANTE no puede tener esto?"

**Puede. Y en parte ya lo tiene.** La respuesta honesta, en cuatro hechos:

1. **El stack es EL MISMO.** Pigeon: A Love Story se distribuye como
   `PigeonALoveStory_vanilla-win32-x64.zip` — es **three.js empaquetado en Electron**,
   exactamente el stack de RASANTE. No hay ninguna tecnología ahí que este repo no tenga.
2. **RASANTE ya corre three.js en producción**: el ARENA y la PASADA son 3D
   (`three-arena.js`), y hasta el shader de agua con normal map **ya está en el código**
   (`three/Water` + `waternormals.jpg` en `three-world.js`, del ARENA VIEJO).
3. **La decisión de "no migrar de motor" (VISUAL_UPGRADES, 14/8) fue sobre el PASILLO 2D**
   — y es una decisión de IDENTIDAD (pixel art Neo Geo), no una limitación. El pasillo se
   ve como se ve porque el juego lo eligió, igual que Pigeon eligió el duotono.
4. **El gap real no es técnico: es dirección de arte del 3D.** Los tres juegos son mundos
   3D con direcciones de arte BARATAS y decididas (duotono / toon / heightmap+niebla).
   El 3D de RASANTE está en placeholder porque todavía nadie le puso la suya — que es
   exactamente lo que T7/T8 del plan visual tienen pendiente. Este análisis les da la
   receta.

## 0b. Bitácora de la sesión *(16/8 — los tres se JUGARON en el navegador embebido, con capturas)*

| juego | ficha | qué se jugó/observó |
|---|---|---|
| **Pigeon: A Love Story** (Wristwork) | USD 7,99 · demo en navegador desde abr/2026 · **binarios `vanilla-win32/darwin/linux` = Electron Forge** (el mismo stack de RASANTE) · demo 235 MB, full 873–940 MB | Demo de Londres: pantalla de selección con globo terráqueo dibujado y ficha del mapa (**83,4 km² · ~170.000 palomas · 50 landmarks · ~6.700 calles · 36 tiles**). Se voló sobre la ciudad: duotono violeta primero, rosa después (el tinte cambia con el momento); HUD mínimo (World %, Grid %, Landmarks 0/50, barra "Coo" — SPACE para arrullar); mecánica vista en pantalla: *"pigeons who have rejected you turn red"* — las palomas NPC cambian de color por estado; nombres de calles pintados sobre el piso ("MARLBOROUGH", "CHELSEA"); tiene modo pasivo (screensaver). La bandada visible en TODO momento a todas las profundidades |
| **Battle Typer** (Skor) | gratis en navegador (mejor en BattleTyper.io) · juego de tipeo | Menú: acorazado toon en primer plano con jarcia de líneas, agua azul saturada con vetas especulares blancas grandes (el `Water` de three.js con grade cartoon), isla con montaña nevada al fondo. Partida (EASY): destructores enemigos entran con una PALABRA como etiqueta (VIN, TIN, REGO…) — tipearla es dispararles; cada buque arrastra **estela de espuma en V** y suelta **humo de chimenea**; barra de HP abajo. No se llegó a capturar una explosión en vivo (la partida expiró en menú) — lo dicho sobre explosiones es inferencia de género, marcada como tal |
| **GliderVR** (Simcoemedia) | USD 2 · pensado para Quest 3, corre en desktop/mobile · "experience", no juego | Cargó al instante: planeador en tercera persona alta sobre un terreno montañoso ENORME — **un heightmap desplazado con una textura albedo grande** (verdes/tostados/roca con moteado de árboles), sin LOD visible, la distancia resuelta por **dos bandas de bruma** en el horizonte + cielo con gradiente teñido de sol; estela/contrail como único trazo del avión; botones de captura/home en pantalla. Vuelo lento, contemplativo — el contraste de tono que disparó la idea del ÚLTIMO VUELO (P7) |

Las capturas se miraron en vivo durante la sesión (no se persistieron como archivos); esta
bitácora es el registro. Para re-verlas: los tres corren en el navegador con un click.

## 1. PIGEON: A LOVE STORY — el vuelo y la sensación de altura

**Visto jugando** (demo de Londres en el navegador: 83,4 km², ~170.000 palomas, 36 tiles):

| técnica | cómo lo hace | la lección |
|---|---|---|
| **El mundo DUOTONO** | la ciudad entera es UNA rampa de color (violeta al atardecer, rosa al alba): cajas SIN texturas, diferenciadas solo por VALOR (claro/oscuro) + niebla | un mundo sin texturas se ve TERMINADO si el tinte y el valor están dirigidos. 83 km² baratos |
| **La altura se vende con OBJETOS** | miles de edificios chicos en grilla = una "textura hecha de geometría": paralaje en todas partes al moverte | la sensación de altura no es un shader: es DENSIDAD de cosas chicas abajo |
| **LA BANDADA** | decenas de palomas siluetas a todas las profundidades, siempre en pantalla | otros que vuelan = paralaje VIVO + referencia de escala + el cielo nunca vacío |
| **Nombres pintados en el piso** | "CHELSEA", "MARLBOROUGH" escritos sobre las calles, como mapa | rotulación diegética: informa y ambienta sin HUD |
| **El horizonte disuelto** | la niebla se come el borde del mundo; nunca ves "el final" | el fog es el telón, no un efecto |

## 2. BATTLE TYPER — el agua y el combate naval

**Visto jugando** (menú + partida):

| técnica | cómo lo hace | la lección |
|---|---|---|
| **EL AGUA** *(lo que pidió Matías)* | el `Water` clásico de three.js (normal map animada) pero con **grade CARTOON**: azul saturado plano + vetas especulares BLANCAS, grandes y posterizadas | el shader de agua "realista" + una rampa toon = agua estilizada que NO desentona con un juego gráfico. **Es el punto medio que PLAN_AGUA §0b descartó por falta de evidencia — acá está la evidencia** |
| **Las estelas** | cada destructor arrastra su V de espuma blanca (mesh/trail) + humo de chimenea | los buques VIVEN en el agua: estela + humo es la mitad de la credibilidad naval |
| Los barcos toon | low-poly con jarcia de líneas, colores planos | pariente directo del buque T7: piezas nombradas + color plano + rampa |
| *(explosiones)* | no se llegó a capturar una en vivo — por género: bola toon + columnas de agua | lo que RASANTE ya construyó en LA DESTRUCCIÓN (D0–D5) está al nivel; la mejora pendiente es la versión 3D para ARENA/PASADA |

## 3. GLIDERVR — el terreno de abajo

**Visto jugando** (planeador sobre montañas):

| técnica | cómo lo hace | la lección |
|---|---|---|
| **EL TERRENO** | UN plano desplazado por heightmap + UNA textura albedo grande (tipo ortofoto con relieve pintado) — sin LOD visible | un terreno 3D convincente es barato: malla + textura horneada + niebla. No hace falta streaming ni chunks |
| **La bruma en CAPAS** | dos bandas de haze en el horizonte + cielo con gradiente teñido por el sol | la profundidad atmosférica son 2 quads, no un shader volumétrico |
| El planeador | tercera persona arriba-atrás, la estela como línea | el mismo encuadre del ARENA |

## 4. LAS SEIS PROPUESTAS *(cada una con su plan y su lugar)*

### P1 · EL AGUA CARTOON del 3D *(de Battle Typer — revisa una decisión con evidencia nueva)*
`three/Water` + `waternormals.jpg` YA están en el repo. Propuesta: activarlos para el mar
del ARENA/PASADA con **grade posterizado** (rampa de 4–6 niveles vía `onBeforeCompile` o
un paso de cuantización) usando los colores de `WATER_STYLES` — el agua deja de ser
"realista" y habla el idioma del juego. La alfombra de puntos queda como capa de cercanía
encima (lo mejor de los dos). **Enmienda a PLAN_AGUA §0b/F8 y a T8**: el "probablemente NO
es el look" pasa a "SÍ, con la rampa toon" — decisión final con captura A/B.
*Fases: W1 activar Water+rampa con perilla · W2 A/B contra la alfombra, decide Matías ·
W3 estelas de espuma del buque (la V de Battle Typer) — absorbe la de F8.*

### P2 · LA BANDADA — la altura se vende con otros que vuelan *(de Pigeon)*
En el 3D (ARENA/PASADA): aves ambient + los humos + LA OLEADA de Fieles como siluetas
billboard a varias profundidades — el cielo nunca vacío, paralaje vivo, escala. En el 2D
ya existe el lenguaje (aves/obstáculos); esto es su versión 3D.
*Fases: B1 aves ambient billboard en la zona 3D (deterministas, cap) · B2 los Fieles de la
oleada (cuando P7 de la PASADA descongele) como su versión con nombre.*
**Engancha con:** PASADA P7, PLAN_VISUAL T2.

### P3 · EL DUOTONO DE MISIÓN para el 3D *(de Pigeon — la receta de T7)*
El buque nuevo (T7) y la zona 3D **no necesitan texturas: necesitan valor + rampa +
niebla.** Todo el 3D teñido por la rampa del clima/misión (la violeta del anochecer, la
gris de la tormenta) — es el `tinte` de E0.3/T9.F2 aplicado a los materiales 3D (un
uniform, no un post). Pigeon demuestra que eso ES una dirección de arte completa.
*Fases: D1 rampa por clima en los materiales de `three-arena` (buque incluido) · D2
calibración por misión (m13 luna, m14 noche).*
**Engancha con:** T7 (le da la receta de materiales), E0.3.

### P4 · EL TERRENO 3D BARATO *(de GliderVR — la propuesta NUEVA grande)*
Hoy la zona 3D es solo mar. Con la receta GliderVR — **plano desplazado por heightmap +
textura albedo horneada + niebla** — la PASADA/ARENA puede ocurrir **sobre una bahía con
lomas**: San Carlos con cerros de turba de verdad, el buque fondeado entre elevaciones.
Habilita el clímax del callejón (m5) como es en el guion: entrar POR ENTRE las lomas.
La textura se hornea UNA vez con la paleta de `LAND` (el pipeline de horneado ya existe).
*Fases: T3D-1 heightmap+albedo de UNA bahía genérica con perilla por misión · T3D-2 las
lomas participan (ocultan del radar del buque = terrain masking en el clímax) — GAMEPLAY,
con ok aparte · T3D-3 bruma en capas (P6 adentro).*
**Engancha con:** ARENA m5/m11/m12 (los clímax de bahía), PASADA R2+.

### P5 · LOS NOMBRES EN EL MUNDO *(de Pigeon — chico y encantador)*
Rotulación diegética: el nombre del buque flotando tenue sobre el agua a 1500 m (como ya
hace la aproximación 2D con el nombre sobre el casco), "RÍO GALLEGOS" pintado en la pista
del despegue. Dos toques, cero sistemas nuevos.

### P6 · LA BRUMA EN CAPAS del horizonte 3D *(de GliderVR)*
Dos bandas de haze translúcidas entre el mar y el domo en `three-arena` (quads con el
color `horizon` del preset) — la profundidad atmosférica que el fog solo no da. Medio día.
*Va adentro de T8 o de P4; suelto si se quiere antes.*

### P7 · EL ÚLTIMO VUELO *(idea de Matías, 16/8, mirando el planeador — para el final)*
*"El avión simplemente vuela y ve debajo toda la destrucción, y ahí termina, hasta que se
acaba la nafta."* — El registro contemplativo de GliderVR usado UNA vez, como remate:
después de 14 misiones de adrenalina, 60–90 segundos de silencio son devastadores — **el
contraste es la herramienta**. El jugador conserva apenas el planeo (`control: 'solo_gas'`
o `'solo_mirar'`), abajo pasa el campo de batalla con los RESTOS que el juego ya deja
(LA DESTRUCCIÓN: el escombro persiste — el pasillo detrás tuyo es la historia de tu
corrida, acá literal), la aguja de nafta baja hasta cero, y ahí termina.
**Dónde calza en el guion (alinear con GUION_3, que manda):** es la FORMA natural del
**planeo del sapito del Final B** (que ya existe como texto: volver a casa planeando sin
nafta) — y/o el tratamiento de la muerte en m14. No se toca el guion desde acá: se le
ofrece la forma.
**La cámara**: el "plano del planeador" — tercera persona alta y atrás, el mundo ancho
abajo, la estela como único trazo — entra como **preset de cámara del DIRECTOR** para
esto, para las piruetas en cinemática y para los sacrificios (pedido explícito de Matías).
*Fases: U1 el preset de cámara 'planeador' en el director (C2) · U2 el timeline del último
vuelo sobre el terreno de P4 con los restos de la corrida · U3 la calibración con el guion
(Matías decide Final B / m14 / ambos).*
**Engancha con:** P4 (el terreno), PLAN_DIRECTOR C2/C3, PLAN_CINE_CAIDA (el flameout),
LA DESTRUCCIÓN (los restos persistentes), el reloj de nafta.

### La nota de tono *(de la charla)*
GliderVR es relajante; RASANTE es de adrenalina — **no se importa el tono, se importa la
técnica**. El registro contemplativo queda reservado para finales y sacrificios, donde el
contraste con las 14 misiones de vértigo es el golpe. En todo lo demás, lo robado (terreno,
agua, bandada, duotono) se pone al servicio de la velocidad, no de la calma.

## 5. Orden recomendado y delegación

1. **P1 (agua cartoon)** — evidencia nueva sobre decisión abierta, el repo ya tiene las
   piezas; delegable YA (Opus medio) como enmienda de T8/F8.
2. **P3 (duotono)** — es LA receta que T7 (el buque 3D) necesita antes de modelar: define
   materiales. Va pegada a T7.
3. **P6 (bruma)** — medio día, entra con cualquiera de las dos anteriores.
4. **P4 (terreno 3D)** — la grande nueva; después del rescate de la PASADA y de T7.
5. **P2 (bandada)** — B1 cuando se quiera; B2 espera a P7 de la PASADA.
6. **P5 (nombres)** — relleno de cualquier sesión.
7. **P7 (el último vuelo)** — cuando existan el director (C2) y el terreno (P4); la
   decisión de guion es de Matías y no bloquea nada de lo anterior.
8. **El PROTOTIPO del pasillo 3D (§5b)** — después de P1+P3+P4 (que son sus ladrillos):
   con esas tres hechas, el prototipo es ensamblaje, no invención.

## 5b. LA PUERTA GRANDE — "todo esto DEBERÍA ser posible en mi juego" *(Matías, 16/8)*

Correcto. Y hay que decir hasta dónde llega "posible", porque son TRES niveles:

**Nivel 1 — lo ya planificado (semanas):** las propuestas P1–P7. El 3D de los clímax
(ARENA/PASADA) se ve como estos juegos. El pasillo 2D no se toca.

**Nivel 2 — EL PASILLO MISMO EN 3D (la puerta que esta charla abre):** nada impide que el
propio pasillo se juegue dentro del mundo three.js — terreno de P4 abajo, agua de P1,
duotono de P3, los obstáculos como billboards con las hojas ya horneadas. Los DOS miedos
clásicos ya están resueltos por el propio repo:
- **"Se pierde el feel"** — NO: el modelo de vuelo del pasillo ya está portado al 3D en
  `systems/arena.js` y MEDIDO idéntico (vx 0→30 en 0,27 s; fue el rework del ARENA).
- **"Se pierde el pixel art"** — NO: el 3D de RASANTE **ya renderiza a 480×270 con
  NearestFilter y blitea sin suavizado** — es pixel-art 3D nativo. Un pasillo 3D seguiría
  viéndose Neo Geo, con paralaje y terreno de verdad.
Y no viola la decisión del 14/8 ("no migrar de motor"): three.js no es una migración —
**ya está en el bundle y ya corre la mitad del juego.**

**Nivel 3 — lo que sigue sin convenir:** migrar de motor (Godot/etc.). Sigue reservado
para consolas, como siempre.

**La regla para el Nivel 2: PROTOTIPO ANTES QUE COMPROMISO.** Es la obra más grande
disponible y no se decide por entusiasmo: una fase de prototipo detrás de una bandera
(`?p3d`) — UNA misión de mar volada en el mundo 3D con terreno + agua + duotono + los
obstáculos billboard, feel medido idéntico, y una tarde de playtest de Matías comparando
contra el pasillo 2D. Si el prototipo gana, se planifica la mudanza por etapas (el 2D
queda como fallback web, igual que hoy el momentum). Si no gana, costó una fase y dejó
el terreno/agua/duotono hechos — que sirven igual para los clímax.

## 6. Qué NO copiar

1. **El vuelo de Pigeon** (lento, flotante): RASANTE es lo contrario — velocidad rasante.
   Se roba su ATMÓSFERA, no su feel.
2. **El fotorrealismo de la textura de GliderVR**: la textura del terreno de RASANTE se
   hornea con la paleta del juego (turba `LAND`), no con ortofotos.
3. **El agua sin grade de three/Water** (la versión "demo realista"): sin la rampa toon
   queda pegada al juego — la decisión vieja de PLAN_AGUA tenía razón CONTRA esa versión.
4. Nada de esto toca el PASILLO 2D: el pixel art es identidad. Todo lo de acá es para las
   fases 3D (ARENA/PASADA) y sus clímax.
