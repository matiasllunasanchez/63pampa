# PLAN — DOS MODOS DE CAMPAÑA: `ARCADE` y `1982`

> **Qué es esto.** La campaña se puede jugar de dos maneras. No son "fácil" y "difícil": son
> **dos fantasías distintas** sobre el mismo guion, la misma historia y las mismas catorce
> misiones.
>
> **Estado:** plan. Nada implementado todavía. El mapeo de abajo se apoya en constantes que ya
> existen en `src/data/tuning.js` — está anotado cuáles.

---

## 1 · LOS DOS MODOS, EN UNA FRASE CADA UNO

**`ARCADE` — "el avión que quisiste tener".** Metal Slug. El cañón se recalienta y vuelve, los
tres tiros pesados son guiados, el combustible perdona, se puede reencarar. El jugador vuela,
dispara y gana. Es el modo por defecto y el que hace que el juego se pueda terminar.

**`1982` — "el avión que hubo".** Doscientos proyectiles y se acabaron. Tres bombas tontas que
caen donde las mandaste. Nada te avisa que te están apuntando. No hay pelea aérea contra un
Harrier: hay rasante o hay muerte. Es el modo que convierte cada decisión en un costo.

> **Cómo se llaman en pantalla.** Propongo `ARCADE` y **`1982`** en vez de "REAL", por dos
> razones. Una: "REAL" implica que el otro modo es falso, y ARCADE no es falso, es otra cosa.
> Dos: `1982` no promete simulación —que no vamos a dar— sino **época**, que sí damos. Si
> preferís REAL, es cambiar una string.

---

## 2 · LO QUE NO CAMBIA NUNCA

Esto es lo que hace que sean dos modos y no dos juegos. **Ninguna de estas cosas se toca:**

- **El guion entero.** Los diálogos, las cartas de Mateo, las placas, el orden de las misiones.
- **Quién muere y cuándo.** El Vasco, el Pichón, el Colorado, Mateo. La historia no es una
  dificultad.
- **Las mejoras del Pichón.** Las mismas doce, en el mismo orden causal.
- **El problema de las espoletas como HECHO NARRATIVO.** M6 se llama «La bomba que no
  despertó» en los dos modos. Lo que cambia es si el jugador lo *sufre* o solo lo *escucha*.
- **La indefensión como premisa.** En los dos modos el A-4 es un avión sin misiles aire-aire.
  ARCADE no le regala Sidewinders: le regala **tolerancia**.

---

## 3 · EL MAPEO

Cada fila es una perilla. La columna **DÓNDE** dice qué constante o sistema toca.

### 3a · Cañón — la diferencia más grande

| | `ARCADE` | `1982` | DÓNDE |
|---|---|---|---|
| Modelo | **calor**: munición infinita, se recalienta y vuelve | **munición**: 200 proyectiles, ~6 s, **no vuelven** | `GUN_HEAT_SHOT`, `GUN_COOL_FIRE`, `GUN_COOL_IDLE`, `GUN_RESET` |
| Ráfaga sostenida | ~3,1 s y enfría | hasta que se acaba | ídem |
| Recarga en vuelo | sí, enfriando | **no existe** | nuevo: `GUN_ROUNDS` |
| Atasco | no | **sí, probabilístico**, más alto tras alta G, y **no se destraba** | nuevo: `GUN_JAM_P`, `GUN_JAM_G` |
| HUD | barra de calor | **contador en SEGUNDOS**, no en balas | UI |

> **Por qué segundos y no balas.** Doscientos es un número que no significa nada. *"Te quedan
> 4,2 segundos de cañón"* es una frase que el jugador entiende con el cuerpo. Es la unidad en
> la que pensaba el piloto.

> **Histórico:** 2 × Colt Mk 12 de 20 mm, 100 tiros por cañón, 1.000 disparos/minuto ≈ **6 s
> totales por salida**, tirados en 3–5 ráfagas. El atasco está documentado con testimonio de
> piloto y con causa mecánica. Ver `historia/ARMAMENTO_1982.md`.

### 3b · La carga pesada — de misiles a bombas

| | `ARCADE` | `1982` | DÓNDE |
|---|---|---|---|
| Qué son | **3 misiles** guiados | **3 bombas** BRP-250 de caída libre | `MSL_MAX = 3` *(el número ya es correcto)* |
| Guiado | sigue al blanco | **ninguno**: parábola desde donde soltaste | nuevo: `ORD_GUIDED` |
| Cuántas llevás | siempre 3 | **1 sin reabastecer, 3 con Chancha** | atar a `CH_*` |
| Espoleta | siempre explota | **si soltás por debajo de la altura mínima, NO explota** | nuevo: `FUZE_MIN_ALT`, `FUZE_ARM_T` |
| Altura mínima | — | ~50 m de mundo (⚠ calibrar contra `RADAR_ALT = 20`) | nuevo |

> **Ésta es la joya del modo `1982`** y no cuesta casi nada implementarla: la bomba impacta,
> se ve el impacto, **y no pasa nada**. El barco sigue navegando. Es exactamente lo que pasó
> trece veces.
>
> **Y se cura con las mejoras del Pichón**, que es lo que pasó de verdad: la doble espoleta y
> la KEMA eléctrica bajan `FUZE_MIN_ALT`. El jugador no compra "más daño": compra **que la
> bomba funcione**.

### 3c · Amenaza y aviso

| | `ARCADE` | `1982` | DÓNDE |
|---|---|---|---|
| Alerta de misil | sí (sonido + indicador) | **no hay alerta de ningún tipo** | nuevo: `RWR_ON` |
| Misil enemigo | lento, se ve venir | mismo dibujo, **sin aviso previo** | `CAZA_MSL_*` |
| Trazadoras de aviso | sí | menos, y algunas **sí hacen daño** | `CAZA_MSL_*`, trazadoras |
| Chaff | — | consumible **de las mejoras**, y **soltarlo te frena** (iba en el aerofreno) | nuevo |

> El «no hay alerta» es el dato más sólido de toda la investigación: le preguntaron a Carballo
> qué sentían cuando sonaba el alertador y contestó **"Nada"**. No tenían.

### 3d · Aguante y castigo

| | `ARCADE` | `1982` | DÓNDE |
|---|---|---|---|
| Vida del jugador | varios impactos | **uno o dos y estás afuera** | vida del jugador |
| Vida de enemigos | `ENEMY_HP` actual | igual o +1 en blandos | `ENEMY_HP` |
| Combustible | perdona | **cuenta de verdad**; volver también consume | `fuel: [4, 26]`, `REATTACK_FUEL` |
| Reencare | `REATTACK_MAX = 6` | **2** | `REATTACK_MAX` |
| Choque con el agua | rasguño | **muerte** | colisión |

### 3e · Lo que NO se toca en ninguno de los dos

Velocidad y manejo del avión · las piruetas y sus combos · el radar y el techo (`RADAR_ALT`) ·
la niebla · la Chancha como mecánica · el Pulso · la estructura de las misiones.

> **Regla:** el modo cambia **cuánto perdona el juego**, no **cómo se vuela**. Si `1982`
> cambiara el manejo, serían dos juegos y habría que testear dos.

---

## 4 · ARQUITECTURA — UNA SOLA PERILLA

El repo ya tiene la convención escrita en `data/cuarentena.js`: *"ESTO ES LA ÚNICA PERILLA.
No hay que buscar `if`s por el código."* El modo se hace igual.

**`src/data/modos.js`** — dato puro, sin lógica:

```js
export const MODOS = {
  arcade: { id:'arcade', name:'ARCADE', gun:'calor', ordGuided:true,  fuze:false, rwr:true,  ... },
  m1982:  { id:'m1982',  name:'1982',   gun:'municion', ordGuided:false, fuze:true, rwr:false, ... },
};
export const MODO_DEFAULT = 'arcade';
```

**Cómo lo consume el juego.** El modo se resuelve **una vez**, al armar `cfg`, y de ahí en más
el resto del código lee `cfg.*` como siempre. **Ningún sistema pregunta por el modo.** Un
sistema que haga `if (modo === '1982')` es un bug de arquitectura, no una feature.

```js
// al iniciar la partida
cfg = { ...cfg, ...resolverModo(MODOS[modoElegido]) };
```

**Dónde se elige.** Las mismas tres puertas que ya documenta `AVIONES_CATALOGO.md` §"la
campaña no te deja elegir avión": `startCampaign()`, `loadSave()`, `abrirMision()`.
- `startCampaign()` → **el jugador elige el modo**, una vez, al empezar.
- `loadSave()` → **lo lee de la partida guardada**. El modo es de la partida, no del menú.
- `abrirMision()` → toma el modo del selector, y por defecto `arcade`.

**Persistencia.** El modo se guarda **dentro del save** (`systems/saves.js`). Una partida
empezada en `1982` sigue en `1982`. **No se puede cambiar a mitad de campaña** — si no, se
baja la dificultad justo antes del jefe y el modo deja de significar nada.

> ⚠ **La trampa que este repo ya pisó dos veces** (documentada en `AVIONES_CATALOGO.md`): la
> pantalla de PRUEBAS ensucia el estado de la campaña. El modo tiene que resolverse en las
> tres puertas o `abrirMision()` va a arrastrar el último modo usado en pruebas.

---

## 5 · PLAN DE IMPLEMENTACIÓN — cuatro fases

**FASE 1 · El andamio.** `data/modos.js` + el resolver + las tres puertas + guardar el modo en
el save + el selector en pantalla. **Los dos modos son idénticos todavía.** Si al terminar la
fase 1 el juego se comporta igual que antes en los dos modos, el andamio está bien.

**FASE 2 · El cañón.** El modelo de munición en segundos, el HUD nuevo, el atasco. Es el cambio
que más se siente y el que hay que jugar más veces antes de seguir.

**FASE 3 · Las bombas y la espoleta.** Balística sin guiado, altura mínima de armado, el
impacto que no explota, y el enganche con las mejoras del Pichón.

**FASE 4 · El resto.** Aviso, vida, combustible, reencare. Ajuste fino con playtest.

> **Orden a propósito:** cada fase se puede jugar y se puede tirar sin romper las anteriores.

---

## 6 · VERIFICACIÓN

- **Fase 1:** empezar campaña en cada modo, guardar, salir, cargar → el modo persiste; PRUEBAS
  no contamina una campaña abierta después.
- **Fase 2:** en `1982`, gatillo apretado desde el inicio → ~6 s y silencio hasta aterrizar.
  En `ARCADE`, ~3,1 s y vuelve.
- **Fase 3:** soltar por debajo de la altura mínima sobre un barco → impacto visible, **cero
  daño**. Con la mejora de espoleta → explota.
- **Fase 4:** una misión completa en cada modo, cronometrada, y comparar.
- **Transversal:** las catorce misiones tienen que ser **terminables** en `1982`. Si alguna no
  lo es, el problema es esa misión, no el modo.

---

## 7 · EL PROMPT PARA IMPLEMENTARLO

> Pegar tal cual. Está escrito para un agente que trabaja sobre este repo.

```
Implementá el sistema de DOS MODOS DE CAMPAÑA de RASANTE, siguiendo
docs/sistemas/PLAN_MODOS_ARCADE_REAL.md. Hacé SOLO LA FASE 1.

CONTEXTO DE ARQUITECTURA — leelo antes de escribir código:
- Este repo tiene una convención explícita, escrita en src/data/cuarentena.js: los switches de
  comportamiento son DATO, no cirugía. "ESTO ES LA UNICA PERILLA. No hay que buscar ifs por el
  codigo." Respetala.
- Los valores de ajuste viven en src/data/tuning.js y el juego los lee vía cfg.
- Hay tres puertas de entrada a una partida, ya documentadas en
  docs/historia/AVIONES_CATALOGO.md: startCampaign(), loadSave() y abrirMision(). Las tres
  tienen que quedar cubiertas. Este repo YA se rompió dos veces porque la pantalla de PRUEBAS
  ensuciaba el estado de la campaña: no repitas eso.

QUÉ HAY QUE HACER (Fase 1, el andamio, sin cambiar todavía ningún comportamiento):

1. Creá src/data/modos.js. DATO PURO, sin lógica y sin imports del motor. Exportá:
   - MODOS: un objeto con dos perfiles, 'arcade' y 'm1982'. Cada perfil declara id, name
     (string de UI, sin acentos), desc (es/en) y un bloque de flags de comportamiento.
     Para esta fase los DOS PERFILES DECLARAN LOS MISMOS VALORES, que son los actuales del
     juego. Los flags a declarar, aunque todavía no los lea nadie:
       gun ('calor' | 'municion'), gunRounds, gunJamP,
       ordGuided (bool), ordCount, fuze (bool), fuzeMinAlt,
       rwr (bool), reattackMax, fuelScale, playerHpScale
   - MODO_DEFAULT = 'arcade'
   Documentá arriba del archivo, en castellano y con el tono del resto del repo, qué es cada
   modo y por qué existe.

2. Escribí un resolver — resolverModo(perfil) — que devuelva el parche de cfg correspondiente.
   Vive junto a MODOS o en systems/, decidilo vos, pero tiene que ser TESTEABLE en aislamiento.
   El resto del código NO debe preguntar nunca por el id del modo: lee cfg como siempre.

3. Enganchá el modo en las tres puertas:
   - startCampaign(): recibe el modo elegido y lo aplica.
   - loadSave(): LEE el modo desde la partida guardada. Si un save viejo no lo tiene, asumí
     MODO_DEFAULT y no rompas.
   - abrirMision(): usa MODO_DEFAULT salvo que el selector diga otra cosa, y NO debe dejar
     estado pegado que después contamine una campaña.

4. Persistencia en systems/saves.js: el modo se guarda DENTRO del save. Una partida empezada
   en un modo se queda en ese modo. No implementes cambiar de modo a mitad de campaña.

5. UI: agregá la elección de modo al arranque de campaña nueva, con las dos tarjetas y su
   descripción corta. Los textos van en src/data/strings.js con es/en, como todo lo demás.
   Mostrá el modo activo en la pantalla de partidas guardadas.

RESTRICCIONES:
- NO toques todavía el cañón, las bombas, el combustible, la vida ni el aviso de misil. Fase 1
  es solamente el andamio.
- NO cambies ningún valor de tuning.js en esta fase.
- NO metas ifs de modo en los sistemas de juego.
- Nada de acentos en los identificadores ni en los textos de UI, siguiendo el estilo del repo.

CRITERIO DE ACEPTACIÓN — esto es lo que voy a probar:
- Empiezo campaña en cada modo, guardo, salgo, cargo: el modo persiste y se ve en la lista de
  partidas.
- Juego una misión desde PRUEBAS y después abro una campaña guardada: la campaña conserva SU
  modo, no el de pruebas.
- Un save viejo sin campo de modo carga sin romperse.
- El juego se comporta EXACTAMENTE IGUAL que antes en los dos modos. Si algo cambió en la
  jugabilidad, la fase 1 está mal hecha.

Cuando termines, decime qué archivos tocaste y qué quedó pendiente para la Fase 2.
```

---

## 8 · PENDIENTE DE DECISIÓN

- **El nombre en pantalla:** `1982` (propuesto) o `REAL`.
- **Si `1982` se desbloquea o está desde el principio.** A favor de desbloquear: la primera
  partida enseña el juego. A favor de tenerlo desde el arranque: el que quiere la historia
  cruda no debería tener que ganarse el derecho.
- **Si el modo afecta el final.** Recomendación: **no**. Los finales dependen del guion, no de
  la dificultad.
- **Calibrar `FUZE_MIN_ALT`** contra `RADAR_ALT = 20`: la altura donde el radar te ve y la
  altura donde la bomba se arma tienen que estar peleadas entre sí. **Ese es el juego.**
