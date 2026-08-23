# PLAN — LO TRANSÓNICO: el vapor, el cono y la sensación de velocidad

> **Estado: IMPLEMENTADO (V0–V5, 18/8/2026).** Se prueba con `?pulso`-style: volá con turbo
> sostenido, o forzá la velocidad con la sonda `__mset(spd, bank)`. Perilla en OPCIONES:
> **TRANSÓNICO — no / solo vapor / vapor + cono**.
>
> Pedido original: Pedido de Matías (18/8): el efecto de barrera del sonido
> alrededor del avión del jugador mientras sostiene el turbo. **La idea es generar
> SENSACIÓN DE VELOCIDAD** — ese es el criterio con el que se juzga todo lo de acá.
>
> Leer antes: `docs/ARQUITECTURA.md` (manda) · `VELOCIDAD_MACH.md` (el modelo de velocidad
> y Mach del que sale el disparador) · trampas del repo en `SPEC_AGUA_OLAS.md` §1.

## 1. Qué es de verdad, y qué licencia se toma

Lo que la gente llama "romper la barrera del sonido" en las fotos **no es el estampido**
(el estampido es sonido, no se ve): es la **nube de Prandtl–Glauert**, condensación que
aparece cuando una caída local de presión y temperatura enfría aire **húmedo**. Tres
consecuencias que gobiernan el diseño:

1. **No marca el instante de cruzar Mach 1.** Aparece en régimen **transónico** (~M 0,8–1,05+).
   Se puede tener el cono sin ser supersónico, y ser supersónico sin tenerlo.
2. **Necesita aire húmedo**, por eso las fotos icónicas son bajas y **sobre el mar**. El
   Atlántico Sur es exactamente ese aire: acá el efecto está en su casa.
3. **Es inestable.** Se forma, se aprieta, revienta y se rehace. No es una calcomanía fija.

### La licencia, escrita y asumida *(decisión de Matías, 18/8)*

El **A-4 Skyhawk real tope Mach 0,91 y no tiene postquemador** — los J65/J52 son turborreactores
sin reheat. Un cono alrededor de un A-4 es falso, y el "turbo" del juego ya lo era.

**Se aplica igual, en todos los aviones.** El motivo no es un descuido: el modelo de velocidad
del juego **ya se fue de la historia por un margen mucho mayor** — con los escalones de
afterburner el techo es `280 + 5×42 = 490` unidades = **2.058 km/h = Mach 1,68 a nivel del mar**
(`core/physics.js`). Habiendo cruzado esa vara, negarle el efecto al avión protagonista sería
coherencia mal puesta: el costo histórico ya se pagó, y lo que se compra con él es lo único que
importa acá — que ir rápido **se sienta**.

Queda anotado como lo que es: **licencia deliberada, no dato**. Si en pantalla no convence, se
apaga por perilla (§6) sin tocar código.

## 2. Los dos efectos

**No es uno, son dos**, y conviene no confundirlos porque tienen disparadores distintos:

| | **VAPOR DE ALA** | **EL CONO** |
|---|---|---|
| qué es | vapor sobre el extradós al cargar G | la nube de Prandtl–Glauert envolviendo el fuselaje |
| cuándo | virando fuerte a alta velocidad | régimen transónico sostenido |
| ¿verídico en el A-4? | **sí, totalmente** | no — licencia (§1) |
| qué comunica | "estás exprimiendo el avión en el viraje" | "estás en el techo de tu avión" |

El primero es el de todos los días; el segundo es el premio. Que existan los dos es lo que
evita que el cono se lea como un adorno pegado: hay una escalera de vapor, y el cono es su
último escalón.

## 3. El disparador

Todo sale del **Mach a nivel del mar**, que es donde se juega RASANTE (0–68 m):

```
mach = run.spd × KMH_U / A_MAR
```

`KMH_U = 4.2` (el mismo factor del HUD, `render/hud.js`) · **`A_MAR = 1200 km/h`**.

> **Por qué 1200 y no 1225.** El número de manual (1225 km/h) es a **15 °C**. El aire sobre el
> Atlántico Sur en mayo está cerca de **5 °C**, y ahí el sonido viaja a ~1.191 km/h. Se redondea
> a 1200: es el dato correcto para el mar donde pasa este juego, y de paso baja un pelo la vara.

Con eso, y las velocidades reales del juego (`speedTarget`):

| situación | `run.spd` | km/h | Mach |
|---|---|---|---|
| crucero con racha, sin turbo | ~240 | 1.008 | 0,84 |
| turbo sostenido, sin escalones | ~280 | 1.176 | 0,98 |
| turbo + escalón 3 | ~406 | 1.705 | 1,42 |
| turbo + escalón 5 (techo) | 490 | 2.058 | 1,72 |

**Umbrales elegidos**: vapor de ala desde **M 0,80** (se ve seguido, sin turbo) · cono desde
**M 0,95** (pide turbo) · cono pleno en **M 1,05**. O sea: el cono es *exactamente* la
recompensa de sostener el turbo, que es lo que se pidió.

## 4. Etapas

| etapa | entrega | criterio de cierre |
|---|---|---|
| ~~**V0**~~ ✅ · El número | `machNow()` puro en `core/mach.js` + perillas en `data/tuning.js` + sonda `__mdbg()`. Cero cambio visual | unit test: los umbrales caen donde dice §3; `check` verde |
| ~~**V1**~~ ✅ · El vapor de ala | Vapor sobre la raíz del ala al cargar G a alta velocidad. Todos los aviones. Nace y muere con el viraje | se ve virando a fondo y NO se ve en vuelo recto |
| ~~**V2**~~ ✅ · El cono | La nube envolviendo el fuselaje en régimen transónico con turbo. **RESPIRA**: se forma, se aprieta, revienta y se rehace — no es una calcomanía | aparece sosteniendo turbo y desaparece al soltarlo; captura |
| ~~**V3**~~ ✅ · El cruce | El instante en que se forma: fogonazo corto sobre el cono, **líneas de velocidad** que rayan el cuadro, sacudón y sonido. Es el pago de "sensación de velocidad" | el cruce se siente distinto de estar en régimen |
| ~~**V4**~~ ✅ · Los vórtices de punta | Reencender `tipTrail` (ya construida y medida, apagada en `e8ccbd1`) atada al **régimen**, no al turbo crudo — que es por qué no convencía: aparecía con cualquier turbo a cualquier velocidad | los hilos salen solo cuando el vapor tiene sentido |
| ~~**V5**~~ ✅ · Perilla y gate | Fila en OPCIONES para apagarlo, fixture `npm run mach`, `check` verde con web | se puede apagar sin tocar código |

## 5. Qué NO hacer

1. **No tocar la física.** Esto es 100% presentación: `npm run feel` da **idéntico** en todas
   las etapas. Nada de acá cambia `run.spd`, la letalidad ni el control.
2. **Nada de `Math.random()` por cuadro para el patrón** (trampa §1.3 del repo): el vapor
   parpadearía como nieve. Los patrones son deterministas por senos, como `drawSeaDots`.
3. **No un temporizador ciego.** El cono no late "cada X segundos": late porque el régimen es
   inestable. El pulso sale del Mach y de la G, no de un reloj — si no, se lee como un parpadeo.
4. **No tapar el avión.** El cono va DETRÁS del sprite y el vapor por delante del ala pero con
   alpha bajo: si hay que elegir entre el efecto y ver el avión, gana el avión.
5. **No romper el presupuesto**: se dibuja con formas, no con partículas nuevas. El cap de
   partículas de `PARTS_MAX` no se toca.

## 6. Perillas

En `data/tuning.js`, bloque `— LO TRANSÓNICO —`: `A_MAR 1200` · `M_VAPOR 0.80` ·
`M_CONO 0.95` · `M_CONO_FULL 1.05` · `CONO_HZ` (respiración) · `VAPOR_G` (G mínima).
Más `cfg.mach` en OPCIONES: **on / solo vapor / off** — la salida honesta si no convence.

## 7. Divergencias *(completar durante la implementación — con el baseline de `feel`)*

**Baseline de `npm run feel` (antes de V0):** 33 asserts, `FEEL: OK`.

### Divergencias

1. **`A_MAR = 1200` y no 1225.** Los 1225 del manual son a 15 °C; el aire del Atlántico Sur en
   mayo anda por los 5 °C y ahí el sonido viaja a ~1.191 km/h. Es el número correcto **para el
   mar de este juego**, y de paso baja un pelo la vara del efecto.
2. **La sonda `__mset` va ENTRE `update()` y `draw()`.** Puesta en el prelude, la física se la
   lleva por delante en el mismo cuadro: `speedTarget` devuelve la velocidad verdadera y `run.spd`
   vuelve sola — medido, pedía 240 y el HUD marcaba **118**. Sin este detalle no hay forma de
   comparar el efecto a dos velocidades.
3. **`run.dtReal` es nuevo.** El cruce tiene reloj propio de **pared**: es algo que le pasa a la
   cámara, no al mundo, así que no se dilata con el MOMENTUM ni con EL PULSO. Si usara el `dt`
   del mundo, en cámara lenta el golpe dejaría de ser un golpe.
4. **El cono se achicó a la mitad respecto del primer intento** (`0.52+0.30` → `0.34+0.18`, y la
   pared del gradiente de 62–100% a 72–96%). Como salió primero era una **burbuja gris del ancho
   de media pantalla**: se leía como un halo, no como aire condensado pegado al avión.
5. **El vapor de ala se duplicó en tamaño** (`0.05`/`0.020` → `0.11`/`0.032` de `spW`/`spH`). A la
   medida original eran motas y a 480×270 no se leían.
6. **V4 llegó hecho de otra sesión, y con MEJOR disparador que el de este plan.** El plan proponía
   atar los vórtices al régimen (Mach); el trabajo existente los ató a la **maniobra** (`run.mv`
   o `rollT`, con el turbo dando una versión más floja). Es más correcto físicamente: el vórtice de
   punta sale de la **carga del ala**, o sea de la G, no del número Mach. **No se tocó.**
7. **La licencia del cono en el A-4 queda registrada en el código**, no solo acá: `cfg.mach` tiene
   el escalón intermedio `'vapor'` justo para poder jugar **solo con lo verídico** sin perder el
   efecto entero. Es la salida honesta si el cono no convence.
