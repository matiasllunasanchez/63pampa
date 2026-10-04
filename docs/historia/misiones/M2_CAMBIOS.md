# M2 · CAMBIOS PEDIDOS POR EL AUTOR

*El bautismo de fuego*

> **Esto manda sobre todo lo demás:** sobre el código, sobre `GUION_3.md` y sobre cualquier otra
> documentación.
>
> **Este documento NO se ejecuta en esta sesión.** Lo aplica otra sesión con acceso directo al
> código. Acá sólo se transcribe lo que pidió el autor y se marca qué toca cada cosa.

**Abierto el:** 18/9/2026 · **Última revisión:** 19/9/2026, después de la pasada de M1.
**Estado general:** ⬜ pendiente.

---

## Cómo se usa

Escribí acá o decímelo por chat — si me lo decís hablando, yo lo asiento acá. No hace falta
formato.

| | |
|---|---|
| ⬜ | pendiente de implementar |
| 🔵 | tengo una duda, te pregunté |
| ✅ | hecho |
| ❌ | no se puede como está pedido |

**Reglas de esta sesión:** se copia textual, no se edita en silencio, y antes de discutir algo se
lee `../RESUELTOS_GUION.md`.

---
---

# 1 · 🔴 EL RADAR EXISTE DE M2 EN ADELANTE, Y SE EXPLICA ACÁ

**Estado:** ⬜ · **Toca:** `missions.js`, UI del radar · **Alcance: toda la campaña**

> **⚠ 3/10:** el autor movió la explicación del radar a M1 — ver `M1_CAMBIOS.md`, segunda ronda,
> pedido 15. El radar sigue existiendo en M2, pero **ya no es donde se enseña.** Este pedido queda
> abierto hasta que se cierre aquel.

**Pedido del autor, textual:**

> *"A partir de la misión 2, donde ya el objetivo es real y el radar existe, ahí sí se explica. Si
> ya los enemigos son reales, el radar existe porque es radar real inglés."*

**La regla que sale de esto:**

- **En M1 no hay radar.** Ni barra, ni medidor, ni UI. ✅ ya implementado: `radar: 'voz'`.
- **De M2 en adelante el radar existe de verdad**, con su interfaz, y **acá es donde se explica.**

**La justificación es diegética, no de tutorial:** el radar aparece cuando hay un radar inglés de
verdad apuntándote. No es una mecánica que se enciende: es una cosa que está ahí.

**Nota para quien implemente:** esto le da sentido al objetivo de la misión. El puesto avanzado del
islote **es** el radar que te está viendo — lo reventás y deja de verte. El objetivo y la
explicación de la mecánica son la misma cosa.

**Estado hoy:** el radar ya está prendido en M2 (`radar: 'normal'` por defecto) pero **no lo
explica nadie**. Falta la explicación, no la mecánica.

---

# 2 · LOS PODERES SE ENSEÑAN EN M2

**Estado:** ⬜ · **Toca:** diseño de M2, `upgrades.js`

**Pedido del autor, textual:**

> *"Poderes se enseñan acá."*

**Cerró la decisión que estaba abierta en `M1_CAMBIOS.md` (pedido 10):** M1 quedó sólo con la UI y
el rasante a mano; **el momentum y el rasante como poder debutan en M2.** ✅ La mitad de M1 ya
está hecha (`poderes: false`).

**Por qué funciona:** el jugador llega a M2 habiendo sostenido la altura con el pulso y habiéndole
costado. Cuando le dan el poder que lo clava a ras, entiende para qué sirve porque sabe qué se
siente no tenerlo.

**Y encaja con el calendario que ya existe:** la primera mejora de la campaña se entrega servida
justo al terminar M2, y es **TERRAIN MASKING** — *"Si abajo no nos ven… ¿por qué subimos?"*.

**Estado hoy:** los poderes ya están prendidos en M2, **pero no los enseña nadie.** Falta escribir
quién explica qué, con el molde de las nueve lecciones de M1 (`LEC_M1_*`, tipo `LECCION`, con
pausa y foco, y **sin que ningún personaje nombre una tecla**).

---

# 3 · LA CINEMÁTICA VUELVE: SI HAY OBJETIVO, HAY CINEMÁTICA

**Estado:** ⬜ · **Toca:** flujo de la misión

**Pedido del autor, textual:**

> *"La cinemática ya en M2, si hay objetivo, tiene que estar."*

**La regla:** en M1 no hay cinemática entre la ida y la vuelta — quedó como **un corte a negro de
~0,8 s** y la línea de Puma *«Hasta acá llegamos, Tero. Media vuelta y a casa.»*. **De M2 en
adelante, toda misión con objetivo real lleva su cinemática** entre el objetivo y la vuelta.

---

# 4 · CÓNDOR CIERRA ANTES DE QUE ARRANQUE EL JUEGO

**Estado:** ⬜ · **Toca:** `story.js`, `SECUENCIAS.storyM2`

**Confirmado por el autor:** *"Sí, bien. Cóndor tiene que terminar."*

Es la regla de campaña que se fijó en `M1_CAMBIOS.md` (pedido 3): **la última voz antes de que el
jugador tome el control es siempre la de Cóndor.**

**Qué falta en M2:** hoy `storyM2` es `['M02_1', 'M02_MATE', 'M02_TARJETA']`, y la última voz es la
del Turco. Hay que agregar una escena tipo `M02_PISTA` después de la ronda, como se hizo en M1.

**El molde de M1, ya implementado:** escena `M01_PISTA`, Cóndor dice *«Autorizada pista dos.
Mantenerse rasante. Buen vuelo, muchachos.»*, metida entre el ritual y la tarjeta.

**Nota para quien implemente:** no hay una línea de Cóndor escrita para esto. **Proponer y mostrar
antes de pegar** — el autor escribe sus personajes.

---

# 5 · 🔵 LA CHANCHA — dónde se usa por primera vez

**Estado:** 🔵 esperando confirmación

**Pedido del autor, textual:**

> *"La Chancha podemos mencionarla en M1, pero en M2 o en algún lado quizá usarla."*

**Lo que ya está decidido y hecho:** se **menciona** en M1 (Puma, `AV_M1_CHANCHA`) y **no se usa**
— `chancha: false`, porque su cita tarda ~35 s y la vuelta de M1 dura entre 8 y 20.

**Lo que falta:** en qué misión se usa por primera vez.

### Mi propuesta: primera vez en la vuelta de M2

Por tres razones.

**Primero, porque es la primera vuelta en la que la nafta importa de verdad.** Volvés perseguido,
con el avión raspado, después de haber gastado de más esquivando. Es el primer momento en que el
jugador quiere que aparezca.

**Segundo, porque la necesita M10.** El briefing de esa misión dice, textual: *"el enemigo es el
clima, la niebla y la nafta. **La Chancha no baja más al sur.**"* Esa línea sólo golpea si para
entonces la Chancha es una costumbre. Si se usa por primera vez tarde, el día que deja de venir el
jugador no extraña nada.

**Y tercero, porque le da a M2 su propio cierre.** La misión del bautismo de fuego termina con el
escuadrón volviendo raspado y encontrando al Hércules esperándolos. Es la imagen de que alguien te
está esperando afuera.

**El arco completo quedaría:** se menciona en M1 · se usa por primera vez en la vuelta de M2 · se
vuelve rutina · **y en M10 deja de venir.**

**Ojo con una cosa:** M2 no declara `fuelOn` ni `fuelScale`, así que **hoy el combustible en M2 es
lo que el jugador tenga puesto en sus opciones.** Si la Chancha debuta acá, M2 tiene que declarar
el combustible como lo declara M1, o la misión se puede jugar con el tanque apagado y la escena no
pasa nunca.

**Falta tu confirmación.**

---

# 6 · 🔴🔵 QUÉ PASA CUANDO TE MATAN — la decisión de campaña que quedó colgada

**Estado:** 🔵 esperando decisión · **Alcance: toda la campaña**

Esto hay que cerrarlo antes de seguir, porque toca las catorce misiones.

**Lo que se implementó en M1:** `sinMuerte: { golpe: 25, piso: 25, gracia: 1.2 }`. **No se puede
morir**, el golpe baja la chapa hasta un piso, nunca se releva, siempre Tero. Despega el escuadrón
entero pero **la única vida es la de Tero**, y el tablero lo muestra a él solo.

**⚠ Y acá hay una diferencia que hay que resolver.** El 18/9 dijiste, textual:

> *"En misión 1 se puede morir, pero sólo se juega con Tero. Si se muere se reinicia la misión:
> pantalla negra, reintentar o finalizar."*

**Eso no llegó al código:** M1 quedó como *no se puede morir*. Puede ser que hayas cambiado de
idea, o que la corrección se haya perdido en el camino. **Decime cuál de las dos vale.**

**Y lo que sigue abierto es M2 en adelante.** Hay dos caminos y son muy distintos:

**A) Vuelve el relevo.** Si te rompen el avión, seguís como Puma, después Gitano, Vasco, Pichón.
Cinco aviones son cinco vidas, y la campaña se endurece sola porque a medida que se muere gente
quedan menos. **Es lo que el juego tiene hoy en M2** (`roster: F5`).

**B) Nunca se cambia de piloto.** Siempre Tero, en las catorce, y morir siempre reinicia la misión
con pantalla negra. Más limpio de contar, pero **se cae el sistema de relevo entero** — y con él la
idea de que el escuadrón encoge.

**Falta tu decisión.**

---
---

# SEGUNDA RONDA — 3/10/2026

**El pedido del autor, textual y completo:**

> *"En mision 2, ya es la mecanica completa, debe haber y explicarse el silencio de radio porqe
> realmente la idea no es llamar la atencion. cuando se entra en zona de radar se calla la boca, si
> nos reconoce el radar se activan los harriers y nos disparan y vienen y debemos bajar para ahcer
> creer al enemigo que nos derroto (es cuando se van todas las alarmas)*
>
> *La mecanica qe se aprende es intentar tirar la bomba, errar muchas veces, intentar varias veces,
> qe no detone, y demas. El islote hoy existe, ya hay mecanica para eso en pasillo.*
>
> *TODO EL JUEGO OCURRIRA EN PASILLO POR AHORA CON TODAS SUS VARIANTES, momentum y pulso y arena y
> demas no se usan en nignuna mision"*

---

# 7 · El silencio de radio existe en M2, y se explica

**Estado:** ⬜ · **Toca:** `story.js`, charlas en vuelo, lecciones

> *"debe haber y explicarse el silencio de radio porqe realmente la idea no es llamar la atencion.
> cuando se entra en zona de radar se calla la boca"*

**Es el espejo exacto de M1.** En M1 la radio abierta es la táctica, porque quieren que los vean
(`M1_CAMBIOS.md`, segunda ronda, 17). En M2 es al revés: **al entrar a la zona de radar, nadie
habla.** El jugador ya vio la otra cara en la misión anterior, así que la regla se entiende sola.

**Nota para quien implemente:** las charlas en vuelo de M2 tienen que quedar **antes** de la zona
de radar o **después** de que se pierden las alarmas. Adentro, silencio.

---

# 8 · Si el radar te ve, vienen los Harriers — y se los engaña bajando

**Estado:** ⬜ · **Toca:** radar, estrellas, `estrellas.js`

> *"si nos reconoce el radar se activan los harriers y nos disparan y vienen y debemos bajar para
> ahcer creer al enemigo que nos derroto (es cuando se van todas las alarmas)"*

**La regla:** te detectan → suben las alarmas → **vienen los Harriers y te disparan**. Y la salida
no es escapar: es **bajar**, pegarse al agua, para que el enemigo crea que te derribó. **Ahí se van
todas las alarmas.**

**Se cruza con M1:** en `M1_CAMBIOS.md`, segunda ronda, 15, quedó la duda de **cómo se pierden
las estrellas**. Esta es la respuesta para M2 en adelante: bajando hasta que te den por muerto. Si
también vale para M1, el pedido 15 de M1 se cierra con esto.

---

# 9 · ⚠ Lo que se aprende en M2: tirar la bomba, y que salga mal

**Estado:** ⬜ · **Toca:** `missions.js` (`bombs` propias en m2), lecciones · **⚠ cambia lo
escrito**

> *"La mecanica qe se aprende es intentar tirar la bomba, errar muchas veces, intentar varias
> veces, qe no detone, y demas."*

**⚠ Esto da vuelta lo que decía `M2_LECTURA.md`:** *"Sin bombas propias, sin Pulso. Todo se
resuelve con el cañón."* **En M2 hay bomba propia, y es lo que se enseña.** Ya quedó marcado en la
lectura.

**El aprendizaje es el fracaso:** errar, volver a intentar, que la bomba no detone. **La mecánica
de que no se arme ya existe:** en `blanco.js`, *"por debajo la bomba no alcanza a armarse"*.

**Una cosa a tener en cuenta, no para cambiarla:** "la bomba que no detona" es también el corazón
de **M6** (*La bomba que no despertó*). En M2 se aprende que pasa; en M6 pasa cuando más duele.

---

# 10 · El islote ya existe como mecánica — M2 sólo tiene que pedirlo

**Estado:** ⬜ · **Toca:** `missions.js` (m2), `estructuras.js`

> *"El islote hoy existe, ya hay mecanica para eso en pasillo."*

**Tenía razón el autor y yo lo tenía mal.** En `M2_LECTURA.md` y en el panorama escribí que el
blanco de M2 "no existe en el código". **La mecánica existe:** `estructuras.js` (29/9) permite
blancos que no son buques, con `goal: { kind: 'estructura', nombre, dist }` — se encara, se suelta
y se le pasa por encima, igual que a un barco. **Lo que falta es que M2 lo pida:** hoy M2 sigue
declarando `goal: { kind: 'distance', meters: 2600 }`.

**Nota para quien implemente:** hoy hay **una sola** estructura en la tabla, `BASE COSTERA`, y
ninguna misión la usa. Tiene antena. Decidir si el puesto del islote **es** esa base, o si es un
renglón nuevo más chico.

---

# 11 · 🔴 REGLA DE CAMPAÑA: todo el juego ocurre en PASILLO

**Estado:** ⬜ · ✅ dudas resueltas el 4/10 · **Alcance: las catorce**

> *"TODO EL JUEGO OCURRIRA EN PASILLO POR AHORA CON TODAS SUS VARIANTES, momentum y pulso y arena y
> demas no se usan en nignuna mision"*

**Lo que toca hoy en el código:** M5 (*El callejón de las bombas*) y M14 (*El Tero*) declaran
`climax: 'arena'`. **Las dos tienen que dejar de hacerlo.** Pulso no lo pide ninguna misión.

**Dos dudas:**

- **La PASADA.** Hoy el final de toda misión con barco es *pasillo + pasada*: `pasada` es el
  `climax` por defecto. ¿La pasada cuenta como una variante del pasillo y queda, o también sale?

  **Respuesta del autor (4/10), textual:** *"No ya no seran mas pasillo"*

  **Confirmado por el autor (4/10), textual:** *"No sera nmas pasillo con pasada, solo pasillo"*

  ✅ **La pasada sale.** Ninguna misión termina en pasada: **sólo pasillo.**
- **"Momentum".** En el código la palabra nombra dos cosas: el **minijuego** de zonas críticas de
  cada barco (`ships.js`) y uno de los dos **poderes** (*Momentum y el Rasante*, `poderes` en
  `missions.js`). El pedido 2 de este documento dice que **el Momentum debuta como poder en M2**.
  ¿Sale sólo el minijuego, o también el poder?

  **Respuesta del autor (4/10), textual:** *"Momentum efecto poder si. Esta bien qe enseñemos el
  poder momentum en la mision 2"* · *"En la mision 1 no lo mostramos"*

  ✅ **Sale el minijuego, queda el poder.** El poder Momentum **se enseña en M2** —confirma el
  pedido 2— y **en M1 no se muestra**, que es como ya está (`poderes: false`).

**Cómo queda la regla, cerrada:** todo el juego es **pasillo, sin pasada**. No se usan en ninguna
misión el minijuego Momentum de zonas del barco, ni Pulso, ni Arena. M5 y M14 dejan de declarar
`climax: 'arena'`, y ninguna misión declara `climax`. **El poder Momentum sigue existiendo.**

---

## Resumen para la sesión que implementa

| # | Qué | Dónde toca |
|---|---|---|
| 1 | **El radar existe de M2 en adelante y se explica acá** | `missions.js`, UI · regla de campaña |
| 2 | Los poderes se enseñan en M2 — faltan las lecciones | diseño, `story.js`, `upgrades.js` |
| 3 | Si hay objetivo, hay cinemática | flujo de misión · regla de campaña |
| 4 | Cóndor cierra antes de jugar — falta escribir la línea | `story.js`, `SECUENCIAS` |
| 5 | 🔵 La Chancha: ¿primera vez en la vuelta de M2? | **esperando confirmación** |
| 6 | 🔵 Morir y relevo: qué pasa de M2 en adelante | **esperando decisión · toda la campaña** |
| 7 | El silencio de radio existe y se explica — espejo de M1 | `story.js`, charlas |
| 8 | Si el radar te ve vienen los Harriers; se los engaña bajando | radar, `estrellas.js` |
| 9 | ⚠ Se aprende a tirar la bomba, y que salga mal — **hay bomba propia** | `missions.js`, lecciones |
| 10 | El islote ya existe como mecánica: M2 tiene que pedirlo | `missions.js`, `estructuras.js` |
| 11 | **Regla de campaña: sólo pasillo.** Salen pasada, arena, pulso y el minijuego Momentum; el poder Momentum queda | **las catorce** · ✅ dudas resueltas |

## Y lo que ya sabemos que hay que tocar igual

*Esto no son pedidos tuyos, es lo que falta en el código y en el guion. Está detallado en
`M2_LECTURA.md`, en «Lo que falta».*

El objetivo real (el puesto del islote) · la forma ida/objetivo/vuelta con `fases` · la línea de
Cóndor y la tarjeta, escritas para la misión vieja · `M02_HIST`, que no existe · la cara
`turco_ternura` de `M02_5`, que tampoco · y la cifra de muertos que bloquea la placa.

## Dónde está lo que ya decidiste antes

Las decisiones anteriores de esta misión están en **`../RESUELTOS_GUION.md`**, ítems M2-01 a M2-05,
todos cerrados. Lo que sigue abierto en todo el proyecto, en **`../PENDIENTES_GUION.md`**.
