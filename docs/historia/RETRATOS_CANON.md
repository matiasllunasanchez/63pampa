# RASANTE — El canon de los personajes, medido

> **Qué es esto.** El respaldo de las decisiones que están horneadas en los prompts de
> [`PROMPTS_RETRATOS_LISTOS.md`](PROMPTS_RETRATOS_LISTOS.md): las alturas medidas sobre
> `characters_examples/final/team.png`, la cara de cada uno leída a resolución real, y la
> intención sacada de las poses de cada lámina. **No hace falta leerlo para generar retratos** —
> sirve cuando algo sale raro y hay que entender por qué, o cuando se va a dibujar algo nuevo.

> ⚠ Los prompts los genera [`tools/hacer_prompts_retratos.py`](../../tools/hacer_prompts_retratos.py).
> **Si acá se corrige un dato, hay que corregirlo también en el script**, o el prompt sigue
> diciendo lo viejo.

---

## La regla de la que sale todo

**El estilo del proyecto no es el que está escrito: es el que está dibujado.** Si un prompt y una
lámina de `final/` se contradicen, **gana la lámina**. Los documentos describen; las láminas
definen.

De ahí salieron las tres correcciones grandes de agosto de 2026: que el bloque de estilo bueno es
el de [`PROMPTS_HOJAS_PERSONAJE.md`](PROMPTS_HOJAS_PERSONAJE.md) y no el de
[`ESTILO_VISUAL.md`](ESTILO_VISUAL.md) §1, que Tero no es el más alto, y que la intención de cada
personaje ya estaba dibujada en sus poses.

---

## Las alturas, medidas

No estimadas. Los ocho apoyan en la misma línea de piso —los pies caen entre `y=587` y `y=594`—
así que la comparación es real. Relativo al más alto:

| | alto | hombros | esbeltez |
|---|---|---|---|
| **VASCO** | 1.00 | 160 | 3.46 |
| **PUMA** | 0.91 | 200 | 2.52 |
| **TERO** | 0.91 | 141 | 3.56 |
| **COLORADO** | 0.88 | 177 | 2.74 |
| **GITANO** | 0.88 | 153 | 3.17 |
| **TURCO** | 0.87 | 175 | 2.74 |
| **PICHON** | 0.78 | 134 | 3.22 |
| **MATEO** | 0.71 | 128 | 3.09 |

> ### 🔴 Tero no es el más alto
>
> La documentación venía diciendo *«el más flaco y más alto del escuadrón, el opuesto exacto de
> Puma»*. La medición dice otra cosa:
>
> - **El más alto es el Vasco**, y por lejos: 10 % sobre el siguiente.
> - **Tero y Puma miden lo mismo** — 0.91 los dos, cinco píxeles de diferencia sobre quinientos.
>   No son opuestos en altura: son opuestos en **ancho**, 141 contra 200 de hombros.
> - Lo de Tero es **la delgadez** (3.56, el más esbelto de los ocho), no la estatura.
>
> **Para un busto esto importa menos de lo que parece**: en un retrato la altura no existe. Lo que
> sí se transfiere es el **ancho de hombros** y la **forma de la cabeza** — y 141 contra 200 es
> exactamente el tipo de diferencia que sobrevive a 108 px.

---

## Las caras

Los ocho son **muy distintos entre sí** y cada uno tiene **un rasgo dominante** que lo identifica
solo. No hace falta repartir diferencias ni inventar discriminadores: hace falta describir con
precisión lo que ya está dibujado. **Si dos descripciones salen parecidas, el error está en la
descripción, no en los personajes.**

| | El rasgo que lo identifica solo | La cara | Ropa y objeto |
|---|---|---|---|
| **TERO** | **la cara triste** con el mechón de canas | La más larga y consumida: mejillas hundidas, pómulos salidos, surcos hondos junto a la boca, ojeras. Piel **morocha** criolla, más oscura que la del Vasco. Pelo oscuro peinado atrás **con canas en las sienes**. Nariz recta y fina, boca fina. Cuello largo y delgado | mono olivo con **arnés de pecho**, parche bandera argentina, botas negras · casco **blanco** con máscara **verde** |
| **PUMA** | **el pelo plateado y los ojos entrecerrados** | Cara **ancha y cuadrada**, mandíbula recta, piel clara curtida. **Pelo gris plateado espeso** peinado atrás — ni pelado ni al ras. **Ojos casi cerrados**, párpados pesados. **Bigote gris de morsa**. Nariz recta normal. Nada en la cabeza | **campera de cuero marrón** — el único sin mono —, pantalón olivo, botas marrones · casco blanco con franjas |
| **GITANO** | **los rulos y la sonrisa de dientes** | **Pelo negro muy rizado y voluminoso**, rulos altos. Piel oliva bronceada. **Sonrisa enorme con dientes**, pómulos altos, ojos oscuros grandes, nariz recta ancha | mono olivo **cerrado**, dos parches redondos, botas gris azuladas · **mate** |
| **VASCO** | **la pinta de ex mafioso o vampiro** | **La piel más pálida.** Cara larga y angulosa, **mandíbula cuadrada muy marcada**. **Pelo negro azabache peinado atrás**, sin una cana. **Nariz grande**, boca fina en línea recta, mirada fija. **El más alto** | mono olivo cerrado al mentón, botas negras altas · **crucifijo plateado grande** con cordón rojo |
| **PICHÓN** | **las pecas y las cejas caídas** | Cara **redonda de chico**, lampiña. **Pecas** en nariz y mejillas. Pelo negro corto con flequillo. **Cejas inclinadas hacia arriba en el centro** — cara de disculpa aunque sonría. Ojos grandes con mucho blanco. **El más bajo de los pilotos** | mono olivo con arnés, botas negras · casco blanco **en las manos** |
| **TURCO** | **la gorra con antiparras, la nariz grande, los ojos saltones** | Rasgos **de Medio Oriente**: **nariz grande, ancha y prominente**, domina la cara. Piel **la más oscura**, curtida. **Cejas negras muy pobladas y arqueadas.** **Ojos grandes y salientes.** **Bigote blanco ancho** + barba corta al mentón. Orejas grandes. **Calvo arriba con corona gris**. **Gorra caqui con antiparras**, siempre | **overol azul-gris manchado**, toalla al hombro · mate y termo · el pincel de la estrellita |
| **MATEO** | **la cabeza rapada** | **Rapado militar.** Piel bronceada dorada. Cara **triangular**, mandíbula estrecha, mentón en punta. **Cejas negras gruesas y rectas.** Ojos grandes castaño oscuro. **El más chico de los ocho** | camperón olivo con **capucha de piel clara**, correaje de cuero, birome azul en el bolsillo |
| **COLORADO** | **el rubor rojo con los ojos celestes** | Piel **muy blanca** con **rubor rojo intenso** en cachetes y nariz. **Pecas rojizas.** **Cejas rubias casi invisibles.** **Ojos celestes.** Sonrisa enorme con todos los dientes, hoyuelos. Cara redonda y ancha | campera de campaña olivo, correaje de cuero, pantalón gris azulado, **gorro de lana negro** · un frasco de comida |

### El único par que se parece: Vasco y Esteban

Los otros seis se identifican solos. Estos dos son los dos altos, flacos, de cara larga y pelo
oscuro peinado atrás. Y lo que los separa **no es anatomía, es intención** *(dicho por el autor)*:

| | **VASCO** | **ESTEBAN / TERO** |
|---|---|---|
| **la idea** | **un ex mafioso, o un vampiro.** Peligroso y quieto | **un buen hombre que está sufriendo.** Se le nota lo uno y lo otro |
| piel | **blanco**, pálido | **morocho**, criollo curtido |
| pelo | **negro azabache**, sin canas | oscuro **con canas en las sienes** |
| nariz | **más grande** | recta y fina |
| la cara | boca fina, mirada fija, mandíbula cuadrada. **Da un poco de miedo** | mejillas hundidas, ojeras. **Cara triste** |

**En el prompt la intención va primero y los rasgos después.** «Cara larga, pelo oscuro peinado
atrás, piel clara» describe a los dos; «un ex mafioso quieto» y «un buen hombre que sufre» no se
parecen en nada.

### Y Puma con Turco NO se confunden

Se llegó a anotar que sí, comparando sobre imágenes reducidas. A resolución real hay seis
diferencias, cada una suficiente sola: cara ancha y cuadrada contra alargada · nariz recta contra
**grande y prominente** · piel clara contra oscura · ojos **entrecerrados** contra **saltones** ·
pelo plateado espeso contra **calvo con gorra y antiparras** · bigote gris contra bigote blanco
ancho más barba.

**La lección es sobre el método:** reducir una imagen es exactamente lo que borra las diferencias
que uno está buscando. Para juzgar parecidos se mira **a resolución real**; para juzgar si algo se
lee en el juego, **a 108 px**. Son dos preguntas distintas y se miran distinto.

---

## La intención ya está dibujada, en las poses

Una lámina no es una ficha de rasgos: es una actuación — qué hace el personaje cuando nadie le
pidió nada. **No hay que preguntarla ni inventarla.** Y es lo que hay que llevar al retrato,
porque una cara sin intención sale genérica por mucho que la anatomía esté bien.

| | Qué hace en su lámina | Qué dice |
|---|---|---|
| **TERO** | de pie alerta · caminando · perfil · de espaldas · **una pose de urgencia, lanzado hacia adelante** | Contenido y despierto, pero **gastado**. La urgencia y el cansancio juntos: alguien que sigue respondiendo cuando ya no le queda |
| **PUMA** | plantado, **el peso repartido y quieto** en las cuatro vistas | No se mueve. **La autoridad que no necesita moverse** |
| **GITANO** | **la única lámina con poses abiertas**: carcajada con la cabeza atrás, brazos arriba festejando, ofreciendo el mate | Movimiento y ruido. **Su neutro es sonreír** — por eso verlo serio da miedo |
| **VASCO** | de pie **completamente inmóvil, brazos rectos al costado** · **persignándose** · perfil angosto | Cerrado y vertical. **La pose de persignarse ES el personaje** |
| **PICHÓN** | **sosteniendo el casco con las dos manos**, como un chico con algo prestado · brazos cruzados, defensivo | Un pibe **tratando de parecer que pertenece** |
| **TURCO** | manos en la cintura · con el mate y el termo · **y dos recuadros aparte: la mano pintando la estrellita y un estudio de la mano** | El oficio. **Sus manos importan tanto como su cara** — ninguna otra lámina les dedica recuadros |
| **MATEO** | arriba **rapado y limpio** · abajo **pelo crecido, embarrado, ojeroso** · **sentado en un cajón de munición escribiendo** | **La lámina cuenta el paso del tiempo, y el guion todavía no lo usa** |
| **COLORADO** | **en cuclillas, ofreciendo un frasco de comida** · el aliento visible del frío | **El que da.** La pose de ofrecer es lo único que hay que saber de él |

---

## Pendientes que salieron de esto

| | |
|---|---|
| **Los dos estados de Mateo** | el arte distingue al que llega del que lleva semanas en la isla; el guion no. Las cartas de M1 y las de M8 no las escribe el mismo chico |
| **Las placas históricas** | `M3_HIST`, `M4_HIST` y seis más no tienen tratamiento visual definido. Son cifras reales sobre muertos reales, y pixel art las estetiza. **Sin decidir esto no se generan** |
| **`p4_hoja`** | la hoja de cuaderno vacía y reutilizable sigue sin generarse; **las 11 cartas de Mateo la usan** |
