# PLAN — «LA VOLTERETA»: la pirueta del backflip del F-22, traducida al A-4

> **Estado: estudio + plan por fases, sin implementar (16/8).** Pedido de Matías: estudiar
> [este reel](https://www.instagram.com/reels/DZAVDzGx44E/) (*"F-22 Raptor backflip and
> flare dispense"*, F-22 Demo Team) y describir la pirueta para hacerla en el juego.
> Se miró cuadro por cuadro (33 s de video; la maniobra ocupa ~9 s).
>
> Leer antes: `docs/ARQUITECTURA.md` (manda), `docs/sistemas/PIRUETAS.md` (la referencia
> jugable), `src/data/moves.js` (el catálogo y su gramática de combos) y
> `systems/moves.js` (quien las vuela).

## 1. La maniobra, cuadro por cuadro *(lo que hace el Raptor)*

| t (video) | qué pasa | lo que se VE |
|---|---|---|
| 0–4 s | vuelo nivelado → tirón brutal de cabeceo hasta la **vertical** | el avión se para de trompa; visto desde atrás/abajo se le ve la panza |
| 4–7 s | **subida vertical** perdiendo velocidad | una columna recta de vapor/estela detrás; el avión se achica |
| 7–9 s | **el vértice**: con velocidad casi cero, pasa de la vertical HACIA ATRÁS (la voltereta: cabeceo más allá de 90° hasta quedar invertido y de trompa abajo) mientras **dispara un abanico de bengalas** que se abren como un ramo | la firma del video: el ramo de humo colgado en el cielo y el avión dado vuelta encima |
| 9–12 s | **caída de trompa**, acelerando | la silueta baja por el lado opuesto al de subida; el ramo queda atrás |
| 12–13 s | **recuperación**: tirón hasta nivelar | sale a la altura de entrada, más lento |

**La física que lo permite**: toberas vectoriales (TVC) — el Raptor gira sobre sí mismo a
velocidad casi nula, donde ningún avión convencional tiene mando. **Las tres firmas
visuales**: la columna vertical, el ramo en el vértice, la silueta que se da vuelta.

## 2. El problema de canon y su solución *(antes de diseñar)*

1. **El A-4 no tiene toberas vectoriales**: la voltereta post-pérdida es físicamente
   imposible. PERO el Skyhawk es un avión acrobático de verdad — **los Blue Angels volaron
   A-4F de 1974 a 1986** (confirmar en PREGUNTAS_HISTORICAS): loops, verticales y
   *hammerheads* eran su show. El pariente honesto de la voltereta es el **hammerhead /
   loop cerrado**: subida vertical, pivote en el vértice, caída de trompa — **visto desde
   atrás es casi la misma imagen**. Y las piruetas del juego ya son "poderes estilo juego
   de pelea" (la propia cabecera de `moves.js`): el arcade tiene permiso.
2. **El A-4 del 82 no tenía bengalas** (canon del proyecto: sin chaff ni bengalas). El
   ramo se reemplaza por lo que SÍ es física real: el **abanico de vapor** — los vórtices
   de punta de ala (ya existen en `render/plane.js`, apagados por ahora) + el cono de
   condensación del tirón de G. Las bengalas quedan como perilla cosmética **apagada**,
   decisión aparte de Matías (si se prenden, solo fuera de campaña).
3. **Y un regalo narrativo**: es LA maniobra "que no se puede". El banco del Pichón tiene
   ese ritual escrito (`upgRitual`: *"ESO NO SE PUEDE." … "A VER. MOSTRAME."*). LA
   VOLTERETA entra al pool **desde m10, de la libreta póstuma** (como ASCENSO y SOBRE EL
   RADAR en PLAN_CAMPANA §3): la última cosa imposible que el Pichón imaginó.

## 3. El diseño en el juego

### La pirueta (`data/moves.js`)
`volt: { dur: 2.0, name: 'LA VOLTERETA', steer: null, fire: false, turbo: false, tight: true }`
— la más larga del catálogo junto a SOBRE EL RADAR, sin control (es el showpiece), sin
cañón, perfil de colisión encogido (vertical/invertido = de canto → habilita el roce "con
estilo"). **Combo propuesto: `⟳↑ ↓↑`** (stick derecho arriba = mirá al cielo; izquierdo
pica-y-tirá). Cumple la gramática: 3 toques, dos manos, no es prefijo de nadie
(comparte `⟳↑` con el ASCENSOR pero diverge en el 2º toque) — **validar con el detector
de prefijos antes de fijarlo**; candidato B: `⟳↑ ←→`.

### Los cuatro tiempos (comprimidos a 2.0 s de arcade)
| beat | dur | qué hace `moves.js` | lo que se ve |
|---|---|---|---|
| **tirón** | 0.35 s | `plane.y` sube con aceleración fuerte; cabeceo 0→90° | la panza, la columna de vapor arranca |
| **vertical** | 0.45 s | sigue subiendo desacelerando hasta `VOLT_H` (o el techo disponible) | el avión se achica hacia arriba |
| **el vértice** | 0.5 s | velocidad vertical ≈ 0; cabeceo 90→270° (se da vuelta); **abanico de vapor**; `tempo` baja a 0.6 un instante | la firma: invertido, colgado, el abanico abriéndose |
| **caída + salida** | 0.7 s | cae de trompa hasta la altura de entrada; cabeceo 270→360°; sale **a `SPD_MIN`** | la silueta baja, el abanico queda atrás, sacudón al nivelar |

**El precio** (lo que la hace una decisión y no un truco): sale sin velocidad — un
segundo largo de vulnerabilidad y el ×10 perdido hasta volver a bajar. Como el HIGH YO-YO,
"sangra velocidad"; más.

### Para qué sirve (los ganchos con lo que ya existe)
1. **Contra LA COLA**: entra en `CAZA_MV_FUERZA` — fuerza el sobrepaso como BREAK/JINK,
   y además **alarga la ventana ×1.5**: el Harrier pasa por abajo y vos caés sobre su cola.
   Es literalmente para lo que el F-22 hace la voltereta en la demo (vencer a un
   perseguidor con agilidad post-pérdida). La contraparte: salís lento — si no lo
   ahuyentás en esa ventana, te recola con ventaja.
2. **Super-salto**: en el vértice estás por encima de todo lo bajo (olas, carpas, AA) —
   esquive vertical total… pagado con la salida lenta.
3. **Estilo**: el roce en vertical paga el bonus `tight`; ejecutarla a ras y salir viva
   es la jugada de firma.
4. **EL PULSO**: como cinemática de premio de la zona brava (la más larga y vistosa que
   el director puede componer).

### Arte
Los frames que faltan: panza (cabeceo ~90°), invertido/dorso (vértice), trompa abajo
(~−70°). Las hojas actuales llegan a ±32°. **Producción por el pipeline existente**
(`tools/bake_planes.html`: renderiza el modelo a cualquier ángulo → fila nueva `volt` de
12 cuadros, cabeceo 0→360°, vista trasera, para las 6 hojas). **Placeholder hasta
entonces**: ±32° existentes + el frame nivelado rotado 180° para el invertido (rotación
exacta, sin aliasing) + achique por altura. La pirueta se juega con placeholder desde V1.

## 4. Fases

| fase | entrega | criterio |
|---|---|---|
| **V0** | Entrada en `data/moves.js`, combo validado contra la regla de prefijos, perillas `VOLT_*` (altura, tiempos, `SPD` de salida, abanico), strings es/en, sonda `__mv('volt')` | `check` verde; el combo dispara y ninguno de los existentes se rompe |
| **V1** | La cinemática en `systems/moves.js`: los 4 tiempos (perfil de `y`, cabeceo 0→360°, sangrado de velocidad, salida a `SPD_MIN`), con frames placeholder | se ve la voltereta entera desde atrás; `feel` idéntico fuera de la pirueta |
| **V2** | El teatro: abanico de vapor en el vértice (vórtices de punta reencendidos + cono de G), columna de vapor en la subida, caída del `tempo` a 0.6 en el vértice, sacudón al nivelar, sonido (motor a fondo → silencio del vértice → rugido de caída) | captura del vértice: la firma del video sin bengalas |
| **V3** | Gameplay: `CAZA_MV_FUERZA` + ventana ×1.5, super-salto (colisión `tight` + altura), bonus de estilo, **pool del Pichón desde m10 con el ritual**; en CICLO/PATRIA disponible | fixture: fuerza el sobrepaso y alarga la ventana; salir lento es medible |
| **V4** | Arte real: la fila `volt` horneada para las 6 hojas (`bake_planes`) + integración en `data/planes.js`/`render/plane.js` | la voltereta sin placeholder |
| **V5** | EL PULSO: la voltereta como cinemática de la zona brava (vía el director cuando exista, o el beat del PULSO) + PIRUETAS.md actualizado + fixture `npm run volt` | docs y gate |

**Perillas**: `VOLT_DUR 2.0` · `VOLT_H 34` (unidades de subida, capada por el techo) ·
`VOLT_TEMPO 0.6` · `VOLT_EXIT_SPD = SPD_MIN` · `VOLT_WINDOW_K 1.5` · `VOLT_FLARES false`.

## 5. Qué NO hacer

1. **No bengalas en campaña** (canon). Perilla cosmética apagada; si algún día se prende,
   fuera de campaña.
2. **No tocar `core/physics.js`**: la pirueta es dueña del avión solo durante `run.mv`
   (como todas); `npm run feel` idéntico.
3. **No hacerla gratis**: sin el precio de salida no es decisión, es botón de esquive.
4. **No un combo con repetición vertical** ni prefijo de otro (reglas de `moves.js`).
5. **No esperar al arte**: placeholder desde V1; la fila horneada es producción.

## 6. Divergencias *(completar durante la implementación)*

- *(vacío)*
