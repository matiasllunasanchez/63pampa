# RASANTE — Plan de banda sonora · v4.0

> Listado de pistas a generar para cubrir toda la campaña **"El cuaderno de Mateo"**
> ([GUION_3.md](GUION_3.md)) y el [STORYBOARD_1.md](STORYBOARD_1.md), con un prompt listo
> para pegar por cada una. **36 pistas** organizadas por etapa dramática.
>
> **🟩 Novedades 4.0 — dos cambios grandes:**
>
> 1. **LETRAS ESCRITAS.** Toda pista cantada trae ahora su **letra completa en español
>    argentino** debajo del prompt, y el prompt describe **cómo tiene que sonar la voz**
>    (timbre, edad, registro, acento, interpretación, lugar en la mezcla). Antes decía
>    "lyrics about…" y dejaba que el generador inventara: eso daba letras genéricas que no
>    conocían a estos personajes. Ahora las letras salen de frases que ya están en el guion.
> 2. **SEIS PISTAS NUEVAS** por huecos reales del guion 3.0 que la v3 no cubría: la Chancha
>    (M6), el reverso de la foto (M7), el relevo de escuadrón, el desbloqueo del Mirage
>    (M10), la carta (M13) y **el cierre común** — la narración sobre fotografías reales,
>    que era el agujero más grande: entre el epílogo y los créditos no había nada.
>
> **También:** renumeración limpia en orden narrativo (la v3 tenía las pistas 26–30
> desparramadas fuera de orden). **Los nombres de archivo no cambiaron** — son lo que lee
> `src/systems/audio.js`, y las referencias cruzadas se hacen por archivo, no por número.

---

## Los dos packs sonoros — la estrategia *(sin cambios)*

**PACK ORIGINAL (este documento — el default y el de Steam).** Todas las pistas generadas
desde cero: música y letra 100% originales. Cubre todo el juego salvo el lobby, que
conserva su música actual.

**PACK PATRIO (el actual — reversiones, opcional).** Las `pmetal_*` existentes quedan como
pack alternativo activable por configuración. Ante la duda de derechos: el ORIGINAL es el
default, el PATRIO se revisa pieza por pieza antes de publicarse.

**Implementación:** `assets/audio/original/` y `assets/audio/patrio/` con los mismos
nombres adentro; un flag de config elige carpeta. El lobby no se toca.

---

## 0. Sistema musical — leer antes de generar

### La regla de las referencias reales *(sin cambios)*

Cada pista lleva una línea **"Referencia real"**: un tema existente que captura la emoción
buscada, para generar variaciones y calibrar el resultado. **Las referencias son SOLO
material de trabajo privado — nunca se publican, nunca se citan en Steam, y el prompt
siempre cierra declarando que la música es original** (ver la regla de cierre, abajo). La
referencia dice qué tiene que SENTIR la pista; el prompt dice cómo tiene que SONAR.

**La estrella del norte de todo el score:** la música del juego nace del **tema de intro de
Battlefield 1942** — épica militar con pulso, orgullosa sin ser pomposa, que te hace querer
subirte al avión. Cuando una pista de acción no sepa para dónde ir, va para ahí.

### 🟩 La regla nueva: cómo se pide una voz

Un generador musical canta cualquier cosa si no le decís quién canta. Por eso toda pista
vocal de este documento lleva **dos cosas separadas**:

1. **Dentro del prompt**, una descripción de la voz con estos cinco ejes —
   **quién** (edad, género, cuerpo) · **cómo** (técnica: gastada, limpia, gritada, tarareada)
   · **de dónde** (acento: argentino rioplatense, cordobés, litoraleño) ·
   **con qué actitud** (contenida, desgarrada, festiva) · **dónde en la mezcla**
   (adelante y seca / lejos y con reverb / abrazada por una multitud).
2. **Debajo del prompt**, un bloque **LETRA** con el texto completo, marcado por secciones.
   Se pega aparte, en el campo de letra del generador.

**Regla de escritura de las letras:** ninguna letra inventa vocabulario. Todas están hechas
con frases que ya existen en [GUION_3.md](GUION_3.md) — el "cebar solo es tristísimo" del
Gitano en M1 vuelve como lamento en M13; el "aunque sea bajito" que Mateo escribe en su
última página es el estribillo de la tribuna. **Si una letra dice algo que ningún personaje
diría, está mal escrita.** Todo en voseo. Sin tildes solo en la UI del juego: en las letras
van completas, porque las canta una persona, no las dibuja un canvas.

### Los cuatro leitmotifs *(sin cambios — las frases-semilla son sagradas)*

| Motivo | Frase-semilla (pegar tal cual) | Aparece en |
|---|---|---|
| **El Nido** (padre e hijo) | `a simple tender rising-then-falling whistled folk melody, like a father whistling to his son across a field` | Menú, P.1, Sobrevuelo, Clímax, Epílogos, Créditos |
| **La Birome** (el cuaderno) | `a fragile music-box-like guitar arpeggio that circles like handwriting` | Todas las páginas del cuaderno |
| **Los Fieles** (la hermandad) | `a proud brotherly brass-and-guitar theme that swells like a squadron flying wingtip to wingtip` | Briefings, epílogos de aire, sacrificios |
| **La Máquina** (la guerra) | `a cold pulsing mechanical synth ostinato like a radar sweeping in the dark` | Task Force, Callejón, misiones tardías |

### 🟥 EL ARCO DE «EL NIDO» — un tema, seis vidas *(3.13 — idea de Matías)*

**El leitmotif de El Nido no aparece: se TRANSFORMA.** Es la misma melodía de punta a punta
del juego, y lo único que cambia es quién la toca y cómo. El jugador la aprende sin darse
cuenta en el prólogo y la reconoce, sin poder nombrarla, cuando vuelve hecha otra cosa.

**⚠ LA CONDICIÓN TÉCNICA, Y NO ES NEGOCIABLE:** la melodía tiene que ser **tan simple que se
pueda silbar**. Si un jugador no puede silbarla después del prólogo, todo este sistema no
existe. La frase-semilla ya la define así —*un padre silbándole al hijo desde el otro lado
de un campo*— y esa simpleza es el requisito, no una limitación.

| # | Dónde | Cómo suena | Qué dice sin decirlo |
|---|---|---|---|
| **1** | **P.1, el arroyo** *(pista 11)* | **Un hombre silbando. Solo. Sin acompañamiento.** | Así empieza todo: un padre y un hijo en un arroyo |
| **2** | **Menú y M1–M3** *(pistas 01 y 13)* | **Versión AVENTURA:** guitarra criolla, vientos livianos, ritmo alegre, casi de serie de dibujos. **Simpática y confiada.** | Todavía parece una aventura. Para ellos también lo parecía |
| **3** | **M4–M8** *(pista 14)* | Misma melodía, **acompañamiento endurecido**: entra percusión militar, se van los vientos, el tempo se pone parejo y terco | Se les fue la sonrisa y ninguno lo dijo |
| **4** | **M9–M13** | **La melodía empieza a FALTAR.** La toca un solo instrumento, o queda solo el acompañamiento sosteniendo un tema que ya nadie toca | Es el mismo truco que la pista del Narwal: **falta uno y nadie lo anuncia** |
| **5** | **🟥 M14 / FINAL A** *(pista 28)* | **LA MELODÍA ENTERA, A TODO VOLUMEN: guitarras distorsionadas, batería doble, coro gritado.** Y debajo de todo, casi inaudible, **el silbido del arroyo** | Es la misma canción de la infancia, tocada por un tipo que está por morir arriba del nido de su hijo |
| **6** | **Créditos** | **Vuelve a ser un silbido. Solo. Como al principio.** | **Porque perdieron.** El tema hace el círculo completo y termina donde empezó: un hombre silbando |

### 🟥 Sobre la referencia de Matías: "Hero" (Chad Kroeger + Josey Scott, Spider-Man 2002)

**La referencia es correcta, y por una razón precisa:** *Hero* no es una canción de triunfo,
es una canción de **alguien que ganó perdiendo algo**. Triunfal y triste a la vez. Eso es
exactamente la vida 5 de este tema.

**Pero hay que ubicarla bien, y hay una trampa.** El juego **no termina en victoria** — el
post-créditos dice literalmente *"¿Y ganaron?" "No."*. Un himno metálico triunfal sobre el
final del juego contradice la tesis entera. Por eso:

- **SÍ en la pista 28, «La vorágine» (Final A).** Ahí el doc ya pide Mick Gordon y ya dice
  *"que la furia sea AMOR con otra cara: no es rabia vacía, es un padre peleando sobre el
  nido"*. **La versión pesada de El Nido va exactamente ahí.**
- **NO en los créditos.** Los créditos son la vida 6: el silbido solo.

### 🟥 Y una corrección de dirección: que NO suene a 2002

*Hero* sirve como **vara de emoción**, no como referencia de sonido. Si la versión pesada
suena a nu-metal norteamericano de los 2000, el juego se va del país y de la década.

**La referencia correcta es el HEAVY METAL ARGENTINO de principios de los 80** — V8,
Riff, y lo que después fue Hermética y Almafuerte. Guitarra sucia, batería seca, voz sin
técnica y con todo el aire adentro, producción cruda.

**Y acá está el hallazgo:** ese metal nació **exactamente en esos años, con esa misma
generación**. Los hermanos menores de los pibes de la clase 63 son los que inventaron ese
sonido. El juego ya cita a **Iorio** en el cierre *(⚠ y hay un problema abierto con su
nombre de pila — ver PREGUNTAS_HISTORICAS)*, que es el padre de ese género. **Cerrar la
misión final con el sonido que esa generación estaba a punto de inventar no es un
anacronismo: es la misma gente.**

---

### Paleta instrumental y reglas *(sin cambios)*

Lo criollo cerca de Mateo y la tierra; lo eléctrico/orquestal cerca del combate. Todo lo
cantado en español argentino (voseo). Loops de gameplay sin outro. Duraciones: gameplay/menú
2:00–3:00 · cinemáticas 1:00–1:30 · stingers 0:10–0:20 · canciones 2:30–3:30. Nombres según
`src/systems/audio.js`.

### 🟩 La regla de cierre — tres finales distintos, no uno

La v3 mandaba cerrar **todos** los prompts con `completely original music and lyrics`,
incluidos los instrumentales. Está mal, y no es un detalle de redacción: **nombrar `lyrics`
en un prompt instrumental es una de las formas más comunes de que el generador te devuelva
la pista cantada.** Le estabas pidiendo voces a 28 de las 36 pistas sin querer.

Cada prompt cierra ahora según lo que la pista realmente tiene:

| La pista… | Cierra con | Cuáles |
|---|---|---|
| **No tiene ninguna voz** | `Instrumental only - no vocals, no lyrics. Completely original music.` | 21 pistas |
| **Tiene voz pero no dice palabras** (tarareo, voz blanca, coro sin texto, silbido) | `No lyrics - the voice is wordless throughout. Completely original music.` | 11, 17, 20, 34, 36 |
| **Usa sonido humano como textura** (un aliento, el bramido de una multitud) | `No lyrics and no singing - any human sound is texture only. Completely original music.` | 09, 12 |
| **Se canta con letra** | `Completely original music and lyrics.` | las 8 del bloque LETRA |

La declaración de originalidad no se pierde en ningún caso: lo que cambia es que ahora dice
la verdad sobre cada pista.

---

## BLOQUE A — Interfaz y transversales

### 01 · `nido.mp3` — "El Nido" (tema principal / pantalla de campaña)
**Referencia real:** *Gustavo Santaolalla — "The Last of Us (Main Theme)"* — guitarra que
suena a hogar perdido; calidez con duelo abajo.

```
Warm intimate Argentine folk instrumental, 70 BPM, built around a simple
tender rising-then-falling whistled folk melody, like a father whistling to
his son across a field. Nylon-string criolla guitar fingerpicking, soft
bombo legüero heartbeat, distant wind ambience, a hint of bandoneon entering
halfway. Nostalgic, homely, quietly sad under the warmth, like a memory of a
summer that ended. Seamless loop, consistent energy, no big outro.
Instrumental only - no vocals, no lyrics. Completely original music.
```

### 02 · `story.mp3` — "Cuaderno y tinta" (cinemáticas base)
**Referencia real:** *Michael Kamen — "Band of Brothers (Main Titles)"* — la dignidad
documental: recordar sin música de héroes.

```
Somber cinematic documentary underscore, 60 BPM, low sustained strings,
sparse piano notes, faint bandoneon breathing, distant military snare rolls
appearing and dissolving, shortwave radio static as texture, grey South
Atlantic mood, restrained and dignified, history weighing on every bar. Slow
build without resolution. Seamless loop, no big outro. Instrumental only -
no vocals, no lyrics. Completely original music.
```

### 03 · `hangar.mp3` — "El invento" (M3 · el banco y la libreta del Pichón · briefings cálidos)
**Dónde:** la misión de comedia (M3) y **todas las pantallas de mejoras**. 🟩 *4.0: se le
suma el briefing de M1* — el hangar del mate, la foto de la bella dama y el terito recién
pintado no es una escena documental, y hasta ahora le tocaba la 02, que es de duelo.
**Referencia real:** *Julian Nott — "Wallace & Gromit (Theme)"* — inventor entrañable:
travesura mecánica con ternura. Bajarle el circo inglés, subirle el taller criollo.

```
Playful workshop instrumental, 95 BPM, bouncy criolla guitar and plucked
strings with a mischievous clarinet-like synth lead, light percussion on tin
cans and tool clanks woven musically, a wrench-drop and spring boing as
musical accents, warm and funny without being cartoonish, the sound of a
genius kid and a grumpy mechanic falling in love with an idea. Seamless
loop, no big outro. Instrumental only - no vocals, no lyrics. Completely
original music.
```

### 04 · `carta_1.mp3` — "La Birome" (el cuaderno, M1–M8)
**Referencia real:** *Yann Tiersen — "Comptine d'un autre été"* — la fragilidad circular,
un arpegio que da vueltas como una mano escribiendo.

```
Delicate intimate instrumental, 65 BPM, a fragile music-box-like guitar
arpeggio that circles like handwriting, solo nylon-string guitar with soft
room noise, subtle paper and pen foley woven into the music, faint warm
strings underneath, innocent and tender with cold wind far away, a boy
writing home from a trench. Seamless loop, no big outro. Instrumental only -
no vocals, no lyrics. Completely original music.
```

### 05 · `carta_2.mp3` — "La Birome rota" (el cuaderno, M9–M13)
**Referencia real:** *Max Richter — "On the Nature of Daylight"* — el mismo amor, herido.

```
Darker sparser variation of an intimate letter theme, 60 BPM, a fragile
music-box-like guitar arpeggio that circles like handwriting, now slower
with missing notes and hesitations, detuned edges, cold hollow reverb, low
cello drone of grief underneath, wind stronger than before, innocence
eroding but love intact. Seamless loop, no big outro. Instrumental only - no
vocals, no lyrics. Completely original music.
```

### 06 · `condor.mp3` — "Cóndor" (sting del ritual de lanzamiento)
**Dónde:** debajo de la fórmula de Cóndor antes de CADA misión. Quince segundos de
activación. En M14 se corta a la mitad, como la autorización.
**Referencia real:** *Ramin Djawadi — "Pacific Rim (Main Theme)"* — la épica de activación
de máquina, el escalofrío de "vamos".
**Ojo:** la voz de Cóndor **la pone el juego, no la pista.** Esta música se escribe para
tener un hueco de media frecuencia donde entre una voz de radio sin pelearse con ella.

```
Short 15-second military activation sting, 90 BPM, deep percussive hits
building like systems powering on one by one, low brass swell with an
electric guitar edge, a proud brotherly brass-and-guitar theme that swells
like a squadron flying wingtip to wingtip stated once, radio static texture,
a deliberate midrange gap in the arrangement for a radio voice to sit in,
ends cut abruptly as if the channel closed, goosebump launch energy.
Instrumental only - no vocals, no lyrics. Completely original music.
```

### 07 · `victory.mp3` — stinger de misión cumplida
**Referencia real:** *Harold Faltermeyer — "Top Gun Anthem" (primeros compases)* — el
orgullo aviador contenido, antes de que se vuelva festejo.

```
Short 15-second victory sting, proud brotherly brass-and-guitar theme that
swells like a squadron flying wingtip to wingtip, criolla guitar flourish
and bombo legüero accents under bright but warm brass, resolves gently
instead of triumphantly, relief more than glory, coming home rather than
conquering. Instrumental only - no vocals, no lyrics. Completely original
music.
```

### 08 · `fourth_star.mp3` — stinger de la cuarta estrella
**Referencia real:** *Ennio Morricone — "Gabriel's Oboe"* — lo casi sagrado en chiquito.

```
Minimal 12-second emotional sting: a simple tender rising-then-falling
whistled folk melody, like a father whistling to his son across a field,
performed as a single unaccompanied whistle over soft South Atlantic wind,
one warm guitar chord blooming at the end, intimate, reverent, almost
sacred. Instrumental only - no vocals, no lyrics. Completely original music.
```

### 🟩 09 · `relevo.mp3` — "El que sigue" (sting del relevo de escuadrón)
**Dónde:** la cinemática de relevo (`systems/squad.js`, estado `'relevo'`) — te bajaron y
otro Fiel toma el mando. **Hueco de la v3: el sistema existe implementado y no tenía
música.** Ocho segundos, dentro de los 2 s de invulnerabilidad. Tiene que caber en el
silencio que deja el motor y **no** sonar a "perdiste": suena a alguien que se sube.
**Referencia real:** *Hildur Guðnadóttir — "Chernobyl (Main Theme)"* — el sonido de entrar
a un lugar que ya mató a alguien, sin épica y sin música de derrota.

```
Eight-second cold transition sting, no tempo, one deep sub-bass drop like a
body hitting a seat, a single held metallic drone, one dry heartbeat thump,
a short intake of breath as texture, then a proud brotherly brass-and-guitar
theme that swells like a squadron flying wingtip to wingtip stated by ONE
lonely muted trumpet and cut off before it finishes, no drums, no
resolution, the sound of someone taking the stick from a dead man. No lyrics
and no singing - any human sound is texture only. Completely original music.
```

### 🟩 10 · `unlock_mirage.mp3` — "Mara" (placa de desbloqueo del Mirage 5P)
**Dónde:** la placa de sistema tras el epílogo de M10 — *"Diez llegaron del Perú el 5 de
junio de 1982. Nunca llegaron a combatir. **Acá, sí.**"* **Hueco de la v3.** Es el único
desbloqueo que no sale de la libreta del Pichón, y merece sonar distinto a todo:
agradecido, no triunfal.
**Referencia real:** *"El Cóndor Pasa"* (versión andina instrumental) — el mismo ADN que la
pista 21, pero corto y en modo mayor: la 21 es el regalo llegando tarde, ésta es el regalo
al fin puesto en las manos del jugador.

```
Twelve-second Andean unlock sting, one bright quena flute phrase answered by
a charango flourish, a single warm bombo hit, then a short proud brass swell
with Argentine cinematic colour taking the same melody, gratitude turning
into pride, generous rather than triumphant, ends on one clean sustained
chord that stays open instead of resolving down. Instrumental only - no
vocals, no lyrics. Completely original music.
```

---

## BLOQUE B — Prólogo

### 11 · `prologo_arroyo.mp3` — "Sapito" (P.1, el arroyo)
**Referencia real:** *Gustavo Santaolalla — "De Ushuaia a la Quiaca"* — el campo argentino
en guitarra, luminoso y con polvo; infancia con horizonte.

```
Sunlit Argentine countryside miniature, 75 BPM, playful criolla guitar and
soft charango, a simple tender rising-then-falling whistled folk melody,
like a father whistling to his son across a field, carried by real whistling
— a warm relaxed adult male whistle, slightly imperfect, close and dry in
the mix, the way a man whistles without noticing he is doing it — birdsong
and creek water ambience blended musically, childhood warmth with a faint
premonitory minor chord at the very end, like a cloud crossing the sun.
60-90 seconds with an arc. No lyrics - the voice is wordless throughout.
Completely original music.
```

### 12 · `prologo_radio.mp3` — "La pava que nadie saca" (P.2–P.3)
**Referencia real:** *Jóhann Jóhannsson — "The Beast" (Sicario)* — la amenaza que entra
gradual y aplasta; el miedo institucional hecho pulso.

```
Tense cinematic cue in three stages, 80 BPM: starts with a lonely kitchen-
warm guitar note fading, invaded by a cold pulsing mechanical synth ostinato
like a radar sweeping in the dark, then distorted military march drums and a
huge distant crowd roar swelling like a stadium and cutting to silence,
ending on one unresolved piano note under a phone busy-tone pulse and a
kettle whistle that nobody takes off the fire. Dread inside a home. 90
seconds with an arc. No lyrics and no singing - any human sound is texture
only. Completely original music.
```

> **El juego abre DIRECTO con 11 (Sapito) en P.1** — no hay P.0 al inicio. La escena de la
> puerta vive en el epílogo del Final A: va en silencio de sala hasta que Norma abre el
> cuaderno, y ahí entra 33 (Dos platos). El silencio es deliberado: la música del juego
> "vive adentro del cuaderno".

---

## BLOQUE C — Gameplay

### 13 · `game.mp3` — "Rasante" (gameplay Mov. I, M1–M4)
**Referencia real:** ⭐ *"Battlefield 1942 — Main Theme (intro)"* — LA base declarada de la
música del juego. Esta pista es su heredera directa.

```
High-energy instrumental action track, 150 BPM, surf-flavored distorted
electric guitar riffs over driving live drums, urgent bass, analog synth
arpeggios, brief heroic brass hits of a proud brotherly brass-and-guitar
theme that swells like a squadron flying wingtip to wingtip, bombo legüero
pushing the groove under the rock kit, fast, salty, exhilarating, wave-top
flying energy. Seamless loop, consistent energy, no big outro. Instrumental
only - no vocals, no lyrics. Completely original music.
```

### 14 · `game_callejon.mp3` — "Callejón de las Bombas" (gameplay Mov. II–III, M5–M13)
**Referencia real:** *Hans Zimmer — "Mombasa" (Inception)* — la persecución claustrofóbica
que no afloja.

```
Relentless dark action track, 155 BPM, aggressive palm-muted electric guitar
chugging, pounding toms and military snare, a cold pulsing mechanical synth
ostinato like a radar sweeping in the dark cutting through the mix, alarm-
like guitar stabs, no triumphant melodies, claustrophobic walls of sound
opening only in short breaths, flying through a corridor of flak. Seamless
loop, consistent energy, no big outro. Instrumental only - no vocals, no
lyrics. Completely original music.
```

### 15 · `boss.mp3` — "El buque" (fase ARENA / boss)
**Referencia real:** *"Zero" — Ace Combat Zero (tema final)* — el duelo aéreo con guitarra
española contra orquesta: David criollo contra la máquina.

```
Epic boss-battle hybrid track, 140 BPM, massive cinematic orchestra
colliding with distorted electric guitars, deep brass blasts like ship
horns, a cold pulsing mechanical synth ostinato like a radar sweeping in the
dark representing the warship, answered by defiant criolla-guitar-flavored
heroic phrases representing the small silver jet, David versus Goliath
tension, huge dynamic contrasts. Seamless loop, consistent energy, no big
outro. Instrumental only - no vocals, no lyrics. Completely original music.
```

---

## BLOQUE D — Los picos emocionales

### 🟩 16 · `chancha.mp3` — "La Chancha no abandona" (M6, el reabastecimiento)
**Dónde:** el Gitano se queda sin nafta de noche y aparece el KC-130 — *"gorda, lenta,
hermosa"*. La manguera conectada, el reflector, el fuego antiaéreo, y la Chancha que **no
se desconecta** hasta que el cordobés termina de cargar. **Hueco de la v3: la escena que
funda toda la trama de combustible del tercer acto no tenía música.**
**Referencia real:** *Hans Zimmer — "Supermarine" (Dunkirk)* — la máquina que se queda
sosteniendo la posición mientras el reloj sube; heroísmo de fierro pesado, sin fanfarria.

```
Slow-rising cue of heavy machinery heroism, 62 BPM building to 88, opens
with a lonely low engine drone over night sea ambience, one enormous warm
brass chord arriving like something huge appearing out of the dark, gentle
rocking rhythm in low strings like a fat slow aircraft holding steady, a
tender clarinet-like line of gratitude over it, then anti-aircraft
percussion entering underneath WITHOUT the melody speeding up — the machine
refuses to move — building to a single metallic tearing impact, after which
the warm brass keeps playing wounded and lower, limping west. Ugly and
beautiful at once, an animal taking a hit for someone. 90 seconds with an
arc. Instrumental only - no vocals, no lyrics. Completely original music.
```

### 17 · `vasco.mp3` — "La foto era de mi vieja" (M7, muerte del Vasco)
**Referencia real:** *Astor Piazzolla — "Adiós Nonino"* — EL duelo argentino en bandoneón;
Piazzolla la escribió por la muerte de su padre.
**La voz:** un solo hombre, 50-60 años, **tarareando sin palabras** — no canta: acompaña.
Timbre gastado, respiración audible, algo desafinado. Lejos en la mezcla, como si viniera
de otra pieza del hangar. Es el consuelo que un tipo se da a sí mismo cuando está solo.

```
Devastating minimal elegy, 55 BPM, solo bandoneon breathing long sorrowful
phrases over near-silence, sparse low piano, a thread of radio static that
slowly fades to nothing mid-piece leaving the bandoneon alone, and one
distant weathered male voice aged fifty to sixty humming wordlessly like a
half-remembered lullaby, breath audible, slightly out of tune, placed far
back in the mix as if heard from another room, restrained masculine grief,
no drums, ends unresolved. 90 seconds. No lyrics - the voice is wordless
throughout. Completely original music.
```

### 🟩 18 · `rosa_elena.mp3` — "El reverso" (M7, el locker — sting)
**Dónde:** el Turco despega la foto de la bella dama y **la da vuelta**: *Rosa Elena
Arrieta · 1926–1961 · "Te amo, mamá. Perdoname."* **Hueco de la v3.** Necesita pista propia
porque es un cambio de significado, no un momento de duelo: toda una guerra de chistes se
reescribe en dos segundos. La 17 sigue después, para el resto de la escena.
**Referencia real:** *Thomas Newman — "Any Other Name" (American Beauty)* — el piano que
reencuadra todo lo anterior sin subir un decibel.

```
Twelve-second reveal sting, no tempo, absolute silence broken by one soft
piano note, then a second note a minor third below, then a third — three
notes total, placed slowly, each one letting the room tone breathe between
them — under them a barely audible high string harmonic swelling and dying,
no percussion, no melody, no resolution, the sound of understanding
something too late. Instrumental only - no vocals, no lyrics. Completely
original music.
```

### 19 · `sobrevuelo.mp3` — "El batir de alas" (M8, el sobrevuelo + el terito)
**Referencia real:** *Hans Zimmer — "Cornfield Chase" (Interstellar)* — padre e hijo,
velocidad y asombro, lágrimas y orgullo en el mismo compás.

```
Soaring emotional cinematic piece, 72 BPM, begins as a lone jet engine hum
blending into warm strings, then a simple tender rising-then-falling
whistled folk melody, like a father whistling to his son across a field,
taken up by full orchestra with criolla guitar and bombo legüero heartbeat
underneath, slow-motion wonder, tears and pride at once, an entire string
section holding its breath then blooming when the wings rock, ends soft like
a hand waving goodbye. 90 seconds with a clear emotional peak. Instrumental
only - no vocals, no lyrics. Completely original music.
```

### 20 · `pichon.mp3` — "Era un pibe" (M9, muerte del Pichón)
**Referencia real:** *Gustavo Santaolalla — "All Gone (No Escape)" (The Last of Us)* — el
sonido de la culpa: cuando la pérdida es también responsabilidad.
**La voz:** una sola nota sostenida de **voz blanca** — un chico de once o doce años, sin
vibrato, sin técnica, limpia y sin emoción actuada. Entra tarde, dura poco y se apaga como
si le cortaran el aire. No canta una melodía: sostiene una nota y la pierde. Es la edad que
el Pichón todavía tenía adentro.

```
Tragic sparse cue, 50 BPM, a lone deconstructed music box playing a broken
child-like melody, low string clusters of guilt swelling and receding, one
sub-bass impact like a distant sea swallowing something, then long silence
filled only by wind, and one single sustained boy-treble voice note — an
eleven-year-old, no vibrato, no technique, emotionally neutral, entering
late and cut off mid-breath rather than fading — grief with the weight of
it-should-have-been-me. 75 seconds, ends in near silence. No lyrics - the
voice is wordless throughout. Completely original music.
```

### 21 · `primos.mp3` — "Los primos" (M10, el intercalado de Tandil)
**Dónde:** **solo sobre el corte a Tandil** — los diez Mirage rodando al amanecer, la
escarapela fresca, el Hércules batiendo las alas al irse. **La misión NO lleva música** (ver
la ausencia documentada abajo): el contraste entre el silencio del frente cerrado y esta
melodía es el efecto.
**La emoción:** no es alivio ni esperanza. Es **belleza que llega tarde** — gratitud
verdadera con una tristeza que el jugador entiende y los personajes no.
**Referencia real:** *"El Cóndor Pasa"* (versión andina instrumental, quena y charango) —
tocada como despedida, no como llegada.

```
Andean farewell piece, 66 BPM, solitary warm quena flute melody over sparse
charango arpeggios and one criolla guitar, no percussion at first, a single
soft bombo heartbeat entering late, muted cinematic strings swelling gently
and then pulling back before they resolve, beauty arriving too late to help
anyone, gratitude with grief underneath, cold dawn light rather than golden
afternoon, ends unresolved with the flute alone fading, no triumph. 90
seconds with an arc. Instrumental only - no vocals, no lyrics. Completely
original music.
```

> **La ausencia de M10 (no es una pista: es su falta).** La misión se juega **sin música**:
> viento, motor, lluvia sobre la cúpula y la señal de Cóndor entrando y saliendo. La única
> música de la misión suena a dos mil kilómetros de ahí. Si alguna vez se compone algo para
> ese vuelo, que sea un drone de una sola nota.

### 22 · `correa.mp3` — "El ángel Correntino" (M12, muerte de Correa)
**Referencia real:** *Transito Cocomarola — "Kilómetro 11"* — EL chamamé. La ternura
litoraleña exacta del Colorado: río ancho, pena dulce, dignidad de hombre bueno.
**La voz:** hombre de unos 30, **acento correntino/litoraleño**, voz media y cálida, sin
potencia y sin vibrato de cantante — canta como quien canta trabajando. Contenida hasta el
final: **nunca se quiebra**, porque Correa se despide dando por hecho que Mateo sobrevive.
Adelante en la mezcla pero baja de volumen, íntima, con el acordeón por encima de ella.

```
Heartbreaking slow chamamé from Corrientes Argentina, 68 BPM in 6/8, weeping
accordion lead full of Litoral longing, nylon-string guitar accompaniment, and a
warm mid-range male voice around thirty years old singing in Argentine Spanish
with a Corrientes Litoral accent — untrained, no vibrato, no power, the voice of a
man who sings while he works — held gently restrained and never breaking, mixed
close and quiet with the accordion above it, river-wide tenderness colliding with
war ambience of distant shelling that never overpowers the music, a good man's
soul going home to his river, ends on a single sustained accordion note. 90
seconds. Completely original music and lyrics.
```

**LETRA**

```
Si el río me llama de vuelta
y no llego a decirte adiós,
llevale jazmines, chamigo:
a la Teresa le gusta esa flor.

Angá, no me llore, chamigo,
que un correntino cumplió.
Yo salgo con vos de este pozo
aunque salga en la sombra de vos.

(tarareo de cierre, sin palabras, hasta que solo queda el acordeón)
```

### 23 · `asado.mp3` — "La última mesa" (M13, el asado)
**Referencia real:** *Jorge Cafrune — "Zamba de mi esperanza"* — la zamba de fogón con voz
gastada y querible.
**La voz:** el Gitano. Hombre de 33, **acento cordobés** (tonada estirada, vocales
alargadas), voz de fumador, **desafinando con dignidad** — se va de tono en las notas altas
y no le importa. Canta bajito, para la mesa, no para nadie más. Muy adelante y muy seca en
la mezcla, con el fuego crepitando alrededor. En la última estrofa se le raja la voz una
sola vez y sigue igual. **Que no la arreglen: la imperfección es el personaje.**

```
Intimate Argentine campfire zamba, 60 BPM in gentle 6/8, sung by one weathered
male voice around thirty-three years old with a Córdoba Argentine accent — smoker's
timbre, untrained, singing softly and noticeably out of tune with loving
imperfection, drifting flat on the high notes and not correcting it, voice cracking
once in the final verse and continuing anyway — recorded very close and dry as if
sung to four people around a fire, criolla guitar and soft bombo legüero, real fire
crackle ambience, brotherhood and farewell in the same breath, ends with the voice
fading and only the fire remaining. Do not pitch-correct the vocal. 2 minutes.
Completely original music and lyrics.
```

**LETRA**

```
Prendé el fuego, cordobés,
que la noche viene larga,
y hay más sillas en la mesa
que muchachos que se sientan.

Traé la foto, traé el cuaderno,
traé el mate que quedó frío:
los que faltan a esta mesa
esta noche están servidos.

Por los que no están, hermano,
por los que no van a estar.
Levantá el vino en el tetra
que mañana hay que volar.

Y si mañana no volvemos,
que alguien cebe igual el mate,
que cebar solo es tristísimo —
por eso, hermano, volvete.
```

> El cierre de la letra es el chiste del Gitano en el hangar de **M1** — *"si no volvés, te
> lo cebo igual, pero solo… Cebar solo es tristísimo, así que volvé"* — vuelto lamento doce
> misiones después. Es la única broma del juego que se cobra sola.

### 🟩 24 · `la_carta.mp3` — "Por las dudas" (M13, la noche después del asado)
**Dónde:** las brasas apagándose, Esteban solo escribiendo la única carta del juego. La
cámara lo muestra **escribir** —los tachones, la lapicera que se frena y sigue— y no deja
leer una línea. **Hueco de la v3.** No puede sonar la 05 (La Birome): ese tema es del
cuaderno de Mateo, y este papel es del padre. Son dos manos distintas.
**Referencia real:** *Thomas Newman — "Brooks Was Here" (The Shawshank Redemption)* — un
hombre escribiendo lo que espera que nadie tenga que leer, en piano llano, sin autocompasión.

```
Quiet solitary cue, 56 BPM, solo upright piano with felt on the hammers,
single notes and long rests, one warm low string pad breathing far
underneath, pen-on- paper and dying-embers foley woven in as rhythm rather
than effect, the melody starting three separate times and abandoning itself
twice before it finishes — like a man crossing out lines — no percussion, no
swell, no catharsis, plain and adult and unsentimental, ending on an
unresolved chord as a locker door closes. 70 seconds. Instrumental only - no
vocals, no lyrics. Completely original music.
```

---

## BLOQUE E — La misión final (M14)

### 25 · `final_pista.mp3` — "Los teros" (antes de despegar)
**Referencia real:** *Hans Zimmer — "Journey to the Line" (The Thin Red Line)* — la
valentía fúnebre: caminar hacia algo enorme, despacio.

```
Low tense nocturnal cue, 58 BPM, deep sustained drone and a slow heartbeat
pulse, faint radio chatter texture being switched off, then unaccompanied
criolla guitar stating fragments of a proud brotherly brass-and-guitar theme
that swells like a squadron flying wingtip to wingtip, quiet and funereal-
brave, the cry of a tero bird echoing once in the far distance, three
engines igniting as the final chord. 75 seconds with an arc. Instrumental
only - no vocals, no lyrics. Completely original music.
```

### 26 · `final_sacrificio.mp3` — "Plata Fiel" (contrarreloj y sacrificios)
**Referencia real:** *Hans Zimmer — "No Time for Caution" (Interstellar, el docking)* — el
heroísmo desesperado en oleadas, el órgano que no te deja respirar, y el corte.
**La voz:** coro masculino grande, 20-30 voces, **cantando en unísono y casi gritado, sin
técnica coral** — no es un coro de iglesia, es una tribuna que se volvió ejército. Las
únicas palabras son el indicativo y el ritual de Cóndor, repetidos como una consigna. Muy
atrás y muy ancho en la mezcla, sepultado por la orquesta, subiendo con cada oleada. **Y la
última línea la dice UNA sola voz hablada, seca y cerca, en el segundo previo al silencio.**

```
Massive epic orchestral-rock sacrifice sequence, 100 BPM rising to 130, full
cinematic orchestra with a large male choir of twenty to thirty untrained voices
chanting in rough unison — closer to a football terrace than a church choir,
shouted more than sung, wide and buried deep behind the orchestra, rising one
level with each wave — thundering bombo legüero and military percussion, a
ticking-clock percussion layer rising in urgency, soaring distorted electric
guitar carrying a proud brotherly brass-and-guitar theme that swells like a
squadron flying wingtip to wingtip, waves of heroic build as one guardian falls
and another takes his place, relentless forward motion, tragic and glorious at
maximum intensity, then THE ENTIRE TRACK CUTS TO ABSOLUTE SILENCE at the peak —
two seconds of nothing, broken only by one dry spoken male voice very close to the
microphone — closing with a single jet engine hum alone. 3 minutes. Completely
original music and lyrics.
```

**LETRA**

```
(CORO — en oleadas, cada vez más fuerte, siempre las mismas palabras)
Plata Fiel.
Plata Fiel.
Bajito y a casa.

Plata Fiel.
Plata Fiel.
Bajito y a casa.

(VOZ SOLA — hablada, seca, en el segundo antes del silencio total)
Tres desayunos.
```

> "Tres desayunos" es lo último que dijo el Turco en la pista, esperando a tres. Dicho acá
> —cuando ya cayeron dos— es la puñalada. Si el generador no clava el corte a silencio
> después de esa línea, se edita a mano: **el corte es parte de la partitura.**

### 27 · `final_decision.mp3` — "Reserva" (el monte apagado y los dos rumbos)
**Referencia real:** *Arvo Pärt — "Spiegel im Spiegel"* — el vacío infinito y quieto,
mientras el jugador decide.

```
Barely-there ambient grief piece, 45 BPM, a lone jet engine hum as the tonal
floor, fragments of a simple tender rising-then-falling whistled folk
melody, like a father whistling to his son across a field, played impossibly
slow on a distant detuned piano with long silences between notes, cold wind,
no percussion, no resolution, a father circling an extinguished hill,
infinite and hollow. Seamless loop, no big outro. Instrumental only - no
vocals, no lyrics. Completely original music.
```

### 28 · `voragine.mp3` — "La vorágine" (FINAL A — quedarse)
**Dónde:** el jugador vira a la oleada y el juego se lo da todo. La música más grande de la
banda.
**Referencia real:** *Mick Gordon — "The Only Thing They Fear Is You" (DOOM Eternal)* — la
adrenalina por los ojos. **Vara emocional:** el final de The Last of Us — que la furia sea
AMOR con otra cara. No es rabia vacía: es un padre peleando sobre el nido.
**La voz:** coro masculino **gritado, roto, sin afinar** — gente sin entrenamiento vocal
gritando a pleno pulmón, con las gargantas ya cansadas. Adelante y arriba, encima de la
distorsión. Y debajo de todo, **hablado casi al oído**, un hombre repitiendo la frase que le
dijo a su hijo de ocho años en un arroyo. Esa capa tiene que estar tan abajo que el jugador
no sepa si la escuchó.

```
Overwhelming final-stand hybrid track, 160 BPM, colossal distorted electric guitar
riffs and double-kick drums fused with full orchestra and a male choir ROARING —
untrained voices shouting at full lung, throats already tired, ragged and unpitched,
mixed forward and above the distortion — a proud brotherly brass-and-guitar theme
that swells like a squadron flying wingtip to wingtip transformed into a furious
battle cry, bombo legüero pounding inside the metal, waves upon waves of enemies in
sound, grief weaponized into glory, the loudest most cathartic piece of the entire
game. Underneath everything, two hidden layers barely at the threshold of hearing:
one lone male voice speaking a short phrase intimately close to the microphone, and
a simple tender rising-then-falling whistled folk melody, like a father whistling to
his son across a field, holding the rage together. Seamless loop that never decays.
Completely original music and lyrics.
```

**LETRA**

```
(CORO — rugido, en oleadas, toda la pista)
¡Volá bajo!   ¡Volá bajo!
¡Sobre el nido!   ¡Sobre el nido!

¡Volá bajo!   ¡Volá bajo!
¡Acá estamos!   ¡Acá estamos!

(VOZ HABLADA — casi inaudible, debajo de todo, repetida sin cambiar de tono)
Los valientes vuelan abajo.
Los valientes vuelan abajo.
Los valientes vuelan abajo.
```

> La capa hablada es la frase que Esteban le dice a Mateo de ocho años en P.1. Bajo la
> pelea más ruidosa del juego, un padre le repite a un chico que ya no está la única cosa
> que supo enseñarle. **Si se escucha claro, está mal mezclada.**

### 29 · `final_b.mp3` — "El planeo" (FINAL B — volver + el mate)
**Dónde:** la vuelta con la nafta en rojo planeando como el sapito, la panza en el pasto,
y —años después— la mesa con el Turco, el cuaderno abierto, Norma en el jazminero.
**Referencia real:** *Gustavo Santaolalla — "The Path (A New Beginning)" (The Last of Us,
final)* — la paz rota y verdadera del semi feliz: sobrevivir también cuesta.

```
Quiet survivor's epilogue piece, 58 BPM, solo criolla guitar with warm
imperfect fingering, long pauses, joined gently by soft strings and a
distant bandoneon breath, a simple tender rising-then-falling whistled folk
melody, like a father whistling to his son across a field, played incomplete
— missing its final note the first two times, resolved only at the very end,
peace that carries scars, mate-and-silence warmth, a jasmine garden through
a window, ends on one held warm chord and birdsong. 2 minutes with an arc.
Instrumental only - no vocals, no lyrics. Completely original music.
```

---

## BLOQUE F — La hinchada (PACK ORIGINAL del ciclo `pmetal_*`)

> **El origen de este bloque está en el guion, y conviene tenerlo presente al generarlo.**
> En su última página, M13, Mateo escribe: *"Acá los pibes cantan bajito para no llorar.
> Ojalá algún día, allá, alguien cante por nosotros. Aunque sea una vez. Aunque sea
> bajito."* Las tres pistas de la tribuna son ese deseo cumplido. **La 31 lo dice literal.**

### 30 · `pmetal_1.mp3` — "De pie" (aliento épico)
**Referencia real:** *La Renga — "Panic Show"* — el aguante del rock barrial argentino: la
cancha y la gira en la misma garganta.
**La voz:** una voz líder masculina rasposa y con potencia, 30-40, **acento rioplatense
marcado**, más gritada que cantada; y una multitud de hombres respondiéndole en unísono
sucio (no afinado, no cuadrado, con voces adelantadas y atrasadas). Llamada y respuesta.
La multitud graba lejos y ancha; el líder cerca y comprimido.

```
Anthemic Argentine stadium-rock chant, 120 BPM, one raspy powerful male lead voice
aged thirty to forty with a marked Rioplatense Argentine accent, shouting more
than singing, answered in call-and-response by a huge crowd of male voices in
dirty unpitched unison with voices landing early and late — never quantized, never
tuned — lead close and compressed, crowd wide and distant, driving distorted
guitars, stadium drums and clapping bombo legüero, raw passionate and defiant,
football-terrace energy fused with military march power. Seamless loop-friendly
structure. Completely original music and lyrics, no reference to any existing song
or anthem.
```

**LETRA**

```
(VERSO — voz líder)
Si me caigo me levanto,
si me apagan vuelvo a arder,
que en el barro de esta cancha
aprendí a no retroceder.

(PRE — la multitud entra)
Vamo' que arranca, vamo' que vuela,
vamo' que el cielo se abrió otra vez.
Al que se queda lo vamos a buscar:
acá no se deja a nadie atrás.

(ESTRIBILLO — todos)
¡De pie, de pie, de pie!
¡Que se levante el que cayó!
¡De pie, de pie, de pie!
¡Que todavía queda motor!
```

### 31 · `pmetal_2.mp3` — "Los pibes del sur" (aliento emotivo)
**Referencia real:** *"Muchachos, ahora nos volvimo' a ilusionar" (La Mosca / la hinchada,
2022)* — la tribuna que llora y canta a la vez, con los pibes de Malvinas adentro de la
letra. El guion ya la señala como el deseo cumplido de Mateo.
**La voz:** empieza **una sola voz masculina cálida y rota**, 40 y pico, sin micrófono
aparente, con una guitarra: alguien cantando en una vereda. A la mitad entra la multitud —
hombres y mujeres, todas las edades, muchos desafinando, **algunos claramente llorando**. El
último verso lo dice una sola voz, casi hablado, sin música. **Es la única pista del juego
donde se permite que se oiga a alguien quebrarse.**

```
Emotional mid-tempo stadium anthem, 95 BPM, opening with one warm broken male
voice in his forties singing alone with a criolla guitar, close and unamplified
like someone singing on a doorstep, joined at the halfway point by a massive mixed
crowd of men and women of all ages singing in unison — visibly untrained, several
voices audibly crying, none corrected — with bombo legüero and brass swelling into
a tearful roaring chorus, pride and mourning braided together, then dropping to
ONE lone spoken voice with no music at all for the final line. Do not pitch-correct
anything. Completely original music and lyrics, no reference to any existing song
or anthem.
```

**LETRA**

```
(VOZ SOLA, con guitarra)
Hay un frío que no tiene nombre
y unos pibes que no tienen edad,
que se tapan de a dos con un cuero
y se aguantan la noche cantando bajo.

(ENTRA LA MULTITUD)
Y allá lejos alguien canta,
alguien canta por los pibes del sur.
Aunque sea una vez, aunque sea bajito,
que se escuche en el mar esta luz.

(ESTRIBILLO — la tribuna entera)
¡Pibes! ¡No están solos!
¡Los estamos cantando acá!
El que no volvió del frío
esta noche vuelve en el cantar.

(FINAL — una sola voz, hablada, sin música)
Volveremos. Volveremos otra vez.
```

> La última línea es el cartel final del juego, con la letra de Mateo. Acá se dice en voz
> alta por primera vez. **Que la diga alguien viejo.**

### 32 · `pmetal_3.mp3` — "Huevos" (aliento agresivo, ciclo de muerte)
**Referencia real:** *2 Minutos — "Ya no sos igual"* — punk barrial acelerado y coreable:
la bronca alegre que te hace apretar restart.
**La voz:** coro de barra gritado a full, **sin voz líder que descolle** — cuatro o cinco
tipos jóvenes gritando encima del micrófono, saturando un poco. Nada de melodía: son
consignas. Todo adelante, todo comprimido, todo sucio.

```
Aggressive fast stadium punk-rock chant, 165 BPM, shouted gang vocals from four or
five young male voices yelling straight into the microphone with slight clipping
and no dominant lead singer, no melodic singing at all — pure chanted slogans —
buzzsaw guitars, pounding drums with bombo accents, short sharp verses built for
retrying after dying, furious joy, terrace whistles and claps, adrenaline that
makes you hit restart. Everything forward, compressed and dirty. Seamless
loop-friendly. Completely original music and lyrics, no reference to any existing
song or anthem.
```

**LETRA**

```
(VERSO)
¡Otra vez, otra vez, otra vez,
que la máquina no me va a ganar!
¡No tengo radar, tengo las manos,
y un corazón que no sabe frenar!

(ESTRIBILLO)
¡No es que no tenga miedo!
¡Es que igual me voy a subir!
¡Huevo, huevo, huevo!
¡Todavía no me morí!

(PUENTE — gritado más lento, marcando)
¡Po-ne-le el pecho!
¡Po-ne-le el alma!
¡Que el que vuela bien abajo
no se cae: se sostiene!
```

> *"No es que no tenga miedo, es que igual me voy a subir"* es la definición de coraje que
> Mateo le escribe al padre en M13 — *"Ser valiente no es no tener miedo, pá. Es escribirte
> igual, con la mano temblando"*. Ojo: es la **idea** transpuesta, no la frase; el que canta
> acá es el que se sube al avión. Es la pista de reintentar después de morir: tenía que decir
> exactamente eso.
>
> ⚠ **Quién canta cada cosa — la regla que esta pista casi rompe.** El verso dice *"no tengo
> radar, tengo las manos"*, que es la tesis de Puma en M2 (*"Ellos tienen la máquina,
> nosotros tenemos las manos"*) y además es literalmente cierto: **el A-4B no tenía radar**,
> y de ahí sale Cóndor como radar humano. Una versión anterior decía *"tengo tres meses de
> instrucción"* — **error grave**: los tres meses son de **los conscriptos**, no de los
> pilotos. Esteban es Primer Teniente con veinte años en la Fuerza. Y esa cifra es una
> acusación del guion, no un color: *"Nos enseñaron a marchar y a tender la cama. No a que el
> de al lado se apague en la mitad de una palabra"* (M7). Ponerla en boca de un piloto la
> desactiva. **Antes de escribir cualquier letra nueva, preguntarse quién la canta y qué
> puede decir esa persona con verdad.**

---

## BLOQUE G — Epílogo, cierre y créditos

### 33 · `epilogo.mp3` — "Dos platos" (la mesa de Norma — epílogo del Final A)
**Referencia real:** *Mercedes Sosa — "Alfonsina y el mar"* — el duelo argentino de cocina
y mar; una mujer, una mesa, una ausencia.

```
Quiet devastating piano and guitar duet, 55 BPM, begins with near-silent
room tone and a kettle whistle blending into a high string harmonic, sparse
piano notes like objects placed on a table, then a fragile music-box-like
guitar arpeggio that circles like handwriting entering when the notebook
opens, finally blooming gently into a simple tender rising-then-falling
whistled folk melody, like a father whistling to his son across a field,
carried by soft strings — the two themes of the game meeting for the first
time in one piece, ends warm and shattered at once. 2 minutes with an arc.
Instrumental only - no vocals, no lyrics. Completely original music.
```

### 🟩 34 · `cierre.mp3` — "Los que no volvieron" (cierre común: narración, cartela y la frase)
**Dónde:** después de cualquiera de los dos finales. La narración sobre **fotografías
reales** —veteranos, el mar, Darwin, las cruces blancas—, la cartela de los países que
ayudaron, y la frase que cierra el juego. **Era el hueco más grande de la v3:** entre el
epílogo y los créditos había cinco minutos de lo más serio del juego, sin música asignada.
**La regla:** esta pista acompaña **fotos de muertos reales de los dos lados.** No puede
tener épica, no puede tener orgullo y no puede tener catarsis. Y tiene que dejar aire: hay
una voz narrando encima.
**La voz:** coro **mixto** y lejano, sin palabras, sostenido — hombres y mujeres, muy
atrás, sin solistas y sin nadie que destaque, porque no hay protagonista en esta parte. Que
suene a mucha gente que no vamos a conocer.
**Referencia real:** *John Williams — "Hymn to the Fallen" (Saving Private Ryan)* — escrita
exactamente para esto: los muertos de una guerra, con dignidad y sin victoria.

```
Solemn elegiac orchestral piece, 52 BPM, low strings and muted brass moving
in slow dignified steps, a single unaccompanied trumpet-like line stating a
plain melody once without embellishment, a distant wordless mixed choir of
men and women sustaining long chords far back in the mix with no soloists
and nobody standing out, one soft bombo legüero heartbeat, criolla guitar
entering only near the end, and a deliberately sparse midrange so a speaking
narrator sits clearly on top. Mourning for the dead of BOTH sides equally,
no triumph, no pride, no catharsis, no swell into victory — dignity and
plain sorrow only. Ends on one open unresolved chord under wind. 3 minutes,
slow arc. No lyrics - the voice is wordless throughout. Completely original
music.
```

> **Timing:** cuando entra la cartela de los países que ayudaron —**"Al Perú, el
> primero"**— la quena de la pista 21 aparece **una sola vez**, cuatro notas, y se va. Es
> la única cita interna de todo el score. Después vuelve el coro para la frase final.

### 35 · `creditos.mp3` — "Volá bajo" (canción de créditos)
**Referencia real:** *Patricio Rey y sus Redonditos de Ricota — "Jijiji"* — la energía
oscura que genera pogo y escalofrío a la vez; himno generacional sin ser marcha. *(Y el
pulso general, como todo el score, mira al intro de Battlefield 1942.)*
**Las voces — son DOS, y eso es la canción.** La principal es una voz masculina argentina
de rock, 35-45, **rasposa, con aire, sin perfección** — canta al filo del grito en los
estribillos y baja a casi hablado en el puente. Rioplatense pleno, voseo natural. Es **el
hijo**: los versos 1 y 2 y el estribillo son de Mateo, hablándole al padre.
La segunda entra solo en la RESPUESTA: **más grave, más vieja, más atrás en la mezcla**, sin
esfuerzo, casi dicha. Es **el padre**, y no le contesta al hijo — le habla a la madre. Nunca
cantan juntos y nunca se cruzan. En el estribillo se suma la multitud (la misma tribuna del
bloque F: es a propósito). **El último bloque es una voz sola y una guitarra, sin ninguna
capa, y termina silbando.**

```
Original adrenaline-fueled Argentine electro-rock anthem, 160 BPM, TWO
separate male lead voices that never sing together and never overlap: the
main one a raspy breathy male rock voice aged thirty-five to forty-five with
a full Rioplatense Argentine accent and natural voseo, singing at the edge
of a shout in the choruses and dropping to almost-spoken in the bridge,
never polished and never pitch-corrected, joined in the choruses by the same
terrace crowd heard elsewhere in the game; and a SECOND male voice, older
and lower, entering only for the response sections, unstrained and almost
spoken, mixed further back and never doubling the first. Fast live-style
drums with bombo legüero accents, distorted electric guitar riffs as the
main hook, urgent bass, analog synth arpeggios, dramatic full stops. Include
a short virtuosic electric guitar solo before the final chorus, and end the
song completely stripped: one voice and one criolla guitar with no other
layers, closing on a simple tender rising-then-falling whistled folk melody,
like a father whistling to his son across a field, whistled by that same
voice. Cinematic, raw, fast and emotionally powerful; completely original
music and lyrics.
```

**LETRA**

```
(VERSO 1)
Me enseñaste una piedra en el agua:
si va rápido y pegada, no se hunde jamás.
Yo tenía ocho años y un cuaderno en las rodillas,
vos un uniforme y el cielo detrás.

(VERSO 2)
Me tocó el frío, me tocó el pozo,
me tocó escribirte lo que nunca llegó.
Vos me tocaste el techo con las alas
y entre mil casquitos iguales yo te vi. Te vi, pá. Te vi.

(ESTRIBILLO — el hijo, al padre)
¡Volá bajo!
Que abajo no te ven, que abajo se sobrevive.
¡Volá bajo!
Pegadito a la tierra, pegadito a los que quedan.

(RESPUESTA — el padre, a la madre. Otra voz, más grave, más atrás)
Y si un día pasa un motor bien rasante,
salí a mirarlo con ese orgullo tuyo que asusta:
somos nosotros, yendo a verte.

(VERSO 3)
No hay bandera que valga un pibe,
no hay discurso que encienda un fogón.
Los de arriba mandaron la guerra;
los de abajo pusimos el corazón.

(PUENTE — casi hablado, la banda baja)
Hay gente buena de los dos lados del mar.
Lo que pasa es que no nos dejan conocernos.

(SOLO DE GUITARRA)

(ESTRIBILLO FINAL — con la tribuna entera)
¡Volá bajo! ...

(CIERRE — una voz, una guitarra, nada más)
Volveremos.
Volveremos otra vez.
(y se va silbando)
```

> El puente es del **Turco**, no de nadie afuera del juego: es lo que dice en el hangar de
> M10 cuando se entera de lo de Perú. Se usa esa versión —y no la cita firmada de la
> cartela final— a propósito: **una canción no debería poner en boca de un intérprete las
> palabras textuales de una persona real.** La cartela ya hace ese trabajo, con nombre y
> comillas, que es como corresponde.

### 36 · `postcreditos.mp3` — "El pibe de la 10" (post-créditos)
**Referencia real:** *Alan Silvestri — "Feather Theme" (Forrest Gump)* — la liviandad
luminosa después del peso: una pluma, un vidrio, una mano chiquita.
**La voz:** voces de **chicos de escuela**, seis a nueve años, tarareando sin palabras y sin
saber tararear del todo — algunos se adelantan, alguno se calla. Muy lejos, como si vinieran
del patio de al lado. **Nada de coro de niños entrenado:** eso convierte la escena en
publicidad.
**⚠ Timing exacto, importa:** la escena tiene un **"No."** en el medio (*¿y ganaron?*). La
música **se corta ahí**, o baja a nada, y **vuelve recién sobre la frase** (*"Nunca, nunca,
nunca dudes del corazón de un argentino"*). El silencio del "No" es la mitad del efecto:
sin esa caída, la frase suena a propaganda; con ella, suena a lo que es.

```
Tiny luminous epilogue piece, 70 BPM, a real music box playing a simple
tender rising-then-falling whistled folk melody, like a father whistling to
his son across a field, joined halfway by distant untrained schoolchildren
aged six to nine humming wordlessly — imperfect, some ahead of the beat, one
dropping out — recorded far away as if drifting from a neighbouring
courtyard, plus one warm string swell, morning-light hope after grief, a new
generation touching the glass. Include a full stop to complete silence two
thirds of the way through, then let the piece return quietly. Ends on the
music box alone winding down mid-phrase. 40 seconds. No lyrics - the voice
is wordless throughout. Completely original music.
```

---

## Mapa de cobertura *(actualizado al guion 3.0 — 14 misiones y dos finales)*

| Momento del juego | Pista |
|---|---|
| Menú de modos (lobby) | actual `lobby.mp3` · 01 El Nido como reserva |
| Pantalla de campaña | 01 El Nido |
| P.1 el arroyo | 11 Sapito |
| P.2–P.3 radio, plaza, teléfono | 12 La pava que nadie saca |
| P.4 primera página del cuaderno | 04 La Birome |
| Cinemáticas históricas / briefings de combate | 02 Cuaderno y tinta |
| 🟩 Briefing de hangar (M1) y viñetas del banco | 03 El invento |
| Ritual de Cóndor (cada despegue) | 06 Cóndor *(en M14 se corta a la mitad)* |
| Páginas del cuaderno M1–M8 | 04 La Birome |
| Páginas del cuaderno M9–M13 | 05 La Birome rota |
| Gameplay M1–M4 | 13 Rasante |
| M3 El invento + pantallas de mejoras | 03 El invento |
| Gameplay M5–M13 | 14 Callejón de las Bombas |
| Fase ARENA / boss | 15 El buque |
| 🟩 Relevo de escuadrón (te bajaron, sube otro) | 09 El que sigue |
| Resultado / rango S | 07 Victory · 08 Cuarta estrella |
| 🟩 M6 — la Chancha aguanta conectada | 16 La Chancha no abandona |
| M7 — muerte del Vasco | 17 La foto era de mi vieja |
| 🟩 M7 — el reverso de la foto (locker) | 18 El reverso *(sting, antes de la 17)* |
| M8 — sobrevuelo + el terito | 19 El batir de alas |
| M9 — muerte del Pichón + la libreta | 20 Era un pibe |
| M10 — la misión (frente cerrado) | **sin música** *(ver la ausencia documentada)* |
| M10 — el intercalado de Tandil | 21 Los primos |
| 🟩 M10 — placa "MIRAGE 5P DESBLOQUEADO" | 10 Mara |
| M12 — muerte de Correa + el tallado | 22 El ángel Correntino |
| M13 — el asado | 23 La última mesa |
| 🟩 M13 — la carta, esa noche | 24 Por las dudas |
| M14 — pista nocturna, antes de despegar | 25 Los teros |
| M14 — contrarreloj y sacrificios | 26 Plata Fiel |
| M14 — Fase 4, el vacío | **sin música** *(viento, motor y el pitido del reloj)* |
| M14 — el monte apagado y los dos rumbos | 27 Reserva |
| FINAL A — la vorágine | 28 La vorágine |
| FINAL A — epílogo (carta + mesa de Norma) | 33 Dos platos |
| FINAL B — planeo + el mate con el Turco | 29 El planeo |
| 🟩 Cierre común (narración, cartela, la frase) | 34 Los que no volvieron |
| Créditos | 35 Volá bajo |
| Post-créditos | 36 El pibe de la 10 |
| Ciclo de muerte / "Por la patria" | 30–32 la hinchada (ORIGINAL) · `pmetal_*` (PATRIO) |

### Los silencios, que también son partitura

Cuatro momentos del juego **no llevan música y eso es una decisión, no una tarea
pendiente.** Si algún día alguien "completa" la banda sonora, que no los toque:

1. **La misión de M10** — viento, motor, lluvia y Cóndor entrando y saliendo. La única
   música suena a dos mil kilómetros.
2. **M14, Fase 4 (el vacío)** — restos, humo y el pitido del reloj. El jugador solo con lo
   que hizo falta para llegar hasta ahí.
3. **El corte de la 26** — dos segundos de nada absoluta en el pico del sacrificio.
4. **El "No." del post-créditos** — la música cae y vuelve recién sobre la frase.

---

## Notas de producción

- **Prioridad de generación:** primero las transversales (01, 02, 04, 13, 14, 15), después
  los picos (19, 26, 28, 35), después el resto. Con seis pistas el juego suena entero; con
  las treinta y seis, emociona.
- 🟩 **Las letras se pegan aparte.** El bloque LETRA no va dentro del prompt: casi todos los
  generadores tienen un campo de letra separado, y meterla en el prompt hace que el modelo
  la trate como descripción y cante otra cosa.
- 🟩 **No corregir la afinación de ninguna voz de este documento.** El Gitano desafina, la
  tribuna se adelanta, los chicos se pierden, el que canta en la 31 se quiebra. Un
  pitch-correct bien hecho arruina las cuatro pistas más emotivas de la banda.
- **Los cortes a silencio son parte de la partitura.** La 26 DEBE cortar en seco; la 17
  pierde la estática a mitad de pieza; la 06 se corta como un canal que se cierra — y en
  M14, a la mitad; la 36 se frena en el "No.". Si el generador no clava el corte, se edita a
  mano.
- **La 28 y la 29 son los dos finales del mismo duelo:** conviene generarlas en la misma
  sesión que la 27 (Reserva), porque las tres comparten el silbido del Nido — furioso en
  una, incompleto en la otra, congelado en la tercera.
- **Coherencia entre hermanas:** 04/05 · 13/14 · 30–32 · 26/28 · 21/10 *(la quena del regalo
  que llega tarde y la del regalo entregado)* · 03 con el ritmo de las viñetas del banco.
- 🟩 **La tribuna es UNA sola grabación.** La multitud de 30, 31, 32 y el estribillo de 35
  tienen que sonar a la misma gente en el mismo lugar. Si suenan a cuatro multitudes
  distintas, el bloque F deja de ser un personaje y pasa a ser relleno.
- **Referencias reales = material privado.** No se publican, no se citan, no suben a ningún
  lado. Sirven para generar variaciones y calibrar la emoción — nada más.
- **Volumen narrativo:** `war_near_soldats.mp3` sigue por debajo de la música en el mapa
  COSTA, como está.

### ⚠ Dos cosas para verificar antes de producir

1. **La atribución de la frase final.** [GUION_3.md](GUION_3.md) la firma **"Diego Iorio"**
   y `src/data/strings.js` la firma **"RICARDO IORIO"**. Son dos nombres distintos para la
   misma cita y uno de los dos está mal. Es una persona real y una frase que el juego pone
   en pantalla con comillas: hay que resolverlo con fuente antes de publicar, no elegir el
   que suene mejor. → [PREGUNTAS_HISTORICAS.md](PREGUNTAS_HISTORICAS.md).
2. **La cartela de los países que ayudaron** (que la 34 acompaña) sigue pendiente de
   confirmación — lista y aporte de cada uno. Perú al frente.

---

## 🟥 3.8 — dos momentos nuevos, y los dos son de SILENCIO

Las dos escenas que entraron con la revisión del guion **no llevan pista compuesta**. Van
acá anotadas para que nadie las "resuelva" después poniéndoles música encima.

### El Belgrano (cierre de M3) — el corte seco

La escena arranca **encima de la carcajada del hangar** por el invento que explota. Si esa
risa tiene música o ambiente alegre, **corta en seco cuando el Pichón dice "Hundieron al
Belgrano"** — no baja, corta. De ahí al final de la escena no hay música: solo la sala, el
gorro que queda sobre el banco, y las herramientas que el Turco junta de a una.

La placa final con la cifra **323** va en silencio absoluto. Ni un acorde, ni un golpe de
bombo, ni un sting. Es la única placa con una cifra real de muertos en todo el juego y no
necesita ayuda.

> Si alguna vez se compone algo para acá, que sea **después** de la placa y ya entrando en
> M4 — nunca sobre el número.

### La escucha (M5) — el orgullo que dura una frase

Tampoco lleva música. Se sostiene con el ambiente de la sala de radio: la estática, el
zumbido del equipo, la lluvia afuera. **El silencio después de la traducción es el
efecto** — y se rompe recién con la voz del Turco desde la puerta.

Ojo con la tentación: es la única escena del juego donde estos tipos ganan algo, y va a
pedir a gritos un tema épico. **No.** El guion la corta a propósito con la cara de Esteban,
que no festeja. Si la música festeja, contradice la escena.

---

## 🟥 3.9 — el Narwal: **una sola pista, tocada dos veces**

Entraron dos tramos de vuelo sin enemigos, uno en M4 y otro en M5 (ver GUION_3.md, "En
vuelo"). No son dos escenas: **son la misma escena dos veces**, y la música es el
instrumento principal para que el jugador lo sienta antes de entenderlo.

### El tránsito (M4) — la pista

Una pista **corta, tranquila y reconocible**, encima del ruido de la turbina. Nada épico:
es gente laburando. Tiene que quedar pegada al primer paso — que el jugador la reconozca
después de escucharla una sola vez. Termina limpia cuando arranca el combate.

### El tránsito (M5) — la misma pista, **desarmada**

Misma melodía, mismo tempo, mismo lugar en la misión. Pero **le falta una voz**: se cae el
instrumento que llevaba la melodía y queda solo el acompañamiento sosteniendo un tema que
ya nadie toca. Sigue siendo la misma pista y el jugador lo sabe. Simplemente **hay uno
menos**.

Y cuando Cóndor dice *"hace doce días que no transmite"*, **se corta también el
acompañamiento**. Entran al Callejón sin música, con la turbina sola.

> **Esto es todo el efecto.** No hace falta ni un motivo de duelo, ni un solo instrumental
> triste, ni una nota larga. Una pista a la que le sacaron un instrumento dice más que
> cualquier lamento compuesto — y es exactamente lo que pasó: faltó uno y nadie lo anunció.

> **Regla dura:** la versión de M5 **no puede sonar más triste**. Tiene que sonar *igual,
> pero incompleta*. Si el compositor la vuelve melancólica, explica el chiste y lo arruina.
