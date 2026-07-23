# Roadmap — ideas y features a futuro

Backlog **vivo** de ideas. No son compromisos ni están priorizadas todavía: es dónde anotamos lo
que queremos explorar para no perderlo. Cada ítem conserva el número con el que se anotó, así se
puede referenciar ("hagamos el #3"). Donde ayuda, hay un puntero **Dónde tocar →** al mapa del
código ([ARQUITECTURA.md](ARQUITECTURA.md)).

> Las dudas históricas que salgan de estas ideas (sobre todo #18 y #19) van a
> [PREGUNTAS_HISTORICAS.md](PREGUNTAS_HISTORICAS.md), no acá. Acá va el **diseño de juego**.

## Por tema

- **Primera persona / momentum** — #1, #12, #13
- **Combate y enemigos** — #2, #9, #19
- **Movimiento y sensación de vuelo** — #3, #4, #8
- **Aviones** — #10, #11, #18, #19
- **Economía y progresión** — #5, #6, #11, #14
- **Mundo, terreno y aliados** — #15, #16, #17
- **Niveles y estructura** — #7, #14

---

## 1. Momentum en primera persona a velocidad de juego

Rearmar el momentum: cambiarlo por **cámara en primera persona**, pero con el **avance tal como
funciona hoy el juego** (no cámara lenta). **Un solo objetivo** a destruir, en pocos segundos y
**en movimiento**. Mismo control que el avión, pero en primera persona.

> Relacionado con #12 y #13.
> Dónde tocar → `systems/momentum.js` (lógica, hoy bullet-time) + `render/momentum.js` (cabina/visor).

- [ ] Prototipar la vista 1ª persona a velocidad real, un objetivo móvil.

## 2. Barra de vida + metralleta más larga

Darle **barra de vida a algunos enemigos** (no muerte instantánea). Y **aumentar la capacidad
máxima de la metralleta**: poder mantener el disparo un poco más de tiempo antes de recalentar.

> Relacionado con #9.
> Dónde tocar → enemigos en `systems/spawn.js` + `systems/collision.js`; el calor/recalentamiento
> de la metralla (`overheat`, `heat`) en `systems/flight.js`.

- [ ] HP a enemigos seleccionados (barra visible).
- [ ] Subir el techo de calor de la metralla / bajar la tasa de calentamiento.

## 3. Dashes de esquive cinemáticos

Agregar **dashes de esquive** hacia izquierda (**L1**) y derecha (**R1**). Podemos **reutilizar la
pirueta/tonel actual**, pero la **animación tiene que ser más cinemática** — no una voltereta de
un JPG.

> Dónde tocar → la pirueta ya existe: la dispara `core/input.js` (`roll`) y la anima
> `render/plane.js` (rotación del sprite). Hoy L1/R1 tienen otras funciones en el joystick →
> revisar el mapeo antes de asignarlas.

- [ ] Rehacer la animación del dash (más peso, estela, deformación) en vez del giro plano.
- [ ] Mapear el dash a L1/R1.

## 4. Más animaciones de vuelo

Sumar animaciones, **al menos una mientras vuela**: *bob* de vuelo + **micro-wobble** — una
oscilación sutil para que el avión **nunca quede congelado** en el aire.

**Acción pendiente:** probarlo en el preview y decidir si la inclinación se siente bien o si me
pasé / quedó corto. Las perillas son **0.42** (rotación), **0.26** (foreshortening) y **dt·9**
(suavizado).

> Dónde tocar → `render/plane.js` (esas tres perillas viven ahí; ya hay un bob básico, esto lo
> profundiza).

- [ ] Ajustar y validar el bob + micro-wobble en preview.

## 5. Sistema de monedas

La pantalla de fin **no acumula puntos en monedas**. Agregar un **sistema de monedas** (los puntos
—o parte— se convierten en moneda para gastar).

> Base de la economía: relacionado con #6 y
> #11.
> Dónde tocar → el recuento se arma en `freezeRun()` (`game.js`) y se dibuja en `render/screens.js`
> (`drawResults`).

- [ ] Convertir puntaje → monedas; persistir el saldo.

## 6. Dinámica de compra (roguelike y/o mercado)

Agregar alguna **dinámica de compra**: quizá **roguelike**, quizá **mercado**, o **ambos**.
Revisar cuál encaja.

> Relacionado con #5, #11 y
> #14.

- [ ] Definir modelo (roguelike vs mercado persistente vs mixto).

## 7. Niveles

¿Cómo estructuramos los niveles? (abierto)

> Ya hay diseño de campaña en [NIVELES.md](NIVELES.md) — punto de partida.

## 8. Más adrenalina en el vuelo rasante

Necesito **más adrenalina y complejidad** en los vuelos, los movimientos y el vuelo rasante.

> Relacionado con #3 y #4.

- [ ] Explorar mecánicas que suban la tensión a ras (obstáculos, ventanas de tiempo, riesgo/recompensa).

## 9. Más variedad y complejidad de enemigos

Más **variedad** y **complejidad** en los enemigos.

> Relacionado con #2.
> Dónde tocar → `systems/spawn.js` (tipos y aparición) + `systems/collision.js` (comportamiento).

## 10. Aviones con características distintas

Más **complejidad entre aviones**: características diferentes (velocidad, maniobra, armamento,
resistencia…).

> Relacionado con #18.
> Dónde tocar → `data/planes.js` (definición de aviones).

## 11. Reparaciones y mejoras

¿Sistema de **reparaciones**? ¿**Mejoras**? (abierto) — pieza de progresión/economía.

> Relacionado con #5 y #6.

## 12. Otro momentum de vuelo rasante

¿Una **nueva dinámica tipo "momentum"** pero de **vuelo rasante**? (abierto)

> Relacionado con #1 y
> #13.

## 13. Momentum a primera persona como "poder" en vivo

El **momentum lento** actual, **cambiable a primera persona si se quiere, DURANTE el juego**, como
un **"PODER"** que el jugador activa.

> Relacionado con #1 y
> #14.

## 14. Roguelike con poderes por nivel

¿**Roguelike** con **poderes por cada nivel**? (abierto)

> Relacionado con #6 y
> #13.

## 15. Reabastecimiento con el Hércules

Agregar **reabastecimiento de gasolina asociado al HÉRCULES**.

- **Por ahora:** el Hércules volando arriba con la manguera de gasolina conectada.
- **A futuro:** un **sobrevuelo manteniendo la conexión** con el Hércules por unos metros (mecánica
  de acople/mantener posición).

> Dónde tocar → mecánica de combustible (`run.fuel`) + un nuevo actor/obstáculo aliado en
> `systems/spawn.js`.

- [ ] Hércules como aliado con manguera (versión estática).
- [ ] Sobrevuelo con conexión sostenida (versión con skill).

## 16. Mejorar el nivel de tierra y los soldados

**Mejorar el nivel de TIERRA** y la **mecánica de soldados**.

> Dónde tocar → terreno land en `render/world.js` (`drawLand`), spawn de soldados en
> `systems/spawn.js`, impactos en `systems/collision.js`.

## 17. Nuevas mecánicas y terrenos

¿**Nuevas mecánicas** y **nuevos terrenos**? (abierto)

## 18. Jugar con los ingleses (asimetría)

Poder **jugar con los ingleses** para mostrar la **diferencia**: dar **facilidades de poderes y
tecnología** al inglés, **versus** un avión argentino, para que se sienta que con el argentino
**necesitás ser habilidoso** y con el inglés **está todo servido**.

Analogía guía: **dron estabilizado** (inglés) **vs dron acro personalizado** (argentino).

> Relacionado con #10 y
> #19.
> El *framing* es de diseño; cualquier dato concreto de tecnología/época va a
> [PREGUNTAS_HISTORICAS.md](PREGUNTAS_HISTORICAS.md).

## 19. Radares ingleses vs base terrestre argentina

**Aviones ingleses** con **radares de cercanía incorporados**. **Aviones argentinos** que
**requieren que les avise una BASE DE TIERRA** → agregar la **mecánica de base terrestre**.

> Relacionado con #10 y
> #18.
> Dónde tocar → la detección/radar hoy vive en `systems/flight.js` (`detection`); la base terrestre
> sería un sistema nuevo que alimente ese aviso.
