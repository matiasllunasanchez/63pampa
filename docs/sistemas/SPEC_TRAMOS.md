# SPEC — TRAMOS: el guion de spawn por misión · Análisis funcional para implementación

> **Audiencia: una IA implementadora en sesión nueva, sin el chat donde se decidió esto.**
> Define la mecánica de **TRAMOS**: partir cada misión del PASILLO en segmentos por
> fracción de la distancia, cada uno con su propia densidad, mezcla y línea de radio. Es
> LA herramienta que convierte 14 configs planas en 14 niveles con dramaturgia — el
> tránsito mudo del Narwal (M4), el cordón de radares (M2), el infierno que crece (M9),
> las fases de M14. Nace de [DISENO_MISIONES.md](../proyecto/DISENO_MISIONES.md) §2.
>
> **Antes de tocar código, leer en orden:**
> 1. `docs/ARQUITECTURA.md` — manda sobre este spec; divergencias a §8.
> 2. `src/systems/spawn.js` — el sembrador que va a leer los tramos. Notar: el VEIL
>    (cordón final), la mezcla por terreno, y que `spawnSystem` ya recibe `objectiveDist`.
> 3. `docs/proyecto/DISENO_MISIONES.md` §3–§4 — las misiones que van a usar esto.

## 0. Cómo usar este documento

1. Una fase por vez (§6); tras cada una, fixture (§5) + `npm run check` verdes.
2. La regla suprema: **una misión SIN tramos se comporta EXACTAMENTE igual que hoy.**
   Cualquier fase que no pueda demostrar eso, no cierra.
3. Anotar toda divergencia spec↔código en §8.

## 1. Objetivo y alcance

`tramos:` es un campo opcional de la misión (`data/missions.js`) — **data pura, cero
código por misión**:

```js
tramos: [
  { hasta: 0.35, obstacles: 0.3, caza: 0, radio: 'm4_narwal1' },  // el tránsito
  { hasta: 0.85, obstacles: 1.2, caza: 1 },                       // mar abierto
  { hasta: 1.0,  obstacles: 1.8, favor: ['radar', 'aatruck'] },   // el cordón final
]
```

**Alcance:** solo la fase PASILLO (estado `'play'`) de misiones CON objetivo
(`objectiveDist > 0`). CICLO los usa (juega misiones reales). **Fuera de alcance:**
POR LA PATRIA (sin objetivo — v1 los ignora), ARENA/PASADA/PULSO (tienen su propio
reglamento), clima/terreno por tramo (el cielo no cambia a mitad de vuelo en v1), y
cualquier scripting en metros absolutos (las fracciones sobreviven a `?qa`, los metros no).

## 2. El modelo de datos *(las reglas, no negociables)*

- `hasta` = fracción de `objectiveDist`, **estrictamente creciente**; el último tramo debe
  llegar a `1` (si no llega, el resto del vuelo usa el `cfg` plano — válido y deliberado).
- **Claves v1** (toda otra clave es error de datos y el unit test la rechaza):
  - `obstacles` — multiplicador de densidad del tramo (pisa `cfg.obstacles`)
  - `caza` — nivel de LA COLA en el tramo (pisa `cfg.caza`)
  - `bombs` — cadencia de bombardeo del tramo (pisa `cfg.bombs`)
  - `bidones: false` — corta los bidones de combustible en el tramo (M10, último tercio)
  - `favor: ['tipo', …]` — sesgo de mezcla por **re-sorteo**: si el tipo sorteado no está
    en la lista, se sortea UNA vez más. No reescribe las tablas de mezcla del terreno: las
    inclina. (Con dos sorteos, un tipo favorecido de prob. p pasa a ~p·(2−p).)
  - `radio: 'clave'` — línea de radio que se dispara UNA vez al entrar al tramo
  - `marcas: true|false` — reservada para las marcas de Cóndor en HUD (la consume el
    ítem H del plan de misiones; este spec solo la transporta)
- **Nada muta `cfg`.** Los tramos se RESUELVEN por lectura (`core/tramos.js`); si algo
  escribiera `cfg.obstacles`, el valor quedaría pegado para el resto del run y para el
  modo siguiente — exactamente el bug que la convención de stores existe para impedir.

## 3. Requerimientos funcionales

### RF-01 · La resolución es pura
`core/tramos.js`: `tramoAt(dist, objetivo, tramos)` devuelve `{ idx, val(clave) }` (o
`null` sin tramos / sin objetivo); `val` cae al `cfg` cuando el tramo no trae la clave.
Sin DOM, sin stores — **la importa `npm run unit`**. Incluye el validador de datos
(`hasta` creciente, claves permitidas) que corre en el unit contra TODAS las misiones de
`missions.js`. **CA:** unit tests de bordes — dist 0, dist=objetivo, un solo tramo, tramo
corto que `?qa` comprime a metros, clave ausente, lista vacía.

### RF-02 · El sembrador respeta el tramo
`spawn.js` consulta la resolución al decidir densidad (`obstacles`), bombardeo (`bombs`),
bidones y `favor`. `caza` la consulta quien gobierna LA COLA (su gate ya lee `cfg.caza`;
pasa a leer el valor resuelto). **CA (por sonda de conteo):** en una misión de prueba con
tramos 0.3/1.0 de densidades 0.3/1.8, el conteo de spawns por kilómetro difiere ≥3× entre
tramos; con `bidones: false` no nace un solo bidón en el tramo; con `favor: ['radar']` la
proporción de radares al menos se duplica contra el mismo tramo sin favor.

### RF-03 · La radio, una vez y a tiempo
`game.js` (el orquestador, no `spawn`) detecta el cambio de tramo vigente en `update()` y
dispara la `radio:` del tramo NUEVO — popup estilo Cóndor + beep de radio, texto por
`strings.js`. Reglas: **una vez por tramo por run** · solo en `'play'` (jamás en relevo,
pausa o clímax — si el cambio ocurre ahí, la línea se dispara al volver a `'play'`) · si
una sonda salta varios tramos de golpe (`__wjump`), suena SOLO la del tramo vigente, no la
cola entera. **CA:** fixture — volar la misión de prueba entera produce exactamente una
radio por tramo que la declare, en orden, y un `__wjump(0.9)` no produce un coro.

### RF-04 · Cero regresión sin tramos
Misión sin `tramos` → `tramoAt` devuelve `null` y el sembrador lee `cfg` directo, por el
mismo camino de hoy. **CA:** `npm run feel` idéntico al baseline, smoke verde, y el
fixture corre una misión sin tramos verificando que `__trdbg()` reporta `idx: null`.

### RF-05 · Convivencia con lo que ya gobierna el pasillo
El **VEIL** (cordón final) manda SIEMPRE: pasado su corte no siembra nadie, diga lo que
diga el último tramo. El `?qa` comprime distancias: como los tramos son fracciones,
sobreviven — pero un tramo puede quedar de pocos metros; la radio igual debe sonar (RF-03
cubre el salto). El clímax (`flight.js` → señal) no se toca. **CA:** con `?qa`, la misión
de prueba dispara todas sus radios y el VEIL sigue limpiando el final.

## 4. Sondas *(marcadas QUITAR, patrón `__adbg`/`__pdbg`)*

- `window.__trdbg()` — `{ idx, hasta, valores resueltos (obstacles/caza/bombs/bidones/favor), radiosDisparadas }`.
- `window.__trset(tramos)` — inyecta una lista de tramos al run EN CURSO (la única forma
  de probar densidades sin editar `missions.js`); devuelve el resultado del validador.

## 5. Fixture — `npm run tramos` *(`tools/fixture_tramos.js`, patrón de los 9 existentes)*

Corre con `?qa`: (1) misión sin tramos → `idx: null`, feel/smoke intactos · (2) `__trset`
con 3 tramos → conteo de spawns por tramo (RF-02) · (3) `bidones: false` y `favor` medidos ·
(4) radios: una por tramo, en orden, sin coro tras `__wjump` · (5) VEIL sigue mandando ·
(6) cero errores de consola.

## 6. Fases

| fase | entrega | criterio de cierre |
|---|---|---|
| **T0** | `core/tramos.js` puro (resolución + validador) + unit tests + validador corriendo contra `MISSIONS` | `npm run unit` con los casos de RF-01; `check` verde |
| **T1** | `spawn.js` lee obstacles/bombs/bidones/favor; el gate de LA COLA lee `caza` resuelto | fixture pasos 1–3 |
| **T2** | La radio por tramo en `game.js` + strings + supresión (relevo/pausa/salto de sonda) | fixture paso 4 |
| **T3** | Sondas + `npm run tramos` completo en `package.json` | los 6 pasos verdes; `check` verde |
| **T4** | La misión piloto REAL: el tránsito del Narwal en M4 (código `m3`) — tramos + 3–4 claves de radio del guion (GUION_3, "de dónde salen las posiciones") + docs (ARQUITECTURA fila y "¿dónde voy?", DISENO_MISIONES marca ✅) | volar m3: 0 spawns hostiles en el tránsito, la conversación suena en orden, el mar abierto llega con densidad plena |

## 7. Qué NO hacer

1. **No mutar `cfg`** — resolución por lectura, siempre (§2).
2. **No metros absolutos** — fracciones; el `?qa` es un modo de vida.
3. **No tocar el VEIL** ni reescribir las tablas de mezcla por terreno (`favor` inclina
   por re-sorteo, no reemplaza).
4. **No radio desde `spawn.js`** — los sistemas no llaman hacia arriba; la despacha el
   orquestador.
5. **No tramos en ARENA/PASADA/PULSO/PATRIA** (v1).
6. **No clima/terreno por tramo** (v1) — si una misión lo pide a futuro, es spec nuevo.
7. **No strings sueltos, no reasignar stores, no editar el bundle.**

## 8. Divergencias encontradas *(completar durante la implementación)*

- *(vacío)*
