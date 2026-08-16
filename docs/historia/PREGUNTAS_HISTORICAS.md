# Preguntas históricas — RASANTE

Dudas para consultar con un historiador. **Nada de esto frena el desarrollo**: el juego ya
tiene un dato provisorio cargado en cada caso. Todo el texto vive en el objeto `STRINGS` de
[src/game.js](src/game.js), así que corregir cualquiera de estos puntos es editar un string,
no tocar código.

Formato: qué dice el juego hoy → qué habría que confirmar.

---

## Cifras de bajas

Las que están cargadas hoy en los epílogos:

| Buque | Fecha en el juego | Bajas en el juego | Estado |
|---|---|---|---|
| HMS Sheffield | 4 mayo 1982 | 20 | Chequeado, coincide entre fuentes |
| HMS Ardent | 21 mayo 1982 | 22 | Chequeado |
| HMS Antelope | 23 mayo 1982 | 2 | **Ver nota abajo** |
| HMS Coventry | 25 mayo 1982 | 19 | Chequeado |
| Atlantic Conveyor | 25 mayo 1982 | 12 | Chequeado |
| RFA Sir Galahad | 8 junio 1982 | 48 | **Ver nota abajo** |

### HMS Antelope — 2 bajas
Circula mucho el dato de "22 muertos", que parece ser una copia del número del Ardent.
Lo que encontré: murieron dos personas, el artificiero **James Prescott** (al estallar la
bomba que intentaba desactivar) y el camarero **Mark Stephens** (en el ataque inicial).
→ **Confirmar el número y los dos nombres.**

### RFA Sir Galahad — 48 bajas
El ataque de Bahía Agradable / Fitzroy alcanzó al Sir Galahad **y** al Sir Tristram, con un
total combinado de 56 muertos. El juego atribuye 48 al Sir Galahad solo.
→ **Confirmar el reparto entre los dos buques.**

---

## Atribución de los ataques

El juego te pone en la cabina, así que implícitamente te atribuye cada hundimiento. Habría
que confirmar arma y unidad en cada caso:

- **Sheffield** — el juego dice "un Super Étendard de la Armada Argentina" con Exocet.
  ¿Fue uno o la pareja de aviones? ¿Qué escuadrilla?
- **Coventry** — el juego dice "A-4 Skyhawk de la Fuerza Aérea Argentina".
  ¿Grupo 5 de Caza? ¿Cuántos aviones en la formación?
- **Ardent** — el juego solo dice "oleadas sucesivas" sin atribuir unidad, porque intervinieron
  varias. ¿Vale la pena nombrarlas, o conviene dejarlo genérico?
- **Antelope** — no atribuido en el texto. ¿Qué unidad puso las dos bombas?
- **Atlantic Conveyor** — Exocet desde Super Étendard. ¿Fue impacto directo o el misil se
  desvió desde otro blanco? Hay versiones distintas.
- **Sir Galahad** — el juego dice "Skyhawks argentinos". ¿Fuerza Aérea o Armada?

## Fechas

- **Antelope**: el juego usa el 23 de mayo (día del impacto). La explosión y el hundimiento
  fueron el 24. ¿Qué fecha conviene mostrar como la de la misión?
- **Sheffield**: impacto el 4 de mayo, hundimiento el 10. El juego menciona las dos.

## Otros puntos a revisar

- **"Callejón de las Bombas"** (Bomb Alley) — el juego lo usa en el briefing del Antelope y ya
  aparecía en los datos curiosos. ¿Lo acuñaron los propios británicos? ¿Desde cuándo?
- **Capitán Ian North** del Atlantic Conveyor — está nombrado en el epílogo. Confirmar que
  murió en el ataque y no después.
- **Sir Galahad como cementerio de guerra** — el juego dice que el casco fue hundido mar
  afuera y declarado cementerio de guerra. Confirmar fecha y términos.
- **Tono general**: los epílogos cuentan bajas británicas desde una cabina argentina. Vale
  revisar con alguien si el registro es el adecuado para un homenaje a los veteranos.

---

## Pendiente de contenido (no histórico)

- Las misiones de campaña usan todas la misma configuración de mapa (`CAMPAIGN_CFG`).
  Faltaría clima/terreno propio por misión: San Carlos es un estrecho, no mar abierto.
- Solo las dos primeras misiones tienen guion largo (`storyIntro`, `storyL1`). Las otras
  cuatro entran por el briefing corto. Faltan los guiones de esas cuatro.


---

## Ayudas de terceros países a cada bando

Están cargadas en el ROADMAP (#20 y #21) con su posible expresión jugable. **Hay que
verificarlas con un historiador antes de que salgan del código**, por dos motivos distintos:

1. **Precisión.** Cifras y alcance concretos: ¿fueron 10 los Mirage 5 peruanos? ¿qué entregó
   exactamente Libia y cuándo? ¿qué material soviético llegó y por qué vía?
2. **Peso de la afirmación.** Varias no son datos neutros — son acusaciones que todavía se
   discuten y que involucran a países vecinos y aliados actuales:
   - el rol de **Chile** (radares británicos en territorio chileno, apoyo al SAS, escuchas que
     avisaban los despegues desde el continente)
   - que pilotos **franceses** entrenaran a los británicos para evadir aviones franceses
     vendidos a la Argentina
   - la ayuda **secreta** de Libia
   - el alcance real de la inteligencia satelital de EE.UU. y de la URSS

Para el juego alcanza con que sean **verosímiles y jugables**; para la página de Steam y
cualquier texto que se lea como afirmación histórica, conviene tener la fuente al lado o bajar
el tono a "se atribuye / se ha señalado". No frena el desarrollo: la mecánica se puede construir
igual y el texto se ajusta después.

---

## Equipo de vuelo — el traje de inmersión / anti-exposición

*Agregado durante la revisión de época de las hojas de personaje
([PROMPTS_HOJAS_PERSONAJE.md](PROMPTS_HOJAS_PERSONAJE.md), v2).*

**Qué dice el juego hoy:** nada. No se menciona ni se dibuja.

**Qué habría que confirmar:** los pilotos de A-4B del Grupo 5 de Caza que volaban desde el
continente sobre el Atlántico Sur en pleno invierno, ¿tenían traje de inmersión / anti-exposición
para el caso de eyección sobre agua? ¿Lo usaban? ¿Se los dieron y no entraban en la cabina del A-4,
o directamente no había?

**Por qué importa, y no es un detalle de vestuario:** si la respuesta es que volaban sin protección
contra el agua fría, eso es **material de guion, no de dibujo**. Encaja exacto con la tesis del
juego —la culpa es de los de arriba, nunca de los que pelearon— y es de las cosas que se cuentan
sin subrayar: un objeto que no está. Podría ser una línea del Turco, o un cuadro mudo.

**Estado:** busqué y **no lo pude confirmar con fuente**. Deliberadamente **no lo metí en ningún
prompt de imagen** para no dibujar algo falso y después tener que rehacer las hojas. Si se confirma,
primero se decide qué hace en el guion y recién después se agrega a las hojas de los cinco pilotos.

**Dónde preguntar:** el libro de Rosana Guber *«Experiencia de Halcón: ni héroes ni kamikazes,
pilotos de A-4B»* es antropología sobre estos pilotos concretos y es el lugar más probable donde
esté contestado. Asociación de Pilotos de Caza también.

---

## Ovejas carneadas por conscriptos (M1, M5 — 🟨 3.4)

El guion ahora muestra: el Colorado le da a Mateo un **cuero de oveja** carneada (M1) y en
M5 los pibes carnean una oveja a escondidas y **parten los huesos con piedras para comer
el caracú**. Confirmar: cuán extendido fue el carneo de ovejas kelpers por tropa argentina,
cómo se castigaba (encaja con los estaqueamientos ya verificados) y si el detalle del
caracú aparece en testimonios. Es de los detalles más citados por veteranos — casi seguro
sí — pero conviene la fuente al lado.

## El Mundial de España (M13 — resuelto en guion)

Argentina debutó contra Bélgica el **domingo 13 de junio de 1982** (0–1, Camp Nou). El
asado de M13 es la noche del 11 → el guion dice ahora **"pasado mañana debuta Argentina"**
(corregido; antes decía "mañana"). Verificar solo si se agrega más detalle (hora, relato
radial de la época).

---

## ✅ Los Mirage 5P del Perú (M10) — VERIFICADO 2026-08-07

**Confirmado** (dos fuentes, una con entrevista a un piloto que voló la entrega):

- **Diez** Mirage 5P transferidos por la Fuerza Aérea del Perú (FAP) — no Ejército.
- Salieron de **La Joya (Arequipa)**, escala nocturna de reabastecimiento en **Jujuy**,
  aterrizaje final en **TANDIL** (VI Brigada Aérea) — a ~2.000 km de las bases del sur.
- Los volaron **pilotos peruanos** (unos 10 pilotos + 18 técnicos, ~34 personas
  condecoradas después). Uno de ellos, Pedro Seabra Pinedo, entonces teniente de 25 años,
  llevó el **C-604**.
- **Las escarapelas argentinas estaban pintadas ANTES de despegar del Perú.**
- Los pilotos **volvieron a su país el mismo día** en un **Hércules C-130 con librea de
  Aeroperú**, que viajaba como vuelo comercial "desviado por problemas técnicos".
- **Nunca entraron en combate.** Motivo citado: sus AS-30 rendían menos que los Shafrir
  israelíes de los Dagger. Quedaron en Tandil.
- Marco legal: decreto legislativo secreto n.º 133 y resolución ministerial 2152/AE
  (14/12/1981). **Argentina pagó USD 50 millones** — formalmente fue una **venta**, no un
  regalo, aunque hecha en secreto, a contrarreloj y con riesgo político real.

**Qué queda abierto:**

1. **Discrepancia de fecha.** Una fuente da **5 de junio de 1982** (entrevista al piloto:
   salida de madrugada, escala en Jujuy, Tandil al día siguiente); otra dice "mediados de
   mayo". El guion usa el 5 de junio (más específico y de primera mano). Confirmar.
2. **¿Nombrar pilotos reales?** Están publicados (Seabra Pinedo, Conde Garay, Mengoni
   Vicente, Tueros Mannarelli). El guion NO los nombra — el piloto de M10 es anónimo. Si
   alguna vez se los nombra, pedir permiso o usar solo el hecho, no la persona.
3. **La palabra "regalo".** Como fue una venta, el guion evita esa palabra en diálogo. El
   calor se sostiene con el hecho de las escarapelas pintadas antes de salir, que es real y
   no lo hizo nadie más. Revisar si aparece "regalo" en alguna línea nueva.
4. **La cartela final "Al Perú, el primero"** sigue en pie, pero conviene precisar en qué
   sentido fue el primero (rapidez, cantidad, riesgo asumido) antes de fijarla.

**Fuentes:** [defonline — el apoyo secreto de Perú](https://defonline.com.ar/defensa/los-aviones-tenian-escarapelas-argentinas-el-apoyo-secreto-de-peru-a-argentina-en-la-guerra-de-malvinas/) ·
[Ámbito — historia secreta de los Mirage que mandó Perú](https://www.ambito.com/politica/1982-historia-secreta-los-mirage-que-mando-peru-n3371333)

---

## ⚠ La frase del post-créditos — atribución PENDIENTE (3.6)

**Frase:** *"Nunca, nunca, nunca dudes del corazón de un argentino."* La dice la seño
Claribel en la escena post-créditos.

**Qué se sabe:** circula masivamente como línea de **narrador/relator** en videos y edits
del **Mundial 2026**, en el que **Argentina perdió la final con España 1-0 el 19 de julio
de 2026**. Ese contexto es el que la hace usable en este juego: **no es un canto de
campeón, es lo que se dice después de perder** — que es exactamente la tesis del guion.

**Qué NO se pudo confirmar:** no se pudo rastrear a un autor único y nombrado. Puede ser
(a) un latiguillo de un relator identificable, (b) una frase de dominio popular anterior,
o (c) una línea de narración de un video viral sin autor claro.

**Qué hacer antes de publicar:**

1. Rastrear el origen (buscar el relato original completo, no los edits).
2. Si es de un relator identificable: pedir permiso, o **atribuirla en los créditos** —
   igual que se hace con la cita de Diego Iorio, que sí está atribuida.
3. Si no aparece autor: usarla igual, sin atribución, como frase popular. Riesgo bajo.
4. Alternativa de emergencia si hay conflicto: parafrasear conservando la cadencia
   ("Nunca, nunca, nunca dudes del corazón de estos pibes") — pierde el guiño pero
   funciona en la escena.

**Dato de continuidad verificado de paso:** el pibe del post-créditos usa **la 10 de la
TERCERA estrella** — sigue siendo correcto. Argentina no ganó el Mundial 2026.

**Fuentes:** [CNN — España campeón del Mundial 2026, 1-0 a Argentina](https://cnnespanol.cnn.com/2026/07/19/deportes/live-news/espana-argentina-final-mundial-2026-en-vivo-resultado-goles-orix) ·
[Telemundo — la gran final del Mundial 2026](https://www.telemundo.com/noticias/noticias-telemundo/internacional/live-blog/mundial-2026-siga-la-gran-final-argentina-vs-espana-goles-resultados-rcna588225)

---

## ⚠ Tucumanismos del Turco — vigencia 1982 (3.7)

Matías pasó un lote de recomendaciones "de un tucumano". Se chequeó cada una y **no todas
entraron**:

**✅ Entraron (viejas y seguras):**

- **"aca"** — comodín vulgar (≈ "mierda"; también "mezquino"). Ya estaba en la fila del
  Turco en §9. Se amplió a sus construcciones: *no sirve ni aca · en la loma del aca ·
  hasta el aca · una aca esto · sos un aca · te wa se aca*.
- **"chango / changuito"** — pibe. Ojo: los diccionarios actuales dan primero "carrito de
  supermercado"; el sentido NOA de "muchacho" es el viejo y el correcto acá.
- **"mavé"** (permítame ver) y **"giriar"** (escupir) — se agregaron al banco.

**❌ NO entraron — riesgo alto de anacronismo:**

- **"Qué pingo ura"** — es un fragmento de *"Eh ura, qué pingo, mira cajeta"*, frase que
  circula como **meme viral tucumano de los últimos años**. Meterla en 1982 sería el mismo
  error que se está cuidando con "culiao" y "chamigo", pero peor, porque es rastreable a
  una fecha reciente. **Verificar antes de usarla; por defecto, afuera.**
- **"Calma la raja"** — no figura en los diccionarios tucumanos consultados; lee como
  construcción moderna. Mismo criterio.

**⚠ Decisión de registro (no es histórica, es de tono):** *cajeta* y *ura* son vulgares
fuertes — refieren a genitales femeninos. Quedaron en el banco pero **con regla: solo como
interjección de bronca contra un objeto (un tornillo, un motor), nunca dirigidas a una
persona.** El Turco es el corazón tibio del juego; que insulte a una máquina lo hace más
querible, que insulte a alguien lo ensucia.

**Qué verificar con el historiador / con un tucumano mayor:**

1. ¿"Aca" con ese uso ya estaba instalado en los 70/80, o también es reciente?
2. ¿"Mavé" y "giriar" son de la generación de un hombre nacido ~1924?
3. Sirio-libanés en Tucumán: ¿qué marcas de habla propias tendría alguien de esa
   colectividad en los 80, más allá del refranero? *(Hoy el guion solo usa "esto no lo
   levanta ni Alá".)*

**Nota de producción aparte:** la cantidad de puteadas impacta en la clasificación por edad
(ESRB/PEGI) y complica la traducción al inglés. Decidir el techo antes de escribir el resto
de los diálogos, no después.

**Fuentes:** [Contexto Tucumán — diccionario básico de palabras y expresiones tucumanas](https://www.contextotucuman.com/nota/57320/desde-la-a-a-la-z-diccionario-basico-de-palabras-y-expresiones-tucumanas.html) ·
[El Tucumano — "Eh ura qué pingo mira cajeta"](https://www.eltucumano.com/noticia/libre/298783/la-memorable-frase-eh-ura-que-pingo-mira-cajeta-llega-a-california-de-la-mano-de-una-tucumana) ·
[El Tucumano — ura, aca, giriar, mavé](https://www.eltucumano.com/noticia/libre/264759/ura-aca-giriar-mave-los-hilarantes-videos-sobre-el-lenguaje-tucumano)

---

## ⚠ La atribución de la frase que cierra el juego — SIN RESOLVER

La cita que va antes de los créditos —la tesis entera del juego— **está firmada con dos
nombres distintos en dos lugares del proyecto**:

| Dónde | Firma |
|---|---|
| [GUION_3.md](GUION_3.md) §2 y el cierre común | **Diego Iorio** |
| `src/data/strings.js` (`quoteIorioBy`, es y en) | **RICARDO IORIO** |

Uno de los dos está mal, y el error **ya está compilado en el juego**: la pantalla de
victoria muestra la frase con comillas y firma. No es un detalle de guion — es poner
palabras en boca de una persona real, con nombre y apellido, en un producto que se publica.

**Qué hay que verificar, en este orden:**

1. **Quién la dijo realmente.** Nombre completo, y si es veterano de Malvinas, su unidad.
2. **La forma exacta de la frase.** Las dos versiones del proyecto ya difieren entre sí (el
   guion trae una segunda oración —*"Si las naciones dejaran conocer a su gente buena…"*—
   que la pantalla del juego no tiene).
3. **De dónde sale** — entrevista, documental, libro. Hace falta una fuente citable, no un
   posteo.
4. **Si hace falta permiso** de la persona o de su familia para usarla en un juego
   comercial. Si la respuesta es sí y no se consigue, el juego tiene alternativa propia: el
   Turco dice casi lo mismo en M10 (*"Hay gente buena en todos lados, ¿viste? Lo que pasa es
   que no nos dejan conocernos"*), y esa línea es del guion, no de nadie afuera.

**Hasta que se resuelva:** la banda sonora ya evita el problema —la letra de los créditos
usa la versión del Turco y no la cita firmada ([SOUNDTRACK.md](SOUNDTRACK.md), pista 35)—
pero la pantalla de victoria sigue mostrando la firma. **Corregir el nombre o sacar la firma
antes de publicar.**

---

## ARA General Belgrano (cierre de M3 — 3.8)

Entró al guion como **noticia**, no como misión: los pilotos de A-4 no tuvieron ni pudieron
tener nada que ver con el hundimiento. Cae al final de M3, dos días antes del Sheffield
(M4), y recontextualiza el festejo del Gitano que ya estaba escrito.

**Verificar antes de fijar el texto:** hora exacta del ataque; rumbo y distancia respecto
de la zona de exclusión al momento del impacto; cantidad de tripulantes a bordo; horas que
las balsas estuvieron en el agua con temporal; y **cuándo se enteró realmente la tropa en
el continente y en las islas** — el guion asume que la noticia llegó rápido a las bases
aéreas del sur, y eso hay que confirmarlo.

**Cifra usada:** 323 muertos. Es la más citada y es sólida, pero conviene la fuente al lado
porque va en placa.

**Tratamiento:** la narración da hechos sin adjetivar (fuera de la zona, rumbo contrario,
dos torpedos, temporal, 323). La bronca la ponen los personajes. Decisión de autor: el
juego tiene punto de vista argentino declarado, y en el cierre la responsabilidad se
reparte entre la junta y el gobierno británico — pero el respeto por los que pelearon se
mantiene igual para los dos lados.

## ✅ El ARA Narwal (M4 y M5 — 3.9) — VERIFICADO 2026-08-16

**Qué era.** Un buque pesquero de arrastre de **70 metros**, de la Compañía Sudamericana de
Pesca y Exportación. El **21 de abril de 1982** la Armada Argentina le montó sensores
electrónicos y lo destinó al Atlántico Sur a **simular pesca mientras relevaba movimientos
de la flota británica** y transmitía posiciones.

**Quiénes iban a bordo.** Tripulación **civil** —marinos mercantes y pescadores— y **un
solo oficial de la Armada**, el teniente de navío **Juan Carlos González Llanos**. El
capitán era **Asterio Daisaku Wagata**, paraguayo de origen japonés.

**Qué pasó.** El **9 de mayo de 1982** lo atacaron **dos Sea Harriers** con bombas de 500 kg
—bombas originalmente destinadas a la pista de Puerto Argentino—; una impactó directo en el
casco. **Un muerto: Omar Rupp, contramaestre. Doce heridos sobre veinticinco tripulantes.**
Los sobrevivientes fueron capturados y llevados al **HMS Hermes**. **Al cuerpo de Rupp lo
arrojaron al mar al día siguiente.**

**⚠ EL LÍMITE — lo que el guion NO puede afirmar.** Ninguna fuente vincula la inteligencia
del Narwal con **ningún ataque argentino concreto**. Si el guion dijera "gracias al Narwal
hundimos tal cosa", eso sería invención nuestra. Por eso en el guion el Narwal aparece
**solo como origen general de posiciones**, sin ningún resultado atribuido. Mismo criterio
que con la frase de las turbinas: se usa lo documentado y no se completa el resto.

**⚠ Segundo límite — el estatus del blanco.** El Narwal llevaba sensores militares y hacía
inteligencia para la Armada: **era legalmente un blanco militar válido**, aunque su
tripulación fuera civil y no tuviera armas. El guion **no lo presenta como un crimen** ni
lo adjetiva. Da los hechos —pesquero, civiles, sin armas, tres semanas adentro del bloqueo,
9 de mayo, un muerto— y deja que pesen solos, igual que con el Belgrano.

**Dónde entró.**

- **M4 (4 de mayo), tramo de vuelo sin enemigos — la plantación.** El Gitano le pregunta a
  Cóndor de dónde salen las posiciones y Cóndor contesta, sin darle importancia: *"de un
  barco pesquero llamado Narwal"*. Cierra el Puma: *"No son militares, Gitano. Y están más
  adentro que nosotros."* Las posiciones que dicta Cóndor **se marcan en el HUD**: el
  jugador usa la información del Narwal sin saber lo que está usando.
- **M5 (21 de mayo), mismo tramo — el cobro.** Cóndor se queda corto de posiciones, el
  Gitano pregunta por el pesquero, hay silencio de radio, y Cóndor responde: *"Hace doce
  días que no transmite."* **El HUD ya no marca nada.** La pérdida es mecánica, no
  declarada.
- **Cierre común — la placa.** Recién ahí el jugador se entera del final, junto con los 323
  del Belgrano.

**Chequeo de fechas (cierra solo).** Narwal atacado el **9 de mayo**; M4 es el **4 de mayo**
y M5 el **21 de mayo**. Del 9 al 21 hay **doce días** — que es exactamente lo que dice
Cóndor. Si alguna vez se mueven las fechas de M4 o M5, **hay que recalcular ese número.**

**Por qué funciona con el sistema que ya existía.** Los A-4 no tenían radar y dependían del
control de tierra; el guion ya usaba "la señal de Cóndor se pierde y el jugador queda
ciego" como amenaza recurrente. El Narwal le pone **cara humana** a esa mecánica una sola
vez, y no se vuelve a tocar.

**A verificar todavía:** nombre completo y grado exacto de Omar Rupp; si el resto de la
tripulación fue repatriada y cuándo; si el número 25 de tripulantes es el definitivo; y si
existe registro público de qué transmitió el Narwal (para asegurarse de que el guion no se
quede corto ni se pase).

**Fuente principal:** [Diario Crónica — la historia del ARA Narwal](https://www.diariocronica.com.ar/)

## La frase de las turbinas (M5) — ⚠ SIN FUENTE

**Texto usado, literal:** *"Si estás en guerra con Argentina y escuchás el ruido de las
turbinas de un avión… no mires al cielo… porque la muerte viene a ras del suelo."*

**Estado:** se buscó y **no tiene origen documentado**. Circula muy difundida en redes,
habitualmente atribuida a un oficial o veterano británico sin nombre, fecha ni unidad. No
aparece en ninguna fuente verificable.

**Cómo entró al guion, para que sea usable igual:** como **transmisión interceptada**, sin
firma, sin nombre y sin fecha, traducida en vivo por el Pichón en la sala de radio después
del Callejón (M5). Nadie la atribuye a nadie, y por eso no afirma nada falso.

**Si alguna vez aparece la fuente:** se puede acreditar y ganaría mucho. **Si se confirma
que es apócrifa:** no hace falta tocar nada — el guion nunca dijo quién la dijo.

**Por qué está en M5 y no antes:** San Carlos, 21 de mayo, es históricamente el momento en
que el miedo británico al vuelo rasante fue mayor. Y dramáticamente es la única vez en todo
el juego en que estos tipos se enteran de que no están perdiendo.

---

## Modo PASADA (docs/sistemas/PROPUESTAS_PASADA.md) — dudas que abre el diseño

El modo del clímax se apoya en varios hechos que están bien establecidos en general pero
cuyos NÚMEROS van a terminar en mecánica o en placa, así que conviene confirmarlos:

- **Armado de espoletas.** El juego va a decir "soltada por debajo de X metros, la bomba
  llega dormida". ¿Cuál era la altura/tiempo de armado real de las bombas usadas por los
  A-4 (las británicas de 1000 lb y las frenadas tipo Snake Eye)? El hecho general (bombas
  sin armar adentro de buques británicos) es sólido; el número exacto no lo tengo.
- **El rebote del Broadsword (25/5).** Dato cargado: una bomba rebotó en el mar y entró
  por la cubierta de vuelo destrozando el helicóptero, sin explotar. Es la base histórica
  de la mecánica "el sapito" y el Broadsword es boss (m13 canon). → Confirmar detalle.
- **Sea Cat.** El diseño lo trata como esquivable de verdad (subsónico, guiado manual,
  efectividad real bajísima). Las cifras de derribos ATRIBUIDOS en 1982 fueron altas y las
  confirmadas después, cercanas a cero. → Confirmar para no exagerar en placa.
- **Velocidad de ingreso del A-4 cargado.** El doc usa "~900 km/h a menos de 15 m". ¿Es
  defendible con tanques y bombas, o conviene bajar el número?
- **Alerta radar en Mirage/Dagger.** De los A-4 estoy seguro que no tenían RWR. ¿Los
  Mirage IIIEA o los Dagger tenían algún detector básico? No afecta a los Fieles, pero
  cierra la pregunta del sistema de avisos.
- **La BBC y las bombas dormidas.** La controversia de mayo del 82 (se difundió
  públicamente que las bombas argentinas no estaban explotando) existe y es citable; si
  alguna placa la usa, confirmar fecha y forma exacta de la difusión.
- **Carga de bombas de los A-4 (Grupos 4 y 5).** El modo usa una ristra de 2 bombas por
  pasada (3 como mejora futura), soltadas en salva sobre la línea de vuelo. Lo cargado:
  llevaban 1 bomba de 1000 lb o hasta 3 de 500, y la suelta era en sucesión — por eso hubo
  buques con varios impactos de una sola pasada. → Confirmar el loadout típico por Grupo
  (¿1×1000 en el perfil largo con tanques? ¿3×500 cuándo?) y que "misiles antibuque en
  A-4" es correctamente NUNCA (el Exocet era del Super Étendard).
- **Bombas que rebotaron POR ENCIMA de la cubierta.** El modo lo usa como fallo visible
  del sapito (suelta larga). Hay relatos de rebotes que pasaron de largo; confirmar al
  menos un caso citable.

---

## ❌ La moneda de la escuadrilla (challenge coin) — DESCARTADA, con motivo

**La idea:** la tradición de la *challenge coin* — alguien saca la moneda y golpea la mesa
en el bar, todos tienen que mostrar la suya, el que no la tiene paga la ronda de todos, y
si todos la tienen paga el que desafió. La moneda representa a la gente con la que volás.

**Por qué no entra al guion:**

1. **Es una tradición estadounidense.** El ritual del "coin check" se rastrea a la era de
   Vietnam en las fuerzas armadas de EE.UU. — evolucionó de los *bullet clubs*, donde se
   llevaba una bala personalizada en el bolsillo. Su expansión masiva es posterior, sobre
   todo de los años 90 en adelante.
2. **En Argentina no existe.** Un sitio argentino dedicado a catalogar challenge coins dice
   textualmente: *"No se conocen Challenge Coins Argentinas."* Si un coleccionista
   especializado no encuentra ninguna, no es que falte documentación: la tradición no está.
3. **Sería anacronismo y préstamo cultural a la vez.** En una escuadrilla de 1982 leería
   como película bélica norteamericana — lo contrario de lo que construyen el mate, el
   asado y las tonadas.
4. **Y además es redundante.** La función que cumpliría —un objeto que representa a la
   gente con la que volás y lo que sobreviviste— ya la cumplen **las estrellitas del
   Turco**, y mejor: están atadas a la mecánica del regreso y tienen el momento de M7
   ("hay una estrellita que hoy no se pinta; el tarrito queda abierto toda la noche").
   Un segundo objeto con la misma función debilitaría al primero.

**Queda anotado para que no vuelva a proponerse.** Si aparece documentación de que algo
así existía en la Fuerza Aérea Argentina antes de 1982, se reevalúa.

**Fuentes:** [Moviarg — Challenge Coins (sitio argentino)](https://www.moviarg.com/notas/Challenge_Coin.html) ·
[Cristaux — History of Challenge Coins](https://www.cristaux.com/blog/history-of-challenge-coins/)

## 🟡 PREGUNTA ABIERTA — la colaboración de Chile con el Reino Unido (¿entra o no entra?)

**Decisión de Matías (2026-08-16): NO SE TOCA EL GUION POR AHORA.** Queda anotado como
pregunta abierta, para resolver más adelante. Está investigado y verificado; lo que falta
decidir es **si conviene meterlo**, no si es cierto.

### Lo que está documentado

**La transacción va al revés de como circula.** No es que "Chile le vendió información a
Inglaterra": **el Reino Unido le vendió material bélico a Chile a precio simbólico, y Chile
pagó con inteligencia.**

No es versión argentina ni rumor. Lo reconoció públicamente el **general Fernando Matthei**,
comandante de la Fuerza Aérea de Chile y miembro de la junta de Pinochet, en entrevistas de
los años 2000. **Thatcher agradeció la ayuda chilena en público en 1999**, con Pinochet
detenido en Londres. El enlace británico, el wing commander **Sydney Edwards**, lo contó en
un libro.

- **Operación Fingent.** Radar **Marconi S259** de la reserva móvil de la RAF; sale de
  Brize Norton el **5 de mayo de 1982** en un Boeing 747; se instala en **Balmaceda**,
  apuntado al espacio aéreo de **Comodoro Rivadavia**. Lo operan **cuatro oficiales y siete
  suboficiales de la RAF vestidos de civil**, presentados como un equipo de ventas que venía
  a capacitar chilenos. Lo que levanta el radar va al cuartel de inteligencia de la FACh, y
  de ahí un equipo británico lo retransmite **por satélite a la flota**.
- **Punta Arenas.** Puesto de mando subterráneo; un oficial de enlace chileno pasa
  información en tiempo real a Edwards. **Matthei, textual:** *"una hora antes de que
  llegaran, los ingleses ya estaban informados de su llegada."*
- **El precio.** Radar + seis **Hunter** + tres **Canberra** de reconocimiento + **Vampire**
  + misiles, por una cifra nominal (se reporta **menos de una libra esterlina**). También
  llegó un **C-130 británico pintado con los colores e insignias de la FACh**.
- **La prueba física.** El **Sea King quemado en Agua Fresca**, cerca de Punta Arenas
  (mayo del 82): operación **Plum Duff**, el intento del SAS de llegar a **Río Grande** a
  destruir los Super Étendard y los Exocet. Los comandos se entregaron. Confirma que había
  operaciones británicas montadas desde suelo chileno.

### ⚠ Los dos límites que decidirían cómo entra (si entra)

1. **Fue la dictadura de Pinochet, no "Chile".** Matthei operó con autorización directa de
   Pinochet y **con la orden expresa de NO informar a la Cancillería chilena**. El pueblo
   chileno no supo nada durante veinte años. Esto no es un matiz para suavizar: **es la
   columna vertebral que el juego ya tiene** — *los de arriba, de los dos lados, salieron
   ganando*. Pinochet es un "de arriba" más, igual que la junta y que Thatcher.
   - **Simetría que se regala sola con el Perú:** *Perú es el vecino cuyo **pueblo** movió;
     Chile es el vecino cuya **dictadura** arregló.* El mismo par de manos, arriba y abajo.
     Y el remate del Turco en Tandil —"el que te da una mano es el que también tiene
     frío"— sigue siendo cierto sin tocarle una coma.
2. **⚠ RESTRICCIÓN DURA: la escuadrilla NO PODÍA SABERLO.** Nada de esto era público en
   1982; salió recién con Thatcher (1999) y Matthei (2000s). Si un personaje dice "los
   chilenos nos están vendiendo", se pone conocimiento de 2005 en boca de 1982 — **el mismo
   error de categoría que ya se cometió una vez con la frase de Iorio.**

### La forma propuesta, si algún día entra

- **Sospecha sin confirmación, en boca de la escuadrilla.** Eso sí es históricamente
  honesto: los pilotos notaban que los estaban esperando. Una línea, una sola vez, **sin
  nombrar a Chile** — *"nos están esperando siempre, Puma. Siempre"* — y que nadie pueda
  probar nada. La paranoia sin objeto es más incómoda y más real que la denuncia.
- **El dato, seco, en la placa del cierre**, junto a los 323 del Belgrano y el Narwal: qué
  se transfirió, quién lo autorizó, y que la Cancillería chilena no fue informada. Que el
  jugador lo entienda recién ahí — y que entienda de paso que **el que arregló con Londres
  era el mismo tipo de gobierno que lo mandó a él a la isla.**

### ❌ Lo que NO habría que hacer

Una escena de bronca contra Chile. Rompe la tesis, enfrenta al juego con el vecino con el
que hay una historia larga de vecindad real, y desperdicia el hallazgo: **el enemigo del
juego no es un país, son los de arriba de cualquier país.** Chile bien contado no debilita
eso — lo prueba por tercera vez.

### Sin verificar (no usar hasta confirmar)

Circula que el radar de Balmaceda estuvo fuera de servicio en fechas puntuales y que eso
coincidió con incursiones argentinas exitosas. **No se verificó.** No entra a ningún lado
hasta tener fuente.

**Fuentes:** [Infobae — Operación Fingent](https://www.infobae.com/sociedad/2019/06/27/operacion-fingent-el-radar-que-los-britanicos-vendieron-a-chile-para-espiar-los-movimientos-argentinos-en-la-guerra-de-malvinas/) ·
[El Mostrador — la colaboración de Matthei](https://www.elmostrador.cl/noticias/pais/2014/08/21/asi-fue-la-colaboracion-de-matthei-con-inglaterra-para-la-guerra-de-las-malvinas/) ·
[El Mostrador — ex agente británico](https://www.elmostrador.cl/noticias/pais/2014/07/07/ex-agente-britanico-revela-detalles-de-ayuda-chilena-en-guerra-de-malvinas/) ·
[MercoPress — memorándum para Thatcher](https://en.mercopress.com/2012/04/05/memorandum-for-lady-thatcher-on-chile-s-support-during-falklands-conflict) ·
[La Nación — Operación Plum Duff](https://www.lanacion.com.ar/lifestyle/plum-duff-la-fallida-operacion-de-los-comandos-britanicos-en-tierra-del-fuego-que-buscaba-destruir-nid28052024/) ·
[Zona Militar — los restos del Sea King](https://www.zona-militar.com/2022/05/18/malvinas-40-anos-los-restos-de-un-helicoptero-sea-king-destruido-son-hallados-en-chile/)

## 🟡 A EVALUAR — la regla del "gracias" en el mate

Lo que **sí** vale la pena de la idea anterior no es el objeto: es el **mecanismo**. Una
regla que todos conocen, y una consecuencia para el que la rompe. Eso genera escenas solo.

Y hay una versión argentina que no requiere investigación porque cualquiera la sabe:
**decís "gracias" y quedaste afuera de la ronda de mate.** No se avisa, no se negocia,
todos lo entienden.

**Dónde rendiría más: M13, la noche del asado.** El mate ya viene funcionando como
termómetro emocional de toda la campaña (frío en el locker de M7, sin cebar en M11, dejado
por la mitad en M14, y el del Final B). Si en el asado uno de ellos dice "gracias" sin
pensar —distraído, cansado, con la cabeza en mañana— la mesa se queda muda: acaba de decir
que se va de la ronda, la noche antes de la misión de la que puede no volver. Nadie tiene
que explicar nada.

**No está implementado.** Va como propuesta a evaluar, y si entra hay que cuidar que no
compita con la despedida del Turco ("tres desayunos"), que ocupa un lugar parecido.

## ⚠ PREGUNTA ABIERTA — rituales propios de la Fuerza Aérea Argentina en 1982

La pregunta correcta no es si funcionaba una tradición importada, sino **qué rituales
tenían ellos**. Eso no se resuelve googleando: se pregunta.

Para cuando haya contacto con un veterano o con la Asociación de Pilotos de Caza:

1. ¿Había algún objeto o gesto compartido de escuadrilla — algo que se llevaba encima,
   algo que se hacía antes de subir, algo en el bar o en el casino de oficiales?
2. ¿Existía alguna fórmula fija por radio antes de despegar? *(El guion inventa el ritual
   de Cóndor; conviene saber cuánto se parece a lo real.)*
3. ¿Qué se hacía cuando alguien no volvía, esa misma noche? *(El guion inventa la estrellita
   que no se pinta y el tarrito abierto.)*
4. ¿El mate circulaba en la línea de vuelo y en el hangar, o era solo de casino?

Las respuestas valen más que cualquier tradición prestada.


## Los Harrier en la cola (docs/sistemas/PLAN_HARRIERS_PERSECUCION.md)

- **Derribos aire-aire de Sea Harriers.** El diseño asume que NINGÚN Harrier cayó en
  combate aire-aire en 1982 (por eso el default del juego es AHUYENTARLO, no derribarlo,
  y el derribo es hazaña rara). → Confirmar que es cero y citar fuente.
- **Tiempo de estación de la CAP.** El duelo termina solo porque la CAP tenía minutos de
  loiter (los portaaviones lejos). ¿Cuántos minutos reales de estación tenían los Sea
  Harrier sobre el estrecho? El juego usa ~45 s de duelo como compresión.
- **La escapada a ras.** El diseño hace que volar pegado al agua degrade la puntería del
  cazador (clutter, AIM-9L contra fondo de mar). ¿Cuánto protegía de verdad? Hay
  escapadas documentadas de A-4 a ras — juntar 1–2 casos citables.
- **Cañones Aden de 30 mm contra A-4**: ¿hubo derribos a cañón, además de misiles?
