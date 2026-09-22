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

## Resumen para la sesión que implementa

| # | Qué | Dónde toca |
|---|---|---|
| 1 | **El radar existe de M2 en adelante y se explica acá** | `missions.js`, UI · regla de campaña |
| 2 | Los poderes se enseñan en M2 — faltan las lecciones | diseño, `story.js`, `upgrades.js` |
| 3 | Si hay objetivo, hay cinemática | flujo de misión · regla de campaña |
| 4 | Cóndor cierra antes de jugar — falta escribir la línea | `story.js`, `SECUENCIAS` |
| 5 | 🔵 La Chancha: ¿primera vez en la vuelta de M2? | **esperando confirmación** |
| 6 | 🔵 Morir y relevo: qué pasa de M2 en adelante | **esperando decisión · toda la campaña** |

## Y lo que ya sabemos que hay que tocar igual

*Esto no son pedidos tuyos, es lo que falta en el código y en el guion. Está detallado en
`M2_LECTURA.md`, en «Lo que falta».*

El objetivo real (el puesto del islote) · la forma ida/objetivo/vuelta con `fases` · la línea de
Cóndor y la tarjeta, escritas para la misión vieja · `M02_HIST`, que no existe · la cara
`turco_ternura` de `M02_5`, que tampoco · y la cifra de muertos que bloquea la placa.

## Dónde está lo que ya decidiste antes

Las decisiones anteriores de esta misión están en **`../RESUELTOS_GUION.md`**, ítems M2-01 a M2-05,
todos cerrados. Lo que sigue abierto en todo el proyecto, en **`../PENDIENTES_GUION.md`**.
