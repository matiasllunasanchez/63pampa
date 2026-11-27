# Versiones de RASANTE

La versión se ve chiquita abajo a la derecha del menú principal y sale del `version` del
`package.json`.

**Cada vez que se sube un build:**

1. Subí la versión en el `package.json`.
2. Anotá acá qué trae.
3. Cuando quede en vivo en Steam, completá el BuildID.

Numeración: semver, **X.Y.Z**. Cuando se pide una versión nueva, se analizan los commits desde la
anterior y se sube el número que corresponde:

- **X (mayor):** un cambio grande de juego o de partidas guardadas que no son compatibles. `1.0.0` es el lanzamiento.
- **Y (menor):** contenido o funciones nuevas (modos, aviones, mecánicas, pantallas).
- **Z (parche):** solo arreglos y ajustes, sin nada nuevo.

## 0.6.0 — 27/11/2026 (Steam BuildID 26975211)

- **Dos estampitas nuevas en el álbum (TEMAS):**
  - **La cabina del Sea Harrier:** se destapa al bajar 20 Harrier en total, contando entre partidas.
  - **La cabina del Skyhawk:** se destapa al terminar el tutorial. Quien ya lo había terminado la tiene de entrada.

## 0.5.1 — 27/11/2026 (Steam BuildID 26973175)

- **El tutorial, ajustes:**
  - La nafta no baja en la etapa 1. En la 2 solo gasta la poscombustión y después baja muy lento. En las islas funciona como en el juego.
  - Se espera a la Chancha antes de seguir el diálogo.
  - Al reintentar después de morir en el escape o en la pasada, vuelven los enemigos y no hay que esperar.
  - La etapa completa se marca en verde con un check.
- **Los diálogos:** los de un renglón van al doble de rápido.
- **El globo** se choca como se ve.
- **El tablero:**
  - La barra RASANTE se corre para no pisar el avión. La palabra va del ancho de la barra, con RASANTE PERFECTO arriba en chico.
  - Las bombas, los tanques (con la gotita de nafta) y las chafitas, mejor dibujados y sin salirse del cuadro.
  - La flecha de bajar dice BAJA.
  - La mira del buque titila en vez del nombre, y lo que todavía no está listo se ve apagado en lugar de rojo.
- **El chaff** al lanzarse hace una explosión física y suena.
- **Los soldados argentinos:** rehechos más grandes, con dos poses nuevas: de guardia con el FAL y rodilla en tierra.
- **El joystick en CONTROLES:** cada botón con su nombre (LT, RB, STICK R, CRUZ ▲…) delante de su acción.

## 0.5.0 — 27/11/2026 (Steam BuildID 26964631)

- **El tutorial, más corto y más claro:**
  - Vida infinita salvo en las islas, y REINTENTAR aparece solo al perder.
  - La etapa 1 está reordenada: rolido y poscombustión al principio, el salitre en el rasante con olas y el poder RASANTE y el tablero al final.
  - La etapa 2 trae globos para romper o esquivar, algunos con ráfagas de viento.
  - La etapa 4 solo presenta Malvinas: el radar, los Harrier y la base.
  - El avión espera en la cabecera hasta que pidas gas, y la nafta baja de a poco y nunca se seca.
- **El poder RASANTE:** se gana llenando la palabra letra por letra al costado del avión (7 aciertos). Cada acierto de más suma un segundo.
- **El MOMENTUM:** con dos cargas, y el avión se mueve más rápido que el mundo.
- **Los misiles:**
  - El de frente avisa 1,5 s antes y se puede bajar a balazos.
  - Cualquier pirueta pierde al que viene de cola.
  - Las chafitas contra un misil de cola, con pausa.
- **La suelta de la bomba:** en blanco y amarillo, con la caída que titila. En las islas, un aro en el suelo marca dónde cae (rojo si no arma). LB ya no suelta la bomba.
- **Otros:**
  - El estante de cargas en dos placas.
  - La brújula siempre en la fila.
  - El mapa queda solo para mirar fuera del modo dev.
  - Los diálogos del Turco y el Pichón, corregidos.

## 0.4.1 — 26/11/2026 (Steam BuildID 26956472)

- **El Rescate del Belgrano, ajustes:** la cúpula y las bengalas propias pasan a azul (el verde queda para lo británico). El radar muestra su avance con una torta y una barra, y al terminar, el ícono del radar. Pasar cerca de una bengala sola la da por revisada. Las balsas están siempre, y el radar solo las marca más claro. Las bengalas ya revisadas no desaparecen, pero dejan de titilar.

## 0.4.0 — 26/11/2026 (Steam BuildID 26954311)

- **Libro de vuelo:** se abre el Rescate del Belgrano. Se busca en el temporal con el radar del Neptune: zonas en la ida y una vuelta por las mismas, la mancha de aceite, las bengalas, las balsas y la bengala de humo que se lanza como una bomba.
- **Las hojas del libro:** la fecha y el lugar van chicos arriba, los subtítulos (ANTES, EL PLAN, EL TEMPORAL…) en su renglón y el mando dibujado en el cuadro. En el Belgrano, textos nuevos y la lámina de las balsas.
- **El clima:** viento de altura, que crece con la altura y con el temporal. Los rayos cercanos pueden pegarle a la electrónica según el avión. Hay menos pájaros con mal tiempo.
- **La vibración del joystick:** al rozar o tocar el agua, con las balas y el daño, al soltar cada carga, con el cañón y en el derribo. Se elige en OPCIONES → VIBRACIÓN: SÍ, SUAVE o NO.
- **Las verticales de las islas:** ya no se cortan solas. Se cortan con dos toques al revés (↓↓ la de arriba, ↑↑ la picada).
- **El modo de gas:** ya no se elige; queda siempre el de fábrica.
- **Los nombres de los botones:** con un mando de Xbox se muestran A/B/X/Y y LB/RB.

## 0.3.0 — 26/11/2026 (Steam BuildID 26950464)

- **La música en vuelo:** al azar entre `music/original` (instrumentales) y `music/soundtrack`, que incluye Zona Rasante, Nadie vuela solo, Alambre, Misty Malvinas y Dicen de mí 2. El mate y Gambeta 1 y 2 quedan para la campaña.
- **OPCIONES → MÚSICA EN VUELO:** AL AZAR o un tema fijo que se repite. Queda guardado. Las etapas del tutorial siguen con su tema.
- **En la pausa:** OPCIONES → TEMA ◄ ► recorre los temas en orden, y el elegido se repite.

## 0.2.0 — 26/11/2026 (Steam BuildID 26938453)

- **Libro de vuelo:** se juegan cinco salidas: El Sheffield, HMS Glasgow, La Ardent, La Plymouth y El Invincible. El Rescate del Belgrano sigue EN DESARROLLO.
- **El Sheffield:** la búsqueda con la posición que pasa el Neptune, las láminas y la pantalla de GANASTE con el buque ardiendo. Se ajustaron también la Glasgow y la Plymouth.
- **El Invincible:** el Exocet se carga con las flechas o la cruceta, el compañero carga a la par en la otra manguera y los A-4C pasan detrás del misil. Además, la pantalla de GANASTE nueva.
- **La búsqueda en las islas:** bengalas con paracaídas, balsas y la mancha de aceite. El radar propio puede fallar y hay que esperar a que recargue.
- **Una pirueta nueva:** el SALTO DE OLA (↑↓←).
- **Las mejoras del álbum:** con metal normal, plata y oro.
- **Menos pájaros en el pasillo.**
- **La versión:** chiquita, abajo a la derecha del menú principal.

## 0.1.0 — Playtest cerrado (24 y 25/11/2026)

Primera versión en Steam, para amigos y familia con keys. Salieron cinco builds con el mismo
número, cuando todavía no se veía la versión en el juego.

| BuildID | Fecha | Qué trajo |
|---|---|---|
| 26904417 | 24/11 | La primera subida: Steam integrado y la versión completa para Windows y Mac. |
| 26927298 | 25/11 | Sin overlay de Steam (bajaba los FPS). La ULTI del rasante, el tirabuzón y la barrena, el tutorial en el que se puede morir, la noche con luna llena y las tildes en todo el juego. |
| 26927549 | 25/11 | La etiqueta de la eyección sin claves repetidas. |
| 26930405 | 25/11 | Feedback del tutorial (el paso del hielo a -1°), los helicópteros con 25 vistas de giro, el Harrier de frente con 25 × 5 poses y la ULTI que sale al completar RASANTE. |
| 26935426 | 25/11 | SALIR cierra el juego de verdad, el gabinete en alta resolución y monitores ultra anchos (el juego ocupa casi todo el alto). |
