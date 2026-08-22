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

## 10. EL ATAQUE COMPLETO *(playtest del 17/8)*

> *"El avión está frenando al segundo que impacta la bomba: debe SEGUIR DE LARGO o ir hacia arriba
> mirando al cielo. Y el avión no va rasante — debe ir rasante al agua, con efectos de agua en la
> pantalla y en los costados."*

Las dos son la misma familia de error: la cinemática tenía los GESTOS del ataque pero no su
**recorrido**. Un ataque real es un arco continuo —entrás pegado al mar, saltás, soltás y salís— y
lo que había era tres poses sueltas con el avión parado entre una y otra.

**El freno.** La `pose` de salida pedía 26 m y una pose SOSTIENE la altura pedida: el avión llegaba
y se quedaba, que es literalmente frenar. Ahora pide **90** —por encima del techo de vuelo (68)—
para que no la alcance en lo que dura la escena: la trepada no termina nunca. Y la trompa sigue a la
trayectoria (`pitch` desde `plane.vy`), así que sube **mirando al cielo** en vez de subir horizontal.

**El rasante.** La cinemática arrancaba ya en el salto: el tramo pegado al agua no existía. Ahora
empieza con 0,4 s a **2,2 m** —con su estela y su rocío— y recién ahí salta. Tres cosas hicieron
falta:

- **La estela y el rocío pasaron a la cama de vuelo** (`estelaVuelo`). Era lo que P1 había dejado
  afuera "porque no era contiguo"; resultó que sí lo era —los dos bloques van juntos en `flight.js`—
  y ahora que una cinemática los necesita, el motivo para no extraerlos desapareció. `flight.js` la
  llama en el mismo lugar del cuadro: `feel` idéntico.
- **Agua en el vidrio** (`PULSO_TEATRO.AGUA`): gotas que el viento estira hacia atrás y hacia los
  costados, con densidad por altura (a 2 m es un manto, arriba de 7 no queda ninguna). Conviven con
  la sal: la sal está seca y quieta —es una marca vieja del avión— y el agua corre, es el mar de
  ahora.
- **La cámara arranca EN LA CABINA**, que además saca un corte: la prueba se juega en primera
  persona y el premio la continúa sin cortar. El corte a tercera cae en el salto, que es un golpe.

### Divergencias del ataque completo

23. **Una `pose` inalcanzable es la forma de decir "seguí subiendo".** No hizo falta un verbo nuevo:
    pedir una altura que no se alcanza en el tiempo de la escena ES una trepada sostenida. Si algún
    día hace falta "subí a X y quedate", ya funciona — es la misma pose con un número alcanzable.
24. **La actitud sigue a la trayectoria y no al revés.** En una cinemática no hay palanca, así que
    el cabeceo sale de `plane.vy`: es la verdad física y sale gratis. En el PASILLO no se toca —ahí
    la trompa la manda la intención del piloto, que es otra cosa y la sigue calculando `flight.js`.
25. **La secuencia quedó en 9,4 s** (era 8,9). El tramo rasante suma 0,4 s y es el que hace legible
    todo lo demás: sin él, el salto no es un salto — es la altura a la que arranca la escena.

---

## 11. LA CABINA ENTERA Y EL SOBREVUELO *(playtest del 22/8)*

Dos pedidos, y de nuevo el segundo era **una sola causa vista dos veces**.

### La cabina

> «la cabina está demasiaaaado abajo, estirala desproporcional para que se vea completa… quizá que
> no ocupe el ancho total puede ser la solución»

Medido: en el premio se veía **el arco del canopy flotando sobre nada** — el panel, las manos y las
rodillas quedaban afuera del cuadro. Dos números lo causaban, y los dos por la misma razón: la
cabina se anclaba **por el ancho**, así que el alto caía donde cayera.

- `COCKPIT_MIRA` del PULSO estaba en **150**, con este comentario al lado: *«el PULSO apunta más
  abajo porque la autopista de tokens vive en la mitad de abajo»*. Esa razón **ya no existía**: la
  autopista se mudó al cielo (`LANE_Y = 34`) y el número se quedó. Lo único que seguía haciendo era
  empujar la cabina fuera del cuadro.
- `PULSO_CINE.CABINA` bajaba el PNG **104 px más** para abrirle cielo al buque.

El arreglo no es estirar. El PNG es 1.833:1 y la pantalla 1.778:1 —**casi lo mismo**— así que
deformarlo para que entre no se nota como "cabina más alta", se nota como cabina mal dibujada. Se
invirtió el anclaje: **el alto es el que no puede desbordar** (arriba se pierde el arco, abajo el
panel, y esas dos son las que la hacen leer como cabina) y el ancho sale de él. Que termine más
ancha que la pantalla no cuesta nada — lo que se va por los costados son los rieles.

De ahí sale **`MIRA_PLENA` = `V_VISOR × H` ≈ 106**: la *única* Y en que la cabina sale entera **y**
de borde a borde. No es una perilla, es una consecuencia — y es la cuenta a tener a mano el día que
se recambie el PNG. **No hace falta un PNG nuevo.**

### El sobrevuelo

> «el avión se sigue quedando quieto al lanzar el misil, el barco NUNCA SE SIGUE ACERCANDO DURANTE
> SU DESTRUCCIÓN… o que la trompa del avión suba hacia el cielo y un resplandor blanco cierre»

Las dos mitades eran **lo mismo**. En una cámara que mira siempre para adelante, el **tamaño del
blanco es lo único que dice a qué velocidad vas**: un zoom que se satura *es* un avión que frena.
Y se saturaba justo al empezar la agonía (`gf` llegaba a 1 ahí), o sea los últimos tres segundos
—casi la mitad de la cinemática— con el buque clavado en 2,4×.

Y había un segundo freno, real: el avión tocaba **`FLY_TOP` (68)** a mitad de la salida, se nivelaba
solo y bajaba la trompa.

Lo que se hizo:

- **`PULSO_CINE.SOBREVUELO`**: el buque sigue creciendo mientras se muere (2,4× → 4,2×) y, con
  `ESC_DROP` subido a 96, se sale del cuadro **por abajo**. Eso es pasarle por encima — la versión
  2D de la primera opción del pedido.
- **`stepVuelo({ techo })`**: el techo es una regla del PASILLO ("hasta acá llega el carril") y una
  cinemática no juega en el carril. Por omisión sigue siendo `FLY_TOP`, así que el vuelo no cambia
  en nada (`feel` idéntico); la salida lo levanta y la trompa se queda mirando al cielo hasta el
  último cuadro. `ESC_ALT` pasó a 160 por lo mismo: cerca del objetivo la `pose` afloja sola.
- **El banco de nubes se apaga en el premio.** Existe para que el buque APAREZCA de la bruma
  mientras te acercás; encima del blanco es niebla entre vos y algo que tenés a doscientos metros —
  y como escala con el buque, al sobrevolarlo se volvía una pared gris que se comía la escena.
- **El resplandor**: `fade` acepta `color`, y a blanco deja de ser un fundido para ser un golpe de
  luz. Cierra la escena mientras seguís trepando.

### Divergencias de la cabina y el sobrevuelo

26. **`yOff` corre la MIRA, no el dibujo.** Bajar el PNG a secas recortaba el panel. Bajando la
    mira, la cabina baja *y se achica* —que es lo que hace de verdad un encuadre que se abre— pero
    sigue entera. Con eso `PULSO_CINE.CABINA` bajó de 104 a **26**: desde que el PULSO apunta a la
    mira plena, abrirle cielo al buque cuesta casi nada.
27. **Un comentario que explica un número no lo mantiene vivo.** El "150" tenía escrita al lado su
    razón, y la razón se había mudado al cielo hacía commits. La única defensa real es *derivar*: hoy
    la mira del PULSO **es** `MIRA_PLENA`, así que no hay un número que pueda quedar mintiendo.
28. **Un verbo `destello` habría sido `fade` con otro nombre.** Fundir a un color ya era esto: se
    agregó el campo, no el verbo. La regla del §6.5 pide agregar el verbo que falta — no uno que ya
    está escrito con otras letras.
29. **Los dos frenos del playtest eran cuatro números y ninguna línea de lógica.** `ESC_ALT`,
    `TECHO_SAL`, `ESC_DROP` y `SOBREVUELO`. Que "el avión frena" se arregle en data y no en un
    sistema es exactamente lo que el director vino a comprar.
30. **La red que faltaba** (`npm run pulso` §6): el buque tiene que seguir creciendo durante la
    agonía y el avión tiene que seguir trepando hasta el último cuadro. Las dos mitades del mismo
    defecto, medidas por separado para que la próxima vez el fixture lo diga antes que el playtest.

---

## 12. MÁS RASANTE, Y EL FRENO DE VERDAD *(playtest del 22/8 · segunda pasada)*

Tres pedidos. El tercero traía instrucciones de cómo medirlo —*«corré el juego, sacá capturas, vas
a ver que la distancia del barco es LA MISMA»*— y así se encontró.

### El freno era la costura, no el avión

Se agregó `__buque()`: **el tamaño y la posición del buque tal como quedaron dibujados este
cuadro.** Sin eso, "el buque no se sigue acercando" solo se puede discutir mirando — el
multiplicador puede estar creciendo y el buque no crecer en pantalla, y son cosas distintas.

Medido, el largo en pantalla:

```
t=0.2 → 3.4 s   178 → 410 px    +70 %/s     la caída
t=3.6 → 4.4 s   426 → 454 px     +7 %/s     ← acá "frena"
```

El acercamiento estaba **partido en dos curvas** —el zoom de la caída hasta la agonía, y el del
sobrevuelo durante la agonía— y las dos arrancaban con **pendiente cero** (van al cuadrado). La
costura caía exactamente en el impacto. No era el avión: en una cámara que mira siempre para
adelante, el tamaño del blanco es lo único que dice a qué velocidad vas.

Ahora es **una sola curva** de punta a punta (`ZOOM` = tamaño del último cuadro, `ZOOM_CURVA` = 1.5,
>1 porque un acercamiento *acelera*: el tamaño aparente va con 1/distancia). El crecimiento
por cuadro quedó monótono y creciente de principio a fin, sin un solo escalón.

### El agua no faltaba: estaba muerta, dos veces

`drawAguaVidrio` **no se llamaba desde ningún lado** — quedó como código muerto cuando se rehízo el
bloque de la cabina en `render/pulso.js`. Y al re-conectarla no se veía igual: estaba escrita contra
`cab.top` con desplazamientos negativos, o sea contra la cabina *vieja* (la que se empujaba 104 px
hacia abajo). Con la cabina arrancando en y≈0, **todas las gotas caían arriba del borde de arriba**.
La sal tenía el mismo problema: se apilaba en un renglón de un píxel.

Ninguna de las dos fallaba. Sólo desaparecían.

El arreglo es el mismo que el de la mira: **derivar del asset y publicarlo.** Se midió leyendo el
canal alfa del PNG —dónde está el hueco transparente del parabrisas— y salió `V_VIDRIO = 0.3203`.
`drawCockpit` devuelve ahora la franja de vidrio ya en coordenadas de pantalla, y quien pega algo al
parabrisas no vuelve a estimarla.

También se corrigió el reparto: las gotas salían todas de un punto en el centro y se abrían en
abanico — y a esa altura el centro del cuadro es **justo donde está el buque**, así que el agua se
leía como si la escupiera el blanco. Mismo error que las líneas de velocidad naciendo en el punto de
fuga, misma corrección.

**Y el rocío de la cama de vuelo no sirve acá:** sale del agua a la altura del morro, o sea abajo
del cuadro. En el pasillo se ve porque no hay cabina; en primera persona lo tapa entero el tablero.
Volar rasante *desde adentro* es el mar en el vidrio, no el rocío.

### Más rasante

`RAS_T` 0,4 → **1,6 s** y `RAS_ALT` 2,2 → **1,5 m**. Con 0,4 s el tramo existía en la data y no en
la pantalla: entre que la altura tarda en asentarse y que el agua necesita cuadros para acumularse,
el rasante duraba menos que su propio arranque. Ahora es **el tramo más largo de la cinemática**, que
es lo que corresponde a un juego que se llama así. El 1,5 además cae del lado bueno del escalón de
rocío de la cama (2,8 m).

### Divergencias

31. **Dos cosas que se veían mal eran una sola causa: el buque se dibujaba con la opacidad de la
    aproximación.** `dis` corre con el avance del PASILLO, así que cualquier cinemática que no venga
    de volarlo entero —el menú CINEMATICAS, un fixture— pintaba el buque al 20 % justo en el cuadro
    donde tiene que ser una pared de acero. Se apaga en el premio, igual que el banco de nubes.
32. **El hundimiento se frena a mitad de camino** (1.15 → 0.78). Con el valor viejo la cubierta
    quedaba medio casco bajo el agua antes de que la escena terminara y el recorte del mar se lo
    comía: el último segundo era mar vacío. Un buque no se hunde en tres segundos — lo que la
    cinemática cuenta es que *empezó*.
33. **La red que faltaba, otra vez, era de conteo y no de mirada.** `__vidrio()` devuelve cuántas
    gotas quedaron DENTRO del cuadro, y el fixture exige que a ras haya agua en el vidrio. Un efecto
    que no falla y sólo desaparece necesita que alguien lo cuente; los dos que había (sal y agua)
    llevaban commits muertos sin que nada se pusiera rojo.
34. **La cinemática quedó en 7,8 s** (era 6,6). Todo el crecimiento es el rasante.

---

## 13. EL CUELGUE BLANCO, EL TEMPO Y LA PIRUETA DESDE ADENTRO *(playtest del 22/8 · tercera pasada)*

### El cuelgue (lo primero, aunque vino dicho al pasar)

> «quedó en blanco y nunca más pude hacer nada pero no importa»

Sí importaba: era un **cuelgue duro**. El director no se apagaba nunca. `fin: true` emitía su señal
hacia arriba y `C` se quedaba viva con el último estado de la timeline — que en el premio es un
**fundido a blanco con opacidad 1**. `drawCine` lo seguía pintando encima de todo lo que viniera
después: el panel de recuento estaba ahí abajo, invisible, y no había forma de salir.

**`fin` ahora es el final**: el director se suelta ahí mismo. Y con un respaldo que es la parte que
importa — también se suelta si el reloj pasa el final de la timeline. Una cinemática sin `fin`, o
con un `fin` cuya ligadura no se ató (algo que esta timeline hace a propósito en otros beats), era
exactamente el mismo cuelgue esperando su turno.

**Una cinemática no puede durar para siempre.** Eso no es una política, es una invariante — y ahora
`npm run cine` la exige para *toda* timeline, no sólo para ésta. Es la red más barata del plan y la
que más caro habría salido no tener: el último cuadro de una escena suele ser justamente un fundido
opaco, así que este mismo cuelgue estaba latente en cada cinemática futura.

### El tempo del final

−1,2 s: `PULSO_CINE.MUERTE` 2,6 → **1,75** y `DESTELLO` 0,5 → **0,28**. La agonía era el único tramo
recortable sin tocar el arco del ataque, y el que menos pierde — el buque escorado y ardiendo se lee
en un segundo y medio igual que en dos y medio; el resto lo cuenta el recuento. Y medio segundo de
destello todavía se leía como que la pantalla *se lavaba*: un golpe de luz es un golpe.

### La pirueta desde adentro

Se cae el corte a tercera. La cinemática entera es **un solo plano, la cabina, de punta a punta**.

El argumento viejo era «la recompensa de la regla 1 es VER salir la maniobra, y desde la cabina eso
no se ve». El playtest dijo lo contrario, y tiene razón: **desde adentro la maniobra no la mirás, la
sufrís** — que es exactamente lo que la prueba te acaba de hacer teclear. Y sin corte, el premio es
literalmente la continuación de la prueba: la misma cabina, el mismo vidrio, el mismo ojo. El horizonte
giratorio hace todo el trabajo (el mundo rola ~50° y la cabina queda quieta).

**Lo que cuesta, dicho:** con el horizonte en FIJO (opciones) el mundo no se inclina y la maniobra se
queda sin nada que mostrar. Se respeta igual — FIJO lo elige quien se marea, y una cinemática no es
lugar para pasarle por encima a eso.

### Divergencias

35. **El bug más caro del plan entró por la puerta de un verbo nuevo.** `fade` con `color` era un
    cambio de un campo; lo que no se pensó fue qué pasa con ese fundido *después* del `fin`. Mientras
    los fundidos eran a negro y a mitad de camino nadie lo notó. Un verbo que puede dejar la pantalla
    opaca obliga a decidir quién la limpia — y la respuesta correcta no era "el orquestador", era
    "la cinemática se termina de verdad".
36. **La red no estaba porque el fixture medía el `fin` de la timeline, no el del director.** Cortaba
    la traza con `c.fin` —el flag que la timeline enciende— y nunca preguntaba si el director había
    soltado. Medir la intención en vez del efecto: el mismo error que la sal dibujada arriba del borde.
37. **La cinemática quedó en 6,6 s** de los 7,8. Sigue teniendo el rasante como tramo más largo.

---

## 14. LA CABINA MÁS CHICA Y LOS EFECTOS POR PLANO *(playtest del 22/8 · cuarta pasada)*

> «está regular, achicá más la cabina» · «el efecto rasante se hace adelante en la punta, debe
> hacerse en los costados, bien alrededor de toda la cabina» · «el efecto velocidad MÁS GRANDE si
> está en primera persona; está todo manteniendo el mismo radio y distancia que cuando es tercera»

Los tres son **la misma observación**: el encuadre pasó a ser primera persona pura y los efectos
seguían dimensionados para tercera.

### La cabina

`CABINA_ESC` = **0,74** — cuánta pantalla se come, como fracción del máximo que entra sin
recortarse. En 1 la cabina llenaba el cuadro de borde a borde y el mundo se miraba por el
parabrisas y nada más. El juego se llama RASANTE: lo que hay que ver es **el mar**.

Achicándola aparecieron las tres cosas que el tablero tapaba: la estela, el rocío saltando delante
del morro, y el buque entero en cielo limpio arriba del canopy.

**No la despega del borde de abajo.** Al primer intento la cabina achicada dejaba una franja de mar
*por debajo* del tablero — eso no es una cabina más chica, es una calcomanía de cabina. Ahora se
apoya en el borde inferior y todo lo que libera se lo queda el mundo, arriba. Con `esc` en 1 las dos
cuentas dan lo mismo, así que el anclaje sólo actúa al achicar.

### El rocío, por plano

Desde afuera el agua es un chorro delante del morro. **Desde adentro ese chorro lo tapa el tablero**,
y lo que se ve son las dos cortinas pasando al lado del canopy. No es otro efecto: es el mismo
nacido más ancho, más cerca de la cámara y abriéndose hacia afuera — tres perillas en `estelaVuelo`
(`ancho`, `cerca`, `abre`) que en sus valores por omisión dejan el PASILLO exactamente como estaba.

### Las líneas de velocidad, por plano

En tercera el punto de fuga está lejos y las líneas convergen chiquitas sobre el buque. En **cabina
el punto de fuga está en tu cara** y lo que hacen es pasarte por al lado: nacen más afuera, corren
más rápido, son más largas y se van del cuadro en vez de amontonarse. El largo del trazo dejó de ser
un 9 escrito en `game.js` y lo trae cada línea.

### Divergencias

38. **"El mismo efecto" y "el mismo tamaño" no son lo mismo.** Al sacar el corte a tercera (§13) se
    heredaron las magnitudes de un plano que ya no existía. Todo efecto que nace en el punto de fuga
    —rocío, líneas, humo— tiene una escala que **es del plano**, no del efecto, y hay que pasársela.
39. **La mira dejó de ser un clavo y pasó a ser "dónde apunta a tamaño pleno".** Con `esc` < 1 gana
    el anclaje de abajo y el visor sube. Es a propósito y está escrito al lado de la función: entre
    respetar la mira y no dejar la cabina flotando, gana no flotar.

---

## 15. EL PUNTO DE FUGA Y LA RISTRA QUE SALE *(playtest del 22/8 · quinta pasada)*

> «el efecto de la velocidad tiene que estar bastante más abajo, el misil debe verse saliendo desde
> la cabina con una estela atrás»

Otra vez el mismo eje: cosas heredadas de cuando la cámara miraba desde afuera.

### El punto de fuga

Las líneas de velocidad nacían en el horizonte (`HOR - 4`). Eso es correcto **desde afuera**: es el
punto de fuga de una cámara que mira el mundo. Desde la cabina no — el aire que te pasa converge
donde **apunta el morro**, bastante más abajo, y con las líneas naciendo arriba parecían venir de
atrás del riel del canopy en vez de barrerte el vidrio. Ahora cada línea trae su propio `dy` (0 por
omisión: el pasillo no cambia) y en primera persona cae **58 px más abajo**, cerca del borde inferior
del parabrisas.

### La ristra que se ve salir

Salía de `y = H + 8` — abajo del borde de la pantalla. Con la cabina llena eso era razonable (la
panza está detrás del canopy); con la cabina al 74 % el borde de abajo ya no es el avión, es el
tablero, así que la ristra **aparecía ya lanzada**. Ahora sale del borde de abajo del parabrisas —
*debajo del morro*, que es donde sale de verdad — y para eso hizo falta partir `drawCockpit` en dos:

**`cajaCabina(w)`** calcula dónde va a caer la cabina **sin dibujar nada**. La ristra se dibuja
*antes* que el canopy (es mundo, el canopy tiene que poder taparla) pero necesita saber dónde
termina el vidrio. Sin esto había que elegir entre dibujarla tarde o adivinar la geometría en dos
lados — que es exactamente cómo se desincronizan las cosas.

Y se le puso lo que le faltaba para leerse: **estela de humo** muestreando su propia trayectoria
hacia atrás, **fogonazo de motor** los primeros metros, y salida más grande (se encoge al alejarse).

### Divergencias

40. **El humo tiene que ser CLARO.** El primer intento lo pintó gris de casco y desapareció contra
    el mar — que en este juego también es gris oscuro. La estela existía en el código y no en la
    pantalla, que es el tercer efecto de esta serie al que le pasa lo mismo. De un arma que sale, lo
    que se ve es el humo; el fierro es un punto.
41. **Partir "dónde va" de "dibujarlo" es lo que hace componible un render.** `cajaCabina` no es una
    refactorización de higiene: es lo que permite que algo que se dibuja ANTES sepa dónde va a estar
    algo que se dibuja DESPUÉS, sin copiar la cuenta ni invertir el orden de las capas.
