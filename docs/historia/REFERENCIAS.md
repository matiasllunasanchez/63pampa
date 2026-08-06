# Referencias — RASANTE

Qué cosa del juego apunta a qué cosa real. Es el documento de **intención**: por qué una fuente,
una foto o una pista están ahí y no otra.

Distinto de [PREGUNTAS_HISTORICAS.md](PREGUNTAS_HISTORICAS.md), que junta dudas de dato duro
(fechas, bajas, nombres de buque). Acá no hay nada que verificar: hay decisiones de autor.

Sirve para tres cosas:

1. **Que la referencia no se pierda.** Dentro de seis meses nadie se acuerda de por qué la
   tipografía del menú es manuscrita, y alguien la cambia por una "más prolija".
2. **Que se pueda contar.** Es material directo para la página de Steam, el devlog y la prensa.
   Un juego indie sobre Malvinas se defiende con sus decisiones, no con su tecnología.
3. **Que se puedan revisar los derechos.** Varias de estas referencias son material de terceros
   (ver [Pendientes](#pendientes-de-resolver) al final).

---

## Tipografía manuscrita — las cartas de los soldados

**Dónde:** los textos del menú de modos. Las descripciones de cada modo (`FONTS.desc`,
hoy EmbolismSpark) y el rótulo de sección (`FONTS.label`, GlimpRThin) — ver
[src/render/ctx.js](../src/render/ctx.js).

**A qué apunta:** a las **cartas escritas a mano** de los soldados de Malvinas. Las que
mandaron desde las islas y las que recibieron — incluidas las miles que escribieron chicos y
chicas de escuelas de todo el país a "un soldado argentino", sin saber a quién le iba a tocar.

**Por qué así:** el juego es una máquina arcade. Vas rápido, esquivás, morís, reintentás. La
letra manuscrita es lo único que **no** es una máquina: es una persona escribiendo. Que el
menú —el momento en que el jugador está quieto, antes de despegar— esté en manuscrita y el
juego en tipografía técnica es la diferencia entre quién era esa persona y qué le tocó hacer.

**Cómo se sostiene la decisión:** la manuscrita se usa para el **texto que se lee** (las
descripciones), no para el que se mira. Los nombres de los modos y el logotipo van en display
condensada. Si en algún momento se decide que la manuscrita no se lee lo suficiente, la salida
NO es sacarla: es subirle el cuerpo o cambiarla por otra manuscrita. La referencia manda sobre
la fuente puntual.

**Familias probadas para este papel:** Opencare, Vegabond, Cochocib, Kabur, Mayorice,
GlimpR Thin/Italic, Smooth Elegant, EmbolismSpark. Todas viven en `assets/fonts/simple/`.
Cambiar la elegida es una palabra en `FONTS` — ver el banco de pruebas `DESC_TRY` en
[src/render/menus.js](../src/render/menus.js).

---

## Fotos e imágenes — Malvinas y el Mundial

**Dónde:** los fondos de `assets/images/general/` — portada (`ppal/`), victoria (`win/`) y
derribo (`lose/`).

**A qué apuntan:** dos capas superpuestas a propósito.

- **1982.** Pilotos, aviones y la cubierta: la guerra en sí.
- **El Mundial y el triunfo sobre Inglaterra.** Material del Mundial reciente en el que
  Argentina le ganó a Inglaterra, y de toda la movida de Malvinas alrededor de ese partido —
  las banderas en la tribuna, el "las Malvinas son argentinas" en el estadio, el reclamo que
  sigue vivo cuarenta años después.

**Por qué las dos juntas:** porque para el argentino que juega esto, Malvinas no es solo un
hecho de 1982. Es una cosa presente, y la vía por la que más gente la vive hoy es la cancha.
Poner las dos capas en el mismo juego dice que el reclamo no se terminó con la guerra.

**Ojo con el tono:** son dos registros muy distintos. El festejo deportivo y el derribo de un
avión no pueden convivir en la misma pantalla sin cuidado. Criterio actual: las de guerra
mandan en las pantallas de **derrota** y en las de historia; las de festejo/reclamo, en
portada y **victoria**.

---

## Música — pistas de aliento

**Dónde:** `assets/audio/pmetal_*.mp3`, la playlist del reproductor.

**A qué apuntan:** cantos de cancha y marchas patrias reversionadas — el himno, San Martín,
"Aún de pie", Aurora, "Soy hincha". Es el mismo cruce que las fotos: lo militar y lo futbolero
son, en la práctica, los dos lugares donde este país canta junto.

**Reparto por modo** (ver [src/systems/audio.js](../src/systems/audio.js)):

| Contexto | Pista |
|---|---|
| Lobby | `lobby.mp3`, en loop |
| Historia (juego real) | `game.mp3` |
| Cinemáticas | `story.mp3` |
| Ciclo de muerte / Por la patria | playlist `pmetal_*`, encadenada |

---

## Sonido de ambiente — la costa

**Dónde:** `war_near_soldats.mp3` en el mapa COSTA, al 80%.

**A qué apunta:** al desembarco británico en San Carlos. No es música: es el fondo de una
batalla terrestre que está ocurriendo **abajo** mientras vos pasás volando. El jugador está
en el aire; la guerra de infantería se escucha igual.

---

## La cuarta estrella

**Dónde:** el recuento de fin de misión — `assets/images/malvinas.webp`.

**A qué apunta:** el sistema de puntaje da tres estrellas por desempeño; la cuarta no es una
estrella, es **la silueta de las islas**. Se gana solo con el desempeño máximo y es el rango
"S". La idea es explícita: lo máximo a lo que se puede aspirar en este juego no es una nota,
son las Malvinas.

---

## Pendientes de resolver

Cosas que hay que cerrar antes de publicar en Steam. **No frenan el desarrollo.**

- [ ] **Derechos de las fotos.** Las de `images/general/` son material de terceros. Hay que
      resolver licencia, reemplazo por material propio/libre, o ilustración original.
- [ ] **Derechos de la música.** Las `pmetal_*` son reversiones. Mismo problema, y en Steam
      pesa más: una denuncia de copyright puede bajar la página.
- [ ] **Licencia de las tipografías.** Varias de `assets/fonts/` son gratuitas para uso
      personal pero no comercial (el nombre "Cochocib Script **Free**" ya avisa). Hay que
      chequear una por una la que quede elegida.
- [ ] **Marcas de agua.** Las imágenes generadas con IA tienen que ir sin marca antes de subir.
- [ ] **Uso de imagen de personas reales.** Si alguna foto muestra jugadores o veteranos
      identificables, revisar si corresponde permiso.

---

## Cómo agregar una referencia acá

Una sección por referencia, con estas cuatro cosas:

- **Dónde** — el archivo o la pantalla concreta, con link al código.
- **A qué apunta** — la cosa real.
- **Por qué** — qué se quiere que sienta el jugador. Es la parte que importa; sin esto, la
  próxima persona que toque el archivo borra la referencia sin darse cuenta.
- **Ojo con** — el riesgo de tono o de derechos, si lo hay.
