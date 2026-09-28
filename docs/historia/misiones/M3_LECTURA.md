# MISIÓN 3 — El invento

*Primeros días de mayo de 1982 · patrulla costera*

---

## PANEO GENERAL

*Todo lo que tiene la misión en una página. El detalle, abajo.*

> **Estado al 27/9:** esto es **cómo está hoy en el código**. Lo que hay que cambiar está al
> final de este paneo, en *Lo que falta*.

### La secuencia completa

| # | momento | escena | tipo | quién habla | qué pasa |
|---|---|---|---|---|---|
| 1 | antes | `M03_INVENTO` · El invento | pantalla | Turco, Pichón, Gitano, Puma | el pibe le toca el avión y el Turco decide escucharlo |
| 2 | antes | `M03_TARJETA` | tarjeta | — | título y objetivo |
| — | antes | **falta `M03_PISTA`** | — | Cóndor | **la regla de campaña dice que Cóndor cierra, y acá no cierra** |
| 3 | ida | `M03_OBJETIVO` | radio en vuelo | Cóndor, el Turco | la patrulla, y *"despacio al invento del changuito"* |
| 4 | ida | — | — | **nadie** | silencio hasta el final |
| 5 | vuelta | — | — | — | **hoy no existe: la misión es una sola tirada de 2.400 m** |
| 6 | llegada | aterrizaje | jugable | — | el de siempre |
| 7 | después | recuento | pantalla | — | con puntos y estrellas |
| — | después | **falta la elección de mejora** | — | — | **G-09 la manda acá, y no está enganchada** |
| 8 | después | `M03_ARANDELA` · El primer fracaso glorioso | pantalla | Turco, Pichón, Gitano | el invento explota y le vuela el gorro al Turco |
| 9 | después | `M03_BURRADA` · La burrada del Gitano | pantalla | Gitano, Turco, Pichón, Vasco, Puma | la maniobra imposible |
| 10 | después | `M03_CUADERNO` | carta | Mateo | la navaja del Colorado |
| 11 | después | `M03_BELGRANO` · 2 de mayo | pantalla | Pichón, Gitano, Puma | la risa se corta a la mitad |
| — | después | **falta `M03_HIST`** | — | — | **puede que no haga falta: el hecho ya está adentro de la escena** |

### Qué se enseña, y quién

| qué | quién | cómo |
|---|---|---|
| que una mejora se siente en las manos | nadie, y está bien | el avión sale distinto del rasante; es lo único que la misión pide entender |
| que de acá en adelante se elige mejora | — | **la pantalla de elección no está enganchada** |
| repaso de cañón, rasante, radar | — | sin castigo, porque no hay con qué castigarte |
| que después de atacar te buscan | — | **hoy no pasa: no hay vuelta y no hay cazas en ningún momento** |
| el sistema de mejoras como sistema | — | **no lo explica nadie** |

> **M3 es la misión más liviana de la campaña a propósito, y ese es su riesgo.** Está bajada para
> que se note una sola cosa. Si esa cosa no se nota —porque la mejora no está enganchada, porque
> nadie la nombra—, la misión queda sin motivo.

### Mecánicas: qué está prendido y qué no

*Al lado, M2, que es de dónde viene el jugador.*

| | M2 | M3 |
|---|---|---|
| cielo | atardecer | **amanecer** (`sky: 'dawn'`) |
| terreno | mar abierto | **costa** (`terrain: 'coast'`) |
| enemigos (cazas) | sí | **no, ninguno** (`caza: 0`) |
| bombas enemigas | sí, a media cadencia | **no** (`bombs: 0`) |
| obstáculos | cadencia normal | **la mitad** (`obstacles: 0.5`) |
| radar | normal | **normal, sigue costando igual** |
| persecución | no | no |
| poderes | sí | sí |
| clima | viento | viento; ni lluvia ni niebla |
| morir / cambiar de piloto | cinco pilotos | **cinco pilotos** (`roster: F5`) |
| combustible | lo que tenga puesto el jugador | **igual: M3 tampoco lo declara** |
| ida y vuelta | no | **no**: `goal: distance 2.400 m`, sin `fases` |
| objetivo real | no | **no**: llegar a los 2.400 m *es* el objetivo |
| puntos en pantalla | sí (par 6.500) | **sí** (par 7.000) |
| mejora al terminar | servida sin elegir | **se elige entre dos — pero falta engancharlo** |

### Lo que falta

- **Los blancos reales.** Las boyas y el radar portátil no existen: hoy son obstáculos genéricos
  sembrados a la mitad de cadencia.
- **La forma ida / objetivo / vuelta corta.** M3 no declara `fases`. M1 sí — es el molde a copiar.
- **La pantalla de elección de mejora, y dónde entra exactamente.** `G-09` dice *inmediatamente
  después de la misión, antes de la carta*. Pero la carta es la **tercera** escena del epílogo:
  primero la arandela, después la burrada, y recién ahí el cuaderno. **Hay que decidir si la
  elección va antes de la arandela o justo antes del cuaderno.**
- **El cierre de Cóndor** antes de jugar (`M03_PISTA`). No existe. Hoy la última voz antes de
  jugar es la de Puma apostando dos cajas de puchos.
- **`brief: 'briefM3'` apunta a una secuencia que no existe.** No hay `briefM3` en `story.js`, y
  en `src/data/` no hay nadie que lea `.brief`. **Es el mismo caso que M2** — o se escribe, o se
  saca la declaración.
- **`M03_HIST` no existe.** Puede que esté bien así: el dato histórico de esta misión es el
  Belgrano, y ya está adentro de `M03_BELGRANO` como línea de narrador — eso se decidió en M3-14.
  **Decidir si además lleva placa o no.**
- **El comentario del código de `M03_BURRADA` quedó viejo.** Todavía enumera la coreografía con
  *"tirar el caño"*, que M3-06 sacó. Las líneas están bien; el comentario miente.
- **Las caras.** `gestos.js` dice que los cinco Fieles tienen cinco gestos —neutro, ceño,
  preocupado, sonrisa, roto— y eso es el cuadro **en vuelo**. Las escenas usan más de setenta
  caras distintas, y varias de M3 son de actuación pura: `turco_pensante`, `gitano_imaginando`,
  `gitano_delirante`, `vasco_rezo`, `vasco_espalda`, `puma_enojado`, `condor_radio`. **Hay que
  confirmar cuáles existen como retrato de escena.** En la pasada anterior ya salió una que no
  existía: `turco_ternura`, en `M02_5`.
- La charla en vuelo de Cóndor **no se dibuja** (bug de toda la campaña, ver M1).

---

## Antes de empezar

**La misión de la comedia.** Se ríen del principio al final — y al final entra el Pichón con una
noticia y la risa se corta a la mitad.

Jugablemente es **la presentación del sistema de mejoras**, y está puesta acá a propósito: se
enseña en la misión más liviana, no en el medio del fuego.

---

## El invento

*El Pichón está trepado a una escalera contra el avión de Esteban, con la manga sucia de grasa
hasta el codo. El Turco abajo, con los brazos cruzados y cara de tribunal.*

**EL TURCO:** Bajate de ahí, chango. Va a hace' cagada.

**PICHÓN:** Es que mire... si le corremos la toma dos dedos y le sacamos este peso muerto de acá,
en la salida del rasante gana empuje. Lo vi en la salida de ayer, Tero se quedaba y el del capitán
no, y la única diferencia es...

**EL TURCO:** No, changuito... Bajate.

**PICHÓN:** Perdón... Ya me bajo...

**EL TURCO:** *(mientras Pichón baja, se queda pensativo mirando el avión)* A ver... mostrame...

**GITANO:** *(mientras ambos murmuran cosas técnicas mirando el avión y unos papeles, se acerca a
Puma)* Una caja de puchos a que el Turco lo manda a cagar antes del mediodía.

**PUMA:** Dos cajas a que después lo prueba igual.

> *Los tres segundos que el Turco se queda callado antes de decir "a ver, mostrame" son la escena
> entera: es el tiempo que tarda un tipo así en decidir escuchar a un pibe de veintidós.*

---

**Aparece la tarjeta:** *EL INVENTO — Primeros días de mayo de 1982 · Patrulla costera.*
*OBJETIVO · Patrulla de reconocimiento costero. Probar el invento del Pichón.*

---

## ▓ SE JUEGA LA MISIÓN

### Cómo está armada hoy, en criollo

**Se despega al amanecer y se vuela 2.400 metros sobre la costa. Llegar es ganar.** No hay blanco,
no hay giro y no hay vuelta.

Y no hay nada que te ataque: **ni un caza, ni una bomba, en toda la misión.** Lo único que hay son
obstáculos, a la mitad de la cadencia normal, y el radar, que sigue costando igual que en la
misión dos pero no tiene con qué cobrártelo.

Es, tal cual, la misión más liviana de la campaña. **Está bien que lo sea** — el problema es que
lo único que justifica esa calma, que es sentir la mejora puesta, todavía no está enganchado.

### Cómo tiene que quedar

**Patrulla de reconocimiento sobre la costa. Vuelo libre, cero presión.**

- **No hay enemigos ni bombas.** Ni cazas, ni bombardeo. Es una misión tranquila y está escrita
  para que lo sea.
- **La mitad de obstáculos de lo normal**, y se vuela sobre la costa, no sobre mar abierto.
- **El radar sigue costando** como en la misión dos, pero no hay quién te persiga si te detectan.
- **El objetivo son blancos de oportunidad:** boyas de señalización enemigas, y un radar portátil
  si aparece. Todo a cañón. No hay un boss.
- **La vuelta es corta y tibia:** hay obstáculos, no hay cazas. Aproximadamente la mitad de lo que
  dura la vuelta de la misión dos.

**Y la gracia real de la misión es otra:** venís de instalar tu primera mejora al terminar la
misión dos, y **el avión responde distinto en las manos.** Todo lo demás está bajado a propósito
para que lo notes.

### Lo que le enseñamos, y cuándo

| Cuándo | Qué aprende | Cómo |
|---|---|---|
| Desde el primer segundo | Que las mejoras se sienten | El avión sale distinto del rasante |
| Toda la misión | Repaso sin costo de M1 y M2 | Cañón, rasante, obstáculos, radar — sin que nada lo castigue |
| Objetivo | Que no toda misión termina en un boss | Blancos sueltos, "si aparece" |
| Vuelta | Que después de atacar te buscan | El mundo se pone un poco más lleno |
| Al terminar | **Que a partir de ahora elegís** | Aparecen dos mejoras y se elige una |

> *Por qué la vuelta no se saca aunque esté vacía: M3 es la primera misión en la que el jugador
> ataca algo. Lo que tiene que quedar instalado es que **después de atacar te buscan**. Si la
> vuelta estuviera vacía, aprendería lo contrario, y la vuelta de la misión cuatro le parecería
> injusta.*

### Cuándo habla cada uno, y si frena el juego

| Momento | Quién habla | ¿Frena? |
|---|---|---|
| Al entrar al pasillo | Cóndor da la patrulla, y el Turco se cuelga de la radio | **No frena** |
| El resto | Nadie | — |

**En la ida, por radio:**

**CÓNDOR:** Escuadrilla Benteveo, aquí Cóndor. Patrulla de reconocimiento costero.

**CÓNDOR:** Blancos de oportunidad nada más: boyas, un radar portátil si aparece. Sin presión. Buen
vuelo.

**EL TURCO:** Y me lo prueban despacio al invento del changuito, ¿eh? Despacio.

**Las boyas.** A cañón, sin apuro.

**Se va el avión.**

**La vuelta**, corta. **Aterrizaje.**

---

## El primer fracaso glorioso

**EL TURCO:** *(de espaldas al cielo, con las manos adentro de un motor. Levanta la cabeza. Pasan
cuatro segundos largos hasta que el punto aparece sobre el mar)* Ahí viene el capitán.

*Prueban el invento del pibe: algo con una tapa y mucha cinta aislante. Hace un ruido espantoso.
Una pieza de metal al rojo vivo sale volando, y se apaga con humo. Le vuela el gorro al Turco y le
roza la oreja al Gitano.*

**EL TURCO:** *(levanta el gorro del piso y le sopla el polvo, muy tranquilo)* No sirve, changuito.
Te dije que no sirve.

**PICHÓN:** Mmmm... interesante.

**GITANO:** *(se acerca frotándose la oreja y ríe)* Interesante dice el culiao... Casi me vuela la
oreja con una arandela... Ajá... interesante.

> *Nadie le pregunta al Turco cómo sabía que venía el capitán. Los cuatro segundos son todo el
> chiste.*
>
> *Y ese gorro que levanta del piso y le sopla el polvo es el mismo que dos escenas más adelante va
> a dejar sobre el banco y no va a levantar más.*

---

## La burrada del Gitano

*El Turco empuja un carrito con un misil hacia el otro avión. El Gitano se le cruza adelante y le
apoya la mano encima, como quien apoya la mano en el hombro de un amigo.*

**GITANO:** Turco, cuchá. Tengo una idea tremenda y quería saber si es posible.

**EL TURCO:** Escucho.

**GITANO:** Venís volando, y aparecen dos atrás, ¿sí? Ellos más veloces que nosotros y no son
fáciles de perder. Además su armamento es mucho mejor que el nuestro.

**EL TURCO:** Si, obvio... ¿y? Mavé.

**GITANO:** *(el Vasco, que caminaba por ahí, se detiene a escuchar)* Entonces, en vez intentar
escapar, tirás la trompa hacia arriba. Derechito al cielo, completamente vertical.

**PICHÓN:** Ahí entrás en pérdida. Estás más expuesto.

**GITANO:** Perfecto. Y ahí... te... TE BAJÁS.

**VASCO:** ¿Te bajás? ¿Cómo que te bajás?

**GITANO:** Te bajás, Vasco. Abrís la cabina y te tirás. Con paracaídas obviamente, por las dudas.

**VASCO:** Diosito.

**GITANO:** Los que te siguen, le siguen yendo al avión, pero vos ya no estás adentro. Y mientras
caés… LES DISPARÁS.

**PICHÓN:** ¿Y con qué?

**GITANO:** Con lo que sea que te lleves encima. Un revolver, una ametralladora, un lanzacohetes...
lo que sea.

**VASCO:** *(se da media vuelta y se aleja)* Buenas tardes, muchachos.

**GITANO:** *(sigue emocionado. El Puma ve la situación y se acerca)* Vos estás en un estado de
locura e inconciencia temporal. ¿Me explico? No le tirás un tiro, porque si le pifiás te comés un
garrón de la gran flauta. Les vaciás el cargador, los reventás a balazos.

**GITANO:** Ya aseguradas las bajas, acomodás el cuerpo en caída libre, y le apuntás a tu propio
avión, que viene bajando por el otro lado. Te metés adentro, cerrás la cúpula, y seguís volando
como si nada.

**PICHÓN:** ¿Y a qué velocidad estarías vos cuando saltás? ¿Usarías el eyector?

**GITANO:** Y... yo calculo...

**EL TURCO:** *(le saca el misil de las manos)* A ver, m'hijo. ¿Vos te pensás que el aire es una
vereda? Vos te bajás de ese avión en el aire y a los treinta segundos te junto con pala.

**GITANO:** Pero el paracaídas...

**PUMA:** FACUNDO...

**GITANO:** ¿QUÉ?

**PUMA:** NO.

> *Es un homenaje a la maniobra imposible de los juegos de guerra: subir vertical con los
> perseguidores encima, eyectarse, voltear al que te sigue mientras caés, y volver a meterte en tu
> propio avión en el aire. El orden de la coreografía es el chiste para el que lo reconoce, y en
> pantalla no se nombra ningún juego, ninguna marca y ningún año: es un piloto de veintipico
> diciendo una burrada en un hangar. El que no lo reconoce se ríe igual.*
>
> *Y el Pichón no tacha lo que anotó. Se paga en la misión nueve.*

---

## El cuaderno

> *Pá: hoy el Colorado me regaló una navaja. Así nomás, sin cumpleaños ni nada. Un cortaplumas
> viejo, con el cabo de asta gastadito de años de mano. "Era de mi abuelo", me dijo. "En el campo,
> un hombre sin navaja no es nadie, chamigo."*
>
> *Le dije que no podía aceptarla y me contestó que un regalo rechazado trae mala suerte, y que acá
> de mala suerte estamos completos.*
>
> *La llevo en el bolsillo de arriba, con la birome. Mis dos herramientas, pá: una para contar y
> otra para lo que venga. La dibujé abajo, mirá. Le hice hasta las marquitas del cabo. Mateo.*

> *La navaja queda plantada, chiquita y sin drama. Vuelve dos veces: en la misión doce, y en una
> encomienda muchos años después.*

---

## 2 de mayo

*Todavía se están riendo de la arandela cuando el Pichón entra desde la sala de radio. Sin correr,
con la libreta en la mano y la cara de alguien que no sabe cómo decir lo que va a decir.*

**PICHÓN:** Huuuu... hundieron al Belgrano.

**GITANO:** ¿Al crucero? Pero si el crucero está afuera de la zona, Pichón. Está navegando para el
otro lado.

**PICHÓN:** Sí, ya sé... El ataque fue desde un submarino. Dos torpedos.

**PUMA:** ¿Cuántos?

**PICHÓN:** No se sabe... No se sabe todavía. Se está hundiendo... con la gente adentro. Además hay
temporal. Y dicen que hay balsas en el agua desde hace horas.

*Silencio largo. El Turco deja el gorro sobre el banco y no lo levanta más.*

**GITANO:** Pero no estaba en la zona... estaba yéndose, Puma.

**PUMA:** Sí.

**GITANO:** ¿Y entonces qué carajo...?

**PUMA:** Y entonces nada, Facundo. Esto es así. Mañana volamos.

*Se va. Nadie se mueve. El Vasco se toca la cruz. El Turco, al rato, junta las herramientas de a
una, muy despacio, como si ordenar sirviera para algo.*

*El Belgrano se hundió con 323 muertos... Casi la mitad de todos los argentinos caídos en la
guerra. En una sola tarde...*

> *El juego da los hechos y nada más: fuera de la zona, rumbo oeste, dos torpedos, temporal, 323.
> La bronca la ponen los personajes — ellos sí lo llaman como les parece. La narración no adjetiva
> porque no hace falta.*

---

## Y al terminar, la primera elección

De acá en adelante **se ofrecen dos mejoras y se elige una**, y así hasta el final. Hay doce
mejoras y diez oportunidades, o sea que **dos quedan sin aprender por partida**. A partir de la
misión ocho, muerto el Pichón, la pantalla cambia de nombre: las construye el Turco solo.

**Hoy esa pantalla no está enganchada, y falta decidir dónde entra.** Ver *Lo que falta*.

---

*Y de acá, a la misión cuatro.*

---
---

# FICHA TÉCNICA

*Para el código. Si estás leyendo la historia, terminó arriba.*

**La configuración de hoy, tal cual está en `missions.js`:**

```
id: 'm3', name: 'EL INVENTO', date: 'primeros dias de mayo de 1982',
despegue: { desde: 'BAM RÍO GALLEGOS', rumbo: 'patrulla de reconocimiento costero' },
goal: { kind: 'distance', meters: 2400 },
cfg: C({ sky: 'dawn', terrain: 'coast', obstacles: 0.5, bombs: 0, caza: 0 }),
tramos: [
  { hasta: 0.1, obstacles: 0, caza: 0, bombs: 0, charla: 'M03_OBJETIVO' },
  { hasta: 1 },
],
roster: F5, par: 7000, story: 'storyM3', brief: 'briefM3', epi: 'epiM3',
```

**En castellano:** 2.400 m de una sola tirada, al amanecer y sobre la costa · el primer 10% va
vacío para que entre la radio de Cóndor · el resto con la mitad de obstáculos y nada más · cinco
pilotos, cinco vidas · 7.000 puntos de referencia.

**Qué se enseña:** el sistema de mejoras, y qué se siente tener una puesta. Todo lo demás es
repaso sin costo.

**Qué NO hay:** enemigos, bombas, Pulso. **Nada persigue a nadie en toda la misión.**

**Cinemática:** ninguna. El final emocional de esta misión no está en el aire, está en el hangar.

**Escenas en el código:** `M03_INVENTO`, `M03_TARJETA` *(storyM3)* · `M03_OBJETIVO` *(en vuelo)* ·
`M03_ARANDELA`, `M03_BURRADA`, `M03_CUADERNO`, `M03_BELGRANO` *(epiM3)*. Falta `M03_HIST`, y
`briefM3` está declarado pero no existe.

**Decisiones ya cerradas** *(en `../RESUELTOS_GUION.md`, no se reabren)*: "Va a hace cagada" queda,
el Turco se queda sin su comodín *aca* en toda la campaña (M3-01) · el paracaídas de la burrada
queda y el cobro de la misión nueve ya fue reformulado para que funcione con él (M3-05) · la
coreografía de la burrada queda como está, con el reingreso y sin tirar el caño (M3-06) · "no
tenés visión, Turco" no entra (M3-08) · el Vasco dice "Diosito" y se va (M3-09) · la cifra del
Belgrano va como línea de narrador y no como placa seca (M3-14).

**Lo que M1 dejó firme y cae sobre M3** *(de `M1_CAMBIOS.md`, ya implementado)*: Cóndor cierra
siempre antes de jugar · cada misión tiene su cartel de despegue con su rumbo · cada misión abre
con su indicativo de ave por radio (acá, **Benteveo**) · el recuento y los puntos existen salvo
que la misión los apague · **ningún personaje nombra una tecla.**
