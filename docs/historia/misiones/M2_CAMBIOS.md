# M2 · CAMBIOS PEDIDOS POR EL AUTOR

*El bautismo de fuego*

> **Esto manda sobre todo lo demás:** sobre el código, sobre `GUION_3.md` y sobre cualquier otra
> documentación.
>
> **Este documento NO se ejecuta en esta sesión.** Lo aplica otra sesión con acceso directo al
> código. Acá sólo se transcribe lo que pidió el autor y se marca qué toca cada cosa.

**Fecha de la tanda:** 18/9/2026 · **Estado general:** ⬜ pendiente de implementar.

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

---
---

# 1 · 🔴 EL RADAR EXISTE DE M2 EN ADELANTE, Y SE EXPLICA ACÁ

**Estado:** ⬜ · **Toca:** `missions.js`, UI del radar · **Alcance: toda la campaña**

**Pedido del autor, textual:**

> *"A partir de la misión 2, donde ya el objetivo es real y el radar existe, ahí sí se explica. Si
> ya los enemigos son reales, el radar existe porque es radar real inglés."*

**La regla que sale de esto:**

- **En M1 no hay radar.** Ni barra, ni medidor, ni UI. Sólo los avisos por voz de Cóndor y Puma
  cuando el jugador sube demasiado *(ver `M1_CAMBIOS.md`, pedido 6)*.
- **De M2 en adelante el radar existe de verdad**, con su interfaz, y **acá es donde se explica.**

**La justificación es diegética, no de tutorial:** el radar aparece cuando hay un radar inglés de
verdad apuntándote. No es una mecánica que se enciende: es una cosa que está ahí.

**Nota para quien implemente:** esto le da sentido al objetivo de la misión. El puesto avanzado del
islote **es** el radar que te está viendo — lo reventás y deja de verte. El objetivo y la
explicación de la mecánica son la misma cosa.

---

# 2 · LOS PODERES SE ENSEÑAN EN M2

**Estado:** ⬜ · **Toca:** diseño de M2, `upgrades.js`

**Pedido del autor, textual:**

> *"Poderes se enseñan acá."*

**Cierra la decisión que estaba abierta en `M1_CAMBIOS.md` (pedido 10):** M1 queda sólo con la UI y
el rasante a mano; **el momentum y el rasante como poder debutan en M2.**

**Por qué funciona:** el jugador llega a M2 habiendo sostenido la altura con el pulso y habiéndole
costado. Cuando le dan el poder que lo clava a ras, entiende para qué sirve porque sabe qué se
siente no tenerlo.

**Y encaja con el calendario que ya existe:** la primera mejora de la campaña se entrega servida
justo al terminar M2, y es **TERRAIN MASKING** — *"Si abajo no nos ven… ¿por qué subimos?"*.

---

# 3 · LA CINEMÁTICA VUELVE: SI HAY OBJETIVO, HAY CINEMÁTICA

**Estado:** ⬜ · **Toca:** flujo de la misión

**Pedido del autor, textual:**

> *"La cinemática ya en M2, si hay objetivo, tiene que estar."*

**La regla:** en M1 no hay cinemática entre la ida y la vuelta porque ahí las dos mitades se
explican con diálogo *(ver `M1_CAMBIOS.md`, pedido 5)*. **De M2 en adelante, toda misión con
objetivo real lleva su cinemática** entre el objetivo y la vuelta.

---

# 4 · CÓNDOR CIERRA ANTES DE QUE ARRANQUE EL JUEGO

**Estado:** ⬜ · **Toca:** `story.js`, orden de escenas de M2

**Confirmado por el autor:** *"Sí, bien. Cóndor tiene que terminar."*

Es la regla de campaña que se fijó en `M1_CAMBIOS.md` (pedido 3): **la última voz antes de que el
jugador tome el control es siempre la de Cóndor.**

**Qué falta en M2:** hoy las escenas previas son **La brecha** y **La ronda del mate**, y ninguna
termina con él. Hay que agregar el cierre de Cóndor después de la ronda.

**Nota para quien implemente:** no hay una línea de Cóndor escrita para esto. **Proponer y mostrar
antes de pegar** — el autor escribe sus personajes.

---

# 5 · 🔵 LA CHANCHA — dónde se usa por primera vez

**Estado:** 🔵 esperando confirmación

**Pedido del autor, textual:**

> *"La Chancha podemos mencionarla en M1, pero en M2 o en algún lado quizá usarla."*

**Lo que ya está decidido:** se **menciona** en M1, y **nunca se usa en la ida** — ningún avión sale
sin combustible *(ver `M1_CAMBIOS.md`, pedido 5)*.

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

**Falta tu confirmación.**

---

## 🔴 5b · HALLAZGO — la Chancha es lo que te compra las bombas

**Fecha:** 19/9 · **Estado:** ✅ **APROBADO COMO MECÁNICA A CONSTRUIR** · **Alcance: toda la
campaña** · No es para ya: queda en el backlog de sistemas.

De `ARMAMENTO_1982.md` §4, textual:

> *"El A-4B/C tiene **tres pilones**. Sin reabastecimiento: dos tanques de 300 galones + **una
> sola bomba** en el ventral. Con reabastecimiento: **tres bombas de 250 kg**."*

**La regla, dicha corta: o tres bombas, o tanques.** Las dos estaciones alares son las mismas.
El avión no tiene bodega interna: todo cuelga afuera y se ve.

### Lo que esto implica

**1 · El reabastecimiento tiene que pasar en la IDA.** No porque el avión salga sin nafta —sale
lleno— sino porque sale **sin tanques externos**, y esas dos estaciones las ocupa con bombas. El
Hércules cubre el combustible que el avión no está cargando.

⚠ **Esto contradice lo que quedó escrito en `M1_CAMBIOS.md`**, pedido 5 y pedido 7: *"la Chancha
no se llama en la ida, sí en la vuelta"*. Hay que resolverlo.

**2 · Se convierte en una decisión del jugador antes de despegar.** Con tanques: una bomba, vuelo
tranquilo, no dependés de nadie. Sin tanques: tres bombas, pero **tenés que encontrar al
Hércules** en el camino. Riesgo contra potencia de fuego. Es históricamente exacto y explica de
una el `MSL_MAX = 3` que ya está en el código.

**3 · El cobro de M10 ya está escrito.** Su briefing dice: *"el enemigo es el clima, la niebla y
la nafta. **La Chancha no baja más al sur.**"* Si la Chancha es lo que compra las tres bombas,
esa línea significa que **en M10 se vuela con tanques y una sola bomba, sin alternativa**. La
misión se endurece sola por guion, sin tocar un número de dificultad.

### ✅ LO QUE EL AUTOR APROBÓ (19/9)

**1 · La Chancha se puede llamar en la IDA y en la VUELTA.** Las dos. En la ida porque es lo que
te permite salir sin tanques; en la vuelta porque volvés con lo justo.
*(Esto reemplaza lo escrito en `M1_CAMBIOS.md` pedidos 5 y 7, que decía que sólo se llamaba en la
vuelta.)*

**2 · El jugador configura el avión antes de salir.** Dos tanques y una bomba, o sin tanques y
con las tres. Es una elección suya, no una perilla de dificultad.

### El peso se paga en velocidad — y el dato ya está

De `ARMAMENTO_1982.md` §5, con la palabra que importa subrayada:

> *"Velocidad máxima **1.057 km/h a 4.000 pies, limpio**. Crucero 798 km/h. Alcance de combate
> 1.835 km **limpio**."*

Y el perfil real, cargado:

> *"Carrera final a **~420 nudos (780 km/h) a 30 metros**."*

**Podía dar 1.057 y atacaba a 780.** Esa diferencia es lo que arrastra colgado. De ahí salen tres
cosas para el motor:

- **Más carga = más lento.** Tres bombas pesan menos que dos tanques llenos + una bomba, así que
  el avión sin tanques además debería ir un poco más suelto.
- **La vuelta es más rápida que la ida**, siempre, porque soltaste las bombas. El motor ya tiene
  media idea puesta: el tipo de fase `vuelta` gasta nafta a `0.85` por venir liviano. Falta que
  también vaya más rápido.
- **Y el alcance también es "limpio"**: 1.835 km sin nada colgado. Con tanques llegás más lejos
  pero más lento; sin tanques vas rápido pero dependés del Hércules.

### Para el arte
Los dos aviones se ven muy distinto y conviene que así sea: con tanques, dos pods largos y lisos
bajo las alas; sin tanques, tres bombas cortas y gordas. El jugador tiene que poder distinguir de
un vistazo con qué salió.

### Cuando se construya
Esto se saca de acá y se convierte en su propio documento en `docs/sistemas/`. Mientras tanto vive
en este archivo para no perderlo.

---

# 6 · 🔵 ¿Vuelve el relevo en M2?

**Estado:** 🔵 esperando decisión

En M1 quedó cerrado: **sólo se juega con Tero, y morir reinicia la misión** con pantalla negra de
reintentar o finalizar *(ver `M1_CAMBIOS.md`, pedido 7)*.

**Lo que no está dicho es qué pasa de M2 en adelante.** Hay dos caminos y son muy distintos:

**A) Vuelve el relevo.** Si te rompen el avión, seguís como Puma, después Gitano, Vasco, Pichón.
Cinco aviones son cinco vidas, y la campaña se endurece sola porque a medida que se muere gente
quedan menos. Es lo que el juego tiene hoy.

**B) Nunca se cambia de piloto.** Siempre Tero, en las catorce, y morir siempre reinicia la misión.
Más limpio de contar, pero **se cae el sistema de relevo entero** — y con él la idea de que el
escuadrón encoge.

**Falta tu decisión.**

---
---

## Resumen para la sesión que implementa

| # | Qué | Dónde toca |
|---|---|---|
| 1 | **El radar existe de M2 en adelante y se explica acá** | `missions.js`, UI · regla de campaña |
| 2 | Los poderes se enseñan en M2 | diseño, `upgrades.js` |
| 3 | Si hay objetivo, hay cinemática | flujo de misión · regla de campaña |
| 4 | Cóndor cierra antes de jugar — falta escribir la línea | `story.js` |
| 5 | 🔵 La Chancha: ¿primera vez en la vuelta de M2? | **esperando confirmación** |
| 5b | ✅ **O tres bombas, o tanques** — el jugador elige. La Chancha se llama en la ida y en la vuelta. Sin bombas el avión va más rápido | **aprobado · backlog de sistemas · toda la campaña** |
| 6 | 🔵 ¿Vuelve el relevo de pilotos en M2? | **esperando decisión** |

## Dónde está lo que ya decidiste antes

Las decisiones anteriores de esta misión están en **`../RESUELTOS_GUION.md`**, ítems M2-01 a M2-05,
todos cerrados. Lo que sigue abierto en todo el proyecto, en **`../PENDIENTES_GUION.md`**.

---
---

# ⚠ CORRECCIONES A `M1_CAMBIOS.md` — PENDIENTES DE ASENTAR

*El 18/9 el autor corrigió dos pedidos de M1, pero ese archivo estaba siendo editado por la sesión
de código y no se pudo tocar. **Quedan acá hasta que se puedan bajar a `M1_CAMBIOS.md`.***

### Corrección A — pedido 7 de M1: **sí se puede morir**

El pedido original decía que en M1 el jugador **no podía morir**, con un piso de vida que no se
traspasaba. **Eso cambió.** La versión que vale, textual:

> *"En misión 1 se puede morir, pero sólo se juega con Tero. Si se muere se reinicia la misión:
> pantalla negra, reintentar o finalizar."*

O sea:
1. **Sí se puede morir.**
2. **Nunca se cambia de piloto. Siempre Tero.**
3. **Morir no gasta una vida: reinicia la misión**, con pantalla negra y dos opciones —
   **REINTENTAR** o **FINALIZAR**.

Lo que **sigue en pie** del pedido original: el combustible sobra para la distancia · la Chancha no
se llama en la ida · si te dañás, habla Puma sobre el daño y la altura mínima.

### Corrección B — pedido 10 de M1: **resuelto, los poderes van a M2**

Estaba marcado 🔵 esperando decisión. **Resuelto el 18/9: los poderes se enseñan en M2.** M1 queda
sólo con la UI y el rasante a mano.

> ⚠ **Para quien esté ejecutando M1 ahora mismo:** el prompt original decía *"no implementes los
> pedidos 4, 10 y 11"*. El **10 ya está resuelto** y su resolución es *no hacer nada en M1* — o
> sea que sigue sin implementarse nada, pero ya no está abierto. Y el **pedido 7 cambió**: si se
> implementó como "no se puede morir", **hay que rehacerlo** según la corrección A.
