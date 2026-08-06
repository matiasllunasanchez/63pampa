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
- **D4.** Personajes sin retrato por canon: NORMA (nunca), COLORADO (en aire), CÓNDOR
  (usa el asset `condor_parlante`), VOZ PERUANA (`parlante_escarapela`). Si `cara` es
  null, solo nombre.
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
audio). P.0→P.4 encadenan antes del briefing de m1. **CA:** el orden es dato (lista de
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
| **F1** ✅ | Motor de líneas: tipeo + avance + hold + fallback a negro (RF-02/03/07) sobre las pantallas de historia existentes | — |
| **F2** | Tipos y layouts: VN/CUADRO/TIERRA/CARTA + registros visuales (RF-01/05/06) | F1 |
| **F3** | Retratos y placas con fallbacks + cambio de cara (RF-01/04) | F2 |
| **F4** | Secuenciación por misión + escena por evento (m12) + ritual de Cóndor (RF-09) | F1 |
| **F5** | Estado `ending` + cadenas A/B + flags de save (RF-10) | F4 |
| **F6** | Pulido: tic por personaje, skip con indicador, auto-avance, letterbox, ambiente/foley (RF-02/08/11) | F3 |

Tras cada fase: correr el fixture del locker — **`npm run story`** (queda en
`tools/fixture_story.js`). Mide contra el reloj del juego que cada `hold` sea el del guion, que
una tecla complete el tipeo sin saltear la línea, que ningún toque atraviese un silencio, y que
todo eso pase con cero assets y cero errores de consola. `STORY_SHOTS=<dir> npm run story` deja
además una captura por línea, para la mirada muda.

No está dentro de `npm run check` a propósito: son 13 s de silencios REALES (los holds del
guion). La exactitud al frame la cubre `npm run unit`, que sí corre siempre.

### Estado

| Fase | Estado |
|---|---|
| F1 | ✅ hecha (`npm run story` verde, `npm run check` verde) |
| F2–F6 | pendientes |

## 8. Qué NO hacer *(errores previsibles, prohibidos por diseño)*

1. **No sincronizar NADA con duración de audio.** Ni ahora ni cuando existan voces
   (`await audio.finished` está prohibido — SISTEMA_DIALOGO).
2. **No hardcodear texto de escenas en el motor.** Todo en datos.
3. **No inventar contenido.** Si una escena no está en GUION_3, no existe; si un dato
   falta (una cara, un hold), usar fallback y anotar el faltante — no improvisarlo.
4. **No agregar retratos a Norma, Colorado (aire) ni cara a Cóndor** — es canon, no
   limitación técnica.
5. **No permitir saltear holds línea a línea** — solo el skip de escena completa.
6. **No bloquear la campaña por assets faltantes** — la cascada de fallbacks es la
   feature, no un parche.

## 9. Divergencias encontradas *(completar durante la implementación)*

> La IA implementadora anota acá toda diferencia entre este spec y la realidad del código
> (nombres de archivos, estados, convenciones), con la decisión tomada. Este bloque es la
> memoria del proyecto para la próxima pasada.

### F1 — motor de líneas *(6/8/2026)*

**D-01 · El guion ya escrito NO está en el modelo de escena, y no se migró.** El spec asume
escenas con líneas; la campaña v0.0.1 vive en `data/strings.js` como PANTALLAS
(`{title, paras[], img, style, level, obj}`), ~90 de ellas. Decisión: **adaptador**
(`sceneFromScreen`/`seqFromScreens` en `core/dialogue.js`) que traduce pantalla → escena en
runtime. Un solo motor, y el contenido escrito no se toca. El contenido nuevo se escribe
directo en el modelo del spec, en `data/story.js`.

**D-02 · Dónde vive el motor.** El spec no lo dice; ARQUITECTURA sí: lo puro y el estado
compartido van en `core/`. Quedó `core/dialogue.js` — **sin DOM, sin audio, sin i18n**, para
que `npm run unit` lo pruebe con node — más el store `dlg` (identidad estable: se muta, nunca
se reasigna). El sonido y el "a dónde voy después" los resuelve `game.js` con las señales que
devuelve el motor (`'complete'`/`'next'`/`'scene'`/`'end'`/`null`): **los sistemas no llaman
hacia arriba** (convención 2).

**D-03 · Hay un quinto tipo: TARJETA.** El spec define cuatro (VN/CUADRO/TIERRA/CARTA), pero la
campaña ya tiene la tarjeta previa al nivel (`{level, obj}`), que no es ninguno. Se marca
`tipo: 'TARJETA'`: el título es el nombre de la misión (fijo) y el objetivo es su única línea.

**D-04 · Mezcla de tipos dentro de una escena** *(la decisión que §6 dejaba al implementador)*:
resuelta con **override por línea**, no encadenando escenas. Una línea puede traer su propio
`tipo` e `img` — el dorso de la foto (`M07_LOCKER_030`) es un CUADRO adentro de una escena VN.
Motivo: la escena no se corta, el `ambiente` sigue sonando sin recargarse, y la placa vuelve
sola en la línea siguiente. Encadenar escenas habría partido en dos un momento que es uno.

**D-05 · FALTANTE ANOTADO (no improvisado): el guion viejo no tiene `hold`.** El formato
v0.0.1 no los preveía. Todas las líneas que salen del adaptador caen a `hold: 0` (§8.3: si un
dato falta, fallback y anotar). **Cada escena gana sus holds recién al pasarla al modelo
nuevo** — el fixture del locker es la única que hoy los tiene.

**D-06 · Velocidad de tipeo 19 → 30 cps.** El motor viejo tipeaba la PANTALLA ENTERA a 19 cps
("teletipo ceremonioso"); con una línea por vez eso se arrastra. Se adoptó el ~30 del RF-02.
Perilla: `TYPE_CPS` en `core/dialogue.js`.

**D-07 · La unidad de avance cambió de PANTALLA a LÍNEA** — es lo que pide el modelo (D2), pero
**cambia el ritmo de toda la campaña ya escrita**: donde antes un toque pasaba tres párrafos,
ahora pasa uno. Además varios `paras` superan los ~200 caracteres de D2 y quedan como una línea
larga: es faltante de CONTENIDO (hay que partirlos al reescribirlos), no de motor.

**D-08 · El `title` ya no se tipea**: pasó a ser rótulo fijo de la escena. Es el lugar donde
pasa la escena, no algo que alguien diga; retipearlo en cada línea no tendría sentido.

**D-09 · La gracia anti-salteo ahora es por SECUENCIA, no por pantalla.** Existía como
`story.t > 0.4` en cada pantalla; ahora es `dlg.seqT > 0.4`, o sea solo la primera línea. Sigue
evitando que la tecla que confirmó el menú saltee el arranque, y bloquea menos.

**D-10 · Los puntitos de progreso** contaban pantallas de la secuencia; ahora cuentan **líneas
de la escena en curso**, que es la unidad real.

**D-11 · Las carpetas de assets del RNF-02 todavía no existen.** Solo hay `assets/story/` (el
cargador de `render/screens.js`). El fixture declara `placa: 'vestuario'` y sus caras, y todo
cae a negro sin un error — que es justamente el criterio P2. `assets/plates/` y
`assets/portraits/` llegan con F3.

**D-12 · Costura de prueba nueva: `?scene=<ID>`** arranca dentro de una escena de
`data/story.js` y al terminarla vuelve al menú en vez de encadenar una misión. Misma idea que
`?qa` y `?no3d`. Sin el parámetro no cambia nada.

**D-13 · RNF-04 (save de escenas vistas) no se tocó en F1.** Del que depende el skip instantáneo
de segunda pasada (RF-08) — los dos son F6.

### F2 — la caja VN *(6/8/2026, pedido de Matías: "que aparezca de abajo")*

**D-14 · La caja VN existe y es SOLO de diálogo.** `drawVNBox` (render/screens.js) se dibuja
únicamente cuando la línea tiene `personaje` en una escena VN: panel inferior que sube desde el
borde (0.35 s, reloj nuevo `dlg.sceneT`), busto 36×36 asomando por el borde superior, nombre en
acento subrayado debajo del busto, texto a la izquierda y "OK ▼" solo cuando `canAdvance` (la
ausencia del OK ES el hold, RF-07). Las acotaciones, TARJETA, TIERRA y CARTA siguen en el layout
centrado: la caja es para cuando alguien habla, la narración no es diálogo.

**D-15 · MOCK de retratos (transitorio).** RF-01 dice "sin retrato → solo nombre", pero sin un
solo asset generado eso dejaba la caja pelada. Decisión en dos partes: (a) el ADAPTADOR asigna a
cada hablante su cara neutra de RETRATOS §4 (`CARA_NEUTRA` en core/dialogue.js — Norma, el
Colorado, la radio y la Chancha quedan afuera por canon D4); (b) con `cara` puesta y
`assets/portraits/<cara>.png` faltante, la caja dibuja una SILUETA placeholder (cabeza + hombros
con luz de canto). Cuando los retratos se generen, reemplazan la silueta sin tocar código; cuando
el guion migre al modelo de escena, `CARA_NEUTRA` deja de decidir.

**D-16 · La caja crece con los renglones.** El guion viejo trae líneas de 200+ caracteres (D-07):
la caja calcula su alto por `wrap.length` en vez de truncar. Al partir las líneas en la
reescritura, la caja vuelve a su alto de dos renglones.

**D-17 · Las placas ya se cargan.** `sc.placa` → `assets/plates/<id>.png` como fondo de la escena
(prioridad: `img` de línea → `img` de escena → `placa`), con la misma cascada a negro. Las
carpetas siguen vacías; el build web neutraliza las tres bases (story/plates/portraits) hasta que
haya assets (tools/build_web.py).

**D-18 · La campaña 1 se llama EL CUADERNO DE MATEO** (era LA MESA DE NORMA). El `id: 'norma'`
de data/campaigns.js NO cambió: rotula las partidas guardadas y renombrarlo las dejaría
huérfanas.
