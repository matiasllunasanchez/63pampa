# PLAN UI — el HUD, después de la auditoría

> Documento de trabajo. La auditoría que lo abre está en el artifact **"El HUD de Rasante"**
> (inventario de ~40 elementos, medido sobre el build de Electron el 29/8/2026).
> Acá va lo que se **decidió** y lo que se **aplicó**.

---

## 0. El diagnóstico, en una línea

El juego cambiaba de idioma visual tres veces dentro de una misma misión —placas en el pasillo,
bandas negras en pasada/arena, panel de texto en el pulso— y una cuarta capa (HTML sobre el canvas)
flotaba encima de todas. Además: seis barras a la vez, dos escalas distintas para la altura, y tres
cosas peleándose la esquina superior derecha.

## 1. Fase U1 — la esquina de la corrida *(aplicada)*

Lo que el playtest del 29/8 decidió, elemento por elemento.

| Qué | Antes | Ahora |
|---|---|---|
| **ESTADO** | silueta del avión, 28×26, tres partes coloreadas | **barra con porcentaje**, en la columna derecha. El número es **el peor de los tres** (cañón, combustible, roce): un avión con el tanque lleno y el cañón fundido no está al 80 %, está fundido |
| **MISIL** | pips en el centro-abajo, al lado del combustible | **debajo de CAÑÓN**, columna derecha. Son armamento, no consumo de vuelo |
| **RASANTE · MOMENTUM** | dos de tres barras apiladas abajo a la izquierda | **arriba a la derecha**, en la esquina que liberó MEJOR. Se *ganan* volando; no son del bloque del avión |
| **CHANCHA** | tercera barra de la misma pila | se queda **al lado del combustible**: es reabastecimiento, no racha |
| **PUNTAJE** | siempre | **oculto en campaña** (los puntos se cobran en el recuento). Vive en JUEGO RÁPIDO, que es donde el puntaje *es* el juego |
| **MEJOR** | arriba a la derecha, tapado por el reproductor | **oculto en campaña**; en juego rápido baja al bloque de la izquierda, junto al puntaje contra el que se compara |
| **KM** | al lado del puntaje | se queda. Es lo único que dice cuánto llevás cuando la misión no tiene barra de objetivo |
| **ESCUADRÓN** | tira de pips bajo el puntaje, nombre en gris | **encabeza el bloque superior izquierdo**: placa de dos renglones, rótulo `ESCUADRON`, y el **nombre del que vuela en acento** |
| **Sello PRUEBA** | arriba al centro | **se fue** |
| **Íconos de la ruta** | siluetas sueltas de 8-9 px sobre el cielo | **placa oscura de 11×11** y silueta mínima adentro (casco y mástil · muelle y grúa) |
| **Reproductor de música** | — | ya estaba oculto en campaña (`canPickMusic`). Sin cambios |

### Lo que apareció al mover las cosas

**Los rótulos de las barras no estaban sobre nada.** La placa cubría la barra pero no su nombre. En
las esquinas de abajo eso funcionaba —el mar y la tierra son oscuros— pero RASANTE y MOMENTUM se
mudaron contra el cielo del amanecer y el gris del rótulo desapareció. Ahora **la placa incluye el
rótulo**: 14 px de alto, que además *teselan* con el paso de 14 con que se apilan las barras — se
tocan y no se pisan. Lo mismo el rótulo del GAS, que vive contra el cielo por definición.

**El odómetro tenía la línea de base clavada en `y=12`.** Desde que el bloque superior izquierdo se
apila (escuadrón primero), el odómetro dejó de estar siempre en la fila 1. Ahora sale de `y`.

**Los primeros 12 px de la esquina superior derecha no son del canvas**: ahí está el botón de sonido,
que es HTML. Por eso las dos barras arrancan en `y=22` y el GAS bajó a `y=56`.

## 1b. Fase U2 — el ritmo y la ruta *(aplicada)*

### El ritmo

Las placas **se tocaban**: un instrumento mide 14 de alto (rótulo + barra) y el paso con que se
apilaban era 14, o sea sin aire. Eso teselaba perfecto, y teselar era el problema — cada columna se
leía como un bloque oscuro partido en franjas y no como tres instrumentos.

Hoy hay dos constantes y todo sale de ellas:

| | |
|---|---|
| `INSTR` | 14 — rótulo + barra |
| `AIRE` | 3 — entre un instrumento y el siguiente |
| `FILA` | 17 — el único paso con que se apila cualquier cosa del HUD |
| `MARGEN` | 4 — contra el borde, **en las cuatro esquinas** |
| `F_ROT` / `F_VAL` | 5 px el rótulo, 6 px el valor |

**Y dos tamaños de letra, no uno.** El rótulo dice cómo se llama el instrumento —se lee una vez y
después ya lo sabés de memoria— y el valor es lo que se mira todo el tiempo. Estaban los dos en 6 px
y el tablero gritaba los nombres tan fuerte como los números. Con el rótulo en 5 el ojo va solo a lo
que cambia. En la grilla de diseño 5 px caen en 15 reales (U 1,5 × SC 2 = 3 exacto): no hay medio
píxel, el tipo sigue siendo duro.

**El gas comparte el borde derecho con su rótulo**, que es el mismo de ESTADO / CAÑÓN / MISIL. La
placa del rótulo es más ancha que la corredera —la palabra mide más que 10 px— así que sin un borde
compartido se leían como dos cosas puestas ahí cerca.

El margen estaba en 3 arriba a la izquierda, 4 abajo, 6 arriba a la derecha y 2 en el gas: cuatro
números distintos para la misma decisión. El ADI también se cuadró — su placa apoya en `MARGEN` y
deja `AIRE` contra el combustible.

### La ruta

| Qué | Antes | Ahora |
|---|---|---|
| **La línea** | dos íconos con placa unidos por una línea dibujada directo sobre el cielo | **un solo instrumento sobre una placa**: muelle, ruta, marcador y buque adentro. Los íconos ya no necesitan la suya |
| **Los metros** | `2400 m` como título centrado arriba | **cuenta regresiva** chica, abajo y pegada al buque, en el color del buque. Lo que importa no es cuánto llevás: es cuánto falta |
| **El nombre** | siempre | **solo si es un nombre.** Un objetivo de distancia se rotulaba `2400 m`, que es el mismo dato que ahora dicen la cuenta regresiva y el total del odómetro. Con un buque (`HMS SHEFFIELD`) el rótulo sí aporta |
| **El odómetro** | contador abierto `0.4 KM` | **fracción** `0.4 / 2.4 KM`, con el total en el color del blanco. En campaña la corrida nunca pasa de ese número, así que un contador sin techo medía contra nada |
| **`MISION n/m`** | y=12 | **se fue.** Era lo único del HUD que hablaba del *menú* y no del vuelo: en qué número de la campaña estás no cambia nada de lo que hacés en los próximos diez segundos, y lo dice el briefing antes de despegar. Ocupaba el renglón más visible de la pantalla |
| **La placa de la ruta** | flotando a media banda | apoya en `MARGEN`, como todo el resto. Estaba más abajo para dejarle sitio al contador — una posición heredada, no una decisión |

Para distinguir nombre de distancia, `game.js` publica ahora `objectiveKind` junto al rótulo — el
render no adivina leyendo el string.

## 2. Divergencias

1. **`ESTADO` sigue duplicando dos de sus tres datos.** El porcentaje es el mínimo de cañón,
   combustible y roce, y los dos primeros ya son barras. Se mantuvo así porque el pedido fue
   convertirlo en barra, no sacarlo — pero la alternativa honesta sigue disponible: que muestre
   **solo el margen de roce**, que es el único dato suyo, con otro rótulo.
2. **Los íconos de la ruta llevan placa los dos**, no solo el de llegada. El pedido nombraba al
   buque; poner placa en una punta y no en la otra habría hecho ver la ruta torcida.
3. **El sello PRUEBA se fue sin reemplazo.** Existía para que una captura de herramienta no se
   confundiera con un playtest real, y se mudó dos veces esquivando cosas. Un rótulo que no cabe en
   ningún lado sin tapar algo es un rótulo que el HUD no tiene lugar para tener; `S.test` sigue
   existiendo para todo lo demás.
4. **El puntaje se ocultó, no se achicó.** El pedido daba las dos opciones ("mucho más chico o
   directamente ocultar") y ocultarlo en campaña —donde no decide nada— deja el bloque respirando;
   achicarlo lo habría dejado como ruido ilegible en vez de ruido legible.

5. **`CHANCHA` no se movió con sus hermanas.** El pedido decía "en esa zona dejamos las dos barras",
   y la chancha es reabastecimiento, no racha: al lado del combustible dice más que arriba con los
   poderes de puntaje.
6. **La banda de popups quedó detrás de la placa de la ruta.** `¡TENÉS EL MANDO!` y compañía se
   dibujan en espacio de mundo, antes del HUD, y suben por esa franja. Ya estaba apretada —la
   auditoría lo marcó— y ahora se ve. Arreglo pendiente: bajar la banda de popups, no achicar la ruta.

## 3. Lo que sigue pendiente *(de la auditoría, sin decidir)*

- **Las unidades mienten entre modos.** Pasillo: altura 0..68 rotulada `M`, radar a 20,
  `spd × 4.2`. Pasada: metros reales, radar a **10**, `spd × 3.6`. Mismo rótulo, dos escalas y dos
  factores. Es el arreglo más barato y el de mayor efecto que queda.
- **Un solo idioma para todos los modos**: que pasada, arena y pulso hereden las placas en vez de
  bandas negras.
- **Las leyendas de teclas permanentes** de arena y pasada.
- **Los títulos de modo** en la banda superior.
- **Cuatro maneras de decir "te ve el radar"**.
- **El panel del PULSO**, hoy en la esquina y lejos del buque.
- **La escala de altura de la pasada** —lo mejor que hay— llevada al pasillo.
- **Header y footer HTML** del build web.
