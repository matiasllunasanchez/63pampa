# M3 · EL INVENTO

> **FUENTE DE VERDAD SUPREMA.** Lo que el autor escriba acá manda sobre el código, sobre
> `GUION_3.md` y sobre cualquier otra documentación.
> **Texto verbatim de `src/data/story.js`.**
> **Estado:** ⬜ sin revisar por el autor.

---

## 1 · IDENTIDAD

| | |
|---|---|
| **Fecha** | Primeros días de mayo de 1982 |
| **Lugar** | Patrulla costera |
| **Indicativo** | Escuadrilla **BENTEVEO** |
| **Objetivo (código)** | `goal: { kind: 'distance', meters: 2400 }` |
| **Escuadrón** | `roster: F5` |
| **Par** | 7000 |
| **cfg** | `sky: dawn · terrain: coast · obstacles: 0.5 · bombs: 0 · caza: 0` — amanecer, sobre la costa, la mitad de obstáculos, **nadie te bombardea y no hay cazas** |

**Qué es.** **La misión de la comedia** — y termina siendo la más triste de las primeras cuatro.
Jugablemente es **la presentación del sistema de mejoras**, y el guion es explícito: *"La mecánica
de mejoras se enseña acá, en la misión más liviana, no en el medio del fuego."*

**Sin Pulso.** *(Decisión del autor: el Pulso debuta únicamente cuando hay un objetivo concreto a
destruir.)*

---

## 2 · EL ARCO DE LA MISIÓN, EN UNA LÍNEA

Se ríen toda la misión, y al final entra el Pichón con la noticia del Belgrano y **la risa se corta
a la mitad**.

---

## 3 · RECORRIDO BEAT POR BEAT

### ══ ANTES DE VOLAR — dos pantallas, PAUSA TOTAL ══

#### ▸ 3.1 — `M03_INVENTO` · **EL INVENTO**
**VN · fuera del juego · pausa total** · placa `hangar_dia`
**Caras:** `turco_ceno`, `pichon_sonrisa`, `turco_neutro`, `pichon_preocupado`, `turco_sonrisa`,
`gitano_neutro`, `puma_neutro`

| # | Quién | Texto | hold |
|---|---|---|---|
| 010 | NARRADOR | El Pichón está trepado a una escalera contra el avión de Esteban, con la manga sucia de grasa hasta el codo. El Turco abajo, con los brazos cruzados y cara de tribunal. | 1.5 |
| 020 | EL TURCO | Bajate de ahí, chango. Va a hace' cagada. | 0.8 |
| 030 | PICHÓN | Es que mire... si le corremos la toma dos dedos y le sacamos este peso muerto de acá, en la salida del rasante gana empuje. Lo vi en la salida de ayer, Tero se quedaba y el del capitán no, y la única diferencia es... | 0.5 |
| 040 | EL TURCO | No, changuito... Bajate. | 1.0 |
| 050 | PICHÓN | Perdón... Ya me bajo... | 2.0 |
| 060 | EL TURCO | *(mientras Pichón baja, se queda pensativo mirando el avión)* **A ver... mostrame...** | 3.0 |
| 070 | GITANO | *(mientras ambos murmuran cosas técnicas mirando el avión y unos papeles, Gitano se acerca a Puma)* Una caja de puchos a que el Turco lo manda a cagar antes del mediodía. | 0.6 |
| 080 | PUMA | Dos cajas a que después lo prueba igual. | 1.2 |

> **El hold de 3.0 en la línea 060 es la escena entera.** El Turco tarda tres segundos en decidir
> escuchar a un pibe de 22, y eso es todo lo que hay que entender del personaje.

---

#### ▸ 3.2 — `M03_TARJETA`
**TARJETA · fuera del juego · pausa total** · capítulo 3

> **EL INVENTO**
> *Primeros días de mayo de 1982 · Patrulla costera*
> *OBJETIVO · Patrulla de reconocimiento costero. Probar el invento del Pichón.*

---

### ══ EL VUELO ══

#### ▸ 3.3 — **DESPEGUE** · guionado

#### ▸ 3.4 — `M03_OBJETIVO` · **CHARLA EN VUELO** · seguís volando y manejando; lo que se congela es el kilometraje y la nafta. Corre sola, no se saltea, tope 25 s ⚠
Hoy cuelga del tramo `{ hasta: 0.1 }`.

| # | Quién | Texto | hold |
|---|---|---|---|
| 010 | CÓNDOR | Escuadrilla Benteveo, aquí Cóndor. Patrulla de reconocimiento costero. | 0.6 |
| 020 | CÓNDOR | Blancos de oportunidad nada más: boyas, un radar portátil si aparece. Sin presión. **Buen vuelo.** | 1.0 |
| 030 | EL TURCO | Y me lo prueban despacio al invento del changuito, ¿eh? Despacio. | 1.5 |

#### ▸ 3.5 — **LA IDA** ⏳
Rasante con radar (ya estrenado con castigo en M2), sin enemigos puestos salvo que te vean.
**Vuelo libre, cero presión** — es lo que pide el guion.

#### ▸ 3.6 — **EL OBJETIVO: LOS BLANCOS DE OPORTUNIDAD** ⏳
**Boyas de señalización enemigas y un radar portátil "si aparece".** Están escritos en el guion.
Se resuelven **a cañón**. No son un boss: son excusas para que sientas el avión.

**La gracia jugable de M3 es que el avión responde distinto en las manos.** Venís de instalar
TERRAIN MASKING después de M2, y esta misión existe para que lo notes.

#### ▸ 3.7 — **CINEMÁTICA DE SALIDA** · clip existente. Nada que generar.

#### ▸ 3.8 — **LA VUELTA — corta y tibia** ⏳
`{ tipo: 'vuelta', hasta: 1.3 }` — aproximadamente **la mitad de la de M2**, **con obstáculos y
sin cazas**.

> **Por qué no se saca.** Lo que M3 tiene que dejar instalado no es sólo cómo se prueba una mejora:
> es que **después de atacar te buscan**. Si la vuelta de M3 está vacía, el jugador aprende lo
> contrario y la vuelta de M4 le va a parecer injusta. Pero tampoco corresponde que lo cacen: le
> está tirando a boyas, lejos de la flota.

#### ▸ 3.9 — **ATERRIZAJE** ⏳

---

### ══ DESPUÉS DE VOLAR — cuatro pantallas, PAUSA TOTAL ══

#### ▸ 3.10 — `M03_ARANDELA` · **EL PRIMER FRACASO GLORIOSO**
**VN · fuera del juego · pausa total** · placa `hangar_dia`

| # | Quién | Texto | hold |
|---|---|---|---|
| 010 | EL TURCO | *(de espaldas al cielo, con las manos adentro de un motor. Levanta la cabeza. Pasan cuatro segundos largos hasta que el punto aparece sobre el mar)* **Ahí viene el capitán.** | 4.0 |
| 020 | NARRADOR | Prueban el invento del pibe: algo con una tapa y mucha cinta aislante. Hace un ruido espantoso. Una pieza de metal al rojo vivo sale volando, y se apaga con humo. Le vuela el gorro al Turco y le roza la oreja al Gitano. | 2.0 |
| 030 | EL TURCO | *(levanta el gorro del piso y le sopla el polvo, muy tranquilo)* No sirve, changuito. Te dije que no sirve. | 1.0 |
| 040 | PICHÓN | Mmmm... interesante. | 1.5 |
| 050 | GITANO | *(se acerca frotándose la oreja y ríe)* Interesante dice el culiao... Casi me vuela la oreja con una arandela... Ajá... interesante. | 1.0 |

> **Nadie le pregunta al Turco cómo sabía que venía el capitán.** El hold de 4.0 es todo el chiste.

---

#### ▸ 3.11 — `M03_BURRADA` · **LA BURRADA DEL GITANO**
**VN · fuera del juego · pausa total** · placa `hangar_dia` · **23 líneas — la escena más larga de
las primeras cuatro misiones**

| # | Quién | Texto | hold |
|---|---|---|---|
| 010 | GITANO | *(el Turco empuja un carrito con un misil; el Gitano se le cruza y le apoya la mano encima, como quien apoya la mano en el hombro de un amigo)* Turco, cuchá. Tengo una idea tremenda y quería saber si es posible. | 0.5 |
| 020 | EL TURCO | Escucho. | 1.0 |
| 030 | GITANO | Venís volando, y aparecen dos atrás, ¿sí? Ellos más veloces que nosotros y no son fáciles de perder. Además su armamento es mucho mejor que el nuestro. | 0.6 |
| 040 | EL TURCO | Si, obvio... ¿y? Mavé. | 1.0 |
| 050 | GITANO | *(el Vasco, que caminaba por ahí, se detiene a escuchar)* Entonces, en vez intentar escapar, tirás la trompa hacia arriba. Derechito al cielo, completamente vertical. | 0.5 |
| 060 | PICHÓN | Ahí entrás en pérdida. Estás más expuesto. | 0.5 |
| 070 | GITANO | Perfecto. Y ahí... te... **TE BAJÁS.** | 1.0 |
| 080 | VASCO | ¿Te bajás? ¿Cómo que te bajás? | 0.8 |
| 090 | GITANO | Te bajás, Vasco. Abrís la cabina y te tirás. Con paracaídas obviamente, por las dudas. | 0.6 |
| 100 | VASCO | Diosito. | 1.2 |
| 110 | GITANO | Los que te siguen, le siguen yendo al avión, pero vos ya no estás adentro. Y mientras caés… **LES DISPARÁS.** | 0.6 |
| 120 | PICHÓN | ¿Y con qué? | 0.6 |
| 130 | GITANO | Con lo que sea que te lleves encima. Un revolver, una ametralladora, un lanzacohetes... lo que sea. | 2.0 |
| 140 | VASCO | *(se da media vuelta y se aleja)* Buenas tardes, muchachos. | 1.2 |
| 150 | GITANO | *(sigue emocionado. El Puma ve la situación y se acerca)* Vos estás en un estado de locura e inconciencia temporal. ¿Me explico? No le tirás un tiro, porque si le pifiás te comés un garrón de la gran flauta. Les vaciás el cargador, los reventás a balazos. | 2.0 |
| 160 | GITANO | Ya aseguradas las bajas, acomodás el cuerpo en caída libre, y le apuntás a tu propio avión, que viene bajando por el otro lado. Te metés adentro, cerrás la cúpula, y seguís volando como si nada. | 2.0 |
| 170 | PICHÓN | ¿Y a qué velocidad estarías vos cuando saltás? ¿Usarías el eyector? | 0.6 |
| 180 | GITANO | Y... yo calculo... | 0.8 |
| 190 | EL TURCO | *(le saca el misil de las manos)* A ver, m'hijo. ¿Vos te pensás que el aire es una vereda? Vos te bajás de ese avión en el aire y a los treinta segundos te junto con pala. | 1.0 |
| 200 | GITANO | Pero el paracaídas... | 0.8 |
| 210 | PUMA | FACUNDO... | 0.4 |
| 220 | GITANO | ¿QUÉ? | 0.4 |
| 230 | PUMA | **NO.** | 2.5 |

> **Nota de tratamiento — el guiño.** Es un homenaje a la maniobra imposible de los juegos de
> guerra: subir vertical con los perseguidores encima, eyectarse, voltear al que te sigue mientras
> caés, y volver a meterte en tu propio avión en el aire. **La coreografía tiene que respetarse en
> ese orden porque el orden ES el chiste** para el que lo reconoce. En pantalla **no se nombra
> ningún juego, ninguna marca y ningún año**: es un piloto de veintipico diciendo una burrada en un
> hangar. El que lo reconoce lo reconoce; el que no, se ríe igual.
> **Se paga en M9, en la libreta.** *(Y el Pichón no tacha lo que anotó.)*

---

#### ▸ 3.12 — `M03_CUADERNO` · **EL CUADERNO**
**TIERRA · fuera del juego · pausa total** · placa `p1c_cuaderno` · img `carta4_m3`

| # | Texto |
|---|---|
| 010 | Pá: hoy el Colorado me regaló una navaja. Así nomás, sin cumpleaños ni nada. Un cortaplumas viejo, con el cabo de asta gastadito de años de mano. "Era de mi abuelo", me dijo. "En el campo, un hombre sin navaja no es nadie, chamigo." |
| 020 | Le dije que no podía aceptarla y me contestó que un regalo rechazado trae mala suerte, y que acá de mala suerte estamos completos. |
| 030 | La llevo en el bolsillo de arriba, con la birome. Mis dos herramientas, pá: una para contar y otra para lo que venga. La dibujé abajo, mirá. Le hice hasta las marquitas del cabo. Mateo. |

> **La navaja queda plantada** — chiquita, útil, sin drama. Vuelve dos veces: en **M12**, y en una
> encomienda, años después.

---

#### ▸ 3.13 — `M03_BELGRANO` · **2 DE MAYO** — *el verdadero final de la misión*
**VN · fuera del juego · pausa total** · placa `radio`

| # | Quién | Texto | hold |
|---|---|---|---|
| 010 | NARRADOR | Todavía se están riendo de la arandela cuando el Pichón entra desde la sala de radio. Sin correr, con la libreta en la mano y la cara de alguien que no sabe cómo decir lo que va a decir. | 2.0 |
| 020 | PICHÓN | Huuuu... hundieron al Belgrano. | 2.5 |
| 030 | GITANO | ¿Al crucero? Pero si el crucero está afuera de la zona, Pichón. Está navegando para el otro lado. | 1.0 |
| 040 | PICHÓN | Sí, ya sé... El ataque fue desde un submarino. Dos torpedos. | 1.2 |
| 050 | PUMA | ¿Cuántos? | 0.6 |
| 060 | PICHÓN | No se sabe... No se sabe todavía. Se está hundiendo... con la gente adentro. Además hay temporal. Y dicen que hay balsas en el agua desde hace horas. | 2.5 |
| 070 | NARRADOR | Silencio largo. El Turco deja el gorro sobre el banco y no lo levanta más. | 3.0 |
| 080 | GITANO | Pero no estaba en la zona... estaba yéndose, Puma. | 1.5 |
| 090 | PUMA | Sí. | 1.5 |
| 100 | GITANO | ¿Y entonces qué carajo...? | 0.5 |
| 110 | PUMA | Y entonces nada, Facundo. Esto es así. Mañana volamos. | 3.0 |
| 120 | NARRADOR | Se va. Nadie se mueve. El Vasco se toca la cruz. El Turco, al rato, junta las herramientas de a una, muy despacio, como si ordenar sirviera para algo. | 3.5 |
| 130 | NARRADOR | El Belgrano se hundió con **323 muertos**... Casi la mitad de todos los argentinos caídos en la guerra. En una sola tarde... | 4.0 |

> **Nota de tratamiento.** El juego da los hechos y nada más: fuera de la zona de exclusión, rumbo
> oeste, dos torpedos, temporal, 323. **La bronca la ponen los personajes** — ellos sí lo llaman lo
> que les parece. La narración no adjetiva: no hace falta.
>
> Y fijate el eco: el gorro que el Turco levanta del piso y le sopla el polvo en `M03_ARANDELA` es
> el mismo que en la línea 070 deja sobre el banco **y no levanta más**.

---

## 4 · QUÉ SE ENSEÑA Y QUÉ SE HABILITA

### El temario de M3
1. **El sistema de mejoras** — el tema de la misión.
2. **Sentir una mejora en las manos**: venís de instalar TERRAIN MASKING y el avión responde
   distinto.
3. **Repaso sin costo** de lo de M1 y M2: cañón contra las boyas, rasante, obstáculos, radar.

### Qué tiene el jugador
Todo lo de M1 y M2, **más TERRAIN MASKING** (`abajo abajo-abajo`): clava el avión a ras, congela el
roce y **descarga el radar**.
**Sin Pulso. Sin bombas.**

### Qué se habilita al terminar
**La elección.** `ofertaTrasMision(2) = 2`: de acá en adelante, tras cada misión se ofrecen **dos
mejoras y se elige una**. El guion dice lo mismo: *"A partir de acá, tras cada misión, el juego
ofrece dos mejoras y se elige una."*

Con 10 ventanas y 12 mejoras, **dos quedan sin aprender por partida**. Las mejoras salen de la
libreta del Pichón; **a partir de M8, muerto el Pichón, la pantalla cambia de nombre y las
construye el Turco solo.**

---

## 5 · QUÉ PASA SI TE PEGAN

Igual que siempre: **nadie muere por gameplay**, el avión queda averiado y asumís el siguiente del
roster. En M3 la vuelta tiene obstáculos pero no cazas, así que el riesgo real es bajo.

---

## 6 · CINEMÁTICA

**Ninguna nueva.** El final emocional de M3 no está en el aire: es el hangar y el Belgrano, y eso
son escenas VN.

> Antes había propuesto generar acá el clip de una bomba entrando en una boya. **Se descartó**: ese
> clip lo necesita **M6** (`muerte_sorda` — impacto y después nada), y allá se genera.

---

## 7 · PENDIENTES

### ⏳ Decidido, falta hacer
1. Declarar `fases:` con vuelta corta (`hasta: 1.3`), con obstáculos y sin cazas.
2. Las **boyas y el radar portátil** como blancos de oportunidad reales.
3. Enganchar la **pantalla de elección de mejora** después de la misión.

### ⚠ Bugs
4. **Las charlas en vuelo no dibujan nada.** Se come `M03_OBJETIVO`.

### 🗑 Para borrar
5. `strings.js → storyM3` / `epiM3` cuando se confirme que manda `story.js`.

---

## 8 · CORRECCIONES DEL AUTOR

*(Escribir acá. Lo que se escriba en esta sección manda.)*

-
-
-
