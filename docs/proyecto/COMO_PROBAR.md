# CÓMO PROBAR — el catálogo de features y el plan del modo PRUEBAS

> **Qué es (16/8):** el relevamiento de TODO lo que el juego tiene hoy, con la forma MÁS
> CORTA de ver y probar cada cosa — y el plan del **modo PRUEBAS** (fila nueva del menú,
> debajo de JUEGO RÁPIDO) que convierte este catálogo en pantalla elegible.
>
> **El hallazgo del relevamiento:** la infraestructura de prueba YA EXISTE y es enorme —
> **11 fixtures npm** (`story pasada pulso caza persec romper agua tierra chancha misiones tramos`),
> **~80 sondas de consola** (`window.__*`) y **8 parámetros de URL**. Lo que falta no es
> maquinaria: es un MENÚ que la junte. El modo PRUEBAS es una interfaz sobre la capa de
> sondas, casi sin lógica nueva.

## 1. Las herramientas transversales *(sirven para todo)*

| herramienta | qué hace |
|---|---|
| `?qa` en la URL | acorta las misiones a un 6% — llegás al clímax en segundos |
| `?no3d` | fuerza el fallback 2D (el momentum viejo) |
| `?lang=en` | idioma |
| `window.__wjump(0.9)` | salta al 90% de la misión en curso |
| `?mision=<id>` · `__mision('m4')` | **una misión suelta**, con su clímax y su escuadrón, sin campaña alrededor (`&historia` la vuela con su guion). Es la puerta del SELECTOR DE MISIONES — ver [PLAN_MISIONES_FASES §1](PLAN_MISIONES_FASES.md) |
| `window.__misiones()` | la campaña listada (id, nombre, clímax): con esto un fixture no necesita su propia copia |
| `__trdbg()` · `__trset([...])` | **los TRAMOS**: qué tramo rige ahora con sus valores resueltos, e inyectar una lista al run en curso sin editar `missions.js`. `__trclear()`/`__trcount()` son el censo de siembra por tipo. Ver [SPEC_TRAMOS](../sistemas/SPEC_TRAMOS.md) |
| `npm run <fixture>` | corre la prueba automatizada de ese feature (lista arriba) |
| `npm run start` | el juego; consola de Electron para las sondas |
| `DEBUG_STATE=1` | loguea cada transición de estado |

## 2. EL CATÁLOGO — qué hay y cómo verlo YA

*(mode paths: **MENÚ** = pantalla de modos · **JR** = JUEGO RÁPIDO · tiempo estimado en
llegar a verlo)*

### A · Los modos (complejidad alta)

| feature | cómo probarlo hoy | llega en |
|---|---|---|
| **HISTORIA** (campaña + guion VN + banco del Pichón) | MENÚ → CAMPAÑA → nueva. Con `?qa` cada misión dura segundos | 1 min |
| **CICLO DE MUERTE** (misiones al azar completas) | JR → CICLO | 30 s |
| **POR LA PATRIA** (pasillo infinito) | JR → POR LA PATRIA | 20 s |
| **PERSECUCIÓN** (volar de numeral tras el líder) | JR → PERSECUCIÓN · sondas `__ps*` · `npm run persec` | 30 s |
| **MINUTOS SAGRADOS** (solo ARENA, batallas al azar) | JR → MINUTOS SAGRADOS | 30 s |
| **PASADAS MORTALES** (solo PASADA, arranca en la aproximación) | JR → PASADAS MORTALES | 30 s |

### B · Los clímax

| feature | cómo probarlo hoy | llega en |
|---|---|---|
| **PASADA** (corridas, bandas, ristra, sapito, defensa, rescate R3) | `?pasada=<n>` entra directo · sondas `__pdbg/__pset/__pdart/__pheat` · `npm run pasada` | 10 s |
| **ARENA** (vuelo libre 3D, zonas, flak) | JR → MINUTOS SAGRADOS · `__adbg/__aset/__akill` | 30 s |
| **EL PULSO** (QTE de destreza + cinemática) | `?pulso=<n>` (con `&pasillo` viniendo del vuelo) · `__qdbg/__qtap` · `npm run pulso` | 10 s |
| **MOMENTUM viejo** (fallback riel 2D) | cualquier misión de buque con `?no3d&qa` | 1 min |

### C · El vuelo y sus poderes

| feature | cómo probarlo hoy | llega en |
|---|---|---|
| El feel base (gas/gravedad, laterales, roce del agua, ×10 a ras) | JR → POR LA PATRIA y volar bajo · `npm run feel` mide los números | 20 s |
| **Turbo** (+vórtices de punta si están prendidos) | SHIFT/C en vuelo | 20 s |
| **Piruetas y combos** (tonel, break, jink…) | en vuelo: combos de flechas/AD (ver PIRUETAS.md); en HISTORIA solo las aprendidas | 30 s |
| **MOMENTUM** (cámara lenta cargable) | tecla **4** con la barra llena (se carga con puntos) · `__tcharge` la llena ya · `__tdbg` | 1 min |
| **LA CHANCHA** (el KC-130: reabastecimiento en vuelo) | tecla **5** en el pasillo con nafta baja · sondas `__cha*` (`__chacall`, `__chanafta`) · `npm run chancha` | 1–2 min |
| **AVERÍAS** (3 modelos de vida, en OPCIONES) | OPCIONES → fila de vida; comerse impactos de AA | 1 min |
| **Combustible** | OPCIONES → COMBUSTIBLE: SÍ; el indicador es el reloj | 1 min |
| **Relevo del escuadrón** (vidas) | morir con vidas restantes (AA es lo más rápido) — la cinemática del compañero | 1–2 min |
| Cámaras (4 niveles) / horizonte giratorio / miras | teclas **V** / **Q·E** / CAPS+mira en OPCIONES | 10 s |

### D · El combate y el mundo hostil

| feature | cómo probarlo hoy | llega en |
|---|---|---|
| Cañón / misil | X·ESPACIO / Z en vuelo | 10 s |
| **LA COLA** (el Harrier: presión → sobrepaso → ventana; arte propio jet_rear/jet_turn) | `?caza` lo fuerza · en PATRIA aparece tras cruzar jets frontales (el gate) · `__cz*` (`__czstart`) · `npm run caza` | 10 s con sonda |
| Enemigos (jet, helo, globo, AA, radar, fragata, lcu, aves) | POR LA PATRIA, aparecen por spawn; movilidad en OPCIONES → ENEMIGOS | 1–3 min |
| **LA DESTRUCCIÓN** (despiece por tipo, choque mutuo, cadenas, onda) | `__romper(tipo)` · `__cadena()` · `__chocar()` · `npm run romper` | 10 s con sonda |
| **LAS OLAS** (marejada/rompiente/rebelde) | `__ola('rebelde')` etc. · con clima: m9 (tormenta) · `npm run agua` | 10 s con sonda |
| Soldados (correr / cuerpo a tierra) | misiones de costa/tierra, volar bajo cerca | 2 min |

### E · El mundo, el clima y la narrativa

| feature | cómo probarlo hoy | llega en |
|---|---|---|
| Mar por clima / espuma / camino del sol | OPCIONES cambia cielo/agua; m9 = tormenta (`?qa` + CICLO hasta que toque, o consola `__seaclima`) | 1–3 min |
| **La tierra y la costa nuevas** (turba con relieve, rompiente) | m13 (tierra) o misiones de costa · `npm run tierra` · `__olacosta` | 1–3 min |
| Niebla (banco: velo/cubierta) / lluvia | misiones con `fog`/`rain` (m6, m9…) con `?qa` | 1–2 min |
| Fondos de clima (imágenes) | OPCIONES → FONDO | 30 s |
| **Historia VN** (tipeo, holds, retratos mock, placas) | `?scene=M07_LOCKER` (el fixture del locker) · `npm run story` | 10 s |
| Guion de campaña completo / banco del Pichón | CAMPAÑA con `?qa` — el epílogo + banco entre misiones · `__udbg` | 2 min |
| **UNA misión cualquiera, suelta** (su clima, su clímax, su escuadrón) | MENÚ → **MISIONES** · `?mision=m9` · `__mision('m9')` · `npm run misiones` las recorre todas | 15 s |
| Saves / pausa / récords / música / idioma | ESC en vuelo (pausa+save) · reproductor teclas 1/2 · **L** idioma | 30 s |

## 3. La brecha — lo que HOY exige consola o suerte *(la lista que justifica el modo PRUEBAS)*

1. **El relevo del escuadrón** a demanda (hay que morirse "bien").
2. **Las averías por nivel** (hay que comerse impactos justos).
3. **La ola rebelde / la tormenta** sin esperar a m9.
4. **LA CHANCHA con la nafta justa** (el momento dramático real).
5. **El Harrier en cada fase** (presión / sobrepaso / ventana) sin esperar el gate.
6. **Cada clima/misión directa** (m9 tormenta, m13 tierra, m14 noche) sin encadenar.
7. **Las cinemáticas del PULSO por zona** (hay que ganar cada variante).
8. **Las cadenas de destrucción** en contexto real (depósito entre carpas).
9. Todo lo anterior **sin ensuciar récords ni saves**.

## 4. EL MODO PRUEBAS — el plan

**La idea**: una fila **PRUEBAS** en el MENÚ principal, debajo de JUEGO RÁPIDO. Adentro,
un catálogo navegable de MOMENTOS (título + descripción de una línea): elegís uno y el
juego te pone EXACTAMENTE ahí, usando la capa de sondas que ya existe. ESC vuelve al
catálogo. Nada de lo que pase en PRUEBAS toca récords, saves ni desbloqueos.

| fase | entrega | criterio |
|---|---|---|
| ~~**PR0 · El catálogo en data**~~ ✅ | `data/pruebas.js`: `{ id, titulo, desc, setup }` por momento — `setup` invoca la MISMA capa de sondas/parámetros existente (nada de lógica duplicada). Flag global `testMode` | **HECHO (19/8): 20 momentos, 6 secciones.** El flag es `S.test` (`core/state.js`). Dos tests unitarios lo custodian: uno chequea la forma de la data, el otro corre cada `setup` contra una **api espía** y falla si un momento no llama a la capa de sondas — es la REGLA DE ORO vuelta aserción |
| ~~**PR1 · El menú**~~ ✅ | Fila PRUEBAS en `MODES` (patrón del submenú de JUEGO RÁPIDO / campmenu: lista + descripción + volver). Badge `PRUEBA` en el HUD mientras está activo | **HECHO (19/8).** Estado `'pruebas'`, fila entre JUEGO RÁPIDO y OPCIONES, lista con **ventana** (27 filas no entran) y marcas `^ n` / `v n`. El sello va **arriba al medio**: la esquina derecha la ocupa el reproductor. Verificado con sonda: se entra por flechas, se elige, se juega y ESC vuelve al catálogo, con un momento de cada familia (clímax, Harrier, destrucción, ola, escena VN) y sin errores de consola |
| **PR2 · Los momentos sin sonda** | Las sondas chicas que faltan para el §3: relevo a demanda (`__relevo()`), avería directa por nivel, ~~misión directa por id con su clima (`__mision('m9')`)~~ ✅, Chancha con nafta al 8%, Harrier por fase, PULSO por zona | los 9 puntos del §3 tienen su momento elegible |
| ~~**PR3 · La higiene**~~ ✅ | `testMode` bloquea: persistencia de récords, escritura de saves, desbloqueos y estadísticas. Verificado por fixture | **HECHO (19/8), por la fase S2 del selector**: `sinRastro()` en `game.js` corta el récord (ni en memoria), los saves y las mejoras. Las PREFERENCIAS (mira, ejes, idioma, silencio) siguen escribiéndose a propósito: son las filas de OPCIONES y bloquearlas haría que la tecla mintiera. Medido con el control al lado — muriendo con 123 puntos desde la herramienta el récord no se movió de 10; la misma muerte en POR LA PATRIA lo escribió |
| **PR4 · El guardián** | `npm run pruebas`: recorre el catálogo ENTERO por sonda y verifica que cada momento carga sin errores de consola y con el canvas vivo — **el catálogo se vuelve red de regresión de todos los features a la vez** | fixture verde en `check` (o aparte si tarda) |

> **`__mision` ya existe (19/8)**, y llegó por el otro lado: la fase S0 del
> [PLAN_MISIONES_FASES.md](PLAN_MISIONES_FASES.md), que construyó el **SELECTOR DE MISIONES** —
> una fila propia del menú, hermana de ésta. Las dos pantallas son la misma herramienta con dos
> catálogos: comparten `S.test` (sello + higiene), la variable `testBack` (a qué catálogo se
> vuelve) y la puerta `abrirMision()`. Dos consecuencias para este documento: **PR3 quedó hecha**
> (la higiene la escribió S2 y la verifica `npm run misiones`), y **un momento ya no encadena** —
> al terminar la misión de un momento se vuelve al catálogo en vez de sortear otra misión.

**Regla de oro**: PRUEBAS es una INTERFAZ sobre las sondas — si un momento necesita
lógica nueva, esa lógica nace como sonda (utilizable también por consola y fixtures) y
PRUEBAS solo la llama. Así el catálogo nunca diverge del juego real.

**Perilla de visibilidad**: `PRUEBAS` visible siempre en dev; para el build de Steam,
decidir si se oculta o se deja como galería de momentos (decisión de Matías, perilla en
`data/`).

## 5. Divergencias *(completar durante la implementación)*

**PR0 + PR1 (19/8)**

1. **Los títulos de los momentos NO van a `data/strings.js`.** Viven en `data/pruebas.js`, con el
   mismo criterio que los nombres de campaña (`data/campaigns.js`): son rótulos de una herramienta
   de autor, no texto del juego. El **marco** de la pantalla (título, ATRAS, el sello) sí está en
   los dos idiomas. Ahorra ~80 claves duplicadas que nadie iba a traducir.
2. **El flag se llama `S.test`**, no `testMode` suelto: `core/state.js` ya es el objeto que todo
   módulo importa, lo escribe un solo lugar (`game.js`, al entrar y salir del catálogo) y lo leen
   varios — que es exactamente la regla de la casa.
3. **El menú necesitó VENTANA.** Con 20 momentos + 6 encabezados + ATRAS son 27 filas y en 270 px
   entran seis. `drawRowMenu` ganó un `view` opcional (HISTORIA y JUEGO RÁPIDO siguen dibujando la
   lista entera) más las marcas `^ n` / `v n`: una lista con ventana y sin marcas **miente**.
4. **Todo momento arranca EN EL AIRE y con su misión cargada.** Es regla del modo, no de cada
   `setup`. Lo primero porque ningún momento vale tres segundos de carreteo y casi toda sonda del
   mundo necesita estar volando; lo segundo porque sin cargar misión los modos infinitos heredaban
   el `cfg` del momento anterior y la misma fila abría una escena distinta según lo que hubieras
   mirado antes (pasó: la ola rebelde apareció sobre un campo verde).
5. **LAS SONDAS PEGAJOSAS — el hallazgo de esta fase.** Varias sondas del repo son
   *interruptores*, no acciones: quedan puestas. Desde la consola está bien; desde un catálogo que
   salta de momento en momento es veneno. `__czcalma` deja el pasillo vacío **borrando `obstacles`
   cada cuadro**, y el momento siguiente —LA CADENA— aparecía sin un solo pedazo. Entrar y salir de
   un momento pasa ahora por `prbNeutro()`, que apaga todo lo que un momento pudo dejar prendido
   **llamando a las mismas sondas**. Cualquier sonda-interruptor nueva se anota en `PRB_NEUTRO`.
6. **`a.luego(t, fn)` no estaba en el plan y es imprescindible.** Casi ninguna sonda del mundo
   sirve antes de que haya mundo. Es lo único que el modo agrega al bucle (`prbTick`), y solo corre
   con `S.test` puesto.
7. **El §2 nombra misiones que no existen**: «m13 (tierra)» y «m14 (noche)». Hoy `MISSIONS` llega
   hasta m12; la tierra es **m11** (`terrain: 'land'`) y la noche, **m12**. El catálogo usa esas.
8. **Sondas nuevas** (nacen acá y sirven también en consola y fixtures, como manda la regla de oro):
   `__prb(id)` elige un momento por id —la puerta que va a usar el guardián de PR4— y `__prb()`
   lista el catálogo. `__pausedbg` ganó `modo`, `quick`, `prueba`, `test`, `t` y `tareas`; con eso
   **`tools/smoke.js` dejó de navegar el menú contando flechas** y ahora busca la fila por nombre.
   Agregar una fila al selector ya había roto el smoke dos veces (PERSECUCIÓN, y ahora PRUEBAS).
9. **`MODES` y la lista `opts` de `drawModeSelect` son la misma lista en dos lados.** Divergir no
   explota: el cursor se para en una fila y se dibuja otra. Pasó al agregar PRUEBAS y quedó
   anotado con una advertencia en los dos archivos.
