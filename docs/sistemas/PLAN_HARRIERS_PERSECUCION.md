# PLAN — Los Harrier en la cola (estilo After Burner) + el modo PERSECUCIÓN

> **Estado: diseño aprobado en charla (16/8), sin implementar.** Tres planes por fases:
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
| **H0** | Cimiento: `systems/caza.js` (estado local del duelo, señales `{death}`, nunca llama arriba) + perillas `CAZA_*` en `data/tuning.js` + sonda `?caza` / `__czdbg()` + strings es/en | se entra al duelo por sonda; `check` verde |
| **H1** | **El pase fantasma** (SIN daño): la coreografía entera legible — trazadoras que pasan, sobrepaso con sprite grande + doppler + shake, ventana frontal, salida. Arte: placeholder del jet actual escalado/oscurecido para la cola a cámara (la hoja real es de producción) | mirada muda: se entiende el ciclo sin leer nada |
| **H2** | **La presión con dientes**: modelo de solución de tiro (madura con rumbo predecible, se resetea con quiebres, **degradada a ras** — perilla `CAZA_RAS_ALT = 4.5`, la banda del ×10), ráfagas con daño → averías/relevo/muerte (`death_caza`) | fixture: recto te alcanza; quebrando sobrevivís; a ras casi no progresa |
| **H3** | **El contraataque**: ventana frontal tirable, ahuyentado por impactos (humo + huida + puntos), derribo raro (`CAZA_HP` alto), combos BREAK/JINK/S-TURN fuerzan sobrepaso (gate: en campaña solo si están aprendidas), MOMENTUM interactúa gratis (escala dt) | fixture: ahuyentar suma; derribar es hazaña; el combo corta la presión |
| **H4** | **Reglamento**: aparición por misión (`caza` en `missions.js` como dato — intensidad 0..2; m1=0), 1 duelo a la vez, reloj CAP, aviso-o-silencio según canon, sin duelos dentro de la niebla ciega ni durante ARENA/PASADA, puntaje | en m2 aparece UNA vez scripted; en PATRIA cada tanto; jamás en m1 |
| **H5** | Legibilidad + audio + arte real: hoja del caza desde atrás + poses de viraje cuando salgan de producción; alarma/luz ya existentes conectadas; fixture `npm run caza` completo | gate total + capturas |

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
| **N0** | **El líder**: avión amigo autopiloto sobre el pasillo (reusar la formación/autopiloto del relevo y el despegue — `systems/squad.js` + `render/squad.js` ya vuelan Fieles). El spawner CONOCE su línea: nada de lo que siembra la cruza — el líder nunca choca | el líder vuela solo un nivel entero, esquivando, creíble |
| **N1** | **La cinta de formación**: métrica de distancia (su velocidad varía: mantenerse = dosificar turbo y gas), HUD con la banda (cinta vertical estilo instrumento, no números), gracia `PURS_GRACE 4` s fuera de banda con aviso por radio (`"¡Cerrá, {indicativo}!"` / `"Te me vas encima."`), jet wash bajo `D_MIN` | jugable: mantenerse en banda es un minijuego de gas, tenso y justo |
| **N2** | **El modo de menú** PERSECUCIÓN: infinito, la banda se angosta con la distancia, el líder rota entre los Fieles (indicativos + radio con personalidad). ⚠ El menú ya tiene 6 filas con `MODE_ROWS {y0:78, rh:31}` — la 7ª pide reapretar (rh ~27) o paginar: decisión chica de layout | el modo encadena y puntúa (tiempo en banda × multiplicador de altura) |
| **N3** | **Campaña**: m10 «LOS PRIMOS» usa el sistema — **los Mirage peruanos EN PANTALLA como líderes** (resuelve el pendiente explícito de PLAN_CAMPANA_001 §6: hoy son solo texto). Opcional: tramo tutorial de m1 siguiendo a Puma ("pegado al agua, Tero") | m10 deja de ser una misión de distancia pelada |
| **N4** | *(anotada, NO construir)* la variante ofensiva: perseguir a un enemigo que huye manteniéndolo en rango de cañón — comparte toda la infraestructura; candidata a misión de reconocimiento futura | — |

**Perillas:** `PURS_D = [60, 140]` banda inicial · `PURS_GRACE 4` s · `PURS_WASH_D 25` ·
apretado del modo infinito: −8% de banda por nivel, piso 45–90.

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
