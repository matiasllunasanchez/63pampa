> **ESTADO (18/8/2026): TERMINADO — las nueve fases (F0 a F8) del
> [SPEC_AGUA_OLAS.md](SPEC_AGUA_OLAS.md) están hechas y `npm run agua` cubre los ocho pasos del §4.**
>
> | etapa | qué es | estado |
> |---|---|---|
> | F0 | `core/sea.js`: una sola superficie para render y colisión | hecho |
> | O1 / F1 | la marejada — la ola mínima jugable | hecho |
> | A1 / F2 | espuma por clima y viento que peina el mar | hecho |
> | A3 / F3 | el avión toca el agua (cortinas, erupción de roce, sal, estela con turbo) | hecho |
> | O2 / F4 | la rompiente: parcial, se esquiva de costado, rompe y ruge | hecho |
> | A4 / F5 | un agua por clima + AGUA AUTO en OPCIONES | hecho |
> | A2 / F6 | el camino del sol | hecho |
> | O3 / F7 | la ola rebelde y su aviso por radio | hecho |
> | A5 / F8 | el mar 3D alcanza al 2D + espuma del buque | hecho |
>
> Las **24 divergencias** (incluidos tres errores del propio spec que el fixture y las capturas
> agarraron) están en el §9 del spec. Lo que queda es TUNEO, no construcción: `OLA_RATE.storm`,
> `OLA_ROMP_P` y `OLA_REB_P` son los tres números que hay que juzgar jugando.

# PLAN — El agua: mejoras visuales + LAS OLAS como obstáculo

> **Estado: plan aprobado en diseño, sin implementar. El plan EJECUTABLE por fases —
> escrito para una IA implementadora con esfuerzo medio — es
> [SPEC_AGUA_OLAS.md](SPEC_AGUA_OLAS.md).** Dos partes: A (visual — el mar como
> protagonista) y O (gameplay — olas para esquivar). Son independientes salvo que O
> construye sobre la idea central de A: **la ola no es un sprite, es el mismo campo de
> altura del mar**. Se relaciona con
> [VISUAL_UPGRADES.md](../proyecto/VISUAL_UPGRADES.md) (escalones 0/1) pero es plan propio:
> el agua es el 70% de la pantalla del juego y se lo merece.

## 0. Dónde vive el agua HOY (leer antes de tocar)

| pieza | archivo | qué es |
|---|---|---|
| El "suelo" del mar | `render/world.js` (filas `theme.water.base0/1/2`) | bandas horizontales planas por distancia |
| El oleaje visible | `render/world.js` → `drawSeaDots()` + `seaH(wx,wz)` | malla de puntos sobre un campo de altura (4 senos superpuestos), color por altura (deep/mid/crest), bandas de luz (`shimmer`), destellos de cresta, paso adaptativo |
| La estela | `render/world.js` → `drawWake()` | V con ciclo de vida (lengua → brazos → motas) |
| El roce (mecánica) | `systems/flight.js` → `waveNow()` + `run.scrapeT` | el nivel del agua para el vuelo oscila ~0.3–1.9; tocarla descuenta margen (`scrapeLimit`) y agotado = muerte. **Ya existe: las olas-obstáculo lo van a reusar, no reinventar** |
| El multiplicador | `core/util.js` → `multOf` | ≤4.5 = ×10 — la banda donde van a vivir las olas |
| Estilos de agua | `data/palette.js` → `WATER_STYLES` (¡solo 2!) + `render/theme.js` | sea/violet vs 8 presets de cielo |
| Salpicaduras | `render/rain.js` → `stepSpray` | ya hay sistema de spray |
| El mar 3D (ARENA/PASADA) | `systems/three-arena.js` | plano hundido −3.2 + alfombra de puntos estática |

## 0b. Lo que YA estaba propuesto o hecho *(integrar, no duplicar)*

| qué | dónde | relación con este plan |
|---|---|---|
| **Reflejo del avión en el agua** (propuesto, 1 día, "el temáticamente obligatorio") | VISUAL_UPGRADES **E0.2** | NO se re-propone acá. Va junto con A3 — comparten la idea "cerca del agua = información de juego" |
| **Tinte de clima por misión** (propuesto) | VISUAL_UPGRADES **E0.3** | complementa A4: el tinte tiñe el frame, A4 cambia la PALETA del agua. Se hacen juntos |
| **Rociada bajo el fuselaje + sombra + estela** (🔵 HECHO) | PENDIENTES_DE_REDISENO §2 | A3 la AMPLÍA (cortinas de punta de ala, sal en parabrisas), no la crea |
| **`waternormals.jpg` + `three/Water`** (asset y código vivos) | `systems/three-world.js:35` | el mar 3D con shader YA existe en el ARENA VIEJO. A5 decide: la alfombra de puntos (el look del juego) se queda como estilo — el shader es la alternativa realista, y probablemente NO es el look |
| **"Obstáculos que obliguen a bajar, riesgo/recompensa"** (pedido, sin forma) | ROADMAP **#8** + ANALISIS #8 | la Parte O es su forma concreta |

## Parte A — mejoras visuales *(cada etapa shippeable sola, Canvas 2D puro)*

### A1 · Rompientes y viento *(el mar deja de ser decorado y pasa a tener clima)*
- **Espuma en crestas**: cuando `seaH` normalizada supera un umbral, motas de espuma
  persistentes (deterministas por celda, como los destellos actuales — sin flicker).
  Umbral por clima: mar calmo casi nada, `storm` lleno de whitecaps.
- **Dirección del viento**: `seaH` gana un término direccional atado al `wind` de la
  misión — la marejada RUEDA con el viento del nivel, y en tormenta aparecen **vetas de
  espuma alineadas** (spindrift), la firma visual del Atlántico Sur.
- Perillas en `data/tuning.js` (`SEA_FOAM_*`); cero costo nuevo: se decide dentro del loop
  de puntos que ya corre.

### A2 · El camino del sol *(la postal)*
Una columna de destellos sobre el agua alineada con el sol/luna del preset de cielo
(`sun`/`clear`/`dawn`/`moon`): densidad de `spark` multiplicada dentro de un cono desde el
horizonte. Es el plano icónico de todo juego de mar y sale barato: ya existen los sparks,
solo se modula su probabilidad por posición. En `storm`/`cloudy`, no hay (no hay sol).

### A3 · El avión TOCA el agua *(la banda del ×10 se tiene que sentir)*
La rociada bajo el fuselaje YA existe (PENDIENTES §2, hecha) — esto la amplía:
- A ras (≤4.5, la banda del multiplicador): **cortinas de spray** desde las puntas de ala
  (reusar `stepSpray`) y los puntos del oleaje APLANADOS en una elipse corta detrás del
  avión — el colchón de aire del vuelo rasante, visible.
- Durante el roce (`run.scrapeT > 0`): erupción de espuma continua + **gotas de sal en el
  parabrisas** 1–2 s (overlay de gotitas que se secan — en 1ª persona del ARENA/PASADA,
  sobre el PNG de cabina). "Volvés con sal en las alas" (m1) hecho pantalla.
- La estela actual gana ancho/blancura con el turbo.

### A4 · Un agua por clima *(pura data)*
`WATER_STYLES` pasa de 2 a ~6: `storm` (verde gris, espuma alta), `night` (tinta con
camino de luna), `sun` (turquesa), `dawn` (cobre), además de los 2 actuales.
`applyTheme()` elige la que matchea el cielo **salvo override del jugador** (la perilla
AGUA de OPCIONES sigue mandando). Tabla nueva en `palette.js`, lógica de 3 líneas.

### A5 · El mar 3D alcanza al 2D *(ARENA y PASADA)*
La alfombra de puntos de `three-arena.js` se desplaza en Y con el MISMO `seaH` (importado,
no copiado) + espuma de proa y estela del buque (V de foam desde la proa — hoy el buque
está clavado en un mar plano). Con A1 hecho, la tormenta existe también en el clímax.

## Parte O — LAS OLAS como obstáculo *(la mecánica)*

### La idea central
Una ola-obstáculo **no es un sprite pegado sobre el mar: es un BULTO que se suma al campo
de altura**. `seaH` total = `seaH` base + Σ crestas de los obstáculos vivos (una loma
gaussiana por ola, ancha en x, angosta en z, viajando HACIA el jugador — las olas ruedan,
la velocidad relativa las hace rápidas). Los puntos del oleaje existente SE LEVANTAN solos
donde pasa la ola; la colisión se calcula analítica contra el mismo bulto. Una sola fuente
de verdad: lo que ves es lo que te mata.

**Qué aporta al juego**: casi todos los obstáculos del PASILLO se esquivan LATERAL. La ola
obliga el gesto VERTICAL — un toque de gas para saltarla y volver abajo — exactamente el
gesto del salto de la PASADA (SPEC_MODO_PASADA RF-05). **Las olas son el tutorial
distribuido del salto**, y son el impuesto de la banda ×10: el mar te paga por volar ahí, y
cada tanto te lo cobra.

### El roce generoso *(regla de oro — sin esto la mecánica es injusta)*
Rozar la CRESTA de una ola no mata: descuenta `scrapeT` (el sistema que ya existe) con
erupción de spray. Lo que mata es la CARA de la ola (el frente del bulto por encima de un
umbral). Chocar el agua sigue siendo la muerte de siempre (`death_sea`); la ola solo
adelanta dónde está el agua.

### O1 · La marejada *(primera etapa jugable)*
Tipo nuevo `'ola'` en la rama de agua de `spawn.js`: **línea de marejada de ancho
completo**, baja (2.5–3.5), visible desde `SPAWN_Z` como banda oscura con espuma. Se salta
con gas o se pasa por el costado SI trae hueco (variante con brecha). Frecuencia por
`wind`/`rain` de la misión (m1 casi nunca, m9 tormenta seguido). Perillas `OLA_*` en
`data/tuning.js`. **CA:** volando a 6+ de altura ninguna ola te toca jamás — solo cobran
en la banda del multiplicador; nunca dos olas a menos de `OLA_GAP_MIN`.

### O2 · La rompiente *(variedad + lectura)*
Variante parcial (media pantalla), más alta (4–6), que **se rompe** al acercarse: la
cresta se enrula y estalla en espuma (frames de foam del A1). Esquive lateral O salto.
Sonido propio (rumble grave que crece — el aviso es del mundo, no del HUD). **CA:** cada
variante se distingue de la otra a 400+ de distancia sin leer nada.

### O3 · La ola rebelde *(tormenta solamente — el evento)*
Rara, enorme (7–9), ancho completo sin brecha: exige trepada real y cuesta el ×10 por unos
segundos. Avisada por radio por el escuadrón (`ola_call`: "¡Pared de agua adelante!") — y
con el roster corto, a veces NO hay aviso (la regla del juego: sin radar, los ojos son el
escuadrón — misma que PASADA RF-08). Sal en el parabrisas garantizada al pasarla cerca.
**CA:** aparece solo con `rain ≥ 1` o `wind` fuerte; máximo 1 viva; siempre saltable desde
que se la ve.

### Perillas *(defaults — `data/tuning.js`)*

| perilla | default | qué es |
|---|---|---|
| `OLA_H_MAREJADA` / `OLA_H_ROMP` / `OLA_H_REBELDE` | 3 / 5 / 8 | altura de cresta |
| `OLA_W_Z` | 6 | espesor del bulto en z |
| `OLA_SPD` | +14 | velocidad propia hacia el jugador (se suma a la relativa) |
| `OLA_GAP_MIN` | 350 | distancia mínima entre olas |
| `OLA_RATE` | por clima | probabilidad en la rama de agua de spawn (0 en m1) |
| `OLA_FACE_KILL` | 0.55 | fracción de la altura del bulto que es "cara" letal; encima, cresta = roce |

## Orden y esfuerzo

**O1 → A1 → A3 → O2 → A4 → A2 → O3 → A5.** La ola simple primero (es gameplay y valida el
bulto en el campo de altura), después la espuma (que O2 necesita), y el 3D al final. Cada
etapa: `npm run check` verde; O1–O3 además con sonda (`window.__ola(tipo)` fuerza el spawn,
marcada QUITAR) para probar el salto, el roce de cresta y la muerte de cara sin esperar al
azar.

## Qué NO hacer

1. **No sprites de ola pegados sobre el mar** — la ola es el campo de altura o no es.
2. **No matar sin telégrafo**: toda ola se ve desde `SPAWN_Z` y se escucha antes de llegar.
3. **No olas dentro del banco de niebla ciega** (`systems/fog.js`): ahí ya se juega a otra
   cosa; una ola invisible es una muerte injusta.
4. **No tocar el feel**: `waveNow`/`scrapeLimit`/`multOf` no se recalibran — las olas usan
   el roce existente, no lo cambian. El feeltest tiene que dar los mismos números.
5. **No obstáculos de agua en tierra** (m13 es `terrain: tierra`) ni en POR LA PATRIA con
   más frecuencia que en campaña: respeta el `obstacles` de la misión.
6. **No flicker**: toda espuma/destello nuevo es determinista por celda (regla ya
   establecida en `drawSeaDots` y `drawWake`).
