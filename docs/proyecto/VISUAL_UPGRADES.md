# VISUAL_UPGRADES — plan de mejora visual (sin migrar de motor)

> **Decisión de fondo (14/8):** el disparador "mejorarlo gráficamente" NO justifica migrar de
> motor. La única carencia técnica real del stack es que Canvas 2D no tiene shaders — y el
> contexto WebGL para tenerlos ya está en el bundle (three.js). Este plan cubre los tres
> escalones en orden de rendimiento por esfuerzo. Migrar queda reservado para el único
> disparador que lo vale: consolas (ver conversación 14/8 — Godot/Defold/MonoGame, 3–5 meses).

**Dato de arquitectura que habilita todo esto:** el juego entero termina compuesto en UN solo
canvas (`#g`, buffer 960×540, grilla 480×270 — `render/ctx.js`). El 3D de three.js se renderiza
aparte y se blitea adentro (`game.js:1644` y `:1655` vía `three-world.view()` /
`three-arena.view()`). Un frame = una textura ⇒ se puede post-procesar completo.

---

## ⭐ Estrategia global (16/8/2026) — todos los frentes visuales, integrados

> Esta sección MANDA sobre el "Orden global" de abajo (que queda como detalle de los
> escalones E0/E1/E2). Integra lo que pasó desde el 14/8: la PASADA construida hasta
> P3+P6, el ARENA con su feel nuevo, el modo historia con el enchufe de retratos andando
> (silueta mock), y los specs nuevos del agua.
>
> **El plan de implementación POR FASES de todo esto (más los frentes pedidos el 16/8:
> aire/sensaciones, armas, enemigos vivos, avión) es
> [PLAN_VISUAL_FASES.md](PLAN_VISUAL_FASES.md)** — 9 tandas delegables + carril de
> producción. Este doc queda como estrategia y detalle de E0/E1/E2.
>
> **Y el 16/8 se sumó [ANALISIS_REFERENTES_3D.md](ANALISIS_REFERENTES_3D.md)**: tres
> juegos three.js de navegador jugados y analizados, con 7 propuestas para el 3D (agua
> cartoon, duotono, terreno de bahía, la bandada, el último vuelo…) y **la puerta grande
> del §5b: el prototipo del PASILLO EN 3D** — afecta el orden de T7/T8 si se decide.

### La foto del estado (16/8)

| frente | doc rector | estado |
|---|---|---|
| Efectos 2D (E0: glow · reflejo · tinte) | este doc | ⬜ sin empezar |
| Post-pro WebGL (E1: grading · bloom · CRT) | este doc | ⬜ sin empezar |
| Arte VN por asset (E2: placas · retratos · cuadros) | este doc + RETRATOS.md | ⬜ cero PNG — pero el enchufe YA corre en el juego (cascada + silueta mock en `render/screens.js`, `CARA_NEUTRA` en `core/dialogue.js`). Integración = soltar archivos |
| El agua + las olas | [SPEC_AGUA_OLAS.md](../sistemas/SPEC_AGUA_OLAS.md) | ⬜ spec cerrado, listo para delegar (Opus medio) |
| El clímax (PASADA/ARENA) | [SPEC_MODO_PASADA.md](../sistemas/SPEC_MODO_PASADA.md) | 🟡 P0–P3 + P6 hechas; **P5 (legibilidad) pendiente** con deudas anotadas (§10.7 carteles apilados, §10.53) |
| El buque 3D por clase (piezas nombradas) | PENDIENTES_DE_REDISENO §8 (la "decisión 5" del ARENA) | ⬜ sigue el placeholder de cajas — **lo más visto y más pobre del juego hoy** |

### La lectura (por qué este orden y no otro)

1. **El buque placeholder es la deuda visual número uno**: es el clímax de casi todas las
   misiones y de dos modos enteros, y hoy es lo peor dibujado de la pantalla. Ya no hay
   excusa de "esperar al rework de mecánica" — la mecánica nueva EXISTE.
2. **E0 sigue siendo el mejor peso/precio** (3–4 días, cero riesgo, cero dependencias) y
   dos de sus piezas alimentan lo que viene: el glow (E0.1) le da de comer al bloom
   (E1.F3) y el tinte (E0.3) al grading (E1.F2).
3. **El arte VN no bloquea ni se bloquea**: es producción (generación + curado de Matías),
   corre en paralelo TODO el tiempo, y el juego lo integra solo. Lo único de código es dar
   vuelta el guard de `build_web` al primer PNG real.
4. **El agua ya está pensada**: spec autosuficiente, mezcla visual + gameplay (ROADMAP #8)
   y no colisiona con nada… salvo su F8 (mar 3D), que toca `three-arena.js` igual que la
   PASADA — ver la regla de tránsito abajo.

### El orden — dos carriles

**CARRIL CÓDIGO** (secuencial, cada ítem con su gate verde):

| # | qué | por qué acá |
|---|---|---|
| 1 | **E0 completo** (E0.1 glow → E0.2 reflejo → E0.3 tinte) | el salto visible más barato; las nocturnas (m13/m14) lo gritan; el reflejo es información de altura que además prepara las olas |
| 2 | **Agua + olas, F0–F7** (SPEC_AGUA_OLAS) | visual + gameplay juntos; delegable ya; el 70% de la pantalla |
| 3 | **El buque 3D por clase** — builders t42/t21/log en `ship3d.js` con piezas nombradas (mástil+radar, torretas, chimenea, puente, grúas del log), zonas ancladas a piezas reales (`userData.zone` ya existe) | la deuda nº 1; sirve a ARENA y PASADA a la vez; y la P5 de la PASADA (legibilidad) se apoya en un buque legible — conviene ANTES o JUNTO a P5 |
| 4 | **Agua F8** (mar 3D ondulando + espuma de proa) | recién acá: para entonces `three-arena.js` quedó quieto (PASADA P5 cerrada, buque nuevo adentro) |
| 5 | **E1 F1→F3** (pipeline post-pro → grading → bloom) | con E0 hecho, el bloom nace alimentado; el grading absorbe el tinte |
| 6 | E1 F4 (CRT) y F5 (distorsiones) | solo si después de ver F3 el juego lo pide — son gusto, no calidad |

**CARRIL PRODUCCIÓN** (paralelo desde hoy, sin código — orden de RETRATOS.md §6):

1. Las **~16 placas** de ambiente (fáciles, sin caras, validan el estilo).
2. Los **retratos neutros** de `CARA_NEUTRA` (uno por personaje con cara) → el modo
   historia entero deja el mock.
3. Variantes de expresión que más rinden (el "serio" del Gitano, "la sonrisa" de Puma, la
   "media sonrisa" del Vasco).
4. Los **cuadros de M1** completos (la demo) y de ahí en orden de campaña.

Regla del carril: cada tanda se mira **adentro del juego, muda** (el criterio del
director) antes de encargar la siguiente — el enchufe en caliente lo permite.

### Regla de tránsito (para no pisarse)

`three-arena.js` es zona compartida: PASADA P4/P5/P7 y agua F8 lo tocan. Orden: primero
cierra la PASADA su legibilidad (P5, idealmente con el buque nuevo del ítem 3), después
entra agua F8. Todo lo demás de agua (F0–F7) es 2D y corre sin conflicto en paralelo.

### Qué cambió respecto del plan original de abajo

- El pendiente "rework visual del ARENA — esperar al rework de mecánica" quedó
  **desbloqueado**: la mecánica llegó (ARENA sweet-spot + PASADA P0–P3). El buque 3D entra
  al orden global como ítem 3.
- Nace el frente del **agua** (SPEC_AGUA_OLAS), que este doc no cubría; absorbe la parte
  "mar" del backlog E2.4 y suma gameplay.
- E2.1 dejó de ser promesa: el mock ya dibuja la caja VN — producir arte tiene retorno
  inmediato y visible.

---

## Escalón 0 — Canvas 2D puro (2–4 días, sin dependencias nuevas)

Efectos que no necesitan WebGL. Cada uno es independiente y shippeable por separado.

### E0.1 · Glow aditivo (1–2 días) — el de mayor impacto/costo de todo el plan

`globalCompositeOperation: 'lighter'` ya se usa en 5 lugares del repo para otras cosas; acá se
aplica sistemáticamente a todo lo que EMITE luz:

| Sitio | Archivo | Qué se agrega |
|---|---|---|
| Hongo de explosión | `render/boom.js` | Blob de gradiente radial 'lighter' detrás del sprite, fuerte en los frames del destello (fila 0), se apaga con el humo |
| Bola de fuego frontal | `render/blast.js` | Ídem, centrado en la celda |
| Trazadoras | `render/ammo.js` | Halo 'lighter' chico en los puntos muestreados cercanos a cámara (cap de N halos por ráfaga — perf) |
| Tobera / turbo | `render/plane.js:44` | Ya existe un resplandor alpha 0.28 — pasarlo a 'lighter' con gradiente, más grande con `run.boost` |

- **Perillas en `data/tuning.js`** (convención: tunables en data): `GLOW = { expl, tracer,
  tobera }` con las intensidades 0..1. `0` = apagado, para poder A/B en un playtest.
- **Dónde rinde más:** misiones nocturnas (M11 luna, M12 noche) — es EL truco que hace que un
  pixel-art nocturno se vea caro.
- **Verificación:** sonda Electron con screenshot en misión nocturna (patrón `vnbox.js`:
  `?qa` + `__wjump`); `npm run feel` debe seguir OK (el glow no toca gameplay); los conteos de
  colores del smoke solo pueden SUBIR.

### E0.2 · Reflejo del avión en el agua (1 día) — el temáticamente obligatorio

Para un juego cuyo corazón es volar pegado al agua, el reflejo es la señal visual de altura
que falta: cuanto más cerca del reflejo, más rasante — el efecto ES información de juego.

- **Dónde:** `render/world.js`, después del degradé del mar y antes del avión. El sprite del
  avión espejado (`scale(1,-1)`) bajo la línea `HOR`, alpha ~0.18, SIN la llama del turbo,
  con ondulación horizontal por seno de `run.t` y la fila.
- **Refactor mínimo:** extraer de `render/plane.js` el dibujo del sprite (frame de rolido
  incluido) a un helper reutilizable con transform — hoy está inline en `drawPlane`.
- **Perilla:** `reflAlpha` por estilo en `WATER_STYLES` (`data/palette.js`): mar y río lo
  tienen, tierra = 0. Las explosiones pueden sumar una mancha 'lighter' espejada tenue (opcional,
  mismo helper).
- **Verificación:** sonda con screenshot volando bajo vs alto — el reflejo debe acercarse y
  alejarse; smoke igual que E0.1.

### E0.3 · Tinte de clima por misión (medio día)

La versión barata del color grading, con las perillas que ya existen: cada misión ya pisa
`sky/water/rain/fog` (`data/missions.js`, helper `C()`). Se agrega `tint: [r,g,b,a]` —
un `fillRect` fullscreen con composite `'multiply'` (+ opcional `'lighter'` suave para lift)
al final del mundo y ANTES del HUD (la legibilidad del HUD no se negocia).

- Madrugada fría en M1, tormenta verdosa en M8, noche azul en M12.
- **Dueño:** `render/theme.js` resuelve el tinte igual que resuelve `sky/water` (mismo store,
  se muta, no se reasigna).
- **Nota de futuro:** cuando el Escalón 1 esté activo, esta misma perilla alimenta los uniforms
  del shader de grading — el dato sobrevive, cambia el consumidor. No se tira nada.

---

## Escalón 1 — Post-procesado WebGL (1–2 semanas, en 5 fases shippeables)

### Arquitectura

- **Canvas overlay:** un `<canvas id="fx">` posicionado ENCIMA de `#g` dentro de `.stage`
  (`src/index.html`), con `pointer-events: none` — el mouse y el foco siguen en `#g` y la mira
  no se entera. Z-order: sobre `#g`, DEBAJO del botón de sonido y el reproductor.
- **Pipeline:** `THREE.CanvasTexture(#g)` con `needsUpdate` por frame, filtro `NEAREST`
  (pixel-art nítido), quad fullscreen con `ShaderMaterial`. Renderer NUEVO y separado del de
  `MOM3D` (ese se blitea ADENTRO de `#g`; este LEE `#g` — no pueden ser el mismo contexto).
  Resolución del fx canvas: CSS size × devicePixelRatio (los scanlines se rasterizan a
  resolución de dispositivo).
- **Fallback = ausencia:** si WebGL falla o `THREE` no está, el canvas fx no se crea y el juego
  se ve EXACTAMENTE como hoy. Mismo patrón que `MOM3D.failed`. Flag `?nofx` para sondas.
- **Dueño del estado:** `systems/postfx.js` (single-writer). `game.js` le pasa un snapshot por
  frame (`postfx.frame({...})`) — los sistemas no llaman hacia arriba, como siempre.
- **Perillas:** `data/postfx.js` (intensidades, curvas por preset de cielo). Fila nueva en
  OPCIONES → sección AMBIENTE: `EFECTOS VISUALES` (`ACTIVO/APAGADO`, clave
  `rasante_postfx`) y `FILTRO CRT` aparte (`rasante_crt`) — el CRT es gusto, no calidad.
- **Shaders inline** como template strings en el módulo — `tools/build_web.py` no necesita
  tocar nada (no hay rutas de assets nuevas).
- **Smoke:** los asserts existentes muestrean `#g` por `getImageData` (`tools/smoke.js:34`),
  así que NO los afecta. Se agrega UN check nuevo: con fx activo el canvas `#fx` existe y tiene
  contenido; con `?nofx` no existe.

### Fases

| Fase | Qué | Est. |
|---|---|---|
| **F1** | Pipeline crudo: overlay + CanvasTexture + shader passthrough. Cero cambio visual — la fase es la infraestructura y su fallback. Gate verde con y sin `?nofx`. | 1–2 días |
| **F2** | Grading paramétrico (lift/gamma/gain + tinte + saturación) alimentado por el `tint` de E0.3 y el preset de cielo, + viñeta suave. Sin LUTs de textura todavía (eso es arte, Escalón 2). | 1 día |
| **F3** | Bloom: pase de umbral + blur separable a media resolución (480×270) + composite aditivo. Los emisores de E0.1 lo alimentan gratis (el glow 'lighter' supera el umbral solo). | 1–2 días |
| **F4** | CRT opcional: scanlines + curvatura sutil + aberración cromática mínima en los bordes. Apagado por defecto. | 1 día |
| **F5** | Distorsiones locales: onda de choque en explosiones y calor tras la tobera con turbo. `game.js` pasa posiciones en pantalla (grilla 480×270) en el snapshot: `{ shocks: [{x,y,age}], heat }`; el shader las convierte a UV. Cap de 4 shocks simultáneos. | 2–3 días |

**Opcional F6 (si sobra ganas):** vidrio mojado global cuando `rain > 0` (wobble sutil de UV).
La lluvia en sí sigue siendo 2D (`render/rain.js`) — no se migra.

### Verificación del escalón

Cada fase termina con: `npm run check` verde + sonda con screenshots A/B (`?nofx` vs normal)
de la MISMA escena. F3 y F5 además con captura en misión nocturna y en explosión de arena.

---

## Escalón 2 — Arte (producción continua, en paralelo; integración ~0 código)

Los enchufes ya están puestos: todo lo de abajo aparece SIN tocar código al caer el PNG.

### E2.1 · Retratos VN — `assets/portraits/<cara>.png`

- **Spec:** 36×36 px, pixel-art, fondo transparente, busto (cabeza+cuello+hombros) asomando
  por arriba — la caja los dibuja en `render/screens.js` (hoy con silueta mock).
- **Set mínimo (los que el guion ya referencia** — `CARA_NEUTRA` en `core/dialogue.js` +
  `data/story.js`): `tero_neutro`, `puma_reglamentario`, `gitano_sonrisa`, `gitano_roto`,
  `vasco_cerrado`, `pichon_neutro`, `turco_grunon`, `mateo_sonrisa`, `condor_parlante`.
- **Set completo:** RETRATOS.md §4 (las variantes emocionales llegan con la pasada del guion 3).

### E2.2 · Cuadros de historia — `assets/story/<img>.png`

- **Spec:** 480×270, pixel-art. La lista de claves `img:` vive en `data/strings.js`
  (`P1_2`, `P2_3`, `P3_4`, `P4_1`, `M1_3`, `M1_5B`, `M1_7`, `M1_9`, `M2_*`… y las cuatro
  `INTRO_*` que ahora son de la campaña 2, `storyC2Intro`).
- **Prioridad:** M1 completo primero (es la demo del juego), después en orden de campaña.

### E2.3 · Placas — `assets/plates/`

Fondos de escena VN (RETRATOS.md/STORYBOARDs). Mismo mecanismo de carga perezosa.

### ⚠️ El único cambio de código del escalón

Cuando caiga el PRIMER PNG real de cada base, dar vuelta el guard correspondiente en
`tools/build_web.py`: hoy `../assets/story|plates|portraits/` se neutralizan a `data:,…-web-off`
porque las carpetas no existen; con assets reales pasan a re-embeberse como los demás. Electron
los lee directo sin cambio alguno.

### E2.4 · Backlog de arte que sí mueve la aguja (sin fecha)

- Más frames de animación del avión (rolidos intermedios) — pipeline `tools/bake_planes.html`.
- Más capas de nubes parallax en `render/world.js`.
- LUTs de color por misión como textura (reemplazan el grading paramétrico de F2 donde valga).

---

## Orden global y estimaciones

| # | Qué | Est. | Depende de |
|---|---|---|---|
| 1 | E0.1 glow aditivo | 1–2 días | — |
| 2 | E0.2 reflejo en el agua | 1 día | — |
| 3 | E0.3 tinte por misión | 0.5 día | — |
| 4 | E1.F1 pipeline post-pro | 1–2 días | — |
| 5 | E1.F2 grading + viñeta | 1 día | F1, E0.3 |
| 6 | E1.F3 bloom | 1–2 días | F1 (E0.1 lo alimenta) |
| 7 | E1.F4 CRT opcional | 1 día | F1 |
| 8 | E1.F5 distorsiones | 2–3 días | F1 |
| — | E2 arte | continuo | en paralelo desde el día 1 |

**Total código: ~2–3 semanas al ritmo actual.** El arte corre aparte y no bloquea nada.

## Reglas del repo que este plan respeta (recordatorio para la implementación)

- Stores se MUTAN, nunca se reasignan (`lint:state` lo fuerza). `postfx` es single-writer.
- Los sistemas devuelven señales; `game.js` decide. Nada llama hacia arriba.
- Tunables en `data/`, comentarios en español sin acentos explicando el POR QUÉ.
- Textos de UI sin acentos ni Ñ (la fuente del juego no los tiene: `CANON`, no `CAÑON`).
- Cada fase cierra con `npm run check` verde ANTES de pasar a la siguiente. Sin commits del
  asistente: se reporta la lista de archivos y los mensajes los escribe Matias.

## Qué NO hacer

- NO migrar el render 2D a WebGL "ya que estamos" — el post-pro lee el canvas como textura
  justamente para no tocar las 5.100 líneas de `render/`.
- NO shaders por sprite ni luces 2D con normales — eso es territorio Pixi/Godot y otro plan.
- NO efectos que cambien gameplay: el glow no agranda hitboxes, la distorsión no mueve la mira.
- NO prender el CRT por defecto.

## Pendientes que este plan NO cubre

- Iluminación dinámica por sprite (normal maps) — requiere renderer WebGL 2D (Pixi), plan aparte.
- Voces y música nueva (otro dominio).
- ~~El rework visual del ARENA/MINUTOS SAGRADOS — esperar al rework de mecánica primero.~~
  **Desbloqueado (16/8):** la mecánica nueva existe (ARENA sweet-spot + PASADA P0–P3). El
  buque 3D por clase es el ítem 3 de la Estrategia global de arriba.
