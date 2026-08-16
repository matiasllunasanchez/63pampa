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
| **Q0** | Datos: pool de secuencias (`data/pulso.js` — compases rotulados, dificultad por misión, mapa zona→secuencia→cinemática), perillas, strings es/en, sonda `?pulso` / `__qdbg()` | `check` verde; el pool se lee como data |
| **Q1** | El estado `'pulso'` mínimo: la aproximación 2D se aplana (tempo a ~0.1), cabina, el buque claro, UNA secuencia fija visible con cursor, acierto/fallo binario → victoria o re-encare corto | jugable de punta a punta con una secuencia |
| **Q2** | La prueba completa: compases rotulados (regla 2), autopista visible (regla 3), márgenes y escalada por nivel/`[H]`, perdón de 1 error en fácil, elección de blanco por secuencia, los 3 fallos con sus costos | fixture: perfecta gana; 1 error en fácil perdona; 3 fallos = derrota de siempre |
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

- *(vacío)*
