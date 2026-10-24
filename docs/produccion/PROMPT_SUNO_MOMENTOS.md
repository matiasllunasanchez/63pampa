# PROMPT para el chat de música — los MOMENTOS de un tema (Suno)

> Para pegar en el chat que arma los prompts de Suno. Le explica qué tiene que generar para que el
> juego pueda cambiar de pieza según lo que pasa (docs/produccion/MUSICA_CAPAS.md). Uso: pegar el
> bloque de abajo y, al final, completar `MI PEDIDO` con la referencia y la versión.

---

```
Necesito que me armes los prompts de Suno para la música ADAPTATIVA de un videojuego. Te explico el
sistema, lo que necesito y cómo quiero tu respuesta. Seguí las reglas al pie de la letra: si una pieza
no las cumple, el juego no puede usarla.

## EL JUEGO
RASANTE: arcade de aviones al ras del mar, guerra de Malvinas 1982, pilotos argentinos. Tono épico,
tenso y nostálgico; nada de música festiva ni heroica de Hollywood.

## CÓMO USA LA MÚSICA EL JUEGO
No suena una canción de punta a punta. Hay una pieza por MOMENTO del vuelo, y el juego pasa de una a
otra según lo que ocurre, siempre en el borde de un compás, con un fundido cruzado de 1 o 2 compases.
Para que ese cambio suene continuo y no a "cambio de radio", TODAS las piezas de un tema tienen que
compartir tempo, compás, tonalidad, instrumentación y motivo melódico. Cada pieza se repite en loop
mientras dure su momento.

## LOS MOMENTOS (una pieza cada uno)
1. CALMA     — despegue, crucero. Poca densidad: el motivo principal, colchón, sin percusión fuerte.
2. TENSIÓN   — entrando al radar enemigo. Pulso constante y contenido, bajo marcado, inquietud.
3. COMBATE   — enemigos, misiles. La banda entera, percusión plena. ES LA PIEZA BASE.
4. ATAQUE    — el buque enemigo a la vista hasta soltar la bomba. Lo más intenso, más densidad rítmica.
5. VUELTA    — escape y regreso. Alivio y melancolía, todavía con pulso.
Y tres REMATES cortos (un golpe musical de 2 a 6 segundos):
6. IMPACTO   — la bomba pega en el buque.
7. DERRIBO   — nos derriban.
8. LLEGADA   — aterrizamos en casa.

## REGLAS TÉCNICAS (obligatorias en las 5 piezas)
- INSTRUMENTAL. Sin letra, sin voces cantadas (como mucho un coro sin palabras en ATAQUE, y solo si el
  estilo lo pide).
- TEMPO FIJO Y DECLARADO: el mismo BPM en las 5 piezas. Sin accelerando, sin ritardando, sin rubato,
  sin cambios de compás.
- MISMO COMPÁS Y MISMA TONALIDAD en las 5. Si el estilo es en 6/8 (chacarera, zamba, malambo), decilo
  explícito: el compás y a qué figura se refiere el BPM (por ejemplo "6/8, 75 BPM a la negra con
  punto").
- CADA PIEZA ES UN SOLO NIVEL DE INTENSIDAD, PAREJO DE PRINCIPIO A FIN. No es una canción con arco
  (intro suave → estribillo → final): es un loop de un estado de ánimo. Nada de "build-ups" ni de
  caídas en el medio.
- ARRANCA EN EL PRIMER TIEMPO, sin intro libre ni silencio inicial.
- SIN FADE-OUT, SIN CIERRE, SIN ACORDE FINAL QUE QUEDE SONANDO: el final tiene que poder empalmar con
  el principio. No uses las etiquetas [Outro] ni [End] en las piezas de momento.
- DURACIÓN: de 1:30 a 3:00 cada pieza (el juego la repite).
- Los REMATES sí tienen principio y fin: un golpe corto en la misma tonalidad. Como Suno no genera 3
  segundos, pedí una pieza corta que TERMINE en ese golpe; el recorte lo hago yo.

## LA ESTRATEGIA EN SUNO (para que las 5 suenen a un solo tema)
1. Primero se genera la pieza BASE (COMBATE) con el estilo completo.
2. Las otras 4 se hacen con COVER sobre esa misma canción, cambiando solo la parte de intensidad del
   estilo (densidad, percusión, carácter) y dejando igual el tempo, el compás, la tonalidad y los
   instrumentos. Así conservan la melodía y la armonía de la base. Si la versión de Suno tiene control
   de cuánto respeta el audio original, que sea alto.
3. Los remates, también como Cover de la base, o como piezas cortas nuevas con el mismo estilo.

## LO QUE QUIERO DE VOS
Antes de los prompts, una línea con los PARÁMETROS COMUNES fijos: BPM, compás (y a qué figura va el
BPM), tonalidad, y la paleta de instrumentos (de 4 a 7). Elegilos para que sean fieles al estilo de MI
PEDIDO y funcionen en las 5 intensidades.

Después, para cada uno de los 8 (CALMA, TENSIÓN, COMBATE, ATAQUE, VUELTA, IMPACTO, DERRIBO, LLEGADA):
- **Cómo se genera:** "nueva" (solo COMBATE) o "Cover de COMBATE".
- **Style of Music:** el texto exacto para el campo de estilo, en inglés, de hasta ~400 caracteres.
  Tiene que repetir SIEMPRE los parámetros comunes (BPM, compás, tonalidad, "instrumental, steady
  tempo, no tempo changes, no fade-out") y agregar el carácter de ese momento.
- **Lyrics:** el texto exacto para el campo de letra: solo etiquetas entre corchetes, empezando por
  [Instrumental]. En las piezas de momento, secciones del MISMO nivel (por ejemplo [Main Loop A],
  [Main Loop B], [Main Loop A]), nunca [Intro], [Build], [Drop], [Outro] ni [End]. En los remates,
  sí: algo como [Instrumental] [Short Hit] [End].
- **Duración objetivo.**
- **Qué escuchar antes de aceptarla:** 2 o 3 cosas a chequear (que no acelere, que no tenga fade, que
  no cambie de intensidad en el medio…). Si falla una, se regenera.

Al final, recordame cómo descargar:
- WAV si se puede; si no, MP3, pero TODO en el mismo formato.
- Los STEMS de cada pieza si mi plan los permite (Get Stems), en el mismo formato.
- Una carpeta por tema, con un archivo por momento, nombrados así: calma, tension, combate, ataque,
  vuelta, remate_impacto, remate_derribo, remate_llegada (las carpetas de stems, con el mismo nombre
  más _stems).

## SI ES UNA VERSIÓN FOLKLÓRICA
Cuando MI PEDIDO diga "versión folklore", usá folklore argentino de verdad: elegí UN ritmo y respetalo
en las 5 piezas (chacarera o malambo para COMBATE/ATAQUE si el tema lo banca; zamba si es lento;
carnavalito o huayno si es en 2/4). Instrumentos posibles: bombo legüero, guitarra criolla, charango,
quena, sikus, violín, acordeón o bandoneón, bajo. Las 5 intensidades se logran con DENSIDAD (cuántos
instrumentos, cuánto bombo, rasguido o punteo), no cambiando de ritmo. El bombo legüero es la
percusión: en CALMA casi no está; en ATAQUE va a pleno.

Si MI PEDIDO no trae algo que necesitás (la referencia, el ritmo, el carácter), preguntámelo antes de
armar los prompts. No inventes la referencia.

## MI PEDIDO
Referencia (tema, artista o estilo): ___
Versión: ___   (por ejemplo: folklore, tango, rock, orquestal)
Lo que tiene que transmitir: ___
```
