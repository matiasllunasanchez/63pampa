# LA CARGA Y LA CHANCHA

*O tres bombas, o tanques. Y el Hércules que decide cuál.*

> **Estado:** ✅ **aprobado por el autor como mecánica a construir** (18/9/2026) · **backlog de
> sistemas**. No se implementa ahora: entra en la pasada de implementación, cuando las catorce
> misiones estén resueltas. Palabras del autor: *"anotá todo eso, cuando tenga resueltas las
> misiones se implementan los cambios pertinentes en todo el juego"*.
>
> Este documento existe porque la decisión **se perdió una vez** al reescribir
> `historia/misiones/M2_CAMBIOS.md`. Acá no depende de ninguna misión.

---

## La regla, dicha corta

**O tres bombas, o tanques.** Las dos estaciones alares son las mismas: lo que ocupa el tanque no
lo puede ocupar la bomba. El avión **no tiene bodega interna** — todo cuelga afuera, y se ve.

**Palabras del autor:**

> *"Si lleva tres bombas no lleva tanques, y si lleva tanques lleva una sola bomba."*

> *"Anotá como mecánica para ajustar a futuro, para que la Chancha se pueda llamar tanto en la IDA
> como en la VUELTA… Imagino que si no tenía bombas era más rápido, ¿no?"*

---

## Por qué es cierto

Está en `../historia/ARMAMENTO_1982.md`, §4 y §5, y no hay que inventarle nada:

- El A-4B/C tiene **tres pilones**.
- **Sin reabastecimiento:** dos tanques de 300 galones + **una sola bomba** en el ventral.
- **Con reabastecimiento:** **tres bombas de 250 kg** — es lo que se hizo el 30 de mayo contra el
  *Invincible* y el 8 de junio en Bahía Agradable.
- Velocidad máxima **1.057 km/h, limpio**. Con tanques y bombas colgando, no.
- **Había dos aviones cisterna en toda la guerra.** Para el ataque del 30 de mayo se reservaron
  los dos.

> *"Qué cambia: sin reabastecer → dos tanques y una bomba. Reabasteciendo → tres bombas o llegar
> con tanques llenos al punto de ataque. **Es una decisión de carga, y es jugable.**"*
> — `ARMAMENTO_1982.md` §5

---

## Las tres cosas que cambian en el juego

### 1 · El reabastecimiento pasa también en la IDA

Hasta ahora la Chancha era cosa de la vuelta. **Con esta regla tiene que poder llamarse en las
dos**: si salís cargado de bombas, salís sin tanques, y entonces el Hércules no es un lujo del
regreso — es lo que te permite llegar.

⚠ **Esto contradice lo que quedó escrito en `M1_CAMBIOS.md`, pedidos 5 y 7**, donde la regla era
*"la Chancha no se llama en la ida: ningún avión sale sin combustible"*. Esa regla vale para M1 y
para cómo está armado el juego hoy. **Cuando esta mecánica entre, hay que revisarla.**

### 2 · Es una decisión del jugador antes de despegar

Elegís la carga en el hangar, y es un trueque de verdad:

| | tres bombas | tanques + una bomba |
|---|---|---|
| poder de fuego | tres tiros al blanco | uno solo |
| alcance | **corto**: dependés de la Chancha | te alcanza la nafta |
| velocidad | más liviano al soltarlas | más pesado y más lento |
| riesgo | si la Chancha no viene, no volvés | llegás, pero con una sola chance |

**Y se ve.** El avión sale del hangar con lo que elegiste colgando de las alas. No hay un número en
una pantalla: hay tres bombas o dos tanques ahí abajo.

### 3 · Sin bombas, el avión va más rápido

Una vez que soltaste, el avión queda limpio y **se nota**. Es el premio por haber tirado, y le da
sentido físico a que la vuelta sea distinta de la ida.

---

## Lo que esto le regala a la campaña, gratis

El briefing de **M10** ya dice, textual: *"el enemigo es el clima, la niebla y la nafta. **La
Chancha no baja más al sur.**"*

Hoy esa línea es una frase. Con esta mecánica es **un cobro**: si el jugador viene eligiendo su
carga desde M2 y contando con el Hércules, el día que le dicen que no baja más, la frase le saca
una opción de la mano. No hay que escribir nada nuevo — ya está escrito.

---

## Lo que falta decidir cuando se implemente

- **Desde qué misión se elige la carga.** No puede ser M1 (no hay bombas propias) ni M2 (el
  objetivo se revienta a cañón). El primer candidato real es **M3 o M4**.
- **Qué pasa si la Chancha no llega** — si es una misión perdida, un aterrizaje de emergencia, o
  una escena.
- **Cómo se pide la Chancha en la ida** sin romper el silencio de radio, que es la mitad de la
  tensión del pasillo.
- **Si las misiones fijan la carga** o siempre la elige el jugador. Hay misiones donde el guion ya
  dice qué llevaban.

---

## Cargar y fallar — pedido del autor, 9/10

> *"ALGUNAS NAVES skyhawk no llegaban a cargar combustible y debian regresar, quiza podemos
> implementar eso (...) incluso si el jugador no carga correctamente el juego tendria qe decirte no
> pudiste recargar, tenes qe volver a base o algo asi."*

**Si el jugador no logra cargar de la Chancha**, el juego se lo dice y lo manda de vuelta a la base.
Era un problema frecuente en 1982. Detalle y dudas en `../historia/misiones/M5_CAMBIOS.md` · 5.

---

## Cuántos se volvían por fallas — la cuenta con lo que contó el autor (17/10)

*Pregunta del autor: "de todo lo que te conté, cuál es la probabilidad aproximada de las fallas que
tenían los aviones al salir y tener que volverse". Cuenta sobre las salidas donde dio cifras
(`historia/misiones/CRONOLOGIA_1982.md`). **Es una muestra, no una estadística oficial**, y tiende a
exagerar: se anotaron las salidas donde algo falló.*

| Día | Salida | Salieron | Se volvieron por fallas | Causa |
|---|---|---|---|---|
| 25/5 | A-4B | 5 | 1 | falla |
| 8/6 mañana | A-4B | 8 | 3 | **carga de combustible** |
| 8/6 mañana | Dagger | 6 | 1 | parabrisas |
| 8/6 tarde | A-4B | 6 | 2 | **carga de combustible** |
| 12/6 | Canberra | 4 | 3 | fallas |
| 12/6 mañana | A-4 | 4 | 4 | **carga de combustible** |
| 12/6 | 4 aviones | 4 | 2 | uno roto tapa la pista |
| 12/6 noche | Canberra | 2 | 2 | altímetro |
| 12/6 medianoche | Canberra | 2 | 1 | falla |
| 13/6 | A-4 | 8 | 1 | **carga de combustible** |
| 13/6 | Dagger | 6 | 2 | no despegan |
| 13/6 | Dagger | 6 | 2 | no despega + falla |
| 13/6 noche | Canberra | 2 | 0 | — |
| **Total** | | **63** | **24** | **≈ 38 %** |

**Por etapa:** hasta el 8 de junio, **7 de 25 (≈ 28 %)** · el 12 de junio, **12 de 16 (75 %)** · el 13,
**5 de 22 (≈ 23 %)**.
**Por avión:** A-4 **11 de 35 (≈ 31 %)**, casi todo por la **carga** · Dagger **5 de 18 (≈ 28 %)** ·
Canberra **6 de 10 (60 %)**.

**Para el juego (propuesta):** M1–M4 sin fallas (es aprendizaje) · M5–M9 **una de cada cinco** salidas
puede fallar la carga · M10–M12 **una de cada tres** · M13 **más de la mitad**: el desgaste se siente.

