# LAS PLACAS HISTÓRICAS — las seis que faltaban

> **Dónde van.** Al final de la misión, **después del epílogo y después de la carta de
> Mateo**, como último beat del capítulo. Es el orden que ya usan las ocho que existen:
> `M04_8` (cuaderno) → `M04_HIST` → `M05_1`. **No van después del boss**: si aparecen ahí,
> cortan el remate y el jugador todavía está volando de vuelta.
>
> **Ya existen ocho:** M04 Sheffield · M05 Ardent · M06 Antelope · M07 Coventry ·
> M08 Conveyor · M11 Sir Galahad · M12 Sir Tristram · M14 Glamorgan.
> **Acá van las seis que faltan:** M01, M02, M03, M09, M10 y M13.

---

## 🔴 C1 · ANTES DE EMPEZAR — la placa de apertura

> **Va antes que todo**, incluso antes del arroyo: es lo primero que ve el jugador al empezar
> la campaña. **Sin música.**
>
> **No es un descargo legal.** El *«cualquier parecido con la realidad es pura coincidencia»*
> enfriaría todo y además sería mentira: acá el parecido no es coincidencia, es el punto. Lo
> que hace esta placa es **firmar un contrato**: esto inventamos, esto no, y cuando cambiemos
> algo te lo vamos a decir. Y después ese contrato se cumple catorce veces, una por misión —
> así la placa del principio hace que todas las demás pesen más.

```js
  C1_ANTES: {
    id: 'C1_ANTES', tipo: 'VN',
    titulo: 'ANTES DE EMPEZAR', placa: 'radio', img: 'C1_ANTES',
    lineas: [
      { id: 'C1_ANTES_010', personaje: null, cara: null, hold: 0,
        es: 'Los pilotos de esta historia no existieron. La escuadrilla, sus nombres y todo lo que se dicen entre ellos es invencion.', en: '' },
      { id: 'C1_ANTES_020', personaje: null, cara: null, hold: 0,
        es: 'El resto paso: las fechas, los buques, los aviones, las bombas que no explotaban, el frio, los chicos en los pozos.', en: '' },
      { id: 'C1_ANTES_030', personaje: null, cara: null, hold: 0,
        es: 'Donde cambiamos algo para que esto se pudiera jugar, lo vas a ver escrito al final de la mision, con el dato verdadero al lado.', en: '' },
      { id: 'C1_ANTES_040', personaje: null, cara: null, hold: 3.0,
        es: 'Los muertos son reales. Los contamos bien.', en: '' },
    ],
  },
```

**Qué hace cada línea, para que no se toquen a la ligera:**

La **primera protege a la gente real** — ningún piloto que voló de verdad se llama como éstos.
La **segunda** le dice al jugador que lo que va a ver no es una fantasía de guerra. La
**tercera arma la expectativa de las placas**, así que cuando aparezca la del Broadsword
diciendo que en realidad fue el 25 de mayo, se va a sentir como una promesa cumplida y no
como una confesión.

Y la **cuarta es la que sostiene todo el resto**: *«Los muertos son reales. Los contamos
bien.»* Es una promesa chiquita y verificable, y es la que le da autoridad a cada número que
aparece después — los 22 del Ardent, los 48 del Sir Galahad, los 19 del Coventry.

> ⚠ **Y obliga.** Si el juego promete que los cuenta bien, **tiene que contarlos bien**. Por
> eso la discrepancia del Glamorgan (13 vs 14) deja de ser un detalle y pasa a ser un
> bloqueante de publicación.

---

## La voz — lo que hace que suenen todas iguales

Tres líneas. Tercera persona, sin adjetivos, sin bajada de línea. **La primera dice el
hecho**, **la segunda dice el costo en gente**, y **la tercera deja algo que el jugador se
lleva.** Y hay una regla de autor que ya está en las ocho existentes y que conviene no
romper: **la tercera línea muchas veces es generosa con el otro lado** — *"su comandante fue
el último en abandonarla"*, *"para los dos lados"*. Eso es lo que separa a este juego de un
juego de propaganda.

---

## M01 · CON SAL EN LAS ALAS

> El tutorial no tiene buque, así que la placa cuenta **el vuelo**, que es lo que la misión
> acaba de enseñar.

```js
  M01_HIST: {
    id: 'M01_HIST', tipo: 'VN',
    titulo: 'EL VUELO RASANTE · 1982', placa: 'radio', img: 'M01_HIST',
    lineas: [
      { id: 'M01_HIST_010', personaje: null, cara: null, hold: 0,
        es: 'Para llegar a las islas, los A-4 volaban mas de setecientos kilometros sobre mar abierto y bajaban a treinta metros del agua para meterse debajo del radar britanico.', en: '' },
      { id: 'M01_HIST_020', personaje: null, cara: null, hold: 0,
        es: 'Tenian entre cinco y diez minutos sobre el objetivo. Combustible para una sola pasada.', en: '' },
      { id: 'M01_HIST_030', personaje: null, cara: null, hold: 0,
        es: 'Volvian con las cabinas cubiertas de sal. Despues de horas a ras del mar, costaba ver la pista para aterrizar.', en: '' },
    ],
  },
```

## M02 · EL BAUTISMO DE FUEGO

```js
  M02_HIST: {
    id: 'M02_HIST', tipo: 'VN',
    titulo: '1 DE MAYO DE 1982', placa: 'radio', img: 'M02_HIST',
    lineas: [
      { id: 'M02_HIST_010', personaje: null, cara: null, hold: 0,
        es: 'El 1 de mayo empezaron los combates. Los britanicos bombardearon la pista de Puerto Argentino y la aviacion argentina salio en masa por primera vez.', en: '' },
      { id: 'M02_HIST_020', personaje: null, cara: null, hold: 0,
        es: 'Ese dia volaron pilotos que nunca habian entrado en combate. Varios no volvieron.', en: '' },
      { id: 'M02_HIST_030', personaje: null, cara: null, hold: 0,
        es: 'Los A-4 no llevaban misiles aire-aire, ni radar, ni alerta de radar, ni contramedidas. Salieron igual.', en: '' },
    ],
  },
```

## M03 · EL INVENTO

> La misión de las mejoras. La placa cuenta **la mejor improvisación documentada de toda la
> guerra**, y es real: la máquina de hacer fideos.

```js
  M03_HIST: {
    id: 'M03_HIST', tipo: 'VN',
    titulo: 'LO QUE NO HABIA · MAYO DE 1982', placa: 'radio', img: 'M03_HIST',
    lineas: [
      { id: 'M03_HIST_010', personaje: null, cara: null, hold: 0,
        es: 'Los aviones argentinos no tenian chaff para desviar misiles. Lo fabricaron en Parana, cortando tiras de aluminio.', en: '' },
      { id: 'M03_HIST_020', personaje: null, cara: null, hold: 0,
        es: 'Primero a tijera, entre los hijos de un mayor y sus companeros de colegio. Despues con una maquina de hacer fideos que presto una fabrica de pastas.', en: '' },
      { id: 'M03_HIST_030', personaje: null, cara: null, hold: 0,
        es: 'Juntaron ciento cuarenta kilos. Lo envolvian en papel higienico y lo metian adentro de los aerofrenos.', en: '' },
    ],
  },
```

## M09 · EL PIBE

> Muere el Pichón. La placa **no habla de él** —eso lo hizo el epílogo— sino del lugar.

```js
  M09_HIST: {
    id: 'M09_HIST', tipo: 'VN',
    titulo: 'SAN CARLOS · MAYO DE 1982', placa: 'radio', img: 'M09_HIST',
    lineas: [
      { id: 'M09_HIST_010', personaje: null, cara: null, hold: 0,
        es: 'Los britanicos desembarcaron en San Carlos el 21 de mayo y levantaron ahi su base de abastecimiento. A esas aguas las llamaron el Callejon de las Bombas.', en: '' },
      { id: 'M09_HIST_020', personaje: null, cara: null, hold: 0,
        es: 'La aviacion argentina volvio dia tras dia a cruzar ese fuego. Fue donde mas aviones se perdieron.', en: '' },
      { id: 'M09_HIST_030', personaje: null, cara: null, hold: 0,
        es: 'Nunca lograron cortar el desembarco. Los pertrechos siguieron llegando a la playa.', en: '' },
    ],
  },
```

## M10 · LOS PRIMOS

> Sin buque y sin combate. La placa **es el remate del chiste amargo** de la misión: el regalo
> que llegó tarde.

```js
  M10_HIST: {
    id: 'M10_HIST', tipo: 'VN',
    titulo: 'LOS MIRAGE DEL PERU · JUNIO DE 1982', placa: 'radio', img: 'M10_HIST',
    lineas: [
      { id: 'M10_HIST_010', personaje: null, cara: null, hold: 0,
        es: 'El Peru entrego diez Mirage 5P a la Argentina. Salieron de La Joya, hicieron escala de noche en Jujuy para reabastecer y aterrizaron en Tandil con la escarapela argentina ya pintada.', en: '' },
      { id: 'M10_HIST_020', personaje: null, cara: null, hold: 0,
        es: 'Tandil esta a dos mil kilometros de las bases del sur. Llegaron el 5 de junio.', en: '' },
      { id: 'M10_HIST_030', personaje: null, cara: null, hold: 0,
        es: 'Ninguno llego a combatir. Aca, si.', en: '' },
    ],
  },
```

## M13 · HMS BROADSWORD

> 🔴 **La más importante de las seis**, porque es la que más se aleja: en la realidad lo
> tocaron el **25 de mayo**, no el 11 de junio, y **no se hundió**. La placa lo dice de
> frente y convierte la diferencia en lo de menos.

```js
  M13_HIST: {
    id: 'M13_HIST', tipo: 'VN',
    titulo: 'HMS BROADSWORD · 25 MAYO 1982', placa: 'radio', img: 'M13_HIST',
    lineas: [
      { id: 'M13_HIST_010', personaje: null, cara: null, hold: 0,
        es: 'Una bomba de mil libras soltada por un A-4 reboto en el agua, entro por el casco de la fragata y salio por la cubierta de vuelo sin estallar.', en: '' },
      { id: 'M13_HIST_020', personaje: null, cara: null, hold: 0,
        es: 'Se llevo puesto el helicoptero. No se llevo el barco.', en: '' },
      { id: 'M13_HIST_030', personaje: null, cara: null, hold: 0,
        es: 'Trece bombas argentinas pegaron en buques britanicos y no explotaron. Un oficial ingles lo dijo despues: con seis espoletas mejores, habriamos perdido.', en: '' },
    ],
  },
```

---

## Lo que hay que hacer con esto

0. **Pegar `C1_ANTES` en `src/data/story.js`** y engancharlo como el primer beat de la
   campaña, antes de `P1_2` (el arroyo).
1. **Pegar los seis bloques en `src/data/story.js`**, cada uno inmediatamente después de la
   carta de su misión: `M01_HIST` después de `M01_8` · `M02_HIST` después de `M02_8` ·
   `M03_HIST` después de `M03_CUADERNO` · `M09_HIST` después de `M09_CARTA` · `M10_HIST`
   después de `M10_CUADERNO` · `M13_HIST` después de la carta de M13.
2. **Agregarlos a la secuencia de la misión**, donde sea que se declare el orden de beats.
3. **Generar las seis placas** `M01_HIST` … `M13_HIST`. Todas usan `placa: 'radio'`, que ya
   existe: si no querés arte nuevo, **no hace falta ninguno** — se reusa la misma.

## ⚠ Antes de publicar

- **Cerrar el número de muertos del Glamorgan.** `M14_HIST` dice **14** y `MEJORAS_PICHON`
  dice **13**. Las fuentes discrepan y hay que elegir una y citarla.
- **Verificar M02.** Que el 1 de mayo empezaron los combates y que bombardearon la pista está
  fuera de discusión; **"varios no volvieron" conviene cambiarlo por el número exacto** una
  vez que se verifique, o dejarlo así de vago a propósito.
- **M09 no lleva número de aviones perdidos** justamente porque las cifras que circulan no
  coinciden. Si se verifica una, la línea gana muchísimo.
