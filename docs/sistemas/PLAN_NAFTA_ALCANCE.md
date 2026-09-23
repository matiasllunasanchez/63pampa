# PLAN — LA NAFTA COMO ALCANCE *(altura, carga, radar y la Chancha, en km)*

> **Estado:** 📝 propuesta para aprobar (23/9/2026) · pedido del autor: *"analizar una propuesta
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

- **`fAltura(y)`** — la perilla del jugador. `×3` en la banda rasante (`y ≤ BANDA_ALT`), baja
  lineal hasta **`×1` en `CRUCERO_Y`** y se queda ahí. Es **la altura real del avión**, no la
  fase: si en el tránsito te tirás al agua, pagás rasante; si en el rasante te subís, pagás menos
  pero te ven.
- **`fCarga`** — el ropero. `×1.15` con tres bombas, `×1.1` con tanques llenos, `×1` con una bomba
  sola, **`×0.85` sin nada colgando** (lo que la fase `vuelta` ya hacía, ahora con causa física:
  soltaste). Si los tanques se sueltan vacíos (pregunta abierta §6), se va el ×1.1.
- **`fVelocidad`** — **el turbo proporcional, pedido del autor.** `(v / vSinTurbo)²`, donde
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

### 3.5 · La Chancha, por zona y en emisión cero

Con `ruta`, la Chancha **deja de ser un poder de barra**:

- **Está en su zona** (`chanchaIda` / `chanchaVuelta`), orbitando alto, en silencio. No se pide:
  **se la encuentra** — asoma a lo lejos al entrar a la zona. Esto resuelve la duda abierta de
  `PLAN_CARGA_Y_CHANCHA` ("cómo se pide en la ida sin romper el silencio de radio").
- Sin barra de puntos, sin `CH_MIN_T`, sin tecla 5 (la tecla queda para las misiones sin `ruta`).
- La zona es **fuera de radar** por construcción (370–450 km > 180): la cita alta no te pinta.
- **Si te pasás de la zona, te la perdiste.** Con tres bombas, eso es no volver.
- `chancha: false` (M7 en adelante, la rotura del guion) sigue mandando: no hay Hércules en la
  zona, y el briefing de M10 *"la Chancha no baja más al sur"* se cobra sola.
- La cita en sí (`CH_ALT`, caja, `CH_RATE`, deriva) **no se toca**.

### 3.6 · El crucero alto — la pieza nueva de vuelo

Hoy "volar alto" es sostener ARRIBA contra la gravedad: 500 km así es un calambre. Propuesta:
**trim de crucero** — con `ruta`, fuera de radar y por encima de `CRUCERO_Y`, soltar el gas
**mantiene** la altura en vez de caer (el espejo del poder RASANTE, que asienta abajo). Bajar
sigue siendo `inp.d`. Adentro del radar el trim se apaga y vuelve el vuelo a gas de siempre.
Solo existe con `ruta`, así que `feel` no se entera.

El altímetro, **por encima de `RADAR_ALT` y fuera de radar, pasa a mostrar nivel de vuelo**
(`FL350` en `CRUCERO_Y`): el mundo sigue siendo de 68 m, pero el número dice lo que el avión
está haciendo. Por debajo sigue en metros/pies como hoy.

---

## 4 · El perfil de una misión, con los números

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
señal de que el modelo es el bueno. (Los factores exactos se calibran en N6; la forma del trueque
es lo que importa.)

Y las tres formas de perderlo: **bajar temprano** (×3 durante km de más), **subir tarde** en la
vuelta (lo mismo), **turbo largo** (×2.25 sobre ×3).

---

## 5 · Fases de implementación

Cada una deja el juego jugable; tras cada una `npm run check` y `npm run feel` idénticos.

- **N0 — el cálculo puro.** `core/nafta.js`: `capacidadKm(carga)`, `fAltura(y)`, `fCarga(...)`,
  `fVelocidad(v, vSinTurbo)`, `gastoKm(...)`. Constantes a `data/tuning.js`. Unit tests (el turbo
  ×1.5 cuesta ×2.25/km; una misión sin `ruta` da exactamente el gasto de hoy). Reporte en
  `tools/feeltest.js` con la tabla del §4 para las tres cargas. **Cero cambio visible.**
- **N1 — la ruta y los km.** Campo `ruta:` validado como las fases; derivación de las fronteras
  de fase y la escala por tramo; HUD en km reales. Se prueba sobre **t15** (ya tiene la forma
  ida/Chancha/descenso/rasante/blanco/vuelta/Chancha/casa).
- **N2 — el radar con alcance.** `techoRadar()` devuelve "sin techo" fuera de `radarKm`; red,
  tinte y barra de detección obedecen; cartel FUERA DE RADAR; rampa al cruzar la línea; en la
  vuelta, subir adentro del alcance pinta.
- **N3 — el gasto nuevo.** `flight.js:294` rama `ruta`: gasto por km con los tres factores;
  capacidad por carga; ALCANCE en el HUD + marca de **bingo** (lo que hace falta para volver
  desde donde estás, al régimen de crucero). Turbo proporcional también en misiones sin `ruta`
  **solo si el autor lo pide** (tocaría `feel`).
- **N4 — la Chancha por zona.** Con `ruta`: aparece en su zona sin pedido ni barra; se la
  encuentra visualmente; perderse la zona es perderla. Sin `ruta`, el poder de hoy intacto.
- **N5 — el crucero alto.** Trim de crucero fuera de radar + altímetro en nivel de vuelo.
- **N6 — calibración y adopción.** Playtest de t15 con las tres cargas; recién después, llevar
  `ruta` a la campaña (M2–M6 con Chancha, M7+ sin) — que coincide con lo que el autor ya dijo
  en `PLAN_CARGA_Y_CHANCHA`: se aplica cuando las 14 misiones estén resueltas.

Lo que **se retira** con `ruta` (solo en esas misiones): `cfg.fuelScale`, el `nafta:` por tipo de
fase (queda como override opcional), los bidones, `CH_MIN_T` y la barra de la Chancha.

---

## 6 · Lo que tiene que decidir el autor

1. **¿El crucero se comprime?** (§3.3) La alternativa es que el tránsito alto dure proporcional
   a los km y ahí vivan todas las charlas — más largo, más fiel.
2. **¿Trim de crucero?** (§3.6) Sin él, 500 km de sostener ARRIBA; con él, el vuelo a gas se
   suspende arriba. Es la única pieza que cambia el tacto del avión.
3. **¿Qué pasa con 0 de nafta en la vuelta?** Hoy el avión cae al mar (`death_sea`). Opciones:
   eyección (escena), muerte con causa propia, o "misión cumplida, avión perdido" — varios
   pilotos cayeron así de verdad.
4. **¿Se sueltan los tanques?** Vacíos o en el blanco, para ganar velocidad y el `×0.85`.
5. **¿Desde qué misión se elige carga?** (queda abierto de `PLAN_CARGA_Y_CHANCHA`; candidato M3–M4.)
6. **¿El turbo proporcional también fuera de `ruta`?** Es más justo, pero mueve `feel` y la
   calibración de M1.

---

## 7 · Datos provisorios anotados para el historiador

En `../historia/PREGUNTAS_HISTORICAS.md`, sección *"LA NAFTA COMO ALCANCE"*: alcance sin tanques,
km por tanque, factor de consumo al ras, distancias de descenso/nivelado/potencia, zonas de la
Chancha. Ningún número de este plan bloquea: todos viven en `data/tuning.js` o en la `ruta` de
cada misión.
