> # ⛔ DOCUMENTO RETIRADO — no contestar acá
>
> Este archivo fue el **primer** comparador GUION_3 vs `story.js`, línea por línea: **942
> decisiones**. Quedó reemplazado por el juego de documentos por tema, que es más chico porque
> agrupa y porque ya tiene 93 ítems aplicados:
>
> - **[PENDIENTES_GUION.md](PENDIENTES_GUION.md)** — lo que falta decidir
> - **[RESUELTOS_GUION.md](RESUELTOS_GUION.md)** — lo cerrado, con el porqué
> - **[RETRATOS_PENDIENTES.md](RETRATOS_PENDIENTES.md)** y **[IMAGENES_PENDIENTES.md](IMAGENES_PENDIENTES.md)** — el arte
>
> **Las mismas preguntas están en los dos lados** —el Mundial, la historia del Gitano, la frase del
> Turco, los tres desayunos, «Pifié»— y eso es lo que hacía que parecieran repetidas. Se contestan
> **sólo en PENDIENTES**.
>
> De las 9 marcas que tenía este archivo, 8 ya están en `story.js`. La novena («Moví todo. Llamé a
> todos») quedó anulada por `P-05`, que contestaste después y con más información.
>
> Se conserva sólo como registro.

# MERGE — GUION_3 contra el juego

> **Qué es esto.** El guion del juego se migró desde `data/strings.js` cuando esa fuente ya estaba
> **desactualizada** respecto de [`GUION_3.md`](GUION_3.md). O sea: se centralizó texto viejo. Este
> documento enfrenta las dos versiones línea por línea para poder elegir sin releer las dos fuentes
> enteras.
>
> **Cómo se usa.** Cada bloque tiene una marca. Poné una `x` en la que quieras, o escribí la tuya
> en `PROPIA:`. Después, `python3 tools/aplicar_merge.py` las lleva a `data/story.js`.
>
> Las líneas **iguales** no aparecen: no hay nada que decidir con ellas.

| marca | significa |
|---|---|
| `~` | **las dos existen y son distintas.** Una es reescritura de la otra — hay que elegir |
| `G` | **solo en GUION_3.** Falta escribirla en el juego |
| `J` | **solo en el juego.** O es invento viejo, o el guion la perdió |

## PRÓLOGO

`11` iguales · `8` distintas · `3` solo guion · `6` solo juego

### ~ P1_2_010 · parecido 69%

- [ ] **GUION_3** — Imagen: un campo en la provincia. Un Rastrojero oxidado. Esteban joven de uniforme revolea una piedra chata: pica una, dos, tres veces. Mateo, ocho años, está sentado en la orilla con un cuaderno en las rodillas, dibujando el arroyo, el Rastrojero, el avión que cruza el cielo. Dibuja como respira: sin darse cuenta.
- [x] **JUEGO** — : Un campo en la provincia. Un Rastrojero oxidado. Esteban joven revolea una piedra chata: pica una, dos, tres veces. Mateo, ocho años, dibuja el arroyo con el cuaderno en las rodillas.
- [ ] **PROPIA:** 

### ~ P1_2_040 · parecido 81%

- [x] **GUION_3** — ESTEBAN: Se caen los que le tienen miedo a la tierra. (le revuelve el pelo, mira el dibujo) …Salió mejor el avión que yo, ¿eh?
- [ ] **JUEGO** — ESTEBAN: Se caen los que le tienen miedo a la tierra. …Salió mejor el avión que yo, ¿eh?
- [ ] **PROPIA:** 

### ~ P2_3_030 · parecido 88%

- [ ] **GUION_3** — ESTEBAN: (medio riéndose) Vos al Rastrojero lo rompés más de lo que lo arreglás.
- [x] **JUEGO** — ESTEBAN: Vos al Rastrojero lo rompés más de lo que lo arreglás.
- [ ] **PROPIA:** 

### ~ P2_3_050 · parecido 59%

- [ ] **GUION_3** — ESTEBAN: (sin levantar la vista del mate) Le erraste por poco, entonces.
- [x] **JUEGO** — ESTEBAN: Te salvaste por poco, entonces.
- [ ] **PROPIA:** 

### G · falta en el juego

- [ ] **AGREGAR** — Nota de tratamiento.: El sorteo del servicio militar iba por los últimos números del documento: los bajos zafaban, los del medio iban al Ejército, los más altos a Fuerza Aérea o Armada. En pantalla no se dice ninguna cifra —los cortes exactos variaban año a año—: alcanza con "un poco más arriba el número". Es un chiste de mala suerte entre padre e hijo que dura cuatro segundos, y no se vuelve a mencionar nunca en todo el juego. El jugador se acuerda solo.
- [ ] **DEJAR AFUERA**

### ~ P2_3_060 · parecido 78%

- [ ] **GUION_3** — NORMA: (se levanta y atiende) ¿Para quién?... ¿Tero?... Tomá amor. Es para vos.
- [x] **JUEGO** — NORMA: ¿Para quién?... ¿Tero?... Tomá amor. Es para vos.
- [ ] **PROPIA:** 

### ~ P2_3_055 · parecido 79%

- [ ] **GUION_3** — ESTEBAN: (toma el teléfono)
- [x] **JUEGO** — : Suena el teléfono.
- [ ] **PROPIA:** 

### G · falta en el juego

- [x] **AGREGAR** — ESTEBAN: (prende la radio sin responder)
- [ ] **DEJAR AFUERA**

### G · falta en el juego

- [x] **AGREGAR** — ESTEBAN: Moví todo. Llamé a todos. Creí que podía. (la puerta se cierra) No pude.
- [ ] **DEJAR AFUERA**

### ~ P3_4_030 · parecido 72%

- [ ] **GUION_3** — CÓNDOR: 🟩 (por teléfono, no por radio — cara `condortelefono`): Aldao. Su hijo ya está embarcado. Está en las islas. Lo siento.
- [x] **JUEGO** — CÓNDOR: Aldao. Su hijo ya está embarcado. Está en las islas. Lo siento.
- [ ] **PROPIA:** 

### ~ P4_1_020 · parecido 86%

- [ ] **GUION_3** — (carta): Decidí comenzar a escribirte, para contarte todo con lujo de detalles, y porque creo que me distrae un poco. Cuando vuelva, te lo doy en la mano. Te lo leo y me río con vos. Mientras tanto te sigo contando, como si estuvieras acá.
- [ ] **JUEGO** — (carta): Decidí comenzar a escribirte, para contarte todo con lujo de detalles, y porque creo que me distrae un poco. Cuando vuelva, te lo doy en la mano. Te lo leo y me río con vos.
- [ ] **PROPIA:** 

### J P2_3_010 · no está en GUION_3

- [ ] **DEJAR** — : Viernes a la tarde. Mateo, 18, rapado de colimba, de franco: llegó hace un rato y el bolso todavía está en la puerta. Esteban enfrente. Norma de espaldas, sirviendo.
- [ ] **BORRAR**

### J P2_3_110 · no está en GUION_3

- [ ] **DEJAR** — : Prende la radio sin responder. «...tropas argentinas desembarcaron esta madrugada en las Islas Malvinas...». Los tres quietos. La pava chifla y nadie la saca del fuego.
- [ ] **BORRAR**

### J P2_3_120 · no está en GUION_3

- [ ] **DEJAR** — : El 2 de abril la Plaza se llenó de gente festejando. En esa cocina, un padre que realmente conocía las consecuencias de una guerra no festejó.
- [ ] **BORRAR**

### J P3_4_010 · no está en GUION_3

- [ ] **DEJAR** — : El teléfono de la base, papeles, un despacho, una puerta que se cierra.
- [ ] **BORRAR**

### J P3_4_020 · no está en GUION_3

- [ ] **DEJAR** — ESTEBAN: Llamé a todos. A todos mis contactos en Corrientes. Creí que podía sacarlo... No pude.
- [ ] **BORRAR**

### J P4_1_050 · no está en GUION_3

- [ ] **DEJAR** — (carta): Esa misma semana, empezaba la guerra.
- [ ] **BORRAR**

---

## MISIÓN 1

`5` iguales · `4` distintas · `13` solo guion · `10` solo juego

### G · falta en el juego

- [ ] **AGREGAR** — VASCO: (sin levantar la vista de la escalerilla, casi para adentro) Es la manera que tienen de rezar.
- [ ] **DEJAR AFUERA**

### ~ M1_5B_010 · parecido 64%

- [ ] **GUION_3** — GITANO: (lo ve mirando y le habla desde el otro lado del banco) Andá, mirala, Pichón. Está pegada adentro del locker.
- [ ] **JUEGO** — GITANO: Andá, mirala, Pichón. Está pegada adentro del locker.
- [ ] **PROPIA:** 

### G · falta en el juego

- [ ] **AGREGAR** — PICHÓN: (sin sacarle los ojos de encima) ...es hermosa.
- [ ] **DEJAR AFUERA**

### ~ M1_5B_010 · parecido 61%

- [ ] **GUION_3** — GITANO: Es "La Casada", le decimos así porque no sabemos quién es, pero esa mujer no es de nadie que esté solo…
- [ ] **JUEGO** — GITANO: Le decimos “La Casada”. No sabemos quién es, pero es seguro que ese minón tiene dueño.
- [ ] **PROPIA:** 

### ~ M1_5B_010 · parecido 86%

- [ ] **GUION_3** — GITANO: (se acerca al locker, junto al Pichón) Creíamos que era la mujer del Vasco. Pero él nunca dice nada… de nada. Debe ser algún amorío del pasado... Y que actualmente está casada... con alguien de poder. Como un político... o un mafioso... o ambas.
- [ ] **JUEGO** — GITANO: Creíamos que era la mujer del Vasco. Pero él nunca dice nada… de nada. Debe ser algún amorío del pasado... Y ya debe estar casada... con alguien de poder. Como un político... o un mafioso... o ambas.
- [ ] **PROPIA:** 

### G · falta en el juego

- [ ] **AGREGAR** — CÓNDOR: (shhh, crrr… zkk) Escuadrilla CAUQUÉN, acá Cóndor. Aprobado el vuelo de adaptación sobre mar abierto, rumbo sudeste. Mantenerse pegaditos al agua todo el trayecto que hay radar. Autorizados pista dos. Buen vuelo, muchachos.
- [ ] **DEJAR AFUERA**

### G · falta en el juego

- [ ] **AGREGAR** — (carta): 🟩 Qué cambió acá, y por qué importa. El bloque de la foto se separó en su propia escena, con lugar y hora propios (el vestuario, media hora antes). Antes el Gitano mandaba al Pichón a mirar una foto sin que nadie hubiera dicho dónde estaban, de quién era el locker ni por qué había una foto ahí: el jugador leía el chiste sin el chiste.
- [ ] **DEJAR AFUERA**

### G · falta en el juego

- [ ] **AGREGAR** — (carta): Y el apodo se volvió canon: "LA CASADA". Ya no es una especulación suelta — es cómo la llama la escuadrilla, *"porque no sabemos quién es"*. Eso hace que el giro de M7 pegue el doble: el juego le puso nombre a la mujer equivocada durante siete misiones.
- [ ] **DEJAR AFUERA**

### G · falta en el juego

- [ ] **AGREGAR** — Se cayeron: los chismes del Pichón (el hermano preso / el Vasco preso) y el remate de Puma *("a mí me dijeron que ustedes dos hablan mucho")*.
- [ ] **DEJAR AFUERA**

### G · falta en el juego

- [ ] **AGREGAR** — ESTEBAN: (lo ve; toca la pintura fresca con un dedo) …¿Y esto?
- [ ] **DEJAR AFUERA**

### G · falta en el juego

- [ ] **AGREGAR** — EL TURCO: (sin darle importancia, acomodando la escalerilla) Su pájaro, Teniente. Acá los aviones van con nombre.
- [ ] **DEJAR AFUERA**

### G · falta en el juego

- [ ] **AGREGAR** — ESTEBAN: (mira los otros aviones) …¿Y el resto tienen estrellas?
- [ ] **DEJAR AFUERA**

### G · falta en el juego

- [ ] **AGREGAR** — EL TURCO: (sigue revisando el fuselaje) Sí, tengo la costumbre de pintarles una estrella a cada uno por cada vuelta. (golpeando el fuselaje como a un caballo) Traémela entera Tero, eh. Y traete vos adentro, que la estrellita la pinto por vos, no por ella.
- [ ] **DEJAR AFUERA**

### G · falta en el juego

- [ ] **AGREGAR** — Nota de tratamiento.: Sin música y sin una sola línea de narración. Solo el ruido de la pista. Nadie explica ningún gesto acá ni después: el jugador los va a reconocer solo, misión tras misión, y recién en M14 va a entender que los estuvo aprendiendo.
- [ ] **DEJAR AFUERA**

### G · falta en el juego

- [ ] **AGREGAR** — (carta): Hoy conocí a un tipo, el cabo Correa. Correntino. Le dicen el Colorado. Me vio tiritando y me tiró un cuero de oveja sin decir nada — de una que carnearon los pibes acá, me dijo, con la lana para adentro. Abriga como estufa. Parece un poncho de oveja, pá: me lo pongo y quedo hecho un gaucho. Después me enseñó a armar el pozo mirando de dónde viene el viento. Tiene una hermana de mi edad allá en Corrientes y unos mates que te levantan de la tumba.
- [ ] **DEJAR AFUERA**

### ~ M1_9_030 · parecido 67%

- [ ] **GUION_3** — (carta): Lo dibujé con capa, como un superhéroe, y abajo le puse "el Colorado". Te vas a reír cuando lo veas.
- [ ] **JUEGO** — (carta): Lo dibujé con una capa (de lana), como un superhéroe. Te lo guardo para cuando vuelva. Te vas a reír. Mateo.
- [ ] **PROPIA:** 

### G · falta en el juego

- [ ] **AGREGAR** — (carta): Anoche en el pozo los pibes hablaban de los viejos. Conté que el mío vuela y no me creían. Y me acordé de mamá, de cuando era chico y vos no estabas nunca: ella me contaba que en la Fuerza te dicen Tero desde antes de que yo naciera.
- [ ] **DEJAR AFUERA**

### J M1_3_035 · no está en GUION_3

- [ ] **DEJAR** — VASCO: Es la manera que tienen de rezar.
- [ ] **BORRAR**

### J M1_5B_005 · no está en GUION_3

- [ ] **DEJAR** — : El vestuario, media hora antes de subir. El Vasco cierra su locker rápidamente y se aparta. Pichón logra ver la foto de una mujer.
- [ ] **BORRAR**

### J M1_5B_005 · no está en GUION_3

- [ ] **DEJAR** — : Una foto blanco y negro denota una bella mujer sonriente. Pichón se queda mirándola.
- [ ] **BORRAR**

### J M1_5B_020 · no está en GUION_3

- [ ] **DEJAR** — PICHÓN: ...es hermosa.
- [ ] **BORRAR**

### J M1_5B_030 · no está en GUION_3

- [ ] **DEJAR** — : El Vasco se persigna, sube la escalerilla y no acota nada.
- [ ] **BORRAR**

### J M1_5B_040 · no está en GUION_3

- [ ] **DEJAR** — CÓNDOR: Escuadrilla CAUQUÉN, acá Cóndor. Solicitud de vuelo de adaptación sobre mar abierto autorizado, rumbo sudeste. Recomendamos cautela, mantenerse rasantes al agua durante todo el trayecto, prestar atencion al radar. Autorizada pista dos para despegue, buen vuelo.
- [ ] **BORRAR**

### J M1_7_010 · no está en GUION_3

- [ ] **DEJAR** — : El escuadrón aterriza. Mientras el equipo baja de sus aviones, el Turco se acerca con un pincel finito y pintura. Tiene la costumbre de pintarles estrellitas, una por cada vez que se vuelve a salvo.
- [ ] **BORRAR**

### J M1_7_020 · no está en GUION_3

- [ ] **DEJAR** — EL TURCO: Esta estrellita te pertenece. A vos, no al avión.
- [ ] **BORRAR**

### J M1_7_030 · no está en GUION_3

- [ ] **DEJAR** — : Al menos por un ratito, esto parece una aventura.
- [ ] **BORRAR**

### J M1_9_010 · no está en GUION_3

- [ ] **DEJAR** — (carta): Viejo: hoy conocí a un tipo, el cabo Correa. Correntino. Le dicen el Colorado. Me vió tiritando y me tiró un cacho de lana de oveja sin decir nada, como quien no quiere la cosa.
- [ ] **BORRAR**

---

## MISIÓN 2

`2` iguales · `8` distintas · `2` solo guion · `8` solo juego

### ~ M2_1_040 · parecido 89%

- [ ] **GUION_3** — PUMA: (pausa larga) No. Pero es lo que hay, y lo que hay lo volamos con todo. Como en el potrero, Tero: cuando el rival tiene botines y vos estás descalzo, gambeteás más pegado al piso.
- [ ] **JUEGO** — PUMA: No, pero es lo que hay. Y lo que hay lo volamos con todo. Como en el potrero, si el rival tiene botines y vos estás descalzo, tenés que gambetear más pegado al piso.
- [ ] **PROPIA:** 

### G · falta en el juego

- [ ] **AGREGAR** — GITANO: (agarra el mate con las dos manos, se cuadra, levanta los brazos doblados a la altura de la cabeza y hace tres pasitos en el lugar — una reverencia ridícula, entera, para nadie) THANK YOU.
- [ ] **DEJAR AFUERA**

### ~ M2_MATE_030 · parecido 64%

- [ ] **GUION_3** — PICHÓN: (que no entiende nada) …¿Y por qué en inglés?
- [ ] **JUEGO** — PICHÓN: ¿Y por qué en inglés?
- [ ] **PROPIA:** 

### ~ M2_MATE_040 · parecido 68%

- [ ] **GUION_3** — GITANO: (ya tomando) Porque si digo gracias me sacan de la ronda, pibe. Y yo de la ronda no me voy.
- [ ] **JUEGO** — GITANO: Porque si digo gracias me sacan de la ronda, culiau.
- [ ] **PROPIA:** 

### ~ M2_MATE_050 · parecido 58%

- [ ] **GUION_3** — EL TURCO: (sin levantar la vista de la carga) De la ronda no se va nadie.
- [ ] **JUEGO** — EL TURCO: De la ronda no se va nadie, Ura.
- [ ] **PROPIA:** 

### ~ M2_5_030 · parecido 72%

- [ ] **GUION_3** — EL TURCO: ¿Ves? Esa no es del avión. Es tuya.
- [ ] **JUEGO** — EL TURCO: ¿Ves? Esa no es del avión. Es tuya. Te la ganaste, changuito.
- [ ] **PROPIA:** 

### ~ M2_8_010 · parecido 82%

- [ ] **GUION_3** — (carta): Hoy comimos una vez. En todo el día. La comida está —la mandan del continente— pero no llega a nosotros. El Colorado me pasó la mitad de su lata jurando que él ya había comido, mentira grande como una casa porque le escuché las tripas toda la noche.
- [ ] **JUEGO** — (carta): Pá: hoy comimos una vez. En todo el día. La comida está —la mandan del continente— pero nunca llega a nosotros. El Colorado me pasó la mitad de su lata, jurando que él ya había comido. Una mentira grande como una casa. Le escuché las tripas toda la noche.
- [ ] **PROPIA:** 

### ~ M2_8_020 · parecido 75%

- [ ] **GUION_3** — (carta): Hay un subteniente, Bordón. Tiene la carpa llena de cajas. Nosotros afuera, las cajas adentro. Nadie dice nada: acá el que abre la boca la pasa mal.
- [ ] **JUEGO** — (carta): Hay un subteniente, Bordón. Tiene su carpa custodiada y llena de cajas. Estamos convencidos de que son las raciones y demás cosas que nos mandan. Pero nadie dice nada acá. El que abre la boca, la pasa mal.
- [ ] **PROPIA:** 

### ~ M2_8_030 · parecido 56%

- [ ] **GUION_3** — (carta): Igual te cuento una linda: como prohibieron pasar música en inglés, la radio pasa rock nacional todo el día. Anoche los pibes cantaban en el pozo, pá. Cantábamos para no llorar y al final era lo mismo, pero cantado.
- [ ] **JUEGO** — (carta): Igual, te cuento una linda: como prohibieron pasar música en inglés, la radio pasa rock nacional todo el día. Pasamos toda la noche con los pibes cantando en el pozo, pá. Tratábamos de distraernos, pero nos ganaron las ganas de llorar. Igualmente cantábamos.
- [ ] **PROPIA:** 

### G · falta en el juego

- [ ] **AGREGAR** — (carta): Unas ganas de comer el guiso de mamá... Apenas termine esto le pedimos que lo prepare. Anotalo vos también, que yo acá lo tengo escrito. 🟥 Nota de tratamiento — el recordatorio. «Yo acá lo tengo escrito» es literal: en un rincón de la hoja de dibujos, chiquito, torcido y subrayado a mano, está anotado pedir a mamá que prepare guiso. Sin comillas, sin flecha, sin relación con ningún dibujo: una nota que se dejó a sí mismo para no olvidarse. Prompt armado: `PROMPTSTIERRALISTOS.md` · CARTA 3 (`carta3m2.png`).
- [ ] **DEJAR AFUERA**

### J M2_1_010 · no está en GUION_3

- [ ] **DEJAR** — : Ellos tienen misiles que piensan solos, radares que ven de noche, Sea Harriers de última generación. Los Fieles tienen aviones con más horas que un colectivo del interior, bombas de otra década y coraje.
- [ ] **BORRAR**

### J M2_MATE_010 · no está en GUION_3

- [ ] **DEJAR** — : Antes de subir, el Turco ceba el mate y arranca la ronda con el Gitano.
- [ ] **BORRAR**

### J M2_MATE_020 · no está en GUION_3

- [ ] **DEJAR** — GITANO: THANK YOU.
- [ ] **BORRAR**

### J M2_MATE_060 · no está en GUION_3

- [ ] **DEJAR** — : Mientras la ronda de mate sigue, el Pichón ya está al lado de su avión con la mano abierta apoyada en la chapa y la cabeza gacha, escuchando. No dice nada. Luego de un momento la saca y se seca la palma en el mameluco.
- [ ] **BORRAR**

### J STORYM2_TARJETA_010 · no está en GUION_3

- [ ] **DEJAR** — : 1 de mayo de 1982 · Costa
- [ ] **BORRAR**

### J M2_5_010 · no está en GUION_3

- [ ] **DEJAR** — : Vuelven todos, pero raspados. El Pichón aterriza con el avión agujereado y las manos temblándole.
- [ ] **BORRAR**

### J M2_5_020 · no está en GUION_3

- [ ] **DEJAR** — : El Turco lo abraza sin decir nada y se pasa la noche remendando chapa a la luz de un farol. A la mañana, el avión tiene los agujeros parchados y una estrellita nueva.
- [ ] **BORRAR**

### J M2_8_040 · no está en GUION_3

- [ ] **DEJAR** — (carta): Unas ganas de comer el guiso de mamá... Apenas termine esto le pedimos que lo prepare. Anotalo vos también, que yo acá lo tengo escrito. Mateo.
- [ ] **BORRAR**

---

## MISIÓN 3

`7` iguales · `17` distintas · `23` solo guion · `24` solo juego

### ~ M03_INVENTO_020 · parecido 71%

- [ ] **GUION_3** — EL TURCO: Bajate de ahí, chango. Eso no se toca ni en aca.
- [ ] **JUEGO** — EL TURCO: Bajate de ahí, chango. Va a hace cagada.
- [ ] **PROPIA:** 

### G · falta en el juego

- [ ] **AGREGAR** — PICHÓN: (sin bajarse, entusiasmado, hablando rapidísimo) Es que mire... si le corremos la toma dos dedos y le sacamos este peso muerto de acá, en la salida del rasante gana empuje. Lo vi en la salida de ayer, el suyo se quedaba y el del capitán no, y la única diferencia es...-
- [ ] **DEJAR AFUERA**

### ~ M03_INVENTO_040 · parecido 83%

- [ ] **GUION_3** — EL TURCO: Changuito... Eso no se puede.
- [ ] **JUEGO** — EL TURCO: No, changuito... Eso no se puede. Bajate.
- [ ] **PROPIA:** 

### G · falta en el juego

- [ ] **AGREGAR** — PICHÓN: (se frena de golpe, avergonzado) …Perdón. Ya me bajo.
- [ ] **DEJAR AFUERA**

### G · falta en el juego

- [ ] **AGREGAR** — EL TURCO: (pausa larga. Mira el fuselaje. Mira al pibe.) …A ver. Mostrame.
- [ ] **DEJAR AFUERA**

### ~ M03_INVENTO_080 · parecido 78%

- [ ] **GUION_3** — PUMA: (mirando el mapa) Veinte mil a que después lo prueba igual.
- [ ] **JUEGO** — PUMA: Veinte a que después lo prueba igual.
- [ ] **PROPIA:** 

### G · falta en el juego

- [ ] **AGREGAR** — EL TURCO: (al Pichón, muy tranquilo, mientras levanta el gorro y le sopla el polvo) No sirve ni aca, changuito.
- [ ] **DEJAR AFUERA**

### G · falta en el juego

- [ ] **AGREGAR** — PICHÓN: (anotando algo con su lápiz de carpintero, imperturbable) …Interesante.
- [ ] **DEJAR AFUERA**

### ~ M03_ARANDELA_040 · parecido 69%

- [ ] **GUION_3** — GITANO: (al borde de las lágrimas de risa) "Interesante", dice el culiao. Casi me mata una arandela voladora... Ajá... "interesante".
- [ ] **JUEGO** — GITANO: Interesante dice el culiao... Casi me vuela la oreja con una arandela... Ajá... interesante.
- [ ] **PROPIA:** 

### G · falta en el juego

- [ ] **AGREGAR** — GITANO: Turco. Turco, pará. Escuchame una cosa que la tengo pensada hace como una semana.
- [ ] **DEJAR AFUERA**

### G · falta en el juego

- [ ] **AGREGAR** — EL TURCO: No me toques eso.
- [ ] **DEJAR AFUERA**

### G · falta en el juego

- [ ] **AGREGAR** — GITANO: Es un segundo. Mirá. Te vienen dos atrás, ¿sí? Dos. No les ganás de velocidad, no les ganás de nada.
- [ ] **DEJAR AFUERA**

### ~ M03_BURRADA_010 · parecido 64%

- [ ] **GUION_3** — GITANO: Entonces no jugás a eso. Ponés la trompa para arriba. Derechito al cielo, hasta que el avión se queda sin nada.
- [ ] **JUEGO** — GITANO: Entonces, en vez de entrar en su juego, ponés la trompa para arriba. Derechito al cielo, completamente vertical.
- [ ] **PROPIA:** 

### G · falta en el juego

- [ ] **AGREGAR** — PICHÓN: (que ya está siguiéndolo en serio) …Ahí entrás en pérdida.
- [ ] **DEJAR AFUERA**

### ~ M03_BURRADA_040 · parecido 65%

- [ ] **GUION_3** — GITANO: Ahí entrás en pérdida. Perfecto. Y ahí te bajás.
- [ ] **JUEGO** — GITANO: Perfecto. Y ahí... te... TE BAJÁS.
- [ ] **PROPIA:** 

### ~ M03_BURRADA_050 · parecido 79%

- [ ] **GUION_3** — VASCO: ¿Cómo que te bajás.
- [ ] **JUEGO** — VASCO: ¿Te bajás? ¿Cómo... que te bajás?
- [ ] **PROPIA:** 

### G · falta en el juego

- [ ] **AGREGAR** — GITANO: Te bajás, Vasco. Te salís. Y los dos que te venían siguiendo le siguen yendo al avión —porque el avión sigue ahí arriba haciendo la suya— y vos ya no estás adentro.
- [ ] **DEJAR AFUERA**

### G · falta en el juego

- [ ] **AGREGAR** — GITANO: (y acá se carga el tubo al hombro) Y mientras caés… le metés uno.
- [ ] **DEJAR AFUERA**

### ~ M03_BURRADA_120 · parecido 57%

- [ ] **GUION_3** — PICHÓN: ¿Cayendo?
- [ ] **JUEGO** — PUMA: Facundo...
- [ ] **PROPIA:** 

### G · falta en el juego

- [ ] **AGREGAR** — GITANO: Cayendo. Total abajo no hay nada, ¿qué te va a pasar?
- [ ] **DEJAR AFUERA**

### G · falta en el juego

- [ ] **AGREGAR** — EL TURCO: El suelo, m'hijo. Abajo está el suelo.
- [ ] **DEJAR AFUERA**

### G · falta en el juego

- [ ] **AGREGAR** — GITANO: (sin escucharlo, cada vez más entusiasmado) Le metés uno al Harrier, tirás el caño —no lo vas a andar cargando, ya está usado— y seguís cayendo tranquilo. Y ahí, en el aire, acomodás el cuerpo… (se pone de cabeza, apuntando con las dos manos) …y le apuntás a tu propio avión, que viene bajando por el otro lado.
- [ ] **DEJAR AFUERA**

### G · falta en el juego

- [ ] **AGREGAR** — GITANO: Te metés adentro, cerrás la cúpula, y seguís volando como si nada.
- [ ] **DEJAR AFUERA**

### ~ M03_BURRADA_080 · parecido 73%

- [ ] **GUION_3** — PICHÓN: (anotando, completamente en serio) ¿Y a qué velocidad estarías vos cuando saltás?
- [ ] **JUEGO** — PICHÓN: ¿Y a qué velocidad estarías vos cuando saltás?
- [ ] **PROPIA:** 

### ~ M03_BURRADA_100 · parecido 56%

- [ ] **GUION_3** — GITANO: Y… despacito.
- [ ] **JUEGO** — VASCO: Diosito.
- [ ] **PROPIA:** 

### G · falta en el juego

- [ ] **AGREGAR** — VASCO: (se persigna sin drama, como quien espanta una mosca) Diosito.
- [ ] **DEJAR AFUERA**

### ~ M03_BURRADA_110 · parecido 82%

- [ ] **GUION_3** — EL TURCO: (quitándole el misil de las manos) A ver, m'hijo. ¿Vos te pensás que el aire es una vereda? (pausa) Te bajás vos de ese avión, y a los treinta segundos te junto con la pala en la loma del aca.
- [ ] **JUEGO** — EL TURCO: A ver, m'hijo. ¿Vos te pensás que el aire es una vereda? Vos te bajás de ese avión, y a los treinta segundos te junto con la pala. Te hace aca.
- [ ] **PROPIA:** 

### G · falta en el juego

- [ ] **AGREGAR** — GITANO: Lo que pasa es que vos no tenés visión, Turco. Nunca la tuviste.
- [ ] **DEJAR AFUERA**

### G · falta en el juego

- [ ] **AGREGAR** — PUMA: (sin levantar la voz y sin levantar la vista del mapa) Facundo.
- [ ] **DEJAR AFUERA**

### G · falta en el juego

- [ ] **AGREGAR** — GITANO: ¿Qué.
- [ ] **DEJAR AFUERA**

### G · falta en el juego

- [ ] **AGREGAR** — PUMA: No.
- [ ] **DEJAR AFUERA**

### G · falta en el juego

- [ ] **AGREGAR** — Nota de tratamiento — el guiño.: Es un homenaje a la maniobra imposible que cualquier jugador de Battlefield vio mil veces: subir vertical con los perseguidores encima, eyectarse, voltear al que te sigue con un lanzacohetes mientras caés, tirar el tubo, y volver a meterte en tu propio avión en el aire. La coreografía tiene que respetarse en ese orden —vertical, salto, disparo en caída, tirar el caño, reingreso— porque el orden ES el chiste para el que lo reconoce. En pantalla no se nombra ningún juego, ninguna marca y ningún año. Es un piloto de veintipico diciendo una burrada en un hangar. El que lo tiene que reconocer lo reconoce; el que no, se ríe igual y nunca se entera de que había un chiste adentro del chiste. Se paga en M9, en la libreta.
- [ ] **DEJAR AFUERA**

### ~ M03_CUADERNO_010 · parecido 76%

- [ ] **GUION_3** — (carta): Hoy el Colorado me regaló una navaja. Así nomás, sin cumpleaños ni nada. Un cortaplumas viejo, con el cabo de asta gastadito de años de mano. "Era de mi abuelo", me dijo. "En el campo, un hombre sin navaja no es nadie, chamigo." Le dije que no podía aceptarla y me contestó que un regalo rechazado trae mala suerte, y que acá de mala suerte estamos completos.
- [ ] **JUEGO** — (carta): Pá: hoy el Colorado me regaló una navaja. Así nomás, sin cumpleaños ni nada. Un cortaplumas viejo, con el cabo de asta gastadito de años de mano. "Era de mi abuelo", me dijo. "En el campo, un hombre sin navaja no es nadie, chamigo."
- [ ] **PROPIA:** 

### ~ M03_CUADERNO_030 · parecido 63%

- [ ] **GUION_3** — (carta): La probé pelando un palo para el fuego. Corta como pensamiento malo. La llevo en el bolsillo de arriba, con la birome. Mis dos herramientas, pá: una para contar y otra para lo que venga.
- [ ] **JUEGO** — (carta): La llevo en el bolsillo de arriba, con la birome. Mis dos herramientas, pá: una para contar y otra para lo que venga. La dibujé abajo, mirá. Le hice hasta las marquitas del cabo. Mateo.
- [ ] **PROPIA:** 

### G · falta en el juego

- [ ] **AGREGAR** — (carta): La dibujé abajo, mirá. Le hice hasta las marquitas del cabo.
- [ ] **DEJAR AFUERA**

### ~ M03_BELGRANO_010 · parecido 88%

- [ ] **GUION_3** — PICHÓN: …Hundieron al Belgrano.
- [ ] **JUEGO** — PICHÓN: Huuuu... hundieron al Belgrano.
- [ ] **PROPIA:** 

### ~ M03_BELGRANO_030 · parecido 77%

- [ ] **GUION_3** — PICHÓN: Ya sé. (pausa) Un submarino. Dos torpedos.
- [ ] **JUEGO** — PICHÓN: Sí, ya sé... El ataque fue desde un submarino. Dos torpedos.
- [ ] **PROPIA:** 

### ~ M03_BELGRANO_060 · parecido 63%

- [ ] **GUION_3** — GITANO: (y por primera vez el chiste no aparece) Estaba yéndose. Estaba yéndose, Puma.
- [ ] **JUEGO** — GITANO: Pero no estaba en la zona... estaba yéndose, Puma.
- [ ] **PROPIA:** 

### ~ M03_BELGRANO_090 · parecido 75%

- [ ] **GUION_3** — PUMA: (cortándolo, sin levantar la voz) Y entonces nada, Facundo. Entonces mañana volamos.
- [ ] **JUEGO** — PUMA: Y entonces nada, Facundo. Entonces mañana volamos.
- [ ] **PROPIA:** 

### G · falta en el juego

- [ ] **AGREGAR** — Nota de tratamiento.: El juego da los hechos y nada más: fuera de la zona de exclusión, rumbo oeste, dos torpedos, temporal, 323. La bronca la ponen los personajes — ellos sí lo llaman lo que les parece. La narración no adjetiva: no hace falta.
- [ ] **DEJAR AFUERA**

### J M03_INVENTO_010 · no está en GUION_3

- [ ] **DEJAR** — : El Pichón está trepado a una escalera contra el avión de Esteban, con la manga sucia de grasa hasta el codo. El Turco abajo, con los brazos cruzados y cara de tribunal.
- [ ] **BORRAR**

### J M03_INVENTO_030 · no está en GUION_3

- [ ] **DEJAR** — PICHÓN: Es que mire... si le corremos la toma dos dedos y le sacamos este peso muerto de acá, en la salida del rasante gana empuje. Lo vi en la salida de ayer, el suyo se quedaba y el del capitán no, y la única diferencia es...
- [ ] **BORRAR**

### J M03_INVENTO_050 · no está en GUION_3

- [ ] **DEJAR** — PICHÓN: Perdón... Ya me bajo....
- [ ] **BORRAR**

### J M03_INVENTO_060 · no está en GUION_3

- [ ] **DEJAR** — EL TURCO: A ver... mostrame...
- [ ] **BORRAR**

### J M03_TARJETA_010 · no está en GUION_3

- [ ] **DEJAR** — : Primeros días de mayo de 1982 · Patrulla costera
- [ ] **BORRAR**

### J M03_ARANDELA_010 · no está en GUION_3

- [ ] **DEJAR** — : Prueban el invento del pibe: algo con un carenado y mucha cinta aisladora. Hace un ruido espantoso, tira una pieza que sale volando, y se apaga con humo. Le vuela el gorro al Turco y le roza la oreja al Gitano.
- [ ] **BORRAR**

### J M03_ARANDELA_020 · no está en GUION_3

- [ ] **DEJAR** — EL TURCO: No sirve, changuito. Te dije que no sirve.
- [ ] **BORRAR**

### J M03_ARANDELA_030 · no está en GUION_3

- [ ] **DEJAR** — PICHÓN: Mmmm... interesante.
- [ ] **BORRAR**

### J M03_BURRADA_010 · no está en GUION_3

- [ ] **DEJAR** — GITANO: Turco, cuchá. Tengo una idea tremenda y quería saber si es posible.
- [ ] **BORRAR**

### J M03_BURRADA_110 · no está en GUION_3

- [ ] **DEJAR** — EL TURCO: Escucho.
- [ ] **BORRAR**

### J M03_BURRADA_020 · no está en GUION_3

- [ ] **DEJAR** — GITANO: Venís volando, y aparecen dos atrás, ¿sí? Ellos nos superan en velocidad, no son fáciles de perder. Además su armamento es mucho mejor que el nuestro.
- [ ] **BORRAR**

### J M03_BURRADA_110 · no está en GUION_3

- [ ] **DEJAR** — EL TURCO: Entiendo, seguí.
- [ ] **BORRAR**

### J M03_BURRADA_030 · no está en GUION_3

- [ ] **DEJAR** — PICHÓN: Ahí entrás en pérdida. Estás más expuesto.
- [ ] **BORRAR**

### J M03_BURRADA_060 · no está en GUION_3

- [ ] **DEJAR** — GITANO: Te bajás, Vasco. Abrís la cabina y te tirás. Con paracaídas obviamente, por las dudas. 
- [ ] **BORRAR**

### J M03_BURRADA_060 · no está en GUION_3

- [ ] **DEJAR** — GITANO: Los que te siguen, le siguen yendo al avión, pero vos ya no estás adentro. Y mientras caés… LES DISPARÁS.
- [ ] **BORRAR**

### J M03_BURRADA_080 · no está en GUION_3

- [ ] **DEJAR** — PICHÓN: ¿Y con qué?
- [ ] **BORRAR**

### J M03_BURRADA_070 · no está en GUION_3

- [ ] **DEJAR** — GITANO: Con lo que sea que te lleves encima. Un revolver, una ametralladora, un lanzacohetes... lo que sea.
- [ ] **BORRAR**

### J M03_BURRADA_100 · no está en GUION_3

- [ ] **DEJAR** — VASCO: Buenas tardes, muchachos.
- [ ] **BORRAR**

### J M03_BURRADA_070 · no está en GUION_3

- [ ] **DEJAR** — GITANO: Apenas los destruis, acomodás el cuerpo, y le apuntás a tu propio avión, que viene bajando por el otro lado. Te metés adentro, cerrás la cúpula, y seguís volando como si nada.
- [ ] **BORRAR**

### J M03_BURRADA_090 · no está en GUION_3

- [ ] **DEJAR** — GITANO: Y... yo calculo...
- [ ] **BORRAR**

### J M03_BURRADA_090 · no está en GUION_3

- [ ] **DEJAR** — GITANO: Pero el paracaídas...
- [ ] **BORRAR**

### J M03_BURRADA_130 · no está en GUION_3

- [ ] **DEJAR** — GITANO: ¿Qué? Digo... Diga mi capitán.
- [ ] **BORRAR**

### J M03_CUADERNO_020 · no está en GUION_3

- [ ] **DEJAR** — (carta): Le dije que no podía aceptarla y me contestó que un regalo rechazado trae mala suerte, y que acá de mala suerte estamos completos.
- [ ] **BORRAR**

### J M03_BELGRANO_100 · no está en GUION_3

- [ ] **DEJAR** — : El Belgrano se hundió con 323 muertos... Casi la mitad de todos los argentinos caídos en la guerra. En una sola tarde... 
- [ ] **BORRAR**

---

## MISIÓN 4

`13` iguales · `10` distintas · `3` solo guion · `10` solo juego

### ~ M3_1_040 · parecido 67%

- [ ] **GUION_3** — GITANO: (baja de golpe) …veinte marinos.
- [ ] **JUEGO** — GITANO: Veinte marinos...
- [ ] **PROPIA:** 

### ~ M3_1_050 · parecido 83%

- [ ] **GUION_3** — PUMA: Del otro lado hay pibes iguales a nosotros que hoy no vuelven. Alegrate de que nosotros sí. Y callate un minuto por los que no.
- [ ] **JUEGO** — PUMA: Del otro lado hay padres, hijos, y personas iguales a nosotros que hoy no vuelven. Alegrate de que nosotros sí. Y guardá silencio por los que no.
- [ ] **PROPIA:** 

### ~ M3_2_010 · parecido 89%

- [ ] **GUION_3** — GITANO: (después del minuto, en voz baja) Algún día le vamos a ganar en algo que no mate a nadie. Algún pibe nuestro va a agarrar una pelota y los va a gambetear a todos. A TODOS, Puma. Y ese día va a ser más grande que éste.
- [ ] **JUEGO** — GITANO: Algún día les vamos a ganar en algo que no mate a nadie. Algún pibe nuestro va a agarrar una pelota y los va a gambetear a todos, Puma. ¡A TODOS! Y ese día va a ser más grande que éste.
- [ ] **PROPIA:** 

### ~ m4_radio1 · parecido 81%

- [ ] **GUION_3** — CÓNDOR: Plata Fiel, anoto posiciones. Dos unidades al noreste, rumbo sur, velocidad diez. Una tercera más atrás, sin confirmar.
- [ ] **JUEGO** — CONDOR: PLATA FIEL, ANOTO POSICIONES. DOS UNIDADES AL NORESTE, RUMBO SUR, VELOCIDAD DIEZ.
- [ ] **PROPIA:** 

### ~ m4_radio4 · parecido 66%

- [ ] **GUION_3** — GITANO: Cóndor, una pregunta de curioso nomás. ¿De dónde sacás vos todo eso? Porque nosotros acá no vemos un carajo hasta que lo tenemos encima.
- [ ] **JUEGO** — GITANO: CONDOR, UNA PREGUNTA DE CURIOSO NOMAS. ¿DE DONDE SACAS VOS TODO ESO?
- [ ] **PROPIA:** 

### ~ m4_radio5 · parecido 60%

- [ ] **GUION_3** — CÓNDOR: (sin ningún énfasis, como quien lee una planilla) De un barco pesquero llamado Narwal.
- [ ] **JUEGO** — CONDOR: DE UN BARCO PESQUERO LLAMADO NARWAL.
- [ ] **PROPIA:** 

### ~ m4_radio7 · parecido 64%

- [ ] **GUION_3** — CÓNDOR: Un pesquero. Setenta metros. Tira la red, la levanta, la vuelve a tirar. Y mientras tanto anota todo lo que le pasa al lado.
- [ ] **JUEGO** — CONDOR: SETENTA METROS. TIRA LA RED, LA LEVANTA, LA VUELVE A TIRAR.
- [ ] **PROPIA:** 

### ~ m4_radio8 · parecido 79%

- [ ] **GUION_3** — GITANO: (riéndose) ¡Pará! ¿Me estás diciendo que la flota inglesa le está pasando por adelante a unos tipos que están pescando?
- [ ] **JUEGO** — GITANO: ¡PARA! ¿LA FLOTA INGLESA LE PASA POR ADELANTE A UNOS TIPOS QUE ESTAN PESCANDO?
- [ ] **PROPIA:** 

### ~ m4_radio10 · parecido 81%

- [ ] **GUION_3** — GITANO: (la risa se le apaga sola) …Tres semanas ahí adentro. ¿Y esos tipos qué son? ¿Marina?
- [ ] **JUEGO** — GITANO: …TRES SEMANAS AHI ADENTRO. ¿Y ESOS TIPOS QUE SON? ¿MARINA?
- [ ] **PROPIA:** 

### G · falta en el juego

- [ ] **AGREGAR** — GITANO: ¿Pescadores pescadores?
- [ ] **DEJAR AFUERA**

### G · falta en el juego

- [ ] **AGREGAR** — CÓNDOR: Pescadores pescadores.
- [ ] **DEJAR AFUERA**

### G · falta en el juego

- [ ] **AGREGAR** — CÓNDOR: Sin nada para tirar.
- [ ] **DEJAR AFUERA**

### ~ m4_radio13 · parecido 62%

- [ ] **GUION_3** — PUMA: (al final, casi para sí mismo, y es lo único que dice en todo el tramo) No son militares, Gitano. Y están más adentro que nosotros.
- [ ] **JUEGO** — PUMA: NO SON MILITARES, GITANO. Y ESTAN MAS ADENTRO QUE NOSOTROS.
- [ ] **PROPIA:** 

### J M3_1_010 · no está en GUION_3

- [ ] **DEJAR** — : El 4 de mayo de 1982, el mundo se enteró de que la flota más poderosa podía sangrar. Un misil Exocet alcanzó al destructor británico HMS Sheffield.
- [ ] **BORRAR**

### J M3_2_030 · no está en GUION_3

- [ ] **DEJAR** — : Camino a los aviones, Esteban se para un segundo delante del suyo, estira dos dedos y toca el terito. Luego sigue caminando.
- [ ] **BORRAR**

### J STORYM3_TARJETA_010 · no está en GUION_3

- [ ] **DEJAR** — : 4 de mayo de 1982 · HMS SHEFFIELD
- [ ] **BORRAR**

### J M3_6_010 · no está en GUION_3

- [ ] **DEJAR** — : En la base hay abrazos, alguien descorcha algo. En la radio quedó grabado el pánico inglés: "Low level! Low level! Here they come again!"
- [ ] **BORRAR**

### J M3_6_020 · no está en GUION_3

- [ ] **DEJAR** — : Puma se aparta y se queda mirando el mar, sin sonreír. Cuando Puma no sonríe, hay que preocuparse.
- [ ] **BORRAR**

### J M3_FOTO_010 · no está en GUION_3

- [ ] **DEJAR** — : El Vasco abre el locker. Mira la foto dos segundos, se besa la mano y toca el papel. Después cierra la puerta.
- [ ] **BORRAR**

### J M3_HIST_010 · no está en GUION_3

- [ ] **DEJAR** — : Un Super Etendard de la Armada Argentina lanzó un misil Exocet que impactó el casco del destructor.
- [ ] **BORRAR**

### J M3_HIST_020 · no está en GUION_3

- [ ] **DEJAR** — : Murieron 20 tripulantes. El fuego obligó a abandonar el buque.
- [ ] **BORRAR**

### J M3_HIST_030 · no está en GUION_3

- [ ] **DEJAR** — : Fue el primer buque de guerra británico perdido en acción desde la Segunda Guerra Mundial.
- [ ] **BORRAR**

### J m4_radio2 · no está en GUION_3

- [ ] **DEJAR** — CONDOR: UNA TERCERA MAS ATRAS, SIN CONFIRMAR.
- [ ] **BORRAR**

---

## MISIÓN 5

`18` iguales · `5` distintas · `6` solo guion · `15` solo juego

### ~ M4_2_050 · parecido 72%

- [ ] **GUION_3** — GITANO: (cerrando la cúpula) Y nada. Eso digo. Juntaron.
- [ ] **JUEGO** — GITANO: Y nada. Eso digo. Juntaron.
- [ ] **PROPIA:** 

### G · falta en el juego

- [ ] **AGREGAR** — CÓNDOR: (nada)
- [ ] **DEJAR AFUERA**

### G · falta en el juego

- [ ] **AGREGAR** — GITANO: (sin nada arriba, la voz plana) …Copiado.
- [ ] **DEJAR AFUERA**

### ~ M5_ESCUCHA_040 · parecido 62%

- [ ] **GUION_3** — PICHÓN: (traduciendo despacio, siguiendo con el dedo, sin darse cuenta todavía de lo que está leyendo) Dice… "si estás en guerra con Argentina y escuchás el ruido de las turbinas de un avión…" (se frena)
- [ ] **JUEGO** — PICHÓN: Dicen... "si estás en guerra... con Argentina... y escuchás el ruido de... de las turbinas de un avión..."
- [ ] **PROPIA:** 

### G · falta en el juego

- [ ] **AGREGAR** — GITANO: ¿Y? Seguí, pibe.
- [ ] **DEJAR AFUERA**

### ~ M5_ESCUCHA_060 · parecido 87%

- [ ] **GUION_3** — PICHÓN: (levanta la vista) "…no mires al cielo. Porque la muerte viene a ras del suelo."
- [ ] **JUEGO** — PICHÓN:  ..."no mires al cielo. Porque la muerte viene a ras del suelo."
- [ ] **PROPIA:** 

### ~ M5_ESCUCHA_070 · parecido 66%

- [ ] **GUION_3** — EL TURCO: (bajito, desde la puerta, sin entrar) Escribila, changuito. Esa escribila.
- [ ] **JUEGO** — EL TURCO: Escribila, changuito. Esa escribila.
- [ ] **PROPIA:** 

### G · falta en el juego

- [ ] **AGREGAR** — GITANO: (la sonrisa volviendo de a poco, la voz rara) …A ras del suelo. ¿Escuchaste, Tero? Somos eso.
- [ ] **DEJAR AFUERA**

### G · falta en el juego

- [ ] **AGREGAR** — ESTEBAN: (que no sonríe; está pensando en un monte y en un pibe que también escucha turbinas) …Sí.
- [ ] **DEJAR AFUERA**

### G · falta en el juego

- [ ] **AGREGAR** — Sobre la frase.: Circula muy difundida y se le atribuye a un oficial británico, pero no tiene fuente documentada. Por eso en el juego entra como lo que es: una transmisión interceptada, sin firma, sin nombre y sin fecha. Nadie la atribuye a nadie. Ver PREGUNTASHISTORICAS.md.
- [ ] **DEJAR AFUERA**

### ~ M4_CARTA_040 · parecido 82%

- [ ] **GUION_3** — (carta): Anoche carneamos una oveja, pá. A escondidas, con el Colorado y dos más. La comimos hasta los huesos: los partimos con piedras para sacarles el caracú. Yo, que en casa le sacaba la grasa a la milanesa. Nadie hizo un chiste ni pidió perdón. Lo hicimos rápido y en silencio, como un trabajo. No sé qué me asusta más, pá: el hambre, o lo tranquilo que me estoy volviendo para aguantarla.
- [ ] **JUEGO** — (carta): Anoche carneamos una oveja, pá. A escondidas, con el Colorado y dos más. La comimos hasta los huesos: los partimos con piedras para sacarles el caracú. Yo, que en casa le sacaba la grasa al churrasco. Nadie hizo un chiste ni pidió perdón. Lo hicimos rápido y en silencio, como un trabajo.
- [ ] **PROPIA:** 

### J M4_1_010 · no está en GUION_3

- [ ] **DEJAR** — : Los británicos desembarcan. El estrecho se vuelve una trampa de fuego antiaéreo que los propios pilotos bautizan, con humor de velorio, el Callejón de las Bombas. Hay que entrar ahí. Todos los días.
- [ ] **BORRAR**

### J M4_2_060 · no está en GUION_3

- [ ] **DEJAR** — : Y atrás, sin que lo vea nadie, el Vasco apoya la cruz contra el fuselaje. La deja ahí dos segundos más de lo que la deja siempre.
- [ ] **BORRAR**

### J STORYM4_TARJETA_010 · no está en GUION_3

- [ ] **DEJAR** — : 21 de mayo de 1982 · HMS ARDENT
- [ ] **BORRAR**

### J M4_EPI_010 · no está en GUION_3

- [ ] **DEJAR** — : El Ardent arde. Victoria. Pero el avión del Vasco vuelve rozando el mar, con el tren de aterrizaje colgando como una pata quebrada. Toca pista de milagro.
- [ ] **BORRAR**

### J M4_EPI_020 · no está en GUION_3

- [ ] **DEJAR** — : Esa noche nadie hace chistes. El Turco no pinta la estrellita del Vasco hasta el otro día, porque le temblaba el pulso.
- [ ] **BORRAR**

### J M5_ESCUCHA_010 · no está en GUION_3

- [ ] **DEJAR** — : Esa noche, en la sala de radio, el Pichón estaba con los auriculares puestos, escribiendo en la libreta. Sabe inglés técnico de leer manuales de aviación robados, lo aprendió sólo para entender los planos.
- [ ] **BORRAR**

### J M5_ESCUCHA_050 · no está en GUION_3

- [ ] **DEJAR** — GITANO: ¿Y?
- [ ] **BORRAR**

### J M5_ESCUCHA_080 · no está en GUION_3

- [ ] **DEJAR** — GITANO: Al ras del suelo... ¿Escuchaste, Tero? Se están avivando. ¡Pero nos tienen miedo, eh!
- [ ] **BORRAR**

### J M5_ESCUCHA_090 · no está en GUION_3

- [ ] **DEJAR** — ESTEBAN: Sí...
- [ ] **BORRAR**

### J M4_CARTA_050 · no está en GUION_3

- [ ] **DEJAR** — (carta): No sé qué me da más miedo, pá: el hambre, o en lo que me estoy convirtiendo con tal de aguantarla. Mateo.
- [ ] **BORRAR**

### J M4_HIST_010 · no está en GUION_3

- [ ] **DEJAR** — : La fragata HMS Ardent fue atacada en oleadas sucesivas mientras cubría el desembarco en San Carlos.
- [ ] **BORRAR**

### J M4_HIST_020 · no está en GUION_3

- [ ] **DEJAR** — : Murieron 22 tripulantes. Se hundió al día siguiente.
- [ ] **BORRAR**

### J M4_HIST_030 · no está en GUION_3

- [ ] **DEJAR** — : Su comandante fue el último en abandonarla.
- [ ] **BORRAR**

### J m5_radio6 · no está en GUION_3

- [ ] **DEJAR** — : ...
- [ ] **BORRAR**

### J m5_radio9 · no está en GUION_3

- [ ] **DEJAR** — GITANO: …COPIADO.
- [ ] **BORRAR**

---

## MISIÓN 6

`7` iguales · `5` distintas · `2` solo guion · `10` solo juego

### ~ M5_2_010 · parecido 56%

- [ ] **GUION_3** — GITANO: (sin chiste, por una vez) Entonces elijo pegarle y volver a cebar el mate. (a Vasco, recuperando el chiste porque lo necesita) Y si no vuelvo, Vasco, decile a la morocha de tu foto que no me extrañe, que total te tiene a vos que sos tan bueno en el amor… como yo en el pilotaje.
- [ ] **JUEGO** — GITANO: Entonces elijo pegarle y volver a cebar el mate. Que la bomba haga lo que pueda. Y si no vuelvo, Vasco, le avisás vos a tu casada, que con el coronel ya tiene práctica en dar malas noticias.
- [ ] **PROPIA:** 

### G · falta en el juego

- [ ] **AGREGAR** — VASCO: …Callate, cordobé. (pero casi se ríe. Casi.)
- [ ] **DEJAR AFUERA**

### G · falta en el juego

- [ ] **AGREGAR** — GITANO: (al Turco, mientras sube) Turco, anotá que hoy ésta se llama «el Confiable».
- [ ] **DEJAR AFUERA**

### ~ M5_1_040 · parecido 89%

- [ ] **GUION_3** — ESTEBAN: (mirando la bomba bajo el ala) Es como el sapito... La piedra va tan pegada al agua que no se hunde. El problema... es que nosotros necesitamos que se hunda.
- [ ] **JUEGO** — ESTEBAN: Es como el sapito. La piedra va tan pegada al agua que no se hunde. El problema es que nosotros necesitamos que se hunda.
- [ ] **PROPIA:** 

### ~ M5_CHANCHA_020 · parecido 75%

- [ ] **GUION_3** — GITANO: (por primera vez sin humor) Muchachos… no me da eh... No me da la nafta.
- [ ] **JUEGO** — GITANO: Muchachos... no me da eh... No me da la nafta.
- [ ] **PROPIA:** 

### ~ M5_CHANCHA_050 · parecido 81%

- [ ] **GUION_3** — GITANO: (la voz quebrada) Ayyy!! Te amo, gorda. Cuando volvamos me vuelvo vegetariano en tu honor.
- [ ] **JUEGO** — GITANO: Te amo!! Cuando volvamos me vuelvo vegetariano en tu honor.
- [ ] **PROPIA:** 

### ~ M5_CARTA_010 · parecido 70%

- [ ] **GUION_3** — (carta): ¿Te acordás del festival que hicieron allá para juntar cosas para nosotros? Acá no llegó ni un chocolate. Ni uno, pá. Dicen que hay galpones llenos en el continente. A nosotros llegó una revista vieja que decía en la tapa "Estamos ganando". La usamos para taparnos del viento. Por lo menos para algo sirvió la mentira.
- [ ] **JUEGO** — (carta): Viejo: ¿te acordás del festival para juntar cosas para nosotros? Acá no llegó ni un chocolate. Llegó una revista vieja que decía "Estamos ganando". La usamos para taparnos del viento.
- [ ] **PROPIA:** 

### J M5_1_010 · no está en GUION_3

- [ ] **DEJAR** — : Muchas bombas argentinas no explotan: se lanzan TAN bajo que no llegan a armarse en el aire. La espoleta necesita caída, y los pilotos no pueden dársela sin regalarse.
- [ ] **BORRAR**

### J M5_2_020 · no está en GUION_3

- [ ] **DEJAR** — VASCO: ...cerrá la boca, cordobés.
- [ ] **BORRAR**

### J STORYM5_TARJETA_010 · no está en GUION_3

- [ ] **DEJAR** — : 23 de mayo de 1982 · HMS ANTELOPE
- [ ] **BORRAR**

### J M5_EPI_010 · no está en GUION_3

- [ ] **DEJAR** — : El Antelope explota de noche: una bomba dormida despierta mientras un artificiero británico intentaba desactivarla para salvar a su barco.
- [ ] **BORRAR**

### J M5_EPI_020 · no está en GUION_3

- [ ] **DEJAR** — : Del otro lado, un hombre murió tratando de salvar a los suyos. Coraje inglés. El mismo coraje.
- [ ] **BORRAR**

### J M5_CHANCHA_010 · no está en GUION_3

- [ ] **DEJAR** — : En el regreso, a Gitano no le cierra la cuenta de combustible. Viento de frente, tanque picado, la aguja bajando.
- [ ] **BORRAR**

### J M5_CHANCHA_030 · no está en GUION_3

- [ ] **DEJAR** — : Y de la nada, gorda, lenta, hermosa, aparece la Chancha: el Hércules reabastecedor La manguera se conecta en el aire, de noche, a metros del mar.
- [ ] **BORRAR**

### J M5_HIST_010 · no está en GUION_3

- [ ] **DEJAR** — : Dos bombas impactaron la fragata, pero no detonaron.
- [ ] **BORRAR**

### J M5_HIST_020 · no está en GUION_3

- [ ] **DEJAR** — : Al intentar desactivar una, la bomba estalló. Murió el artificiero James Prescott.
- [ ] **BORRAR**

### J M5_HIST_030 · no está en GUION_3

- [ ] **DEJAR** — : El incendio llegó a la santabárbara y el buque se partió en dos. Su silueta ardiendo se volvió una de las imágenes del conflicto.
- [ ] **BORRAR**

---

## MISIÓN 7

`4` iguales · `12` distintas · `7` solo guion · `14` solo juego

### ~ M6_2_010 · parecido 60%

- [ ] **GUION_3** — VASCO: (hablando más que en las seis misiones anteriores juntas, sobre nada: el chocolate, el frío, una anécdota de la escuela de aviación) …y el tipo me hace repetir el aterrizaje cuatro veces. Cuatro. Yo tenía diecinueve años y el tipo me hace repetirlo cuatro veces.
- [ ] **JUEGO** — : El Vasco habla más que en las cinco misiones anteriores juntas. Del chocolate, del frío, de una anécdota de la escuela de aviación que nadie le pidió.
- [ ] **PROPIA:** 

### ~ M6_2_020 · parecido 86%

- [ ] **GUION_3** — GITANO: (sorprendido, divertido) Vasco. ¿Vos estás bien?
- [ ] **JUEGO** — GITANO: (sorprendido) Vasco. ¿Vos estás bien?
- [ ] **PROPIA:** 

### ~ M6_2_030 · parecido 76%

- [ ] **GUION_3** — VASCO: (se queda pensando la respuesta demasiado tiempo) Sí, sí... Tomate eso que se enfría. O armate un mate.
- [ ] **JUEGO** — VASCO: (se queda pensando la respuesta demasiado tiempo) ...Sí. Vamos, que el chocolate se enfría.
- [ ] **PROPIA:** 

### ~ M6_EPI_030 · parecido 59%

- [ ] **GUION_3** — VASCO: (un ruido corto, ni una palabra. Estática.)
- [ ] **JUEGO** — : Un ruido corto, ni una palabra: el sonido de alguien que va a decir algo y no llega. Estática.
- [ ] **PROPIA:** 

### ~ M6_EPI_040 · parecido 67%

- [ ] **GUION_3** — PUMA: Plata Fiel… a casa. Volvemos a casa.
- [ ] **JUEGO** — PUMA: (después de mucho, la voz quebrada) Plata Fiel... a casa. Volvemos a casa.
- [ ] **PROPIA:** 

### ~ M6_LOCKER1_020 · parecido 84%

- [ ] **GUION_3** — GITANO: (con una ternura triste) La bella dama del Vasco... Turco, dejame verla una última vez.
- [ ] **JUEGO** — GITANO: (con una ternura triste) La casada... Turco, dejámela ver una última vez.
- [ ] **PROPIA:** 

### ~ M6_LOCKER2_010 · parecido 72%

- [ ] **GUION_3** — (carta): Rosa Elena Arrieta 1926 – 1961
- [ ] **JUEGO** — : Rosa Elena Arrieta. 1926 – 1961. "Te amo, mamá. Perdoname."
- [ ] **PROPIA:** 

### ~ M6_LOCKER2_030 · parecido 89%

- [ ] **GUION_3** — ESTEBAN: El Vasco tenía... ¿quince?
- [ ] **JUEGO** — ESTEBAN: El Vasco tenía quince años.
- [ ] **PROPIA:** 

### ~ M6_LOCKER2_040 · parecido 78%

- [ ] **GUION_3** — GITANO: (la voz rota) …Toda la guerra lo cargamos con la morocha esta. Toda la guerra, Turco. Y resulta que no sólo está muerta sino que era la vieja... ¡La vieja! Y el tipo nunca dijo nada. Nos dejó reír. Nos regaló el chiste para que tuviéramos de qué reírnos.
- [ ] **JUEGO** — GITANO: (la voz rota) Toda la guerra lo cargamos con la casada. Y estaba muerta. Y el tipo nunca dijo nada. Nos dejó reír. Nos regaló el chiste para que tuviéramos de qué reírnos.
- [ ] **PROPIA:** 

### G · falta en el juego

- [ ] **AGREGAR** — GITANO: ¿Y el "perdoname"? ¿Perdoname de qué?
- [ ] **DEJAR AFUERA**

### G · falta en el juego

- [ ] **AGREGAR** — GITANO: Che, Puma. Vos que lo conocías de antes. Lo del puerto, lo del hermano preso… ¿era verdad algo de eso?
- [ ] **DEJAR AFUERA**

### G · falta en el juego

- [ ] **AGREGAR** — PUMA: (sin dar vuelta la cara) No sé, Facundo.
- [ ] **DEJAR AFUERA**

### G · falta en el juego

- [ ] **AGREGAR** — GITANO: ¿Cómo no vas a saber?
- [ ] **DEJAR AFUERA**

### G · falta en el juego

- [ ] **AGREGAR** — PUMA: No sé. Nunca se lo pregunté. Un tipo que vuela como volaba él no me tiene que explicar de dónde vino. (mira la foto) Y ya nunca lo sabremos.
- [ ] **DEJAR AFUERA**

### ~ M6_LOCKER2_050 · parecido 72%

- [ ] **GUION_3** — EL TURCO: (envuelve la foto en su pañuelo, se la guarda en el mameluco) …Me la quedo yo hasta que volvamos (a la foto, bajito) Señora: su hijo fue el mejor de todos nosotros.
- [ ] **JUEGO** — EL TURCO: (guardándola en el bolsillo del mameluco) Me la quedo yo hasta que vuelva a su casa. Señora: su hijo fue el mejor de todos nosotros.
- [ ] **PROPIA:** 

### ~ M6_CARTA_010 · parecido 79%

- [ ] **GUION_3** — (carta): Perdí a alguien hoy. Ramírez, el jujeño de la radio. Dieciocho, como yo. Una esquirla. Estábamos hablando de qué íbamos a comer primero al volver —él decía tamales, yo decía milanesas— y en la mitad de la palabra "tamales" dejó de estar. Así de rápido, pá. Así de nada.
- [ ] **JUEGO** — (carta): Pá: perdí a alguien hoy. Ramírez, el jujeño de la radio. Dieciocho, como yo. Estábamos hablando de qué íbamos a comer primero al volver y en la mitad de la palabra "tamales" dejó de estar. Así de rápido, pá. Así de nada.
- [ ] **PROPIA:** 

### G · falta en el juego

- [ ] **AGREGAR** — (carta): Nadie nos preparó para esto. Ni terminamos la instrucción, pá. Nos enseñaron a marchar y a tender la cama. No a que el de al lado se apague en la mitad de una palabra.
- [ ] **DEJAR AFUERA**

### ~ M6_CARTA_020 · parecido 56%

- [ ] **GUION_3** — (carta): El Colorado me dijo "llorá todo hoy, pibe, que mañana no va a haber tiempo". Lloré todo, viejo. ¿Vos también perdés gente ahí arriba? ¿Cómo se hace? Ya sé que no me vas a contestar. Igual te lo pregunto. A alguien se lo tengo que preguntar.
- [ ] **JUEGO** — (carta): El Colorado me dijo "llorá todo hoy, pibe, que mañana no va a haber tiempo". Lloré todo, viejo.
- [ ] **PROPIA:** 

### G · falta en el juego

- [ ] **AGREGAR** — (carta): En el cuaderno dibujé la radio del jujeño sola en el pozo. No me salió dibujar más nada hoy.
- [ ] **DEJAR AFUERA**

### J M6_1_010 · no está en GUION_3

- [ ] **DEJAR** — : En la base alguien consiguió facturas, Dios sabe cómo, y el Turco preparó chocolate caliente en un tacho de aceite lavado. Hoy un barco cae de regalo para un país que allá lejos ni sabe sus nombres.
- [ ] **BORRAR**

### J M6_2_040 · no está en GUION_3

- [ ] **DEJAR** — : Nadie le da importancia.
- [ ] **BORRAR**

### J STORYM6_TARJETA_010 · no está en GUION_3

- [ ] **DEJAR** — : 25 de mayo de 1982 · HMS COVENTRY
- [ ] **BORRAR**

### J M6_EPI_010 · no está en GUION_3

- [ ] **DEJAR** — : El Coventry cae. En la salida, un Sea Harrier engancha al Vasco. Lo tenés al lado. Lo ves. No podés hacer nada.
- [ ] **BORRAR**

### J M6_LOCKER1_010 · no está en GUION_3

- [ ] **DEJAR** — : Esa noche el Turco junta las cosas del Vasco en una caja de cartón, solo, sin que nadie se lo pida. En la puerta del locker, la foto de siempre: la que vieron cien veces.
- [ ] **BORRAR**

### J M6_LOCKER1_030 · no está en GUION_3

- [ ] **DEJAR** — : El Turco la despega con un cuidado de cirujano. Y al ir a envolverla en el pañuelo, la da vuelta. Seis misiones de chistes y nadie, nunca, había hecho ese gesto.
- [ ] **BORRAR**

### J M6_CARTA_030 · no está en GUION_3

- [ ] **DEJAR** — (carta): ¿Vos también perdés gente ahí arriba? ¿Cómo se hace? Contame cómo se hace, porque yo no sé. Mateo.
- [ ] **BORRAR**

### J M6_PADRE_010 · no está en GUION_3

- [ ] **DEJAR** — : Hijo: me preguntaste cómo se hace cuando se te muere alguien al lado. Estuve seis horas pensando la respuesta y todavía no la tengo.
- [ ] **BORRAR**

### J M6_PADRE_020 · no está en GUION_3

- [ ] **DEJAR** — : Hoy perdí a un amigo. Se llamaba Iñaki y resulta que la foto que llevaba era de la madre.
- [ ] **BORRAR**

### J M6_PADRE_030 · no está en GUION_3

- [ ] **DEJAR** — : La verdad es que no se hace nada. No hay truco. Uno se sube al avión al otro día porque...
- [ ] **BORRAR**

### J M6_PADRE_040 · no está en GUION_3

- [ ] **DEJAR** — : (Tacha la última línea entera. Dobla la hoja en cuatro sin terminarla y se la guarda en el bolsillo del pecho. Apaga la luz.)
- [ ] **BORRAR**

### J M6_HIST_010 · no está en GUION_3

- [ ] **DEJAR** — : A-4 Skyhawk de la Fuerza Aérea Argentina atacaron volando tan bajo que el radar no lograba separarlos de la costa.
- [ ] **BORRAR**

### J M6_HIST_020 · no está en GUION_3

- [ ] **DEJAR** — : Tres bombas impactaron sobre la línea de flotación. Murieron 19 tripulantes.
- [ ] **BORRAR**

### J M6_HIST_030 · no está en GUION_3

- [ ] **DEJAR** — : El destructor volcó y se hundió en menos de veinte minutos.
- [ ] **BORRAR**

---

## MISIÓN 8

`3` iguales · `4` distintas · `4` solo guion · `10` solo juego

### ~ M7_2_020 · parecido 82%

- [ ] **GUION_3** — PUMA: (lo mira largo) …Tenés treinta segundos de desvío y ni uno más. Y si me preguntan... yo no vi nada.
- [ ] **JUEGO** — PUMA: (lo mira largo; sabe exactamente lo que le está pidiendo) ...Tenés treinta segundos de desvío y ni uno más. Y si me preguntan, yo no vi nada.
- [ ] **PROPIA:** 

### G · falta en el juego

- [ ] **AGREGAR** — EL TURCO: (después de un rato) Se quedó sacando a los suyos. (deja el trapo) Ese hombre, si lo cruzabas en un puerto, te convidaba un cigarrillo.
- [ ] **DEJAR AFUERA**

### G · falta en el juego

- [ ] **AGREGAR** — GITANO: Turco, era el enemigo.
- [ ] **DEJAR AFUERA**

### G · falta en el juego

- [ ] **AGREGAR** — EL TURCO: Era el capitán del barco que hundimos, m'hijo. El enemigo es otra cosa. (pausa) Hay gente buena en todos lados, ¿viste? Lo que pasa es que no nos dejan conocernos.
- [ ] **DEJAR AFUERA**

### ~ M7_SOBREVUELO_040 · parecido 79%

- [ ] **GUION_3** — PUMA: Vamos, Tero. Vamos a casa.
- [ ] **JUEGO** — PUMA: (radio, suave) Vamos, Tero. Vamos a casa.
- [ ] **PROPIA:** 

### ~ M7_CARTA_010 · parecido 57%

- [ ] **GUION_3** — (carta): TE VI. Hoy pasó un Skyhawk tan bajo que la turba tembló, y le vi EL TERITO, pá, el terito pintado abajo de la cabina, TU pájaro, y batió las alas UNA A CADA LADO, y yo grité tu nombre delante de todos y no me importó nada. "¡Es mi viejo! ¡El del terito es MI VIEJO!", y los pibes saltaban y te saludaban y me abrazaban a mí, y por un minuto entero acá abajo NADIE tuvo frío.
- [ ] **JUEGO** — (carta): ¡¡PÁ!! TE VI. Hoy pasó un Skyhawk tan bajo que la turba tembló, y batió las alas, UNA A CADA LADO, y yo GRITÉ, pá, grité tu nombre delante de todos y no me importó nada.
- [ ] **PROPIA:** 

### G · falta en el juego

- [ ] **AGREGAR** — (carta): El Colorado dice que un avión que bate las alas te está diciendo "te veo". ¿Me viste, pá? Éramos un montón de cascos iguales ahí abajo. No importa. Yo sí te vi. Te vi el pájaro y te vi a vos.
- [ ] **DEJAR AFUERA**

### ~ M7_CARTA_030 · parecido 74%

- [ ] **GUION_3** — (carta): Hoy dibujé la mejor página del cuaderno: el monte entero desde arriba, como lo habrás visto vos, todos nosotros chiquitos saludando, y el avión con su terito batiendo las alas. Ésta te la doy en la mano cuando vuelvas. "¿Viste que te reconocí?", te voy a decir. Ya quiero ver la cara que vas a poner.
- [ ] **JUEGO** — (carta): Hoy dibujé la mejor página del cuaderno: el monte entero desde arriba, como lo habrás visto vos, y todos nosotros chiquitos saludando. Ésta te la doy en la mano cuando vuelvas.
- [ ] **PROPIA:** 

### J M7_1_010 · no está en GUION_3

- [ ] **DEJAR** — : La escuadrilla está de duelo, pero la guerra no espera a que termines de llorar. El Atlantic Conveyor trae los helicópteros pesados que le cambian la logística a los británicos. Hundirlo es obligarlos a cruzar las islas a pie.
- [ ] **BORRAR**

### J STORYM7_TARJETA_010 · no está en GUION_3

- [ ] **DEJAR** — : 25 de mayo de 1982 · ATLANTIC CONVEYOR
- [ ] **BORRAR**

### J M7_SOBREVUELO_010 · no está en GUION_3

- [ ] **DEJAR** — : En el regreso, Esteban se descuelga de la formación. Baja. Baja más. El monte de Mateo aparece adelante: pozos, casquitos, barro.
- [ ] **BORRAR**

### J M7_SOBREVUELO_020 · no está en GUION_3

- [ ] **DEJAR** — : Cruza el monte a altura de árbol, tan bajo que los pibes sienten el trueno en el pecho, y bate las alas: una a la izquierda, una a la derecha. El saludo más viejo de la aviación. Te veo. Estoy acá.
- [ ] **BORRAR**

### J M7_SOBREVUELO_030 · no está en GUION_3

- [ ] **DEJAR** — : Decenas de casquitos mirando para arriba, brazos en alto, gorros revoleados. Y un pibe flaco, parado sobre el borde del pozo, agitando un cuaderno contra el cielo.
- [ ] **BORRAR**

### J M7_CARTA_020 · no está en GUION_3

- [ ] **DEJAR** — (carta): Los pibes saltaban y me abrazaban a mí, "¡es el viejo del flaco!", y por un minuto entero acá abajo NADIE tuvo frío.
- [ ] **BORRAR**

### J M7_CARTA_040 · no está en GUION_3

- [ ] **DEJAR** — (carta): Volá bajo. TE VI. Mateo.
- [ ] **BORRAR**

### J M7_HIST_010 · no está en GUION_3

- [ ] **DEJAR** — : El carguero fue alcanzado por misiles Exocet lanzados desde Super Etendard.
- [ ] **BORRAR**

### J M7_HIST_020 · no está en GUION_3

- [ ] **DEJAR** — : Murieron 12 hombres, entre ellos su capitán, Ian North, que murió ayudando a evacuar a su tripulación.
- [ ] **BORRAR**

### J M7_HIST_030 · no está en GUION_3

- [ ] **DEJAR** — : Con él se perdieron los helicópteros pesados Chinook. Sin ese transporte, la infantería británica cruzó la isla a pie.
- [ ] **BORRAR**

---

## MISIÓN 9

`6` iguales · `5` distintas · `1` solo guion · `11` solo juego

### ~ M8_2_010 · parecido 88%

- [ ] **GUION_3** — PUMA: (honesto) No sé, Pichón. Pero sirvió. Cada vez que entramos, allá abajo hay un pibe que respira un día más. Para eso sirve. No para la bandera del mástil: para el pibe. Siempre fue por los pibes.
- [ ] **JUEGO** — PUMA: (honesto, porque el pibe merece la verdad) No sé, Pichón. Pero sirvió. Cada vez que entramos, allá abajo hay un pibe que respira un día más. Para eso sirve. No para la bandera del mástil: para el pibe. Siempre fue por el pibe.
- [ ] **PROPIA:** 

### ~ M8_2_020 · parecido 82%

- [ ] **GUION_3** — ESTEBAN: (pensando en alguien agitando algo contra el cielo) …por los pibes.
- [ ] **JUEGO** — ESTEBAN: (pensando en un cuaderno agitándose contra el cielo) ...por el pibe.
- [ ] **PROPIA:** 

### ~ M8_EPI_020 · parecido 82%

- [ ] **GUION_3** — PICHÓN: …ah. Me dieron. ¿Capitán? Me dieron. No quiero… todavía no quiero—
- [ ] **JUEGO** — PICHÓN: (sorprendido, casi un nene) ...ah. Me dieron. ¿Capitán? Me dieron. No quiero... todavía no quiero—
- [ ] **PROPIA:** 

### G · falta en el juego

- [ ] **AGREGAR** — PUMA: …lo sé, Facundo. Lo sé.
- [ ] **DEJAR AFUERA**

### ~ M8_CARTA_020 · parecido 60%

- [ ] **GUION_3** — (carta): Repartieron cartas de escuelas, "para un soldado argentino", de pibes que no nos conocen. A mí me tocó la de una nena de nueve años, Claribel, de Villa Mercedes, San Luis. Me dice: "Querido soldado: no te conozco pero te quiero. Mi seño dice que estás cuidando algo nuestro. Cuidate vos también. Cuando seas viejito contame cómo era el mar de ahí." Y abajo dibujó un sol, un avión y un soldado con una flor.
- [ ] **JUEGO** — (carta): Me dice: "Querido soldado: no te conozco pero te quiero. Mi seño dice que estás cuidando algo nuestro. Cuidate vos también. Cuando seas viejito contame cómo era el mar de ahí."
- [ ] **PROPIA:** 

### ~ M8_CARTA_040 · parecido 82%

- [ ] **GUION_3** — (carta): Tengo miedo, te lo digo por primera vez. Mucho miedo. Pero no del frío ni del hambre: miedo de no verte más. Si pasa algo, quiero que sepas que no te guardo nada. Sé que moviste todo. Un padre no puede más que todo.
- [ ] **JUEGO** — (carta): Tengo miedo, te lo digo por primera vez. Pero si pasa algo, quiero que sepas que no te guardo nada. Sé que moviste todo. Un padre no puede más que todo. Mateo.
- [ ] **PROPIA:** 

### J M8_1_010 · no está en GUION_3

- [ ] **DEJAR** — : El corazón del desembarco británico: la misión más defendida de la guerra, una muralla de fuego continua. Puma no quiere llevar al Pichón, pero necesitan todos los aviones.
- [ ] **BORRAR**

### J STORYM8_TARJETA_010 · no está en GUION_3

- [ ] **DEJAR** — : Cruzar el fuego de San Carlos · Centro logístico
- [ ] **BORRAR**

### J M8_EPI_010 · no está en GUION_3

- [ ] **DEJAR** — : A la salida, con el blanco ya atrás, un misil que venía para Esteban pierde su firma, gira... y engancha al Pichón, que venía justo detrás, cubriéndole la cola.
- [ ] **BORRAR**

### J M8_EPI_030 · no está en GUION_3

- [ ] **DEJAR** — : Estática. El mar.
- [ ] **BORRAR**

### J M8_LIBRETA_010 · no está en GUION_3

- [ ] **DEJAR** — : Esa noche el Turco junta las cosas del Pichón. Debajo del catre, una libreta de tapas de hule: hojas cuadriculadas llenas de flechitas, cortes de fuselaje, cálculos al margen, aviones imposibles.
- [ ] **BORRAR**

### J M8_LIBRETA_020 · no está en GUION_3

- [ ] **DEJAR** — : Página tras página de ideas que nadie va a escuchar en el "eso no se puede / a ver, mostrame". La guarda en el bolsillo del mameluco. El otro bolsillo.
- [ ] **BORRAR**

### J M8_CARTA_010 · no está en GUION_3

- [ ] **DEJAR** — (carta): Pá: repartieron cartas de escuelas, "para un soldado argentino", de pibes que no nos conocen. A mí me tocó la de una nena de nueve años, Claribel, de Villa Mercedes, San Luis.
- [ ] **BORRAR**

### J M8_PADRE_010 · no está en GUION_3

- [ ] **DEJAR** — : Hijo: te escribo de nuevo porque la primera no me salió. Hoy se me murió otro. Tomás, veintidós años, le decíamos Pichón. Se comió un fierro que venía para mí.
- [ ] **BORRAR**

### J M8_PADRE_020 · no está en GUION_3

- [ ] **DEJAR** — : Decís que un padre no puede más que todo. Yo no hice todo, Mateo. Hice lo que me animé.
- [ ] **BORRAR**

### J M8_PADRE_030 · no está en GUION_3

- [ ] **DEJAR** — : Vos me pediste que te mienta, que te diga que desde arriba es lindo. Y yo agarré el papel para mentirte, te juro. Pero si te miento con esto, ¿para qué carajo sirve que sea tu padre.
- [ ] **BORRAR**

### J M8_PADRE_040 · no está en GUION_3

- [ ] **DEJAR** — : (Sin signo de pregunta. La frase se corta ahí. Dobla la hoja.)
- [ ] **BORRAR**

---

## MISIÓN 10

`15` iguales · `9` distintas · `4` solo guion · `10` solo juego

### ~ M10_HUECO_020 · parecido 64%

- [ ] **GUION_3** — GITANO: (se frena en seco) …Turco. ¿Qué hacés?
- [ ] **JUEGO** — GITANO: …Turco. ¿Qué hacés?
- [ ] **PROPIA:** 

### ~ M10_HUECO_030 · parecido 60%

- [ ] **GUION_3** — EL TURCO: (sin darse vuelta, siguiendo) Le saco lo que sirve.
- [ ] **JUEGO** — EL TURCO: Le saco lo que sirve.
- [ ] **PROPIA:** 

### ~ M10_HUECO_060 · parecido 71%

- [ ] **GUION_3** — EL TURCO: (y recién ahí se da vuelta, con la pieza en la mano) A él ya no le hace falta, m'hijo. A ustedes sí. (la mira un segundo) Así el changuito sale igual. En los tres.
- [ ] **JUEGO** — EL TURCO: A él ya no le hace falta, m'hijo. A ustedes sí. Así el changuito sale igual. En los tres.
- [ ] **PROPIA:** 

### ~ M10_TANDIL_010 · parecido 78%

- [ ] **GUION_3** — Corte.: Otra parte del país. Tandil, amanecer helado, pasto escarchado. Y aterrizan diez Mirage nuevos, uno atrás del otro, prolijos, brillantes, sin una marca de uso. Rodando hacia la plataforma con la luz naranja del sol bajo en las cúpulas.
- [ ] **JUEGO** — : Otra parte del país. Amanecer helado, pasto escarchado. Y aterrizan diez Mirage nuevos, uno atrás del otro, prolijos, brillantes, sin una marca de uso.
- [ ] **PROPIA:** 

### G · falta en el juego

- [ ] **AGREGAR** — MECÁNICO DE TANDIL: (la yema del dedo apenas manchada) …Todavía está tierna.
- [ ] **DEJAR AFUERA**

### ~ M10_TANDIL_030 · parecido 83%

- [ ] **GUION_3** — PILOTO PERUANO: (bajando por la escalerilla, quitándose el casco) La pintamos allá, antes de salir. (pausa) Para que nadie pueda decir nunca que estos aviones fueron de otro. Salieron del Perú siendo de ustedes.
- [ ] **JUEGO** — PILOTO PERUANO: La pintamos allá, antes de salir. Para que nadie pueda decir nunca que estos aviones fueron de otro. Salieron del Perú siendo de ustedes.
- [ ] **PROPIA:** 

### G · falta en el juego

- [ ] **AGREGAR** — PILOTO PERUANO: (señalando con el mentón) En ése.
- [ ] **DEJAR AFUERA**

### G · falta en el juego

- [ ] **AGREGAR** — GITANO: (todavía con el casco en la mano) ¿Diez? ¿De dónde?
- [ ] **DEJAR AFUERA**

### ~ M10_NOTICIA_050 · parecido 85%

- [ ] **GUION_3** — GITANO: (sin entender) ¿El Perú? ¿Y a ellos qué les va en esto?
- [ ] **JUEGO** — GITANO: ¿El Perú? ¿Y a ellos qué les va en esto?
- [ ] **PROPIA:** 

### ~ M10_NOTICIA_060 · parecido 89%

- [ ] **GUION_3** — EL TURCO: Nada, m'hijo. Ésa es la cuestión. (se limpia las manos en el trapo, despacio) Dicen que vinieron con la escarapela nuestra ya pintada. Que se la pintaron ellos, allá, antes de salir. Para que nadie pudiera decir nada.
- [ ] **JUEGO** — EL TURCO: Nada, m'hijo. Ésa es la cuestión. Dicen que vinieron con la escarapela nuestra ya pintada. Que se la pintaron ellos, allá, antes de salir. Para que nadie pudiera decir nada.
- [ ] **PROPIA:** 

### ~ M10_NOTICIA_080 · parecido 77%

- [ ] **GUION_3** — GITANO: (la sonrisa volviendo a medias) Bueno. Entonces mañana volamos en Mirage, muchachos.
- [ ] **JUEGO** — GITANO: Bueno. Entonces mañana volamos en Mirage, muchachos.
- [ ] **PROPIA:** 

### G · falta en el juego

- [ ] **AGREGAR** — PUMA: (mirando el mapa de la pared) …Tandil.
- [ ] **DEJAR AFUERA**

### ~ M10_MIRAGE_010 · parecido 78%

- [ ] **GUION_3** — MIRAGE 5P «MARA» — DESBLOQUEADO: Diez llegaron del Perú el 5 de junio de 1982. Nunca llegaron a combatir. Acá, sí. Disponible en CICLO · ARENA · MINUTOS SAGRADOS.
- [ ] **JUEGO** — : Diez llegaron del Perú el 5 de junio de 1982. Nunca llegaron a combatir. Acá, sí.
- [ ] **PROPIA:** 

### J M10_HUECO_010 · no está en GUION_3

- [ ] **DEJAR** — : La línea de vuelo, antes del amanecer. Tres aviones listos. Y un cuarto abierto en canal: el del Pichón, los paneles en el piso, el motor a la vista, el Turco metido adentro hasta los hombros. Lo está desarmando.
- [ ] **BORRAR**

### J M10_TARJETA_010 · no está en GUION_3

- [ ] **DEJAR** — : 5 de junio de 1982 · El enemigo es el clima
- [ ] **BORRAR**

### J M10_TANDIL_020 · no está en GUION_3

- [ ] **DEJAR** — MECÁNICO: …Todavía está tierna.
- [ ] **BORRAR**

### J M10_TANDIL_050 · no está en GUION_3

- [ ] **DEJAR** — PILOTO PERUANO: En ése.
- [ ] **BORRAR**

### J M10_TANDIL_070 · no está en GUION_3

- [ ] **DEJAR** — : El Hércules despega con el amanecer. Y al irse, gordo, lento, torpe, bate las alas: una a la izquierda, una a la derecha.
- [ ] **BORRAR**

### J M10_TANDIL_080 · no está en GUION_3

- [ ] **DEJAR** — : Los diez Mirage estacionados en fila, las turbinas enfriándose, las cúpulas vacías.
- [ ] **BORRAR**

### J M10_NOTICIA_010 · no está en GUION_3

- [ ] **DEJAR** — : Vuelven los tres, con la aguja abajo y sin haber disparado un tiro.
- [ ] **BORRAR**

### J M10_NOTICIA_030 · no está en GUION_3

- [ ] **DEJAR** — GITANO: ¿Diez? ¿De dónde?
- [ ] **BORRAR**

### J M10_NOTICIA_070 · no está en GUION_3

- [ ] **DEJAR** — EL TURCO: Nadie del otro lado del mundo movió un dedo, m'hijo. El que movió fue el vecino. Es siempre igual: el que te da una mano es el que también tiene frío.
- [ ] **BORRAR**

### J M10_NOTICIA_090 · no está en GUION_3

- [ ] **DEJAR** — PUMA: …Tandil.
- [ ] **BORRAR**

---

## MISIÓN 11

`2` iguales · `3` distintas · `0` solo guion · `9` solo juego

### ~ M9_1_040 · parecido 89%

- [ ] **GUION_3** — PUMA: (como quien informa el clima) No. Se te suma otro y otro y otro, y un día te das cuenta de que ya no te entra más, y seguís volando igual. Eso es todo el secreto, Tero. No hay más secreto que ese. Simplemente vivís con ese dolor todos los días.
- [ ] **JUEGO** — PUMA: (como quien informa el clima) No. Se te suma otro y otro y otro, y un día te das cuenta de que ya no te entra más, y seguís volando igual. Eso es todo el secreto, Tero. No hay más secreto que ese.
- [ ] **PROPIA:** 

### ~ M9_CARTA_010 · parecido 87%

- [ ] **GUION_3** — (carta): Nos mueven a los montes que rodean Puerto Argentino. Dicen que los ingleses vienen por tierra. El Colorado no se me despega: "vos y yo salimos juntos de acá, correntino de adopción". Me dice así porque le prometí ir a Corrientes.
- [ ] **JUEGO** — (carta): Viejo: nos mueven a los montes que rodean Puerto Argentino. Dicen que los ingleses vienen por tierra. El Colorado no se me despega: "vos y yo salimos juntos de acá, correntino de adopción".
- [ ] **PROPIA:** 

### ~ M9_CARTA_020 · parecido 82%

- [ ] **GUION_3** — (carta): Anoche me contó todo el plan: llegamos, comemos un asado en tu casa, después nos tomamos el micro a Corrientes y le presento a la hermana. Lo tiene pensado hasta el detalle del micro, pá. Qué manía la de este tipo de planear cosas lindas en el peor lugar del mundo.
- [ ] **JUEGO** — (carta): Anoche me contó todo el plan: llegamos, comemos un asado en tu casa, después nos tomamos el micro a Corrientes y me presenta a la hermana. Lo tiene pensado hasta el detalle del micro, pá.
- [ ] **PROPIA:** 

### J M9_1_020 · no está en GUION_3

- [ ] **DEJAR** — : Silencio en la radio. Gitano tiene el mate en la mano y no lo ceba: se le enfría entero durante todo el briefing y nadie se lo dice.
- [ ] **BORRAR**

### J STORYM9_TARJETA_010 · no está en GUION_3

- [ ] **DEJAR** — : 8 de junio de 1982 · RFA SIR GALAHAD
- [ ] **BORRAR**

### J M9_EPI_010 · no está en GUION_3

- [ ] **DEJAR** — : Cumplís. Volvés. Vuelven los tres. Una victoria limpia justo cuando ya no confiabas en ninguna.
- [ ] **BORRAR**

### J M9_EPI_020 · no está en GUION_3

- [ ] **DEJAR** — : El Turco pinta tres estrellitas. Al terminar se queda quieto un segundo y se toca el bolsillo del mameluco — ese gesto que viene haciendo desde la noche del Vasco y que nadie le pregunta.
- [ ] **BORRAR**

### J M9_CARTA_030 · no está en GUION_3

- [ ] **DEJAR** — (carta): Qué manía la de este tipo de planear cosas lindas en el peor lugar del mundo.
- [ ] **BORRAR**

### J M9_CARTA_040 · no está en GUION_3

- [ ] **DEJAR** — (carta): A mamá seguile diciendo que comemos bien. Yo sé que lo hacés. Gracias. Mateo.
- [ ] **BORRAR**

### J M9_HIST_010 · no está en GUION_3

- [ ] **DEJAR** — : Skyhawks argentinos atacaron el buque logístico fondeado en Bahía Agradable, cargado de tropa.
- [ ] **BORRAR**

### J M9_HIST_020 · no está en GUION_3

- [ ] **DEJAR** — : Murieron 48 personas entre tripulantes y soldados. Fue la mayor pérdida de vidas británicas en una sola acción durante el conflicto.
- [ ] **BORRAR**

### J M9_HIST_030 · no está en GUION_3

- [ ] **DEJAR** — : El casco fue hundido mar afuera y declarado cementerio de guerra.
- [ ] **BORRAR**

---

## MISIÓN 12

`2` iguales · `2` distintas · `6` solo guion · `17` solo juego

### ~ M10_TIERRA_020 · parecido 72%

- [ ] **GUION_3** — CORREA: ¡Abajo, Mateo! ¡ABAJO!
- [ ] **JUEGO** — CORREA: ¡Abajo, correntino! ¡ABAJO!
- [ ] **PROPIA:** 

### G · falta en el juego

- [ ] **AGREGAR** — MATEO: ¡Colorado! ¡No, no, no! ¡Dijiste que salíamos juntos! ¡DIJISTE QUE SALÍAMOS JUNTOS!
- [ ] **DEJAR AFUERA**

### G · falta en el juego

- [ ] **AGREGAR** — (carta): Se me murió el Colorado. Me tapó con el cuerpo. Estoy vivo porque él ya no. Escribo y tacho y vuelvo a escribir porque no hay manera de que esta frase quede bien: un tipo que conocí hace dos meses se murió por mí, y yo no pude hacer nada más que estar abajo.
- [ ] **DEJAR AFUERA**

### ~ M10_CARTA_020 · parecido 78%

- [ ] **GUION_3** — (carta): Ahora entiendo algo horrible, pá. Todo este tiempo yo estuve protegido y no lo sabía del todo. El Colorado era mi techo. Acá siempre hubo dos clases de conscripto, los que tienen un ángel y los que no. Yo tuve el mejor. Se me murió el ángel, viejo.
- [ ] **JUEGO** — (carta): Ahora entiendo algo horrible, pá. Acá siempre hubo dos clases de conscripto: los que tienen un ángel y los que no. Yo tuve el mejor. Se me murió el ángel, viejo.
- [ ] **PROPIA:** 

### G · falta en el juego

- [ ] **AGREGAR** — (carta): Hoy agarré su navaja —la del abuelo, la que me regaló— y tallé en la viga del pozo, bien grande, para que lo lea cualquiera que caiga en este agujero después de nosotros:
- [ ] **DEJAR AFUERA**

### G · falta en el juego

- [ ] **AGREGAR** — (carta): VAMOS A VOLVER LOS PIBES DE MALVINAS
- [ ] **DEJAR AFUERA**

### G · falta en el juego

- [ ] **AGREGAR** — (carta): Me salió torcido y me importa nada. Lo tallé con la navaja de un correntino que cumplió. Que quede acá clavado aunque nosotros no quedemos.
- [ ] **DEJAR AFUERA**

### G · falta en el juego

- [ ] **AGREGAR** — (carta): Necesito salir de acá, pa. No aguanto más. Estoy solo. Me quiero ir a casa, pa. Me quiero ir a casa.
- [ ] **DEJAR AFUERA**

### J M10_1_010 · no está en GUION_3

- [ ] **DEJAR** — : Misma tarde. El segundo buque de Fitzroy. Briefing de treinta segundos: ya no hay nada que decir que no se haya dicho.
- [ ] **BORRAR**

### J M10_1_030 · no está en GUION_3

- [ ] **DEJAR** — : Nada más. Se suben.
- [ ] **BORRAR**

### J STORYM10_TARJETA_010 · no está en GUION_3

- [ ] **DEJAR** — : 8 de junio de 1982 · RFA SIR TRISTRAM
- [ ] **BORRAR**

### J M10_TIERRA_030 · no está en GUION_3

- [ ] **DEJAR** — : Correa empuja a Mateo al fondo del pozo y le pone el cuerpo encima. Blanco. Humo. Tierra que llueve. Mateo abajo, entero. Correa arriba, no.
- [ ] **BORRAR**

### J M10_TIERRA_040 · no está en GUION_3

- [ ] **DEJAR** — CORREA: (apenas, buscándole la mano) ...andá a Corrientes igual, pibe. Presentate solo. Decile a mi hermana que su hermano cuidó a un pibe hasta el final. Que no fue en vano. Que no fue...
- [ ] **BORRAR**

### J M10_PISTA_010 · no está en GUION_3

- [ ] **DEJAR** — : Esteban vuelve sin saber nada. En la pista pregunta si hay carta. No hay. Es la primera vez que no hay.
- [ ] **BORRAR**

### J M10_PISTA_020 · no está en GUION_3

- [ ] **DEJAR** — : Vos sí sabés por qué. Y no podés avisarle.
- [ ] **BORRAR**

### J M10_CARTA_010 · no está en GUION_3

- [ ] **DEJAR** — (carta): Viejo: se me murió el Colorado. Me tapó con el cuerpo. Estoy vivo porque él ya no.
- [ ] **BORRAR**

### J M10_CARTA_030 · no está en GUION_3

- [ ] **DEJAR** — (carta): Un pibe de acá talló VOLVEREMOS en la culata del fusil. Yo lo único que quiero es que volvamos nosotros.
- [ ] **BORRAR**

### J M10_CARTA_040 · no está en GUION_3

- [ ] **DEJAR** — (carta): Vení a buscarme. Ya sé que no se puede. Vení igual. Sos lo único que me queda. Mateo.
- [ ] **BORRAR**

### J M10_PADRE_010 · no está en GUION_3

- [ ] **DEJAR** — : Mateo: se me murió el hombre que yo mandé para que no te murieras vos. Lo elegí yo. Lo puse yo ahí. Un padre mueve lo que puede y después tiene que vivir con lo que movió.
- [ ] **BORRAR**

### J M10_PADRE_020 · no está en GUION_3

- [ ] **DEJAR** — : Vos me pedís que vaya a buscarte y yo te tengo que decir que no se puede, y no te lo voy a decir, porque no pienso escribir esa frase.
- [ ] **BORRAR**

### J M10_PADRE_030 · no está en GUION_3

- [ ] **DEJAR** — : Así que voy a ir.
- [ ] **BORRAR**

### J M10_PADRE_040 · no está en GUION_3

- [ ] **DEJAR** — : (Es lo único que escribió sin tachar en toda la carta. Cuatro palabras. Dobla la hoja.)
- [ ] **BORRAR**

### J M10_HIST_010 · no está en GUION_3

- [ ] **DEJAR** — : El buque logístico fue alcanzado por bombas en Fitzroy, en el mismo ataque que castigó al Sir Galahad.
- [ ] **BORRAR**

### J M10_HIST_020 · no está en GUION_3

- [ ] **DEJAR** — : Murieron 2 tripulantes. El buque quedó fuera de combate.
- [ ] **BORRAR**

### J M10_HIST_030 · no está en GUION_3

- [ ] **DEJAR** — : Aquel 8 de junio fue uno de los días más duros del conflicto, para los dos lados.
- [ ] **BORRAR**

---

## MISIÓN 13

`6` iguales · `7` distintas · `9` solo guion · `14` solo juego

### G · falta en el juego

- [ ] **AGREGAR** — PUMA: (silencio largo) Es un viaje de ida, Tero. Esa flota tiene encima toda la defensa antiaérea que les queda. Y la Chancha está rota desde la noche del cordobés — vuela corto, no llega al sur. Sin Chancha no hay nafta de vuelta. ¿Entendés lo que te digo? No hay vuelta… asegurada. (pausa) Hay vuelta si sale todo perfecto. Nunca sale todo perfecto.
- [ ] **DEJAR AFUERA**

### ~ M11_2_050 · parecido 65%

- [ ] **GUION_3** — PUMA: (los mira; mira la foto del Vasco y la gorra del Pichón colgadas en la pared; sonríe por primera vez en tres misiones) …Plata Fiel completa, entonces. Una vez más.
- [ ] **JUEGO** — PUMA: (sonríe por primera vez en tres misiones) ...Plata Fiel completa, entonces. Una vez más. La última.
- [ ] **PROPIA:** 

### ~ M11_ASADO1_030 · parecido 64%

- [ ] **GUION_3** — GITANO: Che, ¿saben que pasado mañana debuta Argentina en el Mundial? En España. Contra Bélgica.
- [ ] **JUEGO** — GITANO: Che, ¿saben que mañana debuta Argentina en el Mundial? Acá también juega Argentina mañana. Pero este partido no lo pasan por la tele.
- [ ] **PROPIA:** 

### G · falta en el juego

- [ ] **AGREGAR** — PUMA: (mirando el fuego) Mirá vos. Argentina juega.
- [ ] **DEJAR AFUERA**

### G · falta en el juego

- [ ] **AGREGAR** — GITANO: Acá también juega Argentina. Todos los días. Pero estos partidos no los pasan por la tele.
- [ ] **DEJAR AFUERA**

### G · falta en el juego

- [ ] **AGREGAR** — GITANO: (lo agarra con una sola mano, sin levantarse) Gracias.
- [ ] **DEJAR AFUERA**

### G · falta en el juego

- [ ] **AGREGAR** — GITANO: El "perdoname" del Vasco no me lo puedo sacar. (pausa) Yo sé lo que es tener algo que pedirle perdón a la vieja de uno.
- [ ] **DEJAR AFUERA**

### G · falta en el juego

- [ ] **AGREGAR** — GITANO: Mi viejo pegaba. Fuerte... Seguido... A todos... Yo me crié adivinando de qué humor venía por cómo sonaba la puerta al llegar. (ceba, pasa el mate) Y un día decidí que yo iba a ser exactamente lo contrario de eso. Todo lo contrario, todo el tiempo, aunque me costara. (mira el fuego) Así que no, muchachos: no soy gracioso. Soy lo contrario de mi viejo. Es distinto. Cuesta más.
- [ ] **DEJAR AFUERA**

### G · falta en el juego

- [ ] **AGREGAR** — GITANO: (la sonrisa volviendo) Bueno, basta que me emociono.
- [ ] **DEJAR AFUERA**

### ~ M11_ASADO2_030 · parecido 88%

- [ ] **GUION_3** — ESTEBAN: (mirando la foto; al Turco) ¿Me la prestás mañana? La llevo conmigo. Que la vieja vuele una vez con la escuadrilla del hijo.
- [ ] **JUEGO** — ESTEBAN: (mirando la foto) ¿Me la prestás mañana? Que la vieja vuele una vez con la escuadrilla del hijo.
- [ ] **PROPIA:** 

### ~ M11_ASADO2_040 · parecido 74%

- [ ] **GUION_3** — EL TURCO: (asiente; no puede hablar. Después, alzando el vino en tetra) Por los que no están en la mesa.
- [ ] **JUEGO** — EL TURCO: (alzando el vaso de vino en tetra) Por los que no están en la mesa.
- [ ] **PROPIA:** 

### G · falta en el juego

- [ ] **AGREGAR** — (carta): Ahora sé lo que es estar solo. Bordón desapareció, dicen que se mandó a mudar —los Bordón siempre encuentran cómo—. Quedamos los pibes solos, cuidándonos entre nosotros. Todos correntinos de adopción ahora: nos tapamos, nos repartimos, nos aguantamos. En el peor lugar del mundo todavía hay pibes tapando a otros pibes. Eso también es la Patria, pá. Eso, y no los discursos.
- [ ] **DEJAR AFUERA**

### ~ M11_CARTA_030 · parecido 64%

- [ ] **GUION_3** — (carta): ¿Sabés qué me sostiene? La página del cuaderno. La del monte visto desde arriba, la del día que pasaste con el terito y batiste las alas. Cuando pega el miedo la abro y me digo: yo lo vi. Lo vi al pájaro y lo vi a él. Eso no me lo saca nadie, ni el frío, ni Bordón, ni los ingleses.
- [ ] **JUEGO** — (carta): ¿Sabés qué me sostiene? La página del cuaderno del día que batiste las alas. Cuando pega el miedo la abro y me digo: mi viejo me vio. No estoy solo ni aunque esté solo.
- [ ] **PROPIA:** 

### G · falta en el juego

- [ ] **AGREGAR** — (carta): Acá los pibes cantan bajito para no llorar. Ojalá algún día, allá, alguien cante por nosotros. Aunque sea una vez. Aunque sea bajito.
- [ ] **DEJAR AFUERA**

### ~ M11_CARTA2_010 · parecido 87%

- [ ] **GUION_3** — (carta): Si no nos vemos: gracias por el cielo. Por el sapito, por el Rastrojero, por enseñarme a mirar para arriba. Voy a estar mirando para arriba hasta el final, buscándote. Si escucho un motor bien bajo, bien rasante, voy a saber que sos vos, y voy a estar tranquilo.
- [ ] **JUEGO** — (carta): Si no nos vemos: gracias por el cielo. Por el sapito, por el Rastrojero, por enseñarme a mirar para arriba. Si escucho un motor bien bajo, bien rasante, voy a saber que sos vos, y voy a estar tranquilo.
- [ ] **PROPIA:** 

### ~ M11_CARTA2_040 · parecido 89%

- [ ] **GUION_3** — (carta): Te quiero, viejo. Volá bajo.
- [ ] **JUEGO** — (carta): Te quiero, viejo. Volá bajo. Mateo.
- [ ] **PROPIA:** 

### J M11_1_010 · no está en GUION_3

- [ ] **DEJAR** — : La superioridad tecnológica ya inclinó la guerra. De noche, las fragatas se acercan a la costa a martillar las posiciones argentinas antes de cada asalto. Por primera vez, los Fieles van a volar sobre las cabezas de los suyos.
- [ ] **BORRAR**

### J M11_1_020 · no está en GUION_3

- [ ] **DEJAR** — : Y llega el dato que arma el final: el regimiento de Mateo quedó en primera línea, bajo ese bombardeo naval.
- [ ] **BORRAR**

### J M11_2_020 · no está en GUION_3

- [ ] **DEJAR** — PUMA: Es un viaje de ida, Tero. Y la Chancha está en tierra, rota. Sin Chancha no hay nafta de vuelta. ¿Entendés lo que te digo? No hay vuelta.
- [ ] **BORRAR**

### J M11_2_040 · no está en GUION_3

- [ ] **DEJAR** — GITANO: (sin un solo chiste) No va solo. Ni en pedo va solo. Cuarenta días le cebé mate a este tipo.
- [ ] **BORRAR**

### J STORYM11_TARJETA_010 · no está en GUION_3

- [ ] **DEJAR** — : 11 de junio de 1982 · HMS BROADSWORD
- [ ] **BORRAR**

### J M11_ASADO1_010 · no está en GUION_3

- [ ] **DEJAR** — : Detrás del hangar, un medio tambor con brasas. El Turco consiguió carne, nadie pregunta cómo. Gitano canta bajito una zamba, desafinando con dignidad.
- [ ] **BORRAR**

### J M11_ASADO1_020 · no está en GUION_3

- [ ] **DEJAR** — : Sobre la mesa, contra la damajuana, la foto de la vieja del Vasco. Al lado, la libreta del Pichón. Los que no están en la mesa, en la mesa.
- [ ] **BORRAR**

### J M11_ASADO2_010 · no está en GUION_3

- [ ] **DEJAR** — GITANO: El "perdoname" del Vasco no me lo puedo sacar. Yo sé lo que es tener algo que pedirle perdón a la vieja de uno. Mi viejo pegaba. Y un día decidí que yo iba a ser exactamente lo contrario de eso. Así que no, muchachos: no soy gracioso. Soy lo contrario de mi viejo. Es distinto. Cuesta más.
- [ ] **BORRAR**

### J M11_CARTA_010 · no está en GUION_3

- [ ] **DEJAR** — (carta): Viejo: no sé si esta carta va a salir. Ya casi no sale nada de acá. La escribo igual, porque escribirte es la única costumbre buena que me queda.
- [ ] **BORRAR**

### J M11_CARTA_020 · no está en GUION_3

- [ ] **DEJAR** — (carta): Quedamos los pibes solos, cuidándonos entre nosotros. Nos tapamos, nos repartimos, nos aguantamos. En el peor lugar del mundo todavía hay pibes tapando a otros pibes. Eso también es la Patria, pá. Eso, y no los discursos.
- [ ] **BORRAR**

### J M11_PADRE_010 · no está en GUION_3

- [ ] **DEJAR** — : Hijo: mañana salgo a buscarte. Te debo dos respuestas y te las pago las dos juntas antes de subirme, porque después no sé.
- [ ] **BORRAR**

### J M11_PADRE_020 · no está en GUION_3

- [ ] **DEJAR** — : Cómo se ve desde arriba: se ve chiquito todo. No es lindo, Mateo. Me pediste que te mintiera y no puedo. Lo único lindo que vi desde arriba en toda esta guerra fue a vos, con el cuaderno, saludando.
- [ ] **BORRAR**

### J M11_PADRE_030 · no está en GUION_3

- [ ] **DEJAR** — : Y cómo se hace cuando se te muere alguien al lado: no se hace. Se aguanta. Y se va a buscar al que queda.
- [ ] **BORRAR**

### J M11_PADRE_040 · no está en GUION_3

- [ ] **DEJAR** — : Perdoname por no haberte podido sacar de ahí. Lo intenté todo. Resulta que todo era poco.
- [ ] **BORRAR**

---

## MISIÓN 14

`0` iguales · `1` distintas · `40` solo guion · `30` solo juego

### G · falta en el juego

- [ ] **AGREGAR** — CÓNDOR: (leyendo): …bombardeo naval previsto sobre posiciones del sector [coordenada], efectivo 06:00. Unidades en el área: elementos del Regimiento… (estática) …conscriptos clase '63…
- [ ] **DEJAR AFUERA**

### G · falta en el juego

- [ ] **AGREGAR** — CÓNDOR: Plata Fiel, aquí Cóndor. No tengo… Plata Fiel, no tengo autorización para esa salida. Vuelvan a—
- [ ] **DEJAR AFUERA**

### G · falta en el juego

- [ ] **AGREGAR** — PUMA: Que me perdone el abuelo. (click. Apaga a Cóndor.) Che, Tero. Veinte años con ese pájaro pintado. ¿Alguna vez te preguntaste qué hace el tero cuando el zorro se le acerca al nido?
- [ ] **DEJAR AFUERA**

### G · falta en el juego

- [ ] **AGREGAR** — ESTEBAN: (la voz baja) …Grita lejos del nido. Se hace el herido.
- [ ] **DEJAR AFUERA**

### G · falta en el juego

- [ ] **AGREGAR** — PUMA: Da la vida distrayendo, y el nido queda a salvo. (le aprieta el hombro) Hoy tu nido está en ese mapa. Hoy todos somos teros. Nosotros distraemos — vos entrás y sacás a tu pibe. ¿Escuchaste, Aldao? A tu pibe.
- [ ] **DEJAR AFUERA**

### ~ M12_2_040 · parecido 72%

- [ ] **GUION_3** — EL TURCO: (le mete el pincel de las estrellitas en el bolsillo del traje) Me lo devolvés mañana. ¿Me oíste? Mañana. Me lo trae usted personalmente, Primer Teniente, o lo voy a buscar yo a nado. (a los tres, señalándolos con el dedo, uno por uno) Tres desayunos. Mañana sirvo TRES desayunos. El que falte me arruina la cuenta.
- [ ] **JUEGO** — EL TURCO: (le mete el pincel de las estrellitas en el bolsillo del traje) Me lo devolvés mañana. ¿Me oíste? Me lo trae usted personalmente, Primer Teniente, o lo voy a buscar yo a nado.
- [ ] **PROPIA:** 

### G · falta en el juego

- [ ] **AGREGAR** — TURCO: (lejísimo, cortado): …me copian… cambió el… ¡ADELANTARON EL BOMBARDEO! ¡No es a las seis, es—! (estática. Nada más.)
- [ ] **DEJAR AFUERA**

### G · falta en el juego

- [ ] **AGREGAR** — GITANO: Mandale saludos a tu pibe, Tero.
- [ ] **DEJAR AFUERA**

### G · falta en el juego

- [ ] **AGREGAR** — PUMA: (tres segundos después, la voz quebrada exactamente un milímetro): Plata 3 fuera.
- [ ] **DEJAR AFUERA**

### G · falta en el juego

- [ ] **AGREGAR** — PUMA: (riendo): Tero, voy a encargarme de esto y despejarte el camino para que puedas pasar. Necesito que te mantengas cerca mío y apenas veas el espacio, ¡te metés y me pasás! No pierdas tiempo, yo me encargo del resto y despues me sumo con vos.
- [ ] **DEJAR AFUERA**

### G · falta en el juego

- [ ] **AGREGAR** — ESTEBAN: Puma, ¿vos estás seguro? Podemos juntos.
- [ ] **DEJAR AFUERA**

### G · falta en el juego

- [ ] **AGREGAR** — PUMA: (riendo): No hay tiempo, tu pibe te necesita.
- [ ] **DEJAR AFUERA**

### G · falta en el juego

- [ ] **AGREGAR** — ESTEBAN: Gracias. De corazón.
- [ ] **DEJAR AFUERA**

### G · falta en el juego

- [ ] **AGREGAR** — PUMA: (riendo): Qué quilombo, che. Voy a tener que sacar los prohibidos.
- [ ] **DEJAR AFUERA**

### G · falta en el juego

- [ ] **AGREGAR** — PUMA: ¡MANDALE, TERO!
- [ ] **DEJAR AFUERA**

### G · falta en el juego

- [ ] **AGREGAR** — PUMA: (tranquilo, casi divertido — primera vez humano): Pifié. Me quedé sin nafta.
- [ ] **DEJAR AFUERA**

### G · falta en el juego

- [ ] **AGREGAR** — ESTEBAN: …Llegué, Mateo. Llegué. Estoy acá arriba, hijo. Por favor, Mateo. Por favor.
- [ ] **DEJAR AFUERA**

### G · falta en el juego

- [ ] **AGREGAR** — (carta): Si estás leyendo esto es porque el Turco cumplió, así que primero: no te enojes con él, que él solo cumple.
- [ ] **DEJAR AFUERA**

### G · falta en el juego

- [ ] **AGREGAR** — (carta): No pasó nada, quedate tranquila. Te escribo por las dudas, nada más. Acá ya despedimos a varios amigos y aprendí que el momento de uno no avisa. Hace unos días un pibe de veintidós años se comió un fierro que venía para mí: si estoy escribiendo esta carta, es gracias a él. Y si vos la estás leyendo… quiere decir que a mí también me llegó. Quiero que sepas que la peleé hasta el final para volver.
- [ ] **DEJAR AFUERA**

### G · falta en el juego

- [ ] **AGREGAR** — (carta): Al nene no lo pude sacar de esto con mis contactos. Lo cuido desde el aire, que es el único idioma que hablo bien. Vos siempre decís que no sé decir las cosas, que todo lo digo arreglando el Rastrojero o cebando mate. Tenés razón. Por eso esta carta es corta.
- [ ] **DEJAR AFUERA**

### G · falta en el juego

- [ ] **AGREGAR** — (carta): Te elegí a los veinte y te volvería a elegir ahora mismo, en esta pista helada, con el casco puesto. Al pibe lo hicimos bien, Norma. Lo hicimos tan bien que se puso la patria al hombro sin que nadie le enseñe. Eso es tuyo. Lo mejor de él es gracias a vos.
- [ ] **DEJAR AFUERA**

### G · falta en el juego

- [ ] **AGREGAR** — (carta): Viví, amor. No vivas en pausa. No te quedes de guardia en esa ventana esperando. Vos me enseñaste todo lo que sé de amar a alguien. Viví por los tres. Y cuando pase un avión volando bajo, miralo con ese orgullo tuyo que asusta. Somos nosotros, yendo a verte.
- [ ] **DEJAR AFUERA**

### G · falta en el juego

- [ ] **AGREGAR** — ESTEBAN: (cerrándolo despacio) …No sé si estoy preparado hoy para ver esto.
- [ ] **DEJAR AFUERA**

### G · falta en el juego

- [ ] **AGREGAR** — EL TURCO: (alcanzándole el mate, sin dejar de hojear) …El pibe dibujaba bien, ¿eh?
- [ ] **DEJAR AFUERA**

### G · falta en el juego

- [ ] **AGREGAR** — ESTEBAN: Mejor que yo para todo. (pausa larga) ¿Sabés que nunca supe si me vio? Ese día. Nunca supe.
- [ ] **DEJAR AFUERA**

### G · falta en el juego

- [ ] **AGREGAR** — EL TURCO: (ceba, tranquilo) …¿Y eso qué importa, m'hijo? Vos lo viste a él. Con eso alcanza para toda una vida.
- [ ] **DEJAR AFUERA**

### G · falta en el juego

- [ ] **AGREGAR** — EL TURCO: (la voz cambiada, dándole vuelta el cuaderno para que lo vea) …M'hijo. Acá dice que te vio.
- [ ] **DEJAR AFUERA**

### G · falta en el juego

- [ ] **AGREGAR** — ESTEBAN: (los ojos llenándose) ¿Me vio?… ¡Me vio! ¡NORMA! ¡Mateo ese día me vio!
- [ ] **DEJAR AFUERA**

### G · falta en el juego

- [ ] **AGREGAR** — NARRACIÓN: (sobre fotografías reales: veteranos, el mar, Darwin, las cruces blancas): "No volvieron el Vasco, ni el Pichón, ni el Gitano, ni el Puma. No volvió el cabo Aníbal Correa, que murió tapando con su cuerpo a un pibe que conocía hacía dos meses. Del otro lado del mar tampoco volvieron los suyos: pibes iguales a los nuestros, mandados por otros que miraron la guerra desde tierra firme, calientes, lejos."
- [ ] **DEJAR AFUERA**

### G · falta en el juego

- [ ] **AGREGAR** — PIBE: Seño Claribel… ¿y volvieron?
- [ ] **DEJAR AFUERA**

### G · falta en el juego

- [ ] **AGREGAR** — SEÑO: (pausa) Algunos. Otros se quedaron cuidando las islas.
- [ ] **DEJAR AFUERA**

### G · falta en el juego

- [ ] **AGREGAR** — PIBE: (sin despegar los ojos del cuaderno) ¿Y ganaron?
- [ ] **DEJAR AFUERA**

### G · falta en el juego

- [ ] **AGREGAR** — SEÑO: (pausa larga) No.
- [ ] **DEJAR AFUERA**

### G · falta en el juego

- [ ] **AGREGAR** — PIBE: …Ah.
- [ ] **DEJAR AFUERA**

### G · falta en el juego

- [ ] **AGREGAR** — SEÑO: (se agacha a su altura; le acomoda el cuello de la camiseta) El chico que escribió esto tenía la misma edad que tu hermano. (pausa) Hasta el último día estuvo escribiendo este cuaderno. Lo que importa es que ellos lo dieron todo con el corazón. (pausa) Nunca, nunca, nunca. Nunca dudes del corazón de un argentino.
- [ ] **DEJAR AFUERA**

### G · falta en el juego

- [ ] **AGREGAR** — LA REVERENCIA — el gesto insignia: (homenaje al prisionero de Metal Slug)
- [ ] **DEJAR AFUERA**

### G · falta en el juego

- [ ] **AGREGAR** — El disparador es el mate: , y eso lo vuelve un chiste con motor propio: cada vez que alguien le ceba, el Gitano hace la reverencia. Y hay un motivo declarado en pantalla una sola vez, en M2: si dijera "gracias" en castellano quedaría afuera de la ronda. Dice thank you justamente para no irse.
- [ ] **DEJAR AFUERA**

### G · falta en el juego

- [ ] **AGREGAR** — Nota de tratamiento.: El cobro de M13 resuelve la regla del mate que estaba anotada como pendiente en PREGUNTASHISTORICAS. Y no compite con "tres desayunos" del Turco (M14): se complementan. El Gitano se despide en silencio; el Turco se niega a dejar que alguien se despida. Uno dice "no vuelvo" sin decirlo; el otro grita "vuelven todos".
- [ ] **DEJAR AFUERA**

### G · falta en el juego

- [ ] **AGREGAR** — La prueba para cualquier referencia nueva: ¿la dice el Gitano, o la dice la máquina? Si la dice el Gitano y es una cita, no entra. Si la dice la máquina, entra.
- [ ] **DEJAR AFUERA**

### G · falta en el juego

- [ ] **AGREGAR** — Y no se prestan el gesto.: Cinco tipos queriendo lo mismo de la misma forma es un solo personaje repetido cinco veces.
- [ ] **DEJAR AFUERA**

### G · falta en el juego

- [ ] **AGREGAR** — M10 y M12 no llevan gesto a propósito: — M10 ya tiene el C-231 canibalizado (la ley 3) y M12 es el corte a tierra, otro registro. Y los espacios en blanco son parte del ritmo: si apareciera en las catorce, dejaría de ser un detalle y pasaría a ser un tic.
- [ ] **DEJAR AFUERA**

### J M12_1_010 · no está en GUION_3

- [ ] **DEJAR** — CÓNDOR: Plata Fiel, la misión está DENEGADA. No hay indicativo asignado. Sin reabastecedor no hay margen de combustible para el regreso. Repito: DENEGADA.
- [ ] **BORRAR**

### J M12_1_020 · no está en GUION_3

- [ ] **DEJAR** — : Todas las misiones tuvieron su pájaro de código: Cauquén, Chimango, Hornero, Chajá. Esta noche el comando no asigna ninguno. Esta noche no los manda nadie: vuelan con el nombre propio.
- [ ] **BORRAR**

### J M12_1_030 · no está en GUION_3

- [ ] **DEJAR** — PUMA: (apaga la radio con dos dedos, tranquilo) Que me perdone el abuelo.
- [ ] **BORRAR**

### J M12_2_010 · no está en GUION_3

- [ ] **DEJAR** — PUMA: ¿Sabés por qué te pusieron Tero? El tero grita lejos del nido. Se hace el herido, arma escándalo, se ofrece al zorro para que el zorro lo corra a él. Da la vida distrayendo, y el nido queda a salvo.
- [ ] **BORRAR**

### J M12_2_020 · no está en GUION_3

- [ ] **DEJAR** — PUMA: Esta noche los teros somos nosotros: gritamos, brillamos, hacemos el escándalo. Vos pasás por abajo, calladito, y llegás al nido. ¿Estamos?
- [ ] **BORRAR**

### J M12_2_030 · no está en GUION_3

- [ ] **DEJAR** — GITANO: (la última sonrisa) Escuchame, Tero: llegá. Por el Vasco, por el Pichón, por todos los que no llegamos a nada: LLEGÁ.
- [ ] **BORRAR**

### J STORYM12_TARJETA_010 · no está en GUION_3

- [ ] **DEJAR** — : Madrugada del 12 de junio · HMS GLAMORGAN
- [ ] **BORRAR**

### J M12_GITANO_010 · no está en GUION_3

- [ ] **DEJAR** — : Un enjambre de misiles se cierra sobre la formación. Gitano rompe hacia arriba, enciende todo lo que se puede encender, se vuelve el blanco más luminoso del cielo.
- [ ] **BORRAR**

### J M12_GITANO_020 · no está en GUION_3

- [ ] **DEJAR** — GITANO: ¡Acá estoy, ingleses! ¡Miren qué lindo brillo cordobés! ¡Vengan todos que hay para todos! ¡TERO, ANDÁ! ¡Viva la Patria... la de los pibes, carajo, la de los pibes—!
- [ ] **BORRAR**

### J M12_PUMA_010 · no está en GUION_3

- [ ] **DEJAR** — : Queda la última línea antiaérea, la que no se puede cruzar y disparar a la vez. Puma se adelanta, se mete de frente en el fuego, y apaga las baterías con el único fierro que le queda: su propio avión.
- [ ] **BORRAR**

### J M12_PUMA_020 · no está en GUION_3

- [ ] **DEJAR** — PUMA: Plata Fiel... misión cumplida. Tero: era verdad lo que dijo el Pichón. No es la bandera. Nunca fue la bandera. Es el pibe. Andá a buscar a tu pibe.
- [ ] **BORRAR**

### J M12_PUMA_030 · no está en GUION_3

- [ ] **DEJAR** — : Quedás solo en el cielo negro. Delante, la costa. El Glamorgan escupiendo fuego. Y detrás del fuego, el monte.
- [ ] **BORRAR**

### J M12_TARDE_010 · no está en GUION_3

- [ ] **DEJAR** — : Rompés la última defensa. Tenés el blanco adelante. Vas a llegar. Estás llegando. Llegás.
- [ ] **BORRAR**

### J M12_TARDE_020 · no está en GUION_3

- [ ] **DEJAR** — : Y entonces, antes de que sueltes, el monte recibe la salva completa. El lugar donde está Mateo estalla en una sola luz blanca. Y se apaga.
- [ ] **BORRAR**

### J M12_TARDE_030 · no está en GUION_3

- [ ] **DEJAR** — ESTEBAN: (un susurro) ...llegué. Llegué, hijo. Estoy acá arriba. Mirame. Estoy volando bajo. Mirame como aquella vez. MIRAME, MATEO.
- [ ] **BORRAR**

### J M12_TARDE_040 · no está en GUION_3

- [ ] **DEJAR** — : Ninguna respuesta de tierra. Nunca más una respuesta de tierra.
- [ ] **BORRAR**

### J M12_FINAL_010 · no está en GUION_3

- [ ] **DEJAR** — CÓNDOR: (casi con lástima) Tero... está en reserva. Si sale AHORA, llega. Repito: si quiere volver, es ahora.
- [ ] **BORRAR**

### J M12_FINAL_020 · no está en GUION_3

- [ ] **DEJAR** — : El avión enfila a casa, obediente. Y entonces —fuera de toda orden, porque hay cosas que un padre no delega— el motor se apaga.
- [ ] **BORRAR**

### J M12_FINAL_030 · no está en GUION_3

- [ ] **DEJAR** — : Tenía el combustible justo para volver. No tenía las ganas. Un padre no vuelve de algunos lugares.
- [ ] **BORRAR**

### J EPI_MESA1_010 · no está en GUION_3

- [ ] **DEJAR** — : La cocina del principio. Golpean la puerta: un uniformado, dos telegramas. Norma los deja sobre la mesa, uno al lado del otro, como dos cubiertos.
- [ ] **BORRAR**

### J EPI_MESA1_020 · no está en GUION_3

- [ ] **DEJAR** — : Pone la pava. Sirve la mesa para dos. Se sienta. Espera. La pava chifla y esta vez tampoco nadie la saca.
- [ ] **BORRAR**

### J EPI_MESA1_030 · no está en GUION_3

- [ ] **DEJAR** — : El 13 de junio, el país miró el debut de Argentina en el Mundial de España. El 14, la guerra terminó. Los televisores estaban prendidos en otra cosa.
- [ ] **BORRAR**

### J EPI_MESA2_010 · no está en GUION_3

- [ ] **DEJAR** — : Meses después llegan dos encomiendas. En la del Ejército, un cuaderno Rivadavia hinchado de humedad: un arroyo, un Rastrojero, un padre y un nene tirando piedritas. El Colorado con capa. El monte visto desde arriba.
- [ ] **BORRAR**

### J EPI_MESA2_020 · no está en GUION_3

- [ ] **DEJAR** — : En la de la Fuerza Aérea: un pincel finito manchado de blanco, la foto de una mujer joven que Norma no conoce —la da vuelta, porque una madre siempre da vuelta las fotos— y una hoja llena de tachones, sin firmar y sin sobre.
- [ ] **BORRAR**

### J EPI_MESA2_030 · no está en GUION_3

- [ ] **DEJAR** — : Pone el cuaderno abierto de un lado de la mesa y la carta abierta del otro. Derechitos, uno frente al otro, como los dos platos.
- [ ] **BORRAR**

### J EPI_MESA2_040 · no está en GUION_3

- [ ] **DEJAR** — : Nunca se leyeron. Vos los leíste a los dos.
- [ ] **BORRAR**

### J M12_HIST_010 · no está en GUION_3

- [ ] **DEJAR** — : En la madrugada del 12 de junio, mientras daba fuego naval sobre los montes, el Glamorgan fue alcanzado por un Exocet lanzado desde una rampa improvisada en tierra.
- [ ] **BORRAR**

### J M12_HIST_020 · no está en GUION_3

- [ ] **DEJAR** — : Murieron 14 tripulantes. Fue el último buque británico alcanzado en la guerra.
- [ ] **BORRAR**

### J M12_HIST_030 · no está en GUION_3

- [ ] **DEJAR** — : Al barco que castigaba el monte le pegaron desde tierra y desde el aire a la vez.
- [ ] **BORRAR**

### J M12_HIST_040 · no está en GUION_3

- [ ] **DEJAR** — : El 14 de junio de 1982, tras 74 días, cesaron los combates.
- [ ] **BORRAR**

---

