# PLAN — EL PESO: que las cinemáticas vuelen como el PASILLO

> **Estado: IMPLEMENTADO — P0 a P5 cerradas (17/8), más LA SALIDA del §8.**
> `npm run check` verde con `npm run cine` adentro; `npm run feel` idéntico al baseline en todas
> las fases (era el gate de P1 y se sostuvo hasta el final).
> Pedido de Matías, mirando el premio del PULSO desde el menú CINEMÁTICAS: *"está BIEN LOGRADA de
> base, pero es MUY DURA — cuando se juega en PASILLO los movimientos del avión son mucho más suaves
> y reales; quizá deberíamos usar eso. Armá un plan de mejoras reutilizables para esa cinemática y
> otras futuras."*
>
> **Es un plan del DIRECTOR**, no del PULSO: lo que falta no es de esta cinemática, es de todas las
> que vengan. Complementa a [PLAN_DIRECTOR_CINEMATICAS.md](PLAN_DIRECTOR_CINEMATICAS.md) (C0 hecha)
> y se mete entre C0 y C1 — los actores de C1 van a necesitar exactamente lo mismo.

## 0. El diagnóstico *(medido, no supuesto)*

Se trazó el premio cuadro a cuadro con `__qdbg` + `__cdbg` (alt, dist, roll, maniobra, cámara):

```
0.09s pirueta  mv=splits  roll=-0.62  alt=1.2  dist=2600  cam=chase
0.46s pirueta  mv=splits  roll=-3.84  alt=1.2  dist=2600
0.73s pirueta  mv=splits  roll=-6.24  alt=1.2  dist=2600
0.82s pirueta  mv=null    roll= 0.00  alt=1.2  dist=2600   ← la maniobra terminó a los 0,78 s
1.10s pirueta  mv=null    roll= 0.00  alt=1.2  dist=2600   ← 0,3 s de aire muerto
1.19s suelta                          alt=1.2  dist=2600  cam=cabina
2.75s muerte                          alt=1.2  dist=2600
```

**`alt` y `dist` no cambian en toda la cinemática.** Seis causas, de la más grave a la más chica:

| # | causa | dónde | por qué en PASILLO no pasa |
|---|---|---|---|
| 1 | **El avión no se mueve.** `cine.js` corre `movesSystem()`, que escribe `vx/vy/bank/pitch`… y nadie integra. Es `flight.js` quien hace `plane.x += vx·dt`, y en `'pulso'` no corre. La pirueta es un sprite girando en el lugar | `systems/cine.js` `update()` | `flight.js` integra cada cuadro |
| 2 | **La pirueta arranca a 1,2 m del agua.** El piso de seguridad del SPLIT-S (`plane.y < 3` → salta la picada) la corta a los 0,78 s de sus 1,15: **la maniobra más violenta del catálogo se vuela sin su tramo central**, y deja 0,3 s de aire muerto antes de la suelta. Peor: el compás `PIRUETA` dura 1,15 fijo sin importar qué pirueta salió | `data/cines.js` (`PIRUETA: 1.15`) + `moves.js` (piso) | la picada real del ataque arranca con altura |
| 3 | **El mundo no corre.** `run.dist` fijo = el mar no se desplaza, no hay estela, no hay líneas de velocidad. Una foto | nadie avanza `dist` en `'pulso'` | `run.dist += run.spd·dt` |
| 4 | **La cámara está clavada.** En PASILLO `cam.x/y` siguen al avión **con retardo** (`dt·7` / `dt·3.2`) — ese retardo ES el peso. En la cinemática `cam` no se toca | `flight.js` 195–207 | la cámara llega tarde, como una de verdad |
| 5 | **Actitudes sin relajación.** `moves.js` clava `bank = ±1` / `pitch = ±1`; es `flight.js` quien las devuelve a cero con peso (`dt·9`) al terminar la maniobra. En la cinemática el avión queda banqueado/cabeceado para siempre | `flight.js` 210–226 | lerp de vuelta |
| 6 | **Silencio mecánico y cortes secos.** `engineOff()` al entrar a la prueba y nadie lo prende en el premio (en PASILLO el motor sigue a `run.spd`; hasta el relevo lo prende: *"la escena no queda muda"*). El deshielo 0,08×→1× es lineal en 0,5 s; el corte `chase→cabina` es seco; la cabina baja con rampa lineal | `systems/pulso.js`, `data/cines.js` | motor continuo, sin rampas lineales |

**La causa raíz es una sola:** el director (C0) encadena verbos, pero **no hay una cama de vuelo
debajo**. `flight.js` es integrador + reglas de juego (colisión, nafta, puntaje, spawn) en un solo
bloque, y no se puede correr en una cinemática sin arrastrar el juego entero. El RELEVO DEL
ESCUADRÓN ya chocó con esto y lo resolvió a mano en `game.js` (avanza `dist` a 0,4×, mueve los
obstáculos, prende el motor) — es el prototipo, y es código que no se reusa.

> **La lección para todas las cinemáticas:** lo suave del PASILLO no está en las curvas de las
> piruetas (esas son las mismas) — está en que **el mundo sigue corriendo debajo, la cámara llega
> tarde y las actitudes vuelven con peso.** Una cinemática que no corre eso se ve como un modelito
> girando, por buena que sea su timeline.

## 1. La idea: LA CAMA DE VUELO *(y por qué no viola el §6.4)*

Extraer de `flight.js` **la parte que no es juego** a una función propia — `stepVuelo(dt, o)` —:
integración de posición + topes del carril + seguimiento de cámara + relajación de alabeo/cabeceo
+ estela + líneas de velocidad + motor. **Sin** colisión, nafta, puntaje, spawn, radar, racha.

- `flight.js` la llama (es lo que hacía inline) → **el PASILLO no cambia un bit**; lo custodia
  `npm run feel`, que tiene que seguir idéntico.
- El director la llama en cada cinemática → **el avión de la cinemática es el mismo avión del
  pasillo, con el mismo peso**, porque es literalmente la misma función.

No es un segundo sistema de movimiento (§6.4 del director): es el primero, separado de las reglas
de juego para poder invocarlo sin ellas. Y el RELEVO (C1) pasa a usarla también: su bloque a mano
en `game.js` desaparece.

## 2. Los verbos nuevos *(cada uno sale de una causa del §0)*

| verbo | qué hace | causa |
|---|---|---|
| `vuelo: { avance: 0.35, motor: true }` | prende la cama: integra, sigue con la cámara, relaja actitudes, mueve el mundo a `avance`×`run.spd` (el relevo usa 0,4), prende el motor | 1 · 3 · 4 · 5 · 6 |
| `pose: { alt: 12, ramp: 0.4 }` | lleva el avión a una altura (un objetivo de `vy` sobre la misma cama) — **el SPLIT-S necesita aire**: subir un poco y picar con la maniobra es además la doctrina real del ataque | 2 |
| `t: '$tPirueta'` (ligadura, no verbo) | el compás de la pirueta dura **lo que dura LA pirueta** (`MOVES[id].dur`), no 1,15 fijo. Reusable: cualquier beat puede medirse contra la duración real de su actor | 2 |
| `ease` en todas las rampas (`tempo`, `cam.off`, `fade`, `letterbox`, `pose`) | `'lineal'` (default, lo de hoy) · `'suave'` (smoothstep) · `'entra'` / `'sale'`. Nada cambia si no se pide | 6 |
| `cam: { modo, corte: 'seco' \| 'parpadeo' }` | el corte seco queda; `parpadeo` es dos cuadros de negro (el ojo que cierra) para cuando el corte no cae en un golpe | 6 |

## 3. Fases

| fase | entrega | criterio de cierre |
|---|---|---|
| ~~**P0 · La vara**~~ ✅ | `__cdbg` amplía su foto con `alt / x / vx / vy / bank / pitch / roll / cam` y `npm run cine` (nuevo fixture) **traza** cualquier timeline y mide qué se mueve y cuánto salta — "duro" deja de ser una palabra y pasa a ser un número. `npm run cine -- <id>` traza una sola; `CINE_TRAZA=1` imprime la traza entera | **hecho 17/8/2026**: el fixture reproduce el diagnóstico del §0 sin que nadie lo escriba — «altura 0.00 · carril 0.00 · avance 0 m · cámara 0.00» y los tres AVISOS. Baseline en §6 |
| ~~**P1 · La cama de vuelo**~~ ✅ | `stepVuelo()` extraída de `flight.js` a `systems/vuelo.js`; `flight.js` la llama. **Cero cambio de comportamiento** | **hecho 17/8/2026**: `feel` IDÉNTICO (33 asserts, diff vacío), `smoke` y `pulso` verdes, 87 unit |
| ~~**P2 · El director vuela**~~ ✅ | verbo `vuelo` en `cine.js`; el premio lo prende en `t: 0`; el motor vuelve. *(El relevo migra en C1, cuando se toque su timeline — migrarlo hoy sería tocarlo sin necesidad.)* | **hecho 17/8/2026**: la traza pasó de «carril 0.00 · avance 0 m · cámara 0.00» a «carril 12.94 · avance 145 m · cámara 3.12» |
| ~~**P3 · La pose y el tiempo real**~~ ✅ | verbo `pose` + **instantes como SUMA** (`t: ['$tPir', 0.85]`). El premio: pose a 12 en 0,4 s → la pirueta entera → todo lo que sigue medido desde que ELLA termina | **hecho 17/8/2026**: altura 0.00 → **4.11 m**; el compás de la pirueta dura lo que dura la maniobra (SPLIT-S 1,15 · BREAK TURN 0,7) y no quedan 0,3 s de aire muerto |
| ~~**P4 · Los cortes**~~ ✅ | `ease` en todas las rampas (`'lineal'` default · `'suave'` · `'entra'` · `'sale'`); deshielo a 0,8 s suave; la cabina baja con `'sale'` | **hecho 17/8/2026**: cuatro curvas con test propio (los extremos son sagrados y una curva inexistente cae a lineal). `corte: 'parpadeo'` NO se hizo — ver divergencia 15 |
| ~~**P5 · La red**~~ ✅ | `npm run cine` recorre **todas** las timelines de `CINES` y **falla** si alguna no mueve el avión, no avanza el mundo, deja la cámara clavada o teletransporta algo. Entra a `check` | **hecho 17/8/2026**: `check` verde con `FIXTURE CINE: OK` adentro. Una timeline que se olvide del verbo `vuelo` ahora cae en el gate |

**Por qué ese orden:** P1 es un refactor puro con red (`feel`) — si se hace primero, todo lo demás
son verbos nuevos sobre código ya probado. P0 antes que P1 porque sin la vara no se puede demostrar
que P4 mejoró algo: "se ve más suave" no cierra una fase.

## 4. Qué NO hacer

1. **No tocar las curvas de `moves.js`** (§6.4 del director). La suavidad viene de que el mundo se
   mueva debajo, no de cambiar la pirueta.
2. **No hacer la pirueta más lenta para que "se vea".** Es la misma que tecleó el jugador; la
   cinemática la muestra, no la reinterpreta.
3. **No un segundo integrador.** Si la cama necesita algo que `flight.js` no tiene, se agrega a
   `flight.js` y lo usan los dos.
4. **No cambiar el `feel`.** P1 es un refactor: diff vacío contra el baseline o no cierra.
5. **No `ease` global.** Cada rampa declara el suyo; el default sigue siendo lineal, así lo que ya
   está en data no cambia sin que alguien lo pida.
6. **No más de ~8 s sin manos** (director §6.2): la pose agrega 0,4 s — el premio queda en ~5,5 s.

## 5. Perillas *(crear en P2, en `data/cines.js`)*

`CINE_VUELO = { AVANCE: 0.35 · POSE_ALT: 12 · POSE_T: 0.4 · DESHIELO: 0.8 · SALTO_MAX: 0.35 }`
— `SALTO_MAX` en radianes por cuadro es el umbral de P5. Los retardos de cámara y la relajación de
actitudes **no son perillas nuevas**: son los de `flight.js`, y ésa es la gracia.

## 6. Divergencias *(completar durante la implementación)*

**Baseline de `npm run feel` (antes de P0):** 33 asserts, `FEEL: OK`.

**Baseline de `npm run cine` (P0, el estado que hay que mejorar):**

```
pulso_premio:
   ✓ corre y termina · 5.82s · 96 lecturas · partes: pirueta → suelta → impacto → muerte
     se mueve  · altura 0.00 m · carril 0.00 · avance 0 m · camara 0.00
     salta max (por lectura ~60 ms) · alabeo 0.000 · cabeceo 0.000 · rolido 0.846 · camara 0.000
```

**Traza al cerrar P3** *(comparar con el baseline de arriba)*:

```
   ✓ corre y termina · 6.23s · partes: pirueta → suelta → impacto → muerte
     se mueve  · altura 4.11 m · carril 12.94 · avance 145 m · camara 3.12
     salta max (por lectura ~60 ms) · alabeo 0.000 · cabeceo 1.000 · rolido 0.948 · camara 0.490
```

### Divergencias de P0

1. **La vara mide POR LECTURA (~60 ms), no por cuadro.** La sonda se consulta por IPC desde el
   fixture: pedirla a 60 Hz mediría el IPC y no la cinemática. Sirve para comparar dos versiones
   con la misma vara —que es para lo que existe— y no como ángulo por cuadro absoluto. El umbral de
   P5 se va a calibrar en esta unidad.
2. **Los ángulos se miden DANDO LA VUELTA.** El primer intento midió crudo y el SPLIT-S salió como
   la maniobra más dura del catálogo con un salto de 6,24 rad: es `moves.js` devolviendo `mvRoll` de
   2π a 0 al soltar el avión, y en pantalla **no se ve nada** porque 2π es el mismo ángulo que 0.
   Envuelto a [-π, π] el mismo tramo mide 0,846. Sin esa corrección la vara habría empujado a
   "arreglar" la única parte que ya estaba bien.
3. **`cam` chocó de nombre**: `systems/cine.js` ya exporta `cam()` (el verbo de la cámara del
   director) y la cámara del mundo es `cam` de `core/state.js`. Entra como `camMundo` — renombrar
   cualquiera de las dos habría dejado un nombre malo en su propio archivo.
4. **El fixture INFORMA, no falla, por los números de peso.** Hoy sólo falla por lo que ya tiene que
   estar bien (que cargue, corra, termine y no ensucie la consola). Convertir las mediciones en
   umbrales es P5 — ponerlos antes de que el peso exista sería dejar el catálogo en rojo a propósito
   durante cuatro fases, y un fixture que se espera rojo deja de mirarse.

### Divergencias de P1

5. **La cama quedó en `systems/vuelo.js` y NO se llevó la estela ni el avance del mundo.** El plan
   §1 los listaba, pero en `flight.js` no son contiguos con el resto: el avance vive arriba de todo
   (`run.dist += run.spd·dt·chAvance()`) y la estela abajo, con reglas de juego en el medio.
   Mudarlos habría cambiado el ORDEN dentro del cuadro, que es exactamente lo que `feel` mide. Se
   extrajo el bloque contiguo —integrar, topes, cámara, actitudes— que es el que causa las tres
   fallas más grandes (1, 4 y 5), y el avance lo hace el verbo `vuelo` con su propia perilla.
6. **La INTENCIÓN se quedó en `flight.js`, el PESO se fue a la cama.** `stepVuelo` recibe los
   objetivos de alabeo y cabeceo ya resueltos: el vuelo los saca de la palanca (mezcla la intención
   con la velocidad real, pide que la tecla se mantenga) y una cinemática los pasa en cero. Lo
   compartido es el lerp — que es donde vive el peso — y no la política de qué quiere el piloto.
7. **`BOOST_LIFT` y `CAM_PAN` se mudaron con la cámara que los usa.** Quedaban en `flight.js`
   describiendo un movimiento que ya no está ahí.

### Divergencias de P2

8. **El verbo `vuelo` avanza el mundo con el `dt` REAL, no con el del mundo dilatado.** La
   cinemática corre en tiempo de pared (es la película) y `avance` es la perilla que la mantiene
   pegada al mundo. Con el `dt` dilatado, el medio segundo de deshielo dejaba el mar clavado justo
   en el arranque, que es cuando más se nota.
9. **`run.spd` quedaba en 6 al abrir el PULSO desde una herramienta** (`reset()` deja el avión
   quieto en cabecera) y el mundo avanzaba 13 m en toda la cinemática. Quien llega al buque de
   verdad llega a velocidad de crucero: el verbo `pulso` de la api de PRUEBAS ahora entrega el
   avión a 62, la misma con la que el despegue lo entrega. Es el tercer arreglo que sale de mirar
   el premio suelto — los otros dos fueron la libreta vacía y el buque de proa.

### Divergencias de P3

10. **Los instantes pasaron a poder ser SUMAS** (`t: ['$tPir', 0.85]`) en vez de agregar un verbo.
    Era lo mínimo para que un compás dure lo que dura la cosa que muestra: el de la pirueta medía
    1,15 s fijos, y con un BREAK TURN (0,7 s) sobraba medio segundo de avión nivelado sin nada que
    pase. La regla de siempre se mantiene: **si algún término queda sin ligar, el beat no ocurre**,
    y de hecho así quedó escrito el segundo estallido (`['$tPir', D_IMPACTO, '$secOff']`).
11. **El cabeceo salta 1,0 y no se toca.** Lo escribe `moves.js` como POSE de la maniobra
    (`plane.pitch = -1` cuando arranca la picada del SPLIT-S), no como una interpolación — y hace
    exactamente lo mismo en el PASILLO. Suavizarlo sería cambiar el vuelo del juego, no la
    cinemática: rompe `feel` y está prohibido por el §4.1. Queda medido y declarado.
12. **La pose no pelea con la pirueta**: se apaga sola mientras `run.mv` está activo. Durante la
    maniobra el dueño del avión es `moves.js`, y un segundo piloto empujando altura sería
    exactamente el "segundo sistema de movimiento" que el §4.3 prohíbe.

### Divergencias de P4

13. **Cuatro curvas, y `'lineal'` sigue siendo el default.** Es la condición para poder agregarlas
    sin repasar lo que ya estaba escrito en data: una timeline vieja se comporta exactamente igual
    hasta que alguien pide otra curva. Una curva con nombre inexistente cae a lineal en vez de
    romper — una cinemática no puede quedarse trabada por un typo en un adorno.
14. **El deshielo pasó de 0,5 s lineal a 0,8 s `'suave'`.** Con la rampa lineal se notaban DOS
    escalones —el instante en que el mundo empieza a acelerar y el instante en que para— y el
    efecto se leía como un interruptor con retardo, no como salir de la cámara lenta.
15. **`corte: 'parpadeo'` no se construyó.** El corte `chase → cabina` cae exactamente en la suelta,
    que es un golpe: ahí un corte seco se lee como intención. El parpadeo es para un corte que NO
    cae en un golpe, y hoy no hay ninguno — construirlo sería un verbo sin cliente, que es la
    definición de código muerto. Queda anotado para la primera cinemática que lo necesite.

### Divergencias de P5

16. **La red falla por lo ESTRUCTURAL, no por los saltos.** Que el avión se mueva, que el mundo
    avance y que la cámara persiga son las tres cosas que definen "vuela" — y las tres son la misma
    falla: te olvidaste del verbo `vuelo`. Los saltos quedan como información con un techo generoso
    (`TECHO`), porque el cabeceo salta 1,0 por las poses de `moves.js` y eso es el juego, no un
    defecto de la cinemática: un umbral fino ahí obligaría a "arreglar" el vuelo del pasillo.

## 8. LA SALIDA *(pedido del 17/8, sobre P3 ya cerrada)*

> *"No frenes al avión en el ataque, que SIGA y atraviese el barco o que vaya hacia arriba antes de
> disparar, que simule un ataque real. Los aviones nunca se quedaban en el lugar mientras el barco
> se hundía."*

Tenía razón y era un agujero del diagnóstico original: el §0 midió que el avión **no se movía**,
pero no que la cinemática **no terminaba en nada**. Un ataque real no termina cuando se suelta:
termina cuando saliste. Es la doctrina que el juego ya tiene escrita para la PASADA —*a ras, saltar,
soltar y **salir***— y le faltaba al premio.

**Qué se hizo**, todo en la timeline (ningún verbo nuevo):

- En el **mismo instante de la suelta**: `pose` a 26 m con rampa larga (la trepada de escape),
  `vuelo: { avance: 1, boost: true, estelas: true }` — gas a fondo, el mundo al doble de velocidad
  y las líneas de velocidad del pasillo. El impacto y la muerte del buque **pasan mientras te vas**.
- El buque **se queda atrás**: `ESC_DROP` lo hace caer en el cuadro a medida que trepás. En una
  cámara 2D —que mira siempre para adelante— es lo único que puede decir *"te lo dejaste abajo"*.

### Divergencias de la salida

17. **La `pose` tuvo que pasar a SOSTENER la altura en vez de expirar.** Con una pose que se
    apagaba, el avión se quedaba con la velocidad vertical colgada —en una cinemática no hay
    gravedad ni intercambio de energía que la frene, eso es de `flight.js`— y la trepada terminaba a
    **50 m** en vez de a los 26 pedidos: subía para siempre. Ahora persigue la altura y se asienta
    sola; `ramp` pasó a ser el peso del cambio y no un plazo.
18. **Las líneas de velocidad nacen más afuera que las del pasillo** (radio 70 en vez de 26). Salen
    del punto de fuga, y en una cinemática el punto de fuga es justo donde está el blanco: apiladas
    ahí se veían como un erizo blanco encima del buque que se hundía.
19. **La RED DE RADAR se apagó en `'pulso'`.** Apareció sola cuando la salida pasó a trepar de
    verdad (la trepada cruza `RADAR_ALT`) y lo que se veía era una reja roja tapando el buque. Es un
    instrumento del PASILLO —dice a qué altura te ven— y en el premio no hay nada que decidir con
    eso. Mismo criterio que el nombre del buque, que ya se callaba.

## 9. EL RITMO *(pedido del 17/8: "más fluida, más lenta")*

Verbo nuevo: **`ritmo`** — la velocidad de LA PELÍCULA. Escala el `dt` de todo lo que el director
maneja: el reloj de la timeline, la pirueta, la cama de vuelo y el mundo corriendo debajo. Bajarlo
pone la escena entera en cámara lenta **sin desincronizar nada**, que es la diferencia con estirar
duraciones a mano.

Es distinto de `tempo`, y la distinción importa: **`tempo` es a qué velocidad corre el mundo detrás
del vidrio; `ritmo` es a qué velocidad corre la cámara.** El premio los pone en el mismo número
(`RITMO = 0.7`) desde una sola constante — escritos por separado se desincronizan en cuanto alguien
toque uno solo.

Medido: el premio pasó de ~6,2 s a ~8,9 s de reloj de pared, y los saltos bajaron **sin tocar
ninguna curva** — rolido 0,84 → 0,59, cámara 1,05 → 0,73 por lectura. Fluidez y lentitud resultaron
ser la misma perilla.

### Divergencias del ritmo

20. **La cinemática pasó de ~6,2 s a ~8,9 s y se corre el techo del §4.6** (que pide ≤ ~8 s sin
    manos). Es deliberado y pedido: la velocidad de juego atropellaba los cuatro compases y no daba
    tiempo a MIRAR nada. Si alguna vez molesta, es un número (`RITMO`) y no un rediseño.
21. **El fixture del PULSO esperaba 6 s a que el premio terminara** y con el ritmo bajo se quedaba
    corto: la sección 2 fallaba sola («el juego quedó en pulso, no en results»). Las esperas del
    fixture eran una copia implícita de la duración de la cinemática; ahora son generosas y lo dicen.
22. **La cabina nueva (8/2026) movió `COCKPIT_Y` de 104 a 60** y el canopy terminó tapando la muerte
    del buque. El offset del premio pasó de 44 a 104 para volver a dejar el blanco en cielo limpio.
    La regla, escrita al lado del número: *el buque tiene que quedar en cielo limpio* — si la cabina
    se vuelve a mover, ése es el número a mirar.
