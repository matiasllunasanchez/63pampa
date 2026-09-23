# LA LLEGADA — mecánicas jugables para el momento del blanco *(listado de opciones)*

> **Qué es.** Un listado de mecánicas posibles para **la instancia de cada misión en que se llega
> al objetivo y se enfrenta al enemigo** — lo que hoy resuelve EL PULSO (cabina + tiempo casi
> congelado + combinación de teclas + cinemática de premio). No es un plan: es el menú para
> elegir qué probar, con qué se reusa, qué cuesta y en qué misión encaja.
>
> **La premisa que lo ordena (decisión del autor, 14/9/2026):** **todas las misiones son IDA y
> VUELTA.** La ida es tranquila (rasante, olas, pesqueros, bandadas, pocos obstáculos); la vuelta
> es la guerra (esquivar todo, te atacan). **Salvo la misión final.** Esto ya está escrito como
> forma en `PLAN_MISION_CINCO_FASES.md` §11 ("dos mitades, dos verbos") y construido para `t15`.
>
> **Estado:** listado de opciones + **decisión provisoria del autor (14/9/2026) en §0**: se
> mantiene EL PULSO como ataque al buque, atado a las dos situaciones de llegada (te vieron / no
> te vieron). La altura justa (A1) queda como alternativa si el playtest dice que el corte a la
> cabina sigue molestando. Relevamiento de lo existente en §1.

---

## 0 · DECISIÓN PROVISORIA *(Matías, 14/9/2026)*

### 0.1 Las dos situaciones al llegar

La ida se vuela como fantasma (el FILO, bajo el radar). Al llegar al objetivo hay **dos
situaciones**, y la decide el radar: si te pintó en algún momento de la ida, o no.

| situación | qué hay al llegar | qué existe ya |
|---|---|---|
| **TE VIERON** | la **escalera de tres alcances**: **largo** = bombas grandes cayendo verticales · **medio** = antiaéreos · **corto** = fusilería de soldados a ras | largo: `bombs` por fase (hoy en 0 en toda la ida justamente porque "una bomba cayendo significa que te vieron") · medio: los AA de las laderas de m5 (`PLAN_PASILLO_ZIGZAG`) y los AA del pasillo · corto: soldados + la fusilería construida para la PASADA · el disparador: `pinta:` de fase + el nivel de búsqueda de `systems/estrellas.js` |
| **NO TE VIERON** | nada. Llegás limpio, atacás, y el buque se despierta **detrás tuyo**: la vuelta arranca con el fuego en la cola | el embudo `volverDelBlanco()` ya vuelve a `play` sin pantalla de resultados |

Históricamente el alcance largo era el misil (Sea Dart), no una bomba vertical — ver
`PREGUNTAS_HISTORICAS.md` «¿El barco te veía venir?». **Se dejan las bombas verticales**: ya
existen y se leen mejor en pantalla. La prioridad es el juego.

### 0.2 El ataque al buque: se mantiene EL PULSO

**Se mantiene la combinación de teclas** (cabina, tiempo a `SLOW 0.08`, 2–4 compases de
piruetas + `Z`, tres intentos, cinemática de premio) como el verbo del ataque. Lo que cambia es
que **las dos situaciones lo alimentan**:

| llegaste… | el PULSO es… | con qué se hace |
|---|---|---|
| **sin que te vean** | lento, perdona un error, habilita la zona brava (depósito) | `flak = 0` → `FLAK_T[0] = 1`, `errFor` con perdón, las tres zonas abiertas |
| **pintado** | ritmo más rápido, flak más cerca, menos intentos, zona brava cerrada | `flak = 1..2` → `FLAK_T[1..2]` (0.92 / 0.85), `TRIES` bajado por data, `PULSO_ZONAS` filtradas |

**Por qué:** el PULSO ya está construido y probado (Q0–Q5). Lo que le faltaba era una razón
para existir dentro de la misión, y las dos situaciones se la dan: **la ida bien volada te compra
un ataque fácil; la ida mal volada te lo hace difícil.** Recién con ese contexto se sabe si lo
que molesta es el corte a la cabina o que el corte no significaba nada.

Dos ajustes para que el corte duela menos, los dos baratos:

1. **La escalera arranca en el pasillo, antes del PULSO** (si te vieron): el PULSO se siente como
   el remate de algo que ya venía, no como un cambio de juego.
2. **Sin pantalla de resultados después del PULSO**: fade corto y ya estás en la vuelta. Es lo
   que hace hoy `t15`; la campaña lo hereda cuando tenga `fases:`.

### 0.3 Qué se construye para probarlo *(chico)*

- Una bandera de corrida **"pintado"** (sale del radar / `pinta:` de fase / estrellas) que
  `pulso.setCfg()` lea como `flak` y como filtro de zonas y de intentos. Data + una lectura.
- Las fases de `t15` con `bombs`, `obstacles` y AA de la escalera **condicionados a la
  bandera** (una fase declara dos cfg: visto / no visto, o la bandera multiplica).
- Nada más. Sin sacar nada de cuarentena, sin bomba en el pasillo todavía.

### 0.4 El gate

Se juega `t15` de las dos formas (llegar limpio y llegar pintado). **Si el corte a la cabina
sigue molestando aun con contexto, se construye A1 (la altura justa en el pasillo)** — es la
pieza de §5 que destraba el resto del listado. Si no molesta, el PULSO queda y el listado sigue
sirviendo como capas de presión (familia C) y decisión (familia D) encima del PULSO.

---

## 1 · LO QUE HAY HOY *(relevado el 14/9/2026)*

### 1.1 La llegada, hoy

| pieza | estado | dónde |
|---|---|---|
| **EL PULSO** | ✅ implementado entero (Q0–Q5). Cabina, mundo a `SLOW 0.08`, tres zonas del buque = tres secuencias (radar / puente / depósito), 2–4 compases de 3 tokens tomados de los combos de piruetas + remate `Z`, tres intentos (re-encare → cuesta un avión → muerte), premio como timeline de `data/cines.js` | `systems/pulso.js`, `core/pulso.js`, `data/pulso.js`, `render/pulso.js` · `npm run pulso` |
| **PASADA** | ⏸️ en cuarentena (18/8). Entera y compilando: bandas de suelta (`BAND_ARM_MIN 20` / `BAND_SWEET_MAX 55`), ristra de 2, sapito (`SAPITO_ALT_M 12`), defensa por capas, re-encare con nafta | `systems/pasada.js` · `?pasada=<n>` · `npm run pasada` |
| **ARENA** | ⏸️ en cuarentena. Vuelo 3D libre, ring, zonas | `systems/arena.js` · `?arena` |
| **Cómo se llega al PULSO** | por **suplente**: ninguna misión escribe `climax: 'pulso'`; `data/cuarentena.js` sustituye `arena`/`pasada` por `pulso` | `data/missions.js:343` `climaxOf()` |
| **IDA y VUELTA** | ✅ la estructura existe (`fases:` con `hasta > 1`, `hayVuelta()`, aterrizaje) pero **solo `t15` la usa**. Ninguna misión de campaña tiene `fases:` | `core/fases.js`, `systems/fases.js`, `data/pruebas_misiones.js:123` |
| **El embudo** | `finishObjective()` → si hay vuelta y no se hizo el clímax → `volverDelBlanco()` (cobra el premio, fade 0.55 s, vuelve a `play`) | `game.js:2385`, `:2474` |

**La forma de `t15` hoy** (12 fases): `transito → filo → transito(chancha) → descenso → rasante ×2
→ filo(radar 6) → blanco → vuelta ×4 (cazas, chancha, casa)`. Ida sin bombas ni bidones ("una
bomba cayendo significa que te vieron"). Hablan: Puma hasta el descenso, solo Cóndor hasta el
blanco, Puma vuelve en la vuelta.

### 1.2 Lo que ya existe y sirve para armar una llegada *(sin escribir sistemas nuevos)*

| sistema | qué da | dónde |
|---|---|---|
| **Fases** | parchean `cfg` por tramo: `radar`, `obstacles`, `caza`, `solo`, `radio`, `pausa`, `chancha`… | `core/fases.js:27` |
| **EL FILO / la rendija** | `RADAR_ALT` resuelto por fase (`radar: 6`): la banda entre el agua y el radar se estrangula. Ya es la mecánica de la ida | `tuning.js:78-92`, `flight.js:387` |
| **El piso** | tocar el agua no mata al instante: `SCRAPE_*` (0,85 s → 0,18 s según velocidad), `OLA_SCRAPE_FRAC` | `tuning.js:665` |
| **Racha rasante** | x10 → x30 sosteniendo la banda baja; `CAZA_RAS_ALT = BANDA_ALT` (abajo el Harrier casi no apunta) | `tuning.js:793` |
| **MOMENTUM (tecla 4)** | bullet-time del jugador, se carga con puntos (`TEMPO_CHARGE 650`) | `systems/tempo.js` |
| **Piruetas** | 13 maniobras con combos de teclas; gate por libreta del Pichón. Son el vocabulario del PULSO | `data/moves.js`, `systems/moves.js` |
| **LA COLA** | Harrier atrás: aviso → presión → sobrepaso → ventana. Solo en `play` | `systems/caza.js` |
| **PERSECUCIÓN / la banda** | mantener distancia a un líder que nunca muere | `systems/persec.js` |
| **TEATRO AÉREO + Fieles** | actores del escuadrón que pelean sin poder tocarte; relevo | `systems/teatro.js`, `wingmv.js`, `squad.js` |
| **Cañón con calor** | `GUN_HEAT_*`; blancos aéreos con auto-apuntado vertical | `systems/flight.js:112` |
| **Misil del jugador** | 3 tiros (`MSL_MAX`), solo en `play`, Z/TAB | `game.js:2555` |
| **Destrucción** | despiece, cadenas, chocar mata a los dos (D0–D5) | `core/fx.js`, `data/despiece.js` |
| **Re-encare** | `REATTACK_DUR 2.6`, `REATTACK_FUEL 12`, `REATTACK_MAX 6` | `tuning.js:363` |
| **Chancha** | recarga de nafta como cita en altura (`CH_ALT 48`) | `systems/chancha.js` |
| **radioVN** | una línea de radio por fase, con `pausa: true` congela hasta aceptar | `core/radioVN.js` |
| **EL DIRECTOR** | timelines de cinemática como data (C0); primer cliente: el premio del PULSO | `systems/cine.js`, `data/cines.js` |
| **Zigzag / barreras** | laderas, puntas, barreras de lado a lado (m5 ya lo vuela) | `PLAN_PASILLO_ZIGZAG.md` |
| **Bombas del jugador** | **solo dentro de PASADA** (`release()`, bandas, ristra, sapito) y como dibujo en el premio del PULSO. **No hay arma de bomba en el pasillo** | `pasada.js:366` |

> **El hueco más grande para cualquier llegada "en vuelo":** el pasillo no tiene bomba. Todo lo
> que en §3 dice "soltar" necesita **sacar la suelta de la PASADA** (balística + bandas + sapito,
> ~200 líneas de `pasada.js`) y ponerla al alcance de `play`. Es UNA pieza, se paga una vez, y
> la usan la mitad de las opciones.

---

## 2 · LAS RESTRICCIONES QUE ORDENAN EL LISTADO

1. **La vuelta es el clímax real.** Si la ida es fantasma y la vuelta es la guerra, la llegada
   **no puede ser un boss largo**: es una bisagra de **10 a 40 segundos**. Un modo de tres minutos
   ahí (ARENA, PASADA) rompe la curva — y es exactamente lo que el playtest rechazó.
2. **Lo que se juega en la llegada debería ser lo que el pasillo enseñó.** Altura, carril,
   piruetas, cañón. Nada de un minijuego con vocabulario propio (regla 1 del PULSO, y sigue
   valiendo para cualquier reemplazo).
3. **Sin cambio de estado si se puede evitar.** Cada opción marca si corre **dentro de `play`**
   (el pasillo sigue, la ida se funde en la vuelta sin fade) o si es **un estado aparte** (como
   el PULSO). Las de `play` son más baratas y conservan la continuidad ida→vuelta.
4. **El feel es sagrado** (`npm run feel` idéntico) y **la cámara 2D es fija** (`CAM_ZOOMS = [1]`).
   Nada de cámaras nuevas en el pasillo.
5. **Sin lock-on, sin RWR.** La puntería es con el mundo: alinear, altura, momento.
6. **Lo histórico ya está cargado:** el ataque real duraba segundos; una sola pasada; la bomba
   no armaba si se soltaba bajo (`PREGUNTAS_HISTORICAS.md:409,713`); el rebote del Broadsword
   (`:413`); Sea Cat esquivable (`:416`). Todo lo de §3 cabe en esos hechos.
7. **La misión final es la excepción a todo** (`MISION_FINAL.md`): allí la llegada es el momento
   del misil (un botón, imposible errar) y después la decisión. No entra en este listado.

---

## 3 · EL LISTADO

Formato: **qué hace el jugador · qué se reusa · estado/costo · riesgo · dónde encaja**.
Costo: **B** = data + perillas, **M** = un sistema chico o sacar algo de cuarentena, **A** = sistema nuevo.

### FAMILIA A · La altura decide *(la suelta es volar, no teclear)* — dentro de `play`

**A1 · LA BANDA DE SUELTA** *(la candidata natural al reemplazo)*
- **Jugador:** el buque entra como objeto del pasillo, de costado, ocupando el carril. En los
  últimos ~300 m el HUD muestra la banda de altura (**dormida / dulce / te ven**) y **la bomba
  sale sola al cruzar la proa** (o con `Z`). La altura EN ESE INSTANTE decide: bajo → "NO
  DESPERTÓ" (golpe sin explosión, misión sigue), dulce → explota, alto → explota pero te pintan
  y la vuelta arranca con la CAP ya encima.
- **Reusa:** bandas `BAND_ARM_MIN/SWEET_MAX` y balística de la PASADA, popup "NO DESPERTÓ" (existe),
  `radar:` de fase para el techo, `pinta:` para el castigo, `SCRAPE` para el piso.
- **Costo M:** sacar `release()` + bandas de la PASADA al pasillo. Sin estado nuevo.
- **Riesgo:** que se sienta a "cruzar un obstáculo más". Se cura con el teatro (columnas de agua
  de la AA, trazadoras, la radio de Cóndor contando la altura).
- **Encaja:** todas las misiones con buque. **M6** la enseña (la bomba dormida es el título).

**A2 · EL FILO HASTA LA PROA** *(estrangular la rendija hasta cero)*
- **Jugador:** la última fase `filo` baja el techo de radar por tramo (`radar: 6 → 4 → 3`) hasta
  que la banda volable es apenas el avión. Sostenerla hasta el buque = llegaste sin que te vean
  y la suelta es automática y limpia. Salirte = te pintan y la llegada se juega "vista" (más
  flak, o `pinta: 'muerte'`).
- **Reusa:** todo. Es `PLAN_MISION_CINCO_FASES` §11.1 llevado al final. **Costo B.**
- **Riesgo:** ya está medido en el playtest de `t15`: "difícil, tedioso y largo" si dura mucho.
  Tiene que ser **corto (8–12 s)** y anunciado por radio.
- **Encaja:** como **preámbulo de cualquier otra opción** (A1, C1, D1). Solo, para **M3** (la más
  liviana) o **M11** (el respiro tenso: la tensión la trae el jugador).

**A3 · EL RASANTE FINAL** *(el x30 es la espoleta)*
- **Jugador:** los últimos N metros la bomba arma **solo si llegás con la racha en x20 o más**.
  La mecánica que el juego ya paga es la que abre el blanco. Sin nada nuevo en pantalla: el
  multiplicador ya está en el HUD.
- **Reusa:** `rasLevel`, la racha, `BANDA_ALT`. **Costo B.**
- **Riesgo:** contradice la historia (bajo = no arma). Vale para modo `ARCADE`
  (`PLAN_MODOS_ARCADE_REAL.md`), no para `1982`.
- **Encaja:** CICLO / JUEGO RÁPIDO, y M1–M3 en campaña (antes de que el juego enseñe la espoleta).

**A4 · EL SALTO (pop-up)**
- **Jugador:** hay que **subir en el momento justo**: un pop-up de pirueta (`POP-UP` ya está en
  `moves.js`) a X metros del buque te pone en la banda dulce por 1–2 s y suelta. Antes = te ven
  de lejos; después = la bomba llega dormida. Es el gesto real del ataque (tirar arriba, soltar,
  quebrar).
- **Reusa:** la maniobra existente, bandas de A1. **Costo M** (misma pieza que A1 + una ventana).
- **Riesgo:** es un timing de UNA tecla: si no tiene lectura (la proa creciendo, el silbido, el
  cartel de Cóndor "¡ahora!") es QTE de nuevo.
- **Encaja:** **M4** (primer buque de verdad: "primera suelta que importa").

**A5 · EL SAPITO** *(el rebote del Broadsword)*
- **Jugador:** soltar **muy bajo y a propósito** (`SAPITO_ALT_M 12`) para que la bomba pique en el
  agua y rebote contra el casco. Solo vale si el buque está **de costado**. Bonus de estilo.
- **Reusa:** `SKIP_V`, `SAPITO_PTS` de la PASADA. **Costo B** una vez que exista A1.
- **Riesgo:** es un easter egg, no una mecánica principal. Bien.
- **Encaja:** **M13** (el buque del sapito real), y como secreto en todas.

### FAMILIA B · Puntería con el mundo *(sin lock-on)* — dentro de `play`

**B1 · EL CARRIL DE LA ESLORA**
- **Jugador:** el buque viene de costado y **hay que cruzarlo por el tercio correcto** (proa /
  centro / popa = tres carriles del pasillo = tres zonas: radar / puente / depósito, como en el
  PULSO). El carril que ocupás al cruzar es la zona que pegás. Más difícil el carril, más puntos
  y otra cinemática.
- **Reusa:** `PULSO_ZONAS` (nombres, puntos, sellos), el premio como timeline. **Costo B–M.**
- **Riesgo:** con el buque de costado, "carril" es una franja de eslora que hay que dibujar
  claro (marcas en el casco, humo de la AA en la zona).
- **Encaja:** combina con A1 (altura × carril = la suelta completa en dos ejes que el pasillo ya
  usa). Todas.

**B2 · CALLAR LA AA ANTES DE LA SUELTA**
- **Jugador:** en los últimos 200 m la AA del buque **tira de verdad** (mangueras de trazadoras
  como obstáculos de carril, ya horneadas para la PASADA). El cañón con calor las **apaga** si le
  pegás al montaje; si no, cruzás entre mangueras. No es obligatorio: es la diferencia entre
  llegar entero o tocado a la vuelta.
- **Reusa:** cañón, `GUN_HEAT`, trazadoras de `pasada.js`, averías (`SPEC_AVERIAS`). **Costo M.**
- **Riesgo:** el cañón contra un buque "grande" puede sentirse inútil; el blanco tiene que ser
  el montaje, chico y con chispas.
- **Encaja:** **M5** (San Carlos: el callejón ya tiene AA en las laderas), **M9** (el infierno).

**B3 · LA SOMBRA DE LA BOMBA (plomo)**
- **Jugador:** el buque **se mueve** lateral (maniobra evasiva); la suelta muestra **la sombra de
  la bomba** en el agua (ya anotada en `SPEC_MODO_PASADA` P5) y hay que soltar **adelante**. Es
  la mecánica del lead sin mira.
- **Reusa:** balística de la PASADA + una sombra. **Costo M.**
- **Riesgo:** en 2D fijo un buque que se mueve lateral es raro de leer; mejor que se mueva
  **poco y anunciado** (estela curva).
- **Encaja:** M7, M8 (buques grandes).

### FAMILIA C · La presión durante la llegada *(lo que hace que duela)* — dentro de `play`

**C1 · LA COLA EN LA LLEGADA**
- **Jugador:** un Harrier se te cuelga **justo antes del buque** (LA COLA ya lo hace en `play`).
  Hay que **sacártelo con la pirueta y soltar en la ventana**: la maniobra que lo hace sobrepasar
  es la misma que te deja en banda. Dos problemas, un gesto.
- **Reusa:** `caza.js` entero (`cfg.caza` por fase). **Costo B.**
- **Riesgo:** si el sobrepaso coincide con la suelta, la lectura es mucha. Mejor un solo Harrier.
- **Encaja:** **M7** (la salida es de ellos), M9, M13.

**C2 · LAS COLUMNAS DEL PRIMERO**
- **Jugador:** llegás **segundo**: el Fiel que va adelante suelta antes que vos y sus columnas de
  agua y humo son **obstáculos** en tu línea (la propuesta A de PASADA, `PROPUESTAS_PASADA` §8b).
  Esquivar columnas y llegar en banda.
- **Reusa:** actores del TEATRO AÉREO, `olaBump`/columnas del agua (`SPEC_AGUA_OLAS`). **Costo M.**
- **Riesgo:** la regla del amigo (no matar Fieles fuera de guion) obliga a que el primero siempre
  pase. Está bien: su suelta es teatro.
- **Encaja:** misiones con `squad ≥ 3`: M7, M8, M11.

**C3 · EL SEA CAT VISIBLE**
- **Jugador:** el buque tira **un** misil lento y guiado a mano (Sea Cat, histórico) que se ve
  venir con soga de humo. Se esquiva con **una pirueta** (tonel/jink) o con altura; no se
  esquiva con velocidad. Es la única muerte por misil de la llegada.
- **Reusa:** el Sea Cat de `pasada.js` (ya con soga de humo, R1), esquive por pirueta. **Costo M.**
- **Riesgo:** es lo que mataba "sin verlo" en la PASADA (`PASADA_ADRENALINA`). Acá se corrige por
  cantidad (uno), lectura (soga, radio "¡Sea Cat, quebrá!") y velocidad (lento).
- **Encaja:** M12, M13 (buques con Sea Cat).

**C4 · EL BUQUE COMO BARRERA**
- **Jugador:** el buque cruza el pasillo **de lado a lado** como las barreras del zigzag (ya
  construidas: roca, puente, tendido). Se pasa **por arriba** (te ven, `radar`), **por el hueco**
  (entre el mástil y el puente, banda angosta) o **no se pasa**. La suelta es al cruzar.
- **Reusa:** `paredes.barreras` (cuatro pieles sobre un objeto: la quinta es el casco). **Costo B–M.**
- **Riesgo:** un buque de lado a lado es enorme en 2D; funciona para el buque grande de
  M8 (Conveyor) o M11 (Galahad), no para una fragata.
- **Encaja:** M8, M11.

### FAMILIA D · Decisión y riesgo *(no destreza)* — dentro de `play`

**D1 · ¿UNA AHORA O DOS EN LA VUELTA?**
- **Jugador:** al cruzar podés **soltar una** (segura, puntos base) o **pasar de largo y
  re-encarar** (`REATTACK_FUEL 12`, `REATTACK_MAX`) para soltar **la ristra de dos** con el buque
  ya alertado. La nafta de la vuelta es el precio. Elegir es volar: si no soltás, girás.
- **Reusa:** re-encare (existe), ristra de la PASADA. **Costo M.**
- **Riesgo:** el re-encare en 2D es un fade + volver a entrar; ya está resuelto en `REATTACK_DUR`.
- **Encaja:** M13 ("hoy la nafta se cuida"), M4.

**D2 · LA ZONA COMO ELECCIÓN DE RADIO**
- **Jugador:** antes de ver el buque, Cóndor **ofrece dos blancos** por radio (línea con
  `pausa: true` que ya existe): "radar, seguro" o "depósito, brava". Elegís por tecla y la fase
  siguiente se arma distinto (más AA, otra banda, otra cinemática). La decisión es antes; la
  ejecución es cualquiera de A/B/C.
- **Reusa:** `radioVN` con pausa, `PULSO_ZONAS`, fases. **Costo B.**
- **Riesgo:** ninguna mecánica nueva; el riesgo es que la diferencia no se sienta. Se cura con
  data (AA ×2 en la brava).
- **Encaja:** todas; barata para variar sin código.

**D3 · SOLTAR O NO** *(narrativo)*
- **Jugador:** en una misión, al cruzar, **no hay que soltar**: el blanco no es el que dijeron
  (reconocimiento, M10) o hay tropa propia abajo (M13). Soltar es error. La tensión es aguantar
  la mano.
- **Reusa:** nada nuevo. **Costo B.** Solo vale una vez.
- **Encaja:** M10 (sin boss, se gana volviendo).

### FAMILIA E · El tiempo como recurso — dentro de `play`

**E1 · LA LLEGADA CON MOMENTUM DEL JUGADOR**
- **Jugador:** la llegada **no tiene tiempo lento propio**; el jugador **elige** gastar su barra
  de MOMENTUM (tecla 4) en el cruce. Si la trae llena, la suelta es en cámara lenta; si la
  gastó en el pasillo, la suelta es a velocidad real. La tachypsychia es un recurso, no un regalo.
- **Reusa:** `tempo.js` tal cual. **Costo B** (hoy se apaga al salir de `play`: si la llegada es
  en `play`, ya funciona).
- **Riesgo:** ninguno. Es la opción más barata del listado y se combina con todas.
- **Encaja:** todas.

**E2 · EL TONEL ABRE LA VENTANA**
- **Jugador:** hacer **una pirueta al cruzar** (tonel sobre la proa) alarga la ventana de suelta
  y suma sello de estilo. Es el "rozar en pirueta" (+250) llevado al buque.
- **Reusa:** `rollGraze`, moves. **Costo B.**
- **Encaja:** todas, como bonus.

### FAMILIA F · El PULSO, pero distinto *(mantener el estado aparte y cambiar la prueba)*

Para si se decide **no** salir del formato "estado propio con cabina". Cada una cambia una sola
regla del PULSO actual.

| # | variante | qué cambia | costo |
|---|---|---|---|
| **F1 · UN SOLO COMPÁS** | la secuencia se reduce a **un token en el momento exacto** (la autopista muestra la proa creciendo; `Z` cuando cruza la marca). Timing, no memoria | B (data: `BARS [1,1]`) |
| **F2 · EL SOSTÉN** | en vez de teclear, **mantener una tecla** (↓ picar) y **soltarla dentro de la banda** que sube por pantalla. Es A1 dentro de la cabina | M |
| **F3 · EL COMBO VIVO** | la secuencia son piruetas **de verdad en el pasillo** (el avión las vuela mientras las tecleás, `moves.js`), sin cabina ni tiempo congelado; el buque llega al terminar | M–A |
| **F4 · EL PULSO MUDO** | sin autopista: la secuencia es **la que enseñó el briefing** (memoria), una sola vez por misión, y la cabina muestra solo la proa. La versión "1982" | B |
| **F5 · EL PULSO DE DOS** | el Fiel teclea la primera mitad (teatro: se ve su avión hacer la pirueta) y vos rematás. El relevo dentro del clímax | M |

**Riesgo común:** todas siguen siendo "cortar el vuelo para un examen". Si la queja es esa,
ninguna F la cura; si la queja es la secuencia, F1/F2 la curan barato.

### FAMILIA G · Especiales de una misión *(no se repiten)*

| misión | la llegada | reusa |
|---|---|---|
| **M6** | la bomba dormida es obligatoria la primera vez (hacés todo bien y no explota): A1 con la banda dulce **cerrada** por data | A1 |
| **M8** | después del buque, el **sobrevuelo del monte**: tierra, casquitos abajo, **batir las alas** (doble toque de rolar a baja altura) y la escena responde | tierra, soldados decor, moves |
| **M9** | no hay buque: un **depósito mayor** con dos AA custodias (DISENO_MISIONES propuesta B); volarlo cierra | prop `depot` escalado + cadenas de destrucción |
| **M10** | **no hay llegada**: reconocimiento, se gana volviendo (D3) | fases |
| **M14** | el momento del misil (un botón) + la decisión sin menú | `MISION_FINAL.md` — fuera de este listado |

---

## 4 · CÓMO COMBINAN *(la llegada como dato, igual que el clímax)*

Nada de esto obliga a elegir una. La forma barata es que la misión declare **la llegada como
capas**, como hoy declara `climax:` y `fases:`:

```
llegada: {
  base:   'banda',          // A1 · o 'salto' (A4) · 'filo' (A2) · 'pulso' (F) · 'racha' (A3)
  carril: true,             // B1 · tres zonas por carril de eslora
  presion: ['cola'],        // C1 · o 'columnas' (C2), 'seacat' (C3), 'aa' (B2)
  decision: 'zona',         // D2 · o 'reencare' (D1), 'no_soltar' (D3)
  momentum: true,           // E1 · se puede gastar la barra en el cruce
  sapito: true,             // A5 · easter egg
}
```

Sin `llegada:` → como hoy (`climax` suplente). Así la campaña **varía sin código nuevo por
misión**: M4 = banda + salto; M5 = banda + aa; M6 = banda dormida; M7 = banda + cola +
columnas; M13 = banda + reencare + sapito + seacat. Y EL PULSO queda como **una** base más, no
como el único clímax.

---

## 5 · LO QUE HABRÍA QUE CONSTRUIR *(una vez, para casi todo)*

| pieza | la usan | costo |
|---|---|---|
| **La suelta en el pasillo** (balística + bandas + "NO DESPERTÓ" + sapito, sacadas de `pasada.js`) | A1, A4, A5, B1, B3, D1, G-M6 | M — la pieza que destraba todo |
| **El buque como objeto del pasillo con zonas** (de costado, carriles de eslora, AA que tira) | A1, B1, B2, C4 | M — hoy el buque de la aproximación es un dibujo sin colisión |
| **`llegada:` como dato + su lectura en `fases`/`spawn`** | todas | B |
| **La presión por fase** (`caza`, Sea Cat, columnas) | C1–C3 | B (C1) / M (C2, C3) |
| **El premio como timeline por llegada** (ya hay `pulso_premio`) | todas | B — EL DIRECTOR ya existe |

**Lo que NO hace falta:** sacar ARENA de cuarentena, 3D, cámaras nuevas, un sistema de armas.

---

## 6 · ORDEN DE PRUEBA *(reemplazado por la decisión de §0 — se conserva como plan B)*

Este era el orden antes de la decisión provisoria. Sigue valiendo **si el gate de §0.4 falla**:

1. **E1** (MOMENTUM en la llegada) + **D2** (la zona por radio): cero código, se ensaya en `t15`
   con `pausa: true` que ya existe. Mide si "decidir antes" y "elegir cuándo va lento" alcanzan.
2. **A1** (la banda de suelta) en `t15`: la pieza cara pero la que reemplaza al PULSO **sin
   cortar el vuelo**. Si la banda sola ya se siente como llegada, el resto es capas.
3. **C1** (LA COLA justo antes) sobre A1: un solo Harrier. Si la suelta bajo presión funciona,
   la vuelta arranca sola ("ya te vieron").
4. Recién ahí decidir si el PULSO queda como base alternativa (F) o solo como el momento del
   misil de M14.

**El criterio (el mismo del ultimátum de la PASADA):** si la llegada en `play` no se siente
mejor que el PULSO en dos playtests de `t15`, el PULSO se queda y el listado se archiva.

---

## 7 · CÓMO PROBAR HOY LO QUE HAY *(sin consola, desde el menú PRUEBAS)*

`npm start` (arma el bundle y abre Electron) → MENÚ → fila **PRUEBAS** (entre JUEGO RÁPIDO y
OPCIONES). Flechas + Enter; ESC vuelve al catálogo. No toca récords ni saves. El sonido está
bloqueado (`AUDIO_BLOQUEADO`): se juega mudo.

| fila de PRUEBAS | qué mide para este doc |
|---|---|
| **IDA Y VUELTA** (~6 min) | la forma entera: ida fantasma con el FILO, descenso, rasante mudo, EL PULSO en el blanco, la vuelta con la guerra. Mirar: ¿la ida respira o aburre? ¿el corte a la cabina molesta? ¿la vuelta es clímax o epílogo? |
| **LA PASADA SIN CORTE** | lo más parecido a **A1 · la altura justa**: el pasillo desemboca en la corrida, `Z` suelta. Soltar bajo 20 m → "NO DESPERTÓ"; 20–55 m → explota; más arriba → explota y te exponés. Probar las tres alturas a propósito |
| **EL PULSO** | la combinación de teclas sola, con su cinemática, para compararlo fresco |
| **LA PASADA** | la versión con corte: por qué se rechazó (teletransporte de proa, zona propia, re-encares) |
| **EL CALLEJÓN DE LAS BOMBAS** | los AA disparando desde las laderas: el **alcance medio** de la escalera funcionando |
| **LA COLA · EL AVISO / EL SOBREPASO / LA VENTANA** | el Harrier atrás en sus tres momentos: la presión de **C1** |
| **EL MOMENTUM CARGADO** | tecla `4`: la cámara lenta propia de **E1** |
| **EL ARENA** | el clímax 3D anterior, en cuarentena |

**Lo que NO se puede probar todavía porque no existe:** A1 dentro del pasillo con el buque de
costado, y el PULSO que cambia según te vieron o no (§0.3). Son las dos piezas que siguen.

Por sonda (dev): `?pulso=<n>[&pasillo]`, `?pasada=<n>[&pasillo]`, `?arena`, `?caza`,
`?mision=t15`. Fixtures: `npm run pulso`, `npm run pasada`, `npm run fases`, `npm run misiones`.

---

## 8 · LA SUELTA — el prototipo de A1 + B1 + B3 en el pasillo *(23/9/2026)*

> Pedido del autor: *"armemos un modo cortito de pasada que llegue al final del objetivo y permita
> lanzar la bomba y embocarla"* — **directamente en el pasillo**, sin 3D ni cambio de mapa. Si la
> mecánica funciona, puede reemplazar al PULSO. Se prueba desde **PRUEBAS → LA SUELTA** (misión `t16`).

**Lo que destrabó la pieza que §5 marcaba como "la que destraba todo":** desde el 20/9 el pasillo
tiene bomba (tiro oblicuo, `BOMBA_*` en `data/tuning.js`). Faltaba el buque como objeto del mundo.

| pieza | qué hace | dónde |
|---|---|---|
| **El buque en el mundo** | viene a `run.spd` como cualquier obstáculo, dibujado con la misma hoja horneada que la aproximación. Asoma a **3,5 km** (25–60 s de margen) con la vista comprimida (`zVista`: de lejos más grande que la perspectiva real, exacta en los últimos 200) y perspectiva aérea (más claro de lejos). Sin el telón de bruma del final del pasillo, que lo tapaba | `core/blanco.js`, `render/blanco.js` |
| **El perfil del casco** | alturas medidas de la hoja (20 franjas): la bomba pega donde se ve casco. Eslora 60 sobre un pasillo de ±38: deja ~8 de paso por proa y por popa | `data/blanco.js` `PERFIL`, `BL.LEN` |
| **La espoleta** (A1 sin bandas) | la bomba arma a los `ARMA_T 0.8 s` de vuelo. Al ras no llega nunca → **NO DESPERTÓ**; a 10 m hay ~1 s de ventana; más arriba se abre, pero el radar está en 20 | `BL.ARMA_T` |
| **El veredicto** | cada bomba dice qué pasó: CORTA · LARGA · NO DESPERTÓ · AVERIADO · ¡HUNDIDO! | `systems/blanco.js` `golpe()`/`corta()` |
| **El blanco claro** (B1) | "▼ BLANCO" sobre el buque desde que asoma, y corchetes sobre la zona de máquinas (±17 % de la eslora) en los últimos 700 m. La mira del cañón se apaga mientras el buque está a la vista: caía justo encima y lo tapaba. Armada en máquinas lo hunde sola; en los extremos hacen falta dos | `BL.CENTRO`, `DANO_*` |
| **La salida** | se le pasa **por encima** al buque, como en Malvinas (ver `PREGUNTAS_HISTORICAS.md`): no hay choque, y el cruce **corta a negro** — fin del ataque. Hundido → la vuelta (o el recuento si la misión no tiene). Sin hundir → otra pasada detrás del negro | `step()` |
| **El HUD** | sin textos propios (23/9: se fue la línea de distancia/bombas/pasada y la luz SOLTÁ). Queda la marca ▼ BLANCO y los corchetes; la altura de soltar va en verde en el altímetro (borde verde fijo adentro de la banda). **Cuando es el momento de soltar, TITILA EN VERDE con un solo latido:** el borde de la cinta de objetivo y su avioncito, el borde del altímetro y las bombas del estante | `render/blanco.js`, `render/hud.js` |
| **La bomba del buque** | en estas misiones todo avión lleva la bomba del **centro** (`conBombaCentral`, `data/cargas.js`): el ala se respeta —2 bombas, 2 tanques o nada— y el centro se fuerza. La del centro está **bloqueada** hasta que el buque está a tiro; ahí sale primero. El estante la muestra aparte (marco rojo, gris si bloqueada) y el ala con su ícono (bomba o **tanque**, ícono nuevo). Cada re-encare es el avión siguiente, con su carga entera. PRUEBAS tiene las dos: LA SUELTA (2 tanques) y LA SUELTA · 3 BOMBAS | `systems/blanco.js` `tomarBomba()` |
| **Ganar / perder** | hundido → recuento. Pasar de largo → re-encare (2 bombas nuevas, el daño queda). A la 3.ª pasada fallida se pierde | `BL.PASADAS`, `REENCARE_M` |
| **Puma canta la suelta** | por radio, una seña por momento: asoma el blanco · alineate · subí · esperá · ¡SOLTÁ! · ¡por encima de los palos! · y el veredicto (corta, larga, no despertó, tocado, ¡le diste!). Bancos `AV_T16_*` de `data/story.js`, enchufados por `avisos` de la misión — la M2 los heredaría tal cual | `señas()` en `systems/blanco.js` |
| **El final filmado** | una bomba ARMADA que revienta en el casco dispara el **MOMENTUM OBLIGADO**: el mundo a 1/3 (con el marco del MOMENTUM) hasta el cruce, el avión trepa solo, el cuadro se funde a negro y el negro se **sostiene 2,4 s con Puma encima** (la radio va sobre el negro). Recién después: recuento, vuelta u otra pasada. Durante todo eso el avión tiene piso: no se puede ir al agua sin ver | `BL.LENTO`, `TREPA`, `FUNDIDO_T`, `NEGRO_T`, `SALIDA_T` |

**Cómo se lo enchufa a una misión real:** `climax: 'suelta'` en su renglón. El climax sigue siendo dato.

**Lo que el primer vuelo mostró y queda abierto:**
1. **Tu avión tapa el blanco.** Para embocarla hay que estar alineado, y alineado es "detrás de tu
   sprite". Se resolvió con la marca en la capa de cabina, sin la mira del cañón encima, y con el
   casco aclarado de lejos. Sigue siendo una lonja fina en el horizonte hasta los ~500 m.
2. ~~**El remate es chico.**~~ Resuelto con el final filmado (cámara lenta x3 + trepada + negro
   con Puma). **El buque NO se hunde en cuadro** (decisión del autor, 23/9): empieza a prenderse
   fuego —los focos se propagan por la cubierta—, corren marineros y suena la alarma (`alarm` de
   `data/sfx.js`, desde el primer impacto armado).
3. **La luz SOLTÁ es una ayuda de prueba.** Con ella el modo es "esperar el verde"; sin ella es
   calcular a ojo. Decidir cuál es el juego (o que el verde solo exista en las primeras misiones).
4. **Sin defensa.** El buque no dispara: faltan la AA y la escalera de §0.1 para que acercarse cueste.
