# M1 · CON SAL EN LAS ALAS

> **FUENTE DE VERDAD SUPREMA.** Lo que el autor escriba acá manda sobre el código, sobre
> `GUION_3.md` y sobre cualquier otra documentación.
> **Texto verbatim de `src/data/story.js`** (la fuente de verdad del modo historia).
> **Estado:** ⬜ sin revisar por el autor.

---

## 1 · IDENTIDAD

| | |
|---|---|
| **Fecha** | Fines de abril de 1982 |
| **Lugar** | Río Gallegos → mar abierto · amanecer |
| **Indicativo** | Escuadrilla **CAUQUÉN** |
| **Objetivo (código)** | `goal: { kind: 'distance', meters: 2200 }` |
| **Clímax** | ninguno (no es misión de buque) |
| **Escuadrón** | `roster: F5` — TERO, PUMA, GITANO, VASCO, PICHÓN |
| **Par de puntaje** | 5000 · ★ completar · ★★ 5000 · ★★★ 7500 |
| **cfg** | `sky: dawn · water: sea · terrain: sea · coast: 230 · wind: false · obstacles: 0.5 · bombs: 0 · caza: 0 · rain: 0 · fog: 0 · squad: 5 · persec: 1` |

**Qué es.** El tutorial de **la forma entera del juego**, no de una parte. El jugador hace una vez,
sin un solo enemigo, todo lo que va a hacer durante catorce misiones. **Si M1 está bien hecha, el
juego no tiene que volver a explicar nada nunca.**

Es también **la misión de conocer a la familia**.

---

## 2 · LOS PERSONAJES, Y QUÉ HACE CADA UNO

| Quién | Dónde | Qué hace en M1 |
|---|---|---|
| **TERO** (Esteban) | el jugador | Llega nuevo al escuadrón |
| **PUMA** | aire, líder | Da la única regla. Es a quien hay que seguir |
| **GITANO** | aire | El mate, y el chiste de los gansos |
| **VASCO** | aire | La foto del locker. La cruz contra el fuselaje |
| **PICHÓN** | aire | Escucha el motor con la mano apoyada en la chapa |
| **EL TURCO** | tierra | Ceba mate, pinta el terito, tiró los tambores al mar, pinta las estrellitas |
| **CÓNDOR** | sólo radio | El ritual y la autorización. Nunca se lo ve |
| **MATEO** | cuaderno | Conoce al Colorado |
| **EL COLORADO** (cabo Correa) | cuaderno | Le tira el cuero de oveja |

---

## 3 · RECORRIDO BEAT POR BEAT

### ══ ANTES DE VOLAR — cuatro pantallas, todas con PAUSA TOTAL ══

#### ▸ 1.1 — `M01_3` · **RÍO GALLEGOS · LA LÍNEA DE VUELO**
**VN · fuera del juego · pausa total** · placa `linea_amanecer` · img `M01_3`

| # | Quién | Texto | hold |
|---|---|---|---|
| 010 | NARRADOR | Esteban llega al nuevo escuadrón al que fue asignado. Uno de los pilotos, de pelo rizado, ceba mates para el resto de la ronda. Uno de ellos, con bigote, se acerca a recibirlo. | 3.0 |
| 020 | PUMA | Bienvenido a Los Fieles, Tero. Primera regla: siempre pegado al agua, el radar de ellos no te ve. Hay que volar tan bajo que tenés que volver con sal en las alas. Segunda regla: no hay. Con la primera alcanza. | 0 |
| 030 | GITANO | Tercera regla: el mate lo cebo yo. Y si no volvés... te lo cebo igual. Pero solo. Cebar solo es tristísimo, así que volvé. | 0 |
| 040 | PICHÓN | ¿Siempre van a hacer estos chistes? | 0.6 |
| 050 | VASCO | *(sin levantar la vista)* Es la manera que tienen de rezar. | 2.0 |

---

#### ▸ 1.2 — `M01_5B` · **LA CASADA**
**VN · fuera del juego · pausa total** · placa `m7_foto_frente` ⚠ · img `M01_5B`

| # | Quién | Texto | hold |
|---|---|---|---|
| 010 | NARRADOR | Media hora antes de salir de misión, en el vestuario, el Vasco cierra su locker rápidamente y se aparta. Se alcanza a ver la foto de una mujer. | 2.5 |
| 020 | GITANO | *(lo ve mirando y le habla desde el otro lado del banco)* Andá, mirala, Pichón. Está pegada adentro del locker. | 0.6 |
| 030 | NARRADOR | Una foto blanco y negro denota una bella mujer sonriente. Pichón se queda mirándola. | 2.5 |
| 040 | PICHÓN | *(sin sacarle los ojos de encima)* ...es hermosa. | 1.5 |
| 050 | GITANO | Le decimos "La Casada". No sabemos quién es, pero es seguro que ese minón tiene dueño. | 0.6 ⚠ |
| 060 | NARRADOR | *(el Vasco se persigna, sube la escalerilla y no contesta)* | — |

> ✅ **LA FOTO SE VE ACÁ.** *(Decisión del autor, 16/9.)* Cuando el Pichón dice *"...es hermosa"*,
> **la pantalla muestra la foto**: la placa es `m7_foto_frente` y así queda. El jugador ve a la
> mujer desde la primera misión.
>
> El giro de M7 no depende de esconderla, depende de **quién es**: el juego la llama *"La Casada"*
> durante siete misiones y el jugador mira su cara todo ese tiempo creyendo que sabe la historia.
>
> *(Nota de archivo: hay un comentario del 29/8 en `GUION_3.md` que proponía tapar la foto en M1 y
> mostrarla recién en M7. **Quedó descartado.** Se borra de `GUION_3.md` en la pasada de
> actualización hacia atrás.)*
>
> ⚠ **Lo único abierto acá es la línea 050**, porque conviven dos versiones con la misma fecha:
> `story.js` dice *"No sabemos quién es, pero es seguro que ese minón tiene dueño."* y `GUION_3.md`
> dice *"le decimos así porque no sabemos quién es, pero esa mujer no es de nadie que esté solo…"*,
> siguiendo con la teoría del político o el mafioso. **Elegí una y se unifica.**

---

#### ▸ 1.3 — `M01_TERITO` · **SU PÁJARO**
**VN · fuera del juego · pausa total** · placa `linea_amanecer`

| # | Quién | Texto | hold |
|---|---|---|---|
| 010 | NARRADOR | En el fuselaje del avión de Esteban, bajo la cabina, hay pintura fresca: un terito chiquito recortado en blanco, de perfil, quieto y alerta. Cuello finito, pecho compacto, y la cresta larga barriendo hacia atrás desde la nuca. | 2.5 |
| 020 | ESTEBAN | *(toca la pintura fresca con un dedo)* …¿Y esto? | 1.0 |
| 030 | EL TURCO | *(acomodando la escalerilla)* Su pájaro, Teniente. Acá los aviones van con nombre. | 1.5 |
| 040 | ESTEBAN | *(mira los otros aviones)* …¿Y el resto tienen estrellas? | 0.8 |
| 050 | EL TURCO | Sí. Tengo la costumbre de pintarles una estrella a cada uno por cada vuelta. | 0.8 |
| 060 | EL TURCO | *(golpeando el fuselaje como a un caballo)* Traémela entera, Tero. Y traete vos adentro, que la estrellita la pinto por vos, no por ella. | — |

> **La última frase no es sobre el avión. Nadie lo comenta, ni acá ni después** — esa es la regla
> que hace que no sea cursi.

---

#### ▸ 1.4 — `M01_CINCO` · **EL RITUAL DE LOS CINCO**
**VN · fuera del juego · pausa total** · placa `linea_amanecer`
**Sin música y sin una sola línea que explique ningún gesto.**

| # | Quién | Texto | hold |
|---|---|---|---|
| 010 | NARRADOR | Los cinco caminan hacia los aviones. No habla nadie. | 2.0 |
| 020 | NARRADOR | Puma no mira a nadie: da la vuelta al suyo y toca tres cosas, en orden, sin apurarse. Las mismas tres de hace veinte años. | 2.0 |
| 030 | NARRADOR | El Vasco apoya la cruz que lleva al cuello contra el fuselaje, la deja dos segundos, se persigna y sube. | 2.0 |
| 040 | GITANO | *(le señala su avión al Turco con el pulgar, y sube antes de que le contesten)* Turco, a ésta hoy le decimos «el Colectivo». Anotá. | 1.5 |
| 050 | NARRADOR | El Pichón no sube todavía: apoya la mano abierta en la chapa, al lado de la toma, con el motor ya girando. Se queda quieto, escuchando. Después mira al Turco y le hace que sí con la cabeza. | 2.5 |
| 060 | NARRADOR | Tero se para un segundo delante del suyo. Estira dos dedos y toca el terito recién pintado. No dice nada. | 2.0 |
| 070 | NARRADOR | El Turco los mira subir a los cinco desde atrás, con el trapo en el hombro. Cuando el último cierra la cúpula, le dice al avión más cercano algo que no se escucha. | 3.0 |

> **✅ SE QUEDA.** Es la semilla de M14: el jugador aprende los cinco gestos sin que nadie se los
> explique, misión tras misión, y recién al final entiende que los estuvo aprendiendo.

---

#### ▸ 1.5 — `M01_TARJETA` · **la tarjeta de misión**
**TARJETA · fuera del juego · pausa total** · capítulo 1

> **CON SAL EN LAS ALAS**
> *Mar abierto · Vuelo de adaptación*
> *OBJETIVO · Vuelo de adaptación sobre mar abierto. Aprender el rasante: cuanto más bajo, mejor.*

---

### ══ EL VUELO — de acá en adelante todo pasa DENTRO del juego ══

#### ▸ 1.6 — **DESPEGUE** · guionado, no se controla
La carrera y el ascenso. El odómetro **ya acredita durante el despegue**: al entrar al pasillo
marca ~155 m. *(Por eso el primer tramo corta en 0.12 y no antes.)*

#### ▸ 1.7 — **TRÁNSITO** · `{ tipo: 'transito', hasta: 0.10, pausa: true }` ⏳
**Dentro del juego · CONGELA hasta que el jugador acepta.** Es lo que marca que empezó una etapa.
Sin enemigos: el tipo `transito` no siembra nada.

#### ▸ 1.8 — `M01_OBJETIVO` · **CHARLA EN VUELO** · seguís volando y manejando; lo que se congela es el kilometraje y la nafta. Corre sola, no se saltea, tope 25 s ⚠
Hoy cuelga del tramo `{ hasta: 0.12 }`.

| # | Quién | Texto | hold |
|---|---|---|---|
| 010 | CÓNDOR | Escuadrilla Cauquén, aquí Cóndor. Adaptación sobre mar abierto, rumbo sudeste. | 0.6 |
| 020 | CÓNDOR | No hay nada que atacar hoy. Hay que aprender a volar abajo: cuanto más pegado al agua, mejor. **Buen vuelo.** | 0.8 |
| 030 | PUMA | Copiado. Vení atrás mío, Tero, y no me pierdas la cola. | 1.2 |

> La línea de Puma **es el tutorial de seguir al líder** (`persec: 1`).
> **"Buen vuelo"** es el cierre fijo de Cóndor en las trece misiones que lo tienen. Su ausencia en
> M14 es lo que hace doler el final.

#### ▸ 1.9 — **DESCENSO** · `{ tipo: 'descenso', hasta: 0.25 }` ⏳
Bajar al rasante. El tipo apaga las voces: la tensión no es el enemigo, es decidir cuándo bajar.

#### ▸ 1.10 — `M01_RITUAL` · **CHARLA EN VUELO** · seguís volando y manejando; lo que se congela es el kilometraje y la nafta. Corre sola, no se saltea, tope 25 s ⚠
Hoy cuelga del tramo `{ hasta: 0.21 }`. El ritual se dice **en el aire y no en tierra**, con el
mar pasando abajo, que es como se escuchaba de verdad.

| # | Quién | Texto | hold |
|---|---|---|---|
| 010 | CÓNDOR | Plata Fiel, Plata Fiel. Aquí Cóndor. | 0.6 |
| 020 | CÓNDOR | Cielo despejado al sur. Viento en la cola. | 0.5 |
| 030 | CÓNDOR | Reconocimiento de zona: vuelen bajito y a casa. | 0.8 |
| 040 | CÓNDOR | **Buena suerte, muchachos.** | 1.2 |

> El `hold` de la 040 es el más largo de la escena y es el único que importa: la fórmula termina,
> la radio queda abierta un segundo, y **lo único que hay en pantalla son los aviones volando
> juntos.**

#### ▸ 1.11 — **RASANTE** · `{ tipo: 'rasante', hasta: 0.60 }` ⏳
El pasillo como se juega siempre, mudo. Obstáculos del guion: **los mástiles de una flotilla
pesquera**, **un puente de chapa**, y **seguir a Puma entre las olas a cada vez menos altura**.
Cuanto más abajo, más puntúa.

#### ▸ 1.12 — `M01_GANSOS` · hoy charla en vuelo → ⏳ **pasa a RADIO DE FASE (sin pausa)**
Hoy cuelga del tramo `{ hasta: 0.30 }`.

| # | Quién | Texto | hold |
|---|---|---|---|
| 010 | GITANO | ¿Viste? Para el comando somos gansos. | 0.5 |
| 020 | GITANO | Por lo menos eligieron uno que vuela. | 0.8 |

> El chiste es que la escuadrilla se llama **Cauquén**, que es un ganso — y de paso le explica al
> jugador por qué cada misión tiene nombre de pájaro. **✅ Se queda**, pero como radio de fase: no
> tiene que frenar el juego.

#### ▸ 1.13 — **EL RADAR, EN MODO TUTORIAL** ⏳ *(decisión del autor)*
**Dentro del juego · no frena.** La barra de detección **se muestra y carga si trepás** (el techo
es `RADAR_ALT = 20`), Puma y Cóndor te avisan por radio, y **no pasa nada más**: nadie te ataca y
no se puede perder. Es la presentación del medidor **sin su castigo**, para que M2 no tenga que
enseñar la barra y la consecuencia al mismo tiempo. **Sin fase `filo`.**

#### ▸ 1.14 — **EL OBJETIVO: LOS TAMBORES** · `{ tipo: 'rasante', hasta: 1.00 }` ⏳
**Los tambores flotantes que el Turco tiró al mar como blancos de práctica.** Están escritos en
el guion. Se revientan **a cañón** — es el debut del cañón. **No hay Pulso.**

#### ▸ 1.15 — **CINEMÁTICA DE SALIDA** · toma el control, unos segundos
El avión yéndose. **No hay que generar nada**: se reusa uno de los diez clips existentes.
Cumple una función mecánica, no decorativa: **el pasillo no da la vuelta, la cinemática sí.**

#### ▸ 1.16 — **LA VUELTA** · `{ tipo: 'vuelta', hasta: 1.25, obstacles: 0.5, caza: 0 }` ⏳
Corta y **vacía**. Es la mitad de la forma que gobierna las catorce misiones, presentada acá sin
ningún peligro para que se entienda qué es.
⚠ **Trampa:** el tipo `vuelta` sube la siembra por su cuenta (`obstacles: 1.6`, `caza: 2`). M1
**tiene que pisarlo** o aparecen cazas en el tutorial.

#### ▸ 1.17 — **ATERRIZAJE** ⏳
Se mide velocidad, régimen de descenso, tren y actitud. Regla del juego entero: **un mal
aterrizaje cuesta chapa y puntaje, y nunca hace perder la misión.**
Desempeño máximo: **«Volviste con sal en las alas.»**

---

### ══ DESPUÉS DE VOLAR — tres pantallas, PAUSA TOTAL ══

#### ▸ 1.18 — `M01_7` · **TODOS VUELVEN**
**VN · fuera del juego · pausa total** · placa `linea_atardecer` · img `M01_7`

| # | Quién | Texto | hold |
|---|---|---|---|
| 010 | NARRADOR | El escuadrón aterriza. Vuelven los cinco. El Turco va de avión en avión con un pincel finito y la lengua afuera: cinco estrellitas, una en cada uno. | 2.5 |
| 020 | EL TURCO | Esta estrellita te pertenece. A vos, no al avión. | 0 |
| 030 | NARRADOR | Al menos por un ratito, esto parece una aventura. | 2.5 |

#### ▸ 1.19 — `M01_9` · **EL CUADERNO**
**TIERRA · fuera del juego · pausa total** · placa `p1c_cuaderno` · img `carta2_m1`

| # | Texto |
|---|---|
| 010 | Viejo: hoy conocí a un tipo, el cabo Correa. Correntino. Le dicen el Colorado. Me vio tiritando y me tiró un cuero de oveja sin decir nada — de una que carnearon los pibes acá, me dijo, con la lana para adentro. Abriga como estufa. |
| 020 | Parece un poncho de oveja, pá: me lo pongo y quedo hecho un gaucho. Después me enseñó a armar el pozo mirando de dónde viene el viento. Tiene una hermana de mi edad allá en Corrientes y unos mates que te levantan de la tumba. |
| 030 | No sé por qué, pero con él cerca tengo menos miedo. ¿Vos lo mandaste, no? No me mientas que te conozco, viejo. Gracias. |
| 040 | Lo dibujé con capa, como un superhéroe, y abajo le puse "el Colorado". Te vas a reír cuando lo veas. |

> **El cuero de oveja ES la capa.** Lo que a Mateo lo abriga es lo que hace héroe al otro, y el
> pibe lo dibuja sin darse cuenta de lo que está diciendo. **Nadie lo dice nunca.** Vuelve en M12,
> tapando a Mateo hasta el final.

#### ▸ 1.20 — `M01_HIST` · **PLACA HISTÓRICA** ⏳ *(escrita, falta pegar)*
El último beat del capítulo. Va **después** de la carta de Mateo, no después del vuelo.

**Y de acá se pasa directo a M2.** Sin menú, sin selección de nivel.

---

## 4 · QUÉ SE ENSEÑA Y QUÉ SE HABILITA

### El temario de M1 — lo que sólo esta misión enseña
1. La UI y los controles.
2. **El rasante:** volar pegado al agua puntúa mejor.
3. Los obstáculos naturales: mástiles, el puente.
4. **El cañón**, contra los tambores.
5. **Seguir al líder** y mantenerse en banda.
6. La barra de radar, **sin castigo**.
7. **Aterrizar.**
8. Que toda misión es **ida, objetivo y vuelta**.

### Qué tiene el jugador en las manos

| Elemento | En M1 | Detalle |
|---|---|---|
| Vuelo y rasante | ✅ | El núcleo |
| **Cañón** | ✅ **debuta** | Contra los tambores |
| Bombas | ❌ | `bombs: 0` |
| Pulso | ❌ | No hay blanco concreto, y no hay vocabulario de piruetas |
| **TONEL** | ✅ | Viene de fábrica: *"es lo primero que le muestra a Esteban"* |
| Resto de piruetas | ❌ | Se aprenden de M2 en adelante |
| Seguir al líder | ✅ | `persec: 1`: banda, puntos por segundo dentro, aviso por radio si te salís |
| Aterrizaje | ⏳ | Cierra la misión |

### Qué NO entra
Enemigos de cualquier tipo (`caza: 0`), bombas cayendo (`bombs: 0`), viento (`wind: false`),
lluvia, niebla, el Pulso, la Chancha.

### Qué se habilita al terminar
**Nada.** `ofertaTrasMision(0) = 0` — *el tutorial no entrega mejoras.* La primera llega servida
después de M2.

---

## 5 · QUÉ PASA SI TE PEGAN

**En campaña NADIE muere por gameplay.** Norma del proyecto, escrita en `pilots.js`:

> *El avión alcanzado queda **averiado** y rompe formación rumbo a la base; los Fieles mueren
> únicamente cuando el guion lo dice.*

Si tu avión queda fuera de combate, **asumís el siguiente piloto del roster**:
`TERO → PUMA → GITANO → VASCO → PICHÓN`. Cinco aviones = cinco relevos. Cambia el indicativo y
cambia la voz; la misión sigue.

**En M1 casi no puede pasar**, y es a propósito: no hay enemigos. Las únicas formas de romper el
avión son **el mar, los obstáculos y la torpeza propia** — y una más: **chocar a Puma**. Volarle
encima al líder es tan fatal como comerse un mástil, y **el que se mata es el que choca**: el
líder sigue volando.

---

## 6 · PENDIENTES

### ⏳ Decidido, falta hacer
1. Declarar `fases:` en `m1`, **pisando la siembra del tipo `vuelta`**.
2. Los **tambores** como objetivo visible al final de la ida.
3. El **radar en modo tutorial**.
4. La **vuelta** y el **aterrizaje**.
5. `M01_GANSOS` pasa de charla en vuelo a **radio de fase**.
6. Pegar **`M01_HIST`**.
7. Unificar la línea 050 de `M01_5B` (dos versiones conviven — ver §3.1.2).
8. Borrar de `GUION_3.md` el comentario del 29/8 que proponía tapar la foto en M1: **descartado**.

### ⚠ Bugs
9. **Las charlas en vuelo no dibujan nada.** Corren su máquina de estados, congelan el odómetro
   hasta 25 s y **no muestran una letra**: `drawStory` es lo único que las pinta y `game.js` lo
   llama sólo en los estados `story` y `epilogue`. Se come `M01_OBJETIVO`, `M01_RITUAL` y
   `M01_GANSOS`, más las charlas de M2, M3 y M4. **Es el bug más caro del proyecto.**
10. **El terito no está pintado en el sprite.** La cámara mira desde atrás y ~10° arriba: el
    flanco del fuselaje no aparece en ningún alabeo. Necesita decisión de arte.

### 🗑 Para borrar cuando se confirme que manda `story.js`
11. `strings.js → storyM1` / `epiM1`. Divergen: ahí Puma dice *"Bienvenido a la Plata"* y el
    Colorado tira *"una media de lana"* en vez del cuero de oveja. También hay que sacar el campo
    `story: 'storyM1'` de `missions.js` si ya no se usa.

---

## 7 · CORRECCIONES DEL AUTOR

*(Escribir acá. Lo que se escriba en esta sección manda.)*

-
-
-
