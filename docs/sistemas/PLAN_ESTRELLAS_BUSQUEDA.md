# PLAN — LAS ESTRELLAS DE BÚSQUEDA

> **Qué propone.** Que el radar tenga **memoria**. Hoy te detecta, te tira una oleada de misiles
> y se olvida. La propuesta es que la detección acumule un **nivel de búsqueda** —cuántos te están
> buscando— que sube al quedarte expuesto y **baja si te escondés a ras**, y que ese nivel decida
> **qué te mandan y cuánto**.
>
> **De dónde sale.** Idea del autor (10/9/2026), por analogía con el contador de búsqueda de GTA.
> Y el propio autor puso la objeción que ordena todo el diseño: *"no tendría sentido que aparezcan
> barcos con muchas estrellas y luego menos cuanto más cerca estás del barco"*. Esa objeción es
> correcta y de ella sale el §2.
>
> **Estado:** propuesta. No hay una línea de código escrita.

---

## 1 · POR QUÉ NO ES UNA LICENCIA

El contador en pantalla es una abstracción, como las vidas del escuadrón o la barra de nafta.
**El bucle que representa es historia** (ver `docs/historia/PREGUNTAS_HISTORICAS.md`, "El radar que
te busca"):

- La flota británica tenía **piquetes de radar** adelantados cuyo trabajo era ver venir los
  ataques a baja cota y **vectorear a los Sea Harrier** encima. Que el radar "te mande a buscar"
  es el diseño defensivo real, no un invento.
- Volar a ras del agua funcionaba por el **horizonte de radar**: contra un blanco pegado al mar
  el alcance útil se desploma. `RADAR_ALT` y EL FILO ya traducen ese fenómeno.
- **Perder el contacto** era común: un blanco que baja se mete en el desorden del mar.

> **La línea es "LOS PERDIMOS", no "te creen muerto".** Se sostiene con lo que sabemos y además es
> mejor tensión: si sólo te perdieron, **te pueden volver a encontrar**. La versión "te dan por
> caído" cierra la puerta; ésta la deja entornada. Si un piloto quiere especular con que lo dan
> por muerto, que lo diga como personaje y que otro lo desmienta — el juego no lo afirma.

---

## 2 · LOS DOS EJES, Y NO SE MEZCLAN

Es la parte más importante del plan y sale de la objeción del autor.

| Eje | Decide | Ejemplos |
|---|---|---|
| **LA DISTANCIA** | QUÉ HAY | globos, antiaérea, el buque, los acantilados |
| **LAS ESTRELLAS** | QUIÉN TE BUSCA | bombardeo, cazas, Harriers, oleadas |

**La distancia es dónde estás. Las estrellas son cuánto te odian.** Un globo de barrera está
colgado de un cable cerca de lo que protege, tengas cero estrellas o cuatro. Un Harrier no está
en ningún lado hasta que alguien lo manda.

Mezclarlos produce exactamente el sinsentido que el autor marcó: enemigos que aparecen y
desaparecen según un contador, en lugares donde no tendrían por qué estar o no estar.

> **Ya está medio construido.** El eje DISTANCIA existe: es `solo` / `obstacles` por fase
> (PLAN_MISION_CINCO_FASES §11). Lo que falta es el segundo eje.

---

## 3 · CÓMO SUBEN Y CÓMO BAJAN

### Suben: completar la barra del radar
`run.detection` ya sube (`dt / 1.4`) por encima del techo vigente y ya dispara una oleada al
llegar a 1. **Cada vez que la barra se completa, suma una estrella.** No hay mecanismo nuevo: es
`run.radarWave` volviéndose visible y con nombre.

### Bajan: sostener el rasante
**Esto es lo único verdaderamente nuevo, y es el corazón del item.** Volar CONTINUAMENTE por
debajo del techo vigente durante `EST_PERDER_S` segundos baja una estrella.

- **Continuo, no acumulado.** Asomarse reinicia el reloj. Es lo que lo convierte en un
  compromiso y no en una espera.
- **Y cuesta.** El rasante quema nafta al doble (`nafta: 2`), así que esconderse no es gratis:
  se paga con el reloj de la misión. Esa tensión ya existe y este item la cobra.

### El techo es el de la FASE
Se lee con `fases.techoRadar(RADAR_ALT)`, no con la constante. En un FILO (techo 9) esconderse es
mucho más difícil que en mar abierto (techo 20), y eso es correcto: en el filo hay alguien mirando
de cerca.

---

## 4 · LA ESCALADA — QUÉ TE MANDAN

Cinco niveles, tope en 4. La tabla vive en `data/estrellas.js` y es **dato puro**.

| ★ | Qué significa | Qué se suelta |
|---|---|---|
| **0** | No te vieron | Nada. La ida limpia: naturaleza y la defensa fija de la zona |
| **1** | Te pintaron una vez | Bombardeo suelto · LA COLA habilitada en 1 |
| **2** | Te están siguiendo | Más bombardeo · cola 2 · jets de frente |
| **3** | Te mandaron a buscar | **Harriers**: la cola con más de uno a la vez · helicópteros |
| **4** | Todos encima | Todo lo anterior sin piedad · las oleadas no aflojan |

**La ida a cero estrellas es exactamente lo que ya se construyó** (§11 del plan de fases): sin
bombas, sin cola, sólo olas y bandadas, con los globos apareciendo de la mitad en adelante. Este
item no lo reemplaza: **lo vuelve condicional**. Textual del autor: *"la ida sin bombas y sin
harriers siempre y cuando no tengas estas estrellas"*.

---

## 5 · CÓMO SE ENCHUFA SIN ROMPER LA CONVENCIÓN

La regla del repo (`data/cuarentena.js`) es que los switches de comportamiento son **dato**. Nadie
escribe `if (estrellas === 3)` en un sistema.

### La cadena de resolución se extiende
Hoy es `tramo → fase → cfg`. Pasa a ser:

```
tramo → fase → cfg          …y encima, LAS ESTRELLAS LEVANTAN EL PISO
```

Las estrellas **no pisan** el valor resuelto: le ponen un **mínimo**. Así:

- `bombs`: la fase dice 0 (la ida). Con ★2 el piso de la tabla es 1 → rige 1.
- `caza`: idem.
- `solo`: la lista blanca de la fase se **une** con la del nivel. La ida a ★0 es `[ola, birds]`;
  a ★3 se le suman `helo` y `jet`.

> **Por qué mínimo y no reemplazo.** Porque el eje DISTANCIA tiene que seguir mandando sobre lo
> suyo: si las estrellas pisaran `solo`, con ★3 aparecerían globos en mar abierto — que es
> justamente el error que el §2 existe para evitar.

### Dónde vive cada cosa
| Archivo | Qué |
|---|---|
| `data/estrellas.js` | la tabla de los cinco niveles (dato puro, sin lógica) |
| `core/estrellas.js` | puro: subir, bajar, y el piso resuelto por nivel. Lo prueba `npm run unit` |
| `systems/estrellas.js` | el estado de la corrida: nivel actual, reloj de escondite |
| `run.estrellas` | el contador, en el store (reemplaza a `run.pintado`) |

**`run.pintado` se retira.** Hoy es un trinquete de una sola dirección que sube la intensidad de
la cola y no baja nunca; las estrellas son eso mismo pero reversible y con niveles. La clave
`pinta` de las fases (`'cap'` / `'muerte'`) se mantiene: decide si completar la barra suma una
estrella o te mata.

---

## 6 · LA RADIO QUE LO NARRA

Sin cartel y sin número flotando: **se cuenta hablando**, que es como este juego ya cuenta el
silencio de radio (§11.2 del plan de fases).

| Evento | Quién | Línea |
|---|---|---|
| Primera estrella | CONDOR | `TE PINTARON. YA SABEN QUE ESTAS ACA.` |
| Sube a 2-3 | CONDOR | `PLATA FIEL, ESTAN LLEGANDO CAZAS. OJO.` |
| Sube a 4 | CONDOR | `SON DEMASIADOS. BAJA Y NO SUBAS MAS.` |
| Baja una | CONDOR | `PARECE QUE LOS PERDIMOS.` |
| Vuelve a 0 | CONDOR | `TE PERDIERON DE VISTA. SEGUI ASI.` |

Y la especulación, en boca de los pilotos y desmentida, para no afirmar lo que no se sabe:

```
GITANO: NOS PERDIERON. CAPAZ NOS DAN POR CAIDOS.
PUMA:   NO TE HAGAS EL VIVO. SEGUI ABAJO.
```

---

## 7 · EL HUD

Las estrellas **tienen que verse**, o la mecánica no se puede jugar: sin el número, bajar a
esconderse es fe.

**Dónde:** debajo de la placa del escuadrón y con su mismo ancho (pedido del autor, 10/9). La
esquina de arriba a la izquierda es *quién vuela*; cuántos te buscan es la otra mitad de la misma
pregunta. `anchoSquad()` es el ancho de la COLUMNA: nunca menos de lo que piden el radar y las
cuatro balizas, así las dos placas miden siempre lo mismo.

**Qué:** sin una palabra (pedido del autor, 11/9). Un **radar** —pantalla redonda, todo en verde
de fósforo: el aro, el barrido que gira con su estela, las onditas que salen del centro y tu
contacto parpadeando— y **cuatro balizas** giratorias. Se portan como las estrellas de GTA, que es
de donde salió el item:

| estado | balizas | contacto en el radar |
|---|---|---|
| nivel no alcanzado | apagadas, pero a la vista: se ve cuántas pueden venir | — |
| **te ven** (el reloj de escondite en cero) | encendidas y quietas, con el brillo que gira | parpadeo rápido y encendido |
| **te buscan** (escondido, el reloj corre) | parpadean todas, rojo ↔ rojo apagado | parpadeo lento y apagado: el eco viejo |
| **recién ganada** (1,6 s) | destella en blanco, con rayos | — |

- **El reloj de escondite se muestra mientras corre**, como una rayita al pie de la placa: si
  bajar veinte segundos baja una estrella, el jugador tiene que ver esos veinte segundos correr.
  El parpadeo dice *qué* está pasando; el reloj, *cuánto* falta.
- "Te ven" no le pide un dato nuevo al sistema: es `progreso() === 0`. El escondite sólo corre bajo
  el techo, y asomarse más que la gracia lo vuelve a cero. Durante la gracia el panel sigue
  diciendo "te buscan" aunque el aviso de radar ya cargue: un bob no te delata, y es el mismo reloj.
- El flanco del destello se mira en el dibujo, cada cuadro — incluso con el nivel en cero, cuando el
  panel no se dibuja: si no, el 0→1 no destellaría nunca.

---

## 8 · LAS PERILLAS

Todas nuevas, al final de `data/tuning.js`. **Ninguna es un número medido: son la primera
apuesta**, y la primera de las tres es la que va a necesitar el playtest.

```js
EST_MAX = 4;             // tope del contador
EST_PERDER_S = 20;       // s CONTINUOS bajo el techo para bajar una estrella
EST_GRACIA_S = 1.2;      // asomarse menos que esto no reinicia el reloj (el bob no te delata)
```

`EST_PERDER_S = 20` sale de una cuenta y no de la nada: a 0,41 %/s de nafta en rasante son ~8% del
tanque por estrella. Bajar de ★4 a ★0 cuesta ~33% — un tercio de la misión escondido. Se siente
caro y debería serlo; si en el playtest es insufrible, este es el número.

---

## 9 · FASES DE IMPLEMENTACIÓN

Una por vez, con `npm run check` verde y `feel` idéntico entre cada una.

| fase | entrega | criterio de cierre |
|---|---|---|
| **E0** | `core/estrellas.js` puro (subir, bajar, el piso por nivel) + `data/estrellas.js` + unit tests | `npm run unit` con los bordes: tope, piso, gracia, reloj continuo vs acumulado |
| **E1** | `systems/estrellas.js` + `run.estrellas` + el enganche a `run.detection`. **Todavía no cambia la siembra**: sólo cuenta | fixture: volar alto sube el contador; volar bajo `EST_PERDER_S` lo baja; asomarse un instante NO reinicia |
| **E2** | El piso en la cadena de resolución (`bombs`, `caza`, `solo`) | censo de siembra: a ★0 la ida es `{ola, birds}`; a ★3 aparecen `{helo, jet}`. Y el eje distancia intacto: los globos siguen sin salir antes de la mitad |
| **E3** | La radio y el HUD | se ve el contador, se ve el reloj de escondite, y las líneas suenan en los flancos (una vez cada una) |
| **E4** | Retirar `run.pintado` y migrar la clave `pinta` | `npm run fases` verde; ninguna misión de campaña cambia |

**Criterio de éxito de todo el item, y es el mismo de siempre:** una misión SIN fases y sin
estrellas se comporta EXACTAMENTE como hoy. `npm run feel` byte a byte.

---

## 10 · QUÉ NO HACER

1. **No mezclar los ejes** (§2). Es el error que el item existe para evitar.
2. **No pisar el valor resuelto** — las estrellas ponen un PISO, no reemplazan.
3. **No `if (estrellas === n)` en un sistema.** Tabla indexada por nivel, leída como valor.
4. **No un cartel con el número.** Lo narra la radio; el HUD sólo lo muestra.
5. **No afirmar que te creen muerto.** "Los perdimos" es lo que se sostiene (§1).
6. **No tocar `RADAR_ALT` ni el modelo de detección**: las estrellas se cuelgan de lo que ya hay.

---

## 11 · LO QUE HAY QUE DECIDIR ANTES

- **¿Las estrellas sobreviven al clímax?** Entrás al blanco con ★3: ¿la vuelta arranca con ★3
  puesto? *(Recomendación: sí, y es la mitad de la gracia — atacar es la razón por la que te
  buscan. Y encaja con el §11 del plan de fases: al atacar revelaste la posición.)*
- **¿La vuelta arranca con un piso?** Después de bombardear un buque, cero estrellas es raro.
  *(Recomendación: la fase `vuelta` declara un mínimo de ★1, como dato.)*
- **¿El aterrizaje las mira?** Llegar a casa con ★4 podría costar puntaje, o no significar nada.
- **`EST_PERDER_S = 20`**: el número que va a mover el playtest.

---

## 12 · DIVERGENCIAS *(completar durante la implementación)*

- **§7, dos veces.** El plan decía "marcas discretas, no estrellitas literales" y "junto al aviso de
  radar". Primero el autor lo bajó debajo del escuadrón con el rótulo NIVEL DE ALERTA y cifras 1-4
  (10/9); después pidió sacar el texto y volver a la analogía de GTA con iconos —un radar y
  balizas— (11/9). §7 describe lo que quedó.
