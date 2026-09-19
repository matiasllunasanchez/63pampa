# LA FORMA DE CADA MISIÓN

> **Qué es.** El repaso misión por misión de las catorce, cerrando para cada una: cuál es su
> OBJETIVO, si lleva Pulso, qué cinemática necesita y cómo es su vuelta. Se va llenando de a
> una, en orden, y cada entrada queda cerrada por decisión del autor.
>
> **Por qué existe.** Porque la pregunta operativa es **qué cinemáticas hay que generar**, y esa
> lista no se puede armar sin haber decidido antes qué pasa al final de cada misión. Este
> documento es el paso previo al gasto de créditos.
>
> **Hermanos.** `PLAN_MISION_CINCO_FASES.md` (la estructura y su justificación),
> `CINEMATICAS_FIN_DE_NIVEL.md` (la arquitectura de ranuras), `PLAN_EL_PULSO.md` y
> `PLAN_PULSO_CABINA_VIDEO.md` (el objetivo), `PLAN_660_CREDITOS.md` (el presupuesto).
>
> **Estado:** M1, M2 y M3 cerradas. M4–M14 pendientes.

---

## 1 · LA LEY

**Todas las misiones son IDA + OBJETIVO + VUELTA.** Sin excepción, incluida la primera.

- **La IDA** es esquivar y sostener el rasante para no ser visto. La tensión es el radar y el
  agua, no el enemigo.
- **El OBJETIVO** es el Pulso, y termina en cinemática.
- **La VUELTA** es la guerra: el radar importa mucho menos —ya llegaste, ya te vieron— y lo que
  importa es esquivar enemigos, barcos y lo que salga a buscarte, y llegar a zona segura.

Esto no es una propuesta nueva: es la forma que `PLAN_MISION_CINCO_FASES.md` ya definió y que
`t15 · IDA Y VUELTA` ya probó. Lo que este documento agrega es **aplicarla a las catorce**, una
por una, decidiendo caso por caso qué va en el medio.

---

## 2 · LO QUE YA ESTÁ EN EL CÓDIGO

Para que nadie lo vuelva a planificar:

- **`src/data/fases.js`** — la tabla de los seis tipos: `transito`, `filo`, `descenso`,
  `rasante`, `blanco`, `vuelta`. Cada tipo trae sus defaults y una misión los pisa nombrándolos.
- **`FASE_MAX_HASTA = 4`** en `tuning.js` — las fracciones de `hasta` **pasan de 1 a propósito**:
  `1` es el objetivo y todo lo que sigue es la vuelta.
- **`t15 · IDA Y VUELTA`** en `pruebas_misiones.js` — doce fases declaradas, ya jugada, con el
  feedback del autor del 13/9 incorporado a la forma.
- **Despegue y aterrizaje** — `runways.js` y las constantes de aterrizaje de `tuning.js`. La
  regla que manda: *un mal aterrizaje CUESTA (chapa y puntaje) y NUNCA hace perder la misión.*
- **`pinta`** — qué pasa si el radar te completa la carga. `'cap'` (default) no te mata: te
  quita el silencio, y de ahí en adelante **el mundo te espera armado**. `'muerte'` es la
  versión seca.

**Lo que falta:** que las catorce misiones de campaña declaren `fases:`. Hoy ninguna lo hace.

---

## 3 · LAS CINCO REGLAS TRANSVERSALES

Salieron de cerrar M1–M3 y valen para las catorce.

### 3.1 · El pasillo no gira. La cinemática es el giro.
No hay vuelta hacia atrás, ni espejo, ni 180°. En `t15` la vuelta son fases que **siguen
avanzando para el mismo lado**. Lo que vende el regreso son cuatro cosas, ninguna geométrica:
la radio, el mundo que pasa de vacío a defendido, la nafta que baja distinto porque venís
liviano (`nafta: 0.85`), y sobre todo **la cinemática de SALIDA**, que se reproduce entre el
objetivo y la vuelta. El jugador ve el avión irse y acepta solo que va para casa.

Refuerzo gratis y opcional: invertir el orden del terreno. La ida va mar abierto → costa →
isla; la vuelta, isla → costa → mar abierto. Es una lista de datos, hermana de `IDA_MAR` e
`IDA_DEFENSA`. No toca motor.

### 3.2 · En la IDA no te tiran — salvo que te vean.
La ida entera es el tramo en el que **no te vieron**. Está dicho textual en `t15`: *"una bomba
cayendo del cielo significa QUE TE VIERON, y la ida entera es el tramo en el que no te vieron"*.

Eso no la vuelve inofensiva: si el radar te completa la carga, `pinta: 'cap'` hace que de ahí en
adelante el mundo te espere armado. O sea que **la ida no tiene enemigos puestos a mano, pero sí
tiene enemigos que aparecen si fallás**. La amenaza de la ida es tu propio error, no el guion.

### 3.3 · Una bomba cayendo es información, no dificultad.
Una bomba en pantalla significa exactamente una cosa: **te vieron**. Por eso no se siembran
bombas en la ida ni "para que sea más difícil". Son el vocabulario con el que el juego avisa que
pasaste de fantasma a blanco.

### 3.4 · El largo de la vuelta es la perilla. Su existencia no.
Todas las misiones tienen vuelta. Lo que se regula es cuánto dura y qué tan poblada está. Una
vuelta de `hasta: 1.25` vacía y una de `hasta: 2.0` llena son la misma estructura con distinta
dosis. **Nunca se saca la vuelta**: si una misión la pierde, el jugador deja de entender que la
forma del juego es ir y volver, y la próxima vez que aparezca le va a parecer una fase nueva.

### 3.5 · Las cinemáticas son ranuras, no una por misión.
`[SALIDA] + [MUERTE]`. La SALIDA es **una sola** para las catorce. Lo que cambia es la MUERTE, y
los tipos distintos que necesita toda la campaña son alrededor de seis. Ver §5.

---

## 4 · LAS MISIONES

### ✅ M1 · CON SAL EN LAS ALAS — *fines de abril de 1982*

`goal: { kind: 'distance', meters: 2200 }` · `cfg: sky dawn, wind false, obstacles 0.5, bombs 0,
caza 0, persec 1`

**Qué es.** El tutorial, y es el tutorial de **la forma entera**, no de una parte. Despegue,
rasante, objetivo, cinemática, vuelta, aterrizaje — el loop completo en su versión más simple.
De acá en adelante cada misión es ésta con cosas agregadas, y no hay que volver a explicar nada.

**Objetivo.** Llegar a los 2200 m. **Sin Pulso**: todavía no lleva bombas y no corresponde.

**Sin radar.** En M1 el radar **no existe**. La llegada se marca de otra manera —no por haber
sobrevivido a una detección— porque todavía no están en terreno hostil.
⚠ *Pendiente de decisión:* si el punto de llegada se marca con **una boya** (le da un cuerpo al
final, que hoy es un número invisible) o con otra señal.

**Enemigos.** Ninguno, en toda la misión. `caza: 0` y `bombs: 0` ya están en su cfg.

**Amenaza.** Sólo obstáculos naturales y el agua. Es lo que Cóndor pide por radio: *"No hay nada
que atacar hoy. Hay que aprender a volar abajo: cuanto más pegado al agua, mejor."*

**Qué enseña.** La UI, sostener el rasante, esquivar lo que hay abajo, y que la misión termina
con las ruedas en el piso.

**Sin `filo`.** El tipo `filo` —techo estrangulado y castigo si te detectan— **debuta en M2**.
En M1 no hay a quién esconderse.

**Cinemática.** Ninguna nueva. Se usa la ranura SALIDA con uno de los diez clips ya generados
(el del avión pasando / yéndose).

**Vuelta.** Corta y vacía. **Ojo con el default:** el tipo `vuelta` sube la siembra por su cuenta
(`obstacles: 1.6, caza: 2`), así que M1 tiene que pisarlo explícitamente.

**Fases propuestas:**

```js
fases: [
  { tipo: 'transito', hasta: 0.10, radio: 'm1_salida', pausa: true },
  { tipo: 'descenso', hasta: 0.25, radio: 'm1_descenso' },
  { tipo: 'rasante',  hasta: 0.60, radio: 'm1_rasante' },
  { tipo: 'rasante',  hasta: 1.00, radio: 'm1_llegada' },
  { tipo: 'vuelta',   hasta: 1.25, radio: 'm1_casa', obstacles: 0.5, caza: 0 },
],
```

---

### ✅ M2 · EL BAUTISMO DE FUEGO — *1 de mayo de 1982*

`goal: { kind: 'distance', meters: 2600 }`

**Qué es.** **La primera misión real.** Van a Puerto Argentino a ayudar y a revisar qué quedó
después del bombardeo del 1 de mayo. Es la primera vez que entran en terreno hostil.

**El radar debuta acá.** En M1 no existía; en M2 sí, y es la tensión central de la ida. Está
dicho por Cóndor: *"Radar activo en toda la aproximación. Entran, cruzan y vuelven. Nada más."*
Acá es donde aparece el tipo `filo`.

**Ida.** Rasante, normal, **sin enemigos puestos — a menos que te vean** (regla 3.2). Si el
radar te completa la carga, `pinta: 'cap'`: no perdés, pero el resto de la misión te espera
armado.

**Objetivo.** Llegás y **VES**. La cinemática es de **llegada**, no de muerte: el cráter en la
pista, el destrozo, lo que pasó sin ellos. **Sin Pulso** — no hay nada que atacar. El sentido
de la escena es que **no se puede hacer mucho**, y se vuelven.

**Vuelta.** Sí, y es donde pasa el título. **Acá te tiran por primera vez en toda la campaña**, y
sí: **pueden caer bombas.** Es el lugar correcto para estrenarlas, porque una bomba cayendo
significa exactamente lo que M2 quiere decir (regla 3.3): ya te vieron, ya no sos un fantasma.
Ese es el bautismo de fuego — no disparar, que te disparen.

**Cinemática.** Nueva, de llegada. ⚠ Por definir si se resuelve con clip generado o con imagen
fija con movimiento mínimo (es un plano estático: no hay acción, hay hallazgo).

---

### ✅ M3 · EL INVENTO — *primeros días de mayo de 1982*

`goal: { kind: 'distance', meters: 2400 }`

**Qué es.** La misión de probar el invento del Turco —la espoleta—, y por eso es **el tutorial
del Pulso**, diegético y ya escrito: *"Y me lo prueban despacio al invento del changuito, ¿eh?
Despacio."*

**Objetivo.** Una **boya** como blanco de prueba. **Con Pulso**, el primero de la campaña.

**Cinemática.** Nueva, y es la más rentable de todas: la bomba entrando en la boya y estallando.
**El mismo plano, con la cola cortada, es la `muerte_sorda` de M6** — impacto y después nada. Un
solo clip, dos finales. Y el efecto de M6 depende de que el jugador haya visto la versión buena
tres misiones antes: la bomba que no explota no se explica con un cartel, se reconoce.

**Vuelta.** Corta (`hasta: 1.3`) y **tibia**: con obstáculos, sin cazas. La regla que M3 tiene
que dejar instalada no es sólo cómo se arma la espoleta, es que **después de atacar te buscan**.
Si la vuelta de M3 está vacía, el jugador aprende lo contrario y la vuelta de M4 le va a parecer
injusta. Pero tampoco corresponde que lo cacen: le está tirando a una boya lejos de la flota.

---

### ⏳ M4 · EL DÍA QUE SANGRÓ EL MAR — *4 de mayo* · `ship: HMS SHEFFIELD`
Pendiente.

### ⏳ M5 · EL CALLEJÓN DE LAS BOMBAS — *21 de mayo* · `ship: HMS ARDENT` · `climax: arena`
Pendiente.

### ⏳ M6 · LA BOMBA QUE NO DESPERTÓ — *23 de mayo* · `ship: HMS ANTELOPE`
Pendiente. **Ya tiene cinemática asignada:** `muerte_sorda`, que es el clip de M3 sin la cola.

### ⏳ M7 · PASTELITOS — *25 de mayo* · `ship: HMS COVENTRY`
Pendiente.

### ⏳ M8 · EL BATIR DE LAS ALAS — *25 de mayo, segunda salida* · `ship: ATLANTIC CONVEYOR`
Pendiente. Arrastra dos cosas propias: `muerte_carguero` (otra silueta) y `muerte_alas`, que
ocurre una sola vez en la campaña.

### ⏳ M9 · EL PIBE — *27 de mayo* · `kind: distance`
Pendiente. **Es la única misión que promete un blanco y no lo tiene**: Cóndor nombra el centro
logístico de San Carlos en pantalla y la misión termina por distancia. Necesita el sistema de
blanco terrestre.

### ⏳ M10 · LOS PRIMOS — *5 de junio* · `kind: distance`
Pendiente. Reconocimiento armado; no promete blanco. *"El clima está peor que el enemigo."*

### ⏳ M11 · LO QUE NO SE DICE — *8 de junio* · `ship: RFA SIR GALAHAD`
Pendiente.

### ⏳ M12 · ÁNGEL DE CORRIENTES — *8 de junio, segunda salida* · `ship: RFA SIR TRISTRAM`
Pendiente.

### ⏳ M13 · LA CENA — *11 de junio* · `ship: HMS BROADSWORD`
Pendiente. El barco queda **dañado, no hundido**.

### ⏳ M14 · EL TERO — *madrugada del 12 de junio* · `ship: HMS GLAMORGAN` · `climax: arena`
Pendiente. Única misión **sin escena `OBJETIVO`**: la misión está negada y suben igual. El
silencio de Cóndor es el que habla.

---

## 5 · INVENTARIO DE CINEMÁTICAS

Se llena a medida que se cierran misiones. Esto es lo que hay que **generar**; todo lo demás se
compone con ranuras.

| Ranura | Pieza | Misiones | Estado |
|---|---|---|---|
| SALIDA | el avión yéndose | las 14 | ✅ ya existe entre los 10 clips |
| LLEGADA | cráter en la pista de Puerto Argentino | M2 | ⏳ por generar (¿fija con movimiento?) |
| MUERTE | impacto en boya **+ estallido** | M3 | ⏳ por generar |
| MUERTE | impacto en boya **sin estallido** (`muerte_sorda`) | M6 | ⏳ corte del clip de M3 |
| MUERTE | buque de guerra hundiéndose | M4, M5, M7 | ⏳ por definir |
| MUERTE | carguero (`muerte_carguero`) | M8 | ⏳ por definir |
| MUERTE | buque de desembarco / fuego | M11, M12 | ⏳ por definir |
| MUERTE | daño sin hundimiento | M13, M14 | ⏳ por definir |
| MUERTE | blanco terrestre (`muerte_tierra`) | M9 | ⏳ por definir |
| FALLO | el Pulso falla | todas las que llevan Pulso | ⏳ por definir |

---

## 6 · LA RAMPA DE ENSEÑANZA — M1 a M4

Una cosa nueva por misión, y ninguna se explica con un cartel:

| | M1 | M2 | M3 | M4 |
|---|---|---|---|---|
| **Radar** | no existe | debuta (`filo`) | sí | sí |
| **Pulso** | no | no | debuta | sí |
| **Te tiran** | nunca | en la vuelta, primera vez | apenas | completo |
| **Bombas cayendo** | no | debutan en la vuelta | no | sí |
| **Vuelta** | corta y vacía | completa y hostil | corta y tibia | completa |
| **Cinemática** | SALIDA reusada | llegada (cráter) | muerte (boya) | muerte (buque) |

---

## 7 · DECISIONES ABIERTAS

- ⚠ **M1:** cómo se marca el punto de llegada — ¿boya, u otra señal?
- ⚠ **M2:** ¿el cráter se resuelve con clip generado o con imagen fija con movimiento mínimo?
- ⚠ Si el refuerzo de terreno invertido en la vuelta (3.1) se hace o se deja para después.
