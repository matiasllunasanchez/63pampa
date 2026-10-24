# LA MÚSICA EN CAPAS — que la música siga la intensidad del juego

> **Pedido del autor (23/10/2026):** "sincronizar un nivel con la música generada, o que la música
> quede BIEN con la cantidad de enemigos y demás; que sincronice con la intensidad del juego. Usaríamos
> músicas hechas con SUNO a demanda, y también adaptar las existentes. Hacer ambas pruebas."

## La idea

La música **sigue** al juego, no lo marca. Los niveles van por distancia y la velocidad cambia (la
racha acelera, el viento frena): un nivel coreografiado sobre una canción se desfasa al primer minuto,
y spawnear al compás haría que la dificultad dependa de la pista que tocó.

Dos piezas:

1. **La intensidad (0..1)** — `src/core/intensidad.js`, pesos en `src/data/musica_capas.js`
   (`INTENSIDAD`). Sale de lo que ya pasa: estrellas, barra del radar, misiles viniendo, enemigos
   cerca, el buque acercándose (y si le quedan lanzadores), el escape, la chapa baja; el clímax de
   la suelta la clava en 1. Sube en 0,6 s y baja en 4 s.
2. **Las capas** — `src/systems/capas.js` (WebAudio). Los stems de una pista suenan juntos y
   sincronizados (arrancan en el mismo instante del reloj de audio). Cada capa tiene su escalera
   contra la intensidad: **subir entra en el próximo tiempo, bajar en el próximo compás**, así nunca
   se corta una frase a la mitad. Un pasabajos en el master "aleja" la música en calma y la abre con
   tensión. El volumen general sigue siendo el de la mezcla (OPCIONES, ducking, RASANTE, pausa).

## Cómo se prueba

**MODO DEV → SMALL CON MÚSICA**: la t17 con la pista `CAPAS_PRUEBA` (`data/musica_capas.js`) y un
medidor abajo a la derecha (la intensidad y cuánto suena cada capa, más el número de compás).
**[N] / [M] cambian de pista en capas volando** (las teclas del reproductor). El loop cierra en el
último compás completo: la intro suena una vez y la cola de la pista (un fade, un acorde que queda) no
entra en la repetición.

## Prueba 1 — una pista existente, separada con Demucs ✔ (23/10)

*Balas en bandoneón* (`assets/music/original/balas_en_bandoneon1.mp3`) separada con Demucs
(`htdemucs`) en bajo, batería, resto (el bandoneón y lo melódico) y "voces" (la pista es instrumental:
es lo que se filtra de los otros). Grilla medida: **89,1 BPM, primer tiempo a 2,415 s, 77 compases**.

| capa | entra | por qué |
|---|---|---|
| bajo | siempre | el piso: nunca se queda muda |
| resto (bandoneón) | 35 % en calma → 100 % a 0,45 | la melodía está, pero lejos |
| batería | de 0,25 a 0,6 | el pulso llega con el peligro |
| voces (brillo) | de 0,7 a 0,95 | solo en lo más alto |

Medido en el juego (sonda `__capas`): volando la t17 hacia el buque, la intensidad sube de 0,08 a
~0,5; la batería entra de 0 a 0,73 en bordes de tiempo, el resto llega al 99 % y el filtro se abre de
1,4 kHz a 18 kHz. **Cómo suena lo juzga el autor.**

## Prueba 2 — una pista pedida a Suno ✔ (23/10)

**SYNCTEST** (`assets/music/suno_capas/Synctest.wav`, 3:39), con el pedido de abajo. Vino la mezcla
sola —sin stems— y se separó con Demucs como Balas. Es instrumental: el stem de voces salió en −74 dB
y no entra. Queda en bajo, resto y batería.

**La grilla es la gran diferencia:** la de Suno, pedida a 120 BPM, mide **120,004** con 421 de 423
tiempos sobre la recta y un error máximo de **27 ms** — perfecta. Balas mide 88,513 pero con hasta
**475 ms** de error: tiene tempo humano, y ninguna grilla fija le calza del todo (los cambios de capa
pueden caer corridos en algunos tramos). Pedir a Suno con BPM fijo es lo que hace que los cambios
caigan en el tiempo justo.

**El método de medición** (`tools/musica_capas.py`, corregido el 23/10): el tempo sale de ajustar una
recta a todos los tiempos detectados, descartando los mal detectados — el estimador de librosa trabaja
en escalones y dio 117,45 para la pista de 120 (y 89,1 para Balas, cuyo ajuste da 88,51: 0,6 % que en
tres minutos son más de un segundo de grilla corrida). El primer tiempo fuerte sale de la energía de
ataque promediada sobre toda la pista.

### El pedido usado

**Style of Music** (el campo de estilo):

```
Instrumental, 120 BPM, D minor, 4/4, steady tempo. Argentine war action score: bandoneon lead, driving rock drums, bombo legüero, deep electric bass, dark strings pad, tense. No tempo changes, no fade-out, no vocals.
```

**Lyrics** (la estructura, con etiquetas):

```
[Instrumental]
[Intro: bass and pad only]
[Verse: add drums]
[Build]
[Chorus: full band, bandoneon lead]
[Break: bass and pad]
[Chorus: full band]
[Outro]
[End]
```

### Lo que hace falta de vuelta

1. **La mezcla completa** (WAV, o MP3; todo en el mismo formato).
2. **Los stems** de Suno si se pueden bajar (*Get Stems*): mejores que los de Demucs, porque salen de
   la generación y no de separar una mezcla. Sin stems también anda: se separan con Demucs.
3. Que **no tenga fade ni cierre lento** (sacar `[Outro]`/`[End]`); 3 a 4 minutos.

**Por qué así:** BPM fijo y declarado (el malambo y el carnavalito van en 6/8 y un detector se puede
equivocar; con el BPM pedido sabemos cuál es), sin cambios de tempo ni fade (las capas loopean),
instrumentos bien separados (cada uno es una capa), y una estructura con un tramo tranquilo y uno lleno
(para que las capas tengan algo que sumar).

### Cómo entra al juego

```bash
.venv-art/bin/python3 tools/musica_capas.py suno1 "<mezcla.wav>" "<carpeta de stems>"
```

Mide la grilla, codifica los stems a `assets/music/capas/suno1/` y **imprime la entrada lista para
pegar** en `PISTAS_CAPAS` (con la escalera por papel: bajo siempre, colchón y resto de base, batería
desde 0,25, líder desde 0,45, percusión desde 0,5, voces y efectos arriba). Después, `CAPAS_PRUEBA =
'suno1'` y a volar.

## Herramientas

- `tools/musica_capas.py` — mide la grilla (librosa) y codifica stems (Demucs o Suno). Necesita el
  entorno del arte (`.venv-art`, con `demucs` y `librosa` instalados el 23/10).
- Separar una pista existente: `.venv-art/bin/python3 -m demucs -n htdemucs -o <salida> <pista>`.
- Sonda `__capas()` — la intensidad, la foto del juego y el nivel de cada capa (QUITAR al cerrar).
- Pruebas: `tools/unit.js` (la intensidad sube y el clímax la clava, el suavizado, la escalera, la
  grilla de compases, y que cada stem del catálogo exista).

## Pendiente / a decidir con el autor

- **Cómo suena**: las escaleras y los pesos de la intensidad se afinan escuchando.
- **El clímax con remate**: hoy el clímax lleva todo a 1; un golpe (un stinger) al impactar la bomba.
- **La música de la misión** (`musica` en data/missions.js, el libro de vuelo): si la prueba gusta, que
  una misión pueda pedir una pista en capas en vez de una mezcla.
- Los stems pesan ~4 MB cada uno (m4a 160 kbps): no entran al build web (base muerta en
  `tools/build_web.py`).
