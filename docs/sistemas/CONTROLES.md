# CONTROLES — teclado y joystick, modo por modo

> **Estado: normativo.** Esta tabla es lo que `src/core/input.js` *hace*, leído del código el
> 22/8/2026. Si cambiás un binding, cambiás este documento **y** la tabla `ctrl*` de
> `src/data/strings.js` en los dos idiomas (esa tabla es la pantalla CONTROLES del juego).

---

## 1. La idea, en una frase

**Dos manos, y cada una tiene un trabajo fijo.** La que *esquiva* mueve el avión, la que *rola*
gira el horizonte y mueve la cámara. En el mando son los dos sticks; en teclado, `W A S D` es
**siempre** el izquierdo y las **flechas** son el derecho.

**Todo se juega con teclado O con joystick, sin excepción.** Ninguna acción vive en un solo
aparato: si una tecla hace algo, hay un botón que hace lo mismo, y al revés. Es una regla, no una
coincidencia — cuando se agregue una acción nueva, entra por los dos lados o no entra.

**El esquema no cambia entre modos.** Los cuatro modos jugables leen los mismos campos de `inp`.
Lo único que cambia es *qué significa* ese campo en el mundo de cada modo — `W` es gas en el
pasillo y cabeceo en el clímax, pero en los dos **el avión sube**. Ningún modo re-mapea nada.

---

## 2. Los modos (vocabulario)

| modo / fase | estado interno | qué es | sistema |
|---|---|---|---|
| **PASILLO** | `play` | el vuelo 2D con scroll lateral: el juego base | `systems/flight.js` |
| **DESPEGUE** | `takeoff` | la carrera y el ascenso, **guionados** — no se controla | `game.js` |
| **ARENA** | `arena` | el clímax en 3D libre: combate alrededor del buque | `systems/arena.js` |
| **PASADA** | `pasada` | el clímax de bombardeo: pasadas sobre el buque | `systems/pasada.js` |
| **BARCAZA** | `momentum` | cabina fija en cámara lenta; el mundo rola alrededor tuyo | `legacy/momentum.js` ¹ |
| **PULSO** | `pulso` | prueba de toques contra reloj (QTE) — no se vuela, se *teclea* | `systems/pulso.js` |

> ⚠️ **ARENA y PASADA están EN CUARENTENA** (`data/cuarentena.js`, PLAN_REFACTOR §4b, 18/8/2026):
> no tienen fila en JUEGO RÁPIDO y toda misión que declare ese clímax juega **EL PULSO** en su
> lugar. Los módulos siguen compilando y sus fixtures verdes, y se llega por sonda (`?pasada=`,
> `__prb('arena')`). Sus controles se documentan igual —el día que la cuarentena caiga tienen que
> seguir siendo estos— pero hoy **el único clímax que se juega es EL PULSO**.

> ¹ Vive en `src/legacy/` desde el refactor en curso, pero **el modo sigue vivo**: es el camino sin
> three.js, y su cabina (`legacy/momentum_render.js`) la reusan el arena y la pasada.

> **PERSECUCIÓN / MINUTOS SAGRADOS / PASADAS MORTALES / CICLO / POR LA PATRIA** son *modos de
> partida* (qué misión se juega), no esquemas de control: cada uno se juega con las fases de
> arriba y con estos mismos controles.

---

## 3. Tabla maestra — VUELO

`•` = hace eso · `—` = no existe en ese modo (la tecla no hace nada)

| acción | teclado | joystick | PASILLO | ARENA | PASADA | BARCAZA |
|---|---|---|:--:|:--:|:--:|:--:|
| **subir** | `W` · `↑`¹ | stick izq **arriba** | gas² | cabeceo | cabeceo | sube la mira |
| **bajar** | `S` · `↓`¹ | stick izq **abajo** | picada | cabeceo | cabeceo | baja la mira |
| **izq / der** | `A` `D` · `←` `→`¹ | stick izq · cruceta ←→ | esquivar³ | derrape fino | derrape fino | rola |
| **rolar** (girar el horizonte) | `Q` `E` · `←` `→`⁴ | stick der ←→ (analógico) | • | banquea = **vira** | banquea = **vira** | • ⁵ |
| **mirar arriba/abajo** | `R` `F` · `↑` `↓`⁴ | stick der ↑↓ (analógico) | • | — | — | — |
| **cañón** | `X` · `ESPACIO` · `K` · click izq | **R1** · `✕` | • | • | —⁶ | • |
| **misil** | `Z` · `TAB` · click der⁷ | **L1** · `□` | • | • | **suelta las bombas** | • |
| **turbo** | `SHIFT` · `C` | gatillo (R2) | • | • | • | — |
| **freno** | `F`⁸ | **L2** | — | • | • | — |
| **viraje de combate** (media vuelta) | `R`⁸ | `◯` | — | • | — | — |
| **reparto de energía** (pips) | `G` | cruceta **arriba** ¹ | — | • | — | — |
| **piruetas** | combos direccionales | ídem, los dos sticks | • | —⁹ | —⁹ | —⁹ |

1. Las flechas vuelan **solo con MIRA MÓVIL**. Ver §5.
2. **Si soltás `W`, el avión cae**: la gravedad tira siempre. Es la mecánica central del pasillo.
3. Con **CONTROL POR ALABEO** (OPCIONES), `A`/`D` banquean y el desplazamiento sale del banqueo.
4. Las flechas rolan y panean **solo con MIRA FIJA** (el default). Ver §5.
5. La barcaza no tiene desplazamiento lateral, así que rolan **las dos**: `A`/`D` y `Q`/`E`.
6. **En la PASADA no hay cañón**: la pasada es bombas. El botón del misil suelta la ristra.
7. El click derecho lanza misil en PASILLO, BARCAZA y ARENA — **no** en la PASADA.
8. `F` y `R` tienen dos trabajos que **nunca coinciden en el mismo modo**: en el PASILLO panean la
   cámara (no hay freno ni media vuelta que hacer), en el clímax frenan y viran.
9. Los combos solo se detectan en `play`. El clímax tiene sus propias maniobras (`aero.js`).

---

## 4. Tabla maestra — FUERA DEL VUELO

| acción | teclado | joystick | dónde |
|---|---|---|---|
| **pausa** | `ESC` | **START** | pasillo, despegue, barcaza, arena, pasada |
| **cámara** | `V` | cruceta **abajo** | arena y pasada: **cabina ↔ 3ª persona**. En el pasillo **no hace nada visible**: los zooms 1.5×–2.5× están desactivados (partían el raster del mar en rayas, ver `CAM_ZOOMS` en `game.js`) |
| **mira fija / móvil** | `CAPS LOCK` | — (con mando es **siempre fija**) | pasillo y barcaza |
| **cámara lenta** (MOMENTUM) | `4` | **SELECT** | solo pasillo |
| **LA CHANCHA** (reabastecer) | `5` | **cruceta ↑** ¹ | solo pasillo, y no en los modos de clímax suelto |
| **invertir el eje Y** | OPCIONES → EJE Y | `△` | **todo el juego a la vez** (ver §6) |
| **pista musical** | `1` / `2` | **L3** / **R3** | cualquier pantalla |
| **navegar menús** | flechas · `ENTER` · `ESC` | cruceta/sticks · `✕` · `◯` | todas |

¹ **La cruceta ↑ es "el poder del recurso del modo"**: reparto de energía en el ARENA, LA CHANCHA
en el PASILLO. Es un botón para dos poderes porque son la misma pregunta —administrar lo que te
queda— y **nunca coexisten**. El teclado los tiene separados (`G` y `5`) porque ahí no falta
espacio; lo que importa es que ninguna acción viva en un solo aparato.
| **elegir avión** | `←` `→` · `ENTER` | cruceta ←→ · `✕` | pantalla de avión |
| **ver la ficha histórica** | `H` | `□` | selector de misiones |
| **idioma** | OPCIONES → IDIOMA | ídem | *(la vieja tecla `L` ya no existe)* |

---

## 4bis. EL PULSO — el mismo vocabulario, con las dos manos o con el mando

La prueba **deletrea los mismos toques que las piruetas**: no hay controles nuevos que aprender.
Cada glifo de la autopista es una dirección, y la dirección se empuja con lo que tengas.

| token | glifo | teclado | joystick |
|---|---|---|---|
| `l` `r` `u` `d` | `←` `→` `↑` `↓` | `A` `D` `W` `S` (o las flechas con mira móvil) | **stick izq** · cruceta ←→ |
| `L` `R` | `⟳←` `⟳→` | `Q` `E` (o `←` `→` con mira fija) | **stick der**, eje X |
| `U` `D` | `↑↑` `↓↓` | `↑` `↓` con mira fija (o `F` / `R`) | **stick der**, eje Y |
| `Z` | el remate | `Z` · `TAB` | **L1 / LB** (y `□` / `X`) |

- Un **toque** es cruzar la zona muerta del stick y volver: un flanco, igual que apretar una tecla.
- El **remate es la acción de soltar**, no la letra `Z`: cualquier entrada de misil lo dispara. Con
  un mando conectado, el glifo deja de decir `Z` y dice el botón que hay que apretar.
- El eje Y invertido (§6) **también invierte los toques**: si `W` te hace subir, `W` es `↑`.

## 5. Las flechas tienen dos vidas, y la MIRA decide cuál

| mira | `↑ ↓ ← →` son… | por qué |
|---|---|---|
| **FIJA** (default) | el **stick derecho**: `←→` rolan, `↑↓` panean | las dos manos están en el teclado; tenés el mando entero sin mando |
| **MÓVIL** | **vuelan**, como `W A S D` | esa mano se fue al mouse a apuntar; lo que el mouse no cubre queda en `Q E` / `R F` |

Se alterna con `CAPS LOCK` o desde OPCIONES; las dos vías escriben el mismo `cfg.aim`.
**`W A S D` no cambia nunca**, en ninguna de las dos.

---

## 6. El eje Y es UNO SOLO

`cfg.invY` (fila **EJE Y** en OPCIONES → MEJORAS DEL PICHÓN; `△` la alterna en vivo y la guarda).

- Vale para **teclado y stick a la vez**, y para **los cuatro modos**.
- Se aplica en `core/input.js`, al traducir la tecla o el eje a `inp` — **no** en cada modo. Por eso
  ningún modo puede tener el eje al revés de otro.
- Default: **ARRIBA SUBE**.

> Hubo dos ajustes separados (`arenaInv`, solo clímax; `padInvY`, solo stick) y podían
> contradecirse: con el primero en SÍ, la pasada volaba invertida y el pasillo no, en la misma
> partida. Se unificaron el 22/8/2026 y las claves viejas se borran al arrancar.

---

## 7. Mapa del joystick (mapeo estándar, botones estilo PlayStation)

```
  stick izq  ↕  subir / bajar          stick der  ↔  rolar (analógico)
  stick izq  ↔  esquivar               stick der  ↕  mirar arriba/abajo (analógico)

  R1 (5)  cañón            L1 (4)  misil / bombas
  R2 (7)  turbo            L2 (6)  freno (clímax)
  ✕ (0)   cañón · OK       ◯ (1)   viraje de combate · VOLVER en menús
  □ (2)   misil            △ (3)   invertir el eje Y
  cruceta ↑ (12)  el poder del modo (energía / La Chancha)
  cruceta ↓ (13)  cámara            SELECT (8)  cámara lenta (MOMENTUM)
  cruceta ←→      esquivar · navegar menús
  L3 (10) / R3 (11)  pista musical ◄ / ►      START (9)  pausa
```

Zona muerta de los sticks: **0,35**. Cruzarla cuenta como un *toque* para los combos de piruetas,
así que un doble golpe de stick es un doble tap.

### Xbox: ya funciona, y los carteles se adaptan solos

El juego usa el **mapeo estándar** de la Gamepad API, y ahí el botón 0 es `✕` en PlayStation y `A`
en Xbox — **en la misma posición física**. Lo mismo con el resto: `◯`=`B`, `□`=`X`, `△`=`Y`,
L1/R1=LB/RB, L2/R2=LT/RT. Así que **un mando de Xbox se juega entero, sin configurar nada, y no
hace falta Steam Input**: los bindings son los mismos, no hay un perfil por familia de mando.

Lo único que cambia es cómo se **nombran** en pantalla. `core/input.js` mira el `id` del mando
(`padInfo.kind`) y la pantalla CONTROLES escribe `A / B / X / Y` y `LB / RB / LT / RT` cuando hay
uno de Xbox. Es una sustitución de texto sobre la tabla ya traducida, no una tabla aparte.

| | PlayStation | Xbox |
|---|---|---|
| botón 0 | `✕` | `A` |
| botón 1 | `◯` | `B` |
| botón 2 | `□` | `X` |
| botón 3 | `△` | `Y` |
| 4 / 5 | L1 / R1 | LB / RB |
| 6 / 7 | L2 / R2 (gatillo) | LT / RT |

> Si un mando reporta `mapping` distinto de `'standard'` (pasa con algunos Bluetooth en modo
> genérico), los índices no son estos y el juego volaría cualquier cosa. Por eso `pollGamepad`
> **prefiere el mando de mapeo estándar** cuando hay más de uno conectado.

---

## 8. Táctil (móvil)

| zona | acción |
|---|---|
| 62% izquierdo | arrastrar = volar (control directo por posición) |
| derecha arriba | mantener = cañón |
| derecha abajo | mantener = turbo |

En táctil no hay rolado, paneo ni piruetas por combo.

---

## 9. Huecos conocidos

Cosas que el código **hoy** no hace, anotadas para que no se descubran dos veces:

| hueco | detalle |
|---|---|
| **el click derecho no tira en la PASADA** | el handler del mouse cubre `play`, `momentum` y `arena`. En la pasada las bombas se sueltan solo con `Z`/`TAB`/`L1`/`□` |
| **no hay remapeo** | la pantalla CONTROLES es de solo lectura; las teclas están fijas en `core/input.js` |
| **el táctil no llega al clímax** | el arrastre está pensado para el pasillo; arena, pasada y pulso no tienen UI táctil propia |
| **`V` no hace nada en el pasillo** | `CAM_ZOOMS` quedó en `[1]`: la tecla beepea y muestra `CAM 1×`. La vista que la reemplaza (cabina en el pasillo) está en el ROADMAP |

---

## 10. Dónde vive cada cosa en el código

| qué | dónde |
|---|---|
| **todos** los bindings (teclado, mouse, táctil, pad) | `src/core/input.js` — es el único que escucha el DOM |
| qué estados dejan volar al pad | la lista `inGame` de `core/input.js`. **Una fase nueva que no entre ahí deja el mando muerto en el aire** |
| qué estados se pueden pausar | `PAUSABLE()` en `game.js` + la lista del `ESC` en `input.js` + `inGame`. Las tres tienen que coincidir |
| qué hace cada acción | los callbacks de `initInput()`, definidos en `game.js`. `input.js` no sabe qué significan |
| la pantalla CONTROLES del juego | filas `ctrl*` de `src/data/strings.js` (ES y EN) + la lista de `OPT_ROWS` en `game.js` |
| los combos de piruetas | `dirTap` en `input.js` (detector) + la tabla `combo` de `game.js` + `data/moves.js`. Referencia jugable: [PIRUETAS.md](PIRUETAS.md) |
