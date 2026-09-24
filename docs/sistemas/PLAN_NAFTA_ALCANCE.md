# PLAN — LA NAFTA COMO ALCANCE *(altura, carga, radar y la Chancha, en km)*

> **Estado:** 📝 propuesta, con las decisiones del autor del 23/9/2026 incorporadas (§6) · pedido del autor: *"analizar una propuesta
> nueva de mecánica de gasto de combustible y recarga con distancia límite de alcance de radar.
> El mismo no puede arrancar apenas arranca el juego y despegan"*, más *"el turbo debería gastar
> combustible proporcional a la velocidad que otorga"*.
>
> **Hermanos que esto ordena (no reemplaza):** `PLAN_CARGA_Y_CHANCHA.md` (la regla de la carga,
> aprobada 18/9), `PLAN_MISION_CINCO_FASES.md` §3 (la tabla de multiplicadores) y §11 (el filo),
> `SPEC_PODER_CHANCHA.md` (la cita). `PROMPT_COMBUSTIBLE.md` (bidones como ruta óptima) queda
> **superado** para la campaña: acá la nafta no se junta, se administra.
>
> **Regla suprema, la de siempre:** una misión **sin `ruta:`** se comporta byte a byte como hoy.
> `npm run feel` idéntico. Todo lo nuevo cuelga de ese campo.

---

## 1 · Lo que el autor trajo, dicho como regla de juego

| dato (provisorio, va a `PREGUNTAS_HISTORICAS.md`) | regla |
|---|---|
| Sin tanques: **1.600–1.860 km** de alcance | tanque interno = **1.700 km** de crucero alto |
| Cada tanque: **+450 km** | `tanquesDe(carga) × 450` km más de tanque |
| Configs reales: **3 bombas** · **1 bomba sola** · **1 bomba + 2 tanques** | ya están en `data/cargas.js` (`tres_bombas`, `bomba`, `tanques_bomba`) |
| Al ras del mar se gasta **×2 a ×3** que en crucero | el consumo depende de la **altura real** del avión |
| Crucero alto (35.000 ft) = consumo mínimo | arriba y fuera de radar es el régimen barato |
| Descenso a **~180–150 km** del blanco, nivelado a **~120 km** | el radar **no existe** hasta ~180 km del blanco |
| Últimos **50 km** a potencia máxima | la aceleración final es una zona, y cuesta |
| Chancha IDA a **370–450 km** del blanco, alto, fuera de radar | zona de cita en la ida |
| Chancha VUELTA a **350–400 km** del blanco | zona de cita en la vuelta |
| Al subir en la vuelta **sí podían aparecer en radar** | subir temprano en la vuelta te pinta |
| Emisión cero: la cita era **visual**, sin radio | la Chancha **no se pide**: está en su zona, hay que encontrarla |

La frase que resume la mecánica: **"volar alto hasta que haga falta bajar, bajar lo más tarde
posible, y subir lo antes posible"** — la misma decisión de altura tres veces por misión, que es
exactamente lo que `PLAN_MISION_CINCO_FASES` §3 ya había dicho que era el juego.

---

## 2 · Qué hay hoy (relevado 23/9) y por qué no alcanza

| pieza | hoy | problema |
|---|---|---|
| **Consumo** | `FUEL_RATE 3.2 %/s × nafta(fase) + FUEL_BOOST 4.2` · `flight.js:294` | se gasta por **segundo**, no por km; depende del **tipo de fase**, no de a qué altura volás. Si en un tramo `transito` volás pegado al agua, pagás crucero |
| **Turbo** | +4.2 %/s fijo, da ×1.5 de velocidad (`physics.js:80`) | cuesta igual dé lo que dé la velocidad (tampoco mira el `afterTier`) |
| **Carga** | `cfg.carga` se dibuja y arma la bomba central | `tanquesDe`/`bombasDe` **no los llama nadie**: la carga no cambia ni el tanque ni el consumo |
| **Radar** | `alt > techoRadar()` desde el despegue · `flight.js:539` | **no hay distancia**: el radar existe desde el metro cero. Es justo lo que el autor dice que no puede pasar |
| **Altura** | el mundo entero vive entre 0 y `FLY_TOP 68` | no hay "crucero alto"; `transito` no tiene comportamiento de altura |
| **Distancia** | HUD muestra `run.dist/1000` como km (2–3,6 "km" por misión) | no hay km reales; además el velocímetro usa `KMH_U 4.2`, inconsistente con la distancia |
| **Chancha** | poder con barra de puntos + tecla 5 + `CH_MIN_T 240 s` | en la ida no tenés puntos (no hay enemigos): la barra nunca se llena donde más hace falta. Pedirla por radio rompe la emisión cero |
| **Escala** | `cfg.fuelScale` a mano (M1 0.4, t15 0.065) | parche por misión: el tanque está calibrado contra 31 s de vuelo |
| **Nafta en campaña** | solo M1 tiene `fuelOn` | el resto de la campaña vuela con tanque infinito |

Lo que **sí** sirve tal cual: el motor de **fases** (ida/vuelta con `hasta > 1`, zonas
`chancha: true`, `radar:` por fase, `pinta:`), la cita de la Chancha (`CH_ALT 48`, caja, tasa),
las estrellas de búsqueda, la regla de la carga y sus capas horneadas, y `t15`, que ya tiene la
forma completa con Chancha en la ida y en la vuelta.

---

## 3 · El modelo propuesto

### 3.1 · La unidad: el tanque se mide en **km de crucero**

`run.fuel` sigue siendo 0–100 % (no se rompe nada que lo lea), pero la misión con `ruta` lo
interpreta contra una **capacidad en km**:

```
capacidadKm = TANQUE_INTERNO_KM (1700) + tanquesDe(carga) × TANQUE_EXTRA_KM (450)
```

| carga | capacidad | lectura |
|---|---|---|
| `tanques_bomba` (2 tanques + 1 bomba) | **2.600 km** | ida y vuelta sin Chancha, una sola bomba |
| `bomba` (1 bomba, sin tanques) | **1.700 km** | liviano y rápido, pero justo |
| `tres_bombas` | **1.700 km** y más pesado | **no vuelve sin Chancha** |

El HUD pasa a decir **ALCANCE 820 km** además del porcentaje: es un número que el jugador
entiende sin explicación, y convierte cada decisión de altura en km ganados o perdidos.

### 3.2 · El gasto: por **km recorrido**, no por segundo

```
kmGastados = kmRecorridos × fAltura(y) × fCarga × fVelocidad
```

- **`fAltura(y)`** — la perilla del jugador. **Tres zonas escalonadas** (decisión del autor,
  23/9 — ver §3.6), no una curva: **MAYOR GASTO** abajo `×3`, **GASTO MEDIO** en el medio `×1.8`,
  **GASTO MENOR** arriba de todo `×1`. Es **la altura real del avión**, no la fase: si en el
  tránsito te tirás al agua, pagás rasante; si en el rasante te subís, pagás menos pero te ven.
- **`fCarga`** — el ropero, lineal por pieza: **`×0.85` sin nada colgando** (lo que la fase
  `vuelta` ya hacía, ahora con causa física) y **+0.1 por cada bomba o tanque**. Tres bombas y dos
  tanques + bomba dan `×1.15`, una bomba sola `×0.95`. Soltar cualquier cosa (§3.7) lo baja en el acto.
- **`fVelocidad`** — **el turbo proporcional, pedido del autor, en TODAS las misiones** (§6.6). `(v / vSinTurbo)²`, donde
  `vSinTurbo` es `speedTarget(...)` con `boost:false`. La resistencia crece con el cuadrado de la
  velocidad: el turbo ×1.5 cuesta **×2.25 por km**, y como además recorrés más km por segundo,
  **×3.4 por segundo**. Con el `after` apilado cuesta más, porque da más. **Desaparece
  `FUEL_BOOST`** como constante: el costo sale de la velocidad que el turbo da.
  - ⚠ Deliberado: la velocidad **natural** (la que sube sola con el tiempo y la racha) **no** se
    cobra — solo lo que el turbo suma encima. Cobrarla castigaría la racha rasante, que es premio.

Los últimos 50 km a potencia máxima caen solos: si usás turbo ahí, pagás ×2.25 × ×3 del rasante.
Es caro y es la decisión correcta — la que tomaban.

### 3.3 · La escala: km reales ↔ metros de pasillo

Una misión real es **600–800 km de ida**; un pasillo jugable son pocos minutos. La misión declara
su ruta en km reales y el juego la proyecta sobre las fases:

```js
ruta: {
  blancoKm: 700,          // de la base al blanco
  radarKm: 180,           // desde aca el radar existe (el horizonte)
  niveladoKm: 120,        // desde aca el pasillo es el rasante pleno
  potenciaKm: 50,         // la corrida final
  chanchaIda: [450, 370], // km AL BLANCO donde orbita el Hercules en la ida
  chanchaVuelta: [350, 400], // km DESDE el blanco en la vuelta
}
```

**La compresión es por tramo, no pareja.** El crucero alto (sin nada que hacer más que la cita)
se vuela comprimido — cada metro de pasillo vale muchos km — y el tramo bajo radar se vuela
casi en escala. Así los 500 km aburridos duran lo que tienen que durar y los 120 del rasante son
la misión. Las fronteras de fase (`hasta`) **se derivan de la ruta**, no se escriben a mano: una
misión con `ruta` no escribe fracciones.

De paso se unifica la cuenta del HUD: distancia y velocidad en la misma unidad.

### 3.4 · El radar tiene alcance (el pedido central)

```
radarActivo = kmAlBlanco ≤ ruta.radarKm   (en la ida)
            || kmDesdeBlanco ≤ ruta.radarKm (en la vuelta)
```

- **Fuera de alcance, el techo de radar no existe.** Podés volar a `FLY_TOP` sin que suba
  `run.detection`, la red de radar no se dibuja, y el HUD dice **FUERA DE RADAR**. Es la
  garantía de que el radar no arranca en el despegue.
- **Al cruzar `radarKm` la red aparece a lo lejos** y el techo cae con rampa (el mecanismo de
  `FILO_RAMPA_M` que ya existe) hasta `RADAR_ALT`: tenés que estar abajo antes de que te alcance.
  Llegar alto a esa línea = te pintan (estrellas / `pinta`).
- **En la vuelta, el radar sigue vivo hasta `radarKm` pasado el blanco.** Subir antes es ahorrar
  nafta **y** aparecer en pantalla: ahí nacen los Harrier de la cola. Aguantar abajo es gastar ×3
  pero llegar escondido. Es el dilema histórico del texto, entero.
- Entre `radarKm` y `niveladoKm` va la fase `descenso` (diagonal, `fAltura` intermedio) y el filo
  puede estrangular el techo como hoy.

### 3.5 · La Chancha: en la IDA se la encuentra, en la VUELTA se la gana

**Decisión del autor (23/9):** a la vuelta tiene que haber formas de recuperar nafta con la
Chancha **jugando** — matando con el cañón, esquivando, sosteniendo el rasante — aunque el rasante
gaste más. Eso parte la Chancha en dos, y cada mitad tiene su motivo:

**IDA — emisión cero, zona fija.**
- **Está en su zona** (`chanchaIda`), orbitando alto, en silencio. No se pide: **se la
  encuentra** — asoma a lo lejos al entrar a la zona. Resuelve la duda abierta de
  `PLAN_CARGA_Y_CHANCHA` ("cómo se pide en la ida sin romper el silencio de radio").
- Sin barra, sin `CH_MIN_T`, sin tecla. Fuera de radar por construcción (370–450 km > 180).
- **Si te pasás de la zona, te la perdiste.**

**VUELTA — ya te vieron: la radio se abre y la barra de puntos vuelve.**
- Es el poder de hoy (barra que se llena con puntos, tecla 5), con un cambio que sale de la
  historia: **la barra no decide SI viene, decide HASTA DÓNDE se acerca.** La zona segura está a
  350–400 km; con la barra llena la Chancha **rompe el protocolo y baja a buscarte** más cerca del
  blanco — lo que hicieron de verdad las tripulaciones que se metieron en zona de peligro para
  arrastrar A-4 perforados. Barra vacía = te espera en la zona segura, y llegás o no llegás.
- Así el que viene corto tiene una salida **jugando**: cañón, near-miss, racha rasante.

**¿Farmear rasante tiene que rendir más de lo que cuesta?** Sí, con una condición. El rasante
gasta ×3 *ahora*, y los puntos se cobran *después*, en la cita. Regla de calibración:

> **un km de racha rasante (x10 o más) tiene que llenar barra por ~1,5–2 veces la nafta extra que
> quemó** — pero esa nafta solo vuelve si llegás a la Chancha. Es una apuesta, no una canilla.

Topes para que no sea infinito: la barra tiene techo (una sola llamada por vuelta), el acercamiento
tiene un máximo (no entra a radar pleno), y el tanque no pasa de su capacidad. Farmear sirve para
**traer a la Chancha más cerca**, no para volar para siempre.

- `chancha: false` (M7 en adelante, la rotura del guion) sigue mandando en las dos mitades: el
  briefing de M10 *"la Chancha no baja más al sur"* se cobra sola.
- La cita en sí (`CH_ALT`, caja, `CH_RATE`, deriva) **no se toca**.

### 3.6 · El crucero alto — tres zonas de gasto, siempre a gas

**Decisiones del autor (23/9):** el crucero **se comprime** (los 500 km altos duran poco en
pantalla) y **no hay trim**: el vuelo a gas no cambia — para estar arriba hay que sostener ARRIBA,
siempre. Lo que se agrega es **leer** dónde conviene estar.

**Las tres zonas** (fronteras provisorias en `tuning.js`, alineadas con lo que ya existe):

| zona | altura de mundo | gasto | qué coincide |
|---|---|---|---|
| **GASTO MENOR** — arriba de todo | `CRUCERO_Y 48` → `FLY_TOP 68` | `×1` | la altura de la cita con la Chancha (`CH_ALT 48`) |
| **GASTO MEDIO** — en el medio | `RADAR_ALT 20` → `48` | `×1.8` | el descenso y la subida |
| **MAYOR GASTO** — bien abajo | `0` → `RADAR_ALT 20` | `×3` | debajo del radar: esconderse es caro |

La frontera de abajo es el techo de radar **a propósito**: la zona donde no te ven es la zona que
más quema. Una sola línea en el altímetro dice las dos cosas.

**Cómo se marca:**
- **En el altímetro del HUD**, tres franjas de color al costado de la escala (acento ámbar
  `#e8a33d` para el mayor gasto, neutro para el medio, frío para el menor), con la aguja pasando
  por encima. El nombre de la zona actual al lado: `GASTO MENOR` / `GASTO MEDIO` / `MAYOR GASTO`.
- **En el indicador de nafta**, la misma franja de color que la zona en la que estás, y la
  flecha de consumo que se acelera al bajar — el jugador ve el tanque bajar más rápido sin leer
  números.
- **Al cruzar una frontera**, un tic corto (sin assets nuevos; el sonido sigue bloqueado).
- El altímetro, fuera de radar y en GASTO MENOR, muestra **nivel de vuelo** (`FL350`): el mundo
  sigue siendo de 68 m, pero el número dice lo que el avión está haciendo.

`FLY_TOP` sigue siendo el techo duro: por encima de la zona menor no se puede ir, así que "el
límite recomendado" es el techo mismo, y quedarse ahí cuesta sostener ARRIBA.

### 3.7 · Soltar la carga — y los tanques como arma

**Decisión del autor (23/9):** los tanques se sueltan, llenos o vacíos, y **pegan**.

**Cómo se gasta la nafta con tanques.** Se consume **primero lo de los tanques externos** (como
hacían los pilotos) y después el interno. Cada tanque lleva su propia cuenta:
`run.tanques = [{ km }, { km }]` + `run.interno`. El HUD muestra el total; el avión dibuja los
tanques que siguen colgados.

**Soltar** (tecla propia, o la del arma con el selector en TANQUES):
- Los tanques de ala salen **de a par**, como las bombas de ala. El del centro, solo.
- Soltar **quita el arrastre** (`fCarga` baja) y el avión va **más rápido** — la regla de
  `PLAN_CARGA_Y_CHANCHA` "sin bombas, el avión va más rápido", ahora para todo lo que cuelga.
- Soltar un tanque **lleno** tira la nafta que tenía adentro. Es la decisión de emergencia:
  agilidad ahora contra alcance después.
- Soltar **bombas** sin blanco también alivia (menos peso, `fCarga` baja): es la última carta para
  estirar la nafta en la vuelta — llegás a casa sin haber cumplido.

**Los tanques como proyectil.** Misma mecánica que la bomba de LA SUELTA (sale disparada, planea,
cae — `systems/blanco.js` + `collision.js`, trabajo de la otra sesión), con otro dibujo:

| lo que cae | daño | explota | derriba |
|---|---|---|---|
| **bomba** | letal | sí | todo; el buque es la bomba |
| **tanque lleno** | grave | **sí, si pega en un buque o algo explosivo** (depósito, camión AA, barcaza) | avión, helicóptero, blancos de tierra |
| **tanque vacío** | medio | no | avión o helicóptero con **uno** |
| **par de tanques vacíos juntos** | = un tanque lleno, sin explosión | no | un **buque** con los **dos** |

"Lleno" y "vacío" salen de la cuenta de cada tanque (umbral en `tuning.js`, provisorio: lleno si
le queda más de la mitad). Así la decisión tiene tres filos: **cuándo soltarlos** (tarde = más
nafta usada, más arrastre cargado), **cómo** (llenos pegan fuerte y cuestan alcance) y **contra
qué** (un helicóptero en la vuelta, o el buque si la bomba no despertó).

### 3.8 · Sin nafta, perdés — pero antes el juego te da cartas

**Decisión del autor (23/9):** quedarse en cero es **misión perdida** (muerte con causa propia,
`death_fuel` en el pasillo, con su ficha). Antes de llegar ahí el jugador tiene que ver venir el
problema y tener opciones:

1. **Aviso de bingo**: el HUD marca cuándo la nafta que queda es la justa para volver a casa (o a
   la Chancha) volando alto. Cruzarlo es el momento de decidir, no de enterarse.
2. **Subir antes** (más barato, te pintan).
3. **Soltar tanques vacíos o bombas** (menos arrastre, estirás km).
4. **Farmear barra** en la vuelta para que la Chancha baje a buscarte (§3.5).

---

## 4 · El perfil de una misión, con los números

> **Medido en N0 (23/9)** — la tabla de abajo es la cuenta a mano de la propuesta. La cuenta REAL
> sale de `core/nafta.js` y la imprime `npm run feel` (perfil en `tools/nafta_perfil.js`):
>
> | carga | turbo | suelta tanques en el radar | llega al blanco | vuelve a casa |
> |---|---|---|---|---|
> | `tanques_bomba` | no | no | 1.464 | **426** |
> | `tanques_bomba` | sí | no | 1.248 | **211** |
> | `tanques_bomba` | sí | sí | 1.077 | **237** |
> | `tres_bombas` | no | — | 564 | **−276** (Chancha) |
> | `tres_bombas` | sí | — | 348 | **−492** (Chancha) |
> | `bomba` | no | — | 761 | **−78** (Chancha) |
>
> Diferencias con la cuenta a mano: el arrastre quedó **lineal por pieza** (limpio ×0.85, +0.1 por
> bomba o tanque: tres bombas y dos tanques + bomba dan ×1.15, una bomba ×0.95), y en la vuelta los
> tanques que siguen colgados **siguen pesando**. De ahí sale una decisión que la tabla a mano no
> tenía: **soltarlos en el radar tira la nafta que les quedaba (se llega con menos) pero la vuelta
> sale más barata** — conviene soltarlos cuando se vaciaron, que es lo que hacían.

Misión tipo, blanco a **700 km**, `tanques_bomba` (2.600 km), vuelo "de manual":

| tramo | km reales | régimen | factor | km gastados | queda |
|---|---|---|---|---|---|
| crucero alto (Chancha IDA disponible 450→370) | 700 → 180 | alto, cargado | 1 × 1.1 | 572 | 2.028 |
| descenso diagonal | 180 → 120 | medio | 1.8 × 1.1 | 119 | 1.909 |
| rasante | 120 → 50 | ras | 3 × 1.1 | 231 | 1.678 |
| potencia final (con turbo) | 50 → 0 | ras + turbo | 3 × 1.1 × 2.25 | 371 | 1.307 |
| **blanco** — sueltan la bomba (y los tanques, si se decide) | | | | | |
| escape rasante | 0 → 120 | ras, liviano | 3 × 0.85 | 306 | 1.001 |
| subida | 120 → 180 | medio | 1.8 × 0.85 | 92 | 909 |
| crucero a casa (Chancha VUELTA 350→400) | 180 → 700 | alto | 1 × 0.85 | 442 | **467** |

La vuelta entera cuesta **840 km**. Con las otras cargas (medido con la misma cuenta):

| carga | llega al blanco con | ¿vuelve sola? |
|---|---|---|
| `tanques_bomba`, sin turbo | 1.513 | sí, sobran 673 |
| `tres_bombas` | 348 | **no** (faltan 492) |
| `tres_bombas` + Chancha IDA (llena a 400 km) | 693 | **no**: llega a la zona de la vuelta con ~130 y ahí se llena |
| `bomba` sola, sin turbo | 712 | **no** a 700 km: sirve para blancos más cercanos |

O sea: **tres bombas = dos citas con la Chancha, sí o sí.** Tanques = autonomía y una bomba.
**Los números reales, sin tunear, ya producen el trueque de `PLAN_CARGA_Y_CHANCHA`** — esa es la
señal de que el modelo es el bueno. (Los factores exactos se calibran en N8; la forma del trueque
es lo que importa.)

Y las tres formas de perderlo: **bajar temprano** (×3 durante km de más), **subir tarde** en la
vuelta (lo mismo), **turbo largo** (×2.25 sobre ×3).

---

## 5 · Fases de implementación

Cada una deja el juego jugable; tras cada una `npm run check` y `npm run feel` idénticos.

- ✅ **N0 — el cálculo puro** *(hecho 23/9: `core/nafta.js`, constantes en `tuning.js` bajo "LA NAFTA COMO ALCANCE", 8 tests `nafta:` en `unit.js`, reporte en `feel`)*. `core/nafta.js`: `capacidadKm(carga)`, `fAltura(y)`, `fCarga(...)`,
  `fVelocidad(v, vSinTurbo)`, `gastoKm(...)`. Constantes a `data/tuning.js`. Unit tests (el turbo
  ×1.5 cuesta ×2.25/km; una misión sin `ruta` y **sin turbo** da exactamente el gasto de hoy; con turbo, el extra sale de `((v/vSinTurbo)³ − 1)`). Reporte en
  `tools/feeltest.js` con la tabla del §4 para las tres cargas. **Cero cambio visible.**
- ✅ **N1 — la ruta y los km** *(hecho 23/9)*. `core/ruta.js` (validador, anclas, `posKm`,
  `kmPorMetro`) + `systems/ruta.js` (el estado de la corrida, armado en `setRunObjective` al lado de
  las fases). La barra de objetivo cuenta km reales —número y marcador— en la ida («611 / 700 km»)
  y en la vuelta («A CASA 350 / 700 km»). t15 declara la ruta. 5 tests `ruta:` en `unit.js`,
  incluida la validación de toda misión que la declare. Verificado en el juego con capturas.
  **Divergencias con lo escrito arriba:**
  1. **Las fases no se derivan de la ruta: la ruta se ANCLA a las fases** (el descenso es el
     horizonte de radar, el primer rasante el nivelado, el blanco la potencia final, el último
     `hasta` de la vuelta es casa). Las fases ya son la dramaturgia de cada misión, con sus radios y
     pausas; regenerarlas desde km las pisaría. Entre anclas, lineal: eso ES la compresión por tramo.
  2. **Las zonas de la Chancha no son anclas**, son dato en km: su borde no tiene por qué caer en
     un borde de fase. En t15 hoy **no coinciden** (la fase `chancha` de la ida cae a 375–180 km;
     la ruta la pide a 450–370). Se unifica en N4, cuando la Chancha lea la ruta.
  3. **El velocímetro no se tocó.** Con compresión por tramo, un km/h "real" no existe: un metro de
     crucero vale 30 veces uno de rasante. El velocímetro sigue diciendo la sensación de velocidad.
- ✅ **N2 — el radar con alcance** *(hecho 23/9)*. `core/ruta.js` suma `fraccionDeKm`,
  `lineasRadar` y `techoAlcance`; `systems/ruta.js` corrige el techo y `techoRadar()` de
  systems/fases.js lo aplica — sigue siendo la puerta única del techo (detector, estrellas, red,
  tinte, HUD). Fuera de alcance el techo es `FLY_TOP`: nada detecta y todo se sigue pudiendo
  dibujar. Entrando baja en `RUTA_RADAR_RAMPA_M` (= la rampa del filo); en la vuelta, pasados
  `radarKm` del blanco, sube de una. Red y tinte apagados fuera de alcance; placa **FUERA DE
  RADAR** (centrada) en el renglón de la barra; el altímetro pierde la marca de techo; carteles al
  cruzar la línea en los dos sentidos. 2 tests `radar:` en `unit.js`. Medido en t15: crucero a 60 m
  techo 68 y detección 0; rampa 59,7; adentro 20 y detecta; vuelta pasados 180 km, techo 68.
  **Consecuencias abiertas:**
  1. ✅ *(resuelto 23/9, decisión del autor)* **El primer filo de t15 se fue**: pasó a tránsito
     (radio nueva `fase_crucero`, "arriba y fuera de radar, acá el avión gasta menos"), sin mover
     la zona de la Chancha. `unit` y `fases` actualizados.
  2. ✅ *(resuelto 23/9, decisión del autor)* **El viento en contra ya no sopla en todo el cielo**:
     solo donde un tramo o una fase lo declara (`viento: true`, clave nueva en los dos
     validadores). `cfg.wind` (VIENTO: NO) sigue apagándolo todo; el viento visual del pasto y el mar
     no se tocó. **Idea del autor para N4:** un tramo con viento sobre la zona de la Chancha puede
     complicar a veces la conexión con el Hércules.
  3. `npm run fases` ya tenía 6 fallas en N1 (medido en un árbol aparte): el paso 5 y el
     aterrizaje, la siembra de la vuelta y la tasa de nafta. No son de este plan.
- **N3 — el gasto nuevo.** `flight.js:294` rama `ruta`: gasto por km con los tres factores;
  capacidad por carga, con tanques externos que se vacían primero (`run.tanques` + `run.interno`);
  ALCANCE en el HUD + marca de **bingo**; quedarse en cero = `death_fuel` (§3.8). **Las tres
  zonas de gasto en el altímetro y el indicador** (§3.6). **El turbo proporcional entra acá para
  todas las misiones** (§6.6) y se recalibra M1.
- **N4 — la Chancha en dos mitades.** IDA: zona fija, sin pedido ni barra, se la encuentra.
  VUELTA: la barra de puntos de hoy decide **hasta dónde se acerca**. Calibrar la regla de
  §3.5 (un km de racha x10+ llena barra por 1,5–2× la nafta extra que quemó). Sin `ruta`, el poder
  de hoy intacto.
- **N5 — soltar la carga.** Tecla de suelta de tanques (de a par el ala, solo el centro) y de
  bombas sin blanco; `fCarga` y velocidad se recalculan con lo que queda colgado; las capas
  horneadas dejan de dibujar lo soltado.
- **N6 — los tanques como arma.** **Depende de LA SUELTA** (`systems/blanco.js`, de la otra
  sesión): se espera a que esté comiteada y se reusa su balística con el dibujo del tanque. Tabla
  de daño del §3.7.
- **N7 — la elección de carga en campaña.** Pantalla de carga **desde M3/M4, antes de la pantalla
  de mejoras del Pichón** (el banco de `data/upgrades.js`). M1–M2 fijan la carga base.
- **N8 — calibración y adopción.** Playtest de t15 con las tres cargas; recién después, llevar
  `ruta` a la campaña (M2–M6 con Chancha, M7+ sin) — cuando las 14 misiones estén resueltas, como
  dijo el autor en `PLAN_CARGA_Y_CHANCHA`.

Lo que **se retira** con `ruta` (solo en esas misiones): `cfg.fuelScale`, el `nafta:` por tipo de
fase (queda como override opcional), los bidones y `CH_MIN_T`.

---

## 6 · Decisiones

**Tomadas por el autor (23/9/2026):**

1. **El crucero se comprime.** ✅
2. **Sin trim: siempre a gas**, con **tres zonas de gasto** marcadas en el altímetro y en el
   indicador de nafta (MAYOR abajo, MEDIO en el medio, MENOR arriba). → §3.6.
3. **Sin nafta, perdés** — pero el juego da opciones antes: soltar tanques o bombas para estirar,
   y recuperar con la Chancha en la vuelta jugando (cañón, esquives, rasante). → §3.5, §3.8.
4. **Los tanques se sueltan, llenos o vacíos, y sirven de arma.** → §3.7.
5. **La carga se elige desde M3 o M4, antes de la mejora del Pichón.** → N7.

6. **El turbo proporcional va en TODAS las misiones**, con y sin `ruta`. En las misiones sin
   `ruta` (que gastan por segundo) el extra pasa de `+4.2/s` fijo a
   `FUEL_RATE × nafta(fase) × ((v/vSinTurbo)³ − 1)`: con turbo ×1.5 son ~+7.6/s en crucero, y más
   con el `after` apilado. **Consecuencia:** M1 (única misión de campaña con nafta hoy) hay que
   recalibrarla — su `fuelScale 0.4` está medido con el turbo viejo — y hay que mirar que
   `npm run feel` siga idéntico (el feel mide el vuelo, no el tanque, pero se verifica).

## 7 · Datos provisorios anotados para el historiador

En `../historia/PREGUNTAS_HISTORICAS.md`, sección *"LA NAFTA COMO ALCANCE"*: alcance sin tanques,
km por tanque, factor de consumo al ras, distancias de descenso/nivelado/potencia, zonas de la
Chancha. Ningún número de este plan bloquea: todos viven en `data/tuning.js` o en la `ruta` de
cada misión.
