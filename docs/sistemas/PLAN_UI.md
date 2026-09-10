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

## 1c. Fase B — el tablero de las dos esquinas *(aplicada)*

De las cuatro propuestas del artifact **"Cuatro tableros y una voz"** (6/9/2026), se ejecutó la
**B**, con la **D** como perilla encima. El diagnóstico que las ordenaba: el HUD se lee de reojo, y
la periferia recibe movimiento y contraste, no texto ni números.

| Qué | Antes | Ahora |
|---|---|---|
| **RASANTE · MOMENTUM** | dos barras con rótulo arriba a la derecha | **dos rieles en los bordes laterales**, izquierda rasante y derecha momentum. Sin rótulo, sin placa y sin número: un riel no se lee, se vigila. A cambio el recorrido pasa de 44 px a **180** — la altura entera— en la única franja donde no compite con nada (el margen del HUD es 4, así que de `x 0` a `3` y de `316` a `319` no se dibuja nada más en todo el juego) |
| **El reloj del rasante** | siempre, al lado de su barra | **sólo mientras el poder está encendido**, en la esquina que las barras dejaron libre. Es el único dato que un riel no puede dar —cuántos segundos, no qué fracción— y es el único momento en que hace falta |
| **El gas** | arrancaba en `y=64`, debajo de las dos barras | sube a `GAS_TOP = 42`: la corredera pasa de **54 px de recorrido a 76**. Es el único instrumento que se *opera* en vez de leerse, y una palanca más larga se apunta mejor |
| **La banda de la voz** | el toast cerraba en `y=118` | cierra en **127**. El número ya no se copia: sale de `HUD_TECHO`, que `render/hud.js` calcula con las mismas constantes con que apila las filas |

### El fantasma de los diecinueve píxeles

`HUD_TINTA` valía 110 y estaba **copiado a mano** en `render/screens.js`. Ese número lo escribió la
época en que RASANTE y MOMENTUM eran la cuarta y la quinta barra de la pila de la izquierda y
subían hasta ~112. Desde entonces se mudaron dos veces —arriba a la derecha en U1, a los rieles
ahora— y el toast siguió esquivando un instrumento que ya no estaba ahí: diecinueve píxeles de
banda libre que la voz no usaba por miedo a un fantasma.

Ahora `hud.js` **exporta** `HUD_TECHO = R3 - 9` (el canto de las placas de la fila más alta) y
`screens.js` lo importa. El día que las filas se muevan otra vez, la banda se mueve con ellas.

## 1d. Fase D — el tablero por demanda *(aplicada, apagada por default)*

`cfg.hudAuto`, fila **TABLERO** en OPCIONES, al lado de **RADIO EN VUELO** porque las dos contestan
la misma pregunta —cuánta pantalla ocupa la UI mientras volás— y ninguna cambia un número del
juego. Con `auto`, un instrumento **sano** no se dibuja:

| Instrumento | Aparece cuando |
|---|---|
| COMB | la nafta baja de 60 % |
| AVIÓN | la integridad no está al 100 % |
| CHANCHA | el medidor se llenó, ya se gastó, o hay cita en curso |
| ESTADO | el peor de los tres baja de 97 % |
| CAÑÓN | `heat > 0.05` o está recalentado |
| MISIL | falta al menos uno |

No se ocultan nunca el ADI (la pregunta "¿dónde está el suelo?" es accionable siempre, y más
rolado), la velocidad y la altura, el gas, la ruta ni el escuadrón. Los rieles tampoco: ocupan dos
píxeles y no le sacan lugar a nadie.

**Casi sin histéresis, y por qué**: nafta, integridad y misiles sólo bajan, y el medidor de la
chancha sólo sube, así que cada umbral se cruza una vez. Los dos que van y vienen tienen su umbral
corrido en vez de un temporizador: el calor del cañón en 0,05 y no en 0, y ESTADO en 97 % y no en
100 — el margen de roce sube y baja solo mientras se vuela rasante, y en 100 el instrumento
parpadearía con cada ola.

**Arranca en `fijo`** —el tablero completo de siempre— y no por prudencia: la contra está escrita en
el oficio y es real. Un instrumento que va y viene no genera memoria muscular, y el que recién
empieza no sabe que existe hasta que le falla. Es una perilla para decidirla jugando.

## 1e. La duración del cartel *(aplicada)*

`popup()` plantaba **1,1 s para cualquier texto**. Volando rasante nadie lee de un tirón: se lee en
ráfagas de décimas, así que un `+400` sobraba y una línea de radio de diez palabras se iba antes de
terminar de leerse — que no es un cartel que se pierde, es un cartel que enseña a no leer los
carteles.

```
vidaCartel(txt) = max(1,1 · min(6 · 0,6 + palabras × 0,32))   // core/fx.js
barkDur(txt)    = max(2,4 · min(6 · 1,2 + palabras × 0,35))   // render/bark.js
```

**El piso es el valor de siempre**, y es la parte que importa: los puntajes son de una palabra y
salen idénticos al cuadro. Lo único que cambió es lo que antes se iba corto.

**Y sube siempre lo mismo, no siempre a la misma velocidad.** El popup ahora lleva su `vy`
(`POP_SUBE / life`): con la velocidad fija, un cartel de cuatro segundos se iba 56 px para arriba y
terminaba de leerse encima de otro instrumento — justo lo que la duración variable venía a
arreglar. El de una palabra da 14 exacto, el número de siempre.

Los dos pisos son distintos a propósito: un popup comparte pantalla con los puntajes y arranca en
1,1 s; el bark está solo y en grande, y por debajo de 2,4 s se lee como un parpadeo.


## 1f. La ruta, en una fila *(aplicada)*

Eran **tres renglones apilados y 27 px de alto**: el nombre del buque arriba en cuerpo 6 y color de
aviso, la ruta en el medio, la cuenta regresiva abajo. El bloque más grande y más ruidoso del HUD,
arriba al centro, para decir tres cosas que no cambian de un cuadro al otro — y el nombre del
buque, que no cambia **nunca** en toda la misión, estaba escrito más grande que la velocidad.

Puestos **en fila**, los tres entran en 11 px y se leen en el orden en que se preguntan:

> `HMS SHEFFIELD` · ▸ ——————— ⊥ · `2447 m`
> quién es el blanco · dónde estoy · cuánto falta

| | Antes | Ahora |
|---|---|---|
| alto | 27 | **11** |
| nombre | cuerpo 6, `P.warn`, centrado arriba | cuerpo 5, `P.dim`, en la fila. Es contexto, no un valor que se vigile |
| la línea | 96 px de recorrido | 52 |
| íconos | 9 px | 7 · y el marcador del avión ahora también sale de `hpx` (estaba clavado en 6 y se comía el renglón) |
| ancho | fijo, 30 % de la pantalla | **sale del contenido**, y la placa se centra como un bloque — con nombre a la izquierda y número a la derecha, centrar la *línea* dejaba el instrumento corrido |
| el aviso de viento | `topBase = 38` | 24: la ruta cierra en 15, así que sube con ella en vez de dejar hueco |

Área: **134 × 11 contra 114 × 27** — un tercio de la tinta.


## 1g. MEJOR es de POR LA PATRIA *(aplicada)*

Estaba en todos los modos menos campaña, y ahí mentía dos veces.

`rasante_frontal_best` es **un número global**: una corrida de CICLO DE MUERTE, del ARENA o de las
PASADAS lo empujaba igual, así que el máximo que veías en un modo podía haberse hecho en otro. Y en
los modos con objetivo la corrida ni siquiera es comparable — termina cuando llegás al buque, no
cuando te matan, o sea que el puntaje lo decide la distancia y no cómo volaste.

**POR LA PATRIA es el único modo donde una corrida es una corrida**: infinita, sin objetivo, y se
acaba cuando te caés. Ahí un máximo histórico dice algo.

Tres lugares, una decisión:

| Dónde | Antes | Ahora |
|---|---|---|
| HUD (`render/hud.js`) | en todo modo salvo campaña | `gameMode === 'survival'` |
| El récord se **escribe** (`game.js`) | en toda corrida que no sea de herramienta | además, sólo en `survival`. Un récord que se hace en un modo y se luce en otro no es un récord |
| Pantalla de derribo (`drawDead`) | siempre; decía «MEJOR 0» en partida nueva y «NUEVO RECORD» en modos que no lo iban a guardar | `best` llega en **cero** fuera de POR LA PATRIA —el mismo criterio que ya usaba `stars`— y la línea no se dibuja con cero |

El HUD **sí** muestra `MEJOR 0` en POR LA PATRIA sin récord todavía: ahí el cero es honesto —es el
instrumento de ese modo diciendo que no marcaste nada— mientras que en la pantalla de derribo se
leía como un veredicto.


## 1h. El puntaje se va, el kilometraje entra al objetivo *(aplicada)*

Dos decisiones del playtest del 8/9 que dejan la esquina superior izquierda con una sola cosa.

**El PUNTAJE salió de todos los modos.** Ya estaba oculto en campaña; ahora tampoco está en JUEGO
RÁPIDO. Un contador de arcade corriendo arriba a la izquierda no cambia nada de lo que hacés en los
próximos diez segundos: los puntos se cobran cuando la corrida termina, y ahí tienen una pantalla
entera para decirse. Estaba ocupando la esquina donde uno mira primero para dar un número que sólo
importa después.

**El KILOMETRAJE se mudó adentro de la ruta**, cuando hay ruta. `0.1 / 2.6` es cuánto llevás **de
esta ruta**: es parte del objetivo, no un instrumento aparte cuatro filas más abajo que lo repite.

| | Antes | Ahora |
|---|---|---|
| con objetivo | odómetro en su placa arriba a la izquierda | dentro de la fila de la ruta, pegado al buque |
| sin objetivo (POR LA PATRIA) | igual | **se queda arriba a la izquierda**, en forma de contador abierto: no hay ruta donde meterlo, y sin nada contra qué medir la fracción no existe |
| la cuenta regresiva en metros | `2447 m` al final de la fila | **reemplazada por la fracción** |

Las dos decían el mismo hecho —`2.6 − 0.1` es lo que falta— y ponerlas juntas habría sido decirlo
dos veces en dos unidades. Se eligió la fracción porque además dice **contra qué**, que la cuenta
sola no dice. Dentro de la fila: lo hecho en acento, el total en el color del blanco (que es lo que
lo ata al ícono del buque que tiene al lado) y `KM` en cuerpo 5.

El bloque superior izquierdo queda con **escuadrón** y nada más — salvo en POR LA PATRIA, donde
lleva escuadrón, odómetro y MEJOR.


## 1i. Una sola cinta para todos los modos *(aplicada)*

El renglón de arriba al centro **significa una cosa sola: cómo va esta corrida**. Lo que cambia
entre modos es contra qué va, no la pregunta:

```
con objetivo    HMS SHEFFIELD  ▸——⊥  0.2 / 2.6 KM     contra el buque
POR LA PATRIA   0.3 KM         ▸——⚑  149 / 48200      contra tu récord
```

Es la **misma información** —dónde estás de lo que te propusiste— así que es el mismo instrumento y
no dos. Hay un solo `cinta()` y dos llamadores; escribirlo dos veces era garantizar que se
separaran a la primera corrección (uno se achica, el otro no, y el HUD tiene dos idiomas en el
mismo renglón).

**Anatomía**, 11 px de alto: rótulo de contexto (cuerpo 5, apagado — no cambia o cambia despacio) ·
línea con las dos puntas y el marcador · fracción (cuerpo 6: lo hecho en acento, la meta en el
color de la meta, que es lo que la ata al ícono de al lado).

### Lo que esto resolvió en POR LA PATRIA

Kilometraje, puntaje y récord eran **tres placas sueltas apiladas en la esquina** diciendo lo
mismo desde tres lados. Ahora son una cinta: los kilómetros como rótulo (cuánto aguantaste), el
puntaje contra el récord como fracción, y la línea mostrando cuánto te falta para batirlo. **El
puntaje vuelve al HUD, pero sólo acá** — en POR LA PATRIA el puntaje *es* el juego; en los modos
con objetivo lo decide la distancia y no cómo volaste.

| Caso | Qué se ve |
|---|---|
| récord > 0 | la cinta completa, con línea y bandera |
| **sin récord todavía** | sin línea: una barra que avanza hacia cero no avanza hacia nada. Quedan kilometraje y puntaje |
| **pasaste tu marca** | bandera y récord en **acento**. La línea ya está llena y el marcador clavado en la punta: no hace falta un cartel, que en POR LA PATRIA taparía mundo justo cuando más se arriesga |

### Detalles que salieron de probarlo

- **La marca a batir es una bandera, no una estrella.** El primer intento fue un asterisco: a
  cuerpo 5 un asterisco es una cruz roja y no se lee como "hasta acá". Una bandera —mástil y paño—
  es la misma silueta mínima que el muelle y el buque del otro lado, así que además habla el mismo
  idioma.
- **`drawOdo` quedó sólo para PERSECUCIÓN**, el único modo sin objetivo *ni* récord: ahí no hay
  cinta posible y el kilometraje vuelve a ser un contador abierto arriba a la izquierda. Se le cayó
  la rama de la fracción, que ya no la usa nadie.
- La esquina superior izquierda queda con **el escuadrón y nada más** en todos los modos salvo
  persecución.


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

7. **Los popups de aviso NO se mudaron a una banda.** Parecía el arreglo obvio —hay births en
   `y=38` y `y=46` que suben 15 px y entran en la placa de la ruta— pero cada uno de esos números
   tiene una razón de escena escrita al lado: la radio de la Chancha va en 38 justamente porque a
   media altura tapaba al Hércules, y la radio de tramo ya bajó a 58 por la placa. No es una
   constante mal puesta repetida catorce veces: son catorce decisiones. Unificarlas es un trabajo
   de guion, no de refactor.
8. **El gas se movió, y eso cuesta memoria muscular.** Es la excepción a "posición estable" de toda
   esta fase. Se aceptó porque el gas no se *lee* —se opera, y se opera con una tecla— y porque 22
   px más de corredera son 22 px más de resolución en el único control analógico del juego.
9. **El reloj del rasante quedó bajo el reproductor de música**, que es HTML y vive en los primeros
   ~15 px de esa esquina. No se pisan (la placa arranca en 15), pero están pegados. En campaña el
   reproductor está oculto, así que el caso apretado es sólo JUEGO RÁPIDO.

10. **El nombre del buque se quedó, achicado.** La alternativa era sacarlo: no cambia nunca, lo dice
    el briefing, y el total del odómetro ya está pintado en el color del blanco. Sacarlo dejaría la
    ruta en ~90 px de ancho en vez de 134. Se mantuvo porque es lo único de la pantalla que dice
    *contra qué* estás volando, y porque el pedido fue achicar, no sacar.

11. **El récord dejó de escribirse fuera de POR LA PATRIA, y eso no se pidió explícitamente.** El
    pedido fue sacarlo de la vista; restringir también la *escritura* es la consecuencia — si sólo
    se ocultara, una corrida de CICLO seguiría inflando en silencio el número que POR LA PATRIA
    muestra. Revertir es sacar una condición en `game.js`.

12. **La cuenta regresiva en metros desapareció**, y había sido un pedido explícito ("que vaya
    restando los metros"). No sobrevivió a meter el kilometraje en la misma fila: dos números para
    el mismo hecho, a tres píxeles uno del otro. Si se la extraña, el reemplazo natural es que la
    fracción cuente al revés (`2.5 / 2.6` bajando), no volver a tener las dos.

## 3. Lo que sigue pendiente *(de la auditoría, sin decidir)*

- **La banda de popups** sigue subiendo por la franja de la ruta: ver divergencia 7.
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
