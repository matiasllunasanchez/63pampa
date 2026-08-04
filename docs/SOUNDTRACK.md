# RASANTE — Plan de banda sonora

> Listado de pistas a generar para cubrir toda la campaña de [GUION_2.md](GUION_2.md) y el
> [STORYBOARD_1.md](STORYBOARD_1.md), con un prompt listo para pegar en el generador de
> música por cada una. **25 pistas** organizadas por etapa dramática.

---

## Los dos packs sonoros — la estrategia

El juego maneja **dos packs de audio intercambiables**:

**PACK ORIGINAL (este documento — el default y el de Steam).** Las 25 pistas de acá abajo,
todas generadas desde cero: música y letra 100% originales, sin depender de ninguna obra
existente. Es el pack que va a la página de Steam sin riesgo. Cubre todos los contextos
del juego **salvo el lobby**, que conserva su música actual.

**PACK PATRIO (el actual — reversiones, opcional).** Las `pmetal_*` existentes: marchas
patrias y cantos reversionados con IA. Queda como pack alternativo/bonus, activable por
configuración. Su situación de derechos es discutible y despareja: las composiciones muy
viejas (el Himno de Parera, la marcha de San Lorenzo) son dominio público en su partitura,
pero otras piezas ("Aurora" y los cantos sobre melodías de canciones pop) siguen
protegidas, y las grabaciones/arreglos de referencia tienen sus propios derechos. **Ante
la duda: el ORIGINAL es el default, el PATRIO se revisa pieza por pieza antes de
publicarse** (mismo criterio que las fotos en [REFERENCIAS.md](REFERENCIAS.md)).

**Implementación sugerida:** `assets/audio/original/` y `assets/audio/patrio/` con los
mismos nombres de archivo adentro, y un flag de config que elige carpeta. Cero cambios de
código en los llamadores.

**El lobby no se toca:** conserva su `lobby.mp3` actual. La pista 01 de este plan queda
como **alternativa/reserva** — te sirve como lobby del build de Steam si algún día la
actual tiene problema de derechos, o como música de la pantalla de campaña.

---

## 0. Sistema musical — leer antes de generar

### Los cuatro leitmotifs

Para que la banda suene a UNA película y no a una playlist, el score se organiza en cuatro
motivos. Los generadores no pueden compartir melodías literales entre generaciones, pero sí
podés lograr cohesión **repitiendo la misma frase descriptiva** en todos los prompts de la
misma familia. Esas frases-semilla son sagradas — copialas tal cual:

| Motivo | Frase-semilla (pegar tal cual en el prompt) | Aparece en |
|---|---|---|
| **El Nido** (padre e hijo) | `a simple tender rising-then-falling whistled folk melody, like a father whistling to his son across a field` | Menú, P.1, Sobrevuelo, Clímax, Epílogo, Créditos |
| **La Birome** (las cartas) | `a fragile music-box-like guitar arpeggio that circles like handwriting` | Todas las cartas, el cuaderno |
| **Los Fieles** (la hermandad) | `a proud brotherly brass-and-guitar theme that swells like a squadron flying wingtip to wingtip` | Briefings, epílogos de aire, sacrificios |
| **La Máquina** (la guerra / la tecnología inglesa) | `a cold pulsing mechanical synth ostinato like a radar sweeping in the dark` | Task Force, Bomb Alley, misiones tardías |

### Paleta instrumental — la argentinidad sonora

- **Lo nuestro:** guitarra criolla, bombo legüero, bandoneón, acordeón chamamecero, silbido,
  charango discreto, palmas, coro masculino de fogón, hinchada de cancha.
- **La guerra:** orquesta cinematográfica, percusión militar, guitarras eléctricas, synths
  analógicos fríos (solo para "La Máquina"), estática de radio como textura.
- **Regla de mezcla:** cuanto más cerca de Mateo y la tierra, más criollo y desnudo; cuanto
  más cerca del combate y la flota, más eléctrico y orquestal. El Sobrevuelo y el Final son
  los dos puntos donde las dos paletas se funden — a propósito.

### Reglas de generación

1. **Todo lo cantado va en español argentino (voseo).** Los prompts lo piden explícitamente:
   `lyrics in Argentine Spanish (voseo)`. Si el generador inventa letra en otro idioma o
   con "tú", regenerá.
2. **Siempre cerrar el prompt con:** `completely original music and lyrics` — es la
   protección de derechos para Steam.
3. **Loops:** las pistas de gameplay y menú deben poder loopear — el prompt pide
   `seamless loop, consistent energy, no big outro`. Las de cinemática sí tienen arco.
4. **Duraciones sugeridas:** gameplay/menú 2:00–3:00 · cinemáticas 1:00–1:30 · stingers
   0:10–0:20 · canciones con letra 2:30–3:30.
5. **Nombres de archivo** siguen las convenciones de `src/systems/audio.js`
   (`lobby.mp3`, `game.mp3`, `story.mp3`, `pmetal_*`) y agregan nuevos contextos con
   prefijo del guion (`carta_*`, `final_*`).

---

## BLOQUE A — Interfaz y transversales

### 01 · `nido.mp3` — "El Nido" (tema principal — alternativa de lobby / pantalla de campaña)
**Dónde:** el lobby conserva su música actual; esta pista es la reserva original para ese
puesto y/o la música de la pantalla de selección de campaña. Tiene que oler a hogar y a
algo que ya se perdió.

```
Warm intimate Argentine folk instrumental, 70 BPM, built around a simple tender
rising-then-falling whistled folk melody, like a father whistling to his son across
a field. Nylon-string criolla guitar fingerpicking, soft bombo legüero heartbeat,
distant wind ambience, a hint of bandoneon entering halfway. Nostalgic, homely,
quietly sad under the warmth, like a memory of a summer that ended. Seamless loop,
consistent energy, no big outro. Completely original music and lyrics.
```

### 02 · `story.mp3` — "Cuaderno y tinta" (cinemáticas base)
**Dónde:** cama genérica de cinemáticas históricas (mapas, fechas, Task Force). El tono
documental del juego.

```
Somber cinematic documentary underscore, 60 BPM, low sustained strings, sparse
piano notes, faint bandoneon breathing, distant military snare rolls appearing and
dissolving, shortwave radio static as texture, grey South Atlantic mood, restrained
and dignified, history weighing on every bar. Slow build without resolution.
Seamless loop, no big outro. Completely original music and lyrics.
```

### 03 · `carta_1.mp3` — "La Birome" (tema de las cartas, Mov. I–II)
**Dónde:** todas las pantallas de carta de Mateo hasta la Misión 7 inclusive. La música de
leer a mano.

```
Delicate intimate instrumental, 65 BPM, a fragile music-box-like guitar arpeggio
that circles like handwriting, solo nylon-string guitar with soft room noise,
subtle paper and pen foley woven into the music, faint warm strings underneath,
innocent and tender with cold wind far away, a boy writing home from a trench.
Seamless loop, no big outro. Completely original music and lyrics.
```

### 04 · `carta_2.mp3` — "La Birome rota" (tema de las cartas, Mov. III)
**Dónde:** cartas desde la Misión 8 (muerte de Pichón) hasta la última carta. La misma
música de leer, pero herida — el trazo de Mateo se oscureció y su tema también.

```
Darker sparser variation of an intimate letter theme, 60 BPM, a fragile
music-box-like guitar arpeggio that circles like handwriting, now slower with
missing notes and hesitations, detuned edges, cold hollow reverb, low cello drone
of grief underneath, wind stronger than before, innocence eroding but love intact.
Seamless loop, no big outro. Completely original music and lyrics.
```

### 05 · `victory.mp3` — stinger de misión cumplida
**Dónde:** pantalla de resultado con estrellas. Corto, orgulloso, con un dejo criollo — y
sin triunfalismo hueco: acá se vuelve, no se festeja matar.

```
Short 15-second victory sting, proud brotherly brass-and-guitar theme that swells
like a squadron flying wingtip to wingtip, criolla guitar flourish and bombo
legüero accents under bright but warm brass, resolves gently instead of
triumphantly, relief more than glory, coming home rather than conquering.
Completely original music and lyrics.
```

### 06 · `fourth_star.mp3` — stinger de la cuarta estrella
**Dónde:** solo cuando se logra el rango S — la silueta de las islas. Diez segundos de
piel de gallina: el silbido del padre, solo, y el viento.

```
Minimal 12-second emotional sting: a simple tender rising-then-falling whistled
folk melody, like a father whistling to his son across a field, performed as a
single unaccompanied whistle over soft South Atlantic wind, one warm guitar chord
blooming at the end, intimate, reverent, almost sacred. Completely original music
and lyrics.
```

---

## BLOQUE B — Prólogo

### 07 · `prologo_arroyo.mp3` — "Sapito" (P.1, el arroyo)
**Dónde:** la primera escena del juego, en birome: el campo, el Rastrojero, la piedra que
pica tres veces.

```
Sunlit Argentine countryside miniature, 75 BPM, playful criolla guitar and soft
charango, a simple tender rising-then-falling whistled folk melody, like a father
whistling to his son across a field, carried by real whistling, birdsong and creek
water ambience blended musically, childhood warmth with a faint premonitory minor
chord at the very end, like a cloud crossing the sun. 60-90 seconds with an arc.
Completely original music and lyrics.
```

### 08 · `prologo_radio.mp3` — "La pava que nadie saca" (P.2–P.3)
**Dónde:** de la cocina a la Plaza al teléfono: la guerra entrando a una casa. Arranca
doméstica y termina siendo "La Máquina".

```
Tense cinematic cue in three stages, 80 BPM: starts with a lonely kitchen-warm
guitar note fading, invaded by a cold pulsing mechanical synth ostinato like a
radar sweeping in the dark, then distorted military march drums and a huge distant
crowd roar swelling like a stadium and cutting to silence, ending on one
unresolved piano note under a phone busy-tone pulse. Dread inside a home. 90
seconds with an arc. Completely original music and lyrics.
```

---

## BLOQUE C — Gameplay (las misiones jugables)

### 09 · `game.mp3` — "Rasante" (gameplay Mov. I, M1–M3)
**Dónde:** el vuelo jugable de las primeras misiones. Adrenalina con sabor a promesa: acá
todavía parece una aventura.

```
High-energy instrumental action track, 150 BPM, surf-flavored distorted electric
guitar riffs over driving live drums, urgent bass, analog synth arpeggios, brief
heroic brass hits of a proud brotherly brass-and-guitar theme that swells like a
squadron flying wingtip to wingtip, bombo legüero pushing the groove under the
rock kit, fast, salty, exhilarating, wave-top flying energy. Seamless loop,
consistent energy, no big outro. Completely original music and lyrics.
```

### 10 · `game_callejon.mp3` — "Callejón de las Bombas" (gameplay Mov. II–III, M4–M10)
**Dónde:** el gameplay del medio del juego: el pasillo de metralla, el desgaste. Menos
fiesta, más dientes apretados.

```
Relentless dark action track, 155 BPM, aggressive palm-muted electric guitar
chugging, pounding toms and military snare, a cold pulsing mechanical synth
ostinato like a radar sweeping in the dark cutting through the mix, alarm-like
guitar stabs, no triumphant melodies, claustrophobic walls of sound opening only
in short breaths, flying through a corridor of flak. Seamless loop, consistent
energy, no big outro. Completely original music and lyrics.
```

### 11 · `boss.mp3` — "El buque" (fase ARENA / boss)
**Dónde:** el asalto final a cada buque (la fase ARENA del juego). El duelo David contra
Goliat en música.

```
Epic boss-battle hybrid track, 140 BPM, massive cinematic orchestra colliding with
distorted electric guitars, deep brass blasts like ship horns, a cold pulsing
mechanical synth ostinato like a radar sweeping in the dark representing the
warship, answered by defiant criolla-guitar-flavored heroic phrases representing
the small silver jet, David versus Goliath tension, huge dynamic contrasts.
Seamless loop, consistent energy, no big outro. Completely original music and
lyrics.
```

---

## BLOQUE D — Los picos emocionales

### 12 · `vasco.mp3` — "La foto era de mi vieja" (M6, muerte del Vasco)
**Dónde:** el epílogo de la Misión 6: cuatro aviones donde había cinco, la estrellita que
no se pinta.

```
Devastating minimal elegy, 55 BPM, solo bandoneon breathing long sorrowful phrases
over near-silence, sparse low piano, a thread of radio static that slowly fades to
nothing mid-piece leaving the bandoneon alone, one distant male voice humming
wordlessly like a mother's lullaby remembered, restrained masculine grief, no
drums, ends unresolved. 90 seconds. Completely original music and lyrics.
```

### 13 · `sobrevuelo.mp3` — "El batir de alas" (M7, el sobrevuelo)
**Dónde:** LA escena del medio del juego: treinta segundos de cámara lenta, el padre
batiendo las alas sobre el monte del hijo. Acá se funden las dos paletas por primera vez.

```
Soaring emotional cinematic piece, 72 BPM, begins as a lone jet engine hum blending
into warm strings, then a simple tender rising-then-falling whistled folk melody,
like a father whistling to his son across a field, taken up by full orchestra with
criolla guitar and bombo legüero heartbeat underneath, slow-motion wonder, tears
and pride at once, an entire string section holding its breath then blooming when
the wings rock, ends soft like a hand waving goodbye. 90 seconds with a clear
emotional peak. Completely original music and lyrics.
```

### 14 · `pichon.mp3` — "Era un pibe" (M8, muerte de Pichón)
**Dónde:** la bisagra. El misil que venía para el padre. Música de culpa, no solo de
pena — distinta del Vasco.

```
Tragic sparse cue, 50 BPM, a lone deconstructed music box playing a broken
child-like melody, low string clusters of guilt swelling and receding, one
sub-bass impact like a distant sea swallowing something, then long silence
filled only by wind, a single boy-soprano-like synth voice note held and lost,
grief with the weight of it-should-have-been-me. 75 seconds, ends in near
silence. Completely original music and lyrics.
```

### 15 · `correa.mp3` — "El ángel de Corrientes" (M9, muerte de Correa)
**Dónde:** el intercalado de tierra: Correa tapando a Mateo con el cuerpo. Su música es la
de su tierra: un chamamé despedido.

```
Heartbreaking slow chamamé from Corrientes Argentina, 68 BPM, weeping accordion
lead full of Litoral longing, nylon-string guitar accompaniment, soft male voice
humming wordlessly in chamamé style, river-wide tenderness colliding with war
ambience of distant shelling that never overpowers the music, a good man's soul
going home to his river, ends on a single sustained accordion note. 90 seconds.
Completely original music and lyrics.
```

### 16 · `asado.mp3` — "La última mesa" (M11, el asado)
**Dónde:** el fogón detrás del hangar, la zamba desafinada, "por los que no están en la
mesa". La última noche de la hermandad.

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

## BLOQUE E — La misión final

### 17 · `final_pista.mp3` — "Los teros" (M12, antes de despegar)
**Dónde:** la pista de noche, Cóndor denegando la misión, Puma apagando la radio, el
pincel del Turco. La calma tensa antes de la última música.

```
Low tense nocturnal cue, 58 BPM, deep sustained drone and a slow heartbeat pulse,
faint radio chatter texture being switched off, then unaccompanied criolla guitar
stating fragments of a proud brotherly brass-and-guitar theme that swells like a
squadron flying wingtip to wingtip, quiet and funereal-brave, the cry of a tero
bird echoing once in the far distance, three engines igniting as the final chord.
75 seconds with an arc. Completely original music and lyrics.
```

### 18 · `final_sacrificio.mp3` — "Plata Fiel" (M12, los sacrificios)
**Dónde:** LA pieza épica del juego: Gitano encendiéndose, Puma metiéndose en la muralla,
la música por encima de todo, estilo secuencia coral de sacrificio del cine. No para hasta
que el monte explota.

```
Massive epic orchestral-rock sacrifice sequence, 100 BPM rising to 130, full
cinematic orchestra with male choir chanting powerful wordless phrases, thundering
bombo legüero and military percussion, soaring distorted electric guitar carrying
a proud brotherly brass-and-guitar theme that swells like a squadron flying
wingtip to wingtip, waves of heroic build as one guardian falls and another takes
his place, relentless forward motion, tragic and glorious at maximum intensity,
then THE ENTIRE TRACK CUTS TO ABSOLUTE SILENCE at the peak — two seconds of
nothing — closing with a single jet engine hum alone. 3 minutes. Completely
original music and lyrics.
```

### 19 · `final_decision.mp3` — "Reserva" (el monte apagado y la decisión)
**Dónde:** desde "llegué, hijo" hasta que el jugador elige. Casi no es música: es duelo
con motor de fondo. Loopea mientras el jugador no decide.

```
Barely-there ambient grief piece, 45 BPM, a lone jet engine hum as the tonal
floor, fragments of a simple tender rising-then-falling whistled folk melody, like
a father whistling to his son across a field, played impossibly slow on a distant
detuned piano with long silences between notes, cold wind, no percussion, no
resolution, a father circling an extinguished hill, infinite and hollow. Seamless
loop, no big outro. Completely original music and lyrics.
```

---

## BLOQUE F — La hinchada (versión ORIGINAL del ciclo `pmetal_*`)

*Estas tres pistas son la cara del PACK ORIGINAL para el ciclo de muerte / "Por la
patria": suenan al mismo lugar que las reversiones —la cancha y el cuartel cantando
juntos— pero con música y letra 100% propias. En el PACK PATRIO, este mismo puesto lo
ocupan las `pmetal_*` actuales. Letras originales — nada de himnos ni canciones
existentes.*

### 20 · `pmetal_1.mp3` — "De pie" (aliento épico)
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

### 23 · `epilogo.mp3` — "Dos platos" (telegramas + cuaderno)
**Dónde:** la cocina, los telegramas sin abrir, el cuaderno llegando meses después. La
pieza más chica y más pesada del juego.

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
**Dónde:** los créditos. LA canción del juego, la que se lleva puesta el jugador. El molde
que pediste, afinado a la historia.

```
Original adrenaline-fueled Argentine electro-rock anthem, 160 BPM, lyrics in
Argentine Spanish (voseo) about memory, courage and peace connected to Malvinas —
a father in the sky, a son writing letters from the cold, brothers who gave
everything, and the plea that no flag is worth a kid. Fast live-style drums with
bombo legüero accents, distorted electric guitar riffs as the main hook, urgent
bass, analog synth arpeggios, dramatic full stops, and a massive singalong chorus
built around the phrase "volá bajo". Include a short virtuosic electric guitar
solo before the final chorus, and end the song stripped down: one voice and one
criolla guitar whistling a simple tender rising-then-falling whistled folk melody,
like a father whistling to his son across a field. Cinematic, raw, fast and
emotionally powerful; completely original music and lyrics.
```

### 25 · `postcreditos.mp3` — "El pibe de la 10" (escena post-créditos)
**Dónde:** el museo escolar, la mano en el vidrio, "Volveremos". Cuarenta segundos de
futuro.

```
Tiny luminous epilogue piece, 70 BPM, a real music box playing a simple tender
rising-then-falling whistled folk melody, like a father whistling to his son
across a field, joined halfway by soft distant children's voices humming and one
warm string swell, morning-light hope after grief, a new generation touching the
glass, ends on the music box alone winding down mid-phrase. 40 seconds.
Completely original music and lyrics.
```

---

## Mapa de cobertura — qué pista suena en cada momento

| Momento del juego | Pista |
|---|---|
| Menú de modos (lobby) | actual `lobby.mp3` (se conserva) · 01 El Nido como reserva |
| Pantalla de campaña | 01 El Nido |
| Cinemáticas históricas / briefings | 02 Cuaderno y tinta |
| P.1 el arroyo | 07 Sapito |
| P.2–P.3 radio, plaza, teléfono | 08 La pava que nadie saca |
| Cartas M1–M7 | 03 La Birome |
| Cartas M8–M11 | 04 La Birome rota |
| Gameplay M1–M3 | 09 Rasante |
| Gameplay M4–M10 | 10 Callejón de las Bombas |
| Fase ARENA / boss (todas) | 11 El buque |
| Resultado de misión / rango S | 05 Victory · 06 Cuarta estrella |
| Muerte del Vasco (M6) | 12 La foto era de mi vieja |
| Sobrevuelo (M7) | 13 El batir de alas |
| Muerte de Pichón (M8) | 14 Era un pibe |
| Muerte de Correa (M9) | 15 El ángel de Corrientes |
| El asado (M11) | 16 La última mesa |
| Pista nocturna (M12 pre-vuelo) | 17 Los teros |
| Sacrificios + vuelo final (M12) | 18 Plata Fiel |
| El monte apagado + decisión | 19 Reserva |
| Ciclo de muerte / "Por la patria" | 20–22 la hinchada (PACK ORIGINAL) · `pmetal_*` (PACK PATRIO) |
| Telegramas + cuaderno | 23 Dos platos |
| Créditos | 24 Volá bajo |
| Post-créditos | 25 El pibe de la 10 |

### Notas de producción

- **Prioridad de generación sugerida:** primero las transversales que más suenan
  (01, 02, 03, 09, 10, 11), después los picos (13, 18, 24), después el resto. Con seis
  pistas el juego ya suena entero; con las veinticinco, emociona.
- **Los cortes a silencio son parte de la partitura.** La 18 DEBE cortar en seco (el monte),
  y la muerte del Vasco (12) pierde la estática a mitad de pieza. Si el generador no clava
  el corte, editalo a mano: ese silencio es la nota más importante del juego.
- **Coherencia entre pistas hermanas:** 03/04 (Birome), 09/10 (gameplay), 20–22 (hinchada)
  conviene generarlas en la misma sesión/seed si tu herramienta lo permite.
- **Volumen narrativo:** `war_near_soldats.mp3` (el ambiente de batalla terrestre del mapa
  COSTA) sigue existiendo por debajo de la música, como ya está — la guerra de infantería
  se escucha aunque vueles.
