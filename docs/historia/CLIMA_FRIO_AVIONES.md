# RASANTE — El frío y el clima del Atlántico Sur, avión por avión

*(20/11/2026 · investigación para el clima de las islas: `src/data/islas_clima.js`, `systems/islas/clima.js`)*

**Para qué es esto.** El clima de las islas ya tiene hielo (`HIELO`), cañón neumático lento con frío (`CANON_T`),
viento del oeste y ráfagas, todo calibrado sobre el **A-4B**. Este documento dice **cuánto de eso le toca a cada
avión** con cinco multiplicadores simples (1 = como el A-4B). No toca código: es la base para que el autor decida.

**Cómo leer los números.**

| Multiplicador | Qué escala | 1 = |
|---|---|---|
| `hieloK` | cuánto hielo junta por segundo (`HIELO.JUNTA`/`JUNTA_NUBE`) | A-4B: sin antihielo en alas ni cola |
| `canonFrioK` | cuánto le pega el frío al cañón (lo que hoy hace `CANON_T`) | Colt Mk 12 con cargador neumático |
| `salK` | cuánto se encostra el parabrisas volando rasante sobre el mar | A-4B, sin lavaparabrisas |
| `arranqueFrioK` | fallas al arrancar / en tierra con frío (se suma a `fallasK` de `perfiles.js`, no lo reemplaza) | A-4B en Río Gallegos/San Julián |
| `turbulenciaK` | cuánto lo sacuden viento y ráfagas (`rafagas` del clima) | A-4B |

`—` = no aplica (el avión no tiene cañón en el juego). **⚠** = sin fuente directa: valor de diseño o neutro.
Regla: **donde no hay fuente, el valor es 1** salvo que la física del tipo lo justifique sin discusión (y se dice).

---

## Tabla resumen

| key | Avión | hieloK | canonFrioK | salK | arranqueFrioK | turbulenciaK | Por qué, en una línea |
|---|---|---|---|---|---|---|---|
| `sky` | A-4B Skyhawk | **1** | **1** | **1** | **1** | **1** | La vara. Sin antihielo de ala, Colt neumático, costra de sal documentada. |
| `a4q` | A-4Q Skyhawk (Armada) | 1 | 1 | 1 | 1.1 | 1 | Mismo avión y mismo cañón; Río Grande, pista mojada y viento cruzado (Zubizarreta). |
| `dagger` | IAI Dagger | 1 ⚠ | 0.5 ⚠ | 1 | 1 | 0.9 ⚠ | Sin antihielo de ala conocido; DEFA a gas y disparo eléctrico, sin botella de nitrógeno. |
| `supere` | Super Étendard | 1 ⚠ | 0.5 ⚠ | 1 | 0.7 ⚠ | 1 | Avión nuevo y bien atendido (casi no falla); mismo DEFA; el mar grueso le complicó el rasante. |
| `mirage` | Mirage 5P | 1 ⚠ | 0.5 ⚠ | 1 | 1 | 0.9 ⚠ | Hermano del Dagger; no combatió: todo es por analogía. |
| `herc` | C-130H / KC-130H | **0.2** | 1 ⚠ | 0.6 ⚠ | 0.8 ⚠ | **0.5** | Antihielo completo (aire de sangrado + eléctrico); 70 t, el viento casi no lo mueve. |
| `pucara` | IA-58 Pucará | 1 ⚠ | 0.8 ⚠ | 0.5 | **1.5** | **1.3** | Vivía a la intemperie en pistas de pasto que se anegaban; liviano y lento. |
| `mb339` | MB-339A | 1 ⚠ | 0.5 ⚠ | 1 | **1.4** | **1.3** | Intemperie en Puerto Argentino, pista corta y mojada; jet liviano. |
| `neptune` | SP-2H Neptune | 0.4 ⚠ | — | 0.7 ⚠ | **1.3** | 0.6 | Patrullero de mar con deshielo; motores radiales viejos y gastados (se retiró por desgaste). |
| `learjet` | Learjet 35A | 0.3 ⚠ | — | 1 | 0.8 ⚠ | 0.8 | Bordes de ala calefaccionados; hacía rasante de escape sobre el mar (documentado). |
| `citation` | Cessna Citation | 0.4 ⚠ | — | 1 | 1 | 0.9 | Botas neumáticas y tomas calefaccionadas (por tipo, no por fuente de la guerra). |
| `merlin` | Swearingen Merlin | 0.4 ⚠ | — | 1 | 1 | 1 | Turbohélice presurizado con botas (por tipo). |
| `mu2` | Mitsubishi MU-2 | 0.6 ⚠ | — | 1 | 1 | 0.9 | Botas, pero el tipo tiene fama de malo con hielo; ala chica y cargada. |
| `aerostar` | Aerostar 601 | 0.7 ⚠ | — | 1 | 1 | 1.1 | Deshielo opcional según el ejemplar; el más chico de los ejecutivos. |
| `commander` | Rockwell Turbo Commander | 0.5 ⚠ | — | 1 | 1 | 1 | Botas (por tipo). |
| `guarani` | FMA IA-50 Guaraní II | 1 ⚠ | — | 1 | 1 | 0.9 | Sin dato de antihielo: neutro. |
| `chinook_faa` / `chinook_ej` | CH-47C Chinook | **1.5** ⚠ | — | 0.8 | 1.3 | **1.4** | Rotor sin deshielo; en las islas a la intemperie; el viento de 50 km/h lo sacude. |
| `pampa` | IA-63 Pampa (no estuvo) | 1 ⚠ | 0.5 ⚠ | 1 | 0.8 ⚠ | 1.2 | Verosímil por tipo: entrenador moderno liviano, pod DEFA 30 mm. |

**Lo más firme de toda la tabla** (con fuente): la sal del A-4 y del vuelo rasante en general, la pista de Río
Grande (A-4Q), las pistas anegadas del Pucará, el antihielo completo del C-130, el cargador neumático del Colt Mk 12,
y que el mal tiempo hizo abortar o costó misiones a todos. Lo demás es **diseño apoyado en el tipo de avión**.

---

## El teatro (lo que vale para todos)

- **Mar a 1–2 °C, olas de 4–5 m, viento de más de 50 km/h** en mayo–junio, según el resumen histórico del
  Escuadrón Fénix (ATTA). Amarizar era morir. → confirma `olas` y `viento` de `islas_clima.js`.
- **Nubosidad que tapaba el mar y las islas** casi siempre: por eso los Learjet guiaban a los Dagger, que podían
  pasar al norte o al sur de las islas sin verlas (mismo documento).
- **El mal tiempo frenó misiones**: el 2 de mayo casi nada salió del continente; el 9 de mayo la mayoría de los
  Skyhawk abortó y dos A-4C del Grupo 4 (Casco y Farías) se estrellaron contra las Sebaldes volando al ras del mar
  con meteorología adversa; el 26 de mayo se abortó el primer bombardeo nocturno.
- **Sal en el parabrisas**: no es sólo del A-4. El Fokker F-28 de la Armada que volaba a 15 m de las olas hacia
  Puerto Argentino también llegaba con «la sal del mar tiñe de blanco el parabrisas» (La Nación). Es un efecto del
  **vuelo rasante sobre mar grueso**, no de un modelo: por eso `salK` se mantiene en 1 para casi todos los que lo
  hacían, y baja sólo donde hay limpiaparabrisas/calefacción (C-130) o donde el avión casi no volaba sobre el mar.

Fuentes: [Resumen historia Escuadrón Fénix (ATTA, PDF)](https://asociacionatta.com.ar/Documentos/RESUMEN-%20HISTORIA-ESCUADRON-FENIX-FAA.pdf) ·
[skyhawk.org — Argentine Skyhawks in Malvinas](https://skyhawk.org/node/55) ·
[Argentina.gob.ar — Grupo 4, 9 de mayo](https://www.argentina.gob.ar/node/417497) ·
[Argentina.gob.ar — misiones nocturnas abortadas](https://www.argentina.gob.ar/node/504043) ·
[La Nación — el F-28 de la Aviación Naval](https://www.lanacion.com.ar/lifestyle/la-posibilidad-de-sobrevivir-era-minima-el-jet-comercial-de-la-aviacion-naval-que-evadio-tres-nid26052025/)

---

## 1 · A-4B Skyhawk — `sky` (la vara)

1. **Antihielo:** sólo Pitot, parabrisas y partes del motor; **nada en alas ni cola**. (Ya en el juego.)
2. **Cañón:** dos **Colt Mk 12 de 20 mm**. La versión Mod 0 usa un **alimentador neumático con botella de nitrógeno
   a alta presión** (la Mod 3 lo cambió por uno a retroceso). Un gas en botella pierde presión con el frío (ley de
   gases), lo que sostiene la mecánica de `CANON_T`. El catálogo ya dice que «se trababan» (AVIONES_CATALOGO §1).
   ⚠ No está verificado qué Mod llevaban los A-4B argentinos.
3. **Clima documentado:** costra de sal en el canopy al volver de los rasantes, que hacía difíciles los aterrizajes
   («salt spray to form a crust on the canopies», skyhawk.org, sobre el 12 de mayo); abortos por meteorología
   (2 y 9 de mayo).
4. **Mecánica:** todo en 1. Es la referencia.

Fuentes: [Colt Mk 12 cannon (Wikipedia)](https://en.wikipedia.org/wiki/Colt_Mk_12_cannon) ·
[FAS — Mk 12](https://man.fas.org/dod-101/sys/ac/equip/mk12.htm) · [skyhawk.org](https://skyhawk.org/node/55)

## 2 · A-4Q Skyhawk (Armada) — `a4q`

1. **Antihielo:** el mismo A-4 (variante naval del A-4B). Sin diferencia conocida.
2. **Cañón:** Colt Mk 12 de 20 mm, igual.
3. **Clima documentado:** **Río Grande**: la propia Armada habla de un período de adaptación «en consideración a las
   adversas condiciones meteorológicas del área» (eso es de los Super Étendard, misma base). El **23 de mayo** el
   capitán de corbeta **Zubizarreta** volvió con las bombas colgadas y, según la página oficial, «la pista y las
   condiciones meteorológicas muy adversas» le complicaron el aterrizaje; se eyectó cuando el avión se salía de la
   pista y murió. Otras fuentes hablan de lluvia, viento cruzado y pista resbaladiza.
4. **Mecánica:** igual que el A-4B, con `arranqueFrioK 1.1` — el castigo de Río Grande es más de **pista y viento
   cruzado al volver** que de arranque. Si algún día hay aterrizaje, ahí va el peso (⚠ propuesta, ver dudas).

Fuentes: [Argentina.gob.ar — caídos Aviación Naval](https://www.argentina.gob.ar/node/375838) ·
[ASN 176521](https://cdn.aviation-safety.net/wikibase/176521) ·
[Argentina.gob.ar — Super Étendard en Río Grande](https://argentina.gob.ar/armada/aviacion-naval/unidades/super-etendard)

## 3 · IAI Dagger — `dagger`

1. **Antihielo:** ⚠ sin fuente. Es un derivado del Mirage 5 (ala delta, Atar 9C): por lo que se sabe del tipo, no
   tenía deshielo en el borde de ataque. Neutro **1**.
2. **Cañón:** dos **DEFA 552 de 30 mm**: revólver de cinco recámaras, **a gas y de disparo eléctrico**. A diferencia
   del Colt Mk 12 Mod 0, **no se encontró ninguna botella neumática** en su ciclo. Ninguna fuente habla de fallas
   por frío del DEFA en Malvinas. → `canonFrioK 0.5` ⚠ (el frío algo le hace a cualquier arma — lubricante,
   munición — pero mucho menos que a un alimentador de nitrógeno). Si el autor prefiere no inventar: 0.
3. **Clima documentado:** sin sonda de reabastecimiento, salía cargado de tanques; instrumental de navegación
   escaso con nubosidad permanente: necesitaba que un Learjet lo guiara al punto inicial (Fénix). Nada específico
   de frío.
4. **Mecánica:** hielo y sal 1; `turbulenciaK 0.9` ⚠ (el ala delta tiene menos pendiente de sustentación y responde
   menos a la ráfaga a alta velocidad — física general, no fuente de la guerra).

Fuentes: [DEFA cannon (Wikipedia)](https://en.wikipedia.org/wiki/DEFA_cannon) ·
[SAAF — DEFA 552](https://mail.saairforce.co.za/the-airforce/weapons/38/defa-552-30mm-cannon) ·
[Resumen Escuadrón Fénix](https://asociacionatta.com.ar/Documentos/RESUMEN-%20HISTORIA-ESCUADRON-FENIX-FAA.pdf)

## 4 · Super Étendard — `supere`

1. **Antihielo:** ⚠ sin fuente específica. Avión naval moderno (1978) con radar Agave; no se encontró el detalle del
   sistema. Neutro **1**.
2. **Cañón:** dos **DEFA 552 de 30 mm** → igual que el Dagger, `0.5` ⚠.
3. **Clima documentado:** la Armada describe el traslado a Río Grande con **adaptación por el clima adverso**; el
   30 de mayo «lluvia, viento y grandes olas» dificultaban el vuelo rasante, y el **estado del mar y el viento casi
   constante obligaron a trabajar distinto con el radar** (el clutter de olas). Sobre operar desde Puerto Argentino:
   la pista era corta y angosta y **con pista húmeda no daban los valores de frenado**.
4. **Mecánica:** `arranqueFrioK 0.7` ⚠ coherente con `fallasK 0.5` (avión nuevo, ninguno perdido, técnicos
   propios). Lo propio del Super Étendard no es el frío sino **el mar grueso que ensucia el radar**: si se quiere algo
   distintivo, que las `olas` altas le recorten el alcance del radar propio (idea, no multiplicador).

Fuentes: [Argentina.gob.ar — Super Étendard](https://argentina.gob.ar/armada/aviacion-naval/unidades/super-etendard) ·
[Defensa.com — «Malvinas, así combatimos»](https://www.defensa.com/ayer-noticia/malvinas-asi-combatimos) ·
[Revista Marina (Chile), 1990](https://revistamarina.cl/revistas/1990/4/jpmartinezdf.pdf)

## 5 · Mirage 5P «Mara» — `mirage` (y el Mirage IIIEA)

1. **Antihielo:** como el Dagger: ⚠ neutro 1.
2. **Cañón:** DEFA 552 de 30 mm → `0.5` ⚠.
3. **Clima documentado:** **no combatió** (llegó a Tandil el 5 de junio): no hay nada que documentar.
   **Mirage IIIEA (Grupo 8):** volaba escolta y cobertura **alto** (sin reabastecimiento, poco tiempo sobre las
   islas). No aparece ningún problema de frío propio en lo que se encontró; no aporta un multiplicador distinto. Si
   alguna vez entra al juego, va con los mismos valores del Dagger.
4. **Mecánica:** igual que el Dagger. ⚠ Tentación a evitar: subirle `arranqueFrioK` «porque eran peruanos y
   recién llegados» — no hay fuente.

## 6 · C-130H / KC-130H Hércules — `herc`

1. **Antihielo:** **el más protegido del roster.** El aire de sangrado de los motores calienta **los bordes de ataque
   de ala y empenaje, el radomo y las tomas de los motores**; **eléctrico** en hélices (con ciclo de deshielo),
   parabrisas y Pitot (manual C-130E/H y tarjetas de límites). → `hieloK 0.2` (no 0: el hielo en zonas no protegidas
   y la sobrecarga existen).
2. **Cañón:** el C-130 no tenía cañón. El juego le da `canon` propio al TC-68 bombardero (decisión de diseño) →
   `canonFrioK 1` ⚠ neutro.
3. **Clima documentado:** el TC-68 entró a Puerto Argentino el 6 de mayo **a 12–15 m sobre el mar** para esquivar
   radares (La Nación). Los vuelos nocturnos rasantes del puente aéreo son la imagen de la guerra. No se encontró
   una mención explícita de sal en el parabrisas del C-130 ⚠.
4. **Mecánica:** `salK 0.6` ⚠ (tenía limpiaparabrisas y parabrisas calefaccionado: limpia algo, no todo);
   `arranqueFrioK 0.8` ⚠ (turbohélice Allison T56 de diseño para todo clima; operaba desde bases grandes);
   `turbulenciaK 0.5` (70 t: la ráfaga lo mueve poco en g, aunque le cuesta corregir — ya rola lentísimo).

Fuentes: [C-130 E/H Handbook (Scribd)](https://www.scribd.com/document/533604330/C-130-E-H-Handbook) ·
[C-130H ops limits (baseops)](https://www.baseops.net/wp-content/uploads/2015/08/c130h1_Ops_Limits-1.pdf) ·
[La Nación — el TC-68](https://www.lanacion.com.ar/politica/el-primer-avion-que-aterrizo-en-las-islas-cerca-del-desguace-nid1885467/)

## 7 · IA-58 Pucará — `pucara` (basado en las islas)

1. **Antihielo:** ⚠ **no se encontró nada** (ni alas, ni tomas, ni hélices). Neutro **1**.
2. **Armas:** dos **Hispano-Suiza HS.804 de 20 mm** y cuatro **FN Browning de 7,62 mm**. No hay fuente de fallas por
   frío. `canonFrioK 0.8` ⚠ (a gas, sin neumático conocido; las ametralladoras con lubricante a la intemperie —
   diseño, no historia). Neutro razonable si el autor prefiere: 1.
3. **Clima documentado:** el diseño era para **pistas cortas y rústicas** (gomas de baja presión). En las islas operó
   desde Puerto Argentino y **dos pistas de pasto improvisadas: Pradera del Ganso (BAM Cóndor) e Isla Borbón
   (Calderón)**. En Borbón **la pista se anegó por lluvia intensa** a los pocos días (Think Defence) — ahí los
   destruyó el SAS el 15 de mayo. En Pradera del Ganso el recorrido de despegue se acortó a mediados de mayo por
   una depresión del terreno (MDZ). Uno se estrelló contra Blue Mountain volviendo a Puerto Argentino ⚠ (la causa
   meteorológica no está confirmada). El catálogo del juego ya dice «accidentados en pistas de pasto y barro».
4. **Mecánica:** `arranqueFrioK 1.5` — el avión que **vivía afuera** (sin hangar, lluvia, barro, frío): el que más
   sale con fallas de tierra. `turbulenciaK 1.3` (≈6,8 t, ala de baja carga, lento). `salK 0.5`: casi no hacía
   rasante sobre el mar.

Fuentes: [FMA IA 58 Pucará (Wikipedia)](https://en.wikipedia.org/wiki/FMA_IA_58_Pucar%C3%A1) ·
[Think Defence — Pebble Island](https://www.thinkdefence.co.uk/docs/the-sas-raid-on-pebble-island/) ·
[MDZ — Pradera del Ganso](https://www.mdzol.com/sociedad/2024/2/18/malvinas-vivir-para-contarla-42-anos-despues-406567.html) ·
[Argentina.gob.ar — Pucará con mal tiempo](https://www.argentina.gob.ar/node/502953)

## 8 · Aermacchi MB-339A — `mb339` (basado en Puerto Argentino)

1. **Antihielo:** ⚠ sin fuente. Neutro **1**.
2. **Cañón:** el juego le da 30 mm (pods DEFA 553). ⚠ El DEFA 553 tiene **amartillado pirotécnico y disparo
   eléctrico** (según las descripciones encontradas): nada neumático → `0.5` ⚠.
3. **Clima documentado:** a la intemperie en Puerto Argentino, pista corta (la misma que se describe como húmeda y al
   límite para el Super Étendard). El **3 de mayo** el teniente de fragata **Carlos Benítez** murió al accidentarse
   en la aproximación a Puerto Argentino al volver de un reconocimiento — **⚠ no se encontró la causa**; no afirmar
   que fue el tiempo. (Ojo: en algunas páginas aparece un «Benítez» derribado por un Stinger el 21 de mayo: es el
   piloto de Pucará Jorge Benítez, otra persona.)
4. **Mecánica:** `arranqueFrioK 1.4` (intemperie, como el Pucará, apenas menos por pista asfaltada);
   `turbulenciaK 1.3` (jet entrenador de ~4,4 t). `salK 1`: hizo rasante sobre San Carlos (Crippa, 21 de mayo).

Fuentes: [Argentina.gob.ar — caídos Aviación Naval](https://www.argentina.gob.ar/node/375838) ·
[ASN 144113](https://cdn.aviation-safety.net/wikibase/144113) ·
[MalpensaNews — MB-339 en Malvinas](https://www.malpensanews.it/2023/05/aermacchi-mb-339-falkland-malvinas/886694/?output=pdf) ·
[SAAF — DEFA 553](https://mail.saairforce.co.za/the-airforce/weapons/39/defa-553-30mm-cannon)

## 9 · Lockheed SP-2H Neptune — `neptune`

1. **Antihielo:** ⚠ patrullero marítimo diseñado para el Atlántico Norte: se lo asume con **deshielo de bordes de
   ataque y hélices**, pero no se verificó el sistema del SP-2H argentino. `0.4` ⚠.
2. **Armas:** sin cañón en el juego.
3. **Clima documentado:** el planes.js ya lo dice: **gastados y sin repuestos**, se retiraron a mediados de mayo
   (fallaba el radar). Motores **radiales Wright R-3350** + dos jets auxiliares: los radiales grandes son difíciles
   de arrancar en frío (aceite espeso) — física del tipo, ⚠ sin testimonio de Malvinas.
4. **Mecánica:** `arranqueFrioK 1.3` (viejo + radial); `turbulenciaK 0.6` (pesado); `salK 0.7` ⚠ (patrulla baja
   sobre el mar, con limpiaparabrisas).

## 10 · Escuadrón Fénix — `learjet`, `citation`, `merlin`, `mu2`, `aerostar`, `commander`, `guarani`

**Común a todos.** Civiles requisados (y los Learjet 35A de la FAA): **sin armas y sin asiento eyectable**. Hacían
diversión simulando escuadrillas, guiado de Dagger y Pucará, retransmisión a **12.000 m** (Learjet 36 y HS-125) y
búsqueda; el escape era **picada al mar y rasante** hasta el continente (documento ATTA). El guiado de los Pucará a
las islas lo hizo el **MU-2 LV-ODZ** desde Santa Cruz. **No se encontró ninguna mención de engelamiento** de estos
aviones en la guerra: todos los valores de `hieloK` salen **del tipo de avión** (los ejecutivos suelen tener deshielo
porque vuelan IFR todo el año) y van con ⚠.

| key | Antihielo por tipo (⚠ no verificado en el ejemplar argentino) | hieloK | turbulenciaK |
|---|---|---|---|
| `learjet` | bordes de ala calefaccionados con aire de sangrado, parabrisas y góndolas (⚠ la certificación para hielo conocido del 35A no se confirmó; el manual del Learjet 20 dice que *no* estaba certificado) | 0.3 | 0.8 (ala chica y muy cargada) |
| `citation` | botas neumáticas en ala y cola, tomas calefaccionadas | 0.4 | 0.9 |
| `merlin` | botas, hélices eléctricas | 0.4 | 1 |
| `mu2` | botas; el tipo tiene historial de accidentes con hielo | 0.6 | 0.9 (ala de alta carga) |
| `aerostar` | deshielo **opcional** según el avión | 0.7 | 1.1 (el más chico) |
| `commander` | botas (opcional en algunos) | 0.5 | 1 |
| `guarani` | sin dato | 1 | 0.9 |

`salK 1` para todos (el escape rasante está documentado); `arranqueFrioK 1` (civiles con mantenimiento propio en
bases del continente; el Learjet 0.8 ⚠ por ser de dotación FAA).

Fuentes: [Resumen historia Escuadrón Fénix (ATTA)](https://asociacionatta.com.ar/Documentos/RESUMEN-%20HISTORIA-ESCUADRON-FENIX-FAA.pdf) ·
[Escuadrón Fénix (Wikipedia)](https://en.wikipedia.org/wiki/Escuadr%C3%B3n_F%C3%A9nix) ·
[Manual Learjet 20 (antihielo)](https://manualshive.com/en/manual/learjet/20-series/1865592?page=194) ·
[NASA — A Pilot's Guide to Inflight Icing](https://aircrafticing.grc.nasa.gov/1_1_3_5.html) (equipo antihielo ≠ certificado para hielo)

## 11 · Boeing CH-47C Chinook — `chinook_faa`, `chinook_ej`

1. **Antihielo:** los sistemas del CH-47 son **antihielo de tomas de motor, parabrisas y Pitot**; el manual del
   CH-47 advierte que el vuelo prolongado en hielo leve produce **vibraciones por desprendimiento asimétrico del hielo
   de las palas**, y que el hielo de motor puede formarse **aun arriba de 0 °C**. La RAF describe a sus Chinook Mk1/Mk2
   con **capacidad limitada** en nieve y hielo. ⚠ No se confirmó el equipo del modelo C argentino; no hay rotor con
   deshielo en lo encontrado. → `hieloK 1.5` ⚠.
2. **Armas:** sin cañón en el juego.
3. **Clima documentado:** el Ejército llevó **AE-520 y AE-521**; el AE-521 fue destruido en tierra cerca del Monte Kent
   por Harriers el 21 de mayo. La aviación de Ejército hizo cientos de vuelos «en condiciones duras» (secundario).
   Nada específico de frío encontrado.
4. **Mecánica:** `turbulenciaK 1.4` (helicóptero con 50 km/h de viento: lo que más lo sacude); `arranqueFrioK 1.3`
   (a la intemperie en las islas, turbinas y rotor con hielo en tierra ⚠); `salK 0.8`.

Fuentes: [helis.com — Chinook Ejército](https://www.helis.com/database/modelorg/Argentinian-Army-Chinook/) ·
[TM 1-1520-240-10 (CH-47)](https://ch-47helicopters.tpub.com/TM-1-1520-240-10/css/TM-1-1520-240-10_598.htm) ·
[CAA/DERA — Chinook Mk2 en hielo](https://caa.co.uk/Documents/Download/10717/45efcfb9-b756-432e-b542-337c52ef0f2d/139)

## 12 · FMA IA-63 Pampa — `pampa` (no estuvo)

Voló por primera vez en 1984. **Propuesta verosímil por tipo**, todo ⚠: entrenador a reacción liviano (TFE731),
pod ventral **DEFA 553 de 30 mm** (el juego ya le da 30 mm) → `canonFrioK 0.5`; sin antihielo de ala conocido →
`hieloK 1`; motor de los 80, más fácil de arrancar → `arranqueFrioK 0.8`; liviano → `turbulenciaK 1.2`; `salK 1`.

---

## Cómo se traduciría al código (sugerencia, sin tocar nada)

- Un campo `clima: { hieloK, canonFrioK, salK, arranqueFrioK, turbulenciaK }` en `PERFILES` (`src/data/perfiles.js`),
  con `BASE.clima` todo en 1 — sigue el patrón de `fallasK`.
- `hieloK` multiplica `HIELO.JUNTA`/`JUNTA_NUBE`; `canonFrioK` multiplica cuánto se alarga la recarga bajo `CANON_T`
  (0 = el frío no le hace nada); `turbulenciaK` multiplica `rafagas` al sacudir; `arranqueFrioK` multiplica la
  probabilidad de fallas de tierra cuando la base está bajo 0 °C (encima de `fallasK`, no en su lugar).
- La ficha del selector (`capacidadesDe`) podría mostrar una pieza «ANTIHIELO» (sí/no) — sólo para los que tienen
  fuente: C-130 (sí), A-4 (no).

---

## Dudas no resueltas

1. ⚠ **Qué Mod del Colt Mk 12 llevaban los A-4B/A-4Q argentinos** (Mod 0 neumático con nitrógeno vs Mod 3 a
   retroceso). La mecánica del cañón que se enfría depende de que sea el Mod 0.
2. ⚠ **DEFA 552 con frío**: no se encontró ni un testimonio de fallas en Malvinas ni el método de amartillado del 552
   (el 553 es pirotécnico). `canonFrioK 0.5` es diseño.
3. ⚠ **Antihielo del Dagger / Mirage 5 / Super Étendard / MB-339A / Pucará / Guaraní**: no se encontró el detalle
   técnico. Haría falta el manual de vuelo de cada uno.
4. ⚠ **Causa del accidente del MB-339 de Benítez (3 de mayo)**: las fuentes dicen «previo al aterrizaje», ninguna
   dice tiempo. No usarlo como ejemplo de clima hasta tenerlo.
5. ⚠ **El Pucará de Blue Mountain**: ¿fue meteorología? Sin confirmar.
6. ⚠ **¿Los Pucará quedaron en tierra por el barro en Borbón o Pradera del Ganso?** Hay fuente de pista anegada en
   Borbón, no de que no pudieran despegar.
7. ⚠ **Sal en el C-130**: volaba a 12–15 m del agua; no se encontró la mención explícita de la costra.
8. ⚠ **Learjet 35A**: ¿certificado para hielo conocido? (el antihielo existe; la certificación no se confirmó).
9. ⚠ **Neptune**: sistema de deshielo del SP-2H argentino y si el frío influyó en su retiro (la fuente dice desgaste
   y repuestos, no clima).
10. ⚠ **CH-47C argentino**: equipo antihielo exacto y límites de hielo del modelo C.
11. ⚠ **Fallas de arranque e hidráulicas en Río Gallegos / San Julián / Río Grande**: el brief las da por hechas para
    el A-4B, pero en esta búsqueda **no apareció una fuente directa**; sólo pista mojada + viento en Río Grande
    (Zubizarreta) y la «adaptación al clima» de los Super Étendard. Conviene que vaya a
    `docs/historia/PREGUNTAS_HISTORICAS.md`.
12. Fuente pendiente de leer entera: *La Fuerza Aérea en Malvinas*, Tomo II
    ([ATTA, PDF](https://asociacionatta.com.ar/Libros/La-Fuerza-Aerea-en-Malvinas-Tomo-II.pdf)) y *Helicópteros de
    Malvinas* ([ATTA, PDF](https://asociacionatta.com.ar/Libros/HELICOPTEROS-DE-MALVINAS.pdf), >10 MB, no se pudo
    bajar con la herramienta) — probablemente resuelven varias de estas.
