# LIBRO DE VUELO — las misiones reales de la demo

*Implementación del pedido del 12/10/2026 y de [`PROMPT_DEMO_MISIONES_REALES.md`](PROMPT_DEMO_MISIONES_REALES.md).
El código está en `src/data/libro_vuelo.js`. Se prueba con `npm run libro`.*

> Pedido del autor (12/10): *"el punto de menú HISTORIA con dos secciones: una que diga CAMPAÑAS, y
> esté la de Mateo BLOQUEADA, y debajo otra sección llamada LIBRO DE VUELO, y cada misión tiene el
> DÍA Y LA HORA en que ocurrió, con una breve descripción de lo que sucede (...) por cada misión se
> cuenta el contexto inicial, te deja elegir entre los aviones que participaron y las
> configuraciones que tenían, y poder vivir esa misión con esa configuración. Al final de cada
> misión se cuenta lo que realmente pasó, independientemente del resultado."*

## Qué hay hecho

| | |
|---|---|
| **Menú HISTORIA** | Dos secciones: **CAMPAÑAS**, con *El cuaderno de Mateo* en gris y BLOQUEADA, y **LIBRO DE VUELO**, con las cuatro salidas en orden de fecha (nombre · día · hora y de qué es la hora · avión). Al pie, la escuadrilla y la descripción de la salida marcada. CONTINUAR no aparece. La perilla es `CAMPANA_BLOQUEADA` en `libro_vuelo.js` |
| **Contexto** | Una TARJETA: el dato (fecha · hora · base) y el texto de contexto |
| **Elegí tu avión** | Una fila por avión de los que volaron (matrícula · tipo) con **la carga que llevaba**, y el avión a la derecha |
| **El vuelo** | Molde de IDA Y VUELTA SMALL (t17), **sin la radio de los personajes de la campaña**. El escuadrón es la escuadrilla real: tantos aviones como volaron, todos **PILOTO** con la cara de Esteban, y en la placa la **matrícula** del que vuela (la elegida al mando). Sin sello de PRUEBA |
| **Lo que pasó** | Al terminar la corrida, cumplida o derribada, se cuenta lo que pasó y se vuelve al libro, sobre la misma salida. **No se reintenta**: volver a volarla es elegirla de nuevo. Salir desde la pausa vuelve al libro sin contar nada |

| Salida | Avión | Escuadrón | Clímax | Chancha | Bomba · defensa | Clima |
|---|---|---|---|---|---|---|
| **El Sheffield** · 4/5 | Super Étendard | 2 | Pulso | sí, en la ida | — (Exocet) | niebla |
| **La Glasgow** · 12/5 | A-4B | 4 (ORO) | suelta | sí | MK-17 · Sea Wolf | niebla |
| **La Ardent** · 21/5 | A-4Q | 3 | suelta | **no** | BRP-250 · Sea Cat | nublado |
| **La Plymouth** · 8/6 | Dagger | 5 (PERRO y GATO) | suelta | **no** (sin sonda) | BRP-250 · Sea Cat | despejado |

Las citas reales van tal cual, por la radio: *«¡Harrier! ¡Harrier!»* al entrar los cazas en la vuelta
de la Ardent, y *«¡Buque enemigo a las tres!»* en el tramo del blanco de la Plymouth. Las dice
«NUMERAL» (sin nombre).

## ⏳ Textos que esperan tu OK

En el juego se ven como `[ texto pendiente del OK del autor ]`. Aprobados, se reemplaza
`PENDIENTE` por el texto en `libro_vuelo.js` y nada más. **Ninguno nombra personas.**

### El Sheffield
- **Descripción (pie del libro):** *Dos Super Étendard de la Armada salen de Río Grande a buscar a la
  flota con un Exocet cada uno. Al ras del mar, con niebla, guiados por un Neptune.*
- **Contexto:** *Un Neptune de la Armada encontró a la flota esa mañana. Dos Super Étendard despegaron
  de Río Grande a las 09:45 y cargaron nafta de un Hércules en la ida. Al ras del mar, sin radar, hasta
  la posición que pasó el Neptune. Para apuntar hay que subir y prender el radar: una sola vez.*
- **Lo que pasó:** *4 de mayo de 1982. A las 11:04 los dos Super Étendard lanzaron sus Exocet desde 20 a
  30 millas, y volvieron al ras a Río Grande. Uno alcanzó al HMS Sheffield. Murieron 20 tripulantes. Se
  hundió seis días después, mientras lo remolcaban.*

### La Glasgow
- **Descripción:** *Dos escuadrillas de A-4B salen de Río Gallegos contra dos buques en el estrecho.
  Volás la segunda, ORO, contra la Glasgow.*
- **Contexto:** *Dos buques británicos bombardeaban las posiciones de Puerto Argentino. A las 12:20 salió
  la escuadrilla CUÑA contra la Brilliant; a las 12:30, ORO contra la Glasgow. La Brilliant tiene Sea
  Wolf. Último día de niebla.*
- **Lo que pasó:** *12 de mayo de 1982. De ocho A-4B volvieron cuatro: los Sea Wolf de la Brilliant
  bajaron a tres de CUÑA. Una bomba de ORO atravesó a la Glasgow de lado a lado y estalló en el agua: el
  destructor quedó fuera de combate el resto de la guerra. Al volver, uno de ORO cruzó Pradera del Ganso
  y lo derribó la antiaérea propia.*

### La Ardent
- **Descripción:** *Tres A-4Q de la Armada, sin Hércules: cada litro contado. El blanco asignado no
  está; el alternativo, los buques de San Carlos.*
- **Contexto:** *21 de mayo, el día del desembarco en San Carlos. La primera sección de la Tercera
  Escuadrilla despega de Río Grande a las 14:10, con cuatro bombas con cola retardadora cada uno. No hay
  Hércules: la nafta es la que se lleva. Hay mal tiempo en la boca del estrecho.*
- **Lo que pasó:** *21 de mayo de 1982. Los tres A-4Q le pegaron a la HMS Ardent; la segunda sección,
  ocho minutos después, también. La fragata se hundió. A la salida, dos Sea Harrier derribaron a los
  tres: dos pilotos se eyectaron y sobrevivieron; el tercero no volvió.*

### La Plymouth
- **Descripción:** *Seis Dagger salen de Río Grande hacia Bahía Agradable. Al ras y muy rápidos, se
  pasan, y encuentran una fragata sola en el estrecho.*
- **Contexto:** *8 de junio. Dos escuadrillas de Dagger, PERRO y GATO, salen de Río Grande. Uno vuelve
  porque un pájaro le rompe el parabrisas: quedan cinco. El Dagger no carga nafta en vuelo: lo que llevás
  es lo que hay.*
- **Lo que pasó:** *8 de junio de 1982. Cinco Dagger encontraron sola a la HMS Plymouth en el estrecho
  de San Carlos. Cuatro bombas la alcanzaron: una atravesó la chimenea y otra hizo estallar una carga de
  profundidad. Quedó fuera de combate. Volvieron todos.*

## Lo que verifiqué y lo que cambia respecto del prompt

| Dato | Prompt | Fuentes | Qué puse |
|---|---|---|---|
| Sheffield: aterrizaje | 12:10 | 12:04 (RNA, Wikipedia) | no se muestra; en el texto propuesto no va |
| Sheffield: blanco repetido | «ninguna repite un blanco de la campaña» | **M4 de la campaña ya vuela contra el HMS SHEFFIELD** | se deja así; **decidí vos** si la demo cambia de blanco o M4 |
| Glasgow: la bomba | «no explota» | la atravesó y **estalló en el agua** (Presidencia) | texto propuesto con la versión oficial |
| Glasgow: hora | — | CUÑA despega 12:20, ORO 12:30 (Presidencia, ASN); **no hay hora del ataque** | 12:30, rotulada «despegue» |
| Ardent: hora y carga | — | despegue 14:10, **cuatro MK-82** cada uno (Castro Fox, Boletín del Centro Naval 817) | 14:10 «despegue»; carga «4 MK-82 SNAKEYE + 2 TANQUES» |
| Ardent: matrículas | — | 3-A-307, 3-A-312, 3-A-314 (**ASN, baja confianza**) | las tres, a confirmar con la Armada |
| Ardent: intemperie | «dos noches» | «tres días» (Castro Fox) | no va en ningún texto |
| Plymouth: el que vuelve | «fisuras en el parabrisas» | un **pájaro** le dañó el parabrisas (Presidencia) | texto con el pájaro |
| Plymouth: impactos | «dos rebotan en el agua y entran» | chimenea, una adentro sin estallar, el mortero, una carga de profundidad que estalla (Presidencia) | texto con la versión oficial; **el rebote no se pone** |
| Plymouth: hora y matrículas | «cerca de las 13» | no hay hora argentina; los británicos esperaban el ataque hacia las 13:30 y llegó antes | «≈13:00 ataque»; sin matrículas: se elige PERRO o GATO |
| Plymouth: base en pantalla | BAM | los Dagger operaban desde la base **aeronaval** de Río Grande | «BAN RÍO GRANDE» |

## Lo que el juego todavía no tiene (no se fingió)

- **Las cargas reales que no tienen capa**: el Exocet del Super Étendard (se cuelga un tanque) y las
  cuatro MK-82 del A-4Q (se cuelga una bomba). El rótulo dice la carga real.
- **La MK-82 Snakeye**: la Ardent vuela con la BRP-250, que es la bomba con cola retardadora que existe.
- **La antiaérea propia de Pradera del Ganso** en la vuelta de la Glasgow.
- **El Neptune** que pasa los datos del Sheffield: va en el contexto, no hay radio propuesta.
- **El pasillo que se abre en tres** (la Ardent) y **el rebote** de la bomba (la Plymouth).
- **Las líneas de radio que no son citas**: no hay ninguna. Si querés radio en la ida (el Neptune, la
  cita con el Hércules), proponela y la pongo.
- **Un retrato propio para PILOTO**: vuela con la cara de Esteban.

## Fuentes

- Presidencia de la Nación: [12 de mayo](https://www.argentina.gob.ar/node/501140) ·
  [8 de junio](https://www.argentina.gob.ar/noticias/malvinas-44-anos-un-dia-negro-para-la-flota-invasora) ·
  [21 de mayo](https://www.argentina.gob.ar/node/375838)
- [Boletín del Centro Naval 817 — Castro Fox](https://mail.centronaval.org.ar/boletin/BCN817/817castrofox.pdf)
- [DEF Online — 8 de junio](https://defonline.com.ar/defensa/malvinas-la-mision-de-la-fuerza-aerea-que-hizo-del-8-de-junio-el-dia-mas-negro-para-la-flota-britanica/)
- [RNA — 4 de mayo](https://rna-norwich.org.uk/2022/05/on-this-day-4-may-attack-on-hms-sheffield/) ·
  [Wikipedia — HMS Sheffield](https://en.wikipedia.org/wiki/HMS_Sheffield_(D80))
- Aviation Safety Network: [C-248](https://aviation-safety.net/wikibase/54622) ·
  [3-A-307](https://cdn.aviation-safety.net/wikibase/54619)
