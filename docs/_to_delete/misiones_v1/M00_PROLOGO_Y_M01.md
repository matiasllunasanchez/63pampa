# PRÓLOGO (MISIÓN 0) Y MISIÓN 1 — el recorrido completo

> **Qué es.** El alcance de la apertura de la campaña, beat por beat, **desde que el jugador
> aprieta EMPEZAR hasta que termina la misión 1**. Por cada beat: si es una pantalla **fuera del
> juego** o algo que pasa **dentro del juego**, y si **frena o no frena** la partida.
>
> **La regla de la campaña:** no hay espacio muerto. El prólogo engancha con M1, M1 con M2, y así
> hasta el final. Nunca hay un momento que no pertenezca a nada.
>
> Fuentes: `story.js`, `missions.js`, `strings.js`, `fases.js`, `tuning.js`, `ARQUITECTURA.md`,
> `GUION_3.md`.

---

## 0 · LOS SIETE TIPOS DE PANTALLA, Y CUÁL FRENA

Todo lo que el juego muestra cae en uno de estos siete. Es el vocabulario del resto del documento.

| Tipo | ¿Dónde? | ¿Frena? | Qué es |
|---|---|---|---|
| **VN** | Fuera del juego | **Pausa total** — no hay partida corriendo | Placa de fondo + retrato del hablante + caja de texto. El jugador avanza línea por línea. El campo `hold` es un silencio obligatorio **después** de cada línea: es actuación, no delay técnico |
| **TIERRA** | Fuera del juego | **Pausa total** | La página del cuaderno de Mateo: hoja, letra manuscrita, texto largo |
| **TARJETA** | Fuera del juego | **Pausa total** | La tarjeta de misión: nombre, lugar, objetivo |
| **CHARLA EN VUELO** | **Dentro** del juego | **Congela el odómetro** — "una pausa sin pausa": el avión sigue en pantalla pero no avanza | Escena de `story.js` con `tipo: 'VUELO'` (sin placa: el fondo *es* el juego) colgada de un tramo con `charla: '<ID>'`. Tiene un techo de 25 s |
| **RADIO DE FASE** | **Dentro** del juego | **No frena nada** | Una línea por radio declarada en la fase (`radio: 'm1_rasante'`). Es el formato que estrenó `t15` |
| **RADIO CON PAUSA** | **Dentro** del juego | **Congela hasta que el jugador acepta** | Lo mismo, con `pausa: true`. Marca el cambio de etapa. Ensayo del 13/9 |
| **CINEMÁTICA** | Entre el objetivo y la vuelta | **Toma el control** | Video/timeline. En M1 no se genera nada: se reusa un clip existente |

Y aparte, la **PLACA HISTÓRICA**: pantalla de cierre de capítulo, fuera del juego, después de la
carta de Mateo.

---

## 1 · MISIÓN 0 — EL PRÓLOGO

**No se vuela.** Son cuatro pantallas, todas fuera del juego y con pausa total. Es el contrato con
el jugador: acá se plantan el sapito, el padre, el hijo y el cuaderno, y todo eso se cobra
después.

### ▸ Beat 0.1 — `P1_2` · **AÑOS ANTES · UN ARROYO** — VN, fuera del juego
Un campo en la provincia. Un Rastrojero oxidado. Esteban joven revolea una piedra chata: pica una,
dos, tres veces. Mateo, ocho años, dibuja el arroyo con el cuaderno en las rodillas.

> **ESTEBAN:** *¿Ves? Sapito. La piedra no se hunde si va rápido y pegada al agua. Con los aviones
> es igual: abajo de todo, rapidito, donde nadie te espera. **Los valientes vuelan abajo, Mateo.***
> **MATEO:** *¿Y no se caen?*
> **ESTEBAN:** *Se caen los que le tienen miedo a la tierra… Salió mejor el avión que yo, ¿eh?*

**Qué planta:** la regla del juego entero, dicha por un padre a un nene antes de que exista la
guerra. Cuando Puma la repita en M1 —*"siempre pegado al agua"*— el jugador ya la escuchó.

### ▸ Beat 0.2 — `P2_3` · **LA COCINA · 2 DE ABRIL DE 1982** — VN, fuera del juego
Viernes a la tarde. Mateo, 18, rapado de colimba, de franco; el bolso todavía en la puerta. Se
ríen los tres. *"Sabés que en el sorteo casi me toca Aeronáutica… en vez de al Ejército me
mandaban con vos."* — *"Te salvaste por poco, entonces."*

Suena el teléfono. Norma atiende: *"¿Para quién?… ¿Tero?… Tomá amor. Es para vos."* Y ahí Mateo
descubre el apodo de su padre: *"A tu padre le dicen Tero."*

**Qué planta:** el nombre del jugador, dicho por la madre, en una cocina, antes de la guerra.

### ▸ Beat 0.3 — `P3_4` · **LO QUE UN PADRE PUEDE Y LO QUE NO** — VN, fuera del juego
El teléfono de la base, papeles, un despacho, una puerta que se cierra.

> **ESTEBAN:** *Llamé a todos. A todos mis contactos en Corrientes. Creí que podía sacarlo… No
> pude.*
> **CÓNDOR:** *Aldao. Su hijo ya está embarcado. Está en las islas. Lo siento.*

**Qué planta:** el motor de las catorce misiones. Y la primera vez que se escucha a Cóndor, que a
partir de acá sólo va a ser una voz.

### ▸ Beat 0.4 — `P4_1` · **LA PRIMERA PÁGINA DEL CUADERNO** — TIERRA, fuera del juego
La primera carta. El frío que no tiene nombre, el jujeño que nunca había visto el mar, el porteño
que extraña el 60. *"Le estuve enseñando a hacer sapito al jujeño."* Y el cierre:

> *A mamá, cuando volvamos, le decimos que acá había guiso y pan. Los dos la misma mentira, ¿eh?
> Que para eso somos los hombres de la casa. Mateo.*
>
> **NARRADOR:** *Esa misma semana, empezaba la guerra.*

**Y esa última línea es el enganche con M1.** No hay menú intermedio, no hay pantalla de selección:
el prólogo desemboca en la línea de vuelo de Río Gallegos.

---

## 2 · MISIÓN 1 — CON SAL EN LAS ALAS

*Fines de abril de 1982 · Río Gallegos · mar abierto · amanecer.*
**Tutorial puro: sin jefe, sin enemigos, sin un solo disparo enemigo.**

### ── ANTES DE VOLAR — cuatro pantallas, todas con pausa total ──

**▸ Beat 1.1 — `M01_3` · RÍO GALLEGOS · LA LÍNEA DE VUELO** — VN, fuera del juego
Esteban llega al escuadrón. Puma da la única regla: *"Bienvenido a Los Fieles, Tero. Primera regla:
siempre pegado al agua… Segunda regla: no hay. Con la primera alcanza."* Gitano: *"el mate lo cebo
yo. Y si no volvés… te lo cebo igual. Pero solo. Cebar solo es tristísimo, así que volvé."* Pichón:
*"¿Siempre van a hacer estos chistes?"* Vasco, sin levantar la vista: ***"Es la manera que tienen
de rezar."***

**▸ Beat 1.2 — `M01_5B` · LA CASADA** — VN, fuera del juego
El vestuario, media hora antes. El Vasco cierra el locker rápido y se aparta. El Gitano manda al
Pichón a mirar. **El jugador no ve la foto** — la oye describir y oye que le pusieron nombre. La
ve por primera vez en **M7**, cuando ya es otra cosa. ⚠ *Hoy el código sí la muestra: ver §5.*

**▸ Beat 1.3 — `M01_TERITO` · SU PÁJARO** — VN, fuera del juego
El terito blanco recién pintado bajo la cabina. *"Su pájaro, Teniente. Acá los aviones van con
nombre."* Y el remate, que no es sobre el avión: *"Traémela entera, Tero. Y traete vos adentro, que
la estrellita la pinto por vos, no por ella."*

**▸ Beat 1.4 — `M01_CINCO` · EL RITUAL DE LOS CINCO** — VN, fuera del juego
Diez segundos, cinco gestos, **sin una línea que los explique**. Puma toca tres cosas en orden. El
Vasco apoya la cruz. El Gitano bautiza su avión *"el Colectivo"*. El Pichón escucha el motor con la
mano en la chapa. Tero toca el terito. El Turco los mira subir con el trapo al hombro.
**Se cobra en M14.**

**▸ Beat 1.5 — `M01_TARJETA`** — TARJETA, fuera del juego
> **CON SAL EN LAS ALAS** · *Mar abierto · Vuelo de adaptación*
> *OBJETIVO · Aprender el rasante: cuanto más bajo, mejor.*

---

### ── EL VUELO — de acá en adelante todo pasa dentro del juego ──

**▸ Beat 1.6 — DESPEGUE** — guionado, no se controla
La carrera y el ascenso. El odómetro **ya acredita durante el despegue**: al llegar al pasillo
marca ~155 m. *(Es el motivo por el que el primer tramo de M1 empieza en 0.12 y no antes.)*

**▸ Beat 1.7 — TRÁNSITO** — `{ tipo: 'transito', hasta: 0.10, pausa: true }`
Radio **con pausa**: el juego se congela hasta que el jugador acepta. Es lo que marca que empezó
una etapa. Sin enemigos: el tipo `transito` no siembra nada.

**▸ Beat 1.8 — `M01_OBJETIVO`** — CHARLA EN VUELO, congela el odómetro
> **CÓNDOR:** *Escuadrilla Cauquén, aquí Cóndor. Adaptación sobre mar abierto, rumbo sudeste.*
> **CÓNDOR:** *No hay nada que atacar hoy. Hay que aprender a volar abajo: cuanto más pegado al
> agua, mejor. **Buen vuelo.***
> **PUMA:** *Copiado. Vení atrás mío, Tero, y no me pierdas la cola.*

La última línea de Puma **es el tutorial de seguir al líder** (`persec: 1`).
*"Buen vuelo"* es el cierre fijo de Cóndor en las trece misiones que lo tienen — y su ausencia en
M14 es lo que hace doler el final.

**▸ Beat 1.9 — DESCENSO** — `{ tipo: 'descenso', hasta: 0.25 }`
Bajar al rasante. El tipo apaga las voces; la tensión no es el enemigo, es decidir cuándo bajar.

**▸ Beat 1.10 — `M01_RITUAL`** — CHARLA EN VUELO, congela el odómetro
El ritual completo de Cóndor, dicho **en el aire y no en tierra**, con el mar pasando abajo:
> *Plata Fiel, Plata Fiel. Aquí Cóndor. / Cielo despejado al sur. Viento en la cola. /
> Reconocimiento de zona: vuelen bajito y a casa. / **Buena suerte, muchachos.***

La última línea tiene el `hold` más largo de la escena, y es a propósito: la fórmula termina, la
radio queda abierta un segundo, y **lo único que hay en pantalla son los aviones volando juntos**.

**▸ Beat 1.11 — RASANTE** — `{ tipo: 'rasante', hasta: 0.60 }`
El pasillo como se juega siempre, mudo. Los obstáculos del guion: **los mástiles de una flotilla
pesquera**, **un puente de chapa**, y **seguir a Puma entre las olas a cada vez menos altura**.
Cuanto más abajo, más puntúa: los huevos se enseñan como mecánica antes que como discurso.

**▸ Beat 1.12 — `M01_GANSOS`** — hoy CHARLA EN VUELO, ⏳ pasa a RADIO DE FASE (sin pausa)
> **GITANO:** *¿Viste? Para el comando somos gansos.*
> **GITANO:** *Por lo menos eligieron uno que vuela.*

El chiste es que la escuadrilla se llama **Cauquén**, que es un ganso — y de paso le explica al
jugador por qué cada misión tiene nombre de pájaro. Es **el respiro** del tutorial.

**▸ Beat 1.13 — EL RADAR, EN MODO TUTORIAL** — dentro del juego, sin frenar ⏳
La barra de detección **se muestra y carga si trepás**; Puma y Cóndor te avisan por radio; **no
pasa nada más**. Nadie te ataca y no se puede perder. Es la presentación del medidor sin su
castigo, para que M2 no tenga que enseñar la barra y la consecuencia al mismo tiempo.

**▸ Beat 1.14 — EL OBJETIVO: LOS TAMBORES** — `{ tipo: 'rasante', hasta: 1.00 }` ⏳
**Los tambores flotantes que el Turco tiró al mar como blancos de práctica.** Se revientan **a
cañón** — es el debut del cañón. No hay bombas (`bombs: 0`) y **no hay Pulso**: el Pulso sólo
aparece cuando hay algo concreto que destruir, y además todavía no hay vocabulario de piruetas.

**▸ Beat 1.15 — CINEMÁTICA DE SALIDA** — toma el control, unos segundos
El avión yéndose. **No hay que generar nada**: se reusa uno de los diez clips existentes.
Y cumple una función mecánica, no decorativa: **el pasillo no da la vuelta, la cinemática sí.** El
jugador ve el avión irse y acepta solo que va para casa.

**▸ Beat 1.16 — LA VUELTA** — `{ tipo: 'vuelta', hasta: 1.25, obstacles: 0.5, caza: 0 }` ⏳
Corta y **vacía**. Es la mitad de la forma que va a gobernar las catorce misiones, presentada acá
sin ningún peligro para que se entienda qué es.
⚠ **Trampa del motor:** el tipo `vuelta` sube la siembra por su cuenta (`obstacles: 1.6`,
`caza: 2`). M1 **tiene que pisarlo** o aparecen cazas en el tutorial.

**▸ Beat 1.17 — ATERRIZAJE** ⏳
Se mide velocidad, régimen de descenso, tren y actitud. Regla que manda en todo el juego: **un mal
aterrizaje cuesta chapa y puntaje, y nunca hace perder la misión.**
Desempeño máximo: **«Volviste con sal en las alas.»**

---

### ── DESPUÉS DE VOLAR — tres pantallas, todas con pausa total ──

**▸ Beat 1.18 — `M01_7` · TODOS VUELVEN** — VN, fuera del juego
*"Vuelven los cinco. El Turco va de avión en avión con un pincel finito y la lengua afuera: cinco
estrellitas, una en cada uno."* — *"Esta estrellita te pertenece. **A vos, no al avión.**"* — y el
cierre: ***"Al menos por un ratito, esto parece una aventura."***

**▸ Beat 1.19 — `M01_9` · EL CUADERNO** — TIERRA, fuera del juego
La carta de Mateo. El cabo Correa, el Colorado, correntino, que le tira **un cuero de oveja** sin
decir nada y le enseña a armar el pozo mirando de dónde viene el viento. *"No sé por qué, pero con
él cerca tengo menos miedo. ¿Vos lo mandaste, no?"* Y: *"Lo dibujé con capa, como un superhéroe."*

> El cuero de oveja **es la capa**. Lo que a Mateo lo abriga es lo que hace héroe al otro, y el
> pibe lo dibuja sin darse cuenta de lo que está diciendo. **Nadie lo dice nunca.** Vuelve en M12.

**▸ Beat 1.20 — `M01_HIST` · PLACA HISTÓRICA** — fuera del juego ⏳ *(escrita, falta pegar)*
El último beat del capítulo. Va **después** de la carta de Mateo, no después del vuelo.

**Y de acá se pasa directo a M2.** Sin menú, sin selección de nivel: la campaña es una sola línea.

---

## 3 · LA CADENA — no hay espacio muerto

El orden es siempre el mismo y no se rompe nunca:

**PRÓLOGO → M1 → M2 → … → M14 → EPÍLOGO → CIERRE → POSTCRÉDITOS**

Y adentro de cada misión, el orden también es siempre el mismo:

**escenas VN de briefing → tarjeta → despegue → IDA → OBJETIVO → cinemática → VUELTA →
aterrizaje → epílogo en el aire → carta de Mateo → placa histórica**

Cada capítulo termina en una carta de Mateo y una placa, y la carta siguiente arranca donde
terminó la anterior. **Por eso no hay hueco**: la historia de tierra corre en paralelo a la de
aire y es la que cose las catorce.

---

## 4 · EL FINAL ES EL PRÓLOGO

No es casualidad y conviene tenerlo escrito: **el cierre de la campaña rima con la apertura.**

El prólogo son cuatro pantallas sin volar: un arroyo, una cocina, un teléfono y una página del
cuaderno. El final son escenas sin volar también: la mesa con **los dos platos**, el locker de
Esteban, Norma, los dos papeles — o la misma cocina, el mate, y *"acá dice que te vio"*.

El sapito de `P1_2` es el mismo que Mateo le enseña al jujeño en `P4_1`, el mismo que dibuja en
M8, y **la misma regla que el jugador estuvo ejecutando durante catorce misiones sin que nadie se
la volviera a explicar**. Empieza con un padre enseñándole algo a un hijo en un arroyo y termina
con una cocina. Todo lo del medio es el cielo.

---

## 5 · PENDIENTES DE M1

### ⏳ Decidido, falta hacer
1. Declarar `fases:` en `m1`, **pisando la siembra del tipo `vuelta`**.
2. Los **tambores** como objetivo visible al final de la ida.
3. El **radar en modo tutorial**: mostrar la barra, avisar por radio, no castigar.
4. La **vuelta** y el **aterrizaje**.
5. `M01_GANSOS` pasa de charla en vuelo a **radio de fase**.
6. Pegar **`M01_HIST`**.

### ⚠ Bugs y divergencias
7. **Las charlas en vuelo no dibujan nada.** Corren su máquina de estados, congelan el odómetro
   hasta 25 s… y no muestran una letra: `drawStory` es lo único que las pinta y `game.js` lo llama
   sólo en los estados `story` y `epilogue`. Afecta a `M01_OBJETIVO`, `M01_RITUAL`, `M01_GANSOS` y
   a las charlas de M2 y M3. Lo levantó el playtest de `t15`. **Es el bug más caro de esta lista**:
   sin esto, tres de los beats de arriba no existen en pantalla.
8. **`M01_5B` muestra la foto y no debería** (`placa: 'm7_foto_frente'` → `placa: 'vestuario'`).
9. **La línea del Gitano sobre La Casada está vieja en el código** (*"ese minón tiene dueño"*). La
   versión canónica del guion es *"le decimos así porque no sabemos quién es, pero esa mujer no es
   de nadie que esté solo…"*, y es la que sostiene el giro de M7: **el juego le puso nombre a la
   mujer equivocada durante siete misiones.**
10. **Dos sistemas de historia conviven.** Las escenas nuevas viven en `story.js` (modelo con
    líneas, caras y `hold`), pero `missions.js` todavía apunta a `story: 'storyM1'`, que son las
    **diapositivas viejas de `strings.js`** — y los textos **no coinciden**: ahí Puma dice
    *"Bienvenido a la Plata"* y el Colorado tira *"una media de lana"* en vez del cuero de oveja.
    Hay que decidir cuál manda y migrar. **Este documento describe `story.js`**, que es el modelo
    nuevo y el que coincide con `GUION_3.md`.
11. **El terito no está pintado en el sprite.** La cámara mira desde atrás y ~10° arriba: el flanco
    del fuselaje no aparece en ningún alabeo. Necesita una decisión de arte.
