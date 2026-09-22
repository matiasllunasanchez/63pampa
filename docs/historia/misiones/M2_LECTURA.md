# MISIÓN 2 — El bautismo de fuego

*1 de mayo de 1982 · costa de las islas*

---

## PANEO GENERAL

*Todo lo que tiene la misión en una página. El detalle, abajo.*

> **Estado al 19/9:** esto es **cómo está hoy en el código**, después de la pasada de M1. Lo que
> hay que cambiar está al final, en *Lo que falta*.

### La secuencia completa

| # | momento | escena | tipo | quién habla | qué pasa |
|---|---|---|---|---|---|
| 1 | antes | `M02_1` · La brecha | pantalla | Puma, Esteban | la tesis del juego dicha en voz alta |
| 2 | antes | `M02_MATE` · La ronda | pantalla | Gitano, Pichón, Turco | el mate, el THANK YOU, el Pichón escuchando la chapa |
| 3 | antes | `M02_TARJETA` | tarjeta | — | título y objetivo |
| — | antes | **falta `M02_PISTA`** | — | Cóndor | **la regla de campaña dice que Cóndor cierra, y acá no cierra** |
| 4 | ida | `M02_OBJETIVO` | radio en vuelo | Cóndor, Puma | el cruce de costa autorizado |
| 5 | ida | — | — | **nadie** | silencio hasta el final |
| 6 | vuelta | — | — | — | **hoy no existe: la misión es una sola tirada de 2.600 m** |
| 7 | llegada | aterrizaje | jugable | — | el de siempre |
| 8 | después | recuento | pantalla | — | con puntos y estrellas |
| 9 | después | `M02_5` · Raspados | pantalla | Turco | la estrellita del Pichón |
| 10 | después | `M02_8` · El cuaderno | carta | Mateo | el hambre, Bordón, el rock nacional |
| 11 | después | **mejora servida** | pantalla | Pichón | **TERRAIN MASKING**, la primera de la campaña |
| — | después | **falta `M02_HIST`** | — | — | la placa histórica no existe |

### Qué se enseña, y quién

| qué | quién | cómo |
|---|---|---|
| el radar de verdad, con su interfaz | — | **hoy aparece solo, sin que nadie lo explique** |
| que te disparan | — | los cazas entran por defecto |
| que caen bombas | — | `bombs: 0.5` |
| los poderes (Momentum, Rasante) | — | **están prendidos y nadie los enseña** |
| que el avión se rompe y se remienda | el Turco | `M02_5`, después de volar |
| qué son las estrellitas | el Turco | *"esa no es del avión, es tuya"* |

> **Ese cuadro vacío en la columna del medio es el problema de M2.** Es la misión donde el juego
> se vuelve el juego —radar, cazas, bombas, poderes— y hoy no habla nadie mientras pasa.

### Mecánicas: qué está prendido y qué no

| | M2 |
|---|---|
| enemigos (cazas) | **sí**, cadencia normal |
| bombas enemigas | **sí**, a mitad de cadencia (`bombs: 0.5`) — es la primera vez en la campaña |
| clima | viento sí; ni lluvia ni niebla |
| obstáculos | cadencia normal |
| radar | **normal**: barra que carga, red, oleadas de misiles |
| morir / cambiar de piloto | **sí**: cinco pilotos, cinco vidas (`roster: F5`) |
| combustible | **queda como lo tenga puesto el jugador** — M2 no lo declara |
| la Chancha | **disponible** (M1 la apaga a mano; M2 no dice nada, así que está) |
| poderes (Momentum, Rasante) | **sí, prendidos** |
| seguir al líder | no |
| ida y vuelta | **no**: `goal: distance 2.600 m`, sin `fases` |
| objetivo real | **no**: llegar a los 2.600 m *es* el objetivo |
| aterrizaje | sí, el normal |
| puntos en pantalla | **sí** (`par: 6500`, con estrellas) |
| mejora al terminar | **sí, servida sin elegir**: TERRAIN MASKING |

### Lo que falta

- **El objetivo real.** Hoy es distancia. Tiene que ser **el puesto avanzado del islote**.
- **La forma ida / objetivo / vuelta.** M2 no declara `fases`. M1 sí — es el molde a copiar.
- **El cierre de Cóndor** antes de jugar (`M02_PISTA`). No existe.
- **La línea de Cóndor está escrita para la misión vieja:** *"Entran, cruzan y vuelven. Nada
  más."* Se escribió cuando M2 no tenía blanco. Igual la segunda línea de la tarjeta.
- **Nadie enseña nada durante el vuelo.** Ni el radar, ni los poderes, ni las bombas.
- **`M02_HIST` no existe** — la placa histórica del final.
- **`M02_5` usa `cara: 'turco_ternura'`, que no existe.** Es el mismo bug que `M01_7_020`.
- **Bloqueo para publicar:** la placa de esta misión dice *"varios no volvieron"*, y la placa de
  apertura promete *"los muertos son reales, los contamos bien"*. **Falta la cifra exacta.**
- La charla en vuelo de Cóndor **no se dibuja** (bug de toda la campaña, ver M1).

---

## Antes de empezar

**La primera misión real.** Van a Puerto Argentino, que esa madrugada bombardearon, y es la primera
vez que entran en terreno hostil.

El título no es sobre disparar. **Es sobre que te disparen.** Y pasa en la vuelta.

---

## La brecha

*Ellos tienen misiles que piensan solos, radares que ven de noche, Sea Harriers de última
generación. Los Fieles tienen aviones con más horas que un colectivo del interior, bombas de otra
década y coraje.*

**PUMA:** Ellos tienen la máquina. Nosotros tenemos las manos. Vamos a volar tan bajo que la
máquina no va a poder creer que alguien esté tan loco. Esa incredulidad es toda nuestra ventaja.

**ESTEBAN:** ¿Y alcanza?

**PUMA:** No, pero es lo que hay. Y lo que hay lo volamos con todo. Como en el potrero, si el rival
tiene botines y vos estás descalzo, tenés que gambetear más pegado al piso.

> *Es la tesis del juego dicha en voz alta, y la única vez que se dice así de directo. La pausa
> larga antes del «No» es la línea: contestar rápido lo volvería arenga.*

---

## La ronda

*Antes de subir, el Turco ceba el mate y arranca la ronda con el Gitano.*

**GITANO:** *(toma el mate, lo deja y hace un saludo "como de soldado")* THANK YOU.

**PICHÓN:** ¿Y por qué en inglés?

**GITANO:** Porque si digo gracias me sacan de la ronda, culiau.

**EL TURCO:** De la ronda no se va nadie, Ura.

*Mientras la ronda de mate sigue, el Pichón ya está al lado de su avión con la mano abierta apoyada
en la chapa y la cabeza gacha, escuchando. No dice nada. Luego de un momento la saca y se seca la
palma en el mameluco.*

> *El gesto del Pichón es el mismo de la misión uno. Nadie lo comenta nunca — es el segundo de los
> cinco que se cobran en la catorce.*
>
> *Y "de la ronda no se va nadie" es una promesa que se cobra en la misión trece.*

---

**Aparece la tarjeta:** *EL BAUTISMO DE FUEGO — 1 de mayo de 1982 · Costa.*
*OBJETIVO · Primera salida de verdad. Cruzar la costa y volver.*

---

## ▓ SE JUEGA LA MISIÓN

### Cómo está armada hoy, en criollo

**Se despega y se vuela 2.600 metros. Llegar es ganar.** No hay blanco, no hay giro y no hay
vuelta: es una sola tirada, más larga y más peligrosa que la de M1.

Lo que cambia respecto de la misión uno es **todo lo que te pasa en el camino**: el radar existe
de verdad y tiene su barra, entran cazas, caen bombas por primera vez, y los poderes están
disponibles. Se muere, y si te matan cambiás de piloto.

### Cómo tiene que quedar

**Hay que cruzar la costa, reventar un puesto avanzado británico, y volver.**

- **La ida es esconderse.** El techo se estrangula: hay que ir muy pegado al agua o el radar te
  detecta. El mundo está vacío y la radio muda. La tensión no es el enemigo, es no equivocarte.
- **En la ida no hay enemigos puestos a mano — salvo que te vean.** Si dejás que el radar te
  complete la barra, no perdés la misión, pero **perdés el silencio**: de ahí en adelante el mundo
  te espera armado.
- **El objetivo está en un islote:** un puesto avanzado con una antena. **Mientras está en pie, es
  el que te carga la barra del radar.** Se revienta a cañón, y cuando cae, la barra deja de subir
  por el resto de la misión.
- **La vuelta es la guerra.** Acá te tiran por primera vez en toda la campaña, y **acá caen bombas
  por primera vez**. No es dificultad porque sí: una bomba cayendo significa una sola cosa, que te
  vieron. Después de reventar el puesto, ya no sos un fantasma.
- Sin bombas propias, sin Pulso. Todo se resuelve con el cañón.

### Cuándo habla cada uno, y si frena el juego

| Momento | Quién habla | ¿Frena? |
|---|---|---|
| Al entrar al pasillo | Cóndor autoriza el cruce y avisa del radar; Puma contesta | **No frena.** Volás mientras hablan |
| El resto de la ida | **Nadie.** La radio está muda a propósito: estás conteniendo la respiración | — |
| La vuelta | *(por escribir)* el escuadrón vuelve a hablar | **No frena** |

*Lo demás —la brecha, la ronda del mate, el hangar de noche, la carta— son pantallas con el juego
parado.*

**En la ida, por radio:**

**CÓNDOR:** Escuadrilla Chimango, aquí Cóndor. Cruce de costa autorizado.

**CÓNDOR:** Radar activo en toda la aproximación. Entran, cruzan y vuelven. Nada más. Buen vuelo.

**PUMA:** Chimango copia. Pegaditos.

*Y después de eso, silencio hasta el objetivo.*

---

## Raspados

*Vuelven todos, pero raspados. El Pichón aterriza con el avión agujereado y las manos
temblándole.*

*El Turco lo abraza sin decir nada y se pasa la noche remendando chapa a la luz de un farol. A la
mañana, el avión tiene los agujeros parchados y una estrellita nueva.*

**EL TURCO:** ¿Ves? Esa no es del avión. Es tuya. Te la ganaste, changuito.

---

## El cuaderno

> *Pá: hoy comimos una vez. En todo el día. La comida está —la mandan del continente— pero nunca
> llega a nosotros. El Colorado me pasó la mitad de su lata, jurando que él ya había comido. Una
> mentira grande como una casa. Le escuché las tripas toda la noche.*
>
> *Hay un subteniente, Bordón. Tiene su carpa custodiada y llena de cajas. Estamos convencidos de
> que son las raciones y demás cosas que nos mandan. Pero nadie dice nada acá. El que abre la boca,
> la pasa mal.*
>
> *Igual, te cuento una linda: como prohibieron pasar música en inglés, la radio pasa rock nacional
> todo el día. Pasamos toda la noche con los pibes cantando en el pozo, pá. Tratábamos de
> distraernos, pero nos ganaron las ganas de llorar. Igualmente cantábamos.*
>
> *Unas ganas de comer el guiso de mamá... Apenas termine esto le pedimos que lo prepare. Anotalo
> vos también, que yo acá lo tengo escrito. Mateo.*

> *"Yo acá lo tengo escrito" es literal: en un rincón de la hoja de dibujos, chiquito, torcido y
> subrayado a mano, está anotado "pedir a mamá que prepare guiso". Sin comillas, sin flecha, sin
> relación con ningún dibujo — una nota que se dejó a sí mismo para no olvidarse.*

---

## Y al terminar, la primera mejora

Es la única de la campaña que **se entrega servida, sin elegir**: **TERRAIN MASKING**, la que clava
el avión a ras y descarga el radar. La frase del Pichón que la acompaña es *"Si abajo no nos ven…
¿por qué subimos?"*.

Es exactamente la mejora de la misión del radar, y el calendario del código ya la dejaba ahí sola.
**De M3 en adelante se ofrecen dos y se elige una.**

---

*Y de acá, a la misión tres.*

---
---

# FICHA TÉCNICA

*Para el código. Si estás leyendo la historia, terminó arriba.*

**La configuración de hoy, tal cual está en `missions.js`:**

```
id: 'm2', name: 'EL BAUTISMO DE FUEGO', date: '1 de mayo de 1982',
despegue: { desde: 'BAM RÍO GALLEGOS', rumbo: 'cruce de costa' },
goal: { kind: 'distance', meters: 2600 },
cfg: C({ bombs: 0.5 }),
tramos: [
  { hasta: 0.1, obstacles: 0, caza: 0, bombs: 0, charla: 'M02_OBJETIVO' },
  { hasta: 1 },
],
roster: F5, par: 6500, story: 'storyM2', epi: 'epiM2',
```

**En castellano:** 2.600 m de una sola tirada · el primer 10% va vacío para que entre la radio de
Cóndor · el resto con todo prendido · cinco pilotos, cinco vidas · 6.500 puntos de referencia.

**Qué se enseña:** el radar con castigo, que te disparen, que caigan bombas, las averías y la
chapa, y que el objetivo puede ser algo que hay que destruir.

**Qué NO hay:** bombas propias ni Pulso. M2 no te da un arma nueva, te da un peligro nuevo.

**Escenas en el código:** `M02_1`, `M02_MATE`, `M02_TARJETA`, `M02_OBJETIVO`, `M02_5`, `M02_8`.
Falta `M02_HIST`.

**Decisiones ya cerradas** *(en `../RESUELTOS_GUION.md`, no se reabren)*: el Gitano hace un saludo
de soldado y no la reverencia entera — se actualiza el guion, no el juego (M2-01) · "culiau" queda
(M2-02) · "De la ronda no se va nadie, Ura" queda (M2-03) · "Te la ganaste, changuito" queda
(M2-04) · la versión larga de la carpa de Bordón queda (M2-05).

**Lo que M1 dejó firme y cae sobre M2** *(de `M1_CAMBIOS.md`, ya implementado)*: Cóndor cierra
siempre antes de jugar · cada misión tiene su cartel de despegue con su rumbo · cada misión abre
con su indicativo de ave por radio (acá, **Chimango**) · el recuento y los puntos existen salvo
que la misión los apague.
