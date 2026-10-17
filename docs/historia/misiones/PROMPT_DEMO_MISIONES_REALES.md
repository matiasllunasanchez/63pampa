# PROMPT — Demo / acceso anticipado: cuatro misiones reales

Estás trabajando en RASANTE, el juego de aviones de Malvinas del repo `63pampa`. Tu tarea es armar
**cuatro misiones cortas basadas en hechos reales** para una demo / acceso anticipado. En el juego
completo van a ser **misiones sueltas que la campaña desbloquea**: nada de esto se tira.

> Pedido del autor (12/10/2026): *"armar algunas misiones cortas literal sacadas de los
> acontecimientos históricos (...) con todos los detalles históricos más exactos posibles con algún
> adicional para diversión de juego."*

## Lo primero, antes de tocar nada

Leé, en este orden:

1. `docs/ARQUITECTURA.md` — el mapa del código. **Manda sobre cualquier suposición.**
2. **Este archivo** — es la fuente de verdad de la tarea.
3. `docs/historia/misiones/MISIONES_SUELTAS.md` — la propuesta de demo (arriba de todo) y las fichas
   S-03 (Super Étendard) y S-06 (Glasgow).
4. `docs/historia/misiones/CRONOLOGIA_1982.md` — los hechos, día por día.
5. `docs/historia/misiones/README.md` — las reglas de campaña (sección "reglas").
6. `docs/sistemas/PLAN_EL_PULSO.md` y `docs/sistemas/FORMA_DE_CADA_MISION.md`.
7. `src/data/pruebas_misiones.js` — **ya hay misiones de prueba con `goal: { kind: 'ship', ship:
   'HMS SHEFFIELD' }` y `'HMS ARDENT'`**: son el molde. Y `t16` «LA SUELTA» tiene el banco de voces
   de la pasada de bombas.

## Las reglas que no se negocian

- **No toques la campaña** (`missions.js` M1–M14, `story.js` de campaña). Esto va aparte.
- **El comportamiento es DATO** (`src/data/cuarentena.js`). Si tenés que sembrar `if`s de misión en el
  motor, parás y proponés dónde va la perilla.
- **No inventes diálogo.** Las únicas líneas que van son **las citas reales de este archivo**, palabra
  por palabra. Cualquier otra línea (radio, aclaración final) se **propone y se muestra antes de
  pegar**. El autor escribe sus personajes.
- **De día.** Los A-4, Dagger y Super Étendard no vuelan de noche en este juego.
- **El avión es el del hecho real.** No hay selector de avión en estas cuatro.
- **Cortas:** un blanco, ida, objetivo, vuelta. Con pasillo, como la campaña.
- **Del 2 al 12 de mayo hay niebla y bruma** (regla de campaña): toca a las misiones 1 y 2.
- **El Dagger no tiene sonda** (`sonda: false` en `planes.js`): **sin Chancha**. La nafta es lo que
  lleva.
- **Al final de cada una, una aclaración real** (texto corto, sin explicar lo obvio). **Fuentes
  argentinas primero**; si la británica dice otra cosa, se dice al lado. Los textos de aclaración
  de abajo son **borradores para que el autor apruebe**.
- **Realidad, no rivalidad:** no se celebra la muerte; se cuenta.
- **✅ SIN NOMBRES REALES EN EL JUEGO** *(decisión del autor, 12/10)*: *"Prefiero no poner nombres,
  poner pseudónimos y que se googleen los acontecimientos si les gusta o les interesa."* En pantalla
  van **indicativos o seudónimos** («Oro 3», «el numeral», «el líder»), **nunca nombres de personas
  reales**, ni en la misión ni en las aclaraciones ni en los créditos. Los nombres que aparecen abajo
  en «Lo que pasó» son **referencia histórica para vos**, no texto del juego. Fechas, lugares,
  aviones, buques y cifras **sí** van, exactos.
- Al terminar: `npm run check` en verde.

## Lo que ya existe y se usa

| Qué | Dónde |
|---|---|
| Aviones: `supere` (Super Étendard), `sky` (A-4), `a4q` (A-4Q de la Armada), `dagger` (Dagger, sin sonda) | `src/data/planes.js` |
| Buques: `t42` (Sheffield, Glasgow), `t21` (Ardent; aproximación para Brilliant y Plymouth) | `src/data/ships.js` — ya mapea `HMS SHEFFIELD`, `HMS ARDENT`; **agregar** `HMS GLASGOW: 't42'`, `HMS BRILLIANT: 't21'`, `HMS PLYMOUTH: 't21'` con la misma nota de aproximación que ya tiene el Broadsword |
| El Pulso (cargar coordenadas) | `climax: 'pulso'`, `PLAN_EL_PULSO.md` |
| La Chancha (Hércules reabastecedor) | `docs/sistemas/PLAN_CARGA_Y_CHANCHA.md` |
| Harriers por estrella, alarmas, pasillo | reglas de campaña en el README de misiones |

---

## (Después de la demo) · «EL NEPTUNE» — 4 de mayo de 1982, antes del Sheffield

**No entra en esta tarea: falta el modelo del Neptune.** Va en el Libro de vuelo **justo antes del
Sheffield** (el Neptune encuentra la flota y le pasa los datos a los Super Étendard). Diseño en
`MISIONES_SUELTAS.md`, S-02. Si armás el Sheffield, dejá preparado que pueda recibir «datos del
Neptune» desde otra misión.

---

## MISIÓN 1 · «EL SHEFFIELD» — 4 de mayo de 1982

**Avión:** Super Étendard (`supere`). **Blanco:** HMS Sheffield (`t42`). **Clímax:** Pulso.

**Lo que pasó** *(fuentes: Gaceta Aeronáutica, «4 de mayo de 1982, operación Sheffield»; Fundación
Malvinas; Armada Argentina)*:

- Un **Neptune** de la Armada (2-P-112) salió de Río Grande de madrugada a buscar la flota. Tuvo
  contacto de radar a las 07:10; su radar falló a las 09:25 y lo arreglaron a medias. **A las 10:30
  ubicó dos buques medianos y uno grande**, y **a las 10:35 les pasó los datos** a los Super Étendard.
- **Dos Super Étendard** de la Segunda Escuadrilla Aeronaval de Caza y Ataque: **3-A-202** (capitán
  de corbeta **Augusto Bedacarratz**) y **3-A-203** (teniente de fragata **Armando Mayora**).
  **Despegaron de Río Grande a las 09:44.**
- **Los reabasteció en la ida un Hércules KC-130** (TC-70), que los esperaba a 50º30′ S / 65º30′ O.
- **Volaron al ras del mar.** A la distancia prevista **subieron a 300 metros, prendieron el radar una
  sola vez**, cargaron el blanco **y volvieron a bajar**.
- **A las 11:04 soltaron los dos Exocet a la vez.** Uno le pegó al Sheffield por estribor.
- **Media vuelta al ras y a toda velocidad.** Aterrizaron en Río Grande a las 12:10.
- El Sheffield se hundió **seis días después**, mientras lo remolcaban.
- Mucha niebla y bruma (regla del 2 al 12 de mayo).
- **Versión argentina sobre por qué no lo vio venir:** el Sheffield estaba en una comunicación
  satelital que interfirió su propio radar y atrajo al misil. *(Versión británica: su sistema de
  alerta estaba tapado por esa transmisión. En `M4_CAMBIOS.md` · 5 está «en veremos»: no lo pongas en
  pantalla sin el sí del autor.)*

**Cómo se juega:**

1. **Despegue y la Chancha**: cargar del Hércules en la ida (la Chancha de siempre).
2. **Al ras, con niebla**, hacia la posición que dio el Neptune. Radio del Neptune con los datos
   (texto, sin voz; **proponer la línea**).
3. **Subir**: el jugador sube, **prende el radar** (te delata: suben las alarmas) y **carga las
   coordenadas con el Pulso**.
4. **Soltar y escapar al ras**: el misil va solo. El Exocet se ve irse; el impacto, en el horizonte.
5. **Vuelta al ras** hasta salir de la zona.

**Adicional para diversión:** el radar del avión funciona como en la realidad: **subir es lo que te
delata**. Cuanto más tiempo arriba, más te buscan.

**Aclaración final (borrador para el autor):** *«4 de mayo de 1982. Dos Super Étendard de la Armada,
reabastecidos en vuelo, lanzaron dos Exocet a las 11:04. Uno alcanzó al HMS Sheffield, que se hundió
seis días después mientras lo remolcaban.»*

---

## MISIÓN 2 · «LA GLASGOW» — 12 de mayo de 1982

**Avión:** A-4B (`sky`). **Blanco:** HMS Glasgow (`t42`), con la HMS Brilliant (`t21`) cerca.

**Lo que pasó** *(fuente: Fuerza Aérea Argentina, Dirección de Estudios Históricos, «Mayo» — 12 de
mayo)*:

- **Dos escuadrillas de A-4B** de la **Base Aérea Militar Río Gallegos**.
- **Primera, «CUÑA»**, contra la Brilliant: primer teniente **Manuel Oscar Bustos** (C-246), teniente
  **Jorge Rubén Ibarlucea** (C-208), teniente **Mario Víctor Nívoli** (C-206) y alférez **Alfredo
  Vázquez** (C-242). **Los alcanzan misiles Sea Wolf antes de llegar**: muere Nívoli; Ibarlucea muere
  después de soltar su bomba; Bustos, esquivando un misil en la retirada, **choca contra el mar**.
  **Vuelve sólo Vázquez.**
- **Segunda, «ORO»**, contra la Brilliant y la **Glasgow**: capitán **Antonio Zelaya** (C-225),
  teniente **Juan Arrarás** (C-244), primer teniente **Fausto Gavazzi** (C-248) y alférez **Guillermo
  Dellepiane** (C-239). **La Glasgow sufre serias averías y la retiran del teatro de operaciones.**
- **Al escapar, Gavazzi pasa cerca de la BAM Cóndor (Pradera del Ganso), en alerta roja, y lo derriba
  la artillería antiaérea propia.**
- **La bomba que alcanzó a la Glasgow la atravesó de lado a lado sin explotar** *(dato británico,
  coincide con el problema de las espoletas de las MK-17 en todo mayo)*.
- Último día de niebla.

**Dato para el autor:** **C-239** es el número que el juego ya le pinta al avión del Gitano (GAMBETA).
Ese día lo volaba el alférez Dellepiane, en la escuadrilla que volvió.

**Cómo se juega:**

1. Despegue, la Chancha en la ida.
2. **Al ras con niebla**, hacia el estrecho. **Se juega la escuadrilla «ORO»**: la segunda, la que
   llega después de ver caer a la primera.
3. **Esquivar los Sea Wolf** de la Brilliant, pasillo hasta la Glasgow, **soltar**.
4. **La bomba la atraviesa y no explota** — se ve salir por el otro lado.
5. **Vuelta**: evitar pasar sobre Pradera del Ganso (la antiaérea propia tira).

**Adicional para diversión:** el aviso de la antiaérea propia en la vuelta: no todo lo que dispara
es enemigo.

**Aclaración final (borrador):** *«12 de mayo de 1982. De ocho A-4B volvieron cuatro. La Glasgow,
atravesada por una bomba que no explotó, quedó fuera de combate. Uno de ellos fue derribado por la
artillería propia sobre Pradera del Ganso.»*

---

## MISIÓN 3 · «LA ARDENT» — 21 de mayo de 1982

**Avión:** A-4Q de la Armada (`a4q`). **Blanco:** HMS Ardent (`t21`), **ya averiada**.

**Lo que pasó** *(fuentes: La Nación, «Milagro en San Carlos» (2022), relato de Philippi; La Capital
de Mar del Plata, homenaje a Márquez (2019); y lo que contó el autor, `M5_CAMBIOS.md` · 6)*:

- **Dos secciones reforzadas de la Tercera Escuadrilla Aeronaval de Caza y Ataque**, de Río Grande.
- **Sección del capitán de corbeta Alberto Philippi (indicativo «Mingo»)**, con el teniente de navío
  **José César Arca** y el teniente de fragata **Marcelo Márquez**. Ocho minutos atrás, otra sección:
  Rotolo, Lecour y Silvestre.
- **Sin reabastecimiento**: los Hércules estaban en otras operaciones. **Cada litro contado** para
  volver a Río Grande.
- Cruzaron la boca sur del estrecho con mal tiempo, **no encontraron el blanco asignado** y fueron al
  alternativo: **los buques en San Carlos**.
- Vieron los mástiles de una fragata —**la Ardent**, ya averiada por ataques anteriores— y **se abrieron
  en tres direcciones** para dividir el fuego antiaéreo.
- **Philippi soltó primero: una bomba de lleno. Arca también pegó. Márquez, último, confirmó los
  impactos.** Bombas **Mk82 con cola retardadora (Snakeye)**.
- **Dos Sea Harrier** estaban arriba, tapados por la niebla. **Márquez gritó por radio: «¡Harrier!
  ¡Harrier!»**.
- A Philippi lo alcanza un **Sidewinder**: se eyecta **a unos 926 km/h** (el manual dice menos de 648),
  cae al agua, nada a la orilla, **pasa dos noches a la intemperie** y lo recibe el isleño **Tony
  Blake**.
- **Márquez muere.** **Arca** se eyecta y lo rescata un helicóptero **colgado del patín** (misión
  suelta S-11).
- **La Ardent se hunde** esa tarde.

**Cómo se juega:**

1. Despegue **sin Chancha**: la nafta es justa (aviso al empezar).
2. **Mal tiempo en la boca sur**; el blanco asignado no está → **«blanco alternativo: San Carlos»**.
3. Al ras por el estrecho; **la Ardent averiada**, humeando.
4. **Abrirse** (el pasillo se divide) y **soltar las Snakeye**.
5. **«¡Harrier! ¡Harrier!»** (cita real, va tal cual): **escapar de dos Sea Harrier en la niebla**,
   con poca nafta.

**Adicional para diversión:** la Snakeye frena en el aire: se puede soltar **más bajo** que una bomba
común sin que te alcance la explosión (es para lo que servía).

**Aclaración final (borrador):** *«21 de mayo de 1982. Tres A-4Q de la Armada le pegaron a la HMS
Ardent, que se hundió esa tarde. Los tres fueron derribados por Sea Harrier. Dos pilotos se
eyectaron y sobrevivieron; el tercero no volvió.»*

---

## MISIÓN 4 · «LA PLYMOUTH» — 8 de junio de 1982

**Avión:** Dagger (`dagger`, **sin sonda**). **Blanco:** HMS Plymouth (`t21` como aproximación: era
Tipo 12, no hay modelo).

**Lo que pasó** *(fuentes: lo que contó el autor, `M11_CAMBIOS.md` · 3; El Objetivo, «8 de junio
1982: el día más negro de la flota inglesa»; DEF Online)*:

- **Seis Dagger de Río Grande**, en dos escuadrillas, **«Perro» y «Gato»**, cerca de las 13.
- **Uno vuelve por fisuras en el parabrisas.** Quedan **cinco**, con **dos bombas de 250 kg** cada uno.
- **Sin reabastecer.**
- El plan: subir por el estrecho hasta Bahía Agradable. **Al ras y muy rápido, se pasan**, y **rompen
  el silencio de radio: «¡Buque enemigo a las tres!»**.
- Es **la fragata Plymouth, sola en el estrecho**. Intenta volver a la protección de la bahía y se
  defiende como puede. **Los Dagger, en fila, se le tiran encima.**
- **Entran cuatro bombas**: una atraviesa la **chimenea**, otra cae en el **helipuerto**, y **dos
  rebotan en el agua y entran**. **Explota munición a bordo.**
- **La Plymouth queda fuera de combate hasta el final de la guerra. Vuelven todos.**
- *(Los pilotos dijeron que la vieron humeando; los británicos lo minimizaron. Detalle de bajas
  británicas: a confirmar.)*

**Cómo se juega:**

1. Despegue **sin Chancha**, **dos tanques de nafta**: lo que llevás es lo que hay (el medidor manda).
2. Al ras por el estrecho, muy rápido.
3. **El blanco aparece de costado** — **«¡Buque enemigo a las tres!»** (cita real, va tal cual) —:
   girar y alinear en fila.
4. **Soltar las dos bombas.** Pueden **rebotar en el agua y entrar** (recompensa por soltar bajo y
   largo).
5. **Vuelta** con la nafta justa.

**Adicional para diversión:** el rebote de la bomba en el agua como técnica —bajo y largo—, que es
lo que pasó de verdad.

**Aclaración final (borrador):** *«8 de junio de 1982. Cinco Dagger encontraron sola a la HMS
Plymouth en el estrecho. Cuatro bombas la alcanzaron; quedó fuera de combate hasta el final de la
guerra. Volvieron todos.»*

---

## Cómo se presentan

- **El modo se llama «LIBRO DE VUELO»**, con el subtítulo *«Misiones reales · 1982»* *(decisión del
  autor, 13/10)*. Es la pareja de la campaña, *«El cuaderno de Mateo»*: el cuaderno es la historia
  inventada; el libro de vuelo, lo que pasó.
- **En la demo:** el menú «LIBRO DE VUELO» con las cuatro, en orden de fecha.
- **En el juego completo:** se desbloquean con la campaña — Sheffield y Glasgow después de M4, Ardent
  después de M5, Plymouth después de M11 (`MISIONES_SUELTAS.md`).
- **Antes de pegar textos:** mostrale al autor **las líneas de radio que no son citas reales** y **las
  cuatro aclaraciones**.

## Lo que hay que confirmar con el autor antes de cerrar

- La versión del Sheffield (`M4_CAMBIOS.md` · 5): ¿se dice en la aclaración o no?
- Las bajas británicas de la Plymouth.
- Los textos de las aclaraciones.
