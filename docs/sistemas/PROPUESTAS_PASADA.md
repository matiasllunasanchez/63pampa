# PASADA — el clímax de una sola pasada · tres propuestas para decidir

> **Estado: DECIDIDO (15/8/2026) — las tres propuestas SE FUSIONAN en un modo compuesto:
> A es la ENTRADA, B es la SUELTA, C es la OLEADA que se monta encima. El diseño integrado
> está en §8b; las perillas que quedan, en §11.** Las secciones §4–§7 se conservan como
> historia de la decisión. Este doc define el modo de juego **PASADA**: el enfrentamiento contra el buque
> al final del nivel, resuelto **al estilo RASANTE** — llegar bajo, pegar y salir — en lugar
> de la órbita libre del ARENA. Nace de una decisión ya tomada: con 9 de 14 misiones
> terminando en buque, el ARENA como único clímax se repite; el ARENA queda como **excepción**
> (misiones señaladas + MINUTOS SAGRADOS) y la PASADA pasa a ser el clímax por defecto.
>
> **Antes de tocar código, leer:** `docs/ARQUITECTURA.md` (manda sobre este doc) ·
> `PROMPT_ARENA_VUELO_LIBRE.md` (el 3D que se hereda entero) · `GUION_3.md` §"La voz de la
> base" (sin radar, Cóndor) · `PREGUNTAS_HISTORICAS.md` (las dudas nuevas de este doc ya
> están anotadas ahí).

---

## 1. La tesis

El prólogo entero del juego es una sola frase: **"los valientes vuelan abajo"**. El PASILLO
la enseña durante todo el nivel. La PASADA es **el examen**: el momento donde volar bajo,
rápido y derecho hacia algo que te dispara es exactamente lo que hay que hacer — porque
históricamente fue exactamente lo que se hizo.

Regla de oro del modo: **la PASADA no es otro juego, es el PASILLO con consecuencias.**
Mismas teclas, misma física (la del PASILLO, ya portada al 3D del ARENA), ningún control
nuevo. Lo que cambia es el reglamento: la corrida tiene principio, suelta y fin.

## 2. La verdad histórica que gobierna el diseño *(común a las tres propuestas)*

| Hecho real (1982) | Regla de juego que sale de ahí |
|---|---|
| Perfil de ataque: ingreso a ras del agua (~15 m o menos, ~900 km/h), **segundos** sobre el blanco, egreso quebrando | La corrida es corta e intensa. El tiempo expuesto se mide en segundos, no en minutos |
| Los A-4 **no tenían radar, ni alerta radar, ni chaff/bengalas** | No hay tono de lock-on ni aviso instrumental. Los avisos son OJOS (el escuadrón por radio) y CÓNDOR (que ve aviones, nunca misiles) |
| Defensa del buque **en capas por alcance**: Sea Dart (lejos y alto — ciego abajo) → cañón de 4,5" (medio) → Sea Cat / Sea Wolf (corto) → 20 mm y fusilería (encima) | La dificultad es geografía: cada metro más cerca enciende una capa más. Volar bajo apaga la primera capa — la lección del juego, hecha sistema |
| El **Sea Cat era subsónico y guiado a mano** (efectividad real bajísima) | El misil de corto alcance se ve venir y **se esquiva de verdad** con un quiebre — no es un dado, es una maniobra |
| **La bomba que no despertó**: soltadas demasiado bajo, las espoletas no llegaban a armarse. Varios buques cobraron bombas dormidas adentro | **LA VENTANA DE SUELTA**, la mecánica central: demasiado alto te ven y te pegan; demasiado bajo la bomba llega dormida (golpea, no explota). El juego ya lo tituló: m6, "LA BOMBA QUE NO DESPERTÓ" |
| **El sapito**: hubo bombas que **rebotaron en el agua y entraron al casco** (Broadsword, 25/5 — ver PREGUNTAS_HISTORICAS) | El golpe de estilo: suelta perfecta en la banda baja, a fondo → la bomba pica una vez en el agua y entra. **Es la piedra de Esteban del prólogo, vuelta arma.** El buque del rebote real (Broadsword) es boss de m13 |
| Doctrina: **UNA pasada.** Repetir era casi suicidio: perdías la sorpresa y disparaba todo | Re-encarar está permitido pero **cuesta**: la defensa queda caliente, converge más rápido, y cada vuelta quema nafta |
| La Chancha rota desde m6: **"sin Chancha no hay nafta de vuelta"** | **La nafta es el reloj** de la zona de combate (los ~10 minutos ya decididos). No hay timer artificial: hay combustible |
| Atacaban **de a 2–4, con segundos de separación**, por ejes distintos | El escuadrón participa de la oleada (cuánto, depende de la propuesta — ver C) |

## 3. Las mentiras permitidas *(las concesiones, declaradas y con dueño)*

Para que sea un juego y no una recreación, se permiten exactamente estas — ninguna otra:

1. **Pasadas múltiples (2–4)** para que el boss tenga cuerpo. Se disfraza de verdad: la
   "vida" del buque son sus **zonas** (radar, lanzador, puente, motor — ya existen en
   `ship3d.js`), y cada pasada apaga una.
2. **Zonas con HP visibles** (corchetes del ARENA, ya construidos).
3. **Flak legible**: densidad de juego, no densidad letal real.
4. **La mira** como asistencia de suelta (el A-4 real tenía un visor rudimentario).
5. **MOMENTUM en la ventana de suelta** (opcional, perilla): el especial de cámara lenta
   (`systems/tempo.js`, hoy solo PASILLO) encuentra acá su mejor momento — el medio segundo
   de la suelta, estirado. ROADMAP #13 ya lo dejaba abierto.
6. **Tiempo comprimido**: la zona de combate son ~10 minutos de nafta, no una sortie de 3 h.

## 4. PROPUESTA A — «LA CORRIDA» *(el pasillo se vuelve arma)*

**Pitch.** No hay corte, no hay pantalla, no hay cambio de cámara: al final del PASILLO el
buque **aparece en el horizonte** y el pasillo se convierte en la corrida de ataque. Seguís
volando exactamente igual — esquivando lo que el buque te tira en vez de obstáculos — hasta
la ventana de suelta. Soltás, lo sobrevolás (el mástil pasa por arriba), y el mundo da la
vuelta para re-encarar: otro tramo corto de pasillo, otra corrida.

**Una corrida:** (1) el buque asoma como un punto con humo · (2) a media distancia abre
fuego el cañón — columnas de agua en el carril, se esquivan como obstáculos · (3) cerca,
el Sea Cat: estela visible, UN quiebre lo pierde · (4) ventana de suelta con la banda de
armado en el HUD · (5) sobrevuelo — fusilería, el momento más ruidoso · (6) egreso y
vuelta. 2–4 corridas según zonas vivas.

- **Histórico:** el perfil lay-down puro. Es literalmente cómo se atacó al Coventry.
- **Mentira principal:** el "re-encare por pasillo" (la vuelta real era irse).
- **Referencias:** *633 Squadron* (1964) — el fiordo con paredes de flak, LA corrida con un
  solo tiro; *The Dam Busters* (1955) — la disciplina de altura exacta para que el arma
  funcione (sus reflectores convergentes = nuestra banda de armado); la trench run de *Star
  Wars* (1977), que Lucas construyó calcando esas dos películas; **1943: The Battle of
  Midway** (Capcom) — buques boss al final del nivel atacados por pasadas; **Star Fox 64**
  — el corredor que desemboca en un boss con partes destruibles, sin soltar el riel;
  **Rogue Squadron / Rogue Leader** — la trench run jugable.
- **Reusa:** casi todo el PASILLO. El 3D solo para el buque y el sobrevuelo.
- **Costo:** el más barato (≈4 etapas). **Fallback web/`?no3d`: natural** — es el pasillo,
  degrada solo. Podría retirar `momentum.js` viejo del todo.
- **Riesgo:** es el MENOS distinto del resto del juego. El clímax podría sentirse como "más
  pasillo con un barco al final".

## 5. PROPUESTA B — «SALTO Y GOLPE» *(pop-up: la doctrina completa)* ⭐ recomendada

**Pitch.** El vuelo libre 3D del ARENA, pero **estructurado en corridas con eje**. Entrás a
la zona pegado al agua, bajo el techo de radar. Elegís el eje y la zona del buque que vas a
castigar. En el último kilómetro hacés el **pop-up**: un salto corto que te expone 2–3
segundos — ahí está TODO el juego: te ve cada cañón del buque, pero es la única forma de
apuntar y de que la bomba arme. Soltás, picás de vuelta al agua, y el egreso es la mitad
del peligro. Re-encarar es legal y carísimo.

**Una corrida:** (1) ingreso a ras — el buque en el horizonte, Sea Dart ciego mientras
estés abajo del techo (subir de más ANTES de tiempo = misil largo, esquivable pero caro) ·
(2) el cañón de 4,5" camina columnas de agua hacia tu rumbo — el flak con predicción ya
construido · (3) **POP-UP**: salto, la mira cae sobre el buque, la banda de armado en
pantalla, opcionalmente MOMENTUM estira el instante · (4) suelta — alta: te ven; dulce:
arma; baja a fondo: **el sapito** · (5) picada al agua, sobrevuelo o viraje al costado ·
(6) egreso con el Sea Cat persiguiendo — un quiebre — y racetrack para re-encarar,
quemando el reloj de nafta, con la defensa un grado más caliente.

- **Histórico:** es EL perfil real (ingreso bajo + pop-up + suelta + egreso jinking). La
  capa Sea Dart castiga volar alto: la tesis del juego hecha sistema de defensa.
- **Mentira principal:** las 2–4 corridas, y que el pop-up sea seguro-pero-caro en vez de
  ruleta.
- **Referencias:** ***Top Gun: Maverick* (2022) — la referencia madre entera**: ingreso
  bajo el radar por el cañón, el salto ("the first miracle"), la ventana de suelta
  imposible, el egreso contra los misiles. Nuestro brief de misión es ese, con A-4 y un
  buque; *Dunkirk* (2017) — el indicador de nafta como única cuenta regresiva; **Ace
  Combat 7** ("Fleet Destruction") — cómo se hace legible la AA naval y el apuntado por
  subsistemas, y también qué NO copiar (lock-on con tono: nosotros no tenemos RWR);
  **War Thunder** (naval) — espoletas con distancia de armado: la prueba de que la banda
  de armado funciona como mecánica en un juego popular; **DCS: A-4E-C** — los perfiles
  pop-up reales del avión exacto, como documentación.
- **Reusa:** TODO el ARENA — `three-arena.js`, `ship3d.js`, `render/arena.js`, el vuelo
  PASILLO-idéntico, el flak con predicción, 1ª/3ª persona con V.
- **Costo:** medio (≈6 etapas). **Fallback web:** necesita 3D — para `?no3d` queda el
  `momentum.js` viejo (como hoy con el ARENA) o la variante A.
- **Riesgo:** calibrar el pop-up para que "expuesto 2–3 s" sea tenso y no injusto. Es
  tuning, no arquitectura — y el flak predictivo ya demostró que castiga bien.

## 6. PROPUESTA C — «LA OLEADA» *(los Fieles atacan con vos)*

**Pitch.** La pasada no es tuya: es **de la escuadrilla**. La oleada ataca de a uno, con
segundos de separación, por ejes distintos — y vos elegís tu turno. Ir primero: sorpresa,
menos flak, pero nadie te marcó nada. Ir último: el buque ya está herido y las defensas
marcadas… y todas te esperan a vos. Los wingmen se ven en el 3D haciendo SUS corridas, sus
bombas suman daño real, y sus pérdidas son reales — el sistema de relevo que ya existe.

**Una oleada:** (1) Cóndor da la orden y la formación se abre · (2) elegís tu puesto en la
oleada (única elección nueva) · (3) ves la corrida del que va adelante — su suelta, su
suerte · (4) tu corrida, con el reglamento de B · (5) reagrupe, parte de daños por radio
("Plata 3 tocado"), decisión de segunda oleada contra el reloj de nafta.

- **Histórico:** los ataques reales fueron exactamente esto — secciones de a 2–4, segundos
  de separación. Es la propuesta MÁS fiel a la táctica.
- **Mentira principal:** que la oleada espere tu elección de puesto.
- **Referencias:** *Midway* (2019) — la secuencia de los SBD sobre el Akagi: uno atrás del
  otro atravesando el flak, cada uno con su suerte (el perfil es de picado, no rasante:
  la referencia es la ESTRUCTURA de oleada, no la trayectoria); las oleadas Gold/Red de
  *Star Wars* (1977) — "Red Five going in", mirar morir al de adelante ANTES de tu turno;
  **Star Fox 64** — wingmen con voz, suerte propia y consecuencias persistentes.
- **Reusa:** todo B + `systems/squad.js` (roster, relevo, indicativos — ya existe).
- **Costo:** el más caro (B + 2–3 etapas: IA de corrida de wingmen, coreografía, aviones
  amigos visibles en el 3D — hoy no existen). **Fallback web:** igual que B.
- **Riesgo:** la IA de los wingmen es trabajo nuevo de verdad. Y el guion manda muertes en
  misiones FIJAS (Vasco en m7, Pichón en m9): la oleada tiene que poder herir sin matar
  fuera de guion — el relevo ya resuelve esto, pero hay que coreografiarlo.

## 7. Comparadas

| | A · LA CORRIDA | B · SALTO Y GOLPE | C · LA OLEADA |
|---|---|---|---|
| Fidelidad histórica | alta (lay-down) | **alta (el perfil completo)** | la más alta (táctica real) |
| Distinción vs PASILLO | baja ⚠ | **alta** | alta |
| Distinción vs ARENA | alta | **alta** (eje vs órbita) | alta |
| Usa la tesis "volar bajo" | sí | **sí, como sistema de defensa** | sí |
| Escuadrón | por radio | por radio | **en pantalla** |
| Reuso de lo construido | PASILLO | **ARENA entero** | ARENA + squad |
| Costo | ≈4 etapas | ≈6 etapas | ≈8–9 etapas |
| Fallback web (`?no3d`) | **natural** | momentum viejo o A | ídem B |
| Riesgo | clímax tibio | tuning del pop-up | IA de wingmen |

## 8. Recomendación

**B — «SALTO Y GOLPE» — como núcleo.** Es el equilibrio exacto que pedís: el perfil
histórico completo con las concesiones justas, la mayor distinción tanto del PASILLO como
del ARENA, y el mejor reuso (hereda TODO lo que el ARENA ya construyó y verificó).

Y las otras dos **no compiten, se acoplan**:

- **De A se adopta la ENTRADA**: la transición PASILLO → PASADA sin corte (el buque asoma
  al final del pasillo y el mundo se abre) es un tratamiento de transición, no un
  reglamento. B la necesita igual.
- **C es una CAPA sobre B**, no una alternativa: cuando B exista, la oleada se monta
  encima. Candidata natural: **m14, el final** — la última oleada de los Fieles como
  cierre. Elegir B hoy no cierra C mañana.

**Mapa de clímax propuesto** *(IDs canon de 14 — ojo: `missions.js` todavía carga las 12 de
la v0.0.1; el remapeo es parte del PLAN_CAMPANA_001 y no de este modo)*:

| Clímax | Misiones |
|---|---|
| **PASADA** (default) | m4 Sheffield · m6 Antelope · m7 Coventry · m8 Conveyor · m13 Broadsword (el sapito real) |
| **ARENA** (excepción) | m5 Ardent (San Carlos: el callejón ES una arena) · m11 Galahad + m12 Tristram (Bahía Agradable, fondeados) · m14 Glamorgan (el final: ARENA, o PASADA+C si la oleada llega) |
| **MINUTOS SAGRADOS** | sigue siendo ARENA puro, no se toca |

## 8b. LA DECISIÓN — el modo compuesto *(15/8/2026, Matías)*

Las tres propuestas se fusionan en UN modo. La pasada completa, de punta a punta:

1. **Entrada (A).** El pasillo no se corta. A ~X metros del buque (perilla) se apagan los
   spawns de enemigos y entran las **columnas de agua** del cañón — **solo si sos el avión
   en corrida**: la defensa le tira al que está entrando, no a todos a la vez.
2. **La ventana (B).** El tiempo se ralentiza APENAS (perilla; el MOMENTUM del jugador se
   SUMA si lo tiene cargado — `tempo.js` ya escala el dt del mundo entero, así que es
   barato). El juego acá es **mantener el ras** con el techo de radar visible en el HUD,
   esquivando columnas, mientras se prepara la suelta.
3. **El salto.** La subida se CONTROLA, no es un botón: subir antes de tiempo o de más te
   regala al buque; el salto medido te deja 2–3 s de mira sobre las zonas. Ahí se juega la
   suelta: **alta** (te ven de más) / **dulce** (arma) / **dormida** (golpea y no explota).
4. **La suelta — LA RISTRA.** Se llevan **2–3 bombas** y salen **en salva sobre tu línea de
   vuelo** (históricamente exacto: la carga se tiraba en sucesión, por eso hubo buques con
   varios impactos de una sola pasada). Para pegarle a DOS objetivos en una pasada no hay
   dos miras: **hay que elegir un eje que los alinee**. El apuntado es geometría, no clicks.
5. **El sapito (easter egg).** Soltar **ANTES del salto**, en el ras: la bomba pica en el
   agua y entra al casco. Es el perfil lay-down real — el más usado en San Carlos — pero
   sin la mira del salto: ventana finísima, a puro ojo. Corta, se hunde; larga, **rebota
   por encima del buque** (también pasó de verdad). El premio del que juega como los que
   sabían: daño pleno + bonus, y cero exposición.
6. **Re-encare (C) — dos maneras, dos precios:**
   - **viraje lateral**: volvés por el lado OPUESTO, rápido — pero te cruzás **de frente
     con la oleada** de tus compañeros (flyby sin colisión amiga: susto y espectáculo);
   - **chandelle por arriba**: volvés por el MISMO lado, prolijo — pero quema más nafta y
     el lomo de la subida te asoma al Sea Dart.
7. **La oleada (C).** Entre tu corrida y la siguiente pasan los compañeros. Sus corridas
   son **coreografía, no IA**: vuelan splines de ataque con timing y parte por radio — una
   pasada no reacciona, por eso es barata. Sus bombas hacen daño real; sus toques pasan por
   el relevo. Menos Fieles vivos = menos corridas amigas y menos avisos.
8. **Fin.** El buque define 1..N objetivos (las zonas por clase de `ships.js`); cada vuelta
   quema nafta; **la nafta es el reloj**. Se gana apagando los objetivos; se pierde por
   escuadrón o por tanque seco.

**El arma.** En PASADA el arma es **LA BOMBA** ([Z] pasa a ser la suelta; el misil del
PASILLO no viaja a esta fase). Los A-4 **no llevaban misiles antibuque** — eso era el
Exocet del Super Étendard — pero sí llevaban 1 bomba de 1000 lb **o una ristra de hasta 3**
de 500: las 2–3 bombas por pasada son correctas, siempre en salva sobre la línea.

## 9. Plan de implementación *(resumen — el plan EJECUTABLE, con RF, defaults, sondas y fixture, vive en [SPEC_MODO_PASADA.md](SPEC_MODO_PASADA.md))*

Cada fase es shippeable, cierra con `npm run check` verde y con su sonda (`?pasada=<buque>`
entra derecho a la zona, mismo patrón que `?qa`/`?no3d`/`?scene=`).

| Fase | Entrega | Común a A/C |
|---|---|---|
| **P0** | Transición sin corte: el buque asoma al final del PASILLO, el carril se abre a la zona 3D, la cámara empalma. Estado nuevo `'pasada'` + vocabulario en ARQUITECTURA | ✅ |
| **P1** | La corrida mínima: eje de ataque, ingreso a ras, sobrevuelo, viraje de re-encare (racetrack). Sin defensa, sin bomba. Criterio: volar 3 corridas seguidas se SIENTE bien | ✅ |
| **P2** | La suelta: banda de armado (alta/dulce/dormida), la bomba como proyectil balístico, daño por zona, **la ristra** (2–3 en salva sobre la línea — dos objetivos = un eje que los alinee) y **el sapito** (suelta en el ras ANTES del salto: pica y entra; corta se hunde, larga rebota por encima). Criterio: bandas y ristra producen resultados distintos y legibles sin leer nada | ✅ |
| **P3** | La defensa por capas: techo Sea Dart (castiga volar alto temprano), cañón de 4,5" caminando columnas, Sea Cat esquivable con estela, fusilería en el sobrevuelo. Los avisos por radio del escuadrón (menos Fieles vivos = menos avisos). Criterio: cada capa se aprende muriendo UNA vez |  |
| **P4** | El reglamento: 2–4 corridas por zonas, la defensa se calienta por re-encare, la nafta como reloj, el **ralentí leve de la ventana** (perilla; el MOMENTUM del jugador se SUMA — `tempo.js` ya escala el dt de todo) y los DOS re-encares de §8b.6. Derrota/victoria conectadas al embudo `onDeath`/`'objective'` de siempre |  |
| **P5** | Legibilidad + audio: HUD de banda de armado, aviso de armado dormido ("NO DESPERTÓ"), sonido por capa de defensa, silencio del Sea Dart cuando volás bajo (la recompensa se ESCUCHA) |  |
| **P6** | Integración: mapa clímax por misión (dato en `missions.js`, no código), `flight.js` señala `'pasada'` donde corresponda, fallback `?no3d` decidido, docs (ARQUITECTURA, ESTADO, este doc pasa a SPEC) y retiro o no de `momentum.js` viejo | ✅ |
| **P7** | La OLEADA visible (§8b.6–7): corridas coreografiadas de los Fieles — splines de ataque + timing + parte por radio, el cruce de frente del re-encare lateral, su daño real al buque y sus toques por el relevo. **Coreografía, no IA** |  |

**Qué se hereda sin tocar:** el mundo 3D del ARENA, `ship3d.js` y sus zonas, el vuelo
PASILLO-idéntico, el flak predictivo, las cámaras 1ª/3ª (V), el relevo del escuadrón, el
overlay de `render/arena.js` (corchetes/HP).

## 10. Qué NO hacer *(prohibido por diseño)*

1. **No resucitar el riel del momentum viejo** (avión clavado, mundo que gira): eso ya fue
   rechazado una vez. La PASADA es vuelo libre CON reglamento, no un riel.
2. **No lock-on con tono, no RWR, no radar propio** — los A-4 no lo tenían. El aviso es
   humano o no es.
3. **No chaff ni bengalas.** La contramedida es el agua a dos metros.
4. **No aire-aire.** Los Fieles son bombarderos; los Harrier son clima, no boss.
5. **No HP que fuerce 5+ pasadas** — la doctrina era una; más de cuatro rompe el pacto.
6. **No cinemática en la suelta**: la suelta SE JUEGA. (MOMENTUM la estira, no la saca de
   las manos.)
7. **No inventar datos históricos en pantalla**: toda cifra o afirmación nueva pasa por
   PREGUNTAS_HISTORICAS antes de ir a una placa.

## 11. Decisiones *(estado al 15/8/2026)*

Resueltas por Matías:

- [x] **Propuesta: LA COMPUESTA** — A entrada + B suelta + C oleada (§8b)
- [x] El sapito: easter egg de suelta ANTES del salto, daño pleno + bonus de estilo
- [x] Ralentí leve en la ventana, y el MOMENTUM del jugador se suma
- [x] La ristra: 2–3 bombas por pasada, en salva sobre la línea (no hay doble mira)
- [x] Re-encare con dos precios: lateral (lado opuesto + cruce de frente con la oleada) /
      chandelle (mismo lado + más nafta + asomarse al Sea Dart)
- [x] El boss define 1..N objetivos (zonas por clase); cada pasada gasta nafta

Perillas abiertas — **con default elegido en el SPEC, no bloquean el desarrollo**:

- [ ] ¿2 o 3 bombas por pasada? (default: 2; la 3ª como mejora del Pichón a futuro)
- [ ] ¿A cuántos metros del buque se corta el spawn de enemigos? (default en SPEC)
- [ ] Factor del ralentí de la ventana (default 0.85×, perilla en OPCIONES)
- [ ] N objetivos por clase de buque (default: las zonas de `ships.js` como en ARENA)
- [ ] ¿m14 cierra con PASADA + oleada completa (P7) en lugar de ARENA?

## 12. Dudas históricas que abre este doc

Anotadas en [PREGUNTAS_HISTORICAS.md](../historia/PREGUNTAS_HISTORICAS.md) (sección
PASADA): alturas/tiempos exactos de armado de espoletas · el rebote del Broadsword ·
efectividad real del Sea Cat · velocidad de ingreso del A-4 cargado · si los Mirage/Dagger
tenían algún alerta radar (los A-4 seguro no).
