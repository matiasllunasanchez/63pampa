# RASANTE — Plan de voces

> **Cambio de decisión.** Hasta ahora el plan era texto escrito, porque las voces con IA no
> hacen rioplatense creíble y contratar actores no entraba en el presupuesto. Con la
> posibilidad de grabar voz propia, **el juego pasa a tener voces** — pero no de cualquier
> manera, no todas, y **nunca como dependencia.**

---

# PRINCIPIO RECTOR — el texto manda, la voz decora

**El juego tiene que funcionar entero, y emocionar entero, con el audio apagado de voces.**
Texto en pantalla siempre, en el idioma del jugador. La voz es una capa que se pone encima,
opcional, y que puede no existir sin que se pierda nada de la historia.

Esto no es una limitación asumida a regañadientes: es **la decisión de arquitectura más
importante del proyecto en materia de audio**, y tiene cuatro consecuencias que hay que
respetar sin excepción.

### 1. Nada de información vive solo en la voz
Si una línea está actuada, **está escrita, palabra por palabra**. Prohibido el ad-lib, el
"mhm" que significa algo, la reacción que solo se escucha, el matiz irónico que solo existe
en la interpretación. Si el actor —vos— improvisa algo bueno en la toma, **se sube al guion
o se descarta**. No hay tercera opción.

### 2. El ritmo lo maneja el texto, nunca el clip de audio
Este es **el error que hunde todos los juegos con voz opcional**: se cronometra la escena
contra la duración del audio, y después la versión sin voz queda con silencios muertos o
pasa de largo antes de que se pueda leer.

La regla: **la escena avanza por el jugador o por un temporizador calculado sobre la
cantidad de texto.** La voz suena por debajo y si se corta, se corta. **La voz nunca puede
bloquear el avance.** Si el jugador apreta para seguir, la línea de audio se corta a mitad
—como en cualquier RPG— y no pasa nada.

### 3. El diseño de sonido carga la emoción, no las voces
Si la voz es opcional, el peso emocional tiene que estar en **ambiente y foley**: la lluvia
sobre el casco, la pava, la turbina, el viento de turba, los silencios. Eso es lo que suena
siempre. Es donde conviene poner el esfuerzo de audio, y ya estaba dicho en
PLAN_CINEMATICAS.md — ahora es obligatorio.

### 4. Se puede publicar sin una sola voz
Y esto es una ventaja de producción enorme: **el juego sale completo sin voces, y las voces
se agregan después como actualización gratuita.** Dejan de ser un riesgo de cronograma y
pasan a ser un extra. Si nunca conseguís a Norma, el juego igual existe.

> **Beneficio lateral que no es menor:** un juego así es **accesible por diseño**. Una
> persona sorda o hipoacúsica recibe el 100 % de la historia, sin necesidad de un "modo
> accesibilidad" aparte. Eso también se puede decir en la página de Steam.

---

## Lo primero: la ventaja real que apareció

El motivo por el que descartábamos voces no era la plata: era el **acento**. El voseo y la
cadencia rioplatense son parte de la tesis del proyecto, no un detalle de producción, y
ningún modelo los hace bien. Grabar voz propia **elimina esa objeción de raíz**: sos
argentino, hablás como hablan los personajes, y eso es exactamente lo que ninguna IA te
puede dar.

Eso vale más que la calidad de micrófono. Una toma casera con el acento correcto le gana a
un doblaje neutro impecable, todas las veces.

---

## ⚠ La trampa: modular NO crea personajes

El modulador va a tentar a hacer las nueve voces solo. **No funciona, y se nota enseguida.**

Cambiar el pitch y el formante te da **la misma actuación a distinta altura**. El oído humano
está absurdamente afinado para esto: reconoce a la misma persona por el ritmo, las pausas,
la forma de arrancar una frase y la manera de respirar, aunque le muevas el tono dos
octavas. El resultado no suena a nueve personajes, suena a **un tipo haciendo voces**, y eso
es peor que el texto escrito porque rompe la ilusión en vez de sostenerla.

**Lo que sí diferencia una voz de otra es la interpretación, no el procesado.** Y ahí tenés
una ventaja enorme que ya está escrita en el guion: los personajes de RASANTE **ya hablan
distinto**. El Gitano habla de más y remata con chistes; el Vasco casi no habla; Puma habla
como reglamento; el Turco habla como un viejo que quiere a todo el mundo; el Pichón habla
como un pibe que sabe demasiado y no sabe decirlo. Esa diferencia está en el texto y es la
que hay que actuar. El modulador va después, suave, y solo para separar registros que ya son
distintos.

---

## El reparto que yo haría

**Cuatro o cinco personas reales le gana a nueve voces moduladas por una.** Y conseguir
cuatro argentinos que lean unas líneas es gratis: familia, amigos, un asado.

| Personaje | Quién | Por qué |
|---|---|---|
| **Esteban / "Tero"** (41) | **Vos** | Es el que jugás y el que escribe la carta. Ver abajo. |
| **Vasco** (36) | **Vos** | **Casi no habla en todo el juego.** Un puñado de líneas cortas y secas. Es el papel más fácil que existe y es tuyo gratis. |
| **Colorado** (26) | Vos, o quien sea | Pocas líneas, tono alegre. Aguanta modulación liviana. |
| **Gitano** (33) | Otra persona | Energía completamente distinta: habla mucho, rápido, se ríe. Si lo hacés vos, se te va a parecer a Esteban. |
| **Puma** (44) | Otra persona, con voz grave | Peso y autoridad. Tiene que sonar más viejo y más ancho. |
| **Turco** (58) | Un señor mayor de verdad | La edad en la voz no se simula. Un tío, un padre, un vecino. |
| **Pichón** (22) | Alguien joven | Tiene que sonar a pibe entre grandes. |
| **Mateo** (18) | Alguien joven | **Idea:** si conseguís a alguien de tu familia para Mateo mientras vos hacés a Esteban, el parentesco real se escucha. Es padre e hijo. |
| **Norma** (47) | **Una mujer, sin excepción** | No se negocia y no se modula. Además es el personaje al que nunca se le ve la cara: **su voz es todo lo que tiene.** |

---

## Para qué sí usar ElevenLabs

No para los personajes — para lo que **no podés hacer vos**, y que además va filtrado por
radio, donde la calidad importa menos:

- **Las voces inglesas.** Chatter de radio de la Royal Navy y la RAF. El juego respeta al
  soldado inglés igual que al argentino, y para eso tienen que sonar a personas, no a
  enemigos genéricos. Acentos que no podés hacer.
- **Control, torres, operadores de radio.** No son personajes: son función. Perfecto para IA.
- **Locución de archivo**, si en algún momento hay un noticiero o un parte oficial de época.

Todo eso pasa por filtro de radio, que aplana el timbre y disimula el origen sintético.

---

## El papel que tiene que ser tuyo: la carta del padre

De todo el juego, **los cinco fragmentos de la carta que Esteban escribe y nunca manda** son
el único lugar donde una voz humana agrega algo que el texto no puede dar. Es un hombre
tratando de contestarle dos preguntas a su hijo y tachando todo, y la última línea sin
tachar es *"Así que voy a ir"*.

Grabalo vos. No por ahorrar: porque es tu proyecto y esa es la voz que corresponde. Y
grabalo **sin actuar** — leído bajo, cansado, como quien lee algo que escribió y le da un
poco de vergüenza.

---

## Lo que NO lleva voz *(y esto es importante)*

Poner voz a todo es la manera más rápida de arruinar lo que ya funciona. Estos momentos se
quedan **mudos o escritos**, sin excepción:

- **El dorso de la foto del Vasco.** *"Te amo, mamá. Perdoname."* Es una cosa escrita a mano
  por un tipo que no escribe nunca. Si alguien la lee en voz alta, se convierte en un
  discurso. Se lee en pantalla, en silencio.
- **Las cartas de Mateo.** Son páginas de un cuaderno. Se leen, no se escuchan.
- **La mesa de Norma, el final.** Silencio. Todo el peso está en dos papeles enfrentados.
- **El momento en que los tres hacen la cuenta en el locker.** Las tres líneas van dichas,
  pero lo que sigue —el silencio— tiene que durar incómodo. No lo tapes con nada.

> **La regla:** la voz sirve para los vivos hablando entre ellos. Lo que está escrito se lee,
> y lo que duele se calla.

---

## Cómo grabar en casa sin que se note

**El delator no es el micrófono, es la habitación.** Grabá adentro de un placard con ropa
colgada, o con un acolchado armando una carpa sobre el micro. Suena ridículo y funciona
mejor que cualquier plugin.

**El segundo delator es sobreactuar.** Es lo más común en grabaciones caseras y en este
juego sería fatal, porque el guion entero está escrito en tono bajo: gente que se quiere y
no lo dice. Instrucción para todos los que graben: **decilo más suave de lo que te parece que
va.** Si suena a demasiado poco, está bien.

**El filtro de radio es tu amigo, pero no siempre.** Las comunicaciones en vuelo van
band-limited, comprimidas y con estática: eso disimula ruido de sala y micrófono berreta. Las
escenas en tierra —el vestuario, el asado, la cocina— van **limpias**, porque ahí el timbre
de cada voz es lo que separa a un personaje de otro.

**Una línea por toma, muchas tomas.** No intentes grabar una escena de corrido. Y guardá
siempre la primera: suele ser la menos actuada y la mejor.

**Grabá a todos con el mismo micro y en el mismo lugar.** Si cada voz viene de un cuarto
distinto, las escenas de grupo no van a pegar y ningún procesado lo arregla.

---

## Subtítulos y traducción — acá está el juego de verdad

Si el texto manda, entonces **el texto es el producto** y merece el cuidado que uno le
pondría a la actuación.

### El cuarto registro tipográfico
El juego ya tiene tres registros de texto escrito: `[TIERRA]` (el cuaderno de Mateo, letra
grande de pibe), `[CARTA]` (el block militar del padre, apretado y con tachones) y la
tipografía técnica del juego. **El diálogo hablado necesita un cuarto**, distinto de los
tres, para que el jugador nunca confunda *lo que alguien dice* con *lo que alguien escribió*.
Esa distinción es la columna vertebral del guion.

Y el nombre de quién habla va **siempre**, aunque haya voz. Con nueve personajes y varias
escenas de grupo, no alcanza con el timbre.

### Idiomas
**Español rioplatense como fuente, inglés como segundo idioma.** El resto (portugués de
Brasil, alemán, chino simplificado) recién si el juego camina — traducir antes es plata
tirada.

**El audio no se dobla nunca.** Las voces quedan en el idioma en que se grabaron y los
subtítulos cambian. Es la decisión correcta por costo y es la correcta por criterio: un
juego sobre Malvinas doblado a inglés neutro sería otra cosa.

### La traducción al inglés — lo que hay que cuidar
El guion está escrito en voseo y con modismos que **no tienen equivalente literal**. La
instrucción para quien traduzca (o para vos, revisando):

**Traducir el registro, no las palabras.** Que un personaje suene informal, cansado y de
clase trabajadora importa más que reproducir exactamente *"dale"* o *"che"*. Un inglés
demasiado correcto convierte a la escuadrilla en oficiales británicos, que es justo lo que
no son.

**Dejar sin traducir lo que se entiende por contexto** y es identidad: *mate*, *asado*,
*Rastrojero*, los apodos. "Gitano" no es "Gypsy" — es su apodo, se queda. Ningún jugador se
pierde y el mundo se mantiene entero.

**Los nombres propios de las cosas del guion no se tocan:** *Plata Fiel*, los indicativos de
las misiones, *"Los valientes vuelan abajo."*

**Cuidado especial con las líneas que cierran escenas.** *"Así que voy a ir"*, *"Te amo,
mamá. Perdoname."*, *"Traémela entera, Tero."* Esas hay que trabajarlas una por una hasta
que peguen igual de fuerte en inglés. Son diez o quince líneas en todo el juego: merecen un
día entero.

### La simetría que este esquema regala
Si las voces argentinas quedan en castellano y las inglesas en inglés, con subtítulos que
cambian según el jugador, pasa algo lindo y muy acorde a la tesis del juego: **para un
jugador argentino, la radio inglesa suena extranjera; para un jugador inglés, la escuadrilla
suena extranjera.** Los dos escuchan gente real hablando su idioma y los dos leen al otro.
Nadie es "el enemigo genérico" en ninguna versión.

---

## Qué cambia esto en el resto del plan

Las cinemáticas fijas **suben mucho** de calidad con voces. Una lámina quieta con capas,
sonido ambiente y dos personajes hablando de verdad no se percibe como estática: se percibe
como una escena. Esto refuerza la decisión de PLAN_CINEMATICAS.md en vez de contradecirla —
**hace que gastar poco en video sea todavía más razonable.**

El plan de banda sonora tampoco cambia, pero conviene anotar algo: con voces, **hay que
sacar música de encima**. La música tapaba silencios que ahora los llenan las voces y las
pausas. Menos pistas, más bajas, y varias escenas que quedaban con música ahora pueden ir
solo con ambiente.

---

## Orden sugerido

**Lo primero no es grabar: es construir el juego sin voces y que funcione.**

1. **Armá el sistema de diálogo texto-primero**, con el cuarto registro tipográfico, el
   nombre del que habla, y el avance manejado por el jugador. Probá una escena completa en
   silencio: si emociona muda, está bien hecha.
2. **Diseño de sonido ambiente** de esa misma escena. Sin voces. Si con lluvia, viento y una
   pava la escena ya te agarra, el plan está probado.
3. **Recién ahí, prueba de concepto de voces:** grabá vos una escena corta entre Esteban y
   el Vasco, que son tus dos papeles, y escuchala al día siguiente. Si te suena a dos
   personas, seguimos. Si te suena a vos dos veces, hay que buscar gente.
4. **Grabá la carta del padre.** Cinco fragmentos cortos. Es lo más importante y lo que menos
   depende de nadie.
5. **Conseguí a Norma.** La voz más difícil de reemplazar y la que más rinde.
6. El resto del reparto, sin apuro y sin que bloquee nada.
