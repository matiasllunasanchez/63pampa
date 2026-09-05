# PROMPTS POR MANIOBRA — el catálogo acrobático, triado para RASANTE

> **Qué es:** un prompt pegable por maniobra, a partir de dos láminas que pasó Matías
> (16/8): la de seis clásicas (Flat Spin · Kvochur's Bell · Hammerhead · Pugachev's Cobra ·
> Immelman · Ranversman) y la **tarjeta de vuelo del F-22 Demo Team** (Pullup/Backflip/
> Aileron Roll · 360° Min Radius Turn · Cobra J-Turn · Weapons Bay Pass & Roll · Dedication
> Pass · Pedal Turn · Loaded Roll & Power Loop · Tail Slide · Slow Speed Pass · Split-S ·
> Hoover Pitch).
>
> **Revisado contra el código (16/8):** de las 17, **9 ya existen o están cubiertas** y no
> llevan prompt (§1). Quedan **8 prompts** (§2).
>
> **Regla de las TRES PRESENTACIONES (16/8, Matías):** toda maniobra del jugador/amigo se
> diseña una vez (sus beats) y se entrega en tres formas — **poder del jugador** (combo →
> `moves.js`, como hoy), **actor amigo in-game** (un Fiel entra de costado o de atrás y la
> ejecuta — verbo `actor` del director) y **cabina** (1ª persona sobre los mismos beats).
> Está exigido en el paso 4 de PROMPT_MANIOBRA.md, así que **los prompts de abajo la
> heredan sin cambios**. Las de enemigo/muerte (VIFF, pedal, caída, barrena) quedan
> exceptuadas por naturaleza y sus prompts ya lo dicen.
>
> **La IMPLEMENTACIÓN de todas vive en [PLAN_MANIOBRAS_FASES.md](PLAN_MANIOBRAS_FASES.md)**
> (cimientos M0–M2 + una maniobra por fase). Estos prompts quedan para las sesiones de
> DISEÑO individuales; el programa los usa como "diseño exprés" cuando el plan no existe.
>
> **Cómo se usa:** cada prompt es autosuficiente y **delega el procedimiento** a
> [PROMPT_MANIOBRA.md](PROMPT_MANIOBRA.md) — la IA lee ahí los pasos (leer el repo, canon,
> diseño, arte, entrega) y acá recibe la FICHA de la maniobra (lo que el diagrama muestra),
> que reemplaza al video. Si además pegás un link, la IA aplica el paso 2 (cuadro por cuadro)
> con él. Una maniobra por sesión; Opus medio alcanza.

## 0. El triage *(lo que cambia el destino de cada una)*

La regla de canon que ordena todo: **el A-4B no tiene toberas vectoriales ni vuelo
post-pérdida controlado.** Lo que exige eso NO es del jugador — pero **sí es del Harrier**:
el Sea Harrier podía vectorizar en vuelo (VIFF) para hacer que un perseguidor se pasara de
largo. Las maniobras "imposibles" van al enemigo o a cinemática, no al catálogo del jugador.

| maniobra | ¿el A-4 puede? | destino sugerido | ¿ya existe? |
|---|---|---|---|
| **Immelmann** (medio loop + medio tonel: revierte rumbo ganando altura) | sí | pirueta jugable — el re-encare HACIA ARRIBA; el chandelle de la PASADA (RF-09) | no |
| **Hammerhead** (vertical, pivote en el vértice, caída vertical) | sí | es el pariente honesto de LA VOLTERETA — **ya está en [PLAN_PIRUETA_VOLTERETA](PLAN_PIRUETA_VOLTERETA.md) §2**; cualquier refinamiento va ahí, no a un plan nuevo | **cubierta — sin prompt** |
| **Ranversman** (wingover: subida en viraje, revierte en el tope, baja) | sí | es el RE-ENCARE de la PASADA, y **ya está implementado** (`systems/pasada.js`: `reHigh` = chandelle por arriba / viraje lateral por abajo, RF-09) | **existe — sin prompt** |
| **Power Loop** (loop completo) | sí (con energía) | pirueta de premio (PULSO) + cinemática; "EL RULO" | no |
| **Loaded Roll** (tonel BAJO G, rolando mientras tira) | sí | un tonel con trayectoria en hélice = el **TONEL BARRIL** (`barrel`, con `drift` de campana) | **existe — sin prompt** |
| **Aileron Roll** | sí | es el **TONEL** (la pirueta original; desde el 4/9 en `MOVES`) | **existe — sin prompt** |
| **Split-S** | sí | `splits` en el catálogo | **existe — sin prompt** |
| **360° Min Radius Turn** (viraje cerrado completo) | sí | en el PASILLO es imposible (el carril avanza: no hay vuelta de 360°); en 3D **ya existe** como la MEDIA VUELTA del ARENA (`[R]`, viraje de combate) y el re-encare de la PASADA; el BREAK TURN es su versión de pasillo | **existe — sin prompt** |
| **Slow Speed Pass** (pasada al borde de la pérdida) | sí | no es pirueta, es un ESTADO de vuelo — y **ya existe** donde importa: LA CHANCHA (conectado a la canasta se vuela en formación, `flight.js`) y PERSECUCIÓN (mantener banda con el líder) | **existe — sin prompt** |
| **Dedication Pass** (pasada de homenaje, baja y lenta, con batido de alas) | sí | **cinemática de m8 «El batir de alas» — el sobrevuelo**: es literalmente la pasada de homenaje del guion | no |
| **Pugachev's Cobra / Cobra J-Turn** (cabeceo a 90°+ sin subir, y vuelta) | **no** (post-pérdida) | **del HARRIER**: su VIFF en LA COLA — la jugada con la que te hace pasar de largo | no |
| **Pedal Turn** (pivote de guiñada a velocidad casi nula) | no | del Harrier (VIFF lateral) / cinemática | no |
| **Tail Slide** (vertical hasta cero, resbala de cola, cae la trompa) | no (como maniobra controlada) | **cinemática**: la pérdida de sustentación — el planeo sin nafta del Final B, el avión que se queda sin motor | no |
| **Kvochur's Bell** (tail slide con la trompa cayendo como badajo) | no | ídem: cinemática de caída/avería | no |
| **Hoover Pitch** (cabeceo súbito a la vertical con rolido, a baja velocidad) | no | Harrier / cinemática — **identificación a confirmar** por la IA | no |
| **Flat Spin** (barrena plana: pérdida de control) | es un ACCIDENTE, no una maniobra | **la muerte/avería**: el derribo en barrena plana como receta de `despiece` del jugador o del Harrier ahuyentado | parcial (tirabuzón) |
| **Weapons Bay Door Pass** | sin bahía en el A-4 | **descartada** — su equivalente es la ristra a la vista en EL PULSO | — |

## 1. Lo que NO tiene prompt, y por qué *(revisado contra `data/moves.js`, `arena.js` y `pasada.js`)*

| maniobra | dónde vive ya |
|---|---|
| Aileron Roll | **TONEL** — la pirueta original del juego |
| Loaded Roll | **TONEL BARRIL** — rolido con trayectoria en hélice (`drift` de campana) |
| Split-S | **SPLIT-S** (`splits`) |
| 360° Min Radius Turn | **MEDIA VUELTA del ARENA** (`[R]`) + re-encares de la PASADA; en pasillo, el BREAK TURN |
| Ranversman / wingover | **los re-encares de la PASADA** (RF-09, implementados: chandelle por arriba y lateral por abajo) |
| Slow Speed Pass | **LA CHANCHA** (vuelo en formación tras la canasta) y **PERSECUCIÓN** |
| Hammerhead | **LA VOLTERETA** (plan hecho; es su pariente honesto, §2 de ese plan) |
| Weapons Bay Door Pass | descartada: sin bahía en el A-4; la ristra a la vista ya la muestra EL PULSO |
| Backflip (F-22) | **LA VOLTERETA** — estudiada del reel |

## 2. Los prompts *(solo las que faltan — copiar uno, pegar, mandar)*

### IMMELMANN
> Vas a estudiar la maniobra **IMMELMANN** y planificar su entrada a RASANTE. Seguí el procedimiento de `docs/sistemas/PROMPT_MANIOBRA.md` (pasos 1, 3, 4, 5 y 6); el paso 2 se reemplaza por esta ficha, salvo que yo pegue un link (entonces aplicalo). **Ficha:** medio loop hacia arriba (el avión sube describiendo media circunferencia hasta quedar invertido en el tope, rumbo opuesto) seguido de medio tonel para volver a vuelo derecho: sale a MÁS altura y en sentido CONTRARIO al de entrada. Un A-4 lo hace con energía de sobra (licencia arcade: cuánto cuesta). **Pistas:** es el "re-encare hacia arriba" — enganchalo con el chandelle de la PASADA (SPEC_MODO_PASADA RF-09: mismo lado, más nafta, te asomás al Sea Dart) y como contraataque contra LA COLA (`CAZA_MV_FUERZA`); proponé dos combos válidos. Entregá `docs/sistemas/PLAN_PIRUETA_IMMELMANN.md` con el modelo de la VOLTERETA.

### POWER LOOP — «EL RULO»
> Vas a estudiar la maniobra **LOOP (power loop)** y planificar su entrada a RASANTE. Seguí `docs/sistemas/PROMPT_MANIOBRA.md` (pasos 1, 3, 4, 5, 6); el paso 2 se reemplaza por esta ficha, salvo link. **Ficha:** circunferencia vertical completa: tirón hacia arriba, invertido en el tope, caída y recuperación en el mismo rumbo y altura de entrada; con motor a fondo el radio se achica ("power"). Un A-4 lo hace (los Blue Angels lo hacían). **Pistas:** sirve como pirueta cara (el precio es tiempo y altura, no velocidad) y sobre todo como **cinemática de premio de EL PULSO** (PLAN_EL_PULSO §3) — la firma del cierre de misión; contemplá que en 2D la cámara trasera solo ve cabeceo: definí frames y placeholder como en la VOLTERETA. Entregá `docs/sistemas/PLAN_PIRUETA_RULO.md`.

### DEDICATION PASS — el sobrevuelo de homenaje *(m8, «El batir de alas»)*
> Vas a estudiar la **PASADA DE HOMENAJE (dedication pass)** y planificar su entrada a RASANTE como CINEMÁTICA. Seguí `docs/sistemas/PROMPT_MANIOBRA.md` (pasos 1, 3, 4, 5, 6) y `docs/sistemas/PLAN_DIRECTOR_CINEMATICAS.md`; el paso 2 se reemplaza por esta ficha, salvo link. **Ficha:** pasada baja, lenta y recta frente al público, con **batido de alas** (rolidos cortos alternados: el saludo del piloto) y a veces un ascenso final. **Pistas:** es literalmente el sobrevuelo de la misión 8 del guion, «El batir de alas» (leé GUION_3 M8): el escuadrón sobrevolando y saludando — diseñala como timeline del director (actores = los Fieles con trayectoria, el batido como verbo `move` corto) y evaluá la variante "casi-cinemática": el jugador hace el batido con Q/E. Entregá `docs/sistemas/PLAN_CINE_BATIR_DE_ALAS.md`.

### PUGACHEV'S COBRA / COBRA J-TURN — la jugada del HARRIER
> Vas a estudiar la **COBRA de Pugachev** y su variante **J-TURN** y planificar su entrada a RASANTE **como maniobra del ENEMIGO**, no del jugador. Seguí `docs/sistemas/PROMPT_MANIOBRA.md` (pasos 1, 3, 4, 5, 6) y `docs/sistemas/PLAN_HARRIERS_PERSECUCION.md`; el paso 2 se reemplaza por esta ficha, salvo link. **Ficha:** cabeceo súbito hasta 90–120° SIN ganar altura (el avión "se sienta" frenando de golpe) y vuelta al vuelo nivelado; en la J-Turn, al sentarse además gira y sale en rumbo opuesto. Exige vuelo post-pérdida: **el A-4 no puede**. **Pistas:** el Sea Harrier sí tenía su versión — el VIFF (vectorizar las toberas en vuelo para frenar y hacer que el perseguidor se pase de largo; su uso real en el 82 va a PREGUNTAS_HISTORICAS). Diseñala como la contra del Harrier en LA COLA: cuando vos ganás la ventana, él "se sienta", vos te pasás de largo y te recola — la ventana tiene un precio. Entregá `docs/sistemas/PLAN_HARRIER_VIFF.md`.

### PEDAL TURN
> Vas a estudiar la maniobra **PEDAL TURN** y planificar su entrada a RASANTE como maniobra del HARRIER o como cinemática. Seguí `docs/sistemas/PROMPT_MANIOBRA.md` (pasos 1, 3, 4, 5, 6); el paso 2 se reemplaza por esta ficha, salvo link. **Ficha:** a velocidad casi nula y trompa alta, el avión pivota en guiñada (como un helicóptero sobre su eje) y sale apuntando a otro rumbo; es post-pérdida con vectorización. **Pistas:** el A-4 no puede; evaluá si es la versión LATERAL del VIFF del Harrier (PLAN_HARRIER_VIFF, si existe) o si solo vale como cinemática; si no suma nada distinto a la Cobra, decilo y cerrá con una nota en vez de un plan. Entregá `docs/sistemas/PLAN_PIRUETA_PEDAL_TURN.md` o la nota.

### TAIL SLIDE / KVOCHUR'S BELL — la caída
> Vas a estudiar las maniobras **TAIL SLIDE** y **KVOCHUR'S BELL** (la campana) y planificar su entrada a RASANTE como CINEMÁTICA. Seguí `docs/sistemas/PROMPT_MANIOBRA.md` (pasos 1, 3, 4, 5, 6) y `PLAN_DIRECTOR_CINEMATICAS.md`; el paso 2 se reemplaza por esta ficha, salvo link. **Ficha:** subida vertical hasta velocidad cero; el avión RESBALA hacia atrás de cola unos metros y la trompa cae (en la campana, oscila como un badajo antes de caer) hasta retomar vuelo picando. Es un momento de ingravidez seguido de caída. **Pistas:** para el A-4 no es una pirueta: es **lo que pasa cuando se acaba la energía** — diseñala como el beat cinemático de la pérdida de sustentación (el planeo sin nafta del Final B, el motor que se apaga, la avería crítica) con control limitado del jugador (`control: 'solo_mirar'`). Entregá `docs/sistemas/PLAN_CINE_CAIDA.md`.

### HOOVER PITCH *(identificación a confirmar)*
> Vas a estudiar la maniobra **HOOVER PITCH** de la tarjeta del F-22 Demo Team y planificar su entrada a RASANTE. Seguí `docs/sistemas/PROMPT_MANIOBRA.md` (pasos 1, 3, 4, 5, 6); el paso 2 se reemplaza por esta ficha, salvo link. **Ficha (incompleta a propósito):** en la tarjeta aparece como un cabeceo súbito hacia la vertical a baja velocidad, seguido de un rolido/recuperación; el nombre remite a Bob Hoover. **Primero identificala con certeza** (buscá la descripción oficial de la demo; si no hay fuente clara, decilo y marcá la incertidumbre) y recién después aplicá el canon: si es post-pérdida, va al Harrier o a cinemática; si es un pitch-up convencional, compará con el POP-UP existente. Entregá `docs/sistemas/PLAN_PIRUETA_HOOVER.md` o una nota si se absorbe.

### FLAT SPIN — la barrena como muerte
> Vas a estudiar la **BARRENA PLANA (flat spin)** y planificar su entrada a RASANTE **como receta de muerte/avería**, no como pirueta. Seguí `docs/sistemas/PROMPT_MANIOBRA.md` (pasos 1, 3, 4, 5, 6) y `docs/sistemas/PLAN_DESTRUCCION.md` (el despiece y sus recetas en `data/despiece.js`); el paso 2 se reemplaza por esta ficha, salvo link. **Ficha:** pérdida de control: el avión gira sobre su eje vertical con el morro casi horizontal, cayendo como una hoja, sin sustentación; salir de ella exige altura y técnica, y en el A-4 cargado a ras no hay margen. **Pistas:** diseñala como variante del derribo del jugador (receta `plane` del despiece: girar plano cayendo antes de romperse — la muerte por avería crítica o por tocar el Harrier) y como la huida del Harrier ahuyentado (se va en barrena humeando); compará con el TIRABUZÓN existente para no duplicar. Entregá `docs/sistemas/PLAN_MUERTE_BARRENA.md`.


## 3. Orden sugerido *(por rendimiento para el juego)*

1. **COBRA/VIFF del Harrier** — le da a LA COLA su contra y cierra el ciclo del duelo.
2. **DEDICATION PASS** — resuelve una escena del guion (m8) con el director.
3. **IMMELMANN** — el único re-encare que falta como pirueta de pasillo (medio loop + medio tonel).
4. **EL RULO** — el premio del PULSO.
5. **TAIL SLIDE/CAMPANA** (la caída del Final B) y **BARRENA** (la muerte con carácter).
6. Si sobra: Pedal Turn (probablemente se absorbe en el VIFF) y Hoover Pitch (identificar primero).
