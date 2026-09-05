# EL TEATRO AÉREO — que el compañero pelee, sin que nada de eso te pueda pasar

*Pedido del 4/9/2026. Diseño exprés previo a implementar, según el workflow de
[PLAN_MANIOBRAS_FASES.md](PLAN_MANIOBRAS_FASES.md) §0: cuando el plan no existe, se escribe primero.*

---

## 0. La pregunta y la respuesta corta

> «¿Es posible agregar enemigos y misiles y municiones que disparen al compañero y que éste pueda
> esquivarlos, todo sin daño real? Compañero hace maniobra → maniobra y esquiva → maniobra, esquiva
> y destruye. Estarán en una parte del mapa inaccesible para el jugador.»

**Sí, y sale más barato de lo que parece** — porque casi todo ya está escrito y porque la parte
difícil de un combate (que sea justo) acá **no existe**: nadie puede perder.

Lo que hay que construir es poco, pero **la regla que lo ordena es una sola y hay que respetarla
entera**, o esto se convierte en la peor clase de bug: uno que mata al jugador por algo que él no
podía ver venir ni evitar. Esa regla está en §2.

---

## 1. Lo que ya existe *(y por eso el presupuesto es chico)*

| Ya está | Dónde | Qué aporta |
|---|---|---|
| **El Fiel que entra, vuela una pirueta y se va** | `systems/wingmv.js` (M1) | el actor, sus fases `entra > mv > sale`, el sobrepaso, la vida máxima |
| **Las 13 piruetas apuntando a cualquier cuerpo** | `systems/moves.js` (EL CUERPO) | las mismas curvas volándolas otro avión, sin una segunda copia |
| **Balas que se ven y NO pueden pegar** | `systems/caza.js` | el precedente exacto: *«no hay código de impacto para esas balas: no te pueden tocar ni por accidente»* |
| **EL DIRECTOR con timelines en data** | `systems/cine.js` + `data/cines.js` | la coreografía como **beats**, no como código; ya tiene un `who` reservado |
| **Explosiones y despiece** | `core/fx.js`, `systems/damage.js` (D0–D5) | morir bonito sin escribir una partícula nueva |
| **El menú MANIOBRAS de dos niveles** | `game.js` + `data/moves.js` (`MV_VISTAS`) | la puerta para mirar cada escena, ya construida |

Lo único que **no** existe es el reparto: unos blancos, unos tiros de utilería, y quién le apunta a
quién. Eso es este plan.

---

## 2. LA REGLA DE ORO: el teatro no está en las listas del juego

`core/world.js` tiene cinco listas, y **cada una es un contrato de daño**:

```
obstacles   con esto chocás y te matás
soldiers    a estos los atropellás
missiles    estos te matan
bullets     el cañón (tuyo, y los tracers que erran del Harrier)
pmissiles   los tuyos
```

**El teatro tiene sus propias listas y no toca ninguna de esas cinco.** Un blanco del teatro no está
en `obstacles`, así que la rutina de colisión **ni siquiera lo ve**: no hay un `if` que decida
perdonarte, no hay una distancia mínima bien elegida, no hay una bandera que alguien pueda apagar
sin querer dentro de seis meses. **No hay daño porque no hay código de daño**, que es una garantía
de otra naturaleza que "el daño está en cero".

Es exactamente lo que ya se hizo con el Harrier de LA COLA, y por el mismo motivo. El comentario de
`systems/caza.js` lo dice mejor de lo que puedo repetirlo acá: dispara y erra, y errar **es** el
contenido.

**Corolario que hay que tener escrito:** el día que alguien quiera que un tiro del teatro sí lastime
(§7), eso **no** se hace metiendo el tiro en `missiles`. Se hace con un verbo aparte, explícito y
apagado por omisión.

---

## 3. Dónde vive: la profundidad, que para el jugador es una constante

El pedido dice *"una parte del mapa inaccesible para el jugador"*. Ese lugar **ya existe y es
gratis**, pero no es una zona del piso: es **la profundidad**.

El avión del jugador vuela siempre a `PZ = 14` (`render/ctx.js`). No es una variable con topes: es
una **constante del juego**. Puede subir, bajar y moverse de costado, pero *no tiene forma de
cambiar su z*. El teatro vive detrás, a partir de `WINGMV.Z = 19` — donde los actores ya vuelan hoy.

No es una valla que el jugador podría saltar si encuentra el bug: **es una dimensión que para él no
se mueve**. Y de paso resuelve la lectura visual, que era el otro problema: más lejos = más chico y
más arriba en pantalla, así que la escena se lee como *lo que está pasando allá* y no como algo que
compite con el vuelo propio.

*(El carril lateral, `FLY_X = 38`, **no** sirve para esto y conviene decirlo para que nadie lo
intente: la cámara sigue al avión, así que "afuera del carril" se mueve con el jugador. La
profundidad no.)*

---

## 4. Cómo se esquiva sin jugar a los dados

Esta es la única decisión de diseño con filo del plan.

La tentación es simular: el blanco le tira al Fiel, el Fiel hace una pirueta, y *a ver qué pasa*.
Eso es una moneda al aire, y en una cinemática una moneda al aire sale mal la mitad de las veces:
el tiro le pega (y no hay daño, así que lo atraviesa y queda ridículo) o pasa a treinta unidades (y
no se lee como una esquivada, se lee como que nadie le apuntó).

**El tiro apunta a donde el Fiel YA NO VA A ESTAR.**

Se lanza contra su línea de vuelo *previa a la maniobra* —el punto que va a vacar—, con el tiempo de
vuelo calculado para llegar cuando la pirueta ya lo sacó de ahí. El proyectil pasa por el lugar
exacto que el Fiel ocupaba, tarde. Eso se lee como una esquivada **siempre**, y no puede pegar
**nunca**, porque no le está apuntando a él.

Es la misma idea del near-miss del juego, dada vuelta: acá el que roza es el otro.

Consecuencia práctica: **el tiro se pide después de la pirueta, no antes**. El orden manda, y el
fixture lo va a exigir.

---

## 5. Las fases

Siguen el pedido tal como está escrito —maniobra, después esquiva, después destruye— y se cierran
de a una, con `npm run check` verde y `feel` idéntico antes de pasar a la siguiente.

### TA0 · EL REPARTO *(el cimiento, sin nada nuevo en pantalla)*

Las listas propias y el ciclo de vida, con **cero** contenido nuevo:

- `blancos[]` y `tiros[]` en `systems/wingmv.js` (o en `systems/teatro.js` si el archivo pasa de
  ~250 líneas — se decide al escribirlo, no ahora).
- Cada uno con **tope duro de vida**, como los actores. La lección del director que se quedó
  pintando blanco para siempre vale igual acá: lo que entra en escena tiene escrito cómo se termina.
- `limpiar()` los saca junto con los actores (muerte, cambio de fase, reinicio).
- Render propio en `render/wingmv.js`, que ya recibe la foto por parámetro.
- **El fixture primero**: `npm run maniobras` sección 4 afirma que ni un blanco ni un tiro aparecen
  nunca en `obstacles`/`missiles`/`bullets`/`soldiers`. Esa aserción es la que hace que el resto del
  plan sea seguro, y por eso va antes que el resto del plan.

*Se ve:* nada. *Cuesta:* poco. *Compra:* que TA1–TA3 no puedan lastimar a nadie.

### TA1 · LES TIRAN Y ESQUIVA

- El blanco entra igual que un Fiel (reusa `entra()`, con su propia hoja de sprite enemiga).
- Dispara con la regla de §4: al punto que el Fiel vacía.
- El Fiel contesta con **una pirueta del catálogo**, elegida por la escena o sorteada entre las que
  se leen bien de costado (tonel, barril, break turn, split-S).
- Variante nueva en el menú MANIOBRAS: **«ESQUIVANDO»**, hermana de las tres que ya están.
- El fixture mide **la distancia mínima tiro↔Fiel** en cada muestra: tiene que quedar en una banda
  —ni encima (sería un impacto), ni lejos (no se leería)—. Un número, no una impresión.

### TA2 · EL FIEL TIRA Y DERRIBA

- Cañón y misil del Fiel, con **la misma estela** que el misil del jugador (una sola receta).
- El blanco muere con el despiece que ya existe (D0–D5): sin partículas nuevas.
- Cuántos caen es **dato de la escena**: `derriba: 1` / `'todos'` / `0` (los deja irse). El pedido
  dice *"algunos (o todos)"* y eso es una perilla, no una decisión.
- El fixture: el blanco muere, **y ni un puntaje, ni un contador de misión, ni una estadística se
  mueven**. Un derribo de utilería no acredita nada.

### TA3 · LA COREOGRAFÍA COMO DATO

Acá deja de ser un sistema y pasa a ser **escritura de escenas**. La coreografía se escribe como
beats en `data/cines.js`, que es lo que EL DIRECTOR ya sabe interpretar:

```js
{ t: 0.0, teatro: { blanco: 'harrier', lado: 'der' } },
{ t: 1.2, move: 'barrel', who: 'fiel' },        // el `who` ya está reservado en cine.js
{ t: 1.4, teatro: { tira: 'blanco' } },          // le tiran al lugar que acaba de dejar
{ t: 2.6, teatro: { tira: 'fiel', derriba: 1 } },
```

El `who` de `systems/cine.js` hoy sólo entiende `'player'` y ese es todo el cambio del lado del
director. Ninguna escena necesita una línea de JavaScript.

### TA4 · LAS ESCENAS DE VERDAD *(opcional, cuando haga falta)*

Escribir con esto los momentos del guion que lo pidan (la pasada de homenaje, un compañero que se
saca uno de encima mientras vos volás derecho). Ya no es sistema: es contenido.

---

## 6. Qué NO hace *(y conviene leerlo antes de tocar nada)*

1. **No entra en las cinco listas.** §2. Si una fase parece necesitarlo, la fase está mal pensada.
2. **No le apunta al jugador.** Ni con un tiro que erra. Un proyectil que pasa cerca tuyo enseña que
   el teatro te puede tocar, y esa lección es falsa; después nadie sabe cuál de los dos mundos está
   mirando.
3. **No acredita nada.** Ni puntos, ni derribos, ni multiplicador, ni combustible, ni estadísticas.
4. **No pelea con el jugador por el control.** Cero cambios en `flight.js`, en la colisión y en el
   HUD. Si el teatro obliga a tocar el vuelo propio, se paró donde no era.
5. **No sale de su profundidad.** Nada del teatro por delante de `PZ`. Es lo que hace que la regla
   se pueda ver, además de ser cierta.
6. **Ninguna fase se abre sin la anterior verde.** `npm run check` completo y `feel` idéntico.

---

## 7. La perilla de daño real *(apagada, y con su puerta ya elegida)*

El pedido la deja abierta: *"es todo sin daño realmente (a menos que lo indique yo)"*.

Cuando llegue ese día, **no** se hace metiendo un tiro del teatro en `missiles`. Se hace con un verbo
propio y explícito —`peligro: true` en el beat—, que es lo que convierte una decisión de puesta en
escena en una decisión de **juego**, escrita, visible y buscable con un grep. Un teatro que a veces
lastima no es un teatro con una bandera: es otro sistema, y merece su propia fase y su propio
fixture. Por eso queda anotado acá y no implementado.

---

## 8. El fixture

Todo cuelga de `npm run maniobras`, que ya tiene el molde. Secciones nuevas:

| Mide | Cómo |
|---|---|
| **el teatro no está en las listas** | contar `obstacles`/`missiles`/`bullets`/`soldiers` antes y después de una escena entera: mismo número |
| **el jugador queda intacto** | ya se mide en la sección 2 (`pj` en `__mvactordbg`): ni maniobra, ni empujón, ni cambio de estado |
| **el tiro erra y se lee** | distancia mínima tiro↔Fiel dentro de una banda, muestreada cuadro a cuadro |
| **todo se va** | ni un blanco ni un tiro vivos al final: los topes duros de vida se cumplen |
| **nada acredita** | puntaje, derribos y estadísticas idénticos antes y después |

---

## 9. Costo

| Fase | Tamaño | Riesgo |
|---|---|---|
| TA0 | chica | ninguno — no se ve nada, sólo prohíbe |
| TA1 | mediana | el único de diseño: que la esquivada se lea (§4 lo resuelve, el fixture lo vigila) |
| TA2 | chica | bajo — el despiece y las estelas ya existen |
| TA3 | chica | bajo — un `who` en `cine.js` y datos |
| TA4 | contenido | — |

---

## 10. Divergencias

### TA0 · EL REPARTO *(4/9/2026)*

1. **TA0 se ve, y tenía que verse.** El plan decía *"se ve: nada"*, y así escrito no era demostrable:
   con las listas vacías, la aserción de la valla se cumple sola y no prueba nada. Se agregó lo
   mínimo para poder **afirmarla**: un blanco que entra y cruza, y tiros de utilería que se lanzan
   por sonda. Sigue sin haber puntería ni coreografía —eso es TA1—, pero ahora hay algo que contar.
2. **Un blanco NO es un módulo nuevo: es un actor con otro bando.** Su entrada, su salida, su tope
   de vida y su lugar en el orden de pintor son los del Fiel, y si mañana la entrada cambia, cambia
   para los dos. Es `o.bando` en `wingmv.entra()` y una rama de sprite en el render. Un
   `systems/blancos.js` habría sido una segunda copia de la coreografía de M1.
3. **Hizo falta una fase `crucero`** (`entra(null, …)`): un actor sin maniobra que entra, se queda
   un rato y se va. No es un `sale` inmediato porque una escena necesita un momento en que el blanco
   **está ahí**, y no sólo entrando o yéndose. Un `id` que no existe se sigue rechazando: pedir una
   maniobra que no está es un error, no querer ninguna es una decisión.
4. **Los tiros sí son módulo propio** (`systems/teatro.js` + `data/teatro.js` + `render/teatro.js`).
   No son actores: no entran, no vuelan una figura y no salen — nacen, viajan y se mueren. Meterlos
   en `wingmv.js` habría sido juntar dos ciclos de vida distintos en un `update` con dos dueños.
5. **Se dibujan FRÍOS**, y es la misma decisión —y el mismo azul— que las trazadoras del Harrier de
   LA COLA. El naranja es el color de lo que lastima en este juego; un misil naranja cruzando la
   escena le enseñaría al jugador que el teatro lo puede matar, y esa lección es falsa. El bando
   tiñe apenas el núcleo: lo que tiene que leerse primero es que **ninguno de los dos es naranja**.
6. **La medición de la valla tiene que ser ATÓMICA, y ése fue el único tropiezo real.** El primer
   intento afirmaba `missiles === 0` y `score === 0` durante la escena, y falló: `missiles` llegó a
   48 y el puntaje a 6069 — **el sembrador del pasillo y la distancia**, no el teatro. La medición
   correcta lee las cinco listas, monta la escena y las vuelve a leer **dentro de una sola
   evaluación de JavaScript**: el bucle del juego no corre entre dos sentencias, así que el delta es
   del acto y de nada más. Se mide dos veces —al montar y **en el medio** de la escena—, porque que
   el primer cuadro esté limpio no dice nada de los que siguen: un tiro que se registrara al morir
   se vería en la segunda y no en la primera.
7. **La sonda de la valla cuenta también lo que se acredita** (`__listas()`: puntaje, derribos
   aéreos, disparos, impactos). Es la otra mitad de la misma promesa y sale gratis en la misma
   lectura atómica — cuando en TA2 empiecen a caer blancos, el guardián ya está puesto.
8. **`npm run maniobras` es el fixture del teatro** y no uno nuevo. Es la misma pregunta que ya
   contesta —"¿el catálogo de maniobras está sano?"— extendida a quién más las vuela; partirla en
   dos comandos sería partir la respuesta, que es el criterio con que la gramática de los combos vive
   ahí adentro desde M0.
9. `feel` idéntico (`486dd9da…`), `npm run check` exit 0, `lint:layers` sin whitelist nueva: los dos
   módulos de render toman su foto **por parámetro** y el sistema de tiros no importa nada del render
   —las distancias del teatro son números de puesta en escena, en `data/teatro.js`.


### TA1 · LA ESQUIVADA · TA2 · EL DERRIBO · TA3 · LA COREOGRAFIA *(4/9/2026)*

10. **Apuntar al punto vaciado NO ALCANZA, y el fixture lo demostró antes que ningún ojo.** Tres de
    cuatro piruetas medían impacto. El motivo es geométrico y vale escribirlo: **un tiro no se
    detiene en su blanco, sigue**. Si la línea de fuego queda alineada con la fuga del Fiel, el
    proyectil recorre el mismo pasillo que él — yendo hacia el mismo lado lo alcanza, viniendo de
    frente lo choca. El TONEL y el BREAK TURN se van de costado, y el blanco tiraba de costado.
11. **La solución no fue afinar un número: fue elegir la dirección en la que correrlo sirve.** La
    mira se desplaza sobre **la perpendicular común** a las dos rectas —la de la fuga y la de la
    línea de fuego—, o sea su producto vectorial. La distancia entre dos rectas que se cruzan,
    medida así, vale exactamente lo que uno corra la mira. `TEATRO.MARGEN` deja de ser una constante
    bien elegida y pasa a ser **una cota**: ninguna pirueta futura la puede romper, porque no depende
    de cómo sea la pirueta. Medido: 4,8 a 19,9 unidades de separación mínima en las cuatro.
    *(El caso degenerado —fuga y tiro casi paralelos, donde el producto vectorial se anula— cae en
    cualquier perpendicular a la fuga, que sirve igual porque ahí las dos rectas son casi la misma.)*
12. **Y antes que la matemática, la puesta en escena: el que tira se queda de su lado y el que
    esquiva se va para el otro.** El blanco cruzaba el cuadro como cualquier actor lateral y
    terminaba justo del lado hacia el que el Fiel escapaba. De ahí salieron `cruza: false` en
    `entra()` y el `dir` del Fiel derivado del lado del blanco. Sin esto la geometría del §11 tiene
    que trabajar el doble para arreglar un plano mal armado.
13. **El tiro espera a que haya fuga que leer** (`TEATRO.DESPEGUE`). En el primer cuadro de la
    pirueta el Fiel todavía está en su punto de partida: no hay dirección de escape, y apuntar
    "atrás" sería apuntar a cualquier lado.
14. **El impacto se mide contra el TRAMO recorrido, no contra el punto de llegada.** Un misil de
    utilería viaja a 260 u/s: en un cuadro avanza cuatro unidades y el radio de impacto son cinco.
    Probando sólo la posición final, el tiro **pasaba de largo por adentro del blanco** entre dos
    cuadros. Es el túnel de cualquier bala rápida, y la solución es la de siempre: distancia
    punto-segmento.
15. **`tirar()` se olvidaba de copiar `mata`.** Arma el objeto campo por campo en vez de quedarse
    con el que le pasan, así que el misil del Fiel llegaba **encima** del blanco y lo atravesaba sin
    que nadie dijera nada. Es el bug más caro de la fase y el más barato de arreglar; lo caro fue
    que estuvo tapado por el §16.
16. **Dos aserciones del fixture se cumplían solas, y eso es peor que una que falla.**
    · *"el blanco cayó"* se leía como *"el blanco ya no está"* — pero un blanco que se va cuando se
    le acaba el crucero también desaparece. Ahora hay un marcador de derribos, y sólo lo mueve un
    impacto.
    · *"el Fiel contestó"* se contaba **muestreando** los tiros vivos — y un misil que acierta vive
    menos que un cuadro, así que lo que se medía era el reloj del que mira. Ahora los disparos se
    cuentan por bando en el sistema. La distancia mínima **sí** se muestrea, porque es lo único que
    sólo existe cuadro a cuadro.
17. **La coreografía es REACTIVA, no una agenda con reloj.** Un segundo planificador de tiempos al
    lado del director serían dos relojes contando lo mismo, y el día que uno se corra el otro no se
    entera. Las dos preguntas se contestan mirando el estado de los actores: *"¿el Fiel arrancó su
    pirueta?"* y *"¿ya salió de ella?"*. El QUÉ y el CUÁNTO siguen siendo dato de la escena.
18. **`who: 'fiel'` NO se implementó, aunque estaba en el ejemplo del plan.** El verbo `teatro:`
    monta la escena entera, y un compañero solo se pide con `teatro: { tiros: 0, derriba: 0 }`. Un
    verbo más que nadie usa es peor que un verbo que falta: el primero envejece sin que nadie lo
    note.
19. **El misil del Fiel viaja a velocidad de misil y no a la máxima.** Con el tiempo de vuelo mínimo,
    disparaba y el blanco estallaba **en el mismo cuadro**: el "esquiva y contesta", que es toda la
    escena, no se llegaba a ver. Un misil que se ve ir es la mitad del plano.
20. **Pedir una escena a mano limpia lo anterior** (`__teatro`, `__teatrofilm`). La escena en sí no
    limpia —una timeline puede querer encadenar dos—, pero pedirla a mano es siempre "quiero ver
    ÉSTA": con lo anterior todavía en escena, el marcador venía sumado del pedido anterior y una
    prueba podía dar por buena una escena en la que no pasó nada.
21. **El derribo se pinta CALIENTE y no se contradice con el azul de los tiros.** Lo frío dice "esto
    no te puede tocar"; una explosión ya ocurrida no le puede pasar nada a nadie. Es una consecuencia,
    no una amenaza. La bola la pinta el teatro con su propia lista: `explodeAt` empuja la suya a
    `obstacles`, y ahí no entramos — las chispas sí son las de siempre, porque `parts` es humo y no
    un contrato de daño.
22. Cierre: `npm run check` exit 0 · 136 unit · `feel` idéntico (`486dd9da…`) · `lint:capas` sin
    whitelist nueva · las cuatro escenas de `npm run maniobras` §5 verdes y la del director en §6.
    **La perilla de daño real (§7) sigue sin implementar y con su puerta elegida.**
