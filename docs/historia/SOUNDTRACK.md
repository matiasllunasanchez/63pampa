# RASANTE — Plan de banda sonora · v3.0

> Listado de pistas a generar para cubrir toda la campaña **"El cuaderno de Mateo"**
> ([GUION_3.md](GUION_3.md)) y el [STORYBOARD_1.md](STORYBOARD_1.md), con un prompt listo
> para pegar por cada una. **30 pistas** organizadas por etapa dramática.
>
> **🟨 Novedades 3.0:** renumerado a las 14 misiones · 5 pistas nuevas (26–30: el invento,
> el Perú, la vorágine del Final A, el Final B, el sting de Cóndor) · y **cada pista lleva
> ahora una REFERENCIA REAL** — ver la regla nueva abajo.

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

### 🟥 La regla nueva: referencias reales *(pedido de Matías)*

Cada pista lleva una línea **"Referencia real"**: un tema existente que captura la emoción
y la sensación buscada, para generar variaciones y calibrar el resultado. **Las referencias
son SOLO material de trabajo privado — nunca se publican, nunca se citan en Steam, y el
prompt sigue cerrando con `completely original music and lyrics`.** La referencia dice qué
tiene que SENTIR la pista; el prompt dice cómo tiene que SONAR.

**La estrella del norte de todo el score:** la música del juego nace del **tema de intro de
Battlefield 1942** — épica militar con pulso, orgullosa sin ser pomposa, que te hace querer
subirte al avión. Cuando una pista de acción no sepa para dónde ir, va para ahí.

### Los cuatro leitmotifs *(sin cambios — las frases-semilla son sagradas)*

| Motivo | Frase-semilla (pegar tal cual) | Aparece en |
|---|---|---|
| **El Nido** (padre e hijo) | `a simple tender rising-then-falling whistled folk melody, like a father whistling to his son across a field` | Menú, P.1, Sobrevuelo, Clímax, Epílogos, Créditos |
| **La Birome** (el cuaderno) | `a fragile music-box-like guitar arpeggio that circles like handwriting` | Todas las páginas del cuaderno |
| **Los Fieles** (la hermandad) | `a proud brotherly brass-and-guitar theme that swells like a squadron flying wingtip to wingtip` | Briefings, epílogos de aire, sacrificios |
| **La Máquina** (la guerra) | `a cold pulsing mechanical synth ostinato like a radar sweeping in the dark` | Task Force, Callejón, misiones tardías |

### Paleta instrumental y reglas *(sin cambios)*

Lo criollo cerca de Mateo y la tierra; lo eléctrico/orquestal cerca del combate. Todo lo
cantado en español argentino (voseo). Cerrar SIEMPRE con `completely original music and
lyrics`. Loops de gameplay sin outro. Duraciones: gameplay/menú 2:00–3:00 · cinemáticas
1:00–1:30 · stingers 0:10–0:20 · canciones 2:30–3:30. Nombres según `src/systems/audio.js`.

---

## BLOQUE A — Interfaz y transversales

### 01 · `nido.mp3` — "El Nido" (tema principal / pantalla de campaña)
**Referencia real:** *Gustavo Santaolalla — "The Last of Us (Main Theme)"* — guitarra que
suena a hogar perdido; calidez con duelo abajo. Esa mezcla exacta de té caliente y nudo en
la garganta.

```
Warm intimate Argentine folk instrumental, 70 BPM, built around a simple tender
rising-then-falling whistled folk melody, like a father whistling to his son across
a field. Nylon-string criolla guitar fingerpicking, soft bombo legüero heartbeat,
distant wind ambience, a hint of bandoneon entering halfway. Nostalgic, homely,
quietly sad under the warmth, like a memory of a summer that ended. Seamless loop,
consistent energy, no big outro. Completely original music and lyrics.
```

### 02 · `story.mp3` — "Cuaderno y tinta" (cinemáticas base)
**Referencia real:** *Michael Kamen — "Band of Brothers (Main Titles)"* — la dignidad
documental: recordar sin música de héroes, con respeto y peso.

```
Somber cinematic documentary underscore, 60 BPM, low sustained strings, sparse
piano notes, faint bandoneon breathing, distant military snare rolls appearing and
dissolving, shortwave radio static as texture, grey South Atlantic mood, restrained
and dignified, history weighing on every bar. Slow build without resolution.
Seamless loop, no big outro. Completely original music and lyrics.
```

### 03 · `carta_1.mp3` — "La Birome" (el cuaderno, Mov. I–II)
**Referencia real:** *Yann Tiersen — "Comptine d'un autre été"* — la fragilidad circular,
un arpegio que da vueltas como una mano escribiendo; intimidad sin drama.

```
Delicate intimate instrumental, 65 BPM, a fragile music-box-like guitar arpeggio
that circles like handwriting, solo nylon-string guitar with soft room noise,
subtle paper and pen foley woven into the music, faint warm strings underneath,
innocent and tender with cold wind far away, a boy writing home from a trench.
Seamless loop, no big outro. Completely original music and lyrics.
```

### 04 · `carta_2.mp3` — "La Birome rota" (el cuaderno, Mov. III) 🟨 *(desde m9, muerte del Pichón)*
**Referencia real:** *Max Richter — "On the Nature of Daylight"* — el mismo amor, pero
herido; cuerdas que duelen despacio y no resuelven.

```
Darker sparser variation of an intimate letter theme, 60 BPM, a fragile
music-box-like guitar arpeggio that circles like handwriting, now slower with
missing notes and hesitations, detuned edges, cold hollow reverb, low cello drone
of grief underneath, wind stronger than before, innocence eroding but love intact.
Seamless loop, no big outro. Completely original music and lyrics.
```

### 05 · `victory.mp3` — stinger de misión cumplida
**Referencia real:** *Harold Faltermeyer — "Top Gun Anthem" (los primeros compases)* — el
orgullo aviador contenido, antes de que se vuelva festejo.

```
Short 15-second victory sting, proud brotherly brass-and-guitar theme that swells
like a squadron flying wingtip to wingtip, criolla guitar flourish and bombo
legüero accents under bright but warm brass, resolves gently instead of
triumphantly, relief more than glory, coming home rather than conquering.
Completely original music and lyrics.
```

### 06 · `fourth_star.mp3` — stinger de la cuarta estrella
**Referencia real:** *Ennio Morricone — "Gabriel's Oboe"* — lo casi sagrado en chiquito:
una sola voz melódica que te para el pecho.

```
Minimal 12-second emotional sting: a simple tender rising-then-falling whistled
folk melody, like a father whistling to his son across a field, performed as a
single unaccompanied whistle over soft South Atlantic wind, one warm guitar chord
blooming at the end, intimate, reverent, almost sacred. Completely original music
and lyrics.
```

### 🟥 30 · `condor.mp3` — "Cóndor" (sting del ritual de lanzamiento)
**Dónde:** debajo de la fórmula de Cóndor antes de CADA misión ("Plata Fiel, Plata Fiel…
Bajito y a casa"). Quince segundos de activación. En m14 se corta en la mitad, como la
autorización.
**Referencia real:** *Ramin Djawadi — "Pacific Rim (Main Theme)"* — la referencia la puso
Matías: la épica de activación de máquina, el escalofrío de "vamos".

```
Short 15-second military activation sting, 90 BPM, deep percussive hits building
like systems powering on one by one, low brass swell with an electric guitar edge,
a proud brotherly brass-and-guitar theme that swells like a squadron flying
wingtip to wingtip stated once, radio static texture, ends cut abruptly as if the
channel closed, goosebump launch energy. Completely original music and lyrics.
```

---

## BLOQUE B — Prólogo

### 07 · `prologo_arroyo.mp3` — "Sapito" (P.1, el arroyo)
**Referencia real:** *Gustavo Santaolalla — "De Ushuaia a la Quiaca"* — el campo argentino
en guitarra, luminoso y con polvo; infancia con horizonte.

```
Sunlit Argentine countryside miniature, 75 BPM, playful criolla guitar and soft
charango, a simple tender rising-then-falling whistled folk melody, like a father
whistling to his son across a field, carried by real whistling, birdsong and creek
water ambience blended musically, childhood warmth with a faint premonitory minor
chord at the very end, like a cloud crossing the sun. 60-90 seconds with an arc.
Completely original music and lyrics.
```

### 08 · `prologo_radio.mp3` — "La pava que nadie saca" (P.2–P.3)
**Referencia real:** *Jóhann Jóhannsson — "The Beast" (Sicario)* — la amenaza que entra
gradual y aplasta; el miedo institucional hecho pulso.

```
Tense cinematic cue in three stages, 80 BPM: starts with a lonely kitchen-warm
guitar note fading, invaded by a cold pulsing mechanical synth ostinato like a
radar sweeping in the dark, then distorted military march drums and a huge distant
crowd roar swelling like a stadium and cutting to silence, ending on one
unresolved piano note under a phone busy-tone pulse. Dread inside a home. 90
seconds with an arc. Completely original music and lyrics.
```

> 🟨 **(3.2) El juego abre DIRECTO con 07 (Sapito) en P.1** — ya no hay P.0 al inicio. La
> escena de la puerta vive ahora en el epílogo del Final A: va en silencio de sala hasta
> que Norma abre el cuaderno, y ahí entra 23 (Dos platos). El silencio sigue siendo
> deliberado: la música del juego "vive adentro del cuaderno".

---

## BLOQUE C — Gameplay

### 09 · `game.mp3` — "Rasante" (gameplay Mov. I, m1–m4)
**Referencia real:** ⭐ *"Battlefield 1942 — Main Theme (intro)"* — LA base declarada de la
música del juego: épica militar con pulso que te hace querer subirte al avión. Esta pista
es su heredera directa.

```
High-energy instrumental action track, 150 BPM, surf-flavored distorted electric
guitar riffs over driving live drums, urgent bass, analog synth arpeggios, brief
heroic brass hits of a proud brotherly brass-and-guitar theme that swells like a
squadron flying wingtip to wingtip, bombo legüero pushing the groove under the
rock kit, fast, salty, exhilarating, wave-top flying energy. Seamless loop,
consistent energy, no big outro. Completely original music and lyrics.
```

### 10 · `game_callejon.mp3` — "Callejón de las Bombas" (gameplay Mov. II–III, m5–m12)
**Referencia real:** *Hans Zimmer — "Mombasa" (Inception)* — la persecución claustrofóbica
que no afloja; correr por un pasillo que se cierra.

```
Relentless dark action track, 155 BPM, aggressive palm-muted electric guitar
chugging, pounding toms and military snare, a cold pulsing mechanical synth
ostinato like a radar sweeping in the dark cutting through the mix, alarm-like
guitar stabs, no triumphant melodies, claustrophobic walls of sound opening only
in short breaths, flying through a corridor of flak. Seamless loop, consistent
energy, no big outro. Completely original music and lyrics.
```

### 11 · `boss.mp3` — "El buque" (fase ARENA / boss)
**Referencia real:** *"Zero" — Ace Combat Zero (tema final)* — el duelo aéreo con guitarra
española contra orquesta: literalmente David criollo contra la máquina. La referencia más
exacta de todo el documento.

```
Epic boss-battle hybrid track, 140 BPM, massive cinematic orchestra colliding with
distorted electric guitars, deep brass blasts like ship horns, a cold pulsing
mechanical synth ostinato like a radar sweeping in the dark representing the
warship, answered by defiant criolla-guitar-flavored heroic phrases representing
the small silver jet, David versus Goliath tension, huge dynamic contrasts.
Seamless loop, consistent energy, no big outro. Completely original music and
lyrics.
```

### 🟥 26 · `hangar.mp3` — "El invento" (m3 + viñetas del banco del Pichón)
**Dónde:** la misión nueva de comedia y todas las pantallas de mejoras (el banco / la
libreta). Tiene que oler a taller, a cinta aisladora y a cariño.
**Referencia real:** *Julian Nott — "Wallace & Gromit (Theme)"* — la música de inventor
entrañable: travesura mecánica con ternura. Bajarle el circo inglés, subirle el taller
criollo.

```
Playful workshop instrumental, 95 BPM, bouncy criolla guitar and plucked strings
with a mischievous clarinet-like synth lead, light percussion on tin cans and tool
clanks woven musically, a wrench-drop and spring boing as musical accents, warm
and funny without being cartoonish, the sound of a genius kid and a grumpy
mechanic falling in love with an idea. Seamless loop, no big outro. Completely
original music and lyrics.
```

---

## BLOQUE D — Los picos emocionales

### 12 · `vasco.mp3` — "La foto era de mi vieja" 🟨 (m7, muerte del Vasco)
**Referencia real:** *Astor Piazzolla — "Adiós Nonino"* — EL duelo argentino en bandoneón;
Piazzolla la escribió por la muerte de su padre. Duelo de hombre callado, sin lágrimas a
cámara.

```
Devastating minimal elegy, 55 BPM, solo bandoneon breathing long sorrowful phrases
over near-silence, sparse low piano, a thread of radio static that slowly fades to
nothing mid-piece leaving the bandoneon alone, one distant male voice humming
wordlessly like a mother's lullaby remembered, restrained masculine grief, no
drums, ends unresolved. 90 seconds. Completely original music and lyrics.
```

### 13 · `sobrevuelo.mp3` — "El batir de alas" 🟨 (m8, el sobrevuelo + el terito)
**Referencia real:** *Hans Zimmer — "Cornfield Chase" (Interstellar)* — padre e hijo,
velocidad y asombro, lágrimas y orgullo en el mismo compás. Es exactamente esta escena en
otra película.

```
Soaring emotional cinematic piece, 72 BPM, begins as a lone jet engine hum blending
into warm strings, then a simple tender rising-then-falling whistled folk melody,
like a father whistling to his son across a field, taken up by full orchestra with
criolla guitar and bombo legüero heartbeat underneath, slow-motion wonder, tears
and pride at once, an entire string section holding its breath then blooming when
the wings rock, ends soft like a hand waving goodbye. 90 seconds with a clear
emotional peak. Completely original music and lyrics.
```

### 14 · `pichon.mp3` — "Era un pibe" 🟨 (m9, muerte del Pichón)
**Referencia real:** *Gustavo Santaolalla — "All Gone (No Escape)" (The Last of Us)* — el
sonido de la culpa: cuando la pérdida es también responsabilidad. La vara emocional TLOU
que pidió Matías, aplicada acá.

```
Tragic sparse cue, 50 BPM, a lone deconstructed music box playing a broken
child-like melody, low string clusters of guilt swelling and receding, one
sub-bass impact like a distant sea swallowing something, then long silence
filled only by wind, a single boy-soprano-like synth voice note held and lost,
grief with the weight of it-should-have-been-me. 75 seconds, ends in near
silence. Completely original music and lyrics.
```

### 🟥 27 · `primos.mp3` — "Los primos" (m10, los Mirage del Perú)
**Dónde:** la aparición desde el sol, la voz peruana, la formación compartida, la
despedida batiendo las alas. Alivio con lágrimas: la hermandad que llega de afuera.
**Referencia real:** *"El Cóndor Pasa"* (versión andina instrumental, quena y charango) —
la hermandad andina hecha melodía; el hermano del norte que aparece cuando hace falta.

```
Moving Andean-Argentine brotherhood piece, 80 BPM, warm quena flute melody soaring
over charango and criolla guitar, soft bombo heartbeat, gradually joined by
cinematic strings and one noble brass swell as jets fly in formation, relief and
gratitude with tears behind the eyes, two folk traditions flying wingtip to
wingtip, golden afternoon light in sound, ends with the flute alone fading west.
90 seconds with an arc. Completely original music and lyrics.
```

### 15 · `correa.mp3` — "El ángel de Corrientes" 🟨 (m12, muerte de Correa)
**Referencia real:** *Transito Cocomarola — "Kilómetro 11"* — EL chamamé. La ternura
litoraleña exacta del Colorado: río ancho, pena dulce, dignidad de hombre bueno.

```
Heartbreaking slow chamamé from Corrientes Argentina, 68 BPM, weeping accordion
lead full of Litoral longing, nylon-string guitar accompaniment, soft male voice
humming wordlessly in chamamé style, river-wide tenderness colliding with war
ambience of distant shelling that never overpowers the music, a good man's soul
going home to his river, ends on a single sustained accordion note. 90 seconds.
Completely original music and lyrics.
```

### 16 · `asado.mp3` — "La última mesa" 🟨 (m13, el asado)
**Referencia real:** *Jorge Cafrune — "Zamba de mi esperanza"* — la zamba de fogón con voz
gastada y querible; el desafinar con dignidad del Gitano es esto.

```
Intimate Argentine campfire zamba, 60 BPM in gentle 6/8, weathered male voice
singing softly and slightly out of tune with loving imperfection, lyrics in
Argentine Spanish (voseo) about friends around a fire, absent chairs at the table,
and flying low one last time, criolla guitar and soft bombo legüero, real fire
crackle ambience, brotherhood and farewell in the same breath, ends with the
voices fading and only the fire remaining. 2 minutes. Completely original music
and lyrics.
```

---

## BLOQUE E — La misión final (m14)

### 17 · `final_pista.mp3` — "Los teros" (m14, antes de despegar)
**Referencia real:** *Hans Zimmer — "Journey to the Line" (The Thin Red Line)* — la
valentía fúnebre: caminar hacia algo enorme, despacio, con el corazón en la mano.

```
Low tense nocturnal cue, 58 BPM, deep sustained drone and a slow heartbeat pulse,
faint radio chatter texture being switched off, then unaccompanied criolla guitar
stating fragments of a proud brotherly brass-and-guitar theme that swells like a
squadron flying wingtip to wingtip, quiet and funereal-brave, the cry of a tero
bird echoing once in the far distance, three engines igniting as the final chord.
75 seconds with an arc. Completely original music and lyrics.
```

### 18 · `final_sacrificio.mp3` — "Plata Fiel" (m14, contrarreloj y sacrificios)
**Referencia real:** *Hans Zimmer — "No Time for Caution" (Interstellar, el docking)* — el
heroísmo desesperado en oleadas, el órgano que no te deja respirar, y el corte. La
secuencia entera de Gitano y Puma vive en esta emoción. *(El reloj de fondo conecta además
con el contrarreloj de la misión — Dunkirk "The Mole" como referencia secundaria del tic-tac.)*

```
Massive epic orchestral-rock sacrifice sequence, 100 BPM rising to 130, full
cinematic orchestra with male choir chanting powerful wordless phrases, thundering
bombo legüero and military percussion, a ticking-clock percussion layer rising in
urgency, soaring distorted electric guitar carrying a proud brotherly
brass-and-guitar theme that swells like a squadron flying wingtip to wingtip,
waves of heroic build as one guardian falls and another takes his place,
relentless forward motion, tragic and glorious at maximum intensity, then THE
ENTIRE TRACK CUTS TO ABSOLUTE SILENCE at the peak — two seconds of nothing —
closing with a single jet engine hum alone. 3 minutes. Completely original music
and lyrics.
```

### 19 · `final_decision.mp3` — "Reserva" (el monte apagado y los dos rumbos)
**Referencia real:** *Arvo Pärt — "Spiegel im Spiegel"* — el vacío infinito y quieto; el
duelo sin dramatismo, nota por nota, mientras el jugador decide.

```
Barely-there ambient grief piece, 45 BPM, a lone jet engine hum as the tonal
floor, fragments of a simple tender rising-then-falling whistled folk melody, like
a father whistling to his son across a field, played impossibly slow on a distant
detuned piano with long silences between notes, cold wind, no percussion, no
resolution, a father circling an extinguished hill, infinite and hollow. Seamless
loop, no big outro. Completely original music and lyrics.
```

### 🟥 28 · `voragine.mp3` — "La vorágine" (FINAL A — quedarse)
**Dónde:** el jugador vira a la oleada y el juego se lo da todo. La música más grande de la
banda: munición infinita, bronca y amor mezclados, "quiero romper absolutamente todo".
**Referencia real:** *Mick Gordon — "The Only Thing They Fear Is You" (DOOM Eternal)* — la
adrenalina por los ojos que pidió Matías. **Vara emocional:** el final de The Last of Us —
que la furia sea AMOR con otra cara. No es rabia vacía: es un padre peleando sobre el nido.

```
Overwhelming final-stand hybrid track, 160 BPM, colossal distorted electric guitar
riffs and double-kick drums fused with full orchestra and male choir roaring, a
proud brotherly brass-and-guitar theme that swells like a squadron flying wingtip
to wingtip transformed into a furious battle cry, bombo legüero pounding inside
the metal, waves upon waves of enemies in sound, grief weaponized into glory, the
loudest most cathartic piece of the entire game — and underneath it all, barely
audible, a simple tender rising-then-falling whistled folk melody, like a father
whistling to his son across a field, holding the rage together. Seamless loop
that never decays. Completely original music and lyrics.
```

### 🟥 29 · `final_b.mp3` — "El planeo" (FINAL B — volver + el mate)
**Dónde:** la vuelta con la nafta en rojo planeando como el sapito, la panza en el pasto,
y —años después— la mesa con el Turco, el cuaderno abierto, Norma en el jazminero.
**Referencia real:** *Gustavo Santaolalla — "The Path (A New Beginning)" (The Last of Us,
final)* — la paz rota y verdadera del semi feliz: sobrevivir también cuesta. Es
exactamente la emoción del final oculto.

```
Quiet survivor's epilogue piece, 58 BPM, solo criolla guitar with warm imperfect
fingering, long pauses, joined gently by soft strings and a distant bandoneon
breath, a simple tender rising-then-falling whistled folk melody, like a father
whistling to his son across a field, played incomplete — missing its final note
the first two times, resolved only at the very end, peace that carries scars,
mate-and-silence warmth, a jasmine garden through a window, ends on one held warm
chord and birdsong. 2 minutes with an arc. Completely original music and lyrics.
```

---

## BLOQUE F — La hinchada (PACK ORIGINAL del ciclo `pmetal_*`)

### 20 · `pmetal_1.mp3` — "De pie" (aliento épico)
**Referencia real:** *La Renga — "Panic Show"* — el aguante del rock barrial argentino: la
cancha y la gira en la misma garganta.

```
Anthemic Argentine stadium-rock chant, 120 BPM, huge crowd of male voices chanting
original lyrics in Argentine Spanish (voseo) about getting up once more, flying
low and never leaving a brother behind, driving distorted guitars, stadium drums
and clapping bombo legüero, call-and-response between lead rock vocal and terrace
crowd, raw passionate and defiant, football-terrace energy fused with military
march power. Seamless loop-friendly structure. Completely original music and
lyrics, no reference to any existing song or anthem.
```

### 21 · `pmetal_2.mp3` — "Los pibes del sur" (aliento emotivo)
**Referencia real:** *"Muchachos, ahora nos volvimo' a ilusionar" (La Mosca / la hinchada,
2022)* — la referencia obvia y la correcta: la tribuna que llora y canta a la vez, con los
pibes de Malvinas adentro de la letra. El guion ya la señala como el deseo cumplido de
Mateo.

```
Emotional mid-tempo stadium anthem, 95 BPM, one warm raspy male voice starting
alone with a criolla guitar singing original lyrics in Argentine Spanish (voseo)
about young boys far from home who hold each other up, then a massive crowd
joining in unison with bombo legüero and brass, swelling into a tearful roaring
chorus, pride and mourning braided together, the terrace singing for the ones who
never came back. Completely original music and lyrics, no reference to any
existing song or anthem.
```

### 22 · `pmetal_3.mp3` — "Huevos" (aliento agresivo, ciclo de muerte)
**Referencia real:** *2 Minutos — "Ya no sos igual"* — punk barrial acelerado y coreable:
la bronca alegre que te hace apretar restart.

```
Aggressive fast stadium punk-rock chant, 165 BPM, shouted gang vocals with
original lyrics in Argentine Spanish (voseo) about courage bigger than fear and
getting back in the cockpit one more time, buzzsaw guitars, pounding drums with
bombo accents, short sharp verses built for retrying after dying, furious joy,
terrace whistles and claps, adrenaline that makes you hit restart. Seamless
loop-friendly. Completely original music and lyrics, no reference to any existing
song or anthem.
```

---

## BLOQUE G — Epílogo y créditos

### 23 · `epilogo.mp3` — "Dos platos" 🟨 (la mesa de Norma — epílogo del Final A)
**Referencia real:** *Mercedes Sosa — "Alfonsina y el mar"* — el duelo argentino de cocina
y mar; una mujer, una mesa, una ausencia. La canción que ya sabe todo lo que esta escena
quiere decir.

```
Quiet devastating piano and guitar duet, 55 BPM, begins with near-silent room tone
and a kettle whistle blending into a high string harmonic, sparse piano notes like
objects placed on a table, then a fragile music-box-like guitar arpeggio that
circles like handwriting entering when the notebook opens, finally blooming gently
into a simple tender rising-then-falling whistled folk melody, like a father
whistling to his son across a field, carried by soft strings — the two themes of
the game meeting for the first time in one piece, ends warm and shattered at once.
2 minutes with an arc. Completely original music and lyrics.
```

### 24 · `creditos.mp3` — "Volá bajo" (canción de créditos)
**Referencia real:** *Patricio Rey y sus Redonditos de Ricota — "Jijiji"* — la energía
oscura que genera pogo y escalofrío a la vez; himno generacional sin ser marcha. *(Y el
pulso general, como todo el score, mira al intro de Battlefield 1942.)*

```
Original adrenaline-fueled Argentine electro-rock anthem, 160 BPM, lyrics in
Argentine Spanish (voseo) about memory, courage and peace connected to Malvinas —
a father in the sky, a son writing a notebook from the cold, brothers who gave
everything, and the plea that no flag is worth a kid. Fast live-style drums with
bombo legüero accents, distorted electric guitar riffs as the main hook, urgent
bass, analog synth arpeggios, dramatic full stops, and a massive singalong chorus
built around the phrase "volá bajo". Include a short virtuosic electric guitar
solo before the final chorus, and end the song stripped down: one voice and one
criolla guitar whistling a simple tender rising-then-falling whistled folk melody,
like a father whistling to his son across a field. Cinematic, raw, fast and
emotionally powerful; completely original music and lyrics.
```

### 25 · `postcreditos.mp3` — "El pibe de la 10" (post-créditos)
**Referencia real:** *Alan Silvestri — "Feather Theme" (Forrest Gump)* — la liviandad
luminosa después del peso: una pluma, un vidrio, una mano chiquita.

```
Tiny luminous epilogue piece, 70 BPM, a real music box playing a simple tender
rising-then-falling whistled folk melody, like a father whistling to his son
across a field, joined halfway by soft distant children's voices humming and one
warm string swell, morning-light hope after grief, a new generation touching the
glass, ends on the music box alone winding down mid-phrase. 40 seconds.
Completely original music and lyrics.
```

---

## Mapa de cobertura 🟨 *(actualizado a 14 misiones + dos finales)*

| Momento del juego | Pista |
|---|---|
| Menú de modos (lobby) | actual `lobby.mp3` · 01 El Nido como reserva |
| Pantalla de campaña | 01 El Nido |
| 🟨 (3.2) La puerta — ahora en el epílogo del Final A | **silencio de sala** → 23 al abrir el cuaderno |
| P.1 el arroyo | 07 Sapito |
| P.2–P.3 radio, plaza, teléfono | 08 La pava que nadie saca |
| Cinemáticas históricas / briefings | 02 Cuaderno y tinta |
| 🟥 Ritual de Cóndor (cada despegue) | 30 Cóndor (sting; en m14 se corta a la mitad) |
| Páginas del cuaderno m1–m8 | 03 La Birome |
| Páginas del cuaderno m9–m13 | 04 La Birome rota |
| Gameplay m1–m4 | 09 Rasante |
| 🟥 m3 El invento + pantallas de mejoras | 26 El invento |
| Gameplay m5–m12 | 10 Callejón de las Bombas |
| Fase ARENA / boss | 11 El buque |
| Resultado / rango S | 05 Victory · 06 Cuarta estrella |
| Muerte del Vasco (m7) + el locker | 12 La foto era de mi vieja |
| Sobrevuelo + terito (m8) | 13 El batir de alas |
| Muerte del Pichón (m9) + la libreta | 14 Era un pibe |
| 🟥 Los Mirage del Perú (m10) | 27 Los primos |
| Muerte de Correa (m12) + el tallado | 15 El ángel de Corrientes |
| El asado + LA CARTA (m13) | 16 La última mesa |
| Pista nocturna (m14 pre-vuelo) | 17 Los teros |
| Contrarreloj + sacrificios (m14) | 18 Plata Fiel |
| El monte apagado + los dos rumbos | 19 Reserva |
| 🟥 FINAL A — la vorágine | 28 La vorágine |
| 🟥 FINAL A — epílogo (carta + mesa) | 23 Dos platos |
| 🟥 FINAL B — planeo + el mate | 29 El planeo |
| Ciclo de muerte / "Por la patria" | 20–22 la hinchada (ORIGINAL) · `pmetal_*` (PATRIO) |
| Créditos | 24 Volá bajo |
| Post-créditos | 25 El pibe de la 10 |

### Notas de producción 🟨

- **Prioridad de generación:** primero las transversales (01, 02, 03, 09, 10, 11), después
  los picos (13, 18, 24, 🟥 28), después el resto. Con seis pistas el juego suena entero;
  con las treinta, emociona.
- **Los cortes a silencio son parte de la partitura.** La 18 DEBE cortar en seco (el
  monte); la 12 pierde la estática a mitad de pieza; 🟥 la 30 se corta como un canal que se
  cierra — y en m14, a la mitad. Si el generador no clava el corte, se edita a mano.
- 🟥 **La 28 y la 29 son los dos finales del mismo duelo:** conviene generarlas en la misma
  sesión que la 19 (Reserva), porque las tres comparten el silbido del Nido — furioso en
  una, incompleto en la otra, congelado en la tercera.
- **Coherencia entre hermanas:** 03/04, 09/10, 20–22, 🟥 18/28, 🟥 26 con el ritmo de las
  viñetas del banco.
- **Referencias reales = material privado.** No se publican, no se citan, no suben a
  ningún lado. Sirven para generar variaciones y calibrar la emoción — nada más.
- **Volumen narrativo:** `war_near_soldats.mp3` sigue por debajo de la música en el mapa
  COSTA, como está.
