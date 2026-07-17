# RASANTE

Arcade 2D de vuelo rasante ambientado en el Atlántico Sur, 1982. Homenaje a los
pilotos y veteranos de Malvinas, centrado en la adrenalina del vuelo a ras del mar.

**Jugar:** abrir `index.html` en el navegador (doble clic alcanza — no necesita build ni servidor).

Dos versiones en el repo:

- `index.html` — **vista frontal** (pseudo-3D detrás del avión, estilo After Burner). La principal.
- `lateral.html` — el primer prototipo de scroll lateral, conservado como referencia.

## El loop (vista frontal)

- **Despegue de Puerto Argentino**: cada run arranca en la pista de la BAM Malvinas con
  cuenta regresiva 3…2…1; el avión carretea y asciende solo, y el control llega a los 3 s
  ("CONTROL LIBRE!"). Se cruza la costa y empieza el mar abierto.
- Volar bajo multiplica el puntaje: **x2** (≤16 m) / **x5** (≤9 m) / **x10** (≤4,5 m).
- **Racha rasante**: sostener la zona x10 sube el multiplicador cada 2 s: **x15 → x20 → x25 → x30**,
  con beeps ascendentes y el borde de la pantalla encendiéndose. Subir de la zona la corta (0,45 s de gracia).
- **El multiplicador acelera el avión**: x5 da +5% de velocidad, x10 da +10%, y cada nivel
  de racha suma +12% (hasta ~+58% en x30). Más recompensa = menos tiempo de reacción:
  la velocidad es premio y castigo a la vez.
- **Viento en contra en altura**: por encima de ~16 m la resistencia crece con el tiempo
  (hasta **-35%** de velocidad), con ráfagas visibles, turbulencia que sacude el avión y
  aviso en el HUD. Arriba no hay refugio: sos lento, te pinta el radar y el viento te zamarrea.
- **Estela y rocío**: debajo de ~9 m el avión deja una estela en V sobre el agua que corre
  hacia la cámara; debajo de ~4,5 m el rocío explota y la pantalla vibra. Es la referencia
  visual de altura y la principal sensación de velocidad.
- **Agua "malla de puntos"** (efecto onda, inspirado en el fondo WebGL de boostivity.ai): el mar
  se dibuja como una grilla de puntos en perspectiva desplazada por ondas superpuestas
  (`drawSeaDots` + `seaH`), que fluye hacia la cámara. Estilo conmutable en `WATER_STYLE`:
  `'sea'` (tono Atlántico, por defecto) o `'violet'` (neón tipo boostivity). Paleta en el objeto `WATER`.
- Tocar el agua es fatal. Las olas suben y bajan — el margen nunca es fijo.
- **Turbo**: +60% de velocidad y **puntaje x2**, pero quema combustible mucho más rápido.
- **Near-miss**: rozar un obstáculo sin chocarlo da **+75** (y esquivar un misil también).
- Volar alto llena la barra de **radar**: al detectarte, te lanzan un misil que persigue.
- **Cañón 20mm** con calentamiento: derriba globos (+150), helicópteros (+300, 2 impactos)
  y misiles (+400). Mástiles, fragatas y agua NO se destruyen — esquivar es la habilidad central.
- **Combustible** como reloj del run; se recoge en vuelo. Sin combustible el avión se hunde.
- Récord local (`localStorage`) y fichas históricas reales en cada derribo.

## Controles

| Acción    | Teclado                  | Táctil                          |
|-----------|--------------------------|---------------------------------|
| Gas (subir) | mantener `ARRIBA` / `W` — **si soltás, el avión cae** | arrastrar en el 60% izquierdo (control directo) |
| Esquivar  | `←` / `→` / `A` / `D`    | ídem arrastre                   |
| Picada    | `ABAJO` / `S`            | —                               |
| Disparar  | `X` / `ESPACIO` / `K`    | mantener derecha-arriba         |
| Turbo     | `SHIFT` / `C`            | mantener derecha-abajo          |

**Vuelo a gas:** la gravedad tira siempre (`G=22 m/s²`); mantener ARRIBA empuja (`TH=55`);
ABAJO acelera la caída (`DIVE=30`). Sin gas desde 12 m tocás el agua en ~1 s; en la zona
x10 (~4 m) el margen es ~0,5 s. Sin combustible no hay empuje: el avión se hunde solo.
En táctil se mantiene el control directo por arrastre (más manejable en pantalla chica).

## Arte (pipeline Photoshop)

Todo el arte actual es **placeholder dibujado por código**. Resolución nativa del
juego: **320×180 px** (escala limpia a 720p/1080p/4K). Para reemplazar:

- Avión (vista trasera): hoy se dibuja con rects en `drawPlaneSprite()`; un sprite
  de ~**40×16 px** con 2–3 frames de alabeo (nivel / banqueo izq / der) lo reemplaza directo.
- Obstáculos: se dibujan escalados por distancia (`drawObstacle`, factor `k` = px por metro),
  así que conviene dibujarlos grandes (p. ej. 48 px) y dejar que el juego los achique.
- Paleta corta (16–32 colores), en el objeto `P` del script: cielo plomizo `#2a3540`,
  mar `#2e4a4e`, metal/bruma `#93a7ab`, acento naranja `#e8a33d`.
- Exportar PNG sin suavizado (vecino más cercano) a `assets/`.

## Tuning

Los números del gamefeel están en el `<script>` de `index.html`:

- Velocidad base y techo: `spdBase = Math.min(150, 62 + t*2.8)` · turbo: `*1.5` · tope absoluto `280`
- Aceleración por racha: `rachaVel = 1 + rasLevel*0.12 + (x10: 0.10 / x5: 0.05)`, con suavizado `dt*3`
- Viento: se acumula sobre `plane.y > 16` (tope 6 s, ~0,8 s de gracia), frena hasta
  `-35%` (`windF`), decae al doble de velocidad al bajar; turbulencia bajo `windF < 0.97`
- Despegue: duración 3 s (`toT`), rotación a `1.35` s, tierra firme `COAST = 230` m,
  primer obstáculo en `nextSpawn = 320` m
- Agilidad: aceleraciones `115/105`, velocidades máx. `±30/±24`
- Bandas de multiplicador: `multOf()` · radar: `alt > 30`
- Racha rasante: 2 s por nivel (`Math.floor(streak/2)`), tope x30 (`rasLevel` máx. 4), gracia `0.45`
- Estela: arranca bajo 9 m (`lowI = 1 - alt/9`) · rocío: umbrales `2.8 / 4.5 / 7` m en `nSpray`
- Densidad de obstáculos: `nextSpawn = max(34, 52+rnd*42 - t*0.8)` (en metros)
- Combustible: drenaje `3.2` (+`4.2` con turbo), bidón `+30`
- Ventana de near-miss: margen `< 3` en el chequeo de paso (`dx < 3 && dy < 3`)

## Próximos pasos (ideas)

- [ ] Desafío diario por seed compartido (competitivo sin servidor)
- [ ] Corrida de bombardeo: fragata al final del tramo, ventana de altura para armar la espoleta
- [ ] Reabastecimiento en vuelo con KC-130
- [ ] Museo: fichas desbloqueables con hechos y aviones (A-4, Dagger, Super Étendard, Pucará)
- [ ] Sprites propios en Photoshop, sonido con más cuerpo
- [ ] Leaderboard online

*En homenaje a los pilotos y veteranos de Malvinas.*
