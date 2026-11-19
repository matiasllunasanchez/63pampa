# Análisis: los dos juegos de las islas reales y cómo engancharlos a RASANTE

_19/11/2026. Pedido del autor: analizar a fondo `rasantev2` (Dusk Patrol) y `whitepass-mission`
(Malvinas 1982, el helicóptero), compararlos con RASANTE y proponer qué traer, cómo y dónde._

> **Resumen en una línea:** los dos juegos nuevos tienen **el mundo** que a RASANTE le falta (las
> islas reales a escala 1:1, su clima y su guerra por fecha) y no tienen **juego**: nada es un
> blanco, nada te mata y no hay objetivo. RASANTE es lo contrario. La propuesta es una **fase nueva
> de vuelo libre sobre las islas reales** que use el mundo de ellos con el juego de RASANTE, y
> llevar el terreno real también al PASILLO, sin cambiar cómo se vuela.

---

## 1. Qué es cada uno

| | **Dusk Patrol: Islas Malvinas** (`rasantev2`) | **Malvinas 1982** (`whitepass-mission`) | **RASANTE** |
|---|---|---|---|
| Qué se vuela | caza bimotor ficticio | helicóptero ficticio con insignias del Ejército | aviones y helicópteros reales, horneados en Blender |
| Motor | WebGL2 crudo, sin librerías: el terreno se dibuja por *ray march* píxel a píxel | three.js r170: malla de terreno con nivel de detalle continuo (CDLOD) | canvas 2D a 480×270 + three.js r185 para el mar 3D y el ARENA |
| Terreno | DEM real (SRTM y ETOPO1), 125 m por texel, 310 × 210 km, **0,94 MB** comprimido + detalle procedural | DEM real, 100 m por texel, 284 × 184 km, **3,5 MB**, sombras del sol horneadas | `geografia` por tramos en km: mar, costa, tierra y lomadas, **inventada** |
| Look | **el mejor de los tres en atmósfera**: ~340 px de alto, paleta limitada, dither Bayer, luz en escalones, cielo cerrado, estratocúmulos con sombra, aguanieve, rompiente | correcto pero chato: el pasto se lee como ruido verde y la escala se pierde | paleta Atlántico Sur, sprites horneados, HUD de relojes |
| Vuelo | arcade puro: **no se puede chocar**, tira para arriba solo antes del terreno, techo de nubes, giro automático en el borde del mapa | hover, deslizamiento lateral, aterrizaje, evitación suave del terreno, colisión con sólidos | vuelo a gas contra gravedad en el carril, turbo, piruetas, la cola |
| Guerra | escenografía fija de mayo: pueblo, pistas, flota en San Carlos, cráteres, humo. **Nada reacciona** | **la guerra por fecha** (2/4–14/6): 97 entidades en `world/conflict.js` (lon/lat, bando, estados, desde y hasta) + titulares del día | enemigos que pelean (Rapier, manpad, Sea Wolf/Cat/Dart, Harriers con Sidewinder) |
| Cabina | panel dibujado píxel a píxel, **todas las lecturas reales**, radar ámbar que nombra el lugar más cercano | panel simple + mira + minimapa | cabinas de autor + HUD cargado (intencional) |
| Lo que no tiene | objetivo, enemigos, daño, puntaje | objetivo, enemigos (**los cohetes solo pegan en tierra y agua**) | un mundo real |
| Tests | capturas en lugares reales, 3 minutos de input al azar | **simulación de vuelo en Node**, capturas por lugar y por fecha, el juego sin cada feature | `npm run check`, feel, fixtures |

Los dos son **juguetes de sobrevuelo** muy bien terminados. Están hechos para mirar.

---

## 2. Por qué esto puede andar donde el ARENA no anduvo

El ARENA (vuelo 3D libre alrededor del buque) quedó en cuarentena el 18/8 porque "no genera buenas
sensaciones". Mirando `PLAN_MINUTOS_SAGRADOS.md`, los motivos fueron:

1. **Un ring de 700 m sobre mar vacío.** No había nada para orientarse: perdías el buque de vista y
   no sabías dónde estabas.
2. **Apuntar fino a un blanco 3D a 480×270 es pelea perdida** (lo dice el mismo plan).
3. **Morías sin entender por qué**: el mar mataba sin aviso y el flak de atrás no se veía.
4. El posible mareo de rolar el horizonte entero.

Las islas reales resuelven 1 y 3 solas:

- **El mundo es la orientación.** Monte Usborne, las Dos Hermanas, el estrecho y el pueblo son
  referencias que el jugador reconoce (y que un veterano reconoce más).
- **El terreno no mata.** El *pull-up* automático de Dusk Patrol (mira 0,2–3 s adelante y levanta la
  nariz) deja rozar el suelo a 12 m sin miedo de clavarse por un error de lectura. El peligro pasa a
  ser **el enemigo**, que se ve venir.
- El 2 se esquiva **sin pedir puntería fina**: en vuelo libre los blancos son grandes (una pista, un
  buque, una batería) o el objetivo ni siquiera es destruir (llegar, rescatar, reconocer).

Y hay una coincidencia que vale oro: **la regla central de RASANTE ya es la regla natural del vuelo
libre.** En RASANTE, arriba hay viento en contra, radar y misiles. Dusk Patrol tiene un techo de
nubes del que no se puede salir. Juntos: **cuanto más alto volás, más te ven** (Sea Dart y Rapier
por radar), y por encima de los estratocúmulos estás muerto. No hace falta ninguna pared invisible
para que el jugador vuele bajo: el multiplicador rasante (x2/x5/x10 según la altura de radar) sigue
valiendo tal cual.

---

## 3. Qué traer y qué no

### Sí

| Qué | De dónde | Para qué |
|---|---|---|
| **El DEM real y su pipeline** (`tools/dem/`: bajar teselas, reproyectar, quitar picos falsos, fondo marino sintético, comprimir) | los dos; recomiendo el de **whitepass** (100 m, sol horneado, mismo motor) | la base de todo lo demás |
| **El terreno CDLOD** (`features/terrain.js`: una sola malla instanciada que se refina cerca de la cámara, sin grietas entre niveles) y `world.heightAt` idéntico en JS y en GLSL | whitepass | es three.js como RASANTE: se porta, no se reescribe. Pasar de r170 a r185 es menor |
| **El look de Dusk Patrol**: luz en escalones con dither, bruma que sube con la altura, capa de estratocúmulos con sombra en el suelo y techo, rompiente y cabrillas, aguanieve en pantalla, pasto blanco / brezo / ríos de piedra / nieve en lo alto | rasantev2 (`shaders/world.js`, `ui/sleet.js`) | portado como sombreado y post del terreno de three.js, y cuantizado a la paleta de RASANTE (ya existen `duotono3d` y `bruma3d`) |
| **La guerra como datos por fecha** (`world/conflict.js`: `kind`, `side`, `at` en lon/lat, `from`/`to`, `states`, `approx`, `note`) | whitepass | el **formato** es exactamente lo que necesita RASANTE. El **contenido** hay que verificarlo (ver §6) |
| **El vuelo del helicóptero** (hover, deslizar, aterrizar, evitación) | whitepass (`features/helicopter/flight.js`) | la base del UH-1H para S-11 |
| **El *pull-up* automático y el giro en el borde del mapa** | rasantev2 (`game/flight.js`) | el vuelo libre sin muertes por terreno |
| **El nombre del lugar más cercano** en el radar, con la toponimia argentina de 1982 | rasantev2 (`ui/radar.js`) | orientación sin flechas, y es identidad |
| **El minimapa de las islas** con tu posición | whitepass | en un mundo de 280 km hace falta |
| **El autopiloto de apertura** (una ruta suavizada en lon/lat que recorre Puerto Argentino) | whitepass (`features/autopilot.js`) | fondo del menú, vitrina de Steam y trailer |
| **La simulación en Node** (el autopiloto recorre la ruta sin chocar) | whitepass (`tests/sim.mjs`) | coincide con la regla de medir en Node, no en el juego |

### No

- **Los aviones de ellos.** El caza y el helicóptero son ficticios. Se vuelan los de RASANTE.
- **Meter los juegos enteros** (un iframe o una segunda ventana de Electron). Serían dos motores, dos
  looks, dos inputs y dos sonidos. Se traen piezas a las capas de RASANTE (`data/`, `systems/`,
  `render/`), no el juego.
- **Sus arquitecturas.** Dusk Patrol usa scripts con scope global; whitepass, un registro de features.
  Las dos están bien para ellos y chocan con las convenciones y el lint de capas de RASANTE.
- **"Nada es blanco" y "no se puede morir"** como regla general. En vuelo libre no te mata el
  terreno, pero el enemigo sí.
- **La interfaz en inglés.** Es una regla de diseño de ellos, no de RASANTE.
- **Cambiar la fecha en vuelo** (`,` y `.`). Sirve en un museo, no en una misión. La fecha se elige
  antes de despegar.
- **Su HUD y su panel.** El de RASANTE es intencional. Lo único que vale la pena traer es la idea del
  radar que nombra el lugar.

---

## 4. ¿En el PASILLO o en una fase aparte?

**Las dos cosas, pero distintas.**

### 4.a Fase nueva: las islas reales (la propuesta principal)

Una tercera fase junto al PASILLO y al ARENA: vuelo 3D libre sobre el mapa real. Sugerencia de
nombre interno: `'islas'`. No reusaría el nombre ARENA: está en cuarentena y su vocabulario ya
significa "el ring alrededor del buque". **El nombre en el menú lo decide el autor**: VUELO LIBRE,
RECONOCIMIENTO, LAS ISLAS…

Lo que el ARENA en cuarentena le deja a esta fase: `core/aero.js` (viraje coordinado, ángulos
comandados), el arranque de three.js, el domo de cielo y el mar centrado en el avión, el modelo de
buque a escala real, la lección de la legibilidad de muerte y los hallazgos del prompt (domo centrado
en el avión, niebla más lejos que el combate, etc.).

Lo que le trae RASANTE y ninguno de los otros tiene: **aviones reales con carga y perfil**,
escuadrón y relevo, multiplicador rasante, **eyección**, fallas, Rapier y manpad horneados, Harriers
con Sidewinder, Sea Dart por radar, fichas históricas, el banco de mejoras y la música.

### 4.b El terreno real en el PASILLO (sin tocar el vuelo)

El pasillo nunca rota y así se queda. Pero el DEM puede **alimentar su geografía**: hoy
`geografia: { ida, blanco, vuelta }` se escribe a mano en km. Se puede **derivar de una ruta real**:
una polilínea en lon/lat (por ejemplo, la entrada al estrecho de San Carlos) y del DEM se sacan la
costa, las lomadas de los costados (`colinaH`) y los acantilados a lo largo del carril. Además, en el
horizonte del pasillo se pueden dibujar **las siluetas reales de los cerros**, en el rumbo verdadero.

Resultado: la Ardent y la Plymouth se atacan en el estrecho que tiene la forma real, sin cambiar una
sola constante del vuelo (`npm run feel` queda idéntico).

---

## 5. Propuestas de modos y niveles

### A. VUELO LIBRE: la demo de las islas *(lo primero)*

JUEGO RÁPIDO → elegís avión, **fecha** y punto de despegue (Puerto Argentino, Pradera del Ganso,
Isla Borbón, o desde el continente con la nafta justa). Volás las islas reales.

- La guerra está **ese día**: antiaéreos, tropas, buques y Harriers salen de los datos por fecha.
  Tropas y AA propias en las posiciones argentinas; Rapier y manpad en la cabeza de playa británica
  después del 21/5.
- Arriba de las nubes te ve el radar. Abajo, el multiplicador rasante suma.
- **Hay cosas para encontrar**: los lugares de las placas históricas (ya hay
  `PLAN_ESCENAS_INVESTIGABLES.md` y `PLAN_ESTRELLAS_BUSQUEDA.md`). Pasás bajo sobre el lugar y se
  abre la ficha. Es el museo jugable.
- Sin guion y sin fin: te derriban, te quedás sin nafta o volvés a una pista propia y aterrizás.

Es lo que el autor describió ("sobrevolar las islas como demo, con antiaéreos y tropas, con nuestros
aviones"). Además es **la vitrina de Steam**: un clip volando el estrecho a 15 m con un A-4B vende
más que cualquier texto.

### B. S-11 · Colgado del patín *(LIBRO DE VUELO, solo helicóptero)*

La misión que pidió el autor, desarrollada **exclusivamente en la fase de las islas**, con el
helicóptero de whitepass como referencia de vuelo.

1. **Contexto**: 21 de mayo, la tarjeta de siempre. Un A-4Q se eyectó después del ataque a la
   Ardent.
2. **Despegue** con el UH-1H del Ejército desde su base (lugar a verificar). Sin equipo de rescate.
3. **Búsqueda**: el piloto está en el agua cerca de la costa. Se lo encuentra por **el humo naranja
   y el bote** (el bote ya está horneado en la hoja de la eyección). El radar dice el lugar más
   cercano; no hay flecha.
4. **El enganche**: hover bajo sobre el agua, despacio. El piloto se agarra del patín.
5. **El traslado**: rasante hasta la costa con **un péndulo** atado al patín. Si acelerás, frenás o
   girás de golpe, el tirón pasa el límite y se suelta. Volar bajo sirve por partida doble: te
   esconde de los Harrier y, si se suelta, cae de menos altura.
6. **La presión**: el frío del agua es un reloj (hipotermia) y una patrulla de Sea Harrier barre el
   estrecho. Un helicóptero no le gana a un Harrier: lo esquiva escondiéndose contra el terreno.
7. **Lo que pasó**: la tarjeta, sin reintento, como el resto del libro.

Qué se reusa: el vuelo de whitepass (hover y deslizamiento son exactamente lo que pide el
enganche), los UH-1H ya horneados (con las palas que giran), la eyección y el bote horneados, la
patrulla de Harriers de LA COLA. Lo nuevo es el péndulo, que **se mide en Node antes de verlo en
pantalla**: límite de tirón, amortiguación, cuánto se puede girar con el piloto colgado.

> La cámara tiene que ser de **tercera persona** (el péndulo tiene que verse), así que hace falta
> el UH-1H como modelo 3D, no como hoja de sprites: **exportar a GLB** desde
> `tools/blender/modelos_helos.py`. Es el mismo modelo, otra salida del horno.

### C. Otras salidas del libro que piden las islas reales

Las que están en `LIBRO_PROXIMAS` y pasan **sobre tierra**, donde el pasillo pierde más:

| Salida | Por qué en las islas |
|---|---|
| **S-09 · El Aermacchi del estrecho** (21/5) | un solo avión entrando a la bahía San Carlos con la flota real fondeada. Es la misión perfecta para esta fase |
| **S-07 · Los dos Pucará** y **S-14 · Dos Pucará contra dos helicópteros** | el Pucará vuela bajo entre cerros y desde pistas de las islas (Pradera del Ganso, Isla Borbón) |
| **S-13 · Sobre Pradera del Ganso** | combate sobre tierra con el istmo real |
| **S-08 · Desde tierra: Puerto Howard** | el punto de vista de la AA: se presta a una cámara fija o casi, sobre el mapa real |
| **S-01 · El rescate del Belgrano** | pariente de S-11 (buscar en el agua), aunque es mar abierto, fuera del mapa de las islas |

### D. Mejoras baratas a lo que ya existe

- **La ruta real en el contexto y en "lo que pasó"**: antes de despegar, el mapa 3D de las islas
  con la ruta de la escuadrilla dibujada; al final, la misma ruta con dónde cayó cada uno. Un
  sobrevuelo de cámara, sin vuelo del jugador. Es poco trabajo y le da peso histórico a las cinco
  salidas que ya están.
- **El fondo del menú**: el autopiloto recorriendo Puerto Argentino, el estrecho o la bahía, con
  el avión elegido.
- **El PASILLO con geografía real** (§4.b).

---

## 6. Riesgos y cosas a cuidar

- **Los datos del conflicto de whitepass no son canon.** Casi todas las posiciones son `approx`, las
  cantidades son ilustrativas y los titulares fueron escritos por otro agente. Se traen como
  **borrador**, se verifican uno por uno y las dudas van a `docs/historia/PREGUNTAS_HISTORICAS.md`.
  Ejemplos a verificar: la matrícula `AE-410` del helicóptero, qué hubo en Isla Borbón cada día, la
  hora de cada hundimiento.
- **Sin nombres de personas reales** en pantalla, como el resto del libro de vuelo.
- **La escala 1:1 es grande.** A la velocidad de RASANTE se cruza el estrecho en un par de minutos,
  pero ir de Puerto Argentino a Gran Malvina lleva más de diez. Las misiones arrancan cerca de la
  acción, y el vuelo libre deja elegir dónde despegar.
- **El mareo a 480×270** sigue sin medir (el ARENA lo dejó pendiente). Dusk Patrol se ve bien a 340
  px de alto, así que es esperable que ande, pero hay que jugarlo.
- **Rendimiento**: el CDLOD de whitepass es liviano y el DEM pesa entre 1 y 3,5 MB. En Electron no es
  problema. El *ray march* de Dusk Patrol es más caro y no se mezcla con las mallas de three.js: por
  eso se trae **su look, no su motor**.
- **El refactor**: todo esto va en módulos nuevos (`systems/islas/…`, `render/islas.js`,
  `data/islas_*.js`) y **no le suma líneas a `game.js`**. La fase entra por el registro de fases, no
  con otro `S.state ===`.
- **La sesión paralela**: tocar la geografía del PASILLO (§4.b) pisa `colinas.js` y `tierra.js`, que
  la otra sesión puede estar usando. Coordinar antes.

---

## 7. Plan por etapas

Cada etapa termina con el autor jugándola. **Es la lección del ARENA**: construir de más antes de
probar si se siente bien.

| Etapa | Qué | Cuándo se da por buena |
|---|---|---|
| **I0 · Prototipo descartable** | DEM + CDLOD de whitepass adentro del renderer de three.js de RASANTE, a 480×270, con la paleta y el dither; un A-4B con el vuelo del ARENA + *pull-up*; techo de nubes. Sin enemigos. Detrás de una sonda (`?islas`) | el autor vuela el estrecho y dice "esto sí" |
| **I1 · El look** | luz en escalones, estratocúmulos con sombra, rompiente, aguanieve, nieve en lo alto, nombre del lugar en el radar, minimapa | capturas en los lugares reales (estrecho, Usborne, Puerto Argentino, Lafonia, San Carlos) |
| **I2 · VUELO LIBRE** | datos del conflicto por fecha (verificados), AA y tropas que disparan, radar arriba de las nubes, multiplicador rasante, placas para encontrar, aterrizar en pista propia | entra a JUEGO RÁPIDO |
| **I3 · S-11 Colgado del patín** | UH-1H en GLB, vuelo de helicóptero, péndulo medido en Node, búsqueda, patrulla de Harriers, tarjetas | entra al LIBRO DE VUELO |
| **I4 · El PASILLO con mapa real** | geografía derivada de rutas reales + siluetas de los cerros en el horizonte | `npm run feel` idéntico |
| **I5 · Más salidas** | S-09, S-07/S-14, S-13 | una por una |

**D (la ruta real en el contexto y en "lo que pasó")** se puede hacer en cualquier momento después
de I1.

---

## 8. Lo que tiene que decidir el autor

1. **El nombre** de la fase y del modo en el menú.
2. **¿Se puede chocar contra el terreno en vuelo libre?** La propuesta es que no (con *pull-up*), y que
   el peligro sea el enemigo. En las misiones se puede elegir caso por caso.
3. **¿El look de Dusk Patrol o la paleta de RASANTE?** La propuesta es su luz y su clima, con la
   paleta y el dither de RASANTE, para que no parezca otro juego.
4. **El ARENA en cuarentena**: ¿se le saca lo que sirve y se lo entierra, o queda como está?
5. **¿I0 ahora**, o después de la demo de Steam?
