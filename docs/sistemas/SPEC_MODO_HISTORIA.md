# SPEC — Modo Historia (pantallas VN) · Análisis funcional para implementación

> **Audiencia de este documento: una IA implementadora trabajando sobre el código del
> juego.** Define QUÉ construir para la capa de presentación de la historia de la campaña
> "El cuaderno de Mateo", con requerimientos numerados, criterios de aceptación y un
> fixture de prueba. No define contenido (eso vive en el guion) ni arte (eso vive en el
> storyboard).
>
> **Antes de tocar código, leer en este orden:**
> 1. `docs/ARQUITECTURA.md` — el mapa del código y sus convenciones. **Manda sobre
>    cualquier suposición de este spec**: si acá se nombra un archivo o patrón que no
>    coincide con la arquitectura real, adaptar la implementación a la arquitectura, no al
>    revés, y anotar la divergencia al final de este doc.
> 2. `docs/proyecto/PLAN_CAMPANA_001.md` — misiones m1–m14, IDs, estados, roster.
> 3. `docs/historia/SISTEMA_DIALOGO.md` — el modelo de datos del diálogo (fuente de verdad).
> 4. `docs/historia/RETRATOS.md` — placas, retratos, regla híbrida.
> 5. `docs/historia/GUION_3.md` — el contenido (no hace falta entero: la escena que se
>    implemente en cada momento).

---

## 1. Objetivo y alcance

Construir el **modo historia**: la secuencia de pantallas estáticas que envuelve a cada
misión jugable (briefing → misión → epílogo → página del cuaderno) más el prólogo (P.0 a
P.4), la pantalla de decisión final y las cadenas de los dos finales.

**Principios de diseño que gobiernan todo (del guion §0 y del sistema de diálogo):**

- **P1 — El texto manda.** El juego funciona y emociona entero sin voces. Ningún ritmo
  depende de un archivo de audio.
- **P2 — Funciona sin assets desde el día uno.** Cada elemento visual tiene fallback en
  cascada. La historia completa debe poder jugarse hoy con texto solo.
- **P3 — El contenido vive en datos, no en código.** Escenas, líneas, caras y placas se
  declaran en estructuras de datos; el motor solo las interpreta.
- **P4 — La dificultad/fricción nunca frena la historia.** Todo es avanzable; nada
  bloquea; el jugador puede acelerar (pero no saltear los silencios — ver RF-07).

**Fuera de alcance de este spec:** voces (columna `audio` reservada), la m14 jugable real
(contrarreloj/scripted — ver PLAN_CAMPANA_001 §4b), generación de assets, traducción.

## 2. Glosario

| Término | Definición |
|---|---|
| **Pantalla de historia** | Una unidad de presentación estática entre misiones. Cuatro tipos: VN, CUADRO, TIERRA, CARTA. |
| **VN** | Pantalla de diálogo: placa de fondo + retrato del hablante + caja de texto con nombre. El default (~70% de las pantallas). |
| **CUADRO (sagrado)** | Imagen a pantalla completa sin retrato, con texto en cartela inferior. Para los momentos donde la imagen es el contenido. |
| **TIERRA** | Página del cuaderno de Mateo: layout de hoja de cuaderno, tipografía manuscrita, texto largo. |
| **CARTA** | La carta de Esteban: block militar oscuro, tipografía apretada. Se usa UNA vez (epílogo del Final A). |
| **Placa** | Fondo de ambiente sin personajes, reutilizable (14 definidas en RETRATOS.md §3). |
| **Retrato / cara** | Busto del hablante con una expresión, identificado por id (`gitano_serio`). |
| **`hold`** | Silencio obligatorio en segundos DESPUÉS de una línea. Es actuación, no delay técnico. |
| **Escena** | Secuencia ordenada de líneas que comparten placa y ambiente. |

## 3. Modelo de datos *(fuente: SISTEMA_DIALOGO.md — resumen normativo)*

Estructura por escena (el formato concreto —JS/JSON— lo decide la arquitectura existente;
PLAN_CAMPANA_001 ya usa `strings.js` con `story`/`epi`/`paras`/`img`):

```
escena = {
  id: 'M07_LOCKER',            // estable, nunca se renombra
  tipo: 'VN' | 'CUADRO' | 'TIERRA' | 'CARTA',
  placa: 'vestuario',          // solo VN — id de assets/plates/<id>.png
  img: 'M7_LOCKER_DORSO',      // solo CUADRO — id de assets/story/<id>.png
  ambiente: 'locker_noche',    // capa de audio de la escena (opcional)
  lineas: [
    { id: 'M07_LOCKER_010', personaje: 'GITANO', cara: 'gitano_roto',
      es: 'La casada… Turco, dejámela ver una última vez.', en: '',
      hold: 1.0, foley: null },
    ...
  ]
}
```

Reglas de datos (no negociables — vienen del sistema de diálogo):

- **D1.** IDs de línea `MNN_ESCENA_###` numerados de 10 en 10; nunca cambian aunque cambie
  el texto; nunca se reutilizan. ⚠ El ejemplo viejo de SISTEMA_DIALOGO.md dice
  `M06_LOCKER…` con la numeración de 12 misiones — **la numeración canónica es la de 14
  (el locker es m7 → `M07_LOCKER_…`)**.
- **D2.** Una línea = lo que se muestra de una vez. Sin líneas de más de ~200 caracteres.
- **D3.** `en` vacío cae a `es` (comportamiento ya existente de `initStory`).
- **D4.** Personajes sin retrato por canon: COLORADO (en aire) y CÓNDOR
  (usa el asset `condor_parlante`). Si `cara` es null, solo nombre.
  *(🟨 3.4: NORMA salió de esta lista — habla y tiene retrato en P.2.)*
  *(🟨 3.5: el PILOTO PERUANO también salió — ya no es una voz de radio; habla en tierra en
  Tandil y tiene busto propio. El asset `parlante_escarapela` queda sin uso.)*
- **D5.** Las acotaciones (líneas sin personaje) se muestran sin nombre, en cursiva/estilo
  propio, y respetan `hold` igual.

## 4. Requerimientos funcionales

### RF-01 · Render de pantalla VN
Placa como fondo (escala pixel-perfect, nearest-neighbor); caja de diálogo inferior con
borde del estilo del juego; nombre del hablante SIEMPRE visible; retrato busto a la
izquierda de la caja (referencia visual: captura estilo Police Stories); indicador de
"avanzar" (flecha) cuando la línea terminó de tipearse.
**Fallbacks en cascada:** sin placa → tarjeta negra (comportamiento actual) · sin retrato
→ caja sin busto, solo nombre · sin nada → texto sobre negro. **Criterio de aceptación:**
una escena con 0 assets se ve y se juega correctamente.

### RF-02 · Tipeo letra por letra
El texto de cada línea se escribe carácter por carácter con un tic de sonido corto cada N
caracteres (no cada uno — evaluar 2–3 para que no ametralle). Velocidad base configurable
(default ~30 cps de tipeo visual). **El tic varía por personaje** (pitch/timbre leve):
mapa `personaje → tick_id` en datos; fallback a tick genérico. Sin audio disponible, el
tipeo funciona mudo. **CA:** input durante el tipeo completa la línea al instante (no la
saltea).

### RF-03 · Avance
Con la línea completa: input del jugador avanza a la siguiente. **Auto-avance opcional**
(config, default OFF): `max(1.6, caracteres/12) + hold` segundos. **CA:** nunca se
requiere doble input para una misma línea (uno completa, el siguiente avanza).

### RF-04 · Cambio de retrato por línea
`cara` se aplica al mostrar la línea (swap instantáneo o fade de 2 frames, no más). El
cambio de cara entre líneas es un recurso de dirección (ej.: `gitano_carcajada` →
`gitano_serio` en "veinte marinos"). **CA:** dos líneas seguidas del mismo personaje con
caras distintas producen el cambio visible.

### RF-05 · Tipos TIERRA y CARTA
TIERRA: fondo de hoja de cuaderno, tipografía manuscrita, texto en bloque (no caja VN),
tipeo más lento (es lectura íntima), sin retrato. CARTA: fondo block militar oscuro,
tipografía apretada, mismo comportamiento. Los estilos `tierra`/`carta` ya previstos en
PLAN_CAMPANA_001 §4. **CA:** los tres registros son distinguibles de un vistazo sin leer.

### RF-06 · Tipo CUADRO (sagrado)
Imagen a pantalla completa; el texto (si hay) va en cartela inferior angosta con el mismo
motor de tipeo; sin retrato; letterbox opcional (barras) para marcar "ahora se mira".
**CA:** un CUADRO sin imagen disponible muestra la cartela sobre negro (no rompe).

### RF-07 · `hold` — el silencio obligatorio
Tras completar una línea con `hold > 0`: se oculta el indicador de avance y el input se
ignora durante `hold` segundos (el ambiente sigue sonando). **El jugador puede acelerar el
tipeo pero JAMÁS saltear el hold** — es la regla de actuación del juego. Excepción: el
skip de escena completa (RF-08) sí lo salta. **CA:** en el fixture del locker, tras "El
Vasco tenía quince años." hay 4 s exactos sin poder avanzar.

### RF-08 · Skip de escena
Mantener apretado (tecla/botón, ~1.5 s con indicador circular) salta la escena completa a
su última línea. Disponible siempre (principio P4). En segunda pasada de una escena ya
vista (flag en save), el skip es instantáneo. **CA:** ninguna escena puede dejar al
jugador atrapado.

### RF-09 · Secuenciación de bloque
El flujo por misión es fijo: `briefing (1+ escenas) → misión jugable → epílogo (1+
escenas) → cuaderno (TIERRA)`, con las excepciones del guion: m12 corta a tierra EN MEDIO
de la misión (hook: escena disparada por evento de misión, no solo pre/post), y el ritual
de Cóndor abre cada briefing (primera escena o primera línea, con sting 30 si existe el
audio). P.1→P.4 encadenan antes del briefing de m1 — 🟨 (3.2) NO existe P.0 al inicio: la escena
de la puerta de Norma va SOLO en la cadena del Final A. Ningún asset, texto o pantalla
puede insinuar antes del cierre que la historia está siendo leída. **CA:** el orden es dato (lista de
escenas por misión), no código.

### RF-10 · La decisión final (estado `ending`)
Tras el epílogo del clímax de m14: pantalla sin caja de diálogo ni menú — el cuadro de los
dos rumbos (imagen o negro con dos indicadores de rumbo del HUD). Input izquierda = Final
B (casa), derecha = Final A (oleada). Sin texto de opciones, sin timeout, sin default. La
elección encadena la lista de escenas del final correspondiente y setea flag en save
(`final_visto: 'A'|'B'`; B además marca `final_oculto: true`). **CA:** no existe forma de
"cancelar" — cualquier input lateral decide.

### RF-11 · Audio de escena
`ambiente` (loop por escena) y `foley` (one-shot por línea) se disparan vía el sistema de
audio existente; si el archivo no existe, silencio sin error. La columna `audio` (voz) se
ignora por ahora (reservada). **CA:** ninguna escena falla por asset de audio faltante.

### RF-12 · Localización
Todas las líneas usan `es` con fallback ya descripto; la selección de idioma reutiliza el
mecanismo existente de `STRINGS`. No traducir nada en esta fase; solo que el pipeline lo
soporte. **CA:** cambiar el idioma con `en` vacíos muestra el juego en español sin
errores.

## 5. Requerimientos no funcionales

- **RNF-01** Render pixel-perfect (nearest, sin suavizado) coherente con el juego.
- **RNF-02** Cero dependencias nuevas; assets PNG/MP3 con las convenciones existentes
  (`assets/plates/`, `assets/portraits/`, `assets/story/` — o las que dicte ARQUITECTURA).
- **RNF-03** El modo historia no puede romper los modos existentes (CICLO/ARENA/PATRIA no
  se tocan).
- **RNF-04** Save: escenas vistas + `final_visto` + `ups` existente. Nada más.
- **RNF-05** Todo texto de UI nuevo pasa por strings (localizable).

## 6. Fixture de aceptación — el locker de m7 *(la escena de prueba obligatoria)*

Implementar esta escena real como prueba integral (contenido completo en GUION_3.md, M7
"El locker"). Datos de muestra:

```
escena M07_LOCKER  tipo VN  placa 'vestuario'  ambiente 'locker_noche'
M07_LOCKER_010  ACOTACION —              El Turco junta las cosas del Vasco en una caja.   hold 2.0
M07_LOCKER_020  GITANO  gitano_roto      La casada… Turco, dejámela ver una última vez.    hold 1.0
M07_LOCKER_030  ACOTACION —  [pasa a tipo CUADRO img 'M7_FOTO_DORSO']
                                          La da vuelta. Nada más que eso.                   hold 2.5
M07_LOCKER_040  PUMA    puma_quebrado    Sesenta y uno.                                    hold 1.5
M07_LOCKER_050  ESTEBAN tero_roto        El Vasco tenía quince años.                       hold 4.0
M07_LOCKER_060  GITANO  gitano_roto      Tres años le cebé mate a este culiao. Tres años…  hold 2.0
```

**La escena pasa si:** funciona sin ningún asset (P2); el CUADRO del dorso interrumpe el
VN y vuelve (mezcla de tipos dentro de una escena o escenas encadenadas — decisión del
implementador, documentarla); los holds se respetan exactos; y **mirada muda en build**,
la escena emociona — ese es el criterio final del director (Matías).

## 7. Plan de implementación sugerido *(fases chicas, cada una shippeable)*

| Fase | Entrega | Depende de |
|---|---|---|
| **F1** | Motor de líneas: tipeo + avance + hold + fallback a negro (RF-02/03/07) sobre las pantallas de historia existentes | — |
| **F2** | Tipos y layouts: VN/CUADRO/TIERRA/CARTA + registros visuales (RF-01/05/06) | F1 |
| **F3** | Retratos y placas con fallbacks + cambio de cara (RF-01/04) | F2 |
| **F4** | Secuenciación por misión + escena por evento (m12) + ritual de Cóndor (RF-09) | F1 |
| **F5** | Estado `ending` + cadenas A/B + flags de save (RF-10) | F4 |
| **F6** | Pulido: tic por personaje, skip con indicador, auto-avance, letterbox, ambiente/foley (RF-02/08/11) | F3 |

Tras cada fase: correr el fixture del locker.

## 8. Qué NO hacer *(errores previsibles, prohibidos por diseño)*

1. **No sincronizar NADA con duración de audio.** Ni ahora ni cuando existan voces
   (`await audio.finished` está prohibido — SISTEMA_DIALOGO).
2. **No hardcodear texto de escenas en el motor.** Todo en datos.
3. **No inventar contenido.** Si una escena no está en GUION_3, no existe; si un dato
   falta (una cara, un hold), usar fallback y anotar el faltante — no improvisarlo.
4. **No agregar retratos a Colorado (aire) ni cara a Cóndor** — es canon, no
   limitación técnica. *(🟨 3.4: Norma salió de esta regla — habla y tiene retrato en P.2.)*
5. **No permitir saltear holds línea a línea** — solo el skip de escena completa.
6. **No bloquear la campaña por assets faltantes** — la cascada de fallbacks es la
   feature, no un parche.

## 9. Divergencias encontradas *(completar durante la implementación)*

### Ajustes de playtest (19/8/2026) — jugando el guion de M1

**D-14 · TECHO AL SILENCIO: `HOLD_MAX = 1` s.** RF-07 y SISTEMA_DIALOGO decian que el `hold`
ES la actuacion, y el fixture medía los 4,0 s de "El Vasco tenía quince años" como criterio de
aceptación. Jugado, esa espera **se siente muerta**, no dramática. Decisión del autor: los datos
del guion siguen pidiendo sus 2/2,5/4 s —la intención del director queda escrita— y una perilla
única en `core/dialogue.js` recorta cuánto de eso se respeta en pantalla. Subirla a 4 devuelve el
diseño original sin tocar una línea de contenido. El recorte vale para el tiempo **y** para el
input a la vez, para que el cartel nunca mienta. Unit tests y `npm run story` actualizados a
propósito: ahora comparan **lo que pide el guion contra el techo**, que es la decisión completa.

**D-15 · El parpadeo del prompt arrancaba desfasado.** Estaba atado al reloj de la secuencia, así
que al habilitarse el avance la onda podía estar en su mitad apagada: hasta ~0,8 s extra de espera
invisible, sumados al silencio. Ahora el reloj es propio (`sinceReady()` en el motor, porque
depende del techo): el primer cuadro visible es el primero posible.

**D-16 · El prompt es un ÍCONO, no texto.** El glifo del ENTER dibujado (placa redondeada + flecha
de retorno), sin la palabra: el gesto es universal y el renglón competía con lo único que importa,
que es lo que alguien está diciendo. Pleno en la última pantalla de la secuencia, apagado en las
intermedias — el peso dice "esto cierra algo" sin texto.

**D-17 · El título va CHICO y arriba a la izquierda.** Era 11 px centrado y competía de igual a
igual con la línea de diálogo. Es un rótulo de ubicación, se lee de reojo. La TARJETA de nivel es
la excepción: ahí el nombre de la misión ES el contenido.

**D-18 · El sello PRUEBA salió de las pantallas de guion.** Su razón (distinguir una captura de
prueba de una partida real) vale en el vuelo y no existe en una cinemática. Sigue en las fases de
vuelo y clímax; en `story`, `epilogue` y `upgrade` era ruido sobre el texto.

### El cuaderno de Mateo (29/8/2026) — RF-05, la mitad TIERRA

RF-05 pedía "fondo de hoja de cuaderno, tipografía manuscrita, texto en bloque, sin retrato" y
hasta acá estaba entregado a medias: el fondo era la lámina del cuaderno **con el velo negro al
55% encima**, la tipografía era el monospace de siempre teñido de celeste, y el bloque caía
**centrado en el medio de la pantalla**, arriba del dibujo. Los tres registros no eran
distinguibles de un vistazo, que es el CA del requisito. Se cerró entero.

**D-19 · El texto va en la HOJA IZQUIERDA, no centrado.** Las catorce carillas de
`assets/story/carta*.webp` están dibujadas con el dibujo a la **derecha** del espiral y la hoja
izquierda **rayada y vacía**: el hueco para el texto ya estaba hecho desde que se generaron las
láminas, y el texto se dibujaba encima del dibujo. La columna se declara en **fracciones del
rectángulo de la lámina** y no de la pantalla (`CUAD.x0/x1/y0/y1` en `render/screens.js`), medidas
sobre `carta1_p4.webp`: así sobrevive al letterbox y a cualquier tamaño de imagen.

**D-20 · La letra es MAYORICE, y la elección no fue de gusto.** El banco de fuentes tenía dos
manuscritas y la primera candidata —Cochocib— **no tiene un solo acento ni la eñe**. El canvas no
avisa: le pide el carácter que le falta a otra fuente y sigue, así que "un frío que no tiene
nombre" saldría con la i de una tipografía y la tilde de otra, en cartas que dicen *frío*, *país*,
*podés*, *mamá* y *el jujeño* en el mismo párrafo. Se agregó **`node tools/glifos.js`**, que lee
el `cmap` de cada archivo y lo dice. De paso encontró algo peor y **fuera de este trabajo**:
`EmbolismSpark`, la fuente que hoy usa el texto corrido del menú de modos, declara los acentos y
los manda **al mismo glifo que la letra pelada** — el menú se está dibujando sin una sola tilde.
No se tocó: es otra pantalla y otra decisión.

**D-21 · Se fue el velo; queda una franja abajo.** La lámina va a alfa 1 (es el papel, no una foto
atrás del texto) y el único oscuro que sobrevive es un degradé de 26 px en el borde inferior. No
es decoración: los controles y los puntos de avance son de color claro y sobre papel crema no se
leerían. La línea de barrido y el marco de expediente no entran al cuaderno — son artefactos de
pantalla y esto es una hoja de papel.

**D-22 · Los dos controles se van a las puntas opuestas de la página.** ANTERIOR arriba a la
**izquierda**, SIGUIENTE abajo a la **derecha** (`promptCuaderno`): volver donde empieza lo que ya
leíste, seguir donde termina. Es la única pantalla del juego donde no van juntos, y contradice a
propósito la regla de `promptAvanzar` ("siempre en el mismo lugar"): esa regla los cuelga del borde
de la caja de diálogo, y acá no hay caja — hay una hoja que ocupa la pantalla entera, donde dos
íconos juntos en el medio del papel se leen como algo dibujado en ella. Arriba **no hay franja
oscura** (D-21: el oscuro vive sólo abajo), así que ANTERIOR lleva una sombra de tinta apenas
corrida debajo del ícono y de la palabra: sin ella el naranja del acento cae sobre papel crema y el
control existe pero no se ve, que es peor que no estar.

**D-23 · La línea de NARRADOR de una escena TIERRA no entra al cuaderno.** "Esa misma semana,
empezaba la guerra." (`P4_1_050`) no la escribió Mateo, así que sale por el camino de siempre: la
caja VN de abajo, sobre la página oscurecida. El corte de la hoja iluminada al velo **es** la
marca de que dejó de hablar la carta. Es la misma decisión que ya estaba tomada para el color del
narrador, llevada hasta el layout.

**D-24 · La placa de ambiente NO sirve como hoja.** La cascada de fondos de `drawStory` tiene tres
escalones; el cuaderno sólo acepta el primero (`assets/story/carta*.webp`). `p1c_cuaderno` es un
**dibujo de Mateo escribiendo**, vertical, y la letra le caía encima de las rodillas. Sin carilla
propia, `drawCuaderno` pinta la suya —crema, renglonada, con el lomo en el medio— y la carta se
lee igual (RF-01). **Hoy la usa una sola escena: `M11_CARTA`, «LA ÚLTIMA CARTA · SIN COPIAR». El
guion tiene quince cartas y `assets/story` tiene catorce carillas: a esa le falta la suya.**

**D-25 · El tipeo NO cambió de velocidad.** RF-05 pedía "tipeo más lento (es lectura íntima)" y
`TYPE_CPS` sigue en 30 para todos los registros. Hacerlo por registro obliga a meter una perilla
visual adentro del motor de líneas, que es puro a propósito y lo prueba `npm run unit` sin
navegador. Lo que cambió es **cómo aparece**: los últimos seis caracteres entran pálidos y se van
afirmando, y en vez del cursor de bloque titilante hay un trazo corto e inclinado que baja hasta
el renglón — la punta de la birome. Si al jugarlo el ritmo pide ser más lento, la perilla es
`TYPE_CPS` por escena y este renglón dice qué hay que aceptar a cambio.

**D-26 · Fixture propio: `npm run cuaderno`.** Recorre las quince cartas en el juego de verdad y
falla si alguna **no entra en la hoja** (`drawCuaderno` avisa por consola cuando ni achicando la
letra alcanza) o si el wrap propio —que mide en píxeles, porque la manuscrita es proporcional—
pierde caracteres al final de una frase. Medida al cerrar: **15 cartas · 56 carillas · 8.740
caracteres, ninguna se derrama**, la más larga son 289 caracteres en 9 renglones.

> La IA implementadora anota acá toda diferencia entre este spec y la realidad del código
> (nombres de archivos, estados, convenciones), con la decisión tomada. Este bloque es la
> memoria del proyecto para la próxima pasada.

- *(vacío)*
