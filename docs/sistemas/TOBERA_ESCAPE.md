# LA TOBERA — qué se ve de verdad atrás de un Skyhawk

> **Estado: implementado (18/8/2026).** Reemplaza la llama vieja (`flame`) por
> `tobera()` en `src/render/plane.js`. El humo de escape se probó y se quitó — ver §5.
>
> Pedido de Matías: *"parece una llama de fuego… quizá debe ser sólo la aureola de la turbina
> pero irradiar más color… el actual 'fueguito' parece una antorcha"*. La intuición era correcta
> por dos motivos distintos, y el segundo es más grave que el primero.

## 1. Los hechos

**El A-4 monta un turborreactor SIN postquemador.** Wright J65 en los A-4B/C/Q argentinos (el
Armstrong Siddeley Sapphire británico fabricado bajo licencia); Pratt & Whitney J52 en los
E/F/M. Sin reheat no hay nada que arda detrás de la tobera: **un motor así no tiene llama
visible de día.** El "turbo" del juego ya era licencia — el Skyhawk no tenía postquemador.

Lo que sí se ve, en orden de cuánto:

1. **HUMO.** El J65 era célebremente sucio: dejaba un reguero oscuro que delataba la posición
   del avión. Fue un problema táctico real, el mismo que arrastraba el F-4 con sus J79. **De
   todo lo que se ve de un Skyhawk desde atrás, esto es lo más característico.**
2. **El interior del caño al rojo** — visible sobre todo de frente y con poca luz.
3. **La distorsión del aire caliente** detrás del escape.

## 2. El error que importaba: la GEOMETRÍA

La llama vieja se estiraba hacia **abajo en pantalla**: eso es una antorcha vista **de costado**.
Pero en RASANTE el avión se ve **desde atrás** — la tobera apunta a la cámara. Desde ahí no se
ve un penacho: se ve **el disco caliente del escape, de frente**, y el humo viniéndose encima.

Ese es el motivo por el que "parecía una antorcha": lo era. Estaba dibujada desde un punto de
vista que el juego no tiene.

## 3. Lo que hay ahora

**La boca (`tobera`)** — tres capas que se ENCIENDEN, ninguna que se estira:

| capa | qué es | con turbo |
|---|---|---|
| resplandor | lo que el motor le hace al aire alrededor | crece y **irradia** más |
| anillo | el borde metálico del caño al rojo | pasa de rojo apagado a naranja |
| núcleo | el fondo del caño, lo más caliente | salta a casi **blanco** |

Ese salto de color es todo el aviso de que estás a fondo, y no hace falta ninguna llama para
darlo. Los colores se **mezclan** entre estados (`mix`) para que la boca se lea como metal
calentándose y no como un semáforo.

**El humo (`humoTobera`)** — una historia de posiciones, igual que `tipTrail` y por la misma
razón: sigue exactamente lo que hiciste (bob, alabeo, el tirón de un esquive) en vez de
aproximarlo con velocidades. No toca `parts`, así que **no gasta del presupuesto** de
partículas (`PARTS_MAX`). Las muestras viejas se dibujan **más grandes y más transparentes**:
como la tobera apunta a la cámara, el humo **viene hacia nosotros** y se abre, en vez de
alejarse hacia el horizonte.

## 4. Calibración *(lo que costó cuatro vueltas)*

1. **Casi negro no se ve.** El primer humo era `#3a3a36` a alpha 0.16 y desaparecía contra el
   mar del Atlántico, que ya es oscuro. El humo de un motor está **iluminado por el sol**: un
   gris cálido se lee sobre agua y sobre cielo.
2. **Pero aclararlo de más lo volvió una nube.** Con alpha 0.60 y muestras de 10 px, las 26
   encimadas tapaban media pantalla. Quedó en alpha 0.12–0.32 y radio máximo ~6 px: un rastro,
   no un banco de niebla.
3. **El humo va SOLO con turbo** *(pedido de Matías, 18/8)*. Encendido siempre, el reguero era
   permanente y dejaba de significar algo — el mismo error que ya se había cometido con los
   vórtices de punta. Ahora vuelve a ser lo que era en el aire: la marca de que estás exprimiendo
   el motor. Al soltar no se corta: la cola se come el rastro de atrás para adelante.
4. **La edad de cada bocanada es de RELOJ, no de índice** — y esto era el bug de *"no se mueve
   cuando sube y cuando baja"*. El desplazamiento salía de la posición en la lista, así que el
   reguero se movía **rígido** con el avión: al trepar, el humo viejo trepaba con vos en vez de
   quedarse donde lo dejaste. Con la edad real cada bocanada sigue su camino desde donde nació y
   el rastro **queda atrás**, que es lo único que hace que se lea como humo.
5. **El fallback de rects usa la misma tobera.** Si no, cuando la hoja no carga el avión volvía
   a tener la antorcha vieja y el juego se contradecía a sí mismo.

## 5. El humo: probado y QUITADO *(18/8)*

Se construyó y se sacó, por decisión de Matías. Queda registrado porque la investigación sigue
siendo válida y porque el próximo que lea el §1 va a querer intentarlo:

- **Primer intento**: una muestra por cuadro. A 60 fps eran 60 cuadraditos del mismo tamaño casi
  en el mismo sitio — *"parece una tira de cinta"*, y lo era: una barra gris continua, no humo.
- **Segundo intento**: bocanadas discretas cada 55 ms, cada una con su tamaño, su sesgo lateral y
  una caída de opacidad cuadrática, creciendo mucho más de lo que bajaban. Mejor, pero tampoco
  convenció.
- **Decisión: fuera.** El código se borró entero en vez de dejarlo apagado, porque —a diferencia de
  `tipTrail`— no había ninguna medición cara que perder: el ancla es el mismo `TOBERA_F` que usa
  el resplandor. Lo que había que conservar era el porqué, y eso vive en este documento.

**Si se retoma**, el problema real a resolver no es el color ni el tamaño: es que el humo se ve
DESDE ATRÁS, viniéndose encima, y a 480×270 eso pide que se desarme en profundidad —no en el
plano— que es justo lo que un sprite 2D no sabe hacer barato.

## 6. Lo que queda anotado, no hecho

- **La distorsión del aire caliente** (punto 1.3) no está: a 480×270 un shimmer real pide
  releer el framebuffer, y eso es trabajo de la etapa de post-proceso (T9 del plan visual).
- El humo **no se ensucia con el daño**. Un motor averiado humea negro y de otra manera; sería
  el enganche natural con el modelo de averías (`core/damage.js`).

---

## 6. EL REGUERO — la mecánica, mudada *(22/8)*

El humo de tobera se mudó a **`src/render/reguero.js`**, entero y tal cual estaba, porque hacía
falta en otro lado: **las estelas de los misiles**. Es la misma jugada que `stepVuelo` saliendo de
`flight.js` — funcionaba, y tenía un segundo cliente.

Lo que se llevó es lo que hace que se lea como humo y no como una cinta:

- **Es una historia, no una extrapolación.** Cada bocanada queda donde el emisor estaba. Las tres
  estelas de misil que había en el juego —cada una escrita a mano en su archivo— muestreaban la
  posición *actual* hacia atrás, o sea que se movían **rígidas** con el proyectil.
- **Una bocanada cada tanto**, no una por cuadro.
- **La edad es de reloj, no de índice.**
- **Se abre mucho más de lo que se mueve.**

`MISIL` es el mismo reguero con otros cinco números: más grande, blanco, y con dos diferencias que
no son de gusto — **no baja** (el humo del avión se hunde porque la tobera te apunta; el de un misil
se queda en el aire donde el misil pasó) y **nace más seguido abriéndose la mitad** (un misil se
aleja en vez de cruzar, así que las bocanadas se apilan en el mismo sitio y con la apertura de la
tobera se fundían en una columna blanca maciza).

**Nota de procedencia:** el `humoTobera` del avión se quitó de `plane.js` en el rebaje del escape de
8/2026 (quedaron el disco caliente y los vórtices de punta). Así que hoy `reguero.js` no es una
copia de nada: es donde vive la versión con reloj, que era la buena.

Clientes hoy: la ristra del premio del PULSO (`render/pulso.js`) y el misil del pasillo
(`game.js`). Cada emisor tiene **su** reguero — dos misiles no comparten humo; el del pasillo se
guarda en un `WeakMap` para no escribirle campos a un store del mundo.
