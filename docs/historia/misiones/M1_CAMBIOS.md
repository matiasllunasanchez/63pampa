# M1 · CAMBIOS PEDIDOS POR EL AUTOR

*Con sal en las alas*

> **Esto manda sobre todo lo demás:** sobre el código, sobre `GUION_3.md` y sobre cualquier otra
> documentación. Si acá dice una cosa y el juego dice otra, gana lo que está acá.
>
> **Este documento NO se ejecuta en esta sesión.** Lo aplica otra sesión, con acceso directo al
> código. Acá sólo se transcribe lo que pidió el autor, se marca qué toca cada cosa, y se avisa
> dónde hay conflicto con algo ya escrito.

**Fecha de la tanda:** 17/9/2026 · **Estado general:** ✅ aplicada entera (18/9/2026). Quedan dos
colas que no son de M1: el cierre de Cóndor en las otras trece misiones (pedido 3) y `M04_FOTO`
(pedido 1). `npm run check` en verde, igual que los fixtures
`misiones`, `tramos`, `charlas` y `chancha`.

---

## Cómo se usa

Escribí acá o decímelo por chat — si me lo decís hablando, yo lo asiento acá. No hace falta
formato: escribí como te salga.

| | |
|---|---|
| ⬜ | pendiente de implementar |
| 🔵 | tengo una duda, te pregunté |
| ✅ | hecho |
| ❌ | no se puede como está pedido — abajo, por qué y qué alternativa |

**Reglas de esta sesión:** se copia textual, no se edita en silencio, y antes de discutir algo se
lee `RESUELTOS_GUION.md`.

---
---

# A · HISTORIA Y DIÁLOGO

## 1 · La foto de La Casada no se vuelve a ver hasta que muere el Vasco

**Estado:** ✅ en M1 · ⏳ `M04_FOTO` queda para cuando se trabaje M4 · **Toca:** `story.js` — M1 y **todas las misiones intermedias**

> **Aplicado:** en M1 no hizo falta tocar nada: la foto se ve en `M01_5B` (placa `m7_foto_frente`)
> y queda así. El choque con `M04_FOTO` sigue abierto, a propósito: se resuelve con M4.

**Pedido del autor, textual:**

> *"El jugador no vuelve a ver la foto durante todas las misiones, la presentamos ahora y
> teóricamente debería volver a verla cuando fallece Vasco."*

**Qué significa:** la foto se presenta en M1 —y ahí **sí se ve**, cuando el Pichón dice *"...es
hermosa"*— y después **desaparece de la pantalla** hasta la muerte del Vasco.

**⚠ Impacto fuera de M1 — para quien implemente:** hoy existe `M04_FOTO`, una escena de una sola
línea donde *"El Vasco abre el locker. Mira la foto dos segundos, se besa la mano y toca el papel"*,
con la placa de la foto de frente. **Esa escena, o su placa, contradice este pedido.** Hay que
resolverlo cuando se trabaje M4: o se saca la escena, o se le cambia la placa para que el gesto se
vea sin que se vea la foto.

El Vasco muere en la misión 7.

---

## 2 · La frase de autorización de Cóndor

**Estado:** ✅ · **Toca:** `story.js` — la línea de Cóndor de `M01_5B`

> **Aplicado** en `src/data/story.js`, `M01_5B_140`. Con la corrección posterior del autor, dice
> *«Vuelo de adaptación autorizado. Favor de despegar en 15 minutos.»* y conserva la estática
> (*Shhh, crrr... zkk*), que es lo que corta el chiste.

**Pedido del autor, textual:**

> *"Cóndor debe decir «Autorizado vuelo de adaptación sobre mar abierto»"*

Hoy esa línea dice: *"Escuadrilla CAUQUÉN, aquí Cóndor. Autorizada adaptación sobre mar abierto,
rumbo sudeste. Recomendamos mantenerse rasantes al agua durante todo el trayecto y prestar especial
atención al radar. Pista dos autorizada. Buen vuelo."*

**Ver también el pedido 3**, que parte esta línea en dos.

---

## 3 · REGLA NUEVA DE LA CAMPAÑA — Cóndor cierra siempre, justo antes de jugar

**Estado:** ✅ en M1 · ⏳ las otras trece · **Toca:** `story.js` — el orden de escenas de M1, y **el molde de las catorce
misiones**

> **Aplicado** en `src/data/story.js`: escena nueva `M01_PISTA` (Cóndor: *«Autorizada pista dos.
> Mantenerse rasante. Buen vuelo, muchachos.»*), puesta en `SECUENCIAS.storyM1` entre `M01_CINCO`
> y `M01_TARJETA`. La tarjeta no habla, así que no rompe la regla.
> **Falta:** revisar el cierre de las otras trece. No se tocaron.

**Pedido del autor, textual:**

> *"Me gustaría que CÓNDOR sea el cierre de cada pre-visual-novel antes de que arranque la misión,
> así que quizá la parte del pájaro y demás rituales debería ir antes, o quizá podemos poner a
> Cóndor cortando el chiste, avisando «Autorizado vuelo de adaptación, prepararse para el despegue
> en 15 minutos». Luego todo el tema este del ritual y el pájaro, bla bla, y al final antes de
> arrancar todo, CÓNDOR dice «Autorizada pista dos, mantenerse rasante, buen vuelo muchachos», algo
> así. Y que siempre antes de arrancar EL JUEGO siempre sea un cierre de CÓNDOR."*

**La regla, aislada:** **la última voz antes de que el jugador tome el control es siempre la de
Cóndor.** Vale para las catorce misiones.

**Cómo queda M1** *(la forma que propone el autor)*:

1. La línea de vuelo — presentación de la familia.
2. La Casada, en el vestuario.
3. **Cóndor corta el chiste:** *"Autorizado vuelo de adaptación sobre mar abierto. Prepararse para
   el despegue en quince minutos."*
4. El terito.
5. El ritual de los cinco.
6. **Cóndor cierra, ya con todos arriba:** *"Autorizada pista dos. Mantenerse rasante. Buen vuelo,
   muchachos."*
7. Arranca el juego.

**Notas para quien implemente:**
- La línea larga de Cóndor que hoy cierra `M01_5B` **se parte en dos**, y la segunda mitad se muda
  a una escena nueva después del ritual.
- Este pedido **resuelve una rareza que ya estaba anotada**: hoy Cóndor autoriza el despegue en el
  vestuario y después todavía vienen el terito y el ritual.
- La línea de M1-06 de `RESUELTOS_GUION.md` (la radio larga "de manual") queda **modificada por
  este pedido**, que es posterior.

---

## 4 · Tero y el Turco ya se conocen — plantarlo en el prólogo

**Estado:** ✅ — resuelto en M1, no en el prólogo · **Toca:** `story.js` — **misión 0**, no M1

> **Aplicado** en `src/data/story.js`, al principio de `M01_3`. El autor decidió dónde: el Turco
> recibe a Esteban antes que Puma. Dos líneas nuevas (`M01_3_012`, `M01_3_016`), y a `M01_3_020` se
> le sacó el saludo, que se mudó a la de Puma:
>
> **EL TURCO:** Tero querido, ¿cómo estás? Tanto tiempo. Vení que te presento a la banda.
> **PUMA:** Hola, Esteban. Mucho gusto, me dicen Puma. Oí que a vos te dicen Tero. Bienvenido a
> los Fieles de Plata.
>
> ⚠ La narración `M01_3_010` sigue diciendo que *«uno de ellos, con bigote, se acerca a
> recibirlo»*. Ahora lo recibe primero el Turco. No se tocó: es texto del autor.

**Pedido del autor, textual:**

> *"Me gustaría plantar la idea de que Tero y el Turco ya trabajaron juntos y se conocen, quizá en
> la misión 0, cuando arranca, un pequeño comentario en la presentación. Ya que le daría más
> sentido que le digan Tero, que tenga un conocido, y también es el personaje que sobrevive con él
> en caso de que se elija el final donde vive."*

**Los tres motivos, del autor:** que el apodo tenga de dónde venir · que Esteban no llegue sin
conocer a nadie · y que el Turco es quien lo acompaña en el final donde vive.

**Nota para quien implemente:** el pedido dice *"quizá en la misión 0"*. En el prólogo el Turco no
aparece, así que **falta decidir dónde entra el comentario**: si se agrega al prólogo, o si va en
la línea de vuelo de M1. Preguntar antes de escribirlo.

---
---

# B · LA MISIÓN JUGABLE

## 5 · La misión se parte en IDA y VUELTA, sin cinemática en el medio

**Estado:** ✅ · **Toca:** `missions.js` y el flujo de la misión

> **Aplicado.** El autor pidió después que el giro **sí** se marcara, sin Pulso: un corte a negro.
> - `src/data/missions.js`: M1 declara `fases` (tránsito 12% · descenso 30% · rasante 70% ·
>   rasante 100% · **vuelta hasta 160%**). La vuelta pisa sus defaults: mitad de obstáculos, sin
>   cazas ni bombas. Mide 1.320 m porque tiene que durar lo que se dice en ella.
> - `src/game.js`, `volverDelBlanco`: negro pleno ~0,8 s, vuelve con el avión ya volando, y Puma
>   dice *«Hasta acá llegamos, Tero. Media vuelta y a casa.»* (`AV_M1_VUELTA`).
> - `src/render/hud.js`: en la vuelta la barra de objetivo dice **A CASA**, cuenta lo que falta,
>   y el avioncito gira y camina de regreso al puerto. La ruta no se da vuelta.
> - **La Chancha no se usa en M1**: su cita tarda ~35 s y la vuelta dura entre 8 y 20. Se la
>   **nombra** (Puma, `AV_M1_CHANCHA`) y debuta en M2. `chancha: false` en la misión, y el reloj
>   no se dibuja.
> - Combustible prendido (`fuelOn`) con `fuelScale: 0.4`: se ve bajar y sobra siempre (68% al
>   aterrizar volando normal, 25% en el peor caso medido).
> - Termina en el aterrizaje de siempre, que es manual y nunca hace perder la misión.
> - `tools/unit.js`: el test «ninguna misión de campaña declara fases» pasó a listar cuáles sí.

**Pedido del autor, textual:**

> *"Quizá deberíamos tener 2 partes acá, la IDA y la VUELTA, sin la cinemática en el medio, para
> explicar el concepto de las misiones. Es decir, que algún personaje explique el objetivo de la
> IDA —rasante, sigiloso, etc.— y la vuelta RÁPIDA, CON LA IDEA DE SALVARSE. También se puede
> llegar a explicar el concepto de CHANCHA y podemos usarlo a la vuelta, que es lo que justifica el
> gasto de combustible; a la ida no tiene mucho sentido, ningún avión sale sin combustible a la
> ida."*

**Qué cambia respecto de lo escrito:** el documento de lectura tiene una cinemática corta entre la
ida y la vuelta. **Acá no va.** En M1 las dos mitades se explican con diálogo, no con un corte.

**La Chancha:** se explica en M1, **se usa sólo en la vuelta, nunca en la ida.**

---

## 6 · El radar NO aparece en M1 — sólo hablan de él

**Estado:** ✅ · **Toca:** `missions.js` / UI

> **Aplicado.** `radar: 'voz'` en la configuración de M1 (el valor por defecto es `'normal'`).
> `src/systems/flight.js` no carga la barra ni dispara oleadas: solo anota si el avión está por
> encima del techo. `src/game.js` no dibuja la red ni el tinte verde, y dice un aviso del banco
> `AV_M1_RADAR` cada 6 s mientras sigas arriba. Cóndor entra solo cerca de la base
> (`condorAlcance`); en el medio habla Puma. Las cuatro líneas las eligió el autor.

**Pedido del autor, textual:**

> *"La configuración de la misión está bien, salvo por el radar: el radar no debe ni aparecer. En
> cada momento que el avión sube donde DEBERÍA aparecer el radar, aparece un diálogo de CÓNDOR o de
> PUMA avisando «Estás en zona visible por el radar, ahora te estarían disparando, bajá», o frases
> o cosas así aleatorias. DESDE CÓNDOR o desde PUMA."*

**O sea: sin barra, sin medidor, sin UI de radar.** Cuando el jugador sube por encima de la altura
en la que el radar lo vería, **le habla alguien**. Varias frases, elegidas al azar, repartidas
entre Cóndor y Puma.

**⚠ Esto reemplaza** lo que estaba escrito antes como "radar en modo tutorial: se muestra la barra
pero no castiga". **No se muestra nada.**

---

## 7 · En M1 el jugador no puede morir, y nunca deja de ser Tero

**Estado:** ✅ · **Toca:** `missions.js`, sistema de daño, sistema de relevo

> **Aplicado.**
> 1–3. `sinMuerte: { golpe: 25, piso: 25, gracia: 1.2 }` en `missions.js`. `onDeath` de `game.js`
> —la única puerta de todas las muertes— convierte el golpe en chapa y no releva. Siempre Tero.
> Si perdés o chocás a Puma, **Puma vuelve** (la persecución lo borraba).
> 4. El combustible sobra (ver el 5). En el camino apareció un bug de toda la campaña:
> `CHV_FUEL_FREEZE` estaba declarada y nadie la leía, así que **las charlas quemaban nafta**.
> Arreglado en `src/systems/flight.js`.
> 5. Puma avisa: bancos `AV_M1_AGUA`, `AV_M1_CHOQUE` y `AV_M1_PISO` en `story.js` (líneas del
> autor), elegidos al azar sin repetir la anterior.

**Pedido del autor, textual:**

> *"El jugador no debería morir, el combustible se gasta pero debería SOBRAR para la distancia que
> se recorre. La chancha no se debería llamar en la IDA, sí en la vuelta. No debería morir el
> jugador, ni con agua: debería bajar el daño pero que haya un límite mínimo de vida. No quiero que
> cambiemos de jugador, siempre tiene que ser TERO. Y también, si nos dañamos, PUMA debe avisar
> sobre el daño y la altura mínima y demás."*

**Los cuatro puntos, separados:**

1. **No se puede morir en M1.** Ni contra el agua.
2. **El daño baja, pero hay un piso de vida** que no se traspasa.
3. **Nunca se cambia de piloto.** Siempre Tero, toda la misión.
4. **El combustible sobra** para la distancia. Se gasta, se ve, pero no alcanza a ser un problema.
5. **Si te dañás, habla Puma:** el daño, la altura mínima, y lo que corresponda.

**⚠ Nota para quien implemente:** el punto 3 choca con el sistema de relevo — hoy M1 tiene cinco
pilotos y el relevo es global de la campaña. **En M1 hay que desactivarlo**, no cambiarlo para
todas.

---

## 8 · Los demás enseñan los controles, cada uno con su estilo

**Estado:** ✅ · **Toca:** `story.js` (líneas nuevas) y el sistema de charlas / foco

> **Aplicado.** Nueve lecciones —eran diez hasta que M1 perdió el modo SEGUIR— (`LEC_M1_*` en
> `story.js`, tipo `LECCION`), declaradas en la lista
> `lecciones` de M1. **Ningún personaje nombra una tecla**: las muestra el juego durante la pausa,
> sacadas de la tabla de CONTROLES (`ctrl*` de `strings.js`), en su versión de teclado o de mando.
> Cualquier tecla sigue. El foco agujerea el velo sobre el instrumento (`zonaHud` en `hud.js`) y la
> caja de diálogo sube si el foco está en la fila de abajo. Cóndor explica el principio, **se le
> corta la radio** explicando el techo del radar, y Puma dice por qué. La última es
> Cóndor en la aproximación final. Fila nueva en la tabla de controles: **TONEL**.

**Pedido del autor, textual:**

> *"Los demás personajes deben ayudar tanto en la ida como en la vuelta (según convenga) a explicar
> el resto de controles y paneles existentes en determinados momentos convenientes de la misión.
> Quizá con ayuda de pausa más algún FOCUS a la zona de juego. CADA EXPLICACIÓN debe tener un
> estilo diferente según personaje y característica o forma de ser. Recordar que el TURCO no está
> acá y no participa. Cóndor puede ser en distancias cercanas al despegue o al aterrizaje, que es
> donde «llega» la radio. También el PUMA debe explicar que hay distancias donde la radio de Cóndor
> no llega o tiene interferencias, y quizá mostrarlo en tiempo real."*

**Las cuatro reglas que salen de esto:**

1. **Cada personaje explica a su manera.** No hay una voz de tutorial: hay cinco personas distintas
   diciendo cosas distintas.
2. **El Turco no participa.** Está en tierra.
3. **Cóndor sólo habla cerca del despegue y del aterrizaje**, porque la radio no llega más lejos.
4. **Puma explica que la radio de Cóndor se pierde a distancia**, y eso **se muestra en tiempo
   real**: interferencia, cortes.

**Recurso disponible:** pausa + **foco sobre la zona de la pantalla** que se está explicando.

---

## 9 · Los puntos no se muestran ni se explican

**Estado:** ✅ · **Toca:** UI de M1

> **Aplicado**, con la aclaración posterior del autor: *«no pretendo que escondas, pretendo que
> hagas focus»*. La barra de objetivo sigue a la vista y tiene su lección con foco (`LEC_M1_RUTA`).
> El recuento de M1 dice **MISIÓN FINALIZADA**, sin puntaje, estrellas ni calificación
> (`puntos: false`), sobre un fondo fijo sin buques (`fondoRecuento: 'win3'`). De la leyenda de la
> página salió la línea de los puntos, para todo el juego.

**Pedido del autor, textual:**

> *"Los puntos no importan ni mostrar ni explicar."*

---

## 10 · Qué poderes se enseñan en M1 — **decidido: ninguno, van en M2**

**Estado:** ✅ decidido (**B**, los poderes se enseñan en M2) y aplicado

> **Aplicado:** `poderes: false` en la configuración de M1 (`src/data/missions.js`). La racha no se
> carga (`src/systems/flight.js`), así que no hay cartel PERFECTO/RASANTE ni flow; la barra de
> MOMENTUM no se dibuja (`src/render/hud.js`) y las teclas 4 y 6 no hacen nada (`src/game.js`).
> De paso: lo que una misión cambia de la configuración ya no queda pegado en la siguiente ni en
> los modos sin misión — antes, jugar M1 dejaba el COMBUSTIBLE prendido y un POR LA PATRIA sin
> radar ni poderes.

**Pedido del autor, textual:**

> *"El poder MOMENTUM puede explicarse, el rasante también, tanto el mantenimiento de barrita como
> el poder general. La idea es terminar la misión con un paneo general de todo lo que necesita
> aprender, ver o leer el jugador. Quizá la parte de los poderes se puede migrar a la misión 2 si
> es necesario, y dejar la misión 1 sólo para la parte de UI, sin mostrar ni habilitar momentum ni
> rasante, y dar la idea de que debe mantenerse rasante a mano. Te dejo que lo pienses."*

**Las dos opciones:**

**A) M1 enseña los poderes** — momentum y rasante, con su barrita.

**B) M1 es sólo la UI y volar a mano** — sin poderes. El jugador sostiene el rasante con el pulso,
y los poderes debutan en M2.

### Mi recomendación: la B

Por tres razones.

**Primero, porque el resto de tus pedidos ya llenaron M1.** Entre la UI, los controles, seguir al
líder, los avisos de radar por voz, el daño, la Chancha, la ida y la vuelta como conceptos, el
cañón y el aterrizaje, la misión ya tiene nueve cosas que enseñar. Agregarle dos poderes la
convierte en un manual.

**Segundo, porque el rasante a mano hace que el poder signifique algo después.** Si en M1 el
jugador sostiene la altura con el pulso y le cuesta, cuando en M2 le den el poder que lo clava a
ras va a entender para qué sirve, porque sabe qué se siente no tenerlo. Si se lo das junto con el
concepto, nunca conoce el problema que el poder resuelve.

**Y tercero, porque encaja con el calendario que ya existe.** M1 no entrega ninguna mejora: la
primera llega servida después de M2, y es justamente **TERRAIN MASKING**, la que clava el avión a
ras. La frase del Pichón que la acompaña es *"Si abajo no nos ven… ¿por qué subimos?"*. O sea que
el juego ya estaba armado para que el rasante como poder apareciera ahí.

**Lo único que dejaría en M1 de esa familia:** que el jugador entienda **que hay que ir abajo**, y
que le cuesta. El poder no.

**Falta tu confirmación.**

---

## 11 · La misión cierra con un paneo general — **es un documento, no una pantalla**

**Estado:** ✅ · **Toca:** la documentación, no el juego

> **Aclaración del autor:** el paneo no es para el jugador, es para él — una vista general de todo
> lo que incluye cada misión. **Aplicado** como la sección **PANEO GENERAL** al principio de
> `M1_LECTURA.md`: la secuencia completa, qué se enseña y quién, qué mecánicas están prendidas, y
> qué falta. Es el molde para las otras trece.

**Pedido del autor, textual:**

> *"La idea es terminar la misión con un paneo general de todo lo que necesita aprender, ver o leer
> el jugador."*

**Nota para quien implemente:** falta definir qué es exactamente ese paneo — si es una pantalla de
resumen, un recorrido por la UI, o una escena. Preguntar.

---
---

## Resumen

| # | Qué | Estado |
|---|---|---|
| 1 | La foto no se ve más hasta que muere el Vasco | ✅ en M1 · ⏳ `M04_FOTO` con M4 |
| 2 | Frase de autorización de Cóndor | ✅ |
| 3 | Cóndor cierra siempre antes de jugar | ✅ en M1 · ⏳ las otras trece |
| 4 | Tero y el Turco ya se conocen | ✅ en `M01_3` |
| 5 | Ida y vuelta, corte a negro en el giro, la Chancha nombrada | ✅ |
| 6 | El radar no se muestra: avisos de voz | ✅ |
| 7 | No se puede morir, siempre Tero, sobra nafta, Puma avisa | ✅ |
| 8 | Cada personaje enseña; las teclas las pone el juego | ✅ |
| 9 | Sin puntos: foco en la ruta, recuento sin números | ✅ |
| 10 | Los poderes se enseñan en M2 | ✅ |
| 11 | Paneo general de la misión (para el autor) | ✅ en `M1_LECTURA.md` |

**Lo que este documento invalidó de lo escrito antes:** el radar en modo tutorial con barra visible
(pedido 6), el relevo de cinco pilotos en M1 (pedido 7), el orden anterior de las escenas previas
(pedido 3) y la radio larga de Cóndor de M1-06 (pedidos 2 y 3). La «cinemática entre ida y vuelta»
del pedido 5 terminó siendo un corte a negro, por pedido posterior del autor.

**Cambios posteriores del autor (18/9):**
- **Despega el escuadrón entero, pero la única vida es la de Tero.** El tablero muestra a Tero solo
  (`src/render/hud.js`, por snapshot `unaVida` desde `game.js`; se deriva de `sinMuerte`).
- **M1 sin modo SEGUIR** (`persec: 0`). Se fue la lección de la barra del líder (`LEC_M1_SEGUIR`).
  Los dos textos que hablaban del líder, resueltos por el autor: el corte de Cóndor ahora se corta
  explicando el techo del radar (*«Recuerde: por debajo de la altura del radar, no lo detectan.
  Manténgase pegado al ag… zzk… crrr…»*, foco en la altitud) y la línea de Puma en `M01_OBJETIVO`
  («Vení atrás mío, Tero…») **salió**.
- **M1 tiene viento** (se sacó el `wind: false`): volar alto frena.
- **Cada misión tiene su cartel de despegue** (`despegue` en `missions.js`): BAM RÍO GALLEGOS y el
  rumbo que dice Cóndor en su línea de objetivo. M14 sale sin rumbo, a propósito. Antes era un texto
  único —«PUERTO ARGENTINO · BAM MALVINAS»— para las catorce.

**Pendientes chicos que aparecieron en el camino, sin tocar:** `M01_7_020` usa `turco_ternura`, que
no existe · `M01_RITUAL` y `M01_OBJETIVO` terminan los dos en «Buen vuelo» y `M01_PISTA` también
(decisión del autor: se repite en todas) · la narración `M01_3_010` (ver el 4).
