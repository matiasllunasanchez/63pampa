# M3 · CAMBIOS PEDIDOS POR EL AUTOR

*El invento*

> **Esto manda sobre todo lo demás:** sobre el código, sobre `GUION_3.md` y sobre cualquier otra
> documentación. Si acá dice una cosa y el juego dice otra, gana lo que está acá.
>
> **Este documento NO se ejecuta en esta sesión.** Lo aplica otra sesión con acceso directo al
> código. Acá sólo se transcribe lo que pidió el autor y se marca qué toca cada cosa.

**Abierto el:** 27/9/2026, después de poner `M3_LECTURA.md` en el formato de M1 y M2.
**Estado general:** ⬜ cinco pedidos (4/10).

---

## Cómo se usa

**Escribí acá, o decímelo por chat — da igual.** Si me lo decís hablando, yo lo escribo acá para
que quede asentado. Este archivo es el registro, no el canal.

**No hace falta ningún formato.** Escribí como te salga: *"la línea del Gitano no me gusta, que sea
más corta"* alcanza. Si no me queda claro, te pregunto antes de tocar nada.

**Reglas que me impuse, después de meter la pata:**

1. **Al transcribir se copia textual.** Si algo me hace ruido, lo levanto como pedido acá; no lo
   edito en silencio ni te ofrezco "mejoras" que no pediste.
2. **Antes de abrir una discusión, leo `RESUELTOS_GUION.md`.** Ahí están tus decisiones tomadas —
   93 ítems cerrados. Lo que ya está decidido no se vuelve a preguntar.
3. **Este archivo es para cosas nuevas**, las que salgan de leer el documento de lectura. Lo viejo
   ya tiene su lugar.

Cada pedido lleva un estado, y lo actualizo yo:

| | |
|---|---|
| ⬜ | pendiente — está pedido, no lo toqué |
| 🔵 | tengo una duda, te pregunté |
| ✅ | hecho — abajo digo qué archivo toqué |
| ❌ | no se puede como está pedido — abajo digo por qué y qué alternativa hay |

---

# PEDIDOS

## Lo que pidió el autor el 4/10 — la escalera de aprendizaje

*Está entero en **`ESCALERA_DE_APRENDIZAJE.md`**. Lo que toca a M3:*

> *"Mision 3: Ya hay objetivo, se aprende concepto de bombas, en las otras dos misiones no llevamos
> bombas, la velocidad era mas rapida, ahora es mas lento, El obejtivo es el puesto de una isla
> quiza, aprendemos el concepto de lanzar bomba y secuencia uno a uno de diferents oportunidades,
> la distancia es mucho mas larga, "real". Se suma la chancha y demas. Al finalizar la mision 3 se
> aprenden los conceptos de MEJORAS DE PICHON, se gana una mejora del estilo "Pichón encontró una
> mejora para tu avion y Turco la aplicó"*
>
> *Cada cierto tiempo pichón y turco te sugerirán mejoras qe podrás elegir, bla bla bla, roguelike.*
>
> *(REVISAR las mejoras) A partir de cada fin de mision de todas las qe siguen hay mejoras
> seleccionables, el usuario selecciona entre 2 mejoras."*

**⚠ Esto da vuelta lo que decía `M3_LECTURA.md`:** M3 deja de ser *"la misión más liviana de la
campaña, sin enemigos ni bombas"*. **Las escenas del hangar no se tocan.**

---

## 1 · Primera misión con objetivo: el puesto de una isla

**Estado:** ⬜ · **Toca:** `missions.js` (m3), `estructuras.js`

**El blanco es, probablemente, el puesto de una isla** —el autor dijo *"quizá"*—. **Viene de M2:**
es el islote que el 3/10 se había puesto en M2 (`M2_CAMBIOS.md` · 10). **La mecánica existe:**
`goal: { kind: 'estructura' }`, con la única estructura cargada hoy, `BASE COSTERA`.

**Reemplaza a las boyas y el radar portátil** que había en el guion.

**Y con objetivo, hay cinemática** (regla de `M2_CAMBIOS.md` · 3): **la primera es en M3.**

## 2 · Se aprenden las bombas — y salen mal

**Estado:** ⬜ · **Toca:** `missions.js`, lecciones

Lanzar la bomba, **oportunidad por oportunidad**: errar, volver a intentar, que no detone. **Viene
de M2** (`M2_CAMBIOS.md` · 9, 3/10). Que la bomba no se arme por tirarla bajo **ya existe**
(`blanco.js`).

## 3 · Con bombas, el avión va más lento

**Estado:** ⬜ · **Toca:** física de carga

En M1 y M2 se vuela sin bombas y más rápido. **Desde M3, más lento.** Coincide con lo ya aprobado
en `../../sistemas/PLAN_CARGA_Y_CHANCHA.md` (sin bombas, más rápido).

## 4 · La distancia es mucho más larga, "real" — y está la Chancha

**Estado:** ⬜ · **Toca:** `missions.js` (m3: `goal`, `fases`)

Hoy M3 es una tirada de 2.400 m. Pasa a ser **mucho más larga**, con forma de ida, objetivo y
vuelta, y **la Chancha**, como en todas desde M2.

## 6 · Primera misión con silencio de radio, y con dos Harriers por estrella

**Estado:** ⬜ · *Consecuencia de lo decidido el 4/10 para M2 — a confirmar*

- **Silencio de radio.** En M1 y M2 se habla porque son diversión y tutorial. **M3 es la primera
  misión con objetivo**, así que es la primera donde, al entrar en zona de radar, nadie habla. Lo
  que el 3/10 se había pedido para M2 (`M2_CAMBIOS.md` · 7) viene a parar acá.
- **Dos Harriers por estrella**, como en todas las misiones salvo M2 (`M2_CAMBIOS.md` · 14).

## 5 · Al terminar, la primera mejora — servida

**Estado:** ⬜ · **Toca:** `upgrades.js`, escena de cierre · *(el autor marcó: REVISAR las mejoras)*

*"Pichón encontró una mejora para tu avión y Turco la aplicó."* **Es la primera de la campaña, y no
se elige.** **De M4 en adelante**, al final de cada misión, **se elige una entre dos.**

**Cambia el calendario de `upgrades.js`:** hoy es *M2 una servida, M3+ a elegir*; pasa a ser *M3
una servida, M4+ a elegir.*

**Encaja solo con la historia:** *El invento* —el Pichón trepado al avión de Esteban y el Turco
diciendo *"a ver, mostrame"*— abre esta misma misión. **La mejora que se gana al final es la que el
pibe estaba tocando.** Ojo con una cosa: *El primer fracaso glorioso* muestra un invento que
explota; la mejora que funciona tiene que ser otra, o la arandela tiene que ir antes.

---
---

## Y lo que ya sabemos que hay que tocar igual

*Esto no son pedidos tuyos: es lo que falta en el código y en el guion, detallado en
`M3_LECTURA.md`, en «Lo que falta».*

Los blancos reales —boyas y radar portátil, que hoy son obstáculos genéricos— · la forma
ida/objetivo/vuelta con `fases` · la pantalla de elección de mejora, que no está enganchada y
además hay que decidir en qué punto del epílogo entra · `M03_PISTA`, para que Cóndor cierre antes
de jugar · `briefM3`, que está declarado y no existe · `M03_HIST`, y si hace falta · el comentario
viejo de `M03_BURRADA` que todavía nombra el caño · y confirmar qué caras de escena existen de
verdad.

## Dónde está lo que ya decidiste

Las decisiones anteriores de esta misión viven en **`../RESUELTOS_GUION.md`**, con tus casillas
marcadas. Lo que sigue abierto en todo el proyecto está en **`../PENDIENTES_GUION.md`**.

De esta misión no hay nada abierto: los ítems M3-01 a M3-14 están todos cerrados.
