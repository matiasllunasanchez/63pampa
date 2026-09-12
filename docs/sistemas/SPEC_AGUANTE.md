# EL AGUANTE — el estado RASANTE _(pedido del autor, 12/9 · aplicado)_

> Archivos: `src/core/aguante.js` (puro), `src/systems/aguante.js` (el estado),
> `src/systems/flight.js` (el enganche), `src/render/hud.js` (la palabra y las dos barras),
> `tools/unit.js` (cinco tests).

## 1. Qué problema resuelve

Volar a ras era la tesis del juego y, al mismo tiempo, lo único que no pedía nada. Bajabas de 4,5 m
y el multiplicador subía **solo**: un escalón cada dos segundos —x10, x15, x20, x25— sin más
decisión que no trepar. La barrita que salía al lado del avión medía ese reloj, y el reloj corría
aunque el jugador soltara el joystick.

El aguante lo convierte en algo que **se sostiene**. Y sostener no es machacar: la primera versión
pedía un toque en **cada** pasada del indicador —una o dos veces por segundo, para siempre— y eso es
tener los dedos ocupados, no volar. La ventana es lo que arregla eso.

## 2. Los tres renglones

**PERFECTO** (naranja). La altura es la buena (`alt <= 4.5`, el mismo techo de siempre) y la barra
**carga**: cuatro segundos, el doble de lo que tardaba un escalón. La gracia de siempre
(`graceT = 0,45 s`) sigue puesta, así que un bob corto no arruina la carga.

**RASANTE** (azul). Al llenarse la barra se abre el estado y aparecen dos barras:

1. **EL PULSO** — blanca con un solo **sector azul**, y un indicador de 1 px que va y viene de punta
   a punta. Un **toque de gas adentro del azul** es un acierto.
2. **LA VENTANA** — un temporizador debajo, que **se vacía solo**. Mientras le quede tiempo el avión
   va **clavado a la altura, como un crucero**: no hay que apretar nada para no caerse. Cada acierto
   **la vuelve a llenar**.

Entonces el trabajo del jugador no es tocar todas las pasadas: es **tocar antes de que la ventana se
cierre**. Puede dejar pasar dos de cada tres y mirar el mundo, que es de lo que se trata el juego.

Cada acierto, además: **sube el multiplicador** (x10 + 3, tope x40; antes el techo era x25) y **sube
el escalón que ve la física** (`rasLevel` 0..4), así que `speedTarget` acelera como siempre y su
curva no se toca.

## 3. La curva de dificultad

Todo sale de **un** número, los aciertos acumulados (`run.aguN`), y todo vive en `AGU`. Hay dos
tiempos distintos y conviene no confundirlos:

- **`margen(n)`** — los segundos que dura el paso del indicador por el sector: **de cuánto es el
  margen para acertar**. Es la precisión que se pide. Ancho y velocidad por separado no dicen nada
  (un sector chico con el indicador lento es fácil), así que el margen tiene función propia y test.
- **`ventana(n)`** — los segundos que el estado se sostiene solo: **cuánto te podés distraer**.

Medido jugando (cifras de la sonda `__agudbg`):

| aciertos | 0 (al entrar) | 5 | 8 | 10 | 13 y más |
|---|---|---|---|---|---|
| ancho del sector | 0,36 de la barra | 0,235 | 0,16 (piso) | 0,16 | 0,16 |
| **margen para acertar** | **0,36 s** | 0,168 s | 0,098 s | 0,089 s | **0,076 s** |
| **ventana** | **3,00 s** | 2,20 s | 1,72 s | 1,40 s | **0,90 s** (piso) |
| lo que cuesta errar | 1,05 s | 0,77 s | 0,60 s | 0,49 s | 0,32 s |
| pasadas salteables | 3,0 | 2,4 | 2,8 | 2,4 | 1,9 |
| multiplicador | x10 | x25 | x34 | **x40** (tope) | x40 |
| escalón de la física | 0 | **4** (tope) | 4 | 4 | 4 |

**La escalada se mide en pasadas salteables, no en segundos**, y ese es el error fácil de cometer: al
acelerar el indicador las pasadas llegan más seguido, así que una ventana **fija** dejaría saltear
cada vez **más** — la dificultad iría para atrás. Por eso `VEN_K` tiene que achicar la ventana más
rápido de lo que `VEL_K` achica el intervalo entre pasadas, y hay un test que lo vigila: es un
desajuste que no se ve jugando (todo "funciona"), sólo se ve en la tabla.

El piso deja siempre **al menos una pasada salteable**: si hubiera que acertar todas, volveríamos al
machaque que este cambio vino a sacar. También hay test.

**La curva llega a una meseta a los 13-14 aciertos**: 76 ms de margen y 0,9 s de ventana. Es
deliberado —los pisos son fairness, no descuido— y por eso el test exige que el margen nunca baje de
50 ms: abajo de dos cuadros dejaría de ser precisión y sería suerte. Si se quiere que termine
rompiendo a cualquiera, las perillas son `SEC_MIN`, `VEL_MAX` y `VEN_MIN`.

**El indicador es triangular y no senoidal.** Con un seno frenaría en las puntas —justo donde no pasa
nada— y cruzaría el medio al doble de velocidad, así que la dificultad dependería de dónde cayó el
sector. A velocidad constante el margen dura lo mismo en cualquier posición, y **eso es lo que
permite sortear el sector**.

## 4. El sector se sortea, y se corre

En cada acierto el sector salta a una posición nueva **lejos de la anterior** (al menos 0,22 de
barra, o la mitad del espacio disponible cuando el sector es grande y no queda tanto). El hueco
prohibido se saltea **mapeando el sorteo sobre el espacio libre**, no sorteando de nuevo hasta que
caiga bien: un rechazo puede no terminar nunca, y con el sector de 0,36 el lugar libre es justo.

Esto es una **divergencia del pedido**, que decía «se mantiene hasta que el jugador falla o sale». Se
lo planteó al autor con el argumento a favor de su versión —con el sector quieto, la posición
sorteada al entrar ya da ritmos distintos, porque el indicador rebota en las puntas: al medio es
parejo, en la punta son dos pasadas juntas y un hueco— y decidió dejarlo saltando en cada acierto.

## 5. Cómo se pierde y cómo se sale

Hay **una sola** forma de perder: que la ventana llegue a cero.

| | qué pasa |
|---|---|
| **la ventana llega a cero** | **falla**: se corta el crucero y la carga vuelve a cero |
| tocar afuera del azul | **quema 35% de la ventana** — y si no alcanza, ésa es la falla |
| dejar pasar el azul sin tocar | **nada**: sólo deja de reponer la ventana |
| tocar adentro de una pasada ya cobrada | **nada**: no paga ni castiga |
| tocar en el primer medio segundo | **nada**: es la gracia de la entrada (ver abajo) |
| rozar el agua o el suelo | **falla** (`flight.js`, el bloque del roce) |
| picar (`S`) | **salida limpia**: se corta, sin castigo |
| aguantar el gas 1 s | **salida limpia**: «me llevo lo que gané» |
| perder la altura | se corta, sin castigo — puede pasarte por una ola o una pirueta |
| relevo del escuadrón | el estado no se hereda (`systems/squad.js`) |

**Errar tiene que costar algo, pero no tiene por qué matar.** Si tocar afuera saliera gratis,
machacar el gas rellenaría la ventana de casualidad y la mecánica se caería; si mata de un toque,
un nervio borra veinte segundos de vuelo. El castigo es **fracción de la ventana entera** y no un
número fijo: con un fijo, el mismo error costaba un tercio al entrar y casi todo en la meseta — el
castigo crecía solo justo cuando ya es difícil. Medido jugando: cada error se come ~0,95 s de una
ventana de 2,7, y el estado sigue. Hay test que exige que **dos** errores no alcancen para matar y
que **tres** sí, en cualquier punto de la curva.

## 5b. La gracia de la entrada, y el dedo que ya venía

Dos versiones del mismo problema, las dos encontradas por el autor jugando:

**El reflejo.** Venís bombeando el gas para no rebotar contra el agua. El estado se abre, el avión
se clava —o sea que el gas ya no hace falta— pero **tu dedo ya salió**: ese toque cae afuera del
azul. Sin arreglo, el reflejo que te mantuvo vivo los cuatro segundos anteriores es el que te
castiga en el instante en que entrás. Los primeros **0,5 s** del estado ignoran los flancos del
gas: no cuentan ni bien ni mal.

**El dedo apretado.** Al estado se entra casi siempre **con el gas ya apretado**, y el reloj de la
salida a propósito («aguantar el gas 1 s») ya estaría corriendo: un segundo después te sacaría solo,
sin que el jugador pida nada. Así que **nada cuenta hasta que suelte**: ni el flanco ni el reloj de
la salida. Se limpia en cuanto suelta, que es el momento en que el gas vuelve a ser suyo.

Medido: entrando con el gas apretado y sin soltarlo, a los 1,7 s el estado sigue puesto y el reloj
de salida marca 0.

**Se descartó mudar el toque a otro botón** (hay libres: ○ y △ en el mando). Dos razones: la
identidad de la mecánica es que **el gas es el metrónomo** —el premio por acertar es que el avión
deja de rebotar, o sea que el gas cambia de oficio mientras estás adentro— y con el toque en otro
botón el control del avión queda en punto muerto, que es justo lo que el spec del poder rasante se
prohíbe («no es autopiloto»). Y porque mudar el botón no atacaba la causa: el problema era la
transición, no el botón. Queda como plan B si en el playtest con manos humanas sigue molestando.

**Tocar adentro de una pasada ya cobrada no hace nada.** Castigarlo sería castigar por tocar donde la
barra **muestra** el indicador adentro del azul, o sea desmentir el dibujo.

**El toque es el flanco del gas, no la tecla apretada.** Al entrar, el jugador viene con el gas
apretado (es como se mantenía a ras): contando la tecla, el primer cuadro ya sería un acierto o una
falla sin que él hiciera nada. Contando el flanco, el estado arranca pidiendo lo único que tiene
sentido: que suelte y vuelva a dar gas a tiempo. Es también lo que hace posible la salida por
«aguantar el gas»: ese mismo flanco ya se contó como toque, así que si el toque fue bueno te vas con
el premio puesto, y si fue malo la falla te sacó antes de llegar al segundo.

## 6. El crucero, medido

Sin tocar **nada** —ni una tecla— desde que se abre el estado:

```
   t      y     ventana   estado
  0.00   3.40    2.99     RASANTE
  1.12   3.35    1.87     RASANTE
  2.25   3.35    0.74     RASANTE
  3.10   3.25    0.00     cortado
tras cerrarse la ventana: y 1.7  (cayendo)
```

Tres segundos clavado en 3,35 m con ±0,01 de variación, y en cuanto la ventana llega a cero el avión
vuelve a caer. La ventana **es** lo que lo sostiene.

## 7. El resorte no es el del poder

El poder RASANTE (tecla 6) y el estado RASANTE clavan los dos la altura, pero con resortes distintos
y a propósito:

- el **poder** es blando y **te deja trepar con el gas** (`vertRasante`), porque ahí el gas sigue
  siendo gas: «no es autopiloto» es un criterio de cierre de su spec;
- el **estado** es duro (`vertClavado`, rate 12) porque ahí el gas es el **metrónomo**, y lo que el
  aguante paga es justamente que el avión deje de rebotar con cada pulso.

Los dos son de **primer orden** —la vertical deseada es proporcional al error— así que ninguno puede
pasarse de largo y rebotar. **El poder manda sobre el estado** cuando están los dos: es una decisión
explícita del jugador.

El estado clava la altura entre `RAS_ALT` (2,4) y el techo de la banda (4,5): donde estabas, pero no
más abajo que el ras del poder. La marejada llega a 1,9 y clavarse debajo de eso es rozar para
siempre.

## 8. Dos cosas que la primera prueba jugada corrigió

**El indicador arranca en la punta más lejana al sector.** Medido: con el sector sorteado en 0,044 y
el indicador saliendo de 0, la primera pasada llegaba **0,1 s** después de abrirse el estado — el
jugador acababa de entrar y ya había fallado. Arrancando del otro lado tiene media barra de carrera
(~0,5 s a la velocidad de entrada) **siempre**, sin depender de la suerte del sorteo.

**El sector nuevo arranca desarmado**, incluso si cae justo donde ya está el indicador. Si se armara
ahí, habría que acertar una pasada que ya empezó —a veces con un cuadro de margen— y eso es una
moneda, no dificultad. Se arma cuando el indicador entre de nuevo.

## 9. Lo que quedó afuera

- **El toque se lee una vez por cuadro** (el flanco de `inp.u`), así que una pulsación más corta que
  un cuadro (16 ms) se pierde. Para una persona es imposible —una pulsación humana dura 50-120 ms, o
  sea 3 a 7 cuadros— y en el joystick el eje se lee por cuadro de todos modos, así que no hay nada
  que arreglar; pero **un test automatizado tiene que sostener la tecla al menos 30 ms**, porque
  `sendInputEvent` con el down y el up en el mismo tick no llega a verse nunca.
- **Ningún cartel nuevo.** El escalón viejo ponía un popup en el centro (`RASANTE!`); no vuelve — la
  palabra al lado del avión **es** el anuncio, y este mismo playtest sacó tres carteles de ahí.
  `rasante` quedó sin uso en `data/strings.js`.
- **El estado no da colchón contra el agua.** El poder sí lo da; acá el riesgo de volar tan bajo
  sigue siendo el riesgo, y clavar la altura ya es más seguro que rebotar con el gas.
- **Dos cosas se llaman RASANTE** (el estado y el poder), por decisión del autor: «quizá el poder
  termina siendo un efecto en conjunto de lanzar MOMENTUM mientras RASANTE está activo».
- **El multiplicador no se muestra como número.** Tope x40 y no hay dónde leerlo: las barras dicen
  cuánto margen y cuánta ventana quedan, y la palabra dice en qué tiempo estás, pero «voy en x34» no
  lo dice nadie. Es la divergencia 26 de `PLAN_UI.md`, ahora con un techo más alto.
- **Codicia contra supervivencia, sin resolver.** Acertar todas las pasadas escala el multiplicador
  más rápido pero también achica el sector más rápido; acertar sólo lo necesario sobrevive más. Es
  una tensión que quedó por accidente y que parece buena — habría que jugarla con manos humanas antes
  de tocarla.
