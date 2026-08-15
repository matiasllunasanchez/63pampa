# Plan de implementación — MINUTOS SAGRADOS / fase ARENA

> **Estado: propuesta de diseño e implementación. Nada de esto está construido.**
> Escrito el 2/8/2026 contra el código real (`systems/arena.js`, `systems/three-arena.js`,
> `render/arena.js`, `systems/ship3d.js`, `data/ships.js`), no contra la idea de lo que hacen.
> Todos los números del diagnóstico están medidos sobre las constantes vigentes.
>
> **Alcance:** la fase **ARENA** — el clímax que HISTORIA y CICLO DE MUERTE juegan al terminar el
> PASILLO, y que el modo **MINUTOS SAGRADOS** juega solo. A futuro el boss no es solo un buque:
> también **bases militares** (etapa E9.4).
>
> **Documento previo:** `PROMPT_ARENA_VUELO_LIBRE.md` es la spec que construyó lo que hay hoy
> (etapas A–D hechas) y sigue siendo válida como historia y como lista de trampas. Este documento
> **la continúa**: es la etapa que ella dejó abierta ("el pase de tuning de sensación con el juego
> en la mano"), con un alcance mayor del que ella preveía — ver §3.

---

## 1. La tesis, en un párrafo

La idea base del arena es **correcta y no se toca**: un ring acotado, vuelo libre, un buque grande
al que se ataca por distintos flancos. Lo que falta no es contenido: es que **el avión pueda volar
en tres ejes** (hoy no puede — el cabeceo está topeado en 9°), que **el viraje se sienta un
viraje** (hoy el avión derrapa 13,5° en vez de carvear), que **acercarse importe** (hoy el cañón
alcanza toda la arena) y que **el buque tenga un latido** (hoy solo tiene HP, y se apaga en vez de
despertarse). Todo lo demás —fases, reloj, incendios, escora— es consecuencia de eso y va después.

> **El arena de RASANTE tiene que ser el All-Range Mode de _Star Fox 64_, con el buque de _Ace
> Combat_, el latido de _Armored Core VI_ y la puntería de _Panzer Dragoon_.** El razonamiento
> está en el Anexo A.

---

## 2. Diagnóstico medido

### 2.1 La pelea, en números

| dato | valor | de dónde |
|---|---|---|
| vida TOTAL del destructor Tipo 42 | **285 HP** (55+55+45+130) | `data/ships.js` |
| daño del cañón | 7 cada 0,12 s = **58 HP/s** | `SHOT_DMG`, `SHOT_CD` |
| daño de un misil | **85** — el 30% del buque entero | `MSL_DMG` |
| misiles | 3, **se regeneran solos** cada 7 s | `MSL_MAX`, `arena.js:196` |
| ring | radio 700 m → cruzarlo entero **11,2 s** | `RING_R`, `SPD_CRUISE` |
| giro completo | **7,0 s**, radio 139 m | `YAW_PER_VX × VX_MAX` |

**El buque muere con ~5 segundos de fuego perfecto.** Todo lo demás que dura la pelea es *viajar*:
rodear, encarar, buscar el lado desde el que se ve la zona. De ahí la regla que gobierna el plan
entero:

> **Subir HP es la palanca equivocada.** Alarga el viaje, no la tensión.

### 2.2 ⚠️ El arena no es 3D: es un panqueque

`A.fwd = forward(A.yaw, atan2(A.vy, A.spd))` — el morro apunta **a donde va la velocidad**, y la
velocidad vertical está topeada (`VY_MAX = 18`, `VY_MIN = -20`) contra `SPD_CRUISE = 125`:

```
  cabeceo máximo ARRIBA = atan2( 18, 125) =  8,2°
  cabeceo máximo ABAJO  = atan2(-20, 125) = -9,1°
```

- **No existe la picada de ataque.** Batir el puente (20 m) desde 100 m de altura con 9° de
  depresión exige estar a **505 m de distancia horizontal**: no se pica sobre el buque, se le tira
  de lejos y plano.
- **No existe el tirón de salida**, ni el yo-yo, ni pasar por arriba y caerle encima.
- El sobre de vuelo es un **disco de 1400 × 196 m (7:1)**.
- Y por lo tanto **"atacar por distintos flancos" es solo horizontal**: los flancos son las agujas
  del reloj, nunca arriba ni abajo.

Corolario que hay que registrar: **`ALT_MAX = 200` no es una decisión de diseño, es un parche del
tope de cabeceo.** El comentario dice "desde 300 m de altura el blanco cae fuera del campo de
visión volando derecho" — cae fuera porque *no podés bajar el morro para mirarlo*. Con cabeceo
real, el techo se puede levantar.

### 2.3 El avión patina, no vira

El rumbo lo arrastra `vx` (`YAW_PER_VX = 0.030`) y esa **misma** `vx` te desplaza de costado
(`A.pos.x += rx * A.vx`):

```
  derrape sostenido = atan(30/125) = 13,5° durante TODO el viraje
```

Y `A.roll` es **puramente visual** — no produce el viraje, lo acompaña; la cámara de 3ª incluso lo
atenúa a `0.35`. El resultado se lee como un aerodeslizador que derrapa, no como un avión.

Ironía útil: el juego **ya tiene** el esquema correcto como opción — `cfg.control = 1` (ALABEO,
ROADMAP #31). El PASILLO lo ofrece; el arena, que es donde haría falta, no lo lee.

### 2.4 Al cañón le sobra la arena

```
  GUN_RANGE = 900 m   >   RING_R = 700 m
```

**Se puede batir el buque desde cualquier punto del ring, incluido el borde.** No hay gradiente de
riesgo: estar a 600 m es tan efectivo como estar a 120 m. Eso solo ya destruye la pasada de
ataque. Además es **hitscan** (`shootRay` resuelve en el instante del disparo; `dur = dist/1400`
es animación): sin tiempo de vuelo, sin adelanto, sin destreza adentro.

### 2.5 La densidad de amenaza es de una cada dos segundos

```
  intervalo de flak = max(1.0, (2.8 + rand*1.2) / AA_vivas)
    2 AA vivas → 1,4–2,0 s        1 AA viva → 2,8–4,0 s
```

Y las trazadoras están declaradas inofensivas en el propio código ("casi nunca pegan (son la
presion que se VE)"). Entre flak y flak no pasa nada.

### 2.6 Toda la destreza del juego queda en la puerta

`update(dt, inp)` lee `u/d/l/r/fire/msl/turbo`. **Nada más.** El catálogo entero de `data/moves.js`
—tonel, tonel barril, tirabuzón, split-S, break turn, low/high yo-yo, S-turn, jink, pop-up— no
existe en la pelea final. Tampoco el roce con estilo ni el perfil `tight` de colisión.

El jugador llega al clímax habiendo aprendido diez maniobras y descubre que el boss se pelea con
cuatro flechas.

### 2.7 La pelea se vuelve MÁS FÁCIL a medida que avanza

Cada AA muerta baja el volumen de fuego **y** la cadencia del flak (`aliveAA().length` divide el
intervalo). El final es el momento más tranquilo de la batalla. Un boss hace lo contrario.

### 2.8 Cosas ya medidas que se tiran a la basura

- el flak **ya calcula** el "te pasó cerca" (`FLAK_NEAR = 75`, `arena.js:373`) y solo hace temblar
  la pantalla. En el PASILLO el roce puntúa (`stats.grazes`, `collision.js:184`);
- el rociado de agua existe (`render/rain.js`, `anchorSpray`) y vive solo en el pasillo;
- `MOM_LAYOUTS` ya coloca zonas a alturas opuestas (radar en el tope del mástil, motores al ras
  del agua) — un mapa de riesgo de altura que nadie puede usar porque no hay eje vertical;
- el progreso solo se ve en el HUD: una zona muerta se pinta gris (`charZone`) y tira humo, sin
  incendio ni escora ni columna visible desde lejos.

### 2.9 Playtest del autor (2/8) — el diagnóstico, con las manos

Cuatro quejas textuales, y a qué ítem pertenece cada una:

| queja | causa medida | lo resuelve |
|---|---|---|
| "le faltan cosas para sentirse placentero" | §2.2 + §2.3 (el panqueque y el derrape) | **E1+E2** ✔ |
| "el avión se mueve demasiado rápido para el espacio" | giro de 7 s en un ring de 11 s, sin freno | **E2+E3**: giro 5,2 s / 2,5 s apretando, `SPD_CRUISE` 125→110, freno 0,6× ✔ |
| "es difícil apuntar" | no podés bajar el morro al blanco (§2.2) + hitscan sin feedback (§2.4) | **E1** ✔ (apuntar con el morro) · lo que falta es **E5** (pintado) |
| "a veces explota o muere y no sé por qué" | la causa (`rv.cause`) se guardaba y NUNCA se mostraba; el flak detrás de cámara no se dibujaba; el mar mataba sin aviso | **legibilidad de muerte** ✔ (adelantada de E8) |
| "el barco se ve horrible" | `ship3d.js` son cajas Lambert planas | **nuevo → E8**, primer ítem |

---

## 3. La decisión de fondo: el arena deja de heredar el vuelo del PASILLO

`PROMPT_ARENA_VUELO_LIBRE` tomó una decisión explícita y bien fundada (27/7): el arena usa **las
mismas constantes de `flight.js`** porque el modelo anterior —input → mira → guiñada → rumbo →
posición, tres integraciones de retardo— se sentía tosco, mientras el pasillo va input → velocidad,
una sola. Ese diagnóstico era correcto y **la cadena corta se conserva**.

Lo que ese cambio también importó, sin quererlo, fue el **sobre de vuelo de un scroll lateral**: en
el pasillo `y` es una altura con techo (`FLY_TOP`) y `vy` es un desplazamiento vertical, no un
ángulo. Heredar `VY_MIN/VY_MAX` metió el tope de 9° de §2.2.

> **Decisión propuesta:** el arena tiene su **propio modelo aerodinámico**, en un módulo puro y
> testeable (`src/core/aero.js`), que conserva la cadena corta y el tacto del pasillo pero razona
> en **ángulos** (cabeceo, alabeo) en vez de en velocidades verticales. El PASILLO **no se toca**.
>
> Hay que escribirlo en `ARQUITECTURA.md`, porque contradice una línea del prompt anterior y la
> próxima persona lo va a buscar.

---

## 4. Arquitectura propuesta

### 4.1 Módulos

| módulo | estado | qué contiene |
|---|---|---|
| `src/core/aero.js` | **nuevo** | funciones PURAS del vuelo del arena: base de orientación, cabeceo/alabeo comandados, viraje coordinado, energía. Sin estado ni imports de stores → lo puede medir `tools/feeltest.js` sin navegador |
| `src/data/arena.js` | **nuevo** | data pura: constantes de vuelo del arena, patrones de fuego, umbrales de fase |
| `src/systems/arena_boss.js` | **nuevo** | el comportamiento del buque: fases, patrones, stagger, secuencia de hundimiento. Sale de `arena.js` para que ese archivo no vuelva a crecer sin control |
| `src/systems/arena.js` | reescritura del bloque MANDO + COMBATE | usa `aero.js`; suma armas balísticas, burbuja, maniobras |
| `src/systems/three-arena.js` | cámara | de `lookAt` + `rotateZ` a orientación por **base 3×3** (§4.2) |
| `src/render/arena.js` | HUD | barra de integridad, stagger, pintado de blancos, líneas de velocidad |
| `src/systems/ship3d.js` | + incendios / escora | el buque se degrada visualmente |
| `src/systems/momentum.js` | **congelado** | el fallback sin 3D queda como está, y se documenta que no recibe nada de esto |

### 4.2 Orientación: se terminan yaw+pitch sueltos

Hoy la actitud se guarda como `yaw` + `pitch` + `roll` con `up` clavado en `{0,1,0}`. Con cabeceo
de ±50° y alabeo real eso se rompe: tirar del morro estando rolado 90° **tiene** que virar de
costado, y con `up` fijo no vira.

> **Guardar la actitud como una BASE de tres vectores** (`fwd`, `right`, `up`) integrada por
> velocidades angulares. Es lo que evita el bloqueo de cardán en la vertical y lo que permite el
> tonel completo.
>
> Consecuencia en `three-arena.js`: la cámara ya no puede usar `lookAt(...)` + `rotateZ(-roll)`
> —eso asume `up` mundial— sino `cam.quaternion.setFromRotationMatrix(base)`. Es un cambio chico
> pero **obligatorio**: si no, pasando 60° de alabeo la imagen se da vuelta sola.
>
> **⚠️ Cómo quedó de verdad (E1/E2, 2/8):** se implementó **Euler acotado** (yaw mundial +
> pitch ±51° + roll ±80°), NO la base — con esos topes no hay cardán posible y `lookAt` sigue
> siendo estable (su degeneración es con el morro cerca de la vertical, que el tope impide).
> La base pasa a ser un **prerequisito de E4** (tonel de 360°, split-S), no de E1/E2. Si E4 se
> resuelve con maniobras guionadas —como hace el pasillo— puede no hacer falta nunca.

### 4.3 Reglas del repo que aplican

1. **Los stores se MUTAN, nunca se reasignan** (`cfg`, `cam`, `plane`, `run`, `stats`) — lo
   custodia `npm run lint:state`.
2. **Si una variable la escribe UN SOLO sistema, no entra en `core/state.js`.** Todo el estado del
   arena (actitud, stagger, fase del buque) lo escribe el arena → se queda en el arena.
3. **El arena no llama hacia arriba**: devuelve señal (`'objective'` / `{death}`) y `game.js`
   decide (relevo o derribo).
4. `src/game.bundle.js` es generado (`npm run build:game`). No se edita a mano.
5. Comentarios en español **sin acentos** en el código, explicando **por qué**, no qué.
6. Las constantes ajustables van a `data/`, no sueltas en el sistema.

---

## 5. Plan por etapas

Cada etapa deja el juego jugable, se prueba en los tres layouts (`t42` / `t21` / `log`) y **tiene
un criterio de salida medible**. E1 y E2 son las que deciden si esto funciona: **si el vuelo no se
siente, no seguir.**

---

### E0 — Instrumentar antes de tocar ✔ (hecho 2/8/2026)

Sin esto, todo el resto es "probemos a ver".

- [x] fórmulas de vuelo extraídas a `src/core/aero.js` (puras, sin imports de stores) —
      `systems/arena.js` las importa y quedó solo con estado y mundo. Cero cambio de
      comportamiento, verificado abajo;
- [x] sección **ARENA** en `tools/feeltest.js`: sobre de vuelo, cadena corta y energía, todo
      desde las funciones reales de `aero.js`;
- [x] `window.__adbg` reporta `slip` (derrape instantáneo) y `window.__ahist` (nuevo) vuelca el
      histograma de **distancia de disparo** (baldes de 100 m) y los **gaps entre pasadas**
      (transiciones del buque fuera/dentro de un cono de mira de ~15°). La sonda se limpia al
      arrancar batalla NUEVA, no en el re-enter del relevo — un derribo no borra el histograma.

> **Salida verificada:** `npm run feel` reproduce los números de §2 desde las fórmulas reales —
> cabeceo **8,19° / −9,09°**, derrape **13,50°**, radio **138,9 m**, vuelta **6,98 s**, ring
> **11,2 s**, vx 0→tope **0,27 s**, decaimiento **0,62 s**, sostenidos picando/trepando
> **182 / 74**. Sonda Electron sobre una batalla real de MINUTOS SAGRADOS (menús de verdad,
> W/D/X): vx tope 30 en viraje, slip coherente con `atan2(vx, spd)` vivo, 9 tiros registrados
> (media 352 m — el diagnóstico §2.4 medido en vivo), relevo persistiendo zonas, outro y cierre
> de batalla limpios. Gate completo en verde (el assert de audio del smoke Electron falla por el
> mute local, preexistente; el smoke web pasa entero, audio incluido).
>
> Dato de la sonda que confirma el plan: trepando sostenido `spd` cae a ~84 y el derrape sube a
> **19,4°** — peor que los 13,5° de crucero. El modelo vigente castiga trepar con MÁS derrape.

---

### E1 — El eje vertical ⭐⭐⭐ ✔ (hecho 2/8/2026, junto con E2)

> **Medido al cierre** (`npm run feel` + sonda Electron sobre batalla real): cabeceo alcanzable
> **51,6°** (antes 8,2°) en 0,63 s; picada desde 300 m con salida a los 60 → mínimo 22 m sobre el
> agua; trepar 4 s cuesta **33,6 m/s** (criterio ≥30); sin energía el morro se hunde solo a ~24°
> (autoridad cuadrática, `MUSH_DROP` 1,3); auto-nivelado al soltar; techo 200→600; `vy` es
> consecuencia del morro, así mira = trayectoria = rayo del cañón por construcción.
> Además entró la fila **EJE Y EN BATALLA** en OPCIONES (`cfg.arenaInv`, decisión D1) y el freno
> **[F] / L2** (`inp.brake` nuevo — campo propio para que L2 no mueva el paneo del pasillo).

**Invertir la relación cabeceo ↔ velocidad vertical.** Hoy el jugador manda `vy` y el cabeceo se
deduce. Pasa a mandar **el ángulo**, y `vy` se deduce:

```
  pitch += pitchInput * PITCH_RATE * dt           (topeado en ±PITCH_MAX)
  vy     = sin(pitch) * spd
  spd   += (empuje/frenado − G_E * sin(pitch)) * dt      ← la gravedad pasa a ser ENERGIA
```

Trepar sangra velocidad, picar la gana. Por debajo de `SPD_MUSH` la autoridad de cabeceo cae y el
morro se va abajo solo: **hundimiento blando, no pérdida dura**. Este juego no quiere que se entre
en barrena; quiere que quedarse sin energía se sienta.

El techo sube (`ALT_MAX` 200 → 600) porque el parche de §2.2 deja de hacer falta.

- **Dónde:** `core/aero.js` (nuevo), bloque MANDO de `systems/arena.js`, `data/arena.js`.
- **Ojo:** `A.fwd` deja de derivarse de `vy` — pasa a salir de la base (§4.2). El rayo del cañón y
  la mira lo siguen usando, así que la mira sigue cayendo donde apunta el morro sin cambios.

> **Salida (medible):** cabeceo alcanzable **≥ 40°** (hoy 8,2°); se puede picar desde 300 m sobre
> el buque, disparar y salir sin tocar el agua; trepar 4 s a 45° cuesta **≥ 30 m/s**.
> **Salida (sensación):** se llega al puente en picada, que hoy es imposible.

---

### E2 — El alabeo produce el viraje ⭐⭐⭐ ✔ (hecho 2/8/2026)

> **Medido al cierre:** derrape en viraje sostenido **0°** (antes 13,5° — el viraje sale del
> banqueo, no de `vx`); derrape máximo COMANDADO 4,2° (A/D, corrección fina); vuelta completa
> banqueando **5,2 s** (antes 7,0; criterio ≤5,5) y **2,5 s apretando** (banqueo + tirar — el
> viraje de combate de E3 salió gratis del modelo); radio **89 m** (antes 139; criterio ≤110);
> `SPD_CRUISE` 125→110 y freno sostenido a 68 m/s. Cámara de 3ª con **roll pleno** (el 0,35 de
> atenuación escondía lo que ahora gobierna el avión) — el mareo a 480×270 queda por evaluar en
> mano; si molesta, vuelve como opción reusando la fila HORIZONTE. `arena_hint` reescrito con el
> esquema real (morro W/S · rola y vira Q/E · freno F). Verificado fin-a-fin con sonda Electron:
> banqueo 1,4 rad, slip 0°, yaw girando, flak matando (y ahora avisando), gate completo en verde.

El arena adopta el esquema **ALABEO** como modelo nativo (el que `cfg.control = 1` ya ofrece en el
pasillo). El viraje sale de inclinar el vector de sustentación:

```
  roll   += rollInput * ROLL_RATE * dt            (topeado en ±ROLL_MAX)
  yawRate = ROLL_TURN * sin(roll)                 ← viraje coordinado
  derrape → residual (VX_MAX 30 → 8, solo corrección fina)
```

Y el **cabeceo se aplica en el marco del avión**, no del mundo: tirar del morro rolado 90° vira de
costado. Es lo que convierte "moverse" en "volar", y lo que hace que E1 y E2 se multipliquen en
vez de sumarse.

- **Dónde:** `core/aero.js`, `systems/arena.js`, cámara de `three-arena.js` (§4.2).
- **Cámara:** el alabeo de 3ª deja de atenuarse a `0.35` (estaba atenuado porque el alabeo no
  significaba nada; ahora sí). **Medir el mareo** — si a 480×270 rolar el horizonte entero cansa,
  la atenuación vuelve como opción, reusando la fila HORIZONTE de OPCIONES.

> **Salida (medible):** derrape en viraje sostenido **≤ 3°** (hoy 13,5°); giro completo **≤ 5,5 s**
> con radio **≤ 110 m** (hoy 7,0 s / 139 m).

---

### E3 — Viraje de combate y freno ⭐⭐⭐ ✔ (hecho 14/8/2026, junto con S2 y S3)

> **Medido al cierre** (`npm run feel`, sección *arena*, + sonda Electron sobre batalla real):
> **media vuelta guionada en 1,08 s** contra **2,6 s** banqueando a mano (y 5,1 s la vuelta
> entera) — el criterio del plan era "~1,2 s"; corta por **guiñada acumulada** (180,9°), no por
> reloj, así que el mismo gesto vale a cualquier velocidad. **Cuesta 19 m/s** de energía y tiene
> reenganche de 1,1 s: encadenarlas te deja lento, blando y sin cabeceo, que es el precio que
> pedía el plan. El **freno** ya había entrado con E1 (`SPD_BRAKE 0.6`, sostenido a 68 m/s).
> **DRIFT (S2)**: con freno + banqueo pleno la trayectoria se despega del morro **48°** medido
> vivo (`__adbg.dAng`) y **vuelve a 0,1° al soltar** — el modelo E1/E2 medido no se movió.
> **SWEET SPOT (S3)**: radio de giro **43 m frenado · 87 m crucero · 134 m con turbo**; el único
> número de E2 que se corrió es la vuelta completa (5,4 → 5,1 s), re-anclado en el feeltest.
>
> **Controles:** `[R]` / **◯** disparan la media vuelta. Tecla propia y **no** un combo de dos
> toques a propósito: el repo ya aprendió que con dos toques las maniobras salen solas maniobrando
> (encabezado de `data/moves.js`). El lado lo decide el **banqueo**, y nivelado va **hacia el
> buque** — es la herramienta de "volver a tenerlo en la mira", no una pirueta de exhibición.
>
> **Lo que se ve:** el **vector de vuelo** (el símbolo de cualquier HUD real) recién ahora se gana
> el píxel — sin drift caía siempre encima de la mira; se dibuja cuando se separa. Y la velocidad
> se pinta en el acento con **GIRO CORTO** dentro de la banda del sweet spot: la forma más barata
> de enseñar la mecánica es que el número que ya estabas mirando cambie de color.
>
> **Sondas nuevas:** `__adbg` reporta `mv`/`drift`/`dAng`; `__ahist` suma `uturns` y `driftT`
> (SQUADRONS_UPDATE §7: un sistema que nadie usa es peso muerto y se saca). `__aset` acepta un
> cuarto argumento `turn` — sin poder dejar el buque **a la espalda** no había forma de medir dos
> veces la misma situación.
>
> **Queda abierto de E3:** el catálogo completo de piruetas en el arena es **E4**, no esto. Acá
> entró UNA maniobra, la que el plan justificaba con números.

### E3 — el detalle original

En un ring de 1400 m a 125 m/s, cruzarlo son 11 s y girar 5–7 s: la mayor parte de la pelea se va
volando *lejos* del buque. Problema clásico de las arenas chicas, con solución clásica.

- **VIRAJE DE COMBATE**: media vuelta en ~1,2 s (Immelmann con velocidad, split-S con altura), con
  costo de energía. **El SPLIT-S ya está en `data/moves.js`**: la maniobra existe, falta que el
  arena la pueda correr.
- **FRENO**: hoy hay `SPD_TURBO = 1.5` y no hay freno. Rango 0,6× – 1,5×. En arena acotada el freno
  vale tanto como el acelerador: es lo que te deja *quedarte* sobre el blanco en vez de pasar de
  largo.

> **Decidido (D2, §10) y ya implementado:** el arena corre su **propio ejecutor** de maniobras
> (`core/aero.js`, `startUturn`/`stepUturn`). `systems/moves.js` escribe `plane` y `run.mv*`
> —estado del PASILLO— y no puede manejar la actitud del arena. Lo que se comparte es la IDEA de
> maniobra guionada: mientras corre, ella escribe el `io` y el jugador no maneja, así el vuelo
> sigue siendo UNA sola integración. El **catálogo** `data/moves.js` todavía no se lee desde el
> arena: la media vuelta no está en él (no existe como pirueta del pasillo, donde darse vuelta no
> significa nada). Cuando entre E4 con las piruetas de verdad, ahí sí se comparten los números.

> **Salida (medible):** tiempo entre pasadas (romper → volver a tener el buque en la mira)
> **≤ 4 s** (hoy ~7 s con giro completo).

---

### E4 — Que la destreza del juego entre a la arena ⭐⭐

Con la base de orientación (§4.2) y el ejecutor de E3, el catálogo entero pasa a ser ejecutable
en 3D:

- **tonel** (`LLL` / `RRR`) → esquive real: el perfil se encoge (`tight`) y saca al avión de la
  esfera de detonación del flak;
- **break turn**, **jink**, **S-turn** → quiebres contra la predicción del flak;
- **yo-yo alto / bajo** → recién tienen sentido cuando hay eje vertical (E1);
- **el roce puntúa**: `FLAK_NEAR` ya está medido (§2.8) → suma como `stats.grazes`, con su sonido
  y su popup, igual que el pasillo.

Como los tokens de combo ya distinguen **mano izquierda (minúscula) / mano derecha (mayúscula)**
(ROADMAP #34), el vocabulario entra sin inventar nada nuevo.

> **Salida:** los combos del pasillo se ejecutan en el arena, y un tonel bien cronometrado esquiva
> un flak que sin tonel pega — verificado con sonda, no a ojo.

---

### E5 — Armas: que acercarse importe ⭐⭐ ✔ (hecho 14/8/2026)

> **Medido al cierre** (sonda Electron sobre batalla real, `__adbg`/`__ahist`):
> **desde 600 m el cañón hace CERO daño** (285 → 285 HP con una ráfaga entera) y **desde 250 m,
> 21–28**; el buque ya **no se puede batir desde el borde del ring**, que era el defecto medido
> en §2.4. **Distancia media de disparo 339 m** (criterio: < 400) — y eso *incluyendo* los tiros
> que la sonda malgastó a 520 y 600 m, que ahora son exactamente eso: malgastados.
>
> - **Cañón balístico**: la bala es un objeto del mundo a `BULLET_V = 850` m/s y el impacto se
>   resuelve por el **segmento** recorrido en el cuadro — a esa velocidad un chequeo por punto se
>   saltea el casco entero entre dos cuadros (14 m por frame a 60 fps). ~4 balas vivas a la vez.
>   Se ve como trazadora propia proyectada desde el mundo, con su tiempo de vuelo.
> - **Caída de daño** desde 300 m hasta el 45% en el límite (`gunDamage`).
> - **Calor**: entra con las MISMAS constantes del pasillo (`GUN_HEAT_SHOT` y compañía). Medido
>   en vivo: sube ~0,2/s de fuego sostenido → **presupuesto de ráfaga de ~5 s** antes del bloqueo.
>   ⚠️ **La sonda nunca llegó a bloquearlo**, y eso es un hallazgo: a 250–520 m el flak mata antes
>   de los 5 s. El techo de calor solo va a morder al que se queda lejos rociando — que es
>   justamente lo que E5 quiere desalentar. Barra arriba a la IZQUIERDA (arriba a la derecha vive
>   el indicador de música) y **RECALENTADO** parpadeando.
> - **Misil por PINTADO**: `[Z]` sostenida pinta las zonas que el retículo barre (hasta 3, 0,32 s
>   cada una, con arco de carga sobre la zona), soltar dispara la salva. `MSL_DMG` 85 → **55**
>   (salva de 3 = 165 ≈ 58% del destructor). Verificado: pintó, soltó, salió el misil y bajó el
>   contador. Por eso el misil del arena **dejó de entrar por el flanco de tecla de `game.js`**:
>   un flanco no puede expresar cuánto tiempo te quedaste encima.
> - **Se terminó la regeneración automática** cada 7 s. El misil vuelve con la **PASADA LIMPIA**:
>   entrar a 260 m y salir de 420 m sin que un flak te roce, +1 misil y aviso en pantalla. La
>   santabárbara se llena al empezar batalla NUEVA, **no en el relevo** del escuadrón — recargar
>   ahí sería premiar el derribo justo después de sacarle la regeneración al recurso.
>
> **De yapa:** el arena ahora suma `stats.shots` al disparar. Contaba los impactos (`stats.hits`)
> y no los tiros, así que la precisión del recuento podía pasar del 100%.
>
> **Sin verificar todavía:** "la pelea se resuelve en 3–5 pasadas" pide una partida jugada por una
> persona, no una sonda. La aritmética da 2–3 (58 HP/s de cañón dentro de 300 m + salva de 165
> sobre 285 de casco), así que puede que haya que **subir el casco o bajar la salva** — pero eso
> se decide con el juego en la mano, que es la regla de este plan.

### E5 — el detalle original

- **`GUN_RANGE` 900 → ~380 m**, con caída de daño desde 300. **Un solo número** y aparece la
  pasada de ataque completa, sin construir ningún sistema.
- **Cañón balístico**: el proyectil es un objeto del mundo (`BULLET_V ≈ 850 m/s` → 0,45 s de vuelo
  a 380 m), con colisión por segmento contra el buque. Da adelanto, peso y destreza. Costo: ~4
  balas vivas a la vez (9 tiros/s × 0,45 s) — despreciable.
- **Calor del cañón**: importar `GUN_HEAT_SHOT` y compañía de `tuning.js`. Hoy el cañón del arena
  es un botón que se mantiene; en el pasillo ya hay ~3,1 s de ráfaga.
- **Misil por PINTADO** (*Panzer Dragoon* / *Rez*): mantener el botón pinta las zonas que el
  retículo barre durante la pasada (hasta 3), soltar dispara la salva. A 480×270 apuntar fino a un
  blanco 3D en movimiento es pelea perdida; pintar mueve la destreza a **cuánto te animás a
  quedarte adentro**, que es exactamente lo que se quiere que se sienta.
  - rebalance: `MSL_DMG` 85 → ~55 (salva de 3 = 165 ≈ 58% del destructor) y **se termina la
    regeneración automática** — se recarga al completar una **pasada limpia** (entrar, pegar y
    salir sin recibir). El recurso premia la jugada que el diseño quiere.

> **Salida (medible):** distancia media de disparo **< 400 m** (hoy sin límite); el buque no se
> puede batir desde el borde del ring; la pelea se resuelve en **3–5 pasadas**.

---

### E6 — El latido: stagger, burbuja y patrones ⭐⭐ ✔ (hecho 15/8/2026)

> **Medido al cierre** (sonda `arena_e6.js`, `__adbg`/`__ahist`):
>
> - **STAGGER**: el fuego sostenido a 260 m **abre** una zona (verificado, `staggers: 1`). La
>   apertura da ×2,5 durante 2,5 s, corchete al **rojo blanco** y la etiqueta cambia a
>   `! AL DESCUBIERTO !`. Mientras está abierta **no recarga**: sin eso una zona abierta se
>   re-abría antes de cerrarse y no cerraba nunca.
> - **DECAIMIENTO medido**, soltando el gatillo y muestreando cada 0,25 s:
>   `0,88 → 0,79 → 0,71 → 0,62 → 0,54 → 0,45` = **−0,085 por muestra = 0,34/s**, exactamente
>   `STAG_DECAY`. *(Detalle lindo: la barra todavía SUBE en la primera muestra después de soltar
>   —0,46 → 0,88— porque las balas de E5 siguen viajando. El tiempo de vuelo del cañón balístico
>   se ve en un número que no lo estaba buscando.)*
> - **BURBUJA (250 m)**: adentro, **2 patrones** en 4 s y espoleta de flak partida a la mitad
>   (1,15 → 0,55 s), con el bip de aviso más agudo. Afuera, **CERO patrones** — el espacio mismo
>   enseña dónde es peligroso, sin un solo cartel.
> - **PATRONES**: tres figuras del mismo abanico — `cortina` (pared horizontal simultánea),
>   `barrido` (la misma en secuencia) y `aspa` (persiana vertical), apuntadas **adelantadas**, así
>   que sostener el rumbo te mete adentro de la figura y la salida siempre es quebrar por el eje
>   que el patrón deja libre. Tabla en `data/arena.js`, no `Math.random()`: un patrón se aprende;
>   una dispersión al azar sólo se sufre.
>
> **Tres calibraciones que salieron de medir, no de opinar:**
>
> 1. **Cadencia.** Con `PAT_EVERY [1.5, 2.6]` la sonda midió **62 amenazas/min** adentro — a
>    480×270 eso es sopa (trampa §9.1). Quedó en **[1.8, 3.0] = 20–33/min**, que es justo el
>    criterio de salida (">= 20 esquives/min").
> 2. **`STAG_CAP` (nueva).** Un solo misil de 55 llenaba la barra ENTERA de la zona grande
>    (0,42 × 130 = 54,6): el stagger se **compraba** en vez de ganarse, y la palabra del plan es
>    "daño SOSTENIDO". Ahora ningún impacto suelto puede aportar más del 25% de la barra — hacen
>    falta 4 como mínimo, sea con lo que sea. El cañón (7 por bala) ni lo nota.
> 3. **`PAT_OFFSET` (nueva) — la más importante.** El abanico se centraba en el punto adelantado
>    EXACTO, así que la rama del medio pegaba en la cara: medido, **el avión volando recto adentro
>    de la burbuja moría en menos de un segundo**. Eso no es "algo que esquivar", es una ejecución
>    — y encima peleaba de frente contra el stagger, que premia QUEDARSE. Con la figura corrida
>    55 m (a un lado al azar) cruza tu camino en vez de centrarse en vos: hay que moverse, y hay
>    por dónde. Después del cambio la sonda sobrevivió lo suficiente para medir todo lo demás,
>    que es la señal de que el arreglo era el correcto.
>
> **Interacción con E5 que hubo que resolver:** esquivar un patrón **no** ensucia la pasada limpia
> — sólo el flak lo hace. Adentro de la burbuja siempre hay patrones, así que contarlos dejaba la
> recarga de misiles en imposible, y el recurso que premia la jugada dejaba de premiar nada.
>
> **Lenguaje visual (trampa §9.1):** la trazadora letal va **gruesa, con halo rojo, núcleo blanco
> y estela larga**; la de presión sigue fina, apagada y dispersa. Si se parecieran, morir sería un
> misterio y el patrón no se podría aprender.
>
> **Sin verificar todavía:** "cero muertes por algo no telegrafiado" **fuera** de la burbuja. Es
> una afirmación sobre una partida jugada; lo que sí está verificado es la premisa que la sostiene
> (afuera no se emite ningún patrón letal).

#### Playtest del autor (15/8) — la batalla completa, con las manos

Cinco frases textuales y qué resultó ser cada una:

| queja | causa REAL | arreglo |
|---|---|---|
| "los misiles son dificilísimos de esquivar, **no se ven**" | ⚠️ **bug de orden de dibujo**, no de dificultad | ✔ |
| "en 1ª persona es **injugable**: se escucha el tiro y al toque te matan" | la misma | ✔ |
| "en 3ª es más jugable, mejoró un poco pero le falta muchísimo" | la misma, atenuada (en 3ª el avión tapa menos) | ✔ |
| "**dura más** la batalla" | E5 le recortó el alcance al cañón y el buque no cambió de vida | ✔ `SHOT_DMG` 7 → 9 |
| "poné sonidos de explosión de los que ya teníamos" | el flak sonaba con el `boom` procedural | ✔ `exSmall`/`exXsmall`/`exMedium` |

**LA CAUSA DE LAS TRES PRIMERAS, y la lección más cara de todo el plan:** `drawCockpit()` se dibuja
DESPUÉS del bucle de fx, así que el PNG del parabrisas **tapaba las trazadoras letales y el anillo
de aviso del flak**. Con la cabina ocupando media pantalla, la amenaza existía, se oía, mataba —
y era invisible. No era un problema de balance: era que el telégrafo estaba tapado por el capó.

> **Regla que queda escrita: en el ARENA, todo lo que puede matarte se dibuja AL FINAL**, encima
> de la cabina y del avión (`drawThreats()` en `render/arena.js`). Si algo nuevo mata, va ahí.

Y el anillo del flak además mentía el tiempo: se cerraba contra un divisor fijo de 1,15 s cuando
dentro de la burbuja la espoleta es de 0,55. Ahora usa la espoleta real (`fuse0`).

**Trazadoras letales, ablandadas:** 330 → **210 m/s** y radio 8 → **6 m**. A 330 m/s cruzaban la
pantalla en menos de lo que tarda una reacción humana: no eran difíciles, eran invisibles. Y los
patrones bajaron a uno cada 2,4–3,8 s, porque ya no son la única amenaza.

#### 🟥 REDISEÑO DEL FUEGO DEL BUQUE *(16/8 — segundo playtest; deroga los patrones de E6)*

> Textual: *"desde que dispara el barco hasta que te golpea es casi instantáneo, y encima parece
> que no te dispara exactamente y te pega igual"*.
>
> **Tenía razón, y el culpable era el flak de toda la vida**: se materializaba al lado del avión
> con una espoleta. No había disparo que ver — no era rápido, era que **no viajaba**.
>
> **La regla nueva: TODO lo que dispara el buque sale del buque y viaja hasta vos.** Dos armas:
>
> | | velocidad | radio | cadencia | sonido |
> |---|---|---|---|---|
> | **METRALLETA** | 235 m/s | 5 m | ráfagas de 5–9 rondas escalonadas 75 ms, cada 1,4–2,6 s | `exXsmall` por ráfaga |
> | **ANTIAÉREO** | 170 m/s | 18 m (proximidad) | 1–3 pepinazos cada 4,5–7,5 s | `exHeavyDist`, **UN** tiro |
>
> **PUNTERÍA IMPERFECTA, que es el diseño y no una concesión.** El tiro se adelanta contra la
> velocidad real del avión y después **se desvía a propósito**: normalmente 0,09–0,19 rad (a 300 m
> son 27–57 m de yerro), y **cada 10–18 s se afina 2,8 s** a 0,008–0,03. Con adelanto perfecto la
> única defensa sería no estar ahí; con dispersión al azar el buque nunca acertaría. Adelanto +
> error = **la estela pasa cerca, se ve pasar, y de vez en cuando engancha**.
>
> El **radar sigue mandando**: muerto, el buque pierde el adelanto y tira a donde estuviste — la
> mejor regla que ya tenía el modo, y ahora además **se ve**.
>
> **Medido:**
> - metralleta en el aire el **86%** del tiempo, antiaéreo el **25%**; hasta 21 rondas vivas.
> - puntería fina el **11%** del tiempo (el resto, mala).
> - **supervivencia volando: 6 de 6 muestras aguantaron los 9,4 s** de la ventana, tanto derecho
>   como banqueando. Una sonda anterior daba 26 muertes en 104 muestras, pero teletransportaba el
>   avión al mismo punto: **un blanco quieto**. Contra fuego con adelanto, estar quieto es morir —
>   y que eso sea así está bien.
>
> **Dos bugs de estado que salieron de medir:** el ciclo de puntería vivía en `A` y se reiniciaba
> en cada relevo (la tanda fina aparecía el 3% del tiempo en vez del 20%). Ahora vive a nivel de
> módulo, como el reparto de energía: **es del buque, no del avión**.
>
> **Lo que esto deroga:** los **patrones** de E6 (cortina / barrido / aspa) y la trazadora
> decorativa. La justificación original era "un patrón se aprende, una dispersión se sufre" — pero
> con **tiempo de vuelo y estela visible**, la dispersión ya es legible: leés hacia dónde va la
> línea y te salís. Sumar las dos cosas era sopa. La burbuja **sí** sobrevive, pero ahora modula
> cadencia y puntería en vez de la espoleta.

#### 🟥 Misil guiado del buque *(pedido del autor, 15/8 — adelanta parte de E7/S5)*

**La amenaza que se VE venir**, y el contrapeso exacto de lo que estaba mal: todo lo demás que
tira el buque es rápido y puntual; este es lento, ruidoso y persistente. Se anuncia, te sigue, y
**pasa de largo si quebrás a tiempo**. Es la única cosa de la pelea que se esquiva con la cabeza
y no con los reflejos.

- **122 m/s** contra los 110 de crucero: no se le escapa con turbo, **se lo gira**. Vira a 1,1
  rad/s contra los ~2,6 del avión apretando — la salida siempre existe y siempre es la misma.
- Se queda **sin combustible a los 9 s** y se apaga solo: perseguirte tiene un límite.
- Uno cada 7–11 s y sólo en la franja de **150–620 m** (de más cerca no da tiempo; de más lejos
  no llega). Es un EVENTO, no una lluvia.
- **Tono de aproximación** que sube de frecuencia con la cercanía, cuña roja en el borde si queda
  fuera de cuadro, y halo que late más rápido de cerca.
- **Verificado con sonda:** lanzado a 268 m, quebrando con banqueo pleno → **PASÓ DE LARGO**, con
  distancia mínima de **23 m** (el radio letal es 12). Se esquiva, y por poco.

### E6 — el detalle original

- **STAGGER por zona** (*Armored Core VI*): el daño sostenido llena una barra que decae sola; al
  llenarse, **la zona se abre** — daño ×2,5 durante ~2,5 s, caja al rojo blanco y sonido propio.
  Le da a la pelea el ciclo castigo → apertura → ráfaga que hoy no tiene.
- **BURBUJA DE DEFENSA CERCANA**: dentro de ~250 m del casco la espoleta del flak se acorta
  (1,15 s → ~0,55 s) y arranca un aviso que sube de frecuencia. Quedarte encima es muerte; entrar,
  pegar y salir es la jugada. Es lo que impide orbitar picoteando.
- **Trazadoras que PEGAN, en PATRONES**: cortinas, barridos, cruces entre dos AA — tabla en
  `data/arena.js`. Un patrón se aprende y se esquiva con destreza; una dispersión al azar solo se
  sufre. Objetivo: dentro de la burbuja **siempre** hay algo que esquivar; fuera, **nada** — así el
  espacio mismo enseña dónde es peligroso.

> **Salida (medible):** acciones de esquive por minuto dentro de la burbuja **≥ 20**; fuera de la
> burbuja, cero muertes por algo no telegrafiado.

---

### E7 — Las fases: el buque se despierta ⭐⭐

Perilla única: **integridad = Σhp / Σmaxhp** sobre `zones`.

| integridad | qué pasa |
|---|---|
| 100–65% | como hoy: trazadoras de presión + flak telegrafiado |
| **65%** — *alarma general* | la cadencia de flak deja de depender de cuántas AA quedan (queda fija); salvas de 2 |
| **30%** — *desesperación* | cortina de humo, un misil antiaéreo guiado que hay que quebrar, y las AA vivas disparan **en barrera** |

La inversión es lo importante: hoy matar AA **baja** la presión; con umbrales, matar AA te acerca
al escalón siguiente, que la **sube**. Pasás a elegir *cuándo* cruzarlo.

- **Anuncio por radio** en cada umbral: el aviso más barato que existe, y lo que hace que la
  escalada se **entienda** en vez de sentirse injusta.
- **El estado de fase PERSISTE entre relevos del escuadrón**, igual que `zones`. Si no, volver de
  un derribo reinicia el comportamiento del buque justo en el momento más tenso.

> **Salida:** una batalla completa dura **lo mismo o menos** que hoy. Si al implementar las fases
> pasa de ~80 s a ~160 s, está mal hecho: las fases reemplazan HP por presión, no se suman a ella.

---

### E8 — Legibilidad, sensación y recompensa ⭐⭐

Nada de esto cambia reglas; todo cambia lo que se percibe.

- **El buque se ve digno** ✔ *(nuevo — playtest 2/8: "el barco se ve horrible"; implementado 3/8)*.
  Sigue siendo cajas, pero vestidas: texturas de casco pintadas por canvas (planchas, sombra bajo
  la borda, cinta de flotación con óxido chorreado, degradé vertical de luz), contorno pixel art
  por casco invertido (anidado y sin raycast: no tapa los tiros), y siluetas chicas — cañón de
  proa con tubo, tubos en las AA, botes, cruceta y antenas de látigo, grúa del logístico. Detalle
  técnico que costó: `CanvasTexture` necesita `colorSpace = SRGBColorSpace` o el buque sale
  lavado. El fallback momentum lo hereda gratis (modelo compartido). Pendiente menor: barandas
  (ruido a 480×270) y el degradé por cara según el sol.
- **Legibilidad de muerte** ✔ *(adelantada, 2/8)*: la pantalla de relevo ahora dice **LA CAUSA**
  (`rv.cause` se guardaba y nunca se mostraba — vale para el pasillo también); aviso **EL MAR —
  ARRIBA** con viñeta roja bajo, cayendo por debajo de 16 m; y cuña roja titilante en el borde
  cuando un flak **fuera de cuadro** está por detonar a <130 m. La regla nueva: el arena puede
  matar, pero no puede matar EN SILENCIO.
- **Barra de integridad única** con las marcas de fase dibujadas encima — ver acercarse el umbral
  es la mitad de la tensión. La fila de casillas de hoy dice "cuántas zonas quedan", no "cuánto le
  falta".
- **El casco cuenta la historia:** cada zona muerta deja un **incendio persistente** y una
  **columna de humo** visible desde el borde del ring; bajo el 30% el buque **escora** y se hunde
  unos metros. Progreso legible desde 700 m sin mirar el HUD.
- **Sensación de velocidad = geometría cerca:** rociado de agua volando bajo (ya existe,
  `render/rain.js` / `anchorSpray`), estela del buque, líneas de velocidad, **golpe de FOV** con el
  turbo (hoy la cámara es 65° fijos). Que a 5 m del agua se sienta el triple de rápido que a
  150 m — y eso **paga el rasante con sensación**, no solo con reglas.
- **Retroalimentación de impacto:** chispas en el casco *en 3D*, pedazos que saltan, sonido con
  distancia. Hoy pegar es un flash de retículo de 0,2 s.
- **La muerte del buque como secuencia**, no 3,2 s de booms al azar: incendio que se propaga →
  explosión secundaria del pañol → se tumba → se va bajo el agua con la cámara acompañando y el
  motor como único sonido. 5–6 s sin control: **se gana el derecho a mirar**.
  *Gancho histórico gratis: el Sheffield no se hundió al toque, ardió durante días.*

> **Salida:** alguien que no programó esto entra y, sin mirar el HUD, sabe cuánto le falta al buque
> y en qué fase está.

---

### E9 — Contenido: el reloj, el modo y la tierra

Ya no es sensación ni estructura: es contenido nuevo. Va último a propósito.

**E9.1 — El reloj que el nombre promete.** MINUTOS SAGRADOS tiene que tener minutos, pero **no un
timer de fracaso** (el modo encadena batallas; un game-over por reloj lo rompe):

> *Tenés ~2:30 antes de que llegue la patrulla de Harriers.* Cuando se acaba **no perdés**:
> aparecen los cazas y la pelea cambia de género. El castigo es **contenido nuevo**, no una
> pantalla de derrota. Hundirlo antes de que lleguen vale el multiplicador grande.

Históricamente exacto: la CAP inglesa era lo que decidía si el ataque salía. **No construir el
reloj sobre el combustible** — `cfg.fuelOn` está apagado por decisión de diseño y las misiones no
lo pisan.

**E9.2 — MINUTOS SAGRADOS como *run*.** Hoy encadena batallas al azar y no se acumula nada: es un
banco de pruebas con menú. Lo que lo vuelve modo: el escuadrón **no se rellena** entre batallas, el
puntaje se acumula en la corrida entera, **una elección de tres cartas** entre batallas (recuperar
un avión / más misiles / carga liviana) y dificultad creciente (la batalla N arranca en fase 2, o
con la CAP ya en el aire). Es ROADMAP #14 aplicado a un modo chico.

**E9.3 — Variedad de arena.** El buque **navega** (hoy está clavado en el origen: con cañón
balístico, moverse obliga a liderar el tiro); **escolta** que te obliga a quebrar; **clima** —
lluvia y niebla ya existen y viven solo en el pasillo.

**E9.4 — BASES MILITARES: el boss de tierra.** No es un buque re-skineado, y esa es la razón de
construirlo: **la tierra da cobertura**. En el mar estás siempre a la vista; en una base metida en
una bahía o un valle el terreno **tapa el radar y el flak**, y la pelea pasa a ser de rutas de
aproximación en vez de órbitas. Objetivos: pista, hangares, radar, depósito de combustible
(explosión en cadena), baterías dispersas. Mismo esqueleto de fases de E7, con la integridad de la
*base*. El molde de referencia es *Desert Strike*: lista de blancos, munición finita, orden
opcional.

---

## 6. Constantes: hoy → propuesto

Valores de arranque **para medir y ajustar**, no verdades. Van a `src/data/arena.js`.

| constante | hoy | propuesto | por qué |
|---|---|---|---|
| cabeceo máximo | ±9° (emergente) | `PITCH_MAX = 0.9` rad (**±51°**) | §2.2 — el ítem que desbloquea todo |
| velocidad de cabeceo | — | `PITCH_RATE = 1.4` rad/s | pleno en 0,64 s; rizo de ~4,5 s |
| alabeo máximo | visual | `ROLL_MAX = 1.4` rad (80°) | viraje escarpado sin invertir |
| viraje | `YAW_PER_VX = 0.030` | `ROLL_TURN = 1.45` rad/s × sin(roll) | 72°/s a 60° de alabeo → radio ~100 m |
| derrape | `VX_MAX = 30` | `VX_MAX = 8` | 13,5° → ~3,7° de crabbing |
| energía | `ENERGY = 46` sobre vy | `G_E = 20` sobre sin(pitch) | trepar 4 s a 45° cuesta ~42 m/s |
| techo | `ALT_MAX = 200` | **600** | el 200 era el parche del cabeceo topeado |
| acelerador | 1,0 / turbo 1,5 | **0,6 – 1,5** | E3: el freno vale tanto como el turbo |
| alcance del cañón | `GUN_RANGE = 900` | **380** (caída desde 300) | §2.4 — que acercarse importe |
| bala | hitscan | `BULLET_V = 850` m/s | adelanto y peso |
| calor del cañón | ninguno | `GUN_*` de `tuning.js` | igual que el pasillo |
| misil | 85, regenera cada 7 s | **55**, sin regeneración, recarga por pasada limpia | recurso con decisión |
| espoleta del flak | 1,15 s | 1,15 s / **0,55 s** dentro de 250 m | la burbuja de E6 |
| ring | `RING_R = 700` | 700 (medir) | con giro más chico puede bajar a 600 |

---

## 7. Controles — **normativo** (decisión D1, §10)

En el ARENA `↑/↓` son **cabeceo** y el acelerador se va a los **gatillos**. Es una divergencia
deliberada respecto del PASILLO, donde `↑` es "subir": allá es un scroll lateral, acá es un avión.

El esquema respeta la doctrina de **dos manos, dos familias** de ROADMAP #34 —*todo lo que rola se
pide con la mano que rola*— para que el vocabulario de combos entre al arena sin inventar nada.

| acción | joystick | teclado |
|---|---|---|
| cabeceo | stick IZQ ↕ | `W` / `S` |
| derrape fino | stick IZQ ↔ | `A` / `D` |
| **alabeo** | stick DER ↔ | `Q` / `E` *(ya son las teclas de rolido)* |
| paneo de cámara | stick DER ↕ | — |
| acelerador / freno | R2 / L2 | `R` / `F` |
| cañón | R1 | disparo del pasillo |
| misiles (mantener = pintar) | L1 | misil del pasillo |
| viraje de combate ✔ | **◯** | **`R`** *(no combo: ver E3)* |
| reparto de energía ✔ | **cruceta ↑** | **`G`** |
| cambiar vista | — | `V` |

> **Cerrado al implementar (14–15/8):** el viraje de combate quedó en `[R]` / ◯ y **no** en un
> combo — con dos toques las maniobras salen solas maniobrando (encabezado de `data/moves.js`).
> El reparto de energía (S1) quedó en `[G]` / cruceta ↑. El misil pasó a **mantener = pintar**, así
> que en el arena `[Z]` ya no es un flanco sino un botón sostenido.

Sumar a OPCIONES: **INVERTIR EJE Y (ARENA)** — estándar en cualquier juego de vuelo desde que
existe el cabeceo comandado, y este juego ya tiene la pantalla donde ponerlo.

---

## 8. Verificación

1. **Gate completo en verde:** `npm run check` (syntax → lint:state → build:game → unit → feel →
   smoke → build:web → smoke:web).
2. **`npm run feel` con la sección ARENA**: los números de salida de E1–E6, impresos, no estimados.
3. **Jugado de verdad en Electron**, una batalla entera por layout (`t42` / `t21` / `log`).
4. **FPS medidos y reportados.** Hoy hay 120 con el mundo a 480×270; balas como objetos, incendios
   y patrones de trazadora no pueden comerse eso.
5. **Fallback `?no3d`** (momentum clásico) intacto, y el **build web** bajo 16 MB.
6. **Teclado+mouse, gamepad y táctil.** El táctil es el que se rompe: con cabeceo y alabeo
   comandados hay que decidir cómo se vuela con el dedo **antes** de dar E2 por cerrada.
7. **Relevo del escuadrón a mitad de pelea**: reentra con actitud sana (encarando, dentro del ring,
   fuera del casco) y con **fase y stagger persistidos**.

---

## 9. Trampas de este repo (releer antes de empezar)

1. **480×270 se convierte en sopa fácil.** Ya está anotado en `PROMPT_ARENA_VUELO_LIBRE` §4.6.
   Fases + barreras + patrones + escolta es mucha cosa: cada ítem se gana el píxel, y las
   trazadoras letales de E6 necesitan un lenguaje visual distinto del flak o no se entiende qué te
   mató.
2. **Todo fx nuevo necesita `life` mayor que su fusible.** El aviso de flak nació sin `life`, el
   filtro genérico lo mató en el mismo frame, y "el buque no disparaba" sin ningún error.
3. **`plane` (el store 2D) no es el avión del arena.** Con la base de orientación esto se acentúa:
   dejarlo escrito.
4. **`m3Palette()` sin snapshot revienta** — la escena quiere la paleta en el init.
5. **El mar mata a 3,5 m** y E1 invita a picar. Medir que el tirón de salida sea jugable con el
   resorte de la cámara de 3ª, que hoy está afinado para vuelo plano.
6. **`ALT_MAX` y la cámara están acoplados**: subir el techo sin cabeceo real deja el buque fuera
   de cuadro (era el motivo del 200). E1 antes que el techo, no al revés.
7. **La CAP de E9.1 no puede ser un muro.** Si los Harriers matan rápido, el reloj es un timer de
   fracaso disfrazado.
8. **El fallback sin 3D no recibe nada de esto.** Decidir explícitamente que se congela y
   escribirlo, o el próximo que lo abra va a creer que está roto.

---

## 10. Decisiones

### Cerradas por el autor (2/8/2026)

**D1 — En el ARENA, `↑/↓` son CABECEO, y el acelerador se va a los gatillos. SÍ.**
Es una divergencia de control deliberada entre PASILLO y ARENA: en el pasillo `↑` es "subir"
porque es un scroll lateral; en el arena `↑` es "morro arriba" porque es un avión. Consecuencias
que hay que ejecutar juntas, no de a una:

- el mapa de §7 pasa a ser normativo (no una propuesta);
- `cfg` suma **`arenaInv`** (invertir eje Y del arena) y su fila en OPCIONES — con cabeceo
  comandado, la opción de invertir deja de ser un lujo;
- la **pantalla de ayuda / los controles del arena** tienen que decirlo al entrar: el jugador
  viene de una hora de pasillo con otro esquema en los dedos. El cartel de `arena_hint` ya existe
  y es el lugar;
- el TÁCTIL queda sin esquema definido y **bloquea el cierre de E2** (ver §8.6).

**D2 — El arena corre su PROPIO ejecutor de maniobras, con el catálogo compartido. OK.**
`systems/moves.js` escribe `plane` y `run.mv*`, que son del PASILLO (2D, con `plane.y` como
altura de scroll); el arena tiene su propia base de orientación (§4.2) y no puede compartir el
ejecutor sin arrastrar ese estado. Lo que **sí** se comparte es `data/moves.js` — duraciones,
`steer`, `fire`, `turbo`, `tight`, `drift`— para que los números de una maniobra vivan en un solo
lugar y no se desincronicen entre fases.

> Escribir ambas en `ARQUITECTURA.md` cuando se implementen: son exactamente el tipo de decisión
> que la próxima persona va a querer revertir sin saber por qué está así.

### Abiertas

3. **¿Cuánto alabeo de cámara tolera 480×270?** Sale de probarlo, no de decidirlo (E2).
4. **¿El ring baja de 700 a 600?** Depende del radio de giro que quede tras E2.
5. **¿La niebla y la lluvia entran al arena ya, o después de E8?**
6. **¿Cómo se vuela el arena con el dedo?** Abierta por consecuencia de D1 — ver §8.6.

---

# Anexo A — Comparativa: quién resolvió este mismo problema

El problema exacto: **arena acotada, un solo blanco grande, vuelo libre, y que no se vuelva
aburrido ni mareador.** Cada juego resolvió una parte distinta.

| juego | qué es su arena | mecánica robable | cómo aplica acá | encaje |
|---|---|---|---|---|
| **Star Fox 64 — All-Range Mode** | esfera chica, un jefe al centro, vuelo libre | **U-turn** al llegar al borde, somersault, **freno/turbo**, tonel que **desvía** | es literalmente el mismo diseño. El U-turn resuelve el "me paso 7 s volviendo"; el freno, "paso de largo"; el tonel convierte una animación en defensa | **★★★** |
| **Armored Core VI** | arenas cerradas, jefes voladores por partes | **stagger / ACS overload**: daño sostenido llena una barra, al llenarse el jefe **se abre** y toma daño ×N | le da a la pelea un LATIDO: castigo → apertura → ráfaga. Hoy el buque solo tiene HP | **★★★** |
| **Panzer Dragoon / Rez** | rail + strafe, blancos múltiples | **lock-on por pintado**: mantenés el disparo pintando varios puntos, soltás y sale la salva | a 480×270, apuntar fino a un blanco 3D móvil es pelea perdida. Pintar mueve la destreza a *cuánto te animás a quedarte* | **★★★** |
| **Ace Combat 4 / 5 / 7** | cielo enorme, objetivos capitales | pasada de ataque, radio constante, **refuerzos por reloj**, armas especiales limitadas | la estructura dramática (E7, E9.1). El modelo de VUELO no sirve: pide kilómetros | ★★ |
| **Zone of the Enders** | arena 3D chica, un jefe | strafe desacoplado del rumbo + **cámara que encuadra el blanco sola** | resuelve "perdí el buque de vista" sin flechitas, y deja pelear de costado sin dejar de mirar | ★★ |
| **Crimson Skies** | cañones chicos, vuelo arcade puro | sin pérdida, giro generoso, **cañón balístico con adelanto** | es el punto de calibración de "arcade pero avión": el tono exacto que este juego quiere | ★★ |
| **Desert Strike / Jungle Strike** | base fija, das vueltas alrededor | **lista de blancos**, munición finita por tipo, volver a reabastecer | el molde del boss de TIERRA (E9.4) | ★★ |
| **Monster Hunter / Furi** | arena cerrada, uno contra uno | telegrafía → compromiso → **ventana de castigo**; fases con moveset nuevo | la gramática de un boss moderno: el jefe tiene tiempos muertos que SON tu turno | ★★ |
| **Rogue Squadron** | pasadas sobre capitales, trinchera | rutas de aproximación, suprimir torretas primero | valida E5/E6 y el orden de zonas | ★ |
| **Shadow of the Colossus** | el jefe ES el escenario | la **geometría del jefe es el acertijo** | `MOM_LAYOUTS` ya es eso: el radar del mástil y los motores al ras piden alturas opuestas | ★ |
| **Touhou / DoDonPachi** | pantalla fija, patrones densos | **graze** y patrones **aprendibles**, no azar | E4 + E6: la trazadora dibuja figuras, no se dispersa | ★ |
| **After Burner / Space Harrier** | rail, velocidad como espectáculo | velocidad por **cosas que pasan cerca**, lock-on múltiple | el abuelo del género y del lock-on de Panzer Dragoon. Valida E8 | ★ |

### Lo que NO hay que copiar

- **el modelo de vuelo de Ace Combat / IL-2** — un giro realista a 150 m/s tiene radio de
  kilómetros; en 700 m nunca terminás de virar (`PROMPT_ARENA_VUELO_LIBRE` §3.2 ya lo advierte);
- **la densidad de un bullet-hell** — a 480×270 y en 3D, cien proyectiles son sopa. La densidad
  sube con **patrones legibles**, no con cantidad;
- **el combate de energía de un simulador** — es lento, y este juego dura minutos, no horas.

---

# Anexo B — Trazabilidad

Que ningún hallazgo del diagnóstico quede sin dueño.

| hallazgo | § | lo resuelve |
|---|---|---|
| cabeceo topeado en 9° / arena en panqueque | 2.2 | **E1** |
| el avión derrapa 13,5° y el alabeo es cosmético | 2.3 | **E2** |
| el cañón alcanza toda la arena / es hitscan | 2.4 | **E5** |
| un esquive cada 1,5–4 s y nada entre medio | 2.5 | **E6** |
| las piruetas no existen en el clímax | 2.6 | **E3, E4** |
| la pelea se apaga en vez de escalar | 2.7 | **E7** |
| el roce medido que no puntúa | 2.8 | **E4** |
| el rociado de agua que vive solo en el pasillo | 2.8 | **E8** |
| `MOM_LAYOUTS` como mapa de altura sin eje vertical | 2.8 | **E1 + E5** |
| el progreso solo se ve en el HUD | 2.8 | **E8** |
| el buque muere con 5 s de fuego y el resto es viajar | 2.1 | **E3, E5, E6** |
| el modo no acumula nada entre batallas | — | **E9.2** |
| el nombre promete minutos que no existen | — | **E9.1** |
