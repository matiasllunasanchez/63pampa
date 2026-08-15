# AVERIAS — los tres modelos de vida del avión

> **Estado: implementado y verificado (15/8/2026).** Pedido del autor: *"me gustaría tener varios
> sistemas de salud o vidas … configurable en opciones tanto para todos los modos"*.
>
> Vale para **todos los modos** (HISTORIA, CICLO, POR LA PATRIA, MINUTOS SAGRADOS) y para las dos
> fases (PASILLO y ARENA). A futuro es una de las perillas de la **dificultad**.

## 1. La regla que sostiene todo

> **Te DISPARAN → daño. CHOCÁS algo → muerte.**

El mar, el terreno, un mástil, una barranca o quedarse sin nafta matan **en los tres modelos**.
Esa es la regla del juego entero —*"el mar MATA"*— y suspenderla convertiría el rasante en un
paseo: si volar a ras dejara de tener consecuencia, el juego cambia de género.

Lo que sí puede perdonarse es lo que te **tiran**: antiaéreo, metralla, misil, la bola de fuego de
una bomba. En `core/damage.js` eso es literal — una causa tiene daño asignado o es fatal, y
`isFatal()` es simplemente "no está en la tabla".

## 2. Los tres modelos (fila `DAÑO DEL AVION` en OPCIONES → PARTIDA)

| id | en pantalla | qué hace |
|---|---|---|
| `squad` | **ESCUADRON** | El de siempre: un impacto y caíste. El escuadrón **es** la barra de vida. Es el default. |
| `integ` | **INTEGRIDAD** | El avión aguanta varios impactos y se va **degradando**. Al vaciarse cae, y recién ahí se gasta un avión del escuadrón. |
| `visual` | **INTEGRIDAD (VISUAL)** | La misma integridad y los mismos golpes, pero **sin tocar el desempeño**: el daño se ve y se cuenta, y el avión vuela igual hasta que se acaba. |

La fila va **pegada a ESCUADRON** porque las dos contestan la misma pregunta —cuánto aguanta el
jugador— y separarlas obligaba a leerlas dos veces. Persiste en `localStorage`
(`rasante_averias`).

## 3. Daño por causa (sobre 100 de integridad)

| causa | daño | de dónde viene |
|---|---|---|
| `death_gunfire` | 22 | metralleta del buque · trazadora de un caza |
| `death_aa` | 34 | antiaéreo del buque |
| `death_missile` | 45 | misil guiado (buque o tierra) |
| `death_bomb` | 50 | meterse en el hongo de una bomba |

Tres antiaéreos bajan un avión entero. **Medido en batalla real**, la escalera completa con armas
mezcladas: `100→78 (ok) · 78→56 (hit) · 56→11 (crit)` y al siguiente impacto, abajo.

## 4. Los escalones de avería (solo en `integ`)

| escalón | integridad | punta | respuesta | turbo | piruetas |
|---|---|---|---|---|---|
| `ok` | 100–76 | 1.00 | 1.00 | sí | sí |
| `hit` | 75–51 | 0.93 | 0.94 | sí | sí |
| `dmg` | 50–26 | 0.86 | 0.86 | **no** | sí |
| `crit` | 25–0 | 0.78 | 0.76 | no | **no** |

El último escalón deja **"lo básico"** que pidió el autor: volar y disparar, nada más.

Cómo se aplican, sin que el modelo de vuelo sepa que existe el daño:
- **PASILLO** — `systems/flight.js` multiplica `speedTarget()` por `spd` y le pisa el `run.boost`.
- **ARENA** — entra por el mismo `io` que los pips de energía (`turboMul` / `accMul`), que ya
  existía de S1. El escalón fue gratis ahí: el enchufe estaba puesto.
- **PIRUETAS** — el gate está en el dispatcher de combos de `game.js` y en `combatTurn()`.

## 5. Arquitectura

| archivo | qué |
|---|---|
| `core/damage.js` | **puro**: los tres modos, la tabla de daño, `isFatal`, los escalones, `applyHit`. Lo testea `tools/unit.js` (5 tests) |
| `systems/damage.js` | el **único dueño** de `run.integ`. `takeHit(cause)`, `fx()`, `tier()`, `shown()`, `resetDamage()` |

El patrón de uso en los sistemas es una sola línea, y es lo que hace que esto no se haya
desparramado por todo el código:

```js
if (dmg.takeHit('death_aa')) death = { death: 'death_aa' };
```

Si devuelve `false`, el avión sigue volando más averiado. **Los sistemas no saben en qué modo está
el juego ni cuánto aguanta el avión** — eso lo decide `systems/damage.js` con `cfg.dmgMode`.

Sitios cableados: ARENA (metralleta, antiaéreo, misil guiado) y PASILLO (bomba en el aire, misil,
trazadora). Todo lo demás —colisiones— sigue devolviendo `{ death }` derecho, como siempre.

## 6. Detalles que costaron

- **El relevo entra con el avión sano** (`damage.resetDamage()` al terminar la cinemática). Es lo
  que mantiene al escuadrón como vidas aunque el modelo sea por integridad: cada avión trae su
  propia chapa.
- **Aguantar un misil no es esquivarlo.** En `collision.js` el impacto sobrevivido hace `continue`:
  sin eso caía en el bloque de abajo y te pagaba los 75 puntos y el cartel de ESQUIVASTE, que
  estaban ahí porque antes no existía la posibilidad de sobrevivir a un impacto.
- **El popup grande sale solo al BAJAR DE ESCALÓN.** Un número cada vez que te rozan es ruido;
  *"AVERIADO — SIN TURBO"* es una noticia. Sin ese aviso, perder el turbo se lee como un bug.
- **La barra de integridad no se dibuja en modo ESCUADRON**, ni en el HUD del pasillo ni en el
  tablero del arena: ahí no existe, y una barra siempre llena sería una mentira ocupando lugar.

## 7. Pendiente

- **Daños estructurales VISIBLES** (el modo `visual` hoy muestra la barra, no el fuselaje):
  agujeros en el sprite, humo del motor, un ala colgando. Es trabajo de arte + `render/plane.js`,
  y es lo que le da sentido pleno al tercer modo.
- **Atarlo a la DIFICULTAD** cuando exista esa pantalla: `squad` para la difícil, `integ` para la
  normal, `visual` para la accesible es el reparto que sugiere el pedido original.
- **Reparación**: hoy la integridad solo baja. Si alguna vez hay bidones o pasadas por base, este
  es el lugar.
- **Balance con E6**: dentro de la burbuja del arena la presión está calibrada contra el modelo
  `squad` (un toque = muerte). Con `integ` la pelea se vuelve más permisiva; hay que rebalancear
  con el juego en la mano antes de atar los modelos a la dificultad.
