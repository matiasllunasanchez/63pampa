# PLAN — LAS DEFENSAS DEL BUQUE: objetivos secundarios en el blanco final

> **Pedido del autor (15/10/2026):** "que los objetivos finales tengan diversos objetivos además del
> misil: si no embocás la bomba está bien, vas a tener un par de objetivos opcionales en el objetivo
> final —Sea Cat, Sea Wolf, Sea Dart, etc.— que podés DAÑAR con metralleta o con otra cosa, y si
> tenés más vidas (otras pasadas del escuadrón activo) el siguiente se acerca con menos dificultad
> que el primero, que pasó y derrotó las defensas. Cada fragata, buque o lo que sea debe tener el
> armamento real que tenía."
>
> **Origen:** la idea 4 del cruce con *Star Wars: Squadrons* (volar el generador de escudos para
> poder pegarle a la nave capital), traída a LA SUELTA.
>
> **Leer antes:** `docs/ARQUITECTURA.md` (manda) · `data/blanco.js` (la suelta, la fila, el
> re-encare) · `systems/seawolf.js` + `data/defensas.js` (la defensa cercana de hoy) ·
> `systems/pasada.js` (EN CUARENTENA, pero ya modela el cañón de 4,5" RF-04 y Sea Cat + fusilería
> RF-08: se reusa la idea y lo que sirva del código) · `rasante-errar-no-es-derribo` (memoria).

---

## 1. Lo que hay hoy (relevado en el código, 15/10)

| Pieza | Dónde | Cómo es |
|---|---|---|
| Defensa cercana | `systems/seawolf.js`, `data/defensas.js` | **UNA** por buque, `'cat' \| 'wolf' \| null`. Ciclo fija → salva → recarga mientras estás en su zona (600–700 de profundidad). Con `SW_SALVA = 99` tira continuo. No tiene posición en el casco: sale de `BL.X ± 4`. |
| Sea Dart | `systems/flight.js:681` | No es del buque: es la **oleada del radar** cuando subís de más, en todo el pasillo. |
| Artillería de popa | `systems/escape.js` | Solo en EL ESCAPE, después del cruce. |
| El casco | `core/blanco.js` | `dano`, `marcas`, `boquetes`. **No tiene partes**: la bomba juzga centro/extremo por `BL.CENTRO`. |
| Cañón del jugador | `systems/collision.js:666` | Las balas chocan contra `obstacles`, `missiles` y `soldiers`. **Contra el buque no pegan.** |
| La fila | `systems/blanco.js` `enFila`, `BL.FILA_M` | Errar o caer → el siguiente re-encara desde 2200. `blanco.*` se conserva entre pasadas (no pasa por `resetBlanco`). |
| Armamento por buque | `data/ships.js` | Solo la **clase visual** (`t21`, `t42`, `log`, `cv`). La Plymouth usa la hoja `t21` aunque era Tipo 12; el Broadsword igual siendo Tipo 22. |

**Consecuencia:** hoy el cañón no tiene nada que hacer en la aproximación final, y el segundo avión
de la fila encuentra el mismo buque que el primero. Este plan cambia las dos cosas.

---

## 2. El diseño

### 2.1 La tesis

El buque deja de ser UN blanco y pasa a ser **un blanco principal + sus sistemas**. Cada sistema
real del buque (lanzador, director de tiro, radar de seguimiento, cañón, montaje antiaéreo) es una
**pieza en el casco**, en su lugar real de la eslora, con su propio efecto mientras funciona.
Cañonearla en la aproximación la **DAÑA** (rinde menos) y después la **SACA** (deja de tirar).

- **La bomba sigue siendo el objetivo principal** y la regla de la misión no cambia (ver §2.5).
- **Los sistemas son secundarios y opcionales**: suman puntos y quedan en "lo que pasó".
- **El daño PERSISTE en la fila**: el que viene atrás encuentra el buque como lo dejó el anterior.
  Es la lógica real del ataque en fila, y es lo que convierte el escuadrón en **una sola pelea
  con varias manos**, en vez de N intentos sueltos contra el mismo buque nuevo.

### 2.2 La decisión que crea en el jugador

Durante la aproximación (desde que el buque aparece, `APARECE_Z` 2200, hasta la ventana de
suelta, ~135–190) hay unos segundos de vuelo. Hoy son espera. Con esto pasan a ser una elección:

- **Cañonear el lanzador** → te corrés de la línea de la ventana, gastás calor de cañón y te
  quedás más tiempo adentro de la zona de la defensa. A cambio, la salva se apaga o se ablanda.
- **Ir derecho a la ventana** → menos riesgo de errar la altura, pero con la defensa entera.
- **El primero de la fila "abre la puerta"**: si su bomba no entra pero dejó el Sea Cat fuera, el
  segundo entra limpio. Errar la bomba deja de ser una pasada perdida del todo.

### 2.3 Estados de cada sistema

`VIVO` → (daño ≥ umbral) → `DAÑADO` → (daño ≥ hp) → `FUERA`

| Estado | Qué hace | Cómo se ve |
|---|---|---|
| VIVO | Su efecto completo | Corchete rojo sobre la pieza al entrar en rango de cañón |
| DAÑADO | Efecto degradado (ver §3) | Corchete ámbar, chispas y humo fino |
| FUERA | Sin efecto | Corchete gris un instante y se apaga; humo negro persistente |

Dos estados intermedios y no uno porque el pedido es "DAÑAR": con 20 mm a 600 km/h casi nunca se
destruía un montaje; se lo dejaba sin director, sin operador o sin energía. DAÑADO es el estado
**más común y el más histórico**. FUERA es el premio de una ráfaga sostenida, o lo hace una bomba.

### 2.4 Qué puede dañar a un sistema

1. **El cañón** (balas del jugador): el caso principal.
2. **La bomba**: una bomba que estalla en el casco saca de golpe los sistemas que estén en su
   franja de eslora (el radio del boquete). Una bomba que **no detona** (MK-17) igual puede dejar
   DAÑADO lo que atraviesa: la Glasgow quedó sin máquinas por una bomba que no estalló.
3. **(Fase posterior)** el daño acumulado del casco: con el buque escorado, los sistemas pierden
   energía (bajo el 50 % de `dano`, todo pasa un estado abajo).

El calibre importa: el **A-4 lleva dos Colt Mk 12 de 20 mm**; el **Dagger y el Super Étendard, dos
DEFA de 30 mm**. Hoy no existe el dato por avión (`data/planes.js` no tiene arma): entra en F0 como
`canon: '20' | '30'`, con 30 mm haciendo ~1,6× el daño por tiro.

### 2.5 Lo que NO cambia (reglas vigentes)

- **Errar no es derribo** (memoria `rasante-errar-no-es-derribo`): errar la bomba sigue pasando la
  pasada al siguiente o perdiendo la misión. Los sistemas suman, pero **no** reemplazan la bomba
  como condición de victoria. *(Decisión abierta D3 si el autor quiere otra cosa.)*
- **No hay lock, ni tono, ni recuadro de fijado** (`systems/caza.js:22`): los corchetes de §2.3
  son de BLANCO (lo que vos le apuntás), no de amenaza. La amenaza se sigue leyendo en el mundo:
  el humo del lanzamiento, la estela, los piques en el agua.
- **El pasillo no rota**, la suelta no cambia de escena y la ventana de suelta no se ensancha
  (regla del 26/9: "ni lejos ni cerca, justo en cierta distancia"). Lo que cambia es **cuánto te
  tiran mientras llegás**.
- Ninguna tecla nueva: el cañón ya existe y con la mira de bomba puesta el gatillo sigue siendo
  de la bomba.

---

## 3. El catálogo de sistemas (datos: `src/data/sistemas_buque.js`, nuevo)

Cada tipo de sistema es UNA entrada con su efecto. Los números son de arranque, para medir en Node.

| id | Sistema real | Qué hace VIVO | DAÑADO | FUERA | hp (balas 20 mm) |
|---|---|---|---|---|---|
| `seacat_lanz` | Sea Cat GWS-20/22/24, lanzador cuádruple | Salva de Sea Cat (hoy `DEFENSAS.cat`) | Salva más corta (2 en vez de continua) | No tira | 14 |
| `seacat_dir` | Director óptico del Sea Cat (el operador con su joystick) | — (habilita el lanzador) | Guiado más torpe: `gana ×0,6`, `ciego ×1,4` | Los misiles salen sin guía (derechos) | 8 |
| `seawolf_lanz` | Sea Wolf GWS-25, lanzador séxtuple | Salva de Sea Wolf | Recarga ×2 | No tira | 16 |
| `seawolf_910` | Radar de seguimiento 910 del Sea Wolf | — (habilita el lanzador) | **Se confunde**: cada tanto pierde el blanco (la debilidad histórica) | Sin guía | 8 |
| `seadart_909` | Radar iluminador 909 del Sea Dart | Cerca del buque, subir por encima de `ALT_IDEAL` te compra Sea Dart **sin pasar por la barra del radar** | Más lento en fijar | Cerca del buque podés subir: **la suelta alta queda libre** | 10 |
| `seadart_lanz` | Sea Dart GWS-30, lanzador doble | Tira el Sea Dart de arriba | — | No tira | 18 |
| `cañon_45` | 4,5" Mk 8 (Mk 6 doble en Plymouth/Glamorgan) | **Columnas de agua que caminan sobre tu rumbo** (la RF-04 de `pasada.js`): castiga volar derecho | Cadencia ×0,5 | No tira | 30 (blindado) |
| `oerlikon` | 20 mm Oerlikon (montaje simple) | Trazadoras cercanas, dispersión ancha | Dispersión ×1,6 | No tira | 6 |
| `bofors` | 40 mm Bofors | Como el Oerlikon, más alcance y más lento | Dispersión ×1,6 | No tira | 8 |
| `gpmg` | Ametralladoras de cubierta (GPMG) y fusilería | Granizo cercano, casi no pega: presión | — | — | — (no se apaga: es gente) |

**La sinergia que sale gratis:** sacar el **909** del Sea Dart deja subir cerca del buque, y subir
es justo lo que **ensancha la ventana de suelta** (la espoleta `ARMA_T` necesita vuelo: a 18 m la
ventana dura 2,11 s contra 0,53 s al ras; `data/blanco.js`). El que apaga el radar le regala al de
atrás una suelta alta y cómoda. Eso es "el primero derrotó las defensas", medible.

**Posición:** cada sistema lleva `u` (fracción de la eslora, 0 = proa, 1 = popa) y `alto` (sobre la
flotación), leídos de la hoja horneada del buque para que la caja caiga sobre la pieza que se ve.
La caja de impacto la arma `core/blanco.js` con `BL.LEN`, `BL.X`, `blanco.base` y `blanco.z`.

---

## 4. El armamento real, buque por buque (datos: `src/data/armamento.js`, nuevo)

> Indexado por **nombre de buque**, no por clase visual: la Plymouth se dibuja con la hoja `t21`
> pero se arma como Tipo 12. Confianza: ✔ firme · ≈ a confirmar con el historiador (va a
> `PREGUNTAS_HISTORICAS.md`, sección nueva). Regla del proyecto: el dato provisorio queda en el
> juego y la duda se anota; no frena.

| Buque | Clase real | Sistemas del juego | Conf. |
|---|---|---|---|
| **HMS GLASGOW** (r2) | Tipo 42 Batch 1 | `seadart_lanz` + `seadart_909` (proa), `cañon_45` Mk 8 (proa), 2× `oerlikon` | ✔ / ≈ los Oerlikon |
| └ escolta **HMS BRILLIANT** | Tipo 22 | El Sea Wolf de r2 era de ella (el "combo 42/22"), no de la Glasgow → ver §5 F5 | ✔ |
| **HMS ARDENT** (r3) | Tipo 21 | `seacat_lanz` + `seacat_dir` (popa, techo del hangar), `cañon_45` Mk 8, 2× `oerlikon`, `gpmg` | ✔ |
| **HMS PLYMOUTH** (r4) | Tipo 12M (Rothesay) | `cañon_45` **Mk 6 doble**, `seacat_lanz` + `seacat_dir`, 2× `oerlikon` | ✔ / ≈ Oerlikon |
| **HMS SHEFFIELD** (r1, campaña) | Tipo 42 Batch 1 | Igual que la Glasgow. **No aplica en r1**: es EL PULSO, nunca se acercaron | ✔ |
| **HMS COVENTRY** | Tipo 42 Batch 1 | Igual que la Glasgow + `gpmg` | ✔ |
| └ escolta **HMS BROADSWORD** | Tipo 22 | El Sea Wolf del 25/5 era de ella | ✔ |
| **HMS ANTELOPE** / **AVENGER** | Tipo 21 | Igual que la Ardent | ✔ |
| **HMS BROADSWORD** (campaña, blanco) | Tipo 22 Batch 1 | 2× `seawolf_lanz` + 2× `seawolf_910` (proa y popa), 2× `bofors`. **Sin cañón de 4,5"** | ✔ / ≈ Bofors |
| **HMS GLAMORGAN** | Clase County | Sea Slug (largo alcance: se modela como `seadart_*`), 2× `seacat_lanz`/`dir`, `cañon_45` Mk 6 doble, 2× `oerlikon` | ✔ / ≈ |
| **RFA SIR GALAHAD** / **SIR TRISTRAM** | Round Table (LSL) | 2× `bofors`, `gpmg`. Casi indefensos: en Fitzroy los cubría (mal) el Rapier de tierra | ≈ los Bofors |
| **ATLANTIC CONVEYOR** | Portacontenedores | Nada: `gpmg` como mucho | ✔ |
| **HMS INVINCIBLE** / **HERMES** | Portaaviones | Invincible: `seadart_*`; Hermes: 2× `seacat_*`; los dos, `oerlikon` | ✔ / ≈ |

**Un hallazgo que corrige el juego de hoy:** r2 (LA GLASGOW) tiene `defensa: 'wolf'`. El
comentario de `libro_vuelo.js` ya lo explica bien: el Sea Wolf era de la **Brilliant**, la escolta.
Con este plan deja de ser una aproximación: la Glasgow tira lo suyo (Sea Dart, inútil al ras, más
el cañón) y el Sea Wolf viene **de la escolta, de costado, y no se puede cañonear**. Y la historia
regala la mecánica: contra ORO, el sistema de la Brilliant **falló al cruzarse los aviones**. Eso
es `seawolf_910` en DAÑADO por diseño, no por daño (ver F5).

**El otro hallazgo, a confirmar:** a la **Ardent** la atacaron varias oleadas el 21/5, y según las
fuentes británicas las primeras bombas (Dagger, ~14:00) pegaron en el **hangar y se llevaron el
lanzador del Sea Cat y el Lynx**. Si se confirma, en r3 (A-4Q, la oleada posterior) el Sea Cat
**ya llega FUERA**: la misión arranca con el estado que dejaron otros. Es exactamente la mecánica
del pedido, escrita por la historia. Va como estado inicial de la misión (`sistemasIniciales`).

---

## 5. Fases de implementación

Cada fase cierra con `npm run check` verde y es jugable por sí sola. Lo de física/tuning se mide
en Node contra el integrador real (memoria `rasante-medir-en-node-no-en-el-juego`), no piloteando.

### F0 · Los datos (½–1 día)

- `src/data/sistemas_buque.js`: el catálogo de §3 (tipos, efectos por estado, hp, umbral DAÑADO).
- `src/data/armamento.js`: la tabla de §4 por nombre de buque, con `u`/`alto` por sistema y
  `escolta: { nombre, sistemas, lado }` donde corresponde. Comentario de fuente y confianza por fila.
- `data/planes.js`: `canon: '20' | '30'` por avión (A-4B/C/Q = 20; Dagger, Super Étendard = 30).
- **Test de unidad** (`tools/unit.js`): todo buque de `MISSIONS` y del libro de vuelo con
  `climax: 'suelta'` tiene entrada en `armamento`; todo sistema existe en el catálogo; `u ∈ [0,1]`.
- Sección nueva en `docs/historia/PREGUNTAS_HISTORICAS.md` con las ≈ de §4 (ya agregada, ver ahí).

### F1 · Los sistemas existen y se les pega (1½–2 días)

- `core/blanco.js`: `blanco.sistemas = [{ id, tipo, u, alto, dano, estado }]`. Se arma en
  `resetBlanco` desde `armamento.js` (+ `sistemasIniciales` de la misión) y **NO** se toca en
  `enFila` / re-encare: esa es la persistencia. Se muta, no se reasigna (`lint:state`).
- `core/blanco.js`: `cajaSistema(s)` → caja de mundo (x, y, z, medio ancho, medio alto).
- `systems/collision.js`, bucle de balas: contra `blanco.sistemas` vivos, como contra
  `obstacles`. Daño por calibre. Al cruzar umbral, el sistema devuelve la **señal**
  (`'danado' | 'fuera'`) y game.js decide puntos, radio y sonido (los sistemas no llaman arriba).
- La bomba (`systems/blanco.js`, `estalla`/`golpe`): saca o daña los sistemas en el radio del
  boquete.
- Render mínimo: chispa al impacto, humo fino en DAÑADO, humo negro en FUERA, anclados al `u`.
- Puntos: DAÑADO 150 · FUERA 400 (escala de `collision.js`: AA de tierra = 350).
- **Sin efectos todavía**: la defensa sigue como hoy. Se puede jugar y apuntar.

### F2 · Los efectos: la defensa sale de los sistemas (2 días)

- `systems/seawolf.js` → **`systems/defensa_buque.js`**: de UNA defensa a **N**, una por
  lanzador vivo de `blanco.sistemas`, cada una con su ciclo y saliendo de SU `u` en el casco (el
  humo del lanzamiento sale de la pieza correcta). `DEFENSAS.cat/wolf` quedan como los números base.
- El estado modula: lanzador FUERA → no tira; director/910 DAÑADO → `gana`/`ciego` degradados;
  FUERA → misiles sin guía.
- `seadart_909` vivo: cerca del buque (zona propia), pasar `ALT_IDEAL[1]` dispara Sea Dart del
  buque sin esperar la barra del radar. FUERA → cerca del buque se puede subir.
- `data/defensas.js` `defensaDe()` y el `defensa:` de las misiones quedan como **respaldo** para un
  buque sin entrada en `armamento.js` (y para `?defensa=` de las pruebas).
- **Medir en Node:** con la defensa entera y una aproximación sin cañonear, la supervivencia del
  primero tiene que quedar **igual que hoy** (el `feel` de la suelta no se mueve). Con el Sea Cat
  fuera, la del segundo tiene que subir de forma clara (objetivo de arranque: ≥ +30 puntos).

### F3 · Las armas del buque que faltan (2–3 días)

- `cañon_45`: las columnas que caminan sobre tu rumbo, traídas de la RF-04 de `systems/pasada.js`
  (cuarentena: se copia la idea y la fórmula, no se revive el modo). Castiga volar DERECHO: choca
  de frente con "ir derecho a la ventana" y le da sentido a cañonear el cañón.
- `oerlikon` / `bofors`: trazadoras cercanas desde su montaje, en **patrón esquivable** (no
  dispersión al azar: lo que se aprende se esquiva). Reusa el dibujo de trazadoras de `escape.js`.
- `gpmg`: el granizo de la RF-08 de `pasada.js`, casi sin daño: presión visible.
- Un buque sin estos sistemas (Atlantic Conveyor) se siente distinto de una Type 21 **sin que
  ningún cartel lo diga**: esa es la prueba de que el armamento real se lee.

### F4 · La lectura (1½–2 días)

- **Corchetes por sistema** al entrar en rango de cañón (rojo/ámbar/gris, §2.3), con el nombre
  corto del sistema chiquito al lado (`SEA CAT`, `909`, `4.5`). No en el tablero: en el mundo
  (memoria `rasante-hud-cargado-es-intencional`: las mejoras van al mundo).
- **La placa del relevo**: cuando el siguiente de la fila re-encara, en el fundido, una línea:
  `DEFENSAS: SEA CAT FUERA · 4.5 DAÑADO`. Es el momento en que se entiende que el anterior sirvió.
- **Radio**: el numeral lo canta al pasar (`¡LE ROMPISTE EL LANZADOR!`) — vale en la zona del
  blanco, donde el silencio de radio ya se rompió. Textos nuevos en `strings.js` (ES/EN).
- **"Lo que pasó"** del libro y el resultado de campaña: qué sistemas quedaron fuera y quién.

### F5 · Lo histórico por misión (1–2 días, depende de las respuestas del historiador)

- `sistemasIniciales` por misión: **r3 Ardent** con el Sea Cat ya FUERA (si se confirma, §4).
- **Las escoltas**: `armamento.escolta` (Brilliant para la Glasgow, Broadsword para la Coventry).
  Su defensa entra desde un costado (`lado`), **no se puede cañonear** (es otro buque) y tiene la
  falla real: el `910` de la escolta **pierde el blanco cuando hay dos aviones cruzándose** —
  regla que premia el ataque en fila apretada, que es cómo atacaba ORO.
- Revisar `defensa:` de r2/r3/r4 en `libro_vuelo.js` contra la tabla nueva y dejarlos solo como
  respaldo (o borrarlos si `armamento.js` cubre todo).

### F6 · Balance y fixture (1 día)

- Script de Node que barre: (defensa entera / Sea Cat fuera / 909 fuera) × (cañonea / no
  cañonea) × (1º, 2º, 3º de la fila) → tabla de supervivencia y tasa de suelta. Se eligen los
  números de la tabla, no a ojo.
- Fixture de aceptación en Electron (`npm run defensas`, fuera de `check` como los demás de
  sistema): cañonear el lanzador de la Ardent lo pasa a DAÑADO y luego a FUERA, la salva se
  apaga, y el re-encare del siguiente lo encuentra FUERA. Solo el cableado punta a punta; las
  métricas, en Node.

**Total: ~9–12 días de trabajo.** Orden estricto F0 → F1 → F2; F3 y F4 se pueden intercalar;
F5 espera al historiador sin bloquear lo demás.

---

## 6. Extensiones (fuera de este plan, anotadas)

- **Estructuras en tierra** (`data/estructuras.js`, la base costera): el mismo molde con Rapier,
  Blowpipe y el radar de la base como sistemas. La tabla y el mecanismo sirven tal cual.
- **El Exocet como carga** (`blanco.js`, 14/10): con Exocet no hay que acercarse, así que los
  sistemas no se cañonean; pero el Sea Dart vivo sí podría decidir si el lanzamiento sale.
- **Los Pichón/mejoras**: una carta tipo "MUNICIÓN PERFORANTE" (más daño a sistemas) o
  "RÁFAGA LARGA" entra natural en el banco (memoria `rasante-configuraciones-son-mejoras`).
- **El Sea Dart y sus 2 segundos** (memoria `rasante-seadart-debilidad-pendiente`): cuando el
  buque tire su propio Sea Dart (F2), es el lugar natural para la guía cortada a los 2 s.

## 7. Decisiones del autor (cerradas el 20/10/2026)

- **D1 — Puntos:** la bomba al centro vale varias veces más que todos los sistemas juntos. ✔
- **D2 — El 4,5":** con cañón queda solo DAÑADO; FUERA únicamente con bomba (torre blindada). ✔
- **D3 — La victoria no cambia:** errar con el último de la fila sigue perdiendo la misión. Lo que
  se agrega: el resto de la fila igual pasa y daña (cada avión que re-encara puede cañonear los
  sistemas), y el resultado distingue "ERRASTE" de "ERRASTE, PERO LA DEJASTE SIN SEA CAT". ✔
- **D4 — Corchetes por sistema:** siempre en el libro de vuelo; en campaña, a decidir (candidata a
  mejora del Pichón). ✔
- **D5 — Escoltas:** se VEN — silueta al costado, de donde sale su Sea Wolf (no se cañonea). ✔

## 8. Trampas de este repo para esta tarea

- **Dos sesiones sobre el mismo árbol**: antes de cada fase, `git log` y releer `blanco.js`,
  `seawolf.js` y `collision.js` — son archivos que la otra sesión toca seguido (el Exocet del
  14/10 entró en `blanco.js`).
- `blanco` vive en `core/` porque lo leen sistema, colisión y render (`lint:layers`): los
  sistemas del buque van ahí también, por la misma razón.
- Un asset nuevo (humo de sistema, marca) necesita su `sub_path` en `tools/build_web.py` o el
  gate falla.
- Fixtures que ya fallan en HEAD limpio (memoria `rasante-fixtures-rotos-conocidos`): no
  perseguirlos como propios.

---

## 9. Estado de la implementación (20/10/2026)

**F0–F6 hechas.**

| Fase | Qué quedó | Dónde |
|---|---|---|
| F0 | Catálogo de 10 tipos de sistema con estados, hp, puntos y efecto; armamento real de 17 buques (incluye Brilliant), con posición `u` y altura `h` medidas en la hoja horneada; calibre por avión (20/30 mm). Unit: 7 pruebas nuevas (cobertura de buques, catálogo, estados, D1, D2, calibre, estados iniciales). | `data/sistemas_buque.js`, `data/armamento.js`, `tools/unit.js` |
| F1 | Los sistemas viven en `blanco.sistemas` y persisten en la fila. Las balas llegan al buque (hasta `SIS_ALCANCE` 600, antes morían a 240), convergen en la pieza apuntada (mouse) o corrigen la altura hacia la pieza de enfrente (mira fija); la chapa las frena. La bomba que revienta saca FUERA lo que está en su boquete; la MK-17 que no detona deja DAÑADO lo que atraviesa. Corchetes rojo/ámbar/gris con el nombre, humo y destello por pieza. | `core/blanco.js`, `systems/blanco.js`, `systems/collision.js`, `systems/flight.js`, `render/blanco.js`, `render/ammo.js` |
| F2 | La defensa cercana sale de cada lanzador vivo, desde su lugar del casco; DAÑADO = salvas de 2 y recarga doble; el director DAÑADO/FUERA degrada o corta la guía (Sea Wolf: el 910 pierde el blanco a ratos). Un buque sin armamento cae a la defensa de respaldo. El 909 del Sea Dart: cerca del buque (900), con todos FUERA no carga el radar (la suelta alta queda libre); DAÑADOS, a la mitad. | `systems/seawolf.js`, `systems/collision.js`, `core/blanco.js` (`radarBuque`), `systems/flight.js` |
| F3 | El 4,5" (salvas de columnas que caminan sobre tu rumbo, con horquilla; quebrar reinicia la cuenta; MK6 doble = una columna más) y las trazadoras de 20/40 mm y de cubierta desde sus montajes, con error de puntería propio. Causa nueva `death_45` (textos ES/EN, cae en llamas). | `systems/artilleria.js`, `render/artilleria.js`, `data/sistemas_buque.js` (`ARTILLERIA`), `core/damage.js`, `data/derrotas.js` |
| F4 | Radio al sacar una pieza FUERA (PUMA; en el libro PATRIA 2, solo si queda un amigo; nada en los modos sueltos). Placa "DEFENSAS DEL BUQUE — FUERA: … DAÑADO: …" al re-encarar (fila u otra pasada). Pantalla de derrota por errar: suma "Pero lo dejaste sin …" (D3). | `game.js`, `render/screens.js`, `data/strings.js` |
| F5 | La escolta se ve (silueta al costado, D5) y tira de costado sin poder cañonearse. r2 GLASGOW: la Brilliant con el 910 DAÑADO de arranque (falló contra ORO). r3 ARDENT: llega con el Sea Cat FUERA (lo sacó la oleada anterior). Ambos ≈, anotados en PREGUNTAS_HISTORICAS. | `data/libro_vuelo.js`, `render/blanco.js`, `data/ships.js` |

**Medido en el juego (sondas, t16 / Ardent):**
- Una ráfaga sostenida sobre el lanzador Sea Cat lo pasa de VIVO a FUERA en ~0,8 s de impactos.
- Defensa cercana en 3 s dentro de la zona: entera 4 misiles · lanzador DAÑADO 2 · FUERA 0.
- Glasgow: los Sea Wolf salen de la escolta (x ≈ 57). Broadsword: de sus dos lanzadores. Galahad: ninguno.
- Solo el 4,5", volando DERECHO desde 1300: un avión perdido en 4 de 4 corridas (se bajó de 4 a ~1).

### F6 — balance medido (20/10/2026) ✔

**Cómo:** `npm run balance:defensas` (`tools/balance_defensas.js`), en Node, contra el integrador real:
importa `systems/seawolf.js`, `systems/artilleria.js` y el armamento real; copia de `collision.js` el
guiado y el impacto de misiles y trazadoras, y la bala que voltea misiles. Simula la escuadrilla de 4
contra el buque, de 1400 a la ventana de suelta (175), sin la bomba. Cada impacto es un avión menos
(dmgMode `squad`, el de fábrica), y lo releva el siguiente **en el lugar**: 3 s sin defensa, con el mundo
al 40 %, igual que el estado `relevo` del juego. Reproduce lo medido en Electron: en HEAD, derecho o
viboreando, 1 avión por aproximación, exacto.

**Cinco pilotos:** derecho · víbora · reactivo (quiebra cuando ve venir algo) · cañonea (va a la pieza
más peligrosa y la cañonea; lo que viene por su chorro lo voltea) · compromete (como cañonea, pero en la
ventana de cañón no esquiva nada: la cota de "si te la jugás").

**Resultado a 90 u/s, 400 salidas por caso.** Cada celda: aviones perdidos en la aproximación · % que
llega limpia · % de la **segunda pasada** (tras un errado) que llega limpia · (piezas tocadas).

| buque | antes (cualquier piloto) | reactivo | cañonea | compromete |
|---|---|---|---|---|
| Ardent (t16) | 1 · 0 % · 0 % | 0,8 · 22 % · 27 % | 0,55 · 45 % · 30 % | 0,83 · 23 % · **47 %** · 1,4 |
| Ardent r3 (Sea Cat fuera) | 1 · 0 % · 0 % | 0,33 · **68 %** · 67 % | 0,16 · 84 % · 70 % | — |
| Plymouth (r4) | 1 · 0 % · 0 % | 0,79 · 23 % · 25 % | 0,55 · 46 % · 29 % | 0,88 · 20 % · **49 %** · 1,4 |
| Glasgow + Brilliant (r2) | 2 · 0 % · 0 % | 0,97 · 3 % · 3 % | 1 · 0 % · 2 % | 1,26 · 3 % · 1 % |
| Coventry + Broadsword | 2 · 0 % · 0 % | 0,97 · 3 % · 1 % | 0,99 · 1 % · 2 % | 1,66 · 1 % · 4 % |
| Broadsword | 2 · 0 % · 0 % | 1,89 · 0 % · 0 % | 1,01 · 0 % · 0 % · 1 | 1 · 0 % · 0 % · 1 |
| Sir Galahad | 1 · 0 % · 0 % | 0,29 · 71 % · 70 % | 0,09 · 92 % · 93 % | 0,09 · 91 % · 90 % |

Derecho y víbora quedan como antes (1 avión). A **70 u/s** (más tiempo bajo fuego) volar derecho cuesta
**más** que antes (Ardent 2,25 contra 2; Plymouth 2,41 contra 2): el 4,5" cobra la aproximación lenta y
derecha, que es lo que viene a castigar. El 30 mm contra el 20 mm casi no cambia nada (±5 %).

**Qué dice:**
- **Antes, la defensa no se podía jugar:** pilotear como fuera, se perdía exactamente un avión (el tiro
  continuo del respaldo no deja hueco). **Ahora la destreza paga:** el reactivo llega limpio ~1 de cada 4
  veces contra una fragata entera.
- **Sacar el Sea Cat vale muchísimo:** contra la Ardent sin Sea Cat (r3), el reactivo pasa de 22 % a 68 %
  limpio. La pieza correcta cambia la misión.
- **"El primero derrota las defensas" se cumple, y cuesta:** el que se compromete a cañonear pierde más en
  su pasada (20–23 % limpia contra 22–23 % del reactivo) pero toca ~1,4 piezas, y la **segunda pasada**
  llega limpia el 47–49 % (contra 25–27 %). Es una decisión de verdad, no un truco.
- **Cañonear con criterio es lo mejor contra una fragata:** el piloto que cañonea y quiebra si algo le
  pega de verdad llega limpio 45 % (contra 22 % del reactivo), porque su ráfaga voltea los Sea Cat que le
  vienen por el chorro.
- **Las escoltas no se cañonean, y se nota:** contra la Glasgow y la Coventry comprometerse es peor (1,26
  y 1,66). Ahí la salida es esquivar, y el Sea Wolf de la escolta, confundido o no, cobra ~1 avión.
- **El Broadsword sin cañonear cuesta 2 aviones; cañoneado, 1:** es el buque donde más rinde apagar un
  lanzador (tiene dos).

**Cambios de balance que salieron de la medición:**
- **El lanzador real tiene cargador** (`DEFENSAS.cargador`/`recarga` en `data/defensas.js`): 4 Sea Cat y
  recarga 4,5 s (cuádruple, recarga a mano), 6 Sea Wolf y recarga 4 s (séxtuple). Con el tiro continuo de
  antes, nadie podía cañonear un lanzador: el piloto se pasaba la aproximación entera esquivando. La
  defensa de **respaldo** (buques sin armamento) sigue continua.
- **Vida de lanzadores y directores** bajada: Sea Cat 14→9, Sea Wolf 16→10, director 8→6, 910 8→6.
- **El 4,5"**: alcance 1300→1000, una salva cada 3 s y dispersión propia (ya estaba del 20/10: con lo
  anterior, una aproximación derecha perdía 4 aviones).

**Aceptación:** `npm run defensas` (`tools/fixture_defensas.js`, fuera de `check`): 12 verificaciones —
armamento real, el cañón pasa el lanzador por DAÑADO a FUERA y la radio lo canta, sin lanzador no hay Sea
Cat, el re-encare lo encuentra todavía FUERA, el 4,5" no sale a cañonazos, y r2/r3/r4 arrancan como la
historia.

**Lo que la medición NO dice:** la bomba (la ventana de suelta se juega igual) y lo que un jugador ve a
600 m — el piloto simulado sabe dónde está cada pieza; el jugador las tiene que encontrar en ~30 px.

**Sondas nuevas (QUITAR al cerrar el plan):** `__sis(i?)` (estado; con `i` pone el avión frente a la
pieza), `__sisset(i, estado)`. `__buqueSet(nombre)` ahora también re-arma el armamento del buque nuevo.

**Pendiente:**
- **D4 en campaña:** hoy los corchetes se ven siempre (la campaña está bloqueada); decidir si van atados a una mejora del Pichón.
- **Lectura a distancia:** a 400–600 el buque mide ~30 px y las piezas 1–2 px; los corchetes tienen tamaño mínimo pero los nombres recién se leen de cerca (k > 0,55). Ajustar con el autor jugando.
- `?defensa=cat|wolf` ya no elige los lanzadores de un buque con armamento: solo prende/apaga la defensa.
