# SPEC — El agua y las olas · plan ejecutable en fases

> **Audiencia: una IA implementadora con esfuerzo MEDIO, en sesión nueva y sin contexto de
> chat.** Por eso este spec es más prescriptivo que los otros del repo: fases chicas de una
> sola preocupación, archivos y funciones nombrados, fórmulas de partida dadas, y CERO
> decisiones abiertas — todo default está elegido. Si algo no coincide con el código real,
> **manda `docs/ARQUITECTURA.md`**: adaptarse y anotar la diferencia en §9.
>
> El QUÉ y el PORQUÉ viven en [PLAN_AGUA_OLAS.md](PLAN_AGUA_OLAS.md) (leerlo entero antes:
> §0 el mapa del agua actual, §0b lo que ya estaba propuesto o hecho — para no duplicar).
>
> **Antes de tocar código, leer en este orden:**
> 1. `docs/ARQUITECTURA.md` — convenciones (¡y los DOS espacios de coordenadas!).
> 2. `docs/sistemas/PLAN_AGUA_OLAS.md` — el plan que este spec ejecuta.
> 3. `src/render/world.js` — `seaH()`, `drawSeaDots()`, `drawWake()` (el agua actual).
> 4. `src/systems/spawn.js` (rama de agua) y `src/systems/collision.js` (cómo resuelven
>    los obstáculos y cómo devuelven `{ death }`).

## 0. Workflow (obligatorio)

1. **Una fase por vez, en orden** (§5). No arrancar la siguiente sin cerrar la anterior.
2. Tras cada fase: `npm run check` completo + el fixture (§4) desde que exista (F1).
   Verde o no se avanza.
3. `npm run feel` tiene que dar **los mismos números que antes de empezar** en TODAS las
   fases: este spec no toca la física (`core/physics.js` y `waveNow()` son intocables).
4. Anotar toda divergencia en §9. No preguntar: decidir con el default y anotar.
5. Los modos y specs ajenos (HISTORIA, PASADA, ARENA, MINUTOS SAGRADOS) no se tocan.

## 1. Trampas conocidas de ESTE repo *(errores ya cometidos una vez — no repetirlos)*

1. **Editás módulos, NUNCA `src/game.bundle.js`** — y antes de probar en Electron hay que
   `npm run build:game`, porque Electron carga el bundle. Probar con bundle viejo ya hizo
   perder horas en este proyecto (síntoma: tu cambio "no hace nada").
2. **Todo fx nuevo lleva `life` mayor que su tiempo de uso**: el filtro genérico
   `life > 0` destruye en el mismo frame lo que nace sin `life` (bug real del flak).
3. **Nada de `Math.random()` por frame para patrones visuales** — produce flicker. Los
   patrones son deterministas por celda con hash de senos, como los destellos de
   `drawSeaDots` y las motas de `drawWake`.
4. **Dos espacios de coordenadas**: el mundo es 480×270 (`W/H` de `render/ctx.js`); el HUD
   y las pantallas razonan en 320×180 (`DW/DH`). Todo lo de este spec es espacio MUNDO,
   salvo la sal en el parabrisas de F3 (overlay de cabina).
5. **Stores compartidos se MUTAN, no se reasignan** (`obstacles.push(...)` sí;
   `obstacles = []` jamás — usar `prune`/`clearWorld`). Lo vigila `npm run lint:state`.
6. **Los sistemas devuelven señales** (`{ death: 'death_sea' }`), nunca llaman a
   `die()`/`setState` — el orquestador de `game.js` decide.
7. **Textos por `data/strings.js`** (es + en; `en` vacío cae a `es`). Nada hardcodeado.
8. **Sondas de prueba** marcadas `QUITAR` (patrón de `__adbg`/`__aset` en
   `systems/arena.js`).
9. Las filas del raster de mar/suelo se pintan con `rowH`, no con 1px (costuras).

## 2. Cimiento común — las perillas *(crear en F0, valores finales)*

Todas en `data/tuning.js`, bloque nuevo `— EL AGUA Y LAS OLAS —`, un comentario por línea:

```js
// olas-obstáculo
export const OLA_H = { marejada: 3.0, rompiente: 5.0, rebelde: 8.0 };  // altura de cresta
export const OLA_WZ = 6;            // espesor del bulto en z (sigma de la gaussiana)
export const OLA_SPD = 14;          // velocidad propia hacia el jugador (se suma a la relativa)
export const OLA_GAP_MIN = 350;     // distancia mínima entre olas vivas
export const OLA_FACE_KILL = 0.55;  // fracción de la altura que es cara letal; encima, cresta = roce
export const OLA_SCRAPE_FRAC = 0.45;// cuánto margen de roce consume un cepillado de cresta
export const OLA_RATE = { calm: 0, breeze: 0.04, storm: 0.12 };  // prob. en la rama de agua del spawn
// espuma / viento (F2)
export const SEA_FOAM_TH = { calm: 0.88, breeze: 0.78, storm: 0.62 };  // umbral de cresta con espuma
export const SEA_WIND_AMP = 0.45;   // término direccional de viento en seaH
// camino del sol (F6)
export const SUN_GLINT_HALF = 26;   // semiancho del cono de destellos (unidades de mundo en x)
```

Regla de clima (usar SIEMPRE la misma): `calm` si la misión no tiene viento; `breeze` con
`wind` y sin lluvia; `storm` con `rain ≥ 1` o cielo `storm`. Resolver UNA vez donde se
aplica el cfg de misión y guardarlo (no re-derivarlo en el loop de puntos).

## 3. F0 — El cimiento: `core/sea.js` *(cero cambio visual)*

**Objetivo:** una sola fuente de verdad de la superficie, importable por render Y sistemas.

1. Crear `src/core/sea.js` (PURO: sin canvas, sin stores — como `core/physics.js`):
   - Mover ahí `seaH(wx, wz)` desde `render/world.js` (el cuerpo EXACTO, sin cambiar un
     coeficiente — nota: hoy recibe `run.t` implícito; al moverla, pasar `t` como
     parámetro: `seaH(wx, wz, t)` y que `world.js` la llame con `run.t`).
   - Crear `olaBump(o, wxRel, dzRel)` — la loma de una ola-obstáculo (referencia):
     ```js
     // dzRel = distancia en z entre el punto muestreado y la cresta de la ola
     // wxRel = posicion x del punto relativa al centro de la ola
     export function olaBump(o, wxRel, dzRel) {
       const gz = Math.exp(-(dzRel * dzRel) / (2 * OLA_WZ * OLA_WZ));
       let px2 = 1;                                        // ancho completo (marejada/rebelde)
       if (o.hw) px2 = Math.exp(-(wxRel * wxRel) / (2 * o.hw * o.hw));   // parcial (rompiente)
       if (o.gapW) px2 *= 1 - Math.exp(-((wxRel - o.gapX) ** 2) / (2 * o.gapW * o.gapW)); // brecha
       return o.h * gz * px2;
     }
     ```
   - `seaHTotal(wx, wz, t, olasVivas, dv)` = `seaH` + Σ `olaBump` (olasVivas es un array
     chico que arma el llamador UNA vez por frame — nunca filtrar `obstacles` por punto).
2. `render/world.js` importa de `core/sea.js` y todo sigue idéntico.
3. Agregar el bloque de perillas de §2 a `data/tuning.js`.

**Cierre:** `npm run check` verde; captura antes/después del mar idénticas a ojo;
`npm run feel` idéntico.

## 4. La sonda y el fixture *(se crean en F1, crecen con cada fase)*

- **`window.__ola(tipo)`** (en `systems/spawn.js` o donde viva el spawn manual, marcada
  QUITAR): inyecta una ola `'marejada' | 'rompiente' | 'rebelde'` a `SPAWN_Z` ignorando
  `OLA_RATE` y `OLA_GAP_MIN`. **`window.__seadbg()`**: JSON con la ola viva más cercana
  (`tipo, z, h`), `plane.y`, `run.scrapeT` y el clima resuelto.
- **`tools/fixture_agua.js`** + script npm **`agua`** (calcar el patrón de
  `tools/fixture_story.js`: Electron, sonda, capturas opcionales `AGUA_SHOTS=<dir>`).
  Entra a POR LA PATRIA con `?qa` y verifica:
  1. sin sonda, en m1 (calm) NO aparece ninguna ola en 60 s;
  2. `__ola('marejada')` + gas sostenido antes del cruce → se salta y se sobrevive;
  3. `__ola('marejada')` + quedarse a ras → `death_sea`;
  4. `__ola('marejada')` + cruzar A LA ALTURA DE LA CRESTA (colocar con `plane.y`) →
     `run.scrapeT` sube, NO hay muerte inmediata, y hay spray;
  5. dos `__ola` seguidas → la segunda respeta `OLA_GAP_MIN` (o se rechaza);
  6. `__ola('rompiente')` (desde F4): esquive lateral por el lado libre sobrevive a ras;
  7. `__ola('rebelde')` (desde F7): aparece el aviso de radio con roster lleno; con
     roster 1 no aparece;
  8. cero errores de consola en todo el recorrido.

## 5. Las fases

### F1 · La marejada — la ola mínima jugable *(= O1 del plan)*

1. **Spawn** (`systems/spawn.js`, rama de agua): con probabilidad `OLA_RATE[clima]` y
   respetando `OLA_GAP_MIN` contra otras olas vivas:
   `{ type:'ola', kind:'marejada', h:OLA_H.marejada, z:SPAWN_Z, done:false, ph }`.
   Variante con brecha (50%): sumar `gapX` (uniforme en el carril) y `gapW: 9`.
   En m1 y misiones sin viento no sale nunca (`OLA_RATE.calm = 0`).
2. **Movimiento propio**: localizar dónde se aplica el movimiento de los obstáculos
   móviles (`mov()` — helo/jet/balloon) y sumar la rama: `o.z -= OLA_SPD * dt`.
3. **Render** (`drawSeaDots`): armar `olasVivas` UNA vez por frame (tipo `'ola'`, con
   `|dv + o.z − wz| < OLA_WZ*3` como ventana); usar `seaHTotal`. Donde el bulto aporta
   más de `0.6*o.h`: motas de espuma extra (determinista, trampa §1.3) y el color `crest`.
   La cara (lado cámara del bulto) una banda más oscura (`deep`) — la ola se lee como
   PARED que viene, no como textura.
4. **Colisión** (`systems/collision.js`, mismo lugar donde los demás tipos se resuelven al
   cruzar el plano del avión): al cruzar una `'ola'` no-`done`:
   - `plane.y < o.h * OLA_FACE_KILL` (menos la brecha, si el avión pasa por ella) →
     `{ death: 'death_sea' }`;
   - `plane.y < o.h + 1.2` → CRESTA: `run.scrapeT += scrapeLimit(run.spd, run.boost) *
     OLA_SCRAPE_FRAC` (importar `scrapeLimit` de `core/physics.js`); si `scrapeT` superó
     el límite → `{ death: 'death_sea' }`; si no: spray + `run.shake` breve, y sigue;
   - más arriba: pasó limpio, nada.
5. Sonda `__ola`/`__seadbg` + `tools/fixture_agua.js` + script `agua` (§4, pasos 1–5, 8).

**Cierre:** fixture verde + jugarlo: la ola tiene que verse venir desde lejos SIEMPRE
(si no se telegrafía, subir contraste de espuma antes de seguir).

### F2 · Espuma y viento *(= A1)*

1. En `drawSeaDots`: crestas con `hn > SEA_FOAM_TH[clima]` ganan mota de espuma
   persistente (color `spark`, determinista).
2. `seaH` (en `core/sea.js`) gana un término direccional OPCIONAL de viento (amplitud
   `SEA_WIND_AMP * (clima === 'storm' ? 1.6 : 1)`, fase que avanza con `t` en la dirección
   del viento de la misión). En `calm`, término = 0 → **el mar de m1 queda idéntico**.
3. En `storm`: vetas de espuma alineadas con el viento (bandas de probabilidad de mota
   moduladas por `sin(wx*k1 + wz*k2)` fijo — spindrift).

**Cierre:** 3 capturas (calm/breeze/storm) distinguibles de un vistazo; `feel` intacto
(el término de viento vive en el RENDER; `waveNow()` del vuelo no se toca).

### F3 · El avión toca el agua *(= A3 — la banda del ×10 se siente)*

La rociada bajo el fuselaje YA EXISTE (no duplicarla — ver PLAN §0b):
1. A ras (≤4.5) sobre agua: **cortinas de punta de ala** — spray corto desde ambas puntas
   (reusar el camino de `stepSpray` de `render/rain.js`; si hace falta fx propio,
   trampa §1.2). Más denso con turbo.
2. Durante roce (`run.scrapeT > 0`): erupción de espuma continua en la posición del avión.
3. **Sal en el parabrisas**: al salir de un roce o de una cresta de ola, 6–10 gotitas
   estáticas sobre la vista 1ª persona que se desvanecen en ~1.5 s. Va en el overlay de
   cabina (espacio y módulo de la cabina — hoy `render/momentum.js`/`render/arena.js`);
   en 3ª persona no se dibuja.
4. La estela (`drawWake`) gana ancho y blancura con `run.boost`.

**Cierre:** captura a ras con turbo (cortinas + estela ancha) y captura tras roce en 1ª
persona (sal). Smoke verde (el canvas sigue cambiando).

### F4 · La rompiente *(= O2)*

1. Spawn variante: `kind:'rompiente'`, `h:OLA_H.rompiente`, `hw: 22` (parcial), centrada
   en un carril; SIN brecha (el hueco ES el resto del ancho).
2. **Se rompe**: cuando `o.z < 60`, la cresta "se enrula": las motas de espuma de la
   cresta caen hacia adelante (offset en z que crece con `run.t - o.breakT`) + un burst
   de spray único al empezar (`o.breakT` se setea una vez).
3. **Rumble**: sonido grave que crece al acercarse (procedural con el `boom()` de
   `systems/audio.js`, ganancia por distancia, cadencia baja — no un loop nuevo).
4. Fixture paso 6.

**Cierre:** a 400+ de distancia se distingue marejada de rompiente sin leer nada
(captura comparativa).

### F5 · Un agua por clima *(= A4 — pura data)*

1. `data/palette.js` → `WATER_STYLES` suma (valores de partida, ajustables a ojo):
   - `storm`: `{ base0:'#151d1c', base1:'#1c2624', base2:'#25302c', deep:'#41564e', mid:'#6f8a7a', crest:'#b8c9bd', spark:'#eef4ee' }`
   - `night`: `{ base0:'#0a0f16', base1:'#101823', base2:'#16202e', deep:'#2a3a52', mid:'#4a5f80', crest:'#8ba0bd', spark:'#dfe9f5' }`
   - `sun`: `{ base0:'#0e2a30', base1:'#144049', base2:'#1b5560', deep:'#2a7a80', mid:'#4aada8', crest:'#9fdcd2', spark:'#f2fffa' }`
   - `dawn`: `{ base0:'#1d1a18', base1:'#2a2320', base2:'#3a2e26', deep:'#5c4632', mid:'#8f6b45', crest:'#d8a86a', spark:'#ffe9c2' }`
2. `render/theme.js` → `applyTheme`: si `cfg.water === 'auto'` (nuevo default), mapear
   cielo→agua: `storm/cloudy→storm`, `night/moon→night`, `sun/clear→sun`,
   `dawn/dusk→dawn`, resto→`sea`. La perilla AGUA de OPCIONES (`OPT_ROWS` en `game.js`)
   suma la opción AUTO primera; elegir un estilo a mano sigue mandando.

**Cierre:** 4 capturas (una por cielo) con su agua; cambiar la perilla a mano pisa el auto.

### F6 · El camino del sol *(= A2)*

En `drawSeaDots`, para cielos con astro (`sun/clear/dawn/moon`): dentro del cono
`|wx − cam.x| < SUN_GLINT_HALF * (camZ/F)` multiplicar ×4 la probabilidad y el alfa de los
destellos de cresta (el mecanismo de sparks ya existe — solo se modula). En
`storm/cloudy/dusk/night` sin astro: nada.

**Cierre:** captura en `sun` y en `moon` con la columna de luz; en `storm`, ausente.

### F7 · La ola rebelde *(= O3)*

1. Solo con clima `storm`: `kind:'rebelde'`, `h:OLA_H.rebelde`, ancho completo SIN brecha,
   máximo 1 viva, nunca antes de los primeros 400 m de la corrida.
2. **Aviso por radio** al aparecer: popup con `T('ola_call')` ("¡Pared de agua adelante!",
   + en) SOLO si hay más de un Fiel activo (mirar cómo el juego consulta el roster vivo —
   la regla humana: sin escuadrón no hay ojos). Con aviso o sin él, la ola SIEMPRE se ve
   desde `SPAWN_Z`: el aviso es ventaja, no requisito de justicia.
3. Sal en el parabrisas garantizada al pasarla a menos de 2 de la cresta (reusar F3.3).
4. Fixture paso 7.

**Cierre:** en m9 (storm) aparece de tanto en tanto y es EL evento del tramo; en m1, jamás.

### F8 · El mar 3D alcanza al 2D *(= A5 — ARENA y PASADA)*

1. `systems/three-arena.js`: la alfombra de puntos se desplaza en Y por frame con
   `seaH(wx, wz, t)` **importada de `core/sea.js`** (la misma agua, no una copia).
   Amplitud reducida ×0.6 (el mar 3D se mira desde arriba; entero mareaba).
2. Espuma de proa del buque: un anillo de puntos claros en la línea de flotación + V de
   estela corta desde proa (estático + fase con `t`, sin partículas nuevas).
3. NO adoptar `three/Water`/`waternormals.jpg` (existe en el ARENA VIEJO — es el look
   realista y NO es el look del juego; anotado en PLAN §0b).

**Cierre:** captura del ARENA con oleaje + smoke completo verde (el smoke entra al ARENA).

## 6. Qué NO hacer *(además de las trampas de §1)*

1. No tocar `core/physics.js`, `waveNow()`, `scrapeLimit` ni `multOf` — las olas USAN el
   roce, no lo recalibran. `npm run feel` es el juez.
2. No sprites de ola pegados sobre el mar: la ola es el campo de altura o no es.
3. No matar sin telégrafo; no olas dentro del banco de niebla (`systems/fog.js` — si hay
   banco activo en pantalla, suprimir spawns de ola hasta que salga).
4. No más de 2 olas vivas (1 si una es rebelde).
5. No subir el costo del loop de puntos: cero allocations por punto, ventana por z,
   `olasVivas` armado una vez por frame.
6. No agregar opciones de menú más allá del AUTO del agua (F5).

## 7. Orden y dependencias

F0 → F1 → F2 → F3 → F4 → F5 → F6 → F7 → F8. F5 y F6 pueden intercambiarse; el resto no
(F4 usa la espuma de F2; F7 usa F3.3 y F4; F8 usa F2 para que la tormenta exista en 3D).

## 8. Definición de TERMINADO (todo el spec)

- `npm run check` verde (incluye web ≤16 MB) y `npm run agua` verde.
- `npm run feel` idéntico al baseline de antes de F0 (guardarlo en §9 al arrancar).
- Capturas por fase guardadas (para la mirada del director).
- Sondas `__ola`/`__seadbg` presentes y marcadas QUITAR; documentadas en §9.
- ARQUITECTURA.md actualizado: fila de `core/sea.js` + "¿dónde voy?" para "el agua / las
  olas". PLAN_AGUA_OLAS.md marcado con el estado real por etapa.

## 9. Divergencias encontradas *(completar durante la implementación)*

> Anotar acá toda diferencia entre este spec y la realidad del código, con la decisión
> tomada — y el baseline del feeltest al arrancar F0.

### Baseline de `npm run feel` *(tomado ANTES de tocar nada, 16/8/2026)*

Es el juez de §0.3 y §6.1: este spec no toca la física, así que estos números tienen que seguir
idénticos en todas las fases. Todos ✓, cero ✗:

| bloque | medición | valor |
|---|---|---|
| cabeceo | mantener ARRIBA / ABAJO desde nivelado | 0.50 / 0.50 |
| energía | tras 4 s: trepando / picando | 144 / 152 (dif +9) |
| roce | margen a spd 90 sin turbo / spd 280 con turbo | 0.85 / 0.10 |
| roce | escapa del roce con gas | 0.40 s |
| arena E1 | cabeceo alcanzable / morro pleno | 51.57° / 0.63 s |
| arena E2 | vuelta completa banqueando / radio | 5.07 s / 86.95 m |
| arena E3 | media vuelta guionada / guiñada | 1.08 s / 180.92° |
| arena E3 | radio frenado · crucero · turbo | 43 · 87 · 134 m |
| arena E1 | costo de trepar 4 s / freno sostenido | 33.59 / 68.73 m/s |
| momentum | barra llena con 650 pts / lanzamiento | 1.00 / 3.02 s reales |

Verificación rápida en cada fase: `npm run feel` no debe imprimir ningún `✗`.

### 1. `seaH` se pasa POR REFERENCIA a los mundos 3D — la firma no se podía cambiar de un lado

El spec (§3.1) pide mover `seaH` a `core/sea.js` cambiándole la firma a `seaH(wx, wz, t)` y que
`world.js` la llame con `run.t`. **La realidad tenía un tercer usuario que el spec no lista**:
`game.js` pasa la función por referencia a los dos mundos 3D —
`world3D.frame({ ..., seaH: world.seaH })` — y allá se la invoca con **dos** argumentos
(`three-arena.js:193`, `three-world.js:329` y `:352`). Cambiarle la firma en el lugar equivocado
les habría dejado `t` en `undefined`: el mar 3D plano y en silencio, sin romper ninguna prueba.

**Decisión:** `core/sea.js` exporta la función pura de tres argumentos (que es lo que necesitan la
colisión y los tests), y `render/world.js` conserva `seaH(wx, wz)` como **envoltorio de una línea**
que le pone `run.t`. Los tres usuarios siguen andando sin tocarlos, y el día que el 3D quiera el
tiempo explícito (F8) el cambio es local a él.

### 2. Las perillas de §2 entraron enteras en F0, incluidas las de fases futuras

`SEA_FOAM_TH`, `SEA_WIND_AMP` y `SUN_GLINT_HALF` son de F2 y F6 pero el spec las pide en el bloque
de F0, así que están puestas y **todavía sin usar**. Es deliberado y no deuda: el bloque de perillas
se lee de una vez y con sus valores finales, que es como se ajusta a ojo.

### 3. La ola NO se puede ver desde `SPAWN_Z` — el mecanismo lo prohíbe

§5.F1 y §6.2 piden que toda ola se vea desde `SPAWN_Z` (320). **No es posible**, y el motivo es
justamente la tesis del plan: la ola *es* el campo de altura, y el campo de puntos del mar se
dibuja hasta **190** (`farZ` de `drawSeaDots`, ahora la constante `SEA_FAR_Z`). Donde no hay puntos
no hay nada que levantar. Mostrarla más lejos exigiría un sprite — que es exactamente lo que §6.2
prohíbe — o estirar el campo entero, que es un costo que paga todo el juego para un caso raro.

**Decisión:** la ventana de olas se ató a `SEA_FAR_Z` (antes era un `140` suelto) y la ola se ve en
cuanto hay agua dibujada. A velocidad de crucero eso da **~1,9 s de aviso**. Si en playtest resulta
corto, las palancas son `OLA_SPD` (menos velocidad propia) o sembrarla más lejos, **no** el render.

### 4. El bug que las pruebas no veían: la ola aparecía DE GOLPE a 158 m

La primera versión de `juntarOlas` usaba una ventana de `OLA_WZ*3 + 140` = 158 m — un número puesto
pensando en el costo del `exp()` por punto. El fixture daba verde igual (la colisión y el salto no
dependen de cuándo se dibuja) y a ojo tampoco se notaba, porque **medir el brillo del cuadro
devuelve el horizonte**, que es lo más claro de la pantalla pase lo que pase.

Se encontró midiendo la **posición proyectada de la cresta** (`vista` en `__seadbg`): la ola
materializándose a 158 m dejaba 1,4 s de reacción. Medido después del arreglo, el alto aparente de
la cresta crece 2,9 px (139 m) → 6,9 px (59 m) → 20,2 px (20 m): **crece, casi no baja**, que es lo
correcto para una marejada de 3 m vista desde el ras. Lo que la hace legible de lejos es la
ESPUMA, no la silueta — por eso su umbral no depende de la distancia como el destello normal.

### 5. Sondas de F1 *(marcadas QUITAR en `systems/spawn.js`)*

| sonda | para qué | por qué hizo falta |
|---|---|---|
| `__ola(tipo)` | siembra una ola salteando clima y GAP | por las buenas es un sorteo del 4%: la prueba mediría paciencia |
| `__seadbg()` | ola más cercana, **su posición proyectada**, altura, roce y clima | el `vista` es lo que encontró la divergencia 4 |
| `__seaclima(c)` | fija el clima resuelto | probar "en calma no hay olas" exigiría arrancar otra misión |
| `__seaput(y,x)` | coloca el avión en altura/carril | la ventana de "a la altura exacta de la cresta" dura décimas |
| `__seaclear()` | barre todo lo que no sea ola | saltar la ola te sube a la altura de globos y helos: sin esto, "saltó y se murió" acusaba al inocente |
| `__olaOk()` | contesta la guarda de siembra | es lo único que `__ola` no ejercita, porque la saltea a propósito |

### 6. `SEA_FAR_Z` se extrajo como constante exportada de `render/world.js`

Era el literal `farZ = 190` adentro de `drawSeaDots`. Ahora tiene nombre porque **la ventana de las
olas tiene que coincidir con él**, y dos números iguales en dos archivos distintos es la forma
clásica de que uno cambie y el otro no.

### 7. Las olas VARÍAN de altura, y la variación es por tipo *(pedido del autor, 16/8)*

Al ver F1 andando el autor pidió: *"las olas deben ser más altas algunas y variar altura"*. `OLA_H`
era un valor fijo por tipo, así que todas las marejadas salían idénticas a 3.0.

**Decisión:** `OLA_H` pasa a ser la altura **base** y cada ola sortea un factor. El sorteo va **al
cuadrado**, no plano: la mayoría sale modesta y las grandes son la excepción — con reparto plano
todas quedan medianas y ninguna sorprende, que es justo lo que se venía a arreglar. Medido sobre 60
siembras: rango **2,4 – 5,8**, mediana ~3,5, y **~20 % pasa la banda del ×10 (4,5)**. Ese umbral no
es decorativo: una ola de 3 se salta sin salir de la banda del multiplicador, una de 5 te obliga a
irte arriba unos segundos. El factor alto no es "más difícil": es el impuesto de volar a ras.

**Y la variación es POR TIPO, no una sola.** Con un rango único y ancho la marejada trepaba a 5,8 —
más alta que la base de la ROMPIENTE (5,0)— y la rompiente habría llegado a 9,7, más que una
REBELDE: los tres tipos dejarían de significar algo antes de existir. Cada uno tiene su banda
(`OLA_H_VAR`): la marejada varía mucho (es la común, y es donde la variedad se nota), la rompiente
poco (su identidad es ser parcial y romperse, no la altura) y la rebelde casi nada (es EL evento del
temporal, y un evento chico no es un evento).

De yapa, el **espesor en z acompaña a la altura** por la raíz del factor (`OLA_WZ_VAR`): una ola más
alta es también más larga, que es como crece una ola de verdad. Sin eso, las grandes se leían como
una pared flaca. Y los umbrales de cresta y de cara del render pasaron a ser **relativos a la altura
de cada ola**: con un umbral fijo, una ola chica salía pintada de espuma casi entera y una grande
casi nada.

### 8. Dos pruebas del fixture eran inestables por construcción — arregladas

Aparecieron al correr `npm run agua` varias veces seguidas, no en la primera pasada. Van anotadas
porque una prueba que falla al azar no protege nada: enseña a ignorarla.

1. **El reparto de alturas.** La banda de aceptación era 10–35 % de olas grandes, y con ~22 %
   esperado en 60 tiradas eso se pone rojo solo cada varias corridas. Se abrió a 5–45 % —lo que se
   quiere afirmar es "existen y no son la mayoría", cierto en todo ese rango— y la mediana se
   compara contra el medio del rango **teórico**, no el de la muestra, que se movía con el azar.
2. **El salto.** La prueba subía a 15 m con el gas clavado; el avión cambia altura por velocidad, la
   ola tardaba mucho más en cruzar y a veces se acababa el tiempo de la prueba. Ahora sostiene la
   altura con toques y espera más — que además es el gesto real, saltar y volver.
