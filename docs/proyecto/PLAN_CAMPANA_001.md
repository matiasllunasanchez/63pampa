# PLAN — Campaña 1 v0.0.2: las 14 misiones de GUION_3 en el juego

> Objetivo: volcar las **14 misiones de historia/GUION_3.md (3.0/3.1)** en
> `data/missions.js` con lo que el juego YA tiene, como base jugable de **EL CUADERNO DE
> MATEO**. **Los IDs de misión y de pantalla quedan estables desde esta versión** —
> la v0.0.1 (12 misiones de GUION_2) quedó obsoleta ANTES de fijar IDs en código: no hay
> nada que migrar.
>
> Marcas: 🟥 nuevo respecto de v0.0.1 · 🟨 cambió · sin marca = igual.

## 1. Mapa guion → misión jugable

Regla acordada (sin cambios): misión CON boss de buque → goal `ship` (clímax
ARENA/MOMENTUM). Misión SIN buque o con boss de terreno (que no existe) → goal `distance`.

| id | Título | Fecha | Objetivo | Clase | Notas |
|---|---|---|---|---|---|
| m1 | SAL EN LAS ALAS | fines de abril | distancia 2200 | — | 🟨 **TUTORIAL PURO: cero fuego enemigo.** Esquivar y tirar a tambores destructibles. |
| m2 | BAUTISMO DE FUEGO | 1 de mayo | distancia 2600 | — | boss radar (terreno) no existe → distancia |
| 🟥 m3 | EL INVENTO | primeros de mayo | distancia 2400 | — | NUEVA. Patrulla suave; acá se enseña la mecánica de mejoras. Sin boss. |
| m4 | EL DIA QUE SANGRO EL MAR | 4 de mayo | HMS SHEFFIELD | t42 | ex M3 |
| m5 | EL CALLEJON DE LAS BOMBAS | 21 de mayo | HMS ARDENT | t21 | ex M4; sube bombs/obstacles |
| m6 | LA BOMBA QUE NO DESPERTO | 23 de mayo | HMS ANTELOPE | t21 | ex M5; 🟨 epílogo: **la Chancha se rompe** (texto) |
| m7 | 25 DE MAYO | 25 de mayo | HMS COVENTRY | t42 | ex M6; muere el VASCO (epílogo) + el locker |
| m8 | EL BATIR DE ALAS | 25 de mayo · 2ª salida | ATLANTIC CONVEYOR | log | ex M7; el sobrevuelo + 🟥 el terito (texto/cuadros) |
| m9 | EL PIBE | 27 de mayo | distancia 3200 | — | ex M8; centro logístico → distancia; muere el PICHON |
| 🟥 m10 | LOS PRIMOS | 5 de junio | distancia 3400 | — | 🟨 **REESCRITA 3.5.** Reconocimiento armado sin blancos: **el nivel es el clima.** La más larga y la más ciega — frente cerrado, la señal de Cóndor cae, y la nafta importa de verdad (la Chancha está rota desde m6). Primera con 3. La llegada de los Mirage a **Tandil** va como **corte intercalado** (no es escolta: era históricamente imposible). |
| m11 | LO QUE NO SE DICE | 8 de junio | RFA SIR GALAHAD | log | ex M9; el respiro: vuelven todos |
| m12 | EL ANGEL CORRENTINO | 8 de junio · 2ª salida | RFA SIR TRISTRAM | log | ex M10; muere CORREA (corte a tierra) + 🟥 el tallado |
| m13 | LA ULTIMA MESA | 11 de junio | HMS BROADSWORD | t21 | ex M11; el asado + 🟥 LA CARTA (Esteban escribe, no se lee) |
| m14 | EL TERO | 12 de junio · madrugada | HMS GLAMORGAN | t42 | ex M12; nocturna, la imposible. 🟨 Ver §4b: contrarreloj y dos finales. |

Buques nuevos (solo datos, reusan layouts por clase — sin cambios): SIR TRISTRAM → `log`,
BROADSWORD → `t21`, GLAMORGAN → `t42`.

## 2. Variabilidad por misión 🟨 *(remapeada a 14; mismas perillas, nada nuevo)*

| id | sky | wind | obstacles | bombs | rain | fog | terrain | squad |
|---|---|---|---|---|---|---|---|---|
| m1 | dawn | no | 0.5 | **0** | 0 | 0 | mar | 5 |
| m2 | dusk | sí | 1 | 0.5 | 0 | 0 | mar | 5 |
| 🟥 m3 | sun | no | 0.7 | 0 | 0 | 0 | mar | 5 |
| m4 | dusk | sí | 1 | 0.5 | 0 | 0 | mar | 5 |
| m5 | cloudy | sí | 1.7 | 1 | 0 | 0 | mar | 5 |
| m6 | sun | sí | 1.7 | 1 | 0 | 1 corto | mar | 5 |
| m7 | clear | sí | 1.7 | 1 | 0 | 0 | mar | 5 |
| m8 | dusk | sí | 1.7 | 1 | 1 | 0 | mar | 4 |
| m9 | storm | sí | 1.7 | 2 | 2 | 1 | mar | 4 |
| 🟥 m10 | storm | sí | 1 | 0 | 2 | 2 largo | mar | 3 |
| m11 | cloudy | sí | 1.7 | 1 | 0 | 0 | mar | 3 |
| m12 | dusk | sí | 1.7 | 2 | 1 | 0 | mar | 3 |
| m13 | moon | sí | 1.7 | 2 | 0 | 1 | tierra | 3 |
| m14 | night | sí | 1.7 | 2 | 0 | 1 largo | mar | 3 |

🟨 **Roster** (los Fieles vivos según GUION_3): **m1–m7 los cinco** (el Vasco muere en el
EPILOGO de m7, vuela la m7 entera) · **m8–m9 sin Vasco** (4) · **m10+ sin Pichón** (3) ·
m14 arranca con 3 — Gitano y Puma mueren DURANTE la misión (v0.0.2: narrado en pantallas,
scripted en vuelo PENDIENTE). `missions.js` lleva `roster` y `cfg.squad = roster.length`.

## 3. Mejoras del Pichón 🟨 *(roguelike real — el guion 3.0 ya NO fija el orden)*

Entre misión y misión (campaña solamente): **EL BANCO DEL PICHON** (m3–m9, con el ritual
"eso no se puede / a ver, mostrame") / **LA LIBRETA DEL PICHON** (m10+, con "…A ver, pibe.
Mostrame."). El jugador elige UNA entre DOS.

- 🟨 **Las dos ofertas salen AL AZAR del pool disponible** — pedido explícito del guion
  3.0: "resultado diferente cada vez". Muere el orden causal fijo de la v0.0.1 (§2c viejo).
- 🟨 **Ventana de ofertas: después de m2 y hasta después de m12** (11 ofertas). La primera
  aparece antes de m3 — la misión que enseña la mecánica. **Antes de m14 NO hay banco:
  la libreta se terminó** (canon: "lo que llevás al final es todo lo que un pibe de 22
  alcanzó a imaginar").
- Pool (data/upgrades.js, sin cambios): TERRAIN MASKING, SPLIT-S, BREAK TURN, LOW YO-YO,
  S-TURN, POP-UP, HIGH YO-YO, JINK, TIRABUZON, ASCENSO, SOBRE EL RADAR, TONEL BARRIL. El
  TONEL clásico viene puesto siempre.
- 🟨 Matiz de sabor sin costo: ASCENSO, SOBRE EL RADAR y TONEL BARRIL solo entran al pool
  **desde m10** (salen de la libreta póstuma). El resto disponible desde el arranque.
- En campaña los combos NO aprendidos no disparan (gate en el dispatcher). Ciclo/Patria/
  Arena no cambian. El save guarda `ups`. Mach extra y munición: PENDIENTES (igual que
  v0.0.1).

## 4. Guion en pantallas (strings.js)

Por misión: `story` (contexto + diálogos de briefing + tarjeta) y `epi` (epílogo de aire +
página del cuaderno + placa histórica). 🟨 Cambios de la 3.0:

- 🟨 **(3.2) El juego abre DIRECTO en P.1** (el arroyo): P.1–P.4 → briefing m1. **No hay
  P.0 al inicio** — la escena de la puerta de Norma pertenece a la cadena de pantallas del
  Final A (la revelación del marco). El jugador no debe ver ningún indicio de Norma como
  lectora antes del cierre.
- ✅ **(9/8) Hecho, y con destino para lo que sacamos:** las cuatro pantallas históricas de
  apertura (1833 → 1982, la Junta, Operación Rosario) salieron de `storyM1` y quedaron
  reservadas como `storyC2Intro`, apuntadas desde `campaigns.js` por la campaña 2 (EL
  FANTASMA DEL MAR) — es la campaña de la flota la que sí necesita ese contexto. La 1
  abre en el arroyo.
- 🟨 **Ya no existen los fragmentos de carta del padre entre misiones.** `style: 'carta'`
  se usa UNA sola vez en toda la campaña: la carta a Norma, y solo en el epílogo del
  Final A. Las páginas de Mateo siguen con `style: 'tierra'`.
- 🟥 **El ritual de Cóndor** abre cada `story` (misma fórmula, una línea) — y en m14 se
  corta en la mitad (ver GUION_3 M14).
- Diálogo como líneas `PERSONAJE: texto` dentro de `paras` (v0.0.2; los IDs de
  SISTEMA_DIALOGO.md quedan para la pasada del sistema de diálogo real).
- `img: 'P0_1'` etc. (cuadros del storyboard, sección ACTUALIZACIÓN 3.0): si existe
  `assets/story/<img>.png` se dibuja, si no, tarjeta negra. Igual que v0.0.1.
- 🟥 **Retratos VN (RETRATOS.md):** las pantallas de diálogo llevan además `cara:
  'gitano_serio'` por línea (busto en `assets/portraits/`) y usan `img:` como PLACA de
  ambiente. Si el retrato no existe, cae al nombre solo — **cero bloqueo: funciona sin
  assets desde hoy.** Los cuadros sagrados siguen siendo `img:` a pantalla completa sin
  retrato.
- Traducción EN: pendiente — `initStory` cae a `STRINGS.es`.

### 4b. 🟥 El final de m14 — qué entra en v0.0.2 y qué no

GUION_3 pide: contrarreloj + muertes scripted en vuelo + decisión SIN menú + dos finales.
Eso es trabajo de sistemas. **v0.0.2 hace la versión de pantallas:**

- La misión se juega como `ship` normal (GLAMORGAN). El contrarreloj, el aviso del Turco,
  las muertes de Gitano y Puma y el cruce de trayectorias van **narrados en pantallas**
  (story intercalado/epílogo), no jugables. PENDIENTE: timer real + eventos scripted.
- 🟥 **Post-créditos (3.6):** después de los créditos, una cadena corta de pantallas — el
  museo, el pibe de la 10, la seño Claribel, **"¿Y ganaron?" / "No."**, la frase, y la mano
  en el vidrio. **La música se corta en el "No." y vuelve recién sobre la frase** (ver
  SOUNDTRACK 25): ese silencio es la mitad del efecto, no es un detalle de audio.
- 🟥 **M14 y la dificultad (3.4):** es la única misión donde la dificultad SÍ puede frenar
  la historia. Morir y reintentar en el clímax es diseño, no falla — la asistencia
  progresiva suaviza, no regala. Ver GUION_3 nota 9.
- 🟥 **La decisión SÍ entra, mínima:** tras el epílogo del clímax, una pantalla negra con
  dos entradas (izquierda = virar a casa / derecha = virar a la oleada; sin texto de menú,
  solo los dos rumbos en el HUD dibujado del cuadro). Según la tecla: cadena de pantallas
  del **Final A** (vorágine narrada + LA CARTA con `style: 'carta'` + mesa de Norma) o del
  **Final B** (el planeo del sapito + el mate con el Turco). Cierra en victoria en ambos.
- PENDIENTE (post-v0.0.2): la vorágine jugable (oleada infinita + munición libre), el
  planeo jugable con nafta en rojo, y el logro/flag de Final B como "final oculto".

## 🟥 7. El Mirage 5P «Mara» — desbloqueo fuera de campaña

Decisión 3.5: los Mirage peruanos **nunca combatieron** (verificado). La campaña no los
toca — los Fieles terminan la guerra en A-4B, como fue. Pero el juego sí premia al jugador:

- Tras el epílogo de m10, una pantalla **SISTEMA** (registro propio, no narrativo):
  *"MIRAGE 5P «MARA» — DESBLOQUEADO. Diez llegaron del Perú el 5 de junio de 1982. Nunca
  llegaron a combatir. **Acá, sí.**"*
- Setea un flag persistido (`unlocks.mara`) — al lado de `ups` en el save.
- Habilita el Mara como avión **seleccionable en CICLO, ARENA y MINUTOS SAGRADOS**.
  **NO en campaña** (bloqueado por modo, no por flag).
- PENDIENTE post-v0.0.2 y no bloqueante: el Mara es un segundo avión jugable de verdad
  (sprite, perfil de vuelo distinto — rápido y alto, el opuesto del rasante; por eso vive
  en los modos sin historia). Hasta que exista, el desbloqueo puede quedar anunciado y el
  selector mostrarlo en gris con "próximamente" — o directamente no mostrarse: la placa
  narrativa funciona igual.

## 5. Flujo (game.js y amigos) *(sin cambios salvo lo marcado)*

- `randomMission()` (CICLO) y el pool del ARENA eligen SOLO misiones con buque.
- `squad.setRoster(m.roster)` en campaña.
- Estado `upgrade` tras el epílogo de campaña 🟨 (activo tras m2…m12; inactivo tras m13).
- Distancia como objetivo ya existe (`GOALS.distance`).
- 🟥 Estado nuevo mínimo `ending` (la pantalla de dos rumbos) entre el epílogo de m14 y
  las cadenas de Final A/B.

## 6. Pendientes que este plan NO cubre (anotados a propósito)

- Bosses de terreno (radar m2, centro logístico m9) — hoy distancia.
- m14 jugable de verdad: contrarreloj, muertes scripted, vorágine, planeo (hoy: pantallas).
- 🟥 **Combustible como recurso real** (m10 lo estrena, m13 lo convierte en trama). Hoy el
  indicador es decorado.
- 🟥 **La señal de Cóndor que cae** (m10): el jugador ciego por tramos. Sistema nuevo.
- 🟥 Asistencia progresiva (§0 del guion: la dificultad nunca frena la historia).
- 🟥 Sistema de diálogo real (IDs, `hold`, tipeo por letra — SISTEMA_DIALOGO.md).
- Más mejoras (mach, munición), más enemigos, rework de MINUTOS SAGRADOS.
- Voces (el juego sale sin voces por diseño) e imágenes de los cuadros (los `img` ya dejan
  el enchufe). Traducciones EN.
