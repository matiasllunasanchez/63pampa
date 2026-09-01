# RESUELTOS — GUION_3 aplicado a `story.js`

Lo que ya está cerrado. Vive separado de [PENDIENTES_GUION.md](PENDIENTES_GUION.md) para que ese
archivo tenga sólo lo que falta decidir. Acá queda el registro de qué se decidió y por qué, que es
lo que hay que consultar cuando dentro de tres meses alguien pregunte «¿esto por qué quedó así?».

Los ítems marcados **✅ aplicado** están escritos en `story.js`. Los marcados **queda como está**
son los que se decidieron a favor del juego y contra el guion: GUION_3 quedó desactualizado ahí, y
las diferencias están listadas en la sección **TUS CAMBIOS vs GUION_3** de este mismo archivo.

Verificación al día: `npm run check` en verde — sintaxis, `lint:state`, `lint:layers`, 118 tests,
feel, smoke, fixture cine y fixture maniobras.

---

### P-02 · P.2 — el remate del sorteo
- Guion: «**Le erraste por poco**, entonces.» · Juego: «**Te salvaste por poco**, entonces.»
- No es lo mismo: «le erraste» es el padre lamentándolo (y por eso duele después); «te salvaste» es alivio y desactiva el chiste.
- [X] DEJAR COMO ESTÁ · [ ] REEMPLAZAR POR EL GUION · [ ] DEBATIR

### P-03 · P.2 — adónde lo mandaban
- Guion: «en vez de al Ejército me mandaban **a la Fuerza Aérea**» · Juego: «**me mandaban con vos**».
- [X] DEJAR COMO ESTÁ · [ ] REEMPLAZAR POR EL GUION · [ ] DEBATIR

### ✅ P-04 · «Se ríen los tres» — **aplicado**
`P2_3_052`, justo antes del teléfono.

### ✅ P-06 · Carta 1 — **aplicado**
`P4_1_020` termina ahora en «Mientras tanto te sigo contando, como si estuvieras acá.»

---

# 2. MISIÓN 1 — Sal en las alas

### ✅ M1-01 · **EL TERITO** — **aplicado**: escena nueva `M1_TERITO`
Seis líneas, entre `M1_5B` y el ritual. Entra el terito pintado, entra que el Turco bautiza los
aviones, entra la mecánica de las estrellitas, y cierra con «Traémela entera, Tero, eh. Y traete
vos adentro, **que la estrellita la pinto por vos, no por ella**».

Con esto quedan **plantados sus tres cobros**: el gesto de Tero (M4, M14-02), las estrellitas
(M1-07, M7-05, M14-03) y el asset del pájaro en el fuselaje (M8-03).
`placa: 'linea_amanecer'`, sin `img` propia — ver **A-01**.

### ✅ M1-02 · **EL RITUAL DE LOS CINCO** — **aplicado**: escena nueva `M1_CINCO`
Siete líneas, después del terito. Los cinco gestos en orden: Puma y sus tres cosas · el Vasco y la
cruz · **el Gitano bautizando el avión («a ésta hoy le decimos «el Colectivo». Anotá»)** · el
Pichón escuchando la chapa · Tero tocando el terito · el Turco mirándolos subir.

Se llama `M1_CINCO` y no `M1_RITUAL` a propósito: ya existe `M01_RITUAL`, que es el ritual de radio
de Cóndor, y dos ids a una letra de distancia era pedir un bug.

Es la única voz de una escena que empieza con «no habla nadie», y eso es el chiste. De paso planta
**G-03** (el Gitano le cambia el nombre al avión en cada misión), que sigue sin decidir.

### M1-04 · `M1_5B` — los chismes que el guion ya dio de baja
El guion dice explícitamente que **se cayeron**: el hermano preso, «a mí me dijeron que él
estuvo preso» (Pichón) y el remate de Puma «a mí me dijeron que ustedes dos hablan mucho».
Los tres siguen en `story.js`.
- [X] DEJAR COMO ESTÁ · [ ] REEMPLAZAR POR EL GUION · [ ] DEBATIR

### M1-05 · `M1_5B` — cómo se explica el apodo
- Guion: «Es "La Casada", le decimos así porque **no sabemos quién es**, pero esa mujer no es de nadie que esté solo…»
- Juego: «Le decimos "La Casada". No sabemos quién es, pero es seguro que ese minón tiene dueño.»
- [X] DEJAR COMO ESTÁ · [ ] REEMPLAZAR POR EL GUION · [ ] DEBATIR

### M1-06 · `M1_3` — la radio de Cóndor
- Guion (corta, de piloto): «…Mantenerse pegaditos al agua todo el trayecto que hay radar. Autorizados pista dos. Buen vuelo, muchachos.»
- Juego (larga, de manual): «…Recomendamos mantenerse rasantes al agua durante todo el trayecto y prestar especial atención al radar. Pista dos autorizada. Buen vuelo.»
- [X] DEJAR COMO ESTÁ · [ ] REEMPLAZAR POR EL GUION · [ ] DEBATIR

### ✅ M1-07 · Las cinco estrellitas — **aplicado**
`M1_7_010` ahora dice «Vuelven los cinco. El Turco va de avión en avión con un pincel finito y la
lengua afuera: **cinco estrellitas, una en cada uno**.» Se le sacó la explicación de qué son las
estrellitas, que ahora la da el Turco en `M1_TERITO` — antes se contaba dos veces.

⚠ La línea siguiente sigue usando `cara: 'turco_ternura'`, que **no existe** (ver T-06).

### ✅ M1-08 · Carta 2 — **aplicada completa**
Pasó de 3 líneas a 5. Entraron el **cuero de oveja con la lana para adentro** (era «un cacho de
lana»; es el objeto que vuelve en M12 tapando a Mateo hasta el final), el poncho y el gaucho, el
pozo y el viento, la hermana en Corrientes, el rótulo «el Colorado» debajo del dibujo, y el
párrafo del apodo — que cierra con `P2_3_080`, donde Norma se lo cuenta a Mateo en la cocina.

---

# 3. MISIÓN 2 — Bautismo de fuego

### 🔴 M2-01 · La reverencia del Gitano — dos gestos distintos
- Guion: levanta los dos brazos doblados a la altura de la cabeza, **tres pasitos en el lugar**, una reverencia ridícula entera, y dice «THANK YOU».
- Juego (`M2_MATE_020`): `accion: 'Toma el mate, lo deja y hace un saludo "como de soldado".'` — y el retrato derivado que generamos (`gitano_saludo`) es **saludo militar serio**.
- Son dos gestos incompatibles. Hay que elegir uno y alinear guion + acción + retrato.
- [X] DEJAR COMO ESTÁ *(saludo de soldado — actualizo el guion, queda el retrato nuevo)* · [ ] REEMPLAZAR POR EL GUION *(la reverencia entera — hay que regenerar el retrato)* · [ ] DEBATIR

### M2-02 · «me sacan de la ronda, culiau» / «pibe»
El guion se lo dice al Pichón («pibe»). El juego usa «culiau». Menor, pero el guion §9 pide
una marca cada tantas líneas, no en todas.
- [X] DEJAR COMO ESTÁ · [ ] REEMPLAZAR POR EL GUION · [ ] DEBATIR

### M2-03 · El Turco: «De la ronda no se va nadie, **Ura**»
El §9b del guion dice que *ura* va con cuentagotas y **nunca dirigida a una persona**. Y ésta
es una de las líneas que el guion protege (la promesa que se cobra en M13).
- [X] DEJAR COMO ESTÁ · [ ] REEMPLAZAR POR EL GUION · [ ] DEBATIR

### M2-04 · `M2_5` — «Es tuya.»
Guion: «¿Ves? Esa no es del avión. Es tuya.» · Juego: «…Es tuya. **Te la ganaste, changuito.**»
El guion corta antes; la línea de más explica lo que ya se entendió.
- [X] DEJAR COMO ESTÁ · [ ] REEMPLAZAR POR EL GUION · [ ] DEBATIR

### M2-05 · Carta 3 — la carpa de Bordón
Guion (seco): «Tiene la carpa llena de cajas. **Nosotros afuera, las cajas adentro.** Nadie dice nada: acá el que abre la boca la pasa mal.»
Juego: «Tiene su carpa custodiada y llena de cajas. **Estamos convencidos de que son las raciones y demás cosas que nos mandan.** Pero nadie dice nada acá…»
- [X] DEJAR COMO ESTÁ · [ ] REEMPLAZAR POR EL GUION · [ ] DEBATIR

---

# 4. MISIÓN 3 — El invento

### M3-01 · El Turco pierde su comodín
Guion: «Bajate de ahí, chango. **Eso no se toca ni en aca.**» · Juego: «Bajate de ahí, chango. **Va a hace cagada.**»
*aca* es la palabra madre del Turco (§9b). En toda la campaña la dice **una sola vez** hoy.

> **Propuesta** — Las dos en una línea, que no se pisan: «Bajate de ahí, chango. **Eso no se toca ni en aca**, que vas a hacer cagada.» Recupera el comodín del Turco sin perder la razón práctica que el juego le dio.

- [X] DEJAR COMO ESTÁ · [ ] REEMPLAZAR POR EL GUION · [ ] DEBATIR · [ ] LA PROPUESTA

### ✅ M3-02 · La apuesta — **aplicada**
«**Un cartón de puchos** a que el Turco lo manda a cagar antes del mediodía.» / «**Dos cartones** a
que después lo prueba igual.»

### ✅ M3-04 · La arandela — **aplicado (la propuesta)**
«carenado» → «**una tapa**», y el Turco «**levanta el gorro del piso y le sopla el polvo, muy
tranquilo**» antes de decir «No sirve, changuito. Te dije que no sirve.»
Ese gorro es el que M3-12 necesita después.

### M3-05 · **La burrada — el paracaídas se quedó, y creció**
En `story.js` no sólo sigue el paracaídas: lo reforzaste. Ahora el Pichón pregunta «¿Y a qué
velocidad estarías vos cuando saltás? **¿Usarías el eyector?**», y el Gitano contesta «Pero el
paracaídas…» antes del «FACUNDO… / ¿QUÉ? / **NO.**»

Doy la decisión por tomada: **el paracaídas queda.** Lo único que arrastra es el cobro de M9-04
—«NO. Se muere.»— que en el guion se apoyaba en que no había paracaídas. **Ya lo reformulé**: ver
la propuesta de M9-04, que funciona igual con paracaídas.

- [x] DEJAR COMO ESTÁ *(aplicado)*

### ✅ M3-06 · La coreografía de la burrada — **queda como está**
Se mantiene tu versión: el reingreso está, el caño no se tira. La observación sobre la línea del
«estado de inconciencia temporal» —que describe una mecánica de videojuego, cosa que §9c le prohíbe
al Gitano— queda anotada acá y **sin aplicar**, por tu decisión.

### ✅ M3-08 · «no tenés visión, Turco» — **no entra**

### ✅ M3-09 · El Vasco en la burrada — **queda como está** (dice «Diosito» y después se va)

### ✅ M3-10 · «en la loma del aca» — **cerrado por M3-01**
Marcaste DEJAR COMO ESTÁ en M3-01 (el Turco sin su comodín) y en `story.js` la línea quedó «te
junto con pala», sin «Te hace aca». Queda coherente: el *aca* salió del juego entero.
**Efecto secundario a decidir en G-07**: hoy el Turco no dice «aca» ni una vez en toda la campaña,
así que §9b de GUION_3 queda sin aplicar.

### ✅ M3-11 · Carta 4, la navaja probada — **no entra**

### ✅ M3-12 · Los tres gestos del Belgrano — **aplicados**
Dos líneas nuevas en `M03_BELGRANO`:
- `_055`, después de «se está hundiendo con la gente adentro»: «**Silencio largo. El Turco deja el gorro sobre el banco y no lo levanta más.**» *(es el gorro de M3-04, dos escenas antes: ata la risa con el corte sin una palabra)*
- `_095`, después de «Entonces mañana volamos»: «**Se va. Nadie se mueve. El Vasco se toca la cruz. El Turco, al rato, junta las herramientas de a una, muy despacio, como si ordenar sirviera para algo.**»

Quedó **sin** las acotaciones de entrada del Pichón, que están en M3-13 y marcaste DEBATIR.

### ✅ M3-14 · La cifra del Belgrano — **queda como está** (la línea de narrador, no la placa seca)

---

# 5. MISIÓN 4 — El día que sangró el mar

### ✅ M4-01 · **EL NARWAL — aplicado como charla en vuelo**
> **⚠ Corrección de mi relevamiento.** Yo puse que el Narwal «no existe en `story.js`» y que la
> palabra no aparecía «ni una vez». Eso era cierto de `story.js` — pero **el Narwal ya estaba en el
> juego**: 13 líneas de radio en `data/strings.js` (`m4_radio1…13`), colgadas de 13 tramos de `m4`,
> y el cobro mecánico (`marcas: true` en m4 / `marcas: false` en m5) ya construido y comentado en
> `data/missions.js`. Comparé GUION_3 contra `story.js` y no crucé `strings.js`; el ítem estaba mal
> planteado y pedía escribir algo que estaba escrito.

Lo que sí faltaba, y es lo que se aplicó: **pasarlo de radio suelta a escena**.

Cinco escenas `tipo: 'VUELO'` nuevas —`M4_NARWAL_A` … `_E`— colgadas de cinco tramos (los 13
anteriores se consolidaron en 5, porque los 13 existían sólo para que sonara una radio por tramo).
Lo que gana contra las líneas de `strings.js`:

- **holds**: el ritmo lo pone el guion, no el largo del texto.
- **caras por línea**: el Gitano pasa de `gitano_neutro` a `gitano_risa_apagada` cuando la risa se le apaga sola, y eso antes no se podía decir.
- **minúsculas**: las 13 estaban en mayúsculas de télex.
- **el texto vive en `story.js`**, que es el punto del archivo.

Las cinco entran en `CHV_MAX_S` (14,0 · 19,3 · 21,4 · 21,1 · 14,3 s contra un techo de 25).
Los `marcas: true` se conservaron intactos.

### ✅ M4-02 · «pibes iguales a nosotros» — **aplicado (la propuesta)**
«Del otro lado hay **padres e hijos. Pibes iguales a nosotros** que hoy no vuelven.» Entra la
palabra de la tesis sin perder el gancho con Mateo. El «guardá silencio» queda, por M4-03.

### ✅ M4-03 · «guardá silencio» — **queda como está**

### ✅ M5-01 · **EL SILENCIO DEL NARWAL — aplicado como charla en vuelo**
Mismo caso que M4-01: ya existía como `m5_radio1…10`, incluida la entrada `m5_radio6: '...'` —
la radio abierta y nada.

Tres escenas `VUELO` (`M5_NARWAL_A/B/C`) sobre tres tramos, con `marcas: false` intacto. Y acá el
cambio de formato **paga solo**: los tres segundos de radio abierta pasan de ser un renglón que
dice «...» a una línea sin hablante con `hold: 3.0`. Antes era un texto que decía que había
silencio; ahora **es** el silencio.

`M5_NARWAL_B` cierra en «Hace doce días que no transmite» con `hold: 3.0`. 22,6 s de 25.

### ✅ M5-02 · El remate de la escucha — **aplicado (la propuesta)**
«Al ras del suelo… ¿Escuchaste, Tero? **Nos tienen miedo.**» Sin el «se están avivando» y sin los
signos de exclamación, para que el «Sí…» de Esteban tenga contra qué caer.

### ✅ M5-04 · Carta 6, el remate del hambre — **queda como está**

### ✅ M5-05 · Carta 6, «al churrasco» — **queda como está**

---

# 7. MISIÓN 6 — La bomba que no despertó

### ✅ M6-02 · El chiste de la casada nº3 — **lo reescribiste, y quedó mejor**
Ahora: «Y si no vuelvo… **Mandale un saludo a tu casada de mi parte, Vasco.**» / *(sacude la
cabeza, por primera vez casi riéndose)* «…cerrá la boca, cordobés.»

Es más corto que las dos versiones anteriores y no gasta el chiste. Lo doy por cerrado.
**Lo único**: con esto, la palabra «casada» aparece por última vez antes del reveal de M7 — que es
exactamente donde el guion la quería.

- [x] DEJAR COMO ESTÁ *(versión nueva)*

### ✅ M6-03 · «cerrá la boca, cordobés» — **queda como está**

### ⚠ M6-04 · La Chancha se rompe — **aplicado, pero no como charla en vuelo**
Entró todo el segundo movimiento en `M5_CHANCHA`: el reflector, el antiaéreo, y **la Chancha que no
se desconecta** —aguanta hasta que el Gitano termina de cargar y recién ahí un impacto le arranca un
pedazo de ala—.

**No pude colgarlo de un tramo, y quiero que sepas por qué.** Marcaste «como charla en vuelo», y las
charlas se disparan por fracción del **corredor de ida**. Pero esto pasa en el regreso, y `m6` no
tiene `tramos:` ni pierna de vuelta: puesto en el corredor, el «no me da la nafta» sonaría **antes**
del bombardeo. Además la Chancha en el juego es un sistema que **pide el jugador** (`chancha.pedir()`),
no un evento guionado.

Así que va en el epílogo, que es donde ya estaba y es donde narrativamente cae. Tiene todo lo que
pedía la propuesta menos el encuadre en vuelo. Si querés el encuadre, hay que decidir antes si `m6`
lleva pierna de regreso — y eso es motor.

- [x] APLICADO en el epílogo · [ ] DEBATIR el encuadre en vuelo

### ✅ M6-05 · El epílogo del epílogo — **aplicado**
«En la base, la Chancha llegó. Está rota. Los mecánicos la rodean **como a un animal herido**. El
Turco le pasa la mano por el ala agujereada y no dice nada.» Y el dato, seco: «Desde esta noche vuela
corto. Sirve para trabajos cerca. **No baja más al sur.**»

De acá salen `chancha: false` en m7 y m8 (que ya estaba en `missions.js` sin causa visible) y el
«sin Chancha no hay nafta de vuelta» de M13.

### ✅ M6-06 · Carta 7, la revista y el viento — **queda como está**

---

# 8. MISIÓN 7 — 25 de Mayo (muere el Vasco)

### ✅ M7-01 · El beso a la cruz — **aplicado (la propuesta)**
`M6_2_050`, última línea del briefing, `tipo: 'CUADRO'` — plano cerrado, sin busto, igual que el
dorso de la foto. «Lo que no ve nadie es que esta vez, antes de guardarla, **la besa**.»
Pide una imagen `M7_CRUZ` que todavía no existe: cae a la placa. Ver **A-01**.

### ✅ M7-03 · «Sí, ¿por? Se te enfría el chocolate.» — **queda como está** (sin el «o armate un mate»)

### ✅ M7-04 · Pastelitos — **aplicado**
Las dos menciones de `M6_1` pasaron a pastelitos, y ahora la tarjeta y la escena dicen lo mismo.

### ✅ M7-06 · El locker — **resuelto en `story.js`**
Están los tres intercambios: «¿Y el "perdoname"? ¿Perdoname de qué?», el silencio, «Che, Puma.
Vos que lo conocías de antes. Lo del puerto, lo del hermano preso…», «No sé, Facundo.», «¿Cómo
que no sabés?» y «**No sé. Nunca se lo pregunté. Un tipo que volaba como él no me tiene que
explicar de dónde vino. Y ya nunca lo sabremos.**»

Con M1-04 en DEJAR COMO ESTÁ, la cadena quedó completa: el jugador oyó los chismes en M1 y acá
se entera de que nadie los confirmó nunca.

### ✅ M7-07 · «Tres años le cebé mate» — **resuelto en `story.js`**
Entró con su cola: «Tres años, desde que éramos unos giles en la escuela de aviación. Y nunca me
dijo ni de qué cuadro era.» Sigue abierto sólo **T-02** (`M07_LOCKER`, que dice casi lo mismo y no
se juega).

### ✅ M7-08 · «hasta que vuelva donde pertenece» — **lo reescribiste**
Ni «hasta que volvamos» (guion) ni «hasta que vuelva a su casa» (juego anterior): «Me la quedo
hasta que **vuelva donde pertenece**». Cerrado.

- [x] DEJAR COMO ESTÁ *(versión nueva)*

### ✅ M7-09 · Carta 8 — **resuelta en `story.js`**
Entraron los dos párrafos: «Nadie nos preparó para esto… No a que el de al lado se apague en la
mitad de una palabra» y «En el cuaderno dibujé la radio del jujeño sola en el pozo».

---

# 9. MISIÓN 8 — El batir de alas

### 🔴 M7-10 · `M6_CARTA` → `M6_PADRE`, dos pantallas seguidas que se contradicen
Acá es donde el problema se ve en pantalla: `epiM7` corre `M6_CARTA` («Ya sé que no me vas a
contestar») e inmediatamente `M6_PADRE` («Hijo: me preguntaste cómo se hace…»).
**La decisión no es de esta misión: es global. Está en G-01.**

- [X] VER G-01

### ✅ M8-02 · El gesto de Puma — **aplicado**
`M7_2_040`: «Y Puma, que no dijo una palabra más, da la vuelta a su avión y toca las tres cosas de
siempre. **Hoy las toca dos veces cada una.**» Es el día después de la muerte del Vasco.

### ✅ M8-04 · La línea de Esteban en cabina — **aplicada**
`M7_SOBREVUELO_035`: «…¿Estás ahí, Mateo? ¿Alguno de esos sos vos? …**Tenías que ser vos. Alguno
tenías que ser vos.**» con `cara: 'tero_casco'` (en vuelo van con el casco puesto).

Con esto queda armada la asimetría de la nota 8a-bis: Mateo tiene su certeza, Tero se queda con la
pregunta. En el Final A se muere con ella; en el Final B le llega de viejo.

### ⚠ M8-05 · Carta 9 — **aplicada completa**, y ahora depende de M8-03
Entraron las cuatro cosas: **«le vi EL TERITO, pá, el terito pintado abajo de la cabina, TU
pájaro»** · **«¡Es mi viejo! ¡El del terito es MI VIEJO!»** · «El Colorado dice que un avión que bate
las alas te está diciendo "te veo". **¿Me viste, pá?** … Yo sí te vi.» · «"**¿Viste que te
reconocí?**", te voy a decir.»

**Ojo con la dependencia:** M8-03 —mostrar el terito en el fuselaje durante el sobrevuelo— quedó en
DEBATIR. Mientras no entre, esta carta **afirma algo que el jugador nunca vio**. Funciona igual
(Mateo lo cuenta), pero pierde la prueba visual, que era el punto.

---

# 10. MISIÓN 9 — El pibe (muere el Pichón)

### ✅ M9-01 · «por los pibes» / «por el pibe» — **aplicado (la propuesta)**
Puma: «Siempre fue por **los pibes**.» Esteban: «…por **el pibe**.» La diferencia entre las dos
líneas es la diferencia entre los dos personajes.

### ✅ M9-02 · El gesto del Pichón por última vez — **aplicado**
Dos líneas al final de `M8_2`: apoya la mano en la chapa y **se queda escuchando más de lo que se
queda nunca**, después le hace que sí al Turco. Y el remate, solo: «**El avión estaba bien. El avión
estaba perfecto.**» Es la única línea del juego que dice que el gesto no lo salvó.

### ✅ M9-03 · La cuenta del Turco — **aplicada**
`M8_LIBRETA_025`: «…hace la cuenta que nadie le pidió: **todo lo que llegaron a probar juntos es un
cuarto de lo que hay acá adentro.** El pibe no era un ayudante con ideas. **Era un ingeniero entero,
y nadie se dio cuenta a tiempo. Ni él.**»

### ✅ M9-05 · Carta 10 — **aplicada**
«Tengo miedo, te lo digo por primera vez. **Mucho miedo. Pero no del frío ni del hambre: miedo de no
verte más.**»

---

# 11. MISIÓN 10 — Los primos

*La misión mejor migrada del juego: `M10_HUECO`, `M10_TANDIL`, `M10_NOTICIA`, `M10_CUADERNO` y
`M10_MIRAGE` coinciden con el guion casi línea por línea.*

### ✅ M10-01 · El saludo del piloto peruano — **aplicado**
Como `accion:` de su última línea: se da vuelta, busca al mecánico entre los otros y **le hace un
saludo corto con dos dedos en la sien** antes de decir «Cuídenlos, hermano».

### ✅ M11-01 · El nombre dicho para adentro — **aplicado**
`M9_1_050`: «Subiendo, el Gitano dice el nombre del día. Pero lo dice para adentro, sin señalarle
nada a nadie, y el Turco no llega a escucharlo. **Igual lo anota.**» Es el gesto de M6 vaciado de
comedia, y es todo el duelo del Gitano en una acotación.

### ✅ M11-02 · El cierre de Puma — **aplicado**
«No hay más secreto que ese. **Simplemente vivís con ese dolor todos los días.**»

### ✅ M11-03 · Carta 12 — **queda como está**, con el párrafo que el guion no tiene. Hay que actualizar GUION_3.

---

# 13. MISIÓN 12 — El ángel Correntino (muere Correa)

### ✅ M12-02 · «¡Abajo, Mateo!» y el grito — **aplicado**
Correa lo llama por el nombre, no «correntino». Y entró el grito entero: «¡Colorado! ¡No, no, no!
**¡Dijiste que salíamos juntos! ¡DIJISTE QUE SALÍAMOS JUNTOS!**», con `cara: 'mateo_roto'`.

La línea de muerte de Correa **no se tocó**: los jazmines y el nombre de Teresa están en M12-01, que
marcaste DEBATIR.

### ⚠ M12-04 · El epílogo en la pista — **aplicado, con una línea rescatada**
Entró la versión del guion: el Turco al pasar, «**Abajo los están moliendo a bombardeo naval,
m'hijo. Los montes. Anoche y hoy.**», y Esteban mirando el mapa de la pared, el punto que tiene
subrayado hace semanas, sin decir nada.

**Pero no borré «Vos sí sabés por qué. Y no podés avisarle.»** Marcaste REEMPLAZAR, y esa línea es
del juego, no del guion — pero el guion dice lo mismo en prosa («el jugador sí sabe lo que pasó en
ese monte; esa asimetría es el juego entero en una pantalla»), sólo que como nota de dirección. Es
la única línea de la escena que le habla al jugador y me pareció una pérdida gratuita.
Lo que sí se fue es «pregunta si hay carta. No hay».

Y de paso el mapa queda plantado: en M14 la coordenada del parte de Cóndor es ese mismo punto.

- [x] APLICADO · [ ] SACAR también «Vos sí sabés por qué»

### ✅ M12-05 · El tallado — **aplicado**
Ya no lo talla otro pibe en la culata de un fusil. Lo talla Mateo, **con la navaja del Colorado**,
en la viga del pozo: «**VAMOS A VOLVER. LOS PIBES DE MALVINAS.**» Y el cierre: «Me salió torcido y
me importa nada. Lo tallé con la navaja de un correntino que cumplió. Que quede acá clavado aunque
nosotros no quedemos.»

Con esto la navaja tiene sus tres usos: M3 *(el regalo)* → **M12** *(el tallado)* → la encomienda
del final.

### ✅ M12-06 · Carta 13 — **aplicada, y el choque se disolvió**
Entraron «El Colorado era mi techo» y el cierre del guion, «Necesito salir de acá, pa. No aguanto
más. Estoy solo. Me quiero ir a casa, pa. Me quiero ir a casa.»

El choque que había marcado —que `M10_PADRE` contestaba a un pedido que ya no existía— **desapareció
solo**: `M10_PADRE` se fue con G-01.

---

# 14. MISIÓN 13 — La última mesa

### ⚠ M13-01 · El briefing dejó de telegrafiar — **aplicado**, pero M13-04 lo desarma
Puma quedó como el guion: «Esa flota tiene encima toda la defensa antiaérea que les queda. Y la
Chancha está rota **desde la noche del cordobés**: vuela corto, no llega al sur. Sin Chancha no hay
nafta de vuelta. ¿Entendés lo que te digo? **No hay vuelta… asegurada.**» + línea nueva: «**Hay
vuelta si sale todo perfecto. Nunca sale todo perfecto.**»

*(Y ahora «no llega al sur» rima con el «No baja más al sur» que quedó en el epílogo de M6.)*

**Pero dos líneas después Puma todavía dice «Una vez más. La última.»** — eso es `M13-04`, que
sigue sin marcar. Sacar el telegrafiado de una línea y dejarlo en la siguiente no cambia nada:
el jugador se queda con «la última» igual.

- [x] APLICADO · **hay que contestar M13-04**

### ✅ M13-02 · El Gitano cobra la Chancha — **aplicado**
«¿Solo? ¿Vos estás en pedo, culiao? **Seis veces me trajiste vivo a casa. SEIS. Y la Chancha se
rompió por traerme a MÍ.** Hoy te toca cobrar. Hoy el cielo te lo abrimos nosotros, aunque haya que
empujar los misiles con la mano.»

Con `accion: 'Se para. Por única vez la tonada no trae chiste.'`, siguiendo tu criterio de sacar los
paréntesis del texto. Y ahora que M6-04 y M6-05 están aplicados, el «se rompió por traerme a MÍ»
cobra algo que el jugador vio.

### ✅ M13-03 · La foto y la gorra en la pared — **aplicado**
Como `accion:` de la línea de Puma: «Los mira. Mira la foto del Vasco y la gorra del Pichón colgadas
en la pared. Sonríe por primera vez en tres misiones.» El paréntesis salió del `es:`.

### ✅ M14-12 · **LA DECISIÓN, sin menú — aplicada**
`M12_FINAL` dejó de decidir por el jugador. Se fue «Tenía el combustible justo para volver. No tenía
las ganas.» y quedó el planteo del guion: «Sobre el sector humeante aparece la última oleada. De
frente. El mar abierto queda a la izquierda, y el HUD marca la ruta a casa.» **Y ahí corta.**

> **Queda una cosa que contradice al guion y no toqué.** `M12_FINAL_010` es Cóndor diciendo «Tero…
> está en reserva. Si sale AHORA, llega. Repito: **si quiere volver, es ahora**». Eso es de la
> versión vieja y es, literalmente, una opción en pantalla — justo lo que «sin cartel, sin opciones»
> prohíbe. Sacarla deja la decisión muda, como pide el guion.
>
> - [ ] DEJAR a Cóndor · [ ] SACARLO · [ ] DEBATIR

**Falta el motor.** `epiM14A` y `epiM14B` existen y están completas, pero **nadie elige cuál corre**:
`missions.js` nombra una sola secuencia de epílogo. La rama es trabajo de `game.js`.

### ✅ M14-13 · FINAL A · la carta a Norma — **aplicada**
`EPI_A1` *(la base vacía, el locker, la carta parada contra la pared del fondo con un solo nombre)* y
`EPI_A2`, la carta entera en seis líneas, `tipo: 'CARTA'`. Texto de GUION_3, sin agregados.

### ✅ M14-14 · FINAL A · la encomienda — **aplicada**
`EPI_A3`, con la estructura del guion: **una sola** encomienda —el cuaderno, del Ejército— y la carta
que Norma va a buscar al aparador, «blanda de tanto doblarse, la que llegó hace años». Los dos
papeles enfrentados como dos cubiertos, y el cuaderno abierto en la primera página.

Se conserva `EPI_MESA1` antes *(los dos telegramas, la mesa servida para dos, la pava)*, que es del
juego y no del guion, y que en el Final A es exactamente correcto: mueren los dos.
La versión vieja `EPI_MESA2` —dos encomiendas, la carta «sin firmar y sin sobre»— se archivó.

**No lleva línea de cierre.** GUION_3: «Sostener el plano. El jugador hace el resto solo.»

### ✅ M14-15 · FINAL B · el mate — **aplicado**
Tres escenas: `EPI_B1` *(abre Esteban, no se anima a pasar la página)*, `EPI_B2` *(el Turco hojea, el
jazminero, la navaja del Colorado contra la azucarera, «¿Y eso qué importa, m'hijo? Vos lo viste a
él»)* y `EPI_B3`, el remate: «**…M'hijo. Acá dice que te vio.**» / «**¿Me vio?… ¡Me vio! ¡NORMA!
¡Mateo ese día me vio!**»

Es **el único camino de todo el juego** en el que Esteban se entera, y llega décadas tarde.
Placa `cocina_calida`, contra el `cocina_gris` del Final A: la convención ya estaba en el código.

### ✅ G-01 · **RESUELTO — nadie se escribe nada**
Regla del autor, y ya estaba en GUION_3 nota 1:

> Esteban **nunca** le escribe a Mateo, y Mateo **nunca** le hace llegar ninguna carta a Esteban.
> El cuaderno es un diario y **se encuentra al final**.
> Esteban **muere sin saber con certeza si Mateo lo vio**. Mateo sí sabe que lo vio.
> La única carta del juego es la de Esteban a **Norma**.

**Aplicado.** Salieron las cuatro `LA CARTA DEL PADRE` (`M6_PADRE`, `M8_PADRE`, `M10_PADRE`,
`M11_PADRE`) de `story.js` y de sus secuencias. **El texto no se perdió**: está en
[CARTAS_PADRE_RETIRADAS.md](CARTAS_PADRE_RETIRADAS.md) con el motivo.

`M11_PADRE` era además la que más rompía: decía «lo único lindo que vi desde arriba fue **a vos, con
el cuaderno, saludando**» — o sea le daba a Esteban la certeza que el personaje no puede tener nunca.

Se arreglaron de paso otras dos cosas de la misma regla:
- `M11_CARTA_010` decía «no sé si esta carta **va a salir**. Ya casi no sale nada de acá» → Mateo presuponía correo. Ahora: «ya casi no queda nada acá. Te escribo igual… **aunque nunca lo leas. Aunque te lo lea yo cuando vuelva.**»
- **Los títulos.** 9 escenas se llamaban «CARTA DE MATEO» y son páginas de un cuaderno. Pasaron a «EL CUADERNO». También `LA CARTA DEL CIELO` → `LA PÁGINA DEL CIELO`, `LA ÚLTIMA CARTA · SIN COPIAR` → `LA ÚLTIMA PÁGINA` *(el «sin copiar» era resto de la regla de copiar cartas, que GUION_3 dio de baja)*, y `SIN CARTA` → `LO QUE NO SABE`.

---

# TUS CAMBIOS EN `story.js` vs GUION_3

*Decisiones tuyas que el guion todavía no refleja. No son errores: son lo que quedó. GUION_3 hay que bajarlo a esto antes de volver a usarlo como fuente.*

### D-01 · La burrada del Gitano — tres cambios
- **El paracaídas.** No está en el guion, y era deliberado: sin paracaídas el Turco puede contestar «El suelo, m'hijo. Abajo está el suelo». Vos lo reforzaste con «¿Usarías el eyector?». Queda, y el cobro de M9 se reformuló sobre el reingreso (M9-04).
- **El caño no se tira.** El guion fija la coreografía vertical → salto → disparo → **tirar el caño** → reingreso. Con el paracaídas adentro el caño ya no aporta.
- ⚠ **«Entrás en un estado de inconciencia temporal y los reventás a balazos.»** Es una línea nueva tuya, y es la única del juego donde el Gitano describe **una mecánica de videojuego**. §9c lo prohíbe explícitamente: gestos y palabras sueltas en inglés sí, mecánicas no. Marcaste DEJAR COMO ESTÁ en M3-06, así que queda — pero es una excepción a una regla que el guion llama dura.

### D-02 · El chiste de la casada nº3 (M6)
Escribiste una tercera versión: «Mandale un saludo a tu casada de mi parte, Vasco.» Ni la del guion
ni la del juego anterior. Es más corta y no gasta el chiste.

### D-03 · El Turco perdió su comodín
Marcaste DEJAR en M3-01 y borraste «Te hace aca» en M3-10. Resultado: **el Turco no dice «aca» ni
una vez en toda la campaña**, y §9b lo llama «su palabra madre». Está anotado en `G-07`.

### D-04 · «vi el TERO» / «EL TERITO»
En la carta 9 cambiaste «le vi EL TERITO» por «vi el TERO, pá. El terito pintado abajo de la
cabina». Funciona igual y de paso junta el apodo con el pájaro.

### D-05 · Estilo — los paréntesis salen del texto
Venís moviendo las direcciones de escena del `es:` al campo `accion:` (`M8_2`, `M8_LIBRETA`,
`M11_2`, `M6_LOCKER2`, `M5_CHANCHA`). **No está en GUION_3 y es mejor**: el guion las escribe
inline porque es un documento para leer, no datos. Lo estoy siguiendo en todo lo que escribo.
Quedan sin migrar `M9_1_030` y `M9_1_040`, entre otras.

### D-06 · Reescrituras de detalle
`M03_INVENTO` («Va a hace' cagada», «Tero se quedaba») · `M03_ARANDELA` («una pieza de metal al rojo
vivo», y la arandela le roza la oreja al Gitano — el guion sólo tiene el gorro) · `M03_BELGRANO`
(«Esto es así. Mañana volamos») · `M8_2` («Pero pensá que» + «Suspira profundo») · `M8_LIBRETA`
(«ideas atrevidas y extraordinarias» en vez de la enumeración) · `M6_EPI` (el Vasco con línea propia
y la estática en la `accion`) · `M4_CARTA` («robar comida **de las cajas**», «¿Esto es la guerra? ¿O
es otra cosa?»).

### D-07 · 26 caras nuevas que no existen
Las que escribiste en la burrada y el 25 de mayo (`gitano_imaginando`, `vasco_sorprendido`,
`turco_pensante`, `puma_espaldas`…). Están en `T-06` con la lista completa.


---

## ✅ T-01 · IDs de línea duplicados — **corregido**
Los ids se habían roto al escribir líneas nuevas copiando la de arriba: 15 ids repetidos, uno de
ellos ocho veces (`M6_LOCKER2_040`). Se renumeró **de diez en diez, en el orden en que están** —el
orden era el correcto, los números no—: **101 líneas en 18 escenas**, sin tocar una sola palabra.

`M07_LOCKER` quedó intacta a propósito: sus ids están asertados en `tools/unit.js` como fixture de
aceptación.

Estado: **0 ids duplicados**, y 0 líneas cuyo id no coincida con su escena y su posición.

## ✅ T-07 · `personaje: 'NARRADOR'` — **corregido**
`M6_LOCKER2` tenía la línea del silencio como `personaje: 'NARRADOR', cara: ''`, que habría impreso
«NARRADOR» como si fuera alguien hablando. Pasó a `personaje: null, cara: null, tipo: 'NARRADOR'`.

## ✅ T-08 · `vazco_espalda` — **corregido**
Con z. Ahora `vasco_espalda`. Y de paso `vasco_sonriente` → **`vasco_sonrisa`**, que ya existía como
archivo: un retrato menos para generar.

## ✅ T-12 · El build web — **fuera del tablero**
El target es **Electron + Steam**. El techo de 16 MB era del build web y no aplica. Retirado.
