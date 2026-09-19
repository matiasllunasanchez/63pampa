# CINEMÁTICAS DE FIN DE NIVEL — catálogo y guiones

> **Qué resuelve.** Hoy hay dos timelines de remate (`pulso_premio` y `pulso_fallo`) escritas
> contra un buque. Faltan las variantes: los niveles sin barcaza, los blancos de tierra, y los
> momentos que el guion pide una sola vez.
>
> **La decisión de fondo está en §3 y cambia el alcance del trabajo:** no se escribe una
> cinemática por avión × por enemigo. Se escriben **dos ranuras** y se combinan.

---

## 1 · DÓNDE ESTÁN LOS PROMPTS DEL TRAILER

Están repartidos en cuatro archivos de `docs/produccion/`, y cada uno tiene un rol distinto:

| Archivo | Qué es |
|---|---|
| **`TEASER.md`** | 🟢 **El plan de rodaje completo del teaser principal** (~45 s, el del cuaderno y el sapito). **Autocontenido**: todos los prompts van enteros, sin tokens, listos para pegar. Presupuesto cerrado: 620 créditos, 10 generaciones, todo en Kling 3.0 Turbo |
| **`TEASER_2_LA_ESCUCHA.md`** | 🟢 **El segundo teaser**, el del marinero británico y el orden en que llegaba el ruido. Trae además la investigación histórica que lo respalda. Se publica **antes** que el otro |
| **`PLAN_CINEMATICAS.md`** | La decisión de arriba: qué momentos del juego se llevan video y cuáles van con imagen fija. Presupuesto y criterio. **No tiene prompts** |
| **`TEST_KLING_CINEMATICAS.md`** | El protocolo de prueba: si Kling sirve o no, y con qué límites. Trae prompts, pero son **de test**, no de trailer |
| `produccion/teaser_imgs/` | Los frames A/B ya generados: `P1A/P1B`, `P3A/P3B`, `P4A/P4B`, `P5A/P5B` |

**Si vas a rodar el trailer nuevo: abrí `TEASER.md` y no necesitás nada más.** Ese es el único
que se declara autocontenido.

---

## 2 · LO QUE YA EXISTE — y es más de lo que parece

El director de cinemáticas **ya está construido** (`src/data/cines.js` + `systems/cine.js` +
`render/cine.js`), con su vocabulario de verbos y su regla de oro escrita:

> *"Si una escena no se puede escribir acá, falta un verbo — se agrega el verbo, no la
> excepción."*

**Timelines ya declaradas:** `pulso_premio` (la pirueta, la suelta, el impacto, la muerte del
buque, la santabárbara, el resplandor blanco) · `pulso_fallo` (te pasaste de largo, el buque
entero abajo, el flak, el fundido a negro) · `maniobra` · `teatro`.

**Y el remate ya tiene variación interna**, por la zona que elegiste pegarle: `radar` →
*SE QUEDÓ CIEGO* · `bridge` → *EL PUENTE ARDE* · `deposit` → *VOLÓ LA SANTABÁRBARA* (ésta es
la "zona brava" y es la única que dispara el segundo estallido).

**Qué falta:** las variantes de **qué murió** cuando no es una fragata, y los tres momentos
que el guion pide una sola vez.

---

## 3 · LA DECISIÓN — dos ranuras, no dos escenas

La propuesta del autor era *"quizá 2 escenas por cinemática: una del avión y otra del enemigo
final"*. **La idea es correcta pero conviene darla vuelta:** en vez de escribir escenas de a
pares, se escriben **dos ranuras** que se combinan solas.

```
CINEMÁTICA DE REMATE  =  [ SALIDA ]  +  [ MUERTE ]
                          el avión      lo que quedó abajo
```

**SALIDA** es siempre la misma maniobra —trepás y te vas— porque es lo que hace un avión que
pasó sobre un blanco, pegue o no pegue. Lo único que cambia es **el gesto del piloto**, que
ya es canon del guion (§9d, *los aviones son personajes*).

**MUERTE** es lo que pasa abajo mientras te alejás, y **eso sí cambia** según qué había.

Con 1 SALIDA × 6 MUERTE se cubren las catorce misiones. Escribir 5 aviones × 6 enemigos serían
**30 timelines para mantener**. Con ranuras son **7**.

> **Y el sistema ya lo soporta.** `pulso_premio` ya liga `$pirueta`, `$boom`, `$secOff`,
> `$muerteDur` y `$tSinPirueta`. Las ranuras son más de lo mismo: ligar `$muerte` en vez de
> tenerla escrita a mano.

---

## 4 · LA RANURA `SALIDA` — una sola, con gesto

Es el tramo que ya existe en `pulso_premio` desde el beat de `'$tPir'`: gas a fondo, trepada,
el avión se va. **No se toca.**

Lo que se le agrega es **un gesto de un segundo**, ligado a quién voló:

| Piloto | Gesto en la salida | De dónde sale |
|---|---|---|
| **TERO** *(default)* | nada. Sale limpio y derecho. **Su marca es no tener marca** | canon |
| GITANO | un **tonel rápido** al salir, festejando | §9d |
| PUMA | corrige y nivela de inmediato: el avión queda **quieto como una mesa** | §9d |
| VASCO | sube más lento, sin apuro | §9d |
| PICHÓN | el avión **tiembla un poco**: siempre tiene algo a medio atornillar | §9d |

```js
// LA SALIDA, con gesto. Va DESPUÉS del beat de trepada que ya existe.
{ t: ['$tPir', 0.35], move: '$gesto', who: 'player' },   // $gesto puede venir vacío: TERO no hace nada
```

> **Regla:** el gesto **nunca** ocurre cuando falló, y **nunca** en M7, M9, M12 ni M13 — las
> misiones donde muere alguien. Ahí todos salen como Tero.

---

## 5 · LA RANURA `MUERTE` — seis variantes

### 5a · `muerte_buque` — la que ya existe
Fragata o destructor. Impacto, incendio, el buque escorando, la santabárbara si pegaste en el
polvorín, y el resplandor blanco que cierra. **Ya está escrita en `pulso_premio`: es el
default.** Misiones: M4, M5, M7, M13, M14.

### 5b · `muerte_carguero` — el que no explota, se parte
Para el **Atlantic Conveyor** (M8) y para los buques de desembarco. Un carguero no revienta:
**arde largo y se hunde despacio.** Sin santabárbara, sin resplandor.

```js
muerte_carguero: [
  { t: 0, parte: 'impacto', fx: { boom: 0.5, shake: 6 },
    sfx: { key: 'exHeavy', beep: [60, 0.35, 'sawtooth', 0.07, 20] } },
  // NO hay segundo estallido. Lo que hay es HUMO: una columna que no para de subir.
  { t: 0.8, parte: 'muerte' },
  { t: 1.2, fx: { boom: 0.12, shake: 2 } },     // secundario chico, muy adentro
  { t: 2.6, fx: { boom: 0.10, shake: 2 } },
  // cierra a NEGRO y lento: no te alejás de una explosión, te alejás de un incendio.
  { t: 3.6, fade: { a: 1, dur: 1.2 } },
  { t: 4.9, fin: true },
],
```

### 5c · `muerte_tierra` — radar, depósito, posición
Para blancos terrestres (M12, y los objetivos de oportunidad). **Más seco y más corto que un
buque:** no hay casco que se hunda, hay una cosa que estaba y dejó de estar.

```js
muerte_tierra: [
  { t: 0, parte: 'impacto', fx: { boom: 0.45, shake: 7 },
    sfx: { key: 'exHeavy', beep: [80, 0.25, 'sawtooth', 0.07, 30] } },
  { t: 0.15, marca: 'polvo' },                  // ⚠ ver §8: falta el verbo del polvo
  { t: 0.5, parte: 'muerte' },
  { t: 1.4, rotulo: { key: 'fin_tierra_ok', y: 46 } },
  { t: 2.2, fade: { a: 1, dur: 0.7 } },
  { t: 3.0, fin: true },
],
```

### 5d · 🔴 `muerte_sorda` — LA BOMBA QUE NO DESPERTÓ
**La variante más importante del catálogo y es el título de M6.** Pegaste. Pegaste bien. Y no
pasó nada.

```js
muerte_sorda: [
  // EL IMPACTO EXISTE Y SE VE: un golpe seco, metal contra metal, y NADA MÁS.
  { t: 0, parte: 'impacto', fx: { shake: 4 },
    sfx: { key: 'clang', beep: [140, 0.12, 'square', 0.06, -60] } },
  // …y después, EL SILENCIO. Este hueco es la escena entera: no se llena con nada.
  // Ni música, ni rótulo, ni flak. Solo el motor tuyo alejándote.
  { t: 2.2, rotulo: { key: 'fin_sorda', c: 'warn', y: 46 } },
  { t: 3.4, fade: { a: 1, dur: 1.0 } },
  { t: 4.5, fin: true },
],
```

> **No lleva rótulo explicativo.** `fin_sorda` dice algo corto y frío — *«NO EXPLOTÓ»* — y
> nada más. El jugador entiende solo. **Es el único remate del juego donde ganar se siente
> como perder**, y ésa es exactamente la misión.

### 5e · `muerte_ninguna` — los niveles sin blanco
Para M1 (tutorial), M9 y M10, que son de `distance`. No hay a quién matar: **el remate es
llegar.** Cortísima.

```js
muerte_ninguna: [
  { t: 0, parte: 'muerte', vuelo: { avance: 1, boost: true, estelas: true } },
  { t: 0.6, rotulo: { key: 'fin_llegaste', y: 40 } },
  { t: 1.8, fade: { a: 1, dur: 0.8 } },
  { t: 2.7, fin: true },
],
```

### 5f · 🔴 `muerte_alas` — EL BATIR DE LAS ALAS *(M8, una sola vez en todo el juego)*
El remate que no es una explosión. Después de tocar al Conveyor, el avión pasa sobre el monte
y **mueve las alas**. Abajo hay cascos que saludan. Uno de ellos es el hijo.

```js
muerte_alas: [
  // arranca como una salida cualquiera — el jugador no sabe que esto va a pasar
  { t: 0, parte: 'muerte', control: 'ninguno' },
  { t: 0.4, cam: { modo: 'chase', ramp: 1.0, ease: 'sale' } },   // salimos de la cabina: hay que VERLO
  { t: 0.8, marca: 'monte' },                                     // ⚠ §8: el monte y los cascos
  // EL GESTO: un ala y la otra. Lento. Es una frase, no una pirueta.
  { t: 1.6, move: 'alas', who: 'player' },                        // ⚠ §8: falta el move 'alas'
  { t: 3.2, ritmo: 0.55 },                                        // el mundo se hace lento acá y en ningún otro lado
  { t: 4.2, fade: { a: 1, dur: 1.4, color: '#f4fbff' } },
  { t: 5.7, fin: true },
],
```

> **Sin rótulo, sin radio, sin música nueva.** Si algo dice lo que está pasando, se arruina.
> Y **el jugador no sabe que su hijo está abajo** — lo va a saber al leer la carta. El plano
> es hermoso ahora y devastador después. *(GUION_3 M8.)*

---

## 6 · EL FALLO — tres grados, no uno

`pulso_fallo` ya cubre el primero. Los otros dos existen en el diseño del Pulso
(`PLAN_EL_PULSO.md` §4: 1er fallo re-encare, 2º cuesta una vida del escuadrón, 3º pierde) pero
**no tienen cinemática propia**, y son los que más la necesitan.

| Grado | Qué pasa | Cinemática |
|---|---|---|
| **1er fallo** | te pasaste, re-encarás | ✅ `pulso_fallo` — existe |
| **2º fallo** | **te cubre un compañero** y lo pagás con su avión | ❌ `fallo_relevo` — falta |
| **3er fallo** | la misión se pierde | ❌ `fallo_final` — falta |

### `fallo_relevo` — el que más importa
Alguien de la escuadrilla se mete para sacarte de encima el flak. **No se dice quién por
rótulo: se lo ve por su gesto.** El avión del Gitano entra rolando; el del Vasco entra
derecho. Y esa es la última vez que ese avión aparece.

```js
fallo_relevo: [
  { t: 0, parte: 'pasada', control: 'ninguno', ritmo: RITMO },
  { t: 0, vuelo: true },
  { t: 0, cam: { modo: 'chase', ramp: 0.8, ease: 'sale' } },
  { t: 0.3, radio: 'relevo_voy' },              // la ÚNICA línea de radio de todo el remate
  { t: 0.6, move: '$gestoRelevo', who: 'ala' }, // ⚠ §8: pilotar un avión del escuadrón
  { t: 1.4, fx: { boom: 0.35, shake: 6 } },     // le pega a él, no a vos
  { t: 2.0, ritmo: 0.6 },
  { t: 3.0, fade: { a: 1, dur: 1.0 } },
  { t: 4.1, fin: true },
],
```

---

## 7 · MAPA — qué remate usa cada misión

| # | Misión | Blanco | MUERTE | Nota |
|---|---|---|---|---|
| M1 | Con sal en las alas | — | `muerte_ninguna` | tutorial |
| M2 | El bautismo de fuego | — | `muerte_ninguna` | |
| M3 | El invento | — | `muerte_ninguna` | |
| M4 | El día que sangró el mar | HMS Sheffield | `muerte_buque` | el primero de verdad |
| M5 | El callejón de las bombas | HMS Ardent | `muerte_buque` | climax `arena` |
| M6 | La bomba que no despertó | HMS Antelope | 🔴 `muerte_sorda` | **es el título del nivel** |
| M7 | Pastelitos | HMS Coventry | `muerte_buque` | sin gesto: muere el Vasco |
| M8 | El batir de las alas | Atlantic Conveyor | `muerte_carguero` → 🔴 `muerte_alas` | las dos, encadenadas |
| M9 | El pibe | — | `muerte_ninguna` | sin gesto: muere el Pichón |
| M10 | Los primos | — | `muerte_ninguna` | |
| M11 | Lo que no se dice | RFA Sir Galahad | `muerte_carguero` | buque de desembarco |
| M12 | El ángel correntino | RFA Sir Tristram | `muerte_carguero` | sin gesto |
| M13 | La cena | HMS Broadsword | `muerte_buque` | sin gesto |
| M14 | El Tero | HMS Glamorgan | `muerte_buque` + cierre propio | climax `arena` |

**Cobertura: seis timelines de MUERTE cubren las catorce misiones**, y dos de ellas
(`muerte_sorda`, `muerte_alas`) se usan una sola vez cada una — pero son las dos que la gente
va a recordar.

---

## 8 · QUÉ VERBOS FALTAN

Siguiendo la regla del propio archivo —*se agrega el verbo, no la excepción*— esto es lo que
hay que agregar para que el catálogo entre entero:

| Falta | Para qué | Dónde se usa |
|---|---|---|
| **`move: 'alas'`** | el batir de alas: un alabeo suave a un lado y al otro, **lento**, que no es ninguna pirueta existente | `muerte_alas` |
| **pilotar un avión del escuadrón** (`who: 'ala'`) | que un compañero vuele en cámara | `fallo_relevo` |
| **`marca: 'monte'`** | que un render pueda dibujar el monte con los cascos saludando | `muerte_alas` |
| **`marca: 'polvo'`** | la nube de polvo y turba de un impacto en tierra | `muerte_tierra` |
| **`sfx: 'clang'`** | el golpe seco de metal sin explosión | `muerte_sorda` |
| **rótulos nuevos en `strings.js`** | `fin_sorda`, `fin_llegaste`, `fin_tierra_ok`, `relevo_voy` | varios |

---

## 9 · EL PROMPT PARA IMPLEMENTARLO

```
Trabajás sobre RASANTE (Electron + canvas, JS sin TypeScript). Vas a ampliar el catálogo de
cinemáticas de fin de nivel. El director de cinemáticas YA EXISTE y funciona: no lo rediseñes.

PASO 0 — LEER ANTES DE ESCRIBIR UNA LÍNEA, en este orden:
  1. docs/sistemas/CINEMATICAS_FIN_DE_NIVEL.md   ← la especificación. Es tu fuente.
  2. src/data/cines.js   ← ENTERO. Fijate en el encabezado (la lista de verbos), y estudiá
     `pulso_premio` y `pulso_fallo`: son el modelo de todo lo que vas a escribir.
  3. docs/sistemas/PLAN_DIRECTOR_CINEMATICAS.md  ← §4 y §6.
  4. docs/sistemas/PLAN_EL_PULSO.md  ← §4, los tres grados de fallo.
  5. src/data/missions.js  ← qué blanco tiene cada misión.
Después escribime en 10 líneas cómo vas a ligar la ranura MUERTE, y esperá mi OK.

LA REGLA DEL ARCHIVO, escrita en su propio encabezado y no se negocia:
"si una escena no se puede escribir acá, falta un verbo — se agrega el verbo, no la excepción."
Si te falta algo, agregás el VERBO en el sistema y la escena sigue siendo datos puros.
src/data/ no importa lógica del juego.

QUÉ HAY QUE HACER, en tres pasos con checkpoint entre cada uno:

PASO 1 — LA RANURA. Hacé que el tramo de MUERTE de pulso_premio sea intercambiable por
ligadura, sin cambiar el comportamiento actual: hoy liga `muerte_buque` y se ve idéntico a
ahora. Ese es el criterio de éxito del paso.

PASO 2 — LAS VARIANTES. Escribí muerte_carguero, muerte_tierra, muerte_sorda y
muerte_ninguna con los beats del §5 del documento, y conectalas a las misiones según el mapa
del §7. Agregá los rótulos nuevos a src/data/strings.js con es/en.
Cada una tiene que quedar MIRABLE SOLA desde el menú CINEMATICAS: eso significa que cada una
declara su `titulo`, su `desc` y su `ver`, igual que las que ya están.

PASO 3 — LOS VERBOS QUE FALTAN (§8) y las dos escenas que dependen de ellos: muerte_alas y
fallo_relevo. Este paso es el más caro: si alguno de los verbos resulta más grande de lo que
parece, PARÁ Y DECIME en vez de improvisar.

LO QUE NO TENÉS QUE HACER:
· No toques pulso_fallo ni la lógica del Pulso.
· No saques nada de cuarentena.
· No cambies el ritmo ni las duraciones de pulso_premio.
· Nada de acentos en identificadores ni en textos de UI.

CÓMO SÉ QUE ESTÁ BIEN:
· Las cuatro variantes nuevas se pueden mirar sueltas desde el menú CINEMATICAS.
· M6 termina con el impacto sordo y el silencio, sin explosión.
· Las misiones de `distance` rematan sin buscar un buque que no existe.
· pulso_premio sobre una fragata se ve EXACTAMENTE igual que antes de tu cambio.
· El proyecto compila y los fixtures que estaban verdes siguen verdes.

CUANDO TERMINES: qué archivos tocaste, qué verbos agregaste, y qué quedó pendiente.
```

---

## 10 · LO QUE HAY QUE DECIDIR

- **Si el gesto de salida entra ya o después.** Es lindo pero es lo primero que se puede
  recortar sin que nadie lo note.
- **Si M14 lleva un cierre propio** o reusa `muerte_buque` con otro fundido. *(Recomendación:
  propio. Es el final del juego.)*
- **Qué dice exactamente `fin_sorda`.** Propuesta: **«NO EXPLOTÓ»** y nada más. Cualquier cosa
  más larga explica lo que ya se entendió.
