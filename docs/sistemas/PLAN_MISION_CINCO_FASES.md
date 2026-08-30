# PLAN — LA MISIÓN EN CINCO FASES

> **Qué propone.** Cambiar la forma de una misión: hoy el nivel es un pasillo que sube de
> intensidad hasta el buque y ahí termina. La propuesta es que el buque **deje de ser el
> final**, y que el final sea **volver y aterrizar**.
>
> **Por qué.** Porque es lo que pasó —la fase más letal era el regreso, sin bombas, con poca
> nafta y con los Harriers ya en el aire— y porque es literalmente el tema del juego, dicho
> por el Turco en la primera misión: **«Los ingleses cuentan lo que bajan. Yo cuento lo que
> vuelve.»** Si la parte más difícil es llegar a casa, esa frase deja de ser una línea linda y
> pasa a ser la regla.
>
> **Estado:** propuesta. Se prueba primero en **una misión suelta fuera del guion** (§5) y
> recién después se decide si se aplica a las catorce.

---

## 1 · LO QUE CAMBIA, DICHO SIN VUELTAS

**Hoy:** siembra → más siembra → buque → climax → fin. Toda la amenaza está **antes** del
objetivo. La curva sube y corta.

**La propuesta:** cinco fases con **tensiones distintas**, y la curva tiene **dos jorobas**:
el ataque y la vuelta. La segunda es más alta que la primera.

Esto no tira nada de lo que hay. **El pasillo, el Pulso, la Chancha, la niebla, las piruetas,
las mejoras y el despegue siguen todos** — se re-reparten en el tiempo de la misión.

---

## 2 · EL ESQUELETO — CINCO FASES

### FASE 1 · ARRIBA — el tránsito
**Tensión:** ninguna militar. Combustible y navegación.
**Qué se ve:** los otros aviones de la sección volando en formación, cerca, visibles.
**Qué se hace:** volar cómodo. Mantener la formación. Encontrar a la Chancha.
**Qué NO hay:** enemigos. Ninguno. Es histórico y es a propósito.
**Para qué existe:** **acá van todos los diálogos.** Es el único momento en que estos cinco
tipos están encerrados sin nada que hacer más que hablarse.
**Opcional del jugador:** bajar a rasante si quiere, por obstáculos simples abajo, a cambio de
gastar más nafta. Es una propina, no un objetivo.

> **La Chancha vive acá.** Ya está implementada (`CH_*` en `tuning.js`) y acá encuentra su
> lugar natural: es la única exigencia de destreza del tramo, y es la que decide **si llevás
> una bomba o tres**.

### FASE 2 · EL DESCENSO — donde se apagan las voces
**Tensión:** la decisión de cuándo bajar.
**Qué pasa:** el horizonte radar se acerca. Bajar te esconde y te quema el doble de nafta.
Bajar tarde te hace visible y te despierta la CAP.
**Y lo más importante:** **la radio se calla.** No hay cartel. Simplemente las voces del
escuadrón dejan de sonar y queda solo Cóndor, que es tierra y no está en riesgo.

> **Silencio de radio, y es histórico:** transmitir te delataba. El jugador aprende en dos
> misiones que cuando el escuadrón se calla, empezó lo otro.

### FASE 3 · EL RASANTE — el pasillo, pero mudo
**Tensión:** obstáculos, y el mar.
**Las tres familias de cosas:**

| Familia | Se rompe | Te ataca | Ejemplos |
|---|---|---|---|
| **Obstáculo mudo** | no | no | acantilado, pedrero, mástil, el agua, el pájaro |
| **Rompible opcional** | sí | no | boya, lancha, antena, galpón, depósito |
| **Amenaza** | sí | **sí** | antiaérea, camión AA, el buque, la infantería |

**La regla que ordena el tramo:** *mar abierto es neutral; cerca del blanco el mundo está
armado.* La amenaza **no está repartida pareja**: aparece en escalera a medida que te acercás
— primero los cañones lejanos, después los medianos y las ametralladoras, y al final **los
soldados tirándote con fusiles**. Esa escalera ya está escrita: es el `TEASER_2_LA_ESCUCHA`.

### FASE 4 · EL BLANCO — la suelta
**Tensión:** puntería y altura, peleadas entre sí.
Es lo que hoy es el climax, y **sigue igual**: el Pulso, y en dos misiones el arena.
Lo que cambia es que **ya no es el final de la misión**.

**Y acá vive la espoleta:** soltar demasiado bajo = impacto sin explosión. Soltar más alto =
te ven y te alcanzan. *(Modo `1982`; ver `PLAN_MODOS_ARCADE_REAL.md` §3b.)*

**Y tu propia bomba:** la explosión te queda atrás y abajo, cerca. No podés soltar y quedarte.
Soltás **y salís**.

### FASE 5 · LA VUELTA — el clímax real
**Tensión:** todo junto, y encima el reloj de la nafta.
**Qué pasa:** salís rasante para escaparte del alcance de los buques. En cuanto podés,
**tenés que subir**, porque abajo no llegás. Y arriba te esperan.
**Qué aparece acá:** los Harriers de frente, los buques que antes no te habían visto, la
antiaérea despierta. **Venís sin bombas.** Solo tenés el cañón, lo que quede de él, y volar.

**Y termina aterrizando.** Ver §4.

> **El pase de lista, gratis.** Cuando volvés a subir, **las voces vuelven**. Quién habla es
> quién está vivo. No hace falta ningún cartel de bajas: si el Gitano no contesta el chiste,
> ya sabés. Funciona **sin una sola línea nueva de diálogo**.

---

## 3 · LA NAFTA — el reloj de toda la misión

Propuesta de modelo, para calibrar contra `fuel: [4, 26]` y `REATTACK_FUEL = 12`.

| Qué | Multiplicador | Por qué |
|---|---|---|
| Crucero en altura | **×1** | la referencia |
| Rasante | **×2 a ×2,5** | el aire abajo es una pared. Es el costo del escondite |
| Con bombas y tanques | **×1,3** | el avión es un ropero |
| **Sin bombas (la vuelta)** | **×0,85** | venís liviano: **la vuelta es más barata que la ida** |
| Cada pirueta | **pico fijo** | si no cuestan, el jugador vuela haciendo toneles |
| Reencare | `REATTACK_FUEL` | ya existe |
| Chancha | recarga | ya existe (`CH_RATE`) |

> ⚠ **El A-4 no tiene posquemador.** El HUD dice `AFTERBURNER` en inglés y está mal — ya está
> anotado como bug en `AVIONES_CATALOGO.md`. Si se toca el modelo de nafta, se arregla de paso.

**La perilla del jugador es la altura, y aparece TRES veces en la misma misión:** cuándo bajar
(fase 2), cuánto rasante aguantar (fase 3), y cuándo volver a subir (fase 5). **Es la misma
decisión tres veces, y las tres te matan de formas distintas.** Eso es el juego.

---

## 4 · EL ATERRIZAJE — la mecánica de cierre

La idea del autor: funciona como el rasante. No te podés tirar de cabeza; hay que **regular** y
**sacar el tren en el momento conveniente**.

**Las cuatro cosas que se miden:**

1. **Velocidad.** Muy rápido y el tren se arranca o rebotás. Muy lento y entrás en pérdida
   *(el A-4C entra en pérdida a ~225 km/h — dato de ficha).*
2. **Régimen de descenso.** Bajar rápido está bien lejos, no está bien cerca. Hay que aplanar.
3. **El tren.** Sacarlo **frena**: si lo sacás temprano gastás nafta y llegás corto, si lo
   sacás tarde llegás picando y te hacés mierda. Ya existe `GEAR_T = 0.9`.
4. **La actitud al tocar.** Nariz arriba. De trompa, te clavás.

**Y lo que lo hace de este juego y no de otro:**
- **La sal.** Volaste horas a ras del mar y tenés el vidrio con costra. **La visión está
  cerrada justo en el momento de más precisión.** Es real y está documentado.
- **La nafta.** Si volviste raspando, **no hay segunda pasada**. Aterrizás como venís.
- **La chapa.** Si venís tocado, algo no responde.

> **No tiene que ser difícil. Tiene que ser el momento en que se cuenta quién llegó.**
> El aterrizaje es donde el juego respira, donde aparece el Turco, y donde se cierra la frase.

---

## 5 · LA MISIÓN DE PRUEBA — `t15 · IDA Y VUELTA`

**Fuera del guion, en la pantalla de PRUEBAS (`data/pruebas.js`), sin historia, sin cartas y
sin personajes que mueran.** El objetivo es **medir cómo se siente la forma**, no contar nada.

**Qué tiene:**
- Las cinco fases completas, cortas: **tránsito 60 s · descenso 20 s · rasante 90 s · blanco ·
  vuelta 120 s · aterrizaje**. Total ~6 minutos.
- Un buque genérico de la lista `SHIPS`, sin fecha ni nombre histórico cargado.
- La sección visible en formación en la fase 1, **muda** en la 3.
- Nafta con el modelo de §3, mostrada todo el tiempo.
- La vuelta con **el doble de amenaza que la ida**.
- Aterrizaje obligatorio para completar.

**Qué NO tiene:** guion, cartas, mejoras del Pichón, muertes, epílogo, estrellas de campaña.

**Qué se mide, y son cinco preguntas concretas:**
1. ¿El tránsito sin enemigos **aburre**, o se siente como respirar?
2. Cuando se apagan las voces, ¿**se nota**? ¿Da miedo o pasa desapercibido?
3. ¿La vuelta se siente como el clímax, o como un **epílogo largo** después del boss?
4. ¿La nafta se entiende **sin leer un tutorial**?
5. El aterrizaje: ¿es un cierre lindo o es un **peaje molesto**?

> **Si la 3 sale mal, la propuesta entera se cae** — y es mejor saberlo con una misión de
> prueba que con catorce reescritas.

---

## 6 · QUÉ TENEMOS Y QUÉ FALTA

### Ya está en el código
Despegue desde pista con estilos (`runways.js`, `PORT_H`) · **arranque en vuelo para misiones
de REGRESO** (`AIR_START_Y`) · el pasillo y su siembra (`SPAWN_*`) · el techo de radar
(`RADAR_ALT`) · niebla completa (`FOG_*`) · **la Chancha entera** (`CH_*`) · el Pulso ·
la pasada y el arena (en cuarentena, recuperables por dato) · el cañón con calor (`GUN_*`) ·
3 tiros pesados (`MSL_MAX`) · reencare con costo (`REATTACK_*`) · vida de enemigos
(`ENEMY_HP`) · la cola de Harriers y sus misiles (`CAZA_MSL_*`) · acantilados y costa
(`CLIFF_*`, `SHORE_X`) · el tren (`GEAR_T`) · piruetas y mejoras · charlas en vuelo.

### Falta
- **Fases como concepto.** Hoy la misión es un continuo; hay que poder decir "esta misión tiene
  estas fases, en este orden, con esta duración".
- **El tramo de vuelta.** Sembrar **después** del climax, que hoy no ocurre.
- **El corte de radio** por fase, y su vuelta.
- **El modelo de nafta por altitud y carga.**
- **El aterrizaje jugable.** Existe el despegue; el aterrizaje hay que escribirlo.
- **La formación visible** en el tránsito.
- **Los Harriers de frente**, distinto de la cola actual.
- **La sal en la cabina** (acumulativa, visual).

---

## 7 · CÓMO SE APLICARÍA A LAS CATORCE

**No todas llevan las cinco fases.** La gracia es que la **fase dominante cambie** y que la
campaña enseñe de a una.

| # | Misión | Fase que manda | Qué enseña / qué cambia |
|---|---|---|---|
| M1 | Sal en las alas | **1 y 5, sin peligro** | El tutorial es **ida y vuelta con el mar lindo**. Se enseña volar, bajar, subir y **aterrizar**. Sin enemigos, como hoy |
| M2 | Bautismo de fuego | **3** | Primera vez que el mundo está armado. Primera vez que se apaga la radio |
| M3 | El invento | **1** | La más liviana a propósito: acá se siente la mejora en las manos. Tránsito largo, blanco chico |
| M4 | El día que sangró el mar | **4** | Primer buque de verdad. Primera suelta que importa |
| M5 | El callejón de las bombas | **3 en arena** | San Carlos: el pasillo *es* una arena. Obstáculos por todos lados |
| M6 | La bomba que no despertó | **4 · la espoleta** | La misión donde la bomba **no explota**. Es el título del nivel |
| M7 | 25 de Mayo | **5** | Muere el Vasco. **Primera vez que la vuelta mata.** El pase de lista sin cartel |
| M8 | El batir de alas | **2 y 3** | El sobrevuelo del monte. El batir de alas como **idioma** de la radio muda |
| M9 | El pibe | **5** | Muere el Pichón. Se acaban las mejoras nuevas |
| M10 | Los primos | **1** | Llega el Mirage. Tránsito con avión nuevo: se siente distinto en las manos |
| M11 | Lo que no se dice | **1 y 2** | El respiro tenso. Poca amenaza, mucha radio |
| M12 | El ángel correntino | **3** | Tierra adentro, pedreros, blanco terrestre |
| M13 | La última mesa | **5** | Vuelta larga, escuadrón corto, nafta al límite |
| M14 | El Tero | **todas** | La final. Arena, y **el aterrizaje decide el final** |

> **El mar se va poniendo en contra a medida que avanza la guerra.** En M1 está lindo y calmo;
> para M7 hay bruma y bajar duele. La rampa se hace con el agua, no con más enemigos.

---

## 8 · RIESGOS

**El anticlímax.** Si el buque cae y después hay cinco minutos de vuelta, puede sentirse a
epílogo. **Mitigación:** la vuelta arranca fuerte y de inmediato —los Harriers ya vienen— y no
hay pantalla de resultado hasta que las ruedas tocan. El puntaje se muestra **después de
aterrizar**.

**El tránsito aburrido.** Si las charlas no alcanzan, el tramo es tiempo muerto.
**Mitigación:** corto (60–90 s), con la Chancha adentro, y con el rasante opcional para el que
quiera jugar.

**El aterrizaje como peaje.** Si frustra, arruina la misión ganada. **Mitigación:** perdona
mucho en `ARCADE`, y **nunca te hace perder la misión** — un mal aterrizaje cuesta estrellas
y chapa, no la partida.

**Doble trabajo de balance.** Cinco fases × catorce misiones es mucho. **Mitigación:** las
fases son **dato por misión**, con defaults; una misión declara solo lo que cambia, igual que
hoy hace `C(over)` en `missions.js`.

---

## 9 · EL PROMPT PARA IMPLEMENTAR LA MISIÓN DE PRUEBA

```
Implementá la misión de prueba t15 "IDA Y VUELTA" descrita en
docs/sistemas/PLAN_MISION_CINCO_FASES.md §5. Es una MISIÓN SUELTA de la pantalla de PRUEBAS,
fuera de la campaña y fuera del guion: su único objetivo es medir cómo se siente la estructura
de cinco fases antes de decidir si se aplica a las catorce misiones.

CONTEXTO DE ARQUITECTURA — leelo antes de escribir código:
- Este repo tiene una convención explícita, escrita en src/data/cuarentena.js: los switches de
  comportamiento son DATO, no cirugía. "ESTO ES LA UNICA PERILLA. No hay que buscar ifs por el
  codigo." Respetala: las fases tienen que ser un dato declarado por la misión.
- Los valores de ajuste viven en src/data/tuning.js y el juego los lee vía cfg.
- data/ no importa lógica del juego. Datos puros.
- Ya existen y NO hay que reescribir: el pasillo y su siembra (SPAWN_*), el techo de radar
  (RADAR_ALT), la niebla (FOG_*), la Chancha (CH_*), el Pulso, el cañón (GUN_*), MSL_MAX,
  REATTACK_*, ENEMY_HP, la cola de cazas (CAZA_MSL_*), el despegue (runways.js, PORT_H) y
  AIR_START_Y, que ya existe justamente para "misiones de REGRESO".

QUÉ HAY QUE HACER:

1. FASES COMO DATO. Diseñá una forma de declarar, en la misión, una secuencia de fases con su
   duración o su condición de corte. Cinco tipos: 'transito', 'descenso', 'rasante', 'blanco',
   'vuelta'. Cada fase declara qué siembra, si hay radio, y el multiplicador de nafta.
   Poné defaults sensatos para que una misión que no declara nada se comporte como hoy.

2. LA MISIÓN t15 en data/pruebas.js, con las duraciones de §5 del plan. Sin story, sin brief,
   sin epi, sin cartas y sin roster de campaña.

3. SEMBRAR EN LA VUELTA. Hoy la siembra termina en el buque. La fase 'vuelta' tiene que sembrar
   con ~2x la densidad de la ida, y los cazas tienen que venir DE FRENTE, no solo por la cola.

4. EL CORTE DE RADIO. En las fases 'descenso', 'rasante' y 'blanco' el escuadrón no habla:
   solo Condor. Al entrar en 'vuelta', las voces vuelven. Sin cartel, sin aviso: es puramente
   la ausencia y el regreso del sonido.

5. NAFTA POR FASE. Aplicá la tabla de §3 del plan: crucero x1, rasante x2, con carga x1.3, sin
   bombas x0.85, y un pico por pirueta. Mostrá el combustible siempre.

6. ATERRIZAJE. Es lo único realmente nuevo. Ver §4 del plan: se miden velocidad, régimen de
   descenso, momento del tren y actitud al tocar. Un mal aterrizaje CUESTA (chapa, puntaje)
   pero NO hace perder la misión. La misión no se completa hasta que las ruedas tocan, y el
   resultado se muestra DESPUÉS.

RESTRICCIONES:
- NO toques la campaña ni data/missions.js. Esto es una prueba aislada.
- NO metas ifs de fase en los sistemas: la fase parchea cfg, y los sistemas leen cfg.
- Nada de acentos en identificadores ni en textos de UI, siguiendo el estilo del repo.

CRITERIO DE ACEPTACIÓN:
- La misión se juega de punta a punta en ~6 minutos e incluye las cinco fases en orden.
- En el tránsito no aparece ni un enemigo, y se ven los otros aviones de la sección.
- Al entrar al descenso, el escuadrón deja de hablar. Al volver a subir, vuelve a hablar.
- Después del buque hay más peligro que antes, no menos.
- Se puede terminar la misión aterrizando, y se puede aterrizar mal sin perder.
- La campaña sigue comportándose exactamente igual que antes.

Cuando termines, decime qué archivos tocaste, qué defaults elegiste y qué te parece que va a
necesitar calibración después del primer playtest.
```

---

## 9b · EL MISMO PROMPT, CALIBRADO PARA OPUS EN ESFUERZO MEDIO

> El de §9 asume que el modelo va a explorar el repo por su cuenta. En esfuerzo medio conviene
> **decirle qué leer, en qué orden, y dónde parar a mostrar**. Es más largo a propósito: cada
> párrafo le ahorra una decisión que si no toma sola y mal.

```
Trabajás sobre RASANTE, un juego de aviones de Malvinas 1982 en Electron + canvas, JavaScript
sin TypeScript. Vas a implementar UNA misión de prueba con una estructura nueva de fases.
Es trabajo de andamiaje sobre un repo maduro: la prioridad es NO ROMPER NADA.

═══ PASO 0 — LEER ANTES DE ESCRIBIR UNA LÍNEA ═══
Leé, en este orden, y no empieces hasta terminarlos:
  1. docs/sistemas/PLAN_MISION_CINCO_FASES.md  ← la especificación completa. Es tu fuente.
  2. src/data/cuarentena.js  ← corto. Explica la convención de arquitectura del repo.
  3. src/data/missions.js  ← mirá cómo una misión declara su cfg con el helper C(over).
  4. src/data/pruebas.js  ← acá va tu misión nueva.
  5. src/data/tuning.js  ← buscá y entendé: SPAWN_*, RADAR_ALT, FOG_*, CH_*, GUN_*, MSL_MAX,
     REATTACK_*, ENEMY_HP, CAZA_MSL_*, GEAR_T.
  6. src/data/runways.js  ← PORT_H y AIR_START_Y.
Después buscá en el código quién consume cfg y dónde se siembran los enemigos del pasillo.

Cuando termines de leer, ANTES de codear, escribime en 10 líneas: qué archivos vas a tocar,
cómo vas a declarar las fases, y qué NO entendiste. Esperá mi OK.

═══ LA CONVENCIÓN QUE NO SE NEGOCIA ═══
Este repo tiene una regla escrita en src/data/cuarentena.js: los switches de comportamiento
son DATO, no cirugía. Textual: "ESTO ES LA UNICA PERILLA. No hay que buscar ifs por el codigo."
Traducido a esta tarea: la fase activa PARCHEA cfg, y los sistemas siguen leyendo cfg como
siempre. Si escribís `if (fase === 'vuelta')` dentro de un sistema de juego, está mal hecho.
Además: src/data/ no importa lógica del juego. Son datos puros.

═══ QUÉ HAY QUE CONSTRUIR ═══
Una misión de prueba, t15 "IDA Y VUELTA", en la pantalla de PRUEBAS. Fuera de la campaña,
sin guion, sin cartas, sin personajes que mueran. Existe para MEDIR cómo se siente una
estructura de cinco fases antes de aplicarla a las 14 misiones reales.

Las cinco fases, en orden, con su duración objetivo:
  transito  60 s — sin enemigos, se ven los otros aviones de la sección, hay radio
  descenso  20 s — se apaga la radio del escuadrón
  rasante   90 s — el pasillo actual, mudo
  blanco       — el climax que ya existe (el Pulso)
  vuelta   120 s — el doble de amenaza que la ida, cazas DE FRENTE, radio de vuelta
  y termina ATERRIZANDO.

═══ PLAN EN CUATRO PASOS, CON CHECKPOINT ENTRE CADA UNO ═══
Hacé UN paso, mostrame el diff y esperá el OK. No encadenes los cuatro.

PASO 1 — Las fases como dato.
  Definí la forma en que una misión declara su secuencia de fases. Cada fase declara al menos:
  tipo, duración o condición de corte, qué siembra, si hay radio del escuadrón, y su
  multiplicador de combustible. Poné defaults tales que una misión que NO declara fases se
  comporte exactamente como hoy. Ese es el criterio de éxito del paso: la campaña no cambia.

PASO 2 — La misión t15.
  Creala en src/data/pruebas.js con las duraciones de arriba. Un buque genérico de la lista
  SHIPS, sin fecha ni carga histórica. Sin story, sin brief, sin epi, sin roster de campaña.
  Al terminar este paso la misión ya se tiene que poder jugar de punta a punta, aunque las
  fases todavía no cambien nada.

PASO 3 — Lo que cada fase cambia.
  a) SIEMBRA EN LA VUELTA. Hoy la siembra termina en el buque; la fase 'vuelta' tiene que
     sembrar con ~2x la densidad de la ida, y los cazas tienen que venir DE FRENTE, no solo
     por la cola como hace hoy CAZA_MSL_*.
  b) CORTE DE RADIO. En 'descenso', 'rasante' y 'blanco' el escuadrón no habla: solo Cóndor.
     Al entrar en 'vuelta' vuelven las voces. Sin cartel y sin aviso: es puramente la ausencia
     y el regreso del sonido. Este efecto es narrativo y es el que más me importa.
  c) COMBUSTIBLE POR FASE. Aplicá la tabla del §3 del plan: crucero x1, rasante x2, con carga
     x1.3, sin bombas x0.85, más un pico fijo por pirueta. El combustible se muestra siempre.

PASO 4 — El aterrizaje. Es lo único enteramente nuevo; leé el §4 del plan.
  Se miden cuatro cosas: velocidad, régimen de descenso, momento en que se saca el tren
  (GEAR_T ya existe y frena) y actitud al tocar. Un mal aterrizaje CUESTA chapa y puntaje,
  pero NUNCA hace perder la misión. La misión no se completa hasta que las ruedas tocan, y
  la pantalla de resultado aparece DESPUÉS de aterrizar, no cuando cae el buque.

═══ LO QUE NO TENÉS QUE HACER ═══
· No toques la campaña ni src/data/missions.js.
· No refactorices nada que no sea necesario para esta tarea.
· No saques módulos de cuarentena (data/cuarentena.js) ni cambies el climax suplente.
· No cambies valores existentes de tuning.js: agregá los tuyos nuevos.
· No uses acentos en identificadores ni en textos de UI. Es el estilo del repo.
· No implementes los modos ARCADE/1982: es otro plan (PLAN_MODOS_ARCADE_REAL.md).

═══ CÓMO SÉ QUE ESTÁ BIEN ═══
· La misión se juega entera en ~6 minutos, con las cinco fases en orden.
· En el tránsito no aparece ni un enemigo y se ven los otros aviones de la sección.
· Al entrar al descenso el escuadrón deja de hablar; al volver a subir, vuelve a hablar.
· Después del buque hay MÁS peligro que antes, no menos.
· Se puede aterrizar mal sin perder la misión.
· Arranco una campaña guardada y se comporta EXACTAMENTE igual que antes de tu cambio.
· El proyecto compila y los fixtures que ya estaban verdes siguen verdes.

═══ CUANDO TERMINES ═══
Escribime, corto:
  1. Qué archivos tocaste y por qué.
  2. Qué defaults elegiste y con qué criterio.
  3. Qué te parece que va a necesitar calibración después del primer playtest.
  4. Qué cosa del plan te resultó ambigua y resolviste vos.
```

---

## 10 · LO QUE HAY QUE DECIDIR ANTES

- **Duración total de una misión de campaña** con esta forma. Hoy son más cortas. Seis minutos
  × catorce son 84 minutos de vuelo puro, sin contar cinemáticas.
- **Si el aterrizaje es obligatorio en todas** o solo en algunas. *(Recomendación: obligatorio,
  pero muy perdonador salvo en M14.)*
- **Qué pasa si te quedás sin nafta en la vuelta.** ¿Amerizás? ¿Te eyectás? Hay material
  histórico duro acá — los cartuchos vencidos del asiento eyectable. Es un final de misión que
  no es "game over".
- **Si el rasante opcional del tránsito da algo** (puntaje, un blanco de oportunidad) o es solo
  para jugar.
