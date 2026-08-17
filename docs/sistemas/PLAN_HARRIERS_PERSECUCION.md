# PLAN — Los Harrier en la cola (estilo After Burner) + el modo PERSECUCIÓN

> **Estado: PLAN A COMPLETO (H0–H5) · PLAN B COMPLETO hasta N3, más N5 · PLAN C sin empezar.**
> Implementado el 16/8; N5 y LA REGLA DEL AMIGO el 17/8. `npm run check` verde,
> `npm run caza` verde (13 secciones),
> `npm run persec` verde (13 secciones) y `npm run feel` **idéntico al baseline** —
> que es la garantía del §6.4: los dos sistemas LEEN tu vuelo y no lo escriben.
> **Todo lo que falta está en el §11 «Qué sigue», con su porqué.**
> Las divergencias encontradas durante la implementación están en el **§9** (plan A)
> y el **§10** (plan B); léelas antes de tocar nada, porque tres de ellas corrigen al
> propio plan.
>
> Tres planes por fases:
> **A** — la mecánica del Harrier que te toma la cola durante el PASILLO ·
> **B** — el modo PERSECUCIÓN (variante de PASILLO: mantener distancia con un líder) ·
> **C** — la integración narrativa en campaña. Nace del pedido de Matías con
> [After Burner Climax](https://www.youtube.com/watch?v=7XpjHF9OLCY&t=289s) como
> referencia, y de lo que YA estaba anotado en el proyecto:
> PENDIENTES_DE_REDISENO **§13** (persecución de enemigos + combos de contraataque +
> lanzamisiles con lock + la base avisa por radio + **a veces sin aviso: sin radar**) y
> las dos hojas de arte que faltan justo para esto (caza DESDE ATRÁS y poses de viraje).

## 1. Análisis de la dinámica After Burner *(del video + la saga)*

Se miraron frames de la referencia (After Burner Climax, arcade 2006). Lo que enseña:

**De frente** (la parte que RASANTE ya tiene a medias con el `jet`):
- Los enemigos nacen como PUNTOS en el horizonte y crecen — el tiempo de reacción es la
  distancia. RASANTE ya funciona así con todos sus obstáculos.
- **La soga de humo**: los misiles enemigos son legibles por su ESTELA blanca, no por el
  proyectil. Esquivás la soga, no el punto. Es el sistema de lectura entero del juego.
- **El cruce cercano es la moneda**: el enemigo que te pasa GRANDE y al lado (frame del
  video: el caza ocupando un tercio de la pantalla en un valle) es el momento de plata.
  After Burner lo busca todo el tiempo; el near-miss ES el juego.

**Desde atrás** (lo que se quiere sumar):
- El AVISO llega antes que el avión: primero **las trazadoras que te pasan de largo**
  (ráfagas que cruzan desde atrás hacia adelante, a los costados tuyos), después el caza.
  Es el "tell" clásico — no hace falta ver al enemigo para saber que está.
- El enemigo de atrás **no se queda atrás**: presiona unos segundos y **te sobrepasa**
  (overshoot), y ahí se convierte en blanco de frente por una ventana corta. El ciclo es
  presión → sobrepaso → ventana → se reencola o se va.
- **La velocidad relativa es el verbo oculto**: After Burner Climax tiene barra de SPEED
  (acelerar/frenar) — frenar hace que el de atrás se pase antes; acelerar te saca de su
  solución de tiro pero te come el margen. El duelo se juega con el acelerador.
- **La barra CLIMAX** (cámara lenta cargable para resolver el caos) es literalmente el
  MOMENTUM de RASANTE (`systems/tempo.js`, tecla 4, hoy solo PASILLO) — el enganche ya
  existe y este es su mejor caso de uso.
- Combos por derribos encadenados + armadura porcentual. RASANTE no copia eso: tiene
  rachas de puntaje, el escuadrón como vidas y ahora las AVERÍAS — se mapea a lo propio.

**Qué toma RASANTE y qué rechaza:**

| de After Burner | RASANTE |
|---|---|
| trazadoras que te pasan ANTES que el avión | ✅ tal cual — es el aviso visual canónico |
| presión → sobrepaso → ventana de frente | ✅ el ciclo entero |
| la velocidad relativa como verbo | ✅ adaptado: turbo y piruetas (no hay freno en PASILLO) |
| cámara lenta cargable para el caos | ✅ ya existe: MOMENTUM |
| lock-on con recuadros y tono | ❌ los A-4 no tenían nada — la mira es la de siempre, el aviso es humano |
| enjambres de 5+ enemigos | ❌ acá UN Harrier es un evento; dos es m14 |
| armadura % | ❌ escuadrón + averías, lo nuestro |

## 2. La verdad histórica y las mentiras permitidas

| Hecho (1982) | Regla de juego |
|---|---|
| El Sea Harrier con AIM-9L y cañones de 30 mm era EL depredador del A-4; las pérdidas aire-aire fueron todas en un sentido | El Harrier en la cola es **el evento más peligroso del PASILLO** — no un enemigo más |
| Los A-4 escapaban ABAJO: a ras del mar la solución de tiro y el ambiente degradaban al cazador | **Volar en la banda del ×10 degrada su puntería** — la tesis del juego otra vez: los valientes vuelan abajo, y abajo el halcón no agarra |
| La CAP tenía minutos de estación (los portaaviones estaban lejos) | El duelo tiene RELOJ: si sobrevivís N pasadas, el Harrier **se va** — salida honesta y alivio dramático |
| Ningún Harrier cayó en combate aire-aire (confirmar en PREGUNTAS_HISTORICAS) | Default: al Harrier **se lo ahuyenta** (con impactos rompe el ataque y se va humeando — puntos). El DERRIBO existe pero es carísimo y raro: la hazaña, no la rutina |
| Sin radar ni RWR: los ojos y la radio | El aviso es de Cóndor/el escuadrón… **y a veces no llega** (canon §13). Las trazadoras pasando son el único aviso garantizado |

**Mentiras permitidas:** que el Harrier haga pasadas repetidas "a la After Burner" (real:
un pase y control de energía); la ventana frontal generosa; el ahuyentado con cañón de
20 mm. Ninguna otra.

## 3. PLAN A — «LA COLA»: el Harrier te caza durante el PASILLO

**El ciclo completo (uno solo por vez, es un EVENTO):**

1. **El aviso** — Cóndor o un Fiel: `"¡Rápido por la cola, {indicativo}!"` … o silencio
   (sin radar). Las trazadoras empiezan a pasarte.
2. **La presión** (5–8 s) — el Harrier atrás, invisible o asomando en los bordes. Su
   SOLUCIÓN de tiro madura mientras tu rumbo/altura sean predecibles; cada quiebre la
   resetea; **a ras casi no progresa**. Si madura: ráfaga que te alcanza → avería o
   muerte (embudo `onDeath` de siempre — el relevo aplica).
3. **El sobrepaso** — por reloj, o FORZADO por un combo de contraataque (BREAK TURN /
   JINK / S-TURN — ¡las mejoras del Pichón encuentran su verdadero para qué!): el Harrier
   te pasa ENORME por un costado (el cruce cercano del video: sprite grande, estela,
   doppler, shake) y queda adelante.
4. **La ventana** (2.5–4 s) — de frente, esquivándose: le tirás con el cañón. Impactos
   suficientes → **rompe el ataque y se va humeando** (ahuyentado, puntos). MOMENTUM acá
   es el uso estrella. Si no: recupera cola y vuelve a 2 (máx `CAZA_PASSES`).
5. **La salida** — pasadas agotadas o reloj de CAP cumplido: se va. Radio:
   `"Se quedó sin nafta el inglés."` Racha de puntos por sobrevivirlo.

### Fases de implementación

| fase | entrega | criterio de cierre |
|---|---|---|
| ✅ **H0** | Cimiento: `systems/caza.js` (estado local del duelo, señales `{death}`, nunca llama arriba) + perillas `CAZA_*` en `data/tuning.js` + sonda `?caza` / `__czdbg()` + strings es/en | se entra al duelo por sonda; `check` verde |
| ✅ **H1** | **El pase fantasma** (SIN daño): la coreografía entera legible — trazadoras que pasan, sobrepaso con sprite grande + doppler + shake, ventana frontal, salida. Arte: placeholder del jet actual escalado/oscurecido para la cola a cámara (la hoja real es de producción) | mirada muda: se entiende el ciclo sin leer nada |
| ✅ **H2** | **La presión con dientes**: modelo de solución de tiro (madura con rumbo predecible, se resetea con quiebres, **degradada a ras** — perilla `CAZA_RAS_ALT = 4.5`, la banda del ×10), ráfagas con daño → averías/relevo/muerte (`death_caza`) | fixture: recto te alcanza; quebrando sobrevivís; a ras casi no progresa |
| ✅ **H3** | **El contraataque**: ventana frontal tirable, ahuyentado por impactos (humo + huida + puntos), derribo raro (`CAZA_HP` alto), combos BREAK/JINK/S-TURN fuerzan sobrepaso (gate: en campaña solo si están aprendidas), MOMENTUM interactúa gratis (escala dt) | fixture: ahuyentar suma; derribar es hazaña; el combo corta la presión |
| ✅ **H4** | **Reglamento**: aparición por misión (`caza` en `missions.js` como dato — intensidad 0..2; m1=0), 1 duelo a la vez, reloj CAP, aviso-o-silencio según canon, sin duelos dentro de la niebla ciega ni durante ARENA/PASADA, puntaje | en m2 aparece UNA vez scripted; en PATRIA cada tanto; jamás en m1 |
| 🟨 **H5** | Legibilidad + audio + arte real: hoja del caza desde atrás + poses de viraje cuando salgan de producción; alarma/luz ya existentes conectadas; fixture `npm run caza` completo | gate total + capturas |

**Perillas (defaults):** `CAZA_SOL_T 3.5` s de solución · `CAZA_PASSES 3` ·
`CAZA_CAP_T 45` s · `CAZA_WINDOW 3` s · `CAZA_HP` = ahuyentado a 6 impactos, derribo a 18
· `CAZA_RAS_ALT 4.5` · `CAZA_KILLABLE true`.

## 4. PLAN B — el modo PERSECUCIÓN *(variante de PASILLO: volar de numeral)*

**La idea**: un líder vuela el pasillo ADELANTE tuyo — vos mantenés la distancia en una
banda `[D_MIN, D_MAX]`. Lejos de más: lo perdés (derrota, con gracia). Cerca de más: su
estela te sacude (jet wash: shake + control sucio) y rozarlo es chocar. El líder acelera,
frena, sube y baja — **su línea es la respuesta correcta del nivel** (esquiva todo lo que
viene), así que seguirlo ES leer el pasillo con anticipación. Volar de numeral: la
habilidad real de 1982.

### Fases

| fase | entrega | criterio |
|---|---|---|
| ✅ **N0** | **El líder**: avión amigo autopiloto sobre el pasillo (reusar la formación/autopiloto del relevo y el despegue — `systems/squad.js` + `render/squad.js` ya vuelan Fieles). El spawner CONOCE su línea: nada de lo que siembra la cruza — el líder nunca choca | el líder vuela solo un nivel entero, esquivando, creíble |
| ✅ **N1** | **La cinta de formación**: métrica de distancia (su velocidad varía: mantenerse = dosificar turbo y gas), HUD con la banda (cinta vertical estilo instrumento, no números), gracia `PURS_GRACE 4` s fuera de banda con aviso por radio (`"¡Cerrá, {indicativo}!"` / `"Te me vas encima."`), jet wash bajo `D_MIN` | jugable: mantenerse en banda es un minijuego de gas, tenso y justo |
| ✅ **N2** | **El modo de menú** PERSECUCIÓN: infinito, la banda se angosta con la distancia, el líder rota entre los Fieles (indicativos + radio con personalidad). ⚠ El menú ya tiene 6 filas con `MODE_ROWS {y0:78, rh:31}` — la 7ª pide reapretar (rh ~27) o paginar: decisión chica de layout | el modo encadena y puntúa (tiempo en banda × multiplicador de altura) |
| 🟨 **N3** | **Campaña**: m10 «LOS PRIMOS» usa el sistema — **los Mirage peruanos EN PANTALLA como líderes** (resuelve el pendiente explícito de PLAN_CAMPANA_001 §6: hoy son solo texto). Opcional: tramo tutorial de m1 siguiendo a Puma ("pegado al agua, Tero") | m10 deja de ser una misión de distancia pelada |
| ⬜ **N4** | *(anotada, NO construir)* la variante ofensiva: perseguir a un enemigo que huye manteniéndolo en rango de cañón — comparte toda la infraestructura; candidata a misión de reconocimiento futura | — |
| ✅ **N5** | **El TIRÓN y el CIERRE** *(pedido de Matías, 17/8 — no estaba en el plan original)*: el líder abre turbo cada tanto y hay que seguirlo, avisado por radio 1,4 s antes; y la cinta gana un segundo riel que dice **para dónde vas** y no sólo dónde estás. Más **LA REGLA DEL AMIGO** escrita como invariante del módulo | el tirón se recuerda después de jugarlo, y el cierre se lee de reojo |

**Perillas:** `PURS_D = [60, 140]` banda inicial · `PURS_GRACE 4` s · `PURS_WASH_D 25` ·
apretado del modo infinito: −8% de banda por nivel, piso 45–90 ·
tirón: `PURS_TIRON_T [11,18]` s entre tirones, `PURS_TIRON_AVISO 1.4` s de radio antes,
`PURS_TIRON_DUR [2.6,4.2]`, `PURS_TIRON_F 1.42` (tu turbo es 1.5×: se alcanza, apretado) ·
cierre: `PURS_CIERRE_S 3` suavizado, `PURS_CIERRE_MAX 45` u/s de fondo de escala.

### 4b. LA REGLA DEL AMIGO *(regla de diseño, 17/8 — manda sobre el código)*

**Un amigo no se muere solo.** Al líder de la PERSECUCIÓN no lo mata un obstáculo, no lo mata una
bala tuya, no lo mata que le pases por encima y no lo mata una casualidad de la siembra. La única
puerta por la que puede caerse del cielo es `caerLider()` — y la llama **el guion**, que por
definición dice también **cómo** y **por qué**. La IA vuela perfecto: ése es su trabajo.

No es piedad, son dos cosas concretas:

1. **El modo entero descansa en una promesa.** «Su línea es la respuesta correcta del nivel» sólo
   sirve si su línea es SIEMPRE correcta. Un líder que a veces se come un mástil le enseña al
   jugador a desconfiar de él, y desde ahí ya no está volando de numeral: está volando solo con un
   estorbo adelante.
2. **La muerte de un compañero es el único evento que de verdad importa en esta campaña.** Si pasa
   por accidente, pasa a ser ruido de fondo — y el día que el guion la necesite (el Vasco a la
   salida de m7, §5 C3) no va a pesar nada.

**Dónde está la frontera, porque el juego tiene las dos cosas:**

| | quién | se rompe |
|---|---|---|
| **el numeral** | el líder de la PERSECUCIÓN, un A-4 de tu escuadrilla | **NO.** Ni chocándolo. Sólo por guion |
| **el villano** | los Harrier de LA COLA (PLAN A) — los que te sobrepasan con el afterburner | **SÍ.** Se los ahuyenta a cañón y se los derriba |

Es una regla de **bando**, no de sistema. Y los personajes con nombre de la campaña **no se mueren
en campaña** salvo donde el guion lo escriba.

Chocarlo sigue siendo fatal — **para vos**. Le pasaste por encima al que ibas siguiendo y te fuiste
al agua; él sigue volando. Que la consecuencia sea toda tuya es además lo único que hace que la
estela signifique algo.

## 5. PLAN C — la integración narrativa *(depende de A; corto)*

1. **C1 · m2 «Bautismo»**: el PRIMER duelo, scripted y sobrevivible por diseño (CAP corto,
   sin daño letal la primera pasada): el briefing ya dice *"Harriers más rápidos, misiles
   que persiguen"* — acá se SIENTE. Tutorial por radio de Cóndor (quebrar, bajar).
2. **C2 · escalada**: intensidad por misión como dato (`caza:` 0 en m1/m10, 1 en m2–m8,
   2 en m9/m13/m14 — la del clima cerrado, la nocturna).
3. **C3 · m7, la salida** *(futuro, con la campaña scripted)*: el guion manda que el Vasco
   muere a la SALIDA, enganchado por un Sea Harrier, con el jugador al lado sin poder
   hacer nada. El sistema de LA COLA en modo cinemática — el duelo que no es tuyo y no se
   puede ganar — es la herramienta para jugarlo en vez de narrarlo. No entra hasta que la
   campaña scripted exista (PLAN_CAMPANA §4b).

## 6. Qué NO hacer

1. **No lock-on, no tono, no recuadros de fijado** — la mira de siempre y los ojos.
2. **No enjambres**: UN Harrier es un evento. Dos juntos es exclusivo del final.
3. **No duelo imperdible ni imposible**: siempre sobrevivible a ras + quebrando; siempre
   peligroso recto y alto. La tesis, otra vez.
4. **No tocar el feel del vuelo**: el duelo lee tu estado, jamás escribe tu física.
   `npm run feel` idéntico.
5. **No matar Fieles con esto fuera de guion** (la muerte del Vasco es C3, scripted).
6. **No aparecer en ARENA/PASADA/MINUTOS SAGRADOS** — es una mecánica del PASILLO.
7. El caza desde atrás con placeholder NO bloquea nada (regla P2 de siempre: funciona sin
   assets; el arte cae después).

## 7. Orden, dependencias y relación con los otros planes

- **A (H0–H3) primero** — es la mecánica nueva y el núcleo del pedido. H4–H5 después.
- **B es independiente de A** (comparten solo la filosofía); puede ir antes o después.
  N3 (m10) rinde más cuando el guion de campaña se remapee a 14.
- **C depende de A.**
- **Producción en paralelo**: hoja del caza DESDE ATRÁS + poses de viraje (ya listadas en
  PENDIENTES) — las pide H5, no H1.
- Con **PLAN_VISUAL_FASES**: T5 (enemigos vivos) es cosmética de los existentes y no toca
  esto; si corren cerca en el tiempo, T5 primero (toca render) y LA COLA después (toca
  systems) — no comparten archivos críticos salvo `spawn.js` en H4.

## 8. Dudas históricas que abre *(anotadas en PREGUNTAS_HISTORICAS)*

Derribos aire-aire de Harriers (¿ninguno confirmado?) · tiempo real de estación de la CAP
· AIM-9L todo-aspecto vs la escapada a ras (¿cuánto protegía de verdad el mar?) · los
cañones Aden de 30 mm contra A-4 (casos).

## 9. Divergencias encontradas *(completar durante la implementación)*

> La IA implementadora anota acá toda diferencia entre este plan y la realidad del código
> (nombres, estados, convenciones), con la decisión tomada — y el baseline de
> `npm run feel` al arrancar H0. Este bloque es la memoria para la próxima pasada.

### Baseline de `npm run feel` (tomado antes de tocar nada, al arrancar H0)

`FEEL: OK` con estos números. **Se verificó idéntico tras H0 y tras H1** (diff literal del
archivo: la única diferencia entre corridas es el PID de node en el warning de
`MODULE_TYPELESS_PACKAGE_JSON`). Es la garantía del §6.4: el duelo lee el vuelo y no lo escribe.

| bloque | valores |
|---|---|
| cabeceo | arriba 0.50 · abajo 0.50 |
| energía | trepando 144 · picando 152 (dif +9) |
| roce | margen 0.85 a spd 90 · 0.10 a fondo · escapa con gas en 0.40 s |
| arena E1 | cabeceo 51.57° · morro pleno 0.63 s · picada mínimo 22.0 m · morro tras soltar 4.60° |
| arena E2 | derrape sostenido 0.00° · máximo comandado 4.16° · vuelta completa 5.07 s · radio 86.95 m |
| arena E3 | media vuelta 1.08 s · guiñada 180.92° · costo −19 m/s · radios 43 / 87 / 134 m · derrape 48° |
| arena energía | trepar 4 s = 33.59 m/s · picar 144 m/s · freno 68.73 m/s |
| momentum | barra llena 1.00 con 650 pts · lanzamiento 3.02 s |

### Divergencias

**H0 — el cimiento**

- **H0.1 · El §3 sólo da siete perillas, y el ciclo necesita once.** Los defaults del plan
  (`CAZA_SOL_T`, `CAZA_PASSES`, `CAZA_CAP_T`, `CAZA_WINDOW`, `CAZA_HP`, `CAZA_RAS_ALT`,
  `CAZA_KILLABLE`) entraron **sin tocar**. Pero de las cinco fases del ciclo, el plan sólo pone
  duración a una (la presión, "5–8 s", en prosa del §3 paso 2). Las otras cuatro se eligieron y
  quedaron marcadas en `data/tuning.js` como bloque aparte: `CAZA_AVISO_T 1.6` ·
  `CAZA_OVER_T 1.5` · `CAZA_RECOLA_T 2.4` · `CAZA_SALIDA_T 2.2`. **No son reglas de juego, son el
  metrónomo de la coreografía**, y se tunean mirando, no midiendo.
- **H0.2 · `CAZA_RAS_ALT 4.5` no es un número nuevo: es el techo de la racha rasante.** Coincide
  exactamente con el `rasNow` de `systems/flight.js` y con la banda del ×10 de `core/util.js`. Se
  dejó como constante propia igual (el duelo no debe importar del vuelo), pero está anotado en el
  comentario: **una sola banda, dos premios** — que es la tesis del §2 hecha número.
- **H0.3 · Falta geometría, y sin ella no hay dónde poner al caza.** Se agregaron `CAZA_Z_COLA 6`
  (detrás: el avión vuela en `PZ` = 14) · `CAZA_Z_FRENTE` · `CAZA_X_COLA 26` · `CAZA_MISS 7`. Son
  unidades de MUNDO, el mismo espacio que obstáculos y balas.
- **H0.4 · El §6.6 ("no aparece en ARENA/PASADA/MINUTOS SAGRADOS") no se implementó como
  chequeo.** Se implementó como **ausencia de lugar desde donde correr**: `cazaSystem` se llama
  únicamente dentro de la rama `'play'` de `update()`. Un chequeo de estado se puede olvidar al
  agregar una fase; no tener llamada, no.
- **H0.5 · El duelo escribe UNA cosa del jugador: `run.shake`.** El §6.4 protege la *física*, y el
  sacudón no lo es — es el mismo canal de feedback de cámara que ya usan el roce, las explosiones
  y el afterburner, y `npm run feel` no lo mira. Queda anotado porque es la única excepción y no
  debería crecer.

**H1 — el pase fantasma**

- **H1.1 · La curva del sobrepaso importa más que su duración.** La primera versión usaba un
  suavizado simétrico (smoothstep) y el caza cruzaba tu `z` en los primeros 200 ms: el golpe
  existía y **no se veía**. Con `f^2.2` (lento al arrancar, rápido al final) se queda grande la
  primera mitad y después se va de golpe. `CAZA_OVER_T` subió 1.15 → 1.5 por lo mismo.
- **H1.2 · El sobrepaso se salía del cuadro, y el arreglo se midió contra el borde.** En su
  momento más grande el caza está en z ≈ 9 (escala 15) y el sprite mide ahí ~158 px de los 480 del
  mundo; el cuadro llega a 240 desde el centro. Para que entre entero su centro no puede pasar de
  ~10 unidades del eje: el factor lateral bajó de 0.55 a **0.20**. Con 0.35 lo que se veía era
  media ala pisando la barra de GAS.
- **H1.3 · `CAZA_Z_FRENTE` bajó de 118 a 62 porque la ventana salía VACÍA.** A 118 la escala es
  1.14 y el caza medía 12 px pegado a la línea del horizonte, entre las montañas del fondo. La
  ventana es la fase en la que te toca tirarle a él — **un blanco que no se ve no es una ventana,
  es un hueco**. A 62 mide 24 px y se despega del horizonte.
- **H1.4 · La ráfaga es un chorro, no una salva.** Los proyectiles salían los seis en el mismo
  cuadro, cruzaban juntos en 0,7 s y dejaban un segundo largo de mar vacío: se leía como un
  parpadeo. Ahora cada uno espera su turno (`wait`, 60 ms) y `CAZA_TRAC_GAP` bajó de 1.1–2.2 a
  **0.7–1.4**. Medido en captura: con los valores viejos, la foto de las trazadoras salía **sin
  una sola trazadora**. El aviso tiene que ser continuo o no es aviso.
- **H1.5 · La estela de las trazadoras se muestrea largo.** Con 3 tramos de 3 unidades, a media
  distancia cada trazadora quedaba en un píxel suelto — caspa sobre el mar. Un proyectil a 340
  u/s recorre 5,7 por cuadro, así que la traza tiene que abarcar varios cuadros de vuelo: 7 tramos
  de 5,5 (38 unidades de mundo). Misma técnica que `render/ammo.js`, otras constantes.
- **H1.6 · El render del caza va en DOS pasadas, no en una.** El caza cruza de z 6 (más cerca de
  la cámara que tu propio avión) a z 62 (delante). No hay una capa correcta: `drawCaza(true)` va
  con el mundo y `drawCaza(false)` después de `drawPlane`. Las trazadoras se reparten por el mismo
  criterio, así que una que te pasa al lado se dibuja encima del ala y no debajo.
- **H1.7 · El placeholder de arte necesitó tres líneas en un módulo compartido.**
  `render/enemies.js:drawFrame` ya tenía el mecanismo del flash blanco pero sólo en blanco; se le
  agregó un parámetro `dark` (0..1) con `source-atop`. Es genérico y sirve para cualquier bicho a
  contraluz, no sólo para esto. El Harrier de cola es hoy el `jet` de frente oscurecido al 50% y
  angostado al 74%, con llama de tobera propia — los tres números se van con la hoja real en H5.
  **No bloquea nada** (regla P2): si la hoja no cargó, hay una silueta dibujada a mano.
- **H1.8 · El pico del sobrepaso no se puede medir desde el proceso principal.** Muestreando cada
  90 ms desde afuera, cada ida y vuelta costaba más que el intervalo y el pico medido saltaba de
  z 12 a z 51 entre corridas: el número era del scheduler, no del juego. El muestreo se mudó
  adentro del rAF (sólo viaja un número por cuadro). Es la misma lección que ya traía el `SAMPLER`
  de `tools/fixture_pasada.js`, y este repo la aprendió dos veces.
- **H1.9 · El fixture necesitó una sonda de CALMA (`__czcalma`).** El ciclo completo dura casi un
  minuto y juzgar la coreografía no puede depender de no comerse un mástil en el medio. Vacía el
  pasillo — mismo criterio que `__pdef(0)` en la PASADA: la sección que mide una cosa apaga lo que
  no está midiendo. En el juego normal está siempre apagada.
- **H1.10 · Las capturas encontraron los tres bugs de legibilidad de esta fase** (H1.2, H1.3,
  H1.4) y **ninguna aserción los habría visto**: el fixture daba verde con la ventana vacía y con
  la foto de las trazadoras sin trazadoras. El criterio de H1 es una *mirada muda* y hay que
  mirarlo de verdad. Se agregó `npm run caza` con `CAZA_SHOTS=<dir>` justamente para eso.

**H2 — la presión con dientes**

- **H2.1 · La ventana de esquive NO está donde parece.** La primera lectura del §3 lleva a poner la
  defensa en el proyectil — ráfaga lenta, se la ve venir, se la esquiva. **Es imposible y hay que
  decirlo:** de la cola (z 6) a tu z (14) hay OCHO unidades, o sea centésimas de vuelo a cualquier
  velocidad. La ventana es LA MADURACIÓN: el grito de radio sale a `CAZA_SOL_AVISO` (0.72) y de ahí
  al disparo falta casi **un segundo entero**. Por eso toda la defensa está en la solución de tiro
  —quebrás y se le borra, volás a ras y casi no le sube— y **que la ráfaga te pegue es la
  consecuencia, no una moneda**. `CAZA_LET_V` es lenta por otra razón (de lectura): son las únicas
  trazadoras que se quedan cruzando *adelante* tuyo, y verlas irse es como se entiende sin cartel
  que ésas venían con tu nombre.
- **H2.2 · Una ráfaga cobraba UN IMPACTO POR PROYECTIL, y era un bug.** Los 3-5 tiros de la misma
  ráfaga cruzaban tu `z` de a uno y cada uno llamaba a `takeHit`: 102 puntos de daño en dos cuadros,
  o sea **el avión en el piso de un solo pase**, con el modelo de averías puesto. Se arregló con
  `CAZA_GOLPE_CD` (0.6 s de veda). Una ráfaga de cañón que engancha es UN evento — el propio
  `core/damage.js` lo dice al poner "tres impactos y estás en el piso", y tres impactos tienen que
  ser tres PASES. Lo encontró el fixture, no la lectura del código.
- **H2.3 · "Cada quiebre la resetea" no salía con una caída constante.** La primera versión restaba
  a tasa fija mientras hubiera quiebre, y un BREAK TURN entero le sacaba **menos de lo que
  recuperaba en el medio segundo siguiente**: en los números, maniobrar era casi lo mismo que no
  maniobrar. Ahora la caída es proporcional a lo fuerte que quebraste (`min(6, q/9)`), así que un
  bamboleo de gas la frena y un quiebre de verdad la deja en cero en dos décimas.
- **H2.4 · `death_caza` necesitó entrada propia en `core/damage.js` (34).** Sin ella `isFatal` la
  daba por fatal siempre y el modelo de averías no existía para este enemigo. 34 está entre el fuego
  desde tierra (22) y el misil enganchado (45): son los Aden de 30 mm a quemarropa.
- **H2.5 · El impacto TERMINA el duelo.** Cobrado el golpe el Harrier rompe y se va — que es lo que
  hacía de verdad (un pase, y control de energía) — y además el relevo necesita devolverte el
  pasillo limpio: un duelo que sobreviviera a tu propia muerte le comería al compañero la ventana de
  gracia que el embudo de `game.js` garantiza.

**H3 — el contraataque**

- **H3.1 · El derribo se pregunta ANTES que el ahuyentado.** Si no, es inalcanzable: el ahuyentado
  (6 impactos) dispara la salida y el derribo (18) nunca llegaría. Con este orden le seguís pegando
  MIENTRAS huye humeando — que además es cuando es un blanco difícil de verdad, y por eso la hazaña
  se siente como hazaña.
- **H3.2 · El chequeo de tus balas vive en `caza.js`, no en `collision.js`.** El duelo es dueño de
  su `hp` y ningún módulo de afuera se lo toca (convención 2). Lo que sí comparte es el store
  `bullets`, que se lee y se marca igual que hace la colisión con los obstáculos.
- **H3.3 · El gate de campaña de los combos salió gratis, sin una línea.** El §3 pide que BREAK/JINK/
  S-TURN fuercen el sobrepaso "sólo si están aprendidas": una pirueta que no aprendiste no se puede
  ejecutar, así que no puede forzar nada. No hace falta consultar la libreta del Pichón.

**H4 — el reglamento**

- **H4.1 · El director vive en `caza.js` y no en `game.js`.** `game.js` ya tiene demasiado, y cuándo
  aparece un Harrier es una regla del duelo. Cinco puertas, cada una tapando un modo de arruinar una
  partida: intensidad 0, los primeros `CAZA_DIR_D0` m, los últimos `CAZA_DIR_FIN` m antes del
  objetivo (ese tramo es del clímax), el banco de niebla (a ciegas no es difícil, es una moneda) y
  uno por vez con hueco entre duelos.
- **H4.2 · La intensidad acorta la ESPERA, no endurece al Harrier.** Un Harrier más peligroso no es
  uno que pega más fuerte —eso lo decide el modelo de averías, que es del juego entero— es uno que
  **vuelve antes**. En campaña la intensidad es además el TECHO de duelos por misión; en los modos
  infinitos no hay techo.
- **H4.3 · El mapeo de misiones se adaptó a las 12 que existen.** El §5 (C2) habla de m9/m13/m14, que
  es el remapeo a 14 que todavía no ocurrió. Aplicado a las de hoy: **m1 = 0** (el tutorial no se
  pelea), **m2–m8 y m10 = 1**, **m9, m11 y m12 = 2** — que son la del cielo cerrado, la de luna con
  niebla y la nocturna final.

**H5 — legibilidad, audio y arte**

- **H5.1 · La "alarma" que pide H5 CONTRADICE el §6.1, y ganó el §6.** El §6.1 prohíbe el tono de
  fijado con todas las letras ("el aviso es humano o no es"). Se conectó todo lo demás: el grito de
  radio (`caza_break`), el chasquido de las trazadoras que pasan, el bramido más grave y más largo
  de la ráfaga apuntada —que suena DISTINTO a propósito, porque el oído es el segundo canal del
  tell—, el doppler del sobrepaso y el fogonazo rojo del HUD que ya trae `takeHit`. **Ningún tono
  continuo de alerta.**
- **H5.2 · Las trazadoras letales son ROJAS y más gordas.** Prohibido el recuadro de fijado, el
  aviso de "ésta te apunta a vos" tiene que estar en la cosa misma: las de aviso son frías y ajenas,
  éstas son cálidas y crecen. Es el mismo idioma que el juego ya habla con la soga de humo.
- **H5.3 · El arte del Harrier sigue siendo placeholder y NO bloquea nada** (regla P2). La hoja
  desde atrás y las poses de viraje quedan en PENDIENTES. Los tres números del placeholder
  (`PH_DARK` 0.5, `PH_SQUASH` 0.74 y la llama de tobera) se van con la hoja real.
- **H5.4 · El fixture creció a 13 secciones y el modo `manso` nació de ahí.** Las secciones 1-8
  miden la COREOGRAFÍA y corren el duelo **sin las ráfagas que matan**: no se puede juzgar un
  sobrepaso desde la pantalla de derribado. No es una trampa, es el criterio de siempre del repo —
  la sección que mide una cosa apaga lo que no está midiendo (igual que `__pdef(0)` en la PASADA).
  Los dientes tienen sus propias secciones (9 en adelante) y ahí el duelo va entero.
- **H5.5 · El umbral del sobrepaso bajó de 20% a 15% de píxeles, y está medido.** El pase entra por
  un costado SORTEADO (`C.lado`), así que el mismo pase tapa entre 19% y 24% del cuadro según de qué
  lado venga. Es varianza del juego, no del test. Lo firme es la escala: el vuelo normal no pasa del
  8%, o sea que 15 sigue siendo el doble de cualquier cosa que ocurra sin un avión encima.
- **H5.6 · Las sondas de medición tuvieron que pelearse con la física, y eso enseñó dos cosas.**
  `__czalto(y)` clava altura **y rumbo**: sin clavar la `x`, el avión a gas pleno deriva de costado
  lo suficiente como para que la solución de tiro lea un quiebre permanente y no suba nunca. Y
  `__czquiebre()` tuvo que pasar de un empujón de un cuadro a un quiebre **sostenido** (45 u/s
  durante 350 ms, que es lo que hace un BREAK TURN de verdad) — con el empujón la prueba daba en
  rojo, y tenía razón (ver H2.3).

## 10. Divergencias del PLAN B *(la PERSECUCIÓN)*

**N0 — el líder**

- **N0.1 · No se reusó el autopiloto del relevo: se reusó su IDEA.** El §4 sugiere reusar
  `systems/squad.js`, pero `updateRelevo` es una **cinemática de 3 segundos** con curva de tres
  puntos, cámara propia y fases — no un avión que vuela indefinidamente. Lo que sí se reusó, y es lo
  que importaba, son sus dos ideas buenas: mover el **ancla** (`tx`/`ty`) y no la posición, para que
  la curva siga siendo curva; y sacar el **banqueo del movimiento real**, para que el líder banquee
  como banquearía el jugador. `systems/persec.js` es nuevo y no toca `squad.js`.
- **N0.2 · "El líder nunca choca" son DOS mecanismos, no uno, y hay que tocar los dos.** `esquivar()`
  lo hace CREÍBLE (se lo ve correrse, que es la mitad del punto: por eso seguirlo enseña) y
  `carrilLibre()` —que `systems/spawn.js` consulta antes de elegir carril— lo hace CIERTO. Sólo con
  el primero sería una apuesta: un obstáculo sembrado justo encima de él, a la velocidad del
  pasillo, no da tiempo a nada.
- **N0.3 · La corrección del carril va en `lane` y no en cada `push`.** `lane` es el carril
  compartido de casi todo lo que se siembra: un solo lugar donde pasa, un solo lugar donde puede
  fallar. Los pocos tipos que eligen su propio carril (`landLane`/`waterLane`, en COSTA) son de
  TIERRA, y el líder vuela sobre el agua.
- **N0.4 · El §4 sólo da tres perillas y N0 necesita seis más.** `PURS_D`, `PURS_GRACE` y
  `PURS_WASH_D` entraron sin tocar. Se agregaron `PURS_D0` (arranca en el centro de la banda, para
  que la primera decisión sea del jugador y no una corrección de entrada), `PURS_V_BASE/AMP/T` (la
  velocidad del líder: **dos senos de períodos primos entre sí** — con uno solo se vuelve un
  metrónomo a los 20 s, y el patrón tiene que poder ANTICIPARSE, que es distinto de adivinarse),
  `PURS_SAFE`, `PURS_LOOK` y `PURS_AGIL`.
- **N0.5 · El líder vuela TU avión, y no es economía de arte.** Es un numeral de tu escuadrilla —el
  mismo A-4, el mismo indicativo que escuchás por radio— y verlo idéntico es lo que hace que seguirlo
  se sienta como volar de numeral. La columna de la hoja sale de su alabeo real con la misma cuenta
  que `render/plane.js` usa para el tuyo: si el líder banqueara distinto, copiarle la línea dejaría
  de enseñar nada.

**N1 — la cinta de formación**

- **N1.1 · La cinta y el líder viven en el mismo archivo y en ESPACIOS DE COORDENADAS DISTINTOS.**
  `drawPersec` es grilla de MUNDO (480×270, junto a `drawPlane`) y `drawCinta` es grilla de DISEÑO
  (320×180, dentro del `ctx.scale(U)` del HUD). Es la trampa #4 del repo (`SPEC_AGUA_OLAS` §1) y acá
  conviven las dos en un archivo de 120 líneas: está anotado arriba de cada función.
- **N1.2 · La gracia se GASTA y se recupera más lento de lo que se gasta** (0.6× ). Volver a banda la
  recupera, pero entrar y salir todo el tiempo la va comiendo igual — que es lo justo, y lo que
  evita que el modo se juegue rebotando contra los bordes de la banda.
- **N1.3 · El jet wash escribe `run.shake`, y es la misma excepción anotada en H0.5.** El §6.4
  protege la *física*; el sacudón es feedback de cámara, el canal que ya usan el roce y las
  explosiones. `npm run feel` no lo mira.
- **N1.4 · El puntaje del modo no inventó economía:** tiempo en banda × el multiplicador de ALTURA
  que el juego ya tiene. Seguir al líder bien abajo paga más — la tesis de siempre, dicha con un
  sistema nuevo.
- **N1.5 · La radio avisa en el FLANCO y después insiste cada `PURS_AVISO_T`.** Por cuadro sería un
  grito continuo; una sola vez se pierde en el medio de un esquive.
- **N1.6 · N2, N3 y N4 no se construyeron.** N2 (el modo de menú, con la decisión de layout de la 7ª
  fila) y N3 (m10 con los Mirage peruanos) quedan pendientes; N4 sigue siendo sólo anotación, como
  pide el plan. Hoy la única puerta de entrada es la sonda `?persec`, y es a propósito: N0 y N1 se
  juzgan volando, no navegando menús.

**N1 (continuación) — lo que encontraron las capturas**

- **N1.7 · El líder a distancia de banda medía 11 px, y así el modo no enseña nada.** La banda del
  §4 va de 60 a 140 unidades: proyectado, el líder queda entre 11 y 5 px de los 480 del mundo. A ese
  tamaño **no se le puede leer el banqueo** — y leerle el banqueo es la mitad del modo, porque es el
  aviso anticipado de que ahí adelante hay algo. Se arregló con un piso de escala en el DIBUJO
  (`PURS_F_MIN`), no tocando `PURS_D`: achicar la banda para que el sprite se vea sería arreglar la
  legibilidad rompiendo el diseño. Es la misma regla que ya tenía la cabeza de las trazadoras
  ("nunca menos de 2 px") y la misma lección de H1.3.
- **N1.8 · El pie de la cinta caía encima del panel de instrumentos.** Justo la zona de ESTELA — la
  que avisa que te le estás yendo encima. Se subió y se acortó (`y 74/h 62` → `y 68/h 56`). Y el
  indicativo del líder se perdía en gris contra el cielo del amanecer: ahora va con placa y en
  acento, porque ese nombre no es decoración — es a quién le habla la radio cuando grita "¡Cerrá!".
- **N1.9 · El líder SOBREVIVÍA a tu propia muerte.** Perderlo o chocarlo devolvía `{death}` pero
  dejaba el objeto vivo, así que el compañero del relevo entraba con la gracia de otro corriendo. Es
  exactamente el mismo problema que LA COLA ya había resuelto en H2.5, encontrado de forma
  independiente por su propio fixture — vale la pena anotarlo: **dos sistemas distintos, el mismo
  error, y en los dos casos lo encontró la prueba y no la lectura**.

**Sobre cómo se probó el PLAN B**

- **N1.10 · El fixture volaba con `W` sostenida, y `W` es CABECEO, no gas.** El avión trepaba, trepar
  cuesta velocidad, y el líder se le escapaba por un motivo que no tenía nada que ver con lo que la
  sección estaba midiendo (a los 14 s quedaba a 238 unidades, más allá del horizonte de siembra). Se
  reemplazó por vuelo nivelado por sonda (`__psnivel`). **Este error escondió el bug de diseño de
  N0.6 durante dos corridas enteras.**
- **N1.11 · Todas las llamadas a la página van con timeout.** Un fixture que se cuelga es peor que
  uno que falla: no dice nada y hay que matarlo a mano. Ahora, si la página no contesta en 4 s, la
  sección falla con un mensaje — que es información.

**N0.6 · EL BUG DE DISEÑO MÁS GRANDE DEL PLAN B, y lo encontró el fixture**

La velocidad del líder **no puede ser un número absoluto**, y el §4 no lo dice. Tu velocidad nominal
**sube sola con el tiempo de vuelo** (`speedTarget` en `core/physics.js`: `62 + t*2.8`, hasta 150).
Con un líder a velocidad fija —la primera implementación, `PURS_V_BASE = 104`— el modo es imposible
los primeros veinte segundos, porque te deja atrás sin que puedas hacer nada, y trivial después.
Medido: a los 14 s el líder estaba a **401 unidades**, más allá del horizonte de siembra.

Ahora el líder vuela a **tu propia velocidad nominal** por un factor (`PURS_V_F`), calculada con la
misma función pura que usa tu vuelo. Y eso trae gratis la tesis del juego: la referencia se calcula
sin tu racha ni tu multiplicador, pero tu velocidad real sí los tiene — o sea que **volando pegado
al agua le seguís el tren cómodo y volando alto te descolgás**. Nadie tuvo que programarlo.

**N2 — el modo de menú**

- **N2.1 · La advertencia del §4 sobre `MODE_ROWS` apuntaba al menú equivocado.** `MODE_ROWS`
  (`{y0:78, rh:31}`) es el selector PRINCIPAL — CAMPAÑA / JUEGO RÁPIDO / OPCIONES / SALIR — y no se
  toca. PERSECUCIÓN entra en el submenú **JUEGO RÁPIDO**, que usa `CAMP_ROWS` con Y acumulada. Pero
  el problema existe igual, sólo que ahí: con la sexta fila y el paso de la campaña (`y0 96, rh 34`)
  la última cae en y=266 y su descripción, 14 px más abajo, se sale de los 270 de alto. Se resolvió
  **sin paginar**, con geometría propia para ese menú (`QUICK_ROWS = {y0:92, rh:29}`): la sexta
  termina en 255 y el resalte cierra en 261. La campaña conserva su paso porque sus filas llevan
  encabezados de sección y ahí el aire hace falta.
- **N2.2 · El apretado es de DISTANCIA, no "por nivel".** El §4 dice "−8% de banda por nivel", pero
  el modo es infinito y no tiene niveles. El escalón es cada `PURS_TIGHT_D` metros — que es como ya
  escala todo lo demás del pasillo infinito (la velocidad nominal, la densidad de siembra). El piso
  del plan (45–90) entró sin tocar, y es lo que separa un minijuego de gas de una cuerda floja.
- **N2.3 · El relevo del líder no es cosmética.** En un modo infinito lo único que puede marcar que
  *pasó algo* es que la radio cambie de persona. El indicativo sale de `squad.pilotName`, así que en
  campaña son los Fieles con nombre y en arcade numerales PATRIA, sin una línea de código extra.

**N3 — la campaña, y un conflicto que hay que resolver antes de construirlo**

- **N3.1 · «LOS PRIMOS» NO EXISTE en las 12 misiones de hoy.** El §4 la nombra como m10, pero eso
  pertenece al remapeo a 14 de `PLAN_CAMPANA_001` (que todavía no ocurrió). En las 12 de
  `data/missions.js`, m10 es «EL ÁNGEL DE CORRIENTES», y es una misión **de buque**: meterle una
  persecución encima le cambiaría el final.
- **N3.2 · Y los Mirage peruanos EN PANTALLA como líderes CONTRADICEN el plan de campaña.**
  `PLAN_CAMPANA_001` dice de m10, con todas las letras: *"La llegada de los Mirage a Tandil va como
  corte intercalado (no es escolta: era históricamente imposible)"*. Ponerlos a volar adelante tuyo
  sería exactamente la escolta que ese documento descarta por razones históricas. **No se
  construyó**, y no por falta de tiempo: dos planes del proyecto se contradicen y el que habla de
  esa misión en particular es el otro.
- **N3.3 · Lo que SÍ se construyó es el mecanismo, y la opción que el propio §4 ofrece.**
  `persec: 0|1` es dato de misión, igual que `caza` — cualquier misión puede volarse de numeral
  cambiando un número. Y se aplicó a **m1 «SAL EN LAS ALAS» siguiendo a PUMA**, que es la
  alternativa que el §4 lista como opcional y la única de las 12 que encaja: es tutorial, es de
  distancia (sin clímax de buque que romper) y su lección literal es volar pegado al agua detrás de
  alguien que ya sabe. Cuando el remapeo a 14 traiga LOS PRIMOS, la misión sólo tiene que poner
  `persec: 1` — y la decisión de si los Mirage aparecen o no es del guion, no de este sistema.
- **N3.4 · En campaña el modo infinito va APAGADO.** La banda no se aprieta y el líder no rota: el
  tramo tiene largo conocido y una intención escrita, y una dificultad que trepa sola convertiría un
  tutorial en una prueba de resistencia. Es la misma perilla (`opts.infinito`), decidida por quien
  arma la persecución y no por el sistema.

**N4** — sigue siendo **sólo anotación**, como pide el plan. No se construyó nada.

- **N2.4 · Agregar un modo al menú JUEGO RÁPIDO ROMPIÓ `tools/smoke.js`.** El smoke navega con un
  número fijo de flechas (`for i < 2` para llegar a MINUTOS SAGRADOS, `i < 3` para PASADAS
  MORTALES), y PERSECUCIÓN entró en el medio de la lista. La prueba entraba a otro modo y fallaba
  **más abajo**, con un mensaje que no decía una palabra de menús: *"arranque raro de PASADAS
  MORTALES … state: arena"*. Está anotado en ARQUITECTURA para el próximo que agregue un modo.
- **N2.5 · La sonda del fixture tuvo que esperar a que el MUNDO CORRA, no a que el líder exista.**
  `startPersec` crea el objeto en cualquier estado, pero durante un relevo —los tres segundos que
  siguen a perderlo o chocarlo, que es justo lo que prueban las secciones anteriores— `persecSystem`
  no se llama. La sección siguiente medía un líder **congelado** y daba en rojo: *"la banda no se
  apretó"*, con el sistema perfecto y el juego detenido. Ahora `Lsure()` espera a que el reloj del
  líder avance entre dos muestras. Es la tercera vez en este plan que una prueba mide al andamio en
  vez de al juego (ver H1.8 y N1.10), y las tres veces el síntoma fue el mismo: **el número estaba
  bien y no era del juego**.

- **N5.1 · El respiro no pedía una decisión: por eso hizo falta el TIRÓN.** `PURS_V_AMP` hace que el
  líder respire ±16% y eso obliga a corregir *todo el tiempo*, que no es lo mismo que **decidir**.
  Es una marea, y una marea se administra sin pensarla. El tirón es el mismo modo dicho como
  evento: abre turbo, se va, y en tres segundos o vas a fondo o lo perdiste. Es el único momento
  del modo que se recuerda después de jugarlo.
- **N5.2 · El tirón AVISA 1,4 s antes, y eso no es generosidad.** Sin aviso la respuesta óptima
  pasa a ser «volar siempre en el fondo de la banda por las dudas», que es exactamente el vuelo
  aburrido que el modo trata de evitar. Es la misma corrección que ya había hecho falta en el PLAN
  A (§9, H2.1): **la ventana de esquive es el aviso, no el proyectil**. Dos sistemas distintos,
  la misma ley.
- **N5.3 · `PURS_TIRON_F 1.42` contra tu turbo 1.5× — el margen es del 5%, a propósito.** Medido
  con el fixture: quemando, el líder pasa de 169 a 236 u/s y se va 88 unidades en 1,2 segundos si
  no reaccionás. Con turbo lo alcanzás; con turbo **y volando a ras** lo alcanzás cómodo, porque tu
  racha rasante multiplica tu velocidad real y la referencia del líder se calcula sin ella. La
  tesis del juego otra vez, gratis (ver N1.4).
- **N5.4 · La aguja de la cinta llega tarde: hizo falta una SEGUNDA medición.** Cuando la aguja
  toca el borde de la banda, la gracia ya empezó a correr. El **cierre** (u/s a las que te acercás
  o alejás, suavizado a `PURS_CIERRE_S`) es el único dato del instrumento que habla del futuro, y
  es como se vuela formación de verdad: no se mira la distancia, se mira si crece o se achica.
  Su invariante —el signo del cierre es el opuesto al del cambio de distancia— es una aserción del
  fixture, porque un instrumento con el signo dado vuelta es peor que no tenerlo.
- **N5.5 · El cierre se dibujaba DENTRO de la cinta y se perdía contra el relleno de la banda.**
  Visto en la captura `n5_c_cierre`, no en una aserción — la de siempre. Salió a un riel propio a
  la izquierda, y de paso el instrumento quedó mejor: dos rieles, uno por lado, cada uno con una
  cosa que decir (izquierda el cierre, derecha la gracia) y la cinta del medio sólo la distancia.
- **N5.6 · Las secciones nuevas del fixture medían un mundo `dead`, y ni rearmar al líder lo
  revive.** Cuarta vuelta de la misma trampa (H1.8, N1.10, N2.5). Esta vez un escalón más arriba:
  las secciones de N1 gastan vidas *a propósito* —se pierde al líder, se lo choca— y para la
  sección 11 el run estaba terminado; `Lsure()` rearmaba el líder, el objeto existía, y todo
  medía cero. Diagnosticado leyendo `__pausedbg()`: `state: "dead"` con `L.t` clavado. La cura fue
  `arrancar()` — **partida nueva** al empezar cada sección que necesita mundo vivo — más pinchar
  la altura a 45 m (a 8 m el jugador se come un mástil en algún momento de minuto y medio) y una
  sonda de tanque lleno. Con eso, dos corridas seguidas dan números idénticos.
  **La lección, ampliada:** no alcanza con preguntar «¿existe lo que voy a medir?» ni con
  «¿avanza el reloj?» — hay que preguntar **«¿la partida sigue viva?»**.
- **N5.7 · La REGLA DEL AMIGO no se puede probar del todo, y conviene saber qué sí se probó.** Que
  el líder no choque son las secciones 2 y 3 (esquiva + carril reservado). Que no lo rompa volarle
  encima es la sección 13. Que **no lo maten tus balas** no tiene aserción: se sostiene en que
  `systems/persec.js` no tiene una línea de código de impactos y el líder no vive en `obstacles`.
  Es una garantía por ausencia — si algún día alguien mete al líder en la lista de colisiones, nada
  va a ponerse rojo.

---

## 11. Qué sigue *(el estado real y todo lo que falta, con su porqué)*

> Escrito al cerrar la implementación del 16/8. Cada punto dice **qué falta**, **por qué no se
> hizo** y **qué hay que tocar** — para que la próxima pasada no tenga que reconstruir el contexto.
> El orden de arriba hacia abajo es el orden recomendado.

### 11.1 — Lo que ya se puede jugar hoy

| cómo | qué se ve |
|---|---|
| `?caza` en la URL | un duelo apenas arranca el pasillo. `?caza=mudo` sin aviso por radio; `?caza=manso` sin las ráfagas que matan (el pase fantasma de H1, para mirar la coreografía) |
| cualquier misión de campaña salvo m1 | el duelo aparece solo, según `caza` de `data/missions.js` |
| JUEGO RÁPIDO → **PERSECUCIÓN** | el modo infinito de volar de numeral, con la banda apretándose |
| campaña **m1 «SAL EN LAS ALAS»** | se vuela de numeral detrás de PUMA (`persec: 1`) |
| `npm run caza` · `npm run persec` | los dos fixtures, con `CAZA_SHOTS=<dir>` / `PURS_SHOTS=<dir>` para dejar capturas |

> **Ojo con las sondas de URL:** `?caza` y `?persec` **no funcionan con `npm start`** — `electron/main.js`
> usa `win.loadFile()` y ahí no hay query. Para las sondas: `npm run serve` y abrir
> `http://localhost:8475/src/index.html?persec` en el navegador.

### 11.2 — LO PRIMERO: el playtest. Nada de abajo importa antes que esto

**Los dos sistemas están verdes en fixture y NINGUNO se jugó con las manos todavía.** Este plan
dejó tres lecciones idénticas (H1.10, N1.7, N2.5) que dicen lo mismo: *lo que una aserción no puede
juzgar hay que mirarlo*. Y hay un escalón más arriba de mirar, que es **jugar**. Las preguntas
concretas que sólo el playtest contesta:

- **¿El grito de radio alcanza como aviso?** Es casi un segundo entre `CAZA_SOL_AVISO` y el
  disparo. En el papel es una eternidad; con un mástil viniendo de frente puede que no se lea.
  Si no alcanza: subir `CAZA_SOL_AVISO` (avisa antes) o `CAZA_SOL_T` (madura más lento).
- **¿Ahuyentar al Harrier se siente posible?** Seis impactos en una ventana de 3 s con el cañón,
  contra un blanco que teje en tres ejes. Puede ser demasiado. Perilla: `CAZA_HP.ahuyenta`.
- **¿La banda de PERSECUCIÓN es tensa o es tarea?** `PURS_V_AMP` (±16%) es lo que obliga a dosificar
  el gas. Poco → el modo es un paseo; mucho → es un yo-yo. Es **la** perilla del modo.
- **¿El TIRÓN se puede aguantar, y se siente?** Es la pregunta más nueva y la más importante del
  modo (§4b / N5.1–N5.3). Tres cosas a sentir por separado: si **1,4 s de aviso alcanzan** para
  poner el pulgar en el turbo; si `PURS_TIRON_F 1.42` contra tu 1.5× deja un margen **apretado pero
  justo** o directamente imposible volando alto; y si terminar uno entero en banda **se siente como
  un logro** o pasa desapercibido (ahí la perilla es `PURS_TIRON_PTS`, y si el problema es que no se
  nota, el arreglo no es el número: es el teatro).
- **¿El riel del CIERRE se lee sin mirarlo?** Es la única parte del instrumento que habla del
  futuro (N5.4). Si hay que buscarlo con la vista, no está cumpliendo: `PURS_CIERRE_MAX` cambia la
  sensibilidad y `PURS_CIERRE_S` cuánto tiembla.
- **¿El apretado escala bien?** `PURS_TIGHT_D` (900 m por escalón) salió de la nada: el §4 hablaba
  de niveles y este modo no los tiene.

### 11.3 — H5 · el arte real *(bloqueado por producción, no por código)*

Falta la **hoja del caza DESDE ATRÁS** y las **poses de viraje** (ya listadas en PENDIENTES §13).
Hoy el Harrier de cola es el `jet` de frente oscurecido al 50% y angostado al 74%, con llama de
tobera propia. **No bloquea nada** (regla P2): sin la hoja hay una silueta dibujada a mano.

Cuando lleguen, tocar sólo `src/render/caza.js`: se van `PH_DARK`, `PH_SQUASH` y la llama de tobera
manual. El parámetro `dark` que se le agregó a `render/enemies.js:drawFrame` **se queda**: es
genérico y sirve para cualquier bicho a contraluz.

### 11.4 — La decisión que NO es del código: LOS PRIMOS

Está explicada entera en **§10 / N3.1–N3.2** y es lo único de este plan que quedó abierto por un
conflicto entre documentos, no por falta de trabajo:

> El §4 pide los **Mirage peruanos en pantalla como líderes** en m10. `PLAN_CAMPANA_001` dice de esa
> misma misión, textual: *"no es escolta: era históricamente imposible"*.

**El mecanismo ya está listo** (`persec: 0|1` por misión): el día que se decida, es cambiar un
número. Lo que hay que decidir es de guion:

1. **Corte intercalado** (lo que dice el plan de campaña) → los Mirage no vuelan en pantalla, y m10
   usa la persecución con **otro** líder o no la usa.
2. **Licencia deliberada** → vuelan, y se anota en `PREGUNTAS_HISTORICAS.md` como mentira permitida
   con su razón. El §2 de este documento ya tiene una lista de mentiras permitidas: entraría ahí.

Y hay un tercer camino, más barato que los dos: **cualquier otra misión de distancia** puede volarse
de numeral hoy mismo sin tocar historia.

### 11.5 — PLAN C · la integración narrativa *(sin empezar; depende de A, que ya está)*

- **C1 · m2 «Bautismo», el primer duelo scripted.** Hoy m2 tiene `caza: 1`, o sea que el Harrier
  aparece — pero **por el director, no por guion**. C1 pide que sea *el* momento: CAP corta, sin
  daño letal la primera pasada, y Cóndor enseñando por radio a quebrar y bajar. Necesita un gancho
  de guion en el director (`cazaDirector` acepta el contexto: alcanza con un `opts.scripted`).
- **C2 · la escalada.** Ya está hecha en su forma de dato (`caza` 0..2 por misión, §9 / H4.3). Lo
  que falta es **revisarla jugando**, y eso es 11.2.
- **C3 · m7, la muerte del Vasco.** El duelo que no es tuyo y no se puede ganar, en modo cinemática.
  **No entra hasta que la campaña scripted exista** (PLAN_CAMPANA §4b) — es una dependencia dura y
  está bien que lo sea: el sistema ya sirve como herramienta, lo que falta es el escenario donde
  usarla.

### 11.6 — N4 · la variante ofensiva *(anotada a propósito, sigue sin construirse)*

Perseguir a un enemigo que huye manteniéndolo en rango de cañón. **Comparte toda la infraestructura
de `systems/persec.js`**: es la misma banda con el signo cambiado (te acercás en vez de mantenerte)
y el mismo líder con otra intención. Candidata a misión de reconocimiento futura. El plan pide
explícitamente no construirla y no se construyó.

### 11.7 — Deuda técnica declarada

| qué | dónde | cuándo se paga |
|---|---|---|
| **Las sondas marcadas `QUITAR`** — `?caza`, `?persec`, `__cz*`, `__ps*` | `src/game.js` (dos bloques), y sus exports en `systems/caza.js` / `systems/persec.js` | al cerrar el plan. **Ojo: los dos fixtures viven de ellas** — sacarlas es sacar también `npm run caza` y `npm run persec`, o reescribirlos |
| **`run.shake` es lo único que estos sistemas le escriben al jugador** (H0.5 y N1.3) | `caza.js:golpeDelPase`, `persec.js:banda` | no se paga, se **vigila**: es feedback de cámara, no física, y `npm run feel` no lo mira. La regla es que no crezca |
| **`caerLider()` no tiene todavía quién la llame** — la puerta del guion existe y está probada, pero ninguna misión la usa | `systems/persec.js`, `src/game.js` (la señal `{ guion }`) | cuando exista la campaña scripted (§5 C3, el Vasco en m7). Hasta entonces es una puerta cerrada con la llave puesta, a propósito |
| **El líder no puede ser tocado por balas por AUSENCIA de código, no por una regla** (N5.7) | `systems/persec.js` | se **vigila**: si alguien mete al líder en `obstacles` o en el barrido de impactos, nada se pone rojo |
| **El modo `manso`** (duelo sin ráfagas letales) | `systems/caza.js` | es un instrumento de prueba, no una dificultad. Si algún día se ofrece al jugador, que sea una decisión explícita y no una filtración |
| **Agregar un modo al menú JUEGO RÁPIDO rompe `tools/smoke.js`** (N2.4) | `tools/smoke.js`, dos `for` con número fijo de flechas | cada vez que se agregue un modo. Ya está anotado en ARQUITECTURA |

### 11.8 — Las perillas, y cuál mover primero

Todas en `src/data/tuning.js`, en sus dos bloques (`CAZA_*` y `PURS_*`), cada una con su porqué
escrito al lado. Las que más mueven la aguja:

| si el playtest dice… | mover |
|---|---|
| "el Harrier me mata sin que pueda hacer nada" | `CAZA_SOL_AVISO` ↑ (avisa antes) · `CAZA_SOL_T` ↑ (madura más lento) |
| "volar a ras no me salva lo suficiente" | el factor `0.12` de `stepSolucion` (no es perilla todavía: **si se toca, hacerlo perilla**) |
| "nunca lo puedo ahuyentar" | `CAZA_HP.ahuyenta` ↓ · `CAZA_WINDOW` ↑ |
| "el sobrepaso no impresiona" | `CAZA_OVER_T` y la curva `f^2.2` de `stepPos` — la **curva importa más que la duración** (H1.1) |
| "seguir al líder es un paseo" | `PURS_V_AMP` ↑ · `PURS_TIRON_T` ↓ (más tirones) |
| "el tirón es injusto / no llego nunca" | `PURS_TIRON_AVISO` ↑ (avisa antes) · `PURS_TIRON_F` ↓ (corre menos) · `PURS_TIRON_DUR` ↓ |
| "no entiendo si me estoy yendo o volviendo" | `PURS_CIERRE_MAX` ↓ (el riel reacciona antes) · `PURS_CIERRE_S` ↑ (menos temblor) |
| "la formación es aburrida / imposible" | `PURS_V_AMP` — es **la** perilla del modo |
| "el modo infinito se pone difícil muy rápido / muy lento" | `PURS_TIGHT_D` |
