# PIRUETAS — las maniobras de combate

Las piruetas son los "poderes" de RASANTE: maniobras reales de caza que se ejecutan con un
**combo de dos toques direccionales**, al estilo de un juego de pelea. Mientras dura la maniobra
**el avión no se controla** — salvo el eje que cada una deja libre.

Catálogo (datos): [`src/data/moves.js`](../src/data/moves.js) ·
Ejecución (cinemática): [`src/systems/moves.js`](../src/systems/moves.js) ·
Detector de combos: [`src/core/input.js`](../src/core/input.js) ·
Resolución del par → maniobra: `combo` en [`src/game.js`](../src/game.js)

---

## ⚠️ Lo primero: "ALTO" y "BAJO" son la ALTURA DEL AVIÓN

Cuatro maniobras comparten combo con otra. Cuál sale **no depende de cómo apretás las teclas**:
depende de **a qué altura viene volando el avión en ese momento**.

> **`↓↓ alto` NO significa "abajo, abajo, y después arriba".**
> Significa: **apretar `↓↓` estando el avión en posición ALTA.**
>
> El combo es siempre el mismo — dos toques `↓`. Lo que cambia el resultado es tu **altitud**.

Es a propósito: el juego elige la maniobra que *tiene sentido donde estás*. Si venís alto y
apretás `↓↓`, lo que querés es **bajar rápido** (Split-S). Si ya venís a ras y apretás `↓↓`,
bajar no es una opción — lo que querés es **pegarte al terreno** (Terrain Masking).

### Los dos umbrales

| combo | umbral | por encima | por debajo |
|---|---|---|---|
| `↓↓` | **18 m** | **SPLIT-S** (hay cielo abajo para picar) | **TERRAIN MASKING** (ya estás bajo: pegate más) |
| `↑↑` | **14 m** | **HIGH YO-YO** (ya tenés altura: colgate arriba) | **POP-UP** (salís de rasante hacia arriba) |

Son umbrales **distintos** porque responden preguntas distintas: `↓↓` pregunta *"¿tengo aire
debajo para tirarme?"* y `↑↑` pregunta *"¿estoy lo bastante bajo como para que trepar sea la
jugada?"*. Viven en `MV_HI` / `MV_LO` (`src/data/moves.js`).

**Referencia de alturas** (el multiplicador del HUD te la dice sin mirar el altímetro):

| altura | multiplicador | qué sale con `↓↓` | qué sale con `↑↑` |
|---|---|---|---|
| 0 – 4.5 m | **×10** (rasante) | TERRAIN MASKING | POP-UP |
| 4.5 – 9 m | ×5 | TERRAIN MASKING | POP-UP |
| 9 – 14 m | ×2 | TERRAIN MASKING | POP-UP |
| 14 – 18 m | ×2 / ×1 | TERRAIN MASKING | **HIGH YO-YO** |
| 18 m – techo (68 m) | ×1 | **SPLIT-S** | HIGH YO-YO |

Regla práctica: **si el HUD marca ×10 o ×5, estás BAJO.** Si marca ×1, estás ALTO.

---

## Tabla de maniobras

`steer` = el único eje que seguís controlando durante la maniobra, a **media palanca** (estás
comprometido en la maniobra, no paseando). `perfil fino` = el avión pone las alas de canto: el
hitbox se encoge y el roce paga **+250** en vez de +75.

| combo | maniobra | dur. | controlás | dispara | turbo | perfil fino | qué hace |
|---|---|---|---|---|---|---|---|
| `←←` / `→→` | **BARREL ROLL** (tonel) | 0.55 s | — | ✔ | ✗ | ✔ | Tonel completo con dash lateral. La pirueta original del juego |
| `↓↓` **alto** | **SPLIT-S** | 0.95 s | lateral | ✔ | ✗ | ✔ | Medio tonel invertido + picada fuerte. **Gana velocidad**. Salida vertical hacia abajo |
| `↓↓` **bajo** | **TERRAIN MASKING** | 1.6 s | lateral | ✔ | ✔ | ✗ | Se clava a ras y se queda. **Congela el roce** y **descarga el radar enemigo** |
| `↑↑` **bajo** | **POP-UP** | 0.8 s | lateral | ✔ | ✗ | ✗ | Trepada brusca de ataque desde rasante |
| `↑↑` **alto** / `↑↓` | **HIGH YO-YO** | 1.0 s | lateral | ✔ | ✗ | ✗ | Sube, cuelga y recae sobre la misma altura. **Sangra velocidad** |
| `↓↑` | **LOW YO-YO** | 1.0 s | lateral | ✔ | ✔ | ✗ | Pica y remonta. **La que más acelera** (+35%) — altura convertida en velocidad |
| `↓←` / `↓→` | **BREAK TURN** | 0.7 s | vertical | ✔ | ✗ | ✔ | Viraje quebrado: tirón lateral violento hacia el 2º toque, banqueo a fondo |
| `←→` / `→←` | **S-TURN** | 1.1 s | vertical | ✔ | ✗ | ✔ | Se abre a un lado y **vuelve al carril**. Arranca hacia el 2º toque |
| `↑←` / `↑→` | **JINK** | 0.85 s | **nada** | ✔ | ✗ | ✔ | 4 quiebres laterales alternados e impredecibles. Rumbo fuera de tu control. **Amplitud según tu velocidad** |

**Cooldown compartido: 1.15 s** entre cualquier pirueta y la siguiente (incluido el tonel). No se
encadenan.

---

## Cómo se ejecutan

**Ventana del combo: 0.24 s** entre el primer toque y el segundo. Es corta a propósito: los pares
verticales (`↑↑`, `↓↓`) conviven con el bombeo de gas del vuelo normal, y con esa ventana solo un
doble toque intencional los dispara.

- **Teclado:** `←` `→` `↑` `↓` (o `A` `D` `W` `S`). Solo pulsaciones **frescas** — el auto-repeat
  de una tecla sostenida no cuenta.
- **Joystick:** el mismo detector. Cuenta el **flanco** de cada dirección: cruceta, o dos *flicks*
  del stick izquierdo cruzando la zona muerta.

> **Con el gas sostenido, los combos que empiezan con `↑` no salen.** El `↑` que ya tenés apretado
> llega como auto-repeat y se filtra. Soltá el gas un instante, hacé el combo, y volvé a dar gas.
> Es consistente con cómo se comporta un teclado real y no se considera un bug.

Al disparar una maniobra, su **nombre aparece sobre el velocímetro** y suena la ráfaga de aire.

**Se pueden apagar**: menú `[M]` → fila **PIRUETAS: SI / NO**. El tonel (`←←` / `→→`) queda
siempre: es la mecánica original del juego, no una pirueta nueva.

---

## Notas de diseño

**Por qué no se controla el avión.** Son "poderes" con compromiso: elegís la maniobra y la bancás.
El eje libre existe para que no se sienta una cinemática — podés corregir *dentro* de la maniobra,
pero no cancelarla.

**Se dispara en TODAS.** Incluso invertido: el cañón está montado en las alas y la puntería del
juego (mira libre con el mouse, o auto-apuntado) no depende de para dónde mire la panza. Las
piruetas sirven para **atacar**, no solo para esquivar.

> El Split-S llegó a tener el disparo bloqueado y era una incoherencia: el tonel clásico —que el
> jugador vive como *la misma cosa*, dar vuelta el avión— siempre había dejado disparar. El flag
> `fire` del catálogo sigue existiendo por si alguna maniobra futura sí necesita bloquearlo.

**El turbo sí es selectivo**: solo entra donde la maniobra es *de energía* (Low Yo-Yo y Terrain
Masking). En las demás el acelerador queda cortado.

**Economía de energía.** Las maniobras no son gratis y el intercambio es el del juego (altura ↔
velocidad):

| maniobra | efecto sobre la velocidad | medido desde 62 |
|---|---|---|
| **Low Yo-Yo** | `+34/s` modulado por la campana de la maniobra | **+35%** (62 → 84) |
| **Split-S** | `+26/s` durante la fase de picada | **+21%** (62 → 75) |
| **Break Turn** | `−16%/s` | ~62 → 55 |
| **High Yo-Yo** | `−14%/s` | ~62 → 54 |
| **Pop-Up** | `−10%/s` | ~62 → 57 |
| S-Turn · Jink · Terrain Masking | neutras | — |

(Los números medidos salen de simular cada maniobra aislada partiendo de `spd = 62`.)

> 📄 Hay una **propuesta** para que las piruetas de picada aporten más velocidad con turbo y sirvan
> para escalar los futuros escalones MACH: [VELOCIDAD_MACH.md §8](VELOCIDAD_MACH.md#8-aporte-de-velocidad-de-las-piruetas).
> Sin implementar.

**El Jink escala con la velocidad.** Sus cuatro quiebres no clavan la velocidad lateral: la
persiguen con aceleración limitada, así el gesto queda continuo (el salto de `vx` por cuadro bajó
de 93 a 8 u/s) y se lee como un latigazo en vez de un corte. Amplitud y autoridad salen de
`run.spd`, de modo que el barrido lateral crece con lo rápido que venías —7 u de barrido a 40 u/s,
12 a 110— mientras el *ritmo* de la maniobra no cambia.

**El sprite.** Las poses empinadas salen de la **hoja 2** de cada avión (`sheet2.png`: 9 alabeos ×
2 filas de cabeceo ±32°) — el ±14° de la hoja base es cabeceo de crucero y una maniobra brusca
tiene que *verse* brusca. El Split-S además **invierte el sprite** por rotación en pantalla: se ve
el avión panza arriba picando. La hoja 2 es opcional: el build web la descarta y el render cae a
las filas normales de la hoja base — la maniobra se juega igual, solo pierde pose.
