# LOS DIÁLOGOS DENTRO DE LAS MISIONES

*Todo lo que se dice mientras se vuela —con el juego andando o frenado—, misión por misión. Lo de
antes y después de volar (pantallas, cartas, tarjetas) no está acá.*

> Sacado textual de `story.js` y `missions.js` el 4/10/2026: **56 escenas, completas, sin cortar
> ninguna línea** (verificado contra el código). Cuando un texto choca con lo que decidiste esta
> semana, abajo hay una marca ⚠.

**Tres tipos:**

- **Radio en vuelo** — charla por radio; **el juego sigue.** Entra en un tramo del camino.
- **Lección** — **frena el juego** hasta que tocás una tecla, y muestra la parte del tablero o la
  tecla de la que se habla. Sólo existen en M1.
- **Aviso** — una línea que salta cuando pasa algo (chocás, subís, volvés). **No frena.** Cuando
  hay varias, se dice una por vez.

---

## El dibujo general

**M1 habla todo el tiempo:** 19 escenas. **M4 y M5** tienen el tránsito del Narwal, una
conversación en cinco y tres partes. **De M6 a M13**, lo único que se dice en vuelo son dos o
tres líneas de Cóndor al despegar. **M14 no tiene una sola línea en vuelo.**

Lo de M14 cuadra con la regla de los carteles arcade (`barks.js`), que se apagan de a poco y en
M14 no queda ninguno: el juego se queda callado. **De M6 a M13** es donde pasan las muertes —el
Vasco en la siete, el Pichón en la nueve—; se cuentan después, en pantallas, y en el aire nadie
dice nada.

---


## M1 · CON SAL EN LAS ALAS

### OBJETIVO

Radio en vuelo · **no frena** · al despegar, hasta el 12% · `M01_OBJETIVO`

**CÓNDOR:** Escuadrilla Cauquén, aquí Cóndor. Adaptación sobre mar abierto, rumbo sudeste.

**CÓNDOR:** No hay nada que atacar hoy. Hay que aprender a volar abajo: cuanto más pegado al agua, mejor. Buen vuelo.


### EL RITUAL

Radio en vuelo · **no frena** · del 12% al 21% · `M01_RITUAL`

**CÓNDOR:** Plata Fiel, Plata Fiel. Aquí Cóndor.

**CÓNDOR:** Cielo despejado al sur. Viento en la cola.

**CÓNDOR:** Reconocimiento de zona: vuelen bajito y a casa.

**CÓNDOR:** Buena suerte, muchachos.


### LOS GANSOS

Radio en vuelo · **no frena** · del 21% al 30% · `M01_GANSOS`

**GITANO:** ¿Viste? Para el comando somos gansos.

**GITANO:** Por lo menos eligieron uno que vuela.


### CÓNDOR · GAS Y ALTURA

Lección · **frena el juego** · al 8% del camino · ida · `LEC_M1_GAS`

**CÓNDOR:** Cauquén, recuerde: sin empuje, el avión cae. Vigile el gas y la altitud.


### CÓNDOR · LA RUTA

Lección · **frena el juego** · al 15% · ida · `LEC_M1_RUTA`

**CÓNDOR:** Arriba podrá observar la ruta con el objetivo y la distancia recorrida y final.


### CÓNDOR · SE CORTA

Lección · **frena el juego** · al 19% · ida · `LEC_M1_CORTE`

**CÓNDOR:** Recuerde: por debajo de la altura del radar, no lo detectan. Manténgase pegado al ag… zzk… crrr…


### PUMA · LA RADIO NO LLEGA

Lección · **frena el juego** · al 19%, pegada a la anterior · ida · `LEC_M1_INTERFERENCIA`

**PUMA:** A veces pasa. Nuestra tecnología es limitada. No tenemos radar a bordo. Cóndor es nuestra única forma de ver a los enemigos más allá de nuestros ojos.


### PICHÓN · EL TABLERO

Lección · **frena el juego** · al 45% · ida · `LEC_M1_TABLERO`

**PICHÓN:** Como en el A-4, Tero: en el medio va lo que cambia rápido. Velocidad, horizonte, altura, gas. Lo demás se mira de reojo.


### GITANO · LA POSCOMBUSTIÓN

Lección · **frena el juego** · al 55% · ida · `LEC_M1_TURBO`

**GITANO:** ¿Más velocidad? Poscombustión. Pero ojo, que chupa más que el Vasco en un asado. Así que... de a poquito.

> ⚠ Choca con la escalera (4/10): **M1 va sin turbo**, se enseña en M2.


### VASCO · LAS ARMAS

Lección · **frena el juego** · al 65% · ida · `LEC_M1_ARMAS`

**VASCO:** Armas. Cañón para lo que se mueve. Bombas para lo que no. Ninguna al agua.

> ⚠ Choca con la escalera (4/10): **en M1 y M2 no se llevan bombas**; se enseñan en M3.


### PUMA · LA ESPOLETA

Lección · **frena el juego** · al 72% · ida · `LEC_M1_ESPOLETA`

**PUMA:** La bomba tiene que caer para armarse: soltala alta y temprano, que caiga más de un segundo. Y aun haciéndolo perfecto, estas inglesas fallan la mitad de las veces.

> ⚠ Choca con la escalera (4/10): la espoleta es de la lección de bombas, que pasa a **M3**.


### PICHÓN · EL TONEL

Lección · **frena el juego** · al 80% · ida · `LEC_M1_TONEL`

**PICHÓN:** Hay algunas maniobras que salen fácil con la configuración de estos modelos. Animate a probarlas. Hay una que se llama tonel. La deduje leyendo el manual.


### CÓNDOR · LA RADIO VUELVE

Lección · **no frena — es radio** · al entrar a la aproximación final · `LEC_M1_PISTA`

**CÓNDOR:** Cauquén, aquí Cóndor. Los tengo de nuevo. Pista dos libre. No se olvide el tren antes de tocar.


### EL RADAR, POR RADIO

Aviso en vuelo · **no frena** · cuando subís por encima del techo del radar · `AV_M1_RADAR`

*Se dice una sola por vez, elegida de estas:*

**CÓNDOR:** Numeral de Cauquén, altura excesiva. Descienda.

**CÓNDOR:** Esa altura es peligrosa, visible por el radar. Descienda.

**PUMA:** Primera regla, Tero. Pegado al agua.

**PUMA:** Ahí te ve el radar. Hoy es gratis; mañana no.

> ⚠ *"Hoy es gratis; mañana no"* choca con la segunda ronda de M1: ahora en M1 **hay** zona de radar y estrellas.


### PUMA · CONTRA EL AGUA

Aviso en vuelo · **no frena** · cuando le pegás al agua o al suelo · `AV_M1_AGUA`

*Se dice una sola por vez, elegida de estas:*

**PUMA:** Tero, eso fue el mar. Pegado, sí. Adentro, no.

**PUMA:** Sal en las alas, Tero. No en la cabina.

**PUMA:** Un palmo más arriba. Un palmo nomás.


### PUMA · CONTRA ALGO

Aviso en vuelo · **no frena** · cuando chocás contra cualquier otra cosa · `AV_M1_CHOQUE`

*Se dice una sola por vez, elegida de estas:*

**PUMA:** Te lo llevaste puesto. Mirá adelante, no el agua.

**PUMA:** ¿Entero? Seguí. Y abrí los ojos.

**PUMA:** Esa chapa te la va a cobrar el Turco.


### PUMA · LA CHAPA EN EL PISO

Aviso en vuelo · **no frena** · la primera vez que la chapa llega al piso · `AV_M1_PISO`

**PUMA:** Ese avión no aguanta otro así, Tero. Suave, detrás mío, y a casa.


### PUMA · A CASA

Aviso en vuelo · **no frena** · al volver del corte a negro, ya de vuelta · `AV_M1_VUELTA`

**PUMA:** Hasta acá llegamos, Tero. Media vuelta y a casa.


### PUMA · LA CHANCHA

Aviso en vuelo · **no frena** · en la vuelta, para nombrarla · `AV_M1_CHANCHA`

**PUMA:** Si algún día no te alcanza para volver, se pide la Chancha. Te da de tomar en el aire. Hoy alcanza.


---


## M2 · EL BAUTISMO DE FUEGO

### OBJETIVO

Radio en vuelo · **no frena** · al despegar, primer 10% del camino · `M02_OBJETIVO`

**CÓNDOR:** Escuadrilla Chimango, aquí Cóndor. Cruce de costa autorizado.

**CÓNDOR:** Radar activo en toda la aproximación. Entran, cruzan y vuelven. Nada más. Buen vuelo.

**PUMA:** Chimango copia. Pegaditos.

> ⚠ Escrita para la misión vieja: M2 pasa a ser **diversión 2, más lejos, sin objetivo**, con Chancha.


---


## M3 · EL INVENTO

### OBJETIVO

Radio en vuelo · **no frena** · al despegar, primer 10% del camino · `M03_OBJETIVO`

**CÓNDOR:** Escuadrilla Benteveo, aquí Cóndor. Patrulla de reconocimiento costero.

**CÓNDOR:** Blancos de oportunidad nada más: boyas, un radar portátil si aparece. Sin presión. Buen vuelo.

**EL TURCO:** Y me lo prueban despacio al invento del changuito, ¿eh? Despacio.

> ⚠ Escrita para la misión vieja: el blanco ya no son boyas sino **el puesto de una isla**, con bombas.


---


## M4 · EL DÍA QUE SANGRÓ EL MAR

### OBJETIVO

Radio en vuelo · **no frena** · al despegar, primer 10% del camino · `M04_OBJETIVO`

**CÓNDOR:** Escuadrilla Albatros, aquí Cóndor. Blanco: destructor, clase 42.

**CÓNDOR:** Es el que le da cobertura al resto de la flota. Si cae ése, el resto queda mirando. Buen vuelo.


### LAS POSICIONES

Radio en vuelo · **no frena** · del 10%–15% · tránsito del Narwal · `M04_NARWAL_A`

**CÓNDOR:** Plata Fiel, anoto posiciones. Dos unidades al noreste, rumbo sur, velocidad diez.

**CÓNDOR:** Una tercera más atrás, sin confirmar.

**PUMA:** Copiado, Cóndor.


### DE DÓNDE SALEN

Radio en vuelo · **no frena** · del 15%–20% · tránsito del Narwal · `M04_NARWAL_B`

**GITANO:** Cóndor, una pregunta de curioso nomás. ¿De dónde sacás vos todo eso?

**GITANO:** Porque nosotros acá no vemos un carajo hasta que lo tenemos encima.

**CÓNDOR:** *(sin ningún énfasis, como quien lee una planilla)* De un barco pesquero llamado Narwal.

**GITANO:** …¿Un pesquero?


### SETENTA METROS

Radio en vuelo · **no frena** · del 20%–25% · tránsito del Narwal · `M04_NARWAL_C`

**CÓNDOR:** Un pesquero. Setenta metros. Tira la red, la levanta, la vuelve a tirar.

**CÓNDOR:** Y mientras tanto anota todo lo que le pasa al lado.

**GITANO:** ¡Pará! ¿Me estás diciendo que la flota inglesa le está pasando por adelante a unos tipos que están pescando?


### TRES SEMANAS

Radio en vuelo · **no frena** · del 25%–30% · tránsito del Narwal · `M04_NARWAL_D`

**CÓNDOR:** Por adelante, por atrás y por arriba. Hace tres semanas.

**GITANO:** *(la risa se le apaga sola)* …Tres semanas ahí adentro. ¿Y esos tipos qué son? ¿Marina?

**CÓNDOR:** Un oficial a bordo. El resto, pescadores.

**GITANO:** ¿Pescadores pescadores?

**CÓNDOR:** Pescadores pescadores.


### SIN NADA PARA TIRAR

Radio en vuelo · **no frena** · del 30%–35% · tránsito del Narwal · `M04_NARWAL_E`

**VASCO:** Sin nada para tirar.

**CÓNDOR:** Sin nada para tirar.

**PUMA:** *(casi para sí mismo, y es lo único que dice en todo el tramo)* No son militares, Gitano. Y están más adentro que nosotros.


---


## M5 · EL CALLEJÓN DE LAS BOMBAS

### OBJETIVO

Radio en vuelo · **no frena** · al despegar, primer 10% del camino · `M05_OBJETIVO`

**CÓNDOR:** Escuadrilla Aguilucho, aquí Cóndor. Entrada al estrecho de San Carlos.

**CÓNDOR:** Blanco: fragata en el fondeadero. Entran, sueltan y salen por el norte. Buen vuelo.

**PUMA:** Nadie se hace el héroe ahí adentro. Entramos, soltamos, salimos.


### POSICIONES

Radio en vuelo · **no frena** · del 10%–17% · tránsito del Narwal · `M05_NARWAL_A`

**CÓNDOR:** Plata Fiel, posiciones.

**CÓNDOR:** Actividad en San Carlos. Varias unidades.

**GITANO:** ¿Varias cuántas, Cóndor?

**CÓNDOR:** Varias. No tengo número.


### PREGUNTALE AL PESQUERO

Radio en vuelo · **no frena** · del 17%–24% · tránsito del Narwal · `M05_NARWAL_B`

**GITANO:** ¿Cómo que no tenés número? La otra vez me diste hasta la velocidad.

**GITANO:** Cóndor. Preguntale al pesquero.

*tres segundos de radio abierta: el ruido de fondo y nada más* …

**GITANO:** Cóndor. El pesquero.

**CÓNDOR:** Hace doce días que no transmite.


### ENTRAMOS

Radio en vuelo · **no frena** · del 24%–31% · tránsito del Narwal · `M05_NARWAL_C`

**GITANO:** *(sin nada arriba, la voz plana)* …Copiado.

**PUMA:** Formación cerrada. Entramos.


---


## M6 · LA BOMBA QUE NO DESPERTÓ

### OBJETIVO

Radio en vuelo · **no frena** · al despegar, primer 10% del camino · `M06_OBJETIVO`

**CÓNDOR:** Escuadrilla Carancho, aquí Cóndor. Fragata al noroeste del estrecho.

**CÓNDOR:** Aviso de armamento: a esta altura la espoleta puede no armarse. Lo saben. Buen vuelo.

**PUMA:** Le pegamos igual. Que la bomba haga lo que pueda.


---


## M7 · PASTELITOS

### OBJETIVO

Radio en vuelo · **no frena** · al despegar, primer 10% del camino · `M07_OBJETIVO`

**CÓNDOR:** Escuadrilla Zorzal, aquí Cóndor. Destructor en el estrecho.

**CÓNDOR:** Hoy cuelgan las españolas, con la espoleta nueva. Si pega, explota.

**CÓNDOR:** Feliz veinticinco, muchachos. A ver si me lo bajan. Buen vuelo.


---


## M8 · EL BATIR DE LAS ALAS

### OBJETIVO

Radio en vuelo · **no frena** · al despegar, primer 10% del camino · `M08_OBJETIVO`

**CÓNDOR:** Escuadrilla Hornero, aquí Cóndor. Blanco: carguero grande, mucho porte.

**CÓNDOR:** Trae los helicópteros pesados. Si no llega, la infantería cruza la isla a pie. Buen vuelo.


---


## M9 · EL PIBE

### OBJETIVO

Radio en vuelo · **no frena** · al despegar, primer 10% del camino · `M09_OBJETIVO`

**CÓNDOR:** Escuadrilla Golondrina, aquí Cóndor. Centro logístico en San Carlos.

**CÓNDOR:** Es lo más defendido que hay sobre las islas. No tengo mejores noticias. Buen vuelo.

**PUMA:** Pichón, vos pegado a mí. No te separás ni para respirar.


---


## M10 · LOS PRIMOS

### OBJETIVO

Radio en vuelo · **no frena** · al despegar, primer 10% del camino · `M10_OBJETIVO`

**CÓNDOR:** Escuadrilla Chingolo, aquí Cóndor. Reconocimiento armado sobre las islas.

**CÓNDOR:** Salen, miran, si hay algo lo tocan, y vuelven. El clima está peor que el enemigo. Buen vuelo.

**PUMA:** Y hoy la nafta se cuida. Lo que llevamos es lo que hay.


---


## M11 · LO QUE NO SE DICE

### OBJETIVO

Radio en vuelo · **no frena** · al despegar, primer 10% del camino · `M11_OBJETIVO`

**CÓNDOR:** Escuadrilla Calandria, aquí Cóndor. Apoyo sobre Fitzroy.

**CÓNDOR:** Buque de desembarco fondeado, con tropa a bordo. Está descargando. Buen vuelo.


---


## M12 · ÁNGEL DE CORRIENTES

### OBJETIVO

Radio en vuelo · **no frena** · al despegar, primer 10% del camino · `M12_OBJETIVO`

**CÓNDOR:** Escuadrilla Chajá, aquí Cóndor. Segunda salida sobre Fitzroy.

**CÓNDOR:** El otro buque sigue ahí. Mismo fondeadero, misma entrada. Buen vuelo.

**PUMA:** Otra vez. Ahora.


---


## M13 · LA CENA

### OBJETIVO

Radio en vuelo · **no frena** · al despegar, primer 10% del camino · `M13_OBJETIVO`

**CÓNDOR:** Escuadrilla Caburé, aquí Cóndor. Apoyo a las posiciones de los montes.

**CÓNDOR:** Hay fragatas dando fuego naval sobre nuestra gente. Hay que espantarlas de la costa. Buen vuelo.

**PUMA:** Esta noche volamos sobre las cabezas de los nuestros. Ojo con lo que sueltan.


---


## M14 · EL TERO

**No hay ningún diálogo en vuelo.** Cóndor deniega la misión antes de salir, y en el aire nadie habla.

---


## Y uno que existe pero no está en ninguna misión: Puma enseñando a bombardear

Está en la misión de prueba **t16, LA SUELTA**, del banco de pruebas (`pruebas_misiones.js`). **No
lo usa ninguna de las catorce.** Lo pongo porque es exactamente lo que pediste para **M3**:
aprender a tirar la bomba, errar, volver a intentar, y que no detone. *(Los "cuándo" los deduzco
del nombre de cada aviso.)*

### PUMA · EL BLANCO

Aviso en vuelo · **no frena** · cuando el blanco aparece en el horizonte · `AV_T16_ASOMA`

*Se dice una sola por vez, elegida de estas:*

**PUMA:** Ahí está, Tero. Sobre el horizonte. No le saques los ojos de encima.

**PUMA:** Blanco a la vista. Pegado al agua hasta que te diga.


### PUMA · ALINEARSE

Aviso en vuelo · **no frena** · si no venís alineado con el blanco · `AV_T16_ALINEA`

*Se dice una sola por vez, elegida de estas:*

**PUMA:** Ponelo en la nariz. Derechito al medio.

**PUMA:** Corregí. El blanco al centro, justo adelante.


### PUMA · SUBIR A SOLTAR

Aviso en vuelo · **no frena** · cuando hay que subir para soltar · `AV_T16_SUBE`

*Se dice una sola por vez, elegida de estas:*

**PUMA:** Ahora subí. Diez metros, no más.

**PUMA:** Un poco arriba, que desde el agua la bomba no despierta.


### PUMA · MUY ALTO

Aviso en vuelo · **no frena** · si estás demasiado alto · `AV_T16_BAJA`

**PUMA:** Muy alto, Tero. Te van a ver. Bajá un poco.


### PUMA · ESPERAR

Aviso en vuelo · **no frena** · antes del punto de suelta · `AV_T16_ESPERA`

*Se dice una sola por vez, elegida de estas:*

**PUMA:** Esperá… esperá…

**PUMA:** Todavía no. Aguantá.


### PUMA · ¡AHORA!

Aviso en vuelo · **no frena** · en el punto de suelta · `AV_T16_SOLTA`

*Se dice una sola por vez, elegida de estas:*

**PUMA:** ¡Ahora! ¡Soltá!

**PUMA:** ¡Soltá, soltá!


### PUMA · LA SALIDA

Aviso en vuelo · **no frena** · después de soltar, para salir por arriba · `AV_T16_SALI`

*Se dice una sola por vez, elegida de estas:*

**PUMA:** ¡Arriba, por encima de los palos!

**PUMA:** ¡Pasale por arriba y quebrá!


### PUMA · CORTA

Aviso en vuelo · **no frena** · si la bomba cayó corta · `AV_T16_CORTA`

**PUMA:** Corta. Soltaste temprano.


### PUMA · LARGA

Aviso en vuelo · **no frena** · si la bomba cayó larga · `AV_T16_LARGA`

**PUMA:** Larga. Soltaste muy alto o muy tarde.


### PUMA · NO DESPERTÓ

Aviso en vuelo · **no frena** · si pegó sin armarse · `AV_T16_DORMIDA`

**PUMA:** Pegó y no despertó. Más alto la próxima.


### PUMA · TOCADO

Aviso en vuelo · **no frena** · si lo tocaste sin hundirlo · `AV_T16_AVERIADO`

**PUMA:** Tocado. Con eso no alcanza.


### PUMA · LOS PALOS

Aviso en vuelo · **no frena** · si te llevaste una antena · `AV_T16_ROCE`

**PUMA:** ¡Te llevaste una antena puesta! Más arriba el salto, Tero.


### PUMA · ¡LE DISTE!

Aviso en vuelo · **no frena** · si le diste · `AV_T16_HUNDIDO`

**PUMA:** ¡Le diste, Tero! ¡Le diste en el medio!


### PUMA · OTRA PASADA

Aviso en vuelo · **no frena** · si sigue a flote: otra pasada · `AV_T16_REENCARE`

**PUMA:** Sigue a flote. Damos la vuelta y otra pasada.


### PUMA · NO EXPLOTÓ

Aviso en vuelo · **no frena** · si pegó y la bomba falló sola · `AV_T16_FALLA`

*Se dice una sola por vez, elegida de estas:*

**PUMA:** Pegó y no explotó. Hiciste todo bien, Tero: fue la bomba.

**PUMA:** Otra más que no despierta. La tiraste perfecta. Es la bomba, Tero, no vos.

**GITANO:** Adentro del casco y nada. Quinientos kilos de fierro inglés durmiendo la siesta.


### PUMA · NO EXPLOTÓ

Aviso en vuelo · **no frena** · si no explotó por caer poco · `AV_T16_FALLACAIDA`

**PUMA:** No explotó. Cayó poco: más alto y más temprano, que tenga tiempo de caer.


### PUMA · EXPLOTÓ

Aviso en vuelo · **no frena** · si explotó con retardo · `AV_T16_TARDE`

**PUMA:** ¡Explotó! Tarde, pero explotó.

