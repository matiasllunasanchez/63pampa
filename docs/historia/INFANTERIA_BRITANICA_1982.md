# LA INFANTERÍA BRITÁNICA — 1982

> **Qué es (8/10/2026):** la auditoría de una infografía que trajo Matías sobre el uniforme,
> el equipo y el arma del soldado británico en Malvinas, **más lo que de eso sirve para el
> juego**. Dos de los datos de la lámina están MAL y uno de los dos es un error clásico.
>
> **Regla de uso, la misma de [ARMAMENTO_1982.md](ARMAMENTO_1982.md):** lo verificado puede ir
> al juego; lo ⚠ no se afirma en pantalla.
>
> **Dónde aparece esta gente en el juego:** son los soldados de tierra
> (`src/render/soldiers.js` + `tools/models/soldiers.js`), los que corren cuando pasás rasante.
> Miden **entre 8 y 20 píxeles de alto**. Ese número manda sobre todo lo que sigue.

---

## 1 · LA AUDITORÍA DE LA LÁMINA

| lo que dice la infografía | veredicto |
|---|---|
| Camuflaje **DPM** (verde oliva, marrón, negro, beige) | ✅ correcto — es el *Pattern 68 DPM*, el que se usó en Malvinas |
| **Casco Mk6** con funda y red | ❌ **MAL, y por cuatro años.** El Mk6 entra en servicio en **1986**. Ver abajo |
| Fusil **L1A1 SLR**, 7,62 × 51 OTAN | ✅ correcto |
| Cargador de **20 tiros**, alcance efectivo **600 m** | ✅ correcto |
| **Cadencia 500–650 disparos/min** | ❌ **MAL.** El L1A1 es semiautomático **puro**. Ver abajo |
| Smock DPM **"impermeable"** y cortaviento | ⚠ cortaviento sí; **impermeable no lo pude confirmar** y el peso de la evidencia va en contra |
| Equipo de carga: webbing, bolsas, **mochila Bergen** | ✅ correcto (patrón 58) |
| Bayoneta, granadas, binoculares, radio de campaña | ✅ correcto |
| Boina "según la unidad" | ✅ correcto. ⚠ *a confirmar el detalle:* verde = Royal Marines, granate = paracaidistas |
| Botas "de cuero o goma según la función y el clima" | ✅ correcto, **y se queda cortísimo** — ver §3, es el mejor dato de toda la lámina |

### ❌ El casco Mk6 — el error clásico

El **Mk6 es de 1986**: entra en servicio cuatro años DESPUÉS de la guerra y empieza a
reemplazar al casco de acero recién hacia el 87. En Malvinas lo que había era el **casco de
acero con ala** — el "plato de sopa" de toda la vida, con funda DPM y red encima, que es lo
que la propia infografía dibuja bien en la foto aunque lo rotule mal.

*(La designación exacta de ese casco de acero cambia según la fuente entre **Mk IV** y **Mk V**,
por un lío viejo de numeración entre el casco y su barbiquejo. A nuestra escala da igual: la
silueta es la misma. Lo que NO da igual es que no es un Mk6.)*

**Los paracaidistas son la excepción**: tenían su casco plástico de salto, sin ala. Si alguna
vez se distingue una unidad de otra, esa es la diferencia que se lee en silueta.

### ❌ La cadencia del SLR — es de otro fusil

El **L1A1 no dispara en automático, y es a propósito**: los británicos le sacaron el fuego
automático al FAL belga cuando lo adoptaron, para obligar a tiro apuntado. Los 500–650
disparos/min de la lámina son del **L2A1**, la variante automática (fusil ametrallador), no
del fusil del soldado. Lo real son unos **20 tiros por minuto** de fuego apuntado.

**Y acá está el dato que vale oro para esta historia:** *es el mismo fusil de los dos lados.*
El FAL argentino y el SLR británico son el mismo diseño belga; la diferencia es que **el
nuestro disparaba en automático y el de ellos no**. Por eso en Malvinas los británicos
levantaban FAL argentinos capturados para tener fuego automático, y le metían **cargadores de
Bren de 30 tiros** a sus propios SLR para no quedarse cortos.

---

## 2 · QUÉ SE PUEDE APLICAR AL JUEGO (y qué no)

### Lo que ya está bien — no tocar

**El casco del modelo YA ES el correcto.** `tools/models/soldiers.js` arma un domo con **ala**,
y el comentario dice textualmente que el ala *"es justamente lo que lo separa de una cabeza
pelada a esta escala"*. O sea: el juego ya es más preciso que la infografía. Lo único que
estaba mal era **el nombre en el comentario** (decía "Mk. II", que es el de entreguerras) —
corregido, con la advertencia de que **nadie lo "modernice" a un Mk6**, que es exactamente el
error que esta lámina induce a cometer.

**La mochila Bergen ya está modelada** como fila propia (`FILA_BERGEN`, la silueta del
desembarco frente a la de guarnición). La infografía confirma esa decisión.

**El uniforme de un solo tono tiene que quedarse así.** El DPM son cuatro colores, sí — pero a
12 píxeles cuatro colores son barro. La cabecera del modelo ya tiene escrita la lección, de
cuando se intentó oscurecer el uniforme y el soldado se fundió con su propio contorno: **lo
verídico no sirve si desaparece**. Mismo criterio que la bomba verde oliva.

### Lo que NO entra, y por qué

| idea | por qué no |
|---|---|
| Pintar el patrón DPM de 4 colores | 8–20 px. Sería ruido, no camuflaje |
| Distinguir Royal Marines de paracaidistas por la boina | la boina no se usa en combate (va el casco), y a esta escala no se lee |
| El L1A1 como arma con cadencia propia | la infantería de tierra **no le dispara al avión** en el juego; son blanco y ambiente |
| Modelar el webbing 58 pieza por pieza | ya está resuelto con un tono `GEAR` en el bulto del torso |

### Lo único mecánico que esto habilita

**El tirador parado vs. el que se tira al piso.** El modelo ya tiene las dos poses
(`COL_TIERRA`). El dato histórico que las justifica: contra un avión a 400 km/h y 15 m de
altura, la infantería **tiraba con lo que tuviera** — fusil incluido — y el resto se tiraba
al suelo. Si alguna vez el pasillo quiere fuego de fusilería desde tierra, **la fuente no es
el daño: es el fogonazo**, y sale de acá. Hoy no existe y no hace falta.

---

## 3 · LOS DATOS BUENOS — y dónde los metemos

Ordenados por cuánto le sirven a ESTA historia, que es la de los pilotos.

### 🥇 A · El pie de trinchera — el enemigo que no era el enemigo

Las botas británicas **DMS** no eran impermeables. Tras semanas en la turba mojada apareció
**el pie de trinchera**, que no se veía en una guerra desde hacía unos sesenta y cinco años.
Una encuesta posterior a veteranos da **64 % de la infantería con lesiones por frío no
congelante**. Las botas nuevas (*Boot Combat High*) empezaron a entregarse recién en 1984 —
dos años tarde. Circula también que los británicos **levantaban botas argentinas de los
muertos** para salvar los pies; eso ⚠ no lo pude confirmar.

> **Dónde va:** 🎯 **placa histórica de una misión de apoyo a tierra (M9 o M10)**, con el
> formato de `M04_HIST` en `src/data/story.js`. Es el dato que mejor sostiene la tesis del
> guion: abajo, de los dos lados, había pibes arruinándose los pies en el mismo barro. **No
> va en boca de un personaje** — ningún piloto del Grupo 5 tenía por qué saberlo.

### 🥈 B · El mismo fusil de los dos lados

FAL argentino y SLR británico: el mismo diseño, y el de ellos sin automático. Los británicos
usaban **FAL argentinos capturados** justamente para tener fuego automático.

> **Dónde va:** 🎯 **el cuaderno de Mateo** o una placa de cierre. Es la imagen entera de la
> guerra en un objeto: *el mismo fusil, fabricado en el mismo lugar, apuntándose.* Es
> exactamente el registro del cuaderno — el pibe anotando lo que no entiende.

### 🥉 C · El casco de 1986

Que el Mk6 que todo el mundo dibuja como "el casco británico" todavía no existía.

> **Dónde va:** 📌 **en ningún lado del juego.** Es un dato de producción, no de narración:
> vive acá y en el comentario del modelo, para que nadie "corrija" el casco hacia el error.

### D · El Bergen de 40 kilos

Al perderse los helicópteros Chinook con el *Atlantic Conveyor* —**que es una misión del
juego, la M08**— los británicos tuvieron que cruzar la isla a pie cargando el Bergen. Eso es
el famoso *yomp* de los Royal Marines.

> **Dónde va:** 🎯 **el epílogo de la M08 (Atlantic Conveyor)**, que ya existe. Hoy la misión
> cuenta lo que se hundió; esto cuenta **lo que ese hundimiento le costó al enemigo**, que es
> mucho mejor que una cifra de tonelaje. ⚠ Confirmar cuántos Chinook se perdieron ahí antes
> de escribirlo (ver [PREGUNTAS_HISTORICAS.md](PREGUNTAS_HISTORICAS.md)).

---

## 4 · FUENTES

- Casco Mk6 y su fecha: [Wikipedia — Mk 6 helmet](https://en.wikipedia.org/wiki/Mk_6_helmet)
  (entrada en servicio 1986; reemplaza al casco de acero Mk IV/V)
- L1A1 semiautomático: [Wikipedia — L1A1 Self-Loading Rifle](https://en.wikipedia.org/wiki/L1A1_Self-Loading_Rifle)
  · [Paradata (Airborne Assault Museum)](https://paradata.org.uk/content/4663811) — cargadores
  de Bren de 30 y FAL argentinos capturados en Malvinas
- Cadencia práctica ~20 tiros/min: [Victorian Collections — L1A1 SLR](https://victoriancollections.net.au/items/5aceae3274bafc1554ef6fdd)
  · [5RAR — 7.62 SLR](https://5rar.asn.au/7-62-slr/)
- Botas DMS y pie de trinchera: [National Army Museum — The British Army and the Falklands War](https://www.nam.ac.uk/explore/british-army-and-falklands-war)
  · [Bolt Burdon Kemp — lesiones por frío no congelante, 64 %](https://www.boltburdonkemp.co.uk/news-blogs/campaign/britain-learned-lessons-falklands-war/)
- Pattern 68 DPM: [Kommandopost — British Pattern 68 DPM](https://kommandopost.com/2015/08/26/british-pattern-68-dpm-1975)

**Nivel de confianza:** el casco y el fusil están sólidos (fuentes de referencia que coinciden).
El pie de trinchera está sólido en lo general y la cifra del 64 % viene de una sola fuente. Lo
de las botas argentinas levantadas de los muertos es anécdota de foro — ⚠ no se afirma.
