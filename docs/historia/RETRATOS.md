# EL CUADERNO DE MATEO — Sistema de retratos *(escenas estáticas estilo visual novel)*

> Decisión de producción (2026-08-06): las escenas de diálogo se cuentan **estilo Police
> Stories / visual novel** — placa de AMBIENTE sin personajes + RETRATO del que habla con
> expresiones + el texto del sistema de diálogo. Referencia visual de Matías: la captura
> de diálogo pixel art con el busto abajo a la izquierda, nombre y línea.

---

## 1. Por qué es la decisión correcta *(no solo un ahorro)*

**El ahorro es real:** generar escenas completas con personajes es lo más caro y lo más
frágil (la consistencia de caras entre cuadros es la principal falla de la generación por
IA). Con retratos, cada personaje se genera UNA vez por expresión desde su hoja modelo y
queda idéntico para siempre; los ambientes, sin gente, salen fáciles y no tienen problemas
de caras ni de PERIOD LOCK de uniformes.

**Pero además rinde narrativamente:**
- **El retrato ES la actuación.** En un juego sin voces (SISTEMA_DIALOGO), la expresión
  del retrato + el `hold` + el tipeo por letra son los tres actores. Un cambio de gesto en
  el retrato hace el trabajo que haría un cambio de tono en la voz.
- **El nombre del hablante siempre visible** (regla del sistema de diálogo) se vuelve
  natural: nombre + cara, como en la captura de referencia.
- **La cámara quieta sobre el ambiente** deja que el sonido trabaje (la pava, el viento,
  el hangar) — exactamente el plan de PLAN_CINEMATICAS.

## 2. La regla híbrida — qué va con retrato y qué exige cuadro completo

**DEFAULT: ambiente + retrato.** Toda escena de diálogo del mundo AIRE (hangares,
briefings, sala de radio, fogón).

**EXCEPCIÓN — los cuadros sagrados:** los momentos donde la imagen ES el contenido se
siguen produciendo como cuadros completos del storyboard. Lista cerrada:

| Cuadro | Por qué no alcanza el retrato |
|---|---|
| P.0 (la puerta, la mesa, los dos papeles) — ⚠ **3.2: NO abre el juego**, es la revelación del cierre (Final A) | el marco del juego es visual |
| P.1 el arroyo · P1.3 "los valientes vuelan abajo" | el recuerdo fundante |
| M1.5c/M1.5d — la foto en el locker · el terito fresco | props que el jugador debe VER |
| M6 la Chancha enganchada bajo fuego | acción pura |
| M7 el locker completo (frente → dorso → la cuenta) | el giro del juego |
| M8.A/B/C — el paso del terito, la cara de Mateo, la multitud | el reconocimiento |
| M9 la libreta bajo el catre / la cuenta del "un cuarto" | props |
| 🟨 **M10.A–D — Tandil** (los diez rodando al amanecer, la escarapela fresca, el Hércules batiendo las alas, los diez vacíos) | 3.5: el regalo que llega tarde |
| M12 el corte a tierra completo + el tallado | la muerte de Correa |
| M13 la foto contra la damajuana · la carta "Norma" en el locker | props |
| M14 entero + los dos finales | el clímax |
| 🟥 **Post-créditos (3.6): el pibe frente a la vitrina + la mano en el vidrio** | la rima con Norma cierra el juego |
| Todas las páginas `[TIERRA]` del cuaderno | son dibujos de Mateo, otro registro |

Todo lo demás — el 70% de las pantallas de historia — es **placa + retrato**.

## 3. Las placas de ambiente *(la lista completa — esto es todo lo que hay que generar)*

Sin personas, reutilizables, con variantes de luz. Unas ~16 placas cubren la campaña:

1. Línea de vuelo — amanecer (la de siempre)
2. Línea de vuelo — atardecer
3. Línea de vuelo — noche (m13/m14)
4. Hangar interior — día (banco del Pichón)
5. Hangar interior — noche con lámpara (la libreta)
6. Vestuario / lockers (penumbra)
7. Sala de radio (mapas, la lámpara verde)
8. La cocina de Norma — 1982 cálida (prólogo)
9. La cocina de Norma — presente lavado (P.0 / epílogos)
10. El fogón detrás del hangar (asado, brasas)
11. Cabina interior — día (para radio en vuelo)
12. Cabina interior — noche (m14)
13. Pista bajo lluvia (ventana del alerta)
14. El patio con el jazminero (Final B)
15. 🟥 **Plataforma de Tandil — amanecer helado** (el intercalado de m10: pasto escarchado,
    plataforma vacía, luz naranja rasante). Es la única placa que NO es del sur.
16. 🟥 **El museo escolar — presente** (post-créditos: la vitrina con el cuaderno, luz de
    aula, sin gente). La única placa del presente además de la cocina.

**Prompt base de placa:** el bloque `[AIRE]` de siempre + `NOBODY IN THE FRAME. Empty,
waiting, quiet.` + PERIOD LOCK. La placa de la pista del TEST 4B ya cumple el formato —
sirve de patrón.

## 4. Los retratos — especificación

**Formato:** busto (pecho para arriba), 3/4 de frente, sobre fondo neutro oscuro para
recortar; pixel art del estilo maestro; **las marcas personales SIEMPRE visibles** (la
gorra con estrellita del Turco, el lápiz del Pichón, el rosario del Vasco…). Mismo encuadre
y escala para todos: la cara de la escuadrilla es una familia, no un collage.

**La economía de expresiones — acá está el truco.** No hace falta un set gigante: el set
de cada uno ES su personaje.

| Personaje | Set de expresiones | Nota de actuación |
|---|---|---|
| **Tero** | neutro · preocupado · sonrisa chica · roto *(solo m14)* + variante con casco | El padre contenido: entre "neutro" y "preocupado" se juega casi todo su arco. |
| **Puma** | reglamentario · ceño · **la sonrisa** *(rara — canon: la administra con cuentagotas)* · quebrado *(una sola escena)* | Cuando aparece "la sonrisa", el jugador ya aprendió a leerla. |
| **Gitano** | **sonrisa (SU neutro)** · carcajada · serio *(= alarma: si el Gitano está serio, algo pasa)* · roto | Su default es sonreír. El retrato "serio" es el presagio más barato del juego. |
| **Vasco** | **UNO SOLO: cerrado** · + **media sonrisa** *(una sola vez: "casi se ríe. Casi.", m6)* | Dos retratos en todo el juego. Esa pobreza ES el personaje — y la media sonrisa única vale oro. |
| **Pichón** | entusiasmo · vergüenza *(frenado a mitad de frase)* · miedo · neutro · 🟥 **concentrado con auriculares** *(M5, la escucha)* | Entusiasmo↔vergüenza es su ping-pong cómico con el Turco. El de auriculares se usa dos veces: la escucha de M5 y la noticia del Belgrano en M3. |
| **Turco** | gruñón (su neutro) · ternura disimulada · roto · orgullo *(estrellitas)* | La gorra con la estrellita en TODOS. |
| **Mateo** | sonrisa colimba · serio *(solo prólogo — en la isla vive en el registro TIERRA, dibujado por él mismo)* | 2 retratos alcanzan. |
| **Colorado** | *(sin retrato AIRE — existe solo en los dibujos del cuaderno)* | Su cara es como Mateo lo dibuja: con capa. |
| **Norma** | 🟨 cálida · seria *(P.2, 1982)* | **Canon 3.4: Norma habla y se la ve** — el jugador tiene que reconocer a sus propios padres en esa cocina. En los epílogos (años después) va en cuadros completos, no en busto. |
| **Cóndor** | **un parlante de radio / forma de onda** como "retrato" | La máquina de la guerra no tiene cara. El sting 30 suena debajo. |
| **Piloto peruano (m10)** | 🟨 **busto propio, UNO** — casco bajo el brazo, mameluco de vuelo sin insignias de país | 🟨 3.5: ahora habla **en tierra, en Tandil**, no por radio. Merece cara: es la única persona de afuera que aparece en todo el juego. Que se le vea el cansancio del vuelo largo. |
| 🟥 **Seño Claribel (post-créditos)** | **busto propio, UNO** — mujer de unos 53 años, sanluiseña, cálida y cansada, ropa de maestra de escuela pública | 🟥 3.6: es la nena de nueve años de la carta de M9, cuarenta y pico de años después. **No se explica nunca.** |
| 🟥 **El pibe de la 10 (post-créditos)** | **busto propio, UNO** — nene de 8-9 años, camiseta argentina con **TRES** estrellas | 🟥 3.6. Que la camiseta se lea sin que nadie la nombre. |

**Total a generar: ~33 retratos** (contando variantes) contra los cientos de cuadros con
personajes que costaría el enfoque de escena completa. Y salen todos de las hojas modelo
ya especificadas, como *image reference* — máxima consistencia.

**El canon de los personajes** —alturas medidas, caras, intención— vive en
[`RETRATOS_CANON.md`](RETRATOS_CANON.md). **El procedimiento está en [`PROMPTS_RETRATOS_LISTOS.md`](PROMPTS_RETRATOS_LISTOS.md)**, y el
hallazgo del 24/8 cambia lo que dice esta sección: **las láminas finales de
[`characters_examples/final/`](characters_examples/final/) YA TRAEN, abajo, la tira de cabezas con
las expresiones de cada personaje.** Unos **25 de los 38 retratos ya están dibujados** — el
trabajo es cosecharlos, no generarlos.

Ese documento trae además la medida real —**108 × 108 px**, que sale de los 36 px de
diseño de `screens.js:482` por `U·SC = 3`— y la lista de qué detalle sobrevive a esa escala y
cuál no: a 59 px de cabeza, las pecas del Pichón y la cicatriz en la ceja del Gitano no existen,
así que las expresiones se dibujan con **cejas, boca y ángulo de cabeza** y nada más.

Para cortar la tira en retratos sueltos: `python3 tools/install_retratos.py <lámina> --region … id1 id2 …` —
parte la tira, saca el fondo verde y deja cada celda en `assets/portraits/`.

## 5. Enganche con el motor *(barato a propósito)*

- `strings.js` ya lleva `img:` por pantalla (la placa). Se agrega `cara: 'gitano_sonrisa'`
  por línea de diálogo — si existe `assets/portraits/<cara>.png`, se dibuja el busto +
  nombre; si no, solo el nombre (funciona desde hoy sin un solo asset).
- El retrato cambia por línea (misma sintaxis del sistema de diálogo: una línea = una fila
  = una cara). El `hold` con la cara quieta y el ambiente sonando ES la actuación.
- Los cuadros sagrados usan el mismo campo `img:` a pantalla completa, sin retrato.

## 🟩 5b. Idea: retratos con MOVIMIENTO propio *(pedido 22/8 — sin decidir, para no perderla)*

**El disparador:** armar las escenas de historia con Nano Banana en estilo Metal Slug, con
diálogo y caras de personajes hablando abajo — que **es exactamente el sistema que este
documento ya describe** (§1, §4, §5). Lo nuevo no es el retrato: es que **el retrato se mueva**,
y sobre todo **cómo** moverlo sin caer en lo que este documento descartó en §1: generar cada
cuadro de una escena entera con IA, con el problema de consistencia de caras que eso trae.

**La idea central, en las palabras de Matías:** no hace falta generar TODA la escena con
personajes con IA. Se puede generar una **hoja de script de movimientos** por personaje —
parpadeo, boca abierta/cerrada, un gesto chico— y aplicarla **a mano, como se hacían los
dibujitos antes**: con Claude ayudando a componer, o directamente en Photoshop. Animación de
sprite clásica, no generación de video cuadro a cuadro.

**Por qué encaja con lo que ya existe, y no es un sistema nuevo:**

- El motor de diálogo ya corre un reloj real durante el `hold` (`dlg.t` en `core/dialogue.js`),
  que hoy no se usa para nada visual — el retrato queda inmóvil todo el silencio. Ese reloj es
  el disparador natural de un ciclo de 2-4 cuadros (parpadeo cada tantos segundos, boca en las
  líneas con `typed` avanzando). No hace falta un sistema de animación nuevo: hace falta un
  segundo asset por expresión (una tira corta) y unas pocas líneas en el render de la caja VN.
- Sigue naciendo de las hojas modelo de personaje, igual que hoy (§4): la consistencia no se
  pierde porque no se genera un cuadro nuevo cada vez — se genera **una vez** la hoja de
  movimientos de esa expresión, y de ahí se recorta y se compone siempre.
- No compite con el video de IA que ya está presupuestado en
  [PLAN_CINEMATICAS.md](../produccion/PLAN_CINEMATICAS.md): ese es para 4-5 momentos gigantes
  (la transformación del prólogo, el giro de la foto, el batir de alas). Esto es para las
  **~33 caras que hablan todo el juego**, así que tiene que ser mucho más barato por unidad.

**Lo que falta decidir antes de producir nada** *(por eso queda como idea, no como spec)*:

1. **Qué se anima.** El candidato obvio es parpadeo (barato, universal, sostiene la ilusión de
   "está vivo" en los `hold` largos) y boca abierta/cerrada sincronizada con el tipeo. Un gesto
   de cuerpo (encogerse de hombros, mirar para otro lado) ya es por personaje y por línea, y
   sube el costo de golpe — evaluar si vale la pena o si el parpadeo solo ya alcanza.
2. **Cuántos cuadros por ciclo.** Con 2 alcanza para parpadeo simple; con 3-4 se puede hacer que
   no se sienta metronómico (variar el intervalo entre parpadeos con algo de azar, ya como
   hacen otros ciclos del juego — ver `Math.random` en los patrones de `systems/spawn.js`).
3. **Quién arma la hoja.** La propuesta es generarla con Nano Banana (misma referencia de
   personaje que ya usan las hojas de §4) y componerla a mano — no pedirle a la IA que anime,
   pedirle los cuadros sueltos y armar el ciclo aparte. Eso es justamente lo que la separa de
   "generar video con personajes" y la mantiene en el presupuesto de un retrato.

**A futuro, explícitamente NO ahora:** una vez que una escena esté compuesta y quieta (fondo +
retrato ya integrados), esa MISMA captura podría pasar por Kling para sumarle movimiento barato
—parallax del fondo, una respiración, el pelo con viento— en vez de generar la escena animada
de cero. Es la lógica que [PLAN_CINEMATICAS.md](../produccion/PLAN_CINEMATICAS.md) ya aplica
para los 4-5 momentos grandes, extendida hacia abajo; no se evalúa hasta que el retrato quieto
+ el retrato con parpadeo/boca ya estén construidos y se sepa si hacen falta.

## 🟥 6b. La bajada operativa — prompts escena por escena

Este documento define el SISTEMA. Los prompts concretos, listos para pegar, salen por
tandas en documentos propios:

| Tanda | Documento | Estado |
|---|---|---|
| **Prólogo (P.1–P.4)** | [PROMPTS_VN_PROLOGO.md](PROMPTS_VN_PROLOGO.md) — y la versión lista para pegar en [PROMPTS_VN_PROLOGO_LISTOS.md](PROMPTS_VN_PROLOGO_LISTOS.md) | ✅ 9 placas + 7 retratos + 6 figuras |
| **Las placas de TODA la campaña** | [PROMPTS_PLACAS.md](PROMPTS_PLACAS.md) — lista para pegar en [PROMPTS_PLACAS_LISTOS.md](PROMPTS_PLACAS_LISTOS.md) | 🟩 ✅ 16 lugares + 9 cuadros propios |
| Retratos M1–M14 | *(pendiente — paso 2)* | — |
| Figuras M1–M14 | *(pendiente — paso 3)* | — |

**⚠ Hallazgo del prólogo:** Esteban y Mateo aparecen **en su casa**, no en la guerra. Los
tokens de STORYBOARD_1 los describen con mameluco y equipo de campaña, y acá no va nada de
eso — la primera imagen de Esteban tiene que ser **un padre, no un piloto**. Por eso el
prólogo suma `tero_civil_*` y `mateo_casa_*`, más **`tero_civil_blanco`** (la cara cuando
corta el teléfono), que es el único agregado a la economía de expresiones de §4.

## 6. Orden de producción sugerido

1. **Las 14 placas** (fáciles, sin caras — validan el estilo).
2. **Los retratos neutros** de los 7 con cara (uno por personaje) → el juego entero ya
   funciona en modo VN.
3. Las variantes de expresión, empezando por las que más rinden: el "serio" del Gitano,
   "la sonrisa" de Puma, la "media sonrisa" del Vasco.
4. Los cuadros sagrados, en el orden del storyboard (tabla 3.0).
