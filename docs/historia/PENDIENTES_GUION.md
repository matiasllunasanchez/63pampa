# PENDIENTES — lo que falta decidir

**35 ítems abiertos.** Lo cerrado —93 ítems— está en [RESUELTOS_GUION.md](RESUELTOS_GUION.md) y el arte en
[RETRATOS_PENDIENTES.md](RETRATOS_PENDIENTES.md) (caras) y
[IMAGENES_PENDIENTES.md](IMAGENES_PENDIENTES.md) (cuadros).

Marcá **una** casilla por ítem: `DEJAR COMO ESTÁ` · `REEMPLAZAR / AGREGAR LO DEL GUION` ·
`LA PROPUESTA` _(una tercera vía mía, justificada arriba)_ · `DEBATIR`.
Los **🔴** rompen una cadena de plantado-y-cobro.

## Dónde está el trabajo

|              | ítems |                                                                                        |
| ------------ | :---: | -------------------------------------------------------------------------------------- |
| **Guion**    |  21   | `M10-02` · `M13-04` `M13-09` `M13-10` `M13-11` · `M14-01`→`M14-11` · `M14-16`→`M14-20` |
| **Sistemas** |   8   | `G-02` → `G-09`                                                                        |
| **Técnico**  |   6   | `T-02` `T-03` `T-04` `T-05` `T-10` `T-11`                                              |

**El grueso es M14: 16 ítems**, y son las escenas más importantes del juego. Los dos finales ya
están escritos (`epiM14A` / `epiM14B`); falta todo el medio — cómo se enteran, el ritual invertido,
el reloj, las dos muertes reescritas, el tonel barril, y el cierre común con la post-créditos.

Y falta **una pieza de motor**: nadie elige cuál de las dos secuencias de final corre.

---

# 1. Guion

## MISIÓN 10

### M13-04 · «Una vez más.» / «Una vez más. La última.»

El juego agrega «**La última**». El guion corta antes: nadie dice que no vuelven.

- [ ] DEJAR COMO ESTÁ · [X} REEMPLAZAR POR EL GUION · [ ] DEBATIR

# 2. Sistemas

### G-02 · Los barks (§9c, canal 2)

`HEAVY MACHINE GUN` la primera vez que se sostiene la metralleta, con las reglas: cartel sin
voz, **una sola vez por campaña**, nunca sobre una línea de historia, y **el banco se achica en
M9–M13 y desaparece del todo en M14**. No existe ningún sistema de barks.

- [ ] DEJAR COMO ESTÁ _(no entra al juego)_ · [X] AGREGAR LO DEL GUION · [ ] DEBATIR

### G-04 · El daño acumulado visible en el avión (§9d, ley 4)

Parches, remaches nuevos, pintura que no coincide, misión tras misión, **y nadie lo menciona**.
Es de arte/gameplay, no de `story.js`, pero está sin definir.

- [ ] DEJAR COMO ESTÁ _(no entra al juego)_ · [X] AGREGAR LO DEL GUION · [ ] DEBATIR

### G-07 · Los dialectos (§9) — pasada fina pendiente

Estado hoy: el Turco casi no dice **«aca»** (su comodín); el Colorado no dice **«angá»** ni
**«pue»** ni una vez; el Gitano dice «culiao/culiau» seguido; el Turco dice «Ura» **dirigido a
una persona**, que su propia regla prohíbe.

- [ ] DEJAR COMO ESTÁ · [X] HACER LA PASADA de dialectos · [ ] DEBATIR

### 🔴 G-08 · El objetivo — **hecha la mitad; falta la de motor**
**Aplicado**: las 14 tarjetas de misión llevan ahora una segunda línea `OBJETIVO · …`
(«Entrar al Callejón, soltar sobre la fragata HMS Ardent y salir», etc.). Eso resuelve el problema
para el que lee la tarjeta.

**Falta la segunda capa**, que es motor: **Cóndor diciéndolo por radio en el primer tramo**, para el
que ya está volando. La cañería existe (`charla:` en los tramos), pero hay que decidir si se escribe
una charla de objetivo por misión o si se genera desde el mismo texto de la tarjeta.

- [ ] ALCANZA con la tarjeta · [ ] SUMAR la radio de Cóndor · [ ] DEBATIR

### G-09 · Orden de posmisión

También de tu playtest: **la pantalla de mejoras tiene que venir inmediatamente después de la
misión**, antes de la carta de Mateo. Y los títulos como **pantalla negra unos segundos** antes
de la escena con imagen. Y **«DÍA SIGUIENTE»** entre misiones.

- [ ] DEJAR COMO ESTÁ · [X] APLICARLO · [ ] DEBATIR

---

# 3. Técnico

### T-04 · La numeración doble

Los ids internos son de la campaña vieja de 12 (`M3_*` = misión **4**, `M10_*` = misión **12**) y
las dos misiones nuevas usan la nueva (`M03_*` = misión **3**, `M10_HUECO` = misión **10**).
Resultado: **`M10_TARJETA` y `STORYM10_TARJETA` son dos misiones distintas**, y `M5_ESCUCHA` vive
en `epiM5` junto a `M4_EPI` y `M4_CARTA`.

Con las ~90 líneas de M14 y las escenas nuevas por delante, esto se va a poner peor. Renombrar
todo a la numeración nueva es mecánico y se puede hacer con un script, en un commit aparte.

- [ ] DEJAR COMO ESTÁ · [X] RENOMBRAR todo a la numeración nueva · [ ] DEBATIR

### T-05 · Nada de esta sesión está commiteado

`story.js`, `screens.js`, `GUION_3.md`, las herramientas y los retratos están todos sin commitear.

- [ ] DEJAR COMO ESTÁ · [X] COMMITEAR antes de seguir · [ ] DEBATIR

### T-11 · El modo DIÁLOGOS del selector no ve las charlas

`charlasDe()` en `game.js` arma su recorrido leyendo `t.radio` de cada tramo. Los tramos del Narwal
ahora traen `t.charla`, así que **el recorrido de diálogos de m4 y m5 quedó vacío**: en el juego se
ven, en el selector no.

No lo toqué porque es motor y no data, y porque `irACharla()` llama a `radioTramo()`, que es la otra
puerta — hay que enseñarle a distinguir las dos.

- [ ] DEJAR COMO ESTÁ · [X] ARREGLAR el selector · [ ] DEBATIR
