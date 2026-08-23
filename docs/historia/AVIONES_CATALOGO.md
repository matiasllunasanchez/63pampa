# RASANTE — Catálogo del roster jugable

> Los seis aviones cargados hoy en [`src/data/planes.js`](../../src/data/planes.js): qué es
> cada uno **de verdad**, qué hizo en 1982, dónde puede aparecer sin mentir, y qué debería
> hacer en las manos del jugador.
>
> Este documento existe por dos razones. La primera: la decisión de que la campaña vuela
> **A-4B y no Super Étendard** está escrita en
> [AVIONES_ESCUADRON.md](AVIONES_ESCUADRON.md), y sin un catálogo esa decisión se queda sola
> —cada avión nuevo vuelve a abrir la discusión—. La segunda: hoy las descripciones de
> `planes.js` **prometen diferencias que el código no cumple** (ROADMAP #10, confirmado en
> ANALISIS_ROADMAP §10). Acá está de dónde sacar esas diferencias, para que salgan de lo que
> el avión era y no de un número inventado.

---

## La regla de época — tres canastos

Todo avión que entra al juego cae en uno de tres, y el canasto decide dónde puede aparecer:

| Canasto | Qué significa | Dónde puede aparecer |
|---|---|---|
| 🟢 **CANON** | Es el avión de los Fieles de Plata. | Campaña + todos los modos |
| 🟡 **DE ÉPOCA** | Existió y peleó en 1982, pero era de otra fuerza, otro grupo u otro rol. | Modos sueltos. En campaña **solo** si el guion lo justifica |
| 🔴 **FUERA DE ÉPOCA** | No existía en 1982. | Modos sueltos **y con la placa que lo diga** |

**El precedente para el canasto rojo ya está resuelto en el guion**, y hay que respetarlo: la
placa del Mirage 5P en M10 dice *"Diez llegaron del Perú el 5 de junio de 1982. Nunca
llegaron a combatir. **Acá, sí.**"* Es honesto porque **nombra el hecho y después ofrece el
juego**, sin fingir que una cosa es la otra. Cualquier avión del canasto rojo entra así o no
entra.

---

## La regla en el código — la campaña no te deja elegir avión

El canasto de arriba dice *dónde puede aparecer* cada avión. Esto dice **quién lo hace
cumplir**, porque durante un tiempo no lo hacía nadie del todo.

**La regla:** una misión de campaña se vuela en **A-4B SKYHAWK** (`key: 'sky'`), venga por la
puerta que venga. No es una preferencia del jugador: es
[la decisión del escuadrón](AVIONES_ESCUADRON.md) — *"cinco A-4B, uno por Fiel, mismo modelo
para todos"*— y si se pudiera cambiar, la escuadrilla dejaría de ser una escuadrilla.

**Dónde vive:** `CAMPAIGN_PLANE` en `game.js`, y lo fuerzan las **tres** puertas por las que
se entra a una misión:

| puerta | qué es |
|---|---|
| `startCampaign()` | campaña nueva |
| `loadSave()` | partida guardada |
| `abrirMision()` | el selector **MISIONES**, los **MOMENTOS** de PRUEBAS y la sonda `__mision` |

**Lo que la regla NO toca:** los modos que no son una misión — POR LA PATRIA, PERSECUCIÓN y
JUEGO RÁPIDO— siguen respetando el avión que elegiste. Ahí elegir avión *es* el punto, y es
lo que le da sentido a que el roster tenga seis entradas y no una.

### Las dos trampas que esto ya pisó *(no repetirlas)*

**1. La tercera puerta no existía.** Durante un tiempo sólo las dos primeras forzaban el
avión. El selector de MISIONES abre en `gameMode 'cycle'` y **no tocaba la elección**: el
avión que hubiera quedado puesto en JUEGO RÁPIDO se colaba en M1–M12. Se volaba el guion en
un Mirage — y peor, se **medían los tramos y la dificultad contra otro avión**, que ensucia
el ajuste sin que nada se queje. Si mañana aparece una cuarta puerta a una misión, tiene que
pasar por acá.

**2. `CAMPAIGN_PLANE` era un `0` escrito a mano.** El roster se reordena de verdad —salió el
Pampa y el Mirage IIIEA pasó a ser el 5P «Mara»— y un índice literal seguiría apuntando "al
primero", que después de mover una línea es el Dagger. Ahora se busca **por clave**. La regla
general: en `PLANES` **nunca** se referencia un avión por su posición.

### Por qué la prueba ensucia la elección antes de medir

La custodia es `npm run misiones`, que vuela las doce y exige
`✓ vuela el A-4B aunque venga elegido otro avión`. La sonda `__avion(n)` **pone otro avión a
propósito** antes de abrir cada misión, y eso no es adorno: el carrusel ya abre en el Skyhawk
por default, así que sin ensuciar primero la prueba saldría verde sola y estaría probando **el
mecanismo en vez del cableado** — que es exactamente cómo se nos escapó el bug del clima en
[SPEC_AGUA_OLAS](../sistemas/SPEC_AGUA_OLAS.md) §9.9.

### Y si algún día el A-4Q entra a la campaña

Se evaluó y **se descartó** (21/8/2026). El A-4Q es 🟡 de época pero de la **Aviación Naval**,
no del Grupo 5 de Caza, así que meterlo rompería el *"mismo modelo para todos"* — que no es un
detalle de ambientación sino de lo que Mateo reconoce cuando pasa su papá. Si alguna vez se
revierte, el cambio es hacer que `CAMPAIGN_PLANE` sea una **lista** de claves y decidir qué
significa entonces "el avión de un Fiel": hoy hay una respuesta y es una sola.

---

## 1 · A-4B SKYHAWK — 🟢 CANON

`key: 'sky'` · *"Equilibrado - protagonista de la campaña"*

**Lo que fue.** Douglas A-4B, diseño norteamericano de los años 50. **Fuerza Aérea
Argentina**, Grupo 5 de Caza, desde Río Gallegos — la base de Esteban en el guion. Motor
Wright J65, turborreactor **sin posquemador**. Dos cañones **Colt Mk 12 de 20 mm**. **Sin
radar**: dependía del control de tierra, que es de dónde sale Cóndor como radar humano.
Atacaba con bombas, llegando encima del blanco. Se reabastecía en vuelo del KC-130H —
la Chancha. Fue el caballo de tiro del esfuerzo aéreo, y pagó el precio: bajas altas y
sostenidas.

**Por qué es el de la campaña.** Ver [la decisión](AVIONES_ESCUADRON.md). En una línea: es el
único que hace jugable la doctrina que da nombre al juego, y el único que sostiene el arco de
desgaste de catorce misiones.

**Identidad mecánica: es LA VARA.** Todos los demás se miden contra él. Ninguna perilla
suya se toca — si un avión tiene que sentirse distinto, se mueve el otro.

### 🟥 EL ARMAMENTO — lo que realmente llevaban *(verificado 2026-08-22)*

**Cañones: dos Colt Mk 12 de 20 mm, 100 proyectiles cada uno.** Y el dato que vale para el
guion: **eran poco apreciados y se trababan.** Un piloto con los cañones trabados sobre el
blanco es una escena que se escribe sola.

**Bombas — las tres que efectivamente usaron:**

| Bomba | Peso | Dónde aparece |
|---|---|---|
| **Mk 17** | 1000 lb / 454 kg | Los ataques grandes contra buques (12 de mayo, HMS Glasgow y HMS Brilliant) |
| **Mk 82**, incluida la versión **Snakeye** | 500 lb | Las aletas frenadoras del Snakeye existen **justamente para poder tirar bajo** |
| **BRP-250 española** | 250 kg | 8 de junio, Sir Galahad y Sir Tristram — **tres por avión** |

**Configuración típica: tres bombas por avión** (una ventral, dos alares), o una sola de
1000 lb. Tanques externos de 1.400 litros en pilones.

**⚠ NI CONTRAMEDIDAS.** De fábrica **no tenían nada**: ni bengalas, ni lanzadores de chaff,
ni alerta radar. El chaff que usaron era **casero, cortado con una máquina de hacer fideos**,
envuelto en papel higiénico y metido en el freno aerodinámico — o sea que **soltar la defensa
te frenaba.** Historia completa y verificada en PREGUNTAS_HISTORICAS.

**⚠ NO LLEVABAN MISILES AIRE-AIRE.** Bombas y cañón, nada más. Contra un Sea Harrier con
Sidewinder AIM-9L, un A-4B **no tenía absolutamente nada que hacer**: ni radar para verlo
venir, ni misil para contestarle. **Esa indefensión no es un detalle técnico del juego: es
la premisa.** Todo el sistema de LA COLA y del Harrier que persigue se apoya en este hecho.
*(El A-4Q de la Armada es un caso aparte — ver PREGUNTAS_HISTORICAS.)*

### 🟥 EL PROBLEMA DE LAS ESPOLETAS — el corazón de M6

Volaban tan bajo que **la espoleta no llegaba a armarse antes del impacto**. Resultado:
**13 bombas pegaron y no explotaron.** Se salvaron por eso, entre otros, el **HMS Antelope**,
el **HMS Glasgow** y el **HMS Plymouth**. En el intento se perdieron **22 aviones**.

**La frase, y ésta SÍ tiene fuente:** un oficial británico reconoció que **"con seis
espoletas mejores, habríamos perdido"**.

> **Esto ya está adentro del guion sin que lo hubiéramos verificado:** **M6 se llama "La
> bomba que no despertó" y su blanco es el HMS Antelope** — que es literalmente uno de los
> buques que sobrevivieron por una bomba que no explotó. El título del nivel era correcto
> antes de saberlo. **La frase de las seis espoletas es candidata fuerte para la placa del
> cierre**, junto a los 323 del Belgrano y el Narwal: es de las pocas citas británicas del
> juego que tienen fuente de verdad.

> ⚠️ **Bug vivo:** el HUD anuncia `AFTERBURNER x{n}` en inglés (`strings.js`). El A-4B **no
> tiene posquemador**. En castellano dice `TURBINA` y zafa; el inglés afirma un sistema que
> ese avión no tenía. Cambio de una línea.

---

## 2 · A-4Q — 🟡 DE ÉPOCA (otra fuerza)

`key: 'a4q'` · *"Variante naval - similar al A-4B/C"*

**Lo que fue.** La versión de la **Armada** — 3ª Escuadrilla Aeronaval de Caza y Ataque.
Embarcada en el portaaviones **ARA 25 de Mayo**; cuando el portaaviones se replegó a puerto,
la escuadrilla siguió operando desde tierra, en Río Grande. Participó de los ataques que
hundieron la **HMS Ardent** el 21 de mayo. Célula prácticamente igual a la del B/C: la
diferencia es de quién era y desde dónde salía.

**Dónde puede aparecer.** Modos sueltos sin ningún reparo. En campaña **no**, y no por el
avión sino por el uniforme: los Fieles son Fuerza Aérea.

**Identidad mecánica: el mismo avión con otra vida.** No se le tocan las perillas de vuelo —
se le cambia **de dónde arranca**. Es el candidato natural para el arranque naval:
`cfg.start = 'air'` (ya existe, misiones de regreso, ROADMAP #26) y una pista corta. Mismo
fierro, otra rutina.

---

## 3 · IAI DAGGER — 🟡 DE ÉPOCA (otro grupo)

`key: 'dagger'` · *"Mas rapido y con mas fuego - dificil de controlar"*

**Lo que fue.** El **Nesher** israelí —derivado del Mirage 5— vendido a la Argentina y
rebautizado Dagger. **Fuerza Aérea**, Grupo 6 de Caza. Ala delta, mucho más rápido que el
Skyhawk, dos cañones **DEFA de 30 mm** (contra los 20 mm del A-4). Y el dato que lo define:
**no tenía sonda de reabastecimiento en vuelo.** Salía del continente, tenía unos minutos
sobre el objetivo y se volvía, sin nadie que lo esperara a mitad de camino. Sufrió bajas
severas frente a los Sea Harrier.

**Dónde puede aparecer.** Modos sueltos. En campaña, solo como aviones de otra escuadrilla
vistos de lejos.

**Identidad mecánica: pega más fuerte y el reloj lo mata.** Es el avión que ya tiene la
promesa mejor escrita en `planes.js` y hoy no la cumple:

- **Cañón de 30 mm** → más daño por bala, pero cinta más corta: sube `GUN_HEAT_SHOT`.
- **Más rápido** → sube el techo de velocidad y los escalones de turbina.
- **Sin sonda** → **drenaje de combustible más alto y sin acceso a la Chancha** (ROADMAP #15).
  Ese es el ítem entero: el Dagger no es "el difícil", es **el que juega con menos reloj**.
- **Ala delta pesada abajo** → menos carril lateral (`FLY_X`), menos gracia de roce.

---

## 4 · MIRAGE 5P «MARA» — 🔴 NO COMBATIÓ *(el desbloqueo de M10)*

`key: 'mirage'` · *"El regalo del Perú - rápido, con poca autonomía"* ·
`assets/planes/mirage-5p/`

**Lo que fue.** Diez **Mirage 5P** que mandó el **Perú**. Salieron de La Joya (Arequipa),
hicieron escala nocturna en Jujuy y aterrizaron en **Tandil el 5 de junio de 1982**, a dos
mil kilómetros de las bases del sur. Los volaron pilotos peruanos, **con la escarapela
argentina ya pintada antes de despegar**, y los pilotos se volvieron a su país el mismo día
en un Hércules con librea de Aeroperú. **Nunca entraron en combate.** *(Verificado —
ver PREGUNTAS_HISTORICAS.)*

> ⚠️ **La confusión que hay que no repetir:** el 5P Mara es, precisamente, **el Mirage que
> NO peleó**. Los que volaron la guerra fueron el **Mirage IIIEA** (Grupo 8 de Caza, el
> interceptor) y el **IAI Dagger** — que es el Mirage 5 israelí y **ya está en este roster**.
> El par que queda es el mejor que podía quedar: **el Dagger es el Mirage 5 que peleó; el
> Mara es el Mirage 5 que llegó tarde.**

**Por qué ocupa el lugar del interceptor.** Porque es **el avión que la campaña regala**. La
placa de M10 ya está escrita en el guion y es la que justifica todo:

> **MIRAGE 5P «MARA» — DESBLOQUEADO**
> *Diez llegaron del Perú el 5 de junio de 1982. Nunca llegaron a combatir.*
> **Acá, sí.**
> Disponible en CICLO · ARENA · MINUTOS SAGRADOS · PASADAS MORTALES.

Ese es el trato honesto que usa el proyecto para todo el canasto rojo: **nombrar el hecho y
después ofrecer el juego.**

**Identidad mecánica: cambiás el reloj por los ojos.** Es el más rápido del roster y el que
menos dura en el aire. Pero lo que lo hace distinto de verdad no es la velocidad — es que
**tenía radar y el A-4 no.** Todo el juego está construido sobre esa carencia (Cóndor, la
señal que se corta, la ceguera de M10). El Mara debería ser **el único al que no se le corta
la señal**: ve venir lo que los demás no. A cambio: autonomía mínima (drenaje alto) y menos
carga contra blancos de superficie.

**Cómo se ve, y por qué.** En la escena de Tandil estos aviones acaban de aterrizar
*"prolijos, brillantes, sin una marca de uso"*. Esa es la instrucción de arte: **al lado de
los A-4 percudidos tienen que parecer nuevos.** El modelo 3D de `tools/bake_planes.html` ya
se cambió para eso — se le sacó el radomo de la trompa (el 5 es la variante de ataque: trompa
lisa y más afilada, la única diferencia de silueta que se lee a 84 px) y se le sacó el
camuflaje verde-marrón gastado de la FAA.

> ⚠️ **Color pendiente de verificar.** Hoy el modelo usa un gris claro limpio con dos bandas
> arena. El esquema real con el que llegaron los 5P peruanos **no está confirmado** — va a
> PREGUNTAS_HISTORICAS. Lo que sí es canon del guion y no se negocia: **limpios, sin desgaste,
> con la escarapela argentina fresca.**

## 5 · SUPER ÉTENDARD — 🟡 DE ÉPOCA (el que no juega al rasante)

`key: 'supere'` · *"Misiones especiales - misiles Exocet"*

**Lo que fue.** **Armada**, 2ª Escuadrilla Aeronaval de Caza y Ataque, desde Río Grande. Se
habían encargado catorce; llegaron **cinco** antes de que Francia cortara la entrega, y con
ellos **cinco misiles Exocet AM39**. Hundieron el **HMS Sheffield** (4 de mayo) y el
**Atlantic Conveyor** (25 de mayo). **No se perdió ninguno.**

**Dónde puede aparecer.** Modos sueltos, y **nunca como el avión de la campaña** — la razón
larga está en [AVIONES_ESCUADRON.md](AVIONES_ESCUADRON.md).

**Identidad mecánica: no es un avión, es un modo.** Meterlo en un run normal lo arruina: su
ataque es *acercarse en silencio, subir un segundo, disparar desde lejos y virar*. Eso no es
el PASILLO. Su descripción en `planes.js` ya dice la verdad —**"misiones especiales"**— y hay
que respetarla: si algún día se implementa, es **una misión propia** con su tensión propia
(la aproximación a ciegas, el segundo de radar que te delata, el misil que se va solo y ya no
podés hacer nada). El anticlímax es el punto.

> Ojo con el conteo: **cinco misiles.** Un modo Étendard con munición infinita miente sobre
> lo único que hacía angustiante esa operación.

---

## 6 · PAMPA 63 — 🔴 FUERA DE ÉPOCA · **comentado, no seleccionable**

`key: 'pampa'` · *(entrada comentada en `planes.js`; assets y modelo 3D intactos)*

**Lo que es.** El **FMA IA-63 Pampa**, entrenador avanzado biplaza de fabricación argentina.
Y acá está el problema: **voló por primera vez en octubre de 1984.** No existía durante la
guerra. Ni un prototipo.

**Estado actual: fuera de la selección.** La entrada está **comentada** en `data/planes.js`,
no borrada — los sprite sheets siguen horneándose y el modelo sigue vivo en
`tools/bake_planes.html`. Descomentar es una línea.

**Cómo vuelve.** Como **desbloqueable**, con su placa, igual que el Mara:

> **IA-63 PAMPA — DESBLOQUEADO**
> *Voló por primera vez en 1984, dos años después de la guerra.*
> *Nunca estuvo ahí.*
> **Acá, sí.**
> Disponible en CICLO · ARENA · MINUTOS SAGRADOS · PASADAS MORTALES.

Es la misma honestidad que ya usa el juego con el Mara, y por el mismo motivo: **el jugador
se merece el avión, y la historia se merece que no le mientan.**

**Identidad mecánica: el liviano.** Es el opuesto del Dagger. Lento, sin pegada, pero
**agilísimo y perdonador**: mucho carril lateral (`FLY_X`), gracia de roce alta
(`SCRAPE_BASE`), consumo bajo. Es el avión con el que alguien aprende a volar rasante —
que, siendo un entrenador, es exactamente lo que era.

---

## 🟩 Generar las ILUSTRACIONES del roster — pixel art Metal Slug

> **Por qué se rehacen.** Las previews actuales son cel-shading vectorial: línea negra gruesa
> y relleno plano. El resto del proyecto —las nueve hojas de personaje, las cinco de avión—
> está en **pixel art de Metal Slug**. El menú de selección es hoy la única pantalla que se ve
> de otro juego. Se rehacen las seis de una, con la misma referencia de estilo, o el problema
> vuelve más chico pero vuelve.

Un avión del roster necesita **tres piezas**, y solo una se genera con IA:

| Pieza | Qué es | Cómo se hace |
|---|---|---|
| `sheet.png` · `sheet2.png` | los sprites que VUELAN — 9 columnas de alabeo × 3 filas de cabeceo, cuadros de 84×84 | **se hornean**, no se generan: modelo low-poly en `tools/bake_planes.html` → `npx electron tools/bake_planes_run.js` |
| `preview.png` | la ilustración grande del menú de selección, ~977×471, fondo blanco | **acá sí va IA** |
| `source.png` | el arte fuente del que salió la preview | opcional |

> ⚠️ **El sheet no se genera con IA y no conviene intentarlo.** Son 27 cuadros que tienen que
> ser el MISMO avión girando de a 15°, con el pixel calzando exacto en una grilla. Ninguna IA
> mantiene esa coherencia; el modelo 3D sí, y ya está escrito. Para un avión nuevo se copia la
> función más parecida de `bake_planes.html` y se la retoca — es lo que se hizo con el Mara a
> partir del Mirage III.

### El truco: darle de comer el sprite que ya vuela

En vez de describir el avión con palabras y rezar, **se le da el cuadro central de su propia
hoja de sprites** — vuelo nivelado, sin alabeo, visto desde atrás. Eso resuelve tres cosas de
un saque: la **pose** exacta, la **silueta** exacta y el **esquema de pintura** exacto. Y
garantiza lo que hoy no está garantizado: que **la ilustración del menú y el avión que volás
sean el mismo avión.** *(El Mirage viejo era el caso: la preview mostraba un IIIEA y el sprite
era otra máquina.)*

Se extrae así — es el cuadro `col 4, fila 1` de `sheet.png`, escalado ×4 con vecino más
cercano para que no se borronee:

```js
// 84×84 por cuadro · col 4 = nivelado · fila 1 = sin cabeceo
ctx.imageSmoothingEnabled = false;
ctx.drawImage(sheet, 4 * 84, 1 * 84, 84, 84, 0, 0, 336, 336);
```

### Qué se le da de comer

| # | Imagen | Rol |
|---|---|---|
| 1 | 🟥 **un render del MODELO 3D en el ángulo nuevo** (o, si no, el cuadro central del sprite) | **POSE Y PINTURA** — y con el render 3D, además **LA FORMA**, que es lo que hoy falla |
| 2 | **un sprite de vehículo de Metal Slug** | **EL ESTILO.** El mismo archivo para los seis |
| 3 | **foto o vista de 3 caras del avión REAL** | **LA FORMA.** Una distinta por avión |

> 🟥 **La imagen 1 NO es referencia de forma, y decirle que sí fue un error caro.** A 84 px y
> de atrás, un A-4, un Dagger y un Étendard son el mismo borrón oscuro con alas. Cuando el
> prompt decía *"copiá esta forma, y si el texto la contradice gana la forma"*, el modelo se
> agarraba de ese borrón ambiguo y devolvía **el mismo avión seis veces**. La forma tiene que
> venir del TEXTO y de una foto real; el sprite solo aporta la pose y qué color va dónde.

> ⚠️ **Los seis se generan con la MISMA imagen 2.** Cambiar la referencia de estilo a mitad de
> camino da seis aviones que no parecen del mismo juego.

### 🟥 POR QUÉ SALEN TODOS IGUALES — el diagnóstico *(2026-08-22)*

**No es el texto. Es la POSE.**

El prompt pide el avión **visto desde atrás**. Y desde atrás **desaparecen casi todas las
diferencias que el propio prompt se pasa veinte líneas describiendo**:

| Lo que el prompt describe | ¿Se ve desde atrás? |
|---|---|
| La nariz (corta y roma / larga y puntiaguda / radomo bulboso / dos asientos) | ❌ **Tapada por el fuselaje.** Es el rasgo más distintivo de los seis y no se ve NINGUNO |
| La planta del ala (delta puro / delta corto / flecha / recta) | ⚠️ Escorzada — un delta grande y uno chico se parecen mucho |
| El perfil del fuselaje (gordo y corto / largo y esbelto) | ❌ Se ve de punta |
| La deriva | ❌ De canto |
| **Si tiene o no cola horizontal** | ✅ **Lo único que sobrevive** |

De todo el sistema de contraste, desde atrás **funciona una sola diferencia**. Por eso salen
todos iguales — y por eso el Pampa sí se distingue: es el único cuya diferencia (ala recta,
dos asientos, naranja) sobrevive parcialmente a ese ángulo.

**Y hay una segunda razón, que es real y no se arregla con prompts:** de los seis, **cuatro
son dos pares de primos de verdad**. El A-4B y el A-4Q **son la misma célula** (la diferencia
histórica es la pintura y el gancho). El Dagger **es** un Mirage 5. El set tiene **tres
siluetas reales, no seis.** Pedirle al generador que los separe por forma es pedirle que
invente una diferencia que no existe.

### El arreglo — tres cambios

**1 · CAMBIAR LA POSE a tres cuartos delantero, ligeramente desde arriba.** Es el cambio que
hace el 80% del trabajo: en ese ángulo se ven **al mismo tiempo** la nariz, la planta del ala
y la cola. Es además la pose clásica de pantalla de selección de arcade. *(Ya aplicada abajo.)*

**2 · ABRIR CADA BLOQUE CON EL TEST DE SILUETA** — una línea que describe **la mancha negra**,
no el avión. El generador se agarra de eso mucho mejor que de una lista de detalles.

**3 · A LOS DOS PARES, SEPARARLOS POR PINTURA Y CARGA, NO POR FORMA.** Es lo honesto y es lo
que pasaba de verdad: el A-4Q es el Skyhawk **claro y limpio** de la Armada contra el
**oscuro y sucio** de la Fuerza Aérea; el Mara es el delta **recién salido de fábrica, con
tanques**, contra el Dagger **camuflado y gastado**. Esa diferencia sí es visible y sí es
cierta.

> 🟩 **Y el arreglo definitivo, que además es gratis: ya tenés los modelos 3D.**
> `tools/bake_planes.html` hornea las hojas desde geometría. **Renderizá la preview desde el
> modelo, en el ángulo nuevo, y usá ESO como imagen 1.** Así la forma no la inventa el
> generador —la pone el modelo— y la IA queda haciendo solo lo que hace bien: estilo,
> textura, desgaste y paleta. Mismo criterio que las cinemáticas: **geometría → motor;
> materia → IA.**

### El prompt maestro

Se pega tal cual y se reemplaza **solo el bloque `[AVION]`**.

```
You are drawing ONE aircraft out of a set of six that must all look CLEARLY
DIFFERENT from each other when placed side by side. Getting the SILHOUETTE right
matters more than any other instruction here.

IMAGE 1 gives you TWO things and only two: the POSE, and the PAINT SCHEME - which
colour goes on which part. Copy those faithfully.
DO NOT use IMAGE 1 as a shape reference. It is a tiny low-resolution render in which
every aircraft looks the same. The shape comes from the written description below,
and the written description WINS over IMAGE 1 in any conflict about shape.

The pose, to be explicit: a FRONT THREE-QUARTER view from slightly ABOVE. The
aircraft is angled roughly 35 degrees away from the camera so that the viewer sees
AT THE SAME TIME: the full length and shape of the NOSE, the complete PLANFORM of
the wing from above, and the TAIL with its fin and with its horizontal tailplanes if
it has any. Nose pointing forward-left and slightly down. THIS EXACT ANGLE IS
MANDATORY: seen from behind, all six of these aircraft look identical and the
drawing is worthless.

IMAGE 2 is the ART STYLE REFERENCE, and you must copy its rendering technique while
completely ignoring its subject.

IMAGE 3, if provided, is a photograph of the real aircraft. Use it for the SHAPE
and for structural detail only - never for its pose, colours or background.

THE SHAPE - read this before drawing anything:
[AVION]

Draw it at high detail in that style: heavy panel lines, rivets, worn edges, vents
and hatches all drawn as deliberate pixel clusters, the way a Neo Geo artist would
draw a vehicle sprite at large size.

ON THE VERTICAL TAIL FIN, near the top: the ARGENTINE FLAG painted as three
horizontal bands - light blue, white, light blue - with the golden Sun of May
centred in the white band. This marking is IDENTICAL on every aircraft of the set
and must always be present. It is the only insignia they all share.

Plain flat WHITE background. No ground, no sky, no scenery, no shadow, no glow.

PERIOD LOCK - Argentina, 1982. Nothing modern may appear: no modern missiles or
guided weapons, no modern avionics or antennas, no NATO or United States
markings, no invented squadron patches, no digital camouflage.

ABSOLUTELY NO TEXT of any kind anywhere: no serial numbers, no letters, no
labels, no callouts, no arrows, no legend, no watermark, no signature. If you
feel the urge to label anything, leave it blank.

Wide landscape framing, roughly 2:1.
```

### Los seis bloques `[AVION]`

Cada uno **abre diciendo en qué se diferencia de los otros cinco**, y recién después describe.
Un modelo generativo separa muchísimo mejor por contraste explícito que por descripciones
independientes — pedirle seis veces "dibujá un caza argentino" con matices distintos devuelve
seis veces el mismo avión. Los hexadecimales salen de `tools/bake_planes.html`, así que la
ilustración y el sprite comparten paleta de verdad.

**A-4B SKYHAWK** — `a4-skyhawk/preview.webp`
```
SILHOUETTE TEST - filled in solid black, this must read as a SHORT FAT ARROWHEAD
with a stubby blunt tip and a small cross near the TOP of the tail. The smallest and
roundest shape of the set.

A Douglas A-4B Skyhawk. Against the other five, this is the SMALLEST, STUBBIEST
and ROUNDEST aircraft of the set - it should look almost toy-like next to the
deltas. Key silhouette points, in order of importance:
- A LOW-MOUNTED DELTA wing that is SHORT in span - the wingspan is barely wider
  than the aircraft is long. It does NOT reach back to the tail.
- It HAS horizontal tailplanes, mounted HIGH on the fin near the top - this high
  tail is the single most recognisable Skyhawk feature.
- A short, blunt, rounded nose. No radar radome, no long pointed spike.
- Two small air intakes on the sides of the fuselage right behind the cockpit.
- A fat, rounded fuselage. Stocky, not sleek.
Argentine Air Force camouflage: dark olive green (#4e5c38) and mid green (#59683f)
patches over brown (#7a5c33), with a pale blue-grey belly (#a6aeb3).
This is the WORKHORSE: worn paint, exhaust staining, oil streaks, scuffed edges.
One blue-and-white Argentine roundel on each wing. No personal markings.
```

**IAI DAGGER** — `iai-dagger/preview.webp`
```
SILHOUETTE TEST - filled in solid black, this must read as ONE LONG CLEAN TRIANGLE
with a needle sticking out the front and a single fin on top. NO cross near the
tail, nothing horizontal back there at all.

An IAI Dagger, the israeli Mirage 5. Against the other five, THE DEFINING
DIFFERENCE IS THAT IT HAS NO HORIZONTAL TAILPLANES AT ALL - the tail is a single
vertical fin and nothing else. If you draw horizontal tailplanes on this aircraft
the drawing is wrong. Key silhouette points:
- A HUGE pure triangular delta wing that runs almost all the way back to the tail,
  so wing and fuselage read as one continuous triangle.
- Much LONGER and SLEEKER than the Skyhawk, with a slim pointed nose.
- Air intakes are half-moon shaped openings set into the fuselage sides.
- A single tall swept fin, and nothing horizontal anywhere near it.
Argentine Air Force camouflage: green (#4e6136) and dark green (#3d4d2c) over sand
yellow (#c0ab5e), with a pale blue-grey belly (#93a3ae).
Two 30mm cannon ports low on the fuselage sides, larger than the Skyhawk's.
One blue-and-white Argentine roundel on each wing.
```

**SUPER ÉTENDARD** — `super-etendard/preview.webp`
```
SILHOUETTE TEST - filled in solid black, this must read as a SWEPT-WING DART with a
rounded blunt head and a clear cross LOW at the back. Two separate shapes back
there - fin above, tailplanes below - never one triangle.

A Dassault Super Étendard. Against the other five, this is the only one with BOTH
SWEPT WINGS AND HORIZONTAL TAILPLANES - it is NOT a delta and it is NOT a Skyhawk.
Key silhouette points:
- Wings SWEPT BACK at an angle, with straight leading and trailing edges and
  clearly visible wingtips. A normal swept wing, not a triangle.
- Horizontal tailplanes mounted LOW on the rear fuselage, well below the fin.
- A rounded bulbous NOSE RADOME - blunter and fatter than the Dagger's nose.
- A carrier aircraft: sturdy landing gear, an arrestor hook under the tail,
  and folding wingtips with visible hinge lines.
Argentine Navy scheme: dark blue-grey upper surfaces (#4d5b66 and #3e4b56) with
lighter grey (#7b8a94) and a near-white belly (#c3cad0). Clean and well kept.
A large anti-ship missile under one wing - a plain finned tube.
One blue-and-white Argentine roundel on each wing.
```

**A-4Q** — `a4q/preview.webp`
```
SILHOUETTE TEST - IDENTICAL to the A-4B: short fat arrowhead, stubby blunt tip,
small cross high on the tail. Do not change the shape by even a little. Everything
that separates this aircraft from the A-4B is PAINT and NAVAL GEAR.

An A-4Q, the NAVAL Skyhawk. This aircraft is DELIBERATELY the same airframe as the
A-4B - same small stubby body, same short low delta wing, same HIGH-MOUNTED
horizontal tailplanes near the top of the fin, same blunt nose. Do not redesign it.
What must be different is the PAINT and the naval gear:
- Light naval scheme: silver-grey upper surfaces (#b4bcc2 and #c2c9ce) with mid
  grey (#9aa4ab) and an almost white belly (#dfe3e6). Clean and bright.
- An arrestor hook under the tail and a catapult launch bar at the nose gear.
The contrast between this bright naval aircraft and the dark camouflaged Air Force
Skyhawk IS the point of this drawing.
One blue-and-white Argentine roundel on each wing.
```

**MIRAGE 5P «MARA»** — `mirage-5p/preview.png`
```
SILHOUETTE TEST - the SAME long clean triangle as the Dagger: needle nose, single
fin, no cross at the tail - PLUS two fat cylinders slung under the wings. The shape
is a cousin of the Dagger on purpose; what separates them is PAINT and those TANKS.

A Dassault Mirage 5P. Like the Dagger, it HAS NO HORIZONTAL TAILPLANES - a single
vertical fin and nothing else - and a huge pure triangular delta wing. Against the
Dagger specifically, two differences that must be visible:
- The nose is SLIMMER and more sharply pointed, with NO radar radome bulge at all
  (this is the ground-attack variant).
- Two large cylindrical drop tanks hanging under the wings.
PAINT IT AS A BRAND-NEW AIRCRAFT: clean light grey (#b9c0c4 and #8e979d) with two
soft sand-coloured bands (#c9bda2) and a pale belly (#d3d9dc). NO weathering, no
stains, no streaks, no chipped paint, no exhaust staining. It must look like it
came out of the factory this week, noticeably newer and cleaner than every other
aircraft in this set.
One blue-and-white Argentine roundel on each wing, freshly painted and crisp.
```

**PAMPA 63** — `pampa-63/preview.webp` *(entrada comentada; el asset se genera igual)*
```
SILHOUETTE TEST - filled in solid black, this must read as a PLAIN CROSS: a
straight bar of wing at right angles to the body, no sweep, no triangle anywhere.
The only non-pointy shape of the set.

An FMA IA-63 Pampa. Against the other five, this is the ONLY one with a STRAIGHT
WING and TWO SEATS, and the only one that is not a combat jet. Key silhouette
points:
- A STRAIGHT, UNSWEPT wing mounted HIGH on the shoulder of the fuselage. No sweep
  at all, no delta. This is the most important difference.
- A long canopy covering TWO seats one behind the other, with a visible step or
  frame between them.
- Conventional horizontal tailplanes low on the rear fuselage.
- Visibly SMALLER and lighter than every other aircraft here.
Trainer scheme: grey (#8e979e and #6d767d) with green (#55663d) and bands of
high-visibility ORANGE (#e07030) on the nose, wingtips and tail - the orange must
be clearly visible; it is what says "training aircraft".
One blue-and-white Argentine roundel on each wing.
```

> **Sin marcas personales.** La preview es el avión **genérico** del menú: el terito de Tero,
> las puntas rojas del Gitano y los parches del Pichón **no van acá**. Esas son marcas de
> escuadrilla y viven en [AVIONES_ESCUADRON.md](AVIONES_ESCUADRON.md).

> 🟥 **Si dos salen iguales igual**, el problema casi siempre es que se le está dando la misma
> imagen 3 (o ninguna). El texto solo alcanza para separar Skyhawk de delta; para separar
> **Dagger de Mirage 5P** —que son primos de verdad— hace falta la foto de cada uno.

### Correcciones — editar, no regenerar

```
Keep this image exactly as it is - same aircraft, same pose, same framing, same
colours, same background. Change only this one thing: [EL ARREGLO].
Do not redraw anything else.
```

| Sale mal | El arreglo |
|---|---|
| Quedó suave / vectorial, no pixel art | `redraw all shading as hard dithered pixel clusters with chunky dark outlines; remove every smooth gradient and every soft edge` |
| Lo puso de atrás, de perfil puro o de frente puro | `rotate the aircraft to a FRONT THREE-QUARTER view from slightly above, angled about 35 degrees from the camera, so that the nose shape, the full wing planform and the tail are all visible at once` |
| Le cambió los colores | `restore the exact paint scheme of the reference image - same colours on the same parts` |
| Le puso cola horizontal a un delta | `remove the horizontal tailplanes completely - a delta wing aircraft has none` |
| Le puso números o etiquetas | `remove every letter and number from the image and leave those areas blank` |
| Le inventó armas modernas | `remove all weapons and pylons; leave the wings clean` |
| Le puso fondo o sombra | `replace the background with flat pure white and remove all shadows and glows` |
| **La cabina sale recortada** | `zoom out so the entire cockpit fits inside the frame with a margin all around it - the whole canopy arch, both side rails and the whole panel must be fully visible and nothing may touch the edges` |
| **Los espejos flotan en el vidrio** | `move each mirror onto the nearest metal frame bar so that it overlaps and covers part of that bar - no mirror may sit in open glass with space around it` |
| **Le salieron manos o brazos de más** | `there must be exactly two hands and two arms in this image: one left hand on the throttle and one right hand on the stick. Delete every other hand and arm, and leave those controls untouched and empty` |

### Después de generar — hay una herramienta que hace todo

```bash
python3 -m venv .venv-art && ./.venv-art/bin/pip install numpy Pillow   # una sola vez
./.venv-art/bin/python tools/install_previews.py <carpeta-con-los-png>
```

La carpeta lleva un archivo por avión, nombrado con su **key** de `data/planes.js` —
`sky` · `dagger` · `supere` · `a4q` · `mirage` · `pampa`. Los que falten se saltean, así se
puede instalar de a uno. `--dry-run` informa sin escribir.

Por cada imagen hace tres cosas que **no se pueden saltear**:

1. **Le devuelve el pixel art de verdad** con `docs/produccion/pixelrefine.py` (grilla y
   paleta bloqueadas). Una IA no entrega pixel art: entrega algo que se le *parece*, con
   anti-aliasing en los bordes y degradés donde debería haber dithering.
2. **La lleva a 390 px de ancho.** No es arbitrario: la preview se dibuja a `PW = 130`
   unidades de diseño y `U × SC = 3` exacto, así que ocupa 130×3 = **390 px reales**. A ese
   tamaño el mapeo es 1:1. Con cualquier otro, el navegador reescala por un factor no entero
   y el pixel art se parte en escalones o se empasta.
3. **Le saca el fondo blanco** inundando desde los bordes, y deja el alfa DURO (0 o 255). Se
   inunda desde el marco en vez de borrar "todo lo blanco" porque el avión tiene blanco
   adentro —brillos, la escarapela, los rótulos de las bombas— y ese se queda.

Sale `.webp` de 10-13 KB (el build web tiene techo de 16 MB).

> ⚠️ **Dos cosas que se descubrieron construyendo esto, y que valen para cualquier arte
> nuevo del juego:**
>
> - **`drawMenu` no fijaba el suavizado** y heredaba el del dibujo anterior: el mismo menú se
>   veía distinto según de qué pantalla venías. Ya está corregido en `render/menus.js`, con
>   el ancho canónico documentado al lado.
> - **Las previews tienen alfa.** Se dibujan sobre el panel, así que un fondo opaco se ve
>   como un rectángulo. La primera versión de la herramienta las aplastaba a RGB y el fondo
>   salía negro.

Después: `npm run build:game` y **mirar las seis juntas, no de a una.** Es la única prueba
que importa: si una canta, es la pose o el grosor de la línea, y se corrige con un edit.

---

## 🟩 Las CABINAS — primera persona

> El estilo sale de [ESTILO_VISUAL.md](ESTILO_VISUAL.md) §1: se pega ese bloque al principio
> y no se reescribe. Acá va solo lo que cambia de una cabina a otra.

### El diagnóstico de la que hay hoy

Existe una sola cabina, `a4-skyhawk/cockpit.png` (1024×559), y la usa el clímax en riel de
`render/momentum.js`. Está bien dibujada, pero tiene un problema de **encuadre**, no de arte:

| | Hoy | Objetivo |
|---|---|---|
| Pantalla que deja ver el mundo | **32 %** | ~65 % |
| Alto libre en la columna del centro | **11 %** | ~55 % |

Once por ciento significa que, mirando al frente, el panel y el visor se comen casi todo. La
sensación que se busca —la de la foto del valle: ir bajísimo, el mundo enorme y la máquina
apenas enmarcándolo— **no depende de dibujar mejor, depende de bajar el panel.**

### Las cinco reglas técnicas *(valen para las seis)*

1. **984 × 564 px.** Es el tamaño 1:1: `render/momentum.js` la dibuja a `W+12 × H+12` y el
   buffer es `SC = 2`. Con otro tamaño, el reescalado no entero rompe el pixel art.
2. 🟩 **Fondo VERDE CROMA `#00FF00`, no transparente.** Los generadores no entregan alfa de
   verdad: pintan cielo. Un verde plano se recorta después, y de paso resuelve los espejos —
   son islas del mismo verde, así que salen huecos gratis. **El mameluco del piloto va verde
   OLIVA APAGADO**: si se acerca al croma, se recorta junto con el cielo.
3. 🟩 **Los espejos van ENCIMA de las barras.** Dos errores distintos, y los dos aparecieron:
   pedirle *"carcasa y soporte"* le hace dibujar **espejos de auto**, y sin decirle dónde se
   apoyan los deja **flotando en el vidrio**. Cada espejo tiene que **montarse sobre una barra
   del marco y taparla en parte** — uno arriba en el arco, uno en cada montante lateral. Placa
   plana, bisel angosto, sin brazo, sin soporte, sin aire debajo. El vidrio, plano y de frente:
   el juego pega ahí un rectángulo, y si el hueco está en diagonal la imagen entra torcida.
4. 🟩 **La cabina entera, sin recortes.** Tiene que entrar completa con margen: el arco de punta
   a punta, los dos rieles y el panel entero, sin que nada toque el borde. Si no entra, se
   dibuja **más chica** — no se recorta. El asset se compone sobre el mundo, así que un arco
   cortado por el borde se ve como un arco roto, no como un encuadre cerrado.
5. **Sin HUD, sin mira, sin números.** Todo eso lo dibuja el juego encima, y tiene que poder
   moverse. Un instrumento pintado en el PNG es un instrumento que no puede marcar nada.

### El prompt maestro

Se pega el bloque de estilo de [ESTILO_VISUAL.md](ESTILO_VISUAL.md) §1, después esto, y se
reemplaza **solo `[CABINA]`**.

```
First-person view from the pilot's seat of a 1982 jet fighter, looking straight
forward, as if the viewer's eyes were just behind the gunsight mount.

FIT THE WHOLE COCKPIT INSIDE THE IMAGE. Nothing may touch or cross any edge of
the frame: the complete canopy arch from one side rail to the other, both side
rails, the complete instrument panel and both side consoles must be FULLY VISIBLE,
with a margin of empty space all around them. Do not zoom in, do not crop, do not
let the arch run off the top or the sides. If it does not fit, draw it SMALLER.

FRAMING - this overrides everything except fitting the whole cockpit in:
the aircraft must frame the world, not block it. The instrument panel sits LOW,
occupying only the BOTTOM THIRD of the image. The canopy arch is a THIN band across
the very top. The canopy side rails are narrow strips at the far left and far right
edges. The whole central area of the image - roughly the middle two thirds, from
just above the panel to just below the canopy arch - is EMPTY and open. The feeling
is a low, fast aircraft where the pilot sees an enormous amount of world: cramped
metal at the edges, wide open space in the middle.

CHROMA GREEN BACKGROUND. Fill every area the pilot would see through - the whole
canopy opening, the windscreen, the gap above the instrument panel, and the inside
of each mirror - with ONE single flat solid PURE CHROMA GREEN, #00FF00. No sky, no
scenery, no clouds, no gradient, no shading, no reflections, no transparency: one
completely flat green. It gets keyed out afterwards, so the edge against it must be
hard and clean, never soft or feathered.

Nothing else in the image may use a bright saturated green. The pilot's flight suit
is DULL OLIVE DRAB, dark and desaturated - it must never come close to the chroma
green or it will be cut out with the sky.

Only the physical structure of the aircraft is drawn: canopy frame and arch, side
rails, instrument panel, side consoles, and the mirrors.

REAR-VIEW MIRRORS - read this twice, it is the detail that comes out wrong most
often. Three small flat rear-view mirrors, and every one of them sits ON TOP OF A
METAL BAR OF THE CANOPY FRAME, overlapping that bar and silhouetted against it:
one on the top centre of the arch, and one on each of the two forward frame bars
that run down to the sides. Each mirror OVERLAPS and covers part of the metal it
is mounted on, the way a mirror glued to a bar does.

NOT ONE OF THEM FLOATS IN THE GLASS. If a mirror is sitting in the middle of the
open canopy area with clear space all around it, it is wrong: move it onto the
nearest frame bar until it overlaps the metal.

Each one is a THIN FLAT PLATE sitting FLUSH against the bar with only a narrow
dark bezel around it - no depth, no gap, no shadow underneath.

THEY ARE NOT CAR MIRRORS. Do not give them stalks, arms, brackets, housings,
casings, mounting posts, or any gap at all between the mirror and the canopy frame.
Nothing hangs down from the arch and nothing floats in the air. If a mirror looks
like something you would find on an automobile, it is wrong and must be redrawn
flat against the frame.

The mirror glass itself is a FLAT, FRONT-FACING RECTANGLE - never angled, never
tilted in perspective, never oval, never rounded. Fill it with the same chroma
green as the background: a separate image gets composited into each of those
rectangles later, and it arrives crooked if the opening is not square to the frame.

THE PILOT'S BODY - COUNT BEFORE YOU DRAW. This is the single most common failure
in this image and it must not happen.

There are EXACTLY TWO arms and EXACTLY TWO hands in this picture. Not three. Not
four. Two.
- ONE left hand, resting on the throttle lever on the left console.
- ONE right hand, gripping the control stick between the knees.
- Both arms enter the frame from the BOTTOM EDGE and are cut off by it. No
  shoulders, no torso, no head, no helmet, no face: the viewer IS the pilot.
- EXACTLY TWO knees, in dull olive-drab flight suit, at the bottom corners, low and
  at the edges, never rising into the open central area.

EVERY OTHER lever, switch, knob, handle and control in this cockpit is UNTOUCHED:
no hand on it, no hand near it, no hand reaching towards it, no spare hand resting
anywhere. Mentioning a control below does NOT mean a hand is on it.

Before finishing, count the hands. If there are more than two, erase the extras.

NO instrument needles, NO digits, NO gauge readings, NO gunsight reticle, NO
warning lights lit. Draw the gauge faces, bezels and switches as empty housings
only - everything that moves or reads is drawn by the game on top.

[CABINA]

The metal is worn from use: scuffed paint at the edges, fingerprints and grime
around the switches, a machine that is flown every day and cleaned by nobody.
```

*(y al final el PERIOD LOCK y el bloque de NO TEXT de [ESTILO_VISUAL.md](ESTILO_VISUAL.md) §2)*

### 🟩 La salida de emergencia: cabina SIN manos

Si las manos siguen multiplicándose después de dos o tres intentos, **sacarlas es una opción
legítima y no se pierde casi nada.** Se le agrega esto al final del prompt:

```
NO PILOT BODY AT ALL. No hands, no arms, no gloves, no knees, no legs, no flight
suit anywhere in the image. The cockpit is completely empty: only metal, glass,
panel and mirrors. Every lever, switch and control is untouched.
```

**Qué se gana:** desaparece de un saque la parte que más se rompe — la anatomía al borde del
cuadro es donde estos modelos alucinan más, y cada corrección que se le pide encima tiende a
sumar un brazo en vez de sacarlo.

**Qué se pierde:** la sensación de estar adentro que traía la foto del valle. Es real, pero es
menos de lo que parece: la cabina es un overlay **fijo** sobre un mundo que se mueve, así que
unas manos quietas en una palanca quieta mientras el avión alabea 60° tampoco están vendiendo
tanto. Lo que da la sensación de cercanía es **cuánto mundo entra por arriba del panel**, y eso
ya está resuelto.

**Si se saca en una, se saca en las seis.** Un roster con cinco cabinas vacías y una con manos
se ve como un error, no como una variación.

### Los seis bloques `[CABINA]`

#### ⭐ A-4B SKYHAWK — la de la campaña, **hacer ésta primero**

Es la cabina que se ve en trece de las catorce misiones. Todas las demás son opcionales;
ésta no.

```
This is a Douglas A-4B Skyhawk cockpit, and it is SMALL - the A-4 is a tiny
aircraft and the canopy frame sits close around the pilot. Late 1950s American
naval design, all analog.

The panel: a flat dark grey-black metal panel with round analog dial housings
arranged in rows, small toggle switches in labelled rows below them, and circuit
breaker panels. A simple optical gunsight mounted on a bracket at the top centre of
the panel - a small angled glass plate on a dark metal arm - low enough that it does
not block the view.

Left console: throttle lever with a black grip, trim and flap levers, fuel controls.
Right console: radio and electrical panels with small round knobs.
Between the pilot's legs: a plain control stick with a grey grip and a black trigger.
Below the panel, a bright YELLOW AND BLACK STRIPED ejection handle - the single
strongest colour accent in the whole image, everything else is grey, black and olive.

Bare metal showing through chipped grey paint on the canopy rails, exactly where a
pilot's elbows have rubbed for twenty years.
```

#### A-4Q — la naval

```
Identical cockpit to the A-4B Skyhawk in every respect - same small canopy, same
analog panel, same gunsight, same yellow and black ejection handle - with two naval
additions: an arrestor hook lever on the left console, and a catapult launch bar
grip. Slightly cleaner and better maintained than the Air Force aircraft.
```

#### IAI DAGGER — la francesa

```
This is an IAI Dagger cockpit - the israeli Mirage 5 derivative, so the layout is
FRENCH, not American, and must read differently from the Skyhawk at a glance: the
panel is wider and more angular, painted a dark grey-green rather than black, the
dial housings are larger and more widely spaced, and the switch guards are chunky
rectangular metal covers rather than small toggles.
A heavier control stick with a wide grip and multiple buttons on the head.
The canopy is roomier than the Skyhawk's and the rails sit further out at the edges.
```

#### MIRAGE 5P «MARA» — la nueva

```
Identical layout to the Dagger cockpit - same french panel, same angular grey-green
metal, same heavy stick - but this aircraft is BRAND NEW and must look it: no
scuffs, no chipped paint, no grime around the switches, no wear on the rails. The
paint is even and the metal is clean. It is the only cockpit in this set that has
not been flown to death.
```

#### SUPER ÉTENDARD — la única con radar

```
This is a Dassault Super Étendard cockpit, and it is the MOST MODERN of the set -
that contrast is the point. Its distinguishing feature, which no other aircraft here
has, is a large ROUND RADAR SCOPE housing set into the centre of the instrument
panel, a deep dark circular hood the pilot looks down into.
The panel is more organised and less improvised than the others: neat rectangular
sub-panels, a row of guarded weapon-release switches under a hinged cover on the
right console.
Naval details: a folding-wing selector and a catapult grip on the left console.
```

#### PAMPA 63 — la de dos plazas

```
This is an FMA IA-63 Pampa cockpit, seen from the FRONT seat of a two-seat trainer.
The canopy is long and roomy - by far the most open of the set - and a second
windscreen and headrest are visible behind the pilot when the frame allows.
The panel is simpler and less crowded than the fighters: fewer dials, more open grey
metal, and a training-aircraft feel rather than a combat one.
```

### Cómo se instala una cabina

```bash
./.venv-art/bin/python tools/install_cockpit.py <archivo.png> <slug>
```

Recorta el verde croma (**en todas partes**, así los espejos salen huecos sin trabajo extra),
deja el alfa duro, lleva la imagen a 984 × 564 y la guarda en
`assets/planes/<slug>/cockpit.png`. `--dry-run` informa sin escribir; `--verde <hex>` por si el
generador entrega otro tono.

### El orden, y cuándo parar

1. **A-4B Skyhawk** — es la campaña entera. Si solo se hace una, es ésta.
2. **A-4Q** — sale casi gratis: es un edit del A-4B con dos palancas más.
3. **Mirage 5P** — el desbloqueo de M10.
4. **Dagger** · 5. **Super Étendard** · 6. **Pampa** — cuando haya tiempo.

> **Antes de encargar la 2, mirar la 1 adentro del juego.** El encuadre es lo único que
> importa acá, y no se juzga en la imagen suelta: se juzga volando bajo, viendo cuánto mar
> entra por arriba del panel.

### La deuda que esto abre

Los espejos **no existen en el código todavía** — no hay ni mecánica ni render de vista
trasera. Los huecos se dibujan igual, porque un espejo agregado después obliga a rehacer la
cabina entera; un hueco esperando no molesta a nadie. Cuando se implemente hará falta anotar
las coordenadas de los tres rectángulos en `data/planes.js`, al lado de la ruta del asset.

## Lo que este catálogo destapó

Tres cosas que no estaban anotadas en ningún lado:

1. ✅ **RESUELTO — el Pampa 63 es de 1984** y estaba jugable sin ninguna aclaración. Quedó
   **comentado** en `planes.js` hasta que exista el sistema de desbloqueos.
2. ✅ **RESUELTO — el Mirage del roster ahora es el del guion.** Cargaba un **Mirage IIIEA**
   mientras la placa de M10 desbloqueaba un **Mirage 5P «Mara»**: dos aviones distintos, de
   distinto grupo y distinto rol. Se unificó en el 5P Mara (`assets/planes/mirage-5p/`,
   modelo 3D ajustado, sheets re-horneados). **Falta la ilustración del menú** — el prompt
   está abajo.
3. **Ninguna de estas diferencias existe en el código todavía.** Las descripciones de
   `planes.js` son cosméticas (ROADMAP #10). Este documento es la fuente de datos para
   cuando se implementen: cada avión tiene arriba su eje y la perilla que hay que mover.

## Los que faltan y ya están pedidos

En el ROADMAP, sin cargar todavía:

- **IA-58 Pucará** (#10.1) — turbohélice, operaba desde las islas mismas, pistas blandas.
  🟡 de época. El opuesto de perfil a todo el roster actual.
- **Aermacchi MB-339** (#10.2) — jet liviano de la Aviación Naval; el ataque en solitario del
  Teniente Owen Crippa a la HMS Argonaut. 🟡 de época.

## ⚠ Para verificar antes de fijar nada de esto

Todo lo histórico de arriba va contra
[PREGUNTAS_HISTORICAS.md](PREGUNTAS_HISTORICAS.md) antes de convertirse en texto en pantalla:

- Loadout típico del A-4B por Grupo *(ya anotado ahí)*.
- Unidad exacta y fechas del A-4Q en el hundimiento del Ardent.
- Que el Dagger efectivamente no tenía sonda de reabastecimiento *(es el eje entero de su
  identidad mecánica: si es falso, hay que rediseñarlo)*.
- Fecha exacta del primer vuelo del IA-63 Pampa.
- Cantidad de Super Étendard y de Exocet entregados antes del embargo.
