# LA NAFTA COMO ALCANCE — cómo funciona hoy

> **Qué es este documento.** La descripción **normativa** del sistema de combustible, radar,
> Chancha y carga **tal como está en el código** (24/9/2026). Si el código y esto no coinciden,
> uno de los dos está mal: arreglarlo o anotarlo al final (§14).
>
> **Hermano:** [`PLAN_NAFTA_ALCANCE.md`](PLAN_NAFTA_ALCANCE.md) es la **historia**: la propuesta,
> las decisiones del autor en el orden en que llegaron y lo que se probó en cada fase (N0–N8). Varias
> cosas de ahí se rehicieron después (la Chancha por zona de N4, por ejemplo). **Para saber qué hace
> el juego, este documento; para saber por qué, el plan.**
>
> **Datos históricos provisorios:** en `../historia/PREGUNTAS_HISTORICAS.md`, sección *"LA NAFTA COMO
> ALCANCE"*. Todos viven en `data/tuning.js` o en la `ruta` de cada misión: corregirlos es cambiar
> números, no lógica.

---

## 0 · En una página

- Una misión puede declarar **`ruta:`**, su recorrido en **km reales**. **Sin `ruta` todo funciona
  como antes** (salvo el turbo, §4, y el enganche de la Chancha, §5.4).
- Con ruta:
  - **el radar tiene alcance**: no existe hasta 180 km del blanco (§2);
  - **la nafta es un tanque en km** que se gasta por km según la **altura** (tres zonas), lo que
    **cuelga** y el **turbo** (§3);
  - **quedarse seco pierde la misión** (§3.5);
  - **la Chancha se llama** (tecla 5): la de la ida está planificada y no pide barra; la de la
    vuelta se gana con puntos (§5);
  - **los tanques se sueltan** (tecla 3) y caen como arma (§6).
- **El turbo cuesta en proporción a lo que acelera, en todas las misiones** (§4).
- **El hangar** (elegir carga) aparece en campaña desde M3, después del briefing (§7).
- **El viento en contra** solo sopla donde un tramo o una fase lo declara (§8).
- **Hoy la única misión con ruta es `t15`** (PRUEBAS → IDA Y VUELTA). La campaña la adopta cuando
  cada misión tenga sus fases (§13).

---

## 1 · La ruta en km

**Dónde:** `core/ruta.js` (puro) · `systems/ruta.js` (el estado de la corrida) · se arma en
`setRunObjective()` de `game.js`, al lado de las fases.

```js
ruta: { blancoKm: 700, radarKm: 180, niveladoKm: 120, potenciaKm: 50,
        chanchaIda: [450, 370], chanchaVuelta: [350, 400] }
```

| clave | qué es |
|---|---|
| `blancoKm` | distancia de la base al blanco (obligatoria). La vuelta mide lo mismo: casa está a `2 × blancoKm` |
| `radarKm` | a cuántos km del blanco empieza el radar (en la ida) y hasta dónde sigue (en la vuelta) |
| `niveladoKm` | desde dónde se vuela al ras |
| `potenciaKm` | la corrida final |
| `chanchaIda` / `chanchaVuelta` | dónde orbitaba el Hércules (km al blanco / desde el blanco). **Ya no deciden cuándo viene** (§5): son dato histórico y el lugar donde la llama el piloto de la calibración (§12) |

**La ruta se ANCLA a las fases** (no al revés — las fases son la dramaturgia de la misión):

| punto del pasillo | vale |
|---|---|
| fracción 0 | 0 km (la base) |
| empieza el primer `descenso` | `blancoKm − radarKm` |
| empieza el primer `rasante` | `blancoKm − niveladoKm` |
| empieza el `blanco` | `blancoKm − potenciaKm` |
| fracción 1 | `blancoKm` |
| el último `hasta` de la vuelta | `2 × blancoKm` (casa) |

Entre anclas es lineal: **eso es la compresión**. En t15, 520 km de crucero caben en el 16% del
pasillo y los 180 de la llegada en el resto. Una fase que no existe no ancla nada.

- `validarRuta(ruta, fases)` rechaza claves desconocidas, órdenes imposibles (nivelado antes que el
  radar), zonas de Chancha adentro del radar y fases que no avanzan con los km. Lo corre `npm run
  unit` contra **toda** misión que declare ruta.
- **HUD:** la barra de objetivo cuenta km reales — número y marcador — en la ida («611 / 700 km») y en
  la vuelta («A CASA 350 / 700 km»).
- **El velocímetro no cambia**: con compresión por tramo no existe un km/h real.

---

## 2 · El radar con alcance

**Dónde:** `techoAlcance` / `lineasRadar` (`core/ruta.js`), aplicado dentro de `techoRadar()` de
`systems/fases.js`, que sigue siendo **la puerta única del techo** (detector, estrellas, red, tinte,
HUD).

- **Fuera de alcance el techo es `FLY_TOP`** (68): el avión no puede pasarlo, así que nada detecta.
- **Al cruzar `radarKm` en la ida** el techo baja hasta el de la fase a lo largo de
  `RUTA_RADAR_RAMPA_M` (900 m de pasillo, la misma rampa del filo).
- **En la vuelta**, pasados `radarKm` desde el blanco, **sube de una**.
- Fuera de alcance: sin red, sin tinte, placa **FUERA DE RADAR** (centrada) en el renglón de la barra
  del radar, y el altímetro sin marca de techo.
- Cruzar la línea se anuncia: «ENTRANDO EN RADAR — AL AGUA» / «FUERA DE RADAR — A SUBIR».

---

## 3 · La nafta: un tanque en km

**Dónde:** `core/nafta.js` (la cuenta, pura) · `systems/nafta.js` (el tanque de la corrida) · el
cobro en `flightSystem` (`systems/flight.js`).

### 3.1 · La capacidad

`TANQUE_INTERNO_KM` (1700) + `TANQUE_EXTRA_KM` (450) por tanque externo:

| carga | tanques | capacidad |
|---|---|---|
| 2 tanques + bomba (`tanques_bomba`, la base) | 2 | 2600 km |
| 3 bombas (`tres_bombas`) | 0 | 1700 km |
| 1 bomba (`bomba`) | 0 | 1700 km |

El tanque es `{ tanques: [km, …], pilones: ['ala', 'ala', …], interno }` en `run.tanque`.
**Se gastan primero los externos, parejos**; el interno, después. La Chancha **carga primero el
interno** y después los externos que sigan colgados.

### 3.2 · El gasto

```
km gastados = km recorridos × fAltura(y) × fCarga(colgado) × fVelocidad(r)
```

- **km recorridos** = metros del odómetro × `kmPorMetro` de la ruta (un metro de crucero vale ~30
  veces uno de rasante).
- **`fAltura` — tres zonas escalonadas** (`ZONAS_GASTO`):

  | zona | altura | × | se ve |
  |---|---|---|---|
  | **GASTO MENOR** | desde `CH_ALT` (48) | 1 | celeste |
  | **GASTO MEDIO** | `RADAR_ALT` (20) a 48 | 1,8 | gris |
  | **MAYOR GASTO** | debajo de 20 | 3 | ámbar |

  La frontera de abajo es el techo del radar a propósito: esconderse es lo que más quema.
- **`fCarga` — el arrastre:** `ARRASTRE_LIMPIO` (0,85) + 0,1 por bomba + 0,1 por tanque. Base y
  tres bombas: 1,15; una bomba: 0,95; limpio: 0,85. Las bombas que cuelgan salen de `run.msl` en las
  misiones con LA SUELTA; si no, de la carga.
- **`fVelocidad` — el turbo:** `(v / vSinTurbo)²` (§4).
- **El tanque es la verdad y `run.fuel` (0–100) su reflejo.** Lo que otro sistema le cambie al %
  (Chancha, piruetas, golpes) se traslada al tanque al cuadro siguiente (`run.fuelSync`). Por eso
  ninguno de ellos tuvo que aprender km.

### 3.3 · Cuánto corre el avión

Con menos arrastre, más rápido: `velRelativa = (arrastre base / arrastre actual) ^ VEL_ARRASTRE_EXP`
(0,5). Sin el par de tanques, ~+10%; limpio, ~+16%. **Solo con ruta.**

### 3.4 · El HUD

- **Reloj de nafta:** km restantes (unidad «km»), **aguja del color de la zona de gasto**, y la
  **marca roja de BINGO** = lo que hace falta para terminar la misión desde acá volando alto y sin
  turbo (en la ida incluye llegar y volver). Por debajo del bingo, crítico (titila).
- **Arriba del reloj de nafta, el nombre de la zona** en su color.
- **Adentro del altímetro, la franja de las tres zonas** (un arco fino por dentro de la escala).

### 3.5 · Seco es perder

Tanque en cero → `death_seco` («Te quedaste sin combustible») → **misión perdida, sin relevo**: el
tanque es de la corrida y el compañero heredaría el mismo cero.

---

## 4 · El turbo, en TODAS las misiones

El turbo cuesta **en proporción a lo que acelera** (`r` = velocidad con turbo / sin turbo ni after;
1,5 el de siempre, más con el after apilado):

- **con ruta**, por km: `× r²`;
- **sin ruta**, por segundo: `extra = consumo de la fase × (r³ − 1)` (~+7,6 %/s en crucero donde antes
  era +4,2 fijo). `FUEL_BOOST` se retiró.

**M1 se recalibró** (`fuelScale` 0,4 → 0,25): con 0,4 el turbo de punta a punta se secaba antes de
aterrizar; con 0,25 llega con ~33% (y lento sin turbo, con ~62%).

---

## 5 · La Chancha

**Dónde:** `systems/chancha.js` (barra, pedido, cita, enganche, reserva) · `render/chancha.js` (el
Hércules, la manguera, la caja) · `pedirChancha()` en `game.js` · el reloj en `render/hud.js`.

### 5.1 · Con ruta: viene cuando la llamás

- **Tecla 5** (mando: cruceta arriba). **Nunca aparece sola.**
- **Siempre fuera del radar.** Adentro contesta «ADENTRO DEL RADAR NO ENTRO. SALÍ Y TE VOY A BUSCAR.»
- **Cuántas veces, por tramo:** `chanchaVeces: { ida, vuelta }` de la misión (t15: 1 y 2). Sin el
  campo, una por tramo.
- **La de la IDA no pide barra**: la cita de ida estaba en el plan de vuelo. Fuera del radar, el
  reloj de la Chancha se pone verde y dice **LISTA**; la barra que tengas no se toca.
- **La de la VUELTA pide la barra llena**: la Chancha rompe el protocolo para ir a buscarte, y eso
  se gana. La barra (`CH_CHARGE`, 2000 pts) se carga con puntos mientras ella no está en el aire —
  al ras en x10 son ~120 pts/s, **~17 s de rasante sostenido** — y se vacía al llamarla.
- **Llega en `CH_ETA_RUTA`** (6 s: el crucero está comprimido).
- La misión con `chancha: false` (M7 en adelante, la rotura del guion) no la tiene.

### 5.2 · Sin ruta: el poder clásico

Igual que siempre: una vez por corrida, barra llena, `CH_MIN_T` (o `chanchaMinT` de la misión),
llega en `CH_ETA` (18 s), y las zonas por fase `chancha: true` si la misión las declara.

### 5.3 · La cita

El Hércules vuela arriba (`CH_ALT` 48), lento y derivando; hay que meterse en la **caja** detrás de la
canasta (`CH_BOX`). Tiene `CH_WINDOW` (30 s) antes de irse.

### 5.4 · El enganche y la carga (vale con y sin ruta)

| estado | la caja | el HUD |
|---|---|---|
| afuera | cuatro esquinas tenues (la ayuda de puntería) | flecha de rumbo si no está a tiro |
| **adentro, enganchando** (`CH_ENGANCHE`, 1,5 s sostenido) | **naranja, titila rápido**, con una barrita que se llena | «ENGANCHADO — NO TE MUEVAS» |
| **cargando** | **verde, late** con relleno | reloj de nafta con **borde y aguja verdes** |

Salirse de la caja reinicia el enganche. Cargando, pasa `CH_RATE` (9 %/s del tanque; con ruta, del
tanque en km). **El reloj de la Chancha muestra su RESERVA** bajando: le alcanza para un tanque entero
tuyo por cita; seca, se va. Lleno el tanque, también se va.

---

## 6 · Soltar los tanques — y los tanques como arma

**Tecla 3** (mando: **L3** en vuelo — afuera del vuelo L3 sigue siendo la pista musical anterior). **Solo con ruta.**

- Primer toque: el **par de ala**; segundo: el **central**. Cada tanque se va **con lo que tenía
  adentro**: la capacidad baja y, si iba con nafta, un cartel dice cuántos km se fueron al mar.
- El avión deja de dibujar la capa soltada y, con menos arrastre, corre más (§3.3).
- **Cada tanque cae como proyectil** desde su pilón (ala a ±`TQ_ALA_X`), con la balística de la bomba
  **sin eyector**: se desprende, cae casi debajo del avión. Lleno o vacío lo decide lo que tenía
  (`TANQUE_LLENO_FRAC`: más de la mitad = lleno).

| cae | contra enemigos | contra el buque (LA SUELTA) |
|---|---|---|
| **lleno** | mata lo que toca; contra algo explosivo (`TQ_EXPLOSIVOS`: depósito, camión AA, barcaza, antiaérea, torre) la nafta encendida mata a los vecinos (`TQ_ONDA_X/Z`) | vale **una bomba** y revienta |
| **vacío** | voltea **aviones y helicópteros** de un golpe (`TQ_AIRE`); a lo demás le saca `TQ_DANO_VACIO` (2) — «TOCADO» | vale **media bomba**, sin explosión: **el par al centro lo hunde** |

Los tanques no tienen espoleta. Contra el agua: el lleno revienta, el vacío salpica. Dibujo: una
cápsula gris (no hay hoja horneada del tanque suelto). La regla es pura: `golpeTanque` /
`buqueTanque` / `estadoTanque` en `core/nafta.js`.

---

## 7 · El hangar (elegir la carga)

- **Campaña, desde M3** (`CARGA_ELEGIBLE_DESDE`), **después del briefing y antes de despegar**:
  estado `'carga'`, pantalla **EL HANGAR**.
- Tres tarjetas (`CARGAS_ELEGIBLES`): **2 tanques + bomba**, **3 bombas**, **1 bomba** — cada una con
  alcance, bombas, velocidad relativa y el trueque en una línea. En una misión sin Chancha, las que
  dependen de ella avisan en rojo.
- **M1 y M2 salen con la base.** El reintento tras morir no vuelve a pasar por el hangar.
- Todo lo que depende de la carga (bomba del buque, estante de la suelta, tanque en km) se arma en
  `prepararCarga()` y se rearma al confirmar.
- **No se guarda** entre sesiones ni en la partida (§14).

---

## 8 · El viento en contra, por tramo

Ya no sopla en todo el cielo: solo donde un **tramo o una fase** declara **`viento: true`** (clave
validada en los dos). `VIENTO: NO` del menú lo apaga todo. El viento visual (pasto, mar) no cambia.

---

## 9 · Qué declara una misión

| campo | dónde | qué hace |
|---|---|---|
| `ruta` | misión | §1. Requiere `fases` |
| `fases` | misión | la forma ida / blanco / vuelta; la ruta se ancla a ellas |
| `chanchaVeces: { ida, vuelta }` | misión | cuántas veces se la puede llamar por tramo (con ruta) |
| `chancha: false` | misión | sin Chancha (la rotura del guion) |
| `climax: 'suelta'` | misión | el buque en el pasillo (LA SUELTA); t15 la usa |
| `cfg.fuelOn` | misión | sin esto no hay nafta (con o sin ruta) |
| `viento: true` | tramo o fase | viento en contra ahí |

---

## 10 · Los números (todos en `data/tuning.js`)

| perilla | valor | qué |
|---|---|---|
| `TANQUE_INTERNO_KM` / `TANQUE_EXTRA_KM` | 1700 / 450 | el tanque |
| `TANQUE_LLENO_FRAC` | 0,5 | umbral lleno/vacío al soltar |
| `ZONAS_GASTO` | ×1 / ×1,8 / ×3 | las tres zonas |
| `ARRASTRE_LIMPIO` / `_BOMBA` / `_TANQUE` | 0,85 / 0,1 / 0,1 | el arrastre |
| `VEL_ARRASTRE_EXP` | 0,5 | cuánto acelera soltar |
| `RUTA_RADAR_RAMPA_M` | 900 | la rampa del horizonte de radar |
| `CH_ETA_RUTA` | 6 s | llegada de la Chancha con ruta |
| `CH_ENGANCHE` | 1,5 s | sostenerse antes de cargar |
| `CH_CHARGE` | 2000 pts | la barra |
| `CH_RATE` | 9 %/s | la carga |
| `TQ_BUQUE` | lleno 1 · vacío 0,5 | tanque contra el buque |
| `TQ_DANO_VACIO` · `TQ_ONDA_X/Z` · `TQ_ALA_X` | 2 · 12/16 · 3 | tanques como arma |
| `FUEL_RATE` | 3,2 %/s | consumo base sin ruta |

---

## 11 · Cómo probarlo

- **Jugarlo:** `npm start` → **PRUEBAS → IDA Y VUELTA** (`t15`). Arranca en la pista, ~5 min, termina
  aterrizando. Sale con 2 tanques + bomba (el hangar no aparece en PRUEBAS).
- **Sondas** (consola de Electron):
  - `__nafta()` — el tanque (km, capacidad, pilones, zona); `__nafta(pct)` pone el % como lo haría
    otro sistema.
  - `__chadbg()` — la Chancha (fase, barra, usos, conexión, reserva); `__chaset()` llena la barra.
  - `__fsdbg()` — la fase y el techo del radar resuelto; `__wjump(p)` salta a la fracción `p`.
  - `__mision('t15', { cfg: { carga: 'tres_bombas' } })` — la misión con otra carga (`bomba`,
    `tanques_bomba`).
- **Pruebas:** `npm run unit` (tests `nafta:`, `ruta:`, `radar:`, `chancha:`, `tanques:`,
  `tanques-arma:`, `hangar:`, `viento:`, `calibracion:`) · `npm run feel` imprime las tablas de §12 ·
  `npm run chancha` (el fixture de la cita, con enganche).

---

## 12 · La calibración (t15, sin tocar un número)

`vueloRuta` (`tools/nafta_perfil.js`) vuela t15 con las fórmulas del juego y un piloto "de manual"
(alto fuera del radar, medio en el descenso, al ras adentro; llama a la Chancha en su zona de la
ruta). km al llegar al buque / al llegar a casa:

| carga | sola | Chancha ida | Chancha vuelta | las dos |
|---|---|---|---|---|
| 2 tanques + bomba | 1464 / 351 | 1923 / 810 | 1464 / 2296 | 1923 / 2288 |
| 3 bombas | seco en el km 1003 | 1046 / 145 | seco en el km 1003 | 1046 / 1460 |
| 1 bomba | seco en el km 1235 | 1162 / 260 | 761 / 1467 | 1162 / 1457 |

- La base vuelve sola (con turbo final también).
- **Tres bombas se seca en la vuelta 50 km antes de la zona de la Chancha**: la salva llamarla con la
  barra apenas se sale del radar (km 880).
- Una bomba necesita una de las dos.
- Duración: ~313 s (40 de crucero, 110 de llegada, 167 de vuelta).

El unit test `calibracion:` se rompe si un cambio deshace este trueque.

---

## 13 · Qué falta

- **La adopción en la campaña.** Por misión: declarar sus `fases` (ida / objetivo / vuelta, ver
  `FORMA_DE_CADA_MISION.md` — M4–M14 pendientes), su `ruta` (con el `blancoKm` de esa salida, dato
  para el historiador; provisorio 700) y `chanchaVeces` (M2–M6; desde M7 `chancha: false`),
  `fuelOn: true` y sacar el `fuelScale` a mano. Es data pura, la valida el unit test.
- **El hangar en PRUEBAS**, para probar t15 con las tres cargas sin sonda.
- **Guardar la carga elegida** en la partida.
- **Bombas sin blanco** para estirar la nafta en una misión con ruta y sin LA SUELTA (ahí el pasillo
  no tiene tecla de bomba).
- **Arte:** el tanque suelto (hoy una cápsula a mano) y el avión con su carga en el hangar (hoy
  tarjetas de texto). Que la capa soltada desaparezca del avión no se pudo confirmar en captura.
- **Tanques contra aviones y helicópteros** está probado por la regla (unit), no en vuelo.
- **El viento sobre la cita con la Chancha** (idea del autor): la clave `viento` existe; falta decidir
  si además hace derivar la canasta.

---

## 14 · Divergencias

*(Lo que el código haga distinto de este documento, con fecha y quién lo decidió.)*

- *(ninguna al 24/9/2026)*
