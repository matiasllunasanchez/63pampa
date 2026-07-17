# RASANTE

Arcade 2D de vuelo rasante ambientado en el Atlántico Sur, 1982. Homenaje a los
pilotos y veteranos de Malvinas, centrado en la adrenalina del vuelo a ras del mar.

**Jugar:** abrir `index.html` en el navegador (doble clic alcanza — no necesita build ni servidor).

## El loop

- Volar bajo multiplica el puntaje: **x2** (≤15 m) / **x5** (≤8 m) / **x10** (≤4 m).
- Tocar el agua es fatal. Las olas se mueven — el margen nunca es fijo.
- Volar alto llena la barra de **radar**: al detectarte, te lanzan un misil que persigue.
- **Cañón 20mm** con calentamiento: derriba globos (+150), helicópteros (+300, 2 impactos)
  y misiles (+400). Mástiles, fragatas y agua NO se destruyen — esquivar es la habilidad central.
- **Combustible** como reloj del run; se recoge en vuelo.
- Récord local (`localStorage`) y fichas históricas reales en cada derribo.

## Controles

| Acción  | Teclado                | Táctil / mouse            |
|---------|------------------------|---------------------------|
| Subir   | mantener `ESPACIO`/`W` | mantener en mitad izquierda |
| Disparar| `X` / `K`              | tocar en mitad derecha    |

## Arte (pipeline Photoshop)

Todo el arte actual es **placeholder dibujado por código**. Resolución nativa del
juego: **320×180 px** (escala limpia a 720p/1080p/4K). Para reemplazar:

- Avión: sprite **16×8 px** (hoy es la grilla `PLANE_SPR` en `index.html`).
- Trabajar con paleta corta (16–32 colores). Paleta actual en el objeto `P` del script:
  cielo plomizo `#2a3540`, mar `#2e4a4e`, metal/bruma `#93a7ab`, acento naranja `#e8a33d`.
- Exportar PNG sin suavizado (vecino más cercano) a `assets/`.

## Tuning

Los números del gamefeel están al principio del `<script>` de `index.html`:
gravedad y empuje (`plane.vy += ...`), velocidad de scroll (`spd`), frecuencia de
spawn (`spawnT`), drenaje de combustible, bandas de multiplicador (`multOf`),
umbral de radar (`alt > 34`).

## Próximos pasos (ideas)

- [ ] Desafío diario por seed compartido (competitivo sin servidor)
- [ ] Corrida de bombardeo: fragata al final del tramo, ventana de altura para armar la espoleta
- [ ] Reabastecimiento en vuelo con KC-130
- [ ] Museo: fichas desbloqueables con hechos y aviones (A-4, Dagger, Super Étendard, Pucará)
- [ ] Sprites propios en Photoshop, sonido con más cuerpo
- [ ] Leaderboard online

*En homenaje a los pilotos y veteranos de Malvinas.*
