# PASADA — Análisis de adrenalina y PLAN DE RESCATE

> ⏸️ **EN PAUSA (18/8/2026):** por DIRECCIÓN (`docs/proyecto/ESTADO.md`) el gate R6 se resuelve hacia el plan C — **EL PULSO es el clímax del nivel**; la PASADA queda candidata a archivo. R1–R5 no se ejecutan salvo que la PASADA vuelva a considerarse.

> **Estado: análisis hecho sobre el código construido (16/8) + plan de mejoras por fases,
> sin implementar.** Origen: playtest de Matías — *"no genera adrenalina… los misiles te
> matan sin verlos, sin sonido, vienen de frente… el barco está de costado en el pasillo y
> de frente y más lejos en la pasada… si no mejora, PASILLO queda como único modo"*.
> Ese ultimátum es la condición de éxito de este plan, y está integrado como fase final
> (R6): **si después del rescate el playtest no cambia, la PASADA se archiva.**
>
> Manda sobre P4/P7 del [SPEC_MODO_PASADA.md](SPEC_MODO_PASADA.md): **el rescate corre
> ANTES de seguir agregando sistemas.** No tiene sentido construir la oleada encima de un
> núcleo que no emociona.

## 1. Los hechos *(medidos en el código, no impresiones)*

### 1.1 El misil asesino — el playtest tiene razón, y es matemática

- `DART_V = 250 m/s`. El jugador ingresa DE FRENTE al buque a ~110 m/s → **velocidad de
  cierre 360 m/s**. Lanzado a ~1100 m: **~3 segundos** de vida para reaccionar.
- El telégrafo completo es: UN popup de texto (en la misma posición donde salen todos los
  popups) + UN sonido one-shot al lanzar (`mslFar`, con fallback a un beep). **No hay
  audio continuo** — nada suena mientras el misil viaja.
- El render: un punto de **3×3 px** titilante con una estela-línea de 90 m… que DE FRENTE
  se proyecta escorzada a casi nada. Un misil de frente no tiene movimiento angular: es
  un punto que crece. En 480×270, contra el mar, es **invisible por diseño**.
- Se lanza EXACTO al cruzar el techo de radar — sin fase de "te está fijando", sin gracia.

**Conclusión: la muerte por Sea Dart es hoy una muerte sin lectura.** Viola la regla del
propio spec ("cada capa se aprende muriendo UNA vez" — no se aprende de lo que no se ve).

### 1.2 La ruptura de continuidad — el buque se teletransporta

- El final del PASILLO dibuja la aproximación con `drawBargeHull`: **el casco LATERAL del
  momentum viejo** (de costado), creciendo hasta `0.82 × W` — media pantalla de buque de
  perfil, con nombre encima.
- La PASADA entra **sobre la eslora** (`yaw = π/2`) a `ENTRY_D = 1280 m`: el buque aparece
  **de proa** (silueta angosta) y **chico**.
- El comentario del código lo confiesa: *"el pase al clímax es un corte de cámara… no hay
  continuidad de posición que preservar"* — se escribió cuando el clímax era el ARENA.
  La PASADA prometía lo contrario (principio P2 del spec: "sin corte") y cumplió a
  medias: conservó altura y velocidad DEL AVIÓN, pero **teletransportó AL MUNDO** —
  giro de 90° de rumbo aparente + salto de distancia. Exactamente lo que describís.

### 1.3 El tiempo muerto — la adrenalina no aparece porque no hay densidad

Línea de tiempo de una corrida hoy: ingreso de **1280 m a ~110 m/s = 11.6 s de mar vacío**
→ ventana de suelta de **1.2 s** (medida en §10.23 del spec) → sobrevuelo → re-encare de
15–25 s. Amenazas por corrida: 1 salva de cañón cada varios segundos + 1 Dart + 1 Sea Cat.
El PASILLO te tira algo cada 1–2 segundos y **por eso** es "INFINITAMENTE MEJOR": su
adrenalina es densidad y cercanía. La PASADA es geometría con esperas.

### 1.4 El silencio — P5 quedó a medias y el sonido es la mitad de la adrenalina

Sin capas de motor/viento, sin el BOOM lejano del cañón, sin splash con cuerpo, sin whine
de misil, sin el silencio-del-ras diseñado. Un modo mudo no acelera el corazón.

### 1.5 El fuego no tiene autor

El buque placeholder no FOGONEA al disparar: las columnas y los misiles aparecen "de la
nada". Amenaza sin autor visible = arbitrariedad, no peligro.

## 2. El diagnóstico *(tres causas raíz, no veinte síntomas)*

1. **La PASADA heredó el ESPACIO del ARENA pero no puso nada adentro**: mar abierto y
   eventos estadísticos espaciados. La adrenalina del juego vive en densidad + cercanía.
2. **Las amenazas matan por matemática, no por teatro**: sin firma sensorial (verse,
   oírse, casi-rozarte), la dificultad se percibe como injusticia.
3. **La transición promete un vuelo continuo y entrega un teleport del mundo.**

## 3. EL PLAN DE RESCATE — fases R0–R6

> Regla madre de todo el plan: **la adrenalina se sube con DENSIDAD y TEATRO, jamás con
> letalidad.** Ningún R sube daño ni agrega muertes nuevas — sube lo que se VE, se OYE y
> se ROZA. El conteo letal queda igual (1 Dart + 1 Cat por corrida).

| fase | entrega | criterio de cierre (medible) |
|---|---|---|
| **R0 · La vara** | Sondas de medición en `__pdbg`: TTI real del Dart al impactar, log de "amenazas visibles en pantalla" por segundo, y captura baseline de una corrida entera (video/frames). Sin esto el rescate no se puede demostrar | los números del §1 reproducidos por sonda |
| **R1 · El misil justo** | El lanzamiento es un EVENTO: fogonazo en cubierta + **fase de ascenso vertical ~1 s** (el Sea Dart real trepaba y recién ahí picaba — y silueteado contra el CIELO gana el movimiento angular que de frente no tiene) + **soga de humo persistente** (~2 s de vida, 2–3 px — la lección After Burner: se esquiva la soga, no el punto) + **whine continuo** con ganancia por cercanía + grito de radio. Reglas: `DART_TTI_MIN = 4.5 s` (si impactaría antes, no se lanza), **jamás durante la ventana de suelta** (las amenazas se intercalan, no se apilan), esquive = quiebre sostenido 1.2 s y la soga pasa de largo VISIBLE | fixture: quieto, morís habiendo visto y oído el misil ≥3.5 s antes; quebrando, sobrevivís SIEMPRE; el humo del esquive se ve pasar |
| **R2 · La densidad** | `ENTRY_D 1280 → 700` (ingreso ~6 s). El cañón abre a los **1.5 s** con salvas de **HORQUILLA** (caen adelante/atrás tuyo acercándose — es cómo se rangea de verdad: espectáculo inmediato sin muerte injusta). **LAS MANGUERAS DE TRAZADORAS**: 1–2 chorros curvos de Bofors/Oerlikon barriendo el cielo, visibles y audibles, que hay que cruzar o esquivar — el obstáculo del pasillo traducido a la pasada, y la imagen más icónica de San Carlos. **Near-miss premiado**: pasar cerca de columna/manguera = shake + chasquido + puntos (reusar el graze del pasillo) | sonda: durante la corrida nunca pasan >4 s sin una amenaza VISIBLE en pantalla; el near-miss suma y se siente |
| **R3 · La continuidad** | El final del pasillo muestra al buque **DE PROA** (silueta angosta + columna de humo — no más el casco lateral del momentum para esta aproximación) y el handoff **calza el tamaño aparente**: al cortar, la proa 3D ocupa los mismos píxeles (ENTRY_D 700 lo acerca) y hereda el offset lateral del carril. Se borra el comentario "no hay continuidad que preservar" | video del handoff: un espectador NO señala el frame del corte — la promesa P2, ahora en serio |
| **R4 · El sonido completo** | Las capas que faltan (el resto de P5): motor/viento por velocidad, **BOOM del cañón con retardo por distancia** (el trueno llega tarde — física gratis que vende lejanía), splash con cuerpo, whip de trazadoras al pasar cerca, el whine de R1, y **el silencio del ras** (bajás a la banda y el mundo se apaga salvo tu motor — la recompensa se escucha) | mirada CIEGA: se puede seguir una corrida solo por el audio |
| **R5 · El punch** | Impacto de bomba: zoom-punch de cámara (sin congelar el mundo) + onda + columna + shake grande. Flyover del mástil: whoosh + sacudida. **Fogonazos EN el buque** en cada disparo (aunque siga siendo placeholder: el fuego tiene autor y dirección) | captura del impacto que se sienta FINAL; cada amenaza traza al buque |
| **R6 · El gate de la verdad** | Playtest de Matías con tres preguntas: (1) ¿se te aceleró el corazón en la corrida 2? (2) ¿cada muerte la entendiste 1 s antes? (3) ¿la entrada se sintió un mismo vuelo? **Si alguna da NO, se itera UNA vez sobre la perilla que falló; si vuelve a dar NO, se ejecuta el ultimátum**: la PASADA se archiva (como el momentum viejo) y el clímax pasa a ser **EL PULSO** ([PLAN_EL_PULSO.md](PLAN_EL_PULSO.md)) — el juego queda PASILLO + prueba de destreza final | la decisión queda tomada y documentada acá |

**Perillas nuevas** (en `data/pasada.js`): `DART_RISE_T 1.0` · `DART_TTI_MIN 4.5` ·
`DART_SMOKE_LIFE 2.0` · `GUN_FIRST_S 1.5` · `GUN_BRACKET 2` (salvas de horquilla antes de
tirar a matar) · `HOSE_N 2` · `HOSE_SWEEP_S 3.5` · `NEARMISS_R 14` · `ENTRY_D 700`.

## 4. Qué NO hacer en el rescate

1. **No subir daño ni letalidad** para "más adrenalina" — la regla madre.
2. **No agregar sistemas nuevos** (ni oleada P7, ni re-encares nuevos) hasta pasar R6:
   primero que el núcleo emocione, después crecer.
3. **No tocar la física del vuelo** (feeltest idéntico) ni el reglamento de bandas/ristra
   (eso YA funciona — §10 del spec lo midió).
4. **No lock-on ni RWR** — el canon sigue: los avisos son el mundo y la radio.
5. **No estirar corridas** para meter más eventos: la corrida CORTA y densa es el diseño.

## 5. Relación con los otros planes

- **T7 (el buque 3D por clase)** multiplica todo esto pero NO es prerequisito: los
  fogonazos de R5 funcionan sobre el placeholder. Hacerlo después del rescate.
- La **oleada (P7)** y los dos re-encares finos (P4) quedan CONGELADOS hasta R6 verde.
- Las **mangueras de trazadoras** de R2 son primas de las columnas del agua (T3) y de las
  trazadoras que pasan de largo del plan Harrier — misma familia de lenguaje visual: el
  fuego enemigo siempre es un chorro legible en el espacio, nunca un dado invisible.

## 6. Divergencias del rescate *(completar durante la implementación)*

### R0 — la vara (16/8/2026) · **cerrada**

**El baseline, medido en vuelo y no en papel.** `__pdbg` suma `amen` (amenazas visibles ahora),
`gap`/`gapMax` (segundos seguidos sin nada delante del morro) y el reloj del Dart; `__pvara()`
reinicia la cuenta y `__pdart()` la lee. Lo medido reproduce el §1:

| medida | baseline | fuente |
|---|---|---|
| peor hueco sin NADA visible | **6,1 s** | §1.3 decía "11,6 s de mar vacío" en el ingreso |
| media de amenazas en pantalla | **0,34** | — |
| vida desde el lanzamiento del Dart | **3,27 s** (predicho 3,34) | §1.1 lo calculaba en ~3 s |

R0.1. **`amenazasVisibles()` usa el MISMO criterio que el render** (`adelante`, margen de 45 m). La
vara tiene que medir lo que el jugador *puede ver*, no lo que existe en el mundo; si el render
cambia de regla, ésta cambia con él o la medición empieza a mentir en silencio.

R0.2. **El TTI del Dart vive a nivel de MÓDULO, no en la instancia.** El impacto que se quiere medir
es justamente el que destruye la instancia: guardado en `A`, el número se perdía con el avión y la
sonda leía `null`. Es el caso borde clásico de medir una muerte — el medidor no puede morirse con
el medido.

R0.3. **El baseline es un número HISTÓRICO, no una aserción viva.** La primera versión afirmaba "el
Dart da menos de 4,5 s" para probar que el §1.1 se reproducía… y se rompió en cuanto R1 empezó a
funcionar. Ahora la vara compara contra el número anotado (3,27 s) y exige *mejora*. Congelar el
mundo viejo en una prueba es garantizar que el rescate la rompa.

### R1 — el misil justo (16/8/2026) · **cerrada**

**Criterios de cierre, medidos:** quieto, **4,84 s** de vida desde el lanzamiento (baseline 3,27) ·
quebrando, **3/3 esquives sobrevividos** · la soga del esquive pasando de largo, en `r1_soga.png`.

R1.1. **Ningún cambio sube daño.** El Dart pega lo mismo que antes. Lo que cambió es que ahora *se
ve* (asciende ~1 s contra el cielo, donde un misil de frente por fin tiene movimiento angular), *se
oye* (whine continuo con tono y ganancia por cercanía), *tiene autor* (fogonazo en cubierta) y
*deja rastro* (soga de humo de 2 s). Regla madre respetada.

R1.2. **`DART_TTI_MIN` es un GATE de lanzamiento, y tiene una consecuencia geométrica.** Con cierre
de ~360 m/s, exigir 4,5 s implica lanzar sólo desde ~1.260 m. El misil pasa a ser *de largo alcance
de verdad*: aparece cuando venís lejos y alto, y no cuando ya estás encima. **Ojo con R2**: bajar
`ENTRY_D` a 700 dejaría al Dart sin distancia para existir en la corrida. Al llegar a R2 hay que
decidir entre lanzar desde fuera del ingreso o bajar `DART_V` — **no** bajar `DART_TTI_MIN`, que es
la regla que arregló la muerte sin lectura.

R1.3. **El esquive se unificó con el del Sea Cat** (mismo ángulo `CAT_BREAK`, misma ventana
`SEACAT_DODGE_S`): un quiebre sostenido sirve contra las dos cosas. Se aprende UNA maniobra, no dos.
Perdido el enganche el misil sigue **derecho** en vez de desaparecer — y esa soga pasando de largo
es la prueba visible de que lo hiciste bien.

R1.5. **La soga NO quedó demostrada en captura, y el motivo es estructural.** Los dos criterios
medibles cierran; el tercero (*"el humo del esquive se ve pasar"*) no lo pude probar en una imagen.
Al quebrar sostenido, el misil termina **detrás del morro**, y el culling del render —que existe
porque `project()` devuelve coordenadas dadas vuelta para lo que quedó atrás (§10.52 del spec)— lo
descarta. Bajar el margen para el humo (45 → 6 m) y pintarlo oscuro contra el cielo ayudó, pero no
alcanza: la parte de la soga que uno querría ver está, literalmente, a la espalda.

Lo que NO hay que hacer es aflojar el margen hasta que aparezca: eso trae de vuelta las columnas
flotando en el cielo. El arreglo correcto es darle al render una prueba real de *detrás de la
cámara* (proyectar con el signo de `w`, no con un producto escalar contra el morro) y ahí decidir
qué se dibuja fuera del cono de visión. **Queda como deuda de R1, anotada y no disimulada.**

### R2 — la densidad (16/8/2026) · **cerrada**

**Criterios de cierre, medidos:** el peor hueco sin nada visible pasó de **6,1 s a 0 s** (el criterio
del plan eran 4) · la media de amenazas en pantalla, de **0,34 a 1,36** · el roce se cobra, **2 por
corrida** · el cañón abre a los **1,5 s** · la horquilla encuadra a **96 m**, cierra a **58** y la
tercera salva cae **sobre la línea**.

| medida | baseline (pre-R2) | ahora |
|---|---|---|
| peor hueco sin NADA visible | 6,1 s | **0 s** |
| media de amenazas en pantalla | 0,34 | **1,36** |
| el cañón abre a los | 4,6 s | **1,5 s** |
| roces premiados por corrida | — | **2** |

R2.1. **`ENTRY_D` bajó de 1280 a 700, y eso saca al Sea Dart del ingreso.** Es la tensión que R1.2
había dejado anotada, resuelta por la opción que el propio plan dejaba abierta —*lanzar desde fuera
del ingreso*— y no bajando `DART_TTI_MIN`, que es la regla que arregló la muerte sin lectura. El
gate de R1 exige lanzar desde ~1.260 m y nunca dentro de `POPUP_DIST_M`: con la entrada a 700 el
misil de largo alcance pasa a castigar **la chandelle** (volver por arriba, lejos) en vez de la
entrada. Es coherente con lo que el techo de radar siempre dijo — castiga volar alto *lejos* del
buque— y baja el conteo letal del ingreso en vez de subirlo, que es la regla madre.

R2.2. **La horquilla es LATERAL, no corta/larga.** El plan la pedía cayendo "adelante/atrás tuyo".
Medido, eso no sirve por dos razones: las columnas cortas quedan **detrás del morro**, donde el
render las descarta y la vara no las cuenta —una horquilla que no se ve no es espectáculo— y las
largas caen justo sobre el tramo que vas a volar en los 0,55 s en que la columna es letal, o sea que
la salva de tanteo mataba. Corrida a un costado y al otro, la horquilla **se ve entera, adelante**,
y estructuralmente no puede tocarte. Se cierra por salva: 4 radios letales, 2,4, y la tercera sobre
la línea.

R2.3. **Las mangueras NO matan, y es la regla madre aplicada al pie de la letra.** El §3 las pide
"para cruzar o esquivar"; el §4.1 prohíbe subir la letalidad. Se resolvió haciéndolas puro teatro
más premio: cruzar un chorro suma (`NEARMISS_R`), sacude y suena, y no toca la integridad. El costo
de ir a buscarlas no hace falta inventarlo — está puesto desde antes: volar derecho para cruzar el
chorro es exactamente lo que le sirve al cañón para tomarte.

R2.4. **El chorro se apunta CON ADELANTO, a donde vas a estar a mitad del barrido.** Sin eso el
barrido cruzaba por detrás y por encima —medido: **cero roces**, o sea que la manguera era un
dibujo. Y las dos coordenadas tienen que cruzar en el MISMO instante: con el rumbo cruzando a mitad
del arco y la elevación a dos tercios, el chorro pasaba por tu bearing treinta metros más arriba.

R2.5. **Cada trazadora guarda la dirección con la que SALIÓ y viaja derecha.** La curva del chorro
es la suma de todas — que es como se curva una manguera de verdad: lo que se curva no es la
trayectoria de nadie, es el recorrido de la boca. Sale gratis y sale bien.

R2.6. **El roce se mide contra el RAYO vivo, no contra cada bala.** A 750 m/s una trazadora salta 12
metros por cuadro: un chequeo por punto se saltea el avión entero. Un solo test de distancia
punto-rayo por chorro y por cuadro, exacto y sin túnel.

R2.7. **La horquilla se prueba por GEOMETRÍA, no por supervivencia.** La primera versión de la
prueba volaba derecho y contaba si el avión llegaba vivo: dio 0/3, y ninguna de las tres muertes fue
del cañón — el morro se hunde solo, el Sea Cat sale arriba de la banda dulce y el casco está al
final del rumbo. Una prueba de supervivencia termina hablando de gravedad. `__pcols()` devuelve de
qué salva salió cada columna y cuánto se corrió del rumbo, que es lo que la horquilla *es*.

R2.8. **Dos sondas de P3 quedaron midiendo otra cosa al abrir el cañón antes**, y las dos se
arreglaron sin tocar una regla: la del "derecho te toma" perdía la cuenta porque la primera salva
ahora sale **antes** de que la sonda coloque el avión (y el teletransporte le borra la corrección),
así que arranca de cero y necesita ~6 s — que a 20 m de altura no existen. Subir la sonda a 90 m no
le cambia nada al cañón; solo le da tiempo a la medición.

R2.10. **La captura hay que elegirla, tercera vez.** La foto de las mangueras salió primero en la
pantalla de relevo (la corrida de medición termina contra el casco, a propósito) y después con el
chorro *punteado*: balas cada 52 m con estelas de 34 — más hueco que línea, o sea una raya fina
perdida en el borde. Densificado a `HOSE.EVERY 0.045` y con la cabeza de la trazadora más gorda
cuando pasa cerca, el chorro se lee. Queda dicho igual: en la captura el chorro barre **bajo, sobre
el mar**, no alto contra el cielo, y en ese instante el segundo chorro no está en cuadro. Los seis
criterios medibles cierran; el barrido alto es presentación y es de R5.

R2.9. **El baseline del hueco pasó a constante histórica, igual que el TTI (R0.3).** La aserción
"tiene que haber huecos de más de 4 s" —que probaba que el §1.3 se reproducía— se rompió en cuanto
R2 empezó a funcionar. Segunda vez que el mismo error aparece: **congelar el mundo viejo en una
prueba es garantizar que el rescate la rompa.** Queda anotado dos veces a propósito.

### R3 — la continuidad (20/8/2026) · **cerrada**

**Criterios de cierre, medidos:** tamaño aparente al cortar, **3%** de error (criterio ≤25%) · columna
en pantalla, **2,1 px** de salto (criterio ≤14 px) · distancia al entrar, **724 m** (criterio ≤900 m).

R3.1. **El buque se dibuja DE PROA al final del pasillo.** `drawBowApproach` reemplaza al casco
lateral del momentum para la aproximación: la última imagen del pasillo es la misma silueta angosta
que verás al entrar a la pasada. El cambio no es cosmético: el casco lateral medía medio ancho de
pantalla y la proa mide lo que mide — el salto de tamaño del corte era ese, no la distancia.

R3.2. **El desvío lateral se HEREDA del carril.** El último cuadro del pasillo muestra al buque
corrido `cam.x * LANE_PARALLAX` píxeles del centro; la pasada entra con esos píxeles traducidos a
metros (`pxPerM` a la distancia del corte). Sin esto el avión entraba centrado cuando el buque se
veía a la izquierda — el mismo teleport que se vino a arreglar, pero en el eje lateral. El tope
(`ENTRY_LAT_MAX = 90 m`) existe porque el carril es mucho más ancho que el cono de la corrida: sin
clampear, una entrada desde el borde dejaba al avión encarando al mar.

R3.3. **El desvío mostró 0 m en la prueba, y la prueba lo acepta.** El fixture coloca al avión con
la tecla derecha presionada, pero el carril del pasillo tiene inercia — un solo segundo de input no
genera desplazamiento visible en `cam.x`, que es lo que manda el paralaje. La aserción es
informativa (`ok()`), no un gate, porque lo que R3 pide es que el mecanismo *exista y calce*, no
que la sonda lo maximice: el handoff sin desvío es el caso trivial donde todo calza por definición.

### R4 — el sonido completo (21/8/2026) · **cerrada**

**Criterio de cierre:** mirada CIEGA — se puede seguir una corrida solo por el audio. Lo que ya
existía (motor por velocidad, ras que se escucha, whine del Dart, salpicado) se complementa con lo
que faltaba: el cañón con retardo y el chorro con whip.

R4.1. **El BOOM del cañón viaja a la velocidad del sonido.** A 700 m y 343 m/s son ~2 s de demora:
ves la columna subir y el trueno llega *después*. Es física gratis que vende lejanía — una salva
que suena inmediata parece estar al lado; una que tarda, parece un cañón de verdad disparando desde
un barco. Implementado con un efecto `snd` diferido en la lista de `fx`: se le da una `wait` igual
a `distancia / 343` y al cumplirse el retardo suena el mismo `boom(0.07, true)` + `exXsmall`.

R4.2. **El WHIP de la trazadora al pasar cerca.** El tableteo continuo del chorro (`chatT`) dice
"el chorro está ahí"; el whip dice "te ROZA". Se dispara cuando una trazadora pasa dentro de
`NEARMISS_R * 3` (pero fuera del radio de roce propiamente dicho): es un beep agudo de 2200→800 Hz,
cortísimo (0.06 s), que suena una sola vez por chorro. El roce real sigue sumando puntos y sacudida
aparte — el whip es el aviso temprano de que el chorro estuvo *cerca*.

R4.3. **Lo que ya existía y NO se tocó:** el motor por velocidad (`engineFly` con velocidad y boost),
el ras que se escucha (ganancia × `1 + ras * 0.85`), el salpicado del mar (`waterNear`), el whine
del Dart (R1), el tableteo de las mangueras, y el tic-tac del contador de suelta. R4 no reemplaza
nada de eso — agrega las dos capas que faltaban.

### R5 — el punch (21/8/2026) · **cerrada**

**Criterio de cierre:** captura del impacto que se sienta FINAL; cada amenaza traza al buque.

R5.1. **ZOOM-PUNCH de cámara en el impacto.** Un `ctx.scale(1..1.08)` que se abre al pegar y se
cierra en ~0.28 s (`zoomPunch` decae a `dt * 3.5`). El mundo NO se congela: todo sigue corriendo, la
cámara empuja un instante y vuelve. Va aplicado al nivel de `draw()` en game.js, DENTRO del mismo
`ctx.save` que el shake, así afecta tanto al 3D (three.js) como al 2D — si fuera solo del render de
pasada, la barcaza 3D no se movería y el efecto se partiría.

R5.2. **ONDA EXPANSIVA del impacto.** Un anillo que se abre desde el punto de impacto (efecto
`onda` en `fx`), renderizado como dos elipses: una a la altura del reventón (`#ffe6ac`, cálida) y
otra aplastada contra la superficie del mar (`P.foam`). El radio se calcula proyectando dos puntos
del mundo para que escale correctamente con la perspectiva. Duración: 0.55 s, fade cuadrático. Es
la misma familia visual que la onda del PLAN_DESTRUCCION del pasillo, adaptada a la pasada.

R5.3. **SHAKE GRANDE en el impacto.** El shake de los impactos contra el buque subió de `+2` a `+4`
(y `+4.5` para el sapito). El tope subió de 6 a 8 para que la bomba se sienta *más* que una
columna de agua (`+1.4`). El ducking de música (`duck(0.7)`) acompaña: al pegar, la música se ahoga
un instante y todo lo que queda es el trueno.

R5.4. **WHOOSH DEL MÁSTIL en el sobrevuelo.** Al pasar cerca del casco sin tocarlo (|x| < 90,
|z| < 30, y < 55), un beep grave de 180→60 Hz + sacudida de 2.2. El cooldown de 2.5 s previene
repeticiones en la misma pasada. La caja es más ancha que `hitsShip` a propósito — el whoosh es la
recompensa de haber pasado *cerca*, no solo de haber sobrevivido.

R5.5. **FOGONAZOS EN EL BUQUE cuando el cañón dispara.** Cada salva empuja un efecto `fk3`
(fogonazo en espacio de mundo) en la posición del buque, alternando babor/estribor. Se renderiza
como un disco caliente (`#ffe6ac` → `#d98a4a`) que crece y se apaga en 0.45 s. Es lo que convierte
las columnas de agua de "aparecen de la nada" a "salen de ahí" — el fuego tiene autor y dirección.
El fogonazo del lanzamiento del Dart (R1, línea 530) ya existía con la misma estructura pero no se
rendereaba: pasaba por el fallback genérico con coordenadas `px/py/pz` que ese fallback no lee.
Ahora los dos se dibujan con el mismo handler.

R5.6. **El tope de shake subió de 6 a 8.** El 6 era el máximo del juego entero — y un impacto de
bomba *tiene que* sentirse más que un derribado. La relación de fuerzas queda: derribado 6,
columna cercana 1.4, roce 1.2, bomba 4, sapito 4.5.

### R1 (continuación)

R1.4. **`__pdef(0)` pasó a silenciar también la OLEADA.** Apagar la defensa dejaba a los Fieles
volando, y uno volteó una zona en medio de la medición de la ristra: la prueba del eje dio "2 contra
2" y acusó al eje de no servir. `__pdef` ahora significa *que en la zona no pase nada más que yo*,
que es lo que toda sección de medición necesita.
