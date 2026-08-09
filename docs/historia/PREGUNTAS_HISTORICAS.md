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
