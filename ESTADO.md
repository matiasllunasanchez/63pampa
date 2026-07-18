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
| `assets/`      | Arte fuente. `pampav1_op.webp` = sprite del avión (embebido en index.html). |

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
  aviones enemigos +250 (2 impactos), misiles +400. Mástiles, fragatas y agua **no** se destruyen
  (esquivar sigue siendo la habilidad central).
- **Avión enemigo de frente (`jet`)**: reemplaza parte de los helos en el spawn (helo 10 %, jet 8 %;
  antes helo 18 %). Viene **de frente y cierra más rápido** (`spd+45`) para dar sensación de combate
  aéreo. Blanco aéreo con el mismo trato que el helo (auto-apuntado vertical + hitbox horizontal `5.6`
  = envolvente de colisión, así que todo jet que pueda chocarte también es derribable). Sprite frontal
  placeholder (alas anchas con leve alabeo, fuselaje/canopy, deriva, nariz roja) en `drawObstacle`.
  Verificado por simulación: 0 muertes por colisión al disparar en todo el barrido de altura/velocidad/offset.
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
  directo por arrastre (no usa gas). **HUD:** palanca de gas vertical en el borde derecho
  (`throttle`, valor suavizado lerp `dt*7`, solo indicador — no afecta la física); en teclado
  refleja ARRIBA, en táctil usa `vy>0` como proxy; muestra "SIN GAS" con combustible en 0.
- **Récord local** (`localStorage: rasante_frontal_best`).
- **Fichas históricas** reales en la pantalla de derribo (array `L().facts`, ver i18n).
- **Multi-idioma (i18n):** TODOS los textos visibles viven en la tabla `STRINGS` (bloque al inicio del
  script), agrupados por código ISO. Hoy están `es` (base) y `en`. Nada de texto suelto en el resto del
  código: todo pasa por `T('clave', {params})` (interpola `{n}`) o `L().facts`. Las causas de muerte se
  guardan como **clave** (`death_helo`, etc.) y se resuelven al dibujar, así el cambio de idioma es en vivo.
  El chrome de la página (header, footer con `<kbd>`, `aria-label`) también sale de `STRINGS` vía
  `applyChrome()`. **Selección de idioma** (en orden): `?lang=xx` en la URL · `localStorage 'rasante_lang'`
  · idioma del navegador · `es`. **Tecla `L`** cicla el idioma en vivo (y lo persiste). **Para agregar un
  idioma:** copiar el bloque `es`, traducir los valores (dejar las llaves y los `{n}` intactos) y sumarlo
  con su código. **Empaquetado Windows/Steam:** el launcher fija el idioma con `?lang=xx` o escribiendo
  `localStorage 'rasante_lang'`. Verificado en navegador: es↔en cambia todo (menú, HUD, derribo, fichas,
  chrome) y `?lang=` le gana a `localStorage`.

### ℹ️ Nota de verificación (sesión del 17/7)
El panel de preview **ralentiza `requestAnimationFrame` cuando no está en foco**, así que no se pudo
volar en vivo hasta mar abierto. Lo verificado esta sesión: el **despegue/pista** se vio renderizando
bien (carreteo, cuenta regresiva, balizas); el **agua de puntos** se validó con un banco aislado
(`wtest.html`, ya borrado) que reusa la misma matemática (`proj`/`seaH`/`drawSeaDots`/`WATER`) —
se confirmó la onda animando en tono mar y violeta. El juego real corre **sin errores de consola**.
Pendiente menor: jugar una corrida completa a mar abierto para el ajuste fino del gamefeel del agua
(densidad `SPX/SPZ`, brillo de la paleta `WATER`, amplitud de `seaH`).

### 🐞 Bugs conocidos

- **~~No se puede derribar el helicóptero disparándole: en vez de destruirlo, el jugador se
  colisiona~~ — CORREGIDO (sesión 17/7).** Se aplicó la opción (a): **apuntado vertical
  automático** del cañón.
  - Diagnóstico original: las balas salían a la altura exacta del avión y viajaban horizontales,
    sin apuntado vertical, mientras el helo aparece a 5–21 m (`y: 5 + random*16`, ~línea 203) y
    para el multiplicador se vuela a ~4 m → las balas pasaban por debajo y nunca impactaban. La
    única forma de "alcanzarlo" era subir a su altura, donde se disparaba antes la colisión del
    avión (`die('Colision con helicoptero')`) que las balas.
  - **Solución en dos partes (en `update`, cañón/balas):**
    1. **Apuntado vertical (Y):** al disparar, la bala **engancha el blanco aéreo con `hp` más
       cercano en su carril** y guarda su altura en `b.ty`; en el update de balas `b.y` hace homing
       hacia `b.ty` (`b.y += (b.ty-b.y) * min(1, dt*14)`), subiendo/bajando hacia el helo. Tolerancia
       vertical de impacto del helo ensanchada (`< 3` en vez de `< 2.4`).
    2. **Banda de x (fix del "volvió a pasar", sesión 17/7):** quedaba una **banda de desalineación
       horizontal** letal: para **matar** el helo la bala exigía `|Δx| < 3.4`, pero para **morir** por
       colisión bastaba `|Δx| < 5.6`. Con la x entre 3.4 y 5.6 (y a la altura del helo, típico volando
       rasante) le disparabas, las balas pasaban al costado, sobrevivía y te lo comías. Se **igualó la
       hitbox horizontal bala-vs-helo a la envolvente de colisión** (`< 5.6`) y se abrió la ventana de
       enganche del lock a `< 5.6`. Ahora **todo helo que pueda colisionar también es derribable**.
  - **Efecto:** se derriba el helo **volando rasante a 4 m**, sin necesidad de subir ni colisionar.
    Verificado con simulación numérica (node) del loop completo (incluida la colisión avión-helo, que
    corre antes que las balas en el frame): barriendo altura del helo 5–21 m, velocidad 62/90/150 y
    offset de x 0–6 m, **cero muertes por colisión** al disparar (antes: 30 muertes en la banda 3.4–5.6).

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
- **`P`** = paleta (Atlántico Sur; acento naranja `#e8a33d`). **`STRINGS`** = tabla i18n con todos los
  textos por idioma (incluye `facts`); acceso vía `T('clave', {params})` / `L()` (ver §4, Multi-idioma).
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

- El resto del arte (obstáculos, mar, pista) sigue **dibujado por código**. Trabajar a **320×180**,
  paleta corta (16–32 colores), exportar PNG/WEBP con transparencia a `assets/`.
- **Avión: sprite propio del Pampa** (`assets/pampav1_op.webp`, 977×448, vista trasera, con alfa).
  Se **embebe como data URI** dentro de `index.html` (constante `PLANE_SRC`) para que el artifact
  sea autocontenido — la CSP del artifact bloquea recursos externos. `drawPlaneSprite()` lo dibuja
  a `PW=54` px con `drawImage`, conserva el alabeo (rotación por `plane.vx`), la sombra sobre el agua
  y los fogonazos; el postquemador extra sale solo con turbo. Si la imagen no carga, cae al sprite
  de rects (fallback). Para actualizar el sprite: reemplazar el webp y re-inyectar el base64
  (`python3` reemplazando `PLANE_SRC`), o correr de nuevo el paso de embebido.
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
