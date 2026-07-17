# RASANTE — Estado del proyecto

_Documento de continuidad. Última actualización: 17 de julio de 2026._

Resumen de todo lo construido, cómo está armado y por dónde seguir. Pensado para
retomar el proyecto sin tener que releer todo el código.

---

## 1. Qué es

Arcade 2D de **vuelo rasante** ambientado en la Guerra de Malvinas (Atlántico Sur, 1982),
en homenaje a los pilotos y veteranos. Idea rectora: la adrenalina de volar a ras del mar,
como lo hacían los A-4 Skyhawk para evadir el radar de la flota británica.

**Objetivo de diseño:** simple, adictivo, competitivo por puntaje, con un costado de homenaje
histórico sobrio (fichas con hechos reales). Arte pixel-art que el autor hará en Photoshop.

- **Autor:** Matias.
- **Stack:** un único archivo HTML autocontenido, Canvas 2D + Web Audio, sin dependencias ni build.
- **Resolución nativa:** 320×180 px, escalada con `image-rendering: pixelated`.
- **Estado general:** prototipo jugable y bastante pulido en gamefeel. Falta reemplazar arte
  placeholder por sprites propios y sumar las mecánicas de "clímax" (bombardeo, desafío diario).

---

## 2. Cómo correrlo y probarlo

- **Jugar:** abrir `index.html` en el navegador (doble clic; no necesita servidor).
- **Para automatizar pruebas** (o si el navegador embebido no abre `file://`):
  ```
  cd /Users/matymun/personal/games/63pampa
  python3 -m http.server 8471 --bind 127.0.0.1
  # luego abrir http://127.0.0.1:8471/index.html
  ```
- **Artifact online (mismo link siempre):**
  https://claude.ai/code/artifact/7802b6a9-e257-4870-9811-d46cc266d0fb
  Flujo de republicación: editar `index.html` → copiar al scratchpad como `rasante.html`
  → volver a publicar pasando ese `url` para conservar el enlace.

---

## 3. Archivos

| Archivo        | Qué es                                                                 |
|----------------|------------------------------------------------------------------------|
| `index.html`   | **Juego principal** — vista frontal pseudo-3D (estilo After Burner).   |
| `lateral.html` | Primer prototipo, scroll lateral (Flappy-like). Conservado de referencia. |
| `README.md`    | Doc de jugador + controles + tuning + pipeline de arte.                |
| `ESTADO.md`    | Este documento.                                                        |
| `assets/`      | Vacío — destino de los PNG de Photoshop.                               |

---

## 4. El game loop (cómo se juega hoy)

Cámara detrás del avión; el mar viene hacia el jugador en perspectiva. Se maniobra en 2 ejes.

**La regla de oro — la altura es todo:**

| Franja de altura      | Velocidad            | Puntaje        | Riesgo                        |
|-----------------------|----------------------|----------------|-------------------------------|
| Ras del mar (<4,5 m)  | máxima (racha acelera) | x10 → x30    | el agua y los obstáculos      |
| Media (5–16 m)        | normal               | x2 – x5        | poco (zona "cómoda/cobarde")  |
| Alta (>16 m)          | cada vez más lenta   | x1             | viento en contra + turbulencia|
| Muy alta (>30 m)      | lenta                | x1             | radar → misil buscador        |

**Bucle de riesgo cerrado:** volar bajo → multiplicador alto → **más velocidad** → menos
tiempo de reacción y más obstáculos por segundo → sobrevivir paga más. Subir para "descansar"
te frena (viento), te expone (radar) y te sacude (turbulencia). No hay refugio gratis.

### Mecánicas implementadas
- **Multiplicador por altura** (`multOf`): x2 / x5 / x10.
- **Racha rasante:** sostener la zona x10 sube el mult cada 2 s → x15 → x20 → x25 → x30
  (tope `rasLevel` = 4). 0,45 s de gracia para saltar una ola sin perderla. Cartel, beep
  ascendente, borde de pantalla encendido, número que tiembla/parpadea.
- **La velocidad la dictan los multiplicadores:** `rachaVel = 1 + rasLevel*0.12 + (x10:+0.10 / x5:+0.05)`.
  Hasta ~+58 % en x30. La velocidad **surge** suave (lerp `dt*3`), no salta.
- **Viento en contra en altura:** por encima de ~16 m la resistencia se acumula con el tiempo
  (`windT`, tope 6 s) y frena hasta **-35 %** (`windF`). Trae ráfagas visibles cruzando el cielo,
  turbulencia (sacudones en x/y + shake) y aviso en HUD. Al bajar, el arrastre se descarga al doble.
- **Cañón 20 mm** con calentamiento (`heat` / `overheat`): globos +150, helicópteros +300 (2 impactos),
  misiles +400. Mástiles, fragatas y agua **no** se destruyen (esquivar sigue siendo la habilidad central).
- **Radar:** volar alto llena `detection`; al 100 % lanza un misil buscador que persigue.
- **Turbo** (`boost`): ×1,5 velocidad y **×2 puntos**, quema combustible al triple. Líneas de velocidad y shake.
- **Near-miss:** pasar rozando un obstáculo (o esquivar un misil por poco) da **+75**.
- **Combustible:** reloj del run; bidones (+30) en vuelo. Sin combustible el avión se hunde.
- **Estela y rocío** sobre el agua = referencia visual de altura y sensación de velocidad:
  estela en V bajo ~9 m; rocío escalonado a 7 / 4,5 / 2,8 m; espuma batida bajo el fuselaje; sombra en el agua.
- **Agua "malla de puntos"** (efecto onda, inspirado en el fondo WebGL de boostivity.ai): grilla de
  puntos en perspectiva desplazada por ondas (`drawSeaDots` + `seaH`), fluye hacia la cámara.
  `WATER_STYLE` = `'sea'` (por defecto) | `'violet'` (neón). Base oscura por líneas + puntos encima.
  El movimiento propio del agua viene de: una **marejada larga** (~180 m) que rueda hacia la cámara
  (`sin(wz*0.035 - t*1.1)`), fases temporales rápidas en las ondas cortas, y el **`shimmer`** —
  bandas de luz que barren la superficie (clave para que se vea vivo lejos, donde el bobbing es sub-píxel).
  Verificado con banco aislado: 4 instantes con cámara quieta muestran las crestas desplazándose.
- **Despegue desde Puerto Argentino / BAM Malvinas**: estado `'takeoff'` (3 s) antes de `'play'`;
  el avión carretea sobre la pista, acelera y rota solo; control libre a los 3 s. Cuenta regresiva
  3…2…1 (`drawTakeoff`) con beeps. Costa: primeros `COAST = 230` m son tierra (turba + pista con eje
  y balizas), luego rompiente y mar abierto. Sobre tierra no hay estela; morir dice "Chocaste el terreno".
- **Vuelo a gas (throttle):** la gravedad tira siempre; mantener ARRIBA empuja, soltar = caer
  hasta estrellarse. Constantes en el bloque de maniobra: `G=22`, `TH=55`, `DIVE=30` (m/s²),
  `vy` clampeada a [-20, 18]. Verificado numéricamente: sin gas desde 12 m → agua en ~0,97 s;
  desde 4 m (racha) → ~0,47 s; gas a fondo 12→46 m en ~2,2 s. El táctil conserva el control
  directo por arrastre (no usa gas).
- **Récord local** (`localStorage: rasante_frontal_best`).
- **Fichas históricas** reales en la pantalla de derribo (array `FACTS`).

### ℹ️ Nota de verificación (sesión del 17/7)
El panel de preview **ralentiza `requestAnimationFrame` cuando no está en foco**, así que no se pudo
volar en vivo hasta mar abierto. Lo verificado esta sesión: el **despegue/pista** se vio renderizando
bien (carreteo, cuenta regresiva, balizas); el **agua de puntos** se validó con un banco aislado
(`wtest.html`, ya borrado) que reusa la misma matemática (`proj`/`seaH`/`drawSeaDots`/`WATER`) —
se confirmó la onda animando en tono mar y violeta. El juego real corre **sin errores de consola**.
Pendiente menor: jugar una corrida completa a mar abierto para el ajuste fino del gamefeel del agua
(densidad `SPX/SPZ`, brillo de la paleta `WATER`, amplitud de `seaH`).

### 🐞 Bugs conocidos (SIN corregir todavía — anotados a pedido del autor)

- **No se puede derribar el helicóptero disparándole: en vez de destruirlo, el jugador se
  colisiona** (reportado sesión 17/7). Diagnóstico:
  - Las balas se disparan a la **altura exacta del avión** y viajan horizontales, **sin apuntado
    vertical** (`bullets.push({ x:plane.x, y:plane.y, z:PZ+3 })`, ~línea 387). El impacto exige
    `Math.abs(b.y - o.y) < 2.4` (~línea 453).
  - El helo aparece más **alto** que la altura de vuelo rasante: `y: 5 + random*16` → 5–21 m
    (~línea 203), mientras que para el multiplicador se vuela a ~4 m. Las balas pasan **por debajo**
    del helo y nunca registran impacto.
  - Encima el helo tiene `hp: 2` (dos impactos) y bobbing visual `±3` que no está en la hitbox
    (colisión usa `o.y` sin bobbing) → aún alineándose, es fácil errar.
  - Resultado: la única forma de "alcanzarlo" es subir a su altura, donde primero se dispara la
    colisión del avión (`return die('Colision con helicoptero')`, ~línea 418), procesada **antes**
    que las balas en el frame (obstáculos ~400 vs balas ~445).
  - **Arreglos posibles (cuando se decida tocar):** (a) dar apuntado vertical a las balas hacia una
    mira/altura de la mira; (b) bajar el rango de spawn del helo para que quede a tiro del vuelo bajo;
    (c) ensanchar la hitbox vertical de bala vs helo y usar la `y` con bobbing; (d) `hp: 1`.

---

## 5. Controles

| Acción      | Teclado                                        | Táctil                        |
|-------------|------------------------------------------------|-------------------------------|
| Gas (subir) | mantener `ARRIBA`/`W` — si soltás, el avión cae| arrastre directo (60 % izq.)  |
| Esquivar    | `←`/`→`/`A`/`D`                                | ídem arrastre                 |
| Picada      | `ABAJO`/`S`                                    | —                             |
| Disparar    | `X` / `ESPACIO` / `K`                          | mantener derecha-arriba       |
| Turbo       | `SHIFT` / `C`                                  | mantener derecha-abajo        |
| Empezar     | cualquier tecla / tocar                        | —                             |

---

## 6. Mapa del código (`index.html`, todo en un `<script>` IIFE)

- **Constantes:** `W,H` (320×180), `HOR` (horizonte), `F` (distancia focal de la proyección),
  `PZ` (z del avión, plano de juego), `COAST` (metros de tierra).
- **`P`** = paleta (Atlántico Sur; acento naranja `#e8a33d`). **`FACTS`** = fichas históricas.
- **Estado global** + `reset()` + `cam`. Estados: `'menu'` → `'takeoff'` → `'play'` → `'dead'`.
- **Audio** (`audio`, `beep`, `boom`, `eng` = motor continuo por oscilador).
- **Input:** teclado (`inp`) + puntero (zona izquierda = timón por arrastre; derecha = fuego/turbo).
- **Mundo:** `waveNow`, `multOf`, `spawn`, `proj` (proyección 3D→2D, factor `k = F/z`),
  `explodeAt`, `popup`, `die`.
- **`update(dt)`:** rama `takeoff`, rama no-play (menú/muerte), y la simulación principal
  (velocidad, maniobra, viento, puntaje/racha, estela, radar, cañón, spawn, colisiones, partículas).
- **`draw()`** + helpers: `drawSea` (mar + pista), `drawWake`, `drawObstacle`, `drawPlaneSprite`,
  `drawHUD`, `drawTakeoff`, `drawMenu`, `drawDead`, `wrapText`, `bar`, `px`.
- **Loop:** `requestAnimationFrame`, `dt` clampeado a 33 ms.

---

## 7. Tuning rápido (dónde tocar el gamefeel)

Todo en el `<script>` de `index.html`:

- Velocidad base/techo: `spdBase = Math.min(150, 62 + t*2.8)` · turbo `*1.5` · tope `280`.
- Aceleración por racha: `rachaVel` (bajar el `0.12` si x25/x30 se vuelve injugable).
- Viento: acumula sobre `plane.y > 16`, frena hasta `-35 %` (`windF`); turbulencia `95/70`.
- Multiplicador: `multOf()` · racha 2 s/nivel (`Math.floor(streak/2)`), gracia `0.45`.
- Radar: `alt > 30`. Densidad de obstáculos: `nextSpawn = max(34, 52+rnd*42 - t*0.8)` (en metros).
- Combustible: drenaje `3.2` (+`4.2` turbo), bidón `+30`. Near-miss: margen `< 3`.
- Despegue: duración total `toT >= 3`, rotación arranca en `toT > 1.35`, costa `COAST = 230`.

---

## 8. Pipeline de arte (para Photoshop)

- Todo el arte actual es **placeholder dibujado por código**. Trabajar a **320×180**, paleta corta
  (16–32 colores), exportar PNG sin suavizado (vecino más cercano) a `assets/`.
- **Avión** (vista trasera): hoy son rects en `drawPlaneSprite()`. Un sprite de ~**40×16 px** con
  2–3 frames de alabeo (nivel / banqueo izq / der) lo reemplaza directo.
- **Obstáculos:** se dibujan escalados por distancia (factor `k`). Dibujarlos grandes (~48 px) y
  dejar que el juego los achique.
- Paleta actual en el objeto `P`: cielo `#2a3540`, mar `#2e4a4e`, metal/bruma `#93a7ab`, acento `#e8a33d`.

---

## 9. Próximos pasos (backlog priorizado)

1. **Terminar y verificar el despegue** desde Puerto Argentino (ver §4) y **republicar el artifact**.
2. **Corrida de bombardeo:** fragata al final de un tramo; ventana de altura para armar la espoleta
   (dato histórico: bombas lanzadas muy bajo no llegaban a armarse). Le da clímax a cada run.
3. **Desafío diario por seed** compartido: competitivo real sin servidor.
4. **Reabastecimiento en vuelo con KC-130** (extender el run).
5. **Museo:** fichas desbloqueables + aviones jugables con stats (A-4, Dagger, Super Étendard, Pucará).
6. **Sprites propios** en Photoshop; sonido con más cuerpo.
7. **Leaderboard online.**
8. Sugerencia de tono: contactar asociaciones de veteranos (CECIM) si el juego crece; evitar gore
   y nombres de caídos sin permiso.

---

## 10. Git

- Rama `main`. Cambios **sin commitear** (`index.html`, `README.md` modificados; `lateral.html`
  y `ESTADO.md` sin trackear). No se commiteó nada todavía por decisión del autor.
- Al retomar, un buen primer commit agrupa: versión frontal + mecánicas + despegue + docs.

_En homenaje a los pilotos y veteranos de Malvinas._
