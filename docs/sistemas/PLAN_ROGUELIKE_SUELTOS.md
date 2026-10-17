# EL BANCO EN LOS MODOS SUELTOS — POR LA PATRIA y CICLO DE MUERTE como roguelike

> El autor (16/10/2026): *"a cada objetivo derrotado de ciclo de muerte o cada cantidad X de puntos
> acumulados, que vaya ofreciendo mejoras del Pichón y también armamento. Que el avión arranque sin
> nada, y de repente en la mejora le permita elegir un tanque de combustible, o mejorar metralleta, o
> pirueta X, o más capacidad de balas"* — y *"las cartas duran la corrida, tal cual, es un ROGUELIKE el
> juego"*.

**Estado: PLAN.** Nada de esto está hecho. Los dos modos se están rehaciendo en paralelo (la base de
reglas vive en `src/data/modos_sueltos.js`: dificultades, presión por km y estrellas, mundo al azar,
usar cosas cuesta puntos): este plan se monta ENCIMA de eso, no lo reemplaza.

---

## 1 · LO QUE HAY HOY (16/10)

- El banco del Pichón (`src/data/upgrades.js`) es **solo de campaña**: 21 cartas, 1 de 2 después de cada
  misión. En los modos sueltos no hay banco: se vuela con **todo** (las 12 piruetas, 2 cargas de chafitas,
  metralla común, cinta corta).
- **POR LA PATRIA** no tiene objetivo: el pasillo es infinito (`objectiveDist = 0`).
- **CICLO DE MUERTE** sortea uno de los 9 buques de la campaña (`SHIP_MISSIONS`), y al vencerlo encadena el
  siguiente en el aire (`siguienteBlanco`). El clímax es EL PULSO.
- Los puntos solo **compran** acciones (`COSTOS`: Chancha 1500, MOMENTUM 800, radar 300, chafitas 400).
  No hay premio "cada X puntos".

---

## 2 · LAS REGLAS COMUNES

1. **LA CORRIDA ES LA PARTIDA.** Las cartas duran la corrida y se pierden al morir el último avión. Nada se
   guarda entre corridas (lo que se guarda es el récord).
2. **SE ARRANCA SIN NADA.** De fábrica: la metralla común con la cinta corta, las piruetas de fábrica (TONEL,
   COBRA, DERRAPE, MORTAL, COBRA MORTAL INVERTIDA), el tanque interno y **una MK-17** (para que siempre se
   pueda atacar). Sin chafitas, sin tanques, sin las 12 piruetas del banco.
3. **CADA 5000 PUNTOS, UNA CARTA.** Se ofrecen **3** para elegir **1**, o 2 (o 1) si no hay más elegibles.
   La oferta no aparece en medio de una esquivada: espera un momento seguro y abre el banco en pausa.
   *(5000 es para probar; el número va a `modos_sueltos.js`.)*
4. **ÍTEM Y MEJORA DE ÍTEM.** Cada cosa tiene **una carta que la da** (CHAFITAS, TANQUES, BRP…) y, una vez que
   la tenés, **cartas que la mejoran**: CANTIDAD, CAPACIDAD, POTENCIA o RECARGA. Las mejoras de un ítem que
   **no tenés no aparecen** como carta elegible. Las cartas de hoy se reordenan bajo esta regla (la METRALLA
   DE PLATA y la CINTA LARGA son mejoras de la metralla de fábrica; MÁS CHAFITAS, de CHAFITAS).
5. **TODA MEJORA TIENE UN PRECIO** (la regla de `MEJORAS_PICHON.md`): se elige qué estás dispuesto a perder.
   Las que ya lo tienen lo conservan (la BRP rompe menos; la METRALLA DE ORO tarda en girar).
6. **LO QUE TU AVIÓN NO PUEDE LLEVAR SE VE IGUAL, ROTO.** Una carta incompatible con el avión aparece
   **bloqueada y rota**, con el motivo abajo. El caso que lo define: el **Exocet** en un A-4B — *"Tu avión no
   cuenta con sistemas electrónicos para llevar un Exocet"*. Deja clara la diferencia con el Super Étendard.
   No se puede elegir y no ocupa lugar en la oferta (se muestra aparte o además de las 3).

---

## 3 · POR LA PATRIA — EL CAMINO INFINITO

- **No hay buques ni objetivos finales.** Es un camino sin fin con **dificultad ascendente** (la rampa por km
  de `modos_sueltos.js`).
- **Las bombas se usan contra lo destructible del camino** (depósitos, carpas, antiaéreos, puestos), no contra
  un blanco final.
- Las cartas llegan **solo por puntos** (cada 5000).

## 4 · CICLO DE MUERTE — EL RITMO DEL BLANCO

- **Cada cierta cantidad de km, un OBJETIVO**: un buque o un objetivo grande de tierra. **Al azar, sin nombre
  e infinitos.**
- **Si lo eliminás, seguís. Si no entra la bomba, pasan las vidas** (el relevo de siempre) hasta que no quedan:
  ahí terminó.
- **La dificultad tiene forma de ola, no de rampa:**
  1. **SIGILO** — rasante hacia el objetivo, la presión sube a medida que te acercás;
  2. **EL ATAQUE** — el pico;
  3. **EL ESCAPE** — alarmas, y la dificultad **baja de mayor a menor** a medida que te alejás;
  4. **VUELTA AL SIGILO** — el banco (una carta) y al siguiente objetivo.
- Las cartas llegan **por puntos** (cada 5000) **y al vencer cada objetivo**.

---

## 5 · EL CATÁLOGO (lo decidido el 16/10)

Formato: **ÍTEM** → sus mejoras. *(de fábrica)* = ya lo tenés al arrancar; sus mejoras son elegibles desde el principio.

**Armas**
- **METRALLA** *(de fábrica)* → CADENCIA (plata, oro) · CAPACIDAD (cinta larga, cinta entera) · POTENCIA (más daño por tiro: nueva).
- **BOMBAS**: la **MK-17** *(de fábrica, una)* · **BRP-250** · **SNAKEYE** (Mk 82 frenada: se larga bajo sin que te alcance) ·
  **SOPORTE MÚLTIPLE del A-4Q** (más bombas por pasada) → mejora común a cualquier bomba que tengas, de 250 o de 500:
  **ESPOLETAS** (más probabilidad de detonar y explota más rápido — las de 12 s y las KEMA del catálogo histórico).
- **EXOCET AM39** — solo Super Étendard; en los demás, carta rota (regla 6).

**Defensa**
- **CHAFITAS** → CANTIDAD (+1 carga, hasta 4) · RECARGA (se repone sola) · POTENCIA (desvía mejor / más tiempo).
- **CHAPA Y ESCUDO** → más escudo · se llena más rápido.
- **REPARACIÓN** — cura toda la vida (de un uso, al elegirla).
- **AVIÓN AMIGO** — recuperás un avión del escuadrón (+1 vida, de un uso).
- **RELEVO VETERANO** — el relevo es más rápido.

**Alcance**
- **TANQUES DE COMBUSTIBLE** (el par de ala) → CAPACIDAD (el del centro).
- **+1 CHANCHA** — una llamada gratis (si no, se paga con puntos). Solo aviones con sonda.

**Poderes**
- **MOMENTUM** → CAPACIDAD acumulada (más carga guardada).
- **PODER RASANTE** → la banda azul más ancha (más fácil de pegar) · o más capacidad acumulada.
- **RADAR PROPIO** → se carga solo.

**Piruetas** — las 12 del banco, cada una una carta (sin mejoras por ahora).

**Fuera:** las **bengalas caseras** (el autor, 16/10: no).

**Sin decidir** (propuestas que no se contestaron): niveles de POSCOMBUSTIÓN, mira de bomba (marca dónde pega),
altímetro que avisa del suelo.

---

## 6 · LOS AVIONES

- La carta rota (regla 6) depende del avión elegido al arrancar la corrida.
- **CADA AVIÓN ARRANCA CON SU ARMAMENTO REAL** (el autor, 17/10): *"los aviones deben contar con sus armamentos o
  sets de armas básicas, salvo los que no traían cañones"*. Los del **Escuadrón Fénix** (civiles) y el **Neptune**
  vuelan **sin cañón** (`sinCanon` en `data/planes.js`). La carta **CAÑÓN** se ofrece **solo** a esos aviones y lo
  habilita (licencia del juego); para los demás, la metralla de fábrica ya está.
- **HÉRCULES BOMBARDERO** *(avión nuevo, a desarrollar)*: bombas y **cañones LENTOS, distintos a la vista** de los
  del resto. ⚠ El hecho es real (el C-130 **TC-68** se usó como bombardero improvisado, p. ej. contra el
  petrolero *British Wye*), pero **cuántas bombas y cómo las soltaba** (soportes bajo el ala o empujándolas por
  la rampa) **hay que verificarlo** — la referencia vino de un resumen de IA. **Los cañones son licencia del
  juego.** Va a `docs/historia/PREGUNTAS_HISTORICAS.md`.

---

## 7 · PENDIENTES Y NÚMEROS A FIJAR

- **CICLO:** cada cuántos km un objetivo; cuánto dura el escape con alarmas.
- **El umbral de puntos:** 5000 fijos para probar; ver si crece.
- **Qué cartas tienen cuántos niveles** (CANTIDAD, POTENCIA…) y sus números.
- **Objetivos de tierra grandes para CICLO:** hoy existe uno (la BASE COSTERA, `data/estructuras.js`).
- **Un error de hoy que esto destapa:** `pichon` no se limpia al entrar a CICLO o PATRIA, así que el nivel de
  MOMENTUM se hereda de la última campaña. Con el banco en los modos sueltos tiene que arrancar vacío.
- **La ficha de los buques tiene tres errores históricos** (para `PREGUNTAS_HISTORICAS.md`, no bloquean): el
  *Broadsword* es Tipo 22 (no 21), el *Glamorgan* es clase County (no Tipo 42) y el *Plymouth* es clase Rothesay.

## 8 · CÓMO ENTRA (orden sugerido)

1. **Las reglas del banco suelto** en `data/upgrades.js`: ítems, mejoras con `requiere`, compatibilidad por avión.
2. **El arranque sin nada** y la **oferta por puntos** (banco en pausa en un momento seguro).
3. **El ritmo de CICLO** (objetivo por km, la ola de dificultad, la carta al vencer).
4. **Las cartas nuevas**, de a una: espoletas, Snakeye, soporte múltiple, reparación, avión amigo, +1 Chancha,
   radar que se carga solo, banda RASANTE, capacidad de MOMENTUM, relevo veterano, potencia de metralla.
5. **El Hércules**, después de verificar el dato y hornearlo.
