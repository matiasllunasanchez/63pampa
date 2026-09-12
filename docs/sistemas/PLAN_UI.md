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

## 1. Fase U1 — la esquina de la corrida _(aplicada)_

Lo que el playtest del 29/8 decidió, elemento por elemento.

| Qué                       | Antes                                            | Ahora                                                                                                                                                                                           |
| ------------------------- | ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ESTADO**                | silueta del avión, 28×26, tres partes coloreadas | **barra con porcentaje**, en la columna derecha. El número es **el peor de los tres** (cañón, combustible, roce): un avión con el tanque lleno y el cañón fundido no está al 80 %, está fundido |
| **MISIL**                 | pips en el centro-abajo, al lado del combustible | **debajo de CAÑÓN**, columna derecha. Son armamento, no consumo de vuelo                                                                                                                        |
| **RASANTE · MOMENTUM**    | dos de tres barras apiladas abajo a la izquierda | **arriba a la derecha**, en la esquina que liberó MEJOR. Se _ganan_ volando; no son del bloque del avión                                                                                        |
| **CHANCHA**               | tercera barra de la misma pila                   | se queda **al lado del combustible**: es reabastecimiento, no racha                                                                                                                             |
| **PUNTAJE**               | siempre                                          | **oculto en campaña** (los puntos se cobran en el recuento). Vive en JUEGO RÁPIDO, que es donde el puntaje _es_ el juego                                                                        |
| **MEJOR**                 | arriba a la derecha, tapado por el reproductor   | **oculto en campaña**; en juego rápido baja al bloque de la izquierda, junto al puntaje contra el que se compara                                                                                |
| **KM**                    | al lado del puntaje                              | se queda. Es lo único que dice cuánto llevás cuando la misión no tiene barra de objetivo                                                                                                        |
| **ESCUADRÓN**             | tira de pips bajo el puntaje, nombre en gris     | **encabeza el bloque superior izquierdo**: placa de dos renglones, rótulo `ESCUADRON`, y el **nombre del que vuela en acento**                                                                  |
| **Sello PRUEBA**          | arriba al centro                                 | **se fue**                                                                                                                                                                                      |
| **Íconos de la ruta**     | siluetas sueltas de 8-9 px sobre el cielo        | **placa oscura de 11×11** y silueta mínima adentro (casco y mástil · muelle y grúa)                                                                                                             |
| **Reproductor de música** | —                                                | ya estaba oculto en campaña (`canPickMusic`). Sin cambios                                                                                                                                       |

### Lo que apareció al mover las cosas

**Los rótulos de las barras no estaban sobre nada.** La placa cubría la barra pero no su nombre. En
las esquinas de abajo eso funcionaba —el mar y la tierra son oscuros— pero RASANTE y MOMENTUM se
mudaron contra el cielo del amanecer y el gris del rótulo desapareció. Ahora **la placa incluye el
rótulo**: 14 px de alto, que además _teselan_ con el paso de 14 con que se apilan las barras — se
tocan y no se pisan. Lo mismo el rótulo del GAS, que vive contra el cielo por definición.

**El odómetro tenía la línea de base clavada en `y=12`.** Desde que el bloque superior izquierdo se
apila (escuadrón primero), el odómetro dejó de estar siempre en la fila 1. Ahora sale de `y`.

**Los primeros 12 px de la esquina superior derecha no son del canvas**: ahí está el botón de sonido,
que es HTML. Por eso las dos barras arrancan en `y=22` y el GAS bajó a `y=56`.

## 1b. Fase U2 — el ritmo y la ruta _(aplicada)_

### El ritmo

Las placas **se tocaban**: un instrumento mide 14 de alto (rótulo + barra) y el paso con que se
apilaban era 14, o sea sin aire. Eso teselaba perfecto, y teselar era el problema — cada columna se
leía como un bloque oscuro partido en franjas y no como tres instrumentos.

Hoy hay dos constantes y todo sale de ellas:

|                   |                                                            |
| ----------------- | ---------------------------------------------------------- |
| `INSTR`           | 14 — rótulo + barra                                        |
| `AIRE`            | 3 — entre un instrumento y el siguiente                    |
| `FILA`            | 17 — el único paso con que se apila cualquier cosa del HUD |
| `MARGEN`          | 4 — contra el borde, **en las cuatro esquinas**            |
| `F_ROT` / `F_VAL` | 5 px el rótulo, 6 px el valor                              |

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

| Qué                     | Antes                                                                     | Ahora                                                                                                                                                                                                                                                          |
| ----------------------- | ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **La línea**            | dos íconos con placa unidos por una línea dibujada directo sobre el cielo | **un solo instrumento sobre una placa**: muelle, ruta, marcador y buque adentro. Los íconos ya no necesitan la suya                                                                                                                                            |
| **Los metros**          | `2400 m` como título centrado arriba                                      | **cuenta regresiva** chica, abajo y pegada al buque, en el color del buque. Lo que importa no es cuánto llevás: es cuánto falta                                                                                                                                |
| **El nombre**           | siempre                                                                   | **solo si es un nombre.** Un objetivo de distancia se rotulaba `2400 m`, que es el mismo dato que ahora dicen la cuenta regresiva y el total del odómetro. Con un buque (`HMS SHEFFIELD`) el rótulo sí aporta                                                  |
| **El odómetro**         | contador abierto `0.4 KM`                                                 | **fracción** `0.4 / 2.4 KM`, con el total en el color del blanco. En campaña la corrida nunca pasa de ese número, así que un contador sin techo medía contra nada                                                                                              |
| **`MISION n/m`**        | y=12                                                                      | **se fue.** Era lo único del HUD que hablaba del _menú_ y no del vuelo: en qué número de la campaña estás no cambia nada de lo que hacés en los próximos diez segundos, y lo dice el briefing antes de despegar. Ocupaba el renglón más visible de la pantalla |
| **La placa de la ruta** | flotando a media banda                                                    | apoya en `MARGEN`, como todo el resto. Estaba más abajo para dejarle sitio al contador — una posición heredada, no una decisión                                                                                                                                |

Para distinguir nombre de distancia, `game.js` publica ahora `objectiveKind` junto al rótulo — el
render no adivina leyendo el string.

## 1c. Fase B — el tablero de las dos esquinas _(aplicada)_

De las cuatro propuestas del artifact **"Cuatro tableros y una voz"** (6/9/2026), se ejecutó la
**B**, con la **D** como perilla encima. El diagnóstico que las ordenaba: el HUD se lee de reojo, y
la periferia recibe movimiento y contraste, no texto ni números.

| Qué                      | Antes                                         | Ahora                                                                                                                                                                                                                                                                                                                                                                     |
| ------------------------ | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **RASANTE · MOMENTUM**   | dos barras con rótulo arriba a la derecha     | **dos rieles en los bordes laterales**, izquierda rasante y derecha momentum. Sin rótulo, sin placa y sin número: un riel no se lee, se vigila. A cambio el recorrido pasa de 44 px a **180** — la altura entera— en la única franja donde no compite con nada (el margen del HUD es 4, así que de `x 0` a `3` y de `316` a `319` no se dibuja nada más en todo el juego) |
| **El reloj del rasante** | siempre, al lado de su barra                  | **sólo mientras el poder está encendido**, en la esquina que las barras dejaron libre. Es el único dato que un riel no puede dar —cuántos segundos, no qué fracción— y es el único momento en que hace falta                                                                                                                                                              |
| **El gas**               | arrancaba en `y=64`, debajo de las dos barras | sube a `GAS_TOP = 42`: la corredera pasa de **54 px de recorrido a 76**. Es el único instrumento que se _opera_ en vez de leerse, y una palanca más larga se apunta mejor                                                                                                                                                                                                 |
| **La banda de la voz**   | el toast cerraba en `y=118`                   | cierra en **127**. El número ya no se copia: sale de `HUD_TECHO`, que `render/hud.js` calcula con las mismas constantes con que apila las filas                                                                                                                                                                                                                           |

### El fantasma de los diecinueve píxeles

`HUD_TINTA` valía 110 y estaba **copiado a mano** en `render/screens.js`. Ese número lo escribió la
época en que RASANTE y MOMENTUM eran la cuarta y la quinta barra de la pila de la izquierda y
subían hasta ~112. Desde entonces se mudaron dos veces —arriba a la derecha en U1, a los rieles
ahora— y el toast siguió esquivando un instrumento que ya no estaba ahí: diecinueve píxeles de
banda libre que la voz no usaba por miedo a un fantasma.

Ahora `hud.js` **exporta** `HUD_TECHO = R3 - 9` (el canto de las placas de la fila más alta) y
`screens.js` lo importa. El día que las filas se muevan otra vez, la banda se mueve con ellas.

## 1d. Fase D — el tablero por demanda _(aplicada, apagada por default)_

`cfg.hudAuto`, fila **TABLERO** en OPCIONES, al lado de **RADIO EN VUELO** porque las dos contestan
la misma pregunta —cuánta pantalla ocupa la UI mientras volás— y ninguna cambia un número del
juego. Con `auto`, un instrumento **sano** no se dibuja:

| Instrumento | Aparece cuando                                        |
| ----------- | ----------------------------------------------------- |
| COMB        | la nafta baja de 60 %                                 |
| CHANCHA     | el medidor se llenó, ya se gastó, o hay cita en curso |
| SALUD       | la total no está entera, o la temporal baja de 97 %   |
| CAÑÓN       | `heat > 0.05` o está recalentado                      |
| MISIL       | falta al menos uno                                    |

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

## 1e. La duración del cartel _(aplicada)_

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

## 1f. La ruta, en una fila _(aplicada)_

Eran **tres renglones apilados y 27 px de alto**: el nombre del buque arriba en cuerpo 6 y color de
aviso, la ruta en el medio, la cuenta regresiva abajo. El bloque más grande y más ruidoso del HUD,
arriba al centro, para decir tres cosas que no cambian de un cuadro al otro — y el nombre del
buque, que no cambia **nunca** en toda la misión, estaba escrito más grande que la velocidad.

Puestos **en fila**, los tres entran en 11 px y se leen en el orden en que se preguntan:

> `HMS SHEFFIELD` · ▸ ——————— ⊥ · `2447 m`
> quién es el blanco · dónde estoy · cuánto falta

|                    | Antes                               | Ahora                                                                                                                                                           |
| ------------------ | ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| alto               | 27                                  | **11**                                                                                                                                                          |
| nombre             | cuerpo 6, `P.warn`, centrado arriba | cuerpo 5, `P.dim`, en la fila. Es contexto, no un valor que se vigile                                                                                           |
| la línea           | 96 px de recorrido                  | 52                                                                                                                                                              |
| íconos             | 9 px                                | 7 · y el marcador del avión ahora también sale de `hpx` (estaba clavado en 6 y se comía el renglón)                                                             |
| ancho              | fijo, 30 % de la pantalla           | **sale del contenido**, y la placa se centra como un bloque — con nombre a la izquierda y número a la derecha, centrar la _línea_ dejaba el instrumento corrido |
| el aviso de viento | `topBase = 38`                      | 24: la ruta cierra en 15, así que sube con ella en vez de dejar hueco                                                                                           |

Área: **134 × 11 contra 114 × 27** — un tercio de la tinta.

## 1g. MEJOR es de POR LA PATRIA _(aplicada)_

Estaba en todos los modos menos campaña, y ahí mentía dos veces.

`rasante_frontal_best` es **un número global**: una corrida de CICLO DE MUERTE, del ARENA o de las
PASADAS lo empujaba igual, así que el máximo que veías en un modo podía haberse hecho en otro. Y en
los modos con objetivo la corrida ni siquiera es comparable — termina cuando llegás al buque, no
cuando te matan, o sea que el puntaje lo decide la distancia y no cómo volaste.

**POR LA PATRIA es el único modo donde una corrida es una corrida**: infinita, sin objetivo, y se
acaba cuando te caés. Ahí un máximo histórico dice algo.

Tres lugares, una decisión:

| Dónde                                | Antes                                                                                        | Ahora                                                                                                                     |
| ------------------------------------ | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| HUD (`render/hud.js`)                | en todo modo salvo campaña                                                                   | `gameMode === 'survival'`                                                                                                 |
| El récord se **escribe** (`game.js`) | en toda corrida que no sea de herramienta                                                    | además, sólo en `survival`. Un récord que se hace en un modo y se luce en otro no es un récord                            |
| Pantalla de derribo (`drawDead`)     | siempre; decía «MEJOR 0» en partida nueva y «NUEVO RECORD» en modos que no lo iban a guardar | `best` llega en **cero** fuera de POR LA PATRIA —el mismo criterio que ya usaba `stars`— y la línea no se dibuja con cero |

El HUD **sí** muestra `MEJOR 0` en POR LA PATRIA sin récord todavía: ahí el cero es honesto —es el
instrumento de ese modo diciendo que no marcaste nada— mientras que en la pantalla de derribo se
leía como un veredicto.

## 1h. El puntaje se va, el kilometraje entra al objetivo _(aplicada)_

Dos decisiones del playtest del 8/9 que dejan la esquina superior izquierda con una sola cosa.

**El PUNTAJE salió de todos los modos.** Ya estaba oculto en campaña; ahora tampoco está en JUEGO
RÁPIDO. Un contador de arcade corriendo arriba a la izquierda no cambia nada de lo que hacés en los
próximos diez segundos: los puntos se cobran cuando la corrida termina, y ahí tienen una pantalla
entera para decirse. Estaba ocupando la esquina donde uno mira primero para dar un número que sólo
importa después.

**El KILOMETRAJE se mudó adentro de la ruta**, cuando hay ruta. `0.1 / 2.6` es cuánto llevás **de
esta ruta**: es parte del objetivo, no un instrumento aparte cuatro filas más abajo que lo repite.

|                               | Antes                                      | Ahora                                                                                                                                          |
| ----------------------------- | ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| con objetivo                  | odómetro en su placa arriba a la izquierda | dentro de la fila de la ruta, pegado al buque                                                                                                  |
| sin objetivo (POR LA PATRIA)  | igual                                      | **se queda arriba a la izquierda**, en forma de contador abierto: no hay ruta donde meterlo, y sin nada contra qué medir la fracción no existe |
| la cuenta regresiva en metros | `2447 m` al final de la fila               | **reemplazada por la fracción**                                                                                                                |

Las dos decían el mismo hecho —`2.6 − 0.1` es lo que falta— y ponerlas juntas habría sido decirlo
dos veces en dos unidades. Se eligió la fracción porque además dice **contra qué**, que la cuenta
sola no dice. Dentro de la fila: lo hecho en acento, el total en el color del blanco (que es lo que
lo ata al ícono del buque que tiene al lado) y `KM` en cuerpo 5.

El bloque superior izquierdo queda con **escuadrón** y nada más — salvo en POR LA PATRIA, donde
lleva escuadrón, odómetro y MEJOR.

## 1i. Una sola cinta para todos los modos _(aplicada)_

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
puntaje vuelve al HUD, pero sólo acá** — en POR LA PATRIA el puntaje _es_ el juego; en los modos
con objetivo lo decide la distancia y no cómo volaste.

| Caso                   | Qué se ve                                                                                                                                                                          |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| récord > 0             | la cinta completa, con línea y bandera                                                                                                                                             |
| **sin récord todavía** | sin línea: una barra que avanza hacia cero no avanza hacia nada. Quedan kilometraje y puntaje                                                                                      |
| **pasaste tu marca**   | bandera y récord en **acento**. La línea ya está llena y el marcador clavado en la punta: no hace falta un cartel, que en POR LA PATRIA taparía mundo justo cuando más se arriesga |

### Detalles que salieron de probarlo

- **La marca a batir es una bandera, no una estrella.** El primer intento fue un asterisco: a
  cuerpo 5 un asterisco es una cruz roja y no se lee como "hasta acá". Una bandera —mástil y paño—
  es la misma silueta mínima que el muelle y el buque del otro lado, así que además habla el mismo
  idioma.
- **`drawOdo` quedó sólo para PERSECUCIÓN**, el único modo sin objetivo _ni_ récord: ahí no hay
  cinta posible y el kilometraje vuelve a ser un contador abierto arriba a la izquierda. Se le cayó
  la rama de la fracción, que ya no la usa nadie.
- La esquina superior izquierda queda con **el escuadrón y nada más** en todos los modos salvo
  persecución.

## 1j. La radio cuelga del objetivo _(aplicada)_

El toast y el panel de radio **se mudaron de la banda de abajo a colgar de la cinta**, a un `AIRE`
debajo y **con su mismo ancho**. Lo que dice la radio es casi siempre sobre esa ruta —el buque, la
costa, el que viene—: leerlo pegado al instrumento que lo explica es leerlo una vez sola.

|         | Antes                             | Ahora                                                                               |
| ------- | --------------------------------- | ----------------------------------------------------------------------------------- |
| lugar   | banda de abajo, `y 97…127`        | debajo de la cinta, `y 18…41`                                                       |
| ancho   | 226 fijo                          | **el de la cinta** (sonda: 144 con HMS SHEFFIELD, 143 con un objetivo de distancia) |
| cuerpo  | 6, busto de 22, 30 de alto        | **5**, busto de 16, **23** de alto                                                  |
| entrada | sube desde abajo                  | baja desde la cinta                                                                 |
| panel   | crecía hacia arriba desde el piso | crece hacia abajo desde la cinta; la línea nueva siempre en el renglón de arriba    |

**"El mismo ancho" es verdad por construcción.** Un renglón de radio son `VOZ_COLS` = 38 caracteres,
y ese número vive ahora en `data/tuning.js`: lo leen el motor de radio (para partir el texto) y el
HUD (para darle a la cinta un **ancho mínimo** — lo que ocupan 38 caracteres en cuerpo 5 más el
marco del toast). Con un buque de nombre largo la cinta ya es más ancha; con un objetivo de
**distancia** (sin nombre, ~100 px) la cinta **estira la línea de la ruta** hasta el mínimo. Gana
resolución en vez de ganar alto.

La cinta publica su caja cada cuadro (`cintaCaja()` en `hud.js`) y el toast cuelga de ella; la
sonda `__toastbanda()` devuelve las dos para que una prueba pueda afirmarlo. `__decir(txt)` dispara
una línea al instante (QUITAR).

## 1k. El cuadro del piloto, y CHANCHA y AVIÓN en puntitos _(aplicada)_

**La cara del que vuela**, al lado del horizonte y del mismo alto que su placa (`x 35…61`,
`y 134…160`). Inmersión pura: cambia por lo mismo que el tablero, un instante antes de que se lea
en un número. Las caras ya existían — los cinco Fieles tienen neutro, ceño, preocupado, sonrisa y
roto (108×108).

| Gesto          | Cuándo (de más a menos urgente)                                                                                                                                                                                                                                          |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **roto**       | integridad ≤ 30 (sólo con averías que la usen)                                                                                                                                                                                                                           |
| **preocupado** | recién golpeado (la chapa acaba de bajar, 0,6 s), rozando, pintado por el radar, nafta < 25, **margen de roce < 50 %**. Es la panza y no ESTADO entero: ESTADO incluye la nafta, y con el tanque por debajo de la mitad la cara quedaba preocupada el resto de la misión |
| **sonrisa**    | un salto de ≥ 250 puntos en un cuadro — algo se fue al agua — durante 1,4 s                                                                                                                                                                                              |
| **ceño**       | turbo, cañón caliente o recalentado, racha rasante                                                                                                                                                                                                                       |
| **neutro**     | el resto                                                                                                                                                                                                                                                                 |

Subir de gesto es inmediato; **bajar espera 0,9 s** — sin eso un roce de un cuadro hace parpadear la
cara, y una cara que parpadea es un indicador roto. Además el piloto se sacude un píxel con el
sacudón de cámara y se tiñe de rojo con el fogonazo del impacto. Tabla y umbrales en
`data/gestos.js`.

**De ahí sale la voz de mi avión.** Si la línea de radio la dice el piloto que vuela, el toast no
baja de la cinta: **sube de la cara**, como un globo con colita, sin busto (la cara está justo
abajo), y el marco del cuadro se prende mientras habla. Arriba habla la radio de los otros; abajo,
pegado a mis instrumentos, hablo yo.

**CHANCHA y AVIÓN pasaron de barras a cinco puntos**, en una placa al lado de la cara. De las dos
importa la proporción y no la carga: de la chancha, cuánto falta para poder pedirla (el quinto punto
recién cuando se puede, y ahí parpadea); del avión, cuánto aguanta. Con una cita de chancha en curso,
su fila muestra la cuenta regresiva o el llenado en vez de los puntos. **ESTADO sigue siendo barra.**

Los retratos se cargan ahora desde `render/retratos.js`, un solo cache para el HUD y las cajas de
diálogo: `hud.js` no puede importar `screens.js` sin un ciclo que deja `HUD_TECHO` sin inicializar.

### Lo que salió de probarlo (10/9)

- **El globo quedaba debajo de la caja de charla.** Sube de la cara hasta `y 108…131` y la charla
  ocupa `89…127` y se dibuja después; la primera captura lo agarró con la charla de arranque de
  misión en pantalla. Con una charla abajo, mi línea va **arriba** como las demás.
- **…y arriba mostraba otra cara.** El toast usaba el retrato de radio (`tero_casco`, con casco y
  máscara) mientras el cuadro mostraba a TERO a cara descubierta. Ahora, si habla mi piloto, el
  toast usa **la cara del cuadro con su gesto de ese momento**.
- **La caja de charla barría 48 px al entrar** —`bh + 10`— y en su piso nuevo eso cruzaba la cara,
  los puntitos y el combustible. Ahora barre 6, como el toast.
- **La cara se trababa en preocupado.** La primera versión miraba ESTADO entero, que incluye la
  nafta: con el tanque por debajo de la mitad la cara quedaba preocupada el resto de la misión. Mira
  sólo la panza (`margenRoce()`, extraída de `estadoVal()`).
- **El gesto se verifica con un dato**: `__toastbanda()` devuelve `piloto.cara`, la que se está
  viendo. Secuencia medida en m4: `tero_neutro` → turbo → `tero_ceno` → al soltar, `tero_neutro` en
  1 s (lo que tarda en bajar de gesto).

## 1l. SALUD: una total y una temporal _(aplicada)_

ESTADO y AVIÓN **se unificaron en un solo instrumento, SALUD**, con dos barras (idea del playtest del
10/9). Hay dos relojes que te bajan del cielo, y **uno vuelve y el otro no**:

| Barra                      | Qué mide                                                    | Se recupera                                                                                                                      |
| -------------------------- | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **total** (3 px, con el %) | los golpes — la integridad del avión                        | **no**. Sus muescas en 25/50/75 son los escalones de avería: bajo la del medio te quedás sin turbo, bajo la primera sin piruetas |
| **temporal** (2 px)        | el roce — lo que queda del reloj de gracia al tocar el agua | **sí**, sola, al salir (a un tercio de la velocidad con que se gasta)                                                            |

Va en el lugar y del tamaño de ESTADO. La fila de AVIÓN salió de los puntitos (queda sólo CHANCHA)
y `estadoVal()` se borró: el cañón y la nafta ya tienen sus barras.

**Por qué no entran la nafta y el cañón:** ESTADO los mezclaba con el roce en un solo número y no se
sabía cuál de los tres lo bajaba. Además la nafta lo dejaba naranja el resto de la misión, y el
cañón recalentado no te baja: sólo te deja sin tirar.

**En ESCUADRÓN no hay total**: un golpe te baja y la vida es el escuadrón. Ahí SALUD lleva sólo la
temporal, en el renglón grueso. Un total siempre lleno sería una mentira.

### SALUD, probada (10/9)

Con la sonda nueva `__golpe(causa)` (un impacto por `damage.takeHit`, QUITAR): dos ráfagas de caza
dejaron la chapa en **78** y **56**, sin caer — la total cruzó la marca de 75 y quedó arriba de la
de 50, así que todavía hay turbo. Un roce corto vació la temporal a ~¾ en ámbar, y 1,5 s después
estaba entera otra vez. En ESCUADRÓN, SALUD es una sola barra gruesa, sin %.

**`run.hurtT` es un campo muerto.** `damage.js` lo pone en 0,6 en cada golpe y nada lo baja ni lo
lee. La cara se apoyó en él y quedaba roja y preocupada el resto de la misión después del primer
impacto; ahora detecta el golpe por su cuenta (la chapa que baja) con un reloj propio de 0,6 s.

## 1m. Relojes en vez de barras, e íconos en vez de palabras *(aplicada)*

El tablero de abajo pasa a ser **una fila de cuadrados iguales**, todos con la forma del horizonte
artificial y apoyados en el margen de abajo:

| Izquierda (de la esquina hacia adentro) | Derecha |
|---|---|
| horizonte · **piloto** · **nafta** · **chancha** | **cañón** en la esquina; VIDA y MISIL a su izquierda |

- **NAFTA**: reloj con aguja, zona roja en el primer cuarto y el % al pie. Reemplaza la barra COMB.
- **CHANCHA**: el mismo reloj, y **el final de la escala es el ícono de emergencia**: cuando la aguja
  llega, se la puede pedir. Con una cita en curso el número cuenta lo que importa (cuánto falta para
  que llegue, cuánto dura la ventana, cuánto tanque va entrando). Reemplaza los puntitos.
- **CAÑÓN**: no tiene munición que contar —dispara hasta recalentarse y se traba hasta enfriar—, así
  que el reloj marca **temperatura**, con la zona roja donde se traba.
- **VIDA**: pierde la palabra y gana **la cruz**.

**Los íconos son una tabla, no dibujos sueltos** (`data/iconos.js`). Cada uno tiene la LETRA que se
dibuja hoy y el archivo que la reemplaza cuando exista: se pone el PNG en `assets/hud/` y se escribe
su nombre en la tabla. Nada más.

**Por qué una tabla y no probar si el archivo está:** un `new Image()` a un archivo que no existe
ensucia la consola con un error de red por cada ícono, y `npm run smoke` falla justamente porque
vigila que la consola esté limpia.

**El build web ya sabe de la carpeta.** `tools/build_web.py` falla a propósito si queda una ruta
`../assets/` sin embeber; como el ícono se arma concatenando, se reemplaza la base por un `data:`
muerto, igual que retratos y placas. Cuando los PNG existan conviene embeberlos de verdad (son
cientos de bytes): está anotado en el mismo lugar del script.

**El tamaño**: 7 px de la grilla de diseño = **21 px reales**. Un PNG de 7×7 o de 21×21 entra sin
medio píxel; cualquier otro tamaño se escala y pierde el filo.

**Los rieles de los costados ahora llevan su letra** (`R` y `M`), a media altura. En el playtest hubo
que preguntar dos veces qué eran: un riel sin marca sólo funciona si ya sabés qué es.


## 1n. Las siluetas de la ruta *(aplicada)*

Puerto, buque y avión eran rectángulos sueltos (una raya con un palito, dos líneas, un triángulo),
con un sistema de PNG propio (`OBJ_ASSETS`) distinto del de los íconos del tablero. Ahora son
**dibujos en píxeles dentro de la misma tabla** (`data/iconos.js`, campo `pix`), y un PNG los
reemplaza igual que a cualquier otro ícono: "cómo cambio un ícono" tiene una sola respuesta.

| Ícono | Tamaño (diseño) | Qué es |
|---|---|---|
| `buque` | 11 × 5 | destructor Tipo 42 de costado: casco largo y bajo, superestructura con chimenea y mástil — el Sheffield, el Coventry, el Glasgow |
| `puerto` | 7 × 6 | muelle con pilotes y una grúa (dos colores: muelle y grúa) |
| `avion` | 7 × 5 | visto desde arriba, apuntando al buque, con alas y cola |
| `bandera` | 4 × 7 | la marca a batir de POR LA PATRIA |

En `pix`, `#` pinta el color principal que pasa quien dibuja y `+` el secundario. Un PNG que
reemplace una silueta va del mismo tamaño que el dibujo, o ×3 en píxeles reales.


## 1o. Siluetas para todo, y el nombre del blanco en su cuadro *(aplicada)*

**Ningún ícono es ya una letra.** Todos tienen una silueta provisoria en píxeles en
`data/iconos.js`, y el listado de lo que falta conseguir —nombre, tamaño, qué buscar y el dibujo
actual— está en **`assets/hud/LEEME.md`**, en la carpeta donde van los PNG.

**Un buque por clase**, y la clase sale de `SHIP_CLASS` (`data/ships.js`), la misma tabla que elige
el sprite del mundo: destructor (Sheffield, Coventry, Glamorgan), fragata (Ardent, Antelope,
Broadsword), desembarco (Sir Galahad, Sir Tristram) y **portacontenedores** para el Atlantic
Conveyor, que es la única excepción por nombre: el mundo lo dibuja con la hoja de desembarco porque
no hay otra, pero arriba se puede decir la verdad.

**Las misiones por distancia terminan en una bandera**, no en un destructor: no hay barco.

**El nombre del blanco sale de la ruta y va en su propio cuadro, rojo**, pegado a los kilómetros y
compartiendo el canto con la cinta: se lee como una pestaña del mismo instrumento. **`km` en
minúscula y roja**: más chica sin bajar de cuerpo, y es además el símbolo correcto. La radio cuelga
del instrumento entero (cinta + cuadro).

**La cruz de VIDA es blanca**: la cruz roja sobre fondo claro es un emblema protegido por los
Convenios de Ginebra, y a más de un juego le pidieron sacarla. De paso la placa de VIDA volvió a
alinear con la de MISIL (estaba 9 px corrida desde que la cruz reemplazó a la palabra).

## 1p. SALUD pasa a reloj de dos agujas _(aplicada)_

Pedido del 11/9: SALUD como un cuadrado hermano del cañón, pero **compuesto, como un reloj de horas
y minutos**: una aguja arriba para la chapa y otra abajo para el agua. Va en el cuadrado de al lado
del cañón, así la fila de abajo queda en espejo: cuatro cuadrados a la izquierda, dos a la derecha.

| Escala | Aguja | Qué mide | Vuelve |
| --- | --- | --- | --- |
| **arriba**, con la cruz | **blanca**, corta y gruesa (las horas) | la chapa: los golpes que te dan | **no**. Marcas largas en 25/50/75 = escalones de avería; lo rojo es "sin piruetas" |
| **abajo**, con las olas | **amarilla**, larga y fina (el minutero) | el agua: cuánto más podés rozar antes de estrellarte | **sí**, sola, al salir |

Las dos escalas van vacías a la izquierda y llenas a la derecha, como los otros relojes. Con el avión
sano **las dos agujas se juntan en las tres**, y lo que se abre es la tijera: la blanca sube cuando
te pegan, la amarilla baja cuando rozás. Cada escala tiene su ícono en su esquina (cruz arriba, olas
abajo, del color de su aguja); `ola` es un ícono nuevo y ya está en `assets/hud/LEEME.md`.

**MISIL se corrió a la izquierda de SALUD** y quedó apoyado en el mismo piso que los cuadrados
(antes vivía debajo de la placa de SALUD, que ya no existe). Con eso no queda ninguna placa arriba de
la fila: `R1`/`R2` se fueron y `HUD_TECHO` pasó de 146 al canto de los cuadrados, 150. La banda de la
charla baja 4 px.

## 1q. La amarilla pasa a ser un escudo _(aplicada)_

Pedido del 11/9, en varios mensajes seguidos: que la amarilla sea **un escudo recuperable antes del
daño permanente**, que el daño permanente sea **la blanca**, que funcione **para todo** el daño y que
**el agua pegue más rápido que una bala**.

- **Todo lo que te tiran pasa primero por el escudo**: trazadora, antiaéreo, misil, bomba. El escudo
  para 30 puntos (una trazadora entera y un poco más) y lo que sobra va a la chapa.
- **Rozar el agua o el suelo también**, y agotar el margen ya no mata: el escudo se vacía en el mismo
  tiempo que antes separaba el roce de la muerte (0,85 s lento, 0,18 s a fondo) y después sigue la
  chapa **al mismo ritmo**. Son 35 puntos por segundo lento y ~170 a fondo: un segundo de panza cuesta
  más que una trazadora a cualquier velocidad, y lo custodia un test.
- **El escudo vuelve solo**: a los 1,2 s sin daño empieza a llenarse, y de vacío a lleno tarda 3 s.
  La chapa no vuelve.
- **Chocar sigue matando**: un mástil, una barranca, la cara de una ola, el mar de frente en el arena.
- **Sólo con chapa** (INTEGRIDAD y VISUAL). En ESCUADRÓN una bala te baja, el mar mata como siempre y
  la amarilla sigue siendo el margen de roce. Por eso el ícono de abajo cambia: **escudo** con chapa,
  **ola** sin ella.
- El arena y la pasada, que dibujan la chapa como barra, llevan el escudo debajo, en amarillo.
- La cara del piloto se sobresalta también con una bala que el escudo para entera.

**La chapa en horas, el escudo en segundos** (mismo día). Las marcas de arriba eran puntos iguales a
los de abajo y había que buscar la aguja para saber cuánta chapa quedaba. Ahora la escala de arriba
son **cuatro bloques gruesos**, uno por escalón de avería, prendidos hasta donde llega la chapa (el
primero en rojo), y la de abajo es una escala **fina y apretada**, de 25 marcas. Se las distingue por
el trazo antes que por el color. Se descartó partirlo en dos relojes: no hay lugar para un cuadrado
más en la fila sin achicar MISIL, y juntar las dos cosas en un solo instrumento fue el pedido del 10/9.

Vive en `core/damage.js` (`ESCUDO`, `absorber`, `dmgRoce`, `recargar`: puros y con tests) y en
`systems/damage.js` (`roce`, `tickEscudo`). El vuelo y las crestas llaman a `roce` sólo con chapa; en
ESCUADRÓN corre la cuenta de siempre, así que `npm run feel` no se mueve.

## 1r. El escuadrón en un renglón _(aplicada)_

Pedido del 11/9: la formación con el dibujo del avión de la cinta, tantos como aviones haya, en un
renglón y sin el rótulo ESCUADRÓN. Los aviones van en fila, con la nariz hacia el blanco, como el
que avanza por la ruta: el que vuela en acento, los que esperan claros y los caídos oscuros y
**tachados en rojo** (siguen ahí: una vida menos es un compañero menos). El nombre del que vuela
queda al final, en acento, separado por el doble de aire que hay entre aviones.

La placa baja de 17 a 11 de alto, la misma que la cinta, y el nivel de alerta sube 6 px con ella.
Se descartó la formación en V: con cinco o seis aviones pide tres filas —el mismo alto que se quería
ahorrar— y en una V los caídos cuestan contarlos. El mismo tablero se ve en el relevo.

`hud_squad` (el rótulo) quedó sin uso en `data/strings.js`, por la misma razón que la divergencia 19b.

## 1s. El tablero del A-4: velocidad, Mach, altitud y gas en relojes _(aplicada)_

Pedido del 11/9, con fotos de la cabina del A-4 Skyhawk: todo analógico, y la idea de que el jugador
sienta lo mismo que nuestros pilotos al mirar abajo — un tablero lleno de agujas. Los cuatro son
relojes como los demás, con el número al pie:

| Reloj | Escala | Marcas |
| --- | --- | --- |
| **velocidad** | 0–1400 km/h | la larga es Mach 1; la aguja toma el color de lo que la empuja (turbo o racha en acento, postcombustión en rojo, viento en contra en cresta) |
| **Mach** | 0,2–1,4 | en acento, el régimen del cono (desde 0,95); la larga, Mach 1 |
| **altitud** | 0–68 m, **estirada abajo** (raíz cuadrada) | rojo el agua, acento la franja del rasante (x10) y la larga roja es el techo del radar de la fase |
| **gas** | 0–100 % | la palanca leída como las RPM de un tablero de verdad; parpadea sin nafta |

Van en un grupo propio en el centro de la fila, con más aire a los costados que entre ellos. Para que
entren, **MISIL pasó a un estante angosto** (12 px, los tres misiles uno arriba del otro, sin rótulo)
y **la corredera de gas del borde derecho se fue**. Los avisos de altura (¡SUBÍ!, el radar, la niebla)
suben arriba de los relojes, o arriba de la caja de charla si hay una: un aviso tapado no existe.

De paso, el cuadro del piloto y el reloj de nafta se pisaban un píxel. La fila sale ahora de una sola
cuenta (`COL(i)` en `render/hud.js`).

## 1t. El radar deja el centro y entra desde la izquierda _(aplicada)_

Pedido del 11/9: sacar el "! RADAR !" del medio y llevar su barra cerca de los datos del radar, con
una letra más linda, que aparezca desde la izquierda y se vuelva a ocultar.

La barra es la **carga del radar** (`run.detection`): se llena en 1,4 s volando arriba del techo de
radar y se vacía en 0,9 s abajo. Llena, sale una tanda de misiles —y con fases, una baliza— y
rearranca desde la **marca de acento**, que se corre con cada tanda: por eso las tandas se acercan.

Ahora es una **placa que entra desde la izquierda** (0,22 s, frenando al llegar) cuando la barra
empieza a cargar y **se va cuando se vacía**, en la columna de arriba a la izquierda, debajo del
panel de alerta (o del escuadrón, en las misiones sin fases). Dice RADAR en la letra de cartel del
juego (`Gomarice`, rol `aviso` en `render/ctx.js`): roja y titilando mientras te ven, gris mientras
baja. En el centro, arriba de los relojes, queda sólo el "¡SUBÍ!" del roce. `radar` quedó sin uso en
`data/strings.js` (divergencia 19b).

## 1u. Las alarmas entran y salen como el radar _(aplicada)_

Pedido del 11/9 a la noche: que las balizas del nivel de alerta aparezcan de la misma manera que la
placa del RADAR y que, apagadas, se escondan y dejen sólo el radar gris.

El panel se partió en dos placas: **el radar solo** (15 × 15, quieto) y **la sección de las
balizas**, que **sale de atrás del radar** hacia la derecha con la primera alarma —misma entrada de
0,22 s, frenando al llegar— y **vuelve a esconderse detrás de él** cuando se apagan todas. El reloj
del escondite viaja con las balizas, que es de quien es. A nivel cero queda el radar gris girando:
sigue enseñando que el sistema existe (el motivo del pedido anterior), sin cuatro balizas apagadas
ocupando la columna.

## 1v. La fila como la cabina del A-4, y mi voz sale de mi cara _(aplicada)_

Pedido del 11/9: ordenar los cuadrados como en la cabina, y separar el cuadro del piloto para que lo
que dice salga de ahí — "diferenciar emisor de receptor".

**La fila en tres grupos**, con más aire entre grupos que adentro de cada uno:

| Grupo | Instrumentos | Por qué |
| --- | --- | --- |
| izquierda | SALUD, CAÑÓN, estante de MISILES | el combate: con qué peleo y cuánto aguanto |
| centro | MACH, VELOCIDAD, **horizonte**, ALTITUD | la "T" de toda cabina: el horizonte adelante, la velocidad a su izquierda (el Mach al lado, como el KNOTS/MACH del A-4) y la altitud a su derecha |
| derecha | GAS (RPM), NAFTA, CHANCHA | el motor |

El horizonte dejó la esquina izquierda después de estar ahí desde que existe: con el tablero ocupando
la fila entera, el centro es el lugar del instrumento principal. Queda a 7 px del centro exacto de la
pantalla, porque el grupo se centra en el hueco entre los otros dos (aire igual a los dos lados).

**La cara del piloto salió de la fila**: va arriba de la esquina izquierda, sobre SALUD. **Mi voz**
—una línea mía de radio o de una charla— sale en una caja con borde en acento que **entra de atrás de
la cara** hacia la derecha, como las balizas de atrás del radar. Los que me hablan siguen llegando por
sus canales: la radio cuelga de la cinta y la charla va en su caja, que ahora arranca después de mi
cara y **sube arriba de mi caja** si hablamos a la vez. Los avisos de altura se apoyan arriba de lo
más alto que ocupe la voz en la banda (`techoBanda` en `render/screens.js`, que mira el cuadro
anterior porque el HUD se dibuja antes que la voz).

## 1w. El borde titila en valor crítico _(aplicada)_

Pedido del 11/9: cuando una aguja está en un valor crítico, que se marque el borde de su cuadro y
titile, para llamar la atención. La aguja ya se ponía roja, pero una aguja de ocho píxeles se ve si la
estás mirando; un borde entero que parpadea se ve **de reojo**. Todos titilan **en fase** (3 Hz, el
mismo reloj): dos alarmas a la vez se leen como una sola alarma.

| Reloj | Crítico cuando… |
| --- | --- |
| NAFTA | queda menos del 25 % |
| CAÑÓN | pasa el 75 % o se trabó |
| ALTITUD | te ve el radar (arriba del techo de la fase) o estás rozando |
| SALUD | la chapa está en el último escalón, el escudo en su rojo (bajo 35 %) o estás rozando |
| CHANCHA | la ventana de la cita se está cerrando (menos de 8 s) |

Son los mismos umbrales que ya pintaban las zonas rojas de cada reloj. **GAS no tiene borde**, por
pedido del autor: se opera, no avisa (sin nafta avisa la nafta). VELOCIDAD y MACH tampoco: no tienen
un valor que sea peligro por sí solo.

## 1x. Los tres grupos, por cuánto se mueve cada aguja _(aplicada)_

Pedido del 11/9, y **reemplaza el reparto de §1v**: el criterio deja de ser el tema (combate / vuelo
/ motor) y pasa a ser **cada cuánto hay que mirar el instrumento**.

| Grupo | Relojes | Criterio |
| --- | --- | --- |
| izquierda | SALUD, NAFTA, MACH | **lo que casi no se mueve**, debajo de la cara del piloto; SALUD en la esquina, pegada a la cara: ese rincón dice "yo y mi avión" |
| centro | VELOCIDAD, **horizonte**, ALTITUD, GAS | **lo que varía rápido**: se vigila todo el tiempo, y por eso va adelante |
| derecha | CHANCHA, CAÑÓN, MISILES | **lo que se carga**: se gasta y se recupera solo; se mira cuando lo vas a usar |

El Mach salió del centro porque sale de la misma velocidad y cambia despacio, y en su lugar entró el
gas, que se mueve con cada toque de la W. Los dos grupos de los costados se dieron vuelta enteros
(pedido del autor): el que se carga pasó a la derecha y el lento a la izquierda, que es donde está la
cara del piloto — con SALUD pegada a ella. El horizonte sigue en el centro, segundo de cuatro.

## 1y. La velocidad dice cuándo hay turbo, y cuándo ya no lo vas a tener _(aplicada)_

Pedido del 11/9: que con turbo el ícono de la velocidad cambie —naranja como la aguja, y con más
peso—, que la escala tenga **dos topes** (uno blanco sin turbo y uno naranja con turbo), y que cuando
el avión se rompe lo suficiente para no volver a encenderlo, el reloj **se vea roto**.

- **Con turbo cambian tres cosas a la vez**: la aguja, el ícono y el borde. La **aguja es blanca** y
  se pone naranja **sólo con turbo** (antes también se teñía con la racha y con el viento, y entonces
  el naranja no quería decir nada). El **ícono** pasa de dos flechas finas en gris a las mismas **dos
  gruesas en acento** (tres flechas de un píxel se leían como un damero a 7 × 5). Y el **borde de la
  placa** se prende en acento, **fijo, sin titilar**: el titileo es el idioma del peligro (§1w) y
  prestárselo al turbo lo gastaría.
- **Los dos topes son los MÁXIMOS del avión**, no el de este instante: 995 km/h sin turbo y 1176 con
  turbo —bastante más a la derecha—, sacados de `speedTarget` llevado al límite (racha y tiempo de
  vuelo al tope, sin viento). Lo único que los mueve es la avería, que baja los dos a la vez. Entre
  los dos, **la franja va en acento**, como la del cono en el Machmetro: ese tramo de la escala es el
  que sólo se alcanza con turbo. La postcombustión pasa el segundo tope, y por eso la escala llega
  más lejos que él.
- **Roto**: cuando la avería pasa el escalón del medio y el turbo se pierde para siempre, la marca
  naranja y su franja desaparecen y **el vidrio del reloj se dibuja rajado** (`vidrioRoto`). Es un
  **impacto con astillas** arriba a la izquierda —lejos del eje y del número, y sin llegar al recorrido
  de la aguja—, en gris apagado: la primera versión eran rayas largas y derechas por el centro y se
  leían como una segunda aguja. **La placa se rompe con él, en la forma**: el reloj roto se dibuja con
  otra placa (`plateRota`) a la que le faltan **las dos puntas** —arriba a la izquierda, la del
  impacto, y abajo a la derecha—, con los escalones desparejos, porque en diagonal perfecta se lee
  como un bisel de fábrica; y al borde le faltan pedazos del lado del impacto. Un vidrio partido
  dentro de un marco intacto se lee como una calcomanía. Todo es fijo: un vidrio roto no titila.
- **La unidad va impresa en la cara**: `km/h` en cuerpo 4 —la mitad del número—, apagado, arriba del
  número y **dibujado antes que la aguja**, así la aguja le pasa por encima, como en un reloj de
  verdad. Al lado del número no entra: a cuatro dígitos el número se come el ancho útil del cuadrado.

## 1z. La voz del otro entra por la derecha, y mi cara se prende también en charla _(aplicada)_

Pedido del 12/9. Dos cosas:

- **El marco de mi cara se prende con las dos voces**, no sólo con la radio. Miraba únicamente
  `radio.personaje`, así que en mis líneas de charla la cara quedaba apagada mientras mi propia caja
  hablaba al lado. Ahora `game.js` pasa **quién habla en la charla** (`charlaVoz`) y el tablero
  compara con el nombre del que vuela. Verificado forzando un relevo (vuela PUMA, que sí tiene línea
  en `M04_NARWAL_A`): la línea sale en mi caja y la cara se enciende.
- **La caja del otro es el espejo de la mía**: estaba centrada en la banda de abajo (262 × 38) y pasa
  a la **derecha, a la misma altura que mi cara**, con su retrato contra el borde y el texto a su
  izquierda. **Entra desde la derecha** (0,22 s, frenando al llegar) y **se vuelve a ir por donde
  vino** al terminar la línea; para eso `drawCharla` se llama SIEMPRE, con `dlg` en null cuando no hay
  charla, y guarda la última línea para poder dibujar la salida. Si mi voz de radio está en esa
  banda, la del otro sube arriba de la mía.

Con esto, el eje izquierda/derecha dice **quién habla**: yo a la izquierda, saliendo de mi cara; el
otro a la derecha, entrando de afuera. Y la mitad de abajo del centro de la pantalla, que era de la
caja de charla, queda limpia.
- **La marca de Mach 1 se fue de la velocidad**: el Mach tiene su propio reloj, con la suya.


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
   esta fase. Se aceptó porque el gas no se _lee_ —se opera, y se opera con una tecla— y porque 22
   px más de corredera son 22 px más de resolución en el único control analógico del juego.
9. **El reloj del rasante quedó bajo el reproductor de música**, que es HTML y vive en los primeros
   ~15 px de esa esquina. No se pisan (la placa arranca en 15), pero están pegados. En campaña el
   reproductor está oculto, así que el caso apretado es sólo JUEGO RÁPIDO.

10. **El nombre del buque se quedó, achicado.** La alternativa era sacarlo: no cambia nunca, lo dice
    el briefing, y el total del odómetro ya está pintado en el color del blanco. Sacarlo dejaría la
    ruta en ~90 px de ancho en vez de 134. Se mantuvo porque es lo único de la pantalla que dice
    _contra qué_ estás volando, y porque el pedido fue achicar, no sacar.

11. **El récord dejó de escribirse fuera de POR LA PATRIA, y eso no se pidió explícitamente.** El
    pedido fue sacarlo de la vista; restringir también la _escritura_ es la consecuencia — si sólo
    se ocultara, una corrida de CICLO seguiría inflando en silencio el número que POR LA PATRIA
    muestra. Revertir es sacar una condición en `game.js`.

12. **La cuenta regresiva en metros desapareció**, y había sido un pedido explícito ("que vaya
    restando los metros"). No sobrevivió a meter el kilometraje en la misma fila: dos números para
    el mismo hecho, a tres píxeles uno del otro. Si se la extraña, el reemplazo natural es que la
    fracción cuente al revés (`2.5 / 2.6` bajando), no volver a tener las dos.

13. **La charla no subió con la radio.** Sus renglones son de `WRAP_BODY` = 68 caracteres; en el ancho
    de la cinta eso son seis renglones colgando sobre el horizonte. Se quedó abajo, sola, en el piso
    que era del toast. Si sube, sube re-partida, no achicada.
14. **Los popups de aviso ahora cruzan la banda de la radio.** Nacen en `y 38…56` y suben 15 px: pasan
    por `y 18…41`, donde cuelga el toast, y quedan tapados si coinciden. Es la misma colisión que
    tenían con la placa de la ruta (divergencia 7), más grande. El arreglo natural es el canje: los
    avisos bajan a la banda que la radio acaba de dejar libre — pero cada `y` tiene su razón de
    escena, así que es decisión de guion.
15. **TERO vuela a cara descubierta.** `tero_casco` es el único retrato con casco y no tiene gestos;
    alternarlo haría aparecer y desaparecer el casco con cada cambio de cara. Si se lo quiere con
    casco en vuelo, hacen falta ceño, preocupado, sonrisa y roto con casco (108×108).
16. **El globo de mi piloto se cruzaba con la caja de charla** (`y 108…131` contra `89…127`). No era
    raro: la primera captura lo agarró con la charla de arranque de misión en pantalla, y la caja de
    charla se dibuja después, así que el globo quedaba tapado. **Resuelto**: con una charla en la
    banda de abajo, mi línea va arriba como las demás, y el marco de mi cara igual se prende.
17. **Los rieles laterales no se reconocen solos.** En el playtest del 10/9 hubo que preguntar qué
    eran. Es el costo anotado en §1c: un riel sin rótulo sólo funciona si ya sabés qué es.

18. **SALUD en el modo por defecto muestra sólo la mitad.** Con averías en ESCUADRÓN —el default— no
    hay golpes que contar, así que la barra total no aparece y SALUD es sólo el roce. La idea de "saber
    la vida de mi avión" se cumple entera recién con averías en INTEGRIDAD o VISUAL. Cambiar el
    default es una decisión de dificultad, no de UI.

19b. **Quedaron cinco textos sin uso** (`bar_fuel`, `bar_cannon`, `bar_chancha`, `bar_tempo`,
    `hud_vida`): los rótulos que reemplazaron los íconos. NO se borraron. Otra sesión está editando
    `data/strings.js` en paralelo —se vio en vivo: `hud_vida` pasó de `VIDA` a `SALUD` mientras
    duraba este cambio— y borrar claves de un archivo que otro está tocando es pisarle el trabajo
    por una limpieza cosmética. Además, si algún rótulo vuelve a querer texto, la clave ya está.

19. **El cañón analógico marca temperatura, no cantidad.** El pedido decía "que muestren cantidades",
    pero el cañón del juego no tiene munición contable: sólo calor, con traba al llegar al tope. La
    aguja marca cuánto le queda antes de trabarse, y el número al pie lo dice exacto.
20. **La fila izquierda se apoya en el margen de abajo**, así que el horizonte bajó de `y 134` a
    `y 150` y su placa pasó de 28 a 26 de ancho, para que los cuatro cuadrados sean idénticos.
21. **El reloj de SALUD no tiene número**, a diferencia de nafta, chancha y cañón. Las dos escalas se
    comen el cuadrado y no queda esquina donde entre un `100%` sin pisar una marca. La chapa se lee
    por escalón (las marcas largas), que es lo que decide qué podés hacer; el porcentaje exacto no.
22. **El escudo cambia una regla, no sólo el tablero** (§1q). Hasta el 11/9 la amarilla vacía era
    estrellarte, en los tres modos ("el mar MATA"). Se lo planteó así al autor y lo decidió igual: con
    chapa, rozar gasta escudo y después chapa. En ESCUADRÓN el mar sigue matando.
23. **El escudo no pasó a ESCUADRÓN.** El pedido dice "que funcione para todo", y se leyó como todo
    el *daño* (balas y agua), no todos los *modos*: en ESCUADRÓN no hay chapa adonde pase el resto, y
    darle escudo ahí ablanda el modo por defecto — un avión dejaría de caer a la primera trazadora.
    Si se lo quiere, es una línea en `systems/damage.js` (`takeHit`) y en el vuelo.
24. **Se perdió el número de escalón de la postcombustión** (el `»n` que seguía a la velocidad). La
    aguja de velocidad se pone roja con postcombustión, pero ya no dice en qué escalón va. Quedaron
    sin uso `kmh`, `alt`, `turboTag`, `thr` y `thr_dead` en `data/strings.js` (misma razón que 19b).
25. **Mach va en su propio reloj**, aunque el A-4 real lo combina con la velocidad en uno solo. A 26 px,
    dos escalas en un mismo reloj no se leen; separado, además, suma perillas, que es la sensación que
    se buscaba (§1s).

## 3. Lo que sigue pendiente _(de la auditoría, sin decidir)_

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
