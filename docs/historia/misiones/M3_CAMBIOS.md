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

## ~~1 · Primera misión con objetivo: el puesto de una isla~~ — *reemplazado por el 8 (9/10)*

**Estado:** ⬜ · **Toca:** `missions.js` (m3), `estructuras.js`

**El blanco es, probablemente, el puesto de una isla** —el autor dijo *"quizá"*—. **Viene de M2:**
es el islote que el 3/10 se había puesto en M2 (`M2_CAMBIOS.md` · 10). **La mecánica existe:**
`goal: { kind: 'estructura' }`, con la única estructura cargada hoy, `BASE COSTERA`.

**Reemplaza a las boyas y el radar portátil** que había en el guion.

**Y con objetivo, hay cinemática** (regla de `M2_CAMBIOS.md` · 3): **la primera es en M3.**

## ~~2 · Se aprenden las bombas — y salen mal~~ — *reemplazado por el 8 (9/10): en M3 no se tira*

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

## 5 · ⚠ La primera mejora se elige AL ARRANCAR la misión — cambió el 9/10

**Estado:** ⬜ · **Toca:** `upgrades.js`, `SECUENCIAS.storyM3` · **⚠ reemplaza lo de abajo**

**Pedido del autor (9/10), textual:**

> *"Entonces si, apenas arranca la mision el juego te da a seleccionar una mejora para elr esto del juego para todos los aviones"*

**Queda así:** la escena *El invento* termina con el Turco diciendo *"A ver... mostrame..."*, y
**ahí mismo el juego te da a elegir la primera mejora**, antes de la tarjeta y del despegue. La que
elegís **queda para el resto del juego y para todos los aviones del escuadrón.** Y la misión se
vuela con la mejora ya puesta: es la primera vez que el jugador la siente en las manos.

**Esto arregla solo lo que había quedado raro:** la mejora que funciona va primero, y *El primer
fracaso glorioso*, después de aterrizar, es otro invento del pibe que explota.

**Es una excepción a G-09** (las mejoras van inmediatamente después de la misión): esta primera va
antes, porque la escena la pide. Las demás siguen como dice G-09.

🔵 **Una duda:** ¿al final de M3 hay otra elección, o la siguiente es al final de M4? Y la de acá,
¿es elegir una entre dos, como todas las demás?

---

### Lo que estaba antes, para el registro: al terminar, la primera mejora — servida

**Estado:** ⬜ · **Toca:** `upgrades.js`, escena de cierre · *(el autor marcó: REVISAR las mejoras)*

*"Pichón encontró una mejora para tu avión y Turco la aplicó."* **Es la primera de la campaña, y no
se elige.** **De M4 en adelante**, al final de cada misión, **se elige una entre dos.**

~~**Dónde va:** **inmediatamente después de la misión, antes de la arandela.**~~ *(Reemplazado el 9/10: va al arrancar la misión, ver arriba.)* Lo dice el orden de
posmisión que ya aprobaste (`../PENDIENTES_GUION.md`, G-09: *"la pantalla de mejoras tiene que
venir inmediatamente después de la misión"*). Con eso se cierra la duda que había quedado en
`M3_LECTURA.md` sobre si iba antes de la arandela o antes del cuaderno.

**Cambia el calendario de `upgrades.js`:** hoy es *M2 una servida, M3+ a elegir*; pasa a ser *M3
una servida, M4+ a elegir.*

**Encaja solo con la historia:** *El invento* —el Pichón trepado al avión de Esteban y el Turco
diciendo *"a ver, mostrame"*— abre esta misma misión. **La mejora que se gana al final es la que el
pibe estaba tocando.** Ojo con una cosa: *El primer fracaso glorioso* muestra un invento que
explota; la mejora que funciona tiene que ser otra, o la arandela tiene que ir antes.

---
---

## 7 · ✅ El soundtrack de M3 es «ATADO CON ALAMBRE» — decidido el 9/10, a la noche

**Estado:** ✅ resuelto — **M3 queda como estaba** · *Pedido del 9/10, dado de baja el mismo día*

**Pedido del autor, textual:**

> *"en M3 ponemos el tema ALAMBRE. anotalo."*

**Hoy, según `../SOUNDTRACK.md`,** M3 tiene la pista 03 *"El invento"* (`hangar.mp3`) para las
escenas del hangar y las pantallas de mejoras, y en vuelo la 13 *"Rasante"* (`game.mp3`), que es la
de M1 a M4.

🔵 **La duda era:** ¿ALAMBRE va **en vuelo** —en lugar de "Rasante"—, **en el hangar** —en lugar
de "El invento"—, o en las dos?

**Se resolvió para el otro lado: ALAMBRE no es de M3.** El autor, el mismo día:

> *"alambre es para otra misión, vos dejá solo rasante y aleatorio"*

Así que **M3 no cambia**: "Rasante" en vuelo, "El invento" en el hangar, y el reproductor sigue
sorteando pista como siempre.

**Dónde queda ALAMBRE.** `atado_con_alambre3.mp3` está en `assets/music/soundtrack/` y **fuera del
reproductor a propósito** (ver el comentario en `MUSIC_POOL`, `systems/audio.js`): es una pista
**reservada para una misión todavía sin nombrar**, y una pista reservada no puede andar sonando
sola en la rueda — la primera vez que se escuche tiene que ser donde significa algo. Cuando se sepa
la misión se cablea por `setRunMusic`, que es donde la campaña elige pista por nivel.

> Dato del disco: de los tres archivos que aparecieron ese día, `atado_con_alambre.mp3` y
> `atado_con_alambre_csolo.mp3` son **byte a byte el mismo archivo**. El bueno es el `3`.

### ⚠ Y después el autor lo dio vuelta: ALAMBRE **sí** es de M3

**Pedido del autor (9/10), textual:**

> *"M3 soundtrack: tema es atado_con_alambre, usar el _con_solo o algo asi, o usar los 3 que estan de
> forma aleatoria, anotar "ATADO CON ALAMBRE" el soundtrack. Cada mision tiene un soundtrack.*
>
> *LA M3 SE LLAMA "EL INVENTO""*

**Queda así, y manda sobre lo de arriba:**

- **El soundtrack de M3 se llama «ATADO CON ALAMBRE».** Le calza a la misión del Pichón, que arma
  todo con lo que tiene a mano.
- **Archivo:** el autor pide *"el _con_solo o algo así, o los 3 de forma aleatoria"*. **Ojo con el
  dato del disco:** `atado_con_alambre.mp3` y `atado_con_alambre_csolo.mp3` son el mismo archivo,
  así que *"los tres al azar"* en realidad son **dos versiones distintas**: ésa y la `3`.
  ✅ **Por ahora, al azar entre las dos** *(autor, 9/10: "No importa, pora hora aleatoria.")*.
- **Se cablea por `setRunMusic`**, que es donde la campaña elige pista por nivel. Sigue **fuera de
  la rueda del reproductor**: tiene que sonar primero en M3.
- **Regla de campaña nueva: cada misión tiene su soundtrack** — ver `README.md`.

---
---

## 8 · ⚠ M3 es la Bahía de la Anunciación, y no hay nada

> **El título no cambia: M3 se llama «EL INVENTO».** *(Autor, 9/10: "LA M3 SE LLAMA \"EL
> INVENTO\"".)* Abajo el autor la llama *"el bautismo de fuego"* por el hecho histórico del 1 de
> mayo; el nombre de la misión es *El invento*, y **M2 conserva *El bautismo de fuego***.

**Estado:** ⬜ · 🔵 dudas · *Del 9/10 — entero en **`ESCALERA_DE_APRENDIZAJE.md`**, «Revisión del
9/10»* · **⚠ reemplaza los pedidos 1 y 2** (el puesto de la isla y el aprendizaje de bombas)

> *"m3 es el bautismo de fuego, la mision es qe mandan a MUCHIOS AVIONES ARGENTINOS varios
> escuadrones a sobrevolar las islas por un supuesto desembarco en "Bahia de la anunciación" que al
> final cuando llegan no hay nada y deben volver. No es una mision de diversion, el radar aparece,
> manda sea harrier, pero es mas permisivo, solo manda harriers, debe haber TIERA y mar porqe se
> sobrevuelan las islas, el objetivo adonde hay qe llegar es una bahia, al llegar, PUMA o CONDOR
> debe decirnos "que ven" y nosotros decir "no hay nada" y volver, la vuelta tambien tratando de qe
> sea en sigilo. Mas harriers y cada tanto en alguna parte de AGUA alguna barcaza chica, no hay
> soldados britanicos todaiva.*
>
> *Nos preparamos para tirar la bobma en la mision 1 quiza para practicar, pero en la mision 3 la
> idae es tirarla pero al final no la tiramos porqe no habia nada a que lanzarle porqe no hay
> desembarco."*

**Queda así:**

- **Muchos aviones, varios escuadrones**, a la Bahía de la Anunciación por un supuesto desembarco.
- **Tierra y mar:** se sobrevuelan las islas.
- **El radar sólo manda Sea Harriers**, más permisivo que lo normal, y **más Harriers que en M2**.
- **Alguna barcaza chica** en el agua, cada tanto. **Todavía no hay soldados británicos.**
- **Al llegar a la bahía,** Puma o Cóndor: *«¿Qué ven?»* — *«No hay nada.»* — y a volver.
- **La vuelta, en sigilo.**
- **Se sale con bombas y no se tira ninguna:** no hay a qué.

**Lo que pasó de verdad, y coincide** *(fuente: «Bautismo de Fuego», Horacio Rodríguez, Museo
Nacional de Aeronáutica)*: la madrugada del **1 de mayo de 1982** un Vulcan bombardeó la pista de
Puerto Argentino, y hacia las 08:30 los Sea Harrier atacaron la BAM Malvinas y la **BAM Cóndor, en
Pradera del Ganso, con ocho muertos**. Después, la Fuerza Aérea Sur interpretó que venía **un
desembarco** —en la costa sur de la Isla Soledad— y creyó que el segundo grupo de portaaviones
estaba **frente a la Bahía de la Anunciación**, así que mandó la mayoría de sus aviones de combate
a frenarlo. **Las dos misiones pasan el mismo día, el 1 de mayo**: M2 a la mañana, M3 a la tarde.

**🔵 Para decidir:**

- ~~**El título.**~~ ✅ Resuelto: M3 es *El invento* y M2 sigue siendo *El bautismo de fuego*.
- ✅ **Las escenas se quedan en M3** *(autor, 9/10: "Si perfecto")*: *El invento*, la primera
  mejora al arrancar, la arandela, la burrada, la navaja y el Belgrano.
- **Las barcazas:** ¿se les puede tirar con el cañón, o están sólo para que se vean?

---
---

## 9 · El Belgrano: después de M3, antes de M4

**Estado:** ✅ ya está así · *Del 9/10*

> *"El belgrano se hunde luego de la mision 3 y antes de empezar la 4, era 2 de mayo a las 16"*

**Ya está ubicado así:** `M03_BELGRANO` es la última escena del epílogo de M3, y la siguiente es
M4 (4 de mayo). Con M3 pasando el 1 de mayo, la noticia llega al día siguiente: el ataque fue el 2
de mayo hacia las 16, y en la escena el Pichón dice que hay balsas en el agua *"desde hace
horas"*, o sea esa noche. Encaja sin tocar nada.

---
---

## 10 · Después del Belgrano, la Marina se queda en el continente

**Estado:** 🔵 dónde va · *Del 9/10*

> *"Luego del belgrano toda la marina quedo en el continente, ya que no teniamos forma de detectar
> todos los submarinos nucleares qe ellos tenian y ademas teniani informacion satelital de estados
> unidos. Cualquier barco argentino iba a correr la misma suerte."*

**Por qué importa para el juego:** es el motivo histórico de que, desde M4, la guerra en el mar la
pelee la aviación sola. Explica la premisa de Rasante sin que nadie la diga en voz alta.

**Sobre el apoyo de Estados Unidos:** está documentado que les dio inteligencia, comunicaciones y
armamento (los AIM-9L de los Sea Harrier, por ejemplo). Que esa inteligencia incluyera imágenes
satelitales se discute entre historiadores. **Si va en una placa, conviene decir "inteligencia de
Estados Unidos" sin especificar satelital.**

**🔵 Dónde va.** La propuesta es la placa histórica de M3 (`M03_HIST`), que no existe y estaba
pendiente de decidir si hacía falta: iría después de la escena del Belgrano, cerrando la misión.
Otra opción es que sea el arranque de M4.

---
---

## 11 · La paz que negociaba el Perú, y el Belgrano

**Estado:** 🔵 dónde va · ⚠ **el autor dice: "importante remarcar"** · *Del 11/10*

> *"Se dice qe el presidente de peru estaba negociando algo qe podria haber frenado el
> enfrentamiento si no hubiesen hudido el belgrano. Importante reemarcar."*

**Qué es:** el presidente del Perú estaba negociando un acuerdo que podría haber frenado la guerra,
y **el hundimiento del Belgrano lo cortó**. El autor lo dice con un *"se dice"*: va con esa cautela,
y hay que confirmarlo con fuentes argentinas (quién, qué proponía y en qué punto estaba el 2 de mayo).

**Dónde cae solo:** es lo mismo que el pedido 10 —qué cambió el Belgrano—. Puede ir **en la misma
placa (`M03_HIST`)**, o en el arranque de M4.

**Y se ata con M10:** ahí el Perú vuelve, con los diez Mirage, los repuestos y los tanques, y los
pilotos que querían quedarse (`M10_CAMBIOS.md`, pedido 4). El Perú intentó la paz primero y ayudó
después. **Las líneas, si se escriben, se proponen antes de pegar.**

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
