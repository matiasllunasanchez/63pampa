# PLAN — El PASILLO en ZIGZAG *(el callejón que dobla)*

> **Audiencia: una IA implementadora (Opus medio o alto) en sesión nueva, sin el chat donde se
> decidió esto.** Define cómo el PASILLO —hoy literalmente recto: adelante es siempre `+z`—
> pasa a poder **doblar**: un trazado con curvas que el jugador tiene que seguir, con
> **paredes de montaña** a los costados cuando el mapa lo pide. Es la pieza que hace posible
> **EL CALLEJÓN DE LAS BOMBAS** (m5, San Carlos) como lo que fue: un brazo de mar angosto entre
> cerros, que entra torcido — no un tubo recto con montañas pegadas a los lados.
>
> **Se activa y desactiva POR MAPA** (dato de la misión + fila del menú `[M]`). Apagado, el
> juego es byte a byte el de hoy. Esa es la regla suprema de este plan (§0).
>
> **Antes de tocar código, leer en orden:**
> 1. `docs/ARQUITECTURA.md` — manda sobre este plan; divergencias a §10. En especial las cuatro
>    convenciones y la nota de los DOS espacios de coordenadas.
> 2. `src/core/fx.js` (`proj`) · `src/systems/vuelo.js` (la cama de vuelo, los topes `FLY_X`) ·
>    `src/render/marco.js` (el velo del carril — el precedente de "el carril proyectado por
>    filas") · `src/render/world.js` `drawSea`/`drawLand`/`drawSeaDots` (los rasters por fila,
>    con **19** proyecciones inline `W/2 + (wx - cam.x) * k` que NO pasan por `proj`).
> 3. `SPEC_TRAMOS.md` — el modelo "dato por misión + resolución pura en `core/` + estado en
>    `systems/`" que este plan copia, y su §8 (los tramos y `?qa`).
> 4. `PLAN_TIERRA_COSTA.md` T3 — el precedente de "lo que ves es lo que te mata" (`core/tierra.js`
>    evaluado por render y por vuelo). Las paredes de acá siguen esa misma regla.

## 0. Cómo usar este documento

1. Una fase por vez (§7); tras cada una, fixture (§6) + `npm run check` + `npm run feel` verdes.
2. **La regla suprema: un mapa SIN zigzag se comporta EXACTAMENTE igual que hoy.** No "parecido":
   igual. La fase Z1 lo prueba con una captura comparada píxel a píxel contra el baseline. Una
   fase que no pueda demostrarlo, no cierra.
3. `npm run feel` idéntico al baseline (34 asserts; comparar con `grep -E "✓|✗|FEEL:"`).
   `core/physics.js` no se toca.
4. Toda divergencia plan↔código se anota en §10.

## 1. ¿Es posible? Sí — y hay dos maneras. Se elige una.

Hoy el mundo del PASILLO es un carril recto en `x` absoluto: el avión vive en `plane.x ∈ [-FLY_X,
FLY_X]` (38), lo que nace lo hace en `±SPAWN_X` a `SPAWN_Z` (320 m) y viene hacia la cámara
restando `z`; la cámara persigue al avión (`cam.x = plane.x·0.86`, con retardo) y `proj()` es
`W/2 + (x − cam.x)·k`. **El avión se mueve de costado a lo sumo a 30 m/s** (`plane.vx` topado)
mientras avanza a 62–150 m/s. Ese número manda sobre todo lo que sigue.

### Modelo A — el trazado en `x` absoluto *(descartado)*

Generalizar `shoreAt(wz)` —la orilla de la COSTA, que ya serpentea en `x` en función de la
profundidad— a un **centro de carril** `carrilX(wz)` y mover TODO lo que hoy dice `±FLY_X` /
`±SPAWN_X` a `carrilX ± FLY_X`. Es "honesto" (las paredes están en un lugar del mundo), pero:

- El avión tendría que **atravesar físicamente** el `x` de la curva a 30 m/s contra 74 de avance:
  pendiente máxima 0,4 en crucero y **0,2 con turbo**. Las curvas quedarían larguísimas o
  imposibles a velocidad.
- La cámara sigue a `plane.x`: doblar se vería como **desplazarse de costado** —el mundo corriéndose
  en bloque— no como *virar*. Es exactamente el rechazo de la primera arena («al mover se mueve el
  mapa y no el avión»).
- Consumidores a tocar, contados: el tope del vuelo (`vuelo.js`), los carriles del sembrador
  (`lane`/`landLane`/`waterLane`/la trinchera en `-SPAWN_X`), el rebote de los que se mueven en
  `collision.js`, los topes de `moves.js`, `persec.js` (4 sitios), `wingmv.js`, la mira del mouse
  (`±40`), el marco, `drawFlightLane`, la red de radar, el velo, el marcador de objetivo y la
  aproximación al buque. **Quince lugares** para que el resultado se vea peor.

### Modelo B — el RIEL CURVO *(el elegido)*

El de OutRun, Road Rash y —más cerca de casa— **After Burner**: el carril **no se mueve en el
mundo; es la CÁMARA la que lo ve doblar**. Todo lo que ya existe sigue viviendo en el *marco del
carril* (el avión en `[-FLY_X, FLY_X]`, los obstáculos en `±SPAWN_X`, las colisiones en
`|plane.x − o.x|`): **nada de eso cambia una línea.** Lo que cambia es:

1. **La proyección**: a la profundidad `z` el carril está corrido de costado por cuánto dobló el
   trazado entre la cámara y ese punto — `bend(z)`. `proj()` pasa a `W/2 + (x − cam.x + bend(z))·k`.
   Un obstáculo a 300 m en una curva a la izquierda se dibuja a la izquierda; a 50 m, casi al
   centro; llega derecho. Es la imagen exacta de una curva vista desde adentro.
2. **La fuerza**: en la curva el avión **deriva hacia afuera** (la centrífuga de OutRun). El
   jugador tiene que *sostener* la palanca hacia adentro: doblar se vuelve una habilidad, y
   soltar en una curva cerrada te pone contra la pared. Eso es el gameplay nuevo, y es UNA línea
   en el integrador.
3. **La actitud**: el horizonte se inclina hacia la curva (el sistema del HORIZONTE GIRATORIO ya
   existe — `core/horizon.js`) y la cámara *mira* un poco hacia adentro. Es lo que hace que se
   sienta que virás y no que el mundo se tuerce.
4. **Las paredes** (cuando el mapa las pide): dos filas de montaña a `±ZZ_PARED_X` **en el marco
   del carril**, dibujadas por fila con el mismo `bend(z)`, así que en pantalla doblan con el
   camino. Chocarlas mata (o topa, por dato).

Costo: `bend(z)` es una tabla de ~160 números que se arma **una vez por cuadro**; las 19
proyecciones inline de `world.js` suman un término. Cero allocations en el bucle. Y con zigzag
apagado `bend ≡ 0` y el término es literalmente `+ 0`.

**Lo que NO hace el riel curvo, y se acepta:** el mundo no "sabe" que dobló — un radar en el
suelo no queda en un lugar del mapa, queda en un lugar del carril. Para un juego que ya trae los
obstáculos hacia la cámara restando `z`, es el mismo contrato de siempre. Si algún día el pasillo
se muda al 3D (`?p3d`, PLAN_MEJORAS_3D §5b), ahí el trazado pasa a ser geometría real; el DATO
(§2) sobrevive tal cual.

## 2. El modelo de datos *(las reglas)*

Un campo opcional de la misión en `data/missions.js`, **data pura, cero código por misión**, y su
espejo en `cfg` para el menú `[M]` y las pruebas:

```js
zigzag: {
  // EL TRAZADO. Una de dos formas (nunca las dos):
  //   procedural — curvas sorteadas por semilla, deterministas: la misma misión dobla siempre igual
  amp: 0.7,        // 0..1: cuánto dobla (fracción de ZZ_CURV_MAX)
  largo: 650,      // metros por curva (media onda). Menos = más nervioso
  seed: 5,         // determinista: el trazado no cambia entre intentos
  //   explícito — para guionar: lista de tramos [metros, curvatura -1..1] (0 = recta)
  // trazado: [[400, 0], [600, -0.8], [300, 0], [700, 0.6], [500, 0]],
  //
  // LAS PAREDES (opcional). Sin esto el trazado dobla a cielo abierto (sirve solo o de piloto).
  paredes: { alto: 1, x: 46, mata: true },   // alto 0..1 (fracción de ZZ_PARED_H) · x = semi-ancho · mata|topa
  desde: 0.35, hasta: 0.92,  // fracciones del objetivo en las que el zigzag rige (fuera: recto)
}
```

- **Fracciones y no metros** para `desde`/`hasta` (SPEC_TRAMOS §2: `?qa` comprime). Los `largo`
  del trazado SÍ son metros, porque una curva de 40 m no es una curva — y por eso el fixture
  **no corre con `?qa`** (divergencia 4 de los tramos, la misma trampa).
- La curvatura real es `curv × ZZ_CURV_MAX` (rad/m). `ZZ_CURV_MAX` vive en `data/tuning.js` y se
  deriva de los 30 m/s laterales (§8): el trazado más cerrado del juego **siempre se puede
  sostener** con la palanca a fondo en crucero. Con turbo, no — y eso es deliberado (§3, RF-04).
- **Entre curvas hay empalme**: la curvatura no salta, se funde en `ZZ_EMPALME` metros (sin esto
  el horizonte da un tirón al entrar a cada curva).
- **Nada muta `cfg`**: resolución por lectura (`core/zigzag.js`), igual que los tramos. Lo que
  la misión trae se lee; el `[M]` escribe `cfg.zigzag` (0 · 1 suave · 2 callejón) solo para
  prototipar sin misión, con el mismo precedente que `cfg.terrain`.
- El validador (`validarZigzag`) rechaza: `amp`/`curv` fuera de rango, `largo < ZZ_LARGO_MIN`,
  `trazado` y `amp` a la vez, `desde >= hasta`, claves desconocidas — y corre en `npm run unit`
  contra TODAS las misiones, como `validarTramos`.

## 3. Requerimientos funcionales

### RF-01 · El trazado es puro
`core/zigzag.js`, sin DOM ni stores: `curvAt(d, zz)` (rad/m a `d` metros absolutos del
recorrido), `headingAt(d, zz)` (∫curv), y **`bendTable(d0, zz, paso, n)`** — la tabla de
corrimiento lateral `bend(z)` para `z ∈ [0, SPAWN_Z·1.2]` vista desde `d0` con rumbo `heading(d0)`:
`bend(z) = ∫₀ᶻ ( heading(d0+s) − heading(d0) ) ds`. Más el validador. **La importa `npm run unit`.**
**CA:** con `amp: 0` o sin campo la tabla es exactamente cero · el trazado explícito
`[[400,0],[600,1]]` da `bend(z) = 0` en la recta y `≈ ZZ_CURV_MAX·z²/2` adentro de la curva ·
determinismo: dos llamadas con la misma `seed` dan la misma tabla · empalme continuo (la curvatura
no salta más de `ZZ_CURV_MAX/ZZ_EMPALME` por metro).

### RF-02 · La cámara ve la curva
`proj()` suma `bend(z)`; las 19 proyecciones inline de `render/world.js` y el marco suman el
`bend` de SU fila (tabla, lookup con interpolación — no se recalcula por punto). Alcanza a:
el raster del mar y de la tierra, los puntos del mar, la orilla y la playa de la COSTA, los
matojos, los alambrados, el marco, el carril de depuración (`drawFlightLane`), la red de radar,
el velo y el marcador de objetivo. **El cielo, las nubes y el telón NO** (viven en otro plano —
RF-05). **CA:** con zigzag apagado, **captura idéntica píxel a píxel** al baseline en los tres
terrenos (mar, tierra, costa) — la prueba de la regla suprema. Con un trazado de una curva a la
izquierda, un obstáculo a `SPAWN_Z` se dibuja a `bend(SPAWN_Z)·k` píxeles a la izquierda de donde
se dibujaría recto (medido por sonda contra la tabla: la pantalla y el core no pueden disentir).

### RF-03 · La deriva (la fuerza de la curva)
En la curva el avión deriva hacia afuera: `deriva = −clamp(curvAt(run.dist)·run.spd·ZZ_CENTRIF,
±ZZ_DERIVA_MAX)` m/s, **sumada en el integrador (`vuelo.js`: `plane.x += (plane.vx + deriva)·dt`),
NUNCA a `plane.vx`**. Razón: con CONTROL POR ALABEO `flight.js` *asigna* `plane.vx = bankVx(bankA)`
cada cuadro (línea ~191) — un empujón a `vx` se pisaría y el modo por alabeo no sentiría la curva.
La deriva es cero fuera de `'play'` y con zigzag apagado. **CA:** sin tocar la palanca, en la curva
más cerrada a velocidad de crucero el avión llega al borde exterior en menos de 4 s; con la
palanca a fondo hacia adentro, se sostiene (deriva < vx máximo); `feel` intacto; el fixture lo
mide con `__zzset` + lectura de `plane.x`.

### RF-04 · El turbo en la curva es un riesgo, no un bug
A 150 m/s la deriva supera los 30 m/s de palanca: **no se puede sostener la curva cerrada con
turbo**. Se acepta como regla (es lo que pasa en un cañón de verdad: entrar rápido te saca de la
línea) y se COMUNICA: al superar `ZZ_DERIVA_AVISO` la actitud del avión se va (banqueo al tope),
suena el roce de aire y el HUD tiembla — igual que el aviso de LA COLA, nada nuevo. Sin cartel.
**CA:** sonda `__zzdbg().sostenible` (deriva ≤ vx máx) reporta `false` con turbo en la curva
cerrada y `true` en crucero.

### RF-05 · La actitud y el fondo venden el viraje
1. El horizonte se inclina **hacia adentro** de la curva `ZZ_TILT·curv/ZZ_CURV_MAX` radianes (por
   `core/horizon.js`, sumado a lo que el modo del jugador ya hace; en `HZ_FIX` **no** — es la
   salida de quien se marea, y sigue siéndolo).
2. El sprite banquea hacia adentro con el mismo criterio (`plane.bank` objetivo, suavizado como
   siempre — `vuelo.js` ya relaja la actitud con peso).
3. La cámara adelanta la mirada: `cam.x` suma `ZZ_CAM_LEAD·curv/ZZ_CURV_MAX` (unidades de mundo,
   con el mismo retardo `dt·7` de siempre). Es la mirada al ápice; sin esto la curva se descubre
   tarde.
4. El **telón y las colinas del horizonte** giran con el rumbo: su parallax (`cam.x·0.8` y
   `cam.x·3.5` en `game.js`) suma `heading(run.dist)·ZZ_FONDO_K`. Es lo más barato y lo que más
   vende que doblaste: las sierras del fondo se corren.
5. El **mar 3D del pasillo** (`legacy/three-world.js`, mapa de mar): la cámara three recibe
   `yaw = heading` y el sol/telón lo mismo. Sin esto el 3D queda mirando derecho mientras el 2D
   dobla, y se ve la costura. Si en Z2 resulta caro, el mar 3D se apaga en mapas con zigzag y se
   anota (divergencia), nunca se deja torcido.
**CA:** capturas de la misma curva con `HZ_FIX` (mundo derecho, fondo corrido) y `HZ_ALL`
(inclinado); `hzWorld()` vale 0 cuando el jugador tiene FIJO, siempre.

### RF-06 · Las paredes: lo que ves es lo que te mata
`render/paredes.js` dibuja por fila, de lejos a cerca, dos laderas a `x = ±paredes.x` en el marco
del carril, con altura `paredH(d, lado)` **determinista por banda** (`hash2`, como el pedrero) —
crestas quebradas con las lajas del acantilado (`drawObstacle` `'cliff'`, reusando su rampa de
color por terreno: basalto en tierra, arenisca en costa, y en MAR la pared es **turba con roca al
pie** — San Carlos es turba). Se apoyan en el relieve si lo hay (`tierraH`). El **pie** de la
pared es el límite del carril: `paredes.x − ZZ_PARED_TALUD` es donde empieza a cobrar.
- `mata: true` → pasar el pie con `plane.y < paredH·ZZ_PARED_LIBRE` mata (`death_pared`, causa nueva
  en `core/damage.js`: chocar algo → muerte, la regla de SPEC_AVERIAS). Por encima de la cresta se
  pasa — subir para saltar la loma es una salida legítima y cara (el radar te carga arriba).
- `mata: false` → tope duro como `FLY_X` hoy, más el roce visual (`scrapeVib`) y un chirrido.
- Con paredes, el MARCO (niebla de guerra lateral) **se apaga solo**: la pared ya dice dónde
  termina el carril, y un velo sobre una montaña es una montaña borrosa.
- **Los obstáculos no nacen adentro de la pared**: `carrilLibre()` en `spawn.js` recorta `lane`
  a `±(paredes.x − ZZ_PARED_TALUD − 2)`. Es el único toque al sembrador, y es por lectura.
**CA:** el fixture mata al avión contra la pared con `mata: true` (`__lastRun().death ===
'death_pared'`), lo topa con `false`, y con paredes NO nace un solo obstáculo con `|x| >
paredes.x − talud` en 60 s de siembra (`__trcount` + posiciones).

### RF-07 · El zigzag rige por fracción y convive con los TRAMOS
`desde`/`hasta` son fracciones de `objectiveDist`; fuera de ellas `curv = 0` con empalme (se
endereza suave al salir, y la pared **baja** hasta desaparecer en `ZZ_PARED_FADE` metros —
la boca del callejón se abre a la bahía: es la entrada al clímax de m5). Los tramos siguen
resolviendo densidad/mezcla/radio como siempre; el zigzag es OTRA capa, no una clave de tramo (v1:
`SPEC_TRAMOS` §7.6 — nada de terreno por tramo). POR LA PATRIA (sin objetivo): el zigzag rige
si `cfg.zigzag > 0`, con `desde = 0, hasta = ∞`. **CA:** en m5 con `desde: 0.35`, `__zzdbg()`
reporta `curv: 0` en el tránsito del Narwal y `!= 0` pasado el 35 %; el VEIL sigue mandando.

### RF-08 · Cero regresión sin zigzag
Misión sin campo y `cfg.zigzag = 0` → tabla cero, deriva cero, tilt cero, paredes ausentes, marco
como siempre. **CA:** RF-02 (captura idéntica) + `feel` idéntico + smoke verde + `__zzdbg()` con
`on: false`.

## 4. Lo que el zigzag le da a EL CALLEJÓN DE LAS BOMBAS *(la misión piloto)*

Lo histórico primero, porque es lo que justifica el pedido: *Bomb Alley* fue el nombre que la
flota británica le puso al **estrecho de San Carlos** — un brazo de agua angosto y **torcido**,
entre Fanning Head al norte y los montes Sussex al sur, con cerros de turba a los dos lados. Los
A-4 y Dagger entraban a ras cruzando las lomas o remontando el estrecho desde el Sound, y las
fragatas fondeadas los veían aparecer **de golpe** por sobre una cresta. Un tubo recto con
montañas pegadas no es eso; un carril que dobla entre laderas, sí. *(La ruta exacta de cada
escuadrilla del 21 de mayo va a `PREGUNTAS_HISTORICAS.md` — no bloquea: el trazado es dato y
se cambia sin código.)*

El armado propuesto para m5 (se escribe en Z4, y es dato):

| fracción | qué pasa | por qué |
|---|---|---|
| 0 – 0.31 | recto, mudo — el tránsito del Narwal (los cuatro tramos ya escritos) | no se toca: es el cobro del guion |
| 0.31 – 0.38 | **la boca**: las paredes suben de 0 a 1 en `ZZ_PARED_FADE`, primera curva suave | el jugador ve cerrarse el paisaje: "entramos" |
| 0.38 – 0.88 | el callejón: `amp 0.75`, `largo 600`, paredes `mata`, `favor: ['aa','aatruck']`, `bombs: 2` | AA en las laderas, el cielo lleno — el nombre de la misión |
| 0.88 – 1.0 | **la salida**: se endereza, las paredes bajan, el mar se abre — y ahí asoma el ARDENT | la bahía; entrega al clímax ARENA (y al P4 terreno 3D cuando exista) |

Cómo se empalma con lo que ya está: el clímax de m5 es ARENA (`climax: 'arena'`) y P4 de
PLAN_MEJORAS_3D le pone lomas a la bahía. **Este plan es el PASILLO de antes de la bahía**; los
dos se encuentran en la boca. Ninguno depende del otro para cerrar.

## 5. Sondas *(marcadas QUITAR, patrón `__trdbg`/`__pdbg`)*

- `window.__zzdbg()` — `{ on, curv, heading, deriva, sostenible, bendSpawn (bend a SPAWN_Z),
  pared: { l, r, h }, fase: 'antes'|'adentro'|'despues' }`.
- `window.__zzset(zz)` — inyecta un `zigzag` al run EN CURSO (devuelve los errores del validador),
  como `__trset`. Es la única forma de probar trazados sin editar `missions.js`.
- `window.__zzbend(z)` — el `bend` de la tabla viva a esa profundidad (para que el fixture compare
  la pantalla contra el core).
- `?zigzag=1|2` — URL: prende `cfg.zigzag` al cargar (para POR LA PATRIA y para el smoke).
- PRUEBAS (`data/pruebas.js`): `zigzagCurva` («LA CURVA» — patria con `?zigzag=1`),
  `zigzagCallejon` («EL CALLEJÓN» — m5 con `__wjump(0.4)`), `zigzagPared` («LA PARED» — la muerte
  contra la ladera). Los tres usan solo sondas (COMO_PROBAR §4: la regla de oro).

## 6. Fixture — `npm run zigzag` *(`tools/fixture_zigzag.js`, patrón de los 14 existentes)*

Corre **sin `?qa`** (los `largo` son metros). Pasos:
1. **Regla suprema**: patria en mar / tierra / costa con `cfg.zigzag = 0` → captura; el hash del
   PNG es igual al del baseline grabado en Z1 (`tools/baseline/zigzag_off_*.png`; se regraba a
   propósito, nunca por accidente — como `layers_whitelist.json`).
2. `__zzset` con una curva a la izquierda → `__zzbend(SPAWN_Z) < 0` y un obstáculo sembrado a
   `x = 0` se dibuja a la izquierda del centro (posición del sprite por sonda de proyección).
3. Deriva: sin input, `plane.x` cruza `FLY_X·0.9` en < 4 s en la curva cerrada; con `inp.l`
   sostenido se queda en `|plane.x| < 10`. Con turbo, `sostenible: false`.
4. Paredes: muerte `death_pared` con `mata`; tope con `!mata`; censo de siembra dentro del talud.
5. m5 con `?mision=m5`: `curv = 0` en el tránsito, `!= 0` pasado `desde`, paredes bajando antes
   del objetivo; el ARENA entra igual que hoy.
6. `HZ_FIX` → `hzWorld() === 0` toda la curva. Cero errores de consola.

## 7. Fases

| fase | entrega | criterio de cierre |
|---|---|---|
| **Z0** | `core/zigzag.js` puro (trazado procedural + explícito, `curvAt`/`headingAt`/`bendTable`, empalme, validador) + perillas `ZZ_*` en `data/tuning.js` + unit tests de RF-01 + validador contra `MISSIONS` | `npm run unit` con los casos de RF-01; `check` verde |
| **Z1** | La cámara ve la curva: `bend` en `proj()` y en las 19 proyecciones por fila de `world.js` + marco + carril + red + velo + marcador · `systems/zigzag.js` (estado del run: qué `zigzag` trae la misión, la tabla del cuadro) · sondas `__zzdbg`/`__zzset`/`__zzbend` · `?zigzag=` · **baseline de capturas apagado** | fixture pasos 1–2; `feel` idéntico; capturas de una curva en los tres terrenos |
| **Z2** | La sensación: deriva en `vuelo.js` (RF-03/04), tilt + banqueo + mirada al ápice (RF-05.1–3), fondo y colinas con rumbo (RF-05.4), yaw del mar 3D (RF-05.5) | fixture pasos 3 y 6; **playtest de Matías en POR LA PATRIA con `?zigzag=1`** — este es el gate del plan: si doblar no se siente, no se construyen paredes sobre algo que no dobla |
| **Z3** | Las paredes: `render/paredes.js` + `death_pared` en `core/damage.js` + tope/roce + marco auto-off + `carrilLibre` recortado + boca/salida (`ZZ_PARED_FADE`) | fixture paso 4; capturas de la boca, del callejón y de la salida |
| **Z4** | Los datos: campo `zigzag` en m5 con el armado de §4 · fila `[M]` (`optZigzag`: no · suave · callejón, con strings es/en) · las tres entradas de PRUEBAS · `npm run zigzag` completo en `package.json` · docs (ARQUITECTURA: filas de `core/zigzag.js`, `systems/zigzag.js`, `render/paredes.js`; DISENO_MISIONES M5; COMO_PROBAR; README) | los 6 pasos verdes; `check` verde; volar m5 entera de corrido |
| **Z5** *(opcional, con ok aparte)* | El vestido del callejón: AA que disparan **desde las laderas** (nacen en el talud, a la altura de la pared), mangueras de trazadoras cruzando el carril desde las crestas (reusar las de PASADA_ADRENALINA R2 si ya existen), la radio de la boca («es la boca del lobo») | capturas + playtest; no toca el core |

**Orden y dependencias:** Z0 → Z1 → Z2 → Z3 → Z4. Z5 después de todo. **Z3 no arranca sin el
ok de Z2** (el gate). Z4 puede adelantar los strings y la fila `[M]` en paralelo con Z2.

## 8. Perillas de partida *(`data/tuning.js`, bloque `ZIGZAG`; se juzgan jugando)*

| perilla | valor | de dónde sale |
|---|---|---|
| `ZZ_CURV_MAX` | `1/600` rad/m (radio 600 m) | con `ZZ_CENTRIF` da 18 m/s de deriva en crucero (74 m/s): el 60 % de los 30 m/s de palanca — sostenible con margen; el jugador **siente** que sostiene |
| `ZZ_CENTRIF` | `150` | `deriva = curv·spd·150` → 0,123 rad/s · 150 = 18 m/s en la curva máxima a 74 m/s |
| `ZZ_DERIVA_MAX` | `26` | por debajo de los 30 de palanca: hasta el turbo deja **una** chance si vas a fondo |
| `ZZ_DERIVA_AVISO` | `22` | desde acá el avión avisa (RF-04) |
| `ZZ_EMPALME` | `120` m | una curva entra en ~1,6 s a crucero: se ve venir, no sacude |
| `ZZ_LARGO_MIN` | `250` m | menos que esto no es una curva, es un tirón — el validador lo rechaza |
| `ZZ_TILT` | `0.30` rad (~17°) | debajo de `BANK_TILT` (0.44): la curva inclina menos que la palanca a fondo, así el jugador sigue mandando sobre el horizonte |
| `ZZ_CAM_LEAD` | `9` | unidades de mundo (el `CAM_PAN` del stick es 6: la mirada al ápice es un poco más) |
| `ZZ_FONDO_K` | `140` px/rad | las colinas se corren ~24 px por 10° de rumbo — se nota, no marea |
| `ZZ_PARED_X` | `46` | `SPAWN_X` (≈41) + 5: nada nace adentro de la pared aun sin recorte |
| `ZZ_PARED_TALUD` | `4` | el pie inclinado: cobra antes de la cara |
| `ZZ_PARED_H` | `26` | más que `CLIFF_H1` (22): es una ladera, no un acantilado suelto; pasable por arriba a `FLY_TOP` 68 pagando radar |
| `ZZ_PARED_LIBRE` | `1.05` | por encima de `h·1.05` se pasa |
| `ZZ_PARED_FADE` | `180` m | la boca se cierra / se abre en ~2,5 s |

Verificación de los números, para que nadie los tome por magia: `bend(SPAWN_Z)` en la curva
máxima = `320²/(2·600)` ≈ 85 m de mundo; a `k = F/320` = 0,42 son **36 px** de corrimiento en el
horizonte — visible sin ambigüedad, y todavía dentro de pantalla.

## 9. Qué NO hacer

1. **No mover el carril en `x` absoluto** (Modelo A, §1). Si en el camino aparece la tentación de
   "corregir" `FLY_X`/`SPAWN_X`/`carrilLibre` por el trazado: es señal de que se está construyendo
   el modelo equivocado. Con el riel curvo, esos números **no cambian**.
2. **No empujar `plane.vx`** — la deriva va al integrador (RF-03), o el CONTROL POR ALABEO no la ve.
3. **No tocar `core/physics.js`** ni las curvas de `moves.js`. `feel` idéntico.
4. **No `Math.random()` por cuadro**: el trazado y las crestas de las paredes son deterministas
   por semilla/banda (las reglas del agua y de la tierra).
5. **No inclinar el horizonte en `HZ_FIX`.** Es la salida del que se marea; el zigzag la respeta.
6. **No un segundo sembrador para las paredes**: son render por fila + una función pura de altura
   (como `tierraH`), no obstáculos en la lista. Mil lajas en `obstacles` es la clase de cosa que
   el cap de pedazos existe para impedir.
7. **No metros absolutos en `desde`/`hasta`**, y **no `?qa` en el fixture** (los `largo` sí son
   metros, y `?qa` los pulveriza).
8. **No zigzag en ARENA/PASADA/PULSO/PERSECUCIÓN** (v1). PERSECUCIÓN es la que más lo querría
   (perseguir por un cañón) y es la primera candidata a v2: `persec.js` vive en el marco del
   carril, así que debería funcionar sin tocarlo — se prueba, no se asume.
9. **No strings sueltos, no reasignar stores, no editar el bundle** (`npm run build:game` antes
   de probar en Electron — la trampa de siempre).
10. **No construir Z3 sin el ok de Z2.**

## 10. Divergencias encontradas

**Z0–Z3 implementadas (4/9/2026), con la tesis del ítem CORREGIDA por playtest — ver divergencias
22–26: el callejón NO es un camino que dobla, es tierra que se mete en el pasillo y hay que
esquivar, con la cámara completamente quieta.** `npm run check` verde · `npm run feel` byte a byte idéntico al
baseline (34 asserts) · `npm run unit` 121 → 130 · fixture `npm run zigzag` verde con los siete
bloques. **Z3 se construyó por el resultado del gate de Z2, no después de él** — ver divergencias
13–16: el playtest encontró que el carril curvo sin paredes marea, y eso cambió el orden y el
alcance. **Falta Z4** (el trazado real de m5).

### Del diseño

1. **La "captura idéntica píxel a píxel" (§0.2, RF-02, fixture paso 1) se reemplazó por una prueba
   más fuerte, no más débil.** El juego no produce capturas reproducibles contra sí mismo: el mar,
   el pasto y las nubes dependen de `run.t`, y entre fijar el reloj y capturar pasan cuadros. Un
   baseline por hash habría sido verde por casualidad o rojo sin culpa. En su lugar se afirma que
   `bendW(z)` devuelve **cero exacto** (`Object.is`, no `==`: `-0` no cuenta) en todo el barrido de
   profundidades con el zigzag apagado. Como cada sitio de dibujo suma `+ bendW(z) * k`, la cuenta
   queda `x + 0`, que en IEEE-754 devuelve `x` bit a bit. Es una demostración en vez de una
   medición, y la cuidan el unit test y el paso 1 del fixture.
2. **El empalme se topa contra el ancho de la ventana**, y lo encontró el unit test, no el juego.
   `?qa` comprime las misiones al 6%: la ventana del callejón de m5 (0.35 a 0.90 de 2600 m) pasa de
   1430 m a 86, y con el empalme fijo de 120 m las dos rampas se pisan, la ventana nunca llega a 1
   y **el zigzag no aparece bajo `?qa`**. Ahora `emp = min(ZZ_EMPALME, ancho × 0.35)`: el trazado se
   comprime con la misión en vez de desaparecer.
3. **RF-04 exageraba: con turbo la curva SÍ se sostiene, pero sólo a fondo.** La deriva cruda a
   150 m/s es 37,5 m/s contra 30 de palanca, pero `ZZ_DERIVA_MAX` la topa en 26 — o sea que entrar
   rápido deja 4 m/s de margen y ninguna capacidad de esquivar al mismo tiempo. Es mejor diseño que
   la muerte sin salida que el requisito describía, y el aviso de RF-04 sigue teniendo sentido.
4. **`tilt()` y `lead()` viven en `core/zigzag.js`, no en `systems/`**, porque los consume
   `core/horizon.js` y core no puede importar systems. El sistema los re-exporta para que haya una
   sola fórmula. Misma razón por la que el núcleo lleva su propio store (`zz`) en vez de ser
   funciones puras sueltas: la tabla del cuadro tiene que ser legible desde `proj()`.
5. **La inclinación de la curva se gatea en `HZ_ALL`, igual que el banqueo continuo.** En `HZ_FIX`
   no inclina nada (la salida del que se marea vale también con el pasillo doblando) y en
   `HZ_MOVES` tampoco, porque ese modo promete que entre pirueta y pirueta el horizonte está
   quieto — una curva no es una pirueta. Como el default de `cfg.horizon` es `2`, el jugador por
   omisión igual la ve. **Queda para el gate**: a curva plena son 17°, y sostenidos durante toda
   una curva pueden ser demasiados.
6. **La fila de OPCIONES se adelantó de Z4 a Z2.** El gate pide que el autor lo juegue, y sin fila
   la única puerta era `?zigzag=`, que no se puede escribir con el juego empaquetado en Electron.

### Del comportamiento *(cosas que el plan no dice y ahora se saben)*

7. **El telón de fondo se corre TOPEADO en 60 px.** Las nubes y las sierras dan la vuelta con un
   módulo, pero el telón es una imagen dibujada una vez con 70 px de margen: pasado eso se ve su
   borde como un bloque duro en la esquina. Apareció en la primera captura de la curva y es el
   único artefacto que dejó el ítem. No se agrandó la imagen a propósito — se escala por ancho, así
   que agrandarla cambiaría el encuadre del cielo en **todas** las misiones, con zigzag o sin él.
8. **`zz.head` acumula sin techo.** Con un trazado procedural (senos) oscila alrededor de cero, pero
   uno explícito con curvatura sostenida lo hace crecer monótonamente. Hoy sólo lo consume el
   fondo, y por eso el tope del punto 7 alcanza; si algún día lo lee algo más, hay que decidir si
   se envuelve.
9. **Las dos proyecciones inversas de la orilla del puerto restan el corrimiento.** Es el único
   lugar donde el signo se invierte (pantalla → mundo). Sumarlo ahí —el error fácil— torcería la
   orilla al revés que el terreno y partiría la costa de la tierra.
10. **Los puntos del mar, los matojos y las rachas no necesitaron corrimiento propio**: ya pasan por
    `proj()`. Lo único que se les tocó es el **centro de la ventana de muestreo**, que sin corregir
    dejaría el mar cortado del lado de adentro de la curva y sobrando del otro.

### De las fases

11. **Otra sesión estaba editando el repo en paralelo**, y `core/horizon.js` cambió abajo de este
    trabajo (el tonel se mudó a MOVES y desapareció el import de `ROLL_DUR`). Un reemplazo sin
    `assert` no encontró su ancla, falló en silencio y el juego quedó con un `ReferenceError` que
    encontró `npm run smoke`. **Lección para la próxima fase: todo parcheo por script afirma su
    ancla, y `smoke` corre antes de dar una fase por cerrada.**
12. **El fixture creyó tres veces al síntoma equivocado.** Reportó "el trazado no rige" sobre un
    motor que andaba perfecto, porque **el avión sin gas se hunde**: se cae al mar a los ~300 m sin
    que nada lo toque y el juego pasa a `'relevo'`, donde el zigzag se apaga a propósito. Y no se
    sostiene con la tecla: un `keyDown` sin `keyUp` por `sendInputEvent` **no queda apretado** para
    el juego (los toques de menú sí funcionan, una tecla sostenida no). Se sostiene con la sonda que
    planta el avión. Además, `__wjump` no hace nada en POR LA PATRIA —salta a una *fracción* del
    objetivo y ahí no hay objetivo—, así que el trazado del fixture se arma contra la distancia
    volada real.

### Del playtest de Z2 *(el gate, contestado — y lo que cambió por él)*

13. **El veredicto: el carril curvo SOLO, sobre mar abierto, MAREA.** Palabras del autor: *"en AGUA
    me marea […] el avión se mueve casi solo para un costado sin sentido"*. El diagnóstico es
    correcto y es la información que faltaba: sobre agua plana **no hay contra qué referenciar el
    giro**. El mundo se inclina y el avión se corre, y el ojo no tiene con qué explicarlo.
14. **Las paredes dejaron de ser "la fase siguiente" y pasaron a ser LA PIEZA.** El plan las
    trataba como contenido del callejón; son el **marco de referencia** que vuelve legible el
    viraje. Consecuencia directa: **los dos presets del menú llevan paredes**. Ofrecer desde el
    menú un preset sin ellas sería ofrecer justo la versión que marea. SUAVE las trae bajas, anchas
    y `mata: false` (topan, como el borde del carril de siempre); CALLEJÓN, plenas y letales.
15. **`ZZ_TILT` 0.30 → 0.18 y `ZZ_CAM_LEAD` 9 → 4.** Los dos números que el gate marcó. La
    inclinación no es lo que comunica la curva —lo comunican las paredes y el fondo corriéndose—,
    así que sólo la acompaña. Y la mirada al ápice quedó **por debajo** del paneo del stick
    (`CAM_PAN` = 6), que es la proporción correcta: mirar la curva no puede desplazar más que
    mirar para abajo a propósito.
16. **El autor esperaba "el camino se dobla y si no, chocás", y con paredes eso ES lo que pasa.**
    La diferencia entre el riel curvo y un trazado en `x` absoluto es invisible para el jugador:
    las laderas viven en el marco del carril, doblan en pantalla con `bendW(z)` y matan al tocarlas.
    La expectativa original se cumple sin el modelo que la habría hecho impracticable (§1).

### De la fase Z3 *(las paredes)*

17. **`FLY_X` (38) hacía imposible chocar la pared**, que estaba en 46 con la cara en 42: el avión
    se frenaba contra el borde invisible de siempre y la ladera quedaba de adorno. Se resolvió con
    el mismo mecanismo que ya usaba el techo de una cinemática: `stepVuelo` acepta un `limX`
    opcional y `flight.js` le pasa la posición de la roca cuando hay callejón. **Con paredes, el
    límite del carril ES la roca**; sin ellas, `FLY_X` intacto y `feel` idéntico.
18. **La primera versión de las laderas se veía como una cortina de cartulina**, no como cerros: un
    solo tono plano no da ni volumen ni escala. Se arregló con tres franjas horizontales (pie en
    sombra, cuerpo, hombro al sol), una veta a media ladera y tinte por banda. El ojo lee volumen
    por el gradiente vertical mucho antes que por la textura.
19. **Los obstáculos se recortan al ancho libre del callejón** (`anchoLibre`, leído por `spawn.js`).
    Un obstáculo enterrado en la roca es invisible y mata: la peor combinación posible. Lo cuida
    una sonda de censo (`__zzobs`) que tiene que dar 0 siempre.
20. **El marco (niebla de guerra lateral) se apaga solo con paredes puestas.** La ladera ya dice
    dónde termina el carril, y un velo encima de una montaña es una montaña borrosa.
21. **Las laderas se dibujan detrás de todos los obstáculos**, no ordenadas por `z` con ellos.
    Es aceptable porque los obstáculos viven dentro del carril y las paredes fuera: el único solape
    posible es en la banda del horizonte, donde todo mide dos píxeles. Ordenarlo de verdad exigiría
    meter 130 columnas por cuadro en la lista ordenada de obstáculos.

### Del SEGUNDO playtest *(el que cambió la tesis del ítem)*

22. **El veredicto sobre el carril curvo: «se siente mal, como si se moviese el avión solo».** Y es
    cierto. Con la cámara virando por su cuenta, el jugador deja de ser el dueño del avión — el
    mismo problema que hundió la primera arena («al mover se mueve el mapa y no el avión»), sólo
    que esta vez llegó por el lado del mareo. Bajar `ZZ_TILT` y `ZZ_CAM_LEAD` (divergencia 15)
    alivió el síntoma pero no la causa.
23. **La tesis correcta la dio el autor: el callejón no es un camino que dobla, es TIERRA QUE SE
    METE ADENTRO DEL PASILLO y hay que esquivar.** El zigzag lo hace el JUGADOR, no la cámara.
    Es mejor diseño y además es más fiel: el estrecho de San Carlos es un canal recto con costas
    irregulares y promontorios, no una curva.
24. **No hizo falta desarmar nada, y esa es la prueba de que la arquitectura era la correcta.** La
    curvatura es un DATO: los presets pasaron a `amp: 0` y con eso `bendW` da cero exacto, la
    inclinación cero y la deriva cero — **toda la maquinaria de la curva se apaga sola**. Queda
    entera, probada y sin costar un ciclo, para el día que se quiera un callejón que además doble.
25. **`paredEntra(wz, lado)`: una punta por banda y de UN SOLO LADO**, sorteado por hash. Ahí vive
    la garantía de paso: el callejón **no se puede cerrar ni tocando los números**, porque no hay
    ningún número que lo cierre. Medido sobre 6 km de trazado: 239 de 1200 muestras con tierra
    metida, la más honda 27 unidades adentro, y **cero** profundidades con punta de los dos lados.
26. **El sembrador pregunta por el TRAMO ENTERO, no por el hueco de este metro** (`carrilSeguro`).
    Un obstáculo nace a 320 m y viaja hasta el avión: sembrarlo en un hueco que se cierra 100 m más
    adelante lo deja enterrado en la roca, invisible y letal. El primer intento usaba el peor caso
    teórico y dejaba un carril de siembra de 10 unidades sobre 41; mirando el tramo real y de forma
    **asimétrica** (con una punta a la izquierda, todo el lado derecho sigue disponible) el
    callejón vuelve a ser jugable.

### Del TERCER playtest *(«me gusta bastante» — y qué pidió después)*

27. **Las puntas pasaron de 30 a 66 unidades** (`ZZ_PUNTA_MAX`). Con el borde en 46, una punta de 66
    pone la cara de la roca en **x = +20**: cruza el eje del pasillo y deja paso sólo del otro lado.
    Quedarse en el medio pasó a ser mortal, que era el pedido — *"obligar al jugador a moverse casi
    al otro extremo"*. Verificado volando: el avión sostenido en x = 0 muere con «Te comiste la
    ladera».
28. **Tres tamaños sorteados por banda, no una campana.** El pedido fue *"que VARÍE, que no sea
    siempre igual, a veces más chico, a veces más grande, a veces casi todo"*. Con un solo rango
    continuo la mayoría de las puntas salen parecidas; con tres escalones (22% de respiro, 56%
    normales, 22% grandes) el callejón tiene ritmo. Medido sobre 40 bandas: entradas de 17 a 62.
29. **El callejón ESCALA** (`ZZ_PUNTA_RAMPA`, 2600 m): arranca al 55% de dureza y llega a pleno.
    Se mide desde donde empieza el callejón (la fracción `desde` de la misión), no desde el
    despegue — así la rampa es la del callejón y no la del vuelo entero.
30. **Bug encontrado por el propio fixture: 21 globos enterrados en la roca.** Nacer en un carril
    seguro no alcanza — los que se mueven solos (el globo cabecea, el helicóptero patrulla, el caza
    busca tu carril) se meten en la tierra después. Se resolvió con `topeCarril`, aplicado cuadro a
    cuadro en `collision.js` junto al tope que esos objetos ya tenían contra el borde del carril.
    **Un obstáculo dentro de la roca es invisible y mata: la peor combinación que hay**, y sin el
    censo del fixture no se habría visto hasta jugarlo.
31. **`carrilSeguro` devolvía dos semi-anchos topados en 4, y eso era un bug latente** que las
    puntas grandes iban a despertar: cuando la roca cruza el eje, el único lugar libre está todo de
    un lado, y aquella forma decía "sembrá cerca del centro" — o sea, adentro de la piedra. Ahora
    devuelve un **intervalo absoluto que puede no contener al cero**, y si queda vacío el sembrador
    **saltea el ciclo** en vez de forzar un carril.
32. **`anchoLibre` quedó muerto** al pasar al cálculo por tramo, con un comentario en `spawn.js` que
    seguía nombrándolo. Borrado: un comentario que miente es peor que ninguno.

### Del CUARTO playtest *(tres pedidos, los tres construidos)*

33. **El callejón no empieza en el metro cero** (`ZZ_ARRANQUE` 700 m, más `cfg.coast` + 160 en una
    misión que despega de tierra). Un callejón que ya está ahí al soltar el freno no es un lugar al
    que se ENTRA — es el mapa — y encima le tapa la salida al despegue, que es justo donde el avión
    no puede maniobrar. Una misión que arranca **en el aire** (`cfg.start === 'air'`) sólo respeta
    el piso absoluto. Con `desde` declarado, manda `desde`: esto es el piso, no el reemplazo.
34. **LA MESETA: hay tierra ARRIBA del cerro.** Antes la ladera era una pared con el cielo pegado
    atrás, y pasarla por encima dejaba mirando un vacío. Ahora la superficie se dibuja extendiéndose
    hacia afuera desde la cresta, **sólo cuando la cámara está por encima de ella** — es un plano
    horizontal, y desde abajo no se ve: dibujarlo igual lo proyectaría arriba del horizonte, o sea
    pintando cielo. Que aparezca al trepar no es un truco; es lo que pasa cuando subís lo suficiente
    para ver arriba del cerro.
35. **La tierra de arriba sale del TEMA, no de constantes.** Es la lección de PLAN_TIERRA_COSTA T1:
    una paleta fija habría sido el bug de "el suelo no tiene clima" — bajo tormenta o de noche la
    meseta sería el mismo verde mientras el terreno de al lado cambia. Derivada del tema, el cerro
    se moja y se apaga con todo lo demás, gratis. La COSTA usa `cland` (arenisca), como el resto de
    ese mapa.
36. **Pasar por encima YA funcionaba, y la primera medición dijo lo contrario.** El avión moría a
    45 m sobre la ladera — pero no lo mataba la roca: lo mataba **el radar**, que carga a partir de
    los 20 m y dispara oleadas. Verificado en el núcleo (choca al ras y bajo la cresta, pasa por
    encima) y después volando con una pasada corta que no alcanza a cargar el radar. **El costo de
    saltar el cerro es exactamente ese**, y es buen diseño: la salida existe y se paga.
37. **El fixture medía la curva antes del arranque** y reportaba "la curva no dobla" sobre un motor
    correcto — el mismo tipo de error que ya había cometido dos veces con otros síntomas. Ahora pone
    el trazado primero (sin trazado la sonda no sabe dónde arranca el callejón y contesta 0), vuela
    hasta pasarlo, y recién ahí mide.

### Del QUINTO playtest

38. **BUG: el callejón desaparecía al morir.** `activo()` exigía `S.state === 'play'`, así que en
    cuanto el avión se estrellaba el estado pasaba a `'relevo'`, el sistema apagaba la tabla y **la
    cinemática de la muerte mostraba mar liso hasta el horizonte** — el jugador se estrellaba contra
    una ladera que ya no estaba. Ahora la lista de estados es la misma que dibuja el mundo del
    pasillo (`MARCO_STATES` menos el clímax): `play`, `takeoff`, `dead`, `relevo`. **El mundo no
    puede evaporarse justo en el cuadro donde el jugador mira qué le pasó.** Lo cuida el paso 9 del
    fixture.
39. **La meseta es SIEMPRE campo de TIERRA, aunque el mapa sea MAR o COSTA.** Antes tomaba `cland`
    (arenisca) en costa, por simetría con el resto de ese mapa. Está mal: la arenisca es LA PLAYA,
    tiene sentido al nivel del agua y ninguno en una meseta a treinta metros. Arriba de un cerro hay
    campo. Va escrito en el código porque el de al lado (la roca, la corona) sí mira el terreno, y
    la próxima persona va a querer "unificar".
40. **La meseta lleva vegetación**: matas ralas y algún árbol raro, deterministas por celda de mundo
    como el pasto y el pedrero. No es adorno — un plano de color liso **no tiene escala**, y sin
    escala no se sabe si se está a diez metros o a cien. Los árboles son raros a propósito: en
    Malvinas casi no hay, y uno cada tanto le da tamaño al cerro sin volverlo un bosque que ahí no
    existiría.

### Del SEXTO playtest

41. **La cara de la ladera es TIERRA MARRÓN. Costó tres intentos, y los tres fallaron por la misma
    confusión.** El primero usó la paleta del acantilado suelto (`'cliff'`): se veía **gris**, y un
    cerro de Malvinas no es un farallón de piedra. El segundo la sacó de `theme.land` tal cual: se
    veía **verde**, porque esa paleta es la del PASTO — y el pasto crece ARRIBA. Lo que se ve de
    costado en un talud cortado es la tierra de abajo del pasto. El tercero calienta el tono más
    terroso del tema (`rock`) hacia el marrón (rojo ×1.18, verde ×0.88): **cara marrón, corona y
    meseta verdes**, que es la lectura correcta y la que da la sensación de cerro. Sigue
    respondiendo al clima; nunca se vuelve verde.
41b. **Y el tercer intento se vio NEGRO la primera vez, con el color bien calculado.** `tierra()`
    devolvía `rgb(...)` y `mez()` —que funde la ladera con la bruma— mezcla parseando hexadecimal:
    le llegaba `NaN` y pintaba negro. **El bug estaba en el formato, no en el tono**, y sólo se vio
    mirando la captura: los números impresos por consola eran marrones correctos.
42. **La línea vertical dura del fondo era el canto del dibujo.** El alfa arrancaba en `0.25` a los
    260 m, o sea que la ladera **aparecía de golpe al 25% de opacidad**. Ahora el fundido llega a
    cero y el color se lava hacia el horizonte: la ladera emerge de la bruma en vez de empezar en
    un filo. No hizo falta una capa de niebla nueva — la bruma ya estaba, lo que faltaba era que el
    alfa terminara en 0.

### Dos cosas AJENAS que aparecieron en el camino

43. **Con ACANTILADO, la cámara arrancaba dentro de la tierra**, y no es del callejón: se reproduce
    igual con el zigzag apagado (verificado con capturas de los dos casos). `resetPlane` nace al
    avión sobre la meseta (`PORT_H + 1.2` = 16,2 m) pero `reset()` clavaba `cam.y = 4`, **once
    metros por debajo del borde**. Como el ráster del mar decide "esto es pared de acantilado"
    comparando la altura de cámara contra la meseta, la pantalla entera se llenaba de roca y no se
    veía ni la pista. La cámara ahora arranca donde está el avión.
44. **`systems/agua3d.js` (del ítem del agua 3D, otra sesión) rompió el build del repo entero** con
    comillas invertidas dentro del template literal del shader — **la misma trampa que ese archivo
    ya se había comido una vez**. No se tocó: el parche llevaba `assert` sobre el texto original,
    el texto ya había cambiado cuando se fue a escribir, y el `assert` impidió pisar el arreglo que
    la otra sesión estaba haciendo en paralelo. Queda anotado como advertencia: **todo parcheo por
    script afirma su ancla**, y en un repo con dos sesiones esa regla deja de ser higiene y pasa a
    ser lo único que evita destruir trabajo ajeno.

### Del SÉPTIMO playtest, y de Z4

45. **La niebla del fondo NO puede ser opacidad baja.** Con el alfa cayendo a cero se veía **el
    cielo a través del cerro** — un cerro no es de vidrio. Es una diferencia conceptual, no de
    gusto: lo correcto es **niebla de distancia**, la ladera queda opaca de punta a punta y lo que
    se funde es su COLOR hacia el tono del horizonte. La silueta desaparece igual de suave (que era
    lo que se había ganado) pero nunca se ve nada por detrás. **El color sale de `theme.sky.horizon`
    y no de un blanco o un negro fijos**: es blanca de día, gris en tormenta y negra de noche, sin
    una perilla por clima. El pedido fue "blanca o negra"; esto es las dos, según la hora.
46. **La vegetación SÍ se desvanece con alfa, y está bien**: son motas de un píxel, y una mota
    tapada por niebla y una mota que no está se ven igual. Lo que no puede ser transparente es la
    MASA del cerro.

## Z4 — EL CALLEJÓN DE LAS BOMBAS, la misión *(construida)*

`data/missions.js`, m5, **cero código**: un campo `zigzag` con `amp: 0` (cámara quieta),
`desde: 0.33`, `hasta: 0.9` y paredes letales, más el reparto de tramos de §4. Verificado volando
los cuatro momentos (paso 10 del fixture):

| fracción | qué pasa | medido |
|---|---|---|
| 0 – 0.31 | el tránsito mudo del Narwal, sin tocar | pasillo abierto, sin laderas |
| 0.33 – 0.40 | **la boca**: el paisaje se cierra, densidad a la mitad | laderas de 23 m |
| 0.40 – 0.88 | **el callejón**: `favor: ['aa','aatruck']` y `bombs: 2` | laderas de 24 m |
| 0.88 – 1.0 | **la salida**: las laderas bajan y se abre la bahía | pasillo abierto, y el ARDENT a 161 m |

47. **`desde: 0.33` engancha justo después del silencio del Narwal**, que es la escena: el jugador
    sale del tramo mudo y se le cierra el paisaje encima. Y **`hasta: 0.9` abre la bahía ANTES del
    clímax** — el buque tiene que aparecer en mar abierto, no entre dos cerros.
48. **El fixture midió lo que no era, dos veces seguidas.** Primero barría 240 m por delante y decía
    que en el tránsito ya había callejón: no estaba equivocado del todo —a 760 m se **ve venir** la
    boca, que empieza en 858— pero lo que hay que afirmar es dónde el jugador **está**. Después midió
    las PUNTAS en una ventana corta y dio cero: las puntas son intermitentes por diseño (72% de las
    bandas), así que buscarlas en 60 m es tirar una moneda. Lo que define el callejón es **la
    ladera**, que está o no está — de ahí la sonda `__zzalto`.

### Del OCTAVO playtest *(tres detalles, y el peor era un bug de composición)*

49. **BUG: `mez()` devolvía `rgb(...)` y sólo sabía LEER hexadecimal, así que ANIDARLA daba NEGRO
    PURO.** El dibujo la anida —primero mezcla dos tonos de tierra, después el resultado con la
    niebla— y en la segunda vuelta le llegaba `"gb(54,38,29)"` a un `parseInt` hexadecimal: `NaN`,
    y `NaN | 0` es 0. El síntoma era desconcertante y por eso vale anotarlo: **el tercio del medio
    de la ladera se veía bien** (ese no anida) **y los otros dos negros**. Parecía un problema de
    niebla o de paleta. Los colores se calculaban perfectos — lo que estaba roto era el formato.
    **Se encontró midiendo píxeles del canvas, no mirando la pantalla**: la instrumentación mostró
    `niebla`, el color de niebla y los tonos, todos correctos, y recién ahí quedó claro que el
    problema estaba después del cálculo.
50. **La niebla iba al color del CIELO, y ese era el error de razonamiento detrás de la línea
    vertical.** La ladera se ve casi entera POR DEBAJO del horizonte —a 260 m su cresta asoma tres
    píxeles— así que lo que tiene detrás no es cielo: es el mar. Fundiéndola al gris claro del cielo,
    el cerro terminaba en (152,157,152) pegado a agua de (18,33,35): **un salto de 386**, o sea que
    la niebla no escondía el corte, lo delataba. Ahora se funde al color que el ráster del terreno
    usa en su fila más lejana (`theme.water.base0` / `theme.land.far`) y **el salto bajó a 6**: el
    corte es invisible por construcción, no por suerte.
51. **Las nubes del buque flotaban SOBRE el terreno**, y era orden de profundidad: el buque objetivo
    está a un kilómetro y las laderas dentro de los 260 m, así que los cerros tienen que taparlo a
    él y a los hongos de flak que lo rodean. `drawParedes()` se movió después de la aproximación al
    buque, y sigue antes del marcador de objetivo (información que no se puede tapar) y de los
    obstáculos (que viven adentro del carril, más cerca).
52. **Método, porque ya van tres veces.** Los tres bugs de este ítem que más costaron —el gris, el
    negro, la línea— tenían el mismo patrón: **la pantalla decía una cosa y los números otra**, y
    mirar la captura sólo alcanzaba para saber que algo estaba mal, nunca qué. Los tres se
    resolvieron **muestreando píxeles del canvas** (`getImageData`) y comparándolos con los valores
    que el código creía estar usando.

### Del NOVENO playtest *(el paisaje, antes de Z5)*

53. **Los cerros eran todos parecidos, y el problema no era el rango sino la ESCALA.** Con dos
    escalas de ruido (55 m y 7 m) las alturas ya variaban entre 12 y 29 m — pero como se ven quince
    bandas a la vez, el ojo promedia y la sierra se lee pareja. Se sumó una tercera escala, **el
    MACIZO** (~220 m): ahora hay tramos largos de lomas bajas y después una mole. Medido sobre 20 km:
    **de 9 a 40 m**, con estructura, no con dientes.
54. **La cara se texturó en vez de modelarse**, que fue la propuesta del autor y es la correcta para
    este motor: *"quizá texturas directamente en vez de algo realmente con cuerpo"*. Tres franjas
    planas dan volumen pero no dan MATERIA — la ladera se leía como cartulina doblada. Ahora lleva
    **manchones** de tierra más clara y más oscura, deterministas por banda de 9 m, que al volar
    pasan como vetas y afloramientos. Modelar relieve real habría sido más caro **y se habría visto
    peor**.

### Del DÉCIMO playtest *(y una afirmación mía que estaba mal)*

55. **Yo dije que modelar relieve "se vería peor", y lo dije sin haberlo probado.** El autor lo
    cuestionó y tenía razón. La causa real de que la ladera se viera plana no era la textura: era
    **geometría**. La cara se dibujaba perfectamente VERTICAL, y una cara vertical se lee como muro
    por mucha textura que se le ponga encima.
56. **La ladera es un TALUD: la cresta se retira hacia afuera** (`ZZ_PARED_PEND` 0.45 — un cerro de
    26 m tiene la cresta 12 m más afuera que el pie). Es la mejora que más hizo, y es una línea de
    geometría, no de dibujo: `paredCara()` la usan **el render y la colisión**, así que el talud que
    se ve es el que mata. **Y trae una regla de juego que sale gratis y es buena**: el callejón es
    angosto abajo y ancho arriba, así que volar a ras aprieta y trepar afloja, al precio del radar.
57. **El pie ondula** (`ZZ_PARED_ONDA` ±4,5 m, dos senos incommensurables como `shoreAt`). Era la
    otra mitad: la base de la ladera era una recta de tiralíneas a lo largo de cientos de metros.
58. **Estriación vertical**: cada columna del talud se aclara o se oscurece un poco según su
    posición de mundo, y como una columna **es** una franja vertical, salen las cárcavas y los
    regueros de una ladera erosionada. Los manchones que ya había son horizontales; con sólo esos
    la cara se leía "en capas".

### Del UNDÉCIMO playtest *(el agujero de la meseta)*

59. **Por el borde de la meseta se veía el mar**, y era un ancho fijo contra una perspectiva.
    `ZZ_MESETA_W` extendía la superficie 200 unidades hacia afuera: de sobra cerca, pero **a 180 m
    su borde exterior cae en la columna 425 de una pantalla de 480**, así que por esas 55 columnas
    asomaba el agua que se dibuja detrás. Se veía cerca del horizonte, hacia afuera, y sólo volando
    alto — o sea justo cuando la meseta aparece. Ahora el ancho **crece con la profundidad**, la
    misma cuenta que el `halfW` del pasto en `world.js`: cuánto mundo hay que barrer para tapar el
    ancho de pantalla a esa distancia. El fijo quedó como piso.
60. **Y se confirmó midiendo, no mirando.** La captura corregida todavía mostraba una banda
    azulada a media ladera que parecía otro agujero; el muestreo de píxeles dijo que **ningún punto
    tenía azul dominante** (`b > g`) — era el pasto de la meseta en sombra. Cuarta vez en este ítem
    que la pantalla sugiere una cosa y los números dicen otra.

### Del DUODÉCIMO playtest *(el corte de verdad)*

61. **El arreglo anterior (ancho de meseta adaptativo) atacaba el síntoma, no la causa.** El corte
    seguía: la ladera se dibujaba **sólo hasta 260 m**, y entre la última rebanada y la línea del
    horizonte quedaba una franja sin dibujar por donde se veía el mar. Un terreno tiene que
    recederse **hasta el punto de fuga**, igual que el agua. `ZZ_PARED_Z` pasó de 260 a **1200 m**,
    con paso adaptativo (crece con la distancia) para que las columnas lejanas no cuesten de más:
    allá todas pintan el mismo color de niebla igual.
62. **La niebla se separó de la distancia de dibujo** (`ZZ_NIEBLA_FULL`, 210 m absolutos). Antes era
    una fracción de `ZZ_PARED_Z`, así que estirar el dibujo hasta el horizonte habría estirado la
    niebla con él y el cerro lejano habría conservado color propio — o sea, la silueta recortada de
    vuelta. Son dos cosas distintas y ahora son dos perillas distintas.
63. **La meseta exige que la cámara esté sobre LAS DOS crestas del tramo**, no sólo sobre la de esta
    columna. El cuadrilátero usa la altura de esta y la de la anterior; con una arriba y otra abajo
    la proyección cruza el horizonte y el cuadro sale dado vuelta — una cuña enorme y plana tapando
    media pantalla, que es parte de lo que se veía "roto".
64. **Y los píxeles azules que quedaban eran el CIELO.** La sonda muestreaba desde `fy = 0.365`, que
    es justo la línea del horizonte, y en tormenta el cielo es gris azulado (`b > g`). El instrumento
    estaba mal calibrado, no el dibujo. Quinta vez en el ítem que conviene desconfiar de la primera
    lectura.

### Del DECIMOTERCER playtest *(el agujero de verdad, y dos errores míos seguidos)*

65. **El agujero estaba ENTRE LA CARA DEL ACANTILADO Y LA TIERRA DE ARRIBA**, y lo había abierto yo
    en la divergencia 63. Aquella condición —"dibujar la meseta sólo si la cámara está sobre LAS DOS
    crestas del tramo"— evitaba el cuadro dado vuelta a costa de **no dibujar nada** en los tramos
    de transición, con una cresta arriba y otra abajo. Ahí quedaba el hueco por donde se veía el mar.
    **Yo venía arreglando el horizonte y el problema estaba en la juntura.**
66. **La forma correcta no es saltear: es RECORTAR.** Una superficie horizontal que la cámara no
    alcanza a mirar por encima no desaparece — su borde se va al horizonte. Se recortan los cuatro
    vértices contra `HOR` y se dibuja **siempre**: con la cámara sobre la cresta sale la superficie
    normal, por debajo los cuatro vértices caen en el horizonte y el cuadrilátero queda de área cero
    (no pinta, y la cara tapa), y en la transición sale la cuña que llena el hueco.
67. **Dos errores más en el camino, los dos míos y los dos anotados porque son fáciles de repetir.**
    (a) Puse un `continue` para saltar el filo y la vegetación cuando la cámara está bajo la cresta:
    eso **también saltaba el dibujo de la cara**, que es lo único que no puede faltar nunca. Va como
    `if`. (b) Le puse al cuadrilátero una condición de "¿tiene altura?" comparando el borde exterior
    con la cresta — **están a la misma altura de mundo**, así que su `y` de pantalla es idéntica, la
    condición nunca se cumplía y la meseta desapareció entera. El alto del cuadrilátero sale de la
    diferencia de PROFUNDIDAD entre columnas, no del ancho hacia afuera.
68. **Y el detector de agujeros que escribí no servía**: contaba como agua el terreno lejano, que por
    diseño se pinta **del color del mar** (divergencia 50). Medir estaba bien; medir con un
    instrumento que confunde la solución con el problema, no.

### Del DECIMOCUARTO playtest *(el agujero, encontrado de verdad)*

69. **EL AGUJERO ERA MÍO Y LO ABRÍ CON LA PENDIENTE.** Al hacer que la cresta se retire hacia afuera
    (divergencia 56) cambié la proyección del borde superior, pero **los cuadriláteros de la cara
    siguieron dibujándose con la `x` DEL PIE de punta a punta**. Con el talud, el pie y la cresta no
    están en la misma columna de pantalla: la cara terminaba más adentro que donde arranca la
    meseta, y entre las dos quedaba una franja **sin pintar** por la que se veía el mundo de atrás.
    Ahora la `x` interpola junto con la `y` y cada franja es un trapecio inclinado hacia afuera,
    cuyo borde superior coincide exactamente con el de la meseta.
70. **Se encontró pintando la ladera de MAGENTA y la meseta de CIAN.** Cuatro intentos anteriores
    fallaron porque cada uno atacaba una hipótesis distinta —el ancho de la meseta, la distancia de
    dibujo, el color de la niebla, el recorte al horizonte— y todos "mejoraban" algo sin cerrar el
    agujero. Con dos colores imposibles, la franja sin pintar entre ellos fue evidente en la primera
    captura. **Cuando el síntoma se resiste, hay que dejar de razonar sobre el dibujo y hacer que el
    dibujo se delate.**
71. **Y el autor tenía razón en sospechar del método**: yo estaba probando en **m5** por `?mision=`
    y él jugaba **POR LA PATRIA** con el preset del menú. No era la causa del bug —está en el
    dibujo, no en el modo— pero sí de por qué mis capturas no lo mostraban tan claro: en m5 el cielo
    nublado y el mar sin lluvia disimulan la franja. Reproducirlo **por el camino del jugador** fue
    lo que lo puso a la vista.
72. **Para capturar dentro del callejón hay que apagar la letalidad, no la geometría.** Centrar el
    avión lo mata contra una punta y la cámara de la muerte queda DENTRO del cerro, que no sirve
    para juzgar el dibujo. Se inyecta el mismo trazado con `mata: false`: idéntico en forma y en
    color, y deja volar.

### Del DECIMOQUINTO playtest *(el hilo de la cresta)*

73. **La cresta llevaba DOS líneas dibujadas encima**: la CORONA (una franja de pasto en el filo) y
    el FILO (una segunda marca más clara). Dos marcas sobre el mismo borde no se leen como un borde:
    se leen como **un hilo pintado**. Se quitaron las dos. El borde no necesita marca — lo dice el
    cambio de verde (meseta) a marrón (cara), y donde no hay meseta porque la cresta está sobre la
    cámara, tampoco hay filo que marcar: hay cielo.
74. **La corona era geométricamente correcta y aun así estaba mal.** Es pasto sobre una loma
    cercana; cuando por detrás hay un cerro más alto, esa franja queda con marrón arriba y marrón
    abajo, y cruza la ladera como una línea. En esto manda el ojo, no la geometría.
75. **También se solaparon los polígonos vecinos** (`SOLAPE` 0,9 px). Dos cuadriláteros que comparten
    un borde exacto no se tocan en el píxel: el redondeo del rasterizado deja pasar el fondo por la
    juntura, y a lo largo de toda la cresta eso también se lee como un hilo. Es el remedio clásico y
    no cuesta nada.
76. **Y el autor tenía razón sobre por qué se me escapaba: "no te das cuenta porque volás a la
    altura del hilo".** Mis capturas caían siempre en la franja de alturas donde el artefacto queda
    de canto. Verificado ahora a **seis alturas distintas**, de 6 m (crestas sobre la cámara, sin
    meseta) a 40 m (mirando el campo desde arriba).
77. **Y dije "el hilo desapareció" antes de mirar.** No había desaparecido: lo que había arreglado
    era la costura de un píxel, no la línea verde. Afirmar el resultado antes de comprobarlo es el
    error que más veces se repitió en este ítem.

## Z5 — EL VESTIDO DEL CALLEJÓN *(construida)*

Las tres piezas que el plan dejaba como opcionales, y ninguna toca el núcleo.

- **ANTIAÉREOS EN LAS LADERAS.** En San Carlos estaban en las lomas. Sembrados en el agua —que es
  donde el sembrador los pone siempre— el callejón queda de decorado: el fuego sigue viniendo de
  donde venía en mar abierto y los cerros no participan. Ahora una parte (`ZZ_LADERA_P`, 55%) nace
  **arriba del cerro**, parada sobre la meseta. Medido volando: hasta **once a la vez**.
- **LA MANGUERA.** Los de la ladera tiran **de a tres seguidos** y después descansan
  (`ZZ_LADERA_RAFAGA`). Es la misma arma y el mismo dibujo — sólo cambia la cadencia — y tres
  trazadoras juntas cruzando el pasillo son una manguera, que es la imagen del lugar. **No hizo
  falta un sistema nuevo**: el fuego de tierra ya dibuja trazadoras.
- **LA RADIO DE LA BOCA Y DE LA SALIDA.** Dos líneas de Puma en los tramos de m5, puro dato: «AHÍ
  ESTÁ. LA BOCA DEL LOBO» al entrar y «SE ABRE. MAR ABIERTO ADELANTE — Y EL ARDENT ESPERANDO» al
  salir.

### Divergencias de Z5

78. **`enLadera` exime de dos reglas, y hay que decir por qué.** El tope contra el hueco del carril
    y el censo de enterrados miran la `x` y la altura del CERRO, no la del objeto: un cañón parado
    ARRIBA les parece enterrado. Sin la exención el tope los empujaba al agua. El censo sigue
    exigiendo **cero** enterrados para todo lo demás, y el fixture lo comprueba en la misma corrida.
79. **BUG: el recorte del carril seguro dejaba el callejón MUDO.** El intento de sembrar el
    antiaéreo de la ladera estaba *después* del `return` que saltea el ciclo cuando el canal está
    cerrado — y con puntas grandes el canal está cerrado muy seguido. Medido: **no nacía un solo
    antiaéreo, ni arriba ni en el agua**. Ahora se intenta ANTES del recorte, que además es lo
    correcto: el que está arriba del cerro no ocupa el canal.
80. **Y el fixture midió cero sobre un motor que ya andaba.** El bloque de Z5 corría justo después
    del de m5, que deja el vuelo al 95% — o sea **adentro del VEIL**, el cordón final donde el
    sembrador no siembra a propósito. Se vuelve a entrar a POR LA PATRIA. Es la enésima vez en este
    ítem que la prueba estaba mal parada, y por eso queda escrito en el propio fixture.

## Z6 — EL CERRO QUE RECORTA *(construida)*, y EL TELÓN *(construido y DESCARTADO)*

**EL CERRO RECORTA LO QUE TIENE DELANTE.** Los obstáculos se dibujan después de las paredes, o sea
siempre encima. Mientras todos vivían adentro del carril eso no se notaba: no hay roca que los
pueda tapar ahí. Un cañón parado ARRIBA del cerro rompe la suposición, y volando bajo se lo veía
**pintado en el medio de la cara de la montaña**. Ahora el dibujo del objeto lleva un TECHO en el
filo que le pasa por delante (`techoLadera`, que recorre la misma tira de columnas que pinta la
ladera) y sale cortado exactamente ahí. Medido barriendo el callejón entero desde el agua: **494
de 1800** asoman cortados, **1130** quedan tapados enteros, y **0** se tocan desde arriba de las
crestas.

### ⛔ EL TELÓN DE TIERRA: construido, jugado y SACADO

Se construyó una sierra continua cruzando todo el horizonte —dos capas, asomando 900 m antes,
con las laderas fundiéndose hacia ella en vez de hacia el mar— para tapar lo que en el playtest se
leía como que **la tierra se corta**: adentro del estrecho, las laderas se van al punto de fuga y
ahí, justo en el medio, el horizonte se abre al agua.

**Matías lo sacó en el playtest siguiente: el fondo lo va a resolver con una IMAGEN.** Y es la
decisión correcta — un horizonte de Malvinas pintado a mano gana por lejos contra tres senos, y el
juego ya tiene el mecanismo (`tbackImg`, el telón de clima). El código se fue entero: nada queda
apagado esperando. Lo que queda es el diagnóstico, que sigue valiendo para la imagen que venga: el
problema NO era que faltara relleno, era que **un estrecho entre cerros no tiene horizonte de mar
adelante**.

Las divergencias 83, 84 y 85 son de ese código y ya no hay dónde mirarlas. Quedan escritas igual:
la 84 (qué hay detrás de la punta lejana de una ladera) le va a volver a pasar a cualquier fondo
que se ponga ahí.

### Divergencias de Z6

81. **BUG: estuve midiendo contra un binario que no era el mío.** `src/index.html` carga
    `game.bundle.js`, y **`npm run zigzag` no reconstruye el bundle** (sí lo hacen `npm start` y
    `npm run check`). La prueba de oclusión daba **10 de 1800** y el diagnóstico decía que la
    geometría era marginal; con el bundle al día da **983**. Nada estaba mal salvo el metro. Es la
    trampa más cara de este ítem porque el fixture CORRE Y PASA sobre código viejo: no falla, miente.
    **Regla: `npm run build:game` antes de cualquier fixture que mida código recién tocado.**
82. **Las muestras de la línea de visión iban apiñadas cerca del objeto, por un razonamiento que la
    prueba desarmó.** Parecía que a un cañón sobre la cresta lo tapaba la loma justo anterior. No es
    así, y la geometría lo dice sola: un punto sobre la meseta, unos metros más afuera que el filo,
    **se ve** desde abajo — la visual sale con más pendiente que el talud y nunca lo cruza. Lo que
    de verdad los tapa son LAS PUNTAS, y ésas pueden estar en cualquier parte de la línea, incluso
    pegadas a la cámara. Se reparten parejo.
83. **BUG: mi propia niebla deshacía lo que el telón acababa de tapar.** El velo del pie arrancaba
    tres píxeles por encima del horizonte y ACLARABA esa franja: la prueba de píxeles contó **51
    columnas más claras que sin callejón**. Una niebla que destapa no es niebla, es una raya. Empieza
    en HOR-2.
84. **Con telón puesto, las laderas ya no se funden hacia el mar.** Lo que hay detrás de la punta
    lejana de una ladera dejó de ser agua: es la sierra. Fundiendo igual hacia el tono del mar, el
    cerro se aclaraba y quedaba **recortado contra la masa oscura de atrás** — exactamente el canto
    que la niebla vino a sacar, corrido de lugar.
85. **El perfil de la sierra tiene un PISO y no puede llegar a cero.** Si un valle del telón baja
    hasta el horizonte, ahí mismo reaparece el agujero: una muesca de mar abierto en el medio de un
    estrecho. La sierra puede tener valles; no puede tener puertas.

86. **BUG: la respuesta no era un booleano, era DÓNDE.** El primer arreglo contestaba por sí o
    por no —una línea de visión contra la roca, y el objeto se dibujaba o no—, y con eso un cañón
    al que la loma le tiene que tapar SOLO LOS PIES se dibujaba entero, montado encima del terreno.
    Es el mismo error de antes, más chico. Un obstáculo detrás de un cerro casi nunca está tapado
    del todo ni visible del todo: **asoma**. La línea de visión se fue entera (era una segunda
    verdad sobre lo mismo) y quedó el recorte, que además se calcula con la misma cuenta que pinta
    la ladera — si el filo que recorta y el filo que se ve salieran de dos cuentas distintas, el
    objeto se cortaría en una línea que no está en la pantalla, que es peor que no recortarlo.
87. **BUG mío, y clásico: `save`/`restore` NO guardan el camino.** El rectángulo del recorte quedaba
    de camino actual y el primer `stroke()` posterior que dibujara sin abrir el suyo lo arrastraba:
    una **línea vertical cruzando media pantalla**, que no tenía nada que ver con el callejón. Se
    cierra con un `beginPath()` a cada lado del dibujo.

88. **LA NIEBLA CREÍA QUE EL CERRO ERA CIELO.** Todo el dibujo del banco de bruma es POR FILAS, y
    la fila dice la profundidad: contra el horizonte se mira a lo largo de kilómetros de bruma, a
    los pies se la mira casi en vertical. Eso vale para el AGUA, que es un plano. Arriba del
    horizonte, en mar abierto, no hay plano: hay cielo, o sea infinito, y por eso el velo se pinta
    ahí **parejo y cerrado (0.95)**. Correcto sobre el mar, **falso adentro del callejón**: lo que
    hay arriba de la línea son las laderas, y están a treinta metros.

    Medido en la columna que cae sobre el cerro: **128..134 en veintiséis filas** — o sea plancha,
    la roca desaparecía entera. Y como abajo de la línea seguía graduándose, el ojo leía esa
    frontera entre "plano" y "degradado" como **una regla apoyada sobre el paisaje**, cruzando las
    dos laderas de lado a lado. No era un canto de dibujo: era el modelo equivocado.

    Ahora, adentro del cañón, la bruma arranca en el horizonte con el mismo valor que el agua de la
    fila de abajo —así no hay juntura— y **se abre hacia arriba**, que además es lo que pasa de
    verdad: mirando al cenit se atraviesan pocos metros de banco. Misma columna: **113..134**, o sea
    cerro. Entra y sale sola con la altura del avión y con la ventana del trazado (`canon()`), así
    que volando por encima de las crestas vuelve el cielo de siempre.
89. **La prueba de píxeles para esto era RUIDOSA y se fue.** Veintiséis filas arriba del horizonte
    puede haber cielo por encima de la cresta, no roca, así que el brillo de la columna no dice lo
    que uno supone: el primer intento afirmaba "lo más cerrado tiene que estar pegado al horizonte"
    y fallaba con razón. El segundo comparaba contra el mismo banco sin callejón y también, porque
    ahí la columna muestra el atardecer, que varía más que la roca con bruma. El perfil se sacó a
    `alfaCielo()` en `systems/fog.js` —puro, tres números normalizados— y se prueba en
    `npm run unit`, incluido el **cero exacto** con `Object.is` para mar abierto. Una prueba
    determinista de 0.05 ms contra una de veinte segundos que fallaba sola.

## Z7 — LA COSTA DE UN SOLO LADO *(construida)*

Pedido de playtest: que el modo pueda ser **de un solo costado** — costa o acantilado — en vez de
siempre un callejón. Ahora las paredes traen `lado: 'ambos' | 'izq' | 'der'`, y `'ambos'` es el
default, así que toda la data que ya existe significa exactamente lo mismo.

**No es medio callejón: es otra cosa de jugar.** En el callejón el pasillo está cerrado y el
trabajo es elegir por qué lado rodear cada promontorio. Con una costa sola, el mar de al lado es
una salida SIEMPRE disponible, así que la tensión no está en pasar sino en **cuánto te animás a
arrimarte a la tierra** —que es donde están los antiaéreos y el puntaje de rasante— antes de
abrirte. Es el estrecho contra la costa de la isla.

En el menú son dos valores más de la misma fila (COSTA IZQUIERDA / COSTA DERECHA), y `?zigzag=3|4`.

### Divergencias de Z7

90. **Una sola puerta, y ninguna rama nueva.** El lado ya viajaba como parámetro por `paredH`,
    `paredXAt`, `paredEntra`, `puestoLadera`, el recorte de los antiaéreos y la niebla del cañón,
    así que apagar un costado no necesitaba un camino nuevo en ningún lado: necesitaba que la
    altura de ese costado fuera **cero**, que es lo mismo que ya pasa fuera de la ventana del
    trazado. La colisión, la siembra, el dibujo y el recorte se enteraron solos.
91. **Con una sola costa, TODAS las puntas van ahí.** Dejando el sorteo 50/50, la mitad de las
    bandas pondría su promontorio en el lado que no existe y se perdería: el ritmo del callejón se
    partiría al medio sin que nada lo diga. Lo que se conserva es **una punta por banda** —que es
    la garantía de paso—, no que caiga cara o cruz.
92. **El lado abierto no es una pared lejos: NO es una pared.** `paredXAt` devolvía el borde de
    siempre para el costado apagado, y con eso el carril seguro y el tope de los que se mueven
    seguían creyendo que había roca a 46 — justo al filo de donde nace todo. El mar abierto quedaba
    recortado por un muro invisible. Ahora ese costado se manda fuera de todo tope.
93. **La garantía se prueba con `Object.is`, como el cero exacto del zigzag.** Un test barre miles
    de muestras comparando el trazado sin `lado` contra el mismo con `lado: 'ambos'`: altura y
    borde, los dos costados, muestra por muestra. Si algún día alguien "unifica" el camino nuevo
    con el viejo y corre un metro el callejón de m5, salta ahí.

### Lo que queda para el próximo playtest

- El **ritmo**: `ZZ_PUNTA_CADA` 190 m es una punta cada ~2,5 s a velocidad de crucero.
- El **arranque**: 700 m. ¿Entra a tiempo o se hace esperar?
- La **escalada**: 2600 m para llegar a dureza plena. ¿Llega tarde o temprano?
- La **densidad de la vegetación** de la meseta, que hoy sólo se ve pasando por encima.
- **m5 jugada de punta a punta**, que es lo único que este ítem todavía no tuvo: los cuatro
  momentos se verificaron por separado, pero nadie voló la misión entera de corrido.
- Si el callejón se siente bien en m5, **qué otras misiones lo piden**. El campo es dato: son tres
  líneas por misión.

---

## PROMPT para ejecutar *(pegar en una sesión nueva con Opus medio o alto)*

> Vas a implementar el PASILLO EN ZIGZAG de RASANTE: el carril que dobla, con paredes de montaña
> por mapa. Tu documento de trabajo es `docs/sistemas/PLAN_PASILLO_ZIGZAG.md` — leelo entero
> antes de escribir una línea, y antes de él `docs/ARQUITECTURA.md` (manda sobre el plan: si
> difieren, hacé lo que dice la arquitectura y anotá la diferencia en §10 del plan).
>
> El modelo es el **riel curvo** (§1, Modelo B): el carril NO se mueve en `x` absoluto; la cámara
> lo ve doblar por `bend(z)` en la proyección, el avión deriva hacia afuera en la curva y las
> paredes se dibujan por fila en el marco del carril. Si te encontrás tocando `FLY_X`, `SPAWN_X`
> o los carriles del sembrador para seguir el trazado, parás: es el modelo descartado.
>
> Reglas: una fase por vez (§7: Z0 → Z1 → Z2 → Z3 → Z4), y tras cada una `npm run check` y
> `npm run feel` verdes — `feel` **idéntico** al baseline (34 asserts; comparalo con
> `grep -E "✓|✗|FEEL:"`). **La regla suprema (§0.2): un mapa sin zigzag es byte a byte el de hoy**
> — Z1 lo demuestra con capturas comparadas por hash contra un baseline que grabás vos con el
> zigzag apagado ANTES de tocar `proj`. `npm run build:game` antes de cualquier prueba en Electron.
> Sondas y fixture del §5–§6, marcadas QUITAR, patrón `__trdbg`. Perillas de partida en §8.
> Lo que NO hacer, en §9, es contrato.
>
> **Z2 tiene gate**: al cerrarla, frená y mostrame POR LA PATRIA con `?zigzag=1` (capturas de la
> curva en los tres terrenos, `HZ_FIX` y `HZ_ALL`, y el número de deriva vs palanca) antes de
> construir las paredes. No arranques Z3 sin mi ok. Z5 no se hace en esta sesión.
>
> Cerrá cada fase con: el fixture verde, la lista de archivos tocados, y las divergencias en §10.
