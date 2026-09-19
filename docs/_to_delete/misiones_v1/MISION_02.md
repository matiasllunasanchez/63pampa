# M2 · EL BAUTISMO DE FUEGO

> **FUENTE DE VERDAD SUPREMA.** Lo que el autor escriba acá manda sobre el código, sobre
> `GUION_3.md` y sobre cualquier otra documentación.
> **Texto verbatim de `src/data/story.js`.**
> **Estado:** ⬜ sin revisar por el autor.

---

## 1 · IDENTIDAD

| | |
|---|---|
| **Fecha** | 1 de mayo de 1982 |
| **Lugar** | Costa de las islas |
| **Indicativo** | Escuadrilla **CHIMANGO** |
| **Objetivo (código)** | `goal: { kind: 'distance', meters: 2600 }` ⚠ cambia — ver §3.8 |
| **Escuadrón** | `roster: F5` — los cinco |
| **Par** | 6500 |
| **Brief corto** | *"Cruce de costa bajo radar activo. Entrar, cruzar y volver."* ⚠ desactualizado |

**Qué es.** **La primera misión real.** Van a Puerto Argentino a ayudar y a revisar qué quedó
después del bombardeo del 1 de mayo. Es la primera vez que entran en terreno hostil, la primera
vez que les disparan, y la primera vez que caen bombas.

**El título no es sobre disparar. Es sobre que te disparen.**

---

## 2 · EL CONTEXTO HISTÓRICO

El 1 de mayo de 1982 fue el primer día de ataques británicos: el bombardeo de la pista de Puerto
Argentino y el primer combate aéreo real de la guerra. Hasta ese día la guerra era una noticia de
radio. Desde ese día es una cosa que pasa encima tuyo.

---

## 3 · RECORRIDO BEAT POR BEAT

### ══ ANTES DE VOLAR — tres pantallas, PAUSA TOTAL ══

#### ▸ 2.1 — `M02_1` · **LA BRECHA**
**VN · fuera del juego · pausa total** · placa `linea_amanecer`
**Caras:** `puma_neutro`, `tero_preocupado`, `puma_ceno`

| # | Quién | Texto | hold |
|---|---|---|---|
| 010 | NARRADOR | Ellos tienen misiles que piensan solos, radares que ven de noche, Sea Harriers de última generación. Los Fieles tienen aviones con más horas que un colectivo del interior, bombas de otra década y coraje. | 1.5 |
| 020 | PUMA | Ellos tienen la máquina. Nosotros tenemos las manos. Vamos a volar tan bajo que la máquina no va a poder creer que alguien esté tan loco. Esa incredulidad es toda nuestra ventaja. | 1.0 |
| 030 | ESTEBAN | ¿Y alcanza? | 1.5 |
| 040 | PUMA | No, pero es lo que hay. Y lo que hay lo volamos con todo. Como en el potrero, si el rival tiene botines y vos estás descalzo, tenés que gambetear más pegado al piso. | 2.0 |

> Es la tesis del juego dicha en voz alta, y la única vez que se dice así de directo.

---

#### ▸ 2.2 — `M02_MATE` · **LA RONDA**
**VN · fuera del juego · pausa total** · placa `linea_amanecer`
**Caras:** `gitano_thankyou` *(miniatura ya prompteada: `gitano_gracias.png`)*, `pichon_neutro`,
`gitano_sonrisa`, `turco_neutro`

| # | Quién | Texto | hold |
|---|---|---|---|
| 010 | NARRADOR | Antes de subir, el Turco ceba el mate y arranca la ronda con el Gitano. | 1.2 |
| 020 | GITANO | *(toma el mate, lo deja y hace un saludo "como de soldado")* **THANK YOU.** | 1.5 |
| 030 | PICHÓN | ¿Y por qué en inglés? | 0.6 |
| 040 | GITANO | Porque si digo gracias me sacan de la ronda, culiau. | 0.8 |
| 050 | EL TURCO | De la ronda no se va nadie, Ura. | 2.0 |
| 060 | NARRADOR | Mientras la ronda de mate sigue, el Pichón ya está al lado de su avión con la mano abierta apoyada en la chapa y la cabeza gacha, escuchando. No dice nada. Luego de un momento la saca y se seca la palma en el mameluco. | 2.5 |

> **El gesto del Pichón es el mismo de `M01_CINCO`.** Nadie lo comenta nunca. Es el segundo de las
> cinco repeticiones que se cobran en M14.

---

#### ▸ 2.3 — `M02_TARJETA`
**TARJETA · fuera del juego · pausa total** · capítulo 2

> **EL BAUTISMO DE FUEGO**
> *1 de mayo de 1982 · Costa*
> *OBJETIVO · Primera salida de verdad. Cruzar la costa y volver.* ⚠ **hay que reescribirlo** —
> ver §3.8

---

### ══ EL VUELO ══

#### ▸ 2.4 — **DESPEGUE** · guionado

#### ▸ 2.5 — **TRÁNSITO** ⏳ `{ tipo: 'transito', pausa: true }`

#### ▸ 2.6 — `M02_OBJETIVO` · **CHARLA EN VUELO** · seguís volando y manejando; lo que se congela es el kilometraje y la nafta. Corre sola, no se saltea, tope 25 s ⚠
Hoy cuelga del tramo `{ hasta: 0.1 }`.

| # | Quién | Texto | hold |
|---|---|---|---|
| 010 | CÓNDOR | Escuadrilla Chimango, aquí Cóndor. Cruce de costa autorizado. | 0.6 |
| 020 | CÓNDOR | Radar activo en toda la aproximación. Entran, cruzan y vuelven. Nada más. **Buen vuelo.** | 1.0 ⚠ |
| 030 | PUMA | Chimango copia. Pegaditos. | 1.2 |

> ⚠ **La línea 020 está escrita para la versión vieja de la misión** (pura distancia, sin blanco).
> Con el puesto avanzado como objetivo hay que reescribirla. Ver §3.8.

#### ▸ 2.7 — **LA IDA · EL RADAR CON CASTIGO** ⏳ *(debut, decisión del autor)*
**Dentro del juego · no frena.** Acá debuta la fase **`filo`**: el techo se estrangula
(`FILO_RADAR = 9`, muy por debajo de `RADAR_ALT = 20`), el mundo queda vacío y la radio muda.

**No hay enemigos puestos a mano — salvo que te vean.** Si el radar te completa la barra,
`pinta: 'cap'`: **no perdés la corrida, perdés el silencio**, y de ahí en adelante el mundo te
espera armado. **La amenaza de la ida sos vos.**

#### ▸ 2.8 — **EL OBJETIVO: EL PUESTO AVANZADO DEL ISLOTE** ⏳ *(decisión del autor)*

**Un islote con un puesto avanzado británico.** El puesto tiene la antena, y **mientras está en pie
es el que te carga la barra**. Se revienta **a cañón** — la entidad `radar` ya existe en el motor
(`ENEMY_HP.radar = 2`, con sprite en `cajas.js` y despiece propio en `despiece.js`). Al caer, **la
barra deja de subir por el resto de la misión.**

**Sin Pulso:** el Pulso sólo aparece cuando hay algo concreto que destruir *con bombas*, y además
todavía no hay vocabulario de piruetas (el Pulso se teclea con piruetas aprendidas y recién en M4
hay tres).

> **Por qué así.** El guion de `GUION_3.md` dice *"1 de mayo. Costa. **Boss: radar británico.** La
> primera de verdad."* El código lo había degradado a `kind: distance`. El guion tenía razón, y
> además **el objetivo es la explicación de la mecánica**: el jugador entiende sin un solo cartel
> qué era esa cosa que lo venía apretando desde M1.

#### ▸ 2.9 — **CINEMÁTICA DE SALIDA** · el avión yéndose
Clip ya existente. **No hay que generar nada.** El despiece del puesto lo resuelve el motor.

#### ▸ 2.10 — **LA VUELTA — ACÁ PASA EL TÍTULO** ⏳
**Completa y hostil.** `{ tipo: 'vuelta' }` con sus defaults puestos: `obstacles: 1.6`, `caza: 2`,
voces prendidas.

- **Es la primera vez en toda la campaña que te disparan.**
- **Es la primera vez que caen bombas.** Y caen acá por una razón: una bomba en pantalla significa
  exactamente una cosa, **te vieron**. Después de reventar el puesto, ya no sos un fantasma.

> Sin vuelta, M2 se llama como una cosa que no ocurre.

#### ▸ 2.11 — **ATERRIZAJE** ⏳

---

### ══ DESPUÉS DE VOLAR — tres pantallas, PAUSA TOTAL ══

#### ▸ 2.12 — `M02_5` · **RASPADOS**
**VN · fuera del juego · pausa total** · placa `hangar_noche` · img `M02_5`

| # | Quién | Texto |
|---|---|---|
| 010 | NARRADOR | Vuelven todos, pero raspados. El Pichón aterriza con el avión agujereado y las manos temblándole. |
| 020 | NARRADOR | El Turco lo abraza sin decir nada y se pasa la noche remendando chapa a la luz de un farol. A la mañana, el avión tiene los agujeros parchados y una estrellita nueva. |
| 030 | EL TURCO | ¿Ves? Esa no es del avión. Es tuya. Te la ganaste, changuito. |

#### ▸ 2.13 — `M02_8` · **EL CUADERNO**
**TIERRA · fuera del juego · pausa total** · placa `p1c_cuaderno` · img `carta3_m2`

| # | Texto |
|---|---|
| 010 | Pá: hoy comimos una vez. En todo el día. La comida está —la mandan del continente— pero nunca llega a nosotros. El Colorado me pasó la mitad de su lata, jurando que él ya había comido. Una mentira grande como una casa. Le escuché las tripas toda la noche. |
| 020 | Hay un subteniente, Bordón. Tiene su carpa custodiada y llena de cajas. Estamos convencidos de que son las raciones y demás cosas que nos mandan. Pero nadie dice nada acá. El que abre la boca, la pasa mal. |
| 030 | Igual, te cuento una linda: como prohibieron pasar música en inglés, la radio pasa rock nacional todo el día. Pasamos toda la noche con los pibes cantando en el pozo, pá. Tratábamos de distraernos, pero nos ganaron las ganas de llorar. Igualmente cantábamos. |
| 040 | Unas ganas de comer el guiso de mamá... Apenas termine esto le pedimos que lo prepare. Anotalo vos también, que yo acá lo tengo escrito. Mateo. |

> **«Yo acá lo tengo escrito» es literal.** En un rincón de la hoja de dibujos, chiquito, torcido y
> **subrayado a mano**, está anotado *pedir a mamá que prepare guiso*. Sin comillas, sin flecha,
> sin relación con ningún dibujo: una nota que se dejó a sí mismo para no olvidarse.
> Prompt armado: `PROMPTS_TIERRA_LISTOS.md` · CARTA 3 (`carta3_m2.png`).

#### ▸ 2.14 — `M02_HIST` · **PLACA HISTÓRICA** ⏳ **no existe en el código**
Escrita en `PLACAS_HISTORICAS.md`.
⚠ **Bloqueo para publicar:** el texto dice *"varios no volvieron"*, y `C1_ANTES` promete *"los
muertos son reales, los contamos bien"*. **Hace falta la cifra exacta.**

---

## 4 · QUÉ SE ENSEÑA Y QUÉ SE HABILITA

### El temario de M2
1. **El radar con castigo** y la fase `filo`.
2. **Que te disparen.**
3. **Bombas cayendo**, y qué significan.
4. **Averías y chapa** — el avión se rompe y se remienda.
5. **Las estrellitas del Turco** como recompensa personal, no del avión.
6. Que el objetivo puede ser **algo que hay que destruir**.

### Qué tiene el jugador
Todo lo de M1 (rasante, cañón, seguir al líder, aterrizaje, TONEL) **más nada nuevo en las manos**:
M2 no agrega un arma, agrega un peligro. **Sin Pulso. Sin bombas propias.**

### Qué se habilita al terminar
**La primera mejora, servida sin elegir** (`ofertaTrasMision(1) = 1`): la primera de la lista,
**TERRAIN MASKING** — *"Clava el avión a ras: congela el roce y descarga el radar."*
Frase del Pichón: ***"Si abajo no nos ven... ¿por qué subimos?"***

> Es la mejora exacta para la misión del radar, y el calendario del código ya la dejaba ahí sola.
> **Con ella puesta se vuela M3**, que existe para que la sientas.

---

## 5 · QUÉ PASA SI TE PEGAN

Igual que en M1: **nadie muere por gameplay.** El avión queda averiado, rompe formación rumbo a la
base, y asumís el siguiente del roster (`TERO → PUMA → GITANO → VASCO → PICHÓN`).

La diferencia con M1 es que **acá sí puede pasar**: hay cazas y bombas en la vuelta.

---

## 6 · PENDIENTES

### ⏳ Decidido, falta hacer
1. Cambiar el objetivo de M2 a **el puesto avanzado del islote** (`goal` de tipo blanco, no
   distancia).
2. **Reescribir `M02_OBJETIVO_020`**: hoy dice *"Entran, cruzan y vuelven. Nada más."*
3. **Reescribir la línea OBJETIVO de `M02_TARJETA`** y el `briefM2`.
4. Declarar `fases:` con **`filo` debutando** y la vuelta completa.
5. El radar **pasa de tutorial a castigo**.
6. Escribir y pegar **`M02_HIST`** — falta la cifra exacta de bajas.

### ⚠ Bugs
7. **Las charlas en vuelo no dibujan nada** (ver M1 §6.9). Se come `M02_OBJETIVO`.

### 🗑 Para borrar
8. `strings.js → storyM2` / `epiM2` cuando se confirme que manda `story.js`.

---

## 7 · CORRECCIONES DEL AUTOR

*(Escribir acá. Lo que se escriba en esta sección manda.)*

-
-
-
