# M4 · EL DÍA QUE SANGRÓ EL MAR

> **FUENTE DE VERDAD SUPREMA.** Lo que el autor escriba acá manda sobre el código, sobre
> `GUION_3.md` y sobre cualquier otra documentación.
> **Texto verbatim de `src/data/story.js`.**
> **Estado:** ⬜ sin revisar por el autor.

---

## 1 · IDENTIDAD

| | |
|---|---|
| **Fecha** | 4 de mayo de 1982 |
| **Lugar** | Mar abierto |
| **Indicativo** | Escuadrilla **ALBATROS** |
| **Objetivo (código)** | `goal: { kind: 'ship', ship: 'HMS SHEFFIELD', dist: 2600 }` |
| **Clímax** | `pasada` (default) → ⚠ **hoy juega EL PULSO**, porque PASADA y ARENA están en cuarentena |
| **Escuadrón** | `roster: F5` |
| **Par** | 7500 |
| **cfg** | el de campaña con `bombs: 0.5` — **te bombardean a la mitad de cadencia** (es la primera misión con bombardeo enemigo sostenido, pero suave) |

**Qué es.** **La primera misión de verdad con barco.** Es donde el juego se convierte en lo que va
a ser durante diez misiones más: ida rasante, un buque al final, y una vuelta que duele.

**Y es donde debuta EL PULSO.**

---

## 2 · POR QUÉ EL PULSO DEBUTA ACÁ, Y NO ANTES

Dos razones, y la segunda es mecánica y obligatoria:

1. **Es el primer blanco concreto que hay que destruir** *(regla del autor: el Pulso sólo aparece
   cuando hay algo concreto que destruir)*.
2. **El Pulso se teclea con piruetas aprendidas.** `pulso.js` lo dice: *"Ningún compás se inventa:
   cada uno es la secuencia REAL de una pirueta del juego… en campaña sólo salen las piruetas que
   el jugador tiene APRENDIDAS (la libreta del Pichón)."* Con el calendario de mejoras
   (nada tras M1, una servida tras M2, elección tras M3), **recién llegando a M4 hay tres
   maniobras en la libreta**: TONEL (de fábrica), TERRAIN MASKING (servida) y la que elegiste.

**M4 no es sólo el lugar narrativamente correcto para el primer Pulso: es el primero posible.**

---

## 3 · EL CONTEXTO HISTÓRICO, Y LA LICENCIA

El 4 de mayo de 1982 un **Super Étendard de la Armada** lanzó un **Exocet** que impactó el
destructor **HMS Sheffield**. Murieron 20 tripulantes. Fue el primer buque de guerra británico
perdido en acción desde la Segunda Guerra Mundial.

⚠ **Licencia asumida:** en el juego lo ataca la escuadrilla del jugador con un A-4B. En la realidad
fue un misil lanzado por otro avión y otra fuerza. **La placa histórica `M04_HIST` ya dice la
verdad al final de la misión** — es el mecanismo que `C1_ANTES` promete en la apertura.

---

## 4 · RECORRIDO BEAT POR BEAT

### ══ ANTES DE VOLAR — cuatro pantallas, PAUSA TOTAL ══

#### ▸ 4.1 — `M04_FOTO` · **LA CASADA · SEGUNDA VEZ**
**VN · fuera del juego · pausa total** · placa `m7_foto_frente` · **una sola línea**

| # | Quién | Texto | hold |
|---|---|---|---|
| 010 | NARRADOR | El Vasco abre el locker. Mira la foto dos segundos, se besa la mano y toca el papel. Después cierra la puerta. | 4.0 |

> **Una línea, cuatro segundos de silencio, y nadie dice nada.** Es la **segunda de las tres veces**
> que aparece la foto: en M1 el jugador ya la vio y le pusieron nombre, acá la ve otra vez con el
> Vasco besándose la mano, y en M7 se entera de quién es. Misma placa `m7_foto_frente` que M1: **es
> la misma foto, y se ve.** El jugador todavía cree que sabe la historia.

---

#### ▸ 4.2 — `M04_1` · **4 DE MAYO**
**VN · fuera del juego · pausa total** · placa `linea_amanecer`

| # | Quién | Texto | hold |
|---|---|---|---|
| 010 | NARRADOR | El 4 de mayo de 1982, el mundo se enteró que la flota más poderosa podía sangrar. Un misil Exocet alcanzó al destructor británico HMS Sheffield. | 1.5 |
| 020 | GITANO | ¡Le dimos, muchachos! ¡Le dimos! ¡A la Royal Navy! ¡Que se enteren en Londres que acá abajo hay gente con huevos! ¡Vamos Argentina, CARAJO! | 0.8 |
| 030 | PUMA | Veinte marinos, Gitano. | 1.5 |
| 040 | GITANO | ...veinte marinos... veinte... | 2.0 |
| 050 | PUMA | Del otro lado hay padres e hijos. Pibes iguales a nosotros que hoy no vuelven. Alegrate de que nosotros sí. Y guardá silencio por los que no. | 3.0 |

> **Es la escena que define la moral del juego entero.** La celebración dura dos líneas y Puma la
> apaga con un número. Y el número es real: fueron 20.

---

#### ▸ 4.3 — `M04_2` · **LA GAMBETA**
**VN · fuera del juego · pausa total** · placa `linea_amanecer`

| # | Quién | Texto | hold |
|---|---|---|---|
| 010 | GITANO | Algún día les vamos a ganar en algo que no mate a nadie. Algún pibe nuestro va a agarrar una pelota y los va a gambetear a todos, Puma. ¡A TODOS! Y ese día va a ser más grande que éste. | 1.5 |
| 020 | PUMA | Ojalá la única guerra que nos quede sea esa. | 2.5 |
| 030 | NARRADOR | Camino a los aviones, Esteban se para un segundo delante del suyo, estira dos dedos y toca el terito. Luego sigue caminando. | 2.0 |

> **Se paga en la postcrédito ("EL PIBE DE LA 10").** Y la línea 030 es la segunda repetición del
> gesto de Tero: el jugador lo está aprendiendo sin saberlo.

---

#### ▸ 4.4 — `M04_TARJETA`
**TARJETA · fuera del juego · pausa total** · capítulo 4

> **EL DÍA QUE SANGRÓ EL MAR**
> *4 de mayo de 1982 · HMS SHEFFIELD*
> *OBJETIVO · Atacar al destructor HMS Sheffield.*

---

### ══ EL VUELO ══

#### ▸ 4.5 — **DESPEGUE** · guionado

#### ▸ 4.6 — `M04_OBJETIVO` · **CHARLA EN VUELO** · seguís volando y manejando; lo que se congela es el kilometraje y la nafta. Corre sola, no se saltea, tope 25 s ⚠
Tramo `{ hasta: 0.10 }`.

| # | Quién | Texto | hold |
|---|---|---|---|
| 010 | CÓNDOR | Escuadrilla Albatros, aquí Cóndor. Blanco: destructor, clase 42. | 0.6 |
| 020 | CÓNDOR | Es el que le da cobertura al resto de la flota. Si cae ése, el resto queda mirando. **Buen vuelo.** | 1.2 |

---

### ▸ 4.7 — **EL NARWAL** — cinco charlas encadenadas durante la ida

Cuelgan de cinco tramos consecutivos (`0.15 / 0.20 / 0.25 / 0.30 / 0.351`), todos con
`obstacles: 0, caza: 0, bombs: 0, marcas: true`. **Es el tramo largo de conversación de la
campaña**, y la razón por la que la ida de M4 está deliberadamente vacía de enemigos.

#### `M04_NARWAL_A` · **LAS POSICIONES**
| # | Quién | Texto | hold |
|---|---|---|---|
| 010 | CÓNDOR | Plata Fiel, anoto posiciones. Dos unidades al noreste, rumbo sur, velocidad diez. | 0.6 |
| 020 | CÓNDOR | Una tercera más atrás, sin confirmar. | 0.8 |
| 030 | PUMA | Copiado, Cóndor. | 1.2 |

#### `M04_NARWAL_B` · **DE DÓNDE SALEN**
| # | Quién | Texto | hold |
|---|---|---|---|
| 010 | GITANO | Cóndor, una pregunta de curioso nomás. ¿De dónde sacás vos todo eso? | 0.4 |
| 020 | GITANO | Porque nosotros acá no vemos un carajo hasta que lo tenemos encima. | 0.8 |
| 030 | CÓNDOR | *(sin ningún énfasis, como quien lee una planilla)* De un barco pesquero llamado Narwal. | 1.2 |
| 040 | GITANO | …¿Un pesquero? | 1.0 |

#### `M04_NARWAL_C` · **SETENTA METROS**
| # | Quién | Texto | hold |
|---|---|---|---|
| 010 | CÓNDOR | Un pesquero. Setenta metros. Tira la red, la levanta, la vuelve a tirar. | 0.4 |
| 020 | CÓNDOR | Y mientras tanto anota todo lo que le pasa al lado. | 1.0 |
| 030 | GITANO | ¡Pará! ¿Me estás diciendo que la flota inglesa le está pasando por adelante a unos tipos que están pescando? | 0.8 |

#### `M04_NARWAL_D` · **TRES SEMANAS**
| # | Quién | Texto | hold |
|---|---|---|---|
| 010 | CÓNDOR | Por adelante, por atrás y por arriba. Hace tres semanas. | 1.0 |
| 020 | GITANO | *(la risa se le apaga sola)* …Tres semanas ahí adentro. ¿Y esos tipos qué son? ¿Marina? | 0.8 |
| 030 | CÓNDOR | Un oficial a bordo. El resto, pescadores. | 0.6 |
| 040 | GITANO | ¿Pescadores pescadores? | 0.5 |
| 050 | CÓNDOR | Pescadores pescadores. | 1.5 |

#### `M04_NARWAL_E` · **SIN NADA PARA TIRAR**
| # | Quién | Texto | hold |
|---|---|---|---|
| 010 | VASCO | Sin nada para tirar. | 1.0 |
| 020 | CÓNDOR | Sin nada para tirar. | 2.0 |
| 030 | PUMA | *(casi para sí mismo, y es lo único que dice en todo el tramo)* No son militares, Gitano. Y están más adentro que nosotros. | 3.0 |

> **Por qué esta conversación está acá.** El Narwal existió: un pesquero que espiaba a la flota
> británica y al que terminaron atacando. La escena no lo juzga ni lo explica — **lo cuenta en
> cinco pedazos mientras volás**, con el Gitano haciendo las preguntas del jugador y el Vasco
> diciendo la única frase que importa, repetida por Cóndor como un eco.
> **La ida de M4 no tiene enemigos a propósito: el enemigo de este tramo es lo que estás
> escuchando.**

> ### 🔴 EL NARWAL NO TERMINA ACÁ — SE PAGA EN M5
>
> `story.js` tiene **tres charlas más** en M5 (`M05_NARWAL_A/B/C`), y son el remate:
>
> - **`M05_NARWAL_A` · POSICIONES** — Cóndor: *"Actividad en San Carlos. Varias unidades."* Gitano:
>   *"¿Varias cuántas, Cóndor?"* — *"Varias. No tengo número."*
> - **`M05_NARWAL_B` · PREGUNTALE AL PESQUERO** — Gitano: *"¿Cómo que no tenés número? La otra vez
>   me diste hasta la velocidad."* / *"Cóndor. Preguntale al pesquero."* → **tres segundos de radio
>   abierta: el ruido de fondo y nada más** (hold 3.0, línea sin texto) → *"Cóndor. El pesquero."*
>   → CÓNDOR: ***"Hace doce días que no transmite."***
> - **`M05_NARWAL_C` · ENTRAMOS** — Gitano, la voz plana, sin nada arriba: *"…Copiado."* Puma:
>   *"Formación cerrada. Entramos."*
>
> **Es un arco de dos misiones y ocho charlas, y todo ocurre por radio mientras volás.** Los tres
> segundos de silencio de `M05_NARWAL_B_030` son la mejor línea del tramo y no tienen una sola
> palabra. Por eso el bug de las charlas en vuelo (§8.7) es tan caro: **hoy este arco entero no
> existe en pantalla.**

---

#### ▸ 4.8 — **LA IDA** ⏳ *(reestructurar a `fases:`)*
Hoy la ida de M4 es un pasillo con seis tramos de charla y después `{ hasta: 1, obstacles: 1.2,
caza: 1 }`. Con la forma nueva: tránsito → filo → descenso → rasante, con las cinco charlas del
Narwal repartidas en el tránsito y el descenso, **antes** de que empiece el silencio del rasante.

#### ▸ 4.9 — **EL OBJETIVO: EL PULSO** ⏳ **debut**
**Dentro del juego · el tiempo se dilata, la cámara entra a la cabina, y el juego pide ejecutar una
secuencia de teclas contra reloj.**

- Cada compás **es el nombre de una maniobra que el jugador ya aprendió** (`MOVES[id].name`), no un
  símbolo. No teclea "abajo-izquierda-izquierda": **vuela**.
- Con tres maniobras en la libreta, el primer Pulso es corto y legible.
- ⚠ Hay un plan aparte para reemplazarlo por **video de cabina** (`PLAN_PULSO_CABINA_VIDEO.md`): el
  clip avanza unos frames por cada acierto y se congela en el error. **Sin elección de zona** —
  eso se descartó por decisión del autor.

#### ▸ 4.10 — **CINEMÁTICA DE MUERTE** ⏳ **la primera de la campaña**
Ranura `[SALIDA] + [MUERTE]`. Acá la MUERTE es **buque de guerra ardiendo / hundiéndose**, y es la
pieza que se reusa en **M5 (Ardent)** y **M7 (Coventry)**.
**Es la primera cinemática de muerte que hay que generar.**

También hace falta la ranura **FALLO** (el Pulso sale mal), que debuta acá y sirve para todas las
misiones con Pulso.

#### ▸ 4.11 — **LA VUELTA** ⏳ **completa**
`{ tipo: 'vuelta' }` con todo puesto: `obstacles: 1.6`, `caza: 2`, voces prendidas, bombas cayendo.
Es la primera vuelta a plena intensidad, y a partir de acá es la norma.

#### ▸ 4.12 — **ATERRIZAJE** ⏳

---

### ══ DESPUÉS DE VOLAR — tres pantallas, PAUSA TOTAL ══

#### ▸ 4.13 — `M04_6` · **PRIMERA GRAN VICTORIA**
**VN · fuera del juego · pausa total** · placa `linea_atardecer` · img `M04_6`

| # | Texto |
|---|---|
| 010 | En la base hay abrazos, alguien descorcha algo. En la radio quedó grabado el pánico inglés: "Low level! Low level! Here they come again!" |
| 020 | Puma se aparta y se queda mirando el mar, sin sonreír. **Cuando Puma no sonríe, hay que preocuparse.** |

#### ▸ 4.14 — `M04_8` · **EL CUADERNO**
**TIERRA · fuera del juego · pausa total** · placa `p1c_cuaderno` · img `carta5_m4`

| # | Texto |
|---|---|
| 010 | ¡Viejo! Llegó la noticia del Sheffield y por primera vez vi a los pibes levantar la cabeza. El Colorado me apretó el hombro y me dijo "tu viejo anda ahí arriba, pibe. Seguro anda por ahí". |
| 020 | ¿Eras vos? Elijo creer que sí. |
| 030 | Lo dibujé: un avioncito plateado y un barco enorme, y el avioncito gana. Salió medio chueco el barco. Los barcos son difíciles. |
| 040 | Y te cuento algo que no te dije en la despedida porque me daba no sé qué: cuando salga de acá me anoto en la escuela de aviación, pá. Lo tengo decidido hace rato. Quiero volar con vos. Quiero que un día la escuadrilla sea "Aldao y Aldao" y que el Turco ese nos putee a los dos juntos. |
| 050 | Cuidate mucho. Volá bajo, como me enseñaste. Yo te espero acá, pegadito a la tierra. Mateo. |

> **Es la carta más importante de las primeras cuatro.** "Quiero volar con vos" y "Aldao y Aldao"
> son la deuda que el final cobra. Y *"¿Eras vos? Elijo creer que sí"* es el hijo atribuyéndole al
> padre una victoria que no fue suya — que es exactamente lo que el juego le está haciendo hacer al
> jugador.

#### ▸ 4.15 — `M04_HIST` · **HMS SHEFFIELD · 4 MAYO 1982** ✅ *(ya existe)*
**VN · fuera del juego · pausa total** · placa `radio` · img `M04_HIST`

| # | Texto |
|---|---|
| 010 | Un Super Etendard de la Armada Argentina lanzó un misil Exocet que impactó el casco del destructor. |
| 020 | Murieron 20 tripulantes. El fuego obligó a abandonar el buque. |
| 030 | Fue el primer buque de guerra británico perdido en acción desde la Segunda Guerra Mundial... Y fuimos nosotros. |

> **Acá se corrige la licencia sin romper la ficción.** El jugador acaba de hundirlo con su A-4 y
> la placa le cuenta cómo fue de verdad. Es el contrato de `C1_ANTES` funcionando.

**Y de acá se pasa directo a M5.**

---

## 5 · QUÉ SE ENSEÑA Y QUÉ SE HABILITA

### El temario de M4
1. **El Pulso.**
2. **El clímax sobre un buque** — la forma que tienen diez de las catorce misiones.
3. **La vuelta completa**, a plena intensidad.
4. **La cinemática de muerte** como recompensa.
5. Que el juego **te va a contar la verdad al final**, aunque la misión te haya dejado ganar.

### Qué tiene el jugador
Cañón, **bombas propias** (es la primera misión que las usa, en el Pulso), TONEL, TERRAIN MASKING y
la mejora elegida tras M3. **Tres maniobras en la libreta** = el vocabulario del primer Pulso.

### Qué se habilita al terminar
Dos mejoras ofrecidas, se elige una (`ofertaTrasMision(3) = 2`).

---

## 6 · QUÉ PASA SI TE PEGAN

**Nadie muere por gameplay.** El avión queda averiado, rompe formación rumbo a la base, y asumís el
siguiente del roster: `TERO → PUMA → GITANO → VASCO → PICHÓN`.

En M4 la vuelta ya es peligrosa de verdad, así que **es probable que el jugador use su primer
relevo acá**. Es el lugar correcto para que lo descubra.

---

## 7 · CINEMÁTICAS A GENERAR

| Ranura | Pieza | Reuso |
|---|---|---|
| SALIDA | el avión yéndose | ✅ ya existe (uno de los diez clips) |
| **MUERTE** | **buque de guerra ardiendo / hundiéndose** | ⏳ **generar** — sirve M4, M5, M7 |
| **FALLO** | el Pulso sale mal | ⏳ **generar** — sirve todas las misiones con Pulso |

**M4 es la primera misión que obliga a gastar créditos.**

---

## 8 · PENDIENTES

### ⏳ Decidido, falta hacer
1. Declarar `fases:`, repartiendo las cinco charlas del Narwal en el tránsito y el descenso.
2. Enganchar el **Pulso** como clímax efectivo (hoy llega ahí por cuarentena de PASADA, no por
   diseño).
3. **La vuelta completa** y el aterrizaje.
4. Generar las dos cinemáticas (MUERTE de buque, FALLO).

### ⚠ Decisiones abiertas
5. **ARENA y PASADA están en cuarentena** (`data/cuarentena.js`). Toda misión que las declare juega
   el Pulso. Afecta a M5 y M14, que en los datos piden `arena`.

### ⚠ Bugs
7. **Las charlas en vuelo no dibujan nada.** En M4 esto es grave: **se come las seis charlas**,
   incluidas las cinco del Narwal, que son el corazón narrativo de la ida.

### 🗑 Para borrar
8. `strings.js → storyM4` / `epiM4` cuando se confirme que manda `story.js`.

---

## 9 · CORRECCIONES DEL AUTOR

*(Escribir acá. Lo que se escriba en esta sección manda.)*

-
-
-
