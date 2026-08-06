# RASANTE — Campaña "El cuaderno de Mateo" · Guion 3.0

> **Malvinas, 1982. Un padre que vuela. Un hijo que escribe un cuaderno que el padre nunca
> va a leer. Y una mesa donde, años después, alguien los lee a los dos.**

---

## CÓMO LEER ESTE DOCUMENTO — el sistema de marcas

Para saber de un vistazo dónde prestar atención:

| Marca | Significa |
|---|---|
| 🟥 **NUEVO** | No existía en la 2.3. Leer entero. |
| 🟨 **CAMBIÓ** | Existía y se modificó. Cada marca dice QUÉ cambió en una línea. |
| *(sin marca)* | **Idéntico a la 2.3.** Se puede leer en diagonal con confianza. |

**Los cambios estructurales de la 3.0, en una línea cada uno:** muere el sistema de cartas
cruzadas (ahora: cuaderno-diario + UNA carta) · el juego arranca años después, con Norma
recibiendo el paquete · 14 misiones (dos nuevas: M3 y M10) · M1 es tutorial puro ·
mejoras roguelike desde M3 · la Chancha se rompe en M6 · dos finales a elección del
jugador · Tero nunca sabe si Mateo vio el batir de alas · Perú entra a la historia ·
dialectos por personaje · el principio supremo: **la historia primero**.

---

## 🟥 0. EL PRINCIPIO QUE MANDA SOBRE TODO

**La historia tiene que ser tan buena que el juego pase a segundo plano.** El jugador pasa
el nivel **para ver lo que sigue**, no por el divertimento de jugar. Consecuencias:

1. **Cada misión termina en anzuelo** — una pregunta, una foto sin explicar, una frase a
   medias. El jugador apaga pensando en la escuadrilla, no en el puntaje.
2. **La dificultad nunca frena la historia.** Asistencia progresiva para el que se traba.
   Frustrar acá no es desafío: es cortarle la serie en la mejor parte.
3. **El gameplay está al servicio del guion.** Si una mecánica traiciona un momento
   narrativo, pierde la mecánica. Siempre.
4. **La vara de toda escena:** ¿esto hace que el jugador NECESITE ver la que sigue? Si no,
   se reescribe.

---

## 🟨 1. La idea en una línea
*(Cambió: ya no hay cartas cruzadas; el marco arranca años después; el final es del jugador.)*

Un piloto de caza argentino pelea la guerra desde el cielo mientras su hijo —conscripto con
tres meses de instrucción— la aguanta desde el pozo, **escribiéndole un cuaderno que él
nunca va a leer**: un diario que le habla al padre porque escribirle a alguien es más fácil
que escribir al vacío. El padre no puede sacarlo de las islas, así que hace lo único que
sabe: volar hasta él. **Años después de la guerra, una encomienda golpea la puerta de una
cocina. Adentro está el cuaderno. Sobre esa mesa ya hay una carta. El juego es lo que Norma
lee.**

**El jugador nunca juega al hijo. Solo lo lee y ve lo que dibujó.** El jugador es el único
lugar del universo donde padre e hijo están juntos. Y al final, el timón queda en sus
manos: **quedarse o volver.**

---

## 2. La tesis (lo que el juego cree)
*(Sin cambios. Sigue siendo la ley.)*

**La guerra no produce nada bueno. No es un cuento de Disney. Es cruel, y aunque la peleen
personas increíbles y buenas de los dos lados, mientras exista, es una mierda.**

1. **La culpa es de los de arriba.** De los despachos: la junta militar argentina, el
   gobierno de Margaret Thatcher, los superiores hambrientos de poder y los mediocres con
   jineta. **Nunca de los que pelearon.**
2. **El enemigo no es el inglés. El enemigo es la guerra.** Al soldado británico se lo trata
   con el mismo respeto. El juego no festeja muertes: las cuenta, con nombre cuando lo tiene.
3. **El coraje no redime a la guerra.** El juego no dice "el coraje ganó": dice **"miren lo
   que el coraje tuvo que hacer, y para qué"**.

La frase que cierra todo, antes de los créditos:

> *"Allá hay gente tan buena como acá, lo que pasa es que no nos dejan conocernos.
> Si las naciones dejaran conocer a su gente buena, no viviríamos en este infierno."*
> — Diego Iorio

---

## 3. Personajes

### El que jugás — "Tero" *(sin cambios de fondo)*
**Primer Teniente Esteban Aldao**, 41, piloto de A-4B del Grupo 5, Río Gallegos. El tero
grita lejos del nido: se ofrece al zorro para que lo corra a él. El apodo es el final del
juego escondido a plena vista. Primer piloto de la historia de su familia; el sapito del
arroyo era, sin que ninguno lo dijera, la primera clase de vuelo. Policía bueno, Capitán
América criollo sin suero: no tiene superpoderes, tiene supercorazón. Movió todo para sacar
al hijo de las islas. No pudo. Nunca se sabe del todo por qué.
🟨 *(Cambió una cosa: **Esteban no recibe una sola carta de Mateo en todo el juego.** Su
única información es un punto en un mapa. Eso hace verosímil que no supiera cómo lo
trataban — y hace más grande la culpa.)*
🟥 *(Nuevo: **"Tero" es su apodo de siempre — veinte años en la Fuerza, con el pájaro
pintado en cada avión que voló.** La familia lo sabe; Mateo creció con el terito. El Turco
se lo pinta en el Skyhawk la primera mañana (M1). Ese terito hace posible el
reconocimiento de M8, y es marca oficial de su avión → AVIONES_ESCUADRON.md.)*

### Al que leés — Mateo 🟨
*(Cambió: el cuaderno es DIARIO, no borrador de cartas; el hobby viene de la infancia.)*
**Conscripto Mateo Aldao**, 18, clase '63. **Dibuja desde chico** — llenaba los márgenes de
los cuadernos de la escuela con los aviones que el padre le señalaba en el cielo; en P.1 ya
está dibujando en la orilla del arroyo. A las islas se llevó el cuaderno Rivadavia **de su
casa**, porque siempre lo llevaba a todos lados. Y como el correo de conscriptos no
funciona —tarda meses, se pierde, se revisa— decide algo que define el juego: **no manda
cartas. Escribe el diario hablándole al padre**, a veces a la madre, y guarda todo para
dárselo en la mano cuando vuelva. *"Así no te tengo que contar nada: mirás y listo."*
**El padre nunca sabe que ese cuaderno existe.**

### La escuadrilla — "los Fieles de Plata" *(backgrounds sin cambios)*
- **"Puma" — Capitán Aurelio Sandoval**, 44. Tercera generación de uniforme. Su arco: la
  lealtad mudándose de la institución a las personas. Cuando Puma no sonríe, preocupate.
  Cuando apaga la radio, rezá. 🟥 *(Nuevo: lleva pegada al panel de cabina una foto — las
  tres generaciones de uniforme, y él de chico a upa del abuelo. Se paga en M14.)*
- **"Gitano" — Teniente Facundo Ojeda**, 33. Cordobés. El optimismo como decisión, contra
  una casa de golpes. Lo cuenta una sola vez, en el asado de M13. 🟨 *(Cambió: habla en
  cordobés de verdad — "culiao", tonada. Ver guía de dialectos, sección 9.)*
- **"Vasco" — Teniente Iñaki Arrieta**, 36. El callado. La foto de la mujer joven en el
  locker que **todos vieron** y el pasado en tres rumores que **nunca se confirman**.
  Todo el mecanismo de la foto: **idéntico a 2.3** (ver M7 y Notas §8a).
- **"Pichón" — Alférez Tomás Rivas**, 22. El superdotado inocente. 🟨 *(Cambió el sistema
  de sus mejoras — ahora roguelike, ver sección 5 — y crece su dinámica cómica con el
  Turco: probablemente hubiera sido mejor ingeniero que piloto, y no tuvo tiempo de
  descubrirlo. Se ve, no se dice.)*

### El de la pista — "el Turco" *(sin cambios)*
**Suboficial Miguel Salomón**, mecánico jefe. Pinta **una estrellita por cada regreso**.
"Los ingleses cuentan lo que bajan. Yo cuento lo que vuelve." 🟨 *(Habla tucumano:
"m'hijo", "changuito", "esto no lo levanta ni Alá".)*

### El que protege al hijo — "Colorado" 🟨
*(Cambió: se agregan la navaja, los jazmines y el destino de la foto.)*
**Cabo Aníbal Correa**, 26, correntino. Mientras Correa vive, Mateo tiene techo. Habla con
"chamigo" y "angá", pausado, dulzura guaraní. **Mucho antes de morir le regala a Mateo la
navaja de su abuelo** — cortaplumas gastado, cabo de asta: *"En el campo, un hombre sin
navaja no es nadie, chamigo."* La navaja aparece desde entonces en los dibujos. **Con esa
navaja Mateo va a tallar el VAMOS A VOLVER** (M12), y la navaja vuelve en la encomienda.
Su hermana **Claribel… no: su hermana es la de la foto** — la foto gastada que le muestra a
Mateo en M6 y que **queda con Mateo** cuando Correa muere, pegada al cuaderno.

### El rostro de la corrupción — Subteniente Bordón *(sin cambios)*
No es el villano: es un hombre chico con una pizca de poder. El verdadero responsable está
en un despacho al que Bordón jamás va a llegar.

### La que espera — la madre *(sin cambios de fondo)*
**Norma.** Ni una línea de diálogo. 🟨 *(Cambió su lugar en la estructura: ahora es
literalmente **la primera y la última imagen del juego** — el marco arranca con ella
recibiendo el cuaderno, años después. Ver P.0.)*

### La que escribe sin conocer — Claribel *(sin cambios)*
9 años, Villa Mercedes, San Luis. Una carta de escuela "a un soldado argentino". Aparece
una vez y alcanza.

### La voz de la base — "Cóndor" 🟨
*(Cambió: mucho más presente — es mecánica y es ritual.)*
Los A-4 **no tenían radar**: dependían del control de tierra. Cóndor está en TODAS las
misiones — avisa lo que los aviones no pueden ver… **y la señal se pierde**, a veces en el
peor momento, y el jugador queda ciego. Además, el **ritual de lanzamiento**: la misma
fórmula épica antes de cada misión (referencia de tono: la activación de Pacific Rim):

> **CÓNDOR:** *Plata Fiel, Plata Fiel. Aquí Cóndor. Cielo despejado al sur. Viento en la
> cola. Bajito y a casa. — Buena caza, muchachos.*

Doce veces escalofrío. La decimocuarta, freno: en M14 el ritual se corta en la mitad.

---

## 🟨 4. Los indicativos — el aviario en la radio *(renumerado a 14; dos aves nuevas)*

Regla igual que siempre: apodos humanos para la gente, aves para la radio. Tero y Pichón,
las dos aves "humanas" secretas.

| Misión | Título | Indicativo | Nota |
|---|---|---|---|
| M1 | Sal en las alas | **CAUQUÉN** | 🟨 ahora tutorial puro |
| M2 | Bautismo de fuego | **CHIMANGO** | |
| 🟥 M3 | El invento | **BENTEVEO** | nueva — el que se mete en todo |
| M4 | El día que sangró el mar | **ALBATROS** | ex M3 |
| M5 | El callejón de las bombas | **AGUILUCHO** | ex M4 |
| M6 | La bomba que no despertó | **CARANCHO** | ex M5 · 🟨 acá se rompe la Chancha |
| M7 | 25 de Mayo | **ZORZAL** | ex M6 · muere el Vasco |
| M8 | El batir de alas | **HORNERO** | ex M7 · el sobrevuelo |
| M9 | El pibe | **GOLONDRINA** | ex M8 · muere el Pichón |
| 🟥 M10 | Los primos | **CHINGOLO** | nueva — llegan los Mirage del Perú |
| M11 | Lo que no se dice | **CALANDRIA** | ex M9 · el respiro |
| M12 | El ángel de Corrientes | **CHAJÁ** | ex M10 · muere Correa |
| M13 | La última mesa | **CABURÉ** | ex M11 · el asado |
| M14 | El tero | **— (sin indicativo)** | misión denegada: **Plata Fiel** |

---

## 🟥 5. Las mejoras — sistema roguelike *(reemplaza al viejo §2c)*

**El guion NO define mejoras concretas.** Ni nombres, ni niveles, ni tabla misión→mejora
(la tabla de la 2.3 queda como referencia de sabor, no como spec). Las define Matías
después: niveles 1/2/3, piruetas, munición, velocidad. El guion fija solo el sistema
narrativo:

- **Desde M3, después de cada misión el juego ofrece DOS mejoras y se elige UNA** — estilo
  roguelike: cada partida arma un avión distinto.
- **La fuente es el Pichón, pero indirecta:** no presenta inventos — hace **observaciones**
  (sobre los motores, los aviones, lo que pasó en la misión) que el Turco recoge, discute y
  a regañadientes prueba.
- **El ritual cómico** (se conserva de la 2.3): *"Pibe, eso no se puede." (pausa) "…A ver.
  Mostrame."* Y se agrega: **intentos irrisorios que fallan** — cosas que se caen, que
  hacen un ruido espantoso, que el Turco desarma a las puteadas. No todo le sale al pibe, y
  eso lo hace querible. Cuando algo funciona, el Turco se atribuye la mitad del mérito.
- **El Turco NO sabe que existe la libreta** hasta la muerte del Pichón (M9). Al abrirla
  entiende dos cosas de un saque: que todo salía de ahí, y que **lo que llegaron a probar
  era UN CUARTO de lo que el pibe tenía dibujado**. Un cuaderno de Da Vinci escrito por un
  conscripto con grasa en las manos. Las mejoras post-M9 salen de la libreta: el Turco
  construye de noche lo que el pibe dejó, como quien ejecuta un testamento.
- **Se conserva de la 2.3, intocable:** la última página de la libreta — el **TONEL
  BARRIL**, *"para cuando haya que volver a buscar a alguien"* — y su pago en M14: la
  maniobra que el Pichón imaginó para rescatar es la que un padre usa para despedirse.
- **La simetría de los dos cuadernos** (Mateo = memoria; Pichón = futuro) se mantiene: en
  RASANTE hasta el árbol de mejoras es un acto de duelo.

---

## 🟨 6. El dispositivo narrativo — la mesa, años después
*(Cambió TODO el sistema de papeles. Leer entero.)*

**Tres registros, dos papeles, una mesa:**

- **AIRE (Esteban / vos):** briefing, cabina, combate. Tipografía técnica.
- **TIERRA (Mateo):** las páginas del cuaderno — **un diario que le habla al padre**, a
  veces a la madre, con dibujos. **Nunca se manda nada.** Manuscrita, birome.
- **LA CARTA (Esteban):** 🟨 **UNA sola en todo el juego.** La escribe la noche del asado
  (M13), **a Norma**, "por las dudas". El jugador la ve escribirse **pero no la lee** — se
  revela recién en el Final A. Block militar, letra apretada.

**La regla nueva de los papeles:** el correo de conscriptos no funciona y Mateo lo sabe —
por eso el diario. **Esteban no recibe nada de Mateo en toda la guerra**: si el correo
hubiera funcionado, se habría enterado de cómo lo trataban y habría hecho algo. **El
silencio postal es lo que hace verosímil la tragedia.** Las preguntas que Mateo escribe
("contame cómo se ve desde arriba") no esperan respuesta: son la forma que tiene un pibe de
no volverse loco.

**El marco — la mesa, años después.** 🟥 El juego ARRANCA en el presente de Norma: años
después de la guerra, golpean la puerta con una encomienda del Ejército. Adentro, el
cuaderno. Norma lo pone en la mesa, va al cajón, y trae **la carta que ya leyó mil veces**
— la de Esteban, que llegó a las semanas, porque el correo de la Fuerza sí era directo. Las
pone una frente a la otra. Y empieza a leer. **El juego entero es esa lectura.** Ella es la
única persona del mundo que lee los dos papeles.

**La regla de montaje** (sin cambios): lo que pasa arriba y abajo rima. Nunca se ven —
salvo una vez, desde lejos, en M8. 🟨 *(Y ahora ni esa vez es segura: ver M8.)*

**Orden por misión** 🟨: *briefing → misión → epílogo de aire → página del cuaderno.*
(Ya no hay fragmentos de carta del padre entre misiones — la carta es una y es de M13.)
La única vez que el orden se rompe es M12, que corta a tierra en pleno vuelo.

---

## 🟨 7. Mapa emocional — cuatro movimientos *(renumerado)*

| Movimiento | Misiones | Lo que se siente | Lo que se instala |
|---|---|---|---|
| **I — El nido** | P.0–P.4 + M1–M4 | Orgullo, risa, hermandad | La familia. La escuadrilla. La brecha. 🟥 El invento. |
| **II — El callejón** | M5–M8 | Desgaste, primera pérdida, ternura | 🟨 La Chancha rota. Muere el Vasco. El sobrevuelo. |
| **III — Solo** | M9–M13 | Duelo, 🟥 un respiro de esperanza, rabia | Muere el Pichón. 🟥 Los primos del Perú. Muere Correa. El asado. La carta. |
| **IV — El tero** | M14 + Finales | Contrarreloj, sacrificio, LA DECISIÓN | 🟥 Dos finales. La mesa. |

---

# PRÓLOGO — "El cielo compartido"

### 🟥 Viñeta P.0 — La puerta *(años después de la guerra — EL MARCO)*
**Imagen:** una cocina en penumbra, el presente. Mantel de hule gastado. Golpean la puerta.
Norma —más canas que en el resto del juego— abre: un empleado del correo, un paquete del
Ejército, una firma. Norma cierra la puerta y se queda con el paquete en las manos, pesado
como un chico dormido.

*(Lo abre en la mesa. Un cuaderno Rivadavia de tapa dura, hinchado de humedad, con arena
entre las páginas. Norma no lo abre todavía. Va hasta el aparador, saca del cajón **una
hoja de block militar doblada en cuatro, blanda de tanto doblarse** — una carta que ya leyó
mil veces, hace años. La pone de un lado de la mesa. El cuaderno del otro. Se sienta. Abre
el cuaderno en la primera página.)*

*Cartel:* Tardó años en llegar. Lo que sigue es lo que ella leyó.

*(Y la primera página del cuaderno es la Viñeta P.1: el juego "empieza". Todo lo que el
jugador va a ver está siendo leído en esa mesa. No se vuelve a mostrar a Norma hasta el
final — pero el jugador ya sabe dónde está sentado.)*

### 🟨 Viñeta P.1 — El arroyo *(años antes; el primer dibujo del cuaderno)*
*(Cambió: Mateo nene ya dibuja — el hobby se siembra acá.)*
**Imagen:** un campo en la provincia. Un Rastrojero oxidado. Esteban joven de uniforme
revolea una piedra chata: pica una, dos, tres veces. **Mateo, ocho años, está sentado en la
orilla con un cuaderno en las rodillas, dibujando el arroyo, el Rastrojero, el avión que
cruza el cielo.** Dibuja como respira: sin darse cuenta.

**ESTEBAN:** ¿Ves? Sapito. La piedra no se hunde si va rápido y pegada al agua. Con los
aviones es igual: abajo de todo, rapidito, donde nadie te espera. *(señala el cielo)* Los
valientes vuelan abajo, Mateo.

**MATEO (nene, sin dejar de dibujar):** ¿Y no se caen?

**ESTEBAN:** Se caen los que le tienen miedo a la tierra. *(le revuelve el pelo, mira el
dibujo)* …Salió mejor el avión que yo, ¿eh?

*Cartel:* La tierra iba a ser lo único que le quedara.

### Viñeta P.2 — La cocina *(marzo de 1982 — sin cambios)*
Mateo, 18, rapado de colimba. Esteban enfrente. Norma de espaldas, sirviendo.

**MATEO:** Tres meses, pá. Hago la colimba, marcho un poco, y el año que viene estoy de
vuelta arreglándote el Rastrojero.

**ESTEBAN:** *(medio riéndose)* Vos al Rastrojero lo rompés más de lo que lo arreglás.

🟥 **MATEO:** *(cargando la mochila, con el cuaderno arriba de todo)* Che, ¿y allá te van a
pintar el terito? En el avión nuevo.

**ESTEBAN:** Y… si el mecánico es de ley, sí. Un avión sin su pájaro trae mala suerte.

**MATEO:** *(a Norma, señalando al padre con el pulgar)* En el trabajo le dicen Tero, ma.
Hace veinte años que vuela y el pájaro lo sigue a todos lados. *(al padre)* Si algún día
pasás por arriba mío, yo al terito lo reconozco antes que a vos.

*(🟥 SIEMBRA CLAVE: Mateo sabe el apodo del padre y sabe del terito pintado. Este
intercambio de dos líneas es lo que hace posible el reconocimiento de M8. El jugador lo
olvida — el guion no.)*

*(La radio sube sola: "…tropas argentinas desembarcaron esta madrugada en las Islas
Malvinas…". Los tres quietos. La pava chifla y nadie la saca del fuego.)*

*Cartel:* El 2 de abril la Plaza se llenó. Desde el balcón, un general envalentonado
desafió al mundo: "Si quieren venir, que vengan." En esa cocina, un padre que conocía la
guerra de verdad no salió a festejar. Se quedó mirando el teléfono.

### Viñeta P.3 — Lo que un padre puede y lo que no *(sin cambios)*
Montaje: el teléfono de la base, papeles, un despacho, una puerta que se cierra.

**ESTEBAN (voz superpuesta):** Moví todo. Llamé a todos. Un padre con galones cree que
puede. *(la puerta se cierra)* No pude.

**CÓNDOR (radio, seco):** Aldao. Su hijo ya está embarcado. Está en las islas. Lo siento.

*Cartel:* Le quedaba una sola manera de estar cerca: el cielo.

### 🟨 Viñeta P.4 — La primera página del cuaderno
*(Cambió: se establece el DIARIO — nada se manda, todo se guarda.)*

> *Viejo:*
>
> *Llegamos. Hace un frío que no tiene nombre. Somos pibes de todo el país. Hay uno de
> Jujuy que nunca había visto el mar y no puede parar de mirarlo. Hay un porteño que
> extraña el colectivo, ¿podés creer? Extrañar el 60, pá.*
>
> *Acá dicen que las cartas tardan meses, cuando llegan. Así que decidí otra cosa: te
> escribo todo acá, en el cuaderno de siempre, y cuando vuelva te lo doy en la mano. Vos
> lo leés de una sentada y no te tengo que contar nada: mirás y listo. Mientras tanto te
> hablo igual, como si estuvieras. Escribirte es más fácil que aguantar callado.*
>
> *Me acuerdo lo que me enseñaste del sapito. Yo acá estoy bien abajo, pegadito a la
> tierra. No me puedo caer más. Contame vos cómo se ve todo desde arriba. Ya sé que no me
> vas a contestar. Contame igual.*
>
> *A mamá, cuando volvamos, le decimos que acá había guiso y pan. Los dos la misma
> mentira, ¿eh? Que para eso somos los hombres de la casa.*
>
> *Mateo.*

*Cartel:* Y arriba, esa misma semana, empezaba la guerra.

---

# MOVIMIENTO I — EL NIDO

## 🟨 MISIÓN 1 — "Sal en las alas"
*Mar abierto. **TUTORIAL PURO: sin jefe, sin enemigos, sin un solo disparo enemigo.***
*(Cambió: se le saca el boss y todo combate. Es la misión de conocer a la familia.)*

### Briefing (aire) *(el diálogo, sin cambios — es el mejor hangar del juego)*
La línea de vuelo de Río Gallegos, de madrugada. El Turco ceba mate como quien da la
comunión. Esteban conoce a la familia.

**PUMA:** Bienvenido a la Plata, Tero. Regla número uno: pegado al agua el radar de ellos no
te ve. Volás tan bajo que volvés con sal en las alas. Regla número dos: no hay. Con la uno
alcanza.

**GITANO:** Regla dos: el mate lo cebo yo, que el Turco lo hace lavado. Regla tres: si no
volvés, te lo cebo igual, pero solo. Y cebar solo es tristísimo, así que volvé.

**PICHÓN (nervioso):** ¿Siempre hacen chistes antes de volar?

**VASCO (bajito):** Siempre. Es la manera que tienen de rezar.

**GITANO:** Y el Vasco reza doble: por él y por que no lo encuentre el marido.

**PICHÓN:** ¿Qué marido?

**GITANO:** El de la foto, pibe. *(bajando la voz)* Andá, mirala. Está pegada adentro de la
puerta del locker. Una diosa, morocha, riéndose. Esa mujer no es de nadie que esté solo,
Pichón. Esa mujer tiene dueño y el dueño tiene charreteras.

**PICHÓN:** *(que va, mira, y vuelve con los ojos grandes)* …Es hermosa.

**GITANO:** ¿Vio? Casada seguro. Mínimo un coronel. Por eso el hombre no habla.

**PICHÓN:** *(bajito, fascinado)* A mí me dijeron que tiene un hermano preso.

**GITANO:** A mí me dijeron que él estuvo preso.

**PUMA:** *(sin levantar la vista del mapa)* A mí me dijeron que ustedes dos hablan mucho.

**VASCO:** *(se persigna, sube la escalerilla. No desmiente. Nunca desmiente nada.)*

> **CLAVE DE PRODUCCIÓN — el engaño honesto (sin cambios, ver Notas §8a):** la foto se ve,
> de frente, linda, y la pista (peinado, vestido, grano de los 50) está servida en el mismo
> cuadro. Nadie la lee porque el chiste enseña cómo mirar.

🟥 *(Y en el fuselaje del avión de Esteban, bajo la cabina, hay pintura fresca: **un terito
chiquito**, patas largas, pecho al frente, gritón. El Turco lo pintó anoche, sin que nadie
se lo pidiera, porque un piloto le contó el apodo y un avión sin su pájaro trae mala
suerte.)*

**ESTEBAN:** *(lo ve; toca la pintura fresca con un dedo)* …¿Y esto?

**EL TURCO:** *(sin darle importancia, acomodando la escalerilla)* Su pájaro, Teniente. Acá
los aviones van con nombre. *(golpeando el fuselaje como a un caballo)* Traémela entera,
Tero. Y traete vos adentro, que la estrellita la pinto por vos, no por ella.

🟥 **CÓNDOR (radio — primera vez del ritual):** Plata Fiel, Plata Fiel. Aquí Cóndor.
Cielo despejado al sur. Viento en la cola. Bajito y a casa. — Buena caza, muchachos.
Escuadrilla CAUQUÉN, autorizada pista dos.

**GITANO:** ¿Viste? Para el comando somos gansos. Por lo menos eligieron uno que vuela.

### 🟨 La misión *(cambió entera: tutorial sin combate)*
Aprender el rasante sin que nadie dispare: esquivar los mástiles de una flotilla pesquera,
pasar bajo un puente de chapa, seguir a Puma entre las olas a cada vez menos altura, y
tirar a **tambores flotantes** — destructibles inofensivos que el Turco tiró al mar como
blancos. El peligro es el mar y la torpeza propia. Cuanto más abajo, mejor puntúa: los
huevos se enseñan como mecánica antes que como discurso. Desempeño máximo = **"Volviste con
sal en las alas."**

### Epílogo (aire) *(sin cambios)*
Todos vuelven. El Turco pinta cuatro estrellitas con la lengua afuera. Por un rato, esto
parece una aventura.

### El cuaderno (tierra) *(sin cambios de contenido — ahora es página de diario)*
> *Viejo:*
>
> *Hoy conocí a un tipo, el cabo Correa. Correntino. Le dicen el Colorado. Me vio tiritando
> y me tiró una media de lana sin decir nada. Después me enseñó a armar el pozo mirando de
> dónde viene el viento. Tiene una hermana de mi edad allá en Corrientes y unos mates que te
> levantan de la tumba.*
>
> *No sé por qué, pero con él cerca tengo menos miedo. ¿Vos lo mandaste, no? No me mientas
> que te conozco, viejo. Gracias.*
>
> *Lo dibujé con capa, como un superhéroe, y abajo le puse "el Colorado". Te vas a reír
> cuando lo veas.*
>
> *Mateo.*

*(El jugador entiende lo que Mateo sospecha: sí, lo mandó. Es lo único que pudo hacer.)*

---

## MISIÓN 2 — "Bautismo de fuego" *(sin cambios de estructura)*
*1 de mayo. Costa. Boss: radar británico. La primera de verdad.*

### Briefing (aire) *(sin cambios)*
**PUMA:** Ellos tienen la máquina. Nosotros tenemos las manos. Vamos a volar tan bajo que la
máquina no va a poder creer que alguien esté tan loco. Esa incredulidad es toda nuestra
ventaja.

**ESTEBAN:** ¿Y alcanza?

**PUMA:** *(pausa larga)* No. Pero es lo que hay, y lo que hay lo volamos con todo. Como en
el potrero, Tero: cuando el rival tiene botines y vos estás descalzo, gambeteás más pegado
al piso.

*(Ritual de Cóndor. Despegue.)*

### La misión *(sin cambios)*
El jugador SIENTE la brecha: Harriers más rápidos, misiles que persiguen. Se sobrevive por
reflejos y por volar donde nadie con sentido común volaría.

### Epílogo (aire) *(sin cambios)*
Pichón aterriza agujereado, manos temblando; el Turco lo abraza sin decir nada y remienda
chapa toda la noche. A la mañana, agujeros parchados y una estrellita nueva.

**EL TURCO:** ¿Ves? Esa no es del avión. Es tuya.

### El cuaderno (tierra) 🟨 *(una línea cambia: la mentira del guiso ahora es pacto a futuro)*
> *Pá:*
>
> *Hoy comimos una vez. Una. La comida está —la mandan del continente— pero no llega a
> nosotros. El Colorado me pasó la mitad de su lata jurando que él ya había comido, mentira
> grande como una casa porque le escuché las tripas toda la noche.*
>
> *Hay un subteniente, Bordón, que tiene la carpa llena de cajas. Nosotros afuera, las cajas
> adentro. Nadie dice nada: acá el que abre la boca la pasa mal.*
>
> *Igual te cuento una linda: como prohibieron pasar música en inglés, la radio pasa rock
> nacional todo el día. Anoche los pibes cantaban en el pozo, pá. Cantábamos para no llorar
> y al final era lo mismo, pero cantado.*
>
> *Lo del guiso y el pan para mamá sigue en pie. Anotalo vos también, que yo acá lo tengo
> escrito.*
>
> *Mateo.*

---

## 🟥 MISIÓN 3 — "El invento" *(NUEVA — leer entera)*
*Primeros días de mayo. Patrulla costera. Sin boss. La misión de la comedia — y el arranque
del sistema de mejoras.*

### Briefing (aire)
Amanecer tranquilo, de esos que la guerra regala para confundir. El Pichón está trepado a
una escalera contra el avión de Esteban, con la manga sucia de grasa hasta el codo. El
Turco abajo, con los brazos cruzados y cara de tribunal.

**EL TURCO:** Bajate de ahí, changuito. Eso no se toca.

**PICHÓN:** *(sin bajarse, entusiasmado, hablando rapidísimo)* Es que mire: si le corremos
la toma dos dedos y le sacamos este peso muerto de acá, en la salida del rasante gana
empuje. Lo vi en la salida de ayer, el suyo se quedaba y el del capitán no, y la única
diferencia es—

**EL TURCO:** Pibe. Eso no se puede.

**PICHÓN:** *(se frena de golpe, avergonzado)* …Perdón. Ya me bajo.

**EL TURCO:** *(pausa larga. Mira el fuselaje. Mira al pibe.)* …A ver. Mostrame.

*(La escuadrilla entera mirando la escena como quien mira un partido. El Gitano cobra
apuestas invisibles.)*

**GITANO:** Diez pesos a que el Turco lo desarma a las puteadas antes del mediodía.

**PUMA:** *(mirando el mapa)* Y veinte a que después lo prueba igual.

### La misión
Patrulla de reconocimiento costero — la excusa jugable para **probar el invento**: la
primera mejora del juego instalada en el avión de Esteban. Vuelo libre, algunos blancos de
oportunidad (boyas de señalización enemigas, un radar portátil), cero presión. El jugador
siente la diferencia en las manos: el avión responde distinto. **La mecánica de mejoras se
enseña acá, en la misión más liviana, no en el medio del fuego.**

### Epílogo (aire) — el primer fracaso glorioso
De vuelta en el hangar, el Turco y el Pichón prueban el SEGUNDO invento del pibe — algo con
un carenado y mucha cinta aisladora. Lo encienden. Hace un ruido espantoso, tira una pieza
que sale rodando por la pista, y se apaga con humo.

*(Silencio. Todos miran.)*

**EL TURCO:** *(al Pichón, muy tranquilo)* Esto no lo levanta ni Alá.

**PICHÓN:** *(anotando algo con su lápiz de carpintero, imperturbable)* …Interesante.

**GITANO:** *(al borde de las lágrimas de risa)* "Interesante", dice el culiao. Casi me
mata una arandela voladora, "interesante".

*(A partir de acá, tras cada misión, el juego ofrece **dos mejoras y se elige una** —
presentadas siempre en el hangar con una viñeta de la dupla. Ver sección 5. El Pichón
observa, el Turco reniega y prueba, y la escuadrilla vuela cada vez un poco mejor porque un
pibe de 22 mira los aviones como nadie los miró.)*

### El cuaderno (tierra) 🟥
> *Pá:*
>
> *Hoy el Colorado me regaló una navaja. Así nomás, sin cumpleaños ni nada. Un cortaplumas
> viejo, con el cabo de asta gastadito de años de mano. "Era de mi abuelo", me dijo. "En el
> campo, un hombre sin navaja no es nadie, chamigo." Le dije que no podía aceptarla y me
> contestó que un regalo rechazado trae mala suerte, y que acá de mala suerte estamos
> completos.*
>
> *La probé pelando un palo para el fuego. Corta como pensamiento malo. La llevo en el
> bolsillo de arriba, con la birome. Mis dos herramientas, pá: una para contar y otra para
> lo que venga.*
>
> *La dibujé abajo, mirá. Le hice hasta las marquitas del cabo.*
>
> *Mateo.*

*(La navaja queda plantada — chiquita, útil, sin drama. Va a volver dos veces: en M12, y en
una encomienda, años después.)*

---

## MISIÓN 4 — "El día que sangró el mar" *(ex M3 — solo renumerada)*
*4 de mayo. Boss: destructor HMS Sheffield.*

### Briefing (aire) *(sin cambios — incluye la profecía de la gambeta)*
**GITANO:** ¡Le dimos! ¡A la Royal Navy le dimos, muchachos! ¡Que se enteren en Londres que
acá abajo hay gente con huevos! ¡Argentina, carajo!

**PUMA (más serio que el resto):** Veinte marinos, Gitano.

**GITANO:** *(baja de golpe)* …veinte marinos.

**PUMA:** Del otro lado hay pibes iguales a nosotros que hoy no vuelven. Alegrate de que
nosotros sí. Y callate un minuto por los que no.

**GITANO:** *(después del minuto, en voz baja)* Algún día se la vamos a ganar en algo que
no mate a nadie. Un pibe nuestro va a agarrar una pelota y los va a gambetear a todos. A
TODOS, Puma. Y ese día va a ser más grande que éste.

**PUMA:** Ojalá la única guerra que nos quede sea esa.

### La misión / Epílogo *(sin cambios)*
El jugador les hace sentir miedo A ELLOS: voces británicas de pánico real por radio — "Low
level! Here they come again!" Primera gran victoria; Puma se aparta y mira el mar sin
sonreír. 🟨 *(La segunda aparición de la foto del Vasco — el plano en silencio del locker —
se mueve acá, que ahora es la tercera misión con hangar: el Vasco la mira dos segundos y
cierra la puerta. El jugador cree ver a un hombre extrañando a su amante.)*

### El cuaderno (tierra) *(sin cambios — el anuncio del segundo piloto)*
> *¡Viejo!*
>
> *Llegó la noticia del Sheffield y por primera vez vi a los pibes levantar la cabeza. El
> Colorado me apretó el hombro y me dijo "tu viejo anda ahí arriba, pibe. Seguro anda por
> ahí".*
>
> *¿Eras vos? Elijo creer que sí.*
>
> *Lo dibujé: un avioncito plateado y un barco enorme, y el avioncito gana. Salió medio
> chueco el barco. Los barcos son difíciles.*
>
> *Y te cuento algo que no te dije en la despedida porque me daba no sé qué: cuando salga
> de acá me anoto en la escuela de aviación, pá. Lo tengo decidido hace rato. Quiero volar
> con vos. Quiero que un día la escuadrilla sea "Aldao y Aldao" y que el Turco ese nos
> putee a los dos juntos.*
>
> *Cuidate mucho. Volá bajo, como me enseñaste. Yo te espero acá, pegadito a la tierra.*
>
> *Mateo.*

*(El hijo del primer piloto de la familia anuncia que quiere ser el segundo. 🟨 Esteban no
va a leer esto nunca — lo lee el jugador, y Norma, años después. Desde acá, cada vuelo de
Esteban es también el vuelo que Mateo no va a llegar a hacer.)*

---

# MOVIMIENTO II — EL CALLEJÓN

## MISIÓN 5 — "El callejón de las bombas" *(ex M4 — solo renumerada)*
*21 de mayo. San Carlos. Boss: fragata HMS Ardent.*

### Briefing *(sin cambios)*
**PUMA:** Es la boca del lobo. Entramos, soltamos, salimos. Nadie se hace el héroe: los
héroes no llegan a cebar el mate de la tarde.

**ESTEBAN:** Puma. Mi hijo está en tierra. Cerca de acá.

**PUMA:** *(pausa)* Lo sé, Tero. Todos tenemos a alguien abajo. Por eso entramos: cada barco
que tocamos es una bomba menos cayéndole a los pibes. Volás por tu hijo. Volamos todos por
el hijo de alguien.

**GITANO:** *(subiéndose)* ¿Vieron que hicieron un festival allá en Buenos Aires? Juntaron
montañas de cosas para los pibes de las islas. Chocolates, cigarrillos, abrigo…

**VASCO:** ¿Y?

**GITANO:** *(cerrando la cúpula)* Y nada. Eso digo. Juntaron.

### La misión / Epílogo *(sin cambios)*
El infierno del Callejón. El Ardent arde. El Vasco vuelve con el tren colgando como una
pata quebrada; el Turco no le pinta la estrellita hasta el otro día porque le temblaba el
pulso.

### El cuaderno (tierra) *(sin cambios)*
> *Pá:*
>
> *Hoy vi caer un avión nuestro a lo lejos. Recé para que no fueras vos y después me sentí
> una basura, porque el que cayó también era el hijo de alguien, el viejo de alguien.*
>
> *El Colorado me encontró llorando y no me dijo "sé hombre" ni ninguna de esas pavadas. Se
> sentó al lado mío en el barro y esperó que se me pase. Sabe esperar como nadie, debe ser
> de tanto pescar en el Paraná.*
>
> *Bordón hizo estaquear a dos pibes por "robar" comida. La comida era nuestra, pá. Uno era
> el jujeño de la radio. No entiendo nada. ¿Esto es la guerra o es otra cosa? Porque contra
> los ingleses todavía no disparé un tiro, pero contra el frío, el hambre y Bordón peleamos
> todos los días.*
>
> *Mateo.*

---

## 🟨 MISIÓN 6 — "La bomba que no despertó" *(ex M5 — CAMBIÓ: acá se rompe la Chancha)*
*23 de mayo. Boss: fragata HMS Antelope.*

### Briefing *(sin cambios — incluye el chiste de la casada nº3)*
**GITANO:** A ver si entendí. ¿Le pego, le pego BIEN, en el medio del casco… y no explota?

**PUMA:** Para que arme, tenés que soltarla más alto. Y si soltás más alto, te bajan a vos.

**GITANO:** *(sin chiste, por una vez)* Entonces elijo pegarle y volver a cebar el mate.
*(a Vasco, recuperando el chiste porque lo necesita)* Y si no vuelvo, Vasco, le avisás vos
a tu casada, que con el coronel ya tiene práctica en dar malas noticias.

**VASCO:** …Callate, cordobés. *(pero casi se ríe. Casi.)*

**ESTEBAN:** *(mirando la bomba bajo el ala)* Es como el sapito, ¿viste? La piedra va tan
pegada al agua que no se hunde. El problema es que nosotros necesitamos que se hunda.

### La misión *(sin cambios)*
Hacés TODO bien y el sistema te lo niega. Los huevos no alcanzan y hay que ponerlos igual.

### Epílogo — la Chancha 🟨 *(CAMBIÓ: la Chancha se rompe acá, salvando al Gitano)*
El Antelope explota de noche: una bomba dormida despierta mientras un artificiero británico
intentaba desactivarla. *Del otro lado, un hombre murió tratando de salvar a los suyos.*

**VASCO (mirando el resplandor lejano):** Que Dios lo tenga. Al de allá también.

Y en el regreso, el otro golpe: al Gitano no le cierra la cuenta de combustible.

**GITANO:** *(por primera vez sin humor)* Muchachos… no me da. No me da la nafta.

**CÓNDOR:** Plata 2, mantenga rumbo. La Chancha va a buscarlo.

Y de la nada, gorda, lenta, hermosa, aparece **la Chancha**. La manguera se conecta en el
aire, de noche, a metros del mar.

**VOZ DE LA CHANCHA:** Tranquilo, cordobés. La Chancha no abandona a nadie. Tomá, servite.

**GITANO:** *(la voz quebrada)* Te amo, gorda. Cuando volvamos te pinto entera de dorado.

🟥 *(Y entonces, con la manguera todavía conectada, la costa los ilumina: un reflector, y
enseguida el fuego antiaéreo. La Chancha **no se desconecta** — aguanta, enorme y lenta,
hasta que el Gitano termina de cargar. Recién ahí rompe. Un impacto le arranca un pedazo de
ala. Se va al oeste, tosiendo, escoltada por los insultos de amor del Gitano.)*

🟥 *(Epílogo del epílogo, en la base: la Chancha llegó. Rota. Los mecánicos la rodean como
a un animal herido. El Turco pasa la mano por el ala agujereada y no dice nada. Desde esta
noche, la Chancha vuela corto: sirve para trabajos cerca, **no puede sostener las corridas
largas al sur**. Nadie subraya el dato. Va a importar en M13, cuando alguien diga "sin
Chancha no hay nafta de vuelta". **El Gitano lo sabe mejor que nadie: se rompió por él.**)*

### El cuaderno (tierra) *(sin cambios)*
> *Viejo:*
>
> *¿Te acordás del festival que hicieron allá para juntar cosas para nosotros? Acá no llegó
> ni un chocolate. Ni uno, pá. Dicen que hay galpones llenos en el continente. A nosotros
> llegó una revista vieja que decía en la tapa "Estamos ganando". La usamos para taparnos
> del viento. Por lo menos para algo sirvió la mentira.*
>
> *El Colorado me mostró la foto de la hermana, toda gastada de tanto mirarla. "Cuando
> salgamos de ésta te la presento", me dijo. "Hacen linda pareja." Me reí, pá. Hacía diez
> días que no me reía.*
>
> *Le pedí que cuando termine esto venga a casa. Asado en el fondo, vos contando mentiras
> de aviador, él contando mentiras de pescador. Me dijo que sí. Tengo un amigo, pá. En el
> peor lugar del mundo, tengo un amigo.*
>
> *Mateo.*

---

## 🟨 MISIÓN 7 — "25 de Mayo" *(ex M6 — MUERE EL VASCO. Cambia solo una línea del locker.)*
*25 de mayo. Boss: destructor HMS Coventry.*

### Briefing *(sin cambios — el Vasco habla de más sin saber que se despide)*
Fiesta patria. Facturas, chocolate caliente en un tacho de aceite lavado. El día de moral
más alta del juego… elegido a propósito para el primer gran golpe.

**PUMA:** Hoy es 25, muchachos. Hoy le dedicamos uno a la Patria.

**GITANO:** A la Patria patria, ¿eh? La de los pibes y las facturas. No a los de los
despachos, que esos que se consigan su propio barco.

**VASCO:** *(hablando más que en las seis misiones anteriores juntas, sobre nada: el
chocolate, el frío, una anécdota de la escuela de aviación)* …y el tipo me hace repetir el
aterrizaje cuatro veces. Cuatro. Yo tenía diecinueve años y el tipo me hace repetirlo
cuatro veces.

**GITANO:** *(sorprendido, divertido)* Vasco. ¿Vos estás bien?

**VASCO:** *(se queda pensando la respuesta demasiado tiempo)* …Sí. Vamos, que el chocolate
se enfría.

*(Nadie le da importancia. Esa es la idea.)*

### La misión / la muerte *(sin cambios)*
El Vasco siempre visible, ala con ala. El Coventry cae. A la salida, un Sea Harrier lo
engancha. El jugador lo tiene al lado. No puede hacer nada.

**GITANO (gritando):** ¡Vasco! ¡Eyectate! ¡SALTÁ, VASCO, SALTÁ!

**VASCO:** *(un ruido corto, ni una palabra. Estática.)*

*(Silencio total. Tres aviones donde había cuatro. En la base, el Turco agarra el pincel,
lo deja. Hay una estrellita que hoy no se pinta. El tarrito queda abierto toda la noche.)*

**PUMA (después de mucho, la voz quebrada):** Plata Fiel… a casa. Volvemos a casa.

### El locker *(esa noche — el plot twist. TODO IGUAL A LA 2.3 salvo una línea nueva 🟨)*

> **REGLA DE ORO (sin cambios):** todos VIERON la foto — mujer joven y hermosa, B&N — y por
> eso el chiste. Lo que nadie hizo nunca fue **darla vuelta**.

El Turco junta las cosas del Vasco. Abre el locker: la foto de siempre, la de los chistes.

**GITANO:** *(con una ternura triste)* La casada… Turco, dejámela ver una última vez.

*(El Turco la despega con cuidado de cirujano. Y al ir a envolverla, **la da vuelta.**
Atrás, con la letra dura de un tipo que no escribe nunca:)*

> **Rosa Elena Arrieta**
> **1926 – 1961**
>
> **"Te amo, mamá. Perdoname."**

**PUMA:** *(bajo, casi para sí)* Sesenta y uno.

**ESTEBAN:** El Vasco tenía quince años.

*(La mujer de la foto es joven porque nunca llegó a ser vieja.)*

**GITANO:** *(la voz rota)* …Toda la guerra lo cargamos con la casada. Toda la guerra,
Turco. Y estaba muerta. Y el tipo nunca dijo nada. Nos dejó reír. Nos regaló el chiste para
que tuviéramos de qué reírnos.

**GITANO:** ¿Y el "perdoname"? ¿Perdoname de qué?

*(Silencio. Nadie tiene la respuesta.)*

**GITANO:** Che, Puma. Vos que lo conocías de antes. Lo del puerto, lo del hermano preso…
¿era verdad algo de eso?

**PUMA:** *(sin dar vuelta la cara)* No sé, Facundo.

**GITANO:** ¿Cómo no vas a saber?

**PUMA:** No sé. Nunca se lo pregunté. Un tipo que vuela como volaba él no me tiene que
explicar de dónde vino. *(mira la foto)* Y ahora ya no me lo va a contar nadie.

🟨 **GITANO:** *(agarrando el mate frío que tiene en la mano desde hace una hora)* **Tres
años le cebé mate a este culiao. Tres años, desde la escuela de aviación.** *(pausa)* Y
nunca me dijo ni de qué cuadro era. *(se ríe y llora a la vez)* Ni de qué cuadro era,
Turco.

*(🟨 CAMBIÓ: antes decía "cuarenta días". Ahora la escuadrilla se conoce de AÑOS — la
guerra no inventó la hermandad, la puso a prueba. Y el dato alimenta el misterio: tres años
de mate y ni el cuadro le sacó.)*

**EL TURCO:** *(envuelve la foto en su pañuelo, se la guarda en el mameluco)* …Me la quedo
yo hasta que vuelva a su casa. *(a la foto, bajito)* Señora: su hijo fue el mejor de todos
nosotros.

### El cuaderno (tierra) *(sin cambios — la muerte del jujeño)*
> *Pá:*
>
> *Perdí a alguien hoy. Ramírez, el jujeño de la radio. Dieciocho, como yo. Una esquirla.
> Estábamos hablando de qué íbamos a comer primero al volver —él decía tamales, yo decía
> milanesas— y en la mitad de la palabra "tamales" dejó de estar. Así de rápido, pá. Así de
> nada.*
>
> *Nadie nos preparó para esto. Tres meses. Nos enseñaron a marchar y a tender la cama. No
> a que el de al lado se apague en la mitad de una palabra.*
>
> *El Colorado me dijo "llorá todo hoy, pibe, que mañana no va a haber tiempo". Lloré todo,
> viejo. ¿Vos también perdés gente ahí arriba? ¿Cómo se hace? Ya sé que no me vas a
> contestar. Igual te lo pregunto. A alguien se lo tengo que preguntar.*
>
> *En el cuaderno dibujé la radio del jujeño sola en el pozo. No me salió dibujar más nada
> hoy.*
>
> *Mateo.*

*(🟨 CAMBIÓ una cosa enorme por ausencia: **ya no hay "fragmento de la carta del padre"
después de esta misión.** Padre e hijo perdieron a alguien el mismo día, cada uno sin saber
del otro, y ahora NADIE le contesta a Mateo — ni siquiera una carta que no se manda. La
pregunta "¿cómo se hace?" queda flotando sola. El jugador es el único que escuchó a los
dos.)*

---

## 🟨 MISIÓN 8 — "El batir de alas" *(ex M7 — EL SOBREVUELO. Cambió: la ambigüedad.)*
*25 de mayo, segunda salida. Boss: Atlantic Conveyor.*

### Briefing *(sin cambios)*
**PUMA:** Por el Vasco. Sin gritos, sin euforia. Lo hacemos y volvemos. Todos. ¿Me oyeron?
Todos.

**ESTEBAN:** Puma… la vuelta pasa cerca de los montes. Del monte de Mateo.

**PUMA:** *(lo mira largo)* …Tenés treinta segundos de desvío y ni uno más. Y si me
preguntan, yo no vi nada.

**GITANO:** Nadie vio nada. Andá a saludar al pibe, Tero.

### La misión *(sin cambios)*
El Conveyor. En el epílogo se sabrá que su capitán, **Ian North**, murió ayudando a evacuar
a su tripulación: otro valiente del otro lado.

### Epílogo — los treinta segundos 🟨 *(CAMBIÓ: Mateo SÍ lo reconoce — por el terito. Tero
es el que nunca va a saber.)*
Esteban se descuelga, baja, el monte aparece. Cámara lenta. Cruza a altura de árbol —tan
bajo que los pibes sienten el trueno en el pecho— y **bate las alas**: una a la izquierda,
una a la derecha. Te veo. Estoy acá.

*(Cuadro de tierra, cámara lenta: el Skyhawk plateado pasando ENORME sobre el pozo, y en el
fuselaje, un segundo apenas, nítido para el que sabe mirar: **el terito pintado.** Corte a
la cara de Mateo: la boca abriéndose. Él SABE. Lo sabe desde la cocina de marzo: "yo al
terito lo reconozco antes que a vos".)*

*(Cuadro siguiente: decenas de casquitos, brazos en alto, gorros revoleados. Y un pibe
flaco parado al borde del pozo, agitando un cuaderno contra el cielo, gritando un nombre
que el viento se lleva.)*

🟥 **ESTEBAN:** *(en cabina, buscando con los ojos — pero el monte es una multitud de
casquitos iguales y la velocidad no perdona)* …¿Estás ahí, Mateo? ¿Alguno de esos sos vos?
*(el monte ya quedó atrás)* …Tenías que ser vos. Alguno tenías que ser vos.

**PUMA (radio, suave):** Vamos, Tero. Vamos a casa.

*(🟨 LA REGLA — INVIOLABLE Y ASIMÉTRICA: **Mateo lo reconoció — vio el terito. Tero nunca
va a saber si Mateo lo vio. Nunca se entera. Ni en M14, ni en el Final B, nunca.** El
jugador SÍ lo sabe — va a leer la página del cuaderno — y no puede avisarle. Esa asimetría
es el cuchillo del juego: el jugador carga una certeza que el padre se muere o envejece sin
tener.)*

### El cuaderno (tierra) — la página del cielo 🟨 *(la certeza de Mateo, recuperada)*
> *¡¡PÁ!!*
>
> *TE VI. Hoy pasó un Skyhawk tan bajo que la turba tembló, y le vi EL TERITO, pá, el
> terito pintado abajo de la cabina, TU pájaro, y batió las alas UNA A CADA LADO, y yo
> grité tu nombre delante de todos y no me importó nada. "¡Es mi viejo! ¡El del terito es
> MI VIEJO!", y los pibes saltaban y te saludaban y me abrazaban a mí, y por un minuto
> entero acá abajo NADIE tuvo frío.*
>
> *El Colorado dice que un avión que bate las alas te está diciendo "te veo". ¿Me viste,
> pá? Éramos un montón de cascos iguales ahí abajo. No importa. Yo sí te vi. Te vi el
> pájaro y te vi a vos.*
>
> *Hoy dibujé la mejor página del cuaderno: el monte entero desde arriba, como lo habrás
> visto vos, todos nosotros chiquitos saludando, y el avión con su terito batiendo las
> alas. Ésta te la doy en la mano cuando vuelvas. "¿Viste que te reconocí?", te voy a
> decir. Ya quiero ver la cara que vas a poner.*
>
> *Volá bajo. TE VI.*
>
> *Mateo.*

*(La única vez que padre e hijo comparten un plano — treinta segundos, trescientos metros.
🟨 Y la asimetría queda sellada: **Mateo tuvo su certeza y murió con ella. Tero se queda
con la pregunta para siempre.** "¿Me viste, pá?" — la pregunta de Mateo — y "¿alguno de
esos sos vos?" — la de Esteban — nunca se contestan entre sí. Solo el jugador tiene las dos
mitades. Esta página vuelve al final como una puñalada.)*

---

# MOVIMIENTO III — SOLO

## 🟨 MISIÓN 9 — "El pibe" *(ex M8 — MUERE EL PICHÓN. Cambia: sin fragmento del padre.)*
*Boss: centro logístico de San Carlos. La bisagra del juego.*

### Briefing *(sin cambios)*
**PUMA:** Pichón, vos pegado a mí. No te separás ni para respirar.

**PICHÓN:** Capitán… ¿usted cree que sirvió de algo? Todo esto. ¿Vamos a ganar?

**PUMA:** *(honesto)* No sé, Pichón. Pero sirvió. Cada vez que entramos, allá abajo hay un
pibe que respira un día más. Para eso sirve. No para la bandera del mástil: para el pibe.
Siempre fue por el pibe.

**ESTEBAN:** *(pensando en alguien agitando algo contra el cielo)* …por el pibe.

### La misión / la muerte *(sin cambios)*
El infierno absoluto. A la salida, un misil que venía para Esteban gira… y engancha a
Pichón, que cubría su cola. **El pibe muere en el lugar exacto del padre.**

**PICHÓN (sorprendido, casi un nene):** …ah. Me dieron. ¿Capitán? Me dieron. No quiero…
todavía no quiero—

*(Estática. El mar.)*

**GITANO (destruido):** ¡Era un pibe, Puma! ¡Lo trajimos a la guerra y era un PIBE!

**PUMA (roto):** …lo sé, Facundo. Lo sé.

**ESTEBAN:** Venía para mí. Ese fierro venía para mí y se lo comió él.

### La libreta *(esa noche — 🟨 se agrega el golpe del "un cuarto")*
El Turco junta las cosas del Pichón. Debajo del catre, la **libreta de tapas de hule**:
flechitas, cortes de fuselaje, cálculos, aviones imposibles.

*(La hojea despacio. 🟥 Y a mitad de la libreta se detiene: página tras página de inventos
que nunca mencionó. Carenados, mezclas, trompas, cosas sin nombre. El Turco vuelve una
página, la compara con lo que tienen puesto los aviones ahí nomás, y hace la cuenta que
nadie le pidió: **todo lo que llegaron a probar juntos es un cuarto de lo que hay acá
adentro.** Un cuaderno de Da Vinci con olor a grasa. El pibe no era un ayudante con ideas:
era un ingeniero entero, y nadie se dio cuenta a tiempo. Ni él.)*

**EL TURCO:** *(a la libreta, bajito)* …Vos y yo tenemos trabajo, pibe.

*(Desde acá, las mejoras salen de la libreta: el Turco de noche, descifrando la letra. El
ritual se vuelve fantasma: "…A ver, pibe. Mostrame.")*

### El cuaderno (tierra) — Claribel *(sin cambios)*
> *Pá:*
>
> *Repartieron cartas de escuelas, "para un soldado argentino", de pibes que no nos
> conocen. A mí me tocó la de una nena de nueve años, Claribel, de Villa Mercedes, San
> Luis. Me dice: "Querido soldado: no te conozco pero te quiero. Mi seño dice que estás
> cuidando algo nuestro. Cuidate vos también. Cuando seas viejito contame cómo era el mar
> de ahí." Y abajo dibujó un sol, un avión y un soldado con una flor.*
>
> *Lloré como un tonto, pá. Una nena que no me conoce me pidió que llegue a viejo. Le voy a
> contestar que sí. Es la única orden que pienso cumplir a rajatabla.*
>
> *Tengo miedo, te lo digo por primera vez. Mucho miedo. Pero no del frío ni del hambre:
> miedo de no verte más. Si pasa algo, quiero que sepas que no te guardo nada. Sé que
> moviste todo. Un padre no puede más que todo.*
>
> *Mateo.*

*(🟨 Sin fragmento del padre después. "Un padre no puede más que todo" queda sin respuesta
— Esteban nunca lo lee. El único que carga la frase es el jugador.)*

---

## 🟥 MISIÓN 10 — "Los primos" *(NUEVA — leer entera. Los Mirage del Perú.)*
*Primeros días de junio. Escolta de entrega. Sin muertes — el respiro con esperanza.*

> **Base histórica:** el Perú transfirió diez Mirage 5P a la Argentina durante la guerra.
> Los aviones existieron. El vuelo de entrega existió. Lo que el juego agrega es ternura.
> *(Verificación de detalles → PREGUNTAS_HISTORICAS.md.)*

### Briefing (aire)
La escuadrilla está en el piso: dos muertos en dos semanas, tres pilotos donde había cinco,
los aviones atados con alambre y libreta. El briefing es corto porque no queda ánimo para
briefings. Y entonces Cóndor, en vez de dar la orden, da una noticia.

**CÓNDOR:** Plata Fiel, aquí Cóndor. Hoy no van a pegar. Hoy van a recibir. Rumbo dos-
siete-cero los espera un vuelo amigo entrando desde la cordillera. Escoltarlo a casa.
*(pausa, y por única vez la voz de Cóndor suena a persona)* Vayan a ver. Les va a hacer
bien.

**GITANO:** *(a Esteban, subiéndose)* ¿"Vuelo amigo"? ¿Qué carajo es un vuelo amigo? ¿Nos
mandan facturas voladoras?

### La misión
Vuelo de encuentro sobre el mar y escolta de vuelta — sin combate real: alguna patrulla
lejana que se espanta, clima cerrado, el desafío es la formación y la nafta. Y entonces, en
el punto de encuentro, **aparecen del sol: una formación de Mirage nuevos, brillantes,
volando prolijo.** En los planos: escarapelas argentinas recién pintadas, todavía
frescas.

**GITANO:** *(en la radio, sin entender)* ¿Y estos? ¿De dónde salieron estos?

**VOZ PERUANA (radio, acento limpio, cálido):** De más arriba de lo que ustedes vuelan,
argentino. *(pausa)* Aquí un paisano ayudando a otro paisano. Estos aviones son de ustedes
ahora. Cuídenlos, que vienen con cariño del Perú.

*(Silencio en la frecuencia. La escuadrilla vuela en formación con los recién llegados, el
mar abajo, la tarde dorada. Nadie dice nada por un rato largo.)*

**PUMA:** *(la voz más baja que nunca)* …Gracias, hermano. Buen retorno.

**VOZ PERUANA:** Buena caza, hermanos. Y bajito, ¿ah? Que ya aprendimos cómo vuelan
ustedes. *(la formación peruana de entrega rompe hacia el oeste, y al irse —uno por uno—
**baten las alas.**)*

### Epílogo (aire)
La base con aviones nuevos y mecánicos llorando de alegría sin admitirlo. El Turco camina
alrededor de un Mirage como quien conoce a un sobrino.

**EL TURCO:** *(tocando la escarapela fresca con un dedo)* Pintada ayer, m'hijo. Ayer.
*(pausa)* Hay gente buena en todos lados, ¿viste? Lo que pasa es que no nos dejan
conocernos.

*(El Turco acaba de decir, sin saberlo, la frase de la tesis. El jugador la va a volver a
leer antes de los créditos, firmada por un veterano de verdad.)*

### El cuaderno (tierra) 🟥
> *Pá:*
>
> *Corrió una bolilla rarísima hoy: que llegaron aviones nuevos. Que los mandó Perú. Así,
> de regalo, como quien te presta la cortadora de pasto. El Colorado dice que los correntinos
> y los peruanos se entienden porque los dos saben lo que es que te miren de arriba.*
>
> *Yo no sé si será verdad lo de los aviones. Pero me gustó pensarlo: que en algún lado hay
> gente que no nos conoce y nos manda cosas que vuelan. Como Claribel con su carta, pero en
> grande.*
>
> *Dibujé un avión con un poncho. No me salió. Te lo dejo igual para que te rías.*
>
> *Mateo.*

---

## MISIÓN 11 — "Lo que no se dice" *(ex M9 — el respiro tenso. Solo renumerada.)*
*8 de junio, Fitzroy. Boss: RFA Sir Galahad.*

### Briefing *(sin cambios)*
**PUMA:** Pegados, muchachos. Por el Vasco. Por el Pichón. Hoy volvemos todos. TODOS.

*(Gitano tiene el mate en la mano y no lo ceba: se le enfría entero y nadie se lo dice.)*

**ESTEBAN:** Puma. ¿Se te fue alguna vez esto de acá? *(se toca el pecho)*

**PUMA:** *(como quien informa el clima)* No. Se te suma otro y otro y otro, y un día te
das cuenta de que ya no te entra más, y seguís volando igual. Eso es todo el secreto, Tero.
No hay más secreto que ese.

### La misión / Epílogo *(sin cambios)*
Después del Pichón, el jugador espera el próximo golpe. **Y el golpe no llega.** Vuelven
los tres. El Turco pinta tres estrellitas y se toca el bolsillo del mameluco — el gesto que
viene haciendo desde la noche del Vasco.

### El cuaderno (tierra) *(sin cambios — el plan del Colorado)*
> *Viejo:*
>
> *Nos mueven a los montes que rodean Puerto Argentino. Dicen que los ingleses vienen por
> tierra. El Colorado no se me despega: "vos y yo salimos juntos de acá, correntino de
> adopción". Me dice así porque le prometí ir a Corrientes.*
>
> *Anoche me contó todo el plan: llegamos, comemos un asado en tu casa, después nos tomamos
> el micro a Corrientes y le presento a la hermana. Lo tiene pensado hasta el detalle del
> micro, pá. Qué manía la de este tipo de planear cosas lindas en el peor lugar del mundo.*
>
> *Mateo.*

*(Ningún presagio explícito. El Colorado planeando un asado es todo lo que hace falta.)*

---

## 🟨 MISIÓN 12 — "El ángel de Corrientes" *(ex M10 — MUERE CORREA. Cambian: los jazmines,
el tallado, la línea final de Mateo.)*
*8 de junio, segunda salida. Boss: RFA Sir Tristram.*

### Briefing *(sin cambios)*
**PUMA:** Otra vez. Ahora.

*(Nada más. Se suben.)*

### La misión — el corte a tierra *(estructura sin cambios; la escena crece 🟨)*
A mitad del vuelo, el juego rompe su regla de montaje y **corta a tierra**: hay cosas que
no pueden esperar al final del nivel.

**Imagen:** el monte. Bombardeo naval. Mateo y Correa en el mismo pozo. Un silbido que
crece.

**CORREA:** ¡Abajo, correntino! ¡ABAJO!

*(Correa empuja a Mateo al fondo y le pone el cuerpo encima. Blanco. Humo. Tierra que
llueve. Mateo abajo, entero. Correa arriba, no.)*

**MATEO:** ¡Colorado! ¡No, no, no! ¡Dijiste que salíamos juntos! ¡DIJISTE QUE SALÍAMOS
JUNTOS!

🟨 **CORREA (apenas, buscándole la mano — habla dando por hecho que Mateo sobrevive, y eso
es lo que parte al medio):** …Vos salís, chamigo. Vos salís seguro. *(le aprieta la mano)*
Escuchame que es importante. Cuando la veas a la Claribel… decile que la quiero. Y llevale
jazmines. **Le gustan los jazmines. Regalale jazmines la primera vez que la veas.** *(casi
sonriendo)* …Vas a quedar como un señor, angá. Ella se lo merece… y vos… vos me la vas a
cuidar como yo te—

*(Se va. No termina la frase. La frase no hace falta.)*

*(Un cuadro quieto: la media de lana de M1 asomando de la mochila. **La foto gastada de la
hermana.** El mate. Todo el inventario de un hombre bueno. 🟨 Mateo, con la mano que le
queda libre, saca la foto de la mochila de Correa y se la guarda en el cuaderno — donde van
las cosas que hay que devolver en persona.)*

> 🟨 *(NOTA: la hermana del Colorado se llama **Claribel**… no — ver Notas §10: son DOS
> Claribeles distintas o se renombra una. **DECISIÓN TOMADA: la hermana se llama TERESA.**
> "Claribel" queda solo para la nena de San Luis. Corregir en toda mención anterior: la
> hermana de Correa = Teresa.)*

### Epílogo (aire) 🟨 *(CAMBIÓ: ya no existe "pregunta si hay carta" — no hay correo)*
Esteban vuelve sin saber nada. 🟥 En la pista, el Turco le comenta al pasar que "abajo los
están moliendo a bombardeo naval, m'hijo. Los montes. Anoche y hoy". Esteban mira el mapa
de la pared — el punto que tiene subrayado hace semanas — y no dice nada. El jugador sí
sabe lo que pasó en ese monte. Esa asimetría es el juego entero en una pantalla.

### El cuaderno (tierra) — la del ángel 🟨 *(REESCRITA en sus líneas finales)*
> *Viejo:*
>
> *Se me murió el Colorado. Me tapó con el cuerpo. Estoy vivo porque él ya no. Escribo y
> tacho y vuelvo a escribir porque no hay manera de que esta frase quede bien: un tipo que
> conocí hace dos meses se murió por mí, y yo no pude hacer nada más que estar abajo.*
>
> *Ahora entiendo algo horrible, pá. Todo este tiempo yo estuve protegido y no lo sabía del
> todo. El Colorado era mi techo. Acá siempre hubo dos clases de conscripto, los que tienen
> un ángel y los que no. Yo tuve el mejor. Se me murió el ángel, viejo.*
>
> 🟨 *Hoy agarré su navaja —la del abuelo, la que me regaló— y tallé en la viga del pozo,
> bien grande, para que lo lea cualquiera que caiga en este agujero después de nosotros:*
>
> *VAMOS A VOLVER*
> *LOS PIBES DE MALVINAS*
>
> *Me salió torcido y me importa nada. Lo tallé con la navaja de un correntino que cumplió.
> Que quede acá clavado aunque nosotros no quedemos.*
>
> 🟨 *Necesito salir de acá, pa. No aguanto más. Estoy solo. Me quiero ir a casa, pa. Me
> quiero ir a casa.*
>
> *Mateo.*

*(🟨 CAMBIÓ: ya no dice "sos lo único que me queda" — tiene madre, casa, una vida. El pibe
no filosofa: se quiere ir. Y el tallado ya no es en una culata de fusil ni en un árbol — en
Malvinas casi no hay árboles: es en la viga del pozo, con la navaja del Colorado. El regalo
del correntino escribe la frase del juego.)*

---

## 🟨 MISIÓN 13 — "La última mesa" *(ex M11 — el asado. Cambios grandes: la línea épica del
Gitano, el partido, y LA CARTA — la única del juego.)*
*11 de junio. Apoyo a los montes.*

### Briefing 🟨
La superioridad tecnológica ya inclinó la guerra. Quedan Puma, Gitano y Tero. La misión:
apoyo a los montes — espantar a las fragatas que martillan las posiciones argentinas de
noche. Y llega el dato que arma el final: el regimiento de Mateo quedó en primera línea,
bajo ese bombardeo.

**ESTEBAN:** Puma. Está ahí. Mi hijo está en ese monte, y le están tirando desde el mar con
todo lo que tienen. Si nadie calla esos cañones esta noche, a la madrugada no hay monte.

**PUMA:** *(silencio largo)* Es un viaje de ida, Tero. Esa flota tiene encima toda la
defensa antiaérea que les queda. Y la Chancha está rota desde la noche del cordobés — vuela
corto, no llega al sur. Sin Chancha no hay nafta de vuelta. ¿Entendés lo que te digo? No
hay vuelta… asegurada. *(pausa)* Hay vuelta si sale todo perfecto. Nunca sale todo
perfecto.

**ESTEBAN:** Entonces no me pidas que vuelva. Pedime que llegue.

🟨 **GITANO:** *(se para, y por única vez la tonada no trae chiste — trae fuego)* ¿Solo?
¿Vos estás en pedo, culiao? **Seis veces me trajiste vivo a casa. SEIS. Y la Chancha se
rompió por traerme a MÍ.** Hoy te toca cobrar. Hoy el cielo te lo abrimos nosotros, aunque
haya que empujar los misiles con la mano. ¡VAMOS, CARAJO, QUE VAMOS A BUSCAR AL PIBE!

**PUMA:** *(los mira; mira la foto del Vasco y la gorra del Pichón colgadas en la pared;
sonríe por primera vez en tres misiones)* …Plata Fiel completa, entonces. Una vez más.

*(🟨 NOTA DE RÉGIMEN: la misión de mañana se habla como lo que es — **distraer y volver**.
Riesgo enorme, no sacrificio anunciado. Nadie dice "no volvemos". El Turco no despide
héroes: espera a TRES para el desayuno. El jugador teme lo que teme cualquier espectador en
el final de una buena película — pero nadie se lo confirma.)*

### La misión *(sin cambios)*
Apoyo a los montes: por debajo del avión, pozos, casquitos — los mismos del sobrevuelo,
ahora bajo fuego. Podés volar sobre ellos y no podés hacer nada salvo espantar barcos.

### Interludio — el último asado *(cambia una línea 🟨)*
Detrás del hangar, un medio tambor con brasas. El Turco consiguió carne, nadie pregunta
cómo. Gitano canta bajito una zamba, desafinando con dignidad.

**GITANO:** Che, ¿saben que mañana debuta Argentina en el Mundial? En España. Contra
Bélgica.

**PUMA:** *(mirando el fuego)* Mirá vos. Argentina juega mañana.

🟨 **GITANO:** Acá también juega Argentina mañana. **Pero este partido no van a pasarlo por
la tele.**

*(Nadie se ríe. El Turco saca del mameluco la foto de la madre del Vasco y la apoya contra
la damajuana, de cara al fuego. Al lado, la libreta del Pichón. Los que no están en la
mesa, en la mesa.)*

### La única vez que el Gitano habla en serio *(sin cambios)*
**GITANO:** El "perdoname" del Vasco no me lo puedo sacar. *(pausa)* Yo sé lo que es tener
algo que pedirle perdón a la vieja de uno.

*(Puma no dice nada. Le da lugar.)*

**GITANO:** Mi viejo pegaba. Fuerte, seguido, a todos. Yo me crié adivinando de qué humor
venía por cómo sonaba la puerta al abrirse. *(ceba, pasa el mate)* Y un día decidí que yo
iba a ser exactamente lo contrario de eso. Todo lo contrario, todo el tiempo, aunque me
costara. *(mira el fuego)* Así que no, muchachos: no soy gracioso. Soy lo contrario de mi
viejo. Es distinto. Cuesta más.

**EL TURCO:** *(después de un rato largo)* Te salió bien, cordobés.

**GITANO:** *(la sonrisa volviendo)* Bueno, basta. No se lo cuenten a nadie que me arruinan
el personaje.

**ESTEBAN:** *(mirando la foto; al Turco)* ¿Me la prestás mañana? La llevo conmigo. Que la
vieja vuele una vez con la escuadrilla del hijo.

**EL TURCO:** *(asiente; no puede hablar. Después, alzando el vino en tetra)* Por los que
no están en la mesa.

**TODOS:** Por los que no están.

### El cuaderno (tierra) — la última página *(sin cambios de contenido)*
> *Viejo:*
>
> *Ahora sé lo que es estar solo. Bordón desapareció, dicen que se mandó a mudar —los
> Bordón siempre encuentran cómo—. Quedamos los pibes solos, cuidándonos entre nosotros.
> Todos correntinos de adopción ahora: nos tapamos, nos repartimos, nos aguantamos. En el
> peor lugar del mundo todavía hay pibes tapando a otros pibes. Eso también es la Patria,
> pá. Eso, y no los discursos.*
>
> *¿Sabés qué me sostiene? La página del cuaderno. La del monte visto desde arriba, la del
> día que pasaste con el terito y batiste las alas. Cuando pega el miedo la abro y me digo:
> yo lo vi. Lo vi al pájaro y lo vi a él. Eso no me lo saca nadie, ni el frío, ni Bordón,
> ni los ingleses.*
>
> *Acá los pibes cantan bajito para no llorar. Ojalá algún día, allá, alguien cante por
> nosotros. Aunque sea una vez. Aunque sea bajito.*
>
> *Si no nos vemos: gracias por el cielo. Por el sapito, por el Rastrojero, por enseñarme a
> mirar para arriba. Voy a estar mirando para arriba hasta el final, buscándote. Si escucho
> un motor bien bajo, bien rasante, voy a saber que sos vos, y voy a estar tranquilo.*
>
> *Cuidámela a mamá. Y perdón por las mentiras del guiso, pero decíselas igual.*
>
> *Ser valiente no es no tener miedo, pá. Es escribirte igual, con la mano temblando.*
>
> *Te quiero, viejo. Volá bajo.*
>
> *Mateo.*

### 🟥 LA CARTA — la única del juego *(esa noche, después del asado)*
*(Las brasas apagándose. Esteban solo, con una hoja de block militar apoyada en la rodilla.
La cámara lo muestra ESCRIBIR — la letra apretada, los tachones, la lapicera que se frena y
sigue — pero **no deja leer ni una línea**. Escribe mucho. Tacha más. Al final dobla la
hoja en cuatro, despacio, y la mete en el sobre SIN cerrar. En el frente escribe un solo
nombre: **Norma**.)*

*(La deja en su locker, apoyada contra la pared del fondo, parada, como quien deja algo que
espera no necesitar. Cierra el locker. Se va a dormir.)*

*(El jugador no sabe qué dice. No lo va a saber… salvo en uno de los dos finales. Esa
ignorancia es deliberada: es la misma de Norma durante años con el cuaderno — saber que
existe algo escrito y no poder leerlo todavía.)*

---

# MOVIMIENTO IV — EL TERO

## 🟥 MISIÓN 14 — "El tero" *(REESCRITA ENTERA — detalle de diseño en MISION_FINAL.md)*
*Madrugada del 12 de junio. **Contrarreloj.** El boss es el reloj.*

> Diseño completo del nivel (fases, densidades, timing, layout) en
> [MISION_FINAL.md](MISION_FINAL.md). Acá va el guion de las escenas.

### Cómo se enteran — de rebote, por la radio
La sala de radio, de noche, los tres escuchando el tráfico de Cóndor como todas las noches.
Y en el medio de un parte de rutina, sin dramatismo:

**CÓNDOR** *(leyendo)*: …bombardeo naval previsto sobre posiciones del sector
[coordenada], efectivo 06:00. Unidades en el área: elementos del Regimiento…
*(estática)* …conscriptos clase '63…

*(Tero no escucha el resto. Esa coordenada la tiene subrayada en el mapa hace semanas. Se
levanta despacio, va al mapa, apoya el dedo. Puma lo mira. El Gitano deja el mate por la
mitad. Nadie grita. Corte.)*

### Antes de despegar — el ritual invertido
La pista, de noche, tres Skyhawks bajo la luna. El Turco terminó de cargarlos; les habla
bajito a los aviones, como a caballos antes de la tormenta.

**CÓNDOR:** Plata Fiel, aquí Cóndor. No tengo… Plata Fiel, no tengo autorización para esa
salida. Vuelvan a—

🟥 *(Puma mira la **foto pegada en su panel**: tres generaciones de uniforme, y él de chico
a upa del abuelo. La toca con dos dedos.)*

**PUMA:** Que me perdone el abuelo. *(click. Apaga a Cóndor.)* Che, Tero. Veinte años con
ese pájaro pintado. ¿Alguna vez te preguntaste qué hace el tero cuando el zorro se le
acerca al nido?

**ESTEBAN:** *(la voz baja)* …Grita lejos del nido. Se hace el herido.

🟨 **PUMA:** Da la vida distrayendo, y el nido queda a salvo. *(le aprieta el hombro)* Hoy
tu nido está en ese mapa. Hoy todos somos teros. Nosotros distraemos — vos entrás y sacás a
tu pibe. ¿Escuchaste, Aldao? **A tu pibe.**

**EL TURCO:** *(le mete el pincel de las estrellitas en el bolsillo del traje)* Me lo
devolvés mañana. ¿Me oíste? Mañana. Me lo trae usted personalmente, Primer Teniente, o lo
voy a buscar yo a nado. 🟨 *(a los tres, señalándolos con el dedo, uno por uno)* Tres
desayunos. Mañana sirvo TRES desayunos. El que falte me arruina la cuenta.

*(🟨 CAMBIÓ el régimen entero de la despedida: el plan es distraer Y VOLVER. El Turco
espera a tres. Nadie anuncia sacrificios. Tres turbinas encienden en la noche.)*

### Fase 1 — el reloj *(🟥 contrarreloj)*
Al despegar, el objetivo: llegar antes de las 06:00. Margen cómodo. El HUD muestra la hora
sin alarma. Y a mitad de camino, la única radio de toda la misión — el Turco, por handy,
entre estática:

**TURCO** *(lejísimo, cortado)*: …me copian… cambió el… ¡ADELANTARON EL BOMBARDEO! ¡No es
a las seis, es—! *(estática. Nada más.)*

*(El margen cómodo acaba de morir. Cuenta regresiva visible. De acá al final, la misión es
una flecha.)*

### Fase 2 — la pantalla *(🟥 la muerte del Gitano — EN ACCIÓN, sin anuncio)*
El corredor de piquetes y la fragata de guardia. El Gitano se abre alto y ruidoso — el
señuelo más alegre del Atlántico Sur — para que Tero y Puma pasen pegados al agua. Los
misiles suben hacia él. **El Gitano quiebra como quiebra siempre** — la gambeta cordobesa —
y los misiles se desvían… y el último, ya vencido, **lo alcanza de rebote en el quiebre
final.**

*(NADA de despedida por radio. Un destello al borde de la pantalla, la estela que se corta,
silencio de frecuencia. El juego NO se pausa: la pérdida ocurre en mundo, no en cutscene.)*

**PUMA** *(tres segundos después, la voz quebrada exactamente un milímetro)*: Plata 3
fuera. Sigan.

### Fase 3 — el capitán *(🟥 la muerte de Puma — el show y el kamikaze)*
Queda el enjambre de escolta: lo más denso del juego, imposible para dos. Puma se mete SOLO.
**Dos minutos de la mejor IA del juego**: maniobras que el jugador no puede ejecutar,
virajes que ningún tutorial enseñó, enemigos cayendo de a pares. El jugador pasa por el
costado viendo, en el resto de la pantalla, por qué este señor era el capitán.

Y entonces, sin música:

**PUMA** *(tranquilo, casi divertido — primera vez humano)*: Pifié. Me quedé sin nafta.
*(pausa)* **¡MANDALE, TERO!**

*(Endereza el avión contra el buque de escolta principal y se va entero, con las tres
generaciones pegadas al panel. La explosión más grande del juego. **Su muerte ES la puerta**:
abre el corredor final.)*

### Fase 4 — el vacío
Nada. Restos, humo, columnas de agua. Sin música: viento, motor, y el pitido suave del
reloj. El jugador, solo, con lo que hizo falta para llegar hasta acá. A lo lejos, la
silueta del buque de bombardeo en posición de tiro. Y detrás, en la costa, chiquito: el
sector de Mateo.

### El momento — las trayectorias que se cruzan 🟥
1. El jugador llega al alcance **justo cuando el reloj muere**. El juego pide soltar: un
   botón, imposible errar.
2. Esteban dispara. El misil corre bajo, rasante, como todo lo que este juego enseñó.
3. **Cinemática:** cuando al misil le faltan segundos, **el buque completa su salva** — sus
   proyectiles ya están en el aire, cruzándose EN PANTALLA con el misil argentino que va a
   matarlo. La venganza que llega y la desgracia que ya partió.
4. El misil impacta: el buque muere. **Y a lo lejos, la salva cae sobre el sector de
   Mateo.** Columnas de tierra a contraluz del amanecer.
5. **Plano de la cara de Tero, sin entender lo que acaba de ver.** Llegó. Ganó. No alcanzó.
   Tres segundos. Nada más.

🟨 **ESTEBAN (un susurro):** …Llegué, Mateo. Llegué. Estoy acá arriba, hijo. Por favor,
Mateo. Por favor.

*(Gira sobre el monte apagado con el TONEL BARRIL — la maniobra que el Pichón dejó escrita
"para cuando haya que volver a buscar a alguien". El jugador que lo sabe, lo reconoce.
Nadie lo subraya.)*

### 🟥 LA DECISIÓN — sin menú
Sobre el sector humeante aparece la última oleada: la reacción inglesa, de frente. Y el
juego le da el timón al jugador. **Sin cartel, sin opciones en pantalla.** El mar abierto a
la izquierda — el HUD marca la ruta a casa. La oleada al frente. **Lo que el jugador haga,
ES la decisión.**

---

# 🟥 LOS DOS FINALES

## FINAL A — QUEDARSE *(la vorágine)*
El jugador vira hacia la oleada. **El juego se lo da todo:** la música más grande de la
banda sonora explotando de una, munición que no se agota, todo el enjambre viniendo de
frente sobre el lugar donde murió su hijo. La sensación buscada es la del final de The Last
of Us: que el jugador SIENTA que quiere romper absolutamente todo — y que el juego lo deje.
Oleada tras oleada, insobrevivible por diseño, hasta que lo bajan. **El avión cae al mar y
Tero muere bien: peleando, entero, sobre el nido.**

### Epílogo A — la carta que no sabíamos
*(La base, vacía. El locker de Esteban abierto — el Turco, la cara de piedra, sacando las
cosas. Y contra la pared del fondo, parada, la carta. **"Norma."** Recién ahora el jugador
la lee — en la voz de Esteban:)*

> *Norma:*
>
> *Si estás leyendo esto es porque el Turco cumplió, así que primero: no te enojes con él,
> que él solo cumple.*
>
> *Mañana salgo a buscar al pibe. No te lo conté por teléfono porque me ibas a pedir que no
> vaya, y yo no te puedo decir que no a vos, así que mejor no te doy la chance. Perdoname
> la trampa. Es la única que te hice en veinte años.*
>
> *Al nene no lo pude sacar por los papeles. Voy a ver si lo puedo cuidar por el aire, que
> es el único idioma que hablo bien. Vos siempre decís que no sé decir las cosas, que todo
> lo digo arreglando el Rastrojero o cebando mate. Tenés razón. Por eso esta carta es
> corta.*
>
> *Te elegí a los veinte y te volvería a elegir ahora mismo, en esta pista helada, con el
> casco puesto. Al pibe lo hicimos bien, Norma. Lo hicimos tan bien que se puso la patria
> al hombro sin que nadie le enseñe. Eso es tuyo. Lo mejor de él es tuyo.*
>
> *Si volvemos, quemá esta carta y no me digas nunca que la leíste.*
>
> *Si no volvemos, escuchame esto porque es una orden y yo jamás te di una: viví, Norma.
> No te quedes de guardia en esa cocina. Vos me enseñaste todo lo que sé de querer a
> alguien — no me vas a discutir justo la última lección. Viví por los tres. Y cuando pase
> un avión bien bajo, bien rasante, no lo mires con pena: miralo con ese orgullo tuyo que
> asusta. Somos nosotros, yendo a verte.*
>
> *Esteban.*

*(Y de ahí, el marco: la carta llega a Norma en semanas. El cuaderno, años después — la
Viñeta P.0, que ahora el jugador entiende entera. Norma en la mesa con los dos papeles,
poniéndolos uno frente al otro, derechitos, como dos cubiertos.)*

*Cartel:* Nunca se leyeron. Vos los leíste a los dos.

## FINAL B — VOLVER *(el oculto, semi feliz)*
El jugador vira al mar. La oleada persigue un tramo y abandona. El vuelo de vuelta es largo,
sin enemigos, **con la nafta en rojo y el motor tosiendo**: la tensión no es si lo matan —
es si llega. Los últimos kilómetros los planea **como el sapito del arroyo**: tocando el
agua, una vez, dos veces. Llega a la costa argentina de panza, entre el pasto. Silencio.
Pasto. Viento. Está vivo.

### Epílogo B — el mate
*(Años después. La misma cocina de P.0 — pero esta vez, cuando golpean la puerta con la
encomienda, **abre Esteban.** Más viejo, más flaco, la mano que firma temblando apenas.)*

*(La mesa. El cuaderno. Esteban lo abre en la primera página: el arroyo, el Rastrojero, el
sapito. Pasa las páginas una por una — el Colorado con capa, el barco chueco, la radio sola,
el sol de Claribel, **la página del monte con el avión batiendo las alas** — y en esa se
queda. La toca con la mano abierta.)*

*(El Turco —viejo, de civil, la gorra en la rodilla— ceba. Norma les deja la pava llena,
apoya un plato de bizcochitos, y sale al patio. Se la ve por la ventana, de espaldas,
quieta, mirando el jazminero. Ella ya lloró lo suyo. Esto es de ellos.)*

**EL TURCO:** *(alcanzándole el mate)* …El pibe dibujaba bien, ¿eh?

**ESTEBAN:** *(sin levantar la vista de la página del monte)* Mejor que yo para todo.
*(pausa larga)* ¿Sabés que nunca supe si me vio? Ese día. Nunca supe.

**EL TURCO:** *(ceba, tranquilo)* …¿Y eso qué importa, m'hijo? Vos lo viste a él. Con eso
alcanza para toda una vida.

*(Esteban asiente. Toma el mate. Afuera, el jazminero. Sobre la mesa, el cuaderno abierto y
—apoyada contra la azucarera— la navaja del Colorado, que vino en la encomienda. Nadie
habla más. No hace falta.)*

*Cartel:* No todos los que volvieron, volvieron. Él sí. Le costó años entenderlo.

## *(Ambos finales →)* Cierre común
*Cartel:* El 14 de junio de 1982, tras setenta y cuatro días, cesaron los combates.

**NARRACIÓN** *(sobre fotografías reales: veteranos, el mar, Darwin, las cruces blancas)*:
"No volvieron el Vasco, ni el Pichón, ni el Gitano, ni el Puma. No volvió el cabo Aníbal
Correa, que murió tapando con su cuerpo a un pibe que conocía hacía dos meses. Del otro
lado del mar tampoco volvieron los suyos: pibes iguales a los nuestros, mandados por otros
que miraron la guerra desde tierra firme, calientes, lejos."

"Ninguno de ellos eligió esta guerra. La eligieron otros: los de los despachos, los de las
juntas, los de los discursos de balcón."

"A los que pelearon —a los de los dos lados— este juego los respeta por igual. La única
bandera que no saluda es la de los que los mandaron a morir."

### 🟥 La cartela de los que ayudaron *(antes de la frase final)*
> *A los pueblos que nos tendieron una mano cuando el mundo miraba para otro lado.*
> **Al Perú, el primero.**
> *(lista completa de países y aportes: verificar con el historiador antes de fijarla)*

### La frase — antes de los créditos *(sin cambios)*
> *"Allá hay gente tan buena como acá, lo que pasa es que no nos dejan conocernos.
> Si las naciones dejaran conocer a su gente buena, no viviríamos en este infierno."*
> — Diego Iorio

### Dedicatoria *(sin cambios)*
"Las Islas Malvinas continúan siendo objeto de un reclamo de soberanía por parte de la
República Argentina, sostenido por medios diplomáticos y conforme al derecho internacional."
"En homenaje a los caídos, a los veteranos y a sus familias. De los dos lados del mar. Y a
los mecánicos, que contaban lo que volvía."

### Escena post-créditos — "El pibe de la 10" 🟨 *(cambia el cartel final)*
El museo escolar, la vitrina con el cuaderno abierto en la página del monte. El pibe con la
10 de la tercera estrella.

**PIBE:** Seño… ¿y volvieron?

**SEÑO:** *(pausa)* Algunos. Otros se quedaron cuidando las islas.

*(El pibe apoya la mano en el vidrio, exactamente como Norma sobre la página.)*

🟨 *Cartel final, letra de Mateo:* **"Volveremos otra vez."**

---

# 🟥 9. GUÍA DE DIALECTOS *(nueva — aplicar a TODO el diálogo)*

Una marca cada tantas líneas, no en todas. Sin caricatura. *(Verificar vigencia 1982 de
cada regionalismo → PREGUNTAS_HISTORICAS.md.)*

| Personaje | Origen | Marcas |
|---|---|---|
| **Gitano** | Córdoba capital | "culiao" (afecto o insulto según tono), "¿qué hacé?", tonada estirada, diminutivos, remata con chiste |
| **Colorado** | Corrientes | "chamigo", "angá", pausado, dulzura guaraní, "pue" final |
| **Turco** | Tucumán (sirio-libanés) | "m'hijo", "changuito", refranes inventados, "esto no lo levanta ni Alá" |
| **Puma** | Castrense, 3 generaciones | Cero lunfardo; frases cortas; que UNA vez se le escape algo humano y se note muchísimo |
| **Vasco** | Mar del Plata (colectividad vasca) | Casi no habla; seco y al hueso |
| **Tero / Mateo** | Prov. de Buenos Aires | Rioplatense llano; Mateo escribe "pa"/"ma", nunca completo |
| **Pichón** | Entre Ríos | Habla rapidísimo cuando se entusiasma y se frena avergonzado a mitad de frase |
| **Norma** | — | No habla. Su registro es el silencio. |
| **Voz peruana (M10)** | Perú | Limpio, cálido, formal-cariñoso: "paisano", "hermanos" |

---

# 🟨 10. NOTAS DE PRODUCCIÓN *(las reglas — qué cambió y qué sigue)*

**1. 🟨 Los papeles.** El cuaderno es DIARIO: nada se manda, el padre nunca lo sabe. UNA
carta (Esteban → Norma, M13), ilegible hasta el Final A. El marco arranca en P.0, años
después. *(Muere: la regla de copiar cartas, los 5 fragmentos, las "dos preguntas".)*

**2. 🟨 El sobrevuelo (M8).** La cadena M8 → M13 → M14 se mantiene, pero con la regla
nueva: **nadie confirma nunca que se vieron.** Cada uno lo decide. El jugador tampoco tiene
la prueba.

**3. Los huevos son mecánica antes que discurso.** *(Sin cambios.)*

**4. La brecha tecnológica es jugable.** *(Sin cambios.)* 🟥 Y se suma: **Cóndor como radar
humano** — los A-4 no tenían radar; la señal de Cóndor va y viene, y cuando se pierde el
jugador queda ciego.

**5. El miedo inglés se cuenta con audio.** *(Sin cambios.)*

**6. 🟨 Las muertes.** Vasco (M7) y Pichón (M9): sin cambios. Correa (M12): + jazmines +
navaja. Gitano y Puma (M14): **reescritas** — Gitano muere EN ACCIÓN sin anunciarlo; Puma
muere mostrando por qué es el capitán, y su kamikaze abre el corredor. **El Turco despide a
tres esperando a tres.** Muertes en gameplay, nunca en cutscene que congele.

**6b. No telegrafiar.** *(Sin cambios: el presagio se hace con planes.)*

**7. 🟥 La decisión final: DOS salidas, sin menú.** Virar a la oleada (Final A, la
vorágine) o virar a casa (Final B, el oculto). No hay final "correcto". *(Muere el sistema
de tres opciones con textos; muere el "final canónico donde el padre no vuelve": ahora lo
decide el jugador de verdad.)*

**8. Los objetos hacen memoria.** *(Actualizado:)* la media de lana (M1→M12) · la foto de
la hermana de Correa —**Teresa**— (M6→M12→el cuaderno) · 🟥 **la navaja del Colorado**
(M3→M12 talla el VAMOS A VOLVER→la encomienda) · la foto de la madre del Vasco (M1/M4/M6
visible → M7 reveal → Turco → asado → bolsillo de Esteban) · la libreta del Pichón · el
pincel del Turco · 🟥 la foto de cabina de Puma (M14) · la página del monte (M8→M13→M14) ·
el cuaderno y la carta (todo el juego → la mesa).

**8a. La foto del Vasco se MUESTRA.** *(Sin cambios — tabla de apariciones ahora M1, M4,
M6, reveal M7. La pista dibujada, el engaño honesto.)*

**8a-bis. 🟨 Lo que el juego NO explica — ahora son CUATRO:** por qué Esteban no pudo sacar
a Mateo · de dónde venía el Vasco · de qué pedía perdón · 🟥 **si Mateo lo vio — pero solo
para TERO.** La cuarta es asimétrica: **Mateo SÍ lo reconoció (el terito) y el jugador lo
sabe por el cuaderno. El que nunca lo sabe es Tero** — se muere o envejece con la pregunta,
y el jugador, que tiene la respuesta, no puede dársela. Si alguien propone que Tero se
entere (una página que sobrevive, alguien que le cuenta): **no.**

**8b. Los backstories se cuentan UNA vez, de a rebote.** *(Sin cambios.)*

**9. 🟥 La asistencia.** La dificultad nunca frena la historia: asistencia progresiva tras
fallos repetidos. El que quiera desafío lo elige; el que quiera la historia, la tiene
garantizada. *(Del principio supremo, sección 0.)*

**10. 🟥 Nombres.** La hermana del Colorado se llama **TERESA** (Claribel queda solo para
la nena de San Luis — eran dos nombres pisados, resuelto acá).

**11. 🟥 Deuda activa.** La respuesta de Mateo a Claribel, escrita y nunca enviada, entre
las páginas del cuaderno — para el epílogo.

---

# 🟨 ANEXO — puntas para el historiador *(se agregan las nuevas)*

*(Todo lo de la 2.3 sigue vigente: Glamorgan verificado, Glasgow descartado, Broadsword con
licencia anotada, Fitzroy, estaqueamientos, festival, "Estamos ganando", rock nacional,
Galtieri, indicativos reales. Se suman:)*

- 🟥 **Mirage 5P peruanos (M10):** verificar fechas de transferencia, ruta de entrega,
  quiénes los volaron y si entraron en combate. La escena está escrita para sostenerse solo
  con el vuelo de entrega.
- 🟥 **Países que ayudaron (cartela final):** confirmar lista y qué aportó cada uno antes
  de nombrar a nadie. Perú al frente.
- 🟥 **Dialectos 1982:** confirmar vigencia de "culiao" (Cba) y "chamigo" (Ctes) en la
  época. Casi seguro sí.
- 🟥 **Matrículas C-2xx** (ver AVIONES_ESCUADRON.md): no usar números de células realmente
  derribadas.
- 🟥 **Malvinas sin árboles:** confirmado como regla de arte — ningún árbol en fondos de
  tierra. El tallado va en la viga del pozo.
- 🟥 **Correo de conscriptos:** verificar cuán errático era realmente el correo de tropa
  (sostiene la premisa del diario). El correo interno de la Fuerza Aérea, más directo,
  sostiene que la carta de Esteban llegue en semanas.
