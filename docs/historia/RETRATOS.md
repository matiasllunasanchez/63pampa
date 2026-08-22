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

**Prompt patrón de retrato:**
```
[bloque AIRE de estilo] Portrait bust of {PERSONAJE — descriptor completo de la hoja},
chest-up, three-quarter view facing slightly left, [EXPRESIÓN — ej: "a small contained
frown of worry, jaw set"], personal marks clearly visible, neutral dark background for
clean cutout, consistent framing and scale, pixel art character portrait for a dialogue
box. Argentina 1982 [candado de época]. No text, no watermark.
```

## 5. Enganche con el motor *(barato a propósito)*

- `strings.js` ya lleva `img:` por pantalla (la placa). Se agrega `cara: 'gitano_sonrisa'`
  por línea de diálogo — si existe `assets/portraits/<cara>.png`, se dibuja el busto +
  nombre; si no, solo el nombre (funciona desde hoy sin un solo asset).
- El retrato cambia por línea (misma sintaxis del sistema de diálogo: una línea = una fila
  = una cara). El `hold` con la cara quieta y el ambiente sonando ES la actuación.
- Los cuadros sagrados usan el mismo campo `img:` a pantalla completa, sin retrato.

## 🟥 6b. La bajada operativa — prompts escena por escena

Este documento define el SISTEMA. Los prompts concretos, listos para pegar, salen por
tandas en documentos propios:

| Tanda | Documento | Estado |
|---|---|---|
| **Prólogo (P.1–P.4)** | [PROMPTS_VN_PROLOGO.md](PROMPTS_VN_PROLOGO.md) | ✅ 9 placas + 7 retratos |
| M1–M3 | *(pendiente)* | — |
| M4–M14 | *(pendiente)* | — |

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
