# PASADA — Análisis de adrenalina y PLAN DE RESCATE

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

R1.4. **`__pdef(0)` pasó a silenciar también la OLEADA.** Apagar la defensa dejaba a los Fieles
volando, y uno volteó una zona en medio de la medición de la ristra: la prueba del eje dio "2 contra
2" y acusó al eje de no servir. `__pdef` ahora significa *que en la zona no pase nada más que yo*,
que es lo que toda sección de medición necesita.
