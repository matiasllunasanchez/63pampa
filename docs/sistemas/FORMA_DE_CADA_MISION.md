# LA FORMA DE CADA MISIÓN

> **Qué es.** El repaso misión por misión de las catorce. Por cada una: el **contexto** (dónde
> está la historia), los **diálogos** de antes y de durante, **qué se le enseña y qué se le
> habilita** al jugador, la **estructura** (ida / objetivo / vuelta) y la **cinemática** que
> necesita.
>
> **Por qué existe.** Porque la pregunta operativa es *qué cinemáticas hay que generar*, y esa
> lista no se puede armar sin haber decidido antes qué pasa en cada misión. Y porque **las
> primeras misiones son las que tienen que explicar todo lo que el juego tiene para dar**: si el
> temario no está repartido a propósito, o se explica dos veces o no se explica nunca.
>
> **Hermanos.** `PLAN_MISION_CINCO_FASES.md`, `CINEMATICAS_FIN_DE_NIVEL.md`, `PLAN_EL_PULSO.md`,
> `PLAN_PULSO_CABINA_VIDEO.md`, `PLAN_660_CREDITOS.md`, `CONTROLES.md`, `GUION_3.md`.
>
> **Estado:** M1, M2 y M3 trabajadas. M4–M14 pendientes.

---

## 1 · LA LEY

**Todas las misiones son IDA + OBJETIVO + VUELTA.** Sin excepción, incluida la primera.

- **La IDA** es esquivar y sostener el rasante para no ser visto. La tensión es el radar y el
  agua, no el enemigo.
- **El OBJETIVO** es lo que fuiste a hacer, y termina en cinemática.
- **La VUELTA** es la guerra: el radar importa mucho menos —ya llegaste, ya te vieron— y lo que
  importa es esquivar enemigos y llegar a zona segura.

No es una propuesta nueva: es la forma que `PLAN_MISION_CINCO_FASES.md` definió y que `t15 · IDA
Y VUELTA` ya probó. Lo que este documento agrega es **aplicarla a las catorce**.

---

## 2 · LO QUE YA ESTÁ EN EL CÓDIGO

Para que nadie lo vuelva a planificar:

- **`src/data/fases.js`** — los seis tipos: `transito`, `filo`, `descenso`, `rasante`, `blanco`,
  `vuelta`. Cada tipo trae defaults y una misión los pisa nombrándolos.
- **`FASE_MAX_HASTA = 4`** — las fracciones de `hasta` **pasan de 1 a propósito**: `1` es el
  objetivo, y todo lo que sigue es la vuelta.
- **`t15 · IDA Y VUELTA`** en `pruebas_misiones.js` — doce fases, ya jugada, con el feedback del
  autor del 13/9 incorporado.
- **Despegue y aterrizaje** — `runways.js` y las constantes de `tuning.js`. Regla que manda: *un
  mal aterrizaje CUESTA (chapa y puntaje) y NUNCA hace perder la misión.*
- **`pinta`** — qué pasa si el radar te completa la carga. `'cap'` (default) no mata: te saca el
  silencio, y de ahí en adelante **el mundo te espera armado**.
- **`upgrades.js` · `ofertaTrasMision(i)`** — el calendario de mejoras, ya escrito: **el tutorial
  no entrega nada; después de la segunda misión se entrega UNA servida; de la tercera en adelante
  se ofrecen DOS y se elige UNA.**
- **⚠ ARENA y PASADA están en cuarentena** (`data/cuarentena.js`). Hoy **el único clímax que se
  juega es EL PULSO**, aunque la misión declare otra cosa.

**Lo que falta:** que las catorce misiones de campaña declaren `fases:`. Hoy ninguna lo hace.

---

## 3 · LAS REGLAS TRANSVERSALES

### 3.1 · El pasillo no gira. La cinemática es el giro.
No hay vuelta hacia atrás, ni espejo, ni 180°. En `t15` la vuelta son fases que **siguen
avanzando para el mismo lado**. Lo que vende el regreso son cuatro cosas, ninguna geométrica: la
radio, el mundo que pasa de vacío a defendido, la nafta que baja distinto porque venís liviano
(`nafta: 0.85`), y sobre todo **la cinemática de SALIDA**, que va entre el objetivo y la vuelta.
El jugador ve el avión irse y acepta solo que va para casa.

Refuerzo gratis y opcional: invertir el orden del terreno (ida mar → costa → isla; vuelta isla →
costa → mar). Es una lista de datos, no toca motor.

### 3.2 · En la IDA no te tiran — salvo que te vean.
La ida entera es el tramo en el que **no te vieron**. Si el radar te completa la carga, `pinta:
'cap'` hace que de ahí en adelante el mundo te espere armado. **La amenaza de la ida sos vos.**

### 3.3 · Una bomba cayendo es información, no dificultad.
Significa exactamente una cosa: **te vieron**. Por eso no se siembran bombas en la ida ni "para
que sea más difícil". Son el vocabulario con el que el juego avisa que pasaste de fantasma a
blanco.

### 3.4 · El largo de la vuelta es la perilla. Su existencia no.
Todas tienen vuelta. Se regula cuánto dura y qué tan poblada está. **Nunca se saca**: si una
misión la pierde, el jugador deja de entender que la forma del juego es ir y volver.

### 3.5 · Las cinemáticas son ranuras, no una por misión.
`[SALIDA] + [MUERTE]`. La SALIDA es **una sola** para las catorce. Lo que cambia es la MUERTE, y
los tipos distintos que necesita toda la campaña son alrededor de seis. Ver §6.

### 3.6 · El Pulso sólo aparece cuando hay algo concreto que destruir.
*(Decisión del autor.)* No es "el objetivo de toda misión": es la secuencia de armar y soltar
sobre **un blanco real**. Una misión de adaptación o una patrulla **no llevan Pulso**, aunque
tengan objetivo. Lo que no es Pulso se resuelve **con el cañón**: los blancos chicos —tambores,
boyas, un radar portátil— son del cañón, y ahí es donde se enseña.

### 3.7 · El Pulso se teclea con piruetas aprendidas.
Está en `pulso.js`: *"Ningún compás se inventa: cada uno es la secuencia REAL de una pirueta del
juego… en campaña solo salen las piruetas que el jugador tiene APRENDIDAS (la libreta del
Pichón)."* **Consecuencia dura: el Pulso no puede debutar antes de que haya vocabulario.** Con el
calendario de `ofertaTrasMision`, recién llegando a M4 el jugador tiene tres maniobras. Por eso
M4 no es sólo el lugar narrativamente correcto para el primer Pulso: es el primero posible.

---

## 4 · EL TEMARIO — qué tiene que enseñar el juego, y dónde debuta cada cosa

| Cosa | Debuta | Cómo se enseña |
|---|---|---|
| Volar, la UI, el rasante | **M1** | Cóndor lo pide por radio; el puntaje premia ir más abajo |
| Obstáculos naturales | **M1** | Mástiles de la flotilla pesquera, puente de chapa |
| El cañón | **M1** | Los tambores que tiró el Turco al mar |
| Seguir al líder | **M1** | *"Vení atrás mío, Tero, y no me pierdas la cola"* |
| Aterrizar | **M1** | La misión termina con las ruedas en el piso |
| El TONEL | **M1** | Viene de fábrica: *"es lo primero que le muestra a Esteban"* |
| La barra de radar (sin castigo) | **M1** | Modo tutorial: sube, te avisan por radio, no pasa nada |
| El radar con castigo / `filo` | **M2** | La misma barra, ahora cuesta. El puesto del islote la carga |
| Que te disparen | **M2** | Harriers y misiles en la vuelta |
| Bombas cayendo | **M2** | En la vuelta, y significan "te vieron" |
| Averías / chapa | **M2** | El Pichón aterriza agujereado; el Turco remienda |
| Las estrellitas del Turco | **M2** | *"Esa no es del avión. Es tuya."* |
| Primera mejora (servida) | **tras M2** | TERRAIN MASKING, sin elegir |
| **Sentir una mejora** | **M3** | El avión responde distinto en las manos |
| **Elegir mejora** | **tras M3** | Dos ofrecidas, se elige una — de acá en adelante siempre |
| El Pulso | **M4** | Primer blanco concreto, y recién ahí hay vocabulario |
| La Chancha | ⏳ por definir | — |

---

## 5 · LAS MISIONES

---

### M1 · CON SAL EN LAS ALAS

> ⚠ **Desactualizado por la tanda del 17/9.** Lo que sigue es el plan anterior. M1 quedó con radar
> por voz (no barra), corte a negro en el giro (no cinemática), sin muerte ni relevo, sin Chancha
> (se nombra), sin poderes (van en M2) y con lecciones repartidas. La versión vigente está en
> `historia/misiones/M1_LECTURA.md` y el detalle en `historia/misiones/M1_CAMBIOS.md`.

*fines de abril de 1982* · `goal: distance, meters 2200` · `cfg: dawn, wind false, obstacles 0.5,
bombs 0, caza 0, persec 1`

**CONTEXTO.** Río Gallegos, de madrugada. Es la misión de **conocer a la familia**. Esteban llega
nuevo. El Turco ceba mate como quien da la comunión. El guion la define sin ambigüedad: *tutorial
puro, sin jefe, sin enemigos, sin un solo disparo enemigo.*

**DIÁLOGOS — ANTES.**
- `M01_3` · **La línea de vuelo.** Puma da la única regla: *"siempre pegado al agua, el radar de
  ellos no te ve… tan bajo que tenés que volver con sal en las alas. Segunda regla: no hay."* El
  Gitano se adjudica el mate. El Vasco, sobre los chistes: *"Es la manera que tienen de rezar."*
- `M01_5B` · **La casada.** El vestuario. La foto en el locker del Vasco, que **el jugador no
  ve** — se describe, se le pone nombre, y la ve recién en M7.
- `M01_TERITO` · **Su pájaro.** El terito blanco recién pintado bajo la cabina. *"Traémela entera,
  Tero. Y traete vos adentro, que la estrellita la pinto por vos, no por ella."*
- `M01_CINCO` · **El ritual de los cinco.** Diez segundos, cinco gestos, **sin una sola línea**.
  Se cobra en M14.
- `M01_TARJETA` — *Mar abierto · Objetivo: dominar el vuelo rasante.*

**DIÁLOGOS — DURANTE.** `M01_OBJETIVO` (Cóndor: *"No hay nada que atacar hoy. Hay que aprender a
volar abajo"* + Puma: *"Vení atrás mío, Tero"*), `M01_RITUAL`, `M01_GANSOS` (el respiro).
⚠ `M01_CINCO` y `M01_GANSOS` siguen sin decisión del autor sobre si se quedan.

**QUÉ SE ENSEÑA.** La UI, el rasante, los obstáculos naturales, **el cañón**, seguir al líder y
**aterrizar**. El TONEL ya viene puesto.
**QUÉ SE HABILITA.** Nada: `ofertaTrasMision(0) = 0`, el tutorial no entrega mejoras.

**ESTRUCTURA.**
- **Ida** — **radar en modo tutorial** *(decisión del autor)*. La barra de detección se muestra y
  carga si trepás, Puma y Cóndor te avisan por radio, y **no pasa nada más**: nadie te ataca y no
  se puede perder. Es la presentación del medidor sin su castigo, para que M2 no tenga que enseñar
  las dos cosas juntas. Sin fase `filo`. Obstáculos del guion: mástiles de una flotilla pesquera,
  un puente de chapa, seguir a Puma entre las olas a cada vez menos altura.
- **Objetivo** — **los tambores flotantes que el Turco tiró al mar como blancos.** Ya están
  escritos en el guion, y resuelven de un saque el problema de que el final de M1 sea un número
  invisible: el objetivo tiene cuerpo, es del Turco, y es del cañón. *(Esto reemplaza la boya que
  yo había propuesto: no hacía falta inventarla.)*
- **Vuelta** — corta y vacía. **Ojo con el default:** el tipo `vuelta` sube la siembra por su
  cuenta (`obstacles: 1.6, caza: 2`), así que M1 tiene que pisarlo.
- **Cierre** — aterrizaje. Desempeño máximo: *"Volviste con sal en las alas."*

**CINEMÁTICA.** Ninguna nueva. Ranura SALIDA con uno de los diez clips ya generados.

```js
fases: [
  { tipo: 'transito', hasta: 0.10, radio: 'm1_salida', pausa: true },
  { tipo: 'descenso', hasta: 0.25, radio: 'm1_descenso' },
  { tipo: 'rasante',  hasta: 0.60, radio: 'm1_rasante' },
  { tipo: 'rasante',  hasta: 1.00, radio: 'm1_tambores' },
  { tipo: 'vuelta',   hasta: 1.25, radio: 'm1_casa', obstacles: 0.5, caza: 0 },
],
```

---

### M2 · EL BAUTISMO DE FUEGO
*1 de mayo de 1982* · `goal: distance, meters 2600`

**CONTEXTO.** El 1 de mayo: el día que bombardearon la pista de Puerto Argentino. **La primera de
verdad.** Van a terreno hostil por primera vez.

**DIÁLOGOS — ANTES.**
- `M02_1` · **La brecha.** Puma: *"Ellos tienen la máquina. Nosotros tenemos las manos. Vamos a
  volar tan bajo que la máquina no va a poder creer que alguien esté tan loco."* Esteban: *"¿Y
  alcanza?"* Puma, pausa larga: *"No. Pero es lo que hay… Como en el potrero, Tero: cuando el
  rival tiene botines y vos estás descalzo, gambeteás más pegado al piso."*
- `M02_MATE` · **La ronda.** El **THANK YOU** del Gitano —la reverencia ridícula, entera, para
  nadie—. *"Porque si digo gracias me sacan de la ronda, pibe. Y yo de la ronda no me voy."* El
  Turco: *"De la ronda no se va nadie."* *(Tiene miniatura de arte ya prompteada:
  `gitano_gracias.png`.)*
- `M02_TARJETA`.

**DIÁLOGOS — DURANTE.** `M02_OBJETIVO` — *"Radar activo en toda la aproximación."*

**QUÉ SE ENSEÑA.** **El radar y la fase `filo`.** Que te disparen. Que caigan bombas. Las
averías y la chapa.
**QUÉ SE HABILITA.** Después de la misión, la **primera mejora, servida sin elegir**
(`ofertaTrasMision(1) = 1`): **TERRAIN MASKING** — *"Si abajo no nos ven… ¿por qué subimos?"*.
Es la mejora exacta para la misión del radar, y el calendario ya la deja ahí sola.

**ESTRUCTURA.**
- **Ida** — rasante, sin enemigos puestos, **salvo que te vean** (regla 3.2). Acá debuta `filo` y
  acá el radar **empieza a costar**: la misma barra de M1, ahora con castigo.
- **Objetivo** — **un islote con un puesto avanzado británico** *(decisión del autor)*. El puesto
  tiene la antena, y **mientras está en pie es el que te carga la barra**. Se revienta **a cañón**
  (la entidad `radar` ya existe: HP 2, sprite y despiece propios), y al caer **la barra deja de
  subir por el resto de la misión**.
  Esto es lo que resuelve el conflicto entre el guion (*"Boss: radar británico"*) y el código
  (`kind: distance`): el guion tenía razón, y el objetivo **es la explicación de la mecánica** —
  el jugador entiende sin un solo cartel qué era esa cosa que lo venía apretando desde M1.
  **Sin Pulso** (regla 3.6): es cañón.
- **Vuelta** — completa y hostil. **Acá te tiran por primera vez en toda la campaña**, y acá
  **caen bombas por primera vez**. Es donde pasa el título: el bautismo de fuego no es disparar,
  es que te disparen. El guion lo confirma en el epílogo: *"Pichón aterriza agujereado, manos
  temblando; el Turco lo abraza sin decir nada y remienda chapa toda la noche."*

**DIÁLOGOS — DESPUÉS.** `M02_5` (el epílogo del Pichón agujereado y la estrellita: *"Esa no es
del avión. Es tuya."*) y `M02_8` (el cuaderno: comieron una vez en todo el día, Bordón y las
cajas, cantar en el pozo, y el recordatorio subrayado *pedir a mamá que prepare guiso*).

> **Pendiente de código:** la línea `M02_OBJETIVO_020` de Cóndor dice hoy *"Entran, cruzan y
> vuelven. Nada más."*, escrita cuando la misión era de pura distancia. Con el puesto avanzado como
> objetivo hay que reescribirla.

---

### M3 · EL INVENTO
*primeros días de mayo de 1982* · `goal: distance, meters 2400`

**CONTEXTO.** Amanecer tranquilo, *"de esos que la guerra regala para confundir"*. Es **la misión
de la comedia**, y termina siendo la más triste. El Pichón está trepado a una escalera contra el
avión de Esteban, con la manga sucia de grasa, explicando que si le corren la toma dos dedos y le
sacan peso muerto, en la salida del rasante gana empuje. El Turco: *"Changuito… eso no se puede."*
El pibe se baja avergonzado. Pausa larga. El Turco mira el fuselaje, mira al pibe: **"…A ver.
Mostrame."**

**DIÁLOGOS — ANTES.**
- `M03_INVENTO` · El Pichón en la escalera, el Turco de tribunal, y las apuestas: Gitano diez mil
  a que lo manda a cagar antes del mediodía; Puma veinte mil a que lo prueba igual.
- `M03_TARJETA`.

**DIÁLOGOS — DURANTE.** `M03_OBJETIVO` — Cóndor: *"Patrulla de reconocimiento costero. Blancos de
oportunidad nada más: boyas, un radar portátil si aparece. Sin presión."* Y el Turco encima:
*"Y me lo prueban despacio al invento del changuito, ¿eh? Despacio."*

**QUÉ SE ENSEÑA.** **El sistema de mejoras**, y el guion es explícito: *"La mecánica de mejoras se
enseña acá, en la misión más liviana, no en el medio del fuego."* La gracia jugable es que **el
avión responde distinto en las manos** — venís de instalar TERRAIN MASKING después de M2 y esta
misión existe para que la sientas. Cero presión, vuelo libre.
Es también la misión para **repasar sin costo** lo que M1 y M2 enseñaron: cañón contra las boyas
y el radar portátil, rasante, obstáculos.
**QUÉ SE HABILITA.** Después de M3 arranca la **elección**: dos mejoras ofrecidas, se elige una,
y así hasta el final (`ofertaTrasMision(2) = 2`). El guion lo dice igual: *"A partir de acá, tras
cada misión, el juego ofrece dos mejoras y se elige una."*

**SIN PULSO.** Por la regla 3.6: no hay un blanco concreto que destruir, hay blancos de
oportunidad. Se resuelven con cañón.

**ESTRUCTURA.**
- **Ida** — rasante con radar (ya estrenado en M2), sin enemigos puestos salvo que te vean.
- **Objetivo** — boyas de señalización enemigas y un radar portátil *"si aparece"*. Cañón.
- **Vuelta** — corta (`hasta: 1.3`), con obstáculos y sin cazas.

**DIÁLOGOS — DESPUÉS.** Y acá está el verdadero final de la misión:
- `M03_ARANDELA` · **El primer fracaso glorioso.** El segundo invento del Pichón hace un ruido
  espantoso, tira una pieza volando y le vuela el gorro al Turco. *"No sirve ni acá, changuito."*
  — *"…Interesante."*
- `M03_BURRADA` · **La burrada del Gitano** — el homenaje a la maniobra imposible. *Se paga en
  M9, en la libreta.*
- `M03_CUADERNO` · La navaja del Colorado.
- `M03_BELGRANO` · **2 de mayo.** *"…Hundieron al Belgrano."* La risa se corta a la mitad. 323
  muertos, dos días antes de la misión que sigue.

**CINEMÁTICA.** **Ninguna.** El final emocional de M3 no está en el aire: es el hangar y el
Belgrano, y eso son escenas VN. El impacto en boya que había propuesto generar acá **se mueve a
M6**, que es donde de verdad lo necesita (`muerte_sorda`).

---

### ⏳ M4 · EL DÍA QUE SANGRÓ EL MAR — *4 de mayo* · `ship: HMS SHEFFIELD`
Pendiente. **Acá debuta el Pulso** (reglas 3.6 y 3.7).

### ⏳ M5 · EL CALLEJÓN DE LAS BOMBAS — *21 de mayo* · `ship: HMS ARDENT` · `climax: arena` ⚠ en cuarentena
Pendiente.

### ⏳ M6 · LA BOMBA QUE NO DESPERTÓ — *23 de mayo* · `ship: HMS ANTELOPE`
Pendiente. **Ya tiene cinemática asignada:** `muerte_sorda` — impacto y después nada.

### ⏳ M7 · PASTELITOS — *25 de mayo* · `ship: HMS COVENTRY` — **muere el Vasco**
Pendiente. Acá se ve por fin la foto de La Casada.

### ⏳ M8 · EL BATIR DE LAS ALAS — *25 de mayo, 2ª salida* · `ship: ATLANTIC CONVEYOR`
Pendiente. Propias: `muerte_carguero` y `muerte_alas` (una sola vez en la campaña).

### ⏳ M9 · EL PIBE — *27 de mayo* · `kind: distance` — **muere el Pichón**
Pendiente. **Única misión que promete un blanco y no lo tiene**: Cóndor nombra el centro logístico
de San Carlos en pantalla. Se paga acá la burrada del Gitano, en la libreta.

### ⏳ M10 · LOS PRIMOS — *5 de junio* · `kind: distance`
Pendiente. Reconocimiento armado, no promete blanco → **sin Pulso**. *"El clima está peor que el
enemigo."* La primera con tres.

### ⏳ M11 · LO QUE NO SE DICE — *8 de junio* · `ship: RFA SIR GALAHAD`
Pendiente.

### ⏳ M12 · ÁNGEL DE CORRIENTES — *8 de junio, 2ª salida* · `ship: RFA SIR TRISTRAM`
Pendiente. Muere Correa. Vuelve la navaja.

### ⏳ M13 · LA CENA — *11 de junio* · `ship: HMS BROADSWORD`
Pendiente. El barco queda **dañado, no hundido**. El asado, y la avivada del ITB.

### ⏳ M14 · EL TERO — *12 de junio, madrugada* · `ship: HMS GLAMORGAN` · `climax: arena` ⚠ en cuarentena
Pendiente. Única misión **sin escena `OBJETIVO`**: está negada y suben igual. Se cobran el ritual
de los cinco y el gesto del terito.

---

## 6 · INVENTARIO DE CINEMÁTICAS

Esto es lo que hay que **generar**; todo lo demás se compone con ranuras.

| Ranura | Pieza | Misiones | Estado |
|---|---|---|---|
| SALIDA | el avión yéndose | las 14 | ✅ ya existe entre los 10 clips |
| MUERTE | impacto **sin estallido** (`muerte_sorda`) | M6 | ⏳ por generar — el más importante |
| MUERTE | buque de guerra hundiéndose | M4, M5, M7 | ⏳ por definir |
| MUERTE | carguero (`muerte_carguero`) | M8 | ⏳ por definir |
| MUERTE | buque de desembarco / fuego | M11, M12 | ⏳ por definir |
| MUERTE | daño sin hundimiento | M13, M14 | ⏳ por definir |
| MUERTE | blanco terrestre (`muerte_tierra`) | M9 | ⏳ por definir |
| FALLO | el Pulso falla | M4+ | ⏳ por definir |

**M1, M2 y M3 no necesitan clip nuevo.** El puesto del islote de M2 se resuelve con el despiece
que el juego ya tiene para la entidad `radar`.

---

## 7 · DECISIONES ABIERTAS

- ⚠ **M1:** si `M01_CINCO` y `M01_GANSOS` se quedan.
- ⚠ **La Chancha:** en qué misión debuta.
- ⚠ Si el refuerzo de terreno invertido en la vuelta (3.1) se hace o se deja para después.
