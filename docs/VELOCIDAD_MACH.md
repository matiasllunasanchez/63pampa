# VELOCIDAD Y NÚMERO MACH — diseño

> **Estado: PROPUESTA. Nada de este documento está implementado todavía.**
> Es el diseño acordado para: velocidad máxima por avión, escalones Mach con multiplicador de
> puntaje, efecto de barrera del sonido, y el aporte de velocidad de cada pirueta.

Relacionado: [PIRUETAS.md](PIRUETAS.md) (las maniobras que aportan velocidad) ·
[ROADMAP.md](ROADMAP.md) #10 (características distintas por avión).

---

## 1. Velocidades máximas reales

Datos de los aviones que volaron en Malvinas (ambos bandos). Los que **ya están en el juego** van
marcados; el resto queda como referencia para cuando entren (ROADMAP #10.1, #10.2, #20).

| avión | Mach | km/h | rol | ¿en el juego? |
|---|---|---|---|---|
| **Mirage IIIEA** | 2.2 | **2.350** | Interceptor | ✅ |
| **IAI Dagger** | 2.1 | **2.250** | Caza / ataque | ✅ |
| **Super Étendard** | 1.3 | **1.380** | Ataque naval | ✅ |
| **A-4B Skyhawk** | 0.91 | **1.080** | Ataque | ✅ (como `sky`) |
| **A-4Q Skyhawk** | 0.91 | **1.080** | Ataque naval | ✅ |
| Sea Harrier FRS.1 | 0.95 | 1.180 | Superioridad aérea | ⬜ enemigo (ROADMAP #20) |
| Harrier GR.3 | 0.9 | 1.080 | Ataque terrestre | ⬜ enemigo |
| Avro Vulcan | 0.93 | 1.030 | Bombardero estratégico | ⬜ |
| Canberra Mk.62 | — | 930 | Bombardero | ⬜ |
| MB-339 | — | 900 | Ataque ligero | ⬜ (ROADMAP #10.2) |
| Learjet 35A | — | 870 | Reconocimiento | ⬜ |
| T-34C Turbo Mentor | — | 520 | Entrenador | ⬜ |
| IA-58 Pucará | — | 500 | Apoyo cercano | ⬜ (ROADMAP #10.1) |
| Short Skyvan | — | 320 | Transporte | ⬜ |

### ⚠️ Falta el PAMPA 63

El **Pampa 63** (IA-63) está en el roster jugable pero **no figura en la tabla**. Su velocidad
máxima real es **819 km/h (Mach 0.66)** — dato externo, no de la tabla de arriba. **Hay que
confirmarlo antes de cargarlo**, porque lo deja como el avión más lento del juego por un margen
grande y eso define todo su rol.

---

## 2. Cómo se traduce al juego

El juego trabaja en **unidades de mundo por segundo** (`run.spd`) y el HUD las muestra en km/h con
un factor fijo:

```
km/h = run.spd × 4.2          (render/hud.js)
1 unidad/s = 4,2 km/h
```

**Mach 1 = 1.235 km/h = 343 m/s → `run.spd` 294.** Ese es el número que dispara el efecto de
barrera del sonido.

### Velocidad máxima de cada avión, en unidades del juego

| avión | km/h reales | `spdMax` | Mach a nivel del mar |
|---|---|---|---|
| Mirage IIIEA | 2.350 | **560** | 1,90 |
| IAI Dagger | 2.250 | **536** | 1,82 |
| Super Étendard | 1.380 | **329** | 1,12 |
| A-4 Skyhawk | 1.080 | **257** | 0,87 |
| A-4Q | 1.080 | **257** | 0,87 |
| Pampa 63 *(a confirmar)* | 819 | **195** | 0,66 |

### ⚠️ Los Mach de la tabla NO coinciden a nivel del mar

El Mirage figura como **Mach 2.2**, pero 2.350 km/h **a nivel del mar** son **Mach 1,90**. No es un
error de la tabla: los Mach de catálogo se miden **en altura** (a 11.000 m el sonido viaja más
lento, ~1.062 km/h, y los mismos km/h dan un Mach más alto).

**RASANTE se juega entre 0 y 68 m** — o sea, a nivel del mar. Entonces hay que elegir una fuente
de verdad:

| opción | consecuencia |
|---|---|
| **A. Los km/h mandan** (recomendada) | El Mach se calcula a nivel del mar. El Mirage tope **Mach 1,90**, no 2,2. Coherente con el HUD, que muestra km/h, y con la barrera del sonido a 1.235 km/h |
| B. Los Mach de catálogo mandan | Habría que mostrar Mach 2,2 con 2.350 km/h en pantalla: dos números que no cierran entre sí a la vista del jugador |

**Recomendación: opción A.** Un solo sistema de unidades, verificable en pantalla.

---

## 3. ⚠️ Conflicto: hoy los aviones ya vuelan MÁS RÁPIDO que su máximo real

Esto es lo más importante de decidir antes de implementar. Hoy **ningún avión tiene velocidad
propia**: todos comparten la misma curva (`speedTarget` en `core/physics.js`).

| situación actual | `run.spd` | km/h | Mach |
|---|---|---|---|
| Tope sin afterburner | 280 | 1.176 | 0,95 |
| Tope con afterburner al máximo (`afterTier` 5) | 490 | **2.058** | **1,67** |

Comparado contra los máximos reales:

- **Mirage (560) y Dagger (536)** están **por encima** del tope actual: ganarían techo. ✅
- **Super Étendard (329)**, **A-4 / A-4Q (257)** y **Pampa (195)** están **muy por debajo**:
  aplicar su tope real sería un **recorte del 45-60 %** respecto de lo que vuelan hoy.

Un A-4 pasaría de 2.058 km/h a 1.080 km/h. **Eso no es un ajuste, es rebalancear el juego entero**
(el roce, la distancia por misión, la ventana de esquive y el puntaje por tiempo dependen de la
velocidad). Tres caminos:

| opción | qué implica |
|---|---|
| **A. Topes reales tal cual** | Máxima fidelidad histórica. El A-4 se vuelve un avión lento y el Mirage/Dagger, claramente superiores. **Hay que rebalancear misiones y dificultad.** Y el A-4 —el avión de la campaña— sería de los más lentos, lo que choca con su rol narrativo |
| **B. Escala comprimida** (recomendada) | Se mantiene el **orden** y las proporciones relativas, pero comprimido contra el rango jugable actual. Ej.: mapear \[500…2350\] km/h reales a \[1.176…2.058\] km/h de juego. El Mirage sigue siendo el más rápido y el Pampa el más lento, sin romper el balance |
| C. Solo el techo máximo | Los topes reales se usan **solo** como techo del afterburner; la velocidad base sigue compartida. El más chato de implementar, pero la diferencia entre aviones casi no se siente |

**Recomendación: opción B**, y dejar los km/h reales visibles en la ficha del avión (menú de
selección) como dato histórico, aunque el juego use la escala comprimida.

---

## 4. Escalones MACH

### Las categorías (referencia física)

| categoría | rango Mach | km/h | ¿alcanzable en el juego? |
|---|---|---|---|
| Subsónico | < 0.8 | < 988 | sí (la mayor parte del vuelo) |
| **Transónico** | 0.8 – 1.2 | 988 – 1.482 | sí |
| **Supersónico** | 1.2 – 5.0 | 1.482 – 6.175 | sí, hasta ~Mach 1,9 |
| Hipersónico | 5.0 – 10.0 | 6.175 – 12.250 | no |
| Alto hipersónico | 10.0 – 25.0 | 12.250 – 30.626 | no |

Las dos últimas quedan documentadas por completitud pero **no entran al juego**: ningún avión de
1982 se acerca.

### Los 5 escalones jugables

Se proponen **5 escalones** — no los enteros de Mach (con techo Mach 1,9 solo habría dos y el
sistema no tendría progresión).

| escalón | Mach | km/h | `run.spd` | qué es |
|---|---|---|---|---|
| **MACH 0.8** | 0.80 | 988 | 235 | Entrada en transónico |
| **MACH 1.0** | 1.00 | 1.235 | 294 | **BARRERA DEL SONIDO** |
| **MACH 1.2** | 1.20 | 1.482 | 353 | Entrada en supersónico |
| **MACH 1.5** | 1.50 | 1.853 | 441 | Supersónico sostenido |
| **MACH 1.8** | 1.80 | 2.223 | 529 | Techo real (solo Mirage y Dagger) |

### Qué escalón alcanza cada avión

Con topes reales (opción A de la sección 3):

| avión | escalón máximo |
|---|---|
| Mirage IIIEA (560) | **MACH 1.8** |
| IAI Dagger (536) | **MACH 1.8** |
| Super Étendard (329) | **MACH 1.0** — rompe la barrera, apenas |
| A-4 / A-4Q (257) | **MACH 0.8** |
| Pampa 63 (195) | ninguno |

Eso hace que **elegir avión importe de verdad**: solo dos aviones ven los escalones altos y el
efecto de barrera del sonido. Con la opción B (escala comprimida) habría que recalcular, pero el
orden se mantiene.

---

## 5. ⚠️ Conflicto: ya existe un sistema de escalones

**El afterburner sostenido ya es un sistema de 5 escalones** (`core/physics.js`):

```
AFTER_STEP = 2      // segundos de turbo + rasante para subir un escalón
AFTER_MAX  = 5      // escalones
AFTER_GAIN = 0.16   // +16 % de velocidad por escalón
AFTER_CAP  = 42     // +42 unidades de techo por escalón
```

Ya tiene popup al subir de escalón, oleada de líneas de velocidad, sacudón, beep ascendente, y se
muestra en el HUD como `»N` al lado de los km/h.

Los escalones Mach y los del afterburner **se pisan**: dos sistemas de 5 niveles, los dos ligados
al turbo, los dos con popup y líneas de velocidad. Implementar Mach encima sin tocar el
afterburner dejaría al jugador con dos contadores compitiendo.

| opción | qué implica |
|---|---|
| **A. Mach REEMPLAZA la vista del afterburner** (recomendada) | El afterburner queda como **motor interno** (sigue dando velocidad y techo) pero deja de mostrarse; lo que el jugador ve y persigue es el escalón MACH, que es un número con significado real. Un solo indicador |
| B. Conviven | El afterburner es "cuánto empujás" y Mach "qué tan rápido vas". Más honesto conceptualmente, pero son dos HUD y dos multiplicadores que hay que balancear entre sí |
| C. Mach absorbe al afterburner | Se borra `afterTier` y los escalones Mach dan el `AFTER_GAIN`/`AFTER_CAP`. El más limpio, pero **cambia la física de vuelo** y rompe la relación con la racha rasante (hoy el afterburner exige volar a ras, no solo rápido) |

**Recomendación: opción A.** Conserva la mecánica de "aguantar a ras con turbo" —que es el corazón
del juego— y le pone al jugador un objetivo legible en su lugar.

---

## 6. Efectos por escalón

Cada escalón alcanzado tiene que **verse**, con el mismo vocabulario visual que hoy usa el turbo.

**Lo que el turbo ya hace hoy** (para reusar, no reinventar):

| efecto | dónde vive |
|---|---|
| La cámara se va para atrás (se levanta en el mundo) | `BOOST_LIFT` en `systems/flight.js` |
| El avión se achica un poco | `boostSc` en `render/plane.js` |
| Llama del postquemador | `flame()` en `render/plane.js` |
| Oleada de líneas de velocidad radiales | `streaks` (al subir de escalón de afterburner) |
| Sacudón + beep ascendente | `run.shake`, `beep()` |

**Propuesta por escalón** (intensidad creciente):

| escalón | efecto |
|---|---|
| MACH 0.8 | Líneas de velocidad permanentes, tenues. Cámara un paso más atrás |
| MACH 1.0 | **Barrera del sonido** (sección 7) |
| MACH 1.2 | Líneas más densas y largas · viñeta que se cierra en los bordes |
| MACH 1.5 | Temblor sostenido del sprite (como el roce, más suave) · llama más larga |
| MACH 1.8 | Todo al máximo + tinte cálido en los bordes de la pantalla |

### Indicador en pantalla

Va **arriba del velocímetro** (que está centrado abajo, `render/hud.js` línea del `KM/H`):

```
        MACH 1.2   ×3
        1.482 KM/H
```

- Texto grande en el color de acento, con el multiplicador al lado.
- Al subir de escalón: popup con el nombre + destello, igual que hoy hace el afterburner.
- Al bajar de escalón: el número baja sin fanfarria (no castigar con ruido visual).

### Puntaje

Dos cosas distintas, como se pidió:

1. **Bonus por alcanzar** un escalón por primera vez en la corrida (un pago único, escalado:
   más alto = más puntos).
2. **Multiplicador por segundo** mientras te mantenés en él, aplicado a **todo** lo que sumás.

> ⚠️ **A balancear con cuidado**: el puntaje por tiempo ya se multiplica por altitud y racha
> rasante (`run.multShow`, hasta ×30). Un multiplicador Mach encima se **compone** con ese. Antes
> de elegir números hay que decidir si suma o multiplica — con lo segundo, un Mach 1.8 a ras
> podría valer cientos de veces un vuelo normal.

---

## 7. Barrera del sonido

Se dispara al cruzar **1.235 km/h (`run.spd` 294)** hacia arriba. Es el momento más espectacular
del sistema y merece tratamiento propio.

**El fenómeno real** es la *singularidad de Prandtl-Glauert*: un cono de vapor condensado alrededor
del avión al atravesar Mach 1.

### Especificación visual

> ⚠️ **"Blur" no puede ser un desenfoque real.** El juego es pixel art con
> `imageSmoothingEnabled = false`; un desenfoque gaussiano rompería la estética entera (es la misma
> razón por la que las trazadoras dejaron de usar `ctx.stroke()`). El equivalente en pixel art es
> el **smear**: copias del sprite desplazadas y translúcidas, que es como se dibuja el movimiento
> rápido en animación tradicional.

| elemento | cómo |
|---|---|
| **Cono de vapor** | 3-4 arcos concéntricos abriéndose hacia atrás desde el morro, en blanco azulado translúcido, que crecen y se desvanecen en ~0,4 s. Dibujados con rects (como la corona de la explosión pixel del derribo) |
| **Smear** | 2-3 copias del sprite del avión desplazadas hacia atrás, con alfa decreciente — el recurso que ya usan los fantasmas del tonel (`rolling` en `render/plane.js`) |
| **Destello** | Un frame de blanco a pantalla completa, a alfa bajo |
| **Sacudón** | `run.shake` alto, decayendo |
| **Líneas de velocidad** | Oleada radial (`streaks`), la más densa del juego |
| **Sonido** | Estampido: `boom()` grave y fuerte + ducking de la música (`duck()`) |

**Al bajar de Mach 1** no se repite el efecto — solo se apaga. Y hay que poner **histéresis**
(p. ej. re-disparar recién al bajar de Mach 0,97 y volver a cruzar) o el efecto se dispararía en
bucle oscilando alrededor del umbral.

---

## 8. Aporte de velocidad de las piruetas

Hoy las piruetas **ya afectan la velocidad**. Estos son los valores actuales, verificados
simulando cada maniobra desde `spd = 62`:

| maniobra | efecto actual | turbo permitido hoy |
|---|---|---|
| Low Yo-Yo | **+34/s** (×campana) → +35 % | ✔ |
| Split-S | **+26/s** en la picada → +21 % | ✗ |
| Break Turn | −16 %/s | ✗ |
| High Yo-Yo | −14 %/s | ✗ |
| Pop-Up | −10 %/s | ✗ |
| S-Turn · Jink · Terrain Masking | neutras | Masking ✔ |

### Propuesta

La idea acordada es que la pirueta sea **una herramienta para escalar Mach**, y que el turbo
cambie lo que aporta:

| maniobra | sin turbo | con turbo | por qué |
|---|---|---|---|
| **Low Yo-Yo** | +34/s (como hoy) | **+55/s** | Es *la* maniobra de energía: picar y remontar con el motor a fondo |
| **Split-S** | +26/s | **+45/s** | Picada asistida. **Requiere habilitar el turbo en Split-S** (hoy está bloqueado) |
| **Terrain Masking** | 0 | **+18/s** | Premiar el vuelo rasante sostenido, que es la fantasía del juego |
| **Pop-Up** | −10 %/s | −5 %/s | El turbo compensa parte de lo que cuesta trepar |
| Break Turn · High Yo-Yo | sin cambios | — | Son maniobras que *cuestan* energía a propósito |
| S-Turn · Jink | neutras | — | Son de esquive puro |

> El diseño se apoya en el intercambio que el juego ya tiene (`applyEnergy` en `core/physics.js`:
> picar convierte altura en velocidad). Las piruetas de picada deberían **amplificar** ese
> intercambio, no saltearlo — si no, se vuelven un botón de "más velocidad" desconectado del vuelo.

---

## 9. Decisiones pendientes

Nada se implementa hasta resolver estas cinco:

1. **Velocidad del Pampa 63** — no está en la tabla. ¿Se confirman los 819 km/h reales?
2. **Escala de velocidades** (sección 3) — ¿topes reales (rebalancear el juego) o escala
   comprimida? *Recomendado: comprimida.*
3. **Mach vs afterburner** (sección 5) — ¿Mach reemplaza la vista del afterburner, conviven, o lo
   absorbe? *Recomendado: reemplaza la vista.*
4. **Composición del multiplicador** (sección 6) — ¿el multiplicador Mach suma o multiplica contra
   el de altitud y racha rasante?
5. **Fuente de verdad del Mach** (sección 2) — ¿km/h a nivel del mar (Mirage tope 1,90) o los Mach
   de catálogo? *Recomendado: km/h.*

---

## 10. Dónde tocar cuando se implemente

| pieza | archivo |
|---|---|
| `spdMax` por avión | `src/data/planes.js` |
| Tope de velocidad y curva | `speedTarget` / `AFTER_*` en `src/core/physics.js` |
| Escalones Mach, umbrales y multiplicadores | `src/data/tuning.js` (perillas) + módulo nuevo tipo `src/systems/mach.js` |
| Indicador MACH sobre el velocímetro | `src/render/hud.js` |
| Cono, smear y destello de la barrera | `src/render/plane.js` (va pegado al sprite) |
| Aporte de velocidad de las piruetas | `src/systems/moves.js` + flags `turbo` de `src/data/moves.js` |
| Ficha del avión con su velocidad real | `src/render/menus.js` |
