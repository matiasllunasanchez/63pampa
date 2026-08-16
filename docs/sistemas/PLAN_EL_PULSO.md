# PLAN — «EL PULSO»: el clímax como prueba de destreza *(plan C del boss + el momento del misil de m14)*

> **Estado: análisis + plan por fases, sin implementar. Cuándo entra:** es el **plan C del
> clímax** — si el rescate de la PASADA falla su gate (PASADA_ADRENALINA §R6), el boss se
> resuelve así y el juego queda PASILLO + EL PULSO. Pero tiene **USO DOBLE**: aunque la
> PASADA sobreviva, EL PULSO es el mecanismo natural del **"momento del misil" de m14**
> (MISION_FINAL.md) y de cualquier clímax scripted del guion. Se diseña una vez, sirve dos.
>
> **La idea en una frase:** al llegar al final del PASILLO, la cámara entra a la cabina,
> el tiempo se aplana casi a cero con el buque CLARO adelante, y el juego te pide ejecutar
> una secuencia de teclas contra reloj — la hacés limpia y el avión vuela la pirueta,
> suelta, y el buque muere en una cinemática que varía según la secuencia, la dificultad y
> el nivel. **El juego real es el PASILLO; el final es un examen de pulso.**

## 1. El porqué histórico *(esto no es un minijuego pegado — es el momento real)*

El ataque real duraba SEGUNDOS: alinear, aguantar derecho dentro del fuego, soltar en el
instante exacto. Y los pilotos en combate describen **tachypsychia**: la percepción del
tiempo se estira bajo adrenalina — "todo se puso lento". EL PULSO es esa percepción hecha
mecánica: la cabina, el silencio, el corazón (el latido ya existe como sonido — se
construyó para el ARENA), y las manos haciendo la secuencia entrenada. El nombre es la
tesis: **tener pulso** — la mano firme cuando todo tiembla.

## 2. Análisis del género: por qué los QTE se odian, y las 5 reglas para que se amen

Los QTE tienen mala fama ganada ("apretá X para ganar"). El análisis de los que SÍ
funcionan deja cinco reglas — el diseño entero de EL PULSO sale de acá:

| regla | el error clásico | la referencia que lo hace bien |
|---|---|---|
| **1 · El input es vocabulario APRENDIDO, no arbitrario** | teclas al azar que no significan nada | los *heat actions* de **Yakuza** usan los botones del combate normal. Acá: **las secuencias SON los combos de piruetas del juego** (BREAK TURN, TONEL… — `data/moves.js`, la libreta del Pichón). El examen toma lo que el juego enseñó |
| **2 · Cada tecla tiene NOMBRE diegético** | símbolos flotando en el vacío | el *blade mode* de **Metal Gear Rising**: entendés QUÉ estás haciendo. Acá cada grupo de la secuencia se rotula como acción de vuelo: `Q·E ALABEAR → ↓↓ PICAR → A·S·D ESTABILIZAR → Z SOLTAR`. No es Simon dice: es volar, comprimido |
| **3 · Lo que viene se VE venir** | inputs sorpresa de a uno | la autopista de notas de **Guitar Hero**: la secuencia entera visible, el cursor avanza. Leés adelante, como en el pasillo |
| **4 · El fallo tiene drama y costo, no reset seco** | morir de un error y recargar | **RE4 / God of War**: fallar duele y espectacula. Acá: fallo = la pasada se pasa de largo — flak más cerca, un re-encare que cuesta (tiempo/nafta/una vida de escuadrón al segundo fallo), secuencia NUEVA al volver. Máximo N intentos |
| **5 · La recompensa es proporcional y variable** | la misma cinemática siempre | los deathblows de **Sekiro** / el *Climax Mode* de **After Burner Climax** (cámara lenta + decisión = el pariente directo). Acá: la cinemática ejecuta LA PIRUETA que tecleaste (el sistema de `moves.js` ya las vuela), con la suelta y la muerte del buque según clase y nivel; perfecta y rápida = más estrellas |

**Referencias de cine** (el plano que este modo es): la suelta de *The Dam Busters* — los
segundos de silencio con las manos ocupadas; el disparo final de *Star Wars* — todo lento,
una sola acción bien hecha.

## 3. El diseño

### La secuencia
- **Pool por misión**: 2–4 "compases" encadenados; cada compás es un combo corto rotulado
  (regla 2). Largo y velocidad escalan con el nivel y la dificultad (`[H]`).
- **En campaña**, los compases salen de las piruetas APRENDIDAS (la libreta del Pichón):
  el examen es de lo tuyo. En CICLO (sin libreta), pool básico de flechas + `Q/E/Z`.
- **La elección de blanco es parte de la prueba**: se muestran 2–3 zonas del buque, cada
  una con SU secuencia (radar = la corta y fácil · polvorín = la larga y brava). Empezás
  la que quieras: elegir es arrancar a teclear. Más riesgo, más puntos, otra cinemática.
- **Margen**: barra de tiempo total + ventana por compás. Error: corta el compás (no hay
  "casi"); en dificultad baja se perdona UN error por secuencia.

### El fallo *(regla 4)*
1er fallo: el avión se pasa de largo — sobrevuelo con fusilería, re-encare CORTO
automático (cinemática de 3–4 s), volvés con secuencia nueva y el flak un grado más
cerca. 2º fallo: cuesta una vida del escuadrón (relevo — el compañero te cubre la vuelta).
3º: la misión falla como siempre. Nunca muerte instantánea por error de tecla.

### La recompensa
La cinemática compone: **la pirueta tecleada** (la vuela `systems/moves.js`, que ya es
dueño del avión en las piruetas) + la suelta + el impacto por zona elegida + la muerte del
buque por clase (explosiones ya horneadas). Estrellas por: sin errores, velocidad, zona
brava. En m14, la variante scripted ES el momento del misil del guion.

### El arma
Canon de buques: **la ristra de bombas** (todo lo decidido en PASADA §8b). "Misil" queda
como variante para las misiones que lo pidan (el juego ya tiene misiles en el PASILLO) —
perilla por misión, no dogma.

## 4. Por qué es BARATO y coherente *(la tabla de reuso — casi todo existe)*

| pieza | de dónde viene |
|---|---|
| Cámara lenta (dt escalado, todo sincronizado) | `systems/tempo.js` — el MOMENTUM |
| Detector de combos por teclas | `core/input.js` (`dirTap`) + `data/moves.js` — las piruetas |
| Cinemática de pirueta (el avión la vuela solo) | `systems/moves.js` — ya es dueño del avión durante `run.mv` |
| La cabina | `drawCockpit` (render de momentum/arena, con `yOff`) |
| El buque adelante, grande y claro | `drawApproachBarge` — la aproximación 2D que YA crece hasta media pantalla. **EL PULSO ARRANCA AHÍ MISMO: no hay 3D, no hay transición, no hay teleport** — el problema de continuidad de la PASADA no existe acá por construcción |
| El latido | ya construido para el ARENA |
| Explosiones / muerte del buque | hojas horneadas (`boom`/`blast`) + el hundimiento del clímax 2D |

Es el clímax de MENOR costo de todos los diseñados — y el único sin deuda 3D.

## 5. Fases

| fase | entrega | criterio de cierre |
|---|---|---|
| ~~**Q0**~~ ✅ | Datos: pool de secuencias (`data/pulso.js` — compases rotulados, dificultad por misión, mapa zona→secuencia→cinemática), perillas, strings es/en, sonda `?pulso` / `__qdbg()` | **hecho 16/8/2026**: `check` verde, el pool es data pura y cada compás sale del combo real de una pirueta |
| ~~**Q1**~~ ✅ | El estado `'pulso'` mínimo: la aproximación 2D se aplana (tempo a ~0.1), cabina, el buque claro, UNA secuencia fija visible con cursor, acierto/fallo binario → victoria o re-encare corto | **hecho 16/8/2026**: ciclo completo medido por sonda — fallo por tiempo → re-encare → secuencia limpia → `results`. `check` verde, `feel` idéntico al baseline |
| ~~**Q2**~~ ✅ | La prueba completa: compases rotulados (regla 2), autopista visible (regla 3), márgenes y escalada por nivel/`[H]`, perdón de 1 error en fácil, elección de blanco por secuencia, los 3 fallos con sus costos | **hecho 16/8/2026**: `npm run pulso` verde — perfecta gana, el perdón existe al principio y no al final, y los 3 fallos van a su costo. `check` verde (63 unit), `feel` idéntico |
| **Q3** | La recompensa: cinemática compuesta (pirueta de `moves.js` + suelta + impacto por zona + muerte por clase), estrellas por perfección/velocidad/zona | dos zonas distintas producen dos cinemáticas distintas |
| **Q4** | Integración: `climax: 'pulso'` en `missions.js` (el enchufe ya existe — `climaxOf()`), campaña con secuencias de la libreta, CICLO con pool básico, PATRIA/MINUTOS SAGRADOS intactos | cambiar el campo cambia el clímax sin código |
| **Q5** | El teatro: latido que acelera, el mundo enmudecido salvo el corazón y las teclas, flak congelado alrededor (el peligro VISIBLE en pausa — estar quieto en el medio del fuego es la imagen del modo), sal/viñeta en la cabina, fixture completo `npm run pulso` | mirada muda: tensión sin leer nada |

**Perillas** (`data/pulso.js`): `PULSO_SLOW 0.08` · `PULSO_T` por compás 1.6→0.9 s según
nivel · `PULSO_ERR` (1 en fácil, 0 normal) · `PULSO_TRIES 3` · compases 2→4.

## 6. Qué NO hacer

1. **Nada de secuencias arbitrarias en campaña** — salen de la libreta o no salen (regla 1).
2. **No instakill por tecla**: el fallo es drama y costo, nunca reset seco (regla 4).
3. **No más de ~10 s** de prueba total: es un remate, no un nivel.
4. **No tocar tempo.js ni moves.js por dentro**: se usan, no se reforman.
5. **No reemplazar a la PASADA de oficio**: EL PULSO entra como clímax general SOLO si
   R6 falla. Su vía de entrada garantizada es m14 (el momento del misil).
6. Sin QTE en pantallas de historia ni en ningún otro lado: es EL clímax, único y raro.

## 7. Divergencias *(completar durante la implementación)*

**Baseline de `npm run feel` (antes de Q0):** 33 asserts, `FEEL: OK`. Verificado idéntico al
cerrar Q1 (diff vacío contra el baseline guardado).

1. **No existe perilla de dificultad.** El plan §5 pedía `PULSO_ERR` "1 en fácil, 0 normal" y
   escalada "por nivel/`[H]`", pero el juego **no tiene** setting de dificultad (`OPT_ROWS` no
   trae ninguno y no hay `cfg.diff`). Decisión: hoy rige `PULSO.ERR.normal` = cero perdones; la
   tabla queda en `data/pulso.js` para cuando la escalada por nivel entre en Q2. Lo mismo con
   `T_BEAT`/`BARS`, que son rangos y Q1 usa el extremo `[0]`.
2. **`TAPTOK` no distingue Q/E de ←/→ como el plan asumía.** El ejemplo del plan (`Q·E ALABEAR`)
   sugiere que rolar tiene tokens propios: los tiene (`L`/`R`), pero salen de `keyField`, así que
   el vocabulario real de la prueba es el de `core/input.js` — que es justamente lo que la regla 1
   pedía. Los compases de `data/pulso.js` usan esos tokens, verbatim de los `case` de `combo`.
3. **Dos toques a `core/input.js` (una línea cada uno)**, no un refactor: ruteo de taps frescos a
   `a.pulsoTap()` cuando el estado es `'pulso'` (espejo exacto del ruteo a `dirTap` en `'play'`) y
   la `Z` como remate. El detector de combos NO se tocó: la prueba **deletrea** las piruetas, no
   las dispara.
4. **`drawApproachBarge` cortaba en `'pulso'`.** Tenía un guard `S.state !== 'play' && !== 'takeoff'`.
   Se agregó `'pulso'` (una línea en `render/world.js`): sin eso el clímax se quedaba literalmente
   sin blanco. Confirma la tesis del plan §4 — el buque de la prueba ES el del pasillo.
5. **La dilatación se aplica en `update()` de `game.js`, no en `tempo.js`** (§6.4 lo exige): una
   sola línea `if (S.state === 'pulso') dt *= PULSO.SLOW` ANTES de `run.t += dt`, para que todo lo
   de atrás del vidrio quede dilatado en sincronía. La prueba recibe el `dt` real aparte.
6. **La cabina va más arriba que en el ARENA**: `COCKPIT_Y` 74 → **104**. Con el offset del ARENA
   el canopy se comía el cielo y el buque espiaba por una rendija; acá el blanco ES la escena.
7. **Los popups de fase se quitaron**: se pisaban entre sí arriba (dos textos en la misma `y`) y
   duplicaban lo que el render ya canta en grande. El motivo del fallo viaja en `Q.motivo` y lo
   dibuja el render; los popups quedan solo para el rótulo del compás cerrado.
8. **Pendiente honesto para Q2/Q3 (no resuelto):** el margen de 1,6 s del primer compás es
   **duro para un compás de 3 toques** — en la primera medición el propio harness lo perdió por
   llegar tarde. Es el default del plan y no se tocó, pero la escalada de Q2 debería arrancar más
   holgada. Y el buque, aunque ya se ve claro y entero, todavía no DOMINA el cuadro: agrandarlo es
   trabajo de la cinemática (Q3).
   → **Resuelto en Q2**: `T_BEAT` arranca en **2,2 s** y baja a 1,1 s con el avance de campaña.
   La presión la pone la escalada, no el primer compás. (Lo del tamaño del buque sigue abierto.)

### Divergencias de Q2

9. **El perdón escala por NIVEL, no por dificultad** (consecuencia directa de la divergencia 1).
   `PULSO.ERR` (tabla fácil/normal/difícil) se reemplazó por `PULSO.ERR_LV = 0.3`: se perdona un
   error mientras el avance de campaña esté en el primer 30%. Es la misma intención del plan —
   perdonar mientras se aprende — atada a la única perilla que el juego tiene.
10. **`t01` en vez de "nivel".** Toda la escalada (margen, largo, perdón) se calcula sobre el
    **avance de campaña normalizado 0..1**, no sobre el número de misión: CICLO y PATRIA tienen
    largos distintos y entran con su propia fracción sin que las cuentas sepan de misiones.
11. **La matemática de la prueba vive en `core/pulso.js`**, no dentro del sistema — mismo lugar y
    misma razón que `core/squad.js`: es lo único que, si se rompe, no da error ni se ve (la prueba
    queda regalada o imposible y solo se descubre jugando). Ahí es testeable en node: 7 tests
    nuevos en `npm run unit`, incluido el techo de ~10 s del §6.3 medido sobre el peor caso.
12. **La configuración la inyecta `game.js` (`pulso.setCfg`)** y no la mira el sistema. Hacía falta
    porque quien dispara la entrada es `systems/flight.js`, que no conoce la campaña ni la libreta:
    sin este paso, `enter()` no tenía de dónde sacar el nivel sin llamar hacia arriba.
13. **En campaña sin piruetas aprendidas la secuencia es SOLO el remate.** No es un pool vacío por
    error: es la regla 1 llevada hasta el final — en la primera misión el examen es soltar bien,
    que es lo único que el juego enseñó hasta ahí. La prueba se arma sola a medida que la libreta
    crece.
14. **El primer compás de cada zona se elige a propósito, no se sortea.** Como elegir blanco *es*
    empezar a teclear, dos zonas que arrancaran con la misma tecla harían la elección ambigua. El
    sorteo por reintentos no alcanzaba (el pool básico tiene 3 primeras teclas distintas nomás y
    fallaba seguido: lo detectó el unit test); ahora se reparten las teclas libres de entrada.
15. **El 3er fallo llama `die()` directo, no `onDeath()`.** Los intentos son de la **misión**, no
    del avión: pasando por el relevo habría tantas pruebas como aviones tenga el escuadrón y el
    "3 fallos y se pierde" del plan no existiría — se fallaría en bucle hasta quedarse sin nafta.
16. **El 2º fallo se cobra por el camino de la PASADA GASTADA** (`{ spent }` → `onPassSpent`):
    misma cinemática, misma cuenta, y el compañero vuelve **a la prueba** con los intentos y el
    flak intactos. Volando solo (sin escuadrón que relevar) no hay avión que cobrar y el 2º fallo
    cuesta lo mismo que el 1º: el 3º sigue siendo la derrota. `onPassSpent` tomó dos campos
    opcionales (`why`, `dieWhy`) para no hablar siempre en nombre de la pasada.
17. **La autopista se mudó al CIELO** (`LANE_Y` 74 → 34). A media altura se leía bien pero quedaba
    escrita encima del buque, y la secuencia y el blanco son las dos cosas que hay que mirar: no
    pueden pelearse el mismo pixel. El flak congelado, además, se dibuja **antes** de la cabina —
    los estallidos están afuera del vidrio; encima parecían mugre en la pantalla.
18. **Fixture propio: `npm run pulso`** (`tools/fixture_pulso.js`), con el criterio de cierre de Q2
    medido — perfecta gana, un error se perdona en los primeros niveles y no al final, y los tres
    fallos van cada uno a su costo. Dos sondas nuevas nacieron de pelearlo: `__qcfg` (re-entrar con
    otro nivel: la única forma de ver la escalada sin jugar la campaña entera) y `__qhold` (colgar
    el margen para las capturas — sacar una foto tarda más que la ventana de la prueba, así que sin
    eso toda captura salía mostrando el fallo por tiempo). Ambas marcadas QUITAR.
