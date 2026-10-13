# MISIONES SUELTAS

*Misiones secundarias que **se desbloquean jugando la campaña** y después **se pueden jugar por
separado**. Cada una sobre un hecho real de la guerra. Lista abierta: se anotan acá a medida que
aparecen, y en la página «Las catorce salidas» se muestran **después de la misión que las
desbloquea**.*

> **✅ La regla de todas las secundarias (autor, 9/10):** *"todas las misiones secundarias son
> mencionadas o comentadas por los peronsajes pudiendo jugarse en separado y desbloqueandose segun
> la campaña"*. **Cada una tiene que aparecer en la historia**, dicha o comentada por algún
> personaje, **se desbloquea según avanza la campaña** y **se juega aparte**. Las menciones hay que
> escribirlas — ver la lista abajo de todo.

> **El clima, regla de campaña (autor, 9/10):** *"DEL 2 hasta el 12 de mayo hay MUCHA NIEBLA, todas
> las misiones qe ocurran en esas fechas tienen MUCHA NIEBLA Y BRUMA"*. Toca al rescate del Belgrano
> (3 de mayo, además con temporal), al Super Étendard (4 de mayo) y a las que se fechen en ese
> rango.

> **Por qué varias salen juntas después de M4** *(autor, 9/10)*: *"Se desbloquean varias misiones
> secundarias porqe pasa mucho tiempo en el medio."* Entre M4 (4 de mayo) y M5 (21 de mayo) pasan
> diecisiete días sin misión de campaña.

> **No tocan la campaña.** No cambian la escalera de aprendizaje, ni el escuadrón, ni la historia
> de Tero y Mateo. Lo que se decida acá no hay que reflejarlo en `M#_CAMBIOS.md`.

---

## 🎮 PROPUESTA PARA LA DEMO / ACCESO ANTICIPADO (12/10)

> ✅ **El modo de misiones reales se llama «LIBRO DE VUELO»** — *«Misiones reales · 1982»* (13/10).
> Todas las misiones sueltas de este archivo que sean hechos reales van ahí.

> *"me gustaria tener algunas misiones basicas para "demo" o "acceso anticipado". (...) armar alguans
> misiones cortas literal sacadas de los acontecimietnos historicos, sin seleccion de aviones o quiza
> con seleccion segun lo que haya pasado ese dia en esa mision (...) A medida que vamos avanzando en
> la campaña vamos desbloqueando estas misiones "reales" qe sucedieron con todos los detalles
> historicos mas exactos posibles con algun adicional para diversion de juego. Que misiones sugeris
> como para tener variedad de aviones, y que tampoco sea un embole ni sea super complejo y largo,
> segun lo que tenemos armado hoy."*

**La idea:** la demo son **misiones reales cortas**, con el avión que voló ese día. Después, en el
juego completo, **son las mismas misiones sueltas que la campaña desbloquea**. Nada se tira.

**Propuesta: cuatro, una por avión, todo con lo que ya existe** (`data/planes.js`, `data/ships.js`):

| # | Misión | Fecha | Avión | Blanco (clase en el juego) | Qué se juega | Se desbloquea en la campaña |
|---|---|---|---|---|---|---|
| 1 | **El Sheffield** (S-03) | 4 de mayo | **Super Étendard** (`supere`) | Tipo 42 (`t42`) ✓ | al ras, subir, **Pulso** para cargar el Exocet, soltar y escapar. Con niebla | después de M4 |
| 2 | **La Glasgow** (S-06) | 12 de mayo | **A-4B** (`sky`) | Tipo 42 (`t42`) ✓ | pasillo clásico + la Chancha. La bomba la atraviesa y **no explota** | después de M4 |
| 3 | **La Ardent** (nueva, del aviso de M5) | 21 de mayo | **A-4Q de la Armada** (`a4q`) | Tipo 21 (`t21`) ✓ | pasillo en el estrecho; la Ardent ya averiada; Snakeye | después de M5 |
| 4 | **La Plymouth** | 8 de junio | **Dagger** (`dagger`, sin sonda) | fragata sola en el estrecho (Tipo 12: **no hay modelo**, usar `t21` provisorio) | **sin reabastecer**: la nafta es lo que llevás. *«¡Buque enemigo a las tres!»*. Vuelven todos | después de M11 |

**Por qué éstas:**
- **Cuatro aviones, tres maneras de jugar**: Pulso (Super Étendard), pasillo con Chancha (A-4B, A-4Q) y
  pasillo sin Chancha (Dagger).
- **Ninguna repite un blanco de la campaña**: la campaña juega el Coventry, el Antelope, Ajax, la
  Galahad. Así la demo **no adelanta la historia de Mateo**.
- **Un blanco cada una, cortas**, y con su aclaración real al final.
- **Ya están casi todas anotadas** (S-03, S-06; la Ardent y la Plymouth en `M5_CAMBIOS.md` · 6 y
  `M11_CAMBIOS.md` · 3).

**Opcional, como cierre:** **el Invincible** (S-05, 30 de mayo). El portaaviones ya existe (`cv`) y es
el más épico, pero es el más largo (Super Étendard + A-4C) y su resultado está discutido.

**Lo que no entra:** el Mirage «Mara» (nunca combatió) y el Pampa (no existía en 1982).

---

## S-01 · El rescate de los náufragos del Belgrano

**Estado:** ⬜ idea · *Pedida por el autor el 9/10/2026* · ✅ **se desbloquea al terminar M4**

> *"OTRA MISION QE NO tiene qe ver, seran misiones sueltas, anotar en otro lado, mision de aviones
> de rescate de sobrevivientes del belgrano."*

**El hecho:** el crucero ARA General Belgrano fue hundido el 2 de mayo de 1982, hacia las 16, y
cientos de tripulantes quedaron en balsas, con temporal, durante horas. Hubo una búsqueda desde
el aire para encontrarlos.

**Cuándo, según el autor:**

> *"Fecha, justo despuesd e M4"* · *"A PARTIR DEL 5 DE MAYO yta no habia sobrevivientes, la mision
> duro hasta el 9"*

**Confirmado con la Armada** *(argentina.gob.ar/armada/crucero-ara-general-belgrano)*:

| | |
|---|---|
| **2 de mayo, 16:02** | torpedeado; abandono a las 16:23 |
| **2 de mayo, a la noche** | se ordena la búsqueda, unas seis horas después |
| **3 de mayo** | los Neptune buscan con mal tiempo; las balsas derivaron unos 80 km al sudeste. Un Neptune las encuentra a mediodía, casi sin combustible. A las 17:50 el Piedrabuena reporta unas 30 balsas más |
| **4 de mayo, mediodía** | el Bahía Paraíso rescata a los últimos 18 vivos. Hay 770 sobrevivientes recuperados |
| **5 de mayo** | los barcos llegan a Ushuaia con los sobrevivientes |
| **hasta el 9 de mayo** | se siguen recuperando balsas, ya sin vivos |

**Los aviones de la búsqueda eran de la Armada, no de la Fuerza Aérea:** los Neptune 2-P-111 y
2-P-112 —uno voló unas nueve horas a muy baja altura—, y de apoyo un Beechcraft B-200, un Electra
L-188 y un Fokker F-28. Los barcos que rescataron: Gurruchaga, Bouchard, Piedrabuena y Bahía
Paraíso.

**✅ Decidido (9/10):** *"Si, desbloquiemosla"* — **se desbloquea en el menú al terminar M4**, y
la misión es **el 3 de mayo**, la búsqueda con vivos en el agua.

~~**🔵 Lo que hay que decidir:**~~ M4 es el 4 de mayo. **Si la misión va con fecha posterior a M4,
ya no hay a quién rescatar:** del 5 al 9 se recuperaron balsas con muertos. Puede ser una misión
muy dura y muy distinta —buscar sabiendo lo que vas a encontrar—, o se la ubica el 3 de mayo, la
búsqueda con vivos, y se desbloquea en el menú después de M4.

**Falta investigar:** desde dónde salieron los Neptune y cuántas salidas hubo por día.

**Por qué es distinta:** es la primera misión del juego donde no hay nada que atacar. El objetivo
es encontrar gente en el agua.

---

## S-02 · El Neptune: usar el radar para encontrar a la flota

**Estado:** ⬜ idea · *Pedida por el autor el 9/10/2026* · **se desbloquea**

> *"Otra mision deslboqueable, usar a este avion NEPTUME para LANZAR RADAR y obtener datos,
> explorar"*

**El avión:** el **Lockheed P-2 Neptune** de la Armada, el patrullero marítimo con dos motores de
pistón, camuflaje azul y verde y las anclas en las alas. El autor mandó una referencia (captura de
un video, con el avión visto desde arriba sobre las islas).

**La misión:** explorar **las islas**, encender el radar del avión y conseguir datos.

> *"las islas"* — agregado del autor, el mismo 9/10.

**⚠ Fecha (10/10):** los Neptune **se retiraron el 15 de mayo**, gastados. La misión tiene que ser
**antes**. Después los reemplazaron **dos Embraer EMB-110 que mandó Brasil en secreto**; no
encontraron blancos por el alcance y la distancia de la flota (`M7_CAMBIOS.md`, pedido 5).

**Da vuelta la mecánica del juego, y eso es lo lindo:** en toda la campaña el radar es del enemigo
y hay que esconderse de él. Acá el radar es tuyo, y **para usarlo hay que subir y prenderlo, que es
justo lo que te delata.** Asomarse, barrer, bajar antes de que te encuentren.

**Atada a M4:** el autor decidió que en M4 *"unos Neptune detectaron"* los buques (`M4_CAMBIOS.md`
· 2). Así pasó el 4 de mayo con el Sheffield, según lo que recuerdo — **falta confirmarlo con
fuentes**. Esta misión es la que hace posible M4.

**🔵 Para decidir:** cuándo se desbloquea, y si va atada a una fecha real.

---

## S-03 · El Super Étendard y el Exocet

**Estado:** ⬜ idea · *Pedida por el autor el 9/10/2026* · ✅ **se desbloquea al ganar M4**

> *"Otra mision secundaria desbloqueable, manejar los super etendard tambien, ademas de la de
> neptune."*

**El avión:** el **Dassault Super Étendard** de la Aviación Naval, el de los misiles **Exocet**. Es
el que hundió de verdad al Sheffield el 4 de mayo —en el juego, M4 lo hacen los A-4 con bombas, y
al final de M4 se aclara (`M4_CAMBIOS.md` · 2)—.

**Por qué es distinta del A-4:** el Exocet se dispara **de lejos**. En vez de pasarle por encima
al barco, hay que acercarse escondido, **subir un instante para que el radar del avión lo
encuentre**, soltar el misil y escapar al ras. Es la misma idea que el Neptune: el radar propio es
lo que te delata.

**El Exocet se carga con la mecánica de PULSO** *(autor, 9/10)*:

> *"Vamos a usar la mecanica de PULSO para lanzar el exocet. Los exocet requieren que los
> superetendard prendan sus radares e ingrsen las coordenadas manualmente para lanzar el misil e
> irse, el misil va solo, asi qe vamos a usar lamecanica de PULSO para "cargar" las coordenadas.
> anmotalo."*

**Otra salida real del Super Étendard (10/10):** el **Atlantic Conveyor**, el 25 de mayo, después de
una salida fallida el 23. Es el blanco de M8, así que puede seguir el molde de M4: aclaración al
final de M8 y misión desbloqueada. Detalle en `M8_CAMBIOS.md`, pedido 1. 🔵 **¿Va dentro de S-03 o
aparte?**

**Queda así:** el piloto prende el radar, **carga las coordenadas con el Pulso**, suelta el misil y
se va. **El misil va solo.** El Pulso existe entero en el código (`npm run pulso`) y hoy no lo usa
ninguna misión.

**⚠ Excepción a una regla de campaña:** el 3/10 quedó que *todo el juego es pasillo* y que el Pulso
no se usa en ninguna misión. **Eso vale para la campaña.** Las misiones sueltas pueden usar otras
mecánicas, y ésta es la primera que lo hace.

**Ojo:** el juego ya tiene escrita la decisión de por qué el protagonista vuela un **A-4B y no un
Super Étendard** (`../AVIONES_ESCUADRON.md`). Esto no la contradice: es una misión aparte, con otro
avión.

**✅ Se desbloquea al ganar M4, y lo anuncia la aclaración** *(autor, 9/10)*:

> *"Y en el disclaimer de la mision ganada se aclara bien qe se desbloqueo la mision secundaria rel
> ehcho real"*

**Un molde que puede repetirse:** cada vez que la campaña se tome una licencia sobre un hecho real,
la aclaración del final puede desbloquear la misión secundaria con lo que pasó de verdad.

---

## S-04 · El Escuadrón Fénix

**Estado:** ⬜ idea · *Pedida por el autor el 9/10/2026* · **se desbloquea después de M4**

> *"Desbloquear otra mision de ESCUADRON FENIX qe son aviones comerciales y militares qe solo van
> en misiones de diversion a distraer.*
> *Empresas privadas ofrecen aviones*
> *Ademas tambien servian de GUIA para las escuadrillas de ataque*
>
> *hacer puente radial con el radar de malvians para evitar qe los aviones de escuadrones qe vayan
> a la isla usen SUS RADIOS porqe hacian silencio de radio mientras iban en rasante."*

**Qué era:** aviones civiles y militares —muchos prestados por empresas privadas— volando para la
Fuerza Aérea. La referencia que mandó el autor muestra la flota: Learjet, Cessna Citation,
Swearingen Merlin, Mitsubishi MU-2, Aerostar, Rockwell Commander, Guaraní, con el escudo del
escuadrón (*Fénix · Por la Patria*) y un hangar de YPF.

**Las tres tareas, y las tres se pueden jugar:**

- **Diversión:** volar para que el radar británico los vea y distraer. **Es lo mismo que se aprende
  en M1**, pero en un avión que no tiene con qué defenderse.
- **Guía:** llevar a las escuadrillas de ataque hasta el punto de entrada.
- **Puente de radio:** volar alto para retransmitir entre el radar de Malvinas y las escuadrillas,
  así **los A-4 no usan sus propias radios** y mantienen el silencio mientras van al ras.

**Cómo se juega la diversión, y cómo se vuelve** *(autor, 9/10)*:

> *"La idae es acercarselo suficiente con alarmas y retomar la vuelta. para la vuelta vamos a tener
> qe APLICAR ALGUN BOTON para emprender la vuelta, sin tener qe elminar ningun objetivo o quiza
> llegar ahsta cierto punto y qe vuelva solo"*

Acercarse lo suficiente, juntar alarmas y volver. **No hay nada que destruir**, así que la vuelta
no puede depender de un blanco. Dos formas, a decidir:

- **Un botón para emprender la vuelta.** Es nuevo: hoy no existe.
- **Llegar a un punto y que vuelva solo.** **Ya existe:** es lo que hace M1 hoy, con el corte a
  negro y Puma diciendo *«Hasta acá llegamos, Tero. Media vuelta y a casa.»*

**Sirve también para la campaña:** M1 (juntar las cuatro estrellas e irse) y M3 (llegar a la
bahía, *«no hay nada»*, y volver) tienen el mismo problema. Lo que se decida acá vale para las tres.

**El puente de radio explica algo de la campaña:** que los Fieles de Plata puedan ir callados y
aun así recibir a Cóndor. Alguien estaba arriba haciendo de antena.

**Para investigar:** el 7 de junio derribaron un Learjet del escuadrón sobre las islas, y ahí murió
el Comodoro Rodolfo de la Colina, que figura en la lista oficial de los 55 caídos de la Fuerza
Aérea. Confirmar con fuentes qué hacía ese vuelo antes de usarlo.

**El 7 de junio, contado por el autor (11/10):**

> *"Misinon del escuadron fenix, el 7 de junio, 2 escuadrones, obtener fotografias a gran altura de
> la zona. Dos aviones lelgan primero sobrevuelan el estrecho a 12500 metros d altura, cielo
> despejado. Pueden ver fogonazos y misiles, los dos aviones esquivan pero uno de ellos es alcanzado,
> el comandante rompe el silencio de radio "nos dieron hay nada que hacer" el avion cae en
> tirabuzon por la altutid y no hay eyeccion. Mueren.*
>
> *El otro escapo.*
>
> *El barco qe lso hundio fue el EXCETER.*
>
> *EL OTRO ESCUADRON al escuchar la comunicacion se vuelven."*

Es **la tercera tarea que faltaba: fotografía a gran altura.** Dos escuadrillas. Los dos primeros
aviones cruzan el estrecho a **12.500 metros**, cielo despejado; ven **fogonazos y misiles** y
esquivan, pero a uno lo alcanzan. **El comandante rompe el silencio de radio:**

> **«Nos dieron, no hay nada que hacer.»**

El avión cae en tirabuzón desde esa altura, **sin eyección. Mueren.** El otro escapa. Lo derribó la
**HMS Exeter**. **La segunda escuadrilla escucha la radio y se vuelve.**

- Responde el "para investigar" de arriba: es el **Learjet del 7 de junio**. El comandante sería el
  **Comodoro Rodolfo de la Colina**; la frase va palabra por palabra y hay que chequearla con una
  fuente argentina.
- **El silencio de radio que se rompe solo para decir que se terminó** es el mismo gesto que Puma con
  *«¡Acá están!»* el 24 (M7, pedido 2), al revés.
- Las tareas de S-04 ahora son **cuatro**: distraer, guiar, puente de radio y **fotografiar**.

**🔵 Para decidir:** si es una sola misión con las cuatro tareas, o varias.

---

## S-05 · El Invincible — 30 de mayo de 1982

**Estado:** ⬜ · ✅ **va, como secundaria** · *Pedida por el autor el 9/10/2026*

> *"La mision de INVICIBLE tiene qe estar y si hagamosla como secundaria qe aparezca paralela
> (antes) de qe se mencione en la hisoria"*

**El hecho** *(de `../ARMAMENTO_1982.md` y `../MEJORAS_PICHON.md`)*: dos Super Étendard —uno con
**el último Exocet**— y cuatro **A-4C** contra el portaaviones. Para esa salida **se reservaron los
dos aviones cisterna** que había en toda la guerra, y con reabastecimiento cada A-4C llevó **tres
bombas de 250 kg**. **Vázquez y Castillo no volvieron.** Uno de los pilotos contó que el cañón se
le trabó *"después de disparar sólo dos tiros"*.

**⚠ Si el Invincible fue alcanzado está en discusión:** la versión argentina dice que sí, la
británica que no. **La aclaración del final tiene que decirlo así**, sin tomar partido.

**Cuándo aparece:** **después de M9** (27 de mayo) y **antes de que la campaña lo nombre**. Hoy la
campaña no lo nombra en ninguna parte, así que **hay que escribir esa mención** —lo natural es en
M10, el 5 de junio, después del ataque—. **Proponer y mostrar antes de pegar.**

**El barco ya existe en el código:** el modelo de portaaviones (`cv` en `ships.js`), con cubierta
corrida, rampa de salto y la isla a estribor. Hoy sólo lo usa una misión de prueba.

**🔵 Para decidir:** ¿se vuela el **Super Étendard** —con el Pulso, como S-03—, el **A-4C** con
bombas, o las dos partes?

**Para revisar con las mejoras (C-02):** la mejora «Alcance» del Pichón está basada en este ataque,
y su texto dice que se apaga cuando la Chancha se rompe en M6. Con la regla nueva, desde M7 la
Chancha no se apaga: sólo deja de entrar al radar.

**Cómo se encontró al portaaviones (10/10):**

> *"El radar de puerto argentino estuvo anotando desde donde y hacia donde aparecian y desaparecian
> los seaharriers, para estimar el origen del portaaviones, con la idea de arriesgar los exocets que
> quedabvan."*

El **radar de Puerto Argentino** anotaba **por dónde aparecían y desaparecían los Sea Harrier** para
calcular de dónde salían: así estimaron **dónde estaba el portaaviones** y se jugaron **los Exocet que
quedaban**. El autor mandó la referencia: una pantalla de radar verde con las islas y los ecos
alrededor.

**Se cruza con C-12:** la voz de Puerto Argentino que propuso para la radio por zonas es este
mismo radar. Puede ser el que da las coordenadas en S-05 (y en S-03, si se usa el Pulso para
cargarlas).

**El ataque contado por el autor (11/10):**

> *"Arrancamos con 5 exocet pero a esta altura ya queda uno. Los informes del radar de puerto
> argentino y expreiencia de la guerra estiman la ubicacion de los portaaviones. AL quedar un solo
> exocet se planifica un ataque directo a algun portaaviones.*
>
> *Se planifica una operacion conjunta entre la fuerza aerea y la naval.*
>
> *Quiza podemos armar alguna rivalidad graciosa entre la naval y la aerea, y que al final se juntan
> en coordinacion para el inviencible.*
>
> *Desde riogrande salen 2 super etendard, uno con el misil.*
>
> *El ataque van con 4 skyhack a4c, con 4 bombas de 250kg.*
>
> *Se van por fuera de la zona, reaprovisionan a todos los skyhawk. Una vez cargados van en rasante
> hasta el punto. Los super etendard encienden radares detectando ecos, a los 37km del blanco lanzan
> el ultimo exocet.*
>
> *Los navales vuelven y los skyhawk persiguen al misil en vuelo rasante protegiendolo. Uno de los
> aviones es alcanzado por un misil. otra se estrella en el oceano.*
>
> *La version argentina dice qe le pegamos al invencible. Los skyhawk lo vieron. Uno de los skyhawk
> impacta bien. El otro desvia intentando esquivar proyectiles y no alcanza a pegarle.*
>
> *Los dos aviones escapan y uno confirma que es un portaaviones. Rasante se van sin otros navios en
> la zona. Los hercules van en rasante a buscarlos y los aprovisionan para llegar a riogrande.*
>
> *Aterrizan luego de casi 4 horas de vuelo.*
> *El 30 de mayo.*
>
> *Quiza esto da para otra campaña....*
>
> *La version del inglaterra dice qe nunca fue aclanzado."*

La referencia que mandó: el Super Étendard **3-A-202** con el Exocet colgado, cargando de un
**Hércules**, con tres **A-4C** alrededor, sobre las nubes.

| # | Qué pasa |
|---|---|
| 1 | De **5 Exocet** queda **uno**. Con el radar de Puerto Argentino y lo aprendido en la guerra estiman dónde está el portaaviones, y se planifica **un ataque directo** |
| 2 | **Operación conjunta de la Fuerza Aérea y la Armada** |
| 3 | De **Río Grande** salen **2 Super Étendard** (uno con el misil) y **4 A-4C** con bombas de 250 kg |
| 4 | Van **por fuera de la zona** y **reabastecen a todos los Skyhawk**. Después, al ras hasta el punto |
| 5 | Los Super Étendard **prenden el radar**, detectan ecos y **a 37 km del blanco sueltan el último Exocet** |
| 6 | **Los navales vuelven. Los A-4C siguen al misil al ras, cubriéndolo.** A uno lo alcanza un misil; **otro se estrella en el mar** |
| 7 | **Versión argentina:** le pegaron al Invincible. Los Skyhawk lo vieron. **Uno pega bien**; el otro se desvía esquivando y no llega |
| 8 | **Los dos escapan**; uno confirma que era un portaaviones. Al ras, sin otros buques cerca. **Los Hércules bajan al ras a buscarlos** y los reabastecen para llegar a Río Grande |
| 9 | **Casi 4 horas de vuelo.** 30 de mayo |
| — | **Versión inglesa:** nunca lo alcanzaron. **Las dos versiones no coinciden**, y la aclaración del final lo dice así |

**Las dos versiones, con sus argumentos (11/10):**

> *"La version argentina fueron interrogados los piltoos por separado y la declaracion concordaba.*
> *El dibujo del piloto en el interrogatorio cincide con el perfil del portaaviones, y por mas
> nerviosismo es dificil que un piloto confunda una fragata con un portaaviones.*
>
> *Del lado britanico dicen qe despues del ataque el portaaviones siguio operando. Los harriers
> continuaron apareciendo normalmente. Y ningun soldado del invencible se quebro dicinedo "la verdad"
> por ende es raro qe haya sucedido."*

| Versión argentina — le pegaron | Versión británica — no lo alcanzaron |
|---|---|
| Interrogaron a los pilotos **por separado** y **las declaraciones coincidieron** | Después del ataque **el portaaviones siguió operando** |
| **El dibujo** que hizo un piloto en el interrogatorio **coincide con el perfil del portaaviones** | **Los Harrier siguieron apareciendo** con normalidad |
| Por más nervios, **es difícil confundir una fragata con un portaaviones** | **Ningún tripulante del Invincible** salió a decir otra cosa |

**Para la aclaración del final:** primero la versión argentina con sus argumentos, después la
británica con los suyos. **No se resuelve:** se dice que no coinciden.

**Pistas para verificar (11/10)** — el autor mandó un comentario de YouTube, en el canal
*Malvinas día por día*. **No es una fuente:** son datos para buscar.

> *"amigo lo sigo desde El capitulo 1, charle varias veces con Gerardo Issac, creo que se quedó corto
> en este capitulo sobre todo en el cierre, el príncipe Andrés habla de un ataque al portaaviones,
> además de la odisea que fue esa misión con los KC reaprovisionando en vuelo para atacar desde
> detrás del erizo protector del portaaviones. Lo felicito y mis saludos a la familia Uretta."*

- **Gerardo Isaac** y **Ureta** serían **los dos pilotos de A-4C que volvieron** (Vázquez y Castillo
  no). Nombres y grados a confirmar con fuentes argentinas.
- **El príncipe Andrés**, que estaba a bordo del Invincible, **habría hablado de un ataque al
  portaaviones**. Si se encuentra la cita, va en la aclaración, del lado de la versión argentina.
- **Los KC** (los Hércules cisterna) reabasteciendo para **entrar por detrás del «erizo»** —la
  pantalla de buques que protegía al portaaviones—. Coincide con el relato: van por fuera de la zona
  y entran al ras.

**Lo que esto aporta a las decisiones de arriba:**

- **Qué avión se vuela:** el relato tiene las dos partes —el Super Étendard que suelta el Exocet y
  los A-4C que lo siguen al ras—. 🔵 Sigue abierto, pero el relato pide las dos.
- ⚠ **Bombas:** acá dice **4 bombas de 250 kg** por A-4C; lo que estaba anotado decía **tres**.
  A confirmar con fuentes argentinas.

**Dos ideas nuevas del autor:**

- 💡 **Una rivalidad graciosa entre la Armada y la Fuerza Aérea** que termina con las dos juntas,
  coordinadas, para el Invincible. Los Fieles son de la Fuerza Aérea, y la Armada ya aparece en M4
  (Super Étendard), M5 (los A-4Q de la Ardent) y M8 (Atlantic Conveyor): **puede atravesar la
  campaña** y cerrarse acá. Las líneas las escribe el autor o se proponen antes de pegar.
- 💡 *"Quiza esto da para otra campaña...."* — **una segunda campaña**, aparte. Queda anotada como
  idea.

---

## S-06 · El Glasgow — 12 de mayo de 1982

**Estado:** ⬜ idea · 🔵 **falta tu sí** · *Surgida el 9/10/2026*

> *"Al GLASGOW le pegamos, auinque no exploto, porque tampoco esta ?"*

**Por qué no está en la campaña:** estuvo. En una versión vieja era el blanco de la misión final, de
noche, bombardeando el monte de Mateo. Se sacó por corrección histórica (`../../_archivo/GUION_2.md`):
el **12 de mayo** una bomba lo atravesó de lado a lado **sin explotar**, quedó limitado a 10 nudos y
fue el primer buque de la flota en volver a Inglaterra, el 19 de junio. Lo reemplazó el Glamorgan.

**Por qué encaja como secundaria:**

- **12 de mayo:** cae en el hueco de diecisiete días entre M4 y M5. **Se desbloquea después de M4.**
- **Es el último día de niebla y bruma** de la regla de campaña.
- **Fue un ataque de A-4B**, el mismo avión de los Fieles de Plata.
- **La bomba pega y no explota**, que es lo que el juego enseña y cobra en M6.

**Para confirmar con un historiador:** que la bomba fuera del avión del teniente **Fausto Gavazzi**, y
qué le pasó a él después. Si se confirma, es un piloto real cuyo recorrido roza el de esta ficción.

---

## 21 DE MAYO — tres misiones del día del desembarco

*Las tres salen del mismo pedido del autor (9/10), copiado completo en `M5_CAMBIOS.md`. Pasan el
21 de mayo, antes de que la campaña se entere del desembarco en M5.*

## S-07 · Los dos Pucará de Pradera del Ganso

**Estado:** ⬜ · ✅ **va** · *Pedida por el autor el 9/10/2026*

> *"Hay qe agregar otra mision secundaria antes de esto, sobre 2 pucaras que despegan desde pradera
> del ganso buscando blancos cerca, luego deben atacar una casa donde se supojne qe hay observadores
> ,y luego de una horea de vuelo(enviados al sur) los ancalzan 2 sea harriers, uno lo derriban, el
> piloto se eyecta.*
> *El otro pucara escapa de los dos y regresa a la base condor de pradera del ganso.*
> *Esa es una mision."*

**La misión:** dos **IA-58 Pucará** salen de la BAM Cóndor buscando blancos cerca. Atacan **una casa
donde se cree que hay observadores**. Después de una hora de vuelo, mandados al sur, **los alcanzan
dos Sea Harrier**: a uno lo derriban y el piloto se eyecta; **el otro se les escapa** y vuelve a
Pradera del Ganso.

**Es un avión nuevo para el juego:** el Pucará es argentino, de hélice, lento y de ataque a tierra.
Escaparse de dos Sea Harrier con él es otra cosa que con un A-4.

**Para confirmar con fuentes:** quién era el piloto derribado. Según lo que recuerdo, el **Mayor
Carlos Tomba**.

---

## S-08 · 💡 Desde tierra: el batallón de Puerto Howard

**Estado:** 💡 **idea** · *Pedida por el autor el 9/10/2026*

> *"Otra mision puede ser desde puerto hogwart el batallon argenito baja un seaharrier en rasante,
> quiza podemos armar unamision con una jugabilidad dinstinta desde tierra, anotalo como idea."*

**La idea:** **Puerto Howard** (Puerto Yapeyú), en la Gran Malvina. *(12/10: ahí murió un soldado y la
posición recibía ataques de un buque — `M12_CAMBIOS.md`, pedido 3.)* El batallón argentino derriba un Harrier que pasa
en rasante. **Se juega desde tierra**, con una mecánica distinta a todo el resto.

**Para confirmar con fuentes:** según lo que recuerdo, el que derribaron ese día ahí fue un **Harrier
GR3 de la Fuerza Aérea británica**, no un Sea Harrier de la Marina, y el piloto quedó prisionero.

---

## S-09 · Owen Crippa: el Aermacchi que encontró el desembarco

**Estado:** ⬜ · ✅ **va** · 🔵 cómo se engancha con M5 · *Pedida por el autor el 9/10/2026*

> *"Otra mision es un aremacchi de la marina qe despega desde puerto argentino y sobrevuela por la
> isla bordeando costa e ingresa al estrecho y puede ver todos los buques, ESTA ES LA MISION DE OWEN
> CRIPPA.*
> *Ataca con aviones y cohtes al navio, luego escapa enr asante con maionbras evasivas en la flota de
> deembarco esquiva todo, seva ,y cuando esta a salvo escribe en su anotador de rodilla un papel con
> un boceto de todo lo qe vio y vuelve a puerot argentino.*
> *ARGONAUT FRAGATA, recien ahora nmos enteramos qe hay un desembarco"*

**La misión:** un **Aermacchi MB-339** de la Armada sale de Puerto Argentino, **bordea la costa** y
**entra al estrecho**, donde ve todos los buques. **Ataca con cañones y cohetes a la fragata
Argonaut**, escapa al ras **esquivando a toda la flota de desembarco**, y cuando está a salvo
**dibuja en el anotador de rodilla todo lo que vio**. Vuelve a Puerto Argentino con eso.

**Es la misión que hace posible M5:** por Crippa se sabe que hay un desembarco. Cómo se engancha con
la campaña está en `M5_CAMBIOS.md` · 2.

**El anotador de rodilla es un regalo para el juego:** el dibujo de Crippa es un cuaderno más, como
el de Mateo.

---

## S-10 · Tres Dagger contra dos Harrier

**Estado:** ⬜ · ✅ **va** · *Pedida por el autor el 9/10/2026* · **se desbloquea después de M5**

> *"Luegoo viene otro escuadron qe se cruza de frente con 2 harriers, hay nubes, chubascos, son 3
> contra 2, los argentinos eyectan bombas y tanques suplementarios para recontra cagarse a tiros en
> metralletas, pierden los argentinos (esta puede ser una mision post M5 secundaria) Los harriers se
> ponen detras y con los misiles bajan a los 3. 3 daggers eran, todos los pilotos sobreviven se
> eyectan."*

**21 de mayo.** Tres **Dagger** se cruzan de frente con dos Sea Harrier entre nubes y chubascos.
Sueltan bombas y tanques para pelear a cañón. **Pierden:** los Harrier se les ponen atrás y los
bajan a los tres con misiles. **Los tres pilotos se eyectan y viven.**

**Es la única misión del juego que es un combate aéreo** —sin blanco, sin bombas, avión contra
avión— y está pensada para perderse, como pasó. **🔵 Para decidir:** si se puede ganar, o si el
objetivo es otro: aguantar, salvar a alguno, que los tres se eyecten.

---

## S-11 · Colgado del patín

**Estado:** 💡 **idea** · *Pedida por el autor el 9/10/2026* · **se desbloquea después de M5**

> *"Un helicoptero sin equipo de rescate se dirige al lugar del piloto, se agarra del helicoptero y
> va colgando hasta la costa, esta puede ser otra mision de rescatar al piloto. y usar un
> helicoptero."*

**21 de mayo.** Un piloto de A-4Q de la Armada se eyecta. Un **helicóptero sin equipo de rescate** va
a buscarlo, y el piloto **se agarra del patín y va colgado hasta la costa**. El autor mandó la
referencia: una pintura de un **Huey** con el piloto colgado sobre el mar.

**Otro avión nuevo, otra mecánica:** se vuela un helicóptero, y el objetivo es llegar a tiempo y
traerlo vivo. Es pariente del rescate del Belgrano (S-01).

## S-12 · Tres Dagger sobre Puerto San Carlos

**Estado:** 💡 **idea** · *Pedida por el autor el 10/10/2026* · **se desbloquea después de M6** (24 de mayo)

> *"Mas tarde 3 daggers atacan puerto san carlos, unidades en tierra, teoricamente no pueden ver los
> daños de lo rapido que psaron, podemos hacer mision secundaria o usarlo tambien."*

**24 de mayo.** Tres Dagger atacan unidades en tierra en Puerto San Carlos y pasan tan rápido que no
ven el daño. **Puede ser secundaria o entrar en la misión del 24** (`M7_CAMBIOS.md`, pedido 1).

## S-13 · Sobre Pradera del Ganso, 28 de mayo

**Estado:** 💡 idea · *Pedida por el autor el 11/10/2026* · **se desbloquea después de M9** (27 de mayo)

> *"El 28 de mayo a las 8 am, desde puerto argentino despegna 5 aermacchi pucara de la marina qe ya
> conocen el terreno. A la mañana despegan volando en rasante, los harriers no pueden salir del
> portaaviones por el clima.*
>
> *Los primeros 3 aviones rodean pradera del ganso e identifican una tropa inglesa, y las atacan con
> cañones. Esto puede ser una mision secundaria.*
>
> *El peloton tenia varios soldados y 3 cañones.*
>
> *Una hora despues llegan 2 mas a la primer parte de de arriba de pradera del ganso donde arrancan a
> tomar terreno los britanicos, donde tienen de prisioneros a soldados argentinos. Tambien podemos
> haerla como mision secundaria o podemos usar los mismso 5 pucaras en el mismo peloto y atacar a los
> dos lugares en la misma mision.*
>
> *Todos los puccara regresan a puerto argentino cagados a tiros."*

**Ordenado:**

| Cuándo | Quién | Qué pasa |
|---|---|---|
| 08:00 | **5 aviones de la Armada**, que ya conocen el terreno | despegan de **Puerto Argentino** al ras. **Los Harrier no pueden salir del portaaviones por el clima** |
| — | los **3 primeros** | rodean **Pradera del Ganso**, encuentran **una tropa inglesa —varios soldados y 3 cañones—** y la atacan **con cañón** |
| una hora después | los **otros 2** | van a la parte de arriba de Pradera del Ganso, **donde los británicos empiezan a ganar terreno y tienen prisioneros argentinos** |
| — | todos | **vuelven a Puerto Argentino agujereados a tiros** |

**Dos formas, a elegir:**

- **Dos secundarias:** una para los 3 primeros y otra para los 2 de una hora después.
- **Una sola:** los 5 aviones en la misma escuadrilla, atacando los dos lugares en la misma misión.

**Se vuela otro avión, con cañón y sin bombas.** Pariente de **S-07** (los dos Pucará del 21, que
también salen de Pradera del Ganso).

🔵 **Qué avión es:** el texto dice *"aermacchi pucara de la marina"*. El **Aermacchi** es de la
**Armada**; el **Pucará**, de la **Fuerza Aérea**. ¿Cuál de los dos? (A confirmar también con
fuentes argentinas.)

**⚠ Cuidado al armarla:** en el segundo lugar **hay prisioneros argentinos** cerca de los británicos.

**El resto del 28 (11/10):**

> *"La fuerza aerea manda 15 aviones en 3 misiones.*
> *Al llegar al estrecho la visibilidadd y las nieblas no les permite encontrar nada.*
> *la ultima estuvo a punto de atacar al buque hospital."*

La Fuerza Aérea manda **15 aviones en 3 salidas**; en el estrecho **la niebla no deja encontrar
nada**, y **la última casi ataca al buque hospital**. *(Se cruza con M9, pedido 1: el hospital del
frigorífico de Bahía Ajax.)*

**La tarde del 28 (11/10):**

> *"Entrada la tarde del 28 se envian 2 aermacchi y 2 puccara.*
> *Faltando poco para que anochezca y niebla.*
> *Las aeronaves val a defender pradera del ganso, atacan a las tropas los aermacchi, uno de los
> aviones es derribado y el piloto muere.*
> *Los puccara rodean e intentan ataque con bombas de napalm. Uno tira la bomba, y el otro se eyecta
> en medio de las tropas britanicas. Lo cagaron a trompadas, pero lo capturaron y luego qeudo vivo."*

| Quién | Qué pasa |
|---|---|
| **2 Aermacchi** | atacan a las tropas. **Uno es derribado y el piloto muere** |
| **2 Pucará** | rodean y atacan con **napalm**. Uno suelta la bomba; **el otro se eyecta en medio de las tropas británicas**: lo golpean, **lo toman prisionero y sobrevive**. Después **lo devolvieron** *(autor: "Lo devolvieron")* |

Por la tarde, con niebla y poco antes de que anochezca, a defender **Pradera del Ganso**. Es el
mismo día y el mismo lugar que la mañana: **S-13 puede tener mañana y tarde**, o ser dos misiones.

**Lectura del avión:** en el mensaje siguiente el autor separa *"2 pucara de puerto argentino"* (S-14).
Así que los **cinco de la mañana serían los Aermacchi de la Armada**. 🔵 **A confirmar.**

---

## S-14 · Dos Pucará contra dos helicópteros, en la bruma

**Estado:** 💡 idea · *Pedida por el autor el 11/10/2026* · **se desbloquea después de M9** (28 de mayo)

> *"El 28 de mayo 2 pucara de puerto argentino van a defender pradera del ganso, pero el clima no les
> permite ver bien, se encuentran con 2 helicopteros y se matan a tiros, podemos ver de hacer una
> misino secundaria quiza ahi. Uno de los helicopteros es derribaod y muere uno.*
> *Tras el ataque un piloto se pierde entre la bruma, la ultima comunicacion es una pregunta "Me
> pueden decir donde estoy?""*

**28 de mayo.** Dos **Pucará** salen de **Puerto Argentino** a defender **Pradera del Ganso**. Con el
clima no se ve casi nada. Se cruzan con **dos helicópteros** y se tirotean: **uno de los helicópteros
cae y muere uno de sus tripulantes**. Después del ataque, **un piloto argentino se pierde en la
bruma**. Su última comunicación es una pregunta:

> **«¿Me pueden decir dónde estoy?»**

**Se vuela el Pucará**, como S-07, con niebla cerrada. Es la cita real de un piloto que no volvió:
**va palabra por palabra**, y hay que chequearla con una fuente argentina antes de usarla.

---

## LAS MENCIONES QUE HAY QUE ESCRIBIR

*Cada secundaria tiene que aparecer en la historia. Ninguna de estas menciones existe todavía.
Se proponen y se muestran antes de pegar.*

| | Secundaria | Dónde la nombrarían, lo natural |
|---|---|---|
| S-01 | El rescate del Belgrano | M3 (escena del Belgrano) o M4 |
| S-02 | El Neptune | M4, en el briefing: *"unos Neptune detectaron los buques"* — ya pedido |
| S-03 | El Super Étendard | M4, en la aclaración del final — ya pedido |
| S-04 | El Escuadrón Fénix | cualquier misión con Cóndor por radio: el puente de radio es de ellos |
| S-05 | El Invincible | M10 — ya pedido |
| S-06 | El Glasgow | M5, si va |
| S-07 | Los dos Pucará | M5 |
| S-08 | Puerto Howard | M5, si va |
| S-09 | Owen Crippa | M5 — ya pedido |
| S-10 | Tres Dagger contra dos Harrier | M5 |
| S-11 | Colgado del patín | M5 |
| S-12 | Tres Dagger sobre Puerto San Carlos | la misión del 24 de mayo, si va |
| S-13 | Sobre Pradera del Ganso, 28 de mayo | M10 (el 5 de junio, mirando para atrás) o M9 |
| S-14 | Dos Pucará contra dos helicópteros | M10 o M9, junto con S-13 |
